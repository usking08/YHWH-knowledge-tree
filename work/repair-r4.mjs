import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(new URL('../',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const src=path.join(root,'outputs/source');
const baseline=path.join(root,'outputs/quality/baseline');
const modelPath=path.join(src,'model.mjs');
let model=await fs.readFile(modelPath,'utf8');
if(!model.includes("revision:'SUCCESSOR-WHEEL-R3'"))throw Error('This migration only applies to the audited R3 draft.');
await fs.copyFile(modelPath,path.join(baseline,'model-before-r4.mjs'));
await fs.copyFile(path.join(src,'viewer.mjs'),path.join(baseline,'viewer-before-r4.mjs'));
function replaceExact(oldText,newText){if(!model.includes(oldText))throw Error('Source anchor missing: '+oldText.slice(0,90));model=model.replace(oldText,newText);}
const fasteners=`
 // One continuous radial surface carries the cone, wrench flats, dome and actual
 // helical bore. No open-ended hex tube is used for a closed acorn nut.
 function radialSurface(parent,stations,mat=materials.steel){
  const n=240,points=[],ix=[];
  for(const [z,r] of stations)for(let k=0;k<n;k++){const a=k*2*Math.PI/n,rr=typeof r==='function'?r(a):r;points.push(rr*Math.cos(a),rr*Math.sin(a),z);}
  for(let j=0;j<stations.length-1;j++)for(let k=0;k<n;k++){const q=j*n+k,t=j*n+(k+1)%n;ix.push(q,t,q+n,t,t+n,q+n);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(ix);g.computeVertexNormals();return mesh(parent,g,mat);
 }
 function threadRadius(z,a,major=5.93,root=5.04){
  const phase=((z-57)/1.5-a/(2*Math.PI))%1, f=(phase+1)%1;
  const ridge=Math.min(1,Math.max(0,(.43-Math.abs(f-.5))/.30));
  return root+(major-root)*ridge;
 }
 function wheelStud(parent){
  const s=[[17,0],[17,7.6],[17.3,8],[19.6,8],[20,7.7],[20,6],[38.5,6],[39,5.93],[55.4,5.93]];
  for(let z=55.5;z<=76;z+=.0625){const zz=z,blend=Math.min(1,(z-55.5)/1.5,(77-z)/1.5);s.push([z,a=>5.1+(threadRadius(zz,a)-5.1)*blend]);}
  s.push([76.5,5.25],[77,4.75],[77,0],[17,0]);radialSurface(parent,s);
  // Knurled press-fit section belongs inside the flange, never to the exposed thread.
  const knurl=[];for(const z of [20.2,20.45,32.7,33])knurl.push([z,a=>6+(z===20.2||z===33?0:.18)*(1+Math.cos(a*40))/2]);radialSurface(parent,knurl);
 }
 function wheelNut(parent){
  const hex=a=>Math.min(10.77,9.5/Math.cos(((a+Math.PI/6)%(Math.PI/3))-Math.PI/6));
  const s=[[54.95,7.1524],[55.18,7.2852],[60.92,10.5987],[61.28,a=>Math.min(10.60,hex(a))],[62.05,hex],[71.25,hex],[72.3,a=>Math.min(9.7,hex(a))],[72.7,9.2]];
  for(let k=1;k<=32;k++){const t=k*Math.PI/64;s.push([72.7+8*Math.sin(t),9.2*Math.cos(t)]);}
  s.push([78.9,0]);
  for(let k=31;k>=0;k--){const t=k*Math.PI/64;s.push([76.4+2.5*Math.sin(t),6.15*Math.cos(t)]);}
  for(let z=76.4;z>=56.8;z-=.0625){const zz=z;s.push([z,a=>threadRadius(zz,a)+.20]);}
  s.push([56.3,5.52],[54.95,6.45],[54.95,7.1524]);radialSurface(parent,s);
  parent.userData.shapeControls={reference:'W03.png',acrossFlats:19,pitch:1.5,coneIncludedDegrees:60,closedRoofZ:78.9,studEndZ:77,truth:'SOURCE_BOUND_AUTHOR_DESIGN'};
 }
 for(let k=0;k<5;k++){
  const [x,y]=lugs[k],stud=item('H09-'+k,'輪轂螺柱 '+(k+1),'H09.png','hub',[0,0,-95]);wheelStud(stud);for(const m of stud.children)m.position.set(x,y,0);
  const nut=item('W03-'+k,'封頭錐座螺帽 '+(k+1),'W03.png','wheel',[0,0,280]);wheelNut(nut);for(const m of nut.children)m.position.set(x,y,0);
 }
`;
const studLine=model.split(/\r?\n/).find(s=>s.startsWith(' for(let k=0;k<5;k++){const [x,y]=lugs[k];const stud='));replaceExact(studLine,fasteners);
replaceExact("ring(hub,20,24.95,-65,20);", "lathe(hub,[[20,-65],[24.55,-65],[24.95,-64.6],[24.95,-54.10],[23.9,-54.10],[23.9,-52.05],[24.95,-52.05],[24.95,20],[20,20],[20,-65]]);");
const clipLine=model.split(/\r?\n/).find(s=>s.startsWith(' function circlip('));
replaceExact(clipLine,` function circlip(parent,kind,z){
  const s=new T.Shape();let eyes;
  if(kind==='internal'){
   const R=46.3,ri=38.4,t=.17,ai=Math.acos(-.54*R/ri);
   s.absarc(0,0,R,-Math.PI/2+t,Math.PI*1.5-t,false);
   s.lineTo(-.15*R,-.70*R);s.bezierCurveTo(-.16*R,-.60*R,-.29*R,-.55*R,-.36*R,-.66*R);
   s.bezierCurveTo(-.43*R,-.75*R,-.48*R,-.71*R,-.54*R,-Math.sqrt(ri*ri-(.54*R)**2));
   s.absarc(0,0,ri,-ai,-Math.PI+ai,true);
   s.bezierCurveTo(.48*R,-.71*R,.43*R,-.75*R,.36*R,-.66*R);s.bezierCurveTo(.29*R,-.55*R,.16*R,-.60*R,.15*R,-.70*R);
   s.lineTo(R*Math.sin(t),-R*Math.cos(t));s.closePath();eyes=[[-.28*R,-.70*R,3.3],[.28*R,-.70*R,3.3]];
  }else{
   const ri=24.05,ro=28,t=.46,ti=.21;
   s.absarc(0,0,ro,-Math.PI/2+t,Math.PI*1.5-t,false);
   s.bezierCurveTo(-10.6,-26.3,-11.5,-29.8,-9,-31.5);s.bezierCurveTo(-7.3,-32.4,-4.1,-33,-3.5,-31.5);
   s.lineTo(-3.1,-25.1);s.quadraticCurveTo(-3.05,-24.0,-ri*Math.sin(ti),-ri*Math.cos(ti));
   s.absarc(0,0,ri,-Math.PI/2-ti,-Math.PI/2+ti,true);
   s.quadraticCurveTo(3.05,-24.0,3.1,-25.1);s.lineTo(3.5,-31.5);s.bezierCurveTo(4.1,-33,7.3,-32.4,9,-31.5);
   s.bezierCurveTo(11.5,-29.8,10.6,-26.3,ro*Math.sin(t),-ro*Math.cos(t));s.closePath();eyes=[[-6.5,-28.6,1.6],[6.5,-28.6,1.6]];
  }
  for(const [x,y,r] of eyes){const h=new T.Path();h.absarc(x,y,r,0,2*Math.PI,true);s.holes.push(h);}
  const g=new T.ExtrudeGeometry(s,{depth:1.66,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:3,curveSegments:96});g.translate(0,0,z+.07);mesh(parent,g,materials.steel);
  parent.userData.shapeControls={kind,eyes,nominalThickness:1.8,z0:z,z1:z+1.8,truth:'SOURCE_BOUND_AUTHOR_DESIGN'};
 }`);
replaceExact("circlip(outerClip,41.5,46.3,-56.2);","circlip(outerClip,'internal',-55.86);");
replaceExact("'H12.png','hub',[0,0,-315]);circlip(shaftClip,24.3,28,-56.3);","'H12-r2.png','hub',[0,0,-315]);circlip(shaftClip,'external',-53.8);");
replaceExact("revision:'SUCCESSOR-WHEEL-R3'","revision:'SUCCESSOR-WHEEL-R4'");
// Correct source identity; do not change occurrence IDs or disguise outstanding shape defects.
model=model.replace(/('B04-'[^\n]*?)'B04.png'/g,"$1'B05.png'").replace(/('B05-'[^\n]*?)'B05.png'/g,"$1'B04.png'");
await fs.writeFile(modelPath,model);
let viewer=await fs.readFile(path.join(src,'viewer.mjs'),'utf8');
viewer=viewer.replace('distance=55;','distance=.1;');
viewer=viewer.replace('function choose(id){',"function choose(id){clip=false;for(const m of Object.values(model.materials)){m.clippingPlanes=[];m.needsUpdate=true;}document.querySelector('#section').classList.remove('active');");
viewer=viewer.replace('function render(){','function render(){camera.near=Math.max(.005,Math.min(.5,distance/500));camera.updateProjectionMatrix();');
viewer=viewer.replace('Math.max(180,Math.min(3000,','Math.max(.5,Math.min(12000,');
viewer=viewer.replace("輪端施工稿 · R3","輪端施工稿 · R4");
await fs.writeFile(path.join(src,'viewer.mjs'),viewer);
console.log('R4 candidate: closed helical fasteners, actual circlip eyes, outward shaft-clip lugs and shaft groove; viewer clip reset and part-relative close view. Not released.');
