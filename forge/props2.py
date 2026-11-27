"""More things to put in rooms."""
from props import *
def A_(cat,**m): return asset(cat,**m)
@asset('dungeon',tags=['decor','table'],col='box')
def war_table(a):
    a.box(2.3,1.3,.1,z=.82,mat='planks',bev=.015,grain=0); a.box(2.36,1.36,.06,z=.78,mat='beam',bev=.02); [a.box(.14,.14,.8,s*1.0,t*.5,0,mat='beam',bev=.02) for s in(-1,1) for t in(-1,1)]; a.box(1.9,1.0,.008,z=.92,mat='parchment',bev=0)
    for i in range(9): x,y=a.r.uniform(-.8,.8),a.r.uniform(-.4,.4); a.lathe([(.03,0),(.012,.03),(.018,.06),(0,.08)],x,y,.928,mat='bone' if i%2 else 'rust',n=8,cap=False)
    a.rock(.16,.5,.2,.93,'cliff',sub=1,sz=.5); a.box(.16,.16,.14,-.45,-.1,.93,mat='ashlar',bev=.01); a.lathe([(.03,0),(.03,.2),(0,.28)],-.45,-.1,1.06,mat='clay',n=8,cap=False); candle(a,.98,.45,.92,.18); a.box(.02,.42,.02,.1,-.2,.93,mat='steel',rz=30,bev=.003); a.lamp(.98,.45,1.3,(1,.6,.28),.8,6)
@asset('furnish',tags=['wall2','store'],col='box',back=1)
def wine_rack(a):
    a.box(1.5,.36,.06,0,-.2,0,mat='beam',bev=.01); a.box(1.5,.36,.06,0,-.2,1.7,mat='beam',bev=.01); [a.box(.07,.36,1.7,s*.72,-.2,0,mat='beam',bev=.01) for s in(-1,1)]
    for i in range(5):
        for j in range(5): x=-.56+.28*i; z=.2+.3*j; a.lathe([(.0,0),(.045,.005),(.045,.2),(.016,.26),(.016,.32)],x,-.04,z,mat='glass' if (i+j)%3 else 'leather',n=8,rx=90,cap=False,tint=(.25,.4,.25)) if a.r.random()>.15 else None
    for j in range(6): a.box(1.4,.3,.02,0,-.2,.06+.3*j,mat='wood',bev=.004)
    [a.box(.02,.3,1.6,-.7+.28*i,-.2,.06,mat='wood',bev=.004) for i in range(1,5)]
@asset('dungeon',tags=['decor','statue'],col='box')
def statue_dragon(a):
    a.box(1.3,1.3,.3,mat=ST,bev=.03); a.box(1.1,1.1,.2,z=.3,mat=ST,bev=.02); a.sculpt([('s',(0,.1,.85),.42,(1,1.15,.9)),('c',(0,-.15,1.0),(0,-.3,1.6),.27,.18),('c',(0,-.3,1.6),(0,-.45,2.0),.18,.14),('s',(0,-.5,2.08),.17),('c',(0,-.55,2.08),(0,-.85,2.0),.12,.07),('c',(.25,-.25,.55),(.3,-.4,.9),.12,.14),('c',(-.25,-.25,.55),(-.3,-.4,.9),.12,.14),('c',(0,.5,.65),(.4,.35,.55),.16,.08)]+[('c',(s*.1,-.45,2.2),(s*.16,-.2,2.45),.05,.01) for s in(-1,1)],ST,.035,1500,2)
    for s in(-1,1):
        bm=bmesh.new(); P=[(s*.2,0,1.2),(s*.6,.1,2.2),(s*1.0,.25,1.7),(s*.85,.3,1.1),(s*.45,.25,.8)]; v=[bm.verts.new(p) for p in P]; bm.faces.new(v[:3]); bm.faces.new((v[0],v[2],v[3])); bm.faces.new((v[0],v[3],v[4])); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,ST); a.add(q,ST); a.tube([P[0],P[1],P[2]],[.07,.05,.02],ST,n=6)
