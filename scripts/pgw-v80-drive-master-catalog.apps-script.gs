/**
 * PGW v80 - Drive Master Catalog
 *
 * Cel: Drive jest źródłem prawdy dla rysunków.
 * Skrypt skanuje foldery rysunków, buduje manifest modeli/PDF/części,
 * tworzy raporty i opcjonalnie porządkuje kopie w folderach roboczych.
 *
 * Start bezpieczny:
 *   pgwDriveMasterCatalogV80Preview()
 *
 * Porządkowanie bez kasowania źródeł:
 *   pgwDriveMasterCatalogV80ApplyCopies()
 */
const PGW_V80 = {
  sourceFolderIds: [
    '1wYvMsfwtz8jPvAaKW4W13au77lUAu3Gu', // Rysunki wybuchowe
    '1g2roYvjKlYtJ878sphfDv52P8-A4cB27', // robocze/weryfikacja
    '1YNNT87uyOhtg3tQfJ5y3HHxO9cuB_oaA'  // konwersja PDF
  ],
  repoDataFolderId: '1xOV2c7bj5E5W0rH9TwVtwme5m4eX8nnq',
  organizerParentFolderId: '1OQbwZZnV3VdJOkkqi1qtXNUiuBx5BycF',
  organizerRootName: 'PGW_RYSUNKI_PORZADKOWANIE_V80',
  maxFiles: 30000,
  maxTextExtractionsPerRun: 250,
  files: {
    manifest: 'drive-drawings-map.generated-v80.json',
    parts: 'drive-parts.generated-v80.json',
    audit: 'drive-master-audit-v80.json',
    mergePlan: 'drive-merge-plan-v80.json',
    organizerActions: 'drive-organizer-actions-v80.json'
  }
};
function pgwDriveMasterCatalogV80Preview() { return pgwDriveMasterCatalogV80_({applyCopies:false}); }
function pgwDriveMasterCatalogV80ApplyCopies() { return pgwDriveMasterCatalogV80_({applyCopies:true}); }
function pgwDriveMasterCatalogV80_/* MAIN */(opts) {
  const options = opts || {};
  const rows = [];
  const seen = {};
  const state = {textExtractions:0};
  PGW_V80.sourceFolderIds.forEach(function(id) {
    const folder = DriveApp.getFolderById(id);
    pgwScanFolderV80_(folder, folder.getName(), rows, seen, state);
  });
  const built = pgwBuildMasterV80_(rows);
  pgwUpsertJsonV80_(PGW_V80.repoDataFolderId, PGW_V80.files.manifest, {schema:'pgw-drive-map-generated-v80', generatedAt:new Date().toISOString(), count:built.items.length, items:built.items});
  pgwUpsertJsonV80_(PGW_V80.repoDataFolderId, PGW_V80.files.parts, {schema:'pgw-drive-parts-generated-v80', generatedAt:new Date().toISOString(), count:built.parts.length, items:built.parts});
  pgwUpsertJsonV80_(PGW_V80.repoDataFolderId, PGW_V80.files.audit, built.audit);
  pgwUpsertJsonV80_(PGW_V80.repoDataFolderId, PGW_V80.files.mergePlan, {schema:'pgw-drive-merge-plan-v80', generatedAt:new Date().toISOString(), count:built.mergePlan.length, items:built.mergePlan});
  pgwUpsertJsonV80_(PGW_V80.repoDataFolderId, PGW_V80.files.organizerActions, {schema:'pgw-drive-organizer-actions-v80', generatedAt:new Date().toISOString(), count:built.actions.length, items:built.actions});
  if (options.applyCopies) pgwApplyOrganizerCopiesV80_(built.actions);
  const summary = {pdfRows:rows.length, models:built.items.length, parts:built.parts.length, mergePlan:built.mergePlan.length, textExtractions:state.textExtractions, applyCopies:!!options.applyCopies};
  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}
