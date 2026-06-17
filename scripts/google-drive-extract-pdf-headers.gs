/**
 * PGW Service Hub — ekstraktor nagłówków PDF v54
 *
 * Po co:
 * - nazwa pliku często ma tylko numer, np. Czesci_zamienne_53575.pdf,
 * - właściwa nazwa urządzenia siedzi w pierwszych liniach PDF,
 * - ten skrypt konwertuje PDF do tymczasowego Google Docs, czyta tekst,
 *   wyciąga nagłówek i tworzy kolejkę do podmiany nazw w stronie.
 *
 * Wymagane:
 * 1. Apps Script → Usługi → dodaj Drive API / Advanced Google services.
 * 2. W Google Cloud dla projektu też musi być włączone Drive API.
 * 3. Najpierw musi istnieć arkusz `drive-drawings-map` albo JSON/manifest.
 *
 * Funkcje do uruchamiania:
 * - pgwHeaderReset()
 * - pgwHeaderContinue()
 * - pgwHeaderBuildJsonFile()
 * - pgwHeaderAudit()
 */

const PGW_HEADER_SS_ID_KEY = 'PGW_V54_HEADER_SPREADSHEET_ID';
const PGW_HEADER_STATE_KEY = 'PGW_V54_HEADER_STATE';
const PGW_HEADER_SOURCE_SHEET = 'drive-drawings-map';
const PGW_HEADER_REVIEW_SHEET = 'pdf-header-review';
const PGW_HEADER_AUDIT_SHEET = 'pdf-header-audit';
const PGW_HEADER_BATCH_SIZE = 35;

function pgwHeaderReset() {
  const ss = pgwHeaderGetSpreadsheet_();
  const source = ss.getSheetByName(PGW_HEADER_SOURCE_SHEET);
  if (!source) throw new Error('Brak arkusza drive-drawings-map. Najpierw wygeneruj pełny manifest Drive.');

  const review = pgwHeaderGetOrCreateSheet_(ss, PGW_HEADER_REVIEW_SHEET);
  review.clearContents();
  review.appendRow([
    'fileId', 'model', 'oldTitle', 'oldBrand', 'suggestedDeviceName', 'suggestedDisplayTitle',
    'suggestedBrand', 'confidence', 'headerLine1', 'headerLine2', 'headerLine3', 'rawHeader',
    'previewUrl', 'status', 'notes', 'createdAt'
  ]);

  const audit = pgwHeaderGetOrCreateSheet_(ss, PGW_HEADER_AUDIT_SHEET);
  audit.clearContents();
  audit.appendRow(['timestamp', 'status', 'message', 'cursor', 'totalRows', 'processed', 'success', 'failed']);

  const values = source.getDataRange().getValues();
  const totalRows = Math.max(values.length - 1, 0);
  const state = { status: 'READY', cursor: 2, totalRows, processed: 0, success: 0, failed: 0, startedAt: new Date().toISOString(), finishedAt: null };
  pgwHeaderSaveState_(state);
  pgwHeaderAudit_('READY', 'Reset OK. Uruchom pgwHeaderContinue().', state);
  Logger.log(JSON.stringify(state, null, 2));
  return state;
}