@asset('dungeon',tags=['arcane','light'],col='circle')
def orrery(a):
    a.lathe([(.5,0),(.52,.05),(.2,.12),(.12,.5),(.1,.9),(.16,1.0)],mat='bronze',n=18); a.ball(.16,0,0,1.45,mat='gold',n=14,glow=.35); a.lathe([(.03,0),(.03,.4)],0,0,1.0,mat='bronze',n=8)
    for i,(r,t,m) in enumerate(((.34,20,'crystal'),(.52,-28,'iron'),(.7,12,'bronze'))): P=[Vector((math.cos(q)*r,math.sin(q)*r*math.cos(rad(t)),1.45+math.sin(q)*r*math.sin(rad(t)))) for q in[tau*k/36 for k in range(36)]]; a.tube(P,.014,'gold',closed=True,n=5); p=P[(i*13+4)%36]; a.ball(.06+.02*i,*p,mat=m,n=10,tint=((.4,.8,1.6),(1,1,1),(1.2,.8,.5))[i],glow=(.5,0,0)[i])
    a.lamp(0,0,1.6,(.7,.75,1),.8,6)
@asset('dungeon',tags=['arcane','light'],col='circle')
def arcane_pylon(a):
    a.lathe([(.42,0),(.42,.12),(.32,.2),(.28,.25)],mat='ashlar',n=6,smooth=20); a.lathe([(.22,.25),(.18,1.5),(.1,1.7)],mat='rune',n=6,smooth=15,glow=.35); [a.tube([(math.cos(t)*.3,math.sin(t)*.3,.3),(math.cos(t)*.4,math.sin(t)*.4,1.3),(math.cos(t)*.2,math.sin(t)*.2,1.85)],[.04,.035,.01],'bronze',n=6) for t in[tau*i/3 for i in range(3)]]; a.lathe([(0,1.75),(.12,1.98),(0,2.3)],mat='crystal',n=6,cap=False,smooth=10,tint=(.5,.7,1.8),glow=.9); a.lamp(0,0,2,(.45,.6,1),1.1,8)
@asset('furnish',tags=['decor'],col='box',back=1)
def trophy_case(a):
    a.box(1.3,.5,.5,0,-.27,0,mat='wood',bev=.02); a.box(1.34,.54,.06,0,-.27,1.9,mat='beam',bev=.02); [a.box(.06,.06,1.4,s*.6,-.27+t*.2,.5,mat='wood',bev=.01) for s in(-1,1) for t in(-1,1)]; a.box(1.2,.4,.03,0,-.27,1.15,mat='wood',bev=.005); skull(a,-.3,-.25,.5,1.2); a.lathe([(.08,0),(.03,.04),(.025,.14),(.1,.22),(.12,.34)],.25,-.25,.5,mat='gold',n=14); a.lathe([(.12,0),(.14,.06),(.02,.1)],-.25,-.25,1.18,mat='steel',n=14); a.lathe([(0,-.06),(.07,0),(0,.1)],.3,-.25,1.28,mat='crystal',n=6,cap=False,smooth=10,tint=(1.5,.2,.3),glow=.4)
@asset('dungeon',tags=['treasure'],col='circle')
def treasure_heap(a):
    a.rock(1.0,0,0,0,'gold',sub=3,sz=.55,facet=0,amp=.4)
    for i in range(160): t=a.r.random()*tau; q=a.r.random()**.6*1.1; z=max(0,.52*(1-(q/1.0)**2)); a.lathe([(.03,0),(.03,.008),(0,.008)],math.cos(t)*q,math.sin(t)*q,z+.01,mat='gold',n=6,rx=a.r.uniform(-60,60),ry=a.r.uniform(-60,60),cap=False)
    [a.rock(.06,math.cos(t)*q,math.sin(t)*q,.5*(1-q*q)+.04,'crystal',sub=1,facet=1,tint=a.r.choice([(1.4,.1,.15),(.15,.3,1.4),(.15,1.2,.3)]),glow=.2) for t,q in[(a.r.random()*tau,a.r.random()*.8) for _ in range(10)]]; sword(a,.35,-.1,.3,1.0,False); a.lathe([(.2,0),(.22,.03),(.2,.16),(.17,.16)],-.4,.1,.38,mat='gold',n=18,cap=False,rx=25); a.lathe([(.1,0),(.03,.05),(.03,.16),(.12,.24),(.14,.36),(.12,.36)],.1,.5,.3,mat='gold',n=14,rx=-30,cap=False); a.box(.5,.34,.3,-.1,-.55,.1,mat='planks',bev=.02,rz=20); a.box(.52,.05,.32,-.1,-.55,.1,mat='iron',bev=.01,rz=20)
@asset('dungeon',tags=['bones'],col='circle')
def bone_throne(a):
    a.box(1.3,1.2,.2,mat='rock_dark',bev=.05); a.sculpt([('b',(0,0,.5),(.8,.75,.6)),('b',(0,.35,1.3),(.85,.16,1.4))],'bone',.04,520,2,disp=lambda p:noise.noise(p*7)*.05); [skull(a,x,-.05+.0*i,.9 if i<2 else 1.0,1.0) for i,x in enumerate((-.42,.42))]; [a.tube([(x,.35,1.7),(x*1.3,.4,2.2),(x*1.2,.3,2.7)],[.06,.045,.008],'bone',n=7) for x in(-.4,-.2,0,.2,.4)]; skull(a,0,.26,2.0,1.6)
