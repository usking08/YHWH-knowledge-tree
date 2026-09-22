// The same per-component paths are consumed by the reader and native checks.
export const GT01_HANDLE_STEPS=[
 {id:'D11-P02',name:'01 放置空心盒體',note:'以盒體為定位基準。',path:'fixed'},
 {id:'D11-P11a',name:'02 裝入下軸套',note:'從前方進入，底端貼合盒體下壁。',path:'front',distance:24},
 {id:'D11-P04',name:'03 套入回位彈簧',note:'先從前方進入，再下降套住下軸套；下腳貼住盒體支點。',path:'front-then-down',distance:38,lift:8},
 {id:'D11-P05a',name:'04 裝入拉索撥臂',note:'從前方進入，再下降到下軸套；接觸塊的 X=-49.95 接面貼住上彈簧腳的負 X 側。',path:'front-then-down',distance:38,lift:8},
 {id:'D11-P01',name:'05 嵌入把手 D 形接面',note:'把手先抬高 1.2 從前方送入，再下降進入 D 形凹座。',path:'front-then-down',distance:28,lift:1.2},
 {id:'D11-P11b',name:'06 裝入上軸套',note:'由上方穿過盒體上孔，直到下端接觸把手座；頂端與盒體上表面齊平。',path:'above',distance:14},
 {id:'D11-P03',name:'07 穿入肩銷',note:'沿垂直軸，依序穿過上壁、軸套、把手、撥臂與下壁。',path:'above',distance:46},
 {id:'D11-P10',name:'08 套上下止推墊圈',note:'從下方沿肩銷套入，到盒體下承壓面。',path:'below',distance:12},
 {id:'D11-P09',name:'09 查看扣環定位',note:'顯示槽內定位；扣環彈性張開與卡入路徑尚未驗證。',path:'placement-only'},
 {id:'D11-P06',name:'10 貼合周界密封墊',note:'從前方套過面板，中央開口與固定孔對齊盒體。',path:'front',distance:16}
];
export function applyGT01HandleAssemblyStep(T,model,index,progress=1){
 const n=Math.max(0,Math.min(GT01_HANDLE_STEPS.length-1,index)),t=Math.max(0,Math.min(1,progress)),step=GT01_HANDLE_STEPS[n],installed=new Set(GT01_HANDLE_STEPS.slice(0,n+1).map(s=>s.id));
 for(const p of model.parts){p.visible=installed.has(p.userData.id);p.position.set(0,0,0);p.rotation.set(0,0,0);}
 const part=model.parts.find(p=>p.userData.id===step.id);
 if(step.path==='front')part.position.y=step.distance*(1-t);
 if(step.path==='above')part.position.z=step.distance*(1-t);
 if(step.path==='below')part.position.z=-step.distance*(1-t);
 if(step.path==='front-then-down'){part.position.y=step.distance*Math.max(0,1-t/.65);part.position.z=step.lift*(t<=.65?1:(1-t)/.35);}
 model.root.updateMatrixWorld(true);return{index:n,progress:t,part:step.id,path:step.path,position:part.position.toArray(),name:step.name,note:step.note,assemblyComplete:false};
}

