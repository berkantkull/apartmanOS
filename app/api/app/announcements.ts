import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

type Role="owner"|"manager"|"resident";
type Context={communityId:string;role:Role;unit:string|null;userId:string};
type AnnouncementRow={id:string;title:string;body:string;kind:string;category:string;target_scope:"all"|"block"|"units";target_value:string|null;publish_at:string|null;is_urgent:number;archived_at:string|null;attachment_id:string|null;created_at:string;file_name:string|null;content_type:string|null;size:number|null};
type Member={user_id:string;display_name:string;unit:string|null};

const clean=(value:unknown,max=200)=>String(value??"").trim().slice(0,max);
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const manager=(role:Role)=>role==="owner"||role==="manager";
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});

let schemaReady:Promise<void>|null=null;
export function ensureAnnouncementSchema(){
  schemaReady??=(async()=>{
    const db=getDatabase(),statements=[
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_key TEXT",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Bilgilendirme'",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_scope TEXT NOT NULL DEFAULT 'all'",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_value TEXT",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS publish_at TEXT",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_urgent INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS archived_at TEXT",
      "ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachment_id TEXT",
      `CREATE TABLE IF NOT EXISTS announcement_reads (
        id TEXT PRIMARY KEY, announcement_id TEXT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, read_at TEXT NOT NULL,
        UNIQUE (announcement_id,user_id))`,
      `CREATE TABLE IF NOT EXISTS announcement_attachments (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        object_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL,
        uploaded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, created_at TEXT NOT NULL)`,
      "CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id,read_at)",
      "CREATE INDEX IF NOT EXISTS idx_announcement_attachments_community ON announcement_attachments(community_id)",
    ];
    await db.batch(statements.map(statement=>db.prepare(statement)));
  })().catch(error=>{schemaReady=null;throw error});
  return schemaReady;
}

function matchesTarget(scope:AnnouncementRow["target_scope"],value:string|null,unit:string|null){
  if(scope==="all")return true;if(!unit)return false;
  const targets=(value||"").split(",").map(item=>item.trim()).filter(Boolean);
  return scope==="block"?targets.some(block=>unit.toLocaleLowerCase("tr").startsWith(block.toLocaleLowerCase("tr"))):targets.some(target=>target.toLocaleLowerCase("tr")===unit.toLocaleLowerCase("tr"));
}

async function members(communityId:string){
  return (await getDatabase().prepare("SELECT user_id,display_name,unit FROM members WHERE community_id=?").bind(communityId).all<Member>()).results;
}

async function dispatch(row:AnnouncementRow,communityId:string,creatorId=""){
  if(row.archived_at||Date.parse(row.publish_at||row.created_at)>Date.now())return;
  const db=getDatabase(),recipients=(await members(communityId)).filter(member=>member.user_id!==creatorId&&matchesTarget(row.target_scope,row.target_value,member.unit)),sourceKey=`announcement:${row.id}`;
  if(!recipients.length)return;
  await db.batch(recipients.map(recipient=>db.prepare(`INSERT INTO notifications (id,community_id,user_id,title,body,kind,source_key,created_at)
    SELECT ?,?,?,?,?, 'announcement',?,? WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=? AND source_key=?)`).bind(id(),communityId,recipient.user_id,row.is_urgent?`ACİL: ${row.title}`:row.title,row.body,sourceKey,now(),recipient.user_id,sourceKey)));
}