@asset('dungeon',tags=['trap'],col='box')
def ballista(a):
    [a.box(.12,1.5,.12,s*.35,0,.25,mat='beam',bev=.02) for s in(-1,1)]; [a.lathe([(.34,-.04),(.36,0),(.34,.04)],s*.5,t*.55,.34,mat='wood',n=16,ry=90) for s in(-1,1) for t in(-1,1)]; a.box(.2,1.7,.16,0,-.1,.75,mat='wood',bev=.02); a.box(.5,.2,.5,0,.1,.35,mat='beam',bev=.02); a.tube([(-1.1,.15,.85),(-.6,-.55,.87),(0,-.78,.87),(.6,-.55,.87),(1.1,.15,.85)],[.03,.055,.07,.055,.03],'beam',n=8); a.tube([(-1.1,.15,.85),(0,.5,.9),(1.1,.15,.85)],.012,'cloth',n=4); a.tube([(0,.5,.95),(0,-1.3,.95)],.025,'wood',n=7); a.lathe([(.05,0),(0,.2)],0,-1.3,.95,mat='steel',n=6,rx=90)
@asset('village',tags=['outdoor','decor'],col='box')
def barricade(a):
    for i in range(6): a.lathe([(.07,0),(.07,1.5),(0,1.75)],-.75+.3*i,.1*(i%2),0,mat='bark',n=7,rx=a.r.uniform(-12,-2),ry=a.r.uniform(-6,6),cap=False)
    a.tube([(-.95,.05,.5),(.95,.02,.6)],.07,'bark',n=7); a.tube([(-.95,0,1.0),(.95,.05,.95)],.06,'bark',n=7)
@asset('village',tags=['outdoor'],col='box')
def market_goods(a):
    for i,(x,y) in enumerate(((-.5,0),(.15,.1),(.65,-.05))):
        a.box(.5,.42,.3,x,y,0,mat='planks',bev=.012); c=[(1.6,.3,.15),(1.4,1.1,.2),(.5,1.1,.25)][i]
        for k in range(14): a.ball(.055,x+a.r.uniform(-.18,.18),y+a.r.uniform(-.14,.14),.3+a.r.uniform(0,.06),mat='skin',n=7,tint=c)
@asset('furnish',tags=['decor','music'],col='box')
def harp(a): a.tube([(-.3,0,.1),(-.35,0,.9),(-.2,0,1.5),(.1,0,1.65),(.4,0,1.35)],[.06,.05,.045,.045,.05],'wood',n=8); a.tube([(-.3,0,.1),(.1,0,.5),(.4,0,1.35)],[.07,.08,.04],'wood',n=8); a.box(.7,.36,.1,-.15,0,0,mat='wood',bev=.02); [a.tube([(-.22+.07*i,0,.18+.13*i),(-.3+.09*i,0,1.1+.06*i)],.004,'gold',n=3) for i in range(8)]
@asset('dungeon',tags=['decor','wall'],mount='wall',col='none')
def mask_wall(a):
    with a.at(0,-.05,2.0): a.sculpt([('s',(0,0,0),.34,(.8,.4,1.1)),('s',(0,-.12,-.02),.08,(1,1,1.6)),('c',(-.18,-.06,.14),(.18,-.06,.14),.07,.07),('s',(0,-.05,-.3),.14)],'bronze',.02,520,2); [a.ball(.05,s*.12,-.12,.05,mat='lava',n=9,glow=.7,tint=(1,.5,.2)) for s in(-1,1)]; a.box(.2,.03,.05,0,-.16,-.22,mat='rock_dark',bev=.005)
    a.lamp(0,-.4,2,(1,.4,.15),.5,5)
@asset('masonry',tags=['decor'],col='box')
def sarcophagus_king(a):
    a.box(1.3,2.5,.3,mat=ST,bev=.04); a.box(1.1,2.3,.6,z=.3,mat=ST,bev=.03); a.box(1.25,2.45,.16,z=.9,mat=ST,bev=.04); a.sculpt([('s',(0,.8,1.2),.17),('c',(0,.5,1.15),(0,-.1,1.13),.24,.2),('c',(.12,-.1,1.12),(.1,-.95,1.1),.12,.09),('c',(-.12,-.1,1.12),(-.1,-.95,1.1),.12,.09),('c',(.25,.5,1.14),(.05,.15,1.25),.08,.07),('c',(-.25,.5,1.14),(-.05,.15,1.25),.08,.07)],ST,.03,900,2); sword(a,0,-.4,1.24,1.0,False); a.lathe([(.16,0),(.17,.05),(.15,.09)],0,.86,1.2,mat='gold',n=14,rx=-80,cap=False)
