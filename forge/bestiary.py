"""Second bestiary: forty more creatures."""
from chars import *
V3=Vector
def foe(label,size=1,kind='foe'): return char(kind,'foe',label=label,size=size)
def bst(label,size=1): return char('beast','foe',label=label,size=size)
nz=lambda f,h:(lambda p:noise.noise(p*f)*h)
def eyes(a,c,dx,r,mat='crystal',tint=(1.6,.9,.2),glow=.6,n=9): [a.ball(r,c[0]+s*dx,c[1],c[2],mat=mat,n=n,tint=tint,glow=glow) for s in(-1,1)]
def wingrig(J,base,s0=(.1,.1,0),e=(.8,.2,.5)):
    b=V3(J[base][1])
    for s,S in((1,'L'),(-1,'R')): J['wing'+S]=(base,(b.x+s*s0[0],b.y+s0[1],b.z+s0[2])); J['wing2'+S]=('wing'+S,(b.x+s*e[0],b.y+e[1],b.z+e[2]))
    return J
def wings(a,tips,mat='leather',t=(.5,.2,.15),bone='leather',bt=(.4,.25,.2),r=.05,feather=False,root=.5):
    """membrane or feathered wings: tips = list of points for the left side, in order from leading tip to body"""
    for s,S in((1,'L'),(-1,'R')):
        w,e=a.p('wing'+S),a.p('wing2'+S); T=[V3((s*x,y,z)) for x,y,z in tips]; inner=V3((s*abs(w.x)*.6,w.y+root,w.z-root*.6))
        a.bone('wing'+S); a.tube([w,e],[r*1.25,r],bone,n=7,tint=bt); a.bone('wing2'+S)
        if not feather: [a.tube([e,e.lerp(q,.5)+V3((0,0,r*1.2)),q],[r*.85,r*.55,r*.12],bone,n=6,tint=bt) for q in T]
        else: a.tube([e,T[0]],[r,r*.3],bone,n=6,tint=bt)
        for bn,tris in((('wing2'+S,),[(e,T[i],T[i+1]) for i in range(len(T)-1)]),(('wing'+S,'wing2'+S),[(e,T[-1],inner),(e,inner,w)])):
            a.bone(*bn); bm=bmesh.new()
            for A,B,C in tris:
                n2=6
                for i in range(n2):
                    b0,b1=B.lerp(C,i/n2),B.lerp(C,(i+1)/n2); sag=lambda v,f:v+(A-v)*((.14*math.sin(f*math.pi)) if not feather else .0); b0,b1=sag(b0,i/n2),sag(b1,(i+1)/n2)
                    if feather: b0=b0+(b0-A)*(.06*(i%2)); b1=b1+(b1-A)*(.06*((i+1)%2))
                    bm.faces.new([bm.verts.new(v) for v in(A,b0,b1)])
            bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=1e-4); q2=bm.copy(); bmesh.ops.reverse_faces(q2,faces=q2.faces); a.add(bm,mat,tint=t,smooth=180); a.add(q2,mat,tint=tuple(v*.8 for v in t),smooth=180)
            if feather:
                for A,B,C in tris:
                    for i in range(5): q=B.lerp(C,(i+.5)/5); d=(q-A); a.extr([(-.02*r/.05,0),(.02*r/.05,0),(.03*r/.05,d.length*.8),(0,d.length*1.08),(-.03*r/.05,d.length*.8)],.008,0,0,0,mat='hair',tint=tuple(v*(.75+.1*(i%3)) for v in t),) if False else a.tube([A.lerp(q,.15),A.lerp(q,.6)+V3((0,0,.01)),q+d*.08],[.012*r/.05,.03*r/.05,.006],'hair',n=5,flat=.25,tint=tuple(v*(.7+.12*(i%3)) for v in t))
def claws(a,p,n=3,w=.02,L=.06,mat='bone',t=(.6,.55,.45)): [a.tube([p+V3(((i-(n-1)/2)*w,-L*.3,-.005)),p+V3(((i-(n-1)/2)*w*1.3,-L*1.1,-L*.55))],[w*.42,w*.08],mat,n=5,tint=t) for i in range(n)]
def teeth(a,o,w,y,z,n=6,L=.03,up=False,r=.008): [a.lathe([(r,0),(0,(L if up else -L))],o.x-w+2*w*i/(n-1),y+abs(i-(n-1)/2)*w*.12,z,mat='bone',n=5,cap=False) for i in range(n)]
# --------------------------------------------------------------- flyers
def flyer(h=1.4,k=1): return {'hips':(None,(0,.12*k,h)),'spine':('hips',(0,0,h)),'chest':('spine',(0,-.08*k,h+.02*k)),'head':('chest',(0,-.24*k,h+.1*k))}
@bst('Giant Bat',2)
def bat(n):
    J=wingrig(flyer(1.5,1.5),'chest',(.12,.02,.04),(.72,.02,.3)); a=Char(n,'flyer',J); t=(.3,.23,.2); a.bone('hips','chest'); a.sculpt([('c',(0,.2,1.42),(0,-.16,1.55),.13,.19)],'fur',.02,420,2,tint=t,disp=nz(28,.02)); o=a.p('head'); a.bone('head'); a.sculpt([('s',o,.14),('s',o+V3((0,-.11,-.03)),.075,(1.1,.9,.8))]+[('c',o+V3((s*.07,.0,.08)),o+V3((s*.14,.03,.3)),.06,.012) for s in(-1,1)],'fur',.014,460,2,tint=t); eyes(a,(0,-.49,o.z+.03),.06,.022,tint=(1.8,.3,.2)); teeth(a,o,.03,o.y-.16,o.z-.06,2,.05); a.bone('hips'); [a.tube([(s*.07,.2,1.36),(s*.08,.26,1.22)],[.03,.015],'skin',n=6,tint=(.3,.2,.18)) for s in(-1,1)]; wings(a,[(1.75,.05,1.62),(1.5,.5,1.2),(1.0,.55,1.1)],'leather',(.7,.45,.4),'skin',(.32,.22,.2),.03,root=.3); return a
@bst('Stirge')
def stirge(n):
    J=wingrig(flyer(1.3,.5),'chest',(.05,0,.03),(.24,.02,.12)); a=Char(n,'flyer',J); t=(.5,.22,.16); a.bone('hips','chest'); a.sculpt([('s',(0,.06,1.28),.09,(.9,1.25,.9)),('s',(0,-.05,1.31),.07)],'hide',.012,300,2,tint=t,disp=nz(40,.008)); o=a.p('head'); a.bone('head'); a.sculpt([('s',o,.055)],'hide',.01,140,1,tint=t); a.tube([o+V3((0,-.04,-.01)),o+V3((0,-.15,-.06)),o+V3((0,-.24,-.12))],[.018,.01,.002],'bone',n=6); eyes(a,(0,o.y-.04,o.z+.02),.03,.016,tint=(1.6,1.2,.2)); a.bone('hips'); [a.tube([(s*.05,y,1.24),(s*.12,y-.02,1.2),(s*.1,y-.03,1.08)],[.012,.009,.003],'skin',n=5,tint=t) for s in(-1,1) for y in(-.02,.08)]; wings(a,[(.62,.0,1.5),(.55,.2,1.3),(.35,.22,1.2)],'leather',(.9,.5,.4),'skin',t,.012,root=.12); return a
@foe('Imp')
def imp(n):
    J=wingrig(humanoid(.82,sh=.19,hip=.1),'chest',(.05,.08,.06),(.3,.2,.26)); a=Char(n,'humanoid',J); t=(.66,.14,.1); legs(a,'skin',t,.95,'bare',t); torso(a,'skin',t,.95,.35); arms(a,'skin',t,'skin',t,.92); o=head(a,tint=t,ears='long',nose=1.5,jaw=1.05,brow=1.4,sc=1.5,eyes=(1.7,1.2,.2),mouth='tusk'); K=a.k*1.5; a.bone('head'); [a.tube([o+V3((s*.05*K,-.05*K,.09*K)),o+V3((s*.09*K,-.06*K,.17*K)),o+V3((s*.08*K,-.02*K,.23*K))],[.026*K,.018*K,.002*K],'rock_dark',n=7) for s in(-1,1)]; a.bone('hips'); a.tube([(0,.06,.44),(0,.2,.3),(.04,.36,.34),(.02,.46,.48)],[.028,.02,.014,.01],'skin',n=7,tint=t); a.lathe([(.03,0),(.0,.07)],.02,.46,.47,mat='rock_dark',n=6,cap=False); wings(a,[(.72,.28,.95),(.62,.36,.62),(.35,.3,.5)],'leather',(1.0,.25,.18),'skin',t,.016,root=.12); return a
# --------------------------------------------------------------- crawlers
def serp(n,L,z=.12,lift=0): 
    J={'hips':(None,(0,L*.5,z))}; p='hips'
    for i in range(1,n): J[f's{i}']=(p,(0,L*.5-L*i/(n-1)*.96,z+lift*max(0,(i/(n-1)-.7)/.3)**1.4)); p=f's{i}'
    J['head']=(p,(0,-L*.5-.05,z+lift*1.05)); return J
@bst('Giant Snake')
def snake(n):
    J=serp(9,2.6,.1,.42); a=Char(n,'serpent',J); N=list(J); a.bone(*N); t=(.34,.42,.2); P=[V3((.12*math.sin(i*.9)*(1-i/14),J[k][1][1],J[k][1][2])) for i,k in enumerate(N)]; S=[]; R=[.03,.07,.1,.125,.135,.13,.115,.095,.08,.08]
    for i in range(len(P)-1): S.append(('c',P[i],P[i+1],R[i],R[i+1]))
    a.sculpt([('c',P[0]+V3((0,.35,-.05)),P[0],.008,.03)]+S,'scale',.02,1200,3,tint=t); o=a.p('head'); a.bone('head'); a.sculpt([('s',o,.105,(1.1,1.15,.75)),('s',o+V3((0,-.13,-.015)),.075,(1.05,1,.7))],'scale',.014,380,2,tint=t); eyes(a,(0,o.y-.1,o.z+.045),.07,.02,tint=(1.6,1.1,.1)); [a.lathe([(.011,0),(0,-.08)],s*.04,o.y-.17,o.z-.03,mat='bone',n=5,cap=False) for s in(-1,1)]; a.tube([o+V3((0,-.18,-.03)),o+V3((0,-.3,-.04)),o+V3((.03,-.36,-.03))],[.008,.006,.002],'skin',n=4,tint=(.7,.1,.12)); a.bone(*N[2:6]); [a.extr([(0,-.09),(.07,0),(0,.09),(-.07,0)],.012,P[i].x,P[i].y,P[i].z+R[i]*.93,mat='scale',rx=90,tint=(.16,.2,.08)) for i in range(2,8)]; return a
