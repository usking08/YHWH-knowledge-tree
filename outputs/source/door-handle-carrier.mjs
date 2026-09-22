// AUTHOR_DESIGN, mm. X along handle, Y outward, Z up. Open carrier with real vertical pivot bores.
export function makeGT01DoorHandleCarrier(T) {
 const positions=[],normals=[],R=18,r=14.5,c=58,N=64,pivot=[-46,-10],bore=2.1;
 function poly(contour,holes,map,normal){const flat=[...contour,...holes.flat()],faces=T.ShapeUtils.triangulateShape(contour.map(p=>new T.Vector2(...p)),holes.map(h=>h.map(p=>new T.Vector2(...p))));for(const f of faces)tri(...f.map(i=>map(flat[i])),normal);}
 function tri(a,b,d,n){const v=new T.Vector3(...b).sub(new T.Vector3(...a)).cross(new T.Vector3(...d).sub(new T.Vector3(...a)));if(v.dot(new T.Vector3(...n))<0)[b,d]=[d,b];positions.push(...a,...b,...d);for(let j=0;j<3;j++)normals.push(...n);}
 function quad(a,b,d,e,n){tri(a,b,d,n);tri(a,d,e,n);}
 function capsule(radius){const out=[];for(let i=0;i<=N;i++){const a=Math.PI/2-i*Math.PI/N;out.push([c+radius*Math.cos(a),radius*Math.sin(a)]);}for(let i=0;i<=N;i++){const a=-Math.PI/2-i*Math.PI/N;out.push([-c+radius*Math.cos(a),radius*Math.sin(a)]);}return out;}
 function circle(x,y,rad){return Array.from({length:64},(_,i)=>{const a=-i*Math.PI/32;return[x+rad*Math.cos(a),y+rad*Math.sin(a)];});}
 const shape=new T.Shape();shape.moveTo(-58,19);shape.lineTo(58,19);shape.bezierCurveTo(65,19,71,16,75,11);shape.lineTo(80,8);shape.lineTo(85,8);shape.absarc(85,0,8,Math.PI/2,-Math.PI/2,true);shape.lineTo(80,-8);shape.lineTo(75,-11);shape.bezierCurveTo(71,-16,65,-19,58,-19);shape.lineTo(-58,-19);shape.bezierCurveTo(-65,-19,-71,-16,-75,-11);shape.lineTo(-80,-8);shape.lineTo(-85,-8);shape.absarc(-85,0,8,-Math.PI/2,-Math.PI*1.5,true);shape.lineTo(-80,8);shape.lineTo(-75,11);shape.bezierCurveTo(-71,16,-65,19,-58,19);shape.closePath();
 const flange=shape.getPoints(24);if(flange[0].distanceTo(flange.at(-1))<1e-8)flange.pop();const F=flange.map(p=>[p.x,p.y]),O=capsule(R),I=capsule(r),ears=[circle(-85,0,2.6),circle(85,0,2.6)];
 const wall=(loop,y0,y1,invert=false)=>{for(let j=0;j<loop.length;j++){const a=loop[j],b=loop[(j+1)%loop.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),n=[-dz/l,0,dx/l];if(invert)for(let k=0;k<3;k++)n[k]*=-1;quad([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],n);}};
 poly(F,[I,...ears],p=>[p[0],-1,p[1]],[0,1,0]);
 poly(F,[O,...ears],p=>[p[0],-5,p[1]],[0,-1,0]);wall(F,-5,-1);for(const h of ears)wall(h,-5,-1,true);
 const drill=circle(pivot[0],pivot[1],bore),upperDrill=circle(pivot[0],pivot[1],2.85),anchor=[[-44.25,-23],[-42.75,-23],[-42.75,-18],[-44.25,-18]],cableHole=circle(-28,-4.55,2.75);
 function capsuleWall(loop,y0,y1,inner){for(let j=0;j<loop.length;j++){const a=loop[j],b=loop[(j+1)%loop.length];if(Math.abs(a[1]-b[1])<1e-8&&Math.abs(a[0]-b[0])>100){const z=a[1],n=[0,0,Math.sign(z)*(inner?-1:1)];poly([[-c,y0],[c,y0],[c,y1],[-c,y1]],[z>0?upperDrill:drill,...(inner&&z<0?[anchor]:[])],p=>[p[0],p[1],z],n);}else{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),q=inner?-1:1;quad([a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],[-q*dz/l,0,q*dx/l]);}}}
 capsuleWall(O,-34,-5,false);capsuleWall(I,-31.5,-1,true);
 poly(O,[cableHole],p=>[p[0],-34,p[1]],[0,-1,0]);poly(I,[cableHole],p=>[p[0],-31.5,p[1]],[0,1,0]);wall(cableHole,-34,-31.5,true);
 poly(anchor,[],p=>[p[0],p[1],-11.5],[0,0,1]);
 for(let j=0;j<anchor.length;j++){const a=anchor[j],b=anchor[(j+1)%anchor.length],n=new T.Vector3(b[1]-a[1],a[0]-b[0],0).normalize().toArray();quad([...a,-14.5],[...b,-14.5],[...b,-11.5],[...a,-11.5],n);}
 for(const s of [-1,1])for(let j=0;j<drill.length;j++){const loop=s>0?upperDrill:drill,a=loop[j],b=loop[(j+1)%loop.length],mid=[(a[0]+b[0])/2-pivot[0],(a[1]+b[1])/2-pivot[1]],l=Math.hypot(...mid);quad([a[0],a[1],s*r],[b[0],b[1],s*r],[b[0],b[1],s*R],[a[0],a[1],s*R],[-mid[0]/l,-mid[1]/l,0]);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geometry.computeBoundingBox();
 return {geometry,flangeContour:F,flangeHoles:[I,...ears],revision:'D11-P02-R3',interfaces:{pivotAxis:[0,0,1],pivotOrigin:[...pivot,0],pivotBores:{upper:5.7,lower:4.2},opening:[145,29],earCentres:[[-85,0],[85,0]],mountingBores:5.2,springAnchor:{bounds:[[-44.25,-23,-14.5],[-42.75,-18,-11.5]],contactPlaneX:-42.75},cablePortal:{centre:[-28,-32.75,-4.55],axis:[0,1,0],diameter:5.5},material:'AUTHOR_DESIGN_POLYMER',referenceFrontAxis:[0,1,0],referenceUpAxis:[0,0,1],complete:false,missing:['cable sheath retention','travel stop seat','structural load verification']}};
}

