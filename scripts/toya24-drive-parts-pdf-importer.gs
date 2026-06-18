/**
 * PGW Service Hub — TOYA24 części zamienne PDF → Google Drive importer v65
 *
 * Cel:
 * - znaleźć załączniki typu „części zamienne” na TOYA24,
 * - pobrać PDF-y,
 * - wrzucić je do folderu Drive „Rysunki wybuchowe”,
 * - przygotować log do dalszego merge z katalogiem formularza.
 *
 * Uwaga:
 * Uruchamiaj z Apps Script na koncie, które ma dostęp do folderu docelowego.
 * GitHub Pages nie scrapuje TOYA24 live. To jest narzędzie serwisowe/administracyjne.
 */

const PGW_TOYA24_CFG = {
  // Folder Drive: PGW - Rysunki / Rysunki wybuchowe
  TARGET_FOLDER_ID: '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu',

  // Arkusz roboczy: PGW Service Hub - pelna baza TOYA24 import 2026-06-07
  SPREADSHEET_ID: '1V1RTRhdGG_jfheTEz5dvdWI2mt5f3seiYwiuUBC2RZg',

  PRODUCTS_SHEET: 'TOYA24_produkty',
  ATTACHMENTS_SHEET: 'TOYA24_zalaczniki',
  MANUAL_QUEUE_SHEET: 'TOYA24_import_queue_manual',
  FOUND_SHEET: 'TOYA24_found_parts_pdfs',
  UPLOAD_LOG_SHEET: 'TOYA24_uploaded_to_drive',
  ERROR_SHEET: 'TOYA24_import_errors',

  // Ile produktów/załączników przetwarzać jednorazowo, żeby nie ubić limitu czasu Apps Script.
  MAX_ROWS_PER_RUN: 80,
  MAX_UPLOADS_PER_RUN: 30,

  // Jeśli true, importer nie wrzuca plików, tylko loguje co by zrobił.
  DRY_RUN: false,

  USER_AGENT: 'PGW-Service-Hub-TOYA24-Importer/1.0',
};

function pgwToya24Setup() {
  const ss = pgwToya24GetSpreadsheet_();
  pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.MANUAL_QUEUE_SHEET, [
    'status', 'model', 'productUrl', 'notes'
  ]);
  pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.FOUND_SHEET, [
    'status', 'model', 'attachmentTitle', 'attachmentUrl', 'attachmentKey', 'sourceProductUrl',
    'reason', 'lastChecked', 'notes'
  ]);
  pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.UPLOAD_LOG_SHEET, [
    'status', 'model', 'fileName', 'driveFileId', 'driveUrl', 'attachmentUrl', 'sourceProductUrl',
    'uploadedAt', 'notes'
  ]);
  pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.ERROR_SHEET, [
    'when', 'stage', 'model', 'url', 'error'
  ]);
  Logger.log('Setup OK: ' + ss.getUrl());
  return ss.getUrl();
}

/**
 * Krok 1: skanuje ręczne kolejki i arkusz produktów TOYA24, szuka załączników „części zamienne”.
 */
function pgwToya24ScanProductsForPartsPdfs() {
  const ss = pgwToya24GetSpreadsheet_();
  const foundSheet = pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.FOUND_SHEET, [
    'status', 'model', 'attachmentTitle', 'attachmentUrl', 'attachmentKey', 'sourceProductUrl',
    'reason', 'lastChecked', 'notes'
  ]);

  const existingKeys = pgwToya24ReadExistingKeys_(foundSheet, 5);
  const productRows = pgwToya24CollectProductUrls_(ss);
  let processed = 0;
  let added = 0;

  for (const item of productRows) {
    if (processed >= PGW_TOYA24_CFG.MAX_ROWS_PER_RUN) break;
    processed++;

    try {
      const html = pgwToya24FetchText_(item.productUrl);
      const links = pgwToya24FindPartsAttachments_(html, item.productUrl, item.model);
      links.forEach(link => {
        const key = link.attachmentKey || link.attachmentUrl;
        if (existingKeys[key]) return;
        foundSheet.appendRow([
          'found',
          link.model || item.model || '',
          link.attachmentTitle || 'Części zamienne',
          link.attachmentUrl,
          key,
          item.productUrl,
          link.reason || 'product-page-scan',
          new Date(),
          ''
        ]);
        existingKeys[key] = true;
        added++;
      });
    } catch (err) {
      pgwToya24LogError_(ss, 'scan-product', item.model, item.productUrl, err);
    }
  }

  Logger.log(JSON.stringify({ processed, added }, null, 2));
  return { processed, added };
}

