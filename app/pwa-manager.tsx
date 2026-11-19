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
  const agent = typeof navigator === "undefined" ? "" : navigator.userAgent.toLocaleLowerCase("tr");
  const platform: "ios" | "android" | "desktop" = /iphone|ipad|ipod/.test(agent) ? "ios" : /android/.test(agent) ? "android" : "desktop";

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
      <button type="button" className="pwa-install-button" onClick={install} aria-label="apartmanOS uygulamasını bu cihaza yükle">
        <Download aria-hidden="true" />
        <span>Uygulamayı yükle</span>
      </button>
      {showHelp ? (
        <section className="pwa-install-help" role="dialog" aria-modal="false" aria-labelledby="pwa-install-title">
          <button type="button" className="pwa-install-help-close" onClick={() => setShowHelp(false)} aria-label="Kurulum yardımını kapat"><X aria-hidden="true" /></button>
          <span className="pwa-install-eyebrow">TARAYICI UYGULAMASI</span>
          <h2 id="pwa-install-title">apartmanOS&apos;u cihazına yükle</h2>
          {platform === "ios" ? <><p>Safari&apos;de alt menüdeki <strong>Paylaş</strong> düğmesine dokun:</p><ol><li><strong>Ana Ekrana Ekle</strong> seçeneğini aç.</li><li>Sağ üstten <strong>Ekle</strong> diyerek kurulumu tamamla.</li></ol></> : platform === "android" ? <><p>Chrome menüsünü açıp şu adımları kullan:</p><ol><li><strong>Uygulamayı yükle</strong> veya <strong>Ana ekrana ekle</strong> seçeneğine dokun.</li><li>Kurulum onayını ver.</li></ol></> : <><p>Chrome veya Edge&apos;de şu adımları kullanabilirsin:</p><ol><li>Adres çubuğunun sağındaki <strong>Uygulamayı yükle</strong> simgesine tıkla.</li><li>Simge yoksa tarayıcı menüsünden <strong>Uygulamalar → apartmanOS&apos;u yükle</strong> seçeneğini aç.</li></ol></>}
          <p className="pwa-install-note">Aynı apartmanOS hesabıyla giriş yapabilir; kargo, duyuru ve aidat bilgilerini uygulama görünümünde kullanabilirsin.</p>
        </section>
      ) : null}
    </>
  );
}
