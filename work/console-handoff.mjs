import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
const base=path.resolve(import.meta.dirname,'..'),read=async p=>JSON.parse((await fs.readFile(path.join(base,p),'utf8')).replace(/^\uFEFF/,''));
const native=await read('outputs/quality/console-native-r3.json'),browser=await read('outputs/quality/console-browser-r4.json'),closure=await read('outputs/quality/console-closure-r4.json'),prompts=await read('outputs/references/I03-prompts.json');
if(!native.checksPass||!browser.complete||!browser.contextAnalysis.sampledPass||!closure.AllClosed||!closure.GuardJobsEmpty||native.sourceSHA256!==browser.sourceSHA256)throw Error('Handoff evidence is not reconciled');
const particular={
 'I03-P02':['有限厚度泡棉環套','平面展開、膠黏與實際壓縮量未定義'],
 'I03-P04':['有四個通孔的可卸底板','圖中柱位、底部肋紋及孔距退回；本模組的車身固定孔為作者接點'],
 'I03-P06':['中空傾斜支座、真正上下開口','圖中四個內耳改為連續上口；固定螺栓及卡扣未定義'],
 'I03-P10':['D 面旋鈕軸及分離軸線','兩端倒角與表面加工未照圖細分；編碼器端未建'],
 'I03-P13':['薄橡膠內襯、三個夾持凸點','凸點按實際杯壁空間內縮，材料變形未驗'],
 'I03-P15':['可抽出薄內襯、真正壁與底','生成圖凸緣過大，實作取消外擴邊以維持容器間隙'],
 'I03-P16':['有限厚度下殼、鉸鏈接合墊面','圖中一體鉸鏈、背面肋位與扣鎖方位退回；實作改獨立鉸鏈葉片'],
 'I03-P20':['獨立橫向圓銷','生成圖端頭形狀退回；實作採通銷，止退機構未定義'],
 'I03-P21':['彎曲扣鉤及回勾截面','圖中兩個螺孔未採用，實作穿入蓋的接收槽；釋放件與保持力未建／未驗']
};
const adoption=[{file:'I03-assembly-r1.png',status:'PARTIAL_ADOPTION',adopted:'黑色柔和鞍座、黑色扶手、細銀色面板框的家族語言',rejected:'生成的縱向旋鈕及杯孔配置退回，保留既有雙旋鈕 y=±42；杯孔採作者橫向配置。不是原始 GT01 隱藏部位證据。'},
 {file:'I03-layered-r1.png',status:'PARTIAL_ADOPTION',adopted:'皮覆／泡棉／基材及容器內襯可分離的構造關係',rejected:'第三旋鈕、縱向杯孔、固定件數量及精確組装路徑退回。'},
 ...Object.values(native.definition.partDefinitions).map(d=>({file:path.basename(d.reference),subPart:d.subPart,status:'PARTIAL_ADOPTION',adopted:particular[d.subPart]?.[0]||d.referenceAdoption.adopted,rejected:particular[d.subPart]?.[1]||d.referenceAdoption.rejected}))];
