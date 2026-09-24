/* eslint-disable @next/next/no-html-link-for-pages -- Vinext'in Link/RSC prefetch katmanı üretimde hata verdiği için standart gezinme kullanılıyor. */
import type { Metadata } from "next";
import {
  ArrowRight, BadgeTurkishLira, BellRing, BookOpenCheck, Building2,
  CheckCircle2, CircleGauge, FileText, ShieldCheck,
  UsersRound, WalletCards,
} from "lucide-react";
import LogoMark from "./logo-mark";

const siteUrl = "https://apartmanos.com.tr";

export const metadata: Metadata = {
  title: { absolute: "apartmanOS | Apartman ve Site Yönetim Programı" },
  description: "Aidat, borç, gider, duyuru, karar defteri ve sakin yönetimini tek yerde toplayan, kullanımı kolay apartman ve site yönetim programı.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", locale: "tr_TR", url: siteUrl, siteName: "apartmanOS",
    title: "apartmanOS | Apartman ve Site Yönetim Programı",
    description: "Apartmanınızın aidat, gider, duyuru ve karar süreçlerini sade bir panelden yönetin.",
  },
  twitter: {
    card: "summary", title: "apartmanOS | Apartman ve Site Yönetim Programı",
    description: "Apartman ve site yönetiminin sade, düzenli ve güvenli yolu.",
  },
};

const features = [
  { icon: BadgeTurkishLira, title: "Aidat ve borç takibi", text: "Daire bazında aidatları, ödemeleri ve geciken borçları anlaşılır biçimde takip edin." },
  { icon: WalletCards, title: "Gider yönetimi", text: "Ortak alan harcamalarını kaydedin, giderlerin nereye yapıldığını şeffaflaştırın." },
  { icon: BellRing, title: "Duyurular", text: "Önemli gelişmeleri sakinlerle tek merkezden, hızlı ve düzenli biçimde paylaşın." },
  { icon: BookOpenCheck, title: "Karar defteri", text: "Yönetim kararlarını tarihleri ve açıklamalarıyla dijital ortamda kayıt altında tutun." },
  { icon: UsersRound, title: "Sakin ve daire yönetimi", text: "Her apartmanı kendi üyeleri, daireleri ve yetkileriyle birbirinden ayrı yönetin." },
  { icon: FileText, title: "Düzenli kayıtlar", text: "Dağınık notlar yerine bütün yönetim kayıtlarını tek, erişilebilir bir sistemde toplayın." },
];

const faqs = [
  { q: "apartmanOS nedir?", a: "apartmanOS; apartman ve site yöneticilerinin aidat, borç, gider, duyuru, karar ve sakin kayıtlarını internet üzerinden yönetmesini sağlayan bir web uygulamasıdır." },
  { q: "Her apartmanın bilgileri ayrı mı tutulur?", a: "Evet. Kullanıcılar kendi apartmanını oluşturabilir veya davet koduyla mevcut apartmanına katılabilir. Her topluluğun kayıtları ve üyeleri kendine özeldir." },
  { q: "Telefondan kullanılabilir mi?", a: "Evet. apartmanOS web tarayıcısı üzerinden masaüstü, tablet ve telefon ekranlarına uyumlu olarak çalışır." },
  { q: "Kim geliştirdi?", a: "apartmanOS, Berkant Kul tarafından geliştirilmekte ve Stark Bilişim Hizmetleri çatısı altında sunulmaktadır." },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: "apartmanOS", alternateName: "Apartman OS", inLanguage: "tr-TR", publisher: { "@id": `${siteUrl}/#organization` } },
    { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "Stark Bilişim Hizmetleri", url: siteUrl, logo: `${siteUrl}/apartmanos-icon.png`, founder: { "@id": `${siteUrl}/#berkant-kul` }, sameAs: ["https://berkantkul.com.tr"] },
    { "@type": "Person", "@id": `${siteUrl}/#berkant-kul`, name: "Berkant Kul", url: "https://berkantkul.com.tr", affiliation: { "@id": `${siteUrl}/#organization` } },
    {
      "@type": "SoftwareApplication", "@id": `${siteUrl}/#software`, name: "apartmanOS", url: siteUrl,
      applicationCategory: "BusinessApplication", applicationSubCategory: "Apartman ve site yönetimi",
      operatingSystem: "Web", inLanguage: "tr-TR",
      description: "Aidat, borç, gider, duyuru, karar defteri ve sakin yönetimi için web tabanlı apartman ve site yönetim uygulaması.",
      creator: { "@id": `${siteUrl}/#berkant-kul` }, provider: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "FAQPage", "@id": `${siteUrl}/#faq`,
      mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
    },
  ],
};

