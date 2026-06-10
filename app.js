(() => {
  'use strict';
  const VERSION = '20260610-client-mail';
  const DATA_URLS = {
    meta: ['data/build-meta.json', 'build-meta.json'],
    drawings: ['data/drawings.generated.json', 'drawings.generated.json', 'drawings.json', 'data/drawings.json'],
    parts: ['data/parts.generated.json', 'parts.generated.json', 'parts.json', 'data/parts.json'],
    devices: ['data/devices.generated.json', 'devices.generated.json', 'devices.json', 'data/devices.json']
  };

  const state = {
    meta: {}, drawings: [], parts: [], devices: [],
    drawingById: new Map(), partsByDrawing: new Map(), devicesByIndex: new Map(),
    selectedParts: [], query: '', initialized: false
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    loadStatus: $('loadStatus'), statParts: $('statParts'), statDrawings: $('statDrawings'), statDevices: $('statDevices'),
    searchInput: $('searchInput'), clearSearch: $('clearSearch'), showAllBtn: $('showAllBtn'), results: $('results'), resultsTitle: $('resultsTitle'), resultsMeta: $('resultsMeta'),
    viewer: $('viewer'), viewerTitle: $('viewerTitle'), viewerOpen: $('viewerOpen'), mailText: $('mailText'), copyMail: $('copyMail'), customerForm: $('customerForm'), cfDevice: $('cfDevice')
  };

  init();

  async function init() {
    await cleanOldCaches();
    wireEvents();
    setStatus('Ładowanie bazy…');
    try {
      state.meta = await loadFirst(DATA_URLS.meta, {});
      state.drawings = normalizeArray(await loadFirst(DATA_URLS.drawings, []));
      state.parts = normalizeArray(await loadFirst(DATA_URLS.parts, []));
      state.devices = normalizeArray(await loadFirst(DATA_URLS.devices, []));
      buildIndexes();
      renderStats();
      setStatus(`Gotowe: ${fmt(state.parts.length)} części, ${fmt(state.drawings.length)} rysunków`);
      state.initialized = true;
      renderExamples();
      updateMail();
    } catch (error) {
      console.error(error);
      setStatus('Błąd ładowania danych');
      els.results.className = 'results empty-state';
      els.results.innerHTML = `<p><strong>Nie udało się odczytać bazy.</strong><br>${escapeHtml(error.message || error)}</p>`;
    }
  }

  async function cleanOldCaches() {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) { console.warn('Cache cleanup skipped:', error); }
  }

  function wireEvents() {
    els.searchInput.addEventListener('input', debounce(() => {
      state.query = els.searchInput.value.trim();
      renderResults();
    }, 120));
    els.clearSearch.addEventListener('click', () => {
      els.searchInput.value = '';
      state.query = '';
      renderExamples();
      els.searchInput.focus();
    });
    els.showAllBtn.addEventListener('click', renderExamples);
    document.querySelectorAll('[data-example]').forEach((btn) => btn.addEventListener('click', () => {
      els.searchInput.value = btn.dataset.example;
      state.query = btn.dataset.example;
      renderResults();
    }));
    els.copyMail.addEventListener('click', async () => {
      await navigator.clipboard.writeText(els.mailText.value);
      toast('Skopiowano treść maila');
    });
    if (els.customerForm) {
      els.customerForm.addEventListener('input', debounce(updateMail, 80));
      els.customerForm.addEventListener('change', updateMail);
    }
    els.results.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-toggle]');
      if (toggle) toggle.closest('.result-card')?.classList.toggle('open');
      const drawing = event.target.closest('[data-view-drawing]');
      if (drawing) showDrawing(drawing.dataset.viewDrawing);
      const add = event.target.closest('[data-add-part]');
      if (add) addPart(add.dataset.addPart);
      const related = event.target.closest('[data-search]');
      if (related) {
        els.searchInput.value = related.dataset.search;
        state.query = related.dataset.search;
        renderResults();
      }
    });
  }

  async function loadFirst(urls, fallback) {
    let lastError;
    for (const url of urls) {
      try {
        const response = await fetch(`${url}?v=${VERSION}`, {cache:'no-store'});
        if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
        return await response.json();
      } catch (error) { lastError = error; }
    }
    if (fallback !== undefined) return fallback;
    throw lastError || new Error('Brak danych');
  }

  function normalizeArray(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    for (const key of ['items','data','rows','parts','drawings','devices','records']) if (Array.isArray(value[key])) return value[key];
    return Object.values(value).filter(Boolean);
  }

  function buildIndexes() {
    state.drawingById = new Map(state.drawings.map((d) => [String(d.id), d]));
    state.partsByDrawing = new Map();
    state.devicesByIndex = new Map();
    for (const part of state.parts) {
      const did = String(part.drawingId || '');
      if (!state.partsByDrawing.has(did)) state.partsByDrawing.set(did, []);
      state.partsByDrawing.get(did).push(part);
    }
    for (const device of state.devices) state.devicesByIndex.set(norm(device.deviceIndex), device);
    for (const part of state.parts) {
      part.__search = norm([part.partIndex, part.namePl, part.nameEn, part.position, part.deviceIndex, part.drawingTitle, part.zun].join(' '));
    }
    for (const drawing of state.drawings) {
      drawing.__search = norm([drawing.deviceIndex, drawing.brand, drawing.title, drawing.fileName, drawing.originalPath, drawing.searchText].join(' '));
    }
  }

  function renderStats() {
    els.statParts.textContent = fmt(state.parts.length);
    els.statDrawings.textContent = fmt(state.drawings.length);
    els.statDevices.textContent = fmt(state.devices.length || unique(state.drawings.map(d => d.deviceIndex)).length);
  }

  function renderExamples() {
    const sampleParts = state.parts.filter(p => p.namePl || p.nameEn).slice(0, 10);
    const sampleDrawings = state.drawings.filter(d => d.type === 'pdf').slice(0, 5);
    els.resultsTitle.textContent = 'Przykładowe rekordy z bazy';
    els.resultsMeta.textContent = `Baza gotowa. Wyszukuj po indeksie urządzenia, indeksie części albo nazwie.`;
    els.results.className = 'results';
    els.results.innerHTML = [
      ...sampleParts.map(renderPartResult),
      ...sampleDrawings.map(renderDrawingResult)
    ].join('') || '<div class="empty-state">Brak przykładowych rekordów.</div>';
  }

  function renderResults() {
    if (!state.initialized) return;
    const query = norm(state.query);
    if (!query) return renderExamples();
    const tokens = query.split(' ').filter(Boolean);
    const parts = scoreItems(state.parts, tokens, 'part').slice(0, 80);
    const drawings = scoreItems(state.drawings, tokens, 'drawing').slice(0, 35);
    const combined = [...parts, ...drawings].sort((a,b) => b.score - a.score).slice(0, 90);
    els.resultsTitle.textContent = 'Wyniki wyszukiwania';
    els.resultsMeta.textContent = `${fmt(parts.length)} pasujących części • ${fmt(drawings.length)} pasujących rysunków / plików`;
    els.results.className = 'results';
    if (!combined.length) {
      els.results.className = 'results empty-state';
      els.results.innerHTML = `<p>Brak wyniku dla <strong>${escapeHtml(state.query)}</strong>. Spróbuj bez myślnika, bez prefiksu albo wpisz sam numer.</p>`;
      return;
    }
    els.results.innerHTML = combined.map((item) => item.kind === 'part' ? renderPartResult(item.value, item.score) : renderDrawingResult(item.value, item.score)).join('');
  }

  function scoreItems(items, tokens, kind) {
    const scored = [];
    for (const item of items) {
      let score = 0;
      const search = item.__search || norm(Object.values(item).join(' '));
      for (const token of tokens) {
        if (!token) continue;
        if (kind === 'part') {
          const idx = norm(item.partIndex);
          if (idx === token) score += 260;
          else if (idx.includes(token)) score += 140;
          if (norm(item.deviceIndex).includes(token)) score += 70;
        } else {
          const dev = norm(item.deviceIndex);
          if (dev === token) score += 220;
          else if (dev.includes(token)) score += 110;
        }
        if (search.includes(token)) score += 25;
      }
      if (score > 0) scored.push({kind, value:item, score});
    }
    return scored.sort((a,b) => b.score - a.score);
  }

  function renderPartResult(part) {
    const drawing = state.drawingById.get(String(part.drawingId)) || {};
    const siblings = (state.partsByDrawing.get(String(part.drawingId)) || []).filter(p => p.id !== part.id).slice(0, 8);
    const price = part.priceNet ? `${num(part.priceNet)} PLN netto` : 'brak ceny w bazie';
    const stock = part.stockTotal !== undefined ? `stan: ${part.stockTotal}` : 'stan nieustalony';
    const name = part.namePl || part.nameEn || 'Część z rysunku';
    return `<article class="result-card open">
      <div class="result-main">
        <div>
          <div class="result-kicker"><span class="badge red">Część</span><span class="badge">${escapeHtml(part.deviceIndex || 'bez modelu')}</span>${part.position ? `<span class="badge ok">poz. ${escapeHtml(part.position)}</span>` : ''}</div>
          <h3 class="result-title"><span class="part-index">${mark(part.partIndex)}</span> — ${mark(name)}</h3>
          <p class="result-sub">${escapeHtml(drawing.title || part.drawingTitle || '')}</p>
        </div>
        <div class="card-actions">
          ${drawing.id ? `<button class="primary" data-view-drawing="${escapeAttr(drawing.id)}">Pokaż rysunek</button>` : ''}
          <button class="secondary" data-add-part="${escapeAttr(part.id)}">Do zapytania</button>
          <button class="ghost" data-toggle>Więcej</button>
        </div>
      </div>
      <div class="details">
        <table class="parts-table"><tbody>
          <tr><th>Indeks</th><td class="part-index">${escapeHtml(part.partIndex)}</td><th>Pozycja</th><td>${escapeHtml(part.position || '—')}</td></tr>
          <tr><th>Nazwa PL</th><td>${escapeHtml(part.namePl || '—')}</td><th>Nazwa EN</th><td>${escapeHtml(part.nameEn || '—')}</td></tr>
          <tr><th>Cena</th><td class="price">${escapeHtml(price)}</td><th>Dostępność</th><td>${escapeHtml(stock)}</td></tr>
          <tr><th>Rysunek</th><td colspan="3">${escapeHtml(drawing.title || part.drawingTitle || '')}</td></tr>
        </tbody></table>
        ${siblings.length ? `<div class="related"><p class="related-title">Z czym się wiąże na tym rysunku:</p><div class="related-list">${siblings.map(s => `<button data-search="${escapeAttr(s.partIndex)}">${escapeHtml(s.position ? s.position + ' — ' : '')}${escapeHtml(s.partIndex)}</button>`).join('')}</div></div>` : ''}
      </div>
    </article>`;
  }

  function renderDrawingResult(drawing) {
    const parts = (state.partsByDrawing.get(String(drawing.id)) || []).slice(0, 12);
    return `<article class="result-card">
      <div class="result-main">
        <div>
          <div class="result-kicker"><span class="badge red">Rysunek</span><span class="badge">${escapeHtml(drawing.type || 'plik')}</span><span class="badge">${escapeHtml(drawing.deviceIndex || 'bez indeksu')}</span></div>
          <h3 class="result-title">${mark(drawing.title || drawing.fileName || 'Rysunek')}</h3>
          <p class="result-sub">${escapeHtml(drawing.path || drawing.originalPath || '')}</p>
        </div>
        <div class="card-actions">
          <button class="primary" data-view-drawing="${escapeAttr(drawing.id)}">Pokaż rysunek</button>
          <button class="ghost" data-toggle>Części (${fmt((state.partsByDrawing.get(String(drawing.id)) || []).length)})</button>
        </div>
      </div>
      <div class="details">
        ${parts.length ? renderPartsTable(parts) : '<p class="result-sub">Rysunek jest widoczny, ale z tego PDF/DOCX nie udało się automatycznie odczytać tabeli części.</p>'}
      </div>
    </article>`;
  }

  function renderPartsTable(parts) {
    return `<table class="parts-table"><thead><tr><th>Poz.</th><th>Indeks</th><th>Nazwa</th><th>Cena</th><th></th></tr></thead><tbody>${parts.map(p => `<tr><td>${escapeHtml(p.position || '—')}</td><td class="part-index">${escapeHtml(p.partIndex)}</td><td>${escapeHtml(p.namePl || p.nameEn || '—')}</td><td>${p.priceNet ? `<span class="price">${escapeHtml(num(p.priceNet))} PLN</span>` : '—'}</td><td><button class="secondary" data-add-part="${escapeAttr(p.id)}">Dodaj</button></td></tr>`).join('')}</tbody></table>`;
  }

  function showDrawing(id) {
    const drawing = state.drawingById.get(String(id));
    if (!drawing) return;
    const url = encodePath(drawing.path || drawing.localPath || drawing.url || drawing.originalPath || '');
    els.viewerTitle.textContent = drawing.title || drawing.fileName || 'Rysunek';
    if (url) {
      els.viewerOpen.href = url;
      els.viewerOpen.classList.remove('hidden');
    } else {
      els.viewerOpen.classList.add('hidden');
    }
    const type = (drawing.type || '').toLowerCase();
    const low = String(url).toLowerCase();
    if (type === 'image' || /\.(png|jpe?g|webp|gif|svg|bmp)$/i.test(low)) {
      els.viewer.className = 'viewer';
      els.viewer.innerHTML = `<img src="${escapeAttr(url)}" alt="${escapeAttr(drawing.title || 'Rysunek')}">`;
    } else if (type === 'pdf' || low.endsWith('.pdf')) {
      els.viewer.className = 'viewer';
      els.viewer.innerHTML = `<iframe src="${escapeAttr(url)}#toolbar=1&navpanes=0" title="${escapeAttr(drawing.title || 'Rysunek PDF')}"></iframe>`;
    } else {
      els.viewer.className = 'viewer empty-viewer';
      els.viewer.innerHTML = `<div class="viewer-note"><strong>Ten plik nie ma podglądu inline.</strong><br>Najlepiej przekonwertować DOC/DOCX do PDF albo JPG, żeby klient widział rysunek bez pobierania pliku.<br><br>${url ? `<a class="primary" href="${escapeAttr(url)}" target="_blank" rel="noreferrer">Otwórz plik</a>` : ''}</div>`;
    }
  }

  function addPart(id) {
    const part = state.parts.find(p => String(p.id) === String(id));
    if (!part) return;
    if (!state.selectedParts.some(p => p.id === part.id)) state.selectedParts.push(part);
    autofillDeviceFromSelection();
    updateMail();
    toast('Dodano do zapytania');
  }

  function updateMail() {
    const form = readCustomerForm();
    const deviceFromParts = unique(state.selectedParts.map(p => p.deviceIndex).filter(Boolean)).join(', ');
    const device = form.device || deviceFromParts || '[marka / model / indeks urządzenia]';
    const serial = form.serial ? `
Numer seryjny / dodatkowy opis: ${form.serial}` : '';

    const partLines = state.selectedParts.length
      ? state.selectedParts.map((p, i) => {
          const drawing = state.drawingById.get(String(p.drawingId)) || {};
          const bits = [
            `${i+1}. Indeks części: ${p.partIndex || 'do uzupełnienia'}`,
            p.position ? `pozycja na rysunku: ${p.position}` : '',
            (p.namePl || p.nameEn) ? `opis: ${p.namePl || p.nameEn}` : '',
            drawing.title ? `rysunek: ${drawing.title}` : (p.drawingTitle ? `rysunek: ${p.drawingTitle}` : '')
          ].filter(Boolean);
          return bits.join(' | ');
        }).join('\n')
      : '1. [indeks części / pozycja z rysunku / opis części]';

    const invoiceLines = [
      `Firma / imię i nazwisko: ${form.invoiceName || '[do uzupełnienia]'}`,
      `NIP: ${form.nip || '[do uzupełnienia / nie dotyczy]'}`,
      `Adres: ${form.invoiceStreet || '[ulica i numer]'}`,
      `Kod pocztowy i miejscowość: ${form.invoiceCity || '[kod i miejscowość]'}`
    ].join('\n');

    const shippingHasAny = form.shipName || form.shipPhone || form.shipStreet || form.shipCity;
    const shippingLines = shippingHasAny
      ? [
          `Odbiorca: ${form.shipName || '[do uzupełnienia]'}`,
          `Telefon dla kuriera: ${form.shipPhone || '[do uzupełnienia]'}`,
          `Adres dostawy: ${form.shipStreet || '[ulica i numer]'}`,
          `Kod pocztowy i miejscowość: ${form.shipCity || '[kod i miejscowość]'}`
        ].join('\n')
      : 'Takie same jak dane do faktury.';

    const contactLines = [
      `Osoba kontaktowa: ${form.contactName || form.invoiceName || '[do uzupełnienia]'}`,
      `Telefon: ${form.phone || '[do uzupełnienia]'}`,
      `E-mail: ${form.email || '[do uzupełnienia]'}`
    ].join('\n');

    els.mailText.value = `Dzień dobry,

Mam urządzenie: ${device}.${serial}

Potrzebuję do niego części z rysunku wybuchowego:
${partLines}

Proszę o wycenę oraz informację o dostępności powyższych części.

Dane do faktury:
${invoiceLines}

Dane do wysyłki:
${shippingLines}

Dane kontaktowe:
${contactLines}${form.notes ? `

Uwagi:
${form.notes}` : ''}

Pozdrawiam${form.contactName ? `,
${form.contactName}` : ''}`;
  }

  function readCustomerForm() {
    const val = (id) => ($(id)?.value || '').trim();
    return {
      device: val('cfDevice'), serial: val('cfSerial'), invoiceName: val('cfInvoiceName'), nip: val('cfNip'),
      invoiceStreet: val('cfInvoiceStreet'), invoiceCity: val('cfInvoiceCity'), shipName: val('cfShipName'),
      shipPhone: val('cfShipPhone'), shipStreet: val('cfShipStreet'), shipCity: val('cfShipCity'),
      contactName: val('cfContactName'), phone: val('cfPhone'), email: val('cfEmail'), notes: val('cfNotes')
    };
  }

  function autofillDeviceFromSelection() {
    if (!els.cfDevice || els.cfDevice.value.trim()) return;
    const devices = unique(state.selectedParts.map(p => p.deviceIndex).filter(Boolean));
    if (devices.length) els.cfDevice.value = devices.join(', ');
  }

  function encodePath(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return path.split('/').map((part) => encodeURIComponent(part)).join('/').replace(/%23/g, '#');
  }

  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function unique(arr) { return Array.from(new Set(arr.filter(Boolean))); }
  function fmt(n) { return Number(n || 0).toLocaleString('pl-PL'); }
  function num(v) { const n = Number(String(v).replace(',','.')); return Number.isFinite(n) ? n.toLocaleString('pl-PL', {minimumFractionDigits:2, maximumFractionDigits:2}) : String(v); }
  function setStatus(text) { els.loadStatus.textContent = text; }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
  function escapeAttr(value) { return escapeHtml(value); }
  function mark(value) {
    const text = escapeHtml(value || '');
    const q = state.query.trim();
    if (!q || q.length < 2) return text;
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${safe})`, 'ig'), '<span class="mark">$1</span>');
  }
  function debounce(fn, wait) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); }; }
  function toast(text) {
    const node = document.createElement('div'); node.className = 'toast'; node.textContent = text; document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }
})();
