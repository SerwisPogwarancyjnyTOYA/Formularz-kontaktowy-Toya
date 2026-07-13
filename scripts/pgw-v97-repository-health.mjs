import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const mode = process.argv.includes('--v05') ? 'v05' : process.argv.includes('--release') ? 'release' : process.argv.includes('--doctor') ? 'doctor' : 'health';
const rel = p => path.join(root,p);
const exists = p => fs.existsSync(rel(p));
const readJson = p => JSON.parse(fs.readFileSync(rel(p),'utf8'));
const sha256 = p => crypto.createHash('sha256').update(fs.readFileSync(rel(p))).digest('hex');
const problems=[]; const warnings=[]; const ok=[]; const recommendations=[];
const required=[
  'package.json','config.js','RELEASE.json','README.md','CHANGELOG.md','repository-manifest.json',
  'admin.html','healthcheck.html','smoke-test.html',
  'data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.generated-v97.json',
  'data/publication-report-v97.json','data/publication-consistency-audit-v97.json','data/pdf-rewrite-queue-v97.json',
  'data/release-readiness-v97.json','data/catalog-readiness-v97.json','data/release-info.json','data/release-checks.json',
  'docs/DATA_PRIVACY_AND_PUBLICATION_V97.md','docs/V97_TO_V05_MIGRATION.md','reports/source-coverage-v97.json',
  'scripts/pgw-repo-selfcheck.mjs','scripts/pgw-v97-repository-health.mjs','scripts/pgw-v97-build-manifest.mjs'
];
for (const f of required) (exists(f)?ok:problems).push(`${exists(f)?'exists':'missing'}: ${f}`);

let pkg,release,info,checks,map,queue,readiness,catalog,devices,drawings,parts,manifest;
try {
  pkg=readJson('package.json'); release=readJson('RELEASE.json'); info=readJson('data/release-info.json'); checks=readJson('data/release-checks.json');
  map=readJson('data/drive-drawings-map.generated-v97.json'); queue=readJson('data/pdf-rewrite-queue-v97.json'); readiness=readJson('data/release-readiness-v97.json'); catalog=readJson('data/catalog-readiness-v97.json');
  devices=readJson('data/devices.json'); drawings=readJson('data/drawings.json'); parts=readJson('data/parts.json'); manifest=readJson('repository-manifest.json');
} catch(e) { problems.push(`critical JSON parse failed: ${e.message}`); }

if (pkg && release && info && checks) {
  const normalized=[pkg.version,release.version,info.version,checks.version].map(v=>String(v).replace('-v97','.v97'));
  normalized.every(v=>v==='0.4.0.v97') ? ok.push('release metadata points to v97') : problems.push(`version mismatch: ${normalized.join(' | ')}`);
  release.publicMap==='data/drive-drawings-map.generated-v97.json' ? ok.push('canonical public map is v97') : problems.push(`unexpected publicMap: ${release.publicMap}`);
  release.releaseContract?.publicDrawingCatalog ? ok.push('release contract separates drawing and full-documentation readiness') : problems.push('release contract missing');
}

const cfg=exists('config.js')?fs.readFileSync(rel('config.js'),'utf8'):'';
const driveLine=cfg.match(/driveMap:\s*\[(.*?)\]/s)?.[1]||'';
if (!driveLine.includes('drive-drawings-map.generated-v97.json')) problems.push('config.js does not use v97 map');
if (/generated-v(?:84|95|96)|drive-drawings-map\.(?:full|converted)/.test(driveLine)) problems.push('legacy/fallback public driveMap detected');

