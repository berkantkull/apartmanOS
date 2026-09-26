import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

type Role="owner"|"manager"|"resident";
type Context={communityId:string;role:Role;userId:string};
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const clean=(value:unknown,max=200)=>String(value??"").trim().slice(0,max);
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();
const canManage=(role:Role)=>role==="owner"||role==="manager";
const amount=(value:unknown)=>Math.min(10_000_000,Math.max(0,Math.round(Number(value)||0)));
const defaultCategories=["Elektrik","Su","Doğalgaz","Temizlik","Asansör","Bakım ve Onarım","Personel Maaşları","Sigorta","Diğer Ortak Alan"];

let schemaReady:Promise<void>|null=null;
export function ensureFinanceSchema(){
  schemaReady??=(async()=>{
    const db=getDatabase(),statements=[
      "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS account TEXT NOT NULL DEFAULT 'cash'",
      "ALTER TABLE expenses ADD COLUMN IF NOT EXISTS attachment_id TEXT",
      `CREATE TABLE IF NOT EXISTS incomes (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        title TEXT NOT NULL, category TEXT NOT NULL, amount INTEGER NOT NULL, account TEXT NOT NULL DEFAULT 'cash',
        note TEXT, income_date TEXT NOT NULL, attachment_id TEXT, created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS finance_categories (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        name TEXT NOT NULL, kind TEXT NOT NULL DEFAULT 'expense', created_at TEXT NOT NULL,
        UNIQUE (community_id,name,kind))`,
      `CREATE TABLE IF NOT EXISTS finance_attachments (
        id TEXT PRIMARY KEY, community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
        object_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, content_type TEXT NOT NULL, size INTEGER NOT NULL,
        uploaded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT, created_at TEXT NOT NULL)`,
      "CREATE INDEX IF NOT EXISTS idx_incomes_community ON incomes(community_id,income_date)",
      "CREATE INDEX IF NOT EXISTS idx_finance_categories_community ON finance_categories(community_id,kind)",
      "CREATE INDEX IF NOT EXISTS idx_finance_attachments_community ON finance_attachments(community_id)",
    ];
    await db.batch(statements.map(statement=>db.prepare(statement)));
  })().catch(error=>{schemaReady=null;throw error});
  return schemaReady;
}

async function seedCategories(communityId:string){
  const db=getDatabase(),createdAt=now();
  await db.batch(defaultCategories.map(name=>db.prepare("INSERT INTO finance_categories (id,community_id,name,kind,created_at) VALUES (?,?,?,'expense',?) ON CONFLICT (community_id,name,kind) DO NOTHING").bind(id(),communityId,name,createdAt)));
}

export async function loadFinanceData(context:Context){
  await ensureFinanceSchema();await seedCategories(context.communityId);const db=getDatabase();
  const [expenses,incomes,categories]=await Promise.all([
    db.prepare(`SELECT e.id,e.title,e.category,e.amount,e.note,e.account,e.expense_date,e.attachment_id,e.created_at,
      f.file_name,f.content_type,f.size FROM expenses e LEFT JOIN finance_attachments f ON f.id=e.attachment_id
      WHERE e.community_id=? ORDER BY e.expense_date DESC,e.created_at DESC`).bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare(`SELECT i.id,i.title,i.category,i.amount,i.note,i.account,i.income_date,i.attachment_id,i.created_at,
      f.file_name,f.content_type,f.size FROM incomes i LEFT JOIN finance_attachments f ON f.id=i.attachment_id
      WHERE i.community_id=? ORDER BY i.income_date DESC,i.created_at DESC`).bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT id,name,kind,created_at FROM finance_categories WHERE community_id=? ORDER BY name").bind(context.communityId).all(),
  ]);
  const withAttachment=(row:Record<string,unknown>)=>({...row,amount:Number(row.amount||0),attachment:row.attachment_id?{id:row.attachment_id,file_name:row.file_name,content_type:row.content_type,size:Number(row.size||0),url:`/api/finance-files?id=${encodeURIComponent(String(row.attachment_id))}`}:null});
  return {expenses:expenses.results.map(withAttachment),incomes:incomes.results.map(withAttachment),categories:categories.results};
}

export async function handleFinanceAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["addExpense","addIncome","addFinanceCategory"].includes(action))return null;
  await ensureFinanceSchema();if(!canManage(context.role))return fail("Bu işlem için yönetici yetkisi gerekiyor.",403);const db=getDatabase();
  if(action==="addFinanceCategory"){
    const name=clean(body.name,60);if(!name)return fail("Kategori adı gerekli.");
    await db.prepare("INSERT INTO finance_categories (id,community_id,name,kind,created_at) VALUES (?,?,?,'expense',?) ON CONFLICT (community_id,name,kind) DO NOTHING").bind(id(),context.communityId,name,now()).run();return NextResponse.json({ok:true});
  }
  const title=clean(body.title,140),recordAmount=amount(body.amount),account=clean(body.account,20)==="Banka"?"bank":"cash",note=clean(body.note,1500)||null,attachmentId=clean(body.attachmentId,80)||null;
  if(!title||!recordAmount)return fail("Açıklama ve tutar gerekli.");
  if(attachmentId){const attachment=await db.prepare("SELECT id FROM finance_attachments WHERE id=? AND community_id=?").bind(attachmentId,context.communityId).first();if(!attachment)return fail("Belge eki bulunamadı.",404)}
  if(action==="addIncome"){
    await db.prepare("INSERT INTO incomes (id,community_id,title,category,amount,account,note,income_date,attachment_id,created_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id(),context.communityId,title,clean(body.category,60)||"Diğer Gelir",recordAmount,account,note,clean(body.recordDate,20)||now().slice(0,10),attachmentId,context.userId,now()).run();
  }else{
    await db.prepare("INSERT INTO expenses (id,community_id,title,category,amount,note,expense_date,created_by,created_at,account,attachment_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(id(),context.communityId,title,clean(body.category,60)||"Diğer Ortak Alan",recordAmount,note,clean(body.recordDate,20)||now().slice(0,10),context.userId,now(),account,attachmentId).run();
  }
  return NextResponse.json({ok:true});
}
