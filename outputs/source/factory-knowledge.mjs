/** Single consumer-owned teaching registry. Geometry rows are read from the rendered objects. */
export const FACTORY_SITE={id:'SITE-GT01',name:'GT01 製造工坊',units:'mm',axes:'X 沿六站生產線；Y 由前廊往後場；Z 向上',bounds:[[-21000,-12000,0],[21000,12000,8500]],revision:'FACTORY-R3-TEACHING',status:'WORK_IN_PROGRESS',release:false};
export const FACTORY_ZONES=[
 {id:'Z-GALLERY',name:'成果展示與接待',box:[-21000,-12000,21000,-8500],purpose:'看原生零件、首件、材質與製作紀錄；由物件進入教材。'},
 {id:'Z-ASSEMBLY',name:'六站裝配線',box:[-18000,-8000,18000,2500],purpose:'依相依順序由結構、底盤、車身、座艙到精整與檢驗。'},
 {id:'Z-TRANSFER',name:'轉運走道',box:[-21000,2500,21000,5500],purpose:'分開作業與物流；目前名義寬 3000 mm，實際搬運包絡需另驗。'},
 {id:'Z-SUPPORT',name:'收料、倉儲與支援',box:[-21000,5500,21000,12000],purpose:'供應、表面處理、玻璃、內裝、量測、隔離與返工。'},
 {id:'Z-BUILDING',name:'建築與公用設施',box:[-21000,-12000,21000,12000],purpose:'基礎、承重骨架、圍護、排水、照明、走線與設備接口。'}
];
const theory=(id,name,re,use,assembly,check,limits)=>({id,name,re,use,assembly,check,limits});
export const FACTORY_FAMILIES=[
 theory('LEAF','葉片與葉柄','葉片|葉柄','薄殼承接葉脈與表面反射；葉柄把葉片基部接到枝條。','先採樣枝幹曲線 C(t)，葉柄起點等於 C(t)；末端作為葉片基點。用旋轉矩陣把葉片局部 +Y 對齊生長方向。','核對接點距離、正背法線、0.35 mm 名義視覺厚度、輪廓與葉脈方向；從側面確認不是平貼圖。','葉背材質與弧度為作者重建；未建立維管束與生長模型。'),
 theory('STEM','枝幹','主莖|木質','以連續曲線連接根土與葉節。','以 Catmull–Rom 曲線掃掠截面；葉節共用同一曲線參數，不能另用直線插值猜位置。','C(t) 與葉柄端點誤差應在浮點容差內；看根部入土深度及枝幹連續性。','樹皮、變徑與分枝層級仍未完整還原。'),
 theory('POT','盆器、內盆與托盤','陶盆|育苗|托盤|根土|表土|長盆','承土、收納內盆與控制水的去向。','以半徑–高度剖面旋轉成壁；托盤→陶盆→內盆→根土→枝葉。長盆以底及四壁成殼。','剖面檢查內外壁、口緣與 Ø24 排水孔；抽出方向必須離開上一件的包絡。','排水、根系及陶器成形收縮未驗證。'),
 theory('TUBE','管材與中空骨架','方管|square-tube|主框|上框','用封閉截面的連續管壁形成支承路徑。','外截面減內截面後沿軸擠出；在接口裝入端板或焊接，先定位再固定。','A = A外 − A內；內孔不可填實。讀實際壁厚、端口、垂直度與支承接觸。','承載、焊縫與公差未完成；外觀不代表結構合格。'),
 theory('FRAME','樑柱與加勁連接','I section|haunch|knee|splice|eaves|tension rod|gantry|bridge beam|bridge upright','把上部作用經樑、柱、連接件傳到基座。','I 形截面由翼板與腹板構成；先立柱、接斜樑、加腋與斜撐，再設次構件。','核對截面、對接面、螺栓孔軸及荷重路徑；ΣF=0、ΣM=0 只是平衡前提，仍須材料與邊界條件。','現有部分固定件僅外形；尚無結構設計驗算或建築放行。'),
 theory('FASTENER','螺栓、螺釘、墊圈與錨固','bolt|nut|washer|anchor|螺|墊圈|固定座|腳底板|base plate','把界面夾緊、限制分離或提供可調位置。','先核對孔徑、螺距、螺紋種類與工具空間；墊圈接觸支承面，再旋入及受控預緊。','間隙 c=(D孔−D軸)/2；長孔方向與活動軸一致。檢查頭下接觸、牙合長度與邊距。','廠房五金多仍是外觀候選，未具備牙形、扭矩或承載資格；不能套用已完成的 M5 零件結論。'),
 theory('GLASS','玻璃、窗框與密封','glass|glazing|mullion|transom|玻璃','以透明圍護分隔空間，讓活動與成果可見。','框定位→承托墊塊→玻璃→壓條與密封；玻璃與金屬需有指定接觸層。','幾何厚度等於光學 thickness，物件 scale=1；F0=((n1−n2)/(n1+n2))²。看正視、斜視及邊緣。','框內墊塊、密封細節與夾層結構未全部建立；安全性能未驗。'),
 theory('CLADDING','牆板、屋面與收邊','cladding|wall|roof|purlin|ridge cap|gable|panel|fascia|ceiling','圍護空間、把水導往外側，將面材固定在次骨架。','次骨架→面板→搭接與固定件→收邊→密封。剖面需看出外皮、芯層與內皮。','檢查搭接方向、孔位、穿透處及屋脊屋簷連續；斜率 Δz/水平距離決定排水方向。','目前多為整體面板外形；分層、固定孔與防水接口尚缺，不能稱已可施工。'),
 theory('FLOOR','地坪、塗層與接縫','slab|wearing|joint|epoxy|limestone|floor|地坪','提供定位基準、承托設備與分隔物流。','基层與面層分開定義；依基準放線，再配置接縫、設備基座和動線標記。','水平面方程 n·(p−p0)=0；確認物件支承底面與地坪無浮空或埋入；伸縮縫不以顏色代替凹槽驗證。','鋼筋、基底、排水坡與地耐力未建；此場景不是土建施工圖。'),
 theory('DRAIN','水與氣的通道','gutter|downpipe|duct|exhaust|filter|louvre|grate|extraction|weather','提供排水、排氣或捕集的連續通路。','入口→通道→轉接→過濾／收集→出口；維修件須留拆出方向。','通路必須真的中空；截面 A 與流量 Q 以 v=Q/A 相連，但必須有流量、阻力與邊界資料。','現有部分管件仍為實心掃掠；風量、壓損與防火性能未驗。'),
 theory('LIGHT','燈具與走線','light|LED|luminous|cable tray|diffuser|燈','照明讓形狀、表面缺陷與作業區可辨識。','固定座→懸吊→殼體→光源板→擴散罩；線材沿橋架回到供電接口。','反射環境擷取範圍要含燈；本場景 mm 尺度使用 far=50000。檢查直射、反射和遮擋分別有效。','發光材質不等於真實照度；驅動電源、配線及照度計算未建。'),
 theory('DRAWER','抽屜、櫃體與滑軌','抽屜|drawer|cabinet|shelf|rack|tote|料盒','把物件有序承托，並提供可取用的開口。','櫃背／側／底→固定軌→抽屜底側後前板→活動軌→前板與把手；抽屜沿單一導向軸滑入。','空腔可見；行程向量與軌道平行。檢查插入全路徑、止擋、承載接觸與鄰抽干涉。','新工作臺已有分離薄板與滑軌；倉儲料盒等仍有實心簡化，滾珠與止擋未建。'),
 theory('TIMBER','木板與順紋構件','oak|timber|wood|橡木|木|work surface|counter top|deck board','提供接觸表面與家具支承；表面紋理必須跟隨構件方向。','沿局部長軸配置木紋；先骨架，再用容許木材橫紋變化的接口固定桌面。','局部 uv = 長度座標/貼圖週期；橡木800 mm週期為作者選值。檢查端面、封邊和轉角。','端木年輪、含水率、濕脹及接榫未完成；色圖不是材料證明。'),
 theory('TOOL','手工具與夾持工具','扳手|起子|虎鉗|vice|spanner|driver|hand-tool|tool grip|toolboard|工具','轉動固定件、定位工件或施加受控夾持。','工具頭→傳力桿→握持面；虎鉗固定座→導向滑塊→活動鉗口→絲桿與旋柄。','扳手環孔要貫穿、起子末端要有實際刃型；虎鉗夾口對向且保留行程。','虎鉗牙形、工具掛板孔列、材料強度與工具配合尺寸待驗。'),
 theory('FURNITURE','座椅、桌面與軟包','chair|upholstery|armrest|lounge|seat|padded|reception|table pedestal','讓訪客停留、閱讀與比較成果；人體接觸面需有合理曲面。','承重骨架→彈性層→泡棉→裁片縫線→包覆固定；座椅支腳需接到骨架。','曲率與輪廓多角度一致；織物方向隨裁片、紋理比例不能因拉伸改變。','目前只有外部包覆殼與腳件；內架、泡棉分層、縫線與固定件尚未完成。'),
 theory('PAPER','圖紙、標籤與展示架','紙張|DOC-|資料架|資訊板|導覽|Sign|label|screen|terminal','把身份、用途、順序及結果交給下一位操作者。','紙張基材→印刷面→支架／夾具；圖上零件編號必須能找到實物及原生資料。','A0 841×1189、A4 210×297、A7 105×74 mm；本模型紙厚0.12 mm。近看字能讀、版次能追。','螢幕和紙張不是同一材料；列印色彩與紙張實測光學未驗。'),
 theory('MOBILITY','腳輪、升降與定位','caster|lift|scissor|locator|alignment|fixture|jig|pad|platform|carrier|trolley','在物流與作業間支承、移動或定位物件。','機座→軸承／轉軸→移動構件→接觸墊→工件；固定與活動關係需分開。','輪軸同軸、接地面相切；靜力平衡及運動自由度不能由擺放圖片推定。','多數設備僅外觀配置，內部軸承、驅動、鎖止及負載尚缺。'),
 theory('BOUNDARY','護欄、網片與門','fence|mesh|gate|door|latch|entrance|opening|rail','標示空間邊界、提供通行或隔離位置。','立柱→框→網片／門扇→鉸鏈與鎖扣→地面接口。','孔洞是真空間；門扇需能旋轉且不穿鄰件；通行淨空用實際包絡檢查。','現有隔離門鉸鏈與實際開啟路徑未完成；不是安全設施驗收。'),
 theory('STORAGE','箱、棧板與包裝','crate|pallet|carton|container|band|receiving','保存身份、承托來料並交給下游工位。','棧木→鋪板→箱體底側蓋→束帶及標籤；箱內物件與外箱分開記帳。','外包絡用於動線；材料壁厚、空腔與插叉方向需另查。','箱內內容物及綁固工法尚未具體化。'),
 theory('GENERIC','待細化的構件','.*','依所屬總成的用途承接局部形狀；此分類不表示完成。','先補獨立多視圖、接口和材料層，再定義裝入方向與相依件。','核對用途、形體、孔洞、接觸與可逆拆裝；未辨明的功能不能猜作已完成。','目前只能讀到模型中的外觀與位置，需要逐件補齊構造。')
];
const stationOps=[
 ['S1','車體結構','F-B03','F-S2','結構件與基準件','定位後的結構候選',['基準平台','定位座'],['基準面','接合面','支承位置']],
 ['S2','底盤裝配','F-S1','F-S3','結構候選、底盤及輪端件','底盤裝配候選',['升降支承','扭力工具'],['輪端同軸','支承接觸','工具空間']],
 ['S3','車身合裝','F-S2','F-S4','底盤候選與鈑件','車身裝配候選',['定位門架','軌道'],['門縫','板件接面','裝入包絡']],
 ['S4','座艙裝配','F-S3','F-S5','車身候選與內裝','座艙裝配候選',['內裝料架','工作臺'],['支架接口','安裝通路','緊固件存取']],
 ['S5','表面精整','F-S4','F-S6','已裝配的施工候選','表面檢查紀錄',['掠射燈','抽氣設備'],['輪廓連續','材質比例','表面缺陷']],
 ['S6','終線檢驗','F-S5','F-B06','施工候選及全部紀錄','待審核檢查包',['輪下平台','檢查燈架'],['多角度對圖','漏件','功能及來源一致']]
];
export function operationFor(id){const st=stationOps.find(a=>'F-'+a[0]===id);if(st)return{id:'OP-'+st[0],name:st[1],upstream:[st[2]],downstream:[st[3]],input:st[4],output:st[5],tooling:st[6],CTQ:st[7],capacity:1,state:'AUTHOR_LAYOUT_NOT_COMMISSIONED',rework:'F-B07',release:false};
 const ops={
  'F-B01':['來料辨識',['外部來料'],['F-B03'],'待辨識批次','有身份的來料紀錄',['收料棧板'],['件號','版次','數量','外觀']],
  'F-B03':['分類備料',['F-B01'],['F-S1','F-S2','F-S3','F-S4'],'已辨識來料','指定工位套件',['貨架','料盒'],['庫位','相容版次','領用清單']],
  'F-B02':['表面處理',['F-S3'],['F-S5'],'表面待處理候選','表面處理紀錄',['塗裝室','過濾抽氣'],['材料層','遮蔽','通風待設計']],
  'F-B04':['玻璃與密封備裝',['F-B03'],['F-S3'],'玻璃、墊塊與密封件','玻璃安裝套件',['A字架','工作臺'],['曲率','支承點','封膠路徑']],
  'F-B05':['內裝備裝',['F-B03'],['F-S4'],'布皮、支架與裁片','內裝套件',['裁切臺','料架'],['紋向','裁片邊界','接合']],
  'F-B06':['量測與結果比對',['F-S6','EX-D11'],['EX-WELCOME'],'模型／實物與指定判定','具來源的檢查紀錄',['花崗石臺','量測架'],['基準','量測方法','不確定度','結果界線']],
  'F-B07':['隔離與返工',['F-B06','F-S1','F-S2','F-S3','F-S4','F-S5','F-S6'],['F-B06'],'不符合項及來源證據','已修正且重驗的紀錄',['隔離籠','紅牌箱'],['缺陷位置','原因','修正版本','相同條件重驗']],
  'EX-D11':['把手十件首件檢查',['EX-PARTS'],['F-B06'],'原生十件首件','待審首件紀錄',['承托墊','逐步剖視'],['上插軸套','肩銷孔口','D形接面','彈簧接觸']],
  'EX-PARTS':['逐件來源與形體對照',['F-B03'],['EX-D11'],'十二種原生零件','逐件比對紀錄',['等比例托盤','零件圖冊'],['形狀','尺寸','接口','修訂']],
  'EX-WHEEL':['輪端展示與追溯',['F-S2'],['F-B06'],'輪端模型與參考','輪端比對紀錄',['輪端基座'],['五組雙輻','孔位','胎面','裝配']],
  'EX-WELCOME':['入場與選路',['入口'],['EX-PARTS','EX-WHEEL'],'新操作者','已選定位置與任務',['導覽牌','廠房圖冊'],['目標','目前位置','下一作業']]
 };const a=ops[id];return a?{id:'OP-'+id,name:a[0],upstream:a[1],downstream:a[2],input:a[3],output:a[4],tooling:a[5],CTQ:a[6],capacity:id.startsWith('EX-')?1:null,capacityStatus:id.startsWith('EX-')?'ONE_DISPLAY_STATION':'NOT_COMMISSIONED',state:'REVIEW_REQUIRED',rework:'F-B07',release:false}:null;
}
export function familyFor(name){return FACTORY_FAMILIES.find(f=>new RegExp(f.re,'i').test(name));}
function digestName(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return(h>>>0).toString(36);}
export function bindFactoryKnowledge(T,f){
 const all=[...f.parts,...(f.exhibits||[]),...(f.plants||[])],objects=new Set(all.map(p=>p.object)),entries=[],owners=[],handles=new Map();f.root.updateMatrixWorld(true);
 for(const p of all){const g=p.object,zone=p.id.startsWith('EX-')||p.id.startsWith('F-G')||p.id.startsWith('F-PLANT')||p.id.startsWith('F-CHAIR')||p.id.startsWith('F-LOUNGE')||p.id==='F-RECEPTION-DESK'||['F-002','F-005','F-006'].includes(p.id)?'Z-GALLERY':p.id.startsWith('F-S')?'Z-ASSEMBLY':p.id==='F-008'?'Z-TRANSFER':p.id.startsWith('F-B')?'Z-SUPPORT':'Z-BUILDING';
  const b=new T.Box3().setFromObject(g),ids=[],counts=new Map(),reference=g.userData.reference||g.userData.source||'references/GT01-factory-r1.png';
  g.traverse(o=>{if(!o.isMesh)return;for(let q=o.parent;q&&q!==g;q=q.parent)if(objects.has(q))return;
   for(let i=0;i<(o.isInstancedMesh?o.count:1);i++){const name=o.isInstancedMesh?(o.userData.members?.[i]?.name||o.name):o.name,key=digestName(name),n=(counts.get(key)||0)+1;counts.set(key,n);const id=p.id+'~'+key+'-'+n,matrix=o.matrixWorld.clone();if(o.isInstancedMesh){const m=new T.Matrix4();o.getMatrixAt(i,m);matrix.multiply(m);}if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const bb=o.geometry.boundingBox.clone().applyMatrix4(matrix),family=familyFor(name),mat=Array.isArray(o.material)?o.material[0]:o.material;const row={id,owner:p.id,name,family:family.id,units:'mm',centre:bb.getCenter(new T.Vector3()).toArray(),worldBounds:[bb.min.toArray(),bb.max.toArray()],worldExtent:bb.getSize(new T.Vector3()).toArray(),matrix:matrix.toArray(),material:mat.userData.materialId||mat.name||'作者指定材料',geometryType:o.geometry.type,instances:o.isInstancedMesh?o.count:1,instanceIndex:o.isInstancedMesh?i:null,feature:(o.isInstancedMesh?o.userData.members?.[i]?.metadata:o.userData)?.feature||null,status:'MODELED_NOT_QUALIFIED'};entries.push(row);ids.push(id);handles.set(id,{object:o,instanceIndex:row.instanceIndex,row});}
  });
 const op=g.userData.operation||operationFor(p.id);if(op){op.upstream=[].concat(op.upstream||[]);op.downstream=[].concat(op.downstream||[]);g.userData.operation=op;}owners.push({id:p.id,name:p.name||g.name,zone,centre:b.getCenter(new T.Vector3()).toArray(),bounds:[b.min.toArray(),b.max.toArray()],reference:reference.replace('../references/','references/'),referenceCoverage:/Workbench|Ficus/.test(reference)?'AUTHOR_ASSEMBLY_REFERENCE':'GENERAL_SCENE_REFERENCE_ONLY',operation:op,objectIds:ids,definition:g.userData.definition||null,pending:g.userData.pending||[],status:'WORK_IN_PROGRESS'});g.userData.knowledge={siteId:FACTORY_SITE.id,zoneId:zone,ownerId:p.id,objectCount:ids.length,guide:'GT01-factory-guide.html#'+p.id};
 }
 const data={schema:'GT01-factory-knowledge/v1',site:FACTORY_SITE,zones:FACTORY_ZONES,families:FACTORY_FAMILIES.map(({re,...v})=>v),owners,objects:entries,claims:{covers:'Every rendered mesh occurrence inside registered factory assemblies, including instances and exhibits',doesNotCover:['Unmodeled internal parts','Vehicle stage internals; see vehicle/parts library'],manufacturingCertified:false,photorealAccepted:false}};
 f.knowledge={data,handles,owners:new Map(owners.map(o=>[o.id,o]))};return f.knowledge;
}
