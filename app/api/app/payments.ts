import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

type Role = "owner"|"manager"|"resident";
type Context = { communityId:string; role:Role; unit:string|null; userId:string };
type DueRow = { id:string; resident_name:string; unit:string; amount:number; status:"pending"|"paid"|"late"; due_date:string; period:string; kind:"monthly"|"extra"; note:string|null; interest_rate:number; created_at:string };
type PaymentRow = { id:string; due_id:string; resident_name:string; unit:string; amount:number; method:string; reference:string|null; status:string; paid_at:string; created_at:string };

const clean=(value:unknown,max=200)=>String(value??"").trim().slice(0,max);
const amount=(value:unknown,min=1,max=10_000_000)=>Math.min(max,Math.max(min,Math.round(Number(value)||0)));
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const today=()=>now().slice(0,10);
const currentPeriod=()=>now().slice(0,7);
const canManage=(role:Role)=>role==="owner"||role==="manager";
const daysLate=(dueDate:string)=>Math.max(0,Math.floor((Date.parse(`${today()}T12:00:00Z`)-Date.parse(`${dueDate}T12:00:00Z`))/86_400_000));
const interestFor=(base:number,rate:number,dueDate:string)=>Math.round(base*(rate/100)*(daysLate(dueDate)/30));
const error=(message:string,status=400)=>NextResponse.json({error:message},{status});

let schemaReady:Promise<void>|null=null;
export function ensurePaymentSchema(){
  schemaReady??=(async()=>{
    const db=getDatabase(),sql=[
      "ALTER TABLE communities ADD COLUMN IF NOT EXISTS auto_due_enabled INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE communities ADD COLUMN IF NOT EXISTS due_day INTEGER NOT NULL DEFAULT 10",
      "ALTER TABLE communities ADD COLUMN IF NOT EXISTS late_interest_rate INTEGER NOT NULL DEFAULT 0",
      "ALTER TABLE communities ADD COLUMN IF NOT EXISTS payment_link TEXT",
      "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS source_key TEXT",
      "ALTER TABLE dues ADD COLUMN IF NOT EXISTS period TEXT NOT NULL DEFAULT ''",
      "ALTER TABLE dues ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'monthly'",
      "ALTER TABLE dues ADD COLUMN IF NOT EXISTS note TEXT",
      "ALTER TABLE dues ADD COLUMN IF NOT EXISTS interest_rate INTEGER NOT NULL DEFAULT 0",
      `CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        due_id TEXT NOT NULL REFERENCES dues(id) ON DELETE CASCADE, resident_name TEXT NOT NULL, unit TEXT NOT NULL,
        amount INTEGER NOT NULL, method TEXT NOT NULL DEFAULT 'manual', reference TEXT, status TEXT NOT NULL DEFAULT 'confirmed',
        paid_at TEXT NOT NULL, recorded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS transfer_notifications (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        due_id TEXT NOT NULL REFERENCES dues(id) ON DELETE CASCADE, member_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL, reference TEXT, note TEXT, status TEXT NOT NULL DEFAULT 'pending',
        reviewed_by TEXT REFERENCES app_users(id) ON DELETE SET NULL, created_at TEXT NOT NULL, reviewed_at TEXT)`,
      "CREATE INDEX IF NOT EXISTS idx_payments_due ON payments(due_id, paid_at)",
      "CREATE INDEX IF NOT EXISTS idx_payments_community ON payments(community_id, paid_at)",
      "CREATE INDEX IF NOT EXISTS idx_transfer_notifications_community ON transfer_notifications(community_id, status, created_at)",
    ];
    await db.batch(sql.map(statement=>db.prepare(statement)));
  })().catch(cause=>{schemaReady=null;throw cause});
  return schemaReady;
}

async function people(communityId:string){
  const db=getDatabase(),[manual,accounts]=await Promise.all([
    db.prepare("SELECT name,unit FROM residents WHERE community_id=?").bind(communityId).all<{name:string;unit:string}>(),
    db.prepare("SELECT display_name AS name,unit FROM members WHERE community_id=? AND role='resident' AND unit IS NOT NULL").bind(communityId).all<{name:string;unit:string}>(),
  ]);
  return [...manual.results,...accounts.results].filter(person=>person.unit).filter((person,index,list)=>list.findIndex(item=>item.unit===person.unit)===index);
}

