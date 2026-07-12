/**
 * PGW v84 — Drive Publication Pipeline
 * Preview-only scanner. It marks files as PUBLIC_READY, REWRITE_REQUIRED or BLOCKED_FROM_PUBLIC.
 * It does not delete originals.
 */
function pgwV84DrivePublicationPreview() {
  const ROOT_FOLDERS = [
    '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF', // PGW - Rysunki
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu'  // Rysunki wybuchowe, if accessible
  ];
  const BLOCKED_MARKERS = [
    'PDF roboczy wygenerowany automatycznie',
    'Zrodla w folderze', 'Źródła w folderze',
    'oryginalne pliki robocze', 'materiał roboczy',
    'Lista części nie została automatycznie odczytana',
    'OCR', 'ręcznej weryfikacji', 'recznej weryfikacji'
  ];
  const accepted = [];
  const rewrite = [];
  const seen = {};

  ROOT_FOLDERS.forEach(function(folderId) {
    try { scanFolder_(DriveApp.getFolderById(folderId), ''); } catch (e) { Logger.log('Skip folder '+folderId+': '+e); }
  });

  function scanFolder_(folder, prefix) {
    const path = prefix ? prefix + ' / ' + folder.getName() : folder.getName();
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (seen[f.getId()]) continue;
      seen[f.getId()] = true;
      const name = f.getName();
      if (!/\.pdf$/i.test(name)) continue;
      const lower = (path + ' ' + name).toLowerCase();
      const canonical = /^Czesci_zamienne_/i.test(name) || /__SCALONE/i.test(name);
      const roboczePath = /robocze|converted|konwersj|do_weryfikacji|do weryfikacji|kwarantanna/i.test(path);
      const markerHit = BLOCKED_MARKERS.some(function(m) { return lower.indexOf(String(m).toLowerCase()) >= 0; });
      if (markerHit || (roboczePath && !/__SCALONE|ZWERYFIKOWANE|VERIFIED/i.test(name))) {
        rewrite.push({id:f.getId(), name:name, path:path, status:'REWRITE_REQUIRED'});
      } else if (canonical || /rysunki wybuchowe|rysunki złożeniowe|rysunki zlozeniowe/i.test(path)) {
        accepted.push({id:f.getId(), name:name, path:path, status:'PUBLIC_READY'});
      } else {
        rewrite.push({id:f.getId(), name:name, path:path, status:'VISUAL_REVIEW_REQUIRED'});
      }
    }
    const folders = folder.getFolders();
    while (folders.hasNext()) scanFolder_(folders.next(), path);
  }

  const result = {generatedAt: new Date().toISOString(), publicReady: accepted.length, rewriteRequired: rewrite.length, accepted: accepted, rewrite: rewrite};
  Logger.log(JSON.stringify(result, null, 2));
  return result;
}
