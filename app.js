const sampleData = {
  dues: [
    {name:'Ayşe Yılmaz',unit:'A Blok · Daire 3',amount:1850,status:'late',label:'Gecikmiş',phone:'0532 000 00 03',occupancy:'Ev sahibi'},
    {name:'Mehmet Kaya',unit:'A Blok · Daire 8',amount:1850,status:'pending',label:'Bekliyor',phone:'0532 000 00 08',occupancy:'Kiracı'},
    {name:'Selin Demir',unit:'B Blok · Daire 4',amount:1850,status:'paid',label:'Ödendi',phone:'0532 000 00 14',occupancy:'Ev sahibi'}
  ],
  expenses: [
    {title:'Asansör bakım ücreti',category:'Bakım',amount:4200,date:'18 Eyl 2026',note:'Aylık periyodik bakım.'},
    {title:'Ortak alan elektrik faturası',category:'Fatura',amount:3180,date:'15 Eyl 2026',note:'Ortak alan ve bahçe aydınlatması.'}
  ],
  announcements: [
    {title:'Su kesintisi hakkında',text:'Ana şebeke çalışması nedeniyle 24 Eylül 10.00–14.00 arasında su kesintisi olacaktır.',date:'24 Eyl 2026',tag:'Önemli'},
    {title:'Aylık olağan toplantı',text:'Eylül ayı yönetim toplantısı sosyal tesiste yapılacaktır.',date:'27 Eyl 2026',tag:'Toplantı'}
  ],
  decisions: [
    {title:'Kamera sisteminin yenilenmesi',text:'Teklifler değerlendirilerek 16 kameralı sistemin kurulmasına oy çokluğu ile karar verildi.',date:'12 Eyl 2026',tag:'2026 / 18'}
  ]
};

const emptyData = () => ({dues:[],expenses:[],announcements:[],decisions:[]});
const makeId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const normalize = data => {
  const next={...emptyData(),...(data||{})};
  Object.keys(next).forEach(key=>next[key]=Array.isArray(next[key])?next[key].map(item=>({...item,id:item.id||makeId()})):[]);
  return next;
};

let profile=JSON.parse(localStorage.getItem('apartmanOS-profile')||'null');
let state=normalize(JSON.parse(localStorage.getItem('apartmanOS-data')||'null'));
let currentPage='dashboard';
let detailTarget=null;

const titles={dashboard:'Genel Bakış',dues:'Aidat & Borçlar',expenses:'Giderler',announcements:'Duyurular',decisions:'Karar Defteri',residents:'Sakinler',settings:'Ayarlar'};
const pageContent=document.querySelector('#pageContent');
const pageTitle=document.querySelector('#pageTitle');
const actionDialog=document.querySelector('#actionDialog');
const detailDialog=document.querySelector('#detailDialog');
const fields=document.querySelector('#dialogFields');

const esc=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
const money=value=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(Number(value)||0);
const initials=name=>String(name||'').split(/\s+/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toLocaleUpperCase('tr')||'OS';
const today=()=>new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'short',year:'numeric'}).format(new Date());
const persist=()=>localStorage.setItem('apartmanOS-data',JSON.stringify(state));
const persistProfile=()=>localStorage.setItem('apartmanOS-profile',JSON.stringify(profile));
const toast=message=>{const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)};

function syncIdentity(){
  document.querySelector('#currentDate').textContent=new Intl.DateTimeFormat('tr-TR',{dateStyle:'full'}).format(new Date());
  if(!profile)return;
  document.querySelector('#siteName').textContent=profile.siteName;
  document.querySelector('#siteInitial').textContent=profile.siteName[0]?.toLocaleUpperCase('tr')||'A';
  document.querySelector('#siteSummary').textContent=`${profile.blockCount} blok · ${profile.unitCount} daire`;
  document.querySelector('#managerName').textContent=profile.managerName;
  document.querySelector('#profileInitials').textContent=initials(profile.managerName);
  document.querySelector('#profileMenuName').textContent=profile.managerName;
}

function emptyBlock(icon,title,text,action,label){return `<div class="empty-state"><span>${icon}</span><h2>${title}</h2><p>${text}</p>${action?`<button class="button primary" data-action="${action}">＋ ${label}</button>`:''}</div>`}

