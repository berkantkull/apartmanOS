/* eslint-disable @next/next/no-html-link-for-pages -- Vinext'in Link/RSC prefetch katmanı üretimde hata verdiği için standart gezinme kullanılıyor. */
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import LogoMark from "./logo-mark";

export default function SeoPage({ eyebrow, title, lead, children, structuredData }:{ eyebrow:string; title:string; lead:string; children:ReactNode; structuredData:Record<string,unknown> }) {
  return <main className="marketing-page seo-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}} />
    <header className="marketing-header">
      <a className="marketing-brand" href="/" aria-label="apartmanOS ana sayfa"><LogoMark className="marketing-logo"/><span><strong>apartmanOS</strong><small>Apartman ve site yönetimi</small></span></a>
      <nav aria-label="Ana menü"><a href="/">Ana sayfa</a><a href="/apartman-yonetim-programi">Apartman yönetimi</a><a href="/aidat-takip-programi">Aidat takibi</a><a href="/hakkimizda">Hakkımızda</a></nav>
      <a className="header-login" href="/giris">Giriş yap <ArrowRight/></a>
    </header>
    <article>
      <header className="seo-hero"><nav aria-label="İçerik yolu"><a href="/">apartmanOS</a><span>/</span><span>{eyebrow}</span></nav><p className="marketing-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{lead}</p></header>
      <div className="seo-content">{children}</div>
    </article>
    <section className="final-cta"><div><p className="marketing-eyebrow">Daha düzenli bir yönetim mümkün</p><h2>Apartmanınızı tek panelden yönetmeye başlayın.</h2><p>Hesabınızı oluşturun, apartmanınızı kurun ve yönetim kayıtlarını düzenli biçimde tutun.</p></div><a className="marketing-primary light" href="/giris">Hesap oluştur <ArrowRight/></a></section>
    <footer className="marketing-footer"><div className="marketing-brand"><LogoMark className="marketing-logo"/><span><strong>apartmanOS</strong><small>Apartman ve site yönetimi</small></span></div><p>© {new Date().getFullYear()} apartmanOS · Berkant Kul tarafından, Stark Bilişim Hizmetleri çatısı altında geliştirilmiştir.</p><div className="footer-links"><a href="/hakkimizda">Hakkımızda</a><a href="/">Ana sayfa</a><a href="/giris">Giriş yap</a></div></footer>
  </main>
}
