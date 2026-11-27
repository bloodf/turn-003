"""All static models. Each function returns an Asset. Fronts face -Y; wall pieces have their back on y=0."""
from kit import *
REG={}
def asset(cat,**meta):
    def d(fn):
        REG[fn.__name__]=(fn,cat,meta); return fn
    return d
def multi(cat,names,**meta):
    def d(fn):
        for n,kw in names.items(): REG[n]=((lambda a,kw=kw:fn(a,**kw)),cat,meta)
        return fn
    return d
ST='ashlar'
def oct_(r): return r
# ======================================================= MASONRY
def base_cap(a,r,h,mat=ST,n=4,sq=True):
    pass
@asset('masonry',tags=['pillar'],fit='pillar')
def pillar_round(a):
    a.box(.82,.82,.22,mat=ST,bev=.03); a.box(.7,.7,.12,z=.22,mat=ST,bev=.03)
    a.lathe([(.33,0),(.345,.04),(.33,.08),(.29,.1),(.275,.16),(.27,1.2),(.265,1.22),(.27,1.24),(.262,2.2),(.258,2.22),(.262,2.24),(.25,3.0),(.28,3.04),(.28,3.09),(.25,3.12),(.28,3.2),(.36,3.38)],z=.34-.05,mat=ST,n=20,smooth=50)
    a.box(.84,.84,.18,z=3.62,mat=ST,bev=.03); a.box(.7,.7,.1,z=3.54,mat=ST,bev=.03)
@asset('masonry',tags=['pillar'],fit='pillar')
def pillar_square(a):
    a.box(.9,.9,.3,mat=ST,bev=.04); a.box(.76,.76,.1,z=.3,mat=ST,bev=.03)
    for i in range(6): a.box(.6+a.r.uniform(-.015,.015),.6+a.r.uniform(-.015,.015),.49,z=.4+i*.5,mat=ST,bev=.028,rz=a.r.uniform(-1.5,1.5))
    a.box(.74,.74,.1,z=3.4,mat=ST,bev=.03); a.box(.9,.9,.3,z=3.5,mat=ST,bev=.05)
@asset('masonry',tags=['pillar','gothic'],fit='pillar')
def pillar_gothic(a):
    a.lathe([(.5,0),(.5,.2),(.44,.26),(.44,.32),(.4,.4)],mat=ST,n=8,rz=22.5); 
    a.cyl(.22,3.2,z=.38,mat=ST,n=12)
    for i in range(8):
        t=i*tau/8; x,y=math.cos(t)*.25,math.sin(t)*.25
        a.lathe([(.12,.38),(.12,.44),(.075,.5),(.07,1.75),(.09,1.77),(.09,1.83),(.07,1.85),(.07,3.15),(.1,3.2),(.13,3.34)],x,y,mat=ST,n=8,cap=False)
    a.lathe([(.3,3.2),(.4,3.34),(.46,3.4),(.46,3.46),(.52,3.54),(.52,3.7)],mat=ST,n=8,rz=22.5)
@asset('masonry',tags=['pillar','ruin'],fit='pillar',col='circle')
def pillar_broken(a):
    a.box(.82,.82,.22,mat=ST,bev=.04); a.box(.7,.7,.12,z=.22,mat=ST,bev=.03)
    bm=a.lathe([(.28,0),(.27,.5),(.27,.9),(.27,1.2),(.255,1.45),(.2,1.6),(0,1.5)],z=.34,mat=ST,n=18,cap=False)
    for v in bm.verts:
        if v.co.z>1.3: v.co.z+=noise.noise(v.co*4)*.3-.05; v.co.x*=1+noise.noise(v.co*5)*.12
    for i in range(5): a.rock(a.r.uniform(.08,.2),a.r.uniform(-.6,.6),a.r.uniform(-.6,.6),.05,ST,sub=1)
    with a.at(.75,.3,.26,ry=90,rz=24): a.lathe([(.26,0),(.262,.5),(.25,.8),(.1,.86)],mat=ST,n=16)
@asset('masonry',tags=['pillar','dwarven'],fit='pillar')
def pillar_dwarven(a):
    a.lathe([(.62,0),(.62,.25),(.5,.4),(.5,.5)],mat='dwarven',n=8,rz=22.5,smooth=20); a.lathe([(.4,.5),(.4,1.6),(.46,1.66),(.46,2.0),(.4,2.06),(.4,3.2),(.58,3.5),(.62,3.5),(.62,3.7)],mat='dwarven',n=8,rz=22.5,smooth=20)
    for i in range(8):
        t=i*tau/8; a.box(.13,.03,.22,math.cos(t)*.43,math.sin(t)*.43,1.72,mat='gold',rz=math.degrees(t)+90,bev=.02)
    a.lathe([(.405,2.9),(.42,2.92),(.42,2.98),(.405,3.0)],mat='gold',n=8,rz=22.5,cap=False); a.lathe([(.405,.72),(.42,.74),(.42,.80),(.405,.82)],mat='gold',n=8,rz=22.5,cap=False)
@asset('masonry',tags=['pillar','desert'],fit='pillar')
def pillar_desert(a):
    a.lathe([(.5,0),(.5,.18),(.38,.22)],mat='sandstone',n=16); 
    pr=[(.32,.2),(.37,.6),(.34,1.8),(.3,2.6),(.31,2.65),(.31,2.72),(.29,2.76),(.34,2.9),(.52,3.35),(.55,3.42),(.5,3.45)]
    a.lathe(pr,mat='sandstone',n=20); 
    for z in(2.3,2.42,2.54): a.lathe([(.315,z),(.335,z+.02),(.335,z+.05),(.31,z+.07)],mat='gold' if z==2.42 else 'sandstone',n=20,cap=False)
    a.box(.9,.9,.25,z=3.45,mat='sandstone',bev=.03)
@asset('masonry',tags=['outdoor'],col='box')
def obelisk(a):
    a.box(1.1,1.1,.3,mat=ST,bev=.04); a.box(.86,.86,.2,z=.3,mat=ST,bev=.03); a.box(.62,.62,2.6,z=.5,mat='rune',taper=.7,bev=.02,glow=0); a.box(.434,.434,.36,z=3.1,mat=ST,taper=.02,bev=0)
@asset('masonry',tags=['decor'],col='box')
def plinth(a):
    a.box(.8,.8,.15,mat=ST,bev=.025); a.box(.62,.62,.7,z=.15,mat=ST,bev=.02); a.box(.78,.78,.14,z=.85,mat=ST,bev=.03)
def arch_poly(w,h,t,n=10,pointed=True,outer=True):
    """arch ring polygon pieces: list of voussoir polys"""
    out=[]; hw=w/2; sp=h-hw*(1.15 if pointed else 1)
    def pt(f,o):
        if pointed:
            R=hw*1.55; cx=R-hw; am=math.acos(cx/R); a_=am*f
            x,z=-(R+o)*math.cos(a_)+cx,sp+(R+o)*math.sin(a_); return(x,z)
        a_=math.pi/2*f; return(-(hw+o)*math.cos(a_),sp+(hw+o)*math.sin(a_))
    for i in range(n):
        p=[pt(i/n,0),pt((i+1)/n,0),pt((i+1)/n,t),pt(i/n,t)]; 
        p=[(min(x,0),z) for x,z in p]
        out.append(p); out.append([(-x,z) for x,z in p[::-1]])
    return out,sp
def spandrel(a,w,h,t,n,pointed,X,H,d=.36):
    ps,sp=arch_poly(w,h,t,n,pointed); out=[p[3] for p in ps[::2]]+[ps[-2][2]]   # outer curve left half, bottom to top
    for i in range(len(out)-1):
        (x0,z0),(x1,z1)=out[i],out[i+1]
        for s in(1,-1): a.extr([(s*-X,z0),(s*x0,z0),(s*x1,z1),(s*-X,z1)] if i<len(out)-1 else [],d,mat=ST)
    z=out[-1][1]
    if H>z+.01: a.box(2*X,d,H-z,0,0,z,mat=ST,bev=0)
    a.box(.01,d,.01,0,0,H-.01,mat=ST,bev=0)
@asset('masonry',tags=['frame'],fit='edge')
def bars_panel(a):
    for i in range(11): a.cyl(.022,2.42,-.69+i*.138,0,0,mat='iron',n=6)
    for z in(.05,.85,1.6,2.3): a.box(1.5,.06,.07,0,0,z,mat='rust',bev=.01)
@asset('masonry',tags=['frame'],fit='edge')
def frame_arch(a):
    spandrel(a,1.14,2.5,.2,5,True,.75,2.72)
    ps,sp=arch_poly(1.14,2.5,.2,5)
    for p in ps: a.extr(p,.5,mat=ST,bev=.014)
    for s in(-1,1):
        for i in range(4): a.box(.2,.5+(i%2)*.03,sp/4-.006,s*.67,0,i*sp/4,mat=ST,bev=.018)
    a.box(.16,.56,.26,0,0,2.6,mat=ST,bev=.02,taper=1.2)
@asset('masonry',tags=['frame'],fit='edge')
def frame_stone(a):
    for s in(-1,1):
        for i in range(4): a.box(.19,.5+(i%2)*.03,.575-.006,s*.665,0,i*.575,mat=ST,bev=.018)
    a.box(1.56,.54,.28,0,0,2.3,mat=ST,bev=.03); a.box(.24,.6,.34,0,0,2.28,mat=ST,bev=.03,taper=1.15)
@asset('masonry',tags=['frame'],fit='edge')
def frame_wood(a):
    for s in(-1,1): a.box(.15,.44,2.34,s*.64,0,0,mat='beam',bev=.018)
    a.box(1.5,.46,.18,0,0,2.3,mat='beam',bev=.02)
@asset('masonry',tags=['frame'],fit='edge2')
def frame_gate(a):
    spandrel(a,2.6,3.15,.24,7,False,1.5,3.42)
    ps,sp=arch_poly(2.6,3.15,.24,7,False)
    for p in ps: a.extr(p,.56,mat=ST,bev=.016)
    for s in(-1,1):
        for i in range(3): a.box(.24,.56+(i%2)*.04,sp/3-.006,s*1.42,0,i*sp/3,mat=ST,bev=.02)
    a.box(.26,.62,.36,0,0,3.12,mat=ST,bev=.03,taper=1.2)
@asset('masonry',tags=['frame'],fit='edge')
def frame_cave(a):
    for i in range(9):
        t=math.pi*i/8; a.rock(.36+a.r.random()*.14,-math.cos(t)*.78,0,.25+math.sin(t)*2.35 if 0<i<8 else .2,'rock',sub=2,sx=.8,sz=1)
    for s in(-1,1):
        for i in range(3): a.rock(.38,s*.82,a.r.uniform(-.1,.1),.45+i*.6,'rock',sub=2,sx=.7,sz=1)
@asset('masonry',tags=['frame'],fit='edge')
def window_stone(a):
    ps,sp=arch_poly(.62,1.2,.14,4)
    with a.at(z=1.1):
        for p in ps: a.extr(p,.46,mat=ST,bev=.01)
        for s in(-1,1): a.box(.14,.46,sp,s*.38,0,0,mat=ST,bev=.014)
        a.box(1.0,.56,.12,0,0,-.12,mat=ST,bev=.02); a.box(.05,.06,1.15,0,0,0,mat=ST,bev=.01); a.box(.62,.06,.05,0,0,.5,mat=ST,bev=.01)
        a.box(.62,.012,1.0,0,0,0,mat='glass',bev=0,glow=.35)
@asset('masonry',tags=['frame'],fit='edge')
def window_wood(a):
    with a.at(z=1.05):
        for s in(-1,1): a.box(.1,.42,1.1,s*.45,0,0,mat='beam',bev=.012); a.box(.34,.04,.98,s*.68,-.24,.06,mat='planks',bev=.008); a.box(.3,.02,.07,s*.68,-.27,.2,mat='beam',bev=.006); a.box(.3,.02,.07,s*.68,-.27,.8,mat='beam',bev=.006)
        a.box(1.1,.5,.1,0,0,-.08,mat='beam',bev=.014); a.box(1.0,.44,.1,0,0,1.08,mat='beam',bev=.014); a.box(.045,.06,1.1,0,0,0,mat='beam',bev=.008); a.box(.8,.06,.045,0,0,.52,mat='beam',bev=.008)
        a.box(.8,.012,1.08,0,0,0,mat='glass',bev=0,glow=.45)
@asset('masonry',tags=['frame'],fit='edge')
def arrow_slit(a):
    with a.at(z=.9):
        for s in(-1,1): a.box(.2,.46,1.4,s*.16,0,0,mat=ST,bev=.03)
        a.box(.56,.5,.16,0,0,-.14,mat=ST,bev=.02); a.box(.56,.5,.16,0,0,1.38,mat=ST,bev=.02); a.box(.14,.40,1.4,0,0,0,mat='rock_dark',bev=0,tint=(.12,.12,.14))
@asset('masonry',tags=['castle'],fit='edge')
def merlon(a):
    a.box(1.5,.4,.62,mat=ST,bev=.02); a.box(1.54,.5,.09,z=.6,mat=ST,bev=.02); a.box(.8,.4,.62,z=.66,mat=ST,bev=.025); a.box(.9,.5,.1,z=1.26,mat=ST,bev=.03); a.box(.8,.36,.1,z=1.36,mat=ST,taper=(.9,.3),bev=.02)
@asset('masonry',tags=['castle'],fit='edge')
def balustrade(a):
    a.box(1.5,.24,.12,mat=ST,bev=.02); a.box(1.5,.28,.12,z=.92,mat=ST,bev=.03)
    for i in range(5): a.lathe([(.06,.12),(.085,.15),(.085,.19),(.05,.24),(.09,.42),(.075,.56),(.045,.72),(.08,.78),(.08,.84),(.06,.92)],-.6+i*.3,mat=ST,n=8)
@asset('masonry',tags=['castle'],fit='edge')
def rail_wood(a):
    for x in(-.72,0,.72): a.box(.09,.09,1.0,x,0,0,mat='beam',bev=.012)
    a.box(1.5,.1,.07,z=.98,mat='beam',bev=.014); a.box(1.5,.05,.07,z=.5,mat='beam',bev=.01)
@asset('masonry',tags=['castle'],col='box')
def buttress(a):
    a.box(.9,1.0,1.3,0,-.5,0,mat=ST,bev=.03); a.box(.8,.8,.2,0,-.42,1.3,mat=ST,taper=(1,.8),bev=.02); a.box(.72,.62,1.3,0,-.33,1.5,mat=ST,bev=.03); a.box(.7,.6,.5,0,-.3,2.8,mat=ST,taper=(1,.15),bev=.02)
@asset('masonry',tags=['decor','wall'],mount='wall')
def gargoyle(a):
    a.box(.5,.35,.3,0,-.17,2.5,mat=ST,bev=.03); a.box(.36,.3,.2,0,-.15,2.32,mat=ST,bev=.03,taper=1.3)
    S=[('s',(0,-.32,3.02),.2,(1,1.1,1.2)),('s',(0,-.52,3.26),.13,(1,1.2,1)),('c',(0,-.6,3.22),(0,-.72,3.18),.07,.055),('c',(0,-.3,3.1),(0,-.46,3.25),.13,.1)]
    for s in(-1,1): S+=[('c',(s*.07,-.5,3.34),(s*.2,-.42,3.5),.035,.012),('c',(s*.16,-.4,3.05),(s*.2,-.52,2.84),.07,.05),('s',(s*.2,-.56,2.82),.07,(1,1.3,.6)),('s',(s*.17,-.3,2.88),.14,(.8,1.2,1)),('c',(s*.12,-.2,3.18),(s*.42,-.05,3.55),.05,.03),('b',(s*.36,-.08,3.25),(.3,.03,.45),(0,s*-24,s*18)),('s',(s*.05,-.63,3.3),.03)]
    a.sculpt(S,ST,.018,1100,3,disp=lambda p:noise.noise(p*9)*.012)
