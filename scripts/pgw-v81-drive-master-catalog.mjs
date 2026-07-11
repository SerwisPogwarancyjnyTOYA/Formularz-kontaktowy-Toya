#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const read = (name) => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
const generated = read('drive-drawings-map.generated-v81.json');
const aliases = read('drive-model-aliases-v81.json');
const parts = read('drive-parts.generated-v81.json');
const audit = read('drive-master-audit-v81.json');

const rows = generated.items || [];
const missingPreview = rows.filter(r => !String(r.viewerUrl || '').includes('/preview'));
const models = new Set(rows.map(r => r.deviceIndex).filter(Boolean));
const withParts = new Set((parts.items || []).map(p => p.deviceIndex).filter(Boolean));

console.log('PGW v81 Drive Master Catalog');
console.log('Rows:', rows.length);
console.log('Unique models:', models.size);
console.log('Generated parts:', (parts.items || []).length);
console.log('Models with generated parts:', withParts.size);
console.log('Alias models:', aliases.models || Object.keys(aliases.aliasesByModel || {}).length);
console.log('Missing /preview:', missingPreview.length);
console.log('Audit:', JSON.stringify(audit.summary || {}, null, 2));

if (missingPreview.length) {
  console.error('ERROR: some PDF rows do not use /preview URLs.');
  process.exit(1);
}
