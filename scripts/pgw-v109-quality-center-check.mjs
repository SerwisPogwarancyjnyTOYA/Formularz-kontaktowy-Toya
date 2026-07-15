import fs from 'node:fs';
const file='data/quality-center-v109.json', html='quality-center.html', errors=[];
const j=JSON.parse(fs.readFileSync(file,'utf8')), norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
if(j.schema!=='pgw-quality-center-v109') errors.push('wrong schema');
if(!Array.isArray(j.items)||!j.items.length) errors.push('empty items');
const seen=new Set();
for(const x of j.items||[]){
 const n=norm(x.model); if(!n) errors.push('missing model'); if(seen.has(n)) errors.push(`duplicate model ${x.model}`); seen.add(n);
 if(!['READY','REBUILD','MANUAL_REQUIRED','ARCHIVE_ONLY'].includes(x.status)) errors.push(`bad status ${x.model}`);
 if(x.status==='READY'&&(!x.hasPhoto||!x.hasDrawing||!x.hasParts)) errors.push(`READY incomplete ${x.model}`);
 if(x.status==='REBUILD'&&!(x.blockers||[]).length) errors.push(`REBUILD without blocker ${x.model}`);
 if(x.status!=='READY'&&!x.requiredAction) errors.push(`missing action ${x.model}`);
}
const s=j.summary||{}; for(const k of ['models','ready','rebuild','manualRequired','archiveOnly','fastWins']) if(typeof s[k]!=='number') errors.push(`summary ${k}`);
if(s.models!==(j.items||[]).length) errors.push('summary model count mismatch');
const page=fs.readFileSync(html,'utf8'); for(const token of ['quality-center-v109.json','Release gate','Karta robocza','Eksport CSV']) if(!page.includes(token)) errors.push(`html missing ${token}`);
if(errors.length){console.error('FAIL');for(const e of errors)console.error('-',e);process.exit(1)}
console.log('PASS'); console.log(`models=${s.models} ready=${s.ready} rebuild=${s.rebuild} manual=${s.manualRequired} archive=${s.archiveOnly} fastWins=${s.fastWins}`);
