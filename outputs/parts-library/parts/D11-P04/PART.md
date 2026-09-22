יהוה

# D11-P04 · 雙切向腳回位扭簧

以固定腳接盒體、移動腳接撥臂，提供回位結構候選。

- 狀態：作者設計實際形體，31,536 三角面，1 個連通體，體積 65.824085 mm³。完整總成及製造認證尚未完成。
- 總成分類：GT01 車輛 → D11 車門外把手 → 把手首件機構 → D11-P04
- 功能分類：彈性回位 → 扭簧
- 單位：mm；保留原生座標。精確軸線與孔軸見 [part.json](part.json)。

![實際形體](references/D11-P04-model-r1.png)

## 讀取與重建

1. 先讀 [part.json](part.json) 的座標、尺寸、接面與限制。
2. 一般建模工具載入 [part.obj](part.obj) 並保留 [part.mtl](part.mtl)；匯入單位指定 mm。
3. Three.js 用 [geometry.json](geometry.json) 的各 surfaces 呼叫 BufferGeometryLoader；全部載入。
4. 可編輯參數正本：[door-handle-return.mjs](../../native/source/door-handle-return.mjs)；相依入口 [geometry-core.mjs](../../native/geometry-core.mjs)。
5. 從庫根目錄執行 `node native/rebuild.mjs`，由同一原生來源生成並比對三角面。

## 形狀與尺寸

- 6.5 圈連續螺旋鋼線
- 一體固定腳與移動腳
- 目前原生狀態為 0°

- 線徑：0.7 mm；來源 interfaces.wireDiameter
- 圈數：6.5 turn；來源 interfaces.turns
- 平均圈徑：7.2 mm；來源 interfaces.meanDiameter
- 圈中心線 Z：[-12.7,-7.6] mm；來源 interfaces.coilCentrelineZ
- 腳長：13 mm；來源 interfaces.legLength

## 配合與裝入

- [D11-P11a](../D11-P11a/PART.md)：環繞 Ø5.5 下套
- [D11-P02](../D11-P02/PART.md)：下固定腳接 X=-42.75
- [D11-P05a](../D11-P05a/PART.md)：上移動腳接 X=-49.95

03 套入回位彈簧：先從前方進入，再下降套住下軸套；下腳貼住盒體支點。 唯一動作來源為 [door-handle-assembly-paths.mjs](../../native/source/door-handle-assembly-paths.mjs)。

## 可用範圍及限制

- 同軸扭簧的接觸與變形展示參考
- 形變為保長形狀研究，不是預壓、應力或壽命分析。

## 檢查與待辦

- PASS · 重新讀取 OBJ 和 geometry.json 的全部三角面及法線，與原生輸出逐位雜湊比較；判定：面數、各 surface、位置及法線全部相符。
- PASS · 以 0.00001 mm 座標併點統計連通與有向邊、計算有向體積；判定：一連通、每邊兩面反向、無零面積或非有限座標、正體積。
- 尚未完成：指定線材、熱處理與預壓角，求解工作扭矩、應力及疲勞；驗證兩腳在全行程內維持接觸。

[本次實際幾何讀回](evidence/native-readback.json) · [整體入口](../../START-HERE.md)

## 圖面適用範圍

- [references/D11-P04-model-r1.png](references/D11-P04-model-r1.png) · NATIVE_MODEL_VIEW：同一份模型的正面 +Y、背面 -Y、頂面 +Z、底面 -Z、端面 +X 與斜視；以原生尺寸和孔軸為準。 此圖是局部形體證據，不是承載、密封或完整總成通過。
- [references/D11-P04-r1.png](references/D11-P04-r1.png) · GENERATED_SHAPE_CANDIDATE：外形／剖面意圖參考；圖中尺寸不是量測或製造認證。 未逐點量測生成圖；尺寸及接合以原生來源為準。

<!-- mathematical-quality -->

## 數學與現實規律怎麼用

