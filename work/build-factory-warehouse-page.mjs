import {physicalDecompositionSection} from './factory-warehouse-decomposition-section.mjs';
import fs from 'node:fs/promises';
import {FACTORY_FAMILIES} from '../outputs/source/factory-knowledge.mjs';

// This reader owns its HTML only. Catalog, drawings, references and qualification
// remain the responsibility of their source producers.
const base = new URL('../outputs/parts-library/factory/', import.meta.url);
let catalog;
try {
  catalog = JSON.parse(await fs.readFile(new URL('catalog.json', base), 'utf8'));
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('尚無 catalog.json；未生成空白庫存頁。目錄完成後再執行本腳本一次。');
    process.exitCode = 2;
  } else throw error;
}

function warehouseReader() {
  'use strict';
  const data = JSON.parse(document.getElementById('warehouse-data').textContent);
  const rows = data.catalog.components;
  const families = new Map(data.families.map(f => [f.id, f.name]));
  const byId = new Map(rows.map(row => [row.id, row]));
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = value => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('zh-TW', {maximumFractionDigits:3}).format(value) : '未提供';
  const plain = value => {
    if (value === null || value === undefined || value === '') return '';
    if (Array.isArray(value)) return value.map(plain).filter(Boolean).join('；');
    if (typeof value === 'object') return Object.entries(value).map(([key,item]) => key + '：' + plain(item)).join('；');
    return String(value);
  };
  const familyName = row => families.get(row.family) || row.family || '未分類';
  const materialName = value => typeof value === 'string' ? value.replace(/^Factory\s*\|\s*/, '') : plain(value);
  const sources = row => Array.isArray(row.sourceObjects) ? row.sourceObjects : [];
  const dimensions = row => Array.isArray(row.dimensionsMM) && row.dimensionsMM.length === 3 ? row.dimensionsMM.map(number).join(' × ') + ' ' + (row.units || data.catalog.units || '單位未提供') : '尺寸尚未提供';
  const searchText = rows.map(row => [row.id,row.name,row.family,familyName(row),plain(row.purpose),plain(row.materials),plain(row.sourceObjects)].join(' ').normalize('NFKC').toLocaleLowerCase('zh-TW'));
  const pageSize = 30;
  let filtered = rows, page = 1, selectedId = null, inputTimer = null;

  // Geometry and drawings stay inside the warehouse; reference images belong to
  // outputs. Normalize only their consumer URL, retaining original catalog data.
  function assetPath(value, reference = false) {
    if (typeof value !== 'string' || !value.trim()) return null;
    const raw = value.trim().replace(/\\/g, '/');
    if (/^[a-z][a-z\d+.-]*:/i.test(raw) || raw.startsWith('//') || /[\u0000-\u001f]/.test(raw)) return null;
    let clean = raw.replace(/^(?:\.\.\/|\.\/)+/, '');
    if (reference) {
      clean = clean.replace(/^outputs\//, '');
      if (!/^(materials|references|quality)\//.test(clean)) return null;
      if (clean.split('/').some(segment => segment === '..' || segment === '.')) return null;
      return '../../' + clean.split('/').map(encodeURIComponent).join('/');
    }
    if (!/^(geometry|drawings|components)\//.test(clean) || clean.split('/').some(segment => segment === '..' || segment === '.')) return null;
    return clean.split('/').map(encodeURIComponent).join('/');
  }
  function richText(value, fallback) {
    if (Array.isArray(value)) {
      const entries = value.map(plain).filter(Boolean);
      return entries.length ? '<ul class="source-list">' + entries.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>' : '<p class="muted">' + esc(fallback) + '</p>';
    }
    const text = plain(value);
    return text ? '<p class="source-prose">' + esc(text) + '</p>' : '<p class="muted">' + esc(fallback) + '</p>';
  }
  function referenceInfo(row) {
    const authority = String(row.referenceAuthority || '');
    if (!row.reference) return {kind:'missing',badge:'獨立參考尚缺',title:'此件尚未提供參考圖片',note:'四視圖只描述目前幾何。待補此件獨立形體、接合部位與材料依據。'};
    if (/GENERAL_SCENE|SCENE_ONLY/i.test(authority)) return {kind:'scene',badge:'總景參考',title:'總景只交代情境',note:'這張圖提供工坊空間與外觀方向，沒有獨立約束本件的輪廓、孔位或接合；不可當作零件已對圖的證據。'};
    if (/AI_GENERATED.*ASSEMBLY|AUTHOR_ASSEMBLY/i.test(authority)) return {kind:'assembly',badge:'AI 生成・總成參考',title:'生成參考與模型導出圖分開讀',note:'這張是 AI 生成的總成方向圖；不是本件獨立實測圖，也不是目前模型的渲染。只比較來源確實交代的範圍。'};
    if (/AI_GENERATED/i.test(authority)) return {kind:'ai',badge:'AI 生成參考',title:'作者生成的形體方向',note:'AI 生成圖提供作者設計方向，不代表製造尺寸已量測或模型已驗收。請與左側目前形體分開判讀。'};
    return {kind:'unknown',badge:'參考身分依來源記錄',title:'來源範圍尚待釐清',note:'此件參考圖的權威範圍未明確對應到獨立零件。不可自行提升為量測、製造或驗收證據。'};
  }
  function imagePanel(url, alt, caption, role) {
    if (!url) return '<div class="image-unavailable"><strong>' + (role === 'drawing' ? '四視圖路徑尚未提供' : '參考圖路徑尚未提供') + '</strong><p>保留缺項，不以其他圖片替代。</p></div>';
    return '<figure class="media"><a href="' + esc(url) + '" target="_blank" rel="noopener" class="media-link" aria-label="開啟原尺寸：' + esc(alt) + '"><img src="' + esc(url) + '" alt="' + esc(alt) + '" decoding="async" data-image-role="' + role + '"></a><p class="image-error" hidden>圖片尚未就緒。請確認保存了相對目錄中的圖片檔案。</p><figcaption>' + esc(caption) + '<a href="' + esc(url) + '" target="_blank" rel="noopener">開啟原尺寸 ↗</a></figcaption></figure>';
  }
  function updateHistory(id) {
    try {
      const url = new URL(location.href);
      url.hash = id || '';
      if (id) url.searchParams.set('stock',id); else url.searchParams.delete('stock');
      url.searchParams.delete('part');
      history.replaceState(null, '', url);
    } catch { /* The document remains usable when a file host limits history. */ }
  }
  function renderDetail(row, keepHistory = false) {
    selectedId = row?.id || null;
    $('detail-empty').hidden = Boolean(row);
    $('detail-content').hidden = !row;
    if (!row) {
      $('detail-content').innerHTML = '';
      if (!keepHistory) updateHistory(null);
      return;
    }
    const drawing = assetPath(row.drawing), reference = assetPath(row.reference, true), ref = referenceInfo(row);
    const materials = Array.isArray(row.materials) ? row.materials : [];
    const ownerList = sources(row);
    const stockLink = '../../GT01-atelier.html?mode=factory&stock=' + encodeURIComponent(row.id);
    const scale = Array.isArray(row.scale) ? row.scale.map(number).join(' × ') : '未提供';
    const bounds = Array.isArray(row.localBounds) ? row.localBounds.map(vector => Array.isArray(vector) ? '(' + vector.map(number).join(', ') + ')' : plain(vector)).join(' → ') : plain(row.localBounds) || '未提供';
    const componentPath = 'components/' + encodeURIComponent(row.id) + '.json';
    const geometryPath = assetPath(row.geometry);
    const occurrence = Number.isFinite(row.occurrenceCount) ? number(row.occurrenceCount) + ' 個場景實例' : '場景實例數未提供';
    $('detail-content').innerHTML = `
      <div class="detail-heading"><div><p class="eyebrow">${esc(familyName(row))} <span>／ ${esc(row.id)}</span></p><h2 id="part-title" tabindex="-1">${esc(row.name || row.id)}</h2><p class="purpose">${esc(plain(row.purpose) || '用途尚未補齊。')}</p></div><span class="status-tag">候選・未驗收</span></div>
      <div class="part-toolbar"><a class="primary-link" href="${esc(stockLink)}">在工坊選取此件 ↗</a><a href="#downloads">下載零件與幾何 ↓</a><span class="occurrence">${esc(occurrence)}</span></div>
      <dl class="part-facts"><div><dt>目前形體包絡 X × Y × Z</dt><dd class="dimension">${esc(dimensions(row))}</dd><small>由目前幾何得到，不是製造公差或配合尺寸。</small></div><div><dt>表面材質</dt><dd>${materials.length ? materials.map(value => '<span class="material-name">' + esc(materialName(value)) + '</span>').join('') : '尚未提供'}</dd><small>材料名稱不代表成分、等級或表面處理已驗收。</small></div></dl>
      <div class="visuals"><section class="visual-panel" aria-labelledby="drawing-title"><div class="visual-heading"><span class="badge model">模型導出</span><h3 id="drawing-title">目前形體・四視圖</h3></div>${imagePanel(drawing, (row.name || row.id) + '，由目前模型導出的四視圖', '正面、側面、頂面與軸測由同一份庫存幾何導出。', 'drawing')}<p class="evidence-note">圖紙與模型具有共同來源，不能互相證明原形正確；隱藏邊線、孔內構造與製造細節仍需其他依據。</p></section>
      <section class="visual-panel reference-panel" aria-labelledby="reference-title"><div class="visual-heading"><span class="badge ${ref.kind === 'scene' ? 'scene' : 'generated'}">${esc(ref.badge)}</span><h3 id="reference-title">${esc(ref.title)}</h3></div>${imagePanel(reference, (row.name || row.id) + ' 的參考圖片；' + ref.badge, ref.note, 'reference')}<p class="evidence-note">來源身分：<code>${esc(row.referenceAuthority || '未提供')}</code></p></section></div>
      <div class="teaching-grid"><section class="teaching" aria-labelledby="assembly-title"><p class="eyebrow">01 / 從用途走向組裝</p><h3 id="assembly-title">如何裝到總成裡</h3>${richText(row.assemblyTeaching,'組裝次序、接合對象與裝入方向尚待補齊。')}<p class="teaching-footnote">這裡記錄組裝教學。最終擺放位置不等於已驗證整段裝入路徑。</p></section>
      <section class="teaching" aria-labelledby="verification-title"><p class="eyebrow">02 / 看什麼，才知道哪裡不對</p><h3 id="verification-title">檢查方法與觀察位置</h3>${richText(row.verification,'此件尚未提供具體檢查方法。')}<p class="teaching-footnote">這些是應檢查的項目與方法，不是本頁替此件出具的通過結果。</p></section></div>
      <section class="unresolved" aria-labelledby="unresolved-title"><p class="eyebrow">留在工作單上</p><h3 id="unresolved-title">尚未完成的構造與證據</h3>${richText(row.unresolved,'來源未列出具體未完成項；這不表示沒有缺項，仍維持未驗收。')}</section>
      <section class="assembly-members" aria-labelledby="owners-title"><div><p class="eyebrow">同一種零件出現在哪裡</p><h3 id="owners-title">所屬總成</h3><p class="muted">依目錄的來源總成記錄。點選編號前往操作指南。</p></div><div class="owner-links">${ownerList.length ? ownerList.map(id => '<a href="../../GT01-factory-guide.html#' + encodeURIComponent(String(id)) + '">' + esc(id) + ' ↗</a>').join('') : '<p class="muted">尚未提供所屬總成。</p>'}</div></section>
      <section class="downloads" id="downloads" aria-labelledby="downloads-title"><div><p class="eyebrow">把形體與關係一起帶走</p><h3 id="downloads-title">下載此件</h3></div><div class="download-links"><a href="${esc(componentPath)}" download>零件資料 <span>component JSON ↓</span></a>${geometryPath ? '<a href="' + esc(geometryPath) + '" download>幾何資料 <span>geometry JSON ↓</span></a>' : '<p class="muted">幾何資料路徑尚缺</p>'}${drawing ? '<a href="' + esc(drawing) + '" download>模型四視圖 <span>SVG ↓</span></a>' : ''}<a href="catalog.json" download>完整目錄 <span>catalog JSON ↓</span></a><a href="assembly.json" download>場景組裝關係 <span>assembly JSON ↓</span></a></div><p class="download-note">重建此件時保留零件資料中的 <code>scale</code> 與材質對應。幾何檔案本身不包含所有場景擺放關係；<code>assembly.json</code> 提供階層與最終姿態，不能直接視為實體裝配步驟。</p></section>
      <details class="trace"><summary>查看尺寸、縮放與來源記錄</summary><dl><div><dt>零件身分</dt><dd>${esc(row.id)}</dd></div><div><dt>目錄版次</dt><dd>${esc(data.catalog.revision || '未提供')}</dd></div><div><dt>來源狀態</dt><dd>${esc(row.status || '未提供')}</dd></div><div><dt>幾何縮放 X × Y × Z</dt><dd>${esc(scale)}</dd></div><div><dt>局部包絡最小點 → 最大點</dt><dd>${esc(bounds)}</dd></div><div><dt>圖紙證據範圍</dt><dd>${esc(row.drawingAuthority || '未提供')}</dd></div><div><dt>目錄記錄的幾何 SHA-256</dt><dd class="digest">${esc(row.geometrySHA256 || '未提供')}</dd></div><div><dt>目錄原始參考路徑</dt><dd>${esc(row.reference || '未提供')}</dd></div></dl><p>圖紙顯示按零件縮放後的目前形體；幾何檔需搭配縮放資訊使用。雜湊僅用於來源追溯，不能證明形體或製造品質。</p></details>`;
    $('detail-content').querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
      img.closest('.media-link').hidden = true;
      img.closest('.media').querySelector('.image-error').hidden = false;
    }, {once:true}));
    if (!keepHistory) updateHistory(row.id);
  }
  function renderList() {
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(Math.max(1, page), pageCount);
    const start = (page - 1) * pageSize, visible = filtered.slice(start, start + pageSize);
    $('match-count').textContent = number(filtered.length) + ' / ' + number(rows.length) + ' 種';
    $('result-note').textContent = filtered.length ? '顯示第 ' + number(start + 1) + '–' + number(Math.min(start + pageSize, filtered.length)) + ' 件' : '沒有符合的零件';
    $('page-info').textContent = filtered.length ? page + ' / ' + pageCount : '0 / 0';
    $('previous-page').disabled = page <= 1 || !filtered.length;
    $('next-page').disabled = page >= pageCount || !filtered.length;
    $('no-matches').hidden = filtered.length > 0;
    $('component-list').innerHTML = visible.map(row => '<li><button type="button" class="part-button' + (row.id === selectedId ? ' selected' : '') + '" data-id="' + esc(row.id) + '" aria-current="' + (row.id === selectedId ? 'true' : 'false') + '"><span class="list-code">' + esc(row.id) + '</span><span class="list-name">' + esc(row.name || row.id) + '</span><span class="list-family">' + esc(familyName(row)) + '</span><span class="list-size">' + esc(dimensions(row)) + '</span><span class="selected-mark" aria-hidden="true">↗</span></button></li>').join('');
  }
  function selectRow(id, options = {}) {
    const row = byId.get(id);
    if (!row) return;
    if (options.reveal) {
      const index = filtered.findIndex(item => item.id === id);
      if (index >= 0) page = Math.floor(index / pageSize) + 1;
    }
    renderDetail(row, options.keepHistory);
    renderList();
  }
  function filterRows() {
    const query = $('search').value.normalize('NFKC').toLocaleLowerCase('zh-TW').trim();
    const terms = query.split(/\s+/).filter(Boolean), family = $('family').value;
    filtered = rows.filter((row,index) => (!family || row.family === family) && terms.every(term => searchText[index].includes(term)));
    page = 1;
    if (!filtered.some(row => row.id === selectedId)) renderDetail(filtered[0] || null);
    renderList();
    $('clear-search').hidden = !query;
  }
  const familyCounts = new Map();
  for (const row of rows) familyCounts.set(row.family || '', (familyCounts.get(row.family || '') || 0) + 1);
  $('family').innerHTML = '<option value="">全部分類</option>' + [...familyCounts].sort((a,b) => String(families.get(a[0]) || a[0]).localeCompare(String(families.get(b[0]) || b[0]),'zh-TW')).filter(([id]) => id).map(([id,count]) => '<option value="' + esc(id) + '">' + esc(families.get(id) || id) + '（' + number(count) + '）</option>').join('');
  $('catalog-revision').textContent = plain(data.catalog.revision) || '版次未提供';
  $('total-count').textContent = number(rows.length);
  $('total-families').textContent = number(familyCounts.size);
  $('catalog-units').textContent = plain(data.catalog.units) || '未提供';
  $('search').addEventListener('input', event => {
    if (event.isComposing) return;
    clearTimeout(inputTimer); inputTimer = setTimeout(filterRows, 120);
  });
  $('search').addEventListener('compositionend', () => {clearTimeout(inputTimer); filterRows();});
  $('family').addEventListener('change', () => {clearTimeout(inputTimer); filterRows();});
  function clearFilters() {clearTimeout(inputTimer); $('search').value=''; $('family').value=''; filterRows(); $('search').focus();}
  $('clear-search').addEventListener('click', () => {clearTimeout(inputTimer); $('search').value=''; filterRows(); $('search').focus();});
  $('reset-filters').addEventListener('click', clearFilters);
  $('component-list').addEventListener('click', event => {
    const button = event.target.closest('button[data-id]');
    if (button) {
      const id = button.dataset.id, restoreFocus = document.activeElement === button;
      selectRow(id);
      if (restoreFocus) [...$('component-list').querySelectorAll('button[data-id]')].find(item => item.dataset.id === id)?.focus({preventScroll:true});
    }
  });
  function changePage(delta) {
    page += delta;
    const first = filtered[(page - 1) * pageSize];
    if (first) renderDetail(first);
    renderList();
    $('list-scroll').scrollTop = 0;
  }
  $('previous-page').addEventListener('click', () => changePage(-1));
  $('next-page').addEventListener('click', () => changePage(1));
  function requestedId() {
    const params = new URLSearchParams(location.search);
    try {
      const hash = decodeURIComponent(location.hash.slice(1));
      return byId.has(hash) ? hash : params.get('stock') || params.get('part') || hash || '';
    } catch {return '';}
  }
  const requested = requestedId();
  if (requested && !byId.has(requested)) {
    $('route-note').hidden = false;
    $('route-note').textContent = '此版目錄找不到「' + requested + '」。目前顯示可用零件；請依件號或名稱搜尋。';
  }
  const initial = byId.get(requested) || rows[0];
  if (initial) selectRow(initial.id, {reveal:true});
  else {renderDetail(null,true);renderList();}
  window.addEventListener('hashchange', () => {
    let id;
    try {id = decodeURIComponent(location.hash.slice(1));} catch {return;}
    if (!byId.has(id)) return;
    $('search').value=''; $('family').value=''; filtered=rows;
    selectRow(id,{reveal:true,keepHistory:true});
  });
}

