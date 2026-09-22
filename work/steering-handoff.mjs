import fs from 'node:fs/promises';import crypto from 'node:crypto';
const base=new URL('../',import.meta.url),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>fs.readFile(new URL(p,base)),write=async(p,s)=>fs.writeFile(new URL(p,base),s);
const native=JSON.parse(await read('outputs/quality/steering-native-readback-r5.json'));
const browser=JSON.parse(await read('outputs/quality/steering-browser-readback-r5.json'));
const referenceReview={schema:'gt01.steering-reference-selection/v1',scope:'I04',reviewerRole:'BOUNDED_CONSTRUCTION_WORKER',parentAdoption:'PENDING_PRIMARY_REVIEW',
  supplied:[{file:'GT01-details.png',region:'lower middle cockpit',directlyViewed:true,observed:['圓形黑色皮革握圈','三輻','圓角中央氣囊蓋','銀色下輻','雙側按鍵']},{file:'GT01-design.png',directlyViewed:true,usage:'GT01 豪華 GT 座艙比例與材料語彙；方向盤背面不可見'}],
  generation:{tool:'image_gen.imagegen',inputs:['outputs/references/GT01-details.png'],count:4,mode:'reference-based independent single-view candidates',authority:'AUTHOR_DESIGN_NOT_MEASUREMENT',
    sharedBrief:'Use only steering wheel in lower middle cockpit. Single isolated photoreal luxury three-spoke wheel on neutral grey. 340 mm circular identity, leather, rounded airbag cover, left/right control pods, genuinely open silver lower spoke. No logo, text, extra car, collage or racing stripe.'},
  candidates:[
    {file:'I04-front-r1.png',directlyViewed:true,decision:'PARTIAL_ADOPTION',brief:'Straight-on driver-facing front view, 340 mm circular silhouette, compact rounded 115 mm cover, three spokes, fine leather and inner seam.',adopted:['圓形外輪廓','三輻與左右按鍵','中央蓋輪廓','銀色下輻','皮革接縫語彙'],rejected:['下輻黑色凹腔內再開小孔的雙層錯置'],constructor:['rimPoint','sideOutline','coverRings','podOutline']},
    {file:'I04-rear-r1.png',directlyViewed:true,decision:'PARTIAL_ADOPTION',brief:'Straight-on back view with rear clamshell, central shaft bore, mounting inserts, recessed screw interfaces, shallow hub.',adopted:['背殼與短輪轂','中心軸孔','固定件座面','單一貫穿的下輻長孔'],rejected:['不確定的接頭針腳/電路細節','生成圖不能決定實車花鍵'],constructor:['rearRings','annulus','lowerHole']},
    {file:'I04-side-r1.png',directlyViewed:true,decision:'ADOPTED_SHAPE_REFERENCE',brief:'Exact side profile, driver face right, shaft left, under 80 mm assembled depth, 30 mm grip section and shallow cover.',adopted:['橢圓握圈截面','中央蓋比輪圈稍突出','背殼收束到短輪轂','淺厚度包絡'],rejected:['像素不得當作80mm量測'],constructor:['rimPoint','coverRings','rearRings','definition.dimensions']},
    {file:'I04-exploded-r1.png',directlyViewed:true,decision:'PARTIAL_ADOPTION',brief:'Exploded three-quarter layers showing rear shell, cast carrier, covered circular rim, two separate pods, open lower bezel and airbag cover. No pyrotechnic internals.',adopted:['殼/承架/包覆/按鍵/飾框/外蓋的分層','芯材與外皮分開','下輻骨架與飾框共享開口'],rejected:['右側重複按鍵模組','大型背殼與主握圈比例不可採','圖上並未形成可信可逆維修程序'],constructor:['carrierOutline','lowerHole','M','parts[].userData.layer']}
  ]};
