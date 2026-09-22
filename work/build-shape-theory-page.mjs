import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// node work/build-shape-theory-page.mjs [shape-theory.json] [shape-theory.html]
// The compiler and Three.js are resolved beside the input, under native/.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.resolve(process.argv[2] || path.join(projectRoot, 'outputs/parts-library/shape-theory.json'));
const outputPath = path.resolve(process.argv[3] || path.join(path.dirname(inputPath), 'shape-theory.html'));
const files = {
  data: inputPath,
  compiler: path.join(path.dirname(inputPath), 'native/shape-compiler.mjs'),
  three: path.join(path.dirname(inputPath), 'native/source/three.mjs'),
};
const loaded = await Promise.allSettled(Object.values(files).map(file => fs.readFile(file, 'utf8')));
const missing = loaded.flatMap((result, index) => result.status === 'rejected' ? [Object.values(files)[index]] : []);
if (missing.length) throw new Error('形體教學頁尚未建置；缺少可讀取的來源，未生成替代資料：\n' + missing.join('\n'));
const [json, compiler, three] = loaded.map(result => result.value.replace(/^\uFEFF/, ''));
const data = JSON.parse(json);
validate(data);

function validate(d) {
  const require = (condition, message) => { if (!condition) throw new Error('shape-theory.json: ' + message); };
  require(d && typeof d === 'object', 'expected an object');
  for (const field of ['title', 'revision', 'intro']) require(typeof d[field] === 'string', field + ' must be a string');
  for (const field of ['roles', 'sources', 'theories', 'recipes', 'workflow']) require(Array.isArray(d[field]), field + ' must be an array');
  const ids = (items, kind) => {
    require(items.every(item => item && typeof item.id === 'string' && item.id.length), kind + ' must have nonempty IDs');
    const set = new Set(items.map(item => item.id));
    require(set.size === items.length, kind + ' IDs must be unique');
    return set;
  };
  const roles = ids(d.roles, 'role'), sources = ids(d.sources, 'source');
  const theories = ids(d.theories, 'theory'), recipes = ids(d.recipes, 'recipe');
  const strings = (value, label) => require(Array.isArray(value) && value.every(v => typeof v === 'string'), label + ' must be a string array');
  const refs = (value, set, label) => { strings(value, label); require(value.every(id => set.has(id)), label + ' references an unknown ID'); };
  for (const t of d.theories) {
    for (const field of ['title', 'kind', 'actsOn', 'formula', 'produces']) require(typeof t[field] === 'string', t.id + '.' + field + ' must be a string');
    refs(t.roleIds, roles, t.id + '.roleIds');
    refs(t.recipeIds, recipes, t.id + '.recipeIds');
    refs(t.sourceIds, sources, t.id + '.sourceIds');
    refs(t.composesWith, theories, t.id + '.composesWith');
    strings(t.premises, t.id + '.premises');
    strings(t.pitfalls, t.id + '.pitfalls');
    require(Array.isArray(t.inputs) && t.inputs.every(v => typeof v.name === 'string' && typeof v.unit === 'string'), t.id + '.inputs must contain name and unit');
    require(Array.isArray(t.applications) && t.applications.every(v => ['domain', 'object', 'how'].every(k => typeof v[k] === 'string')), t.id + '.applications must contain domain, object and how');
  }
  for (const r of d.recipes) {
    for (const field of ['name', 'domain', 'description']) require(typeof r[field] === 'string', r.id + '.' + field + ' must be a string');
    refs(r.theoryIds, theories, r.id + '.theoryIds');
    require(Array.isArray(r.parameters), r.id + '.parameters must be an array');
    require(new Set(r.parameters.map(p => p.key)).size === r.parameters.length, r.id + ': duplicate parameter keys');
    for (const p of r.parameters) {
      require(['key', 'label', 'unit'].every(k => typeof p[k] === 'string'), r.id + ': parameter names and units must be strings');
      require(['min', 'max', 'step', 'default'].every(k => Number.isFinite(p[k])), r.id + '.' + p.key + ': parameter bounds must be finite');
      require(p.max >= p.min && p.step > 0 && p.default >= p.min && p.default <= p.max, r.id + '.' + p.key + ': invalid parameter bounds');
    }
  }
}

