יהוה

# D05-P15e · M5×0.8 六角螺帽

抵住玻璃夾具固定體背面，與 M5 螺栓配合提供夾緊反力；目前需工具扶持六角外形。

- 狀態：作者設計實際形體，9,934 三角面，1 個連通體，體積 145.875210 mm³。完整總成及製造認證尚未完成。
- 總成分類：GT01 車輛 → D05 車窗升降器 → D05-P15 玻璃夾具 → D05-P15e
- 功能分類：緊固 → 螺紋緊固 → 螺帽
- 單位：mm；保留原生座標。精確軸線與孔軸見 [part.json](part.json)。

![實際形體](references/D05-P15e-model-r1.png)

## 讀取與重建

1. 先讀 [part.json](part.json) 的座標、尺寸、接面與限制。
2. 一般建模工具載入 [part.obj](part.obj) 並保留 [part.mtl](part.mtl)；匯入單位指定 mm。
3. Three.js 用 [geometry.json](geometry.json) 的各 surfaces 呼叫 BufferGeometryLoader；全部載入。
4. 可編輯參數正本：[window-regulator.mjs](../../native/source/window-regulator.mjs)；相依入口 [geometry-core.mjs](../../native/geometry-core.mjs)。
5. 從庫根目錄執行 `node native/rebuild.mjs`，由同一原生來源生成並比對三角面。

## 形狀與尺寸

- 六角外形與上下倒角
- 中央真通孔與連續內螺旋牙面

- 公稱螺紋："M5×0.8" designation；來源 source nut
- 對邊：8 mm；來源 interfaces.acrossFlats
- 厚度：4 mm；來源 source y=-2.7..1.3
- 內牙徑向作者留量：0.11 mm；來源 source threadRadius clearance

## 配合與裝入

- [D05-P15d](../D05-P15d/PART.md)：M5×0.8 外螺紋
- D05-P15a（本庫外）：固定夾體背面承壓面：來源存在，本庫未收錄；尚無防轉扣座

先將螺帽孔對準固定夾體通孔，沿實際孔軸安置於背面；尚無防轉扣座，旋緊時需用工具扶持六角外形。

## 可用範圍及限制

- M5 內牙與六角工具扶持面的幾何參考
- 內牙作者徑向留量 0.11 不是標準公差等級；未驗證扭矩、脫牙及防鬆。

## 檢查與待辦

- PASS · 重新讀取 OBJ 和 geometry.json 的全部三角面及法線，與原生輸出逐位雜湊比較；判定：面數、各 surface、位置及法線全部相符。
- PASS · 以 0.00001 mm 座標併點統計連通與有向邊、計算有向體積；判定：一連通、每邊兩面反向、無零面積或非有限座標、正體積。
- PASS · 對冷讀 OBJ 做不同角度的徑向射線及 0.8 mm 週期比較，並檢查軸心孔／內六角盲座；判定：同一軸向位置半徑隨角度變化；移動一螺距重複。螺帽軸心全通，螺栓工具座有底。。
- 尚未完成：建立含實際公差的咬合模型，檢查扶持工具空間、牙面接觸與扭矩；若新增防轉扣座，須先施工再驗裝入與止轉；選定材料及防鬆方案。

[本次實際幾何讀回](evidence/native-readback.json) · [整體入口](../../START-HERE.md)

## 圖面適用範圍

- [references/D05-P15e-model-r1.png](references/D05-P15e-model-r1.png) · NATIVE_MODEL_VIEW：同一原生形體逆變換回 Y 軸呈現的六視圖：斜視、+Y 工具接合／孔口、-Y 端面、+Z 軸向輪廓、螺紋局部、+X 輪廓。原生法線保留；匯出 OBJ 本體仍維持 followGlass 之後的斜軸，詳 coordinateFrame。 此圖是局部形體證據，不是承載、密封或完整總成通過。
- [references/D05-P15e-front.png](references/D05-P15e-front.png) · NATIVE_MODEL_VIEW：既有零件讀者 front 視圖；由原生座標與真孔讀回判定尺寸。
- [references/D05-P15e-rear.png](references/D05-P15e-rear.png) · NATIVE_MODEL_VIEW：既有零件讀者 rear 視圖；由原生座標與真孔讀回判定尺寸。
- [references/D05-P15e-side.png](references/D05-P15e-side.png) · NATIVE_MODEL_VIEW：既有零件讀者 side 視圖；由原生座標與真孔讀回判定尺寸。
- [references/D05-P15e-r1.png](references/D05-P15e-r1.png) · GENERATED_SHAPE_CANDIDATE：外形／剖面意圖參考；圖中尺寸不是量測或製造認證。 未逐點量測生成圖；尺寸及接合以原生來源為準。

