יהוה

# D11-P05a · D 形凹座拉索撥臂

接收把手的旋轉，預留拉索端頭連接並與回位彈簧接觸。

- 狀態：作者設計實際形體，7,780 三角面，1 個連通體，體積 600.710109 mm³。完整總成及製造認證尚未完成。
- 總成分類：GT01 車輛 → D11 車門外把手 → 把手首件機構 → D11-P05a
- 功能分類：傳力 → 撥臂與連桿
- 單位：mm；保留原生座標。精確軸線與孔軸見 [part.json](part.json)。

![實際形體](references/D11-P05a-model-r1.png)

## 讀取與重建

1. 先讀 [part.json](part.json) 的座標、尺寸、接面與限制。
2. 一般建模工具載入 [part.obj](part.obj) 並保留 [part.mtl](part.mtl)；匯入單位指定 mm。
3. Three.js 用 [geometry.json](geometry.json) 的各 surfaces 呼叫 BufferGeometryLoader；全部載入。
4. 可編輯參數正本：[door-handle-actuator.mjs](../../native/source/door-handle-actuator.mjs)；相依入口 [geometry-core.mjs](../../native/geometry-core.mjs)。
5. 從庫根目錄執行 `node native/rebuild.mjs`，由同一原生來源生成並比對三角面。

## 形狀與尺寸

- X=-46 樞軸端的單平邊 D 形盲凹座與中央通孔
- 收腰連桿與 X=-28 拉索端的開槽圓眼
- 一體後腳及向下彈簧接觸塊

- 底板 Z：[-6,-3.1] mm；來源 interfaces
- 樞軸通孔徑：4.2 mm；來源 interfaces
- D 凹座半徑：5.1 mm；來源 interfaces
- 單平邊 Y：-14.1 mm；來源 interfaces
- D 座深度：1 mm；來源 interfaces
- 拉索圓眼孔徑：4.15 mm；來源 interfaces
- 拉索圓眼開槽寬：1.4 mm；來源 interfaces
- 彈簧接觸面 X：-49.95 mm；來源 interfaces

## 配合與裝入

- [D11-P01](../D11-P01/PART.md)：D 凹座與單平邊端部
- [D11-P03](../D11-P03/PART.md)：中央肩銷
- [D11-P11a](../D11-P11a/PART.md)：底板下方支承
- [D11-P04](../D11-P04/PART.md)：移動彈簧腳接平面 X=-49.95
- D11-P05b（本庫外）：開槽圓眼，端頭尚未生產

04 裝入拉索撥臂：從前方進入，再下降到下軸套；接觸塊的 X=-49.95 接面貼住上彈簧腳的負 X 側。 唯一動作來源為 [door-handle-assembly-paths.mjs](../../native/source/door-handle-assembly-paths.mjs)。

## 可用範圍及限制

- 同軸 D 形傳力及開槽端眼的幾何參考
- 完整拉索、端頭、外管座與全行程還未完成。

## 檢查與待辦

- PASS · 重新讀取 OBJ 和 geometry.json 的全部三角面及法線，與原生輸出逐位雜湊比較；判定：面數、各 surface、位置及法線全部相符。
- PASS · 以 0.00001 mm 座標併點統計連通與有向邊、計算有向體積；判定：一連通、每邊兩面反向、無零面積或非有限座標、正體積。
- 尚未完成：建立匹配端頭、鋼索、外管和保持件，檢查端頭裝入、工作轉角、拉程及防脫。

[本次實際幾何讀回](evidence/native-readback.json) · [整體入口](../../START-HERE.md)

## 圖面適用範圍

- [references/D11-P05a-model-r1.png](references/D11-P05a-model-r1.png) · NATIVE_MODEL_VIEW：同一份模型的正面 +Y、背面 -Y、頂面 +Z、底面 -Z、端面 +X 與斜視；以原生尺寸和孔軸為準。 此圖是局部形體證據，不是承載、密封或完整總成通過。
- [references/D11-P05-r2.png](references/D11-P05-r2.png) · GENERATED_SHAPE_CANDIDATE：觀看樞軸凹座、拉索開槽眼及下接觸腳；D 座只保留一條平邊，原生參數優先。 先前生成圖多扁邊 D 槽與剖面高度矛盾已由明確座標修正；不把生成圖加出的槽面當零件。

<!-- mathematical-quality -->

## 數學與現實規律怎麼用

