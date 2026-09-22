import fs from 'node:fs/promises';
const root=new URL('../outputs/source/',import.meta.url);
async function edit(file,fn){const p=new URL(file,root),s=await fs.readFile(p,'utf8'),n=fn(s);if(s===n)throw Error('No change: '+file);await fs.writeFile(p,n);}
await edit('factory-botanical.mjs',s=>s.replace("revision:'BOTANICAL-R1'","revision:'BOTANICAL-R2'")
 .replace("x=((texU*L.width-(bb.minX+bb.maxX)/2)/(bb.maxX-bb.minX))*133","x=((texU-(rows[0].u0+rows[0].u1)/2)*L.width/(bb.maxX-bb.minX))*133")
 .replace("total=juvenile?420:1720","total=juvenile?420:1705")
 .replace("Math.cos(a)*68:0,y=stem?Math.sin(a)*68:0","Math.cos(a)*95:0,y=stem?Math.sin(a)*95:0")
 .replace("topX=x+Math.cos(a)*84,topY=y+Math.sin(a)*65","topX=x+Math.cos(a)*150,topY=y+Math.sin(a)*125")
 .replace("const stemObj=add('PL-05-'+stem,'木質主莖 '+(stem+1),tube([[x,y,baseZ-8],[x*.8,y*.8,(baseZ+topZ)*.49],[topX,topY,topZ]],juvenile?4:11-stem*1.8),wood);", "const stemCurve=new T.CatmullRomCurve3([[x,y,baseZ-8],[x*.8,y*.8,(baseZ+topZ)*.49],[topX,topY,topZ]].map(v=>new T.Vector3(...v)));\n    const stemObj=add('PL-05-'+stem,'木質主莖 '+(stem+1),new T.TubeGeometry(stemCurve,32,juvenile?4:11-stem*1.8,12,false),wood);")
 .replace('const count=juvenile?6:11','const count=juvenile?6:14')
 .replace('const start=new T.Vector3(px,py,z),end=', 'const start=stemCurve.getPoint(t),end=')
 .replace("pet.userData.interfaces={start:start.toArray(),end:end.toArray(),nominalLengthMM:55*scale};", "pet.userData.interfaces={stemId:stemObj.userData.id,stemParameter:t,stemPoints:stemCurve.points.map(p=>p.toArray()),start:start.toArray(),end:end.toArray(),nominalChordMM:55*scale};")
 .replace("back.color.set(0x98a969);back.roughness=.68;back.clearcoat=0", "back.color.set(0xb7c89d);back.roughness=.86;back.clearcoat=0")
);
await edit('factory.mjs',s=>s.replaceAll('FACTORY-R2-MATERIALS','FACTORY-R3-TEACHING').replaceAll("FACTORY-R1'","FACTORY-R3-TEACHING'")
 .replace("const be=Math.min(r*.3,h*.2,10);", "const soft=/upholstery|fabric/.test(mat.userData.materialId||''),be=Math.min(r*(soft?.45:.3),h*(soft?.28:.2),soft?45:10);")
 .replace('bevelSegments:1,steps:1,curveSegments:3','bevelSegments:5,steps:1,curveSegments:12')
 .replace('instanceScale:.8','instanceScale:1').replace('p.scale.setScalar(.8)','p.scale.setScalar(1)')
 .replace("instances.userData={partId:g.userData.id,instancedOccurrences:list.length};", "instances.userData={partId:g.userData.id,instancedOccurrences:list.length,members:list.map(o=>({name:o.name,metadata:o.userData,parent:o.parent.name}))};")
);
await edit('factory-exhibits.mjs',s=>s.replace("ctx.font=size+'px", "ctx.font='600 '+size+'px").replace("c.fillStyle='#263e34'","c.fillStyle='#14271e'").replace("c.fillStyle='#6c7568'","c.fillStyle='#263b2d'")
 .replace("format==='A7'?46:51","format==='A7'?54:62").replace("format==='A7'?28:33","format==='A7'?33:40").replace("format==='A7'?38:50","format==='A7'?46:60")
 .replace("paper.castShadow=false;paper.receiveShadow=true;papers.push(paper);", "paper.castShadow=false;paper.receiveShadow=true;paper.userData.title=title;paper.userData.paragraphs=paragraphs;paper.userData.canvasDataURL=cv.toDataURL('image/png');papers.push(paper);")
);
console.log('Refined botanical contacts, true display scale, curved upholstery and legible paper.');
