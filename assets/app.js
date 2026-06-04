const CONFIG = {
  serviceEmail: 'service@yato.pl',
  servicePhone: '787 098 656',
  companyName: 'TOYA S.A.',
  brands: ['YATO', 'VOREL', 'STHOR', 'LUND', 'FLO', 'FALA'],
  appName: 'YATO Service Hub'
};

const PARTS = [
  {id:'yt-84920-chain-demo', public:true, deviceIndex:'YT-84920',deviceName:'Piła łańcuchowa YATO',brand:'YATO',category:'Pilarki i piły łańcuchowe',partIndex:'YT-84920-012',partName:'Łańcuch tnący',position:'12',drawingId:'yt-84920',availability:'Do potwierdzenia przez serwis',keywords:'łańcuch lancuch piła pilarka łańcuchowa'},
  {id:'yt-84920-guide-demo', public:true, deviceIndex:'YT-84920',deviceName:'Piła łańcuchowa YATO',brand:'YATO',category:'Pilarki i piły łańcuchowe',partIndex:'YT-84920-013',partName:'Prowadnica',position:'13',drawingId:'yt-84920',availability:'Do potwierdzenia przez serwis',keywords:'prowadnica miecz piła pilarka łańcuch'},
  {id:'yt-84920-sprocket-demo', public:true, deviceIndex:'YT-84920',deviceName:'Piła łańcuchowa YATO',brand:'YATO',category:'Pilarki i piły łańcuchowe',partIndex:'YT-84920-018',partName:'Koło napędowe łańcucha',position:'18',drawingId:'yt-84920',availability:'Do potwierdzenia przez serwis',keywords:'koło napęd zębatka zebatka łańcuch'},
  {id:'yt-82560-main', public:true, deviceIndex:'YT-82560',deviceName:'Agregat malarski',brand:'YATO',category:'Agregaty malarskie',partIndex:'YT-82560',partName:'Części do agregatu malarskiego',position:'—',drawingId:'yt-82560',availability:'Do sprawdzenia',keywords:'agregat malarski farba pompa'},
  {id:'yg-03395-main', public:false, deviceIndex:'YG-03395',deviceName:'Pompa membranowa',brand:'YATO',category:'Gastronomia / pompy',partIndex:'YG-03395',partName:'Pozycja robocza — część do ustalenia',position:'—',drawingId:'yg-03395',availability:'Do sprawdzenia',keywords:'pompa membranowa'},
  {id:'zg03395-13', public:true, deviceIndex:'YG-03395',deviceName:'Pompa membranowa',brand:'YATO',category:'Gastronomia / pompy',partIndex:'ZG03395-13',partName:'Część nr 13 do YG-03395',position:'13',drawingId:'yg-03395',availability:'Do sprawdzenia',keywords:'pompa membranowa uszczelka część 13'},
  {id:'yt-81811-main', public:false, deviceIndex:'YT-81811',deviceName:'Model YT-81811',brand:'YATO',category:'Do uzupełnienia',partIndex:'YT-81811',partName:'Do uzupełnienia',position:'—',drawingId:'yt-81811',availability:'Do sprawdzenia',keywords:''},
  {id:'yt-828390-drawing', public:true, deviceIndex:'YT-828390',deviceName:'Urządzenie YATO YT-828390',brand:'YATO',category:'Rysunki złożeniowe',partIndex:'YT-828390',partName:'Rysunek złożeniowy / części do wskazania z listy',position:'—',drawingId:'yt-828390',availability:'Do sprawdzenia',keywords:'rysunek złożeniowy urządzenie'},
  {id:'yt-8277905-drawing', public:true, deviceIndex:'YT-8277905',deviceName:'Urządzenie YATO YT-8277905',brand:'YATO',category:'Rysunki złożeniowe',partIndex:'YT-8277905',partName:'Rysunek złożeniowy / części do wskazania z listy',position:'—',drawingId:'yt-8277905',availability:'Do sprawdzenia',keywords:'rysunek złożeniowy urządzenie'},
  {id:'yt-852371-drawing', public:true, deviceIndex:'YT-852371',deviceName:'Urządzenie YATO YT-852371',brand:'YATO',category:'Rysunki złożeniowe',partIndex:'YT-852371',partName:'Rysunek złożeniowy / części do wskazania z listy',position:'—',drawingId:'yt-852371',availability:'Do sprawdzenia',keywords:'rysunek złożeniowy urządzenie'},
  {id:'yt-829021-drawing', public:true, deviceIndex:'YT-829021',deviceName:'Urządzenie YATO YT-829021',brand:'YATO',category:'Rysunki złożeniowe',partIndex:'YT-829021',partName:'Rysunek złożeniowy / części do wskazania z listy',position:'—',drawingId:'yt-829021',availability:'Do sprawdzenia',keywords:'rysunek złożeniowy urządzenie'}
];

