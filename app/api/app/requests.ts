import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

type Role="owner"|"manager"|"resident";
type Context={communityId:string;role:Role;unit:string|null;userId:string;displayName:string};
type RequestRow={id:string;creator_user_id:string;creator_name:string;unit:string|null;request_type:"fault"|"request";category:string;title:string;description:string;priority:"low"|"normal"|"high"|"urgent";status:"new"|"reviewing"|"in_progress"|"resolved"|"cancelled";manager_note:string|null;attachment_id:string|null;resolution_attachment_id:string|null;created_at:string;updated_at:string;resolved_at:string|null;initial_file_name:string|null;initial_content_type:string|null;initial_size:number|null;resolution_file_name:string|null;resolution_content_type:string|null;resolution_size:number|null};
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const clean=(value:unknown,max=200)=>String(value??"").trim().slice(0,max);
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const canManage=(role:Role)=>role==="owner"||role==="manager";
const statuses=new Set(["new","reviewing","in_progress","resolved","cancelled"]);

let schemaReady:Promise<void>|null=null;
export function ensureRequestSchema(){
  schemaReady??=(async()=>{
    const db=getDatabase(),statements=[
      `CREATE TABLE IF NOT EXISTS maintenance_requests (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        creator_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, creator_name TEXT NOT NULL, unit TEXT,
        request_type TEXT NOT NULL DEFAULT 'fault', category TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'normal', status TEXT NOT NULL DEFAULT 'new', manager_note TEXT,
        attachment_id TEXT, resolution_attachment_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, resolved_at TEXT)`,
      `CREATE TABLE IF NOT EXISTS maintenance_history (
        id TEXT PRIMARY KEY, request_id TEXT NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
        actor_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, actor_name TEXT NOT NULL,
        action TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS maintenance_attachments (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        object_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL,
        purpose TEXT NOT NULL DEFAULT 'initial', uploaded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, created_at TEXT NOT NULL)`,
      "CREATE INDEX IF NOT EXISTS idx_maintenance_requests_community ON maintenance_requests(community_id,status,updated_at)",
      "CREATE INDEX IF NOT EXISTS idx_maintenance_requests_creator ON maintenance_requests(creator_user_id,updated_at)",
      "CREATE INDEX IF NOT EXISTS idx_maintenance_history_request ON maintenance_history(request_id,created_at)",
      "CREATE INDEX IF NOT EXISTS idx_maintenance_attachments_community ON maintenance_attachments(community_id)",
    ];await db.batch(statements.map(statement=>db.prepare(statement)));
  })().catch(error=>{schemaReady=null;throw error});return schemaReady;
}

function attachment(idValue:string|null,fileName:string|null,contentType:string|null,size:number|null){return idValue?{id:idValue,file_name:fileName,content_type:contentType,size:Number(size||0),url:`/api/request-files?id=${encodeURIComponent(idValue)}`}:null}

export async function loadRequests(context:Context){
  await ensureRequestSchema();const db=getDatabase(),where=canManage(context.role)?"r.community_id=?":"r.community_id=? AND r.creator_user_id=?",bindings=canManage(context.role)?[context.communityId]:[context.communityId,context.userId];
  const rows=(await db.prepare(`SELECT r.*,
    a.file_name AS initial_file_name,a.content_type AS initial_content_type,a.size AS initial_size,
    s.file_name AS resolution_file_name,s.content_type AS resolution_content_type,s.size AS resolution_size
    FROM maintenance_requests r LEFT JOIN maintenance_attachments a ON a.id=r.attachment_id
    LEFT JOIN maintenance_attachments s ON s.id=r.resolution_attachment_id
    WHERE ${where} ORDER BY CASE r.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,r.updated_at DESC`).bind(...bindings).all<RequestRow>()).results;
  const history=(await db.prepare(`SELECT h.id,h.request_id,h.actor_name,h.action,h.note,h.created_at FROM maintenance_history h
    JOIN maintenance_requests r ON r.id=h.request_id WHERE r.community_id=? ORDER BY h.created_at DESC`).bind(context.communityId).all<{id:string;request_id:string;actor_name:string;action:string;note:string|null;created_at:string}>()).results;
  return rows.map(row=>({...row,attachment:attachment(row.attachment_id,row.initial_file_name,row.initial_content_type,row.initial_size),resolution_attachment:attachment(row.resolution_attachment_id,row.resolution_file_name,row.resolution_content_type,row.resolution_size),history:history.filter(item=>item.request_id===row.id)}));
}

async function notifyManagers(communityId:string,title:string,body:string,sourceKey:string,excludeUserId:string){
  const db=getDatabase(),managers=(await db.prepare("SELECT user_id FROM members WHERE community_id=? AND role IN ('owner','manager') AND user_id!=?").bind(communityId,excludeUserId).all<{user_id:string}>()).results;if(!managers.length)return;
  await db.batch(managers.map(item=>db.prepare("INSERT INTO notifications (id,community_id,user_id,title,body,kind,source_key,created_at) VALUES (?,?,?,?,?,'maintenance',?,?)").bind(id(),communityId,item.user_id,title,body,sourceKey,now())));
}

