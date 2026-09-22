// AUTHOR_DESIGN. Pivot, retaining clip, thrust washer and perimeter gasket are separate parts.
export function makeGT01DoorHandleHardware(T,carrier){
 const components=[];
 const lathe=points=>{const g=new T.LatheGeometry(points.map(([z,r])=>new T.Vector2(r,z)),96);g.rotateX(Math.PI/2);g.translate(-46,-10,0);return g;};
 components.push({id:'D11-P03',name:'肩銷與止退槽',geometry:lathe([[-20,0],[-20,1.7],[-19.7,2],[-19.2,2],[-19.2,1.6],[-18.5,1.6],[-18.5,2],[18,2],[18,3.5],[19.6,3.5],[20,3.1],[20,0]]),material:'steel',explode:[0,0,30]});
 const clip=new T.Shape(),outer=4.0;clip.moveTo(-2.5,-3.12);clip.absarc(0,0,outer,Math.atan2(-3.12,-2.5),Math.atan2(-3.12,2.5),true);clip.lineTo(1.9,-2.1);clip.lineTo(.85,-1.55);clip.lineTo(1.55,-.9);clip.lineTo(2.2,-.7);clip.lineTo(2.2,.7);clip.lineTo(1.65,.7);clip.lineTo(.85,1.6);clip.lineTo(.75,2.25);clip.lineTo(-.75,2.25);clip.lineTo(-.85,1.6);clip.lineTo(-1.65,.7);clip.lineTo(-2.2,.7);clip.lineTo(-2.2,-.7);clip.lineTo(-1.55,-.9);clip.lineTo(-.85,-1.55);clip.lineTo(-1.9,-2.1);clip.closePath();
 const cg=new T.ExtrudeGeometry(clip,{depth:.65,bevelEnabled:false,curveSegments:32});cg.translate(-46,-10,-19.18);components.push({id:'D11-P09',name:'E 型止退扣環',geometry:cg,material:'steel',explode:[0,-20,-6],interfaces:{complete:false,nominalGrooveDiameter:3.2,interferenceAndInstallationUnverified:true}});
 const ring=(ro,ri,z,t)=>{const s=new T.Shape();s.absarc(0,0,ro,0,Math.PI*2);const h=new T.Path();h.absarc(0,0,ri,0,Math.PI*2,true);s.holes.push(h);const g=new T.ExtrudeGeometry(s,{depth:t,bevelEnabled:false,curveSegments:48});g.translate(-46,-10,z);return g;};
 components.push({id:'D11-P10',name:'銷軸下止推墊圈',geometry:ring(3.5,2.1,-18.5,.5),material:'steel',explode:[0,0,-12]});
 const s=new T.Shape(carrier.flangeContour.map(p=>new T.Vector2(...p)));for(const hole of carrier.flangeHoles)s.holes.push(new T.Path([...hole].reverse().map(p=>new T.Vector2(...p))));const gasket=new T.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});gasket.rotateX(Math.PI/2);components.push({id:'D11-P06',name:'周界密封墊',geometry:gasket,material:'rubber',explode:[0,9,0]});
 for(const c of components){const g=c.geometry.index?c.geometry.toNonIndexed():c.geometry,p=g.attributes.position,n=g.attributes.normal,P=[],N=[];for(let i=0;i<p.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),d=new T.Vector3().fromBufferAttribute(p,i+2);if(b.sub(a).cross(d.sub(a)).length()<1e-8)continue;for(let j=0;j<3;j++){P.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));N.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j));}}const clean=new T.BufferGeometry();clean.setAttribute('position',new T.Float32BufferAttribute(P,3));clean.setAttribute('normal',new T.Float32BufferAttribute(N,3));c.geometry=clean;}
 return components;
}

