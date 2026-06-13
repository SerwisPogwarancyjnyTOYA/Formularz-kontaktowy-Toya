/**
 * PGW Service Hub — pełny manifest rysunków z Google Drive.
 *
 * Uruchom w Google Apps Script na koncie, które ma dostęp do folderów z rysunkami.
 * Skrypt przechodzi REKURENCYJNIE przez oba foldery i tworzy plik:
 *   drive-drawings-map.json
 *
 * Ten plik wrzuć później do repozytorium jako:
 *   data/drive-drawings-map.json
 * oraz opcjonalnie:
 *   drive-drawings-map.json
 */

const PGW_ROOT_FOLDERS = [
  // PGW - Rysunki → Rysunki wybuchowe
  '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu',
  // PGW - Rysunki → Rysunki wybuchowe-Robocze
  '1IqA8x36ml6N2ml2FNy4wsl94AbIHhRXp'
];

// Ustaw true tylko wtedy, gdy rysunki mogą być widoczne dla osób spoza firmy.
// Do prezentacji zewnętrznej pliki muszą mieć dostęp: "każdy z linkiem może wyświetlać".
const PGW_MAKE_FILES_PUBLIC = false;

function buildPgwFullDriveManifest() {
  const rows = [];
  const seen = {};

  PGW_ROOT_FOLDERS.forEach(function(folderId) {
    const root = DriveApp.getFolderById(folderId);
    walkPgwFolder_(root, root.getName(), rows, seen);
  });

  rows.sort(function(a, b) {
    return String(a.deviceIndex || a.fileName).localeCompare(String(b.deviceIndex || b.fileName), 'pl');
  });

  const payload = JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: 'Google Drive / PGW Service Hub',
    count: rows.length,
    items: rows
  }, null, 2);

  const name = 'drive-drawings-map.json';
  const existing = DriveApp.getFilesByName(name);
  let out;
  if (existing.hasNext()) {
    out = existing.next();
    out.setContent(payload);
  } else {
    out = DriveApp.createFile(name, payload, MimeType.PLAIN_TEXT);
  }

  Logger.log('Utworzono / zaktualizowano manifest: ' + out.getUrl());
  Logger.log('Liczba plików w manifeście: ' + rows.length);
}

function walkPgwFolder_(folder, path, rows, seen) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    if (!isPgwDrawingFile_(name)) continue;

    const id = file.getId();
    if (seen[id]) continue;
    seen[id] = true;

    if (PGW_MAKE_FILES_PUBLIC) {
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (err) {
        Logger.log('Nie udało się ustawić udostępniania dla: ' + name + ' / ' + err);
      }
    }

    const fullPath = path + '/' + name;
    const indexes = extractPgwIndexes_(fullPath);
    rows.push({
      deviceIndex: indexes[0] || '',
      deviceIndexes: indexes,
      fileName: name,
      title: name.replace(/\.[^.]+$/, ''),
      drivePath: fullPath,
      fileId: id,
      url: file.getUrl(),
      openUrl: 'https://drive.google.com/file/d/' + id + '/view',
      viewerUrl: 'https://drive.google.com/file/d/' + id + '/preview',
      mimeType: file.getMimeType(),
      keys: buildPgwKeys_(name, fullPath, indexes)
    });
  }

  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const child = folders.next();
    walkPgwFolder_(child, path + '/' + child.getName(), rows, seen);
  }
}

function isPgwDrawingFile_(name) {
  return /\.(pdf|jpg|jpeg|png|webp|docx?)$/i.test(String(name || ''));
}

function extractPgwIndexes_(text) {
  const matches = String(text || '').toUpperCase().match(/\b[A-Z]{1,4}[-_ ]?\d{2,6}\b|\b\d{5,6}\b/g) || [];
  const normalized = matches.map(function(x) {
    return x.replace(/_/g, '-').replace(/\s+/g, '-').replace(/([A-Z]+)(\d)/, '$1-$2');
  });
  return uniquePgw_(normalized);
}

function buildPgwKeys_(name, fullPath, indexes) {
  const values = [name, stripPgwExt_(name), fullPath, stripPgwExt_(fullPath)].concat(indexes || []);
  return uniquePgw_(values.map(normalizePgwKey_).filter(Boolean));
}

function stripPgwExt_(value) {
  return String(value || '').replace(/\.(pdf|docx?|xlsx?|jpg|jpeg|png|webp|gif|bmp)$/i, '');
}

function normalizePgwKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\\/g, '/')
    .replace(/^.*\//, '')
    .replace(/[_-]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniquePgw_(arr) {
  const seen = {};
  const out = [];
  arr.forEach(function(x) {
    if (!x || seen[x]) return;
    seen[x] = true;
    out.push(x);
  });
  return out;
}