/**
 * Krok 1b: bierze istniejące wpisy z TOYA24_zalaczniki i przenosi znalezione części PDF do kolejki uploadu.
 */
function pgwToya24SeedFoundFromAttachmentsSheet() {
  const ss = pgwToya24GetSpreadsheet_();
  const source = ss.getSheetByName(PGW_TOYA24_CFG.ATTACHMENTS_SHEET);
  if (!source) throw new Error('Brak arkusza: ' + PGW_TOYA24_CFG.ATTACHMENTS_SHEET);

  const foundSheet = pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.FOUND_SHEET, [
    'status', 'model', 'attachmentTitle', 'attachmentUrl', 'attachmentKey', 'sourceProductUrl',
    'reason', 'lastChecked', 'notes'
  ]);
  const existingKeys = pgwToya24ReadExistingKeys_(foundSheet, 5);
  const values = source.getDataRange().getValues();
  const headers = values.shift().map(String);
  const idx = pgwToya24Index_(headers);
  let added = 0;

  values.forEach(row => {
    const type = String(row[idx.attachmentType] || '').toLowerCase();
    const title = String(row[idx.attachmentTitle] || '');
    const url = String(row[idx.attachmentUrl] || '');
    const key = String(row[idx.attachmentKey] || url);
    if (!url) return;
    if (!pgwToya24LooksLikeParts_(title + ' ' + type + ' ' + url)) return;
    if (existingKeys[key]) return;

    foundSheet.appendRow([
      'found',
      row[idx.model] || '',
      title || 'Części zamienne',
      url,
      key,
      row[idx.sourceProductUrl] || '',
      'seed-from-TOYA24_zalaczniki',
      new Date(),
      ''
    ]);
    existingKeys[key] = true;
    added++;
  });

  Logger.log('Dodano z TOYA24_zalaczniki: ' + added);
  return { added };
}

/**
 * Krok 2: pobiera znalezione PDF-y i wrzuca do folderu Drive.
 */
function pgwToya24UploadFoundPartsPdfsToDrive() {
  const ss = pgwToya24GetSpreadsheet_();
  const foundSheet = ss.getSheetByName(PGW_TOYA24_CFG.FOUND_SHEET);
  if (!foundSheet) throw new Error('Brak arkusza: ' + PGW_TOYA24_CFG.FOUND_SHEET);

  const uploadSheet = pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.UPLOAD_LOG_SHEET, [
    'status', 'model', 'fileName', 'driveFileId', 'driveUrl', 'attachmentUrl', 'sourceProductUrl',
    'uploadedAt', 'notes'
  ]);

  const uploadedByUrl = pgwToya24ReadExistingKeys_(uploadSheet, 6);
  const targetFolder = DriveApp.getFolderById(PGW_TOYA24_CFG.TARGET_FOLDER_ID);
  const values = foundSheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  const idx = pgwToya24Index_(headers);

  let checked = 0;
  let uploaded = 0;
  let skipped = 0;

  for (let r = 0; r < values.length; r++) {
    if (uploaded >= PGW_TOYA24_CFG.MAX_UPLOADS_PER_RUN) break;
    const row = values[r];
    const status = String(row[idx.status] || '').toLowerCase();
    const url = String(row[idx.attachmentUrl] || '');
    const model = String(row[idx.model] || '');
    const sourceProductUrl = String(row[idx.sourceProductUrl] || '');
    const title = String(row[idx.attachmentTitle] || 'Części zamienne');

    if (!url || uploadedByUrl[url] || status === 'uploaded') {
      skipped++;
      continue;
    }

    checked++;
    try {
      const fileName = pgwToya24BuildPdfFileName_(model, title, url);
      const existing = pgwToya24FindFileInFolderByName_(targetFolder, fileName);
      if (existing) {
        uploadSheet.appendRow(['already-exists', model, fileName, existing.getId(), existing.getUrl(), url, sourceProductUrl, new Date(), 'Plik już był w folderze docelowym.']);
        foundSheet.getRange(r + 2, idx.status + 1).setValue('uploaded');
        foundSheet.getRange(r + 2, idx.notes + 1).setValue('already-exists: ' + existing.getUrl());
        uploadedByUrl[url] = true;
        skipped++;
        continue;
      }

      if (PGW_TOYA24_CFG.DRY_RUN) {
        uploadSheet.appendRow(['dry-run', model, fileName, '', '', url, sourceProductUrl, new Date(), 'DRY_RUN=true — nic nie wrzucono.']);
        continue;
      }

      const blob = pgwToya24FetchPdfBlob_(url, fileName);
      const file = targetFolder.createFile(blob).setName(fileName);
      uploadSheet.appendRow(['uploaded', model, fileName, file.getId(), file.getUrl(), url, sourceProductUrl, new Date(), '']);
      foundSheet.getRange(r + 2, idx.status + 1).setValue('uploaded');
      foundSheet.getRange(r + 2, idx.notes + 1).setValue(file.getUrl());
      uploadedByUrl[url] = true;
      uploaded++;
    } catch (err) {
      pgwToya24LogError_(ss, 'upload-pdf', model, url, err);
      foundSheet.getRange(r + 2, idx.status + 1).setValue('error');
      foundSheet.getRange(r + 2, idx.notes + 1).setValue(String(err && err.message ? err.message : err));
    }
  }

  Logger.log(JSON.stringify({ checked, uploaded, skipped }, null, 2));
  return { checked, uploaded, skipped };
}

