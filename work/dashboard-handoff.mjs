import fs from 'node:fs/promises';import crypto from 'node:crypto';import path from 'node:path';
const base=path.resolve(import.meta.dirname,'..'),q=path.join(base,'outputs/quality');
const read=async f=>JSON.parse(await fs.readFile(path.join(base,f),'utf8'));
const native=await read('outputs/quality/dashboard-native-r7.json'),browser=await read('outputs/quality/dashboard-browser-r9.json');
const source=await fs.readFile(path.join(base,'outputs/source/dashboard.mjs')),sha=crypto.createHash('sha256').update(source).digest('hex');
const refs=await fs.readdir(path.join(base,'outputs/references')),generated=refs.filter(f=>/^(I01|I06)-.*\.png$/.test(f));
const core=['outputs/source/dashboard.mjs','work/dashboard-viewer.html','work/dashboard-inspect.mjs','work/dashboard-capture.mjs','outputs/references/I01-reference-review.json','outputs/references/I01-generation-prompts.json','outputs/references/I01-part-generation-prompts.json',...generated.map(f=>'outputs/references/'+f)];
const files=[];for(const f of core){const bytes=await fs.readFile(path.join(base,f));files.push({path:f,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
const isolated=browser.frames.filter(f=>/dashboard-r9-I\d\d-P\d\d\.png$/.test(f.file));
const result={schema:'gt01.dashboard-delivery/v1',revision:native.revision,generatedAt:new Date().toISOString(),module:'outputs/source/dashboard.mjs',viewer:'work/dashboard-viewer.html',sourceSHA256:sha,sourceNativeBrowserSame:sha===native.sourceSHA256&&sha===browser.sourceSHA256&&browser.bindingsUnchanged,nativeChecksPass:native.checksPass,partClasses:Object.keys(native.definition.partDefinitions).length,meshes:native.meshes,triangles:native.triangles,bounds:native.bounds,independentReferences:isolated.map(f=>({image:f.file,partId:f.state.selected,reference:f.state.reference})),allIndependentReferencesLoaded:isolated.length===20&&isolated.every(f=>f.state.reference.loaded),interaction:browser.interaction,browserErrors:browser.errors,browserClosed:browser.browserExited&&browser.serverClosed,files,notClaimed:native.definition.unknown};
await fs.writeFile(path.join(q,'dashboard-delivery.json'),JSON.stringify(result,null,2));
await fs.copyFile(path.join(base,'outputs/source/dashboard.mjs'),path.join(q,'dashboard-r7-source.mjs'));
console.log(JSON.stringify({revision:result.revision,sourceNativeBrowserSame:result.sourceNativeBrowserSame,nativeChecksPass:result.nativeChecksPass,partClasses:result.partClasses,allIndependentReferencesLoaded:result.allIndependentReferencesLoaded,interaction:result.interaction,files:files.length}));