@bst('Giant Centipede')
def centipede(n):
    J=serp(8,1.3,.14,.05); a=Char(n,'serpent',J); N=list(J); t=(.5,.24,.1)
    for i,k in enumerate(N):
        p=a.p(k); a.bone(k); a.sculpt([('s',p,.12-.006*abs(i-3),(1.15,.9,.62))],'hide',.018,110,1,tint=tuple(v*(1 if i%2 else .8) for v in t)); [a.tube([p+V3((s*.09,0,-.02)),p+V3((s*.26,-.04,.05)),p+V3((s*.34,-.06,-.13))],[.02,.016,.003],'hide',n=5,tint=(.7,.45,.15)) for s in(-1,1)]
    o=a.p('head'); a.bone('head'); [a.tube([o+V3((s*.06,-.08,.03)),o+V3((s*.16,-.3,.14)),o+V3((s*.22,-.5,.1))],[.012,.008,.002],'hide',n=4,tint=t) for s in(-1,1)]; [a.tube([o+V3((s*.05,-.1,-.02)),o+V3((s*.09,-.18,-.03)),o+V3((s*.02,-.22,-.04))],[.025,.018,.003],'rock_dark',n=6) for s in(-1,1)]; eyes(a,(0,o.y-.08,o.z+.04),.05,.018,tint=(1.4,.2,.1)); return a
@bst('Purple Worm',4)
def purple_worm(n):
    J=serp(9,6.4,.75,2.3); a=Char(n,'serpent',J); N=list(J); a.bone(*N); t=(.42,.2,.5); P=[a.p(k) for k in N]; R=[.25,.55,.72,.8,.82,.8,.78,.74,.7,.66]
    a.sculpt([('c',P[0]+V3((0,1.1,-.3)),P[0],.05,.25)]+[('c',P[i],P[i+1],R[i],R[i+1]) for i in range(len(P)-1)],'hide',.09,1900,3,tint=t,disp=lambda p:.06*math.sin(p.y*7+p.z*4)+noise.noise(p*3)*.04); o=a.p('head'); a.bone('head'); d=V3((0,-.75,.2)).normalized()
    with a.at(o.x,o.y-.3,o.z+.1,rx=80): a.lathe([(.55,-.35),(.72,0),(.66,.18),(.5,.12),(.35,-.2),(0,-.4)],mat='hide',n=22,cap=False,tint=(.5,.25,.5)); [a.lathe([(.06,0),(0,.34)],math.cos(t_)*.56,math.sin(t_)*.56,.08,mat='bone',n=6,cap=False,ry=math.degrees(-.6*math.cos(t_)),rx=math.degrees(.6*math.sin(t_))) for t_ in[tau*i/16 for i in range(16)]]; a.lathe([(0,-.3),(.4,-.12)],mat='skin',n=18,cap=False,tint=(.5,.08,.1))
    a.bone('hips'); a.lathe([(.12,0),(0,.7)],0,4.0,.55,mat='bone',n=8,rx=-80,cap=False); return a
@bst('Giant Scorpion',2)
def scorpion(n):
    r=1.1; J=arach(r); J['abd']=('hips',(0,.35*r,.45*r))
    for i,(y_,z_) in enumerate(((.55,.55),(.98,.8),(1.14,1.22),(.92,1.62))): J[f'tl{i}']=(f'tl{i-1}' if i else 'abd',(0,y_*r,z_*r))
    a=Char(n,'spider',J); t=(.3,.2,.12); a.bone('hips'); a.sculpt([('s',(0,0,.5*r),.3*r,(1,1.4,.5)),('s',(0,.35*r,.5*r),.26*r,(1,1,.55))],'hide',.03,420,2,tint=t,disp=nz(6,.012)); [a.lathe([(.3*r-.03*i,0),(.31*r-.03*i,.02),(.28*r-.03*i,.05)],0,(-.25+.16*i)*r,.5*r,mat='hide',n=14,cap=False,tint=tuple(v*.7 for v in t),rx=90,sq=.2) for i in range(5) if False]
    for i in range(4): p=a.p(f'tl{i}'); q=a.p(f'tl{i+1}') if i<3 else p+V3((0,-.44*r,.14*r)); a.bone(f'tl{i}'); a.sculpt([('c',p,q,(.13-.012*i)*r,(.12-.014*i)*r)],'hide',.025,130,1,tint=t)
    p=a.p('tl3')+V3((0,-.44*r,.14*r)); a.sculpt([('s',p,.13*r)],'hide',.025,110,1,tint=(.4,.2,.08)); a.tube([p+V3((0,-.06,-.04)),p+V3((0,-.22,-.1)),p+V3((0,-.26,-.28))],[.06,.04,.004],'rock_dark',n=7); a.bone('head'); eyes(a,(0,-.43*r,.58*r),.07,.025,tint=(1.3,.1,.05))
    for s in(-1,1): a.tube([(s*.16*r,-.3*r,.48*r),(s*.5*r,-.6*r,.6*r),(s*.46*r,-.95*r,.52*r)],[.07,.075,.07],'hide',n=7,tint=t); a.sculpt([('s',(s*.44*r,-1.1*r,.5*r),.17*r,(.8,1.3,.6))],'hide',.025,140,1,tint=t); [a.tube([(s*(.44+dx)*r,-1.22*r,.5*r),(s*(.44+dx*1.6)*r,-1.42*r,.5*r),(s*(.44+dx*.3)*r,-1.56*r,.5*r)],[.06,.05,.006],'hide',n=6,tint=(.2,.12,.08)) for dx in(-.08,.08)]
    for i in range(4):
        for s,S in((1,'L'),(-1,'R')): u,l=a.p(f'u{i}{S}'),a.p(f'l{i}{S}'); u=V3((u.x,u.y,.48*r)); l2=V3((l.x*.92,l.y*.92,.78*r)); an=rad(28+i*38)*s; d=V3((math.sin(an),-math.cos(an),0)); a.bone(f'u{i}{S}'); a.tube([u,u.lerp(l2,.5)+V3((0,0,.06)),l2],[.06*r,.05*r,.042*r],'hide',n=6,tint=t); a.bone(f'l{i}{S}'); e=V3((d.x*1.25*r,d.y*1.25*r-.04,.02)); a.tube([l2,l2.lerp(e,.5)+d*.08*r,e],[.042*r,.03*r,.008*r],'hide',n=6,tint=t)
    return a
# --------------------------------------------------------------- beasts on four legs
@bst('Boar')
def boar(n): J=quad(.55,.95,.14,.08); a=Char(n,'quad',J); beast(a,.55,.95,.14,'fur',(.3,.22,.17),.24,.05,.2,tailr=.02,eye=(.8,.3,.15)); o=a.p('head'); a.bone('head'); [a.tube([o+V3((s*.06,-.2,-.09)),o+V3((s*.11,-.26,-.04)),o+V3((s*.1,-.26,.06))],[.022,.018,.003],'bone',n=6) for s in(-1,1)]; a.bone('spine','chest','neck'); a.sculpt([('c',(0,.15,.8),(0,-.5,.84),.05,.07)],'fur',.02,160,1,tint=(.16,.12,.1),disp=nz(40,.03)); return a
@bst('Giant Crocodile',3)
def crocodile(n):
    h=.5; L=2.4; J=quad(h,L,.42,.2); J['head']=('neck',(0,-1.55,.55)); J['jaw']=('head',(0,-1.6,.46)); J['tail']=('hips',(0,1.3,.5)); J['tail2']=('tail',(0,2.1,.38)); J['tail3']=('tail2',(0,2.9,.26)); a=Char(n,'quad',J); p=a.p; t=(.28,.34,.2); a.bone('hips','spine','chest','neck'); a.sculpt([('s',p('hips'),.4,(1.05,1.3,.75)),('c',p('hips'),p('chest'),.42,.44),('s',p('chest'),.44,(1.05,1.1,.75)),('c',p('chest')+V3((0,-.2,0)),p('head')+V3((0,.1,0)),.36,.26)],'scale',.05,1200,3,tint=t,disp=lambda q:.025*max(0,math.sin(q.x*16)*math.sin(q.y*9))*(1 if q.z>.5 else 0)); o=p('head'); a.bone('head'); a.sculpt([('s',o,.27,(1.1,1,.7)),('c',o+V3((0,-.1,.0)),o+V3((0,-1.0,-.05)),.2,.11),('s',o+V3((0,-1.02,-.02)),.12,(1.1,.8,.8)),('s',o+V3((.13,-.1,.15)),.08),('s',o+V3((-.13,-.1,.15)),.08)],'scale',.03,700,2,tint=t); eyes(a,(0,o.y-.15,o.z+.18),.14,.04,tint=(1.5,1.1,.1)); [a.lathe([(.025,0),(0,-.1)],s*(.16-.008*i),o.y-.25-.1*i,o.z-.07,mat='bone',n=5,cap=False) for s in(-1,1) for i in range(8)]; a.bone('jaw'); a.sculpt([('c',o+V3((0,-.02,-.14)),o+V3((0,-.98,-.16)),.17,.09)],'scale',.03,260,2,tint=(.5,.5,.34)); [a.lathe([(.02,0),(0,.08)],s*(.13-.006*i),o.y-.3-.1*i,o.z-.12,mat='bone',n=5,cap=False) for s in(-1,1) for i in range(7)]
    for S in 'LR':
        s=1 if S=='L' else -1
        for u,l,z in(('fl','fs',0),('bl','bs',1)): q,k=p(u+S),p(l+S); k=V3((k.x+s*.18,k.y,.25)); f=V3((k.x+s*.05,k.y-.1,.06)); a.bone('chest' if z==0 else 'hips',u+S,l+S); a.sculpt([('c',q,k,.17,.12),('c',k,f,.11,.09),('c',f,f+V3((0,-.12,-.01)),.1,.08)],'scale',.035,260,2,tint=t); a.bone(l+S); claws(a,f+V3((0,-.16,.0)),4,.05,.1)
    a.bone('hips','tail','tail2','tail3'); e=V3((0,3.6,.16)); a.sculpt([('c',p('hips')+V3((0,.3,0)),p('tail'),.34,.27),('c',p('tail'),p('tail2'),.27,.18),('c',p('tail2'),p('tail3'),.18,.1),('c',p('tail3'),e,.1,.02)],'scale',.04,560,2,tint=t); [a.lathe([(.06,0),(0,.14)],s*.1*(1-i/16),1.2+.15*i,.72-.022*i,mat='scale',n=4,cap=False,tint=(.2,.24,.14)) for i in range(15) for s in(-1,1)]; return a
