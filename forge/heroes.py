"""Heroes from parts: outfits, heads, hair, headgear and weapons on one rig. Slots: 1 skin, 2 hair, 3 cloth, 4 trim."""
from chars import *
import chars
PARTS={}
def part(fn=None,**meta):
    def d(f): REG[f.__name__]=(f,'part','hero',meta); return f
    return d(fn) if fn else d
SKIN,HAIR,CLOTH,TRIM=1,2,3,4
def reg(name,f): 
    def g(n): return f(n)
    g.__name__=name; REG[name]=(g,'part','hero',dict(label=name))
W1=(1,1,1)
def only(a): a._only={'wood','planks'}
def sh(v): return (v,v,v)
V3=Vector
# ------------------------------------------------------------------ body pieces with slots
def limbs_bare(a,fem,bulk=1.0): a.sl(SKIN); arms(a,'skin',W1,'skin',W1,bulk*(.88 if fem else 1)); a.sl(0)
def hands_skin(a): pass
def boots(a,t=(.5,.38,.28),fem=False): pass
def legs2(a,mat,tint,fem,bulk=1,boot='leather',bt=(.5,.38,.28),slot=0,bslot=0):
    # trousers take a slot, boots another
    K=a.k; b=bulk*(.93 if fem else 1)
    for s,S in((1,'L'),(-1,'R')):
        h,k,f=a.p('leg'+S),a.p('shin'+S),a.p('foot'+S)
        a.sl(slot); a.bone('hips','leg'+S,'shin'+S); a.sculpt([('c',h,k,(.097 if fem else .092)*K*b,.066*K*b),('c',k,(f.x,f.y,.28*K),.064*K*b,.058*K*b),('s',(h.x*.6,h.y,h.z+.02*K),(.11 if fem else .105)*K*b,(1,.95,.9)),('s',k+V3((0,-.012,0)),.066*K*b)],mat,.0145*K,330,3,tint=tint,disp=(lambda p:noise.noise(p*11)*.004) if mat=='cloth' else None)
        a.sl(bslot); a.bone('shin'+S,'foot'+S); a.sculpt([('c',(k.x*.5+f.x*.5,(k.y+f.y)/2,.36*K),(f.x,f.y,.1*K),.074*K*b,.06*K*b),('s',(k.x*.62+f.x*.38,(k.y+f.y)/2+.014,.3*K),.076*K*b,(1,1,1.3)),('c',(f.x,f.y+.02,.055*K),(f.x*1.06,f.y-.16*K,.046*K),.062*K*b,.05*K*b)],boot,.0125*K,340,2,tint=bt)
        a.bone('foot'+S); a.box(.098*K,.262*K,.022*K,f.x*1.03,f.y-.058*K,.0,mat='leather',bev=.008,tint=tuple(v*.5 for v in bt))
        a.bone('shin'+S); cx,cy=(k.x+f.x)/2,(k.y+f.y)/2; a.lathe([(.074*K*b,0),(.09*K*b,.014*K),(.092*K*b,.05*K),(.08*K*b,.066*K)],cx,cy+.004,.345*K,mat=boot,n=14,cap=False,tint=tuple(v*.78 for v in bt)); a.tube([(cx+math.cos(t)*.081*K*b,cy+math.sin(t)*.081*K*b,.2*K) for t in[tau*i/12 for i in range(12)]],.008*K,'leather',closed=True,n=4,tint=tuple(v*.55 for v in bt)); a.box(.022*K,.014*K,.022*K,cx,cy-.083*K*b,.19*K,mat='bronze',bev=.003)
        a.sl(0)
def torso2(a,mat,tint,fem,bulk=1,slot=0,tris=900):
    K=a.k; b=bulk; a.sl(slot); a.bone('hips','spine','chest'); w=.88 if fem else 1
    S=[('s',(0,.0,1.36*K),.19*K*b*w,(1.08,.68,.85)),('c',(0,.0,1.3*K),(0,.0,1.09*K),.165*K*b*w,.142*K*b*(.88 if fem else 1)),('s',(0,0,.99*K),(.158 if fem else .152)*K*b,(1.07,.84,.8)),('s',(0,.005,1.46*K),.12*K*b*w,(1.55,.75,.55)),('c',(0,.0,1.45*K),(0,-.005,1.53*K),.07*K*w,.056*K*w),('s',(-.09*K*w,.07*K,1.38*K),.09*K*b,(1,.6,1.3)),('s',(.09*K*w,.07*K,1.38*K),.09*K*b,(1,.6,1.3))]
    if fem: S+=[('s',(s*.07*K,-.088*K,1.335*K),.07*K,(1,.95,1)) for s in(-1,1)]
    else: S+=[('s',(s*.075*K*b,-.095*K,1.385*K),.085*K*b,(1.1,.55,.8)) for s in(-1,1)]
    a.sculpt(S,mat,.015*K,tris,4,tint=tint,disp=(lambda p:noise.noise(p*10)*.006) if mat in('cloth','leather') else None); a.sl(0)
def arms2(a,mat,tint,fem,bulk=1,slot=0,fmat=None,ftint=None,fslot=None,hmat='skin',htint=W1,hslot=SKIN,sleeve=0):
    K=a.k; b=bulk*(.87 if fem else 1)
    for s,S in((1,'L'),(-1,'R')):
        u,f,h=a.p('arm'+S),a.p('fore'+S),a.p('hand'+S)
        a.sl(slot); a.bone('chest','arm'+S,'fore'+S); a.sculpt([('s',u,.08*K*b),('c',u,f,.067*K*b,.05*K*b),('s',u.lerp(f,.35)+V3((s*.008,-.006,0)),.066*K*b,(1,1,1.5)),('c',f,h.lerp(f,.35),.052*K*b,.045*K*b)],mat,.013*K,330,3,tint=tint,disp=(lambda p:noise.noise(p*14)*.004) if mat=='cloth' else None)
        a.sl(slot if fslot is None else fslot); a.bone('fore'+S,'hand'+S); a.sculpt([('c',f.lerp(h,.08),f.lerp(h,.45),.051*K*b,.053*K*b),('c',f.lerp(h,.4),h,.051*K*b,(.037+sleeve)*K*b)],fmat or mat,.012*K,170,2,tint=ftint or tint)
        if sleeve>.02: a.lathe([((.036+sleeve)*K*b,0),((.042+sleeve)*K*b,.01),((.03+sleeve)*K*b,.03)],*(h+(h-f).normalized()*-.012),mat=mat,n=12,cap=False,tint=tuple(v*.7 for v in tint))
        a.sl(hslot); a.bone('hand'+S); d=(h-f).normalized(); c=h+d*.05*K; q=.92 if fem else 1.04; T=[('s',c,.041*K*q,(.72,1,1.15)),('c',h-d*.01,c,.032*K*q,.036*K*q)]
        for i in range(4): y=(i-1.5)*.0205*K; ln=[.068,.08,.077,.062][i]*K; T+=[('c',c+V3((s*.004,y,-.028*K)),c+V3((-s*.012*K,y*1.05,-.052*K)),.0118*K*q,.0112*K*q),('c',c+V3((-s*.012*K,y*1.05,-.052*K)),c+V3((-s*.03*K,y*1.06,-ln)),.0108*K*q,.009*K*q)]
        T.append(('c',c+V3((0,-.034*K,.004*K)),c+V3((-s*.028*K,-.052*K,-.03*K)),.0135*K*q,.0105*K*q)); a.sculpt(T,hmat,.0075*K,320,2,tint=htint); a.sl(0)
def bracer(a,mat='leather',t=(.45,.33,.25),slot=0,fem=False):
    K=a.k; b=.9 if fem else 1; a.sl(slot)
    for S in 'LR':
        f,h=a.p('fore'+S),a.p('hand'+S); a.bone('fore'+S); a.tube([f.lerp(h,.3),f.lerp(h,.6),f.lerp(h,.92)],[.058*K*b,.054*K*b,.046*K*b],mat,n=12,tint=t); [a.tube([f.lerp(h,q)+V3((0,0,.006)),f.lerp(h,q)-V3((0,0,.008))],[.06*K*b-.011*q,.06*K*b-.011*q],'leather',n=12,tint=tuple(v*.55 for v in t)) for q in(.4,.78)]
    a.sl(0)
def belt2(a,r=.162,t=(.42,.3,.22),buckle='bronze',pouches=2,fem=False,z=1.03):
    r*=.96 if fem else 1; belt(a,z,r,t,buckle,0); K=a.k; a.bone('hips')
    for i in range(pouches): s=1 if i%2 else -1; x,y=s*(.115+.02*i)*K,-(r-.055)*K; a.box(.072*K,.05*K,.088*K,x,y,z*K-.11*K,mat='leather',bev=.014,tint=tuple(v*.9 for v in t)); a.box(.076*K,.056*K,.03*K,x,y-.002,z*K-.048*K,mat='leather',bev=.008,tint=tuple(v*.7 for v in t)); a.ball(.009*K,x,y-.03*K,z*K-.042*K,mat='bronze',n=6)
