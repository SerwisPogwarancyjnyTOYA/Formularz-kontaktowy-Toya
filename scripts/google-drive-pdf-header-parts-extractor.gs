/**
 * PGW v66 — PDF header + parts extractor
 *
 * Cel:
 * - przelecieć PDF-y z Drive, które mają rysunek złożeniowy,
 * - wyciągnąć nagłówek: model + nazwa urządzenia,
 * - zrobić wstępny preview części z tabel PDF,
 * - wyeksportować JSON-y do Drive.
 *
 * Wymaga w Apps Script:
 * 1) Services / Usługi zaawansowane Google: Drive API = ON
 * 2) Google Cloud project: Drive API = ON
 *
 * Kolejność uruchomienia:
 * pgwPdfExtractSetup()
 * pgwPdfExtractLoadQueueFromSheet()  // albo ręcznie wkleić kolejkę do arkusza pdf_extract_queue
 * pgwPdfExtractContinue()            // uruchamiać partiami, aż status DONE
 * pgwPdfExtractBuildJsonFiles()
 * pgwPdfExtractAudit()
 */

const PGW_PDF_EXTRACT_SPREADSHEET_KEY = 'PGW_PDF_EXTRACT_SPREADSHEET_ID_V66';
const PGW_PDF_EXTRACT_STATE_KEY = 'PGW_PDF_EXTRACT_STATE_V66';
const PGW_PDF_EXTRACT_ROOT_FOLDER_ID = '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu'; // Rysunki wybuchowe
const PGW_PDF_EXTRACT_BATCH_LIMIT = 20; // OCR PDF → Google Docs bywa wolny; lepiej partiami.

const PGW_PDF_SHEETS = {
  queue: 'pdf_extract_queue',
  headers: 'pdf_header_extract',
  parts: 'pdf_parts_extract_preview',
  errors: 'pdf_extract_errors',
  audit: 'pdf_extract_audit'
};

function pgwPdfExtractSetup() {
  const ss = pgwPdfGetSpreadsheet_();
  pgwPdfEnsureSheet_(ss, PGW_PDF_SHEETS.queue, [
    'fileId','model','brand','fileName','currentTitle','needsTitle','needsParts','drawingId','viewerUrl','openUrl','status','notes'
  ]);
  pgwPdfEnsureSheet_(ss, PGW_PDF_SHEETS.headers, [
    'fileId','model','deviceName','displayTitle','confidence','headerText','sourceFileName','rawFirstLines','docId','status','notes','extractedAt'
  ]);
  pgwPdfEnsureSheet_(ss, PGW_PDF_SHEETS.parts, [
    'fileId','model','position','partIndex','nameEn','namePl','rawLine','confidence','status','extractedAt'
  ]);
  pgwPdfEnsureSheet_(ss, PGW_PDF_SHEETS.errors, [
    'fileId','model','fileName','error','when'
  ]);
  pgwPdfEnsureSheet_(ss, PGW_PDF_SHEETS.audit, [
    'timestamp','status','message','queueTotal','processed','headers','parts','errors'
  ]);
  Logger.log('Arkusz ekstrakcji: ' + ss.getUrl());
  return ss.getUrl();
}

/**
 * Wariant szybki: skanuje folder Drive i buduje kolejkę z PDF-ów.
 * Jeśli masz już data/pdf-header-extraction-queue.csv, możesz wkleić ją do arkusza ręcznie zamiast tego.
 */
function pgwPdfExtractLoadQueueFromDrive() {
  const ss = pgwPdfGetSpreadsheet_();
  const sheet = pgwPdfResetSheet_(ss, PGW_PDF_SHEETS.queue, [
    'fileId','model','brand','fileName','currentTitle','needsTitle','needsParts','drawingId','viewerUrl','openUrl','status','notes'
  ]);
  const rows = [];
  pgwPdfWalkFolder_(DriveApp.getFolderById(PGW_PDF_EXTRACT_ROOT_FOLDER_ID), 'Rysunki wybuchowe', rows);
  if (rows.length) sheet.getRange(2,1,rows.length,rows[0].length).setValues(rows);
  const state = { status: 'READY', row: 2, processed: 0, headers: 0, parts: 0, errors: 0, startedAt: new Date().toISOString(), finishedAt: null };
  pgwPdfSaveState_(state);
  pgwPdfAudit_('READY','Kolejka zbudowana z Drive. Uruchom pgwPdfExtractContinue().');
  Logger.log('Kolejka PDF: ' + rows.length);
  return rows.length;
}

