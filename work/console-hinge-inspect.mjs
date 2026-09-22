import * as T from '../outputs/source/three.mjs';
import {buildGT01Console} from '../outputs/source/center-console.mjs';
import {completeGT01ConsoleHinges} from '../outputs/source/console-hinge-fixings.mjs';
import fs from 'node:fs/promises';import crypto from 'node:crypto';
const out=new URL('../outputs/quality/',import.meta.url),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const a=buildGT01Console(T),before=new Map(a.parts.map(p=>[p.userData.id,{geometry:sha(Buffer.from(p.geometry.attributes.position.array.buffer)),parent:p.parent.name,position:p.position.toArray(),box:new T.Box3().setFromObject(p)}]));
const baseFile=await fs.readFile(new URL('../outputs/source/center-console.mjs',import.meta.url));
const oldTop=a.parts.find(p=>p.userData.id==='I03-P05-01').clone(),oldLid=a.parts.find(p=>p.userData.id==='I03-P16-01').clone();oldLid.position.set(0,0,0);oldLid.updateMatrixWorld(true);
completeGT01ConsoleHinges(T,a);const part=id=>a.parts.find(p=>p.userData.id===id);a.root.updateMatrixWorld(true);
for(const p of [...a.parts,oldTop,oldLid]){p.material=p.material.clone();p.material.side=T.DoubleSide;}
const ray=new T.Raycaster();function hits(mesh,origin,dir,far=30){ray.set(new T.Vector3(...origin),new T.Vector3(...dir));ray.near=.00001;ray.far=far;return ray.intersectObject(mesh,false).map(h=>h.point.toArray()).filter((p,i,ls)=>!i||Math.abs(p.reduce((s,v,k)=>s+(v-ls[i-1][k])**2,0))>1e-8);}
const required=['id','subPart','referencePart','purpose','reference','receiving','orientation','authorDimensions','physicalBoundary','material','revision'],fresh=a.parts.filter(p=>p.userData.id.startsWith('I03-HF-')),bad=[];
for(const p of fresh)for(const k of required)if(p.userData[k]===undefined)bad.push(p.userData.id+':'+k);
const changed=[];for(const p of a.parts){const old=before.get(p.userData.id);if(old&&old.geometry!==sha(Buffer.from(p.geometry.attributes.position.array.buffer)))changed.push(p.userData.id);}
const holes=[];
for(const [x,y,leaf]of [[441,-52,1],[420,-62,2],[441,62,3],[420,52,4]]){const target=x===441?part('I03-P05-01'):part('I03-P16-01');holes.push({center:[x,y],leaf:'I03-P19-0'+leaf,leafAxialHits:hits(part('I03-P19-0'+leaf),[x,y,448],[0,0,1],4),blindAxialHits:hits(target,[x,y,x===441?450:449],[0,0,x===441?-1:1],12),receiverRadialSolid:hits(target,[x+1.8,y,x===441?450:449],[0,0,x===441?-1:1],12)});}
const contacts=[];for(const [side,y,fy]of [['L',-62,-52],['R',52,62]])for(const moving of [false,true]){const k=(moving?'MOVING-':'FIXED-')+side,c=[moving?420:441,moving?y:fy];const ids=[moving?'I03-P16-01':'I03-P05-01','I03-HF-F03-'+k,'I03-P19-0'+(side==='L'?(moving?2:1):(moving?4:3)),'I03-HF-F02-'+k,'I03-HF-F01-'+k];contacts.push({instance:k,radialProbe:2,segments:ids.map(id=>({id,hits:hits(part(id),[c[0]+2,c[1],440],[0,0,1],18)}))});}
const lid=part('I03-P16-01'),foam=part('I03-P17-01');const roof=[];
for(const y of [-62,52])for(let j=0;j<8;j++){const x=420+2.5*Math.cos(j*Math.PI/4),yy=y+2.5*Math.sin(j*Math.PI/4),top=hits(lid,[x,yy,456],[0,0,-1],6)[0],f=hits(foam,[x,yy,455.8],[0,0,1],30)[0];roof.push({x,y:yy,lidTop:top?.[2],foamBottom:f?.[2],gap:top&&f?f[2]-top[2]:null});}
const pins=[];for(const [i,y]of [[1,-57],[2,57]])pins.push({id:'I03-P20-0'+i,low:hits(part('I03-P20-0'+i),[430,y-14,452],[0,1,0],30),high:hits(part('I03-P20-0'+i),[430,y+15,452],[0,-1,0],30)});
// Triangle BVH. Narrow phase tests actual triangle edges; coplanar face contact is excluded.
function triangles(mesh){const g=mesh.geometry,at=g.attributes.position,ix=g.index,r=[];for(let j=0;j<(ix?.count||at.count);j+=3){const ps=[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(at,ix?ix.getX(j+k):j+k).applyMatrix4(mesh.matrixWorld));if(new T.Triangle(...ps).getArea()<1e-9)continue;const box=new T.Box3().setFromPoints(ps);r.push({ps,box,c:box.getCenter(new T.Vector3())});}return r;}
function tree(ts){const box=new T.Box3();for(const t of ts)box.union(t.box);if(ts.length<=14)return {box,ts};const sz=box.getSize(new T.Vector3()),axis=sz.x>=sz.y&&sz.x>=sz.z?'x':sz.y>=sz.z?'y':'z';ts.sort((a,b)=>a.c[axis]-b.c[axis]);const mid=ts.length>>1;return{box,l:tree(ts.slice(0,mid)),r:tree(ts.slice(mid))};}
function triCross(a,b){const na=new T.Triangle(...a).getNormal(new T.Vector3()),nb=new T.Triangle(...b).getNormal(new T.Vector3());if(Math.abs(na.dot(nb))>.999999&&Math.abs(na.dot(b[0].clone().sub(a[0])))<2e-4)return false;
 const segs=(v,t)=>{for(let j=0;j<3;j++){const d=v[(j+1)%3].clone().sub(v[j]),len=d.length();if(len<1e-6)continue;const ray=new T.Ray(v[j],d.multiplyScalar(1/len)),hit=ray.intersectTriangle(t[0],t[1],t[2],false,new T.Vector3());if(hit){const dist=hit.distanceTo(v[j]);if(dist>2e-4&&dist<len-2e-4){const bc=new T.Triangle(...t).getBarycoord(hit,new T.Vector3());if(bc.x>1e-6&&bc.y>1e-6&&bc.z>1e-6)return hit.toArray();}}}return false;};return segs(a,b)||segs(b,a);}
