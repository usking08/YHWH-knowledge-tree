import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),edit=async(p,f)=>{const u=new URL(p,root);await fs.writeFile(u,f(await fs.readFile(u,'utf8')));};
await edit('work/build-factory-feedback.mjs',s=>s.replace("const report={schema:'GT01-teaching-feedback/v1'","try{const prior=JSON.parse(await read('quality/factory-teaching-feedback.json'));for(const row of prior.records||[])if(!records.some(r=>r.id===row.id))records.push(row);}catch(e){if(e.code!=='ENOENT')throw e;}\n+const report={schema:'GT01-teaching-feedback/v1'".replace('\n+','\n')));
await edit('work/build-factory-reference-book.mjs',s=>{
 if(!s.includes('id="tree-toggle"'))s=s.replace('<div class="tree-scroll">','<button type="button" id="tree-toggle" class="tree-toggle" aria-expanded="false" aria-controls="tree">展開零件樹</button><div class="tree-scroll">');
 if(!s.includes("$('tree-toggle').addEventListener"))s=s.replace("$('modal-close').addEventListener",`$('tree-toggle').addEventListener('click',()=>{const el=document.querySelector('.sidebar'),open=el.classList.toggle('tree-expanded');$('tree-toggle').setAttribute('aria-expanded',String(open));$('tree-toggle').textContent=open?'收起零件樹':'展開零件樹';});
  $('tree-search').addEventListener('input',()=>{document.querySelector('.sidebar').classList.add('tree-expanded');$('tree-toggle').setAttribute('aria-expanded','true');$('tree-toggle').textContent='收起零件樹';});
  $('tree').addEventListener('click',e=>{if(e.target.closest('[data-node]')&&matchMedia('(max-width:820px)').matches){document.querySelector('.sidebar').classList.remove('tree-expanded');$('tree-toggle').setAttribute('aria-expanded','false');$('tree-toggle').textContent='展開零件樹';}});
  $('modal-close').addEventListener`);
 s=s.replace('}</style></head>','}</style></head>');
 if(!s.includes('.tree-toggle{display:none}'))s=s.replace('<style>${css}</style>','<style>${css}\n.tree-toggle{display:none}@media(max-width:820px){.tree-toggle{display:block;border:1px solid #8eaa93;background:#fcfaf3;color:#214b39;padding:8px 14px;font:inherit;font-size:12px}.sidebar:not(.tree-expanded) .tree-scroll,.sidebar:not(.tree-expanded) .sidebar-footnote{display:none}.sidebar{padding-top:14px;padding-bottom:14px}.sidebar-title{display:none}.tree-count{margin:6px 0}.node-header h2{font-size:27px}.purpose{margin-top:10px}.breadcrumb{margin-bottom:12px}}</style>');
 return s;
});
await edit('outputs/source/factory-reference-book.json',s=>{const d=JSON.parse(s),steps={
 'WT01-LF01':['對照平底面、直徑 40 的承壓盤、17 對邊六角與 M10 螺桿；一體件不拆成三個相疊零件。','金屬底面對準杯墊內底；底面接觸需要有限面積，不能留下原 R2 的尖點。','螺距 p = 1.5 mm；相對旋轉一圈的軸向位移量為 1.5 mm。旋向、牙合範圍與工具可達性須在同一原生模型驗證。'],
 'WT01-LF02':['開口朝 +Z，封閉底面朝向地面；檢查內外徑與壁厚是同一截面的派生量。','承壓盤由上方進入；上緣凸珠的彈性讓位尚未驗證，不把直線穿過當成可組裝證據。','裝好後核對承壓盤平底與杯墊內底接觸，再核對底墊外底與地面接觸。'],
 'WT01-LF03':['孔軸與 LF01 螺桿同軸，從螺桿自由端旋入；不能直接平移穿过螺紋。','幾何計算使用 Δz = p Δθ / (2π)，角度以弧度計；旋向與相位仍须先對照同一牙形。','最後讓螺帽頂面接觸 LF04 板底；只證明面接觸不足以聲稱鎖緊力或扭矩已達標。'],
 'WT01-LF04':['先確認四角孔在 55 × 55 的中心距上；(75 − 55)/2 = 10 mm 為邊到孔心距。','中央牙孔與 LF01、LF03 共用軸線與螺距；四角孔不得錯當成內螺紋孔。','板與桌腳的固定介面尚未關閉，不能只讓板貼到方管底面就宣稱已固定。']};for(const n of d.nodes)if(steps[n.id])n.steps=steps[n.id].map(v=>v.replaceAll('穿过','穿過').replaceAll('仍须','仍須'));return JSON.stringify(d,null,2);});
await edit('work/build-material-teaching.mjs',s=>s.replaceAll('目前模型真正畫出的畫面','材料 r4 的歷史模型畫面').replaceAll('photorealAccepted: false','寫實外觀尚未驗收'));
console.log('Teaching paths and mobile tree updated.');
