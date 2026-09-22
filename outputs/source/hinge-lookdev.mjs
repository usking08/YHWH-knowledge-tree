// GT01 authored finishes; geometry and mechanical clearance are owned by the construction modules.
export function applyGT01HingeFinishes(T, assembly) {
  const changed=[];
  for(const mesh of assembly.parts){
    const id=mesh.userData.id,sub=mesh.userData.subPart;
    if(!id.startsWith('I03-HF-')&&!['I03-P05','I03-P16','I03-P19','I03-P20'].includes(sub))continue;
    const metal=id.startsWith('I03-HF-')||['I03-P19','I03-P20'].includes(sub);
    const shim=sub==='I03-HF-F03';
    const m=new T.MeshPhysicalMaterial({color:metal?(shim?0x969792:0xadb3b7):0x272b2a,metalness:metal?1:0,roughness:metal?(shim?.40:.35):.46,clearcoat:metal?0:.16,clearcoatRoughness:.4,envMapIntensity:metal?1:.7});
    m.name=metal?'GT01 · fine satin steel':'GT01 · charcoal micrograin polymer';
    m.userData={finishReference:'references/I03-HF-material-study-r1.png',finishType:metal?'satin-steel':'micrograin-polymer',scaleUnit:'mm',qualified:false};
    // Object-space millimetres: grain moves with the actual part, without stretched or missing UVs.
    m.onBeforeCompile=s=>{
      s.vertexShader='varying vec3 vGTFinishPosition;\n'+s.vertexShader;
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGTFinishPosition=position;');
      s.fragmentShader='varying vec3 vGTFinishPosition;\nfloat gtHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}\n'+s.fragmentShader;
      s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        vec3 fp=vGTFinishPosition;
        float footprint=max(length(dFdx(fp)),length(dFdy(fp)));
        float microFade=1.0-smoothstep(0.015,0.12,footprint);
        float grain=gtHash(floor(fp*30.0));
        float phase=fp.y*190.0+sin(fp.x*0.35)*0.3;
        float line=sin(phase)*(1.0-smoothstep(0.5,2.5,fwidth(phase)));
        roughnessFactor=clamp(roughnessFactor+microFade*(${metal?'0.012*line+0.015*(grain-.5)':'0.045*(grain-.5)'}),.18,.65);`);
    };
    m.customProgramCacheKey=()=>metal?'GT01-satin-mm-r1':'GT01-polymer-mm-r1';
    // Smooth only coincident corners whose face normals agree within 30 degrees.
    // Hole rims and socket walls keep their hard edges; no position/index changes.
    const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal;
    if(p&&n){const buckets=new Map(),original=Float32Array.from(n.array);for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}for(const indices of buckets.values())for(const i of indices){const a=new T.Vector3(original[i*3],original[i*3+1],original[i*3+2]),sum=new T.Vector3();for(const j of indices){const b=new T.Vector3(original[j*3],original[j*3+1],original[j*3+2]);if(a.dot(b)>.8660254)sum.add(b);}if(sum.lengthSq()>0){sum.normalize();n.setXYZ(i,sum.x,sum.y,sum.z);}}n.needsUpdate=true;}
    mesh.material=m;mesh.castShadow=true;mesh.receiveShadow=true;changed.push(id);
  }
  assembly.definition.finishStudy={revision:'HINGE-FINISH-R1',reference:'references/I03-HF-material-study-r1.png',changed,scope:'Authored optical appearance; no material grade or mechanical certification.'};
  return assembly;
}

export function createGT01HingeStudio(T,renderer,scene){
  for(const o of [...scene.children])if(o.isLight){scene.remove(o);if(o.target)scene.remove(o.target);}
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  scene.background=new T.Color(0xe9e7e1);const hemisphere=new T.HemisphereLight(0xf5f1e9,0xb0b6bc,1.05);hemisphere.position.set(0,0,1);scene.add(hemisphere);
  const env=new T.Scene();env.background=new T.Color(.16,.18,.2);
  const cards=[[[0,150,300],[420,95],[5.0,4.7,4.25]],[[220,-140,80],[160,340],[2.7,3.1,3.5]],[[-200,0,90],[90,280],[1.9,2.0,2.15]],[[0,-250,-80],[260,130],[.3,.32,.34]]];
  for(const [pos,size,rgb]of cards){const card=new T.Mesh(new T.PlaneGeometry(...size),new T.MeshBasicMaterial({color:new T.Color(...rgb),side:T.DoubleSide}));card.position.set(...pos);card.lookAt(0,0,0);env.add(card);}
  const pmrem=new T.PMREMGenerator(renderer),map=pmrem.fromScene(env,.045,1,1200);scene.environment=map.texture;
  env.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pmrem.dispose();
  const key=new T.DirectionalLight(0xfff3de,2.1);key.position.set(465,-105,535);key.target.position.set(430,-57,450);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:210});key.shadow.bias=-.00018;key.shadow.normalBias=.045;key.shadow.radius=2;scene.add(key,key.target);
  const fill=new T.DirectionalLight(0xdce8ff,.75);fill.position.set(350,60,500);fill.target.position.set(430,-57,452);scene.add(fill,fill.target);
  const underside=new T.DirectionalLight(0xe6edf4,1.35);underside.position.set(470,-95,365);underside.target.position.set(430,-57,452);scene.add(underside,underside.target);
  return {environment:map,dispose(){map.dispose();key.shadow.map?.dispose();}};
}
