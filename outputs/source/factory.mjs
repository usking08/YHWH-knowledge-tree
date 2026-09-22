/**
 * GT01 atelier — bounded architectural construction, millimetres / +Z up.
 * Source: ../references/GT01-factory-r1.png (AUTHOR_DESIGN, not a measured building).
 * No vehicle substitutes are included. Vehicle assemblies belong to the integrator.
 * buildFactory(THREE) is intentionally dependency-free and owns no renderer or loop.
 */
import {createWorkshopSurfaceLibrary} from './workshop-materials.mjs';
import {buildFactoryPlant} from './factory-botanical.mjs';
import {constructWorkshopBench} from './factory-workbench.mjs';
export function buildFactory(T, assets = {}) {
  const root = new T.Group();
  root.name = 'GT01 — Factory / FACTORY-R3-TEACHING';
  root.userData = {
    revision: 'FACTORY-R3-TEACHING', truth: 'AUTHOR_DESIGN', status: 'WORK_IN_PROGRESS',
    units: 'mm', upAxis: '+Z', source: '../references/GT01-factory-r1.png',
    hall: { length: 42000, width: 24000, eaves: 7500, ridge: 8500 },
    transferAisle: { yMin: 2500, yMax: 5500, clearWidth: 3000 },
    gallery: { yMin: -12000, yMax: -8500 },
    support: { yMin: 5500, yMax: 12000 },
    vehicleEnvelope: { centresY: -2000, maximumLengthX: 5400, maximumWidthY: 2300 },
    qualification: 'Authored spatial model; structural, fire, extraction and process certification not assessed.'
  };
  const roof = new T.Group(); roof.name = 'FACTORY-ROOF — hide for cutaway'; root.add(roof);
  roof.userData = { id: 'F-ROOF', system: 'envelope', togglable: true };
  const parts = [], stations = [], materials = {}, plants=[];
  const surfaces=createWorkshopSurfaceLibrary(T,assets);
  const material = (key, color, roughness = .65, metalness = 0, extra = {}) => {
    const m = surfaces.make(key,color,roughness,metalness,extra);
    m.name = `Factory | ${key}`; materials[key] = m; return m;
  };
  const M = {
    concrete: material('polished-concrete', 0xaaa9a2, .53),
    slabEdge: material('concrete-cut-edge', 0x888b85, .91),
    epoxy: material('bay-epoxy', 0xb9bcb6, .47),
    gallery: material('gallery-limestone', 0xd5ccba, .6),
    steel: material('charcoal-painted-steel', 0x303b3d, .42, .62),
    zinc: material('galvanized-steel', 0x929b9a, .43, .77),
    bright: material('brushed-stainless', 0xc2c8c5, .3, .86),
    white: material('warm-white-powdercoat', 0xe1e0d6, .56, .16),
    panel: material('mineral-wall-panel', 0xc8c9c1, .8),
    roof: material('standing-seam-roof', 0x586566, .65, .45),
    dark: material('rubber-and-gaskets', 0x1e2828, .83),
    oak: material('oiled-oak', 0x99734b, .65),
    oakLight: material('oak-worktop', 0xb89262, .72),
    leather: material('warm-tan-upholstery', 0x9c784f, .77),
    fabric: material('sage-lounge-fabric', 0x64736a, .92),
    yellow: material('safety-ochre', 0xdab34f, .58, .12),
    line: material('floor-white-marking', 0xf2efe1, .77),
    teal: material('equipment-bluegreen', 0x315760, .53, .23),
    red: material('quarantine-red', 0x9f463d, .63, .08),
    blue: material('parts-bin-blue', 0x355971, .78),
    carton: material('parts-carton', 0xaa916b, .96),
    leaf: material('gallery-foliage', 0x3f6146, .94),
    leafLight: material('gallery-foliage-new', 0x64805a, .91),
    terracotta: material('ceramic-planter', 0x8d877b, .86),
    glass: material('clear-architectural-glass', 0xbcd7d2, .12, .15,
      {transparent: true, opacity: .19, depthWrite: false, side: T.DoubleSide}),
    boothGlass: material('booth-laminated-glass', 0x84a7a4, .18, .18,
      {transparent: true, opacity: .36, depthWrite: false, side: T.DoubleSide}),
    light: material('linear-led-diffuser', 0xf7f4dd, .28, 0,
      {emissive: 0xffefc7, emissiveIntensity: 1.6}),
    screen: material('instrument-screen', 0x233e40, .25, .1,
      {emissive: 0x305e5b, emissiveIntensity: .45})
  };
  const unitBox = new T.BoxGeometry(1,1,1);
  const unitCylinder = new T.CylinderGeometry(1,1,1,12);
  const geomCache = new Map(), zAxis = new T.Vector3(0,0,1);
  let leafCount = 0;
  function group(id, name, system, parent = root) {
    const g = new T.Group(); g.name = name; g.userData = {
      id, name, system, revision: 'FACTORY-R3-TEACHING', truth: 'AUTHOR_DESIGN',
      reference: '../references/GT01-factory-r1.png'
    }; parent.add(g);
    parts.push({id, name, system, reference: g.userData.reference, object: g}); return g;
  }
  function mesh(g, geo, mat, name) {
    const m = new T.Mesh(geo, mat); m.name = name || mat.name;
    m.castShadow = !mat.transparent && !mat.transmission && mat !== M.line && mat !== M.light;
    m.receiveShadow = !mat.transparent && !mat.transmission; g.add(m); leafCount++; return m;
  }
  function box(g, x,y,z, w,d,h, mat, name) {
    if(mat.transmission){
      const thickness=Math.min(w,d,h),key=mat.userData.materialId+'-thickness-'+thickness;
      if(!materials[key]){materials[key]=mat.clone();materials[key].thickness=thickness;materials[key].name=mat.name+' | '+thickness+' mm';materials[key].userData={...mat.userData,thicknessMM:thickness};}
      mat=materials[key];
    }
    if(mat.userData.tileMM||mat.userData.edgeRadiusMM||mat.transmission){
      const k=`surface-box:${w}:${d}:${h}:${mat.name}`;
      if(!geomCache.has(k))geomCache.set(k,surfaces.uv(surfaces.roundedBox(w,d,h,mat.userData.edgeRadiusMM),mat,[w,d,h]));
      const m=mesh(g,geomCache.get(k),mat,name);m.position.set(x,y,z);return m;
    }
    const m=mesh(g,unitBox,mat,name); m.position.set(x,y,z); m.scale.set(w,d,h); return m;
  }
  function roundBox(g,x,y,z,w,d,h,r,mat,name) {
    const k=`round:${w}:${d}:${h}:${r}:${mat.name}`;
    if(!geomCache.has(k)) {
      const s=new T.Shape(), a=-w/2,b=-d/2;
      s.moveTo(a+r,b); s.lineTo(a+w-r,b); s.quadraticCurveTo(a+w,b,a+w,b+r);
      s.lineTo(a+w,b+d-r); s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);
      s.lineTo(a+r,b+d); s.quadraticCurveTo(a,b+d,a,b+d-r);
      s.lineTo(a,b+r); s.quadraticCurveTo(a,b,a+r,b);
      const soft=/upholstery|fabric/.test(mat.userData.materialId||''),be=Math.min(r*(soft?.45:.3),h*(soft?.28:.2),soft?45:10);
      const geo=new T.ExtrudeGeometry(s,{depth:h-2*be,bevelEnabled:true,bevelThickness:be,bevelSize:be,bevelSegments:5,steps:1,curveSegments:12});
      geo.translate(0,0,-h/2+be); surfaces.uv(geo,mat,[w,d,h]);geomCache.set(k,geo);
    }
    const m=mesh(g,geomCache.get(k),mat,name); m.position.set(x,y,z); return m;
  }
  function cylinder(g,x,y,z,r,h,mat,name) {
    const m=mesh(g,unitCylinder,mat,name); m.rotation.x=Math.PI/2;
    m.scale.set(r,h,r); m.position.set(x,y,z); return m;
  }
  function beam(g,a,b,w,d,mat,name) {
    const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);
    const m=box(g,...av.add(bv).multiplyScalar(.5).toArray(),w,d,v.length(),mat,name);
    m.quaternion.setFromUnitVectors(zAxis,v.normalize()); return m;
  }
  function pipe(g,points,r,mat,name) {
    const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
    return mesh(g,new T.TubeGeometry(c,Math.max(8,points.length*4),r,8,false),mat,name);
  }
  function sectionI(w,d,tw,tf,len) {
    const k=`I:${w}:${d}:${tw}:${tf}:${len}`;
    if(!geomCache.has(k)) {
      const pts=[[-w/2,-d/2],[w/2,-d/2],[w/2,-d/2+tf],[tw/2,-d/2+tf],
        [tw/2,d/2-tf],[w/2,d/2-tf],[w/2,d/2],[-w/2,d/2],[-w/2,d/2-tf],
        [-tw/2,d/2-tf],[-tw/2,-d/2+tf],[-w/2,-d/2+tf]];
      const s=new T.Shape();s.moveTo(...pts[0]);pts.slice(1).forEach(p=>s.lineTo(...p));s.closePath();
      const geo=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:false,steps:1});
      geomCache.set(k,geo);
    }
    return geomCache.get(k);
  }
  function iBeam(g,a,b,w=220,d=440,tw=16,tf=22) {
    const av=new T.Vector3(...a),v=new T.Vector3(...b).sub(av);
    const m=mesh(g,sectionI(w,d,tw,tf,v.length()),M.steel,'I section — web and flanges');
    m.position.copy(av);m.quaternion.setFromUnitVectors(zAxis,v.normalize());return m;
  }
  function label(g,text,x,y,z,w,h,mode='front',bg='#eeeade',fg='#303a36') {
    // Canvas labels are optional in non-browser native geometry readers.
    if(typeof document==='undefined') return null;
    const cv=document.createElement('canvas');cv.width=1024;cv.height=256;
    const ctx=cv.getContext('2d');if(!ctx)return null;
    ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=fg;
    const lines=text.split('\n');ctx.textAlign='center';ctx.textBaseline='middle';
    lines.forEach((s,i)=>{ctx.font=`${i===0?'600':'400'} ${lines.length===1?91:(i===0?80:47)}px "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
      ctx.fillText(s,512,lines.length===1?128:(i===0?90:191),980);});
    const tex=new T.CanvasTexture(cv);if(T.SRGBColorSpace)tex.colorSpace=T.SRGBColorSpace;
    const mat=new T.MeshBasicMaterial({map:tex,side:T.DoubleSide,toneMapped:false});
    materials[`label-${g.userData.id||g.name}-${Object.keys(materials).length}`]=mat;
    const m=mesh(g,new T.PlaneGeometry(w,h),mat,`Sign | ${text}`);m.position.set(x,y,z);
    if(mode==='front')m.rotation.x=Math.PI/2;
    else if(mode==='back')m.rotation.x=-Math.PI/2;
    m.castShadow=false;return m;
  }
  function floorOutline(g,x,y,w,d,mat=M.line,t=55) {
    box(g,x-w/2,y,4,t,d,5,mat);box(g,x+w/2,y,4,t,d,5,mat);
    box(g,x,y-d/2,4,w,t,5,mat);box(g,x,y+d/2,4,w,t,5,mat);
  }
  function glazedPanel(g,x,y,w,h=3400,z=h/2,mat=M.glass) {
    box(g,x,y,z,w-65,18,h-65,mat,'glass pane');
    for(const dx of [-w/2,w/2])box(g,x+dx,y,z,55,85,h,M.steel,'glazing mullion');
    for(const zz of [z-h/2,z+h/2])box(g,x,y,zz,w,85,55,M.steel,'glazing transom');
  }
  function wheel(g,x,y,z,r=70) {
    const w=cylinder(g,x,y,z,r,48,M.dark,'caster tyre');w.rotation.set(Math.PI/2,0,Math.PI/2);
    const hub=cylinder(g,x,y,z,r*.43,53,M.zinc,'caster hub');hub.rotation.copy(w.rotation);
    box(g,x,y,z+r,38,70,55,M.zinc,'caster yoke');
  }
  let benchSerial=0;
  function bench(g,x,y,w=1800,d=750,withTools=true){return constructWorkshopBench(T,{group,box,roundBox,cylinder,beam,mesh,pipe,M,serial:++benchSerial},g,x,y,w,d,withTools);}
  let trolleySerial=0;
  function trolley(g,x,y) {
    g=group('F-TROLLEY-'+String(++trolleySerial).padStart(2,'0'),'工具車 '+trolleySerial,'equipment',g);g.userData.placementRole='FREESTANDING';
    const w=580,d=650;
    for(const dx of [-230,230])for(const dy of [-265,265])wheel(g,x+dx,y+dy,70);
    roundBox(g,x,y,520,w,d,770,16,M.teal,'rolling cabinet shell');
    for(let i=0;i<6;i++) {
      box(g,x,y-d/2-3,255+i*110,w-34,22,99,M.steel,'tool drawer');
      box(g,x,y-d/2-21,287+i*110,w-135,24,12,M.bright,'tool drawer handle');
    }
    roundBox(g,x,y,922,w+40,d+40,42,18,M.dark,'trolley rubber top');
    beam(g,[x-w/2-80,y-180,860],[x-w/2-80,y+180,860],30,30,M.bright,'trolley handle');
    for(const dy of [-180,180])beam(g,[x-w/2,y+dy,860],[x-w/2-80,y+dy,860],25,25,M.bright);
  }
  function rack(g,x,y,w=2600,d=780,h=2800) {
    for(const dx of [-w/2,w/2])for(const dy of [-d/2,d/2]){
      box(g,x+dx,y+dy,h/2,65,65,h,M.steel,'rack perforated upright');
      box(g,x+dx,y+dy,15,145,120,30,M.zinc,'rack foot plate');
    }
    for(const zz of [300,1000,1700,2400]) {
      box(g,x,y,zz,w,d,38,M.zinc,'rack shelf');
      for(const yy of [-d/2,d/2])box(g,x,y+yy,zz-30,w,55,100,M.yellow,'shelf load beam');
      for(let i=0;i<5;i++) {
        const xx=x-w*.4+i*w*.2;
        box(g,xx,y,zz+150,w*.165,d-130,255,i%3===0?M.blue:M.carton,'parts tote');
        box(g,xx,y-d/2+59,zz+150,w*.12,8,65,M.white,'parts identification label');
        if(i%3===0)box(g,xx,y-d/2+51,zz+242,w*.075,12,45,M.dark,'tote hand opening');
      }
    }
    for(const dx of [-w/2,w/2]) {
      beam(g,[x+dx,y-d/2,330],[x+dx,y+d/2,h-80],25,25,M.zinc,'rack diagonal brace');
      beam(g,[x+dx,y+d/2,330],[x+dx,y-d/2,h-80],25,25,M.zinc);
    }
  }

  // Finished floor and legible zones share the exact 42 x 24 m hall boundary.
  const slab=group('F-001','混凝土地坪與伸縮縫','structure');
  box(slab,0,0,-130,42000,24000,260,M.slabEdge,'reinforced slab');
  box(slab,0,0,-8,42000,24000,16,M.concrete,'polished wearing surface');
  for(let x=-18000;x<=18000;x+=6000)box(slab,x,0,.3,5,24000,1,M.zinc,'slab movement joint');
  for(let y=-6000;y<=6000;y+=6000)box(slab,0,y,.4,42000,5,1,M.zinc,'slab saw-cut joint');
  const galleryFloor=group('F-002','公共展示廊石材地坪','gallery');
  box(galleryFloor,0,-10250,8,42000,3500,16,M.gallery);
  for(let x=-21000;x<21000;x+=1500)box(galleryFloor,x,-10250,17,4,3500,2,M.zinc);
  for(let y=-11500;y<-8500;y+=1000)box(galleryFloor,0,y,17,42000,4,2,M.zinc);

  // Eight load-bearing portal frames. Flanges/webs, haunches and bolted bases are geometry.
  const frameXs=[-20700,-15000,-9000,-3000,3000,9000,15000,20700];
  frameXs.forEach((x,idx)=>{
    const g=group(`F-PF-${String(idx+1).padStart(2,'0')}`,`門型鋼架 ${idx+1}`,'structure');
    for(const side of [-1,1]) {
      const y=side*11730;
      iBeam(g,[x,y,60],[x,y,7250],240,480,18,26);
      box(g,x,y,30,480,520,60,M.steel,'column base plate');
      for(const dx of [-160,160])for(const dy of [-190,190]) {
        cylinder(g,x+dx,y+dy,82,28,60,M.zinc,'anchor rod and nut');
        cylinder(g,x+dx,y+dy,58,40,13,M.bright,'anchor washer');
      }
      iBeam(g,[x,y,8000-Math.abs(y)/12],[x,0,8000],210,430,16,24);
      // Tapered haunch below the rafter distributes the portal knee moment.
      const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(1550,115);sh.lineTo(0,-550);sh.closePath();
      const haunch=mesh(g,new T.ExtrudeGeometry(sh,{depth:18,bevelEnabled:false}),M.steel,'tapered knee haunch web');
      // Shape XY is mapped into YZ with the thin extrusion on global X.
      const mat=new T.Matrix4().makeBasis(new T.Vector3(0,-side,0),new T.Vector3(0,0,1),new T.Vector3(-side,0,0));
      haunch.quaternion.setFromRotationMatrix(mat);haunch.position.set(x,y,7040);
      beam(g,[x,y,6490],[x,y-side*1550,7155],210,20,M.steel,'haunch lower flange');
      box(g,x,y-side*255,6970,290,28,770,M.zinc,'portal knee connection plate');
      for(const dx of [-92,92])for(let zz=6690;zz<=7250;zz+=140) {
        const nut=cylinder(g,x+dx,y-side*280,zz,19,28,M.bright,'knee connection bolt');nut.rotation.x=0;
      }
    }
    box(g,x,0,7780,280,800,20,M.zinc,'ridge splice plate');
    for(const dy of [-300,-130,130,300])cylinder(g,x,dy,7795,20,24,M.bright,'ridge splice bolt');
  });
  const bracing=group('F-003','屋簷繫梁與縱向斜撐','structure');
  for(const side of [-1,1]){
    beam(bracing,[-20900,side*11730,7300],[20900,side*11730,7300],160,200,M.steel,'eaves longitudinal tie');
    for(const pair of [[-20800,-15000],[15000,20800]]) {
      beam(bracing,[pair[0],side*11730,500],[pair[1],side*11730,6800],38,38,M.zinc,'wall tension rod');
      beam(bracing,[pair[1],side*11730,500],[pair[0],side*11730,6800],38,38,M.zinc,'wall tension rod');
    }
  }

  // Upper opaque cladding; front ground-level public gallery remains glazed.
  const walls=group('F-004','夾芯牆板與立面金屬收邊','envelope');
  walls.userData.cutawayRemovable=true;
  box(walls,0,11930,3650,42000,140,7300,M.panel,'rear insulated wall');
  box(walls,0,-11930,5550,42000,140,3900,M.panel,'front upper insulated wall');
  for(const side of [-1,1]) {
    // Delivery openings on the side walls remain genuinely open below 4.4 m.
    box(walls,side*20930,-3250,3650,140,17100,7300,M.panel,'gable lower main wall');
    box(walls,side*20930,10850,3650,140,2300,7300,M.panel,'gable rear pier');
    box(walls,side*20930,7600,5850,140,4200,2900,M.panel,'delivery opening head');
    box(walls,side*20945,7600,4270,175,4380,130,M.steel,'delivery door header');
    for(const y of [5460,9740])box(walls,side*20945,y,2130,175,120,4260,M.steel,'delivery door jamb');
    // Rolled door is parked above its clear opening.
    const roll=cylinder(walls,side*20875,7600,4520,240,4200,M.zinc,'open roller door drum');roll.rotation.set(0,0,0);
    box(walls,side*20820,7600,4920,300,4450,460,M.steel,'roller door hood');
    for(let y=-11700;y<12000;y+=300)box(walls,side*21005,y,5800,18,25,3100,M.roof,'cladding rib');
    const gs=new T.Shape();
    gs.moveTo(-12000,7300);gs.lineTo(-12000,7450);gs.lineTo(0,8450);
    gs.lineTo(12000,7450);gs.lineTo(12000,7300);gs.closePath();
    const gable=mesh(walls,new T.ExtrudeGeometry(gs,{depth:140,bevelEnabled:false}),M.panel,'gable infill below roof');
    const basis=new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0));
    gable.quaternion.setFromRotationMatrix(basis);gable.position.set(side*20930-70,0,0);
  }
  for(let x=-20700;x<21000;x+=300){
    box(walls,x,12008,4200,25,18,6000,M.roof,'rear cladding rib');
    box(walls,x,-12008,5580,25,18,3840,M.roof,'front cladding rib');
  }
  const facade=group('F-005','前立面公共玻璃幕牆','gallery');
  for(let x=-20000;x<=20000;x+=2000) {
    if([-18000,0,18000].includes(x)) {
      glazedPanel(facade,x,-12000,2000,1100,3025);
      for(const dx of [-1000,1000])box(facade,x+dx,-12000,1250,55,85,2500,M.steel,'entrance jamb');
    } else glazedPanel(facade,x,-12000,2000,3550,1800);
  }
  // Door leaf framing is within the curtain-wall opening rhythm.
  for(const x of [-18500,-17500,-500,500,17500,18500]) {
    box(facade,x,-12060,1170,940,60,2350,M.glass,'entry glass door leaf');
    for(const dx of [-470,470])box(facade,x+dx,-12080,1170,38,55,2350,M.steel);
    for(const zz of [32,2345])box(facade,x,-12080,zz,940,55,38,M.steel,'door leaf rail');
    box(facade,x+300,-12100,1200,24,40,650,M.bright,'entry pull handle');
  }
  const partition=group('F-006','展示廊與製造區透明隔屏','gallery');
  for(let x=-20000;x<=20000;x+=2000) {
    if(Math.abs(x)<1500)continue;glazedPanel(partition,x,-8500,2000,3100,1560);
  }
  box(partition,0,-8500,3140,42000,130,130,M.steel,'gallery continuous head beam');

  // Roof sheets leave real apertures around each skylight strip.
  const roofDeck=group('F-ROOF-01','折板屋面與天窗','envelope',roof);
  const pitch=Math.atan2(1000,12000), slope=12000/Math.cos(pitch);
  for(const side of [-1,1]) {
    const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-side*pitch);
    const panels=[[-21000,-16400],[-14400,-10400],[-8400,-4400],[-2400,1600],[3600,7600],[9600,13600],[15600,21000]];
    for(const [a,b] of panels) {
      const m=box(roofDeck,(a+b)/2,side*6000,7950,b-a,slope,95,M.roof,'insulated standing seam roof');m.quaternion.copy(q);
      for(let x=a+160;x<b;x+=600) {
        beam(roofDeck,[x,side*12000,7500],[x,0,8500],28,32,M.zinc,'raised roof seam');
      }
    }
    for(const x of [-15400,-9400,-3400,2600,8600,14600]) {
      const sky=box(roofDeck,x,side*6000,7960,1980,slope,35,M.glass,'continuous rooflight');sky.quaternion.copy(q);
      for(const dx of [-1000,1000])beam(roofDeck,[x+dx,side*12000,7450],[x+dx,0,8450],70,100,M.steel,'rooflight side curb');
      for(let yy=0;yy<=12000;yy+=2400)box(roofDeck,x,side*yy,8480-yy/12,2040,75,70,M.zinc,'rooflight glazing bar').quaternion.copy(q);
    }
    for(let yy=1500;yy<12000;yy+=1500)box(roofDeck,0,side*yy,8310-yy/12,42000,80,180,M.zinc,'roof purlin');
    box(roofDeck,0,side*12100,7470,42400,230,180,M.zinc,'eaves box gutter');
  }
  box(roofDeck,0,0,8500,42200,260,50,M.zinc,'ridge cap');
  for(const x of [-20800,20800])for(const y of [-12100,12100])cylinder(roofDeck,x,y,3690,74,7380,M.zinc,'rainwater downpipe');

  const lights=group('F-007','懸吊工作照明與走線橋架','services');
  for(let x=-17500;x<=17500;x+=5000)for(const y of [-4700,1600,7100]) {
    for(const dx of [-650,650])beam(lights,[x+dx,y,7900-Math.abs(y)/12],[x+dx,y,6500],8,8,M.steel,'light suspension');
    box(lights,x,y,6480,1600,120,75,M.steel,'linear light housing');
    box(lights,x,y,6438,1520,94,12,M.light,'linear LED diffuser');
  }
  for(const y of [-7600,6200]) {
    for(const dy of [-150,150])box(lights,0,y+dy,5700,41400,35,140,M.zinc,'cable tray side rail');
    for(let x=-20700;x<=20700;x+=450)box(lights,x,y,5660,35,330,25,M.zinc,'cable tray rung');
  }
  // The full aisle is unoccupied from y=2500 to 5500 at the occupied floor level.
  const aisle=group('F-008','三公尺轉運走道','circulation');
  for(const y of [2500,5500])for(let x=-20500;x<21000;x+=1250)box(aisle,x,y,5,770,75,6,M.line,'aisle dashed line');
  for(const x of [-15000,-5000,5000,15000]) {
    box(aisle,x,4000,6,1650,80,6,M.line,'flow arrow shaft');
    for(const s of [-1,1]) {
      const head=box(aisle,x+622.5,4000+s*165,7,Math.hypot(405,330),75,6,M.line,'flow arrow head');
      head.rotation.z=Math.atan2(s*330,-405);
    }
  }
  label(aisle,'3 m 轉運走道',0,4100,10,3800,650,'floor','#aaa9a2','#ececdf');

  const names=['車體結構','底盤裝配','車身合裝','座艙裝配','表面精整','終線檢驗'];
  const english=['STRUCTURE','CHASSIS','BODY','CABIN','FINISH','INSPECTION'];
  const descriptions=[
    '車體基準平台與可調定位座；待整合 GT01 現行結構總成。',
    '底盤升降支承、扭力工具及零件供應；待整合底盤總成。',
    '車身定位、上方軌道與密封工作檯；待整合車身總成。',
    '座艙零件與內裝裝配工作檯；待整合座艙總成。',
    '表面檢查、精整工具與抽氣設備；待整合整車。',
    '六道輪廓檢查燈架、輪下檢查平台與檢驗工作站；待整合整車。'
  ];
  for(let i=0;i<6;i++) {
    const x=-15000+i*6000,id=`S${i+1}`;
    const placement=[x,-2000,[383,500,387.5,0,0,90][i]];
    stations.push({id,name:names[i],position:[x,-2000,0],vehiclePlacement:placement,supportRole:i===0||i===2?'sill underside':'tyre contact',description:descriptions[i]});
    const g=group(`F-${id}`,`${id} ${names[i]}`,'assembly');
    g.userData.stationId=id;g.userData.vehiclePlacement=placement;
    box(g,x,-2850,1.2,5520,9900,2,M.epoxy,'assembly bay epoxy');
    floorOutline(g,x,-2850,5560,9900);
    label(g,`${id}  ${names[i]}\n${english[i]}`,x,-7150,8,3400,900,'floor','#b9bcb6','#263633');
    // Wall-side workbench and rolling tools leave a continuous vehicle footprint.
    bench(g,x-1250,1150,2000,680);
    trolley(g,x+2300,-3700);
    for(const dx of [-2000,2000]) {
      box(g,x+dx,-5500,20,510,500,40,M.yellow,'service post base');
      box(g,x+dx,-5500,620,110,110,1200,M.teal,'utility service post');
      box(g,x+dx,-5580,925,220,75,290,M.white,'electrical outlet enclosure');
      cylinder(g,x+dx,-5500,1270,75,100,M.red,'service stop button');
    }
    if(i===0) {
      // Empty locator fixture: two open rails with cross-members and bearing pads.
      for(const y of [-2900,-1100])box(g,x,y,270,4700,180,220,M.teal,'jig longitudinal rail');
      for(const dx of [-2100,-650,650,2100]) {
        box(g,x+dx,-2000,220,130,2000,150,M.steel,'jig cross-member');
        if(Math.abs(dx)===650)for(const y of [-2705,-1295]) {
          box(g,x+dx,y,95,230,230,190,M.steel,'jig foot');
          cylinder(g,x+dx,y,435,45,260,M.zinc,'adjustable locator');
          cylinder(g,x+dx,y,579,82,28,M.dark,'locator bearing pad');
        }
      }
    } else if(i===1) {
      for(const yy of [-2800,-1200]) {
        box(g,x,yy,95,4400,380,190,M.steel,'low-rise lift base');
        for(const side of [-1,1]) {
          beam(g,[x-1700,yy+side*95,180],[x+1700,yy+side*95,430],68,38,M.teal,'scissor lift arm');
          beam(g,[x+1700,yy+side*95,180],[x-1700,yy+side*95,430],68,38,M.teal,'crossed scissor arm');
        }
        box(g,x,yy,465,4500,450,70,M.dark,'lift support runner');
      }
    } else if(i===2) {
      for(const yy of [-4200,150]) {
        for(const dx of [-2520,2520]) {
          box(g,x+dx,yy,35,420,460,70,M.yellow,'gantry foot');
          box(g,x+dx,yy,1810,140,140,3550,M.steel,'body alignment gantry column');
        }
        iBeam(g,[x-2590,yy,3600],[x+2590,yy,3600],140,220,12,16);
      }
      for(const dx of [-2300,2300])box(g,x+dx,-2000,3550,100,4550,130,M.zinc,'overhead trolley rail');
      box(g,x,-2000,80,2100,1600,160,M.teal,'body fixture platform');
      for(const dx of [-650,650])for(const yy of [-2705,-1295]) {
        cylinder(g,x+dx,yy,315,40,480,M.zinc,'body alignment pedestal');
        box(g,x+dx,yy,570,180,160,55,M.dark,'body contact block');
      }
    } else if(i===3) {
      // Trim rack with shaped padded supports; no substitute vehicle or seats.
      for(const dx of [-2250,2250]) {
        box(g,x+dx,-4750,550,90,820,1000,M.steel,'trim carrier upright');
        for(let z=300;z<=900;z+=300)box(g,x+dx,-4750,z,500,900,45,M.oak,'trim support shelf');
        for(const yy of [-5100,-4400])wheel(g,x+dx,yy,70);
        roundBox(g,x+dx,-4750,1110,550,920,85,45,M.leather,'padded trim carrier top');
      }
    } else if(i===4) {
      const vac=cylinder(g,x+2300,-4650,400,265,650,M.bright,'extraction canister');
      cylinder(g,x+2300,-4650,750,280,60,M.teal,'extractor motor lid');
      for(const dx of [-190,190])for(const dy of [-190,190])wheel(g,x+2300+dx,-4650+dy,65,60);
      pipe(g,[[x+2300,-4600,800],[x+2600,-4000,1200],[x+1800,-3600,600],[x+1800,-3600,150]],42,M.dark,'sanding extraction hose');
      for(const dx of [-2250,2250]) {
        box(g,x+dx,-1800,80,480,550,160,M.steel,'raking light base');
        beam(g,[x+dx,-1800,150],[x+dx,-1800,2150],55,55,M.steel);
        box(g,x+dx,-1800,1730,120,250,900,M.light,'vertical raking light');
      }
    } else {
      // Six portal ribs enclose a genuine open inspection tunnel.
      for(let dx=-2300;dx<=2300;dx+=920) {
        const pts=[[x+dx,-4300,40],[x+dx,-4300,2400],[x+dx,-3400,3250],
          [x+dx,-600,3250],[x+dx,300,2400],[x+dx,300,40]];
        for(let p=0;p<pts.length-1;p++) {
          beam(g,pts[p],pts[p+1],110,140,M.steel,'inspection tunnel arch');
          const a=pts[p].slice(),b=pts[p+1].slice();a[0]-=76;b[0]-=76;
          beam(g,a,b,32,72,M.light,'inspection tunnel luminous strip');
        }
        for(const yy of [-4300,300])box(g,x+dx,yy,30,300,340,60,M.zinc,'tunnel floor anchor');
      }
      for(const yy of [-2950,-1050])box(g,x,yy,45,4900,570,90,M.steel,'inspection wheel platform');
      const terminal=box(g,x-2450,-5400,1440,580,90,420,M.steel,'inspection terminal display');terminal.rotation.x=.16;
      box(g,x-2450,-5455,1440,520,12,350,M.screen,'inspection terminal screen');
      beam(g,[x-2450,-5400,60],[x-2450,-5400,1270],65,65,M.steel);
      box(g,x-2450,-5400,40,560,480,80,M.steel,'terminal base');
    }
  }

  // Rear support strip: receiving -> paint -> glazing -> trim -> metrology -> quarantine.
  const receiving=group('F-B01','收料與棧板暫存','logistics');
  for(const x of [-20400,-19250])for(const y of [6750,8900]) {
    for(const dx of [-400,0,400])box(receiving,x+dx,y,85,140,1000,170,M.oak);
    for(let dy=-450;dy<=450;dy+=180)box(receiving,x,y+dy,185,1150,140,45,M.oakLight,'pallet deck board');
    for(let z=450;z<=900;z+=450)box(receiving,x,y,z,1000,850,420,M.carton,'incoming components crate');
    for(const dx of [-320,320])box(receiving,x+dx,y,690,40,880,960,M.oakLight,'crate band');
  }
  floorOutline(receiving,-19750,8300,2400,4800,M.yellow);
  label(receiving,'收料 RECEIVING',-19600,11600,2750,2600,440);
  const paint=group('F-B02','塗裝室與過濾抽氣系統','paint');
  const px=-15400,py=8600,pw=6200,pd=5700,ph=4200;
  box(paint,px,py,15,pw,pd,30,M.zinc,'paint booth base sill');
  box(paint,px,py+pd/2,ph/2,pw,100,ph,M.white,'paint booth rear panel');
  for(const dx of [-pw/2,pw/2])box(paint,px+dx,py,ph/2,100,pd,ph,M.white,'paint booth side panel');
  box(paint,px,py,ph+30,pw+100,pd+100,100,M.white,'paint booth ceiling plenum');
  for(let i=0;i<5;i++) {
    const xx=px-pw/2+620+i*1240;
    box(paint,xx,py-pd/2,ph/2,1200,95,ph,M.white,'paint booth folding door');
    box(paint,xx,py-pd/2-56,2320,660,22,1480,M.boothGlass,'booth observation window');
    for(const wx of [-355,355])box(paint,xx+wx,py-pd/2-65,2320,45,24,1550,M.zinc,'window frame');
    box(paint,xx+440,py-pd/2-80,1520,35,45,300,M.steel,'booth door handle');
  }
  for(let xx=px-2500;xx<px+2600;xx+=500)for(const yy of [py-1350,py+1350])
    box(paint,xx,yy,34,420,1100,18,M.dark,'extraction floor grate');
  for(let zz=550;zz<=3200;zz+=350)box(paint,px,py+pd/2-75,zz,pw-800,35,45,M.zinc,'rear filter grille');
  const extraction=group('F-B02-X','塗裝排氣管與濾箱','services');
  box(extraction,px+700,py+1200,4510,2200,1800,820,M.zinc,'filter housing');
  for(let xx=px-200;xx<=px+1700;xx+=190)box(extraction,xx,py+270,4520,45,55,540,M.steel,'filter intake louvre');
  cylinder(extraction,px+700,py+1200,5240,410,660,M.zinc,'centrifugal exhaust connector');
  pipe(extraction,[[px+700,py+1200,5400],[px+700,py+1200,6600],[px+700,10800,7050]],330,M.zinc,'paint booth exhaust duct');
  const exhaustRoof=group('F-ROOF-02','排氣出口與防雨帽','services',roof);
  cylinder(exhaustRoof,px+700,10800,7770,330,1520,M.zinc,'roof exhaust stack');
  cylinder(exhaustRoof,px+700,10800,8590,500,130,M.zinc,'exhaust weather cap');
  for(const dx of [-280,280])beam(exhaustRoof,[px+700+dx,10800,8330],[px+700+dx,10800,8530],30,30,M.zinc);
  label(paint,'塗裝室  PAINT BOOTH',px,py-pd/2-65,3670,4500,550);
  const rearStores=group('F-B03','後場零件倉儲','logistics');
  for(const x of [-10100,-7300,-4500,-1700,1100,3900,6700])rack(rearStores,x,11000,2500,1000,2900);
  const glazing=group('F-B04','玻璃黏合與密封工作區','support');
  bench(glazing,-8550,7050,3500,900);
  // A-frame glass rack expresses padding and restrained angled glazing sheets.
  for(const dx of [-1000,1000]) {
    beam(glazing,[-8750+dx,8650,200],[-8750+dx,9100,2250],60,60,M.steel);
    beam(glazing,[-8750+dx,9550,200],[-8750+dx,9100,2250],60,60,M.steel);
    box(glazing,-8750+dx,9100,110,170,1200,220,M.steel);
  }
  for(let i=0;i<4;i++) {
    const gl=box(glazing,-8750,8760-i*50,1350,2200,22,1700,M.boothGlass,'padded glazing rack sheet');gl.rotation.x=-.22;
    box(glazing,-8750,8500-i*50,390,2380,65,90,M.dark,'glazing rack rubber toe');
  }
  label(glazing,'玻璃與密封  GLAZING',-8500,5800,3000,3550,560);
  const trim=group('F-B05','內裝工坊與零件備料','support');
  bench(trim,-1700,7100,4000,1000);bench(trim,3800,7100,2800,900);
  for(const x of [-3400,-1000,1400]) {
    const roll=cylinder(trim,x,8750,950,260,1350,M.leather,'upholstery material roll');roll.rotation.set(0,0,Math.PI/2);
    for(const dx of [-760,760]) {
      beam(trim,[x+dx,8750,100],[x+dx,8750,1050],55,55,M.steel,'material roll support');
      box(trim,x+dx,8750,80,350,600,160,M.steel,'roll stand foot');
    }
  }
  label(trim,'座艙與內裝  CABIN FIT',-500,5800,3000,4400,560);
  const metrology=group('F-B06','恆溫量測室與三次元量測橋','metrology');
  const mx=11300,my=8800,mw=5300,md=6000;
  box(metrology,mx,my,12,mw,md,24,M.gallery,'metrology isolated floor');
  for(let x=mx-mw/2+mw/6;x<mx+mw/2;x+=mw/3)glazedPanel(metrology,x,my-md/2,mw/3,2900,1450);
  for(const xx of [mx-mw/2,mx+mw/2]) {
    box(metrology,xx,my,1550,90,md,3100,M.glass,'metrology side glazing');
    for(let yy=my-md/2;yy<=my+md/2;yy+=1500)box(metrology,xx,yy,1550,70,70,3100,M.steel,'room side mullion');
  }
  box(metrology,mx,my+md/2,1600,mw,90,3200,M.white,'metrology rear panel');
  for(const yy of [my-md/2,my+md/2])box(metrology,mx,yy,3130,mw,110,170,M.white,'room fascia');
  for(const xx of [mx-mw/2,mx+mw/2])box(metrology,xx,my,3130,110,md,170,M.white);
  roundBox(metrology,mx,my,910,2400,1600,230,35,M.dark,'granite metrology table');
  for(const dx of [-850,850])for(const dy of [-500,500])cylinder(metrology,mx+dx,my+dy,400,140,800,M.white,'isolated measuring table foot');
  for(const dx of [-1060,1060])box(metrology,mx+dx,my,1770,150,230,1600,M.white,'CMM bridge upright');
  box(metrology,mx,my,2510,2400,260,230,M.white,'CMM bridge beam');
  box(metrology,mx+280,my-35,1900,140,140,1250,M.zinc,'CMM vertical ram');
  cylinder(metrology,mx+280,my-35,1210,30,160,M.bright,'CMM probe stem');
  cylinder(metrology,mx+280,my-35,1120,18,20,M.red,'CMM ruby tip');
  bench(metrology,mx+100,my+2050,2300,650,false);
  box(metrology,mx+100,my+2090,1270,620,80,420,M.steel,'metrology terminal');
  box(metrology,mx+100,my+2035,1270,565,12,350,M.screen);
  label(metrology,'恆溫量測  METROLOGY',mx,my-md/2-65,3090,4400,570);

  const quarantine=group('F-B07','紅牌隔離區與網籠','quarantine');
  const qx=17600,qy=8800,qw=5500,qd=5800;
  floorOutline(quarantine,qx,qy,qw,qd,M.red,100);
  // Openable front gate is shown closed; fine welded mesh has real aperture geometry.
  function fence(a,b,height=2600) {
    const av=new T.Vector3(...a),bv=new T.Vector3(...b),len=av.distanceTo(bv),dir=bv.clone().sub(av).normalize();
    const n=Math.ceil(len/1400);
    for(let j=0;j<=n;j++) {
      const p=av.clone().addScaledVector(dir,len*j/n);
      box(quarantine,p.x,p.y,height/2,55,55,height,M.steel,'fence post');
      box(quarantine,p.x,p.y,10,160,150,20,M.zinc,'fence base plate');
    }
    for(const z of [160,height-70])beam(quarantine,[a[0],a[1],z],[b[0],b[1],z],35,35,M.steel,'fence perimeter rail');
    for(let j=0;j<=len;j+=160) {
      const p=av.clone().addScaledVector(dir,j);
      beam(quarantine,[p.x,p.y,160],[p.x,p.y,height-70],6,6,M.zinc,'welded mesh vertical wire');
    }
    for(let z=160;z<=height-70;z+=160)beam(quarantine,[a[0],a[1],z],[b[0],b[1],z],6,6,M.zinc,'welded mesh horizontal wire');
  }
  fence([qx-qw/2,qy-qd/2,0],[qx+qw/2,qy-qd/2,0]);
  fence([qx-qw/2,qy-qd/2,0],[qx-qw/2,qy+qd/2,0]);
  fence([qx+qw/2,qy-qd/2,0],[qx+qw/2,qy+qd/2,0]);
  box(quarantine,qx,qy-qd/2-40,1280,70,55,240,M.red,'quarantine gate latch');
  rack(quarantine,qx+700,qy+1600,2600,900,2400);
  trolley(quarantine,qx-1300,qy-900);
  for(let i=0;i<3;i++)box(quarantine,qx-900+i*800,qy+900,220,700,1200,440,M.red,'identified nonconforming parts container');
  label(quarantine,'紅牌隔離\nRED TAG QUARANTINE',qx,qy-qd/2-60,2390,4500,750);

  // Gallery reception, lounge and planted edges. Furnishings are at human scale.
  const reception=group('F-G01','接待桌與橡木品牌牆','gallery');
  const receptionDesk=group('F-RECEPTION-DESK','接待桌與桌上物','gallery',reception);receptionDesk.userData.placementRole='FREESTANDING';
  roundBox(receptionDesk,-14500,-9500,560,3000,820,1120,45,M.white,'reception stone desk');
  box(receptionDesk,-14500,-9470,1150,3100,940,70,M.oakLight,'reception counter top');
  box(reception,-14500,-8580,1500,4600,95,3000,M.oak,'reception timber wall');
  for(let x=-16750;x<=-12200;x+=90)box(reception,x,-8650,1500,38,55,3000,M.oakLight,'vertical oak acoustic slat');
  label(reception,'GT01',-14500,-8700,2260,2200,580,'front','#99734b','#f5efe3');
  box(receptionDesk,-15300,-9480,1330,620,45,350,M.dark,'reception monitor');
  box(receptionDesk,-13800,-9490,1210,450,270,25,M.dark,'reception desk blotter');
  const lounge=group('F-G02','訪客交誼與展示廊家具','gallery');
  let chairSerial=0;
  function chair(x,y,angle=0,mat=M.fabric) {
    const cg=group('F-CHAIR-'+String(++chairSerial).padStart(2,'0'),'展示廊座椅 '+chairSerial,'gallery',lounge);cg.position.set(x,y,0);cg.rotation.z=angle;cg.userData.placementRole='FREESTANDING';
    roundBox(cg,0,0,465,660,650,190,95,mat,'lounge chair seat');
    roundBox(cg,0,255,850,690,180,750,65,mat,'lounge chair curved back');
    for(const dx of [-290,290])roundBox(cg,dx,0,660,120,650,200,45,mat,'lounge chair armrest');
    for(const dx of [-240,240])for(const dy of [-235,235])beam(cg,[dx,dy,40],[dx,dy,380],34,34,M.oak,'chair leg');
  }
  let tableSerial=0;
  for(const cx of [-10000,9000,14500]) {
    chair(cx-825,-9400,.23);chair(cx+825,-9400,-.23,M.leather);
    const table=group('F-LOUNGE-TABLE-'+String(++tableSerial).padStart(2,'0'),'交誼圓桌 '+tableSerial,'gallery',lounge);table.userData.placementRole='FREESTANDING';
    cylinder(table,cx,-9500,560,350,60,M.gallery,'round stone lounge table');
    cylinder(table,cx,-9500,290,65,510,M.steel,'table pedestal');
    cylinder(table,cx,-9500,28,260,56,M.steel,'table base');
  }
  const planter=group('F-G03','逐葉橡膠樹、盆器與前廊植栽','gallery');
  const botanical=buildFactoryPlant(T,surfaces),juvenile=buildFactoryPlant(T,surfaces,{juvenile:true});
  for(const [i,x] of [-16500,-12200,-5800,-1900,1900,6000,16500].entries()){
    const p=botanical.root.clone(true);p.name='橡膠樹植栽 '+(i+1);p.userData={...p.userData,id:'F-PLANT-'+(i+1),instanceScale:1};p.position.set(x,-9020,0);p.scale.setScalar(1);planter.add(p);plants.push({id:p.userData.id,object:p});
  }
  for(const [i,x] of [-14000,-8500,-4200,6000,13000].entries()){
    const bed=group('F-PLANTBED-'+(i+1),'前廊長盆 '+(i+1),'gallery',planter);bed.position.set(x,-11530,0);bed.userData.placementRole='FREESTANDING';
    box(bed,0,0,18,1750,440,36,M.terracotta,'長盆底板');
    for(const y of [-208,208])box(bed,0,y,220,1750,24,400,M.terracotta,'長盆側壁');
    for(const xx of [-863,863])box(bed,xx,0,220,24,416,400,M.terracotta,'長盆端壁');
    box(bed,0,0,350,1700,390,40,M.dark,'低於盆口的根土層');
    for(let n=0;n<5;n++){const p=juvenile.root.clone(true);p.position.set(-650+n*325,0,370);p.rotation.z=n*.9;bed.add(p);}
  }
  label(lounge,'GT01 ATELIER\nDRIVE  ·  CRAFT  ·  BELONG',17900,-8575,2250,4300,880,'front','#dedbce','#303b35');

  // Repeated hardware is instanced only inside its owning, selectable assembly.
  // The registered group identities survive; no transforms or assets are external.
  let instanceBatchCount=0;
  function batchPart(g) {
    g.updateWorldMatrix(true,true);
    const inverse=new T.Matrix4().copy(g.matrixWorld).invert(),buckets=new Map();
    g.traverse(o=>{
      if(!o.isMesh || o.isInstancedMesh || o.userData.id || o.material.transparent || o.material.transmission)return;
      for(let parent=o.parent;parent&&parent!==g;parent=parent.parent)if(parent.userData.id||parent.userData.drawer)return;
      const k=`${o.geometry.uuid}|${o.material.uuid}`;
      if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(o);
    });
    for(const list of buckets.values()) {
      if(list.length<3)continue;
      const instances=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);
      instances.name=`${list[0].name} × ${list.length}`;
      instances.castShadow=list[0].castShadow;instances.receiveShadow=list[0].receiveShadow;
      instances.userData={partId:g.userData.id,instancedOccurrences:list.length,members:list.map(o=>({name:o.name,metadata:o.userData,parent:o.parent.name}))};
      list.forEach((o,i)=>instances.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld)));
      list.forEach(o=>o.removeFromParent());g.add(instances);
      instances.instanceMatrix.needsUpdate=true;instances.computeBoundingSphere();instanceBatchCount++;
    }
  }
  parts.forEach(p=>batchPart(p.object));
  root.updateMatrixWorld(true);
  root.userData.geometrySummary={authoredMeshOccurrences:leafCount,instanceBatches:instanceBatchCount,
    parts:parts.length,stations:stations.length,roofDetached:false,vehiclesIncluded:false};
  root.userData.placementNotes={
    stationCentres:stations.map(s=>s.position),
    vehicleSupportZ:{S1:593,S2:500,S3:597.5,S4:0,S5:0,S6:90},
    vehiclePlacements:stations.map(s=>({stationId:s.id,position:s.vehiclePlacement,rotationZ:0})),
    supportNote:'Vehicle assemblies must be placed by their actual support contacts; these elevations are fixture surfaces only.',
    roofControl:'Set returnValue.roof.visible = false to remove roof panels, skylights and roof exhaust.',
    cutawayWallPart:'F-004 can be hidden for the reference image front cutaway; glazing and portal frames remain independently selectable.'
  };
  return {root,roof,stations,parts,materials,surfaces,plants,materialsReady:surfaces.ready()};
}
