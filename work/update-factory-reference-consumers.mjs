import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),file=x=>new URL(x,root);
const ref=file('outputs/source/factory-reference-book.json'),book=JSON.parse(await fs.readFile(ref,'utf8'));
for(const n of book.nodes){if(n.model)n.model=n.model.replace('&part=','&factoryPart=');n.steps=n.steps?.map(s=>s.replaceAll('纵','縱').replaceAll('装','裝'));}
const drawer=book.nodes.find(n=>n.id==='WT01-D');drawer.images[0].annotations=[{x:.02,y:.71,w:.53,h:.23,label:'D01',note:'兩組剖面被不明橫桿接在一起；無法從此圖重建連續的巢狀滑軌。'},{x:.8,y:.69,w:.19,h:.26,label:'D02',note:'螺絲出現在把手外側；正確路徑應從前板背面穿過板孔，進入把手腳的盲牙孔。'},{x:.61,y:.06,w:.3,h:.17,label:'D03',note:'上方多出一個未定義的開口容器，與同頁只有一個抽屜的分件不一致。'}];
const frame=book.nodes.find(n=>n.id==='WT01-F');frame.images[0].annotations=[{x:.535,y:.68,w:.225,h:.265,label:'F01',note:'桌板固定螺絲被畫成帶螺帽的穿透關係；木材內的螺紋承接與金屬扣件固定方法尚未一致。'}];
book.nodes.find(n=>n.id==='WT01').images[0].inspection=['已可看見三欄三層九抽、獨立櫃殼、框架與桌板。','此圖主件爆炸不支付滑軌滾珠、保持架、把手螺絲或調整腳內部的完整定義。'];
await fs.writeFile(ref,JSON.stringify(book,null,2));
const qa=file('work/quality/check-factory-teaching.mjs');let s=await fs.readFile(qa,'utf8');
s=s.replace('return{production:f.root.userData.production,geometryChecked:checked,wrong};','const expected=new Set();const walk=o=>{if(o.geometry)expected.add(o.geometry);for(const c of o.children||[])walk(c);};if(w)walk(w.scene.object);return{production:f.root.userData.production,geometryChecked:checked,expectedGeometryCount:expected.size,missing:[...expected].filter(id=>!seen.has(id)),unexpected:[...seen].filter(id=>!expected.has(id)),wrong};');
s=s.replace('warehouseProduction.geometryChecked>500','warehouseProduction.geometryChecked===warehouseProduction.expectedGeometryCount&&warehouseProduction.missing.length===0&&warehouseProduction.unexpected.length===0');await fs.writeFile(qa,s);
const guide=file('work/build-factory-guide.mjs');let g=await fs.readFile(guide,'utf8');g=g.replaceAll('factory-teaching-r1','factory-teaching-r4');const lex={构:'構',输入:'輸入',所属:'所屬',对象:'對象',掩盖:'掩蓋',一条:'一條',属于:'屬於'};for(const [a,b]of Object.entries(lex))g=g.replaceAll(a,b);await fs.writeFile(guide,g);
console.log('Reference links, explicit image defects and geometry-set comparison updated.');
