(() => {
  'use strict';
  const CONFIG = window.PGW_CONFIG || {};
<<<<<<< HEAD
  const DRAFT_KEY = 'pgw-production-draft-v80-drive-master-catalog';
=======
  const DRAFT_KEY = 'pgw-production-draft-v79-drive-catalog-organizer';
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
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
    lookupNip: $('lookupNip'), lookupStatus: $('lookupStatus'), zipStatus: $('zipStatus'), shipZipStatus: $('shipZipStatus'), formHint: $('formHint'), manualPartsBox: $('manualPartsBox'), manualPartsFieldset: $('manualPartsFieldset'), goManualData: $('goManualData'), draftMailPreview: $('draftMailPreview'), showMoreParts: $('showMoreParts'), mobileSummaryBar: $('mobileSummaryBar'), mobileSummaryText: $('mobileSummaryText'), mobileGoData: $('mobileGoData'), focusParts: $('focusParts'), focusPdf: $('focusPdf'), contactQuality: $('contactQuality'), invoiceQuality: $('invoiceQuality'), shippingQuality: $('shippingQuality'), finalChecklist: $('finalChecklist'), themeToggle: $('themeToggle'), themeIcon: $('themeIcon'), themeLabel: $('themeLabel'), brandFilter: $('brandFilter')
  };
  const progressIds = ['pDevice','pDrawing','pParts','pData','pMail'];

  const state = {
    devices: [], drawings: [], parts: [], driveMap: [], brandOverrides: {}, pdfHeaderOverrides: {}, pdfDeviceOverrides: {}, pdfQualityReport: {}, pdfOrphans: [], universalParts: [], universalPartLinks: [], partAssemblies: {},
    drawingById: new Map(), partsByDrawing: new Map(), driveByDrawingId: new Map(), driveByKey: new Map(), zunByPartKey: new Map(), zunByCode: new Map(), partAssemblyComponents: new Map(), partAssemblyChildren: new Map(),
    selectedDevice: null, selectedDrawing: null, selectedParts: new Map(), manualMode: false, step: 1, formDirty: false,
<<<<<<< HEAD
    postalCodes: new Map(), partVisibleLimit: PART_ROW_LIMIT, activeBrand: 'all', brandSummary: [], pdfDiagnostics: {}, releaseHealth: {}, sourceHealth: [], releaseInfo: {}, deploymentState: {}, pdfQaRules: {}, pdfOverrideCandidates: [], pdfDisplayPolicy: {}, pdfStandardizationAudit: {}, driveFirstCatalogAuditV78: {}, driveCatalogPolicyV78: {}, driveCatalogAuditV79: {}, drivePdfMergeQueueV79: {}, driveOrganizerPlanV79: {}, driveMasterAuditV80: {}, driveMergePlanV80: {}, driveOrganizerActionsV80: {}
=======
    postalCodes: new Map(), partVisibleLimit: PART_ROW_LIMIT, activeBrand: 'all', brandSummary: [], pdfDiagnostics: {}, releaseHealth: {}, sourceHealth: [], releaseInfo: {}, deploymentState: {}, pdfQaRules: {}, pdfOverrideCandidates: [], pdfDisplayPolicy: {}, pdfStandardizationAudit: {}, driveFirstCatalogAuditV78: {}, driveCatalogPolicyV78: {}, driveCatalogAuditV79: {}, drivePdfMergeQueueV79: {}, driveOrganizerPlanV79: {}
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
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
      setStatus('Ładowanie formularza…');
      const urls = CONFIG.dataUrls || {};
      state.devices = await loadFirst(urls.devices || ['data/devices.json'], []);
      state.universalParts = await loadFirst(urls.universalParts || ['data/universal-parts-zun.json'], []);
      state.universalPartLinks = await loadFirst(urls.universalPartLinks || ['data/universal-parts-zun-links.json'], []);
      state.partAssemblies = await loadFirst(urls.partAssemblies || ['data/part-assemblies.json'], {});
      state.drawings = await loadFirst(urls.drawings || ['data/drawings.json'], []);
      state.parts = await loadFirst(urls.parts || ['data/parts.json'], []);
      state.driveMap = await loadAll(urls.driveMap || ['data/drive-drawings-map.full.json', 'data/drive-drawings-map.converted.json', 'data/drive-drawings-map.json'], [], 'driveMap');
      state.brandOverrides = await loadFirst(urls.brandOverrides || ['data/brand-resolution-overrides.json'], {});
      state.pdfHeaderOverrides = await loadFirst(urls.pdfHeaderOverrides || ['data/pdf-header-overrides.json'], {});
      state.pdfDeviceOverrides = await loadFirst(urls.pdfDeviceOverrides || ['data/pdf-device-overrides.json'], {});
      state.pdfQualityReport = await loadFirst(urls.pdfQualityReport || ['data/pdf-quality-report.json'], {});
      state.pdfOrphans = await loadFirst(urls.pdfOrphans || ['data/pdf-orphans.json'], [], 'pdfOrphans');
      state.pdfQaRules = await loadFirst(urls.pdfQaRules || ['data/pdf-qa-rules.json'], {}, 'pdfQaRules');
      state.pdfOverrideCandidates = await loadFirst(urls.pdfOverrideCandidates || ['data/pdf-override-candidates.json'], [], 'pdfOverrideCandidates');
      state.pdfDisplayPolicy = await loadFirst(urls.pdfDisplayPolicy || ['data/pdf-display-policy.json'], {}, 'pdfDisplayPolicy');
      state.pdfStandardizationAudit = await loadFirst(urls.pdfStandardizationAudit || ['data/pdf-standardization-audit.json'], {}, 'pdfStandardizationAudit');
      state.deploymentState = await loadFirst(urls.deploymentState || ['data/deployment-state.json'], {}, 'deploymentState');
      state.driveFirstCatalogAuditV78 = await loadFirst(urls.driveFirstCatalogAuditV78 || ['data/drive-first-catalog-audit-v78.json'], {}, 'driveFirstCatalogAuditV78');
      state.driveCatalogPolicyV78 = await loadFirst(urls.driveCatalogPolicyV78 || ['data/drive-catalog-policy-v78.json'], {}, 'driveCatalogPolicyV78');
      state.driveCatalogAuditV79 = await loadFirst(urls.driveCatalogAuditV79 || ['data/drive-catalog-audit-v79.json'], {}, 'driveCatalogAuditV79');
      state.drivePdfMergeQueueV79 = await loadFirst(urls.drivePdfMergeQueueV79 || ['data/drive-pdf-merge-queue-v79.json'], {}, 'drivePdfMergeQueueV79');
      state.driveOrganizerPlanV79 = await loadFirst(urls.driveOrganizerPlanV79 || ['data/drive-organizer-plan-v79.json'], {}, 'driveOrganizerPlanV79');
<<<<<<< HEAD
      state.driveMasterAuditV80 = await loadFirst(urls.driveMasterAuditV80 || ['data/drive-master-audit-v80.json'], {}, 'driveMasterAuditV80');
      state.driveMergePlanV80 = await loadFirst(urls.driveMergePlanV80 || ['data/drive-merge-plan-v80.json'], {}, 'driveMergePlanV80');
      state.driveOrganizerActionsV80 = await loadFirst(urls.driveOrganizerActionsV80 || ['data/drive-organizer-actions-v80.json'], {}, 'driveOrganizerActionsV80');
=======
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
      state.releaseInfo = await loadFirst(urls.releaseInfo || ['data/release-info.json'], {}, 'releaseInfo');
      await loadPostalCodes();
      normalizeData();
      buildIndexes();
      bindEvents();
      updateOptionalSections();
      state.pdfDiagnostics = buildPdfDiagnostics();
      state.releaseHealth = buildReleaseHealth();
      exposePdfDebugTools();
      initAdminPanel();
      renderStats();
      renderBrandFilter();
      renderExamples();
      renderContext();
      restoreDraft();
      renderDeviceResults('');
      setStatus('Gotowe', 'ok');
    } catch (error) {
      console.error(error);
      setStatus('Nie udało się załadować danych', 'warn');
      els.deviceResults.innerHTML = `<div class="device-card"><div><h3>Błąd ładowania katalogu</h3><p>${escapeHtml(error.message || error)}</p></div></div>`;
    }
  }

  async function loadFirst(urls, fallback, label='') {
    let lastError;
    const list = Array.isArray(urls) ? urls : [urls];
    for (const url of list.filter(Boolean)) {
      try {
        const res = await fetch(url, {cache: 'no-store'});
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        const json = await res.json();
        recordSourceHealth(label || url, url, true, Array.isArray(json) ? json.length : (json && Array.isArray(json.items) ? json.items.length : 'object'));
        return json;
      } catch (e) {
        lastError = e;
        recordSourceHealth(label || url, url, false, 0, e.message || String(e));
      }
    }
    if (fallback !== undefined) return fallback;
    throw lastError || new Error('Brak danych');
  }

  async function loadAll(urls, fallback, label='') {
    const list = Array.isArray(urls) ? urls : [urls];
    const out = [];
    let loaded = false;
    let lastError;
    for (const url of list.filter(Boolean)) {
      try {
        const res = await fetch(url, {cache: 'no-store'});
        if (!res.ok) throw new Error(`${url}: ${res.status}`);
        const json = await res.json();
        const rows = arr(json);
        out.push(...rows);
        loaded = true;
        recordSourceHealth(label || url, url, true, rows.length);
      } catch (e) {
        lastError = e;
        recordSourceHealth(label || url, url, false, 0, e.message || String(e));
      }
    }
    if (loaded) return out;
    if (fallback !== undefined) return fallback;
    throw lastError || new Error('Brak danych');
  }

  function recordSourceHealth(label, url, ok, rows, error='') {
    state.sourceHealth = state.sourceHealth || [];
    state.sourceHealth.push({label, url, ok: !!ok, rows, error, checkedAt: new Date().toISOString()});
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


  function expandDriveMapModels(rows) {
    const out = [];
    for (const row of arr(rows)) {
      if (!row) continue;
      const models = extractModelsFromDriveRow(row);
      if (!models.length) {
        out.push(row);
        continue;
      }
      for (const model of models) {
        out.push({
          ...row,
          deviceIndex: model,
          model,
          normalizedModel: model,
          primaryModel: row.primaryModel || models[0] || model,
          modelsInPdf: models,
          sharedDrawingForModels: models.length > 1,
          __expandedFromMultiModelPdf: models.length > 1
        });
      }
    }
    return out;
  }

  function extractModelsFromDriveRow(row) {
    const explicit = []
      .concat(arr(row.deviceIndexes))
      .concat(arr(row.modelsInPdf))
      .concat(arr(row.models))
      .concat(arr(row.keys));
    if (row.deviceIndex) explicit.push(row.deviceIndex);
    if (row.model) explicit.push(row.model);
    const text = [
      ...explicit,
      row.fileName, row.title, row.name, row.path, row.folderName, row.deviceName,
      row.searchText, row.pdfHeader
    ].join(' ');
    const found = [];
    const add = (value) => {
      const idx = normalizeDeviceIndex(value);
      if (idx && !found.some(x => norm(x) === norm(idx))) found.push(idx);
    };
    String(text || '').replace(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/gi, (_, prefix, digits) => {
      add(`${String(prefix).toUpperCase()}-${digits}`);
      return _;
    });
    String(text || '').replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi, (_, digits) => {
      add(digits);
      return _;
    });
    for (const value of explicit) add(value);
    return found;
  }

  function addPartsFromDriveRow(row, drawing) {
    const rows = arr(row.parts || row.extractedParts || row.partsList);
    if (!rows.length || !drawing || !drawing.id) return 0;
    let added = 0;
    const existing = new Set(state.parts.map(p => `${norm(p.deviceIndex)}|${norm(p.partIndex)}|${norm(p.position)}|${String(p.drawingId)}`));
    rows.forEach((part, index) => {
      const partIndex = String(part.partIndex || part.index || part.sap || '').trim().toUpperCase();
      if (!partIndex || looksLikeHeaderPart({partIndex})) return;
      const position = String(part.position || part.pos || part.no || index + 1).trim();
      const key = `${norm(drawing.deviceIndex)}|${norm(partIndex)}|${norm(position)}|${String(drawing.id)}`;
      if (existing.has(key)) return;
      existing.add(key);
      state.parts.push({
        id: `drive-${String(row.fileId || drawing.id)}|${drawing.deviceIndex}|${partIndex}|${position}`,
        deviceIndex: drawing.deviceIndex,
        position,
        partIndex,
        namePl: String(part.namePl || part.name || part.description || '').trim(),
        nameEn: String(part.nameEn || '').trim(),
        drawingId: drawing.id,
        drawingPath: drawing.path || row.path || '',
        drawingTitle: drawing.title || row.title || '',
        brand: drawing.brand || row.brand || '',
        source: row.source || 'GOOGLE_DRIVE_GENERATED_V78'
      });
      added++;
    });
    return added;
  }

  function normalizeData() {
    state.devices = arr(state.devices).filter(Boolean);
    state.drawings = arr(state.drawings).filter(d => isPdf(d));
    state.parts = arr(state.parts).filter(Boolean);
    state.universalParts = normalizeUniversalParts(state.universalParts);
    state.universalPartLinks = normalizeUniversalPartLinks(state.universalPartLinks);
    state.driveMap = expandDriveMapModels(arr(state.driveMap).filter(row => isPdf(row))); // v78: jeden PDF może obsługiwać kilka modeli

    for (const d of state.devices) d.brand = resolveBrand(d);
    for (const d of state.drawings) d.brand = resolveBrand(d);
    for (const p of state.parts) p.brand = resolveBrand(p);
    for (const row of state.driveMap) row.brand = resolveBrand(row);

    const driveKeys = new Set();
    for (const row of state.driveMap) {
      row.fileId = row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.id || '';
      row.fileName = row.fileName || row.title || row.name || '';
      row.deviceIndex = normalizeDeviceIndex(row.deviceIndex || row.model || row.normalizedKey || extractDeviceIndex(row.fileName || row.title || row.name || row.path));
      row.openUrl = normalizeDriveOpenUrl(row.openUrl || row.url || row.viewerUrl || (row.fileId ? `https://drive.google.com/file/d/${encodeURIComponent(row.fileId)}/view` : ''));
      row.viewerUrl = normalizeDrivePreviewUrl(row.previewUrl || row.viewerUrl || row.openUrl || (row.fileId ? `https://drive.google.com/file/d/${encodeURIComponent(row.fileId)}/preview` : ''));
      row.previewUrl = normalizeDrivePreviewUrl(row.previewUrl || row.viewerUrl);
      row.githubPreviewReady = Boolean(row.viewerUrl && row.viewerUrl.includes('/preview'));
      row.pdfVariant = classifyPdfVariant(row);
      applyPdfDeviceOverride(row);
      applyPdfHeaderOverride(row);
      row.__keys = unique([row.deviceIndex, row.model, row.normalizedKey, row.fileName, row.title, row.name, row.deviceName, row.displayTitle, ...(row.keys || [])].flat().map(normKey).filter(Boolean));
      for (const k of row.__keys) driveKeys.add(k);
    }
    state.driveMap = dedupeDriveMapRows(state.driveMap);

    // Tworzymy lekkie rekordy urządzeń i rysunków z samego manifestu, żeby klient mógł wyszukać PDF
    // i przejść trybem opisowym, nawet zanim lista części zostanie spięta.
    const existingDrawingKeys = new Set(state.drawings.flatMap(d => drawingKeys(d)));
    let syntheticId = 9000000;
    for (const row of state.driveMap) {
      const keys = row.__keys || [];
      const hasDrawing = keys.some(k => existingDrawingKeys.has(k));
      const rowPreferred = isPreferredPdf(row);
      if ((!hasDrawing || rowPreferred) && row.deviceIndex) {
        const id = `drive-${row.fileId || 'nofile'}-${normKey(row.deviceIndex) || syntheticId++}`;
        const drawing = {
          id,
          deviceIndex: row.deviceIndex,
          title: bestDriveTitleV80(row) || row.displayTitle || row.deviceName || row.title || row.fileName || row.deviceIndex,
          fileName: row.fileName || row.title || `${row.deviceIndex}.pdf`,
          brand: canonicalBrand(row.brand || inferBrand(row)),
          type: 'pdf',
          source: 'GOOGLE_DRIVE_FULL_MANIFEST',
          driveFileId: row.fileId,
          viewerUrl: row.viewerUrl,
          openUrl: row.openUrl,
          path: row.path || row.folderPath || '',
          brandConfidence: row.brandConfidence || '',
          reviewStatus: row.reviewStatus || '',
          brandReason: row.brandReason || '',
          notes: row.notes || '',
          preferred: Boolean(rowPreferred || row.preferred),
          status: row.status || '',
          pdfVariant: row.pdfVariant || classifyPdfVariant(row),
          githubPreviewReady: Boolean(row.githubPreviewReady),
          partsExtracted: Boolean(row.partsExtracted),
          displayMode: row.displayMode || 'standard-service-card'
        };
        state.drawings.push(drawing);
        addPartsFromDriveRow(row, drawing);
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
          hasPartsList: false,
          brandConfidence: d.brandConfidence || '',
          reviewStatus: d.reviewStatus || '',
          brandReason: d.brandReason || '',
          notes: d.notes || ''
        });
        existingDeviceKeys.add(key);
      }
    }
    state.devices = state.devices.filter(d => deviceKeys.has(norm(d.deviceIndex)));
    const brandByDevice = new Map();
    for (const d of state.drawings) if (d.brand) brandByDevice.set(norm(d.deviceIndex), d.brand);
    for (const d of state.devices) if (!d.brand || d.brand === 'INNE') d.brand = brandByDevice.get(norm(d.deviceIndex)) || canonicalBrand(inferBrand(d));
    for (const p of state.parts) if (!p.brand || p.brand === 'INNE') p.brand = brandByDevice.get(norm(p.deviceIndex)) || canonicalBrand(inferBrand(p));
    enhanceDeviceTitlesFromDrawings();
  }


  function bestDriveTitleV80(row) {
    const models = Array.isArray(row && row.modelsInPdf) ? row.modelsInPdf : [];
    const base = cleanDeviceTitle(row && row.deviceIndex, row && (row.deviceName || row.displayTitle || row.title || row.fileName || ''));
    if (models.length > 1 && base && !/wspólny|multi/i.test(base)) return base + ' · wspólny rysunek dla ' + models.join(', ');
    return base || (row && row.deviceIndex) || '';
  }

  function enhanceDeviceTitlesFromDrawings() {
    const drawingsByDevice = new Map();
    for (const drawing of state.drawings) {
      const key = norm(drawing.deviceIndex);
      if (!key) continue;
      if (!drawingsByDevice.has(key)) drawingsByDevice.set(key, []);
      drawingsByDevice.get(key).push(drawing);
    }
    for (const device of state.devices) {
      const key = norm(device.deviceIndex);
      const drawings = drawingsByDevice.get(key) || [];
      if (!drawings.length) continue;
      const best = drawings.slice().sort((a, b) => drawingTitleScore(b) - drawingTitleScore(a))[0];
      const title = cleanDeviceTitle(device.deviceIndex, best.displayTitle || best.title || best.deviceName || '');
      if (title && shouldReplaceDeviceTitle(device, title)) {
        device.title = title;
        device.deviceName = device.deviceName || title;
        device.displayTitle = `${device.deviceIndex || ''} — ${title}`.replace(/^\s*—\s*/, '');
      }
      for (const key of ['brandConfidence','reviewStatus','brandReason','headerConfidence','headerSource']) {
        if (best[key] && !device[key]) device[key] = best[key];
      }
    }
  }

  function drawingTitleScore(drawing) {
    const title = String(drawing.displayTitle || drawing.title || drawing.deviceName || '');
    let score = Math.min(title.length, 120);
    if (drawing.deviceName) score += 80;
    if (drawing.headerSource || drawing.pdfHeader) score += 60;
    if (/\s[-–—:]\s/.test(title)) score += 30;
    if (title && title !== String(drawing.deviceIndex || '')) score += 20;
    return score;
  }

  function shouldReplaceDeviceTitle(device, candidate) {
    const current = String(device.title || '').trim();
    const idx = String(device.deviceIndex || '').trim();
    if (!candidate || candidate === idx) return false;
    if (!current || current === idx) return true;
    if (/^Czesci[_ -]zamienne/i.test(current) || /\.pdf$/i.test(current)) return true;
    return candidate.length > current.length + 12 && !current.includes(candidate);
  }

  function cleanDeviceTitle(deviceIndex, title) {
    let out = String(title || '').replace(/\.pdf$/i, '').replace(/\s+/g, ' ').trim();
    const idx = String(deviceIndex || '').trim();
    if (idx) out = out.replace(new RegExp('^' + escapeRegExp(idx) + '\\s*[-–—:]\\s*', 'i'), '').trim();
    out = out.replace(/^Czesci[_ -]zamienne[_ -]*/i, '').trim();
    if (!out || out.toUpperCase() === idx.toUpperCase()) return '';
    return out;
  }

  function displayDeviceName(device, drawing) {
    const idx = String(device?.deviceIndex || drawing?.deviceIndex || '').trim();
    const title = cleanDeviceTitle(idx, device?.title || device?.deviceName || drawing?.displayTitle || drawing?.title || drawing?.deviceName || '');
    return title || 'Urządzenie z rysunkiem PDF';
  }

  function escapeRegExp(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }


  function applyPdfDeviceOverride(row) {
    const override = findPdfDeviceOverride(row);
    if (!override) return;
    const deviceIndexes = Array.isArray(override) ? override : (override.deviceIndexes || override.deviceIndex || override.model || override.models || '');
    const primary = Array.isArray(deviceIndexes) ? deviceIndexes[0] : deviceIndexes;
    if (primary) {
      row.deviceIndex = normalizeDeviceIndex(primary);
      row.model = row.deviceIndex;
      row.normalizedModel = row.deviceIndex;
      row.status = 'OK_OVERRIDE';
      row.reviewStatus = row.reviewStatus || 'manual_override';
    }
    if (!Array.isArray(override) && typeof override === 'object') {
      if (override.deviceName) row.deviceName = override.deviceName;
      if (override.displayTitle) row.displayTitle = override.displayTitle;
      if (override.brand) row.brand = override.brand;
      if (override.notes) row.notes = [row.notes, override.notes].filter(Boolean).join(' | ');
    }
    const extraKeys = arr(deviceIndexes).concat([primary, row.deviceIndex, row.model]).map(normKey).filter(Boolean);
    row.keys = unique([...(row.keys || []), ...extraKeys]);
    row.overrideSource = 'pdf-device-overrides';
  }

  function findPdfDeviceOverride(row) {
    const root = state.pdfDeviceOverrides || {};
    const sources = [
      root.byFileId || {},
      root.byFileName || {},
      root.byTitle || {},
      root.byPath || {},
      root.byModel || {},
      root.models || {},
      root.files || {},
      root
    ];
    const candidates = unique([
      row.fileId, row.driveFileId, row.googleDriveId, row.id,
      row.fileName, row.title, row.name, row.path, row.folderPath,
      row.deviceIndex, row.model, row.normalizedModel, row.normalizedKey,
      normKey(row.fileName), stripExt(normKey(row.fileName)),
      normKey(row.title), stripExt(normKey(row.title)),
      normalizeDeviceIndex(row.fileName), normalizeDeviceIndex(row.title)
    ].map(x => String(x || '').trim()).filter(Boolean));
    for (const source of sources) {
      for (const key of candidates) {
        if (!source) continue;
        const variants = unique([key, key.toUpperCase(), key.toLowerCase(), normKey(key), stripExt(normKey(key)), normalizeDeviceIndex(key)].filter(Boolean));
        for (const v of variants) if (source[v]) return source[v];
      }
    }
    return null;
  }

  function applyPdfHeaderOverride(row) {
    const root = state.pdfHeaderOverrides || {};
    const overrideSources = [
      root,
      root.byFileId || {},
      root.byModel || {},
      root.byDeviceIndex || {},
      root.models || {}
    ];
    const candidates = [
      row.fileId,
      row.driveFileId,
      row.sourceFileId,
      row.id,
      row.normalizedModel,
      row.normalizedKey,
      row.deviceIndex,
      row.model
    ].map(x => String(x || '').trim()).filter(Boolean);
    let found = null;
    for (const key of candidates) {
      const variants = unique([key, key.toUpperCase(), normKey(key), normalizeDeviceIndex(key)].filter(Boolean));
      for (const source of overrideSources) {
        for (const v of variants) {
          if (source && source[v]) { found = source[v]; break; }
        }
        if (found) break;
      }
      if (found) break;
    }
    if (!found) return;
    row.pdfHeader = found.headerText || found.rawHeader || row.pdfHeader || '';
    row.deviceName = found.deviceName || found.extractedDeviceName || row.deviceName || '';
    row.displayTitle = found.displayTitle || (row.deviceName ? `${row.deviceIndex || row.model || ''} — ${row.deviceName}`.replace(/^\s*—\s*/, '') : '') || row.displayTitle || '';
    if (found.brand && (!row.brand || row.brand === 'NIEZNANA' || row.brand === 'DO ROZPOZNANIA' || row.brand === 'INNE')) row.brand = found.brand;
    row.headerConfidence = found.confidence || row.headerConfidence || '';
    row.headerSource = found.source || 'pdf-header-overrides';
  }

  function dedupeDriveMapRows(rows) {
    const byId = new Map();
    const out = [];
    for (const row of rows || []) {
      const id = String(row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.sourceFileId || '').trim();
      // v79: jeden PDF moze obslugiwac kilka modeli. Nie wolno deduplikowac po samym fileId,
      // bo wtedy drugi model z pliku yt-828113-yt-828114.pdf znika z katalogu.
      const modelIdentity = normKey(row.deviceIndex || row.model || row.normalizedModel || row.primaryModel || '');
      const identity = id ? [id, modelIdentity || 'no-model'].join('|') : [row.path || row.folderPath || '', row.fileName || row.title || row.name || '', row.deviceIndex || row.model || row.normalizedModel || ''].map(normKey).filter(Boolean).join('|');
      if (!identity) { out.push(row); continue; }
      const existingIndex = byId.get(identity);
      if (existingIndex === undefined) {
        byId.set(identity, out.length);
        out.push(row);
      } else if (driveRowScore(row) >= driveRowScore(out[existingIndex])) {
        out[existingIndex] = row;
      }
    }
    return out;
  }

  function driveRowScore(row) {
    let score = 0;
    if (row.previewUrl || String(row.viewerUrl || '').includes('/preview')) score += 8;
    if (row.openUrl || row.url) score += 4;
    if (row.deviceIndex || row.model || row.normalizedModel) score += 4;
    if (row.displayTitle || row.deviceName || row.pdfHeader) score += 3;
    if (row.brand && row.brand !== 'INNE' && row.brand !== 'DO ROZPOZNANIA') score += 2;
    const ts = Date.parse(row.modifiedTime || row.updatedAt || row.generatedAt || 0) || 0;
    return score * 10000000000000 + ts;
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
    const drawingSearchByDevice = new Map();
    for (const d of state.drawings) {
      const key = norm(d.deviceIndex);
      if (!key) continue;
      const chunk = [d.title, d.displayTitle, d.deviceName, d.fileName, d.searchText, d.pdfHeader, d.brand].join(' ');
      drawingSearchByDevice.set(key, `${drawingSearchByDevice.get(key) || ''} ${chunk}`);
    }
    const partSearchByDevice = new Map();
    for (const p of state.parts) {
      const key = norm(p.deviceIndex);
      if (!key) continue;
      const chunk = [p.position, p.partIndex, p.namePl, p.nameEn].join(' ');
      partSearchByDevice.set(key, `${partSearchByDevice.get(key) || ''} ${chunk}`);
    }
    for (const d of state.devices) {
      const key = norm(d.deviceIndex);
      d.__search = norm([d.deviceIndex, d.title, d.name, d.brand, d.deviceName, d.displayTitle, drawingSearchByDevice.get(key), partSearchByDevice.get(key)].join(' '));
    }
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
    els.clearBasket.addEventListener('click', clearRequestBasket);
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
      renderDeviceResults(els.deviceSearch.value);
      saveDraft();
    });
  }

  function renderStats() {
    if (els.statDevices) els.statDevices.textContent = fmt(state.devices.length);
    if (els.statDrawings) els.statDrawings.textContent = fmt(state.drawings.length);
    if (els.statParts) els.statParts.textContent = fmt(state.parts.length + (state.universalParts || []).length);
  }

  function renderBrandFilter() {
    if (!els.brandFilter) return;
    const counts = new Map();
    for (const d of state.devices) {
      const brand = canonicalBrand(d.brand || inferBrand(d));
      counts.set(brand, (counts.get(brand) || 0) + 1);
    }
    state.brandSummary = [...counts.entries()].sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'));
    const buttons = [['all', 'Wszystkie marki', state.devices.length], ...state.brandSummary];
    els.brandFilter.innerHTML = buttons.map(([value, label, count]) => {
      const active = state.activeBrand === value;
      const logo = brandFilterLogo(value, label);
      const aria = `${label}: ${fmt(count)} urządzeń`;
      return `<button type="button" class="brand-chip logo-only ${active ? 'active' : ''}" data-brand="${escapeAttr(value)}" title="${escapeAttr(label)}" aria-label="${escapeAttr(aria)}">${logo}</button>`;
    }).join('');
  }

  function brandFilterLogo(value, label) {
    const logos = {
      'YATO': 'assets/logos/yato-clean.png',
      'YATO GASTRO': 'assets/logos/yato-clean.png',
      'STHOR': 'assets/logos/sthor-clean.png',
      'VOREL': 'assets/logos/vorel-clean.png',
      'LUND': 'assets/logos/lund-clean.png',
      'FLO': 'assets/logos/flo-clean.png',
      'FALA': 'assets/logos/fala-clean.png'
    };
    if (value === 'all') {
      return `<span class="brand-all-icon" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;
    }
    const src = logos[value];
    if (src) return `<img src="${escapeAttr(src)}" alt="" loading="lazy" decoding="async">`;
    const letter = String(label || value || '?').trim().charAt(0) || '?';
    return `<span class="brand-fallback-icon" aria-hidden="true">${escapeHtml(letter)}</span>`;
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
        source: link.source || ''
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
          source: link.source || ''
        });
      }
    }
    // Jeżeli indeks części z rysunku nie ma bezpośredniego powiązania, próbujemy ostrożnie po nazwie/specyfikacji.
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
          source: 'heurystyka nazwy',
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
            source: ''
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
    lines.push('Informacja dla serwisu — dopasowane części uniwersalne ZUN:');
    let n = 1;
    for (const hint of hints) {
      const part = hint.part || {};
      for (const m of hint.matches || []) {
        const details = [m.name, m.spec, m.dimensionsCm].filter(Boolean).join(' / ');
        const modelInfo = m.linkedModel ? `; powiązany model: ${m.linkedModel}${m.linkedModelBrand ? ' / ' + m.linkedModelBrand : ''}` : '';
        const selectedIndex = part.partIndex || part.zun || 'brak indeksu';
        lines.push(`${n++}. ${m.zun} — dla wybranej części ${selectedIndex}${details ? ` — ${details}` : ''}; pewność: ${m.confidence || 'wysoka'}${modelInfo}`);
      }
    }
    lines.push('Uwaga: informacja pomocnicza dla obsługi. Proszę finalnie potwierdzić zgodność przed wyceną.');
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

  function renderDeviceResults(query) {
    const q = norm(query);
    const tokens = q.split(/\s+/).filter(Boolean);
    const zunResults = [];
    let results = state.devices.map(device => {
      const drawings = state.drawings.filter(d => norm(d.deviceIndex) === norm(device.deviceIndex));
      const partCount = drawings.reduce((n, d) => n + (state.partsByDrawing.get(String(d.id)) || []).length, 0);
      let score = 0;
      const idx = norm(device.deviceIndex);
      if (!tokens.length) score = partCount ? 10 : 0;
      for (const t of tokens) {
        const tCompact = compactSearchKey(t);
        const idxCompact = compactSearchKey(device.deviceIndex);
        const variants = expandDeviceSearchToken(t);
        if (idx === t || idxCompact === tCompact) score += 140;
        else if (variants.includes(idxCompact)) score += 130;
        else if (idx.includes(t) || idxCompact.includes(tCompact)) score += 85;
        else if (tCompact.length >= 5 && idxCompact.length >= 5 && tCompact.includes(idxCompact)) score += 80;
        else if (fuzzyDeviceIndexMatch(idxCompact, variants)) score += 65;
        if (device.__search.includes(t)) score += 25;
        const searchCompact = compactSearchKey(device.__search);
        if (tCompact.length >= 5 && searchCompact.includes(tCompact)) score += 18;
      }
      return {device, drawings, partCount, score};
    }).filter(x => x.drawings.length > 0 && brandMatches(x.device.brand) && (!tokens.length || x.score > 0));
    results.sort((a,b) => b.score - a.score || b.partCount - a.partCount || String(a.device.deviceIndex).localeCompare(String(b.device.deviceIndex)));
    results = results.slice(0, tokens.length ? 30 : 12);

    els.deviceMeta.textContent = tokens.length ? `Znaleziono ${fmt(results.length)} pasujących urządzeń${state.activeBrand !== 'all' ? ' dla wybranej marki' : ''}.` : `Wpisz model urządzenia albo fragment nazwy. Poniżej kilka przykładów.`;
    const zunHtml = '';
    if (!results.length && !zunResults.length) {
      const typed = String(els.deviceSearch.value || '').trim();
      els.deviceResults.innerHTML = `<div class="empty-state manual-empty"><strong>Nie znaleziono urządzenia.</strong><p>Spróbuj wpisać sam numer modelu albo fragment nazwy urządzenia.</p><p>Jeśli urządzenia nie ma w katalogu i nie ma rysunku, możesz zgłosić je ręcznie.</p><button class="primary" type="button" id="startManualRequest">Nie ma urządzenia/rysunku — opiszę ręcznie</button></div>`;
      const btn = $('startManualRequest');
      if (btn) btn.addEventListener('click', () => startManualRequest(typed));
      return;
    }
    const deviceHtml = results.map(({device, drawings, partCount}) => `
      <article class="device-card ${state.selectedDevice && norm(state.selectedDevice.deviceIndex) === norm(device.deviceIndex) ? 'selected' : ''}">
        <div>
          <h3>${escapeHtml(device.deviceIndex || 'Bez indeksu')}</h3>
          <p>${escapeHtml(displayDeviceName(device, drawings[0]))}</p>
          <div class="badges">${publicBrandBadge(device)}<span class="badge ok">Rysunek PDF</span><span class="badge">${fmt(drawings.length)} rys.</span><span class="badge ${partCount ? '' : 'warn'}">${partCount ? fmt(partCount) + ' części' : 'PDF - opisz pozycję z rysunku'}</span></div>
        </div>
        <button class="primary" type="button" data-device="${escapeAttr(device.deviceIndex)}">Wybierz</button>
      </article>`).join('');
    els.deviceResults.innerHTML = `${zunHtml}${deviceHtml}`;
    els.deviceResults.querySelectorAll('button[data-device]').forEach(btn => btn.addEventListener('click', () => selectDevice(btn.dataset.device)));
  }
  function startManualRequest(typed) {
    const clean = String(typed || '').trim();
    state.manualMode = true;
    state.partVisibleLimit = PART_ROW_LIMIT;
    state.selectedDevice = { deviceIndex: clean || 'nie podano', title: 'opis części do sprawdzenia'  };
    state.selectedDrawing = null;
    // Nie czyścimy koszyka — zapytanie może obejmować kilka urządzeń.
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
    const drawing = drawings.sort((a,b) => drawingSelectionScore(b) - drawingSelectionScore(a))[0];
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
      const title = drawing ? displayDeviceName(d, drawing) : (d.title || 'Zapytanie ręczne');
      const meta = drawing
        ? `Rysunek PDF dostępny${linkInfo} • lista części do uzupełnienia — wpisz numer pozycji z PDF albo opisz część w następnym kroku.`
        : 'Opisz urządzenie i potrzebną część w następnym kroku.';
      const brandText = publicBrandText(d, drawing);
      els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex || 'Zapytanie ręczne')} — ${escapeHtml(title)}</strong><span>${brandText}${meta}</span>`;
      return;
    }
    if (!drawing) { els.selectedDeviceBox.innerHTML = ''; return; }
    const count = (state.partsByDrawing.get(String(drawing.id)) || []).length;
    els.selectedDeviceBox.innerHTML = `<strong>${escapeHtml(d.deviceIndex)} — ${escapeHtml(displayDeviceName(d, drawing))}</strong><span>${publicBrandText(d, drawing)}Rysunek: ${escapeHtml(drawing.fileName || drawing.title || '')} • ${fmt(count)} części</span>`;
  }

  function renderParts() {
    if (els.manualPartsBox) els.manualPartsBox.classList.toggle('hidden', !state.manualMode);
    if (state.manualMode) {
      if (els.showMoreParts) els.showMoreParts.classList.add('hidden');
      if (els.partMeta) els.partMeta.innerHTML = state.selectedDrawing ? '<strong>Rysunek PDF jest dostępny.</strong> Lista części nie jest jeszcze podpięta. Wpisz numer pozycji z rysunku albo opisz potrzebną część w kolejnym kroku.' : (state.selectedParts.size ? '<strong>Wybrano część do zapytania.</strong> Dopisz model urządzenia lub zdjęcie tabliczki, żeby serwis mógł potwierdzić dopasowanie.' : '<strong>Opis ręczny.</strong> Przejdź dalej i opisz potrzebną część tekstowo.');
      if (els.partsTable) els.partsTable.innerHTML = `<tr><td colspan="4">Lista części nie jest jeszcze podpięta. Przejdź dalej i opisz pozycję z rysunku w uwagach.</td></tr>`;
      if (els.goDataInline) { els.goDataInline.disabled = false; els.goDataInline.textContent = 'Przejdź dalej i opisz część'; }
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


  function selectedBasketItems() {
    return [...state.selectedParts.values()].filter(x => x && x.part);
  }

  function getDeviceForPart(part) {
    if (!part) return null;
    return state.devices.find(d => norm(d.deviceIndex) === norm(part.deviceIndex)) || {
      deviceIndex: part.deviceIndex || '',
      title: part.deviceName || part.drawingTitle || ''
    };
  }

  function getDrawingForPart(part) {
    if (!part) return null;
    return state.drawingById.get(String(part.drawingId)) || state.drawings.find(d => norm(d.deviceIndex) === norm(part.deviceIndex)) || null;
  }

  function groupSelectedParts(items) {
    const groups = new Map();
    for (const item of items || []) {
      const part = item.part || item;
      const drawing = getDrawingForPart(part);
      const device = getDeviceForPart(part);
      const key = String(part.drawingId || (device && device.deviceIndex) || part.deviceIndex || part.id);
      if (!groups.has(key)) groups.set(key, {key, device, drawing, items: []});
      groups.get(key).items.push(item);
    }
    return [...groups.values()].sort((a, b) => String(a.device?.deviceIndex || '').localeCompare(String(b.device?.deviceIndex || ''), 'pl'));
  }

  function hasManualRequestOnly(groups) {
    if (!state.manualMode || !state.selectedDevice) return false;
    const current = norm(state.selectedDevice.deviceIndex || '');
    return !groups.some(g => norm(g.device?.deviceIndex || '') === current);
  }

  function requestDeviceCount(groups) {
    return (groups || []).length + (hasManualRequestOnly(groups || []) ? 1 : 0);
  }

  function requestPartsQty(items) {
    return (items || selectedBasketItems()).reduce((sum, x) => sum + (Number(x.qty) || 0), 0);
  }

  function clearRequestBasket() {
    state.selectedParts.clear();
    if (state.manualMode) {
      state.manualMode = false;
      state.selectedDevice = null;
      state.selectedDrawing = null;
    }
    renderDeviceResults(els.deviceSearch ? els.deviceSearch.value : '');
    renderSelectedDevice();
    renderParts();
    renderBasket();
    renderViewer(false);
    saveDraft();
  }

  function renderBasket() {
    const items = selectedBasketItems();
    const groups = groupSelectedParts(items);
    const totalQty = requestPartsQty(items);
    els.basketCount.textContent = String(totalQty);
    const hasManual = state.manualMode && state.selectedDevice;
    const canData = hasManual || items.length > 0;
    els.goData.disabled = !canData;
    if (els.goDataInline) els.goDataInline.disabled = !canData;
    els.clearBasket.disabled = !canData;

    const manualHtml = hasManualRequestOnly(groups) ? `<div class="basket-device-group manual-group">
      <div class="basket-device-title"><strong>Opis ręczny / PDF bez listy części</strong><span>${escapeHtml(state.selectedDevice.deviceIndex || 'Zapytanie ręczne')} — ${escapeHtml(displayDeviceName(state.selectedDevice, state.selectedDrawing) || state.selectedDevice.title || 'do opisania')}</span></div>
      <div class="basket-item"><div><strong>Pozycja z rysunku lub opis klienta</strong><span>Treść zostanie pobrana z pola „Opis części / urządzenia”.</span></div></div>
    </div>` : '';

    if (!items.length && !hasManual) {
      els.basketItems.className = 'basket-empty';
      els.basketItems.innerHTML = 'Brak wybranych części.';
    } else {
      els.basketItems.className = '';
      const groupHtml = groups.map(group => {
        const device = group.device || {};
        const drawing = group.drawing || {};
        const title = displayDeviceName(device, drawing) || device.title || drawing.title || '';
        const rows = group.items.map(({part, qty}) => `<div class="basket-item">
          <div><strong>poz. ${escapeHtml(part.position || '-')} • ${escapeHtml(part.partIndex || '')}</strong><span>${escapeHtml(part.namePl || part.nameEn || '')}${escapeHtml(formatAssemblyInline(part))}</span>${assemblyNoticeHtml(part)}</div>
          <div class="qty">
            <button type="button" data-dec="${escapeAttr(part.id)}">−</button>
            <input value="${qty}" inputmode="numeric" data-qty="${escapeAttr(part.id)}" />
            <button type="button" data-inc="${escapeAttr(part.id)}">+</button>
            <button class="remove" type="button" data-remove="${escapeAttr(part.id)}">×</button>
          </div>
        </div>`).join('');
        return `<div class="basket-device-group">
          <div class="basket-device-title"><strong>${escapeHtml(device.deviceIndex || 'Bez indeksu')}</strong><span>${escapeHtml(title)}${drawing.fileName ? ` • ${escapeHtml(drawing.fileName)}` : ''}</span></div>
          ${rows}
        </div>`;
      }).join('');
      els.basketItems.innerHTML = `${groupHtml}${manualHtml}`;
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
    const items = selectedBasketItems();
    const groups = groupSelectedParts(items);
    const devices = requestDeviceCount(groups);
    const qty = requestPartsQty(items);
    if (state.manualMode && !qty) {
      els.mobileSummaryText.textContent = state.selectedDevice ? `Opis ręczny: ${state.selectedDevice.deviceIndex || 'urządzenie'}` : 'Opisz potrzebną część';
      els.mobileGoData.disabled = !state.selectedDevice;
      els.mobileGoData.textContent = state.step >= 3 ? 'Mail' : 'Dane';
      return;
    }
    els.mobileSummaryText.textContent = qty ? `Części: ${qty} • urządzeń: ${devices || 1}` : 'Brak wybranych części';
    const canGo = state.step >= 3 ? formIsValid() : (qty > 0 || state.manualMode);
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
    if (state.manualMode && !drawing) {
      els.openPdf.classList.add('hidden');
      els.openPdf.href = '#';
      els.viewer.className = 'viewer empty manual-viewer';
      els.viewer.innerHTML = '<div><strong>Brak rysunku PDF dla wybranego opisu.</strong><br><span>Opisz część ręcznie i dołącz zdjęcia do maila.</span></div>';
      return;
    }
    const row = drawing ? state.driveByDrawingId.get(String(drawing.id)) : null;
    els.openPdf.classList.add('hidden');
    els.openPdf.href = '#';
    if (!drawing || !row || !row.viewerUrl) {
      els.viewer.className = 'viewer empty';
      els.viewer.innerHTML = '<div>Nie udało się załadować podglądu PDF. Użyj przycisku „Otwórz w nowej karcie”.</div>';
      const fallbackUrl = (row && (row.openUrl || row.viewerUrl)) || (drawing && (drawing.openUrl || drawing.viewerUrl)) || '#';
      if (drawing && fallbackUrl !== '#') {
        els.openPdf.href = fallbackUrl;
        els.openPdf.classList.remove('hidden');
      }
      return;
    }
    if (withLoading) {
      els.viewer.className = 'viewer loading';
      els.viewer.innerHTML = '<div><strong>Wczytuję rysunek PDF…</strong><br><span>Za chwilę pojawi się podgląd rysunku.</span></div>';
      window.setTimeout(() => renderViewer(false), 450);
      return;
    }
    const previewUrl = normalizeDrivePreviewUrl(row.viewerUrl || row.previewUrl || drawing.viewerUrl || drawing.previewUrl);
    const openUrl = normalizeDriveOpenUrl(row.openUrl || drawing.openUrl || previewUrl);
    els.openPdf.href = openUrl || previewUrl;
    els.openPdf.classList.remove('hidden');
    els.viewer.className = 'viewer standard-pdf-viewer';
    const label = standardPdfLabel(drawing, row);
    els.viewer.innerHTML = `<div class="pdf-standard-shell"><div class="pdf-standard-bar"><strong>${escapeHtml(label.title)}</strong><span>${escapeHtml(label.meta)}</span></div><iframe src="${escapeAttr(previewUrl)}" title="${escapeAttr(drawing.title || 'Rysunek PDF')}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>`;
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
      1: ['Wybierz urządzenie', 'Wpisz model urządzenia albo fragment nazwy. Jeśli nie znajdziesz modelu, możesz opisać część ręcznie.'],
      2: ['Wybierz lub opisz część', 'Sprawdź rysunek PDF. Jeśli lista części nie jest dostępna, wpisz numer pozycji z rysunku albo krótki opis.'],
      3: ['Uzupełnij dane', 'Podaj dane kontaktowe. Faktura i wysyłka są opcjonalne. Nic nie jest wysyłane automatycznie.'],
      4: ['Skopiuj gotowy mail', 'Na końcu otrzymasz gotowy temat i treść do wysłania na service@yato.pl.']
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
    if (!els.finalChecklist || (!state.selectedDevice && !state.selectedParts.size)) return;
    const f = Object.fromEntries(new FormData(els.customerForm).entries());
    const items = selectedBasketItems();
    const groups = groupSelectedParts(items);
    const partsCount = requestPartsQty(items);
    const devicesCount = requestDeviceCount(groups);
    const rows = [
      ['Urządzenia', devicesCount ? `${devicesCount} w zapytaniu` : (state.selectedDevice?.deviceIndex || 'model opisany ręcznie'), devicesCount || state.selectedDevice ? 'ok' : 'warn'],
      ['Części', state.manualMode && !partsCount ? 'opis ręczny' : `${items.length} pozycji / ${partsCount} szt.`, hasSelectionForRequest() ? 'ok' : 'warn'],
      ['Kontakt', hasUsableContact(f.contactEmail, f.contactPhone) ? (f.contactEmail || f.contactPhone) : 'brak poprawnego emaila lub telefonu', hasUsableContact(f.contactEmail, f.contactPhone) ? 'ok' : 'warn'],
      ['Faktura', els.wantInvoice?.checked ? (f.invoiceName || 'dane wpisane') : 'opcjonalnie pominięta', 'neutral'],
      ['Wysyłka', els.wantShipping?.checked ? (f.shipName || 'adres wpisany') : 'opcjonalnie pominięta', 'neutral']
    ];
    els.finalChecklist.innerHTML = rows.map(([k,v,t]) => `<div class="check-row ${t}"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');
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

  function formatDrawingMailBlock(drawing) {
    if (!drawing) {
      return 'Rysunek techniczny PDF: brak dobranego rysunku w formularzu.\nProszę o pomoc w identyfikacji części. Klient powinien dołączyć zdjęcie tabliczki znamionowej i potrzebnej części.';
    }
    const drive = state.driveByDrawingId.get(String(drawing.id));
    return `Rysunek techniczny PDF:\n${drawing.fileName || drawing.title || ''}\n${drive && drive.openUrl ? `Link do rysunku: ${drive.openUrl}` : ''}`;
  }

  function formatPartLine(item, index) {
    const part = item.part || item;
    const qty = item.qty || 1;
    const matches = part.isUniversalZun ? [{zun: part.zun || part.partIndex}] : getAutoZunMatchesForPart(part);
    return `${index}. ${part.partIndex || 'brak indeksu'} — poz. ${part.position || '-'} — ${part.namePl || part.nameEn || ''}${formatZunInline(matches)} — ilość: ${qty} szt.`;
  }

  function formatDeviceMailSection(group, ordinal) {
    const d = group.device || {};
    const drawing = group.drawing || null;
    const title = displayDeviceName(d, drawing) || d.title || '';
    const partLines = group.items.map((x, i) => formatPartLine(x, i + 1)).join('\n');
    const assemblyBlock = formatAssemblyServiceBlock(getAssemblyHintsForSelectedParts(group.items));
    const zunBlock = formatZunServiceBlock(getZunHintsForSelectedParts(group.items));
    const serviceBlocks = [assemblyBlock, zunBlock].filter(Boolean).join('\n\n');
    return `Urządzenie ${ordinal}: ${d.deviceIndex || '[brak indeksu]'}${title ? ` — ${title}` : ''}\n${formatDrawingMailBlock(drawing)}\n\nLista części:\n${partLines}${serviceBlocks ? `\n\n${serviceBlocks}` : ''}`;
  }

  function formatManualMailSection(ordinal, f) {
    const d = state.selectedDevice || {};
    const drawing = state.selectedDrawing || null;
    const title = displayDeviceName(d, drawing) || d.title || '';
    const drawingNote = drawing ? `${formatDrawingMailBlock(drawing)}\nLista części nie jest jeszcze podpięta do formularza — klient opisał potrzebną część ręcznie.` : formatDrawingMailBlock(null);
    return `Urządzenie ${ordinal}: ${d.deviceIndex || '[brak indeksu]'}${title ? ` — ${title}` : ''}\n${drawingNote}\n\nLista części / opis ręczny:\n${f.manualPartsDescription || '[opisz potrzebną część i dołącz zdjęcia do maila]'}`;
  }

  function generateMail() {
    if (!state.selectedDevice && !state.selectedParts.size) return;
    const f = Object.fromEntries(new FormData(els.customerForm).entries());
    const items = selectedBasketItems();
    const groups = groupSelectedParts(items);
    const manualOnly = hasManualRequestOnly(groups);
    const totalDevices = requestDeviceCount(groups);
    const titleDevice = groups[0]?.device || state.selectedDevice || {};
    const subject = totalDevices > 1
      ? `Zapytanie o części zamienne — ${totalDevices} urządzenia`
      : `Zapytanie o części zamienne — ${titleDevice.deviceIndex || state.selectedDevice?.deviceIndex || 'opis ręczny'}`.trim();

    const sections = groups.map((group, i) => formatDeviceMailSection(group, i + 1));
    if (manualOnly) sections.push(formatManualMailSection(sections.length + 1, f));
    const intro = totalDevices > 1
      ? `Proszę o sprawdzenie części do ${totalDevices} urządzeń.`
      : 'Proszę o sprawdzenie części do poniższego urządzenia.';
    const serialLine = f.serialNumber ? `\nNumer seryjny / informacja z formularza: ${f.serialNumber}\n` : '';
    const warnings = totalDevices > 1 && f.serialNumber ? '\nUwaga: numer seryjny wpisano w formularzu jako informację ogólną. Jeśli dotyczy konkretnego urządzenia, proszę potwierdzić to z klientem.\n' : '';

    const body = `Dzień dobry,\n\n${intro}${serialLine}${warnings}\n${sections.join('\n\n---\n\n')}\n\nProszę o potwierdzenie możliwości zamówienia, wycenę oraz informację o dalszych krokach.\n\nDane kontaktowe:\n${f.contactName || '[uzupełnij imię/nazwę kontaktową]'}\nEmail: ${f.contactEmail || '-'}\nTelefon: ${f.contactPhone || '-'}\n\n${invoiceMailBlock(f)}\n\n${shippingMailBlock(f)}\n\nUwagi:\n${f.notes || '-'}\n\nPozdrawiam`;
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
        const device = state.manualMode ? {deviceIndex: draft.deviceIndex, title: 'opis części do sprawdzenia' } : state.devices.find(d => norm(d.deviceIndex) === norm(draft.deviceIndex));
        if (device) {
          state.selectedDevice = device;
          state.selectedDrawing = state.drawings.find(d => String(d.id) === String(draft.drawingId)) || (!state.manualMode ? state.drawings.find(d => norm(d.deviceIndex) === norm(device.deviceIndex)) : null);
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
    renderBrandFilter(); renderDeviceResults(''); renderBasket(); renderViewer(false); goStep(1); renderContext();
  }


  function initTheme() {
    let theme = 'dark';
    try {
      const requested = new URLSearchParams(window.location.search).get('theme');
      theme = requested === 'light' ? 'light' : 'dark';
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


  function buildPdfDiagnostics() {
    const deviceKeys = new Set(state.devices.map(d => norm(d.deviceIndex)).filter(Boolean));
    const drawingKeysSet = new Set(state.drawings.flatMap(d => drawingKeys(d)));
    const duplicateFiles = [];
    const byFileId = new Map();
    const missingModel = [];
    const notMatchedToDevice = [];
    const weakBrand = [];
    for (const row of state.driveMap || []) {
      const fid = String(row.fileId || row.driveFileId || row.googleDriveId || '').trim();
      if (fid) {
        if (byFileId.has(fid)) duplicateFiles.push({fileId: fid, first: byFileId.get(fid).fileName || byFileId.get(fid).title, duplicate: row.fileName || row.title});
        else byFileId.set(fid, row);
      }
      const dev = norm(row.deviceIndex || row.model || row.normalizedModel || '');
      if (!dev) missingModel.push(slimPdfRow(row, 'Brak indeksu urządzenia'));
      else if (!deviceKeys.has(dev) && !(row.__keys || []).some(k => drawingKeysSet.has(k))) notMatchedToDevice.push(slimPdfRow(row, 'Indeks nie występuje w devices/drawings'));
      if (!brandIsConfirmed(row)) weakBrand.push(slimPdfRow(row, 'Marka do potwierdzenia'));
    }
    const externalOrphans = arr(state.pdfOrphans).map(row => ({...row, source: row.source || 'pdf-orphans.json'}));
    const report = state.pdfQualityReport || {};
    return {
      version: CONFIG.version || '',
      generatedAt: new Date().toISOString(),
      loadedDriveRows: state.driveMap.length,
      loadedDrawings: state.drawings.length,
      loadedDevices: state.devices.length,
      loadedParts: state.parts.length,
      reportSummary: report.summary || report,
      missingModel: missingModel.slice(0, 200),
      notMatchedToDevice: notMatchedToDevice.slice(0, 200),
      weakBrand: weakBrand.slice(0, 200),
      duplicateFiles: duplicateFiles.slice(0, 200),
      externalOrphans: externalOrphans.slice(0, 200),
      hints: [
        'Braki modeli dopisz w data/pdf-device-overrides.json.',
        'Po konwersji PDF uruchom pgwRefreshPdfManifestAfterConversion().',
        'Jeśli PDF ma dobry link, ale nie widać go w formularzu, sprawdź missingModel oraz notMatchedToDevice.'
      ]
    };
  }

  function slimPdfRow(row, reason) {
    return {
      reason,
      fileId: row.fileId || row.driveFileId || '',
      fileName: row.fileName || row.title || row.name || '',
      deviceIndex: row.deviceIndex || row.model || row.normalizedModel || '',
      brand: row.brand || '',
      path: row.path || row.folderPath || '',
      openUrl: row.openUrl || row.url || row.viewerUrl || ''
    };
  }

  function exposePdfDebugTools() {
    window.PGW_DEBUG = window.PGW_DEBUG || {};
    window.PGW_DEBUG.getPdfDiagnostics = () => state.pdfDiagnostics || buildPdfDiagnostics();
    window.PGW_DEBUG.refreshPdfDiagnostics = () => (state.pdfDiagnostics = buildPdfDiagnostics());
    window.PGW_DEBUG.downloadPdfDiagnostics = () => downloadJson('pgw-pdf-diagnostics.json', window.PGW_DEBUG.refreshPdfDiagnostics());
    window.PGW_DEBUG.getReleaseHealth = () => (state.releaseHealth = buildReleaseHealth());
    window.PGW_DEBUG.downloadReleaseHealth = () => downloadReleaseHealth();
    window.PGW_DEBUG.downloadSourceHealthCsv = () => downloadSourceHealthCsv();
    window.PGW_DEBUG.downloadOverrideCandidatesCsv = () => downloadOverrideCandidatesCsv();
    window.PGW_DEBUG.runSmokeTest = () => buildSmokeTest();
    window.PGW_DEBUG.downloadSmokeTest = () => downloadJson('pgw-smoke-test.json', buildSmokeTest());
    window.PGW_DEBUG.getSourceHealth = () => arr(state.sourceHealth);
  }

  function downloadJson(fileName, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }


  function buildReleaseHealth() {
    const diag = state.pdfDiagnostics || buildPdfDiagnostics();
    const rules = state.pdfQaRules || {};
    const thresholds = rules.thresholds || {};
    const sourceFailures = arr(state.sourceHealth).filter(s => !s.ok);
    const warnings = [];
    if (sourceFailures.length) warnings.push(`Nie załadowano ${sourceFailures.length} źródeł danych.`);
    if (countDiag(diag.missingModel) > Number(thresholds.maxMissingModel || 0)) warnings.push(`PDF-y bez indeksu: ${countDiag(diag.missingModel)}.`);
    if (countDiag(diag.notMatchedToDevice) > Number(thresholds.maxNotMatchedToDevice || 0)) warnings.push(`PDF-y nieprzypięte do urządzeń: ${countDiag(diag.notMatchedToDevice)}.`);
    if (countDiag(diag.duplicateFiles) > Number(thresholds.maxDuplicateFiles || 20)) warnings.push(`Duplikaty PDF: ${countDiag(diag.duplicateFiles)}.`);
    const score = computeReleaseScore(diag, sourceFailures.length);
    const deployment = state.deploymentState || {};
    return {
      version: CONFIG.version || '',
      appName: CONFIG.appName || '',
      generatedAt: new Date().toISOString(),
      score,
      status: score >= 90 && !sourceFailures.length ? 'OK' : (score >= 70 ? 'UWAGA' : 'DO_SPRAWDZENIA'),
      deployment,
      releaseInfo: state.releaseInfo || {},
      sourceHealth: arr(state.sourceHealth),
      pdfSummary: {
        loadedDriveRows: diag.loadedDriveRows,
        missingModel: countDiag(diag.missingModel),
        notMatchedToDevice: countDiag(diag.notMatchedToDevice),
        weakBrand: countDiag(diag.weakBrand),
        duplicateFiles: countDiag(diag.duplicateFiles),
        externalOrphans: countDiag(diag.externalOrphans)
      },
      warnings,
      nextActions: buildNextActions(diag, sourceFailures)
    };
  }

  function computeReleaseScore(diag, sourceFailures) {
    let score = 100;
    score -= Math.min(30, sourceFailures * 10);
    score -= Math.min(25, countDiag(diag.missingModel) * 2);
    score -= Math.min(20, countDiag(diag.notMatchedToDevice));
    score -= Math.min(10, countDiag(diag.duplicateFiles));
    score -= Math.min(10, Math.ceil(countDiag(diag.weakBrand) / 10));
    return Math.max(0, score);
  }

  function buildNextActions(diag, sourceFailures) {
    const out = [];
    if (sourceFailures.length) out.push('Sprawdź brakujące pliki JSON w folderze data albo cache-buster wersji.');
    if (countDiag(diag.missingModel)) out.push('Uzupełnij data/pdf-device-overrides.json dla PDF-ów bez indeksu.');
    if (countDiag(diag.notMatchedToDevice)) out.push('Sprawdź indeksy, których nie ma w devices/drawings — możliwe literówki lub stare modele.');
    if (countDiag(diag.duplicateFiles)) out.push('Przejrzyj duplikaty i zostaw najnowszy/najpełniejszy rysunek.');
    if (!out.length) out.push('Brak krytycznych problemów — można testować produkcyjnie z cache-busterem.');
    return out;
  }

  function downloadReleaseHealth() {
    state.releaseHealth = buildReleaseHealth();
    downloadJson('pgw-release-health.json', state.releaseHealth);
  }

  function downloadSourceHealthCsv() {
    downloadCsv('pgw-source-health.csv', arr(state.sourceHealth));
  }

  function downloadOverrideCandidatesCsv() {
    const candidates = arr(state.pdfOverrideCandidates).length ? arr(state.pdfOverrideCandidates) : allDiagnosticsRows().slice(0, 200);
    downloadCsv('pgw-pdf-override-candidates.csv', candidates);
  }


  function buildSmokeTest() {
    const searchSamples = ['YT-82806','YT82806','82200','79004','09903'];
    const sampleResults = searchSamples.map(query => {
      const q = norm(query).replace(/-/g,'');
      const matches = state.devices.filter(d => {
        const idx = norm(String(d.deviceIndex || d.index || d.model || '')).replace(/-/g,'');
        const title = norm([d.deviceIndex, d.name, d.title, d.model].filter(Boolean).join(' '));
        return idx.includes(q) || title.includes(norm(query));
      }).slice(0, 5).map(d => ({deviceIndex: d.deviceIndex || d.index || d.model || '', name: d.name || d.title || ''}));
      return {query, matches: matches.length, sample: matches};
    });
    const diag = state.pdfDiagnostics || buildPdfDiagnostics();
    const health = buildReleaseHealth();
    const sourceFailures = arr(state.sourceHealth).filter(x => !x.ok);
    const hardFailures = [];
    if (!state.devices.length) hardFailures.push('devices.json empty');
    if (!state.drawings.length) hardFailures.push('drawings.json empty');
    if (!state.parts.length) hardFailures.push('parts.json empty');
    if (!state.driveMap.length) hardFailures.push('drive PDF manifest empty');
    if (sourceFailures.some(x => /devices|drawings|parts|driveMap/.test(String(x.label)))) hardFailures.push('critical source failed');
    return {
      version: CONFIG.version || '',
      generatedAt: new Date().toISOString(),
      status: hardFailures.length ? 'fail' : (health.score >= 80 ? 'pass' : 'warning'),
      releaseScore: health.score,
      hardFailures,
      counts: {
        devices: state.devices.length,
        drawings: state.drawings.length,
        parts: state.parts.length,
        drivePdfRows: state.driveMap.length,
        sourceFailures: sourceFailures.length,
        pdfMissingModel: countDiag(diag.missingModel),
        pdfNotMatchedToDevice: countDiag(diag.notMatchedToDevice),
        pdfExternalOrphans: countDiag(diag.externalOrphans)
      },
      sourceFailures,
      searchSamples: sampleResults,
      nextActions: health.nextActions || []
    };
  }

  function initAdminPanel() {
    if (CONFIG.enableAdminPanel === false) return;
    if (document.getElementById('pgwAdminFab')) return;
    const allowed = isAdminPanelAllowed();
    window.PGW_DEBUG = window.PGW_DEBUG || {};
    window.PGW_DEBUG.openAdminPanel = () => showAdminPanel(true);
    window.PGW_DEBUG.closeAdminPanel = () => showAdminPanel(false);
    window.PGW_DEBUG.downloadPdfDiagnosticsCsv = () => downloadDiagnosticsCsv();
    window.PGW_DEBUG.downloadPdfOrphansCsv = () => downloadCsv('pgw-pdf-orphans.csv', diagnosticsRows('externalOrphans'));
    window.PGW_DEBUG.downloadPdfMissingModelCsv = () => downloadCsv('pgw-pdf-missing-model.csv', diagnosticsRows('missingModel'));
    window.PGW_DEBUG.downloadPdfWeakBrandCsv = () => downloadCsv('pgw-pdf-weak-brand.csv', diagnosticsRows('weakBrand'));
    window.PGW_DEBUG.copyPdfOverridesTemplate = () => copyText(JSON.stringify(buildOverridesTemplate(), null, 2));
    if (!allowed) return;
    injectAdminPanelStyles();
    const fab = document.createElement('button');
    fab.id = 'pgwAdminFab';
    fab.type = 'button';
    fab.className = 'pgw-admin-fab';
    fab.textContent = 'PDF QA';
    fab.title = 'Panel diagnostyczny PDF';
    fab.addEventListener('click', () => showAdminPanel(true));
    document.body.appendChild(fab);
    const panel = document.createElement('section');
    panel.id = 'pgwAdminPanel';
    panel.className = 'pgw-admin-panel';
    panel.setAttribute('aria-hidden', 'true');
    panel.innerHTML = adminPanelShellHtml();
    document.body.appendChild(panel);
    panel.querySelector('[data-admin-close]')?.addEventListener('click', () => showAdminPanel(false));
    panel.querySelector('[data-admin-refresh]')?.addEventListener('click', () => renderAdminPanel());
    panel.querySelector('[data-admin-json]')?.addEventListener('click', () => window.PGW_DEBUG.downloadPdfDiagnostics());
    panel.querySelector('[data-admin-csv]')?.addEventListener('click', () => downloadDiagnosticsCsv());
    panel.querySelector('[data-admin-orphans]')?.addEventListener('click', () => downloadCsv('pgw-pdf-orphans.csv', diagnosticsRows('externalOrphans')));
    panel.querySelector('[data-admin-overrides]')?.addEventListener('click', () => copyText(JSON.stringify(buildOverridesTemplate(), null, 2)));
    panel.querySelector('[data-admin-health]')?.addEventListener('click', () => downloadReleaseHealth());
    panel.querySelector('[data-admin-sources]')?.addEventListener('click', () => downloadSourceHealthCsv());
    panel.querySelector('[data-admin-candidates]')?.addEventListener('click', () => downloadOverrideCandidatesCsv());
    panel.querySelector('[data-admin-smoke]')?.addEventListener('click', () => window.PGW_DEBUG.downloadSmokeTest());
    renderAdminPanel();
  }

  function isAdminPanelAllowed() {
    if (CONFIG.adminPanelAlwaysVisible === true) return true;
    try {
      const params = new URLSearchParams(window.location.search || '');
      const key = CONFIG.adminPanelParam || 'admin';
      return params.has(key) || params.get('debug') === '1' || localStorage.getItem('pgw-admin-panel') === '1';
    } catch (e) { return false; }
  }

  function adminPanelShellHtml() {
    return `
      <div class="pgw-admin-card" role="dialog" aria-label="Panel diagnostyczny PDF">
        <div class="pgw-admin-head">
          <div><strong>PDF Quality Control</strong><span>v73 · stable control, klient tego nie widzi</span></div>
          <button type="button" data-admin-close aria-label="Zamknij">×</button>
        </div>
        <div class="pgw-admin-grid" data-admin-stats></div>
        <div class="pgw-admin-actions">
          <button type="button" data-admin-refresh>Odśwież</button>
          <button type="button" data-admin-json>Pobierz JSON</button>
          <button type="button" data-admin-csv>Pobierz CSV</button>
          <button type="button" data-admin-orphans>Sieroty CSV</button>
          <button type="button" data-admin-overrides>Kopiuj szablon override</button>
          <button type="button" data-admin-health>Release JSON</button>
          <button type="button" data-admin-sources>Źródła CSV</button>
          <button type="button" data-admin-candidates>Kandydaci override CSV</button>
          <button type="button" data-admin-smoke>Smoke test JSON</button>
        </div>
        <div class="pgw-admin-section">
          <h3>Najważniejsze problemy</h3>
          <div data-admin-problems></div>
        </div>
        <div class="pgw-admin-section">
          <h3>Co zrobić dalej</h3>
          <ol>
            <li>Po konwersji PDF uruchom <code>pgwRefreshPdfManifestAfterConversion()</code>.</li>
            <li>PDF-y bez indeksu dopisz do <code>data/pdf-device-overrides.json</code>.</li>
            <li>Po wrzuceniu zmian testuj stronę z parametrem <code>?admin=1&v=${escapeHtml(CONFIG.version || 'v73')}</code>.</li>
          </ol>
        </div>
      </div>`;
  }

  function showAdminPanel(open) {
    const panel = document.getElementById('pgwAdminPanel');
    if (!panel && open) {
      try { localStorage.setItem('pgw-admin-panel', '1'); } catch(e) {}
      initAdminPanel();
      return showAdminPanel(true);
    }
    if (!panel) return;
    panel.classList.toggle('is-open', !!open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) renderAdminPanel();
  }

  function renderAdminPanel() {
    const panel = document.getElementById('pgwAdminPanel');
    if (!panel) return;
    const diag = window.PGW_DEBUG?.refreshPdfDiagnostics ? window.PGW_DEBUG.refreshPdfDiagnostics() : buildPdfDiagnostics();
    const health = state.releaseHealth = buildReleaseHealth();
    const stats = [
      ['Release score', health.score + '/100'],
      ['Status', health.status],
      ['Manifest PDF', diag.loadedDriveRows],
      ['Rysunki widoczne', diag.loadedDrawings],
      ['Urządzenia', diag.loadedDevices],
      ['Części', diag.loadedParts],
      ['Brak indeksu', countDiag(diag.missingModel)],
      ['Nieprzypięte', countDiag(diag.notMatchedToDevice)],
      ['Słaba marka', countDiag(diag.weakBrand)],
      ['Duplikaty', countDiag(diag.duplicateFiles)],
      ['Sieroty z raportu', countDiag(diag.externalOrphans)]
    ];
    const statsBox = panel.querySelector('[data-admin-stats]');
    if (statsBox) statsBox.innerHTML = stats.map(([label, val]) => `<div><b>${escapeHtml(typeof val === 'number' ? fmt(val || 0) : String(val || '0'))}</b><span>${escapeHtml(label)}</span></div>`).join('');
    const problemBox = panel.querySelector('[data-admin-problems]');
    if (problemBox) problemBox.innerHTML = renderAdminProblems(diag);
  }

  function renderAdminProblems(diag) {
    const groups = [
      ['PDF bez indeksu urządzenia', diag.missingModel],
      ['PDF z indeksem, ale bez dopasowania do urządzenia', diag.notMatchedToDevice],
      ['Marka do potwierdzenia', diag.weakBrand],
      ['Duplikaty plików', diag.duplicateFiles],
      ['Sieroty z manifestu po konwersji', diag.externalOrphans]
    ];
    const health = state.releaseHealth = buildReleaseHealth();
    const healthBox = `<details open><summary>Release control: ${escapeHtml(health.status)} · ${escapeHtml(String(health.score))}/100</summary><ul>${arr(health.nextActions).map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></details>`;
    return healthBox + groups.map(([title, rows]) => {
      rows = arr(rows);
      const sample = rows.slice(0, 8).map(row => `<li><code>${escapeHtml(row.deviceIndex || row.fileId || '-')}</code> ${escapeHtml(row.fileName || row.duplicate || row.first || '')}</li>`).join('');
      return `<details ${rows.length ? 'open' : ''}><summary>${escapeHtml(title)}: ${fmt(rows.length)}</summary>${rows.length ? `<ul>${sample}</ul>` : '<p>Brak — elegancko.</p>'}</details>`;
    }).join('');
  }

  function countDiag(rows) { return Array.isArray(rows) ? rows.length : 0; }

  function diagnosticsRows(section) {
    const diag = window.PGW_DEBUG?.refreshPdfDiagnostics ? window.PGW_DEBUG.refreshPdfDiagnostics() : buildPdfDiagnostics();
    return arr(diag[section]).map(row => ({section, ...row}));
  }

  function allDiagnosticsRows() {
    return ['missingModel','notMatchedToDevice','weakBrand','duplicateFiles','externalOrphans'].flatMap(diagnosticsRows);
  }

  function downloadDiagnosticsCsv() {
    downloadCsv('pgw-pdf-diagnostics.csv', allDiagnosticsRows());
  }

  function buildOverridesTemplate() {
    const rows = allDiagnosticsRows().filter(row => row.fileName || row.fileId).slice(0, 50);
    const out = { files: {}, fileIds: {}, notes: 'Uzupełnij właściwy indeks urządzenia, np. YT-82806. Można zostawić kilka indeksów w tablicy.' };
    for (const row of rows) {
      const guess = normalizeDeviceIndex(row.deviceIndex || extractDeviceIndex(row.fileName || '')) || 'YT-XXXXX';
      if (row.fileName) out.files[row.fileName] = [guess];
      if (row.fileId) out.fileIds[row.fileId] = [guess];
    }
    return out;
  }

  function downloadCsv(fileName, rows) {
    rows = arr(rows);
    const keys = unique(rows.flatMap(row => Object.keys(row || {})));
    const csv = [keys.join(';')].concat(rows.map(row => keys.map(k => csvCell(row[k])).join(';'))).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function csvCell(value) {
    if (value == null) return '';
    const text = Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : String(value);
    return '"' + text.replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    }
  }

  function injectAdminPanelStyles() {
    if (document.getElementById('pgwAdminStyles')) return;
    const style = document.createElement('style');
    style.id = 'pgwAdminStyles';
    style.textContent = `
      .pgw-admin-fab{position:fixed;right:18px;bottom:18px;z-index:9998;border:0;border-radius:999px;padding:12px 16px;font-weight:800;box-shadow:0 10px 30px rgba(0,0,0,.28);cursor:pointer;background:#facc15;color:#111827}
      .pgw-admin-panel{position:fixed;inset:0;z-index:9999;display:none;background:rgba(2,6,23,.64);backdrop-filter:blur(3px);padding:18px;overflow:auto}
      .pgw-admin-panel.is-open{display:block}
      .pgw-admin-card{max-width:1040px;margin:24px auto;background:var(--card,#111827);color:var(--text,#f8fafc);border:1px solid rgba(148,163,184,.28);border-radius:18px;padding:18px;box-shadow:0 24px 80px rgba(0,0,0,.36)}
      .pgw-admin-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.pgw-admin-head strong{font-size:20px}.pgw-admin-head span{display:block;opacity:.72;font-size:13px;margin-top:3px}.pgw-admin-head button{border:0;background:transparent;color:inherit;font-size:30px;cursor:pointer;line-height:1}
      .pgw-admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin:12px 0}.pgw-admin-grid div{border:1px solid rgba(148,163,184,.22);border-radius:14px;padding:12px;background:rgba(148,163,184,.08)}.pgw-admin-grid b{display:block;font-size:22px}.pgw-admin-grid span{display:block;font-size:12px;opacity:.75;margin-top:4px}
      .pgw-admin-actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.pgw-admin-actions button{border:1px solid rgba(148,163,184,.35);border-radius:12px;padding:9px 12px;cursor:pointer;background:rgba(148,163,184,.12);color:inherit}
      .pgw-admin-section{margin-top:16px}.pgw-admin-section h3{margin:0 0 8px}.pgw-admin-section details{border:1px solid rgba(148,163,184,.22);border-radius:12px;padding:10px 12px;margin:8px 0;background:rgba(148,163,184,.06)}.pgw-admin-section summary{cursor:pointer;font-weight:700}.pgw-admin-section li{margin:5px 0}.pgw-admin-section code{font-size:12px;background:rgba(148,163,184,.16);border-radius:7px;padding:2px 5px}
    `;
    document.head.appendChild(style);
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


  function brandIsConfirmed(row) {
    row = row || {};
    const c = String(row.brandConfidence || '').toLowerCase();
    const r = String(row.reviewStatus || '').toLowerCase();
    const n = String(row.notes || row.brandReason || '').toLowerCase();
    const b = canonicalBrand(row.brand || inferBrand(row));
    if (!b || ['INNE','NIEZNANA','DO ROZPOZNANIA','DO POTWIERDZENIA'].includes(b)) return false;
    if (c.includes('low') || c.includes('guess')) return false;
    if (r.includes('needs') || r.includes('review') || r.includes('guess')) return false;
    if (n.includes('do potwierdzenia')) return false;
    return true;
  }

  function publicBrandLabel(row) {
    return brandIsConfirmed(row) ? canonicalBrand(row.brand || inferBrand(row)) : '';
  }

  function publicBrandText(device, drawing) {
    const label = publicBrandLabel(device) || publicBrandLabel(drawing);
    return label ? `Marka: ${escapeHtml(label)} • ` : '';
  }

  function publicBrandBadge(device) {
    const label = publicBrandLabel(device);
    return label ? `<span class="badge brand">${escapeHtml(label)}</span>` : '';
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



  function isPreferredPdf(row) {
    const text = norm([row.fileName, row.title, row.name, row.status, row.source, row.notes, row.pdfVariant].join(' '));
    return Boolean(row.preferred || row.partsExtracted || text.includes('scalone') || text.includes('verified preferred') || text.includes('verified_preferred'));
  }

  function classifyPdfVariant(row) {
    const text = norm([row.fileName, row.title, row.name, row.status, row.source, row.notes].join(' '));
    if (text.includes('scalone') || text.includes('verified preferred') || text.includes('verified_preferred')) return 'merged_parts_and_drawing';
    if (text.includes('rysunek techniczny do polaczenia')) return 'technical_source_backup';
    if (text.includes('do weryfikacji') || /(^|[ _-])(p|q)([ _.-]|$)/.test(text) || text.includes(' yeng') || text.includes(' eng')) return 'review_variant';
    if (text.includes('czesci zamienne')) return 'standard_parts_pdf';
    return 'standard_pdf';
  }

  function normalizeDrivePreviewUrl(url) {
    let out = String(url || '').trim();
    if (!out) return '';
    const m = out.match(/\/file\/d\/([^/]+)/) || out.match(/[?&]id=([^&]+)/);
    if (m) return `https://drive.google.com/file/d/${encodeURIComponent(decodeURIComponent(m[1]))}/preview`;
    return out.replace(/\/view(?:\?[^#]*)?/, '/preview').replace('?usp=drivesdk', '');
  }

  function normalizeDriveOpenUrl(url) {
    let out = String(url || '').trim();
    if (!out) return '';
    const m = out.match(/\/file\/d\/([^/]+)/) || out.match(/[?&]id=([^&]+)/);
    if (m) return `https://drive.google.com/file/d/${encodeURIComponent(decodeURIComponent(m[1]))}/view`;
    return out.replace('/preview', '/view').replace('?usp=drivesdk', '');
  }

  function standardPdfLabel(drawing, row) {
    const idx = String(drawing?.deviceIndex || row?.deviceIndex || row?.model || '').trim();
    const variant = classifyPdfVariant(row || drawing || {});
    const parts = (state.partsByDrawing && state.partsByDrawing.get(String(drawing?.id || '')) || []).length;
    const base = idx ? `Rysunek serwisowy ${idx}` : 'Rysunek serwisowy';
    const file = String(drawing?.fileName || row?.fileName || row?.title || '').replace(/\.pdf$/i, '');
    let meta = 'Podgląd PDF - GitHub Pages / Google Drive Preview';
    if (variant === 'merged_parts_and_drawing') meta = `Scalony komplet: rysunek + lista części${parts ? ` - ${fmt(parts)} części` : ''}`;
    else if (parts) meta = `Rysunek z listą części - ${fmt(parts)} części`;
    else if (variant === 'technical_source_backup') meta = 'Rysunek techniczny - źródło zapasowe';
    return {title: file || base, meta};
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
    const fid = String(drawing.driveFileId || drawing.fileId || drawing.sourceFileId || '').trim();
    const idx = norm(drawing.deviceIndex || '');
    if (fid) {
      const exact = state.driveMap.find(row => String(row.fileId || row.driveFileId || row.sourceFileId || '').trim() === fid && (!idx || norm(row.deviceIndex || row.model || row.normalizedModel || '') === idx));
      if (exact) return exact;
      const byFile = state.driveMap.find(row => String(row.fileId || row.driveFileId || row.sourceFileId || '').trim() === fid);
      if (byFile) return byFile;
    }
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
  function compactSearchKey(value) {
    return String(value || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, '');
  }

  function expandDeviceSearchToken(token) {
    const compact = compactSearchKey(token);
    const out = new Set([compact]);
    const m = compact.match(/^([A-Z]{1,3})(\d{3,9}[A-Z]?)$/);
    if (m) {
      const prefix = m[1];
      const digits = m[2].replace(/[^0-9]/g, '');
      out.add(prefix + digits);
      if (digits.length > 5) {
        out.add(prefix + digits.slice(0, 5));
        out.add(prefix + digits.slice(0, 6));
        // Common customer/catalog mismatch: one extra digit in model typed from label or PDF file name.
        for (let i = 0; i < digits.length; i++) out.add(prefix + digits.slice(0, i) + digits.slice(i + 1));
      }
      if (digits.length === 5) {
        out.add(prefix + digits);
      }
    }
    const numeric = compact.match(/^(\d{3,9})$/);
    if (numeric) {
      const digits = numeric[1];
      out.add(digits);
      if (digits.length > 5) {
        out.add(digits.slice(0, 5));
        out.add(digits.slice(0, 6));
        for (let i = 0; i < digits.length; i++) out.add(digits.slice(0, i) + digits.slice(i + 1));
      }
    }
    return [...out].filter(Boolean);
  }

  function fuzzyDeviceIndexMatch(indexCompact, queryVariants) {
    if (!indexCompact || indexCompact.length < 5) return false;
    for (const q of queryVariants || []) {
      if (!q || q.length < 5) continue;
      if (indexCompact === q || indexCompact.includes(q) || q.includes(indexCompact)) return true;
      if (Math.abs(indexCompact.length - q.length) <= 1 && boundedEditDistance(indexCompact, q, 1) <= 1) return true;
    }
    return false;
  }

  function boundedEditDistance(a, b, maxDistance) {
    a = String(a || ''); b = String(b || '');
    if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
    const prev = Array(b.length + 1).fill(0).map((_, i) => i);
    const curr = Array(b.length + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
      curr[0] = i;
      let rowMin = curr[0];
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
        if (curr[j] < rowMin) rowMin = curr[j];
      }
      if (rowMin > maxDistance) return maxDistance + 1;
      for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
    }
    return prev[b.length];
  }

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
  function drawingSelectionScore(drawing) {
    if (!drawing) return 0;
    const partCount = (state.partsByDrawing && state.partsByDrawing.get(String(drawing.id)) || []).length;
    const text = norm([drawing.fileName, drawing.title, drawing.displayTitle, drawing.status, drawing.source, drawing.notes, drawing.pdfVariant].join(' '));
    let score = partCount * 1000;
    if (drawing.preferred || text.includes('scalone')) score += 1000000;
    if (drawing.partsExtracted || text.includes('verified preferred') || text.includes('verified_preferred')) score += 800000;
    if (text.includes('czesci zamienne')) score += 300000;
    if (drawing.githubPreviewReady || text.includes('/preview')) score += 50000;
    if (text.includes('rysunek techniczny do polaczenia')) score -= 250000;
    if (text.includes('do weryfikacji') || text.includes('wariant') || text.includes('variant')) score -= 150000;
    if (/(^|[ _-])(p|q)([ _.-]|$)/.test(text) || text.includes(' yeng') || text.includes(' eng')) score -= 100000;
    return score;
  }

})();
