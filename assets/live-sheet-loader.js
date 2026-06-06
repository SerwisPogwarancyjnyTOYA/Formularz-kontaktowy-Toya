// Live Google Sheet bridge for YATO Service Hub.
// This loader keeps GitHub Pages light: the page downloads CSV from the public/shared Google Sheet,
// builds a searchable catalog in the browser, and falls back to bundled data when Sheet CSV is not reachable.
(function(){
  const CONFIG = {
    spreadsheetId: '1bHcHt8Z8BwfJNAG5w-HHEz3f2Rh1NZ-nZsJ0xc3tPnQ',
    partsGid: '528237333',          // Baza części
    toya24Gid: '742001401',         // TOYA24 integracja
    cacheKey: 'pgw-live-catalog-v20260606-fullsheet1',
    cacheMs: 6 * 60 * 60 * 1000
  };

  const norm = (v='') => String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\-\s]/g,' ').replace(/\s+/g,' ').trim();
  const compact = (v='') => norm(v).replace(/[^a-z0-9]/g,'');
  const esc = (v='') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const titleCase = (v='') => String(v).toLowerCase().replace(/(^|\s|\-)(\p{L})/gu, (m, p, l) => p + l.toUpperCase());

  function csvUrl(gid){
    return `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  }

  function parseCsv(text){
    const rows = [];
    let row = [], cell = '', quote = false;
    for(let i=0; i<text.length; i++){
      const ch = text[i], next = text[i+1];
      if(quote){
        if(ch === '"' && next === '"'){ cell += '"'; i++; }
        else if(ch === '"'){ quote = false; }
        else cell += ch;
      } else {
        if(ch === '"') quote = true;
        else if(ch === ','){ row.push(cell); cell=''; }
        else if(ch === '\n'){ row.push(cell); rows.push(row); row=[]; cell=''; }
        else if(ch !== '\r') cell += ch;
      }
    }
    row.push(cell); rows.push(row);
    return rows.filter(r => r.some(c => String(c||'').trim() !== ''));
  }

  function findHeader(rows, mustContain){
    return rows.findIndex(r => mustContain.every(token => r.some(c => norm(c).includes(norm(token)))));
  }

  function rowObjects(rows, mustContain){
    const idx = findHeader(rows, mustContain);
    if(idx < 0) return [];
    const headers = rows[idx].map(h => String(h||'').trim());
    return rows.slice(idx+1).map((r, n) => {
      const obj = { __row: idx + n + 2 };
      headers.forEach((h, i) => { if(h) obj[h] = String(r[i] || '').trim(); });
      return obj;
    }).filter(o => Object.keys(o).some(k => k !== '__row' && o[k]));
  }

  function get(obj, names){
    const keys = Object.keys(obj || {});
    for(const name of names){
      const exact = keys.find(k => norm(k) === norm(name));
      if(exact && obj[exact]) return obj[exact];
      const fuzzy = keys.find(k => norm(k).includes(norm(name)) || norm(name).includes(norm(k)));
      if(fuzzy && obj[fuzzy]) return obj[fuzzy];
    }
    return '';
  }

  function inferDeviceFromPart(partIndex){
    const clean = String(partIndex || '').toUpperCase().replace(/\s/g,'');
    let m = clean.match(/^ZY(\d{5})([A-Z0-9]*)$/);
    if(m) return `YT-${m[1]}`;
    m = clean.match(/^ZG(\d{5})[-_ ]?(\d+[A-Z]?)?$/);
    if(m) return `YG-${m[1]}`;
    return '';
  }

  function inferPosition(partIndex, explicit){
    if(explicit && explicit !== '—') return explicit;
    const clean = String(partIndex || '').toUpperCase().replace(/\s/g,'');
    let m = clean.match(/^ZY\d{5}([A-Z0-9]+)$/);
    if(m){
      const suffix = m[1];
      const num = suffix.match(/^0*(\d+)([A-Z]?)$/);
      return num ? `${num[1]}${num[2] || ''}` : suffix;
    }
    m = clean.match(/^ZG\d{5}[-_ ]?(\d+[A-Z]?)$/);
    if(m) return m[1];
    return explicit || '—';
  }

  function drawingIdFor(model){
    return compact(model).replace(/^(yt|yg|zg)/, '$1-').replace(/([a-z]+)(\d)/, '$1-$2');
  }

  function brandFrom(partIndex, model, rawBrand){
    if(rawBrand) return rawBrand;
    const p = String(partIndex||'').toUpperCase();
    const m = String(model||'').toUpperCase();
    if(p.startsWith('ZG') || m.startsWith('YG')) return 'YATO GASTRO';
    if(p.startsWith('ZY') || m.startsWith('YT')) return 'YATO';
    return 'TOYA';
  }

  function parseToya24(rows){
    const objects = rowObjects(rows, ['Model', 'URL']);
    const entries = [];
    objects.forEach(o => {
      const deviceIndex = get(o, ['Model urządzenia','Model urzadzenia','Model']);
      if(!deviceIndex) return;
      const entry = {
        status: get(o, ['Status']),
        brand: get(o, ['Marka']) || brandFrom('', deviceIndex, ''),
        deviceIndex,
        productName: get(o, ['Nazwa produktu']) || `Urządzenie ${deviceIndex}`,
        category: get(o, ['Kategoria']),
        productUrl: get(o, ['URL karty TOYA24','URL karty']),
        partsPdfUrl: get(o, ['URL PDF części TOYA24','URL PDF czesci TOYA24','PDF części','PDF czesci']),
        driveBackupUrl: get(o, ['URL rysunku Drive backup','Drive backup']),
        activeSource: get(o, ['Aktywne źródło','Aktywne zrodlo']),
        productId: get(o, ['ID produktu TOYA24']),
        attachmentKey: get(o, ['Attachment key']),
        checkedAt: get(o, ['Data sprawdzenia']),
        notes: get(o, ['Uwagi']),
        aliases: []
      };
      entries.push(entry);
    });
    return entries;
  }

  function parseParts(rows, toyaEntries){
    const objects = rowObjects(rows, ['Indeks części','Nazwa części']);
    const toyaByModel = new Map((toyaEntries || []).map(e => [compact(e.deviceIndex), e]));
    const parts = [];
    const seen = new Set();

    objects.forEach(o => {
      const partIndex = get(o, ['Indeks części','Indeks czesci']);
      const partNameRaw = get(o, ['Nazwa części PL','Nazwa czesci PL','Nazwa części','Nazwa czesci']);
      if(!partIndex || !partNameRaw) return;

      let deviceIndex = get(o, ['Model urządzenia','Model urzadzenia','Model']) || inferDeviceFromPart(partIndex);
      if(!deviceIndex) return;
      deviceIndex = String(deviceIndex).toUpperCase().replace(/^YT(\d)/,'YT-$1').replace(/^YG(\d)/,'YG-$1');

      const toya = toyaByModel.get(compact(deviceIndex));
      const brand = brandFrom(partIndex, deviceIndex, get(o, ['Marka / seria','Marka']));
      const position = inferPosition(partIndex, get(o, ['Pozycja z rysunku','Pozycja']));
      const partName = titleCase(partNameRaw);
      const category = toya?.category || get(o, ['Marka / seria','Kategoria']) || 'Części pogwarancyjne';
      const deviceName = toya?.productName || get(o, ['Nazwa rysunku / pliku','Nazwa rysunku'])?.replace(/Czesci_zamienne_|\.pdf/gi,'') || `Urządzenie ${deviceIndex}`;
      const drawingId = drawingIdFor(deviceIndex);
      const id = `${compact(deviceIndex)}-${compact(partIndex)}-${compact(position || 'x')}`;
      if(seen.has(id)) return;
      seen.add(id);

      const alias = get(o, ['Alias / indeks alternatywny','Alias']);
      const availability = get(o, ['Status dostępności','Status dostepnosci','Ocena dostępności','Ocena dostepnosci']) || 'Do potwierdzenia przez serwis';
      const drawingLink = get(o, ['Link do rysunku']) || toya?.partsPdfUrl || toya?.driveBackupUrl || '';
      parts.push({
        id,
        public: true,
        deviceIndex,
        deviceName,
        brand,
        category,
        partIndex,
        aliasIndex: alias,
        partName,
        position,
        drawingId,
        availability,
        source: 'live-google-sheet',
        drawingUrl: drawingLink,
        keywords: [deviceIndex, deviceName, brand, category, partIndex, alias, partName, position].filter(Boolean).join(' ')
      });
    });
    return parts;
  }

  function buildDrawings(parts, toyaEntries, existingDrawings){
    const map = new Map((existingDrawings || []).map(d => [compact(d.deviceIndex || d.id), d]));
    (toyaEntries || []).forEach(e => {
      const key = compact(e.deviceIndex);
      const id = drawingIdFor(e.deviceIndex);
      const prev = map.get(key) || map.get(compact(id));
      map.set(key, {
        ...(prev || {}),
        id: prev?.id || id,
        deviceIndex: e.deviceIndex,
        brand: e.brand || prev?.brand || 'TOYA',
        title: e.partsPdfUrl ? `Części zamienne ${e.deviceIndex}` : (e.productName || `Rysunek ${e.deviceIndex}`),
        type: e.partsPdfUrl ? 'toya24-pdf' : (e.driveBackupUrl ? 'drive-backup' : (prev?.type || 'placeholder')),
        status: e.partsPdfUrl ? 'toya24_primary' : (e.driveBackupUrl ? 'drive_backup' : 'todo'),
        toya24ProductUrl: e.productUrl || prev?.toya24ProductUrl,
        toya24PartsPdfUrl: e.partsPdfUrl || prev?.toya24PartsPdfUrl,
        driveViewUrl: e.driveBackupUrl || prev?.driveViewUrl,
        drivePreviewUrl: prev?.drivePreviewUrl || (e.driveBackupUrl && e.driveBackupUrl.includes('/file/d/') ? e.driveBackupUrl.replace('/view','/preview') : '')
      });
    });
    parts.forEach(p => {
      const key = compact(p.deviceIndex);
      if(!map.has(key)) {
        map.set(key, { id: p.drawingId, deviceIndex: p.deviceIndex, brand: p.brand, title: `Rysunek ${p.deviceIndex}`, type: 'placeholder', status: 'todo' });
      }
    });
    return Array.from(map.values());
  }

  async function fetchText(url){
    const res = await fetch(url, { cache: 'no-store' });
    if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const txt = await res.text();
    if(/<html|doctype/i.test(txt.slice(0,300))) throw new Error('CSV niedostępny — arkusz prawdopodobnie nie jest publiczny/published');
    return txt;
  }

  function setStatus(text, kind='info'){
    let el = document.getElementById('liveCatalogStatus');
    if(!el){
      const anchor = document.getElementById('results') || document.getElementById('searchInput');
      if(!anchor) return;
      el = document.createElement('div');
      el.id = 'liveCatalogStatus';
      el.className = 'live-catalog-status';
      anchor.parentNode.insertBefore(el, anchor);
    }
    el.className = `live-catalog-status ${kind}`;
    el.innerHTML = text;
  }

  function apply(catalog, api){
    const staticParts = api.getParts ? api.getParts() : (window.PGW_PARTS || []);
    const staticDrawings = api.getDrawings ? api.getDrawings() : (window.PGW_DRAWINGS || []);
    const mergedById = new Map();
    [...staticParts, ...catalog.parts].forEach(p => mergedById.set(p.id, p));
    const parts = Array.from(mergedById.values());
    const toyaEntries = catalog.toyaEntries || [];
    const oldToya = window.PGW_TOYA24_INDEX?.entries || [];
    const toyaMap = new Map();
    [...oldToya, ...toyaEntries].forEach(e => toyaMap.set(compact(e.deviceIndex), e));
    const finalToyaEntries = Array.from(toyaMap.values());
    const drawings = buildDrawings(parts, finalToyaEntries, staticDrawings);

    window.PGW_TOYA24_INDEX = { ...(window.PGW_TOYA24_INDEX || {}), sheetName: 'TOYA24 integracja + Baza części', entries: finalToyaEntries };
    window.PGW_DATABASE_META = {
      ...(window.PGW_DATABASE_META || {}),
      generatedAt: new Date().toISOString().slice(0,10),
      partsCount: parts.filter(p => p.public !== false).length,
      devicesCount: new Set(parts.map(p => p.deviceIndex).filter(Boolean)).size,
      source: ['live Google Sheet', 'Baza części', 'TOYA24 integracja']
    };
    api.setParts?.(parts);
    api.setDrawings?.(drawings);
    api.refresh?.();
    return {parts, drawings, toyaEntries: finalToyaEntries};
  }

  async function loadFresh(){
    const [toyaCsv, partsCsv] = await Promise.all([fetchText(csvUrl(CONFIG.toya24Gid)), fetchText(csvUrl(CONFIG.partsGid))]);
    const toyaRows = parseCsv(toyaCsv);
    const partsRows = parseCsv(partsCsv);
    const toyaEntries = parseToya24(toyaRows);
    const parts = parseParts(partsRows, toyaEntries);
    const catalog = { createdAt: Date.now(), parts, toyaEntries };
    try { localStorage.setItem(CONFIG.cacheKey, JSON.stringify(catalog)); } catch {}
    return catalog;
  }

  function loadCache(){
    try {
      const raw = localStorage.getItem(CONFIG.cacheKey);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(!data?.createdAt || Date.now() - data.createdAt > CONFIG.cacheMs) return null;
      return data;
    } catch { return null; }
  }

  async function start(api={}){
    setStatus('Ładuję katalog z arkusza PGW…', 'loading');
    const cached = loadCache();
    if(cached?.parts?.length){
      const applied = apply(cached, api);
      setStatus(`Katalog z cache: <b>${applied.parts.length}</b> części / <b>${new Set(applied.parts.map(p=>p.deviceIndex)).size}</b> modeli. Odświeżam w tle z arkusza…`, 'ok');
    }
    try {
      const fresh = await loadFresh();
      const applied = apply(fresh, api);
      setStatus(`Katalog live z arkusza: <b>${applied.parts.length}</b> części / <b>${new Set(applied.parts.map(p=>p.deviceIndex)).size}</b> modeli. TOYA24 jako źródło PDF, Drive jako backup.`, 'ok');
    } catch(err){
      if(!cached){
        setStatus(`Nie udało się pobrać arkusza live. Działa katalog wbudowany w repo. <small>${esc(err.message || err)}</small>`, 'warn');
      } else {
        setStatus(`Arkusz live chwilowo niedostępny — pracuję na cache. <small>${esc(err.message || err)}</small>`, 'warn');
      }
    }
  }

  window.PGWLiveSheet = { start, CONFIG };
})();