async function notifyUnit(communityId:string,unit:string,title:string,body:string,sourceKey:string){
  const db=getDatabase(),recipients=(await db.prepare("SELECT user_id FROM members WHERE community_id=? AND unit=?").bind(communityId,unit).all<{user_id:string}>()).results;
  if(!recipients.length)return;
  await db.batch(recipients.map(recipient=>db.prepare(`INSERT INTO notifications (id,community_id,user_id,title,body,kind,source_key,created_at)
    SELECT ?,?,?,?,?, 'due',?,? WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=? AND source_key=?)`).bind(id(),communityId,recipient.user_id,title,body,sourceKey,now(),recipient.user_id,sourceKey)));
}

async function generateAutomaticDues(communityId:string){
  const db=getDatabase(),config=await db.prepare("SELECT monthly_due,auto_due_enabled,due_day,late_interest_rate,owner_user_id FROM communities WHERE id=?").bind(communityId).first<{monthly_due:number;auto_due_enabled:number;due_day:number;late_interest_rate:number;owner_user_id:string}>();
  if(!config?.auto_due_enabled||new Date().getDate()<config.due_day)return;
  const period=currentPeriod(),dueDate=`${period}-${String(Math.min(config.due_day,28)).padStart(2,"0")}`,residents=await people(communityId),existing=(await db.prepare("SELECT unit FROM dues WHERE community_id=? AND period=? AND kind='monthly'").bind(communityId,period).all<{unit:string}>()).results;
  for(const resident of residents.filter(person=>!existing.some(item=>item.unit===person.unit))){
    const dueId=id();
    await db.prepare("INSERT INTO dues (id,community_id,resident_name,unit,amount,period,kind,note,interest_rate,status,due_date,created_by,created_at) VALUES (?,?,?,?,?,?,'monthly',NULL,?,'pending',?,?,?)").bind(dueId,communityId,resident.name,resident.unit,config.monthly_due,period,config.late_interest_rate,dueDate,config.owner_user_id,now()).run();
    await notifyUnit(communityId,resident.unit,"Yeni aidat oluşturuldu",`${period} dönemi için ${config.monthly_due.toLocaleString("tr-TR")} TL aidat kaydınız oluşturuldu.`,`${dueId}:created`);
  }
}

export async function loadPaymentData(context:Context){
  await ensurePaymentSchema();
  await generateAutomaticDues(context.communityId);
  const db=getDatabase(),manager=canManage(context.role);
  const dues=manager
    ?await db.prepare("SELECT id,resident_name,unit,amount,status,due_date,period,kind,note,interest_rate,created_at FROM dues WHERE community_id=? ORDER BY due_date DESC,created_at DESC").bind(context.communityId).all<DueRow>()
    :await db.prepare("SELECT id,resident_name,unit,amount,status,due_date,period,kind,note,interest_rate,created_at FROM dues WHERE community_id=? AND unit=? ORDER BY due_date DESC,created_at DESC").bind(context.communityId,context.unit||"").all<DueRow>();
  const payments=manager
    ?await db.prepare("SELECT id,due_id,resident_name,unit,amount,method,reference,status,paid_at,created_at FROM payments WHERE community_id=? ORDER BY paid_at DESC").bind(context.communityId).all<PaymentRow>()
    :await db.prepare("SELECT id,due_id,resident_name,unit,amount,method,reference,status,paid_at,created_at FROM payments WHERE community_id=? AND unit=? ORDER BY paid_at DESC").bind(context.communityId,context.unit||"").all<PaymentRow>();
  const calculated=dues.results.map(due=>{
    const history=payments.results.filter(payment=>payment.due_id===due.id&&payment.status==="confirmed"),recorded=history.reduce((sum,payment)=>sum+Number(payment.amount),0),paidAmount=recorded||due.status==="paid"?recorded||Number(due.amount):0,interestAmount=due.status==="paid"?0:interestFor(Number(due.amount),Number(due.interest_rate||0),due.due_date),balance=Math.max(0,Number(due.amount)+interestAmount-paidAmount);
    return {...due,amount:Number(due.amount),interest_amount:interestAmount,paid_amount:paidAmount,balance,status:balance<=0?"paid":daysLate(due.due_date)>0?"late":"pending"};
  });
  for(const due of calculated.filter(item=>item.status==="late"))await notifyUnit(context.communityId,due.unit,"Gecikmiş aidat hatırlatması",`${due.period||due.due_date.slice(0,7)} döneminden ${due.balance.toLocaleString("tr-TR")} TL borcunuz bulunuyor.`,`${due.id}:late`);
  const transfers=manager
    ?await db.prepare(`SELECT t.id,t.due_id,t.amount,t.reference,t.note,t.status,t.created_at,t.reviewed_at,m.display_name,m.unit FROM transfer_notifications t JOIN members m ON m.user_id=t.member_user_id AND m.community_id=t.community_id WHERE t.community_id=? ORDER BY t.created_at DESC`).bind(context.communityId).all()
    :await db.prepare(`SELECT t.id,t.due_id,t.amount,t.reference,t.note,t.status,t.created_at,t.reviewed_at,m.display_name,m.unit FROM transfer_notifications t JOIN members m ON m.user_id=t.member_user_id AND m.community_id=t.community_id WHERE t.community_id=? AND t.member_user_id=? ORDER BY t.created_at DESC`).bind(context.communityId,context.userId).all();
  return {dues:calculated,payments:payments.results,transfers:transfers.results};
}

