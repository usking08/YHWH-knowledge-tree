import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {functions,mechanisms,productRoutes,factoryRoutes,subsystemRoutes} from '../outputs/source/knowledge-concepts.mjs';
const root=path.resolve('outputs'),lib=path.join(root,'parts-library');
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const [shape,math,vehicle,factory,catalog]=await Promise.all(['parts-library/shape-theory.json','parts-library/math-quality.json','source/vehicle-reference-index.json','source/factory-knowledge-data.json','parts-library/catalog.json'].map(read));
const prefix=(s,scope)=>({...s,id:scope+':'+s.id});
const sources=[...shape.sources.map(s=>prefix(s,'shape')),...math.sources.map(s=>prefix(s,'math')),
 {id:'robotics-dof',title:'Modern Robotics · 自由度與拘束',url:'https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-2-degrees-of-freedom-of-a-robot/',scope:'剛體相對自由度與關節；拘束相依時不能直接相減。'},
 {id:'nasa-fasteners',title:'NASA RP-1228 · Fastener Design Manual',url:'https://ntrs.nasa.gov/citations/19900009424',scope:'摘要列出材料、塗層、潤滑、鎖止、墊圈、疲勞與載荷等設計面向；本教材未由摘要採用任何扭矩或尺寸。'},
 {id:'openstax-heat',title:'OpenStax · Mechanisms of Heat Transfer',url:'https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer',scope:'傳導、對流與輻射的區別；作者應用例不是產品散熱驗證。'},
 {id:'openstax-sound',title:'OpenStax · Sound Waves',url:'https://openstax.org/books/university-physics-volume-1/pages/17-1-sound-waves',scope:'聲波與介質振動；未由此採用喇叭尺寸或性能。'}];
const rules=[...shape.theories.map(t=>({...t,id:'shape:'+t.id,sourceIds:t.sourceIds.map(id=>'shape:'+id),relatedRuleIds:t.composesWith.map(id=>'shape:'+id),link:'shape-theory.html#'+t.id,evidenceClass:'EXISTING_SHAPE_LESSON'})),
 ...math.laws.map(l=>({...l,id:'math:'+l.id,sourceIds:l.sourceIds.map(id=>'math:'+id),inputs:l.variables.map(v=>({name:v.symbol+' · '+v.meaning,unit:v.unit})),produces:l.application,pitfalls:l.limitations,link:'math-quality.html#law-'+l.id,evidenceClass:'EXISTING_MATHEMATICAL_LESSON'}))];
