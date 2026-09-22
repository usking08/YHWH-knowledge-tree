// AUTHOR_DESIGN, mm. One continuous wire and two independent bearing spacers.
export function makeGT01DoorHandleReturn(T,angle=0){
 const components=[],points=[],radius=3.6,wire=.35,turns=6.5;
 // Illustrative deformation preserves the sampled coil wire length and both
 // tangent leg endpoints. It is not a stress or fatigue model.
 const coilPoint=(u,dr,a)=>{const r=radius+dr*Math.sin(Math.PI*u)**2,t=(turns*2*Math.PI+a)*u;return new T.Vector3(-46+r*Math.cos(t),-10+r*Math.sin(t),-12.7+5.1*u);};
 const coilLength=(dr,a)=>{let length=0,prev=coilPoint(0,dr,a);for(let i=1;i<=624;i++){const next=coilPoint(i/624,dr,a);length+=next.distanceTo(prev);prev=next;}return length;};
 const restLength=coilLength(0,0);let dr=0;
 if(angle!==0){let lo=-.5,hi=.5;for(let i=0;i<38;i++){const mid=(lo+hi)/2;if(coilLength(mid,angle)>restLength)hi=mid;else lo=mid;}dr=(lo+hi)/2;}
 for(let i=0;i<17;i++)points.push(new T.Vector3(-46+radius,-23+13*i/16,-12.7));
 for(let i=1;i<=624;i++)points.push(coilPoint(i/624,dr,angle));
 for(let i=1;i<=16;i++){const x=-radius,y=-13*i/16;points.push(new T.Vector3(-46+x*Math.cos(angle)-y*Math.sin(angle),-10+x*Math.sin(angle)+y*Math.cos(angle),-7.6));}
 const P=[],N=[],rings=[],sides=24,V=p=>new T.Vector3(...p);
 let previousNormal=new T.Vector3(0,0,1),previousTangent=null;
 for(let i=0;i<points.length;i++){
  const t=(i===0?points[1].clone().sub(points[0]):i===points.length-1?points[i].clone().sub(points[i-1]):points[i+1].clone().sub(points[i-1])).normalize();
  if(previousTangent)previousNormal.applyQuaternion(new T.Quaternion().setFromUnitVectors(previousTangent,t));
  const n=previousNormal.clone().addScaledVector(t,-previousNormal.dot(t)).normalize(),b=t.clone().cross(n).normalize();
  rings.push(Array.from({length:sides},(_,j)=>{const a=2*Math.PI*j/sides,normal=n.clone().multiplyScalar(Math.cos(a)).addScaledVector(b,Math.sin(a));return{p:points[i].clone().addScaledVector(normal,wire).toArray(),n:normal.toArray()};}));
  previousNormal=n;previousTangent=t;
 }
 function tri(a,b,c,na,nb=na,nc=na){if(V(b).sub(V(a)).cross(V(c).sub(V(a))).dot(V(na).add(V(nb)).add(V(nc)))<0){[b,c]=[c,b];[nb,nc]=[nc,nb];}P.push(...a,...b,...c);N.push(...na,...nb,...nc);}
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++){const k=(j+1)%sides,a=rings[i][j],b=rings[i+1][j],c=rings[i+1][k],d=rings[i][k];tri(a.p,b.p,c.p,a.n,b.n,c.n);tri(a.p,c.p,d.p,a.n,c.n,d.n);}
 for(const [i,normal]of[[0,[0,-1,0]],[rings.length-1,[0,-1,0]]])for(let j=0;j<sides;j++)tri(points[i].toArray(),rings[i][j].p,rings[i][(j+1)%sides].p,normal);
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(P,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(N,3));
 components.push({id:'D11-P04',name:'雙切向腳回位扭簧',geometry,material:'steel',explode:[-16,0,-20],interfaces:{wireDiameter:.7,turns:6.5,meanDiameter:7.2,coilCentrelineZ:[-12.7,-7.6],pitch:5.1/6.5,legLength:13,fixedLeg:{x:-42.4,y:[-23,-10],z:-12.7,contactPlaneX:-42.75},movingLeg:{x:-49.6,y:[-23,-10],z:-7.6,contactPlaneX:-49.95},motion:'LENGTH_PRESERVING_SHAPE_STUDY',angleDegrees:angle*180/Math.PI,coilCentrelineLength:coilLength(dr,angle),restCoilCentrelineLength:restLength,radialAdjustment:dr,stressValidated:false}});
 const ring=(z,height)=>{const s=new T.Shape();s.absarc(0,0,2.75,0,2*Math.PI);const h=new T.Path();h.absarc(0,0,2.1,0,2*Math.PI,true);s.holes.push(h);const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:false,curveSegments:48});g.translate(-46,-10,z);return g;};
 components.push({id:'D11-P11a',name:'下軸套與彈簧導套',geometry:ring(-14.5,8.5),material:'polymer',explode:[0,0,-30],interfaces:{innerDiameter:4.2,outerDiameter:5.5,axialZ:[-14.5,-6],support:'carrier lower wall to cable actuator base'}});
 components.push({id:'D11-P11b',name:'上軸套',geometry:ring(7,11),material:'polymer',explode:[0,0,22],interfaces:{innerDiameter:4.2,outerDiameter:5.5,axialZ:[7,18],support:'top-inserted bearing sleeve, flush with top wall',installation:'vertical through 5.7mm upper carrier bore'}});
 for(const c of components){if(c.id==='D11-P04')continue;const g=c.geometry.index?c.geometry.toNonIndexed():c.geometry,p=g.attributes.position,n=g.attributes.normal,outP=[],outN=[];for(let i=0;i<p.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),d=new T.Vector3().fromBufferAttribute(p,i+2);if(b.sub(a).cross(d.sub(a)).length()<1e-8)continue;for(let j=0;j<3;j++){outP.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));outN.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j));}}const clean=new T.BufferGeometry();clean.setAttribute('position',new T.Float32BufferAttribute(outP,3));clean.setAttribute('normal',new T.Float32BufferAttribute(outN,3));c.geometry=clean;}
 return components;
}

