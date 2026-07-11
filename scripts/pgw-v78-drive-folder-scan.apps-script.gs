/**
 * PGW v78 — Drive-first catalog scanner
 *
 * Cel:
 * - skanuje foldery Drive z rysunkami roboczymi i oficjalnymi,
 * - z każdego PDF-a wyciąga modele z nazwy/ścieżki,
 * - generuje data/drive-drawings-map.generated-v78.json,
 * - jeden PDF może obsługiwać kilka urządzeń.
 *
 * Uwaga: Apps Script nie czyta pełnej treści PDF tak skutecznie jak indeks Drive/konwerter.
 * Najlepszy efekt daje uruchomienie po konwersji PDF-ów, gdy pliki mają nazwę lub folder z modelem.
 */
const PGW_V78_DRIVE_CATALOG = {
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe
    '1g2roYvjKlYtJ878sphfDv52P8-A4cB27', // robocze / do weryfikacji
    '1YNNT87uyOhtg3tQfJ5y3HHxO9cuB_oaA'  // PDF-y po konwersji
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq',
  outputFileName: 'drive-drawings-map.generated-v78.json',
  maxFiles: 20000
};

function pgwBuildDriveCatalogV78() {
  const rows = [];
  const seenFileIds = {};
  PGW_V78_DRIVE_CATALOG.sourceFolderIds.forEach(function(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    pgwScanDriveFolderV78_(folder, folder.getName(), rows, seenFileIds);
  });
  const out = {
    generatedAt: new Date().toISOString(),
    version: '20260711-v78-drive-first-catalog-builder',
    schema: 'pgw-drive-map-generated-v78',
    source: 'Apps Script Drive folder scan',
    count: rows.length,
    items: rows
  };
  pgwUpsertJsonV78_(PGW_V78_DRIVE_CATALOG.repoDataFolderId, PGW_V78_DRIVE_CATALOG.outputFileName, out);
  Logger.log(JSON.stringify({count: rows.length, fileName: PGW_V78_DRIVE_CATALOG.outputFileName}, null, 2));
  return out;
}

function pgwScanDriveFolderV78_(folder, path, rows, seenFileIds) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    if (rows.length >= PGW_V78_DRIVE_CATALOG.maxFiles) return;
    const file = files.next();
    if (file.getMimeType() !== MimeType.PDF && !/\.pdf$/i.test(file.getName())) continue;
    if (seenFileIds[file.getId()]) continue;
    seenFileIds[file.getId()] = true;
    const models = pgwExtractModelsV78_([file.getName(), path].join(' '));
    if (!models.length) continue;
    rows.push({
      fileId: file.getId(),
      title: file.getName(),
      fileName: file.getName(),
      mimeType: 'application/pdf',
      model: models[0],
      deviceIndex: models[0],
      deviceIndexes: models,
      modelsInPdf: models,
      viewerUrl: 'https://drive.google.com/file/d/' + file.getId() + '/preview',
      previewUrl: 'https://drive.google.com/file/d/' + file.getId() + '/preview',
      openUrl: 'https://drive.google.com/file/d/' + file.getId() + '/view',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
      path: path + '/' + file.getName(),
      folderName: folder.getName(),
      source: 'APPS_SCRIPT_DRIVE_SCAN_V78',
      preferred: /__SCALONE/i.test(file.getName()),
      githubPreviewReady: true,
      pdfVariant: /__SCALONE/i.test(file.getName()) ? 'merged_parts_and_drawing' : 'drive_pdf',
      displayMode: 'standard-service-card',
      displayPriority: /__SCALONE/i.test(file.getName()) ? 1000 : 600,
      keys: models.concat([file.getName().replace(/\.pdf$/i, '')])
    });
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) {
    if (rows.length >= PGW_V78_DRIVE_CATALOG.maxFiles) return;
    const child = folders.next();
    pgwScanDriveFolderV78_(child, path + '/' + child.getName(), rows, seenFileIds);
  }
}

function pgwExtractModelsV78_(text) {
  const out = [];
  function add(x) {
    const n = pgwNormalizeModelV78_(x);
    if (n && out.indexOf(n) === -1) out.push(n);
  }
  String(text || '').replace(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/gi, function(m, p, d) { add(String(p).toUpperCase() + '-' + d); return m; });
  String(text || '').replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi, function(m, d) { add(d); return m; });
  return out;
}

function pgwNormalizeModelV78_(value) {
  const s = String(value || '').trim().toUpperCase();
  const m = s.match(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/);
  if (m) return m[1] + '-' + m[2];
  const n = s.match(/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/);
  return n ? n[1] : '';
}

function pgwUpsertJsonV78_(folderId, fileName, object) {
  const folder = DriveApp.getFolderById(folderId);
  const text = JSON.stringify(object, null, 2);
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    files.next().setContent(text);
  } else {
    folder.createFile(fileName, text, MimeType.PLAIN_TEXT);
  }
}
