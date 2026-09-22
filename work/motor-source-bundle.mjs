import fs from 'node:fs/promises';
export const motorSourceFiles=['motor-commutator.mjs','motor-winding.mjs','motor-brushes.mjs','motor-brush-carrier.mjs','motor-brush-retainer.mjs','window-motor.mjs'];
export async function motorSourceBundle(){const text=await Promise.all(motorSourceFiles.map(f=>fs.readFile(new URL('../outputs/source/'+f,import.meta.url),'utf8')));return text.map(s=>s.replace(/^import .* from ['"].*motor-(?:commutator|winding|brushes|brush-carrier|brush-retainer)\.mjs['"];?\r?\n/gm,'')).join('\n');}