def skirt2(a,shade,z0,z1,r0,r1,slot,mat='cloth',n=22,trim=None,fem=False):
    K=a.k; a.sl(slot); a.bone('hips','legL','legR'); f=.96 if fem else 1; pr=[(r0*K*f,z0*K),((r0*.75+r1*.25)*K*f,(z0*.72+z1*.28)*K),((r0*.35+r1*.65)*K,(z0*.35+z1*.65)*K),(r1*K,z1*K),((r1-.012)*K,z1*K),((r0*.35+r1*.65-.014)*K,(z0*.35+z1*.65)*K),((r0-.01)*K,z0*K-.03*K)]
    def fold(bm):
        for v in bm.verts:
            if v.co.z<z0*K-.04: an=math.atan2(v.co.y,v.co.x); q=1+.06*math.sin(an*8+.6)*min(1,(z0*K-v.co.z)*4); v.co.x*=q; v.co.y*=q*.94
    bm=a.lathe(pr[::-1],0,0,0,mat=mat,n=n,cap=False,tint=sh(shade)); fold(bm)
    if trim is not None: a.sl(trim); bm=a.lathe([(r1*1.004*K,z1*K-.004),(r1*1.03*K,z1*K),(r1*1.015*K,z1*K+.04*K),(r1*.99*K,z1*K+.042*K)],0,0,0,mat='cloth',n=n,cap=False,tint=W1); fold(bm)
    a.sl(0)
def strap(a,side=1,mat='leather',t=(.42,.3,.22),fem=False,w=.026):
    K=a.k; y=.006 if fem else 0; a.bone('chest','spine'); P=[(side*.115*K,.05*K,1.535*K),(side*.125*K,-.06*K,1.49*K),(side*.075*K,(-.15-y)*K,1.40*K),(0,(-.165-y)*K,1.29*K),(-side*.08*K,-.15*K,1.16*K),(-side*.14*K,-.09*K,1.07*K)]; a.tube(P,w*K,mat,n=6,flat=.32,tint=t,up=(0,1,0))
    a.tube([(side*.115*K,.05*K,1.535*K),(side*.1*K,.13*K,1.42*K),(0,.15*K,1.28*K),(-side*.1*K,.12*K,1.14*K),(-side*.14*K,.05*K,1.06*K)],w*K,mat,n=6,flat=.32,tint=t,up=(0,1,0))
def cape2(a,slot,L=1.12,w=.38,inner=.45,clasp='gold'):
    K=a.k; a.sl(slot); a.bone('chest','cape','cape2'); bm=bmesh.new(); nx,nz=14,12; g={}; z0=1.475*K
    for j in range(nz+1):
        f=j/nz
        for i in range(nx+1): u=i/nx*2-1; ww=(.185+(w-.185)*f**.8)*K; g[i,j]=bm.verts.new((u*ww,(.142+.10*f+.06*(1-u*u)*(.4+f)-.035*math.cos(u*11+f*1.5)*f-.1*u*u*(1-f))*K,z0-f*L*K+.02*u*u+.012*math.cos(u*11)*f))
    for i in range(nx):
        for j in range(nz): bm.faces.new((g[i,j],g[i+1,j],g[i+1,j+1],g[i,j+1]))
    bm.normal_update()
    if sum(f.normal.y for f in bm.faces)<0: bmesh.ops.reverse_faces(bm,faces=bm.faces)
    q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); [setattr(v.co,'y',v.co.y-.008) for v in q.verts]; a.add(bm,'cloth',tint=W1,smooth=180); a.add(q,'cloth',tint=sh(inner),smooth=180)
    a.bone('chest'); a.sculpt([('c',(-.165*K,.06*K,1.48*K),(.165*K,.06*K,1.48*K),.056*K,.056*K),('c',(-.14*K,-.02*K,1.48*K),(-.05*K,-.108*K,1.445*K),.03*K,.024*K),('c',(.14*K,-.02*K,1.48*K),(.05*K,-.108*K,1.445*K),.03*K,.024*K)],'cloth',.014*K,320,2,tint=W1,disp=lambda p:noise.noise(p*22)*.006); a.sl(0)
    for s in(-1,1): a.ball(.024*K,s*.055*K,-.118*K,1.44*K,mat=clasp,n=10,sz=.5)
    a.tube([(-.05*K,-.125*K,1.435*K),(0,-.135*K,1.415*K),(.05*K,-.125*K,1.435*K)],.006*K,clasp,n=5)
def cuirass(a,fem,mat='steel',tint=(1,1,1),trim='gold',full=True):
    K=a.k; w=.9 if fem else 1; a.bone('chest','spine'); S=[('s',(0,-.01*K,1.375*K),.2*K*w,(1.08,.76,.84)),('c',(0,-.008*K,1.32*K),(0,-.005*K,1.15*K),.174*K*w,(.142 if fem else .152)*K),('c',(0,-.105*K,1.42*K),(0,-.09*K,1.17*K),.075*K,.05*K)]
    if fem: S+=[('s',(s*.068*K,-.1*K,1.345*K),.075*K) for s in(-1,1)]
    a.sculpt(S,mat,.0145*K,760,3,tint=tint)
    if trim: a.tube([(math.cos(t)*.132*K*w,math.sin(t)*.108*K-.004,1.505*K) for t in[tau*i/18 for i in range(18)]],.012*K,trim,closed=True,n=5); a.tube([(math.cos(t)*.163*K*w,math.sin(t)*.128*K-.004,1.145*K) for t in[tau*i/20 for i in range(20)]],.01*K,trim,closed=True,n=5)
    a.bone('hips','spine')
    for i in range(3): z=(1.1-i*.047)*K; a.lathe([((.17+i*.013)*K,z-.054*K),((.181+i*.013)*K,z-.05*K),((.176+i*.011)*K,z-.02*K),((.162+i*.01)*K,z+.01*K)],0,0,0,mat=mat,n=20,cap=False,tint=tint)
    for s,S in((1,'L'),(-1,'R')):
        a.bone('leg'+S); a.box(.135*K,.03*K,.2*K,s*.1*K,-.14*K,.775*K,mat=mat,bev=.014,rx=-8,tint=tint); u=a.p('arm'+S); a.bone('arm'+S,'chest')
        for i in range(4): a.sculpt([('s',u+V3((s*(.006+i*.017)*K,0,(.036-i*.04)*K)),(.1-i*.0085)*K*w,(1,.97,.6))],mat,.0115*K,190,2,tint=tint)
        if trim: a.tube([u+V3((s*(.0)*K+math.cos(t)*.094*K*w,math.sin(t)*.09*K*w,.038*K)) for t in[tau*i/16 for i in range(16)]],.008*K,trim,closed=True,n=4)
        f,h=a.p('fore'+S),a.p('hand'+S); a.bone('fore'+S); a.tube([f.lerp(h,.06),f.lerp(h,.5),f.lerp(h,.98)],[.061*K*w,.058*K*w,.049*K*w],mat,n=14,tint=tint); a.ball(.06*K*w,*f,mat=mat,n=12,tint=tint); a.lathe([(.0,0),(.03,.006),(0,.055)],f.x+s*.03*K,f.y+.045*K,f.z,mat=mat,n=8,rx=-80,cap=False,tint=tint)
        if full:
            k,ft,l=a.p('shin'+S),a.p('foot'+S),a.p('leg'+S); a.bone('shin'+S); a.tube([k-V3((0,0,.03*K)),k.lerp(ft,.5)+V3((0,-.006,0)),ft+V3((0,0,.07*K))],[.08*K,.083*K,.068*K],mat,n=14,tint=tint); a.sculpt([('s',k+V3((0,-.03*K,0)),.066*K,(.95,.8,1.15)),('c',k+V3((0,-.07*K,-.03*K)),k+V3((0,-.06*K,-.3*K)),.025*K,.02*K)],mat,.012*K,160,2,tint=tint); a.bone('foot'+S); [a.sculpt([('s',(ft.x*1.03,ft.y-.03*K-.05*K*i,(.065-.008*i)*K),.06*K,(1,.8,.75-.05*i))],mat,.012*K,110,2,tint=tint) for i in range(3)]; a.bone('leg'+S); a.tube([l.lerp(k,.28),l.lerp(k,.6),l.lerp(k,.9)],[.102*K,.093*K,.077*K],mat,n=14,tint=tint)
