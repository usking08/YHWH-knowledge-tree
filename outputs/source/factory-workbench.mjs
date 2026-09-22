/** Reference-guided author workbench. All coordinates are mm; not a load-rated product. */
export function constructWorkshopBench(T,api,parent,x,y,w=1800,d=750,withTools=true){
 const {group,box,roundBox,cylinder,beam,mesh,pipe,M,serial}=api;
 const g=group('F-BENCH-'+String(serial).padStart(2,'0'),'工作臺 '+serial+' · 中空骨架與抽屜','workstation',parent);g.position.set(x,y,0);g.userData.reference='materials/generated/GT01-Workbench-Assembly-R2.png';g.userData.teachingAssembly=true;
 g.userData.definition={widthMM:w,depthMM:d,topHeightMM:930,topThicknessMM:70,tube:[45,45,2.5],drawerCount:9,variant:'THREE_COLUMNS_THREE_ROWS',sourceVariant:'THREE_COLUMNS_ONE_ROW',status:'AUTHOR_VISUAL_ASSEMBLY'};
 function hollow(a,b,size=45,wall=2.5,name='鋼方管 · 真正中空截面'){
  const r=size/2,inner=r-wall,s=new T.Shape();s.moveTo(-r,-r);s.lineTo(r,-r);s.lineTo(r,r);s.lineTo(-r,r);s.closePath();const h=new T.Path();h.moveTo(-inner,-inner);h.lineTo(-inner,inner);h.lineTo(inner,inner);h.lineTo(inner,-inner);h.closePath();s.holes.push(h);
  const av=new T.Vector3(...a),delta=new T.Vector3(...b).sub(av),geo=new T.ExtrudeGeometry(s,{depth:delta.length(),bevelEnabled:false,steps:1,curveSegments:1}),o=mesh(g,geo,M.steel,name);o.position.copy(av);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());o.userData.feature={wallMM:wall,openingMM:size-2*wall,role:'以連續管壁傳遞荷重；內孔不是深色貼片'};return o;
 }
 roundBox(g,0,0,895,w,d,70,22,M.oakLight,'橡木桌板 · 長向順紋');
 for(const xx of [-w/2+75,w/2-75])for(const yy of [-d/2+65,d/2-65]){
  hollow([xx,yy,36],[xx,yy,860]);box(g,xx,yy,33,75,75,6,M.zinc,'腳底板');cylinder(g,xx,yy,17,10,26,M.bright,'調整腳螺桿 · 螺紋待建');cylinder(g,xx,yy,5,33,10,M.dark,'調整腳防滑底墊');
 }
 for(const yy of [-d/2+65,d/2-65])hollow([-w/2+98,yy,837.5],[w/2-98,yy,837.5],45,2.5,'長向上框方管');
 for(const xx of [-w/2+75,w/2-75])hollow([xx,-d/2+88,837.5],[xx,d/2-88,837.5],45,2.5,'短向上框方管');
 box(g,0,0,246,w-95,d-110,2,M.teal,'下層托板 · 薄板底');
 for(const yy of [-(d-110)/2,(d-110)/2])box(g,0,yy,258,w-95,2,24,M.teal,'下層托板折邊');
 for(const xx of [-(w-95)/2,(w-95)/2])box(g,xx,0,258,2,d-110,24,M.teal,'下層托板端折邊');
 // Top brackets have genuine elongated slots. Their screw is still a simplified authored fastener.
 for(const xx of [-w*.32,w*.32])for(const yy of [-d*.3,d*.3]){
  const s=new T.Shape();s.moveTo(-48,-22);s.lineTo(48,-22);s.lineTo(48,22);s.lineTo(-48,22);s.closePath();const h=new T.Path();h.absellipse(0,0,7,15,0,Math.PI*2,true);s.holes.push(h);const geo=new T.ExtrudeGeometry(s,{depth:4,bevelEnabled:false,curveSegments:24});const o=mesh(g,geo,M.zinc,'桌板固定片 · 貫通長孔');o.position.set(xx,yy,854);o.userData.feature={slotMM:[14,30],purpose:'木紋沿X；長孔沿Y允許橫紋方向的相對位移'};
  cylinder(g,xx,yy,860,3,26,M.bright,'桌板固定螺釘桿 · 外觀候選');const washerGeo=new T.RingGeometry(3.3,8,24);const wa=mesh(g,washerGeo,M.bright,'桌板螺釘墊圈 · 開孔薄面候選');wa.position.set(xx,yy,853.8);wa.rotation.x=Math.PI;const head=cylinder(g,xx,yy,850,5.5,5,M.bright,'桌板螺釘頭');
 }
 const drawers=[];
 for(let col=0;col<3;col++){
  const cx=-w*.31+col*w*.3,cw=w*.27,cd=d-120;
  box(g,cx,cd/2,560,cw,2,472,M.teal,'抽屜櫃背板');box(g,cx,0,325,cw,cd,2,M.teal,'抽屜櫃底板');
  for(const side of [-1,1])box(g,cx+side*cw/2,0,560,2,cd,472,M.teal,'抽屜櫃側板');
  for(let row=0;row<3;row++){
   const z=350+row*132,dr=new T.Group();dr.name='開口抽屜 '+col+'/'+row;dr.userData={drawer:true,axis:[0,-1,0],travelMM:Math.min(380,cd*.7),restPosition:[0,0,0],feature:'底、側、後、前板各自有厚度；空腔可見'};g.add(dr);drawers.push(dr);
   const inner=cw-40;box(dr,cx,0,z,inner,cd-24,2,M.zinc,'抽屜底板');for(const side of [-1,1])box(dr,cx+side*inner/2,0,z+48,2,cd-24,96,M.zinc,'抽屜側板');box(dr,cx,(cd-24)/2,z+48,inner,2,96,M.zinc,'抽屜後板');box(dr,cx,-(cd-24)/2,z+48,inner,2,96,M.zinc,'抽屜前內板');
   box(dr,cx,-d/2+42,z+60,w*.26,24,120,M.white,'抽屜外飾面板');for(const side of [-1,1])box(dr,cx+side*w*.055,-d/2+13,z+69,10,34,10,M.steel,'把手固定座');roundBox(dr,cx,-d/2-2,z+69,w*.12,15,13,5,M.steel,'抽屜橋式拉手');
   for(const side of [-1,1]){box(g,cx+side*(cw/2-8),0,z+48,9,cd-30,28,M.zinc,'抽屜固定側滑軌');box(dr,cx+side*(cw/2-17),0,z+48,7,cd-42,18,M.bright,'抽屜活動側滑軌');}
  }
 }
 g.userData.drawerCount=drawers.length;
 if(withTools){
  for(const xx of [-w/2+50,w/2-50])hollow([xx,d/2-35,865],[xx,d/2-35,1535],30,2,'工具板支撐方管');
  box(g,0,d/2-35,1240,w-50,5,530,M.zinc,'工具掛板 · 孔列尚未開孔');
  for(let i=0;i<8;i++){
   const xx=-w*.38+i*w*.106,yy=d/2-65;
   if(i%2){
    const shape=new T.Shape();shape.absarc(0,0,28,0,Math.PI*2,false);const h=new T.Path();for(let k=0;k<6;k++){const a=-k*Math.PI/3,px=16*Math.cos(a),py=16*Math.sin(a);k?h.lineTo(px,py):h.moveTo(px,py);}h.closePath();shape.holes.push(h);const geo=new T.ExtrudeGeometry(shape,{depth:9,bevelEnabled:true,bevelSize:1,bevelThickness:1,bevelSegments:2,curveSegments:32});const ring=mesh(g,geo,M.bright,'梅花扳手環頭 · 六角貫穿孔');ring.rotation.x=Math.PI/2;ring.position.set(xx,yy,1350);roundBox(g,xx,yy-4,1253,18,9,150,6,M.bright,'扳手柄');
   }else{
    const shaft=cylinder(g,xx,yy,1270,4,160,M.bright,'螺絲起子鋼桿');box(g,xx,yy,1350,8,2,15,M.bright,'一字起子扁刃');const grip=cylinder(g,xx,yy,1145,16,90,M.dark,'起子聚合物握柄');for(let k=0;k<6;k++){const a=k*Math.PI/3;beam(g,[xx+15*Math.cos(a),yy+15*Math.sin(a),1106],[xx+15*Math.cos(a),yy+15*Math.sin(a),1184],3,3,M.yellow,'起子握柄止滑肋');}
   }
  }
  const vx=-w*.3;roundBox(g,vx,0,958,220,260,56,18,M.teal,'虎鉗固定座');box(g,vx,75,1000,160,85,90,M.teal,'虎鉗固定鉗身');box(g,vx,-90,1000,160,65,90,M.teal,'虎鉗活動鉗身');box(g,vx,-10,970,95,180,35,M.zinc,'虎鉗活動滑塊');
  for(const yy of [29,-55])box(g,vx,yy,1046,175,9,28,M.steel,'虎鉗夾口板');
  const screw=cylinder(g,vx,-135,985,10,250,M.bright,'虎鉗絲桿 · 螺紋待建');screw.rotation.x=0;beam(g,[vx-100,-255,985],[vx+100,-255,985],12,12,M.bright,'虎鉗旋柄');
 }
 g.userData.pending=['抽屜滑軌滾珠與止擋','螺釘牙形／螺孔','工具板孔列與掛鉤','虎鉗絲桿牙形和導向配合','承載與木材濕脹量計算','製作公差與完整五金 BOM'];
 return g;
}
