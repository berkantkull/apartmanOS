const baseData = {
  dues: [
    {name:'Ayşe Yılmaz', unit:'A Blok · Daire 3', initials:'AY', amount:1850, status:'late', label:'Gecikmiş'},
    {name:'Mehmet Kaya', unit:'A Blok · Daire 8', initials:'MK', amount:1850, status:'pending', label:'Bekliyor'},
    {name:'Selin Demir', unit:'B Blok · Daire 4', initials:'SD', amount:1850, status:'paid', label:'Ödendi'},
    {name:'Ahmet Çelik', unit:'B Blok · Daire 9', initials:'AÇ', amount:3700, status:'late', label:'2 ay gecikmiş'},
    {name:'Zeynep Arslan', unit:'C Blok · Daire 2', initials:'ZA', amount:1850, status:'paid', label:'Ödendi'}
  ],
  expenses: [
    {title:'Asansör bakım ücreti', category:'Bakım', amount:4200, date:'18 Eyl 2026'},
    {title:'Ortak alan elektrik faturası', category:'Fatura', amount:3180, date:'15 Eyl 2026'},
    {title:'Bahçe düzenlemesi', category:'Peyzaj', amount:2450, date:'09 Eyl 2026'}
  ],
  announcements: [
    {title:'Su kesintisi hakkında', text:'Ana şebeke çalışması nedeniyle 24 Eylül 10.00–14.00 arasında su kesintisi olacaktır.', date:'24 Eyl', tag:'Önemli'},
    {title:'Aylık olağan toplantı', text:'Eylül ayı yönetim toplantısı sosyal tesiste yapılacaktır.', date:'27 Eyl', tag:'Toplantı'},
    {title:'Otopark çizgileri yenileniyor', text:'Çalışma süresince araçların B kapısı önüne bırakılmamasını rica ederiz.', date:'30 Eyl', tag:'Bilgilendirme'}
  ],
  decisions: [
    {title:'Kamera sisteminin yenilenmesi', text:'Teklifler değerlendirilerek 16 kameralı sistemin kurulmasına oy çokluğu ile karar verildi.', date:'12 Eyl 2026', tag:'2026 / 18'},
    {title:'Kış dönemi yakıt avansı', text:'Ekim ayında daire başına 2.500 ₺ yakıt avansı toplanmasına karar verildi.', date:'05 Eyl 2026', tag:'2026 / 17'}
  ]
};

const state = JSON.parse(localStorage.getItem('apartmanOS-data') || 'null') || structuredClone(baseData);
const titles = {dashboard:'Genel Bakış',dues:'Aidat & Borçlar',expenses:'Giderler',announcements:'Duyurular',decisions:'Karar Defteri',residents:'Sakinler',settings:'Ayarlar'};
const pageContent = document.querySelector('#pageContent');
const pageTitle = document.querySelector('#pageTitle');
const dialog = document.querySelector('#actionDialog');
const fields = document.querySelector('#dialogFields');
let currentPage = 'dashboard';

function money(value){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(value)}
function persist(){localStorage.setItem('apartmanOS-data',JSON.stringify(state))}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}

