/**
 * PGW v83 — Public Drawing Gate
 *
 * Ten skrypt NIE publikuje PDF-ów roboczych. Skanuje PDF-y na Drive,
 * oznacza pliki zgodne z Golden Sample jako publiczne, a robocze/konwertowane
 * wrzuca do kolejki przeróbki.
 */
const PGW_V83_PUBLIC_DRAWING = {
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe / oficjalne
    '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF', // PGW - Rysunki
    '1YNNT87uyOhtg3tQfJ5y3HHxO9cuB_oaA'  // PDF-y po konwersji
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq',
  outputManifest: 'drive-drawings-map.generated-v83.json',
  outputAudit: 'public-drawing-audit-v83.json',
  outputRewriteQueue: 'pdf-rewrite-queue-v83.json'
};

function pgwPublicDrawingGateV83Preview() {
  return pgwPublicDrawingGateV83_(true);
}

function pgwPublicDrawingGateV83Apply() {
  return pgwPublicDrawingGateV83_(false);
}

function pgwPublicDrawingGateV83_(dryRun) {
  const rows = [];
  const queue = [];
  const publicRows = [];
  PGW_V83_PUBLIC_DRAWING.sourceFolderIds.forEach(id => pgwScanFolderV83_(DriveApp.getFolderById(id), rows));
  rows.forEach(row => {
    const decision = pgwClassifyPublicPdfV83_(row);
    row.publicDecision = decision.status;
    row.publicReason = decision.reason;
    if (decision.public) publicRows.push(row);
    else queue.push(row);
  });
  const audit = {
    version: '20260711-v83-public-drawing-source-policy',
    generatedAt: new Date().toISOString(),
    dryRun: !!dryRun,
    scannedPdfFiles: rows.length,
    publicPdfFiles: publicRows.length,
    rewriteQueue: queue.length,
    rules: [
      'Golden Sample / Czesci_zamienne_<MODEL>.pdf z folderu oficjalnego jest publikowany w pierwszej kolejności.',
      'PDF roboczy wygenerowany automatycznie nigdy nie jest publikowany jako rysunek klienta.',
      'Robocze/konwertowane źródła wymagają przeróbki/scalenia do formatu Golden Sample.'
    ]
  };
  if (!dryRun) {
    pgwUpsertJsonV83_(PGW_V83_PUBLIC_DRAWING.outputManifest, {schema:'pgw-drive-drawings-map-v83-live', generatedAt:new Date().toISOString(), count: publicRows.length, items: publicRows});
    pgwUpsertJsonV83_(PGW_V83_PUBLIC_DRAWING.outputAudit, audit);
    pgwUpsertJsonV83_(PGW_V83_PUBLIC_DRAWING.outputRewriteQueue, {schema:'pgw-pdf-rewrite-queue-v83-live', generatedAt:new Date().toISOString(), count: queue.length, items: queue});
  }
  Logger.log(JSON.stringify(audit, null, 2));
  return audit;
}

function pgwClassifyPublicPdfV83_(row) {
  const text = pgwNormV83_([row.name, row.path, row.description, row.fullText].join(' '));
  const name = row.name || '';
  const isGolden = /czesci[_\s-]*zamienne|__scalone/i.test(name);
  const isOfficial = /rysunki wybuchowe|rysunki zlozeniowe|rysunki złożeniowe/i.test(row.path || '');
  const bad = ['pdf roboczy wygenerowany automatycznie','zrodla w folderze','źródła w folderze','material roboczy','materiał roboczy','lista czesci nie zostala','lista części nie została','wymaga recznej weryfikacji','wymaga ręcznej weryfikacji'].some(x => text.indexOf(pgwNormV83_(x)) >= 0);
  if (bad) return {public:false, status:'REWRITE_REQUIRED', reason:'roboczy/auto-generated marker'};
  if (isOfficial && isGolden) return {public:true, status:'PUBLIC_GOLDEN', reason:'official golden/canonical file'};
  if (isOfficial && !/robocze|konwersj|converted/i.test(row.path || '')) return {public:true, status:'PUBLIC_OFFICIAL_REVIEWED', reason:'official drawings folder'};
  return {public:false, status:'REWRITE_REQUIRED', reason:'not verified public drawing'};
}

function pgwScanFolderV83_(folder, out, prefix) {
  prefix = prefix || folder.getName();
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (/\.pdf$/i.test(f.getName())) {
      out.push({fileId:f.getId(), name:f.getName(), path:prefix, viewerUrl:'https://drive.google.com/file/d/'+f.getId()+'/preview', openUrl:f.getUrl()});
    }
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) {
    const sub = folders.next();
    pgwScanFolderV83_(sub, out, prefix + ' / ' + sub.getName());
  }
}

function pgwUpsertJsonV83_(name, obj) {
  const folder = DriveApp.getFolderById(PGW_V83_PUBLIC_DRAWING.repoDataFolderId);
  const body = JSON.stringify(obj, null, 2);
  const files = folder.getFilesByName(name);
  if (files.hasNext()) files.next().setContent(body);
  else folder.createFile(name, body, MimeType.PLAIN_TEXT);
}

function pgwNormV83_(s) {
  return String(s || '').toLowerCase().replace(/[ąćęłńóśźż]/g, function(ch){return {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z'}[ch] || ch;});
}