[逐件公式、代入與實體讀回](../../math-quality.html#D11-P04) · [機器資料](../../math-quality.json)

### 封閉、有向與頂點鄰域

- 狀態：PASS
- 公式：每條邊恰有兩個反向面；每個頂點的 link 是一個環。
- 輸入：`{"weldGridMm":0.00001}`
- 讀回：`{"vertices":15770,"edges":47304,"faces":31536,"eulerCharacteristic":2,"badEdgeIncidence":0,"badOrientedEdges":0,"badVertexLinks":0,"weldGridMm":0.00001,"selfIntersectionExamined":false}`
- 判準：邊、面方向、頂點鄰域異常均為 0；一個連通體。
- 方法：逐一讀取 OBJ 的全部三角面與頂點鄰接。
- 用途：排除破口、反面和只在單點相接的假實體；不宣稱已檢查所有自交。
- 修正或下一步：回到原生幾何修補相鄰面；不可只刪除失敗報告。

### 體積積分與基準點不變性

- 狀態：PASS
- 公式：V = Σ (a−o)·[(b−o)×(c−o)] / 6
- 輸入：`{"originA":[0,0,0],"originB":[-45.999961853027344,-14.5250084400177,-10.150988101959229],"unit":"mm"}`
- 讀回：`{"signedVolumeMm3":65.8240854914388,"originDifferenceMm3":5.684341886080801e-13}`
- 判準：正的代數體積；兩個基準點之差 ≤ max(10⁻⁷ mm³, |V|×10⁻⁸)。
- 方法：兩次獨立基準的逐三角面積分。
- 用途：成立於封閉有向邊界；自交未全驗時，只稱代數體積。數值門檻不是加工公差。
- 修正或下一步：核對面方向、漏面、座標尺度與浮點誤差。

### 讀回綁定同一零件與單位

- 狀態：PASS
- 公式：原生→OBJ 的三角位置身分相同；全程長度單位 mm。
- 輸入：`{"id":"D11-P04","sourceSHA256":"7779e160db32e30166f585662ee0504495ec9399821493241e1ec5194600c9d5"}`
- 讀回：`{"objSHA256":"5f742d25b6693c57aa7f9501a1bcf33f8ce11185b40baaef3d5e914c9b387f87","positionTriangleSHA256":"bc263d32aa17092263c04b0afad0a31d546b51a8ab930073579d0e89de71c190","units":"mm","frameUnits":"mm"}`
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

### 螺旋弧長與變形保長讀回

- 狀態：PASS
- 公式：L=√[(2πRN)²+H²]；折線長=Σ|p(i+1)−p(i)|
- 輸入：`{"meanRadiusMm":3.6,"turns":6.5,"heightMm":5.1,"legLengthEachMm":13,"coilSegments":624}`
- 讀回：`{"idealCoilLengthMm":147.11496301682556,"meshConstructionCoilLengthMm":147.08873790600092,"polylineTotalWithLegsMm":173.08873790600092,"poses":[{"angleDegrees":0,"lengthMm":147.08873790600092,"radialAdjustmentMm":0,"errorMm":0},{"angleDegrees":10,"lengthMm":147.0887379060196,"radialAdjustmentMm":-0.030628143076683045,"errorMm":1.8673063095775433e-11},{"angleDegrees":20,"lengthMm":147.08873790599387,"radialAdjustmentMm":-0.06099825942692405,"errorMm":-7.048583938740194e-12},{"angleDegrees":30,"lengthMm":147.08873790602823,"radialAdjustmentMm":-0.09111357767869777,"errorMm":2.731326276261825e-11}],"axialPitchMinusWireMm":0.08461538461538465}`
- 判準：四個原生變形狀態的折線長差 <10⁻⁷ mm；休止弧長近似誤差 <0.03 mm。
- 方法：呼叫目前原生彈簧工法，讀回同一模型的中心線；解析螺旋弧長獨立對照。
- 用途：只驗幾何保長。軸向節距減線徑不是最近三維圈間距；保長不是回復力模型。
- 修正或下一步：弧長錯則修中心線；剛度與預壓由材料/試驗補入，不能用縮半徑動畫假裝已算受力。

### 回位力矩與疲勞

- 狀態：NEEDS_INPUT
- 公式：M=kθ+M₀；U=½kθ²（線性區）
- 輸入：`{"testedShapeAnglesDeg":[0,10,20,30]}`
- 讀回：`{"missingInputs":["k (N·mm/rad)","預壓 M₀ (N·mm)","材料 E、屈服、疲勞資料及端部拘束"]}`
- 判準：真實輸入齊全、模型前提成立並取得對應讀回，才可判定。
- 方法：目前資料庫欄位與物理模型前提核對；沒有代填材料或載荷。
- 用途：扭簧線材主要受彎曲；不可套用直桿受扭的 GJ/L 當本件剛度。
- 修正或下一步：指定材料與工作力矩/循環，建立含端腳的彎曲模型，量測力矩–角度曲線及永久變形。

### 材料、公差與承載判定

- 狀態：NEEDS_INPUT
- 公式：ΣF=0、ΣM=0；σ_avg=F/A；τ_avg=V/A（適用截面）
- 輸入：`{"materialGrade":"未指定"}`
- 讀回：`{"missingInputs":["載荷大小/方向/循環 (N, N·mm)","材料牌號、強度與製程","公差極限及偏心 (mm)"]}`
- 判準：真實輸入齊全、模型前提成立並取得對應讀回，才可判定。
- 方法：目前資料庫欄位與物理模型前提核對；沒有代填材料或載荷。
- 用途：平均應力只是初步模型；孔口、槽、螺紋、接觸邊緣需另查應力集中與失效模式。
- 修正或下一步：先固定工況與材料，建立受力路徑及許用值，再以計算/量測驗證。禁止由顏色或正體積推得承載合格。

