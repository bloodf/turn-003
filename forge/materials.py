"""Realmwright material forge: seamless PBR layers from synthesised height fields.
Every field is periodic, so every texture tiles. Output per layer:
  <name>.c.webp  albedo (sRGB)                <name>.d.webp  grey stack: normalX, normalY, roughness, occlusion
"""
import numpy as np, sys, os, json
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
from PIL import Image
from multiprocessing import Pool
S=1024
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','public','tex')
yy,xx=np.mgrid[0:S,0:S]/S

def rng(seed): return np.random.default_rng(seed)
def norm(a): a=a-a.min(); return a/(a.max()+1e-9)
def ss(a,b,x): t=np.clip((x-a)/(b-a+1e-9),0,1); return t*t*(3-2*t)
def lerp(a,b,t): return a+(b-a)*t
def fbm(seed,beta=2.0,lo=1,hi=400,ax=1.0,ay=1.0):
    """spectral noise, periodic, normalised to mean 0 std 1. ax/ay stretch: >1 = longer features on that axis"""
    w=np.fft.fft2(rng(seed).standard_normal((S,S)))
    fx=np.fft.fftfreq(S)*S*ax; fy=np.fft.fftfreq(S)*S*ay
    f=np.hypot(*np.meshgrid(fx,fy)); f[0,0]=1
    m=f**(-beta/2)*(f>=lo)*np.exp(-(f/hi)**2); m[0,0]=0
    n=np.fft.ifft2(w*m).real; return (n-n.mean())/(n.std()+1e-9)
def n01(*a,**k): return np.clip(fbm(*a,**k)*0.22+0.5,0,1)
def blur(a,s): return ndi.gaussian_filter(a,s,mode='wrap')
def warp(a,dx,dy,amt):
    return ndi.map_coordinates(a,[(yy+dy*amt)*S,(xx+dx*amt)*S],order=1,mode='grid-wrap')
def voronoi(seed,n,jx=None,jy=None,sx=1,sy=1,relax=1):
    r=rng(seed); p=r.random((n,2))
    for _ in range(relax):
        q=np.concatenate([p+[i,j] for i in(-1,0,1) for j in(-1,0,1)]); 
        g=np.stack(np.meshgrid((np.arange(128)+.5)/128,(np.arange(128)+.5)/128),-1).reshape(-1,2)
        _,idx=cKDTree(q*[sx,sy]).query(g*[sx,sy]); c=np.zeros((n,2));k=np.zeros(n)
        off=q[idx]-p[idx%n]; np.add.at(c,idx%n,g-off); np.add.at(k,idx%n,1); p=c/np.maximum(k,1)[:,None]%1
    q=np.concatenate([p+[i,j] for i in(-1,0,1) for j in(-1,0,1)])
    X=xx+(0 if jx is None else jx); Y=yy+(0 if jy is None else jy)
    d,i=cKDTree(q*[sx,sy]).query(np.stack([X*sx,Y*sy],-1).reshape(-1,2),k=2)
    pts=(q*[sx,sy])[i]
    mid=(pts[:,0]+pts[:,1])/2; dv=pts[:,1]-pts[:,0]; dv/=np.linalg.norm(dv,axis=1,keepdims=True)+1e-9
    edge=((mid-np.stack([X*sx,Y*sy],-1).reshape(-1,2))*dv).sum(1)
    return d[:,0].reshape(S,S),edge.reshape(S,S),(i[:,0]%n).reshape(S,S)
def blocks(seed,rows,cols,jit=.25,rowjit=.0,dist=.004,stagger=True):
    """courses of blocks. returns edge distance (in tile units), id"""
    r=rng(seed); h=np.ones(rows)+r.uniform(-rowjit,rowjit,rows); h/=h.sum(); ye=np.concatenate([[0],np.cumsum(h)])
    wx=fbm(seed+1,2.4,2,40)*dist; wy=fbm(seed+2,2.4,2,40)*dist
    X=(xx+wx)%1; Y=(yy+wy)%1
    E=np.full((S,S),9.); ID=np.zeros((S,S),int); U=np.zeros((S,S));V=np.zeros((S,S)); k=0
    row=np.clip(np.searchsorted(ye,Y,side='right')-1,0,rows-1)
    for ri in range(rows):
        c=cols if np.isscalar(cols) else cols[ri%len(cols)]
        w=np.ones(c)+r.uniform(-jit,jit,c); w/=w.sum(); xe=np.concatenate([[0],np.cumsum(w)])
        off=(ri%2)*.5/c+r.uniform(-.1,.1)/c if stagger else 0
        m=row==ri; x=(X[m]-off)%1; ci=np.clip(np.searchsorted(xe,x,side='right')-1,0,c-1)
        y=Y[m]; ex=np.minimum(x-xe[ci],xe[ci+1]-x); ey=np.minimum(y-ye[ri],ye[ri+1]-y)
        rad=.012; dx=np.maximum(rad-ex,0); dy=np.maximum(rad-ey,0)
        E[m]=np.where((ex<rad)&(ey<rad),rad-np.hypot(dx,dy),np.minimum(ex,ey))
        ID[m]=k+ci; U[m]=(x-xe[ci])/(xe[ci+1]-xe[ci])-.5; V[m]=(y-ye[ri])/(ye[ri+1]-ye[ri])-.5; k+=c
    return E,ID,U,V
def per(ID,seed,lo=-1,hi=1):
    return rng(seed).uniform(lo,hi,ID.max()+1)[ID]
def hexc(h): h=h.lstrip('#'); return np.array([int(h[i:i+2],16) for i in(0,2,4)])/255
def ramp(t,*stops):
    t=np.clip(t,0,1)[...,None]; n=len(stops)-1; cs=[hexc(s) for s in stops]; o=np.zeros((S,S,3))
    for i in range(n):
        a,b=i/n,(i+1)/n; k=np.clip((t-a)/(b-a),0,1); o=np.where((t>=a),cs[i]+(cs[i+1]-cs[i])*k,o)
    return o
def cavity(h,s=6): return h-blur(h,s)
def mix(a,b,t): return a+(b-a)*np.clip(t,0,1)[...,None]
def cracks(seed,n=14,width=.0022):
    j=.035; a,e,_=voronoi(seed,n,fbm(seed+5,2.2,3,60)*j,fbm(seed+6,2.2,3,60)*j,relax=0)
    gate=ss(.1,.9,fbm(seed+9,2.4,1,8)); return (1-ss(0,width,e))*gate

