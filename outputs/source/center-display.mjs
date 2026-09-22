/** Authored I05-B central display. World millimetres; root has identity pose.
 * Geometry is educational reconstruction, not electrical/automotive qualification.
 */
export function buildGT01CenterDisplay(T,materials={}){
 const root=new T.Group(),parts=[];root.name='I05-B 中央觸控顯示器';
 const definition={revision:'I05-B-R5',units:'mm',authority:'AUTHOR_RECONSTRUCTION',center:[-292,-42,735],envelope:{min:[-298,-187,679],max:[-286,103,791],size:[12,290,112]},qualified:false,electricalQualified:false,coordinates:'世界 +X朝乘員、+Y駕駛側、+Z上；內部 u=Y+42,v=Z-735,w=X+292',
  externalControl:{strategy:'REMOTE_CONTROLLER_NOT_CONSTRUCTED',pinout:'UNDEFINED',protocol:'UNSELECTED',power:'UNSELECTED',present:'幾何排線、接點與被動接收器；無可用控制電路'},
  unknown:['車身固定支架與I01接收機構未定義；目前只有保留區回裝','觸控網格、TFT、微稜鏡、導光點為作者示意，不是製程圖','LED電路、面板驅動、遠置控制器、背光電源與韌體未建','卡扣保持力、密封壓縮、熱、EMC、光學效率與車規未驗'],
  source:'references/I05-B-assembly-r1.png',
  assemblySteps:[
   {title:'後殼與接收器',parts:['I05-B-P14','I05-B-P17'],direction:'接收器由後殼內腔沿 -X 放到後壁內肩；對外接口朝 -X。',note:'保留後壁真正開口；外部控制器與車身支架未建。'},
   {title:'反射與側入光背光',parts:['I05-B-P13','I05-B-P11','I05-B-P12','I05-B-P10'],direction:'托盤由 +X 側放上後殼內肩，依序疊入反射膜、LED條與導光板。',note:'LED沿 +Z 射入導光板下長邊；LED至板側有0.5 mm空隙。'},
   {title:'光學與顯示單元',parts:['I05-B-P09','I05-B-P08','I05-B-P07','I05-B-P06'],direction:'沿 +X 疊放稜鏡膜、擴散膜、後偏光、LCD與前偏光。',note:'液晶材料層是封裝分界，不能當作維修時可逐層剝開的零件。'},
   {title:'鏡片由背面裝入前框',parts:['I05-B-P04','I05-B-P05','I05-B-P02','I05-B-P01','I05-B-P03','I05-B-P20'],direction:'前框另作子總成：鏡片及前緣膠環從框背沿+X裝入，再由背面放入獨立後壓環；觸控貼合在鏡片後方。',note:'P20不能與前框做成一體，否則286×108鏡片無法穿過281×103後開口。黏接微層是材料教學。'},
   {title:'排線與前後框殼接合',parts:['I05-B-P16','I05-B-P15','I05-B-P18'],direction:'前框子總成與後殼分開施工；排線經下缺口折向接收器，P20後壓環被鏡片背印和密封環夾持，再接合卡扣。',note:'整體拆解位移供辨認；另有鏡片裝入通路抽樣。卡扣撓曲、工具路徑與保持力未驗。'}
  ]};
 root.userData={id:'I05-B',referencePart:'I05',subPart:'I05-B',system:'interior',definition};
 const world=new T.Matrix4().set(0,0,1,-292,1,0,0,-42,0,1,0,735,0,0,0,1);
 const std=(c,r=.5,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m,side:T.DoubleSide});
 const glass=(c=0xb2c8c6,opacity=.03)=>new T.MeshPhysicalMaterial({color:c,roughness:.08,metalness:0,transparent:true,opacity,depthWrite:false,side:T.DoubleSide});
 const M={black:std(0x101718,.47),ink:std(0x050a0b,.6),alloy:materials.alloy?.clone()||std(0xa5aeb0,.37,.8),gold:std(0xb99b52,.3,.78),white:std(0xe4e8df,.67),pcb:std(0x14483c,.6),seal:std(0x283b35,.95),film:std(0x7a9790,.55),glass:glass(),oca:glass(0xe7f1eb,.012),amber:std(0x997331,.56),led:std(0xf3edd2,.5)};
 function rounded(w,h,r,hole=false,u=0,v=0){const s=hole?new T.Path():new T.Shape(),x=u-w/2,y=v-h/2;r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;}
 const ex=(s,a,b)=>{const g=new T.ExtrudeGeometry(s,{depth:b-a,bevelEnabled:false,steps:1,curveSegments:14});g.translate(0,0,a);return g;};
 const plate=(w,h,r,a,b,u=0,v=0)=>ex(rounded(w,h,r,false,u,v),a,b);
 function ring(w,h,r,iw,ih,ir,a,b){const s=rounded(w,h,r);s.holes.push(rounded(iw,ih,ir,true));return ex(s,a,b);}
 function joined(gs){const p=[],n=[],uv=[];for(const src of gs){const g=src.index?src.toNonIndexed():src;p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);if(g.attributes.uv)uv.push(...g.attributes.uv.array);else for(let i=0;i<g.attributes.position.count;i++)uv.push(0,0);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;}
 let serial=0;
 function add(n,name,g,mat,purpose,receiving,extra={}){
  const subPart='I05-B-P'+String(n).padStart(2,'0');g.computeBoundingBox();const local=g.boundingBox.clone();g.applyMatrix4(world);g.computeBoundingBox();const box=g.boundingBox,size=box.getSize(new T.Vector3()).toArray(),o=new T.Mesh(g,mat);o.name=name;
  o.userData={id:subPart+'-'+String(++serial).padStart(3,'0'),referencePart:'I05',subPart,system:'interior',reference:'references/'+subPart+'-reference-'+(n===18?'r2':n===3?'r3':'r1')+'.png',shapeSource:'獨立零件參考；尺寸及隱藏面為作者重建',referenceRegion:name,purpose,receiving,orientation:{normal:[1,0,0],up:[0,0,1],insertionDirection:[1,0,0]},authorDimensions:{units:'mm',size,bounds:{min:box.min.toArray(),max:box.max.toArray()},localBounds:{min:local.min.toArray(),max:local.max.toArray()}},physicalBoundary:'ONE_COMPONENT',material:mat.name||'作者局部材質',truth:'AUTHOR_RECONSTRUCTION',revision:definition.revision,explode:[(19-n)*9-30,0,0],...extra};
  o.castShadow=false;o.receiveShadow=false;root.add(o);parts.push(o);return o;
 }
 for(const[k,m]of Object.entries(M))m.name='I05-B / '+k;
 const layer=(n,name,w,h,a,b,mat,receiver,extra={})=>add(n,name,plate(w,h,Math.min(4,h/5),a,b),mat,'沿光軸提供'+name+'；厚度為作者模型設定。',receiver,{partKind:'BONDED_MATERIAL_LAYER',physicalBoundary:extra.partKind==='OPTICAL_COMPONENT'?'ONE_OPTICAL_COMPONENT':extra.partKind==='OPTICAL_SHEET'?'ONE_OPTICAL_SHEET':'BONDED_MATERIAL_LAYER',thickness:b-a,wInterval:[a,b],...extra});
 add(1,'透明保護鏡片',plate(286,108,10,4.5,5.7),M.glass,'保護觸控與顯示層，外形連續圓角。','I05-B-P03 面框鏡片止口',{explode:[180,0,0]}).renderOrder=20;
 add(2,'鏡片背印黑色遮蔽',ring(286,108,10,264,90,3,4.485,4.5),M.ink,'背印遮住周界貼合，中央為真實開口。','I05-B-P01 鏡片背面',{physicalBoundary:'BONDED_COATING',partKind:'BONDED_COATING',thickness:.015,explode:[180,0,0]});
 const bezelLow=rounded(290,112,12),bezelBack=rounded(290,112,12);bezelLow.holes.push(rounded(286.4,108.4,10.2,true));bezelBack.holes.push(rounded(281,103,7.5,true));for(const u of [-143.95,143.95])for(const v of [-34,34])for(const s of [bezelLow,bezelBack])s.holes.push(rounded(1.2,4.5,.1,true,u,v));
 add(3,'背面開放階差止口面框',joined([ex(bezelLow,4.5,4.7),ring(290,112,12,286.4,108.4,10.2,4.7,5.9),ring(290,112,12,282,104,8,5.9,6)]),M.black,'前止口攔住鏡片；背面286.4×108.4開口可讓鏡片穿入。後壓環已拆為P20。','I05-B-P14 後殼與P18卡扣',{explode:[220,0,0],interfaceNote:'鏡片側隙0.2/邊；前緣膠層0.2；P20獨立壓環在w4.35–4.485，避開背印材料'}); 
 add(4,'鏡片前緣黏接環',ring(286,108,10,282,104,8,5.7,5.9),M.seal,'連接鏡片與面框前止口。','P01鏡片前周界／P03止口',{physicalBoundary:'BONDED_ADHESIVE',thickness:.2,explode:[195,0,0]});
 layer(4,'鏡片觸控OCA',276,98,4.25,4.48,M.oca,'P01鏡片背面／P05觸控前面',{explode:[145,0,0]});
 layer(4,'觸控LCD透明黏合',266,92,3.75,4,M.oca,'P05觸控背面／P07前偏光',{explode:[120,0,0]});
 layer(5,'觸控後保護層',276,98,4,4.0596,M.oca,'P05 PET背面',{explode:[128,0,0]});
 layer(5,'觸控PET載體',276,98,4.0598,4.1852,M.oca,'P05雙面電極承載',{explode:[132,0,0]});
 layer(5,'觸控前保護層',276,98,4.1854,4.25,M.oca,'P05 PET正面',{explode:[136,0,0]});
 for(const [axis,a,b]of [['row',4.0596,4.0598],['column',4.1852,4.1854]]){
  const gs=[];if(axis==='row')for(let j=0;j<13;j++)gs.push(plate(266,.22,.05,a,b,0,-42+j*7));else for(let j=0;j<38;j++)gs.push(plate(.22,90,.05,a,b,-129.5+j*7));
  add(5,'觸控'+(axis==='row'?'橫列':'直欄')+'透明電極',joined(gs),new T.MeshBasicMaterial({color:0x86bbae,transparent:true,opacity:.002,depthWrite:false,side:T.DoubleSide}),'兩面分離電極圖形；未建立可用電路或感測演算法。','P05 PET不同表面',{physicalBoundary:'BONDED_PATTERNED_CONDUCTOR',thickness:b-a,electricalQualified:false,explode:[axis==='row'?130:134,0,0]});
 }
 for(const front of [true,false]){const a=front?3.55:2.3,tag=front?'前':'後',off=front?107:47;for(const [name,lo,hi,mat]of [['黏合',0,.03,M.oca],['偏光芯',.03,.17,M.film],['保護',.17,.2,M.oca]])layer(7,tag+'偏光'+name,266,92,a+lo,a+hi,mat,'P06 '+tag+'玻璃外面',{explode:[off+lo*10,0,0]});}
 layer(6,'LCD前玻璃',266,92,3.05,3.55,M.glass,'P06濾光層／P07前偏光',{explode:[93,0,0]});
 layer(6,'彩色濾光與共用電極',264,90,3.04,3.05,M.film,'P06前玻璃內面',{explode:[84,0,0]});
 layer(6,'液晶材料層',264,90,3.035,3.04,glass(0xb3c4a9,.18),'P06前後基板封合空間',{explode:[75,0,0]});
 layer(6,'TFT與像素電極示意',264,90,3.025,3.035,M.film,'P06後玻璃內面',{explode:[66,0,0],electricalQualified:false});
 layer(6,'LCD後玻璃',266,92,2.525,3.025,M.glass,'P07後偏光片',{explode:[57,0,0]});
 add(6,'LCD周界封膠',ring(266,92,4,264,90,3,3.025,3.05),M.seal,'封住液晶周界；與兩片玻璃相接。','P06前後玻璃',{physicalBoundary:'BONDED_CELL_SEAL',explode:[75,0,0]});
 layer(8,'背光擴散膜',268,92,2.05,2.25,M.white,'P09稜鏡膜前方',{partKind:'OPTICAL_SHEET',explode:[32,0,0]});
 layer(9,'稜鏡膜載體',268,92,1.8,1.98,glass(0xbed5ce,.8),'P10導光板前方',{partKind:'OPTICAL_SHEET',explode:[20,0,0]});
 const prisms=[];for(let j=0;j<45;j++){const y=-45+j*2,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-133,y,1.98,133,y,1.98,-133,y+.04,1.98,133,y+.04,1.98,-133,y+.02,2,133,y+.02,2],3));g.setIndex([0,2,1,1,2,3,0,1,4,1,5,4,2,4,3,3,4,5,0,4,2,1,3,5]);g.computeVertexNormals();prisms.push(g);}
 add(9,'微稜鏡方向示意',joined(prisms),M.white,'放大的稜線方向示意；不是實際光學節距或可製造面形。','P09膜正面',{physicalBoundary:'BONDED_MICROSTRUCTURE_ILLUSTRATION',explode:[20,0,0]});
 layer(10,'PMMA側入光導光板',268,92,.15,1.75,glass(0xb9d0c6,.8),'P11反射膜／P13托盤',{partKind:'OPTICAL_COMPONENT',explode:[5,0,0]});
 const dots=[];for(let i=0;i<31;i++)for(let j=0;j<10;j++){const g=new T.CylinderGeometry(.09+.012*j,.09+.012*j,.008,6);g.rotateX(Math.PI/2);g.translate(-126+i*8.4,-41+j*9,.146);dots.push(g);}
 add(10,'導光背面散射點示意',joined(dots),M.white,'背面點陣協助辨認導光機制；分布未經光學計算。','P10導光板背面',{physicalBoundary:'BONDED_MICROSTRUCTURE_ILLUSTRATION',explode:[5,0,0]});
 layer(11,'白色PET反射片',268,92,-.05,.1,M.white,'P13托盤底面前方',{partKind:'OPTICAL_SHEET',explode:[-10,0,0]});
 function light(g,u=0){g.rotateX(-Math.PI/2);g.translate(u,-48.4,.95);return g;}
 add(12,'側入光LED窄基板',light(plate(260,1.9,.15,-.5,0)),M.pcb,'豎立於下長邊，封裝向 +Z 射入導光板。','P13托盤下邊',{explode:[-30,0,-14],electricalQualified:false});
 add(12,'LED基板托盤黏接帶',plate(260,.5,.1,-.1,0,0,-48.65),M.seal,'0.1 mm薄黏接帶使基板下緣與托盤真正接觸。','P12基板底邊／P13托盤',{physicalBoundary:'BONDED_ADHESIVE',thickness:.1,explode:[-30,0,-14]});
 for(let k=0;k<18;k++){
  const u=-122.4+k*14.4,extra={packageInstance:k+1,physicalBoundary:'BONDED_PACKAGE_MATERIAL',electricalQualified:false,explode:[-30,0,-14]};
  add(12,'LED '+(k+1)+' 開腔封裝',light(joined([plate(3.2,1,.15,0,.15),ring(3.2,1,.15,2.6,.65,.1,.15,1.9)]),u),M.white,'封裝底與反光腔；不是外部可拆殼。','P12窄基板',extra);
  for(const sign of [-1,1])add(12,'LED '+(k+1)+' 電极'.replace('极','極')+sign,light(plate(.7,.4,.04,.15,.25,sign*.9),u),M.gold,'封裝內分離電極；電路未連通。','P12封裝底',extra);
  add(12,'LED '+(k+1)+' 晶粒',light(plate(.3,.28,.03,.25,.35),u),M.film,'晶粒作者形體，未指定半導體製程。','P12封裝底',extra);
  for(const sign of [-1,1]){const c=new T.QuadraticBezierCurve3(new T.Vector3(sign*.12,0,.35),new T.Vector3(sign*.48,0,.65),new T.Vector3(sign*.85,0,.25));add(12,'LED '+(k+1)+' 接合線'+sign,light(new T.TubeGeometry(c,10,.025,6,false),u),M.gold,'晶粒與電極之間的封装接合線。'.replace('装','裝'),'P12晶粒／電極',extra);}
  add(12,'LED '+(k+1)+' 螢光封膠',light(plate(2.6,.65,.1,.7,1.9),u),glass(0xffe4ae,.7),'封裝出光前端Z=688.5；距導光下邊0.5 mm。','P12封裝腔',extra);
 }
 // A notched outer contour avoids zero-width "holes" touching the outline.
 function notched(w,h,r,inner=null){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(-30,y);s.lineTo(-30,-43);s.lineTo(30,-43);s.lineTo(30,y);s.lineTo(w/2-r,y);s.quadraticCurveTo(w/2,y,w/2,y+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);s.closePath();if(inner)s.holes.push(rounded(...inner,true));return s;}
 // Rim split into long upper/side segments and two lower segments; all join the floor.
 const rim=new T.Shape();rim.moveTo(-30,-51);rim.lineTo(-131,-51);rim.quadraticCurveTo(-136,-51,-136,-46);rim.lineTo(-136,46);rim.quadraticCurveTo(-136,51,-131,51);rim.lineTo(131,51);rim.quadraticCurveTo(136,51,136,46);rim.lineTo(136,-46);rim.quadraticCurveTo(136,-51,131,-51);rim.lineTo(30,-51);rim.lineTo(30,-50);rim.lineTo(131,-50);rim.quadraticCurveTo(135,-50,135,-46);rim.lineTo(135,46);rim.quadraticCurveTo(135,50,131,50);rim.lineTo(-131,50);rim.quadraticCurveTo(-135,50,-135,46);rim.lineTo(-135,-46);rim.quadraticCurveTo(-135,-50,-131,-50);rim.lineTo(-30,-50);rim.closePath();const trayRim=[ex(rim,-.1,1.9)];
 add(13,'背光開口鋁托盤',joined([ex(notched(272,102,5),-.9,-.1),...trayRim]),M.alloy,'0.8 mm底面與2 mm返邊；下長邊60 mm缺口接收排線。','P14後殼內肩',{explode:[-65,0,0],interfaceNote:'光學區不穿固定柱；返邊底部與底板接合'});
 const rear=rounded(286,108,10);for(const [u,w]of [[-13,24],[15,16]])rear.holes.push(rounded(w-2,5,.5,true,u,-39));
 const shoulder=[plate(8,92,1,-1.4,-.9,-138,0),plate(8,92,1,-1.4,-.9,138,0),plate(278,3.5,.5,-1.4,-.9,0,51.25),plate(107,3.5,.5,-1.4,-.9,-84.5,-51.25),plate(107,3.5,.5,-1.4,-.9,84.5,-51.25)];
 const shellPieces=[ex(rear,-6,-5.2),ring(286,108,10,284,106,9,-5.2,3.45),ring(286,108,10,281,103,7.5,3.45,3.75),...shoulder];
 for(const [u,w]of [[-13,24],[15,16]]){const lip=ring(w+2,8,.8,w-2,5,.5,-5.2,-4.5);lip.translate(u,-39,0);shellPieces.push(lip);}for(const u of [-143.45,143.45])for(const v of [-34,34])shellPieces.push(plate(.9,5,.15,-5.2,-.8,u,v));
 add(14,'淺後殼與整合內肩',joined(shellPieces),M.black,'0.8 mm後壁、1 mm周壁、托盤內肩與卡扣承托；後壁有兩個實孔。','I01保留槽；車身固定支架未定義',{explode:[-110,0,0],physicalBoundary:'ONE_MOULDED_COMPONENT_WITH_INTEGRAL_FEATURES',interfaceNote:'端口22×5與14×5；內肩承托24×6與16×6接收器，屬作者幾何接口；並非現成連接器規格'});
 add(15,'周界密封環',ring(284,106,9,281,103,7.5,3.75,4.35),M.seal,'填在後殼台肩與獨立後壓環之間；保留中央空腔。','P14後殼台肩／P20後壓環',{explode:[155,0,0],thickness:.6,interfaceNote:'幾何兩端接觸；密封壓縮量未驗'});
 // Finite flex ribbons: width across u, curve in v/w. Layers have distinct offsets.
 function ribbon(curve,width,offset,thick,start=0,end=1){const p=[],ix=[],N=42;for(let j=0;j<=N;j++){const t=start+(end-start)*j/N,c=curve.getPoint(t),d=curve.getTangent(t),n=new T.Vector3(0,-d.z,d.y).normalize();for(const h of [offset,offset+thick])for(const side of [-1,1]){const q=c.clone().addScaledVector(n,h);q.x+=side*width/2;p.push(q.x,q.y,q.z);}}for(let j=0;j<N;j++){const a=j*4,b=a+4;for(const [i,k]of [[0,1],[1,3],[3,2],[2,0]])ix.push(a+i,a+k,b+i,a+k,b+k,b+i);}ix.push(0,2,1,1,2,3);const e=N*4;ix.push(e,e+1,e+2,e+1,e+3,e+2);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;}
 for(const [tag,u,width,front]of [['LCD',-13,18,2.53],['TOUCH',15,10,4.03]]){
  const c=new T.CatmullRomCurve3([new T.Vector3(u,tag==='LCD'?-44.5:-48,front),new T.Vector3(u,-49.2,front-.2),new T.Vector3(u,-50.4,-.4),new T.Vector3(u,-47,-3.05),new T.Vector3(u,-44,-3.05),new T.Vector3(u,-39.5,-3.05)]);
  const ext={flex:tag,explode:[-85,0,-20],electricalQualified:false};
  add(16,tag+' 排線聚醯亞胺載體',ribbon(c,width,0,.07),M.amber,'以連續彎曲帶面經下緣缺口導向後接收器。','P06或P05接點／P17插槽',{...ext,physicalBoundary:'BONDED_FLEX_LAYER',thickness:.07});
  const tracks=[];for(let j=0;j<Math.floor(width);j++){const cc=c.clone();cc.points=cc.points.map(p=>p.clone().add(new T.Vector3(-width/2+.5+j,0,0)));tracks.push(ribbon(cc,.38,.07,.018));}
  add(16,tag+' 排線銅導體圖形',joined(tracks),M.gold,'每條導體保留分離空隙；網路與針腳未定義。','P16聚醯亞胺表面',{...ext,physicalBoundary:'BONDED_PATTERNED_CONDUCTOR',thickness:.018});
  add(16,tag+' 排線覆膜',ribbon(c,width,.088,.03,.06,.85),glass(0xd5b870,.12),'覆蓋中段導體，端部保留接觸區。','P16銅導體背面',{...ext,physicalBoundary:'BONDED_FLEX_LAYER',thickness:.03});
  add(16,tag+' 端部補強',ribbon(c,width,-.15,.15,.85,1),M.white,'接收端背面補強片，避免以導體本身承托。','P16端部背面',{...ext,physicalBoundary:'BONDED_FLEX_LAYER',thickness:.15});
  const w=tag==='LCD'?24:16,meta={connector:tag,explode:[-95,0,-16],electricalQualified:false};const base=rounded(w,6,.4,false,u,-39);for(let j=0;j<Math.floor(width);j++)base.holes.push(rounded(.6,.5,.04,true,u-width/2+.5+j,-38.15));
  add(17,tag+' 排線接收器開槽本體',joined([ex(base,-4.5,-4.1),plate(w,.6,.2,-4.1,-2.75,u,-36.3),plate((w-width)/2,5.4,.2,-4.1,-2.75,u-(width/2+(w-width)/4),-39.3),plate((w-width)/2,5.4,.2,-4.1,-2.75,u+(width/2+(w-width)/4),-39.3)]),M.white,'實際插槽接收排線；機械定位示意，沒有功能控制板。','P14後壁內側，對準後壁端口',{...meta,physicalBoundary:'ONE_CONNECTOR_BODY'});
  add(17,tag+' 接收器翻蓋',joined([plate(w-1,1.5,.2,-2.75,-2.55,u,-39.9),plate(width-.2,1.5,.15,-2.95,-2.75,u,-39.9)]),M.black,'翻蓋壓持排線尾端，接點由槽底折起接裸銅；轉軸與鎖定力未驗。','P17插槽兩側支承',{...meta,physicalBoundary:'ONE_CONNECTOR_LATCH'});
  const contacts=[];for(let j=0;j<Math.floor(width);j++)contacts.push(joined([plate(.38,3.3,.05,-2.962,-2.95,u-width/2+.5+j,-39.7),plate(.38,.25,.05,-5.8,-2.95,u-width/2+.5+j,-38.15)]));
  add(17,tag+' 接收器獨立接點列',joined(contacts),M.gold,'各接點穿本體獨立孔延伸至後端口，保留間隔；外部對接插頭、配線及針腳尚未定義。','P17槽底／P16裸露導體',{...meta,physicalBoundary:'SEPARATE_CONTACT_ARRAY_NO_NETLIST'});
 }
 for(const sign of [-1,1])for(const v of [-34,34]){
  const sh=new T.Shape(),pts=[[143.4,-.8],[143.6,-.8],[143.6,4.35],[143.8,4.45],[144.15,4.45],[144.15,4.65],[143.65,4.65],[143.4,4.45]];
  pts.forEach(([u,w],i)=>i?sh.lineTo(sign*u,w):sh.moveTo(sign*u,w));sh.closePath();const g=ex(sh,-2,2);g.rotateX(Math.PI/2);g.translate(0,v,0);
  add(18,'側緣彈片 '+sign+'/'+v,g,M.alloy,'窄帶折彎彈片扣入面框局部槽，作者配合形體。','P14卡扣承托／P03側槽',{explode:[170,sign*12,0],interfaceNote:'採用r2單一窄帶折鉤；圖示比例僅形態參考，實際包絡0.75×4×5.45 mm，彈性未驗'});
 }
 function uiTexture(){
  if(typeof document==='undefined'){const tex=new T.DataTexture(new Uint8Array([9,22,21,255]),1,1);tex.needsUpdate=true;return tex;}
  const c=document.createElement('canvas');c.width=1572;c.height=528;const q=c.getContext('2d');
  q.fillStyle='#0b1918';q.fillRect(0,0,c.width,c.height);const grad=q.createLinearGradient(90,0,1100,500);grad.addColorStop(0,'#294139');grad.addColorStop(.5,'#4d6655');grad.addColorStop(1,'#101f20');q.fillStyle=grad;q.fillRect(88,0,996,528);
  q.fillStyle='#182e2a';q.beginPath();q.moveTo(88,245);q.lineTo(220,194);q.lineTo(400,246);q.lineTo(600,280);q.lineTo(880,213);q.lineTo(1084,104);q.lineTo(1084,360);q.lineTo(88,360);q.fill();
  q.strokeStyle='#91a28a';q.lineWidth=1;for(let j=0;j<12;j++){q.beginPath();q.moveTo(88,300+j*15);q.bezierCurveTo(410,280+j*16,750,320+j*14,1084,298+j*15);q.stroke();}
  q.fillStyle='rgba(4,17,17,.57)';q.fillRect(88,0,996,528);q.fillStyle='#e8ead8';q.font='21px sans-serif';q.fillText('G T / 0 1',124,48);q.font='14px sans-serif';q.fillStyle='#a6b9a4';q.fillText('MEDIA',303,47);q.fillText('SHOWROOM',929,47);
  q.fillStyle='#ecebd7';q.font='38px sans-serif';q.fillText('STILL HORIZONS',165,221);q.font='18px sans-serif';q.fillStyle='#b4c1ab';q.fillText('A F T E R L I G H T',168,258);q.font='13px sans-serif';q.fillText('A quiet journey, in full colour.',168,287);
  q.strokeStyle='#dbe2ca';q.lineWidth=2;q.beginPath();q.arc(560,388,29,0,Math.PI*2);q.stroke();q.fillStyle='#e4e8d3';q.fillRect(551,379,5,18);q.fillRect(564,379,5,18);for(const x of [455,652]){q.beginPath();q.moveTo(x,378);q.lineTo(x+17,388);q.lineTo(x,398);q.fill();}
  q.strokeStyle='#64786d';q.beginPath();q.moveTo(168,469);q.lineTo(998,469);q.stroke();q.strokeStyle='#dce3c9';q.beginPath();q.moveTo(168,469);q.lineTo(478,469);q.stroke();q.beginPath();q.arc(478,469,4,0,7);q.fill();q.font='12px sans-serif';q.fillText('01:42',168,497);q.fillText('04:28',969,497);
  q.fillStyle='#0c1a18';q.fillRect(1084,0,488,528);q.fillStyle='#a6b8a5';q.font='17px sans-serif';q.fillText('C L I M A T E',1118,48);q.strokeStyle='#395049';q.beginPath();q.moveTo(1118,74);q.lineTo(1535,74);q.stroke();
  for(const [x,name,temp]of [[1118,'PASSENGER','20.0'],[1343,'DRIVER','22.0']]){q.fillStyle='#b2c2ad';q.font='14px sans-serif';q.fillText(name,x,143);q.fillStyle='#edf0df';q.font='58px sans-serif';q.fillText(temp,x,234);q.font='19px sans-serif';q.fillText('°',x+119,208);q.font='25px sans-serif';q.fillText('−',x+11,291);q.fillText('+',x+110,291);}
  q.strokeStyle='#3e544a';q.beginPath();q.moveTo(1118,349);q.lineTo(1535,349);q.stroke();q.fillStyle='#b8c9b2';q.font='17px sans-serif';q.fillText('AUTO',1118,402);q.fillText('A/C',1488,402);q.font='13px sans-serif';q.fillText('STATIC INTERIOR PREVIEW',1118,481);
  q.fillStyle='#11221e';q.fillRect(0,0,88,528);q.strokeStyle='#a8bca5';q.lineWidth=2;for(const [i,label]of ['⌂','◇','♪','○','⚙'].entries()){q.fillStyle=i===2?'#e6e8d1':'#9cb29e';q.font='28px sans-serif';q.fillText(label,29,72+i*94);}q.fillStyle='#d8e3c0';q.fillRect(5,233,3,56);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;
 }
 const imageMat=new T.MeshBasicMaterial({map:uiTexture(),toneMapped:false});imageMat.name='I05-B 靜態展示像素';const gui=new T.PlaneGeometry(264,90);gui.translate(0,0,3.751);
 add(19,'GT01 媒體與空調靜態像素',gui,imageMat,'右側顯示駕駛22.0；僅媒體與溫度靜態設計，不傳送車輛控制。','P06 LCD顯示區',{physicalBoundary:'DISPLAYED_IMAGE_NOT_MECHANICAL_PART',partKind:'DISPLAYED_IMAGE_NOT_MECHANICAL_PART',explode:[107,0,0],functional:false});
 const retainerMaterial=std(0x535f5d,.42,.78);retainerMaterial.name='I05-B / authored coated spring steel';
 add(20,'獨立薄片後壓環',ex(bezelBack,4.35,4.485),retainerMaterial,'鏡片先從背面裝入前框，壓環再從背面放入；被鏡片背印與密封環夾持。','P02鏡片背印／P15密封環',{explode:[168,0,0],physicalBoundary:'ONE_STAMPED_SHEET_COMPONENT',thickness:.135,orientation:{normal:[1,0,0],up:[0,0,1],insertionDirection:[1,0,0]},interfaceNote:'外廓290×112，內開口281×103，四個1.2×4.5槽延續卡扣通路；材料、夾持力與製程未資格化'});
 for(const p of parts){const n=Number(p.userData.subPart.slice(-2)),o=p.userData.orientation;if([1,20].includes(n)){o.insertionDirection=[1,0,0];o.directionLabel='前框子總成裝入方向';o.directionScope='已做指定周界直線通路抽樣';}else if([3,13,15].includes(n)||n===17&&p.userData.physicalBoundary==='ONE_CONNECTOR_BODY'){o.insertionDirection=[-1,0,0];o.directionLabel='向後殼內肩定位方向';o.directionScope='名義裝配方向；尚未逐件驗證完整進入路徑';}else{o.insertionDirection=[1,0,0];o.directionLabel='層序／截面法向';o.directionScope='此向量不是可行裝拆路徑；塗層、封裝、排線及彈片各需自己的製程或路徑';}}
 root.updateMatrixWorld(true);definition.componentCount=parts.length;definition.referenceFamilies=20;
 return {root,parts,definition};
}
