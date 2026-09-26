import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

type Role="owner"|"manager"|"resident";
type Context={communityId:string;role:Role;userId:string;displayName:string};
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const clean=(value:unknown,max=300)=>String(value??"").trim().slice(0,max);
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const canManage=(role:Role)=>role==="owner"||role==="manager";

let schemaReady:Promise<void>|null=null;
export function ensureMeetingSchema(){
  schemaReady??=(async()=>{const db=getDatabase();await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS meetings (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,title TEXT NOT NULL,meeting_type TEXT NOT NULL DEFAULT 'Olağan Genel Kurul',meeting_at TEXT NOT NULL,location TEXT NOT NULL,agenda TEXT NOT NULL,notes TEXT,status TEXT NOT NULL DEFAULT 'planned',created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS meeting_attendees (id TEXT PRIMARY KEY,meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,user_id TEXT,name TEXT NOT NULL,unit TEXT,status TEXT NOT NULL DEFAULT 'invited',updated_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS meeting_decisions (id TEXT PRIMARY KEY,meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,decision_no TEXT NOT NULL,decision_date TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS meeting_documents (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,object_key TEXT NOT NULL UNIQUE,file_name TEXT NOT NULL,content_type TEXT NOT NULL,size INTEGER NOT NULL,document_type TEXT NOT NULL DEFAULT 'minutes',uploaded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,created_at TEXT NOT NULL)`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meetings_community ON meetings(community_id,meeting_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id,status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_decisions_meeting ON meeting_decisions(meeting_id,decision_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_documents_meeting ON meeting_documents(meeting_id,created_at)"),
  ])})().catch(error=>{schemaReady=null;throw error});return schemaReady;
}

export async function loadMeetings(context:Context){
  await ensureMeetingSchema();const db=getDatabase(),meetings=(await db.prepare("SELECT * FROM meetings WHERE community_id=? ORDER BY meeting_at DESC").bind(context.communityId).all<Record<string,unknown>>()).results;
  const [attendees,decisions,documents]=await Promise.all([
    db.prepare("SELECT a.* FROM meeting_attendees a JOIN meetings m ON m.id=a.meeting_id WHERE m.community_id=? ORDER BY a.unit,a.name").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT d.* FROM meeting_decisions d JOIN meetings m ON m.id=d.meeting_id WHERE m.community_id=? ORDER BY d.decision_date DESC,d.created_at DESC").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT d.id,d.meeting_id,d.file_name,d.content_type,d.size,d.document_type,d.created_at FROM meeting_documents d WHERE d.community_id=? AND d.meeting_id IS NOT NULL ORDER BY d.created_at DESC").bind(context.communityId).all<Record<string,unknown>>(),
  ]);
  return meetings.map(meeting=>({...meeting,attendees:attendees.results.filter(item=>item.meeting_id===meeting.id),decisions:decisions.results.filter(item=>item.meeting_id===meeting.id),documents:documents.results.filter(item=>item.meeting_id===meeting.id).map(item=>({...item,url:`/api/meeting-files?id=${encodeURIComponent(String(item.id))}`}))}));
}

async function notifyMembers(communityId:string,exclude:string,title:string,body:string,sourceKey:string){
  const db=getDatabase(),members=(await db.prepare("SELECT user_id FROM members WHERE community_id=? AND user_id!=?").bind(communityId,exclude).all<{user_id:string}>()).results;if(!members.length)return;
  await db.batch(members.map(member=>db.prepare("INSERT INTO notifications (id,community_id,user_id,title,body,kind,source_key,created_at) VALUES (?,?,?,?,?,'meeting',?,?)").bind(id(),communityId,member.user_id,title,body,sourceKey,now())));
}

export async function handleMeetingAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["createMeeting","updateMeeting","updateAttendance","addMeetingDecision","sendMeetingReminder","attachMeetingDocument"].includes(action))return null;
  await ensureMeetingSchema();if(!canManage(context.role))return fail("Toplantıları yalnızca yöneticiler yönetebilir.",403);const db=getDatabase(),createdAt=now();
  if(action==="createMeeting"){
    const title=clean(body.title,140),meetingType=clean(body.meetingType,60)||"Olağan Genel Kurul",meetingAtInput=clean(body.meetingAt,40),meetingAt=/Z$|[+-]\d\d:\d\d$/.test(meetingAtInput)?meetingAtInput:`${meetingAtInput}+03:00`,location=clean(body.location,200),agenda=clean(body.agenda,5000),notes=clean(body.notes,5000)||null,documentId=clean(body.documentId,80)||null;if(!title||!meetingAtInput||!location||!agenda)return fail("Toplantı adı, tarih, yer ve gündem gerekli.");if(Number.isNaN(Date.parse(meetingAt)))return fail("Geçerli bir toplantı tarihi seçin.");
    if(documentId&&!await db.prepare("SELECT id FROM meeting_documents WHERE id=? AND community_id=? AND uploaded_by=? AND meeting_id IS NULL").bind(documentId,context.communityId,context.userId).first())return fail("Toplantı belgesi bulunamadı.",404);
    const meetingId=id(),members=(await db.prepare("SELECT user_id,display_name AS name,unit FROM members WHERE community_id=? ORDER BY unit,display_name").bind(context.communityId).all<{user_id:string;name:string;unit:string|null}>()).results,manual=(await db.prepare("SELECT name,unit FROM residents WHERE community_id=? ORDER BY unit,name").bind(context.communityId).all<{name:string;unit:string}>()).results,people=[...members,...manual.filter(person=>!members.some(member=>member.name.toLocaleLowerCase('tr')===person.name.toLocaleLowerCase('tr')&&member.unit===person.unit)).map(person=>({user_id:null as string|null,...person}))];
    const statements=[db.prepare("INSERT INTO meetings (id,community_id,title,meeting_type,meeting_at,location,agenda,notes,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'planned',?,?,?)").bind(meetingId,context.communityId,title,meetingType,new Date(meetingAt).toISOString(),location,agenda,notes,context.userId,createdAt,createdAt),...people.map(person=>db.prepare("INSERT INTO meeting_attendees (id,meeting_id,user_id,name,unit,status,updated_at) VALUES (?,?,?,?,?,'invited',?)").bind(id(),meetingId,person.user_id,person.name,person.unit,createdAt))];if(documentId)statements.push(db.prepare("UPDATE meeting_documents SET meeting_id=? WHERE id=? AND community_id=?").bind(meetingId,documentId,context.communityId));await db.batch(statements);
    const when=new Intl.DateTimeFormat('tr-TR',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(meetingAt));await notifyMembers(context.communityId,context.userId,`Toplantı duyurusu: ${title}`,`${when} · ${location}`,`meeting:${meetingId}:created`);return NextResponse.json({ok:true});
  }
  const meetingId=clean(body.meetingId,80),meeting=await db.prepare("SELECT id,title,meeting_at,location FROM meetings WHERE id=? AND community_id=?").bind(meetingId,context.communityId).first<{id:string;title:string;meeting_at:string;location:string}>();if(!meeting)return fail("Toplantı bulunamadı.",404);
  if(action==="updateAttendance"){
    const attendeeId=clean(body.attendeeId,80),status=clean(body.status,30);if(!["invited","attending","absent","proxy"].includes(status))return fail("Geçersiz katılım durumu.");await db.prepare("UPDATE meeting_attendees SET status=?,updated_at=? WHERE id=? AND meeting_id=?").bind(status,createdAt,attendeeId,meetingId).run();return NextResponse.json({ok:true});
  }
  if(action==="addMeetingDecision"){
    const title=clean(body.title,140),text=clean(body.body,5000),decisionNo=clean(body.decisionNo,50),decisionDate=clean(body.decisionDate,20);if(!title||!text||!decisionNo||!decisionDate)return fail("Karar başlığı, metni, numarası ve tarihi gerekli.");const decisionId=id();await db.batch([db.prepare("INSERT INTO meeting_decisions (id,meeting_id,decision_no,decision_date,title,body,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(decisionId,meetingId,decisionNo,decisionDate,title,text,context.userId,createdAt),db.prepare("INSERT INTO decisions (id,community_id,title,body,decision_no,created_by,created_at) VALUES (?,?,?,?,?,?,?)").bind(decisionId,context.communityId,title,text,decisionNo,context.userId,decisionDate)]);return NextResponse.json({ok:true});
  }
  if(action==="attachMeetingDocument"){
    const documentId=clean(body.documentId,80);const result=await db.prepare("UPDATE meeting_documents SET meeting_id=? WHERE id=? AND community_id=? AND uploaded_by=? AND meeting_id IS NULL").bind(meetingId,documentId,context.communityId,context.userId).run();if(!result.meta.changes)return fail("Toplantı belgesi bulunamadı.",404);return NextResponse.json({ok:true});
  }
  if(action==="sendMeetingReminder"){
    const when=new Intl.DateTimeFormat('tr-TR',{dateStyle:'long',timeStyle:'short',timeZone:'Europe/Istanbul'}).format(new Date(meeting.meeting_at));await notifyMembers(context.communityId,context.userId,`Toplantı hatırlatması: ${meeting.title}`,`${when} · ${meeting.location}`,`meeting:${meetingId}:reminder:${createdAt}`);return NextResponse.json({ok:true});
  }
  const statusInput=clean(body.status,30),status=statusInput==="Tamamlandı"?"completed":statusInput==="İptal Edildi"?"cancelled":statusInput==="Planlandı"?"planned":statusInput,notes=clean(body.notes,5000)||null;if(!["planned","completed","cancelled"].includes(status))return fail("Geçersiz toplantı durumu.");await db.prepare("UPDATE meetings SET status=?,notes=COALESCE(?,notes),updated_at=? WHERE id=? AND community_id=?").bind(status,notes,createdAt,meetingId,context.communityId).run();return NextResponse.json({ok:true});
}
