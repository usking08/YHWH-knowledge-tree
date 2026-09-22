/** I05-A authored visual instrument construction. mm; local XY front, +Z driver.
 * Material laminations remain distinct from serviceable components.
 * No production electronics, optical simulation or road-use certification.
 */
export function buildGT01Instrument(T,materials={}){
 const root=new T.Group(),parts=[];root.name='I05-A 雙圓儀表';
 const definition={revision:'I05-A-R5',units:'mm',authority:'AUTHOR_DESIGN',envelope:[352,124,54],
  worldFrontX:-288,worldCenter:[-290,350,750],mounting:{ears:[[-168.5,-40],[-168.5,40],[168.5,-40],[168.5,40]],earHole:4.5,bosses:[[-148,-45],[-148,45],[148,-45],[148,45]],bossThread:{nominalDiameter:3,pitch:.5,radialGap:.1,blindDepth:12},pcbClearanceHole:3.2},
  source:'references/I05-A-assembly-r2.png',qualified:false,
  unknown:['電路、驅動韌體、光學效率、熱與EMC資格','顯示層微結構為教學厚度，非真實面板製程','四個車身固定件及支架接合尚未完成','外殼成形與肋根實體布林接合未驗'],
  lamination:[['A04-F','前偏光片',-4.80,-4.55],['A03-GF','前玻璃基板',-5.35,-4.80],['A03-CF','彩色濾光與共用電極',-5.36,-5.35],['A03-LC','液晶層',-5.365,-5.36],['A03-TFT','薄膜電晶體與像素電極',-5.375,-5.365],['A03-GR','後玻璃基板',-5.925,-5.375],['A04-R','後偏光片',-6.175,-5.925],['A05-D','擴散膜',-6.4,-6.2],['A05-P','稜鏡膜',-6.7,-6.5],['A06','導光板',-8.8,-6.8],['A07','反射膜',-9.05,-8.85]],
  sourcePrinciples:[{url:'https://support.newhavendisplay.com/hc/en-us/articles/4413635985943-How-TFTs-Work',scope:'TFT玻璃、電晶體與像素控制的一般原理'}, {url:'https://www.displaymodule.com/blogs/knowledge/basic-structure-of-liquid-crystal-displays-lcds',scope:'偏光片、液晶、背光與濾光層的一般排列；不提供本案尺寸'}]};
 root.userData={id:'I05-A',referencePart:'I05',subPart:'I05-A',system:'interior',definition,interfaces:{referenceFrontAxis:[0,0,1],referenceUpAxis:[0,1,0]}};
 const std=(color,roughness=.5,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,side:T.DoubleSide});
 const M={polymer:std(0x1a2022,.64),mask:std(0x070b0c,.78),alloy:std(0xa7adb0,.4,.82),pcb:std(0x174e39,.64),copper:std(0xb18442,.3,.75),white:std(0xe8e9e2,.8),film:std(0x505959,.5),glass:new T.MeshPhysicalMaterial({color:0x586466,roughness:.075,metalness:.02,transparent:true,opacity:.045,depthWrite:false,side:T.DoubleSide}),edgeGlass:std(0x203133,.22,.05),led:new T.MeshStandardMaterial({color:0xf6eac9,emissive:0xffe6ad,emissiveIntensity:.5}),seal:std(0x303c38,.9),display:std(0x071010,.65)};
 function rounded(w,h,r,hole=false,cx=0,cy=0){const s=hole?new T.Path():new T.Shape(),x=cx-w/2,y=cy-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;}
 function circle(x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);return p;}
 function extrude(s,z0,z1,segments=18){const g=new T.ExtrudeGeometry(s,{depth:z1-z0,steps:1,bevelEnabled:false,curveSegments:segments});g.translate(0,0,z0);return g;}
 function ring(w,h,r,iw,ih,ir,z0,z1){const s=rounded(w,h,r);s.holes.push(rounded(iw,ih,ir,true));return extrude(s,z0,z1);}
 function plate(w,h,r,z0,z1){return extrude(rounded(w,h,r),z0,z1);}
 // The same helix field defines mating male and female surfaces.
 const threadRadius=(z,a)=>{const phase=((z/.5-a/(2*Math.PI))%1+1)%1;return 1.225+.275*Math.min(1,Math.max(0,(.45-Math.abs(phase-.5))/.35));};
 function revolvedField(z0,z1,outer,inner=()=>0,steps=32){
  const ns=64,p=[],ix=[],solid=inner(z0,0)===0&&inner(z1,0)===0;
  for(const fn of solid?[outer]:[outer,inner])for(let j=0;j<=steps;j++)for(let i=0;i<ns;i++){const z=z0+(z1-z0)*j/steps,a=2*Math.PI*i/ns,r=fn(z,a);p.push(r*Math.cos(a),r*Math.sin(a),z);}
  const off=(steps+1)*ns;
  for(let j=0;j<steps;j++)for(let i=0;i<ns;i++){const a=j*ns+i,b=j*ns+(i+1)%ns,c=a+ns,d=b+ns;ix.push(a,b,c,b,d,c);if(!solid)ix.push(off+a,off+c,off+b,off+b,off+c,off+d);}
  for(const j of [0,steps]){const center=p.length/3;if(solid)p.push(0,0,j===0?z0:z1);for(let i=0;i<ns;i++){const a=j*ns+i,b=j*ns+(i+1)%ns;if(solid){j===0?ix.push(a,center,b):ix.push(a,b,center);}else if(j===0)ix.push(a,off+a,b,b,off+a,off+b);else ix.push(a,b,off+a,b,off+b,off+a);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;
 }

 function joined(gs){const p=[],n=[],uv=[];for(const src of gs){const g=src.index?src.toNonIndexed():src;for(const x of g.attributes.position.array)p.push(x);for(const x of g.attributes.normal.array)n.push(x);if(g.attributes.uv)for(const x of g.attributes.uv.array)uv.push(x);else for(let i=0;i<g.attributes.position.count;i++)uv.push(0,0);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;}
 let count=0;
 function add(id,name,g,mat,purpose,extra={}){const o=new T.Mesh(g,mat);o.name=name;o.castShadow=o.receiveShadow=true;o.userData={id:'I05-'+id+'-'+(++count),subPart:'I05-'+id,referencePart:'I05',system:'interior',purpose,physicalBoundary:'ONE_COMPONENT_OR_DECLARED_MATERIAL_LAYER',reference:definition.source,truth:'AUTHOR_DESIGN',revision:definition.revision,explode:[0,0,0],...extra};g.computeBoundingBox();root.add(o);parts.push(o);return o;}
 const lens=add('A01','儀表透明鏡片',plate(344,116,14,-4,-2),M.glass,'保護顯示層；從面框背面沿+Z裝入。',{reference:'references/I05-A01-cover-r3.png',explode:[0,0,100]});lens.renderOrder=20;
 add('A01-MASK','鏡片背面黑色印刷',ring(344,116,14,314,92,4,-4.015,-4),M.mask,'遮蔽周界黏接與內部邊緣；印刷層不是另塊玻璃。',{reference:'references/I05-A01-cover-r3.png',partKind:'BONDED_COATING',explode:[0,0,100]});
 add('A02','儀表階差面框',joined([ring(352,124,18,344.4,116.4,14.2,-4,-1.8),ring(352,124,18,340,112,12,-1.8,2)]),M.polymer,'背面344.4×116.4容納鏡片；前方較小開口形成止口。',{reference:'references/I05-A02-bezel-r3.png',explode:[0,0,130],interfaceNote:'背面插入；側隙0.2/邊，前膠層0.2'});
 add('A01-BOND','鏡片前緣黏接層',ring(344,116,14,340,112,12,-2,-1.8),M.seal,'填入鏡片前面與面框止口之間的0.2間隙。',{reference:'references/I05-A01-bond-r1.png',partKind:'BONDED_MATERIAL_LAYER',explode:[0,0,110]});
 add('A13','光學周緣遮光框',ring(320,110,13,316,94,4,-4.55,-4.3),M.mask,'遮蔽較小LCD的周緣，保留真正顯示開口。',{reference:'references/I05-A13-light-mask-r3.png',explode:[0,0,75]});
 for(const[id,name,z0,z1]of definition.lamination){const isGlass=id.includes('G')||id==='A06',mat=id==='A04-F'?M.display:id==='A07'?M.white:id.startsWith('A05')?std(id==='A05-D'?0xd6ded5:0xb2c9c4,.42):id==='A03-CF'?M.display:id==='A03-LC'?std(0x92aea4,.45):isGlass?M.edgeGlass:M.film;
  add(id,name,plate(...(['A03-CF','A03-LC','A03-TFT'].includes(id)?[314,92,3]:[316,94,4]),z0,z1),mat,'顯示光路的一層；依共同外廓与前後座標回裝。'.replace('与','與'),{partKind:id.startsWith('A03')?'BONDED_CELL_LAYER':'OPTICAL_LAYER',thickness:z1-z0,zInterval:[z0,z1],explode:[0,0,55-definition.lamination.findIndex(a=>a[0]===id)*12],reference:id.startsWith('A03')?'references/I05-A03-cell-r2.png':id.startsWith('A04')?'references/I05-A04-polarizers-r2.png':id.startsWith('A05')?'references/I05-A05-optical-films-r1.png':id==='A06'?'references/I05-A06-lightguide-r2.png':id==='A07'?'references/I05-A07-reflector-r1.png':definition.source});
 }
 add('A03-SEAL','液晶單元周界封膠',ring(316,94,4,314,92,3,-5.375,-5.35),M.seal,'包住液晶層邊界，與两片玻璃相接。'.replace('两','兩'),{reference:'references/I05-A03-cell-r2.png',partKind:'BONDED_CELL_LAYER',explode:[0,0,20]});
 // Canvas is the native display reader, not a substitute for component shape.
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1580;c.height=470;const q=c.getContext('2d');q.fillStyle='#071012';q.fillRect(0,0,c.width,c.height);q.strokeStyle='#486269';q.lineWidth=2;const dial=(cx,title,unit,steps)=>{const cy=234,r=192;q.strokeStyle='#567174';q.beginPath();q.arc(cx,cy,r,.72*Math.PI,2.28*Math.PI);q.stroke();for(let k=0;k<=steps;k++){const a=.72*Math.PI+k/steps*1.56*Math.PI,major=k%5===0,r0=major?r-23:r-12;q.strokeStyle=major?'#e8eee7':'#738d89';q.lineWidth=major?3:1.4;q.beginPath();q.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);q.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);q.stroke();}q.fillStyle='#edf0e6';q.font='80px sans-serif';q.textAlign='center';q.fillText('0',cx,256);q.font='22px sans-serif';q.fillStyle='#9ebbb0';q.fillText(unit,cx,292);q.font='19px sans-serif';q.fillText(title,cx,352);};dial(320,'SPEED','km/h',50);dial(1260,'POWER','kW',40);q.fillStyle='#9db6a7';q.textAlign='center';q.font='21px sans-serif';q.fillText('GT  /  01',790,94);q.fillStyle='#d4e4d5';q.font='48px sans-serif';q.fillText('P',790,245);q.font='22px sans-serif';q.fillText('READY',790,286);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.MeshBasicMaterial({map:tex,toneMapped:false});const g=new T.PlaneGeometry(312,90);g.translate(0,0,-4.54);add('A03-IMAGE','儀表像素顯示',g,m,'目前展示0km/h、0kW；顯示內容，不是車輛遙測。',{partKind:'DISPLAYED_IMAGE_NOT_MECHANICAL_PART',explode:[0,0,55]});}
 const tray=rounded(319,104,5);
 add('A09','背光鋁托盤',joined([extrude(tray,-10.05,-9.05),ring(319,104,5,317,102,4,-9.05,-6.6)]),M.alloy,'底面由後殼內肩承托，周界返邊定位導光層；不使用侵入光學層的固定孔。',{reference:'references/I05-A09-tray-r1.png',explode:[0,0,-100]});
 const ledShape=rounded(305,2.25,.25);for(const x of [-150,150])ledShape.holes.push(circle(x,0,.4));
 function lightTransform(g,x=0){g.rotateX(-Math.PI/2);g.translate(x,-49.5,-7.925);return g;}
 add('A08-BOARD','側射LED條基板',lightTransform(extrude(ledShape,-.6,0)),M.pcb,'豎立於托盤底面，發光面沿+Y對準導光板下長邊。',{reference:'references/I05-A08-led-strip-r1.png',explode:[0,-30,-80],receiving:'A09托盤；底部Z=-9.05'});
 for(let k=0;k<24;k++){
  const x=-143.75+k*12.5,meta={reference:'references/I05-A08-led-strip-r1.png',explode:[0,-30,-80],packageInstance:k+1,physicalBoundary:'BONDED_PACKAGE_MATERIAL',electricalQualified:false};
  const g=joined([plate(3.2,1,.15,0,.15),ring(3.2,1,.15,2.6,.65,.1,.15,2)]);
  add('A08-CASE','LED '+(k+1)+' 封裝腔殼',lightTransform(g,x),M.white,'承托晶粒與接腳；前方真實開腔，屬封裝材料界線。',meta);
  for(const sx of [-1,1]){const q=plate(.7,.4,.05,.15,.25);q.translate(sx*.9,0,0);add('A08-LEADS','LED '+(k+1)+' 獨立電極 '+(sx<0?'左':'右'),lightTransform(q,x),M.copper,'分離電極的形體示意；每個電極為獨立材料界線，未作电性選型。'.replace('电','電'),meta);}
  add('A08-DIE','LED '+(k+1)+' 半導體晶粒',lightTransform(plate(.3,.28,.03,.25,.35),x),M.display,'封裝內晶粒的作者形體，用於辨認構造，不代表晶片製程。',meta);
  for(const sx of [-1,1]){const curve=new T.QuadraticBezierCurve3(new T.Vector3(sx*.12,0,.35),new T.Vector3(sx*.48,0,.65),new T.Vector3(sx*.85,0,.25));add('A08-WIRE','LED '+(k+1)+' 接合線 '+(sx<0?'左':'右'),lightTransform(new T.TubeGeometry(curve,12,.025,6,false),x),M.copper,'晶粒端點與各自電極的獨立接合線；不是外部跳線。',meta);}
  const enc=M.led.clone();enc.transparent=true;enc.opacity=.6;enc.depthWrite=false;
  add('A08-ENCAP','LED '+(k+1)+' 螢光封膠',lightTransform(plate(2.6,.65,.1,.7,2),x),enc,'光由前面沿+Y射向導光板；前端Y=-47.5，距入光邊0.5 mm。',meta);
 }

 const board=rounded(306,98,5);for(const[x,y]of definition.mounting.bosses)board.holes.push(circle(x,y,1.6));
 const boardLayers=[['A10-MASK-R','控制板後防焊層',-20,-19.98,M.pcb],['A10-CU-R','控制板後銅箔',-19.98,-19.945,M.copper],['A10-BOARD','控制板FR4芯材',-19.945,-18.455,std(0xb7aa83,.8)],['A10-CU-F','控制板前銅箔',-18.455,-18.42,M.copper],['A10-MASK-F','控制板前防焊層',-18.42,-18.4,M.pcb]];
 for(const[id,name,z0,z1,mat]of boardLayers)add(id,name,extrude(board,z0,z1),mat,'共同四孔的板材材料層；總厚1.6，芯材1.49，兩面各0.035銅箔與0.02防焊。厚度為作者教學設定，尚無電路。',{reference:'references/I05-A10-board-layers-r2.png',partKind:'BONDED_BOARD_LAYER',zInterval:[z0,z1],explode:[0,0,-145-(boardLayers.findIndex(a=>a[0]===id)-2)*6],electricalQualified:false});
 // Rear housing: coherent moulded envelope and integrated feature geometry.
 const rear=rounded(326,116,16);rear.holes.push(rounded(14,8,1,true));
 const shell=[extrude(rear,-52,-49.5),ring(326,116,16,321,111,13.5,-49.5,-6),ring(321,111,13.5,317,102,4,-14,-10.05)];
 for(const[x,y]of definition.mounting.ears){const s=new T.Shape();s.absarc(x,y,7.5,0,Math.PI*2,false);s.holes.push(circle(x,y,2.25));shell.push(extrude(s,-52,-49.5));}
 for(const[x,y]of definition.mounting.bosses){
  const bottom=new T.Shape();bottom.absarc(x,y,4.5,0,Math.PI*2,false);shell.push(extrude(bottom,-49.5,-32));
  const boss=revolvedField(-32,-20,()=>4.5,(z,a)=>threadRadius(z,a)+.1,384);boss.translate(x,y,0);shell.push(boss);
  const shaft=revolvedField(-30,-18.4,(z,a)=>threadRadius(z,a)*Math.min(1,.72+(z+30)/.3),()=>0,372);
  const head=new T.Shape();head.absarc(0,0,2.75,0,Math.PI*2,false);
  const socket=new T.Path(),rh=2.5/Math.sqrt(3);for(let k=0;k<6;k++){const a=k*Math.PI/3;k?socket.lineTo(rh*Math.cos(a),rh*Math.sin(a)):socket.moveTo(rh*Math.cos(a),rh*Math.sin(a));}socket.closePath();head.holes.push(socket);
  const disc=new T.Shape();disc.absarc(0,0,2.75,0,Math.PI*2,false);
  const headParts=[extrude(disc,-18.4,-17,48),extrude(head,-17,-15.8,48)];for(const hg of headParts){const p=hg.attributes.position,n=hg.attributes.normal;for(let v=0;v<p.count;v++){const r=Math.hypot(p.getX(v),p.getY(v));if(r>2.74&&Math.abs(n.getZ(v))<.1)n.setXYZ(v,p.getX(v)/r,p.getY(v)/r,0);}}const screw=joined([shaft,...headParts]);screw.translate(x,y,0);
  add('A12','控制板內六角固定螺釘',screw,M.alloy,'沿−Z穿過PCB的Ø3.2孔，旋入後殼盲孔；頭部端面壓住PCB前面。',{reference:'references/I05-A12-pcb-screw-r1.png',explode:[0,0,-118],receiver:'I05-A10-BOARD / I05-A11',thread:{diameter:3,pitch:.5,length:11.6,socketAF:2.5,socketDepth:1.2,headDiameter:5.5,headHeight:2.6,axis:[0,0,1],radialGap:.1},physicalBoundary:'ONE_CONTINUOUS_METAL_PART',manufacturingQualified:false});
 }
 for(const x of [-102,-51,51,102]){const g=plate(1.4,101,.5,-49.5,-44);g.translate(x,0,0);shell.push(g);}for(const y of [-24,24]){const g=plate(307,1.4,.5,-49.5,-44);g.translate(0,y,0);shell.push(g);}
 add('A11','儀表後殼與一體耳肋',joined(shell),M.polymer,'前方開腔、後方接口、四外耳、四螺柱與一體肋；非多塊盒子堆疊。',{reference:'references/I05-A11-rear-housing-r3.png',explode:[0,0,-190],featureUnion:'SURFACE_FEATURES_MERGED_NOT_BOOLEAN_QUALIFIED'});
 add('A14','後殼與鏡片周緣接合環',ring(326,116,16,321,111,13.5,-6,-4.015),M.seal,'承接後殼前口與鏡片後印刷區，名義厚度1.985 mm。',{reference:'references/I05-A14-case-seal-r3.png',partKind:'BONDED_MATERIAL_LAYER',explode:[0,0,85]});
 const relations={
  A01:['A02',[0,0,1],'由面框背面裝入，鏡片前面貼0.2 mm接合層'],
  'A01-MASK':['A01',[0,0,1],'鏡片背面印刷，屬附著塗層'],
  'A01-BOND':['A02',[0,0,1],'接合環填入鏡片前面與面框止口'],
  A02:['A01',[0,0,-1],'周界止口與鏡片前緣相接'],
  A13:['A03-GF',[0,0,-1],'光學周界遮光，中央孔保持顯示區開放'],
  A14:['A11',[0,0,-1],'後殼前端承接環底面，環頂面承接鏡片後印刷'],
  A09:['A11',[0,0,-1],'托盤底面置於後殼一體內肩'],
  'A10-BOARD':['A11',[0,0,-1],'板背面放在四個盲孔螺柱頂端'],
  A11:['I01-P11',[0,0,-1],'外耳對應儀表接收U架，固定支架與螺栓尚未完成；此方向為局部組合方向'],
  A12:['A10-BOARD',[0,0,-1],'穿過板孔旋入後殼，轉一圈軸向前進0.5 mm']
 };
 const parentLayer=id=>{const k=definition.lamination.findIndex(a=>a[0]===id);return k<0?'A03-GF':definition.lamination[k+1]?.[0]||'A09';};
 definition.partDefinitions={};
 relations['A08-BOARD']=['A09',[0,0,-1],'LED基板底面由托盤承托，發光沿+Y進入導光板'];
 for(const m of parts){const key=m.userData.subPart.replace('I05-',''),row=relations[key]||(key.startsWith('A10-')?['A10-BOARD',[0,0,-1],'板材壓合材料界線；各層共用四孔與外廓']:key.startsWith('A08')?['A08-BOARD',[0,1,0],'LED材料界線用於封裝教學；整條沿下長邊定位，不是可拆修的內部件']:[parentLayer(key),[0,0,-1],'依光學層序與共同外廓定位；貼合層不宣稱可拆修']);
  m.userData.receiving={subPart:row[0].startsWith('I01')?row[0]:'I05-'+row[0],relationship:row[2]};m.userData.orientation={basis:'LOCAL_XY_FRONT_Z_TO_VIEWER_MM',insertionDirection:row[1],status:'AUTHOR_SEQUENCE_NOT_COMPLETE_SERVICE_PATH'};
  if(key==='A11')Object.assign(m.userData.receiving,{instanceId:'I01-P11-018',instanceRole:'driver-screen-receiver',expectedWorldCenterY:350,connectionState:'MOUNTING_HARDWARE_NOT_BUILT'});
  const b=m.geometry.boundingBox;m.userData.authorDimensions={size:b.getSize(new T.Vector3()).toArray(),min:b.min.toArray(),max:b.max.toArray(),units:'mm'};
  if(key.startsWith('A08-')&&key!=='A08-BOARD')m.userData.explode=[0,-30-(['CASE','LEADS','DIE','WIRE','ENCAP'].indexOf(key.slice(4)))*7,-80];
  if(!definition.partDefinitions[key])definition.partDefinitions[key]={name:m.name,reference:m.userData.reference,purpose:m.userData.purpose,receiving:m.userData.receiving,orientation:m.userData.orientation,kind:m.userData.partKind||m.userData.physicalBoundary,quantity:0};definition.partDefinitions[key].quantity++;
 }
 root.userData.definition=definition;return{root,parts,definition};
}