function dashboard(){
  const paid=state.dues.filter(x=>x.status==='paid');
  const unpaid=state.dues.filter(x=>x.status!=='paid');
  const collected=paid.reduce((s,x)=>s+Number(x.amount||0),0);
  const debt=unpaid.reduce((s,x)=>s+Number(x.amount||0),0);
  const expenses=state.expenses.reduce((s,x)=>s+Number(x.amount||0),0);
  const rate=state.dues.length?Math.round(paid.length/state.dues.length*100):0;
  const firstName=(profile?.managerName||'Yönetici').split(' ')[0];
  const recentExpenses=state.expenses.slice(0,3);
  return `<section class="welcome-row"><div><h1>Günaydın, ${esc(firstName)} 👋</h1><p>${esc(profile?.siteName||'Apartmanınız')} için güncel durum.</p></div><div class="quick-actions"><button class="button secondary" data-action="announcement">＋ Duyuru yap</button><button class="button primary" data-action="expense">＋ Gider ekle</button></div></section>
  <section class="stats-grid">
    <article class="stat-card"><div class="stat-head"><small>Toplanan aidat</small><span class="stat-icon">₺</span></div><h3>${money(collected)}</h3><span class="trend">${paid.length} ödeme tamamlandı</span></article>
    <article class="stat-card"><div class="stat-head"><small>Toplam borç</small><span class="stat-icon">!</span></div><h3>${money(debt)}</h3><span class="trend down">${unpaid.length} bekleyen ödeme</span></article>
    <article class="stat-card"><div class="stat-head"><small>Toplam gider</small><span class="stat-icon">↗</span></div><h3>${money(expenses)}</h3><span class="trend down">${state.expenses.length} gider kaydı</span></article>
    <article class="stat-card"><div class="stat-head"><small>Güncel kasa</small><span class="stat-icon">▣</span></div><h3>${money(collected-expenses)}</h3><span class="trend">Tahmini bakiye</span></article>
  </section>
  <section class="dashboard-grid">
    <article class="panel"><div class="panel-head"><h2>Son giderler</h2><button class="text-button" data-page-link="expenses">Tümünü gör →</button></div>${recentExpenses.length?`<div class="collection-list">${recentExpenses.map(x=>`<div class="collection-row"><span>${esc(x.title)} · ${esc(x.date)}</span><strong>${money(x.amount)}</strong></div>`).join('')}</div>`:`<div class="empty-compact"><strong>Henüz gider yok</strong>İlk giderinizi ekleyerek kasayı takip etmeye başlayın.</div>`}</article>
    <article class="panel"><div class="panel-head"><h2>Aidat durumu</h2><button class="text-button" data-page-link="dues">Detaylar →</button></div><div class="progress-ring" style="--value:${rate}"><div><strong>%${rate}</strong><small>Tahsilat oranı</small></div></div><div class="collection-list"><div class="collection-row"><span>Ödeyen daire</span><strong>${paid.length} / ${state.dues.length}</strong></div><div class="collection-row"><span>Toplanan</span><strong>${money(collected)}</strong></div><div class="collection-row"><span>Beklenen</span><strong>${money(debt)}</strong></div></div></article>
    <article class="panel"><div class="panel-head"><h2>Son duyurular</h2><button class="text-button" data-page-link="announcements">Tümünü gör →</button></div>${state.announcements.length?`<div class="announcements-list">${state.announcements.slice(0,2).map(a=>`<button class="announcement announcement-button" data-open="announcements" data-id="${a.id}"><div class="date-box"><strong>${esc(a.date.split(' ')[0])}</strong><small>${esc(a.date.split(' ')[1]||'')}</small></div><div><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div></button>`).join('')}</div>`:`<div class="empty-compact"><strong>Henüz duyuru yok</strong>Sakinlere iletmek istediğiniz bilgileri burada paylaşın.</div>`}</article>
    <article class="panel"><div class="panel-head"><h2>Hızlı başlangıç</h2><button class="text-button" data-page-link="settings">Rehberi aç →</button></div><div class="collection-list"><div class="collection-row"><span>Sakin kayıtları</span><strong>${state.dues.length} kişi</strong></div><div class="collection-row"><span>Duyurular</span><strong>${state.announcements.length} kayıt</strong></div><div class="collection-row"><span>Kararlar</span><strong>${state.decisions.length} kayıt</strong></div></div></article>
  </section>`;
}

