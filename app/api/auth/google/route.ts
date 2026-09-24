import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";

const STATE_COOKIE = "apartmanos_google_state";
const REDIRECT_URI = "https://apartmanos.com.tr/api/auth/google/callback";

export async function GET() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google girişi henüz yapılandırılmadı." }, { status: 503 });
  }

  const state = crypto.randomUUID().replaceAll("-", "");
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizationUrl.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  authorizationUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