/**
 * Wariant do arkusza: użyj gdy wkleiłeś CSV data/pdf-header-extraction-queue.csv do pdf_extract_queue.
 */
function pgwPdfExtractLoadQueueFromSheet() {
  const ss = pgwPdfGetSpreadsheet_();
  const sheet = ss.getSheetByName(PGW_PDF_SHEETS.queue);
  if (!sheet || sheet.getLastRow() < 2) throw new Error('Brak kolejki. Wklej CSV do pdf_extract_queue albo uruchom pgwPdfExtractLoadQueueFromDrive().');
  const state = { status: 'READY', row: 2, processed: 0, headers: 0, parts: 0, errors: 0, startedAt: new Date().toISOString(), finishedAt: null };
  pgwPdfSaveState_(state);
  pgwPdfAudit_('READY','Kolejka z arkusza gotowa. Uruchom pgwPdfExtractContinue().');
  return state;
}

function pgwPdfExtractContinue() {
  const ss = pgwPdfGetSpreadsheet_();
  const queue = ss.getSheetByName(PGW_PDF_SHEETS.queue);
  if (!queue) throw new Error('Brak arkusza kolejki. Uruchom pgwPdfExtractSetup().');
  const last = queue.getLastRow();
  if (last < 2) throw new Error('Kolejka jest pusta.');

  let state = pgwPdfLoadState_() || { status: 'READY', row: 2, processed: 0, headers: 0, parts: 0, errors: 0 };
  if (state.status === 'DONE') {
    Logger.log('Już zakończone.');
    return state;
  }
  state.status = 'RUNNING';

  const headerSheet = ss.getSheetByName(PGW_PDF_SHEETS.headers);
  const partSheet = ss.getSheetByName(PGW_PDF_SHEETS.parts);
  const errorSheet = ss.getSheetByName(PGW_PDF_SHEETS.errors);

  let processedThisRun = 0;
  while (state.row <= last && processedThisRun < PGW_PDF_EXTRACT_BATCH_LIMIT) {
    const values = queue.getRange(state.row, 1, 1, 12).getValues()[0];
    const rec = pgwPdfQueueRow_(values);
    try {
      if (!rec.fileId) throw new Error('Brak fileId w kolejce.');
      queue.getRange(state.row, 11).setValue('RUNNING');
      const extracted = pgwPdfExtractOne_(rec);

      if (extracted.header) {
        headerSheet.appendRow([
          rec.fileId,
          extracted.header.model || rec.model,
          extracted.header.deviceName || '',
          extracted.header.displayTitle || '',
          extracted.header.confidence || '',
          extracted.header.headerText || '',
          rec.fileName || '',
          extracted.firstLines || '',
          extracted.docId || '',
          'OK',
          extracted.header.notes || '',
          new Date()
        ]);
        state.headers++;
      }

      for (const p of extracted.parts || []) {
        partSheet.appendRow([
          rec.fileId,
          p.model || rec.model,
          p.position || '',
          p.partIndex || '',
          p.nameEn || '',
          p.namePl || '',
          p.rawLine || '',
          p.confidence || '',
          'PREVIEW',
          new Date()
        ]);
        state.parts++;
      }

      queue.getRange(state.row, 11).setValue('DONE');
      queue.getRange(state.row, 12).setValue('header=' + (extracted.header ? 'yes' : 'no') + ', parts=' + (extracted.parts || []).length);
    } catch (err) {
      errorSheet.appendRow([rec.fileId || '', rec.model || '', rec.fileName || '', String(err && err.message || err), new Date()]);
      queue.getRange(state.row, 11).setValue('ERROR');
      queue.getRange(state.row, 12).setValue(String(err && err.message || err));
      state.errors++;
    }
    state.row++;
    state.processed++;
    processedThisRun++;
    pgwPdfSaveState_(state);
  }

  if (state.row > last) {
    state.status = 'DONE';
    state.finishedAt = new Date().toISOString();
    pgwPdfAudit_('DONE','Ekstrakcja zakończona. Uruchom pgwPdfExtractBuildJsonFiles().');
  } else {
    state.status = 'PAUSED';
    pgwPdfAudit_('PAUSED','Partia zakończona. Uruchom pgwPdfExtractContinue() ponownie.');
  }
  pgwPdfSaveState_(state);
  Logger.log(JSON.stringify(state, null, 2));
  return state;
}

