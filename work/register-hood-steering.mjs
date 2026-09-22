import fs from 'node:fs/promises';
import * as T from '../outputs/source/three.mjs';
import {buildGT01Steering} from '../outputs/source/steering-wheel.mjs';
const file=new URL('../outputs/source/vehicle-reference-index.json',import.meta.url);
const data=JSON.parse(await fs.readFile(file,'utf8')),top=id=>data.assemblies.flatMap(a=>a.parts).find(p=>p.id===id);
const branch=(id,note)=>{const p=top(id);if(!p)throw Error('Missing '+id);Object.assign(p,{kind:'subassembly',terminal:false,status:'construction_in_progress',reviewState:'partially_inspected',reviewNote:note});return p;};
const leaf=(id,parentId,name,role,quantity=1,extra={})=>({id,parentId,name,role,quantity,kind:'component',terminal:true,reference:null,status:'model_built_reference_pending',reviewState:'not_accepted',disassemblyBoundary:'single_formed_or_continuous_material',...extra});
const a=branch('C01','外板含一體反折包邊；膠層是材料分區。共同曲面、厚度與抽樣接觸已讀回；圖的前後標記與孔數矛盾不可直接採用。');
a.reference='references/C01-C02-hood-r1.png';a.referenceEvidenceType='assembly_concept';a.parts=[leaf('C01-P01','C01','外皮與一體包邊','一張成形薄板，有限厚度；包邊是本體形狀，不是另一片浮置圓管。'),leaf('C01-P03','C01','周緣包邊膠層','填入外板背面與內板周緣之間。',1,{kind:'material_region',disassemblyBoundary:'bonded_material_layer_not_detachable'}),leaf('C01-P04','C01','抗振膠區','四處連續膠體，上下接觸外板背面與內板凸臺。',4,{kind:'material_region',disassemblyBoundary:'bonded_material_layer_not_detachable'})];
const b=branch('C02','四孔沖壓內板、左右鉸鏈補強片及鎖扣補強片分件；6個安裝孔共用座標。尚未完成鉸鏈與鎖扣本體，不能宣告可用前蓋機構。');
b.parts=[leaf('C02-P01','C02','四孔沖壓內板','一張1.2 mm作者設定薄板，四個真正貫通窗與六個安裝孔。'),leaf('C02-P02-L','C02','左鉸鏈補強片','兩個Ø8孔與內板對軸，貼在內板背面。'),leaf('C02-P02-R','C02','右鉸鏈補強片','左側鏡像配對；不是省略的重複零件。'),leaf('C02-P03','C02','鎖扣補強片','前緣中央兩孔補強，鎖扣本體未完成。')];
b.reference='references/C01-C02-hood-r1.png';b.referenceEvidenceType='assembly_concept';b.rejectedPriorReferences=['references/C02-inner-panel-r1.png'];
const s=buildGT01Steering(T),i=branch('I04','I04-R5局部施工交回，已按右手座標基底装回車艙。41個呈現網格不是41個已驗證終端零件；握圈裁片、按鍵內部、氣囊及電控仍不能假裝拆完。');
i.reviewNote=i.reviewNote.replace('装','裝');i.reference='references/I04-front-r1.png';i.referenceEvidenceType='assembly_concept';i.views=[{view:'rear',reference:'references/I04-rear-r1.png'},{view:'side',reference:'references/I04-side-r1.png'},{view:'exploded',reference:'references/I04-exploded-r1.png'}];
const groups=new Map();for(const m of s.parts){const id=m.userData.subPart;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(m);}
i.parts=[...groups].map(([id,rows])=>leaf(id,'I04',rows[0].name,rows[0].userData.purpose,rows.length,{terminal:!['I04-P01','I04-P14','I04-P15','I04-P16','I04-P18','I04-P22'].includes(id),nativeMeshIds:rows.map(o=>o.userData.id),representationOnly:['I04-P17','I04-P18','I04-P19'].includes(id),reviewNote:'目前有可編輯形體；獨立單件參考、製造界線與接口資格仍需逐件補足。'}));
i.unresolved=s.definition.unknown;i.nativeRevision=s.definition.revision;
data.revision='GT01-REFERENCE-PIPELINE-R4';data.generatedAt=new Date().toISOString();await fs.writeFile(file,JSON.stringify(data,null,2));
console.log(JSON.stringify({updated:['C01','C02','I04'],subentries:a.parts.length+b.parts.length+i.parts.length,wholeAccepted:false}));
