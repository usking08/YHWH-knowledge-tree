/** GT01 I04 steering wheel, I04-R5.
 * Editable visual reconstruction, millimetres. XY wheel plane, +Y up, +Z driver.
 * Supplied cockpit source establishes identity; all dimensions and hidden faces
 * are AUTHOR_DESIGN. No airbag, electrical, strength or road-use certification.
 * No external imports: pass the project's own Three.js module as T.
 */
export function buildGT01Steering(T, materials = {}) {
  const root = new T.Group(), parts = [];
  root.name = 'I04 / GT01 三輻方向盤';
  const definition = {
    schema:'gt01.steering-definition/v1',revision:'I04-R5',units:'mm',
    referencePart:'I04',system:'interior',truth:'AUTHOR_DESIGN',
    axes:{plane:'XY',up:'+Y',driver:'+Z',shaft:'-Z'},origin:'輪圈幾何中心',
    dimensions:{outsideDiameter:340,gripRadial:36,gripAxial:32,
      airbagWidth:116,airbagHeight:116,assemblyDepthLimit:80,
      mountingBoreNominal:22,hubRearZ:-44,hubFrontZ:-10,airbagFrontZ:29},
    source:'references/GT01-details.png / lower middle cockpit',
    references:['references/GT01-design.png','references/I04-front-r1.png',
      'references/I04-rear-r1.png','references/I04-side-r1.png','references/I04-exploded-r1.png'],
    sourceObserved:['圓形皮革握圈','三輻','圓角中央蓋','銀色下輻','左右按鍵'],
    authorDesign:['340 mm 包絡','背殼與輪轂','握圈截面與拇指支承','骨架','按鍵分割','縫線'],
    unknown:['氣囊袋體與充氣器','氣囊固定/釋放實物規格','按鍵電路與通訊',
      '時鐘彈簧/線束','實車轉向軸花鍵','強度、疲勞、碰撞與車規驗證'],
    interfaces:[
      {id:'I04-IF-SHAFT',origin:[0,0,-44],axis:[0,0,-1],nominalBore:22,
        geometry:'open bore with author 36-tooth visual spline',status:'UNVERIFIED_AUTHOR_INTERFACE'},
      {id:'I04-IF-RIM',radius:152,axis:[0,0,1],purpose:'三輻承架接環形芯材與包覆握圈'},
      {id:'I04-IF-LOWER-SLOT',probe:[0,-101],axis:[0,0,1],purpose:'下輻外框、後殼、骨架共用真實通孔'},
      {id:'I04-IF-COVER',planeZ:10,purpose:'中央外蓋遮蔽未建置的安全系統容積',status:'VISUAL_ENVELOPE_ONLY'}
    ],
    controls:{rim:'rimPoint(theta,phi)',spokes:'sideOutline / lowerOutline',
      lowerOpening:'lowerHole',carrier:'carrierOutline',cover:'coverRings',rearShell:'rearRings',shaft:'annulus'},
    claims:{editableMeshes:true,visualAssembly:true,manufacturable:false,
      reversibleServiceProcedure:false,certifiedAirbag:false,certifiedElectrical:false}
  };
  root.userData={id:'I04',referencePart:'I04',system:'interior',revision:definition.revision,
    units:'mm',reference:definition.source,definition};
  const std=(color,roughness=.5,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const local=(key,fallback)=>materials[key]?.isMaterial?materials[key].clone():fallback();
  const M={
    leather:local('steeringLeather',()=>new T.MeshPhysicalMaterial({color:0x171b1c,roughness:.7,
      sheen:.18,sheenColor:0x687072,sheenRoughness:.82})),
    rear:local('steeringShell',()=>std(0x191d20,.62)),
    soft:std(0x171b1b,.78),alloy:local('alloy',()=>std(0xa4adb0,.3,.87)),
    cast:local('metal',()=>std(0x737c80,.68,.64)),
    button:std(0x101516,.45,.03),groove:std(0x070a0b,.95),
    stitch:std(0x8b8172,.88),legend:std(0xc5c9c5,.56),foam:std(0x504e46,.98)
  };
  // A deterministic local grain field. No remote map or global material mutation.
  const size=128,grain=new Uint8Array(size*size*4);let seed=10417;
  for(let i=0;i<size*size;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const v=104+(seed>>>25);grain.set([v,v,v,255],i*4);}
  const tex=new T.DataTexture(grain,size,size,T.RGBAFormat);
  tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;
  tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;
  tex.repeat.set(34,3);M.leather.bumpMap=tex;M.leather.bumpScale=.11;
  M.soft.bumpMap=tex.clone();M.soft.bumpMap.repeat.set(5,5);M.soft.bumpMap.needsUpdate=true;M.soft.bumpScale=.07;
  Object.entries(M).forEach(([key,m])=>{m.name='I04 | '+key; m.userData={...m.userData,owner:'I04',representation:key==='leather'||key==='soft'?'PROCEDURAL_FIELD':'UNIFORM_PARAMETER'};});
  const v=(x,y,z)=>new T.Vector3(x,y,z),tau=Math.PI*2;
  const sq=(x)=>x*x,sp=(x,p)=>Math.sign(x)*Math.abs(x)**p;
  let occurrence=0;
  function add(geometry,material,subPart,name,usage,layer='exterior',extra={}) {
    geometry.computeBoundingBox();geometry.computeBoundingSphere();
    const mesh=new T.Mesh(geometry,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;
    const b=geometry.boundingBox,s=b.getSize(v(0,0,0));
    mesh.userData={id:`${subPart}-${String(++occurrence).padStart(3,'0')}`,
      subPart,referencePart:'I04',system:'interior',reference:definition.source,
      authorDimensions:{x:+s.x.toFixed(3),y:+s.y.toFixed(3),z:+s.z.toFixed(3),units:'mm'},
      purpose:usage,truth:'AUTHOR_DESIGN',layer,revision:definition.revision,...extra};
    root.add(mesh);parts.push(mesh);return mesh;
  }
  function geom(pos,idx,uv) {
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));
    if(uv)g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
  }
  function swept(point,N=256,K=32) {
    const p=[],uv=[],idx=[];
    for(let i=0;i<=N;i++)for(let j=0;j<=K;j++){const a=point(i/N*tau,j/K*tau);p.push(a.x,a.y,a.z);uv.push(i/N,j/K);}
    for(let i=0;i<N;i++)for(let j=0;j<K;j++){const a=i*(K+1)+j,b=a+K+1;
      idx.push(a,b,a+1,b,b+1,a+1);}
    return geom(p,idx,uv);
  }
  function rimPoint(theta,phi,offset=0) {
    const c=Math.cos(theta),s=Math.sin(theta),cp=Math.cos(phi),sn=Math.sin(phi);
    const thumb=5.2*(Math.exp(-sq((theta-.23)/.24))+Math.exp(-sq((theta-(Math.PI-.23))/.24)));
    const radial=152+(18+offset)*sp(cp,.91)-thumb*Math.max(0,-cp)**2;
    const axial=(16+offset)*sp(sn,.91)+1.2*Math.cos(2*theta);
    return v(radial*c,radial*s,axial);
  }
  add(swept(rimPoint),M.leather,'I04-P01','連續皮革握圈','圓形握圈；局部截面、內側拇指支承與皮革包覆','leather');
  add(swept((t,p)=>v((152+4.7*Math.cos(p))*Math.cos(t),(152+4.7*Math.cos(p))*Math.sin(t),-2+5.4*Math.sin(p)),192,16),
    M.cast,'I04-P02','環形承載芯材','皮革/泡棉包覆內的連續環形承架；強度未驗','core');
  function path(commands,Path=T.Shape) {
    const s=new Path();for(const [op,...args] of commands)s[op](...args);return s;
  }
  const sideOutline=[['moveTo',43,28],['bezierCurveTo',65,23,94,14,136,19],
    ['bezierCurveTo',149,20,151,6,149,-7],['bezierCurveTo',148,-24,141,-34,130,-32],
    ['bezierCurveTo',94,-27,75,-31,46,-38],['bezierCurveTo',40,-12,38,12,43,28],['closePath']];
  const lowerOutline=[['moveTo',-39,-43],['bezierCurveTo',-35,-69,-28,-118,-22,-149],
    ['quadraticCurveTo',0,-158,22,-149],['bezierCurveTo',28,-118,35,-69,39,-43],['closePath']];
  const lowerHole=[['moveTo',-17,-69],['quadraticCurveTo',0,-74,17,-69],
    ['lineTo',10,-131],['quadraticCurveTo',0,-137,-10,-131],['closePath']];
  function mirror(commands,s) {return commands.map(([op,...a])=>[op,...a.map((x,i)=>i%2===0?x*s:x)]);}
  function shape(commands,holes=[]){const s=path(commands);for(const h of holes)s.holes.push(path(h,T.Path));return s;}
  function smoothCoincidentNormals(g) {
    g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,sums=new Map();
    const key=(i)=>`${Math.round(p.getX(i)*10000)},${Math.round(p.getY(i)*10000)},${Math.round(p.getZ(i)*10000)}`;
    for(let i=0;i<p.count;i++){const k=key(i),a=sums.get(k)||v(0,0,0);a.add(v(n.getX(i),n.getY(i),n.getZ(i)));sums.set(k,a);}
    for(const a of sums.values())a.normalize();
    // Preserve the planar cap normal. Averaging it with all bevel vertices
    // incorrectly paints triangulation-shaped highlights across a flat face.
    for(let i=0;i<p.count;i++){if(Math.abs(n.getZ(i))>.9999)continue;const a=sums.get(key(i));n.setXYZ(i,a.x,a.y,a.z);}return g;
  }
  function extrude(s,z,depth,bevel=1.5) {
    const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:bevel>0,bevelSegments:4,steps:1,
      bevelSize:bevel,bevelThickness:bevel,curveSegments:20});g.translate(0,0,z);return smoothCoincidentNormals(g);
  }
  function circle(r,cx=0,cy=0,Path=T.Path){const p=new Path();p.absarc(cx,cy,r,0,tau,false);return p;}
  function annulus(outer,inner,z,depth,n=96,spline=0) {
    const s=circle(outer,0,0,T.Shape),hole=new T.Path();
    for(let i=0;i<=n;i++){const t=i/n*tau,r=inner+(spline?(i%4<2?spline:0):0);
      if(!i)hole.moveTo(r,0);else hole.lineTo(r*Math.cos(t),r*Math.sin(t));}
    s.holes.push(hole);return extrude(s,z,depth,.3);
  }
  for(const sign of [-1,1]){
    const word=sign<0?'左':'右';const outline=mirror(sideOutline,sign);
    add(extrude(shape(outline),-12,6,2.1),M.rear,'I04-P04',word+'橫輻後殼','包住金屬橫輻與按鍵承座，與輪圈有限接合','rear-shell');
    add(extrude(shape(outline),-1,10,2.6),M.soft,'I04-P05',word+'橫輻前殼','皮革觸面、按鍵座與中央蓋相接','front-shell');
  }
  // The same hole is cut through every lower spoke layer. No dark decal closes it.
  const low=()=>shape(lowerOutline,[lowerHole]);
  add(extrude(low(),-12,7,1.4),M.rear,'I04-P04','下輻鏤空後殼','與下輻承架共用穿透孔','rear-shell');
  add(extrude(low(),0,8,1.8),M.soft,'I04-P05','下輻鏤空前殼','由共同孔邊界承接銀色飾框','front-shell');
  const lowerTrim=extrude(low(),9,2,2);
  const crown=(x,y)=>2.8*Math.max(0,1-sq(x/41))*Math.max(0,Math.min(1,(-y-43)/80));
  for(let i=0;i<lowerTrim.attributes.position.count;i++){
    const a=lowerTrim.attributes.position,n=lowerTrim.attributes.normal,x=a.getX(i),y=a.getY(i);
    const dx=(crown(x+.01,y)-crown(x-.01,y))/.02,dy=(crown(x,y+.01)-crown(x,y-.01))/.02;
    const normal=v(n.getX(i)-dx*n.getZ(i),n.getY(i)-dy*n.getZ(i),n.getZ(i)).normalize();
    n.setXYZ(i,normal.x,normal.y,normal.z);a.setZ(i,a.getZ(i)+crown(x,y));
  }
  add(lowerTrim,M.alloy,'I04-P06','銀色鏤空下輻飾框','有拱度的薄壁框，槽孔穿越所有總成層','trim');
  // Single continuous three-spoke casting. Centre-to-arm joints are the same
  // native boundary, not overlapping plates with an apparent assembly gap.
  const carrierOutline=[['moveTo',-47,25],['bezierCurveTo',-75,24,-111,14,-139,19],
    ['bezierCurveTo',-153,20,-156,-20,-135,-30],['bezierCurveTo',-107,-27,-85,-27,-49,-35],
    ['bezierCurveTo',-39,-42,-35,-45,-34,-56],['lineTo',-22,-149],
    ['quadraticCurveTo',0,-158,22,-149],['lineTo',34,-56],
    ['bezierCurveTo',35,-45,39,-42,49,-35],['bezierCurveTo',85,-27,107,-27,135,-30],
    ['bezierCurveTo',156,-20,153,20,139,19],['bezierCurveTo',111,14,75,24,47,25],
    ['bezierCurveTo',42,59,-42,59,-47,25],['closePath']];
  const carrier=shape(carrierOutline,[lowerHole]);carrier.holes.push(circle(12));
  for(const a of [Math.PI/6,5*Math.PI/6,3*Math.PI/2])carrier.holes.push(circle(3.4,35*Math.cos(a),35*Math.sin(a)));
  const carrierGeometry=extrude(carrier,-10,8,1.1);
  for(let i=0;i<carrierGeometry.attributes.position.count;i++){
    const a=carrierGeometry.attributes.position,x=a.getX(i),y=a.getY(i);
    const side=Math.max(0,Math.min(1,(Math.abs(x)-43)/25));
    a.setX(i,x*(1-.02*side));a.setY(i,y*(1-.13*side));
  }
  smoothCoincidentNormals(carrierGeometry);
  add(carrierGeometry,M.cast,'I04-P03','連續三輻承架','共同外邊界將三輻連接中央輪轂，具有真正中心孔、下輻通孔及固定孔','core');
  // Closed thin-shell lofts: outer skin, mouth return, inner skin, and base return.
  function outlinePoint(angle,scale,z,rx=58,ry=58,p=.88) {
    return v(rx*scale*sp(Math.cos(angle),p),ry*scale*sp(Math.sin(angle),p),z);
  }
  function loft(rings,rx=58,ry=58,power=.88,N=128) {
    const pos=[],uv=[],idx=[],rows=[];
    for(let j=0;j<rings.length;j++){
      const pole=rings[j][0]===0;rows.push({start:pos.length/3,pole});
      for(let i=0;i<=(pole?0:N);i++){
        const a=outlinePoint(i/N*tau,rings[j][0],rings[j][1],rx,ry,power);pos.push(a.x,a.y,a.z);uv.push(i/N,j/(rings.length-1));}
    }
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){
      const a=rows[j].start+(rows[j].pole?0:i),b=rows[j+1].start+(rows[j+1].pole?0:i);
      if(rows[j].pole&&rows[j+1].pole)continue;
      if(rows[j].pole)idx.push(a,b+1,b);
      else if(rows[j+1].pole)idx.push(a,a+1,b);
      else idx.push(a,a+1,b,b,a+1,b+1);
    }
    return geom(pos,idx,uv);
  }
  const rearRings=[[.37,-24],[.62,-24],[.74,-20],[.91,-11],[1,1],[1,5],
    [.95,5],[.95,1],[.86,-10],[.68,-19],[.60,-21],[.37,-21],[.37,-24]];
  add(loft(rearRings),M.rear,'I04-P07','薄壁中央後殼','真實開口與約3 mm皮殼，中心孔讓位輪轂','rear-shell');
  const coverRings=[[.96,7],[1,10],[1,14],[.985,19],[.93,24],[.77,27],[.47,28.5],[0,29],
    [0,26],[.47,25.5],[.77,24],[.91,21.5],[.935,17],[.95,13],[.95,10],[.91,9],[.96,7]];
  add(loft(coverRings),M.soft,'I04-P08','圓角氣囊外蓋','柔和中央安全系統外包絡；內部氣囊/充氣器未建置或驗證','cover',
    {safetyStatus:'UNVERIFIED_VISUAL_COVER_ONLY'});
  const trimRings=[[.947,22.5],[.951,23.1],[.953,23.6],[.946,24],[.938,23.7],[.935,23],[.947,22.5]];
  add(loft(trimRings),M.alloy,'I04-P09','中央蓋細飾環','薄銀色周界，沿蓋面曲率嵌入','trim');
  add(annulus(26,11,-44,34,144,1),M.cast,'I04-P10','輪轂與花鍵示意孔','後軸介面接入三輻承架；22 mm作者名義孔，花鍵型式未驗','interface',
    {interfaceId:'I04-IF-SHAFT',nominalBore:22,splineStatus:'AUTHOR_VISUAL_ONLY'});
  add(annulus(32,26.6,-24,5),M.rear,'I04-P11','輪轂後殼收口','輪轂與後殼之間有限厚度肩圈','interface');
  add(annulus(28,11,-44.6,.7,144,1),M.alloy,'I04-P12','輪轂端面','端面保留中心軸孔','interface');
  const podOutline=[['moveTo',67,12],['bezierCurveTo',83,9,113,6,130,8],
    ['quadraticCurveTo',139,4,137,-17],['quadraticCurveTo',135,-24,127,-22],
    ['lineTo',66,-26],['quadraticCurveTo',59,-10,67,12],['closePath']];
  function scaledCommands(c,k,cx,cy){return c.map(([op,...a])=>[op,...a.map((x,i)=>(x-(i%2===0?cx:cy))*k+(i%2===0?cx:cy))]);}
  function rr(x,y,w,h,r=2){return [['moveTo',x+r,y],['lineTo',x+w-r,y],['quadraticCurveTo',x+w,y,x+w,y+r],
    ['lineTo',x+w,y+h-r],['quadraticCurveTo',x+w,y+h,x+w-r,y+h],['lineTo',x+r,y+h],
    ['quadraticCurveTo',x,y+h,x,y+h-r],['lineTo',x,y+r],['quadraticCurveTo',x,y,x+r,y],['closePath']];}
  // Small line geometry is merged by family; individual buttons remain editable.
  function tube(points,r=.4,sides=6) {
    const pos=[],idx=[];let lastU=v(0,0,1);
    points.forEach((p,i)=>{const tangent=points[Math.min(i+1,points.length-1)].clone().sub(points[Math.max(0,i-1)]).normalize();
      let u=lastU.clone().addScaledVector(tangent,-lastU.dot(tangent));if(u.lengthSq()<.001)u=v(0,1,0).cross(tangent);
      u.normalize();lastU=u;const b=tangent.clone().cross(u).normalize();
      for(let k=0;k<sides;k++){const q=p.clone().addScaledVector(u,r*Math.cos(k/sides*tau)).addScaledVector(b,r*Math.sin(k/sides*tau));pos.push(q.x,q.y,q.z);}
      if(i)for(let k=0;k<sides;k++){const a=(i-1)*sides+k,d=(i-1)*sides+(k+1)%sides,c=i*sides+k,e=i*sides+(k+1)%sides;idx.push(a,d,c,c,d,e);}
    });return geom(pos,idx);
  }
  function merge(gs) {
    const p=[],idx=[];let offset=0;
    for(const g of gs){p.push(...g.attributes.position.array);for(const n of g.index.array)idx.push(n+offset);offset+=g.attributes.position.count;g.dispose();}
    return geom(p,idx);
  }
  for(const sign of [-1,1]){
    const word=sign<0?'左':'右',p=mirror(podOutline,sign);
    const inner=mirror(scaledCommands(podOutline,.943,98,-7),sign);
    add(extrude(shape(p,[inner]),11.7,1.5,.7),M.alloy,'I04-P13',word+'按鍵銀框','窄框圍繞獨立嵌入式按鍵模組','controls');
    add(extrude(shape(inner),10,2.8,.75),M.groove,'I04-P14',word+'按鍵模組底殼','按鍵固定與細分離縫的真實承座','controls');
    const buttons=[[68,-7,15,12],[113,-8,18,12],[70,-21,26,10],[98,-21,32,10]];
    buttons.forEach(([x,y,w,h],i)=>add(extrude(shape(mirror(rr(x,y,w,h,1.6),sign)),13.3,1.1,.55),
      M.button,'I04-P15',word+'獨立按鍵 '+(i+1),'可獨立編輯/按壓外形；電控未驗','controls',
      {controlSide:word,controlIndex:i,electricalStatus:'UNVERIFIED'}));
    const roller=new T.CylinderGeometry(4,4,16,32,1,false);roller.rotateZ(Math.PI/2);roller.translate(sign*99,0,15.5);
    add(roller,M.cast,'I04-P16',word+'滾輪','金屬指腹操作滾輪，獨立於按鍵','controls');
    const knurls=[];for(let j=0;j<13;j++){
      const pp=[];for(let k=0;k<=24;k++){const t=k/24*tau;pp.push(v(sign*(91.7+j*1.22),4.12*Math.cos(t),15.5+4.12*Math.sin(t)));}knurls.push(tube(pp,.17,4));}
    add(merge(knurls),M.alloy,'I04-P16',word+'滾輪抓握細紋','0.34 mm凸紋沿獨立滾輪外表面','controls');
    const glyphs=[];const line=(pts)=>glyphs.push(tube(pts.map(([x,y])=>v(sign*x,y,15.25)),.38,6));
    if(sign<0){line([[72,-2],[75,1],[78,-2]]);line([[117,-2],[127,-2]]);line([[117,1],[127,1]]);line([[117,4],[127,4]]);}
    else{line([[72,0],[80,0]]);line([[76,-4],[76,4]]);line([[119,0],[126,0]]);}
    line([[84,-18],[81,-15.5],[84,-13]]);line([[112,-18],[115,-15.5],[112,-13]]);
    add(merge(glyphs),M.legend,'I04-P17',word+'按鍵符號','幾何符號嵌於按鍵面，不代表已驗證的功能','controls');
  }
  const stitchGeoms=[];
  for(let i=0;i<252;i++){
    const t=i/252*tau;
    // Suppress stitches under cast-spoke junctions rather than crossing hidden pockets.
    if(Math.abs(Math.sin(t))<.22||Math.sin(t)<-.955)continue;
    for(const [a,b] of [[2.58,2.81],[2.81,2.58]]){
      const p=[rimPoint(t-.0045,a,.2),rimPoint(t+.0045,b,.2)];stitchGeoms.push(tube(p,.21,5));}
  }
  add(merge(stitchGeoms),M.stitch,'I04-P18','內緣交叉縫線','從握圈同一截面取樣，縫線貼附皮革內側','leather');
  const seams=[];for(const theta of [.72,Math.PI-.72,Math.PI+.72,tau-.72]){
    const pp=[];for(let j=0;j<=48;j++)pp.push(rimPoint(theta,j/48*tau,.07));seams.push(tube(pp,.33,5));}
  add(merge(seams),M.groove,'I04-P19','皮革裁片接縫','沿握圈包覆截面閉合的四道裁片邊界','leather');
  // Two rear access inserts and independent recessed fasteners, on a shared plane.
  for(const x of [-28,28]){
    const pocket=annulus(5,3.7,-25.2,1.5);pocket.translate(x,22,0);
    add(pocket,M.groove,'I04-P20','後殼固定孔圈 '+x,'後殼服務孔的環狀厚壁座','hardware');
    const head=annulus(3.6,1.15,-25.7,1.8,6);head.translate(x,22,0);
    add(head,M.cast,'I04-P21','後殼固定螺釘 '+x,'獨立可辨的凹穴內固定件；牙規未驗','hardware');
  }
  // Connector receptacle is an empty authored envelope, not imaginary circuitry.
  const plug=shape(rr(-12,-39,24,13,2),[rr(-9.5,-36.5,19,8,1)]);
  add(extrude(plug,-27,7,.6),M.button,'I04-P22','後側線束座外包絡','空插座殼體；針腳、線束與電路全部未驗','interface',
    {electricalStatus:'UNVERIFIED_EMPTY_ENVELOPE'});
  root.updateMatrixWorld(true);
  definition.partCount=parts.length;
  definition.materials=Object.keys(M);
  definition.authorDimensionsBasis='作者設定；生成圖非量測；接口尺寸需主責依車內配置整合';
  return {root,parts,definition};
}
