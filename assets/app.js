const CONFIG = {
  serviceEmail: 'service@yato.pl',
  servicePhone: '787 098 656',
  companyName: 'TOYA S.A.',
  brands: ['YATO', 'VOREL', 'STHOR', 'LUND', 'FLO', 'FALA'],
  appName: 'YATO Service Hub'
};

let PARTS = window.PGW_PARTS || [
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

let DRAWINGS = window.PGW_DRAWINGS || [
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
let currentStep = 1;
let drawingZoom = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
let activeDrawingPosition = null;

const $ = (id) => document.getElementById(id);
const norm = (v='') => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\-\s]/g,' ').replace(/\s+/g,' ').trim();
const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function goToStep(step) {
  currentStep = Math.max(1, Math.min(5, Number(step) || 1));
  document.querySelectorAll('.wizard-step').forEach(section => {
    const s = Number(section.dataset.step || 1);
    section.classList.toggle('step-visible', s === currentStep);
  });
  document.querySelectorAll('.wizard-mail-step').forEach(section => {
    const s = Number(section.dataset.step || 5);
    section.classList.toggle('step-visible', s === currentStep);
  });
  document.querySelectorAll('.step-pill').forEach(btn => {
    const s = Number(btn.dataset.jumpStep || 1);
    btn.classList.toggle('active', s === currentStep);
    btn.classList.toggle('done', s < currentStep);
  });
  const visible = document.querySelector('.wizard-step.step-visible, .wizard-mail-step.step-visible');
  if (visible) visible.scrollIntoView({behavior:'smooth', block:'start'});
}

function needsAttachmentsWarning() {
  if (!unknownMode) return false;
  return ['plate','device','part'].some(name => document.querySelector(`[name="${name}"]`)?.checked);
}

function updateAttachmentWarning() {
  const box = $('attachmentWarning');
  if (!box) return;
  box.classList.toggle('hidden', !needsAttachmentsWarning());
}


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

function looksLikeIndex(query) {
  const q = norm(query).replace(/\s/g, '');
  return /^[a-z]{1,4}-?\d{3,}/i.test(q) || /^zg\d{3,}/i.test(q);
}

function compactIndex(v='') {
  return norm(v).replace(/[^a-z0-9]/g, '');
}

function scoreDevice(device, query) {
  const q = norm(query);
  if (!q) return 0;

  const cq = compactIndex(query);
  const indexMode = looksLikeIndex(query);
  const deviceIndex = compactIndex(device.deviceIndex);
  const partIndexes = device.parts.map(p => compactIndex(p.partIndex));

  // Gdy klient wpisuje indeks, nie pokazujemy luźnych trafień.
  // Albo indeks się zgadza, albo mówimy uczciwie, że brak dopasowania.
  if (indexMode) {
    if (deviceIndex === cq) return 200;
    if (deviceIndex.includes(cq) || cq.includes(deviceIndex)) return 120;
    if (partIndexes.some(pi => pi === cq)) return 110;
    if (partIndexes.some(pi => pi.includes(cq) || cq.includes(pi))) return 80;
    return 0;
  }

  const deviceHay = norm([device.deviceIndex, device.deviceName, device.brand, device.category].join(' '));
  const partsHay = norm(device.parts.flatMap(p => [p.partIndex, p.partName, p.position, p.keywords]).join(' '));
  let score = 0;

  if (deviceHay.includes(q)) score += 80;
  if (partsHay.includes(q)) score += 35;

  const tokens = q.split(' ').filter(t => t.length > 1);
  tokens.forEach(token => {
    if (deviceHay.includes(token)) score += 16;
    if (partsHay.includes(token)) score += 8;
  });

  return score;
}

function searchDevices(query) {
  const q = norm(query);
  if (!q || q.length < 2) return [];
  return groupDevices()
    .map(d => ({...d, score: scoreDevice(d, q)}))
    .filter(d => d.score > 0)
    .sort((a,b)=>b.score-a.score || a.deviceIndex.localeCompare(b.deviceIndex,'pl'))
    .slice(0,8);
}

