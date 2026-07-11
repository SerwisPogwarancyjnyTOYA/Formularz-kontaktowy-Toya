/**
 * PGW v81 — Drive Master Catalog, alias audit + safe organizer
 *
 * Ten plik jest runbookiem Apps Script do skanowania Drive jako źródła prawdy.
 * Wersja repo Node generuje pliki JSON, a Apps Script ma wykonywać to samo na Drive.
 */
const PGW_V81 = {
  version: '20260711-v81-drive-search-aliases',
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe
    '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF', // PGW - Rysunki
    '1YNNT87uyOhtg3tQfJ5y3HHxO9cuB_oaA'  // PDF-y po konwersji
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq'
};

function pgwDriveMasterCatalogV81Preview() {
  // Preview-only: nie przenosi i nie kasuje plików.
  const rows = [];
  PGW_V81.sourceFolderIds.forEach(id => scanFolderV81_(DriveApp.getFolderById(id), rows, []));
  const report = buildReportV81_(rows);
  Logger.log(JSON.stringify(report.summary, null, 2));
  return report;
}

function scanFolderV81_(folder, rows, path) {
  const current = path.concat(folder.getName());
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (!/\.pdf$/i.test(f.getName())) continue;
    const models = extractModelsV81_(current.join(' ') + ' ' + f.getName());
    rows.push({ fileId: f.getId(), fileName: f.getName(), path: current.join(' / '), models });
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) scanFolderV81_(folders.next(), rows, current);
}

function extractModelsV81_(text) {
  const out = [];
  const add = v => { if (v && out.indexOf(v) < 0) out.push(v); };
  String(text || '').replace(/\b(YT|YG)[-_ ]?(\d{3,8}[A-Z]?)\b/gi, (_, p, n) => { add(String(p).toUpperCase() + '-' + n); return _; });
  String(text || '').replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi, (_, n) => { add(n); return _; });
  return out;
}

function buildReportV81_(rows) {
  const models = {};
  rows.forEach(r => (r.models || []).forEach(m => models[m] = (models[m] || 0) + 1));
  return { version: PGW_V81.version, generatedAt: new Date().toISOString(), summary: { pdfFiles: rows.length, models: Object.keys(models).length }, rows: rows };
}
