"""Ink the staged pictures: covers, title. Needs forge/.work/covers from scripts/capture/covers.cjs"""
import sys, os, re, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as G, binary_dilation, binary_erosion, distance_transform_edt as DT
sys.path.insert(0,os.path.dirname(__file__))
from ink import hexrgb, lum
W_='forge/.work/covers/'
def mask(f):
    a=np.asarray(Image.open(f).convert('RGB')).astype(int); return ~((a[...,0]>170)&(a[...,1]<90)&(a[...,2]>170))
def inmask(L,m,s):   # local contrast computed only from what is inside the mask
    w=G(m.astype(float),s)+1e-4; mu=G(L*m,s)/w; v=np.sqrt(np.maximum(G(((L-mu)**2)*m,s)/w,2e-5)); return np.clip(.5+(L-mu)/(v*2.5+.03)*.5,0,1)
def lines(E,s,k): D=G(E,s)-.968*G(E,s*1.6); return np.clip(1-np.clip(1+np.tanh((D+.003)*k),0,1),0,1)
def poster(f,dark,spot,paper='#f3f1ea',out=None,size=None,sky=None,bgl=.55,hero_dark=True):
    im=Image.open(W_+f+'.png').convert('RGB'); a=np.asarray(im).astype(float); H,W,_=a.shape; k=W/1050 if H>W else W/1800; L=lum(a); mm=mask(W_+f+'_m.png'); mh=mask(W_+f+'_h.png'); mm=mm&~mh; bg=~(mm|mh)
    d,sp,pa=hexrgb(dark),hexrgb(spot),hexrgb(paper); mid=sp*.42+pa*.58; deep=d*.62+sp*.38
    y,x=np.mgrid[0:H,0:W]; rng=np.random.default_rng(5); n=G(rng.random((H,W)),1.1*k); n=(n-n.mean())/n.std()
    # ---- the world: three flat screens and a hatch, no solid black but in the deepest holes
    Lb=np.where(bg,L,0); w=G(bg.astype(float),26*k)+1e-3; Lf=np.where(bg,L,G(Lb,26*k)/w)
    E=G(Lf,1.9*k); mu=G(E,120*k); sd=np.sqrt(np.maximum(G((E-mu)**2,120*k),1e-5)); N=.5+(E-mu)/(sd*2.6+.04)*.30+(mu-np.median(mu))*1.1; v=((y/H)-.5); N=N+n*.018
    cx,cy=W*.5,H*.45; vg=np.hypot((x-cx)/W,(y-cy)/H); N=N-np.clip(vg-.34,0,1)*.55
    def st(t,w=.014): return np.clip((t-N)/w+.5,0,1)[...,None]
    o=np.ones((H,W,3))*mid; q=st(.60); o=o*(1-q)+sp*q; q=st(.36); o=o*(1-q)+(sp*.72+d*.28)*q; p=5.2*k; h=np.clip(((np.sin((x+y)*2*np.pi/p/1.414)+1)/2-.5)*5,0,1)[...,None]; q=st(.30)*h; o=o*(1-q)+d*q; q=st(.14); o=o*(1-q)+d*q; q=np.clip((N-.86)/.02+.5,0,1)[...,None]; o=o*(1-q)+pa*q
    ln=G(lines(E,1.5*k,70*bgl),.5*k)[...,None]*.9; o=o*(1-ln)+d*ln
    # ---- figures stand clear of it: a paper halo, then their own ink
    def figure(m,ramp,line,halo,edge):
        nonlocal o
        if not m.any(): return
        out_=DT(~m); hl=np.clip((halo-out_)/1.2+.5,0,1)[...,None]; o=o*(1-hl)+pa*hl
        F=inmask(np.where(m,L,0),m,46*k); F=G(F,1.1*k)+n*.014; c=np.ones((H,W,3))*ramp[0][1]
        for t,col in ramp[1:]: qq=np.clip((t-F)/.02+.5,0,1)[...,None]; c=c*(1-qq)+col*qq
        l=G(lines(np.where(m,F,.5),1.25*k,85)*line,.45*k)[...,None]; c=c*(1-l)+d*l; e=np.clip((edge-DT(m))/1.1+.5,0,1)[...,None]; c=c*(1-e)+d*e; M=m[...,None].astype(float); M=np.clip(G(M[...,0],.6),0,1)[...,None]; o=o*(1-M)+c*M
    figure(mm,[(1,pa),(.80,mid),(.60,sp),(.40,deep),(.25,d)],1,4.2*k,3.0*k)
    figure(mh,[(1,mid),(.86,sp),(.70,deep),(.56,d)] if hero_dark else [(1,pa),(.8,mid),(.6,sp),(.36,d)],.5,3.6*k,2.2*k)
    r=Image.fromarray(np.clip(o,0,255).astype(np.uint8))
    if size: r=r.resize(size,Image.LANCZOS)
    if out: r.save(out,quality=82,method=6)
    return r
def inks():
    P={}
    for f in sorted(os.listdir('src/modules')):
        if f.endswith('.txt'):
            m=re.search(r'^ink: (\S+) (\S+)',open('src/modules/'+f).read(),re.M); P[f[:-4]]=(m[1],m[2])
    return P
if __name__=='__main__':
    os.makedirs('public/ui/covers',exist_ok=True)
    for k,(d,s) in inks().items():
        if (len(sys.argv)<2 or k in sys.argv[1:]) and os.path.exists(W_+k+'.png'): poster(k,d,s,out=f'public/ui/covers/{k}.webp',size=(600,800)); print(k,os.path.getsize(f'public/ui/covers/{k}.webp'))
    if os.path.exists(W_+'title.png') and (len(sys.argv)<2 or 'title' in sys.argv): poster('title','#14263d','#e4572e',out='public/ui/title.webp',size=(1800,1050)); print('title',os.path.getsize('public/ui/title.webp'))
