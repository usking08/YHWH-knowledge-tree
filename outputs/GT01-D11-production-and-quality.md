יהוה

# GT01 D11 製作、回裝與品管交接

本文件對應 D11-FIRST-ARTICLE-R3 的十件已形成首件。整車與完整外把手持續施工，局部通過不代表完整總成通過。

## 接手入口

1. 開啟 [逐件工坊](GT01-handle-assembly.html)，逐件看形狀、六視圖、剖面與十步回裝。
2. 開啟 [缺陷重現與紅圈對照](GT01-handle-quality.html)，先看下列兩個失敗案例與修正理由。
3. 讀 [機器可讀案例](quality/door-handle-quality-cases.json)、[回裝路徑](source/door-handle-assembly-paths.mjs) 及每件來源。
4. 修改後重新建置、讀回當前形體與路徑；不能只改文字、圖名或通過狀態。

## 座標與角度

單位 mm。X 沿把手長度，Y 向車外，Z 向上。樞軸中心為 (-46,-10)，方向 (0,0,1)。正面由 +Y 看向物件、上方為 +Z；此角度中 −X 會出現在畫面右側。接合說明使用零件編號、座標與高度，不能用沒有綁定觀看方向的「左、右」代替。轉動示意範圍0–30°。

## D11-Q01：軸套在終點能放好，途中卻穿過面板

![修正前後與圈註](references/D11-Q01-comparison-r1.png)

**用途：** 上軸套支承肩銷，隔開把手軸座與盒體上壁。需要在其他零件已裝好的情況下，真正送得進去。

**原因：** 只看完成位置，漏查外面板阻擋前方通路。舊軸套沿 +Y 進入時，Z=7..14.5 的管壁穿過面板。

**修正理由：** 加長軸套，使它同時穿過上壁。擴大的是盒體上方的軸套安裝孔；肩銷配合孔仍由軸套的 Ø4.2 內孔提供。

**觀看角度：** 斜視由 +X、+Y、+Z 看向轉軸；紅圈由實際碰撞座標投影。

```json
{
  "before": {
    "length": 7.5,
    "outerDiameter": 5.5,
    "innerDiameter": 4.2,
    "path": "Y +24 → 0",
    "carrierUpperBore": 4.2,
    "collisionVertices": 480,
    "collisionCountMeaning": "21個位置中累計的雙向頂點穿入事件，不是480個獨立缺陷",
    "example": {
      "progress": 0.5,
      "host": "D11-P01",
      "direction": "moving into installed",
      "point": [
        -47.674095153808594,
        -0.18172168731689453,
        7
      ]
    }
  },
  "after": {
    "length": 11,
    "outerDiameter": 5.5,
    "innerDiameter": 4.2,
    "path": "Z +14 → 0",
    "carrierUpperBore": 5.7,
    "axialZ": [
      7,
      18
    ],
    "radialCaseClearance": 0.1,
    "topFlushZ": 18
  }
}
```

程式與數值：

- `door-handle-return.mjs:29`：上軸套形體；搜尋 `geometry:ring(7,11)`。
- `door-handle-carrier.mjs:14`：上方裝入孔；搜尋 `upperDrill=circle`。
- `door-handle-assembly-paths.mjs:8`：唯一回裝路徑；搜尋 `id:'D11-P11b'`。

```diff
- 上軸套 ring(7, 7.5)；Z = 7..14.5
+ 上軸套 ring(7, 11)；Z = 7..18
- 盒體上孔半徑 2.1
+ 盒體上孔半徑 2.85；肩銷孔由軸套內徑4.2提供
- 回裝：前方 Y+24 → 0
+ 回裝：上方 Z+14 → 0
```

**判定：** 舊路徑重現480次穿入；新路徑21個位置，雙向實際網格頂點無穿入；長11管體、Ø5.7上孔與頂端齊平由剖面讀回。

**接手標準：** 每個零件必須同時驗完成位置與裝入通路；碰到封閉面不能直接穿過。

## D11-Q02：名義孔徑夠大，小倒角仍侵入孔口

![修正前後與圈註](references/D11-Q02-comparison-r1.png)

**用途：** 肩銷維持上下支承、把手與撥臂同軸；肩部承壓面應貼合支承端面，軸身必須在孔內留出配合空間。

