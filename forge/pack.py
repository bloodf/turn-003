"""Packs baked meshes into one gzip'd binary + manifest."""
import pickle,glob,json,gzip,numpy as np,os,sys
SC=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'.work'); OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public','assets'); os.makedirs(OUT,exist_ok=True)
db={}
for f in sorted(glob.glob(SC+'/props_*.pkl')): db.update(pickle.load(open(f,'rb')))
order=['masonry','doors','light','dungeon','furnish','village','nature']
names=sorted(db,key=lambda n:(order.index(db[n]['cat']),n)); blob=bytearray(); man=[]; tot=[0,0]
def put(a):
    while len(blob)%4: blob.append(0)
    o=len(blob); blob.extend(a.tobytes()); return o
for n in names:
    d=db[n]; P=d['lods'][0]['P']; lo=P.min(0); hi=P.max(0); L=[]
    for i,m in enumerate(d['lods']):
        lo=np.minimum(lo,m['P'].min(0)); hi=np.maximum(hi,m['P'].max(0))
    ext=np.maximum(hi-lo,1e-4)
    for i,m in enumerate(d['lods']):
        cut=m['X'][:,0]>=100; T=m['T']; tc=cut[T[:,0]]; T=np.concatenate([T[~tc],T[tc]]); nv=len(m['P']); tot[i]+=len(T)
        q=np.round((m['P']-lo)/ext*65535).astype(np.uint16); q=np.concatenate([q,np.zeros((nv,1),np.uint16)],1)
        nn=np.concatenate([m['N'],np.zeros((nv,1),np.int8)],1); x=np.concatenate([m['X'],np.zeros((nv,1),np.uint8)],1)
        L.append(dict(nv=nv,ni=int(T.size),nc=int(tc.sum()*3),p=put(q),n=put(nn),u=put(m['UV'].astype(np.float16)),c=put(m['C']),x=put(x),i=put(T.astype(np.uint16 if nv<65536 else np.uint32).reshape(-1))))
    r=lambda v:[round(float(k),4) for k in v]
    man.append(dict(id=n,cat=d['cat'],lo=r(lo),hi=r(hi),lod=L,fx=d['fx'],light=d['light'],**d['meta']))
raw=bytes(blob); open(OUT+'/props.bin','wb').write(gzip.compress(raw,9)); json.dump(man,open(OUT+'/props.json','w'),separators=(',',':'))
print(len(names),'models',tot,'tris',len(raw)//1024,'KB raw',os.path.getsize(OUT+'/props.bin')//1024,'KB gz')