function intersect(ts,bvh,limit=12){const results=[];function visit(t,n){if(results.length>=limit||!n.box.intersectsBox(t.box))return;if(n.ts){for(const u of n.ts){if(!u.box.intersectsBox(t.box))continue;const p=triCross(t.ps,u.ps);if(p){results.push(p);if(results.length>=limit)return;}}}else{visit(t,n.l);visit(t,n.r);}}for(const t of ts){visit(t,bvh);if(results.length>=limit)break;}return results;}
const stationaryIds=['I03-P05-01','I03-P19-01','I03-P19-03','I03-P20-01','I03-P20-02',...fresh.filter(p=>p.userData.subPart.startsWith('I03-HF-S')).map(p=>p.userData.id)];
const targets=stationaryIds.map(id=>{const ts=triangles(part(id));return{id,box:new T.Box3().setFromObject(part(id)),tree:tree(ts)};});
const movingIds=['I03-P16-01','I03-P17-01','I03-P18-01','I03-P18-02','I03-P19-02','I03-P19-04',...fresh.filter(p=>p.userData.motionGroup==='armrest-lid').map(p=>p.userData.id)];
const pivot=a.root.getObjectByName('I03-armrest-hinge'),path=[];let triangleTests=0;
for(let k=0;k<=48;k++){const angle=.96*k/48;pivot.rotation.y=angle;a.root.updateMatrixWorld(true);const collisions=[];for(const id of movingIds){const m=part(id),box=new T.Box3().setFromObject(m);const active=targets.filter(t=>box.intersectsBox(t.box));if(!active.length)continue;const ts=triangles(m);for(const t of active){const cross=intersect(ts,t.tree);triangleTests++;if(cross.length)collisions.push({moving:id,fixed:t.id,crossings:cross});}}path.push({angle,collisions});}
pivot.rotation.y=0;a.root.updateMatrixWorld(true);
// Continuous body containment probes at representative surface/shaft centers complement edge crossings.
const removals=[];for(const [i,y]of [[1,-57],[2,57]]){const pin=part('I03-P20-0'+i),original=pin.position.clone();for(let d=0;d<=32;d+=2){pin.position.y=d;a.root.updateMatrixWorld(true);const ts=triangles(pin),bad=[];for(const target of targets.filter(t=>t.id.startsWith('I03-P19')||t.id==='I03-P05-01')){if(new T.Box3().setFromObject(pin).intersectsBox(target.box)){const cross=intersect(ts,target.tree);if(cross.length)bad.push({id:target.id,crossings:cross});}}removals.push({pin:'I03-P20-0'+i,withdrawY:d,collisions:bad});}pin.position.copy(original);}a.root.updateMatrixWorld(true);
const originalCorner=[];for(let j=0;j<16;j++){const x=420+1.55*Math.cos(j*Math.PI/8),y=-62+1.55*Math.sin(j*Math.PI/8);originalCorner.push({x,y,original:hits(oldLid,[x,y,453.3],[0,0,1],3),corrected:hits(lid,[x,y,453.3],[0,0,1],3)});}
// Translate secured pin/sleeves/caps together to test real axial end stops.
const retention=[];
for(const angle of [0,.48,.96]){
  pivot.rotation.y=angle;a.root.updateMatrixWorld(true);
  for(const [i,s]of [[1,'L'],[2,'R']]){
    const leafIds=i===1?['I03-P19-01','I03-P19-02']:['I03-P19-03','I03-P19-04'],leafTrees=leafIds.map(id=>({id,tree:tree(triangles(part(id)))}));
    const ids=['I03-P20-0'+i,'I03-HF-S01-'+s+'-LOW','I03-HF-S01-'+s+'-HIGH','I03-HF-S02-'+s+'-LOW','I03-HF-S02-'+s+'-HIGH'];
    for(const dy of [-.4,-.2,-.1,.1,.2,.4]){
      for(const id of ids)part(id).position.y=dy;a.root.updateMatrixWorld(true);const collisions=[];
      for(const id of ids){const ts=triangles(part(id));for(const t of leafTrees){const cross=intersect(ts,t.tree,2);if(cross.length)collisions.push({part:id,leaf:t.id,crossings:cross});}}
      retention.push({angle,axis:s,translateY:dy,blockedByGeometry:collisions.length>0,collisions});
    }
    for(const id of ids)part(id).position.y=0;
  }
}
pivot.rotation.y=0;a.root.updateMatrixWorld(true);
const mating=[];
for(const p of fresh.filter(p=>['I03-HF-F01','I03-HF-S02'].includes(p.userData.subPart))){
  const receiver=part(p.userData.receiving.ids.find(id=>id.startsWith('I03-P05')||id.startsWith('I03-P16')||id.startsWith('I03-P20'))),cross=intersect(triangles(p),tree(triangles(receiver)));
  mating.push({fastener:p.userData.id,receiver:receiver.userData.id,triangleCrossings:cross});
}
const localClearances=[];
for(const [axisY,leafY,fixY,leafId]of [[-57,-62,-52,'I03-P19-02'],[57,52,62,'I03-P19-04']]){
 const top=part('I03-P05-01');
 const barrelFloor=hits(top,[430,leafY,450],[0,0,-1],6)[0]?.[2],barrelBottom=hits(part(leafId),[430,leafY,445],[0,0,1],6)[0]?.[2];
 const headFloor=hits(top,[420,leafY,449],[0,0,-1],6)[0]?.[2];
 const bin=part('I03-P14-01');for(const z of [443.3,445.5]){const bossFace=hits(top,[441,fixY,z],[-1,0,0],10).at(-1)?.[0],binFace=hits(bin,[441,fixY,z],[-1,0,0],50)[0]?.[0];localClearances.push({axisY,kind:'boss-to-storage-outer-wall',probeZ:z,bossFace,binFace,gap:bossFace-binFace});}
 localClearances.push({axisY,kind:'barrel-bottom-to-relief-floor',barrelBottom,floor:barrelFloor,gap:barrelBottom-barrelFloor},{axisY,kind:'moving-head-bottom-to-relief-floor',headBottom:447.5,floor:headFloor,gap:447.5-headFloor});
}
const finite=a.parts.every(p=>Array.from(p.geometry.attributes.position.array).every(Number.isFinite));
const r={revision:a.definition.hingeFixings.revision,baseRevision:a.definition.revision,baseSourceSHA256:sha(baseFile),meshCount:a.parts.length,newMeshCount:fresh.length,changedExistingGeometry:changed,preservedParents:changed.every(id=>part(id).parent.name===before.get(id).parent),preservedTransforms:changed.every(id=>JSON.stringify(part(id).position.toArray())===JSON.stringify(before.get(id).position)),baseFileUnchanged:sha(baseFile)===sha(await fs.readFile(new URL('../outputs/source/center-console.mjs',import.meta.url))),missingMetadata:bad,uniqueIDs:new Set(a.parts.map(p=>p.userData.id)).size===a.parts.length,finite,
holes,contactRaySegments:contacts,lidRoofAndFoam:roof,pinEndBlindBores:pins,originalCornerSideBreakthrough:originalCorner,retention,mating,localClearances,
motion:{method:'actual triangle-triangle edge crossing with spatial BVH; coplanar intended contact excluded; 49 discrete poses, not continuous swept-volume proof',trianglePairQueries:triangleTests,samples:path,collisionPoseCount:path.filter(p=>p.collisions.length).length},
pinWithdrawal:{method:'actual triangles after both end caps and sleeves removed; original pin translated +Y in 2 mm steps',samples:removals,collisionSampleCount:removals.filter(s=>s.collisions.length).length},
parts:a.parts.map(p=>({id:p.userData.id,name:p.name,parent:p.parent.name,...p.userData})),definition:a.definition.hingeFixings};
await fs.writeFile(new URL('console-hinge-readback.json',out),JSON.stringify(r,null,2));console.log(JSON.stringify({revision:r.revision,count:r.meshCount,new:r.newMeshCount,changed:r.changedExistingGeometry,missing:bad,finite,collisionPoses:r.motion.collisionPoseCount,withdrawalCollisions:r.pinWithdrawal.collisionSampleCount,minFoamGap:Math.min(...roof.filter(r=>r.gap!==null).map(r=>r.gap)),pathFailures:path.filter(p=>p.collisions.length).slice(0,2)}));