if (map) {
  const rows=Array.isArray(map.items)?map.items:[];
  if (map.count!==rows.length) problems.push(`map count mismatch: ${map.count} vs ${rows.length}`);
  if (rows.length<2177) problems.push(`map row count suspicious: ${rows.length}`);
  const publicRows=rows.filter(r=>r.publicationStatus==='PUBLIC_READY');
  const modelCounts=new Map(); const missingPreview=[]; const suspicious=[];
  for (const r of publicRows) {
    const m=String(r.model||''); modelCounts.set(m,(modelCounts.get(m)||0)+1);
    if (!String(r.previewUrl||'').endsWith('/preview')) missingPreview.push(m);
    if (/roboc|converted|scalone_do|do_polaczenia|material roboczy|~wrl|\.tmp/i.test([r.fileName,r.title,r.path].join(' '))) suspicious.push(m);
  }
  const duplicates=[...modelCounts].filter(([,n])=>n>1).map(([m])=>m);
  if (duplicates.length) problems.push(`exact public model duplicates: ${duplicates.join(', ')}`); else ok.push('no exact public model duplicates');
  if (missingPreview.length) problems.push(`missing preview links: ${missingPreview.length}`); else ok.push('all public preview links use /preview');
  if (suspicious.length) problems.push(`public source-name signals: ${suspicious.join(', ')}`); else ok.push('no robocze/source signals in public map');
  const recovered={'YT-8277905':'1GHHmBftW1jSgxZF6OVydFL3R0yS5YpRg','YT-8277915':'1sfYXPkWRa0bmXGfgydtgANIH2y6iippL','YT-8277935':'1AEoY9ge5DH5Fdc5AeUbxiVpUqia8bRRN'};
  for (const [model,id] of Object.entries(recovered)) rows.some(r=>r.model===model&&r.fileId===id&&r.publicationStatus==='PUBLIC_READY') ? ok.push(`recovered model verified: ${model}`) : problems.push(`recovered model missing/wrong: ${model}`);
}

if (devices && drawings && parts && catalog) {
  const drawIds=new Set(drawings.map(x=>x.id)); const partIds=new Set(parts.map(x=>x.id)); const deviceIds=new Set(devices.map(x=>x.deviceIndex));
  const missingDraw=[]; const missingPart=[]; const flag=[];
  for (const d of devices) {
    for (const id of d.drawings||[]) if (!drawIds.has(id)) missingDraw.push(`${d.deviceIndex}:${id}`);
    for (const id of d.parts||[]) if (!partIds.has(id)) missingPart.push(`${d.deviceIndex}:${id}`);
    if (Boolean(d.drawings?.length)!==Boolean(d.hasPartsPdf)) flag.push(`${d.deviceIndex}:hasPartsPdf`);
    if (Boolean(d.parts?.length)!==Boolean(d.hasPartsList)) flag.push(`${d.deviceIndex}:hasPartsList`);
  }
  const orphanDraw=drawings.filter(x=>!deviceIds.has(x.deviceIndex)); const orphanPart=parts.filter(x=>!deviceIds.has(x.deviceIndex));
  if (missingDraw.length||missingPart.length||orphanDraw.length||orphanPart.length) problems.push(`referential integrity failed: missingDraw=${missingDraw.length}, missingPart=${missingPart.length}, orphanDraw=${orphanDraw.length}, orphanPart=${orphanPart.length}`); else ok.push('device/drawing/parts references are consistent');
  const expected=catalog.acknowledgedAnomalies?.flagInconsistencies?.length??-1;
  if (flag.length!==expected) problems.push(`flag anomaly drift: actual=${flag.length}, acknowledged=${expected}`); else if (flag.length) warnings.push(`acknowledged legacy flag inconsistencies: ${flag.length}`); else ok.push('device flags match actual drawing/parts references');
  const actualMapped=devices.filter(d=>Array.isArray(d.parts)&&d.parts.length>0).length;
  if (actualMapped!==catalog.deviceCatalog?.devicesWithMappedParts) problems.push(`mapped-parts count drift: actual=${actualMapped}, report=${catalog.deviceCatalog?.devicesWithMappedParts}`); else ok.push(`actual mapped-parts devices confirmed: ${actualMapped}/${devices.length}`);
}

if (queue?.items?.length) warnings.push(`manual data queue: ${queue.items.map(x=>x.model).join(', ')}`);

