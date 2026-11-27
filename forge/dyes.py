"""Pale versions of fur and leather, so hair and dyed hide can take any colour."""
from PIL import Image; import numpy as np, json, shutil, os
T=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public','tex'); L=json.load(open(T+'/layers.json')); names=[l['name'] for l in L]
def mk(src,dst,target,con):
    a=np.asarray(Image.open(f'{T}/{src}.c.webp').convert('RGB'),float)/255; lin=a*a; g=lin.mean(2); g=g/g.mean(); g=np.clip(target*(1+(g-1)*con),.02,.98); Image.fromarray((np.sqrt(np.repeat(g[:,:,None],3,2))*255+.5).astype(np.uint8)).save(f'{T}/{dst}.c.webp',quality=90,method=6); shutil.copy(f'{T}/{src}.d.webp',f'{T}/{dst}.d.webp')
    if dst not in names: L.append({**next(l for l in L if l['name']==src),'name':dst}); names.append(dst)
mk('fur','hair',.52,.75); mk('leather','hide',.5,.6); json.dump(L,open(T+'/layers.json','w')); out={}
for l in L:
    f=f"{T}/{l['name']}.c.webp"
    if os.path.exists(f): a=np.asarray(Image.open(f).convert('RGB').resize((64,64)),float)/255; out[l['name']]=[round(float(v),3) for v in (a*a).mean((0,1))]
json.dump(out,open(T+'/avg.json','w')); print(len(L),out['hair'],out['hide'])

lo=Image.open(T+'/lo/fur.c.webp').size
for a,b in(('fur','hair'),('leather','hide')): Image.open(f'{T}/{b}.c.webp').resize(lo,Image.LANCZOS).save(f'{T}/lo/{b}.c.webp',quality=88,method=6); shutil.copy(f'{T}/lo/{a}.d.webp',f'{T}/lo/{b}.d.webp')
