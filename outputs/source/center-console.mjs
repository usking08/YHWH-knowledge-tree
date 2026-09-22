/** GT01 I03 — authored reconstruction; millimetres, -X front, +Y driver, +Z up. */
export function buildGT01Console(T, materials = {}) {
  const root = new T.Group(); root.name = 'GT01 I03 central console';
  const parts = [], partDefinitions = {};
  const local = (name,color,roughness,metalness=0) => { const m=new T.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m; };
  const mat={
    carrier:local('I03 black polymer substrate',0x111716,.67), foam:local('I03 graphite cushion',0x63655e,.96),
    leather:local('I03 source black leather',0x161c1c,.64), panel:local('I03 piano black control plate',0x0a1013,.22),
    alloy:materials.alloy?.clone()||local('I03 satin aluminium',0xb2b8ba,.3,.82), rubber:local('I03 removable soft liner',0x292b28,.93),
    steel:local('I03 steel fixture',0x686f70,.36,.8), thread:local('I03 subdued grey thread',0x78776b,.84),adhesive:local('I03 authored bond pad',0x444744,.94)
  };
  let seed=13031;const grain=new Uint8Array(128*128*4);for(let i=0;i<128*128;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=90+(seed>>>26);grain.set([v,v,v,255],i*4);}const tex=new T.DataTexture(grain,128,128,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.generateMipmaps=true;tex.minFilter=T.LinearMipmapLinearFilter;tex.needsUpdate=true;mat.leather.bumpMap=tex;mat.leather.bumpScale=.16;mat.rubber.bumpMap=tex;mat.rubber.bumpScale=.09;
  const specs=[
    ['P01','連續主骨架','承接頂板、底板與軟質包覆','I03-P04','由上方套入底板；車身固定座尚未定義','carrier',2.8],
    ['P02','主殼泡棉','分隔皮覆與骨架，提供薄軟墊','I03-P01','沿骨架外側貼合','foam',2],
    ['P03','黑色側裙皮覆','包覆鞍座連續側面與端部','I03-P02','沿泡棉母面包覆，縫合工法未驗','leather',1.2],
    ['P04','可卸底板','封閉底部並保留四個安裝通孔','I03-P01','從下方接合主骨架；車身螺栓未定義','carrier',3],
    ['P05','有孔頂板','承接控制座、雙杯架與置物箱','I03-P01','下降接合主骨架上口','carrier',3],
    ['P06','傾斜控制座','支撐既有傾角面板並保留內部空間','I03-P05','下口落入頂板前孔，接合面板下側','carrier',2.5],
    ['P07','控制面板','雙旋鈕穿軸面板，非 I05 螢幕','I03-P06','沿控制座法線接合上口','panel',2.8],
    ['P08','控制面板銀框','界定細金屬外緣，中央真正鏤空','I03-P06','由上方沿面板外緣落座','alloy',1.8],
    ['P09','旋鈕軸套','在面板通孔定位旋鈕軸','I03-P07','沿傾斜面板法線插入孔中','carrier',2.8],
    ['P10','旋鈕 D 軸','連接旋鈕帽，電氣編碼器端保留未知','I03-P09','穿過軸套，D 面朝 +X','steel',4.6],
    ['P11','旋鈕中空帽','提供滾花握持與軸的接收孔','I03-P10','沿旋鈕軸線壓入；保持力未驗','alloy',1.5],
    ['P12','杯架容器','真正有底的開口杯架，承接可卸內襯','I03-P05','容器向 -Z 插入頂板圓孔，凸緣落座','carrier',2.5],
    ['P13','杯架柔性內襯','隔音止滑與三個柔性夾持凸點','I03-P12','沿 -Z 放入杯架，可獨立抽出','rubber',1.3],
    ['P14','扶手下置物箱','扶手下實際可存放物品的凹腔','I03-P05','向 -Z 放入後方長孔，凸緣落座','carrier',2.5],
    ['P15','置物箱內襯','可抽出清潔的柔性薄層','I03-P14','向 -Z 貼合箱內壁與底部','rubber',1.2],
    ['P16','扶手內殼','支承扶手軟墊並承接鉸鏈與扣鉤','I03-P19','閉合時覆蓋置物箱；繞後緣 Y 軸轉動','carrier',2.5],
    ['P17','扶手泡棉','形成連續柔軟隆起','I03-P16','貼合內殼上面，外面接收皮覆','foam',23.3],
    ['P18','扶手黑皮覆','依原圖維持黑色軟質扶手及包邊','I03-P17','與泡棉同母面；連同扶手內殼開啟','leather',1.2],
    ['P19','鉸鏈葉片','互相交錯的固定葉與活動葉','I03-P05 / I03-P16','筒節軸線 +Y，板端分別接頂板及蓋','steel',2],
    ['P20','鉸鏈插銷','穿過相鄰鉸鏈筒節的實體銷','I03-P19','沿 +Y 穿入，維修止退方式未驗','steel',4],
    ['P21','扶手扣鉤','接合前緣頂板扣孔的作者扣鉤','I03-P16 / I03-P05','隨蓋下降進入前緣孔；解鎖機構未驗','steel',2],
    ['P22','置物口膠圈','隔離閉合蓋與箱口接觸','I03-P14','沿箱口上緣落座；壓縮量未驗','rubber',2],
    ['P23','旋鈕嵌片接合層','填合金屬承托面與黑色嵌片之間0.2 mm的間隔','I03-P11','沿面板法線貼合金屬帽頂部承托面，再接黑色嵌片；材料與剝離強度未驗','adhesive',.2]
  ];
  const rejected={P01:'圖中前開口、柱位及肋位未採用；以共同母面重建',P03:'圖中開放端拓樸改為完整連續包覆；不是皮革裁片展開',P05:'生成杯孔縱向排列退回，採作者橫向雙孔',P07:'生成縱向穿軸孔退回，沿既有 y=±42 定位',P11:'圖中近方形驅動孔退回，採與 D 軸對應的 D 孔',P16:'圖中鉸鏈與扣鉤位置退回；本件保留獨立葉片接點',P19:'示意孔距與葉片比例依共同軸線重建；螺栓規格未驗'};
  for(const [code,name,purpose,receiver,relationship,material,thickness] of specs){const id='I03-'+code;partDefinitions[id]={subPart:id,name,purpose,receiving:{subPart:receiver,relationship},material,nominalThicknessMm:thickness,reference:'references/'+id+'-reference-r1.png',referenceAdoption:{status:'AUTHOR_RECONSTRUCTION',adopted:'採用該獨立件的材料、薄壁與接合構造；作者尺寸以本模組為準',rejected:rejected[code]||'生成圖非量測；尺寸、公差、固定與材料性能未驗'},orientation:{worldAxes:{front:'-X',driver:'+Y',up:'+Z'},insertionDirection:code==='P20'?[0,1,0]:[0,0,-1]}};}
  // A single sampled outline is shared by every layer, preventing mismatched skins.
  function rr(l,w,r,cx=0,cy=0){r=Math.min(r,l/2,w/2);const s=new T.Shape(),a=cx-l/2,b=cx+l/2,c=cy-w/2,d=cy+w/2;s.moveTo(a+r,c);s.lineTo(b-r,c);s.quadraticCurveTo(b,c,b,c+r);s.lineTo(b,d-r);s.quadraticCurveTo(b,d,b-r,d);s.lineTo(a+r,d);s.quadraticCurveTo(a,d,a,d-r);s.lineTo(a,c+r);s.quadraticCurveTo(a,c,a+r,c);s.closePath();return s;}
  function hole(shape){return new T.Path(shape.getPoints(12));}
  function circle(x,y,r){const h=new T.Path();h.absarc(x,y,r,0,Math.PI*2,true);return h;}
  function plate(l,w,r,z,depth,cx=0,cy=0,holes=[]){const s=rr(l,w,r,cx,cy);s.holes.push(...holes);const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:16});g.translate(0,0,z);return g;}
  function merged(gs){const ps=[],ns=[],uvs=[];for(let g of gs){if(g.index)g=g.toNonIndexed();ps.push(...g.attributes.position.array);ns.push(...g.attributes.normal.array);uvs.push(...(g.attributes.uv?.array||new Float32Array(g.attributes.position.count*2)));}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setAttribute('normal',new T.Float32BufferAttribute(ns,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));return g;}
  // Closed section around a perimeter; profile order proceeds outside upward, then inside downward.
  function rings(profile,n=160){const pos=[],idx=[],uv=[];for(const row of profile){const [l,w,r,z,cx=0,cy=0]=row,pts=l<.01&&w<.01?Array.from({length:n},()=>({x:cx,y:cy})):rr(l,w,r,cx,cy).getSpacedPoints(n);for(let j=0;j<n;j++){const height=typeof z==='function'?z(pts[j].x,pts[j].y):z;pos.push(pts[j].x,pts[j].y,height);uv.push(j/n*16,height/35);}}
    for(let i=0;i<profile.length;i++){const k=(i+1)%profile.length;for(let j=0;j<n;j++){const jj=(j+1)%n,a=i*n+j,b=i*n+jj,c=k*n+jj,d=k*n+j;idx.push(a,b,d,b,c,d);}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
  function lathe(profile,segments=96){const g=new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),segments);g.rotateX(Math.PI/2);return g;}
  function add(code,name,g,material,extra={}){const subPart='I03-'+code,d=partDefinitions[subPart],id=subPart+'-'+String(parts.filter(p=>p.userData.subPart===subPart).length+1).padStart(2,'0');g.computeBoundingBox();const box=g.boundingBox;const m=new T.Mesh(g,material||mat[d.material]);m.name=name||d.name;m.userData={...structuredClone(d),id,referencePart:'I03',system:'interior',sourceReference:'references/GT01-details.png#lower-middle-cockpit',shapeSource:'source/center-console.mjs::'+code,authorDimensions:{unit:'mm',size:box.getSize(new T.Vector3()).toArray(),bounds:{min:box.min.toArray(),max:box.max.toArray()},notSourceMeasurements:true},physicalBoundary:{type:'finite-thickness editable mesh',nominalThicknessMm:d.nominalThicknessMm,bounds:{min:box.min.toArray(),max:box.max.toArray()}},...extra};root.add(m);parts.push(m);return m;}
  const bodyProfile=[];for(let i=0;i<=32;i++){const t=i/32,z=314.15+131.85*t,ease=t*t*(3-2*t),bulge=Math.sin(Math.PI*t);bodyProfile.push([866-66*ease+3*bulge,230-52*ease,46-7*ease,z,102-12*ease,0]);}
  function bodyLayer(offset,thick){const outer=bodyProfile.map(([l,w,r,z,cx,cy])=>[l+2*offset,w+2*offset,r+offset,z,cx,cy]);const inner=bodyProfile.slice().reverse().map(([l,w,r,z,cx,cy])=>[l+2*(offset-thick),w+2*(offset-thick),r+offset-thick,z,cx,cy]);return rings([...outer,...inner]);}
  add('P01',null,bodyLayer(0,2.8));add('P02',null,bodyLayer(2.2,2));add('P03',null,bodyLayer(3.6,1.2));
  const mountHoles=[];for(const x of [-260,465])for(const y of [-70,70])mountHoles.push(circle(x,y,4.2));
  add('P04',null,plate(860,223,43,311.15,3,102,0,mountHoles),null,{interfaces:{bodyMountHoles:[[-260,-70],[-260,70],[465,-70],[465,70]],diameter:8.4,carpetUpperSurfaceZ:311,clearanceMm:.15,status:'AUTHOR_UNVERIFIED'}});
  const panelHole=hole(rr(284,171,21,-154,0)),binHole=hole(rr(293,148,22,270,0));
  add('P05',null,plate(807,181,42,446.1,3,90,0,[panelHole,circle(43,-43,36.5),circle(43,43,36.5),binHole,hole(rr(5,18,1,121,0))]));
  const plane=(x)=>472+Math.tan(.12)*(x+154);
  add('P06',null,rings([[283,170,20,444.5,-154,0],[283,170,20,x=>plane(x),-154,0],[278,165,17.5,x=>plane(x),-154,0],[278,165,17.5,444.5,-154,0]]));
  function control(g){g.rotateY(-.12);g.translate(-154,0,476);return g;}
  add('P07',null,control(plate(272,161,18,-2.8,2.8,0,0,[circle(-5,-42,5.8),circle(-5,42,5.8)])));
  add('P08',null,control(plate(278,167,21,-3.2,1.8,0,0,[hole(rr(273,162,18.5))])));
  function knobPlace(g,y){g.translate(-5,y,0);return control(g);}
  function dShape(r,flat){const s=new T.Shape(),angle=Math.acos(flat/r);s.moveTo(flat,Math.sin(angle)*r);s.absarc(0,0,r,angle,2*Math.PI-angle,false);s.lineTo(flat,Math.sin(angle)*r);s.closePath();return s;}
  for(const y of [-42,42]){
    add('P09','旋鈕軸套 '+(y>0?'駕駛側':'乘客側'),knobPlace(lathe([[2.5,-6],[5.5,-6],[5.5,0.2],[7,0.2],[7,1.7],[2.5,1.7],[2.5,-6]]),y));
    const shaft=new T.ExtrudeGeometry(dShape(2.3,1.65),{depth:18,bevelEnabled:false,curveSegments:24});shaft.translate(0,0,-5.5);add('P10',null,knobPlace(shaft,y));
    const cap=lathe([[12.9,6],[14.6,6],[15,6.6],[15,15.5],[14,17],[11.9,17],[11.9,15.4],[12.8,15.4],[12.9,6]],128);
    const hub=new T.Shape();hub.absarc(0,0,4.7,0,Math.PI*2,false);hub.holes.push(hole(dShape(2.5,1.85)));const hubg=new T.ExtrudeGeometry(hub,{depth:8.6,bevelEnabled:false,curveSegments:32});hubg.translate(0,0,6.5);
    const roof=plate(20,20,10,15.1,1.4);const ribs=[];for(let a=0;a<Math.PI*2;a+=Math.PI/2){const g=new T.BoxGeometry(8.2,1.2,1.4);g.translate(8.5,0,15.8);g.rotateZ(a);ribs.push(g);}const teeth=[];for(let i=0;i<64;i++){const g=new T.BoxGeometry(.8,.8,7.8);g.translate(15,0,11);g.rotateZ(i*Math.PI/32);teeth.push(g);}
    const capPart=add('P11',null,knobPlace(merged([cap,hubg,roof,...ribs,...teeth]),y),null,{componentRole:'metal-knob-cap'});
    const bond=add('P23',null,knobPlace(lathe([[0,16.5],[10,16.5],[10,16.7],[0,16.7]]),y),null,{componentRole:'insert-bond-pad',reference:'references/I03-P23-reference-r3.png',partKind:'BONDED_MATERIAL_LAYER',localThicknessMm:.2,diameterMm:20,receiving:{subPart:'I03-P11',instanceId:capPart.userData.id,relationship:'底面接金屬承托面Z16.5，上面接黑色嵌片底面Z16.7；局部mm'},referenceAdoption:{adopted:'Ø20×0.20圓形接合材料層；採用單件三視圖',rejected:'採用R3材料層序與相對厚度；立體薄片及組合剖面為放大示意，不以圖幅量測。黏著劑資格與固化條件未驗'}});
    add('P11','旋鈕黑色頂部嵌片',knobPlace(lathe([[0,16.7],[11.7,16.7],[11.7,17.2],[0,17.2]]),y),mat.panel,{componentRole:'cap-top-insert',material:'panel',purpose:'封閉金屬帽頂部凹槽，提供黑色觸摸與裝飾表面；自身沒有D孔或滾花',reference:'references/I03-P11-insert-r1.png',localThicknessMm:.5,diameterMm:23.4,physicalBoundary:{type:'single solid polymer disc',nominalThicknessMm:.5},receiving:{subPart:'I03-P23',instanceId:bond.userData.id,relationship:'平底面與接合層上面Z16.7貼合；嵌在同側金屬帽頂槽，徑向名義間隙0.2 mm'},referenceAdoption:{adopted:'實心平圓片，正背無孔，Ø23.4×0.5 mm及頂槽接收關係',rejected:'圖中1:1與放大比例只作示意，不可作列印量測；實際固定另見P23。'}});
  }
  for(const y of [-43,43]){
    const cup=lathe([[0,371],[27.5,371],[29.5,373],[35.8,446.5],[38.2,449.2],[38.2,451],[33.3,451],[27,375],[0,375]]);cup.translate(43,y,0);add('P12',null,cup);
    const liner=lathe([[0,375.3],[26.6,375.3],[32.8,448.8],[32.8,450.4],[31.5,450.4],[25.3,377],[0,377]]);liner.translate(43,y,0);
    const tabs=[];for(let i=0;i<3;i++){const a=i*2*Math.PI/3,g=new T.SphereGeometry(1,20,12);g.scale(2.1,4.7,12);g.translate(28.7,0,427);g.rotateZ(a);g.translate(43,y,0);tabs.push(g);}add('P13',null,merged([liner,...tabs]));
  }
  function tub(l,w,depth,z,thick,cx=270,flange=5){return rings([[.001,.001,.0001,z-depth,cx,0],[l-14,w-14,19,z-depth,cx,0],[l,w,24,z-2,cx,0],[l+flange,w+flange,24+flange*.4,z,cx,0],[l+flange,w+flange,24+flange*.4,z+1.4,cx,0],[l-2*thick,w-2*thick,22,z+1.4,cx,0],[l-14-2*thick,w-14-2*thick,17,z-depth+thick,cx,0],[.001,.001,.0001,z-depth+thick,cx,0]]);}
  add('P14',null,tub(290,145,94,449.2,2.5));add('P15',null,tub(283.8,138.8,90.2,448.4,1.2,270,0));
  add('P22',null,plate(301,156,28,451,2,270,0,[hole(rr(295,150,25,270,0))]));
  const lidParts=[];
  const lidBaseGeometry=merged([plate(310,155,34,453.2,2.5,270,0,[hole(rr(2.5,15,1,120,0))]),...[-62,52].map(y=>plate(18,8,2,451.3,1.9,420,y,[circle(420,y,1.6)]))]);
  const lidBase=add('P16',null,lidBaseGeometry,null,{motionGroup:'armrest-lid'});lidParts.push(lidBase);
  function crown(scale,z){return [314.2*scale,159.2*scale,36*scale,z,270,0];}
  // Soft crown develops from a roundover into a shallow broad top; all layers share it.
  const crownProfile=[];for(let i=0;i<=24;i++){const theta=i/24*Math.PI/2,s=Math.max(.000001,Math.cos(theta));crownProfile.push(crown(s,456+28.4*Math.sin(theta)));}
  const foamProf=[...crownProfile,[.001,.001,.0001,456,270,0],[314.2,159.2,36,456,270,0]];
  lidParts.push(add('P17',null,rings(foamProf),null,{motionGroup:'armrest-lid'}));
  const skinOuter=crownProfile.map(([l,w,r,z,x,y])=>[l<.01?0:l+2.4,w<.01?0:w+2.4,l<.01?0:r+1.2,z+1.4,x,y]);
  const skinInner=crownProfile.slice().reverse().map(([l,w,r,z,x,y])=>[l<.01?0:l+.2,w<.01?0:w+.2,l<.01?0:r+.1,z+.2,x,y]);
  lidParts.push(add('P18',null,rings([...skinOuter,...skinInner]),null,{motionGroup:'armrest-lid'}));
  // Fine finite stitch segments belong to the skin family, each is not a hardware fastener.
  const seamPts=rr(316.3,161.3,37,270,0).getSpacedPoints(340),seams=[];
  for(let i=0;i<340;i+=2){const a=new T.Vector3(seamPts[i].x,seamPts[i].y,459.2),b=new T.Vector3(seamPts[i+1].x,seamPts[i+1].y,459.2),v=b.clone().sub(a),g=new T.CylinderGeometry(.23,.23,v.length(),6);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));g.translate(...a.add(b).multiplyScalar(.5).toArray());seams.push(g);}
  lidParts.push(add('P18','扶手皮覆細縫線',merged(seams),mat.thread,{componentRole:'leather-seam',purpose:'呈現扶手周界外露縫線；內側連續穿線與皮革孔路仍未製作',representationOnly:true,motionGroup:'armrest-lid'}));
  // Two leaf pairs share the same physical transverse pin axis. No claimed fastener specification.
  for(const y of [-57,57]){
    function leaf(moving){const leafx=moving?420:441,yc=y+(moving?-5:5);const tab=plate(19,9,2,449.2,2,leafx,yc,[circle(leafx,yc,1.6)]);const knuckle=lathe([[2.2,-4.3],[4,-4.3],[4,4.3],[2.2,4.3],[2.2,-4.3]],48);knuckle.rotateX(Math.PI/2);knuckle.translate(430,yc,452);return merged([tab,knuckle]);}
    add('P19','固定鉸鏈葉',leaf(false));const moving=add('P19','活動鉸鏈葉',leaf(true),null,{motionGroup:'armrest-lid'});lidParts.push(moving);
    const pin=lathe([[0,-13],[2,-13],[2,11],[1.7,12],[0,12],[0,-13]],48);pin.rotateX(Math.PI/2);pin.translate(430,y,452);add('P20',null,pin);
  }
  const hookShape=new T.Shape();hookShape.moveTo(118,455.7);hookShape.lineTo(122,455.7);hookShape.lineTo(122,441);hookShape.lineTo(124,441);hookShape.lineTo(124,438.5);hookShape.lineTo(120,438.5);hookShape.lineTo(120,453.7);hookShape.lineTo(118,453.7);hookShape.closePath();const hook=new T.ExtrudeGeometry(hookShape,{depth:14,bevelEnabled:false});hook.rotateX(Math.PI/2);hook.translate(0,7,0);lidParts.push(add('P21',null,hook,null,{motionGroup:'armrest-lid'}));
  root.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(root),main=new T.Box3();for(const p of parts.filter(p=>['P01','P02','P03','P04','P05'].includes(p.userData.subPart.slice(4))))main.union(new T.Box3().setFromObject(p));
  const pivot=new T.Group();pivot.name='I03-armrest-hinge';pivot.position.set(430,0,452);pivot.userData={axis:[0,1,0],closedAngle:0,illustrativeOpenAngle:.96,validation:'KINEMATIC_VISUAL_ONLY'};root.add(pivot);for(const p of lidParts){root.remove(p);pivot.add(p);p.position.set(-430,0,-452);}root.updateMatrixWorld(true);
  for(const p of parts){const d=p.userData;d.receiving.ids=parts.filter(other=>other!==p&&d.receiving.subPart.split(/\s*\/\s*/).includes(other.userData.subPart)&&(!d.receiving.instanceId||d.receiving.instanceId===other.userData.id)).map(other=>other.userData.id);if(['P06','P07','P08','P09','P10','P11','P23'].includes(d.subPart.slice(4)))d.orientation.insertionDirection=[Math.sin(.12),0,-Math.cos(.12)];if(d.componentRole==='leather-seam')d.physicalBoundary.nominalThicknessMm=.46;if(d.componentRole==='cap-top-insert')d.physicalBoundary.nominalThicknessMm=.5;}
  const definition={schema:'gt01.editable-module/v1',revision:'CONSOLE-R4',referencePart:'I03',unit:'mm',axes:{front:'-X',driver:'+Y',up:'+Z'},source:'references/GT01-details.png#lower-middle-cockpit',partDefinitions,
    envelope:{main:{min:main.min.toArray(),max:main.max.toArray()},wholeClosed:{min:box.min.toArray(),max:box.max.toArray()},authoredMainLimit:{min:[-338,-119,304],max:[542,119,473]}},
    control:{center:[-154,0,476],rotationY:-.12,shaftCenters:[[-159,-42,476],[-159,42,476]],axis:[-Math.sin(.12),0,Math.cos(.12)]},
    externalInterfaces:[{owner:'I05',center:[-292,-42,735],status:'EXTERNAL_NOT_BUILT'},{owner:'vehicle-floor',holes:[[-260,-70,311.15],[-260,70,311.15],[465,-70,311.15],[465,70,311.15]],carpetUpperSurfaceZ:311,status:'AUTHOR_UNVERIFIED'}],
    motion:{group:'I03-armrest-hinge',pivot:[430,0,452],axis:[0,1,0],illustrativeRadians:[0,.96],status:'VISUAL_KINEMATICS_NOT_LOAD_VALIDATED'},
    assemblySteps:[{title:'骨架與底部',parts:['I03-P01','I03-P04'],direction:'+Z 底板接合',note:'四個通孔保留，車身固定與螺栓尚未定義。'},{title:'軟質包覆',parts:['I03-P02','I03-P03'],direction:'外側貼合',note:'泡棉與皮覆使用同一母面；不是已驗證裁片。'},{title:'有孔頂部與控制',parts:['I03-P05','I03-P06','I03-P07','I03-P08','I03-P09','I03-P10','I03-P11','I03-P23'],direction:'-Z 與傾斜面板法線',note:'先裝軸套、D軸與中空金屬帽；頂部承托面接P23，再貼黑色嵌片。編碼器及線束未定義。'},{title:'實際收納容器',parts:['I03-P12','I03-P13','I03-P14','I03-P15','I03-P22'],direction:'-Z',note:'雙杯架、置物箱與可卸內襯均有真實壁厚及底部。'},{title:'扶手與鉸鏈',parts:['I03-P16','I03-P17','I03-P18','I03-P19','I03-P20','I03-P21'],direction:'銷 +Y，扶手繞 Y 軸',note:'分層展示為構造教學，實際工序、公差、扣鎖與壽命未驗。'}],
    unresolved:['所有尺寸是作者重建，不是 GT01 實物量測。','杯架、置物箱與背面原圖不可見，列為作者補充。','材料牌號、泡棉壓縮、皮革裁片、黏著劑、鉸鏈固定螺栓、扣鎖釋放件、旋鈕編碼器與線束尚未定義。','開蓋是剛體視覺示範；強度、耐久、人體接觸、碰撞、製造與車規均未驗。']};
  root.userData={referencePart:'I03',system:'interior',revision:definition.revision};return {root,parts,definition};
}

