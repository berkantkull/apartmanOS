import { NextResponse } from "next/server";
import { getSessionUser, sameOrigin } from "@/app/auth";
import { getDatabase } from "@/db";

type Role = "owner" | "manager" | "resident";
type Membership = { community_id: string; role: Role };

const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });
const clean = (value: unknown, max = 200) => String(value ?? "").trim().slice(0, max);
const number = (value: unknown, min = 0, max = 1_000_000) => Math.min(max, Math.max(min, Math.round(Number(value) || 0)));
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const inviteCode = () => Array.from(crypto.getRandomValues(new Uint8Array(7)), n => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[n % 32]).join("");

async function context() {
  const user = await getSessionUser();
  if (!user) return { user: null, membership: null };
  const membership = await getDatabase().prepare(
    "SELECT community_id, role FROM members WHERE user_id = ? ORDER BY joined_at LIMIT 1"
  ).bind(user.userId).first<Membership>();
  return { user, membership };
}

function canManage(role: Role) { return role === "owner" || role === "manager"; }

export async function GET() {
  const { user, membership } = await context();
  if (!user) return fail("Oturum açmanız gerekiyor.", 401);
  if (!membership) return NextResponse.json({ user, membership: null });

  const db = getDatabase();
  const communityId = membership.community_id;
  const managerView = canManage(membership.role);
  const communityQuery = managerView
    ? "SELECT id, name, block_count, unit_count, monthly_due, period, invite_code FROM communities WHERE id = ?"
    : "SELECT id, name, block_count, unit_count, monthly_due, period, '' AS invite_code FROM communities WHERE id = ?";
  const memberQuery = membership.role === "owner"
    ? "SELECT id, display_name, email, role, unit, joined_at FROM members WHERE community_id = ? ORDER BY joined_at"
    : "SELECT id, display_name, '' AS email, role, unit, joined_at FROM members WHERE community_id = ? ORDER BY joined_at";
  const residentQuery = managerView
    ? "SELECT id, name, unit, phone, occupancy, created_at FROM residents WHERE community_id = ? ORDER BY unit, name"
    : "SELECT id, name, unit, NULL AS phone, occupancy, created_at FROM residents WHERE community_id = ? ORDER BY unit, name";
  const [community, members, residents, dues, expenses, announcements, decisions] = await Promise.all([
    db.prepare(communityQuery).bind(communityId).first(),
    db.prepare(memberQuery).bind(communityId).all(),
    db.prepare(residentQuery).bind(communityId).all(),
    db.prepare("SELECT id, resident_name, unit, amount, status, due_date, created_at FROM dues WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id, title, category, amount, note, expense_date, created_at FROM expenses WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id, title, body, kind, created_at FROM announcements WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
    db.prepare("SELECT id, title, body, decision_no, created_at FROM decisions WHERE community_id = ? ORDER BY created_at DESC").bind(communityId).all(),
  ]);
  if (!community) return fail("Apartman kaydı bulunamadı.", 404);
  const manualResidents = residents.results.map(resident => ({ ...resident, source: "manual" as const }));
  const accountResidents = members.results
    .filter(member => member.role === "resident")
    .filter(member => !manualResidents.some(resident =>
      String(resident.name).toLocaleLowerCase("tr") === String(member.display_name).toLocaleLowerCase("tr")
      && String(resident.unit ?? "") === String(member.unit ?? "")
    ))
    .map(member => ({
      id: `member:${member.id}`,
      name: member.display_name,
      unit: member.unit || "Belirtilmedi",
      phone: null,
      occupancy: "Kayıtlı kullanıcı",
      created_at: member.joined_at,
      source: "member" as const,
    }));
  const visibleResidents = [...manualResidents, ...accountResidents]
    .sort((left, right) => String(left.unit).localeCompare(String(right.unit), "tr", { numeric: true }));

  return NextResponse.json({ user, membership, community, members: members.results, residents: visibleResidents, dues: dues.results, expenses: expenses.results, announcements: announcements.results, decisions: decisions.results });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Geçersiz istek.", 403);
  const { user, membership } = await context();
  if (!user) return fail("Oturum açmanız gerekiyor.", 401);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return fail("Geçersiz istek.");
  const action = clean(body.action, 40);
  const db = getDatabase();

  if (action === "createCommunity") {
    if (membership) return fail("Zaten bir yönetim alanına bağlısınız.", 409);
    const name = clean(body.name, 100);
    if (!name) return fail("Apartman veya site adı gerekli.");
    const communityId = id();
    const memberId = id();
    const createdAt = now();
    const code = inviteCode();
    await db.batch([
      db.prepare("INSERT INTO communities (id, name, block_count, unit_count, monthly_due, period, invite_code, owner_user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(communityId, name, number(body.blockCount, 1, 50), number(body.unitCount, 1, 2000), number(body.monthlyDue, 0, 10_000_000), clean(body.period, 30) || String(new Date().getFullYear()), code, user.userId, createdAt),
      db.prepare("INSERT INTO members (id, community_id, user_id, email, display_name, role, unit, joined_at) VALUES (?, ?, ?, ?, ?, 'owner', NULL, ?)").bind(memberId, communityId, user.userId, user.email, user.displayName, createdAt),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (action === "joinCommunity") {
    if (membership) return fail("Zaten bir yönetim alanına bağlısınız.", 409);
    const code = clean(body.code, 20).toUpperCase();
    const community = await db.prepare("SELECT id FROM communities WHERE invite_code = ?").bind(code).first<{ id: string }>();
    if (!community) return fail("Davet kodu geçersiz veya süresi dolmuş.", 404);
    await db.prepare("INSERT INTO members (id, community_id, user_id, email, display_name, role, unit, joined_at) VALUES (?, ?, ?, ?, ?, 'resident', ?, ?)")
      .bind(id(), community.id, user.userId, user.email, user.displayName, clean(body.unit, 60) || null, now()).run();
    return NextResponse.json({ ok: true });
  }

  if (!membership) return fail("Önce bir apartman oluşturun veya davet koduyla katılın.", 403);
  const communityId = membership.community_id;
  const role = membership.role;

  if (action === "updateMemberRole") {
    if (role !== "owner") return fail("Bu işlem yalnızca yönetim sahibine açık.", 403);
    const nextRole = clean(body.role, 20);
    if (!['manager', 'resident'].includes(nextRole)) return fail("Geçersiz rol.");
    await db.prepare("UPDATE members SET role = ? WHERE id = ? AND community_id = ? AND role != 'owner'").bind(nextRole, clean(body.id, 80), communityId).run();
    return NextResponse.json({ ok: true });
  }

  if (!canManage(role)) return fail("Bu işlem için yönetici yetkisi gerekiyor.", 403);
  const createdAt = now();

  if (action === "addResident") {
    const name = clean(body.name, 100), unit = clean(body.unit, 60);
    if (!name || !unit) return fail("Ad soyad ve daire gerekli.");
    await db.prepare("INSERT INTO residents (id, community_id, name, unit, phone, occupancy, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id(), communityId, name, unit, clean(body.phone, 30) || null, clean(body.occupancy, 30) || 'Ev sahibi', createdAt).run();
  } else if (action === "addDue") {
    const name = clean(body.residentName, 100), unit = clean(body.unit, 60), dueDate = clean(body.dueDate, 20);
    if (!name || !unit || !dueDate) return fail("Sakin, daire ve son ödeme tarihi gerekli.");
    await db.prepare("INSERT INTO dues (id, community_id, resident_name, unit, amount, status, due_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)").bind(id(), communityId, name, unit, number(body.amount, 1, 10_000_000), dueDate, user.userId, createdAt).run();
  } else if (action === "addExpense") {
    const title = clean(body.title, 140);
    if (!title) return fail("Gider açıklaması gerekli.");
    await db.prepare("INSERT INTO expenses (id, community_id, title, category, amount, note, expense_date, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id(), communityId, title, clean(body.category, 40) || 'Diğer', number(body.amount, 1, 10_000_000), clean(body.note, 1000) || null, clean(body.expenseDate, 20) || createdAt.slice(0,10), user.userId, createdAt).run();
  } else if (action === "addAnnouncement") {
    const title = clean(body.title, 140), text = clean(body.body, 3000);
    if (!title || !text) return fail("Başlık ve açıklama gerekli.");
    await db.prepare("INSERT INTO announcements (id, community_id, title, body, kind, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id(), communityId, title, text, clean(body.kind, 40) || 'Bilgilendirme', user.userId, createdAt).run();
  } else if (action === "addDecision") {
    const title = clean(body.title, 140), text = clean(body.body, 4000), decisionNo = clean(body.decisionNo, 40);
    if (!title || !text || !decisionNo) return fail("Karar başlığı, metni ve numarası gerekli.");
    await db.prepare("INSERT INTO decisions (id, community_id, title, body, decision_no, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(id(), communityId, title, text, decisionNo, user.userId, createdAt).run();
  } else if (action === "toggleDue") {
    const record = await db.prepare("SELECT status FROM dues WHERE id = ? AND community_id = ?").bind(clean(body.id, 80), communityId).first<{status:string}>();
    if (!record) return fail("Aidat kaydı bulunamadı.", 404);
    await db.prepare("UPDATE dues SET status = ? WHERE id = ? AND community_id = ?").bind(record.status === 'paid' ? 'pending' : 'paid', clean(body.id, 80), communityId).run();
  } else if (action === "updateCommunity") {
    const name = clean(body.name, 100); if (!name) return fail("Apartman adı gerekli.");
    await db.prepare("UPDATE communities SET name = ?, block_count = ?, unit_count = ?, monthly_due = ?, period = ? WHERE id = ?").bind(name, number(body.blockCount,1,50), number(body.unitCount,1,2000), number(body.monthlyDue,0,10_000_000), clean(body.period,30), communityId).run();
  } else if (action === "regenerateInvite") {
    if (role !== 'owner') return fail("Yeni davet kodunu yalnızca yönetim sahibi oluşturabilir.", 403);
    await db.prepare("UPDATE communities SET invite_code = ? WHERE id = ?").bind(inviteCode(), communityId).run();
  } else if (action === "delete") {
    const tables: Record<string,string> = { residents:'residents', dues:'dues', expenses:'expenses', announcements:'announcements', decisions:'decisions' };
    const table = tables[clean(body.type,30)]; if (!table) return fail("Geçersiz kayıt türü.");
    await db.prepare(`DELETE FROM ${table} WHERE id = ? AND community_id = ?`).bind(clean(body.id,80), communityId).run();
  } else return fail("Bilinmeyen işlem.");

  return NextResponse.json({ ok: true });
}
