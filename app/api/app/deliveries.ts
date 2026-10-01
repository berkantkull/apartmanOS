import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

type Role="owner"|"manager"|"resident"|"staff"|"security";
type Context={communityId:string;role:Role;unit:string|null;userId:string;displayName:string};
type PackageRow={id:string;resident_user_id:string|null;resident_name:string;unit_label:string;courier_company:string;tracking_number:string|null;status:string};
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const clean=(value:unknown,max=300)=>String(value??"").trim().slice(0,max);
const id=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
const canRecord=(role:Role)=>role==="owner"||role==="manager"||role==="security";

let schemaReady:Promise<void>|null=null;
export function ensureDeliverySchema(){
  schemaReady??=(async()=>{const db=getDatabase();await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS package_deliveries (
      id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
      unit_id TEXT REFERENCES property_units(id) ON DELETE SET NULL,resident_user_id TEXT REFERENCES app_users(id) ON DELETE SET NULL,
      resident_name TEXT NOT NULL,unit_label TEXT NOT NULL,courier_company TEXT NOT NULL,tracking_number TEXT,
      arrived_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'waiting',recipient_name TEXT,delivered_at TEXT,notes TEXT,
      reminder_count INTEGER NOT NULL DEFAULT 0,last_reminder_at TEXT,created_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
      created_by_name TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_package_deliveries_community ON package_deliveries(community_id,status,arrived_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_package_deliveries_resident ON package_deliveries(resident_user_id,status,arrived_at)"),
  ])})().catch(error=>{schemaReady=null;throw error});return schemaReady;
}

async function recipients(record:Pick<PackageRow,"resident_user_id"|"unit_label">,communityId:string){
  if(record.resident_user_id)return [record.resident_user_id];
  const db=getDatabase(),unitNo=record.unit_label.match(/Daire\s+(.+)$/i)?.[1]?.trim()||record.unit_label;
  const rows=await db.prepare("SELECT DISTINCT user_id FROM members WHERE community_id=? AND role='resident' AND (LOWER(COALESCE(unit,''))=LOWER(?) OR LOWER(COALESCE(unit,''))=LOWER(?))").bind(communityId,record.unit_label,unitNo).all<{user_id:string}>();
  return rows.results.map(item=>item.user_id);
}

async function notify(record:PackageRow,communityId:string,title:string,body:string,source:string){
  const db=getDatabase(),userIds=await recipients(record,communityId),createdAt=now();
  if(userIds.length)await db.batch(userIds.map(userId=>db.prepare("INSERT INTO notifications (id,community_id,user_id,title,body,kind,source_key,created_at) VALUES (?,?,?,?,?,'package',?,?)").bind(id(),communityId,userId,title,body,source,createdAt)));
  return userIds.length;
}

export async function loadDeliveries(context:Context){
  await ensureDeliverySchema();const db=getDatabase();
  const managerView=canRecord(context.role);
  const query=managerView
    ? "SELECT id,unit_id,resident_user_id,resident_name,unit_label,courier_company,tracking_number,arrived_at,status,recipient_name,delivered_at,notes,reminder_count,last_reminder_at,created_by_name,created_at,updated_at FROM package_deliveries WHERE community_id=? ORDER BY CASE WHEN status='waiting' THEN 0 ELSE 1 END,arrived_at DESC"
    : "SELECT id,unit_id,resident_user_id,resident_name,unit_label,courier_company,tracking_number,arrived_at,status,recipient_name,delivered_at,notes,reminder_count,last_reminder_at,created_by_name,created_at,updated_at FROM package_deliveries WHERE community_id=? AND (resident_user_id=? OR LOWER(unit_label)=LOWER(?)) ORDER BY CASE WHEN status='waiting' THEN 0 ELSE 1 END,arrived_at DESC";
  const result=managerView?await db.prepare(query).bind(context.communityId).all():await db.prepare(query).bind(context.communityId,context.userId,context.unit||"").all();
  return result.results;
}

