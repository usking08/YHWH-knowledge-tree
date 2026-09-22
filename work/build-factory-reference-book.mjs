import fs from 'node:fs/promises';

const outputRoot = new URL('../outputs/', import.meta.url);
const sourcePath = new URL('source/factory-reference-book.json', outputRoot);
const book = JSON.parse(await fs.readFile(sourcePath, 'utf8'));
if (!Array.isArray(book.nodes)) throw new Error('factory-reference-book.json 必須提供 nodes 陣列。');
const ids = new Set();
for (const node of book.nodes) {
  if (!node || typeof node.id !== 'string' || !node.id) throw new Error('每個圖冊節點必須具有 id。');
  if (ids.has(node.id)) throw new Error('圖冊節點 id 重複：' + node.id);
  ids.add(node.id);
}

function referenceBookReader() {
  'use strict';
  const book = JSON.parse(document.getElementById('reference-book-data').textContent);
  const nodes = book.nodes, byId = new Map(nodes.map(node => [node.id,node]));
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const text = value => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(text).filter(Boolean).join('；');
    if (typeof value === 'object') return Object.entries(value).map(([key,item]) => key + '：' + text(item)).join('；');
    return String(value);
  };
  const items = value => value === undefined || value === null ? [] : Array.isArray(value) ? value : [value];
  const refs = node => items(node.images).map(item => typeof item === 'string' ? {file:item} : item).filter(item => item && typeof item.file === 'string');
  const actuals = node => items(node.actual?.images || node.actual).map(item => typeof item === 'string' ? {file:item,caption:'目前模型讀回圖'} : item).filter(item => item && typeof (item.file || item.url) === 'string').map(item => ({...item,file:item.file || item.url}));
  const children = new Map();
  for (const node of nodes) {
    const parent = byId.has(node.parent) && node.parent !== node.id ? node.parent : null;
    if (!children.has(parent)) children.set(parent,[]);
    children.get(parent).push(node);
  }
  let selected = null, imageIndex = 0, actualIndex = 0, annotationsVisible = true;
  let modalMedia = null, modalKind = 'reference', modalZoom = null, returnFocus = null;
  let searchTimer = null;
  const dialog = $('image-dialog');

  function localFile(value) {
    if (typeof value !== 'string') return null;
    const path = value.trim().replace(/\\/g,'/').replace(/^\.\//,'').replace(/^outputs\//,'');
    if (!path || path.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(path) || /[\u0000-\u001f]/.test(path) || path.split('/').some(segment => segment === '..')) return null;
    return path.split('/').map(encodeURIComponent).join('/');
  }
  function modelLink(node) {
    const value = typeof node.model === 'string' ? node.model : node.model?.url || node.model?.href;
    if (typeof value !== 'string' || !value.trim()) return null;
    const raw = value.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(raw) || /[\u0000-\u001f]/.test(raw)) return null;
    const split = raw.search(/[?#]/), pathname = split < 0 ? raw : raw.slice(0,split), tail = split < 0 ? '' : raw.slice(split);
    const normalized = localFile(pathname);
    return normalized ? normalized + tail : null;
  }
  function prose(value, fallback, ordered = false) {
    const values = items(value).map(text).filter(Boolean);
    if (!values.length) return '<p class="muted">' + esc(fallback) + '</p>';
    const tag = ordered ? 'ol' : 'ul';
    return '<' + tag + ' class="prose-list' + (ordered ? ' ordered' : '') + '">' + values.map(value => '<li>' + esc(value) + '</li>').join('') + '</' + tag + '>';
  }
  function annotationItems(image) {
    return items(image?.annotations).filter(item => item && typeof item === 'object').map((item,index) => {
      const rect = ['x','y','w','h'].map(key => item[key]);
      const valid = rect.every(value => typeof value === 'number' && Number.isFinite(value)) && item.x >= 0 && item.y >= 0 && item.w > 0 && item.h > 0 && item.x + item.w <= 1.000001 && item.y + item.h <= 1.000001;
      return {...item,number:index+1,valid};
    });
  }
  function overlay(image) {
    const annotations = annotationItems(image).filter(item => item.valid);
    if (!annotations.length) return '';
    return '<div class="annotation-overlay" aria-hidden="true"><svg viewBox="0 0 1000 1000" preserveAspectRatio="none">' + annotations.map(item => '<rect x="' + item.x*1000 + '" y="' + item.y*1000 + '" width="' + item.w*1000 + '" height="' + item.h*1000 + '" rx="5" fill="rgba(183,49,40,.04)" stroke="#bd392e" stroke-width="2.5" vector-effect="non-scaling-stroke"/>').join('') + '</svg>' + annotations.map(item => '<span class="annotation-marker" style="left:' + item.x*100 + '%;top:' + item.y*100 + '%">' + item.number + '</span>').join('') + '</div>';
  }
  function annotationNotes(image, compact = false) {
    const annotations = annotationItems(image);
    if (!annotations.length) return '';
    return '<ol class="annotation-notes' + (compact ? ' compact' : '') + '">' + annotations.map(item => '<li><span class="note-number">' + item.number + '</span><div><strong>' + esc(item.label || '圈註 ' + item.number) + '</strong>' + (item.note ? '<p>' + esc(text(item.note)) + '</p>' : '') + (!item.valid ? '<p class="position-missing">來源未提供可用的 0–1 比例座標，暫不疊加此標註。</p>' : '') + '</div></li>').join('') + '</ol>';
  }
  function imageMarkup(image, action, alt, printable = false) {
    const file = localFile(image?.file);
    if (!file) return '<div class="image-error"><strong>圖片路徑尚未就緒</strong><p>請由內容主責補齊此節點的圖片來源。</p></div>';
    const imageBody = '<img src="' + esc(file) + '" alt="' + esc(alt || image.caption || image.file) + '" decoding="async">' + overlay(image);
    return '<div class="media-shell">' + (printable ? '<div class="image-frame">' + imageBody + '</div>' : '<button type="button" class="image-frame image-open" data-action="' + action + '" aria-label="放大原圖：' + esc(alt || image.caption || image.file) + '">' + imageBody + '<span class="zoom-hint">放大原圖 ↗</span></button>') + '<div class="image-error" hidden><strong>圖片尚未就緒</strong><p>請確認已保存圖冊引用的原始圖片檔案。</p><a href="' + esc(file) + '" target="_blank" rel="noopener">查看圖片路徑 ↗</a></div></div>';
  }
  function wireImageErrors(container) {
    container.querySelectorAll('.media-shell img').forEach(img => {
      const fail = () => {
        const shell = img.closest('.media-shell');
        shell.querySelector('.image-frame').hidden = true;
        shell.querySelector('.image-error').hidden = false;
      };
      img.addEventListener('error',fail,{once:true});
      if (img.complete && img.naturalWidth === 0) fail();
    });
  }
  function coverage(node) {
    const count = refs(node).length;
    return count ? count + ' 張參考' : '尚缺本件圖';
  }
  function ancestors(node) {
    const chain = [], seen = new Set([node.id]);
    let parent = byId.get(node.parent);
    while (parent && !seen.has(parent.id)) {
      chain.unshift(parent); seen.add(parent.id); parent = byId.get(parent.parent);
    }
    return chain;
  }
  function renderTree() {
    const query = $('tree-search').value.normalize('NFKC').toLocaleLowerCase('zh-TW').trim();
    const terms = query.split(/\s+/).filter(Boolean), matches = new Set(), visible = new Set();
    for (const node of nodes) {
      const haystack = [node.id,node.title,node.group,text(node.purpose),text(node.missing),text(node.steps)].join(' ').normalize('NFKC').toLocaleLowerCase('zh-TW');
      if (!terms.length || terms.every(term => haystack.includes(term))) {
        matches.add(node.id); visible.add(node.id); ancestors(node).forEach(parent => visible.add(parent.id));
      }
    }
    $('tree-result').textContent = query ? matches.size + ' 個符合節點' : nodes.length + ' 個圖冊節點';
    $('clear-search').hidden = !query;
    const visited = new Set();
    function branch(list) {
      return '<ul>' + list.filter(node => visible.has(node.id) && !visited.has(node.id)).map(node => {
        if (visited.has(node.id)) return '';
        visited.add(node.id);
        const hasImage = refs(node).length > 0, kids = (children.get(node.id) || []).filter(child => !visited.has(child.id));
        return '<li><button type="button" data-node="' + esc(node.id) + '" class="tree-node' + (selected?.id === node.id ? ' selected' : '') + (query && !matches.has(node.id) ? ' ancestor-only' : '') + '" aria-current="' + (selected?.id === node.id ? 'true' : 'false') + '"><span class="tree-title">' + esc(node.title || node.id) + '</span><span class="tree-meta"><span>' + esc(node.id) + '</span><span class="' + (hasImage ? 'has-reference' : 'missing-reference') + '">' + (hasImage ? refs(node).length + ' 圖' : '缺圖') + '</span></span></button>' + (kids.length ? branch(kids) : '') + '</li>';
      }).join('') + '</ul>';
    }
    let html = branch(children.get(null) || []);
    const unattached = nodes.filter(node => visible.has(node.id) && !visited.has(node.id));
    if (unattached.length) html += branch(unattached);
    $('tree').innerHTML = html;
    $('tree-empty').hidden = matches.size > 0;
  }
  function imageButtons(images) {
    return images.length > 1 ? '<nav class="image-sequence" aria-label="同一節點的參考圖片">' + images.map((image,index) => '<button type="button" data-reference-index="' + index + '" aria-current="' + (index === imageIndex ? 'true' : 'false') + '"><span>' + String(index+1).padStart(2,'0') + '</span>' + esc(image.caption || '參考圖 ' + (index+1)) + '</button>').join('') + '</nav>' : '';
  }
  function updateLocation() {
    if (!selected) return;
    try {
      const url = new URL(location.href);
      url.hash = encodeURIComponent(selected.id) + (imageIndex ? '/image/' + (imageIndex+1) : '');
      history.replaceState(null,'',url);
    } catch { /* Hash restrictions must not block local reading. */ }
  }
  function renderNode() {
    if (!selected) {
      $('reading').innerHTML = '<section class="empty-book"><h2>圖冊節點尚未建立</h2><p>目前來源沒有可供閱讀的節點，未以範例圖填補。</p></section>';
      return;
    }
    const node = selected, images = refs(node), reads = actuals(node), model = modelLink(node);
    imageIndex = Math.max(0,Math.min(imageIndex,images.length-1));
    actualIndex = Math.max(0,Math.min(actualIndex,reads.length-1));
    const image = images[imageIndex], actual = reads[actualIndex], parentChain = ancestors(node), descendants = children.get(node.id) || [];
    const notes = annotationItems(image), markerControl = '<label class="annotation-control"><input type="checkbox" data-action="annotations" ' + (annotationsVisible ? 'checked ' : '') + (!notes.length ? 'disabled ' : '') + '>顯示圈註' + (!notes.length ? '<span>此圖無圈註</span>' : '') + '</label>';
    const sourceFigure = image ? '<section class="reference-stage"><div class="stage-heading"><span class="source-kind">' + esc(image.role || '生成參考') + '</span><h3>' + esc(image.caption || '本節點參考圖') + '</h3></div>' + imageMarkup(image,'open-reference',node.title + '；' + (image.caption || '生成參考')) + '<p class="image-caption">' + esc(image.role || '生成參考圖') + ' · ' + (imageIndex+1) + ' / ' + images.length + '<a href="' + esc(localFile(image.file) || '#') + '" target="_blank" rel="noopener">開啟未加圈註的原圖 ↗</a></p></section>' : '<section class="reference-missing"><p class="eyebrow">本節點參考仍待補齊</p><h3>尚未完成本件參考圖。</h3><p>這裡保留本件缺圖狀態。請依用途、接合部位與未完成項補入對應圖像，再進行逐件比較。</p><p class="missing-id">' + esc(node.id) + ' ／ ' + esc(node.title) + '</p></section>';
    const actualFigure = actual ? '<section class="actual-stage"><div class="stage-heading"><span class="source-kind actual-kind">模型讀回</span><h3>' + esc(actual.caption || '現有模型的實際畫面') + '</h3></div>' + imageMarkup(actual,'open-actual',node.title + '；現有模型讀回圖') + '<p class="image-caption">現有模型讀回 · ' + (actualIndex+1) + ' / ' + reads.length + '</p>' + (reads.length > 1 ? '<div class="actual-navigation"><button type="button" data-action="actual-previous" ' + (actualIndex===0?'disabled':'') + '>← 前一張讀回</button><button type="button" data-action="actual-next" ' + (actualIndex===reads.length-1?'disabled':'') + '>下一張讀回 →</button></div>' : '') + '<p class="actual-explanation">此圖記錄目前模型與該次視角；它不會自動繼承生成參考中的細節或資格。</p></section>' : '';
    $('reading').innerHTML = '<nav class="breadcrumb" aria-label="圖冊所在位置">' + parentChain.map(parent => '<button type="button" data-node="' + esc(parent.id) + '">' + esc(parent.title) + '</button><span aria-hidden="true">／</span>').join('') + '<span>' + esc(node.title || node.id) + '</span></nav>' +
      '<header class="node-header"><div><p class="eyebrow">' + esc(node.group || '圖冊節點') + ' ／ <span class="node-id">' + esc(node.id) + '</span></p><h2 id="node-title" tabindex="-1">' + esc(node.title || node.id) + '</h2>' + (node.purpose ? '<p class="purpose">' + esc(text(node.purpose)) + '</p>' : '') + '</div><span class="coverage-badge">' + esc(coverage(node)) + '</span></header>' +
      '<div class="node-toolbar">' + (model ? '<a class="model-link" href="' + esc(model) + '">在模型中觀看 ↗</a>' : '<span class="model-missing">此節點尚未指定模型入口</span>') + '<a href="parts-library/factory/index.html">前往廠房零件倉庫 →</a><button type="button" data-action="print" class="text-button">列印本節點</button></div>' +
      '<div class="coverage-note">生成參考與回裝驗證分開記錄。' + (node.childrenComplete === true ? '來源標示子節點參考已補齊；實作與驗收仍需另讀證據。' : '子節點參考仍未全部補齊。') + '</div>' +
      imageButtons(images) + '<div class="reader-controls">' + markerControl + (images.length > 1 ? '<div class="reference-pager"><button type="button" data-action="reference-previous" aria-label="前一張生成參考" ' + (imageIndex===0?'disabled':'') + '>←</button><span>' + (imageIndex+1) + ' / ' + images.length + '</span><button type="button" data-action="reference-next" aria-label="下一張生成參考" ' + (imageIndex===images.length-1?'disabled':'') + '>→</button></div>' : '') + '</div>' +
      '<div class="visual-comparison' + (actual ? ' has-actual' : '') + '">' + sourceFigure + actualFigure + '</div>' +
      (!actual ? '<p class="readback-missing"><strong>本件模型讀回圖尚未提供。</strong>目前不能在圖冊中做同件畫面對照。</p>' : '') +
      (notes.length ? '<section class="annotation-section" aria-label="目前參考圖的圈註說明"><div class="section-label"><span class="red-rule"></span><h3>沿著圈註看問題</h3><p>圈框是可關閉的閱讀層，原圖保持不變。</p></div>' + annotationNotes(image) + '</section>' : '') +
      (image ? '<div class="source-reading"><section><p class="eyebrow">這張圖用在哪裡</p><h3>目前採用範圍</h3><p class="source-prose">' + esc(text(image.adoptedScope) || '來源尚未指定採用範圍；不能把整張圖視為已採納。') + '</p></section><section><p class="eyebrow">來源留下的判讀</p><h3>圖像檢視紀錄</h3>' + prose(image.inspection,'尚未附具體檢視紀錄；不視為已通過。') + '</section></div>' : '') +
      '<section class="assembly-teaching"><p class="eyebrow">讓圖像接回組裝關係</p><h3>組裝教學</h3>' + prose(node.steps,'此節點尚未提供組裝步驟；裝入方向、接合順序與工具空間仍待具體化。',true) + '<p class="teaching-boundary">這些步驟說明施工順序；模型的最終位置、生成爆炸圖與動作示意，仍需各自確認接觸和裝入路徑。</p></section>' +
      '<section class="missing-work"><p class="eyebrow">保留未完成處</p><h3>接下來需要補齊</h3>' + prose(node.missing,'來源尚未列出具體缺項；空白清單不表示已全部完成。') + '</section>' +
      (descendants.length ? '<section class="child-nodes"><div><p class="eyebrow">往下讀到真正的部件</p><h3>子總成與零件</h3></div><ul>' + descendants.map(child => '<li><button type="button" data-node="' + esc(child.id) + '"><span>' + esc(child.title || child.id) + '</span><small>' + esc(coverage(child)) + ' ↗</small></button></li>').join('') + '</ul></section>' : '') +
      '<details class="source-record"><summary>來源身分與目前資格標記</summary><dl><div><dt>節點</dt><dd>' + esc(node.id) + '</dd></div><div><dt>上層節點</dt><dd>' + esc(node.parent || '根節點') + '</dd></div><div><dt>來源資格標記</dt><dd>' + esc(text(node.qualification) || '未提供') + '</dd></div><div><dt>子節點參考狀態</dt><dd>' + (node.childrenComplete === true ? '來源標示已補齊' : '尚未全部補齊') + '</dd></div></dl><p>以上標記來自圖冊來源資料，不能替代獨立參考、模型讀回或實體驗收。<a href="source/factory-reference-book.json">讀取圖冊來源資料 ↗</a></p></details>' +
      '<section class="print-gallery" aria-label="列印用完整圖片">' + images.map((entry,index) => '<figure><figcaption>生成參考 ' + (index+1) + ' / ' + images.length + ' · ' + esc(entry.caption || node.title) + '</figcaption>' + imageMarkup(entry,'',entry.caption || node.title,true) + annotationNotes(entry,true) + '<p>採用範圍：' + esc(text(entry.adoptedScope) || '尚未指定') + '</p></figure>').join('') + reads.map((entry,index) => '<figure><figcaption>現有模型讀回 ' + (index+1) + ' / ' + reads.length + '</figcaption>' + imageMarkup(entry,'',entry.caption || '模型讀回',true) + '</figure>').join('') + '</section>';
    wireImageErrors($('reading'));
    $('reading').querySelector('.assembly-teaching').before($('reading').querySelector('.print-gallery'));
    $('reading').classList.toggle('hide-annotations',!annotationsVisible);
  }
  function selectNode(id, index = 0, writeHash = true) {
    const node = byId.get(id);
    if (!node) return false;
    selected = node; imageIndex = index; actualIndex = 0;
    renderNode(); renderTree();
    if (writeHash) {$('route-note').hidden=true;updateLocation();}
    return true;
  }
  function changeReference(index) {
    if (!selected || !refs(selected).length) return;
    imageIndex = Math.max(0,Math.min(index,refs(selected).length-1));
    renderNode(); updateLocation();
    if (dialog.open && modalKind === 'reference') setModalMedia(refs(selected)[imageIndex],'reference');
  }
  function changeActual(index) {
    if (!selected || !actuals(selected).length) return;
    actualIndex = Math.max(0,Math.min(index,actuals(selected).length-1));
    renderNode();
    if (dialog.open && modalKind === 'actual') setModalMedia(actuals(selected)[actualIndex],'actual');
  }
  function fitModal() {
    const img = $('modal-image-area').querySelector('img'), frame = $('modal-image-area').querySelector('.modal-frame'), viewport = $('modal-viewport');
    if (!img || !frame || !img.naturalWidth) return;
    const availableW = Math.max(100,viewport.clientWidth-36), availableH = Math.max(100,viewport.clientHeight-36);
    const fitScale = Math.min(1,availableW/img.naturalWidth,availableH/img.naturalHeight);
    const scale = modalZoom === null ? fitScale : modalZoom;
    frame.style.width = Math.round(img.naturalWidth*scale) + 'px';
    $('zoom-value').textContent = Math.round(scale*100) + '%' + (modalZoom === null ? ' · 適合畫面' : '');
    if(modalZoom===null){viewport.scrollLeft=0;viewport.scrollTop=0;}
  }
  function setModalMedia(image, kind) {
    modalMedia = image; modalKind = kind; modalZoom = null;
    const file = localFile(image?.file);
    $('modal-title').textContent = image?.caption || selected?.title || '原始圖片';
    $('modal-kind').textContent = kind === 'actual' ? '現有模型讀回' : (image?.role || '生成參考');
    $('modal-original').hidden = !file;
    if (file) $('modal-original').href = file;
    $('modal-image-area').innerHTML = file ? '<div class="modal-frame image-frame"><img src="' + esc(file) + '" alt="' + esc(image?.caption || selected?.title || '原始圖片') + '">' + overlay(image) + '</div>' : '<p class="modal-error">圖片路徑尚未就緒。</p>';
    $('modal-annotation-notes').innerHTML = annotationNotes(image,true);
    $('modal-annotations').checked = annotationsVisible;
    $('modal-annotations').disabled = annotationItems(image).length === 0;
    dialog.classList.toggle('hide-annotations',!annotationsVisible);
    const collection = kind === 'actual' ? actuals(selected) : refs(selected), index = kind === 'actual' ? actualIndex : imageIndex;
    $('modal-sequence').textContent = (index+1) + ' / ' + collection.length;
    $('modal-previous').disabled = index <= 0;
    $('modal-next').disabled = index >= collection.length-1;
    const img = $('modal-image-area').querySelector('img');
    if (img) {
      img.addEventListener('load',fitModal,{once:true});
      img.addEventListener('error',() => {$('modal-image-area').innerHTML='<p class="modal-error">圖片尚未就緒，請確認相對目錄內的原始檔案。</p>';},{once:true});
      if (img.complete && img.naturalWidth) fitModal();
    }
  }
  function openModal(kind) {
    const image = kind === 'actual' ? actuals(selected)[actualIndex] : refs(selected)[imageIndex];
    if (!image) return;
    returnFocus = document.activeElement;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    setModalMedia(image,kind);
    $('modal-close').focus();
  }
  function zoomBy(factor) {
    const img = $('modal-image-area').querySelector('img');
    if (!img?.naturalWidth) return;
    const current = modalZoom ?? img.getBoundingClientRect().width/img.naturalWidth;
    modalZoom = Math.min(4,Math.max(.1,current*factor));
    fitModal();
  }
  function setAnnotations(value) {
    annotationsVisible = value;
    $('reading').classList.toggle('hide-annotations',!value);
    dialog.classList.toggle('hide-annotations',!value);
    const checkbox = $('reading').querySelector('[data-action="annotations"]');
    if (checkbox) checkbox.checked=value;
    $('modal-annotations').checked=value;
  }
  $('reading').addEventListener('click', event => {
    const nodeButton = event.target.closest('[data-node]');
    if (nodeButton) {selectNode(nodeButton.dataset.node);$('node-title')?.focus({preventScroll:true});return;}
    const sequenceButton = event.target.closest('[data-reference-index]');
    if (sequenceButton) {changeReference(Number(sequenceButton.dataset.referenceIndex));return;}
    const control = event.target.closest('[data-action]');
    if (!control) return;
    switch(control.dataset.action) {
      case 'open-reference': openModal('reference');break;
      case 'open-actual': openModal('actual');break;
      case 'reference-previous': changeReference(imageIndex-1);break;
      case 'reference-next': changeReference(imageIndex+1);break;
      case 'actual-previous': changeActual(actualIndex-1);break;
      case 'actual-next': changeActual(actualIndex+1);break;
      case 'print': window.print();break;
    }
  });
  $('reading').addEventListener('change',event => {
    if (event.target.matches('[data-action="annotations"]')) setAnnotations(event.target.checked);
  });
  $('tree').addEventListener('click', event => {
    const button = event.target.closest('[data-node]');
    if (!button) return;
    const id = button.dataset.node, focused = document.activeElement === button;
    selectNode(id);
    if (focused) [...$('tree').querySelectorAll('[data-node]')].find(item => item.dataset.node === id)?.focus({preventScroll:true});
    if (window.matchMedia('(max-width: 820px)').matches) $('reading').scrollIntoView();
  });
  $('tree-search').addEventListener('input',event => {
    if(event.isComposing) return;
    clearTimeout(searchTimer);searchTimer=setTimeout(renderTree,100);
  });
  $('tree-search').addEventListener('compositionend',() => {clearTimeout(searchTimer);renderTree();});
  $('clear-search').addEventListener('click',() => {clearTimeout(searchTimer);$('tree-search').value='';renderTree();$('tree-search').focus();});
  $('tree-toggle').addEventListener('click',()=>{const el=document.querySelector('.sidebar'),open=el.classList.toggle('tree-expanded');$('tree-toggle').setAttribute('aria-expanded',String(open));$('tree-toggle').textContent=open?'收起零件樹':'展開零件樹';});
  $('tree-search').addEventListener('input',()=>{document.querySelector('.sidebar').classList.add('tree-expanded');$('tree-toggle').setAttribute('aria-expanded','true');$('tree-toggle').textContent='收起零件樹';});
  $('tree').addEventListener('click',e=>{if(e.target.closest('[data-node]')&&matchMedia('(max-width:820px)').matches){document.querySelector('.sidebar').classList.remove('tree-expanded');$('tree-toggle').setAttribute('aria-expanded','false');$('tree-toggle').textContent='展開零件樹';}});
  $('modal-close').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => {
    document.body.classList.remove('modal-open');
    $('modal-image-area').innerHTML='';modalMedia=null;
    if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
    else $('node-title')?.focus({preventScroll:true});
  });
  dialog.addEventListener('click',event => {if(event.target===dialog) dialog.close();});
  $('modal-fit').addEventListener('click',() => {modalZoom=null;fitModal();});
  $('modal-one').addEventListener('click',() => {modalZoom=1;fitModal();});
  $('modal-plus').addEventListener('click',() => zoomBy(1.5));
  $('modal-minus').addEventListener('click',() => zoomBy(1/1.5));
  $('modal-annotations').addEventListener('change',event => setAnnotations(event.target.checked));
  function modalNext(delta) {if(modalKind==='reference')changeReference(imageIndex+delta);else changeActual(actualIndex+delta);}
  $('modal-previous').addEventListener('click',() => modalNext(-1));
  $('modal-next').addEventListener('click',() => modalNext(1));
  dialog.addEventListener('keydown',event => {
    if(event.target.matches('input,textarea,select')) return;
    if(event.key==='ArrowLeft'){event.preventDefault();modalNext(-1);}
    if(event.key==='ArrowRight'){event.preventDefault();modalNext(1);}
  });
  window.addEventListener('resize',() => {if(dialog.open)fitModal();});
  function route() {
    const [encoded,index] = location.hash.slice(1).split('/image/');
    if(encoded==='reading') return;
    let id='';try{id=decodeURIComponent(encoded);}catch{}
    const image = Number(index), position = Number.isInteger(image)&&image>0?image-1:0;
    if(id && byId.has(id)){$('route-note').hidden=true;selectNode(id,position,false);return;}
    if(id){$('route-note').hidden=false;$('route-note').textContent='此版圖冊找不到節點「'+id+'」。請由左側樹狀目錄選取。';}
    else $('route-note').hidden=true;
    if(!selected&&nodes.length)selectNode(nodes[0].id,0,false);
    else if(!selected)renderNode();
  }
  window.addEventListener('hashchange',route);
  $('book-title').textContent = book.title || '全廠參考圖冊';
  $('book-revision').textContent = text(book.revision) || '版次未提供';
  $('book-updated').textContent = text(book.updated) || '更新時間未提供';
  $('whole-status').textContent = book.wholeAccepted === false ? '整廠尚未驗收 · 逐件補圖與回裝' : '整體資格依來源記錄另行判讀';
  route();renderTree();
}

