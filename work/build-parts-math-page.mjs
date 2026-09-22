import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// node work/build-parts-math-page.mjs [math-quality.json] [math-quality.html]
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.resolve(process.argv[2] || path.join(projectRoot, 'outputs/parts-library/math-quality.json'));
const outputPath = path.resolve(process.argv[3] || path.join(projectRoot, 'outputs/parts-library/math-quality.html'));
const data = JSON.parse((await fs.readFile(inputPath, 'utf8')).replace(/^\uFEFF/, ''));

function validate(d) {
  const require = (condition, message) => { if (!condition) throw new Error('math-quality.json: ' + message); };
  require(d && typeof d === 'object', 'expected an object');
  for (const key of ['sources', 'laws', 'parts']) require(Array.isArray(d[key]), key + ' must be an array');
  require(d.parts.length === 12, 'expected the twelve real library parts');
  require(d.units && d.summary && d.revision && d.scope, 'revision, scope, units and summary are required');
  const unique = (items, label) => {
    const ids = items.map(item => item.id);
    require(ids.every(id => typeof id === 'string' && id.length > 0), label + ' IDs must be nonempty strings');
    require(new Set(ids).size === ids.length, label + ' IDs must be unique');
    return new Set(ids);
  };
  const sourceIds = unique(d.sources, 'source');
  const lawIds = unique(d.laws, 'law');
  unique(d.parts, 'part');
  for (const law of d.laws) {
    for (const key of ['premises', 'variables', 'procedure', 'limitations', 'sourceIds']) require(Array.isArray(law[key]), law.id + '.' + key + ' must be an array');
    require(law.sourceIds.every(id => sourceIds.has(id)), law.id + ' references an unknown source');
  }
  const counts = { parts: d.parts.length, checks: 0, pass: 0, fail: 0, needsInput: 0 };
  for (const part of d.parts) {
    for (const key of ['lawIds', 'checks', 'openInputs']) require(Array.isArray(part[key]), part.id + '.' + key + ' must be an array');
    require(part.lawIds.every(id => lawIds.has(id)), part.id + ' references an unknown law');
    unique(part.checks, part.id + ' check');
    for (const check of part.checks) {
      require(['PASS', 'FAIL', 'NEEDS_INPUT'].includes(check.status), part.id + '/' + check.id + ' has an invalid status');
      counts.checks++;
      counts[{ PASS: 'pass', FAIL: 'fail', NEEDS_INPUT: 'needsInput' }[check.status]]++;
    }
  }
  for (const [key, value] of Object.entries(counts)) require(d.summary[key] === value, 'summary.' + key + ' does not match the part checks (' + value + ')');
}
validate(data);
const embedded = JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'));

