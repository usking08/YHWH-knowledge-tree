// Portable native reader. This file is copied beside geometry-core.mjs.
// No external packages: Node handles files; the existing Three.js host owns geometry.
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {T,readOBJ,inspect,rayDistances,fastenerFrame,sha} from './geometry-core.mjs';
import {makeGT01DoorHandleReturn} from './source/door-handle-return.mjs';

const TAU=2*Math.PI;
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const norm=a=>Math.hypot(...a);
const near=(a,b,t)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=t;
export function radialClearance(hole,shaft,eccentricity=0){
 if(![hole,shaft,eccentricity].every(Number.isFinite)||hole<=0||shaft<=0||eccentricity<0)throw Error('Positive diameters and nonnegative eccentricity required');
 return(hole-shaft)/2-eccentricity;
}
export function threadAdvance(pitch,angleRadians){
 if(!Number.isFinite(pitch)||pitch<=0||!Number.isFinite(angleRadians))throw Error('Positive pitch and finite radians required');
 return-pitch*angleRadians/TAU;
}
export function topology(t){
 const keys=new Map(),links=[],edges=new Map();
 const id=p=>{const k=p.map(x=>Math.round(x*1e5)).join(',');if(!keys.has(k)){keys.set(k,keys.size);links.push([]);}return keys.get(k);};
 for(let i=0;i<t.points.length;i+=9){const v=[0,3,6].map(j=>id(t.points.slice(i+j,i+j+3)));for(let k=0;k<3;k++){const a=v[k],b=v[(k+1)%3],c=v[(k+2)%3];links[a].push([b,c]);const key=a<b?a+':'+b:b+':'+a;if(!edges.has(key))edges.set(key,[]);edges.get(key).push(a<b?1:-1);}}
 let badVertexLinks=0;
 for(const es of links){const adj=new Map();for(const [a,b]of es){if(!adj.has(a))adj.set(a,[]);if(!adj.has(b))adj.set(b,[]);adj.get(a).push(b);adj.get(b).push(a);}const seen=new Set(),todo=[adj.keys().next().value];while(todo.length){const a=todo.pop();if(seen.has(a))continue;seen.add(a);for(const b of adj.get(a)||[])if(!seen.has(b))todo.push(b);}if([...adj.values()].some(v=>v.length!==2)||seen.size!==adj.size)badVertexLinks++;}
 return{vertices:keys.size,edges:edges.size,faces:t.points.length/9,eulerCharacteristic:keys.size-edges.size+t.points.length/9,badEdgeIncidence:[...edges.values()].filter(e=>e.length!==2).length,badOrientedEdges:[...edges.values()].filter(e=>e.length===2&&e[0]+e[1]!==0).length,badVertexLinks,weldGridMm:1e-5,selfIntersectionExamined:false};
}
function algebraicVolume(points,origin=[0,0,0]){let v=0;for(let i=0;i<points.length;i+=9){const a=sub(points.slice(i,i+3),origin),b=sub(points.slice(i+3,i+6),origin),c=sub(points.slice(i+6,i+9),origin);v+=dot(a,cross(b,c))/6;}return v;}
function radialHits(t,z,n=48){return Array.from({length:n},(_,i)=>rayDistances(t,[-46,-10,z],[Math.cos((i+.5)*TAU/n),Math.sin((i+.5)*TAU/n),0]));}
function circularSagBound(t,r){const keys=new Map();for(let i=0;i<t.points.length;i+=3){const x=t.points[i]+46,y=t.points[i+1]+10;if(Math.abs(Math.hypot(x,y)-r)<1e-4){const a=(Math.atan2(y,x)+TAU)%TAU;keys.set(Math.round(a*1e5),a);}}const angles=[...keys.values()].sort((a,b)=>a-b);if(angles.length<12)throw Error('Circular boundary not observed');let maxGap=0;for(let i=0;i<angles.length;i++)maxGap=Math.max(maxGap,(angles[(i+1)%angles.length]+(i===angles.length-1?TAU:0))-angles[i]);return{vertices:angles.length,maxAngularGapRadians:maxGap,maxSagMm:r*(1-Math.cos(maxGap/2))};}
const check=(id,title,pass,formula,inputs,result,acceptance,method,meaning,nextAction)=>({id,title,status:pass?'PASS':'FAIL',formula,inputs,result,acceptance,method,meaning,nextAction});
const need=(id,title,formula,inputs,missing,meaning,nextAction)=>({id,title,status:'NEEDS_INPUT',formula,inputs,result:{missingInputs:missing},acceptance:'真實輸入齊全、模型前提成立並取得對應讀回，才可判定。',method:'目前資料庫欄位與物理模型前提核對；沒有代填材料或载荷。'.replace('载','載'),meaning,nextAction});
export async function computeMath(root=fileURLToPath(new URL('../',import.meta.url))){
 const catalog=JSON.parse(await fs.readFile(path.join(root,'catalog.json'),'utf8')),parts=[],byId=new Map(),bindings={};
 const sourceManifest=JSON.parse(await fs.readFile(path.join(root,'native/source-bindings.json'),'utf8'));for(const [file,digest]of Object.entries(sourceManifest.sources)){const actual=sha(await fs.readFile(path.join(root,'native/source',file)));if(actual!==digest)throw Error('Native source changed; rebuild and rebind before claiming current evidence: '+file);}
 for(const c of catalog.parts){const obj=await fs.readFile(path.join(root,c.obj)),meta=JSON.parse(await fs.readFile(path.join(root,c.metadata),'utf8')),t=readOBJ(obj.toString()),m=inspect(t),top=topology(t);bindings[c.id]={objSHA256:sha(obj),positionTriangleSHA256:m.positionTriangleSHA256};byId.set(c.id,{t,m,meta});
  const center=m.boundsMm.min.map((v,i)=>(v+m.boundsMm.max[i])/2),v0=algebraicVolume(t.points),vc=algebraicVolume(t.points,center);
  const checks=[check('closed-boundary','封閉、有向與頂點鄰域',top.badEdgeIncidence===0&&top.badOrientedEdges===0&&top.badVertexLinks===0&&m.connectedComponents===1&&!m.zeroAreaTriangles&&!m.nonFiniteCoordinates,'每條邊恰有兩個反向面；每個頂點的 link 是一個環。',{weldGridMm:1e-5},top,'邊、面方向、頂點鄰域異常均為 0；一個連通體。','逐一讀取 OBJ 的全部三角面與頂點鄰接。','排除破口、反面和只在單點相接的假實體；不宣稱已檢查所有自交。','回到原生幾何修補相鄰面；不可只刪除失敗報告。'),check('volume-origin','體積積分與基準點不變性',v0>0&&near(v0,vc,Math.max(1e-7,Math.abs(vc)*1e-8)),'V = Σ (a−o)·[(b−o)×(c−o)] / 6',{originA:[0,0,0],originB:center,unit:'mm'}, {signedVolumeMm3:vc,originDifferenceMm3:Math.abs(v0-vc)},'正的代數體積；兩個基準點之差 ≤ max(10⁻⁷ mm³, |V|×10⁻⁸)。','兩次獨立基準的逐三角面積分。','成立於封閉有向邊界；自交未全驗時，只稱代數體積。數值門檻不是加工公差。','核對面方向、漏面、座標尺度與浮點誤差。')];
  checks.push(check('identity-units','讀回綁定同一零件與單位',sha(obj)===meta.hashes.objSHA256&&m.positionTriangleSHA256===meta.hashes.positionTriangleSHA256&&meta.units==='mm'&&meta.coordinateFrame.units==='mm','原生→OBJ 的三角位置身分相同；全程長度單位 mm。',{id:c.id,sourceSHA256:meta.hashes.sourceSHA256}, {objSHA256:sha(obj),positionTriangleSHA256:m.positionTriangleSHA256,units:meta.units,frameUnits:meta.coordinateFrame.units},'目前 OBJ 與逐件宣告的內容一致；所有原生來源亦與 source-bindings.json 相符。','實際讀取檔案、全部位置與來源位元組；不以檔名相同作判定。','公式結果必須綁定被檢查的那個修訂，單位不能漂移。','來源改變後重建/重驗全部相依消費端；不可沿用舊報告。'));
  const a=meta.coordinateFrame.threadAxis?Math.atan(.55):0,R=[[1,0,0],[0,Math.cos(a),-Math.sin(a)],[0,Math.sin(a),Math.cos(a)]],p=t.points.slice(0,3),q=t.points.slice(9,12),translation=meta.coordinateFrame.threadAxis?[0,-45,69]:[0,0,0],apply=x=>R.map((row,i)=>dot(row,x)+translation[i]),distError=Math.abs(norm(sub(p,q))-norm(sub(apply(p),apply(q))));
  checks.push(check('rigid-frame','座標旋轉不改變零件尺寸',distError<1e-10,'x′=Rx+t；RᵀR=I、det R=+1 ⇒ |x′−y′|=|x−y|',{angleRadians:a,translationMm:translation}, {sampledDistanceErrorMm:distError,placementFrame:meta.coordinateFrame},'來源所用右手旋轉；已讀兩個實際 OBJ 點的距離誤差 <10⁻¹⁰ mm。','以來源框架的正交旋轉恆等式與原生點對做算術讀回；沒有替所有安裝姿態背書。','匯入保持 mm 與右手座標；展示位移不改寫接面。','修正單位、鏡射或非均勻縮放；再檢查完整接面與安裝路徑。'));
  parts.push({id:c.id,name:c.name,purpose:meta.purpose,checks,lawIds:['boundary','volume','rigid','units'],openInputs:[]});
 }
 const part=id=>{const p=parts.find(p=>p.id===id);if(!p)throw Error('Missing math model '+id);return p;};
 const add=(ids,law,c)=>{for(const id of ids){const p=part(id);if(!p.lawIds.includes(law))p.lawIds.push(law);p.checks.push(c);}};
 const fits=[['D11-P01','D11-P03',0,4.1,4],['D11-P11a','D11-P03',-10,4.2,4],['D11-P11b','D11-P03',10,4.2,4],['D11-P05a','D11-P03',-4,4.2,4],['D11-P10','D11-P03',-18.25,4.2,4],['D11-P02','D11-P11b',16,5.7,5.5]];
 for(const [holeId,shaftId,z,D,d]of fits){const holes=radialHits(byId.get(holeId).t,z),shafts=radialHits(byId.get(shaftId).t,z),gaps=holes.map((h,i)=>h[0]-shafts[i][shaftId==='D11-P11b'?1:0]),nominal=radialClearance(D,d),min=Math.min(...gaps),max=Math.max(...gaps),holeSag=circularSagBound(byId.get(holeId).t,D/2),shaftSag=circularSagBound(byId.get(shaftId).t,d/2),numericalMm=1e-5,pass=gaps.every(Number.isFinite)&&min>0&&min>=nominal-holeSag.maxSagMm-numericalMm&&max<=nominal+shaftSag.maxSagMm+numericalMm;
  add([holeId,shaftId],'fit',check('fit-'+holeId+'-'+shaftId,'孔軸截面：'+holeId+'／'+shaftId,pass,'c=(D−d)/2；弦高界 s=R[1−cos(Δα_max/2)]',{holeDiameterMm:D,shaftDiameterMm:d,axis:[-46,-10],zMm:z,nominalEccentricityMm:0},{nominalRadialGapMm:nominal,sampledMinGapMm:min,sampledMaxGapMm:max,rays:48,holePolygon:holeSag,shaftPolygon:shaftSag,coordinateNumericalAllowanceMm:numericalMm},'本截面 48 個射線間隙皆 >0；c−s孔−ε ≤ 間隙 ≤ c+s軸+ε；ε=10⁻⁵ mm 為座標數值容差。','從兩件真實三角面求交；由圓周頂點最大夾角推導弦高誤差界，中空軸套取第二交點作外徑。','此截面能相配；多邊形近似誤差由幾何推導。完整倒角、全路徑、公差及偏心仍各有條件。','若為負間隙先修共同輪廓；超過弦高界則查軸心、形狀與讀回。不能以名義直徑覆蓋倒角干涉。'));
 }
 for(const [id,ro,ri,z,L]of [['D11-P11a',2.75,2.1,-14.5,8.5],['D11-P11b',2.75,2.1,7,11],['D11-P10',3.5,2.1,-18.5,.5]]){
  const {t,m}=byId.get(id),angles=new Set();for(let i=0;i<t.points.length;i+=3){const x=t.points[i]+46,y=t.points[i+1]+10;if(Math.abs(t.points[i+2]-z)<1e-4&&Math.abs(Math.hypot(x,y)-ro)<1e-4)angles.add(Math.round(Math.atan2(y,x)*1e5));}const n=angles.size,ideal=Math.PI*(ro*ro-ri*ri)*L,polygon=n/2*Math.sin(TAU/n)*(ro*ro-ri*ri)*L,error=Math.abs(m.signedVolumeMm3-polygon);
  add([id],'annulus',check('annulus','環形截面與網格近似量',n>=24&&error<.002,'V_circle=π(Ro²−Ri²)L；V_polygon=(n/2)sin(2π/n)(Ro²−Ri²)L',{outerRadiusMm:ro,innerRadiusMm:ri,lengthMm:L},{observedSides:n,idealVolumeMm3:ideal,polygonVolumeMm3:polygon,meshVolumeMm3:m.signedVolumeMm3,numericalErrorMm3:error,polygonDeficitPercent:(1-polygon/ideal)*100},'讀回實際分段数且網格積分與多邊形公式差 <0.002 mm³。'.replace('数','數'),'由端面頂點讀取分段數；比對解析多邊形體積與全部網格積分。','圓形解析體積和有限面網格有可計算差異，不把兩者當完全相同。','核對半徑、長度、缺面及分段數；精度不足則增加原生曲面細分。'));
 }
 const pin=byId.get('D11-P03'),profile=[[-20,0],[-20,1.7],[-19.7,2],[-19.2,2],[-19.2,1.6],[-18.5,1.6],[-18.5,2],[18,2],[18,3.5],[19.6,3.5],[20,3.1],[20,0]];let pinVolume=0;for(let i=1;i<profile.length;i++){const [z0,r0]=profile[i-1],[z1,r1]=profile[i];pinVolume+=Math.PI*(z1-z0)*(r0*r0+r0*r1+r1*r1)/3;}const pinPolygon=pinVolume*96*Math.sin(TAU/96)/TAU;
 add(['D11-P03'],'annulus',check('pin-profile','肩銷逐段圓臺積分',near(pin.m.signedVolumeMm3,pinPolygon,.003),'V_frustum=πh(r1²+r1r2+r2²)/3',{profileZR_mm:profile,sides:96},{idealVolumeMm3:pinVolume,polygonVolumeMm3:pinPolygon,meshVolumeMm3:pin.m.signedVolumeMm3},'完整輪廓積分差 <0.003 mm³。','將軸身、扣槽、肩部、倒角分段積分，與 OBJ 封閉網格比對。','保留每一段輪廓，避免只用 Ø4×長度替代真正肩銷。','逐段定位差異，重讀肩部孔口的剖面。'));
 const rest=makeGT01DoorHandleReturn(T,0).find(c=>c.id==='D11-P04').interfaces,idealLength=Math.hypot(TAU*3.6*6.5,5.1),poses=[0,10,20,30].map(deg=>{const c=makeGT01DoorHandleReturn(T,deg*Math.PI/180).find(c=>c.id==='D11-P04').interfaces;return{angleDegrees:deg,lengthMm:c.coilCentrelineLength,radialAdjustmentMm:c.radialAdjustment,errorMm:c.coilCentrelineLength-rest.restCoilCentrelineLength};});
 add(['D11-P04'],'helix',check('spring-length','螺旋弧長與變形保長讀回',poses.every(p=>Math.abs(p.errorMm)<1e-7)&&Math.abs(idealLength-rest.restCoilCentrelineLength)<.03,'L=√[(2πRN)²+H²]；折線長=Σ|p(i+1)−p(i)|',{meanRadiusMm:3.6,turns:6.5,heightMm:5.1,legLengthEachMm:13,coilSegments:624},{idealCoilLengthMm:idealLength,meshConstructionCoilLengthMm:rest.restCoilCentrelineLength,polylineTotalWithLegsMm:rest.restCoilCentrelineLength+26,poses,axialPitchMinusWireMm:5.1/6.5-.7},'四個原生變形狀態的折線長差 <10⁻⁷ mm；休止弧長近似誤差 <0.03 mm。','呼叫目前原生彈簧工法，讀回同一模型的中心線；解析螺旋弧長獨立對照。','只驗幾何保長。軸向節距減線徑不是最近三維圈間距；保長不是回復力模型。','弧長錯則修中心線；剛度與預壓由材料/試驗補入，不能用縮半徑動畫假裝已算受力。'));
 add(['D11-P04'],'elastic',need('spring-force','回位力矩與疲勞','M=kθ+M₀；U=½kθ²（線性區）',{testedShapeAnglesDeg:[0,10,20,30]},['k (N·mm/rad)','預壓 M₀ (N·mm)','材料 E、屈服、疲勞資料及端部拘束'],'扭簧線材主要受彎曲；不可套用直桿受扭的 GJ/L 當本件剛度。','指定材料與工作力矩/循環，建立含端腳的彎曲模型，量測力矩–角度曲線及永久變形。'));
 const axes=byId.get('D11-P05a').meta.holeAxes,pivot=axes.find(h=>h.kind==='through_bore').origin,eye=axes.find(h=>h.kind==='slotted_eye').origin,arm=sub(eye,pivot);
 add(['D11-P01','D11-P05a'],'moment',check('moment-arm','撥臂力矩係數與方向',near(arm[0],18,1e-6)&&near(arm[1],0,1e-6)&&near(arm[2],0,1e-6),'M_z=r_xF_y−r_yF_x',{pivotMm:pivot,cableEyeMm:eye},{armMm:arm,coefficientForFyMm:arm[0],coefficientForFxMm:-arm[1],interpretation:'M_z/(N·mm)=18×F_y/N；這是每單位力的比例，沒有假定實際拉力。'},'兩個作者設計孔軸相距 18 mm；載荷留作符號量。','讀取零件的設計孔軸；套用叉積定義，不把 18F 用於任意方向。','改變鋼索方向或接點，力矩係數也必須重算。','由實際拉索路由取得力向量，再做平衡及接觸讀回。'));
 const gasket=byId.get('D11-P06'),thickness=gasket.m.boundsMm.size[1];add(['D11-P06'],'seal',check('gasket-thickness','密封墊原始厚度',near(thickness,1,1e-6),'ε_c=(t₀−t)/t₀',{freeThicknessMm:1},{readbackFreeThicknessMm:thickness,installedThicknessMm:null,compressionStrain:null},'原生自由厚度為 1 mm；裝入壓縮量不得由自由形體推定。','由 OBJ 全部頂點的 Y 範圍讀取。','外觀材質不能代替橡膠壓縮曲線與實際槽隙。','建立門皮/座面與壓縮後厚度，再以材料曲線求面壓並檢查擠出。'));
 const clip=byId.get('D11-P09').m.boundsMm,clipGap=.7-clip.size[2];add(['D11-P09','D11-P03'],'retention',check('clip-groove','扣環與槽寬的軸向包容',clip.min[2]>=-19.2-1e-5&&clip.max[2]<=-18.5+1e-5,'g_axial=(z槽上−z槽下)−t扣環',{grooveZmm:[-19.2,-18.5]},{clipZmm:[clip.min[2],clip.max[2]],clipThicknessMm:clip.size[2],totalAxialGapMm:clipGap},'整片扣環的 Z 包絡留在扣槽中。','直接讀取扣環 OBJ 的軸向極值。','只證明放置包容，沒有證明張開卡入、拔出力或軸向承载。'.replace('载','載'),'以真實開口、卡入位移與材料模型建立彈性插入，再查殘留變形及保持力。'));
 const axis=[0,Math.cos(Math.atan(.55)),Math.sin(Math.atan(.55))],radial=a=>[Math.cos(a),-axis[2]*Math.sin(a),axis[1]*Math.sin(a)],threadRows=[];
 for(const id of ['D05-P15d','D05-P15e']){const t=byId.get(id).t,rows=[];for(const deg of[0,30,60,90,180,270,360]){const angle=deg*Math.PI/180,y=threadAdvance(.8,angle),actual=rayDistances(t,fastenerFrame(y),radial(angle))[0],base=rayDistances(t,fastenerFrame(0),radial(0))[0];rows.push({degrees:deg,advanceMm:y,radialSurfaceMm:actual,baseRadiusMm:base,phaseErrorMm:actual-base});}threadRows.push({id,rows});add([id],'screw',check('screw-phase','螺距、轉角與螺旋相位',rows.every(r=>Number.isFinite(r.phaseErrorMm)&&Math.abs(r.phaseErrorMm)<.025),'phase=y/p+α/(2π)；Δy=−pΔα/(2π)',{pitchMm:.8,axis,handednessScope:'本件原生來源的 y/α 慣例；不泛化其他螺紋。'},{samples:rows},'七個相位等價位置的實體射線半徑差 <0.025 mm（網格讀回門檻）。','移動射線座標沿目前實際傾斜軸，交於 OBJ 三角面；無替換圓柱。','90° 對應 −0.2 mm；反轉符號會造成螺紋錯相。相位通過不代表牙側承載通過。','修正座標、旋轉方向、螺距及起牙相位，再檢查完整旋入與工具空間。'));}
 const applied=new Set(['D11-P01','D11-P02','D11-P03','D11-P04','D11-P05a','D11-P06','D11-P09','D11-P10','D11-P11a','D11-P11b','D05-P15d','D05-P15e']);
 for(const p of parts){if(!applied.has(p.id))throw Error('New part needs a functional mathematical model: '+p.id);const material=byId.get(p.id).meta.material;
  const missing=p.id==='D11-P06'?['壓縮後槽隙 (mm)','材料壓縮曲線 (MPa)','溫度/老化條件']:p.id==='D11-P09'?['卡入張開量 (mm)','材料彈塑性曲線 (MPa)','保持載荷 (N)']:['載荷大小/方向/循環 (N, N·mm)','材料牌號、強度與製程','公差極限及偏心 (mm)'];
  const quantities={
   '載荷大小/方向/循環 (N, N·mm)':[{quantity:'force',unit:'N'},{quantity:'moment',unit:'N·mm'},{quantity:'direction',unit:'1（單位方向向量）'},{quantity:'cycles',unit:'1（次數）'}],
   '公差極限及偏心 (mm)':[{quantity:'length',unit:'mm'}],
   '壓縮後槽隙 (mm)':[{quantity:'length',unit:'mm'}],
   '卡入張開量 (mm)':[{quantity:'length',unit:'mm'}],
   '材料壓縮曲線 (MPa)':[{quantity:'stress',unit:'MPa'},{quantity:'strain',unit:'1'}],
   '材料彈塑性曲線 (MPa)':[{quantity:'stress',unit:'MPa'},{quantity:'strain',unit:'1'}],
   '保持載荷 (N)':[{quantity:'force',unit:'N'}]
  };
  p.openInputs=missing.map(name=>({name,quantities:quantities[name]||[],unit:quantities[name]?.map(q=>q.unit).join('；')||'依具體資料欄位與來源指定',reason:'現有原生形體和外觀資料不含此實測輸入。',nextAction:'在接面與使用條件確定後取得可追溯資料，填入並重算對應載荷/配合模型。'}));
  p.lawIds.push('load');p.checks.push(need('load-release','材料、公差與承載判定','ΣF=0、ΣM=0；σ_avg=F/A；τ_avg=V/A（適用截面）',{materialGrade:material.grade},missing,'平均應力只是初步模型；孔口、槽、螺紋、接觸邊緣需另查應力集中與失效模式。','先固定工況與材料，建立受力路徑及許用值，再以計算/量測驗證。禁止由顏色或正體積推得承載合格。'));
  if(p.id!=='D11-P04')p.checks.push(need('tolerance-release','極限公差與實際装入'.replace('装','裝'),'c_min=(D_min−d_max)/2−e；包含倒角、全路徑與工具掃掠',{sampledNominalGeometry:true},['各接面上下限','相對軸線偏心/傾斜','完整安裝及工具路徑'],'名義截面和離散路徑讀回各自有效，不能合併推成所有狀態無干涉。','由宿主極限尺寸展開最壞情況，再查整個裝入/拆出過程及保持件釋放。'));
 }
 const all=parts.flatMap(p=>p.checks),summary={parts:parts.length,checks:all.length,pass:all.filter(c=>c.status==='PASS').length,fail:all.filter(c=>c.status==='FAIL').length,needsInput:all.filter(c=>c.status==='NEEDS_INPUT').length};
 return{revision:'GT01-MATH-QA-R1',scope:'十二件現有原生零件的可重跑數學讀回；所有門檻為本計算的數值準則，未代替製造公差、材料試驗或整車放行。',bindings,sourceBindings:sourceManifest.sources,parts,summary};
}
export function counterexamples(){
 const t={points:[0,0,0,0,1,0,1,0,0, 0,0,0,1,0,0,0,0,1, 0,0,0,0,0,1,0,1,0, 1,0,0,0,1,0,0,0,1]};
 const open={points:t.points.slice(9)},reversed={points:[...t.points.slice(0,3),...t.points.slice(6,9),...t.points.slice(3,6),...t.points.slice(9)]};
 const touching={points:[...t.points,...t.points.map(x=>-x)]};
 return[{id:'missing-face',caught:topology(open).badEdgeIncidence>0},{id:'reversed-face',caught:topology(reversed).badOrientedEdges>0},{id:'two-solids-touching-at-one-vertex',caught:topology(touching).badVertexLinks===1&&topology(touching).badEdgeIncidence===0},{id:'interference',caught:radialClearance(4,4.2)<0},{id:'eccentricity-consumes-clearance',caught:radialClearance(4.2,4,.11)<0},{id:'wrong-thread-sign',caught:Math.abs(threadAdvance(.8,Math.PI/2)-.2)>.39},{id:'reference-closed-tetrahedron',caught:topology(t).badEdgeIncidence===0&&topology(t).badVertexLinks===0&&near(algebraicVolume(t.points),1/6,1e-14)}];
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await computeMath(),mutations=counterexamples();
 if(process.argv.includes('--write'))await fs.writeFile(new URL('../evidence/math-native-readback.json',import.meta.url),JSON.stringify({...result,counterexamples:mutations},null,2));
 console.log(JSON.stringify({...result.summary,counterexamples:mutations,manufacturingReleased:false}));
 if(result.summary.fail||mutations.some(x=>!x.caught))process.exitCode=1;
}
