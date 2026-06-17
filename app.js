(() => {
  'use strict';
  const CONFIG = window.PGW_CONFIG || {};
  const DRAFT_KEY = 'pgw-v47-draft';
  const PART_ROW_LIMIT = Number(CONFIG.partRowLimit || 80);
  const $ = (id) => document.getElementById(id);
  const els = {
    loadStatus: $('loadStatus'), statDevices: $('statDevices'), statDrawings: $('statDrawings'), statParts: $('statParts'),
    deviceSearch: $('deviceSearch'), deviceResults: $('deviceResults'), deviceMeta: $('deviceMeta'), quickExamples: $('quickExamples'),
    selectedDeviceBox: $('selectedDeviceBox'), partsSearch: $('partsSearch'), partsTable: $('partsTable'), partMeta: $('partMeta'),
    viewer: $('viewer'), openPdf: $('openPdf'), basketItems: $('basketItems'), basketCount: $('basketCount'), goData: $('goData'), goDataInline: $('goDataInline'), clearBasket: $('clearBasket'),
    customerForm: $('customerForm'), sameAsInvoice: $('sameAsInvoice'), wantInvoice: $('wantInvoice'), wantShipping: $('wantShipping'), invoiceFieldset: $('invoiceFieldset'), shippingFieldset: $('shippingFieldset'), mailTo: $('mailTo'), mailSubject: $('mailSubject'), mailBody: $('mailBody'),
    copyMail: $('copyMail'), copySubject: $('copySubject'), copyAll: $('copyAll'), copyStatus: $('copyStatus'), startOver: $('startOver'),
    backDevice: $('backDevice'), backParts: $('backParts'), backData: $('backData'), goMail: $('goMail'), contextTitle: $('contextTitle'), contextBody: $('contextBody'),
    lookupNip: $('lookupNip'), lookupStatus: $('lookupStatus'), zipStatus: $('zipStatus'), shipZipStatus: $('shipZipStatus'), formHint: $('formHint'), manualPartsBox: $('manualPartsBox'), manualPartsFieldset: $('manualPartsFieldset'), goManualData: $('goManualData'), draftMailPreview: $('draftMailPreview'), showMoreParts: $('showMoreParts'), mobileSummaryBar: $('mobileSummaryBar'), mobileSummaryText: $('mobileSummaryText'), mobileGoData: $('mobileGoData'), focusParts: $('focusParts'), focusPdf: $('focusPdf'), contactQuality: $('contactQuality'), invoiceQuality: $('invoiceQuality'), shippingQuality: $('shippingQuality'), finalChecklist: $('finalChecklist')
  };
  const progressIds = ['pDevice','pDrawing','pParts','pData','pMail'];

  const state = {
    devices: [], drawings: [], parts: [], driveMap: [],
    drawingById: new Map(), partsByDrawing: new Map(), driveByDrawingId: new Map(), driveByKey: new Map(),
    selectedDevice: null, selectedDrawing: null, selectedParts: new Map(), manualMode: false, step: 1, formDirty: false,
    postalCodes: new Map(), partVisibleLimit: PART_ROW_LIMIT
  };

  const POSTAL_FALLBACK = {
    '00-001': 'Warszawa', '00-002': 'Warszawa', '01-001': 'Warszawa',
    '30-001': 'Kraków', '31-357': 'Kraków', '50-001': 'Wrocław',
    '60-001': 'Poznań', '80-001': 'Gdańsk', '90-001': 'Łódź',
    '40-001': 'Katowice', '43-300': 'Bielsko-Biała', '20-001': 'Lublin'
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
      await loadPostalCodes();
      normalizeData();
      buildIndexes();
      bindEvents();
      updateOptionalSections();
      renderStats();
      renderExamples();
      renderContext();
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

  async function loadPostalCodes() {
    const source = CONFIG.postalCodesUrl || 'data/postal-codes.json';
    let rows = [];
    try {
      const res = await fetch(source, {cache:'no-store'});
      if (res.ok) rows = await res.json();
    } catch(e) {}
    const push = (zip, city) => {
      zip = normalizeZip(zip); city = String(city || '').trim();
      if (zip && city && !state.postalCodes.has(zip)) state.postalCodes.set(zip, city);
    };
    if (Array.isArray(rows)) rows.forEach(r => push(r.zip || r.kod || r.code, r.city || r.miejscowosc || r.miejscowość || r.name));
    else if (rows && typeof rows === 'object') Object.entries(rows).forEach(([zip, city]) => push(zip, city));
    Object.entries(POSTAL_FALLBACK).forEach(([zip, city]) => push(zip, city));
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
    els.partsSearch.addEventListener('input', debounce(() => { state.partVisibleLimit = PART_ROW_LIMIT; renderParts(); }, 90));
    els.goData.addEventListener('click', () => goStep(3));
    if (els.goDataInline) els.goDataInline.addEventListener('click', () => goStep(3));
    if (els.backDevice) els.backDevice.addEventListener('click', () => goStep(1));
    if (els.backParts) els.backParts.addEventListener('click', () => goStep(2));
    if (els.backData) els.backData.addEventListener('click', () => goStep(3));
    if (els.goMail) els.goMail.addEventListener('click', () => goStep(4));
    if (els.goManualData) els.goManualData.addEventListener('click', () => goStep(3));
    els.clearBasket.addEventListener('click', () => { state.selectedParts.clear(); renderBasket(); saveDraft(); });
    if (els.showMoreParts) els.showMoreParts.addEventListener('click', () => { state.partVisibleLimit += PART_ROW_LIMIT; renderParts(); });
    if (els.mobileGoData) els.mobileGoData.addEventListener('click', () => goStep(state.step < 3 ? 3 : 4));
    if (els.focusParts) els.focusParts.addEventListener('click', () => document.querySelector('#stage2')?.scrollIntoView({behavior:'smooth', block:'start'}));
    if (els.focusPdf) els.focusPdf.addEventListener('click', () => document.querySelector('.viewer-card')?.scrollIntoView({behavior:'smooth', block:'start'}));
    document.querySelectorAll('.step').forEach(btn => btn.addEventListener('click', () => goStep(Number(btn.dataset.step))));
    if (els.sameAsInvoice) els.sameAsInvoice.addEventListener('change', applySameAsInvoice);
    if (els.wantInvoice) els.wantInvoice.addEventListener('change', () => { updateOptionalSections(); saveDraft(); updateCanProceed(); });
    if (els.wantShipping) els.wantShipping.addEventListener('change', () => { updateOptionalSections(); saveDraft(); updateCanProceed(); });
    if (els.lookupNip) els.lookupNip.addEventListener('click', lookupCompanyByNip);
    const fields = els.customerForm.elements;
    if (fields.invoiceNip) fields.invoiceNip.addEventListener('input', () => { updateLookupHint(); });
    if (fields.invoiceZip) fields.invoiceZip.addEventListener('input', debounce(() => autofillCityFromZip('invoiceZip','invoiceCity', els.zipStatus), 120));
    if (fields.shipZip) fields.shipZip.addEventListener('input', debounce(() => autofillCityFromZip('shipZip','shipCity', els.shipZipStatus), 120));
    els.customerForm.addEventListener('input', () => { state.formDirty = true; saveDraft(); updateCanProceed(); });
    els.customerForm.addEventListener('change', () => { state.formDirty = true; saveDraft(); updateCanProceed(); });
    els.copyMail.addEventListener('click', () => copyText(els.mailBody.value, 'Skopiowano treść maila.'));
    els.copySubject.addEventListener('click', () => copyText(els.mailSubject.value, 'Skopiowano temat.'));
    if (els.copyAll) els.copyAll.addEventListener('click', () => copyText(`Do: ${els.mailTo.value}\nTemat: ${els.mailSubject.value}\n\n${els.mailBody.value}`, 'Skopiowano komplet: adresat, temat i treść.'));
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
      const typed = String(els.deviceSearch.value || '').trim();
      els.deviceResults.innerHTML = `<div class="empty-state manual-empty"><strong>Brak wyniku w aktualnej bazie.</strong><p>Spróbuj wpisać sam numer modelu, bez myślnika, albo sprawdź indeks z tabliczki znamionowej.</p><p>Jeżeli modelu nadal nie ma, klient może przejść dalej i opisać część ręcznie.</p><button class="primary" type="button" id="startManualRequest">Nie znalazłem urządzenia — napisz zapytanie ręczne</button></div>`;
      const btn = $('startManualRequest');
      if (btn) btn.addEventListener('click', () => startManualRequest(typed));
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

  function startManualRequest(typed) {
    const clean = String(typed || '').trim();
    state.manualMode = true;
    state.partVisibleLimit = PART_ROW_LIMIT;
    state.selectedDevice = { deviceIndex: clean || 'nie podano', title: 'urządzenie spoza aktualnej bazy' };
    state.selectedDrawing = null;
    state.selectedParts.clear();
    renderSelectedDevice();
    renderParts();
    renderBasket();
    renderViewer(false);
    updateOptionalSections();
    goStep(2);
    saveDraft();
  }

  function selectDevice(deviceIndex) {
    const device = state.devices.find(d => norm(d.deviceIndex) === norm(deviceIndex));
    if (!device) return;
    const drawings = state.drawings.filter(d => norm(d.deviceIndex) === norm(device.deviceIndex));
    const drawing = drawings.sort((a,b) => (state.partsByDrawing.get(String(b.id)) || []).length - (state.partsByDrawing.get(String(a.id)) || []).length)[0];
    state.manualMode = false;
    state.partVisibleLimit = PART_ROW_LIMIT;
    if (els.partsSearch) els.partsSearch.value = '';
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
    if (!d) { els.selectedDeviceBox.innerHTML = ''; return; }
    if (state.manualMode) {
      els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex || 'Urządzenie spoza bazy')}</strong><span>Tryb ręczny: klient opisuje potrzebną część, a serwis dopasuje ją po mailu.</span>`;
      return;
    }
    if (!drawing) { els.selectedDeviceBox.innerHTML = ''; return; }
    const count = (state.partsByDrawing.get(String(drawing.id)) || []).length;
    els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex)} — ${escapeHtml(d.title || drawing.title || '')}</strong><span>Rysunek: ${escapeHtml(drawing.fileName || drawing.title || '')} • ${fmt(count)} części</span>`;
  }

  function renderParts() {
    if (els.manualPartsBox) els.manualPartsBox.classList.toggle('hidden', !state.manualMode);
    if (state.manualMode) {
      if (els.showMoreParts) els.showMoreParts.classList.add('hidden');
      if (els.partMeta) els.partMeta.innerHTML = '<strong>Tryb ręczny.</strong> Nie pokazujemy listy części, bo urządzenia nie ma jeszcze w bazie. Klient przechodzi dalej i opisuje potrzebną część tekstowo.';
      if (els.partsTable) els.partsTable.innerHTML = `<tr><td colspan="4">Brak listy części dla urządzenia spoza aktualnej bazy.</td></tr>`;
      if (els.goDataInline) { els.goDataInline.disabled = false; els.goDataInline.textContent = 'Przejdź do danych i opisz część'; }
      return;
    } else if (els.goDataInline) {
      els.goDataInline.textContent = 'Przejdź do danych';
    }
    const drawing = state.selectedDrawing;
    if (!drawing) { els.partsTable.innerHTML = ''; if (els.partMeta) els.partMeta.textContent = ''; if (els.showMoreParts) els.showMoreParts.classList.add('hidden'); return; }
    const q = norm(els.partsSearch.value);
    const tokens = q.split(/\s+/).filter(Boolean);
    let parts = (state.partsByDrawing.get(String(drawing.id)) || []).slice();
    const total = parts.length;
    if (tokens.length) parts = parts.filter(p => tokens.every(t => p.__search.includes(t) || norm(String(p.partIndex).replace(/[-\s]/g,'')).includes(t.replace(/[-\s]/g,''))));
    parts.sort((a,b) => Number(a.position || 9999) - Number(b.position || 9999) || String(a.partIndex).localeCompare(String(b.partIndex)));
    const filtered = parts.length;
    const visibleLimit = tokens.length ? Math.max(state.partVisibleLimit, PART_ROW_LIMIT) : state.partVisibleLimit;
    const visible = parts.slice(0, visibleLimit);
    if (els.partMeta) {
      const limitNote = visible.length < filtered ? ` Pokazuję pierwsze ${fmt(visible.length)} — możesz zawęzić wyszukiwanie albo kliknąć „Pokaż więcej części”.` : '';
      els.partMeta.innerHTML = tokens.length
        ? `Znaleziono <strong>${fmt(filtered)}</strong> z ${fmt(total)} części.${limitNote}`
        : `Ten rysunek ma <strong>${fmt(total)}</strong> części. Lista jest dawkowana, żeby klient się nie zakopał.${limitNote}`;
    }
    if (els.showMoreParts) {
      const more = visible.length < filtered;
      els.showMoreParts.classList.toggle('hidden', !more);
      els.showMoreParts.textContent = `Pokaż więcej części (${fmt(filtered - visible.length)} pozostało)`;
    }
    if (!visible.length) {
      els.partsTable.innerHTML = `<tr><td colspan="4">Brak części dla wpisanej frazy.</td></tr>`;
      return;
    }
    els.partsTable.innerHTML = visible.map(p => {
      const selected = state.selectedParts.has(p.id);
      return `<tr class="${selected ? 'selected-row' : ''}">
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
    flashBasket();
    renderParts();
    saveDraft();
  }

  function renderBasket() {
    const items = [...state.selectedParts.values()];
    els.basketCount.textContent = String(items.reduce((n, x) => n + x.qty, 0));
    const canData = state.manualMode || items.length > 0;
    els.goData.disabled = !canData;
    if (els.goDataInline) els.goDataInline.disabled = !canData;
    els.clearBasket.disabled = items.length === 0;
    if (!items.length && state.manualMode) {
      els.basketItems.className = 'basket-empty manual-basket';
      els.basketItems.innerHTML = 'Tryb ręczny: klient opisze potrzebną część w kolejnym kroku.';
    } else if (!items.length) {
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
    updateMobileSummary();
  }

  function updateMobileSummary() {
    if (!els.mobileSummaryBar || !els.mobileSummaryText || !els.mobileGoData) return;
    const qty = [...state.selectedParts.values()].reduce((n, x) => n + x.qty, 0);
    if (state.manualMode) {
      els.mobileSummaryText.textContent = 'Tryb ręczny — opisz część';
      els.mobileGoData.disabled = !state.selectedDevice;
      els.mobileGoData.textContent = state.step >= 3 ? 'Mail' : 'Dane';
      return;
    }
    els.mobileSummaryText.textContent = qty ? `Wybrane części: ${qty}` : 'Brak wybranych części';
    const canGo = state.step >= 3 ? formIsValid() : qty > 0;
    els.mobileGoData.disabled = !canGo;
    els.mobileGoData.textContent = state.step >= 3 ? 'Mail' : 'Dane';
  }

  function flashBasket() {
    const card = document.querySelector('.basket-card');
    if (!card) return;
    card.classList.remove('flash');
    void card.offsetWidth;
    card.classList.add('flash');
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
    if (state.manualMode) {
      els.openPdf.classList.add('hidden');
      els.openPdf.href = '#';
      els.viewer.className = 'viewer empty manual-viewer';
      els.viewer.innerHTML = '<div><strong>Brak rysunku PDF w aktualnej bazie.</strong><br><span>Klient może opisać część ręcznie i dołączyć zdjęcia do maila.</span></div>';
      return;
    }
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
      els.viewer.innerHTML = '<div><strong>Wczytuję rysunek PDF z Drive…</strong><br><span>Lista części jest już przygotowywana w tle.</span></div>';
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
    renderContext();
    if (step === 2) renderViewer(false);
    if (step !== 1) document.querySelector('.workspace')?.scrollIntoView({behavior:'smooth', block:'start'});
    saveDraft();
    updateMobileSummary();
  }

  function hasSelectionForRequest() {
    return Boolean(state.manualMode || state.selectedParts.size);
  }

  function canOpenStep(n) {
    if (n === 1) return true;
    if (n === 2) return Boolean(state.selectedDevice);
    if (n === 3) return Boolean(state.selectedDevice && hasSelectionForRequest());
    if (n === 4) return Boolean(state.selectedDevice && hasSelectionForRequest() && formIsValid());
    return false;
  }

  function updateCanProceed() {
    renderValidationPanels();
    document.querySelectorAll('.step').forEach(btn => { btn.disabled = !canOpenStep(Number(btn.dataset.step)); });
    const canMail = Boolean(state.selectedDevice && hasSelectionForRequest() && formIsValid());
    if (els.goMail) {
      els.goMail.disabled = !canMail;
      els.goMail.textContent = canMail ? 'Przejdź do gotowego maila' : 'Podaj kontakt, aby przejść dalej';
    }
    if (els.formHint) {
      els.formHint.textContent = canMail ? 'Wszystko gotowe — możesz przejść do gotowego maila. Faktura i wysyłka są opcjonalne.' : missingRequiredText();
      els.formHint.classList.toggle('ok', canMail);
      els.formHint.classList.toggle('warn', !canMail);
    }
    if (els.goDataInline) els.goDataInline.disabled = !hasSelectionForRequest();
    if (state.step >= 3 && state.selectedDevice && hasSelectionForRequest()) {
      generateMail();
    }
    updateMobileSummary();
  }

  function updateProgress() {
    const flags = [
      Boolean(state.selectedDevice), Boolean(state.selectedDrawing || state.manualMode), hasSelectionForRequest(), formIsValid(), canOpenStep(4)
    ];
    progressIds.forEach((id, i) => {
      const el = $(id); if (!el) return;
      el.classList.toggle('done', flags[i]);
      el.classList.toggle('active', i + 1 === state.step);
    });
  }

  function renderContext() {
    if (!els.contextTitle || !els.contextBody) return;
    const contexts = {
      1: ['Wybierz urządzenie', 'Klient widzi wyszukiwarkę modeli. Gdy modelu nie ma w bazie, może przejść do zapytania ręcznego.'],
      2: ['Wybierz części z rysunku', 'PDF zostaje po prawej, a lista po lewej pokazuje części dla wybranego modelu. W trybie ręcznym klient opisuje część tekstowo.'],
      3: ['Uzupełnij minimum kontaktu', 'Wystarczy imię/nazwa oraz poprawny email albo telefon. Faktura i wysyłka są opcjonalne, ale strona podpowie, gdy coś wygląda podejrzanie.'],
      4: ['Sprawdź i skopiuj mail', 'Na końcu klient widzi checklistę, temat i treść wiadomości do service@yato.pl.']
    };
    const [title, body] = contexts[state.step] || contexts[1];
    els.contextTitle.textContent = title;
    els.contextBody.textContent = body;
  }

  function updateOptionalSections() {
    const fields = els.customerForm.elements;
    if (els.manualPartsFieldset) els.manualPartsFieldset.classList.toggle('hidden', !state.manualMode);
    const invoiceOn = Boolean(els.wantInvoice && els.wantInvoice.checked);
    const shippingOn = Boolean(els.wantShipping && els.wantShipping.checked);
    if (els.invoiceFieldset) els.invoiceFieldset.classList.toggle('inactive', !invoiceOn);
    if (els.shippingFieldset) els.shippingFieldset.classList.toggle('inactive', !shippingOn);
    setSectionDisabled(els.invoiceFieldset, !invoiceOn, ['wantInvoice']);
    setSectionDisabled(els.shippingFieldset, !shippingOn, ['wantShipping']);
    if (els.sameAsInvoice) els.sameAsInvoice.disabled = !shippingOn || !invoiceOn;
    if (!shippingOn && els.sameAsInvoice) els.sameAsInvoice.checked = false;
    if (fields.invoiceZip && invoiceOn) autofillCityFromZip('invoiceZip','invoiceCity', els.zipStatus, true);
    if (fields.shipZip && shippingOn) autofillCityFromZip('shipZip','shipCity', els.shipZipStatus, true);
  }

  function setSectionDisabled(section, disabled, keepNames=[]) {
    if (!section) return;
    section.querySelectorAll('input, textarea, button, select').forEach(el => {
      if (keepNames.includes(el.id) || keepNames.includes(el.name)) return;
      el.disabled = disabled;
    });
  }

  function applySameAsInvoice() {
    const fields = els.customerForm.elements;
    if (els.sameAsInvoice && els.sameAsInvoice.checked) {
      if (els.wantShipping) els.wantShipping.checked = true;
      updateOptionalSections();
      fields.shipName.value = fields.invoiceName?.value || fields.contactName?.value || '';
      fields.shipStreet.value = fields.invoiceStreet?.value || '';
      fields.shipZip.value = fields.invoiceZip?.value || '';
      fields.shipCity.value = fields.invoiceCity?.value || '';
      fields.shipPhone.value = fields.contactPhone?.value || '';
    }
    autofillCityFromZip('shipZip','shipCity', els.shipZipStatus, true);
    saveDraft(); updateCanProceed();
  }

  function missingRequiredText() {
    if (!hasSelectionForRequest()) return 'Najpierw dodaj część do zapytania albo wybierz tryb ręczny.';
    const missing = getMissingFields().slice(0, 5);
    return missing.length ? `Brakuje danych: ${missing.join(', ')}.` : 'Kontakt jest wystarczający. Fakturę i wysyłkę można dopisać teraz albo ustalić później.';
  }

  function getMissingFields() {
    const fields = els.customerForm.elements;
    const missing = [];
    const email = val(fields.contactEmail);
    const phone = val(fields.contactPhone);
    if (!val(fields.contactName)) missing.push('imię i nazwisko / firma kontaktowa');
    if (!hasUsableContact(email, phone)) missing.push('poprawny email albo telefon');
    if (state.manualMode && !val(fields.manualPartsDescription)) missing.push('opis potrzebnej części');
    if (els.wantInvoice && els.wantInvoice.checked) {
      if (!val(fields.invoiceName)) missing.push('nazwa do faktury');
      if (!val(fields.invoiceStreet)) missing.push('adres do faktury');
      if (!validZipOrEmpty(fields.invoiceZip?.value, false)) missing.push('kod pocztowy faktury');
      if (!val(fields.invoiceCity)) missing.push('miasto faktury');
    }
    if (els.wantShipping && els.wantShipping.checked) {
      if (!val(fields.shipName)) missing.push('odbiorca wysyłki');
      if (!val(fields.shipStreet)) missing.push('adres wysyłki');
      if (!validZipOrEmpty(fields.shipZip?.value, false)) missing.push('kod pocztowy wysyłki');
      if (!val(fields.shipCity)) missing.push('miasto wysyłki');
      if (!validPhoneOrEmpty(fields.shipPhone?.value, false)) missing.push('telefon dla kuriera');
    }
    return missing;
  }

  function formIsValid() {
    if (!els.customerForm) return false;
    return getMissingFields().length === 0;
  }

  function hasUsableContact(email, phone) {
    return isValidEmail(email) || isValidPhone(phone);
  }

  function isValidEmail(value) {
    const v = String(value || '').trim();
    if (!v) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function isValidPhone(value) {
    const digits = String(value || '').replace(/\D/g,'');
    return digits.length >= 7 && digits.length <= 15;
  }

  function validPhoneOrEmpty(value, allowEmpty=true) {
    const v = String(value || '').trim();
    if (!v) return allowEmpty;
    return isValidPhone(v);
  }

  function validZipOrEmpty(value, allowEmpty=true) {
    const v = String(value || '').trim();
    if (!v) return allowEmpty;
    return /^\d{2}-\d{3}$/.test(normalizeZip(v));
  }

  function isValidNip(value) {
    const nip = cleanNip(value);
    if (nip.length !== 10) return false;
    const w = [6,5,7,2,3,4,5,6,7];
    const sum = w.reduce((acc, weight, i) => acc + Number(nip[i]) * weight, 0);
    return sum % 11 === Number(nip[9]);
  }

  function renderValidationPanels() {
    if (!els.customerForm) return;
    const fields = els.customerForm.elements;
    const email = val(fields.contactEmail), phone = val(fields.contactPhone);
    if (els.contactQuality) {
      const items = [];
      if (!val(fields.contactName)) items.push(['warn','Brakuje osoby / nazwy kontaktowej']);
      else items.push(['ok','Kontakt nazwany']);
      if (hasUsableContact(email, phone)) items.push(['ok', email && isValidEmail(email) ? 'Email wygląda poprawnie' : 'Telefon wygląda poprawnie']);
      else items.push(['warn','Podaj poprawny email albo telefon']);
      els.contactQuality.innerHTML = items.map(([m,t]) => `<span class="quality ${m}">${escapeHtml(t)}</span>`).join('');
    }
    if (els.invoiceQuality) {
      if (!els.wantInvoice || !els.wantInvoice.checked) {
        els.invoiceQuality.innerHTML = '<span class="quality neutral">Faktura opcjonalna — nie blokuje maila</span>';
      } else {
        const items = [];
        if (val(fields.invoiceNip)) items.push([isValidNip(fields.invoiceNip.value) ? 'ok' : 'warn', isValidNip(fields.invoiceNip.value) ? 'NIP wygląda poprawnie' : 'NIP wygląda podejrzanie']);
        if (validZipOrEmpty(fields.invoiceZip?.value, false)) items.push(['ok','Kod pocztowy faktury OK']);
        else items.push(['warn','Uzupełnij kod faktury w formacie 00-000']);
        els.invoiceQuality.innerHTML = items.map(([m,t]) => `<span class="quality ${m}">${escapeHtml(t)}</span>`).join('') || '<span class="quality warn">Uzupełnij dane do faktury albo odznacz tę sekcję</span>';
      }
    }
    if (els.shippingQuality) {
      if (!els.wantShipping || !els.wantShipping.checked) {
        els.shippingQuality.innerHTML = '<span class="quality neutral">Wysyłka opcjonalna — może być do ustalenia</span>';
      } else {
        const items = [];
        items.push([validZipOrEmpty(fields.shipZip?.value, false) ? 'ok' : 'warn', validZipOrEmpty(fields.shipZip?.value, false) ? 'Kod wysyłki OK' : 'Uzupełnij kod wysyłki w formacie 00-000']);
        items.push([validPhoneOrEmpty(fields.shipPhone?.value, false) ? 'ok' : 'warn', validPhoneOrEmpty(fields.shipPhone?.value, false) ? 'Telefon dla kuriera OK' : 'Telefon dla kuriera wygląda podejrzanie']);
        els.shippingQuality.innerHTML = items.map(([m,t]) => `<span class="quality ${m}">${escapeHtml(t)}</span>`).join('');
      }
    }
  }

  function renderFinalChecklist() {
    if (!els.finalChecklist || !state.selectedDevice) return;
    const f = Object.fromEntries(new FormData(els.customerForm).entries());
    const partsCount = [...state.selectedParts.values()].reduce((sum, x) => sum + (Number(x.qty) || 0), 0);
    const rows = [
      ['Urządzenie', state.selectedDevice.deviceIndex || 'model opisany ręcznie', 'ok'],
      ['Części', state.manualMode ? 'opis ręczny' : `${state.selectedParts.size} pozycji / ${partsCount} szt.`, hasSelectionForRequest() ? 'ok' : 'warn'],
      ['Kontakt', hasUsableContact(f.contactEmail, f.contactPhone) ? (f.contactEmail || f.contactPhone) : 'brak poprawnego emaila lub telefonu', hasUsableContact(f.contactEmail, f.contactPhone) ? 'ok' : 'warn'],
      ['Faktura', els.wantInvoice?.checked ? 'podano dane do faktury' : 'do ustalenia z serwisem', 'neutral'],
      ['Wysyłka', els.wantShipping?.checked ? 'podano adres wysyłki' : 'do ustalenia z serwisem', 'neutral']
    ];
    const warnings = getSoftWarnings(f);
    els.finalChecklist.innerHTML = `<div class="final-grid">${rows.map(([a,b,m]) => `<div class="final-item"><span>${escapeHtml(a)}</span><strong>${escapeHtml(b)}</strong><em class="${m}">${m === 'ok' ? 'OK' : m === 'warn' ? 'sprawdź' : 'opcjonalne'}</em></div>`).join('')}</div>${warnings.length ? `<div class="soft-warnings"><strong>Przed wysłaniem warto sprawdzić:</strong><ul>${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul></div>` : '<div class="soft-warnings ok"><strong>Mail wygląda kompletnie.</strong> Klient może skopiować temat i treść.</div>'}`;
  }

  function getSoftWarnings(f) {
    const out = [];
    if (f.contactEmail && !isValidEmail(f.contactEmail)) out.push('email wygląda nietypowo');
    if (f.contactPhone && !isValidPhone(f.contactPhone)) out.push('telefon wygląda nietypowo');
    if (els.wantInvoice?.checked && f.invoiceNip && !isValidNip(f.invoiceNip)) out.push('NIP wygląda podejrzanie');
    if (els.wantInvoice?.checked && f.invoiceZip && !validZipOrEmpty(f.invoiceZip, false)) out.push('kod pocztowy faktury ma zły format');
    if (els.wantShipping?.checked && f.shipZip && !validZipOrEmpty(f.shipZip, false)) out.push('kod pocztowy wysyłki ma zły format');
    if (!els.wantInvoice?.checked) out.push('dane do faktury nie zostały podane — serwis ustali je później');
    if (!els.wantShipping?.checked) out.push('adres wysyłki nie został podany — serwis ustali go później');
    return out;
  }

  function val(field) { return String(field?.value || '').trim(); }

  function generateMail() {
    if (!state.selectedDevice) return;
    const d = state.selectedDevice, drawing = state.selectedDrawing;
    const f = Object.fromEntries(new FormData(els.customerForm).entries());
    const parts = [...state.selectedParts.values()];
    const drive = drawing ? state.driveByDrawingId.get(String(drawing.id)) : null;
    const subject = state.manualMode
      ? `Zapytanie o części zamienne — model spoza bazy ${d.deviceIndex || ''}`.trim()
      : `Zapytanie o części zamienne — ${d.deviceIndex || ''}`.trim();
    const partLines = state.manualMode
      ? `Opis części / urządzenia:\n${f.manualPartsDescription || '[klient powinien opisać potrzebną część i dołączyć zdjęcia do maila]'}`
      : parts.map((x, i) => `${i + 1}. ${x.part.partIndex || 'brak indeksu'} — poz. ${x.part.position || '-'} — ${x.part.namePl || x.part.nameEn || ''} — ilość: ${x.qty} szt.`).join('\n');
    const drawingBlock = state.manualMode
      ? `Rysunek techniczny PDF: nie znaleziono urządzenia w aktualnej bazie strony.\nProszę o pomoc w identyfikacji części. Klient powinien dołączyć zdjęcie tabliczki znamionowej i potrzebnej części.`
      : `Rysunek techniczny PDF:\n${drawing ? `${drawing.fileName || drawing.title || ''}` : ''}\n${drive && drive.openUrl ? `Link do rysunku: ${drive.openUrl}` : ''}`;
    const body = `Dzień dobry,

Mam urządzenie ${d.deviceIndex || '[brak indeksu]'}${d.title ? ` — ${d.title}` : ''}.
${f.serialNumber ? `Numer seryjny urządzenia: ${f.serialNumber}\n` : ''}${drawingBlock}

Lista części:
${partLines}

Proszę o potwierdzenie możliwości zamówienia, wycenę oraz informację o dalszych krokach.

Dane kontaktowe:
${f.contactName || '[uzupełnij imię/nazwę kontaktową]'}
Email: ${f.contactEmail || '-'}
Telefon: ${f.contactPhone || '-'}

${invoiceMailBlock(f)}

${shippingMailBlock(f)}

Uwagi:
${f.notes || '-'}

Pozdrawiam`;
    els.mailTo.value = CONFIG.recipientEmail || 'service@yato.pl';
    els.mailSubject.value = subject;
    els.mailBody.value = body;
    if (els.draftMailPreview) els.draftMailPreview.value = body;
    renderFinalChecklist();
  }


  function invoiceMailBlock(f) {
    if (!els.wantInvoice || !els.wantInvoice.checked) return 'Faktura: nie podano danych / do ustalenia z serwisem.';
    return `Dane do faktury:
${f.invoiceName || ''}
NIP: ${f.invoiceNip || '-'}
${f.invoiceStreet || ''}
${f.invoiceZip || ''} ${f.invoiceCity || ''}`;
  }

  function shippingMailBlock(f) {
    if (!els.wantShipping || !els.wantShipping.checked) return 'Dane do wysyłki: nie podano / do ustalenia z serwisem.';
    return `Dane do wysyłki:
${f.shipName || ''}
${f.shipStreet || ''}
${f.shipZip || ''} ${f.shipCity || ''}
Telefon dla kuriera: ${f.shipPhone || '-'}`;
  }

  async function lookupCompanyByNip() {
    if (!CONFIG.enableVatLookup) return;
    const fields = els.customerForm.elements;
    if (els.wantInvoice && !els.wantInvoice.checked) { els.wantInvoice.checked = true; updateOptionalSections(); }
    const nip = cleanNip(fields.invoiceNip?.value || '');
    if (!nip || nip.length !== 10) {
      setLookupStatus('Wpisz poprawny NIP: 10 cyfr.', 'warn');
      return;
    }
    fields.invoiceNip.value = nip;
    setLookupStatus('Szukam danych firmy w rejestrze MF…', 'loading');
    try {
      const date = new Date().toISOString().slice(0,10);
      const url = `https://wl-api.mf.gov.pl/api/search/nip/${encodeURIComponent(nip)}?date=${date}`;
      const res = await fetch(url, {headers:{'Accept':'application/json'}});
      if (!res.ok) throw new Error(`Błąd API: ${res.status}`);
      const data = await res.json();
      const subject = data?.result?.subject || (data?.result?.subjects || [])[0];
      if (!subject) {
        setLookupStatus('Nie znaleziono firmy dla tego NIP. Dane można wpisać ręcznie.', 'warn');
        return;
      }
      const address = subject.workingAddress || subject.residenceAddress || '';
      const parsed = parsePolishAddress(address);
      if (subject.name && !fields.invoiceName.value.trim()) fields.invoiceName.value = subject.name;
      if (parsed.street && !fields.invoiceStreet.value.trim()) fields.invoiceStreet.value = parsed.street;
      if (parsed.zip && !fields.invoiceZip.value.trim()) fields.invoiceZip.value = parsed.zip;
      if (parsed.city && !fields.invoiceCity.value.trim()) fields.invoiceCity.value = parsed.city;
      if (els.sameAsInvoice.checked) applySameAsInvoice();
      setLookupStatus(`Pobrano: ${subject.name || 'firma'}${subject.statusVat ? ` • VAT: ${subject.statusVat}` : ''}. Sprawdź dane przed wysłaniem.`, 'ok');
      saveDraft(); updateCanProceed();
    } catch (e) {
      console.warn(e);
      setLookupStatus('Nie udało się pobrać danych online. Możliwe CORS, chwilowa niedostępność API albo brak internetu. Wpisz dane ręcznie.', 'warn');
    }
  }

  function updateLookupHint() {
    const fields = els.customerForm.elements;
    if (els.wantInvoice && !els.wantInvoice.checked) { els.wantInvoice.checked = true; updateOptionalSections(); }
    const nip = cleanNip(fields.invoiceNip?.value || '');
    if (!els.lookupStatus) return;
    if (!nip) setLookupStatus('Po wpisaniu NIP możesz spróbować automatycznie pobrać nazwę i adres firmy.', '');
    else if (nip.length < 10) setLookupStatus(`NIP ma ${nip.length}/10 cyfr.`, '');
    else if (isValidNip(nip)) setLookupStatus('NIP wygląda poprawnie — możesz pobrać dane firmy.', 'ok');
    else setLookupStatus('NIP ma 10 cyfr, ale suma kontrolna wygląda podejrzanie. Możesz sprawdzić lub wpisać dane ręcznie.', 'warn');
  }

  function autofillCityFromZip(zipField, cityField, statusEl, silent=false) {
    const fields = els.customerForm.elements;
    const zip = normalizeZip(fields[zipField]?.value || '');
    if (fields[zipField] && zip && fields[zipField].value !== zip) fields[zipField].value = zip;
    if (!zip || zip.length < 6) {
      if (statusEl && !silent) statusEl.textContent = 'Wpisz kod w formacie 00-000.';
      return;
    }
    const city = state.postalCodes.get(zip);
    if (city) {
      if (!fields[cityField].value.trim()) fields[cityField].value = city;
      if (statusEl) { statusEl.textContent = `Uzupełniono miejscowość: ${city}.`; statusEl.className = 'lookup-status ok'; }
      if (els.sameAsInvoice.checked && zipField === 'invoiceZip') applySameAsInvoice();
      saveDraft(); updateCanProceed();
    } else if (statusEl && !silent) {
      statusEl.textContent = 'Nie mam tego kodu w lokalnej bazie — wpisz miejscowość ręcznie.';
      statusEl.className = 'lookup-status warn';
    }
  }

  function setLookupStatus(text, mode='') {
    if (!els.lookupStatus) return;
    els.lookupStatus.textContent = text;
    els.lookupStatus.className = `lookup-status ${mode}`.trim();
  }

  function parsePolishAddress(address) {
    const clean = String(address || '').replace(/\s+/g,' ').trim();
    const m = clean.match(/^(.*?)(\d{2}-\d{3})\s+(.+)$/);
    if (!m) return {street: clean, zip:'', city:''};
    return {street: m[1].trim(), zip: m[2], city: m[3].trim()};
  }

  function cleanNip(value) { return String(value || '').replace(/\D/g,'').slice(0,10); }
  function normalizeZip(value) {
    const digits = String(value || '').replace(/\D/g,'').slice(0,5);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0,2)}-${digits.slice(2)}`;
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
        sameAsInvoice: els.sameAsInvoice ? els.sameAsInvoice.checked : false,
        wantInvoice: els.wantInvoice ? els.wantInvoice.checked : false,
        wantShipping: els.wantShipping ? els.wantShipping.checked : false,
        manualMode: state.manualMode
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch(e) {}
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY); if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft.form) for (const [k,v] of Object.entries(draft.form)) if (els.customerForm.elements[k]) els.customerForm.elements[k].value = v;
      if (els.wantInvoice) els.wantInvoice.checked = Boolean(draft.wantInvoice);
      if (els.wantShipping) els.wantShipping.checked = Boolean(draft.wantShipping);
      if (els.sameAsInvoice) els.sameAsInvoice.checked = Boolean(draft.sameAsInvoice);
      state.manualMode = Boolean(draft.manualMode);
      updateOptionalSections();
      if (draft.deviceIndex) {
        const device = state.manualMode ? {deviceIndex: draft.deviceIndex, title: 'urządzenie spoza aktualnej bazy'} : state.devices.find(d => norm(d.deviceIndex) === norm(draft.deviceIndex));
        if (device) {
          state.selectedDevice = device;
          state.selectedDrawing = state.manualMode ? null : (state.drawings.find(d => String(d.id) === String(draft.drawingId)) || state.drawings.find(d => norm(d.deviceIndex) === norm(device.deviceIndex)));
          for (const [id, qty] of draft.parts || []) {
            const part = state.parts.find(p => p.id === id);
            if (part) state.selectedParts.set(id, {part, qty: Number(qty) || 1});
          }
          els.deviceSearch.value = device.deviceIndex || '';
          renderSelectedDevice(); renderParts(); renderBasket(); renderViewer(false); renderDeviceResults(els.deviceSearch.value);
          updateLookupHint();
          autofillCityFromZip('invoiceZip','invoiceCity', els.zipStatus, true);
          autofillCityFromZip('shipZip','shipCity', els.shipZipStatus, true);
          goStep(Math.min(Math.max(Number(draft.step) || 1, 1), 4));
        }
      }
    } catch(e) {}
  }

  function resetAll() {
    if (!confirm('Wyczyścić formularz i zacząć od nowa?')) return;
    localStorage.removeItem(DRAFT_KEY);
    state.selectedDevice = null; state.selectedDrawing = null; state.selectedParts.clear(); state.manualMode = false;
    els.customerForm.reset(); updateOptionalSections(); els.deviceSearch.value = ''; els.partsSearch.value = '';
    renderDeviceResults(''); renderBasket(); renderViewer(false); goStep(1); renderContext();
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