def stone_person(a,kind,mat=ST,z=.0,tris=2200):
    S=[('c',(0,0,1.32),(0,0,.95),.2,.15),('s',(0,0,1.42),.21,(1.15,.7,.6)),('c',(0,0,1.5),(0,-.02,1.62),.07,.06),('s',(0,-.02,1.74),.115,(.9,1.05,1.15))]
    for s in(-1,1): S+=[('c',(s*.1,0,.95),(s*.12,0,.5),.13,.09),('c',(s*.12,0,.5),(s*.13,.02,.1),.09,.07),('b',(s*.13,-.07,.05),(.13,.28,.1)),('s',(s*.26,0,1.45),.1)]
    if kind=='knight':
        S+=[('c',(.27,0,1.42),(.34,-.06,1.15),.075,.065),('c',(.34,-.06,1.15),(.06,-.26,1.1),.065,.05),('c',(-.27,0,1.42),(-.34,-.06,1.15),.075,.065),('c',(-.34,-.06,1.15),(-.06,-.26,1.1),.065,.05),('b',(0,-.27,.6),(.07,.03,1.15)),('b',(0,-.27,1.18),(.34,.05,.05)),('c',(0,-.27,1.2),(0,-.27,1.4),.025,.025),('s',(0,-.27,1.42),.04),('c',(0,.02,1.2),(0,.04,.72),.24,.27),('s',(0,-.02,1.78),.125,(.95,1.1,1.1)),('b',(0,-.14,1.72),(.03,.05,.18)),('c',(0,.05,1.88),(0,.12,1.95),.03,.04),('s',(.28,0,1.49),.13,(1,1,.7)),('s',(-.28,0,1.49),.13,(1,1,.7)),('b',(0,.14,.9),(.52,.05,1.3),(4,0,0))]
    if kind=='robed':
        S+=[('c',(0,0,1.1),(0,.02,.05),.2,.36),('s',(0,.01,1.75),.16,(1,1.05,1.2)),('c',(0,.02,1.62),(0,.03,1.45),.14,.2),('c',(.25,0,1.42),(.3,-.12,1.2),.09,.09),('c',(.3,-.12,1.2),(.03,-.25,1.3),.09,.06),('c',(-.25,0,1.42),(-.3,-.12,1.2),.09,.09),('c',(-.3,-.12,1.2),(-.03,-.25,1.3),.09,.06),('s',(0,-.28,1.36),.06)]
    if kind=='angel':
        S+=[('c',(0,0,1.1),(0,.02,.05),.17,.32),('c',(.25,0,1.42),(.28,-.1,1.15),.06,.055),('c',(.28,-.1,1.15),(.03,-.22,1.32),.055,.045),('c',(-.25,0,1.42),(-.28,-.1,1.15),.06,.055),('c',(-.28,-.1,1.15),(-.03,-.22,1.32),.055,.045)]
        for s in(-1,1):
            for i in range(6): S+=[('c',(s*.1,.14,1.45),(s*(.3+i*.09),.3+.02*i,2.05-i*.27),.06,.035)]
            S+=[('c',(s*.1,.14,1.4),(s*.42,.28,2.1),.07,.06)]
    if kind=='king':
        S+=[('c',(0,0,1.1),(0,.02,.05),.22,.33),('c',(.27,0,1.42),(.4,-.05,1.2),.08,.07),('c',(.4,-.05,1.2),(.45,-.28,1.3),.07,.05),('c',(.45,-.3,.05),(.45,-.3,2.05),.03,.03),('s',(.45,-.3,2.1),.07),('c',(-.27,0,1.42),(-.36,-.02,1.15),.08,.07),('c',(-.36,-.02,1.15),(-.2,-.24,1.05),.07,.05),('s',(0,-.1,1.62),.09,(1,.7,1.4))]
        for i in range(7): t=i*tau/7; S+=[('c',(math.cos(t)*.1,math.sin(t)*.11-.02,1.82),(math.cos(t)*.125,math.sin(t)*.13-.02,1.94),.025,.012)]
    S=[tuple([s[0]]+[(tuple(q if i!=2 else q+z for i,q in enumerate(v)) if j==0 or (s[0]=='c' and j==1) else v) for j,v in enumerate(s[1:])]) for s in S]
    a.sculpt(S,mat,.018,tris,3,disp=lambda p:noise.noise(p*7)*.01+noise.noise(p*20)*.004)
@multi('masonry',dict(statue_knight=dict(k='knight'),statue_robed=dict(k='robed'),statue_angel=dict(k='angel'),statue_king=dict(k='king')),tags=['statue','decor'],col='box')
def _statue(a,k):
    a.box(1.0,1.0,.16,mat=ST,bev=.03); a.box(.8,.8,.5,z=.16,mat=ST,bev=.025); a.box(.95,.95,.14,z=.66,mat=ST,bev=.04); stone_person(a,k,z=.78)
@asset('masonry',tags=['statue','ruin'],col='box')
def statue_broken(a):
    a.box(1.0,1.0,.16,mat=ST,bev=.03); a.box(.8,.8,.5,z=.16,mat=ST,bev=.025); a.box(.95,.95,.14,z=.66,mat=ST,bev=.04)
    S=[]; 
    for s in(-1,1): S+=[('c',(s*.1,0,1.55),(s*.12,0,1.25),.12,.09),('c',(s*.12,0,1.25),(s*.13,.02,.9),.09,.07),('b',(s*.13,-.07,.83),(.13,.28,.1))]
    a.sculpt(S,ST,.018,700,2,disp=lambda p:noise.noise(p*8)*.02)
    with a.at(.85,-.5,.14,ry=80,rz=30): a.sculpt([('c',(0,0,.3),(0,0,0),.2,.15),('s',(0,0,.4),.21,(1.15,.7,.6)),('s',(.26,0,.4),.1),('s',(-.26,0,.4),.1)],ST,.02,500,2)
    for i in range(6): a.rock(a.r.uniform(.07,.17),a.r.uniform(-.9,.9),a.r.uniform(-.9,.2),.04,ST,sub=1)
@multi('masonry',dict(rubble_small=dict(n=14,R=.5,s=.14),rubble_large=dict(n=26,R=.9,s=.26)),tags=['rubble','decor'],col='none')
def _rubble(a,n,R,s):
    for i in range(n):
        t=a.r.random()*tau; q=R*a.r.random()**.7; sz=s*a.r.uniform(.35,1.15)*(1.2-q/R*.6); h=max(0,(R-q)*.35*a.r.random())
        if a.r.random()<.5: a.box(sz*1.6,sz*1.1,sz,math.cos(t)*q,math.sin(t)*q,h,mat=ST,rx=a.r.uniform(-25,25),ry=a.r.uniform(-25,25),rz=a.r.uniform(0,360),bev=.025)
        else: a.rock(sz*.8,math.cos(t)*q,math.sin(t)*q,h+sz*.3,ST,sub=1)
@asset('masonry',tags=['castle'],col='none',fit='ceil')
def beam_ceiling(a):
    a.box(.26,3.0,.28,z=-.28,mat='beam',bev=.025)
    for y in(-1.2,1.2): a.box(.27,.09,.3,0,y,-.29,mat='iron',bev=.005)
@asset('masonry',tags=['stairs'],fit='stairs',col='none')
def stairs_stone(a):   # 2 wide (3m) x 4 long (6m), rises 4m toward +Y; origin at low end centre
    n=20
    for i in range(n): a.box(2.9,6/n+.03,4/n*(i+1),0,6/n*(i+.5),0,mat='flagstone',bev=.018,grain=0)
    for s in(-1,1):
        a.extr([(0,0),(0,.5),(6,4.5),(6,0)],.2,s*1.42,3,0,mat=ST,rz=90,bev=.02) if False else None
        bm=a.box(.2,6.0,.9,s*1.44,3,-.1,mat=ST,bev=.0)
        for v in bm.verts: v.co.z=v.co.z+4*(v.co.y/6) if v.co.z>.3 else 0
@asset('masonry',tags=['stairs'],fit='stairs',col='none')
def stairs_wood(a):
    n=16
    for i in range(n): a.box(2.7,6/n+.06,.06,0,6/n*(i+.5),4/n*(i+1)-.06,mat='planks',bev=.01,grain=0); 
    for s in(-1,1):
        bm=a.box(.1,6.0,.34,s*1.36,3,0,mat='beam',bev=0)
        for v in bm.verts: v.co.z+=4*(v.co.y/6)-.2
        bm=a.box(.08,6.0,.08,s*1.38,3,1.0,mat='beam',bev=0)
        for v in bm.verts: v.co.z+=4*(v.co.y/6)
        for y in range(7): a.box(.07,.07,1.0,s*1.38,y,y*.667,mat='beam',bev=.01)
@asset('masonry',tags=['stairs'],fit='spiral',col='none')
def stairs_spiral(a):  # fits radius 2.1, full turn per 4m, clockwise from +X... starts angle 0 going counterclockwise
    n=24; a.cyl(.28,4.0,mat=ST,n=12)
    for i in range(n):
        t0=tau*i/n; t1=tau*(i+1.06)/n; z=4*(i+1)/n; R=2.05; r=.24; bm=bmesh.new(); P=[]
        for zz in(z-.26,z):
            P.append([bm.verts.new((math.cos(t)*q,math.sin(t)*q,zz)) for t,q in((t0,r),(t0,R),((t0+t1)/2,R*1.01),(t1,R),(t1,r))])
        bm.faces.new(P[1]); bm.faces.new(P[0][::-1])
        for k in range(5): bm.faces.new((P[0][k],P[0][(k+1)%5],P[1][(k+1)%5],P[1][k]))
        bmesh.ops.recalc_face_normals(bm,faces=bm.faces); a.add(bm,'flagstone',smooth=20)
# ======================================================= DOORS
def planked(a,w,h,th=.07,n=5,mat='planks',iron='iron',arch=False,x0=None):
    x0=-w/2 if x0 is None else x0
    for i in range(n):
        pw=w/n; x=x0+pw*(i+.5); hh=h
        if arch: hh=h-abs((x-(x0+w/2))/(w/2))**2.2*.3
        k=a.r.uniform(.62,.9); a.box(pw-.008,th,hh,x,0,0,mat='wood',bev=.008,grain=2,tint=(k,k*.95,k*.9))
def straps(a,w,zs,th,mat='iron'):
    for z in zs:
        for s in(-1,1):
            a.box(w*.86,.014,.07,-w*.05,s*(th/2+.006),z,mat=mat,bev=.005)
            a.rivets([(-w*.42+i*w*.2,s*(th/2+.012),z+.035) for i in range(5)],.018) if s>0 else a.rivets([(-w*.42+i*w*.2,-(th/2+.012),z+.035) for i in range(5)],.018)
@asset('doors',tags=['leaf'],fit='leaf',col='none')   # origin at hinge: x from 0..1.1
def door_wood(a):
    with a.at(.55,0,0): planked(a,1.1,2.3); straps(a,1.1,(.35,1.15,1.9),.07); a.box(.14,.1,.2,.42,0,1.0,mat='iron',bev=.02); [a.tube([(.42+math.cos(t)*.05,s*.075,1.08+math.sin(t)*.05) for t in[tau*i/10 for i in range(10)]],.011,closed=True,n=5) for s in(-1,1)]
@asset('doors',tags=['leaf'],fit='leaf',col='none')
def door_iron(a):
    with a.at(.55,0,0):
        a.box(1.1,.05,2.3,mat='rust',bev=.01)
        for s in(-1,1):
            for z in(0.02,.75,1.5,2.16): a.box(1.08,.02,.12,0,s*.032,z,mat='iron',bev=.008); a.rivets([(-.48+i*.16,s*.044,z+.06) for i in range(7)],.02)
            for x in(-.49,.49): a.box(.1,.02,2.26,x,s*.03,.02,mat='iron',bev=.008)
            a.box(.34,.02,.14,0,s*.034,1.66,mat='iron',bev=.01)
        a.box(.12,.12,.26,.42,0,1.0,mat='iron',bev=.02)
@asset('doors',tags=['leaf'],fit='leaf',col='none')
def door_cell(a):
    with a.at(.55,0,0):
        for i in range(8): a.cyl(.02,2.25,-.49+i*.14,0,.02,mat='iron',n=6)
        for z in(.04,.8,1.5,2.2): a.box(1.08,.05,.06,0,0,z,mat='rust',bev=.008)
        a.box(.2,.1,.24,.42,0,.95,mat='rust',bev=.02)
@asset('doors',tags=['leaf'],fit='leaf',col='none')
def gate_leaf(a):    # 1.28 wide, 2.75 tall
    with a.at(.64,0,0): planked(a,1.27,2.7,.1,6); straps(a,1.27,(.4,1.3,2.2),.1); a.box(1.2,.16,.12,0,.05,1.6,mat='beam',bev=.02)
@asset('doors',tags=['leaf'],fit='leaf',col='none')
def portcullis(a):   # centred, 2.6 wide
    for i in range(9): a.box(.07,.07,2.95,-1.2+i*.3,0,.12,mat='rust',bev=.012); a.box(.07,.07,.16,-1.2+i*.3,0,-.02,mat='iron',rx=180,taper=.05,bev=0) if False else a.lathe([(0,0),(.05,.14)],-1.2+i*.3,0,0,mat='iron',n=4,rz=45)
    for j in range(7): a.box(2.6,.05,.07,0,0,.35+j*.42,mat='rust',bev=.01)
@asset('doors',tags=['leaf'],fit='leaf',col='none')
def door_secret(a):
    with a.at(.55,0,0):
        for s in(-1,1): a.box(.05,.34,2.3,s*.52,0,0,mat='wood',bev=.008)
        for z in(0,.55,1.1,1.65,2.24): a.box(1.05,.34,.05,0,0,z,mat='wood',bev=.008)
        a.box(1.0,.03,2.24,0,.14,.03,mat='wood',bev=0)
        for z in(.05,.6,1.15,1.7): a.box(.98,.2,.42,0,0,z,mat='books',bev=0,uvs=1,grain=2)
@asset('doors',tags=['floor'],col='none')
def trapdoor(a):
    for s in(-1,1): a.box(1.3,.1,.08,0,s*.6,0,mat='beam',bev=.012); a.box(.1,1.3,.08,s*.6,0,0,mat='beam',bev=.012)
    with a.at(z=.03): 
        for i in range(5): a.box(.215,1.08,.05,-.44+i*.22,0,0,mat='planks',bev=.008)
        for y in(-.3,.3): a.box(1.04,.08,.02,0,y,.05,mat='iron',bev=.004); a.rivets([(-.44+i*.22,y,.07) for i in range(5)],.015)
        a.tube([(math.cos(t)*.07,.0+math.sin(t)*.07-.38,.07) for t in[tau*i/12 for i in range(12)]],.012,closed=True)
# ======================================================= LIGHT
def torchhead(a,x,y,z,h=.5):
    a.lathe([(.022,0),(.03,h*.7),(.045,h*.8),(.05,h)],x,y,z,mat='wood',n=8); a.lathe([(.045,h*.72),(.06,h*.8),(.062,h*.98),(.03,h*1.03)],x,y,z,mat='cloth',n=8,tint=(.25,.16,.09)); a.lathe([(.05,h*.74),(.066,h*.76),(.066,h*.8),(.05,h*.82)],x,y,z,mat='iron',n=8,cap=False)
@asset('light',tags=['wall','light'],mount='wall',col='none')
def torch_wall(a):
    a.box(.12,.02,.34,0,-.012,1.62,mat='iron',bev=.008); a.rivets([(0,-.024,1.68),(0,-.024,1.9)],.014); a.tube([(0,-.02,1.72),(0,-.1,1.66),(0,-.17,1.7)],.014); a.tube([(.062*math.cos(t),-.2+.062*math.sin(t),1.82) for t in[tau*i/10 for i in range(10)]],.011,closed=True,n=5); a.tube([(0,-.02,1.86),(0,-.14,1.82)],.012)
    with a.at(0,-.17,1.56,rx=14): torchhead(a,0,0,0,.52)
    a.flame(0,-.30,2.12,.34); a.lamp(0,-.42,2.2,(1,.50,.17),1.,9)
@asset('light',tags=['floor','light'],col='circle')
def brazier(a):
    for i in range(3):
        t=i*tau/3+.5; a.tube([(math.cos(t)*.36,math.sin(t)*.36,0),(math.cos(t)*.2,math.sin(t)*.2,.4),(math.cos(t)*.3,math.sin(t)*.3,.92)],.022,'iron'); a.ball(.035,math.cos(t)*.36,math.sin(t)*.36,.03,n=8)
    a.lathe([(.19,.40),(.21,.42),(.19,.44)],mat='iron',n=14,cap=False); a.lathe([(.08,.66),(.26,.72),(.36,.86),(.38,.9),(.36,.9),(.3,.82),(.1,.78),(0,.78)],mat='iron',n=16,cap=False)
    for i in range(16): t=a.r.random()*tau; q=a.r.random()*.25; a.rock(.07,math.cos(t)*q,math.sin(t)*q,.84+a.r.random()*.05,'lava',sub=1,glow=.9,tint=(1,.6,.4))
    a.flame(0,0,.92,.62); a.lamp(0,0,1.5,(1,.48,.16),1.5,11)
@asset('light',tags=['floor','light'],col='circle')
def brazier_stone(a):
    a.lathe([(.42,0),(.42,.12),(.3,.18),(.24,.3),(.22,.6),(.3,.74),(.5,.84),(.56,1.0),(.5,1.02),(.42,.92),(0,.9)],mat=ST,n=8,rz=22.5,smooth=25)
    for i in range(20): t=a.r.random()*tau; q=a.r.random()*.36; a.rock(.08,math.cos(t)*q,math.sin(t)*q,.95,'lava',sub=1,glow=.9,tint=(1,.6,.4))
    a.flame(0,0,1.0,.75); a.lamp(0,0,1.7,(1,.48,.16),1.7,12)
def candle(a,x,y,z,h,r=.022,lit=True):
    a.lathe([(r*1.15,0),(r,.01),(r*.96,h),(r*.6,h-.004),(0,h-.008)],x,y,z,mat='wax',n=8,cap=False,glow=.12); a.cyl(.0025,.018,x,y,z+h-.006,mat='cloth',n=4,tint=(.1,.08,.06))
    if lit: a.flame(x,y,z+h+.01,.055,'candle')
@asset('light',tags=['floor','light','candle'],col='none')
def candles_floor(a):
    for i in range(9):
        t=a.r.random()*tau; q=a.r.random()*.26; h=a.r.uniform(.05,.2); candle(a,math.cos(t)*q,math.sin(t)*q,0,h,a.r.uniform(.02,.035)); a.lathe([(.05+a.r.random()*.03,0),(.03,.008),(0,.01)],math.cos(t)*q,math.sin(t)*q,0,mat='wax',n=9,cap=False)
    a.lamp(0,0,.4,(1,.6,.27),.55,5)
@asset('light',tags=['top','light','candle'],col='none',small=1)
def candle_table(a):
    a.lathe([(.07,0),(.075,.01),(.03,.02),(.02,.05),(.035,.06),(.035,.075)],mat='bronze',n=12); candle(a,0,0,.07,.13,.02); a.lamp(0,0,.35,(1,.6,.27),.5,5)
