import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import * as T from '../outputs/source/three.mjs';
import {buildGT01Steering} from '../outputs/source/steering-wheel.mjs';
const {root,parts,definition}=buildGT01Steering(T);
const finite=[],badNormals=[],missing=[],ids=new Set();let triangles=0;
for(const m of parts){
  for(const x of m.geometry.attributes.position.array)if(!Number.isFinite(x))finite.push(m.userData.id);
  for(const x of m.geometry.attributes.normal.array)if(!Number.isFinite(x))badNormals.push(m.userData.id);
  for(const key of ['id','subPart','referencePart','system','reference','authorDimensions','purpose'])if(!m.userData[key])missing.push([m.name,key]);
  if(ids.has(m.userData.id))throw Error('duplicate ID '+m.userData.id);ids.add(m.userData.id);
  triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;
}
const box=new T.Box3().setFromObject(root),dimensions=box.getSize(new T.Vector3()).toArray();
const ray=new T.Raycaster();
function throughHole(point,direction){ray.set(new T.Vector3(...point),new T.Vector3(...direction));return ray.intersectObjects(parts,false).map(h=>({id:h.object.userData.id,name:h.object.name,z:h.point.z}));}
const lowerSlotHits=throughHole([0,-102,90],[0,0,-1]);
const shaftVisibleBoreHits=throughHole([0,0,-80],[0,0,1]);
const slotGrid=[];for(const x of [-5,0,5])for(const y of [-82,-105,-124])slotGrid.push({x,y,hits:throughHole([x,y,90],[0,0,-1])});
const hub=parts.find(p=>p.userData.subPart==='I04-P10'),carrier=parts.find(p=>p.userData.subPart==='I04-P03');
const hubBox=new T.Box3().setFromObject(hub),carrierBox=new T.Box3().setFromObject(carrier);
const hubCarrierOverlap=Math.min(hubBox.max.z,carrierBox.max.z)-Math.max(hubBox.min.z,carrierBox.min.z);
const source=await fs.readFile(new URL('../outputs/source/steering-wheel.mjs',import.meta.url));
const record={schema:'gt01.steering-readback/v1',revision:definition.revision,reader:'local Three.js native module + mesh ray intersections',
  sourceSHA256:crypto.createHash('sha256').update(source).digest('hex'),
  definition,box:{min:box.min.toArray(),max:box.max.toArray(),dimensions},
  meshCount:parts.length,triangleCount:triangles,finitePositions:finite.length===0,finiteNormals:badNormals.length===0,
  uniqueIds:ids.size===parts.length,metadataMissing:missing,lowerSlot:{point:[0,-102,90],direction:[0,0,-1],hits:lowerSlotHits,open:lowerSlotHits.length===0},
  slotGrid,hubCarrier:{radialWitness:[20,0],hubSolidRadius:[12,26],carrierBoreRadius:12,hubZ:[hubBox.min.z,hubBox.max.z],carrierZ:[carrierBox.min.z,carrierBox.max.z],overlapMm:hubCarrierOverlap,note:'The annular hub extends into the cast carrier at the shared radius; authored visual interference, not a validated manufacturing joint.'},
  shaftBore:{point:[0,0,-80],direction:[0,0,1],hits:shaftVisibleBoreHits.slice(0,5),note:'Bore is open into unverified airbag envelope; cover legitimately terminates the centre ray.'},
  parts:parts.map(p=>({name:p.name,...p.userData,triangles:(p.geometry.index?.count||p.geometry.attributes.position.count)/3}))};
record.moduleChecksPass=record.finitePositions&&record.finiteNormals&&record.uniqueIds&&!missing.length&&dimensions[2]<=80&&Math.abs(dimensions[0]-340)<1&&Math.abs(dimensions[1]-340)<1&&record.lowerSlot.open&&slotGrid.every(p=>!p.hits.length)&&hubCarrierOverlap>0&&shaftVisibleBoreHits[0]?.id.startsWith('I04-P08');
await fs.writeFile(new URL('../outputs/quality/steering-native-readback-r5.json',import.meta.url),JSON.stringify(record,null,2));
console.log(JSON.stringify({moduleChecksPass:record.moduleChecksPass,dimensions,meshCount:parts.length,triangles,lowerSlot:record.lowerSlot,shaftFirstHit:shaftVisibleBoreHits[0]}));
if(!record.moduleChecksPass)process.exitCode=1;
