export type BlogSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogFaq = { question: string; answer: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  answer: string;
  sections: BlogSection[];
  faqs: BlogFaq[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "apartman-aidat-takibi-nasil-yapilir",
    title: "Apartman Aidat Takibi Nasıl Yapılır? Adım Adım Rehber",
    description: "Apartman aidatlarını daire bazında oluşturma, ödeme durumunu izleme, geciken borçları görme ve düzenli raporlama adımlarını öğrenin.",
    excerpt: "Daire bazlı aidat kayıtlarını, ödeme durumlarını ve tahsilat özetini düzenli tutmak için uygulanabilir bir yöntem.",
    category: "Aidat yönetimi",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingTime: "6 dakika",
    answer: "Apartman aidat takibi; her daire için dönem, tutar, son ödeme tarihi ve ödeme durumunun tek bir kayıt düzeninde izlenmesiyle yapılır. Sağlıklı bir sistemde aylık aidatlar toplu oluşturulur, ödemeler işlendiğinde borç bakiyesi otomatik güncellenir ve yönetici tahsil edilen, bekleyen ve geciken tutarları aynı ekranda görebilir.",
    sections: [
      {
        heading: "Aidat takibinde hangi bilgiler tutulmalı?",
        paragraphs: [
          "Her aidat kaydı hangi daireye ait olduğunu açıkça göstermelidir. Sakin adı tek başına yeterli değildir; daire bilgisi, dönem, tutar, son ödeme tarihi ve durum bilgisi birlikte tutulmalıdır.",
          "Ödeme tamamlandığında kayıt silinmemeli, “Ödendi” durumuna geçirilmelidir. Böylece geçmiş dönem tahsilatları korunur ve yönetim değiştiğinde geriye dönük kontrol yapılabilir."
        ],
        bullets: ["Daire ve sakin bilgisi", "Aidat dönemi ve tutarı", "Son ödeme tarihi", "Bekliyor, ödendi veya gecikmiş durumu", "Ödeme kayıt tarihi"]
      },
      {
        heading: "Aylık aidatlar nasıl oluşturulur?",
        paragraphs: [
          "Önce apartmanın aylık standart aidat tutarı belirlenir. Ardından aktif sakinlerin tamamı için aynı döneme ait kayıtlar toplu şekilde oluşturulur. İstisnai bir daire varsa bu kayıt ayrıca düzenlenebilir.",
          "Toplu oluşturma, aynı bilgilerin tekrar tekrar yazılmasını önler. Ayrıca bir dairenin unutulması veya farklı dönemlerin karışması riskini azaltır."
        ]
      },
      {
        heading: "Tahsilat ve borç özeti nasıl okunur?",
        paragraphs: [
          "Toplanan aidat, yalnızca ödenmiş durumdaki kayıtların toplamıdır. Bekleyen borç ise henüz tamamlanmamış kayıtların toplamını gösterir. Bu iki değerin ayrı izlenmesi, kasadaki gerçek hareket ile beklenen gelirin karıştırılmasını önler.",
          "Yönetici düzenli aralıklarla bekleyen kayıtları kontrol etmeli, sakinlerin görebildiği bilgilerin güncel olduğundan emin olmalıdır."
        ]
      },
      {
        heading: "Excel mi, apartman aidat takip programı mı?",
        paragraphs: [
          "Az sayıda kayıt için hesap tablosu başlangıçta yeterli görünebilir. Ancak birden fazla dönem, ödeme durumu, sakin değişikliği ve raporlama ihtiyacı oluştuğunda aynı dosyanın güncel sürümünü korumak zorlaşır.",
          "Apartman yönetim programı, kayıtları ilgili apartmana ve kullanıcı rollerine göre ayırır. Yönetici güncelleme yaparken sakin yalnızca yetkili olduğu alanı görür."
        ]
      }
    ],
    faqs: [
      { question: "Aidat kaydı ödeme yapıldığında silinmeli mi?", answer: "Hayır. Kayıt silinmek yerine ödendi durumuna geçirilmelidir. Böylece geçmiş tahsilatlar ve dönem raporları korunur." },
      { question: "Aylık aidatlar tek tek mi eklenmeli?", answer: "Hayır. Aktif sakinlerin tamamı için tek işlemle aidat oluşturmak daha hızlı ve daha az hatalı bir yöntemdir." },
      { question: "Sakinler kendi borçlarını görebilir mi?", answer: "Yetkilendirme destekleyen bir apartman yönetim sisteminde sakinler kendi topluluklarına ait ödeme ve duyuru bilgilerini hesaplarıyla takip edebilir." }
    ]
  },
  {
    slug: "apartman-gider-takibi-ve-seffaf-raporlama",
    title: "Apartman Gider Takibi ve Şeffaf Raporlama Nasıl Yapılır?",
    description: "Apartman giderlerini kategori, tarih ve tutarla kaydetme; aidat tahsilatıyla karşılaştırma ve anlaşılır yönetim raporu hazırlama rehberi.",
    excerpt: "Ortak alan harcamalarını düzenli kaydetmek ve sakinlere anlaşılır bir mali özet sunmak için temel adımlar.",
    category: "Gider ve raporlama",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingTime: "5 dakika",
    answer: "Şeffaf apartman gider takibi için her harcama açıklama, kategori, tutar ve tarih bilgisiyle kaydedilmelidir. Tahsil edilen aidatlar ile toplam gider ayrı gösterilmeli; aralarındaki fark tahmini kasa bakiyesi olarak raporlanmalıdır. Düzenli kayıt, sakinlerin harcamaları anlamasını ve yöneticinin dönem sonu raporu hazırlamasını kolaylaştırır.",
    sections: [
      {
        heading: "Bir gider kaydında neler bulunmalı?",
        paragraphs: ["“Tamir” gibi genel bir ifade yerine yapılan işi tanımlayan kısa bir açıklama kullanılmalıdır. Tarih ve kategori bilgisi, dönem sonunda harcamaların hangi alanlarda yoğunlaştığını görmeyi sağlar."],
        bullets: ["Açık gider açıklaması", "Bakım, fatura, temizlik veya benzeri kategori", "Harcama tarihi", "Tutar", "Gerekliyse kısa not"]
      },
      {
        heading: "Gelir ve gider neden ayrı izlenmeli?",
        paragraphs: [
          "Aidat tahakkuku beklenen geliri, tamamlanmış ödemeler ise gerçekleşen tahsilatı gösterir. Giderler yalnızca gerçekleşen tahsilatla karşılaştırıldığında mevcut mali durum daha doğru okunur.",
          "Bekleyen aidatları kasadaki para gibi değerlendirmek yanlış karar verilmesine yol açabilir. Yönetim ekranında toplanan aidat, toplam gider ve bekleyen borç ayrı görünmelidir."
        ]
      },
      {
        heading: "Sakinlere sunulan rapor nasıl olmalı?",
        paragraphs: [
          "Raporun ilk bölümünde tahsil edilen tutar, bekleyen borç, toplam gider ve tahmini bakiye özetlenmelidir. Sonraki bölümlerde aidat ve gider kayıtları tablo halinde sunulabilir.",
          "Raporun PDF olarak saklanabilmesi ve Excel uyumlu kayıtların indirilebilmesi, hem paylaşımı hem de dönemsel arşivlemeyi kolaylaştırır."
        ]
      }
    ],
    faqs: [
      { question: "Apartman giderleri hangi kategorilere ayrılabilir?", answer: "Bakım, ortak alan faturaları, temizlik, peyzaj ve diğer giderler temel kategoriler olarak kullanılabilir. Apartmanın ihtiyacına göre açıklama alanı ayrıntılandırılabilir." },
      { question: "Tahmini kasa bakiyesi nasıl hesaplanır?", answer: "Tamamlanmış aidat tahsilatlarının toplamından kaydedilmiş giderlerin toplamı çıkarılarak tahmini bakiye bulunur." },
      { question: "Raporlar hangi formatta alınmalı?", answer: "Paylaşım ve arşiv için PDF; kayıtlar üzerinde çalışma ve veri aktarımı için Excel uyumlu dosya yararlıdır." }
    ]
  },
  {
    slug: "apartman-duyurulari-nasil-yonetilir",
    title: "Apartman Duyuruları Nasıl Yönetilir? Etkili İletişim Rehberi",
    description: "Apartman duyurularını doğru başlık, açıklama ve türle hazırlama; sakinlere zamanında ulaştırma ve duyuru geçmişini koruma yöntemleri.",
    excerpt: "WhatsApp mesajları arasında kaybolmayan, düzenli ve kolay anlaşılır apartman duyuruları hazırlayın.",
    category: "Sakin iletişimi",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingTime: "4 dakika",
    answer: "Etkili bir apartman duyurusu; konuyu açıklayan kısa bir başlık, sakinlerin ne bilmesi veya yapması gerektiğini belirten net bir metin ve önem türü içermelidir. Duyurular tek bir yönetim alanında tarihçesiyle saklanmalı ve yeni duyuru yayımlandığında ilgili sakinlere bildirim gönderilmelidir.",
    sections: [
      {
        heading: "İyi bir duyuru metni nasıl yazılır?",
        paragraphs: [
          "Başlık, duyurunun konusunu ilk bakışta anlatmalıdır. Açıklama bölümünde tarih, saat, etkilenen alan ve sakinlerden beklenen işlem varsa açıkça belirtilmelidir.",
          "Uzun girişler yerine önce en önemli bilgi verilmelidir. Böylece sakin duyuruyu telefondan okurken de konuya hızla ulaşır."
        ],
        bullets: ["Kısa ve açıklayıcı başlık", "Tarih ve saat bilgisi", "Etkilenen blok veya ortak alan", "Sakinden beklenen işlem", "Gerekliyse iletişim bilgisi"]
      },
      {
        heading: "Duyuru türü neden önemlidir?",
        paragraphs: [
          "Bilgilendirme, önemli ve toplantı gibi türler duyurunun önceliğini gösterir. Her mesajı önemli olarak işaretlemek yerine gerçekten hızlı görülmesi gereken konular öne çıkarılmalıdır.",
          "Tür bilgisi, geçmiş duyurular arasında arama ve sınıflandırma yapılmasını da kolaylaştırır."
        ]
      },
      {
        heading: "Mesaj grubu tek başına yeterli mi?",
        paragraphs: [
          "Mesaj grupları hızlı iletişim için kullanışlıdır ancak eski duyurular sohbet içinde kaybolabilir. Yönetim sistemindeki duyuru kaydı, doğrulanabilir bir geçmiş oluşturur.",
          "En pratik yöntem; duyuruyu yönetim sisteminde yayımlamak, bildirimi sakinlere iletmek ve gerekirse bağlantıyı mesaj grubunda paylaşmaktır."
        ]
      }
    ],
    faqs: [
      { question: "Apartman duyurusu ne kadar uzun olmalı?", answer: "Sakinlerin gerekli bilgiyi tek okumada anlayacağı kadar kısa, tarih ve yapılacak işlem gibi ayrıntıları eksiksiz verecek kadar açıklayıcı olmalıdır." },
      { question: "Her duyuru için bildirim gönderilmeli mi?", answer: "Yeni yayımlanan duyurular için uygulama içi bildirim yararlıdır. Öncelik türü, sakinlerin hangi konuların acil olduğunu ayırt etmesine yardımcı olur." },
      { question: "Eski duyurular silinmeli mi?", answer: "Yanlış veya gereksiz bir kayıt değilse duyuru geçmişini korumak, önceki bilgilendirmelere daha sonra ulaşmayı kolaylaştırır." }
    ]
  },
  {
    slug: "apartman-yonetim-programi-secerken-nelere-bakilmali",
    title: "Apartman Yönetim Programı Seçerken Nelere Bakılmalı?",
    description: "Apartman ve site yönetim programı seçerken aidat, gider, sakin rolleri, davet, raporlama, kullanım kolaylığı ve veri ayrımı açısından kontrol listesi.",
    excerpt: "Yönetici ve sakinlerin gerçekten kullanabileceği bir apartman yönetim yazılımını değerlendirirken bakılması gerekenler.",
    category: "Dijital yönetim",
    publishedAt: "2026-09-24",
    updatedAt: "2026-09-24",
    readingTime: "6 dakika",
    answer: "Apartman yönetim programı seçerken yalnızca özellik sayısına değil; kullanım kolaylığına, her apartmanın verilerini ayrı tutmasına, yönetici ve sakin rollerine, mobil uyumuna, aidat–gider raporlarına ve davet sürecine bakılmalıdır. En iyi sistem, yöneticinin günlük işini hızlandırırken sakinlerin ihtiyaç duyduğu bilgiyi açık biçimde sunan sistemdir.",
    sections: [
      {
        heading: "Temel özellikler neler olmalı?",
        paragraphs: ["Bir apartman yönetim uygulamasının ilk sürümde dahi günlük yönetim döngüsünü tamamlaması gerekir. Birbirinden kopuk araçlar yerine aynı topluluğa bağlı kayıtlar tercih edilmelidir."],
        bullets: ["Aidat ve borç takibi", "Gider kayıtları", "Duyurular ve bildirimler", "Karar defteri", "Sakin ve kullanıcı rolleri", "PDF ve Excel uyumlu raporlar"]
      },
      {
        heading: "Kullanım kolaylığı nasıl değerlendirilir?",
        paragraphs: [
          "Yönetici temel bir işlemi yardım almadan tamamlayabilmelidir. Sık kullanılan eylemler görünür olmalı, teknik terimler yerine günlük dil kullanılmalıdır.",
          "Sistemin telefon, tablet ve bilgisayarda yatay kayma veya okunamayacak kadar küçük metin oluşturmadan çalışması önemlidir."
        ]
      },
      {
        heading: "Apartmanlar ve roller neden ayrılmalı?",
        paragraphs: [
          "Bir kullanıcı birden fazla apartmana katılabilir veya farklı topluluklarda farklı role sahip olabilir. Sistem her apartmanın sakinlerini, aidatlarını ve giderlerini kendi çalışma alanında tutmalıdır.",
          "Yönetim sahibi, yönetici ve sakin rolleri aynı yetkiye sahip olmamalıdır. Kayıt ekleme veya silme gibi işlemler yalnızca yetkili kullanıcılara açılmalıdır."
        ]
      },
      {
        heading: "Davet ve katılım süreci nasıl olmalı?",
        paragraphs: [
          "Sakinler uzun kurulum adımlarına zorlanmamalıdır. Yönetici katılma bağlantısını mesaj grubunda paylaşabilmeli veya e-posta adresine davet hazırlayabilmelidir.",
          "Katılan sakin kendi hesabıyla giriş yaptığında ilgili apartman otomatik olarak hesabına eklenmeli ve sakin listesinde görünmelidir."
        ]
      }
    ],
    faqs: [
      { question: "Apartman yönetim programı telefonda kullanılabilir mi?", answer: "Web tabanlı ve mobil uyumlu bir sistem, uygulama kurulmadan güncel telefon tarayıcılarından kullanılabilir." },
      { question: "Bir kişi birden fazla apartmana katılabilir mi?", answer: "Çoklu topluluk desteği bulunan sistemlerde kullanıcı tek hesabıyla birden fazla apartmana katılabilir ve aralarında geçiş yapabilir." },
      { question: "Sakin ve yönetici aynı işlemleri mi görür?", answer: "Hayır. Rol tabanlı sistemlerde kayıt oluşturma, silme ve yetki düzenleme gibi işlemler yöneticilere; görüntüleme işlemleri ise sakinlere uygun şekilde sınırlandırılır." }
    ]
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find(post => post.slug === slug);
}
