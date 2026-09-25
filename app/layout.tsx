import type { Metadata, Viewport } from "next";
import "./globals.css";
import ScrollToTop from "./scroll-to-top";
import PwaManager from "./pwa-manager";

export const viewport: Viewport = {
  themeColor: "#062b50",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://apartmanos.com.tr"),
  title: { default: "apartmanOS | Apartman ve Site Yönetim Programı", template: "%s | apartmanOS" },
  description: "Aidat, gider, duyuru ve kararları apartmanınıza özel tek yerde yönetin.",
  applicationName: "apartmanOS",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "apartmanOS", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  authors: [{ name: "Berkant Kul", url: "https://berkantkul.com.tr" }],
  creator: "Berkant Kul",
  publisher: "Stark Bilişim Hizmetleri",
  category: "technology",
  keywords: [
    "apartmanOS", "apartman yönetim programı", "site yönetim programı",
    "aidat takip programı", "apartman aidat takibi", "apartman gider takibi",
  ],
  alternates: { types: { "application/rss+xml": "https://apartmanos.com.tr/blog/rss.xml" } },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: {
    icon: [{ url: "/apartmanos-icon.png", type: "image/png" }],
    shortcut: "/apartmanos-icon.png",
    apple: "/apartmanos-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#062b50" />
      </head>
      <body className="antialiased">
        {children}
        <PwaManager />
        <ScrollToTop />
      </body>
    </html>
  );
}
