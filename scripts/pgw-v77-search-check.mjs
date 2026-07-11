import fs from 'node:fs';

const devices = JSON.parse(fs.readFileSync('data/devices.json', 'utf8'));

function compactSearchKey(value) {
  return String(value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

function expandDeviceSearchToken(token) {
  const compact = compactSearchKey(token);
  const out = new Set([compact]);
  const m = compact.match(/^([A-Z]{1,3})(\d{3,9}[A-Z]?)$/);
  if (m) {
    const prefix = m[1];
    const digits = m[2].replace(/[^0-9]/g, '');
    out.add(prefix + digits);
    if (digits.length > 5) {
      out.add(prefix + digits.slice(0, 5));
      out.add(prefix + digits.slice(0, 6));
      for (let i = 0; i < digits.length; i++) out.add(prefix + digits.slice(0, i) + digits.slice(i + 1));
    }
  }
  const numeric = compact.match(/^(\d{3,9})$/);
  if (numeric) {
    const digits = numeric[1];
    out.add(digits);
    if (digits.length > 5) {
      out.add(digits.slice(0, 5));
      out.add(digits.slice(0, 6));
      for (let i = 0; i < digits.length; i++) out.add(digits.slice(0, i) + digits.slice(i + 1));
    }
  }
  return [...out].filter(Boolean);
}

function suggestions(query) {
  const variants = expandDeviceSearchToken(query);
  return devices
    .map(d => ({ index: d.deviceIndex, key: compactSearchKey(d.deviceIndex) }))
    .filter(d => variants.includes(d.key) || variants.some(v => v.length >= 5 && (v.includes(d.key) || d.key.includes(v))))
    .map(d => d.index)
    .slice(0, 20);
}

const yt828113 = suggestions('yt-828113');
if (!yt828113.includes('YT-82813') && !yt828113.includes('YT-82811')) {
  console.error('Smart search failed for yt-828113:', yt828113);
  process.exit(1);
}
const yt82813 = suggestions('YT 82813');
if (!yt82813.includes('YT-82813')) {
  console.error('Smart search failed for YT 82813:', yt82813);
  process.exit(1);
}
console.log('PGW v77 search-check OK', {yt828113: yt828113.slice(0, 5), yt82813: yt82813.slice(0, 5)});
