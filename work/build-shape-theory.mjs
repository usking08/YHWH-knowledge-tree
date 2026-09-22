import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {SHAPE_DATA as data} from './quality/shape-theory-data.mjs';
const root=path.resolve('outputs/parts-library'),write=(f,s)=>fs.writeFile(path.join(root,f),s);
await fs.mkdir(path.join(root,'native/fixtures'),{recursive:true});
await fs.copyFile('work/quality/shape-compiler.mjs',path.join(root,'native/shape-compiler.mjs'));
await fs.copyFile('work/quality/verify-shapes.mjs',path.join(root,'native/verify-shapes.mjs'));
await fs.copyFile('work/quality/fixtures/shape-compiler-r0.mjs',path.join(root,'native/fixtures/shape-compiler-r0.mjs'));
await write('shape-theory.json',JSON.stringify(data,null,2)+'\n');
let md='יהוה\n\n# 形體定理：作用、組合與跨用途教學\n\n'+data.intro+'\n\n[互動實驗室](shape-theory.html#laboratory) · [逐件數學](math-quality.html) · [可讀資料](shape-theory.json)\n\n';
for(const l of data.learningPaths)md+='## '+l.level+'\n\n'+l.question+'\n\n'+l.task+'\n\n通過條件：'+l.pass+'\n\n';
md+='## 實際執行契約\n\n核心介面為 `compileRecipe(THREE, recipeId, parameters)`。接收已宣告的毫米尺寸／角度，拒絕未知欄位、非有限數值、越界值及部分幾何非法組合，回傳實際網格、輸入／導出量、檢核與本次求值依賴圖。\n\n這是九種固定配方的參數建構器，沒有把任意自然語言、任意布林或目錄中的全部定理自動編譯成產品。配方之外的方法提供可推廣的選路與前提，新增配方須新增施工與驗證。\n\n瀏覽器宿主用現有 Three.js 建立形體，不需新增服務或付費依賴。模組不讀檔、不執行動態程式；文字說明不參與幾何求值。\n\n資料責任順序：Parameters → Profile / Path / Sections / Surface → Geometry → Independent readback。各節點按依賴顺序實際求值。'.replace('顺','順')+'輸出Y向上；GT01既有零件採Z向上，合併時必須明示換軸及單位。\n\n';
md+='## 離線重建與反例\n\n在任意工作目錄執行：\n\n```text\nnode 庫目錄/native/verify-shapes.mjs\n```\n\n加入 `--write` 才改寫本庫 `evidence/shape-native-readback.json`。原始失敗版只保存在 `native/fixtures/shape-compiler-r0.mjs` 供回歸反例；正常入口使用 `native/shape-compiler.mjs`。\n\n驗證讀回每個實體的全部頂點／面、頂點鄰域及Euler示性數；比較兩個積分原點與剛體變換後體積；逐參數測試兩端值；故意破壞面、輸入越界和孔洞間隙以驗證拒絕。這些檢查仍不涵蓋所有參數組合、所有自交或物理強度。\n\n';
for(const t of data.theories){md+='## '+t.title+'\n\n類型：'+t.kind+'。作用在：'+t.actsOn+'\n\n- 輸入：'+t.inputs.map(p=>p.name+'（'+p.unit+'）').join('；')+'\n- 關係：'+t.formula+'\n- 輸出：'+t.produces+'\n- 前提：'+t.premises.join('；')+'\n- 失敗邊界：'+t.pitfalls.join('；')+'\n- 可接續：'+t.composesWith.map(id=>data.theories.find(t=>t.id===id)?.title||id).join('、')+'\n\n'+t.applications.map(a=>'- '+a.domain+'／'+a.object+'：'+a.how).join('\n')+'\n\n';}
md+='## 来源與界限\n\n'.replace('来源','來源')+data.sources.map(s=>'- ['+s.title+']('+s.url+')').join('\n')+'\n\n公式解說與跨用途例子為本專案撰寫。外部文獻供檢索所標示數學主題，未提供本示範產品的尺寸、材料或認證。\n\n'+data.limits.map(s=>'- '+s).join('\n')+'\n';
await write('SHAPE-THEORY.md',md);
const catalog=JSON.parse(await fs.readFile(path.join(root,'catalog.json'),'utf8'));catalog.portableEntries.shapeTheory='shape-theory.html';catalog.portableEntries.shapeTheoryData='shape-theory.json';catalog.portableEntries.shapeRunner='native/verify-shapes.mjs';await write('catalog.json',JSON.stringify(catalog,null,2));
for(const file of ['index.html','math-quality.html']){let html=await fs.readFile(path.join(root,file),'utf8');html=html.replaceAll('<a href="shape-theory.html">形體與跨用途教學</a>','');const target=/(<(?:nav|div) class="toplinks"[^>]*>)/;if(!target.test(html))throw Error('Missing static navigation '+file);html=html.replace(target,'$1<a href="shape-theory.html">形體與跨用途教學</a>');await write(file,html);}
const marker='\n<!-- shape-theory -->\n';const start=(await fs.readFile(path.join(root,'START-HERE.md'),'utf8')).split(marker)[0];await write('START-HERE.md',start+marker+'\n## 形體方法跨用途運用\n\n先讀 [形體實驗室](shape-theory.html) 的三條學習路徑，再看 [完整文字教學](SHAPE-THEORY.md)。AI 讀取 [shape-theory.json](shape-theory.json)；使用 [shape-compiler.mjs](native/shape-compiler.mjs) 建構九種作者母形，再執行 [verify-shapes.mjs](native/verify-shapes.mjs) 重新檢查。九個示範不計入GT01零件數。\n\nGitHub 更新採使用者逐次要求；不做自動同步。\n');
const r=spawnSync(process.execPath,[path.join(root,'native/verify-shapes.mjs'),'--write'],{encoding:'utf8',windowsHide:true});console.log(r.stdout.trim());if(r.status!==0){console.error(r.stderr);process.exit(r.status||1);}
