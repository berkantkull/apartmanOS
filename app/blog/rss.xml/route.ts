import { blogPosts } from "../blog-data";

function xml(value: string) {
  return value.replace(/[<>&'"]/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[character]!);
}

export function GET() {
  const items = blogPosts.map(post => `<item>
    <title>${xml(post.title)}</title>
    <link>https://apartmanos.com.tr/blog/${post.slug}</link>
    <guid isPermaLink="true">https://apartmanos.com.tr/blog/${post.slug}</guid>
    <description>${xml(post.description)}</description>
    <category>${xml(post.category)}</category>
    <pubDate>${new Date(`${post.publishedAt}T09:00:00+03:00`).toUTCString()}</pubDate>
  </item>`).join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>apartmanOS Apartman Yönetimi Blogu</title>
  <link>https://apartmanos.com.tr/blog</link>
  <description>Apartman yönetimi, aidat takibi, gider raporlama ve sakin iletişimi rehberleri.</description>
  <language>tr-TR</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${items}
</channel></rss>`;

  return new Response(body, { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
