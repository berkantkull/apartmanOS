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
  keywords: string[];
  relatedSlugs: string[];
  sections: BlogSection[];
  faqs: BlogFaq[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "apartman-yonetim-programi-secerken-nelere-bakilmali",
    title: "Apartman Yönetim Programı Seçerken Nelere Bakılmalı?",
    description: "Apartman ve site yönetim programı seçerken aidat, duyuru, finans, arıza, toplantı, sakin, otopark ve kargo özelliklerini değerlendirin.",
    excerpt: "Yönetici ve sakinlerin gerçekten kullanabileceği bir apartman yönetim yazılımı için kapsamlı seçim rehberi.",
    category: "Dijital yönetim",
    publishedAt: "2026-09-24",
    updatedAt: "2026-10-01",
    readingTime: "9 dakika",
    answer: "İyi bir apartman yönetim programı; aidat ve ödeme takibini, gelir-gider kayıtlarını, duyuruları, arıza taleplerini, toplantı ve kararları, sakinleri, otoparkı ve kargoları aynı apartmana bağlı tek bir sistemde yönetmelidir. Seçim yaparken özellik sayısından önce kullanım kolaylığına, rol bazlı yetkilendirmeye, mobil uyuma, raporlamaya ve verilerin her site için ayrı tutulmasına bakılmalıdır.",
    keywords: ["apartman yönetim programı", "site yönetim programı", "apartman yönetimi uygulaması", "apartman yönetim sistemi", "apartmanOS"],
    relatedSlugs: ["apartman-aidat-takibi-nasil-yapilir", "apartman-ariza-talep-yonetimi", "daire-sakin-yonetimi-nasil-yapilir"],
    sections: [
      {
        heading: "Apartman yönetim programı hangi işleri tek yerde toplamalı?",
        paragraphs: [
          "Apartman yönetimi yalnızca aidat toplamaktan ibaret değildir. Yönetici aynı gün içinde bir ödemeyi işleyebilir, asansör arızasını takip edebilir, genel kurul gündemini hazırlayabilir ve teslim alınan kargoyu ilgili daireye bildirebilir. Bu kayıtlar farklı dosya ve mesaj gruplarında tutulduğunda bilgi kaybı ve tekrar eden işler oluşur.",
          "Doğru yazılım, günlük yönetim döngüsünü birbirine bağlı modüllerle tamamlar. Bir daireye ait borç, sakin, araç, otopark ve teslimat bilgileri aynı topluluğun parçası olarak kalır; yönetici ihtiyaç duyduğu kayda birkaç adımda ulaşır."
        ],
        bullets: ["Aidat, borç ve ödeme takibi", "Gelir-gider ve mali raporlama", "Duyuru ve bildirim yönetimi", "Arıza ve sakin talepleri", "Toplantı, genel kurul ve karar arşivi", "Daire, sakin, otopark ve kargo kayıtları"]
      },
      {
        heading: "Kullanım kolaylığı ve mobil uyum neden önemlidir?",
        paragraphs: [
          "Bir sistem ne kadar kapsamlı olursa olsun yöneticinin temel işlemleri yardım almadan tamamlayabilmesi gerekir. Menü adları günlük dilde olmalı, sık kullanılan eylemler görünür tutulmalı ve formlar gereksiz alanlarla uzatılmamalıdır.",
          "Sakin tarafında borç görüntüleme, duyuru okuma, talep oluşturma ve bildirim alma işlemleri telefonda rahatça yapılabilmelidir. PWA desteği bulunan web uygulamaları, mağazadan indirme zorunluluğu olmadan cihazın ana ekranına kurulabilir."
        ]
      },
      {
        heading: "Rol, apartman ve veri ayrımı nasıl çalışmalı?",
        paragraphs: [
          "Yönetim sahibi, yönetici, sakin, personel ve güvenlik aynı yetkilere sahip olmamalıdır. Ödeme silme, kullanıcı rolü değiştirme veya finansal rapor görüntüleme gibi işlemler göreve göre sınırlandırılmalıdır.",
          "Bir kullanıcının birden fazla apartman veya siteye katılabilmesi de önemlidir. Kullanıcı tek hesabıyla farklı topluluklar arasında geçiş yapabilmeli; her topluluğun kayıtları ve yetkileri birbirinden ayrı kalmalıdır."
        ]
      },
      {
        heading: "Raporlama ve belge üretiminde nelere bakılmalı?",
        paragraphs: [
          "Yönetici, ekrandaki sayfanın görüntüsünü değil, düzenli başlık ve tabloları olan gerçek bir belge indirebilmelidir. Aidat makbuzu, aylık finansal rapor, toplantı tutanağı ve karar belgeleri PDF olarak arşivlenebilmeli; veriler Excel uyumlu biçimde dışa aktarılabilmelidir.",
          "apartmanOS; aidat ve ödeme, gelir-gider, duyuru, arıza-talep, toplantı-karar, daire-sakin, otopark ve kargo modüllerini aynı yönetim alanında birleştirir. Kullanıcılar e-posta-şifre ya da Google hesabıyla giriş yapabilir."
        ]
      }
    ],
    faqs: [
      { question: "Apartman yönetim programı telefonda kullanılabilir mi?", answer: "Evet. Mobil uyumlu ve PWA destekli web uygulamaları güncel telefon tarayıcılarında çalışır ve cihazın ana ekranına kurulabilir." },
      { question: "Bir kişi birden fazla apartmana katılabilir mi?", answer: "Çoklu topluluk desteği bulunan sistemlerde kullanıcı tek hesabıyla birden fazla apartmana katılabilir ve yönetim alanları arasında geçiş yapabilir." },
      { question: "Apartman yönetim yazılımında hangi raporlar olmalı?", answer: "Aidat, borç, gelir-gider, blok ve daire kırılımları ile dönemsel mali özetler PDF ve Excel uyumlu olarak alınabilmelidir." },
      { question: "Sakin ve yönetici aynı ekranları mı görür?", answer: "Hayır. Rol tabanlı sistemlerde düzenleme işlemleri yöneticilere, kişisel borç, duyuru ve talep takibi ise sakinlere uygun biçimde sunulur." }
    ]
  },
  {
    slug: "apartman-aidat-takibi-nasil-yapilir",
    title: "Apartman Aidat Takibi Nasıl Yapılır? Ödeme ve Borç Rehberi",
    description: "Daire bazlı aidat oluşturma, geciken borç, faiz, kart veya EFT ödemesi, makbuz, hatırlatma ve aidat raporlama süreçlerini öğrenin.",
    excerpt: "Aidatları daire bazında oluşturun; ödenen, bekleyen ve geciken borçları aynı sistemde takip edin.",
    category: "Aidat ve ödeme",
    publishedAt: "2026-09-24",
    updatedAt: "2026-10-01",
    readingTime: "8 dakika",
    answer: "Apartman aidat takibi; her daire için dönem, tutar, son ödeme tarihi ve ödeme durumunun kaydedilmesiyle yapılır. Aylık aidatlar tüm aktif daireler için tek işlemle oluşturulmalı; kart, EFT veya manuel ödeme işlendiğinde borç güncellenmeli; ödenmiş, ödenmemiş ve gecikmiş kayıtlar ayrı izlenmelidir. Makbuz, hatırlatma ve blok-daire raporları da sürecin parçasıdır.",
    keywords: ["apartman aidat takibi", "aidat takip programı", "apartman borç sorgulama", "aidat ödeme sistemi", "aidat makbuzu"],
    relatedSlugs: ["apartman-gider-takibi-ve-seffaf-raporlama", "daire-sakin-yonetimi-nasil-yapilir", "apartman-yonetim-programi-secerken-nelere-bakilmali"],
    sections: [
      {
        heading: "Daire bazlı aidat kaydında hangi bilgiler bulunmalı?",
        paragraphs: [
          "Aidat kaydı yalnızca sakin adına bağlanmamalıdır; kiracı veya malik değişse bile dairenin mali geçmişi korunmalıdır. Bu nedenle blok, daire, dönem, tutar, son ödeme tarihi ve durum alanları birlikte tutulur.",
          "Ödeme tamamlandığında kayıt silinmez, ödendi durumuna geçirilir. Böylece yönetim değişiminde geçmiş tahsilatlar görülebilir ve dairenin toplam borcu doğru hesaplanır."
        ],
        bullets: ["Blok ve daire numarası", "Aidat dönemi ve tutarı", "Son ödeme tarihi", "Ödendi, bekliyor veya gecikmiş durumu", "Ödeme tarihi ve yöntemi"]
      },
      {
        heading: "Aylık aidat, ek borç ve gecikme faizi nasıl oluşturulur?",
        paragraphs: [
          "Standart aidat tutarı belirlendikten sonra aktif dairelerin tamamı için tek işlemle dönem kayıtları oluşturulabilir. Daireye özel farklı tutar, ek borç veya ekstra ödeme gerekiyorsa ilgili kayıt ayrıca düzenlenir.",
          "Son ödeme tarihi geçen kayıtlar gecikmiş olarak ayrılır. Yönetim gecikme faizi uyguluyorsa oran, başlangıç tarihi ve hesaplanan tutar açık biçimde kayda eklenmelidir."
        ]
      },
      {
        heading: "Kart, EFT ve manuel ödeme nasıl kaydedilir?",
        paragraphs: [
          "Sakin, yönetimin tanımladığı güvenli ödeme bağlantısı üzerinden kartla ödeme yapabilir veya havale/EFT bildiriminde bulunabilir. EFT bildirimi banka hareketiyle doğrulandıktan sonra yönetici tarafından onaylanır.",
          "Elden ya da banka üzerinden alınan ödemeler manuel girilebilir. Her ödeme yöntemi, tarih ve açıklamayla saklanmalı; tamamlanan işlem için daire ve dönemi gösteren aidat makbuzu üretilebilmelidir."
        ]
      },
      {
        heading: "Aidat raporları ve hatırlatmalar nasıl kullanılmalı?",
        paragraphs: [
          "Toplam tahakkuk, tahsil edilen tutar, bekleyen borç ve gecikmiş borç ayrı değerlerdir. Blok ve daire bazlı raporlar, dönemler arasındaki tahsilat performansını karşılaştırmayı sağlar.",
          "Borç durumuna göre filtreleme, ödeme bekleyen daireleri gösterir. Hatırlatmalar yalnızca ilgili borç sahiplerine yönlendirildiğinde iletişim daha doğru ve etkili olur."
        ]
      }
    ],
    faqs: [
      { question: "Aidat kaydı ödeme yapıldığında silinmeli mi?", answer: "Hayır. Ödeme yapılan kayıt ödendi durumuna geçirilir; böylece geçmiş tahsilatlar, makbuzlar ve dönem raporları korunur." },
      { question: "Aylık aidatlar tek tek mi eklenmeli?", answer: "Hayır. Aktif dairelerin tamamı için tek işlemle aidat oluşturmak daha hızlıdır ve veri giriş hatalarını azaltır." },
      { question: "Havale/EFT bildirimi doğrudan ödeme sayılır mı?", answer: "Hayır. Bildirimin banka hareketiyle doğrulanması ve yönetici tarafından onaylanması gerekir." },
      { question: "Sakin kendi ödeme geçmişini görebilir mi?", answer: "Evet. Yetkili olduğu daireye ait borçları, tamamlanan ödemeleri ve makbuzları hesabından görüntüleyebilir." }
    ]
  },
  {
    slug: "apartman-duyurulari-nasil-yonetilir",
    title: "Apartman Duyuru Sistemi Nasıl Olmalı? Bildirim ve Okunma Takibi",
    description: "Apartman geneli, blok veya daire bazlı duyuru; acil bildirim, fotoğraf-PDF eki, zamanlama, arşiv ve okunma takibi rehberi.",
    excerpt: "Doğru kişiye zamanında ulaşan, ekleri ve okunma durumu takip edilebilen apartman duyuruları hazırlayın.",
    category: "Duyuru sistemi",
    publishedAt: "2026-09-24",
    updatedAt: "2026-10-01",
    readingTime: "7 dakika",
    answer: "Etkili apartman duyuru sistemi; mesajı apartman geneline, belirli bloklara veya seçili dairelere gönderebilmeli; acil duyuruları öne çıkarmalı; fotoğraf, PDF ve dosya eklerini desteklemelidir. Yayın tarihi planlanabilmeli, sakinlere uygulama içi ve izin verdiklerinde push bildirim gitmeli, yönetici de duyuruyu kimlerin okuduğunu görebilmelidir.",
    keywords: ["apartman duyuru sistemi", "site yönetimi duyuru", "apartman bildirim uygulaması", "push bildirim", "duyuru okunma takibi"],
    relatedSlugs: ["apartman-ariza-talep-yonetimi", "apartman-genel-kurul-toplanti-karar-yonetimi", "daire-sakin-yonetimi-nasil-yapilir"],
    sections: [
      {
        heading: "Apartman, blok ve daire bazlı duyuru nasıl gönderilir?",
        paragraphs: [
          "Her bilginin bütün siteye gönderilmesi bildirim yorgunluğu yaratır. Su kesintisi yalnızca bir bloğu, bakım çalışması ise belirli daireleri etkiliyorsa hedef kitle buna göre seçilmelidir.",
          "Apartman geneli, blok ve daire seçimi sayesinde sakin yalnızca kendisini ilgilendiren mesajları görür. Yönetici de aynı metni farklı gruplara tekrar tekrar göndermek zorunda kalmaz."
        ]
      },
      {
        heading: "Acil duyuru ve kategoriler ne işe yarar?",
        paragraphs: [
          "Ani su kesintisi veya güvenlik uyarısı gibi konular acil olarak işaretlenebilir. Acil etiketi bildirimi daha görünür yapar ancak gerçekten acil olmayan içeriklerde kullanılmamalıdır.",
          "Bilgilendirme, bakım, toplantı, güvenlik ve acil kategorileri geçmiş kayıtları filtrelemeyi ve arşivde aranan duyuruya ulaşmayı kolaylaştırır."
        ]
      },
      {
        heading: "Fotoğraf, PDF, dosya ve yayın tarihi nasıl kullanılır?",
        paragraphs: [
          "Bakım görseli, toplantı gündemi veya resmi yazı duyuruya eklenebilir. İleri tarihli yayınlama, planlı bakım, ilaçlama veya toplantı duyurusunu önceden hazırlamayı sağlar.",
          "Yayınlanan içerikler silinmek yerine arşivde korunmalıdır. Dosya adı ve açıklaması, sakinin eki açmadan içeriğin ne olduğunu anlamasına yardımcı olur."
        ]
      },
      {
        heading: "Push bildirim ve okunma takibi nasıl çalışır?",
        paragraphs: [
          "PWA olarak kurulan uygulamada bildirim izni veren sakinlere yeni duyuru push bildirimiyle iletilebilir. Bildirime dokunan kullanıcı doğrudan ilgili duyuruyu açabilir.",
          "Yönetici okuyan ve henüz okumayan kişileri görebilir; kritik bir konuda gerekirse yalnızca okunmamış kullanıcıları yeniden bilgilendirebilir."
        ]
      }
    ],
    faqs: [
      { question: "Apartman duyurusu WhatsApp grubuna da gönderilmeli mi?", answer: "Bağlantı grupta paylaşılabilir; ancak asıl kaydın arşiv, hedefleme ve okunma takibi sağlayan yönetim sisteminde tutulması daha düzenlidir." },
      { question: "Push bildirim için sakin ne yapmalı?", answer: "Kullanıcının uygulamaya giriş yapması ve tarayıcı ya da PWA üzerinden bildirim izni vermesi gerekir." },
      { question: "Duyuruyu kimlerin okuduğu görülebilir mi?", answer: "Okunma takibi destekleyen sistemlerde yönetici okuyan ve okunmamış kullanıcıları ayrı görebilir." },
      { question: "Eski duyurular silinmeli mi?", answer: "Hatalı veya kişisel veri içeren bir kayıt değilse geçmiş duyurular arşivlenmeli ve tarih-kategoriyle bulunabilmelidir." }
    ]
  },
  {
    slug: "apartman-gider-takibi-ve-seffaf-raporlama",
    title: "Apartman Gelir Gider Takibi ve Şeffaf Mali Raporlama",
    description: "Apartman gelir-gider kaydı, fatura yükleme, kasa ve banka bakiyesi, grafikler ile aylık PDF ve Excel raporu hazırlama rehberi.",
    excerpt: "Gelirleri, ortak alan giderlerini ve belgeleri düzenli tutarak sakinlere anlaşılır mali rapor sunun.",
    category: "Gelir ve gider",
    publishedAt: "2026-09-24",
    updatedAt: "2026-10-01",
    readingTime: "8 dakika",
    answer: "Şeffaf apartman gelir-gider yönetiminde her hareket tarih, kategori, tutar, ödeme hesabı ve açıklamayla kaydedilir. Elektrik, su, doğalgaz, temizlik, asansör, bakım, personel ve sigorta gibi giderler sınıflandırılır; fatura veya fiş eklenir. Kasa ve banka bakiyeleri ayrı izlenir, aylık sonuçlar grafik, PDF ve Excel raporlarıyla paylaşılır.",
    keywords: ["apartman gelir gider takibi", "apartman gider takip programı", "site yönetimi mali rapor", "apartman kasa defteri", "gelir gider raporu"],
    relatedSlugs: ["apartman-aidat-takibi-nasil-yapilir", "apartman-genel-kurul-toplanti-karar-yonetimi", "apartman-yonetim-programi-secerken-nelere-bakilmali"],
    sections: [
      {
        heading: "Gelir ve gider kayıtlarında hangi bilgiler tutulmalı?",
        paragraphs: [
          "Her mali hareketin ne zaman, hangi amaçla ve hangi hesap üzerinden yapıldığı anlaşılmalıdır. Genel ifadeler yerine işlemi tanımlayan açıklama kullanılmalı; gelir ve gider birbirinden ayrı kayıt türleri olarak tutulmalıdır.",
          "Fatura, fiş veya sözleşme gibi dayanak belgelerin kayda eklenmesi dönem sonu kontrolünü kolaylaştırır."
        ],
        bullets: ["İşlem tarihi ve açıklaması", "Gelir veya gider türü", "Kategori ve tutar", "Kasa ya da banka hesabı", "Fatura, fiş veya destekleyici dosya"]
      },
      {
        heading: "Apartman gider kategorileri nasıl düzenlenir?",
        paragraphs: [
          "Elektrik, su, doğalgaz, temizlik, asansör, bakım-onarım, personel maaşı, sigorta ve diğer ortak alan giderleri ayrı kategorilerde izlenebilir. Yönetim, binanın ihtiyacına göre yeni kategori oluşturabilir.",
          "Tutarlı kategori kullanımı hangi kalemin bütçeyi artırdığını gösterir ve aylık-yıllık karşılaştırmayı kolaylaştırır."
        ]
      },
      {
        heading: "Kasa ve banka bakiyesi neden ayrı tutulmalı?",
        paragraphs: [
          "Kasa, elde bulunan nakdi; banka bakiyesi ise hesaplarda bulunan tutarı ifade eder. İki bakiyenin ayrı gösterilmesi gerçek mali durumu açık hale getirir.",
          "Aidat tahakkuku doğrudan gelir değildir. Yalnızca gerçekleşmiş tahsilatlar gelir hareketine yansıtılmalı; bekleyen aidatlar alacak olarak ayrı izlenmelidir."
        ]
      },
      {
        heading: "Aylık PDF ve Excel raporu nasıl hazırlanır?",
        paragraphs: [
          "Rapor; başlangıç bakiyesi, dönem gelirleri, kategori bazlı giderler, kasa-banka bakiyeleri ve dönem sonu sonucunu içermelidir. Grafikler, harcamaların dağılımını hızlıca anlatır.",
          "PDF raporu paylaşım ve arşiv için, Excel uyumlu çıktı ise kayıtlar üzerinde çalışma ve muhasebe aktarımı için kullanılır."
        ]
      }
    ],
    faqs: [
      { question: "Aidat tahakkuku gelir sayılır mı?", answer: "Tahakkuk beklenen tutarı gösterir. Gerçekleşmiş gelir, ödeme tamamlandığında kaydedilen tahsilattır." },
      { question: "Apartman giderlerine fiş veya fatura eklenebilir mi?", answer: "Evet. Destekleyen belgenin ilgili gider kaydına yüklenmesi denetimi ve dönem sonu arşivini kolaylaştırır." },
      { question: "Kasa bakiyesi nasıl hesaplanır?", answer: "Kasa hesabına giren gerçekleşmiş gelirlerden aynı hesaptan yapılan giderler çıkarılır. Banka hareketleri ayrı bakiyede izlenir." },
      { question: "Mali rapor hangi formatta alınmalı?", answer: "Paylaşım ve arşiv için PDF, veri üzerinde çalışma ve aktarım için Excel uyumlu format birlikte sunulmalıdır." }
    ]
  },
  {
    slug: "apartman-ariza-talep-yonetimi",
    title: "Apartman Arıza ve Talep Yönetimi Nasıl Yapılır?",
    description: "Sakinlerin fotoğraf veya videolu arıza bildirmesi, öncelik ve durum takibi, yönetici notu, çözüm kanıtı ve bildirim sürecini öğrenin.",
    excerpt: "Sakin taleplerini mesajlarda kaybetmeden kayıt, durum ve çözüm geçmişiyle yönetin.",
    category: "Arıza ve talepler",
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
    readingTime: "7 dakika",
    answer: "Apartman arıza ve talep yönetimi, sakinin kategori, açıklama, öncelik ve görsel ekleyerek kayıt oluşturmasıyla başlar. Yönetici talebi yeni, inceleniyor, işleme alındı, çözüldü veya iptal edildi durumlarıyla takip eder; not ve çözüm fotoğrafı ekler. Her değişiklik geçmişte saklanır ve talep sahibine bildirilir.",
    keywords: ["apartman arıza takip sistemi", "site yönetimi talep sistemi", "apartman şikayet uygulaması", "arıza bildirim uygulaması", "sakin talep yönetimi"],
    relatedSlugs: ["apartman-duyurulari-nasil-yonetilir", "daire-sakin-yonetimi-nasil-yapilir", "apartman-yonetim-programi-secerken-nelere-bakilmali"],
    sections: [
      {
        heading: "Sakin arıza bildirirken hangi bilgileri vermeli?",
        paragraphs: [
          "Kayıt, sorunun nerede görüldüğünü anlatan kısa bir başlıkla başlamalıdır. Açıklamada etkilenen alan, sorunun tekrarlanma durumu ve varsa güvenlik riski belirtilmelidir.",
          "Fotoğraf ve video, yöneticinin sorunu yerinde incelemeden önce anlamasını kolaylaştırır."
        ],
        bullets: ["Asansör, elektrik, su, ortak alan, temizlik veya güvenlik kategorisi", "Açık sorun açıklaması", "Düşük, normal, yüksek veya acil öncelik", "Fotoğraf ya da video", "İlgili blok ve alan"]
      },
      {
        heading: "Talep durumları ne anlama gelir?",
        paragraphs: [
          "Yeni durumu henüz ele alınmamış kaydı, inceleniyor ilk değerlendirmeyi, işleme alındı ise çözüm çalışmasının başladığını gösterir. Çözüldü ve iptal edildi durumları gerekçesiz kullanılmamalıdır.",
          "Durum değişiklikleri tarih ve işlemi yapan kullanıcıyla geçmişe eklenir. Bu kayıt, sakinin tekrar bilgi istemesini azaltır."
        ]
      },
      {
        heading: "Yönetici notu ve çözüm fotoğrafı neden önemlidir?",
        paragraphs: [
          "Yönetici, servis görüşmesini, planlanan müdahale tarihini ve yapılan işlemi not olarak kaydedebilir. Sakinle paylaşılacak bilgi ayrıca açık biçimde sunulur.",
          "İş tamamlandığında çözüm fotoğrafı veya sonuç notu eklemek kaydın neden kapatıldığını belgeler. Aynı arıza tekrarlandığında önceki müdahale geçmişi teknik ekibe yardımcı olur."
        ]
      },
      {
        heading: "Talep sahibine hangi bildirimler gönderilmeli?",
        paragraphs: [
          "Talep oluşturulduğunda kayıt numarası, durum değiştiğinde yeni aşama ve çözüm tamamlandığında sonuç bilgisi kullanıcıya iletilmelidir.",
          "Uygulama içi bildirimlerin yanında izin veren PWA kullanıcılarına push bildirimi gönderilmesi, sakinin gelişmeleri tekrar tekrar kontrol etme ihtiyacını azaltır."
        ]
      }
    ],
    faqs: [
      { question: "Sakin arıza kaydına video ekleyebilir mi?", answer: "Evet. Sistem dosya türü ve boyut sınırları içinde fotoğraf veya video ekini kabul edebilir." },
      { question: "Acil arıza nasıl belirlenir?", answer: "Can güvenliği, su baskını, elektrik tehlikesi veya erişimi tamamen engelleyen durumlar acil öncelikle işaretlenebilir." },
      { question: "Talep silinmeli mi, kapatılmalı mı?", answer: "Geçmişin korunması için kayıt çoğunlukla silinmek yerine çözüldü veya gerekçesiyle iptal edildi durumuna geçirilmelidir." },
      { question: "Sakin talebinin durumunu görebilir mi?", answer: "Evet. Kullanıcı kendi kaydının güncel durumunu, paylaşılan notları ve işlem geçmişini hesabından izleyebilir." }
    ]
  },
  {
    slug: "apartman-genel-kurul-toplanti-karar-yonetimi",
    title: "Apartman Genel Kurul, Toplantı ve Karar Yönetimi Rehberi",
    description: "Genel kurul tarihi, gündem, katılımcı, karar numarası, toplantı tutanağı, PDF belge, arşiv ve hatırlatma süreçlerini düzenleyin.",
    excerpt: "Toplantı davetinden karar ve tutanak arşivine kadar bütün süreci dijital olarak takip edin.",
    category: "Toplantı ve karar",
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
    readingTime: "8 dakika",
    answer: "Apartman toplantı ve karar yönetiminde önce tarih, saat, yer ve gündem belirlenir; katılımcılar ile katılım durumları kaydedilir. Toplantı sırasında notlar ve alınan kararlar karar numarasıyla işlenir. Tutanak ve ek belgeler yüklenir veya PDF oluşturulur; geçmiş toplantılar arşivlenir ve yaklaşan toplantılar için hatırlatma gönderilir.",
    keywords: ["apartman genel kurul toplantısı", "apartman karar defteri", "site yönetimi toplantı tutanağı", "apartman toplantı yönetimi", "karar tutanağı PDF"],
    relatedSlugs: ["apartman-duyurulari-nasil-yonetilir", "apartman-gider-takibi-ve-seffaf-raporlama", "daire-sakin-yonetimi-nasil-yapilir"],
    sections: [
      {
        heading: "Genel kurul toplantısı nasıl oluşturulur?",
        paragraphs: [
          "Toplantı kaydında tarih, saat, yer ve toplantı türü açıkça belirtilmelidir. Gündem maddeleri toplantıdan önce sıralanmalı; sakinlerin hazırlık yapabilmesi için duyuru ve hatırlatmayla paylaşılmalıdır.",
          "Toplantı bilgilerini tek kayıtta tutmak, farklı mesajlardaki tarih ve yer bilgilerinin karışmasını önler."
        ]
      },
      {
        heading: "Katılımcı ve katılım durumu nasıl izlenir?",
        paragraphs: [
          "Katılımcı listesi malik, vekil veya diğer katılım türleriyle tutulabilir. Katıldı, katılmadı ve bekleniyor durumları toplantı planlamasında kullanılır.",
          "Resmi yeterlilik ve çoğunluk değerlendirmesi yürürlükteki mevzuat ve yönetim planına göre yapılmalıdır."
        ]
      },
      {
        heading: "Karar numarası ve karar metni nasıl kaydedilir?",
        paragraphs: [
          "Her karar; numara, tarih, başlık, açıklama ve ilgili toplantıyla birlikte kaydedilmelidir. Metin neyin kabul veya reddedildiğini, uygulanacak süreyi ve sorumlu kişiyi açıkça anlatmalıdır.",
          "Kararların toplantıdan ayrı bir listede filtrelenebilmesi, yönetim dönemleri arasında devam eden işleri izlemeyi kolaylaştırır."
        ]
      },
      {
        heading: "Toplantı tutanağı ve belge arşivi nasıl hazırlanır?",
        paragraphs: [
          "Toplantı notları, gündem, katılımcılar ve kararlar kullanılarak düzenli bir PDF tutanak üretilebilir. İmzalı tutanak taraması, vekalet belgeleri ve ek dosyalar aynı toplantının arşivinde saklanabilir.",
          "Dijital arşiv fiziksel karar defteri ve saklanması gereken asıl belgelerin yerine geçtiği varsayılmadan, onları destekleyen bir düzen olarak kullanılmalıdır."
        ]
      }
    ],
    faqs: [
      { question: "Apartman toplantı tutanağı PDF olarak oluşturulabilir mi?", answer: "Evet. Toplantı bilgileri, katılımcılar, gündem ve kararlar düzenli bir PDF şablonuna aktarılabilir." },
      { question: "Karar numarası neden gereklidir?", answer: "Kararın daha sonra bulunmasını, ilgili toplantıyla eşleştirilmesini ve dönem boyunca sıralı izlenmesini kolaylaştırır." },
      { question: "Toplantı hatırlatması ne zaman gönderilmeli?", answer: "Yasal ve yönetim planındaki bildirim süreleri gözetilmeli; ayrıca yaklaşan toplantı için makul aralıklarla hatırlatma yapılmalıdır." },
      { question: "Dijital kayıt fiziksel karar defterinin yerini alır mı?", answer: "Resmi şekil ve saklama yükümlülükleri mevzuata göre değerlendirilmelidir. Dijital sistem hazırlama, erişim ve arşivlemeyi destekler." }
    ]
  },
  {
    slug: "daire-sakin-yonetimi-nasil-yapilir",
    title: "Daire ve Sakin Yönetimi Nasıl Yapılır? Malik, Kiracı ve Roller",
    description: "Blok-daire oluşturma, malik ve kiracı bilgileri, telefon, araç, otopark, borç, belge ve kullanıcı rollerini düzenleme rehberi.",
    excerpt: "Daire, malik, kiracı, iletişim, borç ve rol bilgilerini birbirine bağlı ve güncel tutun.",
    category: "Daire ve sakin",
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
    readingTime: "8 dakika",
    answer: "Daire ve sakin yönetimi, önce blok ve bağımsız bölüm kayıtlarının oluşturulmasıyla başlar. Malik ve kiracı rolleri ayrı tutulur; telefon, e-posta, sakin sayısı, araç, otopark, borç, ödeme geçmişi ve belgeler ilgili daireye bağlanır. Yönetici, sakin, personel ve güvenlik kullanıcılarına yalnızca görevleri kadar yetki verilir.",
    keywords: ["apartman sakin yönetimi", "daire takip programı", "malik kiracı takibi", "apartman kullanıcı rolleri", "site sakinleri yönetimi"],
    relatedSlugs: ["apartman-aidat-takibi-nasil-yapilir", "apartman-otopark-yonetimi-arac-takibi", "apartman-kargo-teslimat-sistemi"],
    sections: [
      {
        heading: "Blok ve daire kayıtları nasıl oluşturulur?",
        paragraphs: [
          "Yerleşim yapısı önce bloklara, ardından dairelere ayrılır. Her daire için numara, kat, aktiflik durumu ve gerekiyorsa bağımsız bölüm açıklaması tutulur.",
          "Sakin bilgileri daire kaydıyla ilişkili saklanmalıdır. Böylece kullanıcı değişse bile dairenin ödeme, araç, otopark ve belge geçmişi korunur."
        ]
      },
      {
        heading: "Malik ve kiracı ayrımı neden önemlidir?",
        paragraphs: [
          "Malik ve kiracının iletişim sorumlulukları farklı olabilir. Bir dairede hem malik hem kiracı kaydı bulunabilir; sistem kimin aktif sakin, kimin mülk sahibi olduğunu göstermelidir.",
          "Telefon ve e-posta, davet ve bildirim süreçlerinin temelidir. Bu bilgiler yalnızca yetkili kullanıcılar tarafından görülmeli ve güncel tutulmalıdır."
        ],
        bullets: ["Ad, soyad ve sakin türü", "Telefon ve e-posta", "Dairede yaşayan kişi sayısı", "Başlangıç ve ayrılış bilgisi", "Malik veya kiracı durumu"]
      },
      {
        heading: "Daireye hangi bilgiler bağlanabilir?",
        paragraphs: [
          "Dairenin toplam borcu ve ödeme geçmişi aidat kayıtlarından hesaplanır. Araçlar ve tahsis edilen otopark alanları aynı daire altında görüntülenebilir; birden fazla araç eklenebilir.",
          "Kira kontratı, teslim tutanağı veya yönetimle ilgili diğer evraklar daireye ait belge alanında arşivlenebilir."
        ]
      },
      {
        heading: "Roller ve sakin daveti nasıl yönetilir?",
        paragraphs: [
          "Yönetici finansal ve idari kayıtları düzenler; sakin kendi dairesiyle ilgili borç, duyuru ve taleplere ulaşır. Personel ve güvenlik yalnızca görevlerine uygun ekranları görür.",
          "Yönetici e-posta daveti gönderebilir, davet kodunu paylaşabilir veya WhatsApp grubuna katılma bağlantısı bırakabilir. Davet bekliyor ve katıldı durumları ayrı izlenir."
        ]
      }
    ],
    faqs: [
      { question: "Bir dairede malik ve kiracı birlikte kaydedilebilir mi?", answer: "Evet. İki kişi farklı sakin türleriyle aynı daireye bağlanabilir; aktif kullanım ve iletişim bilgileri ayrı tutulabilir." },
      { question: "Sakinlerden telefon numarası istenebilir mi?", answer: "İletişim amacı ve erişim yetkileri açık olmak kaydıyla telefon bilgisi tutulabilir; kişisel veri yükümlülükleri gözetilmelidir." },
      { question: "Bir kullanıcı birden fazla siteye katılabilir mi?", answer: "Evet. Kullanıcı tek hesabıyla farklı apartman ve sitelere katılabilir, her birinde farklı role sahip olabilir." },
      { question: "Ayrılan sakinin geçmiş ödemeleri silinir mi?", answer: "Hayır. Aktif üyelik sonlandırılabilir ancak dairenin mali geçmişi ve gerekli denetim kayıtları korunmalıdır." }
    ]
  },
  {
    slug: "apartman-otopark-yonetimi-arac-takibi",
    title: "Apartman Otopark Yönetimi ve Araç Takibi Nasıl Yapılır?",
    description: "Otopark alanı tanımlama, daireye tahsis, plaka ve araç kaydı, misafir araç, doluluk, giriş-çıkış geçmişi ve QR geçiş rehberi.",
    excerpt: "Otopark alanlarını, sakin ve misafir araçlarını, doluluk ile giriş-çıkış hareketlerini düzenli yönetin.",
    category: "Otopark yönetimi",
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
    readingTime: "7 dakika",
    answer: "Apartman otopark yönetiminde önce numaralı alanlar tanımlanır ve uygun alanlar dairelere tahsis edilir. Sakin araçları plaka, marka-model, renk ve sahip bilgisiyle kaydedilir; misafir araçlar süreli olarak eklenir. Doluluk ile giriş-çıkış geçmişi izlenir ve QR kod, yetkili aracın hızlı doğrulanması için kullanılabilir.",
    keywords: ["apartman otopark yönetimi", "site araç takip sistemi", "otopark takip programı", "plaka kayıt sistemi", "QR araç giriş sistemi"],
    relatedSlugs: ["daire-sakin-yonetimi-nasil-yapilir", "apartman-kargo-teslimat-sistemi", "apartman-yonetim-programi-secerken-nelere-bakilmali"],
    sections: [
      {
        heading: "Otopark alanları nasıl tanımlanır ve tahsis edilir?",
        paragraphs: [
          "Her park alanına benzersiz bir numara veya kısa kod verilmelidir. Blok, kat, kapalı-açık alan ve kullanım durumu alanı fiziksel konumuyla eşleştirmeyi kolaylaştırır.",
          "Tahsis işlemi alanı bir daireyle ilişkilendirir. Kalıcı, geçici veya ortak kullanım açıklamayla kaydedilmeli; alan değiştiğinde eski geçmiş silinmemelidir."
        ]
      },
      {
        heading: "Araç kaydında hangi bilgiler bulunmalı?",
        paragraphs: [
          "Plaka temel tanımlayıcıdır; marka, model ve renk güvenliğin aracı görsel olarak doğrulamasına yardımcı olur. Araç sahibi ve ilişkili daire aynı kayıtta görünmelidir.",
          "Bir daireye birden fazla araç eklenebilir. Ancak kayıtlı araç sayısı ile tahsis edilen park alanı sayısı birbirinden ayrı gösterilmelidir."
        ],
        bullets: ["Plaka", "Marka ve model", "Araç rengi", "Araç sahibi", "Bağlı daire ve otopark alanı"]
      },
      {
        heading: "Misafir araç ve doluluk takibi nasıl yapılır?",
        paragraphs: [
          "Misafir araç kaydında ziyaret edilen daire, plaka, giriş zamanı ve beklenen çıkış zamanı tutulabilir. Süresi dolan ancak çıkışı işlenmeyen kayıtlar kontrol listesinde görünmelidir.",
          "Otopark doluluğu tahsis edilmiş alanlar ile o anda kullanılan alanları ayrı göstermelidir."
        ]
      },
      {
        heading: "QR kod ile araç girişi nasıl çalışır?",
        paragraphs: [
          "Araç veya geçici ziyaret kaydı için üretilen QR kod, güvenlik tarafından tarandığında yetki ve kayıt bilgilerini açabilir. Sonuç giriş veya çıkış hareketine dönüştürülerek zaman damgasıyla geçmişe eklenir.",
          "QR kod tek başına fiziksel bariyer güvenliği değildir. Geçerlilik süresi ve iptal seçenekleri tanımlanmalı; gerektiğinde plaka da doğrulanmalıdır."
        ]
      }
    ],
    faqs: [
      { question: "Bir daireye birden fazla araç eklenebilir mi?", answer: "Evet. Her araç ayrı plaka ve özelliklerle aynı daireye bağlanabilir; park alanı tahsisi ayrıca yönetilir." },
      { question: "Misafir araç kaydı ne kadar süre saklanır?", answer: "Süre yönetimin güvenlik ve kişisel veri politikasına göre belirlenmeli; gereğinden uzun tutulmamalıdır." },
      { question: "Otopark doluluk durumu anlık görülebilir mi?", answer: "Giriş-çıkış hareketleri düzenli işlendiğinde kullanılan ve boş alanların güncel özeti görüntülenebilir." },
      { question: "QR kod başkasına gönderilirse ne olur?", answer: "Süreli ve iptal edilebilir kod kullanılmalı; güvenlik gerektiğinde plakayı kayıtla karşılaştırmalıdır." }
    ]
  },
  {
    slug: "apartman-kargo-teslimat-sistemi",
    title: "Apartman Kargo ve Teslimat Sistemi Nasıl Çalışır?",
    description: "Güvenlik veya yönetici için daire, sakin, kargo firması, takip numarası, bildirim, teslim alan kişi, geçmiş ve hatırlatma rehberi.",
    excerpt: "Gelen kargoyu doğru daireye kaydedin, sakine bildirin ve teslim sürecini kayıt altında tutun.",
    category: "Kargo ve teslimat",
    publishedAt: "2026-10-01",
    updatedAt: "2026-10-01",
    readingTime: "7 dakika",
    answer: "Apartman kargo sistemi, güvenlik veya yöneticinin gelen paketi daire, sakin, kargo firması, takip numarası ve geliş tarihiyle kaydetmesini sağlar. Kayıtla birlikte sakine “Kargonuz geldi” bildirimi gönderilir. Paket teslim edildiğinde teslim alan kişi ve zaman kaydedilir; bekleyen, geciken ve geçmiş teslimatlar ayrı listelenir.",
    keywords: ["apartman kargo takip sistemi", "site kargo teslimat uygulaması", "kargonuz geldi bildirimi", "güvenlik kargo kaydı", "apartman teslimat sistemi"],
    relatedSlugs: ["daire-sakin-yonetimi-nasil-yapilir", "apartman-duyurulari-nasil-yonetilir", "apartman-otopark-yonetimi-arac-takibi"],
    sections: [
      {
        heading: "Gelen kargo nasıl kaydedilir?",
        paragraphs: [
          "Güvenlik veya yetkili yönetici önce daireyi, ardından o dairede kayıtlı sakini seçer. Kargo firması, takip numarası, geliş tarihi ve kısa not eklenerek teslimat kaydı oluşturulur.",
          "Daire ile sakin seçiminin bağlantılı olması yanlış kişiye bildirim gönderilmesini önler."
        ],
        bullets: ["Blok ve daire", "Teslim alacak sakin", "Kargo firması ve takip numarası", "Geliş tarihi ve saati", "Bekliyor, bildirildi veya teslim edildi durumu"]
      },
      {
        heading: "Kargonuz geldi bildirimi nasıl gönderilir?",
        paragraphs: [
          "Kargo kaydı oluşturulduğunda ilgili sakine uygulama içi bildirim gönderilebilir. Bildirim izni veren PWA kullanıcıları aynı uyarıyı push bildirimi olarak görebilir.",
          "Mesajda geliş zamanı ve teslim noktası yer almalı; takip numarası gibi gereksiz ayrıntılar kilit ekranında gösterilmemelidir."
        ]
      },
      {
        heading: "Teslim edilen kargo nasıl kapatılır?",
        paragraphs: [
          "Paket teslim edildiğinde kayıt silinmez, teslim edildi durumuna geçirilir. Teslim alan kişinin adı ve teslim zamanı kaydedilir.",
          "Teslim alan kişi her zaman daire sakini olmayabilir. Yetkilendirilmiş yakına teslim edildiğinde bu bilgi açıkça yazılmalıdır."
        ]
      },
      {
        heading: "Bekleyen kargolar ve hatırlatmalar nasıl takip edilir?",
        paragraphs: [
          "Bekleyen listesi, henüz teslim edilmeyen paketleri geliş tarihine göre gösterir. Uzun süredir alınmayan kayıtlar filtrelenebilir ve ilgili sakine yeniden hatırlatma gönderilebilir.",
          "Kargo geçmişi durum, firma, daire ve tarih filtreleri sayesinde belirli bir paketin kaydına hızlıca ulaşmayı sağlar."
        ]
      }
    ],
    faqs: [
      { question: "Kargo geldiğinde sakine otomatik bildirim gider mi?", answer: "Kayıt oluşturulduğunda sistem ilgili sakine uygulama içi bildirim gönderir; bildirim izni varsa PWA push uyarısı da iletilebilir." },
      { question: "Takip numarası olmadan kargo kaydı açılabilir mi?", answer: "Evet. Daire, sakin, firma ve açıklama bilgileriyle kayıt oluşturulabilir; takip numarası daha sonra eklenebilir." },
      { question: "Kargoyu başka biri teslim alırsa nasıl kaydedilir?", answer: "Teslim alan kişinin adı ve teslim zamanı kayda yazılır. Gerekirse yetkilendirme veya açıklama eklenir." },
      { question: "Teslim edilmeyen kargolar için hatırlatma gönderilebilir mi?", answer: "Evet. Bekleyen veya gecikmiş kayıtlar filtrelenerek ilgili sakinlere yeniden bildirim gönderilebilir." }
    ]
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find(post => post.slug === slug);
}