@bst('Giant Ape',3)
def ape(n):
    a=H(n,3.3,sh=.27,hip=.12); K=a.k; t=(.2,.17,.16); f=nz(9,.05); legs(a,'fur',t,1.25,'bare',(.22,.18,.16)); torso(a,'fur',t,1.35,.6); arms(a,'fur',t,'skin',(.24,.19,.17),1.6); o=a.p('head')+V3((0,-.06*K,.06*K)); a.bone('head'); a.sculpt([('s',o+V3((0,.02*K,.04*K)),.125*K,(.95,1.05,1)),('c',o+V3((-.06*K,-.08*K,.05*K)),o+V3((.06*K,-.08*K,.05*K)),.034*K,.034*K),('s',o+V3((0,.03*K,.12*K)),.08*K)],'fur',.02*K,520,2,tint=t,disp=nz(14,.012)); a.sculpt([('s',o+V3((0,-.085*K,-.04*K)),.075*K,(1.05,.9,.85)),('s',o+V3((0,-.075*K,.02*K)),.06*K,(1.1,.6,.8))],'skin',.012*K,360,2,tint=(.26,.2,.18)); eyes(a,(0,o.y-.112*K,o.z+.026*K),.034*K,.012*K,tint=(1.2,.6,.15),glow=.2); teeth(a,o,.03*K,o.y-.155*K,o.z-.045*K,4,.02*K,r=.008*K); a.bone('chest'); a.sculpt([('s',(0,-.14*K,1.34*K),.13*K,(1.2,.4,.9))],'skin',.02*K,200,2,tint=(.26,.21,.19)); return a
@bst('Owlbear',2)
def owlbear(n):
    J=quad(1.05,1.4,.26,.32); a=Char(n,'quad',J); t=(.42,.3,.2); beast(a,1.05,1.4,.26,'fur',t,.38,.13,.02,ears=False,tailr=.07,belly=1.1,jaw=False); o=a.p('head'); a.bone('head'); a.sculpt([('s',o+V3((0,-.02,.04)),.31,(1.1,1,1)),('s',o+V3((.13,-.2,.06)),.15,(1,.5,1)),('s',o+V3((-.13,-.2,.06)),.15,(1,.5,1))]+[('c',o+V3((s*.17,.0,.22)),o+V3((s*.3,.04,.44)),.07,.012) for s in(-1,1)],'hair',.025,700,2,tint=(.5,.38,.26),disp=nz(22,.025)); [a.lathe([(.0,.0),(.12,.01),(.13,.03)],s*.125,o.y-.28,o.z+.06,mat='hair',n=14,rx=90,cap=False,tint=(.8,.68,.5)) for s in(-1,1)]; eyes(a,(0,o.y-.285,o.z+.06),.125,.062,tint=(1.7,1.1,.1),glow=.5,n=12); [a.ball(.03,s*.125,o.y-.335,o.z+.06,mat='rock_dark',n=8) for s in(-1,1)]; a.tube([o+V3((0,-.26,.02)),o+V3((0,-.42,-.04)),o+V3((0,-.43,-.18))],[.09,.07,.006],'rock_dark',n=9,tint=(.6,.5,.3)); a.bone('chest','neck'); a.sculpt([('s',a.p('chest')+V3((0,-.1,.02)),.46,(1,1,1))],'hair',.04,420,1,tint=(.46,.34,.24),disp=nz(18,.05))
    for S in 'LR':
        for l in('fs','bs'): q=a.p(l+S); a.bone(l+S); claws(a,V3((q.x,q.y-.14,.07)),4,.06,.15,t=(.25,.22,.2))
    return a
@bst('Rust Monster')
def rust_monster(n):
    J=quad(.6,1.0,.2,.14); a=Char(n,'quad',J); t=(.62,.36,.16); beast(a,.6,1.0,.2,'hide',t,.25,.055,.12,ears=False,tailr=.07,eye=(.3,.2,.1)); o=a.p('head'); a.bone('spine','chest','hips'); [a.sculpt([('s',(0,.42-.28*i,.78),.24-.02*abs(i-1),(1.15,.75,.45))],'rust',.03,160,1) for i in range(4)]; a.bone('head'); [a.tube([o+V3((s*.06,-.06,.08)),o+V3((s*.16,-.34,.2)),o+V3((s*.22,-.6,.1)),o+V3((s*.2,-.72,-.02))],[.018,.015,.012,.02],'hair',n=6,tint=(.75,.5,.3)) for s in(-1,1)]; a.bone('tail2'); e=a.p('tail2')+V3((0,.2,-.1)); [a.extr([(0,-.02),(.1,.1),(0,.22)],.02,e.x,e.y,e.z,mat='rust',rz=r_) for r_ in(0,60,120,180)]; return a
@bst('Basilisk',2)
def basilisk(n):
    h=.62; L=1.7; J=quad(h,L,.3,.2); J['tail3']=('tail2',(0,L*1.25,h*.55)); a=Char(n,'quad',J); t=(.3,.36,.3); beast(a,h,L,.3,'scale',t,.34,.085,.3,ears=False,tailr=.15,eye=(.4,1.8,.4),disp=nz(8,.02)); a.bone('hips','spine','chest','neck'); [a.extr([(-.1,0),(.1,0),(.06,.26)],.035,0,.8-.2*i,h+.3+.03*math.sin(i),mat='rock_dark',rz=90,tint=(.6,.7,.55)) for i in range(10)]; a.bone('chest','hips'); [a.tube([(s*.3,y,.5),(s*.45,y-.05,.42),(s*.46,y-.08,.05)],[.08,.07,.05],'scale',n=7,tint=t) for s in(-1,1) for y in(.0,.25)]; o=a.p('head'); a.bone('head'); eyes(a,(0,o.y-.16,o.z+.06),.16,.055,tint=(.5,1.8,.4),glow=.9); [a.tube([o+V3((s*.1,.05,.16)),o+V3((s*.18,.2,.28))],[.05,.006],'bone',n=6) for s in(-1,1)]; return a
@bst('Griffon',2)
def griffon(n):
    J=wingrig(quad(1.15,1.5,.2,.45),'chest',(.2,.1,.22),(1.0,.25,1.0)); a=Char(n,'quad',J); t=(.62,.46,.26); beast(a,1.15,1.5,.2,'fur',t,.29,.09,.04,ears=False,tailr=.04,jaw=False); o=a.p('head'); w=(.85,.8,.7); a.bone('head'); a.sculpt([('s',o,.19,(.9,1.1,1)),('c',o+V3((-.07,-.12,.08)),o+V3((.07,-.12,.08)),.04,.04)]+[('c',o+V3((s*.08,.05,.13)),o+V3((s*.11,.1,.3)),.04,.008) for s in(-1,1)],'hair',.018,460,2,tint=w,disp=nz(28,.015)); a.tube([o+V3((0,-.12,.0)),o+V3((0,-.28,-.02)),o+V3((0,-.32,-.14))],[.085,.06,.006],'bone',n=9,tint=(1.0,.75,.25)); eyes(a,(0,o.y-.13,o.z+.05),.11,.03,tint=(1.7,1.0,.1)); a.bone('neck','chest'); a.sculpt([('c',a.p('chest')+V3((0,-.1,.1)),o+V3((0,.08,-.08)),.3,.19)],'hair',.03,460,1,tint=w,disp=nz(20,.045)); wings(a,[(2.7,.5,1.9),(2.3,1.2,1.4),(1.5,1.3,1.15)],'hair',(.62,.5,.34),'hair',(.6,.46,.3),.07,True,root=.6)
    for S in 'LR': q=a.p('fs'+S); a.bone('fs'+S); claws(a,V3((q.x,q.y-.12,.06)),3,.06,.16,t=(.3,.25,.15))
    return a
@bst('Manticore',2)
def manticore(n):
    J=wingrig(quad(1.1,1.5,.22,.35),'chest',(.2,.1,.2),(.95,.25,.95)); J['tail3']=('tail2',(0,1.9,1.3)); J['tail']=('hips',(0,.85,1.15)); J['tail2']=('tail',(0,1.4,1.2)); a=Char(n,'quad',J); t=(.62,.36,.18); beast(a,1.1,1.5,.22,'fur',t,.32,.1,.02,ears=False,tailr=.07,jaw=False); o=a.p('head'); a.bone('head','neck'); a.sculpt([('s',o+V3((0,.1,.02)),.34,(1,.8,1.1)),('c',o+V3((0,.1,-.1)),o+V3((0,-.02,-.35)),.22,.1)],'fur',.03,520,1,tint=(.3,.13,.07),disp=nz(16,.06)); a.bone('head'); a.sculpt([('s',o+V3((0,-.12,.02)),.17,(.9,.9,1.1)),('s',o+V3((0,-.24,-.06)),.08,(1.1,.8,1)),('c',o+V3((-.08,-.24,.08)),o+V3((.08,-.24,.08)),.03,.03),('c',o+V3((0,-.26,.04)),o+V3((0,-.3,-.03)),.025,.035)],'skin',.014,520,2,tint=(.8,.5,.35)); eyes(a,(0,o.y-.26,o.z+.045),.06,.02,tint=(1.7,.8,.1)); teeth(a,o,.05,o.y-.3,o.z-.08,6,.05,r=.01); wings(a,[(2.5,.5,1.8),(2.2,1.2,1.3),(1.4,1.3,1.05)],'leather',(.8,.35,.25),'skin',(.55,.28,.16),.06,root=.6); a.bone('tail2','tail3'); e=V3((0,2.0,1.35)); a.tube([a.p('tail2'),a.p('tail3'),e],[.08,.07,.1],'fur',n=8,tint=t); [a.lathe([(.025,0),(0,.38)],e.x,e.y,e.z,mat='bone',n=5,cap=False,rx=-50-40*math.sin(i*1.7),rz=i*37) for i in range(12)]; return a
@bst('Chimera',2)
def chimera(n):
    J=wingrig(quad(1.15,1.6,.26,.35),'chest',(.22,.1,.22),(1.0,.25,1.0)); J['t0']=('chest',(.3,-.62,1.35)); J['t1']=('chest',(-.3,-.62,1.35)); a=Char(n,'quad',J); t=(.6,.42,.22); beast(a,1.15,1.6,.26,'fur',t,.36,.11,.24,tailr=.07); o=a.p('head'); a.bone('head','neck'); a.sculpt([('s',o+V3((0,.14,.0)),.4,(1,.7,1.05))],'fur',.04,420,1,tint=(.34,.18,.08),disp=nz(15,.07))
    g=V3((.46,-.95,1.75)); a.bone('t0'); a.tube([a.p('t0'),a.p('t0').lerp(g,.6)+V3((.04,0,.05)),g],[.2,.17,.13],'scale',n=9,tint=(.55,.12,.08)); a.sculpt([('s',g,.17),('c',g+V3((0,-.08,0)),g+V3((0,-.4,-.05)),.12,.07)],'scale',.02,380,2,tint=(.55,.12,.08)); eyes(a,(g.x,g.y-.14,g.z+.07),.09,.03,tint=(1.8,1,.1)); [a.tube([g+V3((s*.08,.05,.12)),g+V3((s*.16,.2,.26))],[.04,.005],'bone',n=6) for s in(-1,1)]
    g=V3((-.46,-.95,1.72)); a.bone('t1'); a.tube([a.p('t1'),a.p('t1').lerp(g,.6)+V3((-.04,0,.05)),g],[.18,.15,.11],'fur',n=9,tint=(.75,.7,.62)); a.sculpt([('s',g,.15),('c',g+V3((0,-.06,0)),g+V3((0,-.32,-.1)),.1,.065)],'fur',.018,320,2,tint=(.75,.7,.62)); eyes(a,(g.x,g.y-.12,g.z+.05),.09,.025,tint=(1.6,.9,.2)); [a.tube([g+V3((s*.07,.02,.12)),g+V3((s*.18,.14,.34)),g+V3((s*.3,.3,.28))],[.045,.035,.005],'bone',n=7,tint=(.6,.5,.4)) for s in(-1,1)]
    wings(a,[(2.8,.5,1.9),(2.4,1.3,1.4),(1.6,1.4,1.1)],'leather',(.75,.18,.12),'scale',(.5,.12,.08),.065,root=.6); return a