const extraSources={hinge:['robotics-dof'],fastener:['nasa-fasteners'],thermal:['openstax-heat'],acoustic:['openstax-sound']};
const enriched=mechanisms.map(m=>({...m,ruleIds:m.ruleIds.map(id=>'shape:'+id),sourceIds:extraSources[m.id]||[],authority:'AUTHORED_FUNCTIONAL_CLASSIFICATION',applications:m.applications.map((a,i)=>({...a,id:m.id+'-application-'+(i+1)}))}));
const nodes=[];
function walk(n,parentId=null,rootId=n.id){
 nodes.push({id:n.id,parentId,rootId,name:n.name,purpose:n.role||n.description||'沿用上層用途；此件用途尚需獨立定義。',kind:n.kind||'assembly',children:(n.parts||[]).map(p=>p.id),quantity:n.quantity??null,terminal:n.terminal??false,terminalScope:n.terminalScope||n.disassemblyBoundary||'來源未界定；不能視為不可再拆證明',status:n.reviewState||n.status||n.modelStatus||'not_verified',receiving:n.receiving||null,dimensions:n.authorDimensions||null,features:n.localFeatures||null,reference:n.reference?'../'+n.reference:null,referenceAuthority:n.referenceEvidenceType||'PROJECT_REFERENCE_NOT_MEASURED_SOURCE',link:'../reference-library.html?part='+encodeURIComponent(n.id),assemblyLink:n.assemblyGuide?'../'+n.assemblyGuide:null,mechanismIds:[],classificationScope:'ANCESTOR_CONTEXT_ONLY',contextMechanismIds:productRoutes[rootId]||[]});
 (n.parts||[]).forEach(p=>walk(p,n.id,rootId));
}
vehicle.assemblies.forEach(a=>walk(a));
// Direct bindings are explicitly authored. A root route is never copied to all leaves as a proven function.
const direct={...productRoutes,...subsystemRoutes,I03:['shell','hinge','fastener','finish'],'I03-P05-01':['shell','fastener'],'I03-P16-01':['shell','fastener'],'I03-P19-01':['hinge'],'I03-P19-02':['hinge'],'I03-P19-03':['hinge'],'I03-P19-04':['hinge'],'I03-P20-01':['hinge'],'I03-P20-02':['hinge'],
 'D05-P07':['transmission'],'D05-P08':['transmission'],'D05-P09':['transmission'],'D05-P14':['transmission','electrical'],'D05-P14f':['electrical'],'D05-P14i':['electrical','shell','bearing'],'D05-P15':['fastener','friction'],'D07-P16':['electrical','transmission','retention'],'D09d':['frame','shell','finish'],'D09f':['electrical','shell'],'D11-P05':['transmission','hinge'],'D11-P11':['bearing','spacing'],
 'I03-P09':['bearing'],'I03-P10':['transmission'],'I03-P11':['shell','transmission'],'I03-P23':['bond'],'I03-P12':['shell'],'I03-P13':['spring','friction'],'I03-P18':['shell','finish'],'I03-P19':['hinge'],'I03-P20':['hinge','retention'],
 'I05-A':['optical','electrical','shell'],'I05-B':['optical','electrical','shell'],'I05-B-P04':['bond'],'I05-B-P05':['optical','shell'],'I05-B-P07':['optical','bond'],'I05-B-P06':['optical','electrical'],'I05-B-P09':['optical'],'I05-B-P10':['optical'],'I05-B-P12':['optical','electrical'],'I05-B-P16':['electrical'],'I05-B-P17':['electrical','retention'],'I05-B-P18':['spring','retention']};
for(const n of nodes){const id=n.id;let ids=direct[id];if(id.startsWith('I03-HF-F01'))ids=['fastener'];else if(id.startsWith('I03-HF-F02'))ids=['spacing','fastener'];else if(id.startsWith('I03-HF-F03'))ids=['spacing'];else if(id.startsWith('I03-HF-S01'))ids=['spacing','retention'];else if(id.startsWith('I03-HF-S02'))ids=['fastener','retention'];if(ids){n.mechanismIds=ids;n.classificationScope='EXPLICIT_COMPONENT_ROLE';}}
const nodeMap=new Map(nodes.map(n=>[n.id,n]));
for(const n of nodes){let ancestor=nodeMap.get(n.parentId);while(ancestor&&!ancestor.mechanismIds.length)ancestor=nodeMap.get(ancestor.parentId);if(ancestor){n.contextMechanismIds=ancestor.mechanismIds;n.contextNodeId=ancestor.id;}else n.contextNodeId=n.rootId;}
const libraryMechanisms={'D11-P01':['hinge','shell'],'D11-P02':['shell','frame'],'D11-P03':['hinge','retention'],'D11-P04':['spring'],'D11-P05a':['hinge'],'D11-P06':['seal'],'D11-P09':['retention'],'D11-P10':['spacing'],'D11-P11a':['bearing','spacing'],'D11-P11b':['bearing','spacing'],'D05-P15d':['fastener'],'D05-P15e':['fastener']};
const libraryParts=catalog.parts.map(c=>({id:c.id,name:c.name,purpose:c.purpose,mechanismIds:libraryMechanisms[c.id]||[],classificationScope:libraryMechanisms[c.id]?'EXPLICIT_COMPONENT_ROLE':'UNCLASSIFIED',link:c.guide,viewer:'parts/'+c.id+'/view.html',reference:c.thumbnail,ruleIds:c.mathematicalQuality.lawIds.map(id=>'math:'+id),status:c.status,openInputs:c.mathematicalQuality.openInputs}));
const products=vehicle.assemblies.map(a=>({id:a.id,name:a.name,purpose:a.description,mechanismIds:productRoutes[a.id]||[],nodeId:a.id,link:'../reference-library.html?part='+a.id,status:a.modelStatus,routeScope:'ASSEMBLY_PURPOSE_NOT_ALL_LEAVES'}));
// Exact-name corrections only. Material-only and unnamed records remain unresolved.
const factoryNameFamily={
 'entry pull handle':'FURNITURE','gallery continuous head beam':'FRAME','aisle dashed line':'PAPER','flow arrow shaft':'PAPER','flow arrow head':'PAPER','electrical outlet enclosure':'STORAGE',
 '下層托板 · 薄板底':'STORAGE','下層托板折邊':'STORAGE','下層托板端折邊':'STORAGE','桌板固定片 · 貫通長孔':'FASTENER','調整腳防滑底墊':'FURNITURE','body contact block':'TOOL','extractor motor lid':'STORAGE','inspection tunnel arch':'FRAME','paint booth base sill':'FRAME','booth observation window':'GLASS','window frame':'FRAME','material roll support':'FRAME','roll stand foot':'FRAME','granite metrology table':'FURNITURE','CMM vertical ram':'TOOL','CMM probe stem':'TOOL','CMM ruby tip':'TOOL','isolated measuring table foot':'FURNITURE','table base':'FRAME','輪端石材基座':'FURNITURE','展示桌支腳':'FRAME','一體面板、背肋與轉軸座':'TOOL','空心承載盒':'STORAGE','肩銷與止退槽':'FASTENER','E 型止退扣環':'FASTENER','周界密封墊':'BOUNDARY','雙切向腳回位扭簧':'TOOL','下軸套與彈簧導套':'TOOL','上軸套':'TOOL','D 形凹座拉索撥臂':'TOOL','D11 防刮承托墊':'FURNITURE'};
