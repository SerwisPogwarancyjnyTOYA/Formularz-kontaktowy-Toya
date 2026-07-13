import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(); const errors=[];
const required=['index.html','app.css','config.js','app.js','healthcheck.html','admin.html','smoke-test.html','package.json','RELEASE.json','data/devices.json','data/drawings.json','data/parts.json','data/drive-drawings-map.generated-v97.json','data/catalog-readiness-v97.json','data/release-readiness-v97.json','scripts/pgw-v97-repository-health.mjs'];
for(const p of required) if(!fs.existsSync(path.join(root,p))) errors.push(`missing: ${p}`);
const dataDir=path.join(root,'data');
if(fs.existsSync(dataDir)) for(const name of fs.readdirSync(dataDir).filter(n=>n.endsWith('.json'))) try{JSON.parse(fs.readFileSync(path.join(dataDir,name),'utf8'));}catch(e){errors.push(`bad json: data/${name}: ${e.message}`);}
const cfg=fs.existsSync(path.join(root,'config.js'))?fs.readFileSync(path.join(root,'config.js'),'utf8'):'';
if(!cfg.includes('20260712-v97-foundation-for-v05')) errors.push('config.js version mismatch');
const driveLine=cfg.match(/driveMap:\s*\[(.*?)\]/s)?.[1]||'';
if(!driveLine.includes('generated-v97')) errors.push('v97 drive map missing from config');
if(/generated-v(?:84|95|96)|drive-drawings-map\.(?:full|converted)/.test(driveLine)) errors.push('legacy public driveMap fallback detected');
const app=fs.existsSync(path.join(root,'app.js'))?fs.readFileSync(path.join(root,'app.js'),'utf8'):'';
for(const fn of ['buildSmokeTest','expandDeviceSearchToken','isCustomerVisiblePdfV83']) if(!app.includes(fn)) errors.push(`app.js helper missing: ${fn}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);} console.log('PGW selfcheck OK - 0.4.0.v97 foundation for 0.5');
