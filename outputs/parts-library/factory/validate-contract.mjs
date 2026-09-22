/** Pure reader. It creates no shape and repairs no input. A problem identifies one exact field. */
export function validateFactoryContract(catalog,assembly){
 const issues=[],add=(kind,field,message)=>issues.push({kind,field,message,status:'BLOCKED_BY_INPUT'}),ids=new Set(),stock=new Map();
 if(catalog.units!=='mm')add('SEMANTIC_INCOMPLETENESS','catalog.units','Expected explicit millimetres');
 for(const [i,p]of catalog.components.entries()){const at='catalog.components['+i+']';if(ids.has(p.id))add('DISCOVERABILITY_FAILURE',at+'.id','Duplicate canonical identity');ids.add(p.id);stock.set(p.id,p);for(const field of ['name','purpose','geometry','geometrySHA256','drawing','referenceAuthority'])if(!p[field])add('SEMANTIC_INCOMPLETENESS',at+'.'+field,'Required relation is absent');if(!p.scale?.every(n=>Number.isFinite(n)&&n!==0))add('ASSEMBLY_MISMATCH',at+'.scale','Singular or unknown design scale');}
 const used=new Map();for(const [i,o]of assembly.occurrences.entries()){const at='assembly.occurrences['+i+']';if(!stock.has(o.part))add('DISCOVERABILITY_FAILURE',at+'.part','The assembly asks for a part absent from the warehouse');if(o.worldMatrix?.length!==16||!o.worldMatrix.every(Number.isFinite))add('ASSEMBLY_MISMATCH',at+'.worldMatrix','Missing or non-finite placement transform');else{const m=o.worldMatrix,det=m[0]*(m[5]*m[10]-m[6]*m[9])-m[4]*(m[1]*m[10]-m[2]*m[9])+m[8]*(m[1]*m[6]-m[2]*m[5]);if(Math.abs(det)<1e-12)add('ASSEMBLY_MISMATCH',at+'.worldMatrix','The placement collapses a spatial axis');}used.set(o.part,(used.get(o.part)||0)+1);}
 for(const [id,p]of stock)if((used.get(id)||0)!==p.occurrenceCount)add('ASSEMBLY_MISMATCH','catalog.'+id+'.occurrenceCount','Declared quantity differs from assembly consumption');
 return {scope:'EXACT_STOCK_AND_FINAL_POSE_HANDOFF',status:issues.length?'BLOCKED_BY_INPUT':'PASS',issues,manufacturingAccepted:false,counts:{stock:stock.size,instances:assembly.occurrences.length}};
}
export function authorizeOperation(component,operation){
 if(operation==='DISPLAY_FINAL_POSE')return{status:'ALLOWED',scope:'Existing geometry and explicit matrix only'};
 const required=['interfaces','contactIntent','assemblyMotion','tolerances','supportState'],missing=required.filter(k=>!component[k]);return{status:missing.length?'BLOCKED_BY_INPUT':'REQUIRES_PHYSICAL_VALIDATION',operation,missingFields:missing.map(k=>'component.'+k),instruction:'Do not infer missing interfaces from appearance or family-level prose.'};
}
