import fs from 'node:fs/promises';
const root=new URL('../outputs/',import.meta.url),read=f=>fs.readFile(new URL('source/'+f,root),'utf8');
const [page,three,rim,model,vehicle,viewer,tool,study]=await Promise.all(['clamp-assembly-page.html','three.mjs','rim-preserved.js','model.mjs','vehicle.mjs','clamp-assembly-viewer.mjs','clamp-tools.mjs','clamp-tool-study.mjs'].map(read));
const code=`import * as T from 'data:text/javascript;base64,${Buffer.from(three).toString('base64')}';\n${model.replace("import * as T from './three.mjs';",'')}\n${vehicle}\n${tool.replace('export function','function')}\n${viewer.replace('/*TOOL-STUDY*/',study)}`;
await fs.writeFile(new URL('GT01-clamp-assembly.html',root),page.replace('<!--CLAMP-ASSEMBLY-->',`<script>${rim}</script><script type="module">${code}</script>`));
console.log('Same-model clamp assembly reader built. Full door path remains unverified.');
