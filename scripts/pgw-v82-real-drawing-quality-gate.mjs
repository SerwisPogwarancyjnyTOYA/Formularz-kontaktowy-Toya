#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
function readJson(p){ return JSON.parse(fs.readFileSync(path.join(root,p),'utf8')); }
const map = readJson('data/drive-drawings-map.generated-v82.json');
const quarantine = readJson('data/pdf-quarantine-v82.json');
const blocklist = readJson('data/pdf-customer-visible-blocklist-v82.json');
const rows = Array.isArray(map.items) ? map.items : [];
const badVisible = rows.filter(row => {
  const fid = String(row.fileId || '');
  const text = [row.fileName,row.title,row.path,row.folderName,row.pdfVariant,row.notes].join(' ').toLowerCase();
  return (blocklist.blockedFileIds || []).includes(fid) || text.includes('pdf roboczy wygenerowany automatycznie') || (text.includes('robocze') && text.includes('parts_list_or_generated_pdf'));
});
if (badVisible.length) {
  console.error('BŁĄD: do katalogu klienta weszły PDF-y zablokowane przez v82:', badVisible.map(x => x.fileName || x.title));
  process.exit(1);
}
console.log(JSON.stringify({ok:true, visibleRows: rows.length, quarantinedRows: quarantine.count || 0, blockedFileIds: blocklist.blockedFileIds || []}, null, 2));
