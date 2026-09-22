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

let profile = JSON.parse(localStorage.getItem('apartmanOS-profile') || 'null');
let state = JSON.parse(localStorage.getItem('apartmanOS-data') || 'null') || structuredClone(baseData);
const titles = {dashboard:'Genel Bakış',dues:'Aidat & Borçlar',expenses:'Giderler',announcements:'Duyurular',decisions:'Karar Defteri',residents:'Sakinler',settings:'Ayarlar'};
const pageContent = document.querySelector('#pageContent');
const pageTitle = document.querySelector('#pageTitle');
const dialog = document.querySelector('#actionDialog');
const fields = document.querySelector('#dialogFields');
let currentPage = 'dashboard';

function money(value){return new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(value)}
function persist(){localStorage.setItem('apartmanOS-data',JSON.stringify(state))}
function persistProfile(){localStorage.setItem('apartmanOS-profile',JSON.stringify(profile))}
function initials(name=''){return name.split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toLocaleUpperCase('tr') || 'OS'}
function syncIdentity(){
  if(!profile)return;
  document.querySelector('#siteName').textContent=profile.siteName;
  document.querySelector('#siteInitial').textContent=profile.siteName[0].toLocaleUpperCase('tr');
  document.querySelector('#siteSummary').textContent=`${profile.blockCount} blok · ${profile.unitCount} daire`;
  document.querySelector('#managerName').textContent=profile.managerName;
  document.querySelector('#profileInitials').textContent=initials(profile.managerName);
}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}