const extraFamilies=[
 ['SIGN','標線與方向訊息','optical','以箭頭、線條與位置傳達通道方向。','依通行方向定位，再檢查觀看方向及遮擋。','方向、對比、位置；不是紙張材質分類。'],
 ['ENCLOSURE','設備外殼與蓋','shell','容納與保護內部構件。','先對宿主與開口，再固定殼體。','內外腔、維修開口、通路及固定面。'],
 ['JOURNAL','軸套與導套','bearing','隔開並支承旋轉軸或導向件。','按可進入方向裝入宿主孔，再裝軸。','同軸、間隙、法蘭承壓與可拆方向。'],
 ['ELASTIC','彈簧與回位件','spring','以可變形幾何建立回位或彈性支承。','固定端與活動端分開接合，再設定預壓。','工作行程、端部接觸及彈性模型。'],
 ['SEAL','密封與防塵件','seal','沿指定周界隔離內外。','核對槽、密封唇與壓縮方向，再裝宿主。','連續周界、壓縮、接縫及工況。'],
 ['RETAIN','銷與止退件','retention','以孔軸、扣槽或肩部限制退出。','先解除遮擋，再裝入並建立保持。','卡入路徑、扣槽、軸向間隙及拆卸。'],
 ['MEASURE','量測接觸與導向件','linear','把量測接點沿受控方向送到物件。','建立基準與導向，再安裝探針。','基準、校正、探針補償及不確定度；外形不代表精度。'],
 ['LEVER','把手與撥臂','hinge','把人或拉索的輸入傳到旋轉接面。','先建立轉軸，再接驅動與接收端。','握持、力臂、旋向與活動空間。'],
 ['CONTACT','承托與防滑墊','friction','在宿主與工作物間提供受控接觸。','依承托位置安裝，核對載荷與接觸區。','地材、正向力、防刮、滑動與壓縮。']
].map(([id,name,mechanism,use,assembly,check])=>({id,name,use,assembly,check,limits:'由現有名稱與宿主建立功能分類；性能仍需對應工況與讀回。',mechanismIds:[mechanism]}));
Object.assign(factoryNameFamily,{'aisle dashed line':'SIGN','flow arrow shaft':'SIGN','flow arrow head':'SIGN','electrical outlet enclosure':'ENCLOSURE','extractor motor lid':'ENCLOSURE','空心承載盒':'ENCLOSURE','肩銷與止退槽':'RETAIN','E 型止退扣環':'RETAIN','周界密封墊':'SEAL','雙切向腳回位扭簧':'ELASTIC','下軸套與彈簧導套':'JOURNAL','上軸套':'JOURNAL','一體面板、背肋與轉軸座':'LEVER','D 形凹座拉索撥臂':'LEVER','CMM vertical ram':'MEASURE','CMM probe stem':'MEASURE','CMM ruby tip':'MEASURE','調整腳防滑底墊':'CONTACT','body contact block':'CONTACT','D11 防刮承托墊':'CONTACT'});
const factoryObjects=factory.objects.map(o=>{const family=o.family==='GENERIC'?factoryNameFamily[o.name]||o.family:o.family;return {...o,originalFamily:o.family,family,classificationAuthority:family!==o.family?'AUTHORED_EXACT_NAME_ROUTE':'EXISTING_FAMILY_ROUTE'};});
const families=[...factory.families,...extraFamilies].map(f=>({...f,mechanismIds:f.mechanismIds||factoryRoutes[f.id]||[],classificationScope:f.id==='GENERIC'?'UNCLASSIFIED':'EXPLICIT_FAMILY_ROLE',objectIds:factoryObjects.filter(o=>o.family===f.id).map(o=>o.id)}));
const worked={id:'hinge',title:'鉸鏈：從箱蓋用途追到一個孔口',mechanismId:'hinge',rootPurpose:'讓鞍座箱蓋可開啟取物、可關閉覆蓋，鉸鏈保持共同軸並避免銷退出。停角、回位及上鎖不是目前自由鉸鏈自動具備的功能。',link:'../GT01-console-hinge-assembly.html',reference:'../references/I03-HF-J01-reference-r5.png',referenceScope:'生成圖僅採用層序與材質方向；圖中厚度與輪廓不能量測。',levels:[
 {level:'需求',name:'箱蓋可動、可以取物',responsibility:'先定義開口、開啟範圍、手部與物品通路。'},
 {level:'總成',name:'I03 鞍座',responsibility:'箱體容納物品；箱蓋覆蓋開口；鉸鏈控制相對動作。'},
 {level:'子總成',name:'雙鉸鏈及端部保持件',responsibility:'固定葉與活動葉繞同一軸；套筒、端帽處理軸向保持。'},
 {level:'接面',name:'葉片／宿主、筒孔／銷、端帽／盲孔',responsibility:'分開記錄承壓、旋轉間隙、螺紋接合；不能互相替代。'},
 {level:'零件',name:'葉、銷、螺絲、墊圈、墊片、套筒、端帽',responsibility:'各有接收件、安裝方向、材料分區及可逆拆卸入口。'},
 {level:'特徵',name:'通孔、盲孔、螺紋、倒角、承壓面',responsibility:'特徵屬於零件，不任意把同一塊材料切成假零件。'},
 {level:'規律',name:'剛體變換、間隙、螺旋、接觸與載荷',responsibility:'用實際表面驗證，再另取材料、載荷、公差等輸入。'}],
 parts:nodes.filter(n=>n.assemblyLink==='../GT01-console-hinge-assembly.html'&&n.children.length===0).map(n=>({nodeId:n.id,name:n.name,role:n.purpose,receiving:n.receiving,dimensions:n.dimensions,link:n.link,reference:n.reference,mechanismIds:n.mechanismIds})),
 sequence:[
 {step:1,action:'先建立固定與活動宿主',why:'固定側屬頂板，活動側屬內殼；開蓋時不能一起跟錯宿主。',check:'確認父物件、共同軸與坐標單位；樞軸 [430,0,452] mm，軸向 +Y。'},
 {step:2,action:'固定側由上向下鎖付',why:'依序接合頂板、0.10 mm墊片、2.00 mm葉片、0.40 mm墊圈及螺絲。',check:'螺絲尖443.60、孔底443.00 mm；核對承壓面及孔底間隙。'},
 {step:3,action:'活動側由下向上鎖付',why:'0.30 mm墊圈、2.00 mm葉片、0.10 mm墊片接至內殼盲孔座。',check:'螺絲尖454.80、孔頂455.00、封頂455.70 mm；接座不得穿入上方泡棉。'},
 {step:4,action:'對齊筒節後穿銷，再裝套筒與端帽',why:'銷給出轉軸；端部保持件限制退出。兩者功能分開。',check:'銷外徑4.00、接收筒孔4.40 mm；名義徑向間隙0.20 mm，仍需實際倒角與掃掠檢查。'},
 {step:5,action:'開蓋檢查，再反向拆卸',why:'零位接觸正確不能證明全程可動；拆卸須先解除止退。',check:'移除端帽和套筒，沿 +Y 抽銷；各步記錄仍存在的遮擋物。'}],
 checks:[{title:'開蓋',observed:'49個角度，0–0.96 rad，步長0.02 rad',meaning:'已取樣角度無所測三角面交穿；不是連續掃掠證明。'}, {title:'抽銷',observed:'34組離散取樣',meaning:'對應讀回路徑能抽出；不包含任意工具與手部空間。'}, {title:'止退',observed:'36組軸向試移',meaning:'設計端面阻擋關係有讀回；不是破壞力或疲勞合格。'}],
 failures:[{problem:'筒孔雖然挖空，合併的葉板仍占用孔內空間。',cause:'只檢查單一幾何分段，漏掉材料合併後的完整接收體。',correction:'讓直徑4.40 mm通孔穿過所有相交材料，回讀開蓋與抽銷路徑。'}, {problem:'圓角接座的盲孔從側邊穿出。',cause:'孔深只對平面計算，忽略外緣曲面。',correction:'建立連續局部接座，保留0.70 mm封頂，再檢查上方泡棉空間。'}],
 evidence:[{title:'接合與動作讀回',link:'../quality/console-hinge-readback.json'},{title:'問題圈註與改進',link:'../GT01-car-feedback.html#CF18'},{title:'材質與形體父層品管',link:'../quality/console-parent-R5.md'}]};