def robe2(a,fem,slot=CLOTH,trim=TRIM,z1=.035,r1=.3,open_=False,sash=None):
    K=a.k; torso2(a,'cloth',W1,fem,1.04,slot); a.sl(slot); a.bone('hips','legL','legR','shinL','shinR'); n=28; rows=10
    def build(inner):
        bm=bmesh.new(); L=bm.loops.layers.uv.verify(); g=[]
        for j in range(rows+1):
            f=j/rows; z=(1.05-(1.05-z1)*f)*K; r=((.154 if not fem else .15)+(r1-.154)*f**.85)*K-(0.01 if inner else 0); ring=[]
            for i in range(n):
                q=tau*(i+.5)/n-math.pi/2; cut=0
                if open_: cut=max(0,1-abs(((q+math.pi/2+math.pi)%tau)-math.pi)/.38)*f*.16*K
                ring.append(bm.verts.new((math.cos(q)*r*(1+.055*f*math.sin(q*9+1)),math.sin(q)*r*(.93+.05*f*math.sin(q*9+1))+cut,z)))
            g.append(ring)
        for j in range(rows):
            for i in range(n):
                f=bm.faces.new((g[j+1][i],g[j+1][(i+1)%n],g[j][(i+1)%n],g[j][i]))
                for l,(u,v) in zip(f.loops,((i,j+1),(i+1,j+1),(i+1,j),(i,j))): l[L].uv=(u*.075*K,-v*.11*K)
        if inner: bmesh.ops.reverse_faces(bm,faces=bm.faces)
        return bm
    a.add(build(False),'cloth',tint=W1,uv='keep',smooth=180); a.add(build(True),'cloth',tint=sh(.4),uv='keep',smooth=180)
    if trim is not None:
        a.sl(trim); a.bone('hips','legL','legR','shinL','shinR'); a.tube([(math.cos(t)*r1*K*(1+.055*math.sin(t*9+1)),math.sin(t)*r1*K*(.93+.05*math.sin(t*9+1)),z1*K+.02) for t in[tau*i/56 for i in range(56)]],.014*K,'cloth',closed=True,n=5,flat=1.6); a.bone('chest','spine'); a.box(.052*K,.016,.46*K,0,-(.148 if fem else .142)*K,1.03*K,mat='cloth',bev=.004,rx=3); a.tube([(-.1*K,-.03*K,1.52*K),(-.055*K,-.1*K,1.46*K),(0,-.135*K,1.4*K),(.055*K,-.1*K,1.46*K),(.1*K,-.03*K,1.52*K)],.017*K,'cloth',n=6)
    a.sl(0)
def tabard(a,fem,slot,emblem='gold',kind='cross'):
    K=a.k; a.sl(slot); a.bone('chest','spine','hips'); a.sculpt([('b',(0,-.15*K,1.18*K),(.25*K,.026,.64*K)),('b',(0,.143*K,1.18*K),(.25*K,.026,.64*K))],'cloth',.016,320,1,tint=W1,disp=lambda p:noise.noise(p*8)*.008); a.sl(0); y=-.172*K
    if kind=='cross': a.box(.045,.018,.27,0,y,1.12*K,mat=emblem,bev=.004); a.box(.17,.018,.045,0,y,1.275*K,mat=emblem,bev=.004)
    if kind=='sun': a.lathe([(0,0),(.055,.004),(.05,.016),(0,.02)],0,y,1.28*K,mat=emblem,n=14,rx=90,cap=False); [a.box(.014,.012,.05,math.sin(i*tau/10)*.075,y,1.28*K+math.cos(i*tau/10)*.075-.025,mat=emblem,bev=.002) for i in range(10)]
# ------------------------------------------------------------------ outfits
def fighter_(n,f): a=H(n); legs2(a,'mail',sh(.75),f,1,'steel',sh(.62)); torso2(a,'mail',sh(.9),f,1); arms2(a,'mail',sh(.9),f,1,hmat='leather',htint=(.5,.38,.3),hslot=0); cuirass(a,f,'steel',(.66,.68,.73),'bronze',False); skirt2(a,1,1.0,.66,.168,.22,CLOTH,trim=TRIM,fem=f); belt2(a,fem=f,r=.172); cape2(a,CLOTH); return a
def paladin_(n,f): a=H(n); legs2(a,'mail',sh(.8),f,1,'steel',sh(.75)); torso2(a,'mail',sh(.9),f,1.02); arms2(a,'mail',sh(.9),f,1,hmat='steel',htint=sh(.72),hslot=0); cuirass(a,f,'steel',(.86,.85,.82),'gold',True); skirt2(a,1,1.0,.6,.17,.225,CLOTH,trim=TRIM,fem=f); a.sl(TRIM); a.bone('hips','legL','legR'); a.box(.17*a.k,.02,.46*a.k,0,-.222*a.k,.56*a.k,mat='cloth',bev=.004,rx=5,sub=3,wob=.008); a.sl(0); belt2(a,r=.178,buckle='gold',fem=f,pouches=1); cape2(a,TRIM,1.22,.42); return a
def barbarian_(n,f):
    a=H(n); K=a.k; legs2(a,'leather',(.48,.36,.27),f,1.08,'fur',(.62,.48,.35)); torso2(a,'skin',W1,f,1.06,SKIN); arms2(a,'skin',W1,f,1.2,SKIN)
    if f: a.sl(CLOTH); a.bone('chest'); a.sculpt([('s',(0,.002,1.325*K),.182*K,(.98,.72,.4)),('s',(.072*K,-.1*K,1.335*K),.078*K),('s',(-.072*K,-.1*K,1.335*K),.078*K)],'hide',.012,420,3,tint=W1); a.tube([(0,-.165*K,1.37*K),(0,-.178*K,1.3*K)],.012*K,'leather',n=5); a.sl(0)
    strap(a,1,fem=f); a.bone('chest'); a.box(.05*K,.02*K,.05*K,0,-.178*K,1.27*K,mat='iron',bev=.006,ry=38)
    bracer(a,'leather',(.42,.3,.22),fem=f); a.bone('chest'); a.sculpt([('c',(-.21*K,.05,1.48*K),(.21*K,.05,1.48*K),.09,.09),('c',(-.2*K,-.03,1.47*K),(-.1*K,-.115,1.4*K),.06,.036),('c',(.2*K,-.03,1.47*K),(.1*K,-.115,1.4*K),.06,.036),('c',(0,.13,1.46*K),(0,.17,1.2*K),.16,.12)],'fur',.017,620,2,tint=(.62,.48,.36),disp=lambda p:noise.noise(p*32)*.018); skirt2(a,1,1.0,.68,.172,.235,CLOTH,'hair',fem=f); a.bone('hips','legL','legR'); a.box(.16,.02,.42,0,-.222,.6,mat='leather',bev=.006,tint=(.5,.38,.28),rx=5); belt2(a,r=.178,t=(.38,.27,.2),buckle='iron',fem=f); a.bone('hips'); [a.tube([(s*.17,-.08,1.0),(s*.18,-.1,.88),(s*.165,-.1,.8)],[.012,.016,.003],'bone',n=6) for s in(-1,1)]; return a
