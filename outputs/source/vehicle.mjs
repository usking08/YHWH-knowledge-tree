// Identity routing only. Existing coarse surfaces do not become accepted physical parts.
export function bindGT01PartReferences(parts){
 const existing=[[/外滑軌|內滑軌/,'S03'],[/座墊皮革|座墊車縫/,'S08'],[/椅背承托|椅背車縫|皮面拼縫/,'S07'],[/側翼/,'S05'],[/安全帶扣|安全帶釋放/,'S11'],[/車門內襯|車門皮革|車門肘托|車門儲物|車門金屬/,'D09'],[/揚聲器/,'D10'],[/車門開啟把手/,'D09'],[/方向盤/,'I04'],[/儀表台/,'I01'],[/顯示/,'I05'],[/中央鞍座|中央扶手|中控.*面板|金屬旋鈕/,'I03'],[/前擋/,'G01'],[/後擋/,'G02'],[/門玻璃/,'D04'],[/後視鏡/,'G04'],[/前圍板/,'F04'],[/後艙防火/,'F05'],[/門檻樑/,'F02'],[/橫樑/,'F03'],[/封閉底板/,'F01'],[/電池上蓋/,'P02'],[/電池底殼|電池殼/,'P01']];
 const names={"中控金屬框":"I03","引擎蓋":"C01","右車門外板":"D01","左車門外板":"D01","右前葉子板上面":"C03","左前葉子板上面":"C03","前葉子板側面":"C03","後葉子板上面":"C04","後葉子板側面":"C04","外把手":"D11","外把手凹座":"D11","尾燈黑色底座":"L06","尾燈導光條":"L06","紅色尾燈":"L05","車頂面板":"C05","車窗周界密封":"G05","車窗金屬上飾條":"G05","玻璃側密封":"G05","玻璃橫向密封":"G05","前下導流唇":"C06","前保桿上面":"C06","前保桿中央面":"C06","前保桿側面":"C06","後三角窗":"G03","後下擴散器":"C10","後保桿中央面":"C07","後保桿側面":"C07","後牌照凹座":"C07","格柵水平葉片":"C09","格柵周界飾條":"C09","格柵深色內腔":"C09","側裙":"C08","窗中央立柱":"C11","A柱外板":"C11","C柱外板":"C11","頭燈日行燈":"L03","頭燈投射光帶":"L04","頭燈透明罩":"L01","頭燈黑色燈殼":"L02","雙層地毯與隔音層":"I08"};
 for(const p of parts){if(p.userData.referencePart)continue;const ref=names[p.name]||existing.find(([re])=>re.test(p.name))?.[1];if(ref){p.userData.referencePart=ref;p.userData.referenceIdentityStatus='PROVISIONAL_SHAPE_BINDING';p.userData.definitionBoundary='Existing authored surface or coarse assembly; physical partition and reference fidelity remain unverified';}else if(['車尾上緣','後行李廂上蓋','窗下腰線上板'].includes(p.name)){p.userData.referencePart='C00';p.userData.referenceIdentityStatus='UNRESOLVED_PHYSICAL_PARTITION';p.userData.definitionBoundary='Legacy body-envelope patch spans an unresolved component boundary; assembly-level association only';}}
}

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

// D09, source-bound author construction. Coordinates are mm, +Z up, -X forward.
export function buildGT01DoorTrim(T,materials,boundary){
 const root=new T.Group(),parts=[];root.name='D09 / 車門內飾';
 const plastic=materials.black.clone();plastic.roughness=.72;plastic.metalness=.025;
 const metal=materials.alloy.clone();metal.roughness=.38;
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 const shape=fn=>{const s=new T.Shape();fn(s);return s;};
 const carrier=shape(s=>{s.moveTo(-665,344);s.bezierCurveTo(-706,355,-706,460,-692,600);s.lineTo(-672,764);s.bezierCurveTo(-290,773,282,761,738,746);s.bezierCurveTo(742,665,713,440,647,352);s.bezierCurveTo(622,314,564,305,507,306);s.lineTo(-604,310);s.quadraticCurveTo(-657,312,-665,344);});
 const upper=shape(s=>{s.moveTo(-685,727);s.lineTo(-670,772);s.bezierCurveTo(-130,779,385,764,737,753);s.lineTo(731,703);s.bezierCurveTo(225,715,-210,714,-670,724);s.closePath();});
 const insert=shape(s=>{s.moveTo(-467,691);s.bezierCurveTo(-123,700,310,697,691,687);s.lineTo(653,526);s.bezierCurveTo(470,516,94,516,-204,523);s.bezierCurveTo(-275,550,-393,633,-467,663);s.quadraticCurveTo(-479,680,-467,691);});
 const arm=shape(s=>{s.moveTo(-466,655);s.bezierCurveTo(-485,668,-510,650,-495,629);s.bezierCurveTo(-414,550,-320,466,-237,464);s.lineTo(580,464);s.bezierCurveTo(626,464,655,482,650,503);s.bezierCurveTo(641,524,610,526,570,526);s.lineTo(-222,526);s.bezierCurveTo(-270,528,-397,616,-466,655);});
 const strip=shape(s=>{s.moveTo(-672,711);s.bezierCurveTo(-200,708,240,711,724,700);s.lineTo(723,712);s.bezierCurveTo(241,723,-200,720,-672,723);s.closePath();});
 const speaker=shape(s=>{s.moveTo(-650,430);s.bezierCurveTo(-654,514,-623,551,-561,549);s.bezierCurveTo(-487,545,-429,496,-386,454);s.bezierCurveTo(-368,433,-384,390,-405,373);s.lineTo(-608,371);s.quadraticCurveTo(-647,373,-650,430);});
 for(let x=-630;x<=-405;x+=11)for(let z=386;z<=532;z+=11){const pts=speaker.getPoints(48);let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){if(((pts[i].y>z)!==(pts[j].y>z))&&x<(pts[j].x-pts[i].x)*(z-pts[i].y)/(pts[j].y-pts[i].y)+pts[i].x)inside=!inside;}if(inside){const hole=new T.Path();hole.absellipse(x,z,2.5,2.5,0,Math.PI*2,true);speaker.holes.push(hole);}}
 function subdivide(g){const raw=g.index?g.toNonIndexed():g,p=raw.attributes.position,out=[];
  function tri(a,b,c,depth){const ab=a.distanceToSquared(b),bc=b.distanceToSquared(c),ca=c.distanceToSquared(a);if(depth<5&&Math.max(ab,bc,ca)>65**2){const m=a.clone().add(b).multiplyScalar(.5),n=b.clone().add(c).multiplyScalar(.5),o=c.clone().add(a).multiplyScalar(.5);tri(a,m,o,depth+1);tri(m,b,n,depth+1);tri(o,n,c,depth+1);tri(m,n,o,depth+1);}else out.push(...a,...b,...c);}
  for(let i=0;i<p.count;i+=3)tri(new T.Vector3().fromBufferAttribute(p,i),new T.Vector3().fromBufferAttribute(p,i+1),new T.Vector3().fromBufferAttribute(p,i+2),0);
  const n=new T.BufferGeometry();n.setAttribute('position',new T.Float32BufferAttribute(out,3));return n;
 }
 for(const side of [-1,1]){
  const label=side>0?'左':'右',host=new T.Group();host.position.y=-side*70;host.userData={packagingInset:70,reason:'Clear the regulator and complete glazing volume; structural inner shell still under construction'};root.add(host);
  function group(id,name){const g=new T.Group();g.name=label+'車門 '+name;g.userData={id:'DOOR-'+label+'-'+id,referencePart:id==='D10'?'D10':'D09',subPart:id,system:'doors',reference:'D09-trim-r1.png',status:'WORK_IN_PROGRESS',explode:[0,-side*180,0]};host.add(g);parts.push(g);return g;}
  function panel(parent,s,depth,thick,bevel,mat){let g=new T.ExtrudeGeometry(s,{depth:thick,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:5,curveSegments:24,steps:1});g=subdivide(g);const p=g.attributes.position,uv=[];for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),d=p.getZ(i);p.setXYZ(i,x,side*(boundary(x,z)-depth-d),z);uv.push(x/500,z/500);}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const m=new T.Mesh(g,mat);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  const base=group('D09a','內飾承載板');panel(base,carrier,43,7,5,plastic);
  const roll=group('D09b','深色柔質上沿');panel(roll,upper,57,24,9,plastic);
  const leather=group('D09c','棕色皮革插片');panel(leather,insert,57,11,7,materials.leather);
  const grab=group('D09d','拉手與肘托');panel(grab,arm,102,39,12,materials.leather);
  const trim=group('D09e','拉絲金屬飾條');panel(trim,strip,84,3,1.2,metal);
  const grille=group('D09h','穿孔揚聲器網罩');panel(grille,speaker,68,2.4,0,plastic);
  const pocket=group('D09g','中空儲物袋');
  // A U section with separate front/back walls. Its top remains open.
  const cross=shape(s=>{s.moveTo(53,441);s.lineTo(53,333);s.quadraticCurveTo(53,318,71,318);s.lineTo(124,320);s.quadraticCurveTo(161,321,173,351);s.lineTo(177,438);s.lineTo(173,438);s.lineTo(169,353);s.quadraticCurveTo(158,326,122,325);s.lineTo(73,323);s.quadraticCurveTo(58,323,58,337);s.lineTo(58,441);s.closePath();});
  let cup=new T.ExtrudeGeometry(cross,{depth:914,bevelEnabled:false,curveSegments:20,steps:48});const cp=cup.attributes.position;for(let i=0;i<cp.count;i++){const depth=cp.getX(i),z=cp.getY(i),x=cp.getZ(i)-314,bend=14*Math.sin((x+314)/914*Math.PI);cp.setXYZ(i,x,side*(boundary(x,z)-depth),z+bend);}cup.computeVertexNormals();pocket.add(new T.Mesh(cup,plastic));
  // Thin end walls close the storage cavity at each end, leaving the top opening.
  for(const x of [-314,600]){const end=shape(s=>{s.moveTo(55,438);s.lineTo(55,336);s.quadraticCurveTo(55,321,71,321);s.lineTo(124,323);s.quadraticCurveTo(160,324,171,353);s.lineTo(175,438);s.closePath();});const eg=new T.ExtrudeGeometry(end,{depth:3,bevelEnabled:false,curveSegments:16});const ep=eg.attributes.position;for(let i=0;i<ep.count;i++){const d=ep.getX(i),z=ep.getY(i),xx=x+ep.getZ(i);ep.setXYZ(i,xx,side*(boundary(xx,z)-d),z);}eg.computeVertexNormals();pocket.add(new T.Mesh(eg,plastic));}
  const controls=group('D09f','車窗開關嵌框');
  const bezel=new T.Mesh(new T.BoxGeometry(177,49,7),plastic);bezel.position.set(-104,side*(boundary(-104,532)-137),532);controls.add(bezel);
  for(let k=0;k<4;k++){const b=new T.Mesh(new T.BoxGeometry(27,31,6),k===0?metal:materials.black);b.position.set(-164+k*38,bezel.position.y,538);controls.add(b);const mark=new T.Mesh(new T.BoxGeometry(12,1.1,.7),materials.stitch);mark.position.set(b.position.x,b.position.y-5,541.5);controls.add(mark);}
  const stitching=group('D09-stitch','皮革接縫');
  for(const pts of [[[-454,667],[-287,552],[-225,515],[70,515],[350,515],[599,508]],[[-451,677],[-295,568],[-235,535],[80,534],[354,534],[616,518]]]){const p=pts.map(([x,z])=>V(x,side*(boundary(x,z)-148),z));const g=new T.TubeGeometry(new T.CatmullRomCurve3(p),100,.7,5,false);stitching.add(new T.Mesh(g,materials.stitch));}
  const clips=group('D09i','背面肋條與固定扣');
  for(const [x,z] of [[-623,699],[-379,733],[-89,730],[226,724],[546,716],[688,658],[-650,515],[-613,342],[-265,335],[95,335],[451,331],[631,395]]){
   const y=side*(boundary(x,z)-30),points=[[3,-9],[9,-9],[9,9],[3,9],[3,-9]].map(([r,h])=>new T.Vector2(r,h));const boss=new T.Mesh(new T.LatheGeometry(points,24),plastic);boss.position.set(x,y,z);clips.add(boss);
   const clip=new T.Mesh(new T.BoxGeometry(17,4,16),metal);clip.position.set(x,y+side*10,z);clips.add(clip);
  }
  for(const x of [-605,-355,-100,145,390,630])for(const [za,zb] of [[570,699],[345,459]]){
   const pts=[V(x,side*(boundary(x,za)-32),za),V(x,side*(boundary(x,zb)-32),zb)],d=pts[1].clone().sub(pts[0]),rib=new T.Mesh(new T.BoxGeometry(3.5,17,d.length()),plastic);rib.position.copy(pts[0]).add(pts[1]).multiplyScalar(.5);rib.quaternion.setFromUnitVectors(V(0,0,1),d.normalize());clips.add(rib);
  }
 }
 root.userData={revision:'D09-MODEL-R1',status:'WORK_IN_PROGRESS',reference:'D09-trim-r1.png'};
 return {root,parts};
}

// D05 front-rail construction. Authored dimensions in mm; reference images bind
// morphology, not measured/OEM dimensions. No completed regulator claim.
export function buildGT01Regulator(T,materials,boundary){
 const root=new T.Group(),parts=[];root.name='D05 雙導軌、滑座與捲筒施工';
 const M={zinc:new T.MeshStandardMaterial({color:0xa6afb0,metalness:.78,roughness:.35}),polymer:new T.MeshStandardMaterial({color:0x232729,roughness:.5,metalness:.08}),nylon:new T.MeshStandardMaterial({color:0xd7ccb0,roughness:.4}),steel:materials.alloy};
 const V=(x,y,z)=>new T.Vector3(x,y,z),shapes={};
 function hole(x,z,r){const p=new T.Path();p.absarc(x,z,r,0,Math.PI*2,true);return p;}
 function slot(x,z,w,h){const p=new T.Path(),r=w/2;p.moveTo(x-r,z-h/2+r);p.lineTo(x-r,z+h/2-r);p.absarc(x,z+h/2-r,r,Math.PI,0,true);p.lineTo(x+r,z-h/2+r);p.absarc(x,z-h/2+r,r,0,-Math.PI,true);p.closePath();return p;}
 function extrude(sh,depth,map){const g=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false,steps:1,curveSegments:24}),p=g.attributes.position;for(let i=0;i<p.count;i++){const q=map(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,q.x,q.y,q.z);}g.clearGroups();g.computeVertexNormals();return g;}
 function lathe(profile){return new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),128);}
 function mesh(g,geo,mat,name){const m=new T.Mesh(geo,mat);m.name=name;m.castShadow=m.receiveShadow=true;g.add(m);return m;}
 const web=new T.Shape();web.moveTo(-12,-216);web.bezierCurveTo(-8,-225,8,-225,13,-215);web.lineTo(15,-189);web.lineTo(17,-179);web.lineTo(17,178);web.lineTo(14,189);web.lineTo(13,211);web.bezierCurveTo(12,224,-11,227,-14,213);web.lineTo(-15,188);web.lineTo(-18,183);web.lineTo(-37,181);web.quadraticCurveTo(-40,180,-40,175);web.lineTo(-40,151);web.quadraticCurveTo(-40,146,-36,146);web.lineTo(-18,146);web.lineTo(-17,-139);web.lineTo(-37,-144);web.quadraticCurveTo(-40,-145,-40,-150);web.lineTo(-40,-176);web.quadraticCurveTo(-40,-181,-35,-181);web.lineTo(-17,-181);web.lineTo(-13,-192);web.closePath();
 for(const z of [-207,207])web.holes.push(hole(0,z,5.2));
 for(const z of [-93,93])web.holes.push(slot(0,z,6.4,33));
 for(const z of [-162,162])web.holes.push(slot(-29,z,7,25));
 shapes.web=extrude(web,1.7,(x,z,d)=>V(x,-d,z));
 // Folded rail edges have a wall and a short return lip, not a solid rectangle.
 const edge=[[-17,0],[-19,-2],[-19,-8],[-17,-10],[-12,-10],[-12,-8.3],[-16.2,-8.3],[-17.3,-7.2],[-17.3,-2.4],[-16.2,-1.7],[-17,0]];
 shapes.edges=[-1,1].map(side=>{const sh=new T.Shape(edge.map(([x,y])=>new T.Vector2(x*side,y)));return extrude(sh,352,(x,y,z)=>V(x,y,z-176));});
 const rib=new T.Shape();rib.moveTo(-1.7,-51);rib.quadraticCurveTo(-1.7,-57,0,-57);rib.quadraticCurveTo(1.7,-57,1.7,-51);rib.lineTo(1.7,51);rib.quadraticCurveTo(1.7,57,0,57);rib.quadraticCurveTo(-1.7,57,-1.7,51);rib.closePath();shapes.rib=extrude(rib,1.2,(x,z,d)=>V(x,-1.7-d,z));
 shapes.eye=lathe([[5.2,0],[5.2,-2.7],[7,-3.1],[10.5,-2.5],[12.5,-1.7],[12.5,0],[5.2,0]]);
 const pulleyProfile=[[5.2,-6],[11,-6],[11,-2],[21,-2],[24,-4.6],[26.3,-4.6],[27,-4.0],[27,-3.1],[25.2,-2.8],[23.5,-1.9],[22.3,-.7],[22,0],[22.3,.7],[23.5,1.9],[25.2,2.8],[27,3.1],[27,4],[26.3,4.6],[24,4.6],[21,2],[11,2],[11,6],[5.2,6],[5.2,-6]];
 shapes.pulley=lathe(pulleyProfile);
 function ribGeo(angle,side){const p=[],ind=[];for(const r of [11.2,23.6])for(const w of [-.75,.75])for(const h of [0,.8]){const face=2+Math.max(0,r-21)/3*2.6;p.push(r*Math.cos(angle)-w*Math.sin(angle),side*(face+h),r*Math.sin(angle)+w*Math.cos(angle));}for(const [a,b,c,d] of [[0,1,3,2],[4,6,7,5],[0,4,5,1],[2,3,7,6],[0,2,6,4],[1,5,7,3]])ind.push(a,b,c,a,c,d);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ind);g.computeVertexNormals();return g;}
 shapes.ribs=[];for(const side of [-1,1])for(let k=0;k<6;k++)shapes.ribs.push(ribGeo(Math.PI/2+k*Math.PI/3,side));
 shapes.axle=lathe([[0,-20.3],[7.4,-20.3],[7.4,-19],[4.8,-19],[4.8,1.7],[5.0,2.0],[5.35,2.35],[5.8,2.75],[5.8,3],[2.5,3],[2.5,1],[0,1],[0,-20.3]]);
 shapes.washer=lathe([[5.05,-.7],[8.5,-.7],[8.8,-.45],[8.8,.45],[8.5,.7],[5.05,.7],[5.05,-.7]]);
 // Each group below is one moulded component, even when its boundary is meshed in patches.
 const details=makeRegulatorDetails(T),clampDetails=makeGT01GlassClamps(T);
 const clampMaterials={cast:new T.MeshPhysicalMaterial({color:0xc4c8c6,metalness:.83,roughness:.3,clearcoat:.08,envMapIntensity:1.3}),steel:new T.MeshStandardMaterial({color:0xb8bfbe,metalness:.95,roughness:.24,envMapIntensity:1.3}),rubber:new T.MeshStandardMaterial({color:0x24292b,metalness:0,roughness:.72})};
 for(const side of [-1,1]){
  const host=new T.Group();const slope=([-420,480].reduce((v,x)=>v+boundary(x,742)-boundary(x,328),0))/828;
  const middle=([-420,480].reduce((v,x)=>v+boundary(x,742)+boundary(x,328),0))/4;
  const samples=[-420,480].flatMap(x=>Array.from({length:41},(_,i)=>{const z=328+i*414/40;return middle+slope*(z-535)-boundary(x,z);}));
  const inward=Math.max(0,...samples)+20;
  host.position.set(-420,side*(middle-inward),535);host.scale.y=side;host.rotation.x=-side*Math.atan(slope);root.add(host);
  host.userData={id:'D05-HOST-'+(side>0?'L':'R'),system:'doors',railGuideSlope:slope,bodyClearanceNominal:20,source:'AUTHOR_DESIGN',boundarySamples:samples};
  const sideName=side>0?'左':'右';let seq=0;
  function part(ref,name,position=[0,0,0],explode=[0,-70,0]){const g=new T.Group();g.position.fromArray(position);g.name=sideName+'車門 '+name;g.userData={id:`D05-${side>0?'L':'R'}-${ref}-${++seq}`,parentId:'D05',referencePart:ref,referenceAncestors:['D00','D05'],reference:({'D05-P01':'D05-P01-r1.png','D05-P02':'D05-P02-r1.png','D05-P03':'D05-P03-r4.png','D05-P04':'D05-P03-r4.png','D05-P05':'D05-P05-r1.png','D05-P06':'D05-P06-r4.png','D05-P06-washer':'D05-P06-washer-r1.png','D05-P10':'D05-P10-r2.png'})[ref]||null,system:'doors',status:'WORK_IN_PROGRESS',truth:'AUTHOR_DESIGN',explode,assembly:{hostId:'D05-'+sideName,axis:[0,1,0]}};host.add(g);parts.push(g);return g;}
  for(const [railIndex,rx] of [0,900].entries()){
  const rail=part(railIndex?'D05-P02':'D05-P01',railIndex?'後導軌':'前導軌',[rx,0,0],[railIndex?100:0,0,0]);if(railIndex)rail.scale.x=-1;mesh(rail,shapes.web,M.zinc,'沖壓腹板：兩端通孔、兩長孔、兩固定耳孔');for(const g of shapes.edges)mesh(rail,g,M.zinc,'折返導邊');mesh(rail,shapes.rib,M.zinc,'腹板長凸筋');for(const z of [-207,207])mesh(rail,shapes.eye,M.zinc,'軸孔成形座').position.z=z;
  for(const [index,z] of [-207,207].entries()){
   const pulley=part('D05-P05',(index?'上':'下')+'滑輪',[rx,-11,z],[0,-70,0]);mesh(pulley,shapes.pulley,M.polymer,'連續繩槽與貫通軸孔');for(const g of shapes.ribs)mesh(pulley,g,M.polymer,'一體六肋與淺凹腹板');
   const axle=part('D05-P06',(index?'上':'下')+'滑輪軸銷',[rx,0,z],[0,-135,0]);mesh(axle,shapes.axle,M.zinc,'肩軸及鉚接端');
   for(const [j,y] of [-18,-4].entries()){const washer=part('D05-P06-washer',(index?'上':'下')+'滑輪止推墊圈 '+j,[rx,y,z],[0,j===0?-105:-35,0]);mesh(washer,shapes.washer,M.steel,'止推墊圈與真正通孔');}
  }
  const carriage=part(railIndex?'D05-P04':'D05-P03',railIndex?'後滑座':'前滑座',[rx,0,100],[railIndex?100:0,-190,65]);for(const [name,geo] of details.carriage)mesh(carriage,geo,M.nylon,name);
  carriage.userData.interfaces={railX:rx,guideAxis:[0,0,1],railLipFront:-10,carriageBack:-11.8,outerGuideWall:20.5,railOuterWall:19,wrapBack:1.2,railBack:0,localTravel:[-128,128]};
  for(const component of clampDetails){const p=part(component.ref,(railIndex?'後':'前')+'玻璃夾座 '+component.name,[rx+component.x,0,100],component.explode);if(side<0)p.scale.x=-1;for(const [name,geo] of component.surfaces)mesh(p,geo,clampMaterials[component.material],name);p.userData.reference=component.ref+(['D05-P15a','D05-P15c'].includes(component.ref)?'-r3.png':component.ref==='D05-P15b'?'-r2.png':'-r1.png');p.userData.referenceAncestors=['D00','D05','D05-P15'];p.userData.interfaces={...component.interfaces,carriageId:carriage.userData.id,railX:rx,glassCentreYAtBottom:-45,glassSlopeYPerZ:-.55,glassThickness:4.5,glassBottomZ:169,preserveScrewHandedness:true,upperGripTransform:!['D05-P15a','D05-P15f','D05-P15g'].includes(component.ref)};}
  }
  const drum=part('D05-P10','鋼索捲筒',[470,-28,-122],[0,-240,-80]);for(const [name,geo] of details.drum)mesh(drum,geo,M.polymer,name);drum.userData.interfaces={axis:[0,1,0],splineLobes:6,flangeRadius:37,barrelRadius:31,groovePitch:6,grooveDepth:1.3,source:'D05-P10-r2.png'};
  for(const [ref,name,geos,explode] of [['D05-P11','捲筒下殼',details.housing,[0,75,0]],['D05-P12','捲筒前蓋',details.cover,[0,-340,0]]]){const p=part(ref,name,[470,-28,-122],explode);for(const [label,geo] of geos)mesh(p,geo,M.polymer,label);p.userData.reference=ref+'-r1.png';p.userData.interfaces={shaftAxis:[0,1,0],earAnglesDegrees:[90,210,330],earRadius:50,earBore:6.2,housingInnerRadius:39.5,coverRegisterRadius:39.2,drumRadius:37};}
  for(const cable of details.cables){
   const core=part(cable.id+'a',cable.name+'索芯',[0,0,0],[0,-105,0]);mesh(core,cable.core,M.steel,'連續鋼索路徑');core.userData.route=cable.route;
   const sheath=part(cable.id+'c',cable.name+'套管',[0,0,0],[0,-70,0]);for(const g of cable.sheath)mesh(sheath,g,M.polymer,'有內孔的連續保護管');sheath.userData.route={coreRef:cable.id+'a',normalizedArcRange:cable.sheathRange,innerRadius:1.5,outerRadius:3.4,endExposedLength:22};
   for(const [i,end] of cable.ends.entries()){const p=part(cable.id+'b',cable.name+'壓接端頭 '+i,end.point,[0,-140,0]);const geo=lathe([[.95,-3.5],[4.5,-3.5],[4.7,-3.2],[4.7,3.2],[4.5,3.5],[.95,3.5],[.95,-3.5]]);const m=mesh(p,geo,M.zinc,'壓接端頭與索芯孔');if(end.axis==='z')m.rotation.x=Math.PI/2;}
  }
 }
 for(const p of parts){let i=0;p.traverse(m=>{if(m.isMesh)m.userData={id:p.userData.id+'/SURFACE-'+(++i),parentId:p.userData.id,referencePart:p.userData.referencePart,system:'doors',physicalPartId:p.userData.id,role:'surface_of_same_physical_component'};});}
 root.userData={id:'D05-GUIDES',revision:'D05-CLAMPS-R4',status:'WORK_IN_PROGRESS',units:'mm',truth:'AUTHOR_DESIGN',scope:'Paired guides, routed cable train and physical glass clamps. Static interfaces require readback; no driven-motion acceptance',unbuilt:['motor','tension springs','cable end sleeves','cable separator','rail fixing bolts','housing fixing screws']};root.updateMatrixWorld(true);return {root,parts};
}