export async function handlePaymentAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["addPayment","submitTransfer","reviewTransfer"].includes(action))return null;
  await ensurePaymentSchema();
  const db=getDatabase(),createdAt=now();
  if(action==="submitTransfer"){
    const due=await db.prepare("SELECT id,unit FROM dues WHERE id=? AND community_id=?").bind(clean(body.dueId,80),context.communityId).first<{id:string;unit:string}>();
    if(!due)return error("Borç kaydı bulunamadı.",404);if(context.role==="resident"&&due.unit!==context.unit)return error("Yalnızca kendi daireniz için bildirim yapabilirsiniz.",403);
    await db.prepare("INSERT INTO transfer_notifications (id,community_id,due_id,member_user_id,amount,reference,note,status,created_at) VALUES (?,?,?,?,?,?,?,'pending',?)").bind(id(),context.communityId,due.id,context.userId,amount(body.amount),clean(body.reference,100)||null,clean(body.note,500)||null,createdAt).run();
    return NextResponse.json({ok:true});
  }
  if(!canManage(context.role))return error("Bu işlem için yönetici yetkisi gerekiyor.",403);
  if(action==="addPayment"){
    const due=await db.prepare("SELECT id,resident_name,unit FROM dues WHERE id=? AND community_id=?").bind(clean(body.dueId,80),context.communityId).first<{id:string;resident_name:string;unit:string}>();if(!due)return error("Borç kaydı bulunamadı.",404);
    const methodInput=clean(body.method,20),method=methodInput==="Nakit"?"cash":methodInput==="Havale / EFT"?"transfer":methodInput==="Kart"?"card":"manual";
    await db.prepare("INSERT INTO payments (id,community_id,due_id,resident_name,unit,amount,method,reference,status,paid_at,recorded_by,created_at) VALUES (?,?,?,?,?,?,?,?, 'confirmed',?,?,?)").bind(id(),context.communityId,due.id,due.resident_name,due.unit,amount(body.amount),method,clean(body.reference,100)||null,clean(body.paidAt,20)||today(),context.userId,createdAt).run();
    return NextResponse.json({ok:true});
  }
  const transfer=await db.prepare(`SELECT t.id,t.due_id,t.amount,t.reference,t.status,d.resident_name,d.unit FROM transfer_notifications t JOIN dues d ON d.id=t.due_id WHERE t.id=? AND t.community_id=?`).bind(clean(body.id,80),context.communityId).first<{id:string;due_id:string;amount:number;reference:string|null;status:string;resident_name:string;unit:string}>();
  if(!transfer)return error("Ödeme bildirimi bulunamadı.",404);if(transfer.status!=="pending")return error("Bu bildirim daha önce sonuçlandırılmış.",409);
  const decision=clean(body.decision,20)==="approved"?"approved":"rejected",statements=[db.prepare("UPDATE transfer_notifications SET status=?,reviewed_by=?,reviewed_at=? WHERE id=? AND status='pending'").bind(decision,context.userId,createdAt,transfer.id)];
  if(decision==="approved")statements.push(db.prepare("INSERT INTO payments (id,community_id,due_id,resident_name,unit,amount,method,reference,status,paid_at,recorded_by,created_at) VALUES (?,?,?,?,?,?,'transfer',?,'confirmed',?,?,?)").bind(id(),context.communityId,transfer.due_id,transfer.resident_name,transfer.unit,transfer.amount,transfer.reference,today(),context.userId,createdAt));
  await db.batch(statements);
  return NextResponse.json({ok:true});
}
