import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
await import('./build-factory-exhibit-data.mjs');
const root=new URL('../outputs/',import.meta.url),read=f=>fs.readFile(new URL(f,root),'utf8');
const [page,three,rim,model,vehicle,viewer]=await Promise.all(['source/atelier-page.html','source/three.mjs','source/rim-preserved.js','source/model.mjs','source/vehicle.mjs','source/atelier-viewer.mjs'].map(read));
let factory='';try{factory=(await read('source/factory.mjs')).replace(/^import .+;\r?\n/gm,'');}catch(e){if(e.code!=='ENOENT')throw e;}
const referenceIndex=await read('source/vehicle-reference-index.json');
const warehousePayload=process.argv.includes('--author-factory')?'':(await fs.readFile(new URL('parts-library/factory/runtime.json.gz',root))).toString('base64');
const surfaceSource=await read('source/workshop-materials.mjs');
const workbenchSource=await read('source/factory-workbench.mjs');
const knowledgeSource=await read('source/factory-knowledge.mjs');
const warehouseSource=await read('source/factory-warehouse.mjs');
const generated=JSON.parse(await read('materials/generated/manifest.json')),materialAssets={};
for(const a of generated.filter(a=>a.tileMM)){const b=await fs.readFile(new URL('materials/generated/'+a.id+'.png',root));materialAssets[a.id]={source:{id:a.id,truth:a.truth,generator:a.generator,tileMM:a.tileMM,scaleTruth:a.scaleTruth,path:'materials/generated/'+a.id+'.png'},images:{Color:'data:image/png;base64,'+b.toString('base64')}};}
const leafImage=await fs.readFile(new URL('materials/generated/GT01-Ficus-Leaf-R1.png',root));materialAssets['GT01-Ficus-Leaf-R1']={source:{id:'GT01-Ficus-Leaf-R1',truth:'AI_GENERATED_ALPHA_TRACED'},images:{Color:'data:image/png;base64,'+leafImage.toString('base64')}};
const botanical=(await read('source/factory-botanical.mjs')).replace(/^import .+;\r?\n/gm,''),leafOutline=await read('source/factory-leaf-outline.mjs'),exhibits=await read('source/factory-exhibits.mjs'),exhibitData=gzipSync(await read('source/factory-exhibit-data.json')).toString('base64');
const code=`import * as T from 'data:text/javascript;base64,${Buffer.from(three).toString('base64')}';\nconst VEHICLE_REFERENCES=${referenceIndex};\nconst WORKSHOP_ASSETS=${JSON.stringify(materialAssets)};\nconst EXHIBIT_PAYLOAD='${exhibitData}';\nconst WAREHOUSE_PAYLOAD='${warehousePayload}';\n${surfaceSource}\n${workbenchSource}\n${knowledgeSource}\n${warehouseSource}\n${leafOutline}\n${botanical}\n${exhibits}\n${model.replace("import * as T from './three.mjs';",'')}\n${vehicle}\n${factory}\n${viewer}`;
const html=page.replace('<!--ATELIER-->',`<script>${rim}</script><script type="module">${code}</script>`);
const release=process.argv.includes('--release');
if(release){const {inspectVehicleRelease}=await import('./quality/vehicle-release.mjs');const result=await inspectVehicleRelease({candidateSHA256:createHash('sha256').update(html).digest('hex')});if(!result.pass){console.error(JSON.stringify({release:'REFUSED',issues:result.issues.length,first:result.issues.slice(0,4)}));process.exit(2);}}
const target=release?'GT01-atelier.release.html':'GT01-atelier.html';await fs.writeFile(new URL(target,root),html);
console.log(JSON.stringify({artifact:'outputs/'+target,factoryIncluded:Boolean(factory),status:release?'REVIEWED_ARTIFACT_RELEASED':'WORK_IN_PROGRESS_NOT_RELEASED'}));