function makeGT01GlassClamps(T){
 const components=[],TAU=Math.PI*2;
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 function rounded(x,z,w,h,r){const s=new T.Shape();s.moveTo(x-w/2+r,z-h/2);s.lineTo(x+w/2-r,z-h/2);s.quadraticCurveTo(x+w/2,z-h/2,x+w/2,z-h/2+r);s.lineTo(x+w/2,z+h/2-r);s.quadraticCurveTo(x+w/2,z+h/2,x+w/2-r,z+h/2);s.lineTo(x-w/2+r,z+h/2);s.quadraticCurveTo(x-w/2,z+h/2,x-w/2,z+h/2-r);s.lineTo(x-w/2,z-h/2+r);s.quadraticCurveTo(x-w/2,z-h/2,x-w/2+r,z-h/2);return s;}
 function hole(s,x,z,r){const p=new T.Path();p.absarc(x,z,r,0,TAU,true);s.holes.push(p);}
 function nibHoles(s){for(const x of [-24,24])s.holes.push(new T.Path(rounded(x,48,2.6,2.4,.35).getPoints(12)));}
 function orient(g){const p=g.attributes.position,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),idx=g.index;let v=0;for(let j=0;j<(idx?.count||p.count);j+=3){a.fromBufferAttribute(p,idx?idx.getX(j):j);b.fromBufferAttribute(p,idx?idx.getX(j+1):j+1);c.fromBufferAttribute(p,idx?idx.getX(j+2):j+2);v+=a.dot(b.cross(c));}if(v<0){if(idx)for(let j=0;j<idx.count;j+=3){const k=idx.getX(j+1);idx.setX(j+1,idx.getX(j+2));idx.setX(j+2,k);}else for(const attr of Object.values(g.attributes))for(let j=0;j<attr.count;j+=3)for(let k=0;k<attr.itemSize;k++){const a=(j+1)*attr.itemSize+k,b=(j+2)*attr.itemSize+k,tmp=attr.array[a];attr.array[a]=attr.array[b];attr.array[b]=tmp;}}g.computeVertexNormals();return g;}
 function ext(s,depth,map,levels=[]){let g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:false,curveSegments:16});if(levels.length){const p=g.attributes.position,verts=[];function clip(poly,z,above){const result=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],ina=above?a.y>=z:a.y<=z,inb=above?b.y>=z:b.y<=z;if(ina)result.push(a);if(ina!==inb)result.push(a.clone().lerp(b,(z-a.y)/(b.y-a.y)));}return result;}for(let i=0;i<p.count;i+=3){let polygons=[[0,1,2].map(k=>new T.Vector3().fromBufferAttribute(p,i+k))];for(const z of levels){const next=[];for(const poly of polygons){if(Math.min(...poly.map(v=>v.y))<z-1e-7&&Math.max(...poly.map(v=>v.y))>z+1e-7)next.push(clip(poly,z,false),clip(poly,z,true));else next.push(poly);}polygons=next;}for(const poly of polygons)for(let j=1;j<poly.length-1;j++)for(const v of [poly[0],poly[j],poly[j+1]])verts.push(...v.toArray());}g.dispose();g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));}const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setXYZ(i,...map(p.getX(i),p.getY(i),p.getZ(i)).toArray());g.clearGroups();return orient(g);}
 function plate(s,y0,y1){return ext(s,y1-y0,(x,z,d)=>V(x,y0+d,z));}
 function radial(rows,n=96){const p=[],idx=[];for(const [y,r] of rows)for(let i=0;i<=n;i++){const a=i/n*TAU,radius=typeof r==='function'?r(a):r;p.push(radius*Math.cos(a),y,radius*Math.sin(a));}for(let j=0;j<rows.length-1;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;idx.push(a,a+1,b,a+1,b+1,b);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);return orient(g);}
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 const stretch=z=>z<=12?z:z>=31?z+25:12+(z-12)*44/19;
 const bend=z=>-23+24.3*smooth((stretch(z)-31)/12);
 function carrierShape(withNibs=false){const s=new T.Shape();s.moveTo(-30,-12);s.lineTo(30,-12);s.quadraticCurveTo(34,-12,34,-8);s.lineTo(34,8);s.quadraticCurveTo(34,12,30,12);s.bezierCurveTo(26,18,26,25,30,31);s.lineTo(30,31);s.quadraticCurveTo(34,31,34,35);s.lineTo(34,74);s.quadraticCurveTo(34,78,30,78);s.lineTo(-30,78);s.quadraticCurveTo(-34,78,-34,74);s.lineTo(-34,35);s.quadraticCurveTo(-34,31,-30,31);s.bezierCurveTo(-26,25,-26,18,-30,12);s.quadraticCurveTo(-34,12,-34,8);s.lineTo(-34,-8);s.quadraticCurveTo(-34,-12,-30,-12);s.closePath();const window=new T.Path();window.moveTo(-22,12);window.lineTo(22,12);window.lineTo(22,31);window.lineTo(-22,31);window.lineTo(-22,12);window.closePath();s.holes.push(window);hole(s,0,0,8.2);for(const x of [-24,24])hole(s,x,38,2.75);if(withNibs)nibHoles(s);return s;}
 const bendRows=Array.from({length:97},(_,i)=>12+19*i/96);
 const fixed=[['連續成形框、中央開窗與兩個夾緊通孔',ext(carrierShape(),3.95,(x,z,d)=>V(x,bend(z)+d,stretch(z)),bendRows)],['外接觸面與兩個定位盲槽',ext(carrierShape(true),1.05,(x,z,d)=>V(x,bend(z)+3.95+d,stretch(z)),bendRows)]];
 // Sample the curved depth transition, including straight polygon edges, before extruding.
 // The two skins share a continuous side-arm surface; native interface checks inspect the actual triangles.
 function threadRadius(y,a,major,pitch,clearance=0){const phase=((y/pitch+a/TAU)%1+1)%1,crest=Math.max(0,Math.min(1,(.43-Math.abs(phase-.5))/.3));return major-.61343*pitch+.61343*pitch*crest+clearance;}
 const spigot=[[ -23,0],[-23,8.2],[-12.2,8.2],[-12,7.9],[-12,4.23],[-12.35,4.14]];for(let y=-12.35;y>=-21.3;y-=1.25/10)spigot.push([y,a=>threadRadius(y,a,4,1.25,.14)]);spigot.push([-21.5,3.35],[-21.5,0],[-23,0]);fixed.push(['盲孔 M8×1.25 內螺紋、定位肩與封閉底面',radial(spigot)]);
 const ledge=plate(rounded(0,41.875,56,1.25,.45),6.3,13.7);ledge.translate(0,0,25);fixed.push(['玻璃下緣承托唇',ledge]);
 components.push({ref:'D05-P15a',name:'固定半體',x:0,material:'cast',surfaces:fixed,interfaces:{spigotOD:16.4,blindThread:'M8x1.25',blindFloorY:-21.5,contactPlaneY:6.3,boltCentres:[[-24,63],[24,63]],gripBox:[-28,28,70,100],nibSeats:[[-24,73],[24,73]]}});
 function pressureShape(nibs){const s=rounded(0,54.5,64,47,4);for(const x of [-24,24])hole(s,x,38,2.75);if(nibs)nibHoles(s);return s;}
 function pressureRelief(x,z){let raised=0;for(const sign of [-1,1]){const r=Math.hypot(x-sign*24,z-38),collar=r<=3.05?.65-.3*Math.max(0,(3.05-r)/.3):r<=4.5?.65:.65*smooth((7-r)/2.5),centre=sign*(24-4*smooth((z-40)/7)),halfWidth=1.7+1.5*(1-smooth((z-40)/8)),cross=Math.max(0,1-((x-centre)/halfWidth)**2),rib=cross*cross*smooth((z-40)/5)*smooth((75-z)/3);const v=Math.hypot(collar,rib);raised=Math.max(raised,v);}return raised;}
 function reliefBody(){const s=pressureShape(false),clean=a=>a.length>1&&a[0].distanceToSquared(a.at(-1))<1e-12?a.slice(0,-1):a,outer=clean(s.getPoints(24)),holes=s.holes.map(h=>clean(h.getPoints(24))),points=[outer,...holes].flat();let faces=T.ShapeUtils.triangulateShape(outer,holes);const edgeKey=(a,b)=>a<b?a+','+b:b+','+a;for(let pass=0;pass<18;pass++){const mids=new Map();for(const f of faces)for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],key=edgeKey(a,b);if(points[a].distanceToSquared(points[b])>.42*.42&&!mids.has(key)){mids.set(key,points.length);points.push(points[a].clone().lerp(points[b],.5));}}if(!mids.size)break;const next=[];for(const f of faces){const m=[0,1,2].map(k=>mids.get(edgeKey(f[k],f[(k+1)%3]))),n=m.filter(v=>v!==undefined).length;if(!n){next.push(f);continue;}if(n===3){const [a,b,c]=f,[ab,bc,ca]=m;next.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);}else if(n===1){const k=m.findIndex(v=>v!==undefined),a=f[k],b=f[(k+1)%3],c=f[(k+2)%3],v=m[k];next.push([a,v,c],[v,b,c]);}else{const k=m.findIndex(v=>v===undefined),a=f[(k+2)%3],b=f[k],c=f[(k+1)%3],ab=m[(k+2)%3],ca=m[(k+1)%3];next.push([a,ab,ca],[ab,b,c],[ab,c,ca]);}}faces=next;}
 const height=(x,z)=>{const qx=Math.abs(x)-28,qz=Math.abs(z-54.5)-19.5,edge=4-Math.hypot(Math.max(qx,0),Math.max(qz,0))-Math.min(Math.max(qx,qz),0);return 17.7+pressureRelief(x,z)-.3*smooth((.5-edge)/.5);},vertices=[],indices=[],edges=new Map();for(const y of [14.75,null])for(const p of points)vertices.push(p.x,y??height(p.x,p.y),p.y);const count=points.length;for(const f of faces){const [a,b,c]=f;indices.push(a,b,c,a+count,c+count,b+count);for(let k=0;k<3;k++){const a=f[k],b=f[(k+1)%3],key=edgeKey(a,b);if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}}for(const [a,b] of edges.values())indices.push(a,a+count,b,b,a+count,b+count);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);return orient(g);}

 const pressure=[['內側平面、兩個定位盲槽與夾緊通孔',plate(pressureShape(true),13.7,14.75)],['連續成形外表面：雙縱肋、彎頸、孔周承壓翻邊與圓角',reliefBody()]];
 components.push({ref:'D05-P15b',name:'活動壓片',x:0,material:'cast',surfaces:pressure,interfaces:{contactPlaneY:13.7,thickness:4,boltBoreDiameter:5.5,boltCentres:[[-24,63],[24,63]],outerBaseY:17.7,boltSeatY:18.35,ribHeight:1,formedCollarHeight:.65}});
 // A finite seated contact strip replaces the old line-contact ellipse.
 // Free height and flattening are authored geometric states, not force/FEM results.
 const freeRibHeight=.35,seatedRibHeight=.25,ratio=seatedRibHeight/freeRibHeight;
 const ribSpread=(Math.PI/2)/(ratio*Math.sqrt(1-ratio*ratio)+Math.asin(ratio));
 const contactHalfWidth=.5*ribSpread*Math.sqrt(1-ratio*ratio);
 for(const sign of [1,-1]){const map=y=>10+sign*(y-10),pad=[['圓角薄片本體',ext(rounded(0,60,56,30,2),1.2,(x,z,d)=>V(x,map(6.3+d),z))]];for(let k=0;k<10;k++){const z=46.5+3*k,half=.5*ribSpread,levels=[...Array.from({length:25},(_,i)=>z-half+i*half/12),z-contactHalfWidth,z+contactHalfWidth].sort((a,b)=>a-b);const geo=ext(rounded(0,z,53,2*half,half),1,(x,v,d)=>V(x,map(7.5+d*Math.min(seatedRibHeight,freeRibHeight*Math.sqrt(Math.max(0,1-((v-z)/half)**2)))),v),levels);geo.userData={rubberRib:true,ribCentreZ:z,side:sign};pad.push(['受壓接觸凸紋 '+(k+1),geo]);}for(const x of [-24,24])pad.push(['背面定位凸點',ext(rounded(x,48,2.2,2,.25),.8,(u,z,d)=>V(u,map(5.5+d),z))]);components.push({ref:'D05-P15c',name:(sign===1?'內':'外')+'橡膠夾墊',x:0,material:'rubber',surfaces:pad,interfaces:{metalFaceY:map(6.3),glassContactY:map(7.75),baseThickness:1.2,ribHeight:.25,freeRibHeight,seatedRibHeight,ribSpread,contactStripWidth:2*contactHalfWidth,ribCount:10,nibDepth:.8,nibSeatDepth:1.05,deformationState:'AUTHORED_SEATED_GEOMETRY',deformationScope:'Central rib cross-section area conserved; rounded ends, force, strain and pressure not solved'}});}
 components.push({ref:'D05-P15h',name:'玻璃底緣橡膠承墊',x:0,material:'rubber',surfaces:[['獨立 EPDM 底緣承墊',plate(rounded(0,43.25,56,1.5,.35),6.3,13.7)]],interfaces:{bottomZ:67.5,topZ:69,glassBottomZ:69}});
 const hex=af=>a=>af/2/Math.cos(((a+Math.PI/6)%(Math.PI/3)+Math.PI/3)%(Math.PI/3)-Math.PI/6);
 function screw(major,pitch,tip,shoulder,headR,headH,socketAF){const rows=[[tip,0],[tip,major-.45]];for(let y=tip+.35;y<shoulder-1;y+=pitch/10)rows.push([y,a=>threadRadius(y,a,major,pitch)]);rows.push([shoulder-1,major],[shoulder,major],[shoulder,headR-.2],[shoulder+.25,headR],[shoulder+headH-.4,headR],[shoulder+headH,headR-.4],[shoulder+headH,hex(socketAF)],[shoulder+headH-2.3,hex(socketAF)],[shoulder+headH-2.3,0],[tip,0]);return radial(rows);}
 function nut(){const rows=[[-2.7,hex(7.6)],[-2.35,hex(8)], [.95,hex(8)],[1.3,hex(7.6)],[1.3,2.72],[1.1,2.61]];for(let y=1.1;y> -2.5;y-=.8/10)rows.push([y,a=>threadRadius(y,a,2.5,.8,.11)]);rows.push([-2.7,2.72],[-2.7,hex(7.6)]);return radial(rows);}
 for(const x of [-24,24]){const bolt=screw(2.5,.8,-3.65,18.35,4.25,4,4);bolt.translate(0,0,38);components.push({ref:'D05-P15d',name:'M5 夾緊螺栓 '+x,x,material:'steel',surfaces:[['實際螺旋牙面、圓柱頭與六角工具凹槽',bolt]],interfaces:{axis:[0,1,0],thread:'M5x0.8',tipY:-3.65,underHeadY:18.35,boltZ:63}});const n=nut();n.translate(0,0,38);components.push({ref:'D05-P15e',name:'M5 六角螺帽 '+x,x,material:'steel',surfaces:[['六角外形、倒角與貫通螺紋',n]],interfaces:{thread:'M5x0.8',shaftY:[-2.7,1.3],boltZ:63,acrossFlats:8}});}
 components.push({ref:'D05-P15f',name:'M8 滑座連接螺栓',x:0,material:'steel',surfaces:[['實際螺旋牙面與六角沉入工具槽',screw(4,1.25,-20.8,-10.8,6.6,5,5)]],interfaces:{thread:'M8x1.25',tipY:-20.8,underHeadY:-10.8,headEndY:-5.8}});
 components.push({ref:'D05-P15g',name:'滑座連接墊圈',x:0,material:'steel',surfaces:[['環形墊圈與 8.5 mm 貫通孔',radial([[-11.8,4.25],[-11.8,10.9],[-11.7,11],[-10.9,11],[-10.8,10.9],[-10.8,4.25],[-11.8,4.25]])]],interfaces:{ID:8.5,OD:22,thickness:1,carriageBackFaceY:-12}});
 // Keep sharp tool sockets and planar end faces, but smooth only connected shallow turns.
 // Global normal averaging would make a flat blind-hole floor look like a bulging dome.
 function creaseNormals(input){const src=input.index?input.toNonIndexed():input,p=src.attributes.position,vertices=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();for(let i=0;i<p.count;i+=3){a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);if(b.clone().sub(a).cross(c.clone().sub(a)).lengthSq()<1e-14)continue;vertices.push(...a.toArray(),...b.toArray(),...c.toArray());}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();const q=g.attributes.position,n=g.attributes.normal,original=n.array.slice(),buckets=new Map();for(let i=0;i<q.count;i++){const key=[q.getX(i),q.getY(i),q.getZ(i)].map(v=>v.toFixed(5)).join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}for(const ids of buckets.values())for(const i of ids){a.fromArray(original,i*3);b.set(0,0,0);for(const j of ids){c.fromArray(original,j*3);if(a.dot(c)>.85)b.add(c);}b.normalize();n.setXYZ(i,b.x,b.y,b.z);}g.userData={...input.userData};return g;}
 const angle=Math.atan(.55),co=Math.cos(angle),si=Math.sin(angle);
 function followGlass(p){const dy=p.y-10,dz=p.z-69;return V(p.x,-45+co*dy-si*dz,69+si*dy+co*dz);}
 for(const component of components){for(const surface of component.surfaces){const upper=!['D05-P15a','D05-P15f','D05-P15g'].includes(component.ref);if(upper)surface[1].translate(0,0,25);const pos=surface[1].attributes.position;if(upper||component.ref==='D05-P15a')for(let i=0;i<pos.count;i++){const p=new T.Vector3().fromBufferAttribute(pos,i);if(upper||p.z>=56)p.copy(followGlass(p));else if(p.z>12){const t=(p.z-12)/44,d=p.y-(-23+24.3*smooth((p.z-31)/12)),end=followGlass(V(p.x,1.3+d,56)),y0=-23+d,y=y0+(3*t*t-2*t*t*t)*(end.y-y0)+(t*t*t-t*t)*(end.z-12)*(-.55);p.set(p.x,y,12+(end.z-12)*t);}pos.setXYZ(i,p.x,p.y,p.z);}surface[1]=creaseNormals(surface[1]);if(component.ref==='D05-P15b'&&surface[0].startsWith('連續成形外表面')){const g=surface[1],p=g.attributes.position,n=g.attributes.normal,height=(x,z)=>{const qx=Math.abs(x)-28,qz=Math.abs(z-54.5)-19.5,edge=4-Math.hypot(Math.max(qx,0),Math.max(qz,0))-Math.min(Math.max(qx,qz),0);return 17.7+pressureRelief(x,z)-.3*smooth((.5-edge)/.5);};for(let i=0;i<p.count;i++){const dy=p.getY(i)+45,dz=p.getZ(i)-69,y=10+co*dy+si*dz,z=44-si*dy+co*dz,ny=co*n.getY(i)+si*n.getZ(i);if(y<17.04||ny<.4)continue;const x=p.getX(i),h=.015,nx=-(height(x+h,z)-height(x-h,z))/(2*h),nz=-(height(x,z+h)-height(x,z-h))/(2*h),v=new T.Vector3(nx,1,nz).normalize();n.setXYZ(i,v.x,co*v.y-si*v.z,si*v.y+co*v.z);}}}}
 for(const component of components){const dy=({'D05-P15a':0,'D05-P15b':120,'D05-P15c':component.interfaces.glassContactY<10?40:80,'D05-P15d':160,'D05-P15e':-45,'D05-P15f':80,'D05-P15g':40,'D05-P15h':0})[component.ref],upper=!['D05-P15a','D05-P15f','D05-P15g'].includes(component.ref);if(component.ref==='D05-P15b'||component.ref==='D05-P15c'){const n=component.ref==='D05-P15b'||component.interfaces.glassContactY<10?1:-1;component.interfaces.referenceFrontAxis=[0,n*co,n*si];component.interfaces.referenceUpAxis=[0,-si,co];}component.explode=component.ref==='D05-P15h'?[-85,0,0]:[0,upper?dy*co:dy,upper?dy*si:0];}
 for(const component of components)for(const [,g] of component.surfaces){if(!g.userData.rubberRib)continue;const {ribCentreZ:z,side:sign}=g.userData,p=g.attributes.position,rest=p.clone();for(let i=0;i<p.count;i++){const dy=p.getY(i)+45,dz=p.getZ(i)-69,gy=10+co*dy+si*dz,gz=69-si*dy+co*dz,u=(gz-25-z)/(.5*ribSpread),shape=Math.sqrt(Math.max(0,1-u*u)),seated=Math.min(seatedRibHeight,freeRibHeight*shape),d=seated>1e-6?Math.max(0,Math.min(1,(10+sign*(gy-10)-7.5)/seated)):0;const q=followGlass(V(p.getX(i),10+sign*(7.5+d*freeRibHeight*shape-10),z+.5*u+25));rest.setXYZ(i,q.x,q.y,q.z);}const free=new T.BufferGeometry();free.setAttribute('position',rest);free.computeVertexNormals();rest.name='free_rib_shape';g.morphAttributes.position=[rest];g.morphAttributes.normal=[free.attributes.normal];g.morphTargetsRelative=false;}
 return components;
}

