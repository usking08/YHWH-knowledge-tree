// Authored service-tool geometry, not a vehicle component or purchased tool specification.
export function buildGT01ClampDriver(T,boltX=-24){
 const side=Math.sign(boltX),rows=[],af=3.9,r=af/Math.sqrt(3),tipY=20.25,z=163;
 for(const y of [tipY,tipY+.25,26,30,34.25])rows.push({x:boltX,y,angle:0,r:y===tipY?r*.94:r});
 for(let i=1;i<=16;i++){const a=i/16*Math.PI/2;rows.push({x:boltX+side*4*(1-Math.cos(a)),y:34.25+4*Math.sin(a),angle:a,r});}
 for(const distance of [12,30,50,70])rows.push({x:boltX+side*distance,y:38.25,angle:Math.PI/2,r:distance===70?r*.96:r});
 const p=[],idx=[];for(const row of rows)for(let j=0;j<6;j++){const a=Math.PI/6+j*Math.PI/3,u=row.r*Math.cos(a),v=row.r*Math.sin(a);p.push(row.x+Math.cos(row.angle)*u,row.y-side*Math.sin(row.angle)*u,z+v);}
 for(let i=0;i<rows.length-1;i++)for(let j=0;j<6;j++){const a=i*6+j,b=i*6+(j+1)%6,c=a+6,d=b+6;idx.push(a,b,c,b,d,c);}for(let j=1;j<5;j++){idx.push(0,j+1,j);const end=(rows.length-1)*6;idx.push(end,end+j,end+j+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();g.userData={role:'assembly_tool_not_vehicle_part',acrossFlats:af,bendRadius:4,shortLeg:18,straightHandleReach:70,nominalSocket:4,poseFrame:'glass grip',boltX};
 let volume=0;for(let i=0;i<idx.length;i+=3){const a=new T.Vector3().fromBufferAttribute(g.attributes.position,idx[i]),b=new T.Vector3().fromBufferAttribute(g.attributes.position,idx[i+1]),c=new T.Vector3().fromBufferAttribute(g.attributes.position,idx[i+2]);volume+=a.dot(b.cross(c))/6;}if(volume<0){for(let i=0;i<idx.length;i+=3)[idx[i+1],idx[i+2]]=[idx[i+2],idx[i+1]];g.setIndex(idx);g.computeVertexNormals();}g.userData.signedVolume=Math.abs(volume);
 return {geometry:g,approach:[{from:[side*70,3.75,0],to:[0,3.75,0],purpose:'lateral approach below cable plane'},{from:[0,3.75,0],to:[0,0,0],purpose:'socket engagement'}],scope:'Authored hex key entry envelope only; no hand, torque swing, extraction under load or material validation'};
}