function duesRows(items){return items.map(d=>`<tr><td><div class="person"><span class="avatar">${initials(d.name)}</span><div><strong>${esc(d.name)}</strong><small>${esc(d.unit)}</small></div></div></td><td><strong>${money(d.amount)}</strong></td><td>${esc(d.dueDate||'Ay sonu')}</td><td><span class="badge ${esc(d.status)}">${esc(d.label)}</span></td><td><div class="row-actions"><button class="row-action" data-toggle-paid="${d.id}">${d.status==='paid'?'Bekliyor yap':'Ödendi yap'}</button><button class="row-action danger" data-delete="dues" data-id="${d.id}">Sil</button></div></td></tr>`).join('')}
function dues(){return `<section class="section-heading"><div><h1>Aidat &amp; Borçlar</h1><p>${esc(profile?.period||new Date().getFullYear())} dönemi tahsilatlarını takip edin.</p></div><button class="button primary" data-action="due">＋ Aidat kaydı ekle</button></section><section class="data-panel"><div class="toolbar"><label class="search"><span>⌕</span><input id="dueSearch" placeholder="Sakin veya daire ara" /></label><span class="badge paid">Güncel dönem</span></div>${state.dues.length?`<div class="table-wrap"><table><thead><tr><th>SAKİN</th><th>TUTAR</th><th>SON ÖDEME</th><th>DURUM</th><th>İŞLEM</th></tr></thead><tbody id="dueRows">${duesRows(state.dues)}</tbody></table></div>`:emptyBlock('₺','Henüz aidat kaydı yok','Sakin veya daire için ilk aidat kaydını oluşturun.','due','Aidat kaydı ekle')}</section>`}

function recordCard(x,type){const isExpense=type==='expenses';return `<article class="content-card"><div class="meta"><span class="badge ${isExpense?'pending':'paid'}">${esc(isExpense?x.category:x.tag)}</span><span>${esc(x.date)}</span></div><h3>${esc(x.title)}</h3><p>${esc(isExpense?(x.note||'Ortak alan gideri'):x.text)}</p><footer><span>${isExpense?money(x.amount):'Yönetim kaydı'}</span><div class="card-actions"><button data-open="${type}" data-id="${x.id}">Aç →</button><button data-delete="${type}" data-id="${x.id}">Sil</button></div></footer></article>`}
function listPage({title,subtitle,action,label,items,type,icon,emptyTitle,emptyText}){return `<section class="section-heading"><div><h1>${title}</h1><p>${subtitle}</p></div><button class="button primary" data-action="${action}">＋ ${label}</button></section>${items.length?`<section class="cards-list">${items.map(x=>recordCard(x,type)).join('')}</section>`:`<section class="data-panel">${emptyBlock(icon,emptyTitle,emptyText,action,label)}</section>`}`}
function expenses(){return listPage({title:'Giderler',subtitle:'Ortak alan harcamalarını şeffaf biçimde izleyin.',action:'expense',label:'Gider ekle',items:state.expenses,type:'expenses',icon:'↗',emptyTitle:'Henüz gider yok',emptyText:'İlk gider kaydını ekleyerek kasa takibine başlayın.'})}
function announcements(){return listPage({title:'Duyurular',subtitle:'Sakinlerin haberdar olması gereken gelişmeleri paylaşın.',action:'announcement',label:'Duyuru yap',items:state.announcements,type:'announcements',icon:'◌',emptyTitle:'Henüz duyuru yok',emptyText:'İlk duyurunuzu oluşturup sakinlerle paylaşın.'})}
function decisions(){return listPage({title:'Karar Defteri',subtitle:'Yönetim kararlarını tarih ve numarasıyla kaydedin.',action:'decision',label:'Karar ekle',items:state.decisions,type:'decisions',icon:'✓',emptyTitle:'Henüz karar kaydı yok',emptyText:'Alınan ilk yönetim kararını kayıt altına alın.'})}

function residentRows(items){return items.map(d=>`<tr><td><div class="person"><span class="avatar">${initials(d.name)}</span><div><strong>${esc(d.name)}</strong><small>${esc(d.unit)}</small></div></div></td><td>${esc(d.phone||'—')}</td><td>${esc(d.occupancy||'Ev sahibi')}</td><td><span class="badge ${esc(d.status)}">${d.status==='paid'?'Borcu yok':'Borcu var'}</span></td><td><button class="row-action danger" data-delete="dues" data-id="${d.id}">Sil</button></td></tr>`).join('')}
function residents(){const blocks=[...new Set(state.dues.map(d=>(d.unit.match(/^(.+? Blok)/)||[])[1]).filter(Boolean))];return `<section class="section-heading"><div><h1>Sakinler</h1><p>${profile?.unitCount||0} daire için sakin bilgilerini yönetin.</p></div><button class="button primary" data-action="resident">＋ Sakin ekle</button></section><section class="data-panel"><div class="toolbar"><label class="search"><span>⌕</span><input id="residentSearch" placeholder="Sakin veya daire ara" /></label><select id="blockFilter" aria-label="Blok filtresi"><option value="">Tüm bloklar</option>${blocks.map(b=>`<option>${esc(b)}</option>`).join('')}</select></div>${state.dues.length?`<div class="table-wrap"><table><thead><tr><th>SAKİN</th><th>TELEFON</th><th>OTURUM</th><th>AİDAT</th><th></th></tr></thead><tbody id="residentRows">${residentRows(state.dues)}</tbody></table></div>`:emptyBlock('♙','Henüz sakin eklenmedi','İlk daire ve sakin kaydını oluşturun.','resident','Sakin ekle')}</section>`}