function renderResults(devices) {
  const el = $('results');
  if (!el) return;
  if (!norm($('searchInput').value)) {
    el.innerHTML = `<div class="muted-box">Wpisz indeks lub nazwę urządzenia. Nie pokazujemy roboczej listy części na start — klient ma najpierw wybrać urządzenie.</div>`;
    return;
  }
  if (!devices.length) {
    el.innerHTML = `<div class="muted-box"><strong>Brak pewnego dopasowania w aktualnej bazie.</strong><br>Nie pokazuję przypadkowych części. Użyj trybu „Nie znam modelu” albo opisz element — kreator przygotuje maila z prośbą o identyfikację.</div>`;
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
  goToStep(2);
  updateMailPreview();
}

function renderDrawing(device) {
  const stage = $('drawingStage');
  const drawing = DRAWINGS.find(d => d.id === device.drawingId || d.deviceIndex === device.deviceIndex);
  activeDrawingPosition = null;
  resetDrawingZoom(false);
  if (!drawing) {
    stage.className = 'drawing-stage empty';
    stage.innerHTML = `<div class="empty-state">Rysunek dla ${esc(device.deviceIndex)} jest jeszcze do podpięcia.</div>`;
    return;
  }

  stage.className = 'drawing-stage has-embed interactive-drawing-stage';

  if (drawing.type === 'svg-demo') {
    stage.innerHTML = interactiveDrawingShell(drawing, demoSvg(), true);
    initInteractiveDrawing(stage, device);
    return;
  }

  if (drawing.drivePreviewUrl || drawing.localPath) {
    const src = drawing.localPath || drawing.drivePreviewUrl;
    const embed = `
      <iframe class="drawing-embed drawing-zoom-item" src="${src}" title="${esc(drawing.title)}"></iframe>
      <div class="drawing-overlay-note">PDF z Google Drive: użyj zoomu przeglądarki lub przycisków + / −. Pełną czytelność daje przycisk „Otwórz rysunek”.</div>`;
    stage.innerHTML = interactiveDrawingShell(drawing, embed, false);
    initInteractiveDrawing(stage, device);
    return;
  }

  stage.className = 'drawing-stage empty';
  stage.innerHTML = `<div class="empty-state"><strong>${esc(drawing.title)}</strong><br>Rysunek jest w indeksie, ale plik lokalny/Drive będzie podpięty po segregacji paczek.</div>`;
}

function interactiveDrawingShell(drawing, content, isHotspotReady) {
  const viewUrl = drawing.driveViewUrl || drawing.localPath || '';
  return `
    <div class="drawing-pro-header">
      <div>
        <strong>${esc(drawing.title || 'Rysunek techniczny')}</strong>
        <span>Powiększ kółkiem myszy, przeciągnij rysunek albo użyj przycisków. Na telefonie: przybliż palcami.</span>
      </div>
      <div class="drawing-actions">
        <button class="button ghost small" type="button" data-zoom-out>−</button>
        <button class="button ghost small" type="button" data-zoom-reset>Reset</button>
        <button class="button ghost small" type="button" data-zoom-in>+</button>
        ${viewUrl ? `<a class="button ghost small" href="${viewUrl}" target="_blank" rel="noopener">Otwórz rysunek</a>` : ''}
      </div>
    </div>
    <div class="drawing-viewport" data-drawing-viewport>
      <div class="drawing-canvas" data-drawing-canvas>
        ${content}
      </div>
    </div>
    <div class="drawing-help-row">
      <span>Scroll = zoom</span><span>Przeciągnij = przesuwanie</span><span>${isHotspotReady ? 'Kliknij numer na rysunku = dodaj część' : 'Kliknij część z listy = fokus na rysunek'}</span>
    </div>`;
}

function initInteractiveDrawing(stage, device) {
  const viewport = stage.querySelector('[data-drawing-viewport]');
  const canvas = stage.querySelector('[data-drawing-canvas]');
  if (!viewport || !canvas) return;
  updateDrawingTransform(canvas);

  stage.querySelector('[data-zoom-in]')?.addEventListener('click', () => zoomDrawing(1.18, canvas));
  stage.querySelector('[data-zoom-out]')?.addEventListener('click', () => zoomDrawing(1 / 1.18, canvas));
  stage.querySelector('[data-zoom-reset]')?.addEventListener('click', () => resetDrawingZoom(true));

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomDrawing(direction, canvas, e.offsetX, e.offsetY);
  }, { passive: false });

  viewport.addEventListener('pointerdown', (e) => {
    drawingZoom.dragging = true;
    drawingZoom.lastX = e.clientX;
    drawingZoom.lastY = e.clientY;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('is-dragging');
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!drawingZoom.dragging) return;
    drawingZoom.x += e.clientX - drawingZoom.lastX;
    drawingZoom.y += e.clientY - drawingZoom.lastY;
    drawingZoom.lastX = e.clientX;
    drawingZoom.lastY = e.clientY;
    updateDrawingTransform(canvas);
  });
  viewport.addEventListener('pointerup', (e) => {
    drawingZoom.dragging = false;
    viewport.classList.remove('is-dragging');
    try { viewport.releasePointerCapture(e.pointerId); } catch {}
  });
  viewport.addEventListener('pointercancel', () => {
    drawingZoom.dragging = false;
    viewport.classList.remove('is-dragging');
  });

  stage.querySelectorAll('[data-position]').forEach(h => h.addEventListener('click', (e) => {
    e.stopPropagation();
    const part = device.parts.find(p => p.position === h.dataset.position);
    focusDrawingPosition(h.dataset.position);
    if (part) addToCart(part.id);
  }));
}

function zoomDrawing(multiplier, canvas, originX, originY) {
  drawingZoom.scale = Math.max(0.65, Math.min(4.2, drawingZoom.scale * multiplier));
  updateDrawingTransform(canvas || document.querySelector('[data-drawing-canvas]'));
}

