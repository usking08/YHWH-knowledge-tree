import fs from 'node:fs/promises';
const root=new URL('../outputs/',import.meta.url);
const input=JSON.parse(await fs.readFile(new URL('source/wt01-foot-relations.json',root),'utf8'));
const fmt=v=>Number(v.toFixed(4)).toString();
function derive(s){
 const p=s.pad,m=s.stem,n=s.nut,b=s.plate;
 const discBottom=p.floor,discTop=discBottom+m.discThickness,collarTop=discTop+m.collarHeight,stemTop=collarTop+m.threadLength;
 const plateTop=stemTop-s.pose.tipProjectionAbovePlate,plateBottom=plateTop-b.thickness,nutBottom=plateBottom-n.height;
 const padTop=p.floor+p.rimAboveFloor,lipBottom=padTop-p.lipHeight;
 return {radialWall:(p.outerDiameter-p.innerDiameter)/2,padTop,lipBottom,discBottom,discTop,collarTop,stemTop,plateTop,plateBottom,nutBottom,
  lipAxialClearance:lipBottom-discTop,throatDiameter:p.innerDiameter-2*p.lipInward,radialRetentionOverlap:(m.discDiameter-(p.innerDiameter-2*p.lipInward))/2,
  straightWallRadialClearance:(p.innerDiameter-m.discDiameter)/2,exposedThread:nutBottom-collarTop,metalHeight:m.discThickness+m.collarHeight+m.threadLength,
  pitch:s.stem.threadPitch,cornerHoleCenters:[-1,1].flatMap(x=>[-1,1].map(y=>[x*b.boltSpacing/2,y*b.boltSpacing/2])),holeEdgeClearance:(b.width-b.boltSpacing-b.boltHoleDiameter)/2};
}
function constraints(s,d){const eps=1e-9;return [
 {id:'C01',relation:'環壁厚度 = (外徑 − 內徑)/2',actual:d.radialWall,pass:d.radialWall>0},
 {id:'C02',relation:'扣珠底面 − 承壓盤頂面 ≥ 指定軸向間隙',actual:d.lipAxialClearance,required:s.requirements.minimumLipAxialClearance,pass:d.lipAxialClearance+eps>=s.requirements.minimumLipAxialClearance},
 {id:'C03',relation:'承壓盤半徑 − 入口半徑 ≥ 指定徑向扣持重疊',actual:d.radialRetentionOverlap,required:s.requirements.minimumRadialRetentionOverlap,pass:d.radialRetentionOverlap+eps>=s.requirements.minimumRadialRetentionOverlap},
 {id:'C04',relation:'杯體直壁內徑大於承壓盤外徑',actual:d.straightWallRadialClearance,pass:d.straightWallRadialClearance>0},
 {id:'C05',relation:'螺帽與固定板位於名義螺紋長度內',actual:d.exposedThread,pass:d.exposedThread>=0&&d.plateTop<=d.stemTop&&d.plateBottom>d.collarTop},
 {id:'C06',relation:'角孔至板邊保有實體',actual:d.holeEdgeClearance,pass:d.holeEdgeClearance>0}
 ];}