const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const payload = JSON.stringify({ data, modules: {
  three: 'data:text/javascript;base64,' + Buffer.from(three).toString('base64'),
  compiler: 'data:text/javascript;base64,' + Buffer.from(compiler).toString('base64'),
} }).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const css = String.raw`
:root{--ink:#193b30;--muted:#5f7068;--paper:#f3f4ee;--line:#dce2d8;--accent:#275e45;--pale:#e9ede5;--fail:#973f2f;--pending:#795b20;--white:#fffefa}*{box-sizing:border-box}html{scroll-padding-top:20px}body{margin:0;background:var(--paper);color:#25392f;font:16px/1.65 system-ui,"Microsoft JhengHei",sans-serif}a{color:var(--accent);text-underline-offset:4px}button,input,select{font:inherit;color:inherit}button{cursor:pointer}button,a,input,select{outline-offset:4px}:focus-visible{outline:3px solid #69966d}button:disabled{cursor:default;opacity:.55}button{border:1px solid #bdcbbb;background:var(--white);border-radius:6px;padding:8px 13px}button:hover:not(:disabled){border-color:#698267;background:#e8efe3}button.active,button[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#fff}input,select{border:1px solid #bdcbbb;border-radius:6px;background:#fffefa;padding:10px 11px;min-width:0}input[type=range]{padding:0;accent-color:var(--accent);width:100%;height:28px;cursor:pointer}p{margin:8px 0 14px}h1,h2,h3,h4{color:var(--ink);line-height:1.35}h1{font-size:clamp(26px,2.4vw,36px);margin:0}h2{font-size:27px;margin:0 0 10px}h3{font-size:19px;margin:0 0 10px}h4{font-size:15px;margin:0 0 7px}header{background:#17392d;color:#fff;padding:25px 34px;display:flex;align-items:center;justify-content:space-between;gap:28px}header h1{color:inherit}header p{color:#c3d6c8;margin:6px 0 0;font-size:13px}.signature{font-size:15px;margin:0 0 7px;color:inherit}.toplinks{display:flex;gap:15px;flex-wrap:wrap;font-size:13px}.toplinks a{color:#e2ebdc}.skip{position:absolute;top:-100px;left:15px;background:#fff;padding:10px;z-index:20}.skip:focus{top:10px}.overview{max-width:1500px;margin:auto;padding:26px 34px;display:flex;align-items:center;justify-content:space-between;gap:32px}.overview>div:first-child{max-width:79ch}.overview p{font-size:14px;color:var(--muted);margin:4px 0}.overview h2{font-size:20px}.counts{display:flex;gap:30px;flex-shrink:0}.counts span{display:block;font-size:12px;color:var(--muted)}.counts strong{font-size:29px;line-height:1.2;color:var(--ink);font-weight:600}.jump-links{display:flex;gap:17px;margin-top:13px;font-size:13px}.section-label,.eyebrow{font-size:11px;letter-spacing:.09em;color:var(--muted);font-weight:650}.catalog{max-width:1500px;margin:auto;border-block:1px solid var(--line);display:grid;grid-template-columns:280px minmax(0,1fr)}.catalog-aside{padding:24px 18px;background:var(--pale);border-right:1px solid var(--line)}.catalog-aside-inner{position:sticky;top:20px}.catalog-aside label{font-size:13px;font-weight:650;display:block;margin-bottom:7px}#theory-search,#role-select{width:100%;font-size:14px}.filter-label{margin-top:15px}.role-description{font-size:12px;color:var(--muted);min-height:36px;margin:8px 0}.list-count{font-size:12px;color:var(--muted);margin:17px 0 8px}.theory-list{display:grid;gap:5px;max-height:60vh;overflow:auto;padding:3px}.theory-option{text-align:left;padding:11px 12px;display:block;border-color:transparent;background:transparent;width:100%}.theory-option strong{display:block;font-size:14px;line-height:1.45}.theory-option small{display:block;font-size:11px;color:var(--muted);margin-top:5px}.theory-option.active{background:var(--white);border-color:#a8b99f;color:var(--ink);box-shadow:inset 3px 0 0 var(--accent)}.theory-detail{padding:28px 34px 35px;min-width:0}.theory-detail>h2{font-size:30px;margin:6px 0 8px}.chips{display:flex;flex-wrap:wrap;gap:7px;margin:13px 0 20px}.chip{background:#eaf0e4;border:1px solid #d8e1ce;padding:3px 9px;border-radius:4px;font-size:12px}.relation-strip{display:grid;grid-template-columns:1fr 1fr 1.05fr;margin:25px 0 22px;background:#fffefa;border-block:1px solid var(--line)}.relation-strip>section{padding:17px 19px;border-right:1px solid var(--line)}.relation-strip>section:last-child{border-right:0;background:#eaf0e5}.relation-strip h3{font-size:13px;margin-bottom:10px;color:var(--muted)}.relation-strip p{font-size:15px;line-height:1.65;margin:0}.input-list{display:grid;gap:5px;margin:0;font-size:13px}.input-list div{display:flex;justify-content:space-between;gap:12px}.input-list dd{margin:0;color:var(--muted);white-space:nowrap}.formula{font:17px/1.9 ui-monospace,"Microsoft JhengHei",monospace;white-space:pre-wrap;overflow-wrap:anywhere;background:#e9eee2;border-left:3px solid #80996d;padding:17px 20px;margin:10px 0 7px}.small,.muted{font-size:13px;color:var(--muted)}.detail-block{margin-top:29px}.application-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px}.application{border-bottom:1px solid var(--line);padding:14px 0}.application small{font-size:11px;color:var(--muted)}.application h4{margin:3px 0 6px}.application p{font-size:14px;margin:0}.links-row{display:flex;flex-wrap:wrap;gap:7px}.links-row button{font-size:13px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:27px}.columns ul{font-size:14px;padding-left:21px;margin:10px 0}.columns li{margin:6px 0}.limits{padding:17px 0 0;border-top:1px solid var(--line);margin-top:27px}.limits .pitfalls h3{color:#7b5532}.source-links{list-style:none;padding:0;margin:9px 0;display:flex;gap:8px 18px;flex-wrap:wrap;font-size:12px}.empty{padding:22px 0;color:var(--muted);font-size:14px}.lab{max-width:1500px;margin:auto;padding:34px}.section-intro{max-width:88ch;font-size:14px;color:var(--muted)}.lab-grid{display:grid;grid-template-columns:265px minmax(0,1fr);gap:24px;margin-top:22px}.controls{background:#e9ede5;padding:20px;border:1px solid var(--line);border-radius:8px;min-width:0}.controls>label{font-size:13px;font-weight:650;display:block;margin-bottom:7px}#recipe-select{width:100%;font-size:14px}.recipe-description{font-size:13px;color:var(--muted);margin:12px 0 17px}.parameter{border-top:1px solid #d4ddcd;padding:13px 0 6px}.parameter label{font-size:13px;font-weight:600;display:block;margin-bottom:7px}.parameter-row{display:flex;align-items:center;gap:7px}.parameter-row input[type=number]{width:100%;font-size:14px;padding:6px 9px;min-width:0}.parameter-row span{font-size:12px;color:var(--muted);white-space:nowrap}.parameter-limits{display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}.parameter.invalid input{border-color:var(--fail)}.parameter.invalid label{color:var(--fail)}.reset-parameters{width:100%;font-size:12px;margin-top:14px}.viewer-column{min-width:0;display:flex;flex-direction:column}.view-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}.view-buttons,.zoom-buttons{display:flex;gap:5px;flex-wrap:wrap}.view-toolbar button{font-size:12px;padding:7px 11px;min-height:36px}.stage-shell{position:relative;border:1px solid #cad2c3;background:#e8e8df;border-radius:8px;overflow:hidden;flex:1;min-height:440px}.shape-stage{height:100%;min-height:440px;position:relative;touch-action:none;cursor:grab}.shape-stage:active{cursor:grabbing}.shape-stage canvas{display:block;width:100%;height:100%;min-height:440px}.stage-caption{position:absolute;left:15px;top:12px;right:15px;pointer-events:none;display:flex;justify-content:space-between;gap:10px;align-items:start;font-size:12px;color:#465545}.stage-caption strong{font-weight:550;background:#fffff0ba;padding:4px 8px;border-radius:4px}.stage-coordinate{font:10px/1.4 ui-monospace,monospace;white-space:nowrap}.stage-note{position:absolute;left:15px;bottom:12px;pointer-events:none;color:#576451;font-size:11px;max-width:calc(100% - 30px);background:#fffff0bc;padding:4px 8px;border-radius:4px}.stage-empty{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:30px;color:var(--muted);font-size:14px;pointer-events:none}.stage-empty[hidden]{display:none}.part-label{position:absolute;pointer-events:none;background:#17392deb;color:#fff;padding:5px 9px;font-size:12px;border-radius:4px;max-width:210px;transform:translate(-50%,-120%)}.part-label[hidden]{display:none}.compile-message{padding:12px 15px;border:1px solid #c9d6bd;background:#edf2e7;border-radius:6px;margin-top:12px;font-size:13px}.compile-message.error{color:var(--fail);background:#fbede6;border-color:#d8aa94}.compile-message.pending{background:#f3eddc;border-color:#dfd0a8;color:var(--pending)}.compile-message strong{display:block;font-size:13px}.compile-message p{margin:4px 0 0}.mesh-summary{font-size:12px;color:var(--muted);margin-top:7px}.part-section{margin-top:22px;border-bottom:1px solid var(--line);padding-bottom:20px}.part-section h3{font-size:16px}.part-list{display:flex;gap:7px;flex-wrap:wrap}.part-button{font-size:12px;padding:7px 10px;text-align:left}.part-button small{display:block;opacity:.8;font-size:10px}.lab-results{display:grid;grid-template-columns:1fr 1fr;gap:29px;margin-top:28px}.lab-results>section{min-width:0}.lab-results h3{font-size:19px}.derived-list{margin:0;font-size:13px}.derived-row{display:grid;grid-template-columns:minmax(110px,.9fr) minmax(0,1.1fr);gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}.derived-row dt{color:var(--muted)}.derived-row dd{margin:0;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.derived-row dd small{display:block;margin-top:3px;color:var(--muted)}.derived-nested{display:block;line-height:1.8}.previous-result{border-left:3px solid #baa772;padding-left:12px}.check-list{display:grid;gap:9px;margin-top:13px}.check{border-left:3px solid #709264;padding:10px 12px;background:#eaf0e3;font-size:13px}.check.fail{border-color:#bb7254;background:#f6eae2}.check.pending{border-color:#b7a25f;background:#f3eddc}.check-heading{display:flex;align-items:baseline;justify-content:space-between;gap:12px}.check-heading strong{font-size:13px}.check-heading span{font-size:11px;white-space:nowrap;font-weight:650}.check p{font-size:12px;margin:5px 0 0;color:var(--muted)}.check-value{overflow-wrap:anywhere;font-variant-numeric:tabular-nums}.graph{list-style:none;padding:0;margin:12px 0;display:grid;gap:0}.graph-node{position:relative;padding:0 0 20px 41px;scroll-margin-top:25px}.graph-node:not(:last-child):before{content:"";position:absolute;left:13px;top:27px;bottom:0;border-left:1px solid #a6b99b}.graph-node:not(:last-child):after{content:"↓";position:absolute;left:8px;bottom:0;color:#6f8665;font-size:13px;background:var(--paper)}.step-number{position:absolute;left:0;top:0;width:28px;height:28px;background:#dce6d3;border:1px solid #c1d0b7;border-radius:50%;text-align:center;font-size:12px;line-height:26px;font-weight:650}.graph-node h4{margin:0 0 5px;font-size:14px}.graph-node p{font-size:13px;margin:0 0 5px}.dependencies{font-size:11px;color:var(--muted);display:flex;gap:5px;align-items:baseline;flex-wrap:wrap}.dependencies a{font-size:11px}.theory-chain{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:13px 0 18px}.theory-chain button{font-size:12px}.boundary{border-left:3px solid #aebd9e;padding-left:14px;font-size:13px;color:#596b50;margin:25px 0 0}.workflow-section,.sources-section{max-width:1500px;margin:auto;padding:30px 34px;border-top:1px solid var(--line)}.workflow{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px;margin-top:20px}.workflow article{border-top:2px solid #a8bb99;padding-top:12px}.workflow article h3{font-size:15px}.workflow article p{font-size:13px;color:var(--muted)}.sources{list-style:none;padding:0;display:grid;grid-template-columns:1fr 1fr;column-gap:28px;font-size:13px}.sources li{padding:12px 0;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.sources small{display:block;color:var(--muted);font-size:11px}footer{padding:20px 34px;background:var(--pale);border-top:1px solid var(--line);font-size:12px;color:var(--muted)}footer p{margin:0}.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}[hidden]{display:none!important}@media(min-width:1600px){.stage-shell,.shape-stage,.shape-stage canvas{min-height:530px}}@media(max-width:1050px){.catalog{grid-template-columns:235px minmax(0,1fr)}.theory-detail{padding:25px}.relation-strip{grid-template-columns:1fr}.relation-strip>section{border-right:0;border-bottom:1px solid var(--line);padding:13px 16px}.relation-strip>section:last-child{border-bottom:0}.lab-grid{grid-template-columns:235px minmax(0,1fr)}.lab{padding:28px 25px}.columns{gap:18px}.counts{gap:17px}.stage-coordinate{display:none}.stage-shell,.shape-stage,.shape-stage canvas{min-height:405px}}@media(max-width:760px){header{padding:21px 20px;align-items:start;flex-direction:column;gap:15px}.overview{padding:22px 20px;display:block}.counts{margin-top:20px;gap:35px}.catalog{grid-template-columns:1fr}.catalog-aside{border-right:0;border-bottom:1px solid var(--line);padding:20px}.catalog-aside-inner{position:static}.theory-list{max-height:245px;grid-template-columns:1fr 1fr}.theory-option{padding:9px}.role-description{min-height:0}.theory-detail{padding:25px 20px}.theory-detail>h2{font-size:26px}.columns,.application-grid{grid-template-columns:1fr}.columns{gap:20px}.lab{padding:28px 20px}.lab-grid{grid-template-columns:1fr;gap:17px}.controls{padding:16px}#parameters{display:grid;grid-template-columns:1fr 1fr;column-gap:22px}.lab-results{grid-template-columns:1fr;gap:30px}.stage-shell,.shape-stage,.shape-stage canvas{min-height:370px}.workflow-section,.sources-section{padding:26px 20px}.sources{grid-template-columns:1fr}.formula{font-size:14px;padding:14px}.stage-caption{font-size:11px}.section-intro{font-size:13px}footer{padding:18px 20px}}@media(max-width:420px){.theory-list{grid-template-columns:1fr}#parameters{grid-template-columns:1fr}.view-toolbar{gap:7px}.view-toolbar button{padding:7px 9px}.stage-shell,.shape-stage,.shape-stage canvas{min-height:330px}.relation-strip p{font-size:14px}.derived-row{grid-template-columns:1fr;gap:3px}}
`;

