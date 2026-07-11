#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const VERSION = 'v79-drive-catalog-and-pdf-organizer';

const inputFiles = [
  'drive-drawings-map.full.json',
  'drive-drawings-map.converted.json',
  'drive-drawings-map.generated-v78.json',
  'drive-drawings-map.generated-v79.json',
  'drive-drawings-map.json'
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')); }
  catch { return fallback; }
}
function writeJson(file, data) { fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2) + '\n'); }
function arr(x) { return Array.isArray(x) ? x : (x && Array.isArray(x.items) ? x.items : (x && Array.isArray(x.rows) ? x.rows : [])); }
function norm(x) { return String(x || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,''); }
function cleanText(x) { return String(x || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim(); }
function stripPdf(x) { return String(x || '').replace(/\.pdf(?:\?.*)?$/i, ''); }
function normalizeModel(raw) {
  const s = String(raw || '').trim().toUpperCase();
  const pref = s.match(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/);
  if (pref) return `${pref[1]}-${pref[2]}`;
  const num = s.match(/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/);
  return num ? num[1] : '';
}
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function isPdf(row) {
  const text = [row.type, row.mimeType, row.fileName, row.title, row.name, row.path, row.openUrl, row.viewerUrl].filter(Boolean).join(' ').toLowerCase();
  return text.includes('application/pdf') || /\.pdf(\?|#|$|\s)/i.test(text) || String(row.type || '').toLowerCase() === 'pdf';
}
function extractModels(row) {
  const explicit = []
    .concat(arr(row.deviceIndexes))
    .concat(arr(row.modelsInPdf))
    .concat(arr(row.models))
    .concat(arr(row.keys));
  if (row.deviceIndex) explicit.push(row.deviceIndex);
  if (row.model) explicit.push(row.model);
  const text = [
    ...explicit, row.fileName, row.title, row.name, row.path, row.folderName, row.deviceName,
    row.searchText, row.pdfHeader, row.content, row.textSnippet
  ].join(' ');
  const found = [];
  const add = value => {
    const m = normalizeModel(value);
    if (m && !found.some(x => norm(x) === norm(m))) found.push(m);
  };
  String(text).replace(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/gi, (_, p, d) => { add(`${p}-${d}`); return _; });
  String(text).replace(/(?:^|[^0-9A-Z])(\d{5})(?:[^0-9A-Z]|$)/gi, (_, d) => { add(d); return _; });
  explicit.forEach(add);
  return found;
}
function extractParts(row, models) {
  const existing = arr(row.parts || row.extractedParts || row.partsList).map(p => ({
    position: String(p.position || p.pos || p.no || '').trim(),
    partIndex: String(p.partIndex || p.index || p.sap || '').trim().toUpperCase(),
    namePl: String(p.namePl || p.name || p.description || '').trim(),
    nameEn: String(p.nameEn || '').trim()
  })).filter(p => p.partIndex);
  if (existing.length) return existing;
  const text = String(row.content || row.searchText || row.pdfHeader || '');
  const parts = [];
  const re = /(^|\n)\s*([0-9]+(?:[-,][0-9]+)*)\s+((?:Z|ZY|ZG|YG|YT)[A-Z0-9]*[-_]?[0-9]{2,6}(?:[-_][0-9A-Z]+)?)\s+([^\n]{0,120})/gi;
  let m;
  while ((m = re.exec(text))) {
    const partIndex = m[3].replace(/_/g, '-').toUpperCase();
    if (!partIndex || models.some(model => norm(partIndex) === norm(model))) continue;
    const names = String(m[4] || '').trim().split(/\s{2,}| {3,}/);
    parts.push({ position: m[2], partIndex, namePl: names[0] || '', nameEn: names[1] || '' });
  }
  return parts;
}
function rowPriority(row, partsCount = 0) {
  const name = String(row.fileName || row.title || '').toLowerCase();
  const text = [row.status, row.source, row.notes, row.pdfVariant, row.path, row.folderName].join(' ').toLowerCase();
  let score = 0;
  if (name.includes('__scalone') || text.includes('scalone')) score += 1000000;
  if (partsCount || row.partsExtracted || row.hasPartsList) score += 800000;
  if (/czesci|części|zamienne|lista/.test(name)) score += 300000;
  if (row.viewerUrl || row.previewUrl || row.githubPreviewReady) score += 50000;
  if (/do[_ -]?polaczenia|do[_ -]?połączenia/.test(name)) score -= 250000;
  if (/do[_ -]?weryfikacji|wariant|variant|_p\b|_q\b|yeng|\beng\b/.test(name + ' ' + text)) score -= 150000;
  const ts = Date.parse(row.modifiedTime || row.updatedAt || row.createdAt || 0) || 0;
  return score + Math.floor(ts / 1000000000);
}
function drivePreview(fileId) { return fileId ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/preview` : ''; }
function driveOpen(fileId) { return fileId ? `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view` : ''; }

const sourceRows = [];
for (const f of inputFiles) sourceRows.push(...arr(readJson(f, [])));
const byModel = new Map();
const allCandidates = [];
const noModel = [];

for (const row of sourceRows) {
  if (!row || !isPdf(row)) continue;
  const models = extractModels(row);
  if (!models.length) { noModel.push(row); continue; }
  const parts = extractParts(row, models);
  const fileId = row.fileId || row.driveFileId || row.googleDriveId || row.gdriveId || row.id || '';
  for (const model of models) {
    const candidate = {
      fileId,
      title: row.title || row.fileName || row.name || `${model}.pdf`,
      fileName: row.fileName || row.title || row.name || `${model}.pdf`,
      mimeType: 'application/pdf',
      model,
      deviceIndex: model,
      deviceIndexes: models,
      modelsInPdf: models,
      brand: row.brand || '',
      viewerUrl: row.viewerUrl || row.previewUrl || drivePreview(fileId),
      previewUrl: row.previewUrl || row.viewerUrl || drivePreview(fileId),
      openUrl: row.openUrl || row.url || driveOpen(fileId),
      downloadUrl: row.downloadUrl || (fileId ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}` : ''),
      path: row.path || row.folderPath || row.originalPath || '',
      folderName: row.folderName || '',
      source: row.source || 'DRIVE_MANIFEST_V79',
      status: row.status || 'drive-catalog-candidate',
      preferred: Boolean(row.preferred || /__SCALONE/i.test(row.fileName || row.title || '')),
      partsExtracted: Boolean(parts.length || row.partsExtracted),
      hasPartsList: Boolean(parts.length || row.hasPartsList),
      githubPreviewReady: true,
      pdfVariant: /__SCALONE/i.test(row.fileName || row.title || '') ? 'merged_parts_and_drawing' : (parts.length ? 'parts_list_or_generated_pdf' : 'drive_pdf'),
      displayMode: 'standard-service-card',
      displayPriority: rowPriority(row, parts.length),
      keys: uniq(models.concat([model, norm(model), stripPdf(row.fileName || row.title || '')])),
      parts
    };
    allCandidates.push(candidate);
    const key = norm(model);
    const prev = byModel.get(key);
    if (!prev || candidate.displayPriority > prev.displayPriority) byModel.set(key, candidate);
  }
}
const items = [...byModel.values()].sort((a,b) => a.deviceIndex.localeCompare(b.deviceIndex, 'pl'));
const byFile = new Map();
for (const c of allCandidates) {
  const k = c.fileId || c.fileName;
  if (!byFile.has(k)) byFile.set(k, []);
  byFile.get(k).push(c);
}
const multiModelPdf = [...byFile.values()].filter(rows => uniq(rows.map(r => r.deviceIndex)).length > 1).map(rows => ({
  fileId: rows[0].fileId,
  fileName: rows[0].fileName,
  models: uniq(rows.map(r => r.deviceIndex)),
  partsCount: Math.max(...rows.map(r => (r.parts || []).length)),
  preferred: rows.some(r => r.preferred),
  openUrl: rows[0].openUrl,
  previewUrl: rows[0].previewUrl
}));
const byModelCandidates = new Map();
for (const c of allCandidates) {
  const k = norm(c.deviceIndex);
  if (!byModelCandidates.has(k)) byModelCandidates.set(k, []);
  byModelCandidates.get(k).push(c);
}
const mergeQueue = [];
for (const [key, rows] of byModelCandidates) {
  const uniqueFiles = [...new Map(rows.map(r => [r.fileId || r.fileName, r])).values()];
  if (uniqueFiles.length < 2) continue;
  const sorted = uniqueFiles.sort((a,b) => b.displayPriority - a.displayPriority);
  const needsMerge = sorted.some(r => /do[_ -]?polaczenia|techniczny|lista/i.test(r.fileName + ' ' + r.pdfVariant)) && !sorted[0].preferred;
  mergeQueue.push({
    model: sorted[0].deviceIndex,
    candidateCount: uniqueFiles.length,
    recommended: sorted[0],
    needsMerge,
    action: needsMerge ? 'MERGE_DRAWING_AND_PARTS' : 'VERIFY_DUPLICATES_KEEP_BEST',
    candidates: sorted.map(r => ({ fileId: r.fileId, fileName: r.fileName, priority: r.displayPriority, parts: (r.parts || []).length, previewUrl: r.previewUrl, openUrl: r.openUrl }))
  });
}
const organizerPlan = {
  generatedAt: new Date().toISOString(),
  version: VERSION,
  rules: [
    { target: '01_PREFEROWANE_SCALONE', condition: 'PDF ma __SCALONE albo zawiera rysunek + liste czesci' },
    { target: '02_DO_SCALENIA', condition: 'dla modelu istnieje osobny rysunek techniczny i osobna lista czesci' },
    { target: '03_DUPLIKATY_WARIANTY', condition: 'warianty _p, _q, eng, yeng, V2/V3, duplikaty nizszego priorytetu' },
    { target: '04_NIEPRZYPISANE', condition: 'nie udalo sie rozpoznac modelu z nazwy/folderu/tresci' },
    { target: '05_RAPORTY', condition: 'raporty CSV/JSON po skanowaniu' }
  ],
  counts: {
    inputPdfRows: sourceRows.filter(isPdf).length,
    uniqueModelsWithPdf: items.length,
    candidates: allCandidates.length,
    multiModelPdf: multiModelPdf.length,
    mergeQueue: mergeQueue.length,
    noModelPdf: noModel.length
  }
};
const audit = {
  generatedAt: new Date().toISOString(),
  version: VERSION,
  inputFiles,
  summary: organizerPlan.counts,
  multiModelPdf: multiModelPdf.slice(0, 250),
  noModelPdf: noModel.slice(0, 250).map(r => ({ fileId: r.fileId || r.id || '', fileName: r.fileName || r.title || r.name || '', path: r.path || '' })),
  sample: items.slice(0, 50),
  notes: [
    'v79 naprawia deduplikacje po samym fileId - jeden PDF moze tworzyc kilka urzadzen.',
    'Drive pozostaje zrodlem prawdy dla rysunkow. devices.json nie jest jedyna bramka do formularza.',
    'Kolejka scalania wskazuje modele, dla ktorych nalezy polaczyc rysunek i liste czesci.'
  ]
};
writeJson('drive-drawings-map.generated-v79.json', { schema: 'pgw-drive-map-generated-v79', generatedAt: new Date().toISOString(), count: items.length, items });
writeJson('drive-catalog-audit-v79.json', audit);
writeJson('drive-pdf-merge-queue-v79.json', { generatedAt: new Date().toISOString(), version: VERSION, count: mergeQueue.length, items: mergeQueue });
writeJson('drive-organizer-plan-v79.json', organizerPlan);
console.log(`v79 catalog: ${items.length} modeli z PDF, ${mergeQueue.length} modeli w kolejce duplikatow/scalania, ${multiModelPdf.length} PDF multi-model.`);
