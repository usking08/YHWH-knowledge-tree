import fs from 'node:fs/promises';import crypto from 'node:crypto';
const out=new URL('../outputs/',import.meta.url),file=new URL('source/vehicle-reference-index.json',out);
const data=JSON.parse(await fs.readFile(file,'utf8'));
const top=id=>data.assemblies.flatMap(a=>a.parts).find(p=>p.id===id);
function leaf(id,name,role,quantity=1){return {id,name,role,quantity,kind:'component',disassemblyBoundary:'single_formed_or_continuous_material',status:'pending',reference:null,plannedReference:`references/${id}-r1.png`,reviewState:'not_verified'};}
function branch(id,name,role,rows){return {id,name,role,kind:'subassembly',status:'pending',reference:null,plannedReference:`references/${id}-assembly-r1.png`,parts:rows,reviewState:'not_verified'};}
function expand(id,rows){const p=top(id);if(!p)throw Error('Missing parent '+id);p.kind='subassembly';p.parts=rows;p.reviewState='not_verified';p.reviewNote=(p.reviewNote||'')+' 此項為子總成，不能當成拆解到底。展開後逐件製圖、建形與回裝。';}
expand('D05',[
 leaf('D05-P01','前導軌','沖壓通道、返邊、上下滑輪軸孔與固定耳'),leaf('D05-P02','後導軌','與前軌共用玻璃運動方向；固定座位置不同'),
 leaf('D05-P03','前滑座','包住導軌返邊；鋼索端座與玻璃夾座接口'),leaf('D05-P04','後滑座','後導軌接觸面及兩個鋼索端座'),
 leaf('D05-P05','導向滑輪','中央通孔、輪緣鋼索槽與端面肋',4),leaf('D05-P06','滑輪軸銷','肩部、鉚接端與滑輪支承面',4),leaf('D05-P06-washer','滑輪止推墊圈','軸孔、雙接觸面及端面間隙',8),
 branch('D05-P07','下行鋼索','捲筒經前下滑輪連到前滑座',[
  leaf('D05-P07a','下行索芯','連續鋼絲索；端部留壓接長度'),leaf('D05-P07b','鋼索壓接端頭','鋼索端部嵌入滑座的圓柱頭',2),leaf('D05-P07c','下行外套管','包覆導管及端部定位肩'),leaf('D05-P07d','套管端套','管端固定與彈簧定位',2)]),
 branch('D05-P08','交叉鋼索','前滑座經前上滑輪、後下滑輪連到後滑座',[
  leaf('D05-P08a','交叉索芯','連續索段，兩端由滑座固定'),leaf('D05-P08b','交叉索端頭','索芯壓接端頭',2),leaf('D05-P08c','交叉套管','跨門體的保護及路徑約束')]),
 branch('D05-P09','上行鋼索','捲筒經後上滑輪連到後滑座',[
  leaf('D05-P09a','上行索芯','連續索段'),leaf('D05-P09b','上行索端頭','索芯壓接端頭',2),leaf('D05-P09c','上行套管','套管端部與捲筒座配合')]),
 leaf('D05-P10','鋼索捲筒','雙向螺旋繩槽、端頭容納槽及驅動花鍵'),leaf('D05-P11','捲筒下殼','軸承座、鋼索出口及馬達配合面'),leaf('D05-P12','捲筒上蓋','周界壓邊、固定柱與鋼索限位'),leaf('D05-P13','索端張力彈簧','壓縮彈簧，兩端承托面',2),
 branch('D05-P14','驅動馬達與減速機','馬達、蝸桿、齒輪與捲筒輸出配合',[
  leaf('D05-P14a','馬達金屬杯殼','拉深殼、端蓋配合與固定耳'),leaf('D05-P14b','永磁片','內壁弧形磁片',2),leaf('D05-P14c','電樞軸','前後軸承頸與蝸桿驅動端'),leaf('D05-P14d','電樞疊片','齒槽、軸孔與疊片外形'),leaf('D05-P14e','繞組導線','槽內線圈及引線'),leaf('D05-P14f','換向器','分段導電面與軸配合'),leaf('D05-P14g','電刷','碳刷接觸面',2),leaf('D05-P14h','電刷彈簧','五圈連續鋼線及低節距端圈',2),leaf('D05-P14i','電刷架端蓋','刷槽、軸支承與接頭座'),leaf('D05-P14j','蝸桿','螺旋齒面、軸端接口'),leaf('D05-P14k','減速蝸輪','輪齒、輪轂與輸出接口'),leaf('D05-P14l','減速箱殼','軸座、固定耳與薄壁空腔'),leaf('D05-P14m','減速箱蓋','密封邊、固定孔與端面'),leaf('D05-P14n','輸出襯套','貫通軸孔及止推端面'),leaf('D05-P14o','接頭端子','導電片、定位肩與壓接腳',2),leaf('D05-P14p','殼體固定螺釘','螺紋、螺頭及工具槽',3)]),
 branch('D05-P15','玻璃夾座','玻璃下緣的可拆夾持接口',[
  leaf('D05-P15a','夾座固定半體','與滑座固定、玻璃支承面',2),leaf('D05-P15b','夾座活動壓片','壓緊面與螺孔',2),leaf('D05-P15c','夾座橡膠墊','兩玻璃接觸面與防滑紋',4),leaf('D05-P15d','夾緊螺栓','M5 螺旋牙面、圓柱頭及六角工具凹槽',4),leaf('D05-P15e','夾座螺帽','M5 貫通內螺紋與六角外形',4),leaf('D05-P15f','滑座連接螺栓','M8 螺紋、低圓柱頭與工具凹槽',2),leaf('D05-P15g','滑座連接墊圈','8.5 mm 貫通孔、雙承壓面及倒角',2),leaf('D05-P15h','玻璃底緣承墊','獨立 EPDM 底緣支承，玻璃不直接接觸金屬',2)]),
 leaf('D05-P16','導軌固定螺栓','固定耳與內門板對位',4),leaf('D05-P17','捲筒固定螺釘','上蓋與下殼對位',3),leaf('D05-P18','導軌端擋','滑座運動端部緩衝',4)
]);
expand('D07',[
 leaf('D07-P01','門鎖承載金屬板','安裝孔、鎖扣入口與樞軸孔'),leaf('D07-P02','鎖體外殼','內腔、密封邊及拉索入口'),leaf('D07-P03','鎖體蓋','周界卡扣與螺釘孔'),leaf('D07-P04','旋轉鎖爪','鎖扣容納口與止動齒'),leaf('D07-P05','止動棘爪','接觸齒面、軸孔與操作臂'),leaf('D07-P06','鎖爪樞軸','肩部與端面'),leaf('D07-P07','棘爪樞軸','支承面與固定端'),leaf('D07-P08','鎖爪扭簧','雙支腳與中圈'),leaf('D07-P09','棘爪扭簧','回位支腳與軸圈'),leaf('D07-P10','釋放連桿','拉索座、轉軸孔與接觸端'),leaf('D07-P11','內開拉索芯','連續索段與端點'),leaf('D07-P12','內開拉索套管','套管與端部支承'),leaf('D07-P13','拉索端頭','圓柱端頭與索芯孔',2),leaf('D07-P14','鎖體密封','外殼周界墊'),leaf('D07-P15','固定螺釘','螺紋、頭型及工具槽',3),branch('D07-P16','電動鎖止驅動','馬達驅動鎖止撥臂',[
 leaf('D07-P16a','驅動殼','齒輪軸座與安裝孔'),leaf('D07-P16b','驅動蓋','殼蓋配合邊'),leaf('D07-P16c','輸出齒輪','輪齒與撥臂軸孔'),leaf('D07-P16d','鎖止撥臂','輸入孔、止擋與連桿端'),leaf('D07-P16e','微動開關簧片','接觸片與定位片'),leaf('D07-P16f','接頭外殼','端子孔與鎖扣')])]);
