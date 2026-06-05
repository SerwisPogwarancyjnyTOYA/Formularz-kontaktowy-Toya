import fs from 'node:fs';
import XLSX from 'xlsx';

const input = process.argv[2] || 'Baza_czesci_PGW_GOOGLE_SHEETS_START_2026-06-03.xlsx';
const output = process.argv[3] || 'data/parts.generated.json';

if (!fs.existsSync(input)) {
  console.error(`Brak pliku: ${input}`);
  process.exit(1);
}

const wb = XLSX.readFile(input);
const sheetName = 'Baza części';
const ws = wb.Sheets[sheetName] || wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

const headerRowIndex = rows.findIndex(r => String(r[0]).trim() === 'ID' && String(r[1]).includes('Indeks'));
if (headerRowIndex < 0) {
  console.error('Nie znaleziono wiersza nagłówków.');
  process.exit(1);
}

const headers = rows[headerRowIndex].map(h => String(h).trim());
const data = rows.slice(headerRowIndex + 1).filter(r => r.some(Boolean));
const idx = name => headers.indexOf(name);

const parts = data.map((r, n) => ({
  id: String(r[idx('Indeks części')] || `part-${n+1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  deviceIndex: String(r[idx('Model urządzenia')] || '').trim(),
  deviceName: String(r[idx('Model urządzenia')] || '').trim(),
  brand: String(r[idx('Marka / seria')] || '').trim(),
  category: '',
  partIndex: String(r[idx('Indeks części')] || '').trim(),
  partName: String(r[idx('Nazwa części PL')] || '').trim(),
  position: String(r[idx('Pozycja z rysunku')] || '—').trim(),
  drawingId: String(r[idx('Model urządzenia')] || '').trim().toLowerCase(),
  availability: 'Do sprawdzenia',
  notes: String(r[idx('Uwagi')] || '').trim()
})).filter(p => p.partIndex || p.deviceIndex || p.partName);

fs.writeFileSync(output, JSON.stringify(parts, null, 2), 'utf8');
console.log(`Zapisano ${parts.length} pozycji do ${output}`);
