import fs from 'node:fs/promises';
import {createWorkshopSurfaceLibrary} from '../outputs/source/workshop-materials.mjs';

const root = new URL('../outputs/', import.meta.url);
const read = path => fs.readFile(new URL(path, root), 'utf8');
const [materialText, plantText, botanicalSource, paperSource] = await Promise.all([
  read('materials/generated/manifest.json'), read('materials/generated/plant-manifest.json'),
  read('source/factory-botanical.mjs'), read('source/factory-exhibits.mjs')
]);
const materials = JSON.parse(materialText), plants = JSON.parse(plantText);
const assets = [...materials, ...plants];
const specs = createWorkshopSurfaceLibrary({}).specs;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const generatedPath = id => 'materials/generated/' + id + '.png';
const renderPath = view => 'quality/factory-materials-r4/' + view + '.png';
const imagePaths = new Set();
function figure(src, kind, title, caption, extra = '') {
  imagePaths.add(src);
  return `<figure class="image-panel ${extra}"><div class="figure-label"><span class="tag ${kind === '實際渲染' ? 'actual' : 'reference'}">${esc(kind)}</span><span>${esc(title)}</span></div><a class="image-link" href="${src}" target="_blank" rel="noopener" aria-label="開啟原尺寸：${esc(title)}"><img src="${src}" alt="${esc(title + '；' + caption)}" loading="lazy" decoding="async"></a><figcaption>${caption}<span class="image-action">點圖開啟原尺寸 ↗</span></figcaption></figure>`;
}
const pair = (id, view, refTitle, refCaption, realTitle, realCaption, extra='') => `<div class="comparison ${extra}">${figure(generatedPath(id), 'AI 生成參考', refTitle, refCaption)}${figure(renderPath(view), '實際渲染', realTitle, realCaption)}</div>`;
const fact = (label, text) => `<div><dt>${label}</dt><dd>${text}</dd></div>`;
function values(key) {
  const s = specs[key];
  const fields = [['roughness','粗糙度'],['metalness','金屬度'],['clearcoat','清漆強度'],['clearcoatRoughness','清漆粗糙度'],['bumpMM','凹凸幅度近似 mm'],['sheen','纖維光澤'],['ior','折射率'],['attenuationDistance','衰減距離 mm']];
  return `<details class="parameters"><summary>查看目前的作者設定 · ${esc(key)}</summary><dl class="parameter-list">${fields.filter(([k])=>s[k]!==undefined).map(([k,label])=>fact(label,s[k])).join('')}</dl><p>這些數值來自目前材質程式，用於外觀施工；沒有實測反射率、normal 或 roughness 貼圖，不能據此宣稱物理已驗收。</p></details>`;
}
const lesson = (number,id,kicker,title,intro,body) => `<section class="lesson" id="${id}" aria-labelledby="${id}-title"><div class="lesson-heading"><span class="section-number">${number}</span><div><p class="eyebrow">${kicker}</p><h2 id="${id}-title">${title}</h2><p class="section-intro">${intro}</p></div></div>${body}</section>`;
const steps = items => `<ol class="steps">${items.map(([title,text])=>`<li><h4>${title}</h4><p>${text}</p></li>`).join('')}</ol>`;
const methods = (facts, assembly, check, limit) => `<div class="material-body"><dl class="material-facts">${facts.map(([a,b])=>fact(a,b)).join('')}</dl><div class="method"><h3>把材質組裝到物件上</h3>${steps(assembly)}<div class="check"><h4>轉動視角，查這個缺陷</h4><p>${check}</p></div><p class="limit"><strong>目前邊界</strong> ${limit}</p></div></div>`;

if (!botanicalSource.includes('sourceBladeMM:[133,300,.35]') || !paperSource.includes('thicknessMM:.12')) {
  throw new Error('Leaf or paper dimensions changed. Revise the lesson before building.');
}

