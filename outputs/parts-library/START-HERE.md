יהוה

# GT01 可攜零件庫

這是 12 種實際形狀的本機零件庫：D11 外把手 R3 的十件獨立零件，及 D05 玻璃夾具的 M5 螺栓、M5 螺帽各一種。左右安置沒有重複算成種類。完整把手、完整車、承載與彈性卡入仍未完成。

## 給讀者與下一位 AI

1. 人工瀏覽直接開啟 [index.html](index.html)。每件詳情的「旋轉近看」使用同一份匯出幾何；[十步回裝](assembly.html) 和 [紅圈品管](quality.html) 隨庫附上。搜尋、兩條分類樹、零件卡與細節使用內嵌資料；圖片與檔案皆是相對路徑，不需伺服器或網路。
2. AI 先解析 [catalog.json](catalog.json)，依 `classification.assembly` 或 `classification.functionFamily` 找到零件，然後讀該件 `part.json` 和 `PART.md`。不要從縮圖猜尺寸或孔軸。
3. 使用 mm。D11 十件保留共用座標：X 沿把手、Y 向車外、Z 向上，轉軸穿過 (-46,-10) 且沿 Z。不要再施加擅自置中的位移。
4. M5 兩件保留 makeGT01GlassClamps 最終表面的斜向軸。實際方向與軸上一點見 `coordinateFrame.threadAxis`，原始 interfaces 中 [0,1,0] 是 followGlass 之前的軸。左右 component.x 是額外安置，並非新形狀。
5. 通用幾何匯入用每件 [OBJ/MTL](parts/D05-P15d/PART.md)；不能把 OBJ 牙面換成圓管。Three.js 用 `geometry.json` 的每個 surfaces，逐個用隨庫 `BufferGeometryLoader` 讀入並保留全部表面和法線。
6. 原生可編輯來源在 [native/source](native/source/door-handle.mjs)。[geometry-core.mjs](native/geometry-core.mjs) 是唯一薄接頭：直接呼叫 D11 建置函式；對原本未 export 的玻璃夾具函式，唯讀附加 export 後呼叫，沒有修改或替換原始幾何。
7. 具有 Node.js 時，於這份庫或任何其他工作目錄執行 `node 路徑/native/rebuild.mjs`。程式從自己的位置取檔，生成十二件 `rebuilt/*.obj` 並把三角面、法線雜湊與本庫比較。Three.js r160 與 MIT 授權隨庫附上；不需 npm 或遠端依賴。
8. 執行 `node 路徑/verify-library.mjs` 重新讀回 OBJ／Three JSON、欄位、連結與幾何雜湊。看 [evidence/library-readback.json](evidence/library-readback.json) 及逐件 evidence；這是幾何與封裝檢查，不是工程性能認證。
9. 裝配前讀 [assembly.json](assembly.json)。D11 的十步只有 [door-handle-assembly-paths.mjs](native/source/door-handle-assembly-paths.mjs) 一個動作實作來源。按順序建立宿主，再檢查每件接面、路徑及尚缺零件。
10. 生產新版本時先完成 [work-list.json](work-list.json) 的具體下一動作。更改參數後重建、更新圖面與同修訂讀回，並記錄材料／公差／製程；不要把可顯示網格稱作已核准製造圖。

## 現行接合與退修教學

- 上軸套長 11、Z7..18，由 +Z 穿入 Ø5.7 上孔；不可沿用舊長 7.5 或前方 +Y 裝入。[Q01 圖](references/D11-Q01-comparison-r1.png) 的 480 是 21 個位置累計的頂點穿入事件，不是 480 個獨立缺陷。
- 肩銷軸身 R2 保持到 Z18 肩面；舊過渡 R2.2 曾侵入孔口。[Q02 圖](references/D11-Q02-comparison-r1.png) 的 64 是取樣頂點事件。
- [接合剖面 R2](references/D11-return-assembly-r2.png) 使用上方／下方圓截面識別彈簧腳，修正 R1 觀看 +Y 時左右標示顛倒。兩份反例為記錄參數重建的歷史回放，不冒稱當時原始截圖。
- [證據 JSON](evidence/door-handle-quality-cases.json) 記載具體原因、修正、視角與界線。離散頂點路徑檢查不等於連續三角面碰撞、彈簧承載或完整操作驗證。

## 形狀、材料與生產界線

每件單一物理邊界保留真孔、盲凹槽、厚度及所有原生表面。尺寸來自作者參數、interfaces 或冷讀原生包絡；生成 PNG 只當形狀候選。材質色彩只供辨識，未指定金屬或聚合物等級。

尚缺的軸承、拉索、門體固定件與止擋列在待生產分類；沒有以空方塊充數。螺栓與螺帽位於螺紋緊固族，肩銷位於銷軸與軸向定位族。

整個資料夾一起複製即可搬動。庫內不依賴原專案路徑、網路、安裝 npm 套件或執行中的伺服器。JSON Schema 的標準識別網址只標示版本；本機驗證不會存取它。

<!-- mathematical-quality -->

## 數學與物理的逐件教學

先看 [數學與組裝教學](math-quality.html)，選件讀用途、前提、公式、單位、代入值、實際讀回、失敗修正及未取得輸入。離線開啟即可操作孔軸與螺紋計算器。

AI 讀 [math-quality.json](math-quality.json) 取得同一份資料，再讀 [math-admission.json](math-admission.json) 決定新零件需要哪個功能模型。不要把數學公式、物理模型與作者設計尺寸混成來源事實。

在任意工作目錄執行 `node 庫目錄/native/math-quality.mjs`，會重新讀取本庫全部 OBJ。加 `--write` 才更新證據。保留 NEEDS_INPUT；不得由幾何通過推成承載或整車完成。原生宿主是 Three.js，所以此讀取器沿用現有 Node/JavaScript，沒有新增套件。

<!-- knowledge-map -->

## 先讀用途與知識脈絡

[用途與跨域知識樹](knowledge-map.html) · [AI 可讀資料](knowledge-map.json) · [延伸與交接教學](KNOWLEDGE-GUIDE.md)

由用途找到機構，再追到接面、真實零件、形體與規律。跨產業例同時記錄可轉用內容、必須重算項目及不適用條件。明列用途、祖先脈絡和未分類資料分開顯示。
