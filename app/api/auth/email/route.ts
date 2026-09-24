import { NextResponse } from "next/server";
import { createSession, destroySession, hashPassword, normalizeEmail, rateLimitKey, sameOrigin, SESSION_COOKIE, SESSION_SECONDS, validEmail, verifyPassword } from "@/app/auth";
import { getDatabase } from "@/db";

type StoredUser = { id: string; email: string; display_name: string; password_hash: string; password_salt: string };

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

function setSessionCookie(request: Request, response: NextResponse, token: string, maxAge = SESSION_SECONDS) {
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: new URL(request.url).protocol === "https:", sameSite: "lax", path: "/", maxAge });
  return response;
}

async function isBlocked(key: string) {
  const now = Math.floor(Date.now() / 1000);
  const row = await getDatabase().prepare("SELECT attempts, reset_at FROM auth_limits WHERE key = ?").bind(key).first<{attempts:number;reset_at:number}>();
  return !!row && row.reset_at > now && row.attempts >= 6;
}

async function recordFailure(key: string) {
  const now = Math.floor(Date.now() / 1000), resetAt = now + 15 * 60;
  await getDatabase().prepare(`INSERT INTO auth_limits (key, attempts, reset_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN reset_at <= ? THEN 1 ELSE attempts + 1 END,
    reset_at = CASE WHEN reset_at <= ? THEN ? ELSE reset_at END`).bind(key, resetAt, now, now, resetAt).run();
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Geçersiz istek." }, 403);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ error: "Geçersiz istek." }, 400);
  const action = clean(body.action, 20);
  const db = getDatabase();

  if (action === "logout") {
    const token = request.headers.get("cookie")?.match(/(?:^|;\s*)apartmanos_session=([^;]+)/)?.[1];
    await destroySession(token);
    return setSessionCookie(request, json({ ok: true }), "", 0);
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? "");
  if (!validEmail(email) || password.length < 8 || password.length > 128) return json({ error: "E-posta veya şifre bilgisi geçersiz." }, 400);
  const limitKey = await rateLimitKey(request, email);
  if (await isBlocked(limitKey)) return json({ error: "Çok fazla deneme yapıldı. 15 dakika sonra tekrar deneyin." }, 429);

  if (action === "register") {
    const displayName = clean(body.displayName, 80);
    const phone = clean(body.phone, 20);
    if (displayName.length < 2) return json({ error: "Ad soyad en az 2 karakter olmalı." }, 400);
    if (phone.replace(/\D/g, "").length < 10) return json({ error: "Geçerli bir telefon numarası girin." }, 400);
    const exists = await db.prepare("SELECT id FROM app_users WHERE email = ?").bind(email).first();
    if (exists) return json({ error: "Bu e-posta adresiyle daha önce hesap açılmış." }, 409);
    const userId = crypto.randomUUID();
    const credentials = await hashPassword(password);
    await db.prepare("INSERT INTO app_users (id, email, display_name, phone, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(userId, email, displayName, phone, credentials.hash, credentials.salt, new Date().toISOString()).run();
    const session = await createSession(userId);
    return setSessionCookie(request, json({ ok: true }, 201), session.token);
  }

  if (action === "login") {
    const user = await db.prepare("SELECT id, email, display_name, password_hash, password_salt FROM app_users WHERE email = ?").bind(email).first<StoredUser>();
    if (!user || !(await verifyPassword(password, user.password_salt, user.password_hash))) {
      await recordFailure(limitKey);
      return json({ error: "E-posta veya şifre hatalı." }, 401);
    }
    await db.prepare("DELETE FROM auth_limits WHERE key = ?").bind(limitKey).run();
    const session = await createSession(user.id);
    return setSessionCookie(request, json({ ok: true }), session.token);
  }

  return json({ error: "Bilinmeyen işlem." }, 400);
}
