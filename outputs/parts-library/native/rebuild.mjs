import fs from 'node:fs/promises';
import {buildSelected,triangles,inspect,triangleHash,normalHash,objText,sha} from './geometry-core.mjs';
const root=new URL('../',import.meta.url),manifest=JSON.parse(await fs.readFile(new URL('source-bindings.json',import.meta.url),'utf8'));
for(const [name,digest]of Object.entries(manifest.sources))if(sha(await fs.readFile(new URL('source/'+name,import.meta.url)))!==digest)throw Error('Source changed: '+name+'; intentionally revise source bindings before adopting altered geometry.');
const parts=await buildSelected(),results=[];
await fs.mkdir(new URL('rebuilt/',root),{recursive:true});
for(const p of parts){const expected=JSON.parse(await fs.readFile(new URL('parts/'+p.id+'/part.json',root),'utf8')),t=triangles(p.surfaces),record=inspect(t),same=triangleHash(t)===expected.hashes.positionTriangleSHA256&&normalHash(t)===expected.hashes.normalTriangleSHA256;if(!same)throw Error('Rebuilt geometry differs '+p.id);await fs.writeFile(new URL('rebuilt/'+p.id+'.obj',root),objText(p.id,t).replace('mtllib part.mtl','mtllib ../parts/'+p.id+'/part.mtl'));results.push({id:p.id,pass:same,triangles:record.triangles,boundsMm:record.boundsMm,positionTriangleSHA256:record.positionTriangleSHA256});}
const proof={pass:true,partTypeCount:parts.length,allNativeSourcesLocal:true,networkUsed:false,results,scope:'Rebuild and compare original geometry. This does not certify assembly, material or performance.'};
await fs.writeFile(new URL('rebuilt/rebuild-readback.json',root),JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify({pass:true,partTypeCount:parts.length,output:'rebuilt/rebuild-readback.json'}));
