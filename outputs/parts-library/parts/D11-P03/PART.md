יהוה

# D11-P03 · 帶扣槽肩銷

貫穿支承與轉動零件並以肩頭、墊圈、扣環限制軸向位置。

- 狀態：作者設計實際形體，1,920 三角面，1 個連通體，體積 548.703029 mm³。完整總成及製造認證尚未完成。
- 總成分類：GT01 車輛 → D11 車門外把手 → 把手首件機構 → D11-P03
- 功能分類：緊固 → 銷軸與軸向定位
- 單位：mm；保留原生座標。精確軸線與孔軸見 [part.json](part.json)。

![實際形體](references/D11-P03-model-r2.png)

## 讀取與重建

1. 先讀 [part.json](part.json) 的座標、尺寸、接面與限制。
2. 一般建模工具載入 [part.obj](part.obj) 並保留 [part.mtl](part.mtl)；匯入單位指定 mm。
3. Three.js 用 [geometry.json](geometry.json) 的各 surfaces 呼叫 BufferGeometryLoader；全部載入。
4. 可編輯參數正本：[door-handle-hardware.mjs](../../native/source/door-handle-hardware.mjs)；相依入口 [geometry-core.mjs](../../native/geometry-core.mjs)。
5. 從庫根目錄執行 `node native/rebuild.mjs`，由同一原生來源生成並比對三角面。

## 形狀與尺寸

- 無螺紋 Ø4 軸身
- Ø7 肩頭與下端扣槽
- R3 修正肩部前軸身保持 R2

- 軸徑：4 mm；來源 source lathe profile
- 頭徑：7 mm；來源 source lathe profile
- 全長：40 mm；來源 native bounds Z
- 扣槽直徑：3.2 mm；來源 source lathe profile
- 扣槽 Z：[-19.2,-18.5] mm；來源 source lathe profile
- 肩部 Z：18 mm；來源 source lathe profile

## 配合與裝入

- [D11-P11b](../D11-P11b/PART.md)：Ø4 軸對 Ø4.2 上套孔
- [D11-P11a](../D11-P11a/PART.md)：Ø4 軸對 Ø4.2 下套孔
- [D11-P01](../D11-P01/PART.md)：穿過 Ø4.1 軸座孔
- [D11-P05a](../D11-P05a/PART.md)：穿過 Ø4.2 撥臂孔
- [D11-P09](../D11-P09/PART.md)：Ø3.2 扣槽
- [D11-P10](../D11-P10/PART.md)：下止推墊圈

07 穿入肩銷：沿垂直軸，依序穿過上壁、軸套、把手、撥臂與下壁。 唯一動作來源為 [door-handle-assembly-paths.mjs](../../native/source/door-handle-assembly-paths.mjs)。

## 可用範圍及限制

- 小型轉動機構的肩銷幾何參考
- 這是銷軸而非螺絲；材料、硬度、表面及剪切承載均未定。

## 檢查與待辦

- PASS · 重新讀取 OBJ 和 geometry.json 的全部三角面及法線，與原生輸出逐位雜湊比較；判定：面數、各 surface、位置及法線全部相符。
- PASS · 以 0.00001 mm 座標併點統計連通與有向邊、計算有向體積；判定：一連通、每邊兩面反向、無零面積或非有限座標、正體積。
- 尚未完成：選定材料及公差並檢查支承面壓與銷軸剪切；對扣環開合與裝入做實體路徑驗證。

[本次實際幾何讀回](evidence/native-readback.json) · [整體入口](../../START-HERE.md)

## 圖面適用範圍

- [references/D11-P03-model-r2.png](references/D11-P03-model-r2.png) · NATIVE_MODEL_VIEW：同一份模型的正面 +Y、背面 -Y、頂面 +Z、底面 -Z、端面 +X 與斜視；以原生尺寸和孔軸為準。 R2 零件圖已對應修正後 R3 肩銷。

<!-- mathematical-quality -->

## 數學與現實規律怎麼用

