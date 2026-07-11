import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
<<<<<<< HEAD
const mustExist = ['index.html','app.css','config.js','app.js','healthcheck.html','admin.html','smoke-test.html','data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.full.json','data/coverage-audit-v76.json','data/pdf-quality-audit-v76.json','data/search-normalization-audit-v77.json','data/drive-drawings-map.generated-v78.json','data/drive-catalog-policy-v78.json','scripts/pgw-v78-drive-first-catalog-builder.mjs','assets/logos/yato-wordmark-clean.png'];
=======
const mustExist = ['index.html','app.css','config.js','app.js','healthcheck.html','admin.html','smoke-test.html','data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.full.json','data/coverage-audit-v76.json','data/pdf-quality-audit-v76.json','assets/logos/yato-wordmark-clean.png'];
>>>>>>> 6e274248c413b706ad423ea78af3ec7bffc69800
const errors = [];
for (const rel of mustExist) { if (!fs.existsSync(path.join(root, rel))) errors.push(`missing: ${rel}`); }
for (const rel of fs.readdirSync(path.join(root, 'data')).filter(x => x.endsWith('.json')).map(x => 'data/' + x)) { try { JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (e) { errors.push(`bad json: ${rel} ${e.message}`); } }
const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
<<<<<<< HEAD
if (!config.includes('20260711-v78-drive-first-catalog-builder')) errors.push('config.js version mismatch');
=======
if (!config.includes('20260711-v76-coverage-pdf-quality')) errors.push('config.js version mismatch');
>>>>>>> 6e274248c413b706ad423ea78af3ec7bffc69800
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!app.includes('buildSmokeTest')) errors.push('app.js smoke test helpers missing');
if (!app.includes('expandDeviceSearchToken')) errors.push('app.js smart model search helpers missing');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
<<<<<<< HEAD
console.log('PGW selfcheck OK — 20260711-v78-drive-first-catalog-builder');
=======
console.log('PGW selfcheck OK — 20260711-v76-coverage-pdf-quality');
>>>>>>> 6e274248c413b706ad423ea78af3ec7bffc69800
