(() => {
  'use strict';
  const CONFIG = window.PGW_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const els = {
    loadStatus: $('loadStatus'), statDevices: $('statDevices'), statDrawings: $('statDrawings'), statParts: $('statParts'),
    deviceSearch: $('deviceSearch'), deviceResults: $('deviceResults'), deviceMeta: $('deviceMeta'), quickExamples: $('quickExamples'),
    selectedDeviceBox: $('selectedDeviceBox'), partsSearch: $('partsSearch'), partsTable: $('partsTable'),
    viewer: $('viewer'), openPdf: $('openPdf'), basketItems: $('basketItems'), basketCount: $('basketCount'), goData: $('goData'), clearBasket: $('clearBasket'),
    customerForm: $('customerForm'), sameAsInvoice: $('sameAsInvoice'), mailTo: $('mailTo'), mailSubject: $('mailSubject'), mailBody: $('mailBody'),
    copyMail: $('copyMail'), copySubject: $('copySubject'), copyStatus: $('copyStatus'), startOver: $('startOver')
  };
  const progressIds = ['pDevice','pDrawing','pParts','pData','pMail'];

  const state = {
    devices: [], drawings: [], parts: [], driveMap: [],
    drawingById: new Map(), partsByDrawing: new Map(), driveByDrawingId: new Map(), driveByKey: new Map(),
    selectedDevice: null, selectedDrawing: null, selectedParts: new Map(), step: 1, formDirty: false
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    try {
      setStatus('Ładowanie katalogu…');
      const urls = CONFIG.dataUrls || {};
      state.devices = await loadFirst(urls.devices || ['data/devices.json'], []);
      state.drawings = await loadFirst(urls.drawings || ['data/drawings.json'], []);
      state.parts = await loadFirst(urls.parts || ['data/parts.json'], []);
      state.driveMap = await loadFirst(urls.driveMap || ['data/drive-drawings-map.json'], []);
      normalizeData();
      buildIndexes();
      bindEvents();
      renderStats();
      renderExamples();
      restoreDraft();
      renderDeviceResults('');
      setStatus(`Gotowe: ${fmt(state.devices.length)} urządzeń, ${fmt(state.parts.length)} części`, 'ok');
    } catch (error) {
      console.error(error);
      setStatus('Nie udało się załadować danych', 'warn');
      els.deviceResults.innerHTML = `<div class="device-card"><div><h3>Błąd ładowania katalogu</h3><p>${escapeHtml(error.message || error)}</p></div></div>`;
    }
  }

  async function loadFirst(urls, fallback) {
    let lastError;
    for (const url of urls) {
      try {
        const res = await fetch(url, {cache: 'no-store'});
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        return await res.json();
      } catch (e) { lastError = e; }
    }
    if (fallback !== undefined) return fallback;
    throw lastError || new Error('Brak danych');
  }

  function normalizeData() {
    state.devices = arr(state.devices).filter(Boolean);
    state.drawings = arr(state.drawings).filter(d => isPdf(d));
    state.parts = arr(state.parts).filter(Boolean);
    state.driveMap = arr(state.driveMap).filter(row => isPdf(row));

    const driveKeys = new Set();
    for (const row of state.driveMap) {
      row.fileId = row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.id || '';
      row.viewerUrl = row.viewerUrl || (row.fileId ? `https://drive.google.com/file/d/${encodeURIComponent(row.fileId)}/preview` : '');
      row.openUrl = row.openUrl || (row.fileId ? `https://drive.google.com/file/d/${encodeURIComponent(row.fileId)}/view` : row.url || '');
      row.__keys = unique([row.deviceIndex, row.fileName, row.title, row.name, ...(row.keys || [])].flat().map(normKey).filter(Boolean));
      for (const k of row.__keys) driveKeys.add(k);
    }

    state.drawings = state.drawings.filter(d => {
      const keys = drawingKeys(d);
      return keys.some(k => driveKeys.has(k));
    });
    const drawingIds = new Set(state.drawings.map(d => String(d.id)));
    state.parts = state.parts.filter(p => drawingIds.has(String(p.drawingId)) && p.partIndex && !looksLikeHeaderPart(p));
    const deviceKeys = new Set(state.drawings.map(d => norm(d.deviceIndex)).filter(Boolean));
    state.devices = state.devices.filter(d => deviceKeys.has(norm(d.deviceIndex)));
  }

  function buildIndexes() {
    state.drawingById = new Map(state.drawings.map(d => [String(d.id), d]));
    state.partsByDrawing = new Map();
    for (const p of state.parts) {
      const did = String(p.drawingId || '');
      if (!state.partsByDrawing.has(did)) state.partsByDrawing.set(did, []);
      state.partsByDrawing.get(did).push(p);
    }
    state.driveByKey = new Map();
    for (const row of state.driveMap) {
      for (const key of row.__keys || []) if (!state.driveByKey.has(key)) state.driveByKey.set(key, row);
    }
    state.driveByDrawingId = new Map();
    for (const d of state.drawings) {
      const row = resolveDrive(d);
      if (row) state.driveByDrawingId.set(String(d.id), row);
    }
    for (const d of state.devices) d.__search = norm([d.deviceIndex, d.title, d.name, d.brand].join(' '));
    for (const p of state.parts) p.__search = norm([p.position, p.partIndex, p.namePl, p.nameEn, p.drawingTitle, p.deviceIndex].join(' '));
  }

  function bindEvents() {
    els.deviceSearch.addEventListener('input', debounce(() => renderDeviceResults(els.deviceSearch.value), 90));
    els.partsSearch.addEventListener('input', debounce(renderParts, 90));
    els.goData.addEventListener('click', () => goStep(3));
    els.clearBasket.addEventListener('click', () => { state.selectedParts.clear(); renderBasket(); saveDraft(); });
    document.querySelectorAll('.step').forEach(btn => btn.addEventListener('click', () => goStep(Number(btn.dataset.step))));
    els.sameAsInvoice.addEventListener('change', applySameAsInvoice);
    els.customerForm.addEventListener('input', () => { state.formDirty = true; saveDraft(); updateCanProceed(); });
    els.customerForm.addEventListener('change', () => { state.formDirty = true; saveDraft(); updateCanProceed(); });
    els.copyMail.addEventListener('click', () => copyText(els.mailBody.value, 'Skopiowano treść maila.'));
    els.copySubject.addEventListener('click', () => copyText(els.mailSubject.value, 'Skopiowano temat.'));
    els.startOver.addEventListener('click', resetAll);
  }

  function renderStats() {
    els.statDevices.textContent = fmt(state.devices.length);
    els.statDrawings.textContent = fmt(state.drawings.length);
    els.statParts.textContent = fmt(state.parts.length);
  }

  function renderExamples() {
    const examples = state.devices.slice(0, 5).map(d => d.deviceIndex).filter(Boolean);
    els.quickExamples.innerHTML = examples.map(x => `<button type="button" data-q="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('');
    els.quickExamples.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      els.deviceSearch.value = btn.dataset.q;
      renderDeviceResults(btn.dataset.q);
    }));
  }

  function renderDeviceResults(query) {
    const q = norm(query);
    const tokens = q.split(/\s+/).filter(Boolean);
    let results = state.devices.map(device => {
      const drawings = state.drawings.filter(d => norm(d.deviceIndex) === norm(device.deviceIndex));
      const partCount = drawings.reduce((n, d) => n + (state.partsByDrawing.get(String(d.id)) || []).length, 0);
      let score = 0;
      const idx = norm(device.deviceIndex);
      if (!tokens.length) score = partCount ? 10 : 0;
      for (const t of tokens) {
        if (idx === t || idx.replace(/-/g,'') === t.replace(/-/g,'')) score += 120;
        else if (idx.includes(t) || idx.replace(/-/g,'').includes(t.replace(/-/g,''))) score += 80;
        if (device.__search.includes(t)) score += 25;
      }
      return {device, drawings, partCount, score};
    }).filter(x => x.partCount > 0 && (!tokens.length || x.score > 0));
    results.sort((a,b) => b.score - a.score || b.partCount - a.partCount || String(a.device.deviceIndex).localeCompare(String(b.device.deviceIndex)));
    results = results.slice(0, tokens.length ? 30 : 12);

    els.deviceMeta.textContent = tokens.length ? `Znaleziono ${fmt(results.length)} pasujących urządzeń.` : 'Najpierw wybierz urządzenie. Poniżej kilka przykładów z aktualnej bazy.';
    if (!results.length) {
      els.deviceResults.innerHTML = `<div class="device-card"><div><h3>Brak wyniku</h3><p>Spróbuj wpisać sam numer, np. bez myślnika, albo sprawdź indeks z tabliczki znamionowej.</p></div></div>`;
      return;
    }
    els.deviceResults.innerHTML = results.map(({device, drawings, partCount}) => `
      <article class="device-card ${state.selectedDevice && norm(state.selectedDevice.deviceIndex) === norm(device.deviceIndex) ? 'selected' : ''}">
        <div>
          <h3>${escapeHtml(device.deviceIndex || 'Bez indeksu')}</h3>
          <p>${escapeHtml(device.title || device.name || 'Urządzenie z bazą rysunku PDF')}</p>
          <div class="badges"><span class="badge ok">PDF Drive</span><span class="badge">${fmt(drawings.length)} rys.</span><span class="badge">${fmt(partCount)} części</span></div>
        </div>
        <button class="primary" type="button" data-device="${escapeAttr(device.deviceIndex)}">Wybierz</button>
      </article>`).join('');
    els.deviceResults.querySelectorAll('button[data-device]').forEach(btn => btn.addEventListener('click', () => selectDevice(btn.dataset.device)));
  }

  function selectDevice(deviceIndex) {
    const device = state.devices.find(d => norm(d.deviceIndex) === norm(deviceIndex));
    if (!device) return;
    const drawings = state.drawings.filter(d => norm(d.deviceIndex) === norm(device.deviceIndex));
    const drawing = drawings.sort((a,b) => (state.partsByDrawing.get(String(b.id)) || []).length - (state.partsByDrawing.get(String(a.id)) || []).length)[0];
    state.selectedDevice = device;
    state.selectedDrawing = drawing;
    renderDeviceResults(els.deviceSearch.value);
    renderSelectedDevice();
    renderParts();
    renderViewer(true);
    goStep(2);
    saveDraft();
  }

  function renderSelectedDevice() {
    const d = state.selectedDevice, drawing = state.selectedDrawing;
    if (!d || !drawing) { els.selectedDeviceBox.innerHTML = ''; return; }
    const count = (state.partsByDrawing.get(String(drawing.id)) || []).length;
    els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex)} — ${escapeHtml(d.title || drawing.title || '')}</strong><span>Rysunek: ${escapeHtml(drawing.fileName || drawing.title || '')} • ${fmt(count)} części</span>`;
  }

  function renderParts() {
    const drawing = state.selectedDrawing;
    if (!drawing) { els.partsTable.innerHTML = ''; return; }
    const q = norm(els.partsSearch.value);
    const tokens = q.split(/\s+/).filter(Boolean);
    let parts = (state.partsByDrawing.get(String(drawing.id)) || []).slice();
    if (tokens.length) parts = parts.filter(p => tokens.every(t => p.__search.includes(t) || norm(String(p.partIndex).replace(/[-\s]/g,'')).includes(t.replace(/[-\s]/g,''))));
    parts.sort((a,b) => Number(a.position || 9999) - Number(b.position || 9999) || String(a.partIndex).localeCompare(String(b.partIndex)));
    if (!parts.length) {
      els.partsTable.innerHTML = `<tr><td colspan="4">Brak części dla wpisanej frazy.</td></tr>`;
      return;
    }
    els.partsTable.innerHTML = parts.map(p => {
      const selected = state.selectedParts.has(p.id);
      return `<tr>
        <td>${escapeHtml(p.position || '')}</td>
        <td>${escapeHtml(p.partIndex || '')}</td>
        <td>${escapeHtml(p.namePl || p.nameEn || '')}</td>
        <td><button type="button" class="${selected ? '' : 'primary'}" data-part="${escapeAttr(p.id)}">${selected ? 'Dodano' : 'Dodaj'}</button></td>
      </tr>`;
    }).join('');
    els.partsTable.querySelectorAll('button[data-part]').forEach(btn => btn.addEventListener('click', () => addPart(btn.dataset.part)));
  }

  function addPart(partId) {
    const part = state.parts.find(p => p.id === partId);
    if (!part) return;
    const current = state.selectedParts.get(partId) || {part, qty: 0};
    current.qty += 1;
    state.selectedParts.set(partId, current);
    renderBasket();
    renderParts();
    saveDraft();
  }

  function renderBasket() {
    const items = [...state.selectedParts.values()];
    els.basketCount.textContent = String(items.reduce((n, x) => n + x.qty, 0));
    els.goData.disabled = items.length === 0;
    els.clearBasket.disabled = items.length === 0;
    if (!items.length) {
      els.basketItems.className = 'basket-empty';
      els.basketItems.innerHTML = 'Brak wybranych części.';
    } else {
      els.basketItems.className = '';
      els.basketItems.innerHTML = items.map(({part, qty}) => `<div class="basket-item">
        <div><strong>poz. ${escapeHtml(part.position || '-')} • ${escapeHtml(part.partIndex || '')}</strong><span>${escapeHtml(part.namePl || part.nameEn || '')}</span></div>
        <div class="qty">
          <button type="button" data-dec="${escapeAttr(part.id)}">−</button>
          <input value="${qty}" inputmode="numeric" data-qty="${escapeAttr(part.id)}" />
          <button type="button" data-inc="${escapeAttr(part.id)}">+</button>
          <button class="remove" type="button" data-remove="${escapeAttr(part.id)}">×</button>
        </div>
      </div>`).join('');
      els.basketItems.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.inc, 1)));
      els.basketItems.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.dec, -1)));
      els.basketItems.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removePart(b.dataset.remove)));
      els.basketItems.querySelectorAll('[data-qty]').forEach(inp => inp.addEventListener('change', () => setQty(inp.dataset.qty, inp.value)));
    }
    updateProgress();
    updateCanProceed();
  }

  function changeQty(id, delta) {
    const item = state.selectedParts.get(id); if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.selectedParts.delete(id);
    renderBasket(); renderParts(); saveDraft();
  }
  function setQty(id, value) {
    const item = state.selectedParts.get(id); if (!item) return;
    const qty = Math.max(0, parseInt(value, 10) || 0);
    if (!qty) state.selectedParts.delete(id); else item.qty = qty;
    renderBasket(); renderParts(); saveDraft();
  }
  function removePart(id) { state.selectedParts.delete(id); renderBasket(); renderParts(); saveDraft(); }

  function renderViewer(withLoading=false) {
    const drawing = state.selectedDrawing;
    const row = drawing ? state.driveByDrawingId.get(String(drawing.id)) : null;
    els.openPdf.classList.add('hidden');
    els.openPdf.href = '#';
    if (!drawing || !row || !row.viewerUrl) {
      els.viewer.className = 'viewer empty';
      els.viewer.innerHTML = '<div>Brak podpiętego PDF z Drive dla tego urządzenia.</div>';
      return;
    }
    if (withLoading) {
      els.viewer.className = 'viewer loading';
      els.viewer.innerHTML = '<div>Wczytuję rysunek PDF z Drive…</div>';
      window.setTimeout(() => renderViewer(false), 450);
      return;
    }
    els.openPdf.href = row.openUrl || row.viewerUrl;
    els.openPdf.classList.remove('hidden');
    els.viewer.className = 'viewer';
    els.viewer.innerHTML = `<iframe src="${escapeAttr(row.viewerUrl)}" title="${escapeAttr(drawing.title || 'Rysunek PDF')}"></iframe>`;
  }

  function goStep(step) {
    if (step > 1 && !state.selectedDevice) return;
    if (step > 3 && (!state.selectedParts.size || !formIsValid())) return;
    state.step = step;
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    $('stage' + step).classList.add('active');
    document.querySelectorAll('.step').forEach(btn => {
      const n = Number(btn.dataset.step);
      btn.classList.toggle('active', n === step);
      btn.classList.toggle('done', n < step);
      btn.disabled = !canOpenStep(n);
    });
    if (step === 4) generateMail();
    updateProgress();
    if (step === 2) renderViewer(false);
    saveDraft();
  }

  function canOpenStep(n) {
    if (n === 1) return true;
    if (n === 2) return Boolean(state.selectedDevice);
    if (n === 3) return Boolean(state.selectedDevice && state.selectedParts.size);
    if (n === 4) return Boolean(state.selectedDevice && state.selectedParts.size && formIsValid());
    return false;
  }

  function updateCanProceed() {
    document.querySelectorAll('.step').forEach(btn => { btn.disabled = !canOpenStep(Number(btn.dataset.step)); });
    if (state.step === 3 && formIsValid() && state.selectedParts.size) {
      generateMail();
    }
  }

  function updateProgress() {
    const flags = [
      Boolean(state.selectedDevice), Boolean(state.selectedDrawing), Boolean(state.selectedParts.size), formIsValid(), canOpenStep(4)
    ];
    progressIds.forEach((id, i) => {
      const el = $(id); if (!el) return;
      el.classList.toggle('done', flags[i]);
      el.classList.toggle('active', i + 1 === state.step);
    });
  }

  function applySameAsInvoice() {
    const f = new FormData(els.customerForm);
    const fields = els.customerForm.elements;
    if (els.sameAsInvoice.checked) {
      fields.shipName.value = f.get('invoiceName') || '';
      fields.shipStreet.value = f.get('invoiceStreet') || '';
      fields.shipZip.value = f.get('invoiceZip') || '';
      fields.shipCity.value = f.get('invoiceCity') || '';
      fields.shipPhone.value = f.get('contactPhone') || '';
    }
    saveDraft(); updateCanProceed();
  }

  function formIsValid() {
    if (!els.customerForm) return false;
    return [...els.customerForm.querySelectorAll('[required]')].every(el => String(el.value || '').trim());
  }

  function generateMail() {
    if (!state.selectedDevice) return;
    const d = state.selectedDevice, drawing = state.selectedDrawing;
    const f = Object.fromEntries(new FormData(els.customerForm).entries());
    const parts = [...state.selectedParts.values()];
    const subject = `Zapytanie o części zamienne — ${d.deviceIndex || ''}`.trim();
    const partLines = parts.map((x, i) => `${i + 1}. ${x.part.partIndex || 'brak indeksu'} — poz. ${x.part.position || '-'} — ${x.part.namePl || x.part.nameEn || ''} — ilość: ${x.qty} szt.`).join('\n');
    const body = `Dzień dobry,

Mam urządzenie ${d.deviceIndex || ''}${d.title ? ` — ${d.title}` : ''}.
Potrzebuję części z rysunku technicznego PDF:
${drawing ? `${drawing.fileName || drawing.title || ''}` : ''}

Lista części:
${partLines}

Proszę o potwierdzenie możliwości zamówienia, wycenę oraz informację o dalszych krokach.

Dane kontaktowe:
${f.contactName || ''}
Email: ${f.contactEmail || ''}
Telefon: ${f.contactPhone || ''}

Dane do faktury:
${f.invoiceName || ''}
NIP: ${f.invoiceNip || '-'}
${f.invoiceStreet || ''}
${f.invoiceZip || ''} ${f.invoiceCity || ''}

Dane do wysyłki:
${f.shipName || ''}
${f.shipStreet || ''}
${f.shipZip || ''} ${f.shipCity || ''}
Telefon dla kuriera: ${f.shipPhone || ''}

Uwagi:
${f.notes || '-'}

Pozdrawiam`;
    els.mailTo.value = CONFIG.recipientEmail || 'service@yato.pl';
    els.mailSubject.value = subject;
    els.mailBody.value = body;
  }

  function saveDraft() {
    if (!CONFIG.autosave) return;
    try {
      const draft = {
        deviceIndex: state.selectedDevice && state.selectedDevice.deviceIndex,
        drawingId: state.selectedDrawing && state.selectedDrawing.id,
        parts: [...state.selectedParts.entries()].map(([id, item]) => [id, item.qty]),
        step: state.step,
        form: Object.fromEntries(new FormData(els.customerForm).entries()),
        sameAsInvoice: els.sameAsInvoice.checked
      };
      localStorage.setItem('pgw-v41-draft', JSON.stringify(draft));
    } catch(e) {}
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem('pgw-v41-draft'); if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.form) for (const [k,v] of Object.entries(draft.form)) if (els.customerForm.elements[k]) els.customerForm.elements[k].value = v;
      els.sameAsInvoice.checked = Boolean(draft.sameAsInvoice);
      if (draft.deviceIndex) {
        const device = state.devices.find(d => norm(d.deviceIndex) === norm(draft.deviceIndex));
        if (device) {
          state.selectedDevice = device;
          state.selectedDrawing = state.drawings.find(d => String(d.id) === String(draft.drawingId)) || state.drawings.find(d => norm(d.deviceIndex) === norm(device.deviceIndex));
          for (const [id, qty] of draft.parts || []) {
            const part = state.parts.find(p => p.id === id);
            if (part) state.selectedParts.set(id, {part, qty: Number(qty) || 1});
          }
          els.deviceSearch.value = device.deviceIndex || '';
          renderSelectedDevice(); renderParts(); renderBasket(); renderViewer(false); renderDeviceResults(els.deviceSearch.value);
          goStep(Math.min(Math.max(Number(draft.step) || 1, 1), 4));
        }
      }
    } catch(e) {}
  }

  function resetAll() {
    if (!confirm('Wyczyścić formularz i zacząć od nowa?')) return;
    localStorage.removeItem('pgw-v41-draft');
    state.selectedDevice = null; state.selectedDrawing = null; state.selectedParts.clear();
    els.customerForm.reset(); els.deviceSearch.value = ''; els.partsSearch.value = '';
    renderDeviceResults(''); renderBasket(); renderViewer(false); goStep(1);
  }

  function resolveDrive(drawing) {
    const keys = drawingKeys(drawing);
    for (const key of keys) if (state.driveByKey.has(key)) return state.driveByKey.get(key);
    return null;
  }
  function drawingKeys(d) { return unique([d.deviceIndex, d.fileName, d.title, d.name, d.path, d.originalPath].map(normKey).filter(Boolean).flatMap(k => [k, stripExt(k)])); }
  function looksLikeHeaderPart(p) {
    const pi = norm(p.partIndex || '');
    const dev = norm(p.deviceIndex || '');
    const name = norm(p.namePl || p.nameEn || '');
    return pi === dev || (pi && dev && pi.replace(/-/g,'') === dev.replace(/-/g,'') && /kosiarka|pilarka|szlifierka|polerka|agregat|urzadzenie|urządzenie/.test(name));
  }
  function isPdf(x) {
    const text = [x.type, x.mimeType, x.fileName, x.title, x.name, x.path, x.originalPath, x.url, x.viewerUrl, x.openUrl].filter(Boolean).join(' ').toLowerCase();
    return text.includes('application/pdf') || /\.pdf(\?|#|$|\s)/i.test(text) || String(x.type || '').toLowerCase() === 'pdf';
  }
  function arr(x) { return Array.isArray(x) ? x : (x && Array.isArray(x.items) ? x.items : []); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[_\s]+/g,' ').trim(); }
  function normKey(s) { return norm(String(s || '').replace(/\\/g,'/').split('/').pop()).replace(/\s+/g,'-'); }
  function stripExt(s) { return String(s || '').replace(/\.(pdf|jpg|jpeg|png|webp|docx?|xlsx?)$/i,''); }
  function unique(a) { return [...new Set(a.filter(Boolean))]; }
  function fmt(n) { return new Intl.NumberFormat('pl-PL').format(Number(n) || 0); }
  function setStatus(text, mode='') { els.loadStatus.textContent = text; els.loadStatus.className = `status-pill ${mode}`.trim(); }
  function debounce(fn, wait=120) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
  function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function escapeAttr(s) { return escapeHtml(s).replace(/`/g,'&#96;'); }
  async function copyText(text, ok) {
    try { await navigator.clipboard.writeText(text); els.copyStatus.textContent = ok; }
    catch(e) { els.copyStatus.textContent = 'Nie udało się skopiować automatycznie — zaznacz tekst ręcznie.'; }
  }
})();
