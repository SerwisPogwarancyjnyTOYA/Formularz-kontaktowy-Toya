#!/usr/bin/env node
/**
 * Konwertuje eksport CSV zakładki "TOYA24 integracja" do assets/toya24-index.js.
 * Użycie:
 *   node scripts/sheet-to-toya24-index.mjs data/toya24-integracja.csv assets/toya24-index.js
 */
import fs from 'node:fs';

const input = process.argv[2] || 'data/toya24-integracja.csv';
const output = process.argv[3] || 'assets/toya24-index.js';

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], nx = text[i + 1];
    if (q) {
      if (ch === '"' && nx === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch !== '\r') cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => String(v || '').trim()));
}
function compactIndex(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function bool(v) { return ['tak','yes','true','1'].includes(String(v || '').trim().toLowerCase()); }
const csv = fs.readFileSync(input, 'utf8');
const rows = parseCsv(csv);
const headers = rows.shift();
const idx = Object.fromEntries(headers.map((h, i) => [h.trim(), i]));
const val = (r, h) => String(r[idx[h]] || '').trim();
const entries = rows.map(r => {
  const deviceIndex = val(r, 'Model urządzenia');
  const productId = val(r, 'ID produktu TOYA24');
  const aliases = Array.from(new Set([compactIndex(deviceIndex), compactIndex(deviceIndex).replace(/^YT|YG|ZG/, ''), productId].filter(Boolean)));
  return {
    status: val(r, 'Status'),
    deviceIndex,
    aliases,
    brand: val(r, 'Marka'),
    productName: val(r, 'Nazwa produktu'),
    category: val(r, 'Kategoria'),
    productUrl: val(r, 'URL karty TOYA24'),
    partsPdfUrl: val(r, 'URL PDF części TOYA24'),
    driveBackupUrl: val(r, 'URL rysunku Drive backup'),
    activeSource: val(r, 'Aktywne źródło'),
    pdfStatus: val(r, 'Status PDF'),
    partsStatus: val(r, 'Status części'),
    priority: val(r, 'Priorytet'),
    importToSite: bool(val(r, 'Import do strony')),
    toya24ProductId: productId,
    attachmentKey: val(r, 'Attachment key'),
    checkedAt: val(r, 'Data sprawdzenia'),
    partsTitle: deviceIndex ? `Części zamienne ${deviceIndex}` : '',
    notes: val(r, 'Uwagi')
  };
}).filter(e => e.deviceIndex);
const data = {
  generatedAt: new Date().toISOString().slice(0,10),
  source: 'Google Sheet: Baza_czesci_PGW_AKTUALIZACJA_2026-06-03 / TOYA24 integracja',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1bHcHt8Z8BwfJNAG5w-HHEz3f2Rh1NZ-nZsJ0xc3tPnQ/edit',
  sheetName: 'TOYA24 integracja',
  strategy: 'TOYA24 PDF jako źródło główne; Google Drive jako backup.',
  entries
};
fs.writeFileSync(output, 'window.PGW_TOYA24_INDEX = ' + JSON.stringify(data, null, 2) + ';\n');
console.log(`Zapisano ${entries.length} rekordów do ${output}`);