const css = `
:root{--ink:#233d31;--muted:#657267;--green:#214c3a;--line:#cdd4c6;--paper:#f2f0e8;--white:#fefcf6;--pale:#e5ecdf;--amber:#78572e;--warm:#f1e6d3;--red:#b9362d;font-synthesis:none;color-scheme:light}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:var(--paper);color:var(--ink);font-family:"Segoe UI","Microsoft JhengHei","PingFang TC",sans-serif;line-height:1.75}body.modal-open{overflow:hidden}a{color:var(--green);text-underline-offset:4px}button,input{font:inherit}button{cursor:pointer}button:disabled{cursor:default;opacity:.42}button,a,input,summary{-webkit-tap-highlight-color:transparent}a:focus-visible,button:focus-visible,input:focus-visible,summary:focus-visible{outline:3px solid #a87338;outline-offset:4px}h1,h2,h3,p{margin:0}h1,h2,h3{line-height:1.4}h1,h2{font-family:Georgia,"Noto Serif TC","PMingLiU",serif;font-weight:500}h1{font-size:clamp(28px,3.1vw,44px);letter-spacing:.025em}h2{font-size:clamp(29px,3vw,43px)}h3{font-size:20px;font-weight:550}p+p{margin-top:13px}[hidden]{display:none!important}.muted{color:var(--muted)}.eyebrow{font-size:10px;letter-spacing:.12em;color:var(--muted);margin-bottom:8px}.signature{font-family:Georgia,serif;font-size:15px;line-height:1.3;margin-bottom:10px}.skip-link{position:fixed;left:18px;top:-80px;z-index:10;background:var(--white);padding:12px}.skip-link:focus{top:18px}.masthead{padding:24px max(3vw,20px) 25px;display:flex;gap:30px;align-items:center;border-bottom:1px solid var(--line);background:var(--white)}.masthead .eyebrow{margin-bottom:5px}.masthead nav{display:flex;gap:12px 26px;flex-wrap:wrap;justify-content:flex-end;margin-left:auto;max-width:600px;font-size:12px}.masthead nav a{text-decoration:none;border-bottom:1px solid #b1beaa;padding:5px 0}.masthead nav a:hover{border-color:var(--green)}.edition{padding:12px max(3vw,20px);background:#1b402f;color:#e5ecdf;display:flex;gap:15px 27px;flex-wrap:wrap;font-size:11px}.edition .whole-status{margin-left:auto;color:#ead6b3}.edition code{font-family:Consolas,monospace}.book-layout{max-width:2100px;margin:0 auto;display:grid;grid-template-columns:275px minmax(0,1fr)}.sidebar{background:#e8ece1;border-right:1px solid var(--line);padding:25px 16px 25px 21px;position:sticky;top:0;align-self:start;max-height:100vh;display:flex;flex-direction:column}.sidebar-title{font-size:13px;font-weight:600;margin-bottom:14px}.search-label{font-size:10px;color:var(--muted);display:block;margin-bottom:5px}.search-box{position:relative}.search-box input{width:100%;min-height:42px;padding:10px 37px 10px 11px;border:1px solid #aebbab;background:var(--white);font-size:12px;color:var(--ink);border-radius:0}.search-box button{position:absolute;right:3px;top:3px;bottom:3px;width:30px;border:0;background:transparent;color:var(--green);font-size:19px}.tree-count{font-size:10px;color:var(--muted);margin:11px 0}.tree-scroll{min-height:100px;overflow:auto;max-height:calc(100vh - 210px);overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#aab9a3 transparent}.tree ul{padding:0;margin:0;list-style:none}.tree ul ul{margin:2px 0 5px 9px;padding-left:11px;border-left:1px solid #bdcab6}.tree li+li{margin-top:3px}.tree-node{padding:10px 9px;width:100%;text-align:left;border:0;border-left:3px solid transparent;background:transparent;color:var(--ink);border-radius:0}.tree-node:hover{background:#f5f7ee}.tree-node.selected{background:var(--white);border-left-color:var(--green)}.tree-node.ancestor-only{opacity:.6}.tree-title{display:block;font-size:12px;line-height:1.6}.tree-meta{display:flex;justify-content:space-between;gap:8px;margin-top:4px;font-size:9px;color:var(--muted)}.tree-meta>span:first-child{font-family:Consolas,monospace}.has-reference{color:#63735d}.missing-reference{color:#8a633a}.tree-empty{font-size:12px;color:var(--muted);padding:25px 8px}.sidebar-footnote{font-size:10px;color:var(--muted);border-top:1px solid var(--line);padding-top:12px;margin-top:15px;line-height:1.7}.content{min-width:0;padding:30px clamp(20px,3vw,52px) 45px}.route-note{background:var(--warm);padding:13px 17px;font-size:12px;margin-bottom:18px;color:#76572f;overflow-wrap:anywhere}.breadcrumb{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:23px;font-size:10px;color:var(--muted)}.breadcrumb button{padding:0;border:0;border-bottom:1px solid #b9c4b2;background:transparent;color:var(--muted);font-size:10px}.node-header{display:flex;justify-content:space-between;gap:25px;align-items:start}.node-id{font-family:Consolas,monospace}.purpose{font-size:14px;color:var(--muted);max-width:70ch;margin-top:14px;white-space:pre-line}.coverage-badge{font-size:10px;color:#7b5e36;border:1px solid #c9b895;white-space:nowrap;padding:5px 10px;margin-top:5px}.node-toolbar{display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin:24px 0 16px;font-size:12px}.model-link{padding:9px 15px;background:var(--green);color:#fff;text-decoration:none}.model-link:hover{background:#345f47}.model-missing{font-size:11px;color:var(--muted)}.text-button{border:0;border-bottom:1px solid #aab9a2;padding:4px 0;background:transparent;color:var(--green);font-size:12px}.node-toolbar .text-button{margin-left:auto}.coverage-note{font-size:11px;color:#78603e;padding:12px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.image-sequence{display:flex;overflow:auto;gap:6px;margin:22px 0 0;border-bottom:1px solid var(--line);padding-bottom:10px;scrollbar-width:thin}.image-sequence button{display:flex;gap:9px;align-items:baseline;text-align:left;max-width:330px;min-width:190px;flex:0 0 auto;border:0;background:transparent;color:var(--muted);padding:10px 12px;font-size:11px;line-height:1.65}.image-sequence button span{font-family:Georgia,serif;font-size:17px;color:#8a673c}.image-sequence button[aria-current=true]{background:var(--pale);color:var(--green)}.image-sequence button:hover{background:#e8ede0}.reader-controls{display:flex;justify-content:space-between;align-items:center;gap:20px;margin:19px 0 14px;font-size:11px;min-height:34px}.annotation-control{display:flex;gap:7px;align-items:center;cursor:pointer}.annotation-control input{accent-color:var(--red);width:15px;height:15px}.annotation-control span{color:var(--muted);font-size:10px;margin-left:5px}.reference-pager{display:flex;align-items:center;gap:15px;font-size:11px}.reference-pager button{border:1px solid #b4c1ab;background:var(--white);color:var(--green);width:36px;height:34px}.visual-comparison{display:block}.visual-comparison.has-actual{display:grid;grid-template-columns:minmax(0,1.52fr) minmax(0,1fr);gap:25px;align-items:start}.stage-heading{display:flex;gap:10px;align-items:baseline;margin-bottom:11px;flex-wrap:wrap;min-height:29px}.stage-heading h3{font-size:13px;line-height:1.6;flex:1;min-width:150px}.source-kind{font-size:9px;color:#8b622c;border:1px solid #ccb58d;padding:3px 8px;white-space:nowrap}.actual-kind{color:#406348;border-color:#a9bda1}.media-shell{min-width:0}.image-frame{position:relative;padding:0;border:0;background:#e4e6db;display:block;width:100%;margin:0}.image-frame img{display:block;width:100%;height:auto}.image-open{cursor:zoom-in}.image-open:hover .zoom-hint{background:var(--green);color:white}.zoom-hint{position:absolute;right:10px;bottom:10px;background:rgba(251,251,242,.93);color:var(--green);padding:5px 9px;font-size:10px;box-shadow:0 1px 4px #0001}.annotation-overlay{position:absolute;inset:0;pointer-events:none}.annotation-overlay svg{position:absolute;width:100%;height:100%;left:0;top:0;overflow:visible}.annotation-marker{position:absolute;width:22px;height:22px;display:grid;place-items:center;transform:translate(-5%,-5%);border:1px solid var(--red);border-radius:50%;color:var(--red);background:#fffaf1;font:600 11px/1 "Segoe UI",sans-serif;box-shadow:0 1px 3px #0002}.hide-annotations .annotation-overlay{display:none}.image-caption{font-size:10px;color:var(--muted);margin-top:10px;line-height:1.8;display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap}.image-caption a{font-size:10px}.actual-explanation{font-size:11px;color:var(--muted);margin-top:14px;border-top:1px solid var(--line);padding-top:11px;line-height:1.85}.actual-navigation{display:flex;justify-content:space-between;gap:12px;margin-top:12px}.actual-navigation button{font-size:10px;color:var(--green);padding:5px 0;border:0;border-bottom:1px solid #b0c0a8;background:transparent}.reference-missing{background:#e7ebdf;border-top:2px solid #99ab8d;padding:45px 35px;min-height:260px;display:flex;flex-direction:column;justify-content:center}.reference-missing h3{font-family:Georgia,"PMingLiU",serif;font-size:29px;font-weight:400;margin-bottom:17px}.reference-missing p{font-size:13px;max-width:58ch;color:var(--muted)}.reference-missing .eyebrow{font-size:10px;margin-bottom:10px}.reference-missing .missing-id{font-family:Consolas,"Microsoft JhengHei",monospace;font-size:10px;margin-top:24px}.readback-missing{padding:14px 17px;border-left:2px solid #b7c4ab;background:#e9ede2;font-size:11px;color:var(--muted);margin-top:20px}.readback-missing strong{font-weight:550;color:#56634e}.image-error{background:#e9e8dc;padding:45px 25px;text-align:center;font-size:12px;min-height:180px;display:flex;align-items:center;justify-content:center;flex-direction:column;border:1px dashed #bbc2b2;color:var(--muted)}.image-error p{margin:10px 0;font-size:11px}.annotation-section{padding:24px 0 6px}.section-label{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}.section-label h3{font-size:16px;color:#824033}.section-label p{font-size:10px;color:var(--muted)}.red-rule{width:19px;height:2px;background:var(--red);align-self:center}.annotation-notes{list-style:none;margin:15px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:17px 26px}.annotation-notes li{display:flex;gap:11px;font-size:12px;line-height:1.85}.note-number{min-width:22px;width:22px;height:22px;border:1px solid var(--red);border-radius:50%;font-size:10px;display:grid;place-items:center;color:var(--red);margin-top:2px}.annotation-notes strong{font-weight:600;color:#8d4035;font-size:12px}.annotation-notes p{font-size:12px;color:#685f52;margin-top:4px;white-space:pre-line}.annotation-notes .position-missing{font-size:10px;color:var(--muted)}.source-reading{display:grid;grid-template-columns:1fr 1fr;gap:35px;border-top:1px solid var(--line);padding:25px 0;margin-top:29px}.source-reading h3{font-size:18px;margin-bottom:12px}.source-reading p,.source-reading li{font-size:13px}.source-prose{font-size:14px;line-height:1.9;white-space:pre-line}.prose-list{padding:0 0 0 20px;margin:10px 0 0;font-size:13px;line-height:1.95}.prose-list li{white-space:pre-line;overflow-wrap:anywhere}.prose-list li+li{margin-top:8px}.source-reading .muted{font-size:12px}.assembly-teaching{padding:25px 0 28px;border-top:1px solid var(--line)}.assembly-teaching h3{font-size:24px;margin-bottom:15px}.ordered{counter-reset:step;list-style:none;padding-left:0;display:grid;grid-template-columns:1fr 1fr;gap:13px 35px}.ordered li{counter-increment:step;position:relative;padding:3px 0 3px 34px;margin:0!important;font-size:14px}.ordered li:before{content:counter(step,decimal-leading-zero);position:absolute;left:0;top:3px;font-family:Georgia,serif;color:#8a6b42;font-size:18px}.teaching-boundary{font-size:11px;color:var(--muted);margin-top:24px;max-width:100ch}.missing-work{background:var(--warm);border-left:3px solid #a77b42;padding:24px 27px;margin:0 0 30px}.missing-work .eyebrow{color:#896437}.missing-work h3{font-size:22px;margin-bottom:12px}.missing-work .muted{font-size:12px}.child-nodes{padding:0 0 26px;border-bottom:1px solid var(--line);display:grid;grid-template-columns:.65fr 1.35fr;gap:35px}.child-nodes h3{font-size:20px}.child-nodes ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:0 22px}.child-nodes button{display:flex;justify-content:space-between;align-items:center;gap:15px;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--line);padding:11px 0;font-size:12px;color:var(--ink);width:100%}.child-nodes button:hover{color:var(--green);background:#e6eddd}.child-nodes small{font-size:9px;color:var(--muted);white-space:nowrap}.source-record{font-size:11px;margin-top:18px}.source-record summary{cursor:pointer;color:var(--green);padding:10px 0}.source-record dl{display:grid;grid-template-columns:1fr 1fr;gap:17px 30px;margin:12px 0}.source-record dt{font-size:10px;color:var(--muted);margin-bottom:4px}.source-record dd{margin:0;font-family:Consolas,"Microsoft JhengHei",monospace;font-size:11px;overflow-wrap:anywhere}.source-record p{font-size:11px;color:var(--muted);margin-top:15px}.print-gallery{display:none}.empty-book{padding:60px 0}.empty-book p{font-size:14px;margin-top:20px;color:var(--muted)}.footer{border-top:1px solid var(--line);background:var(--white);padding:24px max(3vw,20px);display:flex;justify-content:space-between;gap:20px;font-size:11px;color:var(--muted)}.noscript{padding:24px;background:var(--warm);font-size:13px}
dialog{border:1px solid #75856b;padding:0;width:calc(100vw - 32px);max-width:none;height:calc(100dvh - 32px);max-height:none;background:#e6e8df;color:var(--ink);box-shadow:0 18px 90px #0005}dialog::backdrop{background:rgba(21,33,25,.77)}.modal-layout{height:100%;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto}.modal-header{display:flex;align-items:center;gap:25px;padding:15px 20px;background:var(--white);border-bottom:1px solid var(--line)}.modal-header>div{min-width:0;flex:1}.modal-header p{font-size:9px;color:#856333;margin-bottom:4px}.modal-header h2{font-family:inherit;font-size:16px;font-weight:500;line-height:1.6}.modal-header>button{font-size:12px;padding:7px 12px;border:1px solid #a8b69f;background:transparent;color:var(--green);min-height:36px;white-space:nowrap}.modal-tools{display:flex;align-items:center;gap:10px 16px;flex-wrap:wrap;padding:10px 20px;border-bottom:1px solid #c1cabb;background:#eaf0e2;font-size:11px}.modal-tools button{padding:6px 9px;border:1px solid #b4c2aa;background:var(--white);color:var(--green);font-size:11px;min-height:33px}.zoom-tools{display:flex;align-items:center;gap:5px}.zoom-tools output{font-size:10px;min-width:92px;margin-left:4px}.modal-tools .annotation-control{margin-left:auto}.modal-tools a{font-size:10px}.modal-viewport{overflow:auto;min-height:100px;overscroll-behavior:contain;position:relative;scrollbar-color:#9aaa90 #e1e6da}.modal-canvas{min-width:100%;min-height:100%;width:max-content;display:flex;align-items:center;justify-content:center;padding:16px}.modal-frame{max-width:none;flex-shrink:0;background:transparent}.modal-frame img{max-width:none;display:block;width:100%;height:auto}.modal-bottom{display:flex;gap:22px;align-items:center;padding:10px 20px;background:var(--white);border-top:1px solid var(--line);font-size:11px}.modal-pagination{display:flex;gap:14px;align-items:center;white-space:nowrap}.modal-pagination button{border:1px solid #b4c2aa;background:transparent;color:var(--green);width:33px;height:32px}.modal-bottom>p{color:var(--muted);font-size:10px;margin-left:auto}.modal-notes{max-height:100px;overflow:auto;padding-right:15px;flex:1;min-width:0}.modal-notes .annotation-notes{margin:0;grid-template-columns:1fr;gap:7px}.modal-notes .annotation-notes li,.modal-notes .annotation-notes p,.modal-notes .annotation-notes strong{font-size:10px}.modal-notes .note-number{width:18px;min-width:18px;height:18px;font-size:9px}.modal-error{font-size:14px;color:var(--muted);padding:50px}
@media(min-width:1800px){.book-layout{grid-template-columns:300px minmax(0,1fr)}.sidebar{padding-left:28px;padding-right:22px}}@media(max-width:1250px){.book-layout{grid-template-columns:250px minmax(0,1fr)}.content{padding:27px 25px 38px}.visual-comparison.has-actual{grid-template-columns:1fr}.actual-stage{max-width:82%;margin-top:15px}.stage-heading{min-height:0}.child-nodes{grid-template-columns:1fr;gap:12px}.source-reading{gap:24px}.ordered{gap:12px 25px}.node-header{flex-wrap:wrap;gap:13px}.node-toolbar{gap:14px}.node-toolbar .text-button{margin-left:0}.coverage-badge{margin-top:0}}@media(max-width:820px){.masthead{display:block}.masthead nav{justify-content:flex-start;margin:19px 0 0;gap:10px 22px;max-width:none;font-size:11px}.edition{gap:8px 20px;font-size:10px}.edition .whole-status{margin-left:0;width:100%}.book-layout{display:block}.sidebar{position:static;max-height:none;border-right:0;border-bottom:1px solid var(--line);padding:21px 20px}.sidebar-title{margin-bottom:12px}.tree-scroll{max-height:310px;min-height:0}.sidebar-footnote{font-size:10px;margin-top:12px;padding-top:10px}.content{padding:25px 20px 35px}.node-header h2{font-size:31px}.actual-stage{max-width:100%}.source-reading,.ordered{grid-template-columns:1fr}.source-reading{gap:25px}.annotation-notes{grid-template-columns:1fr;gap:13px}.annotation-section{padding-top:20px}.reader-controls{flex-wrap:wrap;gap:13px}.footer{display:block}.footer p+p{margin-top:11px}.modal-header{padding:11px 13px}.modal-header h2{font-size:13px}.modal-tools{padding:8px 12px;gap:8px 12px}.modal-tools .annotation-control{margin-left:0}.modal-bottom{padding:9px 12px;gap:12px;flex-wrap:wrap}.modal-bottom>p{display:none}.modal-notes{max-height:85px}.zoom-tools output{min-width:75px}.modal-tools button{font-size:10px}.modal-tools a{margin-left:auto}dialog{width:calc(100vw - 12px);height:calc(100dvh - 12px)}}@media(max-width:480px){.node-toolbar{font-size:11px}.child-nodes ul{grid-template-columns:1fr}.source-record dl{grid-template-columns:1fr}.reference-missing{padding:31px 22px;min-height:240px}.reference-missing h3{font-size:25px}.image-sequence button{max-width:270px;min-width:185px}.stage-heading{display:block}.stage-heading h3{margin-top:8px}.missing-work{padding:20px}.modal-tools{gap:8px}.zoom-tools{flex-wrap:wrap}.zoom-tools output{font-size:9px}.modal-header{gap:12px}.modal-header>button{font-size:11px}.modal-notes{order:2;flex-basis:100%;max-height:70px}.modal-pagination{font-size:10px}.image-caption{display:block}.image-caption a{display:block;margin-top:5px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{@page{margin:14mm}body{background:white;color:#111;font-size:10pt}.masthead{padding:0 0 12px;background:white}.masthead nav,.sidebar,.node-toolbar,.reader-controls,.image-sequence,.visual-comparison,.readback-missing,.annotation-section,.source-reading,.source-record,.child-nodes,.footer,dialog{display:none!important}.masthead h1{font-size:22pt}.edition{padding:6px 0;background:white;color:#555;border-bottom:1px solid #aaa;font-size:8pt}.edition .whole-status{color:#555}.book-layout{display:block}.content{padding:16px 0}.node-header h2{font-size:24pt}.node-header{display:block}.coverage-badge{display:inline-block;margin:10px 0}.coverage-note{font-size:8pt}.purpose{font-size:10pt}.print-gallery{display:block;margin-top:20px}.print-gallery figure{margin:0 0 20px;break-inside:avoid}.print-gallery figcaption{font-size:10pt;margin:0 0 9px;color:#222}.print-gallery .image-frame{max-width:100%;background:white}.print-gallery .image-frame img{width:100%;height:auto}.print-gallery .annotation-notes{display:grid;grid-template-columns:1fr;gap:6px;margin-top:12px}.print-gallery .annotation-notes li,.print-gallery .annotation-notes p,.print-gallery .annotation-notes strong{font-size:8pt}.print-gallery figure>p{font-size:8pt;color:#555;margin-top:10px}.assembly-teaching{padding:20px 0}.ordered{grid-template-columns:1fr 1fr;gap:8px 24px}.ordered li{font-size:9pt}.missing-work{padding:15px 19px;background:#f4eee3}.missing-work li{font-size:9pt}.breadcrumb{font-size:8pt;margin-bottom:12px}.breadcrumb button{color:#555;border:0}.image-error{min-height:50mm}.hide-annotations .annotation-overlay{display:none}}
`;

