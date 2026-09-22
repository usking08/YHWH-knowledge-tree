import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import * as T from './source/three.mjs';
import {buildGT01DoorHandle} from './source/door-handle.mjs';
export {T};
export const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export async function buildSelected(){
 const h=buildGT01DoorHandle(T);
 const parts=h.parts.map(p=>({id:p.userData.id,name:p.name,surfaces:[[p.name,p.geometry]],interfaces:p.userData.interfaces,material:p.material.color.toArray(),materialType:p.material.type,source:'door-handle.mjs',revision:h.root.userData.revision,placement:{matrix:p.matrix.toArray(),frame:'D11 assembly millimetres'}}));
 const source=await fs.readFile(new URL('./source/window-regulator.mjs',import.meta.url),'utf8');
 if(/^\s*import\s/m.test(source))throw Error('Adapter expects the copied self-contained regulator source; resolve new imports explicitly.');
 const mod=await import('data:text/javascript;base64,'+Buffer.from(source+'\nexport { makeGT01GlassClamps };\n').toString('base64'));
 const components=mod.makeGT01GlassClamps(T);
 for(const id of ['D05-P15d','D05-P15e']){const c=components.find(p=>p.ref===id);if(!c)throw Error('Missing actual prototype '+id);parts.push({id,name:c.name.replace(/[-+]?24/g,''),surfaces:c.surfaces,interfaces:c.interfaces,material:[.6,.63,.65],materialType:'MeshStandardMaterial',source:'window-regulator.mjs',revision:'SOURCE_SHA256_BOUND',placement:{frame:'D05 clamp upper geometry after followGlass; component.x is a separate placement',prototypeX:0,selectedInstanceX:c.x,duplicateInstanceX:components.filter(p=>p.ref===id).map(p=>p.x)}});}
 if(parts.length!==12||new Set(parts.map(p=>p.id)).size!==12)throw Error('Expected 12 unique physical part types');
 return parts;
}
export function triangles(surfaces){const points=[],normals=[],groups=[];for(const [label,g]of surfaces){const p=g.attributes.position,n=g.attributes.normal,idx=g.index,start=points.length/9,count=idx?idx.count:p.count;for(let i=0;i<count;i++){const j=idx?idx.getX(i):i;points.push(p.getX(j),p.getY(j),p.getZ(j));normals.push(n?n.getX(j):0,n?n.getY(j):0,n?n.getZ(j):0);}groups.push({label,startTriangle:start,triangleCount:count/3});}return{points,normals,groups};}
// JSON/OBJ spell -0 as 0. Canonicalize only that numerically identical bit pattern.
export function triangleHash(t){return sha(Buffer.from(new Float32Array(t.points.map(v=>v===0?0:v)).buffer));}
export function normalHash(t){return sha(Buffer.from(new Float32Array(t.normals.map(v=>v===0?0:v)).buffer));}
export function inspect(t){
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],keys=new Map(),vertices=[],edge=new Map(),parent=[];let zeroArea=0,volume=0,nonFinite=0;
 const vertex=a=>{const k=a.map(x=>Math.round(x*1e5)).join(',');if(!keys.has(k)){keys.set(k,vertices.length);vertices.push(a);parent.push(parent.length);}return keys.get(k);};
 const root=a=>{while(parent[a]!==a){parent[a]=parent[parent[a]];a=parent[a];}return a;};
 const unite=(a,b)=>{a=root(a);b=root(b);if(a!==b)parent[b]=a;};
 for(let i=0;i<t.points.length;i+=9){const a=t.points.slice(i,i+3),b=t.points.slice(i+3,i+6),c=t.points.slice(i+6,i+9);for(const p of[a,b,c])for(let k=0;k<3;k++){if(!Number.isFinite(p[k]))nonFinite++;min[k]=Math.min(min[k],p[k]);max[k]=Math.max(max[k],p[k]);}const u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-a[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(Math.hypot(...n)<1e-9)zeroArea++;volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;const ids=[vertex(a),vertex(b),vertex(c)];unite(ids[0],ids[1]);unite(ids[1],ids[2]);for(let j=0;j<3;j++){const x=ids[j],y=ids[(j+1)%3],k=x<y?x+':'+y:y+':'+x;if(!edge.has(k))edge.set(k,{count:0,balance:0});const e=edge.get(k);e.count++;e.balance+=x<y?1:-1;}}
 const es=[...edge.values()];return{triangles:t.points.length/9,verticesAfterPositionWeld:vertices.length,weldToleranceMm:1e-5,surfaceCount:t.groups.length,connectedComponents:new Set(parent.map((_,i)=>root(i))).size,openEdges:es.filter(e=>e.count===1).length,nonManifoldEdges:es.filter(e=>e.count!==2).length,inconsistentOrientationEdges:es.filter(e=>e.count===2&&e.balance!==0).length,zeroAreaTriangles:zeroArea,nonFiniteCoordinates:nonFinite,signedVolumeMm3:volume,boundsMm:{min,max,size:min.map((x,i)=>max[i]-x)},positionTriangleSHA256:triangleHash(t),normalTriangleSHA256:normalHash(t)};
}
export function objText(id,t){const a=['# AUTHOR_DESIGN; units mm; source coordinates preserved','mtllib part.mtl','o '+id];for(let i=0;i<t.points.length;i+=3)a.push('v '+t.points.slice(i,i+3).join(' '));for(let i=0;i<t.normals.length;i+=3)a.push('vn '+t.normals.slice(i,i+3).join(' '));a.push('usemtl authored_appearance');for(const [k,g]of t.groups.entries()){a.push('# '+g.label,'g surface_'+k);for(let n=g.startTriangle;n<g.startTriangle+g.triangleCount;n++){const i=n*3+1;a.push('f '+[i,i+1,i+2].map(v=>v+'//'+v).join(' '));}}return a.join('\n')+'\n';}
export function readOBJ(text){const v=[],n=[],points=[],normals=[],groups=[];let current=null;for(const line of text.split(/\r?\n/)){const w=line.trim().split(/\s+/);if(w[0]==='v')v.push(w.slice(1).map(Number));if(w[0]==='vn')n.push(w.slice(1).map(Number));if(w[0]==='g'){current={label:w[1],startTriangle:points.length/9,triangleCount:0};groups.push(current);}if(w[0]==='f'){if(w.length!==4)throw Error('Expected triangle OBJ');for(const q of w.slice(1)){const z=q.split('/');points.push(...v[+z[0]-1]);normals.push(...n[+z[2]-1]);}current.triangleCount++;}}return{points,normals,groups};}
export function fromGeometryJSON(data){return data.surfaces.map(s=>[s.label,new T.BufferGeometryLoader().parse(s.geometry)]);}
export function rayDistances(t,origin,direction){const ray=new T.Ray(new T.Vector3(...origin),new T.Vector3(...direction).normalize()),hits=[],v=new T.Vector3();for(let i=0;i<t.points.length;i+=9){const a=new T.Vector3().fromArray(t.points,i),b=new T.Vector3().fromArray(t.points,i+3),c=new T.Vector3().fromArray(t.points,i+6);if(ray.intersectTriangle(a,b,c,false,v)){const d=v.distanceTo(ray.origin);if(d>1e-6&&!hits.some(x=>Math.abs(x-d)<1e-4))hits.push(d);}}return hits.sort((a,b)=>a-b);}
export function fastenerFrame(y){const a=Math.atan(.55),co=Math.cos(a),si=Math.sin(a);return[0,-45+co*(y-10)+6*si,69+si*(y-10)-6*co];}
export function fastenerProbe(t,id){
 const a=Math.atan(.55),co=Math.cos(a),si=Math.sin(a),axis=[0,co,si],radial=(angle)=>[Math.cos(angle),-si*Math.sin(angle),co*Math.sin(angle)];
 const sample=(y,angle)=>{const distances=rayDistances(t,fastenerFrame(y),radial(angle));return{axialNativeY:y,angleRadians:angle,radialDistancesMm:distances};};
 const threadY=id==='D05-P15d'?0:0;
 const phaseSamples=[0,Math.PI/2,Math.PI,3*Math.PI/2].map(a=>sample(threadY,a));
 const periodicSamples=[0,.8].map(y=>sample(y,0));
 const variation=Math.max(...phaseSamples.map(p=>p.radialDistancesMm[0]))-Math.min(...phaseSamples.map(p=>p.radialDistancesMm[0]));
 const periodicError=Math.abs(periodicSamples[0].radialDistancesMm[0]-periodicSamples[1].radialDistancesMm[0]);
 const through=rayDistances(t,fastenerFrame(-8),axis);
 const socket=id==='D05-P15d'?{origin:fastenerFrame(23.35),direction:axis.map(v=>-v),hitsMm:rayDistances(t,fastenerFrame(23.35),axis.map(v=>-v)),expectedFirstHitMm:3.3}:null;
 return{axis,frameOriginAtNativeY0:fastenerFrame(0),phaseSamples,periodicSamples,radialVariationAtOneAxialStationMm:variation,pitchPeriodErrorMm:periodicError,helicalSurfaceObserved:variation>.3&&periodicError<.025,axialCentreRayFromBelow:{hitsMm:through,clearThroughHole:id==='D05-P15e'?through.length===0:null},socketBlindRecess:socket,method:'Rays intersect cold-read OBJ triangles, not metadata or a substituted primitive. Phase variation plus 0.8mm repeat is a narrow helical geometry check; no thread tolerance certification.'};
}