function makeRegulatorDetails(T){
 const carriage=[],drum=[],cables=[],housing=[],cover=[],V=(x,y,z)=>new T.Vector3(x,y,z);
 function smoothCurves(g){const p=g.attributes.position,n=g.attributes.normal,groups=new Map();for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);}const original=n.array.slice();for(const indices of groups.values())for(const i of indices){const a=new T.Vector3().fromArray(original,i*3),sum=new T.Vector3();for(const j of indices){const b=new T.Vector3().fromArray(original,j*3);if(a.dot(b)>.8)sum.add(b);}sum.normalize();n.setXYZ(i,sum.x,sum.y,sum.z);}return g;}
 function shape(points){const s=new T.Shape(points.map(p=>new T.Vector2(...p)));s.closePath();return s;}
 function hole(s,x,z,r){const p=new T.Path();p.absarc(x,z,r,0,Math.PI*2,true);s.holes.push(p);}
 function rounded(x,z,w,h,r){const s=new T.Shape();s.moveTo(x-w/2+r,z-h/2);s.lineTo(x+w/2-r,z-h/2);s.quadraticCurveTo(x+w/2,z-h/2,x+w/2,z-h/2+r);s.lineTo(x+w/2,z+h/2-r);s.quadraticCurveTo(x+w/2,z+h/2,x+w/2-r,z+h/2);s.lineTo(x-w/2+r,z+h/2);s.quadraticCurveTo(x-w/2,z+h/2,x-w/2,z+h/2-r);s.lineTo(x-w/2,z-h/2+r);s.quadraticCurveTo(x-w/2,z-h/2,x-w/2+r,z-h/2);s.closePath();return s;}
 function ext(s,depth,map,bevel=0){const g=new T.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:bevel>0,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:20}),p=g.attributes.position;for(let i=0;i<p.count;i++){const q=map(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,...q.toArray());}const o=map(0,0,0),a=map(1,0,0).sub(o),b=map(0,1,0).sub(o),c=map(0,0,1).sub(o);if(a.dot(b.cross(c))<0){for(const attr of Object.values(g.attributes))for(let i=0;i<attr.count;i+=3)for(let k=0;k<attr.itemSize;k++){const one=(i+1)*attr.itemSize+k,two=(i+2)*attr.itemSize+k,t=attr.array[one];attr.array[one]=attr.array[two];attr.array[two]=t;}}g.clearGroups();g.computeVertexNormals();return g;}
 const plate=rounded(0,0,68,60,5);hole(plate,0,0,8.5);for(const x of [-28,28])for(const z of [-20,20]){const p=rounded(x,z,3.6,9,1.8);plate.holes.push(new T.Path(p.getPoints(20)));}
 carriage.push(['圓角成形本體、四長孔及中央通孔',ext(plate,2.8,(x,z,d)=>V(x,-14.8+d,z),.2)]);
 const border=rounded(0,0,67.5,59.5,4.8);border.holes.push(new T.Path(rounded(0,0,62.5,54.5,3).getPoints(24)));carriage.push(['連續圓角周界加強邊',ext(border,.8,(x,z,d)=>V(x,-15.6+d,z),.2)]);
 const ring=new T.Shape();ring.absarc(0,0,13,0,2*Math.PI);hole(ring,0,0,8.5);carriage.push(['中央貫通環形凸台',ext(ring,2.8,(x,z,d)=>V(x,-17.8+d,z),.2)]);
 for(const side of [-1,1]){
  const channel=shape([[20.5,-11.8],[23,-11.8],[23,3.5],[14,3.5],[14,1.2],[20.5,1.2]].map(([x,y])=>[x*side,y]));carriage.push(['導軌包覆鉤槽 '+side,ext(channel,53,(x,y,z)=>V(x,y,z-26.5),.12)]);
  for(const z of [-1,1]){
   const rib=shape([[10*side,9*z],[11.2*side,8*z],[24*side,25*z],[22.5*side,26*z]]);carriage.push(['正面斜向補強肋',ext(rib,1.3,(x,z,d)=>V(x,-16.1+d,z),.18)]);
  }
  const stud=new T.CylinderGeometry(3.1,3.6,3,32);stud.translate(side*20,-16.3,0);carriage.push(['一體定位柱 '+side,stud]);
 }
 for(const zsign of [-1,1]){
  const a=-Math.PI/4,b=Math.PI*1.25,s=new T.Shape();s.absarc(0,-18,7.5,a,b,false);s.absarc(0,-18,5.1,b,a,true);s.closePath();
  carriage.push(['開口索端座 '+zsign,ext(s,15,(x,y,z)=>V(x,y,zsign*(29+z)),.2)]);
  const wall=rounded(0,zsign*31,14,11,2);carriage.push(['索端座與本體連接頸',ext(wall,4,(x,z,d)=>V(x,-14+d,z),.2)]);
  const cup=new T.Shape();cup.absarc(0,-18,7.5,0,Math.PI*2);hole(cup,0,-18,1.15);carriage.push(['索端座杯底與鋼索通孔',ext(cup,1.5,(x,y,z)=>V(x,y,zsign*(28.5+z)),.1)]);
  for(const x of [-10,10])carriage.push(['正面中央格肋',ext(rounded(x,zsign*21,1.25,12,0.5),1.1,(x,z,d)=>V(x,-15.9+d,z),.1)]);
  for(const x of [-12,0,12])carriage.push(['背面格狀加強肋',ext(rounded(x,zsign*21,1.4,12,0.5),.8,(x,z,d)=>V(x,-11.8+d,z),.1)]);
  for(const z of [14,27])carriage.push(['背面橫向連接肋',ext(rounded(0,zsign*z,25,1.4,.5),.8,(x,z,d)=>V(x,-11.8+d,z),.1)]);
 }
 // Mesh the helical groove as the drum's actual radial boundary, not a painted stripe.
 const spline=a=>7.6+1.6*Math.pow(.5+.5*Math.cos(6*a),3);
 const pos=[],idx=[],nr=100,na=192;
 for(let j=0;j<=nr;j++){const y=-14+28*j/nr;for(let i=0;i<=na;i++){const a=i/na*Math.PI*2,envelope=Math.min(1,(14-Math.abs(y))/1.2),r=31-1.3*envelope*Math.pow(.5+.5*Math.cos(y/6*Math.PI*2-a),2);pos.push(r*Math.cos(a),y,r*Math.sin(a));}}
 for(let j=0;j<nr;j++)for(let i=0;i<na;i++){const a=j*(na+1)+i,b=a+na+1;idx.push(a,b,a+1,a+1,b,b+1);}
 const offset=pos.length/3;for(const y of [-14,-8,8,14])for(let i=0;i<=na;i++){const a=i/na*Math.PI*2,r=Math.abs(y)===14?spline(a):10;pos.push(r*Math.cos(a),y,r*Math.sin(a));}
 for(let j=0;j<3;j++)for(let i=0;i<na;i++){const a=offset+j*(na+1)+i,b=a+na+1;idx.push(a,a+1,b,a+1,b+1,b);}
 for(const [outer,inner,reverse] of [[0,offset,false],[nr*(na+1),offset+3*(na+1),true]])for(let i=0;i<na;i++){const f=[outer+i,outer+i+1,inner+i,outer+i+1,inner+i+1,inner+i];if(reverse)for(let k=0;k<6;k+=3)[f[k+1],f[k+2]]=[f[k+2],f[k+1]];idx.push(...f);}
 const barrel=new T.BufferGeometry();barrel.setAttribute('position',new T.Float32BufferAttribute(pos,3));barrel.setIndex(idx);barrel.computeVertexNormals();drum.push(['連續螺旋繩槽、內孔及端面',barrel]);
 const splineHole=()=>new T.Path(Array.from({length:193},(_,i)=>{const a=-i/192*Math.PI*2;return new T.Vector2(spline(a)*Math.cos(a),spline(a)*Math.sin(a));}));
 function flange(rOuter,rInner){if(rInner>28)return [0,Math.PI].map(start=>{const s=new T.Shape();s.absarc(0,0,rOuter,start+.15,start+Math.PI-.15,false);s.absarc(0,0,rInner,start+Math.PI-.15,start+.15,true);s.closePath();return s;});const pts=[];for(let i=0;i<=384;i++){const a=i/384*Math.PI*2,dist=Math.abs(Math.sin(a)),r=dist<5/34?34*Math.abs(Math.cos(a))-Math.sqrt(Math.max(0,25-(34*dist)**2)):rOuter;pts.push([Math.min(rOuter,r)*Math.cos(a),Math.min(rOuter,r)*Math.sin(a)]);}const s=shape(pts);if(rInner)hole(s,0,0,rInner);else s.holes.push(splineHole());return s;}
 for(const side of [-1,1]){
  drum.push(['端面腹板與兩索端開口 '+side,ext(flange(37,0),1.8,(x,z,d)=>V(x,side*(14+d),z),.15)]);
  drum.push(['外輪緣 '+side,ext(flange(37,34.5),2,(x,z,d)=>V(x,side*(15.8+d),z),.15)]);
  const boss=new T.Shape();boss.absarc(0,0,15,0,Math.PI*2);boss.holes.push(splineHole());drum.push(['六瓣驅動孔凸台 '+side,ext(boss,3,(x,z,d)=>V(x,side*(15.8+d),z),.15)]);
  for(let k=0;k<6;k++){const a=Math.PI/2+k*Math.PI/3,co=Math.cos(a),si=Math.sin(a),s=shape([[15,-.7],[34.5,-.7],[34.5,.7],[15,.7]].map(([r,w])=>[r*co-w*si,r*si+w*co]));drum.push(['端面六條凸肋 '+side,ext(s,1.8,(x,z,d)=>V(x,side*(15.8+d),z),.1)]);}
 }
 function earFlange(bore=true){const pts=[];for(let i=0;i<=384;i++){const a=i/384*2*Math.PI;let bump=0;for(const b of [Math.PI/2,Math.PI*7/6,Math.PI*11/6]){const d=Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));if(d<.28)bump=Math.max(bump,10.5*Math.cos(d/.28*Math.PI/2)**2);}pts.push([(44.5+bump)*Math.cos(a),(44.5+bump)*Math.sin(a)]);}const s=shape(pts);if(bore)hole(s,0,0,39.5);for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6])hole(s,50*Math.cos(a),50*Math.sin(a),3.1);return s;}
 const positions=[],rows=[-21.5,-20,-19.9,-19.65,-19.3,-18.7,-13.3,-12.7,-12.35,-12.1,-12,0,12,12.1,12.35,12.7,13.3,18.7,19.3,19.65,19.9,20,21.5];
 const halfWindow=(y,centre)=>{const d=Math.min(4,Math.abs(y-centre));return (3.2+(d<=2.7?1.3:Math.sqrt(Math.max(0,1.3**2-(d-2.7)**2))))/40.9;};
 function limits(y){const a=halfWindow(y,16),b=halfWindow(y,-16);return [[-a,a],[a,Math.PI-b],[Math.PI-b,Math.PI+b],[Math.PI+b,2*Math.PI-a]];}
 const vertex=(a,y,r)=>[r*Math.cos(a),y,r*Math.sin(a)];
 function quad(a,b,c,d,reverse=false){for(const p of reverse?[a,d,c,a,c,b]:[a,b,c,a,c,d])positions.push(...p);}
 for(let j=0;j<rows.length-1;j++){const lo=rows[j],hi=rows[j+1],mid=(lo+hi)/2,cutA=mid>12&&mid<20,cutB=mid>-20&&mid<-12,ls=limits(lo),hs=limits(hi);
  for(let section=0;section<4;section++){const cut=section===0?cutA:section===2?cutB:false,n=section%2?120:12;for(let k=0;k<n;k++){const al=ls[section][0]+(ls[section][1]-ls[section][0])*k/n,bl=ls[section][0]+(ls[section][1]-ls[section][0])*(k+1)/n,ah=hs[section][0]+(hs[section][1]-hs[section][0])*k/n,bh=hs[section][0]+(hs[section][1]-hs[section][0])*(k+1)/n;
   if(!cut)for(const [r,reverse] of [[42.3,true],[39.5,false]])quad(vertex(al,lo,r),vertex(bl,lo,r),vertex(bh,hi,r),vertex(ah,hi,r),reverse);
   if((j===0&&!cut)||(cut&&lo===(section===0?12:-20)))quad(vertex(al,lo,39.5),vertex(al,lo,42.3),vertex(bl,lo,42.3),vertex(bl,lo,39.5),cut);
   if((j===rows.length-2&&!cut)||(cut&&hi===(section===0?20:-12)))quad(vertex(ah,hi,39.5),vertex(ah,hi,42.3),vertex(bh,hi,42.3),vertex(bh,hi,39.5),!cut);
  }if(cut)for(const [edge,reverse] of [[0,false],[1,true]])quad(vertex(ls[section][edge],lo,39.5),vertex(ls[section][edge],lo,42.3),vertex(hs[section][edge],hi,42.3),vertex(hs[section][edge],hi,39.5),reverse);}
 }
 const cupWall=new T.BufferGeometry();cupWall.setAttribute('position',new T.Float32BufferAttribute(positions,3));cupWall.computeVertexNormals();housing.push(['弧形薄壁與兩個真正徑向出索孔',cupWall]);
 housing.push(['三耳固定法蘭與三個通孔',ext(earFlange(),3,(x,z,d)=>V(x,-23+d,z),.18)]);
 const rearFloor=new T.Shape();rearFloor.absarc(0,0,42.3,0,Math.PI*2);hole(rearFloor,0,0,10.2);housing.push(['杯底與輸出軸通孔',ext(rearFloor,3,(x,z,d)=>V(x,21.5+d,z),.18)]);
 const shaftBoss=new T.Shape();shaftBoss.absarc(0,0,16,0,Math.PI*2);hole(shaftBoss,0,0,10.2);housing.push(['輸出軸支承凸台',ext(shaftBoss,4.5,(x,z,d)=>V(x,24.5+d,z),.18)]);
 for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6]){const co=Math.cos(a),si=Math.sin(a),rib=shape([[16,-.9],[39.3,-.9],[39.3,.9],[16,.9]].map(([r,w])=>[r*co-w*si,r*si+w*co]));housing.push(['杯底內肋',ext(rib,1.2,(x,z,d)=>V(x,20.3+d,z),.1)]);housing.push(['杯底外肋',ext(rib,1.3,(x,z,d)=>V(x,24.5+d,z),.1)]);}
 cover.push(['三孔前蓋薄壁與固定耳',ext(earFlange(false),3,(x,z,d)=>V(x,-26+d,z),.18)]);
 const lip=new T.Shape();lip.absarc(0,0,39.2,0,Math.PI*2);hole(lip,0,0,37.9);cover.push(['後側環形定位唇',ext(lip,2,(x,z,d)=>V(x,-23+d,z),.08)]);
 const dome=new T.LatheGeometry([[0,-28],[10,-27.9],[22,-27.5],[34,-26.7],[43,-26],[43,-25.8],[0,-25.8],[0,-28]].map(p=>new T.Vector2(...p)),128);cover.push(['薄壁淺拱前表面',dome]);
 for(const a of [Math.PI/2,Math.PI*7/6,Math.PI*11/6]){const co=Math.cos(a),si=Math.sin(a),rib=shape([[13,-.8],[41,-.8],[41,.8],[13,.8]].map(([r,w])=>[r*co-w*si,r*si+w*co]));cover.push(['前表面三向凸肋',ext(rib,.9,(x,z,d)=>V(x,-28+2*(Math.hypot(x,z)/43)**2-.9+d,z),.1)]);cover.push(['後側三向凸肋',ext(rib,.8,(x,z,d)=>V(x,-23+d,z),.1)]);}
 const medallion=new T.CylinderGeometry(13,13,.5,96);medallion.translate(0,-28.05,0);cover.push(['封閉中央圓形台面',medallion]);
 for(const [,geo] of [...carriage,...drum,...housing,...cover])if(!geo.index)smoothCurves(geo);
 const R=23.2,alpha=Math.atan2(-414,900)+Math.acos(2*R/Math.hypot(900,414));
 const arc=(x,z,a,b)=>Array.from({length:25},(_,i)=>{const q=a+(b-a)*i/24;return [x+R*Math.cos(q),-11,z+R*Math.sin(q)];});
 function curve(points){return new T.CatmullRomCurve3(points.map(p=>V(...p)),false,'centripetal');}
 function cable(id,name,points,sheathPoints,axes){const c=curve(points),length=c.getLength(),nearest=point=>{const p=V(...point);let best=0,d=Infinity;for(let k=0;k<=2000;k++){const q=c.getPointAt(k/2000).distanceToSquared(p);if(q<d){d=q;best=k/2000;}}return best;},u0=nearest(sheathPoints[0])+22/length,u1=nearest(sheathPoints.at(-1))-22/length,sc=new (class extends T.Curve{getPoint(t){return c.getPointAt(u0+(u1-u0)*t);}})(),segments=Math.max(80,Math.ceil(c.getLength()/3)),outer=new T.TubeGeometry(sc,200,3.4,10,false),inner=new T.TubeGeometry(sc,200,1.5,10,false);const ii=inner.index;for(let i=0;i<ii.count;i+=3){const b=ii.getX(i+1);ii.setX(i+1,ii.getX(i+2));ii.setX(i+2,b);}inner.computeVertexNormals();const ends=[];for(const [i,t] of [0,1].entries()){const centre=sc.getPointAt(t),tangent=sc.getTangentAt(t),g=new T.RingGeometry(1.5,3.4,32);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(V(0,0,1),tangent));g.translate(...centre.toArray());ends.push(g);}cables.push({id,name,sheathRange:[u0,u1],core:new T.TubeGeometry(c,segments,.86,8,false),sheath:[outer,inner,...ends],ends:[{point:points[0],axis:axes[0]},{point:points.at(-1),axis:axes[1]}],route:{points,source:'EP1215065A2 paragraphs 31-40; authored static centreline, drive motion unverified'}});}
 const lowerSpan=[[8,-11,-228],[100,-23,-221],[260,-36,-197],[402,-43,-155],[408,-44,-122],[425,-44,-122],[440,-45,-122]];
 cable('D05-P07','下行鋼索',[[0,-18,65],[0,-18,52],[-R,-11,40],[-R,-11,-175],...arc(0,-207,Math.PI,Math.PI*1.56),...lowerSpan],lowerSpan,['z','y']);
 const a=arc(0,207,Math.PI,alpha),b=arc(900,-207,alpha+Math.PI,Math.PI*2),crossSpan=[a.at(-1),[190,-16,144],[430,-20,16],[690,-16,-119],b[0]];
 cable('D05-P08','交叉鋼索',[[0,-18,135],[0,-18,148],[-R,-11,166],...a,...crossSpan.slice(1),...b.slice(1),[900+R,-11,36],[900,-18,52],[900,-18,65]],crossSpan,['z','z']);
 const upperSpan=[[900+R*Math.cos(2.3),-11,207+R*Math.sin(2.3)],[800,-27,151],[655,-43,30],[554,-47,-70],[540,-12,-122],[528,-12,-122],[515,-12,-122],[500,-11,-122]];
 cable('D05-P09','上行鋼索',[[900,-18,135],[900,-18,148],[900+R,-11,168],...arc(900,207,0,2.3),...upperSpan.slice(1)],upperSpan,['z','y']);
 return {carriage,drum,cables,housing,cover};
}

