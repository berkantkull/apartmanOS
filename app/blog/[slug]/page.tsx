/* eslint-disable @next/next/no-html-link-for-pages -- Vinext'in Link/RSC prefetch katmanı üretimde hata verdiği için standart gezinme kullanılıyor. */
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import SeoPage from "../../seo-page";
import { blogPosts, getBlogPost } from "../blog-data";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog yazısı bulunamadı", robots: { index: false, follow: false } };
  const url = `https://apartmanos.com.tr/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    authors: [{ name: "Berkant Kul", url: "https://berkantkul.com.tr" }],
    openGraph: { type: "article", locale: "tr_TR", url, title: post.title, description: post.description, publishedTime: post.publishedAt, modifiedTime: post.updatedAt, authors: ["https://berkantkul.com.tr"] }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return <SeoPage eyebrow="Blog" title="Aradığınız yazı bulunamadı." lead="Yazı kaldırılmış veya adresi değişmiş olabilir." structuredData={{"@context":"https://schema.org","@type":"WebPage","name":"Yazı bulunamadı"}}><section><a className="text-link" href="/blog">Tüm blog yazılarına dön <ArrowRight/></a></section></SeoPage>;

  const url = `https://apartmanos.com.tr/blog/${post.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        inLanguage: "tr-TR",
        isAccessibleForFree: true,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Person", name: "Berkant Kul", url: "https://berkantkul.com.tr" },
        publisher: { "@type": "Organization", name: "Stark Bilişim Hizmetleri", brand: { "@type": "Brand", name: "apartmanOS" }, url: "https://apartmanos.com.tr" },
        about: ["Apartman yönetimi", post.category]
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faqs.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "apartmanOS", item: "https://apartmanos.com.tr" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://apartmanos.com.tr/blog" },
          { "@type": "ListItem", position: 3, name: post.title, item: url }
        ]
      }
    ]
  };

  const related = blogPosts.filter(item => item.slug !== post.slug).slice(0, 2);
  const formattedDate = new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric"}).format(new Date(post.updatedAt));

  return <SeoPage eyebrow={post.category} title={post.title} lead={post.description} structuredData={structuredData}>
    <div className="article-meta"><span><CalendarDays/>Güncelleme: <time dateTime={post.updatedAt}>{formattedDate}</time></span><span><Clock3/>{post.readingTime}</span><span>Yazar: <a href="https://berkantkul.com.tr" target="_blank" rel="noreferrer">Berkant Kul</a></span></div>
    <section className="answer-box" aria-labelledby="short-answer"><p className="marketing-eyebrow">Kısa cevap</p><h2 id="short-answer">Özet</h2><p>{post.answer}</p></section>
    <div className="blog-article-body">
      {post.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.bullets?<ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>:null}</section>)}
      <section className="article-product-note"><h2>apartmanOS ile uygulayın</h2><p>apartmanOS; aidat, borç, gider, duyuru, karar ve sakin kayıtlarını her apartmana özel bir yönetim alanında bir araya getirir.</p><div className="article-links"><a href="/apartman-yonetim-programi">Apartman yönetimi özellikleri <ArrowRight/></a><a href="/aidat-takip-programi">Aidat takip sistemi <ArrowRight/></a></div></section>
      <section className="article-faq"><p className="marketing-eyebrow">Sık sorulan sorular</p><h2>{post.title.replace(/\?[^?]*$/, "")} hakkında merak edilenler</h2>{post.faqs.map(item=><details key={item.question}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</section>
      <section className="author-box"><div>BK</div><div><span>Yazar</span><h2>Berkant Kul</h2><p>apartmanOS geliştiricisi. Ürün, Stark Bilişim Hizmetleri çatısı altında apartman ve site yönetim süreçlerini sadeleştirmek amacıyla geliştirilmektedir.</p></div></section>
      <section className="related-posts"><p className="marketing-eyebrow">Okumaya devam edin</p><h2>İlgili rehberler</h2><div>{related.map(item=><a href={`/blog/${item.slug}`} key={item.slug}><span>{item.category}</span><strong>{item.title}</strong><ArrowRight/></a>)}</div></section>
    </div>
  </SeoPage>;
}