const css = `
:root{--ink:#243d31;--muted:#627166;--line:#cbd3c5;--paper:#f2f1e9;--white:#fdfbf5;--green:#214b39;--pale:#e6ecdf;--amber:#7b562c;--warm:#f1e5d1;font-synthesis:none;color-scheme:light}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:25px}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Segoe UI","Microsoft JhengHei","PingFang TC",sans-serif;line-height:1.75}a{color:var(--green);text-underline-offset:4px}button,input,select{font:inherit}button,a,input,select,summary{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:disabled{cursor:default;opacity:.42}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #ac7940;outline-offset:3px}h1,h2,h3,p{margin:0}h1,h2,h3{line-height:1.38}h1,h2{font-family:Georgia,"Noto Serif TC","PMingLiU",serif;font-weight:500}h1{font-size:clamp(28px,3vw,43px);letter-spacing:.04em}h2{font-size:clamp(28px,3vw,40px)}h3{font-size:18px;font-weight:600}p+p{margin-top:13px}[hidden]{display:none!important}.muted{color:var(--muted)}.eyebrow{font-size:10px;letter-spacing:.1em;color:var(--muted);margin-bottom:8px}.signature{font-family:Georgia,serif;font-size:15px;line-height:1.3;margin-bottom:10px}.skip-link{position:fixed;top:-80px;left:20px;z-index:10;padding:12px;background:var(--white)}.skip-link:focus{top:15px}.masthead{background:#173b2e;color:#f4f3e9;padding:22px max(3vw,20px) 24px;display:flex;gap:35px;align-items:center}.masthead .eyebrow{color:#c4d3c5;font-size:10px}.masthead h1{margin-top:5px}.masthead nav{margin-left:auto;display:flex;gap:13px 25px;flex-wrap:wrap;justify-content:flex-end;max-width:540px;font-size:12px}.masthead nav a{color:#eef3e8;text-decoration:none;border-bottom:1px solid #859e8c;padding:6px 0}.masthead nav a:hover{border-color:white}.catalog-stats{display:flex;align-items:center;gap:28px;flex-wrap:wrap;padding:16px max(3vw,20px);background:var(--white);border-bottom:1px solid var(--line);font-size:12px;color:var(--muted)}.catalog-stats strong{font-family:Georgia,serif;font-size:21px;font-weight:400;color:var(--green);margin-right:6px}.catalog-stats .revision{margin-left:auto;font-family:Consolas,monospace;font-size:11px}.stock-warning{padding:14px max(3vw,20px);background:var(--warm);color:#715126;font-size:13px;border-bottom:1px solid #d8c5a6}.stock-warning strong{font-weight:650}.stock-warning span{display:block;margin-top:3px;font-size:11px}.workspace{display:grid;grid-template-columns:345px minmax(0,1fr);max-width:1900px;margin:0 auto}.selector{padding:25px 20px 26px;background:#e9ede3;border-right:1px solid var(--line);position:sticky;top:0;align-self:start;max-height:100vh;display:flex;flex-direction:column}.selector h2{font-family:inherit;font-size:20px;font-weight:500}.selection-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:17px}.selection-top a{font-size:11px}.field-label{display:block;font-size:11px;color:#536458;margin:0 0 5px}.search-wrap{position:relative}.search-wrap input{width:100%;border:1px solid #aebdaa;background:var(--white);padding:11px 47px 11px 12px;border-radius:0;font-size:13px;color:var(--ink);min-height:45px}.search-wrap button{position:absolute;right:5px;top:5px;bottom:5px;border:0;background:transparent;color:var(--green);font-size:18px;width:32px}.search-help{font-size:10px;color:var(--muted);margin:7px 0 15px}.selector select{width:100%;padding:9px 30px 9px 10px;border:1px solid #aebdaa;background:var(--white);color:var(--ink);font-size:12px;border-radius:0;min-height:41px}.list-summary{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin:17px 0 9px;font-size:10px;color:var(--muted)}#match-count{font-size:12px;color:var(--green)}.list-scroll{overflow:auto;min-height:120px;max-height:calc(100vh - 350px);overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#a9b9a5 transparent}.component-list{list-style:none;padding:0;margin:0}.component-list li+li{border-top:1px solid #cdd7c7}.part-button{width:100%;border:0;border-left:3px solid transparent;background:transparent;text-align:left;color:var(--ink);padding:13px 26px 13px 12px;position:relative;display:block}.part-button:hover{background:#f5f6ee}.part-button.selected{background:var(--white);border-left-color:var(--green)}.list-code{font-size:9px;color:var(--muted);font-family:Consolas,monospace;display:block}.list-name{display:block;font-size:14px;line-height:1.65;margin:3px 0}.list-family{font-size:10px;color:#5a725d;display:block}.list-size{font-size:10px;display:block;color:var(--muted);margin-top:5px}.selected-mark{position:absolute;right:9px;top:20px;color:var(--green);visibility:hidden}.selected .selected-mark{visibility:visible}.pagination{border-top:1px solid var(--line);display:flex;gap:10px;align-items:center;justify-content:space-between;padding-top:14px;margin-top:14px;font-size:11px}.pagination button{border:1px solid #a9b9a5;padding:7px 11px;color:var(--ink);background:var(--white);min-height:37px}.pagination button:hover:not(:disabled){background:#dbe5d5}.empty-search{padding:22px 10px;text-align:center;font-size:12px}.empty-search button{border:0;background:transparent;text-decoration:underline;color:var(--green);margin-top:12px;padding:8px}.detail{min-width:0;padding:36px clamp(20px,3.3vw,60px) 42px}.route-note{font-size:12px;background:var(--warm);padding:12px 16px;margin-bottom:22px;border-left:3px solid var(--amber);overflow-wrap:anywhere}.detail-heading{display:flex;gap:22px;justify-content:space-between;align-items:start}.detail-heading .eyebrow{margin-bottom:12px}.detail-heading .eyebrow span{font-family:Consolas,monospace;font-size:10px;letter-spacing:0}.purpose{font-size:14px;color:var(--muted);margin-top:14px;max-width:65ch;white-space:pre-line}.status-tag{flex-shrink:0;color:var(--amber);border:1px solid #c6b18e;font-size:10px;padding:5px 10px;background:#f5ecdd;margin-top:5px}.part-toolbar{display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin:25px 0;font-size:12px}.part-toolbar .primary-link{padding:10px 17px;background:var(--green);color:white;text-decoration:none}.primary-link:hover{background:#345e48}.occurrence{font-size:11px;color:var(--muted);margin-left:auto}.part-facts{display:grid;grid-template-columns:1.1fr 1fr;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:0 0 32px;padding:19px 0;gap:25px}.part-facts>div+div{border-left:1px solid var(--line);padding-left:25px}dt{color:var(--muted);font-size:10px;margin-bottom:7px}dd{margin:0;font-size:13px;line-height:1.7}.part-facts .dimension{font-family:Georgia,"Microsoft JhengHei",serif;font-size:24px;line-height:1.5}.part-facts small{display:block;color:var(--muted);font-size:10px;margin-top:7px}.material-name{display:inline-block;border-bottom:1px solid var(--line);margin:0 12px 4px 0;font-size:11px;overflow-wrap:anywhere}.visuals{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:24px}.visual-panel{min-width:0}.visual-heading{margin-bottom:13px;min-height:62px}.visual-heading h3{font-size:17px;margin-top:9px}.badge{font-size:9px;letter-spacing:.06em;border:1px solid currentColor;padding:3px 8px;display:inline-block}.badge.model{color:#3b6246;background:#e3ebdd}.badge.generated{color:#835d2a;background:#f4ead7}.badge.scene{color:#5c6760;background:#e8e9e1}.media{margin:0}.media-link{display:flex;align-items:center;justify-content:center;aspect-ratio:1.37;background:#fffef8;border:1px solid var(--line);padding:8px}.reference-panel .media-link{padding:0;background:#e2e4db}.media-link img{width:100%;height:100%;object-fit:contain;display:block}.media-link:hover{border-color:var(--green)}figcaption{font-size:11px;line-height:1.75;margin-top:10px;color:var(--muted)}figcaption a{display:block;margin-top:5px;font-size:10px}.evidence-note{font-size:10px;color:#745c3d;border-top:1px solid var(--line);padding-top:11px;margin-top:12px;line-height:1.8;overflow-wrap:anywhere}.evidence-note code{font-size:9px}.image-unavailable,.image-error{aspect-ratio:1.37;background:#e9e9df;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:26px;text-align:center;font-size:12px;color:var(--muted);border:1px dashed #aeb9a8}.image-unavailable p{font-size:11px;margin-top:8px}.teaching-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin:35px 0}.teaching{border-top:2px solid var(--green);padding-top:20px}.teaching h3{font-size:21px;margin-bottom:14px}.source-prose{font-size:14px;line-height:1.95;white-space:pre-line}.source-list{padding-left:20px;margin:13px 0;font-size:14px;line-height:1.9}.source-list li+li{margin-top:8px}.teaching-footnote{font-size:11px;color:var(--muted);margin-top:16px}.unresolved{background:var(--warm);border-left:3px solid #a2773d;padding:23px 26px}.unresolved h3{font-size:21px;margin-bottom:12px}.unresolved .eyebrow{color:#755c3d}.unresolved .source-prose{font-size:13px}.assembly-members{display:grid;grid-template-columns:.8fr 1.2fr;gap:28px;padding:30px 0;border-bottom:1px solid var(--line)}.assembly-members .muted{font-size:11px;margin-top:10px}.owner-links{display:flex;gap:8px;flex-wrap:wrap;align-content:start}.owner-links a{font-family:Consolas,monospace;font-size:11px;text-decoration:none;border:1px solid var(--line);padding:6px 10px;background:var(--white)}.owner-links a:hover{border-color:var(--green)}.downloads{padding:29px 0 25px}.download-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}.download-links>a{border:1px solid #bdc9b5;padding:12px 15px;background:#ecf0e5;text-decoration:none;font-size:12px;min-width:145px}.download-links>a:hover{background:#dce6d4}.download-links span{display:block;font-size:9px;color:var(--muted);margin-top:4px}.download-note{font-size:11px;color:var(--muted);margin-top:17px;max-width:90ch;line-height:1.85}.trace{border-top:1px solid var(--line);font-size:11px}.trace summary{cursor:pointer;padding:16px 0;color:var(--green)}.trace dl{display:grid;grid-template-columns:1fr 1fr;gap:19px 25px;margin:8px 0 20px}.trace dd{font-family:Consolas,"Microsoft JhengHei",monospace;font-size:11px;overflow-wrap:anywhere}.trace p{font-size:11px;color:var(--muted);margin:15px 0}.digest{word-break:break-all}.detail-empty{padding:90px 20px;max-width:650px}.detail-empty p{font-size:14px;margin-top:15px;color:var(--muted)}.page-footer{font-size:11px;padding:28px max(3vw,20px);border-top:1px solid var(--line);color:var(--muted);background:var(--white);display:flex;gap:20px;justify-content:space-between}.page-footer a{white-space:nowrap}.noscript{padding:25px;background:var(--warm);font-size:14px}.noscript p{margin-top:12px}code{font-family:Consolas,monospace;overflow-wrap:anywhere}
@media(min-width:1600px){.workspace{grid-template-columns:380px minmax(0,1fr)}.selector{padding-left:30px;padding-right:30px}}@media(max-width:1200px){.workspace{grid-template-columns:300px minmax(0,1fr)}.selector{padding-left:15px;padding-right:15px}.detail{padding:29px 23px}.visuals{grid-template-columns:1fr}.visual-heading{min-height:0}.reference-panel{display:grid;grid-template-columns:1fr 1.2fr;gap:0 20px;padding:22px;background:#e8ebdf}.reference-panel .media{grid-column:2;grid-row:1/3}.reference-panel .visual-heading{align-self:start}.reference-panel .evidence-note{grid-column:1;align-self:end}.teaching-grid{grid-template-columns:1fr;gap:26px}.part-facts{grid-template-columns:1fr}.part-facts>div+div{border-left:0;border-top:1px solid var(--line);padding:15px 0 0}.detail-heading{flex-wrap:wrap;gap:10px}.status-tag{margin-top:0}.part-toolbar{gap:12px}.occurrence{margin-left:0;width:100%}.assembly-members{grid-template-columns:1fr;gap:18px}}@media(max-width:820px){.masthead{display:block}.masthead nav{justify-content:flex-start;margin:20px 0 0;max-width:none;gap:10px 24px}.catalog-stats{gap:15px}.catalog-stats .revision{margin-left:0}.workspace{display:block}.selector{position:static;max-height:none;padding:23px 20px;border-right:0;border-bottom:1px solid var(--line)}.selector .search-help{margin-bottom:12px}.list-scroll{max-height:340px;min-height:0}.selection-top a{font-size:12px}.detail{padding:30px 20px}.visuals{gap:26px}.reference-panel{grid-template-columns:1fr 1.4fr}.part-facts{grid-template-columns:1fr 1fr}.part-facts>div+div{border-top:0;border-left:1px solid var(--line);padding:0 0 0 20px}.part-facts .dimension{font-size:20px}.page-footer{display:block}.page-footer p+p{margin-top:10px}}@media(max-width:480px){.reference-panel{display:block;padding:19px}.reference-panel .media{margin-top:16px}.part-facts{display:block}.part-facts>div+div{border-left:0;border-top:1px solid var(--line);padding:15px 0 0;margin-top:15px}.trace dl{grid-template-columns:1fr}.download-links>a{min-width:calc(50% - 6px);flex:1}.stock-warning{font-size:12px}.catalog-stats{font-size:11px}.catalog-stats strong{font-size:18px}.unresolved{padding:19px}.part-toolbar{font-size:11px}.detail-heading .eyebrow span{display:block;margin-top:5px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{body{background:white;color:#111}.masthead{background:white;color:#111;padding:0 0 15px}.masthead .eyebrow{color:#555}.masthead nav,.selector,.part-toolbar,.download-links,.page-footer,.catalog-stats,.selection-top a{display:none}.workspace{display:block}.detail{padding:20px 0}.stock-warning{border:1px solid #aaa;background:white;padding:10px}.visuals{grid-template-columns:1.4fr 1fr;gap:15px}.reference-panel{display:block;padding:0;background:white}.media-link{max-height:70mm}.visual-panel,.teaching,.unresolved{break-inside:avoid}.teaching-grid{grid-template-columns:1fr 1fr}.part-facts{grid-template-columns:1fr 1fr}.trace{display:none}.detail-heading h2{font-size:24pt}.downloads{padding-bottom:0}.owner-links a{color:#111}.source-prose{font-size:10pt}.unresolved{background:#f5f2eb}a{color:inherit}}
`;

