import fs from 'node:fs/promises';
const file=new URL('../outputs/source/vehicle-reference-index.json',import.meta.url),d=JSON.parse(await fs.readFile(file,'utf8'));
const i=d.assemblies.flatMap(a=>a.parts).find(p=>p.id==='I04');
const before=structuredClone(i.views);if(!Array.isArray(i.views))i.views=Object.entries(i.views).map(([view,reference])=>({view,reference}));
await fs.writeFile(file,JSON.stringify(d,null,2));
await fs.writeFile(new URL('../outputs/quality/reference-view-schema-correction.json',import.meta.url),JSON.stringify({before,after:i.views,cause:'producer emitted view map while release reader expected array',failure:'TypeError: object is not iterable',repair:'producer and existing canonical record now emit view/reference records; gate reports invalid shapes as open issues',notAcceptance:true},null,2));