[逐件公式、代入與實體讀回](../../math-quality.html#D11-P05a) · [機器資料](../../math-quality.json)

### 封閉、有向與頂點鄰域

- 狀態：PASS
- 公式：每條邊恰有兩個反向面；每個頂點的 link 是一個環。
- 輸入：`{"weldGridMm":0.00001}`
- 讀回：`{"vertices":3890,"edges":11670,"faces":7780,"eulerCharacteristic":0,"badEdgeIncidence":0,"badOrientedEdges":0,"badVertexLinks":0,"weldGridMm":0.00001,"selfIntersectionExamined":false}`
- 判準：邊、面方向、頂點鄰域異常均為 0；一個連通體。
- 方法：逐一讀取 OBJ 的全部三角面與頂點鄰接。
- 用途：排除破口、反面和只在單點相接的假實體；不宣稱已檢查所有自交。
- 修正或下一步：回到原生幾何修補相鄰面；不可只刪除失敗報告。

### 體積積分與基準點不變性

- 狀態：PASS
- 公式：V = Σ (a−o)·[(b−o)×(c−o)] / 6
- 輸入：`{"originA":[0,0,0],"originB":[-38.30000019073486,-13.5,-5.249999761581421],"unit":"mm"}`
- 讀回：`{"signedVolumeMm3":600.7101093667468,"originDifferenceMm3":4.433786671143025e-12}`
- 判準：正的代數體積；兩個基準點之差 ≤ max(10⁻⁷ mm³, |V|×10⁻⁸)。
- 方法：兩次獨立基準的逐三角面積分。
- 用途：成立於封閉有向邊界；自交未全驗時，只稱代數體積。數值門檻不是加工公差。
- 修正或下一步：核對面方向、漏面、座標尺度與浮點誤差。

### 讀回綁定同一零件與單位

- 狀態：PASS
- 公式：原生→OBJ 的三角位置身分相同；全程長度單位 mm。
- 輸入：`{"id":"D11-P05a","sourceSHA256":"7bf5cd1c52341f73c0cbd28af4be18261c675a6748563954c956f0cea0907077"}`
- 讀回：`{"objSHA256":"64d7390d967b137aa6dff88a5283bef391c90e25e3f26810ff0fd40f7bd6a021","positionTriangleSHA256":"41864cab573cda1935831686136bcf25927b5b63de263a0423d1fa6f06d8632a","units":"mm","frameUnits":"mm"}`
- 判準：目前 OBJ 與逐件宣告的內容一致；所有原生來源亦與 source-bindings.json 相符。
- 方法：實際讀取檔案、全部位置與來源位元組；不以檔名相同作判定。
- 用途：公式結果必須綁定被檢查的那個修訂，單位不能漂移。
- 修正或下一步：來源改變後重建/重驗全部相依消費端；不可沿用舊報告。

### 座標旋轉不改變零件尺寸

- 狀態：PASS
- 公式：x′=Rx+t；RᵀR=I、det R=+1 ⇒ |x′−y′|=|x−y|
- 輸入：`{"angleRadians":0,"translationMm":[0,0,0]}`
- 讀回：`{"sampledDistanceErrorMm":0,"placementFrame":{"name":"D11 assembly local","units":"mm","handedness":"right","X":"沿把手長度","Y":"向車外","Z":"向上","origin":[0,0,0],"pivotAxis":{"origin":[-46,-10,0],"direction":[0,0,1]},"transformApplied":"none; original native geometry coordinates"}}`
- 判準：來源所用右手旋轉；已讀兩個實際 OBJ 點的距離誤差 <10⁻¹⁰ mm。
- 方法：以來源框架的正交旋轉恆等式與原生點對做算術讀回；沒有替所有安裝姿態背書。
- 用途：匯入保持 mm 與右手座標；展示位移不改寫接面。
- 修正或下一步：修正單位、鏡射或非均勻縮放；再檢查完整接面與安裝路徑。

### 孔軸截面：D11-P05a／D11-P03

- 狀態：PASS
- 公式：c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]
- 輸入：`{"holeDiameterMm":4.2,"shaftDiameterMm":4,"axis":[-46,-10],"zMm":-4,"nominalEccentricityMm":0}`
- 讀回：`{"nominalRadialGapMm":0.10000000000000009,"sampledMinGapMm":0.09999865089982674,"sampledMaxGapMm":0.10000276921665763,"rays":48,"holePolygon":{"vertices":384,"maxAngularGapRadians":0.01636361150077459,"maxSagMm":0.00007028865049769628},"shaftPolygon":{"vertices":96,"maxAngularGapRadians":0.06545136184239375,"maxSagMm":0.0010708746137388925},"coordinateNumericalAllowanceMm":0.00001}`
- 判準：本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。
- 方法：從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。
- 用途：此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。
- 修正或下一步：若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。

### 撥臂力矩係數與方向

- 狀態：PASS
- 公式：M_z=r_xF_y−r_yF_x
- 輸入：`{"pivotMm":[-46,-10,-4.55],"cableEyeMm":[-28,-10,-4.55]}`
- 讀回：`{"armMm":[18,0,0],"coefficientForFyMm":18,"coefficientForFxMm":0,"interpretation":"M_z/(N·mm)=18×F_y/N；這是每單位力的比例，沒有假定實際拉力。"}`
- 判準：兩個作者設計孔軸相距 18 mm；載荷留作符號量。
- 方法：讀取零件的設計孔軸；套用叉積定義，不把 18F 用於任意方向。
- 用途：改變鋼索方向或接點，力矩係數也必須重算。
- 修正或下一步：由實際拉索路由取得力向量，再做平衡及接觸讀回。

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