@bst('Hydra',3)
def hydra(n):
    h=1.2; L=2.4; J=quad(h,L,.45,.6); J['tail3']=('tail2',(0,2.9,.6)); J['tail2']=('tail',(0,2.1,.8))
    for i in range(5): an=(i-2)*.42; J[f't{i}']=('chest',(math.sin(an)*.45,-.95,1.5)); J[f'tt{i}']=(f't{i}',(math.sin(an)*.95,-1.5-.25*math.cos(an),2.3+.2*(i%2)))
    del J['jaw']; a=Char(n,'quad',J); p=a.p; t=(.26,.36,.24); a.bone('hips','spine','chest'); a.sculpt([('s',p('hips'),.55,(1,1.2,1)),('c',p('hips'),p('chest'),.58,.66),('s',p('chest')+V3((0,-.1,.05)),.7,(1.05,1,1))],'scale',.06,1300,3,tint=t)
    for i in range(5):
        b,m=p(f't{i}'),p(f'tt{i}'); an=(i-2)*.42; e=V3((math.sin(an)*1.25,-2.1-.2*math.cos(an),2.55+.25*(i%2))); a.bone(f't{i}',f'tt{i}'); a.tube([b+V3((0,.2,-.2)),b,b.lerp(m,.5)+V3((0,.1,.1)),m],[.34,.28,.22,.19],'scale',n=11,tint=t,smooth=180); a.bone(f'tt{i}'); a.tube([m,m.lerp(e,.6)+V3((0,0,.1)),e],[.19,.16,.15],'scale',n=10,tint=t,smooth=180); a.sculpt([('s',e,.2,(.95,1.1,.85)),('c',e+V3((0,-.1,.02)),e+V3((math.sin(an)*.1,-.5,-.02)),.15,.09)],'scale',.026,420,2,tint=t); a.sculpt([('c',e+V3((0,-.05,-.14)),e+V3((math.sin(an)*.1,-.46,-.18)),.1,.06)],'scale',.026,130,1,tint=(.5,.5,.34)); eyes(a,(e.x,e.y-.18,e.z+.09),.11,.035,tint=(1.7,.9,.1)); [a.lathe([(.02,0),(0,-.09)],e.x+s*.08,e.y-.28-.08*k,e.z-.07,mat='bone',n=5,cap=False) for s in(-1,1) for k in range(3)]; [a.tube([e+V3((s*.1,.08,.13)),e+V3((s*.2,.26,.22))],[.045,.005],'bone',n=6) for s in(-1,1)]
    for S in 'LR':
        s=1 if S=='L' else -1
        for u,l,z in(('fl','fs',0),('bl','bs',1)): q,k=p(u+S),p(l+S); f=V3((k.x+s*.05,k.y-.05,.1)); a.bone('chest' if z==0 else 'hips',u+S,l+S); a.sculpt([('c',q+V3((0,0,.1)),k,.3,.18),('c',k,f,.17,.14),('c',f,f+V3((0,-.18,-.02)),.15,.13)],'scale',.04,320,2,tint=t); a.bone(l+S); claws(a,f+V3((0,-.28,.0)),3,.1,.16)
    a.bone('hips','tail','tail2','tail3'); a.sculpt([('c',p('hips')+V3((0,.3,0)),p('tail'),.46,.36),('c',p('tail'),p('tail2'),.36,.22),('c',p('tail2'),p('tail3'),.22,.1),('c',p('tail3'),V3((0,3.6,.5)),.1,.02)],'scale',.05,520,2,tint=t); a.bone('spine','chest','hips'); [a.extr([(-.14,0),(.14,0),(.1,.3)],.05,0,1.2-.25*i,h+.55,mat='bone',rz=90,tint=(.5,.55,.4)) for i in range(8)]; return a
@bst('Cockatrice')
def cockatrice(n):
    J=wingrig({'hips':(None,(0,.1,.5)),'spine':('hips',(0,.0,.55)),'chest':('spine',(0,-.08,.6)),'neck':('chest',(0,-.18,.72)),'head':('neck',(0,-.26,.95)),'jaw':('head',(0,-.28,.92)),'blL':('hips',(.09,.08,.42)),'bsL':('blL',(.1,.14,.22)),'blR':('hips',(-.09,.08,.42)),'bsR':('blR',(-.1,.14,.22)),'tail':('hips',(0,.25,.52)),'tail2':('tail',(0,.55,.4)),'tail3':('tail2',(0,.85,.3))},'chest',(.1,.04,.04),(.4,.1,.24)); a=Char(n,'quad',J); t=(.5,.4,.25); a.bone('hips','spine','chest','neck'); a.sculpt([('s',(0,.06,.53),.2,(.9,1.2,1)),('c',(0,-.1,.6),a.p('head'),.15,.075)],'hair',.018,620,2,tint=t,disp=nz(30,.02)); o=a.p('head'); a.bone('head'); a.sculpt([('s',o,.085,(.9,1.1,1))],'hair',.012,200,1,tint=t,disp=nz(40,.008)); a.tube([o+V3((0,-.06,0)),o+V3((0,-.15,-.01)),o+V3((0,-.18,-.06))],[.04,.03,.004],'bone',n=7,tint=(1,.8,.3)); eyes(a,(0,o.y-.05,o.z+.02),.06,.02,tint=(1.8,.3,.1)); [a.sculpt([('s',o+V3((0,-.04+.04*i,.1)),.034,(.4,1,1.2))],'skin',.01,70,1,tint=(.8,.08,.08)) for i in range(3)]; a.sculpt([('s',o+V3((0,-.08,-.09)),.03,(.5,.8,1.4))],'skin',.01,70,1,tint=(.8,.08,.08))
    for S in 'LR': q,k=a.p('bl'+S),a.p('bs'+S); f=V3((k.x,k.y-.06,.02)); a.bone('hips','bl'+S,'bs'+S); a.tube([q,k,f],[.07,.03,.024],'scale',n=7,tint=(.75,.6,.3)); a.bone('bs'+S); [a.tube([f,f+V3((x,y,.0))],[.02,.004],'scale',n=5,tint=(.7,.55,.3)) for x,y in((-.06,-.1),(0,-.13),(.06,-.1),(0,.08))]
    a.bone('hips','tail','tail2','tail3'); a.sculpt([('c',(0,.2,.52),a.p('tail2'),.1,.06),('c',a.p('tail2'),a.p('tail3'),.06,.03),('c',a.p('tail3'),(0,1.05,.34),.03,.006)],'scale',.014,320,2,tint=(.34,.42,.2)); wings(a,[(1.0,.2,.98),(.85,.45,.7),(.55,.45,.6)],'leather',(.6,.45,.2),'scale',(.4,.45,.2),.022,root=.2); return a
@bst('Wyvern',3)
def wyvern(n):
    h=1.5; L=2.0; J={'hips':(None,(0,.5,h)),'spine':('hips',(0,.1,h*1.02)),'chest':('spine',(0,-.5,h*1.1)),'neck':('chest',(0,-.95,1.95)),'head':('neck',(0,-1.55,2.45)),'jaw':('head',(0,-1.62,2.36)),'blL':('hips',(.3,.45,1.25)),'bsL':('blL',(.34,.65,.65)),'blR':('hips',(-.3,.45,1.25)),'bsR':('blR',(-.34,.65,.65)),'tail':('hips',(0,1.1,1.45)),'tail2':('tail',(0,2.0,1.2)),'tail3':('tail2',(0,2.9,1.5)),'wingL':('chest',(.3,-.45,1.95)),'wing2L':('wingL',(1.5,-.1,3.0)),'wingR':('chest',(-.3,-.45,1.95)),'wing2R':('wingR',(-1.5,-.1,3.0))}
    a=Char(n,'dragon',J); p=a.p; t=(.36,.32,.28); a.bone('hips','spine','chest','neck'); a.sculpt([('s',p('hips'),.42,(.95,1.2,1)),('c',p('hips'),p('chest'),.4,.5),('s',p('chest'),.52,(.95,1.05,1.05)),('c',p('chest')+V3((0,-.3,.1)),p('neck'),.36,.25),('c',p('neck'),p('head')+V3((0,.15,0)),.25,.17)],'scale',.045,1500,3,tint=t); a.sculpt([('c',p('hips')+V3((0,-.1,-.25)),p('chest')+V3((0,-.2,-.22)),.3,.38)],'hide',.05,280,2,tint=(.75,.66,.45)); o=p('head'); a.bone('head'); a.sculpt([('s',o,.25,(.85,1.1,.85)),('c',o+V3((0,-.1,0)),o+V3((0,-.7,-.08)),.18,.1),('s',o+V3((0,-.7,-.05)),.11)],'scale',.028,640,2,tint=t); [a.tube([o+V3((s*.13,.1,.14)),o+V3((s*.22,.4,.3)),o+V3((s*.24,.62,.28))],[.06,.045,.005],'bone',n=7,tint=(.5,.42,.32)) for s in(-1,1)]; eyes(a,(0,o.y-.2,o.z+.1),.16,.045,tint=(1.8,.9,.1)); [a.lathe([(.028,0),(0,-.1)],s*.1,o.y-.28-.1*i,o.z-.11,mat='bone',n=5,cap=False) for s in(-1,1) for i in range(5)]; a.bone('jaw'); a.sculpt([('c',o+V3((0,-.03,-.17)),o+V3((0,-.62,-.22)),.12,.07)],'scale',.026,180,2,tint=t)
    for S in 'LR': s=1 if S=='L' else -1; q,k=p('bl'+S),p('bs'+S); f=V3((k.x+s*.03,k.y-.2,.1)); a.bone('hips','bl'+S,'bs'+S); a.sculpt([('c',q+V3((0,0,.12)),k,.28,.15),('c',k,f,.14,.1),('c',f,f+V3((0,-.18,-.03)),.11,.1)],'scale',.035,360,2,tint=t); a.bone('bs'+S); claws(a,f+V3((0,-.22,0)),3,.09,.2,t=(.3,.26,.2))
    wings(a,[(3.9,.4,2.6),(3.4,1.5,1.7),(2.3,1.9,1.4),(1.2,1.6,1.4)],'leather',(.85,.45,.35),'scale',t,.085,root=.7); a.bone('hips','tail','tail2','tail3'); e=V3((0,3.5,2.1)); a.sculpt([('c',p('hips')+V3((0,.25,0)),p('tail'),.34,.25),('c',p('tail'),p('tail2'),.25,.16),('c',p('tail2'),p('tail3'),.16,.1),('c',p('tail3'),e,.1,.07)],'scale',.04,520,2,tint=t); a.bone('tail3'); a.sculpt([('s',e,.13)],'scale',.03,100,1,tint=t); a.tube([e,e+V3((0,.1,.2)),e+V3((0,-.02,.45))],[.07,.05,.004],'rock_dark',n=7); a.bone('spine','chest','hips','neck'); [a.extr([(-.12,0),(.1,0),(.16,.26)],.04,0,.9-.26*i,1.88+(.5 if i>6 else 0)*((i-6)/3),mat='bone',rz=90,tint=(.4,.34,.28)) for i in range(9)]; return a
