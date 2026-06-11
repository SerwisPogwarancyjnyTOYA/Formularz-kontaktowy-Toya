(() => {
  'use strict';
  const VERSION = '20260611-v29-drive-all-ready';
  const CONFIG = Object.assign({
    storageMode: 'drive',
    drawingsBaseUrl: '',
    preferExternalDrawings: true,
    storageLabel: 'Google Drive',
    demoDevices: ['YT-827795', 'YT-852371', 'YT-85177', '00610', '00703'],
    driveSearchFallback: true,
    driveSearchBaseUrl: 'https://drive.google.com/drive/search?q=',
    driveMapUrls: ['data/drive-drawings-map.json', 'drive-drawings-map.json']
  }, window.PGW_CONFIG || {});
  const DATA_URLS = {
    meta: ['data/build-meta.json', 'build-meta.json'],
    drawings: ['data/drawings.generated.json', 'drawings.generated.json', 'drawings.json', 'data/drawings.json'],
    parts: ['data/parts.generated.json', 'parts.generated.json', 'parts.json', 'data/parts.json'],
    devices: ['data/devices.generated.json', 'devices.generated.json', 'devices.json', 'data/devices.json'],
    driveMap: (window.PGW_CONFIG && window.PGW_CONFIG.driveMapUrls) || ['data/drive-drawings-map.json', 'drive-drawings-map.json']
  };

  const state = {
    meta: {}, drawings: [], parts: [], devices: [], driveMap: {},
    drawingById: new Map(), partsByDrawing: new Map(), devicesByIndex: new Map(),
    selectedParts: [], query: '', initialized: false
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    loadStatus: $('loadStatus'), statParts: $('statParts'), statDrawings: $('statDrawings'), statDevices: $('statDevices'),
    searchInput: $('searchInput'), clearSearch: $('clearSearch'), showAllBtn: $('showAllBtn'), results: $('results'), resultsTitle: $('resultsTitle'), resultsMeta: $('resultsMeta'),
    viewer: $('viewer'), viewerTitle: $('viewerTitle'), viewerOpen: $('viewerOpen'), mailText: $('mailText'), copyMail: $('copyMail'), customerForm: $('customerForm')
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
      state.driveMap = await loadFirst(DATA_URLS.driveMap, {});
      buildIndexes();
      renderStats();
      setStatus(`Gotowe: ${fmt(state.parts.length)} części, ${fmt(state.drawings.length)} rysunków`);
      state.initialized = true;
      state.query = els.searchInput.value.trim();
      if (state.query) renderResults(); else renderExamples();
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
    applyDriveManifest();
    for (const part of state.parts) {
      part.__search = norm([part.partIndex, part.namePl, part.nameEn, part.position, part.deviceIndex, part.drawingTitle, part.zun].join(' '));
    }
    for (const drawing of state.drawings) {
      drawing.__search = norm([drawing.deviceIndex, drawing.brand, drawing.title, drawing.fileName, drawing.originalPath, drawing.searchText].join(' '));
    }
  }


  function applyDriveManifest() {
    const maps = normalizeDriveMap(state.driveMap);
    if (!maps.length) return;

    const byKey = new Map();
    for (const item of maps) {
      if (!item.key) continue;
      if (!byKey.has(item.key)) byKey.set(item.key, item);
    }

    for (const drawing of state.drawings) {
      const keys = drawingKeys(drawing);
      for (const key of keys) {
        const hit = byKey.get(key);
        if (!hit) continue;
        if (hit.fileId && !drawing.driveFileId) drawing.driveFileId = hit.fileId;
        if (hit.url && !drawing.url) drawing.url = hit.url;
        if (hit.viewerUrl && !drawing.viewerUrl) drawing.viewerUrl = hit.viewerUrl;
        if (hit.openUrl && !drawing.openUrl) drawing.openUrl = hit.openUrl;
        if (hit.mimeType && !drawing.mimeType) drawing.mimeType = hit.mimeType;
        break;
      }
    }
  }

  function normalizeDriveMap(value) {
    const rows = Array.isArray(value) ? value : normalizeArray(value);
    const out = [];
    for (const row of rows) {
      if (!row || typeof row !== 'object') continue;
      const fileId = row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.id || '';
      const url = row.url || row.webViewLink || '';
      const viewerUrl = row.viewerUrl || (fileId ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview` : '');
      const openUrl = row.openUrl || url || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : '');
      const mimeType = row.mimeType || '';

      const rawKeys = [];
      const push = (v) => {
        if (Array.isArray(v)) v.forEach(push);
        else if (v !== undefined && v !== null) rawKeys.push(v);
      };
      push(row.keys);
      push(row.path);
      push(row.originalPath);
      push(row.localPath);
      push(row.drivePath);
      push(row.fileName);
      push(row.name);
      push(row.title);
      push(row.deviceIndex);
      push(row.deviceIndexes);
      push(row.model);
      push(row.models);
      push(row.key);

      for (const raw of rawKeys) {
        const variants = keyVariants(raw);
        for (const key of variants) if (key) out.push({key, fileId, url, viewerUrl, openUrl, mimeType});
      }
    }
    return out;
  }

  function drawingKeys(drawing) {
    const raw = [
      drawing.path,
      drawing.originalPath,
      drawing.localPath,
      drawing.fileName,
      drawing.name,
      drawing.title,
      drawing.deviceIndex,
      drawing.searchText
    ];
    return unique(raw.flatMap(keyVariants));
  }

  function keyVariants(value) {
    const text = String(value || '').trim();
    if (!text) return [];
    const base = normKey(text);
    const noExt = stripExt(base);
    const fileOnly = normKey(text.replace(/\\/g, '/').split('/').pop());
    const fileNoExt = stripExt(fileOnly);
    const models = extractIndexes(text);
    return unique([base, noExt, fileOnly, fileNoExt, ...models.map(normKey), ...models.map(x => stripExt(normKey(x)))]).filter(Boolean);
  }

  function extractIndexes(value) {
    const text = String(value || '').toUpperCase();
    const matches = text.match(/\b[A-Z]{1,4}[-_ ]?\d{2,6}\b|\b\d{5,6}\b/g) || [];
    return matches.map(x => x.replace(/_/g, '-').replace(/\s+/g, '-').replace(/([A-Z]+)(\d)/, '$1-$2'));
  }

  function stripExt(value) {
    return String(value || '').replace(/\.(pdf|docx?|xlsx?|jpg|jpeg|png|webp|gif|bmp)$/i, '');
  }

  function normKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\\/g, '/')
      .replace(/^.*\//, '')
      .replace(/[_-]+/g, '-')
      .replace(/\s+/g, ' ')
      .replace(/^czesci[-_ ]zamienne[-_ ]*/i, 'czesci-zamienne-')
      .trim();
  }

  function renderStats() {
    els.statParts.textContent = fmt(state.parts.length);
    els.statDrawings.textContent = fmt(state.drawings.length);
    els.statDevices.textContent = fmt(state.devices.length || unique(state.drawings.map(d => d.deviceIndex)).length);
  }

  function renderExamples() {
    const demoDevices = Array.isArray(CONFIG.demoDevices) ? CONFIG.demoDevices.map(norm) : [];
    const drawingHasPreview = (d) => Boolean(d && (d.driveFileId || d.googleDriveId || d.gdriveId || d.viewerUrl || d.openUrl || d.url));
    const previewDrawingIds = new Set(state.drawings.filter(drawingHasPreview).map(d => String(d.id)));

    const demoParts = [];
    for (const device of demoDevices) {
      const rows = state.parts
        .filter(p => norm(p.deviceIndex) === device && previewDrawingIds.has(String(p.drawingId)) && p.partIndex && norm(p.partIndex) !== device)
        .slice(0, 2);
      demoParts.push(...rows);
    }

    const fallbackParts = state.parts
      .filter(p => (p.namePl || p.nameEn) && previewDrawingIds.has(String(p.drawingId)))
      .slice(0, 10);

    const sampleParts = uniqueBy([...demoParts, ...fallbackParts], p => String(p.id)).slice(0, 10);
    const sampleDrawings = state.drawings
      .filter(d => drawingHasPreview(d) && String(d.type || '').toLowerCase() === 'pdf')
      .sort((a, b) => {
        const ai = demoDevices.indexOf(norm(a.deviceIndex));
        const bi = demoDevices.indexOf(norm(b.deviceIndex));
        return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
      })
      .slice(0, 6);

    els.resultsTitle.textContent = 'Sprawdzone przykłady do prezentacji';
    els.resultsMeta.textContent = `Te rekordy mają przypięty podgląd rysunku z Google Drive. Pełna baza jest dostępna przez wyszukiwarkę.`;
    els.results.className = 'results';
    els.results.innerHTML = [
      ...sampleParts.map(renderPartResult),
      ...sampleDrawings.map(renderDrawingResult)
    ].join('') || '<div class="empty-state">Brak przykładowych rekordów z przypiętym podglądem Google Drive.</div>';
  }

  function uniqueBy(items, keyFn) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
      const key = keyFn(item);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }

  function renderResults() {
    if (!state.initialized) {
      els.resultsTitle.textContent = 'Ładowanie danych';
      els.resultsMeta.textContent = 'Wczytuję bazę części i rysunków. Po zakończeniu wyszukiwanie ruszy automatycznie.';
      els.results.className = 'results empty-state';
      els.results.innerHTML = '<p>Jeszcze chwilę — baza jest duża, więc pierwsze uruchomienie może potrwać.</p>';
      return;
    }
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
    return `<table class="parts-table"><thead><tr><th>Poz.</th><th>Indeks</th><th>Nazwa</th><th>Cena</th><th></th></tr></thead><tbody>${parts.map(p => `<tr><td>${escapeHtml(p.position || '—')}</td><td class="part-index">${escapeHtml(p.partIndex)}</td><td>${escapeHtml(p.namePl || p.nameEn || '—')}</td><td>${p.priceNet ? `<span class="price">${escapeHtml(num(p.priceNet))} PLN</span>` : '—'}</td><td><button class="secondary" data-add-part="${escapeAttr(p.id)}">Do zapytania</button></td></tr>`).join('')}</tbody></table>`;
  }

  async function showDrawing(id) {
    const drawing = state.drawingById.get(String(id));
    if (!drawing) return;
    const source = resolveDrawingSource(drawing);
    const url = source.viewerUrl || source.url || '';

    els.viewerTitle.textContent = drawing.title || drawing.fileName || 'Rysunek';
    if (source.openUrl || url) {
      els.viewerOpen.href = source.openUrl || url;
      els.viewerOpen.classList.remove('hidden');
    } else {
      els.viewerOpen.classList.add('hidden');
    }

    els.viewer.className = 'viewer empty-viewer';
    els.viewer.innerHTML = '<div class="viewer-note">Sprawdzam plik rysunku…</div>';

    if (!url) {
      const search = driveSearchUrl(drawing);
      els.viewer.innerHTML = `<div class="viewer-note"><strong>Rysunek jest w bazie, ale nie ma jeszcze przypiętego podglądu Google Drive.</strong><br>To nie blokuje wyszukiwania części. Po wygenerowaniu pełnego manifestu Drive ten rysunek zacznie wyświetlać się automatycznie. Do czasu uzupełnienia możesz użyć przycisku wyszukania w Drive.<br><br>${search ? `<a class="primary" href="${escapeAttr(search)}" target="_blank" rel="noreferrer">Znajdź w Google Drive</a>` : ''}</div>`;
      if (search) { els.viewerOpen.href = search; els.viewerOpen.classList.remove('hidden'); }
      return;
    }

    const exists = await fileLooksAvailable(source);
    if (!exists) {
      els.viewer.className = 'viewer empty-viewer';
      els.viewer.innerHTML = `<div class="missing-file"><strong>Rysunek nie jest dostępny pod wskazanym adresem.</strong><p>Baza zna części i rysunek, ale plik nie został jeszcze opublikowany albo adres jest niepoprawny. Dla produkcji najlepiej trzymać rysunki poza repo: CDN/R2/TOYA24.</p><code>${escapeHtml(url)}</code></div>`;
      return;
    }

    const low = String(url).toLowerCase();
    const type = (drawing.type || source.kind || '').toLowerCase();

    if (source.kind === 'drive-preview') {
      els.viewer.className = 'viewer';
      els.viewer.innerHTML = `<iframe src="${escapeAttr(url)}" title="${escapeAttr(drawing.title || 'Podgląd Google Drive')}"></iframe>`;
      return;
    }

    if (type === 'image' || /\.(png|jpe?g|webp|gif|svg|bmp)(\?|#|$)/i.test(low)) {
      els.viewer.className = 'viewer';
      els.viewer.innerHTML = `<img src="${escapeAttr(url)}" alt="${escapeAttr(drawing.title || 'Rysunek')}" onerror="this.closest('.viewer').className='viewer empty-viewer';this.closest('.viewer').innerHTML='<div class=&quot;viewer-note&quot;><strong>Nie udało się wyświetlić obrazu.</strong><br>Sprawdź hosting/CDN albo uprawnienia pliku.</div>'">`;
    } else if (type === 'pdf' || /\.pdf(\?|#|$)/i.test(low)) {
      els.viewer.className = 'viewer';
      const sep = url.includes('#') ? '&' : '#';
      els.viewer.innerHTML = `<iframe src="${escapeAttr(url + sep + 'toolbar=1&navpanes=0')}" title="${escapeAttr(drawing.title || 'Rysunek PDF')}"></iframe>`;
    } else {
      els.viewer.className = 'viewer empty-viewer';
      els.viewer.innerHTML = `<div class="viewer-note"><strong>Ten format nie ma stabilnego podglądu inline.</strong><br>DOC/DOCX najlepiej przekonwertować do PDF/JPG przy imporcie, żeby klient widział rysunek bez pobierania.<br><br><a class="primary" href="${escapeAttr(source.openUrl || url)}" target="_blank" rel="noreferrer">Otwórz plik</a></div>`;
    }
  }

  function resolveDrawingSource(drawing) {
    const mode = String(CONFIG.storageMode || 'auto').toLowerCase();
    const local = encodePath(drawing.path || drawing.localPath || drawing.originalPath || '');
    const direct = drawing.viewerUrl || drawing.cdnUrl || drawing.url || '';
    const driveId = drawing.driveFileId || drawing.googleDriveId || drawing.gdriveId || '';
    const search = driveSearchUrl(drawing);
    const cdn = buildCdnUrl(drawing);

    if (mode === 'drive' && driveId) return driveSource(driveId);
    if (mode === 'drive' && search) return {kind:'drive-search', url:'', viewerUrl:'', openUrl:search, external:true};
    if (mode === 'cdn' && cdn) return {kind:'cdn', url: cdn, viewerUrl: cdn, openUrl: cdn, external:true};
    if (mode === 'local') return {kind:'local', url: local, viewerUrl: local, openUrl: local, external:false};

    if (CONFIG.preferExternalDrawings !== false) {
      if (driveId) return driveSource(driveId);
      if (direct) return {kind:'external', url: direct, viewerUrl: direct, openUrl: drawing.openUrl || direct, external:true};
      if (cdn) return {kind:'cdn', url: cdn, viewerUrl: cdn, openUrl: cdn, external:true};
    }

    if (local) return {kind:'local', url: local, viewerUrl: local, openUrl: local, external:false};
    if (direct) return {kind:'external', url: direct, viewerUrl: direct, openUrl: drawing.openUrl || direct, external:true};
    if (driveId) return driveSource(driveId);
    if (search) return {kind:'drive-search', url:'', viewerUrl:'', openUrl:search, external:true};
    return {kind:'missing', url:'', viewerUrl:'', openUrl:'', external:false};
  }

  function driveSearchUrl(drawing) {
    if (CONFIG.driveSearchFallback === false) return '';
    const base = String(CONFIG.driveSearchBaseUrl || 'https://drive.google.com/drive/search?q=');
    const query = drawing.fileName || drawing.deviceIndex || drawing.title || '';
    if (!query) return '';
    return base + encodeURIComponent(query);
  }

  function driveSource(fileId) {
    const clean = String(fileId).trim();
    return {
      kind: 'drive-preview',
      url: `https://drive.google.com/file/d/${encodeURIComponent(clean)}/preview`,
      viewerUrl: `https://drive.google.com/file/d/${encodeURIComponent(clean)}/preview`,
      openUrl: `https://drive.google.com/file/d/${encodeURIComponent(clean)}/view`,
      external: true
    };
  }

  function buildCdnUrl(drawing) {
    const base = String(CONFIG.drawingsBaseUrl || '').trim();
    if (!base) return '';
    const p = drawing.cdnPath || drawing.storagePath || drawing.path || drawing.localPath || '';
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    return joinUrl(base, encodePath(p));
  }

  async function fileLooksAvailable(source) {
    const url = source.viewerUrl || source.url || '';
    if (!url) return false;
    if (source.external || /^https?:\/\//i.test(url) && !url.includes(location.host)) return true;
    try {
      const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      return r.ok;
    } catch (error) {
      try {
        const r = await fetch(url, { method: 'GET', cache: 'no-store' });
        return r.ok;
      } catch (_) {
        return false;
      }
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
    const now = new Date().toLocaleString('pl-PL');
    const firstDevice = state.selectedParts.find(p => p.deviceIndex)?.deviceIndex || inferDeviceFromQuery() || form.device || '';
    const subject = state.selectedParts.length ? `Zapytanie o części — ${firstDevice || state.selectedParts[0].partIndex}` : 'Zapytanie o części pogwarancyjne';

    const lines = [];
    lines.push('Dzień dobry,');
    lines.push('');
    lines.push('Mam urządzenie: ' + (firstDevice || '[marka / model / indeks urządzenia]') + '.');
    lines.push('');
    lines.push('Potrzebuję do niego części z rysunku wybuchowego wskazane poniżej.');
    lines.push('Proszę o ich wycenę oraz informację o dostępności.');
    lines.push('');
    lines.push('WYBRANE CZĘŚCI:');
    if (state.selectedParts.length) {
      state.selectedParts.forEach((p, n) => {
        const drawing = state.drawingById.get(String(p.drawingId)) || {};
        lines.push(`${n + 1}. ${p.namePl || p.nameEn || p.partIndex || 'Część'}`);
        lines.push(`   Urządzenie: ${p.deviceName || drawing.title || ''}${p.deviceIndex ? ` (${p.deviceIndex})` : ''}`.trimEnd());
        lines.push(`   Indeks części: ${p.partIndex || ''}`);
        lines.push(`   Pozycja z rysunku: ${p.position || ''}`);
        if (drawing.title) lines.push(`   Rysunek: ${drawing.title}`);
        if (p.priceNet) lines.push(`   Cena z bazy: ${num(p.priceNet)} PLN netto`);
        lines.push('   Ilość: 1 szt.');
        lines.push('');
      });
    } else {
      const manual = (state.query || els.searchInput.value || '').trim();
      if (manual) {
        lines.push(`1. Indeks / opis wpisany w formularzu: ${manual}`);
      } else {
        lines.push('1. [wpisz indeksy części / pozycje z rysunku]');
      }
      lines.push('');
    }
    lines.push('DANE KONTAKTOWE:');
    lines.push(`Imię i nazwisko / firma: ${form.name || ''}`);
    lines.push(`E-mail: ${form.email || ''}`);
    lines.push(`Telefon: ${form.phone || ''}`);
    lines.push(`NIP: ${form.nip || ''}`);
    lines.push('');
    lines.push('DANE DO FAKTURY:');
    lines.push(form.invoice || '');
    lines.push('');
    lines.push('ADRES WYSYŁKI:');
    lines.push(form.shipping || '');
    lines.push('');
    lines.push('UWAGI:');
    lines.push(form.notes || '');
    lines.push('');
    lines.push(`Wygenerowano w: PGW Service Hub, ${now}`);

    els.mailText.value = lines.join('\n');
  }

  function readCustomerForm() {
    const val = (id) => ($(id)?.value || '').trim();
    return {
      name: val('cfName') || val('cfContactName') || val('cfInvoiceName'),
      email: val('cfEmail'),
      phone: val('cfPhone'),
      nip: val('cfNip'),
      invoice: val('cfInvoice') || [val('cfInvoiceName'), val('cfInvoiceStreet'), val('cfInvoiceCity')].filter(Boolean).join('\n'),
      shipping: val('cfShipping') || [val('cfShipName'), val('cfShipPhone'), val('cfShipStreet'), val('cfShipCity')].filter(Boolean).join('\n'),
      notes: val('cfNotes'),
      device: val('cfDevice'),
      serial: val('cfSerial')
    };
  }

  function inferDeviceFromQuery() {
    const q = (els.searchInput?.value || state.query || '').toUpperCase();
    const m = q.match(/\b[A-Z]{1,3}-?\d{3,6}\b/);
    return m ? m[0].replace(/([A-Z]+)(\d)/, '$1-$2') : '';
  }

  function autofillDeviceFromSelection() {
    const deviceInput = $('cfDevice');
    if (!deviceInput || deviceInput.value.trim()) return;
    const devices = unique(state.selectedParts.map(p => p.deviceIndex).filter(Boolean));
    if (devices.length) deviceInput.value = devices.join(', ');
  }

  function encodePath(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return path.split('/').map((part) => encodeURIComponent(part)).join('/').replace(/%23/g, '#');
  }

  function joinUrl(base, path) {
    const b = String(base || '').replace(/\/+$/, '');
    const p = String(path || '').replace(/^\/+/, '');
    return `${b}/${p}`;
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