**原因：** 舊肩銷在 Z17.8..18 由半徑2.0擴到2.2，超過舊盒孔半徑2.1。名義 Ø4 軸和 Ø4.2 孔的比較漏掉了局部過渡表面。

**修正理由：** 軸身保持 R2 到肩部平面，不讓向外增厚的過渡進入孔內。肩部接觸上軸套與盒體端面；新上孔另有軸套，不能把 Ø5.7 誤當成肩銷直接配合孔。

**觀看角度：** Y=-9.97 的真實網格剖切，近看 X≈-48.1、Z≈17.95；局部放大率遠大於整體圖，沒有放大實際缺陷尺寸。

```json
{
  "before": {
    "shaftDiameter": 4,
    "nominalBore": 4.2,
    "transitionZ": [
      17.8,
      18
    ],
    "transitionRadius": [
      2,
      2.2
    ],
    "limitingRadialIntrusion": 0.1,
    "collisionVertices": 64,
    "collisionCountMeaning": "孔口圓周64個取樣頂點的穿入事件",
    "example": {
      "progress": 1,
      "host": "D11-P02",
      "direction": "installed into moving",
      "point": [
        -48.099998474121094,
        -10,
        18
      ]
    }
  },
  "after": {
    "shaftRadiusBeforeShoulder": 2,
    "shoulderZ": 18,
    "headDiameter": 7,
    "bushingInnerDiameter": 4.2,
    "nominalRadialClearance": 0.1
  }
}
```

程式與數值：

- `door-handle-hardware.mjs:5`：肩銷實際旋轉輪廓；搜尋 `id:'D11-P03'`。
- `door-handle-assembly-paths.mjs:9`：肩銷裝入軸向；搜尋 `id:'D11-P03'`。

```diff
// 輪廓點的格式是 [Z, 半徑]，不是直徑。
- [17.8, 2], [18, 2.2], [18, 3.5]
+ [18, 2], [18, 3.5]
```

**判定：** 舊輪廓重現64個孔口頂點穿入；修正後肩銷整段裝入的取樣穿入為0；檢查局部半徑、肩部高度、內孔與端面，不只看名義直徑。

**接手標準：** 倒角、肩部、扣槽與局部過渡都屬於真實包絡；必須連同孔口與承壓端面檢查。

## 十件逐項用途與實際包絡

### D11-P01 一體面板、背肋與轉軸座

外部握持面、背肋與軸座同一連續成形件；單平邊 D 形端部把轉動傳給撥臂。

![同一模型六視圖](references/D11-P01-model-r2.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-69,-15,-11],"max":[69,0,11]}` mm。
- 原生讀回：13350 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "units": "mm",
  "coordinateFrame": {
    "X": "length",
    "Y": "outboard",
    "Z": "up"
  },
  "pivot": {
    "position": [
      -46,
      -10,
      0
    ],
    "axis": [
      0,
      0,
      1
    ],
    "boreDiameter": 4.1,
    "bossOuterDiameter": 10,
    "bossAxialZ": [
      -3,
      7
    ],
    "boreAxialZ": [
      -3,
      7
    ],
    "through": true,
    "extraYBore": false,
    "actuatorKey": {
      "type": "single D flat",
      "flatY": -14,
      "axialZ": [
        -3,
        -2
      ]
    }
  },
  "panel": {
    "length": 138,
    "height": 22,
    "endRadius": 11,
    "outerFaceY": 0,
    "backFaceY": -3,
    "edgeFilletRadius": 0.6,
    "envelope": {
      "min": [
        -69,
        -3,
        -11
      ],
      "max": [
        69,
        0,
        11
      ]
    }
  },
  "rib": {
    "axialZ": [
      -2,
      2
    ],
    "neckAxialX": [
      -51,
      -41
    ],
    "neckY": [
      -10,
      -3
    ],
    "rootFaceY": -3,
    "rootAxialX": [
      -51,
      20
    ],
    "taperStart": [
      -41,
      -8
    ],
    "taperEnd": [
      20,
      -3
    ],
    "continuousWithPanelAndBoss": true
  },
  "outerEnvelope": {
    "min": [
      -69,
      -15,
      -11
    ],
    "max": [
      69,
      0,
      11
    ]
  },
  "designAuthority": "AUTHOR_DESIGN",
  "references": [
    "D11-P01-r1.png",
    "D11-handle-r1.png"
  ],
  "referenceAuthority": "generated shape candidates, not measurements",
  "materialBoundary": {
    "materialProvidedByParent": true,
    "formIntent": "single continuous cast or moulded lever with applied green finish",
    "materialGrade": "UNSPECIFIED",
    "manufacturingValidated": false
  },
  "assemblyOrAestheticAcceptance": "NOT_CLAIMED"
}
```

