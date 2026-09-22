/** Visual material construction for the actual GT01 workshop. Units: millimetres.
 * Optical values are authored appearance choices, never laboratory measurements.
 * Asset metadata and images are embedded by build-atelier.mjs, without runtime network.
 */
export function createWorkshopSurfaceLibrary(T, assets = {}) {
  const pending=[], failures=[], textures=new Map(), loader=typeof document==='undefined'?null:new T.TextureLoader();
  function texture(id,role) {
    const key=id+':'+role;if(textures.has(key))return textures.get(key);
    const uri=assets[id]?.images?.[role==='BumpProxy'?'Color':role];if(!loader||!uri)return null;
    let done,fail;pending.push(new Promise((a,b)=>{done=a;fail=b;}));
    const t=loader.load(uri,()=>done(key),undefined,e=>{failures.push(key);fail(Error('Material image failed: '+key));});
    t.name=key;t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=role==='Color'?T.SRGBColorSpace:T.NoColorSpace;
    t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.anisotropy=8;textures.set(key,t);return t;
  }
  const specs={
    'ficus-upper':{asset:'GT01-Ficus-Leaf-R1',color:0xffffff,roughness:.4,bumpMM:.025,clearcoat:.22,clearcoatRoughness:.3,role:'按生成圖輪廓裁出的葉片；葉脈顏色來自同一張圖'},
    'polished-concrete':{asset:'GT01-Concrete-R1',tile:[2000,2000],color:0xffffff,roughness:.48,bumpMM:.18,bevel:0,role:'研磨混凝土；生成細孔外觀'},
    'concrete-cut-edge':{asset:'GT01-Concrete-R1',tile:[2000,2000],color:0xb8b6ad,roughness:.94,bumpMM:.35,role:'混凝土板切邊'},
    'bay-epoxy':{color:0xb6bdb7,roughness:.34,clearcoat:.18,clearcoatRoughness:.28,role:'不透明環氧樹脂塗層'},
    'gallery-limestone':{color:0xd2cbbc,roughness:.52,role:'石灰岩外觀；天然孔紋仍待專用來源'},
    'charcoal-painted-steel':{color:0x293331,roughness:.37,metalness:0,bevel:1.8,role:'不透明烤漆覆蓋鋼材；外表面為介電質'},
    'galvanized-steel':{color:0xb4b8b5,roughness:.39,metalness:1,bevel:1,role:'裸露鍍鋅金屬；鋅花尚未建模'},
    'brushed-stainless':{color:0xc4c7c5,roughness:.28,metalness:1,anisotropy:.48,bevel:1.2,role:'裸露不鏽鋼；拉絲方向沿局部U軸'},
    'warm-white-powdercoat':{color:0xe1ded3,roughness:.42,metalness:0,bevel:2,role:'粉體塗裝；塗膜遮住基材的金屬反射'},
    'mineral-wall-panel':{asset:'GT01-Concrete-R1',tile:[2000,2000],color:0xf1f0e5,roughness:.93,bumpMM:.08,role:'礦物塗面板；使用細紋外觀近似'},
    'standing-seam-roof':{color:0x576361,roughness:.48,metalness:0,role:'烤漆金屬屋面，接縫仍由幾何表示'},
    'rubber-and-gaskets':{color:0x202622,roughness:.83,bevel:.7,role:'橡膠與墊片；表面不呈裸金屬'},
    'oiled-oak':{asset:'GT01-Oak-R1',tile:[800,800],color:0xffffff,roughness:.4,bumpMM:.07,clearcoat:.14,clearcoatRoughness:.36,grain:'longest',bevel:1.4,role:'生成橡木紋飾面，依長軸順紋；端木年輪未驗證'},
    'oak-worktop':{asset:'GT01-Oak-R1',tile:[800,800],color:0xffffff,roughness:.33,bumpMM:.045,clearcoat:.25,clearcoatRoughness:.3,grain:'longest',bevel:3,role:'生成橡木飾面工作桌與順紋封邊；不是端木切面'},
    'warm-tan-upholstery':{asset:'GT01-Leather-R1',tile:[250,250],color:0xffffff,roughness:.52,bumpMM:.08,clearcoat:.1,clearcoatRoughness:.42,role:'生成細紋皮革座椅，250毫米貼圖週期為作者選值'},
    'sage-lounge-fabric':{asset:'GT01-Fabric-R1',tile:[320,320],color:0xffffff,roughness:.92,bumpMM:.12,sheen:.65,sheenColor:0xa8b5a1,sheenRoughness:.8,role:'生成斜紋織布；320毫米貼圖週期為作者選值'},
    'safety-ochre':{color:0xd2a64a,roughness:.46,metalness:0,bevel:1,role:'黄色警示漆'},
    'floor-white-marking':{color:0xe5e2d5,roughness:.73,metalness:0,role:'地坪標線塗層'},
    'equipment-bluegreen':{color:0x365951,roughness:.39,metalness:0,bevel:2,role:'設備綠烤漆'},
    'quarantine-red':{color:0x98463a,roughness:.47,metalness:0,bevel:2,role:'紅色隔離箱塗層'},
    'parts-bin-blue':{color:0x365769,roughness:.52,bevel:2.5,role:'射出塑膠料盒'},
    'ceramic-planter':{color:0x968d7c,roughness:.78,role:'陶器；燒成細孔待專用來源'},
    'clear-architectural-glass':{color:0xffffff,roughness:.018,metalness:0,transmission:1,ior:1.5,thickness:18,attenuationColor:0xdfeee7,attenuationDistance:2200,role:'玻璃實體；Fresnel反射與體積透射，厚度由每片幾何帶入'},
    'booth-laminated-glass':{color:0xffffff,roughness:.024,metalness:0,transmission:1,ior:1.5,thickness:18,attenuationColor:0xd1e9dc,attenuationDistance:1600,role:'隔間玻璃透射外觀；夾層光學未量測'}
  };
  function make(key,color,roughness=.65,metalness=0,extra={}) {
    const s=specs[key]||{}, options={color,roughness,metalness,...extra};
    for(const k of ['color','roughness','metalness','clearcoat','clearcoatRoughness','anisotropy','sheen','sheenRoughness','sheenColor','transmission','ior','thickness','attenuationColor','attenuationDistance'])if(s[k]!==undefined)options[k]=s[k];
    if(s.transmission){Object.assign(options,{transparent:false,opacity:1,depthWrite:true,side:T.FrontSide});}
    const m=new T.MeshPhysicalMaterial(options);m.name='Factory | '+key;m.envMapIntensity=.65;
    if(s.asset){m.map=texture(s.asset,'Color');m.bumpMap=texture(s.asset,'BumpProxy');m.bumpScale=s.bumpMM||0;}
    m.userData={materialId:key,revision:'MATERIAL-R1',role:s.role||key,truth:'AUTHOR_VISUAL_PARAMETERS',tileMM:s.tile||null,grain:s.grain||null,edgeRadiusMM:s.bevel||0,source:s.asset?assets[s.asset]?.source:null,scaleTruth:s.tile?'AUTHOR_VISUAL_SCALE':'NOT_TEXTURED',heightProxy:s.asset?'GENERATED_COLOR_RED_CHANNEL_NOT_MEASURED_HEIGHT':null,bumpAmplitudeMM:s.bumpMM||0,pendingQualification:['Measured reflectance / roughness','Appearance under calibrated reference lighting','True microsurface height and end-grain continuity']};
    return m;
  }
  // Projection acts in each component's local millimetre coordinates. Rotation or
  // instancing therefore carries the texture with the object, without texture swimming.
  function uv(geo,mat,dims) {
    const tile=mat.userData.tileMM;if(!tile)return geo;
    const p=geo.attributes.position,n=geo.attributes.surfaceBasisNormal||geo.attributes.normal,a=new Float32Array(p.count*2);
    const lengthAxis=mat.userData.grain?dims.indexOf(Math.max(...dims)):-1;
    for(let i=0;i<p.count;i++){
      const q=[p.getX(i),p.getY(i),p.getZ(i)],nn=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))],axis=nn.indexOf(Math.max(...nn));
      const axes=[0,1,2].filter(k=>k!==axis);if(axes.includes(lengthAxis)&&axes[0]!==lengthAxis)axes.reverse();
      a[i*2]=q[axes[0]]/tile[0];a[i*2+1]=q[axes[1]]/tile[1];
    }
    geo.setAttribute('uv',new T.BufferAttribute(a,2));geo.userData.surfaceMapping={tileMM:tile,space:'PART_LOCAL_MM',grainAxis:lengthAxis};return geo;
  }
  function roundedBox(w,d,h,r) {
    r=Math.min(r,Math.min(w,d,h)/4);const geo=new T.BoxGeometry(w,d,h,r>0?4:1,r>0?4:1,r>0?4:1);if(!r)return geo;
    const p=geo.attributes.position,n=geo.attributes.normal,half=[w/2,d/2,h/2],v=new T.Vector3();geo.setAttribute('surfaceBasisNormal',n.clone());
    for(let i=0;i<p.count;i++){
      const old=[p.getX(i),p.getY(i),p.getZ(i)],q=old.map((x,k)=>Math.abs(x)<1e-7?0:Math.sign(x)*(Math.abs(x)>half[k]*.75?half[k]:half[k]-r)),core=q.map((x,k)=>Math.max(-half[k]+r,Math.min(half[k]-r,x)));
      v.set(q[0]-core[0],q[1]-core[1],q[2]-core[2]).normalize();p.setXYZ(i,core[0]+v.x*r,core[1]+v.y*r,core[2]+v.z*r);n.setXYZ(i,v.x,v.y,v.z);
    }
    geo.computeBoundingBox();geo.userData.edgeRadiusMM=r;return geo;
  }
  return {make,uv,roundedBox,textures,failures,ready:()=>Promise.all(pending),specs};
}
