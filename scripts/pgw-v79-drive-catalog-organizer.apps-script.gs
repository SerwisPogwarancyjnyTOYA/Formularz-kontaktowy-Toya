/**
 * PGW v79 - Drive catalog scanner + PDF organizer
 *
 * To jest skrypt do uruchomienia w Apps Script przy repo Drive.
 * Najpierw uruchom: pgwBuildDriveCatalogV79Preview()
 * Dopiero po sprawdzeniu raportu: pgwBuildDriveCatalogV79ApplyOrganizer()
 *
 * Opcjonalne czytanie tresci PDF wymaga wlaczenia Advanced Google Services -> Drive API.
 */
const PGW_V79 = {
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe
    '1g2roYvjKlYtJ878sphfDv52P8-A4cB27', // robocze / do weryfikacji
    '1YNNT87uyOhtg3tQfJ5y3HHxO9cuB_oaA'  // PDF-y po konwersji
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq',
  organizerRootParentId: '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF', // PGW - Rysunki
  organizerRootName: 'PGW_RYSUNKI_PORZADKOWANIE_V79',
  maxFiles: 25000,
  extractTextForUnknownOnly: true,
  outputManifest: 'drive-drawings-map.generated-v79.json',
  outputAudit: 'drive-catalog-audit-v79.json',
  outputMergeQueue: 'drive-pdf-merge-queue-v79.json',
  outputOrganizerPlan: 'drive-organizer-plan-v79.json'
};

function pgwBuildDriveCatalogV79Preview() {
  return pgwBuildDriveCatalogV79_({ applyOrganizer: false, extractText: true });
}

function pgwBuildDriveCatalogV79ApplyOrganizer() {
  // Bezpieczne porzadkowanie: NIE kasuje plikow. Dodaje pliki do folderow porzadkujacych jako dodatkowa lokalizacje.
  return pgwBuildDriveCatalogV79_({ applyOrganizer: true, extractText: true });
}

function pgwBuildDriveCatalogV79_(options) {
  const rows = [];
  const seen = {};
  PGW_V79.sourceFolderIds.forEach(function(folderId) {
    const folder = DriveApp.getFolderById(folderId);
    pgwScanFolderV79_(folder, folder.getName(), rows, seen, options || {});
  });
  const grouped = pgwGroupDriveRowsV79_(rows);
  const plan = pgwBuildOrganizerPlanV79_(grouped, rows);
  pgwUpsertJsonV79_(PGW_V79.repoDataFolderId, PGW_V79.outputManifest, {schema:'pgw-drive-map-generated-v79', generatedAt:new Date().toISOString(), count: grouped.items.length, items: grouped.items});
  pgwUpsertJsonV79_(PGW_V79.repoDataFolderId, PGW_V79.outputAudit, grouped.audit);
  pgwUpsertJsonV79_(PGW_V79.repoDataFolderId, PGW_V79.outputMergeQueue, {generatedAt:new Date().toISOString(), count: grouped.mergeQueue.length, items: grouped.mergeQueue});
  pgwUpsertJsonV79_(PGW_V79.repoDataFolderId, PGW_V79.outputOrganizerPlan, plan);
  if (options && options.applyOrganizer) pgwApplyOrganizerLabelsV79_(grouped, plan);
  const summary = {pdfRows: rows.length, models: grouped.items.length, mergeQueue: grouped.mergeQueue.length, applyOrganizer: !!(options && options.applyOrganizer)};
  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function pgwScanFolderV79_(folder, path, rows, seen, options) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    if (rows.length >= PGW_V79.maxFiles) return;
    const file = files.next();
    if (file.getMimeType() !== MimeType.PDF && !/\.pdf$/i.test(file.getName())) continue;
    if (seen[file.getId()]) continue;
    seen[file.getId()] = true;
    const textSeed = [file.getName(), path].join(' ');
    let models = pgwExtractModelsV79_(textSeed);
    let parts = [];
    let extractedText = '';
    if ((!models.length || !PGW_V79.extractTextForUnknownOnly) && options && options.extractText) {
      extractedText = pgwTryExtractPdfTextV79_(file);
      models = pgwUnionV79_(models, pgwExtractModelsV79_(extractedText));
      parts = pgwExtractPartsV79_(extractedText);
    }
    if (!parts.length && extractedText) parts = pgwExtractPartsV79_(extractedText);
    rows.push({
      fileId: file.getId(),
      title: file.getName(),
      fileName: file.getName(),
      mimeType: 'application/pdf',
      deviceIndex: models[0] || '',
      model: models[0] || '',
      deviceIndexes: models,
      modelsInPdf: models,
      viewerUrl: 'https://drive.google.com/file/d/' + file.getId() + '/preview',
      previewUrl: 'https://drive.google.com/file/d/' + file.getId() + '/preview',
      openUrl: 'https://drive.google.com/file/d/' + file.getId() + '/view',
      downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
      path: path + '/' + file.getName(),
      folderName: folder.getName(),
      source: 'APPS_SCRIPT_DRIVE_SCAN_V79',
      preferred: /__SCALONE/i.test(file.getName()),
      partsExtracted: parts.length > 0,
      hasPartsList: parts.length > 0,
      githubPreviewReady: true,
      parts: parts,
      displayPriority: pgwScorePdfV79_(file.getName(), parts.length)
    });
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) {
    if (rows.length >= PGW_V79.maxFiles) return;
    const child = folders.next();
    pgwScanFolderV79_(child, path + '/' + child.getName(), rows, seen, options);
  }
}

