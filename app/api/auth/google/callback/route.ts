import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, SESSION_SECONDS } from "@/app/auth";
import { getDatabase } from "@/db";

const STATE_COOKIE = "apartmanos_google_state";
const INVITE_COOKIE = "apartmanos_google_invite";
const REDIRECT_URI = "https://apartmanos.com.tr/api/auth/google/callback";
const LOGIN_URL = "https://apartmanos.com.tr/giris";

type GoogleProfile = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string;
  name?: string;
};

function failed(reason: string) {
  const url = new URL(LOGIN_URL);
  url.searchParams.set("google_error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return failed("configuration");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers.get("cookie")?.match(/(?:^|;\s*)apartmanos_google_state=([^;]+)/)?.[1];
  if (!code || !state || !cookieState || state !== cookieState) return failed("state");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const token = await tokenResponse.json().catch(() => null) as { id_token?: string } | null;
  if (!tokenResponse.ok || !token?.id_token) return failed("token");

  const profileResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token.id_token)}`);
  const profile = await profileResponse.json().catch(() => null) as GoogleProfile | null;
  if (!profileResponse.ok || !profile?.sub || !profile.email || profile.email_verified !== "true" || profile.aud !== env.GOOGLE_CLIENT_ID) {
    return failed("profile");
  }

  const db = getDatabase();
  const email = profile.email.toLocaleLowerCase("en-US").slice(0, 254);
  const existing = await db.prepare("SELECT id, google_sub FROM app_users WHERE email = ?").bind(email).first<{ id: string; google_sub: string | null }>();
  let userId = existing?.id;

  if (existing) {
    if (existing.google_sub && existing.google_sub !== profile.sub) return failed("account");
    await db.prepare("UPDATE app_users SET google_sub = ?, display_name = ?, email_verified = 1 WHERE id = ?")
      .bind(profile.sub, String(profile.name || email.split("@")[0]).slice(0, 80), existing.id).run();
  } else {
    userId = crypto.randomUUID();
    await db.prepare("INSERT INTO app_users (id, email, display_name, password_hash, password_salt, google_sub, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)")
      .bind(userId, email, String(profile.name || email.split("@")[0]).slice(0, 80), "google-oauth", "google-oauth", profile.sub, new Date().toISOString()).run();
  }

  const session = await createSession(userId!);
  const invite = request.headers.get("cookie")?.match(/(?:^|;\s*)apartmanos_google_invite=([^;]+)/)?.[1];
  const redirectUrl = new URL(LOGIN_URL);
  if (invite) redirectUrl.searchParams.set("davet", decodeURIComponent(invite));
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  response.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set(INVITE_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
