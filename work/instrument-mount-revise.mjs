import fs from 'node:fs/promises';const p='outputs/source/instrument-mount.mjs';let s=await fs.readFile(p,'utf8');s=s.replace("revision='I05-M-R1'","revision='I05-M-R2'");const start=s.indexOf('    const shank=field'),end=s.indexOf("    add('B01'",start);s=s.slice(0,start)+`    // One closed bolt surface; no overlapping cap remains inside the head.
    const headR=x=>3.5-Math.max(0,.15-Math.min(x+338.7,-334.7-x));
    const profile=[],n=96,steps=Math.ceil(20/pitch*20);
    for(let k=0;k<=steps;k++){const x=-358.7+20*k/steps;profile.push([x,a=>Math.min(helicalRadius(x,a),1.7+Math.min(.3,x+358.7))]);}
    for(let k=0;k<=40;k++){const x=-338.7+4*k/40;profile.push([x,()=>headR(x)]);}
    profile.push([-334.7,a=>hexRadius(3,a)],[-336.9,a=>hexRadius(3,a)]);
    const pos=[],indices=[];
    for(const[x,f]of profile)for(let j=0;j<n;j++){const a=tau*j/n,r=f(a);pos.push(r*Math.cos(a),r*Math.sin(a),x);}
    for(let k=0;k<profile.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);}
    for(const k of [0,profile.length-1]){const center=pos.length/3;pos.push(0,0,profile[k][0]);for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n;k?indices.push(a,b,center):indices.push(a,center,b);}}
    const boltGeometry=new T.BufferGeometry();boltGeometry.setAttribute('position',new T.Float32BufferAttribute(pos,3));boltGeometry.setIndex(indices);boltGeometry.computeVertexNormals();xyz(boltGeometry);
`+s.slice(end);s=s.replace('merge([shank,head]),M.bolt','boltGeometry,M.bolt').replaceAll('sideTravelY:25','sideTravelY:24');await fs.writeFile(p,s);let h=await fs.readFile('work/instrument-mount-inspect.mjs','utf8');h=h.replace('k<=25','k<=24').replaceAll('(25-k)','(24-k)');await fs.writeFile('work/instrument-mount-inspect.mjs',h);
