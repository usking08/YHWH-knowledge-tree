import {makeGT01DoorHandleLever} from './door-handle-lever.mjs';
import {makeGT01DoorHandleCarrier} from './door-handle-carrier.mjs';
import {makeGT01DoorHandleHardware} from './door-handle-hardware.mjs';
import {makeGT01DoorHandleReturn} from './door-handle-return.mjs';
import {makeGT01DoorHandleActuator} from './door-handle-actuator.mjs';
export function buildGT01DoorHandle(T){
 const root=new T.Group(),parts=[],carrier=makeGT01DoorHandleCarrier(T),lever=makeGT01DoorHandleLever(T),materials={paint:new T.MeshPhysicalMaterial({color:0x183f30,roughness:.23,metalness:.65,clearcoat:1,clearcoatRoughness:.13}),polymer:new T.MeshStandardMaterial({color:0x444b4e,roughness:.6,metalness:0}),steel:new T.MeshStandardMaterial({color:0xb5bdc0,roughness:.25,metalness:.93}),rubber:new T.MeshStandardMaterial({color:0x202524,roughness:.87,metalness:0})};
 const defs=[{id:'D11-P01',name:'一體面板、背肋與轉軸座',...lever,material:'paint',explode:[0,28,0]},{id:'D11-P02',name:'空心承載盒',...carrier,material:'polymer',explode:[0,-12,0]},...makeGT01DoorHandleHardware(T,carrier),...makeGT01DoorHandleReturn(T),{id:'D11-P05a',name:'D 形凹座拉索撥臂',...makeGT01DoorHandleActuator(T),material:'polymer',explode:[16,0,-18]}];
 for(const d of defs){const m=new T.Mesh(d.geometry,materials[d.material]);m.name=d.name;m.userData={id:d.id,referencePart:d.id,referenceAncestors:['D00','D11'],system:'doors',explode:d.explode,interfaces:{referenceFrontAxis:[0,1,0],referenceUpAxis:[0,0,1],...d.interfaces},complete:false};m.castShadow=m.receiveShadow=true;root.add(m);parts.push(m);}
 root.name='D11 外把手首件';root.userData={revision:'D11-FIRST-ARTICLE-R3',complete:false,source:'AUTHOR_DESIGN',missing:['cable nipple, wire, sheath and retention','mounting fasteners and door seats','travel stop','door skin opening and installed motion','spring preload, material and load verification']};
 return {root,parts,materials};
}

