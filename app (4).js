(() => {
  'use strict';
  const CONFIG = window.PGW_CONFIG || {};
  const DRAFT_KEY = 'pgw-v57-draft';
  const THEME_KEY = 'pgw-theme';
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
    lookupNip: $('lookupNip'), lookupStatus: $('lookupStatus'), zipStatus: $('zipStatus'), shipZipStatus: $('shipZipStatus'), formHint: $('formHint'), manualPartsBox: $('manualPartsBox'), manualPartsFieldset: $('manualPartsFieldset'), goManualData: $('goManualData'), draftMailPreview: $('draftMailPreview'), showMoreParts: $('showMoreParts'), mobileSummaryBar: $('mobileSummaryBar'), mobileSummaryText: $('mobileSummaryText'), mobileGoData: $('mobileGoData'), focusParts: $('focusParts'), focusPdf: $('focusPdf'), contactQuality: $('contactQuality'), invoiceQuality: $('invoiceQuality'), shippingQuality: $('shippingQuality'), finalChecklist: $('finalChecklist'), themeToggle: $('themeToggle'), themeIcon: $('themeIcon'), themeLabel: $('themeLabel'), brandFilter: $('brandFilter'), dataMonitor: $('dataMonitor'), monitorBrands: $('monitorBrands'), monitorDrive: $('monitorDrive'), monitorFilter: $('monitorFilter'), monitorBrandList: $('monitorBrandList')
  };
  const progressIds = ['pDevice','pDrawing','pParts','pData','pMail'];

  const state = {
    devices: [], drawings: [], parts: [], driveMap: [], brandOverrides: {}, pdfHeaderOverrides: {}, universalParts: [], universalPartLinks: [], partAssemblies: {},
    drawingById: new Map(), partsByDrawing: new Map(), driveByDrawingId: new Map(), driveByKey: new Map(), zunByPartKey: new Map(), zunByCode: new Map(), partAssemblyComponents: new Map(), partAssemblyChildren: new Map(),
    selectedDevice: null, selectedDrawing: null, selectedParts: new Map(), manualMode: false, step: 1, formDirty: false,
    postalCodes: new Map(), partVisibleLimit: PART_ROW_LIMIT, activeBrand: 'all', brandSummary: []
  };

  const POSTAL_FALLBACK = {
    '00-001': 'Warszawa', '00-002': 'Warszawa', '01-001': 'Warszawa',
    '30-001': 'Kraków', '31-357': 'Kraków', '50-001': 'Wrocław',
    '60-001': 'Poznań', '80-001': 'Gdańsk', '90-001': 'Łódź',
    '40-001': 'Katowice', '43-300': 'Bielsko-Biała', '20-001': 'Lublin'
  };


  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    initTheme();
    try {
      setStatus('Ładowanie katalogu…');
      const urls = CONFIG.dataUrls || {};
      state.devices = await loadFirst(urls.devices || ['data/devices.json'], []);
      state.universalParts = await loadFirst(urls.universalParts || ['data/universal-parts-zun.json'], []);
      state.universalPartLinks = await loadFirst(urls.universalPartLinks || ['data/universal-parts-zun-links.json'], []);
      state.partAssemblies = await loadFirst(urls.partAssemblies || ['data/part-assemblies.v57.json'], {});
      state.drawings = await loadFirst(urls.drawings || ['data/drawings.json'], []);
      state.parts = await loadFirst(urls.parts || ['data/parts.json'], []);
      state.driveMap = await loadFirst(urls.driveMap || ['data/drive-drawings-map.json'], []);
      state.brandOverrides = await loadFirst(urls.brandOverrides || ['data/brand-resolution-overrides.json'], {});
      state.pdfHeaderOverrides = await loadFirst(urls.pdfHeaderOverrides || ['data/pdf-header-overrides.json'], {});
      await loadPostalCodes();
      normalizeData();
      buildIndexes();
      bindEvents();
      updateOptionalSections();
      renderStats();
      renderBrandFilter();
      renderDataMonitor();
      renderExamples();
      renderContext();
      restoreDraft();
      renderDeviceResults('');
      setStatus(`Gotowe: ${fmt(state.devices.length)} urządzeń, ${fmt(state.parts.length)} części, ${fmt(state.universalParts.length)} ZUN, ${fmt((state.partAssemblies && state.partAssemblies.assemblyCount) || 0)} zestawów`, 'ok');
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
    state.universalParts = normalizeUniversalParts(state.universalParts);
    state.universalPartLinks = normalizeUniversalPartLinks(state.universalPartLinks);
    state.driveMap = arr(state.driveMap).filter(row => isPdf(row));

    for (const d of state.devices) d.brand = resolveBrand(d);
    for (const d of state.drawings) d.brand = resolveBrand(d);
    for (const p of state.parts) p.brand = resolveBrand(p);
    for (const row of state.driveMap) row.brand = resolveBrand(row);

    const driveKeys = new Set();
    for (const row of state.driveMap) {
      row.fileId = row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.id || '';
      row.fileName = row.fileName || row.title || row.name || '';
      row.deviceIndex = normalizeDeviceIndex(row.deviceIndex || row.model || row.normalizedKey || extractDeviceIndex(row.fileName || row.title || row.name || row.path));
      row.viewerUrl = row.viewerUrl || (row.fileId ? `https://drive.google.com/file/d/${encodeURIComponent(row.fileId)}/preview` : '');
      row.openUrl = row.openUrl || (row.fileId ? `https://drive.google.com/file/d/${encodeURIComponent(row.fileId)}/view` : row.url || '');
      applyPdfHeaderOverride(row);
      row.__keys = unique([row.deviceIndex, row.model, row.normalizedKey, row.fileName, row.title, row.name, row.deviceName, row.displayTitle, ...(row.keys || [])].flat().map(normKey).filter(Boolean));
      for (const k of row.__keys) driveKeys.add(k);
    }

    // v51: pełny manifest Drive może zawierać tysiące PDF-ów bez wpisu w devices.json/drawings.json.
    // Tworzymy lekkie rekordy urządzeń i rysunków z samego manifestu, żeby klient mógł wyszukać PDF
    // i przejść trybem opisowym, nawet zanim lista części zostanie spięta.
    const existingDrawingKeys = new Set(state.drawings.flatMap(d => drawingKeys(d)));
    let syntheticId = 9000000;
    for (const row of state.driveMap) {
      const keys = row.__keys || [];
      const hasDrawing = keys.some(k => existingDrawingKeys.has(k));
      if (!hasDrawing && row.deviceIndex) {
        const id = `drive-${row.fileId || normKey(row.deviceIndex) || syntheticId++}`;
        const drawing = {
          id,
          deviceIndex: row.deviceIndex,
          title: row.displayTitle || row.deviceName || row.title || row.fileName || row.deviceIndex,
          fileName: row.fileName || row.title || `${row.deviceIndex}.pdf`,
          brand: canonicalBrand(row.brand || inferBrand(row)),
          type: 'pdf',
          source: 'GOOGLE_DRIVE_FULL_MANIFEST',
          driveFileId: row.fileId,
          viewerUrl: row.viewerUrl,
          openUrl: row.openUrl,
          path: row.path || row.folderPath || ''
        };
        state.drawings.push(drawing);
        drawingKeys(drawing).forEach(k => existingDrawingKeys.add(k));
      }
    }

    state.drawings = state.drawings.filter(d => {
      const keys = drawingKeys(d);
      return keys.some(k => driveKeys.has(k));
    });
    const drawingIds = new Set(state.drawings.map(d => String(d.id)));
    state.parts = state.parts.filter(p => drawingIds.has(String(p.drawingId)) && p.partIndex && !looksLikeHeaderPart(p));
    const deviceKeys = new Set(state.drawings.map(d => norm(d.deviceIndex)).filter(Boolean));
    const existingDeviceKeys = new Set(state.devices.map(d => norm(d.deviceIndex)).filter(Boolean));
    for (const d of state.drawings) {
      const key = norm(d.deviceIndex);
      if (key && !existingDeviceKeys.has(key)) {
        state.devices.push({
          deviceIndex: d.deviceIndex,
          title: d.displayTitle || d.deviceName || d.title || d.fileName || 'Rysunek PDF z Google Drive',
          brand: canonicalBrand(d.brand || inferBrand(d)),
          source: 'GOOGLE_DRIVE_FULL_MANIFEST',
          hasPartsPdf: true,
          hasPartsList: false
        });
        existingDeviceKeys.add(key);
      }
    }
    state.devices = state.devices.filter(d => deviceKeys.has(norm(d.deviceIndex)));
    const brandByDevice = new Map();
    for (const d of state.drawings) if (d.brand) brandByDevice.set(norm(d.deviceIndex), d.brand);
    for (const d of state.devices) if (!d.brand || d.brand === 'INNE') d.brand = brandByDevice.get(norm(d.deviceIndex)) || canonicalBrand(inferBrand(d));
    for (const p of state.parts) if (!p.brand || p.brand === 'INNE') p.brand = brandByDevice.get(norm(p.deviceIndex)) || canonicalBrand(inferBrand(p));
  }


  function applyPdfHeaderOverride(row) {
    if (!row) return;
    const overrides = (state.pdfHeaderOverrides && state.pdfHeaderOverrides.byFileId) ? state.pdfHeaderOverrides.byFileId : (state.pdfHeaderOverrides || {});
    const candidates = [
      row.fileId,
      row.driveFileId,
      row.id,
      row.normalizedModel,
      row.normalizedKey,
      row.deviceIndex,
      row.model
    ].map(x => String(x || '').trim()).filter(Boolean);
    let found = null;
    for (const key of candidates) {
      if (overrides[key]) { found = overrides[key]; break; }
      const nk = normKey(key);
      if (overrides[nk]) { found = overrides[nk]; break; }
    }
    if (!found) return;
    row.pdfHeader = found.headerText || found.rawHeader || row.pdfHeader || '';
    row.deviceName = found.deviceName || found.extractedDeviceName || row.deviceName || '';
    row.displayTitle = found.displayTitle || (row.deviceName ? `${row.deviceIndex || row.model || ''} — ${row.deviceName}`.replace(/^\s*—\s*/, '') : '') || row.displayTitle || '';
    if (found.brand && (!row.brand || row.brand === 'NIEZNANA' || row.brand === 'DO ROZPOZNANIA')) row.brand = found.brand;
    row.headerConfidence = found.confidence || row.headerConfidence || '';
    row.headerSource = found.source || 'pdf-header-overrides';
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
    state.zunByCode = new Map((state.universalParts || []).map(z => [String(z.zun || '').toUpperCase(), z]));
    state.zunByPartKey = new Map();
    for (const link of state.universalPartLinks || []) {
      const key = normalizePartKey(link.partIndex);
      if (!key || !link.zun) continue;
      if (!state.zunByPartKey.has(key)) state.zunByPartKey.set(key, []);
      state.zunByPartKey.get(key).push(link);
    }
    // Fallback: summary ZUN file also contains linkedPartIndexes. It gives us coverage even if the row-level links file is missing.
    for (const z of state.universalParts || []) {
      for (const idx of z.linkedPartIndexes || []) {
        const key = normalizePartKey(idx);
        if (!key || state.zunByPartKey.has(key)) continue;
        state.zunByPartKey.set(key, [{
          partIndex: idx,
          zun: z.zun,
          name: z.namePl || z.name || '',
          spec: z.spec || '',
          dimensionsCm: z.dimensionsCm || '',
          linkedModel: '',
          source: 'universal-parts-zun-summary'
        }]);
      }
    }
    buildPartAssemblyIndexes();
    for (const d of state.devices) d.__search = norm([d.deviceIndex, d.title, d.name, d.brand, d.deviceName, d.displayTitle].join(' '));
    for (const p of state.parts) p.__search = norm([p.position, p.partIndex, p.namePl, p.nameEn, p.drawingTitle, p.deviceIndex, p.brand].join(' '));
  }

  function buildPartAssemblyIndexes() {
    state.partAssemblyComponents = new Map();
    state.partAssemblyChildren = new Map();
    const rel = state.partAssemblies || {};
    const componentsByPartId = rel.componentsByPartId || {};
    const assembliesByPartId = rel.assembliesByPartId || {};
    Object.entries(componentsByPartId).forEach(([partId, rows]) => {
      state.partAssemblyComponents.set(String(partId), arr(rows));
    });
    Object.entries(assembliesByPartId).forEach(([partId, rows]) => {
      state.partAssemblyChildren.set(String(partId), arr(rows));
    });
  }

  function getAssemblyParentsForPart(part) {
    if (!part || !part.id) return [];
    return state.partAssemblyComponents.get(String(part.id)) || [];
  }

  function getAssemblyChildrenForPart(part) {
    if (!part || !part.id) return [];
    return state.partAssemblyChildren.get(String(part.id)) || [];
  }

  function formatAssemblyInline(part) {
    const parents = getAssemblyParentsForPart(part);
    if (!parents.length) return '';
    const labels = unique(parents.map(a => a.assemblyPartIndex).filter(Boolean));
    return labels.length ? ` • składnik kompletu: ${labels.join(', ')}` : '';
  }

  function assemblyNoticeHtml(part) {
    const parents = getAssemblyParentsForPart(part);
    const children = getAssemblyChildrenForPart(part);
    if (parents.length) {
      const first = parents[0];
      const labels = unique(parents.map(a => `${a.assemblyPartIndex || ''}${a.assemblyNamePl ? ` — ${a.assemblyNamePl}` : ''}`).filter(Boolean));
      return `<div class="assembly-notice"><strong>Uwaga serwisowa:</strong> ta część jest składnikiem kompletu ${escapeHtml(labels.join(', '))}. W mailu dopiszę prośbę o sprawdzenie dostępności części pojedynczej i kompletu.</div>`;
    }
    if (children.length) {
      const preview = children.slice(0, 6).map(c => `${c.position || '-'}: ${c.partIndex || ''}`).join(', ');
      const more = children.length > 6 ? ` +${children.length - 6}` : '';
      return `<div class="assembly-notice assembly-kit"><strong>Komplet/zestaw:</strong> zawiera pozycje ${escapeHtml(preview + more)}. W mailu dopiszę, że klient wybrał element zmontowany.</div>`;
    }
    return '';
  }

  function getAssemblyHintsForSelectedParts(items) {
    const out = [];
    const seen = new Set();
    for (const item of items || []) {
      const part = item.part || item;
      for (const a of getAssemblyParentsForPart(part)) {
        const key = `${part.id}|${a.assemblyId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          type: 'component-of-assembly',
          requestedPartIndex: part.partIndex || '',
          requestedPosition: part.position || '',
          requestedName: part.namePl || part.nameEn || '',
          assemblyPartIndex: a.assemblyPartIndex || '',
          assemblyPosition: a.assemblyPosition || '',
          assemblyName: a.assemblyNamePl || a.assemblyNameEn || '',
          confidence: a.confidence || 'wysoka'
        });
      }
      const children = getAssemblyChildrenForPart(part);
      if (children.length) {
        const key = `${part.id}|assembly-selected`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({
            type: 'assembly-selected',
            assemblyPartIndex: part.partIndex || '',
            assemblyPosition: part.position || '',
            assemblyName: part.namePl || part.nameEn || '',
            components: children.map(c => `${c.position || '-'} ${c.partIndex || ''} ${c.namePl || c.nameEn || ''}`.trim()),
            confidence: 'wysoka'
          });
        }
      }
    }
    return out;
  }

  function formatAssemblyServiceBlock(hints) {
    if (!hints || !hints.length) return '';
    const lines = ['Informacja dla serwisu — zestawy/komplety z rysunku:'];
    hints.forEach((h, i) => {
      if (h.type === 'component-of-assembly') {
        lines.push(`${i + 1}. Wybrana część ${h.requestedPartIndex} — poz. ${h.requestedPosition} — ${h.requestedName || '-'} jest składnikiem kompletu ${h.assemblyPartIndex} — poz. ${h.assemblyPosition} — ${h.assemblyName || '-'}. Proszę sprawdzić dostępność obu wariantów: elementu pojedynczego oraz kompletnego zestawu.`);
      } else {
        const comps = (h.components || []).slice(0, 10).join('; ');
        lines.push(`${i + 1}. Wybrano komplet ${h.assemblyPartIndex} — poz. ${h.assemblyPosition} — ${h.assemblyName || '-'}. Składniki wg rysunku: ${comps}${(h.components || []).length > 10 ? '; ...' : ''}.`);
      }
    });
    return lines.join('\n');
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
    if (els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);
    if (els.brandFilter) els.brandFilter.addEventListener('click', (event) => {
      const btn = event.target.closest('button[data-brand]');
      if (!btn) return;
      state.activeBrand = btn.dataset.brand || 'all';
      renderBrandFilter();
      renderDataMonitor();
      renderDeviceResults(els.deviceSearch.value);
      saveDraft();
    });
  }

  function renderStats() {
    els.statDevices.textContent = fmt(state.devices.length);
    els.statDrawings.textContent = fmt(state.drawings.length);
    els.statParts.textContent = fmt(state.parts.length + (state.universalParts || []).length);
  }

  function renderBrandFilter() {
    if (!els.brandFilter) return;
    const counts = new Map();
    for (const d of state.devices) {
      const brand = canonicalBrand(d.brand || inferBrand(d));
      counts.set(brand, (counts.get(brand) || 0) + 1);
    }
    state.brandSummary = [...counts.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'));
    const buttons = [['all', 'Wszystkie', state.devices.length], ...state.brandSummary];
    els.brandFilter.innerHTML = buttons.map(([value, label, count]) => {
      const active = state.activeBrand === value;
      return `<button type="button" class="brand-chip ${active ? 'active' : ''}" data-brand="${escapeAttr(value)}"><span>${escapeHtml(label)}</span><b>${fmt(count)}</b></button>`;
    }).join('');
  }

  function renderDataMonitor() {
    if (!els.dataMonitor) return;
    const brandCount = new Set(state.devices.map(d => canonicalBrand(d.brand || inferBrand(d)))).size;
    const drivePdf = state.driveMap.filter(row => row.fileId || row.viewerUrl || row.openUrl).length;
    if (els.monitorBrands) els.monitorBrands.textContent = fmt(brandCount);
    if (els.monitorDrive) els.monitorDrive.textContent = fmt(drivePdf);
    if (els.monitorFilter) els.monitorFilter.textContent = state.activeBrand === 'all' ? 'Wszystkie' : state.activeBrand;
    if (els.monitorBrandList) {
      els.monitorBrandList.innerHTML = (state.brandSummary || []).slice(0, 8).map(([brand,count]) => `<span>${escapeHtml(brand)} <b>${fmt(count)}</b></span>`).join('') || '<span>Brak danych marek</span>';
    }
  }

  function renderExamples() {
    const examples = state.devices.filter(d => brandMatches(d.brand)).slice(0, 5).map(d => d.deviceIndex).filter(Boolean);
    els.quickExamples.innerHTML = examples.map(x => `<button type="button" data-q="${escapeAttr(x)}">${escapeHtml(x)}</button>`).join('');
    els.quickExamples.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
      els.deviceSearch.value = btn.dataset.q;
      renderDeviceResults(btn.dataset.q);
    }));
  }


  function normalizeUniversalParts(source) {
    const root = Array.isArray(source) ? source : (source && Array.isArray(source.items) ? source.items : []);
    return root.map((p, i) => {
      const zun = String(p.zun || p.partIndex || '').trim().toUpperCase();
      const name = String(p.name || (p.names && p.names[0]) || '').trim();
      const spec = String(p.spec || (p.specs && p.specs[0]) || '').trim();
      const linkedModels = arr(p.linkedModels).map(x => String(x || '').trim()).filter(Boolean);
      const linkedPartIndexes = arr(p.linkedPartIndexes).map(x => String(x || '').trim()).filter(Boolean);
      const brands = arr(p.brands).map(x => canonicalBrand(x)).filter(Boolean);
      const searchText = [
        zun, name, spec, p.material || '', p.dimensionsCm || '',
        linkedModels.join(' '), linkedPartIndexes.join(' '), brands.join(' ')
      ].join(' ');
      return {
        ...p,
        id: p.id || `zun-${zun || i}`,
        zun,
        partIndex: zun,
        namePl: name,
        nameEn: '',
        spec,
        position: 'UNI',
        linkedModels,
        linkedPartIndexes,
        brands: unique(brands),
        __search: norm(searchText)
      };
    }).filter(p => p.zun);
  }

  function normalizeUniversalPartLinks(source) {
    const root = Array.isArray(source) ? source : (source && Array.isArray(source.links) ? source.links : []);
    return root.map((link, i) => {
      const zun = String(link.zun || '').trim().toUpperCase();
      const partIndex = String(link.partIndex || link.index || '').trim().toUpperCase();
      const zunSummary = (state.universalParts || []).find(z => z.zun === zun) || {};
      return {
        ...link,
        id: link.id || `zun-link-${i}`,
        zun,
        partIndex,
        partKey: normalizePartKey(partIndex),
        name: String(link.name || zunSummary.namePl || zunSummary.name || '').trim(),
        spec: String(link.spec || zunSummary.spec || '').trim(),
        dimensionsCm: String(link.dimensionsCm || zunSummary.dimensionsCm || '').trim(),
        linkedModel: String(link.linkedModel || '').trim(),
        linkedModelBrand: canonicalBrand(link.linkedModelBrand || (zunSummary.brands && zunSummary.brands[0]) || ''),
        linkedDrawingPreviewUrl: link.linkedDrawingPreviewUrl || '',
        source: link.source || 'stan na 2026.05.29.xlsm'
      };
    }).filter(link => link.zun && link.partKey);
  }

  function normalizePartKey(value) {
    return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  }

  function getAutoZunMatchesForPart(part) {
    if (!part || part.isUniversalZun) return [];
    const keys = unique([
      part.partIndex, part.index, part.sapIndex, part.indeks,
      String(part.partIndex || '').replace(/^Z(Y)?/i, ''),
      part.namePl, part.nameEn
    ].map(normalizePartKey).filter(Boolean));
    const out = [];
    const seen = new Set();
    for (const key of keys) {
      const direct = state.zunByPartKey.get(key) || [];
      for (const link of direct) {
        const zun = state.zunByCode.get(link.zun) || {};
        const dedupe = `${link.zun}|${normalizePartKey(link.partIndex)}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        out.push({
          matchType: 'exact-part-index',
          confidence: 'wysoka',
          zun: link.zun,
          sourcePartIndex: link.partIndex || part.partIndex || '',
          requestedPartIndex: part.partIndex || '',
          name: link.name || zun.namePl || zun.name || '',
          spec: link.spec || zun.spec || '',
          dimensionsCm: link.dimensionsCm || zun.dimensionsCm || '',
          linkedModel: link.linkedModel || '',
          linkedModelBrand: link.linkedModelBrand || '',
          source: link.source || 'stan na 2026.05.29.xlsm'
        });
      }
    }
    // Jeżeli indeks części z rysunku nie istnieje w „stan na…”, próbujemy ostrożnie po nazwie/specyfikacji.
    // To nie jest twarde potwierdzenie — w mailu oznaczamy to jako „średnia/niska” pewność.
    if (!out.length) {
      for (const soft of getSoftZunMatchesForPart(part)) {
        const dedupe = `${soft.zun}|soft`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        out.push(soft);
      }
    }
    return out;
  }

  function getSoftZunMatchesForPart(part) {
    const text = [part.partIndex, part.namePl, part.nameEn].join(' ');
    const tokens = getDistinctiveZunTokens(text);
    if (!tokens.length) return [];
    const partNorm = norm(text);
    const results = [];
    for (const z of state.universalParts || []) {
      const zText = [z.zun, z.namePl, z.name, z.spec, z.dimensionsCm, z.searchText].join(' ');
      const zNorm = norm(zText);
      let score = 0;
      const matched = [];
      for (const t of tokens) {
        if (t && zNorm.includes(t)) { score += t.length >= 4 ? 80 : 35; matched.push(t); }
      }
      const isBearing = partNorm.includes('lozysk') || partNorm.includes('łożysk');
      const isOring = partNorm.includes('oring') || partNorm.includes('o ring') || partNorm.includes('o-ring');
      if (isBearing && (zNorm.includes('lozysk') || zNorm.includes('łożysk'))) score += 40;
      if (isOring && (zNorm.includes('oring') || zNorm.includes('o ring') || zNorm.includes('o-ring'))) score += 40;
      // Bez jednoznacznego tokenu typu 607 2Z / 6805 / wymiar O-ringu nie zgadujemy, bo „śruba” czy „sprężyna” zrobiłyby kaszanę.
      if (score >= 90 && matched.length) {
        results.push({
          matchType: 'name-spec-heuristic',
          confidence: score >= 130 ? 'średnia' : 'niska',
          zun: z.zun,
          sourcePartIndex: 'dopasowanie po nazwie/specyfikacji',
          requestedPartIndex: part.partIndex || '',
          name: z.namePl || z.name || '',
          spec: z.spec || '',
          dimensionsCm: z.dimensionsCm || '',
          linkedModel: (z.linkedModels || [])[0] || '',
          linkedModelBrand: (z.brands || [])[0] || '',
          source: 'stan na 2026.05.29.xlsm / heurystyka nazwy',
          matchedTokens: matched
        });
      }
    }
    return results.sort((a,b) => confidenceRank(b.confidence) - confidenceRank(a.confidence)).slice(0, 3);
  }

  function getDistinctiveZunTokens(text) {
    const src = String(text || '').toUpperCase().replace(',', '.');
    const out = [];
    const pushMatches = (regex) => {
      const m = src.match(regex) || [];
      for (const x of m) {
        const cleaned = norm(String(x).replace(/Ø/g, 'ø'));
        if (cleaned && cleaned.length >= 3) out.push(cleaned);
      }
    };
    pushMatches(/\b6\d{2,4}\s*(?:2Z|2RS|RS|ZZ)?\b/g);       // 606 2Z, 607 2RS, 6805
    pushMatches(/\b\d{3,5}\s*(?:2Z|2RS|RS|ZZ)\b/g);         // 607 2Z bez prefixu 6xxx
    pushMatches(/(?:Ø|ø)?\d+(?:\.\d+)?\s*[X×/]\s*\d+(?:\.\d+)?(?:\s*[X×/]\s*\d+(?:\.\d+)?)?/g); // wymiary
    return unique(out);
  }

  function confidenceRank(value) {
    value = String(value || '').toLowerCase();
    if (value.includes('wysoka')) return 3;
    if (value.includes('śred') || value.includes('sred')) return 2;
    return 1;
  }

  function getZunHintsForSelectedParts(items) {
    const hints = [];
    const seen = new Set();
    for (const item of items || []) {
      const part = item.part || {};
      if (part.isUniversalZun) {
        const key = `${part.zun}|selected`;
        if (seen.has(key)) continue;
        seen.add(key);
        hints.push({
          kind: 'selected-zun',
          part,
          qty: item.qty,
          matches: [{
            zun: part.zun || part.partIndex,
            confidence: 'bezpośrednio wybrane',
            name: part.namePl || '',
            spec: part.spec || '',
            sourcePartIndex: part.partIndex || '',
            source: 'stan na 2026.05.29.xlsm'
          }]
        });
        continue;
      }
      const matches = getAutoZunMatchesForPart(part);
      if (!matches.length) continue;
      const uniqueMatches = matches.filter(m => {
        const key = `${part.partIndex}|${m.zun}|${m.sourcePartIndex}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (uniqueMatches.length) hints.push({kind: 'auto-zun', part, qty: item.qty, matches: uniqueMatches});
    }
    return hints;
  }

  function formatZunInline(matches) {
    if (!matches || !matches.length) return '';
    const codes = unique(matches.map(m => m.zun).filter(Boolean));
    return codes.length ? ` — ZUN: ${codes.join(', ')}` : '';
  }

  function formatZunServiceBlock(hints) {
    if (!hints || !hints.length) return '';
    const lines = [];
    lines.push('Informacja dla serwisu — ZUN-y dopasowane automatycznie ze „stan na 2026.05.29”:');
    let n = 1;
    for (const hint of hints) {
      const part = hint.part || {};
      for (const m of hint.matches || []) {
        const details = [m.name, m.spec, m.dimensionsCm].filter(Boolean).join(' / ');
        const modelInfo = m.linkedModel ? `; model z bazy ZUN: ${m.linkedModel}${m.linkedModelBrand ? ' / ' + m.linkedModelBrand : ''}` : '';
        const selectedIndex = part.partIndex || part.zun || 'brak indeksu';
        lines.push(`${n++}. ${m.zun} — dla wybranej części ${selectedIndex}${details ? ` — ${details}` : ''}; pewność: ${m.confidence || 'wysoka'}${modelInfo}`);
      }
    }
    lines.push('Uwaga: ZUN jest informacją pomocniczą dla obsługi. Proszę finalnie potwierdzić zgodność w SAP/stanach przed wyceną.');
    return lines.join('\n');
  }

  function getZunResults(tokens) {
    if (!tokens.length || !state.universalParts || !state.universalParts.length) return [];
    // Klient nie musi znać ZUN-ów. Wyniki ZUN pokazujemy tylko wtedy, gdy ktoś świadomie wpisze ZUN,
    // indeks części albo techniczną nazwę typu łożysko/O-ring. Samo wpisanie modelu urządzenia nie zasypuje go ZUN-ami.
    if (!isExplicitZunLookup(tokens)) return [];
    return state.universalParts.map(part => {
      let score = 0;
      const zunNorm = norm(part.zun);
      const zunFlat = norm(String(part.zun).replace(/[-\s]/g,''));
      for (const t of tokens) {
        const tf = t.replace(/[-\s]/g,'');
        if (zunNorm === t || zunFlat === tf) score += 250;
        else if (zunNorm.includes(t) || zunFlat.includes(tf)) score += 160;
        if (part.__search.includes(t)) score += 55;
        if ((part.linkedModels || []).some(m => norm(m).includes(t) || norm(String(m).replace(/-/g,'')).includes(tf))) score += 90;
        if ((part.linkedPartIndexes || []).some(x => norm(x).includes(t) || norm(String(x).replace(/-/g,'')).includes(tf))) score += 90;
      }
      return {part, score};
    }).filter(x => x.score > 0).sort((a,b) => b.score - a.score || b.part.linkedPartCount - a.part.linkedPartCount).slice(0, 12);
  }

  function isExplicitZunLookup(tokens) {
    const text = norm((tokens || []).join(' '));
    if (!text) return false;
    if ((tokens || []).some(t => t.startsWith('zun') || /^z[a-z]?\d{3,}/i.test(t))) return true;
    return /(lozysk|łożysk|oring|o ring|o-ring|szczotk|wlacznik|włącznik|uszczelniacz|o\s?ring)/.test(text);
  }

  function renderZunCards(zunResults) {
    if (!zunResults.length) return '';
    return `<div class="zun-results-block">
      <div class="zun-results-head"><strong>Części uniwersalne ZUN ze „stan na…”</strong><span>${fmt(zunResults.length)} dopasowań</span></div>
      ${zunResults.map(({part}) => {
        const models = (part.linkedModels || []).slice(0, 6).join(', ');
        const more = (part.linkedModels || []).length > 6 ? ` +${(part.linkedModels || []).length - 6}` : '';
        const brands = (part.brands || []).slice(0, 4).join(', ');
        return `<article class="device-card zun-card">
          <div>
            <h3>${escapeHtml(part.zun)}</h3>
            <p>${escapeHtml(part.namePl || 'Część uniwersalna')}${part.spec ? ` • ${escapeHtml(part.spec)}` : ''}</p>
            <div class="badges">
              <span class="badge ok">ZUN / część uniwersalna</span>
              <span class="badge">${fmt(part.linkedPartCount || 0)} indeksów części</span>
              <span class="badge">${fmt((part.linkedModels || []).length)} urządzeń</span>
              ${brands ? `<span class="badge brand">${escapeHtml(brands)}</span>` : ''}
            </div>
            ${models ? `<p class="small-muted">Pasuje wg „stan na…” m.in.: ${escapeHtml(models)}${escapeHtml(more)}</p>` : ''}
          </div>
          <button class="primary" type="button" data-zun="${escapeAttr(part.zun)}">Dodaj ZUN</button>
        </article>`;
      }).join('')}
    </div>`;
  }

  function selectZunPart(zunCode) {
    const part = (state.universalParts || []).find(p => p.zun === zunCode);
    if (!part) return;
    const synthetic = {
      id: part.id || `zun-${part.zun}`,
      partIndex: part.zun,
      namePl: `${part.namePl || 'Część uniwersalna'}${part.spec ? ' — ' + part.spec : ''}`,
      nameEn: '',
      position: 'UNI',
      zun: part.zun,
      linkedModels: part.linkedModels || [],
      linkedPartIndexes: part.linkedPartIndexes || [],
      isUniversalZun: true
    };
    state.manualMode = true;
    state.selectedDevice = {
      deviceIndex: part.zun,
      title: `część uniwersalna — ${part.namePl || ''}`,
      brand: (part.brands && part.brands[0]) || 'DO POTWIERDZENIA',
      source: 'STAN_NA_ZUN'
    };
    state.selectedDrawing = null;
    state.selectedParts.clear();
    state.selectedParts.set(synthetic.id, {part: synthetic, qty: 1});
    state.partVisibleLimit = PART_ROW_LIMIT;
    if (els.partsSearch) els.partsSearch.value = '';
    renderDeviceResults(els.deviceSearch.value);
    renderSelectedDevice();
    renderParts();
    renderBasket();
    renderViewer(false);
    updateOptionalSections();
    goStep(2);
    saveDraft();
  }

  function renderDeviceResults(query) {
    const q = norm(query);
    const tokens = q.split(/\s+/).filter(Boolean);
    const zunResults = getZunResults(tokens);
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
    }).filter(x => x.drawings.length > 0 && brandMatches(x.device.brand) && (!tokens.length || x.score > 0));
    results.sort((a,b) => b.score - a.score || b.partCount - a.partCount || String(a.device.deviceIndex).localeCompare(String(b.device.deviceIndex)));
    results = results.slice(0, tokens.length ? 30 : 12);

    const zunText = zunResults.length ? ` Dodatkowo znaleziono ${fmt(zunResults.length)} części ZUN.` : '';
    els.deviceMeta.textContent = tokens.length ? `Znaleziono ${fmt(results.length)} pasujących urządzeń${state.activeBrand !== 'all' ? ' dla marki ' + state.activeBrand : ''}.${zunText}` : `Najpierw wybierz urządzenie. ${state.activeBrand !== 'all' ? 'Aktywny filtr: ' + state.activeBrand + '. ' : ''}Poniżej kilka przykładów z aktualnej bazy.`;
    const zunHtml = renderZunCards(zunResults);
    if (!results.length && !zunResults.length) {
      const typed = String(els.deviceSearch.value || '').trim();
      els.deviceResults.innerHTML = `<div class="empty-state manual-empty"><strong>Brak wyniku w aktualnej bazie.</strong><p>Spróbuj wpisać sam numer modelu, ZUN albo indeks części.</p><p>Jeżeli modelu nadal nie ma, klient może przejść dalej i opisać część ręcznie.</p><button class="primary" type="button" id="startManualRequest">Nie znalazłem urządzenia — napisz zapytanie ręczne</button></div>`;
      const btn = $('startManualRequest');
      if (btn) btn.addEventListener('click', () => startManualRequest(typed));
      return;
    }
    const deviceHtml = results.map(({device, drawings, partCount}) => `
      <article class="device-card ${state.selectedDevice && norm(state.selectedDevice.deviceIndex) === norm(device.deviceIndex) ? 'selected' : ''}">
        <div>
          <h3>${escapeHtml(device.deviceIndex || 'Bez indeksu')}</h3>
          <p>${escapeHtml(device.title || device.name || 'Urządzenie z bazą rysunku PDF')}</p>
          <div class="badges"><span class="badge brand">${escapeHtml(canonicalBrand(device.brand || inferBrand(device)))}</span><span class="badge ok">PDF Drive</span><span class="badge">${fmt(drawings.length)} rys.</span><span class="badge ${partCount ? '' : 'warn'}">${partCount ? fmt(partCount) + ' części' : 'PDF bez listy części'}</span></div>
        </div>
        <button class="primary" type="button" data-device="${escapeAttr(device.deviceIndex)}">Wybierz</button>
      </article>`).join('');
    els.deviceResults.innerHTML = `${zunHtml}${deviceHtml}`;
    els.deviceResults.querySelectorAll('button[data-device]').forEach(btn => btn.addEventListener('click', () => selectDevice(btn.dataset.device)));
    els.deviceResults.querySelectorAll('button[data-zun]').forEach(btn => btn.addEventListener('click', () => selectZunPart(btn.dataset.zun)));
  }
  function startManualRequest(typed) {
    const clean = String(typed || '').trim();
    state.manualMode = true;
    state.partVisibleLimit = PART_ROW_LIMIT;
    state.selectedDevice = { deviceIndex: clean || 'nie podano', title: 'zapytanie ręczne / brak spiętej listy części' };
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
    const candidateParts = drawing ? (state.partsByDrawing.get(String(drawing.id)) || []) : [];
    state.manualMode = candidateParts.length === 0;
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
      const linkInfo = drawing ? ` • Rysunek: ${escapeHtml(drawing.fileName || drawing.title || '')}` : '';
      const title = drawing ? (d.title || drawing.title || drawing.fileName || 'Rysunek z Google Drive') : (d.title || 'Zapytanie ręczne');
      const meta = drawing
        ? `Rysunek z Google Drive${linkInfo} • lista części nie jest jeszcze spięta — klient opisuje pozycję/część ręcznie.`
        : 'Tryb ręczny — klient opisuje urządzenie i część po mailu.';
      const brand = canonicalBrand(d.brand || (drawing && drawing.brand) || inferBrand(d));
      const brandText = brand && brand !== 'INNE' ? `Marka: ${escapeHtml(brand)} • ` : '';
      els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex || 'Zapytanie ręczne')} — ${escapeHtml(title)}</strong><span>${brandText}${meta}</span>`;
      return;
    }
    if (!drawing) { els.selectedDeviceBox.innerHTML = ''; return; }
    const count = (state.partsByDrawing.get(String(drawing.id)) || []).length;
    els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex)} — ${escapeHtml(d.title || drawing.title || '')}</strong><span>Marka: ${escapeHtml(canonicalBrand(d.brand || drawing.brand || inferBrand(d)))} • Rysunek: ${escapeHtml(drawing.fileName || drawing.title || '')} • ${fmt(count)} części</span>`;
  }

  function renderParts() {
    if (els.manualPartsBox) els.manualPartsBox.classList.toggle('hidden', !state.manualMode);
    if (state.manualMode) {
      if (els.showMoreParts) els.showMoreParts.classList.add('hidden');
      if (els.partMeta) els.partMeta.innerHTML = state.selectedDrawing ? '<strong>Rysunek PDF jest dostępny.</strong> Lista części nie jest jeszcze spięta z formularzem, więc klient opisuje pozycję/część ręcznie w kolejnym kroku.' : (state.selectedParts.size ? '<strong>Wybrano część uniwersalną ZUN.</strong> Klient powinien dopisać model urządzenia / zdjęcie tabliczki, żeby serwis potwierdził dopasowanie.' : '<strong>Tryb ręczny.</strong> Nie pokazujemy listy części, bo urządzenia nie ma jeszcze w bazie. Klient przechodzi dalej i opisuje potrzebną część tekstowo.');
      if (els.partsTable) els.partsTable.innerHTML = `<tr><td colspan="4">Brak spiętej listy części. Klient przechodzi dalej i opisuje pozycję z rysunku w uwagach.</td></tr>`;
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
        <td>${escapeHtml(p.namePl || p.nameEn || '')}${assemblyNoticeHtml(p)}</td>
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
        <div><strong>poz. ${escapeHtml(part.position || '-')} • ${escapeHtml(part.partIndex || '')}</strong><span>${escapeHtml(part.namePl || part.nameEn || '')}${!part.isUniversalZun && getAutoZunMatchesForPart(part).length ? ` • ZUN w mailu: ${escapeHtml(unique(getAutoZunMatchesForPart(part).map(m => m.zun)).join(', '))}` : ''}${escapeHtml(formatAssemblyInline(part))}</span>${assemblyNoticeHtml(part)}</div>
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
      3: ['Uzupełnij dane', 'Dane do faktury i wysyłki pojawiają się dopiero po wybraniu części. Nic nie jest wysyłane automatycznie.'],
      4: ['Skopiuj gotowy mail', 'Na końcu klient dostaje gotowy temat i treść do wysłania na service@yato.pl.']
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
      ? `Zapytanie o części zamienne — opis ręczny ${d.deviceIndex || ''}`.trim()
      : `Zapytanie o części zamienne — ${d.deviceIndex || ''}`.trim();
    const zunHints = getZunHintsForSelectedParts(parts);
    const selectedPartLines = parts.map((x, i) => {
      const matches = x.part.isUniversalZun ? [{zun: x.part.zun || x.part.partIndex}] : getAutoZunMatchesForPart(x.part);
      return `${i + 1}. ${x.part.partIndex || 'brak indeksu'} — poz. ${x.part.position || '-'} — ${x.part.namePl || x.part.nameEn || ''}${formatZunInline(matches)} — ilość: ${x.qty} szt.`;
    }).join('\n');
    const zunServiceBlock = formatZunServiceBlock(zunHints);
    const partLines = state.manualMode
      ? `${selectedPartLines ? `Wybrane części uniwersalne / ZUN:\n${selectedPartLines}\n\n` : ''}Opis części / urządzenia:\n${f.manualPartsDescription || '[klient powinien opisać potrzebną część i dołączyć zdjęcia do maila]'}${zunServiceBlock ? `\n\n${zunServiceBlock}` : ''}`
      : `${selectedPartLines}${zunServiceBlock ? `\n\n${zunServiceBlock}` : ''}`;
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
        manualMode: state.manualMode,
        activeBrand: state.activeBrand
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
      if (draft.activeBrand) state.activeBrand = draft.activeBrand;
      state.manualMode = Boolean(draft.manualMode);
      updateOptionalSections();
      if (draft.deviceIndex) {
        const device = state.manualMode ? {deviceIndex: draft.deviceIndex, title: 'zapytanie ręczne / brak spiętej listy części'} : state.devices.find(d => norm(d.deviceIndex) === norm(draft.deviceIndex));
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
    state.selectedDevice = null; state.selectedDrawing = null; state.selectedParts.clear(); state.manualMode = false; state.activeBrand = 'all';
    els.customerForm.reset(); updateOptionalSections(); els.deviceSearch.value = ''; els.partsSearch.value = '';
    renderBrandFilter(); renderDataMonitor(); renderDeviceResults(''); renderBasket(); renderViewer(false); goStep(1); renderContext();
  }


  function initTheme() {
    let theme = 'light';
    try {
      const saved = localStorage.getItem(THEME_KEY);
      const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = saved || (systemDark ? 'dark' : 'light');
    } catch (e) {}
    setTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark', true);
  }

  function setTheme(theme, persist=false) {
    const safe = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = safe;
    if (els.themeToggle) {
      els.themeToggle.setAttribute('aria-pressed', safe === 'dark' ? 'true' : 'false');
      if (els.themeIcon) els.themeIcon.textContent = safe === 'dark' ? '☀' : '☾';
      if (els.themeLabel) els.themeLabel.textContent = safe === 'dark' ? 'Tryb jasny' : 'Tryb ciemny';
    }
    if (persist) {
      try { localStorage.setItem(THEME_KEY, safe); } catch(e) {}
    }
  }

  function brandMatches(brand) {
    if (state.activeBrand === 'all') return true;
    return canonicalBrand(brand) === state.activeBrand;
  }

  function resolveBrand(row) {
    const override = findBrandOverride(row);
    return canonicalBrand(override || row.brand || inferBrand(row));
  }

  function findBrandOverride(row) {
    const overrides = state.brandOverrides || {};
    const models = overrides.models || overrides || {};
    const rawKeys = [row.deviceIndex, row.model, row.normalizedModel, row.normalizedKey, row.fileName, row.title, row.name]
      .filter(Boolean)
      .flatMap(v => [String(v), normalizeDeviceIndex(v), normKey(v), stripExt(normKey(v))]);
    for (const key of unique(rawKeys).filter(Boolean)) {
      if (models[key]) return models[key];
      const up = String(key).toUpperCase();
      if (models[up]) return models[up];
    }
    return '';
  }

  function canonicalBrand(value) {
    const v = norm(value).toUpperCase();
    if (!v) return 'INNE';
    if (v.includes('YATO GASTRO') || v === 'YG' || v.includes('GASTRO')) return 'YATO GASTRO';
    if (v.includes('YATO')) return 'YATO';
    if (v.includes('STHOR')) return 'STHOR';
    if (v.includes('VOREL')) return 'VOREL';
    if (v.includes('FLO')) return 'FLO';
    if (v.includes('LUND')) return 'LUND';
    if (v.includes('FALA')) return 'FALA';
    return String(value || 'INNE').trim().toUpperCase();
  }


  function normalizeDeviceIndex(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    const upper = raw.toUpperCase().replace(/_/g, '-').replace(/\s+/g, '-');
    const yg = upper.match(/\bYG[- ]?(\d{3,8}[A-Z]?)\b/);
    if (yg) return `YG-${yg[1]}`;
    const yt = upper.match(/\bYT[- ]?(\d{3,8}[A-Z]?)\b/);
    if (yt) return `YT-${yt[1]}`;
    const num = upper.match(/\b\d{3,6}\b/);
    return num ? num[0] : upper.replace(/\.PDF$/i, '');
  }

  function extractDeviceIndex(value) {
    const clean = stripExt(String(value || '').split('/').pop()).replace(/^czesci[_ -]zamienne[_ -]*/i, '');
    return normalizeDeviceIndex(clean);
  }

  function inferBrand(row) {
    const text = [row.brand, row.deviceIndex, row.fileName, row.title, row.name, row.path, row.originalPath, row.drivePath, row.sourceArchive].filter(Boolean).join(' ').toUpperCase();
    if (/YATO\s*GASTRO|\bYG[-_ ]?0|GASTRO/.test(text)) return 'YATO GASTRO';
    if (/\bYT[-_ ]?\d|\bYATO\b/.test(text)) return 'YATO';
    if (/\bSTHOR\b/.test(text)) return 'STHOR';
    if (/\bVOREL\b/.test(text)) return 'VOREL';
    if (/\bFLO\b/.test(text)) return 'FLO';
    if (/\bLUND\b/.test(text)) return 'LUND';
    if (/\bFALA\b/.test(text)) return 'FALA';
    const idxMatch = text.match(/(?:CZESCI[_ -]ZAMIENNE[_ -])?(\b\d{5}\b)/);
    const idx = idxMatch ? idxMatch[1] : '';
    if (['73060','79004','79024','79096','79098','79106'].includes(idx)) return 'LUND';
    if (['79005','79030','79095','79108','79119','79140','79151','79354'].includes(idx)) return 'STHOR';
    if (['79444','79467'].includes(idx)) return 'FLO';
    if (['00300','00320','00500','00510','00600','00610','00703','01060','09900'].includes(idx)) return 'VOREL';
    return row.brand || 'INNE';
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
