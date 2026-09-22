import fs from 'node:fs/promises';const path=new URL('../outputs/source/center-display.mjs',import.meta.url);let s=await fs.readFile(path,'utf8');
s=s.replace("revision:'I05-B-R3'","revision:'I05-B-R4'");
s=s.replace("physicalBoundary:'BONDED_MATERIAL_LAYER',thickness:b-a","physicalBoundary:extra.partKind==='OPTICAL_COMPONENT'?'ONE_OPTICAL_COMPONENT':extra.partKind==='OPTICAL_SHEET'?'ONE_OPTICAL_SHEET':'BONDED_MATERIAL_LAYER',thickness:b-a");
s=s.replace("plate(w-1,1.5,.2,-2.95,-2.75,u,-39.9)","joined([plate(w-1,1.5,.2,-2.75,-2.55,u,-39.9),plate(width-.2,1.5,.15,-2.95,-2.75,u,-39.9)])");
const old="const prisms=[];for(let j=0;j<45;j++){const sh=new T.Shape();sh.moveTo(-133,-45+j*2);sh.lineTo(133,-45+j*2);sh.lineTo(133,-44.96+j*2);sh.lineTo(-133,-44.96+j*2);sh.closePath();prisms.push(ex(sh,1.98,2));}";
const next="const prisms=[];for(let j=0;j<45;j++){const y=-45+j*2,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-133,y,1.98,133,y,1.98,-133,y+.04,1.98,133,y+.04,1.98,-133,y+.02,2,133,y+.02,2],3));g.setIndex([0,2,1,1,2,3,0,1,4,1,5,4,2,4,3,3,4,5,0,4,2,1,3,5]);g.computeVertexNormals();prisms.push(g);}";
if(!s.includes(old))throw Error('prism');s=s.replace(old,next);await fs.writeFile(path,s);
const contact=new URL('center-display-contact.mjs',import.meta.url);let c=await fs.readFile(contact,'utf8');c=c.replace("center-display-contact-r3.json","center-display-contact-r4.json");await fs.writeFile(contact,c);