function settings(){return `<section class="section-heading"><div><h1>Ayarlar</h1><p>Yönetim alanınızı kendi apartmanınıza göre düzenleyin.</p></div></section><section class="settings-grid"><form class="panel settings-form" id="settingsForm"><div class="panel-head"><h2>Site bilgileri</h2><span class="badge paid">Bu cihaz</span></div><div class="field"><label>Site / apartman adı</label><input name="siteName" required value="${esc(profile?.siteName||'')}" /></div><div class="field"><label>Yönetici adı</label><input name="managerName" required value="${esc(profile?.managerName||'')}" /></div><div class="form-row"><div class="field"><label>Blok sayısı</label><input name="blockCount" type="number" min="1" value="${profile?.blockCount||1}" /></div><div class="field"><label>Daire sayısı</label><input name="unitCount" type="number" min="1" value="${profile?.unitCount||1}" /></div></div><div class="field"><label>Aylık aidat</label><input name="monthlyDue" type="number" min="0" value="${profile?.monthlyDue||0}" /></div><button class="button primary" type="submit">Değişiklikleri kaydet</button></form><div class="panel getting-started"><div class="panel-head"><h2>Nasıl kullanılır?</h2><span class="eyebrow">3 ADIM</span></div><ol><li><span>1</span><div><strong>Sakinleri ekleyin</strong><p>Sakinler bölümünde daire ve kişi bilgilerini oluşturun.</p></div></li><li><span>2</span><div><strong>Aidatları takip edin</strong><p>Ödeme geldiğinde ilgili kaydı “Ödendi” olarak işaretleyin.</p></div></li><li><span>3</span><div><strong>Yönetimi kaydedin</strong><p>Giderleri, duyuruları ve kararları düzenli ekleyin.</p></div></li></ol><div class="setup-note"><strong>İlk sürüm:</strong> Veriler bu tarayıcıda saklanır. Sağ üst menüden yedek indirebilirsiniz.</div></div></section>`}

const renderers={dashboard,dues,expenses,announcements,decisions,residents,settings};
function render(page=currentPage){
  currentPage=page;
  pageTitle.textContent=titles[page];
  pageContent.innerHTML=renderers[page]();
  document.querySelector('#debtCount').textContent=state.dues.filter(x=>x.status!=='paid').length;
  document.querySelector('#notificationDot').hidden=state.announcements.length===0;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  document.querySelector('#sidebar').classList.remove('open');
  document.querySelector('#menuToggle').setAttribute('aria-expanded','false');
  bindPage();
}

function bindPage(){
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>openAction(b.dataset.action)));
  document.querySelectorAll('[data-page-link]').forEach(b=>b.addEventListener('click',()=>render(b.dataset.pageLink)));
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openDetail(b.dataset.open,b.dataset.id)));
  document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteRecord(b.dataset.delete,b.dataset.id)));
  document.querySelectorAll('[data-toggle-paid]').forEach(b=>b.addEventListener('click',()=>togglePaid(b.dataset.togglePaid)));
  const dueSearch=document.querySelector('#dueSearch');if(dueSearch)dueSearch.addEventListener('input',()=>{const q=dueSearch.value.toLocaleLowerCase('tr');document.querySelector('#dueRows').innerHTML=duesRows(state.dues.filter(d=>(d.name+' '+d.unit).toLocaleLowerCase('tr').includes(q)));bindPage()});
  const residentSearch=document.querySelector('#residentSearch');const blockFilter=document.querySelector('#blockFilter');const filterResidents=()=>{const q=(residentSearch?.value||'').toLocaleLowerCase('tr');const block=blockFilter?.value||'';const rows=state.dues.filter(d=>(d.name+' '+d.unit).toLocaleLowerCase('tr').includes(q)&&(!block||d.unit.includes(block)));document.querySelector('#residentRows').innerHTML=residentRows(rows);bindPage()};if(residentSearch)residentSearch.addEventListener('input',filterResidents);if(blockFilter)blockFilter.addEventListener('change',filterResidents);
  const settingsForm=document.querySelector('#settingsForm');if(settingsForm)settingsForm.addEventListener('submit',saveSettings);
}

