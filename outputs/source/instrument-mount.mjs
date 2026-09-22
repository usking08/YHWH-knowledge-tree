/**
 * Driver instrument mounting completion, authored world-mm geometry.
 * Call after instrument is placed: local X -> world Y, Y -> Z, Z -> X;
 * root center [-290,350,750]. Only I01-P11-018 is replaced in dashboard.
 */
const completed=new WeakMap();
export function completeGT01InstrumentMount(T,instrument,dashboard) {
  if(completed.has(dashboard.root)){
    const prior=completed.get(dashboard.root);
    if(prior.instrument!==instrument.root)throw Error('Dashboard mount already belongs to another instrument instance');
    return prior.result;
  }
  const revision='I05-M-R3',root=new T.Group(),parts=[];
  root.name='GT01 I05-M 儀表四點固定';
  const frame=dashboard.parts.find(p=>p.userData.id==='I01-P11-018'),ear=instrument.parts.find(p=>p.userData.subPart==='I05-A11');
  if(!frame||!ear)throw Error('Missing driver receiver I01-P11-018 or instrument rear housing I05-A11');
  instrument.root.updateMatrixWorld(true);dashboard.root.updateMatrixWorld(true);
  const expected=[[-168.5,-40],[168.5,-40],[-168.5,40],[168.5,40]].map(([u,v])=>({local:[u,v,-52],world:[-342,350+u,750+v]}));
  for(const c of expected)if(new T.Vector3(...c.local).applyMatrix4(instrument.root.matrixWorld).distanceTo(new T.Vector3(...c.world))>.03)throw Error('Instrument world pose does not match the mounting contract');
  const material=(name,color,roughness,metalness)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness});m.name=name;return m;};
  const M={frame:material('I05-M black metal frame; grade unverified',0x1c2529,.45,.65),
    steel:material('I05-M spacer/washer steel; grade unverified',0xa8b2b6,.33,.8),
    bolt:material('I05-M blackened steel bolt; no property-class claim',0x434c50,.34,.82),
    nut:material('I05-M brass nut; grade unverified',0xb59a54,.38,.75)};
  const tau=Math.PI*2,pitch=.7;
  const basis=new T.Matrix4().set(0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1);
  const xyz=g=>g.applyMatrix4(basis); // local radial XY / axial Z -> world YZ / X
  function merge(gs){const p=[],n=[];for(let g of gs){if(g.index)g=g.toNonIndexed();for(const v of g.attributes.position.array)p.push(v);for(const v of g.attributes.normal.array)n.push(v);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));return g;}
  const helicalRadius=(x,a)=>{const q=((x/pitch-a/tau)%1+1)%1,t=Math.max(0,Math.min(1,(q-.125)/.3125,(.875-q)/.3125));return 1.621+t*.379;};
  const hexRadius=(af,a)=>{const q=((a+Math.PI/6)%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6;return af/2/Math.cos(q);};
  function field(x0,x1,outer,inner=()=>0,steps=1,n=96){
    const ps=[],idx=[],solid=inner(x0,0)===0&&inner(x1,0)===0,rows=steps+1;
    for(const fn of solid?[outer]:[outer,inner])for(let k=0;k<=steps;k++){const x=x0+(x1-x0)*k/steps;for(let j=0;j<n;j++){const a=tau*j/n,r=fn(x,a);ps.push(r*Math.cos(a),r*Math.sin(a),x);}}
    const off=rows*n;
    for(let k=0;k<steps;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c);if(!solid)idx.push(off+a,off+c,off+b,off+b,off+c,off+d);}
    for(const k of [0,steps]){const center=ps.length/3;if(solid)ps.push(0,0,k?x1:x0);for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n;if(solid)k?idx.push(a,b,center):idx.push(a,center,b);else k?idx.push(a,b,off+a,b,off+b,off+a):idx.push(a,off+a,b,b,off+a,off+b);}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setIndex(idx);g.computeVertexNormals();return xyz(g);
  }
  function frameShape(){
    const s=new T.Shape();
    s.moveTo(187.5,796);s.absarc(184.5,796,3,0,Math.PI/2,false);s.lineTo(178.5,799);s.absarc(178.5,796,3,Math.PI/2,Math.PI,false);
    s.lineTo(175.5,686);s.absarc(178.5,686,3,Math.PI,Math.PI*1.5,false);s.lineTo(521.5,683);s.absarc(521.5,686,3,-Math.PI/2,0,false);
    s.lineTo(524.5,796);s.absarc(521.5,796,3,0,Math.PI/2,false);s.lineTo(515.5,799);s.absarc(515.5,796,3,Math.PI/2,Math.PI,false);
    s.lineTo(512.5,699);s.absarc(508.5,699,4,0,-Math.PI/2,true);s.lineTo(191.5,695);s.absarc(191.5,699,4,-Math.PI/2,-Math.PI,true);s.closePath();
    for(const y of [181.5,518.5])for(const z of [710,790]){const h=new T.Path();h.absarc(y,z,2.25,0,tau,true);s.holes.push(h);}return s;
  }
  const fg=new T.ExtrudeGeometry(frameShape(),{depth:3,steps:1,bevelEnabled:false,curveSegments:24});fg.translate(0,0,-352);xyz(fg);
  const oldFrame={reference:frame.userData.reference,material:frame.material.name,position:frame.position.toArray(),quaternion:frame.quaternion.toArray(),parent:frame.parent.name,authorDimensions:structuredClone(frame.userData.authorDimensions)};
  fg.applyMatrix4(frame.matrixWorld.clone().invert());frame.geometry=fg;frame.material=M.frame;frame.geometry.computeBoundingBox();
  const worldBox=()=>{root.updateMatrixWorld(true);dashboard.root.updateMatrixWorld(true);};
  worldBox();
  const bounds=m=>{const b=new T.Box3().setFromObject(m);return{min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new T.Vector3()).toArray()};};
  const fb=bounds(frame);
  const sources=[{url:'https://www.bossard.com/ch-en/eshop/screws-and-bolts-with-internal-drive/hex-socket-head-cap-screws-fully-threaded/p/7/',scope:'圓柱內六角全牙螺栓類型；未採用12.9資格、尺寸及採購身份'},
    {url:'https://www.bossard.com/ch-en/eshop/hex-nuts/hex-nuts-0-8d/p/504/',scope:'BN504六角黃銅螺帽類型；本案AF7與高3.2依主責作者約束，未宣稱實際BN504品號'}];
  const definition={schema:'gt01.instrument-mount/v1',revision,units:'mm',axes:{vehicleFront:'-X',driver:'+Y',up:'+Z'},source:'references/I05-M-A01-reference-r2.png',
    appearanceZones:[
      {key:'receiver-black-metal',ids:[frame.userData.id],substrate:'black steel',finish:'satin coated black',verification:'grade / coating / strength unverified'},
      {key:'spacer-washer-steel',families:['I05-M-S01','I05-M-W01'],substrate:'steel',finish:'satin metallic',verification:'grade and finish process unverified'},
      {key:'bolt-blackened-steel',families:['I05-M-B01'],substrate:'steel',finish:'blackened satin',verification:'no class12.9 claim'},
      {key:'nut-brass',families:['I05-M-N01'],substrate:'brass',finish:'muted machined gold',verification:'grade unverified'},
      {key:'existing-ear-polymer',ids:[ear.userData.id],substrate:'existing polymer',finish:'existing material unchanged',verification:'not owned by this addon'}
    ],newMeshCount:20,replacedReceiverId:frame.userData.id,untouchedCenterReceiverId:'I01-P11-019',instrumentPose:{center:[-290,350,750],localX:[0,1,0],localY:[0,0,1],localZ:[1,0,0]},
    joints:[],partDefinitions:{},instanceDefinitions:{},referenceReview:'references/I05-M-reference-review.json',sourcePrinciples:sources,baseRevisions:{instrument:instrument.definition.revision,dashboard:dashboard.definition.revision},
    physicalScope:'INSTRUMENT_EARS_TO_LOCAL_RECEIVER_ONLY',bodyInterface:{receiver:frame.userData.id,nextOwner:'I02 main beam / body',status:'NOT_BUILT',description:'U框到I02主梁或車身之固定尚未施工；不構成完整承載路徑。'},
    thread:{nominal:'M4 x 0.7',pitch:.7,maleRootRadius:1.621,maleCrestRadius:2,femaleRadialClearance:.04,profile:'authored truncated helical field',qualification:'NOT_ISO_TOLERANCE_QUALIFIED'},
    unresolved:['所有形體為作者重建，不是GT01實物量測。','材料牌號、強度、扭矩、防鬆、疲勞與車規未驗。','U框到I02主梁與車身的固定未施工。','螺牙為實際螺旋網格，但不是ISO配合資格或製造B-rep。'],
    assemblySteps:[
      {title:'接收框與間隔套',ids:[frame.userData.id],instruction:'四個Ø4.5孔對位；間隔套後面接U框X=-349，前面接儀表耳X=-342。框到車身尚未施工。'},
      {title:'前後墊片',instruction:'前墊片貼耳板X=-339.5；後墊片貼框背X=-352，各厚0.8。'},
      {title:'螺栓裝入',instruction:'先由儀表側邊移入後方空間，再沿-X插入；不從前鏡片穿入。20mm牙身穿過四層Ø4.5通孔。'},
      {title:'後螺帽旋入',instruction:'從-X側沿+X旋入螺帽，每轉一圈前進0.7；螺帽承壓面貼後墊片X=-352.8。'},
      {title:'拆卸',instruction:'反向旋出螺帽、取後墊片，螺栓沿+X退出到後側空間，再由左右側抽出。圖中分件位移僅用於教學。'}
    ]};
  Object.assign(frame.userData,{purpose:'以四個Ø4.5真孔承接I05-A耳板的獨立U形金屬接收框；到I02/車身固定未施工',reference:'references/I05-M-U01-reference-r1.png',
    originalReference:oldFrame.reference,shapeSource:{file:'source/instrument-mount.mjs',method:'frameShape',authority:'AUTHOR_CONSTRAINT',reference:'references/I05-M-U01-reference-r1.png'},
    receiving:{ids:[],instanceId:ear.userData.id,relationship:'透過四組間隔套與M4作者固定件接合儀表耳；上游車身固定未施工'},
    orientation:{basis:'WORLD_XYZ_MM',insertionDirection:[1,0,0],normal:[1,0,0]},authorDimensions:{unit:'mm',...fb,thickness:3,outerYZ:[349,116],railWidth:12,bottomHeight:12,outerCorner:3,innerLowerCorner:4,holeDiameter:4.5,holeCenters:expected.map(c=>c.world.slice(1)),notSourceMeasurements:true},
    physicalBoundary:{type:'single finite 3 mm extruded U plate with four through holes; top open',bounds:{min:fb.min,max:fb.max}},material:'black steel; grade unverified',revision,
    referenceAdoption:{adopted:'單片開口U形、四真孔、12mm側軌與底條；作者尺寸優先',rejected:'生成U圖107箭頭誤指孔距；實際離底27/107、孔距80。'},
    mountingCompletion:{revision,preserved:oldFrame,bodyMount:'NOT_BUILT'},partKind:'ONE_SERVICEABLE_COMPONENT',instanceRole:'driver-screen-receiver'});
  definition.instanceDefinitions[frame.userData.id]=structuredClone(frame.userData);
  function add(family,index,suffix,name,g,mat,purpose,receive,dir,dimensions,extra={}){
    const id='I05-M-'+family+'-'+String(index).padStart(2,'0')+(suffix?'-'+suffix:''),subPart='I05-M-'+family,[y,z]=expected[index-1].world.slice(1);
    const m=new T.Mesh(g,mat);m.name=name;m.position.set(0,y,z);root.add(m);root.updateMatrixWorld(true);const b=bounds(m);
    m.userData={id,subPart,referencePart:'I05',system:'interior',purpose,reference:'references/I05-M-'+family+'-reference-r1.png',
      receiving:{ids:receive,instanceId:receive[0],relationship:extra.relationship||'沿共同世界X軸接合；承壓面依作者層序接觸'},
      orientation:{basis:'WORLD_XYZ_MM',insertionDirection:dir,axis:[1,0,0],axisOrigin:[0,y,z]},
      authorDimensions:{unit:'mm',...b,...dimensions,notSourceMeasurements:true},
      physicalBoundary:{type:'one finite editable component',bounds:{min:b.min,max:b.max},...extra.boundary},
      material:mat.name,revision,partKind:'ONE_SERVICEABLE_COMPONENT',jointInstance:'I05-M-J01-'+String(index).padStart(2,'0'),
      shapeSource:{file:'source/instrument-mount.mjs',method:family,authority:'AUTHOR_CONSTRAINT'},
      referenceAdoption:{adopted:'獨立件外形與真孔／螺旋構造；尺寸按本案作者約束',rejected:'圖幅、標準合格、材料性能與實物量測均未採認'},...extra};
    parts.push(m);definition.instanceDefinitions[id]=structuredClone(m.userData);definition.partDefinitions[subPart]??={subPart,name,reference:m.userData.reference,instances:[]};definition.partDefinitions[subPart].instances.push(id);return m;
  }
  for(let i=1;i<=4;i++){
    const j='I05-M-J01-'+String(i).padStart(2,'0'),s='I05-M-S01-'+String(i).padStart(2,'0'),wf='I05-M-W01-'+String(i).padStart(2,'0')+'-F',wr='I05-M-W01-'+String(i).padStart(2,'0')+'-R',b='I05-M-B01-'+String(i).padStart(2,'0'),n='I05-M-N01-'+String(i).padStart(2,'0');
    add('S01',i,'','儀表耳間隔套 '+i,field(-349,-342,()=>4.5,()=>2.25),M.steel,'填合U框到儀表耳背的7mm距離，承接兩平面',[frame.userData.id,ear.userData.id],[1,0,0],{OD:9,ID:4.5,length:7,xInterval:[-349,-342]},{boundary:{bore:'straight open diameter4.5'}});
    add('W01',i,'F','前承壓墊片 '+i,field(-339.5,-338.7,()=>4.5,()=>2.25),M.steel,'接合螺栓頭下平面與儀表耳前面',[ear.userData.id,b],[-1,0,0],{OD:9,ID:4.5,thickness:.8,xInterval:[-339.5,-338.7]});
    add('W01',i,'R','後承壓墊片 '+i,field(-352.8,-352,()=>4.5,()=>2.25),M.steel,'接合螺帽承壓面與U框背面',[frame.userData.id,n],[1,0,0],{OD:9,ID:4.5,thickness:.8,xInterval:[-352.8,-352]});
    // One closed bolt surface; no overlapping cap remains inside the head.
    const headR=x=>3.5-Math.max(0,.15-Math.min(x+338.7,-334.7-x));
    const profile=[],circ=96,steps=Math.ceil(20/pitch*20);
    for(let k=0;k<=steps;k++){const x=-358.7+20*k/steps;profile.push([x,a=>Math.min(helicalRadius(x,a),1.7+Math.min(.3,x+358.7))]);}
    for(let k=0;k<=40;k++){const x=-338.7+4*k/40;profile.push([x,()=>headR(x)]);}
    profile.push([-334.7,a=>hexRadius(3,a)],[-336.9,a=>hexRadius(3,a)]);
    const pos=[],indices=[];
    for(const[x,f]of profile)for(let j=0;j<circ;j++){const a=tau*j/circ,r=f(a);pos.push(r*Math.cos(a),r*Math.sin(a),x);}
    for(let k=0;k<profile.length-1;k++)for(let j=0;j<circ;j++){const a=k*circ+j,b=k*circ+(j+1)%circ,c=a+circ,d=b+circ;indices.push(a,b,c,b,d,c);}
    for(const k of [0,profile.length-1]){const center=pos.length/3;pos.push(0,0,profile[k][0]);for(let j=0;j<circ;j++){const a=k*circ+j,b=k*circ+(j+1)%circ;k?indices.push(a,b,center):indices.push(a,center,b);}}
    const boltGeometry=new T.BufferGeometry();boltGeometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));boltGeometry.setIndex(indices);boltGeometry.computeVertexNormals();xyz(boltGeometry);
    add('B01',i,'','M4內六角圓柱頭螺栓 '+i,boltGeometry,M.bolt,'依共同孔軸穿入耳／套／框，與後六角螺帽接合',[wf,ear.userData.id,s,frame.userData.id,wr,n],[-1,0,0],{nominal:'M4 x 0.7',underHeadX:-338.7,tipX:-358.7,underHeadLength:20,headOD:7,headHeight:4,socketAF:3,socketDepth:2.2,tipLeadChamfer:.3,headEdgeBreak:.15},{boundary:{thread:'actual helical outer surface',socket:'blind hex cavity, 2.2 deep, 1.8 mm closed material to bearing face'}});
    const nutOuter=(x,a)=>Math.min(hexRadius(7,a),3.25+Math.min(.25,x+356,-352.8-x)*4);
    const nutInner=(x,a)=>helicalRadius(x,a)+.04+Math.max(0,.15-Math.min(x+356,-352.8-x));
    add('N01',i,'','M4後六角螺帽 '+i,field(-356,-352.8,nutOuter,nutInner,Math.ceil(3.2/pitch*24)),M.nut,'從後方沿螺旋與螺栓接合，前承壓面貼後墊片',[b,wr],[1,0,0],{nominal:'M4 x 0.7',AF:7,height:3.2,xInterval:[-356,-352.8],outerEdgeBreak:.25,entryEdgeBreak:.15,femaleRadialClearance:.04},{boundary:{thread:'through female helical bore',outer:'six flat wrench faces with circular end chamfers'}});
    definition.joints.push({id:j,index:i,centerYZ:expected[i-1].world.slice(1),axis:[1,0,0],clearanceBore:4.5,earId:ear.userData.id,frameId:frame.userData.id,ids:[s,wf,wr,b,n],stackRearToFront:[n,wr,frame.userData.id,s,ear.userData.id,wf,b],bearingPlanesX:[-352.8,-352,-349,-342,-339.5,-338.7],tipProtrusion:2.7,
      insertion:{bolt:{sideApproachAtOffsetX:22,sideTravelY:24,sideSign:expected[i-1].world[1]<350?-1:1,thenAxialTranslationX:[22,0]},nut:{translationX:[-8,0],rotationAboutXPerMm:tau/pitch},qualification:'DISCRETE_GEOMETRY_PATH_VERIFIED_R2; final R3 readback recorded separately'}});
  }
  frame.userData.receiving.ids=[ear.userData.id,...parts.filter(p=>p.userData.subPart==='I05-M-S01'||p.userData.id.endsWith('-R')).map(p=>p.userData.id)];
  definition.instanceDefinitions[frame.userData.id]=structuredClone(frame.userData);
  dashboard.definition.instanceDefinitions??={};dashboard.definition.instanceDefinitions[frame.userData.id]=structuredClone(frame.userData);
  dashboard.definition.instrumentMount={revision,receiver:frame.userData.id,bodyMount:'NOT_BUILT'};
  Object.assign(ear.userData.receiving,{instanceId:frame.userData.id,ids:[frame.userData.id,...parts.filter(p=>['I05-M-S01','I05-M-B01'].includes(p.userData.subPart)).map(p=>p.userData.id)],connectionState:'AUTHOR_GEOMETRY_FIXED_TO_LOCAL_RECEIVER_BODY_MOUNT_UNBUILT',relationship:'四組間隔套、墊片、M4作者螺栓及後螺帽固定到指定U框；U框到I02/車身尚未施工。'});
  instrument.definition.mountCompletion={revision,receiverId:frame.userData.id,newPartIds:parts.map(p=>p.userData.id),bodyMount:'NOT_BUILT'};
  root.userData={id:'GT01-I05-M',referencePart:'I05',system:'interior',revision,definition};
  root.updateMatrixWorld(true);dashboard.root.updateMatrixWorld(true);
  definition.newHardwareBounds=bounds(root);definition.updatedReceiverBounds=fb;
  const result={root,parts,definition};completed.set(dashboard.root,{instrument:instrument.root,result});return result;
}

