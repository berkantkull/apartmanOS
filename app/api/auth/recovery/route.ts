import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { hashPassword, hashToken, normalizeEmail, sameOrigin, validEmail } from "@/app/auth";
import { getDatabase } from "@/db";

const json=(body:Record<string,unknown>,status=200)=>NextResponse.json(body,{status});
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,"0")).join("");

export async function POST(request:Request){
  if(!sameOrigin(request))return json({error:"Geçersiz istek."},403);
  if(!env.RESEND_API_KEY||!env.MAIL_FROM)return json({error:"Şifre sıfırlama e-posta servisi henüz etkinleştirilmedi."},503);
  const body=await request.json().catch(()=>null) as {email?:unknown}|null,email=normalizeEmail(body?.email);
  if(!validEmail(email))return json({error:"Geçerli bir e-posta adresi girin."},400);
  const db=getDatabase(),user=await db.prepare("SELECT id,display_name FROM app_users WHERE email=?").bind(email).first<{id:string;display_name:string}>();
  if(user){
    const raw=token(),createdAt=new Date().toISOString(),expiresAt=Math.floor(Date.now()/1000)+3600;
    await db.batch([db.prepare("DELETE FROM auth_tokens WHERE user_id=? AND kind='reset'").bind(user.id),db.prepare("INSERT INTO auth_tokens (token_hash,user_id,kind,expires_at,created_at) VALUES (?,?,'reset',?,?)").bind(await hashToken(raw),user.id,expiresAt,createdAt)]);
    const resetUrl=`https://apartmanos.com.tr/sifremi-unuttum?token=${raw}`;
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:`Bearer ${env.RESEND_API_KEY}`,"content-type":"application/json"},body:JSON.stringify({from:env.MAIL_FROM,to:[email],subject:"apartmanOS şifre sıfırlama",text:`Merhaba ${user.display_name},\n\nŞifrenizi yenilemek için aşağıdaki bağlantıyı açın. Bağlantı 1 saat geçerlidir.\n\n${resetUrl}\n\nBu isteği siz yapmadıysanız bu e-postayı dikkate almayın.`})});
    if(!response.ok)return json({error:"E-posta şu anda gönderilemedi. Lütfen biraz sonra tekrar deneyin."},502);
  }
  return json({ok:true,message:"Hesap bulunursa şifre yenileme bağlantısı e-posta adresinize gönderildi."});
}

export async function PUT(request:Request){
  if(!sameOrigin(request))return json({error:"Geçersiz istek."},403);
  const body=await request.json().catch(()=>null) as {token?:unknown;password?:unknown}|null,raw=String(body?.token??""),password=String(body?.password??"");
  if(raw.length<32||password.length<8||password.length>128)return json({error:"Bağlantı veya yeni şifre geçersiz."},400);
  const db=getDatabase(),row=await db.prepare("SELECT user_id,expires_at FROM auth_tokens WHERE token_hash=? AND kind='reset'").bind(await hashToken(raw)).first<{user_id:string;expires_at:number}>();
  if(!row||row.expires_at<Math.floor(Date.now()/1000))return json({error:"Bu şifre yenileme bağlantısının süresi dolmuş."},410);
  const credentials=await hashPassword(password);
  await db.batch([db.prepare("UPDATE app_users SET password_hash=?,password_salt=? WHERE id=?").bind(credentials.hash,credentials.salt,row.user_id),db.prepare("DELETE FROM auth_tokens WHERE user_id=? AND kind='reset'").bind(row.user_id),db.prepare("DELETE FROM sessions WHERE user_id=?").bind(row.user_id)]);
  return json({ok:true,message:"Şifreniz yenilendi. Yeni şifrenizle giriş yapabilirsiniz."});
}