function dashboard(){
  return `<section class="welcome-row"><div><h1>Günaydın, Berkant 👋</h1><p>Yaşam Sitesi’nde bugün bilmeniz gerekenler burada.</p></div><div class="quick-actions"><button class="button secondary" data-action="announcement">＋ Duyuru yap</button><button class="button primary" data-action="expense">＋ Gider ekle</button></div></section>
  <section class="stats-grid">
    <article class="stat-card"><div class="stat-head"><small>Toplanan aidat</small><span class="stat-icon">₺</span></div><h3>₺35.150</h3><span class="trend">↑ %8 geçen aya göre</span></article>
    <article class="stat-card"><div class="stat-head"><small>Toplam borç</small><span class="stat-icon">!</span></div><h3>₺9.250</h3><span class="trend down">5 dairenin borcu var</span></article>
    <article class="stat-card"><div class="stat-head"><small>Bu ayki gider</small><span class="stat-icon">↗</span></div><h3>₺21.840</h3><span class="trend down">↑ %4 geçen aya göre</span></article>
    <article class="stat-card"><div class="stat-head"><small>Güncel kasa</small><span class="stat-icon">▣</span></div><h3>₺48.760</h3><span class="trend">Kasa durumu iyi</span></article>
  </section>
  <section class="dashboard-grid">
    <article class="panel"><div class="panel-head"><h2>Gelir &amp; gider özeti</h2><button class="text-button">Son 6 ay ⌄</button></div><div class="chart-area"><div class="chart-y"><span>40B</span><span>30B</span><span>20B</span><span>10B</span><span>0</span></div><div class="chart-main"><div class="chart-bars">${[['Nis',62,45],['May',73,51],['Haz',67,48],['Tem',81,56],['Ağu',76,52],['Eyl',88,55]].map(x=>`<div class="bar-group"><i class="bar" style="height:${x[1]}%"></i><i class="bar expense" style="height:${x[2]}%"></i><span class="bar-label">${x[0]}</span></div>`).join('')}</div></div></div><div class="chart-legend"><span>Gelir</span><span>Gider</span></div></article>
    <article class="panel"><div class="panel-head"><h2>Eylül aidat durumu</h2><button class="text-button" data-page-link="dues">Detaylar →</button></div><div class="progress-ring"><div><strong>%79</strong><small>Tahsilat oranı</small></div></div><div class="collection-list"><div class="collection-row"><span>Ödeyen daire</span><strong>19 / 24</strong></div><div class="collection-row"><span>Toplanan</span><strong>₺35.150</strong></div><div class="collection-row"><span>Beklenen</span><strong>₺9.250</strong></div></div></article>
    <article class="panel"><div class="panel-head"><h2>Son duyurular</h2><button class="text-button" data-page-link="announcements">Tümünü gör →</button></div><div class="announcements-list">${state.announcements.slice(0,2).map(a=>`<div class="announcement"><div class="date-box"><strong>${a.date.split(' ')[0]}</strong><small>${a.date.split(' ')[1]||'EYL'}</small></div><div><h3>${a.title}</h3><p>${a.text}</p></div></div>`).join('')}</div></article>
    <article class="panel"><div class="panel-head"><h2>Yaklaşan işler</h2><button class="text-button">Takvim →</button></div><div class="announcements-list"><div class="announcement"><div class="date-box"><strong>25</strong><small>EYL</small></div><div><h3>Asansör periyodik kontrolü</h3><p>10.00 · A ve B Blok</p></div></div><div class="announcement"><div class="date-box"><strong>01</strong><small>EKİ</small></div><div><h3>Yeni dönem aidat bildirimi</h3><p>Tüm dairelere otomatik bildirim</p></div></div></div></article>
  </section>`;
}

function dues(){return `<section class="section-heading"><div><h1>Aidat &amp; Borçlar</h1><p>Eylül 2026 tahsilatlarını ve geciken ödemeleri takip edin.</p></div><button class="button primary" data-action="due">＋ Aidat kaydı ekle</button></section><section class="data-panel"><div class="toolbar"><label class="search"><span>⌕</span><input id="dueSearch" placeholder="Sakin veya daire ara" /></label><button class="button secondary">Eylül 2026 ⌄</button></div><div class="table-wrap"><table><thead><tr><th>SAKİN</th><th>TUTAR</th><th>SON ÖDEME</th><th>DURUM</th><th></th></tr></thead><tbody id="dueRows">${dueRows(state.dues)}</tbody></table></div></section>`}
function dueRows(items){return items.map((d,i)=>`<tr><td><div class="person"><span class="avatar">${d.initials}</span><div><strong>${d.name}</strong><small>${d.unit}</small></div></div></td><td><strong>${money(d.amount)}</strong></td><td>30 Eylül 2026</td><td><span class="badge ${d.status}">${d.label}</span></td><td>${d.status==='paid'?'<span>—</span>':`<button class="row-action" data-pay="${state.dues.indexOf(d)}">Ödendi yap</button>`}</td></tr>`).join('')}
function expenses(){return listPage('Giderler','Ortak alan harcamalarını düzenli ve şeffaf biçimde izleyin.','expense','Gider ekle',state.expenses.map(x=>`<article class="content-card"><div class="meta"><span class="badge pending">${x.category}</span><span>${x.date}</span></div><h3>${x.title}</h3><p>Yaşam Sitesi ortak alan gideri</p><footer><span>Ödenen tutar</span><strong>${money(x.amount)}</strong></footer></article>`).join(''))}
function announcements(){return listPage('Duyurular','Tüm sakinlerin haberdar olması gereken gelişmeleri paylaşın.','announcement','Duyuru yap',state.announcements.map(x=>card(x)).join(''))}
function decisions(){return listPage('Karar Defteri','Yönetim kararlarını tarih ve karar numarasıyla kayıt altında tutun.','decision','Karar ekle',state.decisions.map(x=>card(x)).join(''))}
function card(x){return `<article class="content-card"><div class="meta"><span class="badge paid">${x.tag}</span><span>${x.date}</span></div><h3>${x.title}</h3><p>${x.text}</p><footer><span>Yaşam Sitesi Yönetimi</span><button class="text-button">Aç →</button></footer></article>`}
function listPage(title,subtitle,action,label,content){return `<section class="section-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><button class="button primary" data-action="${action}">＋ ${label}</button></section><section class="cards-list">${content}</section>`}
function residents(){return `<section class="section-heading"><div><h1>Sakinler</h1><p>24 daireye ait güncel iletişim ve oturum bilgileri.</p></div><button class="button primary">＋ Sakin ekle</button></section><section class="data-panel"><div class="toolbar"><label class="search"><span>⌕</span><input placeholder="Sakin veya daire ara" /></label><button class="button secondary">Tüm bloklar ⌄</button></div><div class="table-wrap"><table><thead><tr><th>SAKİN</th><th>TELEFON</th><th>OTURUM</th><th>AİDAT DURUMU</th></tr></thead><tbody>${state.dues.map(d=>`<tr><td><div class="person"><span class="avatar">${d.initials}</span><div><strong>${d.name}</strong><small>${d.unit}</small></div></div></td><td>05•• ••• •• ••</td><td>Ev sahibi</td><td><span class="badge ${d.status}">${d.status==='paid'?'Borcu yok':'Borcu var'}</span></td></tr>`).join('')}</tbody></table></div></section>`}
function settings(){return `<section class="section-heading"><div><h1>Ayarlar</h1><p>Site bilgilerini ve yönetim tercihlerini düzenleyin.</p></div></section><section class="data-panel empty-state"><span>⚙</span><h2>Yönetim ayarları</h2><p>Bildirim, yetki ve site bilgileri sonraki sürümde burada yönetilecek.</p></section>`}

