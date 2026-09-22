// D09, source-bound author construction. Coordinates are mm, +Z up, -X forward.
export function buildGT01DoorTrim(T,materials,boundary){
 const root=new T.Group(),parts=[];root.name='D09 / 車門內飾';
 const plastic=materials.black.clone();plastic.roughness=.72;plastic.metalness=.025;
 const metal=materials.alloy.clone();metal.roughness=.38;
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 const shape=fn=>{const s=new T.Shape();fn(s);return s;};
 const carrier=shape(s=>{s.moveTo(-665,344);s.bezierCurveTo(-706,355,-706,460,-692,600);s.lineTo(-672,764);s.bezierCurveTo(-290,773,282,761,738,746);s.bezierCurveTo(742,665,713,440,647,352);s.bezierCurveTo(622,314,564,305,507,306);s.lineTo(-604,310);s.quadraticCurveTo(-657,312,-665,344);});
 const upper=shape(s=>{s.moveTo(-685,727);s.lineTo(-670,772);s.bezierCurveTo(-130,779,385,764,737,753);s.lineTo(731,703);s.bezierCurveTo(225,715,-210,714,-670,724);s.closePath();});
 const insert=shape(s=>{s.moveTo(-467,691);s.bezierCurveTo(-123,700,310,697,691,687);s.lineTo(653,526);s.bezierCurveTo(470,516,94,516,-204,523);s.bezierCurveTo(-275,550,-393,633,-467,663);s.quadraticCurveTo(-479,680,-467,691);});
 const arm=shape(s=>{s.moveTo(-466,655);s.bezierCurveTo(-485,668,-510,650,-495,629);s.bezierCurveTo(-414,550,-320,466,-237,464);s.lineTo(580,464);s.bezierCurveTo(626,464,655,482,650,503);s.bezierCurveTo(641,524,610,526,570,526);s.lineTo(-222,526);s.bezierCurveTo(-270,528,-397,616,-466,655);});
 const strip=shape(s=>{s.moveTo(-672,711);s.bezierCurveTo(-200,708,240,711,724,700);s.lineTo(723,712);s.bezierCurveTo(241,723,-200,720,-672,723);s.closePath();});
 const speaker=shape(s=>{s.moveTo(-650,430);s.bezierCurveTo(-654,514,-623,551,-561,549);s.bezierCurveTo(-487,545,-429,496,-386,454);s.bezierCurveTo(-368,433,-384,390,-405,373);s.lineTo(-608,371);s.quadraticCurveTo(-647,373,-650,430);});
 for(let x=-630;x<=-405;x+=11)for(let z=386;z<=532;z+=11){const pts=speaker.getPoints(48);let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){if(((pts[i].y>z)!==(pts[j].y>z))&&x<(pts[j].x-pts[i].x)*(z-pts[i].y)/(pts[j].y-pts[i].y)+pts[i].x)inside=!inside;}if(inside){const hole=new T.Path();hole.absellipse(x,z,2.5,2.5,0,Math.PI*2,true);speaker.holes.push(hole);}}
 function subdivide(g){const raw=g.index?g.toNonIndexed():g,p=raw.attributes.position,out=[];
  function tri(a,b,c,depth){const ab=a.distanceToSquared(b),bc=b.distanceToSquared(c),ca=c.distanceToSquared(a);if(depth<5&&Math.max(ab,bc,ca)>65**2){const m=a.clone().add(b).multiplyScalar(.5),n=b.clone().add(c).multiplyScalar(.5),o=c.clone().add(a).multiplyScalar(.5);tri(a,m,o,depth+1);tri(m,b,n,depth+1);tri(o,n,c,depth+1);tri(m,n,o,depth+1);}else out.push(...a,...b,...c);}
  for(let i=0;i<p.count;i+=3)tri(new T.Vector3().fromBufferAttribute(p,i),new T.Vector3().fromBufferAttribute(p,i+1),new T.Vector3().fromBufferAttribute(p,i+2),0);
  const n=new T.BufferGeometry();n.setAttribute('position',new T.Float32BufferAttribute(out,3));return n;
 }
 for(const side of [-1,1]){
  const label=side>0?'左':'右',host=new T.Group();host.position.y=-side*70;host.userData={packagingInset:70,reason:'Clear the regulator and complete glazing volume; structural inner shell still under construction'};root.add(host);
  function group(id,name){const g=new T.Group();g.name=label+'車門 '+name;g.userData={id:'DOOR-'+label+'-'+id,referencePart:id==='D10'?'D10':'D09',subPart:id,system:'doors',reference:'D09-trim-r1.png',status:'WORK_IN_PROGRESS',explode:[0,-side*180,0]};host.add(g);parts.push(g);return g;}
  function panel(parent,s,depth,thick,bevel,mat){let g=new T.ExtrudeGeometry(s,{depth:thick,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:5,curveSegments:24,steps:1});g=subdivide(g);const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),d=p.getZ(i);p.setXYZ(i,x,side*(boundary(x,z)-depth-d),z);uv.push(x/500,z/500);}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const m=new T.Mesh(g,mat);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  const base=group('D09a','內飾承載板');panel(base,carrier,43,7,5,plastic);
  const roll=group('D09b','深色柔質上沿');panel(roll,upper,57,24,9,plastic);
  const leather=group('D09c','棕色皮革插片');panel(leather,insert,57,11,7,materials.leather);
  const grab=group('D09d','拉手與肘托');panel(grab,arm,102,39,12,materials.leather);
  const trim=group('D09e','拉絲金屬飾條');panel(trim,strip,84,3,1.2,metal);
  const grille=group('D09h','穿孔揚聲器網罩');panel(grille,speaker,68,2.4,0,plastic);
  const pocket=group('D09g','中空儲物袋');
  // A U section with separate front/back walls. Its top remains open.
  const cross=shape(s=>{s.moveTo(53,441);s.lineTo(53,333);s.quadraticCurveTo(53,318,71,318);s.lineTo(124,320);s.quadraticCurveTo(161,321,173,351);s.lineTo(177,438);s.lineTo(173,438);s.lineTo(169,353);s.quadraticCurveTo(158,326,122,325);s.lineTo(73,323);s.quadraticCurveTo(58,323,58,337);s.lineTo(58,441);s.closePath();});
  let cup=new T.ExtrudeGeometry(cross,{depth:914,bevelEnabled:false,curveSegments:20,steps:48});const cp=cup.attributes.position;for(let i=0;i<cp.count;i++){const depth=cp.getX(i),z=cp.getY(i),x=cp.getZ(i)-314,bend=14*Math.sin((x+314)/914*Math.PI);cp.setXYZ(i,x,side*(boundary(x,z)-depth),z+bend);}cup.computeVertexNormals();pocket.add(new T.Mesh(cup,plastic));
  // Thin end walls close the storage cavity at each end, leaving the top opening.
  for(const x of [-314,600]){const end=shape(s=>{s.moveTo(55,438);s.lineTo(55,336);s.quadraticCurveTo(55,321,71,321);s.lineTo(124,323);s.quadraticCurveTo(160,324,171,353);s.lineTo(175,438);s.closePath();});const eg=new T.ExtrudeGeometry(end,{depth:3,bevelEnabled:false,curveSegments:16});const ep=eg.attributes.position;for(let i=0;i<ep.count;i++){const d=ep.getX(i),z=ep.getY(i),xx=x+ep.getZ(i);ep.setXYZ(i,xx,side*(boundary(xx,z)-d),z);}eg.computeVertexNormals();pocket.add(new T.Mesh(eg,plastic));}
  const controls=group('D09f','車窗開關嵌框');
  const bezel=new T.Mesh(new T.BoxGeometry(177,49,7),plastic);bezel.position.set(-104,side*(boundary(-104,532)-137),532);controls.add(bezel);
  for(let k=0;k<4;k++){const b=new T.Mesh(new T.BoxGeometry(27,31,6),k===0?metal:materials.black);b.position.set(-164+k*38,bezel.position.y,538);controls.add(b);const mark=new T.Mesh(new T.BoxGeometry(12,1.1,.7),materials.stitch);mark.position.set(b.position.x,b.position.y-5,541.5);controls.add(mark);}
  const stitching=group('D09-stitch','皮革接縫');
  for(const pts of [[[-454,667],[-287,552],[-225,515],[70,515],[350,515],[599,508]],[[-451,677],[-295,568],[-235,535],[80,534],[354,534],[616,518]]]){const p=pts.map(([x,z])=>V(x,side*(boundary(x,z)-148),z));const g=new T.TubeGeometry(new T.CatmullRomCurve3(p),100,.7,5,false);stitching.add(new T.Mesh(g,materials.stitch));}
  const clips=group('D09i','背面肋條與固定扣');
  for(const [x,z] of [[-623,699],[-379,733],[-89,730],[226,724],[546,716],[688,658],[-650,515],[-613,342],[-265,335],[95,335],[451,331],[631,395]]){
   const y=side*(boundary(x,z)-30),points=[[3,-9],[9,-9],[9,9],[3,9],[3,-9]].map(([r,h])=>new T.Vector2(r,h));const boss=new T.Mesh(new T.LatheGeometry(points,24),plastic);boss.position.set(x,y,z);clips.add(boss);
   const clip=new T.Mesh(new T.BoxGeometry(17,4,16),metal);clip.position.set(x,y+side*10,z);clips.add(clip);
  }
  for(const x of [-605,-355,-100,145,390,630])for(const [za,zb] of [[570,699],[345,459]]){
   const pts=[V(x,side*(boundary(x,za)-32),za),V(x,side*(boundary(x,zb)-32),zb)],d=pts[1].clone().sub(pts[0]),rib=new T.Mesh(new T.BoxGeometry(3.5,17,d.length()),plastic);rib.position.copy(pts[0]).add(pts[1]).multiplyScalar(.5);rib.quaternion.setFromUnitVectors(V(0,0,1),d.normalize());clips.add(rib);
  }
 }
 root.userData={revision:'D09-MODEL-R1',status:'WORK_IN_PROGRESS',reference:'D09-trim-r1.png'};
 return {root,parts};
}