function pgwTryExtractPdfTextV79_(file) {
  try {
    if (typeof Drive === 'undefined' || !Drive.Files) return '';
    const temp = Drive.Files.copy({title: 'TEMP_PGW_TEXT_' + file.getId(), mimeType: MimeType.GOOGLE_DOCS}, file.getId());
    const doc = DocumentApp.openById(temp.id);
    const text = doc.getBody().getText();
    DriveApp.getFileById(temp.id).setTrashed(true);
    return text || '';
  } catch (e) {
    Logger.log('Brak ekstrakcji tekstu PDF dla ' + file.getName() + ': ' + e);
    return '';
  }
}

function pgwGroupDriveRowsV79_(rows) {
  const byModel = {};
  const noModel = [];
  rows.forEach(function(row) {
    const models = row.deviceIndexes && row.deviceIndexes.length ? row.deviceIndexes : pgwExtractModelsV79_([row.fileName, row.path].join(' '));
    if (!models.length) { noModel.push(row); return; }
    models.forEach(function(model) {
      const clone = JSON.parse(JSON.stringify(row));
      clone.deviceIndex = model;
      clone.model = model;
      clone.deviceIndexes = models;
      clone.modelsInPdf = models;
      clone.displayPriority = clone.displayPriority || pgwScorePdfV79_(clone.fileName, (clone.parts || []).length);
      const key = pgwNormV79_(model);
      if (!byModel[key] || clone.displayPriority > byModel[key].displayPriority) byModel[key] = clone;
    });
  });
  const items = Object.keys(byModel).map(function(k) { return byModel[k]; }).sort(function(a,b) { return String(a.deviceIndex).localeCompare(String(b.deviceIndex)); });
  const candidatesByModel = {};
  rows.forEach(function(row) {
    (row.deviceIndexes || []).forEach(function(model) {
      const key = pgwNormV79_(model);
      if (!candidatesByModel[key]) candidatesByModel[key] = [];
      candidatesByModel[key].push(row);
    });
  });
  const mergeQueue = [];
  Object.keys(candidatesByModel).forEach(function(key) {
    const list = candidatesByModel[key];
    const unique = {};
    list.forEach(function(r) { unique[r.fileId || r.fileName] = r; });
    const candidates = Object.keys(unique).map(function(k) { return unique[k]; });
    if (candidates.length > 1) mergeQueue.push({model: key, candidateCount: candidates.length, candidates: candidates.map(function(c) { return {fileId:c.fileId, fileName:c.fileName, path:c.path, priority:c.displayPriority, previewUrl:c.previewUrl}; })});
  });
  return {items: items, mergeQueue: mergeQueue, audit: {generatedAt:new Date().toISOString(), version:'v79', pdfRows: rows.length, models: items.length, noModel: noModel.length, mergeQueue: mergeQueue.length, noModelSample: noModel.slice(0,100)}};
}