await fs.writeFile(path.join(base,'outputs/references/I03-reference-adoption.json'),JSON.stringify({authority:'AUTHOR_GENERATED_NOT_OEM',source:'GT01-details.png lower-middle cockpit; GT01-design.png overall',inspectedDirectly:true,entries:adoption},null,2));
const fmt=a=>a.map(n=>n.toFixed(2)).join(', '),main=native.definition.envelope.main,whole=native.definition.envelope.wholeClosed;
const fileList=[];for(const [dir,prefix] of [['outputs/references','I03-'],['work','console-'],['outputs/quality','console-']])for(const f of await fs.readdir(path.join(base,dir)))if(f.startsWith(prefix))fileList.push(dir+'/'+f);fileList.unshift('outputs/source/center-console.mjs');
const delivery={revision:native.revision,sourceSHA256:native.sourceSHA256,entry:'outputs/source/center-console.mjs',export:'buildGT01Console(T,materials={}) -> {root,parts,definition}',assemblyPage:'outputs/quality/console-assembly.html',parts:native.meshes,partClasses:Object.keys(native.definition.partDefinitions).length,triangles:native.triangles,generatedReferences:prompts.length,sourceImages:['GT01-details.png','GT01-design.png'],bounds:native.definition.envelope,evidence:{native:'outputs/quality/console-native-r3.json',browser:'outputs/quality/console-browser-r4.json',closure:'outputs/quality/console-closure-r4.json',guard:'outputs/quality/console-guard-r4.json'},context:browser.contextAnalysis,files:fileList,unresolved:native.definition.unresolved};
await fs.writeFile(path.join(base,'outputs/quality/console-delivery.json'),JSON.stringify(delivery,null,2));
const rows=Object.values(native.definition.partDefinitions).map(d=>{const ps=native.parts.filter(p=>p.subPart===d.subPart);return '| '+d.subPart+' | '+d.name+' | '+ps.length+' | '+ps[0].authorDimensions.size.map(n=>n.toFixed(1)).join(' × ')+' | '+d.receiving.subPart+' |';}).join('\n');
const report=`יהוה

# I03 中央鞍座施工交接 — ${native.revision}

可編輯模組為 [center-console.mjs](../source/center-console.mjs)，回傳 root、parts、definition。共 ${native.meshes} 個實體網格、22 類獨立參考，${native.triangles.toLocaleString('en-US')} 三角面。組裝入口為 [console-assembly.html](console-assembly.html)，使用現有本機 Three.js，無新增依賴；可逐件選取、查看該件生成參考、分層、開關扶手及暫時回裝目前座艙。

模組已施工與讀回；共用 vehicle、build、viewer、index 未由本單元修改，正式整合由主責持有。

## 介面與作者尺寸

- 世界毫米，-X 車頭、+Y 駕駛、+Z 上；root 的世界姿態為原點與單位旋轉。
- 主殼：min [${fmt(main.min)}]，max [${fmt(main.max)}]。留在指定 [-338,542] × [-119,119] × [304,473] 包絡內。
- 閉合總成：min [${fmt(whole.min)}]，max [${fmt(whole.max)}]。上方控制件及扶手依既有突起處理。
- 控制面板中心 [-154,0,476]，繞 Y 轉 -0.12 rad。旋鈕局部穿軸點 [-5,±42,0] 隨面板轉換；軸線 [-sin(0.12),0,cos(0.12)]。
- 扶手 pivot [430,0,452]、軸 +Y；root.getObjectByName('I03-armrest-hinge').rotation.y 控制剛體開啟。示範角 0.96 rad，並非經壽命／碰撞驗證的行程。
- 既有地毯實體最高 z=311，底板改為 z=311.15，避免穿入地毯。四個 Ø8.4 底孔位於 x=-260/465、y=±70；車身對應座及螺栓未定義。
- I05 中控顯示 [-292,-42,735] 由外部持有，未重造。
- 每件的 id、referencePart、subPart、purpose、reference、receiving.ids、orientation、authorDimensions、physicalBoundary、material 都在 userData。所有尺寸均為作者重建，非來源量測。

## 獨立分件

下列尺寸是每類第一件的實際幾何外包絡，包含姿態影響；所有實例的完整值見 native JSON。

| subPart | 分件 | 實例數 | 第一件包絡 mm | 接收件 |
|---|---|---:|---|---|
${rows}

## 來源採用／退回

先直接讀 GT01-details 下中座艙及 GT01-design，再生成 2 張整體／分層與 22 張獨立件參考。原圖決定黑色狹長柔和鞍座、黑色扶手及銀框；看不見的杯架、置物腔與內部接合明列作者補充。

[I03-prompts.json](../references/I03-prompts.json) 保存每次完整提示詞、輸入參考與原始生成檔案位置；[I03-reference-adoption.json](../references/I03-reference-adoption.json) 逐張記錄採用與退回。整體圖錯誤的縱向雙旋鈕／杯孔、分層圖多出的第三旋鈕、各張不一致的前開口／肋柱均未直接套用。旋鈕 D 孔、內襯凸緣和鉸鏈位置由共同實際接點重新建構。

## 實際讀回與修正

- [native-r3](console-native-r3.json)：來源雜湊與瀏覽器一致；唯一 ID、有限座標、必要欄位、參考檔案、九條包覆剖面、旋鈕穿軸孔及銀框鏤空讀回通過。杯架中心落在內襯底 z=377，開蓋置物箱中心落在內襯底 z=359.4。
- [browser-r4](console-browser-r4.json)：實際 Three.js/WebGL 38 張影像，含六向、斜視、控制／鉸鏈近看、開蓋、分層、22 類單件與四種底面。無頁面錯誤；拖曳、分層／組裝按鈕及扶手按鈕已操作讀回。
- 回裝 GT01-VEHICLE-R11，對 402 個座椅網格做 22 個有效側向剖面樣本，最小間隙 11.388 mm；地毯間距 0.150 mm。這是記錄樣本與當時座艙版本的證據，不是全域碰撞證明。
- R1 置物箱中心因極小環形封底留下缺口；R2 改為實際中心封底，R3 已用中心射線讀到正確內襯底。
- R1 底板與既有地毯重疊；R2 上移底部接合至地毯上方，未改變控制及扶手位置。
- R1 上肩太直、頂板過寬；R2 收窄上緣並加入連續弧面，六向確認。
- R2 橡膠內襯外擴凸緣與杯架凸點會侵入容器壁；R3 取消置物內襯外擴邊、內縮凸點，52 個容器／內襯徑向間隙樣本皆非負。
- 扶手鉸鏈活動葉接收墊面已補齊。螺栓、止退、扣鎖釋放與實際卡接力仍未定義；沒有把可視轉動當成完整工程機構。
- 首次座椅檢查只搜尋頂層 Mesh，導致零樣本；已改為遍歷真實座椅群組，並要求樣本數大於零，最新得到 22 個有效樣本。

## 可直接重現

工作目錄為本專案。先執行原生檢查：

\`\`\`powershell
& 'C:/Program Files/nodejs/node.exe' work/console-inspect.mjs
\`\`\`

瀏覽器讀回以新批次 r5 執行，結果檔必須尚不存在。它建立自己持有的臨時伺服器與 Chrome，截圖後自動關閉：

\`\`\`powershell
& 'LOCAL_TOOL_PATH_OMITTED' --file 'C:/Program Files/nodejs/node.exe' --cwd '${base.replaceAll('\\','/')}' --preview --startup-memory-gb 1 --background --max-duration-ms 180000 --result-json '${base.replaceAll('\\','/')}/outputs/quality/console-guard-r5.json' -- work/console-capture.mjs r5 --parts --context
\`\`\`

使用既有以 outputs 為根的本機 HTTP 服務時，頁面路徑為 /quality/console-assembly.html。回裝只在頁面記憶體暫時隱藏舊鞍座與相關控制件，原檔不變。

## 未驗與資源收口

${native.definition.unresolved.map(v=>'- '+v).join('\n')}
- 主殼固定、扶手螺栓與止退、卡扣釋放件沒有完整定義；未聲稱製造、耐久、安全或車規合格。
- 四次瀏覽器批次的 guard Job 皆為空，瀏覽器與伺服器均正常關閉；[closure-r4](console-closure-r4.json) 讀回沒有本任務行程或監聽者。舊 PID 9360 已被無關的 SearchProtocolHost.exe 重用，按執行檔身份排除並保持不動。
- 完整交付清單：[console-delivery.json](console-delivery.json)。GitHub 保持暫停。

![組裝](console-r4-iso.png)
![分層](console-r4-layered.png)
![開蓋置物腔](console-r4-open-storage.png)
![目前座艙回裝](console-r4-reinstalled.png)
`;
await fs.writeFile(path.join(base,'outputs/quality/console-HANDOFF.md'),report.replaceAll('證據','證據').replaceAll('組裝','組裝').replaceAll('獨立','獨立').replaceAll('實際','實際').replaceAll('沒有','沒有'));
console.log(JSON.stringify({revision:native.revision,ready:true,files:fileList.length,minimumLiningGap:Math.min(...native.liningClearances.map(v=>v.gapMm)),liningSamples:native.liningClearances.length}));

