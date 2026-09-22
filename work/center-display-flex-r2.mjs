import fs from 'node:fs/promises';const path=new URL('../outputs/source/center-display.mjs',import.meta.url);let s=await fs.readFile(path,'utf8');s=s.replace("new T.Vector3(u,-47,-3.05),new T.Vector3(u,-39.5,-3.05)","new T.Vector3(u,-47,-3.05),new T.Vector3(u,-44,-3.05),new T.Vector3(u,-39.5,-3.05)");
s=s.replace("const w=tag==='LCD'?24:16,meta={connector:tag,explode:[-95,0,-16],electricalQualified:false};","const w=tag==='LCD'?24:16,meta={connector:tag,explode:[-95,0,-16],electricalQualified:false};const base=rounded(w,6,.4,false,u,-39);for(let j=0;j<Math.floor(width);j++)base.holes.push(rounded(.6,.5,.04,true,u-width/2+.5+j,-38.15));");
s=s.replace("joined([plate(w,6,.4,-4.5,-4.1,u,-39)","joined([ex(base,-4.5,-4.1)");
s=s.replace("plate(.38,.25,.05,-4.1,-2.95,u-width/2+.5+j,-38.15)","plate(.38,.25,.05,-5.8,-2.95,u-width/2+.5+j,-38.15)");
s=s.replace("各接點保留間隔；尾端與外部設備配線尚未定義。","各接點穿本體獨立孔延伸至後端口，保留間隔；外部對接插頭、配線及針腳尚未定義。");
await fs.writeFile(path,s);
