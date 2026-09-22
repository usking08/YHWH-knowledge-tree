/** Source-traced leaf, hollow vessel and connected stems. Authored visual botany, mm. */
import {FACTORY_LEAF} from './factory-leaf-outline.mjs';
export function buildFactoryPlant(T, surfaces, options={}) {
  const {juvenile=false}=options,root=new T.Group(),parts=[],L=FACTORY_LEAF;
  root.name='橡膠樹 · 逐葉組裝';root.userData={id:'F-PLANT',revision:'BOTANICAL-R2',source:'materials/generated/GT01-Ficus-Assembly-R1.png',units:'mm',status:'AUTHOR_VISUAL_RECONSTRUCTION',sourceOutlineSHA256:L.sourceSHA256};
  const ceramic=surfaces.make('ceramic-planter',0x968d7c,.78),liner=new T.MeshStandardMaterial({color:0x202823,roughness:.82}),soilMat=new T.MeshStandardMaterial({color:0x30251a,roughness:1}),wood=new T.MeshStandardMaterial({color:0x6a5035,roughness:.94}),petioleMat=new T.MeshStandardMaterial({color:0x75603e,roughness:.61});
  const front=surfaces.make('ficus-upper',0xffffff,.38),back=front.clone();back.color.set(0xb7c89d);back.roughness=.86;back.clearcoat=0;back.name='Ficus | 葉背外觀推定';
  function add(id,name,g,m,parent=root){const o=new T.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;o.userData={id,partId:id,source:root.userData.source,units:'mm',role:name};parent.add(o);parts.push(o);return o;}
  function lathe(rows){const g=new T.LatheGeometry(rows.map(([r,z])=>new T.Vector2(r,z)),80);g.rotateX(Math.PI/2);return g;}
  function tube(points,r){return new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,10,false);}
  if(!juvenile){
    add('PL-01','接水托盤 · 實體底與上翻邊',lathe([[0,0],[239,0],[257,6],[270,27],[267,38],[255,39],[250,18],[235,10],[0,10]]),ceramic);
    const potRows=[[12,20],[205,20],[212,28],[276,528],[280,538],[279,543],[274,550],[266,550],[259,545],[258,539],[252,521],[190,48],[12,48],[12,20]];
    add('PL-02','陶盆 · 連續口緣、內壁與 Ø24 排水孔',lathe(potRows),ceramic);
    add('PL-03','育苗內盆 · 薄壁與中心排水孔',lathe([[12,55],[185,55],[248,504],[256,509],[256,517],[248,520],[241,509],[179,64],[12,64],[12,55]]),liner);
    const soil=new T.CylinderGeometry(238,179,432,64);soil.rotateX(Math.PI/2);const so=add('PL-04','根土團 · 表土低於盆口 40 mm',soil,soilMat);so.position.z=280;
    const grains=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),soilMat,130);const mat=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3();for(let i=0;i<130;i++){const r=230*Math.sqrt((i+.5)/130),a=i*2.3999632;mat.compose(v.set(r*Math.cos(a),r*Math.sin(a),498+(i%4)),q,new T.Vector3(3+i%4,3+(i*3)%4,2+i%3));grains.setMatrixAt(i,mat);}grains.name='表土粒徑 4–12 mm 外觀近似';grains.castShadow=grains.receiveShadow=true;root.add(grains);
  }
  const verts=[],uvs=[],indices=[],nu=8,rows=L.rows,bb=L.boundsPixels;
  function point(row,u,backSide=false){const texU=row.u0+(row.u1-row.u0)*u,x=((texU-(rows[0].u0+rows[0].u1)/2)*L.width/(bb.maxX-bb.minX))*133,y=row.t*300,z=19*Math.sin(row.t*Math.PI)-7*Math.sin(Math.PI*u)**2*Math.sin(row.t*Math.PI)+(backSide?-.175:.175);return[x,y,z,texU,row.v];}
  for(const side of [false,true])for(const row of rows)for(let j=0;j<=nu;j++){const p=point(row,j/nu,side);verts.push(...p.slice(0,3));uvs.push(...p.slice(3));}
  const bank=rows.length*(nu+1);for(let i=0;i<rows.length-1;i++)for(let j=0;j<nu;j++){const a=i*(nu+1)+j,b=a+nu+1;indices.push(a,a+1,b,a+1,b+1,b);}const faceCount=indices.length;
  for(let i=0;i<faceCount;i+=3)indices.push(indices[i]+bank,indices[i+2]+bank,indices[i+1]+bank);
  const border=[];for(let j=0;j<=nu;j++)border.push(j);for(let i=1;i<rows.length;i++)border.push(i*(nu+1)+nu);for(let j=nu-1;j>=0;j--)border.push((rows.length-1)*(nu+1)+j);for(let i=rows.length-2;i>0;i--)border.push(i*(nu+1));
  for(let i=0;i<border.length;i++){const a=border[i],b=border[(i+1)%border.length];indices.push(a,b+bank,b,a,a+bank,b+bank);}
  const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));leafGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));leafGeo.setIndex(indices);leafGeo.addGroup(0,faceCount,0);leafGeo.addGroup(faceCount,indices.length-faceCount,1);leafGeo.computeVertexNormals();leafGeo.userData={id:'PL-LEAF',sourceSHA256:L.sourceSHA256,dimensionsMM:L.bladeMM,outline:'64 source alpha sections',camberMM:19};
  const baseZ=juvenile?0:496,total=juvenile?420:1705,stemCount=juvenile?1:3;
  for(let stem=0;stem<stemCount;stem++){
    const a=stem*2.2,x=stem?Math.cos(a)*95:0,y=stem?Math.sin(a)*95:0,topZ=total-stem*115,topX=x+Math.cos(a)*150,topY=y+Math.sin(a)*125;
    const stemCurve=new T.CatmullRomCurve3([[x,y,baseZ-8],[x*.8,y*.8,(baseZ+topZ)*.49],[topX,topY,topZ]].map(v=>new T.Vector3(...v)));
    const stemObj=add('PL-05-'+stem,'木質主莖 '+(stem+1),new T.TubeGeometry(stemCurve,32,juvenile?4:11-stem*1.8,12,false),wood);
    stemObj.userData.interfaces={rootAt:[x,y,baseZ-8],tip:[topX,topY,topZ]};
    const count=juvenile?6:14;
    for(let n=0;n<count;n++){
      const t=(n+1)/(count+1),z=baseZ+(topZ-baseZ)*t,px=x+(topX-x)*t,py=y+(topY-y)*t,ang=n*2.3999632+a,scale=juvenile?.33:(.77+.22*Math.sin((n+1)*1.3)**2),elev=.10+.92*t;
      const dir=new T.Vector3(Math.cos(ang)*Math.cos(elev),Math.sin(ang)*Math.cos(elev),Math.sin(elev));
      const start=stemCurve.getPoint(t),end=start.clone().addScaledVector(dir,55*scale),mid=start.clone().lerp(end,.5).add(new T.Vector3(0,0,4*scale));
      const id='PL-06-'+stem+'-'+n,pet=add(id+'-P','葉柄 '+stem+'/'+n,tube([start.toArray(),mid.toArray(),end.toArray()],2.5*scale),petioleMat);pet.userData.interfaces={stemId:stemObj.userData.id,stemParameter:t,stemPoints:stemCurve.points.map(p=>p.toArray()),start:start.toArray(),end:end.toArray(),nominalChordMM:55*scale};
      const leaf=add(id,'葉片 '+stem+'/'+n,leafGeo,[front,back]);leaf.position.copy(end);leaf.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir);leaf.scale.setScalar(scale);leaf.userData.interfaces={petiole:id+'-P',base:end.toArray(),sourceBladeMM:[133,300,.35],instanceScale:scale};
    }
  }
  root.userData.partCount=parts.length;root.userData.assemblyOrder=['PL-01 接水托盤','PL-02 中空陶盆','PL-03 育苗內盆','PL-04 根土團','PL-05 主莖','PL-06 葉柄與葉片'];root.userData.limits=['葉背顏色與弧度為作者重建','無生長／栽培模擬','根系微觀構造尚未建立'];return{root,parts,leafGeometry:leafGeo};
}