const chapters = [
lesson('01','wood','沿著構件理解木紋','木材｜桌面與封邊要說同一種構造語言','工作桌需要可辨識的長向纖維、柔和反光，以及在邊緣繼續成立的材料。先決定它是木皮飾面還是實木，再安排紋理。',
  pair('GT01-Oak-R1','workbench','橡木色圖 · 作者指定 800 × 800 mm','AI 生成的基礎色圖。提示詞要求細孔與橫向木紋；尺度與無縫性仍需在物件上檢查。','工作桌 · r4 網頁實際渲染','看桌面長軸、封邊與櫃體交界。這張是目前模型的渲染，並非左圖已被完整還原的證明。','swatch-pair')+
  methods([
    ['基材／表層','本輪以橡木飾面和順紋封邊表達工作桌；內部板芯與膠層未建。表面以低強度清漆層呈現緞面外觀。'],
    ['方向／尺度','貼圖週期 800 × 800 mm；局部 U 軸沿構件最長方向。桌面與封邊應各自按部件方向映射，不能任意拉長同一張圖片。'],
    ['光學／用途','桌面粗糙度 0.33、清漆強度 0.25；圓角半徑設定 3 mm。用途是工作桌與展示桌的近距離辨識。']
  ],[
    ['先建立板厚與封邊','保留板材厚度、邊緣半徑與櫃體接觸；材質不會補出缺失的接縫。'],
    ['再以毫米決定重複次數','例如 2,000 mm 的桌長，沿 800 mm 圖樣會經過 2.5 個週期。移動物件時，紋理跟著局部座標移動。'],
    ['最後調反光','固定照明後觀察桌面亮帶的寬度，再微調粗糙度與清漆；保留可辨認的木孔。']
  ],'斜看桌角：木紋若突然轉 90°、邊面被拉成直線，先查 UV 與面方向。看向桌面掠射角，檢查倒角是否斷裂、桌板是否浮在櫃體上。','端木年輪沒有驗證；現在的封邊是順紋木皮外觀，不可稱為實木切面。')+values('oak-worktop')),
lesson('02','concrete','地面先有尺度，才有細節','混凝土｜細孔應留在地坪上，不要變成地形','地坪承接走道、設備與輪胎。維持大面積的穩定尺度，再讓微小孔隙和低對比色差提供近看資訊。',
  pair('GT01-Concrete-R1','floor','混凝土色圖 · 作者指定 2,000 × 2,000 mm','AI 生成的暖灰細孔外觀；圖中沒有施工縫，接縫需由獨立幾何承接。','地坪 · r4 網頁實際渲染','比較表面週期、設備落地處與標線。此圖只記錄這次照明及視角的外觀。','swatch-pair')+
  methods([
    ['基材／表層','地坪以混凝土板與研磨表面表達；切邊使用較粗糙外觀。環氧塗區與標線各有自己的塗層角色。'],
    ['方向／尺度','圖樣週期 2,000 × 2,000 mm，無主導纖維方向。凹凸幅度設定 0.18 mm，屬色圖推導的外觀近似。'],
    ['光學／用途','研磨面粗糙度 0.48；切邊 0.94。用途是區分可行走表面、板邊與塗裝區域。']
  ],[
    ['板與縫先分清','模型中的板厚、孔口和高差必須先成立；不要用貼圖陰影冒充溝槽或接縫。'],
    ['按真實面積鋪圖','以局部毫米座標設定 UV。地坪延伸時保持顆粒尺寸，避免每一塊地坪都塞入一整張圖。'],
    ['分開塗層','標線和環氧樹脂面使用各自材質；重疊面需有明確層次，避免閃爍。']
  ],'拉遠看有沒有規律雲斑方格；拉近看孔隙是否像大坑。低角度檢查腳座與輪胎的接觸，材質色差不能掩蓋懸空。','沒有真實表面掃描、骨材粒徑量測或獨立高度圖；由紅色通道推導的起伏不能作為施工粗糙度資料。')+values('polished-concrete')),
lesson('03','leather','皮面必須由座墊承托','皮革｜毛孔、包覆與縫邊各有工作','皮革的可信度同時來自細紋尺度與包覆關係。紋理再精細，泡棉穿出表面或縫線懸空仍會破壞材料感。',
  pair('GT01-Leather-R1','leather','棕褐皮革色圖 · 作者指定 250 × 250 mm','AI 生成細紋色圖，沒有摺痕、縫線或座椅形狀。','皮革應用 · r4 網頁實際渲染','讀取實際包覆表面與曲面反光；繼續檢查接縫和層間穿插。','swatch-pair')+
  methods([
    ['基材／表層','皮面以染色皮革外觀包覆座墊；皮革厚度、泡棉與支架必須由各自形體承接。'],
    ['方向／尺度','圖樣週期 250 × 250 mm。沒有指定強烈主方向；不同裁片仍應維持一致的毛孔尺度。'],
    ['光學／用途','粗糙度 0.52、清漆強度 0.10，凹凸幅度近似 0.08 mm。用於暖棕包覆件的柔和細紋。']
  ],[
    ['以共同邊界建立包覆','泡棉與皮面對應同一組曲面邊界，再分配各層偏移，尤其檢查轉角和下緣。'],
    ['裁片決定 UV','避免整個曲面只從一個平面投射；方向改變明顯的裁片需要獨立規劃，並維持 250 mm 週期。'],
    ['縫線獨立落位','縫線位置、皮邊與壓痕服務接合。色圖沒有這些構造，就不要把隨機紋路解讀成縫製完成。']
  ],'用固定角度檢查白色裂線、泡棉露出與細紋伸長。若只隱藏泡棉就消失，應回到層間幾何修正；加深皮色不能修好穿插。','目前生成色圖不是皮革樣本量測；染色、表面塗飾和毛孔高度尚未各自驗證。')+values('warm-tan-upholstery')),
lesson('04','fabric','讓織紋服從裁片','織物｜經緯方向與纖維光澤一起讀','休憩區的灰綠織布需要柔和的邊緣亮度；紗線尺寸與座墊形體必須一起成立，才不會像塑膠印花。',
  pair('GT01-Fabric-R1','fabric','斜紋布色圖 · 作者指定 320 × 320 mm','AI 生成經緯交錯外觀。生成圖中的紗線數與實際紗支沒有量測對應。','織物應用 · r4 網頁實際渲染','查看坐面、靠面與邊緣是否保持一致的紋理尺度。','swatch-pair')+
  methods([
    ['基材／表層','以羊毛混紡斜紋的外觀意圖製作；座墊填充與外層裁片仍由幾何決定。'],
    ['方向／尺度','圖樣週期 320 × 320 mm。每片經緯方向應順著裁片；斜紋對角不代表整個座墊可以任意旋轉貼圖。'],
    ['光學／用途','粗糙度 0.92、sheen 0.65、sheenRoughness 0.80。纖維光澤用於休憩座椅的邊緣表現。']
  ],[
    ['先交代裁片接合','建立坐墊、靠墊與包邊的連續輪廓，接縫要有位置與接合對象。'],
    ['維持經緯尺度','固定 320 mm 的週期，再調整裁片 UV 方向；放大座墊時不要順便放大紗線。'],
    ['近看與遠看各讀一次','近看確認纖維不過粗，遠看確認圖樣不產生干擾條紋。目前材質啟用 mipmap 與各向異性過濾。']
  ],'轉到斜角看紋路是否閃爍或形成摩爾紋；看背光邊緣是否整圈亮得像塑膠。先處理紋理密度和法向，再微調 sheen。','沒有實測織物 normal 或 roughness 圖；sheen 是作者外觀設定，不代表纖維散射已校準。')+values('sage-lounge-fabric')),
lesson('05','leaf','一片葉的兩面與一個接點','葉片｜先有葉柄連續，再談蠟質光澤','植物由葉形、弧度、正背面差異與枝葉接點共同成立。色圖提供葉脈外觀，模型負責厚度、彎曲和承托。',
  pair('GT01-Ficus-Assembly-R1','gallery','橡膠樹組裝參考 · AI 作者設計','這是生成的植物構造方向圖；所有尺寸均為作者選值，不是植物量測或已建成的模型證據。','展示區 · r4 網頁實際渲染','此圖為目前展示區情境，只能閱讀可見範圍；不能代替葉背、葉柄或盆內部的近距離檢查。')+
  `<div class="leaf-study">${figure(generatedPath('GT01-Ficus-Leaf-R1'),'AI 生成色圖','單葉輪廓與葉脈','模型從透明輪廓取樣，再建立三維葉面。葉背色彩與弧度由作者重建。','leaf-image')}<div><h3>300 × 133 × 0.35 mm</h3><p>名義葉片長 × 寬 × 厚；中央拱度設定 19 mm。主葉柄名義長度 55 mm。各片實例再依生長位置等比縮放，因此不是每片葉都具有相同的最後尺寸。</p><p class="limit">生成組裝圖提出約 1,850 mm 的整株方向；目前模型由枝幹、葉柄和葉片共同形成總包絡，不能把圖上的總高直接當成模型已讀回尺寸。</p></div></div>`+
  methods([
    ['基材／表層','葉片本體有正面、背面與封閉側緣；正面呈深綠蠟質外觀，葉背另用較淡色、較高粗糙度。'],
    ['方向／尺度','葉脈沿葉片長軸。圖像 UV 對應同一張輪廓，並非週期平鋪；葉片名義尺寸為 300 × 133 × 0.35 mm。'],
    ['光學／用途','正面粗糙度 0.40、清漆 0.22；背面粗糙度 0.68、清漆 0。用於工坊盆栽的近中距離辨識。']
  ],[
    ['從盆底往上裝','接水托盤 → 中空陶盆 → 育苗內盆 → 根土團 → 木質主莖 → 葉柄 → 葉片。盆口、土面和排水孔各有幾何。'],
    ['一個端點接一片葉','葉片基部放在葉柄末端，朝向使用同一條葉柄方向；不要只把葉片散布在樹冠裡。'],
    ['分開正背面讀取','背面不能只靠正面材質穿透；翻轉視角看側緣厚度、曲率與接點的連續性。']
  ],'側看葉基是否懸空、葉柄是否穿出葉面；由下往上檢查葉背，從上方確認土面低於盆口。幹、柄、葉的接點仍要在實際近景中確認。','葉背、彎曲與根系均屬作者重建或尚未建構；目前沒有葉片透射／次表面散射與栽培模擬。')+values('ficus-upper')),
lesson('06','metal','看見的是最外層','塗裝金屬｜鋼板可以呈現非金屬表面','抽屜櫃、設備和屋面雖以鋼材承載，觀眾看到的主要是塗膜；拉絲不鏽鋼與鍍鋅面才保留裸露金屬的反射角色。',
  pair('GT01-Workbench-Reference-R1','workbench','工作桌材質目標 · AI 生成','這張生成圖指定綠色櫃體、暖白抽屜與裸金屬工具外觀。它是目標方向，沒有增加實際模型的細節完成度。','工作桌 · r4 網頁實際渲染','在同一組構件中區分木面、塗膜與裸金屬；兩張圖片的明暗不作為量測值。')+
  methods([
    ['基材／表層','深綠鋼櫃與暖白粉體塗裝外表面使用 metalness 0；鍍鋅鋼與拉絲不鏽鋼使用 metalness 1。'],
    ['方向／尺度','塗膜沒有週期色圖或已建塗膜厚度。拉絲方向沿局部 U 軸；邊緣半徑：暖白塗裝 2 mm、拉絲件 1.2 mm。'],
    ['光學／用途','深綠塗面粗糙度 0.37、暖白粉體 0.42；拉絲不鏽鋼 0.28、anisotropy 0.48。用途是讓承載件與接觸工具可區分。']
  ],[
    ['由暴露表面分材質','一件物件可以同時包含塗面與裸露接觸面；按真實區域分配材質，不按物件名稱一律設成金屬。'],
    ['以幾何保留轉折','拉手、櫃板和檯鉗先有圓角、間隙與固定關係；反光需要可讀的邊界。'],
    ['固定光源再看反射方向','轉動相機觀察拉絲亮帶與工具邊緣。若金屬完全黑掉，先檢查環境反射是否真的包含燈面。']
  ],'檢查綠漆是否出現不合理的有色鏡面，以及金屬拉手是否像深色塑膠；局部刮傷不能靠整件提高金屬度來表示。','鍍鋅鋅花、粉體微紋與實際塗膜厚度尚未建；目前不據此判定加工或塗裝品質。')+values('warm-white-powdercoat')),
lesson('07','glass','厚度與場景單位一起走','玻璃｜能透過去，也要看得到邊緣','隔間玻璃同時有透射、表面反射與厚度。把透明度調低並不足以交代光穿過材料的路徑。',
  `<div class="glass-layout">${figure(renderPath('gallery'),'實際渲染','展示區與透明構件 · r4','僅記錄目前網頁場景。沒有獨立的玻璃生成材質目標；此處不安排虛構的「目標／成果」配對。')}<div class="glass-note"><p class="eyebrow">本輪已定位的原因</p><h3>同一份厚度，<br>不要被縮放兩次。</h3><p>原先以單位立方體加物件縮放表達玻璃，光學厚度被縮放放大。現在玻璃直接使用毫米尺寸的幾何，物件縮放維持 1，再由該片最小尺寸帶入厚度。</p><div class="formula small">幾何 mm ＋ thickness mm<br>＋ object scale = 1</div><p>修正的是厚度與座標的關係；這項修正沒有把玻璃升格為已校準的物理樣本。</p></div></div>`+
  methods([
    ['基材／表層','目前以均質玻璃透射外觀表示建築玻璃與作業隔間；夾層、膠膜和邊部封裝光學未獨立量測。'],
    ['方向／尺度','沒有色圖週期。材質初始厚度為 18 mm；每片實際建構時，以該片幾何最小尺寸覆寫厚度。'],
    ['光學／用途','IOR 1.5、transmission 1、metalness 0。建築玻璃粗糙度 0.018，衰減距離 2,200 mm；隔間玻璃為 0.024 與 1,600 mm。']
  ],[
    ['先建立真正厚度','使用封閉玻璃幾何與一致毫米單位，讓材質厚度對上同一片玻璃。'],
    ['保留框、縫與墊片','框架與橡膠決定玻璃如何被固定；不要讓玻璃和金屬共面重疊。'],
    ['檢查透射與反射各自的來源','目前材質保留 opacity 1，由 transmission 表達透射。環境圖須含可反射的光源，背景也要在實際視角中檢查。']
  ],'看厚邊是否異常變黑、面對背景是否過度扭曲；再查看物件縮放、厚度與衰減距離的單位。斜看重疊面是否閃爍，確認那不是材質本身的效果。','透射外觀仍受即時渲染近似與場景內容限制；沒有實測透光率、夾層吸收或光譜資料。')+values('clear-architectural-glass')),
lesson('08','paper','資訊需要一個承載表面','紙／油墨｜字要能讀，紙也要落在桌上','圖紙與說明牌是工坊的操作入口。紙張厚度、印刷面位置、字級與場景閱讀距離需要一起安排。',
  `<div class="paper-layout"><div class="paper-diagram" role="img" aria-label="紙張基材厚 0.12 毫米，印刷面位於局部 z 0.065 毫米，比基材頂面高 0.005 毫米的程式示意"><p class="eyebrow">層次示意 · 非渲染證據</p><div class="ink-layer">GT01　／　圖紙與品管資訊</div><div class="paper-layer">紙張基材 · 0.12 mm</div><div class="support-layer">桌面或背板承托</div><p>印刷面位於局部 z = 0.065 mm。基材半厚為 0.060 mm；兩者間 0.005 mm 是避免重疊閃爍的表示偏移，並非量測油墨膜厚。</p></div>${figure(renderPath('gallery'),'實際渲染','展示區圖紙 · r4','圖紙由本機 Canvas 文字生成後貼到印刷平面；這是程式排版，沒有 AI 生成紙張目標圖。')}</div>`+
  methods([
    ['基材／表層','紙張是 0.12 mm 薄實體；上方另放印刷面。油墨以 Canvas 產生的色圖表示，尚未各自建油墨厚度與粗糙度圖。'],
    ['方向／尺度','A4：210 × 297 mm；A0：841 × 1,189 mm；A7 橫式：105 × 74 mm。圖像依紙面比例輸出，文字沿版面閱讀方向。'],
    ['光學／用途','紙基粗糙度 0.95、印刷面 0.94、metalness 0；CanvasTexture 使用 sRGB。用途是入口導覽、零件卡與工位圖紙。']
  ],[
    ['紙張先有實際版型','以毫米建立版型與薄邊，再安排文字版面；不要把不同大小紙張都塞進同一張縮放圖。'],
    ['印刷面跟著紙張','印刷面作為紙張的子物件，翻轉或立起時保持方向、位置與邊緣一致；用小偏移及 polygonOffset 避免閃爍。'],
    ['把閱讀距離算進去','近看確認文字未被裁切，遠看保留標題與識別碼；在互動工坊點選展示物後，應能找到相應圖紙內容。']
  ],'從低角度看紙是否浮起、背板是否穿過紙；靠近看文字是否模糊、超出頁面或反向。即使紙面清楚，也要檢查其內容是否對上同一個零件。','紙纖維、透光、摺痕與油墨微觀表面尚未建立；目前是帶實體紙基的資訊表面。'))
];

