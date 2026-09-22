import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const out=new URL('../outputs/',import.meta.url);
const assemblies=[];
function assembly(id,name,system,hero,description,rows){
 const parts=rows.map(([id,name,role,filename])=>({id,name,role,reference:filename?'references/'+filename:null,status:'pending'}));
 assemblies.push({id,name,system,hero:hero?'references/'+hero:null,description,modelStatus:'施工稿，尚未通過逐件比對',parts});
}
assembly('S00','座椅總成','seats','S00-seat-r2.png','皮套、泡棉、骨架、調角器與滑軌各有獨立形體；先核對車艙空間，再組裝。',[
 ['S01','椅背骨架','承接頭枕與肩部；下端與調角器配合','S01-back-frame-r2.png'],
 ['S02','座墊骨架','前後橫樑、兩側托架與滑軌固定點','S02-seat-pan-r1.png'],
 ['S03','雙滑軌','上下軌嵌合，滑動通道與鎖止件保持分離','S03-rails-r1.png'],
 ['S04','調角器','左右樞軸連接椅背與座墊骨架','S04-recliner-r1.png'],
 ['S05','椅背泡棉','包住椅背骨架，保留肩翼及腰部輪廓','S05-back-foam-r1.png'],
 ['S06','座墊泡棉','大腿承托、側翼與坐面凹陷','S06-cushion-foam-r1.png'],
 ['S07','椅背皮套','裁片、縫線與包邊對應泡棉曲面','S07-back-cover-r1.png'],
 ['S08','座墊皮套','中央坐面、前鼻與側翼分片接合','S08-cushion-cover-r1.png'],
 ['S09','椅背後殼','薄殼包覆骨架背面；下緣避開樞軸','S09-rear-shell-r1.png'],
 ['S10','側護蓋','遮蔽調角器並讓出座椅調整控制','S10-side-trim-r1.png'],
 ['S11','安全帶扣','帶扣本體、釋放鍵與固定帶桿','S11-buckle-r1.png'],
 ['S12','滑軌固定件','螺栓、墊圈與固定孔對位','S12-fasteners-r1.png']]);
assembly('D00','車門總成','doors','D00-door-r2.png','外皮、結構殼、升降機、玻璃與內襯沿同一門體裝回；開門後仍需保持接口一致。',[
 ['D01','車門外皮','曲面、腰線、門縫與把手開口','D01-skin-r1.png'],['D02','車門內結構殼','維修孔、翻邊與固定座','D02-inner-shell-r1.png'],['D03','側撞樑','門內前後支承座與樑端接合','D03-beam-r1.png'],['D04','車門玻璃','上緣弧線、厚度與下方夾座','D04-glass-r2.png'],['D05','玻璃升降機','兩導軌、鋼索、滑座、馬達與玻璃夾','D05-regulator-r1.png'],['D06','模組承載板','升降機支承與密封周界','D06-carrier-r1.png'],['D07','門鎖與拉索','鎖舌、外殼、鎖扣入口與操作拉索','D07-latch-r1.png'],['D08','上下鉸鏈','固定葉片、軸孔、銷軸與止擋','D08-hinge-r1.png'],['D09','內飾門板','上沿、皮革插片、肘托、拉手與儲物袋','D09-trim-r1.png'],['D10','車門揚聲器','網罩、音盆、框架與固定孔','D10-speaker-r1.png'],['D11','齊平外把手','握持件、盒體、轉軸與回位機構','D11-handle-r1.png'],['D12','門框與玻璃密封','周界密封與內外腰線刮水條','D12-seals-r1.png']]);
assembly('C00','車身與開口','body','C00-body-r2.png','外形沿原始 GT01 圖；覆蓋件拆開仍須保留共同輪拱、門洞與玻璃邊界。',[
 ['C01','前蓋外板','雙側隆起、中央面與四周包邊','C01-hood-r1.png'],['C02','前蓋內骨架','內側壓筋、鉸鏈與鎖扣座','C02-hood-inner-r1.png'],['C03','前葉子板','前輪拱、燈口與門前緣','C03-fender-r1.png'],['C04','後側圍','後輪拱、肩線與尾燈開口','C04-quarter-r1.png'],['C05','車頂外皮','屋頂弧面與前後玻璃開口','C05-roof-r1.png'],['C06','前保桿','鼻端、下進氣口與側面回折','C06-front-fascia-r1.png'],['C07','後保桿','尾燈下曲面與下擾流開口','C07-rear-fascia-r1.png'],['C08','側裙','門檻外覆件與下緣翻邊','C08-sill-r1.png'],['C09','前格柵','框體、橫葉片與後方支承','C09-grille-r1.png'],['C10','後下擾流件','封閉外緣與分流肋','C10-diffuser-r1.png'],['C11','車身立柱與門洞','A 柱、後柱與門檻的連續承接','C11-aperture-r1.png'],['C12','鉸鏈鎖扣與固定件','覆蓋件的固定方式與開啟路徑','C12-hardware-r1.png']]);
