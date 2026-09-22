import fs from 'node:fs/promises';import path from 'node:path';
const q='outputs/quality/',r=JSON.parse(await fs.readFile(q+'instrument-mount-readback-r3.json')),b=JSON.parse(await fs.readFile(q+'instrument-mount-browser-r4.json')),t=JSON.parse(await fs.readFile(q+'instrument-mount-topology-r3.json')),resource=JSON.parse((await fs.readFile(q+'instrument-mount-resources-closed.json','utf8')).replace(/^\uFEFF/,''));
const failures=[{id:'F01',evidence:q+'instrument-mount-readback-r1.json',observed:'左下螺栓在offsetX22 / offsetY-25側向起點，實際三角面與I01-P05-005相交。',correction:'侧向起點縮為24mm；其後仍沿世界-X插入22mm。未改孔心、儀表姿態或主要輪廓。',verification:'R2及R3四處完整取樣路徑無檢出穿插。'},
{id:'F02',evidence:q+'instrument-mount-readback-r1.json',observed:'螺栓頭半徑3的軸向探測多出X=-336.9内部封面。',correction:'將牙身、肩、頭、內六角孔及盲底改成單一閉合連續網格，移除合併重複封面。',verification:'R3相同探測僅剩X=-338.7/-334.7兩外表面；焊接三角邊每邊恰二面。'},
{id:'F03',evidence:q+'instrument-mount-r2-installed-iso.png',observed:'極小near與全儀表台遠景造成深度閃爍；剖面方向與視線平行看不到孔內。',correction:'相機near依取景距離調整；剖面改沿孔軸的YZ切面方向，裁切接收件周邊以近看。',verification:'R4回裝、六向近圖與離線頁已直接檢查。截面為實際三角面裁切，不加虛構封面。'},
{id:'F04',evidence:'outputs/references/I05-M-A01-reference-r1.png',observed:'生成圖將開口U框畫成閉合框且後方硬體方向不符。',correction:'退回R1總成參考，R2只採開口框及後螺帽關係，仍退回它暴露後殼內肋的部分。',verification:'最終組裝外形採實際原儀表模組讀回。'}];
const hand={revision:r.revision,status:'BOUNDED_UNIT_COMPLETE_FOR_PARENT_INTEGRATION',api:{module:'outputs/source/instrument-mount.mjs',function:'completeGT01InstrumentMount(T,instrument,dashboard)',inputPose:r.definition.instrumentPose,returns:'root / parts / definition; parts contains 20 NEW hardware meshes only',receiver:'I01-P11-018 remains in dashboard.root and dashboard.parts, with original parent and transform preserved',metadata:'definition.instanceDefinitions contains all 21 instance records; dashboard.definition.instanceDefinitions only overrides driver receiver; center receiver unchanged',earIdentity:'find by subPart I05-A11; its node/browser IDs differ because canvas display is browser-only; no hardcoded ear ID',idempotency:r.idempotent},counts:{newHardware:20,spacers:4,washers:8,bolts:4,nuts:4,replacedExistingReceiver:1,generatedReferenceImages:8,latestBrowserFrames:32,offlineScreenshot:1},sourceSHA256:r.sourceSHA256,geometry:{frame:r.definition.updatedReceiverBounds,hardware:r.definition.newHardwareBounds,thread:r.definition.thread},evidence:{readback:q+'instrument-mount-readback-r3.json',topology:q+'instrument-mount-topology-r3.json',browser:q+'instrument-mount-browser-r4.json',frameChanges:r.changedExistingGeometries,centerReceiverUntouched:r.centerReceiverUntouched,metadataMissing:r.metadataMissing,uniqueIDs:r.uniqueIDs,assemblyTriangleCrossingParts:r.assembled.length,pathSamples:r.insertion.length,pathFailures:r.insertion.filter(p=>p.collisions.length).length,narrowQueries:r.narrowQueries,threadRadialSamples:68,minimumMeasuredThreadGapMm:Math.min(...r.thread.flatMap(t=>t.radialSamples.map(s=>s.radialClearance))),contactInterfaces:24,contactGapMm:0,closedRepresentativePartTopology:t.topology,limits:r.method},referenceReview:'outputs/references/I05-M-reference-review.json',prompts:'outputs/references/I05-M-prompts.json',tutorial:{live:'outputs/quality/instrument-mount-assembly.html',offline:'outputs/quality/instrument-mount-standalone.html',offlineVerified:b.offline,packaging:'work/instrument-mount-package.mjs',packageManifest:'outputs/quality/instrument-mount-package.json'},failures,appearanceZones:r.definition.appearanceZones,unresolved:[...r.definition.unresolved,'實際扳手／套筒工具的空間、手部可達性、線束及車身安裝通路未建立。','接合取樣不是連續掃掠體證明；不宣稱最終量產公差、預緊、壓縮或熱變形可行。','既有I05-A光學層在精確正視圖較暗，未修改其來源／幾何／光學材質；此單元不裁定儀表顯示品質。'],resourceClosure:resource,ownership:'No shared vehicle, registry, viewer, dashboard or instrument-cluster source files modified. No GitHub operations. No delegated agents.'};
await fs.writeFile(q+'instrument-mount-HANDOFF.json',JSON.stringify(hand,null,2));
const md=`יהוה

I05-M-R3已完成本次有界施工：20個新增固定件與1個原位替換U框。主要來源是主責指定的世界毫米尺寸；生成图是輔助施工參考，不是GT01量測或標準認證。

## 交接入口

- [可編輯模組](../source/instrument-mount.mjs)
- [單檔離線教學頁](instrument-mount-standalone.html)：已用本機檔案網址直接載入，含4份模組快照、6張採用範圍明列的獨立參考，不需伺服器。
- [連動正本教學頁](instrument-mount-assembly.html)：組裝／分件／五步操作／六向與立體近看／四處剖面／儀表台回裝／21實例選取。
- [完整機械資料](instrument-mount-HANDOFF.json)、[原生讀回](instrument-mount-readback-r3.json)、[拓樸及孔道探測](instrument-mount-topology-r3.json)。

呼叫端先完成儀表世界姿態：中心[-290,350,750]，局部X→世界Y、Y→Z、Z→X，再呼叫：

\`\`\`js
const mounting = completeGT01InstrumentMount(T, instrument, dashboard);
scene.add(mounting.root); // identity world transform
// mounting.parts 僅20個新增件；不要再次加入既有U框。
// I01-P11-018 已留在dashboard.parts及原父群組內。
\`\`\`

相同組合重複呼叫回傳既有結果。換另一儀表套入同dashboard會明確拒絕，避免重複固定件。模組未改instrument-cluster、dashboard或任何共用原檔；僅替換I01-P11-018實例幾何／局部材質，更新其實例資料與I05-A11接收關係。I01-P11-019的幾何及metadata讀回完全相同。既有A11在Node是I05-A11-197、瀏覽器是I05-A11-198，程式按subPart找耳板，請勿硬編號。

## 形體與接合

|件種|數量|世界X範圍／主要作者尺寸|
|---|---:|---|
|原ID開口U框|替換1|[-352,-349]；Y[175.5,524.5]，Z[683,799]，12寬側軌與12高底條，外R3／內下R4真圓弧|
|鋼間隔套|4|[-349,-342]；OD9／ID4.5／長7|
|前平墊片|4|[-339.5,-338.7]；OD9／ID4.5／厚0.8|
|後平墊片|4|[-352.8,-352]；同型|
|黑化鋼作者螺栓|4|头下X=-338.7，牙至-358.7；M4×0.7／頭下20／Ø7頭高4／AF3盲孔深2.2|
|黃銅作者螺帽|4|[-356,-352.8]；AF7／高3.2／真螺旋內孔|

四孔中心Y181.5／518.5、Z710／790；孔道名義Ø4.5。螺栓端部超出螺帽2.7。牙形、截頂、0.04徑向配合與倒角是作者適配，不宣稱ISO公差資格。24處承壓面探測的間隙均為0；68個螺牙徑向探測的最小間隙0.03919mm。孔軸探測確實穿透框、套、耳與墊片，螺帽中心孔也貫通。

從側後方裝入：螺栓先在最終位置+X22，從外側Y偏移24收回孔軸，再沿-X前進22；螺帽自X偏移-8沿+X旋入，每mm繞X轉2π/0.7。這是幾何装配路徑，尚未加入扳手／套筒工具與手部模型。

## 決定性證據與保留反證

R3共有352個裝入姿態：側向100、沿軸88、螺帽旋入164；1200次實際三角面窄相查詢，無檢出穿插。AABB只用於篩候選；判斷包含真三角面邊面相交、孔道／承壓面／螺牙射線。這不是連續掃掠體或整車碰撞證明。代表性的框、套、墊片、螺栓、螺帽做焊接座標三角邊讀回，均無開放邊或多重邊；螺栓Euler值2，環件0，四孔U框-6。

R1的左下螺栓Y偏移25起點撞I01-P05-005，已保留原交點並縮短為24。R1頭內X=-336.9多出封面，已改為單一連續外表面，原半徑3探測現只剩兩個外界面。外圓角由近似二次曲線修成R3/R4真圓弧。瀏覽器R2的深度閃爍與不適合的剖面方向已修正；歷次JSON與圖沒有刪除。

[最終近接剖面](instrument-mount-r4-section-1.png)、[背面組合](instrument-mount-r4-assembly-rear.png)、[分件](instrument-mount-r4-exploded.png)、[儀表台回裝](instrument-mount-r4-installed-iso.png)。R4共32幅正本讀回圖加1幅離線頁圖，操作讀回無瀏覽器錯誤。裁切近圖不加封面，切口不是缺失實體或製造剖面填色。

8張生成圖與全部提示保留於I05-M-*；逐張採用／退回見[參考對帳](../references/I05-M-reference-review.json)。A01-R1封閉框退回，A01-R2只採開口框及後螺帽，暴露的後殼內肋仍退回；J01只採層序，其光桿與尺寸箭頭不採。最終組合引用原I05-A-R5與DASH-R7。

[BOSSARD BN7類型](https://www.bossard.com/ch-en/eshop/screws-and-bolts-with-internal-drive/hex-socket-head-cap-screws-fully-threaded/p/7/)與[BN504類型](https://www.bossard.com/ch-en/eshop/hex-nuts/hex-nuts-0-8d/p/504/)僅供圓柱內六角全牙螺栓／黃銅六角螺帽形態參考；未採12.9資格、特定產品料號或採購身份。

## 材質分區與界線

供主責統一豪華外觀的分區已存definition.appearanceZones：黑色緞面金屬U框、鋼間隔套／墊片、黑化鋼螺栓、黃銅螺帽。接收耳屬既有I05-A11聚合物後殼，本單元不重做其材質；新件材料牌號與表面工法尚未驗證。

U框到I02主梁／車身仍未施工，沒有完整承載路徑。扭矩、预緊、防鬆、材料強度、耐久、熱變形、工具可達與車規全部未驗。既有儀表在精確正視時顯示較暗，本單元未改其光學來源、幾何或材質，不把此固定件交接當作顯示品質放行。

三次預覽均由resource-guard監管，瀏覽器、伺服器及Job已關閉；最後再讀回各實例PID與監聽埠均為空。詳見[資源收口](instrument-mount-resources-closed.json)。無GitHub操作。

重現原生檢查：在專案執行 \`node work/instrument-mount-inspect.mjs r3\` 與 \`node work/instrument-mount-topology.mjs\`。重新擷取用work/instrument-mount-capture.mjs並經resource-guard啟動；離線包由work/instrument-mount-package.mjs重建。
`;
await fs.writeFile(q+'instrument-mount-HANDOFF.md',md.replaceAll('生成图','生成圖').replaceAll('底条','底條').replaceAll('侧向','側向').replaceAll('内部','內部').replaceAll('头下','頭下').replaceAll('装配','裝配').replaceAll('预緊','預緊'));
console.log(JSON.stringify({handoff:hand.status,revision:hand.revision,samples:hand.evidence.pathSamples,closed:resource.remainingListeners.length===0&&resource.matchingPidCurrentProcesses.length===0}));