const css = `
:root{--paper:#f4f1e9;--white:#fcfaf5;--ink:#263c32;--muted:#606c61;--line:#c8cdbf;--green:#234c3d;--ochre:#986633;--tint:#e8ede2;--warn:#f3e6d4;font-synthesis:none;color-scheme:light}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:28px}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Segoe UI","Microsoft JhengHei","PingFang TC",sans-serif;line-height:1.8}a{color:var(--green);text-underline-offset:4px}a:hover{text-decoration-thickness:2px}button,input{font:inherit}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid var(--ochre);outline-offset:5px}h1,h2,h3,h4,p{margin:0}h1,h2,h3,h4{line-height:1.35}h1,h2{font-family:"Georgia","Noto Serif TC","PMingLiU",serif;font-weight:500}h1{font-size:clamp(37px,5.2vw,72px);letter-spacing:.035em}h2{font-size:clamp(26px,3vw,42px)}h3{font-size:21px;font-weight:600}h4{font-size:16px;font-weight:650}p+p{margin-top:16px}img{display:block;width:100%;height:100%;object-fit:contain}figure{margin:0}.signature{font-family:Georgia,serif;font-size:15px;line-height:1.3}.skip-link{position:fixed;top:-80px;left:16px;background:var(--white);padding:12px;z-index:20}.skip-link:focus{top:16px}
.masthead{padding:20px max(5vw,20px);border-bottom:1px solid var(--line);background:var(--white);display:flex;align-items:center;gap:25px;flex-wrap:wrap}.brand{font-size:27px;letter-spacing:.2em;text-decoration:none;font-weight:400}.brand small{display:block;font-size:10px;letter-spacing:.18em;color:var(--muted)}.global-nav{display:flex;gap:24px;margin-left:auto;font-size:13px;flex-wrap:wrap}.global-nav a{padding:9px 0;text-decoration:none;border-bottom:1px solid transparent}.global-nav a:hover,.global-nav a[aria-current]{border-color:var(--green)}.page{max-width:1540px;margin:0 auto;padding:0 max(4.5vw,20px)}.hero{padding:62px 0 38px;display:grid;grid-template-columns:1.4fr 1fr;gap:50px;align-items:end}.eyebrow{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}.hero h1 span{display:block;font-size:.68em;margin-top:10px}.lede{font-size:17px;line-height:1.95;max-width:38em}.hero-note{border-top:3px solid var(--green);padding-top:17px}.hero-note p{font-size:14px}.status{margin:0 0 26px;padding:14px 18px;background:var(--warn);border-left:3px solid var(--ochre);font-size:13px}.status strong{color:#734922}.status code{white-space:nowrap}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:25px 0 32px}.figure-label{display:flex;gap:10px;align-items:center;font-size:12px;margin-bottom:10px;flex-wrap:wrap}.tag{font-size:10px;letter-spacing:.04em;padding:3px 9px;border:1px solid currentColor;white-space:nowrap}.reference{color:#805721;background:#f4e9d8}.actual{color:#254c3c;background:#e3ecdf}.image-link{display:block;aspect-ratio:1.55;background:#e5e5dd;border:1px solid var(--line);overflow:hidden}.image-link:hover{border-color:var(--green)}figcaption{font-size:12px;line-height:1.75;color:var(--muted);padding:11px 0 0}.image-action{display:block;margin-top:4px;color:var(--green);font-size:11px}.evidence-note{max-width:80ch;font-size:14px;color:var(--muted);margin:0 0 44px}.body-layout{display:grid;grid-template-columns:160px minmax(0,1fr);gap:48px;border-top:1px solid var(--line)}.toc{align-self:start;position:sticky;top:24px;margin-top:38px;font-size:12px}.toc .eyebrow{margin-bottom:13px}.toc a{display:block;text-decoration:none;padding:7px 0;color:var(--muted);line-height:1.55}.toc a:hover{color:var(--green);text-decoration:underline}.toc a strong{display:inline-block;width:25px;color:var(--ochre);font-size:11px;font-weight:500}.toc .toc-rule{margin:13px 0;border-top:1px solid var(--line)}main{min-width:0}.lesson,.principles,.workshop,.conclusion{padding:48px 0 52px;border-bottom:1px solid var(--line)}.lesson-heading{display:flex;gap:24px;align-items:flex-start;margin-bottom:26px}.section-number{font-family:Georgia,serif;font-size:41px;color:var(--ochre);line-height:1.3;min-width:48px}.lesson-heading .eyebrow{margin-bottom:6px}.section-intro{max-width:58ch;margin-top:15px;color:var(--muted);font-size:15px}.material-body{display:grid;grid-template-columns:minmax(220px,.85fr) minmax(0,1.5fr);gap:34px}.material-facts{margin:0;background:var(--tint);padding:22px 24px;align-self:start}.material-facts>div+div{margin-top:23px;padding-top:19px;border-top:1px solid #c9d3c4}dt{font-size:11px;letter-spacing:.06em;color:var(--muted);margin-bottom:7px}dd{margin:0;font-size:14px;line-height:1.9}.steps{margin:18px 0 24px;padding-left:26px}.steps li{padding-left:7px;margin-bottom:18px}.steps li::marker{color:var(--ochre);font-family:Georgia,serif}.steps p{font-size:14px;line-height:1.9;margin-top:5px}.check{border-left:3px solid var(--ochre);padding:15px 17px;background:#efe9dc}.check p{font-size:14px;margin-top:7px}.limit{font-size:12px;color:var(--muted);margin-top:18px}.limit strong{color:#76562f;font-weight:600;margin-right:5px}.parameters{border-top:1px solid var(--line);margin-top:24px;font-size:12px}.parameters summary{cursor:pointer;padding:15px 0;color:var(--green)}.parameter-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;margin:0;padding:0 0 15px}.parameter-list dd{font-family:Consolas,monospace;font-size:15px}.parameters p{max-width:70ch;color:var(--muted);padding-bottom:15px}.swatch-pair .image-panel:first-child .image-link{background:#deded5}.swatch-pair .image-panel:first-child img{object-fit:contain}.leaf-study{display:grid;grid-template-columns:210px 1fr;gap:28px;margin:28px 0 34px;align-items:center}.leaf-image .image-link{aspect-ratio:2/3;background:var(--white)}.leaf-study h3{font-family:Georgia,serif;font-size:29px;font-weight:400;margin-bottom:14px}.leaf-study p{font-size:14px}.glass-layout,.paper-layout{display:grid;grid-template-columns:1.1fr 1fr;gap:27px;margin:30px 0}.glass-note{background:var(--tint);padding:26px}.glass-note h3{font-size:28px;font-weight:400;margin-bottom:18px}.glass-note p{font-size:13px}.formula{font-family:Georgia,serif;font-size:clamp(21px,3vw,30px);line-height:1.5;color:var(--green);margin:15px 0}.formula.small{font-family:Consolas,monospace;font-size:15px;padding:15px 0;border-top:1px solid #c9d3c4;border-bottom:1px solid #c9d3c4}.paper-diagram{background:#e6e9df;padding:25px}.paper-diagram>div{padding:14px 17px;line-height:1.45}.ink-layer{background:#fcfaf4;color:#244735;border-bottom:2px solid #244735;font-size:14px}.paper-layer{background:#ddd7c9;color:#504d43;font-size:12px}.support-layer{background:#b7a88b;color:#24382d;font-size:12px;margin-top:8px}.paper-diagram>p:last-child{font-size:12px;color:var(--muted);margin-top:20px}.principle-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:26px}.principle{padding:0 0 0 18px;border-left:2px solid var(--line)}.principle h3{font-size:18px;margin-bottom:9px}.principle p{font-size:14px;line-height:1.9}.source-link{font-size:11px;display:inline-block;margin-top:6px}.calculator{margin-top:28px;background:#e4ebdf;border:1px solid #c4cfbf;padding:24px;display:grid;grid-template-columns:1.2fr 1fr;gap:25px}.calculator p,.calculator label{font-size:13px}.calculator h3{margin-bottom:8px}.calculator input[type=range]{width:100%;accent-color:var(--green);margin:12px 0}.calculator output{font-family:Georgia,serif;font-size:35px;display:block;line-height:1.4}.input-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}.input-row label span{display:block;font-size:11px;color:var(--muted);margin-bottom:4px}.input-row input{width:100%;min-width:0;padding:9px;border:1px solid var(--line);background:var(--white);border-radius:0;color:var(--ink)}.technical-note{margin-top:20px;padding:20px;background:#e7ebe2;font-size:14px}.technical-note code,code{font-family:Consolas,monospace;font-size:.9em;overflow-wrap:anywhere}.technical-note h3{font-size:18px;margin-bottom:9px}.exercise{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:25px;margin-top:24px}.exercise>div{border-top:2px solid var(--green);padding-top:15px}.exercise h3{font-size:18px}.exercise p{font-size:14px;margin-top:9px}.sources{font-size:12px;margin-top:24px;padding-left:20px}.sources li{margin-bottom:9px;overflow-wrap:anywhere}.footer{padding:32px 0 50px;font-size:12px;display:flex;gap:25px;justify-content:space-between;color:var(--muted)}.footer a{white-space:nowrap}.mobile-nav{display:none}.workshop .section-intro,.conclusion .section-intro{max-width:72ch}noscript .noscript-note{padding:10px;background:var(--warn)}
@media(min-width:1500px){.page{padding-left:70px;padding-right:70px}}@media(max-width:1100px){.body-layout{grid-template-columns:135px minmax(0,1fr);gap:28px}.material-body{grid-template-columns:1fr}.material-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.material-facts>div+div{border:0;border-left:1px solid #c9d3c4;padding:0 0 0 18px;margin:0}.glass-layout,.paper-layout{grid-template-columns:1fr}.hero{gap:28px}.global-nav{gap:15px}}@media(max-width:760px){.masthead{gap:16px;padding:16px 20px}.brand{font-size:23px}.global-nav{width:100%;margin-left:0;border-top:1px solid var(--line);padding-top:7px;justify-content:space-between;gap:9px;font-size:12px}.hero{grid-template-columns:1fr;gap:24px;padding-top:35px}.hero-note{padding-top:15px}.hero-note p{font-size:13px}.body-layout{display:block}.toc{position:static;margin-top:22px;display:flex;gap:5px 18px;flex-wrap:wrap;padding-bottom:20px;border-bottom:1px solid var(--line)}.toc .eyebrow{width:100%;margin-bottom:2px}.toc a{font-size:12px;padding:5px 0}.toc .toc-rule{display:none}.comparison{gap:14px}.figure-label{font-size:11px;gap:5px;align-items:flex-start;flex-direction:column}.comparison .image-link{aspect-ratio:1}.comparison figcaption{font-size:11px}.section-number{min-width:32px;font-size:30px}.lesson-heading{gap:14px}.lesson,.principles,.workshop,.conclusion{padding:35px 0}.material-facts{display:block}.material-facts>div+div{border:0;border-top:1px solid #c9d3c4;padding:16px 0 0;margin-top:16px}.principle-grid,.calculator,.exercise{grid-template-columns:1fr}.leaf-study{grid-template-columns:130px 1fr;gap:18px;align-items:start}.leaf-study h3{font-size:22px}.leaf-study p{font-size:12px}.leaf-image .figure-label{font-size:10px}.leaf-image figcaption{font-size:10px}.parameter-list{grid-template-columns:1fr 1fr}.footer{display:block}.footer p+p{margin-top:12px}}@media(max-width:430px){.comparison{grid-template-columns:1fr}.comparison .image-link{aspect-ratio:1.4}.comparison .figure-label{flex-direction:row;align-items:center}.leaf-study{grid-template-columns:1fr}.leaf-image{max-width:200px;margin:auto}.status code{white-space:normal}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{body{background:white;color:#111;font-size:10pt}.masthead,.toc,.calculator,.image-action,.footer a{display:none}.page{max-width:none;padding:0}.hero{padding:15px 0}.body-layout{display:block}.lesson,.principles,.workshop,.conclusion{padding:22px 0}.image-link{max-height:60mm}.material-body{grid-template-columns:1fr 1.4fr}.material-facts{display:block}.material-facts>div+div{border:0;padding:10px 0 0;margin:0}.check,figure,.lesson-heading{break-inside:avoid}a{color:inherit}.parameters{display:none}.tag{background:none}.comparison{gap:15px}h1{font-size:29pt}h2{font-size:21pt}.leaf-study{grid-template-columns:120px 1fr}.leaf-image .image-link{max-height:60mm}.status{border:1px solid #888;background:none}}
`;