function pgwToya24Audit() {
  const ss = pgwToya24GetSpreadsheet_();
  const out = { spreadsheetUrl: ss.getUrl() };
  [PGW_TOYA24_CFG.FOUND_SHEET, PGW_TOYA24_CFG.UPLOAD_LOG_SHEET, PGW_TOYA24_CFG.ERROR_SHEET].forEach(name => {
    const sh = ss.getSheetByName(name);
    out[name] = sh ? Math.max(0, sh.getLastRow() - 1) : 0;
  });
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

function pgwToya24GetSpreadsheet_() {
  return SpreadsheetApp.openById(PGW_TOYA24_CFG.SPREADSHEET_ID);
}

function pgwToya24EnsureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0 && headers && headers.length) sheet.appendRow(headers);
  return sheet;
}

function pgwToya24Index_(headers) {
  const out = {};
  headers.forEach((h, i) => out[String(h).trim()] = i);
  return new Proxy(out, {
    get(target, prop) {
      if (!(prop in target)) return -1;
      return target[prop];
    }
  });
}

function pgwToya24CollectProductUrls_(ss) {
  const rows = [];
  const add = (model, productUrl) => {
    if (!productUrl) return;
    rows.push({ model: String(model || ''), productUrl: String(productUrl) });
  };

  const products = ss.getSheetByName(PGW_TOYA24_CFG.PRODUCTS_SHEET);
  if (products) {
    const values = products.getDataRange().getValues();
    const headers = values.shift().map(String);
    const idx = pgwToya24Index_(headers);
    values.forEach(row => {
      add(row[idx.model], row[idx.productUrl] || row[idx.sourceProductUrl] || row[idx.url]);
    });
  }

  const manual = ss.getSheetByName(PGW_TOYA24_CFG.MANUAL_QUEUE_SHEET);
  if (manual) {
    const values = manual.getDataRange().getValues();
    const headers = values.shift().map(String);
    const idx = pgwToya24Index_(headers);
    values.forEach(row => {
      const status = String(row[idx.status] || '').toLowerCase();
      if (status && status !== 'new' && status !== 'todo' && status !== 'do sprawdzenia') return;
      add(row[idx.model], row[idx.productUrl]);
    });
  }

  // dedupe URLs
  const seen = {};
  return rows.filter(x => {
    if (seen[x.productUrl]) return false;
    seen[x.productUrl] = true;
    return true;
  });
}

function pgwToya24FetchText_(url) {
  const res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': PGW_TOYA24_CFG.USER_AGENT }
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) throw new Error('HTTP ' + code);
  return res.getContentText();
}

