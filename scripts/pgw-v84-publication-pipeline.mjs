import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'data');
const mapPath = path.join(dataDir, 'drive-drawings-map.generated-v84.json');
const reportPath = path.join(dataDir, 'publication-report-v84.json');
const rewritePath = path.join(dataDir, 'pdf-rewrite-queue-v84.json');

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const map = read(mapPath);
const report = read(reportPath);
const rewrite = read(rewritePath);

const badMarkers = [/pdf roboczy/i, /zrodla w folderze/i, /źródła w folderze/i, /material roboczy/i, /materiał roboczy/i, /ocr/i, /ręcznej weryfikacji/i, /recznej weryfikacji/i];
const publicRows = Array.isArray(map.items) ? map.items : [];
const badPublic = publicRows.filter((row) => {
  const text = [row.fileName, row.title, row.path, row.folderName, row.notes, row.source, row.publicationReason].join(' ');
  return badMarkers.some((rx) => rx.test(text));
});
if (badPublic.length) {
  console.error('Blocked: public map contains roboczy/internal records:', badPublic.slice(0, 10).map(x => x.fileName));
  process.exit(1);
}
if (!publicRows.length) {
  console.error('No public rows generated.');
  process.exit(1);
}
if (!rewrite.items?.length) {
  console.error('Rewrite queue missing; expected roboczy batch tracking.');
  process.exit(1);
}
console.log(JSON.stringify({
  ok: true,
  publicRows: publicRows.length,
  rewriteQueue: rewrite.items.length,
  version: map.version,
  report: report.summary
}, null, 2));