def bard_(n,f): a=H(n); K=a.k; legs2(a,'cloth',sh(.55),f,1,slot=TRIM); torso2(a,'cloth',W1,f,1,CLOTH); arms2(a,'cloth',W1,f,1.05,TRIM,fmat='cloth',ftint=sh(.9),fslot=CLOTH,sleeve=.012); a.bone('chest','spine'); [a.ball(.012*K,0,-(.148 if f else .14)*K,(1.14+.055*i)*K,mat='gold',n=8) for i in range(6)]; a.sl(TRIM); a.tube([(math.cos(t)*.09*K,math.sin(t)*.08*K,1.53*K+.012*math.sin(t*9)) for t in[tau*i/36 for i in range(36)]],.02*K,'cloth',closed=True,n=5); a.sl(0); skirt2(a,1,1.0,.76,.166,.21,CLOTH,trim=TRIM,fem=f); belt2(a,fem=f,buckle='gold'); cape2(a,TRIM,.78,.3); return a
def cleric_(n,f): a=H(n); legs2(a,'mail',sh(.88),f,1); torso2(a,'mail',sh(.9),f,1.02); arms2(a,'mail',sh(.9),f,1,hmat='leather',htint=(.5,.38,.3),hslot=0); bracer(a,'steel',sh(.9),fem=f); skirt2(a,1,1.0,.52,.17,.24,CLOTH,trim=TRIM,fem=f); tabard(a,f,CLOTH,'gold','sun'); belt2(a,r=.176,fem=f,buckle='gold'); a.sl(TRIM); K=a.k; a.bone('chest'); a.sculpt([('c',(-.17*K,.02,1.48*K),(.17*K,.02,1.48*K),.075,.075),('c',(-.16*K,-.04,1.47*K),(0,-.13,1.4*K),.045,.035),('c',(.16*K,-.04,1.47*K),(0,-.13,1.4*K),.045,.035)],'cloth',.014,340,2); a.sl(0); cape2(a,TRIM,1.05,.36); return a
def druid_(n,f): a=H(n); K=a.k; legs2(a,'leather',(.45,.36,.26),f,1,bt=(.4,.32,.24)); torso2(a,'hide',W1,f,1.02,CLOTH); arms2(a,'cloth',W1,f,1,TRIM,sleeve=.01); bracer(a,'bark',(.9,.8,.65),fem=f); skirt2(a,1,1.0,.4,.168,.27,CLOTH,trim=TRIM,fem=f); belt2(a,t=(.42,.33,.2),buckle='bone',fem=f); a.bone('chest'); a.sculpt([('c',(-.2*K,.03,1.48*K),(.2*K,.03,1.48*K),.08,.08),('s',(0,.14,1.4*K),.16,(1.2,.5,1))],'moss',.018,420,1,tint=(.9,1,.7),disp=lambda p:noise.noise(p*24)*.022); [a.tube([(s*.1*K,-.1*K,1.45*K),(s*.05*K,-.14*K,1.36*K),(0,-.15*K,1.32*K)],.006,'wood',n=4) for s in(-1,1)]; a.lathe([(0,-.03),(.022,0),(0,.03)],0,-.16*K,1.3*K,mat='crystal',n=6,cap=False,smooth=10,tint=(.4,1.3,.5),glow=.5); cape2(a,TRIM,1.0,.36,clasp='bone'); return a
def monk_(n,f): a=H(n); K=a.k; legs2(a,'cloth',W1,f,1.12,'cloth',sh(.7),slot=CLOTH,bslot=TRIM); torso2(a,'cloth',W1,f,1.0,CLOTH); arms2(a,'skin',W1,f,1.04,SKIN,fmat='cloth',ftint=(.8,.76,.66),fslot=0); a.sl(TRIM); a.bone('chest','spine'); [a.tube([(s*.13*K,-.02*K,1.52*K),(s*.06*K,-.12*K,1.42*K),(-s*.06*K,-.14*K,1.2*K),(-s*.1*K,-.12*K,1.08*K)],[.024*K,.026*K,.026*K,.02*K],'cloth',n=6,flat=.5) for s in(-1,1)]; a.bone('hips','spine'); a.lathe([(.155*K,-.05),(.172*K,-.04),(.172*K,.04),(.155*K,.05)],0,0,1.04*K,mat='cloth',n=20,cap=False); a.bone('hips','legL'); a.box(.06,.02,.42,.07*K,-.18*K,.62*K,mat='cloth',bev=.004,rx=4,sub=2,wob=.01); a.sl(0); skirt2(a,.95,1.0,.74,.165,.22,CLOTH,fem=f); a.bone('chest'); [a.ball(.02*K,math.cos(t)*.115*K,math.sin(t)*.12*K-.02,1.475*K-.05*K*max(0,-math.sin(t)),mat='wood',n=7) for t in[tau*i/20 for i in range(20)]]; return a
def ranger_(n,f): a=H(n); K=a.k; legs2(a,'leather',(.5,.42,.32),f,.98,bt=(.42,.32,.24)); torso2(a,'leather',(.56,.46,.34),f,1); arms2(a,'cloth',W1,f,1,CLOTH,hmat='leather',htint=(.42,.33,.26),hslot=0); bracer(a,fem=f); skirt2(a,1,1.0,.72,.165,.215,CLOTH,fem=f); belt2(a,fem=f,pouches=3); strap(a,-1,fem=f); cape2(a,CLOTH,1.0,.34,clasp='bronze'); quiver(a); return a
def rogue_(n,f):
    a=H(n); K=a.k; legs2(a,'cloth',(.16,.15,.16),f,.96,bt=(.28,.22,.2)); torso2(a,'leather',(.36,.29,.26),f,.98); arms2(a,'cloth',sh(.75),f,.96,CLOTH,hmat='leather',htint=(.28,.22,.2),hslot=0); bracer(a,'leather',(.3,.24,.21),fem=f); belt2(a,fem=f,pouches=4,t=(.34,.25,.2)); skirt2(a,.85,1.0,.8,.165,.2,CLOTH,'hide',fem=f); strap(a,1,t=(.3,.22,.18),fem=f,w=.022); strap(a,-1,t=(.3,.22,.18),fem=f,w=.022); a.bone('chest','spine')
    for i in range(4): x=-.1+.066*i; a.box(.016,.012,.08,x*K,-.172*K,(1.3-.035*i)*K,mat='steel',bev=.003,ry=-40)
    cape2(a,CLOTH,.86,.32,.5,'iron'); a.sl(TRIM); a.bone('chest','head'); a.tube([(math.cos(t)*.1*K,math.sin(t)*.09*K-.005,1.5*K+.012*math.sin(3*t)) for t in[tau*i/18 for i in range(18)]],.03*K,'cloth',closed=True,n=6); a.sl(0); return a
def sorcerer_(n,f): a=H(n); K=a.k; legs2(a,'cloth',sh(.5),f,.98,slot=TRIM); robe2(a,f,CLOTH,TRIM,.05,.3,True); arms2(a,'cloth',W1,f,1,CLOTH,sleeve=.03); belt2(a,buckle='gold',fem=f,pouches=1); [ (a.bone('arm'+S,'chest'),[a.sculpt([('s',a.p('arm'+S)+V3((s*(.012+.02*i)*K,0,(.035-.045*i)*K)),(.095-.012*i)*K*(.92 if f else 1),(1,.95,.55))],'scale',.012,170,2,tint=(.8,.6,.3)) for i in range(3)]) for s,S in((1,'L'),(-1,'R'))]; a.bone('chest'); a.lathe([(0,-.03),(.026,0),(0,.04)],0,-.158*K,1.38*K,mat='crystal',n=6,cap=False,smooth=10,tint=(1.6,.5,.2),glow=.7); cape2(a,TRIM,1.15,.38); return a
def warlock_(n,f): a=H(n); K=a.k; legs2(a,'leather',(.2,.17,.19),f,.98,bt=(.22,.18,.18)); robe2(a,f,CLOTH,TRIM,.1,.28,True); arms2(a,'cloth',W1,f,1,CLOTH,fmat='leather',ftint=(.24,.19,.2),fslot=0,hmat='leather',htint=(.2,.16,.17),hslot=0); belt2(a,buckle='iron',fem=f,t=(.26,.2,.18),pouches=1); a.bone('hips'); a.box(.15,.05,.19,.17*K,-.02,.86*K,mat='leather',bev=.01,tint=(.3,.1,.12),rz=80); a.box(.13,.055,.17,.17*K,-.02,.87*K,mat='bone',bev=.004,rz=80); a.sl(CLOTH); a.bone('chest'); bm=a.lathe([(.11*K,0),(.15*K,.06*K),(.19*K,.15*K),(.18*K,.15*K),(.14*K,.06*K),(.1*K,0)],0,.02,1.48*K,mat='cloth',n=16,cap=False,arc=230,rz=-25,tint=sh(.8)); a.sl(0); [a.tube([(s*.05*K,-.135*K,1.44*K),(s*.09*K,-.16*K,1.34*K),(0,-.175*K,1.24*K)],.006,'iron',n=4) for s in(-1,1)]; a.lathe([(0,-.03),(.024,0),(0,.03)],0,-.18*K,1.22*K,mat='crystal',n=6,cap=False,smooth=10,tint=(1.2,.3,1.4),glow=.8); cape2(a,TRIM,1.2,.4,.4,'iron'); return a
def wizard_(n,f): a=H(n); K=a.k; legs2(a,'cloth',sh(.3),f,.95); robe2(a,f,CLOTH,TRIM); arms2(a,'cloth',W1,f,1,CLOTH,sleeve=.045); belt2(a,t=(.45,.32,.2),fem=f,buckle='gold',pouches=1); a.bone('hips'); a.box(.16,.06,.2,-.19*K,-.03,.84*K,mat='leather',bev=.01,tint=(.4,.25,.16),rz=-75); a.box(.14,.066,.18,-.19*K,-.03,.85*K,mat='bone',bev=.004,rz=-75); a.sl(TRIM); a.bone('chest'); a.sculpt([('c',(-.19*K,.02,1.475*K),(.19*K,.02,1.475*K),.07,.07),('c',(-.17*K,-.04,1.47*K),(-.04*K,-.13,1.34*K),.05,.03),('c',(.17*K,-.04,1.47*K),(.04*K,-.13,1.34*K),.05,.03)],'cloth',.014,360,2); a.sl(0); return a
for c in('fighter','paladin','barbarian','bard','cleric','druid','monk','ranger','rogue','sorcerer','warlock','wizard'):
    for s in 'mf': reg(f'body_{c}_{s}',(lambda c,s:lambda n:globals()[c+'_'](n,s=='f'))(c,s))
