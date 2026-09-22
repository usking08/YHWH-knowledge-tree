/** GT01 front seats — SEATS-R2; authored construction, millimetres, +Z up / -X front.
 * Adopted identity: S00-seat-r2.png front/rear/side/exploded; panel 5 NOT adopted.
 * S01 hole topology: S01-back-frame-r2.png. This is an editable working model,
 * not a measured/manufacturable seat or an approved restraint mechanism.
 */
export function buildGT01Seats(T, materials = {}) {
  const root = new T.Group(), parts = [];
  root.name = 'GT01 雙前座 / SEATS-R2';
  root.userData = {id:'GT01-SEATS',system:'seats',revision:'SEATS-R2',units:'mm',up:'+Z',front:'-X',
    status:'WORK_IN_PROGRESS',truth:'AUTHOR_DESIGN',source:'S00-seat-r2.png',
    excludedReference:'S00 R2 panel 5 rail mounting detail',seatOrigins:[[190,350,304],[190,-350,304]]};
  const std=(color,roughness=.55,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const M={
    leather:materials.leather||new T.MeshPhysicalMaterial({color:0x99714b,roughness:.77,sheen:.35,sheenColor:0xd1ac79}),
    metal:materials.metal||std(0x515d60,.38,.85),
    alloy:materials.alloy||std(0xa9b0b3,.3,.92),
    black:materials.black||std(0x171c1c,.46,.12),
    rubber:materials.rubber||std(0x121714,.9),
    stitch:materials.stitch||std(0xbfa179,.88),
    foam:std(0xd9d1b5,.97),
    red:std(0xb53326,.64),
    seam:std(0x5e412a,.86),scrim:std(0x857760,.97),
    shell:std(0x262d2d,.53,.08)
  };
  M.foam.name='Seat | moulded polyurethane foam';M.shell.name='Seat | thin moulded rear shell';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  const V=(x,y,z)=>new T.Vector3(x,y,z),axisY=V(0,1,0),axisZ=V(0,0,1);
  const geometryCache=new Map();
  const backRows=[
    // z, half-width, front-X, rear-X, side-bolster projection, centre-panel half-width
    [156,0,172,172,0,0],[166,146,125,212,7,116],[190,190,107,220,18,138],
    [235,222,87,231,38,144],[290,237,83,240,58,145],[370,229,93,252,62,143],
    [435,214,113,265,52,138],[490,203,132,277,38,125],[545,235,139,282,55,113],
    [590,244,150,288,57,108],[635,222,171,296,41,105],[680,172,189,303,19,102],
    [720,124,205,308,5,93],[790,112,224,318,0,83],[835,94,242,321,0,71],
    [852,66,255,313,0,48],[860,0,283,283,0,0]
  ];
  const cushionRows=[
    // x, half-width, underside-Z, top-centre-Z, side-bolster rise, centre-panel half-width
    [-276,0,145,145,0,0],[-269,205,114,193,8,155],[-250,237,101,203,22,160],
    [-210,250,98,197,33,159],[-160,250,101,187,43,158],[-80,245,105,175,47,151],
    [0,232,108,161,49,145],[90,210,113,153,39,134],[145,190,121,155,22,117],
    [170,154,128,153,8,96],[181,0,142,142,0,0]
  ];
  function sample(rows,q) {
    q=clamp(q,rows[0][0],rows.at(-1)[0]);let i=0;while(i<rows.length-2&&q>rows[i+1][0])i++;
    const a=rows[i],b=rows[i+1],h=b[0]-a[0],t=(q-a[0])/h;
    return a.map((v,j)=>{if(!j)return q;const sec=(b[j]-a[j])/h;
      const prev=i?(a[j]-rows[i-1][j])/(a[0]-rows[i-1][0]):sec;
      const next=i+2<rows.length?(rows[i+2][j]-b[j])/(rows[i+2][0]-b[0]):sec;
      const slope=(p,s)=>p*s<=0?0:2*p*s/(p+s);
      const m0=slope(prev,sec),m1=slope(sec,next);
      return (2*t**3-3*t*t+1)*v+(t**3-2*t*t+t)*h*m0+(-2*t**3+3*t*t)*b[j]+(t**3-t*t)*h*m1;
    });
  }
  const spow=(x,p)=>Math.sign(x)*Math.abs(x)**p;
  function backPoint(theta,z) {
    const [,w,front,rear,amp,cw]=sample(backRows,z),sn=Math.sin(theta),cs=Math.cos(theta),y=w*sn;
    let x=(front+rear)/2+(rear-front)/2*spow(cs,.66);
    const facing=smooth(0,.32,-cs);
    x-=amp*Math.exp(-(((Math.abs(sn)-.8)/.19)**2))*facing;
    const span=[[156,235],[235,435],[435,680],[680,860]].find(([a,b])=>z>=a&&z<=b)||[680,860];
    const panelCrown=Math.sin(Math.PI*clamp((z-span[0])/(span[1]-span[0]),0,1));
    x-=9*panelCrown*Math.exp(-((y/Math.max(1,cw*.92))**6))*facing;
    // Compressed seam channels belong to the leather host, not floating lines.
    x+=(1.65*Math.exp(-(((Math.abs(y)-cw)/2.0)**2))
      +3.0*Math.exp(-(((z-435)/3.1)**2))*Math.exp(-((y/130)**6))
      +2.4*Math.exp(-(((z-680)/3.0)**2))*Math.exp(-((y/100)**6))
      +.35*Math.exp(-((y/1.5)**2)))*facing;
    return V(x,y,z);
  }
  function backNormal(theta,z) {
    if(z<=156.001)return V(0,0,-1);if(z>=859.999)return V(0,0,1);
    const a=backPoint(theta+.0002,z).sub(backPoint(theta-.0002,z));
    const b=backPoint(theta,Math.min(860,z+.02)).sub(backPoint(theta,Math.max(156,z-.02)));
    return a.cross(b).normalize();
  }
  function cushionPoint(theta,x) {
    const [,w,bottom,top,amp,cw]=sample(cushionRows,x),sn=Math.sin(theta),cs=Math.cos(theta),y=w*sn;
    const facing=smooth(0,.32,cs);
    let z=(bottom+top)/2+(top-bottom)/2*spow(cs,.69);
    z+=amp*Math.exp(-(((Math.abs(sn)-.81)/.18)**2))*facing;
    z-=(1.6*Math.exp(-(((Math.abs(y)-cw)/1.9)**2))+1.15*Math.exp(-(((x+185)/2.0)**2))*Math.exp(-((y/156)**6)))*facing;
    return V(x,y,z);
  }
  function cushionNormal(theta,x) {
    if(x<=-275.999)return V(-1,0,0);if(x>=180.999)return V(1,0,0);
    const a=cushionPoint(theta,Math.min(181,x+.02)).sub(cushionPoint(theta,Math.max(-276,x-.02)));
    const b=cushionPoint(theta+.0002,x).sub(cushionPoint(theta-.0002,x));return a.cross(b).normalize();
  }
  function host(kind,theta,q,offset=0) {
    const p=kind==='back'?backPoint(theta,q):cushionPoint(theta,q);
    const n=kind==='back'?backNormal(theta,q):cushionNormal(theta,q);
    return {p:p.addScaledVector(n,offset),n,uv:kind==='back'?[theta/(Math.PI*2),q/700]:[q/450,theta/(Math.PI*2)]};
  }
  function addMesh(parent,geo,mat,name) {
    const mesh=new T.Mesh(geo,mat);mesh.name=name;mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  // Surface patches share the same host evaluator, including all boundary positions/normals.
  // Perimeter walls close a true 1.65 mm cover; every patch has UV coordinates.
  function surface(fn,nu,nv,thickness=0) {
    const pos=[],norm=[],uv=[],outer=[],outerIdx=[],innerIdx=[],edgeIdx=[];let idx=outerIdx;
    function vertex(p,n,t){const id=pos.length/3;pos.push(p.x,p.y,p.z);norm.push(n.x,n.y,n.z);uv.push(...t);return id;}
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const s=fn(i/nu,j/nv);outer.push(s);vertex(s.p,s.n,s.uv);}
    const layer=(nu+1)*(nv+1);
    if(thickness)for(const s of outer)vertex(s.p.clone().addScaledVector(s.n,-thickness),s.n.clone().negate(),s.uv);
    function tri(a,b,c){const pa=V(...pos.slice(a*3,a*3+3)),pb=V(...pos.slice(b*3,b*3+3)),pc=V(...pos.slice(c*3,c*3+3));
      const cross=pb.sub(pa).cross(pc.sub(pa));if(cross.lengthSq()<1e-12)return;
      const n=V(norm[a*3]+norm[b*3]+norm[c*3],norm[a*3+1]+norm[b*3+1]+norm[c*3+1],norm[a*3+2]+norm[b*3+2]+norm[c*3+2]);
      if(cross.dot(n)<0)idx.push(a,c,b);else idx.push(a,b,c);
    }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx=outerIdx;tri(a,b,c);tri(b,d,c);if(thickness){idx=innerIdx;tri(a+layer,c+layer,b+layer);tri(b+layer,c+layer,d+layer);}}
    if(thickness){const edge=[];for(let i=0;i<=nu;i++)edge.push(i);for(let j=1;j<=nv;j++)edge.push(j*(nu+1)+nu);for(let i=nu-1;i>=0;i--)edge.push(nv*(nu+1)+i);for(let j=nv-1;j>0;j--)edge.push(j*(nu+1));
      for(let i=0;i<edge.length;i++){const a=outer[edge[i]],b=outer[edge[(i+1)%edge.length]],ai=a.p.clone().addScaledVector(a.n,-thickness),bi=b.p.clone().addScaledVector(b.n,-thickness);
        const normal=b.p.clone().sub(a.p).cross(ai.clone().sub(a.p)).normalize();if(normal.lengthSq()<.1)continue;
        const ids=[vertex(a.p,normal,[0,0]),vertex(b.p,normal,[1,0]),vertex(ai,normal,[0,1]),vertex(bi,normal,[1,1])];idx=edgeIdx;tri(ids[0],ids[1],ids[2]);tri(ids[1],ids[3],ids[2]);}
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex([...outerIdx,...innerIdx,...edgeIdx]);
    g.addGroup(0,outerIdx.length,0);if(innerIdx.length)g.addGroup(outerIdx.length,innerIdx.length,1);if(edgeIdx.length)g.addGroup(outerIdx.length+innerIdx.length,edgeIdx.length,2);return g;
  }
  function roundedPath(points,r=6,asShape=false) {
    const p=asShape?new T.Shape():new T.Path();
    const corners=points.map((a,i)=>{const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];const d0=Math.hypot(a[0]-prev[0],a[1]-prev[1]),d1=Math.hypot(next[0]-a[0],next[1]-a[1]);const rr=Math.min(r,d0*.36,d1*.36);return {a,entry:[a[0]+(prev[0]-a[0])*rr/d0,a[1]+(prev[1]-a[1])*rr/d0],exit:[a[0]+(next[0]-a[0])*rr/d1,a[1]+(next[1]-a[1])*rr/d1]};});
    p.moveTo(...corners[0].entry);for(const c of corners){p.lineTo(...c.entry);p.quadraticCurveTo(...c.a,...c.exit);}p.closePath();return p;
  }
  function roundedRect(x0,y0,x1,y1,r=6){return roundedPath([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],r);}
  function circleHole(x,y,r){const h=new T.Path();h.absarc(x,y,r,0,Math.PI*2,false);return h;}
  function extruded(shape,depth,map,{bevel=0,segments=6}={}) {
    const geo=new T.ExtrudeGeometry(shape,{depth,curveSegments:segments,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2});
    const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const q=map(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,q.x,q.y,q.z);}
    // Circular path endpoints can coincide after Float32 conversion. Remove only
    // zero-area generated faces; the annular holes and their sidewalls stay intact.
    const valid=[],a=V(0,0,0),b=V(0,0,0),c=V(0,0,0);
    for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-10)valid.push(i,i+1,i+2);}
    geo.setIndex(valid);geo.clearGroups();geo.computeVertexNormals();return geo;
  }
  function ring(parent,x,y,z,r,inner,depth,mat,name,axis='y') {
    const key=`ring:${r}:${inner}:${depth}:${axis}`;
    if(!geometryCache.has(key)){const sh=new T.Shape();sh.absarc(0,0,r,0,Math.PI*2,false);sh.holes.push(circleHole(0,0,inner));geometryCache.set(key,extruded(sh,depth,(a,b,d)=>axis==='y'?V(a,d-depth/2,b):V(a,b,d-depth/2),{segments:24}));}
    const m=addMesh(parent,geometryCache.get(key),mat,name);m.position.set(x,y,z);return m;
  }
  function cylinder(parent,x,y,z,r,h,mat,name,axis='z',segments=18) {
    const k=`cyl:${r}:${h}:${segments}`;if(!geometryCache.has(k))geometryCache.set(k,new T.CylinderGeometry(r,r,h,segments));
    const m=addMesh(parent,geometryCache.get(k),mat,name);m.position.set(x,y,z);if(axis==='z')m.rotation.x=Math.PI/2;else if(axis==='x')m.rotation.z=Math.PI/2;return m;
  }
  function tube(parent,points,r,mat,name,segments=100) {
    return addMesh(parent,new T.TubeGeometry(new T.CatmullRomCurve3(points,false,'centripetal'),segments,r,6,false),mat,name);
  }
  function thread(parent,points,mat=M.stitch,r=.28){
    const curve=new T.CatmullRomCurve3(points,false,'centripetal'),length=curve.getLength(),pitch=2.4,count=Math.max(1,Math.floor(length/pitch));
    const key=`stitch:${r}`;if(!geometryCache.has(key))geometryCache.set(key,new T.CylinderGeometry(r,r,1.25,6));
    const inst=new T.InstancedMesh(geometryCache.get(key),mat,count),q=new T.Quaternion(),matrix=new T.Matrix4(),scale=V(1,1,1);
    for(let i=0;i<count;i++){const t=(i+.5)/count,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();q.setFromUnitVectors(axisY,tangent);matrix.compose(p,q,scale);inst.setMatrixAt(i,matrix);}
    inst.name='沿皮套宿主的雙車縫線';inst.userData={constructionKey:'TOPSTITCH',instanceRole:'Individual stitch segments',pitchMm:pitch,stitchLengthMm:1.25};inst.castShadow=inst.receiveShadow=true;inst.instanceMatrix.needsUpdate=true;inst.computeBoundingSphere();parent.add(inst);return inst;
  }
  const outline=[[-174,142],[-183,200],[-199,410],[-195,505],[-190,548],[-158,606],[-110,685],[-94,754],[-77,817],[-48,833],[48,833],[77,817],[94,754],[110,685],[158,606],[190,548],[195,505],[199,410],[183,200],[174,142],[130,142],[118,185],[-118,185],[-130,142]];
  const frameHoles=[
    roundedPath([[-68,684],[68,684],[51,797],[39,808],[-39,808],[-51,797]],12),
    roundedRect(-50,553,50,650,13),
    roundedRect(-101,220,-12,497,17),roundedRect(12,220,101,497,17),
    roundedPath([[-174,252],[-130,252],[-125,479],[-170,475]],12),
    roundedPath([[130,252],[174,252],[170,475],[125,479]],12),
    roundedPath([[-156,552],[-108,548],[-106,625],[-126,614]],9),
    roundedPath([[108,548],[156,552],[126,614],[106,625]],9)
  ];
  function rearX(y,z) {const row=sample(backRows,clamp(z,158,858)),ratio=clamp(y/Math.max(1,row[1]),-.985,.985);return backPoint(Math.asin(ratio),clamp(z,158,858)).x;}
  function frameX(y,z){return rearX(y,z)-34;}
  function pathPoints(path){const p=path.getPoints(10);if(p.length>1&&p[0].distanceTo(p.at(-1))<.001)p.pop();return p;}
  function stripAlongPath(path,offset0,offset1,xFn,rise=0) {
    const pts=pathPoints(path);let area=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];area+=a.x*b.y-b.x*a.y;}
    const sign=area>0?1:-1,pos=[],uv=[],indices=[];
    for(let i=0;i<=pts.length;i++){const p=pts[i%pts.length],a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length],d=b.clone().sub(a).normalize(),n=new T.Vector2(d.y*sign,-d.x*sign);
      for(let j=0;j<=4;j++){const t=j/4,o=lerp(offset0,offset1,t),y=p.x+n.x*o,z=p.y+n.y*o;pos.push(xFn(y,z)+rise*Math.sin(Math.PI*t),y,z);uv.push(i/pts.length,t);}}
    for(let i=0;i<pts.length;i++)for(let j=0;j<4;j++){const a=i*5+j,b=a+5;indices.push(a,b,a+1,b,b+1,a+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
  }
  function makeBackFrame(g) {
    const sh=roundedPath(outline,9,true);for(const h of frameHoles)sh.holes.push(h);
    for(const side of [-1,1])for(const [y,z,r] of [[181,300,3.5],[185,398,3.5],[181,490,3.5],[167,524,5],[108,660,4.3],[87,720,3],[167,212,3.6]])sh.holes.push(circleHole(side*y,z,r));
    for(const y of [-70,0,70])sh.holes.push(circleHole(y,523,3.7));
    addMesh(g,extruded(sh,3.2,(y,z,d)=>V(frameX(y,z)+d,y,z),{segments:10}),M.metal,'S01 有孔沖壓椅背腹板；腰部中央直腹板保留');
    for(const h of frameHoles)addMesh(g,stripAlongPath(h,1.2,7.2,(y,z)=>frameX(y,z),-3.0),M.metal,'S01 孔緣沖壓加勁凸筋');
    // The folded perimeter has a real 2.8 mm sheet gauge and a 6 mm closing lip.
    const p=pathPoints(sh);let area=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];area+=a.x*b.y-b.x*a.y;}
    const winding=area>0?1:-1;
    function edgeBand(width){const s=new T.Shape(p),inside=[];for(let i=0;i<p.length;i++){const a=p[(i+p.length-1)%p.length],b=p[(i+1)%p.length],d=b.clone().sub(a).normalize();inside.push(p[i].clone().add(new T.Vector2(-d.y*winding,d.x*winding).multiplyScalar(width)));}s.holes.push(new T.Path(inside));return s;}
    addMesh(g,extruded(edgeBand(2.8),14.8,(y,z,d)=>V(frameX(y,z)+3.2+d,y,z)),M.metal,'S01 沖壓側樑 18 mm 回折翻邊');
    addMesh(g,extruded(edgeBand(6),3.2,(y,z,d)=>V(frameX(y,z)+16+d,y,z)),M.metal,'S01 U 型側樑收口唇');
    for(const side of [-1,1]) {
      const ear=roundedPath([[116,111],[178,108],[205,174],[193,208],[164,206]],8,true);ear.holes.push(circleHole(150,135,11));
      addMesh(g,extruded(ear,5,(x,z,d)=>V(x,side*(180+d),z)),M.metal,'S01 下端沖壓樞軸耳與通孔');
      ring(g,150,side*190,135,29,11,20,M.metal,'S01 調角器穿軸座','y');
    }
    g.userData.openings={headrest:1,upperBack:1,centralLumbar:2,outerLumbar:2,shoulder:2,centralWebWidth:24};
    g.userData.gaugeMm=3.2;
  }
  function panZ(x,y){return 94+8*((x+60)/280)**2+3*(y/210)**2;}
  function makeSeatPan(g) {
    const outer=roundedPath([[-227,-185],[-213,-210],[192,-210],[212,-182],[212,182],[192,210],[-213,210],[-227,185]],18,true);
    for(const y of [-105,15])for(const x of [-178,-14])outer.holes.push(roundedRect(x,y,x+139,y+88,15));
    for(const side of [-1,1])for(const x of [-180,180])outer.holes.push(circleHole(x,side*200,6));
    addMesh(g,extruded(outer,3,(x,y,d)=>V(x,y,panZ(x,y)+d),{segments:8}),M.metal,'S02 沖壓座墊盆骨架與四個真開孔');
    for(const side of [-1,1]){
      const sill=roundedPath([[-222,84],[-222,109],[-185,122],[120,130],[191,165],[205,147],[184,85]],9,true);
      for(const x of [-155,-45,66])sill.holes.push(roundedRect(x,91,x+60,111,7));
      addMesh(g,extruded(sill,3.2,(x,z,d)=>V(x,side*(204+d),z),{segments:8}),M.metal,'S02 成形座墊側樑與減重孔');
    }
    // Rolled front/rear lips remain broad formed sheet sections.
    for(const x of [-218,169]){
      const sh=roundedRect(-196,0,196,27,5);const s=new T.Shape(sh.getPoints(8));
      addMesh(g,extruded(s,3,(y,z,d)=>V(x+d,y,panZ(x,y)+z)),M.metal,'S02 橫向承托翻邊');
    }
  }
  const lowerSection=[[-23,14],[23,14],[23,44],[10,44],[10,38],[17,38],[17,18],[-17,18],[-17,38],[-10,38],[-10,44],[-23,44]];
  const upperSection=[[-16,24],[-4,24],[-4,50],[4,50],[4,24],[16,24],[16,28],[8,28],[8,56],[-8,56],[-8,28],[-16,28]];
  function makeRails(g) {
    for(const side of [-1,1]) {
      const yc=side*165;
      for(const [profile,length,x0,label] of [[lowerSection,520,-260,'下固定 C 型軌'],[upperSection,460,-230,'上移動反 C 型軌']]){
        const sh=roundedPath(profile,.45,true);
        addMesh(g,extruded(sh,length,(y,z,x)=>V(x+x0,y+yc,z),{segments:3}),M.metal,`S03 ${label}`);
      }
      for(let x=-210;x<=210;x+=60)for(const y of [-12,12])cylinder(g,x,yc+y,21,3,5,M.alloy,'S03 滾動支承；位於軌道內','y',12);
      for(const x of [-225,225]) {
        const foot=roundedPath([[x-27,yc-side*26],[x+27,yc-side*26],[x+32,yc+side*56],[x-32,yc+side*56]],7,true);
        foot.holes.push(circleHole(x,yc+side*40,6.5));
        addMesh(g,extruded(foot,8,(a,b,d)=>V(a,b,d),{segments:7}),M.metal,'S03 四點落地安裝座與穿孔');
        const pad=roundedPath([[x-16,yc-18],[x+16,yc-18],[x+16,yc+18],[x-16,yc+18]],3,true);
        addMesh(g,extruded(pad,6,(a,b,d)=>V(a,b,8+d)),M.metal,'S03 固定軌承腳墊座');
      }
      for(const x of [-180,180]) {
        const tab=roundedPath([[x-25,yc-side*13],[x+25,yc-side*13],[x+25,yc+side*48],[x-25,yc+side*48]],5,true);
        tab.holes.push(circleHole(x,yc+side*35,6));
        addMesh(g,extruded(tab,7,(a,b,d)=>V(a,b,62+d)),M.metal,'S03 上軌外伸螺栓座；不侵入滾道');
        const pedestal=roundedPath([[x-19,yc-7],[x+19,yc-7],[x+19,yc+7],[x-19,yc+7]],2,true);
        addMesh(g,extruded(pedestal,6,(a,b,d)=>V(a,b,56+d)),M.metal,'S03 上軌接合柱');
        const boltY=yc+side*35,pan=panZ(x,boltY);
        ring(g,x,boltY,(69+pan)/2,13,6,pan-69,M.metal,'S03 座盆承托中空墊柱','z');
      }
      for(const x of [-244,244])cylinder(g,x,yc,47,4,6,M.alloy,'S03 軌端止擋銷','y');
    }
    tube(g,[V(-221,-165,55),V(-249,-151,64),V(-269,-113,70),V(-271,0,71),V(-269,113,70),V(-249,151,64),V(-221,165,55)],4.5,M.metal,'S03 雙軌解鎖連桿',70);
    tube(g,[V(-271,-50,71),V(-272,0,71),V(-271,50,71)],6.5,M.rubber,'S03 解鎖握把',24);
    g.userData.railSection={length:520,centres:[-165,165],centreDistance:330,lowerOpeningWidth:20,upperNeckWidth:16,nominalNeckSideClearance:2};
    g.userData.floorMounts=[[-225,-205,0],[225,-205,0],[-225,205,0],[225,205,0]];
  }
  function makeRecliners(g) {
    for(const side of [-1,1]) {
      const sh=roundedPath([[88,83],[169,78],[196,114],[189,163],[151,180],[111,154]],10,true);
      sh.holes.push(circleHole(150,135,11));for(const [x,z] of [[111,107],[169,99],[174,156]])sh.holes.push(circleHole(x,z,4));
      addMesh(g,extruded(sh,5,(x,z,d)=>V(x,side*(204+d),z)),M.metal,'S04 固定調角側板與穿軸孔');
      ring(g,150,side*216,135,39,11,13,M.black,'S04 調角器固定殼','y');
      ring(g,150,side*225,135,29,11,4,M.alloy,'S04 調角器輸出環','y');
      ring(g,150,side*197,135,10.5,6,45,M.alloy,'S04 連接骨架與側板的中空樞軸','y');
      for(let i=0;i<4;i++) {const a=i*Math.PI/2+.4;cylinder(g,150+29*Math.cos(a),side*226,135+29*Math.sin(a),3.4,5,M.alloy,'S04 外殼固定螺釘','y',6);}
    }
    ring(g,150,0,135,9,6.5,354,M.metal,'S04 同軸橫向聯結管','y');
    g.userData.pivot={origin:[150,0,135],axis:[0,1,0],kinematicStatus:'STATIC_AUTHOR_DESIGN'};
  }
  function makeUpholstery(foamBack,foamCushion,backCover,cushionCover) {
    addMesh(foamBack,surface((u,v)=>host('back',u*Math.PI*2,lerp(156,860,v),-3.0),160,220),M.foam,'S05 連續成形椅背泡棉；頭枕與肩腰承托');
    // S06 is one physical foam body. Its surface domains use exactly the S08
    // triangles below, so a dense analytic foam cannot pierce coarse skin chords.
    function backPatch(name,z0,z1,range,nu=22,nv=36){const fn=(u,v)=>{const z=lerp(z0,z1,v),[,w,,,,cw]=sample(backRows,z),a=Math.asin(clamp(cw/Math.max(w,.001),0,.96));const [t0,t1]=range(a);return host('back',lerp(t0,t1,u),z);};return addMesh(backCover,surface(fn,nu,nv,1.65),[M.leather,M.scrim,M.leather],name);}
    backPatch('S07 下背皮革承托裁片',156,235,a=>[Math.PI-a,Math.PI+a],30,25);
    backPatch('S07 腰部皮革承托裁片',235,435,a=>[Math.PI-a,Math.PI+a],30,42);
    backPatch('S07 上背皮革承托裁片',435,680,a=>[Math.PI-a,Math.PI+a],30,44);
    backPatch('S07 一體頭枕正面皮革裁片',680,860,a=>[Math.PI-a,Math.PI+a],30,44);
    // Every adjoining seam uses the same longitudinal sample stations. Equal
    // evaluators alone did not prevent cracks between different chord samples.
    function backSide(name,z0,z1,nv,sign){const fn=(u,v)=>{const z=lerp(z0,z1,v),[,w,,,,cw]=sample(backRows,z),a=Math.asin(clamp(cw/Math.max(w,.001),0,.96));
      const shellWidth=sample([[156,132],[235,174],[435,181],[590,185],[680,147],[707,119]],clamp(z,156,707))[1];
      const edge=z>=707?Math.PI/2-.28:Math.asin(clamp((shellWidth-9)/Math.max(w,.001),.18,.96));
      const theta=sign>0?lerp(edge,Math.PI-a,u):lerp(Math.PI+a,Math.PI*2-edge,u);return host('back',theta,z);};
      const m=addMesh(backCover,surface(fn,40,nv,1.65),[M.leather,M.scrim,M.leather],name);m.userData.referencePart=z0>=680?'S07-HEAD-SIDE':'S07-BOLSTER';return m;}
    for(const side of [-1,1])for(const [z0,z1,nv] of [[156,235,25],[235,435,42],[435,680,44],[680,860,44]])backSide('S07 '+(side>0?'左':'右')+'側襠裁片 '+z0,z0,z1,nv,side);
    const headBack=backPatch('S07 頭枕後裁片',707,860,()=>[-Math.PI/2+.28,Math.PI/2-.28],48,64);
    headBack.userData={constructionKey:'HEAD-BACK',referencePart:'S07-HEAD-BACK',reference:'S07-HEAD-BACK-r1.png',sourceConflict:'S07 R1 open back versus S00 R2 tan assembled headrest; separate rear panel preserves the established assembled seat.',independentReferenceStatus:'REFERENCE_READY_MODEL_UNVERIFIED'};
    // Open lower rear edges, turned seam allowances, and two listing tabs.
    for(const sign of [-1,1]) {
      const fn=(u,v)=>{const z=lerp(175,700,v),[,w]=sample(backRows,z),shellWidth=sample([[156,132],[235,174],[435,181],[590,185],[680,147],[707,119]],z)[1],edge=Math.asin(clamp((shellWidth-9)/Math.max(w,.001),.18,.96)),theta=sign>0?edge:Math.PI*2-edge;
        const h=host('back',theta,z,-1.7),turn=V(-1,0,0).multiplyScalar(lerp(0,8,u));return {p:h.p.add(turn),n:V(0,sign,0),uv:[u,z/700]};};
      addMesh(backCover,surface(fn,3,120,.95),[M.scrim,M.scrim,M.scrim],'S07 後開口折返縫份');
      const tabShape=roundedPath([[-13,0],[13,0],[13,63],[-13,63]],3,true);
      const tab=addMesh(backCover,extruded(tabShape,1.5,(u,v,d)=>V(190+d,sign*115+u,119+v)),M.scrim,'S07 下緣固定帶');
      tab.userData.constructionKey='LOWER-LISTING-TAB';
    }
    function cushionPatch(name,x0,x1,range,nu=26,nv=44){const fn=(u,v)=>{const x=lerp(x0,x1,v),[,w,,,,cw]=sample(cushionRows,x),a=Math.asin(clamp(cw/Math.max(w,.001),0,.96));const [t0,t1]=range(a);return host('cushion',lerp(t0,t1,u),x);};addMesh(cushionCover,surface(fn,nu,nv,1.65),[M.leather,M.scrim,M.leather],name);addMesh(foamCushion,surface((u,v)=>{const q=fn(u,v);q.p.addScaledVector(q.n,-2.15);return q;},nu,nv),M.foam,'S06 成形泡棉表面區域：'+name);}
    cushionPatch('S08 獨立前鼻皮革裁片',-276,-185,a=>[-a,a],32,32);
    cushionPatch('S08 中央凹曲坐面皮革裁片',-185,181,a=>[-a,a],32,128);
    for(const [x0,x1,nv] of [[-276,-185,32],[-185,181,128]]){
      cushionPatch('S08 左大腿側翼皮革裁片 '+x0,x0,x1,a=>[a,Math.PI/2],28,nv);
      cushionPatch('S08 右大腿側翼皮革裁片 '+x0,x0,x1,a=>[-Math.PI/2,-a],28,nv);
      cushionPatch('S08 坐墊下緣包覆皮革裁片 '+x0,x0,x1,()=>[Math.PI/2,Math.PI*1.5],44,nv);
    }
    for(const sign of [-1,1]) {
      for(const offset of [-2.0,2.0]) {
        const bp=[];for(let i=0;i<=100;i++){const z=lerp(187,842,i/100),[,w,,,,cw]=sample(backRows,z),theta=Math.PI-sign*Math.asin(clamp((cw+offset)/w,0,.98));bp.push(host('back',theta,z,.38).p);}thread(backCover,bp);
        const cp=[];for(let i=0;i<=82;i++){const x=lerp(-255,163,i/82),[,w,,,,cw]=sample(cushionRows,x),theta=sign*Math.asin(clamp((cw+offset)/w,0,.98));cp.push(host('cushion',theta,x,.38).p);}thread(cushionCover,cp);
      }
    }
    for(const z0 of [235,435,680])for(const dz of [-2.5,2.5]){const z=z0+dz,[,w,,,,cw]=sample(backRows,z),pts=[];for(let i=0;i<=45;i++){const y=lerp(-cw+3,cw-3,i/45),theta=Math.PI-Math.asin(y/w);pts.push(host('back',theta,z,.38).p);}thread(backCover,pts);}
    for(const theta of [-Math.PI/2+.28,Math.PI/2-.28])for(const d of [-.012,.012]){const pts=[];for(let i=0;i<=64;i++)pts.push(host('back',theta+d,lerp(710,849,i/64),.4).p);const line=thread(headBack,pts);line.userData.referencePart='S07-HEAD-BACK';line.userData.constructionKey='HEAD-BACK-STITCH';}
    for(const dz of [3,7]){const pts=[];for(let i=0;i<=60;i++)pts.push(host('back',lerp(-Math.PI/2+.31,Math.PI/2-.31,i/60),707+dz,.4).p);const line=thread(headBack,pts);line.userData.referencePart='S07-HEAD-BACK';line.userData.constructionKey='HEAD-BACK-STITCH';}
    for(const dx of [-2.5,2.5]){const x=-185+dx,[,w,,,,cw]=sample(cushionRows,x),pts=[];for(let i=0;i<=50;i++)pts.push(host('cushion',Math.asin(lerp(-cw+3,cw-3,i/50)/w),x,.38).p);thread(cushionCover,pts);}
    backCover.userData.coverGaugeMm=cushionCover.userData.coverGaugeMm=1.65;
    backCover.userData.uv=cushionCover.userData.uv='Host-continuous UV; supplied leather bumpMap retained';
  }
  function makeRearShell(g) {
    const shellWidths=[[0,143],[.12,174],[.38,181],[.63,185],[.8,178],[1,119]];
    function point(u,v){const w=sample(shellWidths,v)[1],yy=lerp(-1,1,u),y=w*yy,z=lerp(168,707,v)+13*yy**4*(1-2*v);
      const ribs=4.5*Math.exp(-(((Math.abs(yy)-.72)/.12)**2))*Math.sin(Math.PI*v)**2;
      return V(rearX(y,z)+4.0+ribs,y,z);
    }
    const fn=(u,v)=>{const p=point(u,v),a=point(Math.min(1,u+.001),v).sub(point(Math.max(0,u-.001),v)),b=point(u,Math.min(1,v+.001)).sub(point(u,Math.max(0,v-.001)));const n=a.cross(b).normalize();if(n.x<0)n.negate();return {p,n,uv:[u,v]};};
    addMesh(g,surface(fn,44,84,3.6),M.shell,'S09 薄壁後殼；側凹線與翻回邊');
    for(const side of [-1,1]) {
      const pts=[];for(let i=0;i<=64;i++){const v=i/64;pts.push(point(side>0?.99:.01,v).add(V(.5,0,0)));}
      tube(g,pts,1.6,M.black,'S09 殼邊緣圓角收口',100);
    }
    g.userData.nominalWallMm=3.6;
  }
  function makeSideTrim(g) {
    for(const side of [-1,1]) {
      const sh=roundedPath([[-177,67],[-207,91],[-190,127],[-127,143],[-49,132],[49,122],[102,169],[135,205],[177,205],[207,170],[207,104],[177,68]],13,true);
      sh.holes.push(circleHole(150,135,40));sh.holes.push(circleHole(96,105,10));for(const [x,z] of [[-140,102],[20,98],[185,181]])sh.holes.push(circleHole(x,z,3.4));
      addMesh(g,extruded(sh,5.2,(x,z,d)=>V(x,side*(226+d),z),{bevel:1.1,segments:8}),M.black,'S10 成形側護蓋；調角器實際讓位孔');
      ring(g,150,side*234,135,37,13,4,M.shell,'S10 樞軸外緣護圈','y');
      for(const [x,z] of [[-140,102],[20,98],[185,181]])cylinder(g,x,side*233,z,5.3,4,M.black,'S10 嵌入式護蓋螺釘','y',6);
    }
  }
  function makeBuckle(g,seatSide) {
    const side=-seatSide,y=side*233;
    const stalk=roundedPath([[88,88],[108,94],[102,164],[69,221],[53,212],[85,156]],5,true);stalk.holes.push(circleHole(96,105,5.5));
    addMesh(g,extruded(stalk,4,(x,z,d)=>V(x,y+d-2,z)),M.metal,'S11 帶扣承載鋼帶與真安裝孔');
    const sh=roundedPath([[-23,-40],[22,-40],[25,29],[18,43],[-17,43],[-25,29]],8,true);
    sh.holes.push(roundedRect(-12,-30,12,-19,3));
    const housing=addMesh(g,extruded(sh,26,(x,z,d)=>V(x,d-13,z),{bevel:2,segments:8}),M.black,'S11 安全帶扣殼與插入口');housing.position.set(47,y,238);housing.rotation.y=-.22;
    const red=roundedPath([[-15,-8],[15,-8],[15,8],[-15,8]],3,true);
    const release=addMesh(g,extruded(red,4,(x,y,z)=>V(x,y,z)),M.red,'S11 紅色釋放鍵');release.position.set(47,y,277);release.rotation.y=-.22;
    ring(g,96,side*216.5,105,9,5.5,33,M.metal,'S11 帶扣至座盆的承托軸套','y');
    cylinder(g,96,y,105,8.8,8,M.alloy,'S11 帶扣安裝肩軸','y');
  }
  function makeFasteners(g) {
    for(const side of [-1,1])for(const x of [-225,225]) {
      const y=side*205;ring(g,x,y,9.1,11,5.6,2.2,M.alloy,'S12 地板固定墊圈；孔與安裝座對齊','z');
      cylinder(g,x,y,5,5,10,M.alloy,'S12 地板螺栓光桿段','z');cylinder(g,x,y,13.5,8.8,6.6,M.alloy,'S12 地板螺栓六角頭','z',6);
    }
    for(const side of [-1,1])for(const x of [-180,180]) {
      const y=side*200,top=panZ(x,y)+3;
      // The screw is outside the race envelope and clamps the pan onto its spacer.
      ring(g,x,y,top+1.1,10.2,5.6,2.2,M.alloy,'S12 上軌至座盆墊圈','z');
      cylinder(g,x,y,(56+top+2.2)/2,5,top+2.2-56,M.alloy,'S12 座盆固定螺栓；滾道外側','z');
      cylinder(g,x,y,top+5.5,8.8,6.6,M.alloy,'S12 座盆螺栓六角頭','z',6);
      cylinder(g,x,y,59,8.8,6,M.alloy,'S12 上軌外伸座螺帽','z',6);
    }
  }
  const specifications=[
    ['S01','椅背骨架',[170,0,55],'S01-back-frame-r2.png'],
    ['S02','座墊骨架',[0,0,-55],'S00-seat-r2.png'],
    ['S03','上下嵌合滑軌',[0,0,-170],'S00-seat-r2.png'],
    ['S04','調角樞軸',[0,120,0],'S00-seat-r2.png'],
    ['S05','椅背泡棉',[-105,0,65],'S00-seat-r2.png'],
    ['S06','座墊泡棉',[-25,0,110],'S00-seat-r2.png'],
    ['S07','椅背皮套',[-225,0,95],'S07-back-cover-r1.png'],
    ['S08','座墊皮套',[-75,0,225],'S00-seat-r2.png'],
    ['S09','薄背殼',[300,0,60],'S00-seat-r2.png'],
    ['S10','側護蓋',[0,230,0],'S00-seat-r2.png'],
    ['S11','安全帶扣',[0,-150,0],'S00-seat-r2.png'],
    ['S12','固定件',[0,0,-265],'S00-seat-r2.png']
  ];
  for(const side of [1,-1]) {
    const seat=new T.Group(),letter=side===1?'L':'R',occupant=side===1?'駕駛':'乘客';
    seat.name=`座椅 ${occupant} 總成`;seat.position.set(190,side*350,304);root.add(seat);
    seat.userData={id:`SEAT-${letter}`,name:seat.name,system:'seats',referencePart:'S00',reference:'S00-seat-r2.png',status:'WORK_IN_PROGRESS',origin:[190,side*350,304]};
    const components={};
    for(const [id,name,explode,reference] of specifications) {
      const g=new T.Group();g.name=`座椅 ${occupant} ${name}`;g.userData={id:`SEAT-${letter}-${id}`,name:g.name,system:'seats',referencePart:id,reference,status:'WORK_IN_PROGRESS',truth:'AUTHOR_DESIGN',
        revision:'SEATS-R2',explode:[explode[0],explode[1]*side,explode[2]],explosionRole:'EXPLANATORY_OFFSET_NOT_VALIDATED_REMOVAL_PATH',
        referenceScope:(id==='S01'||id==='S07')?'INDEPENDENT_PART_SHAPE_WITH_DECLARED_AUTHORED_DETAIL':'ASSEMBLY_IDENTITY_AND_AUTHORED_DETAIL'};
      seat.add(g);parts.push(g);components[id]=g;
    }
    makeBackFrame(components.S01);makeSeatPan(components.S02);makeRails(components.S03);makeRecliners(components.S04);
    makeUpholstery(components.S05,components.S06,components.S07,components.S08);
    makeRearShell(components.S09);makeSideTrim(components.S10);makeBuckle(components.S11,side);makeFasteners(components.S12);
    for(const part of Object.values(components)){
      const occurrences=new Map();part.userData.childIds=[];
      part.traverse(o=>{if(!o.isMesh)return;
        const saved=o.userData,key=saved.constructionKey||o.name.replace(/^S\d\d\s*/,'').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
        const n=(occurrences.get(key)||0)+1;occurrences.set(key,n);
        const id=key==='HEAD-BACK'?`${part.userData.id}-HEAD-BACK`:`${part.userData.id}/${key}/${String(n).padStart(2,'0')}`;
        o.userData={...saved,id,name:o.name,system:'seats',referencePart:saved.referencePart||part.userData.referencePart,
          reference:saved.reference||part.userData.reference,status:'WORK_IN_PROGRESS',truth:'AUTHOR_DESIGN',parentId:part.userData.id,ownerPartId:part.userData.id,seatId:`SEAT-${letter}`,
          explode:[part.userData.referencePart==='S07'?-55:0,0,part.userData.referencePart==='S08'?45:0],
          explosionRole:'EXPLANATORY_OFFSET_NOT_VALIDATED_REMOVAL_PATH'};
        if(o.isInstancedMesh)o.userData.instanceIdPattern=`${id}/STITCH-{index}`;
        part.userData.childIds.push(id);
      });
    }
  }
  root.updateMatrixWorld(true);
  return {root,parts};
}
