(() => {
  'use strict';

  const VERSION = '20260610-fixed';
  const DATA_CANDIDATES = {
    parts: ['parts.json', 'data/parts.json'],
    devices: ['devices.json', 'data/devices.json'],
    drawings: ['drawings.json', 'data/drawings.json'],
    logos: ['logos.json', 'data/logos.json', 'db-manifest.json', 'assets/logos.json']
  };

  const BRAND_LOGOS = [
    ['TOYA', ['assets/logos/toya.png', 'toya.png']],
    ['YATO', ['assets/logos/yato-wordmark-clean.png', 'assets/logos/yato.png', 'yato-wordmark-clean.png', 'yato-official.png', 'yato.png']],
    ['VOREL', ['assets/logos/vorel.png', 'vorel.png']],
    ['STHOR', ['assets/logos/sthor.png', 'sthor.png']],
    ['LUND', ['assets/logos/lund.png', 'lund.png']],
    ['FLO', ['assets/logos/flo.png', 'flo.png']],
    ['FALA', ['assets/logos/fala.png', 'fala.png']]
  ];

  const state = {
    loadedFiles: [],
    failedFiles: [],
    raw: {},
    devices: [],
    drawings: [],
    allTextIndex: [],
    query: '',
    showAll: false
  };

  const el = (id) => document.getElementById(id);
  const els = {
    notice: el('notice'),
    searchInput: el('searchInput'),
    clearBtn: el('clearBtn'),
    showAllBtn: el('showAllBtn'),
    results: el('results'),
    resultsTitle: el('resultsTitle'),
    resultsCount: el('resultsCount'),
    chips: el('chips'),
    dataStatus: el('dataStatus'),
    statDevices: el('statDevices'),
    statParts: el('statParts'),
    statDrawings: el('statDrawings'),
    statFiles: el('statFiles'),
    brandLogos: el('brandLogos')
  };

  init();

  async function init() {
    await clearOldServiceWorkers();
    renderLogos();
    wireEvents();
    await loadAllData();
    buildIndex();
    renderStats();
    renderStatus();
    renderChips();
    renderResults();
  }

  async function clearOldServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.warn('Nie udało się wyczyścić starego cache/service workera:', error);
    }
  }

  function wireEvents() {
    els.searchInput.addEventListener('input', () => {
      state.query = els.searchInput.value.trim();
      state.showAll = false;
      renderResults();
    });

    els.clearBtn.addEventListener('click', () => {
      els.searchInput.value = '';
      state.query = '';
      state.showAll = false;
      renderResults();
      els.searchInput.focus();
    });

    els.showAllBtn.addEventListener('click', () => {
      state.showAll = true;
      state.query = '';
      els.searchInput.value = '';
      renderResults();
    });
  }

  async function loadAllData() {
    setNotice('Ładuję pliki danych z repozytorium…', 'ok');
    const groups = Object.entries(DATA_CANDIDATES).map(async ([key, urls]) => {
      const loaded = await loadFirstWorkingJson(key, urls);
      if (loaded) state.raw[key] = loaded.data;
    });
    await Promise.all(groups);

    if (!state.loadedFiles.length) {
      setNotice('Nie udało się odczytać żadnego pliku JSON. Sprawdź, czy parts.json, devices.json i drawings.json leżą w tym samym źródle publikacji co index.html.', 'danger');
    } else {
      setNotice(`Gotowe. Odczytano ${state.loadedFiles.length} plik/i danych.`, 'ok', 2600);
    }
  }

  async function loadFirstWorkingJson(group, urls) {
    for (const url of urls) {
      try {
        const response = await fetch(withBust(url), { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        const data = safeJsonParse(text);
        state.loadedFiles.push({ group, url, size: text.length, count: countRecords(data) });
        return { url, data };
      } catch (error) {
        state.failedFiles.push({ group, url, error: String(error.message || error) });
      }
    }
    return null;
  }

  function withBust(url) {
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}v=${VERSION}-${Date.now()}`;
  }

  function safeJsonParse(text) {
    let clean = text.trim().replace(/^\uFEFF/, '');
    try { return JSON.parse(clean); } catch (_) {}

    // Czasem plik bywa zapisany jako JS: const DATA = [...];
    const firstArray = clean.indexOf('[');
    const firstObj = clean.indexOf('{');
    const start = [firstArray, firstObj].filter((n) => n >= 0).sort((a,b) => a-b)[0];
    if (start >= 0) {
      clean = clean.slice(start);
      const lastArray = clean.lastIndexOf(']');
      const lastObj = clean.lastIndexOf('}');
      const end = Math.max(lastArray, lastObj);
      if (end >= 0) return JSON.parse(clean.slice(0, end + 1));
    }
    throw new Error('Niepoprawny JSON');
  }

  function buildIndex() {
    const deviceMap = new Map();

    const mergeDevice = (device) => {
      const idx = normalizeDeviceIndex(device.deviceIndex || device.index || device.sku || device.model || device.title || '');
      const key = idx || `device-${deviceMap.size + 1}`;
      const current = deviceMap.get(key) || {
        id: key,
        deviceIndex: idx || String(device.deviceIndex || device.index || device.title || key),
        brand: '',
        title: '',
        description: '',
        parts: [],
        drawings: [],
        source: new Set(),
        raw: []
      };

      current.brand = current.brand || cleanText(device.brand || detectBrandFromText(JSON.stringify(device)) || '');
      current.title = current.title || cleanText(device.title || device.name || device.modelName || device.description || '');
      current.description = current.description || cleanText(device.description || device.nazwa || device.name || '');
      if (Array.isArray(device.parts)) current.parts.push(...device.parts.map(normalizePart));
      if (device.partIndex || device.partNo || device.part || device.indexPart || device['Indeks części'] || device.indeks_czesci) current.parts.push(normalizePart(device));
      if (device.source) current.source.add(device.source);
      current.raw.push(device.raw || device);
      deviceMap.set(key, current);
    };

    for (const item of toRecords(state.raw.devices, 'devices')) mergeDevice(normalizeDevice(item, 'devices.json'));
    for (const item of toRecords(state.raw.parts, 'parts')) {
      const normalized = normalizeDevice(item, 'parts.json');
      if (normalized.parts.length || normalized.deviceIndex || normalized.title) mergeDevice(normalized);
    }

    const drawings = toRecords(state.raw.drawings, 'drawings').map(normalizeDrawing).filter(Boolean);
    state.drawings = drawings;

    for (const drawing of drawings) {
      const key = normalizeDeviceIndex(drawing.deviceIndex || drawing.title || drawing.localPath || '');
      if (!key) continue;
      const current = deviceMap.get(key) || {
        id: key,
        deviceIndex: key,
        brand: drawing.brand || detectBrandFromText(JSON.stringify(drawing)) || '',
        title: drawing.title || '',
        description: '',
        parts: [],
        drawings: [],
        source: new Set(['drawings.json']),
        raw: []
      };
      current.drawings.push(drawing);
      deviceMap.set(key, current);
    }

    // Dopasowanie rysunków po tokenach, gdy indeks jest zapisany w innej postaci.
    const devices = Array.from(deviceMap.values());
    for (const device of devices) {
      if (device.drawings.length) continue;
      const deviceTokens = makeTokens(device.deviceIndex + ' ' + device.title);
      const match = drawings.find((drawing) => {
        const dt = makeTokens(`${drawing.deviceIndex} ${drawing.title} ${drawing.localPath}`);
        return intersectsStrong(deviceTokens, dt);
      });
      if (match) device.drawings.push(match);
    }

    for (const device of devices) {
      device.parts = uniqueParts(device.parts);
      device.searchText = normalizeSearch([
        device.deviceIndex, device.brand, device.title, device.description,
        ...device.parts.flatMap((p) => [p.index, p.name, p.number, p.note]),
        ...device.drawings.flatMap((d) => [d.title, d.localPath, d.driveViewUrl])
      ].join(' '));
      device.source = Array.from(device.source || []);
    }

    devices.sort((a, b) => naturalCompare(a.deviceIndex, b.deviceIndex));
    state.devices = devices;
  }

  function toRecords(data, source) {
    if (!data) return [];
    if (Array.isArray(data)) return data.map((value, i) => ({ value, key: String(i), source }));
    if (typeof data === 'object') {
      const preferred = ['items', 'data', 'devices', 'products', 'parts', 'records', 'rows', 'drawings'];
      for (const key of preferred) {
        if (Array.isArray(data[key])) return data[key].map((value, i) => ({ value, key: String(i), source }));
      }
      return Object.entries(data).map(([key, value]) => ({ key, value, source }));
    }
    return [];
  }

  function normalizeDevice(entry, source) {
    const obj = unwrap(entry.value);
    const key = entry.key;
    const deviceIndex = firstNonEmpty(obj,
      'deviceIndex', 'device_index', 'device', 'productIndex', 'product_index', 'toolIndex', 'tool_index',
      'model', 'modelIndex', 'sku', 'symbol', 'kod', 'index', 'indeks', 'Indeks', 'Indeks urządzenia', 'Urządzenie'
    ) || (looksLikeDeviceIndex(key) ? key : extractDeviceIndex(JSON.stringify(obj)));

    const partsSource = firstNonEmpty(obj, 'parts', 'czesci', 'części', 'spareParts', 'items', 'pozycje');
    const parts = Array.isArray(partsSource)
      ? partsSource.map(normalizePart)
      : nestedParts(obj).map(normalizePart);

    return {
      source,
      raw: obj,
      deviceIndex: normalizeDeviceIndex(deviceIndex || ''),
      brand: firstNonEmpty(obj, 'brand', 'marka', 'Brand', 'MARKA') || detectBrandFromText(JSON.stringify(obj)),
      title: firstNonEmpty(obj, 'title', 'name', 'nazwa', 'Nazwa', 'modelName', 'description', 'opis') || '',
      description: firstNonEmpty(obj, 'description', 'opis', 'Opis') || '',
      parts
    };
  }

  function nestedParts(obj) {
    const results = [];
    if (!obj || typeof obj !== 'object') return results;

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && /part|cz[eę]s|spare|pozyc/i.test(key)) {
        results.push(...value);
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const maybePartIndex = firstNonEmpty(value, 'partIndex', 'index', 'indeks', 'code', 'kod', 'symbol');
        if (maybePartIndex) results.push(value);
      }
    }
    return results;
  }

  function normalizePart(value) {
    const obj = unwrap(value);
    const scalar = (value && typeof value !== 'object') ? String(value) : '';
    return {
      index: cleanText(firstNonEmpty(obj, 'partIndex', 'part_index', 'partNo', 'partNumber', 'part', 'index', 'indeks', 'Indeks', 'Indeks części', 'kod', 'code', 'sku', 'symbol', 'nr', 'number') || scalar || ''),
      number: cleanText(firstNonEmpty(obj, 'position', 'pos', 'lp', 'LP', 'nrRysunku', 'drawingNo', 'numer') || ''),
      name: cleanText(firstNonEmpty(obj, 'name', 'nazwa', 'Nazwa', 'title', 'description', 'opis', 'Opis') || ''),
      qty: cleanText(firstNonEmpty(obj, 'qty', 'quantity', 'ilosc', 'ilość', 'Ilość', 'amount') || ''),
      note: cleanText(firstNonEmpty(obj, 'note', 'uwagi', 'Uwagi', 'status', 'availability', 'available') || '')
    };
  }

  function normalizeDrawing(entry) {
    const scalar = (entry.value && typeof entry.value !== 'object') ? String(entry.value) : '';
    const obj = unwrap(entry.value);
    if (!obj || typeof obj !== 'object') return null;
    const title = cleanText(firstNonEmpty(obj, 'title', 'name', 'filename', 'fileName', 'plik', 'file') || entry.key || scalar.split('/').pop() || 'Rysunek');
    const localPath = cleanText(firstNonEmpty(obj, 'localPath', 'path', 'file', 'url', 'href', 'src') || (scalar.match(/\.(pdf|png|jpe?g|webp|gif|svg)(\?|$)/i) ? scalar : '') || '');
    const driveViewUrl = cleanText(firstNonEmpty(obj, 'driveViewUrl', 'viewUrl', 'googleDriveUrl', 'driveUrl') || '');
    const drivePreviewUrl = cleanText(firstNonEmpty(obj, 'drivePreviewUrl', 'previewUrl') || toDrivePreview(driveViewUrl));
    const deviceIndex = normalizeDeviceIndex(firstNonEmpty(obj, 'deviceIndex', 'device_index', 'productIndex', 'model', 'index', 'indeks') || extractDeviceIndex(`${title} ${localPath}`));

    return {
      id: firstNonEmpty(obj, 'id') || normalizeSearch(title).slice(0, 80),
      deviceIndex,
      brand: cleanText(firstNonEmpty(obj, 'brand', 'marka') || detectBrandFromText(`${title} ${localPath}`) || ''),
      title,
      type: cleanText(firstNonEmpty(obj, 'type', 'mime', 'mimeType') || inferType(localPath || driveViewUrl || title)),
      localPath,
      driveViewUrl,
      drivePreviewUrl,
      raw: obj
    };
  }

  function unwrap(value) {
    if (!value || typeof value !== 'object') return { value };
    return value;
  }

  function firstNonEmpty(obj, ...keys) {
    if (!obj || typeof obj !== 'object') return '';
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (value === 0) return '0';
        if (Array.isArray(value) || (value && typeof value === 'object')) return value;
        if (String(value || '').trim()) return String(value).trim();
      }
    }
    return '';
  }

  function cleanText(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value).replace(/\s+/g, ' ').trim();
  }

  function normalizeDeviceIndex(value) {
    const text = cleanText(value).toUpperCase();
    if (!text) return '';
    const direct = text.match(/\b(?:YT|YG|TOYA|VOREL|STHOR|LUND|FLO|FALA)[-_\s]?[A-Z0-9]{2,12}\b/);
    if (direct) return direct[0].replace(/[_\s]+/g, '-');
    const mixed = text.match(/\b[A-Z]{1,5}[-_\s]?[0-9]{3,8}[A-Z]?\b/);
    if (mixed) return mixed[0].replace(/[_\s]+/g, '-');
    const numbers = text.match(/\b[0-9]{4,8}\b/);
    return numbers ? numbers[0] : text.slice(0, 64);
  }

  function looksLikeDeviceIndex(value) {
    return /(?:YT|YG|VOREL|STHOR|LUND|FLO|FALA|TOYA)?[-_\s]?[0-9]{3,8}/i.test(String(value || ''));
  }

  function extractDeviceIndex(text) {
    return normalizeDeviceIndex(text || '');
  }

  function detectBrandFromText(text) {
    const src = String(text || '').toUpperCase();
    return ['YATO', 'VOREL', 'STHOR', 'LUND', 'FLO', 'FALA', 'TOYA', 'YATO GASTRO'].find((brand) => src.includes(brand)) || '';
  }

  function inferType(url) {
    const low = String(url || '').toLowerCase();
    if (low.includes('drive.google.com')) return 'drive-pdf';
    if (low.endsWith('.pdf')) return 'pdf';
    if (/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(low)) return 'image';
    return 'file';
  }

  function toDrivePreview(url) {
    const match = String(url || '').match(/\/d\/([^/]+)/) || String(url || '').match(/[?&]id=([^&]+)/);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : '';
  }

  function uniqueParts(parts) {
    const seen = new Set();
    const out = [];
    for (const part of parts || []) {
      const key = normalizeSearch(`${part.index}|${part.number}|${part.name}`);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(part);
    }
    return out.sort((a, b) => naturalCompare(a.number || a.index, b.number || b.index));
  }

  function normalizeSearch(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function makeTokens(value) {
    return new Set(normalizeSearch(value).split(' ').filter((x) => x.length >= 3));
  }

  function intersectsStrong(a, b) {
    for (const token of a) {
      if (b.has(token)) return true;
    }
    return false;
  }

  function naturalCompare(a, b) {
    return String(a || '').localeCompare(String(b || ''), 'pl', { numeric: true, sensitivity: 'base' });
  }

  function countRecords(data) {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object') {
      for (const key of ['items', 'data', 'devices', 'products', 'parts', 'records', 'rows', 'drawings']) {
        if (Array.isArray(data[key])) return data[key].length;
      }
      return Object.keys(data).length;
    }
    return 0;
  }

  function renderStats() {
    const partsCount = state.devices.reduce((sum, d) => sum + d.parts.length, 0);
    els.statDevices.textContent = state.devices.length.toLocaleString('pl-PL');
    els.statParts.textContent = partsCount.toLocaleString('pl-PL');
    els.statDrawings.textContent = state.drawings.length.toLocaleString('pl-PL');
    els.statFiles.textContent = state.loadedFiles.length.toLocaleString('pl-PL');
  }

  function renderStatus() {
    const loaded = state.loadedFiles.map((file) => `
      <div class="side-item">
        <b>✅ ${escapeHtml(file.group)} — ${escapeHtml(file.url)}</b>
        <span>${file.count.toLocaleString('pl-PL')} rekordów, ${(file.size / 1024).toFixed(1)} KB</span>
      </div>`).join('');

    const failedByGroup = Object.entries(groupBy(state.failedFiles, 'group'))
      .filter(([group]) => !state.loadedFiles.some((file) => file.group === group))
      .map(([group, files]) => `
        <div class="side-item">
          <b>⚠️ ${escapeHtml(group)}</b>
          <span>Nie znaleziono: ${files.map((f) => escapeHtml(f.url)).join(', ')}</span>
        </div>`).join('');

    els.dataStatus.innerHTML = loaded + failedByGroup || '<div class="side-item"><b>Brak danych</b><span>Nie udało się odczytać plików JSON.</span></div>';
  }

  function groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key];
      (acc[value] ||= []).push(item);
      return acc;
    }, {});
  }

  function renderChips() {
    const brands = Array.from(new Set(state.devices.map((d) => d.brand).filter(Boolean))).sort();
    const chips = brands.slice(0, 14).map((brand) => `<button class="chip" type="button" data-brand="${escapeHtml(brand)}">${escapeHtml(brand)}</button>`).join('');
    els.chips.innerHTML = chips;
    els.chips.querySelectorAll('[data-brand]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.query = btn.dataset.brand;
        els.searchInput.value = state.query;
        state.showAll = false;
        renderResults();
      });
    });
  }

  function renderResults() {
    const query = normalizeSearch(state.query);
    let items = state.devices;

    if (query) {
      const tokens = query.split(' ').filter(Boolean);
      items = state.devices
        .map((device) => ({ device, score: scoreDevice(device, tokens) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || naturalCompare(a.device.deviceIndex, b.device.deviceIndex))
        .map((item) => item.device);
    } else if (!state.showAll) {
      items = state.devices.slice(0, 30);
    }

    const limited = items.slice(0, state.showAll ? 1000 : 120);
    els.resultsTitle.textContent = query ? 'Wyniki wyszukiwania' : state.showAll ? 'Cała baza' : 'Ostatnio załadowane indeksy';
    els.resultsCount.textContent = `${items.length.toLocaleString('pl-PL')} wyników${items.length > limited.length ? ` — pokazuję ${limited.length}` : ''}`;

    if (!limited.length) {
      els.results.innerHTML = `<div class="empty">Nie znaleziono pasującego indeksu. Spróbuj wpisać sam numer bez prefiksu, np. zamiast <b>YT-828390</b> wpisz <b>828390</b>.</div>`;
      return;
    }

    els.results.innerHTML = limited.map(renderResult).join('');
    els.results.querySelectorAll('.result-head').forEach((head) => {
      head.addEventListener('click', () => head.closest('.result').classList.toggle('open'));
    });
  }

  function scoreDevice(device, tokens) {
    let score = 0;
    const normalizedIndex = normalizeSearch(device.deviceIndex);
    for (const token of tokens) {
      if (!token) continue;
      if (normalizedIndex === token) score += 100;
      if (normalizedIndex.includes(token)) score += 55;
      if (device.searchText.includes(token)) score += 12;
      for (const part of device.parts) {
        const partText = normalizeSearch(`${part.index} ${part.name} ${part.number}`);
        if (partText.includes(token)) score += 28;
      }
    }
    return score;
  }

  function renderResult(device, index) {
    const drawingCount = device.drawings.length;
    const partCount = device.parts.length;
    const openClass = index === 0 && state.query ? ' open' : '';
    return `
      <article class="result${openClass}">
        <div class="result-head" role="button" tabindex="0">
          <div>
            <div class="result-title">
              <span class="index-badge">${escapeHtml(device.deviceIndex || 'bez indeksu')}</span>
              ${device.brand ? `<span class="brand-badge">${escapeHtml(device.brand)}</span>` : ''}
            </div>
            <div class="result-sub">
              ${escapeHtml(device.title || device.description || 'Urządzenie / indeks z bazy')}
              <br>${partCount} części • ${drawingCount ? `${drawingCount} rysunek/rysunki` : 'brak przypisanego rysunku w indeksie'}
            </div>
          </div>
          <button type="button" class="secondary">Szczegóły</button>
        </div>
        <div class="result-body">
          ${renderParts(device.parts)}
          ${renderDrawings(device.drawings)}
          ${renderRawHint(device)}
        </div>
      </article>`;
  }

  function renderParts(parts) {
    if (!parts.length) return '<div class="empty">Dla tego indeksu nie znaleziono tabeli części w odczytanych plikach.</div>';
    return `
      <table class="parts-table">
        <thead><tr><th>Pozycja</th><th>Indeks części</th><th>Nazwa / opis</th><th>Ilość</th><th>Uwagi</th></tr></thead>
        <tbody>${parts.map((part) => `
          <tr>
            <td>${escapeHtml(part.number || '—')}</td>
            <td><code>${escapeHtml(part.index || '—')}</code></td>
            <td>${escapeHtml(part.name || '—')}</td>
            <td>${escapeHtml(part.qty || '—')}</td>
            <td>${escapeHtml(part.note || '')}</td>
          </tr>`).join('')}</tbody>
      </table>`;
  }

  function renderDrawings(drawings) {
    if (!drawings.length) return '';
    return `<div class="drawing-box">${drawings.map(renderDrawing).join('')}</div>`;
  }

  function renderDrawing(drawing) {
    const src = drawing.drivePreviewUrl || drawing.localPath || drawing.driveViewUrl;
    const openUrl = drawing.localPath || drawing.driveViewUrl || drawing.drivePreviewUrl;
    const low = String(src || '').toLowerCase();
    const isImage = /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(low);
    const title = escapeHtml(drawing.title || 'Rysunek');
    let preview = '';

    if (src) {
      preview = isImage
        ? `<img class="drawing-img" loading="lazy" src="${escapeAttr(src)}" alt="${title}">`
        : `<iframe class="drawing-frame" src="${escapeAttr(src)}" title="${title}" loading="lazy"></iframe>`;
    }

    return `
      <section>
        <div class="toolbar">
          <strong>${title}</strong>
          ${openUrl ? `<a class="button secondary" target="_blank" rel="noopener" href="${escapeAttr(openUrl)}">Otwórz rysunek</a>` : ''}
        </div>
        ${preview || '<div class="empty">Rysunek jest w indeksie, ale nie ma ścieżki podglądu.</div>'}
      </section>`;
  }

  function renderRawHint(device) {
    if (device.parts.length || device.drawings.length) return '';
    return `<p class="small">Ten rekord został znaleziony, ale aplikacja nie rozpoznała automatycznie pól części. Dane źródłowe są w JSON — sprawdź format pól w pliku i ewentualnie dopisz aliasy w funkcjach normalizeDevice/normalizePart.</p>`;
  }

  function renderLogos() {
    els.brandLogos.innerHTML = BRAND_LOGOS.map(([brand, paths]) => {
      const first = paths[0];
      const list = paths.slice(1).map((p) => `'${escapeJs(p)}'`).join(',');
      return `<img src="${escapeAttr(first)}" alt="${escapeAttr(brand)}" onerror="window.__nextLogo(this, [${list}])">`;
    }).join('');

    window.__nextLogo = (img, paths) => {
      const next = paths.shift();
      if (next) {
        img.onerror = () => window.__nextLogo(img, paths);
        img.src = next;
      } else {
        img.remove();
      }
    };
  }

  function setNotice(message, kind = '', timeout = 0) {
    els.notice.className = `notice show ${kind}`.trim();
    els.notice.textContent = message;
    if (timeout) setTimeout(() => els.notice.className = 'notice', timeout);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }

  function escapeAttr(value) { return escapeHtml(value).replace(/'/g, '&#039;'); }
  function escapeJs(value) { return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
})();
