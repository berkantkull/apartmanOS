import { NextResponse } from "next/server";
import { getSessionUser, normalizeEmail, sameOrigin, validEmail } from "@/app/auth";
import { getDatabase } from "@/db";

type Role = "owner" | "manager" | "resident";
type Membership = { community_id:string; role:Role; name:string; block_count:number; unit_count:number };
type MemberRow = { id:string; user_id:string; display_name:string; email:string; role:Role; unit:string|null; phone:string|null; joined_at:string };
type ResidentRow = { id:string; name:string; unit:string; phone:string|null; occupancy:string; created_at:string };

const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const clean=(value:unknown,max=200)=>String(value??"").trim().slice(0,max);
const number=(value:unknown,min=0,max=1_000_000)=>Math.min(max,Math.max(min,Math.round(Number(value)||0)));
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const inviteCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(7)),n=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n%32]).join("");
const canManage=(role:Role)=>role==="owner"||role==="manager";

async function memberships(userId:string){
  return (await getDatabase().prepare(`SELECT m.community_id, m.role, c.name, c.block_count, c.unit_count
    FROM members m JOIN communities c ON c.id = m.community_id
    WHERE m.user_id = ? ORDER BY m.joined_at`).bind(userId).all<Membership>()).results;
}

export async function GET(request:Request){
  const user=await getSessionUser();
  if(!user)return fail("Oturum açmanız gerekiyor.",401);
  const allMemberships=await memberships(user.userId);
  if(!allMemberships.length)return NextResponse.json({user,membership:null,communities:[]});
  const requested=new URL(request.url).searchParams.get("communityId");
  const membership=allMemberships.find(item=>item.community_id===requested)||allMemberships[0];
  const db=getDatabase(), communityId=membership.community_id, managerView=canManage(membership.role);
  const communityQuery=managerView?"SELECT id,name,block_count,unit_count,monthly_due,period,invite_code FROM communities WHERE id = ?":"SELECT id,name,block_count,unit_count,monthly_due,period,'' AS invite_code FROM communities WHERE id = ?";
  const memberQuery=membership.role==="owner"?"SELECT id,user_id,display_name,email,role,unit,phone,joined_at FROM members WHERE community_id = ? ORDER BY joined_at":"SELECT id,user_id,display_name,'' AS email,role,unit,phone,joined_at FROM members WHERE community_id = ? ORDER BY joined_at";
  const residentQuery=managerView?"SELECT id,name,unit,phone,occupancy,created_at FROM residents WHERE community_id = ? ORDER BY unit,name":"SELECT id,name,unit,NULL AS phone,occupancy,created_at FROM residents WHERE community_id = ? ORDER BY unit,name";
  const [community,membersResult,residentsResult,dues,expenses,announcements,decisions,notifications,invitations]=await Promise.all([
    db.prepare(communityQuery).bind(communityId).first(),db.prepare(memberQuery).bind(communityId).all<MemberRow>(),db.prepare(residentQuery).bind(communityId).all<ResidentRow>(),
    db.prepare("SELECT id,resident_name,unit,amount,status,due_date,created_at FROM dues WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id,title,category,amount,note,expense_date,created_at FROM expenses WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id,title,body,kind,created_at FROM announcements WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id,title,body,decision_no,created_at FROM decisions WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id,title,body,kind,read_at,created_at FROM notifications WHERE community_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 30").bind(communityId,user.userId).all(),
    managerView?db.prepare("SELECT id,email,unit,phone,status,token,created_at,accepted_at FROM invitations WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all():Promise.resolve({results:[]}),
  ]);
  if(!community)return fail("Apartman kaydı bulunamadı.",404);
  const manualResidents=residentsResult.results.map(resident=>({...resident,source:"manual" as const}));
  const accountResidents=membersResult.results.filter(member=>member.role==="resident").filter(member=>!manualResidents.some(resident=>resident.name.toLocaleLowerCase("tr")===member.display_name.toLocaleLowerCase("tr")&&resident.unit===String(member.unit??""))).map(member=>({id:`member:${member.id}`,name:member.display_name,unit:member.unit||"Belirtilmedi",phone:managerView?member.phone:null,occupancy:"Kayıtlı kullanıcı",created_at:member.joined_at,source:"member" as const}));
  const visibleResidents=[...manualResidents,...accountResidents].sort((a,b)=>a.unit.localeCompare(b.unit,"tr",{numeric:true}));
  return NextResponse.json({user,membership,communities:allMemberships,community,members:membersResult.results,residents:visibleResidents,dues:dues.results,expenses:expenses.results,announcements:announcements.results,decisions:decisions.results,notifications:notifications.results,invitations:invitations.results});
}

export async function POST(request:Request){
  if(!sameOrigin(request))return fail("Geçersiz istek.",403);
  const user=await getSessionUser();if(!user)return fail("Oturum açmanız gerekiyor.",401);
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return fail("Geçersiz istek.");
  const action=clean(body.action,40),db=getDatabase(),createdAt=now(),allMemberships=await memberships(user.userId);
  const membership=allMemberships.find(item=>item.community_id===clean(body.communityId,80))||allMemberships[0]||null;

  if(action==="createCommunity"){
    const name=clean(body.name,100);if(!name)return fail("Apartman veya site adı gerekli.");const communityId=id();
    await db.batch([db.prepare("INSERT INTO communities (id,name,block_count,unit_count,monthly_due,period,invite_code,owner_user_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(communityId,name,number(body.blockCount,1,50),number(body.unitCount,1,2000),number(body.monthlyDue,0,10_000_000),clean(body.period,30)||String(new Date().getFullYear()),inviteCode(),user.userId,createdAt),db.prepare("INSERT INTO members (id,community_id,user_id,email,display_name,role,unit,phone,joined_at) SELECT ?,?,?,?,?, 'owner',NULL,phone,? FROM app_users WHERE id = ?").bind(id(),communityId,user.userId,user.email,user.displayName,createdAt,user.userId)]);
    return NextResponse.json({ok:true,communityId});
  }
  if(action==="joinCommunity"){
    const joinValue=clean(body.code,100),invitation=await db.prepare("SELECT id,community_id,email,unit,phone FROM invitations WHERE token=? AND status='pending'").bind(joinValue).first<{id:string;community_id:string;email:string;unit:string|null;phone:string|null}>();
    if(invitation&&normalizeEmail(invitation.email)!==normalizeEmail(user.email))return fail("Bu davet farklı bir e-posta adresine gönderilmiş.",403);
    const community=invitation?{id:invitation.community_id}:await db.prepare("SELECT id FROM communities WHERE invite_code=?").bind(joinValue.toUpperCase()).first<{id:string}>();
    if(!community)return fail("Davet bağlantısı veya kodu geçersiz.",404);if(allMemberships.some(item=>item.community_id===community.id))return fail("Bu apartmana zaten üyesiniz.",409);
    const unit=clean(body.unit,60)||invitation?.unit||null,phone=clean(body.phone,20)||invitation?.phone||null;if(!unit)return fail("Daire bilgisi gerekli.");if(!phone||phone.replace(/\D/g,"").length<10)return fail("Geçerli bir telefon numarası gerekli.");
    const statements=[db.prepare("INSERT INTO members (id,community_id,user_id,email,display_name,role,unit,phone,joined_at) VALUES (?,?,?,?,?,'resident',?,?,?)").bind(id(),community.id,user.userId,user.email,user.displayName,unit,phone,createdAt),db.prepare("UPDATE app_users SET phone=COALESCE(NULLIF(?,''),phone) WHERE id=?").bind(phone,user.userId)];if(invitation)statements.push(db.prepare("UPDATE invitations SET status='joined',accepted_at=? WHERE id=?").bind(createdAt,invitation.id));await db.batch(statements);
    return NextResponse.json({ok:true,communityId:community.id});
  }
  if(!membership)return fail("Önce bir apartman oluşturun veya davetle katılın.",403);
  const communityId=membership.community_id,role=membership.role;
  if(action==="markNotificationsRead"){await db.prepare("UPDATE notifications SET read_at=? WHERE community_id=? AND user_id=? AND read_at IS NULL").bind(createdAt,communityId,user.userId).run();return NextResponse.json({ok:true});}
  if(action==="updateMemberRole"){if(role!=="owner")return fail("Bu işlem yalnızca yönetim sahibine açık.",403);const nextRole=clean(body.role,20);if(!["manager","resident"].includes(nextRole))return fail("Geçersiz rol.");await db.prepare("UPDATE members SET role=? WHERE id=? AND community_id=? AND role!='owner'").bind(nextRole,clean(body.id,80),communityId).run();return NextResponse.json({ok:true});}
  if(!canManage(role))return fail("Bu işlem için yönetici yetkisi gerekiyor.",403);

  if(action==="createInvitation"){
    const email=normalizeEmail(body.email);if(!validEmail(email))return fail("Geçerli bir e-posta adresi girin.");const token=inviteCode()+inviteCode(),community=await db.prepare("SELECT name FROM communities WHERE id=?").bind(communityId).first<{name:string}>();
    await db.prepare("INSERT INTO invitations (id,community_id,email,token,unit,phone,status,invited_by,created_at) VALUES (?,?,?,?,?,?,'pending',?,?)").bind(id(),communityId,email,token,clean(body.unit,60)||null,clean(body.phone,20)||null,user.userId,createdAt).run();
    const inviteUrl=`https://apartmanos.com.tr/giris?davet=${encodeURIComponent(token)}`,subject=`${community?.name||"Apartman"} için apartmanOS daveti`,text=`Merhaba, ${community?.name||"apartmanımıza"} katılmak için bu bağlantıyı açın: ${inviteUrl}`;
    return NextResponse.json({ok:true,inviteUrl,mailtoUrl:`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`});
  }
  if(action==="addResident"){
    const name=clean(body.name,100),unit=clean(body.unit,60),phone=clean(body.phone,30);if(!name||!unit||phone.replace(/\D/g,"").length<10)return fail("Ad soyad, daire ve telefon gerekli.");await db.prepare("INSERT INTO residents (id,community_id,name,unit,phone,occupancy,created_at) VALUES (?,?,?,?,?,?,?)").bind(id(),communityId,name,unit,phone,clean(body.occupancy,30)||"Ev sahibi",createdAt).run();
  }else if(action==="generateMonthlyDues"){
    const dueDate=clean(body.dueDate,20),amount=number(body.amount,1,10_000_000);if(!dueDate)return fail("Son ödeme tarihi gerekli.");const [manual,accounts,existing]=await Promise.all([db.prepare("SELECT name,unit FROM residents WHERE community_id=?").bind(communityId).all<{name:string;unit:string}>(),db.prepare("SELECT display_name AS name,unit FROM members WHERE community_id=? AND role='resident' AND unit IS NOT NULL").bind(communityId).all<{name:string;unit:string}>(),db.prepare("SELECT resident_name,unit FROM dues WHERE community_id=? AND due_date=?").bind(communityId,dueDate).all<{resident_name:string;unit:string}>()]);
    const people=[...manual.results,...accounts.results].filter((person,index,list)=>list.findIndex(item=>item.name===person.name&&item.unit===person.unit)===index).filter(person=>!existing.results.some(item=>item.resident_name===person.name&&item.unit===person.unit));if(!people.length)return fail("Bu dönem için eklenecek yeni sakin bulunamadı.",409);await db.batch(people.map(person=>db.prepare("INSERT INTO dues (id,community_id,resident_name,unit,amount,status,due_date,created_by,created_at) VALUES (?,?,?,?,?,'pending',?,?,?)").bind(id(),communityId,person.name,person.unit,amount,dueDate,user.userId,createdAt)));return NextResponse.json({ok:true,created:people.length});
  }else if(action==="addDue"){const name=clean(body.residentName,100),unit=clean(body.unit,60),dueDate=clean(body.dueDate,20);if(!name||!unit||!dueDate)return fail("Sakin, daire ve son ödeme tarihi gerekli.");await db.prepare("INSERT INTO dues (id,community_id,resident_name,unit,amount,status,due_date,created_by,created_at) VALUES (?,?,?,?,?,'pending',?,?,?)").bind(id(),communityId,name,unit,number(body.amount,1,10_000_000),dueDate,user.userId,createdAt).run();
  }else if(action==="addExpense"){const title=clean(body.title,140);if(!title)return fail("Gider açıklaması gerekli.");await db.prepare("INSERT INTO expenses (id,community_id,title,category,amount,note,expense_date,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(id(),communityId,title,clean(body.category,40)||"Diğer",number(body.amount,1,10_000_000),clean(body.note,1000)||null,clean(body.expenseDate,20)||createdAt.slice(0,10),user.userId,createdAt).run();
  }else if(action==="addAnnouncement"){const title=clean(body.title,140),text=clean(body.body,3000);if(!title||!text)return fail("Başlık ve açıklama gerekli.");const recipients=(await db.prepare("SELECT user_id FROM members WHERE community_id=? AND user_id!=?").bind(communityId,user.userId).all<{user_id:string}>()).results;await db.batch([db.prepare("INSERT INTO announcements (id,community_id,title,body,kind,created_by,created_at) VALUES (?,?,?,?,?,?,?)").bind(id(),communityId,title,text,clean(body.kind,40)||"Bilgilendirme",user.userId,createdAt),...recipients.map(recipient=>db.prepare("INSERT INTO notifications (id,community_id,user_id,title,body,kind,created_at) VALUES (?,?,?,?,?,'announcement',?)").bind(id(),communityId,recipient.user_id,title,text,createdAt))]);
  }else if(action==="addDecision"){const title=clean(body.title,140),text=clean(body.body,4000),decisionNo=clean(body.decisionNo,40);if(!title||!text||!decisionNo)return fail("Karar başlığı, metni ve numarası gerekli.");await db.prepare("INSERT INTO decisions (id,community_id,title,body,decision_no,created_by,created_at) VALUES (?,?,?,?,?,?,?)").bind(id(),communityId,title,text,decisionNo,user.userId,createdAt).run();
  }else if(action==="toggleDue"){const record=await db.prepare("SELECT status FROM dues WHERE id=? AND community_id=?").bind(clean(body.id,80),communityId).first<{status:string}>();if(!record)return fail("Aidat kaydı bulunamadı.",404);await db.prepare("UPDATE dues SET status=? WHERE id=? AND community_id=?").bind(record.status==="paid"?"pending":"paid",clean(body.id,80),communityId).run();
  }else if(action==="updateCommunity"){const name=clean(body.name,100);if(!name)return fail("Apartman adı gerekli.");await db.prepare("UPDATE communities SET name=?,block_count=?,unit_count=?,monthly_due=?,period=? WHERE id=?").bind(name,number(body.blockCount,1,50),number(body.unitCount,1,2000),number(body.monthlyDue,0,10_000_000),clean(body.period,30),communityId).run();
  }else if(action==="regenerateInvite"){if(role!=="owner")return fail("Yeni davet kodunu yalnızca yönetim sahibi oluşturabilir.",403);await db.prepare("UPDATE communities SET invite_code=? WHERE id=?").bind(inviteCode(),communityId).run();
  }else if(action==="delete"){const tables:Record<string,string>={residents:"residents",dues:"dues",expenses:"expenses",announcements:"announcements",decisions:"decisions"},table=tables[clean(body.type,30)];if(!table)return fail("Geçersiz kayıt türü.");await db.prepare(`DELETE FROM ${table} WHERE id=? AND community_id=?`).bind(clean(body.id,80),communityId).run();
  }else return fail("Bilinmeyen işlem.");
  return NextResponse.json({ok:true});
}
