# apartmanOS

apartmanOS, apartman ve site yönetimlerinin aidat, borç, gider, duyuru, karar ve sakin kayıtlarını tek bir yerde yönetmesi için geliştirilmiş web uygulamasıdır.

## İlk sürümde bulunanlar

- ChatGPT hesabıyla güvenli giriş
- Her apartman/site için birbirinden ayrılmış yönetim alanı
- Davet koduyla sakin katılımı
- Yönetim sahibi, yönetici ve sakin rolleri
- Aidat ve borç takibi
- Gider kayıtları ve kasa özeti
- Duyurular ve karar defteri
- Sakin/dairenin temel iletişim kaydı
- Mobil ve masaüstüne uyumlu arayüz

Yönetim sahibi yeni bir alan oluşturur ve Ayarlar ekranındaki davet kodunu sakinlerle paylaşır. Davet koduyla katılan kullanıcılar yalnızca bağlı oldukları apartmanın verilerini görür. Yönetim sahibi diğer üyeleri yönetici yapabilir.

## Yerel geliştirme

Gereksinim: Node.js 22.13 veya daha yeni bir sürüm.

```bash
npm run install:ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_massive_kat_farrell.sql
npm run dev
```

Yerel giriş için `/signin-with-chatgpt?return_to=/` adresi kullanılabilir. Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

## Teknoloji

Vinext/React, TypeScript, Cloudflare D1, Drizzle ORM, Tailwind CSS ve shadcn tabanlı arayüz bileşenleri.

Canlı adres: [apartmanos.berkantkul.com.tr](https://apartmanos.berkantkul.com.tr)
