import fs from 'node:fs/promises';
const here=new URL('./',import.meta.url);
const rim=await fs.readFile(new URL('rim-preserved.js',here),'utf8');
const three=await fs.readFile(new URL('three.mjs',here));
const model=(await fs.readFile(new URL('model.mjs',here),'utf8')).replace("import * as T from './three.mjs';",'');
const viewer=(await fs.readFile(new URL('viewer.mjs',here),'utf8')).replace("import * as T from './three.mjs';",'').replace("import {buildModel} from './model.mjs';",'');
const page=await fs.readFile(new URL('page.html',here),'utf8');
const html=page.replace('<!--MODEL-->',`<script>${rim}</script><script type="module">import * as T from 'data:text/javascript;base64,${three.toString('base64')}';\n${model}\n${viewer}</script>`);
if(process.argv.includes('--release')){
 const {createHash}=await import('node:crypto');
 const {runGate}=await import('../../work/quality/gate.mjs');
 const verdict=await runGate({candidateSHA256:createHash('sha256').update(html).digest('hex')});
 if(!verdict.releaseAllowed){console.error('QUALITY_BLOCKED: release not written. Inspect outputs/quality/index.html and gate-result.json.');process.exitCode=2;}
 else {await fs.writeFile(new URL('../GT01-wheel.release.html',here),html);console.log('Released the exact visually reviewed artifact.');}
}else{
 await fs.writeFile(new URL('../GT01-wheel.html',here),html);
 console.log('Draft rebuilt. This is not quality acceptance. Run the quality capture, probes, visual review and --release gate.');
}