const toc = [['principles','起點','先分清表面與光'],['wood','01','木材'],['concrete','02','混凝土'],['leather','03','皮革'],['fabric','04','織物'],['leaf','05','葉片'],['metal','06','塗裝金屬'],['glass','07','玻璃'],['paper','08','紙／油墨'],['practice','操作','怎麼比較'],['sources','來源','證據與限制']];
const metadata = {schema:'GT01_MATERIAL_TEACHING_R1',status:'WIP',photorealAccepted:false,wholeVehicleComplete:false,units:'mm',renderRevision:'factory-materials-r4',assets:assets.map(a=>({id:a.id,path:generatedPath(a.id),truth:a.truth,tileMM:a.tileMM??null,scaleTruth:a.scaleTruth??'AUTHOR_DESIGN_NOT_MEASURED'}))};
const html = `<!doctype html>
<html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="GT01 材質施工課：並排閱讀 AI 生成參考與實際網頁渲染，理解木材、混凝土、皮革、織物、葉片、塗裝金屬、玻璃與紙張的組裝與缺陷。"><meta name="color-scheme" content="light"><title>GT01｜材質施工課 · 從表面到組裝</title><style>${css}</style></head>
<body id="top"><a class="skip-link" href="#main">跳至教學內容</a><header class="masthead"><p class="signature">יהוה</p><a class="brand" href="GT01-atelier.html?mode=factory">GT01<small>形體 · 工藝 · 製造</small></a><nav class="global-nav" aria-label="工坊導覽"><a href="GT01-atelier.html?mode=factory">回到互動工坊 ↗</a><a href="GT01-factory-guide.html">工廠操作指南</a><a href="GT01-material-quality.html" aria-current="page">材質施工課</a></nav></header>
<div class="page"><div class="hero"><div><p class="eyebrow">GT01 ATELIER / MATERIAL NOTEBOOK 01</p><h1>材質，從表面<span>讀到構造。</span></h1></div><div class="hero-note"><p class="lede">一張色圖，並不等於一件完成的物件。從木紋的走向、玻璃的厚度，到紙張靠在哪裡，練習把看得到的質感接回能解釋的構造。</p></div></div>
<p class="status"><strong>施工中 WIP</strong> · 全頁評價均未放行。<code>寫實外觀尚未驗收</code>；整車未完成。生成參考、實際渲染與作者參數各自保留來源，不代表物理品質已驗收。</p>
${pair('GT01-Workbench-Reference-R1','workbench','希望接近的材質方向','AI 生成的工作桌材質目標，依基準構圖提出木面、塗膜與金屬外觀。這不是目前網頁的模型渲染。','材料 r4 的歷史模型畫面','r4 網頁實際渲染。檢查桌板、封邊、櫃體、工具與接觸陰影；保留尚未完成的幾何。')}
<p class="evidence-note">左右先比較同一種材料如何落在同一類構件上，再看整體照明。生成圖中的細節不會自動存在於模型；實際渲染也只證明該次視角所顯示的外觀。</p>
<div class="body-layout"><nav class="toc" aria-label="材質章節"><p class="eyebrow">本頁閱讀路徑</p>${toc.map(([id,num,name])=>`<a href="#${id}"><strong>${num}</strong>${name}</a>`).join('')}<div class="toc-rule"></div><a href="#top">回到頁首 ↑</a></nav><main id="main">
<section class="principles" id="principles" aria-labelledby="principles-title"><p class="eyebrow">先讀表面，再調參數</p><h2 id="principles-title">把四件事分清楚。</h2><div class="principle-grid"><div class="principle"><h3>色彩與資料走不同路</h3><p>色圖以 sRGB 輸入後轉入線性運算。現有程式將 Color 設為 <code>SRGBColorSpace</code>，凹凸代理設為 <code>NoColorSpace</code>；normal、roughness 等資料不能當成一般彩色照片處理。</p><a class="source-link" href="https://google.github.io/filament/main/filament.html" target="_blank" rel="noopener">原理來源：Filament →</a></div><div class="principle"><h3>粗糙度決定亮帶形狀</h3><p>roughness 調整微表面反射分布；它不是亮度滑桿。先固定燈光與曝光，再觀察高光寬窄。畫面太暗時，先查照明與色彩管線。</p><a class="source-link" href="https://google.github.io/filament/main/filament.html" target="_blank" rel="noopener">原理來源：Filament →</a></div><div class="principle"><h3>辨認最外層是什麼</h3><p>金屬度描述暴露表面的角色。被不透明漆膜覆蓋的鋼件，以非金屬塗面表示；裸金屬另行分區。清漆則是額外的透明表層。</p><a class="source-link" href="https://google.github.io/filament/main/filament.html" target="_blank" rel="noopener">原理來源：Filament →</a></div><div class="principle"><h3>貼圖尺寸是作者假設</h3><p>800 mm 木紋和 250 mm 皮革指的是整張圖的場景週期，不是實測纖維或毛孔尺寸。旋轉構件後，圖樣仍應跟著它的局部方向走。</p><a class="source-link" href="source/workshop-materials.mjs">本機來源：材質與毫米映射 →</a></div></div>
<div class="calculator" aria-labelledby="fresnel-title"><div><p class="eyebrow">簡短練習 / 垂直入射</p><h3 id="fresnel-title">玻璃正面也有反射。</h3><div class="formula">F₀ = ((n₁ − n₂) / (n₁ + n₂))²</div><p>空氣取 n₁ = 1，玻璃設定 n₂ = 1.5 時，F₀ = 4%。這是介電質界面的垂直入射關係，並非整片玻璃的透光率。</p><a class="source-link" href="https://google.github.io/filament/main/filament.html" target="_blank" rel="noopener">公式依據：Filament →</a></div><div><label for="ior">改變示範折射率 n₂：<strong id="ior-label">1.50</strong></label><input id="ior" type="range" min="1" max="2.3" step="0.01" value="1.5"><output id="fresnel-output" for="ior" aria-live="polite">4.00%</output><p>只計算公式，不模擬玻璃外觀。這個控制不會更改互動工坊中的材質。</p></div></div>
<div class="technical-note"><h3>色圖的紅色通道，目前只是凹凸代理。</h3><p>現有材料把同一張生成色圖的 red 通道送到 bump。這讓色差帶出起伏感，卻可能把深色染料當成凹陷。<strong>沒有實測 normal／roughness，也沒有量測高度。</strong>近看時必須查這種近似是否製造了不合理凹凸；它也不會改變物件輪廓。</p></div></section>
${chapters.join('\n')}
<section class="workshop" id="practice" aria-labelledby="practice-title"><p class="eyebrow">帶著問題回到工坊</p><h2 id="practice-title">每一次比較，只改一個原因。</h2><p class="section-intro">在<a href="GT01-atelier.html?mode=factory">互動工坊</a>拖曳旋轉、滾輪近看，保留相同觀看距離。先讀構件，再讀材料；修改後回到同一角度，確認可見差異。</p><div class="exercise"><div><h3>01 · 先看承托與交界</h3><p>桌面是否靠在櫃體上、皮面是否包住泡棉、葉片是否接上葉柄。接合錯了，先改形體與位置。</p></div><div><h3>02 · 再看毫米尺度</h3><p>把注意力移到一個已知尺寸的部件。木孔、毛孔、織紋是否在相鄰表面忽大忽小；先查映射週期。</p></div><div><h3>03 · 最後讀光學反應</h3><p>固定光線，轉動視角。看亮帶是否連續、玻璃是否過黑、纖維邊光是否過強，再調整對應材料設定。</p></div></div>
<div class="technical-note"><h3>這次的第二個原因：環境圖沒有收進遠處燈面。</h3><p>場景以 mm 建構，環境燈面距離達數千 mm；PMREM <code>fromScene</code> 的原先預設 far = 100 因而看不到它們。本輪改成 <code>fromScene(env, .035, 10, 50000)</code>，讓環境擷取範圍包含燈面。這解釋反射缺失的一個來源；後續仍需在同一視角讀取外觀。</p><p><a href="source/atelier-viewer.mjs">查看目前環境設定</a>。<a href="https://threejs.org/docs/pages/MeshPhysicalMaterial.html" target="_blank" rel="noopener">Three.js 官方文件</a>也指出環境貼圖對此材質的呈現有幫助。<em>此頁沒有燈光校準報告。</em></p></div>
<div class="calculator" aria-labelledby="tile-title"><div><p class="eyebrow">簡短練習 / 週期數</p><h3 id="tile-title">尺寸改了，紋理不要跟著長大。</h3><p>沿單一方向，圖樣週期數 = 部件長度 ÷ 貼圖代表長度。這是 UV 密度的讀法，不能拿來推算生成圖中的真實纖維尺寸。</p></div><div><div class="input-row"><label for="part-mm"><span>部件長度 mm</span><input id="part-mm" type="number" value="2000" min="1" max="100000" step="1" inputmode="decimal"></label><label for="tile-mm"><span>貼圖代表長度 mm</span><input id="tile-mm" type="number" value="800" min="1" max="100000" step="1" inputmode="decimal"></label></div><output id="tile-output" for="part-mm tile-mm" aria-live="polite">2.50 個週期</output></div></div></section>
<section class="conclusion" id="sources" aria-labelledby="sources-title"><p class="eyebrow">來源與交付邊界</p><h2 id="sources-title">讓每張圖保留自己的身分。</h2><p class="section-intro">生成色圖與植物圖是作者設計素材；材料 r4 圖片是該版網頁的歷史渲染，早於目前工作臺與配置修訂。尺寸和光學數值除公式示範外均為程式設定或作者尺度選擇，沒有材料實測資料。全部評價保持 <strong>WIP</strong>，<code>寫實外觀尚未驗收</code>，整車未完成。</p><ul class="sources"><li><a href="materials/generated/manifest.json">材料生成清單</a>：橡木、混凝土、皮革、織物與工作桌目標的來源身分。</li><li><a href="materials/generated/plant-manifest.json">植物生成清單</a>、<a href="source/factory-botanical.mjs">植物組裝程式</a>：單葉、葉柄、莖與盆體的作者構造。</li><li><a href="source/workshop-materials.mjs">材質程式</a>、<a href="source/factory.mjs">工坊構造</a>、<a href="source/factory-exhibits.mjs">紙張與展示構造</a>：本頁引用的實際設定與分層。</li><li><a href="quality/factory-materials-r4/workbench.png">工作桌</a> · <a href="quality/factory-materials-r4/gallery.png">展示區</a> · <a href="quality/factory-materials-r4/leather.png">皮革</a> · <a href="quality/factory-materials-r4/fabric.png">織物</a> · <a href="quality/factory-materials-r4/floor.png">地坪</a>：r4 原尺寸實際渲染。</li><li><a href="https://google.github.io/filament/main/filament.html" target="_blank" rel="noopener">Filament 官方渲染說明</a>、<a href="https://threejs.org/docs/pages/MeshPhysicalMaterial.html" target="_blank" rel="noopener">Three.js MeshPhysicalMaterial 官方文件</a>：光學與材質參數概念。外部連結需連線；閱讀本頁不需網路。</li></ul><p class="limit">離線保存時，請保留本 HTML 與同層的 <code>materials/</code>、<code>quality/</code> 目錄。導航與來源連結另需相應 HTML 與 <code>source/</code> 目錄；本頁不載入外部字型、程式庫或遠端圖片。</p></section>
</main></div><footer class="footer"><p>GT01 · 材質施工課<br>作者設計／實際渲染並列 · 2026-09-22 · 全部 WIP</p><p><a href="GT01-atelier.html?mode=factory">回到互動工坊 ↗</a><br><a href="GT01-factory-guide.html">開啟工廠操作指南 →</a></p></footer></div>
<script type="application/json" id="material-teaching-data">${JSON.stringify(metadata).replace(/</g,'\\u003c')}</script>
<script>
const iorInput=document.getElementById('ior');
function updateFresnel(){const n=Number(iorInput.value);document.getElementById('ior-label').textContent=n.toFixed(2);document.getElementById('fresnel-output').textContent=(100*((1-n)/(1+n))**2).toFixed(2)+'%';}
iorInput.addEventListener('input',updateFresnel);updateFresnel();
function updateTile(){const length=Number(document.getElementById('part-mm').value),tile=Number(document.getElementById('tile-mm').value);document.getElementById('tile-output').textContent=Number.isFinite(length)&&Number.isFinite(tile)&&length>0&&tile>0?(length/tile).toFixed(2)+' 個週期':'請輸入大於 0 的毫米數';}
document.getElementById('part-mm').addEventListener('input',updateTile);document.getElementById('tile-mm').addEventListener('input',updateTile);updateTile();
</script></body></html>`;

await Promise.all([...imagePaths].map(path=>fs.access(new URL(path,root))));
await fs.writeFile(new URL('GT01-material-quality.html',root), html, 'utf8');
console.log(JSON.stringify({output:new URL('GT01-material-quality.html',root).pathname,bytes:Buffer.byteLength(html),materialChapters:chapters.length,localImages:imagePaths.size,photorealAccepted:false,wholeVehicleComplete:false}));