@asset('light',tags=['light','wall'],mount='wall',col='none')
def sconce_skull(a): a.box(.14,.08,.3,0,-.05,1.85,mat='iron',bev=.01); skull(a,0,-.2,1.95,1.3); candle(a,0,-.2,2.17,.1,.03); a.lamp(0,-.35,2.3,(.6,1,.5),.9,7)
@asset('nature',tags=['outdoor','tree','light'],col='trunk')
def tree_spirit(a):
    a.tube([(0,0,0),(.1,.05,1.2),(-.1,0,2.4),(.15,.1,3.6)],[.42,.32,.26,.16],'bark',n=11,smooth=180,tint=(1.3,1.25,1.2)); [a.tube([(.0,0,2.2+.3*i),(math.cos(t)*.8,math.sin(t)*.8,2.9+.25*i),(math.cos(t)*1.5,math.sin(t)*1.5,3.0+.2*i)],[.13,.08,.02],'bark',n=7,tint=(1.3,1.25,1.2)) for i,t in enumerate([.3,1.5,2.8,4.0,5.2])]
    for i in range(26): t=a.r.random()*tau; r=a.r.uniform(.5,2.0); z=a.r.uniform(2.7,4.4); a.card(1.3,1.3,math.cos(t)*r,math.sin(t)*r,z-.6,tile='oak',rz=a.r.uniform(0,360),rx=a.r.uniform(-30,30),tint=(.55,1.1,1.3))
    [a.ball(.05,math.cos(t)*r,math.sin(t)*r,z,mat='crystal',n=6,glow=1,tint=(.5,1.6,1.5)) for t,r,z in[(a.r.random()*tau,a.r.uniform(.6,1.8),a.r.uniform(2.2,3.6)) for _ in range(12)]]; a.lamp(0,0,2.6,(.35,1,.8),.9,8)
@asset('nature',tags=['cave','rock'],col='circle')
def geode(a):
    a.rock(.9,0,.1,.25,'rock_dark',sub=3,sz=.8); [a.lathe([(.09*s_,0),(.07*s_,.3*s_),(0,.42*s_)],math.cos(t)*.3*q,-.45+math.sin(t)*.1,.45+math.sin(t)*.25*q,mat='crystal',n=6,smooth=10,rx=70+a.r.uniform(-25,25),rz=a.r.uniform(-40,40),cap=False,tint=(1.2,.4,1.6),glow=.45) for t,q,s_ in[(a.r.random()*tau,a.r.random(),a.r.uniform(.6,1.3)) for _ in range(22)]]; a.lamp(0,-.6,.6,(.8,.35,1),.7,6)
@asset('nature',tags=['cave','water'],col='none')
def coral_fan(a): [a.tube([(0,0,0),(math.cos(t)*.25,math.sin(t)*.25,.5),(math.cos(t)*.5,math.sin(t)*.5,.9+.2*(i%2))],[.08,.05,.015],'skin',n=6,tint=(1.2,.4,.5)) for i,t in enumerate([tau*k/7 for k in range(7)])]
@asset('dungeon',tags=['decor'],col='circle')
def brazier_hanging(a):
    a.lathe([(.0,1.3),(.28,1.36),(.36,1.55),(.33,1.56),(.2,1.42),(0,1.4)],mat='iron',n=18,cap=False); [a.tube([(math.cos(t)*.34,math.sin(t)*.34,1.55),(0,0,2.6)],.012,'iron',n=4) for t in[tau*i/3 for i in range(3)]]; a.tube([(0,0,2.6),(0,0,3.7)],.018,'iron',n=5); a.flame(0,0,1.55,.42); a.lamp(0,0,1.8,(1,.55,.2),1.3,9)
