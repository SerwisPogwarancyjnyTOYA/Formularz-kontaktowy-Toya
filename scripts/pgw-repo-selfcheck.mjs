import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
<<<<<<< HEAD
const mustExist = ['index.html','app.css','config.js','app.js','healthcheck.html','admin.html','smoke-test.html','data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.full.json','data/coverage-audit-v76.json','data/pdf-quality-audit-v76.json','data/search-normalization-audit-v77.json','data/drive-drawings-map.generated-v78.json','data/drive-catalog-policy-v78.json','data/drive-drawings-map.generated-v79.json','data/drive-catalog-audit-v79.json','data/drive-pdf-merge-queue-v79.json','data/drive-organizer-plan-v79.json','data/drive-drawings-map.generated-v80.json','data/drive-parts.generated-v80.json','data/drive-master-audit-v80.json','data/drive-merge-plan-v80.json','data/drive-organizer-actions-v80.json','scripts/pgw-v79-drive-catalog-builder.mjs','scripts/pgw-v79-drive-catalog-organizer.apps-script.gs','scripts/pgw-v80-drive-master-catalog.mjs','scripts/pgw-v80-drive-master-catalog.apps-script.gs','assets/logos/yato-wordmark-clean.png'];
=======
<<<<<<< HEAD
const mustExist = ['index.html','app.css','config.js','app.js','healthcheck.html','admin.html','smoke-test.html','data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.full.json','data/coverage-audit-v76.json','data/pdf-quality-audit-v76.json','data/search-normalization-audit-v77.json','data/drive-drawings-map.generated-v78.json','data/drive-catalog-policy-v78.json','data/drive-drawings-map.generated-v79.json','data/drive-catalog-audit-v79.json','data/drive-pdf-merge-queue-v79.json','data/drive-organizer-plan-v79.json','data/drive-drawings-map.generated-v80.json','data/drive-parts.generated-v80.json','data/drive-master-audit-v80.json','data/drive-merge-plan-v80.json','data/drive-organizer-actions-v80.json','scripts/pgw-v79-drive-catalog-builder.mjs','scripts/pgw-v79-drive-catalog-organizer.apps-script.gs','scripts/pgw-v80-drive-master-catalog.mjs','scripts/pgw-v80-drive-master-catalog.apps-script.gs','assets/logos/yato-wordmark-clean.png'];
=======
const mustExist = ['index.html','app.css','config.js','app.js','healthcheck.html','admin.html','smoke-test.html','data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.full.json','data/coverage-audit-v76.json','data/pdf-quality-audit-v76.json','data/search-normalization-audit-v77.json','data/drive-drawings-map.generated-v78.json','data/drive-catalog-policy-v78.json','data/drive-drawings-map.generated-v79.json','data/drive-catalog-audit-v79.json','data/drive-pdf-merge-queue-v79.json','data/drive-organizer-plan-v79.json','scripts/pgw-v79-drive-catalog-builder.mjs','scripts/pgw-v79-drive-catalog-organizer.apps-script.gs','assets/logos/yato-wordmark-clean.png'];
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
>>>>>>> 6a973abe1bbfb28580e175162f79557b811da734
const errors = [];
for (const rel of mustExist) { if (!fs.existsSync(path.join(root, rel))) errors.push(`missing: ${rel}`); }
for (const rel of fs.readdirSync(path.join(root, 'data')).filter(x => x.endsWith('.json')).map(x => 'data/' + x)) { try { JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); } catch (e) { errors.push(`bad json: ${rel} ${e.message}`); } }
const config = fs.readFileSync(path.join(root, 'config.js'), 'utf8');
<<<<<<< HEAD
if (!config.includes('20260711-v80-drive-master-catalog')) errors.push('config.js version mismatch');
=======
<<<<<<< HEAD
if (!config.includes('20260711-v80-drive-master-catalog')) errors.push('config.js version mismatch');
=======
if (!config.includes('20260711-v79-drive-catalog-and-pdf-organizer')) errors.push('config.js version mismatch');
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
>>>>>>> 6a973abe1bbfb28580e175162f79557b811da734
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!app.includes('buildSmokeTest')) errors.push('app.js smoke test helpers missing');
if (!app.includes('expandDeviceSearchToken')) errors.push('app.js smart model search helpers missing');
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
<<<<<<< HEAD
console.log('PGW selfcheck OK — 20260711-v80-drive-master-catalog');
=======
<<<<<<< HEAD
console.log('PGW selfcheck OK — 20260711-v80-drive-master-catalog');
=======
console.log('PGW selfcheck OK — 20260711-v79-drive-catalog-and-pdf-organizer');
>>>>>>> 430369623cb40f6169e1a404231d5cd39d752ab3
>>>>>>> 6a973abe1bbfb28580e175162f79557b811da734
