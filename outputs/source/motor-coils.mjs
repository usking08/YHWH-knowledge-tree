// One continuous conductor and its bonded enamel coating are one physical coil.
// Every mesh ring follows a checked source polyline; no spline shortcut can
// leave the verified 0.18 mm-radius centreline envelope between samples.
export function makeGT01RoutedCoils(T,paths){
 const V=p=>new T.Vector3(...p),components=[];
 function clean(raw){return raw.map(V).filter((p,i,a)=>!i||p.distanceToSquared(a[i-1])>1e-12);}
 function trimmed(p,offset){const d=[0];for(let i=1;i<p.length;i++)d.push(d.at(-1)+p[i].distanceTo(p[i-1]));const total=d.at(-1),at=s=>{let i=1;while(i<d.length-1&&d[i]<s)i++;return p[i-1].clone().lerp(p[i],(s-d[i-1])/(d[i]-d[i-1]));};return {length:total,points:[at(offset),...p.filter((_,i)=>d[i]>offset&&d[i]<total-offset),at(total-offset)]};}
 function tube(p,outer,inner=0){
  const rings=[],frames=[],segments=16,positions=[],normals=[];
  let lastT,lastN;
  for(let i=0;i<p.length;i++){
   const before=p[i].clone().sub(p[Math.max(0,i-1)]).normalize(),after=p[Math.min(p.length-1,i+1)].clone().sub(p[i]).normalize(),t=before.add(after).normalize();
   let n;if(!i){n=new T.Vector3().crossVectors(t,Math.abs(t.x)>.9?new T.Vector3(0,0,1):new T.Vector3(1,0,0)).normalize();}else{n=lastN.clone().applyQuaternion(new T.Quaternion().setFromUnitVectors(lastT,t));n.addScaledVector(t,-n.dot(t)).normalize();}
   const b=new T.Vector3().crossVectors(t,n).normalize();frames.push(t);rings.push(Array.from({length:segments},(_,k)=>n.clone().multiplyScalar(Math.cos(k*Math.PI*2/segments)).addScaledVector(b,Math.sin(k*Math.PI*2/segments))));lastT=t;lastN=n;
  }
  const point=(i,k,r)=>p[i].clone().addScaledVector(rings[i][k%segments],r);
  const tri=(a,b,c,na,nb=na,nc=na)=>{positions.push(...a.toArray(),...b.toArray(),...c.toArray());normals.push(...na.toArray(),...nb.toArray(),...nc.toArray());};
  for(let i=0;i<p.length-1;i++)for(let k=0;k<segments;k++){
   const j=(k+1)%segments,a=point(i,k,outer),b=point(i,j,outer),c=point(i+1,j,outer),d=point(i+1,k,outer),na=rings[i][k],nb=rings[i][j],nc=rings[i+1][j],nd=rings[i+1][k];tri(a,b,c,na,nb,nc);tri(a,c,d,na,nc,nd);
   if(inner){const aa=point(i,k,inner),bb=point(i,j,inner),cc=point(i+1,j,inner),dd=point(i+1,k,inner);tri(aa,cc,bb,na.clone().negate(),nc.clone().negate(),nb.clone().negate());tri(aa,dd,cc,na.clone().negate(),nd.clone().negate(),nc.clone().negate());}
  }
  for(const i of [0,p.length-1])for(let k=0;k<segments;k++){const j=(k+1)%segments,o=point(i,k,outer),on=point(i,j,outer),a=inner?point(i,k,inner):p[i],b=inner?point(i,j,inner):p[i],n=frames[i].clone().multiplyScalar(i?1:-1);if(!i){tri(on,o,a,n);if(inner)tri(on,a,b,n);}else{tri(o,on,b,n);if(inner)tri(o,b,a,n);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.computeBoundingBox();g.computeBoundingSphere();return g;
 }
 for(const path of paths){const p=clean(path.points),coat=trimmed(p,.7),k=path.instance-1;components.push({ref:'D05-P14e',instance:path.instance,name:'連續疊繞線圈 '+String(path.instance).padStart(2,'0'),material:'enamel',surfaces:[['連續銅導體與兩個裸線端',tube(p,.17),'windingCopper'],['包覆導體的薄絕緣漆層',tube(coat.points,.18,.17),'enamel']],explode:[-30,24*Math.cos(k*Math.PI/6),24*Math.sin(k*Math.PI/6)],interfaces:{slotIndices:[k,(k+5)%12],turns:8,copperDiameter:.34,coatedDiameter:.36,enamelThickness:.01,strippedLength:.7,conductorLength:coat.length,terminalLeadsComplete:path.terminalLeadsComplete,terminals:path.terminals||[],shapeAuthority:'AUTHOR_DESIGN',weldsComplete:false},centerline:path.points});}
 return {components,interfaces:{physicalCoils:components.length,segments:'one continuous conductor per coil',electricalPerformanceValidated:false}};
}
