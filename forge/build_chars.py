import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from kit import *; import chars, heroes, bestiary, pickle, traceback, time
WORK=HERE+'/.work'; os.makedirs(WORK,exist_ok=True)
k,n=int(sys.argv[1]),int(sys.argv[2]); only=sys.argv[3:]; out={}
for i,(name,(fn,kind,side,meta)) in enumerate(chars.REG.items()):
    if (only and name not in only) or (not only and i%n!=k): continue
    try:
        t=time.time(); a=fn(name); d=a.finish(); d.update(kind=kind,side=side,**{q:v for q,v in meta.items()}); out[name]=d; print(f"{name}: {len(d['lods'][0]['T'])}/{len(d['lods'][1]['T'])} tris {time.time()-t:.1f}s",flush=True)
    except Exception: print('FAIL',name); traceback.print_exc(limit=4)
pickle.dump(out,open(WORK+f'/chars_{k}.pkl','wb')); sys.stdout.flush(); os._exit(0)