# --------------------------------------------------------------- two legs, small and middling
def snout(a,o,K,t,L=.12,w=.045,mat='fur',ears=.1,tint2=None,er='up'):
    a.bone('head'); S=[('s',o+V3((0,.01*K,.03*K)),.098*K,(.88,1.05,1)),('c',o+V3((0,-.05*K,-.02*K)),o+V3((0,-(.08+L)*K,-.05*K)),(w+.02)*K,w*K),('c',a.p('head')+V3((0,.01,-.05*K)),o,.07*K,.075*K)]
    if ears: S+=[('c',o+V3((s*.06*K,.02*K,.08*K)),o+V3((s*(.085 if er=='up' else .14)*K,.03*K,(.09+ears)*K)),.03*K,.007*K) for s in(-1,1)]
    a.sculpt(S,mat,.0095*K,720,2,tint=t,disp=nz(40,.006) if mat in('fur','hair') else nz(50,.002)); a.sculpt([('c',o+V3((0,-.04*K,-.075*K)),o+V3((0,-(.06+L)*K,-.088*K)),.034*K,.022*K)],mat,.009*K,130,1,tint=tint2 or tuple(v*.8 for v in t)); a.ball(.018*K,o.x,o.y-(.1+L)*K,o.z-.03*K,mat='rock_dark',n=7,tint=(.4,.35,.3)); [a.lathe([(.006*K,0),(0,-.028*K)],o.x+s*.026*K,o.y-(.05+L*.7-.03*i)*K,o.z-.07*K,mat='bone',n=5,cap=False) for s in(-1,1) for i in(0,1,2)]
@foe('Kobold')
def kobold(n): a=H(n,.98,sh=.19,hip=.1); t=(.58,.28,.16); legs(a,'scale',t,.85,'bare',t); torso(a,'scale',t,.85); arms(a,'scale',t,'scale',t,.82); o=a.p('head')+V3((0,-.012*a.k,.11*a.k)); K=a.k*1.45; snout(a,o,K,t,.11,.04,'scale',0); a.bone('head'); [a.tube([o+V3((s*.06*K,.05*K,.06*K)),o+V3((s*.09*K,.12*K,.12*K)),o+V3((s*.1*K,.19*K,.15*K))],[.022*K,.015*K,.002*K],'bone',n=6) for s in(-1,1)]; eyes(a,(0,o.y-.075*K,o.z+.03*K),.05*K,.017*K,tint=(1.6,1.0,.1)); skirt(a,(.4,.3,.2),1.0,.74,.155,.2,'leather'); belt(a,t=(.35,.26,.18),buckle='bone',pouches=1); a.bone('hips'); k=a.k; a.tube([(0,.1*k,.98*k),(0,.32*k,.7*k),(.05,.55*k,.4*k),(.02,.75*k,.35*k)],[.06*k,.045*k,.028*k,.006*k],'scale',n=8,tint=t,smooth=180); w_dagger(a,'R'); return a
@foe('Bugbear')
def bugbear(n): a=H(n,2.05,sh=.25,hip=.115); t=(.5,.33,.18); f=nz(22,.012); legs(a,'fur',t,1.15,'bare',t); torso(a,'fur',t,1.2); arms(a,'fur',t,'skin',(.45,.3,.2),1.35); o=head(a,'fur',t,ears='long',nose=1.8,jaw=1.25,brow=1.35,eyes=(1.5,1,.2),sc=1.1,mouth='tusk',hair=(.2,.12,.07)); hair_cap(a,o,a.k*1.1,(.3,.18,.1),.06); a.bone('chest','spine'); a.sculpt([('s',(0,-.01*a.k,1.36*a.k),.225*a.k,(1.05,.76,.85)),('c',(0,0,1.3*a.k),(0,0,1.08*a.k),.2*a.k,.185*a.k)],'leather',.02,360,2,tint=(.42,.32,.24)); skirt(a,(.35,.26,.18),1.0,.66,.2,.25,'fur'); belt(a,r=.2,t=(.35,.25,.18),buckle='iron'); w_mace(a); shield(a,kind='round',t=(.3,.22,.14)); return a
@foe('Gnoll')
def gnoll(n): a=H(n,1.98,sh=.21); t=(.52,.4,.24); legs(a,'fur',t,.98,'bare',t); torso(a,'fur',t,1.0); arms(a,'fur',t,'skin',(.3,.22,.16),1.02); o=a.p('head')+V3((0,-.04*a.k,.1*a.k)); K=a.k*1.1; snout(a,o,K,t,.13,.045,'fur',.1); eyes(a,(0,o.y-.08*K,o.z+.035*K),.042*K,.014*K,tint=(1.7,1.2,.2)); a.bone('head','chest','spine'); [a.sculpt([('c',o+V3((0,.06*K,.1*K)),o+V3((0,.14*K,-.25*K)),.04*K,.06*K)],'fur',.018,200,1,tint=(.2,.13,.08),disp=nz(30,.03))]; a.bone('chest','spine'); a.box(.07,.04,.62,0,-.14,1.05*a.k,mat='leather',ry=36,bev=.01,tint=(.45,.3,.2)); skirt(a,(.4,.28,.18),1.0,.66,.175,.22,'leather'); belt(a,buckle='bone'); u=a.p('armR'); a.bone('armR','chest'); a.sculpt([('s',u+V3((-.01,0,.03)),.11,(1,1,.65))],'bone',.014,180,2); w_spear(a); return a
@foe('Lizardfolk')
def lizardfolk(n): a=H(n,1.9,sh=.22); t=(.3,.44,.26); legs(a,'scale',t,1.05,'bare',t); torso(a,'scale',t,1.05); arms(a,'scale',t,'scale',t,1.1); o=a.p('head')+V3((0,-.04*a.k,.11*a.k)); K=a.k*1.1; snout(a,o,K,t,.16,.055,'scale',0,(.6,.6,.4)); eyes(a,(0,o.y-.07*K,o.z+.055*K),.06*K,.016*K,tint=(1.6,1.1,.1)); a.bone('head','chest','spine'); [a.extr([(-.03,0),(.03,0),(.02,.11)],.014,0,o.y+(.02+.03*i)*K,o.z+(.13-.055*i)*K,mat='skin',rz=90,tint=(.75,.35,.15)) for i in range(6)]; a.bone('hips'); k=a.k; a.tube([(0,.12*k,.98*k),(0,.4*k,.7*k),(.08,.75*k,.35*k),(.0,1.05*k,.22*k)],[.1*k,.075*k,.045*k,.01*k],'scale',n=9,tint=t,smooth=180); skirt(a,(.45,.36,.24),1.0,.68,.175,.215,'leather'); belt(a,t=(.5,.4,.28),buckle='bone'); a.bone('chest'); [a.tube([(math.cos(x)*.15,math.sin(x)*.13-.02,1.47*k-.06*max(0,-math.sin(x))),(math.cos(x)*.16,math.sin(x)*.15-.03,1.40*k-.06*max(0,-math.sin(x)))],[.012,.003],'bone',n=5) for x in[tau*i/12 for i in range(12)]]; w_spear(a); shield(a,kind='round',t=(.25,.2,.12)); return a
@foe('Mummy')
def mummy(n):
    a=H(n,1.8); t=(.75,.68,.5); legs(a,'cloth',t,.98,'cloth',t); torso(a,'cloth',t,1); arms(a,'cloth',t,'cloth',(.6,.52,.38),1); o=a.p('head')+V3((0,-.012,.115)); a.bone('head'); a.sculpt([('s',o+V3((0,.01,.03)),.102,(.87,1.02,1.08)),('s',o+V3((0,-.03,-.05)),.072,(.95,.95,1.05)),('c',a.p('head')+V3((0,0,-.06)),o,.06,.06)],'cloth',.011,420,2,tint=t,disp=lambda p:.006*math.sin(p.z*150)); [a.ball(.016,o.x+s*.034,o.y-.085,o.z+.01,mat='lava',n=7,glow=.9,tint=(1,.6,.2)) for s in(-1,1)]; r=random.Random(4)
    def band(bn,c,rad_,tilt): a.bone(*bn); a.tube([c+V3((math.cos(q)*rad_,math.sin(q)*rad_*.85,math.sin(q+tilt)*.035)) for q in[tau*i/16 for i in range(16)]],.016,'cloth',closed=True,n=5,flat=.6,tint=tuple(v*r.uniform(.72,1.1) for v in t))
    for i in range(8): band(('chest','spine','hips'),V3((0,0,1.02+.06*i)),.165+.02*math.sin(i/7*math.pi),r.uniform(0,6))
    for i in range(5): band(('head',),o+V3((0,.01,-.09+.045*i)),.088+.014*math.sin(i/4*math.pi),r.uniform(0,6))
    for S in 'LR': [band(('arm'+S,),a.p('arm'+S).lerp(a.p('fore'+S),.2+.25*i),.068,r.uniform(0,6)) for i in range(3)]; [band(('fore'+S,),a.p('fore'+S).lerp(a.p('hand'+S),.15+.28*i),.055,r.uniform(0,6)) for i in range(3)]; [band(('leg'+S,),a.p('leg'+S).lerp(a.p('shin'+S),.25+.25*i),.092,r.uniform(0,6)) for i in range(3)]
    a.bone('foreL'); h=a.p('handL'); a.tube([h,h+V3((.03,.02,-.25)),h+V3((.0,.05,-.45))],[.025,.02,.004],'cloth',n=5,flat=.3,tint=t); a.bone('chest'); a.lathe([(.15,0),(.17,.02),(.12,.09)],0,-.005,1.44,mat='gold',n=20,cap=False); a.meta['pose']='zombie'; return a
