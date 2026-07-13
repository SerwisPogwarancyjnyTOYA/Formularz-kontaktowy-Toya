import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const ignoredDirs=new Set(['.git','node_modules','private-workbench']);
const ignoredNames=new Set(['.DS_Store','Icon','Icon?']);
const blocked=[/\.env(?:\.|$)/i,/\.(?:pem|key|p12|pfx)$/i,/\.(?:xlsm?|xlsx|docx?|pptx?|msg|eml)$/i,/\.zip$/i,/\.z\d\d$/i,/~\$/,/~WRL/i,/\.tmp$/i,/stan na /i,/wydanie części/i,/kosztorys/i,/Baza_czesci/i];
const files=[]; const forbidden=[];
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){if(ignoredDirs.has(ent.name)||ignoredNames.has(ent.name))continue;const full=path.join(dir,ent.name);const rel=path.relative(root,full).split(path.sep).join('/');if(rel==='repository-manifest.json')continue;if(blocked.some(rx=>rx.test(ent.name)))forbidden.push(rel);if(ent.isDirectory())walk(full);else{const buf=fs.readFileSync(full);files.push({path:rel,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')});}}}
walk(root);
if(forbidden.length){console.error('Manifest build blocked by private/source files:\n'+forbidden.join('\n'));process.exit(1);}
files.sort((a,b)=>a.path.localeCompare(b.path));
const manifest={version:'20260712-v97-foundation-for-v05',generatedAt:new Date().toISOString(),selfExcluded:true,privateWorkbenchExcluded:true,fileCount:files.length,files};
fs.writeFileSync(path.join(root,'repository-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`repository-manifest.json written: ${files.length} files`);
