import fs from 'node:fs/promises';import * as T from '../outputs/source/three.mjs';import {buildGT01DoorHandle} from '../outputs/source/door-handle.mjs';import {GT01_HANDLE_STEPS} from '../outputs/source/door-handle-assembly-paths.mjs';
const model=buildGT01DoorHandle(T),proof=JSON.parse(await fs.readFile('outputs/quality/door-handle-quality-cases.json','utf8')),native=JSON.parse(await fs.readFile('outputs/quality/door-handle-parent-readback-r3.json','utf8'));
const purpose={
'D11-P01':'外部握持面、背肋與軸座同一連續成形件；單平邊 D 形端部把轉動傳給撥臂。',
'D11-P02':'空心盒體定位孔軸、支承肩銷與軸套；下方一體支點承接回位彈簧下腳。',
'D11-P03':'把上下支承、把手與撥臂串在同一條 Z 軸；頭部端面承壓，下端槽容納扣環。',
'D11-P04':'連續鋼線形成回位扭簧；下腳接盒體，上腳接撥臂。形體轉動採等線長示意，預壓與承載須另行驗證。',
'D11-P05a':'以 D 形凹座接把手，下方凸塊接彈簧；開槽圓眼預留拉索端頭，端頭及其止退仍需施工。',
'D11-P06':'周界密封墊隔開盒體法蘭與門皮；中央開口及兩個固定孔沿用盒體輪廓。',
'D11-P09':'E 型扣環在肩銷槽內提供止退形體。槽內定位已查，彈性張開、卡入與承載尚未完成。',
'D11-P10':'下止推墊圈把盒體下端與扣環分開；Ø4.2 孔套在肩銷上。',
'D11-P11a':'下軸套承接撥臂，外側導引扭簧；與肩銷及彈簧分開成形。',
'D11-P11b':'上軸套由上方穿入盒體，支承把手上座並提供 Ø4.2 肩銷配合孔。'};
const rev=id=>id==='D11-P02'?'r3':['D11-P01','D11-P03','D11-P11b'].includes(id)?'r2':'r1';
let md='יהוה\n\n# GT01 D11 製作、回裝與品管交接\n\n本文件對應 '+model.root.userData.revision+' 的十件已形成首件。整車與完整外把手持續施工，局部通過不代表完整總成通過。\n\n';
md+='## 接手入口\n\n1. 開啟 [逐件工坊](GT01-handle-assembly.html)，逐件看形狀、六視圖、剖面與十步回裝。\n2. 開啟 [缺陷重現與紅圈對照](GT01-handle-quality.html)，先看下列兩個失敗案例與修正理由。\n3. 讀 [機器可讀案例](quality/door-handle-quality-cases.json)、[回裝路徑](source/door-handle-assembly-paths.mjs) 及每件來源。\n4. 修改後重新建置、讀回當前形體與路徑；不能只改文字、圖名或通過狀態。\n\n';
md+='## 座標與角度\n\n單位 mm。X 沿把手長度，Y 向車外，Z 向上。樞軸中心為 (-46,-10)，方向 (0,0,1)。正面由 +Y 看向物件、上方為 +Z；此角度中 −X 會出現在畫面右側。接合說明使用零件編號、座標與高度，不能用沒有綁定觀看方向的「左、右」代替。轉動示意範圍0–30°。\n\n';
for(const [i,c] of proof.cases.entries()){
md+='## '+c.id+'：'+c.title+'\n\n![修正前後與圈註](references/D11-Q0'+(i+1)+'-comparison-r1.png)\n\n**用途：** '+c.purpose+'\n\n**原因：** '+c.cause+'\n\n**修正理由：** '+c.why+'\n\n**觀看角度：** '+c.view+'\n\n';
md+='```json\n'+JSON.stringify({before:c.before,after:c.after},null,2)+'\n```\n\n';
md+='程式與數值：\n\n';for(const r of c.sourceRefs)md+='- `'+r.file+':'+r.line+'`：'+r.role+'；搜尋 `'+r.fragment+'`。\n';
if(i===0)md+='\n```diff\n- 上軸套 ring(7, 7.5)；Z = 7..14.5\n+ 上軸套 ring(7, 11)；Z = 7..18\n- 盒體上孔半徑 2.1\n+ 盒體上孔半徑 2.85；肩銷孔由軸套內徑4.2提供\n- 回裝：前方 Y+24 → 0\n+ 回裝：上方 Z+14 → 0\n```\n';
else md+='\n```diff\n// 輪廓點的格式是 [Z, 半徑]，不是直徑。\n- [17.8, 2], [18, 2.2], [18, 3.5]\n+ [18, 2], [18, 3.5]\n```\n';
md+='\n**判定：** '+c.checks.join('；')+'。\n\n**接手標準：** '+c.rule+'\n\n';}
md+='## 十件逐項用途與實際包絡\n\n';
for(const p of [...model.parts].sort((a,b)=>a.userData.id.localeCompare(b.userData.id,undefined,{numeric:true}))){const id=p.userData.id,r=native.records.find(r=>r.id===id);md+='### '+id+' '+p.name+'\n\n'+purpose[id]+'\n\n![同一模型六視圖](references/'+id+'-model-'+rev(id)+'.png)\n\n';md+='- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。\n- 實際包絡：`'+JSON.stringify(r.bounds)+'` mm。\n- 原生读回：'+r.triangles+' 三角面、'+r.groups+' 個連通體；開邊／反邊 '+r.badEdges+'、零面積面 '+r.degenerate+'。\n- 接合資料：\n\n```json\n'+JSON.stringify(p.userData.interfaces,null,2)+'\n```\n\n';}
md+='## 逐件回裝順序\n\n|順序／零件|用途與裝入方式|路徑類型|\n|---|---|---|\n';for(const s of GT01_HANDLE_STEPS)md+='|'+s.name+' / '+s.id+'|'+s.note+'|`'+s.path+'`'+(s.distance?'；行程 '+s.distance+' mm':'')+'|\n';
md+='\n![D形與彈簧支承剖圖](references/D11-return-assembly-r2.png)\n\n## 已完成的證據\n\n- [十件封閉實體](quality/door-handle-parent-readback-r3.json)：各一個連通體，無開邊、反邊或退化面。\n- [D形／彈簧接触與七姿勢讀回](quality/door-handle-coupling-readback-r2.json)：実際網格射線與雙向頂點取樣。\n- [逐件裝入](quality/door-handle-assembly-paths-r1.json)：八段剛體路徑，各21個位置，修正後無取樣穿入；扣環僅定位。\n- [兩個缺陷重現](quality/door-handle-quality-cases.json)：R2形體的面數與體積對得上既有讀回；舊路徑分別重現480／64次頂點穿入。這些是事件數，不能當作獨立缺陷數。\n\n## 接續施工，不能以清單代替完成\n\n|項目|下一個實作／檢查動作|判定所需證據|\n|---|---|---|\n|拉索端接|建立端頭、真實線孔、線材、套管座與端頭止退件；對接撥臂圓眼與盒體通孔|獨立零件圖、相配孔軸、線路及裝入讀回|\n|行程止擋|建立止擋實體與盒體座，定位閉合與開啟接触面|兩端位置的接觸讀回、轉動中無新增穿入|\n|門體固定|依現有盒耳孔製作固定件與門體承接座，切出實際門皮開口|裝回整車後的表面、孔位、空間與角度檢查|\n|扣環卡入|先驗開口喉部與槽的接觸，再建立可說明彈性裝入的形體與方法|不能用剛體穿入或終點定位冒充彈性卡入|\n|D形間隙與預壓|把配合遊隙、止擋、上腳／下腳的預置角連到同一作動模型|實際接面接觸及動作順序；等線長圖不能替代力學分析|\n|完整形體品管|逐件近看，再回到總成與整車比較參考|輪廓、負空間、接合、材質、各方向實際畫面|\n\n材料承載、疲勞與實車使用需要對應材料、載荷與實體試驗；目前資料未提供這些證據，不宣稱已取得。數位形體與組裝工作仍照上表繼續完成。\n';
md=md.replaceAll('原生读回','原生讀回').replaceAll('接触','接觸').replaceAll('実際','實際');await fs.writeFile('outputs/GT01-D11-production-and-quality.md',md);console.log('Source, numeric, purpose, view and assembly handoff written.');