@asset('light',tags=['floor','light','candle'],col='circle')
def candelabra(a):
    a.lathe([(.2,0),(.21,.02),(.1,.06),(.03,.1),(.025,.5),(.045,.53),(.025,.56),(.02,1.2),(.04,1.24),(.02,1.28),(.02,1.5)],mat='bronze',n=12)
    for i in range(4):
        t=i*tau/4; c,s=math.cos(t),math.sin(t); a.tube([(0,0,1.15),(c*.12,s*.12,1.1),(c*.24,s*.24,1.18),(c*.26,s*.26,1.36)],.013,'bronze'); a.lathe([(.02,0),(.05,.02),(.05,.03)],c*.26,s*.26,1.35,mat='bronze',n=9); candle(a,c*.26,s*.26,1.38,.16)
    a.lathe([(.02,0),(.05,.02),(.05,.03)],0,0,1.5,mat='bronze',n=9); candle(a,0,0,1.53,.18); a.lamp(0,0,1.85,(1,.6,.27),1,8)
@asset('light',tags=['ceiling','light'],mount='ceil',col='none')
def chandelier(a):   # hangs from z=3.7; origin at floor
    z=2.55; a.tube([(math.cos(t)*.75,math.sin(t)*.75,z) for t in[tau*i/28 for i in range(28)]],.05,'beam',closed=True,n=4,flat=1.4); a.tube([(math.cos(t)*.78,math.sin(t)*.78,z) for t in[tau*i/28 for i in range(28)]],.02,'iron',closed=True,n=5,flat=2.4)
    for i in range(4): t=i*tau/4; a.tube([(math.cos(t)*.72,math.sin(t)*.72,z+.03),(0,0,z+.8)],.014,'iron',n=5)
    for t in(0,math.pi/2): a.box(1.46,.08,.06,0,0,z-.03,mat='beam',rz=math.degrees(t),bev=.01)
    a.tube([(0,0,z+.8),(0,0,3.7)],.016,'iron',n=5); a.ball(.05,0,0,z+.8,n=8)
    for i in range(8): t=(i+.5)*tau/8; a.lathe([(.03,0),(.055,.02),(.05,.03)],math.cos(t)*.75,math.sin(t)*.75,z+.05,mat='iron',n=8); candle(a,math.cos(t)*.75,math.sin(t)*.75,z+.08,.14,.025)
    a.lamp(0,0,z+.3,(1,.58,.25),1.7,12)
@multi('light',dict(lantern_post=dict(k='post'),lantern_hang=dict(k='wall'),lantern_table=dict(k='top')),tags=['light'],col='none')
def _lantern(a,k):
    def lan(x,y,z):
        a.box(.2,.2,.03,x,y,z,mat='iron',bev=.006); a.box(.16,.16,.24,x,y,z+.03,mat='glass',bev=0,glow=.85,uvs=.01)
        for sx in(-1,1):
            for sy in(-1,1): a.box(.02,.02,.24,x+sx*.09,y+sy*.09,z+.03,mat='iron',bev=.003)
        a.box(.22,.22,.1,x,y,z+.27,mat='iron',taper=.3,bev=.006); a.tube([(x+.04*math.cos(t),y,z+.40+.04*math.sin(t)) for t in[tau*i/10 for i in range(10)]],.007,closed=True,n=4)
    if k=='post':
        a.meta['tags']=['light','outdoor']; a.box(.16,.16,2.6,mat='beam',bev=.02,taper=.8); a.box(.4,.4,.1,mat=ST,bev=.03); a.box(.75,.09,.09,.28,0,2.45,mat='beam',bev=.012); a.tube([(.08,0,2.1),(.4,0,2.45)],.025,'iron'); lan(.55,0,2.0); a.lamp(.55,0,2.15,(1,.62,.28),1.2,10)
    if k=='wall':
        a.meta.update(tags=['light','wall'],mount='wall'); a.box(.1,.02,.3,0,-.012,1.9,mat='iron',bev=.006); a.tube([(0,-.02,2.1),(0,-.2,2.2),(0,-.3,2.12)],.014); lan(0,-.3,1.68); a.lamp(0,-.4,1.85,(1,.62,.28),.9,8)
    if k=='top': a.meta['small']=1; a.meta['tags']=['light','top']; lan(0,0,0); a.lamp(0,0,.3,(1,.62,.28),.6,6)
@asset('light',tags=['floor','light','outdoor'],col='circle')
def campfire(a):
    for i in range(11): t=i*tau/11; a.rock(.12,math.cos(t)*.48,math.sin(t)*.48,.05,'rock',sub=1)
    for i in range(7): t=i*tau/7; a.tube([(math.cos(t)*.36,math.sin(t)*.36,.04),(math.cos(t+.3)*.05,math.sin(t+.3)*.05,.32)],[.05,.035],'bark',n=7,tint=(.45,.4,.38))
    for i in range(12): t=a.r.random()*tau; q=a.r.random()*.25; a.rock(.055,math.cos(t)*q,math.sin(t)*q,.04,'lava',sub=1,glow=.9,tint=(1,.6,.4))
    a.flame(0,0,.12,.6); a.lamp(0,0,.8,(1,.45,.14),1.5,11)
# ======================================================= DUNGEON
@asset('dungeon',tags=['tomb'],col='box')
def sarcophagus(a):
    a.box(1.1,2.3,.12,mat=ST,bev=.03); a.box(.95,2.12,.62,z=.12,mat=ST,bev=.025)
    for s in(-1,1):
        for y in(-.7,0,.7): a.box(.04,.5,.4,s*.48,y,.22,mat=ST,bev=.02)
    a.box(1.08,2.26,.14,z=.76,mat=ST,bev=.035); a.box(.9,2.05,.08,z=.9,mat=ST,taper=.9,bev=.02)
    S=[('s',(0,.72,1.06),.12,(.9,1.1,1)),('c',(0,.5,1.02),(0,-.1,1.0),.2,.16),('c',(.1,-.15,1.0),(.08,-.85,1.0),.1,.07),('c',(-.1,-.15,1.0),(-.08,-.85,1.0),.1,.07),('c',(.24,.42,1.02),(.05,.15,1.14),.07,.05),('c',(-.24,.42,1.02),(-.05,.15,1.14),.07,.05),('b',(0,-.25,1.14),(.06,.95,.04)),('b',(0,.2,1.14),(.28,.05,.05)),('b',(0,.72,.96),(.34,.3,.1))]
    a.sculpt(S,ST,.02,800,3)
@asset('dungeon',tags=['tomb'],col='box')
def sarcophagus_open(a):
    a.box(1.1,2.3,.12,mat=ST,bev=.03)
    for s in(-1,1): a.box(.12,2.12,.62,s*.415,0,.12,mat=ST,bev=.02); a.box(.71,.12,.62,0,s*1.0,.12,mat=ST,bev=.02)
    a.box(.72,1.9,.04,z=.12,mat='dirt',bev=0); 
    with a.at(.62,.1,.42,ry=62,rz=4): a.box(1.08,2.26,.14,mat=ST,bev=.035); a.box(.9,2.05,.07,z=.14,mat=ST,taper=.9,bev=.02)
    skull(a,0,.7,.2,.9); [a.tube([(x,.5-i*.1,.2),(x*1.4,.5-i*.1,.24),(0,.52-i*.1,.28)],.012,'bone',n=5) for i in range(5) for x in(-.13,.13)]
def skull(a,x,y,z,sc=1,rz=0,rx=0):
    with a.at(x,y,z,rx=rx,rz=rz,sc=sc):
        a.sculpt([('s',(0,.02,.1),.085,(.92,1.12,.98)),('s',(0,-.06,.055),.055,(1,.9,.9)),('b',(0,-.085,.02),(.06,.05,.045))],'bone',.0085,260,2)
        for s in(-1,1): a.ball(.021,s*.034,-.083,.075,mat='rock_dark',n=7,tint=(.3,.25,.2))
        a.extr([(-.011,0),(.011,0),(0,.028)],.012,0,-.11,.04,mat='rock_dark',tint=(.3,.25,.2))
        for i in range(5): a.box(.011,.012,.018,-.024+i*.012,-.108,-.006,mat='bone',bev=.003)
@asset('dungeon',tags=['tomb'],col='box')
def coffin(a):
    p=[(-.22,-1),(.22,-1),(.38,.45),(.25,1),(-.25,1),(-.38,.45)]
    with a.at(z=.2,rx=0): 
        bm=bmesh.new(); vs=[bm.verts.new((x,y,-.2)) for x,y in p]; f=bm.faces.new(vs); r=bmesh.ops.extrude_face_region(bm,geom=[f]); [setattr(v.co,'z',v.co.z+.42) for v in r['geom'] if isinstance(v,bmesh.types.BMVert)]; bmesh.ops.recalc_face_normals(bm,faces=bm.faces); a.add(bm,'planks_old',grain=1,smooth=20)
        bm=bmesh.new(); vs=[bm.verts.new((x*1.08,y*1.03,.22)) for x,y in p]; f=bm.faces.new(vs); r=bmesh.ops.extrude_face_region(bm,geom=[f]); [setattr(v.co,'z',v.co.z+.07) for v in r['geom'] if isinstance(v,bmesh.types.BMVert)]; bmesh.ops.recalc_face_normals(bm,faces=bm.faces); a.add(bm,'planks',grain=1,smooth=20)
        a.box(.05,.8,.025,0,.2,.29,mat='iron',bev=.005); a.box(.36,.05,.025,0,.42,.29,mat='iron',bev=.005)
        for s in(-1,1): a.tube([(s*.38,.2,.02),(s*.44,.2,-.04),(s*.44,-.05,-.04),(s*.36,-.05,.02)],.013)
@asset('dungeon',tags=['altar'],col='box')
def altar(a):
    a.box(2.0,1.0,.14,mat=ST,bev=.03); a.box(1.7,.75,.8,z=.14,mat=ST,bev=.02); a.box(2.0,.95,.14,z=.94,mat=ST,bev=.04); a.box(.5,.03,.5,0,-.39,.3,mat='rune',bev=.01,glow=0,uvs=.9)
    a.box(.7,1.0,.012,z=1.08,mat='cloth',tint=(.35,.05,.05),bev=0); a.box(.7,.012,.42,0,-.5,.66,mat='cloth',tint=(.35,.05,.05),bev=0); a.box(.7,.014,.03,0,-.501,.66,mat='gold',bev=0)
    for s in(-1,1): a.lathe([(.07,0),(.03,.03),(.025,.2),(.05,.23)],s*.8,.2,1.08,mat='gold',n=10); candle(a,s*.8,.2,1.3,.16)
    a.lathe([(.06,0),(.02,.03),(.018,.1),(.07,.15),(.085,.24),(.075,.24),(.05,.16),(0,.14)],0,.1,1.09,mat='gold',n=14,cap=False); a.lamp(0,-.2,1.7,(1,.6,.3),.8,7)
@asset('dungeon',tags=['altar','evil'],col='box')
def altar_dark(a):
    a.box(2.1,1.1,.2,mat='infernal',bev=.04); a.box(1.5,.8,.7,z=.2,mat='infernal',bev=.03,taper=.9); a.box(2.1,1.05,.18,z=.9,mat='infernal',bev=.05)
    for sx in(-1,1):
        for sy in(-1,1): a.tube([(sx*.95,sy*.45,.9),(sx*1.1,sy*.55,1.2),(sx*1.0,sy*.5,1.5)],[.06,.045,.008],'bone',n=7)
    skull(a,-.6,.15,1.08,1.05,20); skull(a,.62,.2,1.08,1,-25); a.box(.4,.03,.3,0,-.43,.35,mat='lava',bev=0,glow=.8)
    for x,y in((-.3,.25),(.3,.28),(0,.32)): candle(a,x,y,1.08,.12,.03)
    a.lamp(0,-.2,1.7,(1,.3,.15),.9,7)
@asset('dungeon',tags=['throne'],col='box')
def throne(a):
    a.box(1.5,1.5,.16,mat=ST,bev=.03); a.box(1.05,.95,.42,0,0,.16,mat=ST,bev=.03); a.box(.8,.75,.09,0,-.05,.58,mat='cloth',tint=(.4,.05,.05),bev=.035,seg=2)
    a.box(1.05,.22,1.5,0,.42,.3,mat=ST,bev=.03); a.box(.74,.06,.95,0,.3,.72,mat='cloth',tint=(.4,.05,.05),bev=.02); a.extr([(-.56,0),(.56,0),(.4,.32),(.18,.42),(0,.72),(-.18,.42),(-.4,.32)],.2,0,.42,1.8,mat=ST,bev=.02)
    for s in(-1,1): a.box(.16,.85,.34,s*.46,-.05,.58,mat=ST,bev=.03); a.ball(.1,s*.46,-.46,.98,mat='gold',n=10); a.lathe([(.09,0),(.1,.05),(.06,.12),(.05,1.7),(.09,1.76),(.09,1.82),(0,2.02)],s*.56,.45,.16,mat='gold',n=10)
    a.ball(.09,0,.31,2.12,mat='crystal',n=8,glow=.35,tint=(1,.2,.2))
@asset('dungeon',tags=['prison'],mount='wall',col='none')
def chains_wall(a):
    def chain(x,z0,z1,y=-.06,sw=0):
        n=int((z0-z1)/.062)
        for i in range(n):
            z=z0-i*.062; t=i/max(n-1,1); yy=y-sw*math.sin(t*math.pi/2)
            pts=[(math.cos(q)*.02,0,math.sin(q)*.042) for q in[tau*k/8 for k in range(8)]]
            with a.at(x,yy,z,rz=90*(i%2)): a.tube(pts,.008,'rust',n=4,closed=True)
    for x in(-.35,.35):
        a.box(.12,.03,.12,x,-.015,1.98,mat='iron',bev=.01); a.tube([(x+.035*math.cos(t),-.05,2.0+.035*math.sin(t)) for t in[tau*i/8 for i in range(8)]],.01,closed=True,n=4); chain(x,1.95,1.2,-.06,.06)
        a.lathe([(.05,0),(.05,.05)],x,-.12,1.12,mat='iron',n=10,cap=False); a.lathe([(.06,.0),(.06,.05)],x,-.12,1.12,mat='iron',n=10,cap=False)
@asset('dungeon',tags=['prison'],col='box')
def cage(a):
    a.box(1.2,1.2,.08,mat='planks_old',bev=.01)
    for z in(.08,1.0,1.9): 
        for s in(-1,1): a.box(1.2,.05,.06,0,s*.575,z,mat='rust',bev=.008); a.box(.05,1.2,.06,s*.575,0,z,mat='rust',bev=.008)
    for i in range(8):
        t=-.56+i*.16
        for s in(-1,1): a.cyl(.016,1.85,t,s*.575,.08,mat='iron',n=5); a.cyl(.016,1.85,s*.575,t,.08,mat='iron',n=5)
    for i in range(6): a.box(1.15,.05,.03,0,-.5+i*.2,1.93,mat='rust',bev=0)
    a.rock(.22,-.2,.1,.12,'straw',sub=2,sz=.3,sx=1.6,facet=0)
@asset('dungeon',tags=['ceiling','prison'],mount='ceil',col='none')
def gibbet(a):
    a.tube([(0,0,3.7),(0,0,2.75)],.014,'rust',n=4); a.lathe([(.02,2.75),(.06,2.72),(.3,2.5)],mat='rust',n=10,cap=False)
    for z in(2.5,1.95,1.4): a.tube([(math.cos(t)*.3,math.sin(t)*.3,z) for t in[tau*i/14 for i in range(14)]],.018,'rust',closed=True,n=5)
    for i in range(9): t=i*tau/9; a.tube([(math.cos(t)*.3,math.sin(t)*.3,2.5),(math.cos(t)*.31,math.sin(t)*.31,1.95),(math.cos(t)*.3,math.sin(t)*.3,1.4),(0,0,1.18)],.012,'iron',n=4)
    skull(a,.03,0,1.32,1,40)
@asset('dungeon',tags=['torture'],col='box')
def rack(a):
    for s in(-1,1): a.box(.14,2.2,.16,s*.42,0,.62,mat='beam',bev=.015); [a.box(.12,.12,.64,s*.42,y,0,mat='beam',bev=.012) for y in(-.95,.95)]
    a.box(.8,1.6,.05,0,0,.68,mat='planks_old',bev=.008)
    for y in(-1.02,1.02):
        a.cyl(.075,1.0,-.5,y,.78,mat='wood',n=10,ry=90)
        for k in range(4): a.box(.04,.04,.55,.56,y,.78,mat='wood',rx=k*45,bev=.006,base=False)
        for s in(-.22,.22): a.tube([(s,y*.92,.82),(s,y*.7,.76)],.016,'cloth',n=5,tint=(.5,.38,.25))
@asset('dungeon',tags=['torture'],col='box')
def iron_maiden(a):
    a.lathe([(.46,0),(.48,.06),(.46,.1),(.44,.5),(.42,.95),(.48,1.35),(.42,1.55),(.2,1.66),(.22,1.72),(.24,1.86),(.2,2.0),(.1,2.1),(0,2.14)],mat='rust',n=14,arc=360)
    for z in(.3,.9,1.38): a.lathe([(.455,z),(.49,z+.02),(.49,z+.07),(.455,z+.09)],mat='iron',n=14,cap=False)
    a.box(.03,.06,1.5,0,-.46,.1,mat='iron',bev=.01); a.rivets([(math.cos(t)*.49,math.sin(t)*.49,1.42) for t in[tau*i/14 for i in range(14)]],.02)
    S=[('s',(0,-.2,1.84),.09,(.9,.6,1.1))]; a.sculpt(S,'iron',.02,160,2); [a.ball(.018,s*.04,-.255,1.87,mat='rock_dark',n=6) for s in(-1,1)]