expand('D08',[
 leaf('D08-P01','上鉸鏈車身葉片','車身固定孔、軸套座及止擋'),leaf('D08-P02','上鉸鏈門側葉片','門側固定孔與軸座'),leaf('D08-P03','下鉸鏈車身葉片','下方固定孔與軸座'),leaf('D08-P04','下鉸鏈門側葉片','下方門體接合'),leaf('D08-P05','鉸鏈銷軸','肩部、支承段與固定端',2),leaf('D08-P06','鉸鏈襯套','薄壁通孔與端緣',4),leaf('D08-P07','止推墊片','環形接觸面',4),leaf('D08-P08','銷軸卡環','槽內止退與鉗孔',2),leaf('D08-P09','鉸鏈固定螺栓','頭部、肩部與螺紋',8)]);
expand('D09',[
 leaf('D09a','內飾承載板','一體成形背肋、孔、螺柱與卡扣座'),leaf('D09b','上沿包覆基體','曲面與固定接點'),leaf('D09b-cover','上沿軟質蒙皮','包覆裁片與折邊'),leaf('D09c','棕色皮革插片','裁片邊界與縫份'),leaf('D09c-foam','插片泡棉襯層','皮革與基板之間的成形襯墊'),
 branch('D09d','拉手與肘托','骨架、泡棉與皮革分別組裝',[leaf('D09d-core','拉手承載骨架','斜臂、水平肘托、固定柱與背肋'),leaf('D09d-foam','拉手泡棉','承接骨架的薄層包覆'),leaf('D09d-cover','拉手皮套','分片、縫線與包邊'),leaf('D09d-screw','拉手固定螺釘','由承載板背面鎖入骨架',2)]),
 leaf('D09e','金屬飾條','成形斷面、弧度及背面扣腳'),
 branch('D09f','車窗開關','按鍵、支架、觸點與電路板分件',[leaf('D09f-bezel','開關嵌框','按鍵開口、卡扣與止擋'),leaf('D09f-key','車窗按鍵帽','搖臂軸耳與符號凹槽',2),leaf('D09f-axle','按鍵轉軸','圓柱支承與端部限位',2),leaf('D09f-spring','按鍵回位彈簧','支腳與定位',2),leaf('D09f-contact','開關接觸片','接觸點與彈性支腳',2),leaf('D09f-board','開關電路板','固定孔、接頭與元件位置'),leaf('D09f-case','開關底殼','內壁肋與連接器開口')]),
 leaf('D09g','儲物袋內襯','真正中空的袋體與成形邊緣'),leaf('D09h','揚聲器網罩','實際穿孔與周界扣腳'),leaf('D09i-clip','內飾板塑膠卡扣','彈性腿、止擋與固定頭',12),leaf('D09i-socket','卡扣承接座','門內板孔的固定座',12),leaf('D09i-screw','內飾固定螺釘','螺頭、工具槽與螺紋',4),leaf('D09i-pad','隔音防震墊','接觸面與厚度',6)]);