const html = `<!doctype html>
<html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHTML(data.title)}</title><style>${css}</style></head>
<body>
<header><div><p class="signature">יהוה</p><h1>${escapeHTML(data.title)}</h1><p>從數學關係，走到能觀察與改變的物件形體</p></div><nav class="toplinks" aria-label="零件庫導覽"><a href="index.html">零件庫</a><a href="knowledge-map.html">用途與跨域知識樹</a><a href="math-quality.html">零件的數學與物理</a></nav></header>
<a class="skip" href="#theory-detail">跳到定理內容</a>
<section class="overview"><div><h2>先知道作用在哪裡，再把形體組起來</h2><p>${escapeHTML(data.intro)}</p><nav class="jump-links" aria-label="本頁導覽"><a href="#catalog">定理目錄</a><a href="#laboratory">形體實驗室</a><a href="#workflow-section">建構順序</a></nav></div><div class="counts" aria-label="內容數量"><div><strong>${data.theories.length}</strong><span>形體關係</span></div><div><strong>${data.roles.length}</strong><span>作用分類</span></div><div><strong>${data.recipes.length}</strong><span>可調整物件</span></div></div></section>
<main>
<section class="workflow-section" id="learning-paths"><h2>依理解程度，走到能獨立製作</h2><div class="workflow">${(data.learningPaths || []).map(l=>'<article><h3>'+escapeHTML(l.level)+'</h3><p><strong>'+escapeHTML(l.question)+'</strong></p><p>'+escapeHTML(l.task)+'</p><p>通過條件：'+escapeHTML(l.pass)+'</p></article>').join('')}</div><p class="small"><a href="SHAPE-THEORY.md">完整文字與重建方法</a> · <a href="shape-theory.json">同一份可讀資料</a> · <a href="evidence/shape-native-readback.json">原生幾何驗證</a> · <a href="shape-quality.html">端面修正紅圈實例</a></p></section>
<section id="catalog" class="catalog" aria-label="形體定理目錄"><aside class="catalog-aside"><div class="catalog-aside-inner"><label for="theory-search">搜尋定理、物件或用途</label><input id="theory-search" type="search" autocomplete="off" placeholder="例如：曲面、杯子、截面"><label class="filter-label" for="role-select">按作用分類</label><select id="role-select"><option value="">全部作用</option></select><p class="role-description" id="role-description">選擇關係對形體的作用，或搜尋跨領域用途。</p><p class="list-count" id="list-count" aria-live="polite"></p><nav class="theory-list" id="theory-list" aria-label="定理列表"></nav></div></aside><article id="theory-detail" class="theory-detail" tabindex="-1"></article></section>
<section class="lab" id="laboratory" aria-labelledby="lab-heading"><p class="section-label">從關係到物件</p><h2 id="lab-heading">形體實驗室</h2><p class="section-intro">選擇物件，調整輸入尺寸，觀察真正由參數生成的表面。下方逐步列出關係如何串接、導出哪些量，以及本次幾何條件是否成立。</p><div class="lab-grid"><aside class="controls"><label for="recipe-select">要建構的物件</label><select id="recipe-select"></select><p class="recipe-description" id="recipe-description"></p><div id="parameters"></div><button class="reset-parameters" id="reset-parameters" type="button">回到此物件的預設尺寸</button></aside><div class="viewer-column"><div class="view-toolbar"><div class="view-buttons" aria-label="模型視角"><button type="button" data-view="front">正面</button><button type="button" data-view="back">背面</button><button type="button" data-view="iso" class="active">斜視</button><button type="button" data-view="top">頂面</button></div><div class="zoom-buttons"><button type="button" id="zoom-out" aria-label="縮小模型">−</button><button type="button" id="zoom-in" aria-label="放大模型">＋</button><button type="button" id="fit-view">完整取景</button></div></div><div class="stage-shell"><div id="shape-stage" class="shape-stage" tabindex="0" role="application" aria-label="可旋轉的形體模型" aria-describedby="viewer-help"></div><div class="stage-caption"><strong id="displayed-model">準備形體</strong><span class="stage-coordinate">Y ↑ · 尺寸 mm</span></div><div id="stage-empty" class="stage-empty">正在載入內嵌形體核心…</div><div id="part-label" class="part-label" hidden></div><div class="stage-note" id="viewer-help">拖曳旋轉 · 滾輪／雙指縮放 · 方向鍵旋轉 · Home 回到斜視</div></div><div id="compile-message" class="compile-message pending" role="status" aria-live="polite">等待形體核心。</div><div id="mesh-summary" class="mesh-summary"></div></div></div><section class="part-section" aria-labelledby="part-heading"><h3 id="part-heading">這個物件由哪些局部組成</h3><p class="small">點選名稱可標示對應局部；再點一次回到完整外觀。</p><div id="part-list" class="part-list"></div></section><div id="recipe-theories" class="theory-chain" aria-label="本物件使用的形體關係"></div><div class="lab-results"><section aria-labelledby="derived-heading"><h3 id="derived-heading">本次輸入導出的量</h3><div id="derived"></div><h3 style="margin-top:25px">幾何條件檢核</h3><div id="checks" class="check-list"></div></section><section aria-labelledby="graph-heading"><h3 id="graph-heading">如何串成這個形體</h3><p class="small" id="graph-note">每一步都指出它接收的前置結果，以及對最後形體的作用。</p><ol id="compile-graph" class="graph"></ol></section></div><p class="boundary">本頁示範數學關係與形體生成。幾何條件成立只支持列出的幾何判斷；製造、材料、載荷、耐久與實際接觸仍需要相應輸入及獨立驗證。</p></section>
<section id="workflow-section" class="workflow-section"><p class="section-label">讓關係形成完整物件</p><h2>建構順序</h2><div id="workflow" class="workflow"></div></section>
<section class="sources-section"><h2>關係的來源</h2><p class="small">定理內容與用途已包含在本頁。下列外部來源連結需要網路；模型、操作與本頁閱讀可完全離線。</p><ul id="sources" class="sources"></ul></section>
</main><footer><p>修訂 ${escapeHTML(data.revision)} · 離線形體教學 · 尺寸單位依每個輸入標示</p></footer>
<noscript><p class="empty">請啟用 JavaScript 以讀取定理目錄與操作形體。本頁所有程式及資料都已內嵌。</p></noscript>
<script id="shape-payload" type="application/json">${payload}</script>
<script>(${startPage.toString()})();</script>
</body></html>`;
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, html, 'utf8');
console.log(JSON.stringify({ output: outputPath, theories: data.theories.length, recipes: data.recipes.length, embedded: ['data', 'three', 'compiler'], bytes: Buffer.byteLength(html) }));

