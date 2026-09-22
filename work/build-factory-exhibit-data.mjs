import fs from 'node:fs/promises';import {createRequire} from 'node:module';import crypto from 'node:crypto';
const require=createRequire('LOCAL_PATH_OMITTED'),sharp=require('sharp');
const out=new URL('../outputs/',import.meta.url),read=f=>fs.readFile(new URL(f,out),'utf8'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const catalog=JSON.parse(await read('parts-library/catalog.json')),parts=[];
for(const p of catalog.parts){const meta=JSON.parse(await read('parts-library/'+p.metadata)),geometryText=await read('parts-library/'+p.geometry);parts.push({id:p.id,name:p.name,purpose:p.purpose,material:meta.material,dimensions:meta.dimensions,interfaces:meta.interfaces,installation:meta.installation,status:meta.status,hashes:meta.hashes,geometrySHA256:hash(geometryText),sourceRevision:meta.revision,sourceGeometry:p.geometry,geometry:JSON.parse(geometryText)});}
const file=new URL('materials/generated/GT01-Ficus-Leaf-R1.png',out),b=await fs.readFile(file),{data,info}=await sharp(b).raw().toBuffer({resolveWithObject:true});
let minX=info.width,maxX=0,minY=info.height,maxY=0;
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=224){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
const rows=[];for(let i=0;i<=64;i++){const y=Math.round(maxY-(maxY-minY)*i/64);let lo=info.width,hi=0;for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>=224){lo=Math.min(lo,x);hi=Math.max(hi,x);}if(hi<lo)throw Error('Leaf tracing gap');rows.push({t:i/64,u0:lo/info.width,u1:hi/info.width,v:1-y/info.height});}
const leaf={source:'materials/generated/GT01-Ficus-Leaf-R1.png',sourceSHA256:hash(b),alphaThreshold:224,width:info.width,height:info.height,boundsPixels:{minX,maxX,minY,maxY},rows,bladeMM:{length:300,width:133,thickness:.35,petiole:55},truth:'ALPHA_TRACED_OUTLINE_WITH_AUTHORED_CAMBER_AND_SCALE'};
const exhibit={schema:'GT01-factory-exhibit/v1',siteId:'GT01-ATELIER',units:'mm',parts,leaf,scale:1,completeVehicle:false,assemblyComplete:false};
await fs.writeFile(new URL('source/factory-exhibit-data.json',out),JSON.stringify(exhibit));
await fs.writeFile(new URL('source/factory-leaf-outline.mjs',out),'export const FACTORY_LEAF='+JSON.stringify(leaf)+';\n');
console.log(JSON.stringify({parts:parts.length,geometryBytes:parts.reduce((n,p)=>n+JSON.stringify(p.geometry).length,0),leafRows:rows.length,bounds:leaf.boundsPixels}));
