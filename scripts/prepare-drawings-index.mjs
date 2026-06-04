import fs from 'node:fs';
import path from 'node:path';

// Prosty skrypt pomocniczy: skanuje lokalny folder drawings/_incoming
// i tworzy szkic data/drawings-generated.json.
// Uruchomienie: node scripts/prepare-drawings-index.mjs

const root = process.cwd();
const incoming = path.join(root, 'drawings', '_incoming');
const out = path.join(root, 'data', 'drawings-generated.json');
const rx = /(?:^|_)(YT|YG|TOYA|VOREL|STHOR|LUND|FLO|FALA)[-_ ]?(\d{3,8})(?:\D|$)/i;
const files = fs.existsSync(incoming) ? fs.readdirSync(incoming, {recursive:true}) : [];
const rows = [];
for (const rel of files) {
  const full = path.join(incoming, rel);
  if (!fs.statSync(full).isFile()) continue;
  const m = String(rel).match(rx);
  const ext = path.extname(rel).toLowerCase();
  const deviceIndex = m ? `${m[1].toUpperCase()}-${m[2]}` : null;
  const brand = deviceIndex?.startsWith('YT-') || deviceIndex?.startsWith('YG-') ? 'YATO' : (m?.[1]?.toUpperCase() || 'UNKNOWN');
  const target = deviceIndex
    ? `drawings/${brand}/${deviceIndex.split('-')[0]}/${deviceIndex}${ext}`
    : `drawings/unmapped/${path.basename(rel)}`;
  rows.push({
    id: deviceIndex ? deviceIndex.toLowerCase() : path.basename(rel).toLowerCase().replace(/[^a-z0-9]+/g,'-'),
    deviceIndex,
    brand,
    title: path.basename(rel),
    type: ext === '.pdf' ? 'local-pdf' : 'local-file',
    status: deviceIndex ? 'recognized' : 'unmapped',
    localPath: target
  });
}
fs.writeFileSync(out, JSON.stringify(rows, null, 2));
console.log(`Wygenerowano ${rows.length} wpisów: ${out}`);
