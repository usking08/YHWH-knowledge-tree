/**
 * GT01 I03 hinge fixing completion; author reconstruction in world millimetres.
 * Requires the unmodified identity/parent contract of CONSOLE-R4.
 * Does not import dependencies or modify a shared material.
 */
export function completeGT01ConsoleHinges(T, assembly) {
  const REV='CONSOLE-HINGE-R2', {root,parts,definition}=assembly;
  if (definition.hingeFixings) {
    if (definition.hingeFixings.revision===REV) return assembly;
    throw Error('Hinge completion already applied at another revision; rebuild the base assembly.');
  }
  const find=id=>parts.find(p=>p.userData.id===id), pivot=root.getObjectByName('I03-armrest-hinge');
  for(const id of ['I03-P05-01','I03-P16-01','I03-P19-01','I03-P19-02','I03-P19-03','I03-P19-04','I03-P20-01','I03-P20-02'])if(!find(id))throw Error('Missing hinge receiver '+id);
  if(!pivot||pivot.position.distanceTo(new T.Vector3(430,0,452))>1e-6)throw Error('Unexpected hinge pivot');
  const steel=new T.MeshStandardMaterial({color:0xa8b1b3,metalness:.78,roughness:.32});steel.name='I03-HF author steel; grade unverified';
  const shimMat=new T.MeshStandardMaterial({color:0x969780,metalness:.62,roughness:.44});shimMat.name='I03-HF steel shim; warm inspection finish';
  const tau=2*Math.PI;
  function rr(l,w,r,cx=0,cy=0){r=Math.min(r,l/2,w/2);const s=new T.Shape(),a=cx-l/2,b=cx+l/2,c=cy-w/2,d=cy+w/2;s.moveTo(a+r,c);s.lineTo(b-r,c);s.quadraticCurveTo(b,c,b,c+r);s.lineTo(b,d-r);s.quadraticCurveTo(b,d,b-r,d);s.lineTo(a+r,d);s.quadraticCurveTo(a,d,a,d-r);s.lineTo(a,c+r);s.quadraticCurveTo(a,c,a+r,c);s.closePath();return s;}
  const hole=s=>new T.Path(s.getPoints(12));
  function circle(x,y,r){const s=new T.Path();s.absarc(x,y,r,0,tau,true);return s;}
  function extr(s,z,d){const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:24});g.translate(0,0,z);return g;}
  function plate(l,w,r,z,d,x=0,y=0,holes=[]){const s=rr(l,w,r,x,y);s.holes.push(...holes);return extr(s,z,d);}
  function merge(gs){const p=[],n=[],u=[];for(let g of gs){if(g.index)g=g.toNonIndexed();for(const x of g.attributes.position.array)p.push(x);for(const x of g.attributes.normal.array)n.push(x);for(const x of (g.attributes.uv?.array||new Float32Array(g.attributes.position.count*2)))u.push(x);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));return g;}
  // Closed annular/solid axial surface. Ring radius may depend on angle: real helical walls.
  function tube(z0,z1,outer,inner=0,steps=1,n=72){
    const p=[],idx=[],rad=(r,z,a)=>typeof r==='function'?r(z,a):r;
    for(let k=0;k<=steps;k++){const z=z0+(z1-z0)*k/steps;for(let s=0;s<2;s++)for(let j=0;j<n;j++){const a=tau*j/n,r=rad(s?inner:outer,z,a);p.push(r*Math.cos(a),r*Math.sin(a),z);}}
    const at=(k,s,j)=>k*2*n+s*n+(j+n)%n;
    for(let k=0;k<steps;k++)for(let j=0;j<n;j++){let a=at(k,0,j),b=at(k,0,j+1),c=at(k+1,0,j+1),d=at(k+1,0,j);idx.push(a,b,d,b,c,d);a=at(k,1,j);b=at(k,1,j+1);c=at(k+1,1,j+1);d=at(k+1,1,j);idx.push(a,d,b,b,d,c);}
    for(let j=0;j<n;j++){let a=at(0,0,j),b=at(0,0,j+1),c=at(0,1,j+1),d=at(0,1,j);idx.push(a,d,b,b,d,c);a=at(steps,0,j);b=at(steps,0,j+1);c=at(steps,1,j+1);d=at(steps,1,j);idx.push(a,b,d,b,c,d);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
  }
  // Nominal visual M3/M2 helices, not an ISO tolerance-class claim.
  function thread(d,pitch,z,a){const q=((z/pitch-a/tau)%1+1)%1, crest=Math.max(0,Math.min(1,(q-.08)/.31,(.92-q)/.31));return d/2-.3+crest*.3;}
  function place(g,x,y){g.translate(x,y,0);return g;}
  function axisY(g,y){g.rotateX(-Math.PI/2);g.translate(430,y,452);return g;}
  function socketHead(z0,z1,af,depth,top=true){
    const a=new T.Shape();a.absarc(0,0,2.8,0,tau,false);
    const h=new T.Path(),r=af/Math.sqrt(3);for(let j=0;j<6;j++){const x=r*Math.cos(tau*j/6),y=r*Math.sin(tau*j/6);j?h.lineTo(x,y):h.moveTo(x,y);}h.closePath();
    const b=a.clone();b.holes=[h];
    return top?merge([extr(a,z0,z1-z0-depth),extr(b,z1-depth,depth)]):merge([extr(b,z0,depth),extr(a,z0+depth,z1-z0-depth)]);
  }
  function screwZ(d,pitch,tip,under,headOther,af){
    const lo=Math.min(tip,under),hi=Math.max(tip,under),up=tip>under;
    const radial=(z,a)=>Math.min(thread(d,pitch,z,a),d/2-.2+Math.min(.2,Math.abs(z-tip)));
    return merge([tube(lo,hi,radial,0,Math.ceil((hi-lo)/pitch*14),72),socketHead(Math.min(under,headOther),Math.max(under,headOther),af,.8,!up)]);
  }
  function bounds(g){g.computeBoundingBox();return {min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()};}
  function add(family,instance,name,g,purpose,receiving,moving,dir,dimensions,extra={}){
    const id='I03-HF-'+family+'-'+instance,subPart='I03-HF-'+family,b=bounds(g),m=new T.Mesh(g,family==='F03'?shimMat:steel);
    m.name=name;m.userData={id,subPart,referencePart:'I03',system:'interior',purpose,reference:'references/I03-HF-'+family+'-reference-r1.png',
      sourceReference:'references/GT01-details.png#lower-middle-cockpit',shapeSource:'source/console-hinge-fixings.mjs::'+family,
      receiving:{ids:receiving,instanceId:receiving[0],relationship:extra.relationship||'依閉合世界座標接合；保留獨立拆裝方向'},
      orientation:{worldAxes:{front:'-X',driver:'+Y',up:'+Z'},insertionDirection:dir,axis:dir},
      authorDimensions:{unit:'mm',bounds:b,size:g.boundingBox.getSize(new T.Vector3()).toArray(),...dimensions,notSourceMeasurements:true},
      physicalBoundary:{type:'finite solid with authored true bores or socket and helical surfaces',bounds:b,...extra.boundary},
      material:family==='F03'?'steel shim; grade unverified':'steel; grade unverified',revision:REV,
      referenceAdoption:{status:'AUTHOR_RECONSTRUCTION',adopted:'獨立件種類、孔與接合用途',rejected:'圖幅及未採用標註不作量測；實際尺寸以作者幾何及讀回為準'},
      motionGroup:moving?'armrest-lid':'fixed-console',...extra};
    if(family==='S01'||family==='F03'&&moving)m.userData.reference='references/I03-HF-'+family+'-reference-r2.png';
    if(moving){pivot.add(m);m.position.set(-430,0,-452);}else root.add(m);parts.push(m);definition.partDefinitions[subPart]??={subPart,name,purpose,reference:m.userData.reference};return m;
  }
  function replace(id,g,shapeReference,features){
    const m=find(id),before={position:m.position.toArray(),quaternion:m.quaternion.toArray(),parent:m.parent.name,bounds:bounds(m.geometry)};
    m.geometry=g;const b=bounds(g);
    m.userData.hingeCompletion={revision:REV,baseRevision:definition.revision,originalReference:m.userData.reference,shapeReference,features,preserved:before};
    m.userData.authorDimensions={...m.userData.authorDimensions,bounds:b,size:g.boundingBox.getSize(new T.Vector3()).toArray()};
    m.userData.physicalBoundary={...m.userData.physicalBoundary,bounds:b,hingeReceivingFeatures:features};
    m.userData.revision=REV;
  }
  const fixed=[{x:441,y:-52,s:'L',leaf:'I03-P19-01'},{x:441,y:62,s:'R',leaf:'I03-P19-03'}];
  const moving=[{x:420,y:-62,s:'L',leaf:'I03-P19-02'},{x:420,y:52,s:'R',leaf:'I03-P19-04'}];
  const basicTopHoles=()=>[hole(rr(284,171,21,-154,0)),circle(43,-43,36.5),circle(43,43,36.5),hole(rr(293,148,22,270,0)),hole(rr(5,18,1,121,0)),...fixed.map(c=>circle(c.x,c.y,1.6))];
  const recessHeads=()=>moving.map(c=>hole(rr(7.2,7.2,1.6,420.2,c.y)));
  const recessBarrels=()=>[-57,57].map(y=>hole(rr(9,31,2,430,y)));
  const topGs=[plate(807,181,42,446.1,.6,90,0,basicTopHoles()),
    plate(807,181,42,446.7,.9,90,0,[...basicTopHoles(),...recessHeads()]),
    plate(807,181,42,447.6,1.5,90,0,[...basicTopHoles(),...recessHeads(),...recessBarrels()])];
  for(const c of fixed){topGs.push(place(tube(442.1,443,3.6),c.x,c.y));topGs.push(place(tube(443,446.1,3.6,(z,a)=>thread(3,.5,z,a)+.05,88),c.x,c.y));}
  replace('I03-P05-01',merge(topGs),'references/I03-HF-R01-reference-r2.png',{
    fixedBores:fixed.map(c=>({center:[c.x,c.y],clearanceDiameter:3.2,bossOD:7.2,bossZ:[442.1,446.1],blindFloorZ:[442.1,443],femaleThreadZ:[443,446.1],nominal:'M3 x 0.5 author profile',minimumWallMm:2.05})),
    reliefs:{head:{centers:moving.map(c=>[420.2,c.y]),sizeXY:[7.2,7.2],floorZ:446.7,floorThickness:.6},barrel:{centers:[ [430,-57],[430,57]],sizeXY:[9,31],floorZ:447.6,floorThickness:1.5}},
    construction:'分層孔形與同材質盲接座；原頂板外周和原開口保留。層間共面內面屬同件材料界面。'
  });
  // Convex outline union supplies local material around the left rounded-corner bore.
  // The added receiver stays inside the original whole-part bounds, with a 0.7 mm roof.
  function convexHull(points){const ps=points.map(p=>({x:p.x,y:p.y})).sort((a,b)=>a.x-b.x||a.y-b.y);const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),lo=[],hi=[];for(const p of ps){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=1e-10)lo.pop();lo.push(p);}for(const p of ps.slice().reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=1e-10)hi.pop();hi.push(p);}return [...lo.slice(0,-1),...hi.slice(0,-1)];}
  const lidOutlinePoints=rr(310,155,34,270,0).getPoints(48);
  for(const c of moving)for(let j=0;j<96;j++)lidOutlinePoints.push(new T.Vector2(c.x+3*Math.cos(j*tau/96),c.y+3*Math.sin(j*tau/96)));
  const hull=convexHull(lidOutlinePoints);
  function lidShape(holes){const s=new T.Shape(hull);s.closePath();s.holes=[hole(rr(2.5,15,1,120,0)),...holes];return s;}
  const lidGs=[extr(lidShape(moving.map(c=>circle(c.x,c.y,1.6))),453.2,1.8),extr(lidShape([]),455,.7)];
  for(const c of moving){
    lidGs.push(plate(14.5,8,2,451.3,1.9,418.25,c.y,[circle(c.x,c.y,1.6)]));
    lidGs.push(place(tube(451.3,455,1.6,(z,a)=>thread(3,.5,z,a)+.05,104),c.x,c.y));
  }
  replace('I03-P16-01',merge(lidGs),'references/I03-HF-R02-reference-r2.png',{
    blindReceivers:moving.map(c=>({center:[c.x,c.y],nominal:'M3 x 0.5 author profile',boreZ:[451.3,455],closedRoofZ:[455,455.7],minimumReceiverOD:6,minimumRadialWall:1.45,roofThickness:.7,foamNominalGap:.3})),
    correctedFailure:'左孔原會側穿圓角；主責允許局部同材接座，主板輪廓取原圓角與Ø6接座的凸包，孔周及頂壁連續。右孔原輪廓已包含Ø6。兩接收墊沿鉸鏈側縮至X425.5，避免原pad侵入筒孔；前界X411不動。',
    outlineWorldXY:hull.map(p=>[p.x,p.y]),originalWholeBoundsRetained:true
  });
  // The original flat tab intruded into the rolled bore. Cut the cylindrical
  // clearance through that tab too, preserving its outside silhouette and fixing hole.
  function boredLeaf(moving,cy){
    const cx=moving?420:441,original=rr(19,9,2,cx,cy).getPoints(24).slice(0,-1),n=original.length,N=64;
    const outerAt=z=>{const dz=z-452,r=Math.abs(dz)<2.2?Math.sqrt(2.2**2-dz**2):0;return original.map(p=>new T.Vector2(moving?Math.min(p.x,430-r):Math.max(p.x,430+r),p.y));};
    const ps=[],idx=[];for(let k=0;k<=N;k++){const z=449.2+2*k/N;for(const p of outerAt(z))ps.push(p.x,p.y,z);}
    for(let k=0;k<N;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,c=(k+1)*n+(j+1)%n,d=(k+1)*n+j;idx.push(a,b,d,b,c,d);}
    const outside=new T.BufferGeometry();outside.setAttribute('position',new T.Float32BufferAttribute(ps,3));outside.setIndex(idx);outside.computeVertexNormals();
    const bore=[];for(let j=0;j<72;j++)bore.push(new T.Vector2(cx+1.6*Math.cos(-tau*j/72),cy+1.6*Math.sin(-tau*j/72)));
    function cap(z,bottom){const o=outerAt(z),verts=[...o,...bore],faces=T.ShapeUtils.triangulateShape(o,[bore]),g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts.flatMap(p=>[p.x,p.y,z]),3));g.setIndex(faces.flatMap(f=>bottom?[f[2],f[1],f[0]]:f));g.computeVertexNormals();return g;}
    // Only the cylindrical fixing-hole inner wall is needed here; the caps carry its opening.
    const wp=[],wi=[];for(const z of [449.2,451.2])for(let j=0;j<72;j++){const a=tau*j/72;wp.push(cx+1.6*Math.cos(a),cy+1.6*Math.sin(a),z);}for(let j=0;j<72;j++){const a=j,b=(j+1)%72,c=b+72,d=a+72;wi.push(a,d,b,b,d,c);}const wall=new T.BufferGeometry();wall.setAttribute('position',new T.Float32BufferAttribute(wp,3));wall.setIndex(wi);wall.computeVertexNormals();
    const rolled=axisY(tube(-4.3,4.3,4,2.2,1,96),cy); // axisY uses X430/Z452.
    return merge([outside,cap(449.2,true),cap(451.2,false),wall,rolled]);
  }
  for(const c of [...fixed,...moving]){
    const isMoving=c.x===420;
    replace(c.leaf,boredLeaf(isMoving,c.y),'references/I03-HF-R19-reference-r1.png',{
      axis:[0,1,0],axisOrigin:[430,c.y,452],rolledBore:4.4,rolledOD:8,rolledLength:8.6,
      tabSize:[19,9,2],fixingHole:[c.x,c.y,3.2],tabCylindricalBoreCut:'Ø4.4, through full tab Y span; removed intruding tab material',
      preserved:'原孔心、板外周、樞軸、ID與父群組；無端部削短'
    });
  }
  for(const c of fixed){
    const k='FIXED-'+c.s,shim='I03-HF-F03-'+k,washer='I03-HF-F02-'+k;
    add('F03',k,'固定葉 0.10 間隙墊片',plate(19,9,2,449.1,.1,c.x,c.y,[circle(c.x,c.y,1.6)]),'填補頂板到固定葉的既有 0.1 mm 間隙',[c.leaf,'I03-P05-01'],false,[0,0,-1],{thickness:.1,sizeXY:[19,9],bore:3.2});
    add('F02',k,'固定葉承壓墊圈',place(tube(451.2,451.6,3.2,1.65),c.x,c.y),'接觸螺絲頭與固定葉，擴大承壓面',[c.leaf],false,[0,0,-1],{thickness:.4,OD:6.4,ID:3.3});
    add('F01',k,'固定葉 M3 作者螺絲',place(screwZ(3,.5,443.6,451.6,453.4,2),c.x,c.y),'穿越真正葉片孔並接合頂板下盲接座',[washer,c.leaf,shim,'I03-P05-01'],false,[0,0,-1],{nominal:'M3 x 0.5',underHeadLength:8,headOD:5.6,headHeight:1.8,socketAF:2,threadEngagement:2.5,tipToFloor:.6},{boundary:{thread:'finite helical outer surface; not tolerance-qualified'}});
  }
  for(const c of moving){
    const k='MOVING-'+c.s,shim='I03-HF-F03-'+k,washer='I03-HF-F02-'+k;
    add('F03',k,'活動葉 0.10 間隙墊片',plate(14.5,8,2,451.2,.1,418.25,c.y,[circle(c.x,c.y,1.6)]),'填補活動葉頂面到內殼接收墊面的既有間隙；短側避開筒節',[c.leaf,'I03-P16-01'],true,[0,0,1],{thickness:.1,sizeXY:[14.5,8],bore:3.2,holeOffsetX:1.75});
    add('F02',k,'活動葉下承壓墊圈',place(tube(448.9,449.2,3.2,1.65),c.x,c.y),'位於活動葉下側，接收向上裝入的螺絲頭',[c.leaf],true,[0,0,1],{thickness:.3,OD:6.4,ID:3.3});
    add('F01',k,'活動葉 M3 作者螺絲',place(screwZ(3,.5,454.8,448.9,447.5,2),c.x,c.y),'從下方穿葉片與墊片，接合內殼向下開口盲孔',[washer,c.leaf,shim,'I03-P16-01'],true,[0,0,1],{nominal:'M3 x 0.5',underHeadLength:5.9,headOD:5.6,headHeight:1.4,socketAF:2,threadEngagement:3.5,tipToRoof:.2},{boundary:{thread:'finite helical outer surface; blind lid roof retained'}});
  }
  for(let i=0;i<2;i++){
    const y=[-57,57][i],side=i?'R':'L',pin='I03-P20-0'+(i+1);
    // Original 25 mm outside profile retained. End bores are disjoint, not a through hole.
    const outer=z=>z<-11?1.7+.3*(z+12):2;
    const gs=[tube(-12,-7.8,outer,(z,a)=>thread(2,.4,z,a)+.04,148),tube(-7.8,8.8,2),tube(8.8,13,2,(z,a)=>thread(2,.4,z,a)+.04,148)];
    replace(pin,axisY(merge(gs),y),'references/I03-HF-P01-reference-r1.png',{axisOrigin:[430,y,452],axis:[0,1,0],originalBodyRange:[-12,13],outerDiameter:4,blindEndBores:{low:[-12,-7.8],high:[8.8,13],nominal:'M2 x 0.4',solidMiddleLength:16.6},remainingMinimumRadialWall:.66});
    find(pin).userData.receiving.ids=[i?'I03-P19-03':'I03-P19-01',i?'I03-P19-04':'I03-P19-02','I03-HF-S02-'+side+'-LOW','I03-HF-S02-'+side+'-HIGH'];
    find(pin).userData.purpose='原形Ø4插銷；兩端新增互不相通的盲螺孔接收可卸端帽';
    for(const low of [true,false]){
      const end=low?'LOW':'HIGH',k=side+'-'+end,sleeve='I03-HF-S01-'+k;
      add('S01',k,'插銷端部間隔套 '+k,axisY(tube(low?-12:9.65,low?-9.65:13,3.3,2.1),y),'縮短套筒，距葉板端緣0.15、距筒節端面0.35 mm；與端帽共同限制軸向脫出',[pin,i?(low?'I03-P19-04':'I03-P19-03'):(low?'I03-P19-02':'I03-P19-01')],false,[0,low?1:-1,0],{OD:6.6,ID:4.2,length:low?2.35:3.35,knuckleEndGap:.35,leafEndGap:.15,axisOrigin:[430,y,452]});
      const under=low?-12:13,tip=low?-8.5:9.5,other=low?-13.4:14.4;
      add('S02',k,'可卸內六角止退端帽 '+k,axisY(screwZ(2,.4,tip,under,other,1.5),y),'端面貼緊插銷及套筒，阻擋插銷雙向脫出；可沿軸退出',[pin,sleeve],false,[0,low?1:-1,0],{nominal:'M2 x 0.4',underHeadLength:3.5,headOD:5.6,headHeight:1.4,socketAF:1.5,socketDepth:.8,tipToBlindFloor:.7,axisOrigin:[430,y,452]});
    }
  }
  root.updateMatrixWorld(true);
  definition.hingeFixings={revision:REV,baseRevision:definition.revision,unit:'mm',newParts:parts.filter(p=>p.userData.id.startsWith('I03-HF-')).map(p=>p.userData.id),
    modifiedExisting:['I03-P05-01','I03-P16-01','I03-P19-01','I03-P19-02','I03-P19-03','I03-P19-04','I03-P20-01','I03-P20-02'],axis:{origin:[430,0,452],direction:[0,1,0],sampleRangeRadians:[0,.96]},
    referenceReview:'references/I03-HF-reference-review.json',
    constructionEvidence:'quality/console-hinge-readback.json',
    assemblySteps:[
      {title:'接收幾何',parts:['I03-P05-01','I03-P16-01'],instruction:'原頂板增加容讓凹座與向下盲接座；內殼局部接座保持封頂。'},
      {title:'固定葉',parts:['I03-HF-F03-FIXED-L','I03-HF-F02-FIXED-L','I03-HF-F01-FIXED-L'],instruction:'0.10墊片填底面間隙，放置葉片與墊圈，再由上方裝入M3；另一軸同法。'},
      {title:'活動葉',parts:['I03-HF-F03-MOVING-L','I03-HF-F02-MOVING-L','I03-HF-F01-MOVING-L'],instruction:'0.10墊片位於葉片上面，螺絲由下面穿過墊圈向上接盲孔，隨蓋旋轉。'},
      {title:'穿軸與止退',parts:['I03-P20-01','I03-HF-S01-L-LOW','I03-HF-S01-L-HIGH','I03-HF-S02-L-LOW','I03-HF-S02-L-HIGH'],instruction:'筒節同軸後穿入原形插銷；兩端套入長短套筒，再旋入端帽。對葉板總軸向間隙0.30、對筒節0.70。'},
      {title:'拆開',instruction:'先軸向卸除兩端帽及套筒，插銷沿+Y抽出；葉片固定件沿各自插入方向反向拆卸。示範未模擬螺紋旋轉裝入。'}],
    unresolved:['作者幾何不是GT01原廠尺寸。','M3/M2為可視作者螺旋輪廓，未驗標準公差與配合等級。','聚合物直攻盲孔的材料牌號、強度、蠕變、扭矩、防鬆與耐久未驗。','開蓋檢查只涵蓋本鉸鏈單元及相鄰接收件，不構成整車或完整扣鎖驗證。']};
  return assembly;
}