const DRAWINGS = [
  {id:'yt-84920',deviceIndex:'YT-84920',brand:'YATO',title:'Piła łańcuchowa YATO — rysunek demonstracyjny',type:'svg-demo',status:'demo'},
  {id:'yt-82560',deviceIndex:'YT-82560',brand:'YATO',title:'Agregat malarski — rysunek do podpięcia',type:'placeholder',status:'todo'},
  {id:'yg-03395',deviceIndex:'YG-03395',brand:'YATO',title:'Pompa membranowa — rysunek do podpięcia',type:'placeholder',status:'todo'},
  {id:'yt-81811',deviceIndex:'YT-81811',brand:'YATO',title:'YT-81811 — rysunek do podpięcia',type:'placeholder',status:'todo'},
  {id:'yt-828390',deviceIndex:'YT-828390',brand:'YATO',title:'Czesci_zamienne_YT-828390.pdf',type:'drive-pdf',status:'indexed_from_drive',driveViewUrl:'https://drive.google.com/file/d/17GsCcU4c0uZipY5uvgGnB7YLFBuwzabb/view?usp=drivesdk',drivePreviewUrl:'https://drive.google.com/file/d/17GsCcU4c0uZipY5uvgGnB7YLFBuwzabb/preview'},
  {id:'yt-8277905',deviceIndex:'YT-8277905',brand:'YATO',title:'Czesci_zamienne_YT-8277905.pdf',type:'drive-pdf',status:'indexed_from_drive',driveViewUrl:'https://drive.google.com/file/d/1GHHmBftW1jSgxZF6OVydFL3R0yS5YpRg/view?usp=drivesdk',drivePreviewUrl:'https://drive.google.com/file/d/1GHHmBftW1jSgxZF6OVydFL3R0yS5YpRg/preview'},
  {id:'yt-852371',deviceIndex:'YT-852371',brand:'YATO',title:'Czesci_zamienne_YT-852371.pdf',type:'drive-pdf',status:'indexed_from_drive',driveViewUrl:'https://drive.google.com/file/d/1-Ys1osnXhyg2sWG1wcPREu9ophIfdLfZ/view?usp=drivesdk',drivePreviewUrl:'https://drive.google.com/file/d/1-Ys1osnXhyg2sWG1wcPREu9ophIfdLfZ/preview'},
  {id:'yt-829021',deviceIndex:'YT-829021',brand:'YATO',title:'Czesci_zamienne_YT-829021.pdf',type:'drive-pdf',status:'indexed_from_drive',driveViewUrl:'https://drive.google.com/file/d/1kwpgyZQttlvXyWghWYYoijzKzZHbKZg1/view?usp=drivesdk',drivePreviewUrl:'https://drive.google.com/file/d/1kwpgyZQttlvXyWghWYYoijzKzZHbKZg1/preview'}
];

const SYNONYMS = {
  'łańcuch': ['lancuch','chain','tnący','tnacy','piła','pilarka'],
  'prowadnica': ['miecz','szyna','bar'],
  'koło': ['kolo','zębatka','zebatka','napęd','naped'],
  'włącznik': ['wlacznik','spust','przycisk','wyłącznik','wylacznik'],
  'uszczelka': ['oring','o-ring','gumka','uszczelnienie'],
  'filtr': ['wkład','wklad','powietrza'],
  'szczotki': ['szczotka','węglowe','weglowe','silnik'],
  'pokrętło': ['pokretlo','gałka','galka','regulacja']
};

let selectedDevice = null;
let cart = [];
let unknownMode = false;