async function startPage() {
  'use strict';
  const { data, modules } = JSON.parse(document.getElementById('shape-payload').textContent);
  const $ = id => document.getElementById(id);
  const text = value => value == null ? '未提供' : String(value);
  const esc = value => text(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const theories = new Map(data.theories.map(t => [t.id, t]));
  const recipes = new Map(data.recipes.map(r => [r.id, r]));
  const roles = new Map(data.roles.map(r => [r.id, r]));
  const sources = new Map(data.sources.map(s => [s.id, s]));
  const list = items => items.length ? '<ul>' + items.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>' : '<p class="muted">此來源未另列內容。</p>';
  const safeURL = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; } };
  const sourceLink = s => { const url = safeURL(s.url); return url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.title) + '</a>' : esc(s.title); };
  const fmt = value => typeof value === 'number' ? (Number.isFinite(value) ? value.toLocaleString('zh-TW', { maximumSignificantDigits: 8 }) : '非有限數值') : text(value);
  const clone = value => JSON.parse(JSON.stringify(value));
  let hashTheory='';try{hashTheory=decodeURIComponent(location.hash.slice(1));}catch{}
  let selectedTheory = theories.has(hashTheory) ? hashTheory : data.theories[0]?.id || null;
  window.addEventListener('hashchange',()=>{let id='';try{id=decodeURIComponent(location.hash.slice(1));}catch{}if(theories.has(id)){selectTheory(id);$('theory-detail').scrollIntoView({block:'start'});}});
  let selectedRecipe = data.recipes[0]?.id || null;
  let parameters = {}, compileError = null, model = null, displayedRecipe = null, validParameters = {};
  let T, compileRecipe, renderer, scene, camera, modelVertices = new Float64Array(), pivot, radius = 1;
  let triangles = 0, selectedPart = null, meshByPart = new Map(), materialDefaults = new Map();
  let frame = 0, disposed = false, ready = false, resizeObserver;
  let viewName = 'iso', yaw = Math.PI / 4, pitch = Math.atan(1 / Math.sqrt(2)), zoom = 1;
  const signalController = new AbortController();
  const on = (target, name, listener, options = {}) => target.addEventListener(name, listener, { ...options, signal: signalController.signal });

  function renderCatalog() {
    const query = $('theory-search').value.trim().toLocaleLowerCase();
    const role = $('role-select').value;
    const matched = data.theories.filter(t => (!role || t.roleIds.includes(role)) && (!query || [t.title, t.kind, t.actsOn, t.produces, t.formula, ...t.inputs.map(i => i.name), ...t.applications.flatMap(a => [a.domain, a.object, a.how]), ...t.roleIds.map(id => roles.get(id)?.name)].join(' ').toLocaleLowerCase().includes(query)));
    $('list-count').textContent = matched.length + ' / ' + data.theories.length + ' 條關係';
    $('role-description').textContent = roles.get(role)?.description || '選擇關係對形體的作用，或搜尋跨領域用途。';
    $('theory-list').innerHTML = matched.length ? matched.map(t => '<button class="theory-option' + (t.id === selectedTheory ? ' active' : '') + '" type="button" data-theory="' + esc(t.id) + '" aria-current="' + (t.id === selectedTheory ? 'true' : 'false') + '"><strong>' + esc(t.title) + '</strong><small>' + esc(t.kind) + '</small></button>').join('') : '<p class="empty">沒有符合的關係。可縮短搜尋文字，或切回全部作用。</p>';
  }
  function renderTheory() {
    const t = theories.get(selectedTheory);
    if (!t) { $('theory-detail').innerHTML = '<h2>定理資料尚未提供</h2><p class="empty">沒有可顯示的形體關係。</p>'; return; }
    $('theory-detail').innerHTML = '<p class="eyebrow">' + esc(t.kind) + '</p><h2>' + esc(t.title) + '</h2><div class="chips">' + t.roleIds.map(id => '<span class="chip">' + esc(roles.get(id)?.name || id) + '</span>').join('') + '</div>' +
      '<div class="relation-strip"><section><h3>01 · 作用在哪裡</h3><p>' + esc(t.actsOn) + '</p></section><section><h3>02 · 需要哪些輸入</h3><dl class="input-list">' + t.inputs.map(i => '<div><dt>' + esc(i.name) + '</dt><dd>' + esc(i.unit) + '</dd></div>').join('') + '</dl></section><section><h3>03 · 產生什麼</h3><p>' + esc(t.produces) + '</p></section></div>' +
      '<section><h3>把輸入連到結果的關係</h3><div class="formula" role="math" aria-label="' + esc(t.title + '的公式') + '">' + esc(t.formula) + '</div><p class="small">請連同作用對象、變數單位與下列成立前提閱讀。</p></section>' +
      '<section class="detail-block"><h3>同一個關係，可以用在哪些物件</h3><div class="application-grid">' + t.applications.map(a => '<article class="application"><small>' + esc(a.domain) + '</small><h4>' + esc(a.object) + '</h4><p>' + esc(a.how) + '</p></article>').join('') + '</div></section>' +
      '<section class="detail-block"><h3>下一步可以接哪些關係</h3><div class="links-row">' + (t.composesWith.length ? t.composesWith.map(id => '<button type="button" data-theory="' + esc(id) + '">' + esc(theories.get(id)?.title || id) + ' →</button>').join('') : '<p class="muted">此來源未指定後續組合。</p>') + '</div></section>' +
      '<div class="columns limits"><section><h3>成立前提</h3>' + list(t.premises) + '</section><section class="pitfalls"><h3>容易用錯的地方</h3>' + list(t.pitfalls) + '</section></div>' +
      '<section class="detail-block"><h3>在物件上改變這個關係</h3><div class="links-row">' + (t.recipeIds.length ? t.recipeIds.map(id => '<button type="button" data-recipe="' + esc(id) + '">' + esc(recipes.get(id)?.name || id) + ' · 開啟實驗</button>').join('') : '<p class="muted">此關係目前沒有對應的可操作物件。</p>') + '</div></section>' +
      '<section class="detail-block"><h4>來源</h4>' + (t.sourceIds.length ? '<ul class="source-links">' + t.sourceIds.map(id => '<li>' + sourceLink(sources.get(id)) + '</li>').join('') + '</ul>' : '<p class="muted">此條目未附外部來源。</p>') + '</section>';
  }
  function selectTheory(id) {
    if (!theories.has(id)) throw new Error('找不到形體關係：' + id);
    selectedTheory = id;
    try{history.replaceState(null,'','#'+encodeURIComponent(id));}catch{}
    renderCatalog(); renderTheory();
    return state();
  }
  function renderParameters() {
    const recipe = recipes.get(selectedRecipe);
    $('recipe-select').value = selectedRecipe || '';
    $('recipe-description').textContent = recipe ? recipe.domain + ' · ' + recipe.description : '目前沒有物件配方。';
    $('parameters').innerHTML = recipe ? recipe.parameters.map((p, i) => '<div class="parameter" data-parameter-row="' + esc(p.key) + '"><label for="parameter-' + i + '">' + esc(p.label) + '</label><div class="parameter-row"><input id="number-' + i + '" type="number" data-param-number="' + esc(p.key) + '" aria-label="' + esc(p.label + '精確數值') + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + parameters[p.key] + '"><span>' + esc(p.unit) + '</span></div><input id="parameter-' + i + '" type="range" data-param="' + esc(p.key) + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + parameters[p.key] + '"><div class="parameter-limits"><span>' + fmt(p.min) + '</span><span>' + fmt(p.max) + '</span></div></div>').join('') : '';
    $('reset-parameters').disabled = !recipe;
    $('recipe-theories').innerHTML = recipe ? '<span class="small">此物件的關係：</span>' + recipe.theoryIds.map(id => '<button type="button" data-theory="' + esc(id) + '">' + esc(theories.get(id)?.title || id) + '</button>').join('') : '';
  }
  function syncParameters() {
    const recipe = recipes.get(selectedRecipe);
    for (const row of $('parameters').querySelectorAll('[data-parameter-row]')) {
      const key = row.dataset.parameterRow, p = recipe.parameters.find(item => item.key === key), value = parameters[key];
      const invalid = !Number.isFinite(value) || value < p.min || value > p.max;
      row.classList.toggle('invalid', invalid);
      for (const input of row.querySelectorAll('input')) {
        if (document.activeElement !== input) input.value = Number.isFinite(value) ? value : '';
        input.setAttribute('aria-invalid', String(invalid));
      }
    }
  }
  function selectRecipe(id) {
    if (!recipes.has(id)) throw new Error('找不到物件配方：' + id);
    selectedRecipe = id;
    parameters = Object.fromEntries(recipes.get(id).parameters.map(p => [p.key, p.default]));
    renderParameters();
    if (ready) compileCurrent(true);
    return state();
  }
  function setParameter(key, value) {
    if (!recipes.get(selectedRecipe)?.parameters.some(p => p.key === key)) throw new Error('找不到此物件的參數：' + key);
    parameters[key] = typeof value === 'number' ? value : (String(value).trim() ? Number(value) : NaN);
    syncParameters();
    if (ready) compileCurrent(false);
    return state();
  }
  function readableValue(value) {
    if (Array.isArray(value)) return value.map(readableValue).join('、');
    if (value && typeof value === 'object') {
      if ('value' in value) return fmt(value.value) + (value.unit ? ' ' + value.unit : '');
      return Object.entries(value).map(([key, v]) => key + '：' + readableValue(v)).join('；');
    }
    if (typeof value === 'boolean') return value ? '是' : '否';
    return fmt(value);
  }
  function renderDerived() {
    const recipe = recipes.get(displayedRecipe);
    const values = model?.metrics?.derived;
    const entries = Array.isArray(values) ? values.map((v, i) => [v.name || v.label || String(i + 1), v]) : Object.entries(values || {});
    $('derived').innerHTML = (compileError && model ? '<p class="small previous-result">以下為「' + esc(recipe.name) + '」上次有效輸入的推導量。本次輸入未產生新結果。</p>' : '') + (entries.length ? '<dl class="derived-list">' + entries.map(([key, value]) => {
      const object = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
      const parameter = recipe?.parameters.find(p => p.key === key);
      const label = object.label || object.name || parameter?.label || key;
      const rendered = readableValue(value);
      return '<div class="derived-row"><dt>' + esc(label) + '</dt><dd>' + esc(rendered) + (object.meaning ? '<small>' + esc(object.meaning) + '</small>' : '') + '</dd></div>';
    }).join('') + '</dl>' : '<p class="empty">尚無推導量。</p>');
  }
  function renderChecks() {
    if (compileError) { $('checks').innerHTML = '<div class="check pending"><div class="check-heading"><strong>本次未完成幾何檢核</strong><span>未判定</span></div><p>請先修正輸入錯誤。保留的舊模型不能作為本次輸入通過的證據。</p></div>'; return; }
    const checks = model?.metrics?.checks || [];
    $('checks').innerHTML = checks.length ? checks.map(c => '<article class="check ' + (c.pass === true ? 'pass' : c.pass === false ? 'fail' : 'pending') + '"><div class="check-heading"><strong>' + esc(c.name) + '</strong><span>' + (c.pass === true ? '符合條件' : c.pass === false ? '不符合' : '未判定') + '</span></div><p class="check-value">讀回值：' + esc(readableValue(c.value)) + '</p><p>' + esc(c.meaning) + '</p></article>').join('') : '<div class="check pending">核心未提供幾何條件；本頁沒有通過判定。</div>';
  }
  function renderGraph() {
    const graph = model?.graph || [];
    const nodes = new Map(graph.map((g, i) => [g.id, { ...g, index: i }]));
    $('graph-note').textContent = compileError && model ? '以下保留上次有效模型的組合過程。本次錯誤輸入尚未產生新形體。' : '每一步都指出它接收的前置結果，以及對最後形體的作用。';
    $('compile-graph').innerHTML = graph.length ? graph.map((g, i) => '<li class="graph-node" id="graph-node-' + i + '"><span class="step-number">' + (i + 1) + '</span><h4>' + esc(g.operation) + '</h4><p>' + esc(g.purpose) + '</p><div class="dependencies"><span>' + (g.dependsOn?.length ? '接收' : '起點：目前配方的輸入與定義') + '</span>' + (g.dependsOn || []).map(id => { const dependency = nodes.get(id); return dependency ? '<a href="#graph-node-' + dependency.index + '">第 ' + (dependency.index + 1) + ' 步 · ' + esc(dependency.operation) + '</a>' : '<span>' + esc(id) + '（外部輸入）</span>'; }).join('<span aria-hidden="true"> · </span>') + '</div></li>').join('') : '<li class="empty">尚無形體組合過程。</li>';
  }
  function renderStatus() {
    const selected = recipes.get(selectedRecipe), shown = recipes.get(displayedRecipe);
    const message = $('compile-message');
    if (compileError) {
      message.className = 'compile-message error';
      message.innerHTML = '<strong>這次輸入未生成新形體</strong><p>' + esc(compileError) + '</p><p>' + (model ? '畫面保留「' + esc(shown.name) + '」的上次有效形體；目前輸入尚未通過檢核。' : '尚無有效模型。請修正輸入或重新開啟頁面。') + '</p>';
    } else if (model) {
      const checks = model.metrics?.checks || [], failed = checks.some(c => c.pass === false), pending = !checks.length || checks.some(c => c.pass !== true && c.pass !== false);
      message.className = 'compile-message' + (failed ? ' error' : pending ? ' pending' : '');
      message.innerHTML = '<strong>' + esc(selected.name) + ' · 已依目前參數生成</strong><p>' + (failed ? '仍有幾何條件不符合，請閱讀下方檢核。' : pending ? '部分幾何條件尚未判定，請閱讀下方檢核。' : '下列幾何條件符合目前輸入；這不代表製造或承載驗證。') + '</p>';
    }
    $('displayed-model').textContent = model ? shown.name + (compileError ? ' · 上次有效模型' : '') : '尚無有效模型';
    $('stage-empty').hidden = Boolean(model);
    if (!model && compileError) $('stage-empty').textContent = '形體尚未產生；請閱讀下方錯誤原因。';
    $('mesh-summary').textContent = model ? model.parts.length + ' 個局部 · ' + triangles.toLocaleString('zh-TW') + ' 個三角面 · 拖曳或選擇視角可檢查表面' : '';
    renderDerived(); renderChecks(); renderGraph();
  }
  function disposeModel(result) {
    if (!result) return;
    const geometries = new Set(), materials = new Set(), textures = new Set();
    result.root?.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) materials.add(material);
    });
    for (const part of result.parts || []) if (part.geometry?.dispose) geometries.add(part.geometry);
    for (const material of materials) { for (const value of Object.values(material)) if (value?.isTexture) textures.add(value); material.dispose(); }
    for (const geometry of geometries) geometry.dispose();
    for (const texture of textures) texture.dispose();
  }
  function inspectGeometry(result) {
    const meshes = [];
    result.root.updateMatrixWorld(true);
    let count = 0, triangleCount = 0;
    result.root.traverse(object => {
      if (!object.isMesh || !object.geometry?.getAttribute('position')) return;
      const position = object.geometry.getAttribute('position');
      const instances = object.isInstancedMesh ? object.count : 1;
      count += position.count * instances;
      triangleCount += Math.floor((object.geometry.index?.count ?? position.count) / 3) * instances;
      meshes.push(object);
    });
    if (!count) throw new Error('核心沒有產生可讀取的網格頂點。');
    const vertices = new Float64Array(count * 3), point = new T.Vector3(), matrix = new T.Matrix4(), instance = new T.Matrix4();
    let offset = 0, minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const mesh of meshes) {
      const position = mesh.geometry.getAttribute('position');
      for (let n = 0; n < (mesh.isInstancedMesh ? mesh.count : 1); n++) {
        matrix.copy(mesh.matrixWorld);
        if (mesh.isInstancedMesh) { mesh.getMatrixAt(n, instance); matrix.multiply(instance); }
        for (let i = 0; i < position.count; i++) {
          point.fromBufferAttribute(position, i).applyMatrix4(matrix);
          if (![point.x, point.y, point.z].every(Number.isFinite)) throw new Error('核心產生了非有限的頂點座標。');
          vertices[offset++] = point.x; vertices[offset++] = point.y; vertices[offset++] = point.z;
          minX = Math.min(minX, point.x); maxX = Math.max(maxX, point.x);
          minY = Math.min(minY, point.y); maxY = Math.max(maxY, point.y);
          minZ = Math.min(minZ, point.z); maxZ = Math.max(maxZ, point.z);
        }
      }
    }
    const center = new T.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
    const extent = Math.max(Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) / 2, 0.01);
    const parts = new Map(result.parts.map(part => [part.id, meshes.filter(mesh => mesh.geometry === part.geometry || mesh.userData?.partId === part.id || mesh.name === part.id)]));
    return { vertices, triangles: triangleCount, center, radius: extent, parts };
  }
  function compileCurrent(resetZoom) {
    let candidate;
    try {
      const recipe = recipes.get(selectedRecipe);
      if (!recipe) throw new Error('尚未提供物件配方。');
      for (const p of recipe.parameters) {
        const value = parameters[p.key];
        if (!Number.isFinite(value)) throw new Error(p.label + '必須是有限數值。');
        if (value < p.min || value > p.max) throw new Error(p.label + '須介於 ' + p.min + ' 至 ' + p.max + ' ' + p.unit + '；本次輸入為 ' + value + '。');
      }
      candidate = compileRecipe(T, selectedRecipe, { ...parameters });
      if (!candidate?.root?.isObject3D || !Array.isArray(candidate.parts) || !candidate.metrics || !Array.isArray(candidate.graph)) throw new Error('核心回傳內容缺少形體、局部、推導量或組合過程。');
      const geometry = inspectGeometry(candidate);
      const previous = model;
      scene.add(candidate.root);
      if (previous) scene.remove(previous.root);
      model = candidate;
      candidate = null;
      displayedRecipe = selectedRecipe;
      validParameters = { ...parameters };
      modelVertices = geometry.vertices; triangles = geometry.triangles; pivot = geometry.center; radius = geometry.radius; meshByPart = geometry.parts;
      compileError = null; selectedPart = null; materialDefaults = new Map();
      if (resetZoom) zoom = 1;
      disposeModel(previous);
      renderer.renderLists?.dispose();
      renderParts();
      requestRender();
    } catch (error) {
      if (candidate && candidate !== model) disposeModel(candidate);
      compileError = error?.message || String(error);
    }
    syncParameters();
    renderStatus();
  }
  function renderParts() {
    $('part-list').innerHTML = model ? model.parts.map((part, i) => '<button type="button" class="part-button" data-part="' + esc(part.id) + '" aria-pressed="false">' + (i + 1) + ' · ' + esc(part.name) + (part.materialRole ? '<small>' + esc(({ceramic:'陶瓷外觀示意',metal:'金屬外觀示意',brass:'黃銅外觀示意',wood:'木質色調示意',stone:'石材色調示意'})[part.materialRole] || part.materialRole) + '</small>' : '') + '</button>').join('') : '<p class="empty">尚無可標示的局部。</p>';
    $('part-label').hidden = true;
  }
  function highlightPart(id) {
    if (!model) return;
    selectedPart = selectedPart === id ? null : id;
    const selectedMeshes = new Set(meshByPart.get(selectedPart) || []);
    // Materials may be shared by several meshes. A shared selected material stays opaque.
    const selectedMaterials = new Set();
    for (const mesh of selectedMeshes) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) selectedMaterials.add(material);
    model.root.traverse(mesh => {
      if (!mesh.isMesh) return;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (!material) continue;
        if (!materialDefaults.has(material)) materialDefaults.set(material, { opacity: material.opacity, transparent: material.transparent, depthWrite: material.depthWrite });
        const original = materialDefaults.get(material), dim = selectedPart && !selectedMaterials.has(material);
        material.opacity = dim ? original.opacity * 0.16 : original.opacity;
        material.transparent = dim ? true : original.transparent;
        material.depthWrite = dim ? false : original.depthWrite;
        material.needsUpdate = true;
      }
    });
    for (const button of $('part-list').querySelectorAll('[data-part]')) button.setAttribute('aria-pressed', String(button.dataset.part === selectedPart));
    requestRender();
  }
  function updatePartLabel() {
    const label = $('part-label');
    const part = model?.parts.find(p => p.id === selectedPart), meshes = meshByPart.get(selectedPart) || [];
    if (!part || !meshes.length) { label.hidden = true; return; }
    const box = new T.Box3();
    for (const mesh of meshes) box.expandByObject(mesh);
    const position = box.getCenter(new T.Vector3()).project(camera);
    const width = $('shape-stage').clientWidth, height = $('shape-stage').clientHeight;
    label.textContent = part.name;
    label.hidden = position.z < -1 || position.z > 1;
    label.style.left = Math.min(width - 70, Math.max(70, (position.x + 1) * width / 2)) + 'px';
    label.style.top = Math.min(height - 32, Math.max(65, (1 - position.y) * height / 2)) + 'px';
  }
  function requestRender() {
    if (disposed || frame || !renderer) return;
    frame = requestAnimationFrame(() => { frame = 0; render(); });
  }
  function render() {
    if (disposed || !renderer || !model) return;
    const stage = $('shape-stage'), width = Math.max(1, stage.clientWidth), height = Math.max(1, stage.clientHeight);
    renderer.setSize(width, height, false);
    const direction = new T.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camera.position.copy(pivot).addScaledVector(direction, radius * 4 + 1);
    camera.up.set(0, Math.abs(Math.cos(pitch)) < 0.00001 ? 0 : 1, Math.abs(Math.cos(pitch)) < 0.00001 ? -1 : 0);
    camera.lookAt(pivot);
    camera.updateMatrixWorld(true);
    // Fit the projection of every real vertex, not the projection of eight AABB corners.
    // Oblique bounds therefore cannot make a face-on end view artificially small.
    const m = camera.matrixWorldInverse.elements;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < modelVertices.length; i += 3) {
      const x = modelVertices[i], y = modelVertices[i + 1], z = modelVertices[i + 2];
      const px = m[0] * x + m[4] * y + m[8] * z + m[12];
      const py = m[1] * x + m[5] * y + m[9] * z + m[13];
      const pz = m[2] * x + m[6] * y + m[10] * z + m[14];
      minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); minZ = Math.min(minZ, pz); maxZ = Math.max(maxZ, pz);
    }
    const aspect = width / height, centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
    const halfHeight = Math.max((maxY - minY) / 2, (maxX - minX) / (2 * aspect), radius * 0.015) * 1.3 / zoom;
    camera.left = centerX - halfHeight * aspect; camera.right = centerX + halfHeight * aspect;
    camera.bottom = centerY - halfHeight; camera.top = centerY + halfHeight;
    camera.near = Math.max(0.001, -maxZ - radius); camera.far = Math.max(camera.near + 1, -minZ + radius);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    updatePartLabel();
  }
  function setView(name) {
    const aliases = { oblique: 'iso', isometric: 'iso', 正面: 'front', 背面: 'back', 斜視: 'iso', 頂面: 'top' };
    name = aliases[name] || name;
    const poses = { front: [0, 0], back: [Math.PI, 0], iso: [Math.PI / 4, Math.atan(1 / Math.sqrt(2))], top: [0, Math.PI / 2] };
    if (!poses[name]) throw new Error('找不到視角：' + name);
    [yaw, pitch] = poses[name]; viewName = name; zoom = 1;
    syncViewButtons(); requestRender();
    return state();
  }
  function syncViewButtons() { for (const button of document.querySelectorAll('[data-view]')) { button.classList.toggle('active', button.dataset.view === viewName); button.setAttribute('aria-pressed', String(button.dataset.view === viewName)); } }
  function changeZoom(factor) { zoom = Math.max(0.35, Math.min(12, zoom * factor)); requestRender(); }
  function orbit(dx, dy) { yaw -= dx * 0.009; pitch = Math.max(-Math.PI / 2 + 0.005, Math.min(Math.PI / 2 - 0.005, pitch + dy * 0.009)); viewName = 'custom'; syncViewButtons(); requestRender(); }
  function state() {
    return {
      selectedTheory, selectedRecipe, partCount: model?.parts.length || 0, triangles,
      parameters: { ...parameters }, checks: compileError ? [] : clone(model?.metrics?.checks || []),
      view: viewName, compileError, displayedRecipe, displayedParameters: { ...validParameters }, selectedPart,
    };
  }
  window.SHAPE_THEORY = Object.freeze({ selectTheory, selectRecipe, setParameter, view: setView, state });

  $('role-select').innerHTML += data.roles.map(r => '<option value="' + esc(r.id) + '">' + esc(r.name) + '</option>').join('');
  $('recipe-select').innerHTML = data.recipes.map(r => '<option value="' + esc(r.id) + '">' + esc(r.name + ' · ' + r.domain) + '</option>').join('');
  $('recipe-select').disabled = !data.recipes.length;
  $('workflow').innerHTML = data.workflow.map((w, i) => '<article><p class="eyebrow">' + esc(w.step ?? i + 1) + '</p><h3>' + esc(w.title) + '</h3><p>' + esc(w.description) + '</p></article>').join('');
  $('sources').innerHTML = data.sources.map(s => '<li>' + sourceLink(s) + '<small>' + esc(s.url) + '</small></li>').join('');
  renderCatalog(); renderTheory();
  if (selectedRecipe) selectRecipe(selectedRecipe); else renderParameters();
  syncViewButtons();
  on($('theory-search'), 'input', renderCatalog);
  on($('role-select'), 'change', renderCatalog);
  on(document, 'click', event => {
    const theory = event.target.closest('[data-theory]');
    if (theory) { selectTheory(theory.dataset.theory); if (!theory.closest('#theory-list')) { $('theory-detail').scrollIntoView({ block: 'start' }); $('theory-detail').focus({ preventScroll: true }); } return; }
    const recipe = event.target.closest('[data-recipe]');
    if (recipe) { selectRecipe(recipe.dataset.recipe); $('laboratory').scrollIntoView({ block: 'start' }); $('recipe-select').focus({ preventScroll: true }); return; }
    const view = event.target.closest('[data-view]');
    if (view) { setView(view.dataset.view); return; }
    const part = event.target.closest('[data-part]');
    if (part) highlightPart(part.dataset.part);
  });
  on($('recipe-select'), 'change', event => selectRecipe(event.target.value));
  on($('parameters'), 'input', event => {
    const key = event.target.dataset.param ?? event.target.dataset.paramNumber;
    if (key) setParameter(key, event.target.value);
  });
  on($('reset-parameters'), 'click', () => selectRecipe(selectedRecipe));
  on($('zoom-in'), 'click', () => changeZoom(1.25));
  on($('zoom-out'), 'click', () => changeZoom(0.8));
  on($('fit-view'), 'click', () => { zoom = 1; requestRender(); });

  try {
    [T, { compileRecipe }] = await Promise.all([import(modules.three), import(modules.compiler)]);
    if (typeof compileRecipe !== 'function') throw new Error('內嵌核心沒有提供 compileRecipe。');
    renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputColorSpace' in renderer && T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
    if (T.ACESFilmicToneMapping != null) renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    $('shape-stage').appendChild(renderer.domElement);
    scene = new T.Scene(); scene.background = new T.Color('#e8e8df');
    camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.01, 10000);
    pivot = new T.Vector3();
    scene.add(new T.HemisphereLight(0xfffcf1, 0x637b66, 2.0));
    const key = new T.DirectionalLight(0xfff7e9, 2.5); key.position.set(4, 7, 6); scene.add(key);
    const fill = new T.DirectionalLight(0xe1eeff, 1.35); fill.position.set(-5, 3, -4); scene.add(fill);
    ready = true;
    compileCurrent(true);
    resizeObserver = new ResizeObserver(requestRender); resizeObserver.observe($('shape-stage'));
    const stage = $('shape-stage'), pointers = new Map();
    let drag = null, pinch = null, moved = false;
    on(stage, 'pointerdown', event => {
      if (event.button !== 0) return;
      stage.focus({ preventScroll: true }); stage.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      moved = false; drag = { x: event.clientX, y: event.clientY };
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
    });
    on(stage, 'pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch > 0) changeZoom(distance / pinch);
        pinch = distance; moved = true;
      } else if (drag) {
        const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 0) { orbit(dx, dy); moved = true; }
        drag = { x: event.clientX, y: event.clientY };
      }
    });
    const endPointer = event => {
      const wasTracked = pointers.has(event.pointerId);
      pointers.delete(event.pointerId); pinch = null;
      const remaining = [...pointers.values()][0]; drag = remaining ? { ...remaining } : null;
      if (event.type === 'pointerup' && wasTracked && !moved && model) {
        const bounds = stage.getBoundingClientRect(), raycaster = new T.Raycaster();
        raycaster.setFromCamera(new T.Vector2(2 * (event.clientX - bounds.left) / bounds.width - 1, 1 - 2 * (event.clientY - bounds.top) / bounds.height), camera);
        const hit = raycaster.intersectObject(model.root, true)[0];
        if (hit) { const part = [...meshByPart].find(([, meshes]) => meshes.includes(hit.object)); if (part) highlightPart(part[0]); }
      }
    };
    on(stage, 'pointerup', endPointer); on(stage, 'pointercancel', endPointer); on(stage, 'lostpointercapture', endPointer);
    on(stage, 'wheel', event => { event.preventDefault(); changeZoom(Math.exp(-Math.max(-120, Math.min(120, event.deltaY)) * 0.002)); }, { passive: false });
    on(stage, 'keydown', event => {
      const step = event.shiftKey ? 12 : 5;
      if (event.key === 'ArrowLeft') orbit(-step, 0);
      else if (event.key === 'ArrowRight') orbit(step, 0);
      else if (event.key === 'ArrowUp') orbit(0, -step);
      else if (event.key === 'ArrowDown') orbit(0, step);
      else if (event.key === '+' || event.key === '=') changeZoom(1.2);
      else if (event.key === '-') changeZoom(1 / 1.2);
      else if (event.key === 'Home') setView('iso');
      else if (event.key === 'Escape' && selectedPart) highlightPart(selectedPart);
      else return;
      event.preventDefault();
    });
    on(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); compileError = '顯示裝置已中斷，請重新開啟本頁以恢復模型。'; renderStatus(); });
  } catch (error) {
    compileError = '形體核心無法載入：' + (error?.message || String(error));
    renderStatus();
  }
  on(window, 'pagehide', event => {
    if (event.persisted) return;
    disposed = true;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver?.disconnect(); signalController.abort();
    disposeModel(model); renderer?.renderLists?.dispose(); renderer?.dispose();
    renderer?.domElement.remove();
  });
}