assembly('L00','前後燈具','lights','L00-lights-r1.png','外罩、導光件、反射器、燈板與後殼按原車薄型燈口配合。',[
 ['L01','前燈透鏡外罩','薄型外廓、壁厚與密封邊','L01-lens-r1.png'],['L02','前燈後殼','固定耳、燈板腔與散熱座','L02-housing-r1.png'],['L03','日行燈導光條','原圖兩段光帶及端部收束','L03-guide-r1.png'],['L04','前燈光學模組','透鏡、支架與燈板的相對位置','L04-projector-r1.png'],['L05','尾燈外罩','後側圍長條外罩與內側短段','L05-tail-lens-r1.png'],['L06','尾燈導光及後殼','紅色光帶、承載板與密封','L06-tail-body-r1.png']]);
assembly('I00','儀表台與中央鞍座','interior','I00-cockpit-r1.png','面板、承載骨架、出風口、顯示器與操控件分別建造。',[
 ['I01','儀表台上包覆','弧面、縫線與擋風玻璃邊緣','I01-dash-r1.png'],['I02','儀表台骨架','橫樑、支架與轉向柱接口','I02-dash-frame-r1.png'],['I03','中央鞍座','飾板、置物腔、扶手與固定座','I03-console-r1.png'],['I04','方向盤','皮革輪圈、輻條、中心蓋與控制鍵','I04-steering-r1.png'],['I05','儀表與中控螢幕','玻璃、外框與安裝支架','I05-displays-r1.png'],['I06','出風口','外框、可轉葉片與後導管','I06-vents-r1.png'],['I07','踏板組','踏板面、支臂、轉軸與固定架','I07-pedals-r1.png'],['I08','地毯與頂篷','邊界、包覆厚度與內飾接縫','I08-trim-r1.png'],['I09','安全帶總成','捲收器、織帶、導向與固定座','I09-belt-r1.png']]);
assembly('G00','玻璃與後視鏡','glazing','G00-glazing-r1.png','玻璃邊界與車身開口共用；後視鏡殼體、鏡片與轉軸獨立。',[
 ['G01','前擋風玻璃','雙曲率表面、厚度與黑色邊帶','G01-windscreen-r1.png'],['G02','後擋風玻璃','後艙弧度與周界密封','G02-rear-glass-r1.png'],['G03','後側窗','小型固定玻璃、框邊與密封','G03-quarter-glass-r1.png'],['G04','外後視鏡','上殼、下殼、鏡片、支臂與轉軸','G04-mirror-r1.png'],['G05','玻璃密封條','斷面唇口與車身接觸關係','G05-seal-r1.png'],['G06','雨刷','刮片、連桿、樞軸與驅動馬達','G06-wiper-r1.png']]);
assembly('F00','底盤承載結構','chassis','F00-chassis-r1.png','地板、門檻、橫樑、隔板與副車架保留實際空腔與接合面。',[
 ['F01','乘員艙地板','壓筋、台階與座椅固定點','F01-floor-r1.png'],['F02','門檻樑','閉合斷面與端部接合','F02-sill-r1.png'],['F03','地板橫樑','座椅及電池接口','F03-crossmember-r1.png'],['F04','前圍板','轉向、踏板與管線穿越','F04-bulkhead-r1.png'],['F05','後隔板','座艙與後部驅動區分隔','F05-rear-wall-r1.png'],['F06','前副車架','控制臂、轉向機與車身支座','F06-front-subframe-r1.png'],['F07','後副車架','後懸吊與驅動支座','F07-rear-subframe-r1.png'],['F08','下護板','固定孔、分件線與維修開口','F08-undertray-r1.png']]);
assembly('U00','懸吊與轉向','suspension','U00-suspension-r1.png','輪端、控制臂、球接頭與減震器相連，避開輪胎運動空間。',[
 ['U01','前轉向節','軸承座、球頭座與轉向拉桿座','U01-knuckle-r1.png'],['U02','上控制臂','兩內支點、外球頭與空腔','U02-upper-arm-r1.png'],['U03','下控制臂','支點與彈簧減震支座','U03-lower-arm-r1.png'],['U04','彈簧減震器','彈簧、托盤、筒身、活塞桿與襯套','U04-damper-r1.png'],['U05','穩定桿','本體、連桿與橡膠支承','U05-antiroll-r1.png'],['U06','轉向機與拉桿','齒條殼、防塵套、拉桿與球接頭','U06-rack-r1.png'],['U07','後控制臂組','各支臂的支點與輪端接口','U07-rear-arms-r1.png'],['U08','支承與固定件','橡膠襯套、內套、螺栓與螺帽','U08-bushes-r1.png']]);