const d=derive(input),checks=constraints(input,d);
const old=structuredClone(input);old.pad.rimAboveFloor=3;
const historical=constraints(old,derive(old));
if(checks.some(x=>!x.pass)||historical.find(x=>x.id==='C02').pass)throw Error('Nominal relations failed or old retention defect was not rejected');
const report={schema:'GT01-foot-relations-readback/v1',revision:input.revision,scope:'名義尺寸與軸向區間；不含實體碰撞、彈性、強度或製造公差',input:'source/wt01-foot-relations.json',derived:d,checks,historicalCounterexample:{inputChange:{rimAboveFloor:3},failed:historical.filter(x=>!x.pass)},assemblyQualified:false};
await fs.writeFile(new URL('quality/wt01-foot-relations.json',root),JSON.stringify(report,null,2));
// This is a deterministic axial drawing, not an edited raster image or a 3D mesh.
const S=7.4,cx=407,y0=722,Y=z=>y0-z*S,X=x=>cx+x*S;
const poly=(points,fill,stroke='#35493f')=>`<polygon points="${points.map(([x,z])=>`${X(x)},${Y(z)}`).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
const rect=(x,z,w,h,fill,stroke='#35493f')=>`<rect x="${X(x)}" y="${Y(z+h)}" width="${w*S}" height="${h*S}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
const txt=(x,y,t,size=18,fill='#243e34')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${t}</text>`;
const note=(z,label,right=true)=>{const ex=right?722:108,tx=right?734:108;return `<path d="M${right?X(39):X(-24)},${Y(z)} H${ex}" fill="none" stroke="#708078" stroke-dasharray="3 3"/>${txt(tx,Y(z)-6,label,15)}`;};
const pad=input.pad,m=input.stem,r=pad.outerDiameter/2,ri=pad.innerDiameter/2,rt=d.throatDiameter/2;
const left=[[-r,0],[r,0],[r,d.padTop],[rt,d.padTop],[rt,d.lipBottom],[ri,d.lipBottom],[ri,pad.floor],[-ri,pad.floor],[-ri,d.lipBottom],[-rt,d.lipBottom],[-rt,d.padTop],[-r,d.padTop]];
let g=poly(left,'#454948');
g+=rect(-20,d.discBottom,40,m.discThickness,'url(#metal)')+rect(-8.5,d.discTop,17,m.collarHeight,'url(#metal)')+rect(-5,d.collarTop,10,m.threadLength,'url(#metal)');
for(let z=d.collarTop;z<d.stemTop;z+=m.threadPitch)g+=`<path d="M${X(-5)},${Y(z)} L${X(5)},${Y(Math.min(z+m.threadPitch/2,d.stemTop))}" stroke="#6f7e76" stroke-width="1"/>`;
for(const sign of [-1,1]){const x=sign<0?-8.5:5;g+=rect(x,d.nutBottom,3.5,input.nut.height,'url(#hatch)');const bx=sign<0?-37.5:5;g+=rect(bx,d.plateBottom,32.5,input.plate.thickness,'url(#hatch)');}
g+=`<path d="M${cx},145 V${y0+35}" stroke="#809184" stroke-dasharray="12 4 2 4"/>`;
g+=note(d.plateTop,`Z ${fmt(d.plateTop)} · 板頂／桿頂`)+note(d.plateBottom,`Z ${fmt(d.plateBottom)} · 板底／帽頂`)+note(d.nutBottom,`Z ${fmt(d.nutBottom)} · 螺帽底`)+txt(672,Y(d.collarTop)-9,`Z ${fmt(d.collarTop)} · 螺紋起點`,15);
const ix=x=>835+(x-17)*24,iz=z=>728-z*24;
const ip=(points,fill)=>`<polygon points="${points.map(([x,z])=>`${ix(x)},${iz(z)}`).join(' ')}" fill="${fill}" stroke="#35493f" stroke-width="1.3"/>`;
g+=ip([[17,0],[r,0],[r,d.padTop],[rt,d.padTop],[rt,d.lipBottom],[ri,d.lipBottom],[ri,pad.floor],[17,pad.floor]],'#454948');
g+=ip([[17,d.discBottom],[20,d.discBottom],[20,d.discTop],[17,d.discTop]],'url(#metal)');
g+=`<path d="M${ix(19)},${iz(d.discTop)} V${iz(d.lipBottom)}" stroke="#b55137" stroke-width="3"/>`;
g+=txt(795,478,'杯墊扣持剖面放大',22)+txt(989,523,'0.5 軸向間隙',16)+txt(989,556,'0.1 徑向重疊',16)+txt(989,630,'承壓盤',17)+txt(989,693,'底厚 3',17);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="930" viewBox="0 0 1200 930"><defs><linearGradient id="metal"><stop stop-color="#b8c2bc"/><stop offset=".42" stop-color="#eef0e9"/><stop offset="1" stop-color="#84988c"/></linearGradient><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e0e5dc"/><path d="M0,8L8,0" stroke="#778878" stroke-width=".7"/></pattern></defs><rect width="1200" height="930" fill="#fffdf6"/><g font-family="Microsoft JhengHei, sans-serif">${txt(50,48,'יהוה',18)}${txt(50,88,'WT01-LF｜同一組尺寸控制四件回裝',30)}${txt(50,121,'作者名義尺寸 · 毫米 · 中央軸剖面示意 · 不代替三維實體與力學驗證',16)}${g}${txt(60,781,'LF02：z 0–9　LF01：z 3–70　LF03：z 50–58　LF04：z 58–70',19)}${txt(60,819,'露出螺紋 = 50 − 8 − 12 = 30 mm；桿頂與板頂齊平。',21)}${txt(60,855,'扣珠底面 8.5 − 承壓盤頂面 (3+5) = 0.5 mm；徑向重疊 0.1 mm。',20)}${txt(60,892,'入口小於承壓盤：裝入需彈性讓位，不能用剛體直穿動畫當成可裝配證據。',17,'#904331')}</g></svg>`;
await fs.writeFile(new URL('materials/generated/GT01-WT01-Foot-Relation-Control-R4.svg',root),svg);
console.log(JSON.stringify({nominalRelations:checks.every(x=>x.pass),oldPadRejected:historical.filter(x=>!x.pass).map(x=>x.id),derived:d,assemblyQualified:false}));