expand('D11',[
 leaf('D11-P01','外把手面板','原車齊平外形、握持面與背面固定座'),leaf('D11-P02','把手承載盒','內腔、門皮密封與固定耳'),leaf('D11-P03','把手轉軸','肩部與止退槽'),leaf('D11-P04','回位扭簧','中圈與兩支腳'),leaf('D11-P05','拉索操作撥臂','轉軸孔與拉索座'),leaf('D11-P06','把手密封墊','盒體外緣與門皮之間'),leaf('D11-P07','把手固定螺釘','螺頭與螺紋',2),leaf('D11-P08','把手止擋塊','彈性接觸面')]);
expand('D12',[
 leaf('D12-P01','門洞主密封條','連續中空唇口及固定根部'),leaf('D12-P02','外腰線刮水條','玻璃外側柔性唇口與骨架'),leaf('D12-P03','內腰線刮水條','玻璃內側柔性唇口與固定腳'),leaf('D12-P04','玻璃前導槽','玻璃運動導向與密封斷面'),leaf('D12-P05','玻璃後導槽','後緣運動導向與密封斷面'),leaf('D12-P06','門底排水塞','排水出口與固定唇',2)]);
expand('S07',[
 leaf('S07-HEAD-FRONT','頭枕前裁片','中央縫線與上下邊界'),leaf('S07-HEAD-SIDE','頭枕側襠裁片','前後片之間的曲邊',2),leaf('S07-HEAD-BACK','頭枕後裁片','保留母件的棕色頭枕背面'),leaf('S07-THORAX','上背裁片','肩部至腰部接縫'),leaf('S07-LUMBAR','腰部裁片','腰部曲面與縫份'),leaf('S07-LOWER','下背裁片','椅背下沿與固定邊'),leaf('S07-BOLSTER','椅背側翼裁片','左右側翼曲面',2),leaf('S07-LISTING','皮套固定帶','底緣固定織帶',2),leaf('S07-SEAM','縫合線','連續縫線路徑')]);