export default function MarketingHome() {
  return (
    <main className="marketing-page" id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className="marketing-header">
        <a className="marketing-brand" href="#top" aria-label="apartmanOS ana sayfa">
          <LogoMark className="marketing-logo" />
          <span><strong>apartmanOS</strong><small>Apartman ve site yönetimi</small></span>
        </a>
        <nav aria-label="Ana menü"><a href="#ozellikler">Özellikler</a><a href="#nasil-calisir">Nasıl çalışır?</a><a href="/apartman-yonetim-programi">Rehber</a><a href="/blog">Blog</a><a href="/hakkimizda">Hakkımızda</a></nav>
        <a className="header-login" href="/giris">Giriş yap <ArrowRight /></a>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="marketing-eyebrow">Apartman yönetiminin yeni ve sade hali</p>
          <h1>Apartman ve site yönetimini <span>tek yerde</span> toplayın.</h1>
          <p className="hero-lead">Aidat, borç, gider, duyuru, karar defteri ve sakin yönetimi artık dağınık değil. apartmanOS ile herkesin anlayabileceği düzenli bir yönetim kurun.</p>
          <div className="hero-actions">
            <a className="marketing-primary" href="/giris">Ücretsiz hesap oluştur <ArrowRight /></a>
            <a className="marketing-secondary" href="#nasil-calisir">Nasıl çalıştığını görün</a>
          </div>
          <div className="hero-trust"><span><CheckCircle2 /> Kurulumsuz kullanım</span><span><CheckCircle2 /> Her cihazdan erişim</span><span><CheckCircle2 /> Apartmana özel kayıtlar</span></div>
        </div>

        <div className="product-showcase" aria-label="apartmanOS yönetim paneli ön izlemesi">
          <div className="showcase-topbar"><div><i></i><i></i><i></i></div><span>apartmanOS yönetim paneli</span></div>
          <div className="showcase-body">
            <aside><LogoMark className="showcase-logo" /><span className="active"></span><span></span><span></span><span></span></aside>
            <div className="showcase-content">
              <div className="showcase-heading"><div><small>GENEL BAKIŞ</small><strong>Merhaba, yöneticim</strong></div><span>Bu ay</span></div>
              <div className="showcase-metrics"><article><small>Toplanan aidat</small><strong>₺18.450</strong><em className="teal">%82 tamamlandı</em></article><article><small>Bekleyen borç</small><strong>₺4.050</strong><em>6 daire</em></article><article><small>Aylık gider</small><strong>₺7.280</strong><em>8 kayıt</em></article></div>
              <div className="showcase-panels"><article><div className="panel-title"><strong>Aidat durumu</strong><span>Detaylar</span></div><div className="chart-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div></article><article><div className="panel-title"><strong>Son duyurular</strong><span>Tümü</span></div><p><b></b><span>Asansör bakımı<br/><small>Bugün, 10:30</small></span></p><p><b></b><span>Aylık toplantı<br/><small>22 Eylül</small></span></p></article></div>
            </div>
          </div>
          <div className="floating-note"><ShieldCheck /><span><strong>Güvenli ve ayrılmış</strong><small>Her apartmanın verisi kendine özel</small></span></div>
        </div>
      </section>

      <section className="proof-strip" aria-label="apartmanOS faydaları">
        <p><CircleGauge /><span><strong>Tek panel</strong><small>Tüm yönetim işleri</small></span></p>
        <p><Building2 /><span><strong>Apartmana özel</strong><small>Bağımsız topluluklar</small></span></p>
        <p><UsersRound /><span><strong>Kolay katılım</strong><small>Davet koduyla üyelik</small></span></p>
        <p><ShieldCheck /><span><strong>Yetkili erişim</strong><small>Yönetici ve sakin rolleri</small></span></p>
      </section>

      <section className="marketing-section features-section" id="ozellikler">
        <div className="section-intro"><p className="marketing-eyebrow">İhtiyacınız olan her şey</p><h2>Yönetimin yükünü azaltan, şeffaflığı artıran araçlar.</h2><p>Karmaşık tabloları ve kaybolan mesajları geride bırakın. Günlük yönetim işlerini sade bir akışta tamamlayın.</p></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="seo-link-row" aria-label="apartmanOS rehberleri"><a href="/apartman-yonetim-programi">Apartman yönetim programı rehberi <ArrowRight /></a><a href="/aidat-takip-programi">Aidat takip programı rehberi <ArrowRight /></a></div>
      </section>

      <section className="marketing-section how-section" id="nasil-calisir">
        <div className="how-copy"><p className="marketing-eyebrow">Üç adımda başlayın</p><h2>Teknik bilgiye ihtiyaç duymadan apartmanınızı kurun.</h2><p>apartmanOS her yaştan kullanıcının rahatça anlayabileceği şekilde tasarlandı.</p><a className="marketing-primary" href="/giris">Hemen kullanmaya başlayın <ArrowRight /></a></div>
        <ol className="steps-list">
          <li><span>01</span><div><h3>Hesabınızı oluşturun</h3><p>Adınız, e-posta adresiniz ve şifrenizle güvenli hesabınızı açın.</p></div></li>
          <li><span>02</span><div><h3>Apartman kurun veya katılın</h3><p>Yeni topluluk oluşturun ya da yöneticinizin verdiği davet kodunu kullanın.</p></div></li>
          <li><span>03</span><div><h3>Yönetmeye başlayın</h3><p>Daireleri ekleyin; aidat, gider, duyuru ve karar kayıtlarını tek panelde yönetin.</p></div></li>
        </ol>
      </section>

      <section className="marketing-section about-section" id="hakkimizda">
        <div className="about-mark"><LogoMark className="about-logo" /><span>Yerli geliştirme<br/>Sade teknoloji</span></div>
        <div><p className="marketing-eyebrow">apartmanOS hakkında</p><h2>Gerçek bir ihtiyaca, anlaşılır bir çözüm.</h2><p>apartmanOS, apartman ve site yönetiminde herkesin erişebileceği sade bir dijital düzen kurma amacıyla <strong>Berkant Kul</strong> tarafından geliştirilmekte ve <strong>Stark Bilişim Hizmetleri</strong> çatısı altında sunulmaktadır.</p><a className="text-link" href="https://berkantkul.com.tr" target="_blank" rel="noreferrer">Berkant Kul hakkında <ArrowRight /></a></div>
      </section>

      <section className="marketing-section faq-section"><div className="section-intro"><p className="marketing-eyebrow">Merak edilenler</p><h2>Sıkça sorulan sorular</h2></div><div className="faq-list">{faqs.map((item) => <details key={item.q}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div></section>

      <section className="final-cta"><div><p className="marketing-eyebrow">Daha düzenli bir yönetim mümkün</p><h2>Apartmanınızı bugün dijitalleştirin.</h2><p>İlk hesabınızı oluşturun, topluluğunuzu kurun ve yönetim işlerini tek yerde toplamaya başlayın.</p></div><a className="marketing-primary light" href="/giris">Hesap oluştur <ArrowRight /></a></section>

      <footer className="marketing-footer"><div className="marketing-brand"><LogoMark className="marketing-logo" /><span><strong>apartmanOS</strong><small>Apartman ve site yönetimi</small></span></div><p>© {new Date().getFullYear()} apartmanOS · Berkant Kul tarafından, Stark Bilişim Hizmetleri çatısı altında geliştirilmiştir.</p><div className="footer-links"><a href="/blog">Blog</a><a href="/hakkimizda">Hakkımızda</a><a href="/apartman-yonetim-programi">Rehber</a><a href="/giris">Giriş yap</a></div></footer>
    </main>
  );
}