const renderers={dashboard,dues,expenses,announcements,decisions,residents,settings};
function render(page=currentPage){currentPage=page;pageTitle.textContent=titles[page];pageContent.innerHTML=renderers[page]();document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menuToggle').setAttribute('aria-expanded','false');bindPage()}

function bindPage(){
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.action)));
  document.querySelectorAll('[data-page-link]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.pageLink)));
  document.querySelectorAll('[data-pay]').forEach(b=>b.addEventListener('click',()=>{const d=state.dues[+b.dataset.pay];d.status='paid';d.label='Ödendi';persist();render('dues');toast('Ödeme kaydı güncellendi.')}));
  const search=document.querySelector('#dueSearch');if(search)search.addEventListener('input',()=>{const q=search.value.toLocaleLowerCase('tr');document.querySelector('#dueRows').innerHTML=dueRows(state.dues.filter(d=>(d.name+' '+d.unit).toLocaleLowerCase('tr').includes(q)));bindPage()});
}

const forms={
  expense:{title:'Gider ekle',html:`<div class="field"><label>Gider açıklaması</label><input name="title" required placeholder="Örn. Asansör bakımı" /></div><div class="field"><label>Kategori</label><select name="category"><option>Bakım</option><option>Fatura</option><option>Temizlik</option><option>Diğer</option></select></div><div class="field"><label>Tutar</label><input name="amount" type="number" min="1" required placeholder="0 ₺" /></div>`},
  announcement:{title:'Duyuru yap',html:`<div class="field"><label>Başlık</label><input name="title" required placeholder="Duyuru başlığı" /></div><div class="field"><label>Açıklama</label><textarea name="text" required placeholder="Sakinlerin bilmesi gerekenleri yazın"></textarea></div><div class="field"><label>Tür</label><select name="tag"><option>Bilgilendirme</option><option>Önemli</option><option>Toplantı</option></select></div>`},
  decision:{title:'Karar ekle',html:`<div class="field"><label>Karar başlığı</label><input name="title" required /></div><div class="field"><label>Karar metni</label><textarea name="text" required></textarea></div><div class="field"><label>Karar numarası</label><input name="tag" value="2026 / 19" required /></div>`},
  due:{title:'Aidat kaydı ekle',html:`<div class="field"><label>Sakin adı</label><input name="name" required /></div><div class="field"><label>Daire</label><input name="unit" required placeholder="A Blok · Daire 1" /></div><div class="field"><label>Tutar</label><input name="amount" type="number" value="1850" required /></div>`}
};
function openDialog(type){const f=forms[type];dialog.dataset.type=type;document.querySelector('#dialogTitle').textContent=f.title;fields.innerHTML=f.html;dialog.showModal()}
document.querySelector('#actionForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const type=dialog.dataset.type;const now='22 Eyl 2026';if(type==='expense')state.expenses.unshift({...data,amount:+data.amount,date:now});if(type==='announcement')state.announcements.unshift({...data,date:'22 Eyl'});if(type==='decision')state.decisions.unshift({...data,date:now});if(type==='due')state.dues.unshift({...data,amount:+data.amount,initials:data.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase(),status:'pending',label:'Bekliyor'});persist();dialog.close();render(type==='announcement'?'announcements':type==='decision'?'decisions':type==='expense'?'expenses':'dues');toast('Kayıt başarıyla eklendi.')});
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>render(n.dataset.page)));
document.querySelector('#menuToggle').addEventListener('click',e=>{const open=document.querySelector('#sidebar').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});
document.addEventListener('click',e=>{if(innerWidth<=760&&!e.target.closest('.sidebar')&&!e.target.closest('#menuToggle'))document.querySelector('#sidebar').classList.remove('open')});
render();
