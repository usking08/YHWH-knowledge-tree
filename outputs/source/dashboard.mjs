/** GT01 I01/I06 dashboard, DASH-R7. Millimetres; -X front, +Y driver, +Z up.
 * This is an editable source-bound visual construction with authored dimensions.
 * Existing I05 displays, steering assembly and HVAC unit remain with their owners.
 */
export function buildGT01Dashboard(T,materials={}) {
  const root=new T.Group(),parts=[];root.name='GT01 / I01 儀表台與 I06 通風口';
  const definition={schema:'gt01.dashboard-definition/v1',revision:'DASH-R7',units:'mm',
    axes:{vehicleFront:'-X',driver:'+Y',up:'+Z',occupantFacing:'+X'},
    envelope:{x:[-630,-292],y:[-699,699],z:[594,763]},
    source:'references/GT01-details.png / lower middle cockpit',truth:'SOURCE_BOUND_AUTHOR_DESIGN',
    sourceObserved:['柔和黑色儀表台上蓋','棕色下襯','窄金屬橫飾帶','細長通風口'],
    authorDesign:['殼體厚度與截面','基材肋與皮革/泡棉層','三個風口及後導管','螢幕接收架'],
    ownedReferences:['I01','I06'],externalOwners:['I03 central saddle','I04 steering','I05 displays','HVAC distribution unit'],
    screenKeepouts:[{id:'I05-driver',center:[-315,350,750],size:[54,352,124]},
      {id:'I05-centre',center:[-292,-42,735],size:[12,290,112]}],
    interfaces:[{id:'I01-IF-SADDLE',bounds:{x:[-410,-292],y:[-125,125],z:[594,630]},status:'RESERVED_ADJACENCY_NO_NEW_CONSOLE'},
      {id:'I01-IF-COLUMN',center:[-340,350,685],axis:[.9396926,0,.3420201],status:'AUTHOR_CLEARANCE_ENVELOPE_NO_COLUMN'},
      {id:'I01-IF-SCREENS',status:'OPEN_TOP_RECEIVING_SUPPORTS_ONLY_I05_NOT_REBUILT'}],
    unknown:['實車氣囊及其撕裂線/固定件','材料阻燃/碰撞性能','HVAC風量/壓損/密封','葉片連動與阻尼規格','車身安裝公差','屏幕與車身實際緊固規格'],
    claims:{editable:true,layeredSkins:true,openDucts:true,certifiedVehicle:false,validatedAirflow:false,reversibleServiceProcedure:false}
  };
  root.userData={id:'GT01-I01-I06',system:'interior',revision:definition.revision,units:'mm',definition};
  const std=(color,roughness=.6,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const local=(key,f)=>materials[key]?.isMaterial?materials[key].clone():f();
  const M={blackLeather:local('dashboardLeather',()=>new T.MeshPhysicalMaterial({color:0x171c1e,roughness:.72,sheen:.22,sheenColor:0x6c7275})),
    tanLeather:local('leather',()=>new T.MeshPhysicalMaterial({color:0x9c7045,roughness:.77,sheen:.2})),
    substrate:std(0x232b2c,.74),foam:std(0x968976,.99),alloy:local('alloy',()=>std(0xadb4b7,.29,.84)),
    duct:std(0x161d20,.79),blade:std(0x262d30,.38,.16),pin:std(0x757d81,.33,.72),thread:std(0xaaa08c,.92),dark:std(0x080c0d,.94)};
  let seed=1601;const texels=new Uint8Array(128*128*4);for(let i=0;i<128*128;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=103+(seed>>>25);texels.set([n,n,n,255],i*4);}
  const grain=new T.DataTexture(texels,128,128,T.RGBAFormat);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(18,5);grain.generateMipmaps=true;grain.minFilter=T.LinearMipmapLinearFilter;grain.magFilter=T.LinearFilter;grain.needsUpdate=true;
  for(const k of ['blackLeather','tanLeather']){M[k].bumpMap=grain;M[k].bumpScale=.13;}
  for(const [k,m] of Object.entries(M)){m.name='Dashboard | '+k;m.userData={...m.userData,owner:'I01/I06',representation:k.endsWith('Leather')?'PROCEDURAL_FIELD':'UNIFORM_PARAMETER'};}
  const V=(x,y,z)=>new T.Vector3(x,y,z),sq=x=>x*x,clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),tau=Math.PI*2;
  let serial=0;
  function add(g,mat,ref,subPart,name,purpose,layer,thickness,extra={}){
    g.computeBoundingBox();g.computeBoundingSphere();const size=g.boundingBox.getSize(V(0,0,0));
    const m=new T.Mesh(g,mat);m.name=name;m.castShadow=m.receiveShadow=true;
    m.userData={id:`${subPart}-${String(++serial).padStart(3,'0')}`,referencePart:ref,subPart,system:'interior',
      reference:definition.source,revision:definition.revision,purpose,layer,material:mat.name,
      physicalBoundary:{representation:'FINITE_MESH',nominalThickness:thickness,units:'mm'},
      authorDimensions:{x:+size.x.toFixed(3),y:+size.y.toFixed(3),z:+size.z.toFixed(3),units:'mm'},truth:'AUTHOR_DESIGN',...extra};
    root.add(m);parts.push(m);return m;
  }
  function geometry(p,idx,uv){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));if(uv)g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
  const driverRise=y=>7.5*Math.exp(-sq((y-350)/165));
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const frontX=y=>{const base=-322-25*(Math.abs(y)/699)**4-18*Math.exp(-sq((y-350)/180));
    const receiver=smooth(144,170,y)*(1-smooth(530,556,y));return base+(Math.min(base,-352)-base)*receiver;};
  function faceX(y,z){return frontX(y)-.0062*sq(725-z);}
  function top(u,v){const y=-696+1392*v,a=Math.abs(y)/699;
    const rear=-626+36*a**4,front=frontX(y)-3;
    const x=rear+(front-rear)*u;
    const z=733+25*Math.sin(Math.PI*u)**.8-9*u-7*a**5+driverRise(y)*u**2;
    return V(x,y,z);
  }
  function normalAt(fn,u,v){const e=.0001,a=fn(clamp(u+e,0,1),v).sub(fn(clamp(u-e,0,1),v)),b=fn(u,clamp(v+e,0,1)).sub(fn(u,clamp(v-e,0,1)));return a.cross(b).normalize();}
  function thinPatch(fn,nu,nv,outerOffset,innerOffset){
    const p=[],idx=[],uv=[],S=(nu+1)*(nv+1);
    for(const offset of [outerOffset,innerOffset])for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const u=i/nu,v=j/nv,a=fn(u,v).addScaledVector(normalAt(fn,u,v),offset);p.push(a.x,a.y,a.z);uv.push(v,u);}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,a+1,b,b,a+1,b+1,S+a,S+b,S+a+1,S+b,S+b+1,S+a+1);}
    const border=[];for(let i=0;i<=nu;i++)border.push(i);for(let j=1;j<=nv;j++)border.push(j*(nu+1)+nu);for(let i=nu-1;i>=0;i--)border.push(nv*(nu+1)+i);for(let j=nv-1;j>0;j--)border.push(j*(nu+1));
    for(let i=0;i<border.length;i++){const a=border[i],b=border[(i+1)%border.length];idx.push(a,S+a,b,b,S+a,S+b);}
    return geometry(p,idx,uv);
  }
  add(thinPatch(top,56,144,0,-1.25),M.blackLeather,'I01','I01-P01','儀表台連續皮革上蓋','柔和冠頂與乘員側滾邊，皮革1.25 mm','leather',1.25);
  add(thinPatch(top,56,144,-1.3,-5.8),M.foam,'I01','I01-P02','上蓋泡棉墊層','同一母面向內4.5 mm的緩衝層','foam',4.5);
  add(thinPatch(top,56,144,-5.85,-8.85),M.substrate,'I01','I01-P03','上蓋成形基材','與皮覆、泡棉共用曲面並保留3 mm結構皮','substrate',3);
  function poly(points,Cls=T.Shape){const s=new Cls();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;}
  function rounded(x,y,w,h,r=4,Cls=T.Shape){const s=new Cls();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
  function smoothBevel(g){g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,sums=new Map(),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>Math.round(x*1e4)).join(',');
    for(let i=0;i<p.count;i++){const k=key(i),a=sums.get(k)||V(0,0,0);a.add(V(n.getX(i),n.getY(i),n.getZ(i)));sums.set(k,a);}for(const n of sums.values())n.normalize();for(let i=0;i<p.count;i++){if(Math.abs(n.getZ(i))>.9999)continue;const a=sums.get(key(i));n.setXYZ(i,a.x,a.y,a.z);}return g;}
  function refine(g,maxEdge=12){const a=g.toNonIndexed?g.index?g.toNonIndexed():g:g,p=a.attributes.position,n=a.attributes.normal,uv=a.attributes.uv,out=[],ns=[],us=[];
    const vertex=i=>({p:V(p.getX(i),p.getY(i),p.getZ(i)),n:V(n.getX(i),n.getY(i),n.getZ(i)),uv:[uv?.getX(i)||0,uv?.getY(i)||0]});
    const mid=(a,b)=>({p:a.p.clone().add(b.p).multiplyScalar(.5),n:a.n.clone().add(b.n).normalize(),uv:[(a.uv[0]+b.uv[0])/2,(a.uv[1]+b.uv[1])/2]});
    function tri(a,b,c,depth=0){const edges=[a.p.distanceToSquared(b.p),b.p.distanceToSquared(c.p),c.p.distanceToSquared(a.p)],i=edges.indexOf(Math.max(...edges));if(edges[i]>maxEdge*maxEdge&&depth<18){if(i===0){const m=mid(a,b);tri(a,m,c,depth+1);tri(m,b,c,depth+1);}else if(i===1){const m=mid(b,c);tri(a,b,m,depth+1);tri(a,m,c,depth+1);}else{const m=mid(c,a);tri(a,b,m,depth+1);tri(m,b,c,depth+1);}return;}for(const v of [a,b,c]){out.push(v.p.x,v.p.y,v.p.z);ns.push(v.n.x,v.n.y,v.n.z);us.push(...v.uv);}}
    for(let i=0;i<p.count;i+=3)tri(vertex(i),vertex(i+1),vertex(i+2));const result=new T.BufferGeometry();result.setAttribute('position',new T.Float32BufferAttribute(out,3));result.setAttribute('normal',new T.Float32BufferAttribute(ns,3));result.setAttribute('uv',new T.Float32BufferAttribute(us,2));g.dispose();return result;}
  function plate(shape,depth=2,bevel=.5){return smoothBevel(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:12,steps:1}));}
  function faceGeometry(shape,offset,thickness,bevel=.5){const g=refine(plate(shape,thickness,bevel));const a=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<a.count;i++){const y=a.getX(i),z=a.getY(i),w=a.getZ(i),ny=n.getX(i),nz=n.getY(i),nx=n.getZ(i);
      const dy=(faceX(y+.01,z)-faceX(y-.01,z))/.02,dz=(faceX(y,z+.01)-faceX(y,z-.01))/.02;
      a.setXYZ(i,faceX(y,z)+offset+w,y,z);const v=V(nx,ny-dy*nx,nz-dz*nx).normalize();n.setXYZ(i,v.x,v.y,v.z);}
    return g;}
  const vents=[{id:'I06-VP',name:'乘客長風口',y:-430,z:691,w:390,h:34,backY:-425,backZ:665,backW:142,backH:48},
    {id:'I06-VD',name:'駕駛外側風口',y:620,z:695,w:88,h:30,backY:611,backZ:670,backW:64,backH:42},
    {id:'I06-VC',name:'中央低位風口',y:-42,z:650,w:266,h:26,backY:-35,backZ:628,backW:112,backH:38}];
  definition.vents=vents.map(v=>({...v,frontAxis:'+X',ductBackX:-600,wall:2.2,bladePitch:11,bladeCount:3,pivotStatus:'AUTHOR_MECHANICAL_LAYOUT_UNVERIFIED'}));
  const faceOuter=[[-692,608],[-140,608],[-125,626],[125,626],[140,608],[692,608],[692,717],
    [541,724],[538,685],[162,685],[159,727],[117,724],[114,674],[-198,674],[-201,724],[-692,717]];
  function frontShape(){const s=poly(faceOuter);for(const v of vents)s.holes.push(rounded(v.y-v.w/2-3,v.z-v.h/2-3,v.w+6,v.h+6,5,T.Path));s.holes.push(rounded(305,641,90,39,8,T.Path));return s;}
  add(faceGeometry(frontShape(),-3.3,3,.7),M.substrate,'I01','I01-P04','帶實際開口的儀表台前基材','螢幕上開口、三風口與方向柱孔共用外形基準','substrate',3);
  add(faceGeometry(frontShape(),.7,1.1,.15),M.blackLeather,'I01','I01-P05','乘員側黑色包覆','有厚度的前皮覆；不跨越通風腔與螢幕接收口','leather',1.1);
  const tanOutline=[[-691,604],[-143,604],[-126,623],[126,623],[143,604],[691,604],[691,671],
    [400,671],[395,638],[305,638],[300,671],[124,671],[112,630],[-190,630],[-202,671],[-691,671]];
  for(const [offset,thickness,material,sub,layer] of [[2.4,2.5,M.substrate,'I01-P06','substrate'],[5.8,3.2,M.foam,'I01-P07','foam'],[9.9,1.2,M.tanLeather,'I01-P08','leather']]){
    add(faceGeometry(poly(tanOutline),offset,thickness,.2),material,'I01',sub,'棕色下襯 '+layer,'薄皮、泡棉、基材依共同面分層並讓出中央鞍座/轉向柱',''+layer,thickness);
  }
  // Substrate end faces, lower returns and rear ribs close the object without a solid box.
  function sectionRib(y){const v=(y+696)/1392,edge=[];for(let i=0;i<=24;i++){const u=i/24,p=top(u,v).addScaledVector(normalAt(top,u,v),-9.05);edge.push([p.x,p.z]);}const rear=edge[0][0],front=faceX(y,608)-4;
    const outer=[...edge,[faceX(y,681)-4,681],[front,608],[rear+25,600],[rear+2,640]],inner=[...edge.map(([x,z],i)=>[x+(i===0?10:i===24?-10:0),z-9]),[faceX(y,681)-15,681],[front-4,619],[rear+29,611],[rear+12,644]];
    const s=poly(outer);s.holes.push(poly(inner,T.Path));return s;}
  for(const side of [-1,1]){
    const shell=sectionRib(side*694);
    const g=plate(shell,3,.8);g.rotateX(Math.PI/2);g.translate(0,side*695+(side>0?0:3),0);
    add(g,M.substrate,'I01','I01-P09',(side>0?'駕駛':'乘客')+'端部有限厚度骨框','端部骨框顯示空腔與層邊，非黑色實心盒','substrate',3,{side});
  }
  function beamBetween(a,b,r=2){const g=new T.CylinderGeometry(r,r,a.distanceTo(b),8,1,false);const q=new T.Quaternion().setFromUnitVectors(V(0,1,0),b.clone().sub(a).normalize());g.applyQuaternion(q);g.translate(...a.clone().add(b).multiplyScalar(.5).toArray());return g;}
  // Rear supports are shaped sheet ribs. They do not cross the declared duct volumes.
  for(const y of [-678,-640,-216,127,162,542,685]){
    const s=sectionRib(y);
    const g=plate(s,2.2,.35);g.rotateX(Math.PI/2);g.translate(0,y,0);
    add(g,M.substrate,'I01','I01-P10','背側薄壁加強肋 '+y,'環狀板肋承接上殼，避開三個導管路徑','rib',2.2);
  }
  // The I05 mounting receivers are open at the top; existing display boxes exceed
  // this dashboard's 763 mm envelope and must remain external editable assemblies.
  for(const s of [{id:'driver',y:350,w:366,z:683,x:-352},{id:'centre',y:-42,w:302,z:674,x:-309}]){
    const shape=poly([[s.y-s.w/2,s.z],[s.y+s.w/2,s.z],[s.y+s.w/2,755],[s.y+s.w/2-4,755],[s.y+s.w/2-4,s.z+4],[s.y-s.w/2+4,s.z+4],[s.y-s.w/2+4,755],[s.y-s.w/2,755]]);
    const g=plate(shape,3,.6);const p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<p.count;i++){const y=p.getX(i),z=p.getY(i),x=p.getZ(i),nx=n.getZ(i),ny=n.getX(i),nz=n.getY(i);p.setXYZ(i,s.x+x,y,z);n.setXYZ(i,nx,ny,nz);}
    add(g,M.substrate,'I01','I01-P11',s.id+' I05接收U架','空的開頂接收架，既有螢幕保持原主責','receiver',3,{interfaceId:'I01-IF-SCREENS',rebuildsScreen:false});
  }
  for(const [a,b,z] of [[-677,-210,715],[552,674,715],[-181,98,668]]){
    const pts=[];for(let i=0;i<=64;i++){const y=a+(b-a)*i/64;pts.push(V(faceX(y,z)+2.1,y,z));}
    const c=new T.CatmullRomCurve3(pts);add(new T.TubeGeometry(c,96,1.45,8,false),M.alloy,'I01','I01-P12','細金屬橫飾帶','2.9 mm飾帶跟隨皮面並避讓螢幕','trim',2.9);
  }
  // A narrow stitching line is derived from the upper host and follows its crown.
  const stitch=[];for(let i=0;i<260;i++){const v0=.012+i/260*.976;const a=top(.92,v0),b=top(.92,v0+.0018);a.addScaledVector(normalAt(top,.92,v0),.25);b.addScaledVector(normalAt(top,.92,v0+.0018),.25);stitch.push(beamBetween(a,b,.23));}
  function merged(gs){const p=[],n=[],uv=[];for(const g0 of gs){const g=g0.index?g0.toNonIndexed():g0;const a=g.attributes.position;for(let i=0;i<a.count;i++){p.push(a.getX(i),a.getY(i),a.getZ(i));n.push(g.attributes.normal.getX(i),g.attributes.normal.getY(i),g.attributes.normal.getZ(i));uv.push(0,0);}g0.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return g;}
  add(merged(stitch),M.thread,'I01','I01-P13','上蓋連續車縫','縫線由同一上蓋面與法向派生','stitch',.46);
  function roundContour(w,h,r,N=64){const pts=[];for(let i=0;i<N;i++){
    const a=i/N*tau,c=Math.cos(a),s=Math.sin(a);const xr=w/2-r,zr=h/2-r;
    pts.push([Math.sign(c)*xr+r*c,Math.sign(s)*zr+r*s]);}return pts;}
  function ductGeometry(spec){const N=96,p=[],idx=[],uv=[];
    const axisX=Math.min(faceX(spec.y-spec.w/2,spec.z),faceX(spec.y+spec.w/2,spec.z))-22;
    const sections=[{t:0,w:spec.w,h:spec.h,y:spec.y,z:spec.z,x:null},
      {t:.2,w:spec.w,h:spec.h,y:spec.y,z:spec.z,x:axisX-28},
      {t:.63,w:spec.w*.61,h:spec.backH,y:(spec.y+spec.backY)/2,z:(spec.z+spec.backZ)/2,x:-502},
      {t:1,w:spec.backW,h:spec.backH,y:spec.backY,z:spec.backZ,x:-600}];
    for(const inside of [false,true])for(const sec of sections){const wall=inside?0:2.2;const contour=roundContour(sec.w+2*wall,sec.h+2*wall,Math.min(6,sec.h/4)+wall,N);
      contour.forEach(([y,z],i)=>{y+=sec.y;z+=sec.z;const x=sec.x??faceX(y,z)-2;p.push(x,y,z);uv.push(i/N,sec.t);});}
    const S=sections.length*N;for(let j=0;j<sections.length-1;j++)for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N,c=a+N,d=b+N;idx.push(a,c,b,b,c,d,S+a,S+b,S+c,S+b,S+d,S+c);}
    for(const j of [0,sections.length-1])for(let i=0;i<N;i++){const a=j*N+i,b=j*N+(i+1)%N;if(j===0)idx.push(a,b,S+a,b,S+b,S+a);else idx.push(a,S+a,b,b,S+a,S+b);}
    const g=geometry(p,idx,uv),colors=[];for(let i=0;i<p.length/3;i++){const c=i<S?1:.18;colors.push(c,c,c);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return {geometry:g,axisX};
  }
  for(const spec of vents){
    const hole=rounded(spec.y-spec.w/2,spec.z-spec.h/2,spec.w,spec.h,5,T.Path);
    const outer=rounded(spec.y-spec.w/2-4,spec.z-spec.h/2-4,spec.w+8,spec.h+8,8);outer.holes.push(hole);
    add(faceGeometry(outer,1.7,2,.5),M.alloy,'I06','I06-P01',spec.name+'前飾框','薄框包圍真實通風孔，隨儀表台曲面收口','vent-frame',2,{ventId:spec.id});
    const {geometry:dg,axisX}=ductGeometry(spec);
    const ductMaterial=M.duct.clone();ductMaterial.vertexColors=true;ductMaterial.name=M.duct.name+' cavity';
    add(dg,ductMaterial,'I06','I06-P02',spec.name+'中空後導管','2.2 mm導管從長孔漸縮到背部開口，前後均未封死','duct',2.2,{ventId:spec.id,backPort:{x:-600,y:spec.backY,z:spec.backZ,width:spec.backW,height:spec.backH},cavityAppearance:'INNER_VERTEX_DARKENING_NO_AIRFLOW_CLAIM'});
    for(let row=0;row<3;row++){
      const z=spec.z+(row-1)*(spec.h-9)/3;
      // Finite airfoil section, not a line. Shared straight shaft along Y.
      const section=poly([[-12,-.35],[-9,-.9],[7,-1.0],[12,-.2],[12,.2],[7,1.0],[-9,.9],[-12,.35]]);
      const blade=plate(section,spec.w-8,.15);blade.rotateX(Math.PI/2);blade.rotateY(-11*Math.PI/180);blade.translate(axisX,spec.y+(spec.w-8)/2,z);
      add(blade,M.blade,'I06','I06-P03',spec.name+'葉片 '+(row+1),'三片有限翼形截面葉片，直軸/固定作者11°角','blade',2,{ventId:spec.id,bladeIndex:row,pivotAxis:[0,1,0],pivot:[axisX,spec.y,z]});
      for(const side of [-1,1]){
        const pin=new T.CylinderGeometry(1.2,1.2,8,16,1,false);pin.translate(axisX,spec.y+side*(spec.w/2-2),z);
        add(pin,M.pin,'I06','I06-P04',spec.name+'葉片軸 '+row+'/'+side,'分件直軸與葉片同軸，穿入側壁承座','pivot',2.4,{ventId:spec.id,bladeIndex:row,side,pivotAxis:[0,1,0]});
        const ring=new T.Shape();ring.absarc(0,0,3.1,0,tau,false);const bore=new T.Path();bore.absarc(0,0,1.3,0,tau,true);ring.holes.push(bore);
        const bearing=plate(ring,2.6,.2);bearing.rotateX(Math.PI/2);bearing.translate(axisX,spec.y+side*(spec.w/2)+1.3,z);
        add(bearing,M.substrate,'I06','I06-P05',spec.name+'側壁軸承圈 '+row+'/'+side,'有真實孔的樞軸承座，非電動致動器','pivot-bearing',2.6,{ventId:spec.id,bladeIndex:row,side,pivotAxis:[0,1,0]});
      }
    }
    const tabShape=poly([[-4,-2.5],[-2.4,-2.5],[-2.4,.5],[2.4,.5],[2.4,-2.5],[4,-2.5],[4,2.5],[-4,2.5]]);
    const tab=plate(tabShape,24,.45);tab.rotateX(Math.PI/2);tab.rotateY(-11*Math.PI/180);tab.translate(axisX+9,spec.y+12,spec.z+3.1);
    add(tab,M.alloy,'I06','I06-P06',spec.name+'操作滑片','圓角操作件的底槽接收中央葉片；連動機構未驗','vent-control',1.5,{ventId:spec.id});
    const collar=rounded(spec.backY-spec.backW/2-4,spec.backZ-spec.backH/2-4,spec.backW+8,spec.backH+8,7);
    collar.holes.push(rounded(spec.backY-spec.backW/2,spec.backZ-spec.backH/2,spec.backW,spec.backH,5,T.Path));
    const cg=plate(collar,3,.3),p=cg.attributes.position,n=cg.attributes.normal;
    for(let i=0;i<p.count;i++){const y=p.getX(i),z=p.getY(i),x=p.getZ(i),ny=n.getX(i),nz=n.getY(i),nx=n.getZ(i);p.setXYZ(i,-603+x,y,z);n.setXYZ(i,nx,ny,nz);}
    add(cg,M.duct,'I06','I06-P07',spec.name+'後端開口接環','後端HVAC接合留空；實車接合/密封公差未驗','duct-collar',3,{ventId:spec.id});
  }
  definition.partDefinitions={
  "I01-P01": {
    "reference": "references/I01-P01-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "top / thinPatch",
    "receiverSubPart": "I01-P02",
    "insertionDirection": [
      0,
      0,
      -1
    ],
    "relationship": "上蓋皮覆向內貼合泡棉母面",
    "adopted": "柔和冠頂、黑皮與薄層滾邊",
    "rejected": "生成圖的隆起高度與縫線位置不是來源量測",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P02": {
    "reference": "references/I01-P02-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "top / thinPatch",
    "receiverSubPart": "I01-P03",
    "insertionDirection": [
      0,
      0,
      -1
    ],
    "relationship": "4.5 mm泡棉向下貼合上蓋基材",
    "adopted": "同母面泡棉曲殼",
    "rejected": "實物硬度、密度及黏結未驗",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P03": {
    "reference": "references/I01-P03-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "top / thinPatch",
    "receiverSubPart": "I01-P10",
    "insertionDirection": [
      0,
      0,
      -1
    ],
    "relationship": "上蓋基材落在內側板肋",
    "adopted": "薄壁曲殼、下翻邊",
    "rejected": "圖中固定耳與安裝孔位未採用",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P04": {
    "reference": "references/I01-P04-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / frontShape",
    "receiverSubPart": "I01-P09",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "前基材向擋風側與端框接合",
    "adopted": "具有風孔的連續曲面前基材",
    "rejected": "圖中孔口排布未採用；以I05包絡重建",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P05": {
    "reference": "references/I01-P05-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / frontShape",
    "receiverSubPart": "I01-P04",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "黑色前皮覆貼合前基材",
    "adopted": "細皮、圓滑孔緣",
    "rejected": "生成圖孔位與上緣不等於實際作者輪廓",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P06": {
    "reference": "references/I01-P06-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / tanOutline",
    "receiverSubPart": "I01-P04",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "下襯基材對接前基材下部",
    "adopted": "長條曲面與避讓開口",
    "rejected": "鞍座與柱孔以現有接口重建",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P07": {
    "reference": "references/I01-P07-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / tanOutline",
    "receiverSubPart": "I01-P06",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "下襯泡棉貼合下襯基材",
    "adopted": "柔性墊層與曲面厚度",
    "rejected": "圖中兩個上緣缺口並非實際裁片位置",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P08": {
    "reference": "references/I01-P08-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / tanOutline",
    "receiverSubPart": "I01-P07",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "棕色皮覆貼合下襯泡棉",
    "adopted": "棕皮曲面、細滾邊與開口",
    "rejected": "圖中額外凹口與固定孔未採用",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P09": {
    "reference": "references/I01-P09-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "sectionRib",
    "receiverSubPart": "I01-P03",
    "insertionDirection": [
      0,
      1,
      0
    ],
    "relationship": "左右端框由外向內接收上殼邊",
    "adopted": "真正開孔的端部框架",
    "rejected": "圖中厚肋、螺耳與孔位未採用",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P10": {
    "reference": "references/I01-P10-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "sectionRib",
    "receiverSubPart": "I01-P03",
    "insertionDirection": [
      0,
      0,
      1
    ],
    "relationship": "薄板肋頂緣承接上殼內面",
    "adopted": "環狀加強輪廓及大空腔",
    "rejected": "圖中厚殼與固定耳未採用",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P11": {
    "reference": "references/I01-P11-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "open U receivers",
    "receiverSubPart": "I01-P04",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "開頂U架向內靠合前基材，接收外部I05",
    "adopted": "薄U形、空中心、開頂",
    "rejected": "圖中卡扣未採用；I05真正緊固仍未定義",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P12": {
    "reference": "references/I01-P12-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / metal trim curve",
    "receiverSubPart": "I01-P05",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "細金屬飾帶貼合前皮覆的局部橫向曲線",
    "adopted": "細弓形金屬條與圓截面",
    "rejected": "三段長度及定位由作者曲面決定",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I01-P13": {
    "reference": "references/I01-P13-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "top / stitchedCurve",
    "receiverSubPart": "I01-P01",
    "insertionDirection": [
      0,
      0,
      -1
    ],
    "relationship": "縫線依上蓋邊緣走向配置",
    "adopted": "線跡與黑皮對比的局部材料樣本",
    "rejected": "採用局部線跡；未模擬真實穿針/皮孔",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P01": {
    "reference": "references/I06-P01-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "faceX / rounded through frame",
    "receiverSubPart": "I06-P02",
    "insertionDirection": [
      -1,
      0,
      0
    ],
    "relationship": "通風飾框包住後導管前口",
    "adopted": "圓角長形通孔與金屬細框",
    "rejected": "三個作者尺寸由vent規格控制",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P02": {
    "reference": "references/I06-P02-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "ductGeometry",
    "receiverSubPart": "I01-P04",
    "insertionDirection": [
      1,
      0,
      0
    ],
    "relationship": "後導管從背側接入前基材風孔",
    "adopted": "前寬後窄且前後空通的薄壁導管",
    "rejected": "圖像內壁不能證明流量/密封",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P03": {
    "reference": "references/I06-P03-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "airfoil section / Y extrusion",
    "receiverSubPart": "I06-P05",
    "insertionDirection": [
      0,
      1,
      0
    ],
    "relationship": "單葉片沿Y軸進入兩端樞軸承座",
    "adopted": "有限翼形薄葉片",
    "rejected": "圖中端耳未照搬；作者採分離直軸",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P04": {
    "reference": "references/I06-P04-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "cylinder with explicit endcaps",
    "receiverSubPart": "I06-P05",
    "insertionDirection": [
      0,
      1,
      0
    ],
    "relationship": "直軸沿Y進入承座與葉片端部",
    "adopted": "圓柱短軸",
    "rejected": "表面加工與倒角未量測",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P05": {
    "reference": "references/I06-P05-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "annulus / finite extrusion",
    "receiverSubPart": "I06-P02",
    "insertionDirection": [
      0,
      1,
      0
    ],
    "relationship": "有孔的軸承圈位於導管左右側壁",
    "adopted": "真正通孔的短環形承座",
    "rejected": "配合公差/摩擦/壽命未驗",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P06": {
    "reference": "references/I06-P06-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "grooved grip section / Y extrusion",
    "receiverSubPart": "I06-P03",
    "insertionDirection": [
      0,
      0,
      -1
    ],
    "relationship": "底槽接收中央葉片前緣",
    "adopted": "圓角小滑片與底部接收槽",
    "rejected": "生成圖為同一零件的正背兩姿態；槽深為作者尺寸",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  },
  "I06-P07": {
    "reference": "references/I06-P07-reference-r1.png",
    "referenceAuthority": "GENERATED_AUTHOR_REFERENCE",
    "geometrySource": "rounded annular collar",
    "receiverSubPart": "I06-P02",
    "insertionDirection": [
      1,
      0,
      0
    ],
    "relationship": "後接環沿+X套到導管出口",
    "adopted": "低矮矩形中空接環",
    "rejected": "外部HVAC接頭與密封公差未定義",
    "unverified": "機械配合、公差及拆裝可行性未驗"
  }
};
  for(const m of parts){const d=definition.partDefinitions[m.userData.subPart];
    m.userData.reference=d.reference;m.userData.originalReference=definition.source;m.userData.shapeSource={file:'source/dashboard.mjs',method:d.geometrySource,reference:d.reference,authority:d.referenceAuthority};
    const receivers=parts.filter(p=>p.userData.subPart===d.receiverSubPart&&(!m.userData.ventId||!p.userData.ventId||p.userData.ventId===m.userData.ventId)&&(m.userData.bladeIndex===undefined||p.userData.bladeIndex===undefined||p.userData.bladeIndex===m.userData.bladeIndex)&&(m.userData.side===undefined||p.userData.side===undefined||p.userData.side===m.userData.side));
    m.userData.receiving={subPart:d.receiverSubPart,ids:receivers.map(p=>p.userData.id),relationship:d.relationship};
    m.userData.orientation={basis:'WORLD_XYZ_MM',insertionDirection:m.userData.side?[0,-m.userData.side,0]:d.insertionDirection,status:'AUTHOR_ASSEMBLY_RELATION_NOT_VALIDATED_SERVICE_PATH'};
    const b=m.geometry.boundingBox;m.userData.physicalBoundary.bounds={min:b.min.toArray(),max:b.max.toArray()};m.userData.referenceAdoption={adopted:d.adopted,rejected:d.rejected};
  }
  root.updateMatrixWorld(true);definition.partCount=parts.length;definition.materialKeys=Object.keys(M);
  definition.constructionControls={upper:'top / thinPatch',front:'faceX / frontShape',lower:'tanOutline',vent:'vents / ductGeometry',screen:'open U receivers'};
  return {root,parts,definition};
}




