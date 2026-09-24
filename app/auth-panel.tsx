"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LogoMark from "./logo-mark";

export default function AuthPanel({ initialError = "" }: { initialError?: string }) {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const payload = { action: mode, ...Object.fromEntries(new FormData(event.currentTarget)) };
    try {
      const response = await fetch("/api/auth/email", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const responseText = await response.text();
      let result: { error?: string } = {};
      try { result = responseText ? JSON.parse(responseText) : {}; } catch { /* Sunucu hatalarında anlaşılır varsayılan mesajı göster. */ }
      if (!response.ok) throw new Error(result.error || "İşlem tamamlanamadı.");
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "İşlem tamamlanamadı.");
      setBusy(false);
    }
  }

  function changeMode(next: "login"|"register") {
    setMode(next);
    setError("");
  }

  return <main className="signin-page">
    <section className="signin-card auth-card">
      <div className="setup-brand"><LogoMark className="setup-logo"/><div><b>apartmanOS</b><small>Apartman ve site yönetimi</small></div></div>
      <h1>{mode === "login" ? "Hesabınıza giriş yapın" : "Yeni hesabınızı oluşturun"}</h1>
      <p>{mode === "login" ? "Apartmanınıza ait aidat, gider ve duyurulara güvenle ulaşın." : "Hesabınızı oluşturduktan sonra apartman kurabilir veya davet koduyla katılabilirsiniz."}</p>
      <a className="google-auth-button" href="/api/auth/google">
        <span aria-hidden="true">G</span>
        Google ile devam et
      </a>
      <div className="auth-separator"><span>veya e-posta ile</span></div>
      <div className="setup-tabs" role="tablist" aria-label="Üyelik işlemleri">
        <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={()=>changeMode("login")}>Giriş yap</button>
        <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "active" : ""} onClick={()=>changeMode("register")}>Yeni hesap</button>
      </div>
      <form onSubmit={submit} className="auth-form">
        {mode === "register" ? <div className="field-wrap auth-field"><Label htmlFor="displayName">Ad soyad</Label><div><UserRound/><Input id="displayName" name="displayName" autoComplete="name" minLength={2} maxLength={80} required placeholder="Adınız ve soyadınız"/></div></div> : null}
        <div className="field-wrap auth-field"><Label htmlFor="email">E-posta adresi</Label><div><Mail/><Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="ornek@email.com"/></div></div>
        <div className="field-wrap auth-field"><Label htmlFor="password">Şifre</Label><div><LockKeyhole/><Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} maxLength={128} required placeholder="En az 8 karakter"/><button type="button" className="password-toggle" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></div>
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        <Button className="w-full" disabled={busy}>{busy ? "Lütfen bekleyin…" : mode === "login" ? "Giriş yap" : "Hesap oluştur"}</Button>
      </form>
      <small>Devam ederek verilerinizin yalnızca üyesi olduğunuz apartmanda kullanılmasını kabul etmiş olursunuz.</small>
    </section>
  </main>;
}