def finish(name,h,col,rough,depth,aoK=1.0,aoS=(4,14,40),fine=None,metal=0.,normK=1.0):
    """h in 0..1, depth = relief in fraction of tile width"""
    H=h*depth*S*normK
    gx=(np.roll(H,-1,1)-np.roll(H,1,1))*.5; gy=(np.roll(H,-1,0)-np.roll(H,1,0))*.5
    nx,ny=-gx,gy; l=np.sqrt(nx*nx+ny*ny+1); nx/=l; ny/=l
    ao=np.ones((S,S))
    for s in aoS: ao-=np.clip(blur(H,s)-H,0,None)/(s*.9)*.55*aoK
    ao=np.clip(ao,.12,1)
    col=np.clip(col,0,1); rough=np.clip(np.broadcast_to(rough,(S,S)),.04,1)
    for sz,sub in((1024,''),(512,'lo/')):
        os.makedirs(f'{OUT}/{sub}',exist_ok=True)
        q=lambda a:np.clip(a*255+.5,0,255).astype(np.uint8)
        c=Image.fromarray(q(col)); d=[nx*.5+.5,ny*.5+.5,rough,ao]
        if sz!=S:
            c=c.resize((sz,sz),Image.BOX); f=S//sz; d=[x.reshape(sz,f,sz,f).mean((1,3)) for x in d]
        c.save(f'{OUT}/{sub}{name}.c.webp',quality=72,method=6)
        Image.fromarray(q(np.concatenate(d,0))).save(f'{OUT}/{sub}{name}.d.webp',quality=58,method=6)

# ---------------------------------------------------------------- stone
def stone_face(seed,ID,U,V,E,bev=.012,tilt=.25,lump=.5,grit=.12,chip=.5):
    prof=ss(0,bev,E+fbm(seed+20,1.8,20,200)*bev*.16)
    t=(per(ID,seed+1)*U+per(ID,seed+2)*V)*tilt
    ch=ss(.9,1.7,fbm(seed+21,1.9,10,120)+ (1-ss(0,bev*2.6,E))*1.5)*chip
    h=prof*(.62+per(ID,seed+3)*.1+t*.3)+prof*(fbm(seed+22,2.3,3,60)*.05*lump+fbm(seed+23,1.3,30,500)*.012*grit*8)
    return h-ch*prof*.14,prof,ch
def masonry(name,seed,rows,cols,pal,mortar,depth=.03,jit=.3,rowjit=.15,dist=.004,bev=.014,moss=0,colvar=.2,wet=0,tilt=.25,chip=.5,crk=.5,**k):
    E,ID,U,V=blocks(seed,rows,cols,jit,rowjit,dist)
    h,prof,ch=stone_face(seed,ID,U,V,E,bev,tilt,chip=chip)
    cr=cracks(seed+40,16)*prof*crk; h=h-cr*.12
    mort=(1-prof)*(.1+fbm(seed+30,1.2,20,300)*.03); h=h*prof+mort
    tone=.5+per(ID,seed+5)*colvar+fbm(seed+31,2.0,2,90)*.10+fbm(seed+32,.9,40,500)*.07
    col=ramp(tone,*pal); hue=per(ID,seed+6)[...,None]*np.array([.022,.002,-.022]); col=col*(1+hue*1.6)
    col=mix(col,ramp(n01(seed+33,1.0,20,400),*mortar),1-ss(.2,.75,prof))
    col*=(1-cr*.45)[...,None]; cv=cavity(h,5); col*=(1+np.clip(cv*2.2,-.35,.22))[...,None]
    st=ss(.3,1.8,fbm(seed+34,2.4,1,14)+fbm(seed+35,1.8,4,80,ay=3)*.4); col*=(1-st*.30)[...,None]
    rough=.82+fbm(seed+36,1.4,8,200)*.05-wet*.3*ss(.0,1.2,fbm(seed+37,2.2,1,20))
    if moss:
        mm=ss(.55-moss,1.5-moss,fbm(seed+50,2.2,2,90)*.8+(1-prof)*.9-cv*3)
        col=mix(col,ramp(n01(seed+51,1.0,30,400),'#1d2410','#3d4a1d','#6c7434'),mm*.9); h=h+mm*(.07+.05*fbm(seed+52,.8,60,400)); rough=lerp(rough,.95,mm)
    finish(name,h,col,rough,depth,**k)
GREY=('#34322f','#55524c','#79746b','#969084'); MORT=('#23211e','#3a3733','#4b4741')
def m_stone_wall(): masonry('stone_wall',11,7,[4,5,4,5,6],GREY,MORT,.034,rowjit=.22,wet=.35)
def m_ashlar(): masonry('ashlar',22,6,4,('#55504a','#78726a','#9a9388','#b5ad9f'),('#4a453e','#6a645a','#7f786c'),.02,jit=.12,rowjit=.05,dist=.0015,bev=.009,colvar=.15,tilt=.12,chip=.35,crk=.3)
def m_mossy_wall(): masonry('mossy_wall',33,7,[4,5,4],('#2f302a','#4d4c43','#6d6a5d','#88836f'),MORT,.036,rowjit=.25,moss=.75,wet=.4)
def m_sandstone(): masonry('sandstone',44,6,[3,4],('#7a5a36','#a57c4b','#c69a62','#ddb980'),('#6b4f30','#8a683f','#9d7a4c'),.022,jit=.15,rowjit=.08,dist=.002,bev=.011,colvar=.14)
def m_brick(): masonry('brick',55,14,6,('#3e1d15','#6a3122','#8b4530','#a5634a'),('#5b5248','#7d7265','#958a7b'),.016,jit=.05,rowjit=.04,dist=.0018,bev=.008,colvar=.25,tilt=.15)
def m_infernal(): masonry('infernal',66,6,[4,3,5],('#0e0c0d','#1f1a1b','#35292a','#4a3433'),('#2a0c05','#4a1507','#6b1e08'),.04,rowjit=.25,bev=.018,dist=.007,chip=.8,crk=1)
def m_ice_block(): 
    E,ID,U,V=blocks(77,5,[3,4],.2,.15,.003); p=ss(0,.016,E)
    cr=cracks(781,18,.003); h=p*(.6+per(ID,3)*.08)+fbm(78,2.6,2,40)*.05*p-cr*.1
    tone=.55+fbm(79,2.4,1,30)*.13+per(ID,4)*.1; col=ramp(tone,'#2b5068','#4f7f99','#7ba6b9','#aecbd6')
    col=mix(col,ramp(n01(71,1.0,30,400),'#9dbac6','#c3d5dc'),(1-p)*.9+ss(.8,2,fbm(72,2.2,2,60))*.7); col=mix(col,ramp(xx*0+1,'#b4d2de','#b4d2de'),cr*.7)
    finish('ice_block',h,col,.28+ss(.6,1.6,fbm(73,2,3,80))*.45,.03)
