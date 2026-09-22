import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../',import.meta.url));
for(const file of ['build-vehicle-source.mjs','build-vehicle-reference-index.mjs','expand-component-tree.mjs','refresh-reference-reviews.mjs','quality/verify-handle-evidence.mjs','build-reference-library.mjs','build-atelier.mjs','build-clamp-assembly.mjs','build-motor-assembly.mjs','build-handle-assembly.mjs','build-handle-quality.mjs','build-handle-production-note.mjs','build-parts-library.mjs','build-parts-library-readers.mjs','build-library-part-views.mjs','build-parts-math.mjs','build-parts-math-page.mjs','build-shape-theory.mjs','build-shape-correction.mjs','build-shape-theory-page.mjs']){
 const result=spawnSync(process.execPath,['work/'+file],{cwd,stdio:'inherit',windowsHide:true});if(result.status!==0)process.exit(result.status||1);
}
console.log('Whole workshop draft rebuilt. Visual acceptance and release remain separate.');