function resetDrawingZoom(animate = false) {
  drawingZoom = { scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
  const canvas = document.querySelector('[data-drawing-canvas]');
  if (canvas) {
    canvas.classList.toggle('smooth-transform', animate);
    updateDrawingTransform(canvas);
    setTimeout(() => canvas.classList.remove('smooth-transform'), 260);
  }
}

function updateDrawingTransform(canvas) {
  if (!canvas) return;
  canvas.style.transform = `translate(${drawingZoom.x}px, ${drawingZoom.y}px) scale(${drawingZoom.scale})`;
}

function focusDrawingPosition(position) {
  activeDrawingPosition = position;
  document.querySelectorAll('.hotspot, .part-card').forEach(el => el.classList.remove('active-match'));
  document.querySelectorAll(`[data-position="${CSS.escape(String(position))}"], [data-part-position="${CSS.escape(String(position))}"]`).forEach(el => el.classList.add('active-match'));
  const stage = $('drawingStage');
  stage?.classList.add('focus-pulse');
  setTimeout(() => stage?.classList.remove('focus-pulse'), 800);
  const canvas = document.querySelector('[data-drawing-canvas]');
  if (canvas && position && position !== '—') {
    drawingZoom.scale = Math.max(drawingZoom.scale, 1.55);
    updateDrawingTransform(canvas);
  }
}

function renderDrawingParts(parts) {
  const box = $('drawingParts');
  if (!parts?.length) { box.innerHTML = 'Brak pozycji dla wybranego urządzenia.'; return; }
  box.className = 'part-list';
  box.innerHTML = parts.map(p => `
    <article class="part-card" data-part-position="${esc(p.position)}">
      <div>
        <h4>${esc(p.partName)}</h4>
        <div class="meta"><span class="tag">poz. ${esc(p.position)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">${esc(p.availability)}</span></div>
      </div>
      <div class="part-actions">
        <button class="button ghost small" data-focus-position="${esc(p.position)}">Pokaż na rysunku</button>
        <button class="button primary small" data-add="${esc(p.id)}">Dodaj</button>
      </div>
    </article>`).join('');
  box.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
  box.querySelectorAll('[data-focus-position]').forEach(btn => btn.addEventListener('click', () => focusDrawingPosition(btn.dataset.focusPosition)));
}

function demoSvg() {
  return `<svg class="machine-svg drawing-zoom-item" viewBox="0 0 900 520" role="img" aria-label="Demo rysunku złożeniowego piły łańcuchowej">
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
  renderCart(); updateMailPreview(); goToStep(3); toast('Dodano do zapytania');
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
  if (needsAttachmentsWarning()) {
    lines.push('');
    lines.push('⚠️ UWAGA: PAMIĘTAJ, ABY TERAZ DOŁĄCZYĆ ZDJĘCIA DO TEGO MAILA W SWOIM PROGRAMIE POCZTOWYM!');
  }
  lines.push('');
  lines.push('Jeżeli przycisk generowania maila nie otworzył poczty, skopiuj tę treść i wyślij ją ręcznie na service@yato.pl.');
  lines.push('Wiadomość wygenerowana przez YATO Service Hub.');
  return {id, subject: `Zapytanie o części pogwarancyjne — ${selectedDevice?.deviceIndex || 'identyfikacja'} — ${id}`, body: lines.join('\n')};
}

function updateMailPreview() { const mail = buildMail(); $('mailPreview').textContent = mail.body; updateAttachmentWarning(); }

function openMail() {
  goToStep(5);
  const mail = buildMail();
  const url = `mailto:${encodeURIComponent(CONFIG.serviceEmail)}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`;
  window.location.href = url;
}

function downloadJson() {
  const payload = { createdAt:new Date().toISOString(), selectedDevice, cart, unknownMode, client:getFormData(), mail:buildMail() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `zapytanie-pgw-${Date.now()}.json`; a.click(); URL.revokeObjectURL(a.href);
}

function copyMail() { goToStep(5); navigator.clipboard.writeText(buildMail().body).then(() => toast('Treść skopiowana — wklej ją ręcznie do maila na service@yato.pl')); }
function toast(msg) { const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2200); }

function setUnknownMode() {
  unknownMode = true; selectedDevice = null; cart = []; renderCart();
  $('drawingHint').textContent = 'Tryb identyfikacji — rysunek nie został jeszcze wybrany.';
  $('drawingStage').className = 'drawing-stage empty';
  $('drawingStage').innerHTML = '<div class="empty-state"><strong>Nie znasz indeksu?</strong><br>Opisz urządzenie i część. Mail przypomni klientowi o dołączeniu zdjęć.</div>';
  $('drawingParts').className = 'part-list muted-box';
  $('drawingParts').textContent = 'Po identyfikacji urządzenia serwis dobierze właściwy rysunek.';
  $('unknownPanel').classList.remove('hidden');
  goToStep(1);
  $('unknownPanel').classList.add('step-visible');
  $('unknownPanel').scrollIntoView({behavior:'smooth', block:'center'});
  updateMailPreview();
}

function expandTokens(query) {
  const tokens = new Set(norm(query).split(' ').filter(Boolean));
  Object.entries(SYNONYMS).forEach(([main, words]) => {
    if (tokens.has(norm(main)) || words.some(w => tokens.has(norm(w)))) {
      tokens.add(norm(main));
      words.forEach(w => tokens.add(norm(w)));
    }
  });
  return tokens;
}

function scorePartByDescription(part, tokens) {
  const hay = norm([part.partName, part.partIndex, part.position, part.keywords].join(' '));
  let score = 0;
  tokens.forEach(t => { if (t.length > 1 && hay.includes(t)) score += 1; });
  return score;
}

function localSuggest() {
  const query = norm($('aiDescription').value);
  if (!query) { toast('Opisz część własnymi słowami'); return; }
  const tokens = expandTokens(query);
  const box = $('aiSuggestions');

  if (selectedDevice) {
    const scored = selectedDevice.parts
      .map(p => ({...p, score: scorePartByDescription(p, tokens)}))
      .filter(p => p.score > 0)
      .sort((a,b)=>b.score-a.score);

    if (!scored.length) {
      box.innerHTML = '<div class="muted-box">Nie mam pewnego dopasowania dla wybranego urządzenia. Dodaj opis do maila i poproś klienta o zdjęcie tabliczki oraz części.</div>';
      return;
    }

    box.innerHTML = scored.slice(0,4).map(p => `<article class="suggest-card"><div><strong>${esc(p.partName)}</strong><div class="meta"><span class="tag">poz. ${esc(p.position)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">dopasowanie lokalne</span></div></div><button class="button primary small" data-add="${esc(p.id)}">Dodaj</button></article>`).join('');
    box.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
    return;
  }

  // Bez wybranego urządzenia nie dodajemy części do koszyka.
  // Pokazujemy tylko urządzenia, w których opis może występować.
  const candidates = groupDevices().map(device => {
    const matchingParts = device.parts
      .map(p => ({...p, score: scorePartByDescription(p, tokens)}))
      .filter(p => p.score > 0)
      .sort((a,b)=>b.score-a.score);
    return {...device, matchingParts, score: matchingParts.reduce((sum,p)=>sum+p.score,0)};
  }).filter(d => d.score > 0).sort((a,b)=>b.score-a.score).slice(0,6);

  if (!candidates.length) {
    box.innerHTML = '<div class="muted-box">Nie widzę podobnej części w aktualnej bazie. Użyj trybu „Nie znam modelu” — wiadomość poprosi o zdjęcia.</div>';
    return;
  }

  box.innerHTML = `<div class="muted-box"><strong>Najpierw wybierz urządzenie.</strong><br>Znalazłem podobne nazwy części w tych modelach:</div>` + candidates.map(d => `
    <article class="device-card">
      <div>
        <div class="device-kicker">${esc(d.brand)} • możliwe dopasowanie po opisie</div>
        <h3>${esc(d.deviceIndex)} — ${esc(d.deviceName)}</h3>
        <p>${d.matchingParts.slice(0,3).map(p => esc(p.partName)).join(', ')}</p>
      </div>
      <div class="device-actions"><button class="button primary small" data-pick-device="${esc(d.deviceIndex)}">Wybierz urządzenie</button></div>
    </article>`).join('');
  box.querySelectorAll('[data-pick-device]').forEach(btn => btn.addEventListener('click', () => selectDevice(btn.dataset.pickDevice)));
}


// Produkcyjny katalog części — wyszukiwanie po każdej załadowanej pozycji, nie tylko po modelu.
function getCatalogMetaText() {
  const meta = window.PGW_DATABASE_META || {};
  const p = meta.partsCount || PARTS.length;
  const d = meta.devicesCount || groupDevices().length;
  return `${p} pozycji / ${d} indeksów w załadowanej bazie`;
}

function scorePart(part, query) {
  const q = norm(query);
  if (!q) return 0;
  const compactQ = compactIndex(query);
  const indexMode = looksLikeIndex(query);
  const hay = norm([part.deviceIndex, part.deviceName, part.brand, part.category, part.partIndex, part.partName, part.position, part.keywords].join(' '));
  const compactDevice = compactIndex(part.deviceIndex);
  const compactPart = compactIndex(part.partIndex);
  let score = 0;
  if (compactPart === compactQ) score += 260;
  if (compactDevice === compactQ) score += 180;
  if (compactPart.includes(compactQ) || compactQ.includes(compactPart)) score += indexMode ? 120 : 30;
  if (compactDevice.includes(compactQ) || compactQ.includes(compactDevice)) score += indexMode ? 100 : 25;
  if (hay.includes(q)) score += 80;
  const tokens = q.split(' ').filter(t => t.length > 1);
  tokens.forEach(token => {
    if (norm(part.partName).includes(token)) score += 30;
    if (norm(part.deviceIndex).includes(token)) score += 25;
    if (norm(part.deviceName).includes(token)) score += 18;
    if (norm(part.partIndex).includes(token)) score += 20;
    if (norm(part.keywords || '').includes(token)) score += 12;
  });
  return score;
}

function searchParts(query, limit = 12) {
  if (!norm(query) || norm(query).length < 2) return [];
  return PARTS.filter(p => p.public !== false)
    .map(p => ({...p, score: scorePart(p, query)}))
    .filter(p => p.score > 0)
    .sort((a,b) => b.score - a.score || String(a.deviceIndex).localeCompare(String(b.deviceIndex), 'pl'))
    .slice(0, limit);
}

function searchDevices(query) {
  const q = norm(query);
  if (!q || q.length < 2) return [];
  const partHits = searchParts(query, 80);
  const boost = new Map();
  partHits.forEach(p => boost.set(p.deviceIndex, (boost.get(p.deviceIndex) || 0) + p.score));
  return groupDevices()
    .map(d => ({...d, score: scoreDevice(d, q) + (boost.get(d.deviceIndex) || 0), matchingParts: partHits.filter(p => p.deviceIndex === d.deviceIndex).slice(0,4)}))
    .filter(d => d.score > 0)
    .sort((a,b)=>b.score-a.score || a.deviceIndex.localeCompare(b.deviceIndex,'pl'))
    .slice(0,8);
}

function renderResults(devices) {
  const el = $('results');
  if (!el) return;
  const raw = $('searchInput').value;
  const q = norm(raw);
  if (!q) {
    el.innerHTML = `<div class="muted-box"><strong>Katalog gotowy do wyszukiwania.</strong><br>${esc(getCatalogMetaText())}. Wpisz model, nazwę części albo indeks SAP — nie pokazujemy całej listy na start.</div>`;
    return;
  }
  const partHits = searchParts(raw, 10);
  const deviceHits = devices && devices.length ? devices : searchDevices(raw);
  if (!partHits.length && !deviceHits.length) {
    el.innerHTML = `<div class="muted-box"><strong>Brak pewnego dopasowania.</strong><br>Nie pokażę losowych części. Wpisz więcej danych, wybierz tryb „Nie znam modelu” albo opisz element — kreator przygotuje maila z prośbą o identyfikację.</div>`;
    return;
  }
  const partSection = partHits.length ? `
    <div class="catalog-section-title"><span>Najlepsze trafienia części</span><small>${partHits.length} z ${esc(getCatalogMetaText())}</small></div>
    ${partHits.map(p => `
      <article class="part-result-card catalog-result" data-part-result="${esc(p.id)}">
        <div>
          <div class="device-kicker">${esc(p.brand || 'TOYA')} • ${esc(p.deviceIndex)} • poz. ${esc(p.position || '—')}</div>
          <h3>${esc(p.partName)}</h3>
          <p>${esc(p.deviceName || 'Urządzenie do potwierdzenia')} · indeks części: <strong>${esc(p.partIndex)}</strong></p>
          <div class="meta"><span class="tag">${esc(p.deviceIndex)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">poz. ${esc(p.position || '—')}</span></div>
        </div>
        <div class="device-actions">
          <button class="button ghost small" data-open-part="${esc(p.id)}">Pokaż rysunek</button>
          <button class="button primary small" data-add="${esc(p.id)}">Dodaj do zapytania</button>
        </div>
      </article>`).join('')}` : '';
  const deviceSection = deviceHits.length ? `
    <div class="catalog-section-title"><span>Urządzenia i rysunki</span><small>wybierz model, aby zobaczyć rysunek</small></div>
    ${deviceHits.map(d => `
      <article class="device-card">
        <div>
          <div class="device-kicker">${esc(d.brand)} • ${esc(d.category || 'kategoria do uzupełnienia')}</div>
          <h3>${esc(d.deviceIndex)} — ${esc(d.deviceName)}</h3>
          <p>${d.matchingParts?.length ? 'Pasujące pozycje: ' + d.matchingParts.map(p => esc(p.partName)).join(', ') : d.parts.length + ' pozycji w bazie.'}</p>
          <div class="meta"><span class="tag">${esc(d.deviceIndex)}</span><span class="tag">${esc(d.brand)}</span><span class="tag">części: ${d.parts.length}</span></div>
        </div>
        <div class="device-actions">
          <button class="button ghost small" data-show-device="${esc(d.deviceIndex)}">Pokaż rysunek</button>
          <button class="button primary small" data-pick-device="${esc(d.deviceIndex)}">Wybierz urządzenie</button>
        </div>
      </article>`).join('')}` : '';
  el.innerHTML = partSection + deviceSection;
  el.querySelectorAll('[data-pick-device],[data-show-device]').forEach(btn => btn.addEventListener('click', () => selectDevice(btn.dataset.pickDevice || btn.dataset.showDevice)));
  el.querySelectorAll('[data-open-part]').forEach(btn => btn.addEventListener('click', () => openPartFromSearch(btn.dataset.openPart, false)));
  el.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => openPartFromSearch(btn.dataset.add, true)));
}

