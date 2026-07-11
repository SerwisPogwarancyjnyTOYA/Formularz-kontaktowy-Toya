import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const audit = JSON.parse(fs.readFileSync(path.join(root, 'data/coverage-audit-v76.json'), 'utf8'));
const pdf = JSON.parse(fs.readFileSync(path.join(root, 'data/pdf-quality-audit-v76.json'), 'utf8'));
console.log('PGW v76 coverage');
console.log(JSON.stringify({version:audit.version, summary:audit.summary, pdf:pdf.summary}, null, 2));
if (audit.summary.drivePdfModelsUnique < 1000) {
  console.error('Za mało modeli z PDF w audycie — sprawdź manifest Drive.');
  process.exit(1);
}
if (audit.summary.pdfRowsWithoutPreviewUrl > 0) {
  console.warn('Uwaga: są PDF-y bez /preview:', audit.summary.pdfRowsWithoutPreviewUrl);
}
