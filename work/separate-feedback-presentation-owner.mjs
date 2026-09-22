import fs from 'node:fs/promises';
const u=new URL('./build-factory-feedback.mjs',import.meta.url),s=await fs.readFile(u,'utf8');
const start=s.indexOf("const md=['# 廠房教學與施工回饋 R1'"),end=s.indexOf("const raw=await fs.readFile");if(start<0||end<0)throw Error('Feedback generator boundary not found');
const header="import fs from 'node:fs/promises';\nconst root=new URL('../outputs/',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8'),write=(p,v)=>fs.writeFile(new URL(p,root),v);\n// Canonical feedback records are edited explicitly. Rendering never changes references or findings.\nconst report=JSON.parse(await read('quality/factory-teaching-feedback.json')),records=report.records;\n";
await fs.writeFile(u,header+s.slice(start,end)+"console.log(JSON.stringify({feedback:records.length,wholeAccepted:report.wholeAccepted}));\n");
console.log('Feedback renderer no longer mutates source drawings or rewrites prior review findings.');
