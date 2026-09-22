import fs from 'node:fs/promises';
const page=new URL('../outputs/source/atelier-page.html',import.meta.url);
let html=await fs.readFile(page,'utf8');
const start=html.indexOf('<article class="lesson"><div class="tag">02');
const end=html.indexOf('</div><footer>參考構造方法',start);
if(start<0||end<0)throw Error('Lesson region not found');
html=html.slice(0,start)+`
<article class="lesson"><div class="tag">02 / 圖紙也必須退回修正</div><h3>一個門體不應重複出現兩組內殼</h3><div class="annotated"><img src="references/D00-door-r1.png"><svg viewBox="0 0 1536 1024"><circle cx="393" cy="517" r="126"/><circle cx="945" cy="537" r="122"/></svg></div><p>這是實際生成的 D00 第一版。拆圖重複了內殼和承載板，零件編號也不能唯一對上。漂亮的外觀不會消除裝配矛盾，該區已退回修圖。</p><details><summary>圖紙如何約束模型</summary><code>vehicle-reference-index.json → D01…D12 → referencePart</code><p>圖上每個獨立形體要對上一個零件角色；再讓模型部件引用相同編號。不能按文字數量計算零件完整度，也不能用總成圖填滿每個零件的參考欄。</p></details></article>
<article class="lesson"><div class="tag">03 / 接合放大仍需判讀</div><h3>固定螺栓不能穿過滑軌的運動通道</h3><div class="annotated"><img src="references/S00-seat-r1.png"><svg viewBox="0 0 1536 1024"><circle cx="1229" cy="719" r="137"/></svg></div><p>這是 S00 第一版的原圖。滑軌放大區將固定件與滾動空間混在一起；圖上的高度也未配合本車座艙。這些細節不可直接移植到模型。</p><details><summary>形體與空間一起檢查</summary><code>座椅腳點 → 車艙包絡 → 上下軌共同剖面 → 裝配讀回</code><p>先用本車地板及車頂確定座椅空間，再分開固定孔、滑動通道與滾動元件。R2 修正高度與剖面標題，滑軌細節仍待獨立圖補正；未解決的區域保持可見。</p></details></article>
`+html.slice(end);
await fs.writeFile(page,html);