export async function handleDeliveryAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["createPackageDelivery","completePackageDelivery","remindPackageDelivery"].includes(action))return null;
  await ensureDeliverySchema();if(!canRecord(context.role))return fail("Kargo işlemleri için yönetici veya güvenlik yetkisi gerekiyor.",403);
  const db=getDatabase(),createdAt=now();
  if(action==="createPackageDelivery"){
    const residentKey=clean(body.residentKey,100),unitLabelInput=clean(body.unitLabel,100),unitIdInput=clean(body.unitId,80),courier=clean(body.courierCompany,80),tracking=clean(body.trackingNumber,120),notes=clean(body.notes,1000),arrivedAt=clean(body.arrivedAt,40);
    let residentUserId:string|null=null,residentName="",residentUnit="";
    if(residentKey.startsWith("member:")){
      const member=await db.prepare("SELECT user_id,display_name,unit FROM members WHERE id=? AND community_id=? AND role='resident'").bind(residentKey.slice(7),context.communityId).first<{user_id:string;display_name:string;unit:string|null}>();
      if(!member)return fail("Seçilen sakin hesabı bulunamadı.",404);residentUserId=member.user_id;residentName=member.display_name;residentUnit=member.unit||"";
    }else if(residentKey.startsWith("resident:")){
      const resident=await db.prepare("SELECT name,unit FROM residents WHERE id=? AND community_id=?").bind(residentKey.slice(9),context.communityId).first<{name:string;unit:string}>();
      if(!resident)return fail("Seçilen sakin bulunamadı.",404);residentName=resident.name;residentUnit=resident.unit;
    }else return fail("Kargonun ait olduğu sakini seçin.");
    let unitId:string|null=null,unitLabel=unitLabelInput||residentUnit;
    if(unitIdInput){const unit=await db.prepare("SELECT u.id,u.unit_no,b.name AS block_name FROM property_units u JOIN property_blocks b ON b.id=u.block_id WHERE u.id=? AND u.community_id=?").bind(unitIdInput,context.communityId).first<{id:string;unit_no:string;block_name:string}>();if(!unit)return fail("Seçilen daire bulunamadı.",404);unitId=unit.id;unitLabel=`${unit.block_name} · Daire ${unit.unit_no}`;}
    const arrivedDate=new Date(arrivedAt);if(!unitLabel||!courier||!arrivedAt||Number.isNaN(arrivedDate.getTime()))return fail("Daire, kargo firması ve geçerli bir geliş tarihi gerekli.");
    const packageId=id();
    await db.prepare("INSERT INTO package_deliveries (id,community_id,unit_id,resident_user_id,resident_name,unit_label,courier_company,tracking_number,arrived_at,status,notes,created_by,created_by_name,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'waiting',?,?,?,?,?)").bind(packageId,context.communityId,unitId,residentUserId,residentName,unitLabel,courier,tracking||null,arrivedDate.toISOString(),notes||null,context.userId,context.displayName,createdAt,createdAt).run();
    const record={id:packageId,resident_user_id:residentUserId,resident_name:residentName,unit_label:unitLabel,courier_company:courier,tracking_number:tracking||null,status:"waiting"};
    const notified=await notify(record,context.communityId,"Kargonuz geldi",`${courier} kargonuz ${unitLabel} için teslim alınmayı bekliyor.${tracking?` Takip no: ${tracking}`:""}`,`package:${packageId}:arrived`);
    return NextResponse.json({ok:true,notified});
  }
  const packageId=clean(body.id,80),record=await db.prepare("SELECT id,resident_user_id,resident_name,unit_label,courier_company,tracking_number,status FROM package_deliveries WHERE id=? AND community_id=?").bind(packageId,context.communityId).first<PackageRow>();
  if(!record)return fail("Kargo kaydı bulunamadı.",404);if(record.status!=="waiting")return fail("Bu kargo daha önce teslim edilmiş.",409);
  if(action==="completePackageDelivery"){
    const recipientName=clean(body.recipientName,100);if(!recipientName)return fail("Teslim alan kişinin adı gerekli.");
    await db.prepare("UPDATE package_deliveries SET status='delivered',recipient_name=?,delivered_at=?,updated_at=? WHERE id=? AND community_id=?").bind(recipientName,createdAt,createdAt,packageId,context.communityId).run();
    const notified=await notify(record,context.communityId,"Kargonuz teslim edildi",`${record.courier_company} kargonuz ${recipientName} tarafından teslim alındı.`,`package:${packageId}:delivered`);
    return NextResponse.json({ok:true,notified});
  }
  await db.prepare("UPDATE package_deliveries SET reminder_count=reminder_count+1,last_reminder_at=?,updated_at=? WHERE id=? AND community_id=?").bind(createdAt,createdAt,packageId,context.communityId).run();
  const notified=await notify(record,context.communityId,"Kargonuz teslim alınmayı bekliyor",`${record.courier_company} kargonuz ${record.unit_label} için güvenlikte/yönetimde bekliyor.`,`package:${packageId}:reminder:${createdAt}`);
  return NextResponse.json({ok:true,notified});
}