const forms={
  expense:{title:'Gider ekle',html:`<div class="field"><label>Gider açıklaması</label><input name="title" required placeholder="Örn. Asansör bakımı" /></div><div class="field"><label>Kategori</label><select name="category"><option>Bakım</option><option>Fatura</option><option>Temizlik</option><option>Peyzaj</option><option>Diğer</option></select></div><div class="field"><label>Tutar</label><input name="amount" type="number" min="1" required placeholder="0 ₺" /></div><div class="field"><label>Not</label><textarea name="note" placeholder="İsteğe bağlı açıklama"></textarea></div>`},
  announcement:{title:'Duyuru yap',html:`<div class="field"><label>Başlık</label><input name="title" required placeholder="Duyuru başlığı" /></div><div class="field"><label>Açıklama</label><textarea name="text" required placeholder="Sakinlerin bilmesi gerekenleri yazın"></textarea></div><div class="field"><label>Tür</label><select name="tag"><option>Bilgilendirme</option><option>Önemli</option><option>Toplantı</option></select></div>`},
  decision:{title:'Karar ekle',html:`<div class="field"><label>Karar başlığı</label><input name="title" required /></div><div class="field"><label>Karar metni</label><textarea name="text" required></textarea></div><div class="field"><label>Karar numarası</label><input name="tag" value="${new Date().getFullYear()} / ${state.decisions.length+1}" required /></div>`},
  due:{title:'Aidat kaydı ekle',html:`<div class="field"><label>Sakin adı</label><input name="name" required /></div><div class="field"><label>Daire</label><input name="unit" required placeholder="A Blok · Daire 1" /></div><div class="field"><label>Tutar</label><input name="amount" type="number" value="${profile?.monthlyDue||0}" min="0" required /></div><div class="field"><label>Son ödeme</label><input name="dueDate" type="date" required /></div>`},
  resident:{title:'Sakin ekle',html:`<div class="field"><label>Ad soyad</label><input name="name" required /></div><div class="field"><label>Daire</label><input name="unit" required placeholder="A Blok · Daire 1" /></div><div class="field"><label>Telefon</label><input name="phone" type="tel" placeholder="05xx xxx xx xx" /></div><div class="field"><label>Oturum türü</label><select name="occupancy"><option>Ev sahibi</option><option>Kiracı</option></select></div>`}
};

function openAction(type){const form=forms[type];actionDialog.dataset.type=type;document.querySelector('#dialogTitle').textContent=form.title;fields.innerHTML=form.html;actionDialog.showModal();setTimeout(()=>fields.querySelector('input,textarea,select')?.focus(),0)}
function saveAction(e){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));const type=actionDialog.dataset.type;const common={id:makeId(),date:today()};if(type==='expense')state.expenses.unshift({...common,...data,amount:+data.amount});if(type==='announcement')state.announcements.unshift({...common,...data});if(type==='decision')state.decisions.unshift({...common,...data});if(type==='due')state.dues.unshift({...common,...data,amount:+data.amount,status:'pending',label:'Bekliyor'});if(type==='resident')state.dues.unshift({...common,...data,amount:+profile.monthlyDue||0,status:'pending',label:'Bekliyor'});persist();actionDialog.close();render(type==='resident'?'residents':type==='due'?'dues':`${type}s`);toast('Kayıt başarıyla eklendi.')}

