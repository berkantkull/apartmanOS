import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { getSessionUser, sameOrigin } from "@/app/auth";
import { getDatabase } from "@/db";
import { ensureAnnouncementSchema } from "@/app/api/app/announcements";

const allowed=new Set(["image/jpeg","image/png","image/webp","application/pdf","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]);
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const id=()=>crypto.randomUUID();

async function membership(userId:string,communityId:string){
  return getDatabase().prepare("SELECT role,unit FROM members WHERE user_id=? AND community_id=?").bind(userId,communityId).first<{role:string;unit:string|null}>();
}

function isTargeted(scope:string,value:string|null,unit:string|null){
  if(scope==="all")return true;if(!unit)return false;
  const targets=(value||"").split(",").map(item=>item.trim().toLocaleLowerCase("tr")).filter(Boolean),normalized=unit.toLocaleLowerCase("tr");
  return scope==="block"?targets.some(target=>normalized.startsWith(target)):targets.includes(normalized);
}

export async function POST(request:Request){
  if(!sameOrigin(request))return fail("Geçersiz istek.",403);
  const user=await getSessionUser();if(!user)return fail("Oturum açmanız gerekiyor.",401);
  await ensureAnnouncementSchema();
  const form=await request.formData(),communityId=String(form.get("communityId")||""),file=form.get("file");
  const member=await membership(user.userId,communityId);if(!member||!["owner","manager"].includes(member.role))return fail("Dosya yüklemek için yönetici yetkisi gerekiyor.",403);
  if(!(file instanceof File)||!file.size)return fail("Yüklenecek dosyayı seçin.");
  if(file.size>10*1024*1024)return fail("Dosya boyutu en fazla 10 MB olabilir.",413);
  if(!allowed.has(file.type))return fail("Bu dosya türü desteklenmiyor. JPG, PNG, WebP, PDF, Word, Excel veya metin dosyası kullanın.",415);
  const bucket=env.BUCKET as R2Bucket|undefined;if(!bucket)return fail("Dosya depolama alanı henüz hazır değil.",503);
  const attachmentId=id(),safeName=file.name.replace(/[^a-zA-Z0-9._-]+/g,"-").slice(-100)||"dosya",objectKey=`announcements/${communityId}/${attachmentId}-${safeName}`,createdAt=new Date().toISOString();
  await bucket.put(objectKey,file.stream(),{httpMetadata:{contentType:file.type}});
  try{await getDatabase().prepare("INSERT INTO announcement_attachments (id,community_id,object_key,file_name,content_type,size,uploaded_by,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(attachmentId,communityId,objectKey,file.name.slice(0,200),file.type,file.size,user.userId,createdAt).run()}
  catch(error){await bucket.delete(objectKey);throw error}
  return NextResponse.json({ok:true,attachmentId,fileName:file.name});
}

export async function GET(request:Request){
  const user=await getSessionUser();if(!user)return fail("Oturum açmanız gerekiyor.",401);
  await ensureAnnouncementSchema();
  const attachmentId=new URL(request.url).searchParams.get("id")||"",row=await getDatabase().prepare(`SELECT f.id,f.community_id,f.object_key,f.file_name,f.content_type,f.size,a.target_scope,a.target_value,a.publish_at,a.created_at,a.archived_at
    FROM announcement_attachments f JOIN announcements a ON a.attachment_id=f.id WHERE f.id=?`).bind(attachmentId).first<{id:string;community_id:string;object_key:string;file_name:string;content_type:string;size:number;target_scope:string;target_value:string|null;publish_at:string|null;created_at:string;archived_at:string|null}>();
  if(!row)return fail("Dosya bulunamadı.",404);const member=await membership(user.userId,row.community_id);if(!member)return fail("Bu dosyaya erişiminiz yok.",403);if(!["owner","manager"].includes(member.role)&&(row.archived_at||Date.parse(row.publish_at||row.created_at)>Date.now()||!isTargeted(row.target_scope,row.target_value,member.unit)))return fail("Bu dosyaya erişiminiz yok.",403);
  const bucket=env.BUCKET as R2Bucket|undefined;if(!bucket)return fail("Dosya depolama alanı kullanılamıyor.",503);
  const object=await bucket.get(row.object_key);if(!object)return fail("Dosya bulunamadı.",404);
  const inline=row.content_type.startsWith("image/")||row.content_type==="application/pdf";
  return new Response(object.body,{headers:{"content-type":row.content_type,"content-length":String(row.size),"content-disposition":`${inline?"inline":"attachment"}; filename*=UTF-8''${encodeURIComponent(row.file_name)}`,"cache-control":"private, max-age=300","x-content-type-options":"nosniff"}});
}