function pgwPdfExtractBuildJsonFiles() {
  const ss = pgwPdfGetSpreadsheet_();
  const headers = pgwPdfSheetObjects_(ss.getSheetByName(PGW_PDF_SHEETS.headers));
  const parts = pgwPdfSheetObjects_(ss.getSheetByName(PGW_PDF_SHEETS.parts));

  const byFileId = {};
  const byModel = {};
  headers.filter(r => r.fileId && r.deviceName).forEach(r => {
    const model = pgwPdfNormModel_(r.model);
    const item = {
      model,
      deviceName: String(r.deviceName || '').trim(),
      displayTitle: String(r.displayTitle || '').trim() || (model + ' — ' + String(r.deviceName || '').trim()),
      headerText: String(r.headerText || '').trim(),
      confidence: String(r.confidence || 'medium').trim(),
      source: 'apps-script-pdf-header-extractor-v66',
      rawFirstLines: String(r.rawFirstLines || '').trim()
    };
    byFileId[String(r.fileId).trim()] = item;
    if (model) byModel[model] = item;
  });

  const headerOutput = {
    generatedAt: new Date().toISOString(),
    version: 'v66-apps-script-output',
    count: Object.keys(byFileId).length,
    byFileId,
    byModel
  };
  const partsOutput = {
    generatedAt: new Date().toISOString(),
    version: 'v66-preview',
    count: parts.length,
    status: 'preview_do_not_publish_without_review',
    items: parts
  };

  const headerFile = DriveApp.createFile('pdf-header-overrides.generated.' + pgwPdfStamp_() + '.json', JSON.stringify(headerOutput, null, 2), MimeType.PLAIN_TEXT);
  const partsFile = DriveApp.createFile('pdf-parts-extracted.generated.' + pgwPdfStamp_() + '.json', JSON.stringify(partsOutput, null, 2), MimeType.PLAIN_TEXT);

  Logger.log('Nagłówki JSON: ' + headerFile.getUrl());
  Logger.log('Części preview JSON: ' + partsFile.getUrl());
  return { headers: headerFile.getUrl(), partsPreview: partsFile.getUrl() };
}

