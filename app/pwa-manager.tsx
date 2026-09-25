"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaManager() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then(registration => registration.update()).catch(() => undefined);
      if (document.readyState === "complete") register();
      else window.addEventListener("load", register, { once: true });
    }

    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateInstalledState = () => {
      const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
      setInstalled(displayMode.matches || iosStandalone);
    };
    updateInstalledState();

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setShowHelp(false);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);
    displayMode.addEventListener("change", updateInstalledState);
    return () => {
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
      displayMode.removeEventListener("change", updateInstalledState);
    };
  }, []);

  async function install() {
    if (!installPrompt) {
      setShowHelp(true);
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  if (installed) return null;
  return (
    <>
      <button type="button" className="pwa-install-button" onClick={install} aria-label="apartmanOS uygulamasını Windows'a yükle">
        <Download aria-hidden="true" />
        <span>Uygulamayı yükle</span>
      </button>
      {showHelp ? (
        <section className="pwa-install-help" role="dialog" aria-modal="false" aria-labelledby="pwa-install-title">
          <button type="button" className="pwa-install-help-close" onClick={() => setShowHelp(false)} aria-label="Kurulum yardımını kapat"><X aria-hidden="true" /></button>
          <span className="pwa-install-eyebrow">WINDOWS UYGULAMASI</span>
          <h2 id="pwa-install-title">apartmanOS&apos;u bilgisayarına yükle</h2>
          <p>Bu tarayıcı otomatik kurulum penceresini göstermedi. Chrome veya Edge&apos;de şu adımları kullanabilirsin:</p>
          <ol>
            <li>Adres çubuğunun sağındaki <strong>Uygulamayı yükle</strong> simgesine tıkla.</li>
            <li>Simge yoksa tarayıcı menüsünden <strong>Uygulamalar → apartmanOS&apos;u yükle</strong> seçeneğini aç.</li>
          </ol>
          <p className="pwa-install-note">Uygulama yeni bir pencerede açılır ve Başlat menüsüne eklenir.</p>
        </section>
      ) : null}
    </>
  );
}