// Complete the preserved visible side pane with its concealed lower apron.
// The lower clamp region is defined in the same regulator frame as the jaws.
export function completeGT01DoorGlass(T,parts,regulator){
 const result=[];regulator.root.updateMatrixWorld(true);
 for(const side of [-1,1]){
  const label=side>0?'左':'右',pane=parts.find(p=>p.name===label+'門玻璃'),host=regulator.root.children.find(p=>p.userData.id==='D05-HOST-'+(side>0?'L':'R'));
  if(!pane||!host)throw Error('Missing paired pane/regulator '+label);
  const source=pane.geometry.attributes.position,nu=55,upperRows=36,extraRows=28,nv=upperRows+extraRows,inv=host.matrixWorld.clone().invert(),mid=[];
  if(source.count!==(nu+1)*upperRows)throw Error('Door glass source grid changed');
  pane.updateWorldMatrix(true,false);
  for(let i=0;i<=nu;i++){
   const column=[];for(let j=0;j<upperRows;j++)column.push(new T.Vector3().fromBufferAttribute(source,i*upperRows+j).applyMatrix4(pane.matrixWorld).applyMatrix4(inv));
   const e=column.at(-1),previous=column.at(-2),bottomX=-100+1060*i/nu,height=e.z-206,baseY=-45-.55*(206-169),sec=(e.y-baseY)/height;
   let slope=(e.y-previous.y)/(e.z-previous.z);slope=Math.sign(slope)===Math.sign(sec)?Math.sign(sec)*Math.min(Math.abs(slope),3*Math.abs(sec)):0;
   for(let j=1;j<=extraRows;j++){const t=j/extraRows,z=e.z+(169-e.z)*t,u=Math.max(0,Math.min(1,(z-206)/height)),y=z<=206?-45-.55*(z-169):baseY+(3*u*u-2*u*u*u)*(e.y-baseY)+(u*u*u-2*u*u+u)*height*(-.55)+(u*u*u-u*u)*height*slope,x=e.x+(bottomX-e.x)*t*t*(3-2*t);column.push(new T.Vector3(x,y,z));}
   mid.push(...column);
  }
  const positions=[],indices=[],edgeIndices=[],uv=[],N=mid.length;
  for(const sign of [1,-1])for(let i=0;i<=nu;i++)for(let j=0;j<nv;j++){
   const k=i*nv+j,du=mid[Math.min(nu,i+1)*nv+j].clone().sub(mid[Math.max(0,i-1)*nv+j]),dv=mid[i*nv+Math.min(nv-1,j+1)].clone().sub(mid[i*nv+Math.max(0,j-1)]),normal=du.cross(dv).normalize();if(normal.y<0)normal.negate();const p=mid[k].clone().addScaledVector(normal,sign*2.25).applyMatrix4(host.matrixWorld);positions.push(...p.toArray());uv.push(i/nu,j/(nv-1));
  }
  for(let i=0;i<nu;i++)for(let j=0;j<nv-1;j++){const a=i*nv+j,b=a+nv;indices.push(a,b,a+1,b,b+1,a+1,N+a,N+a+1,N+b,N+b,N+a+1,N+b+1);}
  const boundary=[];for(let i=0;i<=nu;i++)boundary.push(i*nv);for(let j=1;j<nv;j++)boundary.push(nu*nv+j);for(let i=nu-1;i>=0;i--)boundary.push(i*nv+nv-1);for(let j=nv-2;j>0;j--)boundary.push(j);
  for(let k=0;k<boundary.length;k++){const a=boundary[k],b=boundary[(k+1)%boundary.length];edgeIndices.push(a,N+a,b,b,N+a,N+b);}
  // The right door frame is mirrored. Restore consistent outward winding after mapping.
  if(host.matrixWorld.determinant()<0)for(const array of [indices,edgeIndices])for(let i=0;i<array.length;i+=3)[array[i+1],array[i+2]]=[array[i+2],array[i+1]];
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex([...indices,...edgeIndices]);geo.addGroup(0,indices.length,0);geo.addGroup(indices.length,edgeIndices.length,1);geo.computeVertexNormals();
  pane.geometry.dispose();pane.geometry=geo;pane.material=[new T.MeshPhysicalMaterial({color:0x9cb8b2,metalness:0,roughness:.045,transparent:true,opacity:.19,depthWrite:false,side:T.FrontSide}),new T.MeshStandardMaterial({color:0x5b8881,metalness:0,roughness:.12,transparent:true,opacity:.72,depthWrite:false,side:T.DoubleSide})];pane.castShadow=false;
  pane.userData={...pane.userData,referencePart:'D04',reference:'D04-glass-r2.png',revision:'D04-FULL-PANE-R2',geometryRole:'single continuous 4.5 mm glazing pane',source:'Preserved visible source surface with tangent-continuous authored concealed apron',glassInterface:{hostId:host.userData.id,planeYAtBottom:-45,gripSlopeYPerZ:-.55,thickness:4.5,bottomZ:169,flatGripTopZ:206,clampCentreX:[0,900],gripHeight:30,gripWidth:56}};
  result.push(pane);
 }
 return result;
}

// GT01 authored commutator geometry, millimetres. Shaft axis +X; Y=Z=0.
// No THREE import: the owning motor supplies its own Three.js runtime as T.
export function makeGT01Commutator(T) {
  const TAU = 2 * Math.PI, count = 12, period = TAU / count;
  const grooveAngle = 0.20 / 5.2, halfAngle = (period - grooveAngle) / 2;
  const copperSteps = 64, grooveSteps = 8;
  // Move the whole commutator forward of the winding crown; radius and topology
  // stay unchanged. All published coordinates are in the final motor frame.
  const X = x => x - 6, span = limits => limits.map(X);
  const radial = (x, r, angle) => [X(x), r * Math.cos(angle), r * Math.sin(angle)];
  const components = [], terminals = [];

  // Vertices are deliberately split at profile corners: the curved walls have
  // analytic radial normals, while the lips, groove floor and ends stay sharp.
  function builder() {
    const positions = [], normals = [];
    function triangle(a, b, c, na, nb = na, nc = na) {
      positions.push(...a, ...b, ...c);
      normals.push(...na, ...nb, ...nc);
    }
    function sweptEdge(p, q, a0, a1, steps) {
      const dx = q[0] - p[0], dr = q[1] - p[1], len = Math.hypot(dx, dr);
      const normal = angle => [dr / len, -dx * Math.cos(angle) / len,
        -dx * Math.sin(angle) / len];
      for (let j = 0; j < steps; j++) {
        const a = a0 + (a1 - a0) * j / steps;
        const b = a0 + (a1 - a0) * (j + 1) / steps;
        const p0 = radial(...p, a), q0 = radial(...q, a);
        const p1 = radial(...p, b), q1 = radial(...q, b);
        triangle(p0, q0, q1, normal(a), normal(a), normal(b));
        triangle(p0, q1, p1, normal(a), normal(b), normal(b));
      }
    }
    function profileCap(profile, angle, positive) {
      const face = T.ShapeUtils.triangulateShape(
        profile.map(([x, r]) => new T.Vector2(x, r)), []);
      const s = positive ? 1 : -1;
      const normal = [0, -s * Math.sin(angle), s * Math.cos(angle)];
      for (const ids of face) {
        const [a, b, c] = positive ? ids : [ids[0], ids[2], ids[1]];
        triangle(radial(...profile[a], angle), radial(...profile[b], angle),
          radial(...profile[c], angle), normal);
      }
    }
    function finish(name) {
      const geometry = new T.BufferGeometry();
      geometry.name = name;
      geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      return geometry;
    }
    return { sweptEdge, profileCap, finish };
  }

  const intervals = [];
  for (let k = 0; k < count; k++) {
    const centre = k * period;
    intervals.push({ a: centre - halfAngle, b: centre + halfAngle,
      steps: copperSteps, rib: false });
    intervals.push({ a: centre + halfAngle, b: centre + period - halfAngle,
      steps: grooveSteps, rib: true });
  }

  // One closed moulded solid. Ribs are part of its outer boundary: hidden root
  // faces are omitted, rather than leaving overlapping closed cylinders/boxes.
  const core = builder();
  for (const { a, b, steps, rib } of intervals) {
    core.sweptEdge([46.5, 3.01], [54.8, 3.01], a, b, steps); // Through bore.
    core.sweptEdge([48, 4.3], [46.5, 4.3], a, b, steps);
    core.sweptEdge([54.8, 4.3], [53.2, 4.3], a, b, steps);
    core.sweptEdge([46.5, 4.3], [46.5, 3.01], a, b, steps);
    core.sweptEdge([54.8, 3.01], [54.8, 4.3], a, b, steps);
    core.sweptEdge([53.2, rib ? 4.8 : 4.3], [48, rib ? 4.8 : 4.3], a, b, steps);
    if (rib) {
      core.sweptEdge([48, 4.8], [48, 4.3], a, b, steps);
      core.sweptEdge([53.2, 4.3], [53.2, 4.8], a, b, steps);
      const side = [[48, 4.3], [53.2, 4.3], [53.2, 4.8], [48, 4.8]];
      core.profileCap(side, a, false);
      core.profileCap(side, b, true);
    }
  }
  components.push({
    ref: 'D05-P14f-a', name: '換向器模製絕緣芯', material: 'insulator', instance: 1,
    surfaces: [['貫通軸孔、連續絕緣芯及十二個片間隔肋', core.finish('D05-P14f-a')]],
    interfaces: { shaftAxis: [1, 0, 0], shaftBore: 6.02, shaftDiameter: 6,
      nominalRadialShaftClearance: 0.01, axialX: span([46.5, 54.8]), outerRadius: 4.3,
      ribCount: 12, ribAxialX: span([48, 53.2]), ribTopRadius: 4.8,
      ribAngularWidth: grooveAngle, ribCentreOffset: period / 2 },
    explode: [-14, 0, 0]
  });

  // A single CCW section in (X,R). The re-entrant U-profile makes an actual
  // 0.8 mm wide channel, open radially; the two ears and contact barrel share
  // one continuous copper volume. It is not a colour applied to a full tube.
  const copperProfile = [[48, 4.3], [54.8, 4.3], [54.8, 6.3],
    [54.4, 6.3], [54.4, 5.55], [53.6, 5.55], [53.6, 6.3],
    [53.2, 6.3], [53.2, 5.2], [48, 5.2]];
  for (let k = 0; k < count; k++) {
    const angle = k * period, a = angle - halfAngle, b = angle + halfAngle;
    const copper = builder();
    for (let j = 0; j < copperProfile.length; j++) {
      copper.sweptEdge(copperProfile[j], copperProfile[(j + 1) % copperProfile.length],
        a, b, copperSteps);
    }
    copper.profileCap(copperProfile, a, false);
    copper.profileCap(copperProfile, b, true);
    const wireSeats = [-1, 1].map((side, index) => {
      const seatAngle = angle + side * 0.09;
      return { index, position: radial(54, 5.75, seatAngle),
        tangent: [0, -side * Math.sin(seatAngle), side * Math.cos(seatAngle)],
        wireOuterDiameter: 0.36, radialFloorClearance: 0.02,
        side, angle: seatAngle };
    });
    const terminal = { ref: 'D05-P14f-b', instance: k + 1, index: k,
      angle, coordinateSpace: 'motor-shaft-local', wireSeats };
    terminals.push(terminal);
    components.push({
      ref: 'D05-P14f-b', instance: k + 1,
      name: '換向器銅片 ' + String(k + 1).padStart(2, '0'), material: 'copper',
      surfaces: [['一體接觸弧、雙壁凸耳與開口導線槽',
        copper.finish('D05-P14f-b-' + (k + 1))]],
      interfaces: { shaftAxis: [1, 0, 0], segmentIndex: k, centreAngle: angle,
        angularLimits: [a, b], contactAxialX: span([48, 53.2]), contactInnerRadius: 4.3,
        contactOuterRadius: 5.2, lugAxialX: span([53.2, 54.8]), lugMaximumRadius: 6.3,
        wireGrooveAxialX: span([53.6, 54.4]), wireGrooveFloorRadius: 5.55,
        wireGrooveTopRadius: 6.3, wireSeats },
      explode: [0, 14 * Math.cos(angle), 14 * Math.sin(angle)]
    });
  }

  return { components, terminals, interfaces: {
    units: 'mm', axis: [1, 0, 0], localOrigin: [0, 0, 0],
    coordinateSpace: 'motor-shaft-local', authority: 'AUTHOR_DESIGN',
    segmentCount: count, angularIndex: 'theta=k*2*pi/12; Y=R*cos(theta); Z=R*sin(theta)',
    shaftDiameter: 6, shaftBore: 6.02, axialX: span([46.5, 54.8]),
    contactAxialX: span([48, 53.2]), outerContactRadius: 5.2,
    slotWidthAtContactRadius: 2 * 5.2 * Math.sin(grooveAngle / 2),
    interSegmentGrooveAngle: grooveAngle, insulatorRibTopRadius: 4.8,
    windingSeatCount: 24, windingWireOuterDiameter: 0.36,
    laminationStartX: 58, axialClearanceToLamination: 58 - X(54.8),
    windingCrownStartX: 49.5, axialClearanceToWindingCrown: 49.5 - X(54.8),
    copperProfileXR: copperProfile.map(([x, r]) => [X(x), r])
  } };
}

// Authored lap-winding candidate. Local shaft axis X, millimetres.
// Sources establish the 12-slot / 12-bar / pitch-1-to-6 topology only.
export function makeGT01MotorWinding(T,terminals=[],includeWinding=false){
 const TAU=2*Math.PI,P=TAU/12,components=[],centerlines=[],V=(...p)=>new T.Vector3(...p);
 const at=(x,r,a)=>V(x,r*Math.cos(a),r*Math.sin(a));
 // An open, continuous folded slot liner, not a solid wedge in the copper space.
 const a=.17+.026,b=P-.17-.026,ro=10.12,ri=5.94,th=.12;
 const sh=new T.Shape();sh.moveTo(ro*Math.cos(a),ro*Math.sin(a));sh.lineTo(ri*Math.cos(a),ri*Math.sin(a));sh.absarc(0,0,ri,a,b,false);sh.lineTo(ro*Math.cos(b),ro*Math.sin(b));sh.lineTo(ro*Math.cos(b-.014),ro*Math.sin(b-.014));sh.lineTo((ri+th)*Math.cos(b-.014),(ri+th)*Math.sin(b-.014));sh.absarc(0,0,ri+th,b-.014,a+.014,true);sh.lineTo(ro*Math.cos(a+.014),ro*Math.sin(a+.014));sh.closePath();
 const base=new T.ExtrudeGeometry(sh,{depth:29,bevelEnabled:false,curveSegments:32});const bp=base.attributes.position;for(let i=0;i<bp.count;i++){const y=bp.getX(i),z=bp.getY(i),x=bp.getZ(i);bp.setXYZ(i,57.5+x,y,z);}base.clearGroups();base.computeVertexNormals();
 for(let k=0;k<12;k++){const geometry=base.clone();geometry.rotateX(k*P);components.push({ref:'D05-P14r',instance:k+1,name:'槽絕緣襯片 '+String(k+1).padStart(2,'0'),material:'slotInsulator',surfaces:[['連續 U 形薄壁與開口',geometry]],explode:[0,20*Math.cos((k+.5)*P),20*Math.sin((k+.5)*P)],interfaces:{slotIndex:k,axialX:[57.5,86.5],rootR:ri,rootThickness:th,sideAngularThickness:.014,open:true}});}
 if(!includeWinding)return {components,centerlines,interfaces:{scope:'12 physical slot liners only',windingCandidateExcluded:true,authority:'AUTHOR_DESIGN'}};
 const od=.36,turns=8;
 function appendLine(p,q,points,step=.3){const n=Math.ceil(p.distanceTo(q)/step);for(let i=points.length?1:0;i<=n;i++)points.push(p.clone().lerp(q,i/n));}
 function crown(x0,x1,r0,r1,t0,t1,points){
   const n=100;for(let j=1;j<=n;j++){const u=j/n,s=u*u*(3-2*u),arc=Math.sin(Math.PI*u);const x=x0+(x1-x0)*s;points.push(at(x,r0+(r1-r0)*s,t0+(t1-t0)*s));}
 }
 // Paths stay separate data so a failed route is inspectable and cannot be
 // mistaken for a certified winding merely because its copper material renders.
 for(let k=0;k<12;k++){
  const points=[],ends=[];let last;
  for(let n=0;n<turns;n++){
   const row=Math.floor(n/2),col=n%2,ang0=(k+.5)*P+(col?1:-1)*.19/(6.6+.4*row),ang1=ang0+5*P;
   const r0=6.6+.4*row,r1=8.6+.4*row,xf=49.5+n*.82,xb=94.8-n*.82;
   const a0=at(57.25,r0,ang0),a1=at(86.75,r0,ang0),b1=at(86.75,r1,ang1),b0=at(57.25,r1,ang1);
   if(last){appendLine(last,at(xf,r0,ang0),points);appendLine(points.at(-1),a0,points);}else{points.push(a0);ends.push(a0.toArray());}
   appendLine(a0,a1,points);appendLine(a1,at(xb,r0,ang0),points);crown(xb,xb,r0,r1,ang0,ang1,points);appendLine(points.at(-1),b1,points);appendLine(b1,b0,points);
   if(n<turns-1){const nr=Math.floor((n+1)/2),nc=(n+1)%2,ra=6.6+.4*nr,aa=(k+.5)*P+(nc?1:-1)*.19/ra;appendLine(b0,at(xf,r1,ang1),points);crown(xf,xf,r1,ra,ang1,aa,points);last=points.at(-1);}else ends.push(b0.toArray());
  }
  const curve=new T.CurvePath();for(let j=1;j<points.length;j++)if(points[j].distanceToSquared(points[j-1])>1e-12)curve.add(new T.LineCurve3(points[j-1],points[j]));
  const geo=new T.TubeGeometry(curve,Math.ceil(curve.getLength()/.23),od/2,8,false);geo.clearGroups();
  components.push({ref:'D05-P14e',instance:k+1,name:'連續疊繞線圈 '+String(k+1).padStart(2,'0'),material:'enamel',surfaces:[['八匝連續導線，端子引線待路徑檢查',geo]],explode:[0,30*Math.cos((k+.5)*P),30*Math.sin((k+.5)*P)],interfaces:{slotIndices:[k,(k+5)%12],barIndices:[k,(k+1)%12],turns,wireOD:od,ends,terminalsConnected:false,routeStatus:'CANDIDATE_NOT_CLEARED',length:curve.getLength()}});
  centerlines.push({instance:k+1,points:points.map(p=>p.toArray()),wireOD:od,ends});
 }
 return {components,centerlines,interfaces:{topology:'two-pole simplex lap; 12 slots, 12 bars; coil pitch 1–6',turns,wireOD:od,clearanceVerified:false,terminalLeadsComplete:false,authority:'AUTHOR_DESIGN'}};
}