def slab(name,seed,n,pal,mort,depth=.022,bev=.008,worn=.5,dirt=.5,moss=0,wet=.3,sx=1,sy=1,colvar=.18):
    j=.012; a,e,ID=voronoi(seed,n,fbm(seed+1,2.4,2,40)*j*.5,fbm(seed+2,2.4,2,40)*j*.5,sx,sy,relax=3)
    e=e+fbm(seed+3,1.8,20,200)*bev*.12; p=ss(.003,.003+bev,e)
    h=p*(.6+per(ID,seed+4)*.08)+p*(fbm(seed+5,2.3,3,70)*.035+fbm(seed+6,1.1,40,500)*.012); cr=cracks(seed+41,12)*p*.7; h-=cr*.1
    g=ss(.2,1.4,fbm(seed+7,2.0,2,60)+(1-p)*1.2)*dirt; h=h*p+(1-p)*(.18+fbm(seed+8,1,30,400)*.04)
    tone=.5+per(ID,seed+9)*colvar+fbm(seed+10,2,2,90)*.1+fbm(seed+11,.9,40,500)*.06
    col=ramp(tone,*pal)*(1+per(ID,seed+12)[...,None]*np.array([.04,.005,-.035])); col=mix(col,ramp(n01(seed+13,1,20,400),*mort),np.maximum(1-ss(.1,.7,p),g*.6)); col*=(1-cr*.5)[...,None]
    cv=cavity(h,5); col*=(1+np.clip(cv*2,-.3,.2))[...,None]
    rough=.72+g*.2+fbm(seed+14,1.4,6,200)*.06-wet*ss(.1,1.3,fbm(seed+15,2.4,1,14))*.42
    if moss:
        mm=ss(.7-moss,1.5-moss,fbm(seed+50,2.2,2,90)*.7+(1-p)*1.1); col=mix(col,ramp(n01(seed+51,1,30,400),'#1f2611','#42501f','#737c37'),mm*.9); h=h+mm*(.08+.04*fbm(seed+52,.8,60,400)); rough=lerp(rough,.95,mm)
    finish(name,h,col,rough,depth)
def m_flagstone(): slab('flagstone',101,26,('#2e2c29','#4c4842','#6a655c','#878074'),('#1b1916','#2d2a25','#3d3932'))
def m_flag_moss(): slab('flag_moss',111,24,('#2b2b26','#47453b','#65604f','#7f7862'),('#1d1c16','#302d22','#3f3b2c'),moss=.8)
def m_sand_floor(): slab('sand_floor',121,20,('#7d6240','#a3814f','#c09a63','#d6b47c'),('#a08055','#bd9a67','#cfae7b'),dirt=.9,wet=0)
def m_infernal_floor(): slab('infernal_floor',131,22,('#100d0e','#221c1c','#372c2b','#4c3b38'),('#31100a','#541a0b','#7a260c'),depth=.03,dirt=.3)
def m_cobble():
    a,e,ID=voronoi(141,110,fbm(142,2,4,60)*.004,fbm(143,2,4,60)*.004,relax=3); r=ss(.0,.035,e); h=np.sqrt(r)*(.62+per(ID,144)*.12)+fbm(145,2,6,120)*.03*r+(1-ss(0,.01,e))*.02
    tone=.5+per(ID,146)*.28+fbm(147,1.4,8,300)*.1; col=ramp(tone,'#2f2c29','#57524c','#7c756a','#a0978a')*(1+per(ID,148)[...,None]*np.array([.07,.0,-.06]))
    col=mix(col,ramp(n01(149,1,20,400),'#1f1a14','#3a3024','#4f4231'),1-ss(.08,.45,r)); col*=(1+np.clip(cavity(h,6)*1.6,-.4,.2))[...,None]
    finish('cobble',h,col,.78+fbm(150,1.4,8,200)*.06,.045)
def m_marble():
    n=4; u=(xx*n)%1; v=(yy*n)%1; ID=(np.floor(xx*n)+np.floor(yy*n)*n).astype(int); chk=((np.floor(xx*n)+np.floor(yy*n))%2)
    e=np.minimum(np.minimum(u,1-u),np.minimum(v,1-v))/n; p=ss(.001,.005,e)
    wx=fbm(161,2.4,2,60); vein=np.abs(np.sin((xx*2+yy*1)*np.pi*2+wx*1.3+per(ID,162)*9)); vn=(1-ss(0,.10,vein))*.8+ (1-ss(0,.05,np.abs(fbm(163,2.2,3,80))))*.4
    lt=ramp(.6+fbm(164,2.2,2,60)*.12,'#8f887c','#b3ab9c','#cfc8ba','#e2dccf'); lt=mix(lt,lt*0+hexc('#6f675b'),vn*.55)
    dk=ramp(.5+fbm(165,2.2,2,60)*.14,'#141416','#23232a','#33333c','#45454f'); dk=mix(dk,dk*0+hexc('#8d8a86'),vn*.5)
    col=mix(lt,dk,chk); dirt=ss(.3,1.8,fbm(166,2.2,2,60)); col*=(1-dirt*.3)[...,None]; col=mix(col,col*0+hexc('#2a2620'),1-p)
    finish('marble',p*.6+per(ID,167)*.02+fbm(168,2,4,100)*.006,col,.22+dirt*.4+(1-p)*.4,.012)
def m_dwarven():
    n=4; u=(xx*n)%1-.5; v=(yy*n)%1-.5; ID=(np.floor(xx*n)+np.floor(yy*n)*n).astype(int)
    a=np.maximum(abs(u),abs(v)); d=abs(u)+abs(v)
    h=.6-.35*ss(.465,.495,a); h-=.16*(ss(.395,.405,a)-ss(.43,.44,a)); h-=.18*(ss(.30,.31,d)-ss(.345,.355,d)); h+=.10*(1-ss(.16,.175,a)); h-=.16*(1-ss(.055,.065,np.hypot(u,v)))
    h+=per(ID,171)*.02+fbm(172,2,4,120)*.016+fbm(173,1,50,500)*.006; cr=cracks(174,10)*.6; h-=cr*.08
    cv=cavity(h,4); col=ramp(.48+per(ID,175)*.1+fbm(176,1.8,3,200)*.12,'#262a2e','#42474b','#5f6463','#81827b'); col=mix(col,ramp(n01(177,1,20,300),'#5d421b','#9b7430','#c59b4a'),(ss(.30,.31,d)-ss(.345,.355,d))*(.35+.65*n01(178,1.6,4,60))*.9)
    col*=(1+np.clip(cv*3,-.45,.25))[...,None]; finish('dwarven',h,col,.6+fbm(179,1.4,8,200)*.08,.028)
