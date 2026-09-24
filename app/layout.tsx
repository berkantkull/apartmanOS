import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://apartmanos.com.tr"),
  title: { default: "apartmanOS | Apartman ve Site Yönetim Programı", template: "%s | apartmanOS" },
  description: "Aidat, gider, duyuru ve kararları apartmanınıza özel tek yerde yönetin.",
  applicationName: "apartmanOS",
  authors: [{ name: "Berkant Kul", url: "https://berkantkul.com.tr" }],
  creator: "Berkant Kul",
  publisher: "Stark Bilişim Hizmetleri",
  category: "technology",
  keywords: [
    "apartmanOS", "apartman yönetim programı", "site yönetim programı",
    "aidat takip programı", "apartman aidat takibi", "apartman gider takibi",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