// GT01 authored brush and spring geometry, millimetres, motor-shaft-local.
// The motor owns the Three.js runtime and materials; no THREE import here.
export function makeGT01MotorBrushes(T) {
  const TAU = 2 * Math.PI, V = p => new T.Vector3(...p), components = [];
  function meshBuilder() {
    const positions = [], normals = [];
    function tri(a, b, c, na, nb = na, nc = na) {
      const cross = V(b).sub(V(a)).cross(V(c).sub(V(a)));
      if (cross.dot(V(na).add(V(nb)).add(V(nc))) < 0) {
        [b, c] = [c, b]; [nb, nc] = [nc, nb];
      }
      positions.push(...a, ...b, ...c); normals.push(...na, ...nb, ...nc);
    }
    function quad(a, b, c, d, na, nb = na, nc = na, nd = na) {
      tri(a, b, c, na, nb, nc); tri(a, c, d, na, nc, nd);
    }
    function finish(name) {
      const g = new T.BufferGeometry(); g.name = name;
      g.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
      g.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
      g.computeBoundingBox(); g.computeBoundingSphere(); return g;
    }
    return { tri, quad, finish };
  }

  const R = 5.2, x0 = 42.8, x1 = 46.2, halfWidth = 1.6;
  const outerY = 9.2, bevel = 0.15, shoulderY = outerY - bevel;
  const holeR = 0.4, holeY = 8.1, holeDepth = 0.7, holeSteps = 64;
  const contactHalfAngle = Math.asin(halfWidth / R);
  const profile = [];
  for (let j = 0; j <= 128; j++) {
    const angle = contactHalfAngle * (1 - 2 * j / 128);
    profile.push([R * Math.cos(angle), R * Math.sin(angle)]);
  }
  profile.push([shoulderY, -halfWidth], [shoulderY, halfWidth]);
  const hole = Array.from({ length: holeSteps }, (_, j) => {
    const a = -TAU * j / holeSteps;
    return [holeY + holeR * Math.cos(a), holeR * Math.sin(a)];
  });
  const brush = meshBuilder();
  // Extruded lower boundary, including the true concave cylindrical contact.
  // The upper face is omitted here so the bevel is one connected boundary.
  for (let j = 0; j < profile.length; j++) {
    const p = profile[j], q = profile[(j + 1) % profile.length];
    if (p[0] === shoulderY && q[0] === shoulderY) continue;
    const edgeNormal = V([0, q[1] - p[1], p[0] - q[0]]).normalize().toArray();
    const curved = j < 128;
    const np = curved ? [0, -p[0] / R, -p[1] / R] : edgeNormal;
    const nq = curved ? [0, -q[0] / R, -q[1] / R] : edgeNormal;
    brush.quad([x0, ...p], [x0, ...q], [x1, ...q], [x1, ...p], np, nq, nq, np);
  }
  function axialCap(x, withHole, sign) {
    const holes = withHole ? [hole.map(p => new T.Vector2(...p))] : [];
    const triangles = T.ShapeUtils.triangulateShape(
      profile.map(p => new T.Vector2(...p)), holes);
    const points = withHole ? [...profile, ...hole] : profile;
    for (const ids of triangles) brush.tri(...ids.map(i => [x, ...points[i]]), [sign, 0, 0]);
  }
  axialCap(x0, true, -1); axialCap(x1, false, 1);
  const lower = [[x0, shoulderY, -halfWidth], [x1, shoulderY, -halfWidth],
    [x1, shoulderY, halfWidth], [x0, shoulderY, halfWidth]];
  const upper = [[x0 + bevel, outerY, -halfWidth + bevel],
    [x1 - bevel, outerY, -halfWidth + bevel],
    [x1 - bevel, outerY, halfWidth - bevel],
    [x0 + bevel, outerY, halfWidth - bevel]];
  const bevelNormals = [[0, 1, -1], [1, 1, 0], [0, 1, 1], [-1, 1, 0]];
  for (let j = 0; j < 4; j++) brush.quad(lower[j], lower[(j + 1) % 4],
    upper[(j + 1) % 4], upper[j], V(bevelNormals[j]).normalize().toArray());
  brush.quad(...upper, [0, 1, 0]);
  // Actual blind bore: front cap hole, inward cylindrical wall, solid floor.
  for (let j = 0; j < holeSteps; j++) {
    const a = hole[j], b = hole[(j + 1) % holeSteps];
    const na = [0, (holeY - a[0]) / holeR, -a[1] / holeR];
    const nb = [0, (holeY - b[0]) / holeR, -b[1] / holeR];
    brush.quad([x0, ...a], [x0 + holeDepth, ...a],
      [x0 + holeDepth, ...b], [x0, ...b], na, na, nb, nb);
    brush.tri([x0 + holeDepth, holeY, 0], [x0 + holeDepth, ...a],
      [x0 + holeDepth, ...b], [-1, 0, 0]);
  }
  const brushGeometry = brush.finish('D05-P14g-positive');

  const spring = meshBuilder(), wireRadius = 0.14, coilRadius = 1.1;
  const turns = 5, axialRise = 4.02, endRise = 0.30;
  const longitudinalSteps = 5 * 128, wireSteps = 24;
  // Five turns with low-pitch closing turns and C1 transitions. Zero endpoint
  // slope puts the wire extrema exactly on the two radial support planes.
  function advance(t) {
    if (t <= 1) return { h: endRise * (2 * t * t - t * t * t),
      dh: endRise * (4 * t - 3 * t * t) };
    if (t >= 4) { const q = 5 - t, start = advance(q);
      return { h: axialRise - start.h, dh: start.dh }; }
    const u = (t - 1) / 3, middleRise = axialRise - 2 * endRise;
    const extra = middleRise - 3 * endRise;
    return { h: endRise + 3 * endRise * u + extra * (3 * u * u - 2 * u * u * u),
      dh: endRise + extra * (6 * u - 6 * u * u) / 3 };
  }
  const rings = [], centreline = [], tangents = [];
  for (let j = 0; j <= longitudinalSteps; j++) {
    const t = turns * j / longitudinalSteps, a = TAU * t, rise = advance(t);
    const centre = V([44.5 + coilRadius * Math.cos(a), 9.34 + rise.h,
      coilRadius * Math.sin(a)]);
    const tangent = V([-TAU * coilRadius * Math.sin(a), rise.dh,
      TAU * coilRadius * Math.cos(a)]).normalize();
    const n = V([Math.cos(a), 0, Math.sin(a)]), b = n.clone().cross(tangent).normalize();
    const ring = [];
    for (let k = 0; k < wireSteps; k++) {
      const angle = TAU * k / wireSteps;
      const normal = n.clone().multiplyScalar(Math.cos(angle)).addScaledVector(b, Math.sin(angle));
      ring.push({ p: centre.clone().addScaledVector(normal, wireRadius).toArray(), n: normal.toArray() });
    }
    rings.push(ring); centreline.push(centre.toArray()); tangents.push(tangent.toArray());
  }
  for (let j = 0; j < longitudinalSteps; j++) for (let k = 0; k < wireSteps; k++) {
    const next = (k + 1) % wireSteps, a = rings[j][k], b = rings[j + 1][k];
    const c = rings[j + 1][next], d = rings[j][next];
    spring.quad(a.p, b.p, c.p, d.p, a.n, b.n, c.n, d.n);
  }
  for (const j of [0, longitudinalSteps]) for (let k = 0; k < wireSteps; k++) {
    const sign = j === 0 ? -1 : 1, normal = tangents[j].map(v => sign * v);
    spring.tri(centreline[j], rings[j][k].p, rings[j][(k + 1) % wireSteps].p, normal);
  }
  const springGeometry = spring.finish('D05-P14h-positive');
  springGeometry.userData = { centreline: centreline.map(p => [...p]), wireRadius,
    turns, endRisePerTurn: endRise, longitudinalSteps, wireSteps };

  for (let k = 0; k < 2; k++) {
    const sign = k === 0 ? 1 : -1;
    const g = brushGeometry.clone(), s = springGeometry.clone();
    if (k) { g.rotateX(Math.PI); s.rotateX(Math.PI); }
    g.computeBoundingBox(); s.computeBoundingBox();
    g.name = 'D05-P14g-' + (k + 1); s.name = 'D05-P14h-' + (k + 1);
    s.userData = { ...springGeometry.userData,
      centreline: centreline.map(([x, y, z]) => [x, sign * y, sign * z]) };
    components.push({ ref: 'D05-P14g', instance: k + 1,
      name: (k ? '負 Y 側' : '正 Y 側') + '圓柱凹面碳刷', material: 'carbon',
      surfaces: [['連續碳刷、圓柱接觸面、外端倒角與引線盲座', g]],
      interfaces: { contactRadius: R, contactCylinderAxis: [1, 0, 0],
        contactCylinderCentre: [0, 0, 0], contactAxialX: [x0, x1],
        contactAngleHalfSpan: contactHalfAngle, rotationAboutX: k * Math.PI,
        radialAxis: [0, sign, 0], brushWidthZ: 3.2, outerEndY: sign * outerY,
        outerEdgeChamfer: bevel, springContactPlaneY: sign * outerY,
        springContactFlatX: [x0 + bevel, x1 - bevel], springContactFlatZ: [-1.45, 1.45],
        leadBlindSeat: { opening: [x0, sign * holeY, 0], axisIntoBrush: [1, 0, 0],
          diameter: 0.8, depth: holeDepth, floorX: x0 + holeDepth },
        envelope: { min: g.boundingBox.min.toArray(), max: g.boundingBox.max.toArray() } },
      explode: [0, sign * 14, 0] });
    components.push({ ref: 'D05-P14h', instance: k + 1,
      name: (k ? '負 Y 側' : '正 Y 側') + '碳刷壓縮彈簧', material: 'springSteel',
      surfaces: [['五圈連續變節距鋼線、低節距端圈及兩個封口', s]],
      interfaces: { springAxis: [0, sign, 0], springAxisOrigin: [44.5, 0, 0],
        wireDiameter: 0.28, coilCentreRadius: coilRadius, turns,
        innerSupportPlaneY: sign * 9.2, outerSupportPlaneY: sign * 13.5,
        installedHeight: 4.3, centrelineEndY: [sign * 9.34, sign * 13.36],
        closingTurnAxialRise: endRise, endCaps: 2,
        radialEnvelopeFromSpringAxis: 1.24,
        envelope: { min: s.boundingBox.min.toArray(), max: s.boundingBox.max.toArray() } },
      explode: [0, sign * 23, 0] });
  }
  brushGeometry.dispose(); springGeometry.dispose();
  return { components, interfaces: { units: 'mm', coordinateSpace: 'motor-shaft-local',
    shaftAxis: [1, 0, 0], shaftCentre: [0, 0, 0], authority: 'AUTHOR_DESIGN',
    brushCount: 2, springCount: 2, commutatorContactRadius: R,
    brushContactAxialX: [x0, x1], brushRotationAboutX: [0, Math.PI],
    leadSeatOpenings: [[42.8, 8.1, 0], [42.8, -8.1, 0]],
    leadSeatDrillAxis: [1, 0, 0], leadSeatDiameter: 0.8, leadSeatDepth: 0.7 } };
}

// One connected author-designed moulding; shaft-local millimetres.
export function makeGT01BrushCarrier(T) {
 const positions=[],V=p=>new T.Vector3(...p),TAU=2*Math.PI;
 const circle=(r,y=0,z=0,n=192)=>Array.from({length:n},(_,i)=>[y+r*Math.cos(i*TAU/n),z+r*Math.sin(i*TAU/n)]);
 const outer=circle(14.5),holes=[circle(4.4),circle(.5,8.1,0,64),circle(.5,-8.1,0,64)];
 const guide=[[5,-2.15],[13.9,-2.15],[13.9,2.15],[5,2.15],[5,1.75],[13.5,1.75],[13.5,-1.75],[5,-1.75]];
 const guides=[guide,guide.map(([y,z])=>[-y,-z])];
 function tri(a,b,c,normal){const cross=V(b).sub(V(a)).cross(V(c).sub(V(a)));if(cross.lengthSq()<1e-18)return;if(cross.dot(V(normal))<0)[b,c]=[c,b];positions.push(...a,...b,...c);}
 function cap(loop,voids,x,sign){const points=[...loop,...voids.flat()],ids=T.ShapeUtils.triangulateShape(loop.map(p=>new T.Vector2(...p)),voids.map(h=>h.map(p=>new T.Vector2(...p))));for(const t of ids)tri(...t.map(i=>[x,...points[i]]),[sign,0,0]);}
 function wall(loop,x0,x1,inward=false){for(let i=0;i<loop.length;i++){const a=loop[i],b=loop[(i+1)%loop.length],normal=[0,(b[1]-a[1])*(inward?-1:1),(a[0]-b[0])*(inward?-1:1)];tri([x0,...a],[x0,...b],[x1,...b],normal);tri([x0,...a],[x1,...b],[x1,...a],normal);}}
 cap(outer,holes,39.5,-1);cap(outer,[...holes,...guides],41.7,1);wall(outer,39.5,41.7);for(const h of holes)wall(h,39.5,41.7,true);
 for(const g of guides){const wide=g.map(([y,z],i)=>[y,i<4?Math.sign(z)*2.55:z]),sections=[[41.7,g],[45.3,g],[45.3,wide],[45.8,wide],[45.8,g],[46.3,g]];for(let j=1;j<sections.length;j++)for(let i=0;i<g.length;i++){const next=(i+1)%g.length,[x0,p0]=sections[j-1],[x1,p1]=sections[j],a=[x0,...p0[i]],b=[x0,...p0[next]],c=[x1,...p1[next]],d=[x1,...p1[i]];const n=V(b).sub(V(a)).cross(V(c).sub(V(a))).toArray();tri(a,b,c,n);const n2=V(c).sub(V(a)).cross(V(d).sub(V(a))).toArray();tri(a,c,d,n2);}cap(g,[],46.3,1);}
 // Conform the stepped rail shoulders: a long mouth edge must be split at
 // every adjoining shoulder vertex, rather than leaving geometric T junctions.
 const vertices=[...new Map(Array.from({length:positions.length/3},(_,i)=>{const p=positions.slice(i*3,i*3+3);return [p.map(x=>x.toFixed(9)).join(','),p];})).values()],conformed=[];
 for(let i=0;i<positions.length;i+=9){const t=[positions.slice(i,i+3),positions.slice(i+3,i+6),positions.slice(i+6,i+9)],boundary=[];let split=false;for(let j=0;j<3;j++){const a=V(t[j]),b=V(t[(j+1)%3]),d=b.clone().sub(a),length=d.lengthSq(),points=[];boundary.push(t[j]);for(const p of vertices){const q=V(p).sub(a),u=q.dot(d)/length;if(u>1e-7&&u<1-1e-7&&q.addScaledVector(d,-u).lengthSq()<1e-16)points.push({p,u});}points.sort((a,b)=>a.u-b.u);for(const p of points)boundary.push(p.p);split||=points.length>0;}if(!split)conformed.push(...positions.slice(i,i+9));else{const centre=V(t[0]).add(V(t[1])).add(V(t[2])).multiplyScalar(1/3).toArray();for(let j=0;j<boundary.length;j++)conformed.push(...centre,...boundary[j],...boundary[(j+1)%boundary.length]);}}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(conformed,3));geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.name='D05-P14i-a-continuous-carrier';
 return {components:[{ref:'D05-P14i-a',instance:1,name:'一體式刷架基板與雙導槽',material:'phenolic',surfaces:[['連續基板、貫通孔、雙 U 槽、滑軌與彈簧止擋',geometry]],explode:[-15,0,0],interfaces:{authority:'AUTHOR_DESIGN',shaftAxis:[1,0,0],baseX:[39.5,41.7],baseOD:29,centralBore:8.8,guideX:[41.7,46.3],guideOuterWidth:4.3,guideInnerWidth:3.5,guideWall:.4,springStopY:[-13.5,13.5],retainerRails:{axialX:[45.3,45.8],innerAbsZ:2.15,outerAbsZ:2.55,radialAbsY:[5,13.9],continuousWithCarrier:true},wireHoles:[{centre:[39.5,8.1,0],diameter:1,depth:2.2},{centre:[39.5,-8.1,0],diameter:1,depth:2.2}],axialRetainersComplete:false,caseRetentionComplete:false}}]};
}

// GT01 authored sliding brush caps, mm, motor shaft +X, local Y=Z=0.
// The partition uses only exact design planes; it is not a sampled voxel grid.
export function makeGT01BrushRetainers(T) {
  const regions = [
    { name: 'roof', min: [46.4, 5.35, -2.9], max: [46.8, 14.25, 2.9] },
    { name: 'positiveSideWall', min: [45.15, 5.35, 2.65], max: [46.4, 13.95, 2.9] },
    { name: 'negativeSideWall', min: [45.15, 5.35, -2.9], max: [46.4, 13.95, -2.65] },
    { name: 'positiveHookLip', min: [45.15, 5.35, 2.2], max: [45.25, 13.95, 2.65] },
    { name: 'negativeHookLip', min: [45.15, 5.35, -2.65], max: [45.25, 13.95, -2.2] },
    // Full-width stop joins both side walls over finite end-face areas.
    { name: 'outerStop', min: [45.9, 13.95, -2.9], max: [46.4, 14.25, 2.9] }
  ];
  const planes = [0, 1, 2].map(axis => [...new Set(regions.flatMap(r =>
    [r.min[axis], r.max[axis]]))].sort((a, b) => a - b));
  const cellKey = (i, j, k) => `${i},${j},${k}`;
  const occupied = new Set(), cells = [];
  for (let i = 0; i < planes[0].length - 1; i++)
    for (let j = 0; j < planes[1].length - 1; j++)
      for (let k = 0; k < planes[2].length - 1; k++) {
        const index = [i, j, k];
        const min = index.map((v, axis) => planes[axis][v]);
        const max = index.map((v, axis) => planes[axis][v + 1]);
        const mid = min.map((v, axis) => (v + max[axis]) / 2);
        if (!regions.some(r => mid.every((v, axis) => v > r.min[axis] && v < r.max[axis]))) continue;
        occupied.add(cellKey(...index)); cells.push({ index, min, max });
      }
  const positions = [], normals = [];
  function face(points, normal) {
    const cross = new T.Vector3(...points[1]).sub(new T.Vector3(...points[0]))
      .cross(new T.Vector3(...points[2]).sub(new T.Vector3(...points[0])));
    if (cross.dot(new T.Vector3(...normal)) < 0) points = [points[0], points[3], points[2], points[1]];
    for (const i of [0, 1, 2, 0, 2, 3]) {
      positions.push(...points[i]); normals.push(...normal);
    }
  }
  let boundaryQuads = 0, nominalVolume = 0;
  for (const cell of cells) {
    nominalVolume += cell.min.reduce((v, p, axis) => v * (cell.max[axis] - p), 1);
    for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
      const neighbour = [...cell.index]; neighbour[axis] += sign;
      if (occupied.has(cellKey(...neighbour))) continue; // No internal union face.
      const other = [0, 1, 2].filter(a => a !== axis), points = [];
      for (const pair of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
        const p = [...cell.min]; p[axis] = sign < 0 ? cell.min[axis] : cell.max[axis];
        for (let t = 0; t < 2; t++) p[other[t]] = pair[t] ? cell.max[other[t]] : cell.min[other[t]];
        points.push(p);
      }
      const normal = [0, 0, 0]; normal[axis] = sign; face(points, normal); boundaryQuads++;
    }
  }
  const base = new T.BufferGeometry();
  base.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  base.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
  base.userData = { construction: 'exact-coordinate-plane-union-boundary',
    sourceRegions: regions, coordinatePlanes: planes, occupiedCells: cells.length,
    boundaryQuads, nominalVolume };
  const components = [];
  for (let k = 0; k < 2; k++) {
    const sign = k ? -1 : 1, geometry = base.clone();
    if (k) geometry.rotateX(Math.PI);
    geometry.name = 'D05-P14i-b-' + (k + 1);
    geometry.computeBoundingBox(); geometry.computeBoundingSphere();
    components.push({ ref: 'D05-P14i-b', instance: k + 1,
      name: (k ? '負 Y 側' : '正 Y 側') + '碳刷滑入扣蓋', material: 'phenolic',
      surfaces: [['聯集屋頂、側壁、內勾唇與外端止擋', geometry]],
      interfaces: { coordinateSpace: 'motor-shaft-local', rotationAboutX: k * Math.PI,
        shaftAxis: [1, 0, 0], radialAxis: [0, sign, 0],
        insertionDirection: [0, -sign, 0], insertionEntry: k ? '-Y outer end' : '+Y outer end',
        innerEndY: sign * 5.35, stopInnerFaceY: sign * 13.95, outerEndY: sign * 14.25,
        outerStop: { axialX: [45.9, 46.4], radialY: [13.95, 14.25].map(v => sign * v),
          z: [-2.9, 2.9], joinsSideWallsOverFiniteFaces: true },
        hostRail: { axialX: [45.3, 45.8], absZ: [2.15, 2.55],
          radialY: [5, 13.9].map(v => sign * v) },
        lipFacingX: 45.25, sideWallInnerAbsZ: 2.65,
        nominalSlideClearance: { lipToRailX: 0.05, sideWallToRailZ: 0.10,
          outerStopToHostY: 0.05 },
        hostOuterDatumY: sign * 13.9,
        envelope: { min: geometry.boundingBox.min.toArray(), max: geometry.boundingBox.max.toArray() },
        status: 'SLIDE_GEOMETRY_ONLY', antiWithdrawalLatch: false, housingAttachment: false,
        missing: ['anti-withdrawal latch', 'housing attachment'] },
      explode: [0, sign * 12, 0] });
  }
  base.dispose();
  return { components, interfaces: { units: 'mm', coordinateSpace: 'motor-shaft-local',
    authority: 'AUTHOR_DESIGN', componentCount: 2, shaftAxis: [1, 0, 0],
    positiveSideRegions: regions, nominalVolumePerCap: nominalVolume,
    coordinatePlanes: planes, occupiedCells: cells.length, boundaryQuadsPerCap: boundaryQuads,
    status: 'SLIDE_GEOMETRY_ONLY', antiWithdrawalLatch: false, housingAttachment: false,
    missing: ['anti-withdrawal latch', 'housing attachment'] } };
}