@foe('Vampire')
def vampire(n): a=H(n,1.84); legs(a,'cloth',(.06,.05,.06)); torso(a,'cloth',(.35,.04,.06),1); arms(a,'cloth',(.07,.05,.07),'skin',SK['pale'],1); o=head(a,tint=(.98,.92,.88),hair=(.05,.04,.05),jaw=.95,nose=.95,eyes=(1.8,.3,.2),ears='point'); a.bone('head'); [a.lathe([(.005,0),(0,-.024)],o.x+s*.012,o.y-.098,o.z-.062,mat='bone',n=5,cap=False) for s in(-1,1)]; hair_cap(a,o,a.k,(.05,.04,.05),.06); a.bone('chest'); a.lathe([(.1,0),(.14,.06),(.2,.2),(.19,.2),(.13,.06),(.09,0)],0,.02,1.49*a.k,mat='cloth',n=18,cap=False,arc=240,rz=-30,tint=(.06,.03,.05)); a.tube([(-.05,-.12,1.5*a.k),(0,-.14,1.42*a.k),(.05,-.12,1.5*a.k)],.014,'cloth',n=5,tint=(1.2,1.15,1.1)); a.ball(.02,0,-.15,1.4*a.k,mat='crystal',n=8,tint=(1.6,.1,.15),glow=.5); skirt(a,(.06,.05,.06),1.02,.5,.165,.24,split=True); belt(a,buckle='gold',pouches=0); cape(a,(.07,.04,.06),1.34,.48,inner=(.55,.04,.06)); return a
@foe('Werewolf')
def werewolf(n): a=H(n,2.0,sh=.24,hip=.11); t=(.26,.21,.18); legs(a,'fur',t,1.05,'bare',t); torso(a,'fur',t,1.18); arms(a,'fur',t,'skin',(.2,.15,.13),1.25); o=a.p('head')+V3((0,-.05*a.k,.09*a.k)); K=a.k*1.15; snout(a,o,K,t,.14,.045,'fur',.11); eyes(a,(0,o.y-.08*K,o.z+.035*K),.042*K,.014*K,tint=(1.8,1.1,.1),glow=.8); a.bone('chest','head'); a.sculpt([('s',(0,.03,1.46*a.k),.2*a.k,(1.35,.9,.7)),('c',(0,.09,1.5*a.k),o+V3((0,.05,.02)),.1,.09)],'fur',.025,520,1,tint=tuple(v*.8 for v in t),disp=nz(24,.035)); [ (a.bone('hand'+S),claws(a,at_hand(a,S)+V3((0,-.03,-.07)),4,.028,.09,t=(.2,.18,.16))) for S in 'LR']; skirt(a,(.2,.17,.2),1.0,.72,.175,.2); a.bone('hips'); a.tube([(0,.12,1.05),(0,.35,.95),(0,.55,.7)],[.05,.09,.02],'fur',n=7,tint=t); return a
@foe('Medusa')
def medusa(n):
    J=humanoid(1.76,sh=.185); 
    for i in range(8): an=i*tau/8; J[f't{i}']=('head',(math.cos(an)*.06,math.sin(an)*.06+.02,1.76))
    a=Char(n,'humanoid',J); t=(.5,.6,.42); robe(a,(.2,.34,.3),(.7,.55,.2),z1=.05,r1=.3); arms(a,'scale',t,'scale',t,.9); o=head(a,'skin',t,jaw=.9,brow=.75,nose=.85,eyes=(1.9,1.6,.2)); a.bone('head'); eyes(a,(0,o.y-.083,o.z+.008),.034,.009,tint=(1.8,1.4,.1),glow=1); a.sculpt([('s',o+V3((0,.02,.05)),.1,(.9,1,.9))],'scale',.012,200,2,tint=(.2,.32,.14))
    for i in range(8):
        an=i*tau/8; b=V3((math.cos(an)*.06,math.sin(an)*.06+.02+o.y,o.z+.1)); e=b+V3((math.cos(an)*.16,math.sin(an)*.14,.1+.05*(i%2))); a.bone(f't{i}'); a.tube([b,b.lerp(e,.5)+V3((0,0,.07)),e,e+V3((math.cos(an)*.06,-.04,-.02))],[.022,.02,.018,.022],'scale',n=7,tint=(.24,.4,.16),smooth=180); a.ball(.026,*(e+V3((math.cos(an)*.07,-.045,-.02))),mat='scale',n=7,tint=(.24,.4,.16),sz=.7)
    belt(a,buckle='gold',pouches=0); w_dagger(a,'R'); a.bone('chest'); a.tube([(math.cos(x)*.12,math.sin(x)*.1,1.5+.02*math.sin(x)) for x in[tau*i/16 for i in range(16)]],.014,'gold',closed=True,n=5); return a
@foe('Harpy')
def harpy(n):
    J=wingrig(humanoid(1.55,sh=.185),'chest',(.1,.1,.02),(.6,.22,.55)); a=Char(n,'humanoid',J); t=(.78,.6,.48); f=(.4,.3,.22); legs(a,'scale',(.7,.55,.3),.8,'bare',(.65,.5,.28)); torso(a,'skin',t,.9,fem=1); arms(a,'skin',t,'skin',t,.8); o=head(a,tint=t,jaw=.9,brow=.9,nose=1.2,eyes=(1.6,1.0,.1)); hair_cap(a,o,a.k,(.2,.15,.13),.2); a.bone('chest'); a.sculpt([('s',(s*.07*a.k,-.095*a.k,1.33*a.k),.075*a.k) for s in(-1,1)]+[('c',(-.13*a.k,0,1.34*a.k),(.13*a.k,0,1.34*a.k),.08*a.k,.08*a.k)],'hair',.013,320,1,tint=f,disp=nz(40,.012)); a.bone('hips','legL','legR'); [a.sculpt([('c',a.p('leg'+S),a.p('shin'+S),.11,.07)],'hair',.018,220,1,tint=f,disp=nz(32,.02)) for S in 'LR']; a.sculpt([('s',(0,.0,.85),.15,(1.1,.9,1))],'hair',.018,220,1,tint=f,disp=nz(32,.02)); [ (a.bone('foot'+S),claws(a,a.p('foot'+S)+V3((0,-.12,-.05)),3,.05,.13,t=(.25,.2,.15))) for S in 'LR']; wings(a,[(1.75,.4,1.75),(1.5,.75,1.15),(.95,.75,.85)],'hair',f,'hair',f,.045,True,root=.4); return a
# --------------------------------------------------------------- giants
def giant(n,h,t,mat='skin',hair=(.3,.2,.12),beard=True,arm=None,ht='horned',cl=(.4,.3,.22)):
    a=H(n,h,sh=.25,hip=.12); K=a.k; legs(a,'leather',(.4,.32,.25),1.2,'fur',(.45,.36,.28)); torso(a,mat,t,1.28,.4); arms(a,mat,t,mat,t,1.38); o=head(a,mat,t,hair=hair,jaw=1.2,brow=1.25,nose=1.25,sc=.98); (beard_(a,o,K,hair,.26) if beard else None); hair_cap(a,o,K,hair,.1); skirt(a,cl,1.0,.6,.215,.28,'fur'); belt(a,1.02,.215,t=(.35,.25,.18),buckle='iron'); return a,o,K
@foe('Hill Giant',3)
def hill_giant(n): a,o,K=giant(n,4.6,(.72,.54,.4),hair=(.25,.17,.1)); a.bone('chest'); a.sculpt([('c',(-.2*K,.04,1.47*K),(.2*K,.04,1.47*K),.085*K,.085*K)],'fur',.04,320,1,tint=(.4,.3,.22),disp=nz(6,.08)); w_club(a,sc=3.4); return a
@foe('Frost Giant',3)
def frost_giant(n):
    a,o,K=giant(n,5.2,(.55,.72,.85),hair=(.8,.82,.86),cl=(.75,.75,.78)); helm(a,o,K,'horned',trim='bronze'); a.bone('chest'); a.sculpt([('c',(-.2*K,.04,1.47*K),(.2*K,.04,1.47*K),.09*K,.09*K),('s',(0,.15*K,1.38*K),.17*K,(1.2,.5,1))],'fur',.045,420,1,tint=(1.1,1.1,1.1),disp=nz(6,.09)); a.bone('chest','spine'); a.sculpt([('s',(0,-.01*K,1.34*K),.215*K,(1.05,.76,.6))],'mail',.05,260,2,tint=(.9,.9,.95))
    c=at_hand(a); a.bone('handR')
    with a.at(c.x,c.y,c.z,rx=72,sc=2.9):
        a.lathe([(.02,-.25),(.018,.95)],mat='wood',n=8); [ [a.stack.append(a.stack[-1]@Matrix.Translation((0,0,.75))@Euler((0,0,rad(90))).to_matrix().to_4x4()),a.extr([(s*.02,-.05),(s*.16,-.16),(s*.24,-.04),(s*.24,.08),(s*.16,.17),(s*.02,.06)],.03,mat='steel',bev=.008,tint=(.8,.95,1.15)),a.stack.pop()] for s in(-1,1)]
    return a
@foe('Fire Giant',3)
def fire_giant(n):
    a,o,K=giant(n,5.0,(.2,.14,.13),hair=(1.0,.35,.08),cl=(.2,.14,.12)); plate(a,'iron',(.5,.42,.4),'bronze',1.15); helm(a,o,K,'open','iron',(.5,.42,.4),'bronze'); a.bone('head'); eyes(a,(0,o.y-.083*K,o.z+.008*K),.034*K,.011*K,mat='lava',tint=(1,.6,.2),glow=1); w=a.p('handR'); c=at_hand(a); a.bone('handR')
    with a.at(c.x,c.y,c.z,rx=72,sc=3.0): a.lathe([(.016,-.06),(.017,.06)],mat='leather',n=8); a.box(.24,.04,.03,0,0,.07,mat='bronze',bev=.008); a.box(.09,.018,.95,0,0,.09,mat='lava',bev=.006,taper=(.8,.8),glow=.5); a.box(.07,.016,.12,0,0,1.04,mat='lava',bev=0,taper=(.02,.5),glow=.5)
    a.lamp(0,-.6,3,(1,.4,.1),.7,8); return a