@asset('dungeon',tags=['torture'],col='box')
def stocks(a):
    for s in(-1,1): a.box(.14,.14,1.5,s*.7,0,0,mat='beam',bev=.015); a.box(.2,.6,.1,s*.7,0,0,mat='beam',bev=.015)
    a.box(1.3,.09,.28,0,0,.9,mat='planks_old',bev=.012); a.box(1.3,.09,.26,0,0,1.19,mat='planks_old',bev=.012)
    for x,r in((0,.1),(-.36,.06),(.36,.06)): a.lathe([(r,0),(r,.1)],x,.05,1.185,mat='rock_dark',n=12,rx=90,tint=(.3,.25,.2))
    a.box(.06,.12,.2,.62,0,1.1,mat='iron',bev=.01)
@asset('dungeon',tags=['trap'],col='none')
def spike_trap(a):
    a.box(1.4,1.4,.03,mat='rust',bev=.008)
    for i in range(5):
        for j in range(5): a.lathe([(.045,.02),(.04,.05),(.026,.3),(0,.62+a.r.uniform(-.06,.06))],-.52+i*.26,-.52+j*.26,0,mat='steel',n=6,cap=False,tint=(.6,.57,.52))
@asset('dungeon',tags=['trap'],col='none')
def pressure_plate(a):
    a.box(1.2,1.2,.03,mat=ST,bev=.01); a.box(.95,.95,.05,z=.02,mat=ST,bev=.02); a.box(.5,.5,.02,z=.07,mat='rune',bev=.005,uvs=.9)
@asset('dungeon',tags=['wall'],mount='wall',col='none')
def lever(a):
    a.box(.24,.05,.4,0,-.025,1.1,mat=ST,bev=.015); a.box(.07,.04,.3,0,-.06,1.15,mat='rust',bev=.01); a.tube([(0,-.08,1.3),(0,-.34,1.5)],.016,'iron'); a.ball(.04,0,-.35,1.52,mat='wood',n=8)
@asset('dungeon',tags=['bones','decor'],col='none')
def bones_pile(a):
    for i in range(4): t=a.r.random()*tau; skull(a,math.cos(t)*.26,math.sin(t)*.26,.04+.09*(i==3),1,a.r.random()*360,a.r.uniform(-30,20))
    for i in range(18):
        t=a.r.random()*tau; q=a.r.random()*.42; l=a.r.uniform(.14,.24); z=.025+a.r.random()*.1
        with a.at(math.cos(t)*q,math.sin(t)*q,z,ry=a.r.uniform(70,110),rz=a.r.random()*360): a.lathe([(0,-l),(.02,-l+.01),(.022,-l+.02),(.011,-l+.05),(.010,l-.05),(.022,l-.02),(.02,l-.01),(0,l)],mat='bone',n=6,cap=False)
@asset('dungeon',tags=['bones','decor'],col='none',small=1)
def skull_one(a): skull(a,0,0,.0,1.1)
@asset('dungeon',tags=['bones','decor'],col='none')
def skeleton_remains(a):
    skull(a,0,.72,.02,1.05,30,-20); a.tube([(0,.6,.05),(.02,.3,.06),(0,0,.05)],.022,'bone',n=6)
    for i in range(7):
        for s in(-1,1): y=.55-i*.06; w=.15-abs(i-3)*.012; a.tube([(0,y,.06),(s*w*.8,y-.01,.13),(s*w,y-.03,.06),(s*w*.6,y-.04,.015)],.009,'bone',n=4)
    a.sculpt([('s',(.09,-.03,.06),.08,(1,.7,.5)),('s',(-.09,-.03,.06),.08,(1,.7,.5)),('s',(0,.02,.05),.05)],'bone',.014,180,2)
    def bone(p,q,r=.014): a.tube([p,q],[r*1.6,r*1.3],'bone',n=6); a.ball(r*2,*p,mat='bone',n=6); a.ball(r*1.9,*q,mat='bone',n=6)
    bone((.1,-.06,.04),(.2,-.48,.04),.017); bone((.2,-.5,.03),(.16,-.9,.03)); bone((-.1,-.06,.04),(-.28,-.44,.04),.017); bone((-.28,-.46,.03),(-.14,-.84,.03)); bone((.18,.52,.05),(.36,.26,.03)); bone((.36,.24,.03),(.3,0,.03),.011); bone((-.18,.52,.05),(-.4,.36,.03)); bone((-.4,.36,.03),(-.5,.62,.03),.011)
    with a.at(.52,-.1,.03,rx=90,rz=-20): sword(a,0,0,-.3,.9)
def sword(a,x,y,z,L=.95,rust=True):
    m='rust' if rust else 'steel'; a.box(.05,.012,L,x,y,z+.2,mat=m,bev=.005,taper=(.5,.6)); a.box(.2,.03,.03,x,y,z+.17,mat='bronze',bev=.008); a.cyl(.015,.16,x,y,z+.02,mat='leather',n=7); a.ball(.026,x,y,z,mat='bronze',n=7)
@asset('dungeon',tags=['web','decor'],col='none',mount='corner')
def cobweb(a): a.card(1.3,1.3,.42,-.42,2.2,tile='web',rz=45,rx=-18,wind=.12); a.card(1.1,1.0,.5,-.5,2.5,tile='web',rz=45,rx=40,wind=.12)
@multi('dungeon',dict(urn=dict(k=0),vase_tall=dict(k=1),vase_round=dict(k=2),pot_clay=dict(k=3)),tags=['container','decor'],col='circle')
def _pot(a,k):
    P=[[(.13,0),(.15,.03),(.1,.07),(.2,.25),(.25,.45),(.21,.62),(.13,.7),(.17,.74),(.18,.78),(.15,.78),(.11,.7),(0,.68)],[(.12,0),(.16,.1),(.2,.4),(.17,.7),(.09,.88),(.085,.95),(.14,1.02),(.12,1.03),(.07,.96),(0,.9)],[(.14,0),(.28,.14),(.33,.32),(.27,.5),(.14,.58),(.17,.63),(.15,.64),(.11,.58),(0,.56)],[(.15,0),(.21,.1),(.23,.28),(.18,.42),(.2,.46),(.17,.46),(.14,.4),(0,.38)]][k]
    m=['clay','clay','bronze','clay'][k]; m2={'clay':'skin'}.get(m,m); t=[(.62,.36,.24),(.3,.42,.55),(1,1,1),(.66,.42,.28)][k]
    a.lathe(P,mat=m2,n=18,cap=False,tint=t,smooth=60)
    if k<2:
        for s in(-1,1): a.tube([(s*P[3][0]*.95,0,P[3][1]*(2.2 if k==0 else 1.0)),(s*.32,0,.62 if k==0 else .72),(s*.13,0,.7 if k==0 else .9)],.02,m2,tint=t,n=6)
    if k==0: a.lathe([(.18,.77),(.17,.8),(.06,.88),(.04,.9),(.05,.93),(0,.96)],mat=m2,n=14,cap=False,tint=t)
@asset('dungeon',tags=['magic'],col='circle')
def crystal_ball(a):
    a.lathe([(.35,0),(.36,.05),(.12,.15),(.08,.5),(.1,.7),(.22,.82),(.24,.86),(.16,.84),(0,.8)],mat='wood',n=12,cap=False); a.ball(.19,0,0,1.0,mat='crystal',n=18,glow=.55,tint=(.55,.5,1.4)); a.lamp(0,0,1.3,(.45,.4,1),.6,5)
@asset('dungeon',tags=['magic','portal'],col='none')
def portal(a):
    n=14
    for i in range(n):
        t=tau*i/n; 
        with a.at(math.cos(t)*1.2,0,1.55+math.sin(t)*1.4,ry=-math.degrees(t)): a.box(.34,.42,.62,0,0,0,mat='rune' if i%2 else ST,bev=.03,base=False,uvs=.8,glow=0)
    a.box(2.0,.9,.3,mat=ST,bev=.04)
    a.fx.append(dict(k='portal',p=[0,1.55,0],s=1.15,c=[.25,.5,1])); a.lamp(0,-.5,1.6,(.3,.55,1),1.6,10)
@asset('dungeon',tags=['magic','rune','decor'],col='none')
def rune_circle(a):
    a.fx.append(dict(k='circle',p=[0,.03,0],s=1.4,c=[.9,.25,.1])); 
    for i in range(5): t=i*tau/5; candle(a,math.cos(t)*1.42,math.sin(t)*1.42,0,.14,.03)
    a.lamp(0,0,.7,(1,.3,.15),.7,6)
@asset('dungeon',tags=['magic','water'],col='circle')
def fountain(a):
    a.lathe([(1.25,0),(1.3,.08),(1.2,.14),(1.2,.5),(1.3,.56),(1.3,.64),(1.1,.64),(1.05,.5),(1.05,.2),(0,.2)],mat=ST,n=8,rz=22.5,smooth=25,cap=False); a.lathe([(.3,.2),(.24,.3),(.16,.6),(.2,.9),(.55,1.05),(.6,1.15),(.5,1.14),(.15,1.05),(.1,1.3),(.14,1.4),(.3,1.48),(.33,1.55),(.1,1.5),(.05,1.7),(0,1.75)],mat=ST,n=16,cap=False)
    a.lathe([(1.08,.5),(0,.5)],mat='crystal',n=16,cap=False,tint=(.25,.45,.55),glow=.02); a.lathe([(.52,1.12),(0,1.12)],mat='crystal',n=12,cap=False,tint=(.3,.5,.6))
@asset('dungeon',tags=['rug','decor'],col='none',flat=1)
def rug_round(a): a.lathe([(1.3,0),(1.3,.012),(0,.014)],mat='cloth',n=28,cap=False,tint=(.32,.07,.08)); a.lathe([(1.1,.013),(1.1,.017),(0,.017)],mat='cloth',n=28,cap=False,tint=(.5,.36,.14)); a.lathe([(1.0,.016),(1.0,.02),(0,.02)],mat='cloth',n=28,cap=False,tint=(.1,.13,.25))
def flat(a,w,h,mat,tint=None,z=.012,uvw=1):
    bm=bmesh.new(); vs=[bm.verts.new(p) for p in((-w/2,-h/2,z),(w/2,-h/2,z),(w/2,h/2,z),(-w/2,h/2,z))]; bm.faces.new(vs)
    a.add(bm,mat,tint=tint,uv=lambda l,f:(((l.vert.co.x/w+.5),(l.vert.co.y/h+.5)) if uvw else (l.vert.co.x,l.vert.co.y)))
    a.box(w,h,z-.001,mat='cloth',tint=(.2,.06,.05),bev=0)
@multi('furnish',dict(rug_red=dict(t=(1,1,1)),rug_blue=dict(t=(.35,.55,1.5)),rug_green=dict(t=(.35,.9,.5))),tags=['rug','decor'],col='none',flat=1)
def _rug(a,t): flat(a,2.0,3.2,'rug',t)
@asset('furnish',tags=['rug','decor'],col='none',flat=1)
def rug_hide(a):
    pts=[(0,-1),(.35,-.95),(.75,-1.1),(.6,-.7),(.5,-.2),(.55,.3),(.9,.6),(.5,.7),(.2,.8),(.15,1.05),(0,1.12)]; pts=pts+[(-x,y) for x,y in pts[-2:0:-1]]
    bm=bmesh.new(); f=bm.faces.new([bm.verts.new((x,y,.0)) for x,y in pts]); r=bmesh.ops.extrude_face_region(bm,geom=[f]); [setattr(v.co,'z',.03) for v in r['geom'] if isinstance(v,bmesh.types.BMVert)]; bmesh.ops.recalc_face_normals(bm,faces=bm.faces); a.add(bm,'fur',tint=(.62,.42,.26)); a.sculpt([('s',(0,1.15,.1),.14,(1,1.2,.8)),('s',(0,1.3,.08),.08),('s',(.11,1.1,.2),.04),('s',(-.11,1.1,.2),.04)],'fur',.02,250,2,tint=(.62,.42,.26))
@multi('furnish',{f'banner_{n}':dict(c=c) for n,c in dict(red=(.42,.05,.05),blue=(.07,.13,.42),green=(.06,.25,.1),purple=(.25,.07,.32),black=(.07,.07,.08),gold=(.6,.4,.08)).items()},tags=['wall','banner','decor'],mount='wall',col='none')
def _banner(a,c):
    a.cyl(.025,1.1,-.55,-.1,3.0,mat='wood',n=8,ry=90); [a.ball(.045,s*.56,-.1,3.0,mat='gold',n=8) for s in(-1,1)]; [a.tube([(s*.35,0,3.02),(s*.35,-.1,3.0)],.014) for s in(-1,1)]
    bm=bmesh.new(); nx,nz=6,9; g={}
    for i in range(nx+1):
        for j in range(nz+1):
            x=-.48+.96*i/nx; z=3.0-1.9*j/nz - (.3*(1-abs(i/nx-.5)*2)-.3 if j==nz else 0)*-1
            if j==nz: z=3.0-1.9-.28*(1-abs(i/nx-.5)*2)
            g[i,j]=bm.verts.new((x,-.1+.022*math.sin(i*1.9+j*.35)*j/nz,z))
    for i in range(nx):
        for j in range(nz): bm.faces.new((g[i,j+1],g[i+1,j+1],g[i+1,j],g[i,j]))
    q=bm.copy(); a.add(bm,'cloth',tint=c,smooth=180,wind=.1)
    bmesh.ops.reverse_faces(q,faces=q.faces); [setattr(v.co,'y',v.co.y+.004) for v in q.verts]; a.add(q,'cloth',tint=c,smooth=180,wind=.1)
    for s in(-1,1): a.box(.05,.006,1.86,s*.45,-.125,1.12,mat='cloth',tint=(.85,.62,.2),bev=0)
    for k in range(4): 
        with a.at(0,-.128,2.1,ry=k*90): a.extr([(0,0),(.1,.12),(0,.34),(-.1,.12)],.008,mat='cloth',tint=(.9,.68,.22))
    a.lathe([(.09,0),(.09,.02),(0,.02)],0,-.11,2.1,mat='cloth',n=14,rx=90,cap=False,tint=(.9,.68,.22))
@asset('furnish',tags=['wall','banner','decor'],mount='wall',col='none')
def tapestry(a):
    a.cyl(.03,2.4,-1.2,-.08,2.9,mat='wood',n=8,ry=90); bm=bmesh.new(); vs=[bm.verts.new(p) for p in((-1.1,-.07,1.1),(1.1,-.07,1.1),(1.1,-.07,2.9),(-1.1,-.07,2.9))]; bm.faces.new(vs); a.add(bm,'rug',uv=lambda l,f:((l.vert.co.x/2.2+.5),(l.vert.co.z-1.1)/1.8)); [a.ball(.05,s*1.22,-.08,2.9,mat='gold',n=8) for s in(-1,1)]
@asset('furnish',tags=['wall','decor'],mount='wall',col='none')
def shield_wall(a):
    with a.at(0,-.06,2.0,rx=90): a.lathe([(.42,0),(.42,.03),(.36,.05),(.14,.09),(.12,.1)],mat='wood',n=20,tint=(.7,.25,.2)); a.lathe([(.44,.0),(.45,.02),(.42,.05),(.39,.04)],mat='iron',n=20,cap=False); a.lathe([(.13,.08),(.1,.15),(0,.18)],mat='iron',n=12,cap=False)
    for s in(-1,1):
        with a.at(0,-.04,2.0,ry=s*45): sword(a,0,0,-.65,.95,False)
@asset('furnish',tags=['wall','decor'],mount='wall',col='none')
def trophy_head(a):
    with a.at(0,-.02,2.0,rx=90): a.lathe([(.3,0),(.28,.04),(0,.05)],mat='wood',n=8,cap=False,sq=.2)
    a.sculpt([('c',(0,-.05,2.0),(0,-.3,2.15),.13,.1),('s',(0,-.38,2.2),.11),('c',(0,-.42,2.18),(0,-.6,2.08),.085,.05),('c',(.1,-.33,2.3),(.2,-.3,2.34),.03,.02),('c',(-.1,-.33,2.3),(-.2,-.3,2.34),.03,.02)],'fur',.016,500,3,tint=(.55,.38,.24))
    for s in(-1,1):
        a.tube([(s*.06,-.33,2.28),(s*.2,-.28,2.5),(s*.42,-.3,2.62),(s*.5,-.36,2.85)],[.025,.022,.018,.006],'bone',n=6); a.tube([(s*.24,-.28,2.53),(s*.26,-.36,2.74)],[.016,.005],'bone',n=5); a.tube([(s*.40,-.3,2.62),(s*.58,-.3,2.66)],[.014,.005],'bone',n=5); a.ball(.016,s*.075,-.45,2.23,mat='rock_dark',n=6)
# ---------------- furniture
@asset('furnish',tags=['table'],col='box',top=.8)
def table_long(a):
    for i in range(4): a.box(.228,2.6,.06,-.345+i*.23,0,.74,mat='planks',bev=.01)
    for y in(-1.0,1.0): 
        for s in(-1,1): a.box(.11,.11,.74,s*.32,y,0,mat='wood',bev=.015)
        a.box(.74,.08,.12,0,y,.62,mat='wood',bev=.01); a.box(.62,.07,.07,0,y,.14,mat='wood',bev=.01)
    a.box(.08,2.0,.08,0,0,.14,mat='wood',bev=.01)
