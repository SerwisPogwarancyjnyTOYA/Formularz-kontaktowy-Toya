const CONFIG = {
  serviceEmail: 'service@yato.pl',
  servicePhone: '787 098 656',
  companyName: 'TOYA S.A.',
  brands: ['YATO', 'VOREL', 'STHOR', 'LUND', 'FLO', 'FALA'],
  appName: 'YATO Service Hub'
};

const PARTS = [
  {id:'yt-84920-chain-demo',deviceIndex:'YT-84920',deviceName:'Piła łańcuchowa YATO',brand:'YATO',category:'Pilarki i piły łańcuchowe',partIndex:'YT-84920-012',partName:'Łańcuch tnący',position:'12',drawingId:'yt-84920',availability:'Do potwierdzenia przez serwis',notes:'Pozycja demonstracyjna do testów kreatora'},
  {id:'yt-84920-guide-demo',deviceIndex:'YT-84920',deviceName:'Piła łańcuchowa YATO',brand:'YATO',category:'Pilarki i piły łańcuchowe',partIndex:'YT-84920-013',partName:'Prowadnica',position:'13',drawingId:'yt-84920',availability:'Do potwierdzenia przez serwis',notes:'Pozycja demonstracyjna do testów kreatora'},
  {id:'yt-84920-sprocket-demo',deviceIndex:'YT-84920',deviceName:'Piła łańcuchowa YATO',brand:'YATO',category:'Pilarki i piły łańcuchowe',partIndex:'YT-84920-018',partName:'Koło napędowe łańcucha',position:'18',drawingId:'yt-84920',availability:'Do potwierdzenia przez serwis',notes:'Pozycja demonstracyjna do testów kreatora'},
  {id:'yt-82560-main',deviceIndex:'YT-82560',deviceName:'Agregat malarski',brand:'YATO',category:'Agregaty malarskie',partIndex:'YT-82560',partName:'Części do agregatu malarskiego',position:'—',drawingId:'yt-82560',availability:'Do sprawdzenia',notes:'Pozycja z bazy startowej PGW'},
  {id:'yg-03395-main',deviceIndex:'YG-03395',deviceName:'Pompa membranowa',brand:'YATO/G',category:'Gastronomia / pompy',partIndex:'YG-03395',partName:'Pompa membranowa / część do ustalenia',position:'—',drawingId:'yg-03395',availability:'Do sprawdzenia',notes:'Pozycja z bazy startowej PGW'},
  {id:'zg03395-13',deviceIndex:'YG-03395',deviceName:'Pompa membranowa',brand:'YATO/G',category:'Gastronomia / pompy',partIndex:'ZG03395-13',partName:'Część nr 13 do YG-03395',position:'13',drawingId:'yg-03395',availability:'Do sprawdzenia',notes:'Pozycja z bazy startowej PGW'},
  {id:'yt-81811-main',deviceIndex:'YT-81811',deviceName:'Model YT-81811',brand:'YATO',category:'Do uzupełnienia',partIndex:'YT-81811',partName:'Do uzupełnienia',position:'—',drawingId:'yt-81811',availability:'Do sprawdzenia',notes:'Pozycja z bazy startowej PGW'}
];

let selectedDevice = null;
let cart = [];
const $ = (id) => document.getElementById(id);
const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function toast(msg){
  const el = document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el);
  setTimeout(()=>el.remove(),2600);
}

function scorePart(part, q){
  const hay = norm([part.deviceIndex, part.deviceName, part.brand, part.category, part.partIndex, part.partName, part.position, part.notes].join(' '));
  const query = norm(q);
  if(!query) return 1;
  let score = 0;
  for(const token of query.split(' ')) if(hay.includes(token)) score += token.length > 2 ? 3 : 1;
  if(norm(part.deviceIndex) === query || norm(part.partIndex) === query) score += 30;
  if(hay.includes(query)) score += 10;
  return score;
}

function search(){
  const q = $('searchInput').value;
  const matches = PARTS.map(p=>({...p,_score:scorePart(p,q)})).filter(p=>p._score>0).sort((a,b)=>b._score-a._score);
  renderResults(matches);
}

function renderResults(parts){
  const box = $('results');
  if(!parts.length){ box.innerHTML = '<div class="muted-box">Nie znaleziono wyniku. Spróbuj wpisać sam model, np. YT-84920 albo YG-03395.</div>'; return; }
  box.innerHTML = parts.map(p=>`<article class="result-card">
    <div>
      <h3>${escapeHtml(p.partName)}</h3>
      <div class="meta"><span class="tag">${escapeHtml(p.deviceIndex)}</span><span class="tag">${escapeHtml(p.partIndex)}</span><span class="tag">poz. ${escapeHtml(p.position)}</span><span>${escapeHtml(p.deviceName)}</span></div>
    </div>
    <div class="hero-actions" style="margin:0">
      <button class="button ghost small" onclick="selectDevice('${p.deviceIndex}')">Pokaż rysunek</button>
      <button class="button primary small" onclick="addToCart('${p.id}')">Dodaj</button>
    </div>
  </article>`).join('');
}