function pgwPdfExtractAudit() {
  const ss = pgwPdfGetSpreadsheet_();
  const state = pgwPdfLoadState_();
  const result = {
    spreadsheetUrl: ss.getUrl(),
    state,
    queueRows: pgwPdfCountRows_(ss.getSheetByName(PGW_PDF_SHEETS.queue)),
    headers: pgwPdfCountRows_(ss.getSheetByName(PGW_PDF_SHEETS.headers)),
    partsPreview: pgwPdfCountRows_(ss.getSheetByName(PGW_PDF_SHEETS.parts)),
    errors: pgwPdfCountRows_(ss.getSheetByName(PGW_PDF_SHEETS.errors))
  };
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

function pgwPdfExtractOne_(rec) {
  const tmp = Drive.Files.copy({ title: 'PGW_TMP_OCR_' + rec.fileId, mimeType: MimeType.GOOGLE_DOCS }, rec.fileId, { ocr: true, ocrLanguage: 'pl' });
  const docId = tmp.id;
  let text = '';
  try {
    text = DocumentApp.openById(docId).getBody().getText();
  } finally {
    try { DriveApp.getFileById(docId).setTrashed(true); } catch(e) {}
  }
  text = pgwPdfClean_(text);
  const firstLines = text.split('\n').slice(0, 14).join(' | ');
  const header = pgwPdfParseHeader_(text, rec.model);
  const parts = pgwPdfParseParts_(text, rec.model).slice(0, 300);
  return { docId, text, firstLines, header, parts };
}

function pgwPdfParseHeader_(text, fallbackModel) {
  const clean = pgwPdfClean_(text).replace(/\n+/g, ' ');
  const upper = clean.toUpperCase();
  let cut = clean.length;
  [' CZĘŚCI ZAMIENNE',' CZESCI ZAMIENNE',' TOYA S.A.',' AKTUALIZACJA:',' RYSUNEK ZŁOŻENIOWY',' LISTA CZĘŚCI'].forEach(marker => {
    const i = upper.indexOf(marker);
    if (i >= 0) cut = Math.min(cut, i);
  });
  let head = clean.slice(0, Math.min(cut, 220)).replace(/[_]{3,}.*/, '').trim();
  let m = head.match(/^([A-Z]{1,4}[- ]?\d{3,8}|\d{3,8})\s*[-–—:]\s*(.+)$/i);
  if (!m) {
    const model = pgwPdfNormModel_(fallbackModel);
    if (model && head.toUpperCase().startsWith(model)) {
      m = [head, model, head.slice(model.length).replace(/^\s*[-–—:]\s*/, '')];
    }
  }
  if (!m) return null;
  const model = pgwPdfNormModel_(m[1]);
  let name = pgwPdfClean_(m[2]).replace(/\b(CZĘŚCI|CZESCI|TOYA\s*S\.A\.|AKTUALIZACJA).*$/i, '').trim(' -–—:');
  if (!name || name.length < 3) return null;
  name = name.toUpperCase();
  return {
    model,
    deviceName: name,
    displayTitle: model ? model + ' — ' + name : name,
    headerText: model ? model + ' - ' + name : name,
    confidence: 'high',
    notes: 'Nagłówek wyciągnięty z PDF/OCR.'
  };
}

function pgwPdfParseParts_(text, fallbackModel) {
  const lines = String(text || '').split(/\n+/).map(pgwPdfClean_).filter(Boolean);
  const out = [];
  const model = pgwPdfNormModel_(fallbackModel);
  const partRe = /^(\d+(?:\s*,\s*\d+)*(?:\s*-\s*\d+)?|[A-Z]?\d+(?:-[A-Z]?\d+)?)\s+([A-ZŻŹĆĄŚĘŁÓŃ0-9-]{2,}[A-Z0-9])\s+(.+)$/i;
  for (const line of lines) {
    if (/^(NO|NR|LP|POZ|INDEKS|PART|NAME|NAZWA)\b/i.test(line)) continue;
    const m = line.match(partRe);
    if (!m) continue;
    const position = pgwPdfClean_(m[1]);
    const partIndex = pgwPdfClean_(m[2]).toUpperCase();
    const rest = pgwPdfClean_(m[3]);
    if (!/^Z[A-Z0-9-]{4,}$/i.test(partIndex) && !/^[A-Z]{1,4}\d{4,}/.test(partIndex)) continue;
    const split = pgwPdfSplitPartNames_(rest);
    out.push({
      model,
      position,
      partIndex,
      nameEn: split.en,
      namePl: split.pl,
      rawLine: line,
      confidence: split.pl ? 'medium' : 'low'
    });
  }
  return out;
}

function pgwPdfSplitPartNames_(rest) {
  const words = String(rest || '').trim().split(/\s+/);
  let firstPl = words.findIndex(w => /[ĄĆĘŁŃÓŚŻŹ]/.test(w));
  if (firstPl > 0) return { en: words.slice(0, firstPl).join(' '), pl: words.slice(firstPl).join(' ') };
  return { en: rest, pl: '' };
}

function pgwPdfWalkFolder_(folder, path, rows) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() !== MimeType.PDF && file.getMimeType() !== 'application/pdf') continue;
    const fileName = file.getName();
    const model = pgwPdfExtractModel_(fileName);
    rows.push([
      file.getId(), model, pgwPdfGuessBrand_(model, fileName, path), fileName, fileName,
      true, true, '', 'https://drive.google.com/file/d/' + file.getId() + '/preview', file.getUrl(), '', ''
    ]);
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const sub = folders.next();
    pgwPdfWalkFolder_(sub, path + '/' + sub.getName(), rows);
  }
}

