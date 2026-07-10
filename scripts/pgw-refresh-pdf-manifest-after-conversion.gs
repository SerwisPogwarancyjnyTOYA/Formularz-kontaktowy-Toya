/**
 * PGW v68 — odświeżanie manifestu PDF po konwersji rysunków złożeniowych.
 *
 * Cel:
 * 1. Po zakończeniu konwersji plików do PDF skanować wskazane foldery na Drive.
 * 2. Zebrać wyłącznie PDF-y, które mogą być rysunkami złożeniowymi / wybuchowymi.
 * 3. Zapisać manifest jako data/drive-drawings-map.converted.json w folderze repo.
 * 4. Formularz GitHub Pages wczyta ten plik razem z pełnym manifestem bazowym.
 */
const PGW_PDF_MANIFEST_V68 = {
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe
    '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF', // PGW - Rysunki
    '1Ca8zKCBnArP4DfQGFazS0dXfHb0H902u'  // 02_RYSUNKI_ZLOZENIOWE_BAZA
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq',
  manifestFileName: 'drive-drawings-map.converted.json',
  maxFilesPerRun: 5000
};

function pgwRefreshPdfManifestAfterConversion() {
  const started = new Date();
  const rows = [];
  const seen = {};

  PGW_PDF_MANIFEST_V68.sourceFolderIds.forEach(function(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    scanPdfFolder_(folder, folder.getName(), rows, seen);
  });

  rows.sort(function(a, b) {
    return String(a.normalizedModel || a.title).localeCompare(String(b.normalizedModel || b.title), 'pl');
  });

  const payload = {
    generatedAt: started.toISOString(),
    updatedAt: new Date().toISOString(),
    version: '20260709-v68-after-conversion-manifest',
    sourceFolderIds: PGW_PDF_MANIFEST_V68.sourceFolderIds,
    count: rows.length,
    notes: 'Manifest generowany po konwersji plików do PDF. Formularz ładuje go jako dodatkowe źródło obok drive-drawings-map.full.json.',
    items: rows
  };

  upsertRepoJson_(PGW_PDF_MANIFEST_V68.repoDataFolderId, PGW_PDF_MANIFEST_V68.manifestFileName, payload);
  Logger.log('PGW manifest PDF v68: zapisano %s rekordów do %s', rows.length, PGW_PDF_MANIFEST_V68.manifestFileName);
  return payload;
}

function scanPdfFolder_(folder, path, rows, seen) {
  if (rows.length >= PGW_PDF_MANIFEST_V68.maxFilesPerRun) return;

  const files = folder.getFilesByType(MimeType.PDF);
  while (files.hasNext()) {
    if (rows.length >= PGW_PDF_MANIFEST_V68.maxFilesPerRun) break;
    const file = files.next();
    const fileId = file.getId();
    if (seen[fileId]) continue;
    seen[fileId] = true;

    const title = file.getName();
    if (!looksLikeAssemblyDrawingPdf_(title, path)) continue;

    const model = extractDeviceIndex_(title) || extractDeviceIndex_(path);
    rows.push({
      fileId: fileId,
      title: title,
      fileName: title,
      mimeType: MimeType.PDF,
      type: 'pdf',
      model: model,
      deviceIndex: model,
      normalizedModel: normalizeDeviceIndex_(model),
      viewerUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/view?usp=drivesdk',
      previewUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/preview',
      openUrl: 'https://drive.google.com/file/d/' + encodeURIComponent(fileId) + '/view',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(fileId),
      path: path,
      folderName: folder.getName(),
      createdTime: file.getDateCreated().toISOString(),
      modifiedTime: file.getLastUpdated().toISOString(),
      keys: buildKeys_(title, model),
      source: 'POST_CONVERSION_DRIVE_SCAN',
      status: model ? 'OK' : 'MODEL_DO_ROZPOZNANIA',
      brand: inferBrand_(title + ' ' + path + ' ' + model),
      brandConfidence: model ? 'filename_or_path' : 'unknown',
      reviewStatus: model ? 'visible_after_conversion' : 'needs_model_review'
    });
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const child = folders.next();
    scanPdfFolder_(child, path + '/' + child.getName(), rows, seen);
  }
}

function upsertRepoJson_(repoDataFolderId, fileName, payload) {
  const folder = DriveApp.getFolderById(repoDataFolderId);
  const json = JSON.stringify(payload, null, 2);
  const existing = folder.getFilesByName(fileName);
  if (existing.hasNext()) {
    existing.next().setContent(json);
  } else {
    folder.createFile(fileName, json, MimeType.PLAIN_TEXT);
  }
}

function looksLikeAssemblyDrawingPdf_(title, path) {
  const text = stripDiacritics_((title + ' ' + path).toLowerCase());
  if (!/\.pdf$/i.test(title)) return false;
  if (/instrukcja|manual|deklaracja|gwaranc|karta|certyfikat|etykieta|tabliczka|zdjecie|foto|image/.test(text)) return false;
  if (/czesci|zamienne|rysunki|rysunek|zlozeniowe|złożeniowe|wybuchowe|schemat|parts|spare|exploded/.test(text)) return true;
  return /\b(yt|yg)[-_ ]?\d{3,8}[a-z]?\b/i.test(text) || /\b\d{3,6}\b/.test(text);
}

function extractDeviceIndex_(value) {
  const raw = stripDiacritics_(String(value || '')).replace(/\.[Pp][Dd][Ff]$/, '').replace(/^czesci[_ -]zamienne[_ -]*/i, ' ');
  const upper = raw.toUpperCase().replace(/_/g, '-');
  let m = upper.match(/\b(YT|YG)[- ]?(\d{3,8}[A-Z]?)\b/);
  if (m) return m[1] + '-' + m[2];
  m = upper.match(/\b\d{3,6}\b/);
  return m ? m[0] : '';
}

function normalizeDeviceIndex_(value) {
  return extractDeviceIndex_(value) || String(value || '').toUpperCase().trim();
}

function buildKeys_(title, model) {
  const keys = {};
  [title, String(title || '').replace(/\.[Pp][Dd][Ff]$/, ''), model, normalizeDeviceIndex_(model)].forEach(function(x) {
    x = String(x || '').trim();
    if (x) keys[x] = true;
  });
  return Object.keys(keys);
}

function inferBrand_(text) {
  const t = String(text || '').toUpperCase();
  if (/YATO\s*GASTRO|\bYG[-_ ]?0|GASTRO/.test(t)) return 'YATO GASTRO';
  if (/\bYT[-_ ]?\d|\bYATO\b/.test(t)) return 'YATO';
  if (/\bSTHOR\b/.test(t)) return 'STHOR';
  if (/\bVOREL\b/.test(t)) return 'VOREL';
  if (/\bFLO\b/.test(t)) return 'FLO';
  if (/\bLUND\b/.test(t)) return 'LUND';
  if (/\bFALA\b/.test(t)) return 'FALA';
  return 'INNE';
}

function stripDiacritics_(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