### D11-P02 空心承載盒

空心盒體定位孔軸、支承肩銷與軸套；下方一體支點承接回位彈簧下腳。

![同一模型六視圖](references/D11-P02-model-r3.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-93,-34,-19],"max":[93,-1,19]}` mm。
- 原生讀回：3160 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "pivotAxis": [
    0,
    0,
    1
  ],
  "pivotOrigin": [
    -46,
    -10,
    0
  ],
  "pivotBores": {
    "upper": 5.7,
    "lower": 4.2
  },
  "opening": [
    145,
    29
  ],
  "earCentres": [
    [
      -85,
      0
    ],
    [
      85,
      0
    ]
  ],
  "mountingBores": 5.2,
  "springAnchor": {
    "bounds": [
      [
        -44.25,
        -23,
        -14.5
      ],
      [
        -42.75,
        -18,
        -11.5
      ]
    ],
    "contactPlaneX": -42.75
  },
  "cablePortal": {
    "centre": [
      -28,
      -32.75,
      -4.55
    ],
    "axis": [
      0,
      1,
      0
    ],
    "diameter": 5.5
  },
  "material": "AUTHOR_DESIGN_POLYMER",
  "complete": false,
  "missing": [
    "cable sheath retention",
    "travel stop seat",
    "structural load verification"
  ]
}
```

### D11-P03 肩銷與止退槽

把上下支承、把手與撥臂串在同一條 Z 軸；頭部端面承壓，下端槽容納扣環。

![同一模型六視圖](references/D11-P03-model-r2.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-49.5,-13.5,-20],"max":[-42.5,-6.5,20]}` mm。
- 原生讀回：1920 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ]
}
```

### D11-P04 雙切向腳回位扭簧

連續鋼線形成回位扭簧；下腳接盒體，上腳接撥臂。形體轉動採等線長示意，預壓與承載須另行驗證。

![同一模型六視圖](references/D11-P04-model-r1.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-49.94992446899414,-23,-13.050000190734863],"max":[-42.04999923706055,-6.0500168800354,-7.251976013183594]}` mm。
- 原生讀回：31536 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "wireDiameter": 0.7,
  "turns": 6.5,
  "meanDiameter": 7.2,
  "coilCentrelineZ": [
    -12.7,
    -7.6
  ],
  "pitch": 0.7846153846153846,
  "legLength": 13,
  "fixedLeg": {
    "x": -42.4,
    "y": [
      -23,
      -10
    ],
    "z": -12.7,
    "contactPlaneX": -42.75
  },
  "movingLeg": {
    "x": -49.6,
    "y": [
      -23,
      -10
    ],
    "z": -7.6,
    "contactPlaneX": -49.95
  },
  "motion": "LENGTH_PRESERVING_SHAPE_STUDY",
  "angleDegrees": 0,
  "coilCentrelineLength": 147.08873790600092,
  "restCoilCentrelineLength": 147.08873790600092,
  "radialAdjustment": 0,
  "stressValidated": false
}
```

### D11-P05a D 形凹座拉索撥臂

以 D 形凹座接把手，下方凸塊接彈簧；開槽圓眼預留拉索端頭，端頭及其止退仍需施工。