function dashboard(){
  const firstName=(profile?.managerName||'Yönetici').split(' ')[0];
  const community=profile?.siteName||'Apartmanınız';
  const paidItems=state.dues.filter(x=>x.status==='paid');
  const debtItems=state.dues.filter(x=>x.status!=='paid');
  const collected=paidItems.reduce((sum,x)=>sum+x.amount,0);
  const debt=debtItems.reduce((sum,x)=>sum+x.amount,0);
  const expenseTotal=state.expenses.reduce((sum,x)=>sum+x.amount,0);
  const rate=state.dues.length?Math.round((paidItems.length/state.dues.length)*100):0;
  return `<section class="welcome-row"><div><h1>Günaydın, ${firstName} 👋</h1><p>${community} için bugün bilmeniz gerekenler burada.</p></div><div class="quick-actions"><button class="button secondary" data-action="announcement">＋ Duyuru yap</button><button class="button primary" data-action="expense">＋ Gider ekle</button></div></section>
  <section class="stats-grid">
    <article class="stat-card"><div class="stat-head"><small>Toplanan aidat</small><span class="stat-icon">₺</span></div><h3>${money(collected)}</h3><span class="trend">${paidItems.length} ödeme tamamlandı</span></article>
    <article class="stat-card"><div class="stat-head"><small>Toplam borç</small><span class="stat-icon">!</span></div><h3>${money(debt)}</h3><span class="trend down">${debtItems.length} dairenin borcu var</span></article>
    <article class="stat-card"><div class="stat-head"><small>Bu ayki gider</small><span class="stat-icon">↗</span></div><h3>${money(expenseTotal)}</h3><span class="trend down">${state.expenses.length} gider kaydı</span></article>
    <article class="stat-card"><div class="stat-head"><small>Güncel kasa</small><span class="stat-icon">▣</span></div><h3>${money(collected-expenseTotal)}</h3><span class="trend">Tahmini bakiye</span></article>
  </section>
  <section class="dashboard-grid">
    <article class="panel"><div class="panel-head"><h2>Gelir &amp; gider özeti</h2><button class="text-button">Son 6 ay ⌄</button></div><div class="chart-area"><div class="chart-y"><span>40B</span><span>30B</span><span>20B</span><span>10B</span><span>0</span></div><div class="chart-main"><div class="chart-bars">${[['Nis',62,45],['May',73,51],['Haz',67,48],['Tem',81,56],['Ağu',76,52],['Eyl',88,55]].map(x=>`<div class="bar-group"><i class="bar" style="height:${x[1]}%"></i><i class="bar expense" style="height:${x[2]}%"></i><span class="bar-label">${x[0]}</span></div>`).join('')}</div></div></div><div class="chart-legend"><span>Gelir</span><span>Gider</span></div></article>
    <article class="panel"><div class="panel-head"><h2>Eylül aidat durumu</h2><button class="text-button" data-page-link="dues">Detaylar →</button></div><div class="progress-ring" style="--value:${rate}"><div><strong>%${rate}</strong><small>Tahsilat oranı</small></div></div><div class="collection-list"><div class="collection-row"><span>Ödeyen daire</span><strong>${paidItems.length} / ${state.dues.length}</strong></div><div class="collection-row"><span>Toplanan</span><strong>${money(collected)}</strong></div><div class="collection-row"><span>Beklenen</span><strong>${money(debt)}</strong></div></div></article>
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
function residents(){return `<section class="section-heading"><div><h1>Sakinler</h1><p>${profile?.unitCount||0} daireye ait güncel iletişim ve oturum bilgileri.</p></div><button class="button primary" data-action="resident">＋ Sakin ekle</button></section><section class="data-panel"><div class="toolbar"><label class="search"><span>⌕</span><input placeholder="Sakin veya daire ara" /></label><button class="button secondary">Tüm bloklar ⌄</button></div>${state.dues.length?`<div class="table-wrap"><table><thead><tr><th>SAKİN</th><th>TELEFON</th><th>OTURUM</th><th>AİDAT DURUMU</th></tr></thead><tbody>${state.dues.map(d=>`<tr><td><div class="person"><span class="avatar">${d.initials}</span><div><strong>${d.name}</strong><small>${d.unit}</small></div></div></td><td>${d.phone||'—'}</td><td>${d.occupancy||'Ev sahibi'}</td><td><span class="badge ${d.status}">${d.status==='paid'?'Borcu yok':'Borcu var'}</span></td></tr>`).join('')}</tbody></table></div>`:`<div class="empty-state"><span>♙</span><h2>Henüz sakin eklenmedi</h2><p>İlk daire ve sakin kaydını “Sakin ekle” düğmesiyle oluşturun.</p></div>`}</section>`}
function settings(){return `<section class="section-heading"><div><h1>Ayarlar</h1><p>Yönetim alanınızı kendi apartmanınıza göre düzenleyin.</p></div></section>
  <section class="settings-grid">
    <form class="panel settings-form" id="settingsForm"><div class="panel-head"><h2>Site bilgileri</h2><span class="badge paid">Aktif</span></div>
      <div class="field"><label>Site / apartman adı</label><input name="siteName" required value="${profile?.siteName||''}" /></div>
      <div class="field"><label>Yönetici adı</label><input name="managerName" required value="${profile?.managerName||''}" /></div>
      <div class="form-row"><div class="field"><label>Blok sayısı</label><input name="blockCount" type="number" min="1" value="${profile?.blockCount||1}" /></div><div class="field"><label>Daire sayısı</label><input name="unitCount" type="number" min="1" value="${profile?.unitCount||12}" /></div></div>
      <div class="field"><label>Aylık aidat</label><input name="monthlyDue" type="number" min="0" value="${profile?.monthlyDue||0}" /></div>
      <button class="button primary" type="submit">Değişiklikleri kaydet</button>
    </form>
    <div class="panel getting-started"><div class="panel-head"><h2>Nasıl kullanılır?</h2><span class="eyebrow">3 ADIM</span></div>
      <ol><li><span>1</span><div><strong>Sakinleri ekleyin</strong><p>Sakinler bölümünde daire ve kişi bilgilerini oluşturun.</p></div></li><li><span>2</span><div><strong>Aidatları takip edin</strong><p>Aidat kaydı ekleyin, ödeme geldiğinde “Ödendi” yapın.</p></div></li><li><span>3</span><div><strong>Yönetimi paylaşın</strong><p>Giderleri, duyuruları ve alınan kararları düzenli kaydedin.</p></div></li></ol>
      <div class="setup-note"><strong>Bilgi:</strong> Bu beta sürümündeki veriler şu anda kullandığınız tarayıcıda saklanır.</div>
    </div>
  </section>`}

const renderers={dashboard,dues,expenses,announcements,decisions,residents,settings};
function render(page=currentPage){currentPage=page;pageTitle.textContent=titles[page];pageContent.innerHTML=renderers[page]();document.querySelector('#debtCount').textContent=state.dues.filter(x=>x.status!=='paid').length;document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menuToggle').setAttribute('aria-expanded','false');bindPage()}

function bindPage(){
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>openDialog(b.dataset.action)));
  document.querySelectorAll('[data-page-link]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.pageLink)));
  document.querySelectorAll('[data-pay]').forEach(b=>b.addEventListener('click',()=>{const d=state.dues[+b.dataset.pay];d.status='paid';d.label='Ödendi';persist();render('dues');toast('Ödeme kaydı güncellendi.')}));
  const search=document.querySelector('#dueSearch');if(search)search.addEventListener('input',()=>{const q=search.value.toLocaleLowerCase('tr');document.querySelector('#dueRows').innerHTML=dueRows(state.dues.filter(d=>(d.name+' '+d.unit).toLocaleLowerCase('tr').includes(q)));bindPage()});
  const settingsForm=document.querySelector('#settingsForm');if(settingsForm)settingsForm.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));profile={...profile,...data,blockCount:+data.blockCount,unitCount:+data.unitCount,monthlyDue:+data.monthlyDue};persistProfile();syncIdentity();toast('Site bilgileriniz güncellendi.')});
}

const forms={
  expense:{title:'Gider ekle',html:`<div class="field"><label>Gider açıklaması</label><input name="title" required placeholder="Örn. Asansör bakımı" /></div><div class="field"><label>Kategori</label><select name="category"><option>Bakım</option><option>Fatura</option><option>Temizlik</option><option>Diğer</option></select></div><div class="field"><label>Tutar</label><input name="amount" type="number" min="1" required placeholder="0 ₺" /></div>`},
  announcement:{title:'Duyuru yap',html:`<div class="field"><label>Başlık</label><input name="title" required placeholder="Duyuru başlığı" /></div><div class="field"><label>Açıklama</label><textarea name="text" required placeholder="Sakinlerin bilmesi gerekenleri yazın"></textarea></div><div class="field"><label>Tür</label><select name="tag"><option>Bilgilendirme</option><option>Önemli</option><option>Toplantı</option></select></div>`},
  decision:{title:'Karar ekle',html:`<div class="field"><label>Karar başlığı</label><input name="title" required /></div><div class="field"><label>Karar metni</label><textarea name="text" required></textarea></div><div class="field"><label>Karar numarası</label><input name="tag" value="2026 / 19" required /></div>`},
  due:{title:'Aidat kaydı ekle',html:`<div class="field"><label>Sakin adı</label><input name="name" required /></div><div class="field"><label>Daire</label><input name="unit" required placeholder="A Blok · Daire 1" /></div><div class="field"><label>Tutar</label><input name="amount" type="number" value="${profile?.monthlyDue||0}" required /></div>`},
  resident:{title:'Sakin ekle',html:`<div class="field"><label>Ad soyad</label><input name="name" required /></div><div class="field"><label>Daire</label><input name="unit" required placeholder="A Blok · Daire 1" /></div><div class="field"><label>Telefon</label><input name="phone" type="tel" placeholder="05xx xxx xx xx" /></div><div class="field"><label>Oturum türü</label><select name="occupancy"><option>Ev sahibi</option><option>Kiracı</option></select></div>`}
};
function openDialog(type){const f=forms[type];dialog.dataset.type=type;document.querySelector('#dialogTitle').textContent=f.title;fields.innerHTML=f.html;dialog.showModal()}
document.querySelector('#actionForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const type=dialog.dataset.type;const now='22 Eyl 2026';if(type==='expense')state.expenses.unshift({...data,amount:+data.amount,date:now});if(type==='announcement')state.announcements.unshift({...data,date:'22 Eyl'});if(type==='decision')state.decisions.unshift({...data,date:now});if(type==='due')state.dues.unshift({...data,amount:+data.amount,initials:initials(data.name),status:'pending',label:'Bekliyor'});if(type==='resident')state.dues.unshift({...data,amount:profile?.monthlyDue||0,initials:initials(data.name),status:'pending',label:'Bekliyor'});persist();dialog.close();render(type==='announcement'?'announcements':type==='decision'?'decisions':type==='expense'?'expenses':type==='resident'?'residents':'dues');toast('Kayıt başarıyla eklendi.')});
document.querySelectorAll('.dialog-cancel').forEach(button=>button.addEventListener('click',()=>dialog.close()));
document.querySelector('#onboardingForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));profile={siteName:data.siteName.trim(),managerName:data.managerName.trim(),blockCount:+data.blockCount,unitCount:+data.unitCount,monthlyDue:+data.monthlyDue,period:data.period,createdAt:new Date().toISOString()};if(!data.sampleData){state={dues:[],expenses:[],announcements:[],decisions:[]};}persistProfile();persist();syncIdentity();document.querySelector('#onboardingDialog').close();render('dashboard');toast('Yönetim alanınız hazır. Hoş geldiniz!')});
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>render(n.dataset.page)));
document.querySelector('.help-card').addEventListener('click',()=>render('settings'));
document.querySelector('#menuToggle').addEventListener('click',e=>{const open=document.querySelector('#sidebar').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',open)});
document.addEventListener('click',e=>{if(innerWidth<=760&&!e.target.closest('.sidebar')&&!e.target.closest('#menuToggle'))document.querySelector('#sidebar').classList.remove('open')});
syncIdentity();
render();
if(!profile)document.querySelector('#onboardingDialog').showModal();