// GT01 author geometry, millimetres. Individual physical pieces, not a finished drive.
export function buildGT01WindowMotor(T){
 const root=new T.Group(),parts=[],TAU=Math.PI*2;root.name='D05 馬達內部逐件施工';
 const M={steel:new T.MeshStandardMaterial({color:0xaeb8bb,metalness:.94,roughness:.28}),ferrite:new T.MeshStandardMaterial({color:0x414345,roughness:.79}),lamination:new T.MeshStandardMaterial({color:0x667075,metalness:.78,roughness:.44}),bronze:new T.MeshStandardMaterial({color:0xab8956,metalness:.84,roughness:.38})};
 const V=(...a)=>new T.Vector3(...a),components=[];
 function radial(rows,n=192){const p=[],ii=[];for(const [x,rv] of rows)for(let k=0;k<=n;k++){const a=k*TAU/n,r=typeof rv==='function'?rv(a):rv;p.push(x,r*Math.cos(a),r*Math.sin(a));}for(let j=0;j<rows.length-1;j++)for(let k=0;k<n;k++){const a=j*(n+1)+k,b=a+1,c=b+n+1,d=a+n+1;ii.push(a,b,c,a,c,d);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ii);g.computeVertexNormals();return smooth(g);}
 function extrude(sh,x,len){const g=new T.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,curveSegments:48}),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i),d=p.getZ(i);p.setXYZ(i,x+d,u,v);}g.clearGroups();g.computeVertexNormals();return smooth(g);}
 function circle(r){const p=new T.Path();p.absarc(0,0,r,0,TAU,true);return p;}
 function add(ref,name,surfaces,material,interfaces,explode=[0,0,0],instance=1){const g=new T.Group();g.name=name;g.position.set(0,35.5,29);g.userData={id:ref+'-'+instance,referencePart:ref,referenceAncestors:['D00','D05','D05-P14'],parentId:'D05-P14',reference:ref+(['D05-P14a','D05-P14b'].includes(ref)?'-r3.png':'-r2.png'),system:'doors',status:'WORK_IN_PROGRESS',truth:'AUTHOR_DESIGN',explode,interfaces:{...interfaces,referenceFrontAxis:[-1,0,0],referenceUpAxis:[0,0,1]},physicalInstance:instance};for(const [label,geometry,surfaceMaterial] of surfaces){const m=new T.Mesh(geometry,M[surfaceMaterial||material]);m.name=label;m.castShadow=m.receiveShadow=true;g.add(m);}root.add(g);parts.push(g);components.push({ref,instance,name,interfaces});return g;}
 // Cup rear seat is inward. No outward boss, no large opening through the rear wall.
 const flange=new T.Shape();flange.absarc(0,0,18,0,Math.PI/3,false);flange.quadraticCurveTo(5.8,16.7,5.8,22);flange.absarc(0,22,5.8,0,Math.PI,false);flange.quadraticCurveTo(-5.8,16.7,-9,18*Math.sin(Math.PI/3));flange.absarc(0,0,18,2*Math.PI/3,4*Math.PI/3,false);flange.quadraticCurveTo(-5.8,-16.7,-5.8,-22);flange.absarc(0,-22,5.8,Math.PI,TAU,false);flange.quadraticCurveTo(5.8,-16.7,9,-18*Math.sin(Math.PI/3));flange.absarc(0,0,18,5*Math.PI/3,TAU,false);flange.closePath();flange.holes.push(circle(15.8));for(const z of [-22,22]){const h=new T.Path();h.absarc(0,z,2.2,0,TAU,true);flange.holes.push(h);}
 const cupProfile=[[48,15.8],[48,17],[105.8,17],[106.6,16.88],[107.3,16.4],[107.8,15.7],[108,14.8],[108,6],[102,6],[102,8.5],[106.8,8.5],[106.8,14.8],[106.6,15.25],[106.3,15.6],[105.8,15.8],[48,15.8]];
 // Reverse the closed section to keep exterior winding outward for increasing-angle rings.
 add('D05-P14a','拉深鋼杯殼',[['連續杯壁、後壁與內伸軸承座',radial(cupProfile)],['一體法蘭與兩個貫通固定耳',extrude(flange,46,2)]],'steel',{length:62,OD:34,ID:31.6,rearWall:1.2,rearBearingBore:12,rearBearingX:[102,108],earHole:4.4,earPitch:44,bodyX:[46,108]},[75,0,0]);
 // A magnet is one continuous annular sector with chamfered axial edges.
 function magnet(){const sh=new T.Shape(),a=Math.PI/6+.014,b=5*Math.PI/6-.014;sh.absarc(0,0,15.4,a,b,false);sh.lineTo(12*Math.cos(b),12*Math.sin(b));sh.absarc(0,0,12,b,a,true);sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:33.6,bevelEnabled:true,bevelThickness:.2,bevelSize:.2,bevelSegments:1,steps:1,curveSegments:64}),p=g.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i),d=p.getZ(i);p.setXYZ(i,58.2+d,u,v);}g.clearGroups();g.computeVertexNormals();return smooth(g);}
 function smooth(g){const src=g.index?g.toNonIndexed():g;src.computeVertexNormals();const p=src.attributes.position,n=src.attributes.normal,old=n.array.slice(),buckets=new Map();for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}for(const ids of buckets.values())for(const i of ids){const a=V().fromArray(old,i*3),sum=V();for(const j of ids){const b=V().fromArray(old,j*3);if(a.dot(b)>.9)sum.add(b);}sum.normalize();n.setXYZ(i,sum.x,sum.y,sum.z);}return src;}
 for(let k=0;k<2;k++){const g=add('D05-P14b','永磁弧片 '+(k+1),[['單一弧形磁片',magnet()]],'ferrite',{outerRadius:15.6,innerRadius:11.8,axialX:[58,92],sweepDegrees:120,retention:'adhesive layer pending',radialAirGapToRotor:.8},[0,0,k?-28:28],k+1);if(k)g.rotation.x=Math.PI;}
 // One steel shaft: the worm seat has a shallow axial D-flat; fit serrations run axially.
 const plain=3,flat=a=>Math.sin(a)>0?Math.min(3,2.7/Math.sin(a)):3,knurl=a=>2.97+.03*(.5+.5*Math.cos(96*a));
 const shaftRows=[[-30,0],[-30,2.7],[-29.7,3],[-19,3],[-19,flat],[13,flat],[13,3],[58,3],[58,knurl],[86,knurl],[86,3],[107.7,3],[108,2.7],[108,0],[-30,0]];
 add('D05-P14c','電樞鋼軸',[['連續軸身、D 平面及軸向細紋',radial(shaftRows,384)]],'steel',{length:138,diameter:6,wormSeatX:[-19,13],flatDistanceFromAxis:2.7,laminationX:[58,86],rearBearingX:[102,108],frontBearingX:[-30,-23],sourceCoordinateOffset:30},[-45,0,0]);
 // Each lamination is a separately selectable sheet, not one solid cylinder with painted lines.
 const lam=new T.Shape(),period=TAU/12;for(let k=0;k<12;k++){const a=k*period;if(k===0)lam.moveTo(11*Math.cos(a-.23),11*Math.sin(a-.23));lam.absarc(0,0,11,a-.23,a+.23,false);for(const [r,t] of [[10.3,a+.23],[10.3,a+.17],[5.7,a+.17]])lam.lineTo(r*Math.cos(t),r*Math.sin(t));lam.absarc(0,0,5.7,a+.17,a+period-.17,false);for(const [r,t] of [[10.3,a+period-.17],[10.3,a+period-.23],[11,a+period-.23]])lam.lineTo(r*Math.cos(t),r*Math.sin(t));}lam.closePath();lam.holes.push(circle(3));
 const lamGeo=extrude(lam,0,.49);for(let k=0;k<56;k++){const g=add('D05-P14d','電樞疊片 '+String(k+1).padStart(2,'0'),[['十二齒槽與貫通軸孔',lamGeo]],'lamination',{sheetThickness:.49,pitch:.5,OD:22,bore:6,slotCount:12,stackIndex:k+1,axialX:[58+k*.5,58+k*.5+.49]},[k*.65,0,0],k+1);g.position.x=58+k*.5;g.userData.reference='D05-P14d-r2.png';}
 // Sintered rear bearing is distinct from the formed cup seat.
 const bearingRows=[[102,3.03],[102,5.85],[102.15,6],[107.85,6],[108,5.85],[108,3.03],[102,3.03]];
 const bearing=add('D05-P14q','後端含油軸套',[['貫通軸孔與端面倒角',radial(bearingRows)]],'bronze',{bore:6.06,OD:12,length:6,axialX:[102,108],radialRunningClearance:.03},[90,0,0]);bearing.userData.reference='D05-P14q-r1.png';
 M.copper=new T.MeshStandardMaterial({color:0xc17b48,metalness:.94,roughness:.31});M.insulator=new T.MeshStandardMaterial({color:0x40281b,roughness:.67});M.slotInsulator=new T.MeshStandardMaterial({color:0xc7a35e,roughness:.83});
 M.carbon=new T.MeshStandardMaterial({color:0x303135,roughness:.82});M.springSteel=new T.MeshStandardMaterial({color:0x9da7ad,metalness:.95,roughness:.27});M.phenolic=new T.MeshStandardMaterial({color:0x493226,roughness:.55});
 const commutator=makeGT01Commutator(T),liners=makeGT01MotorWinding(T);
 for(const c of [...commutator.components,...liners.components,...makeGT01MotorBrushes(T).components,...makeGT01BrushCarrier(T).components,...makeGT01BrushRetainers(T).components]){const p=add(c.ref,c.name,c.surfaces,c.material,c.interfaces,c.explode,c.instance);p.userData.reference=c.ref+(c.ref==='D05-P14i-a'?'-model-r2.png':'-model-r1.png');if(c.ref.startsWith('D05-P14i-')){p.userData.referenceAncestors.push('D05-P14i');p.userData.parentId='D05-P14i';}if(c.ref.startsWith('D05-P14f-')){p.userData.referenceAncestors.push('D05-P14f');p.userData.parentId='D05-P14f';}}
 root.userData={revision:'D05-MOTOR-CORE-R6',source:'AUTHOR_DESIGN',complete:false,originInRegulator:[470,-28,-122],shaftAxis:[1,0,0],shaftCentre:[0,35.5,29],components,terminals:commutator.terminals,windingCandidateExcluded:true,missing:['windings and terminal leads','retainer withdrawal latches and carrier case retention','brush pigtails and terminals','worm and reduction wheel','gear case and cover','output coupling','fasteners','magnet adhesive','front support and thrust retention']};return {root,parts,materials:M};
}

export function attachGT01WindowMotors(T,regulator){
 const hosts=regulator.root.children.filter(p=>String(p.userData.id||'').startsWith('D05-HOST-'));
 for(const host of hosts){const motor=buildGT01WindowMotor(T),side=host.userData.id.endsWith('L')?'L':'R';motor.root.position.set(470,-28,-122);host.add(motor.root);for(const p of motor.parts){p.userData.id='D05-'+side+'-'+p.userData.id;p.name=(side==='L'?'左':'右')+'車門 '+p.name;p.userData.assembly={hostId:host.userData.id,axis:[1,0,0],group:'motor'};regulator.parts.push(p);}}
}

/** GT01 hood: one exterior field drives skin, hem, inner sheet and bond interfaces.
 * Author reconstruction in mm; not a strength, forming or vehicle-safety certification.
 */