@asset('furnish',tags=['table'],col='circle',top=.78)
def table_round(a): a.lathe([(.62,.72),(.64,.74),(.64,.77),(.62,.78),(0,.78)],mat='planks',n=20,cap=False); a.lathe([(0,.72),(.62,.72)],mat='wood',n=20,cap=False); a.lathe([(.32,0),(.3,.06),(.1,.12),(.08,.3),(.12,.45),(.08,.6),(.2,.72)],mat='wood',n=10)
@asset('furnish',tags=['table'],col='box',top=.82)
def table_small(a):
    for i in range(4): a.box(.22,.8,.05,-.33+i*.22,0,.74,mat='planks',bev=.008)
    for sx in(-1,1):
        for sy in(-1,1): a.box(.08,.08,.74,sx*.36,sy*.32,0,mat='wood',bev=.01)
        a.box(.05,.62,.08,sx*.36,0,.64,mat='wood',bev=.008)
@asset('furnish',tags=['seat'],col='box')
def bench(a):
    a.box(1.7,.34,.06,z=.42,mat='planks',bev=.012); [a.box(.08,.3,.42,s*.66,0,0,mat='wood',bev=.01,taper=(1,.8)) for s in(-1,1)]; a.box(1.3,.05,.08,z=.2,mat='wood',bev=.008)
@asset('furnish',tags=['seat'],col='box')
def chair(a):
    a.box(.46,.44,.05,z=.44,mat='planks',bev=.01)
    for sx in(-1,1): a.box(.055,.055,.44,sx*.19,-.18,0,mat='wood',bev=.008); a.box(.055,.055,1.05,sx*.19,.19,0,mat='wood',bev=.008,rx=-3)
    for z in(.58,.74,.9): a.box(.36,.03,.09,0,.21+(z-.5)*.03,z,mat='wood',bev=.008)
    a.box(.4,.04,.04,0,-.18,.18,mat='wood',bev=.006)
@asset('furnish',tags=['seat'],col='circle')
def stool(a):
    a.lathe([(.19,.42),(.2,.44),(.19,.47),(0,.475)],mat='wood',n=14,cap=False); a.lathe([(0,.42),(.19,.42)],mat='wood',n=14,cap=False)
    for i in range(3): t=i*tau/3; a.tube([(math.cos(t)*.19,math.sin(t)*.19,0),(math.cos(t)*.1,math.sin(t)*.1,.43)],[.022,.026],'wood')
@asset('furnish',tags=['bed'],col='box')
def bed(a):
    for sx in(-1,1):
        for y,h in((-1.02,.7),(1.02,1.15)): a.box(.1,.1,h,sx*.55,y,0,mat='wood',bev=.015); a.ball(.065,sx*.55,y,h+.03,mat='wood',n=8)
        a.box(.07,2.0,.2,sx*.55,0,.26,mat='wood',bev=.012)
    a.box(1.06,.05,.72,0,1.02,.3,mat='planks',bev=.01); a.box(1.06,.05,.34,0,-1.02,.26,mat='planks',bev=.01)
    a.box(1.02,1.95,.2,z=.36,mat='cloth',tint=(.85,.8,.68),bev=.06,seg=2); a.box(1.1,1.35,.1,0,-.28,.5,mat='cloth',tint=(.35,.1,.09),bev=.045,seg=2,sub=3,wob=.02); a.box(.7,.36,.14,0,.76,.53,mat='cloth',tint=(.92,.88,.78),bev=.06,seg=2)
@asset('furnish',tags=['bed','noble'],col='box')
def bed_canopy(a):
    for sx in(-1,1):
        for y in(-1.1,1.1): a.lathe([(.07,0),(.08,.3),(.05,.4),(.06,1.2),(.045,1.3),(.05,2.3)],sx*.85,y,mat='wood',n=8)
        a.box(.08,2.2,.22,sx*.85,0,.3,mat='wood',bev=.012); a.box(.06,.62,1.85,sx*.86,.85,.45,mat='cloth',tint=(.32,.05,.08),bev=.02,sub=3,wob=.05); a.box(.06,.4,1.85,sx*.86,-.95,.45,mat='cloth',tint=(.32,.05,.08),bev=.02,sub=3,wob=.05)
    a.box(1.85,2.35,.1,z=2.3,mat='wood',bev=.015); a.box(1.9,2.4,.25,z=2.08,mat='cloth',tint=(.32,.05,.08),bev=.01,sub=1); a.box(1.7,.06,1.2,0,1.1,.3,mat='wood',bev=.01); a.box(1.6,2.1,.26,z=.4,mat='cloth',tint=(.9,.85,.74),bev=.07,seg=2); a.box(1.68,1.45,.12,0,-.32,.58,mat='cloth',tint=(.5,.34,.1),bev=.05,seg=2,sub=3,wob=.03)
    for s in(-1,1): a.box(.6,.36,.15,s*.38,.8,.64,mat='cloth',tint=(.92,.88,.78),bev=.06,seg=2)
@asset('furnish',tags=['bed','poor'],col='none')
def bedroll(a): a.box(.8,1.9,.07,mat='cloth',tint=(.4,.33,.22),bev=.03,sub=3,wob=.03); a.cyl(.11,.72,-.36,.82,.13,mat='cloth',n=12,ry=90,tint=(.35,.28,.2)); a.box(.82,1.1,.04,0,-.3,.06,mat='fur',bev=.02,sub=2,wob=.03,tint=(.6,.45,.3))
@asset('furnish',tags=['bed','poor'],col='box')
def bunk(a):
    for sx in(-1,1):
        for y in(-.98,.98): a.box(.09,.09,1.9,sx*.42,y,0,mat='beam',bev=.012)
    for z in(.35,1.2): 
        [a.box(.06,1.95,.14,s*.42,0,z,mat='wood',bev=.01) for s in(-1,1)]; a.box(.8,1.9,.05,z=z,mat='planks_old',bev=.006); a.box(.74,1.8,.1,z=z+.05,mat='straw',bev=.03,sub=2,wob=.02); a.box(.76,1.1,.05,0,-.3,z+.14,mat='cloth',tint=(.3,.26,.2),bev=.02)
@asset('furnish',tags=['shelf','library','wall2'],col='box',back=1)
def bookshelf(a):
    W=1.4; 
    with a.at(0,-.2,0):
        for s in(-1,1): a.box(.06,.4,2.3,s*W/2,0,0,mat='wood',bev=.01)
        a.box(W+.14,.46,.08,z=2.3,mat='wood',bev=.02); a.box(W,.02,2.3,0,.18,0,mat='wood',bev=0); a.box(W+.08,.42,.1,mat='wood',bev=.012)
        for z in(.1,.65,1.2,1.75): 
            a.box(W,.38,.04,z=z,mat='wood',bev=.006); x=-W/2+.05
            while x<W/2-.08:
                if a.r.random()<.14: x+=a.r.uniform(.05,.2); continue
                w=a.r.uniform(.035,.075); h=a.r.uniform(.3,.45); c=a.r.choice([(.35,.09,.07),(.1,.2,.12),(.1,.14,.3),(.36,.25,.1),(.22,.1,.2),(.16,.15,.13),(.5,.4,.25)]); a.box(w-.003,a.r.uniform(.2,.26),h,x+w/2,.03,z+.04,mat='leather',tint=tuple(q*2.2 for q in c),bev=.006,ry=a.r.uniform(-1,1)); 
                if a.r.random()<.6: a.box(w-.002,.01,.02,x+w/2,-.095,z+.04+h*.75,mat='gold',bev=0)
                x+=w
@asset('furnish',tags=['shelf','store','wall2'],col='box',back=1)
def shelf_goods(a):
    W=1.4
    with a.at(0,-.2,0):
        for s in(-1,1): a.box(.07,.4,1.9,s*W/2,0,0,mat='beam',bev=.012)
        for z in(.2,.75,1.3,1.85): a.box(W,.4,.04,z=z,mat='planks_old',bev=.008)
        for z in(.24,.79,1.34):
            x=-.55
            while x<.6:
                k=a.r.random()
                if k<.35: a.lathe([(.07,0),(.1,.08),(.1,.2),(.06,.26),(.07,.3)],x,0,z,mat='skin',n=10,tint=a.r.choice([(.6,.36,.24),(.35,.4,.45),(.5,.45,.35)]))
                elif k<.6: a.box(.22,.24,.2,x,0,z,mat='planks',bev=.01)
                elif k<.8: a.lathe([(.05,0),(.055,.16),(.02,.2),(.02,.27),(.026,.28)],x,0,z,mat='crystal',n=8,tint=a.r.choice([(.2,.5,.2),(.5,.15,.15),(.2,.25,.6),(.6,.5,.15)]))
                else: a.rock(.11,x,0,z+.09,'cloth',sub=2,facet=0,tint=(.55,.42,.28),sz=.9)
                x+=a.r.uniform(.22,.3)
@multi('furnish',dict(chest=dict(o=0),chest_open=dict(o=1)),tags=['chest','treasure'],col='box')
def _chest(a,o):
    for i in range(4): a.box(.9,.56,.118,z=.04+i*.12,mat='planks' if i%2 else 'planks_old',bev=.008,grain=0)
    for s in(-1,1): a.box(.07,.59,.5,s*.42,0,.03,mat='iron',bev=.008); a.box(.07,.59,.5,s*.15,0,.03,mat='iron',bev=.008) if False else None
    a.box(.94,.6,.05,mat='iron',bev=.01); a.box(.93,.59,.04,z=.5,mat='iron',bev=.006)
    with (a.at(0,.28,.53,rx=100 if o else 0)):
        pr=[(-.28+.28*(1-math.cos(math.pi*i/8)),.24*math.sin(math.pi*i/8)) for i in range(9)]
        with a.at(0,-.28,0,rz=90):
            a.extr([(x,z) for x,z in pr],.88,mat='planks',smooth=50)
            for s in(-1,0,1): a.extr([(x*1.05,z*1.07) for x,z in pr],.07,0,s*.41,0,mat='iron',smooth=50)
        a.box(.16,.03,.16,0,-.58,-.08,mat='bronze',bev=.01); a.lathe([(.02,0),(.02,.02)],0,-.59,0,mat='rock_dark',n=8,rx=90)
    if o:
        for i in range(70): t=a.r.random()*tau; q=a.r.random(); a.lathe([(.022,0),(.022,.006),(0,.006)],a.r.uniform(-.38,.38),a.r.uniform(-.22,.22),.47+a.r.random()*.09,mat='gold',n=7,rx=a.r.uniform(-50,50),ry=a.r.uniform(-50,50),cap=False)
        a.rock(.2,0,0,.42,'gold',sub=2,sx=1.8,sz=.5); [a.ball(.03,a.r.uniform(-.3,.3),a.r.uniform(-.15,.15),.56,mat='crystal',n=6,tint=c,glow=.15) for c in((1.4,.15,.15),(.2,.3,1.4),(.2,1.2,.3))]
@asset('furnish',tags=['treasure'],col='none')
def gold_pile(a):
    a.rock(.75,0,0,.0,'gold',sub=3,sz=.38,facet=0,amp=.4)
    for i in range(150): t=a.r.random()*tau; q=a.r.random()**.6*.9; z=max(0,.27*(1-(q/.75)**2)); a.lathe([(.028,0),(.028,.007),(0,.007)],math.cos(t)*q,math.sin(t)*q,z+.01,mat='gold',n=7,rx=a.r.uniform(-60,60),ry=a.r.uniform(-60,60),cap=False)
    for i in range(9): t=a.r.random()*tau; q=a.r.random()*.6; a.rock(.05,math.cos(t)*q,math.sin(t)*q,.27*(1-(q/.75)**2)+.03,'crystal',sub=1,facet=1,tint=a.r.choice([(1.4,.1,.15),(.15,.3,1.4),(.15,1.2,.3),(1,.3,1.2)]),glow=.15)
    a.lathe([(.05,0),(.02,.03),(.016,.1),(.06,.14),(.075,.22),(.065,.22),(.0,.15)],.3,-.2,.2,mat='gold',n=12,cap=False,rx=20); a.tube([(-.25+.1*math.cos(t),.1+.1*math.sin(t),.27) for t in[tau*i/16 for i in range(16)]],.02,'gold',closed=True,flat=2)
def barrel_(a,r=.34,h=.92,x=0,y=0,z=0,tap=False):
    pr=[(r*.84,0),(r*.9,h*.12),(r*.98,h*.33),(r,h*.5),(r*.98,h*.67),(r*.9,h*.88),(r*.84,h),(r*.76,h),(r*.76,h-.05),(0,h-.05)]; a.lathe(pr,x,y,z,mat='planks',n=16,uvs=.55,cap=False)
    for f in(.06,.26,.74,.94):
        q=r*(.84+.16*(1-(abs(f-.5)*2)**1.9)); a.lathe([(q+.002,h*f-.028),(q+.016,h*f-.025),(q+.016,h*f+.025),(q+.002,h*f+.028)],x,y,z,mat='iron',n=16,cap=False)
@asset('furnish',tags=['container','store'],col='circle')
def barrel(a): barrel_(a)
@asset('furnish',tags=['container','store'],col='box')
def barrel_stack(a):
    for x in(-.42,.42): barrel_(a,x=x)
    barrel_(a,x=0,z=.0,y=.62); barrel_(a,x=0,y=.22,z=.93)
@asset('furnish',tags=['container','store','tavern'],col='box')
def barrel_side(a):
    for s in(-1,1): a.box(.12,.8,.22,s*.3,0,0,mat='beam',bev=.012)
    with a.at(-.5,0,.52,ry=90): barrel_(a,.4,1.0)
    a.cyl(.03,.14,.5,0,.36,mat='wood',n=8,ry=90); a.cyl(.02,.1,.6,0,.33,mat='wood',n=6)
def crate_(a,w,d,h,x=0,y=0,z=0,rz=0):
    with a.at(x,y,z,rz=rz):
        a.box(w-.04,d-.04,h-.04,z=.02,mat='planks',bev=0)
        for sx in(-1,1):
            for sy in(-1,1): a.box(.07,.07,h,sx*(w/2-.035),sy*(d/2-.035),0,mat='planks_old',bev=.008)
        for z_ in(0,h-.07):
            for s in(-1,1): a.box(w-.14,.05,.07,0,s*(d/2-.025),z_,mat='planks_old',bev=.006); a.box(.05,d-.14,.07,s*(w/2-.025),0,z_,mat='planks_old',bev=.006)
        for s in(-1,1): a.box(w*1.1,.03,.07,0,s*(d/2-.018),h/2,mat='planks_old',ry=math.degrees(math.atan2(h-.2,w-.2))*s,bev=.004,base=False)
@asset('furnish',tags=['container','store'],col='box')
def crate(a): crate_(a,.75,.75,.7)
@asset('furnish',tags=['container','store'],col='box')
def crates(a): crate_(a,.75,.75,.7,-.4,0); crate_(a,.7,.7,.65,.42,.1,0,12); crate_(a,.6,.6,.55,-.1,.05,.7,-14); crate_(a,.5,.5,.4,.3,-.7,0,30)
@asset('furnish',tags=['container','store'],col='circle')
def sacks(a):
    for x,y,rr in((-.25,0,0),(.28,.1,1),(0,-.35,2)): a.sculpt([('s',(x,y,.26),.27,(1,1,1)),('s',(x,y,.12),.29,(1,1,.55)),('c',(x,y,.45),(x+.02,y,.58),.09,.07),('s',(x+.02,y,.63),.1,(1.1,.8,.5))],'cloth',.026,420,3,tint=(.58,.45,.29),disp=lambda p:noise.noise(p*6)*.025); a.lathe([(.075,0),(.085,.015),(.075,.03)],x+.01,y,.54,mat='leather',n=8,cap=False)
@asset('furnish',tags=['wall2','arms'],col='box',back=1)
def weapon_rack(a):
    with a.at(0,-.22,0):
        for s in(-1,1): a.box(.1,.36,.1,s*.75,0,0,mat='beam',bev=.012); a.box(.09,.09,1.5,s*.75,.1,0,mat='beam',bev=.012)
        for z in(.45,1.25): a.box(1.6,.07,.09,0,.08,z,mat='wood',bev=.01)
        a.box(1.6,.2,.06,z=.1,mat='wood',bev=.01)
        for i,x in enumerate((-.6,-.3,0)): 
            with a.at(x,-.02,1.18,rx=188): sword(a,0,0,-.12,.85,False)
        for x in(.25,.42): a.cyl(.02,1.85,x,-.02,.16,mat='wood',n=7); a.extr([(-.05,0),(.05,0),(.06,.06),(0,.3),(-.06,.06)],.02,x,-.02,1.98,mat='steel',bev=.004)
        a.cyl(.022,1.5,.62,-.02,.16,mat='wood',n=7); a.extr([(0,0),(.2,-.08),(.24,.12),(.18,.3),(0,.2)],.03,.62,-.02,1.4,mat='steel',bev=.006)
