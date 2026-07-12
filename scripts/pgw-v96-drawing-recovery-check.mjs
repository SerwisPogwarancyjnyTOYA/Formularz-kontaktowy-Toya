import fs from 'node:fs';
const must = [
  'data/drive-drawings-map.generated-v96.json',
  'data/publication-report-v96.json',
  'data/pdf-rewrite-queue-v96.json',
  'data/publication-consistency-audit-v96.json'
];
for (const f of must) if (!fs.existsSync(f)) throw new Error(`missing ${f}`);
const map = JSON.parse(fs.readFileSync('data/drive-drawings-map.generated-v96.json','utf8'));
const report = JSON.parse(fs.readFileSync('data/publication-report-v96.json','utf8'));
const queue = JSON.parse(fs.readFileSync('data/pdf-rewrite-queue-v96.json','utf8'));
const audit = JSON.parse(fs.readFileSync('data/publication-consistency-audit-v96.json','utf8'));
const rows = map.items || [];
const row75837 = rows.find(r => String(r.model)==='75837' || (r.modelsInPdf||[]).map(String).includes('75837'));
if (!row75837) throw new Error('75837 missing from v96 public map');
if (row75837.fileId !== '1yPUxNabt1H7E661BzB8CbXwPSM4HXXVI') throw new Error('75837 wrong Drive file id');
if (row75837.publicationStatus !== 'PUBLIC_READY') throw new Error('75837 not public ready');
if (queue.items.some(x => String(x.model)==='75837')) throw new Error('75837 still present in rewrite queue');
if ((audit.checks.missingPreviewLinks || []).length) throw new Error('missing preview links in public map');
if (!report.summary || report.summary.resolvedRewriteItems < 1) throw new Error('v96 report did not resolve rewrite item');
console.log('PGW v96 drawing recovery check OK — 75837 resolved; public map strict.');
