import pickle,glob,json,gzip,numpy as np,os,sys
SC=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'.work'); OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public','assets'); db={}
for f in sorted(glob.glob(SC+'/chars_*.pkl')): db.update(pickle.load(open(f,'rb')))
order=dict(hero=0,folk=1,foe=2,beast=3,part=4); names=sorted(db,key=lambda n:(order[db[n]['kind']],n)); man=[]; total=0; os.makedirs(OUT+'/c',exist_ok=True); [os.remove(f) for f in glob.glob(OUT+'/c/*.bin')]
def put(a):
    while len(blob)%4: blob.append(0)
    o=len(blob); blob.extend(a.tobytes()); return o
for n in names:
    blob=bytearray(); d=db[n]; L=[]; lo=np.min([m['P'].min(0) for m in d['lods']],0); hi=np.max([m['P'].max(0) for m in d['lods']],0); ext=np.maximum(hi-lo,1e-4)
    for m in (d['lods'][:1] if d['kind']=='part' else d['lods']):
        nv=len(m['P']); cut=m['X'][:,0]>=100; T=m['T']; tc=cut[T[:,0]]; T=np.concatenate([T[~tc],T[tc]]); q=np.concatenate([np.round((m['P']-lo)/ext*65535).astype(np.uint16),np.zeros((nv,1),np.uint16)],1)
        L.append(dict(nv=nv,ni=int(T.size),nc=int(tc.sum()*3),p=put(q),n=put(np.concatenate([m['N'],np.zeros((nv,1),np.int8)],1)),u=put(m['UV'].astype(np.float16)),c=put(m['C']),x=put(np.concatenate([m['X'],np.zeros((nv,1),np.uint8)],1)),bi=put(m['bi']),bw=put(m['bw']),i=put(T.astype(np.uint16).reshape(-1))))
    man.append(dict(id=n,label=d['label'],kind=d['kind'],side=d['side'],rig=d['rig'],size=d.get('size',1),bones=d['bones'],joints=[[p,[round(float(v),4) for v in j]] for p,j in d['joints']],lo=[round(float(v),3) for v in lo],hi=[round(float(v),3) for v in hi],lod=L,light=d['light'],pose=d['meta'].get('pose'),**({'o':d['meta']['o']} if 'o' in d['meta'] else {}))); z=gzip.compress(bytes(blob),9,mtime=0); total+=len(z); open(OUT+'/c/'+n+'.bin','wb').write(z)
if os.path.exists(OUT+'/chars.bin'): os.remove(OUT+'/chars.bin')
json.dump(man,open(OUT+'/chars.json','w'),separators=(',',':')); print(len(man),'creatures',sum(m['lod'][0]['ni']//3 for m in man),'tris',total//1024,'KB')
