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
