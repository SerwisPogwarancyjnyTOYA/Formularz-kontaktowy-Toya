/**
 * PGW Service Hub — Pełny eksporter manifestu Google Drive v51
 *
 * Cel:
 * - zeskanować folder "Rysunki wybuchowe" z PDF-ami,
 * - obsłużyć dużą liczbę plików przez kontynuację/paginację,
 * - zapisać manifest do arkusza,
 * - wygenerować plik JSON do wklejenia jako data/drive-drawings-map.full.json.
 *
 * Jak użyć:
 * 1. Utwórz pusty Google Sheet albo użyj istniejącego arkusza technicznego.
 * 2. Rozszerzenia → Apps Script.
 * 3. Wklej ten plik.
 * 4. Uruchom pgwManifestStart().
 * 5. Potem uruchamiaj pgwManifestContinue(), aż status będzie DONE.
 * 6. Uruchom pgwManifestBuildJsonFile().
 * 7. Pobierz utworzony plik drive-drawings-map.full.json i wrzuć do repo do katalogu data/.
 */

const PGW_ROOT_FOLDER_ID = '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu'; // Rysunki wybuchowe
const PGW_ROOT_FOLDER_NAME = 'Rysunki wybuchowe';
const PGW_MANIFEST_SHEET = 'drive-drawings-map';
const PGW_AUDIT_SHEET = 'manifest-audit';
const PGW_BATCH_LIMIT = 450;
const PGW_STATE_KEY = 'PGW_MANIFEST_STATE_V51';

const PGW_HEADERS = [
  'fileId', 'title', 'fileName', 'model', 'deviceIndex', 'brand', 'normalizedKey',
  'mimeType', 'viewerUrl', 'openUrl', 'downloadUrl', 'folderPath', 'parentFolderName',
  'createdTime', 'modifiedTime', 'source', 'confidence', 'detectedFrom', 'notes'
];

const BRAND_OVERRIDES = {
  // Seed do potwierdzenia / rozwijania. To nie jest święta księga, tylko podpowiedź.
  '73060': 'LUND', '79004': 'LUND', '79024': 'LUND', '79096': 'LUND', '79098': 'LUND', '79106': 'LUND',
  '79005': 'STHOR', '79030': 'STHOR', '79095': 'STHOR', '79108': 'STHOR', '79119': 'STHOR', '79140': 'STHOR', '79151': 'STHOR', '79354': 'STHOR',
  '79444': 'FLO', '79467': 'FLO',
  '00300': 'VOREL', '00320': 'VOREL', '00500': 'VOREL', '00510': 'VOREL', '00600': 'VOREL', '00610': 'VOREL', '00703': 'VOREL', '01060': 'VOREL', '09900': 'VOREL'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('PGW Manifest')
    .addItem('1. Start od zera', 'pgwManifestStart')
    .addItem('2. Kontynuuj skan', 'pgwManifestContinue')
    .addItem('3. Audyt arkusza', 'pgwManifestAudit')
    .addItem('4. Zbuduj JSON do Drive', 'pgwManifestBuildJsonFile')
    .addItem('Reset stanu', 'pgwManifestReset')
    .addToUi();
}

function pgwManifestStart() {
  pgwManifestReset();
  const state = {
    status: 'RUNNING',
    startedAt: new Date().toISOString(),
    finishedAt: '',
    folderQueue: [{ id: PGW_ROOT_FOLDER_ID, path: PGW_ROOT_FOLDER_NAME }],
    currentFolder: null,
    fileToken: '',
    folderToken: '',
    scannedFolders: 0,
    scannedFiles: 0,
    pdfRows: 0,
    skippedNonPdf: 0,
    errors: []
  };
  saveState_(state);
  return pgwManifestContinue();
}