@asset('furnish',tags=['arms'],col='circle')
def armor_stand(a):
    a.box(.5,.5,.06,mat='wood',bev=.015); a.cyl(.035,1.4,mat='wood',n=8)
    a.sculpt([('c',(0,0,1.35),(0,0,1.0),.21,.16),('s',(0,0,1.42),.22,(1.1,.75,.5)),('c',(0,0,1.0),(0,0,.78),.17,.25)],'steel',.02,900,3); a.lathe([(.165,.98),(.185,1.0),(.185,1.05),(.165,1.07)],mat='leather',n=14,cap=False)
    for s in(-1,1): a.sculpt([('s',(s*.27,0,1.46),.13,(1,1,.75)),('c',(s*.3,0,1.4),(s*.32,-.02,1.12),.075,.06)],'steel',.018,300,2)
    a.sculpt([('s',(0,0,1.72),.13,(.92,1.08,1.1)),('c',(0,0,1.66),(0,-.01,1.58),.115,.11)],'steel',.014,500,2); a.box(.2,.02,.02,0,-.135,1.74,mat='rock_dark',bev=0); a.box(.025,.03,.24,0,-.13,1.62,mat='gold',bev=.006); a.box(.02,.2,.06,0,.02,1.86,mat='gold',bev=.008)
