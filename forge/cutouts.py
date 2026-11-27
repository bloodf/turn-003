"""Foliage, web cutout tiles. 512px RGBA, drawn at 2x."""
import numpy as np, math, random, os
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public','tex'); N=1024
def leaf(im,x,y,a,L,W,c,kind='oval',vein=True):
    p=[];q=[];n=14
    for i in range(n+1):
        t=i/n; w=W*math.sin(math.pi*t**.8)**.9
        if kind=='oak': w*=.72+.28*math.cos(t*math.pi*7)
        if kind=='ivy': w=W*(1.15 if t<.3 else 1)*max(0,(1-t))**.7*(1+.35*math.cos(t*math.pi*4.2))*min(1,t*6)
        p.append((t*L,w)); q.append((t*L,-w))
    ca,sa=math.cos(a),math.sin(a); R=lambda u,v:(x+u*ca-v*sa,y+u*sa+v*ca); d=ImageDraw.Draw(im)
    up=[R(*k) for k in p]; dn=[R(*k) for k in q]; mid=[R(t*L/n,0) for t in range(n+1)]
    c1=tuple(int(v*1.1) for v in c)+(255,); c2=tuple(int(v*.84) for v in c)+(255,)
    d.polygon(up+mid[::-1],fill=c1); d.polygon(dn+mid[::-1],fill=c2)
    if vein:
        v=tuple(min(255,int(k*1.35+12)) for k in c)+(255,); d.line(mid,fill=v,width=max(2,int(W*.09)))
        for i in range(2,n-2,2):
            for s,l in((1,p),(-1,q)): d.line([mid[i],R(l[min(i+2,n)][0],l[min(i+2,n)][1]*.8)],fill=tuple(int(k*1.12) for k in c)+(255,),width=max(1,int(W*.05)))
