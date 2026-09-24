import "server-only";
import { cookies } from "next/headers";
import { getD1 } from "@/db";

export type AppUser = { userId: string; email: string; displayName: string };

export const SESSION_COOKIE = "apartmanos_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 210_000;

const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const textBytes = (value: string) => new TextEncoder().encode(value);

async function digest(value: string) {
  return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", textBytes(value))));
}

export function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase("en-US").slice(0, 254);
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function hashPassword(password: string, salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))) {
  const key = await crypto.subtle.importKey("raw", textBytes(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: textBytes(salt), iterations: PASSWORD_ITERATIONS }, key, 256);
  return { hash: bytesToBase64Url(new Uint8Array(bits)), salt };
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const actual = (await hashPassword(password, salt)).hash;
  const a = textBytes(actual), b = textBytes(expected);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a[index] ^ b[index];
  return difference === 0;
}

export async function createSession(userId: string) {
  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await digest(token);
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  await getD1().prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, userId, expiresAt, new Date().toISOString()).run();
  return { token, expiresAt };
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await getD1().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await digest(token)).run();
}

export async function getSessionUser(): Promise<AppUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const now = Math.floor(Date.now() / 1000);
  const user = await getD1().prepare(`SELECT u.id AS userId, u.email, u.display_name AS displayName
    FROM sessions s JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ?`).bind(await digest(token), now).first<AppUser>();
  return user ?? null;
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function rateLimitKey(request: Request, email: string) {
  const address = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  return digest(`${address.trim()}|${email}`);
}
