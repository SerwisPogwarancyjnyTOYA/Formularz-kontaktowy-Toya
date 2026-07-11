#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const manifestFiles = [
  'drive-drawings-map.full.json',
  'drive-drawings-map.converted.json',
  'drive-drawings-map.generated-v78.json',
  'drive-drawings-map.json'
];

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')); }
  catch { return fallback; }
}
function arr(x) { return Array.isArray(x) ? x : (x && Array.isArray(x.items) ? x.items : []); }
function norm(x) { return String(x || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]+/g,''); }
function normalizeModel(raw) {
  const s = String(raw || '').trim().toUpperCase();
  const pref = s.match(/\b(YT|YG)\s*[-_ ]?\s*(\d{4,6})\b/);
  if (pref) return `${pref[1]}-${pref[2]}`;
  const num = s.match(/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/);
  return num ? num[1] : '';
}
function extractModels(row) {
  const explicit = []
    .concat(row.deviceIndexes || [])
    .concat(row.modelsInPdf || [])
    .concat(row.models || [])
    .concat(row.keys || []);
  if (row.deviceIndex) explicit.push(row.deviceIndex);
  if (row.model) explicit.push(row.model);
  const text = [
    ...explicit, row.fileName, row.title, row.name, row.path, row.folderName, row.deviceName,
    row.searchText, row.pdfHeader
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
function classify(row) {
  const name = String(row.fileName || row.title || '').toLowerCase();
  if (name.includes('__scalone')) return 1000;
  if ((row.parts || row.extractedParts || []).length || row.partsExtracted || row.hasPartsList) return 850;
  if (/czesci|części|zamienne/.test(name)) return 700;
  return 400;
}

const allRows = [];
for (const file of manifestFiles) allRows.push(...arr(readJson(file, [])));
const modelMap = new Map();
const duplicates = [];
for (const row of allRows) {
  if (!/pdf/i.test(String(row.mimeType || row.fileName || row.title || ''))) continue;
  const models = extractModels(row);
  for (const model of models) {
    const candidate = {
      model,
      fileId: row.fileId || row.driveFileId || row.id || '',
      fileName: row.fileName || row.title || '',
      title: row.title || row.fileName || '',
      viewerUrl: row.viewerUrl || row.previewUrl || (row.fileId ? `https://drive.google.com/file/d/${row.fileId}/preview` : ''),
      openUrl: row.openUrl || (row.fileId ? `https://drive.google.com/file/d/${row.fileId}/view` : ''),
      source: row.source || '',
      priority: classify(row),
      partsCount: (row.parts || row.extractedParts || []).length || 0,
      allModelsInPdf: models
    };
    const key = norm(model);
    const prev = modelMap.get(key);
    if (!prev || candidate.priority > prev.priority) modelMap.set(key, candidate);
    else duplicates.push(candidate);
  }
}
const rows = [...modelMap.values()].sort((a,b) => a.model.localeCompare(b.model, 'pl'));
const report = {
  generatedAt: new Date().toISOString(),
  version: 'v78-drive-first-catalog-builder',
  uniqueModelsWithPdf: rows.length,
  duplicateOrLowerPriorityCandidates: duplicates.length,
  sample: rows.slice(0, 25),
  rows
};
fs.writeFileSync(path.join(dataDir, 'drive-first-catalog-audit-v78.json'), JSON.stringify(report, null, 2));
console.log(`Drive-first catalog: ${rows.length} modeli z PDF; ${duplicates.length} kandydatów niższego priorytetu.`);