<!-- mathematical-quality -->

## 數學與現實規律怎麼用

[逐件公式、代入與實體讀回](../../math-quality.html#D05-P15e) · [機器資料](../../math-quality.json)

### 封閉、有向與頂點鄰域

- 狀態：PASS
- 公式：每條邊恰有兩個反向面；每個頂點的 link 是一個環。
- 輸入：`{"weldGridMm":0.00001}`
- 讀回：`{"vertices":4967,"edges":14901,"faces":9934,"eulerCharacteristic":0,"badEdgeIncidence":0,"badOrientedEdges":0,"badVertexLinks":0,"weldGridMm":0.00001,"selfIntersectionExamined":false}`
- 判準：邊、面方向、頂點鄰域異常均為 0；一個連通體。
- 方法：逐一讀取 OBJ 的全部三角面與頂點鄰接。
- 用途：排除破口、反面和只在單點相接的假實體；不宣稱已檢查所有自交。
- 修正或下一步：回到原生幾何修補相鄰面；不可只刪除失敗報告。

### 體積積分與基準點不變性

- 狀態：PASS
- 公式：V = Σ (a−o)·[(b−o)×(c−o)] / 6
- 輸入：`{"originA":[0,0,0],"originB":[0,-51.483999252319336,58.5861759185791],"unit":"mm"}`
- 讀回：`{"signedVolumeMm3":145.87521041484374,"originDifferenceMm3":2.1032064978498966e-12}`
- 判準：正的代數體積；兩個基準點之差 ≤ max(10⁻⁷ mm³, |V|×10⁻⁸)。
- 方法：兩次獨立基準的逐三角面積分。
- 用途：成立於封閉有向邊界；自交未全驗時，只稱代數體積。數值門檻不是加工公差。
- 修正或下一步：核對面方向、漏面、座標尺度與浮點誤差。

### 讀回綁定同一零件與單位

- 狀態：PASS
- 公式：原生→OBJ 的三角位置身分相同；全程長度單位 mm。
- 輸入：`{"id":"D05-P15e","sourceSHA256":"d98d0d7bd0d8a7925f5e21d6311b79087470c9368c10a4aa56133055278005fe"}`
- 讀回：`{"objSHA256":"7a757c67fa461bf484d67568318ce35a5af960407619313feffecadb665d3238","positionTriangleSHA256":"dbb3c6803a122125fc42caf62fdb92d9492ad2eca8c3f74df2f28bd33f334c71","units":"mm","frameUnits":"mm"}`
- 判準：目前 OBJ 與逐件宣告的內容一致；所有原生來源亦與 source-bindings.json 相符。
- 方法：實際讀取檔案、全部位置與來源位元組；不以檔名相同作判定。
- 用途：公式結果必須綁定被檢查的那個修訂，單位不能漂移。
- 修正或下一步：來源改變後重建/重驗全部相依消費端；不可沿用舊報告。

### 座標旋轉不改變零件尺寸

- 狀態：PASS
- 公式：x′=Rx+t；RᵀR=I、det R=+1 ⇒ |x′−y′|=|x−y|
- 輸入：`{"angleRadians":0.5028432109278609,"translationMm":[0,-45,69]}`
- 讀回：`{"sampledDistanceErrorMm":4.912736883966318e-15,"placementFrame":{"name":"D05 upper clamp native surface frame","units":"mm","handedness":"right","X":"夾具寬度；單一形狀原型中心 X=0","Y":"原生夾具局部 Y","Z":"原生夾具局部 Z","origin":[0,0,0],"threadAxis":{"origin":[0,-50.87064658813354,58.923517050218564],"direction":[0,0.876215908676647,0.48191874977215593]},"sourceAxisBeforeFollowGlass":[0,1,0],"sourceToCurrent":"rotate about X by atan(0.55), then the source followGlass translation; primitive axis in source interfaces is pre-transform","transformApplied":"none; original completed makeGT01GlassClamps surfaces preserved","instancePlacement":{"frame":"D05 clamp upper geometry after followGlass; component.x is a separate placement","prototypeX":0,"selectedInstanceX":-24,"duplicateInstanceX":[-24,24]}}}`
- 判準：來源所用右手旋轉；已讀兩個實際 OBJ 點的距離誤差 <10⁻¹⁰ mm。
- 方法：以來源框架的正交旋轉恆等式與原生點對做算術讀回；沒有替所有安裝姿態背書。
- 用途：匯入保持 mm 與右手座標；展示位移不改寫接面。
- 修正或下一步：修正單位、鏡射或非均勻縮放；再檢查完整接面與安裝路徑。

### 螺距、轉角與螺旋相位

- 狀態：PASS
- 公式：phase=y/p+α/(2π)；Δy=−pΔα/(2π)
- 輸入：`{"pitchMm":0.8,"axis":[0,0.876215908676647,0.48191874977215593],"handednessScope":"本件原生來源的 y/α 慣例；不泛化其他螺紋。"}`
- 讀回：`{"samples":[{"degrees":0,"advanceMm":0,"radialSurfaceMm":2.121300805301337,"baseRadiusMm":2.121300805301337,"phaseErrorMm":0},{"degrees":30,"advanceMm":-0.06666666666666667,"radialSurfaceMm":2.1192579669953813,"baseRadiusMm":2.121300805301337,"phaseErrorMm":-0.002042838305955641},{"degrees":60,"advanceMm":-0.13333333333333333,"radialSurfaceMm":2.1192541696459934,"baseRadiusMm":2.121300805301337,"phaseErrorMm":-0.002046635655343465},{"degrees":90,"advanceMm":-0.2,"radialSurfaceMm":2.1212985972891345,"baseRadiusMm":2.121300805301337,"phaseErrorMm":-0.000002208012202409293},{"degrees":180,"advanceMm":-0.4,"radialSurfaceMm":2.1213009354853694,"baseRadiusMm":2.121300805301337,"phaseErrorMm":1.301840324430259e-7},{"degrees":270,"advanceMm":-0.6,"radialSurfaceMm":2.1212995496907467,"baseRadiusMm":2.121300805301337,"phaseErrorMm":-0.000001255610590167322},{"degrees":360,"advanceMm":-0.8,"radialSurfaceMm":2.1213007071809207,"baseRadiusMm":2.121300805301337,"phaseErrorMm":-9.812041623646905e-8}]}`
- 判準：七個相位等價位置的實體射線半徑差 <0.025 mm（網格讀回門檻）。
- 方法：移動射線座標沿目前實際傾斜軸，交於 OBJ 三角面；無替換圓柱。
- 用途：90° 對應 −0.2 mm；反轉符號會造成螺紋錯相。相位通過不代表牙側承載通過。
- 修正或下一步：修正座標、旋轉方向、螺距及起牙相位，再檢查完整旋入與工具空間。

### 材料、公差與承載判定

- 狀態：NEEDS_INPUT
- 公式：ΣF=0、ΣM=0；σ_avg=F/A；τ_avg=V/A（適用截面）
- 輸入：`{"materialGrade":"未指定"}`
- 讀回：`{"missingInputs":["載荷大小/方向/循環 (N, N·mm)","材料牌號、強度與製程","公差極限及偏心 (mm)"]}`
- 判準：真實輸入齊全、模型前提成立並取得對應讀回，才可判定。
- 方法：目前資料庫欄位與物理模型前提核對；沒有代填材料或載荷。
- 用途：平均應力只是初步模型；孔口、槽、螺紋、接觸邊緣需另查應力集中與失效模式。
- 修正或下一步：先固定工況與材料，建立受力路徑及許用值，再以計算/量測驗證。禁止由顏色或正體積推得承載合格。

### 極限公差與實際裝入

- 狀態：NEEDS_INPUT
- 公式：c_min=(D_min−d_max)/2−e；包含倒角、全路徑與工具掃掠
- 輸入：`{"sampledNominalGeometry":true}`
- 讀回：`{"missingInputs":["各接面上下限","相對軸線偏心/傾斜","完整安裝及工具路徑"]}`
- 判準：真實輸入齊全、模型前提成立並取得對應讀回，才可判定。
- 方法：目前資料庫欄位與物理模型前提核對；沒有代填材料或載荷。
- 用途：名義截面和離散路徑讀回各自有效，不能合併推成所有狀態無干涉。
- 修正或下一步：由宿主極限尺寸展開最壞情況，再查整個裝入/拆出過程及保持件釋放。