function openDetail(type,id){const item=state[type].find(x=>x.id===id);if(!item)return;detailTarget={type,id};document.querySelector('#detailEyebrow').textContent=type==='announcements'?'DUYURU':type==='decisions'?'KARAR':type==='expenses'?'GİDER':'BİLDİRİM';document.querySelector('#detailTitle').textContent=item.title;document.querySelector('#detailContent').innerHTML=`<div class="detail-body">${esc(item.text||item.note||'Açıklama girilmedi.')}</div><div class="detail-meta"><div><small>Tarih</small><strong>${esc(item.date)}</strong></div><div><small>${type==='expenses'?'Tutar':'Tür / No'}</small><strong>${type==='expenses'?money(item.amount):esc(item.tag)}</strong></div></div>`;document.querySelector('#detailDelete').hidden=false;detailDialog.showModal()}
function openNotifications(){detailTarget=null;document.querySelector('#detailEyebrow').textContent='BİLDİRİMLER';document.querySelector('#detailTitle').textContent='Güncel bildirimler';document.querySelector('#detailContent').innerHTML=state.announcements.length?`<div class="announcements-list">${state.announcements.slice(0,5).map(a=>`<div class="announcement"><div class="date-box"><strong>${esc(a.date.split(' ')[0])}</strong><small>${esc(a.date.split(' ')[1]||'')}</small></div><div><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div></div>`).join('')}</div>`:'<div class="empty-compact"><strong>Yeni bildirim yok</strong>Duyurular burada görünecek.</div>';document.querySelector('#detailDelete').hidden=true;detailDialog.showModal()}
function deleteRecord(type,id){const item=state[type]?.find(x=>x.id===id);if(!item)return;const name=item.title||item.name||'Bu kayıt';if(!confirm(`“${name}” silinsin mi? Bu işlem geri alınamaz.`))return;state[type]=state[type].filter(x=>x.id!==id);persist();if(detailDialog.open)detailDialog.close();render(currentPage);toast('Kayıt silindi.')}
function togglePaid(id){const item=state.dues.find(x=>x.id===id);if(!item)return;const paid=item.status==='paid';item.status=paid?'pending':'paid';item.label=paid?'Bekliyor':'Ödendi';persist();render('dues');toast(paid?'Ödeme bekliyor olarak işaretlendi.':'Ödeme tamamlandı.')}
function saveSettings(e){e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));profile={...profile,...data,blockCount:+data.blockCount,unitCount:+data.unitCount,monthlyDue:+data.monthlyDue};persistProfile();syncIdentity();toast('Site ve profil bilgileri güncellendi.')}
function exportData(){const blob=new Blob([JSON.stringify({profile,data:state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`apartmanOS-${(profile.siteName||'yedek').replace(/\s+/g,'-').toLocaleLowerCase('tr')}.json`;a.click();URL.revokeObjectURL(url);toast('Yedek dosyası indirildi.')}

document.querySelector('#actionForm').addEventListener('submit',saveAction);
document.querySelectorAll('.dialog-cancel').forEach(button=>button.addEventListener('click',()=>actionDialog.close()));
document.querySelector('#detailClose').addEventListener('click',()=>detailDialog.close());
document.querySelector('#detailDone').addEventListener('click',()=>detailDialog.close());
document.querySelector('#detailDelete').addEventListener('click',()=>detailTarget&&deleteRecord(detailTarget.type,detailTarget.id));
document.querySelector('#onboardingForm').addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));profile={siteName:data.siteName.trim(),managerName:data.managerName.trim(),blockCount:+data.blockCount,unitCount:+data.unitCount,monthlyDue:+data.monthlyDue,period:data.period,createdAt:new Date().toISOString()};state=normalize(data.sampleData?structuredClone(sampleData):emptyData());persistProfile();persist();syncIdentity();document.querySelector('#onboardingDialog').close();render('dashboard');toast('Yönetim alanınız hazır. Hoş geldiniz!')});
document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>render(n.dataset.page)));
document.querySelector('.help-card').addEventListener('click',()=>render('settings'));
document.querySelector('#siteSwitcher').addEventListener('click',()=>render('settings'));
document.querySelector('#notificationButton').addEventListener('click',openNotifications);
document.querySelector('#profileButton').addEventListener('click',e=>{e.stopPropagation();const menu=document.querySelector('#profileMenu');menu.hidden=!menu.hidden;e.currentTarget.setAttribute('aria-expanded',String(!menu.hidden))});
document.querySelectorAll('[data-profile-action]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#profileMenu').hidden=true;if(b.dataset.profileAction==='export')exportData();else render('settings')}));
document.querySelector('#menuToggle').addEventListener('click',e=>{const open=document.querySelector('#sidebar').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open))});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();render('dashboard')});
document.addEventListener('click',e=>{if(!e.target.closest('.profile-wrap'))document.querySelector('#profileMenu').hidden=true;if(innerWidth<=760&&!e.target.closest('.sidebar')&&!e.target.closest('#menuToggle'))document.querySelector('#sidebar').classList.remove('open')});

syncIdentity();
persist();
render();
if(!profile)document.querySelector('#onboardingDialog').showModal();