![同一模型六視圖](references/D11-P05a-model-r1.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-52,-23,-8.399999618530273],"max":[-24.600000381469727,-4,-2.0999999046325684]}` mm。
- 原生讀回：7780 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "units": "mm",
  "coordinateFrame": {
    "X": "handle length",
    "Y": "outboard",
    "Z": "up"
  },
  "designAuthority": "AUTHOR_DESIGN",
  "sourceShapeCandidate": "D11-P05-r1.png",
  "pivot": {
    "centre": [
      -46,
      -10
    ],
    "axis": [
      0,
      0,
      1
    ],
    "boreDiameter": 4.2,
    "boreAxialZ": [
      -6,
      -3.1
    ],
    "throughBase": true,
    "outerRadius": 6
  },
  "plate": {
    "axialZ": [
      -6,
      -3.1
    ],
    "thickness": 2.9,
    "backFaceRecesses": false
  },
  "dSeat": {
    "centre": [
      -46,
      -10
    ],
    "axis": [
      0,
      0,
      1
    ],
    "radius": 5.1,
    "flatY": -14.1,
    "flatCount": 1,
    "keepHalfPlane": "Y >= -14.1",
    "floorZ": -3.1,
    "rimZ": -2.1,
    "recessDepth": 1,
    "throughLargeOpening": false,
    "collarOuterRadius": 6
  },
  "cableEye": {
    "centre": [
      -28,
      -10
    ],
    "axis": [
      0,
      0,
      1
    ],
    "outerRadius": 3.4,
    "holeRadius": 2.075,
    "slotWidth": 1.4,
    "slotDirection": [
      0,
      -1,
      0
    ],
    "slotX": [
      -28.7,
      -27.3
    ],
    "axialZ": [
      -6,
      -3.1
    ],
    "openToExterior": true
  },
  "rearLeg": {
    "relativeToPivot": {
      "x": [
        -6,
        -3.5
      ],
      "y": [
        -13,
        -4
      ]
    },
    "globalX": [
      -52,
      -49.5
    ],
    "globalY": [
      -23,
      -14
    ],
    "axialZ": [
      -6,
      -3.1
    ]
  },
  "springContact": {
    "blockX": [
      -51.45,
      -49.95
    ],
    "blockY": [
      -23,
      -18
    ],
    "blockZ": [
      -8.4,
      -6
    ],
    "planeX": -49.95,
    "outwardNormal": [
      1,
      0,
      0
    ],
    "joinedRootArea": 7.5,
    "contactFaceBounds": {
      "min": [
        -49.95,
        -23,
        -8.4
      ],
      "max": [
        -49.95,
        -18,
        -6
      ]
    }
  },
  "envelope": {
    "min": [
      -52,
      -23,
      -8.399999618530273
    ],
    "max": [
      -24.600000381469727,
      -4,
      -2.0999999046325684
    ]
  },
  "materialGrade": "UNSPECIFIED",
  "loadVerification": "NOT_CLAIMED",
  "construction": "single shared boundary with collar recess, cable-eye slot and integral spring block"
}
```

### D11-P06 周界密封墊

周界密封墊隔開盒體法蘭與門皮；中央開口及兩個固定孔沿用盒體輪廓。

![同一模型六視圖](references/D11-P06-model-r1.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-93,-1,-19],"max":[93,1.16341447025124e-15,19]}` mm。
- 原生讀回：1848 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ]
}
```

### D11-P09 E 型止退扣環

E 型扣環在肩銷槽內提供止退形體。槽內定位已查，彈性張開、卡入與承載尚未完成。

![同一模型六視圖](references/D11-P09-model-r1.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-49.998260498046875,-13.121521949768066,-19.18000030517578],"max":[-42.001739501953125,-6,-18.530000686645508]}` mm。
- 原生讀回：320 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "complete": false,
  "nominalGrooveDiameter": 3.2,
  "interferenceAndInstallationUnverified": true
}
```

### D11-P10 銷軸下止推墊圈

下止推墊圈把盒體下端與扣環分開；Ø4.2 孔套在肩銷上。

![同一模型六視圖](references/D11-P10-model-r1.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-49.5,-13.5,-18.5],"max":[-42.5,-6.5,-18]}` mm。
- 原生讀回：768 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ]
}
```

### D11-P11a 下軸套與彈簧導套

下軸套承接撥臂，外側導引扭簧；與肩銷及彈簧分開成形。

![同一模型六視圖](references/D11-P11a-model-r1.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-48.75,-12.75,-14.5],"max":[-43.25,-7.25,-6]}` mm。
- 原生讀回：768 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "innerDiameter": 4.2,
  "outerDiameter": 5.5,
  "axialZ": [
    -14.5,
    -6
  ],
  "support": "carrier lower wall to cable actuator base"
}
```

### D11-P11b 上軸套

上軸套由上方穿入盒體，支承把手上座並提供 Ø4.2 肩銷配合孔。

![同一模型六視圖](references/D11-P11b-model-r2.png)