function pgwScanFolderV80_(folder, path, rows, seen, state) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    if (rows.length >= PGW_V80.maxFiles) return;
    const file = files.next();
    const name = file.getName();
    if (file.getMimeType() !== MimeType.PDF && !/\.pdf$/i.test(name)) continue;
    if (seen[file.getId()]) continue;
    seen[file.getId()] = true;
    let text = [name, path].join('\n');
    let models = pgwExtractModelsV80_(text);
    let parts = [];
    if ((!models.length || /yt-|yg-|czesci|części|zamienne/i.test(name)) && state.textExtractions < PGW_V80.maxTextExtractionsPerRun) {
      const extracted = pgwTryExtractPdfTextV80_(file);
      if (extracted) { text += '\n' + extracted; state.textExtractions++; }
    }
    models = pgwExtractModelsV80_(text);
    parts = pgwExtractPartsV80_(text);
    rows.push({fileId:file.getId(), fileName:name, title:name, mimeType:'application/pdf', modelsInPdf:models, deviceIndexes:models, parts:parts, path:path + '/' + name, folderName:folder.getName(), size:file.getSize(), createdTime:file.getDateCreated(), modifiedTime:file.getLastUpdated(), viewerUrl:'https://drive.google.com/file/d/'+file.getId()+'/preview', openUrl:'https://drive.google.com/file/d/'+file.getId()+'/view'});
  }
  const folders = folder.getFolders();
  while (folders.hasNext()) { const child = folders.next(); pgwScanFolderV80_(child, path + '/' + child.getName(), rows, seen, state); }
}
function pgwBuildMasterV80_(rows) {
  const byModel = {}, candidatesByModel = {}, partsFlat = [], actions = [], rejected = [];
  rows.forEach(function(row) {
    const models = row.modelsInPdf && row.modelsInPdf.length ? row.modelsInPdf : pgwExtractModelsV80_([row.fileName,row.path].join(' '));
    if (!models.length) { rejected.push({fileId:row.fileId,fileName:row.fileName,path:row.path}); return; }
    models.forEach(function(model) {
      const flags = pgwFlagsV80_(row, model);
      const score = pgwScoreV80_(row, flags);
      const item = {fileId:row.fileId, deviceIndex:model, model:model, deviceIndexes:models, modelsInPdf:models, title:row.title, fileName:row.fileName, canonicalFileName:'Czesci_zamienne_'+model+(flags.indexOf('SCALONE')>=0?'__SCALONE':'')+'.pdf', brand:pgwInferBrandV80_(model,row), mimeType:'application/pdf', viewerUrl:row.viewerUrl, previewUrl:row.viewerUrl, openUrl:row.openUrl, path:row.path, folderName:row.folderName, source:'APPS_SCRIPT_DRIVE_MASTER_V80', preferred:flags.indexOf('SCALONE')>=0, githubPreviewReady:true, hasPartsList:row.parts && row.parts.length>0, partsExtracted:row.parts && row.parts.length>0, qualityFlags:flags, displayPriority:score, parts:row.parts || []};
      const key=pgwNormV80_(model); if(!byModel[key] || score>byModel[key].displayPriority) byModel[key]=item; if(!candidatesByModel[key]) candidatesByModel[key]=[]; candidatesByModel[key].push(item);
      (row.parts||[]).forEach(function(p){partsFlat.push({deviceIndex:model,drawingFileId:row.fileId,position:p.position,partIndex:p.partIndex,namePl:p.namePl,nameEn:p.nameEn,source:'APPS_SCRIPT_DRIVE_MASTER_V80'});});
    });
  });
  const items = Object.keys(byModel).map(function(k){return byModel[k];}).sort(function(a,b){return String(a.deviceIndex).localeCompare(String(b.deviceIndex));});
  const mergePlan = [];
  Object.keys(candidatesByModel).forEach(function(key) {
    const list = candidatesByModel[key].sort(function(a,b){return b.displayPriority-a.displayPriority;});
    if (list.length>1) mergePlan.push({model:list[0].deviceIndex,recommendedFileId:list[0].fileId,recommendedFileName:list[0].fileName,candidates:list.map(function(x){return {fileId:x.fileId,fileName:x.fileName,path:x.path,flags:x.qualityFlags,previewUrl:x.previewUrl};})});
    list.forEach(function(x,i){ actions.push({model:x.deviceIndex,fileId:x.fileId,fileName:x.fileName,canonicalFileName:x.canonicalFileName,targetFolder:(x.qualityFlags.indexOf('SCALONE')>=0||i===0?'01_PREFEROWANE_SCALONE':'03_DUPLIKATY_WARIANTY'),operation:'MAKE_COPY_IN_ORGANIZER',safe:true});});
  });
  const audit={generatedAt:new Date().toISOString(),version:'v80',summary:{pdfRows:rows.length,models:items.length,parts:partsFlat.length,mergePlan:mergePlan.length,rejectedNoModel:rejected.length},rejectedSample:rejected.slice(0,100)};
  return {items:items, parts:partsFlat, mergePlan:mergePlan, actions:actions, audit:audit};
}
function pgwApplyOrganizerCopiesV80_(actions) {
  const root = pgwEnsureFolderV80_(DriveApp.getFolderById(PGW_V80.organizerParentFolderId), PGW_V80.organizerRootName);
  const folders = {}; ['01_PREFEROWANE_SCALONE','02_DO_SCALENIA','03_DUPLIKATY_WARIANTY','04_NIEPRZYPISANE','05_RAPORTY'].forEach(function(n){folders[n]=pgwEnsureFolderV80_(root,n);});
  actions.slice(0,1500).forEach(function(a){ try { const src=DriveApp.getFileById(a.fileId); src.makeCopy(a.canonicalFileName || a.fileName, folders[a.targetFolder] || folders['03_DUPLIKATY_WARIANTY']); } catch(e){Logger.log(e);} });
}
function pgwTryExtractPdfTextV80_(file) { try { if (typeof Drive === 'undefined' || !Drive.Files) return ''; const temp=Drive.Files.copy({title:'TEMP_PGW_V80_'+file.getId(),mimeType:MimeType.GOOGLE_DOCS}, file.getId()); const text=DocumentApp.openById(temp.id).getBody().getText(); DriveApp.getFileById(temp.id).setTrashed(true); return text || ''; } catch(e) { Logger.log('PDF text extraction skipped: '+file.getName()+' '+e); return ''; } }
function pgwExtractModelsV80_(text){ const out=[]; function add(x){const m=pgwNormalizeModelV80_(x); if(m && out.indexOf(m)<0) out.push(m);} String(text||'').replace(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/gi,function(_,p,d){add(p+'-'+d);return _;}); String(text||'').replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi,function(_,d){add(d);return _;}); return out; }
function pgwNormalizeModelV80_(x){const s=String(x||'').toUpperCase(); const m=s.match(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/); if(m)return m[1]+'-'+m[2]; const n=s.match(/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/); return n?n[1]:'';}
function pgwExtractPartsV80_(text){const out=[], re=/(^|\n)\s*([0-9]+(?:[-,][0-9]+)*)\s+((?:Z|ZY|ZG|YG|YT)[A-Z0-9]*[-_]?[0-9]{2,6}(?:[-_][0-9A-Z]+)?)\s+([^\n]{0,130})/gi; let m; while((m=re.exec(String(text||'')))) out.push({position:m[2],partIndex:m[3].replace(/_/g,'-').toUpperCase(),namePl:String(m[4]||'').trim(),nameEn:''}); return out;}
function pgwFlagsV80_(row,model){const s=[row.fileName,row.path,row.folderName].join(' ').toLowerCase(), f=[]; if(/__scalone|scalone/.test(s))f.push('SCALONE'); if(row.parts&&row.parts.length)f.push('PARTS_LIST'); if(/rysunek|zlozeniowy|złożeniowy|exploded/.test(s))f.push('DRAWING'); if(/_p\b|_q\b|eng|yeng|wariant|variant|v\d\b/.test(s))f.push('VARIANT'); if(row.modelsInPdf&&row.modelsInPdf.length>1)f.push('MULTI_MODEL'); return f;}
function pgwScoreV80_(row,flags){let s=0;if(flags.indexOf('SCALONE')>=0)s+=1000000;if(flags.indexOf('PARTS_LIST')>=0)s+=800000;if(flags.indexOf('DRAWING')>=0)s+=300000;if(flags.indexOf('VARIANT')>=0)s-=250000;return s;}
function pgwInferBrandV80_(model,row){if(/^YG-/.test(model))return 'YATO GASTRO'; if(/^YT-/.test(model))return 'YATO'; return 'YATO';}
function pgwNormV80_(x){return String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function pgwEnsureFolderV80_(parent,name){const it=parent.getFoldersByName(name); return it.hasNext()?it.next():parent.createFolder(name);}
function pgwUpsertJsonV80_(folderId,name,obj){const folder=DriveApp.getFolderById(folderId), text=JSON.stringify(obj,null,2); const it=folder.getFilesByName(name); if(it.hasNext()) it.next().setContent(text); else folder.createFile(name,text,MimeType.PLAIN_TEXT);}