function openPartFromSearch(partId, addAfterOpen = false) {
  const part = PARTS.find(p => p.id === partId);
  if (!part) return;
  selectDevice(part.deviceIndex);
  setTimeout(() => {
    if (part.position && part.position !== '—') focusDrawingPosition(part.position);
    if (addAfterOpen) addToCart(part.id);
  }, 140);
}

function fillDemo() {
  $('searchInput').value = '82200 tarcza polerska';
  renderResults(searchDevices('82200 tarcza polerska'));
  selectDevice('YT-82200');
  addToCart('yt-82200-zy8220004-4');
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
  $('searchInput').addEventListener('input', () => { if (norm($('searchInput').value).length >= 2) renderResults(searchDevices($('searchInput').value)); else { $('results').innerHTML = '<div class="muted-box">Wpisz indeks lub nazwę urządzenia. Wyniki pokażą się dopiero po wyszukaniu.</div>'; } });
  $('fillDemoBtn').addEventListener('click', fillDemo);
  $('unknownBtn').addEventListener('click', setUnknownMode);
  $('aiSuggestBtn').addEventListener('click', localSuggest);
  $('generateMailBtn').addEventListener('click', openMail);
  $('copyMailBtn').addEventListener('click', copyMail);
  $('downloadJsonBtn').addEventListener('click', downloadJson);
  document.querySelectorAll('[data-jump-step]').forEach(btn => btn.addEventListener('click', () => goToStep(btn.dataset.jumpStep)));
  $('clientForm').addEventListener('input', () => { updateMailPreview(); if (currentStep < 4) goToStep(4); });
  document.querySelectorAll('#unknownPanel input, #unknownPanel textarea').forEach(el => el.addEventListener('input', updateMailPreview));
  renderCart(); updateMailPreview(); goToStep(1);

  if (window.PGWLiveSheet?.start) {
    window.PGWLiveSheet.start({
      getParts: () => PARTS,
      setParts: (nextParts) => { PARTS = Array.isArray(nextParts) ? nextParts : PARTS; },
      getDrawings: () => DRAWINGS,
      setDrawings: (nextDrawings) => { DRAWINGS = Array.isArray(nextDrawings) ? nextDrawings : DRAWINGS; },
      refresh: () => {
        try {
          const q = $('searchInput')?.value || '';
          if (q && norm(q).length >= 2) renderResults(searchDevices(q));
          if (selectedDevice) {
            const current = selectedDevice.deviceIndex;
            const fresh = groupDevices().find(d => d.deviceIndex === current);
            if (fresh) {
              selectedDevice = fresh;
              renderDrawing(selectedDevice);
              renderDrawingParts(selectedDevice.parts);
            }
          }
        } catch (err) { console.warn('Live catalog refresh failed', err); }
      }
    });
  }
}