const $ = (id) => document.getElementById(id);
const norm = (v='') => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\-\s]/g,' ').replace(/\s+/g,' ').trim();
const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function groupDevices(parts = PARTS.filter(p => p.public !== false)) {
  const map = new Map();
  parts.forEach(part => {
    if (!part.deviceIndex || !part.deviceName) return;
    const key = part.deviceIndex;
    if (!map.has(key)) map.set(key, { deviceIndex: part.deviceIndex, deviceName: part.deviceName, brand: part.brand, category: part.category, drawingId: part.drawingId, parts: [] });
    map.get(key).parts.push(part);
  });
  return [...map.values()].sort((a,b)=>a.deviceIndex.localeCompare(b.deviceIndex,'pl'));
}

function scoreDevice(device, query) {
  const q = norm(query);
  if (!q) return 0;
  const hay = norm([device.deviceIndex, device.deviceName, device.brand, device.category, ...device.parts.flatMap(p => [p.partIndex, p.partName, p.position, p.keywords])].join(' '));
  let score = 0;
  if (norm(device.deviceIndex) === q) score += 120;
  if (norm(device.deviceIndex).includes(q)) score += 60;
  if (norm(device.deviceName).includes(q)) score += 45;
  if (hay.includes(q)) score += 25;
  q.split(' ').forEach(token => { if (token.length > 1 && hay.includes(token)) score += 8; });
  return score;
}

function searchDevices(query) {
  const q = norm(query);
  if (!q) return [];
  return groupDevices().map(d => ({...d, score: scoreDevice(d, q)})).filter(d => d.score > 0).sort((a,b)=>b.score-a.score).slice(0,8);
}

function renderResults(devices) {
  const el = $('results');
  if (!el) return;
  if (!norm($('searchInput').value)) {
    el.innerHTML = `<div class="muted-box">Wpisz indeks lub nazwę urządzenia. Nie pokazujemy roboczej listy części na start — klient ma najpierw wybrać urządzenie.</div>`;
    return;
  }
  if (!devices.length) {
    el.innerHTML = `<div class="muted-box"><strong>Brak pewnego dopasowania.</strong><br>Użyj trybu „Nie znam indeksu” — system przygotuje maila z opisem i zdjęciami do identyfikacji.</div>`;
    return;
  }
  el.innerHTML = devices.map(d => `
    <article class="device-card">
      <div>
        <div class="device-kicker">${esc(d.brand)} • ${esc(d.category || 'kategoria do uzupełnienia')}</div>
        <h3>${esc(d.deviceIndex)} — ${esc(d.deviceName)}</h3>
        <p>${d.parts.length} pozycji w bazie testowej. Rysunek: ${DRAWINGS.find(x => x.id === d.drawingId)?.status || 'do podpięcia'}.</p>
        <div class="meta"><span class="tag">${esc(d.deviceIndex)}</span><span class="tag">${esc(d.brand)}</span><span class="tag">części: ${d.parts.length}</span></div>
      </div>
      <div class="device-actions">
        <button class="button ghost small" data-show-device="${esc(d.deviceIndex)}">Pokaż rysunek</button>
        <button class="button primary small" data-pick-device="${esc(d.deviceIndex)}">Wybierz urządzenie</button>
      </div>
    </article>`).join('');
  el.querySelectorAll('[data-pick-device],[data-show-device]').forEach(btn => btn.addEventListener('click', () => selectDevice(btn.dataset.pickDevice || btn.dataset.showDevice)));
}

function selectDevice(deviceIndex) {
  selectedDevice = groupDevices().find(d => d.deviceIndex === deviceIndex);
  unknownMode = false;
  if (!selectedDevice) return;
  $('drawingHint').textContent = `${selectedDevice.deviceIndex} — ${selectedDevice.deviceName}`;
  renderDrawing(selectedDevice);
  renderDrawingParts(selectedDevice.parts);
  $('drawing').scrollIntoView({behavior:'smooth', block:'start'});
  updateMailPreview();
}

