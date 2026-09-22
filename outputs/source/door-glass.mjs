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