function pgwToya24FetchPdfBlob_(url, fileName) {
  const res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': PGW_TOYA24_CFG.USER_AGENT }
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) throw new Error('HTTP ' + code);
  const blob = res.getBlob().setName(fileName);
  const bytes = blob.getBytes();
  const head = bytes.slice(0, 4).map(b => String.fromCharCode(b)).join('');
  const ctype = String(res.getHeaders()['Content-Type'] || res.getHeaders()['content-type'] || '').toLowerCase();
  if (head !== '%PDF' && !ctype.includes('pdf')) {
    throw new Error('Załącznik nie wygląda jak PDF. Content-Type=' + ctype + ', magic=' + head);
  }
  return blob;
}

function pgwToya24FindPartsAttachments_(html, sourceProductUrl, fallbackModel) {
  const out = [];
  const decoded = String(html || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  const productModel = fallbackModel || pgwToya24ExtractModel_(decoded + ' ' + sourceProductUrl);
  const re = /(?:href|src)=["']([^"']*settings\.php\?getAttachmentp=[^"']+)["'][^>]*>([\s\S]*?)<\/a>|(?:href|src)=["']([^"']*settings\.php\?getAttachmentp=[^"']+)["']/gi;
  let m;
  while ((m = re.exec(decoded)) !== null) {
    let url = m[1] || m[3] || '';
    let label = pgwToya24StripTags_(m[2] || '');
    if (url && url.startsWith('/')) url = 'https://toya24.pl' + url;
    if (url && !/^https?:\/\//i.test(url)) url = 'https://toya24.pl/' + url.replace(/^\/+/, '');
    const around = decoded.slice(Math.max(0, m.index - 500), Math.min(decoded.length, m.index + 800));
    const context = label + ' ' + around + ' ' + url;
    if (!pgwToya24LooksLikeParts_(context)) continue;
    const key = pgwToya24AttachmentKey_(url);
    out.push({
      model: pgwToya24ExtractModel_(context) || productModel,
      attachmentTitle: label || 'Części zamienne ' + (productModel || ''),
      attachmentUrl: url,
      attachmentKey: key,
      sourceProductUrl,
      reason: 'matched-parts-attachment'
    });
  }

  // dedupe
  const seen = {};
  return out.filter(x => {
    const k = x.attachmentKey || x.attachmentUrl;
    if (seen[k]) return false;
    seen[k] = true;
    return true;
  });
}

function pgwToya24LooksLikeParts_(text) {
  const t = String(text || '').toLowerCase();
  return (
    t.includes('części zamienne') ||
    t.includes('czesci zamienne') ||
    t.includes('częsci zamienne') ||
    t.includes('spare parts') ||
    t.includes('parts-pdf') ||
    t.includes('lista części') ||
    t.includes('lista czesci')
  );
}

function pgwToya24ExtractModel_(text) {
  const s = String(text || '').toUpperCase();
  const prefixed = s.match(/\b(YT|YG|YTG|YT-G)[-_ ]?\d{3,8}\b/);
  if (prefixed) return prefixed[0].replace(/[_ ]/g, '-');
  const numeric = s.match(/\b\d{4,6}\b/);
  if (numeric) return numeric[0];
  return '';
}

function pgwToya24AttachmentKey_(url) {
  const m = String(url || '').match(/getAttachmentp=([^&]+)/i);
  return m ? decodeURIComponent(m[1]) : String(url || '');
}

function pgwToya24StripTags_(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function pgwToya24BuildPdfFileName_(model, title, url) {
  const cleanModel = String(model || pgwToya24ExtractModel_(title + ' ' + url) || 'UNKNOWN').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return 'Czesci_zamienne_' + cleanModel + '.pdf';
}

function pgwToya24FindFileInFolderByName_(folder, name) {
  const files = folder.getFilesByName(name);
  return files.hasNext() ? files.next() : null;
}

function pgwToya24ReadExistingKeys_(sheet, oneBasedColumn) {
  const out = {};
  const last = sheet.getLastRow();
  if (last < 2) return out;
  const vals = sheet.getRange(2, oneBasedColumn, last - 1, 1).getValues();
  vals.forEach(r => {
    const k = String(r[0] || '');
    if (k) out[k] = true;
  });
  return out;
}

function pgwToya24LogError_(ss, stage, model, url, err) {
  const sheet = pgwToya24EnsureSheet_(ss, PGW_TOYA24_CFG.ERROR_SHEET, [
    'when', 'stage', 'model', 'url', 'error'
  ]);
  sheet.appendRow([new Date(), stage, model || '', url || '', String(err && err.stack ? err.stack : err)]);
}