# ------------------------------------------------------------------ heads
def face(a,fem,ears='round',jaw=1,brow=1,nose=1,sc=1,tusk=False,skin='skin',cheek=1,long=1,neck=1,old=0,sharp=0):
    K=a.k*sc; H0=a.p('head'); o=H0+V3((0,-.012*a.k,.115*a.k+.03*a.k*(sc-1))); a.sl(SKIN); a.bone('head'); j=jaw*(.9 if fem else 1); br=brow*(.66 if fem else 1); ns=nose*(.84 if fem else 1)
    S=[('s',o+V3((0,.014*K,.034*K)),.098*K,(.86,1.04,1.06)),('s',o+V3((0,-.03*K,-.03*K)),.073*K,(.92*j,.94,1.05*long)),('s',o+V3((0,-.058*K,-.086*K*long)),.034*K*(.9 if fem else 1),(1.2*j,.85,.8)),('c',o+V3((-.05*K*j,-.012*K,-.07*K*long)),o+V3((-.015*K,-.055*K,-.092*K*long)),.026*K,.026*K),('c',o+V3((.05*K*j,-.012*K,-.07*K*long)),o+V3((.015*K,-.055*K,-.092*K*long)),.026*K,.026*K),
       ('c',H0+V3((0,.008,-.07*a.k)),o+V3((0,.012,-.02*K)),(.05 if fem else .06)*a.k*neck,.054*K),('c',o+V3((0,-.09*K,.018*K)),o+V3((0,-.107*K,-.024*K)),.0095*K*ns,.0125*K*ns),('s',o+V3((0,-.108*K,-.03*K)),.0145*K*ns,(1.0,1,.85)),('s',o+V3((.0125*K*ns,-.1*K,-.034*K)),.009*K*ns),('s',o+V3((-.0125*K*ns,-.1*K,-.034*K)),.009*K*ns),
       ('c',o+V3((-.046*K,-.074*K,.034*K)),o+V3((-.012*K,-.09*K,.03*K)),.0145*K*br,.015*K*br),('c',o+V3((.046*K,-.074*K,.034*K)),o+V3((.012*K,-.09*K,.03*K)),.0145*K*br,.015*K*br),('s',o+V3((.046*K,-.062*K,-.028*K)),.026*K*cheek),('s',o+V3((-.046*K,-.062*K,-.028*K)),.026*K*cheek),('s',o+V3((0,-.083*K,-.06*K*long)),.024*K,(1.25,.8,.8))]
    for s in(-1,1):
        if ears=='round': S+=[('s',o+V3((s*.086*K,.012*K,.0)),.026*K,(.4,.85,1.25)),('s',o+V3((s*.084*K,.006*K,-.026*K)),.013*K,(.5,1,1))]
        if ears=='half': S+=[('s',o+V3((s*.086*K,.012*K,.0)),.024*K,(.4,.85,1.2)),('c',o+V3((s*.085*K,.01*K,.012*K)),o+V3((s*.1*K,.028*K,.045*K)),.014*K,.005*K)]
        if ears=='point': S+=[('s',o+V3((s*.085*K,.01*K,-.006*K)),.023*K,(.4,.85,1.1)),('c',o+V3((s*.084*K,.005*K,.005*K)),o+V3((s*.125*K,.045*K,.08*K)),.019*K,.004*K)]
        if ears=='long': S.append(('c',o+V3((s*.08*K,.0,0)),o+V3((s*.2*K,.05*K,.055*K)),.026*K,.005*K))
    def dent(co):
        r=0
        for s in(-1,1): d=(co-(o+V3((s*.035*K,-.092*K,.008*K)))).length; r-=.0145*K*max(0,1-d/(.027*K))
        d=(co-(o+V3((0,-.1*K,-.062*K*long)))); r-=.004*K*max(0,1-abs(d.z)/(.006*K))*max(0,1-abs(d.x)/(.028*K))
        return r
    a.sculpt(S,skin,.0062*K,1500,3,tint=W1,disp=dent)
    # lips, lids
    lz=-.0625*K*long; a.sculpt([('c',o+V3((-.02*K,-.088*K,lz+.004*K)),o+V3((0,-.0985*K,lz+.0065*K)),.0045*K,.0062*K),('c',o+V3((.02*K,-.088*K,lz+.004*K)),o+V3((0,-.0985*K,lz+.0065*K)),.0045*K,.0062*K)],skin,.003*K,70,1,tint=(.82,.52,.5) if fem else (.82,.62,.58)); a.sculpt([('c',o+V3((-.016*K,-.088*K,lz-.006*K)),o+V3((.016*K,-.088*K,lz-.006*K)),.0055*K,.0055*K),('s',o+V3((0,-.095*K,lz-.006*K)),.0065*K,(1.5,.7,.8))],skin,.003*K,70,1,tint=(.86,.54,.52) if fem else (.86,.66,.62))
    a.sl(0)
    for s in(-1,1):
        e=o+V3((s*.035*K,-.0715*K,.008*K)); a.ball(.0152*K,*e,mat='bone',n=12,tint=(1.5,1.5,1.5)); a.ball(.0078*K,*(e+V3((s*-.0005,-.0098*K,0))),mat='crystal',n=10,tint=(.35,.5,.6),slot=5); a.ball(.0042*K,*(e+V3((0,-.0142*K,0))),mat='rock_dark',n=8,tint=(.1,.1,.1))
        a.ball(.0159*K,*(e+V3((0,.0004*K,.0058*K))),mat=skin,n=12,tint=sh(.86),slot=SKIN); a.ball(.0156*K,*(e+V3((0,.001*K,-.0062*K))),mat=skin,n=10,tint=sh(.9),slot=SKIN)
        a.sl(SKIN); a.tube([e+V3((-.016*K,-.004*K,.004*K)),e+V3((-.006*K,-.0135*K,.0095*K)),e+V3((.006*K,-.0135*K,.0095*K)),e+V3((.016*K,-.004*K,.004*K))],.0034*K,skin,n=5,tint=sh(.8)); a.sl(0)
        if fem: a.tube([e+V3((-.015*K,-.006*K,.005*K)),e+V3((0,-.0165*K,.0085*K)),e+V3((.0165*K,-.005*K,.006*K))],.0016*K,'rock_dark',n=4,tint=(.1,.08,.07))
        a.sl(HAIR); w=.6 if fem else 1; a.tube([o+V3((s*.014*K,-.094*K,.03*K)),o+V3((s*.034*K,-.0935*K,.038*K)),o+V3((s*.056*K,-.077*K,.03*K))],[.0042*K*w,.0052*K*w,.002*K],'hair',n=5,tint=sh(.7)); a.sl(0)
    if tusk:
        for s in(-1,1): a.tube([o+V3((s*.024*K,-.09*K,-.072*K)),o+V3((s*.029*K,-.108*K,-.056*K)),o+V3((s*.031*K,-.11*K,-.03*K))],[.0075*K,.0065*K,.0015*K],'bone',n=6)
    a.meta['o']=[o.x,o.y,o.z,K]; return o,K
def head_p(n,**k): a=H(n); o,K=face(a,**k); return a,o,K
HK=dict(human=dict(),elf=dict(ears='point',jaw=.88,brow=.7,nose=.88,cheek=1.12,long=1.05),halfelf=dict(ears='half',jaw=.94,brow=.85,nose=.94,cheek=1.05),dwarf=dict(jaw=1.16,brow=1.25,nose=1.42,sc=1.04,cheek=1.1,long=.95),halfling=dict(jaw=1.0,brow=.8,nose=1.1,cheek=1.2,long=.9),gnome=dict(ears='half',jaw=.92,brow=.85,nose=1.5,cheek=1.2,long=.9),halforc=dict(ears='half',jaw=1.24,brow=1.35,nose=1.2,tusk=True,sc=1.02,neck=1.15))
for r,kw in HK.items():
    for s in 'mf': reg(f'head_{r}_{s}',(lambda kw,s:lambda n:head_p(n,fem=s=='f',**{k:(v*.94 if s=='f' and k in('jaw','brow') else v) for k,v in kw.items()})[0])(kw,s))