assembly('P00','驅動與電池','powertrain','P00-powertrain-r1.png','原創電動配置；外形、固定座、接頭與散熱路徑需要獨立參考。',[
 ['P01','電池底殼','底板、周框、橫樑與密封槽','P01-pack-case-r1.png'],['P02','電池上蓋','翻邊、固定孔與維修開口','P02-pack-cover-r1.png'],['P03','電池模組','單元、框架與匯流連接','P03-modules-r1.png'],['P04','驅動馬達','殼體、端蓋、轉軸與安裝耳','P04-motor-r1.png'],['P05','減速與差速器','殼體分件與半軸出口','P05-gearbox-r1.png'],['P06','逆變器','外殼、冷板與高壓接頭','P06-inverter-r1.png'],['P07','左右半軸','軸桿、等速接頭與防塵套','P07-driveshaft-r1.png'],['P08','充電接口','插座、盒體、蓋板與線束接口','P08-charge-r1.png']]);
assembly('T00','冷卻與空調','thermal',null,'散熱器、風扇、泵、空調箱與管路依各總成空間接回。',[
 ['T01','前散熱模組','散熱器、冷凝器、風扇與支架','T01-radiator-r1.png'],['T02','冷卻泵與儲液罐','殼體、接頭、支座與可見液面','T02-pump-r1.png'],['T03','空調箱','鼓風機、蒸發器與風門','T03-hvac-r1.png'],['T04','車艙風管','封閉流道及各出風接口','T04-ducts-r1.png'],['T05','管路接頭固定夾','彎管、軟管、密封圈及支承','T05-hoses-r1.png']]);
assembly('E00','配線與附件','electrical',null,'接頭、線束、固定夾與供電盒各自對應安裝位置。',[
 ['E01','低壓線束','分支、接頭、穿線護套與固定夾','E01-harness-r1.png'],['E02','高壓線束','橙色護套、接頭與彎曲路徑','E02-hv-cables-r1.png'],['E03','低壓電池與保險盒','殼體、端子、蓋板與固定架','E03-lv-power-r1.png'],['E04','喇叭與控制器','外殼、接線端與支座','E04-controls-r1.png']]);
const wheel=JSON.parse(await fs.readFile(new URL('source/reference-index.json',out),'utf8'));
assembly('W00','輪端與煞車軸承','rolling','A06-wheel-end-r2.png','沿用輪端既有逐件圖；原圖存在不等於模型已通過。',wheel.map(p=>[p.id,p.name,p.note,path.basename(p.file)]));
assembly('A00','廠房與六工位','factory','GT01-factory-r1.png','廠房首件與六工位已建，設備細部仍需各自參考與近看。',[
 ['A01','門型鋼架與柱腳','I 形柱樑、底板、螺栓與接合板',null],['A02','屋面與採光','板材、檁條、天窗與排水',null],['A03','玻璃展廊與圍護','框、玻璃、牆板與門',null],['A04','車身裝配治具','定位腳、支架與車體支承',null],['A05','塗裝與設備區','圍護、風管與設備殼體',null],['A06','光檢與量測區','光帶、量測台與工作位',null]]);
for(const a of assemblies){
 for(const p of a.parts){if(p.reference){try{const b=await fs.readFile(new URL(p.reference,out));p.status='reference_ready';p.sha256=crypto.createHash('sha256').update(b).digest('hex');}catch(e){if(e.code!=='ENOENT')throw e;p.plannedReference=p.reference;p.reference=null;}}}
 if(a.hero){try{await fs.access(new URL(a.hero,out));}catch(e){if(e.code!=='ENOENT')throw e;a.plannedHero=a.hero;a.hero=null;}}
}
const result={revision:'GT01-REFERENCE-PIPELINE-R2',generatedAt:new Date().toISOString(),authority:'AUTHOR_DESIGN_NOT_MEASURED',assemblies};
await fs.writeFile(new URL('source/vehicle-reference-index.json',out),JSON.stringify(result,null,2));
console.log(JSON.stringify({assemblies:assemblies.length,parts:assemblies.reduce((n,a)=>n+a.parts.length,0),ready:assemblies.reduce((n,a)=>n+a.parts.filter(p=>p.reference).length,0),assemblySheets:assemblies.filter(a=>a.hero).length}));