const privateNamePatterns=[/\.env(?:\.|$)/i,/\.(?:pem|key|p12|pfx)$/i,/\.(?:xlsm?|xlsx|docx?|pptx?|msg|eml)$/i,/\.z\d\d$/i,/\.zip$/i,/~\$/,/~WRL/i,/\.tmp$/i,/stan na /i,/wydanie części/i,/kosztorys/i,/Baza_czesci/i];
const secretPatterns=[/AKIA[0-9A-Z]{16}/,/ghp_[A-Za-z0-9]{20,}/,/github_pat_[A-Za-z0-9_]{20,}/,/AIza[0-9A-Za-z_-]{30,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/client_secret\s*[:=]/i,/password\s*[:=]\s*['\"][^'\"]+/i];
const privateCandidates=[]; const secretHits=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules','private-workbench'].includes(ent.name))continue;const full=path.join(dir,ent.name);const r=path.relative(root,full);if(privateNamePatterns.some(rx=>rx.test(ent.name)))privateCandidates.push(r);if(ent.isDirectory())walk(full);else if(/\.(?:js|mjs|json|md|html|css|yml|yaml|txt)$/i.test(ent.name)&&fs.statSync(full).size<2_000_000){const text=fs.readFileSync(full,'utf8');for(const rx of secretPatterns)if(rx.test(text))secretHits.push(`${r}:${rx}`);}}}
walk(root);
if (secretHits.length) problems.push(`possible secrets: ${secretHits.join(', ')}`); else ok.push('no obvious secrets in public text files');
if (privateCandidates.length) problems.push(`private/source files present in tracked tree: ${privateCandidates.join(', ')}`); else ok.push('no raw Office/archive/private candidates in public tree');

if (manifest) {
  if (manifest.version!=='20260712-v97-foundation-for-v05') problems.push(`manifest version mismatch: ${manifest.version}`); else ok.push('repository manifest version is v97');
  if (!manifest.selfExcluded) problems.push('repository manifest must exclude itself');
  const critical=['package.json','config.js','RELEASE.json','README.md','CHANGELOG.md','admin.html','healthcheck.html','smoke-test.html','data/drive-drawings-map.generated-v97.json','scripts/pgw-v97-repository-health.mjs'];
  const byPath=new Map((manifest.files||[]).map(x=>[x.path,x]));
  for (const file of critical) {
    const entry=byPath.get(file);
    if (!entry) problems.push(`manifest missing critical file: ${file}`);
    else if (exists(file) && entry.sha256!==sha256(file)) problems.push(`manifest hash mismatch: ${file}`);
  }
  if (!problems.some(x=>x.startsWith('manifest '))) ok.push('critical manifest hashes match');
}

recommendations.push('Run npm run build-manifest after the final synchronized file set is stable.');
if (queue?.items?.length) recommendations.push('Close YT-85271 parts mapping by validating all 69 DOCX positions against the official PDF.');
const anomalies=catalog?.acknowledgedAnomalies?.flagInconsistencies?.length||0;
if (anomalies) recommendations.push(`Repair ${anomalies} legacy hasPartsPdf/hasPartsList flag inconsistencies in devices.json.`);
const aliases=catalog?.drawingPublication?.canonicalFileNameAliasGroups||0;
if (aliases) recommendations.push(`Move ${aliases} canonical filename alias groups into a single model-relationship registry before 0.5.`);
const full=catalog?.deviceCatalog?.fullDocumentationCoveragePercent??0;
if (full<95) recommendations.push(`Increase verified SAP/PL/EN parts-reference coverage from ${full}% to at least 95% for 0.5.`);

if (mode==='v05' && full<95) problems.push(`v0.5 full documentation gate not met: ${full}% < 95%`);
const result={mode,version:'0.4.0.v97',status:problems.length?'FAIL':warnings.length?'PASS_WITH_KNOWN_DEBT':'PASS',ok,warnings,problems,...(mode==='doctor'?{recommendations}:{})};
console.log(JSON.stringify(result,null,2));
if ((mode==='release'||mode==='v05')&&problems.length) process.exit(1);
