
/**
 * PGW Service Hub — pełny manifest Drive v50
 *
 * Uruchom w Google Apps Script podpiętym do arkusza Google.
 * Skrypt skanuje folder Drive z PDF-ami, eksportuje tylko application/pdf
 * i zapisuje arkusze:
 *   - drive-drawings-map: gotowy manifest dla strony
 *   - brand-review: indeksy, gdzie marka jest niepewna i wymaga ręcznego potwierdzenia
 *
 * Domyślny folder: PGW - Rysunki / Rysunki wybuchowe
 */
const ROOT_FOLDER_ID = '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu';
const OUT_SHEET = 'drive-drawings-map';
const REVIEW_SHEET = 'brand-review';

function exportDrivePdfManifestV50() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = upsertSheet_(ss, OUT_SHEET);
  const review = upsertSheet_(ss, REVIEW_SHEET);
  out.clearContents();
  review.clearContents();
  out.appendRow(['deviceIndex','brand','fileName','fileId','mimeType','viewerUrl','openUrl','keys','drivePath','brandConfidence','source']);
  review.appendRow(['deviceIndex','guessedBrand','fileName','drivePath','reason']);

  const rows = [];
  scanFolder_(DriveApp.getFolderById(ROOT_FOLDER_ID), '', rows);
  rows.sort((a,b) => String(a.deviceIndex).localeCompare(String(b.deviceIndex), 'pl'));

  for (const row of rows) {
    out.appendRow([
      row.deviceIndex, row.brand, row.fileName, row.fileId, row.mimeType,
      row.viewerUrl, row.openUrl, JSON.stringify(row.keys), row.drivePath,
      row.brandConfidence, row.source
    ]);
    if (row.brandConfidence !== 'strong') {
      review.appendRow([row.deviceIndex, row.brand, row.fileName, row.drivePath, row.brandConfidence]);
    }
  }
  SpreadsheetApp.flush();
}

function scanFolder_(folder, path, rows) {
  const folderName = folder.getName();
  const currentPath = path ? `${path}/${folderName}` : folderName;

  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() !== MimeType.PDF && file.getMimeType() !== 'application/pdf') continue;
    const fileName = file.getName();
    const deviceIndex = extractDeviceIndex_(fileName);
    const brandInfo = inferBrand_(fileName, currentPath, deviceIndex);
    const fileId = file.getId();
    rows.push({
      deviceIndex,
      brand: brandInfo.brand,
      fileName,
      fileId,
      mimeType: 'application/pdf',
      viewerUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      openUrl: `https://drive.google.com/file/d/${fileId}/view`,
      keys: buildKeys_(deviceIndex, fileName, brandInfo.brand),
      drivePath: `${currentPath}/${fileName}`,
      brandConfidence: brandInfo.confidence,
      source: 'Google Drive export v50'
    });
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) scanFolder_(folders.next(), currentPath, rows);
}

function extractDeviceIndex_(name) {
  const base = String(name || '').replace(/\.pdf$/i, '');
  let m = base.match(/(?:Czesci_zamienne[_\s-]*)?((?:YT|YG)[-_\s]?\d{3,6})/i);
  if (m) return m[1].toUpperCase().replace(/\s+/g,'').replace('_','-');
  m = base.match(/(?:Czesci_zamienne[_\s-]*)?(\d{5,6})/i);
  if (m) return m[1];
  return base.replace(/^Czesci_zamienne[_\s-]*/i, '').toUpperCase();
}

function inferBrand_(fileName, drivePath, idx) {
  const text = `${fileName} ${drivePath} ${idx}`.toUpperCase();
  if (/YATO\s*GASTRO|\bYG[-_\s]?\d|GASTRO/.test(text)) return {brand:'YATO GASTRO', confidence:'strong'};
  if (/\bYT[-_\s]?\d|\bYATO\b/.test(text)) return {brand:'YATO', confidence:'strong'};
  for (const b of ['STHOR','VOREL','FLO','LUND','FALA']) if (text.includes(b)) return {brand:b, confidence:'strong'};

  const n = String(idx || '').replace(/\D/g,'');
  if (['73060','79004','79024','79096','79098','79106'].includes(n)) return {brand:'LUND', confidence:'seed-from-drive-search'};
  if (['79005','79030','79095','79108','79119','79140','79151','79354'].includes(n)) return {brand:'STHOR', confidence:'seed-from-drive-search'};
  if (['79444','79467'].includes(n)) return {brand:'FLO', confidence:'seed-from-drive-search'};
  if (['00300','00320','00500','00510','00600','00610','00703','01060','09900'].includes(n)) return {brand:'VOREL', confidence:'legacy-local-seed'};

  return {brand:'INNE', confidence:'needs-review'};
}

function buildKeys_(deviceIndex, fileName, brand) {
  const clean = String(fileName || '').replace(/\.pdf$/i, '');
  return [...new Set([deviceIndex, fileName, clean, `${brand} ${deviceIndex}`, `${brand}-${deviceIndex}`, String(deviceIndex).replace('-', '')].filter(Boolean))];
}

function upsertSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