def rockf(name,seed,pal,depth=.10,n=26,strat=0,moss=0,snow=0,rough0=.88,wet=.25):
    wx,wy=fbm(seed,2.3,2,50)*.03,fbm(seed+1,2.3,2,50)*.03
    h=np.zeros((S,S)); 
    for k,(nn,a) in enumerate(((n//3,.55),(n,.33),(n*5,.14),(n*18,.05))):
        d,e,ID=voronoi(seed+10+k,max(nn,5),wx,wy,1,1+strat,relax=0); r=rng(seed+60+k); m=ID.max()+1; gx,gy,b=r.uniform(-1,1,m),r.uniform(-1,1,m),r.uniform(0,1,m)
        X=fbm(seed+70+k,2.6,1,16)*.1
        sc=np.sqrt(max(nn,5)); h+=a*(b[ID]*.55+d*sc*gx[ID]*.7-(1-ss(0,.22/sc,e))*.5)
    h=norm(blur(h,.8)); h=norm(h+fbm(seed+2,2.2,2,300)*.045)
    if strat: h=norm(h+.18*np.sin(yy*2*np.pi*9+fbm(seed+4,2.4,1,30)*1.1))
    cv=cavity(h,10); cv2=cavity(h,40); tone=.5+cv2*1.1+cv*1.6+fbm(seed+5,2,2,200)*.09
    col=ramp(tone,*pal)*(1+fbm(seed+6,2.4,1,12)[...,None]*np.array([.045,.005,-.04])); st=ss(.4,1.8,fbm(seed+7,2.0,2,30,ay=2.5)); col*=(1-st*.25)[...,None]
    rough=rough0-wet*ss(.2,1.4,fbm(seed+8,2.4,1,14))*.6
    if moss:
        mm=ss(.6-moss,1.5-moss,fbm(seed+50,2.2,2,90)+cv2*2.5); col=mix(col,ramp(n01(seed+51,1,30,400),'#20280f','#46541f','#7d8540'),mm*.85); rough=lerp(rough,.95,mm); h=h+mm*.02*fbm(seed+52,.8,60,400)
    finish(name,h,col,rough,depth,aoK=.8)
def m_rock(): rockf('rock',201,('#1f1c19','#3b3630','#5b544a','#82796a'))
def m_rock_warm(): rockf('rock_warm',211,('#3a2416','#6a4528','#936640','#ba8c5e'),strat=2.2,wet=0)
def m_rock_dark(): rockf('rock_dark',221,('#0c0a0b','#1c1819','#302829','#4d3f3b'),wet=.4)
def m_rock_ice(): rockf('rock_ice',231,('#27485d','#4b7488','#7f9fae','#b3c8d0'),rough0=.55,wet=.45,depth=.08)
def m_cliff(): rockf('cliff',241,('#2e2c27','#524e45','#777165','#9c9585'),moss=.25,wet=0,strat=.8)
# ---------------------------------------------------------------- ground
def ground(name,seed,pal,depth=.03,grain=1.0,pebbles=0,pcol=GREY,rough0=.93,big=1.0,wet=0):
    h=fbm(seed,2.3,2,200)*.10*big+fbm(seed+1,1.3,20,500)*.035*grain; h=norm(h); tone=.5+fbm(seed+2,2.0,2,120)*.12+fbm(seed+3,.8,40,500)*.10*grain+cavity(h,8)*.8
    col=ramp(tone,*pal)
    if pebbles:
        for k,(nn,sz) in enumerate(((int(900*pebbles),.010),(int(260*pebbles),.019))):
            d,e,ID=voronoi(seed+20+k,nn,fbm(seed+40,2,8,80)*.003,fbm(seed+41,2,8,80)*.003,relax=1); keep=(per(ID,seed+22+k,0,1)<.5); rad=sz*(.6+per(ID,seed+23+k,0,1)*.6)
            t=np.clip(1-(d/rad)**2,0,1)*keep; m=ss(0,.25,t); h=h+np.sqrt(t)*sz*9*.8; pc=ramp(.5+per(ID,seed+24+k)*.35+fbm(seed+25,1,20,400)*.1,*pcol); col=mix(col*(1-(ss(1.5,.9,d/rad)*keep*(1-m)*.4))[...,None],pc,m)
    r=rough0+0*xx
    if wet: w=ss(.3,1.2,fbm(seed+9,2.6,1,10)); r=r-w*wet; col*=(1-w*.35)[...,None]
    finish(name,h,col,r,depth)
def m_dirt(): ground('dirt',301,('#20170f','#3a2a1c','#54402b','#6f5840'),pebbles=1)
def m_mud(): ground('mud',311,('#1b140d','#30241a','#453625','#5b4a35'),wet=.55,big=1.6,pebbles=.25)
def m_gravel(): ground('gravel',321,('#2c241b','#4a3e30','#655745','#80715c'),pebbles=2.6,pcol=('#3d3830','#655d51','#8b8172','#aba08e'))
def m_sand():
    rip=np.sin((yy*26)*2*np.pi+fbm(331,2.6,1,14)*2.2)*.5+.5; h=norm(rip**1.4*.5+fbm(332,2.4,1,60)*.12+fbm(333,.7,60,500)*.02)
    col=ramp(.5+(h-.5)*.35+fbm(334,2,2,60)*.07+fbm(335,.4,80,500)*.07,'#8f6f46','#b3905c','#cdab74','#e2c692'); finish('sand',h,col,.92,.012)
def m_snow():
    h=norm(fbm(341,2.6,1,90)*.3+fbm(342,1.0,60,500)*.03); col=ramp(.6+(h-.5)*.5+fbm(343,.4,80,500)*.05,'#8598a9','#a6b5c2','#bcc8d1','#cfd8de'); finish('snow',h,col,.62,.03)
def blades(seed,n,L,W,pal,base,name,depth,curl=.5,rough=.9,spread=None,tone=0.):
    """scatter curved strokes (grass, straw, needles, fur) with painter's depth"""
    r=rng(seed); H=np.zeros((S,S)); C=base.copy(); 
    order=np.linspace(0,1,n); cs=[hexc(p) for p in pal]
    for i in range(n):
        z=order[i]; x,y=r.random(2)*S; a=r.uniform(0,2*np.pi) if spread is None else spread[0]+r.normal(0,spread[1]); l=L*r.uniform(.6,1.3); w=W*r.uniform(.6,1.4); k=r.normal(0,curl)/l
        m=int(l)+2; t=np.linspace(0,1,m); an=a+k*t*l; px=x+np.cumsum(np.cos(an)); py=y+np.cumsum(np.sin(an)); wd=np.maximum(w*(1-t**2),.6)
        cc=cs[min(int(np.clip(z*.75+r.normal(0,.18)+tone,0,.999)*len(cs)),len(cs)-1)]*r.uniform(.85,1.12)
        R=int(np.ceil(w)); off=np.arange(-R,R+1)
        nx,ny=-np.sin(an),np.cos(an)
        for o in off:
            s=np.abs(o)<=wd; ix=(px+nx*o)[s].astype(int)%S; iy=(py+ny*o)[s].astype(int)%S
            hh=.25+.75*z-(o/(R+.5))**2*.12-.05*(1-t[s]); up=hh>H[iy,ix]
            H[iy[up],ix[up]]=hh[up]; sh=(.55+.45*z)*(1+.22*o/(R+.5))*(.75+.25*t[s]); C[iy[up],ix[up]]=(cc[None]*sh[:,None])[up]
    h=blur(H,.7); finish(name,h,C*(.8+.2*ss(0,1,cavity(h,10)+.6))[...,None],rough,depth,aoK=.9)
def m_grass(): blades(401,26000,30,2.2,('#2a3416','#425223','#5e6c31','#7b843f','#9b9a58'),ramp(n01(402,1.4,4,200),'#17150c','#2b2716','#38371d'),'grass',.035,curl=.9)
def m_forest():
    base=ramp(n01(412,1.4,4,200),'#1a120b','#2f2114','#45331f'); blades(411,9000,22,5,('#2a1c0f','#43301a','#5d4324','#7a5a30','#6b6030','#8a6a3c'),base,'forest',.03,curl=1.2)
def m_straw(): blades(421,9000,110,2.4,('#5b4118','#86642a','#aa8540','#c9a75c','#dcc07c'),ramp(xx*0+.5,'#3b2a10','#4b3716'),'straw',.03,curl=.35)
def m_thatch(): 
    blades(431,12000,150,2.2,('#3c2f1c','#5b4829','#7b6438','#97804d','#ab9562'),ramp(xx*0+.5,'#241b0e','#2f2412'),'thatch',.035,curl=.12,spread=(np.pi/2,.10))
def m_fur(): blades(441,14000,60,2.0,('#5c5148','#85786a','#a89b8b','#c6bbab','#e2d8ca'),ramp(xx*0+.5,'#40372f','#4a4037'),'fur',.025,curl=.35,spread=(np.pi/2,.3))
def m_moss():
    h=norm(fbm(451,1.4,8,300)*.2+fbm(452,2.2,2,60)*.25); blades(451,16000,9,2.2,('#2e3a17','#4a5a25','#687735','#8c954b'),ramp(h,'#252d12','#3d491d','#536028'),'moss',.03,curl=.8)
# ---------------------------------------------------------------- wood
def woodgrain(seed,ID,stretch=9,axis='y'):
    sh=per(ID,seed,0,1); r=rng(seed+90)
    kw=dict(ay=stretch) if axis=='x' else dict(ax=1,ay=1)
    A=(lambda s,b,lo,hi:fbm(s,b,lo,hi,ax=stretch,ay=1) if axis=='x' else fbm(s,b,lo,hi,ax=1,ay=stretch))
    # stretched so that grain runs along `axis`
    g1=A(seed+1,2.2,2,300); g2=A(seed+2,1.2,10,500)
    base=A(seed+3,2.6,1,40); coord=(xx if axis=='y' else yy)
    rings=np.sin(coord*2*np.pi*34+base*2.6+per(ID,seed+4,0,50)); return g1,g2,rings
def planks(name,seed,n,pal,depth=.018,axis='x',gap=.006,worn=.5,butt=True,dark=.35,rough0=.62,nails=True):
    """axis: direction the boards run"""
    r=rng(seed); c=yy if axis=='x' else xx; l=xx if axis=='x' else yy
    w=np.ones(n)+r.uniform(-.18,.18,n); w/=w.sum(); e=np.concatenate([[0],np.cumsum(w)]); cw=(c+fbm(seed+1,2.6,1,10)*.0012)%1
    k=np.clip(np.searchsorted(e,cw,side='right')-1,0,n-1); d=np.minimum(cw-e[k],e[k+1]-cw); off=r.random(n)[k]; L=(l+off)%1
    dl=np.minimum(L,1-L); half=(L>.5).astype(int) if butt else 0; 
    if butt: dl=np.minimum(dl,abs(L-.5)); E=np.minimum(d,dl*.9)
    else: E=d
    ID=k*2+half
    g1,g2,rings=woodgrain(seed+10,ID,10,axis); sh=per(ID,seed+5)
    knots=np.zeros((S,S))
    p=ss(gap*.25,gap*1.5,E+fbm(seed+6,1.8,20,160)*.0008); h=p*(.65+sh*.06+((cw-e[k])/(e[k+1]-e[k])-.5)*per(ID,seed+7)*.12)+p*(rings*.018+g2*.022-ss(1.2,2.2,g2)*.06)
    tone=.5+sh*.17+g1*.08+rings*.06+g2*.05; col=ramp(tone,*pal)*(1+per(ID,seed+8)[...,None]*np.array([.05,.0,-.05])); col*=(1-ss(1.1,2.4,g2)*.35)[...,None]; col*=(.25+.75*p)[...,None]
    gr=ss(.3,1.8,fbm(seed+9,2.2,2,60)); col*=(1-gr*dark)[...,None]
    if nails and butt:
        for s in(.02,.48,.52,.98):
            for fr in(.25,.75):
                cen=e[k]+(e[k+1]-e[k])*fr; dd=np.hypot((cw-cen),(L-s)); m=1-ss(.0035,.005,dd); col=mix(col,col*0+hexc('#1a1614'),m*.85); h=h+m*.03
    finish(name,h,col,rough0+gr*.2+g2*.04,depth)
def m_planks(): planks('planks',501,7,('#22150c','#40291a','#5e4029','#7d5a3b'))
def m_planks_old(): planks('planks_old',511,8,('#1e1a16','#3a322a','#574c40','#786b5b'),depth=.026,gap=.011,dark=.45,rough0=.82)
def m_wood(): 
    ID=np.zeros((S,S),int); g1,g2,rings=woodgrain(521,ID,11,'y'); tone=.5+g1*.11+rings*.09+g2*.06; col=ramp(tone,'#2a180c','#4a2d18','#6c4526','#8e6238'); col*=(1-ss(1.2,2.5,g2)*.3)[...,None]
    finish('wood',norm(rings*.06+g2*.09+g1*.04),col,.5+g2*.05+ss(.2,1.6,fbm(529,2.2,1,30))*.18,.008)
def m_beam():
    ID=np.zeros((S,S),int); g1,g2,rings=woodgrain(531,ID,12,'y'); ck=ss(1.3,2.2,fbm(532,1.6,4,120,ay=14)); adz=ndi.gaussian_filter(voronoi(533,160,relax=1)[0],4,mode='wrap')
    tone=.45+g1*.1+rings*.06+g2*.07; col=ramp(tone,'#17100a','#2d2015','#473423','#655038'); col*=(1-ck*.6)[...,None]; finish('beam',norm(rings*.04+g2*.1-ck*.6+adz*6),col,.8,.02)
def m_bark():
    wx=fbm(541,2.2,2,60)*.02; d,e,ID=voronoi(542,90,wx,wx,3.2,1,relax=1); f=ss(0,.09,e); h=norm(f*.7+fbm(543,1.8,6,200,ay=3)*.07+per(ID,544)*.08); cv=cavity(h,8)
    col=ramp(.5+cv*1.1+per(ID,545)*.08+fbm(546,1.4,6,300)*.1,'#2a2018','#4a3a2b','#6e5a47','#94806a'); m=ss(.7,1.9,fbm(547,2.2,2,60)); col=mix(col,ramp(n01(548,1,30,300),'#2c3517','#5b6632'),m*.5); finish('bark',h,col,.93,.07)
# ---------------------------------------------------------------- roofs & plaster
def scales_roof(name,seed,rows,cols,pal,depth=.05,round_=.5,rough0=.75,var=.22,moss=.3):
    v=yy*rows; best=np.full((S,S),-9.); ID=np.zeros((S,S),int); H=np.zeros((S,S)); r=rng(seed); ex=np.zeros((S,S))
    for o in(0,1):   # each pixel may be covered by its own row or the row above hanging over it
        row=np.floor(v).astype(int)-o; f=v-row; off=(row%2)*.5; u=xx*cols+off; ci=np.floor(u).astype(int)%cols; uu=u%1-.5; rid=(row%rows)*cols+ci
        jl=r.uniform(-.08,.08,rows*cols)[rid] if o==0 else ex; ex=jl
        ln=1.18+jl-round_*.8*(abs(uu)**2.2)*2; inside=(f<ln)&(abs(uu)<.488); z=np.where(inside,1-o*0.0+ (f/1.2)*.6+(0 if o==0 else .55),-9)
        up=z>best; best=np.where(up,z,best); ID=np.where(up,rid,ID); edge=np.minimum(ln-f,(.49-abs(uu))*1.2)
        H=np.where(up,z*.5*ss(-.02,.06,edge)+.08*(1-abs(uu)*2*round_),H)
    H=np.where(best<-5,.15,H); h=norm(H+per(ID,seed+2)*.05+fbm(seed+3,1.8,8,300)*.012); cv=cavity(h,6)
    col=ramp(.5+per(ID,seed+4)*var+fbm(seed+5,1.6,6,300)*.09+cv*.6,*pal)*(1+per(ID,seed+6)[...,None]*np.array([.06,0,-.05])); col*=(1+np.clip(cv*2.4,-.5,.2))[...,None]
    if moss: m=ss(.7,1.7,fbm(seed+7,2.2,2,80)-cv*2); col=mix(col,ramp(n01(seed+8,1,30,300),'#262d14','#4e5a28'),m*moss*2)
    finish(name,h,col,rough0+fbm(seed+9,1.4,8,200)*.06,depth)
def m_slate(): scales_roof('slate',601,10,8,('#1c2024','#343a3f','#4e5457','#6c706f'),round_=.12)
def m_clay(): scales_roof('clay',611,9,9,('#4a1d10','#7c3820','#a55532','#c47a50'),round_=.8)
def m_shingle(): scales_roof('shingle',621,9,10,('#231a12','#41321f','#5f4b33','#82694a'),round_=.05,rough0=.85)
def m_scale(): scales_roof('scale',631,16,14,('#3c3c3c','#6a6a6a','#959595','#c4c4c4'),depth=.03,round_=1,rough0=.38,moss=0,var=.12)
def m_plaster():
    h=norm(fbm(641,2.2,2,200)*.2+fbm(642,1.2,20,400)*.05+blur(voronoi(643,70)[0],6)*1.2); cr=cracks(644,9,.0025); h-=cr*.12; st=ss(.2,1.9,fbm(645,2.2,1,20)+fbm(646,1.8,3,60,ay=3)*.4)
    col=ramp(.6+fbm(647,2,2,120)*.09+fbm(648,.8,40,400)*.04,'#8f7f66','#b5a486','#cebfa1','#e0d4b9'); col*=(1-st*.28)[...,None]; col*=(1-cr*.4)[...,None]; finish('plaster',h,col,.92,.014)
# ---------------------------------------------------------------- metals, cloth, odds
def m_iron():
    d=blur(voronoi(701,190,relax=1)[0],5); h=norm(d*8+fbm(702,1.6,6,300)*.05); rs=ss(.7,1.9,fbm(703,2.0,3,150)); col=ramp(.5+fbm(704,1.6,4,300)*.14+cavity(h,6)*.5,'#3a3a3c','#545456','#6e6e6f','#8d8c8a'); col=mix(col,ramp(n01(705,1,10,300),'#3a1d0e','#6b3a1c'),rs*.6); finish('iron',h,col,.42+fbm(706,1.4,6,200)*.06+rs*.4,.012)
def m_rust():
    h=norm(fbm(711,1.5,4,400)); col=ramp(.5+fbm(712,1.5,3,300)*.2,'#22140d','#4a2614','#74401f','#99602f'); p=ss(.6,1.2,fbm(713,2,3,100)); col=mix(col,ramp(n01(714,1,10,300),'#3c3a38','#5f5c59'),p*.7); finish('rust',h,col,.85-p*.3,.015)
def m_gold():
    h=norm(blur(voronoi(721,260,relax=1)[0],4)*8+fbm(722,1.8,6,200)*.05); col=ramp(.55+fbm(723,1.8,4,200)*.1+cavity(h,6)*1.2,'#8a5a17','#c58f2e','#e6b84f','#f8dd8c'); finish('gold',h,col,.28+fbm(724,1.4,4,200)*.06,.008)
def m_bronze():
    h=norm(fbm(731,1.7,4,300)); col=ramp(.5+fbm(732,1.7,3,200)*.14,'#4a2f16','#7a5228','#a3743c','#c79a5c'); v=ss(.5,1.5,fbm(733,2,2,120)); col=mix(col,ramp(n01(734,1,10,300),'#2e5a4b','#5f9079'),v*.7); finish('bronze',h,col,.4+v*.4,.01)
def m_steel():
    h=norm(fbm(741,1.2,10,400,ay=10)*.05+fbm(742,2.2,2,60)*.1); col=ramp(.6+fbm(743,1.6,3,300)*.07,'#7d8084','#a0a3a6','#bfc1c2','#dcdddc'); sc=ss(1.2,2,fbm(744,1.8,4,200)); col*=(1-sc*.35)[...,None]; finish('steel',h,col,.27+fbm(745,1.2,8,300,ay=8)*.05+sc*.3,.005)
def m_mail():
    n=40; o=np.floor(yy*n)%2*.5; u=(xx*n+o)%1-.5; v=(yy*n)%1-.5; r=np.hypot(u,v*1.05); ring=np.exp(-((r-.42)/.11)**2); o2=.5-o; u2=(xx*n+o2)%1-.5; v2=((yy*n+.5)%1)-.5; r2=np.hypot(u2,v2*1.05); ring2=np.exp(-((r2-.42)/.11)**2)
    h=np.maximum(ring*(.75+.25*np.sin(np.arctan2(v,u))),ring2*(.75-.25*np.sin(np.arctan2(v2,u2)))); col=ramp(h*.8+fbm(751,1.4,6,200)*.07,'#0c0c0d','#4b4c4e','#86888a','#b7b8b8'); finish('mail',blur(h,.8),col,.36+(1-h)*.4,.016)
def m_leather():
    d,e,ID=voronoi(761,3200,relax=1); c=ss(0,.005,e); h=norm(c*.25+fbm(762,2.2,2,120)*.12); w=ss(.5,1.7,fbm(763,2.2,2,90)); col=ramp(.5+fbm(764,2,2,120)*.13+(c-.7)*.12,'#2a160b','#4b2b16','#6c4224','#8d5f39'); col=mix(col,col*1.35,w*.5); finish('leather',h,col,.58+w*.15-c*.06,.008)
def m_cloth():
    n=84; u=xx*n*np.pi; v=yy*n*np.pi; a=np.abs(np.sin(u))**.7; b=np.abs(np.sin(v))**.7; ck=((np.floor(xx*n)+np.floor(yy*n))%2); h=np.where(ck>0,a*.8,b*.8)+fbm(771,2.2,2,60)*.10; h=norm(h); col=ramp(.62+cavity(h,2)*.35+fbm(772,2,2,120)*.09+fbm(773,.6,60,500)*.04,'#8a8681','#b3afa9','#d2cec7','#ebe7e0'); finish('cloth',h,col,.95,.006)
def m_bone():
    h=norm(fbm(781,1.8,3,300,ay=3)); col=ramp(.6+fbm(782,1.8,2,200)*.13+cavity(h,5)*.3,'#5d4a31','#98835d','#c5b38b','#e3d6b4'); st=ss(.5,1.9,fbm(783,2.2,2,80)); col*=(1-st*.35)[...,None]; finish('bone',h,col,.7,.008)
def m_skin():
    d,e,ID=voronoi(791,5200,relax=1); h=norm(ss(0,.006,e)*.3+fbm(792,2.2,2,120)*.14); col=ramp(.55+fbm(793,2.2,2,120)*.1+fbm(794,1,30,300)*.04,'#a08f86','#c2b2a9','#d8cac1','#eae0d8'); finish('skin',h,col,.58,.006)
def m_wax(): 
    h=norm(fbm(801,2.4,1,60)); finish('wax',h,ramp(.6+fbm(802,2.4,1,60)*.08,'#b39a6a','#d6c193','#ead9b2','#f6ecd0'),.5,.01)
def m_lava():
    wx,wy=fbm(811,2.4,1,30)*.05,fbm(812,2.4,1,30)*.05; d,e,ID=voronoi(813,26,wx,wy,relax=1); c=ss(0,.05,e+fbm(814,1.8,6,120)*.006); h=norm(c*.6+fbm(815,2,4,200)*.09)
    cr=ramp(.4+fbm(816,1.8,3,300)*.2,'#0a0606','#1c0f0c','#2e1710','#442014'); hot=ramp(1-ss(0,.05,e)*.95+fbm(817,2,3,100)*.06,'#7a1402','#d8400a','#ff8a1e','#ffd45a'); finish('lava',h,mix(hot,cr,ss(.25,.8,c)),.9,.03)
def m_crystal():
    d,e,ID=voronoi(821,40,sx=2,sy=1,relax=0); h=norm(per(ID,822)*.3+d*per(ID,823)*1.5); col=ramp(.55+per(ID,824)*.18+fbm(825,2.2,2,80)*.08,'#7f8e9c','#a9bac6','#cfdde4','#f4fafc'); finish('crystal',h,col,.12+ss(.4,1.8,fbm(826,2,2,100))*.25,.02)
def m_rug():
    u,v=xx,yy; b=np.minimum(np.minimum(u,1-u),np.minimum(v,1-v)); col=np.zeros((S,S,3))+hexc('#5e1016'); navy=hexc('#14233f'); gold=hexc('#b98a3a'); cream=hexc('#d2bd8a')
    def put(m,c):
        nonlocal col; col=mix(col,col*0+c,m.astype(float))
    put((b<.12),navy); put((b<.018),gold*.8); put((b>.10)&(b<.125),gold); put((b>.035)&(b<.045),cream)
    k=12; uu=(u*k)%1-.5; vv=(v*k)%1-.5; put((b>.05)&(b<.098)&((abs(uu)+abs(vv))<.32),gold); put((b>.05)&(b<.098)&((abs(uu)+abs(vv))<.16),hexc('#7d1a1f'))
    cx,cy=abs(u-.5),abs(v-.5); med=cx*1.1+cy*1.1; put((med<.30)&(b>.125),navy); put((med<.30)&(med>.285),gold); put(med<.2,hexc('#741a1e')); put((med<.2)&(med>.188),cream); th=np.arctan2(v-.5,u-.5); rr=np.hypot(u-.5,v-.5); put(rr<.07+.03*np.cos(8*th),gold); put(rr<.035+.012*np.cos(8*th),navy)
    g=7; a=((u*g)%1-.5); c=((v*g)%1-.5); put((np.hypot(a,c)<.13+.05*np.cos(4*np.arctan2(c,a)))&(med>.34)&(b>.16),gold*.85)
    n=150; w=np.where(((np.floor(xx*n)+np.floor(yy*n))%2)>0,abs(np.sin(xx*n*np.pi)),abs(np.sin(yy*n*np.pi))); wear=ss(.5,2,fbm(831,2.2,1,40)); col=col*(.72+.35*w)[...,None]*(1+fbm(832,1,20,400)*.06)[...,None]; col=mix(col,col*.6+.16,wear*.4); finish('rug',norm(w*.5+fbm(833,2,2,60)*.1),col,.96,.005)
def m_books():
    r=rng(841); rows=4; col=np.zeros((S,S,3)); h=np.zeros((S,S)); pal=['#4a1712','#1f3324','#1d2a44','#50381b','#2c1b2e','#5a4a2c','#37110f','#20221f']
    for ri in range(rows):
        x=0
        while x<S-10:
            w=min(int(r.uniform(22,58)),S-x); 
            if S-x-w<18: w=S-x
            tall=r.uniform(.72,.98); y0=ri*S//rows; y1=(ri+1)*S//rows; top=int(y0+(1-tall)*(y1-y0)); c=hexc(pal[r.integers(len(pal))])*r.uniform(.8,1.4); t=np.linspace(-1,1,w); rd=np.sqrt(np.clip(1-t*t*.8,0,1)); seg=np.tile(rd,(y1-top,1)); h[top:y1,x:x+w]=seg*.8+.1; col[top:y1,x:x+w]=c*(.55+.5*seg)[...,None]
            for f in(.12,.2,.78,.86):
                yb=int(top+f*(y1-top)); col[yb:yb+4,x+2:x+w-2]=hexc('#b08a3e')*(.5+.5*rd[2:-2])[:,None]; h[yb:yb+4,x:x+w]+=.06
            x+=w
    col*=(1+fbm(842,1.4,8,300)*.1)[...,None]; finish('books',blur(h,1),col,.62,.03)
def m_parchment():
    h=norm(fbm(851,2,2,300)); st=ss(.3,1.8,fbm(852,2.4,1,20)); col=ramp(.6+fbm(853,2,2,200)*.1+fbm(854,.8,40,400)*.03,'#9c8455','#c4ab78','#dcc898','#ecdfba'); col=mix(col,col*hexc('#c9a877')*1.1,st*.5); finish('parchment',h,col,.9,.004)
def m_glass():
    n=6; u=(xx*n+yy*n)%1; v=(xx*n-yy*n)%1; e=np.minimum(np.minimum(u,1-u),np.minimum(v,1-v)); lead=1-ss(.05,.08,e); ID=(np.floor(xx*n+yy*n)*13+np.floor(xx*n-yy*n)*7).astype(int)%64; ID=((np.floor((xx*n+yy*n))%n)*n+(np.floor((xx*n-yy*n))%n)).astype(int)
    col=ramp(.6+per(ID,861)*.2+fbm(862,2,2,60)*.06,'#8a6a2c','#c99a45','#e8c272','#f6dfa0'); col=mix(col,col*0+hexc('#17130f'),lead); finish('glass',norm(lead*.8+per(ID,863)*.06),col,.18+lead*.5,.02)
def m_rune():
    h=norm(fbm(871,2,2,200)*.1+fbm(872,1,30,400)*.03)*.2; g=np.zeros((S,S)); r=rng(873)
    from PIL import ImageDraw
    im=Image.new('L',(S,S)); dr=ImageDraw.Draw(im); n=4; st=S//n
    for i in range(n):
        for j in range(n):
            cx,cy=(i+.5)*st,(j+.5)*st; a=st*.30; pts=[(cx-a*.5,cy-a),(cx-a*.5,cy),(cx-a*.5,cy+a),(cx+a*.5,cy-a),(cx+a*.5,cy),(cx+a*.5,cy+a),(cx,cy-a),(cx,cy),(cx,cy+a)]
            s=0 if r.random()<.5 else 2; dr.line([pts[s*3//2 if s==0 else 6],pts[2 if s==0 else 8]],fill=255,width=13)
            for _ in range(3): p=r.choice(9,2,replace=False); dr.line([pts[p[0]],pts[p[1]]],fill=255,width=13)
    g=blur(np.asarray(im)/255.,1.5); col=ramp(.45+fbm(874,2,2,200)*.12+fbm(875,.9,40,400)*.06,'#1d2024','#383c40','#54585a','#74756f'); col=mix(col,col*0+hexc('#7fe3ff'),g*.95); finish('rune',h+.5-g*.25,col,.7-g*.3,.04)

LAYERS=[ # name, metres per tile, metalness, emissive
('stone_wall',3.0,0,0),('ashlar',3.6,0,0),('mossy_wall',3.0,0,0),('sandstone',3.0,0,0),('brick',2.4,0,0),('infernal',3.0,0,0),('ice_block',3.2,0,0),
('flagstone',3.6,0,0),('flag_moss',3.6,0,0),('sand_floor',3.6,0,0),('infernal_floor',3.6,0,0),('cobble',2.6,0,0),('marble',4.0,0,0),('dwarven',3.0,0,0),
('rock',4.5,0,0),('rock_warm',4.5,0,0),('rock_dark',4.5,0,0),('rock_ice',4.5,0,0),('cliff',5.0,0,0),
('dirt',3.0,0,0),('mud',3.2,0,0),('gravel',2.6,0,0),('sand',3.2,0,0),('snow',3.2,0,0),('grass',2.6,0,0),('forest',2.6,0,0),('straw',1.6,0,0),('thatch',2.0,0,0),('fur',.7,0,0),('moss',1.6,0,0),
('planks',2.0,0,0),('planks_old',2.0,0,0),('wood',1.0,0,0),('beam',1.3,0,0),('bark',1.6,0,0),
('slate',2.4,0,0),('clay',2.2,0,0),('shingle',2.2,0,0),('scale',.8,0,0),('plaster',2.6,0,0),
('iron',1.0,.85,0),('rust',1.0,.3,0),('gold',.8,1,0),('bronze',.8,.9,0),('steel',.9,1,0),('mail',.45,.85,0),('leather',.8,0,0),('cloth',.5,0,0),('bone',.6,0,0),('skin',.6,0,0),('wax',.6,0,0),
('lava',4.0,0,1),('crystal',1.0,0,.0),('rug',1.0,0,0),('books',1.0,0,0),('parchment',.8,0,0),('glass',1.4,0,0),('rune',2.0,0,.9)]
def go(n):
    globals()['m_'+n](); return n
if __name__=='__main__':
    names=[l[0] for l in LAYERS]; only=sys.argv[1:] or names
    os.makedirs(OUT,exist_ok=True)
    with Pool(4) as p:
        for n in p.imap_unordered(go,only): print(n,end=' ',flush=True)
    avg=lambda n:[int(v) for v in np.asarray(Image.open(f'{OUT}/lo/{n}.c.webp').convert('RGB')).reshape(-1,3).mean(0)]
    avd=lambda n:[int(v) for v in np.asarray(Image.open(f'{OUT}/lo/{n}.d.webp').convert('L')).reshape(4,-1).mean(1)]
    json.dump([dict(name=n,scale=s,metal=m,glow=e,avg=avg(n),avd=avd(n)) for n,s,m,e in LAYERS],open(f'{OUT}/layers.json','w'))