export function buildGT01Hood(T,materials,{surface}){
 const root=new T.Group(),parts=[];root.name='GT01 前蓋內外板';
 const definition={revision:'HOOD-R4',units:'mm',authority:'SOURCE_BOUND_AUTHOR_DESIGN',reference:'references/C01-C02-hood-r1.png',assemblyQualified:false,
  envelope:{x:[-2040,-650],designHalfWidth:678.5,surfaceU:.765},skinThickness:1,innerThickness:1.2,innerInset:18,webDepth:24,
  hem:{outerRadius:1.8,innerRadius:.8,returnWidth:24,adhesiveGap:.2},masticGap:3,
  holes:[{x0:-1880,x1:-1420,y0:-550,y1:-70,r:75},{x0:-1880,x1:-1420,y0:70,y1:550,r:75},{x0:-1310,x1:-810,y0:-550,y1:-70,r:75},{x0:-1310,x1:-810,y0:70,y1:550,r:75}],
  islands:[[-1730,0],[-1050,0],[-1365,-330],[-1365,330]],
  mounting:[{id:'C02-P02-L',center:[-736,550],holes:[[-758,550],[-714,550]]},{id:'C02-P02-R',center:[-736,-550],holes:[[-758,-550],[-714,-550]]},{id:'C02-P03',center:[-1955,0],holes:[[-1955,-30],[-1955,30]]}],
  unverified:['鉸鏈與車身的承載及完整連接件','鎖扣機構、製造公差、板材成形回彈與強度','整車碰撞與所有中間掀蓋姿態']};
 root.userData={id:'GT-HOOD-ASSEMBLY',system:'hood',definition,status:'WORK_IN_PROGRESS'};
 const innerMat=new T.MeshStandardMaterial({color:0x788784,metalness:.72,roughness:.38,side:T.DoubleSide}),bondMat=new T.MeshStandardMaterial({color:0x393d38,roughness:.91}),masticMat=new T.MeshStandardMaterial({color:0x434840,roughness:.94});
 const p2=(x,y)=>new T.Vector2(x,y),P=(x,y,d=0)=>{const u=y/678.5*.765,p=surface(x,u),dx=surface(x+.05,u).sub(surface(x-.05,u)),dy=surface(x,u+.0001).sub(surface(x,u-.0001)),n=dx.cross(dy).normalize();if(n.z<0)n.negate();return p.addScaledVector(n,-d);};
 const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
 function rect(x0,y0,x1,y1,r,hole=false){const p=hole?new T.Path():new T.Shape();p.moveTo(x0+r,y0);p.lineTo(x1-r,y0);p.quadraticCurveTo(x1,y0,x1,y0+r);p.lineTo(x1,y1-r);p.quadraticCurveTo(x1,y1,x1-r,y1);p.lineTo(x0+r,y1);p.quadraticCurveTo(x0,y1,x0,y1-r);p.lineTo(x0,y0+r);p.quadraticCurveTo(x0,y0,x0+r,y0);p.closePath();return p;}
 function circle(x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);return p;}
 function sdRoundRect(x,y,h){const qx=Math.abs(x-(h.x0+h.x1)/2)-(h.x1-h.x0)/2+h.r,qy=Math.abs(y-(h.y0+h.y1)/2)-(h.y1-h.y0)/2+h.r;return Math.hypot(Math.max(0,qx),Math.max(0,qy))+Math.min(0,Math.max(qx,qy))-h.r;}
 function innerDepth(x,y){const edge=Math.min(x+2022,-668-x,y+660.5,660.5-y);let depth=1.2+(definition.webDepth-1.2)*smooth((edge-17)/40);let holeDistance=Infinity;for(const h of definition.holes)holeDistance=Math.min(holeDistance,Math.max(0,sdRoundRect(x,y,h)));depth-=5.5*Math.exp(-(((holeDistance-17)/11)**2))*smooth((edge-35)/20);
  for(const [a,b]of definition.islands){const k=(1-smooth((Math.hypot(x-a,y-b)-38)/24));depth=depth*(1-k)+4*k;}return depth;}
 // Conforming longest-edge subdivision retains actual holes and a shared curved surface.
 function improvePlanarTriangles(ps,tris,passes=4){
  const area=(a,b,c)=>(ps[b].x-ps[a].x)*(ps[c].y-ps[a].y)-(ps[b].y-ps[a].y)*(ps[c].x-ps[a].x);
  const score=(a,b,c)=>area(a,b,c)/(ps[a].distanceToSquared(ps[b])+ps[b].distanceToSquared(ps[c])+ps[c].distanceToSquared(ps[a]));
  for(let pass=0;pass<passes;pass++){const edges=new Map(),used=new Set();let changed=0;
   for(let i=0;i<tris.length;i++)for(let k=0;k<3;k++){const a=tris[i][k],b=tris[i][(k+1)%3],c=tris[i][(k+2)%3],key=a<b?a+','+b:b+','+a;
    if(!edges.has(key)){edges.set(key,{i,a,b,c});continue;}const e=edges.get(key),d=c;
    if(used.has(i)||used.has(e.i)||area(e.c,d,e.b)<=1e-9||area(d,e.c,e.a)<=1e-9)continue;
    const before=Math.min(score(e.a,e.b,e.c),score(e.b,e.a,d)),after=Math.min(score(e.c,d,e.b),score(d,e.c,e.a));
    if(after>before*1.01){tris[e.i]=[e.c,d,e.b];tris[i]=[d,e.c,e.a];used.add(i);used.add(e.i);changed++;}
   }if(!changed)break;
  }return tris;
 }
 function triangulate(shape,detail=false){const ex=shape.extractPoints(10),outer=ex.shape,holes=ex.holes;const clean=a=>{if(a.length>1&&a[0].distanceToSquared(a.at(-1))<1e-12)a.pop();return a;};clean(outer);holes.forEach(clean);const ps=[...outer,...holes.flat()],faces=T.ShapeUtils.triangulateShape(outer,holes).map(t=>{const[a,b,c]=t;if((ps[b].x-ps[a].x)*(ps[c].y-ps[a].y)-(ps[b].y-ps[a].y)*(ps[c].x-ps[a].x)<0)return[a,c,b];return t;});let tris=faces;
  // Earcut may leave a collinear hole-bridge vertex on a neighbour's edge.
  // Split that edge before subdivision, so it cannot become a false side wall.
  for(let pass=0;pass<8;pass++){let changed=false;const next=[];for(const t of tris){let split=false;for(let k=0;k<3&&!split;k++){const a=t[k],b=t[(k+1)%3],c=t[(k+2)%3],dx=ps[b].x-ps[a].x,dy=ps[b].y-ps[a].y,L=dx*dx+dy*dy;for(let j=0;j<ps.length;j++){if(t.includes(j))continue;const ex=ps[j].x-ps[a].x,ey=ps[j].y-ps[a].y,dot=ex*dx+ey*dy;if(dot>1e-7&&dot<L-1e-7&&Math.abs(ex*dy-ey*dx)<1e-7){next.push([a,j,c],[j,b,c]);split=changed=true;break;}}}if(!split)next.push(t);}tris=next;if(!changed)break;}
  if(detail)tris=improvePlanarTriangles(ps,tris,12);for(let iter=0;iter<10;iter++){if(detail)tris=improvePlanarTriangles(ps,tris,4);const cut=new Map(),key=(a,b)=>a<b?a+','+b:b+','+a;for(const t of tris)for(let k=0;k<3;k++){const a=t[k],b=t[(k+1)%3],s=key(a,b);const mid=ps[a].clone().add(ps[b]).multiplyScalar(.5),nearContact=definition.islands.some(([x,y])=>Math.hypot(mid.x-x,mid.y-y)<90),holeEdge=Math.min(...definition.holes.map(h=>Math.abs(sdRoundRect(mid.x,mid.y,h)))),perimeter=Math.min(mid.x+2022,-668-mid.x,mid.y+660.5,660.5-mid.y),fine=detail&&(holeEdge<44||(perimeter>12&&perimeter<66)||nearContact),maxEdge=fine?4:nearContact?12:30;if(ps[a].distanceToSquared(ps[b])>maxEdge**2&&!cut.has(s)){cut.set(s,ps.length);ps.push(ps[a].clone().add(ps[b]).multiplyScalar(.5));}}if(!cut.size)break;const out=[];for(const[a,b,c]of tris){const ab=cut.get(key(a,b)),bc=cut.get(key(b,c)),ca=cut.get(key(c,a)),mask=(ab!==undefined?1:0)|(bc!==undefined?2:0)|(ca!==undefined?4:0);const cases={0:[[a,b,c]],1:[[a,ab,c],[ab,b,c]],2:[[b,bc,a],[bc,c,a]],4:[[c,ca,b],[ca,a,b]],3:[[b,bc,ab],[a,ab,c],[ab,bc,c]],6:[[c,ca,bc],[b,bc,a],[bc,ca,a]],5:[[a,ab,ca],[c,ca,b],[ca,ab,b]],7:[[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]]};out.push(...cases[mask]);}tris=out;}
  return{ps,tris};}
 function sheet(shape,depth,thickness,{hem=false}={}){const{ps,tris}=triangulate(shape,depth!==null&&!hem),pos=[],uv=[],ind=[],N=ps.length;for(let side=0;side<2;side++)for(const v of ps){pos.push(...P(v.x,v.y,depth(v.x,v.y)+side*thickness).toArray());uv.push((v.x+2040)/350,v.y/350);}const edges=new Map(),key=(a,b)=>a<b?a+','+b:b+','+a;for(const[a,b,c]of tris){ind.push(a,b,c,a+N,c+N,b+N);for(const[i,j]of[[a,b],[b,c],[c,a]]){const k=key(i,j);if(edges.has(k))edges.delete(k);else edges.set(k,[i,j]);}}
  if(!hem){for(const[a,b]of edges.values())ind.push(a,a+N,b,a+N,b+N,b);}
  else{const prev=new Map(),next=new Map();for(const[a,b]of edges.values()){next.set(a,b);prev.set(b,a);}const loops=new Map();for(const a of next.keys()){const q=ps[a],t=ps[next.get(a)].clone().sub(ps[prev.get(a)]).normalize(),inside=p2(-t.y,t.x),cross=[];for(let k=0;k<=12;k++){const th=Math.PI*k/12;cross.push([-1.8*Math.sin(th),1.8-1.8*Math.cos(th)]);}cross.push([24,3.6]);for(let k=1;k<=6;k++){const th=Math.PI*k/6;cross.push([24+.5*Math.sin(th),3.1+.5*Math.cos(th)]);}cross.push([0,2.6]);for(let k=1;k<=12;k++){const th=Math.PI*(1-k/12);cross.push([-.8*Math.sin(th),1.8-.8*Math.cos(th)]);}const ids=cross.map(([offset,d],i)=>{if(i===0)return a;if(i===cross.length-1)return a+N;const ix=pos.length/3;pos.push(...P(q.x+inside.x*offset,q.y+inside.y*offset,d).toArray());uv.push((q.x+2040)/350,q.y/350);return ix;});loops.set(a,ids);}for(const[a,b]of edges.values()){const aa=loops.get(a),bb=loops.get(b);for(let k=0;k<aa.length-1;k++)ind.push(aa[k],aa[k+1],bb[k],aa[k+1],bb[k+1],bb[k]);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();
  // Differentiate the shared curved sheet field. Thin side walls must not pull
  // cap normals into arbitrary long skinny triangulation directions.
  const normals=g.attributes.normal,eps=.08;
  for(let i=0;i<N;i++){const{x,y}=ps[i];for(let layer=0;layer<2;layer++){const d=layer*thickness,dx=P(x+eps,y,depth(x+eps,y)+d).sub(P(x-eps,y,depth(x-eps,y)+d)),dy=P(x,y+eps,depth(x,y+eps)+d).sub(P(x,y-eps,depth(x,y-eps)+d)),n=dx.cross(dy).normalize().multiplyScalar(layer?-1:1);normals.setXYZ(i+layer*N,n.x,n.y,n.z);}}
  g.computeBoundingBox();g.userData={nominalThickness:thickness,sourcePlanarVertices:N,boundarySegments:edges.size,shapeHoles:shape.holes.length,hem};return g;}
 function add(id,name,g,mat,ref,purpose,extra={}){const o=new T.Mesh(g,mat);o.name=name;o.castShadow=o.receiveShadow=true;o.userData={id,name,referencePart:ref,system:'hood',movingAssembly:'C01-C02',reference:definition.reference,truth:'AUTHOR_DESIGN',status:'WORK_IN_PROGRESS',purpose,...extra};root.add(o);parts.push(o);return o;}
 const outer=rect(-2040,-678.5,-650,678.5,10);add('GT-HOOD-C01','引擎蓋',sheet(outer,()=>0,1,{hem:true}),materials.paint,'C01','連續外皮與一體反折包邊；包住內板周緣。',{subPart:'C01-P01',explode:[0,0,150],physicalBoundary:'ONE_FORMED_SHEET_WITH_INTEGRAL_HEM'});
 const inner=rect(-2022,-660.5,-668,660.5,26);for(const h of definition.holes)inner.holes.push(rect(h.x0,h.y0,h.x1,h.y1,h.r,true));for(const landing of definition.mounting)for(const[x,y]of landing.holes)inner.holes.push(circle(x,y,4));
 add('GT-HOOD-C02','前蓋四孔沖壓內板',sheet(inner,innerDepth,1.2),innerMat,'C02','周緣連續，縱橫肋與四個貫通窗共同承接內側介面。',{subPart:'C02-P01',explode:[0,0,-120],interfaces:{lighteningOpenings:4,mountingThroughHoles:6,skinClearanceNominal:'.2 at perimeter; variable elsewhere'},physicalBoundary:'ONE_STAMPED_SHEET'});
 for(const landing of definition.mounting){const[x,y]=landing.center,isLatch=landing.id==='C02-P03',sh=rect(x-52,y-(isLatch?65:54),x+52,y+(isLatch?65:54),12);for(const[a,b]of landing.holes)sh.holes.push(circle(a,b,4));add('GT-HOOD-'+landing.id,isLatch?'前蓋鎖扣補強片':'前蓋鉸鏈補強片 '+(y>0?'左':'右'),sheet(sh,(a,b)=>innerDepth(a,b)+1.2,2),innerMat,'C02',isLatch?'將鎖扣負載分散到內板；鎖扣本體仍待施工。':'與內板共用兩個穿孔，提供鉸鏈接收區。',{subPart:landing.id,explode:[0,0,-190],physicalBoundary:'ONE_FORMED_DOUBLER',interfaces:{holes:landing.holes,holeDiameter:8,interface:'INNER_SHEET_UNDERSIDE'}});}
 const ring=rect(-2020,-658.5,-670,658.5,24);ring.holes.push(rect(-2016,-654.5,-674,654.5,20,true));add('GT-HOOD-C01-P03','前蓋周緣包邊膠層',sheet(ring,()=>1,.2),bondMat,'C01','位於外板背面與內板周緣之間的黏接材料。',{subPart:'C01-P03',partKind:'BOND_LAYER_NOT_DETACHABLE',explode:[0,0,35]});
 for(const [i,[x,y]]of definition.islands.entries()){const sh=rect(x-21,y-13,x+21,y+13,8);const{ps,tris}=triangulate(sh),pos=[],uv=[],idx=[],N=ps.length;for(let k=0;k<2;k++)for(const p of ps){pos.push(...P(p.x,p.y,k?innerDepth(p.x,p.y):1).toArray());uv.push(p.x/30,p.y/30);}const e=new Map(),key=(a,b)=>a<b?a+','+b:b+','+a;for(const[a,b,c]of tris){idx.push(a,b,c,a+N,c+N,b+N);for(const[i,j]of[[a,b],[b,c],[c,a]]){const k=key(i,j);if(e.has(k))e.delete(k);else e.set(k,[i,j]);}}for(const[a,b]of e.values())idx.push(a,a+N,b,a+N,b+N,b);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();g.userData={nominalCenterGap:3,contactVertexPairs:N};add('GT-HOOD-MASTIC-'+(i+1),'前蓋抗振膠區 '+(i+1),g,masticMat,'C01','上面貼外板背面，下面貼內板壓凸區；不懸浮。',{subPart:'C01-P04',partKind:'BOND_LAYER_NOT_DETACHABLE',contactParameters:ps.map(p=>[p.x,p.y]),explode:[0,0,60]});}
 root.userData.definition=definition;return{root,parts,definition,surfacePoint:P,innerDepth};
}

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

// GT01 authored finishes; geometry and mechanical clearance are owned by the construction modules.
export function applyGT01HingeFinishes(T, assembly) {
  const changed=[];
  for(const mesh of assembly.parts){
    const id=mesh.userData.id,sub=mesh.userData.subPart;
    if(!id.startsWith('I03-HF-')&&!['I03-P05','I03-P16','I03-P19','I03-P20'].includes(sub))continue;
    const metal=id.startsWith('I03-HF-')||['I03-P19','I03-P20'].includes(sub);
    const shim=sub==='I03-HF-F03';
    const m=new T.MeshPhysicalMaterial({color:metal?(shim?0x969792:0xadb3b7):0x272b2a,metalness:metal?1:0,roughness:metal?(shim?.40:.35):.46,clearcoat:metal?0:.16,clearcoatRoughness:.4,envMapIntensity:metal?1:.7});
    m.name=metal?'GT01 · fine satin steel':'GT01 · charcoal micrograin polymer';
    m.userData={finishReference:'references/I03-HF-material-study-r1.png',finishType:metal?'satin-steel':'micrograin-polymer',scaleUnit:'mm',qualified:false};
    // Object-space millimetres: grain moves with the actual part, without stretched or missing UVs.
    m.onBeforeCompile=s=>{
      s.vertexShader='varying vec3 vGTFinishPosition;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGTFinishPosition=position;');
      s.fragmentShader='varying vec3 vGTFinishPosition;\nfloat gtHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        vec3 fp=vGTFinishPosition;
        float footprint=max(length(dFdx(fp)),length(dFdy(fp)));
        float microFade=1.0-smoothstep(0.015,0.12,footprint);
        float grain=gtHash(floor(fp*30.0));
        float phase=fp.y*190.0+sin(fp.x*0.35)*0.3;
        float line=sin(phase)*(1.0-smoothstep(0.5,2.5,fwidth(phase)));
        roughnessFactor=clamp(roughnessFactor+microFade*(${metal?'0.012*line+0.015*(grain-.5)':'0.045*(grain-.5)'}),.18,.65);`);
    };
    m.customProgramCacheKey=()=>metal?'GT01-satin-mm-r1':'GT01-polymer-mm-r1';
    // Smooth only coincident corners whose face normals agree within 30 degrees.
    // Hole rims and socket walls keep their hard edges; no position/index changes.
    const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal;
    if(p&&n){const buckets=new Map(),original=Float32Array.from(n.array);for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}for(const indices of buckets.values())for(const i of indices){const a=new T.Vector3(original[i*3],original[i*3+1],original[i*3+2]),sum=new T.Vector3();for(const j of indices){const b=new T.Vector3(original[j*3],original[j*3+1],original[j*3+2]);if(a.dot(b)>.8660254)sum.add(b);}if(sum.lengthSq()>0){sum.normalize();n.setXYZ(i,sum.x,sum.y,sum.z);}}n.needsUpdate=true;}
    mesh.material=m;mesh.castShadow=true;mesh.receiveShadow=true;changed.push(id);
  }
  assembly.definition.finishStudy={revision:'HINGE-FINISH-R1',reference:'references/I03-HF-material-study-r1.png',changed,scope:'Authored optical appearance; no material grade or mechanical certification.'};
  return assembly;
}

export function createGT01HingeStudio(T,renderer,scene){
  for(const o of [...scene.children])if(o.isLight){scene.remove(o);if(o.target)scene.remove(o.target);}
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  scene.background=new T.Color(0xe9e7e1);const hemisphere=new T.HemisphereLight(0xf5f1e9,0xb0b6bc,1.05);hemisphere.position.set(0,0,1);scene.add(hemisphere);
  const env=new T.Scene();env.background=new T.Color(.16,.18,.2);
  const cards=[[[0,150,300],[420,95],[5.0,4.7,4.25]],[[220,-140,80],[160,340],[2.7,3.1,3.5]],[[-200,0,90],[90,280],[1.9,2.0,2.15]],[[0,-250,-80],[260,130],[.3,.32,.34]]];
  for(const [pos,size,rgb]of cards){const card=new T.Mesh(new T.PlaneGeometry(...size),new T.MeshBasicMaterial({color:new T.Color(...rgb),side:T.DoubleSide}));card.position.set(...pos);card.lookAt(0,0,0);env.add(card);}
  const pmrem=new T.PMREMGenerator(renderer),map=pmrem.fromScene(env,.045,1,1200);scene.environment=map.texture;
  env.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pmrem.dispose();
  const key=new T.DirectionalLight(0xfff3de,2.1);key.position.set(465,-105,535);key.target.position.set(430,-57,450);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:210});key.shadow.bias=-.00018;key.shadow.normalBias=.045;key.shadow.radius=2;scene.add(key,key.target);
  const fill=new T.DirectionalLight(0xdce8ff,.75);fill.position.set(350,60,500);fill.target.position.set(430,-57,452);scene.add(fill,fill.target);
  const underside=new T.DirectionalLight(0xe6edf4,1.35);underside.position.set(470,-95,365);underside.target.position.set(430,-57,452);scene.add(underside,underside.target);
  return {environment:map,dispose(){map.dispose();key.shadow.map?.dispose();}};
}

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

// GT01: shared surface controls, source-constrained authored geometry, millimetres, Z up.
export function buildVehicle(T,wheelModel){
 const root=new T.Group(),parts=[];root.name='GT01';
 const materials={
  paint:new T.MeshPhysicalMaterial({color:0x173b2e,metalness:.76,roughness:.26,clearcoat:1,clearcoatRoughness:.13,side:T.DoubleSide}),
  leather:new T.MeshPhysicalMaterial({color:0x975d33,roughness:.64,clearcoat:.14,clearcoatRoughness:.48,sheen:.3,sheenColor:0xd1ac79,sheenRoughness:.7,side:T.DoubleSide}),
  black:new T.MeshStandardMaterial({color:0x14181a,roughness:.44,metalness:.18,side:T.DoubleSide}),
  rubber:new T.MeshStandardMaterial({color:0x0b0e0f,roughness:.9,side:T.DoubleSide}),
  alloy:new T.MeshStandardMaterial({color:0xa9b0b3,metalness:.96,roughness:.26,side:T.DoubleSide}),
  metal:new T.MeshStandardMaterial({color:0x515d60,metalness:.85,roughness:.36,side:T.DoubleSide}),
  glass:new T.MeshPhysicalMaterial({color:0x364a43,metalness:.12,roughness:.09,transparent:true,opacity:.64,depthWrite:false,side:T.DoubleSide}),
  lens:new T.MeshPhysicalMaterial({color:0xf0f4ff,metalness:.1,roughness:.08,transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide}),
  redglass:new T.MeshPhysicalMaterial({color:0x650606,roughness:.18,metalness:.35,clearcoat:1}),
  redled:new T.MeshStandardMaterial({color:0xea1520,emissive:0xf11414,emissiveIntensity:2,roughness:.3}),
  led:new T.MeshStandardMaterial({color:0xe6f4ff,emissive:0xc7e4ff,emissiveIntensity:2,roughness:.2}),
  mirror:new T.MeshStandardMaterial({color:0xc6d1d6,metalness:1,roughness:.05}),
  stitch:new T.MeshStandardMaterial({color:0xbfa179,roughness:.9}),
  carpet:new T.MeshStandardMaterial({color:0x222423,roughness:1}),
  aluminum:new T.MeshStandardMaterial({color:0x6b777b,metalness:.82,roughness:.55})
 };
 const texSize=256,grain=new Uint8Array(texSize*texSize*4);let seed=3907;for(let i=0;i<texSize*texSize;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=98+(seed>>>26);grain.set([v,v,v,255],i*4);}const tex=new T.DataTexture(grain,texSize,texSize,T.RGBAFormat);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(16,16);tex.minFilter=T.LinearMipmapLinearFilter;tex.magFilter=T.LinearFilter;tex.generateMipmaps=true;tex.anisotropy=4;tex.needsUpdate=true;materials.leather.bumpMap=tex;materials.leather.bumpScale=.6;materials.carpet.bumpMap=tex;materials.carpet.bumpScale=.65;
 const V=(x,y,z)=>new T.Vector3(x+(x<-1940?135*((-1940-x)/271)**2*Math.min(1.2,Math.abs(y)/850)**3:x>1940?-130*((x-1940)/271)**2*Math.min(1.2,Math.abs(y)/850)**3:0),y,z),clamp=T.MathUtils.clamp,lerp=T.MathUtils.lerp;
const bodyRows=[[-2210,752,520,525,192],[-2130,815,569,574,171],[-1940,885,644,665,156],[-1700,925,706,742,153],[-1325,938,753,790,150],[-970,907,773,789,148],[-660,887,790,790,148],[-200,891,788,792,148],[350,902,791,795,150],[860,925,809,816,154],[1325,940,827,834,157],[1680,918,793,805,162],[1980,872,746,753,172],[2150,801,691,700,188],[2210,758,660,665,204]];
// Shape-preserving Hermite interpolation avoids oscillation between stations.
function rowAt(rows,x){let i=0;while(i<rows.length-2&&x>rows[i+1][0])i++;const a=rows[i],b=rows[i+1],dx=b[0]-a[0],t=clamp((x-a[0])/dx,0,1);return a.map((v,j)=>{if(!j)return x;const sec=(b[j]-a[j])/dx;let m0=i?(b[j]-rows[i-1][j])/(b[0]-rows[i-1][0]):sec,m1=i+2<rows.length?(rows[i+2][j]-a[j])/(rows[i+2][0]-a[0]):sec;if(sec===0)m0=m1=0;else{m0=Math.sign(m0)===Math.sign(sec)?Math.sign(sec)*Math.min(Math.abs(m0),3*Math.abs(sec)):0;m1=Math.sign(m1)===Math.sign(sec)?Math.sign(sec)*Math.min(Math.abs(m1),3*Math.abs(sec)):0;}return (2*t**3-3*t*t+1)*a[j]+(t**3-2*t*t+t)*m0*dx+(-2*t**3+3*t*t)*b[j]+(t**3-t*t)*m1*dx;});}
function top(x,u){const [,w,c,sh]=rowAt(bodyRows,x),q=Math.abs(u);const bulge=(Math.exp(-(((x+1325)/580)**2))+Math.exp(-(((x-1325)/510)**2)))*13*Math.exp(-(((q-.82)/.16)**2));return V(x,w*u,c+(sh-c)*q**2.5+bulge-52*Math.max(0,(q-.76)/.24)**2);}
function arch(x){let low=150;for(const center of [-1325,1325]){const dx=x-center;if(Math.abs(dx)<342)low=Math.max(low,305+Math.sqrt(342**2-dx**2));}return low;}
function side(x,t,s){const [,w,,sh,b]=rowAt(bodyRows,x),edge=top(x,s).z,low=Math.max(b,arch(x)),z=lerp(edge,low,t),a=clamp((edge-z)/(edge-b),0,1),flare=55*(Math.exp(-(((x+1325)/430)**2))+Math.exp(-(((x-1325)/430)**2)));const y=w*(1-.12*a)-25*Math.sin(Math.PI*a)+15*Math.sin(2*Math.PI*a)+flare*Math.sin(Math.PI*a);return V(x,s*y,z);}
function param(fn,nu=60,nv=16,skip=null){const pos=[],idx=[],norm=[];for(let i=0;i<=nu;i++)for(let j=0;j<=nv;j++){const u=i/nu,v=j/nv,p=fn(u,v);pos.push(p.x,p.y,p.z);const du=fn(clamp(u+.0001,0,1),v).sub(fn(clamp(u-.0001,0,1),v)),dv=fn(u,clamp(v+.0001,0,1)).sub(fn(u,clamp(v-.0001,0,1)));let n=du.cross(dv).normalize();norm.push(n.x,n.y,n.z);}for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){if(skip?.((i+.5)/nu,(j+.5)/nv))continue;let a=i*(nv+1)+j,b=a+nv+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(norm,3));g.setIndex(idx);g.userData.surface=true;return g;}
function add(name,g,mat='paint',system='body',p=[0,0,0],rot=[0,0,0],key){
 if(g.userData.surface){const pp=g.attributes.position,nn=g.attributes.normal;let direction=0;for(let i=0;i<pp.count;i+=Math.max(1,Math.floor(pp.count/40)))direction+=nn.getX(i)*pp.getX(i)+nn.getY(i)*pp.getY(i)+nn.getZ(i)*(pp.getZ(i)-430);if(direction<0){for(let i=0;i<nn.count;i++)nn.setXYZ(i,-nn.getX(i),-nn.getY(i),-nn.getZ(i));const ii=g.index;for(let i=0;i<ii.count;i+=3){const b=ii.getX(i+1);ii.setX(i+1,ii.getX(i+2));ii.setX(i+2,b);}}}
 const m=new T.Mesh(g,materials[mat]||materials.black);m.name=name;m.position.fromArray(p);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;
 m.userData={id:'GT-'+String(parts.length+1).padStart(4,'0'),name,system,reference:'GT01-'+(system==='interior'?'details':'body')+'.png',status:'WORK_IN_PROGRESS'};root.add(m);parts.push(m);return m;
}
function ribbon(name,edge,dir,width,mat='paint',system='body',n=60){add(name,param((u,v)=>edge(u).addScaledVector(dir(u),width*(v-.5)),n,5),mat,system);}
function tube(name,points,r,mat='rubber',sys='seals'){const curve=new T.CatmullRomCurve3(points,false,'centripetal');add(name,new T.TubeGeometry(curve,Math.max(20,points.length*3),r,8,false),mat,sys);}
function sample(fn,n=40){return Array.from({length:n+1},(_,i)=>fn(i/n));}
// Hood, top surfaces and side panels meet along source-bound shared boundaries.
add('引擎蓋',param((a,b)=>top(lerp(-2040,-650,a),lerp(-.765,.765,b)),90,42),'paint','hood');
for(const s of [-1,1]){
 add((s>0?'左':'右')+'前葉子板上面',param((a,b)=>top(lerp(-2043,-647,a),s*lerp(.771,1,b)),90,18));
 add('窗下腰線上板',param((a,b)=>top(lerp(-644,1420,a),s*lerp(.855,1,b)),90,12));
 add('前葉子板側面',param((a,b)=>side(lerp(-2037,-702,a),b,s),115,30));
 add((s>0?'左':'右')+'車門外板',param((a,b)=>side(lerp(-696,856,a),lerp(.005,.902,b),s),95,26),'paint','doors');
 add('側裙',param((a,b)=>side(lerp(-698,857,a),lerp(.91,1,b),s),60,5),'paint','body');
 add('後葉子板側面',param((a,b)=>side(lerp(862,2060,a),b,s),105,30));
 add('前保桿側面',param((a,b)=>side(lerp(-2210,-2043,a),b,s),25,26),'paint','body');
 add('後保桿側面',param((a,b)=>side(lerp(2066,2210,a),b,s),20,26),'paint','body');
}
add('前保桿上面',param((a,b)=>top(lerp(-2210,-2046,a),lerp(-1,1,b)),25,64));
add('後行李廂上蓋',param((a,b)=>top(lerp(1424,2060,a),lerp(-.77,.77,b)),50,40),'paint','hood');
for(const s of [-1,1])add('後葉子板上面',param((a,b)=>top(lerp(1421,2063,a),s*lerp(.776,1,b)),55,20));
add('車尾上緣',param((a,b)=>top(lerp(2066,2210,a),lerp(-1,1,b)),20,60));
// Front fascia aperture in its own curved patch; lip follows the same contour.
function front(y,z){return V(-2211+Math.pow(Math.abs(y)/752,4)*3,y,z);}
const grillePts=[[-655,214],[-638,263],[-499,380],[-420,407],[420,407],[499,380],[638,263],[655,214]];
function grilleTop(y){return Math.abs(y)<420?407:407-((Math.abs(y)-420)/235)**1.8*193;}
add('前保桿中央面',param((a,b)=>{const q=lerp(-1,1,a),t=b;const w=752*(1-.042*t);return front(w*q,lerp(top(-2210,q).z,192,t));},120,55,(a,b)=>{let y=lerp(-1,1,a)*752*(1-.042*b),z=lerp(top(-2210,lerp(-1,1,a)).z,192,b);return Math.abs(y)<655&&z>214&&z<grilleTop(y);}));
const opening=new T.Shape();opening.moveTo(-655,214);opening.bezierCurveTo(-650,273,-548,379,-420,407);opening.lineTo(420,407);opening.bezierCurveTo(548,379,650,273,655,214);opening.closePath();
let face=new T.ShapeGeometry(opening,30);face.rotateY(Math.PI/2);face.rotateX(Math.PI/2);face.translate(-2182,0,0);add('格柵深色內腔',face,'black','grille');
const gp=sample(t=>{const a=2*Math.PI*t;const y=650*Math.cos(a);return front(y,310+94*Math.sin(a)).add(V(-3,0,0));},64); // retained geometry below uses actual aperture boundary
const outline=opening.getPoints(90).map(p=>front(p.x,p.y).add(V(-3,0,0)));tube('格柵周界飾條',outline,5,'black','grille');
for(let j=0;j<6;j++){const z=232+j*27,w=650-225*Math.pow((z-214)/193,.9);tube('格柵水平葉片',[front(-w,z),front(0,z),front(w,z)],2.6,'black','grille');}
tube('前下導流唇',sample(u=>front(lerp(-722,722,u),192).add(V(-7,0,0)),60),7,'black','body');
function rear(y,z){return V(2211-3*Math.pow(Math.abs(y)/758,4),y,z);}
add('後保桿中央面',param((a,b)=>{const q=lerp(-1,1,a);return rear(758*q*(1-.042*b),lerp(top(2210,q).z,204,b));},90,40));
function roundedShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
function plate(name,w,h,d,r,mat,sys,p,rot=[0,0,0]){const g=new T.ExtrudeGeometry(roundedShape(w,h,r),{depth:d,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:Math.min(2,d*.2),bevelThickness:Math.min(2,d*.2),curveSegments:12});g.translate(0,0,-d/2);add(name,g,mat,sys,p,rot);}
plate('後下擴散器',1310,145,12,48,'black','body',[2218,0,293],[Math.PI/2,Math.PI/2,0]);
plate('後牌照凹座',460,96,5,12,'black','body',[2219,0,483],[Math.PI/2,Math.PI/2,0]);
for(const s of [-1,1]){
 const points=sample(t=>rear(s*lerp(290,724,t),629+14*Math.sin(Math.PI*t)).add(V(8,0,0)),30);
 tube('尾燈黑色底座',points,15,'black','lights');tube('紅色尾燈',points.map(p=>p.clone().add(V(14,0,2))),7,'redglass','lights');tube('尾燈導光條',points.map(p=>p.clone().add(V(22,0,4))),2.5,'redled','lights');
}
// Greenhouse: defined trapezoidal windscreen and fastback share their pillar edges.
const canopyRows=[[-650,766,808],[-570,775,884],[-350,783,1070],[-90,790,1220],[150,797,1270],[460,801,1258],[665,806,1216],[920,815,1109],[1180,829,948],[1420,832,823]];
function canopy(x,u){const [,w,h]=rowAt(canopyRows,x);const base=top(x,w/rowAt(bodyRows,x)[1]).z+2;return V(x,w*u,base+(h-base)*Math.pow(Math.max(0,1-Math.abs(u)**4),.54));}
function wind(t,q){return canopy(lerp(-630,-95,t),q*lerp(.982,.84,t)).add(V(0,0,2));}
function back(t,q){return canopy(lerp(670,1400,t),q*lerp(.84,.988,t)).add(V(0,0,2));}
add('前擋風玻璃',param((u,v)=>wind(u,lerp(-1,1,v)),50,70),'glass','glazing');
add('後擋風玻璃',param((u,v)=>back(u,lerp(-1,1,v)),55,70),'glass','glazing');
add('車頂面板',param((u,v)=>canopy(lerp(-89,664,u),lerp(-.843,.843,v)),60,55),'paint','roof');
for(const s of [-1,1]){
 const u=t=>lerp(.854,.987,t),xl=t=>lerp(-54,-552,t),xr=t=>lerp(626,1250,t),split=t=>lerp(490,545,t);
 add((s>0?'左':'右')+'門玻璃',param((a,b)=>canopy(lerp(xl(b),split(b),a),s*u(b)).add(V(0,s*2,0)),55,35),'glass','glazing');
 add('後三角窗',param((a,b)=>canopy(lerp(split(b)+26,xr(b),a),s*u(b)).add(V(0,s*2,0)),45,35),'glass','glazing');
 add('窗中央立柱',param((a,b)=>canopy(split(b)+lerp(3,23,a),s*u(b)),5,30),'black','roof');
 add('A柱外板',param((a,b)=>{const x1=lerp(-95,-630,b),x2=xl(b)-5,u1=lerp(.84,.982,b),u2=u(b);return canopy(lerp(x1,x2,a),s*lerp(u1,u2,a));},12,45),'paint','roof');
 add('C柱外板',param((a,b)=>{const x1=lerp(670,1400,b),x2=xr(b)+5,u1=lerp(.84,.988,b),u2=u(b);return canopy(lerp(x1,x2,a),s*lerp(u1,u2,a));},20,45),'paint','roof');
 for(const edge of [t=>canopy(xl(t),s*u(t)),t=>canopy(xr(t),s*u(t)),t=>canopy(lerp(xl(0),xr(0),t),s*u(0)),t=>canopy(lerp(xl(1),xr(1),t),s*u(1))])tube('車窗周界密封',sample(edge),3.5,'rubber','seals');
 tube('車窗金屬上飾條',sample(t=>canopy(lerp(-71,646,t),s*.849).add(V(0,0,2))),2.8,'alloy','seals');
}
for(const fn of [wind,back]){for(const s of [-1,1])tube('玻璃側密封',sample(t=>fn(t,s)),4,'rubber','seals');for(const t of [0,1])tube('玻璃橫向密封',sample(q=>fn(t,lerp(-1,1,q))),4,'rubber','seals');}
// Lamps have a swept planform seated against the same front hood field.
for(const s of [-1,1]){
 function lamp(u,v){const y=s*lerp(420,822,u),x=lerp(-2160,-2060,u)+lerp(-27,24,v);const w=rowAt(bodyRows,x)[1];return top(x,y/w).add(V(0,0,5));}
 add('頭燈黑色燈殼',param(lamp,45,12),'black','lights');
 add('頭燈透明罩',param((u,v)=>lamp(lerp(.025,.975,u),lerp(.1,.9,v)).add(V(0,0,1.7)),45,10),'lens','lights');
 tube('頭燈日行燈',sample(u=>lamp(lerp(.03,.97,u),.76).add(V(0,0,3)),45),3.5,'led','lights');
 for(let i=0;i<3;i++)tube('頭燈投射光帶',sample(u=>lamp(.15+i*.26+u*.14,.33).add(V(0,0,4)),12),6,'led','lights');
 const hx=570,hy=rowAt(bodyRows,hx)[1]-.5;
 plate('外把手凹座',145,27,8,13,'black','doors',[hx,s*hy,701],[Math.PI/2,0,0]);
 plate('外把手',124,14,6,7,'paint','doors',[hx,s*(hy+5),702],[Math.PI/2,0,0]);
 tube('後視鏡支臂',[V(-530,s*807,799),V(-527,s*910,848),V(-504,s*958,856)],12,'black','mirrors');
 const mirror=new T.SphereGeometry(1,48,28);mirror.scale(115,67,39);add('後視鏡外殼',mirror,'paint','mirrors',[-494,s*981,875]);
 const mg=new T.CircleGeometry(1,48);mg.scale(48,27,1);add('後視鏡鏡面',mg,'mirror','mirrors',[-387,s*982,875],[0,Math.PI/2,0]);
}

 // Geometry carried by shared section rings: sculpted seat cushions and seat shells.
function loftPart(name,rows,mat,system,axis='z',offset=[0,0,0]){
 const p=[],ind=[],n=96;
 for(const [station,center,a,b,power=2] of rows)for(let k=0;k<n;k++){const t=k*Math.PI*2/n,cs=Math.cos(t),sn=Math.sin(t),u=a*Math.sign(cs)*Math.abs(cs)**(2/power),v=b*Math.sign(sn)*Math.abs(sn)**(2/power);p.push(...(axis==='z'?[center+u,v,station]:[station,u,center+v]));}
 for(let j=0;j<rows.length-1;j++)for(let k=0;k<n;k++){const a=j*n+k,b=j*n+(k+1)%n;ind.push(a,b,a+n,b,b+n,a+n);}
 for(const [row,reverse] of [[0,true],[rows.length-1,false]]){const [station,center]=rows[row],ix=p.length/3;p.push(...(axis==='z'?[center,0,station]:[station,0,center]));for(let k=0;k<n;k++){const a=row*n+k,b=row*n+(k+1)%n;ind.push(ix,...(reverse?[b,a]:[a,b]));}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ind);g.computeVertexNormals();return add(name,g,mat,system,offset);
}
function cabinTube(name,points,r,mat='stitch'){tube(name,points.map(p=>V(...p)),r,mat,'interior');}
plate('封閉底板',2570,1430,16,60,'aluminum','chassis',[160,0,247]);
plate('雙層地毯與隔音層',1780,1370,18,52,'carpet','interior',[170,0,300]);
// Closed sills and floor crossmembers; bulkheads support the actual floor.
for(const s of [-1,1]){
 loftPart('封閉式門檻樑 '+s,[[-960,257,46,53,4],[-700,267,54,57,4],[850,267,54,57,4],[1220,296,46,52,4]],'aluminum','chassis','x',[0,s*705,0]);
 for(const x of [-680,300,810])plate('地板橫樑 '+s,84,710,66,12,'aluminum','chassis',[x,s*354,256]);
}
plate('前圍板',60,1360,430,38,'aluminum','chassis',[-698,0,515]);
plate('後艙防火隔板',62,1390,410,36,'aluminum','chassis',[936,0,515]);
plate('電池上蓋',2160,1220,8,48,'aluminum','powertrain',[160,0,228]);
plate('電池底殼',2180,1240,74,50,'black','powertrain',[160,0,184]);
for(let x=-800;x<1200;x+=240)plate('電池殼橫向加強筋',22,1205,12,5,'aluminum','powertrain',[x,0,143]);

loftPart('儀表台連續包覆',[[594,-450,125,650,4],[666,-460,158,695,4],[723,-460,168,699,4],[752,-468,140,656,4],[763,-474,95,625,4]],'black','interior');
loftPart('中央鞍座',[[304,102,440,119,4],[366,102,430,115,4],[415,98,412,111,4],[456,95,373,96,4],[473,86,339,75,4]],'black','interior');
plate('中央扶手皮革',317,162,36,40,'leather','interior',[270,0,468]);
plate('中控亮黑面板',272,161,8,18,'black','interior',[-154,0,476],[0,-.12,0]);
plate('中控金屬框',276,166,4,19,'alloy','interior',[-154,0,472],[0,-.12,0]);
for(const y of [-42,42]){const knob=new T.CylinderGeometry(14,16,13,48);knob.rotateX(Math.PI/2);add('金屬旋鈕',knob,'alloy','interior',[-159,y,492]);}
plate('儀表顯示器外框',18,350,120,12,'metal','interior',[-307,350,750]);
plate('儀表顯示玻璃',8,324,96,8,'black','interior',[-294,350,750]);
plate('中控觸控顯示器',12,290,112,12,'black','interior',[-292,-42,735]);
const steering=new T.Group();root.add(steering);steering.position.set(-169,350,747);steering.rotation.y=1.24;
const rimG=new T.TorusGeometry(151,15,18,128);const rimMesh=new T.Mesh(rimG,materials.black);rimMesh.name='皮革方向盤圈';steering.add(rimMesh);
const horn=new T.Mesh(new T.CylinderGeometry(54,63,35,64),materials.black);horn.rotation.x=Math.PI/2;steering.add(horn);
for(const a of [-Math.PI/2,.13,Math.PI-.13]){const points=[new T.Vector3(46*Math.cos(a),46*Math.sin(a),0),new T.Vector3(95*Math.cos(a),95*Math.sin(a),-8),new T.Vector3(140*Math.cos(a),140*Math.sin(a),-3)],c=new T.CatmullRomCurve3(points);const m=new T.Mesh(new T.TubeGeometry(c,24,10,10,false),materials.alloy);steering.add(m);}
steering.name='方向盤總成';steering.userData={id:'GT-STEER',name:steering.name,system:'interior',reference:'GT01-details.png',status:'WORK_IN_PROGRESS'};parts.push(steering);
for(const x of [-1325,1325])for(const s of [-1,1]){
 const wheel=wheelModel.root.clone(true);wheel.name=(x<0?'前':'後')+(s>0?'左':'右')+'輪端';wheel.rotation.x=-s*Math.PI/2;wheel.position.set(x,s*800,305);root.add(wheel);
 wheel.userData={...wheel.userData,id:'WHEEL-'+x+'-'+s,name:wheel.name,system:'rolling',reference:'A06-wheel-end-r2.png',status:'WHEEL_R4_NOT_RELEASED'};parts.push(wheel);
}

const seats=buildGT01Seats(T,materials);root.add(seats.root);parts.push(...seats.parts);

const doorTrim=buildGT01DoorTrim(T,materials,(x,z)=>{const [,w,,sh,b]=rowAt(bodyRows,x),edge=top(x,1).z,low=Math.max(b,arch(x));return side(x,clamp((edge-z)/(edge-low),0,1),1).y;});root.add(doorTrim.root);parts.push(...doorTrim.parts);

const regulator=buildGT01Regulator(T,materials,(x,z)=>{const [,w,,sh,b]=rowAt(bodyRows,x),edge=top(x,1).z,low=Math.max(b,arch(x));return side(x,clamp((edge-z)/(edge-low),0,1),1).y;});attachGT01WindowMotors(T,regulator);root.add(regulator.root);parts.push(...regulator.parts);

completeGT01DoorGlass(T,parts,regulator);

 const legacyHood=parts.find(p=>p.name==='引擎蓋');
 const hoodAssembly=buildGT01Hood(T,materials,{surface:top});root.add(hoodAssembly.root);
 const hoodIndex=parts.indexOf(legacyHood);if(hoodIndex<0)throw Error('Existing hood owner missing');
 root.remove(legacyHood);legacyHood.geometry.dispose();parts.splice(hoodIndex,1,...hoodAssembly.parts);
 const legacySteering=parts.find(p=>p.userData.id==='GT-STEER');
 if(!legacySteering)throw Error('Existing steering owner missing');
 const steeringAssembly=buildGT01Steering(T,materials),tilt=20*Math.PI/180;
 steeringAssembly.root.position.set(-169,350,747);
 steeringAssembly.root.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(-Math.sin(tilt),0,Math.cos(tilt)),new T.Vector3(Math.cos(tilt),0,Math.sin(tilt))));
 steeringAssembly.root.userData.interfaces={referenceFrontAxis:[0,0,1],referenceUpAxis:[0,1,0]};
 steeringAssembly.root.userData.worldPose={center:[-169,350,747],tiltDegrees:20,driverAxis:[Math.cos(tilt),0,Math.sin(tilt)],status:'AUTHOR_POSE_PENDING_SPACE_CHECK'};
 root.add(steeringAssembly.root);root.remove(legacySteering);legacySteering.traverse(o=>o.geometry?.dispose());
 parts.splice(parts.indexOf(legacySteering),1,...steeringAssembly.parts);
 const instrumentAssembly=buildGT01Instrument(T,materials);
 instrumentAssembly.root.position.set(-290,350,750);
 instrumentAssembly.root.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)));
 for(const name of ['儀表顯示器外框','儀表顯示玻璃']){const legacy=parts.find(p=>p.name===name);if(!legacy)throw Error('Instrument legacy owner missing: '+name);root.remove(legacy);legacy.geometry.dispose();parts.splice(parts.indexOf(legacy),1);}
 root.add(instrumentAssembly.root);parts.push(...instrumentAssembly.parts);
 const dashboardAssembly=buildGT01Dashboard(T,materials);
 const legacyDash=parts.find(p=>p.name==='儀表台連續包覆');if(!legacyDash)throw Error('Dashboard legacy owner missing');root.remove(legacyDash);legacyDash.geometry.dispose();parts.splice(parts.indexOf(legacyDash),1,...dashboardAssembly.parts);root.add(dashboardAssembly.root);
 const consoleAssembly=applyGT01HingeFinishes(T,completeGT01ConsoleHinges(T,buildGT01Console(T,materials)));
 const consoleLegacyCounts={'中央鞍座':1,'中央扶手皮革':1,'中控亮黑面板':1,'中控金屬框':1,'金屬旋鈕':2};
 for(const [name,count]of Object.entries(consoleLegacyCounts)){const legacy=parts.filter(p=>p.name===name);if(legacy.length!==count)throw Error('Console legacy owner changed: '+name);for(const p of legacy){root.remove(p);p.geometry.dispose();parts.splice(parts.indexOf(p),1);}}
 root.add(consoleAssembly.root);parts.push(...consoleAssembly.parts);
 const centerDisplayAssembly=buildGT01CenterDisplay(T,materials);
 const legacyCenterDisplay=parts.filter(p=>p.name==='中控觸控顯示器');if(legacyCenterDisplay.length!==1)throw Error('Central display legacy owner changed');
 for(const p of legacyCenterDisplay){root.remove(p);p.geometry.dispose();parts.splice(parts.indexOf(p),1);}root.add(centerDisplayAssembly.root);parts.push(...centerDisplayAssembly.parts);
 bindGT01PartReferences(parts);
 root.userData={revision:'GT01-VEHICLE-R15',units:'mm',truth:'SOURCE_BOUND_AUTHOR_DESIGN',status:'WORK_IN_PROGRESS',wholeCarComplete:false};
 return {root,parts,materials,bodyRows,canopyRows,hood:hoodAssembly,steering:steeringAssembly,instrument:instrumentAssembly,dashboard:dashboardAssembly,console:consoleAssembly,centerDisplay:centerDisplayAssembly};
}
