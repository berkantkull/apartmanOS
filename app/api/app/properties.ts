import { NextResponse } from "next/server";
import { getDatabase } from "@/db";

export type AppRole="owner"|"manager"|"resident"|"staff"|"security";
type Context={communityId:string;role:AppRole;unit:string|null;userId:string;displayName:string};
const fail=(message:string,status=400)=>NextResponse.json({error:message},{status});
const clean=(value:unknown,max=300)=>String(value??"").trim().slice(0,max);
const integer=(value:unknown,min=0,max=10_000)=>Math.min(max,Math.max(min,Math.round(Number(value)||0)));
const id=()=>crypto.randomUUID(),now=()=>new Date().toISOString();
const canManage=(role:AppRole)=>role==="owner"||role==="manager";
const canGate=(role:AppRole)=>canManage(role)||role==="security";
export const unitLabel=(block:string,unitNo:string)=>`${block} · Daire ${unitNo}`;

let schemaReady:Promise<void>|null=null;
export function ensurePropertySchema(){
  schemaReady??=(async()=>{const db=getDatabase();await db.batch([
    db.prepare("ALTER TABLE members DROP CONSTRAINT IF EXISTS members_role_check"),
    db.prepare(`CREATE TABLE IF NOT EXISTS property_blocks (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,name TEXT NOT NULL,floor_count INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,UNIQUE(community_id,name))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS property_units (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,block_id TEXT NOT NULL REFERENCES property_blocks(id) ON DELETE CASCADE,unit_no TEXT NOT NULL,floor TEXT,owner_name TEXT,owner_phone TEXT,owner_email TEXT,tenant_name TEXT,tenant_phone TEXT,tenant_email TEXT,resident_count INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,UNIQUE(community_id,block_id,unit_no))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS unit_documents (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,unit_id TEXT NOT NULL REFERENCES property_units(id) ON DELETE CASCADE,object_key TEXT NOT NULL UNIQUE,file_name TEXT NOT NULL,content_type TEXT NOT NULL,size INTEGER NOT NULL,uploaded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS parking_spots (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,code TEXT NOT NULL,location TEXT,unit_id TEXT REFERENCES property_units(id) ON DELETE SET NULL,status TEXT NOT NULL DEFAULT 'available',created_at TEXT NOT NULL,UNIQUE(community_id,code))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS vehicles (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,unit_id TEXT REFERENCES property_units(id) ON DELETE SET NULL,parking_spot_id TEXT REFERENCES parking_spots(id) ON DELETE SET NULL,plate TEXT NOT NULL,brand_model TEXT,color TEXT,owner_name TEXT NOT NULL,vehicle_type TEXT NOT NULL DEFAULT 'resident',qr_token TEXT NOT NULL UNIQUE,valid_until TEXT,inside INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,UNIQUE(community_id,plate))`),
    db.prepare(`CREATE TABLE IF NOT EXISTS vehicle_events (id TEXT PRIMARY KEY,community_id TEXT NOT NULL REFERENCES communities(id) ON DELETE CASCADE,vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,event_type TEXT NOT NULL,gate_name TEXT,occurred_at TEXT NOT NULL,recorded_by TEXT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,recorded_by_name TEXT NOT NULL)`),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_property_blocks_community ON property_blocks(community_id,name)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_property_units_community ON property_units(community_id,block_id,unit_no)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_unit_documents_unit ON unit_documents(unit_id,created_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_parking_spots_community ON parking_spots(community_id,status)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_vehicles_community ON vehicles(community_id,plate)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_vehicle_events_community ON vehicle_events(community_id,occurred_at)"),
  ])})().catch(error=>{schemaReady=null;throw error});return schemaReady;
}

type UnitRow={id:string;community_id:string;block_id:string;block_name:string;unit_no:string;floor:string|null;owner_name:string|null;owner_phone:string|null;owner_email:string|null;tenant_name:string|null;tenant_phone:string|null;tenant_email:string|null;resident_count:number;created_at:string;updated_at:string};
export async function loadPropertyData(context:Context){
  await ensurePropertySchema();const db=getDatabase(),[blocksResult,unitsResult,documentsResult,spotsResult,vehiclesResult,eventsResult,duesResult,paymentsResult]=await Promise.all([
    db.prepare("SELECT id,name,floor_count,created_at FROM property_blocks WHERE community_id=? ORDER BY name").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT u.*,b.name AS block_name FROM property_units u JOIN property_blocks b ON b.id=u.block_id WHERE u.community_id=? ORDER BY b.name,u.unit_no").bind(context.communityId).all<UnitRow>(),
    db.prepare("SELECT id,unit_id,file_name,content_type,size,created_at FROM unit_documents WHERE community_id=? ORDER BY created_at DESC").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT p.*,u.unit_no,b.name AS block_name FROM parking_spots p LEFT JOIN property_units u ON u.id=p.unit_id LEFT JOIN property_blocks b ON b.id=u.block_id WHERE p.community_id=? ORDER BY p.code").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT v.*,u.unit_no,b.name AS block_name,p.code AS parking_code FROM vehicles v LEFT JOIN property_units u ON u.id=v.unit_id LEFT JOIN property_blocks b ON b.id=u.block_id LEFT JOIN parking_spots p ON p.id=v.parking_spot_id WHERE v.community_id=? AND v.active=1 ORDER BY v.vehicle_type,v.plate").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT e.*,v.plate FROM vehicle_events e JOIN vehicles v ON v.id=e.vehicle_id WHERE e.community_id=? ORDER BY e.occurred_at DESC LIMIT 100").bind(context.communityId).all<Record<string,unknown>>(),
    db.prepare("SELECT unit,SUM(CASE WHEN status!='paid' THEN amount+interest_amount ELSE 0 END) AS debt FROM dues WHERE community_id=? GROUP BY unit").bind(context.communityId).all<{unit:string;debt:number}>(),
    db.prepare("SELECT p.id,p.unit,p.resident_name,p.amount,p.method,p.reference,p.paid_at FROM payments p WHERE p.community_id=? AND p.status='confirmed' ORDER BY p.paid_at DESC").bind(context.communityId).all<Record<string,unknown>>(),
  ]);
  const managerView=canManage(context.role)||context.role==="staff",securityView=context.role==="security";
  const visibleUnits=managerView||securityView?unitsResult.results:unitsResult.results.filter(unit=>{const label=unitLabel(unit.block_name,unit.unit_no).toLocaleLowerCase('tr');return label===String(context.unit||'').toLocaleLowerCase('tr')||unit.unit_no.toLocaleLowerCase('tr')===String(context.unit||'').toLocaleLowerCase('tr')});
  const unitIds=new Set(visibleUnits.map(unit=>unit.id)),labels=new Map(visibleUnits.map(unit=>[unit.id,unitLabel(unit.block_name,unit.unit_no)]));
  const units=visibleUnits.map(unit=>{const label=labels.get(unit.id)||unit.unit_no,debt=duesResult.results.find(item=>item.unit===label||item.unit===unit.unit_no)?.debt||0,documents=documentsResult.results.filter(item=>item.unit_id===unit.id).map(item=>({...item,url:`/api/property-files?id=${encodeURIComponent(String(item.id))}`})),history=paymentsResult.results.filter(item=>item.unit===label||item.unit===unit.unit_no).slice(0,20);return {...unit,...(securityView?{owner_name:null,owner_phone:null,owner_email:null,tenant_name:null,tenant_phone:null,tenant_email:null}:{}),label,debt:Number(debt),documents,payment_history:history}});
  const vehicles=vehiclesResult.results.filter(vehicle=>managerView||securityView||unitIds.has(String(vehicle.unit_id))),spots=spotsResult.results.filter(spot=>managerView||securityView||!spot.unit_id||unitIds.has(String(spot.unit_id))),events=eventsResult.results.filter(event=>managerView||securityView||vehicles.some(vehicle=>vehicle.id===event.vehicle_id));
  return {blocks:managerView?blocksResult.results:blocksResult.results.filter(block=>visibleUnits.some(unit=>unit.block_id===block.id)),units,parkingSpots:spots,vehicles,vehicleEvents:events};
}

