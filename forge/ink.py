"""Turn a render into a two-ink print: edge lines, flat screens, paper. Used for covers, title, places and creatures."""
import sys, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as G, uniform_filter
def hexrgb(h): h=h.lstrip('#'); return np.array([int(h[i:i+2],16) for i in (0,2,4)],float)
def lum(a): return (a[...,0]*.30+a[...,1]*.59+a[...,2]*.11)/255.
def local(L,s=60,k=.75):
    m=G(L,s); v=np.sqrt(np.maximum(G((L-m)**2,s),1e-5)); return np.clip(.5+(L-m)/(v*2.6+.05)*.42*k+(m-.5)*(1-k)*1.2,0,1)
def ink(img,dark,spot,paper='#f3f1ea',mid=None,scale=1.,lo=.26,hi=.62,top=.84,line=1.,hatch=True,alpha=None,local_s=70,local_k=.7,grain=True):
    a=np.asarray(img.convert('RGB')).astype(float); H,W,_=a.shape; L=lum(a)
    if alpha is not None: L=np.where(alpha>.5,L,.9)
    E=local(L,local_s*scale,local_k); S=G(E,1.6*scale)
    # extended difference of gaussians: ink lines that follow form
    s=1.15*scale; D=G(E,s)-.965*G(E,s*1.6); lines=1-np.clip(1+np.tanh((D+.004)*95*line),0,1); lines=G(lines,.45*scale)
    # the chroma edges too, so that a red cloak parts from a green field
    C=np.stack([G(a[...,i]/255.,1.3*scale) for i in range(3)],-1); gx=np.abs(np.diff(C,axis=1,prepend=C[:,:1])).sum(-1); gy=np.abs(np.diff(C,axis=0,prepend=C[:1])).sum(-1); ce=np.clip((np.hypot(gx,gy)-.075)*7,0,1)*line
    lines=np.clip(np.maximum(lines,ce*.9),0,1)
    y,x=np.mgrid[0:H,0:W]; p=4.6*scale; h=(np.sin((x+y)*np.pi*2/p/1.414)+1)/2; h2=(np.sin((x-y)*np.pi*2/p/1.414)+1)/2
    if grain: rng=np.random.default_rng(7); n=G(rng.random((H,W)),.8*scale); n=(n-n.mean())/n.std()*.035; S=S+n
    d,sp,pa=hexrgb(dark),hexrgb(spot),hexrgb(paper); md=hexrgb(mid) if mid else sp*.55+pa*.45
    def soft(t,w=.012): return np.clip((t-S)/w+.5,0,1)
    black=soft(lo); shade=soft((lo+hi)/2); tint=soft(hi); light=soft(top)
    out=np.ones((H,W,3))*pa
    out=out*(1-light[...,None])+md*light[...,None]
    out=out*(1-tint[...,None])+sp*tint[...,None]
    if hatch:
        hk=np.clip((h-.56)*6,0,1)*shade*(1-black); out=out*(1-hk[...,None])+d*hk[...,None]
    else:
        out=out*(1-shade[...,None]*.5)+d*shade[...,None]*.5
    out=out*(1-black[...,None])+d*black[...,None]
    out=out*(1-lines[...,None])+d*lines[...,None]
    return Image.fromarray(np.clip(out,0,255).astype(np.uint8))
if __name__=='__main__':
    f,o,dark,spot=sys.argv[1:5]; im=Image.open(f); ink(im,dark,spot,scale=im.width/1400).save(o)
