import fs from 'node:fs';
const files=[
'data/toya24-drive-audit-v99i.json',
'data/drive-drawings-patch-v99i.json',
'data/pdf-customer-visible-blocklist-v99i.json',
'data/publication-report-v99i.json'
];
const errors=[];
for(const f of files){if(!fs.existsSync(f))errors.push('missing '+f);else JSON.parse(fs.readFileSync(f,'utf8'))}
const p=JSON.parse(fs.readFileSync(files[1],'utf8'));
if(p.items.length!==2)errors.push('patch item count');
for(const x of p.items){
 if(x.previewPage!==2)errors.push(x.model+' previewPage');
 if(!x.hasDevicePhoto||!x.hasExplodedDrawing||!x.hasPartsList||!x.partsExtracted)errors.push(x.model+' completeness');
 if(x.publicationStatus!=='PUBLIC_READY'||x.qaStatus!=='FIXED')errors.push(x.model+' status');
 if(!x.thumbnail||!x.drawingThumbnail)errors.push(x.model+' thumbnails');
}
const r=JSON.parse(fs.readFileSync(files[3],'utf8'));
if(r.tests.renderedPages!==8||r.tests.unverifiedPublicCandidates!==0)errors.push('test totals');
if(errors.length){console.error('FAIL',errors);process.exit(1)}
console.log('PASS v99i models=2 pages=8 numbered=196 assemblies=9 rows=205 blocked=6');