@asset('furnish',tags=['wall2','fire','light'],col='box',back=1)
def fireplace(a):
    with a.at(0,-.3,0):
        for s in(-1,1): a.box(.36,.7,1.25,s*.82,0,0,mat=ST,bev=.03)
        a.box(2.1,.78,.3,z=1.25,mat=ST,bev=.04); a.box(2.25,.86,.1,z=1.55,mat=ST,bev=.03); a.box(1.7,.6,2.1,0,.04,1.65,mat=ST,taper=(.75,.8),bev=.03); a.box(1.3,.06,1.25,0,.3,0,mat='brick',tint=(.35,.3,.3),bev=0); a.box(2.1,.9,.07,0,-.1,0,mat=ST,bev=.02)
        for i in range(4): a.tube([(-.35,-.02-i%2*.12,.12+.08*(i//2)),(.35,-.05+i%2*.14,.13+.08*(i//2))],.06,'bark',n=7,tint=(.5,.4,.35))
        for i in range(14): a.rock(.055,a.r.uniform(-.35,.35),a.r.uniform(-.15,.15),.1,'lava',sub=1,glow=.9,tint=(1,.6,.4))
        a.flame(0,-.05,.2,.6); a.flame(-.2,0,.17,.4); a.flame(.22,-.02,.17,.42); a.lamp(0,-.55,.9,(1,.46,.15),1.6,11)
@asset('furnish',tags=['cook','magic'],col='circle')
def cauldron(a):
    a.lathe([(.1,.14),(.3,.2),(.42,.42),(.42,.58),(.36,.74),(.41,.8),(.4,.83),(.33,.78),(.36,.6),(0,.6)],mat='iron',n=18,cap=False); a.lathe([(.345,.66),(0,.67)],mat='moss',n=16,cap=False,tint=(.5,1.3,.35),glow=.18)
    for i in range(3): t=i*tau/3; a.tube([(math.cos(t)*.28,math.sin(t)*.28,.24),(math.cos(t)*.36,math.sin(t)*.36,0)],.03,'iron')
    for i in range(6): t=a.r.random()*tau; a.ball(a.r.uniform(.02,.05),math.cos(t)*.18,math.sin(t)*.18,.67,mat='moss',n=6,tint=(.6,1.5,.4),glow=.25)
@asset('furnish',tags=['cook'],col='circle')
def cookpot(a):
    for i in range(3): t=i*tau/3; a.tube([(math.cos(t)*.7,math.sin(t)*.7,0),(0,0,1.5)],.03,'wood')
    a.tube([(0,0,1.45),(0,0,.8)],.01,'iron',n=4); a.lathe([(.08,.35),(.24,.42),(.28,.55),(.24,.68),(.27,.7),(.22,.69),(0,.6)],mat='iron',n=14,cap=False); a.tube([(-.25,0,.68),(0,0,.86),(.25,0,.68)],.01,'iron',n=4)
    for i in range(6): t=i*tau/6; a.tube([(math.cos(t)*.3,math.sin(t)*.3,.03),(0,0,.2)],.04,'bark',n=6,tint=(.5,.4,.35))
    a.flame(0,0,.08,.4); a.lamp(0,0,.6,(1,.46,.15),1.1,9)
@asset('furnish',tags=['magic','library'],col='box',top=.85)
def alchemy_table(a):
    a.box(1.7,.8,.07,z=.78,mat='planks_old',bev=.012)
    for sx in(-1,1):
        for sy in(-1,1): a.box(.1,.1,.78,sx*.76,sy*.32,0,mat='wood',bev=.012)
    a.box(1.5,.6,.04,z=.22,mat='planks_old',bev=.008); z=.85
    def flask(x,y,c,k):
        P=[[(.06,0),(.1,.05),(.1,.12),(.03,.18),(.028,.28),(.04,.29)],[(.05,0),(.055,.16),(.025,.2),(.025,.25),(.035,.26)],[(.09,0),(.03,.16),(.03,.24),(.04,.25)]][k]; a.lathe(P,x,y,z,mat='crystal',n=12,tint=c,glow=.14)
    flask(-.6,.1,(.2,1.1,.3),0); flask(-.4,.22,(1.1,.2,.2),1); flask(-.28,-.05,(.25,.35,1.2),2); flask(.1,.22,(1,.7,.15),0); flask(.3,.2,(.8,.2,1),1)
    a.tube([(-.6,.1,z+.29),(-.5,.1,z+.42),(-.3,.15,z+.34),(-.28,-.05,z+.26)],.012,'glass',n=6,tint=(1,1,.9)); a.box(.3,.22,.04,.5,-.12,z,mat='leather',rz=12,bev=.01); a.box(.28,.2,.03,.5,-.12,z+.03,mat='parchment',rz=12,bev=.006); skull(a,.66,.2,z,.9,-30)
    a.lathe([(.06,0),(.1,.03),(.11,.1),(.09,.1),(0,.05)],.12,-.18,z,mat='bone',n=12,cap=False); candle(a,.02,.28,z,.14); a.lamp(0,-.1,1.4,(.8,.75,.4),.5,5)
@asset('furnish',tags=['library'],col='box')
def lectern(a): a.box(.5,.5,.07,mat='wood',bev=.015); a.lathe([(.1,0),(.06,.1),(.05,.9),(.1,1.0)],z=.06,mat='wood',n=8); a.box(.6,.45,.04,0,0,1.1,mat='wood',rx=25,bev=.01); a.box(.27,.36,.05,-.14,-.02,1.15,mat='parchment',rx=25,ry=6,bev=.012); a.box(.27,.36,.05,.14,-.02,1.15,mat='parchment',rx=25,ry=-6,bev=.012); a.box(.6,.42,.02,0,-.01,1.13,mat='leather',rx=25,bev=.006,tint=(.8,.3,.25))
@multi('furnish',dict(books_pile=dict(k=0),scrolls=dict(k=1),mug=dict(k=2),plate_food=dict(k=3),bottle=dict(k=4),potion=dict(k=5),map_table=dict(k=6)),tags=['top','decor'],small=1,col='none')
def _small(a,k):
    if k==0:
        z=0
        for i in range(4): h=a.r.uniform(.04,.07); a.box(.26,.19,h,0,0,z,mat='leather',rz=a.r.uniform(-25,25),tint=a.r.choice([(1,.35,.3),(.4,.6,.4),(.4,.45,.9),(.9,.7,.4)]),bev=.01); z+=h
    if k==1:
        for i in range(5): a.cyl(.028,.34,-.17,-.1+i*.05+a.r.uniform(-.02,.02),.03+(i%2)*.045,mat='parchment',n=8,ry=90,rz=a.r.uniform(-12,12))
    if k==2: a.lathe([(.05,0),(.055,.02),(.05,.13),(.044,.13),(.042,.1),(0,.1)],mat='wood',n=12,cap=False); a.tube([(.05,0,.11),(.09,0,.09),(.09,0,.04),(.05,0,.03)],.009,'iron',n=5); a.lathe([(.054,.02),(.058,.03),(.054,.04)],mat='iron',n=12,cap=False)
    if k==3: a.lathe([(.08,0),(.15,.015),(.155,.02),(.08,.01),(0,.01)],mat='bronze',n=16,cap=False); a.sculpt([('s',(0,0,.05),.06,(1.3,1,.7)),('c',(.05,0,.05),(.14,.03,.05),.03,.015)],'leather',.01,160,2,tint=(1.3,.9,.5)); a.ball(.028,-.07,.06,.04,mat='skin',n=7,tint=(.8,.15,.1))
    if k==4: a.lathe([(.045,0),(.048,.02),(.048,.17),(.018,.23),(.018,.29),(.022,.3)],mat='crystal',n=10,tint=(.12,.3,.15)); a.cyl(.015,.025,0,0,.3,mat='bark',n=6)
    if k==5: a.lathe([(.03,0),(.06,.04),(.06,.08),(.02,.13),(.02,.17),(.027,.18)],mat='crystal',n=12,tint=(1.5,.15,.2),glow=.4); a.cyl(.016,.03,0,0,.175,mat='bark',n=6)
    if k==6: flat(a,.8,.55,'parchment',z=.006,uvw=0); a.cyl(.02,.6,-.3,.29,.02,mat='parchment',n=8,ry=90); candle(a,.3,-.18,.008,.06,.02); a.lathe([(.014,0),(.014,.02),(.005,.05),(.012,.07),(0,.08)],-.1,.05,.008,mat='wood',n=6,tint=(1.5,.3,.3),cap=False)
@asset('furnish',tags=['store'],col='box',top=1.05)
def counter(a):
    a.box(2.6,.7,.07,z=1.0,mat='planks',bev=.015,grain=0); 
    for i in range(9): a.box(.285,.06,1.0,-1.16+i*.29,-.28,0,mat='planks_old' if i%2 else 'planks',bev=.008,grain=2)
    for s in(-1,1): a.box(.06,.6,1.0,s*1.24,0,0,mat='wood',bev=.01)
    a.box(2.6,.06,.1,0,-.31,0,mat='wood',bev=.01); a.box(2.5,.5,.04,0,.03,.4,mat='planks',bev=.006)
@asset('furnish',tags=['store','wall2'],col='box',back=1)
def wardrobe(a):
    with a.at(0,-.32,0):
        a.box(1.2,.6,2.0,z=.08,mat='wood',bev=.015); a.box(1.32,.7,.1,z=2.06,mat='wood',bev=.025); a.box(1.28,.66,.1,mat='wood',bev=.02)
        for s in(-1,1):
            a.box(.54,.03,1.8,s*.285,-.305,.18,mat='planks',bev=.012); a.box(.38,.02,.75,s*.285,-.325,.28,mat='wood',bev=.014); a.box(.38,.02,.75,s*.285,-.325,1.12,mat='wood',bev=.014); a.ball(.025,s*.06,-.35,1.05,mat='bronze',n=7)
@asset('furnish',tags=['music','tavern'],col='box')
def stage(a): a.box(2.8,1.8,.3,mat='planks',bev=.015); [a.box(2.86,.06,.3,0,s*.9,0,mat='wood',bev=.01) for s in(-1,1)]
# ======================================================= VILLAGE
@asset('village',tags=['outdoor'],col='box')
def cart(a):
    for i in range(5): a.box(.235,2.0,.05,-.47+i*.235,0,.72,mat='planks_old',bev=.008)
    for s in(-1,1): a.box(.05,2.0,.36,s*.58,0,.76,mat='planks',bev=.01); [a.box(.07,.07,.44,s*.61,y,.7,mat='beam',bev=.01) for y in(-.8,0,.8)]; a.tube([(s*.4,-.9,.7),(s*.36,-1.7,.62),(s*.34,-2.4,.5)],.04,'wood')
    a.box(1.15,.05,.36,0,.98,.76,mat='planks',bev=.01); a.cyl(.05,1.7,-.85,.1,.55,mat='beam',n=8,ry=90)
    for s in(-1,1):
        a.tube([(s*.78,.1+math.cos(t)*.52,.55+math.sin(t)*.52) for t in[tau*i/22 for i in range(22)]],.05,'wood',closed=True,n=6); a.tube([(s*.78,.1+math.cos(t)*.56,.55+math.sin(t)*.56) for t in[tau*i/22 for i in range(22)]],.022,'iron',closed=True,n=4,flat=2)
        a.cyl(.09,.16,s*.78-.08,.1,.55,mat='wood',n=10,ry=90); [a.tube([(s*.78,.1,.55),(s*.78,.1+math.cos(t)*.5,.55+math.sin(t)*.5)],.024,'wood',n=5) for t in[tau*i/8 for i in range(8)]]
@asset('village',tags=['outdoor'],col='box')
def hay_cart(a): cart.__wrapped__(a) if hasattr(cart,'__wrapped__') else cart(a); a.sculpt([('s',(0,0,1.15),.55,(1,1.7,.7)),('s',(.1,.4,1.3),.4),('s',(-.1,-.4,1.25),.42)],'straw',.06,500,2,disp=lambda p:noise.noise(p*5)*.08)
@asset('village',tags=['outdoor','farm'],col='box')
def hay_bale(a): a.box(1.2,.7,.6,mat='straw',bev=.06,seg=2,sub=2,wob=.04); [a.box(.03,.72,.62,x,0,-.005,mat='leather',bev=.006) for x in(-.3,.3)]
@asset('village',tags=['outdoor','farm'],col='circle')
def haystack(a): a.sculpt([('c',(0,0,.3),(0,0,1.4),1.0,.35),('s',(0,0,1.75),.2)],'straw',.08,600,3,disp=lambda p:noise.noise(p*3)*.12+noise.noise(p*9)*.05); a.tube([(0,0,1.6),(0,0,2.3)],.03,'wood')
@asset('village',tags=['outdoor','fence'],fit='edge',col='edge')
def fence_wood(a):
    for x in(-.72,0,.72): a.box(.1,.1,1.1+a.r.uniform(-.06,.06),x,0,0,mat='planks_old',bev=.015,rz=a.r.uniform(-8,8))
    for z in(.38,.78): a.box(1.56,.04,.11,0,-.06,z,mat='planks_old',ry=a.r.uniform(-2,2),bev=.01)
@asset('village',tags=['outdoor','fence'],fit='edge',col='edge')
def palisade(a):
    for i in range(6): h=2.5+a.r.uniform(-.15,.15); a.lathe([(.125,0),(.12,h-.3),(0,h)],-.625+i*.25,a.r.uniform(-.02,.02),0,mat='bark',n=8,cap=False)
    for z in(.7,1.8): a.box(1.55,.06,.12,0,.12,z,mat='planks_old',bev=.01)
@asset('village',tags=['outdoor','fence'],fit='edge',col='edge')
def wall_low(a):
    for j in range(4):
        x=-.75
        while x<.7: w=min(a.r.uniform(.22,.4),.75-x); a.box(w-.01,.42+a.r.uniform(-.05,.04),.24,x+w/2,0,j*.23,mat='rock',bev=.04,rz=a.r.uniform(-2,2),seg=1); x+=w
@asset('village',tags=['outdoor','sign'],col='circle')
def signpost(a):
    a.box(.14,.14,2.5,mat='beam',bev=.02,rz=10)
    for z,rz,w in((2.1,20,.95),(1.75,-40,.8),(1.45,100,.85)):
        with a.at(0,0,z,rz=rz): a.extr([(0,-.1),(w,-.1),(w+.16,.03),(w,.16),(0,.16)],.05,0,-.09,0,mat='planks_old',bev=.01)
    for i in range(5): a.rock(.14,a.r.uniform(-.3,.3),a.r.uniform(-.3,.3),.05,'rock',sub=1)
@multi('village',{f'sign_{k}':dict(k=k) for k in('tavern','smith','shop','magic')},tags=['wall','sign'],mount='wall',col='none')
def _sign(a,k):
    a.box(.06,.9,.06,0,-.45,2.75,mat='iron',bev=.01); a.tube([(0,-.05,2.35),(0,-.3,2.55),(0,-.6,2.72)],.014); [a.tube([(0,y,2.75),(0,y,2.6)],.008,n=4) for y in(-.3,-.75)]
    with a.at(0,-.52,2.25,rz=90):
        a.box(.72,.05,.5,z=-.14,mat='planks',bev=.02); a.box(.76,.06,.05,z=-.17,mat='iron',bev=.01); a.box(.76,.06,.05,z=.34,mat='iron',bev=.01)
        for s in(-1,1):
            y=s*.04
            if k=='tavern': a.lathe([(.09,0),(.1,.22),(.08,.22),(0,.2)],0,y,-.02,mat='gold',n=10,cap=False); a.tube([(.1,y,.17),(.17,y,.14),(.17,y,.05),(.09,y,.02)],.015,'gold',n=5)
            if k=='smith': a.extr([(-.18,.12),(.2,.12),(.12,.02),(.06,.0),(.05,-.08),(.1,-.1),(-.1,-.1),(-.05,-.08),(-.06,0),(-.14,.03)],.03,0,y,.1,mat='steel')
            if k=='shop': a.rock(.13,0,y,.1,'leather',sub=2,facet=0,tint=(1.3,1,.6)); a.lathe([(.05,0),(.07,.03)],0,y,.2,mat='leather',n=8)
            if k=='magic': a.extr([(.2*math.cos(math.pi/2+i*math.pi/5)*(1 if i%2==0 else .42),.2*math.sin(math.pi/2+i*math.pi/5)*(1 if i%2==0 else .42)) for i in range(10)],.03,0,y,.1,mat='gold')
@multi('village',{f'stall_{n}':dict(c=c) for n,c in dict(red=(.55,.1,.08),blue=(.1,.2,.5),green=(.12,.36,.15)).items()},tags=['outdoor','market'],col='box')
def _stall(a,c):
    for sx in(-1,1):
        for y,h in((-.7,2.1),(.7,2.6)): a.box(.09,.09,h,sx*1.2,y,0,mat='beam',bev=.012)
    n=8
    for i in range(n): a.box(2.7/n,1.9,.03,-1.35+2.7/n*(i+.5),0,2.36,mat='cloth',rx=19,bev=0,tint=c if i%2 else (.85,.78,.62),base=False); a.extr([(-2.7/n/2,0),(2.7/n/2,0),(0,-.22)],.02,-1.35+2.7/n*(i+.5),-.9,2.05,mat='cloth',tint=c if i%2 else (.85,.78,.62))
    a.box(2.5,.8,.06,0,-.35,.88,mat='planks',bev=.012,grain=0); a.box(2.4,.05,.7,0,-.68,.18,mat='planks_old',bev=.01)
    for i in range(3): 
        x=-.8+i*.8; a.box(.6,.5,.14,x,-.35,.94,mat='planks_old',bev=.01); t=a.r.choice([(1.1,.2,.12),(.4,.75,.2),(1.2,.65,.15),(.7,.55,.35)])
        for k in range(16): a.ball(.055,x+a.r.uniform(-.24,.24),-.35+a.r.uniform(-.19,.19),1.08+a.r.random()*.05,mat='skin',n=6,tint=t)
@asset('village',tags=['outdoor','water'],col='circle')
def well(a):
    for j in range(4):
        for i in range(14): t=tau*(i+.5*(j%2))/14; a.box(.42,.26,.235,math.cos(t)*.92,math.sin(t)*.92,j*.235,mat='rock',rz=math.degrees(t)+90,bev=.035)
    a.lathe([(.82,0),(.82,.3)],mat='rock_dark',n=16,cap=False); a.lathe([(.8,.3),(0,.3)],mat='crystal',n=16,cap=False,tint=(.1,.16,.2))
    for s in(-1,1): a.box(.14,.14,2.3,s*1.0,0,0,mat='beam',bev=.015)
    a.cyl(.09,2.1,-1.05,0,1.7,mat='wood',n=10,ry=90); a.lathe([(.1,0),(.11,.3)],-.15,0,1.7,mat='cloth',n=10,ry=90,tint=(.5,.4,.25)); a.tube([(0,.05,1.65),(0,.05,1.15)],.012,'cloth',n=4,tint=(.6,.5,.3)); a.lathe([(.11,.9),(.14,1.14),(.12,1.14),(0,1.0)],0,.05,0,mat='planks',n=10,cap=False)
    for s in(-1,1): a.box(2.6,1.1,.06,0,s*.44,2.52,mat='shingle',rx=s*-38,bev=.01,base=False)
    a.box(2.7,.1,.1,0,0,2.82,mat='beam',bev=.012)
@asset('village',tags=['smith'],col='circle')
def anvil(a):
    a.lathe([(.3,0),(.28,.5)],mat='bark',n=10); a.box(.3,.22,.08,z=.5,mat='iron',bev=.015); a.box(.18,.14,.14,z=.58,mat='iron',bev=.02); a.box(.5,.18,.14,z=.7,mat='steel',bev=.02,tint=(.5,.5,.52)); a.lathe([(.085,0),(.02,.3)],.24,0,.77,mat='steel',n=8,ry=90,tint=(.5,.5,.52)); a.box(.05,.05,.16,-.1,.0,.86,mat='wood',rx=80,bev=.005); 
@asset('village',tags=['smith','light','fire'],col='box')
def forge_hearth(a):
    a.box(2.0,1.3,.85,mat=ST,bev=.04); a.box(1.5,.9,.1,z=.85,mat=ST,bev=.02); 
    for i in range(40): a.rock(.08,a.r.uniform(-.6,.6),a.r.uniform(-.3,.3),.93,'lava',sub=1,glow=.95,tint=(1,.6,.4))
    for s in(-1,1): a.box(.2,.2,1.3,s*.85,.45,.85,mat=ST,bev=.02); a.box(.2,.2,1.3,s*.85,-.45,.85,mat=ST,bev=.02)
    a.box(2.1,1.35,1.1,z=2.1,mat='brick',taper=.45,bev=.03); a.box(.9,.6,.8,z=3.2,mat='brick',bev=.02)
    with a.at(-1.35,.1,.7,rz=-90): a.extr([(-.3,0),(.3,0),(.25,.5),(-.25,.5)],.5,mat='leather',bev=.03); a.box(.7,.6,.06,z=.5,mat='wood',bev=.01)
    a.flame(0,0,.95,.5); a.lamp(0,-.3,1.5,(1,.45,.14),1.5,10)
@asset('village',tags=['smith'],col='box')
def grindstone(a):
    for s in(-1,1): a.box(.08,.5,.6,s*.25,0,0,mat='beam',bev=.01,taper=(1,.5))
    a.lathe([(.32,0),(.33,.02),(.33,.12),(.32,.14)],-.07,0,.66,mat='sandstone',n=20,ry=90,tint=(.8,.8,.8)); a.tube([(.3,0,.66),(.42,0,.66),(.42,0,.84)],.016)
@asset('village',tags=['outdoor','farm'],col='box')
def trough(a):
    a.box(1.5,.5,.06,z=.1,mat='planks_old',bev=.01); [a.box(1.5,.05,.4,0,s*.25,.12,mat='planks_old',bev=.01,rx=s*8) for s in(-1,1)]; [a.box(.06,.55,.44,s*.73,0,.1,mat='planks_old',bev=.01) for s in(-1,1)]; [a.box(.12,.6,.14,s*.5,0,0,mat='beam',bev=.01) for s in(-1,1)]; a.box(1.4,.42,.01,z=.4,mat='crystal',tint=(.2,.3,.34),bev=0)
@asset('village',tags=['outdoor'],col='box')
def woodpile(a):
    for j in range(4):
        for i in range(7-j%2): a.cyl(.1+a.r.uniform(-.015,.015),.9,-.66+(i+(j%2)*.5)*.215,.45,.1+j*.18,mat='bark',n=7,rx=90)
@asset('village',tags=['outdoor'],col='circle')
def chopping_block(a): a.lathe([(.34,0),(.3,.08),(.28,.5)],mat='bark',n=11); a.lathe([(.275,.502),(0,.503)],mat='wood',n=11,cap=False); a.cyl(.02,.6,.0,0,.5,mat='wood',n=6,rx=35); a.box(.05,.26,.16,0,-.02,.46,mat='steel',rx=35,bev=.01)
@asset('village',tags=['outdoor'],col='none')
def ladder(a): [a.box(.06,.05,3.6,s*.25,0,0,mat='wood',bev=.01) for s in(-1,1)]; [a.cyl(.02,.5,-.25,0,.25+i*.33,mat='wood',n=6,ry=90) for i in range(10)]
@asset('village',tags=['outdoor'],col='circle',small=1)
def bucket(a): a.lathe([(.12,0),(.16,.28),(.145,.28),(.11,.04),(0,.04)],mat='planks',n=12,cap=False,uvs=.5); a.lathe([(.135,.08),(.145,.1),(.14,.12)],mat='iron',n=12,cap=False); a.lathe([(.155,.22),(.165,.24),(.16,.26)],mat='iron',n=12,cap=False); a.tube([(-.16,0,.27),(0,.02,.4),(.16,0,.27)],.008,n=4)
@multi('village',{f'tent_{n}':dict(c=c) for n,c in dict(canvas=(.72,.62,.44),red=(.5,.1,.08),blue=(.12,.2,.46)).items()},tags=['outdoor','camp'],col='box')
def _tent(a,c):
    n=8
    for s in(-1,1):
        bm=bmesh.new(); g={}
        for i in range(n+1):
            for j in range(6): t=j/5; x=s*(1.35*t+.0); z=2.1*(1-t)-.16*math.sin(t*math.pi); y=-1.5+3*i/n; g[i,j]=bm.verts.new((x,y,z+noise.noise((x,y*2,z))*.05))
        for i in range(n):
            for j in range(5): bm.faces.new((g[i,j],g[i,j+1],g[i+1,j+1],g[i+1,j]) if s<0 else (g[i,j],g[i+1,j],g[i+1,j+1],g[i,j+1]))
        bmesh.ops.recalc_face_normals(bm,faces=bm.faces); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,'cloth',tint=c,smooth=180,uvs=1); a.add(q,'cloth',tint=tuple(v*.6 for v in c),smooth=180)
    bm=bmesh.new(); bm.faces.new([bm.verts.new(p) for p in((-1.3,1.48,0),(1.3,1.48,0),(0,1.48,2.05))]); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,'cloth',tint=c); a.add(q,'cloth',tint=c)
    [a.tube([(0,y,0),(0,y,2.2)],.04,'wood') for y in(-1.5,1.5)]; a.tube([(0,-1.6,2.12),(0,1.6,2.12)],.03,'wood')
    for s in(-1,1): [a.tube([(s*1.35,y,.02),(s*1.9,y*1.1,.02)],.012,'cloth',n=4,tint=(.5,.4,.25)) for y in(-1.4,1.4)]
@multi('village',{f'gravestone_{i}':dict(k=i) for i in range(3)},tags=['outdoor','grave'],col='box')
def _grave(a,k):
    a.box(.8,.36,.12,mat='rock',bev=.03)
    with a.at(0,0,.05,rx=a.r.uniform(-5,5),ry=a.r.uniform(-4,4)):
        if k==0: a.extr([(-.32,0),(.32,0),(.32,.7)]+[(.32*math.cos(t),.7+.32*math.sin(t)) for t in[math.pi*i/8 for i in range(1,8)]]+[(-.32,.7)],.16,mat='cliff',bev=.02); a.box(.3,.02,.06,0,-.085,.6,mat='rock_dark',bev=0); a.box(.06,.02,.34,0,-.085,.42,mat='rock_dark',bev=0)
        if k==1: a.box(.16,.16,1.15,mat='cliff',bev=.02); a.box(.7,.16,.16,z=.72,mat='cliff',bev=.02); a.lathe([(.2,0),(.26,.0),(.26,.08),(.2,.08),(.2,0)],0,.04,.8,mat='cliff',n=14,rx=90,cap=False)
        if k==2: a.extr([(-.3,0),(.3,0),(.34,.9),(.1,1.05),(0,.95),(-.12,1.0),(-.32,.85)],.15,mat='cliff',bev=.02)
    for i in range(5): a.rock(.07,a.r.uniform(-.4,.4),a.r.uniform(-.4,-.15),.02,'moss',sub=1)
@asset('village',tags=['outdoor','grave'],col='box')
def crypt_small(a):
    a.box(3.0,3.4,.3,mat=ST,bev=.04); a.box(2.4,2.8,2.2,z=.3,mat=ST,bev=.03); a.extr([(-1.5,0),(1.5,0),(0,1.0)],3.2,0,0,2.5,mat='slate',bev=.0); a.box(3.0,3.2,.14,z=2.42,mat=ST,bev=.03); a.extr([(-1.45,0),(1.45,0),(0,.95)],.16,0,-1.6,2.52,mat=ST,bev=.02)
    for s in(-1,1): a.lathe([(.22,0),(.24,.06),(.17,.12),(.16,1.95),(.22,2.02),(.24,2.1)],s*.95,-1.52,.3,mat=ST,n=12)
    a.box(1.0,.1,1.85,0,-1.4,.3,mat='rust',bev=.02); a.box(.05,.12,1.6,0,-1.42,.4,mat='iron',bev=.01); skull(a,0,-1.66,2.85,1.5)
@asset('village',tags=['outdoor','bridge'],col='none',fit='bridge')
def bridge_wood(a):  # spans 6m along Y, 3m wide, deck at z=.15 
    for i in range(20): a.box(2.9+a.r.uniform(-.08,.08),.29,.07,0,-2.85+i*.3,.1,mat='planks_old',bev=.012,grain=0)
    for s in(-1,1): a.box(.2,6.1,.22,s*1.2,0,-.12,mat='beam',bev=.02); a.box(.09,6.1,.09,s*1.38,0,1.05,mat='beam',bev=.012); [a.box(.12,.12,1.2,s*1.38,y,0,mat='beam',bev=.015) for y in(-2.9,-1.45,0,1.45,2.9)]
@asset('village',tags=['outdoor','water'],col='box')
def boat(a):
    bm=bmesh.new(); g={}; N=11
    for i in range(N):
        t=i/(N-1)*2-1; w=.62*(1-abs(t)**2.4)+.01; zb=.0+.25*abs(t)**2.5; zt=.5+.22*abs(t)**2
        for j in range(7): f=j/6*2-1; q=abs(f)**.6; g[i,j]=bm.verts.new((w*math.copysign(abs(f)**.75,f),t*1.7,zb+(zt-zb)*q**2))
    for i in range(N-1):
        for j in range(6): bm.faces.new((g[i,j],g[i+1,j],g[i+1,j+1],g[i,j+1]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); [setattr(v.co,'z',v.co.z+.03) for v in q.verts]; a.add(bm,'planks_old',grain=1,smooth=50); a.add(q,'planks_old',grain=1,smooth=50)
    for y in(-.7,0,.7): a.box(1.05,.22,.05,0,y,.34,mat='planks',bev=.01,grain=0)
    for s in(-1,1): a.tube([(s*.2,-.9,.42),(s*.5,.9,.5)],.02,'wood'); a.tube([(s*(.62*(1-abs(t)**2.4)+.01),t*1.7,.5+.22*abs(t)**2) for t in[-1+i/8 for i in range(17)]],.035,'wood',n=5)
@asset('village',tags=['outdoor'],col='circle')
def shrine(a): a.box(1.0,1.0,.2,mat='rock',bev=.05); a.box(.7,.7,.8,z=.2,mat='rock',bev=.04,taper=.85); a.box(.9,.9,.12,z=1.0,mat='rock',bev=.03); stone_person(a,'robed',z=1.1,tris=900); candle(a,-.3,-.3,1.12,.1); candle(a,.3,-.32,1.12,.14); a.lamp(0,-.5,1.5,(1,.6,.3),.5,5)
@asset('village',tags=['outdoor','ruin'],col='box')
def ruin_arch(a):
    ps,sp=arch_poly(2.2,3.4,.4,6)
    for i,p in enumerate(ps):
        if i in(11,9): continue
        a.extr(p,.7,mat=ST,bev=.03)
    for s in(-1,1):
        for i in range(5): a.box(.5+a.r.uniform(-.04,.04),.76,sp/5-.01,s*1.32,0,i*sp/5,mat=ST,bev=.04,rz=a.r.uniform(-2,2))
    for i in range(8): a.rock(a.r.uniform(.12,.28),a.r.uniform(-1.8,1.8),a.r.uniform(-.9,.9),.08,ST,sub=1)
@asset('village',tags=['outdoor','ruin'],col='box')
def standing_stone(a): a.rock(1,0,0,1.25,'cliff',sub=3,sx=.55,sy=.35,sz=1.5,facet=.9,seed=7)
@asset('village',tags=['outdoor','farm'],col='circle')
def scarecrow(a): a.box(.08,.08,1.9,mat='wood',bev=.01); a.box(1.5,.07,.07,z=1.35,mat='wood',bev=.01); a.sculpt([('c',(0,0,1.35),(0,0,.8),.2,.26),('c',(-.65,0,1.38),(.65,0,1.38),.09,.09)],'cloth',.03,500,2,tint=(.35,.25,.18),disp=lambda p:noise.noise(p*6)*.03); a.ball(.15,0,0,1.68,mat='cloth',n=10,tint=(.75,.6,.4)); a.lathe([(.32,0),(.3,.02),(.15,.06),(.12,.24),(0,.27)],0,0,1.75,mat='straw',n=12,cap=False)
# ======================================================= NATURE
def branch(a,p,d,L,r,depth,tips,segs=4,gnarl=.25,up=.12,mat='bark',n=7,tint=None):
    pts=[p];rs=[r]; cur=p.copy(); dr=d.normalized()
    for i in range(segs):
        dr=(dr+Vector((a.r.gauss(0,gnarl),a.r.gauss(0,gnarl),a.r.gauss(0,gnarl*.5)+up))).normalized(); cur=cur+dr*(L/segs); pts.append(cur.copy()); rs.append(r*(1-.62*(i+1)/segs))
    a.tube(pts,rs,mat,n=n,tint=tint,smooth=180); tips.append((pts[-1],dr,depth)); 
    return pts,rs,dr
def bare(a,p,d,L,r,depth,tips,segs=4,gnarl=.25,up=.12,mat='bark',n=7,tint=None):
    pts=[p];cur=p.copy();dr=d.normalized()
    for i in range(segs):
        dr=(dr+Vector((a.r.gauss(0,gnarl),a.r.gauss(0,gnarl),a.r.gauss(0,gnarl*.5)+up))).normalized(); cur=cur+dr*(L/segs); pts.append(cur.copy())
    return pts,[r]*len(pts),dr
def tree(a,H,r,kids,depth,leaf,n_leaf,lsz0,gnarl=.2,spread=55,start=.35,droop=0,mat='bark',ltint=None,tint=None,trunkfrac=.55):
    leaves=[]; lsz=lsz0*(1.75 if LOW[0] else 1); n_leaf=1 if LOW[0] and n_leaf else n_leaf
    def grow(p,d,L,r,dep):
        tips=[]; pts,rs,dr=(bare if LOW[0] and dep==0 else branch)(a,p,d,L,r,dep,tips,segs=5 if dep==depth else 3,gnarl=gnarl,up=.1 if dep==depth else .06-droop,mat=mat,n=8 if dep==depth else (5 if dep>0 else 4),tint=tint)
        if dep==0: leaves.append((pts[-1],dr)); (None if LOW[0] else leaves.append((pts[-2],dr))); return
        k=kids[depth-dep]
        for i in range(k):
            t=start+(1-start)*(i+.5)/k if dep==depth else .35+.65*(i+.5)/k; fi=t*(len(pts)-1); j=min(int(fi),len(pts)-2); q=pts[j].lerp(pts[j+1],fi-j); az=i*2.4+a.r.uniform(-.4,.4); sp=rad(spread*a.r.uniform(.75,1.2)); o=dr.orthogonal().normalized(); o=Matrix.Rotation(az,3,dr)@o; nd=dr*math.cos(sp)+o*math.sin(sp)
            grow(q,nd,L*a.r.uniform(.45,.62)*(1.15-.35*t),max(rs[j+1]*.75,.012),dep-1)
        grow(pts[-1],dr,L*.5,rs[-1],dep-1)
    for i in range(5):
        t=i*tau/5+.3; a.tube([(math.cos(t)*r*2.0,math.sin(t)*r*2.0,-.12),(math.cos(t)*r*.9,math.sin(t)*r*.9,.12),(math.cos(t)*r*.3,math.sin(t)*r*.3,.55)],[r*.22,r*.38,r*.45],mat,n=6,tint=tint)
    grow(Vector((0,0,-.1)),Vector((0,0,1)),H*trunkfrac,r,depth)
    if leaf:
        c=sum((p for p,_ in leaves),Vector())/len(leaves)
        for p,d in leaves:
            for i in range(n_leaf):
                o=p+Vector((a.r.gauss(0,1),a.r.gauss(0,1),a.r.gauss(0,.8)))*lsz*.3; s=lsz*a.r.uniform(.8,1.25); e=(a.r.uniform(0,360)); t=a.r.uniform(.82,1.15); lt=ltint or (1,1,1)
                out=(o-c); leafcard(a,o,s,leaf,(lt[0]*t,lt[1]*t,lt[2]*t),out)
def leafcard(a,o,s,tile,tint,nrm,up=None):
    """quad with normals bent outward from crown centre: soft foliage shading"""
    bm=bmesh.new(); L=bm.loops.layers.uv.verify(); e=Euler((a.r.uniform(-1.2,1.2),a.r.uniform(-1.2,1.2),a.r.uniform(0,tau))).to_matrix()
    v=[bm.verts.new(o+e@Vector((x*s*.5,0,z*s*.5))) for x,z in((-1,-1),(1,-1),(1,1),(-1,1))]; f=bm.faces.new(v)
    for l,uv in zip(f.loops,((0,0),(1,0),(1,1),(0,1))): l[L].uv=uv
    n=(nrm+Vector((0,0,nrm.length*.35))).normalized(); 
    a.parts.append((transform_bm(bm,a.stack[-1]),'@'+tile,tint,0,1,('n',n),1))
def transform_bm(bm,m): bm.transform(m); return bm
@multi('nature',dict(oak=dict(s=1),oak_old=dict(s=2),tree_autumn=dict(s=3),birch=dict(s=4)),tags=['tree','outdoor'],col='trunk',leafy=1)
def _oak(a,s):
    a.r.seed(s*7)
    if s==1: tree(a,7.2,.27,[7,4],2,'oak',3,1.25,gnarl=.16)
    if s==2: tree(a,8.5,.48,[8,5],2,'oak',3,1.5,gnarl=.3,spread=68,start=.28)
    if s==3: tree(a,6.6,.25,[7,4],2,'autumn',3,1.2,gnarl=.2)
    if s==4: tree(a,7.6,.15,[8,3],2,'oak',3,1.0,gnarl=.1,spread=42,start=.4,tint=(1.9,1.85,1.75),ltint=(1.1,1.15,.8))
@multi('nature',dict(pine=dict(H=8.5,s=1),pine_tall=dict(H=12,s=2),pine_snow=dict(H=8.5,s=3)),tags=['tree','outdoor'],col='trunk',leafy=1)
def _pine(a,H,s):
    a.r.seed(s*5); a.tube([(0,0,-.1),(.04,.02,H*.35),(0,.05,H*.7),(0,0,H)],[.2*H/8.5,.15,.09,.02],'bark',n=7,smooth=180); n=int(H*(1.1 if LOW[0] else 2.0)); WW=1.25 if LOW[0] else 1
    for i in range(n):
        t=(i/n)**.9; z=H*(.16+.82*t); R=(1-t)*H*.27+.25; k=(4 if LOW[0] else 6) if t<.7 else (4 if LOW[0] else 5)
        for j in range(k):
            az=j*tau/k+i*1.1+a.r.uniform(-.25,.25); w=R*WW*a.r.uniform(.85,1.15); L=bm=None; bm=bmesh.new(); L=bm.loops.layers.uv.verify(); d=Vector((math.cos(az),math.sin(az),0)); sd=Vector((-d.y,d.x,0)); q=[]
            for f in(0,.5,1.0): c=Vector((0,0,z))+d*w*f+Vector((0,0,-(.30+.12*f)*w*f+.12*f*w*0)); q.append((bm.verts.new(c-sd*w*.42+Vector((0,0,-.10*w))),bm.verts.new(c),bm.verts.new(c+sd*w*.42+Vector((0,0,-.10*w)))))
            for m in(0,1):
                for h in(0,1):
                    fc=bm.faces.new((q[m][h],q[m][h+1],q[m+1][h+1],q[m+1][h]))
                    for l,uv in zip(fc.loops,((h*.5,m*.5),(h*.5+.5,m*.5),(h*.5+.5,m*.5+.5),(h*.5,m*.5+.5))): l[L].uv=uv
            nn=(d+Vector((0,0,.75))).normalized(); tt=a.r.uniform(.8,1.15)*(.72+.4*t); tc=(tt,tt,tt) if s!=3 else (tt*1.9,tt*2.0,tt*2.1); a.parts.append((bm,'@pine',tc,0,.7,('n',nn),1))
@multi('nature',dict(tree_dead=dict(s=1),tree_dead_big=dict(s=2)),tags=['tree','outdoor','dead'],col='trunk')
def _dead(a,s): a.r.seed(s*3); tree(a,5.5 if s==1 else 7.5,.2 if s==1 else .4,[6,3],2,None,0,0,gnarl=.34,spread=62,tint=(.62,.6,.6),mat='bark')
@multi('nature',dict(bush=dict(t='bush',n=26,R=.6),bush_flower=dict(t='flower',n=18,R=.5),fern=dict(t='fern',n=0,R=.7),reeds=dict(t='reed',n=0,R=.5),grass_tuft=dict(t='grassblade',n=0,R=.4)),tags=['plant','outdoor'],col='none',leafy=1)
def _bush(a,t,n,R):
    if n:
        for i in range(n):
            z=a.r.uniform(0,1); az=a.r.random()*tau; q=math.sqrt(max(0,1-z*z)); nn=Vector((math.cos(az)*q,math.sin(az)*q,z)); o=nn*R*a.r.uniform(.5,.85); o.z=o.z*.9+.18; k=a.r.uniform(.75,1.15); leafcard(a,o,R*1.15,'bush' if t=='flower' and i%3 else t,(k,k,k),nn+Vector((0,0,.4)))
    elif t=='fern':
        for i in range(9):
            az=i*40+a.r.uniform(-12,12); a.card(.42,.95,0,0,.02,tile='fern',rz=az,rx=58+a.r.uniform(-12,10),seg=3,bend=.25,wind=.7); q=a.parts[-1]; a.parts[-1]=(q[0],q[1],q[2],q[3],q[4],('n',Vector((math.sin(rad(az))*.4,-math.cos(rad(az))*.4,1)).normalized()),q[6])
    else:
        h=.55 if t=='grassblade' else 1.5; w=.7 if t=='grassblade' else .9
        for i in range(3): 
            bm=bmesh.new(); L=bm.loops.layers.uv.verify(); d=Vector((math.cos(i*tau/6),math.sin(i*tau/6),0)); v=[bm.verts.new(p) for p in(-d*w/2,d*w/2,d*w/2+Vector((0,0,h)),-d*w/2+Vector((0,0,h)))]; f=bm.faces.new(v)
            for l,uv in zip(f.loops,((0,0),(1,0),(1,1),(0,1))): l[L].uv=uv
            a.parts.append((bm,'@'+t,(1,1,1),0,1,('n',Vector((0,0,1))),1))
@multi('nature',dict(boulder=dict(r=.9,s=3),boulder_big=dict(r=1.7,s=11),rock_small=dict(r=.35,s=5),rock_flat=dict(r=.8,s=8)),tags=['rock','outdoor'],col='circle')
def _boulder(a,r,s): a.rock(r,0,0,r*(.35 if s!=8 else .1),'cliff' if s!=5 else 'rock',sub=3 if r>.5 else 2,seed=s,sz=.75 if s!=8 else .35,facet=.8); (a.rock(r*.45,r*.9,r*.3,r*.12,'cliff',sub=2,seed=s+1) if r>.5 else None); (a.rock(r*.3,-r*.7,-r*.6,r*.08,'cliff',sub=2,seed=s+2) if r>.5 else None)
@multi('nature',{**{f'stalagmite_{i}':dict(k=i,up=1) for i in range(3)},**{f'stalactite_{i}':dict(k=i,up=0) for i in range(2)}},tags=['cave','rock'],col='circle')
def _stal(a,k,up):
    if not up: a.meta.update(mount='ceil',col='none'); a.meta['tags']=['cave','ceiling']
    n=[1,3,5][k] if up else [1,4][k]
    for i in range(n):
        t=a.r.random()*tau; q=0 if i==0 else .3+a.r.random()*.3; h=([1.9,1.5,1.0][k] if up else [1.3,.9][k])*(1 if i==0 else a.r.uniform(.35,.7)); r=h*.2; x,y=math.cos(t)*q,math.sin(t)*q; pr=[(r*1.5,0),(r*1.05,h*.08),(r*.8,h*.25),(r*.72,h*.3),(r*.5,h*.55),(r*.46,h*.6),(r*.2,h*.88),(0,h)]
        bm=a.lathe(pr,0,0,0,mat='rock',n=11,cap=False,wob=.05)
        for v in bm.verts: v.co.x+=x; v.co.y+=y
        if not up:
            for v in bm.verts: v.co.z=3.9-v.co.z
            bmesh.ops.reverse_faces(bm,faces=bm.faces)
@multi('nature',dict(mushroom_glow=dict(c=(.35,1.1,1.4),g=.75),mushroom_red=dict(c=(.9,.12,.08),g=0),mushroom_giant=dict(c=(.55,.35,.8),g=.35)),tags=['cave','plant'],col='none')
def _mush(a,c,g):
    big=g==.35; n=3 if big else 8
    if big: a.meta['col']='circle'
    for i in range(n):
        h=(a.r.uniform(1.0,2.4) if big else a.r.uniform(.08,.34)); t=a.r.random()*tau; q=a.r.random()*(.5 if big else .32)*(i>0); x,y=math.cos(t)*q,math.sin(t)*q; R=h*.36; lx=a.r.uniform(-.1,.1)*h; a.tube([(x,y,0),(x+lx*.5,y,h*.5),(x+lx,y,h*.92)],[h*.09,h*.06,h*.055],'skin',n=8,tint=(.85,.8,.68),glow=g*.25)
        a.lathe([(R*.3,-R*.05),(R*.95,-R*.12),(R,0),(R*.85,R*.32),(R*.5,R*.58),(0,R*.7)],x+lx,y,h*.9,mat='skin',n=14,cap=False,tint=c,glow=g*.45,ry=a.r.uniform(-10,10)); a.lathe([(0,R*.1),(R*.95,-R*.11)],x+lx,y,h*.9,mat='skin',n=14,cap=False,tint=(.8,.75,.65),glow=g*.5)
        for k in range(5 if g==0 or big else 0): u=a.r.random()*tau; a.ball(R*.1,x+lx+math.cos(u)*R*.6,y+math.sin(u)*R*.6,h*.9+R*.48,mat='skin',n=6,tint=(1.3,1.25,1.1))
    if g>.5: a.lamp(0,0,.45,(.2,.75,1),.7,6)
    elif big: a.lamp(0,0,1.6,(.5,.3,1),.6,6)
@multi('nature',{f'crystal_{n}':dict(c=c,l=l) for n,(c,l) in dict(blue=((.3,.75,1.8),(.2,.5,1)),purple=((1.1,.4,1.8),(.6,.25,1)),green=((.4,1.6,.7),(.2,1,.45)),red=((1.8,.35,.3),(1,.25,.15))).items()},tags=['cave','crystal','magic'],col='circle')
def _crystal(a,c,l):
    for i in range(9):
        h=a.r.uniform(.35,1.35)*(1.3 if i==0 else .85); r=h*.15; t=i*2.4; q=.0 if i==0 else a.r.uniform(.1,.36); til=(0 if i==0 else a.r.uniform(12,42))
        with a.at(math.cos(t)*q,math.sin(t)*q,-.05,rz=math.degrees(t),ry=0): 
            with a.at(ry=til): a.lathe([(r*.8,0),(r,h*.3),(r*.95,h*.78),(0,h)],mat='crystal',n=6,cap=False,smooth=15,tint=tuple(v*.8 for v in c),glow=.13)
    for i in range(6): t=i*1.05; a.rock(.2,math.cos(t)*.38,math.sin(t)*.38,.03,'rock',sub=1)
    a.lamp(0,0,.9,l,1.1,8)
@asset('nature',tags=['outdoor'],col='box')
def log_fallen(a): a.tube([(-1.6,0,.24),(-.5,.05,.26),(.7,-.04,.24),(1.6,0,.22)],[.28,.26,.24,.2],'bark',n=10,smooth=60); a.tube([(.3,0,.4),(.5,.3,.7)],[.08,.03],'bark',n=6); [a.rock(.14,a.r.uniform(-1.2,1.2),a.r.uniform(-.1,.1),.46,'moss',sub=2,sz=.4) for i in range(6)]; [a.lathe([(.05,0),(.1,.02),(.02,.07),(0,.07)],a.r.uniform(-1,1),-.24,.3,mat='skin',n=8,cap=False,tint=(.8,.55,.3)) for i in range(5)]
@asset('nature',tags=['outdoor'],col='circle')
def stump(a): a.lathe([(.5,-.05),(.36,.12),(.3,.4),(.29,.48)],mat='bark',n=12,cap=False,wob=.03); a.lathe([(.29,.48),(0,.5)],mat='wood',n=12,cap=False); [a.tube([(math.cos(t)*.3,math.sin(t)*.3,.15),(math.cos(t)*.7,math.sin(t)*.7,-.05)],[.1,.04],'bark',n=6) for t in[i*tau/5 for i in range(5)]]
@asset('nature',tags=['wall','plant'],mount='wall',col='none',leafy=1)
def ivy(a):
    for i in range(15): x=a.r.uniform(-.6,.6); z=a.r.uniform(.2,3.4)*(1-abs(x)*.4); k=a.r.uniform(.75,1.1); bm=bmesh.new(); L=bm.loops.layers.uv.verify(); s=.62*a.r.uniform(.7,1.2); q=a.r.uniform(-.5,.5); v=[bm.verts.new((x+s/2*(cx*math.cos(q)-cz*math.sin(q)),-.03-a.r.random()*.06-(.04 if cz<0 else 0),z+s/2*(cx*math.sin(q)+cz*math.cos(q)))) for cx,cz in((-1,-1),(1,-1),(1,1),(-1,1))]; f=bm.faces.new(v); [setattr(l[L],'uv',uv) for l,uv in zip(f.loops,((0,0),(1,0),(1,1),(0,1)))]; a.parts.append((bm,'@ivy',(k,k,k),0,.25,('n',Vector((a.r.uniform(-.4,.4),-1,.4)).normalized()),1))
@asset('nature',tags=['cave','web'],col='circle')
def egg_sac(a): a.sculpt([('s',(a.r.uniform(-.25,.25),a.r.uniform(-.25,.25),.2+.1*i),.22-.01*i) for i in range(5)],'wax',.03,500,3,tint=(.9,.88,.75)); a.card(1.4,1.0,0,0,0,tile='web',rz=30,wind=.05); a.card(1.4,1.0,0,0,0,tile='web',rz=120,wind=.05)
@asset('nature',tags=['cave'],col='box')
def mine_cart(a):
    a.extr([(-.4,0),(.4,0),(.55,.6),(-.55,.6)],.9,0,0,.3,mat='rust',bev=.02); a.box(1.16,.96,.05,z=.88,mat='iron',bev=.01); [a.rock(.17,a.r.uniform(-.38,.38),a.r.uniform(-.3,.3),.86,'rock',sub=1) for i in range(12)]; [a.rock(.08,a.r.uniform(-.35,.35),a.r.uniform(-.3,.3),.98,'gold',sub=1) for i in range(6)]
    for sx in(-1,1):
        for sy in(-1,1): a.lathe([(.15,0),(.18,.02),(.18,.08),(.1,.1)],sx*.32,sy*.42-.05,.17,mat='iron',n=14,rx=90)
@asset('nature',tags=['cave'],col='none',fit='edge')
def mine_support(a): [a.box(.2,.2,2.9,s*1.25,0,0,mat='beam',bev=.02,ry=s*2) for s in(-1,1)]; a.box(2.9,.22,.22,z=2.85,mat='beam',bev=.02); [a.box(.12,.12,.8,s*1.0,0,2.3,mat='beam',bev=.012,ry=s*-45) for s in(-1,1)]