def tief(n,f):
    a,o,K=head_p(n,fem=f,ears='half',jaw=.95,brow=.95,nose=.95,cheek=1.08)
    for s in(-1,1): a.bone('head'); P=[o+V3((s*.05*K,-.055*K,.085*K)),o+V3((s*.085*K,-.03*K,.15*K)),o+V3((s*.11*K,.05*K,.18*K)),o+V3((s*.115*K,.11*K,.14*K)),o+V3((s*.12*K,.12*K,.08*K))] if f else [o+V3((s*.055*K,-.06*K,.075*K)),o+V3((s*.11*K,-.06*K,.13*K)),o+V3((s*.145*K,.0,.17*K)),o+V3((s*.15*K,.07*K,.15*K)),o+V3((s*.145*K,.1*K,.08*K)),o+V3((s*.15*K,.06*K,.03*K))]; R=[.026*K*(1-i/(len(P)-.4)) +.002 for i in range(len(P))]; a.tube(P,R,'rock_dark',n=9,tint=(.55,.45,.42),smooth=180)
    a.sl(SKIN); a.bone('hips'); k=a.k; a.tube([(0,.13*k,.98*k),(0,.3*k,.8*k),(.08,.45*k,.5*k),(.05,.55*k,.42*k),(-.05,.62*k,.5*k)],[.035*k,.03*k,.022*k,.016*k,.012*k],'skin',n=8,smooth=180); a.sl(0); return a
reg('head_tiefling_m',lambda n:tief(n,False)); reg('head_tiefling_f',lambda n:tief(n,True))
def dragonborn(n,f):
    a=H(n); K=a.k*1.08*(.95 if f else 1); H0=a.p('head'); o=H0+V3((0,-.012*a.k,.12*a.k)); a.sl(SKIN); a.bone('head'); bump=lambda p:noise.noise(p*34)*.0035
    S=[('s',o+V3((0,.015*K,.035*K)),.098*K,(.88,1.1,.98)),('c',o+V3((0,-.03*K,-.005*K)),o+V3((0,-.15*K,-.04*K)),.066*K,.046*K),('s',o+V3((0,-.16*K,-.036*K)),.045*K,(1.05,.85,.85)),('c',H0+V3((0,.012,-.09*a.k)),o+V3((0,.015,-.02*K)),.068*a.k,.068*K)]
    for s in(-1,1): S+=[('c',o+V3((s*.05*K,-.07*K,.045*K)),o+V3((s*.075*K,.04*K,.07*K)),.022*K,.02*K),('s',o+V3((s*.022*K,-.19*K,-.02*K)),.014*K),('s',o+V3((s*.06*K,-.03*K,-.05*K)),.04*K)]
    a.sculpt(S,'scale',.0085*K,1100,2,tint=W1,disp=bump); a.sculpt([('c',o+V3((0,-.02*K,-.075*K)),o+V3((0,-.15*K,-.088*K)),.042*K,.026*K)],'scale',.008*K,220,2,tint=sh(.8)); a.sl(0)
    for s in(-1,1): e=o+V3((s*.052*K,-.085*K,.022*K)); a.ball(.015*K,*e,mat='crystal',n=10,tint=(1.5,1.0,.2),glow=.25); a.box(.004*K,.006*K,.02*K,e.x+s*.011*K,e.y-.006*K,e.z-.01*K,mat='rock_dark',bev=0,tint=(.1,.1,.1)); [a.tube([o+V3((s*(.05+.02*i)*K,.06*K,(.1-.05*i)*K)),o+V3((s*(.075+.03*i)*K,.13*K,(.12-.06*i)*K)),o+V3((s*(.08+.03*i)*K,.21*K,(.13-.075*i)*K))],[.02*K,.014*K,.002*K],'bone',n=7,tint=(.75,.68,.55)) for i in range(3)]; [a.lathe([(.006*K,0),(0,-.022*K)],s*.034*K,o.y-(.11+.022*i)*K,o.z-.068*K,mat='bone',n=5,cap=False) for i in range(4)]
    a.sl(SKIN); a.bone('hips'); k=a.k; a.tube([(0,.12*k,.98*k),(0,.32*k,.78*k),(.05,.5*k,.45*k),(.0,.66*k,.25*k)],[.075*k,.06*k,.04*k,.01*k],'scale',n=9,smooth=180); a.sl(0); a.meta['o']=[o.x,o.y,o.z,K]; return a