@foe('Ettin',3)
def ettin(n):
    J=humanoid(4.2,sh=.27,hip=.12); k=4.2/1.78; J['head']=('chest',(.13*k,0,1.53*k)); J['t0']=('chest',(-.13*k,0,1.53*k)); a=Char(n,'humanoid',J); t=(.6,.5,.38); legs(a,'leather',(.38,.3,.24),1.25,'fur',(.4,.32,.25)); torso(a,'skin',t,1.42,.6); arms(a,'skin',t,'skin',t,1.4); o=head(a,tint=t,jaw=1.3,brow=1.35,nose=1.4,sc=.9,mouth='tusk',hair=(.15,.1,.07)); sv=a.J['head']; a.J['head']=a.J['t0']; a.J['head']=(sv[0],a.J['t0'][1]); bone0=a.bone
    def swap(*names): return bone0(*['t0' if q=='head' else q for q in names])
    a.bone=swap; head(a,tint=tuple(v*.95 for v in t),jaw=1.25,brow=1.4,nose=1.2,sc=.9,hair=(.4,.2,.1),ears='long',beard=(.4,.2,.1)); a.bone=bone0; a.J['head']=sv; skirt(a,(.36,.28,.2),1.0,.6,.23,.3,'fur'); belt(a,1.02,.23,t=(.35,.25,.18),buckle='bone'); w_club(a,sc=3.0); sv2=a.p('handL'); w_club(a,'L',2.6); return a
# --------------------------------------------------------------- odd things
@foe('Animated Armour')
def animated_armor(n): a=H(n,1.84); t=(.72,.74,.8); o=a.p('head')+V3((0,-.012,.115)); plate(a,'steel',t,'bronze',1.1); helm(a,o,a.k,'great','steel',t,'bronze'); a.bone('chest'); a.sculpt([('s',(0,0,1.3),.12,(1,.7,1.2))],'rock_dark',.02,120,1,tint=(.15,.15,.18)); [ (a.bone('arm'+S),a.tube([a.p('arm'+S),a.p('fore'+S)],[.07,.055],'steel',n=12,tint=t),a.bone('hand'+S),a.ball(.055,*at_hand(a,S),mat='steel',n=9,tint=t)) for S in 'LR']; a.bone('head'); a.box(.16,.02,.012,o.x,o.y-.13,o.z+.013,mat='crystal',bev=0,glow=1,tint=(.5,.9,1.8)); a.bone('hips'); a.sculpt([('s',(0,0,.98),.14,(1.1,.85,.7))],'steel',.02,160,2,tint=t); w_sword(a,L=.9,hilt='bronze'); return a
@foe('Flying Sword')
def flying_sword(n):
    a=Char(n,'float',{'hips':(None,(0,0,1.1)),'spine':('hips',(0,0,1.1)),'chest':('spine',(0,0,1.1)),'head':('chest',(0,0,1.3))}); a.bone('chest')
    with a.at(0,.1,1.25,rx=58): a.lathe([(.018,-.26),(.019,-.08)],mat='leather',n=8); a.ball(.034,0,0,-.29,mat='gold',n=9); a.box(.28,.045,.036,0,0,-.08,mat='gold',bev=.01); a.box(.075,.018,1.0,0,0,-.05,mat='steel',bev=.008,taper=(.8,.8),tint=(1.1,1.15,1.3)); a.box(.06,.016,.12,0,0,.95,mat='steel',bev=0,taper=(.02,.5),tint=(1.1,1.15,1.3)); a.box(.014,.022,.7,0,0,.02,mat='crystal',bev=0,glow=.9,tint=(.4,.9,1.8))
    return a
def element(n,label): pass
@foe('Fire Elemental',2)
def fire_elemental(n):
    J=humanoid(2.4,sh=.24,hip=.1); a=Char(n,'float',J); K=a.k; t=(1.4,.7,.25); a.bone('hips','spine','chest','head','armL','armR','foreL','foreR','handL','handR'); S=[('s',(0,0,1.36*K),.2*K,(1.1,.8,1)),('c',(0,0,1.3*K),(0,0,.75*K),.18*K,.2*K),('c',(0,0,.8*K),(0,0,.25*K),.22*K,.09*K),('s',(0,-.02*K,1.62*K),.12*K,(.9,1,1.15)),('c',(0,0,1.7*K),(.03*K,.03*K,1.95*K),.08*K,.01*K),('c',(.05*K,0,1.68*K),(.1*K,.05*K,1.85*K),.05*K,.008*K),('c',(-.05*K,0,1.68*K),(-.09*K,.05*K,1.88*K),.05*K,.008*K)]
    for s,q in((1,'L'),(-1,'R')): S+=[('c',a.p('arm'+q),a.p('fore'+q),.1*K,.085*K),('c',a.p('fore'+q),a.p('hand'+q),.085*K,.07*K),('c',a.p('hand'+q),a.p('hand'+q)+V3((0,-.05*K,-.22*K)),.075*K,.012*K),('c',a.p('arm'+q),a.p('arm'+q)+V3((s*.06*K,.05*K,.2*K)),.08*K,.01*K)]
    a.sculpt(S,'lava',.035,1700,2,tint=t,glow=.75,disp=lambda p:noise.noise(p*4)*.06+noise.noise(p*11)*.025); a.bone('head'); eyes(a,(0,-.14*K,1.63*K),.045*K,.022*K,mat='crystal',tint=(2,1.9,1.4),glow=1); a.lamp(0,0,1.6,(1,.45,.12),1.1,9); return a
@foe('Water Elemental',2)
def water_elemental(n):
    J=humanoid(2.4,sh=.25,hip=.1); a=Char(n,'float',J); K=a.k; t=(.25,.55,.8); a.bone('hips','spine','chest','head','armL','armR','foreL','foreR','handL','handR'); S=[('s',(0,0,1.34*K),.23*K,(1.1,.85,1)),('c',(0,0,1.3*K),(0,0,.7*K),.2*K,.26*K),('c',(0,0,.7*K),(0,0,.12*K),.27*K,.4*K),('s',(0,-.02*K,1.6*K),.13*K),('c',(0,.05*K,1.66*K),(0,.18*K,1.75*K),.1*K,.02*K)]
    for s,q in((1,'L'),(-1,'R')): S+=[('c',a.p('arm'+q),a.p('fore'+q),.12*K,.1*K),('c',a.p('fore'+q),a.p('hand'+q),.1*K,.12*K),('s',a.p('hand'+q)+V3((0,-.02,-.06*K)),.11*K)]
    a.sculpt(S,'crystal',.035,1700,3,tint=t,glow=.12,disp=lambda p:.03*math.sin(p.z*9+p.x*6)+noise.noise(p*4)*.035); a.bone('head'); eyes(a,(0,-.145*K,1.62*K),.05*K,.02*K,tint=(1.2,1.8,2),glow=1); return a
@foe('Air Elemental',2)
def air_elemental(n):
    J=humanoid(2.5,sh=.26,hip=.1); 
    for i in range(8): J[f't{i}']=('hips',(0,0,.2+i*.18))
    a=Char(n,'float',J); K=a.k; t=(.85,.92,1.0)
    for i in range(7):
        z=(.15+i*.2)*K; r=(.12+i*.055)*K; a.bone(f't{i}','hips'); a.tube([(math.cos(q*1.0)*r*(1+.25*q/6.28),math.sin(q)*r*(1+.25*q/6.28),z+.05*q*K*.2) for q in[i*1.3+tau*1.25*j/22 for j in range(23)]],[.012+.06*math.sin(math.pi*j/22)*K for j in range(23)],'hair',n=6,flat=.5,tint=t,smooth=180)
    a.bone('chest','head'); a.sculpt([('s',(0,0,1.4*K),.19*K,(1.2,.8,.9)),('s',(0,-.03*K,1.63*K),.1*K),('c',(0,.03*K,1.66*K),(0,.2*K,1.8*K),.08*K,.01*K)],'hair',.03,520,3,tint=(.9,.95,1.05),disp=nz(5,.05)); [ (a.bone('arm'+S,'fore'+S,'hand'+S),a.tube([a.p('arm'+S),a.p('fore'+S),a.p('hand'+S),a.p('hand'+S)+V3((0,-.1*K,-.16*K))],[.1*K,.075*K,.09*K,.01*K],'hair',n=9,tint=t,smooth=180)) for S in 'LR']; a.bone('head'); eyes(a,(0,-.115*K,1.64*K),.04*K,.018*K,tint=(.8,1.5,2),glow=1); return a
@bst('Roper',2)
def roper(n):
    J={'hips':(None,(0,0,0)),'mid':('hips',(0,0,1.0)),'head':('mid',(0,0,2.0))}; 
    for i in range(6): an=i*tau/6+.4; J[f't{i}']=('mid',(math.cos(an)*.45,math.sin(an)*.45,1.2+.15*(i%2)))
    a=Char(n,'blob',J); t=(.9,.85,.75); a.bone('hips','mid','head'); a.sculpt([('c',(0,0,.1),(0,0,1.2),.75,.55),('c',(0,0,1.2),(.05,.05,2.6),.52,.06),('c',(.3,.2,.2),(.35,.25,.8),.4,.2),('c',(-.35,.1,.1),(-.4,.1,.6),.4,.16)],'rock',.06,1100,2,tint=t,disp=lambda p:noise.noise(p*3)*.09+noise.noise(p*9)*.03); a.ball(.17,0,-.5,1.45,mat='bone',n=16,tint=(1.3,1.1,.5)); a.ball(.08,0,-.64,1.45,mat='rock_dark',n=10); a.bone('mid'); a.sculpt([('s',(0,-.62,.85),.3,(1.2,.35,.5))],'skin',.03,200,2,tint=(.35,.08,.08)); teeth(a,V3((0,0,0)),.26,-.74,.98,7,.14,r=.035); teeth(a,V3((0,0,0)),.24,-.74,.72,6,.12,True,r=.03)
    for i in range(6): an=i*tau/6+.4; b=a.p(f't{i}'); d=V3((math.cos(an),math.sin(an),0)); a.bone(f't{i}'); a.tube([b,b+d*.5+V3((0,0,.35)),b+d*1.0+V3((0,0,.1)),b+d*1.35+V3((0,0,-.45)),b+d*1.4+V3((0,-.15,-.85))],[.13,.1,.075,.06,.07],'hide',n=8,tint=(.5,.46,.4),smooth=180)
    return a