const payload = JSON.stringify(book).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const html = `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="GT01 全廠參考圖冊：從總廠樹狀選讀到獨立部件，分開閱讀生成參考、圈註、現有模型與組裝教學。"><title>GT01｜全廠參考圖冊</title><style>${css}
.tree-toggle{display:none}@media(max-width:820px){.tree-toggle{display:block;border:1px solid #8eaa93;background:#fcfaf3;color:#214b39;padding:8px 14px;font:inherit;font-size:12px}.sidebar:not(.tree-expanded) .tree-scroll,.sidebar:not(.tree-expanded) .sidebar-footnote{display:none}.sidebar{padding-top:14px;padding-bottom:14px}.sidebar-title{display:none}.tree-count{margin:6px 0}.node-header h2{font-size:27px}.purpose{margin-top:10px}.breadcrumb{margin-bottom:12px}}</style></head><body><a class="skip-link" href="#reading">跳至所選圖冊節點</a><header class="masthead"><div><p class="signature">יהוה</p><p class="eyebrow">GT01 ATELIER / REFERENCE BOOK</p><h1 id="book-title">全廠參考圖冊</h1></div><nav aria-label="專案導覽"><a href="GT01-atelier.html?mode=factory">互動工坊 ↗</a><a href="GT01-factory-guide.html">工廠操作指南</a><a href="parts-library/factory/index.html">廠房零件倉庫</a><a href="GT01-factory-feedback.html">教學回饋與修正</a><a href="GT01-material-quality.html">材質施工課</a></nav></header><div class="edition"><span>圖冊版次 <code id="book-revision">—</code></span><span id="book-updated">讀取來源資料</span><span class="whole-status" id="whole-status">生成參考覆蓋，不等同於驗收。</span></div><noscript><div class="noscript">節點選讀、搜尋與放大功能需要啟用 JavaScript；程式與目錄資料都包含在本頁，不需網路。可另行開啟<a href="source/factory-reference-book.json">原始圖冊資料</a>。</div></noscript><div class="book-layout"><aside class="sidebar" aria-label="完整圖冊樹"><p class="sidebar-title">由整體，讀到每個接合。</p><label class="search-label" for="tree-search">搜尋名稱、節點或教學內容</label><div class="search-box"><input id="tree-search" type="search" placeholder="例如：工作臺、玻璃、WT01" autocomplete="off" spellcheck="false"><button type="button" id="clear-search" aria-label="清除搜尋" hidden>×</button></div><p class="tree-count" id="tree-result" aria-live="polite">讀取圖冊</p><button type="button" id="tree-toggle" class="tree-toggle" aria-expanded="false" aria-controls="tree">展開零件樹</button><div class="tree-scroll"><nav class="tree" id="tree" aria-label="圖冊節點樹"></nav><p class="tree-empty" id="tree-empty" hidden>沒有符合的節點。請縮短關鍵字，或清除搜尋查看完整樹。</p></div><p class="sidebar-footnote">「圖」表示此節點有自己的參考記錄。<br>「缺圖」表示本件仍待補圖，不代表沒有模型。</p></aside><main class="content"><p id="route-note" class="route-note" role="status" hidden></p><article id="reading" aria-label="所選節點的圖像與教學"></article></main></div><footer class="footer"><p>GT01 · 從整體規劃到部件參考<br>閱讀層圈註不改動原圖；參考、模型與驗收證據分開保留。</p><p>離線閱讀請保留本頁及其引用的圖片目錄。<br><a href="source/factory-reference-book.json" download>下載圖冊來源 JSON ↓</a></p></footer>
<dialog id="image-dialog" aria-labelledby="modal-title"><div class="modal-layout"><header class="modal-header"><div><p id="modal-kind">原圖</p><h2 id="modal-title">放大閱讀</h2></div><button type="button" id="modal-close" autofocus>關閉 ×</button></header><div class="modal-tools"><div class="zoom-tools"><button type="button" id="modal-fit">適合畫面</button><button type="button" id="modal-one">100%</button><button type="button" id="modal-minus" aria-label="縮小圖片">−</button><button type="button" id="modal-plus" aria-label="放大圖片">＋</button><output id="zoom-value">—</output></div><label class="annotation-control"><input type="checkbox" id="modal-annotations" checked>顯示圈註</label><a id="modal-original" href="#" target="_blank" rel="noopener">開啟未加圈註的原圖 ↗</a></div><div class="modal-viewport" id="modal-viewport"><div class="modal-canvas" id="modal-image-area"></div></div><footer class="modal-bottom"><div class="modal-pagination"><button type="button" id="modal-previous" aria-label="前一張圖片">←</button><span id="modal-sequence">—</span><button type="button" id="modal-next" aria-label="下一張圖片">→</button></div><div class="modal-notes" id="modal-annotation-notes"></div><p>放大後可捲動全圖 · Esc 關閉</p></footer></div></dialog><script type="application/json" id="reference-book-data">${payload}</script><script>(${referenceBookReader.toString()})();</script></body></html>`;
await fs.writeFile(new URL('GT01-factory-reference-book.html', outputRoot), html, 'utf8');
console.log(JSON.stringify({output:new URL('GT01-factory-reference-book.html',outputRoot).pathname,bytes:Buffer.byteLength(html),revision:book.revision??null,nodes:book.nodes.length,wholeAccepted:book.wholeAccepted??null,externalRuntimeDependencies:false}));
