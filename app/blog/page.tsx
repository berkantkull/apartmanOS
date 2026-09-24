import type { Metadata } from "next";
import { ArrowRight, BookOpenText, Clock3 } from "lucide-react";
import SeoPage from "../seo-page";
import { blogPosts } from "./blog-data";

const canonical = "https://apartmanos.com.tr/blog";

export const metadata: Metadata = {
  title: "Apartman Yönetimi Blogu | Aidat, Gider ve Sakin Yönetimi",
  description: "Apartman ve site yöneticileri için aidat takibi, gider raporlama, sakin iletişimi ve dijital yönetim üzerine uygulanabilir rehberler.",
  alternates: { canonical },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: canonical,
    title: "apartmanOS Apartman Yönetimi Blogu",
    description: "Apartman yönetimini daha düzenli ve anlaşılır yürütmek için güncel rehberler."
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "apartmanOS Apartman Yönetimi Blogu",
  description: metadata.description,
  url: canonical,
  inLanguage: "tr-TR",
  isPartOf: { "@type": "WebSite", name: "apartmanOS", url: "https://apartmanos.com.tr" },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: blogPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://apartmanos.com.tr/blog/${post.slug}`,
      name: post.title
    }))
  }
};

export default function BlogPage() {
  return <SeoPage eyebrow="apartmanOS Blog" title="Apartman yönetimini kolaylaştıran pratik rehberler." lead="Aidat, gider, duyuru ve sakin yönetimini daha düzenli yürütmek isteyen yöneticiler için açık, uygulanabilir ve güncel bilgiler." structuredData={structuredData}>
    <section className="blog-intro" aria-labelledby="blog-intro-title">
      <div><BookOpenText/><h2 id="blog-intro-title">Doğrudan sorunuza cevap veren içerikler</h2></div>
      <p>Her rehber önce kısa cevabı verir, ardından uygulama adımlarını ve sık sorulan soruları açıklar. Böylece ihtiyaç duyduğunuz bilgiye hızlıca ulaşabilirsiniz.</p>
    </section>
    <section aria-labelledby="latest-posts-title">
      <p className="marketing-eyebrow">Tüm rehberler</p>
      <h2 id="latest-posts-title">Apartman ve site yönetimi yazıları</h2>
      <div className="blog-grid">
        {blogPosts.map(post => <article className="blog-card" key={post.slug}>
          <div className="blog-card-meta"><span>{post.category}</span><span><Clock3/>{post.readingTime}</span></div>
          <h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3>
          <p>{post.excerpt}</p>
          <footer><time dateTime={post.updatedAt}>{new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric"}).format(new Date(post.updatedAt))}</time><a href={`/blog/${post.slug}`}>Rehberi oku <ArrowRight/></a></footer>
        </article>)}
      </div>
    </section>
  </SeoPage>;
}