@bst('Otyugh',2)
def otyugh(n):
    J={'hips':(None,(0,0,.3)),'mid':('hips',(0,0,.8)),'head':('mid',(0,-.2,1.3)),'t0':('mid',(.5,-.2,1.1)),'t1':('mid',(-.5,-.2,1.1)),'t2':('mid',(0,.1,1.5))}; a=Char(n,'blob',J); t=(.42,.36,.24); a.bone('hips','mid'); a.sculpt([('s',(0,0,.85),.72,(1.1,1,.8)),('s',(0,-.3,.75),.5)]+[('c',(math.cos(x)*.5,math.sin(x)*.5,.6),(math.cos(x)*.62,math.sin(x)*.62,.08),.22,.17) for x in(.5,2.6,-1.57)],'hide',.05,1300,3,tint=t,disp=lambda p:noise.noise(p*5)*.05+noise.noise(p*13)*.02); a.bone('mid'); a.sculpt([('s',(0,-.72,.78),.34,(1.15,.4,.55))],'skin',.03,220,2,tint=(.4,.1,.1)); teeth(a,V3((0,0,0)),.3,-.86,.93,8,.14,r=.035); teeth(a,V3((0,0,0)),.28,-.86,.62,7,.13,True,r=.035)
    for i,(s,L) in enumerate(((1,1),(-1,1))): b=a.p(f't{i}'); a.bone(f't{i}'); a.tube([b,b+V3((s*.5,-.2,.35)),b+V3((s*.85,-.6,.1)),b+V3((s*.8,-1.0,-.2))],[.13,.1,.085,.07],'hide',n=9,tint=t,smooth=180); e=b+V3((s*.8,-1.0,-.2)); a.sculpt([('s',e+V3((0,-.1,0)),.15,(.7,1.4,.5))],'hide',.03,120,1,tint=t); [a.lathe([(.025,0),(0,.12)],e.x+s*.07,e.y-.2+.08*k,e.z,mat='bone',n=5,cap=False,ry=s*90) for k in range(4)]
    b=a.p('t2'); a.bone('t2'); a.tube([b+V3((0,0,-.2)),b+V3((0,-.1,.4)),b+V3((0,-.25,.75))],[.1,.07,.06],'hide',n=8,tint=t,smooth=180); a.sculpt([('s',b+V3((0,-.28,.8)),.14,(1.5,.9,.8))],'hide',.03,140,1,tint=t); eyes(a,(0,b.y-.4,b.z+.82),.1,.05,mat='bone',tint=(1.4,1.2,.6),glow=.1); [a.ball(.022,s*.1,b.y-.445,b.z+.82,mat='rock_dark',n=7) for s in(-1,1)]; return a
@bst('Shrieker')
def shrieker(n):
    J=blobrig(1.5); a=Char(n,'blob',J); a.bone('hips','mid'); a.tube([(0,0,0),(.03,.02,.4),(0,0,.9)],[.26,.19,.24],'bone',n=12,tint=(1.2,1.1,1.0),smooth=180); a.bone('mid','head'); a.sculpt([('s',(0,0,1.12),.5,(1,1,.62)),('c',(0,0,.9),(0,0,1.05),.44,.5)],'hide',.04,620,2,tint=(.55,.22,.5),disp=nz(7,.03)); [a.ball(.07,math.cos(x)*.34,math.sin(x)*.34,1.36-.08*(i%2),mat='bone',n=8,sz=.4,tint=(1.3,1.2,.9)) for i,x in enumerate([tau*k/9 for k in range(9)])]; a.sculpt([('s',(0,-.24,.55),.09,(.9,.5,1.5))],'rock_dark',.02,100,1,tint=(.2,.12,.2)); [ (a.bone('hips'),a.tube([(x,y,0),(x*1.05,y*1.05,h)],[.06,.05],'bone',n=7,tint=(1.2,1.1,1)),a.sculpt([('s',(x*1.05,y*1.05,h+.04),.14,(1,1,.6))],'hide',.025,110,1,tint=(.5,.25,.5))) for x,y,h in((.42,-.1,.3),(-.36,-.25,.42),(.1,.42,.36))]; return a

# --------------------------------------------------------------- townsfolk, on the heroes' bodies
from heroes import legs2,torso2,arms2,face,belt2,skirt2,robe2,cape2,cuirass,bracer,short_m,long_m,tied_m,bald_m,long_f,bun_f,bob_f,strap,g_helm,stubble
def folk_(label,side='npc'): return char('folk',side,label=label)
PALE={'skin':(1.0,.78,.62)}
def skinned(a,tint,hair):
    """bake slot colours into a fixed townsperson"""
    base=a.add
    def add(bm,mat,tint_=None,**k):
        t=k.pop('tint',None); sl=k.get('slot'); q=a._s if sl is None else sl; k['slot']=0; col={1:tint,2:hair,5:(.5,.55,.5)}.get(q); b=t or (1,1,1); s0=a._s; a._s=0; r=base(bm,mat,tint=tuple(x*y for x,y in zip(b,col)) if col else b,**k); a._s=s0; return r
    a.add=add; return a
def person(n,fem,skin,hair,hairfn,h=1.78,**fk):
    a=H(n); a._own=1; skinned(a,tuple(v*.62 for v in skin),hair); a.meta['scale']=h/1.78; o,K=face(a,fem=fem,**fk); (a.sl(2),a.bone('head'),hairfn(a,o,a.k),a.sl(0)) if hairfn else None; return a
@folk_('Villager')
def villager(n): a=person(n,False,SK['tan'],(.28,.17,.1),short_m); legs2(a,'cloth',(.26,.2,.14),False); torso2(a,'cloth',(.5,.42,.3),False); arms2(a,'cloth',(.58,.5,.38),False); a.bone('chest','spine'); a.sculpt([('s',(0,-.002,1.36),.206,(1.07,.75,.84)),('c',(0,0,1.3),(0,0,1.08),.184,.168)],'leather',.014,460,2,tint=(.62,.46,.32)); skirt2(a,1,1.0,.78,.165,.205,0,'leather'); belt2(a,pouches=1); return a
@folk_('Townswoman')
def townswoman(n): a=person(n,True,SK['fair'],(.34,.19,.1),bun_f); base=a.add; a.add=lambda bm,mat,tint=None,**k: base(bm,mat,tint=tuple(x*y for x,y in zip(tint or (1,1,1),(.4,.34,.46))) if mat=='cloth' else tint,**k); robe2(a,True,0,None,.04,.31); a.add=base; arms2(a,'cloth',(.86,.8,.68),True,.98); a.bone('hips','legL','legR'); a.box(.32,.02,.66,0,-.222,.36,mat='cloth',tint=(.92,.88,.78),bev=.005,rx=6,sub=3,wob=.012); a.bone('chest','spine'); a.sculpt([('s',(0,0,1.33),.185,(1.02,.76,.5)),('s',(.07,-.095,1.33),.077),('s',(-.07,-.095,1.33),.077),('c',(0,0,1.26),(0,0,1.06),.166,.152)],'cloth',.012,460,2,tint=(.3,.13,.1)); belt2(a,fem=True,pouches=1); [setattr(p,'x',p) if False else None for p in []]; return a
@folk_('Merchant')
def merchant(n): a=person(n,False,SK['fair'],(.16,.1,.07),tied_m); legs2(a,'cloth',(.14,.1,.16),False); torso2(a,'cloth',(.36,.12,.26),False,1.08); arms2(a,'cloth',(.55,.42,.14),False,1.04,sleeve=.015); skirt2(a,.4,1.0,.52,.178,.24,0); a.bone('chest','spine'); a.sculpt([('s',(0,0,1.36),.205,(1.06,.72,.8)),('c',(0,-.01,1.3),(0,-.02,1.06),.182,.175)],'cloth',.015,360,2,tint=(.36,.12,.26)); a.bone('head'); o=a.p('head')+V3((0,-.012,.115)); a.lathe([(.118,0),(.15,.035),(.145,.09),(.06,.125),(0,.125)],o.x,o.y+.012,o.z+.06,mat='cloth',n=18,cap=False,tint=(.36,.12,.26)); belt2(a,r=.19,buckle='gold',pouches=4); cape2(a,0,.95,.34); return a
@folk_('Guard')
def guard(n): a=person(n,False,SK['fair'],(.22,.15,.1),short_m); legs2(a,'mail',(.72,.72,.72),False); torso2(a,'mail',(.75,.75,.75),False); arms2(a,'mail',(.75,.75,.75),False,hmat='leather',htint=(.5,.38,.3),hslot=0); g_helm(a,a.p('head')+V3((0,-.012,.115)),1.0); a.bone('chest','spine'); a.sculpt([('s',(0,-.01,1.36),.202,(1.06,.74,.84)),('c',(0,0,1.3),(0,0,1.07),.178,.165)],'cloth',.015,420,2,tint=(.13,.2,.38)); a.box(.05,.02,.2,0,-.165,1.2,mat='gold',bev=.004); a.box(.14,.02,.05,0,-.165,1.3,mat='gold',bev=.004); a.bone('hips','legL','legR'); skirt(a,(.13,.2,.38),1.0,.64,.172,.225); belt2(a,r=.178,buckle='iron',pouches=1); bracer(a,'steel',(.7,.7,.74)); w_spear(a); shield(a,t=(.14,.2,.36)); return a
@folk_('Innkeeper')
def innkeeper(n): a=person(n,False,SK['fair'],(.4,.27,.14),bald_m); legs2(a,'cloth',(.24,.18,.13),False,1.08); torso2(a,'cloth',(.86,.8,.68),False,1.12); a.bone('spine','hips'); a.sculpt([('s',(0,-.05,1.13),.175,(1.05,.95,.9))],'cloth',.015,240,2,tint=(.86,.8,.68)); arms2(a,'cloth',(.86,.8,.68),False,1.12); a.bone('hips','spine','legL','legR'); a.box(.34,.02,.66,0,-.232,.56,mat='cloth',tint=(.62,.52,.38),bev=.005,rx=3,sub=3,wob=.015); skirt(a,(.3,.22,.16),1.0,.72,.19,.23); belt2(a,r=.198,pouches=1); return a
@folk_('King')
def king(n):
    a=person(n,False,SK['fair'],(.55,.5,.45),long_m); K=a.k; torso2(a,'cloth',(.42,.06,.08),False,1.04); arms2(a,'cloth',(.42,.06,.08),False,1.02,sleeve=.035); base=a.add; a.add=lambda bm,mat,tint=None,**k: base(bm,mat,tint=tuple(x*y for x,y in zip(tint or (1,1,1),(.42,.06,.08))) if mat=='cloth' else tint,**k); robe2(a,False,0,None); cape2(a,0,1.32,.48); a.add=base; a.bone('chest'); a.sculpt([('c',(-.2,.04,1.475),(.2,.04,1.475),.08,.08),('c',(-.18,-.05,1.46),(0,-.14,1.36),.05,.04),('c',(.18,-.05,1.46),(0,-.14,1.36),.05,.04)],'hair',.015,420,2,tint=(1.3,1.25,1.15),disp=nz(40,.012)); o=a.p('head')+V3((0,-.012,.115)); a.bone('head'); a.lathe([(.108,0),(.114,.01),(.114,.05),(.106,.052)],o.x,o.y+.012,o.z+.06,mat='gold',n=24,cap=False); [a.lathe([(.016,0),(.018,.03),(0,.065)],o.x+math.cos(t)*.11,o.y+.012+math.sin(t)*.11,o.z+.108,mat='gold',n=6,cap=False) for t in[i*tau/8 for i in range(8)]]; belt2(a,buckle='gold',pouches=0); w_staff(a,gem=(1.6,.3,.3)); return a
