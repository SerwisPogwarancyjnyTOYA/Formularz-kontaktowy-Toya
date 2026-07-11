#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const VERSION = 'v80-drive-master-catalog';
const inputFiles = [
  'drive-drawings-map.full.json',
  'drive-drawings-map.converted.json',
  'drive-drawings-map.generated-v80.json',
  'drive-drawings-map.generated-v79.json',
  'drive-drawings-map.generated-v78.json',
  'drive-drawings-map.json'
];
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')); } catch { return fallback; } }
function writeJson(file, value) { fs.writeFileSync(path.join(dataDir, file), JSON.stringify(value, null, 2) + '\n'); }
function arr(x) { return Array.isArray(x) ? x : (x && Array.isArray(x.items) ? x.items : (x && Array.isArray(x.rows) ? x.rows : [])); }
function norm(x) { return String(x || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,''); }
function stripPdf(x) { return String(x || '').replace(/\.pdf(?:\?.*)?$/i, ''); }
function titleText(row) { return [row.title,row.fileName,row.name,row.path,row.folderName,row.deviceName,row.displayTitle,row.content,row.searchText,row.pdfHeader].filter(Boolean).join(' '); }
function normalizeModel(raw) {
  const s = String(raw || '').trim().toUpperCase();
  const m = s.match(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/);
  if (m) return `${m[1]}-${m[2]}`;
  const n = s.match(/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/);
  return n ? n[1] : '';
}
function extractModels(row) {
  const explicit = []
    .concat(arr(row.deviceIndexes)).concat(arr(row.modelsInPdf)).concat(arr(row.models)).concat(arr(row.keys));
  if (row.deviceIndex) explicit.push(row.deviceIndex);
  if (row.model) explicit.push(row.model);
  const text = explicit.concat([titleText(row)]).join(' ');
  const out = [];
  const add = v => { const m = normalizeModel(v); if (m && !out.some(x => norm(x) === norm(m))) out.push(m); };
  String(text).replace(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/gi, (_, p, d) => { add(`${p}-${d}`); return _; });
  String(text).replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi, (_, d) => { add(d); return _; });
  explicit.forEach(add);
  return out;
}
function isPdf(row) {
  const s = [row.mimeType,row.type,row.fileName,row.title,row.name,row.openUrl,row.viewerUrl,row.path].filter(Boolean).join(' ').toLowerCase();
  return s.includes('application/pdf') || /\.pdf(\?|#|$|\s)/i.test(s) || String(row.type || '').toLowerCase() === 'pdf';
}
function inferBrand(model, row) {
  const text = [model,row.brand,row.path,row.folderName,row.fileName,row.title].join(' ').toUpperCase();
  if (/\bYT[-_ ]?/.test(text) || /YATO/.test(text)) return 'YATO';
  if (/\bYG[-_ ]?/.test(text) || /GASTRO/.test(text)) return 'YATO GASTRO';
  if (/LUND/.test(text)) return 'LUND';
  if (/STHOR/.test(text)) return 'STHOR';
  if (/VOREL/.test(text)) return 'VOREL';
  if (/FALA/.test(text)) return 'FALA';
  if (/FLO/.test(text)) return 'FLO';
  return row.brand || 'YATO';
}
function drivePreview(fileId) { return fileId ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview` : ''; }
function driveOpen(fileId) { return fileId ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view` : ''; }
function extractParts(row, model) {
  const fromArrays = arr(row.parts || row.extractedParts || row.partsList).map(p => ({
    position: String(p.position || p.pos || p.no || '').trim(),
    partIndex: String(p.partIndex || p.index || p.sap || p.nrSap || '').trim().replace(/_/g,'-').toUpperCase(),
    namePl: String(p.namePl || p.name || p.description || '').trim(),
    nameEn: String(p.nameEn || '').trim()
  })).filter(p => p.partIndex);
  const text = String(row.content || row.searchText || row.pdfHeader || '');
  const parsed = [];
  const re = /(^|\n)\s*([0-9]+(?:[-,][0-9]+)*)\s+((?:Z|ZY|ZG|YG|YT)[A-Z0-9]*[-_]?[0-9]{2,6}(?:[-_][0-9A-Z]+)?)\s+([^\n]{0,140})/gi;
  let m;
  while ((m = re.exec(text))) {
    const partIndex = m[3].replace(/_/g, '-').toUpperCase();
    if (!partIndex || norm(partIndex) === norm(model)) continue;
    const rest = String(m[4] || '').trim();
    const chunks = rest.split(/\s{2,}| {3,}/).filter(Boolean);
    parsed.push({position:m[2], partIndex, namePl: chunks[0] || rest, nameEn: chunks[1] || ''});
  }
  const map = new Map();
  for (const p of fromArrays.concat(parsed)) {
    const key = [p.position,p.partIndex,p.namePl].join('|');
    if (!map.has(key)) map.set(key,p);
  }
  return [...map.values()];
}
function classify(row, partsCount, models) {
  const n = String(row.fileName || row.title || '').toLowerCase();
  const t = [row.path,row.folderName,row.status,row.notes,row.source].join(' ').toLowerCase();
  const flags = [];
  if (/__scalone|scalone/.test(n+t)) flags.push('SCALONE');
  if (partsCount) flags.push('PARTS_LIST');
  if (/rysunek|zlozeniowy|złożeniowy|exploded/.test(n+t)) flags.push('DRAWING');
  if (/do[_ -]?polaczenia|do[_ -]?połączenia|techniczny/.test(n+t)) flags.push('NEEDS_MERGE_SOURCE');
  if (/_p\b|_q\b|\beng\b|yeng|wariant|variant|v\d\b/.test(n+t)) flags.push('VARIANT');
  if (models.length > 1) flags.push('MULTI_MODEL');
  return flags;
}
function priority(row, partsCount, flags) {
  let s = 0;
  if (flags.includes('SCALONE')) s += 1000000;
  if (flags.includes('PARTS_LIST')) s += 800000;
  if (flags.includes('DRAWING')) s += 300000;
  if (flags.includes('MULTI_MODEL')) s += 10000;
  if (flags.includes('NEEDS_MERGE_SOURCE')) s -= 150000;
  if (flags.includes('VARIANT')) s -= 250000;
  const ts = Date.parse(row.modifiedTime || row.updatedAt || row.createdAt || 0) || 0;
  return s + Math.floor(ts / 1000000000);
}
function canonicalFileName(model, flags) { return `Czesci_zamienne_${model}${flags.includes('SCALONE') ? '__SCALONE' : ''}.pdf`; }

const raw = [];
for (const f of inputFiles) raw.push(...arr(readJson(f, [])));
const candidates = [];
const rejected = [];
for (const row of raw) {
  if (!row || !isPdf(row)) continue;
  const models = extractModels(row);
  if (!models.length) { rejected.push({reason:'NO_MODEL', fileId:row.fileId||row.id||'', fileName:row.fileName||row.title||row.name||'', path:row.path||''}); continue; }
  const fileId = row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.id || '';
  for (const model of models) {
    const parts = extractParts(row, model);
    const flags = classify(row, parts.length, models);
    candidates.push({
      fileId,
      deviceIndex: model,
      model,
      deviceIndexes: models,
      modelsInPdf: models,
      title: row.title || row.fileName || row.name || `${model}.pdf`,
      fileName: row.fileName || row.title || row.name || `${model}.pdf`,
      canonicalFileName: canonicalFileName(model, flags),
      brand: inferBrand(model, row),
      mimeType: 'application/pdf',
      viewerUrl: row.viewerUrl || row.previewUrl || drivePreview(fileId),
      previewUrl: row.previewUrl || row.viewerUrl || drivePreview(fileId),
      openUrl: row.openUrl || row.url || driveOpen(fileId),
      downloadUrl: row.downloadUrl || (fileId ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}` : ''),
      path: row.path || row.folderPath || '',
      folderName: row.folderName || '',
      source: row.source || 'DRIVE_MASTER_V80',
      status: 'drive-master-candidate',
      preferred: flags.includes('SCALONE') || Boolean(row.preferred),
      githubPreviewReady: true,
      hasPartsList: parts.length > 0 || Boolean(row.hasPartsList),
      partsExtracted: parts.length > 0 || Boolean(row.partsExtracted),
      pdfVariant: flags.includes('SCALONE') ? 'merged_parts_and_drawing' : (parts.length ? 'parts_list_or_generated_pdf' : 'drive_pdf'),
      displayMode: 'standard-service-card',
      displayPriority: priority(row, parts.length, flags),
      qualityFlags: flags,
      keys: [...new Set([model, norm(model), stripPdf(row.fileName || row.title || ''), ...models])],
      parts
    });
  }
}
const byModel = new Map();
const allByModel = new Map();
for (const c of candidates) {
  const k = norm(c.deviceIndex);
  if (!allByModel.has(k)) allByModel.set(k, []);
  allByModel.get(k).push(c);
  const prev = byModel.get(k);
  if (!prev || c.displayPriority > prev.displayPriority) byModel.set(k,c);
}
const items = [...byModel.values()].sort((a,b) => a.deviceIndex.localeCompare(b.deviceIndex,'pl'));
const partsFlat = [];
for (const item of items) {
  for (const p of item.parts || []) partsFlat.push({deviceIndex:item.deviceIndex, drawingFileId:item.fileId, drawingFileName:item.fileName, position:p.position, partIndex:p.partIndex, namePl:p.namePl, nameEn:p.nameEn, source:'DRIVE_MASTER_V80'});
}
const mergePlan = [];
const organizerActions = [];
for (const [k, list] of allByModel) {
  const files = [...new Map(list.map(x => [x.fileId || x.fileName, x])).values()].sort((a,b) => b.displayPriority-a.displayPriority);
  const best = files[0];
  if (!best) continue;
  const hasScalone = files.some(f => f.qualityFlags.includes('SCALONE'));
  const hasParts = files.some(f => f.hasPartsList);
  const hasDrawingish = files.some(f => /rysunek|zlozeniowy|złożeniowy|drawing|exploded/i.test([f.fileName,f.path,f.title].join(' ')) || f.qualityFlags.includes('DRAWING'));
  const action = hasScalone ? 'KEEP_SCALONE_AS_CANONICAL' : (hasParts && hasDrawingish && files.length > 1 ? 'MERGE_PARTS_AND_DRAWING' : (files.length > 1 ? 'KEEP_BEST_REVIEW_DUPLICATES' : 'KEEP_SINGLE'));
  if (action !== 'KEEP_SINGLE') mergePlan.push({model:best.deviceIndex, action, recommendedFileId:best.fileId, recommendedFileName:best.fileName, canonicalFileName:best.canonicalFileName, candidates:files.map(f => ({fileId:f.fileId,fileName:f.fileName,path:f.path,flags:f.qualityFlags,parts:(f.parts||[]).length,priority:f.displayPriority,previewUrl:f.previewUrl}))});
  for (const f of files) {
    const target = f.qualityFlags.includes('SCALONE') ? '01_PREFEROWANE_SCALONE' : (action === 'MERGE_PARTS_AND_DRAWING' ? '02_DO_SCALENIA' : (f === best ? '01_PREFEROWANE_SCALONE' : '03_DUPLIKATY_WARIANTY'));
    organizerActions.push({model:f.deviceIndex, fileId:f.fileId, fileName:f.fileName, canonicalFileName:f.canonicalFileName, targetFolder:target, operation:'COPY_OR_ADD_TO_ORGANIZER_FOLDER', safe:true});
  }
}
const multiModel = candidates.filter(c => (c.modelsInPdf || []).length > 1);
const audit = {generatedAt:new Date().toISOString(), version:VERSION, summary:{inputPdfRows: raw.filter(isPdf).length, candidates:candidates.length, uniqueModels:items.length, extractedParts:partsFlat.length, multiModelCandidates:multiModel.length, mergePlan:mergePlan.length, rejectedNoModel:rejected.length}, examples:{multiModel:multiModel.slice(0,30).map(c=>({fileName:c.fileName,models:c.modelsInPdf,fileId:c.fileId})), mergePlan:mergePlan.slice(0,30), rejected:rejected.slice(0,50)}, notes:['v80 buduje master katalog z Drive: modele, rysunki, czesci i bezpieczne akcje porzadkowania.','Drive pozostaje zrodlem prawdy. devices.json tylko uzupelnia dane, nie ogranicza katalogu.','Akcje organizer sa bezpieczne: kopiowanie/dodanie do folderu, bez kasowania oryginalow.']};
writeJson('drive-drawings-map.generated-v80.json', {schema:'pgw-drive-map-generated-v80', generatedAt:new Date().toISOString(), count:items.length, items});
writeJson('drive-parts.generated-v80.json', {schema:'pgw-drive-parts-generated-v80', generatedAt:new Date().toISOString(), count:partsFlat.length, items:partsFlat});
writeJson('drive-master-audit-v80.json', audit);
writeJson('drive-merge-plan-v80.json', {schema:'pgw-drive-merge-plan-v80', generatedAt:new Date().toISOString(), count:mergePlan.length, items:mergePlan});
writeJson('drive-organizer-actions-v80.json', {schema:'pgw-drive-organizer-actions-v80', generatedAt:new Date().toISOString(), count:organizerActions.length, items:organizerActions});
console.log(`v80 master: ${items.length} modeli, ${partsFlat.length} części z PDF, ${mergePlan.length} modeli do kontroli/scalania.`);