if (catalog) {
  if (!Array.isArray(catalog.components)) throw new Error('catalog.components 必須為陣列。');
  const ids = new Set();
  for (const component of catalog.components) {
    if (!component || typeof component.id !== 'string' || !/^FC-[A-Za-z0-9_-]+$/.test(component.id)) throw new Error('零件必須有有效的 FC- 件號。');
    if (ids.has(component.id)) throw new Error('重複件號：' + component.id);
    ids.add(component.id);
  }
  const payload = JSON.stringify({catalog,families:FACTORY_FAMILIES.map(({id,name}) => ({id,name}))}).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const html = `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="GT01 廠房零件倉庫：搜尋現有形體、四視圖、獨立參考、組裝教學與未完成項。"><meta name="color-scheme" content="light"><title>GT01｜廠房零件倉庫 · 形體與組裝閱讀</title><style>${css}</style></head><body><a class="skip-link" href="#part-details">跳至所選零件</a><header class="masthead"><div><p class="signature">יהוה</p><p class="eyebrow">GT01 ATELIER / COMPONENT WAREHOUSE</p><h1>廠房零件倉庫</h1></div><nav aria-label="專案導覽"><a href="../../GT01-atelier.html?mode=factory">互動工坊 ↗</a><a href="../../GT01-factory-guide.html">工廠操作指南</a><a href="../index.html">原生零件庫</a><a href="../../GT01-factory-reference-book.html">生成參考圖冊</a><a href="../../GT01-material-quality.html">材質施工課</a></nav></header><div class="catalog-stats"><span><strong id="total-count">—</strong>種現有形體</span><span><strong id="total-families">—</strong>個分類</span><span>尺寸單位：<span id="catalog-units">—</span></span><span class="revision" id="catalog-revision">讀取目錄</span></div><div class="stock-warning"><strong>現有形體已入庫，不代表製造細節全部完成。</strong><span>全部維持候選、未驗收。模型導出的四視圖不能自證原形正確；部分零件仍只有總景參考。</span></div>
${await physicalDecompositionSection()}
<noscript><div class="noscript"><strong>搜尋與選件需要啟用 JavaScript。</strong><p>本頁程式與目錄都已包含在檔案內，不需網路。也可直接下載<a href="catalog.json" download>完整目錄</a>與<a href="assembly.json" download>組裝關係</a>閱讀。</p></div></noscript>
<div class="workspace"><aside class="selector" aria-labelledby="selector-title"><div class="selection-top"><h2 id="selector-title">找到要讀的零件</h2><a href="#part-details">閱讀所選件 ↓</a></div><label class="field-label" for="search">名稱、件號、材質或總成</label><div class="search-wrap"><input id="search" type="search" placeholder="例如：桌板、FC-、玻璃" autocomplete="off" spellcheck="false"><button type="button" id="clear-search" aria-label="清除搜尋" hidden>×</button></div><p class="search-help">空格可組合關鍵字；清單每頁最多 30 件。</p><label class="field-label" for="family">依構件用途分類</label><select id="family"><option value="">全部分類</option></select><div class="list-summary"><span id="match-count" aria-live="polite">讀取目錄</span><span id="result-note"></span></div><div class="list-scroll" id="list-scroll"><ul class="component-list" id="component-list" aria-label="可選零件"></ul><div class="empty-search" id="no-matches" hidden><p>沒有符合的零件。<br>縮短關鍵字，或取消分類再找一次。</p><button type="button" id="reset-filters">清除搜尋與分類</button></div></div><nav class="pagination" aria-label="清單分頁"><button type="button" id="previous-page" disabled>← 上一頁</button><span id="page-info">—</span><button type="button" id="next-page" disabled>下一頁 →</button></nav></aside><main class="detail" id="part-details" aria-label="零件閱讀區"><p id="route-note" class="route-note" role="status" hidden></p><div id="detail-empty" class="detail-empty"><p class="eyebrow">由左側選一件，開始閱讀</p><h2>先辨認用途，<br>再看它如何接上其他零件。</h2><p>選件後會顯示四視圖、參考來源、尺寸與材質，以及組裝、檢查和未完成項。</p></div><div id="detail-content" hidden></div></main></div><footer class="page-footer"><p>GT01 · 現有形體閱讀介面<br>保留 factory 目錄與 outputs 中的 references、materials、quality 圖片，可在本機離線閱讀。</p><p><a href="catalog.json" download>下載完整目錄 ↓</a>　<a href="assembly.json" download>下載組裝關係 ↓</a></p></footer><script type="application/json" id="warehouse-data">${payload}</script><script>(${warehouseReader.toString()})();</script></body></html>`;
  await fs.writeFile(new URL('index.html', base), html, 'utf8');
  console.log(JSON.stringify({output:new URL('index.html',base).pathname,bytes:Buffer.byteLength(html),catalogRevision:catalog.revision??null,components:catalog.components.length,pageSize:30,externalRuntimeDependencies:false,qualification:'PROVISIONAL_NOT_QUALIFIED'}));
}