function pgwManifestContinue() {
  const state = loadState_();
  if (!state || !state.status) throw new Error('Brak stanu. Uruchom najpierw pgwManifestStart().');
  if (state.status === 'DONE') return logStatus_('DONE — skan był już zakończony.', state);

  const sheet = getManifestSheet_();
  let processed = 0;
  const rows = [];

  while (processed < PGW_BATCH_LIMIT) {
    if (!state.currentFolder) {
      if (!state.folderQueue.length) {
        state.status = 'DONE';
        state.finishedAt = new Date().toISOString();
        appendRows_(sheet, rows);
        saveState_(state);
        pgwManifestAudit();
        return logStatus_('DONE — zakończono pełny skan Drive.', state);
      }
      state.currentFolder = state.folderQueue.shift();
      state.fileToken = '';
      state.folderToken = '';
      state.scannedFolders++;
    }

    const folder = DriveApp.getFolderById(state.currentFolder.id);

    let files = state.fileToken ? DriveApp.continueFileIterator(state.fileToken) : folder.getFiles();
    while (files.hasNext() && processed < PGW_BATCH_LIMIT) {
      const file = files.next();
      processed++;
      state.scannedFiles++;
      try {
        if (isPdf_(file)) {
          rows.push(buildManifestRow_(file, state.currentFolder.path, folder.getName()));
          state.pdfRows++;
        } else {
          state.skippedNonPdf++;
        }
      } catch (err) {
        state.errors.push(`FILE ${file.getName()}: ${err.message || err}`);
      }
    }
    appendRows_(sheet, rows.splice(0, rows.length));

    if (files.hasNext()) {
      state.fileToken = files.getContinuationToken();
      saveState_(state);
      return logStatus_(`PAUSED — zeskanowano partię ${processed} plików. Uruchom pgwManifestContinue().`, state);
    }
    state.fileToken = '';

    let folders = state.folderToken ? DriveApp.continueFolderIterator(state.folderToken) : folder.getFolders();
    while (folders.hasNext() && processed < PGW_BATCH_LIMIT) {
      const sub = folders.next();
      processed++;
      state.folderQueue.push({ id: sub.getId(), path: `${state.currentFolder.path}/${sub.getName()}` });
    }
    if (folders.hasNext()) {
      state.folderToken = folders.getContinuationToken();
      saveState_(state);
      return logStatus_(`PAUSED — dodano część podfolderów. Uruchom pgwManifestContinue().`, state);
    }

    state.folderToken = '';
    state.currentFolder = null;
  }

  appendRows_(sheet, rows);
  saveState_(state);
  return logStatus_(`PAUSED — limit partii ${PGW_BATCH_LIMIT}. Uruchom pgwManifestContinue().`, state);
}

function pgwManifestReset() {
  PropertiesService.getScriptProperties().deleteProperty(PGW_STATE_KEY);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PGW_MANIFEST_SHEET) || ss.insertSheet(PGW_MANIFEST_SHEET);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, PGW_HEADERS.length).setValues([PGW_HEADERS]);
  sheet.setFrozenRows(1);
  let audit = ss.getSheetByName(PGW_AUDIT_SHEET) || ss.insertSheet(PGW_AUDIT_SHEET);
  audit.clearContents();
  audit.getRange(1, 1, 1, 2).setValues([['metryka', 'wartość']]);
  audit.setFrozenRows(1);
}

function pgwManifestAudit() {
  const sheet = getManifestSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return;
  const headers = values[0];
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const rows = values.slice(1).filter(r => r[idx.fileId]);

  const byBrand = {};
  const byModel = {};
  const seenFileIds = new Set();
  let duplicateFileIds = 0;
  let missingModel = 0;
  let unknownBrand = 0;

  rows.forEach(r => {
    const fileId = r[idx.fileId];
    const model = r[idx.model] || r[idx.deviceIndex] || '';
    const brand = r[idx.brand] || 'INNE';
    byBrand[brand] = (byBrand[brand] || 0) + 1;
    if (model) byModel[model] = (byModel[model] || 0) + 1;
    else missingModel++;
    if (brand === 'INNE') unknownBrand++;
    if (seenFileIds.has(fileId)) duplicateFileIds++;
    seenFileIds.add(fileId);
  });

  const auditRows = [
    ['generatedAt', new Date().toISOString()],
    ['totalRows', rows.length],
    ['uniqueFileIds', seenFileIds.size],
    ['duplicateFileIds', duplicateFileIds],
    ['uniqueModels', Object.keys(byModel).length],
    ['missingModel', missingModel],
    ['unknownBrand', unknownBrand],
    ['brands', JSON.stringify(byBrand)]
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const audit = ss.getSheetByName(PGW_AUDIT_SHEET) || ss.insertSheet(PGW_AUDIT_SHEET);
  audit.clearContents();
  audit.getRange(1, 1, 1, 2).setValues([['metryka', 'wartość']]);
  audit.getRange(2, 1, auditRows.length, 2).setValues(auditRows);
  audit.autoResizeColumns(1, 2);
}

function pgwManifestBuildJsonFile() {
  const sheet = getManifestSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('Brak danych w arkuszu manifestu.');
  const headers = values[0];
  const seen = new Set();
  const objects = [];

  values.slice(1).forEach(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    if (!obj.fileId || seen.has(obj.fileId)) return;
    seen.add(obj.fileId);
    obj.type = 'pdf';
    obj.mimeType = obj.mimeType || 'application/pdf';
    obj.keys = [obj.deviceIndex, obj.model, obj.normalizedKey, obj.fileName, obj.title].filter(Boolean);
    objects.push(obj);
  });

  objects.sort((a, b) => String(a.brand).localeCompare(String(b.brand), 'pl') || String(a.deviceIndex).localeCompare(String(b.deviceIndex), 'pl'));
  const json = JSON.stringify(objects, null, 2);
  const name = `drive-drawings-map.full.${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss')}.json`;
  const file = DriveApp.createFile(name, json, MimeType.PLAIN_TEXT);
  pgwManifestAudit();
  Logger.log(`Utworzono JSON: ${file.getUrl()}`);
  SpreadsheetApp.getUi().alert(`Gotowe. Utworzono plik JSON:\n${file.getUrl()}\n\nPobierz go i zapisz w repo jako data/drive-drawings-map.full.json`);
  return file.getUrl();
}

function getManifestSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PGW_MANIFEST_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PGW_MANIFEST_SHEET);
    sheet.getRange(1, 1, 1, PGW_HEADERS.length).setValues([PGW_HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRows_(sheet, rows) {
  if (!rows || !rows.length) return;
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, PGW_HEADERS.length).setValues(rows);
}

function buildManifestRow_(file, folderPath, parentFolderName) {
  const fileId = file.getId();
  const name = file.getName();
  const model = extractModel_(name);
  const brandInfo = inferBrand_(name, folderPath, model);
  const normalizedKey = normalizeKey_(model || name);
  return [
    fileId,
    name,
    name,
    model,
    model,
    brandInfo.brand,
    normalizedKey,
    file.getMimeType(),
    `https://drive.google.com/file/d/${fileId}/preview`,
    `https://drive.google.com/file/d/${fileId}/view`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    folderPath,
    parentFolderName,
    safeDate_(file.getDateCreated()),
    safeDate_(file.getLastUpdated()),
    'GOOGLE_DRIVE_FULL_MANIFEST_V51',
    brandInfo.confidence,
    brandInfo.detectedFrom,
    ''
  ];
}

function isPdf_(file) {
  return file.getMimeType() === MimeType.PDF || /\.pdf$/i.test(file.getName());
}

function extractModel_(fileName) {
  const base = String(fileName || '')
    .replace(/\.pdf$/i, '')
    .replace(/^czesci[_ -]zamienne[_ -]*/i, '')
    .replace(/^części[_ -]zamienne[_ -]*/i, '')
    .trim();
  const upper = base.toUpperCase().replace(/_/g, '-');
  let m = upper.match(/\bYG[- ]?(\d{3,8}[A-Z]?)\b/);
  if (m) return `YG-${m[1]}`;
  m = upper.match(/\bYT[- ]?(\d{3,8}[A-Z]?)\b/);
  if (m) return `YT-${m[1]}`;
  m = upper.match(/\b(\d{3,6})\b/);
  if (m) return m[1];
  return upper;
}

function inferBrand_(fileName, folderPath, model) {
  const text = `${fileName} ${folderPath} ${model}`.toUpperCase();
  if (/YATO\s*GASTRO|\bYG[-_ ]?\d|GASTRO/.test(text)) return { brand: 'YATO GASTRO', confidence: 'wysoka', detectedFrom: 'prefix/folder' };
  if (/\bYT[-_ ]?\d|\bYATO\b/.test(text)) return { brand: 'YATO', confidence: 'wysoka', detectedFrom: 'prefix/folder' };
  for (const brand of ['STHOR', 'VOREL', 'FLO', 'LUND', 'FALA']) {
    if (text.indexOf(brand) !== -1) return { brand, confidence: 'wysoka', detectedFrom: 'folder/name' };
  }
  const override = BRAND_OVERRIDES[String(model || '').toUpperCase()];
  if (override) return { brand: override, confidence: 'średnia', detectedFrom: 'seed override' };
  return { brand: 'INNE', confidence: 'niska', detectedFrom: 'unknown' };
}

function normalizeKey_(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\.pdf$/i, '')
    .replace(/^czesci[_ -]zamienne[_ -]*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function safeDate_(d) {
  return d ? new Date(d).toISOString() : '';
}

function saveState_(state) {
  PropertiesService.getScriptProperties().setProperty(PGW_STATE_KEY, JSON.stringify(state));
}

function loadState_() {
  const raw = PropertiesService.getScriptProperties().getProperty(PGW_STATE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function logStatus_(message, state) {
  Logger.log(message);
  Logger.log(JSON.stringify(state, null, 2));
  return { message, state };
}