reg('head_dragonborn_m',lambda n:dragonborn(n,False)); reg('head_dragonborn_f',lambda n:dragonborn(n,True))
# ------------------------------------------------------------------ hair
def hr(n,fn,*x): a=H(n); K=a.k; o=a.p('head')+V3((0,-.012*K,.115*K)); a.sl(HAIR); a.bone('head'); fn(a,o,K,*x); return a
strand=lambda f=60,g=12,h=.007:(lambda p:noise.noise(Vector((p.x*f,p.y*f,p.z*g)))*h)
def cap_(o,K,front=1): return [('s',o+V3((0,.024*K,.05*K)),.103*K,(.91,1.02,.98)),('s',o+V3((0,.05*K,-.005*K)),.086*K,(.98,.82,1.15)),('c',o+V3((-.045*K,-.055*K,.088*K)),o+V3((.045*K,-.06*K,.084*K)),.023*K*front,.025*K*front)]
def side(o,K,z=-.03,r=.021): return [('c',o+V3((s*.083*K,-.012*K,.045*K)),o+V3((s*.085*K,.008*K,z*K)),r*K,r*.9*K) for s in(-1,1)]
def short_m(a,o,K): a.sculpt(cap_(o,K)+side(o,K),'hair',.0095*K,620,2,tint=W1,disp=strand())
def long_m(a,o,K): a.bone('head','chest'); a.sculpt(cap_(o,K)+side(o,K,-.12,.024)+[('c',o+V3((0,.06*K,.0)),o+V3((0,.075*K,-.2*K)),.08*K,.05*K)]+[('c',o+V3((s*.06*K,.05*K,-.05*K)),o+V3((s*.085*K,.03*K,-.2*K)),.04*K,.024*K) for s in(-1,1)],'hair',.0105*K,820,2,tint=W1,disp=strand(50,8,.009)); a.bone('head'); stubble(a,o,K,.1)
def tied_m(a,o,K): a.sculpt(cap_(o,K,.8)+side(o,K,.0,.018),'hair',.0095*K,560,2,tint=W1,disp=strand()); a.bone('head','chest'); a.tube([o+V3((0,.11*K,.05*K)),o+V3((0,.15*K,.02*K)),o+V3((0,.155*K,-.08*K)),o+V3((0,.14*K,-.18*K))],[.024*K,.034*K,.03*K,.006*K],'hair',n=9,smooth=180); a.ball(.03*K,*(o+V3((0,.115*K,.045*K))),mat='leather',n=8,tint=(.5,.35,.25),slot=0); a.bone('head'); a.sculpt([('c',o+V3((-.022*K,-.094*K,-.05*K)),o+V3((0,-.104*K,-.046*K)),.006*K,.009*K),('c',o+V3((.022*K,-.094*K,-.05*K)),o+V3((0,-.104*K,-.046*K)),.006*K,.009*K),('s',o+V3((0,-.095*K,-.098*K)),.02*K,(.9,.7,1.3))],'hair',.005*K,160,1,tint=W1,disp=strand(70,20,.003))
def mohawk_m(a,o,K): a.sculpt([('c',o+V3((0,-.07*K+.03*K*i,(.11+.028*math.sin(i/5*math.pi))*K)),o+V3((0,-.07*K+.03*K*i+.012*K,(.16+.05*math.sin(i/5*math.pi))*K)),.022*K,.011*K) for i in range(7)]+[('c',o+V3((0,.1*K,.06*K)),o+V3((0,.12*K,-.08*K)),.026*K,.016*K)],'hair',.009*K,420,1,tint=W1,disp=strand(70,10,.008))
def stubble(a,o,K,L=.05): a.sculpt([('s',o+V3((0,-.068*K,-.078*K)),.049*K,(1.18,.8,.9)),('c',o+V3((-.062*K,-.02*K,-.045*K)),o+V3((0,-.08*K,-.1*K)),.024*K,.03*K),('c',o+V3((.062*K,-.02*K,-.045*K)),o+V3((0,-.08*K,-.1*K)),.024*K,.03*K),('c',o+V3((0,-.08*K,-.095*K)),o+V3((0,-.08*K,-.095*K-L*K)),.04*K,.014*K),('c',o+V3((-.028*K,-.096*K,-.05*K)),o+V3((.028*K,-.096*K,-.05*K)),.0095*K,.0095*K)],'hair',.008*K,420,2,tint=W1,disp=strand(60,16,.006))
def bald_m(a,o,K): stubble(a,o,K,.1); a.sculpt(side(o,K,.0,.012)+[('s',o+V3((0,.075*K,.0)),.06*K,(1.2,.6,.7))],'hair',.008*K,200,1,tint=sh(.85),disp=strand())
def long_f(a,o,K): a.bone('head','chest'); a.sculpt(cap_(o,K,1.1)+side(o,K,-.16,.027)+[('c',o+V3((0,.06*K,.0)),o+V3((0,.09*K,-.34*K)),.084*K,.05*K)]+[('c',o+V3((s*.06*K,.045*K,-.03*K)),o+V3((s*.09*K,.05*K,-.3*K)),.046*K,.02*K) for s in(-1,1)],'hair',.0105*K,960,3,tint=W1,disp=strand(46,7,.01))
def bun_f(a,o,K): a.sculpt(cap_(o,K,.95)+side(o,K,-.01,.017)+[('s',o+V3((0,.115*K,.085*K)),.048*K)],'hair',.0095*K,700,2,tint=W1,disp=strand()); a.tube([o+V3((math.cos(t)*.04*K,.1*K+math.sin(t)*.02*K,.07*K+math.sin(t)*.035*K)) for t in[tau*i/14 for i in range(14)]],.012*K,'hair',closed=True,n=5,tint=sh(.85)); [a.tube([o+V3((s*.075*K,-.06*K,.04*K)),o+V3((s*.088*K,-.05*K,-.04*K)),o+V3((s*.08*K,-.045*K,-.1*K))],[.009*K,.008*K,.002*K],'hair',n=5) for s in(-1,1)]
def bob_f(a,o,K): a.bone('head'); a.sculpt(cap_(o,K,1.15)+side(o,K,-.1,.03)+[('c',o+V3((0,.055*K,.0)),o+V3((0,.065*K,-.11*K)),.09*K,.075*K)],'hair',.0105*K,760,3,tint=W1,disp=strand(52,8,.008))
def braid_f(a,o,K): a.sculpt(cap_(o,K)+side(o,K,-.03,.02),'hair',.0095*K,640,2,tint=W1,disp=strand()); a.bone('head','chest'); P=[o+V3((.02*K,.1*K,-.03*K)),o+V3((.08*K,.07*K,-.12*K)),o+V3((.12*K,-.05*K,-.2*K)),o+V3((.11*K,-.13*K,-.32*K)),o+V3((.1*K,-.14*K,-.46*K))]; [a.ball((.032-.0012*i)*K,*(P[min(3,int(i/14*4))].lerp(P[min(4,int(i/14*4)+1)],(i/14*4)%1)+V3((.009*K*(1 if i%2 else -1),0,0))),mat='hair',n=7,tint=sh(1 if i%2 else .86)) for i in range(14)]; a.ball(.018*K,*(P[4]+V3((0,0,-.01))),mat='gold',n=8,slot=0)
def crop_f(a,o,K): a.sculpt(cap_(o,K,1.2)+side(o,K,-.015,.02)+[('c',o+V3((-.03*K,-.07*K,.1*K)),o+V3((.06*K,-.085*K,.06*K)),.024*K,.012*K)],'hair',.0095*K,640,1,tint=W1,disp=strand(70,20,.009))
for i,(m,f) in enumerate(((short_m,long_f),(long_m,bun_f),(tied_m,bob_f),(mohawk_m,braid_f),(bald_m,crop_f))): reg(f'hair_{i}_m',(lambda q:lambda n:hr(n,q))(m)); reg(f'hair_{i}_f',(lambda q:lambda n:hr(n,q))(f))
def beard_long(a,o,K): stubble(a,o,K,.3); a.bone('head','chest'); a.tube([o+V3((0,-.085*K,-.2*K)),o+V3((0,-.11*K,-.36*K)),o+V3((0,-.11*K,-.5*K))],[.05*K,.04*K,.01*K],'hair',n=9,smooth=180); [a.tube([o+V3((s*.035*K,-.09*K,-.11*K)),o+V3((s*.065*K,-.125*K,-.25*K)),o+V3((s*.06*K,-.12*K,-.38*K))],[.018*K,.02*K,.006*K],'hair',n=7,tint=sh(.86)) for s in(-1,1)]; a.sl(0); [a.lathe([(.022*K,-.015*K),(.026*K,0),(.022*K,.015*K)],*(o+V3((x*K,y*K,z*K))),mat='gold',n=9,cap=False) for x,y,z in((0,-.112,-.42),(.062,-.125,-.3),(-.062,-.125,-.3))]
reg('hair_beard',lambda n:hr(n,beard_long))
# ------------------------------------------------------------------ headgear
def gear(n,fn): a=H(n); K=a.k; o=a.p('head')+V3((0,-.012*K,.115*K)); fn(a,o,K); return a
def hood2(a,o,K): a.sl(CLOTH); hood(a,o,K,W1); a.sl(0)
def g_helm(a,o,K): helm(a,o,K,'open',tint=(.68,.7,.75),trim='bronze')
def g_crown(a,o,K): a.bone('head'); a.lathe([(.108*K,0),(.113*K,.008*K),(.113*K,.035*K),(.106*K,.04*K)],o.x,o.y+.014,o.z+.058*K,mat='gold',n=24,cap=False); [a.tube([o+V3((s*.1*K,-.02*K,.07*K)),o+V3((s*.14*K,.02*K,.13*K)),o+V3((s*.15*K,.1*K,.18*K))],[.012*K,.028*K,.004*K],'steel',n=6,flat=.3) for s in(-1,1)]; a.lathe([(0,-.015),(.013,0),(0,.02)],0,o.y-.102*K,o.z+.078*K,mat='crystal',n=6,cap=False,tint=(.4,.8,1.6),glow=.6)
def g_bard(a,o,K): a.sl(CLOTH); a.bone('head'); a.lathe([(.165*K,0),(.172*K,.014),(.112*K,.028),(.122*K,.062),(.07*K,.1),(0,.112)],o.x,o.y+.012,o.z+.07*K,mat='cloth',n=20,cap=False,rx=-8); a.lathe([(0,0),(.165*K,0)],o.x,o.y+.012,o.z+.069*K,mat='cloth',n=20,cap=False,rx=-8,tint=sh(.5)); a.sl(TRIM); a.lathe([(.114*K,.03),(.119*K,.04),(.12*K,.055)],o.x,o.y+.012,o.z+.07*K,mat='cloth',n=20,cap=False,rx=-8); a.tube([o+V3((.1*K,.02,.12*K)),o+V3((.17*K,.1,.25*K)),o+V3((.14*K,.24,.31*K))],[.006,.026,.004],'fur',n=6,flat=.3); a.sl(0)
def g_wizard(a,o,K): a.sl(CLOTH); a.bone('head'); a.lathe([(.205*K,.0),(.212*K,.012*K),(.13*K,.03*K),(.112*K,.06*K),(.088*K,.17*K)],o.x,o.y+.01*K,o.z+.06*K,mat='cloth',n=24,cap=False,wob=.01); a.lathe([(0,.0),(.205*K,-.004)],o.x,o.y+.01*K,o.z+.061*K,mat='cloth',n=24,cap=False,tint=sh(.5)); a.tube([o+V3((0,.01*K,.22*K)),o+V3((.01*K,.02*K,.31*K)),o+V3((.03*K,.06*K,.4*K)),o+V3((.05*K,.13*K,.45*K)),o+V3((.05*K,.18*K,.43*K))],[.09*K,.065*K,.042*K,.022*K,.003*K],'cloth',n=14,smooth=180); a.sl(TRIM); a.lathe([(.122*K,.035*K),(.128*K,.05*K),(.116*K,.078*K)],o.x,o.y+.01*K,o.z+.062*K,mat='cloth',n=24,cap=False); a.sl(0); a.box(.045*K,.015,.045*K,0,o.y-.118*K,o.z+.098*K,mat='gold',bev=.004)
def g_antler(a,o,K): a.bone('head'); a.lathe([(.104*K,0),(.11*K,.01*K),(.108*K,.03*K)],o.x,o.y+.014,o.z+.06*K,mat='wood',n=20,cap=False,wob=.01); [a.box(.03*K,.006,.06*K,o.x+math.cos(t)*.108*K,o.y+.014+math.sin(t)*.112*K,o.z+.06*K,mat='moss',bev=0,rz=math.degrees(t)+90,rx=-20,tint=(.8,1.1,.5)) for t in[tau*i/14 for i in range(14)]]; [a.tube([o+V3((s*.07*K,.0,.1*K)),o+V3((s*.13*K,.03,.2*K)),o+V3((s*.19*K,.05,.31*K)),o+V3((s*.17*K,.02,.41*K))],[.015,.014,.011,.003],'bone',n=6,tint=(.8,.72,.6)) for s in(-1,1)]; [a.tube([o+V3((s*.14*K,.035,.22*K)),o+V3((s*.23*K,.0,.28*K))],[.011,.003],'bone',n=5,tint=(.8,.72,.6)) for s in(-1,1)]
def g_circlet(a,o,K): a.bone('head'); a.tube([o+V3((math.cos(t)*.1*K,math.sin(t)*.108*K+.012*K,.062*K-.012*K*max(0,-math.sin(t)))) for t in[tau*i/26 for i in range(26)]],.005*K,'gold',closed=True,n=5); a.lathe([(0,-.02),(.013,0),(0,.02)],0,o.y-.1*K,o.z+.052*K,mat='crystal',n=6,cap=False,tint=(1.6,.3,.2),glow=.7)
def g_band(a,o,K): a.sl(TRIM); a.bone('head'); a.lathe([(.098*K,0),(.1035*K,.008*K),(.1035*K,.03*K),(.098*K,.036*K)],o.x,o.y+.013*K,o.z+.045*K,mat='cloth',n=24,cap=False); a.tube([o+V3((.02*K,.115*K,.06*K)),o+V3((.04*K,.16*K,-.0)),o+V3((.03*K,.17*K,-.1*K))],[.014,.012,.004],'cloth',n=5,flat=.3); a.sl(0)
def g_cowl(a,o,K): a.sl(TRIM); hood(a,o,K,W1); a.sl(0); a.bone('head'); [a.tube([o+V3((s*.07*K,-.03*K,.11*K)),o+V3((s*.12*K,-.01*K,.19*K)),o+V3((s*.12*K,.05*K,.26*K))],[.02,.015,.003],'rock_dark',n=7,tint=(.4,.3,.35)) for s in(-1,1)]
def g_miter(a,o,K): a.sl(CLOTH); a.bone('head'); a.sculpt([('s',o+V3((0,.02*K,.06*K)),.112*K,(.93,1.02,.9)),('c',o+V3((0,.06*K,.0)),o+V3((0,.07*K,-.1*K)),.095*K,.1*K)]+[('c',o+V3((s*.09*K,.0,.0)),o+V3((s*.08*K,.0,-.1*K)),.025*K,.025*K) for s in(-1,1)],'cloth',.0105*K,520,2); a.sl(TRIM); a.lathe([(.107*K,0),(.113*K,.01*K),(.111*K,.03*K)],o.x,o.y+.016*K,o.z+.06*K,mat='cloth',n=22,cap=False); a.sl(0)
for k,fn in dict(fighter=g_helm,paladin=g_crown,bard=g_bard,wizard=g_wizard,druid=g_antler,sorcerer=g_circlet,monk=g_band,ranger=hood2,rogue=hood2,warlock=g_cowl,cleric=g_miter).items(): reg('gear_'+k,(lambda q:lambda n:gear(n,q))(fn))
# ------------------------------------------------------------------ weapons, in the right hand unless they belong in the left
def wp(name,fn): reg('w_'+name,(lambda q:lambda n:(lambda a:(q(a),a)[1])(H(n)))(fn))
def sabre(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=72): a.lathe([(.015,-.06),(.016,.06)],mat='leather',n=8); a.ball(.024,0,0,-.08,mat='bronze',n=8); a.box(.16,.03,.024,0,0,.07,mat='bronze',bev=.008); a.extr([(-.018,.09),(.02,.09),(.05,.35),(.13,.64),(.2,.8),(.1,.72),(.02,.5),(-.012,.3)],.012,mat='steel',bev=.004)
def rapier_(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=72): a.lathe([(.013,-.06),(.014,.06)],mat='leather',n=8); a.ball(.022,0,0,-.08,mat='gold',n=8); a.lathe([(.06,.05),(.05,.075),(.015,.085)],mat='gold',n=14,cap=False); a.tube([(.05,0,.06),(.06,0,0),(.03,0,-.07)],.006,'gold',n=5); a.box(.018,.01,.92,0,0,.08,mat='steel',bev=.003,taper=(.3,.5))
def flail_(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=72): a.lathe([(.018,-.14),(.018,.34)],mat='wood',n=8); a.tube([(0,0,.34),(0,-.03,.42),(0,-.07,.47)],.009,'iron',n=5); a.ball(.062,0,-.1,.5,mat='iron',n=10); [a.lathe([(.012,.05),(0,.1)],0,-.1,.5,mat='iron',n=5,cap=False,rx=rx,rz=rz) for rx,rz in((0,0),(90,0),(90,60),(90,120),(90,180),(90,240),(90,300),(180,0))]
def glaive_(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=6): a.tube([(0,0,-c.z+.05),(0,0,1.0)],.018,'wood',n=8); a.extr([(-.02,.98),(.03,.98),(.1,1.2),(.09,1.4),(.03,1.55),(-.01,1.3)],.02,mat='steel',bev=.004); a.lathe([(.026,.9),(.03,.95),(.02,1.0)],mat='iron',n=8)
def trident_(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=6): a.tube([(0,0,-c.z+.05),(0,0,1.0)],.017,'wood',n=7); [a.tube([(0,0,.98),(x,0,1.05),(x,0,1.25)],[.014,.012,.002],'steel',n=6) for x in(-.08,0,.08)]; a.box(.18,.02,.02,0,0,1.03,mat='steel',bev=.005)
def xbow(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=90): a.box(.04,.05,.5,0,0,-.12,mat='wood',bev=.01); a.tube([(-.3,.0,.22),(-.16,0,.32),(0,0,.34),(.16,0,.32),(.3,0,.22)],[.01,.016,.02,.016,.01],'iron',n=6); a.tube([(-.3,0,.22),(0,.02,.1),(.3,0,.22)],.003,'cloth',n=3); a.box(.02,.02,.05,0,.04,.0,mat='iron',bev=.004)
def whip_(a):
    a.bone('handR'); c=at_hand(a)
    with a.at(c.x,c.y,c.z,rx=72): a.lathe([(.016,-.1),(.014,.1)],mat='leather',n=8); a.tube([(0,0,.1),(0,-.05,.25),(.05,-.2,.2),(.1,-.28,.0),(.05,-.34,-.2),(-.02,-.4,-.4)],[.012,.01,.008,.006,.004,.002],'leather',n=5,tint=(.5,.35,.25))
