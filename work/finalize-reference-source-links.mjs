import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),edit=async(p,f)=>{const u=new URL(p,root),s=await fs.readFile(u,'utf8');await fs.writeFile(u,f(s));};
await edit('work/build-factory-warehouse-page.mjs',s=>{const start=s.indexOf('<section style="padding:24px 5vw;');if(start>=0){const end=s.indexOf('</details></section>',start);if(end<0)throw Error('No end of decomposition panel');s=s.slice(0,start)+'${await physicalDecompositionSection()}'+s.slice(end+'</details></section>'.length);}if(!s.includes('import {physicalDecompositionSection}'))s="import {physicalDecompositionSection} from './factory-warehouse-decomposition-section.mjs';\n"+s;return s;});
await edit('outputs/source/factory-reference-book.json',s=>s.replaceAll('接口','介面'));
await edit('work/build-factory-feedback.mjs',s=>s.replaceAll('圖冊来源','圖冊來源').replaceAll('物理組装','物理組裝'));
console.log('Decomposition renderer now reads its canonical data on every build.');
