import fs from 'node:fs';
import crypto from 'node:crypto';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
const norm = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const arr = value => Array.isArray(value) ? value : (Array.isArray(value?.items) ? value.items : []);

const base = readJson('data/drive-drawings-map.generated-v97.json');
const patch = readJson('data/drive-drawings-patch-v98.json');
const release = readJson('RELEASE.json');
const audit = readJson('data/publication-consistency-audit-v98.json');

const extractModels = row => {
  const explicit = []
    .concat(arr(row.deviceIndexes))
    .concat(arr(row.modelsInPdf))
    .concat(arr(row.models))
    .concat(arr(row.keys));
  if (row.deviceIndex) explicit.push(row.deviceIndex);
  if (row.model) explicit.push(row.model);
  const text = explicit.join(' ');
  const matches = text.match(/(?:YT|YG|DZ)[-_ ]?\d{4,7}/gi) || [];
  return [...new Set(matches.map(x => x.toUpperCase().replace(/_/g, '-').replace(/\s+/g, '')))];
};

const effective = new Map();
for (const row of [...arr(base), ...arr(patch)]) {
  const models = extractModels(row);
  for (const model of (models.length ? models : [row.deviceIndex || row.model || ''])) {
    const fileId = String(row.fileId || row.driveFileId || row.sourceFileId || '');
    effective.set(`${fileId}|${norm(model)}`, {...row, deviceIndex: model, model, normalizedModel: model});
  }
}

const required = ['YT-85525','YT-85528','YT-85532','YT-85533','YT-85537','YT-85545','YT-85570','YT-85580','YT-85590','YT-85591','YT-85592','YT-85600','YT-8277905','YT-8277915','YT-8277935'];
const rows = [...effective.values()];
const failures = [];

if (release.version !== '0.4.0.v98') failures.push(`release=${release.version}`);
if (arr(base).length !== 2174) failures.push(`base=${arr(base).length}`);
if (arr(patch).length !== 16) failures.push(`patch=${arr(patch).length}`);
if (rows.length !== 1430) failures.push(`effective=${rows.length}`);
if (audit.status !== 'PASS') failures.push(`audit=${audit.status}`);

for (const model of required) {
  const row = rows.find(x => norm(x.deviceIndex) === norm(model));
  if (!row) failures.push(`${model}: missing`);
  else {
    if (row.qualityGate !== 'TOYA24_FULL_MATCH') failures.push(`${model}: qualityGate`);
    if (!(Number(row.previewPage) > 0)) failures.push(`${model}: previewPage`);
    if (!/\/preview$/.test(String(row.previewUrl || ''))) failures.push(`${model}: previewUrl`);
  }
}

const alias = rows.find(x => norm(x.deviceIndex) === norm('YT-8281185'));
if (!alias || String(alias.fileId) !== '1xSEkF_PE4oqfw0TYhocqR4-rbYJNTtM4') failures.push('YT-8281185 alias');

const result = {
  status: failures.length ? 'FAIL' : 'PASS',
  version: release.version,
  baseRows: arr(base).length,
  patchRows: arr(patch).length,
  physicalRows: arr(base).length + 3,
  searchableModels: rows.length,
  verified: required.length,
  patchSha256: crypto.createHash('sha256').update(fs.readFileSync('data/drive-drawings-patch-v98.json')).digest('hex'),
  failures
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