[逐件公式、代入與實體讀回](../../math-quality.html#D11-P03) · [機器資料](../../math-quality.json)

### 封閉、有向與頂點鄰域

- 狀態：PASS
- 公式：每條邊恰有兩個反向面；每個頂點的 link 是一個環。
- 輸入：`{"weldGridMm":0.00001}`
- 讀回：`{"vertices":962,"edges":2880,"faces":1920,"eulerCharacteristic":2,"badEdgeIncidence":0,"badOrientedEdges":0,"badVertexLinks":0,"weldGridMm":0.00001,"selfIntersectionExamined":false}`
- 判準：邊、面方向、頂點鄰域異常均為 0；一個連通體。
- 方法：逐一讀取 OBJ 的全部三角面與頂點鄰接。
- 用途：排除破口、反面和只在單點相接的假實體；不宣稱已檢查所有自交。
- 修正或下一步：回到原生幾何修補相鄰面；不可只刪除失敗報告。

### 體積積分與基準點不變性

- 狀態：PASS
- 公式：V = Σ (a−o)·[(b−o)×(c−o)] / 6
- 輸入：`{"originA":[0,0,0],"originB":[-46,-10,0],"unit":"mm"}`
- 讀回：`{"signedVolumeMm3":548.7030293130293,"originDifferenceMm3":3.069544618483633e-12}`
- 判準：正的代數體積；兩個基準點之差 ≤ max(10⁻⁷ mm³, |V|×10⁻⁸)。
- 方法：兩次獨立基準的逐三角面積分。
- 用途：成立於封閉有向邊界；自交未全驗時，只稱代數體積。數值門檻不是加工公差。
- 修正或下一步：核對面方向、漏面、座標尺度與浮點誤差。

### 讀回綁定同一零件與單位

- 狀態：PASS
- 公式：原生→OBJ 的三角位置身分相同；全程長度單位 mm。
- 輸入：`{"id":"D11-P03","sourceSHA256":"34ff94129df4c8c3815473d7171b0c6351ee60f1471a1479f7ecd74c520a9ab0"}`
- 讀回：`{"objSHA256":"254af25c8dd656afaf42650f44f2cdc1f5b699a8d17f36a528b1e4dda6345d99","positionTriangleSHA256":"cc105a2f1ff2017c89520285d09c2c1025ffdcb625cab540b78c6e7655de1260","units":"mm","frameUnits":"mm"}`
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

### 孔軸截面：D11-P01／D11-P03

- 狀態：PASS
- 公式：c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]
- 輸入：`{"holeDiameterMm":4.1,"shaftDiameterMm":4,"axis":[-46,-10],"zMm":0,"nominalEccentricityMm":0}`
- 讀回：`{"nominalRadialGapMm":0.04999999999999982,"sampledMinGapMm":0.049962934151825955,"sampledMaxGapMm":0.05000011787623304,"rays":48,"holePolygon":{"vertices":512,"maxAngularGapRadians":0.01227334515308609,"maxSagMm":0.00003860009793326124},"shaftPolygon":{"vertices":96,"maxAngularGapRadians":0.06545136184239375,"maxSagMm":0.0010708746137388925},"coordinateNumericalAllowanceMm":0.00001}`
- 判準：本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。
- 方法：從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。
- 用途：此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。
- 修正或下一步：若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。

### 孔軸截面：D11-P11a／D11-P03

- 狀態：PASS
- 公式：c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]
- 輸入：`{"holeDiameterMm":4.2,"shaftDiameterMm":4,"axis":[-46,-10],"zMm":-10,"nominalEccentricityMm":0}`
- 讀回：`{"nominalRadialGapMm":0.10000000000000009,"sampledMinGapMm":0.09999864974836292,"sampledMaxGapMm":0.10000276014862242,"rays":48,"holePolygon":{"vertices":96,"maxAngularGapRadians":0.06545060683881765,"maxSagMm":0.0011243924057994237},"shaftPolygon":{"vertices":96,"maxAngularGapRadians":0.06545136184239375,"maxSagMm":0.0010708746137388925},"coordinateNumericalAllowanceMm":0.00001}`
- 判準：本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。
- 方法：從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。
- 用途：此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。
- 修正或下一步：若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。

### 孔軸截面：D11-P11b／D11-P03