def lute_(a):
    a.bone('chest')
    with a.at(.05,.21,1.2,ry=38): a.sculpt([('s',(0,0,-.1),.17,(1,.4,1.1)),('s',(0,0,.06),.11,(1,.4,1))],'wood',.013,420,2); a.lathe([(.05,0),(.045,.01),(0,.012)],0,-.068,-.05,mat='rock_dark',n=14,rx=90,cap=False); a.box(.05,.03,.5,0,-.02,.1,mat='wood',bev=.006,tint=(.6,.5,.4)); a.box(.09,.03,.12,0,0,.58,mat='wood',bev=.006); [a.tube([(x,-.075,-.1),(x,-.04,.6)],.0015,'bone',n=3) for x in(-.012,0,.012)]
def orb_(a):
    a.bone('handR'); c=at_hand(a); a.ball(.055,c.x,c.y-.02,c.z-.06,mat='crystal',n=14,tint=(.5,.8,1.6),glow=.6)
for nm,fn in dict(longsword=lambda a:w_sword(a,hilt='bronze'),greatsword=lambda a:w_sword(a,L=1.2,w=.075,hilt='iron'),shortsword=lambda a:w_sword(a,L=.55,hilt='bronze',w=.05),dagger=lambda a:w_dagger(a,'R'),rapier=rapier_,scimitar=sabre,battleaxe=lambda a:w_axe(a,L=.85,double=False),greataxe=lambda a:w_axe(a,L=1.2),handaxe=lambda a:w_axe(a,L=.55,double=False),mace=lambda a:w_mace(a),flail=flail_,warhammer=lambda a:w_mace(a,hammer=True),maul=lambda a:(a.bone('handR'),a.stack.append(a.stack[-1]),w_mace(a,hammer=True),a.stack.pop()),spear=lambda a:w_spear(a),trident=trident_,glaive=glaive_,quarterstaff=lambda a:w_staff(a,head=''),staff=lambda a:w_staff(a),staff_skull=lambda a:w_staff(a,head='skull'),staff_antler=lambda a:w_staff(a,head='antler',gem=(.35,1.6,.5)),club=lambda a:w_club(a),crossbow=xbow,whip=whip_,lute=lute_,orb=orb_,bow=lambda a:w_bow(a,'L'),shield=lambda a:(only(a),a.sl(CLOTH),shield(a,t=(.5,.5,.5)),a.sl(0)),shield_round=lambda a:(only(a),a.sl(CLOTH),shield(a,kind='round',t=(.45,.45,.45)),a.sl(0))).items(): wp(nm,fn)
