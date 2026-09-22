import fs from 'node:fs/promises';
import {motorSourceBundle} from './motor-source-bundle.mjs';
const out=new URL('../outputs/',import.meta.url),read=f=>fs.readFile(new URL('source/'+f,out),'utf8');
const [page,three,viewer,caps]=await Promise.all(['motor-assembly-page.html','three.mjs','motor-assembly-viewer.mjs','motor-section-caps.mjs'].map(read)),motor=await motorSourceBundle();
const script=`import * as T from 'data:text/javascript;base64,${Buffer.from(three).toString('base64')}';\n${motor}\n${caps}\n${viewer}`;
await fs.writeFile(new URL('GT01-motor-assembly.html',out),page.replace('<!--MOTOR-ASSEMBLY-->',`<script type="module">${script}</script>`));console.log('Motor core part and assembly reader built; drive remains incomplete.');