/* TOYA24 primary PDF/source integration */
function toya24Entries() {
  const raw = window.PGW_TOYA24_INDEX?.entries || [];
  return Array.isArray(raw) ? raw : [];
}

function findToya24Entry(deviceIndex) {
  const key = compactIndex(deviceIndex || '');
  if (!key) return null;
  return toya24Entries().find(e => {
    const indexes = [e.deviceIndex, ...(e.aliases || [])].map(compactIndex);
    return indexes.includes(key);
  }) || null;
}

function toya24SearchUrl(deviceIndex) {
  const q = encodeURIComponent(deviceIndex || '');
  return `https://toya24.pl/pl-PL/search?text=${q}`;
}

function drawingSourceFor(device) {
  const toya = findToya24Entry(device.deviceIndex);
  const drive = DRAWINGS.find(d => d.id === device.drawingId || d.deviceIndex === device.deviceIndex) || (toya?.driveBackupUrl ? { deviceIndex: device.deviceIndex, title: `Backup Drive ${device.deviceIndex}`, driveViewUrl: toya.driveBackupUrl, drivePreviewUrl: toya.driveBackupUrl, type: 'drive-backup-from-sheet' } : null);
  return { toya, drive };
}

function getCatalogMetaText() {
  const meta = window.PGW_DATABASE_META;
  const parts = meta?.partsCount || PARTS.filter(p => p.public !== false).length;
  const devices = meta?.devicesCount || groupDevices().length;
  const toyaCount = toya24Entries().length;
  const sheet = window.PGW_TOYA24_INDEX?.sheetName ? `; źródło linków: ${window.PGW_TOYA24_INDEX.sheetName}` : '';
  return `${parts} pozycji / ${devices} indeksów; TOYA24: ${toyaCount} rekordów${sheet}`;
}

function sourceRibbonHtml(deviceOrIndex) {
  const deviceIndex = typeof deviceOrIndex === 'string' ? deviceOrIndex : deviceOrIndex?.deviceIndex;
  const {toya, drive} = drawingSourceFor({deviceIndex, drawingId: deviceOrIndex?.drawingId});
  const chips = [];
  if (toya?.partsPdfUrl) chips.push('<span class="source-chip toya24">✓ PDF części z TOYA24</span>');
  else if (toya?.productUrl) chips.push('<span class="source-chip toya24">✓ karta produktu TOYA24</span>');
  if (drive?.driveViewUrl || drive?.drivePreviewUrl) chips.push('<span class="source-chip">backup: Google Drive</span>');
  if (!chips.length) chips.push('<span class="source-chip">PDF: do zmapowania</span>');
  return `<div class="source-ribbon">${chips.join('')}</div>`;
}

