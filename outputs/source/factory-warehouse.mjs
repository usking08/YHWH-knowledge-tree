/** Warehouse serialization keeps actual vertices, rather than re-running primitive parameters. */
export function serializeFactoryWarehouse(T,f){
 const root=f.root.clone(true),geometries=new Map();
 for(const child of [...root.children])if(child.userData.factoryStation||child.userData.id==='F-EXHIBITS')root.remove(child);
 root.traverse(o=>{delete o.userData.canvasDataURL;if(!o.geometry)return;const original=o.geometry;if(!geometries.has(original)){const buffer=new T.BufferGeometry().copy(original);buffer.type='BufferGeometry';buffer.userData={...original.userData,sourceGeometryType:original.type};if(original.parameters?.path)buffer.userData.sourceCurve=original.parameters.path.toJSON();geometries.set(original,buffer);}o.geometry=geometries.get(original);});
 return{scene:root.toJSON(),owners:f.parts.map(p=>({id:p.id,name:p.name,system:p.system})),stations:f.stations,plants:f.plants.map(p=>({id:p.id})),truth:'CURRENT_FACTORY_COMPONENTS_NOT_QUALIFIED',units:'mm',format:'FACTORY-WAREHOUSE-SEED/v1'};
}
export async function assembleFactoryWarehouse(T,payload,assets){
 if(payload.format!=='FACTORY-WAREHOUSE/v1')throw Error('Unrecognized factory warehouse');
 for(const img of payload.scene.images||[])if(typeof img.url==='string'&&img.url.startsWith('warehouse-asset:')){const id=img.url.slice('warehouse-asset:'.length);if(!assets[id]?.images?.Color)throw Error('Missing warehouse material '+id);img.url=assets[id].images.Color;}
 const root=await new T.ObjectLoader().parseAsync(payload.scene),all=new Map(),materials={};root.traverse(o=>{if(o.userData.id)all.set(o.userData.id,o);if(o.isMesh)for(const m of [].concat(o.material))if(m.userData.materialId)materials[m.userData.materialId]=m;});
 const parts=payload.owners.map(p=>({...p,object:all.get(p.id)}));if(parts.some(p=>!p.object))throw Error('Missing warehouse assembly');
 const roof=all.get('F-ROOF');if(!roof)throw Error('Missing warehouse roof');
 root.userData.production={method:'ASSEMBLED_FROM_PARTS_WAREHOUSE',manifest:'parts-library/factory/assembly.json',catalog:'parts-library/factory/catalog.json',revision:payload.revision,componentTypes:payload.componentCount,occurrences:payload.occurrenceCount,qualification:'PROVISIONAL_COMPONENTS_NOT_MANUFACTURING_APPROVED'};
 const surfaces=createWorkshopSurfaceLibrary(T,assets);
 return{root,roof,parts,stations:payload.stations,plants:payload.plants.map(p=>({...p,object:all.get(p.id)})),materials,surfaces,materialsReady:Promise.resolve(),warehouse:payload};
}