def new(): return Image.new('RGBA',(N,N),(0,0,0,0))
def pick(r,pal): c=r.choice(pal); k=r.uniform(.82,1.15); return tuple(min(255,int(v*k)) for v in c)
def cluster(seed,pal,kind,n,L,W,twig=(58,42,26)):
    r=random.Random(seed); im=new(); d=ImageDraw.Draw(im); ends=[]
    for i in range(11):
        a=i*2*math.pi/11+r.uniform(-.2,.2); x,y=N/2,N/2; pts=[(x,y)]
        for k in range(6): a+=r.uniform(-.3,.3); x+=math.cos(a)*N*.062; y+=math.sin(a)*N*.062; pts.append((x,y)); ends.append((x,y,a,k))
        d.line(pts,fill=twig+(255,),width=7)
    r.shuffle(ends); ends.sort(key=lambda e:-e[3])
    for i in range(n):
        x,y,a,k=ends[i*len(ends)//n]; z=i/n; c=pick(r,pal); c=tuple(int(v*(.62+.45*z)) for v in c); leaf(im,x+r.uniform(-22,22),y+r.uniform(-22,22),a+r.uniform(-1.2,1.2),L*r.uniform(.75,1.2),W*r.uniform(.8,1.15),c,kind)
    return im
def t_oak(): return cluster(1,[(92,112,44),(78,98,38),(108,126,54),(120,132,62)],'oak',150,150,42)
def t_autumn(): return cluster(2,[(188,92,24),(170,66,20),(204,130,36),(150,48,22),(190,150,52)],'oak',150,150,42)
def t_bush(): return cluster(3,[(70,96,40),(84,110,46),(98,120,52),(62,84,36)],'oval',230,104,27)
def t_ivy(): return cluster(4,[(58,84,36),(72,98,44),(88,112,52),(66,74,30)],'ivy',95,150,62)
def t_flower():
    im=t_bush(); r=random.Random(5); d=ImageDraw.Draw(im)
    for i in range(26):
        x,y=N/2+r.gauss(0,170),N/2+r.gauss(0,170); c=r.choice([(214,90,120),(230,210,120),(190,150,220),(240,235,225)])
        for k in range(5): t=k*2*math.pi/5+i; d.ellipse([x+math.cos(t)*17-15,y+math.sin(t)*17-15,x+math.cos(t)*17+15,y+math.sin(t)*17+15],fill=tuple(int(v*(.8+.2*(k%2))) for v in c)+(255,))
        d.ellipse([x-9,y-9,x+9,y+9],fill=(220,170,50,255))
    return im
def t_pine():
    r=random.Random(6); im=new(); d=ImageDraw.Draw(im); pal=[(52,76,46),(62,90,54),(74,100,58),(44,66,42)]
    def spray(x,y,a,L,w,dep):
        pts=[(x,y)]
        m=int(L/9)
        for i in range(m): x+=math.cos(a)*9; y+=math.sin(a)*9; a+=r.uniform(-.02,.02); pts.append((x,y))
        d.line(pts,fill=(64,46,30,255),width=w)
        for i,(px,py) in enumerate(pts):
            t=i/max(m,1)
            if dep and i%7==3 and t<.9:
                for s in(-1,1): spray(px,py,a+s*r.uniform(.75,1.0),L*.5*(1-t)+60,max(3,w-4),dep-1)
            for s in(-1,1):
                for _ in range(2): b=a+s*r.uniform(.35,1.0); l=r.uniform(34,62)*(1-.35*t); c=pick(r,pal); d.line([(px,py),(px+math.cos(b)*l,py+math.sin(b)*l)],fill=c+(255,),width=4)
    spray(N/2,N-4,-math.pi/2,N*.9,11,1); return im
def t_fern():
    r=random.Random(7); im=new(); d=ImageDraw.Draw(im); m=26
    d.line([(N/2,N),(N/2,30)],fill=(70,84,36,255),width=9)
    for i in range(m):
        t=i/m; y=N-60-t*(N-110); L=N*.42*math.sin(math.pi*min(1,(t*.86+.14)))**.8*(1-t*.5)
        for s in(-1,1):
            a=-math.pi/2+s*1.05; c0=pick(r,[(78,108,42),(94,124,50),(68,96,38)])
            k=int(L/17)
            for j in range(k):
                u=j/max(k,1); px=N/2+math.cos(a)*L*u; py=y+math.sin(a)*L*u; 
                for q in(-1,1): leaf(im,px,py,a+q*.75,30*(1-u*.6),8,c0,'oval',False)
    return im
def t_grassblade():
    r=random.Random(8); im=new(); d=ImageDraw.Draw(im); pal=[(88,108,46),(108,126,54),(126,138,66),(74,94,40),(150,146,84)]
    for i in range(120):
        x=r.gauss(N/2,N*.2); h=r.uniform(.35,.97)*N*(1-abs(x-N/2)/N*.8); lean=r.gauss(0,.16)*h; c=pick(r,pal); w=r.uniform(6,12); L=[];R=[]
        for k in range(11): t=k/10; cx=x+lean*t*t; L.append((cx-w*(1-t),N-h*t)); R.append((cx+w*(1-t),N-h*t))
        z=.6+.4*i/120; d.polygon(L+R[::-1],fill=tuple(int(v*z) for v in c)+(255,))
    return im
def t_reed():
    r=random.Random(9); im=new(); d=ImageDraw.Draw(im)
    for i in range(46):
        x=r.uniform(N*.12,N*.88); h=r.uniform(.5,.97)*N; lean=r.gauss(0,.08)*h; c=pick(r,[(110,122,62),(92,106,50),(134,134,78)]); w=r.uniform(5,9); L=[];R=[]
        for k in range(11): t=k/10; cx=x+lean*t*t; L.append((cx-w*(1-t*.9),N-h*t)); R.append((cx+w*(1-t*.9),N-h*t))
        d.polygon(L+R[::-1],fill=c+(255,))
        if i%4==0: d.rounded_rectangle([x+lean-15,N-h-10,x+lean+15,N-h+120],14,fill=(92,58,32,255))
    return im
def t_deadleaf(): return cluster(10,[(110,84,48),(92,70,40),(126,98,58)],'oval',60,120,26)
def t_web():
    r=random.Random(11); im=new(); d=ImageDraw.Draw(im); c=(226,226,220); cx,cy=N*.5,N*.52; sp=[i*2*math.pi/15+r.uniform(-.12,.12) for i in range(15)]; len_=[N*r.uniform(.42,.62) for _ in sp]
    for a,l in zip(sp,len_): d.line([(cx,cy),(cx+math.cos(a)*l,cy+math.sin(a)*l)],fill=c+(235,),width=5)
    for k in range(2,24):
        for i in range(15):
            if r.random()<.10: continue
            a,b=sp[i],sp[(i+1)%15]+(2*math.pi if i==14 else 0); q=k*N*.0235+r.uniform(-6,6)
            if q>min(len_[i],len_[(i+1)%15]): continue
            pts=[(cx+math.cos(a+(b-a)*t)*q*(1-.16*math.sin(math.pi*t)),cy+math.sin(a+(b-a)*t)*q*(1-.16*math.sin(math.pi*t))) for t in[j/6 for j in range(7)]]; d.line(pts,fill=c+(225,),width=4)
    for i in range(7): x,y=r.uniform(0,N),r.uniform(0,N)
    return im
def t_banner(): return new()
TILES=['oak','pine','fern','grassblade','ivy','web','flower','reed','autumn','deadleaf','bush','banner']
ims=[]
for t in TILES:
    im=globals()['t_'+t]().resize((512,512),Image.LANCZOS); a=np.asarray(im).astype(float); m=a[...,3]>100
    if m.any():
        idx=ndi.distance_transform_edt(~m,return_distances=False,return_indices=True); rgb=a[...,:3][idx[0],idx[1]]
        dist=ndi.distance_transform_edt(~m)[...,None]; mean=a[...,:3][m].mean(0); rgb=np.where(dist>14,mean,rgb)
        lum=ndi.gaussian_filter(np.random.default_rng(1).standard_normal((512,512)),1.2)[...,None]; rgb=rgb*(1+lum*.25)
    else: rgb=a[...,:3]
    ims.append(Image.fromarray(np.clip(np.concatenate([rgb,a[...,3:]],2),0,255).astype(np.uint8)))
col=Image.new('RGB',(512,512*len(ims))); al=Image.new('L',(512,512*len(ims)))
for i,im in enumerate(ims): col.paste(im.convert('RGB'),(0,512*i)); al.paste(im.getchannel('A'),(0,512*i))
col.save(OUT+'/cut.c.webp',quality=82,method=6); al.save(OUT+'/cut.a.webp',quality=80,method=6)
sh=Image.new('RGB',(6*256,2*256),(90,120,150))
for i,im in enumerate(ims): t=im.resize((256,256)); sh.paste(t,((i%6)*256,(i//6)*256),t)
pass