for(const c of referenceReview.candidates)c.sha256=sha(await read('outputs/references/'+c.file));
await write('outputs/references/I04-reference-review.json',JSON.stringify(referenceReview,null,2));
const currentSource=await read('outputs/source/steering-wheel.mjs');
if(sha(currentSource)!==native.sourceSHA256||sha(currentSource)!==browser.sourceSHA256)throw Error('source drift');
await write('outputs/quality/steering-r5-source.mjs',currentSource);
const changeLog={schema:'gt01.steering-construction-receipt/v1',revision:'I04-R5',status:'LOCAL_CONSTRUCTION_RETURNED_FOR_PRIMARY_INTEGRATION',
  source:'outputs/source/steering-wheel.mjs',sourceSHA256:sha(currentSource),
  geometry:{dimensions:native.box.dimensions,meshCount:native.meshCount,triangles:native.triangleCount,slotGridClear:native.slotGrid.every(p=>!p.hits.length),hubCarrierOverlapMm:native.hubCarrier.overlapMm,metadataMissing:native.metadataMissing},
  actualReader:{entry:'work/steering-viewer.html',capture:'work/steering-capture.mjs',frames:browser.frames.map(x=>x.file),browserErrors:browser.errors,sourceUnchanged:browser.bindingsUnchanged},
  constructionCorrections:[
    {id:'I04-C01',finding:'Central loft used a tiny open ring at the pole, leaving an unintended axial pinhole.',change:'Use true single-vertex poles and closed inner/outer skins.',evidence:'steering-native-readback-r5.json shaftBore first terminates on the cover at z=26.'},
    {id:'I04-C02',finding:'R1 separate carrier plates read as unrelated slabs and seams.',before:'steering-r1-core-iso.png',change:'R2 single continuous carrierOutline joins centre, both arms and lower slotted spoke.',after:'steering-r5-core-iso.png'},
    {id:'I04-C03',finding:'Curved lower bezel displayed triangulation. Broad normal averaging then spread bevel normals into planar hub/casting caps.',before:['steering-r2-all-lower-slot.png','steering-r3-all-hub.png'],change:'R4 keeps planar cap normals, smooths only shared bevel normals, and transforms lower-bezel normals with the crown derivative.',after:['steering-r5-all-lower-slot.png','steering-r5-all-hub.png']},
    {id:'I04-C04',finding:'Rear screw seats sat above the shell and the carrier was visible outside the lateral skins.',before:'steering-r2-all-hub.png',change:'Seat rear fasteners on shared rear annular plane; restrict lateral carrier inside shell.',after:'steering-r5-all-hub.png'},
    {id:'I04-C05',finding:'Hidden hub front stopped before the central carrier.',before:'steering-r4-source.mjs',change:'R5 hub front extends from z=-19 to -10; overlap at radial witness [20,0] is 1.4 mm.',after:'steering-native-readback-r5.json hubCarrier'},
    {id:'I04-C06',finding:'R1 browser recorded a favicon 404.',change:'Use an inline empty favicon.',after:'steering-browser-readback-r5.json errors=[]'}
  ],
  remaining:['需主責在車內檢查世界姿態、輪軸接合與駕駛空間','原圖背面與尺寸不可量測，均為作者補建','氣囊/電控/實車花鍵/強度未驗','本單元沒有宣稱可逆維修程序或整車放行'],
  scopeCompliance:{sharedFilesModified:false,newDependencies:false,githubTransmission:false},
  lifecycle:{guard:'steering-guard-r5.json',native:'steering-lifetime-closure-r5.json',browserExited:browser.browserExited,serverClosed:browser.serverClosed}
};
await write('outputs/quality/steering-construction-receipt-r5.json',JSON.stringify(changeLog,null,2));
await write('outputs/quality/steering-HANDOFF.md',`יהוה

# GT01 I04 方向盤有界施工交接

本次交回 \`I04-R5\` 可編輯 Three.js 模組；正式整合與品質採用仍由主責持有。

- 正本：\`outputs/source/steering-wheel.mjs\`。
- 入口：\`buildGT01Steering(T, materials = {}) → { root, parts, definition }\`。T 使用既有 \`outputs/source/three.mjs\`；零新增依賴。
- 局部座標：XY 為方向盤平面、+Y 上、+Z 朝駕駛、原點輪圈中心，全部為 mm。主責設定 root 的世界姿態。
- 實測網格包絡：340 × 340 × 73.9 mm；41 個獨立網格、108340 triangles。模型只作可編輯視覺構造，尺寸為作者設定。
- 所有網格具有唯一 id、subPart I04-Pxx、referencePart I04、system interior、reference、authorDimensions、purpose、layer 與 revision。
- 可沿 userData.layer 查看 leather、core、rear-shell、front-shell、trim、cover、controls、interface、hardware。parts 是 root 直接子網格陣列。
- 材質可傳 steeringLeather、steeringShell、alloy、metal；傳入材質先 clone，程式不修改共用材質。既有棕色 seats leather 不會誤套到黑色方向盤。

## 真實構造與接口

握圈採自訂連續截面網格（包含內側拇指支承），有環形芯材、單一連續三輻承架、前/後殼、中央雙層薄壁外蓋、左右獨立按鍵、滾輪、貼於握圈截面的縫線、銀色開孔下輻及後輪轂。下輻孔由所有層共用 lowerHole，9 個孔內射線點全部無命中；沒有黑貼片封孔。中央軸孔名義22 mm，36齒花鍵僅作者示意。輪轂後端名義 z=-44、前端 z=-10，在徑向20 mm處接入承架1.4 mm；這是視覺包絡接合，未驗製造配合。

## 參考採用

四張獨立生成圖均已直接讀取，見 \`outputs/references/I04-reference-review.json\`。正面採輪廓/蓋/按鍵，退回其下輻雙層小孔；背面採單一長通孔與短輪轂；側面採淺厚度；拆解圖只採分層，退回重複按鍵。生成參考不是真實尺寸或安全機構來源。

## 可重現讀回

在專案根目錄執行：

\`\`\`powershell
node work/steering-inspect.mjs
& 'LOCAL_TOOL_PATH_OMITTED' --file 'C:/Program Files/nodejs/node.exe' --cwd '.' --preview --startup-memory-gb 1 --background --max-duration-ms 180000 --result-json './outputs/quality/steering-guard-r6.json' -- work/steering-capture.mjs r6
\`\`\`

第二條指令產生新的 r6 讀回檔（模型仍是 I04-R5），不啟動常駐預覽。guard result 路徑必須尚不存在。正式讀回見 \`steering-native-readback-r5.json\`、\`steering-browser-readback-r5.json\`；14 張同版實際畫面包含正背側、上下、斜向、孔口、輪轂與芯材。頁面並排顯示原圖與補充參考。

## 已修缺陷與未驗範圍

已修中央蓋極點孔、分片骨架、下輻/輪轂三角反光、偏離座面的後固定件、外露承架與輪轂未接入承架。完整前後版與原因存於 \`steering-construction-receipt-r5.json\`，R1–R4 正本快照保留於相同品質目錄。

目前僅完成本單元施工與本機讀回。氣囊袋體、充氣器、固定釋放機構、電控、實車花鍵、強度/疲勞/碰撞與車規均未驗；主責仍須檢查車內世界姿態、方向盤軸與其他部件的空間關係。

全部本任務瀏覽器、HTTP listener 與 resource-guard Job 已收口；\`steering-lifetime-closure-r5.json\` 的程序與監聽者清單均為空。沒有改共用 vehicle/build/viewer/index，也沒有 GitHub 傳輸。
`);
console.log(JSON.stringify({sourceSHA256:sha(currentSource),receipt:'outputs/quality/steering-construction-receipt-r5.json',referenceReview:'outputs/references/I04-reference-review.json',handoff:'outputs/quality/steering-HANDOFF.md'}));