function startPage() {
  'use strict';
  const data = JSON.parse(document.getElementById('math-data').textContent);
  const byId = id => document.getElementById(id);
  const plain = value => value == null ? '未提供' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
  const esc = value => plain(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const laws = new Map(data.laws.map(law => [law.id, law]));
  const sources = new Map(data.sources.map(source => [source.id, source]));
  const statusInfo = { PASS: ['已通過此項', 'pass'], FAIL: ['未通過', 'fail'], NEEDS_INPUT: ['待補資料', 'pending'] };
  let selectedId = null;
  const badges = checks => ['PASS', 'FAIL', 'NEEDS_INPUT'].map(status => {
    const count = checks.filter(check => check.status === status).length;
    return count ? '<span class="badge ' + statusInfo[status][1] + '">' + statusInfo[status][0] + ' ' + count + '</span>' : '';
  }).join('');
  const list = items => items.length ? '<ul>' + items.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>' : '<p class="muted">來源資料未列出。</p>';
  const safeHref = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    const url = value.trim();
    if (/[\u0000-\u001f\u007f]/.test(url)) return null;
    if (/^https?:\/\//i.test(url)) return url;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('\\')) return null;
    return url;
  };
  const sourceLink = source => {
    const href = safeHref(source.url);
    return href ? '<a href="' + esc(href) + '"' + (/^https?:/i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(source.title) + '</a>' : esc(source.title) + '（未提供可開啟的網址）';
  };
  function valuesTable(values) {
    if (!values || typeof values !== 'object' || !Object.keys(values).length) return '<p class="muted">尚未提供。</p>';
    const names={holeDiameterMm:'孔徑（mm）',shaftDiameterMm:'軸徑（mm）',axis:'共用軸／軸心',zMm:'取樣高度 Z（mm）',nominalEccentricityMm:'名義偏心（mm）',nominalRadialGapMm:'名義徑向間隙（mm）',sampledMinGapMm:'實體取樣最小間隙（mm）',sampledMaxGapMm:'實體取樣最大間隙（mm）',rays:'截面射線數',holePolygon:'孔口多邊形',shaftPolygon:'軸面多邊形',vertices:'圓周頂點數',maxAngularGapRadians:'相鄰點最大夾角（rad）',maxSagMm:'最大弦高界（mm）',coordinateNumericalAllowanceMm:'座標數值容差（mm）',outerRadiusMm:'外半徑（mm）',innerRadiusMm:'內半徑（mm）',lengthMm:'長度（mm）',observedSides:'實際圓周分段數',idealVolumeMm3:'理想圓形體積（mm³）',polygonVolumeMm3:'多邊形公式體積（mm³）',meshVolumeMm3:'實際網格積分（mm³）',numericalErrorMm3:'數值差（mm³）',polygonDeficitPercent:'多邊形近似少量（%）',pitchMm:'螺距／此單線導程（mm）',samples:'實體取樣結果',degrees:'轉角（°）',advanceMm:'軸向前進量（mm）',radialSurfaceMm:'實體牙面半徑（mm）',baseRadiusMm:'基準牙面半徑（mm）',phaseErrorMm:'等相位半徑差（mm）',handednessScope:'旋向與座標適用範圍',meanRadiusMm:'中心線半徑（mm）',turns:'圈數',heightMm:'螺旋總高度（mm）',legLengthEachMm:'每支切向腳長（mm）',coilSegments:'中心線折線段數',idealCoilLengthMm:'理想螺旋弧長（mm）',meshConstructionCoilLengthMm:'原生中心線長（mm）',polylineTotalWithLegsMm:'含兩腳折線總長（mm）',poses:'工作角度讀回',angleDegrees:'轉角（°）',radialAdjustmentMm:'半徑調整量（mm）',errorMm:'長度差（mm）',axialPitchMinusWireMm:'軸向節距減線徑（mm）',missingInputs:'待取得的真實輸入',materialGrade:'材料牌號',sampledNominalGeometry:'已讀名義形體',pivotMm:'樞軸座標（mm）',cableEyeMm:'拉索眼座標（mm）',armMm:'力臂向量（mm）',coefficientForFyMm:'Fy 的力矩係數（mm）',coefficientForFxMm:'Fx 的力矩係數（mm）',interpretation:'數值意思',freeThicknessMm:'自由厚度（mm）',readbackFreeThicknessMm:'讀回自由厚度（mm）',installedThicknessMm:'裝入後厚度（mm）',compressionStrain:'壓縮應變',grooveZmm:'扣槽 Z 範圍（mm）',clipZmm:'扣環 Z 範圍（mm）',clipThicknessMm:'扣環厚度（mm）',totalAxialGapMm:'總軸向間隙（mm）',profileZR_mm:'完整輪廓 [Z,R]（mm）',sides:'圓周分段數',testedShapeAnglesDeg:'已查形體角度（°）'};
    const display=value=>{if(value===null)return '未取得';if(typeof value==='number')return Number.isInteger(value)?String(value):String(Number(value.toPrecision(8)));if(Array.isArray(value))return value.every(v=>v===null||typeof v!=='object')?'['+value.map(display).join(', ')+']':value.map((v,i)=>'<div><small>'+(i+1)+'</small> '+display(v)+'</div>').join('');if(typeof value==='object')return '<dl>'+Object.entries(value).map(([k,v])=>'<div><dt title="'+esc(k)+'">'+esc(names[k]||k)+'</dt><dd>'+display(v)+'</dd></div>').join('')+'</dl>';return esc(value);};
    return '<dl class="values">' + Object.entries(values).map(([key, value]) => '<div><dt title="'+esc(key)+'">' + esc(names[key]||key) + '</dt><dd>' + display(value) + '</dd></div>').join('') + '</dl><p class="muted">畫面最多顯示 8 位有效數字；完整數值見 <a href="math-quality.json">原始資料</a>。顯示位數不代表製造精度。</p>';
  }
  function renderList() {
    const terms = byId('search').value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const shown = data.parts.filter(part => {
      const searchable = [part.id, part.name, part.purpose, ...part.lawIds.map(id => laws.get(id)?.title || ''), ...part.checks.map(check => check.title)].join(' ').toLocaleLowerCase();
      return terms.every(term => searchable.includes(term));
    });
    byId('part-count').textContent = shown.length + ' / ' + data.parts.length + ' 件';
    byId('part-list').innerHTML = shown.length ? shown.map(part => '<button type="button" class="part-button' + (selectedId === part.id ? ' active' : '') + '" data-part="' + esc(part.id) + '" aria-current="' + (selectedId === part.id ? 'true' : 'false') + '"><span class="part-code">' + esc(part.id) + '</span><strong>' + esc(part.name) + '</strong><span class="part-badges">' + badges(part.checks) + '</span></button>').join('') : '<p class="empty">找不到相符零件。請縮短關鍵字。</p>';
  }
  function renderLaw(law, index) {
    return '<details id="law-' + esc(law.id) + '" class="law"' + (index === 0 ? ' open' : '') + '><summary><span><span class="eyebrow">' + esc(law.kind) + ' · ' + esc(law.id) + '</span><strong>' + esc(law.title) + '</strong></span><span class="expand" aria-hidden="true">＋</span></summary><div class="law-body"><p>' + esc(law.application) + '</p><div class="formula">' + esc(law.formula) + '</div><div class="law-columns"><section><h4>成立前提</h4>' + list(law.premises) + '</section><section><h4>符號與單位</h4><dl class="variables">' + law.variables.map(variable => '<div><dt>' + esc(variable.symbol) + '</dt><dd>' + esc(variable.meaning) + '<span class="unit">' + esc(variable.unit) + '</span></dd></div>').join('') + '</dl></section></div><h4>怎麼用在零件上</h4><ol>' + law.procedure.map(step => '<li>' + esc(step) + '</li>').join('') + '</ol><div class="action"><strong>不成立時怎麼修正</strong><p>' + esc(law.failureAction) + '</p></div><h4>適用邊界</h4>' + list(law.limitations) + '<div class="law-sources"><strong>依據</strong> ' + (law.sourceIds.length ? law.sourceIds.map(id => sourceLink(sources.get(id))).join(' · ') : '本專案由上述定義、幾何或代數關係推導；前提與驗證方法見本項。') + '</div></div></details>';
  }
  function renderCheck(check, index) {
    const [label, css] = statusInfo[check.status];
    return '<article class="check-card ' + css + '" data-check="' + esc(check.id) + '"><div class="check-heading"><div><span class="eyebrow">檢查 ' + String(index + 1).padStart(2, '0') + ' · ' + esc(check.id) + '</span><h4>' + esc(check.title) + '</h4></div><span class="badge ' + css + '">' + label + ' <span class="status-code">' + esc(check.status) + '</span></span></div>' + (check.status === 'NEEDS_INPUT' ? '<p class="pending-note">本項缺少判定資料，目前不能視為通過。</p>' : '') + '<div class="formula">' + esc(check.formula) + '</div><div class="check-columns"><section><h5>實際代入值</h5>' + valuesTable(check.inputs) + '</section><section><h5>計算／讀回結果</h5>' + valuesTable(check.result) + '</section></div><dl class="explanation"><div><dt>接受條件</dt><dd>' + esc(check.acceptance) + '</dd></div><div><dt>檢查方法</dt><dd>' + esc(check.method) + '</dd></div><div><dt>判定的意思</dt><dd>' + esc(check.meaning) + '</dd></div></dl><div class="action"><strong>' + (check.status === 'PASS' ? '後續確認' : check.status === 'FAIL' ? '修正動作' : '補齊後再判定') + '</strong><p>' + esc(check.nextAction) + '</p></div></article>';
  }
  function visual(part){return part.visual ? '<figure class="native-reference"><a href="'+esc(part.visual.viewer)+'"><img src="'+esc(part.visual.image)+'" alt="'+esc(part.name)+'原生形體參考" style="width:100%;max-height:440px;object-fit:contain;background:#fff"></a><figcaption>'+esc(part.visual.caption)+'</figcaption></figure>' : '';}
  function select(id) {
    const part = data.parts.find(item => item.id === id);
    if (!part) return null;
    selectedId = part.id;
    byId('part-detail').innerHTML = '<section class="part-intro"><p class="eyebrow">01 ／ 零件用途 · ' + esc(part.id) + '</p><h2>' + esc(part.name) + '</h2><p class="purpose">' + esc(part.purpose) + '</p>' + visual(part) + '<div class="part-meta"><div class="part-badges">' + badges(part.checks) + '</div><a class="guide-link" href="parts/' + encodeURIComponent(part.id) + '/PART.md">開啟這件的 PART.md ↗</a></div></section><section class="detail-section"><div class="section-heading"><p class="eyebrow">02 ／ 適用規律</p><h3>先確認前提，再使用公式</h3></div>' + (part.lawIds.length ? part.lawIds.map((id, index) => renderLaw(laws.get(id), index)).join('') : '<p class="empty">本件尚未列入適用規律。</p>') + '</section><section class="detail-section"><div class="section-heading"><p class="eyebrow">03 ／ 實際代入、判定與修正</p><h3>' + part.checks.length + ' 項檢查，逐項讀回</h3></div><div id="selected-checks">' + (part.checks.length ? part.checks.map(renderCheck).join('') : '<p class="empty">本件尚未提供檢查，不作通過判定。</p>') + '</div></section><section class="detail-section"><div class="section-heading"><p class="eyebrow">04 ／ 尚待補齊</p><h3>下一次判定需要什麼</h3></div>' + (part.openInputs.length ? '<div class="open-inputs">' + part.openInputs.map(input => '<article><h4>' + esc(input.name) + '<span class="unit">' + esc(input.unit) + '</span></h4><p>' + esc(input.reason) + '</p><p><strong>下一步：</strong>' + esc(input.nextAction) + '</p></article>').join('') + '</div>' : '<p class="muted">本件資料未另列待補輸入；仍以每項檢查的範圍與狀態為準。</p>') + '</section>';
    renderList();
    byId('selection-announcement').textContent = '已選取 ' + part.id + '，' + part.name + '，共 ' + part.checks.length + ' 項檢查。';
    try { history.replaceState(null, '', '#' + encodeURIComponent(part.id)); } catch { /* Selection also works on restricted local-file readers. */ }
    return state();
  }
  function state() {
    return { selectedId, partCount: data.parts.length, visibleCheckCount: byId('selected-checks')?.querySelectorAll('.check-card').length || 0 };
  }
  byId('revision').textContent = data.revision;
  byId('scope').textContent = data.scope;
  const unitLabels = { length: '長度', angle: '角度', force: '力', stress: '應力', torque: '力矩' };
  byId('units').textContent = Object.entries(data.units).map(([key, unit]) => (unitLabels[key] || key) + ' ' + plain(unit)).join(' · ');
  byId('summary').innerHTML = [['parts', '真實零件', ''], ['pass', '已通過此項', 'pass'], ['fail', '未通過', 'fail'], ['needsInput', '待補資料', 'pending']].map(([key, label, css]) => '<div class="summary-item ' + css + '"><strong>' + esc(data.summary[key]) + '</strong><span>' + label + '</span></div>').join('');
  byId('check-total').textContent = data.summary.checks + ' 項檢查；待補資料不納入通過數。';
  byId('sources').innerHTML = data.sources.map(source => '<li id="source-' + esc(source.id) + '"><span class="eyebrow">' + esc(source.id) + '</span><strong>' + sourceLink(source) + '</strong><p>' + esc(source.scope) + '</p></li>').join('');
  byId('search').addEventListener('input', renderList);
  byId('part-list').addEventListener('click', event => { const button = event.target.closest('[data-part]'); if (button) select(button.dataset.part); });
  window.MATH_QUALITY = Object.freeze({ select, state });
  let initialId;
  try { initialId = decodeURIComponent(location.hash.slice(1)); } catch { initialId = ''; }
  function route(id) {
    if (id.startsWith('law-') && laws.has(id.slice(4))) {
      const lawId=id.slice(4), part=data.parts.find(p=>p.lawIds.includes(lawId));
      if(!part)return;
      select(part.id);
      const card=byId(id); if(card){card.open=true;card.scrollIntoView({block:'start'});}
      history.replaceState(null,'','#'+encodeURIComponent(id));
    } else if(data.parts.some(p=>p.id===id)) select(id);
    else if(!selectedId)select(data.parts[0].id);
  }
  route(initialId || '');
  window.addEventListener('hashchange',()=>{try{route(decodeURIComponent(location.hash.slice(1)));}catch{}});

  const format = number => {
    if (number === 0 || Object.is(number, -0)) return '0';
    if (Math.abs(number) < 0.000001 || Math.abs(number) >= 10000000) return number.toExponential(5);
    return Number(number.toPrecision(10)).toLocaleString('zh-TW', { maximumFractionDigits: 10, useGrouping: false });
  };
  function readNumber(id, { positive = false, nonnegative = false } = {}) {
    const input = byId(id);
    const number = input.valueAsNumber;
    const valid = input.value.trim() !== '' && Number.isFinite(number) && (!positive || number > 0) && (!nonnegative || number >= 0);
    input.setAttribute('aria-invalid', String(!valid));
    return valid ? number : null;
  }
  function clearance() {
    const D = readNumber('hole', { positive: true });
    const d = readNumber('shaft', { positive: true });
    const e = readNumber('eccentricity', { nonnegative: true });
    const output = byId('clearance');
    const graphic = byId('fit-graphic');
    if (D === null || d === null || e === null) {
      output.textContent = '輸入不合法';
      byId('fit-detail').textContent = '請輸入有限數值：孔徑 D、軸徑 d 必須大於 0 mm；偏心 e 必須大於或等於 0 mm。空白不能代替 0。';
      byId('fit-verdict').textContent = '尚未計算';
      byId('fit-verdict').className = 'exercise-verdict pending';
      graphic.hidden = true;
      return;
    }
    const rawClearance = (D - d) / 2 - e;
    const roundoff = 8 * Number.EPSILON * Math.max(D, d, e);
    const c = Math.abs(rawClearance) <= roundoff ? 0 : rawClearance;
    if (!Number.isFinite(c)) {
      output.textContent = '數值超出計算範圍';
      byId('fit-detail').textContent = '請減小輸入值後重算。';
      byId('fit-verdict').textContent = '尚未計算';
      byId('fit-verdict').className = 'exercise-verdict pending';
      graphic.hidden = true;
      return;
    }
    output.textContent = format(c) + ' mm';
    byId('fit-detail').textContent = 'c = (' + format(D) + ' − ' + format(d) + ') / 2 − ' + format(e) + ' = ' + format(c) + ' mm。' + (c > 0 ? '此截面仍有正間隙；是否符合指定配合，仍要對照公差與接受條件。' : c < 0 ? '此截面無法完全容納此軸；可減小偏心或軸徑、增加孔徑，再檢查其他接面。' : '算術捨入範圍內為接觸邊界，沒有可宣稱的正間隙；不是製造餘裕。');
    byId('fit-verdict').textContent = c > 0 ? '正間隙' : c < 0 ? '幾何干涉' : '接觸邊界';
    byId('fit-verdict').className = 'exercise-verdict ' + (c > 0 ? 'pass' : c < 0 ? 'fail' : 'pending');
    graphic.hidden = false;
    const base = Math.max(D, d, e);
    const R = D / base / 2, r = d / base / 2, offset = e / base;
    const lo = Math.min(-R, offset - r), hi = Math.max(R, offset + r);
    const scale = Math.min(340 / (hi - lo), 160 / Math.max(2 * R, 2 * r));
    const cx = 40 - lo * scale, sx = cx + offset * scale;
    graphic.innerHTML = '<title>圓孔與平行圓軸截面的幾何間隙</title><line x1="28" y1="105" x2="392" y2="105" stroke="#9aac9f" stroke-dasharray="4 5"/><circle cx="' + cx + '" cy="105" r="' + (R * scale) + '" fill="#e4eee2" stroke="#275e45" stroke-width="2"/><circle cx="' + sx + '" cy="105" r="' + (r * scale) + '" fill="#819e8780" stroke="#3c6651" stroke-width="2"/><path d="M' + (cx - 5) + ',105h10M' + cx + ',100v10M' + (sx - 5) + ',105h10M' + sx + ',100v10" stroke="#17392d"/><line x1="' + (sx + r * scale) + '" y1="105" x2="' + (cx + R * scale) + '" y2="105" stroke="' + (c < 0 ? '#a04439' : '#275e45') + '" stroke-width="5"/><text x="210" y="213" text-anchor="middle" fill="#5f7068" font-size="13">深色：軸　淺色：孔　沿偏心方向讀取 c</text>';
  }
  function advance() {
    const p = readNumber('pitch', { positive: true });
    const degrees = readNumber('angle');
    const output = byId('advance');
    if (p === null || degrees === null) {
      output.textContent = '輸入不合法';
      byId('radians').textContent = 'θ = — rad';
      byId('motion-detail').textContent = '請輸入有限數值：螺距 p 必須大於 0 mm；轉角可為正、負或 0°。空白不能代替 0。';
      byId('pitch-note').textContent = '此來源的 M5×0.8 原型使用 p = 0.8 mm。';
      return;
    }
    const theta = degrees * (Math.PI / 180);
    const displacement = -(degrees / 360) * p;
    if (!Number.isFinite(theta) || !Number.isFinite(displacement)) {
      output.textContent = '數值超出計算範圍';
      byId('radians').textContent = 'θ = — rad';
      byId('motion-detail').textContent = '請減小輸入值後重算。';
      byId('pitch-note').textContent = '此來源的 M5×0.8 原型使用 p = 0.8 mm。';
      return;
    }
    output.textContent = format(displacement) + ' mm';
    byId('radians').textContent = 'θ = ' + format(degrees) + ' × π / 180 = ' + format(theta) + ' rad';
    byId('motion-detail').textContent = 'Δy = −' + format(p) + ' × ' + format(theta) + ' / (2π) = ' + format(displacement) + ' mm。' + (displacement < 0 ? '沿此來源局部螺紋軸的負方向移動。' : displacement > 0 ? '沿此來源局部螺紋軸的正方向移動。' : '轉角為 0，軸向位移為 0。');
    byId('pitch-note').textContent = p === 0.8 ? '目前採用此來源的 M5×0.8 螺距：每轉一圈，軸向移動 0.8 mm。' : '目前 p = ' + format(p) + ' mm 是自訂練習值；此來源的 M5×0.8 原型仍為 p = 0.8 mm。';
  }
  ['hole', 'shaft', 'eccentricity'].forEach(id => byId(id).addEventListener('input', clearance));
  ['pitch', 'angle'].forEach(id => byId(id).addEventListener('input', advance));
  byId('fit-reset').addEventListener('click', () => { byId('hole').value = '4.2'; byId('shaft').value = '4'; byId('eccentricity').value = '0'; clearance(); });
  byId('motion-reset').addEventListener('click', () => { byId('pitch').value = '0.8'; byId('angle').value = '360'; advance(); });
  clearance();
  advance();
}

const html = `<!doctype html>
<html lang="zh-Hant-TW">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>GT01 · 零件的數學與物理</title>
<style>
:root{--ink:#193b30;--muted:#5f7068;--paper:#f3f4ee;--line:#dce2d8;--accent:#275e45;--pass:#2c6248;--fail:#9b3d30;--pending:#805c15}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:var(--paper);color:#22382f;font:16px/1.65 system-ui,"Microsoft JhengHei",sans-serif}a{color:var(--accent);text-underline-offset:3px}a,button,input,summary{-webkit-tap-highlight-color:transparent}button,input{font:inherit}button,a,summary,input{outline-offset:4px}:focus-visible{outline:3px solid #679274}button{cursor:pointer}header{padding:27px 34px;background:#17392d;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:25px}.signature{font-size:15px;margin:0 0 7px}.brand h1{font-size:29px;line-height:1.35;letter-spacing:.02em;margin:0}.brand>p:last-child{font-size:14px;color:#c3d6c8;margin:8px 0 0}.toplinks{display:flex;gap:16px;flex-wrap:wrap}.toplinks a{font-size:13px;color:#d4e5d3}.overview{padding:28px 34px;display:grid;grid-template-columns:minmax(270px,1fr) minmax(350px,.85fr);gap:40px;max-width:1600px;margin:auto}.overview h2{font-size:21px;margin:0 0 8px}.overview p{font-size:14px;color:var(--muted);margin:7px 0}.overview .boundary{font-size:13px;padding-left:12px;border-left:3px solid #adbb9e;color:#54664d}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;align-self:center}.summary-item{background:#fff;border:1px solid var(--line);border-radius:9px;padding:13px 15px;display:flex;flex-direction:column}.summary-item strong{font-size:29px;line-height:1.3;font-weight:650}.summary-item span{font-size:12px;color:var(--muted)}.summary-item.pass strong{color:var(--pass)}.summary-item.fail strong{color:var(--fail)}.summary-item.pending strong{color:var(--pending)}.summary-note{grid-column:1/-1;font-size:12px;color:var(--muted);margin:0}.workspace{display:grid;grid-template-columns:300px minmax(0,1fr);border-block:1px solid var(--line);max-width:1600px;margin:auto}.sidebar{background:#e9ede5;border-right:1px solid var(--line);padding:23px 17px}.sidebar-inner{position:sticky;top:20px}.search-label{font-size:14px;font-weight:650;display:block;margin-bottom:9px}.sidebar input{width:100%;background:#fff;border:1px solid #bdcbbb;border-radius:7px;padding:11px 12px;min-width:0;font-size:14px}.list-meta{font-size:12px;color:var(--muted);display:flex;justify-content:space-between;margin:12px 2px}.part-list{display:grid;gap:7px;max-height:calc(100vh - 172px);overflow:auto;padding:3px}.part-button{text-align:left;width:100%;padding:12px;border:1px solid transparent;background:transparent;border-radius:8px;color:inherit;display:block}.part-button:hover{background:#dfe7da}.part-button.active{background:#fff;border-color:#9aae92;box-shadow:inset 3px 0 0 #275e45}.part-code,.eyebrow{font:11px/1.6 ui-monospace,system-ui,"Microsoft JhengHei",sans-serif;color:#71816c;letter-spacing:.06em}.part-button strong{display:block;font-size:14px;line-height:1.5;margin:3px 0 7px}.part-badges{display:flex;flex-wrap:wrap;gap:5px}.badge{font-size:11px;line-height:1.55;padding:3px 7px;border:1px solid transparent;border-radius:5px;white-space:normal;display:inline-block;font-weight:550}.badge.pass{background:#e7f0e4;border-color:#cbdcc4;color:var(--pass)}.badge.fail{background:#f9e9e3;border-color:#e5c3b8;color:var(--fail)}.badge.pending{background:#f6efd9;border-color:#e5d7ae;color:var(--pending)}main{min-width:0;padding:29px 34px 38px}.part-intro h2{font-size:29px;line-height:1.4;margin:4px 0 12px}.purpose{font-size:17px;max-width:75ch;margin:0 0 19px}.part-meta{display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;align-items:center}.guide-link{font-size:13px}.detail-section{margin-top:35px}.section-heading{margin-bottom:14px}.section-heading h3{font-size:20px;margin:2px 0}.eyebrow{margin:0 0 4px}.law{background:#fff;border:1px solid var(--line);border-radius:9px;margin:11px 0;overflow:hidden}.law>summary{padding:16px 18px;cursor:pointer;list-style:none;display:flex;gap:15px;justify-content:space-between;align-items:center}.law>summary::-webkit-details-marker{display:none}.law summary strong,.law summary .eyebrow{display:block}.law summary strong{font-size:16px}.expand{font-size:22px;font-weight:300;color:#71816c}.law[open] .expand{transform:rotate(45deg)}.law-body{padding:0 19px 20px;border-top:1px solid #edf0e9;font-size:14px}.law-body>p{margin-top:16px}.formula{white-space:pre-wrap;overflow-wrap:anywhere;background:#eff3eb;border:1px solid #dce5d5;border-radius:6px;padding:13px 15px;font:15px/1.75 ui-monospace,"Microsoft JhengHei",monospace;margin:13px 0}.law-columns,.check-columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}h4{font-size:15px;margin:18px 0 7px}h5{font-size:13px;margin:6px 0 9px;font-weight:650}.variables{margin:0}.variables>div{display:grid;grid-template-columns:65px 1fr;gap:12px;border-bottom:1px solid var(--line);padding:7px 0}.variables dt{font-family:ui-monospace,monospace}.variables dd{margin:0}.unit{font-size:12px;color:#6c7f64;margin-left:10px;display:inline-block}ul,ol{padding-left:22px;margin:8px 0 16px}li{margin:5px 0}.action{background:#f5f6ef;border-left:3px solid #aabd9d;padding:11px 14px;margin-top:14px;font-size:13px}.action p{margin:4px 0 0;white-space:pre-wrap;overflow-wrap:anywhere}.law-sources{font-size:12px;padding-top:13px;border-top:1px solid var(--line)}.law-sources strong{margin-right:6px}.check-card{background:#fff;border:1px solid var(--line);border-top:3px solid #b3cba8;border-radius:8px;padding:19px 21px;margin:15px 0}.check-card.fail{border-top-color:#be7762}.check-card.pending{border-top-color:#cab572}.check-heading{display:flex;justify-content:space-between;gap:16px;align-items:start}.check-heading h4{font-size:17px;margin:4px 0 0}.check-heading .badge{flex-shrink:0}.status-code{display:block;font:10px/1.5 ui-monospace,monospace}.pending-note{font-size:13px;color:var(--pending);margin:12px 0 0}.values{font-size:13px;margin:0;overflow-wrap:anywhere}.values>div{padding:7px 0;border-bottom:1px solid #e7ebe1}.values dt{font-family:ui-monospace,"Microsoft JhengHei",monospace;color:#6e7c65}.values dd{margin:3px 0 0;white-space:pre-wrap}.explanation{font-size:13px;margin:19px 0 0}.explanation>div{display:grid;grid-template-columns:85px 1fr;gap:10px;margin:10px 0}.explanation dt{color:#6b7c62}.explanation dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.open-inputs{display:grid;gap:10px}.open-inputs article{background:#f6f0df;border:1px solid #e5ddbf;border-radius:8px;padding:14px 17px;font-size:13px}.open-inputs h4{margin:0 0 5px}.open-inputs p{margin:5px 0}.empty,.muted{color:var(--muted);font-size:14px}.empty{padding:18px 8px}.learn{padding:37px 34px 40px;max-width:1600px;margin:auto}.learn>h2,.source-section h2{font-size:25px;margin:3px 0 8px}.learn>p:not(.eyebrow){font-size:14px;color:var(--muted);max-width:85ch;margin:8px 0 22px}.exercises{display:grid;grid-template-columns:1fr 1fr;gap:24px}.exercise{background:#fff;border:1px solid var(--line);border-radius:10px;padding:23px;min-width:0}.exercise h3{font-size:19px;margin:4px 0 12px}.exercise>p{font-size:13px;color:var(--muted)}.exercise form{margin:18px 0}.input-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.input-row.two{grid-template-columns:repeat(2,minmax(0,1fr))}.field label{display:block;font-size:12px;margin-bottom:5px}.input-unit{position:relative}.input-unit input{width:100%;min-width:0;border:1px solid #becbb6;border-radius:6px;background:#fbfcf8;padding:10px 37px 10px 11px}.input-unit span{position:absolute;right:10px;top:12px;font-size:12px;color:#71816b;pointer-events:none}.input-unit input[aria-invalid="true"]{border-color:#b66250;background:#fff7f3}.result{background:#edf3e8;border:1px solid #d4dfc9;border-radius:8px;padding:15px 17px;margin-top:19px}.result>span{font-size:12px;color:#68795e}.result output{display:block;font-size:28px;line-height:1.5;font-variant-numeric:tabular-nums;color:var(--ink);overflow-wrap:anywhere}.exercise-verdict{font-size:12px;font-weight:650}.exercise-verdict.pass{color:var(--pass)}.exercise-verdict.fail{color:var(--fail)}.exercise-verdict.pending{color:var(--pending)}.calculation{font-size:13px;overflow-wrap:anywhere}.fit-graphic{width:100%;height:225px;margin-top:6px;display:block}.fit-graphic[hidden]{display:none}.exercise-bottom{display:flex;gap:12px;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding-top:13px;margin-top:14px}.exercise-bottom button{border:1px solid #cad7c1;background:transparent;border-radius:5px;padding:6px 10px;font-size:12px;color:var(--accent);flex-shrink:0}.exercise-bottom span{font-size:11px;color:var(--muted)}.motion-rule{margin:20px 0;border-left:3px solid #b2c7a6;padding:2px 0 2px 14px}.motion-rule p{font-size:13px;margin:7px 0}.radians{font-family:ui-monospace,"Microsoft JhengHei",monospace;font-size:13px;overflow-wrap:anywhere}.source-section{border-top:1px solid var(--line);padding:29px 34px 35px;max-width:1600px;margin:auto}.source-section>p{font-size:13px;color:var(--muted)}.sources{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 28px;list-style:none;padding:0}.sources li{border-bottom:1px solid var(--line);padding:12px 0;margin:0;overflow-wrap:anywhere}.sources strong,.sources .eyebrow{display:block}.sources strong{font-size:14px}.sources p{font-size:12px;color:var(--muted);margin:6px 0}footer{font-size:12px;color:var(--muted);padding:20px 34px;background:#e9ede5;border-top:1px solid var(--line)}footer p{margin:4px 0}.sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.skip{position:absolute;left:15px;top:-100px;background:#fff;padding:10px 15px;z-index:10}.skip:focus{top:12px}.noscript{margin:24px;padding:18px;background:#f6efd9}
@media(min-width:1600px){.workspace{border-inline:1px solid var(--line)}}@media(max-width:1050px){.overview{grid-template-columns:1fr;gap:18px}.workspace{grid-template-columns:255px minmax(0,1fr)}main{padding:24px}.law-columns,.check-columns{grid-template-columns:1fr;gap:10px}.exercises{gap:16px}.exercise{padding:18px}.input-row{gap:8px}.check-heading{flex-wrap:wrap}.check-heading .badge{flex-shrink:1}}@media(max-width:760px){header{padding:23px;display:block}.brand h1{font-size:25px}.toplinks{margin-top:18px;gap:12px}.overview,.learn,.source-section{padding:24px 20px}.summary{gap:7px}.summary-item{padding:11px 10px}.summary-item strong{font-size:25px}.summary-item span{font-size:11px}.workspace{grid-template-columns:1fr}.sidebar{border-right:0;border-bottom:1px solid var(--line);padding:18px}.sidebar-inner{position:static}.part-list{grid-template-columns:repeat(2,minmax(0,1fr));max-height:290px}.part-button{padding:10px}.part-button strong{font-size:13px}.part-button .badge{font-size:10px}.list-meta{margin-bottom:5px}main{padding:23px 20px 30px}.part-intro h2{font-size:25px}.purpose{font-size:15px}.detail-section{margin-top:28px}.law-body{padding-inline:15px}.check-card{padding:16px}.exercises,.sources{grid-template-columns:1fr}.explanation>div{grid-template-columns:1fr;gap:3px}.exercise{padding:19px}.exercise-bottom{align-items:start}.learn>h2,.source-section h2{font-size:23px}footer{padding:19px 20px}}@media(max-width:380px){.part-list{grid-template-columns:1fr}.summary{grid-template-columns:repeat(2,1fr)}.input-row{grid-template-columns:1fr}.input-row.two{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{header{background:#fff;color:#193b30}.brand>p:last-child{color:#5f7068}.sidebar,.toplinks,.skip,.exercise-bottom button{display:none}.overview,.workspace,.exercises,.sources{display:block}main,.learn,.source-section{padding:20px 0}.exercise,.check-card,.law{break-inside:avoid}.summary{max-width:650px}body{background:#fff}.fit-graphic{max-width:400px}}
</style></head>
<body>
<header><div class="brand"><p class="signature">יהוה</p><h1>GT01 · 零件的數學與物理</h1><p>從用途到公式，再到每一項實際判定</p></div><nav class="toplinks" aria-label="零件庫導覽"><a href="index.html">回零件庫</a><a href="knowledge-map.html">用途與跨域知識樹</a><a href="assembly.html">實際回裝</a><a href="quality.html">紅圈品管</a><a href="#interactive">互動教學</a><a href="#source-section">來源</a></nav></header>
<a class="skip" href="#part-detail">跳至選定零件</a>
<section class="overview" aria-labelledby="overview-title"><div><h2 id="overview-title">讀懂關係，才知道如何判定</h2><p id="scope"></p><p id="units"></p><p class="boundary">幾何驗證不等於載荷或製造放行。每個判定只適用於所列前提、輸入與檢查範圍。</p></div><div class="summary" id="summary"></div><p id="check-total" class="summary-note"></p></section>
<div class="workspace"><aside class="sidebar"><div class="sidebar-inner"><label class="search-label" for="search">選一件，沿著檢查往下讀</label><input id="search" type="search" placeholder="零件、用途、規律…" autocomplete="off"><div class="list-meta"><span>零件清單</span><span id="part-count" role="status"></span></div><nav id="part-list" class="part-list" aria-label="十二件零件"></nav></div></aside><main id="part-detail" tabindex="-1"></main></div>
<p id="selection-announcement" class="sr-only" role="status" aria-live="polite"></p>
<section class="learn" id="interactive" aria-labelledby="learn-title"><p class="eyebrow">動手代入 ／ 兩個小實驗</p><h2 id="learn-title">改一個數值，看關係怎麼變</h2><p>以下是公式教學。輸入值只改變練習結果，不改寫上方零件的實際檢查或通過狀態；所有角度與長度都明列單位。</p><div class="exercises">
<article class="exercise"><p class="eyebrow">01 ／ 孔、軸與偏心</p><h3>直徑差的一半，還要扣掉偏心</h3><div class="formula">c = (D − d) / 2 − e</div><p>假設孔軸都是理想圓截面，兩軸平行。D 為孔徑、d 為軸徑，e 為兩中心的偏移量；c 是最小徑向間隙。此式不處理傾斜、彈性變形或完整裝入路徑。</p><form onsubmit="return false" aria-label="幾何配合教學"><div class="input-row"><div class="field"><label for="hole">孔徑 D</label><div class="input-unit"><input id="hole" type="number" step="any" min="0" value="4.2" aria-describedby="fit-detail"><span>mm</span></div></div><div class="field"><label for="shaft">軸徑 d</label><div class="input-unit"><input id="shaft" type="number" step="any" min="0" value="4" aria-describedby="fit-detail"><span>mm</span></div></div><div class="field"><label for="eccentricity">偏心 e</label><div class="input-unit"><input id="eccentricity" type="number" step="any" min="0" value="0" aria-describedby="fit-detail"><span>mm</span></div></div></div><div class="result" aria-live="polite"><span>最小徑向間隙 c</span><output id="clearance" for="hole shaft eccentricity"></output><div id="fit-verdict" class="exercise-verdict"></div></div></form><p id="fit-detail" class="calculation"></p><svg id="fit-graphic" class="fit-graphic" viewBox="0 0 420 225" role="img" aria-label="孔與軸截面及偏心示意"></svg><div class="exercise-bottom"><span>預設以 Ø4.2 孔與 Ø4 軸示範，偏心由 0 開始。</span><button id="fit-reset" type="button">重設練習</button></div></article>
<article class="exercise"><p class="eyebrow">02 ／ 角度與螺距運動</p><h3>M5×0.8 轉一圈，移動多少</h3><div class="formula">θ = 角度 × π / 180<br>Δy = −pθ / (2π)</div><p>θ 必須先換成弧度。這個關係對應此來源的 M5×0.8 螺紋運動；一圈 2π rad 對應一個螺距 p = 0.8 mm。</p><form onsubmit="return false" aria-label="度轉弧度與螺距教學"><div class="input-row two"><div class="field"><label for="pitch">螺距 p</label><div class="input-unit"><input id="pitch" type="number" step="any" min="0" value="0.8" aria-describedby="motion-detail pitch-note"><span>mm</span></div></div><div class="field"><label for="angle">輸入轉角</label><div class="input-unit"><input id="angle" type="number" step="any" value="360" aria-describedby="radians motion-detail"><span>°</span></div></div></div><p id="radians" class="radians"></p><div class="result" aria-live="polite"><span>此來源座標的軸向位移 Δy</span><output id="advance" for="pitch angle"></output></div></form><p id="motion-detail" class="calculation"></p><p id="pitch-note"></p><div class="motion-rule"><p><strong>負號來自此來源的座標慣例。</strong>正向轉角對應局部螺紋軸的負向位移；旋轉方向、觀察方向與座標軸需要一起讀。</p><p>換了座標、旋向或多線螺紋，必須重新確認正負號與每圈導程，不能把此式直接泛化到所有螺紋。此運動關係也不等於夾持力或鎖緊扭矩。</p></div><div class="exercise-bottom"><span>可輸入負角度，觀察反向位移。</span><button id="motion-reset" type="button">回到一圈</button></div></article>
</div></section>
<section class="source-section" id="source-section" aria-labelledby="sources-title"><p class="eyebrow">可追溯依據</p><h2 id="sources-title">每個來源都有適用範圍</h2><p>公式旁的連結對應下列來源。頁面與內嵌資料可離線使用；外部來源連結需要網路。</p><ul id="sources" class="sources"></ul></section>
<footer><p>資料版本：<span id="revision"></span> · <a href="math-quality.json">原始數學檢查資料</a></p><p><a href="index.html">零件庫</a> · <a href="assembly.html">十步實際回裝</a> · <a href="quality.html">紅圈品管</a> · 各零件的 PART.md 由所選零件頁面連入。</p></footer>
<noscript><p class="noscript">此離線教學頁需要啟用 JavaScript，才能選擇零件與計算互動結果。也可開啟 <a href="math-quality.json">原始資料</a>閱讀。</p></noscript>
<script id="math-data" type="application/json">${embedded}</script>
<script>(${startPage.toString()})();</script>
</body></html>`;
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, html, 'utf8');
console.log('Built ' + outputPath + ' from ' + inputPath + ' (' + data.parts.length + ' parts, ' + data.summary.checks + ' checks).');