export async function handleRequestAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["createMaintenanceRequest","updateMaintenanceRequest"].includes(action))return null;await ensureRequestSchema();const db=getDatabase();
  if(action==="createMaintenanceRequest"){
    const title=clean(body.title,140),description=clean(body.description,3000),category=clean(body.category,80),type=clean(body.requestType,20)==="Talep"?"request":"fault",priorityInput=clean(body.priority,20),priority=priorityInput==="Acil"?"urgent":priorityInput==="Yüksek"?"high":priorityInput==="Düşük"?"low":"normal",attachmentId=clean(body.attachmentId,80)||null;if(!title||!description||!category)return fail("Başlık, kategori ve açıklama gerekli.");
    if(attachmentId){const file=await db.prepare("SELECT id FROM maintenance_attachments WHERE id=? AND community_id=? AND uploaded_by=? AND purpose='initial'").bind(attachmentId,context.communityId,context.userId).first();if(!file)return fail("Fotoğraf veya video eki bulunamadı.",404)}
    const requestId=id(),createdAt=now();await db.batch([db.prepare("INSERT INTO maintenance_requests (id,community_id,creator_user_id,creator_name,unit,request_type,category,title,description,priority,status,attachment_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,'new',?,?,?)").bind(requestId,context.communityId,context.userId,context.displayName,context.unit,type,category,title,description,priority,attachmentId,createdAt,createdAt),db.prepare("INSERT INTO maintenance_history (id,request_id,actor_user_id,actor_name,action,note,created_at) VALUES (?,?,?,?,?,?,?)").bind(id(),requestId,context.userId,context.displayName,"Talep oluşturuldu",description,createdAt)]);
    await notifyManagers(context.communityId,type==="fault"?"Yeni arıza bildirimi":"Yeni sakin talebi",`${context.displayName}${context.unit?` · ${context.unit}`:""}: ${title}`,`maintenance:${requestId}:new`,context.userId);return NextResponse.json({ok:true});
  }
  if(!canManage(context.role))return fail("Talebi güncellemek için yönetici yetkisi gerekiyor.",403);const requestId=clean(body.id,80),record=await db.prepare("SELECT id,creator_user_id,title,status FROM maintenance_requests WHERE id=? AND community_id=?").bind(requestId,context.communityId).first<{id:string;creator_user_id:string;title:string;status:string}>();if(!record)return fail("Talep bulunamadı.",404);
  const statusInput=clean(body.status,30),requestedStatus=statusInput==="İnceleniyor"?"reviewing":statusInput==="İşleme Alındı"?"in_progress":statusInput==="Çözüldü"?"resolved":statusInput==="İptal Edildi"?"cancelled":statusInput==="Yeni"?"new":statusInput,nextStatus=requestedStatus==="new"&&record.status!=="new"?record.status:requestedStatus,managerNote=clean(body.managerNote,2000)||null,resolutionAttachmentId=clean(body.resolutionAttachmentId,80)||null;if(!statuses.has(nextStatus))return fail("Geçersiz talep durumu.");if(resolutionAttachmentId){const file=await db.prepare("SELECT id FROM maintenance_attachments WHERE id=? AND community_id=? AND purpose='resolution'").bind(resolutionAttachmentId,context.communityId).first();if(!file)return fail("Çözüm fotoğrafı bulunamadı.",404)}
  const updatedAt=now(),statusChanged=record.status!==nextStatus,actionText=statusChanged?`Durum güncellendi: ${statusLabel(nextStatus)}`:"Yönetici notu güncellendi";await db.batch([db.prepare("UPDATE maintenance_requests SET status=?,manager_note=COALESCE(?,manager_note),resolution_attachment_id=COALESCE(?,resolution_attachment_id),updated_at=?,resolved_at=CASE WHEN ?='resolved' THEN ? ELSE resolved_at END WHERE id=? AND community_id=?").bind(nextStatus,managerNote,resolutionAttachmentId,updatedAt,nextStatus,updatedAt,requestId,context.communityId),db.prepare("INSERT INTO maintenance_history (id,request_id,actor_user_id,actor_name,action,note,created_at) VALUES (?,?,?,?,?,?,?)").bind(id(),requestId,context.userId,context.displayName,actionText,managerNote,updatedAt)]);
  if(record.creator_user_id!==context.userId)await db.prepare("INSERT INTO notifications (id,community_id,user_id,title,body,kind,source_key,created_at) VALUES (?,?,?,?,?,'maintenance',?,?)").bind(id(),context.communityId,record.creator_user_id,`Talebiniz güncellendi: ${record.title}`,`${statusLabel(nextStatus)}${managerNote?` · ${managerNote}`:""}`,`maintenance:${requestId}:${updatedAt}`,updatedAt).run();return NextResponse.json({ok:true});
}

function statusLabel(value:string){return value==="reviewing"?"İnceleniyor":value==="in_progress"?"İşleme Alındı":value==="resolved"?"Çözüldü":value==="cancelled"?"İptal Edildi":"Yeni"}