function pgwBuildOrganizerPlanV79_(grouped, rows) {
  return {generatedAt:new Date().toISOString(), version:'v79', folders:['01_PREFEROWANE_SCALONE','02_DO_SCALENIA','03_DUPLIKATY_WARIANTY','04_NIEPRZYPISANE','05_RAPORTY'], counts:{pdfRows:rows.length, models:grouped.items.length, mergeQueue:grouped.mergeQueue.length}};
}

function pgwApplyOrganizerLabelsV79_(grouped, plan) {
  const root = pgwEnsureFolderV79_(DriveApp.getFolderById(PGW_V79.organizerRootParentId), PGW_V79.organizerRootName);
  const folders = {};
  plan.folders.forEach(function(name) { folders[name] = pgwEnsureFolderV79_(root, name); });
  grouped.items.forEach(function(row) {
    try {
      const file = DriveApp.getFileById(row.fileId);
      const target = row.preferred ? folders['01_PREFEROWANE_SCALONE'] : folders['02_DO_SCALENIA'];
      target.addFile(file); // nie usuwa ze starego folderu
    } catch(e) { Logger.log(e); }
  });
}

function pgwEnsureFolderV79_(parent, name) { const it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
function pgwUpsertJsonV79_(folderId, fileName, object) { const folder = DriveApp.getFolderById(folderId); const text = JSON.stringify(object, null, 2); const files = folder.getFilesByName(fileName); if (files.hasNext()) files.next().setContent(text); else folder.createFile(fileName, text, MimeType.PLAIN_TEXT); }
function pgwExtractModelsV79_(text) { const out=[]; function add(v){const n=pgwNormalizeModelV79_(v); if(n && out.indexOf(n)===-1) out.push(n);} String(text||'').replace(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/gi,function(m,p,d){add(String(p).toUpperCase()+'-'+d);return m;}); String(text||'').replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi,function(m,d){add(d);return m;}); return out; }
function pgwNormalizeModelV79_(value) { const s=String(value||'').trim().toUpperCase(); const m=s.match(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/); if(m) return m[1]+'-'+m[2]; const n=s.match(/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/); return n?n[1]:''; }
function pgwExtractPartsV79_(text) { const out=[]; const re=/(^|\n)\s*([0-9]+(?:[-,][0-9]+)*)\s+((?:Z|ZY|ZG|YG|YT)[A-Z0-9]*[-_]?[0-9]{2,6}(?:[-_][0-9A-Z]+)?)\s+([^\n]{0,120})/gi; let m; while((m=re.exec(String(text||'')))) out.push({position:m[2], partIndex:m[3].replace(/_/g,'-').toUpperCase(), namePl:String(m[4]||'').trim(), nameEn:''}); return out; }
function pgwScorePdfV79_(name, partsCount) { let s=0; const n=String(name||'').toLowerCase(); if(n.indexOf('__scalone')>=0) s+=1000000; if(partsCount) s+=800000; if(/czesci|części|zamienne/.test(n)) s+=300000; if(/do[_ -]?weryfikacji|wariant|_p\b|_q\b|eng|yeng/.test(n)) s-=150000; return s; }
function pgwNormV79_(x) { return String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }
function pgwUnionV79_(a,b){const out=[]; (a||[]).concat(b||[]).forEach(function(x){if(out.indexOf(x)===-1) out.push(x);}); return out;}