@asset('furnish',tags=['wall','decor'],mount='wall',col='none')
def painting(a): a.box(1.1,.06,1.4,0,-.04,1.3,mat='gold',bev=.02); a.box(.94,.03,1.24,0,-.075,1.38,mat='rug',bev=0,tint=(.7,.6,.55)); a.sculpt([('s',(0,-.09,2.1),.14,(1,.15,1.2)),('s',(0,-.09,1.7),.3,(1,.08,.9))],'skin',.02,160,1,tint=(.6,.45,.36))
@asset('furnish',tags=['bath'],col='box')
def bathtub(a): a.lathe([(.0,.1),(.5,.1),(.66,.35),(.72,.62),(.68,.62),(.6,.34),(.46,.16),(0,.16)],mat='bronze',n=22,cap=False); a.lathe([(0,.5),(.66,.5)],mat='glass',n=22,cap=False,tint=(.5,.8,.9)); [a.ball(.09,math.cos(t)*.55,math.sin(t)*.55,.06,mat='bronze',n=8) for t in[tau*i/4+.4 for i in range(4)]]
@asset('dungeon',tags=['evil','decor'],col='circle')
def sacrificial_well(a): a.lathe([(.9,0),(.95,.1),(.85,.7),(.95,.8),(.95,.9),(.7,.9),(.68,.3),(0,.3)],mat='infernal',n=20,cap=False); a.lathe([(0,.55),(.69,.55)],mat='skin',n=20,cap=False,tint=(.5,.04,.05)); [skull(a,math.cos(t)*.83,math.sin(t)*.83,.9,.8,math.degrees(t)+90) for t in[tau*i/6 for i in range(6)]]; a.lamp(0,0,1.1,(1,.15,.1),.8,6)
@asset('dungeon',tags=['machine'],col='box')
def clockwork(a):
    def gear(x,y,z,r,n,m): a.lathe([(r*.85,-.06),(r*.85,.06),(r*.2,.07),(r*.2,-.07)],x,y,z,mat=m,n=n*2,rx=90,cap=False); [a.box(.09,.12,.12,x+math.cos(t)*r*.9,y,z+math.sin(t)*r*.9-.06,mat=m,ry=-math.degrees(t),bev=.01) for t in[tau*i/n for i in range(n)]]
    a.box(1.8,.5,.2,0,0,0,mat='iron',bev=.02); [a.box(.14,.4,1.9,s*.82,0,.2,mat='beam',bev=.02) for s in(-1,1)]; gear(-.3,0,.95,.5,12,'bronze'); gear(.42,.1,1.3,.36,9,'iron'); gear(.4,-.1,.55,.3,8,'gold'); a.tube([(-.82,0,1.9),(.82,0,1.9)],.06,'iron',n=8)
@asset('village',tags=['outdoor','decor'],col='box')
def market_cart(a): a.box(1.6,.9,.3,0,0,.6,mat='planks',bev=.02); [a.lathe([(.45,-.05),(.48,0),(.45,.05)],s*.55,t*.52,.46,mat='wood',n=18,rx=90) for s in(-1,1) for t in(-1,1)]; [a.tube([(s*.7,t*.4,.9),(s*.7,t*.4,2.0)],.03,'wood',n=6) for s in(-1,1) for t in(-1,1)]; bm=bmesh.new(); v=[bm.verts.new(p) for p in((-.95,-.65,1.9),(.95,-.65,1.9),(.95,0,2.3),(-.95,0,2.3),(.95,.65,1.9),(-.95,.65,1.9))]; bm.faces.new(v[:4]); bm.faces.new((v[3],v[2],v[4],v[5])); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,'cloth',tint=(.55,.16,.14)); a.add(q,'cloth',tint=(.4,.12,.1)); [a.ball(.08,a.r.uniform(-.6,.6),a.r.uniform(-.3,.3),.93,mat='skin',n=7,tint=(1.3,.7,.2)) for _ in range(14)]
@asset('furnish',tags=['decor'],col='circle')
def globe(a): a.lathe([(.3,0),(.32,.04),(.08,.1),(.06,.55),(.1,.6)],mat='wood',n=14); a.ball(.34,0,0,1.0,mat='parchment',n=20); a.tube([(math.cos(t)*.4,0,1.0+math.sin(t)*.4) for t in[tau*i/28 for i in range(28)]],.016,'gold',closed=True,n=5); a.tube([(math.cos(t)*.4,math.sin(t)*.4,1.0) for t in[tau*i/28 for i in range(28)]],.014,'bronze',closed=True,n=5)
@asset('dungeon',tags=['prison'],col='box')
def pillory(a): a.box(.16,.16,1.6,0,0,0,mat='beam',bev=.02); a.box(1.4,.12,.36,0,0,1.15,mat='beam',bev=.02); [a.lathe([(.07,-.07),(.07,.07)],x,0,1.33,mat='rock_dark',n=12,rx=90) for x in(-.45,0,.45)]; a.box(.9,.9,.16,0,0,0,mat='planks',bev=.02)