async function getUnit(db:ReturnType<typeof getDatabase>,communityId:string,unitId:string){return db.prepare("SELECT u.id,u.unit_no,b.name AS block_name FROM property_units u JOIN property_blocks b ON b.id=u.block_id WHERE u.id=? AND u.community_id=?").bind(unitId,communityId).first<{id:string;unit_no:string;block_name:string}>()}
function qrToken(){return Array.from(crypto.getRandomValues(new Uint8Array(18)),byte=>byte.toString(16).padStart(2,"0")).join("")}

export async function handlePropertyAction(action:string,body:Record<string,unknown>,context:Context){
  if(!["createBlock","createUnit","updateUnit","createParkingSpot","assignParkingSpot","addVehicle","recordVehicleEvent","deactivateVehicle","refreshPropertyData"].includes(action))return null;await ensurePropertySchema();const db=getDatabase(),createdAt=now();if(action==="refreshPropertyData")return NextResponse.json({ok:true});
  if(action==="recordVehicleEvent"){
    if(!canGate(context.role))return fail("Araç giriş ve çıkış kaydı için güvenlik veya yönetici yetkisi gerekiyor.",403);const vehicleId=clean(body.vehicleId,80),eventType=clean(body.eventType,20)==="exit"?"exit":"entry",vehicle=await db.prepare("SELECT id,plate FROM vehicles WHERE id=? AND community_id=? AND active=1").bind(vehicleId,context.communityId).first<{id:string;plate:string}>();if(!vehicle)return fail("Araç bulunamadı.",404);await db.batch([db.prepare("INSERT INTO vehicle_events (id,community_id,vehicle_id,event_type,gate_name,occurred_at,recorded_by,recorded_by_name) VALUES (?,?,?,?,?,?,?,?)").bind(id(),context.communityId,vehicleId,eventType,clean(body.gateName,80)||"Ana giriş",createdAt,context.userId,context.displayName),db.prepare("UPDATE vehicles SET inside=? WHERE id=? AND community_id=?").bind(eventType==="entry"?1:0,vehicleId,context.communityId)]);return NextResponse.json({ok:true});
  }
  if(action==="addVehicle"){
    const unitId=clean(body.unitId,80)||null,unit=unitId?await getUnit(db,context.communityId,unitId):null,ownUnit=unit&&[unitLabel(unit.block_name,unit.unit_no),unit.unit_no].some(value=>value.toLocaleLowerCase('tr')===String(context.unit||'').toLocaleLowerCase('tr'));if(!canManage(context.role)&&context.role!=="security"&&!(context.role==="resident"&&ownUnit))return fail("Bu daireye araç ekleme yetkiniz yok.",403);const plate=clean(body.plate,20).toLocaleUpperCase('tr').replace(/\s+/g," "),ownerName=clean(body.ownerName,100),vehicleType=clean(body.vehicleType,20)==="guest"?"guest":"resident",parkingSpotInput=clean(body.parkingSpotId,80),parkingSpotId=parkingSpotInput&&parkingSpotInput!=="none"?parkingSpotInput:null;if(!plate||!ownerName)return fail("Plaka ve araç sahibi gerekli.");if(parkingSpotId&&!await db.prepare("SELECT id FROM parking_spots WHERE id=? AND community_id=?").bind(parkingSpotId,context.communityId).first())return fail("Otopark alanı bulunamadı.",404);await db.prepare("INSERT INTO vehicles (id,community_id,unit_id,parking_spot_id,plate,brand_model,color,owner_name,vehicle_type,qr_token,valid_until,inside,active,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,1,?)").bind(id(),context.communityId,unitId,parkingSpotId,plate,clean(body.brandModel,100)||null,clean(body.color,40)||null,ownerName,vehicleType,qrToken(),clean(body.validUntil,30)||null,createdAt).run();return NextResponse.json({ok:true});
  }
  if(!canManage(context.role))return fail("Bu işlem için yönetici yetkisi gerekiyor.",403);
  if(action==="createBlock"){
    const name=clean(body.name,60);if(!name)return fail("Blok adı gerekli.");await db.prepare("INSERT INTO property_blocks (id,community_id,name,floor_count,created_at) VALUES (?,?,?,?,?)").bind(id(),context.communityId,name,integer(body.floorCount,1,100),createdAt).run();return NextResponse.json({ok:true});
  }
  if(action==="createUnit"){
    const blockId=clean(body.blockId,80),unitNo=clean(body.unitNo,30);if(!blockId||!unitNo)return fail("Blok ve daire numarası gerekli.");if(!await db.prepare("SELECT id FROM property_blocks WHERE id=? AND community_id=?").bind(blockId,context.communityId).first())return fail("Blok bulunamadı.",404);await db.prepare("INSERT INTO property_units (id,community_id,block_id,unit_no,floor,owner_name,owner_phone,owner_email,tenant_name,tenant_phone,tenant_email,resident_count,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id(),context.communityId,blockId,unitNo,clean(body.floor,30)||null,clean(body.ownerName,100)||null,clean(body.ownerPhone,30)||null,clean(body.ownerEmail,160)||null,clean(body.tenantName,100)||null,clean(body.tenantPhone,30)||null,clean(body.tenantEmail,160)||null,integer(body.residentCount,0,100),createdAt,createdAt).run();return NextResponse.json({ok:true});
  }
  if(action==="updateUnit"){
    const unitId=clean(body.unitId,80);if(!await getUnit(db,context.communityId,unitId))return fail("Daire bulunamadı.",404);await db.prepare("UPDATE property_units SET floor=?,owner_name=?,owner_phone=?,owner_email=?,tenant_name=?,tenant_phone=?,tenant_email=?,resident_count=?,updated_at=? WHERE id=? AND community_id=?").bind(clean(body.floor,30)||null,clean(body.ownerName,100)||null,clean(body.ownerPhone,30)||null,clean(body.ownerEmail,160)||null,clean(body.tenantName,100)||null,clean(body.tenantPhone,30)||null,clean(body.tenantEmail,160)||null,integer(body.residentCount,0,100),createdAt,unitId,context.communityId).run();return NextResponse.json({ok:true});
  }
  if(action==="createParkingSpot"){
    const code=clean(body.code,40);if(!code)return fail("Otopark numarası gerekli.");await db.prepare("INSERT INTO parking_spots (id,community_id,code,location,status,created_at) VALUES (?,?,?,?, 'available',?)").bind(id(),context.communityId,code,clean(body.location,100)||null,createdAt).run();return NextResponse.json({ok:true});
  }
  if(action==="assignParkingSpot"){
    const spotId=clean(body.spotId,80),unitId=clean(body.unitId,80)||null;if(unitId&&!await getUnit(db,context.communityId,unitId))return fail("Daire bulunamadı.",404);if(!await db.prepare("SELECT id FROM parking_spots WHERE id=? AND community_id=?").bind(spotId,context.communityId).first())return fail("Otopark alanı bulunamadı.",404);await db.prepare("UPDATE parking_spots SET unit_id=?,status=? WHERE id=? AND community_id=?").bind(unitId,unitId?"assigned":"available",spotId,context.communityId).run();return NextResponse.json({ok:true});
  }
  const vehicleId=clean(body.vehicleId,80);await db.prepare("UPDATE vehicles SET active=0,inside=0 WHERE id=? AND community_id=?").bind(vehicleId,context.communityId).run();return NextResponse.json({ok:true});
}
