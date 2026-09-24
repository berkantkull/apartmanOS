import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import LogoMark from "./logo-mark";

export default function SeoPage({ eyebrow, title, lead, children, structuredData }:{ eyebrow:string; title:string; lead:string; children:ReactNode; structuredData:Record<string,unknown> }) {
  return <main className="marketing-page seo-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}} />
    <header className="marketing-header">
      <Link className="marketing-brand" href="/" aria-label="apartmanOS ana sayfa"><LogoMark className="marketing-logo"/><span><strong>apartmanOS</strong><small>Apartman ve site yönetimi</small></span></Link>
      <nav aria-label="Ana menü"><Link href="/">Ana sayfa</Link><Link href="/apartman-yonetim-programi">Apartman yönetimi</Link><Link href="/aidat-takip-programi">Aidat takibi</Link><Link href="/hakkimizda">Hakkımızda</Link></nav>
      <Link className="header-login" href="/giris">Giriş yap <ArrowRight/></Link>
    </header>
    <article>
      <header className="seo-hero"><nav aria-label="İçerik yolu"><Link href="/">apartmanOS</Link><span>/</span><span>{eyebrow}</span></nav><p className="marketing-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{lead}</p></header>
      <div className="seo-content">{children}</div>
    </article>
    <section className="final-cta"><div><p className="marketing-eyebrow">Daha düzenli bir yönetim mümkün</p><h2>Apartmanınızı tek panelden yönetmeye başlayın.</h2><p>Hesabınızı oluşturun, apartmanınızı kurun ve yönetim kayıtlarını düzenli biçimde tutun.</p></div><Link className="marketing-primary light" href="/giris">Hesap oluştur <ArrowRight/></Link></section>
    <footer className="marketing-footer"><div className="marketing-brand"><LogoMark className="marketing-logo"/><span><strong>apartmanOS</strong><small>Apartman ve site yönetimi</small></span></div><p>© {new Date().getFullYear()} apartmanOS · Berkant Kul tarafından, Stark Bilişim Hizmetleri çatısı altında geliştirilmiştir.</p><div className="footer-links"><Link href="/hakkimizda">Hakkımızda</Link><Link href="/">Ana sayfa</Link><Link href="/giris">Giriş yap</Link></div></footer>
  </main>
}