renderDrawing = function(device) {
  const stage = $('drawingStage');
  const {toya, drive} = drawingSourceFor(device);
  activeDrawingPosition = null;
  resetDrawingZoom(false);

  if (toya?.partsPdfUrl) {
    stage.className = 'drawing-stage has-pdf-direct';
    const openOriginal = toya.partsPdfUrl;
    const productUrl = toya.productUrl || toya24SearchUrl(device.deviceIndex);
    const backupUrl = toya?.driveBackupUrl || drive?.driveViewUrl || drive?.localPath || '';
    stage.innerHTML = `
      <div class="drawing-pro-header">
        <div>
          <strong>${esc(toya.partsTitle || `Części zamienne ${device.deviceIndex}`)}</strong>
          <span>Źródło główne: TOYA24. Link pochodzi z arkusza „TOYA24 integracja”; PDF zostaje poza repo.</span>
          ${sourceRibbonHtml(device)}
        </div>
        <div class="drawing-actions">
          <a class="button primary small" href="${esc(openOriginal)}" target="_blank" rel="noopener">Otwórz PDF z TOYA24</a>
          <a class="button ghost small" href="${esc(productUrl)}" target="_blank" rel="noopener">Karta produktu</a>
          ${backupUrl ? `<a class="button ghost small" href="${esc(backupUrl)}" target="_blank" rel="noopener">Backup Drive</a>` : ''}
        </div>
      </div>
      <div class="pdf-source-layout">
        <div class="pdf-frame-wrap">
          <iframe class="pdf-frame" src="${esc(openOriginal)}" title="${esc(toya.partsTitle || 'Części zamienne TOYA24')}"></iframe>
        </div>
        <aside class="pdf-side-panel" id="selectedPartGuide">
          <h4>Wybierz część z listy</h4>
          <p>Po kliknięciu części pokażemy tutaj numer pozycji, indeks i nazwę. PDF przewijasz normalnie w przeglądarce — bez udawania automatycznego trafiania w numer.</p>
          <div class="pdf-note">Tryb produkcyjny: TOYA24 jako główne źródło PDF, Google Drive jako zapas, baza części po naszej stronie. Aktualizacja linków: arkusz „TOYA24 integracja”.</div>
        </aside>
      </div>`;
    return;
  }

  if (drive?.type === 'svg-demo') {
    stage.className = 'drawing-stage has-embed interactive-drawing-stage';
    stage.innerHTML = interactiveDrawingShell(drive, demoSvg(), true);
    initInteractiveDrawing(stage, device);
    return;
  }

  if (drive?.drivePreviewUrl || drive?.localPath) {
    const src = drive.localPath || drive.drivePreviewUrl;
    const viewUrl = drive.driveViewUrl || drive.localPath || '';
    stage.className = 'drawing-stage has-pdf-direct';
    stage.innerHTML = `
      <div class="drawing-pro-header">
        <div>
          <strong>${esc(drive.title || `Rysunek ${device.deviceIndex}`)}</strong>
          <span>Źródło zapasowe: Google Drive. TOYA24 nie jest jeszcze zmapowane dla tego modelu.</span>
          ${sourceRibbonHtml(device)}
        </div>
        <div class="drawing-actions">
          ${viewUrl ? `<a class="button primary small" href="${esc(viewUrl)}" target="_blank" rel="noopener">Otwórz backup Drive</a>` : ''}
          <a class="button ghost small" href="${esc(toya24SearchUrl(device.deviceIndex))}" target="_blank" rel="noopener">Szukaj na TOYA24</a>
        </div>
      </div>
      <div class="pdf-source-layout">
        <div class="pdf-frame-wrap"><iframe class="pdf-frame" src="${esc(src)}" title="${esc(drive.title || 'Rysunek z Drive')}"></iframe></div>
        <aside class="pdf-side-panel" id="selectedPartGuide"><h4>Pozycja z listy części</h4><p>Wybierz część z listy. Pokażemy numer pozycji i indeks, a rysunek otworzysz w PDF.</p><div class="pdf-note">Ten model czeka na link TOYA24. Backup działa z Drive.</div></aside>
      </div>`;
    return;
  }

  stage.className = 'drawing-stage empty';
  stage.innerHTML = `
    <div class="toya24-missing-box">
      <strong>Brak podpiętego PDF-u dla ${esc(device.deviceIndex)}</strong>
      <p>Nie zapychamy repo PDF-ami. Linki uzupełniamy w arkuszu „TOYA24 integracja”, a strona korzysta z wygenerowanej lekkiej mapy.</p>
      <div class="drawing-actions">
        <a class="button primary small" href="${esc(toya24SearchUrl(device.deviceIndex))}" target="_blank" rel="noopener">Szukaj produktu na TOYA24</a>
        ${drive?.driveViewUrl ? `<a class="button ghost small" href="${esc(drive.driveViewUrl)}" target="_blank" rel="noopener">Backup Drive</a>` : ''}
      </div>
    </div>`;
};

function renderSelectedPartGuide(part) {
  const box = $('selectedPartGuide');
  if (!box || !part) return;
  const {toya, drive} = drawingSourceFor(part);
  const original = toya?.partsPdfUrl || drive?.driveViewUrl || drive?.localPath || '';
  const product = toya?.productUrl || toya24SearchUrl(part.deviceIndex);
  box.innerHTML = `
    <h4>Wybrana część</h4>
    <div class="selected-part-box">
      <strong>${esc(part.partName)}</strong>
      <div class="position-big">poz. ${esc(part.position || '—')}</div>
      <small>Indeks: <b>${esc(part.partIndex)}</b><br>Urządzenie: ${esc(part.deviceIndex)}</small>
    </div>
    <p>Otwórz PDF i znajdź wskazaną pozycję. Dopóki nie mamy hotspotów, nie udajemy automatycznego zaznaczania numeru na rysunku.</p>
    <div class="pdf-action-stack">
      ${original ? `<a class="button primary small" href="${esc(original)}" target="_blank" rel="noopener">Otwórz rysunek</a>` : ''}
      <a class="button ghost small" href="${esc(product)}" target="_blank" rel="noopener">Karta / wyszukiwanie TOYA24</a>
    </div>
    <div class="pdf-note">Hotspoty można dodać później tylko dla topowych modeli. Teraz priorytetem jest stabilny katalog i lekkie repo.</div>`;
}