expand('S03',[
 leaf('S03-L01','下固定導軌','折返通道、外側安裝腳與通孔',2),leaf('S03-U01','上活動導軌','嵌入下軌的翻邊及座架固定孔',2),leaf('S03-B01','滾珠','滾道中的獨立球體；實際數量待圖紙確定'),leaf('S03-C01','滾珠保持架','球袋、限位腳與導向邊',4),leaf('S03-K01','鎖止齒梳','齒列、轉軸孔與解鎖接點',2),leaf('S03-R01','鎖止回位彈簧','兩支腳承接固定件和活動件',2),leaf('S03-P01','鎖止樞軸','同軸樞轉支承及止退段',2),leaf('S03-E01','導軌端擋','插入端部的防脫止擋',4),leaf('S03-H01','解鎖連動桿','左右連動與手握段'),leaf('S03-F01','導軌固定螺栓','外側安裝腳固定，避開運動通道',4)]);
expand('S04',[leaf('S04-P01','調角固定盤','內齒、固定耳與中心孔',2),leaf('S04-P02','調角活動盤','與椅背接合及同軸中心孔',2),leaf('S04-P03','鎖止棘塊','接觸齒與導向槽'),leaf('S04-P04','解鎖凸輪','中央軸孔與棘塊接觸面'),leaf('S04-P05','回位彈簧','凸輪預緊與固定支腳'),leaf('S04-P06','調角連接軸','左右調角器共同旋轉基準'),leaf('S04-P07','止退環','保持盤體軸向關係',2),leaf('S04-P08','解鎖手柄','握持與軸端配合')]);
expand('S08',[leaf('S08-CENTER','座墊中央裁片','承坐曲面與前橫縫'),leaf('S08-FRONT','座墊前緣裁片','前緣下折邊'),leaf('S08-BOLSTER','座墊側翼裁片','與側翼泡棉曲面匹配',2),leaf('S08-SKIRT','座墊裙邊裁片','下包邊與固定舌'),leaf('S08-LISTING','座墊固定帶','底面固定織帶'),leaf('S08-SEAM','座墊縫線','連續縫合路徑')]);
expand('S11',[leaf('S11-P01','帶扣金屬支架','帶舌入口、鎖止承台與固定孔'),leaf('S11-P02','帶扣外殼','內腔與周界卡扣'),leaf('S11-P03','帶扣後蓋','與外殼閉合邊'),leaf('S11-P04','紅色釋放鍵','導向腳及鎖片接點'),leaf('S11-P05','鎖止片','卡住帶舌的接觸齒'),leaf('S11-P06','釋放彈簧','壓縮回位及端承托'),leaf('S11-P07','扣座織帶','連續編織帶'),leaf('S11-P08','扣座螺栓','固定肩、螺紋與螺頭')]);
for(const [id,file] of [['D05-P03','D05-P03-r4.png'],['D05-P04','D05-P03-r4.png'],['D05-P10','D05-P10-r2.png'],['D05-P06','D05-P06-r4.png']]){const p=top('D05').parts.find(p=>p.id===id);p.plannedReference='references/'+file;}
top('D05').parts.find(p=>p.id==='D05-P04').sharedPartDefinition='D05-P03';
const clamp=top('D05').parts.find(p=>p.id==='D05-P15');
const drive=top('D05').parts.find(p=>p.id==='D05-P14');
drive.parts.find(p=>p.id==='D05-P14d').quantity=56;
drive.parts.push(leaf('D05-P14q','後端含油軸套','杯殼內伸座的獨立軸套；貫通孔與端面倒角'));
drive.assemblyGuide='GT01-motor-assembly.html';
drive.plannedReference='references/D05-P14-core-assembly-r2.png';
drive.parts.find(p=>p.id==='D05-P14f').parts=[leaf('D05-P14f-a','換向器模製絕緣芯','真通孔與十二條一體軸向隔肋'),leaf('D05-P14f-b','獨立換向銅片','接觸弧、一體雙壁接線槽',12)];
drive.parts.find(p=>p.id==='D05-P14f').plannedReference='references/D05-P14f-assembly-r1.png';
for(const p of drive.parts.find(p=>p.id==='D05-P14f').parts)p.plannedReference='references/'+p.id+'-model-r1.png';
drive.parts.push(leaf('D05-P14r','槽絕緣襯片','連續薄壁、開口及槽內配合',12));drive.parts.at(-1).plannedReference='references/D05-P14r-model-r1.png';
drive.quantityNote='目前建形 12 種、93 個實體／門；完整馬達及減速機尚未齊件。56 片疊片各自為一個成形零件。';
for(const [id,file] of [['D05-P14a','D05-P14a-r3.png'],['D05-P14b','D05-P14b-r3.png'],['D05-P14c','D05-P14c-r2.png'],['D05-P14d','D05-P14d-r2.png'],['D05-P14q','D05-P14q-r1.png']])drive.parts.find(p=>p.id===id).plannedReference='references/'+file;
drive.parts.find(p=>p.id==='D05-P14c').views=[{name:'同一軸的六視圖與剖面',reference:'references/D05-P14c-model-r1.png',scope:'same-model geometry, not independent dimensional authority'}];
drive.parts.find(p=>p.id==='D05-P14q').views=[{name:'模型實際軸套剖面',reference:'references/D05-P14q-model-r1.png',scope:'same-model geometry'}];
clamp.assemblyGuide='GT01-clamp-assembly.html';
clamp.assemblyPreconditions=['M8 螺栓與墊圈須在滑座穿入導軌前裝入；導軌腹板阻擋螺栓頭的放置路徑'];
clamp.plannedReference='references/D05-P15-assembly-r4.png';
clamp.parts.find(p=>p.id==='D05-P15a').plannedReference='references/D05-P15a-r3.png';
clamp.parts.find(p=>p.id==='D05-P15b').plannedReference='references/D05-P15b-r2.png';
clamp.parts.find(p=>p.id==='D05-P15c').plannedReference='references/D05-P15c-r3.png';
clamp.parts.find(p=>p.id==='D05-P15c').contactStudy='references/D05-P15-contact-r1.png';
for(const id of ['D05-P15d','D05-P15e']){const p=clamp.parts.find(p=>p.id===id);p.plannedReference='references/'+id+'-model-r1.png';p.reference=null;p.views=[{name:'生成形狀候選／尺寸以原生零件資料核對',reference:'references/'+id+'-r1.png',scope:'author generated candidate; not measured'},{name:'同模型六視圖／螺紋與工具接合',reference:'references/'+id+'-model-r1.png',scope:'source geometry inverse transformed to Y axis for legibility, no shape changes'}];}
clamp.assemblyPreconditions.push('固定座、M8 與滑座從裸導軌上端先入軌；上滑輪、軸銷、止推墊圈及鋼索尚未裝上');
clamp.views=[{name:'模型實際接合剖面：玻璃、橡膠、螺紋與滑座',reference:'quality/glass-clamp-sections.png',scope:'actual instantiated triangle intersections; authored static assembly, not source metrology'}];
clamp.quantityNote='本分支數量涵蓋一扇車門的前後兩個夾座；每個夾座 11 件，一扇車門 22 件。';
clamp.assemblyRelations={quantityScope:'one door',clampStations:2,physicalPartsPerStation:11,glassNormalThickness:4.5,glassSlopeYPerZ:-.55,gripOrigin:[0,-45,169],order:['固定座與滑座中央孔對位','由滑座背面穿入墊圈及 M8 螺栓；固定座為盲螺孔，不加螺帽','兩個橡膠墊定位凸點分別進入固定座與壓片的盲槽','玻璃底緣放在獨立橡膠承墊','兩支 M5 螺栓位於玻璃下方；由壓片穿向固定座，螺帽抵住固定座背面'],validation:'static sampled mesh interfaces only; insertion routes and full window motion remain unverified'};
top('D05').parts.find(p=>p.id==='D05-P03').views=[{name:'模型實際截面：滑座位於行程中央',reference:'quality/regulator-transverse-section.png',scope:'derived mesh section, not an independent dimensional authority'}];
top('D05').views=[{name:'前導軌局部回裝圖',reference:'references/D05-front-guide-assembly-r3.png',scope:'front rail and two pulleys only; not complete regulator'}];
top('D05').assemblyRelations={source:'EP1215065A2 paragraphs 31-40, functional topology only',authorCoordinates:true,frontGuide:{members:[['D05-P01',1],['D05-P05',2],['D05-P06',2],['D05-P06-washer',4]],order:['rivet head','outer washer','pulley hub','inner washer','rail','formed tip of same rivet'],quantityScope:'one front guide unit'}};
top('D05').connections=[{target:'D05-P06',role:'固定頭外側保留；由軸的自由端套入其他零件'},{target:'D05-P06-washer',role:'先套入外墊圈'},{target:'D05-P05',role:'滑輪貫通軸孔沿同一軸線套入'},{target:'D05-P06-washer',role:'再套入內墊圈'},{target:'D05-P01',role:'軸端穿過導軌固定孔；最後在導軌背面鉚合，擴口仍屬於原軸'}];
const brushMotor=top('D05').parts.find(p=>p.id==='D05-P14');
const carrier=brushMotor.parts.find(p=>p.id==='D05-P14i');Object.assign(carrier,{kind:'subassembly',parts:[leaf('D05-P14i-a','一體刷架基板與雙 U 導槽','中央軸孔、引線孔、導槽及彈簧外止擋'),leaf('D05-P14i-b','刷架軸向扣蓋','內勾唇、滑軌配合及外端止擋，防退出卡扣待施工',2),leaf('D05-P14i-c','刷架箱殼定位件','刷架與箱殼固定，待接合定義')],plannedReference:'references/D05-P14-brush-assembly-r2.png'});
for(const id of ['g','h'])brushMotor.parts.find(p=>p.id==='D05-P14'+id).plannedReference='references/D05-P14'+id+'-model-r1.png';
carrier.parts[1].plannedReference='references/D05-P14i-b-model-r1.png';carrier.parts[1].views=[{name:'生成形狀參考／側視和剖面引線待校正',reference:'references/D05-P14i-b-r1.png',scope:'authored generated candidate; not measured'}];brushMotor.assemblyPreconditions=['碳刷及彈簧先從導槽軸向開口放入','兩個扣蓋沿徑向滑軌放入，必須先於杯殼套合','防退出卡扣和箱殼固定尚未完成'];
carrier.parts[0].plannedReference='references/D05-P14i-a-model-r2.png';
brushMotor.parts.find(p=>p.id==='D05-P14g').views=[{name:'生成參考 R2／與實體並排檢查',reference:'references/D05-P14g-r2.png',scope:'authored generated candidate, local proportions still to compare'}];
brushMotor.parts.find(p=>p.id==='D05-P14h').views=[{name:'生成參考／圈數尚未通過',reference:'references/D05-P14h-r1.png',scope:'rejected shape candidate, not construction authority'}];
carrier.parts[0].views=[{name:'生成參考 R2／孔位和導槽方向退修',reference:'references/D05-P14i-a-r2.png',scope:'rejected shape candidate, not construction authority'}];
brushMotor.plannedReference='references/D05-P14-core-assembly-r4.png';(brushMotor.views??=[]).push({name:'電刷、彈簧與刷架實際組合／20 件',reference:'references/D05-P14-brush-assembly-r2.png',scope:'same-model geometry readback, retention incomplete'});
const doorHandle=top('D11');doorHandle.contactStudy='references/D11-return-assembly-r2.png';doorHandle.assemblyGuide='GT01-handle-assembly.html';doorHandle.modelReader='GT01-handle-assembly.html';doorHandle.nativeInstallationStatus='FIRST_ARTICLE_NOT_MOUNTED';doorHandle.reviewNote='十件首件已建，D 形配合、回位彈簧與軸套已組合；完整拉索、止擋、門體固定、預壓與安裝仍待完成。';
doorHandle.parts.push(leaf('D11-P09','E 型止退扣環','獨立開口扣環、止退槽與卡入路徑'),leaf('D11-P10','下止推墊圈','銷軸孔、承壓端面與扣環間距'),branch('D11-P11','軸向支承套件','上、下軸套是兩個可獨立成形零件',[leaf('D11-P11a','下軸套與彈簧導套','孔4.2／外徑5.5／長8.5；支承盒體與撥臂'),leaf('D11-P11b','上軸套','孔4.2／外徑5.5／長11；由上方穿入 Ø5.7 盒孔')]));
const cableHandle=doorHandle.parts.find(p=>p.id==='D11-P05');Object.assign(cableHandle,branch('D11-P05','拉索操作與端接','撥臂、端頭、拉線、套管與固定是不同物件',[leaf('D11-P05a','D 形凹座拉索撥臂','短臂、單平邊凹座、通孔、外通槽與一體彈簧支腳'),leaf('D11-P05b','拉索圓柱端頭','撥臂圓眼內的端頭與拉線接合'),leaf('D11-P05c','外把手拉線','連接外把手撥臂與鎖體的連續鋼索'),leaf('D11-P05d','套管端座','拉線導向與盒體後壁固定'),leaf('D11-P05e','端頭止退件','限制圓柱端頭軸向退出')]));
const handleBuilt=new Set(['D11-P01','D11-P02','D11-P03','D11-P04','D11-P05a','D11-P06','D11-P09','D11-P10','D11-P11a','D11-P11b']);
for(const p of doorHandle.parts.flatMap(p=>p.parts?[p,...p.parts]:[p])){p.assemblyGuide=null;p.nativeInstallationStatus='NOT_BUILT';if(handleBuilt.has(p.id)){const rev=p.id==='D11-P02'?'r3':['D11-P01','D11-P03','D11-P11b'].includes(p.id)?'r2':'r1';p.plannedReference='references/'+p.id+'-model-'+rev+'.png';p.reference=null;p.assemblyGuide='GT01-handle-assembly.html?part='+p.id;p.modelReader=p.assemblyGuide;p.nativeInstallationStatus='FIRST_ARTICLE_NOT_MOUNTED';p.reviewNote='獨立首件已形成，尚未安裝至整車；同模型六視圖是施工讀回，不是獨立量測。';}
const generated={'D11-P01':'D11-P01-r1.png','D11-P02':'D11-P02-r2.png','D11-P04':'D11-P04-r1.png','D11-P05a':'D11-P05-r2.png','D11-P11a':'D11-P11-r1.png','D11-P11b':'D11-P11b-r3.png'}[p.id];if(generated)p.views=[{name:'生成形狀參考／與已修正實體對讀',reference:'references/'+generated,scope:'author shape candidate; inspect view-specific corrections'}];}
doorHandle.views=[{name:'十件首件實際組合',reference:'references/D11-assembly-model-r3.png',scope:'same-model readback, incomplete assembly'},{name:'彈簧、D 形配合與支承接合',reference:'references/D11-return-assembly-r2.png',scope:'same-model contact closeups, not full load verification'}];
for(const a of data.assemblies){a.vehicleQuantity={S00:2,D00:2,W00:4}[a.id]??1;a.quantityNote='子件數量以一份父總成為基準；圖面分區與網格表面不計成額外實體零件。';}
for(const a of data.assemblies){
 async function visit(rows,parent){for(const p of rows){p.parentId=parent;p.kind=p.parts?.length?'subassembly':p.kind||'component';if(p.parts?.length){await visit(p.parts,p.id);p.terminal=false;}else{p.terminal=true;p.reviewState??='not_verified';}if(!p.reference&&p.plannedReference){try{const b=await fs.readFile(new URL(p.plannedReference,out));p.reference=p.plannedReference;p.sha256=crypto.createHash('sha256').update(b).digest('hex');p.status='reference_ready';}catch(e){if(e.code!=='ENOENT')throw e;}}}}
 await visit(a.parts,a.id);
}
data.revision='GT01-REFERENCE-PIPELINE-R3';data.terminalRule='可獨立成形的零件與連續材料件；子總成必須繼續展開，圖、模型與裝配分開驗收。';
await fs.writeFile(file,JSON.stringify(data,null,2));
console.log('Component tree expanded recursively; unverified nodes remain open.');

