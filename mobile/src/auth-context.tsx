import * as SecureStore from "expo-secure-store";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { appAction, authenticate, fetchAppData, revokeSession } from "./api";
import type { AppData, AuthPayload } from "./types";

const TOKEN_KEY = "apartmanos.mobile.session";

const sessionStorage = {
  get: () => Platform.OS === "web" ? Promise.resolve(globalThis.localStorage?.getItem(TOKEN_KEY) || null) : SecureStore.getItemAsync(TOKEN_KEY),
  set: (value: string) => Platform.OS === "web" ? Promise.resolve(globalThis.localStorage?.setItem(TOKEN_KEY, value)) : SecureStore.setItemAsync(TOKEN_KEY, value),
  remove: () => Platform.OS === "web" ? Promise.resolve(globalThis.localStorage?.removeItem(TOKEN_KEY)) : SecureStore.deleteItemAsync(TOKEN_KEY),
};

type AuthContextValue = {
  token: string | null;
  data: AppData | null;
  loading: boolean;
  error: string;
  signIn: (payload: AuthPayload) => Promise<void>;
  register: (payload: AuthPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: (communityId?: string) => Promise<void>;
  runAction: (payload: Record<string, unknown>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (sessionToken: string, communityId = "") => {
    setLoading(true);
    setError("");
    try {
      const next = await fetchAppData(sessionToken, communityId);
      setData(next);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Bilgiler yüklenemedi.";
      setError(message);
      if (/oturum/i.test(message)) {
        await sessionStorage.remove();
        setToken(null);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    sessionStorage.get().then(async storedToken => {
      if (!storedToken) {
        setLoading(false);
        return;
      }
      setToken(storedToken);
      await load(storedToken);
    });
  }, [load]);

  const completeAuth = useCallback(async (action: "login" | "register", payload: AuthPayload) => {
    setLoading(true);
    setError("");
    try {
      const result = await authenticate(action, payload);
      await sessionStorage.set(result.sessionToken);
      setToken(result.sessionToken);
      await load(result.sessionToken);
    } catch (reason) {
      setLoading(false);
      throw reason;
    }
  }, [load]);

  const signOut = useCallback(async () => {
    if (token) await revokeSession(token);
    await sessionStorage.remove();
    setToken(null);
    setData(null);
    setError("");
  }, [token]);

  const refresh = useCallback(async (communityId = "") => {
    if (token) await load(token, communityId);
  }, [load, token]);

  const runAction = useCallback(async (payload: Record<string, unknown>) => {
    if (!token) throw new Error("Oturum açmanız gerekiyor.");
    const communityId = data?.membership?.community_id || "";
    const result = await appAction(token, payload, communityId);
    await load(token, String(result.communityId || communityId));
  }, [data?.membership?.community_id, load, token]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    data,
    loading,
    error,
    signIn: payload => completeAuth("login", payload),
    register: payload => completeAuth("register", payload),
    signOut,
    refresh,
    runAction,
  }), [completeAuth, data, error, loading, refresh, runAction, signOut, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth, AuthProvider içinde kullanılmalı.");
  return value;
}
