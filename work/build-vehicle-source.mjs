import fs from 'node:fs/promises';
import {motorSourceBundle} from './motor-source-bundle.mjs';
const root=new URL('../',import.meta.url);
let original=await fs.readFile(new URL('outputs/quality/baseline/original-vehicle-surface.mjs',root),'utf8');
let body=original.slice(original.indexOf('const V='),original.indexOf('function lathe(profile)'));
body=body.replace('Math.exp(-((x+1325)/580)**2)','Math.exp(-(((x+1325)/580)**2))').replace('Math.exp(-((x-1325)/510)**2)','Math.exp(-(((x-1325)/510)**2))').replace('Math.exp(-((q-.82)/.16)**2)','Math.exp(-(((q-.82)/.16)**2))');
body=body.replace('const V=(x,y,z)=>new T.Vector3(x,y,z)',`const V=(x,y,z)=>new T.Vector3(x+(x<-1940?135*((-1940-x)/271)**2*Math.min(1.2,Math.abs(y)/850)**3:x>1940?-130*((x-1940)/271)**2*Math.min(1.2,Math.abs(y)/850)**3:0),y,z)`);
body=body.replace('c+(sh-c)*q**2.5+bulge','c+(sh-c)*q**2.5+bulge-52*Math.max(0,(q-.76)/.24)**2');
const sideStart=body.indexOf('function side('),sideEnd=body.indexOf('\nfunction param',sideStart);
body=body.slice(0,sideStart)+`function side(x,t,s){const [,w,,sh,b]=rowAt(bodyRows,x),edge=top(x,s).z,low=Math.max(b,arch(x)),z=lerp(edge,low,t),a=clamp((edge-z)/(edge-b),0,1),flare=55*(Math.exp(-(((x+1325)/430)**2))+Math.exp(-(((x-1325)/430)**2)));const y=w*(1-.12*a)-25*Math.sin(Math.PI*a)+15*Math.sin(2*Math.PI*a)+flare*Math.sin(Math.PI*a);return V(x,s*y,z);}`+body.slice(sideEnd);
body=body.replace('.add(V(4,0,2))','.add(V(14,0,2))').replace('.add(V(10,0,4))','.add(V(22,0,4))');
body=body.replace('lerp(-2160,-1956,u)','lerp(-2160,-2060,u)');
const addStart=body.indexOf('function add('),addEnd=body.indexOf('\nfunction ribbon(',addStart);
body=body.slice(0,addStart)+`function add(name,g,mat='paint',system='body',p=[0,0,0],rot=[0,0,0],key){
 if(g.userData.surface){const pp=g.attributes.position,nn=g.attributes.normal;let direction=0;for(let i=0;i<pp.count;i+=Math.max(1,Math.floor(pp.count/40)))direction+=nn.getX(i)*pp.getX(i)+nn.getY(i)*pp.getY(i)+nn.getZ(i)*(pp.getZ(i)-430);if(direction<0){for(let i=0;i<nn.count;i++)nn.setXYZ(i,-nn.getX(i),-nn.getY(i),-nn.getZ(i));const ii=g.index;for(let i=0;i<ii.count;i+=3){const b=ii.getX(i+1);ii.setX(i+1,ii.getX(i+2));ii.setX(i+2,b);}}}
 const m=new T.Mesh(g,materials[mat]||materials.black);m.name=name;m.position.fromArray(p);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;
 m.userData={id:'GT-'+String(parts.length+1).padStart(4,'0'),name,system,reference:'GT01-'+(system==='interior'?'details':'body')+'.png',status:'WORK_IN_PROGRESS'};root.add(m);parts.push(m);return m;
}`+body.slice(addEnd);
body=body.replace('g.setIndex(idx);return g;','g.setIndex(idx);g.userData.surface=true;return g;');
body=body.replace('Math.abs(dx)<377','Math.abs(dx)<342').replace('340+Math.sqrt(377**2-dx**2)','305+Math.sqrt(342**2-dx**2)');
let extras=await fs.readFile(new URL('work/vehicle-additions.txt',root),'utf8');
const doorStart=extras.indexOf('for(const s of [-1,1]){\n const sy=');
const doorEnd=extras.indexOf("\n}\nloftPart('儀表台",doorStart);
if(doorStart<0||doorEnd<0)throw Error('Original door construction block changed');
extras=extras.slice(0,doorStart)+extras.slice(doorEnd+2);
extras+=`\nconst seats=buildGT01Seats(T,materials);root.add(seats.root);parts.push(...seats.parts);\n`;
extras+=`\nconst doorTrim=buildGT01DoorTrim(T,materials,(x,z)=>{const [,w,,sh,b]=rowAt(bodyRows,x),edge=top(x,1).z,low=Math.max(b,arch(x));return side(x,clamp((edge-z)/(edge-low),0,1),1).y;});root.add(doorTrim.root);parts.push(...doorTrim.parts);\n`;
extras+=`\nconst regulator=buildGT01Regulator(T,materials,(x,z)=>{const [,w,,sh,b]=rowAt(bodyRows,x),edge=top(x,1).z,low=Math.max(b,arch(x));return side(x,clamp((edge-z)/(edge-low),0,1),1).y;});attachGT01WindowMotors(T,regulator);root.add(regulator.root);parts.push(...regulator.parts);\n`;
extras+=`\ncompleteGT01DoorGlass(T,parts,regulator);\n`;
const doorModule=await fs.readFile(new URL('outputs/source/door-trim.mjs',root),'utf8');
const seatsModule=await fs.readFile(new URL('outputs/source/seats.mjs',root),'utf8');
const regulatorModule=await fs.readFile(new URL('outputs/source/window-regulator.mjs',root),'utf8');
const identityModule=await fs.readFile(new URL('outputs/source/vehicle-part-bindings.mjs',root),'utf8');
const glassModule=await fs.readFile(new URL('outputs/source/door-glass.mjs',root),'utf8');
const hoodModule=await fs.readFile(new URL('outputs/source/hood-assembly.mjs',root),'utf8');
const steeringModule=await fs.readFile(new URL('outputs/source/steering-wheel.mjs',root),'utf8');
const instrumentModule=await fs.readFile(new URL('outputs/source/instrument-cluster.mjs',root),'utf8');
const dashboardModule=await fs.readFile(new URL('outputs/source/dashboard.mjs',root),'utf8');
const consoleModule=await fs.readFile(new URL('outputs/source/center-console.mjs',root),'utf8');
const consoleHingeModule=await fs.readFile(new URL('outputs/source/console-hinge-fixings.mjs',root),'utf8');
const hingeFinishModule=await fs.readFile(new URL('outputs/source/hinge-lookdev.mjs',root),'utf8');
const centerDisplayModule=await fs.readFile(new URL('outputs/source/center-display.mjs',root),'utf8');
const motorModule=await motorSourceBundle();
const module=`// GT01: shared surface controls, source-constrained authored geometry, millimetres, Z up.
export function buildVehicle(T,wheelModel){
 const root=new T.Group(),parts=[];root.name='GT01';
 const materials={
  paint:new T.MeshPhysicalMaterial({color:0x173b2e,metalness:.76,roughness:.26,clearcoat:1,clearcoatRoughness:.13,side:T.DoubleSide}),
  leather:new T.MeshPhysicalMaterial({color:0x975d33,roughness:.64,clearcoat:.14,clearcoatRoughness:.48,sheen:.3,sheenColor:0xd1ac79,sheenRoughness:.7,side:T.DoubleSide}),
  black:new T.MeshStandardMaterial({color:0x14181a,roughness:.44,metalness:.18,side:T.DoubleSide}),
  rubber:new T.MeshStandardMaterial({color:0x0b0e0f,roughness:.9,side:T.DoubleSide}),
  alloy:new T.MeshStandardMaterial({color:0xa9b0b3,metalness:.96,roughness:.26,side:T.DoubleSide}),
  metal:new T.MeshStandardMaterial({color:0x515d60,metalness:.85,roughness:.36,side:T.DoubleSide}),
  glass:new T.MeshPhysicalMaterial({color:0x364a43,metalness:.12,roughness:.09,transparent:true,opacity:.64,depthWrite:false,side:T.DoubleSide}),
  lens:new T.MeshPhysicalMaterial({color:0xf0f4ff,metalness:.1,roughness:.08,transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide}),
  redglass:new T.MeshPhysicalMaterial({color:0x650606,roughness:.18,metalness:.35,clearcoat:1}),
  redled:new T.MeshStandardMaterial({color:0xea1520,emissive:0xf11414,emissiveIntensity:2,roughness:.3}),
  led:new T.MeshStandardMaterial({color:0xe6f4ff,emissive:0xc7e4ff,emissiveIntensity:2,roughness:.2}),
  mirror:new T.MeshStandardMaterial({color:0xc6d1d6,metalness:1,roughness:.05}),
  stitch:new T.MeshStandardMaterial({color:0xbfa179,roughness:.9}),
  carpet:new T.MeshStandardMaterial({color:0x222423,roughness:1}),
  aluminum:new T.MeshStandardMaterial({color:0x6b777b,metalness:.82,roughness:.55})
 };
 const texSize=256,grain=new Uint8Array(texSize*texSize*4);let seed=3907;for(let i=0;i<texSize*texSize;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=98+(seed>>>26);grain.set([v,v,v,255],i*4);}const tex=new T.DataTexture(grain,texSize,texSize,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(16,16);tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=true;tex.anisotropy=4;tex.needsUpdate=true;materials.leather.bumpMap=tex;materials.leather.bumpScale=.6;materials.carpet.bumpMap=tex;materials.carpet.bumpScale=.65;
 ${body}
 ${extras}
 const legacyHood=parts.find(p=>p.name==='引擎蓋');
 const hoodAssembly=buildGT01Hood(T,materials,{surface:top});root.add(hoodAssembly.root);
 const hoodIndex=parts.indexOf(legacyHood);if(hoodIndex<0)throw Error('Existing hood owner missing');
 root.remove(legacyHood);legacyHood.geometry.dispose();parts.splice(hoodIndex,1,...hoodAssembly.parts);
 const legacySteering=parts.find(p=>p.userData.id==='GT-STEER');
 if(!legacySteering)throw Error('Existing steering owner missing');
 const steeringAssembly=buildGT01Steering(T,materials),tilt=20*Math.PI/180;
 steeringAssembly.root.position.set(-169,350,747);
 steeringAssembly.root.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(-Math.sin(tilt),0,Math.cos(tilt)),new T.Vector3(Math.cos(tilt),0,Math.sin(tilt))));
 steeringAssembly.root.userData.interfaces={referenceFrontAxis:[0,0,1],referenceUpAxis:[0,1,0]};
 steeringAssembly.root.userData.worldPose={center:[-169,350,747],tiltDegrees:20,driverAxis:[Math.cos(tilt),0,Math.sin(tilt)],status:'AUTHOR_POSE_PENDING_SPACE_CHECK'};
 root.add(steeringAssembly.root);root.remove(legacySteering);legacySteering.traverse(o=>o.geometry?.dispose());
 parts.splice(parts.indexOf(legacySteering),1,...steeringAssembly.parts);
 const instrumentAssembly=buildGT01Instrument(T,materials);
 instrumentAssembly.root.position.set(-290,350,750);
 instrumentAssembly.root.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)));
 for(const name of ['儀表顯示器外框','儀表顯示玻璃']){const legacy=parts.find(p=>p.name===name);if(!legacy)throw Error('Instrument legacy owner missing: '+name);root.remove(legacy);legacy.geometry.dispose();parts.splice(parts.indexOf(legacy),1);}
 root.add(instrumentAssembly.root);parts.push(...instrumentAssembly.parts);
 const dashboardAssembly=buildGT01Dashboard(T,materials);
 const legacyDash=parts.find(p=>p.name==='儀表台連續包覆');if(!legacyDash)throw Error('Dashboard legacy owner missing');root.remove(legacyDash);legacyDash.geometry.dispose();parts.splice(parts.indexOf(legacyDash),1,...dashboardAssembly.parts);root.add(dashboardAssembly.root);
 const consoleAssembly=applyGT01HingeFinishes(T,completeGT01ConsoleHinges(T,buildGT01Console(T,materials)));
 const consoleLegacyCounts={'中央鞍座':1,'中央扶手皮革':1,'中控亮黑面板':1,'中控金屬框':1,'金屬旋鈕':2};
 for(const [name,count]of Object.entries(consoleLegacyCounts)){const legacy=parts.filter(p=>p.name===name);if(legacy.length!==count)throw Error('Console legacy owner changed: '+name);for(const p of legacy){root.remove(p);p.geometry.dispose();parts.splice(parts.indexOf(p),1);}}
 root.add(consoleAssembly.root);parts.push(...consoleAssembly.parts);
 const centerDisplayAssembly=buildGT01CenterDisplay(T,materials);
 const legacyCenterDisplay=parts.filter(p=>p.name==='中控觸控顯示器');if(legacyCenterDisplay.length!==1)throw Error('Central display legacy owner changed');
 for(const p of legacyCenterDisplay){root.remove(p);p.geometry.dispose();parts.splice(parts.indexOf(p),1);}root.add(centerDisplayAssembly.root);parts.push(...centerDisplayAssembly.parts);
 bindGT01PartReferences(parts);
 root.userData={revision:'GT01-VEHICLE-R15',units:'mm',truth:'SOURCE_BOUND_AUTHOR_DESIGN',status:'WORK_IN_PROGRESS',wholeCarComplete:false};
 return {root,parts,materials,bodyRows,canopyRows,hood:hoodAssembly,steering:steeringAssembly,instrument:instrumentAssembly,dashboard:dashboardAssembly,console:consoleAssembly,centerDisplay:centerDisplayAssembly};
}
`;
await fs.writeFile(new URL('outputs/source/vehicle.mjs',root),identityModule+'\n'+seatsModule+'\n'+doorModule+'\n'+regulatorModule+'\n'+glassModule+'\n'+motorModule+'\n'+hoodModule+'\n'+steeringModule+'\n'+instrumentModule+'\n'+dashboardModule+'\n'+consoleModule+'\n'+consoleHingeModule+'\n'+hingeFinishModule+'\n'+centerDisplayModule+'\n'+module);console.log('Vehicle construction module written; not a release.');
