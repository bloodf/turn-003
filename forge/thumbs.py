"""The bestiary's pictures, cut to ink and paper so that they print on any colour."""
import sys, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as G, binary_dilation
src,out,cell=sys.argv[1],sys.argv[2],int(sys.argv[3])
im=Image.open(src).convert('RGBA'); W,H=im.size; big=im.resize((W*2,H*2),Image.LANCZOS); a=np.asarray(big).astype(float); c=cell*2; o=np.zeros_like(a)
for y in range(0,H*2,c):
    for x in range(0,W*2,c):
        t=a[y:y+c,x:x+c]; A=t[...,3]>110
        if A.sum()<50: continue
        L=t[...,0]*.3+t[...,1]*.59+t[...,2]*.11; wt=G(A.astype(float),2.2)+1e-6; S=G(np.where(A,L,0),2.2)/wt; wb=G(A.astype(float),9)+1e-6; B=G(np.where(A,L,0),9)/wb
        E=S*.55+(S-B)*1.1+.45*B; v=E[A]; lo,hi=np.percentile(v,[36,76]); hi=max(hi,lo+6)
        ink=A&((E<lo)|(L-S<-15)); pap=A&~ink&(E>hi); edge=binary_dilation(A,iterations=3)&~A; inner=A&~np.roll(A,1,0)|A&~np.roll(A,-1,0)|A&~np.roll(A,1,1)|A&~np.roll(A,-1,1)
        ink|=edge|inner; r=o[y:y+c,x:x+c]; r[pap]=[243,241,234,255]; r[ink]=[21,27,36,255]
rgba=o; al=rgba[...,3:4]/255.; pm=np.concatenate([rgba[...,:3]*al,rgba[...,3:4]],-1).astype(np.uint8)
small=np.asarray(Image.fromarray(pm,'RGBA').resize((W,H),Image.BOX)).astype(float); al=np.maximum(small[...,3:4]/255.,1e-3); small[...,:3]=np.clip(small[...,:3]/al,0,255)
Image.fromarray(small.astype(np.uint8),'RGBA').save(out,quality=88)