function pgwPdfQueueRow_(v) {
  return { fileId: String(v[0] || '').trim(), model: String(v[1] || '').trim(), brand: String(v[2] || '').trim(), fileName: String(v[3] || '').trim(), currentTitle: String(v[4] || '').trim() };
}
function pgwPdfGetSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty(PGW_PDF_EXTRACT_SPREADSHEET_KEY);
  if (saved) { try { return SpreadsheetApp.openById(saved); } catch(e) {} }
  const ss = SpreadsheetApp.create('PGW — PDF header/parts extractor v66 — ' + pgwPdfStamp_());
  props.setProperty(PGW_PDF_EXTRACT_SPREADSHEET_KEY, ss.getId());
  return ss;
}
function pgwPdfEnsureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}
function pgwPdfResetSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.appendRow(headers);
  return sh;
}
function pgwPdfSheetObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values.filter(r => r.some(Boolean)).map(r => {
    const o = {}; headers.forEach((h,i)=>o[h]=r[i]); return o;
  });
}
function pgwPdfSaveState_(s) { PropertiesService.getScriptProperties().setProperty(PGW_PDF_EXTRACT_STATE_KEY, JSON.stringify(s)); }
function pgwPdfLoadState_() { const raw = PropertiesService.getScriptProperties().getProperty(PGW_PDF_EXTRACT_STATE_KEY); return raw ? JSON.parse(raw) : null; }
function pgwPdfAudit_(status, message) {
  const ss = pgwPdfGetSpreadsheet_();
  const sh = pgwPdfEnsureSheet_(ss, PGW_PDF_SHEETS.audit, ['timestamp','status','message','queueTotal','processed','headers','parts','errors']);
  const state = pgwPdfLoadState_() || {};
  sh.appendRow([new Date(), status, message, pgwPdfCountRows_(ss.getSheetByName(PGW_PDF_SHEETS.queue)), state.processed || 0, state.headers || 0, state.parts || 0, state.errors || 0]);
  Logger.log(message);
}
function pgwPdfCountRows_(sheet) { return sheet ? Math.max(0, sheet.getLastRow() - 1) : 0; }
function pgwPdfClean_(s) { return String(s || '').replace(/\u0002/g, '-').replace(/\s+/g, ' ').trim(); }
function pgwPdfNormModel_(s) { return String(s || '').toUpperCase().replace(/_/g,'-').replace(/\s+/g,'').trim(); }
function pgwPdfExtractModel_(name) { const m = String(name || '').match(/\b([A-Z]{1,4}[-_ ]?\d{3,8}|\d{3,8})\b/i); return m ? pgwPdfNormModel_(m[1]) : ''; }
function pgwPdfGuessBrand_(model, fileName, path) {
  const hay = [model,fileName,path].join(' ').toUpperCase();
  const m = pgwPdfNormModel_(model);
  if (m.startsWith('YT')) return 'YATO';
  if (m.startsWith('YG')) return 'YATO GASTRO';
  if (hay.includes('STHOR')) return 'STHOR';
  if (hay.includes('VOREL')) return 'VOREL';
  if (hay.includes('LUND')) return 'LUND';
  if (hay.includes('FLO')) return 'FLO';
  if (hay.includes('FALA')) return 'FALA';
  return 'INNE';
}
function pgwPdfStamp_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Warsaw', 'yyyyMMdd-HHmmss'); }
