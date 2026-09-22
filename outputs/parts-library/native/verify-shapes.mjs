// Portable validation: independent topology reader and readback from actual mesh.
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import crypto from 'node:crypto';
import * as T from './source/three.mjs';
import {RECIPES,compileRecipe} from './shape-compiler.mjs';
import {topology} from './math-quality.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const volume=(a,o=[0,0,0])=>{let v=0;for(let i=0;i<a.length;i+=9){const p=[0,3,6].map(j=>[0,1,2].map(k=>a[i+j+k]-o[k]));v+=new T.Vector3(...p[0]).dot(new T.Vector3(...p[1]).cross(new T.Vector3(...p[2])))/6;}return v;};
const dispose=r=>r.root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
const check=(name,pass,value)=>{if(!pass)throw Error(name+' '+JSON.stringify(value));return{name,pass,value};};
function expectedAllowed(id,p){if(id==='flange')return Math.min(p.radius-p.pcd-p.hole,p.pcd-p.hole-p.bore,2*p.pcd*Math.sin(Math.PI/p.count)-2*p.hole)>=1;if(id==='lattice')return p.pitch>2*p.radius+1;return true;}
export async function verifyShapes(){
 const data=JSON.parse(await fs.readFile(path.join(root,'shape-theory.json'),'utf8'));
 const report={revision:data.revision,scope:'Nine authored shape recipes; complete mesh topology at defaults, individual parameter extrema and explicit rejected inputs. No manufacturing release.',bindings:{compiler:hash(await fs.readFile(new URL('shape-compiler.mjs',import.meta.url))),data:hash(await fs.readFile(path.join(root,'shape-theory.json')))},defaults:[],parameterCases:[],counterexamples:[],limits:['Global self-intersection is not completely examined.','No material/load/physical assembly qualification.','Parameter extrema vary one at a time; they do not cover every combination.'],manufacturingReleased:false};
 const ids=new Set(data.theories.map(t=>t.id));check('Every recipe law exists',RECIPES.every(r=>r.theoryIds.every(t=>ids.has(t))));
 let fixture;
 for(const recipe of RECIPES){
  const r=compileRecipe(T,recipe.id),points=Array.from(r.parts[0].geometry.attributes.position.array),top=topology({points});
  const normalArray=Array.from(r.parts[0].geometry.attributes.normal.array);check('Finite unit normals '+recipe.id,normalArray.every(Number.isFinite)&&normalArray.every((v,i)=>i%3!==0||Math.abs(Math.hypot(v,normalArray[i+1],normalArray[i+2])-1)<1e-5));
  check('Full mesh topology '+recipe.id,top.badEdgeIncidence===0&&top.badOrientedEdges===0&&top.badVertexLinks===0,top);
  const v=volume(points),translated=volume(points,[231.3,-51.7,98.1]);check('Origin independent volume '+recipe.id,Math.abs(v-translated)<Math.max(1e-6,v*1e-8),{v,translated});
  const expectedChi=recipe.id==='flange'?2-2*(r.metrics.inputs.count+1):recipe.id==='lattice'?2-2*r.metrics.derived.holes.value:['pipe','lampshade'].includes(recipe.id)?0:2;
  check('Expected hole topology '+recipe.id,top.eulerCharacteristic===expectedChi,{actual:top.eulerCharacteristic,expected:expectedChi});
  const matrix=new T.Matrix4().makeRotationFromEuler(new T.Euler(.3,-.51,.23));matrix.setPosition(13,-19,7);const transformed=[];for(let i=0;i<points.length;i+=3)transformed.push(...new T.Vector3(...points.slice(i,i+3)).applyMatrix4(matrix).toArray());const rigidVolume=volume(transformed);check('Rigid motion preserves volume '+recipe.id,Math.abs(v-rigidVolume)<Math.max(1e-6,v*1e-8),{v,rigidVolume});
  report.defaults.push({id:recipe.id,inputs:r.metrics.inputs,topology:top,volumeMm3:v,originDifferenceMm3:Math.abs(v-translated),rigidVolumeDifferenceMm3:Math.abs(v-rigidVolume),checks:r.metrics.checks,graph:r.graph,positionsSha256:hash(Buffer.from(new Float32Array(points).buffer))});
  if(recipe.id==='flange')fixture=points;
  const capTriangles={pipe:256,grip:192,spring:64}[recipe.id];
  if(capTriangles){const g=r.parts[0].geometry,n=g.attributes.normal;let maxDeviation=0;for(let i=n.count-capTriangles*3;i<n.count;i+=3){const j=i*3,normal=new T.Vector3(...points.slice(j+3,j+6)).sub(new T.Vector3(...points.slice(j,j+3))).cross(new T.Vector3(...points.slice(j+6,j+9)).sub(new T.Vector3(...points.slice(j,j+3)))).normalize();for(let k=0;k<3;k++)maxDeviation=Math.max(maxDeviation,1-normal.dot(new T.Vector3().fromBufferAttribute(n,i+k)));}check('End-face normals do not imply a false fillet '+recipe.id,maxDeviation<1e-5,{maxDeviation});report.defaults.at(-1).capNormalMaxDeviation=maxDeviation;}
  dispose(r);
  for(const spec of recipe.parameters)for(const value of [spec.min,spec.max]){
   const p=Object.fromEntries(recipe.parameters.map(s=>[s.key,s.default]));p[spec.key]=value;const allowed=expectedAllowed(recipe.id,p);let model,error;
   try{model=compileRecipe(T,recipe.id,p);}catch(e){error=e.message;}
   check('Correct acceptance of parameter endpoint '+recipe.id+'.'+spec.key,Boolean(model)===allowed,{value,allowed,error});
   let top;if(model){top=topology({points:Array.from(model.parts[0].geometry.attributes.position.array)});check('Endpoint topology '+recipe.id,top.badEdgeIncidence===0&&top.badOrientedEdges===0&&top.badVertexLinks===0,top);dispose(model);}
   report.parameterCases.push({id:recipe.id,parameter:spec.key,value,expected:allowed?'ACCEPT':'REJECT',observed:model?'ACCEPT':'REJECT',topology:top,error});
  }
 }
 const open={points:fixture.slice(9)},reversed={points:fixture.slice()};reversed.points.splice(3,6,...fixture.slice(6,9),...fixture.slice(3,6));
 report.counterexamples.push(check('Deleted face rejected by independent topology',topology(open).badEdgeIncidence>0),check('Reversed face rejected by oriented topology',topology(reversed).badOrientedEdges>0));
 for(const [id,p,name]of [['flange',{count:3.5},'Fractional hole count'],['vessel',{wall:NaN},'Nonfinite parameter'],['pipe',{radius:0},'Zero radius'],['flange',{pcd:36,radius:28},'Holes beyond outer boundary'],['lattice',{pitch:12,radius:7},'Intersecting hole envelopes'],['spring',{mystery:1},'Unknown parameter']]){let caught=false;try{const r=compileRecipe(T,id,p);dispose(r);}catch{caught=true;}report.counterexamples.push(check(name+' rejected',caught));}
 const old=await import('./fixtures/shape-compiler-r0.mjs');let oldRejected=false;try{const r=old.compileRecipe(T,'lattice');dispose(r);}catch(e){oldRejected=/封閉有向邊界/.test(e.message);}report.counterexamples.push(check('Frozen initial lattice still fails its boundary gate',oldRejected));
 report.normalCorrection=[];for(const id of ['vessel','lampshade','pipe','grip','saddle','spring']){const b=old.compileRecipe(T,id),a=compileRecipe(T,id),gb=b.parts[0].geometry,ga=a.parts[0].geometry;const beforePosition=hash(Buffer.from(gb.attributes.position.array.buffer)),afterPosition=hash(Buffer.from(ga.attributes.position.array.buffer));check('Shading correction preserves exact geometry '+id,beforePosition===afterPosition);let largestDifference=0;for(let i=0;i<ga.attributes.normal.array.length;i++)largestDifference=Math.max(largestDifference,Math.abs(ga.attributes.normal.array[i]-gb.attributes.normal.array[i]));report.normalCorrection.push({id,positionsIdentical:true,positionSha256:afterPosition,maxNormalComponentDifference:largestDifference,meaning:'Hard end faces and rim boundaries keep their own normals; no geometric fillet was introduced.'});dispose(b);dispose(a);}
 report.pass=true;report.summary={recipes:report.defaults.length,parameterCases:report.parameterCases.length,rejectedParameterCases:report.parameterCases.filter(c=>c.observed==='REJECT').length,counterexamples:report.counterexamples.length,theories:data.theories.length,applications:data.theories.reduce((n,t)=>n+t.applications.length,0)};return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const report=await verifyShapes();if(process.argv.includes('--write'))await fs.writeFile(path.join(root,'evidence/shape-native-readback.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,...report.summary,manufacturingReleased:false}));}catch(e){console.error(e.stack);process.exitCode=1;}
}
