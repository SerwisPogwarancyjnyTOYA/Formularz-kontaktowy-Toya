import fs from 'node:fs';
const mapPath = 'data/drive-drawings-map.generated-v83.json';
const auditPath = 'data/public-drawing-audit-v83.json';
const policyPath = 'data/public-drawing-policy-v83.json';
for (const p of [mapPath, auditPath, policyPath]) {
  if (!fs.existsSync(p)) throw new Error(`Missing ${p}`);
  JSON.parse(fs.readFileSync(p, 'utf8'));
}
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
const bad = map.items.filter(x => /PDF roboczy|zrodla w folderze|materiał roboczy|material roboczy|Lista części nie została/i.test(JSON.stringify(x)));
if (bad.length) throw new Error(`Public map contains ${bad.length} robocze/generated rows`);
console.log(JSON.stringify({ok:true, publicRows: map.items.length, checked: [mapPath, auditPath, policyPath]}, null, 2));