focusDrawingPosition = function(position) {
  activeDrawingPosition = position;
  document.querySelectorAll('.hotspot, .part-card').forEach(el => el.classList.remove('active-match'));
  try {
    document.querySelectorAll(`[data-position="${CSS.escape(String(position))}"], [data-part-position="${CSS.escape(String(position))}"]`).forEach(el => el.classList.add('active-match'));
  } catch {}
  const part = selectedDevice?.parts?.find(p => String(p.position) === String(position));
  if (part) renderSelectedPartGuide(part);
  const stage = $('drawingStage');
  stage?.classList.add('focus-pulse');
  setTimeout(() => stage?.classList.remove('focus-pulse'), 700);
};

renderDrawingParts = function(parts) {
  const box = $('drawingParts');
  if (!parts?.length) { box.innerHTML = 'Brak pozycji dla wybranego urządzenia.'; return; }
  box.className = 'part-list';
  box.innerHTML = parts.map(p => `
    <article class="part-card" data-part-position="${esc(p.position)}">
      <div>
        <h4>${esc(p.partName)}</h4>
        <div class="meta"><span class="tag">poz. ${esc(p.position)}</span><span class="tag">${esc(p.partIndex)}</span><span class="tag">${esc(p.availability)}</span></div>
      </div>
      <div class="part-actions">
        <button class="button ghost small" data-focus-position="${esc(p.position)}">Wskaż pozycję</button>
        <button class="button primary small" data-add="${esc(p.id)}">Dodaj</button>
      </div>
    </article>`).join('');
  box.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
  box.querySelectorAll('[data-focus-position]').forEach(btn => btn.addEventListener('click', () => focusDrawingPosition(btn.dataset.focusPosition)));
};

const _oldSelectDevice = selectDevice;
selectDevice = function(deviceIndex) {
  selectedDevice = groupDevices().find(d => d.deviceIndex === deviceIndex);
  unknownMode = false;
  if (!selectedDevice) return;
  const {toya} = drawingSourceFor(selectedDevice);
  $('drawingHint').innerHTML = `${esc(selectedDevice.deviceIndex)} — ${esc(selectedDevice.deviceName)} ${toya?.partsPdfUrl ? '<br><span class="source-chip toya24">rysunek z TOYA24</span>' : ''}`;
  renderDrawing(selectedDevice);
  renderDrawingParts(selectedDevice.parts);
  goToStep(2);
  updateMailPreview();
};

const _oldRenderResults = renderResults;
renderResults = function(devices) {
  _oldRenderResults(devices);
  document.querySelectorAll('.device-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent || '';
    const model = (title.match(/[A-Z]{1,4}-?\d{3,}|\b\d{5,}\b/) || [''])[0];
    if (model && !card.querySelector('.source-ribbon')) {
      const d = groupDevices().find(x => x.deviceIndex === model || compactIndex(x.deviceIndex) === compactIndex(model));
      if (d) card.querySelector('.meta')?.insertAdjacentHTML('afterend', sourceRibbonHtml(d));
    }
  });
};



/* FULL PRODUCT SAFETY NET — no more dead searches.
   If a model/part is not yet in PGW sheet, the UI still creates a working TOYA24/Drive fallback card. */