const data={schema:'gt01.knowledge-map/1',revision:'KNOWLEDGE-R1',title:'從用途到形體的知識樹',signature:'יהוה',intro:'以用途為根、機構為分枝、接面為連接、零件與形體為葉。從產品向下找責任；從規律向上找可用物件。',
 axes:[{id:'purpose',name:'用途',question:'替誰完成什麼動作或結果？'},{id:'mechanism',name:'機構',question:'靠什麼關係完成？'},{id:'interface',name:'接面',question:'哪兩個實體用哪個面、軸或通路連接？'},{id:'part',name:'零件與特徵',question:'哪一塊材料承擔責任？孔、槽、面作用在哪裡？'},{id:'rule',name:'定理與模型',question:'輸入、單位、前提、結果和失效條件是什麼？'},{id:'industry',name:'產業與物件',question:'哪些規則可轉用？哪些尺寸與工況必須重算？'}],
 functions,mechanisms:enriched,rules,sources,products,nodes,libraryParts,factory:{zones:factory.zones,families,owners:factory.owners,objects:factoryObjects},workedExamples:[worked],
 readerProtocol:[{step:'找用途',instruction:'先寫輸入、輸出、使用者及故障後果；不要先挑一種漂亮形狀。'}, {step:'選機構',instruction:'比較自由度、載荷路徑、開口、通路與拆卸；同一需求可能有不同機構。'}, {step:'落到接面',instruction:'每個關係要有兩側零件ID、局部座標、單位、作用面、方向、間隙與順序。'}, {step:'建立形體',instruction:'用剖面、旋轉、擠出或掃掠構形；材料邊界與可拆邊界分別記錄。'}, {step:'套用規律',instruction:'先核前提再代入；缺少載荷、材料、溫度、公差時，不能由外形得出合格。'}, {step:'驗證與回饋',instruction:'對實際輸出讀回形狀、接觸與路徑；把錯誤位置、原因、修法、版本和重驗範圍一同保存。'}],
 transferSteps:['保留功能與接面角色，先不搬尺寸。','辨認新工況：載荷、尺度、環境、材料、製程、維修與故障後果。','挑選適用模型，列明前提與單位。','重新定尺寸、間隙、固定方式及加工順序。','建模並讀回實體；檢查全程空間與可達性。','把結果及未涵蓋條件寫回這一條應用，不擴大成整個產業認證。'],
 traps:[{false:'長得像圓柱，所以作用相同。',correct:'實心銷限制相對位置；空心套筒隔開或支承；管路則必須有連續內腔及流體介面。'}, {false:'公式有解，所以零件可製造且耐用。',correct:'公式結論只在前提、輸入與邊界成立時有效；製程、承載、磨耗需要各自證據。'}, {false:'均勻放大十倍，所有能力也放大十倍。',correct:'相似幾何長度隨s、面積隨s²、體積隨s³；自重與截面承載尺度不同，載荷模型必須重建。'}, {false:'父總成分類等於每個葉零件分類。',correct:'產品路線只提供祖先脈絡。明確零件用途以 EXPLICIT_COMPONENT_ROLE 記錄；其餘保留 ANCESTOR_CONTEXT_ONLY。'}],
 boundary:'此版整理現有車輛、廠房與零件庫的功能路線。跨產業例子為作者推導，並非所有產業或所有物件的窮盡清單，也不是可直接量產的認證。未逐件綁定的節點不假冒已分類；未驗證仍保留原狀。',
 provenance:await Promise.all(['source/knowledge-concepts.mjs','source/vehicle-reference-index.json','source/factory-knowledge-data.json','parts-library/shape-theory.json','parts-library/math-quality.json','parts-library/catalog.json'].map(async file=>({file:'../'+file,sha256:crypto.createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex')})))};
const failures=[];const index=x=>new Set(x.map(t=>t.id)),ms=index(data.mechanisms),rs=index(rules),ss=index(sources),ns=index(nodes),func=index(functions);
const requireIds=(ids,set,where)=>{for(const id of ids)if(!set.has(id))failures.push(where+':'+id);};
if(ns.size!==nodes.length)failures.push('duplicate-node');
for(const m of enriched){requireIds(m.functionIds,func,m.id);requireIds(m.ruleIds,rs,m.id);requireIds(m.sourceIds,ss,m.id);}
for(const r of rules)requireIds(r.sourceIds,ss,r.id);
for(const p of [...products,...nodes,...libraryParts,...families])requireIds(p.mechanismIds,ms,p.id);
for(const n of nodes){requireIds(n.children,ns,n.id);if(n.parentId&&!ns.has(n.parentId))failures.push(n.id+':parent');}
for(const p of libraryParts)requireIds(p.ruleIds,rs,p.id);
for(const a of worked.parts)requireIds([a.nodeId],ns,'worked');
const coverage={vehicleNodes:nodes.length,directComponentRoles:nodes.filter(n=>n.classificationScope==='EXPLICIT_COMPONENT_ROLE').length,ancestorContextOnly:nodes.filter(n=>n.classificationScope==='ANCESTOR_CONTEXT_ONLY').length,libraryParts:libraryParts.length,unclassifiedLibraryParts:libraryParts.filter(p=>p.classificationScope==='UNCLASSIFIED').map(p=>p.id),factoryObjects:factory.objects.length,unclassifiedFactoryObjects:families.find(f=>f.id==='GENERIC').objectIds.length,mechanisms:enriched.length,applications:enriched.reduce((n,m)=>n+m.applications.length,0),rules:rules.length};
data.coverage=coverage;data.validation={pass:failures.length===0,failures,meaning:'僅驗證分類引用與親子關係可解析，未代表幾何、用途完整性或製造品質通過。'};
if(failures.length)throw Error(failures.join('\n'));
await fs.writeFile(path.join(lib,'knowledge-map.json'),JSON.stringify(data,null,2)+'\n');
await fs.writeFile(path.join(root,'quality/knowledge-map-graph-r1.json'),JSON.stringify({revision:data.revision,coverage,...data.validation},null,2)+'\n');
console.log(JSON.stringify({revision:data.revision,coverage,...data.validation}));
