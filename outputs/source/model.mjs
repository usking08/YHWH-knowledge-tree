import * as T from './three.mjs';
export function buildModel(rimData,options={}){
 const assemblyDetail=options.detail==='assembly',radialSegments=assemblyDetail?72:240,threadStep=assemblyDetail?.25:.0625;
 const root=new T.Group(), parts=[];
 const materials={rubber:new T.MeshStandardMaterial({color:0x111518,roughness:.86,side:T.DoubleSide}),face:new T.MeshStandardMaterial({color:0xc8cdd0,metalness:.88,roughness:.24,side:T.DoubleSide}),cast:new T.MeshStandardMaterial({color:0x737b81,metalness:.72,roughness:.58,side:T.DoubleSide})};
 function part(id,name,reference,provenance){const g=new T.Group();g.name=id;g.userData={id,name,reference,provenance};root.add(g);parts.push(g);return g;}
 const rim=part('W01','五組雙輻輪圈 · 保留來源','W01.png','SOURCE_PRESERVED');
 for(const r of rimData.items){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(r.positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(r.normals,3));g.setIndex(r.indices);rim.add(new T.Mesh(g,materials[r.finish]||materials.cast));}
 // r,z in mm. Contact stations derive from the preserved rim outer barrel.
 // The non-contact sidewall and crown are independently reconstructed from W02-r3.
 const section=[[233.05,-90],[231.05,-76],[235,-73],[244,-80],[263,-120],[278,-128],[289,-126],[299,-112],[303,-96],[305,-75],[305,75],[303,96],[299,112],[289,126],[278,128],[263,120],[250,106],[242.05,94],[233.05,91],[228.05,84],[233,81],[240,86],[252,105],[268,117],[278,118],[289,112],[294,98],[295,75],[295,-75],[294,-94],[290,-107],[280,-111],[269,-108],[253,-87],[242,-72],[235,-70],[231.6,-76],[233.2,-87],[233.2,-90],[233.05,-90]];
 const profile=[];
 for(let j=0;j<section.length-1;j++){const a=section[j],b=section[j+1],n=Math.max(3,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.8));for(let k=0;k<n;k++){const t=k/n;let r=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(j>=3&&j<=16&&j!==9){const prev=section[j-1],next=section[j+2];const d=Math.hypot(b[0]-a[0],b[1]-a[1]);const da=Math.hypot(b[0]-prev[0],b[1]-prev[1]),db=Math.hypot(next[0]-a[0],next[1]-a[1]);const h00=2*t*t*t-3*t*t+1,h10=t*t*t-2*t*t+t,h01=-2*t*t*t+3*t*t,h11=t*t*t-t*t;r=h00*a[0]+h10*(b[0]-prev[0])*d/da+h01*b[0]+h11*(next[0]-a[0])*d/db;z=h00*a[1]+h10*(b[1]-prev[1])*d/da+h01*b[1]+h11*(next[1]-a[1])*d/db;}profile.push([r,z,j]);}}
 profile.push([...section.at(-1),section.length-2]);
 const N=assemblyDetail?384:1440,positions=[],indices=[];
 const grooveCenters=[-66,-22,22,66];
 for(let i=0;i<=N;i++){const theta=i/N*Math.PI*2;for(const [r0,z,j] of profile){let r=r0;if(j>=7&&j<=12){let depth=0;for(const c of grooveCenters){const d=Math.abs(z-c);depth=Math.max(depth,d<3.4?6.7:d<5.5?6.7*(5.5-d)/2.1:0);}const pitch=(theta/(2*Math.PI)*64+(z>0?.36:0)+Math.abs(z)*.013)%1;const side=Math.abs(z)>78&&Math.abs(z)<118;const centre=Math.abs(z)<75&&Math.abs(z)>29;const slit=Math.min(pitch,1-pitch);if((side||centre)&&slit<.033)depth=Math.max(depth,2.4*(1-slit/.033));r-=depth;}positions.push(r*Math.cos(theta),r*Math.sin(theta),z);}}
 const M=profile.length;for(let i=0;i<N;i++)for(let j=0;j<M-1;j++){const a=i*M+j,b=a+M;indices.push(a,b,a+1,b,b+1,a+1);}
 const tireGeo=new T.BufferGeometry();tireGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));tireGeo.setIndex(indices);tireGeo.computeVertexNormals();
 const tire=part('W02','四主溝低扁平輪胎 · 新建','W02-r3.png','SOURCE_BOUND_RECONSTRUCTION');tire.add(new T.Mesh(tireGeo,materials.rubber));
 materials.steel=new T.MeshStandardMaterial({color:0xa4a8ad,metalness:.88,roughness:.3,side:T.DoubleSide});
 materials.iron=new T.MeshStandardMaterial({color:0x72767a,metalness:.8,roughness:.49,side:T.DoubleSide});
 materials.black=new T.MeshStandardMaterial({color:0x15191a,roughness:.5,metalness:.08,side:T.DoubleSide});
 function mesh(parent,geometry,mat=materials.steel){const m=new T.Mesh(geometry,mat);parent.add(m);return m;}
 function lathe(parent,points,mat=materials.steel){const g=new T.LatheGeometry(points.map(p=>new T.Vector2(...p)),192);g.rotateX(Math.PI/2);return mesh(parent,g,mat);}
 function ring(parent,ri,ro,z0,z1,mat=materials.steel){const b=Math.min(.5,(ro-ri)/4,(z1-z0)/4);return lathe(parent,[[ri+b,z0],[ro-b,z0],[ro,z0+b],[ro,z1-b],[ro-b,z1],[ri+b,z1],[ri,z1-b],[ri,z0+b],[ri+b,z0]],mat);}
 function disk(parent,ro,ri,z0,z1,holes=[],mat=materials.steel){const s=new T.Shape();s.absarc(0,0,ro,0,Math.PI*2,false);for(const [x,y,r] of [[0,0,ri],...holes]){if(!r)continue;const h=new T.Path();h.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(h);}const g=new T.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.3,bevelThickness:.3,curveSegments:96});g.translate(0,0,z0);return mesh(parent,g,mat);}
 function item(id,name,ref,system,offset){const p=part(id,name,ref,'SOURCE_BOUND_RECONSTRUCTION');p.userData.system=system;p.userData.explode=offset||[0,0,0];return p;}
 rim.userData.system='wheel';tire.userData.system='wheel';rim.userData.explode=[0,0,210];tire.userData.explode=[0,0,210];
 const lugs=rimData.lug_centers;
 const rotor=item('B01','通風煞車碟 · 光滑摩擦面','B01.png','brake',[0,0,60]);
 ring(rotor,109,180,-38,-30,materials.iron);ring(rotor,109,180,-20,-12,materials.iron);
 disk(rotor,81,33.3,35,43,lugs.map(([x,y])=>[x,y,7]),materials.iron);
 lathe(rotor,[[79,35],[86,32],[102,-9],[110,-12],[115,-12],[106,-5],[90,36],[81,43],[79,35]],materials.iron);
 for(let k=0;k<48;k++){const s=new T.Shape();s.moveTo(109,-1.5);s.bezierCurveTo(125,0,148,12,179,13);s.lineTo(179,16);s.bezierCurveTo(148,15,125,3,109,1.5);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:10,bevelEnabled:false,curveSegments:12});g.translate(0,0,-30);g.rotateZ(k*Math.PI*2/48);mesh(rotor,g,materials.iron);}
 const hub=item('H01','輪轂法蘭與定位凸台','H01-r3.png','hub',[0,0,-65]);
 disk(hub,77,20,20,35,lugs.map(([x,y])=>[x,y,6]));ring(hub,20,33.25,35,57);lathe(hub,[[20,-65],[24.55,-65],[24.95,-64.6],[24.95,-54.10],[23.9,-54.10],[23.9,-52.05],[24.95,-52.05],[24.95,20],[20,20],[20,-65]]);ring(hub,24.95,33,14,20);
 const outer=item('H02','雙內滾道軸承外圈','H02-r4.png','bearing',[0,0,-170]);
 const centers=[-38,-8],ballR=5.8,pitchR=34;
 const op=[[43.85,-54],[44.5,-54],[45,-53.5],[45,7.5],[44.5,8],[43.85,8]];
 for(let z=8;z>=-54;z-=.25){let r=z>=5.9||z<=-51.9?43.85:36;for(const c of centers){const dz=z-c;if(Math.abs(dz)<5.48)r=Math.max(r,pitchR+Math.sqrt(5.9**2-dz**2));}op.push([r,z]);}op.push(op[0]);lathe(outer,op);
 for(let row=0;row<2;row++){
  const c=centers[row],z0=row===0?-52:-23,z1=row===0?-23:6;
  const inner=item('H03'+(row?'B':'A'),'半片內圈 '+(row+1),'H03.png','bearing',[0,0,row?10:-310]);
  const ip=[[25,z0],[25,z1],[31.5,z1]];for(let z=z1;z>=z0;z-=.25){const dz=z-c;ip.push([Math.abs(dz)<5.36?Math.min(31.5,pitchR-Math.sqrt(5.9**2-dz**2)):31.5,z]);}ip.push([25,z0]);lathe(inner,ip);
  const cage=item('H05'+row,'14 穴聚合物保持架 '+(row+1),'H05-r3.png','bearing',[0,0,row?70:-250]);
  ring(cage,32.2,35.7,c-7.5,c-6,materials.black);
  for(let k=0;k<14;k++){const a=k*Math.PI*2/14,x=pitchR*Math.cos(a),y=pitchR*Math.sin(a);const ball=item('H04-'+row+'-'+k,'鋼珠 '+(row+1)+' / '+(k+1),'H04.png','bearing',[Math.cos(a)*18,Math.sin(a)*18,row?40:-280]);const b=mesh(ball,new T.SphereGeometry(ballR,32,20));b.position.set(x,y,c);
   const cg=new T.TorusGeometry(6.4,.5,8,64,Math.PI*1.4);cg.rotateZ(Math.PI*.8);const frame=new T.Matrix4().makeBasis(new T.Vector3(-Math.sin(a),Math.cos(a),0),new T.Vector3(0,0,1),new T.Vector3(Math.cos(a),Math.sin(a),0)).setPosition(x,y,c);cg.applyMatrix4(frame);mesh(cage,cg,materials.black);
  }
  const seal=item('H06'+row,'軸承端面密封 '+(row+1),'H06-r2.png','bearing',[0,0,row?110:-350]);ring(seal,31.55,43.8,row?6.05:-53.95,row?7.95:-52.05,materials.black);
 }

 // One continuous radial surface carries the cone, wrench flats, dome and actual
 // helical bore. No open-ended hex tube is used for a closed acorn nut.
 function radialSurface(parent,stations,mat=materials.steel){
  const n=radialSegments,points=[],ix=[],rows=[];
  for(const [z,r] of stations){
   if(typeof r!=='function'&&Math.abs(r)<1e-8){rows.push([points.length/3]);points.push(0,0,z);continue;}
   const row=[];for(let k=0;k<n;k++){const a=k*2*Math.PI/n,rr=typeof r==='function'?r(a):r;row.push(points.length/3);points.push(rr*Math.cos(a),rr*Math.sin(a),z);}rows.push(row);
  }
  for(let j=0;j<rows.length-1;j++){const a=rows[j],b=rows[j+1];if(a.length===1&&b.length===1)continue;for(let k=0;k<n;k++){const t=(k+1)%n;if(a.length===1)ix.push(a[0],b[t],b[k]);else if(b.length===1)ix.push(a[k],a[t],b[0]);else ix.push(a[k],a[t],b[k],a[t],b[t],b[k]);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(ix);g.computeVertexNormals();return mesh(parent,g,mat);
 }
 function threadRadius(z,a,major=5.93,root=5.04){
  const phase=((z-57)/1.5-a/(2*Math.PI))%1, f=(phase+1)%1;
  const ridge=Math.min(1,Math.max(0,(.43-Math.abs(f-.5))/.30));
  return root+(major-root)*ridge;
 }
 function wheelStud(parent){
  const s=[[13.5,0],[13.5,7.9],[13.8,8.3],[19.6,8.3],[20,7.7],[20,6],[42.5,6],[43,5.93],[43.8,5.1]];
  for(let z=44;z<=76;z+=threadStep){const zz=z,blend=Math.min(1,(z-44)/1.5,(77-z)/1.5);s.push([z,a=>5.1+(threadRadius(zz,a)-5.1)*blend]);}
  s.push([76.5,5.25],[77,4.75],[77,0],[13.5,0]);radialSurface(parent,s);
  // Knurled press-fit section belongs inside the flange, never to the exposed thread.
  const knurl=[];for(const z of [20.2,20.45,28.7,29])knurl.push([z,a=>6+(z===20.2||z===29?0:.18)*(1+Math.cos(a*40))/2]);radialSurface(parent,knurl);
 }
 function wheelNut(parent){
  const hex=a=>Math.min(10.77,9.5/Math.cos(((a+Math.PI/6)%(Math.PI/3))-Math.PI/6));
  const s=[[54.95,7.1524],[55.18,7.2852],[60.72,10.4832],[60.92,10.5987],[61.28,a=>Math.min(10.60,hex(a))],[62.05,hex],[62.2,hex],[71.05,hex],[71.25,hex],[72.3,a=>Math.min(9.7,hex(a))],[72.7,9.2]];
  for(let k=1;k<=32;k++){const t=k*Math.PI/64;s.push([72.7+8*Math.sin(t),9.2*Math.cos(t)]);}
  s.push([78.9,0]);
  for(let k=31;k>=0;k--){const t=k*Math.PI/64;s.push([76.4+2.5*Math.sin(t),6.15*Math.cos(t)]);}
  for(let z=76.4;z>=56.8;z-=threadStep){const zz=z;s.push([z,a=>threadRadius(zz,a)+.20]);}
  s.push([56.3,5.52],[54.95,6.45],[54.95,7.1524]);radialSurface(parent,s);
  parent.userData.shapeControls={reference:'W03.png',acrossFlats:19,pitch:1.5,coneIncludedDegrees:60,closedRoofZ:78.9,studEndZ:77,truth:'SOURCE_BOUND_AUTHOR_DESIGN'};
 }
 for(let k=0;k<5;k++){
  const [x,y]=lugs[k],stud=item('H09-'+k,'輪轂螺柱 '+(k+1),'H09.png','hub',[0,0,-95]);wheelStud(stud);for(const m of stud.children)m.position.set(x,y,0);
  const nut=item('W03-'+k,'封頭錐座螺帽 '+(k+1),'W03.png','wheel',[0,0,280]);wheelNut(nut);for(const m of nut.children)m.position.set(x,y,0);
 }

 const cap=item('W04','中心飾蓋','W04.png','wheel',[0,0,310]);lathe(cap,[[0,67],[29,67],[32,70],[32,74],[31.5,75.5],[30,76.5],[27,77.2],[20,77.8],[10,78],[0,78],[0,67]],materials.cast);
 function silhouette(points){const s=new T.Shape();s.moveTo((points.at(-1)[0]+points[0][0])/2,(points.at(-1)[1]+points[0][1])/2);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];s.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2);}s.closePath();return s;}
 function shaped(parent,points,z0,z1,holes=[],mat=materials.cast,bevel=1){const s=silhouette(points);for(const [x,y,r] of holes){const h=new T.Path();h.absarc(x,y,r,0,2*Math.PI,true);s.holes.push(h);}const g=new T.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:24});g.translate(0,0,z0);return mesh(parent,g,mat);}
 function castBack(parent,outline,zMap){const contour=silhouette(outline).getPoints(16),holes=[[-76,164,5.1],[76,164,5.1],[-52,174,3.1],[52,174,3.1]].map(([x,y,r])=>Array.from({length:32},(_,k)=>new T.Vector2(x+r*Math.cos(-k*Math.PI/16),y+r*Math.sin(-k*Math.PI/16))));const faces=T.ShapeUtils.triangulateShape(contour,holes),points=[...contour,...holes.flat()];const positions=[],normals=[];
  const coarse=silhouette(outline).getPoints(12),heightCache=new Map();
  function height(x,y){let edge=Infinity;for(let i=0;i<coarse.length-1;i++){const a=coarse[i],b=coarse[i+1],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));edge=Math.min(edge,Math.hypot(x-a.x-t*dx,y-a.y-t*dy));}let factor=1-Math.exp(-edge*edge/18);for(const [hx,hy,hr] of [[-76,164,5.1],[76,164,5.1],[-52,174,3.1],[52,174,3.1]]){const d=Math.max(0,Math.hypot(x-hx,y-hy)-hr);factor*=1-Math.exp(-d*d/12);}const dome=9*(Math.exp(-((x-30)**2+(y-148)**2)/440)+Math.exp(-((x+30)**2+(y-148)**2)/440));return 25+(1.5+dome)*factor;}
  function emit(a,b,c,depth){const lengths=[a.distanceToSquared(b),b.distanceToSquared(c),c.distanceToSquared(a)],longest=Math.max(...lengths);if(depth&&longest>6.25){const edge=lengths.indexOf(longest);if(edge===0){const m=a.clone().add(b).multiplyScalar(.5);emit(a,m,c,depth-1);emit(m,b,c,depth-1);}else if(edge===1){const m=b.clone().add(c).multiplyScalar(.5);emit(a,b,m,depth-1);emit(a,m,c,depth-1);}else{const m=c.clone().add(a).multiplyScalar(.5);emit(a,b,m,depth-1);emit(m,b,c,depth-1);}return;}const sign=zMap(1)-zMap(0),cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),ordered=cross*sign>0?[a,b,c]:[a,c,b];for(const p of ordered){const key=p.x.toFixed(5)+','+p.y.toFixed(5);let v=heightCache.get(key);if(!v){const h=height(p.x,p.y),dx=(height(p.x+.15,p.y)-height(p.x-.15,p.y))/.3,dy=(height(p.x,p.y+.15)-height(p.x,p.y-.15))/.3,n=new T.Vector3(-dx,-dy,sign).normalize();v=[p.x,p.y,zMap(h),n.x,n.y,n.z];heightCache.set(key,v);}positions.push(...v.slice(0,3));normals.push(...v.slice(3));}}
  for(const f of faces)emit(...f.map(i=>points[i]),15);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));mesh(parent,g,materials.cast);
 }
 const bodyOutline=[[-86,161],[-82,181],[-60,190],[-48,176],[0,181],[48,176],[60,190],[82,181],[86,161],[77,149],[58,125],[44,118],[14,121],[0,126],[-14,121],[-44,118],[-58,125],[-77,149]];
 const padOutline=[[-59,135],[-58,157],[-49,169],[-20,176],[20,176],[49,169],[58,157],[59,135],[45,130],[25,137],[0,141],[-25,137],[-45,130]];
 const rotorMid=-25;
 for(let side=0;side<2;side++){
  const sign=side?-1:1,transformZ=z=>rotorMid+sign*(z-rotorMid);
  const body=item(side?'B03':'B02',side?'內側卡鉗半體':'外側卡鉗半體',side?'B03-r3.png':'B02-r2.png','brake',[0,0,sign*180]);
  const zA=transformZ(-1),zB=transformZ(25);shaped(body,bodyOutline,Math.min(zA,zB),Math.max(zA,zB),[[-30,148,20.4],[30,148,20.4],[-76,164,5],[76,164,5],[-52,174,3],[52,174,3]],materials.cast,1.1);
  castBack(body,bodyOutline,transformZ);
  for(const x of [-30,30]){const floor=transformZ(25);disk(body,20.4,0,Math.min(floor,transformZ(26)),Math.max(floor,transformZ(26)),[],materials.cast).position.set(x,148,0);}
  for(const x of [-69,69]){const zz=[transformZ(-25),transformZ(-1)].sort((a,b)=>a-b);shaped(body,[[x-9,183],[x+9,183],[x+11,197],[x-11,197]],zz[0],zz[1],[],materials.cast,1);}
  if(side){for(const x of [-51,51]){shaped(body,[[x-11,126],[x+11,126],[x+10,89],[x-10,89]],-78,-65,[[x,100,5.4]],materials.cast,1);}}
  const backing=item('B05-'+side,'來令片背板 '+(side+1),'B05.png','brake',[0,0,sign*125]);const bz=[transformZ(-5.5),transformZ(-1.5)].sort((a,b)=>a-b);shaped(backing,padOutline,bz[0],bz[1],[],materials.steel,.35);
  const lining=item('B04-'+side,'摩擦襯片 '+(side+1),'B04.png','brake',[0,0,sign*95]);const lz=[transformZ(-11.7),transformZ(-5.5)].sort((a,b)=>a-b);shaped(lining,padOutline.map(([x,y])=>[x*.93,150+(y-150)*.92]),lz[0],lz[1],[],materials.black,.5);
  for(let i=0;i<2;i++){const x=i?30:-30;const piston=item('B06-'+side+'-'+i,'杯狀活塞 '+(side*2+i+1),'B06-r2.png','brake',[0,0,sign*155]);lathe(piston,[[0,21],[19.7,21],[19.9,20.5],[19.9,-1],[19.3,-1.5],[16.8,-1.5],[16.8,17.8],[0,17.8],[0,21]].map(([r,z])=>[r,transformZ(z)])).position.set(x,148,0);
   const seal=item('B10-'+side+'-'+i,'活塞壓力密封 '+(side*2+i+1),'B10.png','brake',[0,0,sign*168]);const sz=[transformZ(7),transformZ(9.4)].sort((a,b)=>a-b);ring(seal,19.85,20.35,sz[0],sz[1],materials.black).position.set(x,148,0);
   const boot=item('B11-'+side+'-'+i,'活塞防塵套 '+(side*2+i+1),'B11.png','brake',[0,0,sign*142]);lathe(boot,[[19.8,-1.2],[21,-1.2],[22,0],[21.1,1.4],[22,2.7],[20.4,3.8],[19.8,3.8],[19.8,-1.2]].map(([r,z])=>[r,transformZ(z)]),materials.black).position.set(x,148,0);
  }
 }
 for(let i=0;i<2;i++){const x=i?76:-76;const bolt=item('B07-'+i,'卡鉗接合螺栓 '+(i+1),'B07.png','brake',[0,0,225]);lathe(bolt,[[0,-77],[4.8,-77],[4.8,26],[8,26],[8,33],[0,33],[0,-77]]).position.set(x,164,0);const pin=item('B12-'+i,'來令片保持插銷 '+(i+1),'B12.png','brake',[0,0,245]);lathe(pin,[[0,-77],[2.8,-77],[2.8,27],[4,27],[4,30],[0,30],[0,-77]]).position.set(i?52:-52,174,0);}
 const spring=item('B13','來令片防震彈簧','B13.png','brake',[0,45,0]);shaped(spring,[[-55,174],[-46,179],[-20,172],[0,177],[20,172],[46,179],[55,174],[49,170],[21,168],[0,173],[-21,168],[-49,170]],-25.7,-24.3,[],materials.steel,.2);
 const bleed=item('B08','放氣螺絲','B08.png','brake',[0,30,0]);const bl=lathe(bleed,[[0,0],[3,0],[3,7],[4.5,7],[4.5,10],[2.2,10],[2.2,17],[0,17],[0,0]]);bl.rotation.x=-Math.PI/2;bl.position.set(39,182,-65);
 const bleedcap=item('B09','放氣嘴防塵帽','B09.png','brake',[0,45,0]);const bc=lathe(bleedcap,[[2.3,10],[4,10],[4,18],[3,19],[0,19],[0,17],[2.3,17],[2.3,10]],materials.black);bc.rotation.x=-Math.PI/2;bc.position.set(39,182,-65);
 // Local valve frame: +Z points into the wheel barrel air space;
 // -Z enters the pressurised tire cavity. Only the copied barrel is pierced.
 const valveAngle=4*Math.PI/3,cv=Math.cos(valveAngle),sv=Math.sin(valveAngle),vu=new T.Vector3(-sv,cv,0),vv=new T.Vector3(0,0,-1),vn=new T.Vector3(-cv,-sv,0),vo=new T.Vector3(215*cv,215*sv,55);
 const valveMatrix=new T.Matrix4().makeBasis(vu,vv,vn).setPosition(vo);
 const barrel=rim.children.at(-1),old=barrel.geometry,flat=old.toNonIndexed(),pa=flat.attributes.position,na=flat.attributes.normal,newP=[],newN=[];
 function vertex(i){const p=new T.Vector3().fromBufferAttribute(pa,i),n=new T.Vector3().fromBufferAttribute(na,i),v=p.clone().sub(vo);return {p,n,x:v.dot(vu),y:v.dot(vv),z:v.dot(vn)};}
 function cut(poly,nx,ny,d,inside){const result=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=nx*a.x+ny*a.y-d,fb=nx*b.x+ny*b.y-d,ia=inside?fa<=0:fa>=0,ib=inside?fb<=0:fb>=0;if(ia)result.push(a);if(ia!==ib){const t=fa/(fa-fb);result.push({p:a.p.clone().lerp(b.p,t),n:a.n.clone().lerp(b.n,t).normalize(),x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t});}}return result;}
 function append(poly){for(let k=1;k<poly.length-1;k++)for(const v of [poly[0],poly[k],poly[k+1]]){newP.push(...v.p.toArray());newN.push(...v.n.toArray());}}
 const bore=5.6,facets=48;
 for(let i=0;i<pa.count;i+=3){let poly=[vertex(i),vertex(i+1),vertex(i+2)];if(poly.every(v=>Math.abs(v.z)>25)||Math.min(...poly.map(v=>v.x))>bore||Math.max(...poly.map(v=>v.x))<-bore||Math.min(...poly.map(v=>v.y))>bore||Math.max(...poly.map(v=>v.y))<-bore){append(poly);continue;}for(let k=0;k<facets&&poly.length;k++){const a=(k+.5)*2*Math.PI/facets,nx=Math.cos(a),ny=Math.sin(a),d=bore*Math.cos(Math.PI/facets);append(cut(poly,nx,ny,d,false));poly=cut(poly,nx,ny,d,true);}}
 const pierced=new T.BufferGeometry();pierced.setAttribute('position',new T.Float32BufferAttribute(newP,3));pierced.setAttribute('normal',new T.Float32BufferAttribute(newN,3));barrel.geometry=pierced;
 function barrelR(z,outer){const s=outer?rimData.barrel_section_r_z.slice(0,15):rimData.barrel_section_r_z.slice(15,30);for(let i=0;i<s.length-1;i++){const a=s[i],b=s[i+1];if(z>=Math.min(a[1],b[1])&&z<=Math.max(a[1],b[1])&&a[1]!==b[1])return a[0]+(b[0]-a[0])*(z-a[1])/(b[1]-a[1]);}throw Error('Valve bore outside barrel profile');}
 const wallP=[],wallI=[];for(let k=0;k<=facets;k++){const a=k*Math.PI*2/facets,x=bore*Math.cos(a),y=bore*Math.sin(a);for(const outer of [false,true]){const r=barrelR(55-y,outer),t=215-Math.sqrt(r*r-x*x),p=new T.Vector3(x,y,t).applyMatrix4(valveMatrix);wallP.push(...p.toArray());}if(k<facets){const a0=k*2;wallI.push(a0,a0+2,a0+1,a0+1,a0+2,a0+3);}}const wall=new T.BufferGeometry();wall.setAttribute('position',new T.Float32BufferAttribute(wallP,3));wall.setIndex(wallI);wall.computeVertexNormals();mesh(rim,wall,materials.cast);rim.userData.provenance='SOURCE_PRESERVED_FACE_WITH_LOCAL_BARREL_VALVE_BORE';
 const valveParts=[];function valvePart(id,name,ref,shift){const p=item(id,name,ref,'tpms',vn.clone().multiplyScalar(shift).toArray());valveParts.push(p);return p;}
 const stem=valvePart('V01','氣嘴桿與感測器固定肩','V01-r3.png',35);lathe(stem,[[2,-25],[5,-25],[6,-22],[6,-13],[9,-13],[9,-10],[5.4,-9],[5.4,10],[4.3,11],[4.3,23],[2,23],[2,-25]]);
 const rubber=valvePart('V02','氣嘴密封膠套','V02.png',15);lathe(rubber,[[5.4,-10],[8,-10],[8,-7],[7,-5],[5.55,-5],[5.55,-.1],[5.4,-.1],[5.4,-10]],materials.black);
 const washer=valvePart('V03','氣嘴墊圈','V03.png',65);ring(washer,5.65,8.5,.1,1.8);
 const locknut=valvePart('V04','氣嘴鎖緊螺帽','V04.png',85);const hex=new T.Shape();for(let k=0;k<6;k++){const a=k*Math.PI/3;k?hex.lineTo(8*Math.cos(a),8*Math.sin(a)):hex.moveTo(8*Math.cos(a),8*Math.sin(a));}hex.closePath();const hh=new T.Path();hh.absarc(0,0,5.45,0,2*Math.PI,true);hex.holes.push(hh);const hx=new T.ExtrudeGeometry(hex,{depth:6,bevelEnabled:true,bevelSize:.35,bevelThickness:.35,bevelSegments:2});hx.translate(0,0,2.2);mesh(locknut,hx);
 const valveCap=valvePart('V05','氣嘴防塵帽','V05.png',125);lathe(valveCap,[[4.4,16],[5.7,16],[5.7,27],[4.6,28],[0,28],[0,25],[4.4,25],[4.4,16]],materials.black);
 for(let k=0;k<32;k++){const a=k*2*Math.PI/32;const g=new T.CylinderGeometry(.22,.22,8,5);g.rotateX(Math.PI/2);g.translate(5.75*Math.cos(a),5.75*Math.sin(a),21.5);mesh(valveCap,g,materials.black);}
 const core=valvePart('V06','氣門芯 · 外形與芯桿','V06-exterior.png',105);lathe(core,[[0,-3],[1.6,-3],[1.6,3],[2,3],[2,8],[2.1,8],[2.1,11],[1.1,11],[1.1,18],[0,18],[0,-3]],materials.steel);
 materials.pcb=new T.MeshStandardMaterial({color:0x08704c,roughness:.5,metalness:.2,side:T.DoubleSide});materials.gold=new T.MeshStandardMaterial({color:0xc5a45c,roughness:.3,metalness:.85});
 const shell=valvePart('V07','胎壓感測器下殼 · 四柱','V07-r2.png',-10);
 const sensorOutline=[[-28,-12],[-24,-17],[24,-17],[28,-12],[28,12],[24,17],[-24,17],[-28,12]];
 const innerOutline=sensorOutline.map(([x,y])=>[x*.90,y*.85]);
 shaped(shell,sensorOutline,-43,-40,[],materials.black,.7);
 const shellShape=silhouette(sensorOutline),shellHole=silhouette(innerOutline);shellShape.holes.push(new T.Path(shellHole.getPoints(24).reverse()));const sg=new T.ExtrudeGeometry(shellShape,{depth:14,bevelEnabled:true,bevelSize:.3,bevelThickness:.3,bevelSegments:2,curveSegments:20});sg.translate(0,0,-40);mesh(shell,sg,materials.black);
 for(const x of [-20,20])for(const y of [-10,10])ring(shell,1.5,3,-40,-29,materials.black).position.set(x,y,0);
 // Side boss and interior fastener share the valve centre axis.
 const sensorBoss=ring(shell,2,7,-30,-23,materials.black);
 const lid=valvePart('V08','胎壓感測器上蓋','V08-r2.png',-105);shaped(lid,sensorOutline,-25.8,-23.3,[],materials.black,.9);
 const pcb=valvePart('V09','胎壓感測器電路板 · 四孔','V09-r3.png',-65);shaped(pcb,[[-24,-12],[24,-12],[24,12],[-24,12]],-29,-27.5,[[-20,-10,1.7],[20,-10,1.7],[-20,10,1.7],[20,10,1.7]],materials.pcb,.12);
 for(const x of [-20,20])for(const y of [-10,10])ring(pcb,1.7,2.8,-27.5,-27.25,materials.gold).position.set(x,y,0);
 const chip=new T.BoxGeometry(12,9,1.8);chip.translate(0,0,-26.6);mesh(pcb,chip,materials.black);for(const x of [-12,12])for(const y of [-6,6]){const g=new T.BoxGeometry(3,2,1);g.translate(x,y,-27);mesh(pcb,g,materials.gold);}
 const battery=valvePart('V10','鈕扣電池','V10.png',-40);ring(battery,.01,10,-38,-32.5);disk(battery,9.3,0,-32.5,-32.1);
 const screw=valvePart('V11','感測器固定螺絲','V11.png',-85);lathe(screw,[[0,-33],[3,-33],[3,-30],[1.5,-30],[1.5,-22],[0,-22],[0,-33]]);
 const sensorFrame=new T.Matrix4().makeBasis(new T.Vector3(1,0,0),new T.Vector3(0,0,-1),new T.Vector3(0,1,0)).setPosition(0,33,-45);
 for(const p of [shell,lid,pcb,battery])for(const child of p.children)if(child!==sensorBoss)child.applyMatrix4(sensorFrame);
 for(const p of valveParts){for(const child of p.children)child.applyMatrix4(valveMatrix);}
 function helix(parent,r,z0,z1,pitch,thickness,frame){const points=[];const n=Math.ceil((z1-z0)/pitch*32);for(let i=0;i<=n;i++){const z=z0+(z1-z0)*i/n,a=(z-z0)/pitch*2*Math.PI;points.push(new T.Vector3(r*Math.cos(a),r*Math.sin(a),z));}const curve=new T.CatmullRomCurve3(points);const m=mesh(parent,new T.TubeGeometry(curve,n,thickness,5,false));if(frame)m.applyMatrix4(frame);}
 helix(stem,5.45,-4,10,1,.14,valveMatrix);helix(stem,4.35,12,23,.8,.12,valveMatrix);
 for(const side of [-1,1]){const s=new T.Shape();s.moveTo(-3,-23.5);s.lineTo(3,-23.5);s.lineTo(3,-31);s.lineTo(-3,-31);s.closePath();const h=new T.Path();h.moveTo(-1.6,-26.8);h.lineTo(-1.6,-29.4);h.lineTo(1.6,-29.4);h.lineTo(1.6,-26.8);h.closePath();s.holes.push(h);const g=new T.ExtrudeGeometry(s,{depth:1.1,bevelEnabled:true,bevelSize:.18,bevelThickness:.18,bevelSegments:2});const a=g.attributes.position;for(let k=0;k<a.count;k++){const x=a.getX(k),z=a.getY(k),y=side*(17+a.getZ(k));a.setXYZ(k,x,y,z);}g.computeVertexNormals();const latch=mesh(lid,g,materials.black);latch.applyMatrix4(sensorFrame);latch.applyMatrix4(valveMatrix);const catchG=new T.BoxGeometry(5.2,1.5,1);catchG.translate(0,side*17.5,-29.6);const catchM=mesh(shell,catchG,materials.black);catchM.applyMatrix4(sensorFrame);catchM.applyMatrix4(valveMatrix);}
 shell.userData.explode=[0,0,0];lid.userData.explode=[0,0,-85];pcb.userData.explode=[0,0,-55];battery.userData.explode=[0,0,-27];
 const carrier=item('H07','輪端軸承座與安裝耳','H07.png','hub',[0,0,-250]);
 const carrierOutline=[[0,147],[15,140],[16,112],[26,84],[47,70],[63,48],[67,14],[71,-23],[95,-55],[119,-68],[127,-83],[120,-102],[105,-107],[88,-94],[62,-76],[30,-60],[0,-58],[-32,-65],[-70,-88],[-98,-101],[-118,-99],[-128,-85],[-125,-68],[-101,-58],[-77,-39],[-62,-10],[-59,25],[-44,58],[-24,78],[-14,110],[-15,133]];
 shaped(carrier,carrierOutline,-88,-72,[[0,0,45.1],[0,127,8],[-108,-82,8],[108,-85,8]],materials.cast,1.4);
 lathe(carrier,[[45.1,-72],[58,-72],[58,-59],[56,9],[53,12],[43.6,12],[43.6,8.1],[45.1,8.1],[45.1,-54],[46.5,-54],[46.5,-56.5],[45.1,-56.5],[45.1,-72]],materials.cast);
 for(const x of [-51,51]){shaped(carrier,[[x-15,35],[x+13,40],[x+12,110],[x-12,110]],-91,-79,[[x,100,5.4]],materials.cast,1.4);const bolt=item('H07-bolt-'+x,'卡鉗安裝螺栓','H07.png','hub',[0,0,-280]);lathe(bolt,[[0,-99],[8,-99],[8,-92],[5,-92],[5,-63],[0,-63],[0,-99]]).position.set(x,100,0);}
 for(const [x,y] of [[0,127],[-108,-82],[108,-85]]){ring(carrier,8,17,-93,-71,materials.cast).position.set(x,y,0);}
 const rearCap=item('H08','輪轂後端防塵杯','H08.png','hub',[0,0,-340]);lathe(rearCap,[[0,-104],[37,-104],[41,-101],[43,-97],[43,-91],[45,-90],[45,-88],[41.5,-88],[41.5,-96],[39,-100],[0,-102],[0,-104]],materials.cast);
 const spacer=item('H11','內圈定位套','H11.png','hub',[0,0,-200]);ring(spacer,25,31.5,6,14);
 function circlip(parent,kind,z){
  const s=new T.Shape();let eyes;
  if(kind==='internal'){
   const R=46.3,ri=38.4,t=.17,ai=Math.acos(-.62*R/ri);
   s.absarc(0,0,R,-Math.PI/2+t,Math.PI*1.5-t,false);
   s.lineTo(-.13*R,-.73*R);s.bezierCurveTo(-.13*R,-.60*R,-.22*R,-.51*R,-.30*R,-.54*R);
   s.bezierCurveTo(-.38*R,-.54*R,-.42*R,-.64*R,-.50*R,-.65*R);s.bezierCurveTo(-.55*R,-.66*R,-.59*R,-.61*R,-.62*R,-Math.sqrt(ri*ri-(.62*R)**2));
   s.absarc(0,0,ri,-ai,-Math.PI+ai,true);
   s.bezierCurveTo(.59*R,-.61*R,.55*R,-.66*R,.50*R,-.65*R);s.bezierCurveTo(.42*R,-.64*R,.38*R,-.54*R,.30*R,-.54*R);s.bezierCurveTo(.22*R,-.51*R,.13*R,-.60*R,.13*R,-.73*R);
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
 }
 const outerClip=item('H10','軸承外圈內卡簧','H10.png','hub',[0,0,-305]);circlip(outerClip,'internal',-55.86);
 const shaftClip=item('H12','輪轂軸外卡簧','H12-r2.png','hub',[0,0,-315]);circlip(shaftClip,'external',-53.8);
 const capSpring=item('W05','中心蓋固定彈環','W05.png','wheel',[0,0,290]);const cg=new T.TorusGeometry(31.8,.65,8,128,Math.PI*1.9);cg.translate(0,0,68);mesh(capSpring,cg,materials.steel);
 for(let k=0;k<4;k++){const angle=2.5+k*.082;const adhesive=item('W07-'+k,'平衡塊黏合層 '+(k+1),'W07.png','wheel',[0,-25,210]);const weight=item('W06-'+k,'輪圈平衡塊 '+(k+1),'W06.png','wheel',[0,-45,210]);for(const [p,depth,r,mat] of [[adhesive,.8,214.4,materials.black],[weight,3,212.5,materials.steel]]){const g=new T.BoxGeometry(16,depth,22);const m=mesh(p,g,mat);m.rotation.z=angle-Math.PI/2;m.position.set(r*Math.cos(angle),r*Math.sin(angle),-15);}}
 root.userData={revision:'SUCCESSOR-WHEEL-R4',units:'mm',tireSection:section,grooveCenters,scope:'WHEEL_END_IN_PROGRESS',wholeCarComplete:false,datums:{rimMountZ:43,rotorSeatZ:35,hubFaceZ:35,boltPCD:112,bearingBallPitchRadius:pitchR,bearingBallRadius:ballR,bearingRowCenters:centers}};
 return {root,parts,materials};
}
