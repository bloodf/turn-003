import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from kit import *; import props, props2, pickle, traceback, time
WORK=HERE+'/.work'; os.makedirs(WORK,exist_ok=True)
k,n=int(sys.argv[1]),int(sys.argv[2]); only=sys.argv[3:]; out={}
for i,(name,(fn,cat,meta)) in enumerate(props.REG.items()):
    if (only and name not in only) or (not only and i%n!=k): continue
    try:
        t=time.time(); lods=[]
        for low in(False,True):
            LOW[0]=low; q=Asset(name,cat,**dict(meta,tags=list(meta.get('tags',[])))); fn(q); lods+=q.bake(ground=q.meta.get('mount')!='ceil',aorays=20 if low else 40,lodk=.5,lods=(1 if low else 0,))
            if not low: a=q
        out[name]=dict(cat=cat,meta=a.meta,fx=a.fx,light=a.light,lods=lods); 
        print(f"{name}: {len(lods[0]['T'])}/{len(lods[1]['T'])} tris {time.time()-t:.1f}s",flush=True)
        for p in a.parts:
            try: p[0].free()
            except Exception: pass
    except Exception: print('FAIL',name); traceback.print_exc(limit=3)
pickle.dump(out,open(WORK+f'/props_{k}.pkl','wb')); sys.stdout.flush(); os._exit(0)