export async function loadAnnouncements(context:Context){
  await ensureAnnouncementSchema();
  const db=getDatabase(),rows=(await db.prepare(`SELECT a.id,a.title,a.body,a.kind,a.category,a.target_scope,a.target_value,a.publish_at,a.is_urgent,a.archived_at,a.attachment_id,a.created_at,
    f.file_name,f.content_type,f.size FROM announcements a LEFT JOIN announcement_attachments f ON f.id=a.attachment_id
    WHERE a.community_id=? ORDER BY COALESCE(a.publish_at,a.created_at) DESC`).bind(context.communityId).all<AnnouncementRow>()).results;
  for(const row of rows)await dispatch(row,context.communityId);
  const allMembers=await members(context.communityId),reads=(await db.prepare(`SELECT r.announcement_id,r.user_id,r.read_at,u.display_name FROM announcement_reads r JOIN app_users u ON u.id=r.user_id JOIN announcements a ON a.id=r.announcement_id WHERE a.community_id=? ORDER BY r.read_at DESC`).bind(context.communityId).all<{announcement_id:string;user_id:string;read_at:string;display_name:string}>()).results;
  return rows.filter(row=>manager(context.role)||(!row.archived_at&&Date.parse(row.publish_at||row.created_at)<=Date.now()&&matchesTarget(row.target_scope,row.target_value,context.unit))).map(row=>{
    const audience=allMembers.filter(member=>matchesTarget(row.target_scope,row.target_value,member.unit)),readerRows=reads.filter(read=>read.announcement_id===row.id);
    return {...row,kind:row.category||row.kind,attachment:row.attachment_id?{id:row.attachment_id,file_name:row.file_name,content_type:row.content_type,size:Number(row.size||0),url:`/api/announcement-files?id=${encodeURIComponent(row.attachment_id)}`}:null,read_count:readerRows.length,audience_count:audience.length,is_read:readerRows.some(read=>read.user_id===context.userId),readers:manager(context.role)?readerRows.map(read=>({name:read.display_name,read_at:read.read_at})):[]};
  });
}

export async function handleAnnouncementAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["addAnnouncement","markAnnouncementRead","archiveAnnouncement"].includes(action))return null;
  await ensureAnnouncementSchema();const db=getDatabase();
  if(action==="markAnnouncementRead"){
    const row=await db.prepare("SELECT id,target_scope,target_value,publish_at,created_at,archived_at FROM announcements WHERE id=? AND community_id=?").bind(clean(body.id,80),context.communityId).first<AnnouncementRow>();if(!row)return fail("Duyuru bulunamadı.",404);if(!manager(context.role)&&(!matchesTarget(row.target_scope,row.target_value,context.unit)||row.archived_at||Date.parse(row.publish_at||row.created_at)>Date.now()))return fail("Bu duyuruya erişiminiz yok.",403);
    await db.prepare("INSERT INTO announcement_reads (id,announcement_id,user_id,read_at) VALUES (?,?,?,?) ON CONFLICT (announcement_id,user_id) DO NOTHING").bind(id(),row.id,context.userId,now()).run();return NextResponse.json({ok:true});
  }
  if(!manager(context.role))return fail("Bu işlem için yönetici yetkisi gerekiyor.",403);
  if(action==="archiveAnnouncement"){
    await db.prepare("UPDATE announcements SET archived_at=? WHERE id=? AND community_id=?").bind(now(),clean(body.id,80),context.communityId).run();return NextResponse.json({ok:true});
  }
  const title=clean(body.title,140),text=clean(body.body,3000);if(!title||!text)return fail("Başlık ve açıklama gerekli.");
  const scopeInput=clean(body.targetScope,40),targetScope:AnnouncementRow["target_scope"]=scopeInput==="Blok"?"block":scopeInput==="Belirli daireler"?"units":"all",targetValue=targetScope==="all"?null:clean(body.targetValue,500).split(",").map(item=>item.trim()).filter(Boolean).join(",");
  if(targetScope!=="all"&&!targetValue)return fail(targetScope==="block"?"En az bir blok adı yazın.":"En az bir daire yazın.");
  const publishAt=clean(body.publishAt,40)||now(),urgent=body.isUrgent==="on"?1:0,category=urgent?"Acil":clean(body.category,40)||"Bilgilendirme",attachmentId=clean(body.attachmentId,80)||null;
  if(attachmentId){const attachment=await db.prepare("SELECT id FROM announcement_attachments WHERE id=? AND community_id=?").bind(attachmentId,context.communityId).first();if(!attachment)return fail("Dosya eki bulunamadı.",404)}
  const announcementId=id();await db.prepare("INSERT INTO announcements (id,community_id,title,body,kind,category,target_scope,target_value,publish_at,is_urgent,attachment_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(announcementId,context.communityId,title,text,category,category,targetScope,targetValue,publishAt,urgent,attachmentId,context.userId,now()).run();
  const row=await db.prepare("SELECT id,title,body,kind,category,target_scope,target_value,publish_at,is_urgent,archived_at,attachment_id,created_at,NULL AS file_name,NULL AS content_type,NULL AS size FROM announcements WHERE id=?").bind(announcementId).first<AnnouncementRow>();if(row)await dispatch(row,context.communityId,context.userId);
  return NextResponse.json({ok:true});
}