function normalizeModel(raw='') {
  const txt = String(raw || '').toUpperCase().trim();
  const m = txt.match(/\b(YT|YG|YTG|S|V|FLO|LUND|STHOR|VOREL)?[-\s]?(\d{4,7})\b/);
  if (!m) return '';
  const prefix = m[1] || (txt.includes('GASTRO') ? 'YG' : 'YT');
  return `${prefix}-${m[2]}`.replace('YT-0','YT-0');
}
function toya24SearchUrlAny(q='') {
  const text = encodeURIComponent(String(q || '').trim());
  return `https://toya24.pl/pl-PL/search?text=${text}`;
}
function googleToya24SearchUrl(q='') {
  return `https://www.google.com/search?q=${encodeURIComponent('site:toya24.pl '+String(q||'').trim())}`;
}
function driveFallbackSearchUrl(q='') {
  return `https://drive.google.com/drive/search?q=${encodeURIComponent(String(q||'').trim())}`;
}
function makeFallbackPart(rawQuery) {
  const model = normalizeModel(rawQuery) || String(rawQuery || '').toUpperCase().trim();
  const clean = compactIndex(model || rawQuery || 'fallback');
  return {
    id: `fallback-${clean}`,
    public: true,
    deviceIndex: model || String(rawQuery || '').toUpperCase(),
    deviceName: `Model do wyszukania w TOYA24`,
    brand: model.startsWith('YG') ? 'YATO GASTRO' : 'YATO',
    category: 'Do pobrania z TOYA24 / Drive backup',
    partIndex: model || String(rawQuery || '').toUpperCase(),
    partName: `Zapytanie o ${model || rawQuery}`,
    position: '—',
    drawingId: `fallback-${clean}`,
    availability: 'Do potwierdzenia przez serwis',
    keywords: `${rawQuery} ${model} toya24 rysunek części zamienne instrukcja`,
    fallbackOnly: true
  };
}
function ensureFallbackPart(rawQuery) {
  const part = makeFallbackPart(rawQuery);
  const exists = PARTS.find(p => p.id === part.id || compactIndex(p.deviceIndex) === compactIndex(part.deviceIndex));
  if (exists) return exists;
  PARTS.push(part);
  DRAWINGS.push({
    id: part.drawingId,
    deviceIndex: part.deviceIndex,
    brand: part.brand,
    title: `TOYA24 / Drive — ${part.deviceIndex}`,
    type: 'toya24-search-fallback',
    status: 'fallback_search',
    toya24ProductUrl: toya24SearchUrlAny(part.deviceIndex),
    toya24PartsPdfUrl: '',
    driveViewUrl: driveFallbackSearchUrl(part.deviceIndex)
  });
  return part;
}
function fallbackResultHtml(rawQuery) {
  const part = makeFallbackPart(rawQuery);
  const model = esc(part.deviceIndex || rawQuery);
  const q = esc(String(rawQuery || '').trim());
  return `
    <div class="catalog-section-title"><span>Nie ma jeszcze tego w bazie PGW</span><small>ale klient nie zostaje ze ścianą</small></div>
    <article class="device-card fallback-card">
      <div>
        <div class="device-kicker">TOYA24 safety net • wyszukiwanie po modelu/indeksie</div>
        <h3>${model} — wyszukaj w TOYA24 / Drive</h3>
        <p>Ten model nie jest jeszcze w eksporcie katalogu. Kreator może mimo tego przygotować zapytanie i otworzyć źródła, gdzie zwykle jest karta produktu oraz sekcja „Do pobrania”.</p>
        <div class="meta"><span class="tag">${model}</span><span class="tag">TOYA24</span><span class="tag">Drive backup</span></div>
        <div class="source-ribbon"><span class="source-chip warn">do importu</span><span class="source-chip">nie blokuj klienta</span></div>
      </div>
      <div class="device-actions">
        <button class="button ghost small" data-fallback-device="${esc(part.deviceIndex)}" data-raw-query="${q}">Pokaż panel źródeł</button>
        <a class="button primary small" href="${esc(toya24SearchUrlAny(rawQuery))}" target="_blank" rel="noopener">Szukaj w TOYA24</a>
        <a class="button ghost small" href="${esc(googleToya24SearchUrl(rawQuery))}" target="_blank" rel="noopener">Google → TOYA24</a>
      </div>
    </article>`;
}
function selectFallbackDevice(rawQuery) {
  const p = ensureFallbackPart(rawQuery);
  selectedDevice = {
    deviceIndex: p.deviceIndex,
    deviceName: p.deviceName,
    brand: p.brand,
    category: p.category,
    drawingId: p.drawingId,
    parts: [p],
    fallbackOnly: true
  };
  unknownMode = false;
  $('drawingHint').innerHTML = `${esc(selectedDevice.deviceIndex)} — źródła zewnętrzne <br><span class="source-chip warn">TOYA24 / Drive fallback</span>`;
  renderFallbackDrawingPanel(selectedDevice, rawQuery);
  renderDrawingParts(selectedDevice.parts);
  goToStep(2);
  updateMailPreview();
}
function renderFallbackDrawingPanel(device, rawQuery) {
  const q = rawQuery || device.deviceIndex;
  const stage = $('drawingStage');
  stage.className = 'drawing-stage has-pdf-direct fallback-drawing';
  stage.innerHTML = `
    <div class="drawing-pro-header">
      <div>
        <strong>${esc(device.deviceIndex)} — brak lokalnego rysunku w katalogu</strong>
        <span>To nie jest koniec procesu. Otwórz TOYA24/Drive, a klient nadal może wysłać kompletne zapytanie z modelem.</span>
      </div>
      <div class="drawing-actions">
        <a class="button primary small" href="${esc(toya24SearchUrlAny(q))}" target="_blank" rel="noopener">Szukaj w TOYA24</a>
        <a class="button ghost small" href="${esc(googleToya24SearchUrl(q))}" target="_blank" rel="noopener">Google → TOYA24</a>
        <a class="button ghost small" href="${esc(driveFallbackSearchUrl(q))}" target="_blank" rel="noopener">Drive backup</a>
      </div>
    </div>
    <div class="fallback-source-board">
      <div class="fallback-step"><b>1</b><strong>Karta produktu TOYA24</strong><span>Otwórz wynik i sprawdź sekcję „Do pobrania”.</span></div>
      <div class="fallback-step"><b>2</b><strong>Części zamienne / PDF</strong><span>Jeżeli PDF istnieje, kopiujemy link do arkusza „TOYA24 integracja”.</span></div>
      <div class="fallback-step"><b>3</b><strong>Backup Drive</strong><span>Gdy TOYA24 nie ma załącznika, rysunek podpinamy z Dysku.</span></div>
    </div>
    <div class="empty-state strong">Ten model jest do importu. Strona nie udaje rysunku, którego nie ma — daje ścieżkę do źródeł i pozwala wysłać zapytanie.</div>`;
}

const _pgwOldRenderResults2 = renderResults;
renderResults = function(devices) {
  const raw = $('searchInput')?.value || '';
  _pgwOldRenderResults2(devices);
  const hasResults = $('results')?.querySelector('.device-card, .part-result-card');
  if (!hasResults && norm(raw).length >= 2) {
    $('results').innerHTML = fallbackResultHtml(raw);
  } else if (hasResults && looksLikeIndex(raw) && !PARTS.some(p => compactIndex(p.partIndex) === compactIndex(raw) || compactIndex(p.deviceIndex) === compactIndex(raw))) {
    $('results').insertAdjacentHTML('beforeend', fallbackResultHtml(raw));
  }
  $('results')?.querySelectorAll('[data-fallback-device]').forEach(btn => btn.addEventListener('click', () => selectFallbackDevice(btn.dataset.rawQuery || btn.dataset.fallbackDevice)));
};

const _pgwOldRenderDrawing2 = renderDrawing;
renderDrawing = function(device) {
  if (device?.fallbackOnly || DRAWINGS.find(d => d.id === device?.drawingId)?.type === 'toya24-search-fallback') {
    renderFallbackDrawingPanel(device, device.deviceIndex);
    return;
  }
  _pgwOldRenderDrawing2(device);
};

document.addEventListener('DOMContentLoaded', init);

