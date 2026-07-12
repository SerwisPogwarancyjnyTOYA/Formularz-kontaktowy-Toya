import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const mode = process.argv.includes('--release') ? 'release' : process.argv.includes('--doctor') ? 'doctor' : 'health';
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(root, rel));
const problems = [];
const warnings = [];
const ok = [];

const required = ['package.json','config.js','RELEASE.json','data/release-info.json','data/release-checks.json','data/drive-drawings-map.generated-v97.json','data/publication-report-v97.json','data/publication-consistency-audit-v97.json','data/pdf-rewrite-queue-v97.json','data/release-readiness-v97.json'];
for (const f of required) (exists(f) ? ok : problems).push(`${exists(f) ? 'exists' : 'missing'}: ${f}`);

try {
  const pkg = readJson('package.json');
  const release = readJson('RELEASE.json');
  const info = readJson('data/release-info.json');
  const checks = readJson('data/release-checks.json');
  const versions = [pkg.version, release.version, info.version, checks.version];
  if (versions.every(v => v === '0.4.0.v97' || v === '0.4.0-v97')) ok.push('release metadata points to v97');
  else problems.push(`version mismatch: ${versions.join(' | ')}`);
  if (release.publicMap === 'data/drive-drawings-map.generated-v97.json') ok.push('canonical public map is v97');
  else problems.push(`unexpected publicMap: ${release.publicMap}`);
} catch (e) { problems.push(`metadata parse failed: ${e.message}`); }

if (exists('data/pdf-rewrite-queue-v97.json')) {
  const queue = readJson('data/pdf-rewrite-queue-v97.json');
  if ((queue.items || []).length) warnings.push(`manual/rebuild queue: ${(queue.items || []).map(x => x.model).join(', ')}`);
}

const forbidden = ['.DS_Store','.env','node_modules','~WRL','.tmp'];
function walk(dir) {
  for (const ent of fs.readdirSync(dir,{withFileTypes:true})) {
    if (ent.name === '.git') continue;
    const full = path.join(dir,ent.name); const rel = path.relative(root,full);
    if (forbidden.some(x => ent.name.includes(x))) warnings.push(`candidate for exclusion: ${rel}`);
    if (ent.isDirectory()) walk(full);
  }
}
walk(root);

const result = {mode, version:'0.4.0.v97', status: problems.length ? 'FAIL' : warnings.length ? 'PASS_WITH_WARNINGS' : 'PASS', ok, warnings, problems};
console.log(JSON.stringify(result,null,2));
if (mode === 'release' && problems.length) process.exit(1);
