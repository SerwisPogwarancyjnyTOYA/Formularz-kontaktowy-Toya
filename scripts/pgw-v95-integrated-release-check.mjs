import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const version = '20260712-v95-v83-v94-master-publication-update';
const required = [
  'data/drive-drawings-map.generated-v95.json',
  'data/github-map-patch-v85-v94-master.json',
  'data/publication-report-v85-v94-master.json',
  'data/publication-report-v95.json',
  'data/pdf-rewrite-queue-v95.json',
  'data/publication-policy-v95.json',
  'docs/PUBLICATION_PIPELINE_V95.md'
];
const errors = [];
for (const rel of required) { if (!fs.existsSync(path.join(root, rel))) errors.push(`missing: ${rel}`); }
const cfg = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
if (!cfg.includes(version)) errors.push('config.js version mismatch');
if (!cfg.includes('drive-drawings-map.generated-v95.json')) errors.push('config.js does not load v95 map first');
const driveLine = cfg.match(/driveMap:\s*\[(.*?)\]/s)?.[1] || '';
if (driveLine.includes('drive-drawings-map.full') || driveLine.includes('drive-drawings-map.converted')) errors.push('forbidden full/converted fallback in public driveMap');
const map = JSON.parse(fs.readFileSync(path.join(root, 'data/drive-drawings-map.generated-v95.json'), 'utf8'));
if (map.version !== version) errors.push('v95 map version mismatch');
if (!Array.isArray(map.items) || map.items.length < 2000) errors.push('v95 map item count suspicious');
const patch = JSON.parse(fs.readFileSync(path.join(root, 'data/github-map-patch-v85-v94-master.json'), 'utf8'));
for (const [model, info] of Object.entries(patch)) {
  const found = map.items.some(item => {
    const keys = new Set([item.model, item.deviceIndex, item.fileName, ...(item.deviceIndexes || []), ...(item.keys || []), ...(item.searchAliases || [])].filter(Boolean).map(String));
    const stripped = model.replace(/^YT[-_ ]?/i, '');
    return (keys.has(model) || keys.has(stripped)) && item.fileId === info.driveFileId;
  });
  if (!found) errors.push(`patch not applied: ${model} -> ${info.driveFileId}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`PGW v95 integrated release OK — ${map.items.length} public drawing rows, ${Object.keys(patch).length} v85-v94 patch keys`);