function renderDrawing(device) {
  const stage = $('drawingStage');
  const drawing = DRAWINGS.find(d => d.id === device.drawingId || d.deviceIndex === device.deviceIndex);
  if (!drawing) {
    stage.className = 'drawing-stage empty';
    stage.innerHTML = `<div class="empty-state">Rysunek dla ${esc(device.deviceIndex)} jest jeszcze do podpięcia.</div>`;
    return;
  }
  if (drawing.type === 'svg-demo') {
    stage.className = 'drawing-stage has-embed';
    stage.innerHTML = demoSvg();
    stage.querySelectorAll('[data-position]').forEach(h => h.addEventListener('click', () => {
      const part = device.parts.find(p => p.position === h.dataset.position);
      if (part) addToCart(part.id);
    }));
    return;
  }
  if (drawing.drivePreviewUrl || drawing.localPath) {
    const src = drawing.localPath || drawing.drivePreviewUrl;
    stage.className = 'drawing-stage has-embed';
    stage.innerHTML = `
      <div class="drawing-toolbar"><strong>${esc(drawing.title)}</strong><div class="links">${drawing.driveViewUrl ? `<a class="button ghost small" href="${drawing.driveViewUrl}" target="_blank" rel="noopener">Otwórz w Drive</a>` : ''}</div></div>
      <iframe class="drawing-embed" src="${src}" title="${esc(drawing.title)}"></iframe>`;
    return;
  }
  stage.className = 'drawing-stage empty';
  stage.innerHTML = `<div class="empty-state"><strong>${esc(drawing.title)}</strong><br>Rysunek jest w indeksie, ale plik lokalny/Drive będzie podpięty po segregacji paczek.</div>`;
}

function renderDrawingParts(parts) {
  const box = $('drawingParts');
  if (!parts?.length) { box.innerHTML = 'Brak pozycji dla wybranego urządzenia.'; return; }
  box.className = 'part-list';
  box.innerHTML = parts.map(p => `
    <article class="part-card">
      <div>
        <h4>${esc(p.partName)}</h4>
        <div class="meta"><span class="tag">poz. ${esc(p.position)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">${esc(p.availability)}</span></div>
      </div>
      <button class="button primary small" data-add="${esc(p.id)}">Dodaj</button>
    </article>`).join('');
  box.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
}

function demoSvg() {
  return `<svg class="machine-svg" viewBox="0 0 900 520" role="img" aria-label="Demo rysunku złożeniowego piły łańcuchowej">
    <rect width="900" height="520" fill="#f5f1e9"/>
    <text x="44" y="62" fill="#1d1d1d" font-size="28" font-weight="800">YT-84920 — rysunek demonstracyjny</text>
    <g opacity=".18" stroke="#111" stroke-width="3" fill="none"><path d="M160 270 C210 150 410 120 560 185 C650 225 700 300 660 365 C620 430 455 420 345 380 C235 340 120 330 160 270Z"/><path d="M555 245 L815 210 L825 250 L570 302Z"/><circle cx="335" cy="285" r="70"/><path d="M210 385 L530 385"/></g>
    <g class="hotspot" data-position="12"><circle cx="710" cy="232" r="24"/><text x="710" y="237">12</text></g>
    <g class="hotspot" data-position="13"><circle cx="595" cy="286" r="24"/><text x="595" y="291">13</text></g>
    <g class="hotspot" data-position="18"><circle cx="336" cy="286" r="24"/><text x="336" y="291">18</text></g>
    <text x="80" y="465" fill="#222" font-size="18">Kliknij numer pozycji albo wybierz część z listy po prawej.</text>
  </svg>`;
}

function addToCart(partId) {
  const part = PARTS.find(p => p.id === partId);
  if (!part) return;
  const existing = cart.find(i => i.id === partId);
  if (existing) existing.qty += 1; else cart.push({...part, qty:1});
  renderCart(); updateMailPreview(); toast('Dodano do zapytania');
}

