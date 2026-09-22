import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root='outputs/parts-library',read=f=>fs.readFile(f,'utf8'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const catalog=JSON.parse(await read(root+'/catalog.json'));
const referenceMap=new Map();
for(const c of catalog.parts){const p=JSON.parse(await read(root+'/'+c.metadata));for(const r of p.references)referenceMap.set(path.posix.basename(r.file),'parts/'+p.id+'/'+r.file);}
for(const r of catalog.commonReferences)referenceMap.set(path.posix.basename(r.file),r.file);
const originals={'assembly.html':'outputs/GT01-handle-assembly.html','quality.html':'outputs/GT01-handle-quality.html','production-guide.md':'outputs/GT01-D11-production-and-quality.md'},bindings={};
for(const [dest,original]of Object.entries(originals)){
 const bytes=await fs.readFile(original);bindings[original]=sha(bytes);let s=bytes.toString('utf8');
 // The native module is embedded unchanged. Rewrite only the consumer's links.
 s=s.replaceAll('GT01-handle-assembly.html','assembly.html').replaceAll('GT01-handle-quality.html','quality.html').replaceAll('GT01-atelier.html','index.html').replaceAll('整車工坊','零件庫').replaceAll('回工坊','回零件庫').replaceAll('reference-library.html','index.html');
 if(dest==='assembly.html'){
  const viewer=await read('outputs/source/handle-assembly-viewer.mjs');
  // Keep runtime filenames; local aliases are precise copies with source hashes.
  // A self-contained reader can then use exactly the same reference selection code.
  for(const [name,relative]of referenceMap){const target=root+'/references/'+name;if(relative!=='references/'+name)await fs.copyFile(root+'/'+relative,target);}
  for(const [name]of viewer.matchAll(/D11[-\w]+\.png/g)){if(!referenceMap.has(name)){await fs.copyFile('outputs/references/'+name,root+'/references/'+name);referenceMap.set(name,'references/'+name);}}
 }
 s=s.replaceAll('href="quality/','href="evidence/').replaceAll('href="source/','href="native/source/').replaceAll("href=\"source/'+r.file", "href=\"native/source/'+r.file");
 if(dest==='production-guide.md')s=s.replaceAll('](quality/','](evidence/').replaceAll('](source/','](native/source/');
 await fs.writeFile(root+'/'+dest,s);
}
const correction={id:'LIB-Q01',title:'螺帽防轉座的描述必須由實體支持',before:'先使六角外形對準宿主防轉袋。',after:'現有固定夾體沒有防轉扣座；螺帽抵住背面承壓面，旋緊時需工具扶持六角外形。',sourceEvidence:{file:'outputs/source/clamp-assembly-viewer.mjs',search:'此處尚未設計防轉扣座，旋緊時需要扶持螺帽。'},cause:'零件功能被誤寫成已存在的宿主結構；網格封閉檢查不能發現這種用途與實體不一致。',changedConsumer:'work/build-parts-library.mjs → part.json / PART.md / assembly.json / index.html',rule:'既有接面與待設計支座分開記錄；修改可重建來源，再重新輸出及讀回。',scope:'Metadata corrected; no geometry modified.'};
await fs.writeFile(root+'/evidence/metadata-correction.json',JSON.stringify(correction,null,2));
await fs.writeFile(root+'/evidence/reader-bindings.json',JSON.stringify({bindings,readers:['assembly.html','quality.html','production-guide.md'],referenceAliases:[...referenceMap.keys()],scope:'Self-contained readers share the same source-embedded geometry and path implementation; only local links relabeled. Runtime interaction checked separately.'},null,2));
console.log('Portable native assembly and annotated quality readers included.');