function deviceParts(deviceIndex){return PARTS.filter(p=>p.deviceIndex===deviceIndex)}

function selectDevice(deviceIndex){
  selectedDevice = deviceIndex;
  const parts = deviceParts(deviceIndex);
  $('drawingHint').textContent = `${parts[0]?.deviceName ?? deviceIndex} · ${deviceIndex}`;
  renderDrawing(deviceIndex, parts);
  renderDrawingParts(parts);
  document.querySelector('.drawing-panel').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderDrawing(deviceIndex, parts){
  const stage = $('drawingStage'); stage.classList.remove('empty');
  if(deviceIndex === 'YT-84920'){
    stage.innerHTML = `<svg class="machine-svg" viewBox="0 0 900 520" role="img" aria-label="Rysunek złożeniowy piły łańcuchowej">
      <defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#e7e1d6"/><stop offset="1" stop-color="#fffaf0"/></linearGradient></defs>
      <rect width="900" height="520" fill="url(#g)"/>
      <text x="38" y="48" font-size="24" font-weight="800" fill="#111">YT-84920 · rysunek demonstracyjny</text>
      <text x="38" y="78" font-size="14" fill="#555">Kliknij numer pozycji albo wybierz część z listy.</text>
      <path d="M142 300 C145 240 190 198 260 190 L382 182 C448 178 500 212 520 265 L565 265 C600 265 625 287 625 318 C625 350 600 372 565 372 L245 372 C185 372 142 348 142 300Z" fill="#282d30" stroke="#111" stroke-width="5"/>
      <circle cx="266" cy="306" r="58" fill="#444" stroke="#111" stroke-width="8"/><circle cx="266" cy="306" r="25" fill="#bbb" stroke="#222" stroke-width="5"/>
      <rect x="510" y="215" width="270" height="58" rx="29" fill="#bbb" stroke="#222" stroke-width="5"/>
      <rect x="760" y="232" width="78" height="24" rx="12" fill="#888" stroke="#222" stroke-width="4"/>
      <path d="M520 295 L820 295" stroke="#d62518" stroke-width="18" stroke-linecap="round"/>
      <path d="M520 333 L820 333" stroke="#d62518" stroke-width="18" stroke-linecap="round"/>
      <path d="M520 295 C608 275 730 275 820 295" stroke="#111" stroke-width="5" fill="none"/>
      <path d="M520 333 C608 353 730 353 820 333" stroke="#111" stroke-width="5" fill="none"/>
      <rect x="360" y="120" width="120" height="70" rx="26" fill="#d62518" stroke="#111" stroke-width="5"/>
      <path d="M360 162 C300 120 225 132 208 190" fill="none" stroke="#111" stroke-width="22" stroke-linecap="round"/>
      <g class="hotspot" onclick="addToCart('yt-84920-chain-demo')"><circle cx="690" cy="314" r="24"/><text x="690" y="315">12</text></g>
      <g class="hotspot" onclick="addToCart('yt-84920-guide-demo')"><circle cx="610" cy="239" r="24"/><text x="610" y="240">13</text></g>
      <g class="hotspot" onclick="addToCart('yt-84920-sprocket-demo')"><circle cx="267" cy="306" r="24"/><text x="267" y="307">18</text></g>
    </svg>`;
  } else {
    stage.innerHTML = `<div class="empty-state"><h3>${escapeHtml(deviceIndex)}</h3><p>Rysunek do podpięcia. Lista części działa już teraz, a plik PNG/PDF można dodać w folderze <code>drawings/</code>.</p></div>`;
  }
}

function renderDrawingParts(parts){
  const box = $('drawingParts');
  box.className = 'part-list';
  box.innerHTML = parts.map(p=>`<article class="part-card">
    <div><h4>${escapeHtml(p.partName)}</h4><div class="meta"><span class="tag">poz. ${escapeHtml(p.position)}</span><span class="tag">${escapeHtml(p.partIndex)}</span><span>${escapeHtml(p.availability)}</span></div></div>
    <button class="button primary small" onclick="addToCart('${p.id}')">Dodaj</button>
  </article>`).join('');
}

function addToCart(id){
  const part = PARTS.find(p=>p.id===id); if(!part) return;
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.qty += 1; else cart.push({...part,qty:1});
  renderCart(); updateMailPreview(); toast('Dodano do zapytania');
}

function removeFromCart(id){ cart = cart.filter(i=>i.id!==id); renderCart(); updateMailPreview(); }
function updateQty(id, qty){ const item=cart.find(i=>i.id===id); if(item) item.qty=Math.max(1,Number(qty)||1); renderCart(); updateMailPreview(); }

function renderCart(){
  const box = $('cart');
  if(!cart.length){ box.className='cart muted-box'; box.innerHTML='Koszyk jest pusty.'; return; }
  box.className='cart';
  box.innerHTML = cart.map(i=>`<article class="cart-item">
    <div><strong>${escapeHtml(i.partName)}</strong><div class="meta"><span class="tag">${escapeHtml(i.deviceIndex)}</span><span class="tag">${escapeHtml(i.partIndex)}</span><span class="tag">poz. ${escapeHtml(i.position)}</span></div></div>
    <input class="qty" type="number" min="1" value="${i.qty}" onchange="updateQty('${i.id}', this.value)" aria-label="Ilość" />
    <button class="button ghost small" onclick="removeFromCart('${i.id}')">Usuń</button>
  </article>`).join('');
}

function formData(){ return Object.fromEntries(new FormData($('clientForm')).entries()); }
function buildMail(){
  const f = formData();
  const now = new Date().toLocaleString('pl-PL');
  const subject = cart.length ? `Zapytanie o części — ${cart[0].deviceIndex} — ${cart[0].partName}` : 'Zapytanie o części pogwarancyjne';
  const lines = [];
  lines.push('Dzień dobry,');
  lines.push('');
  lines.push('Proszę o potwierdzenie dostępności oraz wycenę poniższych części pogwarancyjnych.');
  lines.push('');
  lines.push('WYBRANE CZĘŚCI:');
  if(cart.length){ cart.forEach((i,n)=>{ lines.push(`${n+1}. ${i.partName}`); lines.push(`   Urządzenie: ${i.deviceName} (${i.deviceIndex})`); lines.push(`   Indeks części: ${i.partIndex}`); lines.push(`   Pozycja z rysunku: ${i.position}`); lines.push(`   Ilość: ${i.qty} szt.`); lines.push(''); }); }
  else lines.push('Brak wybranych części.');
  lines.push('DANE KONTAKTOWE:');
  lines.push(`Imię i nazwisko / firma: ${f.name || ''}`);
  lines.push(`E-mail: ${f.email || ''}`);
  lines.push(`Telefon: ${f.phone || ''}`);
  lines.push(`NIP: ${f.nip || ''}`);
  lines.push('');
  lines.push('DANE DO FAKTURY:'); lines.push(f.invoice || ''); lines.push('');
  lines.push('ADRES WYSYŁKI:'); lines.push(f.shipping || ''); lines.push('');
  lines.push('UWAGI:'); lines.push(f.notes || ''); lines.push('');
  lines.push(`Wygenerowano w: ${CONFIG.appName}, ${now}`);
  return {subject, body:lines.join('\n')};
}

function updateMailPreview(){ const {body}=buildMail(); $('mailPreview').textContent=body; }

function openMail(){
  const {subject,body}=buildMail();
  if(!cart.length){ toast('Najpierw dodaj przynajmniej jedną część'); return; }
  const href = `mailto:${encodeURIComponent(CONFIG.serviceEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if(href.length > 7500) toast('Mail jest długi. Gdyby poczta nie ruszyła, użyj „Kopiuj treść”.');
  window.location.href = href;
}
async function copyMail(){ const {body}=buildMail(); await navigator.clipboard.writeText(body); toast('Treść zgłoszenia skopiowana'); }
function downloadJson(){
  const payload = {createdAt:new Date().toISOString(), recipient:CONFIG.serviceEmail, client:formData(), items:cart};
  const blob = new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`zapytanie-czesci-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
}
function fillDemo(){
  $('searchInput').value='łańcuch YT-84920'; search(); selectDevice('YT-84920'); cart=[]; addToCart('yt-84920-chain-demo');
  const form=$('clientForm'); form.name.value='Jan Kowalski'; form.email.value='jan.kowalski@example.com'; form.phone.value='500 600 700'; form.nip.value=''; form.invoice.value='Jan Kowalski\nul. Przykładowa 1\n50-000 Wrocław'; form.shipping.value='Paczkomat WRO123M\nul. Testowa 5\n50-001 Wrocław'; form.notes.value='Proszę o potwierdzenie ceny i dostępności.'; updateMailPreview();
}

$('searchBtn').addEventListener('click', search);
$('searchInput').addEventListener('input', search);
$('generateMailBtn').addEventListener('click', openMail);
$('copyMailBtn').addEventListener('click', copyMail);
$('downloadJsonBtn').addEventListener('click', downloadJson);
$('fillDemoBtn').addEventListener('click', fillDemo);
$('clientForm').addEventListener('input', updateMailPreview);
renderResults(PARTS); renderCart(); updateMailPreview();
if('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(()=>{});
