// Read-only staging of the current vehicle; no shared source is modified.
export function inspectConsoleContext(T,assembly,vehicle){
  assembly.root.updateMatrixWorld(true);vehicle.root.updateMatrixWorld(true);
  const floor=vehicle.parts.find(p=>p.name==='雙層地毯與隔音層'),floorBox=new T.Box3().setFromObject(floor),bodyBox=new T.Box3().setFromObject(assembly.parts.find(p=>p.userData.subPart==='I03-P04'));
  const seats=[],skin=assembly.parts.find(p=>p.userData.subPart==='I03-P03');vehicle.root.traverse(p=>{if(p.isMesh&&p.userData.system==='seats')seats.push(p);});for(const p of seats)if(p.material)p.material.side=T.DoubleSide;skin.material.side=T.DoubleSide;
  const ray=new T.Raycaster(),samples=[];for(const x of [-80,60,190,320,430])for(const z of [335,365,400,435])for(const side of [-1,1]){ray.set(new T.Vector3(x,0,z),new T.Vector3(0,side,0));ray.far=650;const body=ray.intersectObject(skin,false).at(-1),seat=ray.intersectObjects(seats,false)[0];if(body&&seat)samples.push({x,z,side,bodyY:body.point.y,seatY:seat.point.y,clearanceMm:side*(seat.point.y-body.point.y),seatId:seat.object.userData.id});}
  return {vehicleRevision:vehicle.root.userData.revision,seatMeshes:seats.length,scope:'static current seats and floor only; not full vehicle certification',floor:{min:floorBox.min.toArray(),max:floorBox.max.toArray(),consoleBaseZ:bodyBox.min.z,clearanceMm:bodyBox.min.z-floorBox.max.z},seatSamples:samples,minSampledSeatClearanceMm:Math.min(...samples.map(s=>s.clearanceMm)),sampledPass:samples.length>0&&samples.every(s=>s.clearanceMm>0)&&bodyBox.min.z>=floorBox.max.z};
}
