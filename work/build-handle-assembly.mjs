import fs from 'node:fs/promises';
const out=new URL('../outputs/',import.meta.url),read=f=>fs.readFile(new URL('source/'+f,out),'utf8');
const [page,three,viewer,caps,...sources]=await Promise.all(['handle-assembly-page.html','three.mjs','handle-assembly-viewer.mjs','motor-section-caps.mjs','door-handle-lever.mjs','door-handle-carrier.mjs','door-handle-hardware.mjs','door-handle-return.mjs','door-handle-actuator.mjs','door-handle-assembly-paths.mjs','door-handle.mjs'].map(read));
const code=sources.join('\n').replace(/^import \{[^\n]+ from '\.\/door-handle-[^']+';\r?\n/gm,'');const script=`import * as T from 'data:text/javascript;base64,${Buffer.from(three).toString('base64')}';\n${code}\n${caps}\n${viewer}`;
await fs.writeFile(new URL('GT01-handle-assembly.html',out),page.replace('<!--HANDLE-READER-->',`<script type="module">${script}</script>`));console.log('Handle first-article reader built; complete handle and car remain open.');
