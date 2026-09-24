import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "apartmanOS — Apartman ve site yönetimi",
  description: "Aidat, gider, duyuru ve kararları apartmanınıza özel tek yerde yönetin.",
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