- 狀態：PASS
- 公式：c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]
- 輸入：`{"holeDiameterMm":4.2,"shaftDiameterMm":4,"axis":[-46,-10],"zMm":10,"nominalEccentricityMm":0}`
- 讀回：`{"nominalRadialGapMm":0.10000000000000009,"sampledMinGapMm":0.09999864974836292,"sampledMaxGapMm":0.10000276014862242,"rays":48,"holePolygon":{"vertices":96,"maxAngularGapRadians":0.06545060683881765,"maxSagMm":0.0011243924057994237},"shaftPolygon":{"vertices":96,"maxAngularGapRadians":0.06545136184239375,"maxSagMm":0.0010708746137388925},"coordinateNumericalAllowanceMm":0.00001}`
- 判準：本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。
- 方法：從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。
- 用途：此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。
- 修正或下一步：若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。

### 孔軸截面：D11-P05a／D11-P03

- 狀態：PASS
- 公式：c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]
- 輸入：`{"holeDiameterMm":4.2,"shaftDiameterMm":4,"axis":[-46,-10],"zMm":-4,"nominalEccentricityMm":0}`
- 讀回：`{"nominalRadialGapMm":0.10000000000000009,"sampledMinGapMm":0.09999865089982674,"sampledMaxGapMm":0.10000276921665763,"rays":48,"holePolygon":{"vertices":384,"maxAngularGapRadians":0.01636361150077459,"maxSagMm":0.00007028865049769628},"shaftPolygon":{"vertices":96,"maxAngularGapRadians":0.06545136184239375,"maxSagMm":0.0010708746137388925},"coordinateNumericalAllowanceMm":0.00001}`
- 判準：本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。
- 方法：從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。
- 用途：此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。
- 修正或下一步：若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。

### 孔軸截面：D11-P10／D11-P03

- 狀態：PASS
- 公式：c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]
- 輸入：`{"holeDiameterMm":4.2,"shaftDiameterMm":4,"axis":[-46,-10],"zMm":-18.25,"nominalEccentricityMm":0}`
- 讀回：`{"nominalRadialGapMm":0.10000000000000009,"sampledMinGapMm":0.09999864974836292,"sampledMaxGapMm":0.10000276014862242,"rays":48,"holePolygon":{"vertices":96,"maxAngularGapRadians":0.06545060683881765,"maxSagMm":0.0011243924057994237},"shaftPolygon":{"vertices":96,"maxAngularGapRadians":0.06545136184239375,"maxSagMm":0.0010708746137388925},"coordinateNumericalAllowanceMm":0.00001}`
- 判準：本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。
- 方法：從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。
- 用途：此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。
- 修正或下一步：若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。

### 肩銷逐段圓臺積分

- 狀態：PASS
- 公式：V_frustum=πh(r1²+r1r2+r2²)/3
- 輸入：`{"profileZR_mm":[[-20,0],[-20,1.7],[-19.7,2],[-19.2,2],[-19.2,1.6],[-18.5,1.6],[-18.5,2],[18,2],[18,3.5],[19.6,3.5],[20,3.1],[20,0]],"sides":96}`
- 讀回：`{"idealVolumeMm3":549.0948943772825,"polygonVolumeMm3":548.7029536390053,"meshVolumeMm3":548.7030293130324}`
- 判準：完整輪廓積分差 <0.003 mm³。
- 方法：將軸身、扣槽、肩部、倒角分段積分，與 OBJ 封閉網格比對。
- 用途：保留每一段輪廓，避免只用 Ø4×長度替代真正肩銷。
- 修正或下一步：逐段定位差異，重讀肩部孔口的剖面。

### 扣環與槽寬的軸向包容

- 狀態：PASS
- 公式：g_axial=(z槽上−z槽下)−t扣環
- 輸入：`{"grooveZmm":[-19.2,-18.5]}`
- 讀回：`{"clipZmm":[-19.18000030517578,-18.530000686645508],"clipThicknessMm":0.6499996185302734,"totalAxialGapMm":0.05000038146972652}`
- 判準：整片扣環的 Z 包絡留在扣槽中。
- 方法：直接讀取扣環 OBJ 的軸向極值。
- 用途：只證明放置包容，沒有證明張開卡入、拔出力或軸向承載。
- 修正或下一步：以真實開口、卡入位移與材料模型建立彈性插入，再查殘留變形及保持力。

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

