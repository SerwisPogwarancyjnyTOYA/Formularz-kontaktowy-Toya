#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const aliases = JSON.parse(fs.readFileSync(path.join(root, 'data', 'drive-model-aliases-v81.json'), 'utf8'));
const map = aliases.aliasesByModel || {};
const tests = ['YT-828113', 'yt828113', '828113', 'YT 828113', 'yt-828114'];
function compact(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
for (const t of tests) {
  const tc = compact(t);
  const hits = Object.entries(map).filter(([, list]) => (list || []).some(a => compact(a).includes(tc) || tc.includes(compact(a)))).map(([m]) => m).slice(0, 10);
  console.log(`${t}: ${hits.join(', ') || 'BRAK'}`);
  if (t.includes('828113') && !hits.includes('YT-828113')) process.exitCode = 1;
}
