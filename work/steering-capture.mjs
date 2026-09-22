import fs from 'node:fs/promises';import path from 'node:path';import http from 'node:http';import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire('LOCAL_PATH_OMITTED');
const {chromium}=require('playwright'),base=path.resolve(import.meta.dirname,'..'),out=path.join(base,'outputs/quality');
const run=process.argv[2]||'r1';if(!/^r\d+$/.test(run))throw Error('revision required');
const log={ownerPid:process.pid,startedAt:new Date().toISOString(),errors:[],frames:[],run};
const digest=async()=>crypto.createHash('sha256').update(await fs.readFile(path.join(base,'outputs/source/steering-wheel.mjs'))).digest('hex');log.sourceSHA256=await digest();
const server=http.createServer(async(req,res)=>{try{const f=path.resolve(base,'.'+decodeURIComponent(req.url.split('?')[0]));if(!f.startsWith(base+path.sep))throw Error('scope');res.setHeader('Content-Type',f.endsWith('.html')?'text/html':f.endsWith('.mjs')?'text/javascript':f.endsWith('.png')?'image/png':'application/octet-stream');res.end(await fs.readFile(f));}catch{res.writeHead(404).end();}});
let native,browser;
try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));log.port=server.address().port;
  native=await chromium.launchServer({channel:'chrome',headless:true});log.browserPid=native.process().pid;
  browser=await chromium.connect(native.wsEndpoint());const page=await browser.newPage({viewport:{width:1400,height:980},deviceScaleFactor:1});
  page.on('pageerror',e=>log.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')log.errors.push(m.text());});
  await page.goto('http://127.0.0.1:'+log.port+'/work/steering-viewer.html');await page.waitForFunction(()=>window.STEERING,{timeout:45000});
  async function snap(view,mode='all',full=false){
    await page.evaluate(([view,mode])=>{STEERING.layers(mode);STEERING.view(view);},[view,mode]);
    const name=`steering-${run}-${mode}-${view}.png`,bytes=await page.locator(full?'body':'#stage').screenshot();await fs.writeFile(path.join(out,name),bytes);
    log.frames.push({file:name,state:await page.evaluate(()=>STEERING.getState())});
  }
  await snap('front','all',true);for(const name of ['rear','side','iso','top','bottom','H1','H3','H5','H7','lower-slot','hub'])await snap(name);
  await snap('iso','core');await snap('rear','core');log.complete=log.errors.length===0;
}catch(e){log.failure=e.stack;process.exitCode=1;}
finally{
  if(browser)await browser.close();if(native){await native.close();log.browserExited=native.process().exitCode!==null;}
  await new Promise(r=>server.close(r));log.serverClosed=!server.listening;log.finishedAt=new Date().toISOString();log.bindingsUnchanged=log.sourceSHA256===await digest();
  await fs.writeFile(path.join(out,`steering-browser-readback-${run}.json`),JSON.stringify(log,null,2));
  console.log(JSON.stringify({complete:log.complete,frames:log.frames.length,errors:log.errors,failure:log.failure,browserPid:log.browserPid,port:log.port,browserExited:log.browserExited,serverClosed:log.serverClosed,bindingsUnchanged:log.bindingsUnchanged}));
}
