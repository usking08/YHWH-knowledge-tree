import fs from 'node:fs/promises';import crypto from 'node:crypto';
import * as T from '../outputs/source/three.mjs';import {buildGT01Dashboard} from '../outputs/source/dashboard.mjs';
const {root,parts,definition}=buildGT01Dashboard(T),revision=definition.revision.toLowerCase().replace('dash-','');
const box=new T.Box3().setFromObject(root),missing=[],nonFinite=[],ids=new Set();let triangles=0;
for(const m of parts){ids.add(m.userData.id);for(const k of ['id','referencePart','subPart','purpose','material','physicalBoundary','reference','shapeSource','receiving','orientation'])if(!m.userData[k])missing.push([m.name,k]);for(const v of m.geometry.attributes.position.array)if(!Number.isFinite(v))nonFinite.push(m.userData.id);triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;}
for(const d of Object.values(definition.partDefinitions))try{await fs.access(new URL('../outputs/'+d.reference,import.meta.url));}catch{missing.push(['reference file',d.reference]);}
const screens=[];
for(const s of definition.screenKeepouts){const c=new T.Vector3(...s.center),r=new T.Vector3(...s.size).multiplyScalar(.5),b=new T.Box3(c.clone().sub(r),c.clone().add(r)),hits=[];
  for(const m of parts){const p=m.geometry.attributes.position,idx=m.geometry.index;if(!new T.Box3().setFromObject(m).intersectsBox(b))continue;let count=0;
    for(let i=0;i<(idx?.count||p.count);i+=3){const a=idx?idx.getX(i):i,bb=idx?idx.getX(i+1):i+1,cc=idx?idx.getX(i+2):i+2;const triangle=new T.Triangle(new T.Vector3().fromBufferAttribute(p,a),new T.Vector3().fromBufferAttribute(p,bb),new T.Vector3().fromBufferAttribute(p,cc));if(b.intersectsTriangle(triangle))count++;}
    if(count)hits.push({id:m.userData.id,name:m.name,triangles:count});}
  screens.push({...s,hits});
}
const ray=new T.Raycaster();const ventPorts=[];
for(const s of definition.vents){ray.set(new T.Vector3(-620,s.backY,s.backZ),new T.Vector3(1,0,0));ray.far=24;
  ventPorts.push({id:s.id,probe:[-620,s.backY,s.backZ],direction:[1,0,0],far:24,hits:ray.intersectObjects(parts,false).map(h=>({id:h.object.userData.id,name:h.object.name,distance:h.distance}))});}
const ductPaths=[];for(const v of definition.vents){const duct=parts.find(p=>p.userData.subPart==='I06-P02'&&p.userData.ventId===v.id);duct.material.side=T.DoubleSide;const start=new T.Vector3(duct.geometry.boundingBox.max.x+12,v.y,v.z),end=new T.Vector3(-620,v.backY,v.backZ);ray.set(start,end.clone().sub(start).normalize());ray.far=start.distanceTo(end);ductPaths.push({ventId:v.id,start:start.toArray(),end:end.toArray(),doubleSide:true,hits:ray.intersectObject(duct,false).map(h=>({distance:h.distance,point:h.point.toArray()}))});}
const layerOrder=[];for(const [y,z] of [[-600,640],[-430,630],[-220,640],[0,627],[350,626],[620,635]]){const intervals=[];for(const subPart of ['I01-P04','I01-P05','I01-P06','I01-P07','I01-P08']){const mesh=parts.find(p=>p.userData.subPart===subPart);mesh.material.side=T.DoubleSide;ray.set(new T.Vector3(-250,y,z),new T.Vector3(-1,0,0));ray.far=350;const hits=ray.intersectObject(mesh,false).map(h=>h.point.x);if(hits.length)intervals.push({subPart,min:Math.min(...hits),max:Math.max(...hits)});}const gaps=intervals.slice(1).map((v,i)=>({from:intervals[i].subPart,to:v.subPart,gap:v.min-intervals[i].max}));layerOrder.push({y,z,intervals,gaps,pass:intervals.length===5&&gaps.every(g=>g.gap>=-.02)});}
const source=await fs.readFile(new URL('../outputs/source/dashboard.mjs',import.meta.url));
const report={schema:'gt01.dashboard-native-readback/v1',revision:definition.revision,sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),
  bounds:{min:box.min.toArray(),max:box.max.toArray(),size:box.getSize(new T.Vector3()).toArray()},meshes:parts.length,triangles,uniqueIds:ids.size===parts.length,missing,nonFinite,screens,ventPorts,ductPaths,layerOrder,
  parts:parts.map(p=>({name:p.name,...p.userData})),definition};
report.checksPass=!nonFinite.length&&!missing.length&&ids.size===parts.length&&screens.every(s=>!s.hits.length)&&ventPorts.every(v=>!v.hits.length)&&ductPaths.every(v=>!v.hits.length)&&layerOrder.every(v=>v.pass)&&box.min.x>=-630.1&&box.max.x<=-291.9&&box.min.y>=-699.1&&box.max.y<=699.1&&box.min.z>=593.9&&box.max.z<=763.1;
await fs.writeFile(new URL(`../outputs/quality/dashboard-native-${revision}.json`,import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({checksPass:report.checksPass,bounds:report.bounds,meshes:parts.length,triangles,screens:screens.map(s=>({id:s.id,hits:s.hits})),ventPorts}));if(!report.checksPass)process.exitCode=1;