- 物理邊界：一個可獨立形成的連續實體；材料零件與視圖分區分開計數。
- 實際包絡：`{"min":[-48.75,-12.75,7],"max":[-43.25,-7.25,18]}` mm。
- 原生讀回：768 三角面、1 個連通體；開邊／反邊 0、零面積面 0。
- 接合資料：

```json
{
  "referenceFrontAxis": [
    0,
    1,
    0
  ],
  "referenceUpAxis": [
    0,
    0,
    1
  ],
  "innerDiameter": 4.2,
  "outerDiameter": 5.5,
  "axialZ": [
    7,
    18
  ],
  "support": "top-inserted bearing sleeve, flush with top wall",
  "installation": "vertical through 5.7mm upper carrier bore"
}
```

## 逐件回裝順序

|順序／零件|用途與裝入方式|路徑類型|
|---|---|---|
|01 放置空心盒體 / D11-P02|以盒體為定位基準。|`fixed`|
|02 裝入下軸套 / D11-P11a|從前方進入，底端貼合盒體下壁。|`front`；行程 24 mm|
|03 套入回位彈簧 / D11-P04|先從前方進入，再下降套住下軸套；下腳貼住盒體支點。|`front-then-down`；行程 38 mm|
|04 裝入拉索撥臂 / D11-P05a|從前方進入，再下降到下軸套；接觸塊的 X=-49.95 接面貼住上彈簧腳的負 X 側。|`front-then-down`；行程 38 mm|
|05 嵌入把手 D 形接面 / D11-P01|把手先抬高 1.2 從前方送入，再下降進入 D 形凹座。|`front-then-down`；行程 28 mm|
|06 裝入上軸套 / D11-P11b|由上方穿過盒體上孔，直到下端接觸把手座；頂端與盒體上表面齊平。|`above`；行程 14 mm|
|07 穿入肩銷 / D11-P03|沿垂直軸，依序穿過上壁、軸套、把手、撥臂與下壁。|`above`；行程 46 mm|
|08 套上下止推墊圈 / D11-P10|從下方沿肩銷套入，到盒體下承壓面。|`below`；行程 12 mm|
|09 查看扣環定位 / D11-P09|顯示槽內定位；扣環彈性張開與卡入路徑尚未驗證。|`placement-only`|
|10 貼合周界密封墊 / D11-P06|從前方套過面板，中央開口與固定孔對齊盒體。|`front`；行程 16 mm|

![D形與彈簧支承剖圖](references/D11-return-assembly-r2.png)

## 已完成的證據

- [十件封閉實體](quality/door-handle-parent-readback-r3.json)：各一個連通體，無開邊、反邊或退化面。
- [D形／彈簧接觸與七姿勢讀回](quality/door-handle-coupling-readback-r2.json)：實際網格射線與雙向頂點取樣。
- [逐件裝入](quality/door-handle-assembly-paths-r1.json)：八段剛體路徑，各21個位置，修正後無取樣穿入；扣環僅定位。
- [兩個缺陷重現](quality/door-handle-quality-cases.json)：R2形體的面數與體積對得上既有讀回；舊路徑分別重現480／64次頂點穿入。這些是事件數，不能當作獨立缺陷數。

## 接續施工，不能以清單代替完成

|項目|下一個實作／檢查動作|判定所需證據|
|---|---|---|
|拉索端接|建立端頭、真實線孔、線材、套管座與端頭止退件；對接撥臂圓眼與盒體通孔|獨立零件圖、相配孔軸、線路及裝入讀回|
|行程止擋|建立止擋實體與盒體座，定位閉合與開啟接觸面|兩端位置的接觸讀回、轉動中無新增穿入|
|門體固定|依現有盒耳孔製作固定件與門體承接座，切出實際門皮開口|裝回整車後的表面、孔位、空間與角度檢查|
|扣環卡入|先驗開口喉部與槽的接觸，再建立可說明彈性裝入的形體與方法|不能用剛體穿入或終點定位冒充彈性卡入|
|D形間隙與預壓|把配合遊隙、止擋、上腳／下腳的預置角連到同一作動模型|實際接面接觸及動作順序；等線長圖不能替代力學分析|
|完整形體品管|逐件近看，再回到總成與整車比較參考|輪廓、負空間、接合、材質、各方向實際畫面|

材料承載、疲勞與實車使用需要對應材料、載荷與實體試驗；目前資料未提供這些證據，不宣稱已取得。數位形體與組裝工作仍照上表繼續完成。
