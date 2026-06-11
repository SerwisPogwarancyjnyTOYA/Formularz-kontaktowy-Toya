
/**
 * Generator manifestu Google Drive dla PGW Service Hub.
 * Uruchom w Google Apps Script na koncie z dostępem do folderu rysunków.
 * Wklej ID folderu głównego rysunków, np. z linku /folders/FOLDER_ID.
 */
const ROOT_FOLDER_ID = 'WSTAW_ID_FOLDERU_RYSUNKOW';

function buildPgwDriveManifest() {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const rows = [];
  walkFolder_(root, rows);
  const json = JSON.stringify(rows, null, 2);
  const file = DriveApp.createFile('drive-drawings-map.json', json, MimeType.PLAIN_TEXT);
  Logger.log('Utworzono manifest: ' + file.getUrl());
}

function walkFolder_(folder, rows) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const name = f.getName();
    if (!/\.(pdf|jpg|jpeg|png|webp|docx)$/i.test(name)) continue;
    const model = extractModel_(name + ' ' + folder.getName());
    rows.push({
      deviceIndex: model,
      fileName: name,
      title: name.replace(/\.[^.]+$/, ''),
      fileId: f.getId(),
      url: f.getUrl(),
      mimeType: f.getMimeType()
    });
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) walkFolder_(folders.next(), rows);
}

function extractModel_(text) {
  const m = String(text).toUpperCase().match(/\b[A-Z]{1,4}-?\d{3,6}\b/);
  return m ? m[0].replace(/([A-Z]+)(\d)/, '$1-$2') : '';
}