function pgwHeaderContinue() {
  const ss = pgwHeaderGetSpreadsheet_();
  const source = ss.getSheetByName(PGW_HEADER_SOURCE_SHEET);
  if (!source) throw new Error('Brak arkusza drive-drawings-map.');
  const review = pgwHeaderGetOrCreateSheet_(ss, PGW_HEADER_REVIEW_SHEET);
  let state = pgwHeaderLoadState_();
  if (!state) throw new Error('Brak stanu. Uruchom najpierw pgwHeaderReset().');

  const headers = source.getRange(1, 1, 1, source.getLastColumn()).getValues()[0];
  const idx = pgwHeaderIndex_(headers);
  const lastRow = source.getLastRow();
  const start = Number(state.cursor || 2);
  const end = Math.min(start + PGW_HEADER_BATCH_SIZE - 1, lastRow);
  const rows = source.getRange(start, 1, Math.max(end - start + 1, 0), source.getLastColumn()).getValues();

  const out = [];
  for (const row of rows) {
    const fileId = row[idx.fileId];
    const mime = row[idx.mimeType];
    if (!fileId || mime !== 'application/pdf') {
      state.processed++;
      continue;
    }

    const model = String(row[idx.model] || row[idx.normalizedModel] || '').trim();
    const oldTitle = String(row[idx.title] || '').trim();
    const oldBrand = String(row[idx.brand] || '').trim();
    const previewUrl = String(row[idx.previewUrl] || '').trim();

    try {
      const text = pgwHeaderPdfToText_(fileId);
      const parsed = pgwHeaderParse_(text, model, oldTitle, oldBrand);
      out.push([
        fileId, model, oldTitle, oldBrand,
        parsed.deviceName, parsed.displayTitle, parsed.brand, parsed.confidence,
        parsed.lines[0] || '', parsed.lines[1] || '', parsed.lines[2] || '', parsed.rawHeader,
        previewUrl, parsed.status, parsed.notes, new Date()
      ]);
      state.success++;
    } catch (err) {
      out.push([fileId, model, oldTitle, oldBrand, '', '', oldBrand || '', 'failed', '', '', '', '', previewUrl, 'ERROR', err.message, new Date()]);
      state.failed++;
    }

    state.processed++;
    Utilities.sleep(150);
  }

  if (out.length) review.getRange(review.getLastRow() + 1, 1, out.length, out[0].length).setValues(out);

  state.cursor = end + 1;
  if (state.cursor > lastRow) {
    state.status = 'DONE';
    state.finishedAt = new Date().toISOString();
    pgwHeaderAudit_('DONE', 'Ekstrakcja nagłówków zakończona. Uruchom pgwHeaderBuildJsonFile().', state);
  } else {
    state.status = 'PAUSED';
    pgwHeaderAudit_('PAUSED', 'Partia zakończona. Uruchom pgwHeaderContinue() ponownie.', state);
  }
  pgwHeaderSaveState_(state);
  Logger.log(JSON.stringify(state, null, 2));
  return state;
}

function pgwHeaderBuildJsonFile() {
  const ss = pgwHeaderGetSpreadsheet_();
  const sheet = ss.getSheetByName(PGW_HEADER_REVIEW_SHEET);
  if (!sheet) throw new Error('Brak arkusza pdf-header-review.');
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('Brak danych w pdf-header-review.');
  const headers = values[0];
  const rows = values.slice(1);
  const idx = pgwHeaderIndex_(headers);

  const byFileId = {};
  for (const row of rows) {
    const fileId = String(row[idx.fileId] || '').trim();
    if (!fileId) continue;
    byFileId[fileId] = {
      fileId,
      model: row[idx.model] || '',
      deviceName: row[idx.suggestedDeviceName] || '',
      displayTitle: row[idx.suggestedDisplayTitle] || '',
      brand: row[idx.suggestedBrand] || row[idx.oldBrand] || '',
      confidence: row[idx.confidence] || '',
      headerText: row[idx.rawHeader] || '',
      headerLine1: row[idx.headerLine1] || '',
      headerLine2: row[idx.headerLine2] || '',
      headerLine3: row[idx.headerLine3] || '',
      status: row[idx.status] || '',
      notes: row[idx.notes] || '',
      source: 'pdf-header-extractor-v54'
    };
  }

  const output = { generatedAt: new Date().toISOString(), count: Object.keys(byFileId).length, byFileId };
  const json = JSON.stringify(output, null, 2);
  const name = 'pdf-header-overrides.' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '.json';
  const file = DriveApp.createFile(name, json, MimeType.PLAIN_TEXT);
  Logger.log('Utworzono JSON nagłówków:');
  Logger.log(file.getUrl());
  Logger.log('Liczba wpisów: ' + output.count);
  return file.getUrl();
}

function pgwHeaderAudit() {
  const ss = pgwHeaderGetSpreadsheet_();
  const state = pgwHeaderLoadState_();
  Logger.log('Arkusz: ' + ss.getUrl());
  Logger.log(JSON.stringify(state, null, 2));
  return { spreadsheetUrl: ss.getUrl(), state };
}

function pgwHeaderPdfToText_(fileId) {
  // Wymaga włączonego Advanced Drive Service: Drive API.
  const file = DriveApp.getFileById(fileId);
  const tempTitle = 'TMP_PGW_HEADER_' + fileId + '_' + Date.now();
  const resource = { title: tempTitle, mimeType: MimeType.GOOGLE_DOCS };
  const copied = Drive.Files.copy(resource, fileId, { ocr: false });
  const docId = copied.id;
  let text = '';
  try {
    Utilities.sleep(1200);
    const doc = DocumentApp.openById(docId);
    text = doc.getBody().getText();
  } finally {
    try { DriveApp.getFileById(docId).setTrashed(true); } catch (e) {}
  }
  return text || '';
}

