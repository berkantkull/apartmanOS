import Constants from "expo-constants";
import type { AppData, AuthPayload } from "./types";

const configuredUrl = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiBaseUrl;
export const API_URL = String(configuredUrl || "https://apartmanos.com.tr").replace(/\/$/, "");

type JsonRecord = Record<string, unknown>;

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: T & { error?: string };
  try {
    body = (text ? JSON.parse(text) : {}) as T & { error?: string };
  } catch {
    throw new Error("Sunucudan geçerli bir yanıt alınamadı.");
  }
  if (!response.ok) throw new Error(body.error || "İşlem tamamlanamadı.");
  return body;
}

export async function authenticate(action: "login" | "register", payload: AuthPayload) {
  const response = await fetch(`${API_URL}/api/auth/email`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, client: "mobile", ...payload }),
  });
  return readJson<{ ok: true; sessionToken: string; expiresAt: number }>(response);
}

export async function fetchAppData(token: string, communityId = "") {
  const suffix = communityId ? `?communityId=${encodeURIComponent(communityId)}` : "";
  const response = await fetch(`${API_URL}/api/app${suffix}`, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json" },
  });
  return readJson<AppData>(response);
}

export async function appAction(token: string, payload: JsonRecord, communityId = "") {
  const response = await fetch(`${API_URL}/api/app`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ ...payload, communityId }),
  });
  return readJson<{ ok: true; communityId?: string } & JsonRecord>(response);
}

export async function revokeSession(token: string) {
  await fetch(`${API_URL}/api/auth/email`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ action: "logout", client: "mobile" }),
  }).catch(() => undefined);
}
