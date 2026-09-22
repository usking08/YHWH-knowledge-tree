"""Validate the exact YHWH public teaching tree. No network or credential access."""
from pathlib import Path
import hashlib,json,re,subprocess,sys
root=Path(__file__).resolve().parents[1]
patterns={
 'private_user_path':re.compile(rb'C:(?:[\\/]+)Users(?:[\\/]+)(?!Public(?:[\\/]))',re.I),
 'local_tool_path':re.compile(rb'E:(?:[\\/]+)(?:Codex|AI)(?:[\\/]+)',re.I),
 'private_key':re.compile(rb'BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY'),
 'token':re.compile(rb'\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{32,})\b')}
errors=[];files=[]
for p in root.rglob('*'):
 if '.git' in p.parts:continue
 if p.is_symlink():errors.append([str(p.relative_to(root)),'symlink']);continue
 if not p.is_file():continue
 rel=p.relative_to(root).as_posix()
 if p.suffix.lower() in {'.exe','.dll','.env','.pem','.key'}:errors.append([rel,'forbidden type'])
 if p.stat().st_size>2*1024**3:errors.append([rel,'asset exceeds 2 GiB'])
 b=p.read_bytes()
 for kind,rx in patterns.items():
  if rx.search(b):errors.append([rel,kind])
 if p.suffix=='.json':
  try:json.loads(b)
  except Exception:errors.append([rel,'invalid JSON'])
 files.append({'path':rel,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
for required in ['LICENSE','README.md','THIRD_PARTY.md','CONTRIBUTING.md','outputs/source/THREE-LICENSE.txt']:
 if not (root/required).is_file():errors.append([required,'required file absent'])
readme=(root/'README.md').read_text(encoding='utf-8')
for text in ['יהוה','以利亞修直神的道','未驗證']:
 if text not in readme:errors.append(['README.md','missing disclosure or requested title'])
if '--git-index' in sys.argv:
 r=subprocess.run(['git','-C',str(root),'ls-files','-s'],text=True,capture_output=True,check=True)
 for line in r.stdout.splitlines():
  info,name=line.split('\t',1);mode,sha,stage=info.split()
  if mode not in ['100644','100755']:errors.append([name,'non-regular index entry']);continue
  b=subprocess.run(['git','-C',str(root),'cat-file','blob',sha],capture_output=True,check=True).stdout
  if b!=(root/name).read_bytes():errors.append([name,'index differs from validated file'])
result={'pass':not errors,'files':len(files),'bytes':sum(f['bytes'] for f in files),'errors':errors,'scope':'Public-file privacy, types, JSON integrity and stated redistribution notices; not a manufacturing or visual quality certification.'}
print(json.dumps(result,ensure_ascii=False))
sys.exit(0 if not errors else 1)