function renderCart() {
  const el = $('cart');
  if (!cart.length) { el.className = 'cart muted-box'; el.textContent = 'Koszyk jest pusty.'; return; }
  el.className = 'cart';
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div><strong>${esc(item.partName)}</strong><div class="meta"><span class="tag">${esc(item.deviceIndex)}</span><span class="tag">${esc(item.partIndex)}</span><span class="tag">poz. ${esc(item.position)}</span></div></div>
      <input class="qty" type="number" min="1" value="${item.qty}" data-qty="${esc(item.id)}" />
      <button class="button ghost small" data-remove="${esc(item.id)}">Usuń</button>
    </div>`).join('');
  el.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => { cart = cart.filter(i => i.id !== btn.dataset.remove); renderCart(); updateMailPreview(); }));
  el.querySelectorAll('[data-qty]').forEach(inp => inp.addEventListener('change', () => { const item = cart.find(i => i.id === inp.dataset.qty); if (item) item.qty = Math.max(1, Number(inp.value || 1)); updateMailPreview(); }));
}

function getFormData() { return Object.fromEntries(new FormData($('clientForm')).entries()); }
function requestId() {
  const d = new Date();
  const date = d.toISOString().slice(0,10).replaceAll('-','');
  const dev = selectedDevice?.deviceIndex?.replace(/[^A-Z0-9]/gi,'') || 'IDENT';
  const suffix = Math.random().toString(36).slice(2,6).toUpperCase();
  return `PGW-${date}-${dev}-${suffix}`;
}

function buildMail() {
  const data = getFormData();
  const id = requestId();
  const lines = [];
  lines.push(`Numer zapytania: ${id}`);
  lines.push('');
  lines.push('Dzień dobry,');
  lines.push('proszę o potwierdzenie dostępności i wycenę części pogwarancyjnych.');
  lines.push('');
  if (unknownMode) {
    lines.push('TRYB IDENTYFIKACJI: klient nie zna indeksu urządzenia / części.');
    lines.push(`Opis urządzenia: ${$('unknownDevice').value || '—'}`);
    lines.push(`Opis potrzebnej części / objawu: ${$('unknownPart').value || '—'}`);
    lines.push('Zdjęcia do dołączenia przez klienta:');
    ['plate','device','part'].forEach(name => { const el = document.querySelector(`[name="${name}"]`); if (el?.checked) lines.push(`- ${el.dataset.label}`); });
  } else if (selectedDevice) {
    lines.push('Urządzenie:');
    lines.push(`${selectedDevice.deviceIndex} — ${selectedDevice.deviceName}`);
    lines.push(`Marka: ${selectedDevice.brand}`);
    lines.push('');
    if (cart.length) {
      lines.push('Wybrane części:');
      cart.forEach((item, idx) => lines.push(`${idx+1}. ${item.partName} | indeks: ${item.partIndex} | poz.: ${item.position} | ilość: ${item.qty}`));
    } else {
      lines.push('Wybrane części: brak — proszę o pomoc w identyfikacji po opisie/rysunku.');
    }
  } else {
    lines.push('Urządzenie: nie wybrano.');
  }
  lines.push('');
  lines.push('Dane klienta:');
  lines.push(`Imię i nazwisko / firma: ${data.name || '—'}`);
  lines.push(`E-mail: ${data.email || '—'}`);
  lines.push(`Telefon: ${data.phone || '—'}`);
  lines.push(`NIP: ${data.nip || '—'}`);
  lines.push('');
  lines.push(`Dane do faktury:\n${data.invoice || '—'}`);
  lines.push('');
  lines.push(`Adres wysyłki:\n${data.shipping || '—'}`);
  lines.push('');
  lines.push(`Uwagi:\n${data.notes || '—'}`);
  lines.push('');
  lines.push('Wiadomość wygenerowana przez YATO Service Hub.');
  return {id, subject: `Zapytanie o części pogwarancyjne — ${selectedDevice?.deviceIndex || 'identyfikacja'} — ${id}`, body: lines.join('\n')};
}

function updateMailPreview() { const mail = buildMail(); $('mailPreview').textContent = mail.body; }

function openMail() {
  const mail = buildMail();
  const url = `mailto:${encodeURIComponent(CONFIG.serviceEmail)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
  window.location.href = url;
}

function downloadJson() {
  const payload = { createdAt:new Date().toISOString(), selectedDevice, cart, unknownMode, client:getFormData(), mail:buildMail() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `zapytanie-pgw-${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href);
}

function copyMail() { navigator.clipboard.writeText(buildMail().body).then(() => toast('Treść skopiowana')); }
function toast(msg) { const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2200); }

function setUnknownMode() {
  unknownMode = true; selectedDevice = null; cart = []; renderCart();
  $('drawingHint').textContent = 'Tryb identyfikacji — rysunek nie został jeszcze wybrany.';
  $('drawingStage').className = 'drawing-stage empty';
  $('drawingStage').innerHTML = '<div class="empty-state"><strong>Nie znasz indeksu?</strong><br>Opisz urządzenie i część. Mail przypomni klientowi o dołączeniu zdjęć.</div>';
  $('drawingParts').className = 'part-list muted-box';
  $('drawingParts').textContent = 'Po identyfikacji urządzenia serwis dobierze właściwy rysunek.';
  $('unknownPanel').classList.remove('hidden');
  $('unknownPanel').scrollIntoView({behavior:'smooth', block:'center'});
  updateMailPreview();
}

function localSuggest() {
  if (!selectedDevice) { toast('Najpierw wybierz urządzenie'); return; }
  const query = norm($('aiDescription').value);
  if (!query) { toast('Opisz część własnymi słowami'); return; }
  const tokens = new Set(query.split(' ').filter(Boolean));
  Object.entries(SYNONYMS).forEach(([main, words]) => { if (tokens.has(norm(main)) || words.some(w => tokens.has(norm(w)))) { tokens.add(norm(main)); words.forEach(w=>tokens.add(norm(w))); } });
  const scored = selectedDevice.parts.map(p => {
    const hay = norm([p.partName,p.partIndex,p.position,p.keywords].join(' '));
    let score = 0; tokens.forEach(t => { if (t.length > 1 && hay.includes(t)) score += 1; });
    return {...p, score};
  }).filter(p => p.score > 0).sort((a,b)=>b.score-a.score);
  const box = $('aiSuggestions');
  if (!scored.length) { box.innerHTML = '<div class="muted-box">Nie mam pewnego dopasowania. Dodaj opis do maila i poproś klienta o zdjęcie tabliczki oraz części.</div>'; return; }
  box.innerHTML = scored.slice(0,4).map(p => `<article class="suggest-card"><div><strong>${esc(p.partName)}</strong><div class="meta"><span class="tag">poz. ${esc(p.position)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">dopasowanie lokalne</span></div></div><button class="button primary small" data-add="${esc(p.id)}">Dodaj</button></article>`).join('');
  box.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
}

function fillDemo() {
  $('searchInput').value = 'YT-84920';
  renderResults(searchDevices('YT-84920'));
  selectDevice('YT-84920');
  addToCart('yt-84920-chain-demo');
  $('clientForm').elements.name.value = 'Jan Kowalski';
  $('clientForm').elements.email.value = 'jan.kowalski@email.pl';
  $('clientForm').elements.phone.value = '500 600 700';
  $('clientForm').elements.notes.value = 'Proszę o potwierdzenie ceny, dostępności i kosztu wysyłki.';
  updateMailPreview();
}

function init() {
  $('results').innerHTML = '<div class="muted-box">Wpisz indeks lub nazwę urządzenia. Wyniki pokażą się dopiero po wyszukaniu.</div>';
  $('searchBtn').addEventListener('click', () => renderResults(searchDevices($('searchInput').value)));
  $('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') renderResults(searchDevices($('searchInput').value)); });
  $('searchInput').addEventListener('input', () => { if (norm($('searchInput').value).length >= 2) renderResults(searchDevices($('searchInput').value)); else renderResults([]); });
  $('fillDemoBtn').addEventListener('click', fillDemo);
  $('unknownBtn').addEventListener('click', setUnknownMode);
  $('aiSuggestBtn').addEventListener('click', localSuggest);
  $('generateMailBtn').addEventListener('click', openMail);
  $('copyMailBtn').addEventListener('click', copyMail);
  $('downloadJsonBtn').addEventListener('click', downloadJson);
  $('clientForm').addEventListener('input', updateMailPreview);
  document.querySelectorAll('#unknownPanel input, #unknownPanel textarea').forEach(el => el.addEventListener('input', updateMailPreview));
  renderCart(); updateMailPreview();
}

document.addEventListener('DOMContentLoaded', init);