function pgwHeaderParse_(text, model, oldTitle, oldBrand) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 18);

  const junk = /^(CZ[EĘ]ŚCI ZAMIENNE|TOYA S\.A\.|AKTUALIZACJA|W wyniku|Rysunek złożeniowy|Lista części|NO SAP|LP|NR|POS\.?|MODEL)$/i;
  const useful = lines.filter(l => !junk.test(l));
  const modelText = String(model || '').trim();
  let deviceName = '';
  let displayTitle = '';
  let confidence = 'low';
  let status = 'NEEDS_REVIEW';
  let notes = '';

  const modelRegex = modelText ? new RegExp('^' + modelText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*[-–—:]\\s*(.+)$', 'i') : null;
  for (let i = 0; i < useful.length; i++) {
    const line = useful[i];
    const m = modelRegex ? line.match(modelRegex) : null;
    if (m && m[1]) {
      deviceName = m[1].trim();
      const next = useful[i+1] || '';
      if (next && !/^\d+\s/.test(next) && next.length < 80 && !junk.test(next)) deviceName += ' ' + next;
      confidence = 'high';
      status = 'OK';
      break;
    }
  }

  if (!deviceName) {
    const candidate = useful.find(l => !/^\d+\s+[A-Z0-9]/.test(l) && l.length > 6 && l.length < 120);
    if (candidate) {
      deviceName = candidate.replace(/^\d{3,8}\s*[-–—:]\s*/, '').trim();
      confidence = 'medium';
      status = 'NEEDS_REVIEW';
    }
  }

  if (modelText && deviceName) displayTitle = modelText + ' — ' + deviceName;
  else displayTitle = deviceName || oldTitle || modelText;

  const brandGuess = pgwHeaderGuessBrand_(text, modelText, oldTitle, oldBrand);
  if (confidence !== 'high') notes = 'Nazwa wymaga szybkiego sprawdzenia w podglądzie PDF.';

  return { deviceName, displayTitle, brand: brandGuess.brand, confidence, status, notes: notes || brandGuess.notes, lines: useful.slice(0, 3), rawHeader: lines.slice(0, 12).join('\n') };
}

function pgwHeaderGuessBrand_(text, model, title, oldBrand) {
  const hay = [text, model, title, oldBrand].join(' ').toUpperCase();
  if (hay.includes('YATO GASTRO') || /^YG[-_ ]?\d+/i.test(model)) return { brand: 'YATO GASTRO', notes: 'Marka z PDF/modelu.' };
  if (/^YT[-_ ]?\d+/i.test(model)) return { brand: 'YATO', notes: 'Marka z modelu YT.' };
  if (hay.includes('STHOR')) return { brand: 'STHOR', notes: 'Marka z tekstu PDF.' };
  if (hay.includes('LUND')) return { brand: 'LUND', notes: 'Marka z tekstu PDF.' };
  if (hay.includes('VOREL')) return { brand: 'VOREL', notes: 'Marka z tekstu PDF.' };
  if (hay.includes('FLO')) return { brand: 'FLO', notes: 'Marka z tekstu PDF.' };
  if (oldBrand && oldBrand !== 'DO ROZPOZNANIA') return { brand: oldBrand, notes: 'Marka z manifestu.' };
  return { brand: oldBrand || 'DO ROZPOZNANIA', notes: 'Marka do potwierdzenia.' };
}

function pgwHeaderGetSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty(PGW_HEADER_SS_ID_KEY) || props.getProperty('PGW_V51_MANIFEST_SPREADSHEET_ID');
  if (savedId) return SpreadsheetApp.openById(savedId);
  const ss = SpreadsheetApp.create('PGW — nagłówki PDF — ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'));
  props.setProperty(PGW_HEADER_SS_ID_KEY, ss.getId());
  return ss;
}

function pgwHeaderGetOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function pgwHeaderSaveState_(state) {
  PropertiesService.getScriptProperties().setProperty(PGW_HEADER_STATE_KEY, JSON.stringify(state));
}

function pgwHeaderLoadState_() {
  const raw = PropertiesService.getScriptProperties().getProperty(PGW_HEADER_STATE_KEY);
  return raw ? JSON.parse(raw) : null;
}

function pgwHeaderAudit_(status, message, state) {
  const ss = pgwHeaderGetSpreadsheet_();
  const sheet = pgwHeaderGetOrCreateSheet_(ss, PGW_HEADER_AUDIT_SHEET);
  sheet.appendRow([new Date(), status, message, state.cursor, state.totalRows, state.processed, state.success, state.failed]);
  Logger.log(message);
}

function pgwHeaderIndex_(headers) {
  const out = {};
  headers.forEach((h, i) => out[String(h).trim()] = i);
  return out;
}
