"""Creatures: sculpted, skinned to a plain axis-aligned skeleton. Animation is procedural in the engine."""
from kit import *
import props
REG={}
def char(kind,side,**meta):
    def d(fn): REG[fn.__name__]=(fn,kind,side,meta); return fn
    return d
# ---- skeletons: name -> (parent, joint)
def humanoid(h=1.78,sh=.21,hip=.10,arm=1.0,leg=1.0,neck=1.0):
    k=h/1.78; L=leg; z=lambda v:v*k
    J={'hips':(None,(0,0,z(.98))),'spine':('hips',(0,.01,z(1.10))),'chest':('spine',(0,.01,z(1.28))),'head':('chest',(0,0,z(1.53))),
       'armL':('chest',(sh*k,.01,z(1.44))),'foreL':('armL',(sh*k+.085*k,.025*k,z(1.16))),'handL':('foreL',(sh*k+.13*k,-.03*k,z(.92))),
       'armR':('chest',(-sh*k,.01,z(1.44))),'foreR':('armR',(-sh*k-.085*k,.025*k,z(1.16))),'handR':('foreR',(-sh*k-.13*k,-.03*k,z(.92))),
       'legL':('hips',(hip*k,0,z(.94))),'shinL':('legL',(hip*k*1.15,-.01,z(.51))),'footL':('shinL',(hip*k*1.25,.02,z(.09))),
       'legR':('hips',(-hip*k,0,z(.94))),'shinR':('legR',(-hip*k*1.15,-.01,z(.51))),'footR':('shinR',(-hip*k*1.25,.02,z(.09))),
       'cape':('chest',(0,.13*k,z(1.46))),'cape2':('cape',(0,.18*k,z(.95)))}
    return J
def seg_end(J,n):
    kids=[j for j,(p,_) in J.items() if p==n and not j.startswith('cape')]
    if n=='head': return Vector(J[n][1])+Vector((0,0,.22))
    if n.startswith('hand'): return Vector(J[n][1])+Vector((0,-.01,-.10))
    if n.startswith('foot'): return Vector(J[n][1])+Vector((0,-.16,-.05))
    if n=='cape2': return Vector(J[n][1])+Vector((0,.05,-.8))
    if n=='cape': return Vector(J['cape2'][1])
    if n=='chest': return Vector(J['head'][1])
    if n=='hips': return Vector(J['spine'][1]) if 'spine' in J else Vector(J[n][1])+Vector((0,0,.1))
    return Vector(J[kids[0]][1]) if kids else Vector(J[n][1])+Vector((0,0,-.1))
class Char(Asset):
    def __init__(s,name,rig,J,**m):
        super().__init__(name,'char',**m); s.rig=rig; s.J=J; s.names=list(J); s.groups=[]; s._g=None; s._s=0; s._m={}; s.gslot=[]; s.k=J['hips'][1][2]/.98 if 'spine' in J else 1
    def bone(s,*names):
        s.groups.append([s.names.index(n) for n in names]); s._g=len(s.groups)-1; return s
    def sl(s,n): s._s=n; return s
    def add(s,bm,mat,tint=None,uv=None,m=None,glow=0,wind=0,slot=None,**k):
        if mat=='skin' and not s._s and not slot and not getattr(s,'_own',0): tint=tuple(v*.78 for v in (tint or (1,1,1)))
        if mat=='hide' and not s._s and not slot: tint=tuple(v*.5 for v in (tint or (1,1,1)))
        key=(tuple(s.groups[s._g]),(s._s if not getattr(s,'_only',None) or mat in s._only else 0) if slot is None else slot); i=s._m.get(key)
        if i is None: i=s._m[key]=len(s.gslot); s.gslot.append(key)
        return super().add(bm,mat,tint=tint,uv=uv,m=m,glow=glow,wind=(i+.4)/255,**k)
    def p(s,n): return Vector(s.J[n][1])
    def finish(s):
        L=s.bake(ground=False,aorays=36,lods=(0,1)); out=[]
        ends=[seg_end(s.J,n) for n in s.names]; heads=[Vector(s.J[n][1]) for n in s.names]
        for m in L:
            P=m['P']; g=m['X'][:,2].astype(int); bi=np.zeros((len(P),4),np.uint8); bw=np.zeros((len(P),4),np.uint8); B=np.stack([P[:,0],-P[:,2],P[:,1]],1)
            for q in np.unique(g):
                ids=list(s.gslot[q][0]); sel=np.where(g==q)[0]
                if len(ids)==1: bi[sel,0]=ids[0]; bw[sel,0]=255; continue
                D=[]
                for i in ids:
                    a=np.array(heads[i]); b=np.array(ends[i]); ab=b-a; t=np.clip(((B[sel]-a)@ab)/max(ab@ab,1e-9),0,1); D.append(np.linalg.norm(B[sel]-(a+t[:,None]*ab),axis=1))
                D=np.stack(D,1)+.004; W=1/D**5; W/=W.sum(1,keepdims=True); o=np.argsort(-W,1)[:,:4]; w=np.take_along_axis(W,o,1); w[w<.04]=0; w/=w.sum(1,keepdims=True)
                for k in range(o.shape[1]): bi[sel,k]=np.array(ids)[o[:,k]]; bw[sel,k]=np.round(w[:,k]*255)
                bw[sel,0]=np.clip(bw[sel,0].astype(int)+255-bw[sel].astype(int).sum(1),0,255)
            m['X'][:,2]=np.array([k[1] for k in s.gslot],np.uint8)[g]; m['bi']=bi; m['bw']=bw; out.append(m)
        J=[[s.names.index(p) if p else -1,[j[0],j[2],-j[1]]] for p,j in s.J.values()]
        return dict(rig=s.rig,bones=s.names,joints=J,lods=out,meta=s.meta,fx=s.fx,light=s.light)
SK=dict(fair=(1.0,.80,.66),tan=(.86,.62,.45),dark=(.46,.30,.22),pale=(.95,.86,.78),green=(.50,.62,.30),orc=(.42,.52,.36),grey=(.55,.56,.54),blue=(.45,.6,.8),red=(.72,.16,.12),dead=(.52,.58,.44))
# ---- humanoid parts -------------------------------------------------------
def legs(a,mat='cloth',tint=(.25,.2,.15),bulk=1,boots='leather',bt=(.55,.42,.32),tris=520):
    for s,S in((1,'L'),(-1,'R')):
        h,k,f=a.p('leg'+S),a.p('shin'+S),a.p('foot'+S); K=a.k
        a.bone('hips','leg'+S,'shin'+S); a.sculpt([('c',h+Vector((0,0,.0)),k,.092*K*bulk,.066*K*bulk),('c',k,(f.x,f.y,.28*K),.064*K*bulk,.058*K*bulk),('s',(h.x*.6,h.y,h.z+.02*K),.105*K*bulk,(1,.95,.9))],mat,.016*K,tris//2,3,tint=tint)
        a.bone('shin'+S,'foot'+S); T=[('c',(k.x*.5+f.x*.5,(k.y+f.y)/2,.34*K),(f.x,f.y,.1*K),.074*K*bulk,.06*K*bulk),('c',(f.x,f.y+.02,.055*K),(f.x*1.06,f.y-.16*K,.045*K),.062*K*bulk,.05*K*bulk),('b',(f.x,f.y-.06*K,.02*K),(.1*K,.26*K,.03*K))]
        if boots=='bare': a.sculpt([('c',(k.x*.5+f.x*.5,(k.y+f.y)/2,.34*K),(f.x,f.y,.1*K),.06*K*bulk,.045*K*bulk),('c',(f.x,f.y+.02,.05*K),(f.x*1.06,f.y-.15*K,.035*K),.05*K*bulk,.04*K*bulk)],mat,.013*K,200,3,tint=bt)
        else:
            a.sculpt(T,boots,.014*K,280,2,tint=bt); a.lathe([(.078*K*bulk,0),(.088*K*bulk,.02*K),(.086*K*bulk,.05*K),(.076*K*bulk,.06*K)],(k.x+f.x)/2,(k.y+f.y)/2,.33*K,mat=boots,n=10,cap=False,tint=tuple(v*.8 for v in bt))
def torso(a,mat='cloth',tint=(.4,.3,.2),bulk=1,belly=0,tris=620,hipflare=0,fem=0):
    K=a.k; b=bulk; a.bone('hips','spine','chest')
    S=[('s',(0,.0,1.36*K),.19*K*b,(1.06,.68,.85)),('c',(0,.0,1.3*K),(0,.0,1.08*K),.165*K*b,.145*K*(1+belly*.3)*(.9 if fem else 1)),('s',(0,0,.99*K),.155*K*b,(1.05,.82,.8)),('s',(0,.005,1.46*K),.12*K*b,(1.5,.75,.55)),('c',(0,.0,1.45*K),(0,-.005,1.55*K),.07*K,.056*K)]
    if belly: S.append(('s',(0,-.09*K,1.1*K),.17*K*belly,(1,.85,.95)))
    if fem: S+=[('s',(s*.07*K,-.1*K,1.33*K),.068*K) for s in(-1,1)]
    if hipflare: S.append(('c',(0,0,1.0*K),(0,0,.80*K),.15*K,.19*K*hipflare))
    a.sculpt(S,mat,.018*K,tris,4,tint=tint,disp=(lambda p:noise.noise(p*9)*.006) if mat=='cloth' else None)
def arms(a,mat='cloth',tint=(.4,.3,.2),hand='skin',ht=SK['fair'],bulk=1,sleeve=0,tris=420,fore=None,ft=None):
    for s,S in((1,'L'),(-1,'R')):
        u,f,h=a.p('arm'+S),a.p('fore'+S),a.p('hand'+S); K=a.k
        a.bone('chest','arm'+S,'fore'+S); a.sculpt([('s',u,.078*K*bulk),('c',u,f,.066*K*bulk,.05*K*bulk),('c',f,h.lerp(f,.3) if not sleeve else h,.052*K*bulk,(.042+sleeve)*K*bulk)],mat,.014*K,tris//2,3,tint=tint)
        a.bone('fore'+S,'hand'+S); a.sculpt([('c',f.lerp(h,.15),h,.046*K*bulk,.036*K*bulk)],fore or mat,.012*K,110,2,tint=ft or tint)
        a.bone('hand'+S); d=(h-f).normalized(); c=h+d*.05*K; T=[('s',c,.043*K*bulk,(.75,1,1.15)),('c',h,c,.034*K*bulk,.038*K*bulk)]
        for i in range(4): y=(i-1.5)*.02*K; T.append(('c',c+Vector((s*.006,y,-.03*K)),c+Vector((-s*.02*K,y*1.05,-.075*K)),.0125*K*bulk,.011*K*bulk))
        T.append(('c',c+Vector((0,-.035*K,0)),c+Vector((-s*.025*K,-.05*K,-.035*K)),.014*K*bulk,.012*K*bulk)); a.sculpt(T,hand,.0085*K,240,2,tint=ht)
def head(a,skin='skin',tint=SK['fair'],hair=None,beard=None,brow=1,jaw=1,nose=1,ears='round',eyes=(1,1,1),sc=1,tris=1100,old=0,mouth=None):
    K=a.k*sc; H=a.p('head'); o=H+Vector((0,-.012*K,.115*K)); a.bone('head')
    S=[('s',o+Vector((0,.012*K,.03*K)),.098*K,(.86,1.02,1.06)),('s',o+Vector((0,-.035*K,-.035*K)),.072*K,(.9*jaw,.92,1.05)),('s',o+Vector((0,-.06*K,-.085*K)),.036*K,(1.15*jaw,.8,.8)),('c',H+Vector((0,.005,-.05*K)),o+Vector((0,.01,-.02*K)),.054*K,.055*K),
       ('c',o+Vector((0,-.088*K,.015*K)),o+Vector((0,-.108*K,-.03*K)),.011*K*nose,.017*K*nose),('c',o+Vector((-.045*K,-.076*K,.035*K*brow)),o+Vector((.045*K,-.076*K,.035*K*brow)),.017*K*brow,.017*K*brow),('s',o+Vector((.043*K,-.065*K,-.03*K)),.024*K),('s',o+Vector((-.043*K,-.065*K,-.03*K)),.024*K),('c',o+Vector((-.02*K,-.085*K,-.06*K)),o+Vector((.02*K,-.085*K,-.06*K)),.012*K,.012*K)]
    for s in(-1,1):
        if ears=='round': S.append(('s',o+Vector((s*.086*K,.01*K,0)),.026*K,(.4,.8,1.2)))
        if ears=='point': S.append(('c',o+Vector((s*.08*K,.0,0)),o+Vector((s*.115*K,.035*K,.06*K)),.018*K,.006*K))
        if ears=='long': S.append(('c',o+Vector((s*.08*K,.0,0)),o+Vector((s*.2*K,.05*K,.055*K)),.026*K,.005*K))
    def eye(co):  # press sockets in
        r=0
        for s in(-1,1): d=(co-(o+Vector((s*.034*K,-.09*K,.008*K)))).length; r-=.014*K*max(0,1-d/(.026*K))**1.0
        return r
    a.sculpt(S,skin,.0075*K,tris,3,tint=tint,disp=eye)
    for s in(-1,1): a.ball(.0145*K,*(o+Vector((s*.034*K,-.071*K,.008*K))),mat='bone',n=8,tint=tuple(v*1.5 for v in eyes)); a.ball(.0068*K,*(o+Vector((s*.034*K,-.0825*K,.008*K))),mat='rock_dark',n=6,tint=(.6,.5,.4)); a.box(.03*K,.012*K,.007*K,*(o+Vector((s*.036*K,-.086*K,.032*K))),mat='fur',tint=hair or (.25,.18,.12),bev=.002,ry=s*8)
    a.box(.036*K,.008*K,.006*K,*(o+Vector((0,-.095*K,-.062*K))),mat='skin',tint=(tint[0]*.55,tint[1]*.35,tint[2]*.35),bev=.002)
    if mouth=='tusk':
        for s in(-1,1): a.tube([o+Vector((s*.026*K,-.088*K,-.07*K)),o+Vector((s*.032*K,-.108*K,-.05*K)),o+Vector((s*.034*K,-.11*K,-.02*K))],[.008*K,.007*K,.002*K],'bone',n=5)
    if hair: hair_cap(a,o,K,hair)
    if beard: beard_(a,o,K,beard)
    return o
def hair_cap(a,o,K,t,long=0):
    a.bone('head'); S=[('s',o+Vector((0,.022*K,.048*K)),.103*K,(.9,1.0,.98)),('s',o+Vector((0,.05*K,-.01*K)),.085*K,(.95,.8,1.2)),('c',o+Vector((-.04*K,-.055*K,.085*K)),o+Vector((.045*K,-.06*K,.08*K)),.024*K,.026*K)]
    for s in(-1,1): S.append(('c',o+Vector((s*.082*K,-.01*K,.04*K)),o+Vector((s*.082*K,.01*K,-.03*K-long)),.022*K,.02*K))
    if long: S.append(('c',o+Vector((0,.06*K,0)),o+Vector((0,.075*K,-.12*K-long)),.075*K,.05*K))
    a.sculpt(S,'fur',.011*K,340,2,tint=t,disp=lambda p:noise.noise(Vector((p.x*60,p.y*60,p.z*12)))*.007*K)
def beard_(a,o,K,t,L=.16):
    a.bone('head'); a.sculpt([('s',o+Vector((0,-.07*K,-.075*K)),.052*K,(1.15,.75,1)),('c',o+Vector((0,-.085*K,-.09*K)),o+Vector((0,-.085*K,-.09*K-L*K)),.05*K,.015*K),('c',o+Vector((-.05*K,-.05*K,-.04*K)),o+Vector((0,-.085*K,-.1*K)),.022*K,.03*K),('c',o+Vector((.05*K,-.05*K,-.04*K)),o+Vector((0,-.085*K,-.1*K)),.022*K,.03*K),('c',o+Vector((-.03*K,-.1*K,-.052*K)),o+Vector((.03*K,-.1*K,-.052*K)),.012*K,.012*K)],'fur',.0095*K,300,2,tint=t,disp=lambda p:noise.noise(Vector((p.x*55,p.y*55,p.z*14)))*.008*K)
def hood(a,o,K,t,mat='cloth',shadow=True):
    a.bone('head'); prof=[]
    bm=bmesh.new(); n=14; rows=9; g={}
    for j in range(rows):
        f=j/(rows-1)
        for i in range(n+1):
            an=math.radians(-128+256*i/n); w=.118+.03*math.sin(f*math.pi); top=math.sin(f*math.pi/2)
            r=(.128*K)*(1-f**3*.97)*(1+.12*math.cos(an)*0); y=-math.cos(an)*r*(-1); x=math.sin(an)*r
            z=-.14*K+f*.30*K; yy=-y*-1
            g[j,i]=bm.verts.new(o+Vector((x*.98,(math.cos(an)*r*1.02)-(.02*K if f<.8 else 0)-(.035*K*math.sin(f*math.pi)*max(0,-math.cos(an))),z+.02*K*max(0,-math.cos(an))*0)))
    for j in range(rows-1):
        for i in range(n): bm.faces.new((g[j,i],g[j,i+1],g[j+1,i+1],g[j+1,i]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces); bm.normal_update()
    c=sum((v.co for v in bm.verts),Vector())/len(bm.verts)
    f0=bm.faces[0:1]; 
    if sum(1 for f in bm.faces if f.normal.dot(f.calc_center_median()-c)>0)<len(bm.faces)/2: bmesh.ops.reverse_faces(bm,faces=bm.faces)
    for v in bm.verts: v.co+=noise.noise_vector(v.co*7)*.008*K
    q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); [setattr(v,'co',v.co+(c-v.co)*.07) for v in q.verts]
    a.add(bm,mat,tint=t,smooth=180); a.add(q,mat,tint=tuple(v*.35 for v in t),smooth=180,ao=.5)
    a.bone('chest','head'); a.sculpt([('c',o+Vector((0,.03*K,-.13*K)),o+Vector((0,.035*K,-.19*K)),.1*K,.15*K),('s',o+Vector((0,.02*K,-.235*K)),.16*K,(1.35,.9,.45))],mat,.014*K,420,3,tint=t)
def cape(a,t,L=1.1,w=.36,mat='cloth',inner=None,trim=None):
    K=a.k; a.bone('chest','cape','cape2'); bm=bmesh.new(); nx,nz=8,9; g={}; z0=1.47*K; 
    for j in range(nz+1):
        f=j/nz
        for i in range(nx+1):
            u=i/nx*2-1; ww=(.19+(w-.19)*f)*K; g[i,j]=bm.verts.new((u*ww,(.15+.10*f+.055*(1-u*u)*(.4+f)-.03*math.cos(u*9+f*2)*f-.09*u*u*(1-f))*K,z0-f*L*K+.02*u*u))
    for i in range(nx):
        for j in range(nz): bm.faces.new((g[i,j],g[i+1,j],g[i+1,j+1],g[i,j+1]))
    bm.normal_update()
    if sum(f.normal.y for f in bm.faces)<0: bmesh.ops.reverse_faces(bm,faces=bm.faces)
    q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); [setattr(v.co,'y',v.co.y-.008) for v in q.verts]; a.add(bm,mat,tint=t,smooth=180); a.add(q,mat,tint=inner or tuple(v*.5 for v in t),smooth=180)
    a.bone('chest'); a.sculpt([('c',(-.17*K,.06*K,1.475*K),(.17*K,.06*K,1.475*K),.06*K,.06*K),('c',(-.14*K,-.03*K,1.475*K),(-.05*K,-.115*K,1.44*K),.032*K,.025*K),('c',(.14*K,-.03*K,1.475*K),(.05*K,-.115*K,1.44*K),.032*K,.025*K)],mat,.016*K,260,2,tint=t); a.ball(.028*K,0,-.13*K,1.425*K,mat='gold',n=8,sz=.5)
def belt(a,z=1.03,r=.165,t=(.5,.36,.26),buckle='gold',pouches=2):
    K=a.k; a.bone('hips','spine'); a.lathe([(r*K,z*K-.03*K),((r+.012)*K,z*K-.026*K),((r+.012)*K,z*K+.026*K),(r*K,z*K+.03*K)],0,0,0,mat='leather',n=16,cap=False,tint=t); a.box(.06*K,.02*K,.055*K,0,-(r+.008)*K,z*K-.027*K,mat=buckle,bev=.005)
    for i in range(pouches): s=1 if i%2 else -1; a.box(.07*K,.05*K,.085*K,s*(.1+.03*i)*K,-(r-.045)*K,z*K-.1*K,mat='leather',bev=.015,tint=tuple(v*.85 for v in t))
def skirt(a,t,z0=1.0,z1=.62,r0=.165,r1=.23,mat='cloth',n=18,split=False,bones=('hips','legL','legR')):
    K=a.k; a.bone(*bones); pr=[(r0*K,z0*K),((r0*.6+r1*.4)*K,(z0*.6+z1*.4)*K),(r1*K,z1*K),((r1-.012)*K,z1*K),((r0-.01)*K,z0*K-.03*K)]
    bm=a.lathe(pr[::-1],0,0,0,mat=mat,n=n,cap=False,tint=t)
    for v in bm.verts:
        if v.co.z<z0*K-.05: an=math.atan2(v.co.y,v.co.x); v.co.x*=1+.05*math.sin(an*7); v.co.y*=1+.05*math.sin(an*7)
def robe(a,t,trim=None,sl=.06,mat='cloth',z1=.04,r1=.30):
    K=a.k; a.bone('hips','spine','chest'); torso(a,mat,t,1.04); a.bone('hips','legL','legR','shinL','shinR'); n=20; bm=bmesh.new(); L=bm.loops.layers.uv.verify(); rows=8; g=[]
    for j in range(rows+1):
        f=j/rows; z=(1.04-(1.04-z1)*f)*K; r=(.158+(r1-.158)*f**.9)*K; g.append([bm.verts.new((math.cos(q)*r*(1+.055*f*math.sin(q*8+1)),math.sin(q)*r*(.92+.055*f*math.sin(q*8+1)),z)) for q in[tau*i/n for i in range(n)]])
    for j in range(rows):
        for i in range(n):
            f=bm.faces.new((g[j+1][i],g[j+1][(i+1)%n],g[j][(i+1)%n],g[j][i]))
            for l,(u,v) in zip(f.loops,((i,j+1),(i+1,j+1),(i+1,j),(i,j))): l[L].uv=(u*.1*K,-v*.13*K)
    q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,mat,tint=t,uv='keep',smooth=180); a.add(q,mat,tint=tuple(v*.4 for v in t),uv='keep',smooth=180)
    if trim: a.lathe([(r1*K*1.03,z1*K),(r1*K*1.045,z1*K+.01),(r1*K*1.03,z1*K+.05*K)],0,0,0,mat='cloth',n=n,cap=False,tint=trim); a.bone('chest','spine'); a.box(.05*K,.015,.4*K,0,-.135*K,1.06*K,mat='cloth',tint=trim,bev=.004)
def plate(a,mat='steel',tint=(1,1,1),trim='gold',big=1):
    K=a.k; a.bone('chest','spine'); a.sculpt([('s',(0,-.012*K,1.37*K),.20*K,(1.06,.76,.86)),('c',(0,-.01*K,1.32*K),(0,-.005*K,1.14*K),.175*K,.15*K),('c',(0,-.1*K,1.4*K),(0,-.085*K,1.16*K),.09*K,.06*K)],mat,.016*K,600,3,tint=tint)
    if trim: a.tube([(math.cos(t)*.135*K,math.sin(t)*.11*K-.005,1.5*K) for t in[tau*i/16 for i in range(16)]],.014*K,trim,closed=True,n=5)
    a.bone('hips','spine')
    for i in range(3): z=(1.09-i*.045)*K; a.lathe([((.172+i*.012)*K,z-.05*K),((.182+i*.012)*K,z-.045*K),((.165+i*.01)*K,z+.01*K)],0,0,0,mat=mat,n=18,cap=False,tint=tint)
    for s,S in((1,'L'),(-1,'R')):
        a.bone('legL' if s>0 else 'legR'); a.box(.13*K,.03*K,.2*K,s*.1*K,-.135*K,.78*K,mat=mat,bev=.012,rx=-8,tint=tint)
        u=a.p('arm'+S); a.bone('arm'+S,'chest')
        for i in range(3): a.sculpt([('s',u+Vector((s*(.012+i*.016)*K,0,(.03-i*.045)*K)),(.098-i*.008)*K*big,(1,.95,.62))],mat,.013*K,170,2,tint=tint)
        if trim: a.tube([u+Vector((s*(.01)*K+math.cos(t)*.088*K*big,math.sin(t)*.085*K*big,.03*K)) for t in[tau*i/14 for i in range(14)]],.009*K,trim,closed=True,n=4)
        f,h=a.p('fore'+S),a.p('hand'+S); a.bone('fore'+S); a.tube([f,f.lerp(h,.5),h],[.062*K,.06*K,.05*K],mat,n=10,tint=tint); a.ball(.062*K,*f,mat=mat,n=10,tint=tint); a.tube([h-Vector((0,0,0)),h+(h-f).normalized()*.02],[.06*K,.064*K],mat,n=10,tint=tint)
        k,ft=a.p('shin'+S),a.p('foot'+S); a.bone('shin'+S); a.tube([k-Vector((0,.0,.02*K)),k.lerp(ft,.5)+Vector((0,-.008,0)),ft+Vector((0,0,.06*K))],[.078*K,.08*K,.066*K],mat,n=10,tint=tint); a.ball(.074*K,k.x,k.y-.02*K,k.z,mat=mat,n=10,tint=tint); a.bone('foot'+S); a.sculpt([('c',(ft.x,ft.y+.01,.06*K),(ft.x*1.06,ft.y-.16*K,.05*K),.066*K,.055*K)],mat,.015*K,120,2,tint=tint)
        a.bone('leg'+S); l=a.p('leg'+S); a.tube([l.lerp(k,.25),l.lerp(k,.6),l.lerp(k,.93)],[.1*K,.092*K,.074*K],mat,n=10,tint=tint)
def helm(a,o,K,kind='great',mat='steel',tint=(1,1,1),trim='gold'):
    a.bone('head')
    if kind=='great':
        a.sculpt([('s',o+Vector((0,.005*K,.03*K)),.128*K,(.88,1,1.02)),('c',o+Vector((0,0,-.02*K)),o+Vector((0,0,-.1*K)),.116*K,.105*K)],mat,.012*K,520,2,tint=tint); a.box(.185*K,.03*K,.016*K,o.x,o.y-.112*K,o.z+.012*K,mat='rock_dark',bev=0,tint=(.15,.15,.15)); a.box(.02*K,.02*K,.19*K,o.x,o.y-.122*K,o.z-.09*K,mat=trim,bev=.004); a.box(.2*K,.016*K,.016*K,o.x,o.y-.118*K,o.z+.034*K,mat=trim,bev=.004)
        for s in(-1,1):
            for i in range(3): a.box(.012*K,.012*K,.03*K,o.x+s*(.035+.02*i)*K,o.y-.112*K+.006*i*K,o.z-.07*K,mat='rock_dark',bev=0,tint=(.1,.1,.1))
    if kind=='open':
        a.sculpt([('s',o+Vector((0,.012*K,.05*K)),.122*K,(.9,1,.95)),('c',o+Vector((0,.05*K,.02*K)),o+Vector((0,.06*K,-.08*K)),.09*K,.085*K),('c',o+Vector((.085*K,.0,.02*K)),o+Vector((.08*K,-.03*K,-.08*K)),.03*K,.028*K),('c',o+Vector((-.085*K,.0,.02*K)),o+Vector((-.08*K,-.03*K,-.08*K)),.03*K,.028*K)],mat,.0115*K,420,2,tint=tint); a.box(.024*K,.02*K,.09*K,o.x,o.y-.122*K,o.z-.03*K,mat=mat,bev=.005,tint=tint); a.tube([o+Vector((math.cos(t)*.112*K,math.sin(t)*.124*K+.01*K,.045*K)) for t in[tau*i/18 for i in range(18)]],.012*K,trim,closed=True,n=5)
    if kind=='horned':
        helm(a,o,K,'open',mat,tint,trim)
        for s in(-1,1): a.tube([o+Vector((s*.1*K,0,.08*K)),o+Vector((s*.19*K,-.01*K,.1*K)),o+Vector((s*.24*K,-.03*K,.19*K)),o+Vector((s*.23*K,-.06*K,.27*K))],[.034*K,.03*K,.02*K,.004*K],'bone',n=8)
def at_hand(a,S='R'): h=a.p('hand'+S); f=a.p('fore'+S); return h+(h-f).normalized()*.055*a.k
# weapons are modelled pointing forward (-Y) out of the fist
def w_sword(a,S='R',L=.82,mat='steel',hilt='gold',w=.055):
    a.bone('hand'+S); c=at_hand(a,S); K=a.k
    with a.at(c.x,c.y,c.z,rx=90-18): 
        a.lathe([(.016,-.06),(.017,.06)],mat='leather',n=8); a.ball(.028,0,0,-.085,mat=hilt,n=8); a.box(.22,.035,.028,0,0,.07,mat=hilt,bev=.008); a.box(w,.014,L*.92,0,0,.09,mat=mat,bev=.006,taper=(.82,.8)); a.box(w*.75,.012,.1,0,0,.09+L*.92,mat=mat,bev=0,taper=(.02,.5))
def w_axe(a,S='R',L=.9,double=True,mat='steel'):
    a.bone('hand'+S); c=at_hand(a,S)
    with a.at(c.x,c.y,c.z,rx=72):
        a.lathe([(.02,-.22),(.018,L*.78)],mat='wood',n=8); a.lathe([(.026,L*.74),(.03,L*.78),(.0,L*.86)],mat='iron',n=8)
        for s in((-1,1) if double else (1,)):
            with a.at(0,0,L*.62,rz=90): a.extr([(s*.02,-.05),(s*.16,-.16),(s*.24,-.04),(s*.24,.08),(s*.16,.17),(s*.02,.06)],.03,mat=mat,bev=.008)
        a.tube([(0,0,-.1),(0,0,.12)],.024,'leather',n=8)
def w_mace(a,S='R',hammer=False):
    a.bone('hand'+S); c=at_hand(a,S)
    with a.at(c.x,c.y,c.z,rx=72):
        a.lathe([(.018,-.15),(.018,.42)],mat='wood',n=8)
        if hammer: a.box(.12,.28,.13,0,0,.38,mat='steel',bev=.02); a.box(.13,.05,.14,0,0,.375,mat='gold',bev=.01)
        else:
            a.ball(.065,0,0,.46,mat='steel',n=10)
            for i in range(6):
                with a.at(0,0,.46,rz=i*60): a.extr([(.04,-.07),(.1,-.03),(.1,.03),(.04,.07)],.016,mat='steel')
def w_staff(a,S='R',gem=(.4,.7,1.8),head='crystal'):
    a.bone('hand'+S); c=at_hand(a,S)
    with a.at(c.x,c.y,c.z,rx=4):
        a.tube([(0,0,-c.z+.02),(.01,0,-.3),(-.008,0,.3),(.0,0,.82)],[.02,.019,.021,.024],'wood',n=8)
        if head=='crystal':
            for i in range(4): t=i*tau/4; a.tube([(0,0,.8),(math.cos(t)*.06,math.sin(t)*.06,.9),(math.cos(t)*.05,math.sin(t)*.05,1.0)],[.014,.01,.004],'wood',n=5)
            a.lathe([(0,.86),(.04,.92),(0,1.02)],mat='crystal',n=6,cap=False,smooth=10,tint=gem,glow=.9)
        if head=='antler': [a.tube([(0,0,.8),(s*.1,0,.95),(s*.2,0,1.02),(s*.22,0,1.16)],[.018,.015,.012,.004],'bone',n=6) for s in(-1,1)]; [a.tube([(s*.12,0,.97),(s*.1,.0,1.1)],[.01,.003],'bone',n=5) for s in(-1,1)]; a.ball(.04,0,0,.9,mat='crystal',n=8,tint=gem,glow=.8)
        if head=='skull': props.skull(a,0,0,.82,.9)
def w_bow(a,S='L'):
    a.bone('hand'+S); c=at_hand(a,S)
    with a.at(c.x,c.y,c.z,rx=0): a.tube([(0,.10,-.72),(0,-.02,-.55),(0,-.08,-.25),(0,-.03,0),(0,-.08,.25),(0,-.02,.55),(0,.10,.72)],[.008,.014,.018,.022,.018,.014,.008],'wood',n=7); a.tube([(0,.10,-.72),(0,.10,.72)],.003,'cloth',n=3); a.tube([(0,-.03,-.07),(0,-.03,.07)],.026,'leather',n=8)
def w_dagger(a,S='R'): w_sword(a,S,.32,'steel','iron',.04)
def w_spear(a,S='R'):
    a.bone('hand'+S); c=at_hand(a,S)
    with a.at(c.x,c.y,c.z,rx=6): a.tube([(0,0,-c.z+.05),(0,0,1.0)],.017,'wood',n=7); a.extr([(-.035,1.0),(0,.96),(.035,1.0),(.045,1.06),(0,1.3),(-.045,1.06)],.02,mat='steel',bev=.004)
def w_club(a,S='R',sc=1):
    a.bone('hand'+S); c=at_hand(a,S)
    with a.at(c.x,c.y,c.z,rx=70,sc=sc): a.lathe([(.022,-.1),(.025,.1),(.06,.45),(.08,.62),(.07,.7),(0,.73)],mat='bark',n=9,cap=False,wob=.02); [a.lathe([(.014,0),(0,.06)],math.cos(t)*.07,math.sin(t)*.07,.55+.05*(i%2),mat='iron',n=5,rx=math.degrees(-math.sin(t))*1.2,ry=math.degrees(math.cos(t))*1.2) for i,t in enumerate([k*tau/6 for k in range(6)])]
def shield(a,S='L',kind='heater',t=(.5,.08,.07),emblem='gold'):
    a.bone('fore'+S); f,h=a.p('fore'+S),a.p('hand'+S); c=f.lerp(h,.6); s=1 if S=='L' else -1
    with a.at(c.x+s*.075,c.y-.02,c.z+.05,rz=s*66):
        if kind=='heater':
            P=[(-.23,.3),(.23,.3),(.235,.05),(.18,-.17),(0,-.38),(-.18,-.17),(-.235,.05)]; a.extr(P,.035,0,0,0,mat='wood',bev=.01,tint=tuple(v*1.9 for v in t)); a.extr([(x*1.07,z*1.05) for x,z in P],.022,0,.006,0,mat='steel',bev=.006); 
            with a.at(0,-.03,.02): a.extr([(-.025,-.22),(.025,-.22),(.025,.06),(.13,.06),(.13,.11),(.025,.11),(.025,.22),(-.025,.22),(-.025,.11),(-.13,.11),(-.13,.06),(-.025,.06)],.015,mat=emblem,bev=.004)
        else:
            with a.at(0,0,0,rx=90): a.lathe([(.32,0),(.31,.025),(.12,.05),(0,.055)],mat='planks',n=18,cap=False,tint=tuple(v*2.2 for v in t)); a.lathe([(.325,-.01),(.34,.01),(.32,.035),(.30,.03)],mat='iron',n=18,cap=False); a.lathe([(.09,.045),(.07,.09),(0,.11)],mat='iron',n=10,cap=False)
def quiver(a):
    K=a.k; a.bone('chest')
    with a.at(-.08*K,.17*K,1.1*K,ry=-22,rx=6): 
        a.lathe([(.05,0),(.06,.42),(.05,.42),(.04,.3)],mat='leather',n=10,cap=False); a.lathe([(.062,.36),(.066,.38),(.062,.42)],mat='bronze',n=10,cap=False)
        for i in range(7): t=i*.9; a.tube([(math.cos(t)*.025,math.sin(t)*.025,.2),(math.cos(t)*.03,math.sin(t)*.03,.56)],.004,'wood',n=4); a.box(.03,.003,.07,math.cos(t)*.03,math.sin(t)*.03,.5,mat='cloth',tint=(.8,.75,.65),bev=0,rz=i*50)
def hat_pointed(a,o,K,t):
    a.bone('head'); a.lathe([(.2*K,.0),(.205*K,.012*K),(.12*K,.03*K),(.11*K,.06*K),(.085*K,.18*K),(.05*K,.32*K),(.02*K,.42*K),(0,.46*K)],o.x,o.y+.01*K,o.z+.065*K,mat='cloth',n=18,cap=False,tint=t,wob=.012); a.lathe([(0,.0),(.2*K,-.004)],o.x,o.y+.01*K,o.z+.066*K,mat='cloth',n=18,cap=False,tint=tuple(v*.6 for v in t)); a.lathe([(.122*K,.03*K),(.126*K,.045*K),(.116*K,.07*K)],o.x,o.y+.01*K,o.z+.068*K,mat='gold',n=18,cap=False)
# ======================================================= (heroes and folk live in heroes.py and bestiary.py)
def H(name,h=1.78,**k): return Char(name,'humanoid',humanoid(h,**k))
# ======================================================= FOES: humanoid
@char('foe','foe',label='Goblin')
def goblin(n): a=H(n,1.12,sh=.20,hip=.10); g=(.46,.58,.26); legs(a,'skin',g,.95,'bare',g); torso(a,'leather',(.4,.32,.24),.98,.35); arms(a,'skin',g,'skin',g,.95); head(a,tint=g,ears='long',nose=1.9,jaw=1.05,sc=1.42,eyes=(1.4,1.1,.2),mouth='tusk'); skirt(a,(.36,.28,.2),1.0,.74,.17,.22,'leather'); belt(a,t=(.4,.3,.2),buckle='iron',pouches=1); w_dagger(a,'R'); shield(a,kind='round',t=(.3,.2,.12)); return a
@char('foe','foe',label='Orc')
def orc(n): a=H(n,1.92,sh=.25,hip=.115); g=(.38,.47,.32); legs(a,'leather',(.4,.3,.24),1.18,'fur',(.4,.32,.26)); torso(a,'skin',g,1.22); arms(a,'skin',g,'skin',g,1.35); head(a,tint=g,jaw=1.3,brow=1.4,nose=1.25,ears='point',eyes=(1.3,.8,.3),sc=1.08,hair=(.06,.05,.05),mouth='tusk'); a.bone('chest','armL'); u=a.p('armL'); a.sculpt([('s',u+Vector((.02,0,.03)),.13,(1,.95,.65))],'rust',.016,220,2); [a.lathe([(.022,0),(0,.1)],u.x+.03*i,u.y,u.z+.09,mat='iron',n=6,ry=i*18) for i in(-1,0,1)]; a.bone('chest'); a.box(.07,.04,.62,0,-.16,1.05,mat='leather',ry=38,bev=.01); skirt(a,(.34,.26,.2),1.0,.64,.2,.26,'fur'); belt(a,r=.195,t=(.35,.25,.18),buckle='iron',pouches=1); w_axe(a,L=1.0,double=False,mat='rust'); return a
@char('foe','foe',label='Hobgoblin')
def hobgoblin(n): a=H(n,1.78,sh=.22); g=(.72,.34,.2); legs(a,'mail',(.7,.68,.66)); torso(a,'mail',(.7,.68,.66),1.06); arms(a,'mail',(.7,.68,.66),'skin',g,1.08); o=head(a,tint=g,ears='point',brow=1.3,jaw=1.1,eyes=(1.3,1.1,.4)); plate(a,'rust',(1.1,.95,.9),'iron'); helm(a,o,a.k,'open','rust',(1.1,1,.95),'iron'); skirt(a,(.24,.06,.05),1.0,.64,.175,.22); belt(a,buckle='iron'); w_sword(a,mat='rust',hilt='iron'); shield(a,t=(.24,.06,.05),emblem='iron'); return a
@char('foe','foe',label='Bandit')
def bandit(n): a=H(n,1.76); legs(a,'cloth',(.25,.2,.16)); torso(a,'leather',(.42,.34,.26),1.02); arms(a,'cloth',(.4,.34,.28),'skin',SK['tan']); o=head(a,tint=SK['tan'],hair=(.18,.13,.1)); a.bone('head'); a.sculpt([('s',o+Vector((0,-.045,-.055)),.083,(1,.85,.62))],'cloth',.011,160,2,tint=(.35,.08,.07)); hood(a,o,a.k,(.24,.2,.17)); belt(a); skirt(a,(.38,.3,.24),1.0,.76,.165,.205,'leather'); w_sword(a,L=.6,hilt='iron'); w_dagger(a,'L'); return a
@char('foe','foe',label='Cultist')
def cultist(n): a=H(n,1.76); robe(a,(.12,.03,.05),(.5,.1,.08)); arms(a,'cloth',(.12,.03,.05),'skin',SK['pale'],.98,.06); o=a.p('head')+Vector((0,-.012,.115)); a.bone('head'); a.sculpt([('s',o+Vector((0,.0,.0)),.1,(.85,.95,1.2))],'bone',.011,260,2,tint=(1,.95,.85)); [a.ball(.02,o.x+s*.034,o.y-.085,o.z+.01,mat='lava',n=7,glow=.7,tint=(1,.4,.2)) for s in(-1,1)]; hood(a,o,a.k,(.13,.03,.05)); belt(a,t=(.5,.42,.2),pouches=0); w_dagger(a,'R'); return a
@char('foe','foe',label='Dark Knight')
def dark_knight(n): a=H(n,1.94,sh=.235); legs(a,'mail',(.35,.34,.36)); torso(a,'mail',(.35,.34,.36),1.1); arms(a,'mail',(.35,.34,.36),'iron',(.4,.4,.42),1.05); o=a.p('head')+Vector((0,-.012,.115)); plate(a,'iron',(.42,.41,.45),'bronze',1.25); helm(a,o,a.k,'great','iron',(.42,.41,.45),'bronze'); a.bone('head'); [a.tube([o+Vector((s*.1,0,.1)),o+Vector((s*.17,.02,.17)),o+Vector((s*.19,.02,.3))],[.03,.022,.003],'iron',n=7,tint=(.4,.4,.42)) for s in(-1,1)]; a.box(.17,.02,.012,o.x,o.y-.128,o.z+.014,mat='lava',bev=0,glow=.8,tint=(1,.3,.15)); skirt(a,(.1,.03,.04),1.02,.55,.18,.235); belt(a,buckle='iron'); cape(a,(.1,.02,.03),1.25,.42); w_sword(a,L=1.15,mat='iron',hilt='bronze',w=.085); return a
def bones_body(a,t=(1,1,1),K=None):
    K=a.k
    def b(p,q,r,*bn): a.bone(*bn); a.tube([p,p.lerp(q,.15),p.lerp(q,.85),q],[r*1.7,r,r,r*1.6],'bone',n=6,tint=t,smooth=60)
    a.bone('hips','spine','chest'); a.tube([(0,.03,1.0*K),(0,.045,1.15*K),(0,.04,1.3*K),(0,.03,1.5*K)],.024*K,'bone',n=6,tint=t)
    for i in range(8): a.ball(.03*K,0,.045*K,(1.02+i*.06)*K,mat='bone',n=6,sz=.6,tint=t)
    a.bone('chest')
    for i in range(7):
        z=(1.47-i*.05)*K; w=(.11+.05*math.sin(i/6*math.pi)+(.02 if i>2 else 0))*K
        for s in(-1,1): a.tube([(0,.045*K,z+.015),(s*w*.8,.05*K,z+.02),(s*w*1.1,-.02*K,z-.02),(s*w*.75,-.105*K,z-.05),(s*.015,-.115*K,z-.04 if i<5 else z-.05)][:5 if i<5 else 4],.0105*K,'bone',n=5,tint=t)
    a.box(.035*K,.018*K,.2*K,0,-.115*K,1.22*K,mat='bone',bev=.006,tint=t)
    for s,S in((1,'L'),(-1,'R')):
        a.bone('chest'); a.tube([(0,-.08*K,1.485*K),(s*.1*K,-.06*K,1.50*K),a.p('arm'+S)],.013*K,'bone',n=5,tint=t); a.extr([(0,0),(s*.1*K,.04*K),(s*.07*K,-.12*K)],.014,s*.07*K,.075*K,1.42*K,mat='bone',tint=t)
    a.bone('hips'); a.sculpt([('s',(s*.07*K,.0,1.0*K),.075*K,(1.1,.6,.95)) for s in(-1,1)]+[('s',(0,.03,.95*K),.05*K)],'bone',.014*K,300,2,tint=t)
    for S in 'LR':
        b(a.p('arm'+S),a.p('fore'+S),.018*K,'arm'+S); b(a.p('fore'+S),a.p('hand'+S),.015*K,'fore'+S); b(a.p('leg'+S),a.p('shin'+S),.022*K,'leg'+S); b(a.p('shin'+S),a.p('foot'+S),.018*K,'shin'+S); h=a.p('hand'+S); a.bone('hand'+S); a.ball(.028*K,*h,mat='bone',n=7,tint=t); [a.tube([h+Vector((0,(i-1.5)*.018,-.02)),h+Vector((0,(i-1.5)*.022,-.07)),h+Vector((0,(i-1.5)*.02-.01,-.11))],.0065*K,'bone',n=4,tint=t) for i in range(4)]; f=a.p('foot'+S); a.bone('foot'+S); a.ball(.035*K,f.x,f.y+.02,f.z-.03,mat='bone',n=7,tint=t); [a.tube([f+Vector(((i-1.5)*.014,-.01,-.04)),f+Vector(((i-1.5)*.024,-.16,-.075))],.009*K,'bone',n=4,tint=t) for i in range(4)]
def skull_head(a,t=(1,1,1),sc=1.08,eye=None):
    H0=a.p('head'); a.bone('head'); K=a.k*sc
    with a.at(H0.x,H0.y-.005,H0.z+.02*K,sc=K*1.12):
        a.sculpt([('s',(0,.02,.1),.085,(.92,1.12,.98)),('s',(0,-.06,.055),.055,(1,.9,.9)),('b',(0,-.082,.0),(.062,.05,.07)),('s',(.045,-.055,.06),.025),('s',(-.045,-.055,.06),.025)],'bone',.008,480,2,tint=t)
        for s in(-1,1): a.ball(.0215,s*.034,-.083,.078,mat='rock_dark',n=8,tint=(.2,.16,.14)); (a.ball(.009,s*.034,-.100,.078,mat='lava',n=6,glow=1,tint=eye) if eye else None)
        a.extr([(-.011,0),(.011,0),(0,.028)],.014,0,-.108,.04,mat='rock_dark',tint=(.2,.16,.14)); [a.box(.011,.012,.02,-.027+i*.0108,-.108,.0,mat='bone',bev=.002,tint=t) for i in range(6)]; [a.box(.011,.012,.016,-.027+i*.0108,-.105,-.022,mat='bone',bev=.002,tint=t) for i in range(6)]
    return H0+Vector((0,-.012,.115*a.k))
@char('foe','foe',label='Skeleton')
def skeleton(n): a=H(n,1.74); bones_body(a); skull_head(a,eye=(.5,.9,1.4)); w_sword(a,mat='rust',hilt='bronze'); shield(a,kind='round',t=(.28,.18,.1)); return a
@char('foe','foe',label='Skeleton Archer')
def skeleton_archer(n): a=H(n,1.74); bones_body(a,(.92,.88,.78)); o=skull_head(a,(.92,.88,.78),eye=(.5,.9,1.4)); hood(a,o,a.k,(.2,.18,.15)); quiver(a); w_bow(a); return a
@char('foe','foe',label='Lich')
def lich(n): a=H(n,1.86); bones_body(a,(.85,.85,.72)); o=skull_head(a,(.85,.85,.72),eye=(.3,1.6,.6)); a.bone('hips','legL','legR','shinL','shinR'); robe(a,(.12,.08,.2),(.6,.48,.2),r1=.34); arms(a,'cloth',(.12,.08,.2),'bone',(.85,.85,.72),.8,.07); cape(a,(.1,.06,.16),1.25,.46); a.bone('head'); a.lathe([(.105,0),(.112,.02),(.112,.05),(.1,.05)],o.x,o.y+.015,o.z+.06,mat='gold',n=16,cap=False); [a.lathe([(.014,0),(0,.09)],o.x+math.cos(t)*.105,o.y+.015+math.sin(t)*.105,o.z+.1,mat='gold',n=5,cap=False) for t in[i*tau/7 for i in range(7)]]; w_staff(a,gem=(.3,1.7,.6),head='skull'); a.lamp(0,-.3,1.6,(.2,1,.4),.5,5); return a
@char('foe','foe',label='Zombie')
def zombie(n): a=H(n,1.74); g=(.44,.48,.34); legs(a,'cloth',(.22,.2,.17),.92,'bare',g); torso(a,'cloth',(.34,.3,.24),.98); arms(a,'skin',g,'skin',g,.92); head(a,tint=g,eyes=(1.2,1.2,1.0),hair=(.16,.14,.11),brow=1.1); a.bone('chest'); a.sculpt([('s',(.06,-.12,1.25),.07,(1,.5,1.1))],'skin',.012,120,1,tint=(.4,.08,.07)); skirt(a,(.3,.27,.22),1.0,.8,.16,.19); a.meta['pose']='zombie'; return a
@char('foe','foe',label='Ghoul')
def ghoul(n): a=H(n,1.62,sh=.2); g=(.6,.58,.52); legs(a,'skin',g,.85,'bare',g); torso(a,'skin',g,.88); arms(a,'skin',g,'skin',g,.85); head(a,tint=g,ears='point',eyes=(1.6,.5,.3),jaw=1.15,mouth='tusk',sc=1.08); skirt(a,(.2,.16,.13),1.0,.8,.15,.18,'leather'); a.meta['pose']='zombie'; return a
@char('foe','foe',label='Ogre',size=2)
def ogre(n): a=H(n,2.75,sh=.25,hip=.12); g=(.66,.56,.36); legs(a,'skin',g,1.28,'bare',g); torso(a,'skin',g,1.3,1.25); arms(a,'skin',g,'skin',g,1.42); head(a,tint=g,jaw=1.35,brow=1.35,nose=1.4,sc=.92,mouth='tusk',hair=(.12,.1,.08)); skirt(a,(.4,.3,.22),.98,.62,.23,.29,'fur'); belt(a,1.0,.225,t=(.35,.25,.17),buckle='bone',pouches=2); w_club(a,sc=2.0); return a
@char('foe','foe',label='Troll',size=2)
def troll(n): a=H(n,2.6,sh=.24,hip=.11,arm=1.2); g=(.32,.42,.30); legs(a,'skin',g,1.0,'bare',g); torso(a,'skin',g,1.1); arms(a,'skin',g,'skin',g,1.2); o=head(a,tint=g,nose=2.3,jaw=1.2,brow=1.2,ears='long',eyes=(1.5,1.2,.2),sc=.95,mouth='tusk'); hair_cap(a,o,a.k*.95,(.10,.14,.09),.12); skirt(a,(.3,.24,.18),.98,.7,.18,.23,'leather'); a.bone('chest','spine'); [a.rock(.06*a.k,a.r.uniform(-.2,.2),.2,a.r.uniform(1.15,1.45)*a.k,'moss',sub=1) for i in range(8)]; return a
@char('foe','foe',label='Minotaur',size=2)
def minotaur(n):
    a=H(n,2.35,sh=.25,hip=.12); g=(.42,.28,.18); legs(a,'fur',g,1.22,'fur',(.25,.17,.12)); torso(a,'skin',(.6,.42,.3),1.24); arms(a,'skin',(.6,.42,.3),'skin',(.55,.38,.28),1.35); H0=a.p('head'); o=H0+Vector((0,-.03,.1*a.k)); K=a.k; a.bone('head')
    a.sculpt([('s',o+Vector((0,.02*K,.03*K)),.11*K),('c',o+Vector((0,-.05*K,.0)),o+Vector((0,-.2*K,-.06*K)),.085*K,.062*K),('s',o+Vector((0,-.21*K,-.06*K)),.062*K,(1.1,.8,.85)),('c',H0+Vector((0,.03,-.08*K)),o,.11*K,.1*K)]+[('c',o+Vector((s*.09*K,.0,.04*K)),o+Vector((s*.18*K,.02*K,.02*K)),.03*K,.015*K) for s in(-1,1)],'fur',.012*K,800,3,tint=g); [a.tube([o+Vector((s*.07*K,.0,.09*K)),o+Vector((s*.2*K,.0,.12*K)),o+Vector((s*.28*K,-.05*K,.2*K)),o+Vector((s*.25*K,-.12*K,.3*K))],[.036*K,.033*K,.024*K,.004*K],'bone',n=8) for s in(-1,1)]; [a.ball(.016*K,*(o+Vector((s*.06*K,-.08*K,.04*K))),mat='lava',n=7,glow=.6,tint=(1,.4,.2)) for s in(-1,1)]; a.tube([o+Vector((math.cos(t)*.025*K,-.255*K,-.085*K+math.sin(t)*.025*K)) for t in[tau*i/10 for i in range(10)]],.006*K,'gold',closed=True,n=4)
    skirt(a,(.36,.2,.12),1.0,.62,.2,.26,'leather'); belt(a,r=.195,buckle='iron'); w_axe(a,L=1.5); return a
@char('foe','foe',label='Demon',size=2)
def demon(n):
    a=H(n,2.45,sh=.25,hip=.115); g=(.62,.12,.08); legs(a,'scale',g,1.1,'bare',(.3,.06,.05)); torso(a,'scale',g,1.22); arms(a,'scale',g,'scale',(.35,.08,.06),1.3); o=head(a,'scale',g,jaw=1.2,brow=1.5,ears='long',eyes=(2,1.2,.2),mouth='tusk'); K=a.k; a.bone('head'); [a.tube([o+Vector((s*.06*K,-.02*K,.1*K)),o+Vector((s*.13*K,.02*K,.2*K)),o+Vector((s*.15*K,.12*K,.27*K)),o+Vector((s*.13*K,.22*K,.25*K))],[.036*K,.03*K,.02*K,.003*K],'rock_dark',n=8) for s in(-1,1)]
    for s,S in((1,'L'),(-1,'R')):
        a.bone('cape' if True else 'chest','chest'); r=Vector((s*.08*K,.13*K,1.42*K)); e=Vector((s*.55*K,.32*K,1.78*K)); t=Vector((s*1.15*K,.42*K,1.35*K)); pts=[Vector((s*.95*K,.4*K,.85*K)),Vector((s*.6*K,.33*K,.75*K)),Vector((s*.25*K,.2*K,.95*K))]; a.tube([r,e],[.05*K,.035*K],'scale',n=7,tint=g); a.tube([e,t],[.035*K,.012*K],'scale',n=6,tint=g); [a.tube([e,p],[.022*K,.008*K],'scale',n=5,tint=g) for p in pts]
        bm=bmesh.new(); v=[bm.verts.new(p) for p in[r,e,t]+pts]; bm.faces.new((v[1],v[2],v[3])); bm.faces.new((v[1],v[3],v[4])); bm.faces.new((v[1],v[4],v[5])); bm.faces.new((v[1],v[5],v[0])); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,'leather',tint=(.5,.10,.07)); a.add(q,'leather',tint=(.4,.08,.06))
    a.bone('hips'); a.tube([(0,.1,1.0*K),(0,.4,.75*K),(.1,.75,.5*K),(.05,1.0,.55*K)],[.06*K,.045*K,.03*K,.01*K],'scale',n=7,tint=g); skirt(a,(.12,.08,.07),1.0,.7,.19,.23,'leather'); a.bone('chest'); a.sculpt([('s',(0,-.17*K,1.35*K),.05*K)],'lava',.014,120,1,glow=.7); w_sword(a,L=1.2,mat='lava',hilt='iron',w=.08); a.lamp(0,-.4,1.6,(1,.35,.1),.6,6); return a
@char('foe','foe',label='Gargoyle')
def gargoyle_m(n):
    a=H(n,1.75,sh=.22); g=(.75,.75,.78); legs(a,'ashlar',g,1.0,'bare',g); torso(a,'ashlar',g,1.08); arms(a,'ashlar',g,'ashlar',g,1.15); o=head(a,'ashlar',g,jaw=1.15,brow=1.4,ears='long',eyes=(1.6,.9,.2),mouth='tusk'); K=a.k; a.bone('head'); [a.tube([o+Vector((s*.05,.0,.09)),o+Vector((s*.1,.05,.2))],[.026,.004],'ashlar',n=6,tint=g) for s in(-1,1)]
    for s in(1,-1):
        a.bone('cape','chest'); r=Vector((s*.08,.13,1.42)); e=Vector((s*.5,.3,1.85)); pts=[Vector((s*.95,.4,1.3)),Vector((s*.6,.33,.85)),Vector((s*.25,.2,1.0))]; a.tube([r,e],[.045,.03],'ashlar',n=6,tint=g); [a.tube([e,p],[.022,.008],'ashlar',n=5,tint=g) for p in pts]; bm=bmesh.new(); v=[bm.verts.new(p) for p in[r,e]+pts]; bm.faces.new((v[1],v[2],v[3])); bm.faces.new((v[1],v[3],v[4])); bm.faces.new((v[1],v[4],v[0])); q=bm.copy(); bmesh.ops.reverse_faces(q,faces=q.faces); a.add(bm,'ashlar',tint=g); a.add(q,'ashlar',tint=(.6,.6,.62))
    return a
@char('foe','foe',label='Stone Golem',size=2)
def golem(n):
    a=H(n,2.7,sh=.27,hip=.13); K=a.k
    def R(bn,c,r,s=(1,1,1),m='cliff'): a.bone(*bn); a.rock(r,*c,mat=m,sub=2,sx=s[0],sy=s[1],sz=s[2],facet=.9)
    R(('chest',),(0,0,1.38*K),.27*K,(1.25,.85,.8)); R(('spine',),(0,0,1.12*K),.18*K,(1.1,.9,.8)); R(('hips',),(0,0,.97*K),.19*K,(1.15,.85,.7)); R(('head',),(0,-.06*K,1.62*K),.12*K,(1,1,1)); a.bone('head'); [a.ball(.022*K,s*.045*K,-.165*K,1.63*K,mat='crystal',n=7,glow=1,tint=(.4,1.2,1.8)) for s in(-1,1)]
    for s,S in((1,'L'),(-1,'R')):
        u,f,h,l,k,t=[a.p(q+S) for q in('arm','fore','hand','leg','shin','foot')]; R(('arm'+S,),(u.x+s*.05*K,u.y,u.z),.14*K); R(('arm'+S,),u.lerp(f,.6),.095*K,(1,1,1.4)); R(('fore'+S,),f.lerp(h,.5),.12*K,(1,1,1.3)); R(('hand'+S,),h+Vector((0,0,-.08*K)),.13*K); R(('leg'+S,),l.lerp(k,.45),.115*K,(1,1,1.6)); R(('shin'+S,),k.lerp(t,.5),.12*K,(1,1,1.5)); R(('foot'+S,),(t.x,t.y-.06*K,.08*K),.13*K,(1,1.3,.6))
    a.bone('chest'); a.sculpt([('s',(0,-.215*K,1.38*K),.06*K,(1,.5,1))],'rune',.016,160,1); [a.rock(.07*K,a.r.uniform(-.22,.22)*K,a.r.uniform(-.05,.15)*K,1.55*K,'moss',sub=1) for i in range(6)]; return a
@char('foe','foe',label='Wraith')
def wraith(n):
    a=Char(n,'float',humanoid(1.85)); o=a.p('head')+Vector((0,-.012,.115)); t=(.16,.18,.22); robe(a,t,None,z1=.18,r1=.34); arms(a,'cloth',t,'bone',(.6,.75,.8),.9,.08); a.bone('head'); a.sculpt([('s',o,.088,(.85,.9,1.15))],'bone',.011,200,2,tint=(.25,.3,.34)); [a.ball(.016,o.x+s*.034,o.y-.082,o.z+.015,mat='crystal',n=7,glow=1,tint=(.5,1.4,1.8)) for s in(-1,1)]; hood(a,o,a.k,t); cape(a,t,1.35,.5); a.lamp(0,-.2,1.4,(.3,.7,1),.5,5); return a
# ======================================================= FOES: beasts
def quad(h=.75,L=.9,w=.16,neck=.25,head=.22):
    return {'hips':(None,(0,L*.42,h)),'spine':('hips',(0,L*.1,h*1.02)),'chest':('spine',(0,-L*.3,h*1.02)),'neck':('chest',(0,-L*.46,h*1.1)),'head':('neck',(0,-L*.46-neck*.8,h*1.1+neck*.55)),'jaw':('head',(0,-L*.46-neck*.8-.05,h*1.1+neck*.5)),
     'flL':('chest',(w,-L*.36,h*.82)),'fsL':('flL',(w,-L*.34,h*.42)),'flR':('chest',(-w,-L*.36,h*.82)),'fsR':('flR',(-w,-L*.34,h*.42)),'blL':('hips',(w,L*.44,h*.82)),'bsL':('blL',(w,L*.5,h*.42)),'blR':('hips',(-w,L*.44,h*.82)),'bsR':('blR',(-w,L*.5,h*.42)),'tail':('hips',(0,L*.55,h*1.02)),'tail2':('tail',(0,L*.85,h*.85))}
def beast(a,h,L,w,mat,t,body,leg,snout,ears=True,eye=(1.4,1,.3),tailr=.05,disp=None,belly=1,jaw=True):
    J=a.p; fur=disp or (lambda p:noise.noise(Vector((p.x*30,p.y*10,p.z*30)))*.012); a.bone('hips','spine','chest','neck'); a.sculpt([('s',J('hips')+Vector((0,-.02,-.02)),body*.95,(1,1.15,1)),('c',J('hips'),J('spine'),body*.9,body*.82*belly),('c',J('spine'),J('chest'),body*.82*belly,body*1.08),('s',J('chest')+Vector((0,0,-.03)),body*1.12,(.95,1.1,1.1)),('c',J('chest')+Vector((0,-.05,.03)),J('head')+Vector((0,.04,-.02)),body*.8,body*.52)],mat,.022,900,3,tint=t,disp=fur)
    hd=J('head'); a.bone('head'); S=[('s',hd,body*.62,(.9,1.05,.9)),('c',hd+Vector((0,-.04,-.015)),hd+Vector((0,-snout,-.055)),body*.42,body*.25),('s',hd+Vector((0,-snout,-.045)),body*.24)]
    if ears: S+=[('c',hd+Vector((s*body*.35,.03,body*.4)),hd+Vector((s*body*.5,.05,body*.95)),body*.2,body*.05) for s in(-1,1)]
    a.sculpt(S,mat,.014,620,2,tint=t); [a.ball(body*.095,hd.x+s*body*.34,hd.y-body*.46,hd.z+body*.14,mat='bone',n=7,tint=eye,glow=.25) for s in(-1,1)]; a.ball(body*.12,0,hd.y-snout-body*.16,hd.z-.035,mat='rock_dark',n=7,tint=(.4,.35,.3))
    if jaw: a.bone('jaw'); a.sculpt([('c',hd+Vector((0,-.05,-body*.4)),hd+Vector((0,-snout*.92,-body*.5)),body*.24,body*.15)],mat,.013,160,2,tint=tuple(v*.85 for v in t)); a.bone('head'); [a.lathe([(.011,0),(0,-.045)],s*body*.14,hd.y-snout*.95+.02*i,hd.z-.085,mat='bone',n=5,cap=False) for s in(-1,1) for i in(0,2)]
    for S2 in 'LR':
        for u,l,z in(('fl','fs',0),('bl','bs',1)):
            p,q=J(u+S2),J(l+S2); f=Vector((q.x,q.y-.03,.05)); a.bone('chest' if z==0 else 'hips',u+S2,l+S2); a.sculpt([('c',p+Vector((0,0,.04)),q,leg*1.45 if z else leg*1.25,leg*.8),('c',q,f,leg*.78,leg*.6),('c',f,f+Vector((0,-.08,-.01)),leg*.72,leg*.6)],mat,.015,260,2,tint=t)
    a.bone('hips','tail','tail2'); e=J('tail2'); a.sculpt([('c',J('tail'),e,tailr,tailr*1.15),('c',e,e+Vector((0,.2,-.1)),tailr*1.15,tailr*.25)],mat,.015,200,2,tint=t,disp=fur)
@char('beast','foe',label='Wolf')
def wolf(n): J=quad(.72,.95,.13,.26); a=Char(n,'quad',J); beast(a,.72,.95,.13,'fur',(.52,.48,.44),.19,.055,.2,tailr=.055); return a
@char('beast','foe',label='Dire Wolf',size=2)
def dire_wolf(n): J=quad(1.1,1.45,.2,.4); a=Char(n,'quad',J); beast(a,1.1,1.45,.2,'fur',(.26,.25,.27),.29,.085,.3,tailr=.08,eye=(2,.5,.2)); return a
@char('beast','foe',label='Bear',size=2)
def bear(n): J=quad(1.0,1.4,.24,.3); a=Char(n,'quad',J); beast(a,1.0,1.4,.24,'fur',(.36,.24,.15),.36,.125,.22,tailr=.05,belly=1.12,eye=(.5,.35,.2)); return a
@char('beast','foe',label='Giant Rat')
def rat(n): J=quad(.3,.52,.09,.1); a=Char(n,'quad',J); beast(a,.3,.52,.09,'fur',(.36,.30,.26),.12,.028,.14,tailr=.016,eye=(2,.3,.2)); return a
@char('beast','npc',label='Horse')
def horse(n):
    J=quad(1.32,1.35,.17,.62); J['head']=('neck',(0,-1.14,1.98)); J['jaw']=('head',(0,-1.2,1.92)); a=Char(n,'quad',J); t=(.5,.3,.18); p=a.p; a.bone('hips','spine','chest','neck'); a.sculpt([('s',p('hips'),.30,(.95,1.15,1.05)),('c',p('hips'),p('chest'),.28,.30),('s',p('chest')+Vector((0,-.05,-.05)),.31,(.9,1,1.15)),('c',p('chest')+Vector((0,-.1,.1)),p('head')+Vector((0,.12,-.08)),.22,.13)],'leather',.026,900,3,tint=tuple(v*1.5 for v in t)); h=p('head'); a.bone('head'); a.sculpt([('s',h,.13,(.85,1,1)),('c',h+Vector((0,-.04,-.02)),h+Vector((0,-.32,-.26)),.115,.08),('s',h+Vector((0,-.34,-.28)),.08,(1,1,.9))]+[('c',h+Vector((s*.06,.05,.1)),h+Vector((s*.075,.05,.22)),.03,.01) for s in(-1,1)],'leather',.016,520,2,tint=tuple(v*1.5 for v in t)); [a.ball(.022,s*.095,h.y-.08,h.z,mat='rock_dark',n=7) for s in(-1,1)]; a.bone('neck','chest'); a.sculpt([('c',p('chest')+Vector((0,.05,.32)),h+Vector((0,.14,.08)),.07,.06)],'fur',.02,300,2,tint=(.12,.09,.07),disp=lambda q:noise.noise(q*25)*.03)
    for S in 'LR':
        for u,l,z in(('fl','fs',0),('bl','bs',1)): q,k=p(u+S),p(l+S); f=Vector((k.x,k.y-.01,.09)); a.bone('chest' if z==0 else 'hips',u+S,l+S); a.sculpt([('c',q+Vector((0,0,.08)),k,.14 if z else .12,.062),('c',k,f,.058,.045),('c',f,f+Vector((0,-.03,-.06)),.055,.07)],'leather',.02,260,2,tint=tuple(v*1.4 for v in t))
    a.bone('hips','tail','tail2'); a.sculpt([('c',p('tail')+Vector((0,0,.05)),p('tail2')+Vector((0,-.2,-.35)),.05,.09),('c',p('tail2')+Vector((0,-.2,-.35)),p('tail2')+Vector((0,-.22,-.75)),.09,.02)],'fur',.02,200,2,tint=(.12,.09,.07)); a.bone('spine'); a.sculpt([('s',(0,.05,1.6),.2,(1.1,1.25,.3)),('s',(0,-.15,1.68),.08),('s',(0,.27,1.68),.1,(1.4,.6,1))],'leather',.02,260,2,tint=(.7,.45,.3)); return a
def arach(r):
    J={'hips':(None,(0,0,.62*r)),'abd':('hips',(0,.35*r,.66*r)),'head':('hips',(0,-.28*r,.6*r))}
    for i in range(4):
        for s,S in((1,'L'),(-1,'R')): an=rad(28+i*38)*s; d=Vector((math.sin(an),-math.cos(an),0)); J[f'u{i}{S}']=('hips',tuple(Vector((0,-.04,.6*r))+d*.2*r)); J[f'l{i}{S}']=(f'u{i}{S}',tuple(Vector((0,-.04,1.05*r))+d*.72*r))
    return J
@char('beast','foe',label='Giant Spider',size=2)
def spider(n):
    r=1.15; a=Char(n,'spider',arach(r)); t=(.22,.19,.19); f=lambda p:noise.noise(p*26)*.014; a.bone('hips'); a.sculpt([('s',(0,0,.62*r),.24*r,(1,1.15,.75))],'fur',.025,320,2,tint=t,disp=f); a.bone('abd'); a.sculpt([('s',(0,.58*r,.74*r),.40*r,(.95,1.2,.9)),('s',(0,.3*r,.66*r),.13*r)],'fur',.03,520,2,tint=(.26,.2,.2),disp=f); [a.extr([(0,0),(.1*r,.12*r),(0,.26*r),(-.1*r,.12*r)],.03,0,.4*r+i*.22*r,(1.06+.03*i)*r,mat='cloth',tint=(.7,.08,.06),rx=72) for i in range(2)]
    a.bone('head'); a.sculpt([('s',(0,-.3*r,.6*r),.16*r,(1.05,1,.85))],'fur',.018,220,2,tint=t,disp=f); [a.ball((.034 if i<2 else .022)*r,s*(.045+.05*(i%2))*r,(-.43+.03*(i%2))*r,(.66+.05*(i//2))*r,mat='crystal',n=8,tint=(1.6,.2,.15),glow=.6) for i in range(4) for s in(-1,1)]; [a.tube([(s*.06*r,-.42*r,.53*r),(s*.08*r,-.5*r,.44*r),(s*.04*r,-.5*r,.32*r)],[.035*r,.03*r,.004],'rock_dark',n=6) for s in(-1,1)]
    for i in range(4):
        for s,S in((1,'L'),(-1,'R')): u,l=a.p(f'u{i}{S}'),a.p(f'l{i}{S}'); an=rad(28+i*38)*s; d=Vector((math.sin(an),-math.cos(an),0)); m=u+d*.1; a.bone(f'u{i}{S}'); a.tube([u,u.lerp(l,.5)+Vector((0,0,.05)),l],[.055*r,.05*r,.04*r],'fur',n=7,tint=t,smooth=180); a.ball(.045*r,*l,mat='fur',n=7,tint=t); a.bone(f'l{i}{S}'); e=Vector((d.x*1.35*r,d.y*1.35*r-.04,.02)); a.tube([l,l.lerp(e,.45)+d*.10*r+Vector((0,0,.06)),e],[.042*r,.032*r,.010*r],'fur',n=6,tint=tuple(v*1.25 for v in t),smooth=180)
    return a
def blobrig(h): return {'hips':(None,(0,0,0)),'mid':('hips',(0,0,h*.4)),'head':('mid',(0,0,h*.75))}
@char('beast','foe',label='Gelatinous Cube',size=2)
def cube(n): a=Char(n,'blob',blobrig(1.9)); a.bone('hips','mid','head'); a.sculpt([('b',(0,0,.95),(1.9,1.9,1.85))],'crystal',.07,500,6,tint=(.35,1.0,.45),glow=.10,disp=lambda p:noise.noise(p*2.2)*.07); a.bone('mid'); props.skull(a,.45,-.97,.8,1.3); props.skull(a,-.35,-.96,1.2,1.2,20); a.tube([(-.5,-.96,.5),(.1,-1.0,.62)],.025,'bone'); a.lamp(0,0,1,(.2,.8,.3),.5,5); return a
@char('beast','foe',label='Ooze')
def ooze(n): a=Char(n,'blob',blobrig(.7)); a.bone('hips','mid','head'); a.sculpt([('s',(0,0,.2),.55,(1,1,.55)),('s',(.15,-.1,.4),.32),('s',(-.2,.1,.32),.3),('s',(.35,.25,.1),.25),('s',(-.3,-.3,.1),.28)],'moss',.035,500,4,tint=(.5,1.3,.3),glow=.12,disp=lambda p:noise.noise(p*5)*.03); [a.ball(.05,.18+s*.1,-.36,.5,mat='bone',n=8) for s in(-1,1)]; return a
@char('beast','foe',label='Mimic')
def mimic(n):
    a=Char(n,'blob',{'hips':(None,(0,0,0)),'mid':('hips',(0,0,.3)),'head':('mid',(0,.28,.52))}); a.bone('mid')
    for i in range(4): a.box(.95,.6,.118,0,0,.04+i*.12,mat='planks' if i%2 else 'planks_old',bev=.008,grain=0)
    for s in(-1,1): a.box(.07,.63,.5,s*.44,0,.03,mat='iron',bev=.008)
    a.lathe([(.0,.5),(.38,.52)],mat='skin',n=14,cap=False,tint=(.6,.1,.12),sq=.3); [a.lathe([(.035,0),(0,.15)],-.4+i*.1,-.27,.5,mat='bone',n=5,cap=False) for i in range(9)]; [a.lathe([(.03,0),(0,.12)],s*.42,-.2+i*.11,.5,mat='bone',n=5,cap=False) for s in(-1,1) for i in range(4)]; a.tube([(0,-.1,.5),(.05,-.35,.52),(.02,-.6,.35),(.12,-.75,.1)],[.1,.09,.07,.02],'skin',n=9,tint=(.75,.16,.2),flat=.5)
    a.bone('head')
    with a.at(0,.28,.53,rx=48):
        pr=[(-.30+.30*(1-math.cos(math.pi*i/8)),.26*math.sin(math.pi*i/8)) for i in range(9)]
        with a.at(0,-.3,0,rz=90):
            a.extr([(x,z) for x,z in pr],.93,mat='planks',smooth=50); [a.extr([(x*1.05,z*1.07) for x,z in pr],.07,0,s*.43,0,mat='iron',smooth=50) for s in(-1,0,1)]
        [a.lathe([(.035,0),(0,-.16)],-.4+i*.1,-.58,.0,mat='bone',n=5,cap=False) for i in range(9)]; [a.ball(.06,s*.2,-.55,.16,mat='bone',n=9,tint=(1.4,1.2,.4),glow=.3) for s in(-1,1)]; [a.ball(.028,s*.2,-.6,.16,mat='rock_dark',n=7) for s in(-1,1)]
    [ (a.bone('hips'),a.tube([(s*.4,y,.2),(s*.62,y*1.3,.25),(s*.66,y*1.5,.0)],[.07,.05,.03],'skin',n=7,tint=(.5,.25,.2))) for s in(-1,1) for y in(-.22,.22)]; return a
@char('beast','foe',label='Eye Tyrant',size=2)
def eye_tyrant(n):
    a=Char(n,'float',{'hips':(None,(0,0,1.5)),'spine':('hips',(0,0,1.5)),'chest':('spine',(0,0,1.5)),'head':('chest',(0,0,2.1)),**{f't{i}':('hips',(math.cos(i*tau/8)*.45,math.sin(i*tau/8)*.45+.05,2.05)) for i in range(8)}}); t=(.55,.36,.42); a.bone('hips'); a.sculpt([('s',(0,0,1.5),.85,(1,1,.95)),('s',(0,-.66,1.72),.36,(1.25,.55,.55)),('s',(0,-.6,1.1),.5,(1.1,.6,.5))],'scale',.045,1300,3,tint=t,disp=lambda p:noise.noise(p*4)*.04-(.13*max(0,1-(p-Vector((0,-.85,1.13))).length/.42))); a.ball(.33,0,-.62,1.56,mat='bone',n=20,tint=(1.25,1.15,.95)); a.lathe([(.17,0),(.15,.03),(0,.05)],0,-.925,1.56,mat='crystal',n=16,rx=90,cap=False,tint=(1.3,.8,.15),glow=.4); a.lathe([(.05,.045),(.02,.065),(0,.07)],0,-.925,1.56,mat='rock_dark',n=10,rx=90,cap=False,sq=0); [a.lathe([(.05,0),(0,.2)],-.36+i*.12,-.84+abs(i-3)*.05,1.0,mat='bone',n=6,cap=False) for i in range(7)]; [a.lathe([(.05,0),(0,-.2)],-.30+i*.12,-.86+abs(i-2.5)*.05,1.33,mat='bone',n=6,cap=False) for i in range(6)]
    for i in range(8): x,y=math.cos(i*tau/8)*.5,math.sin(i*tau/8)*.5+.05; a.bone(f't{i}'); a.tube([(x*.8,y*.8,2.0),(x*1.3,y*1.3,2.35),(x*1.5,y*1.5,2.55)],[.085,.06,.05],'scale',n=7,tint=t); a.ball(.1,x*1.5,y*1.5,2.62,mat='bone',n=9,tint=(1.2,1.1,.9)); a.ball(.05,x*1.56,y*1.56-.06,2.63,mat='crystal',n=7,tint=(.4,1.2,1.6),glow=.5)
    return a
@char('beast','foe',label='Dragon',size=4)
def dragon(n):
    h=1.75; L=2.9; J=quad(h,L,.42,1.25); J['neck']=('chest',(0,-1.45,2.0)); J['head']=('neck',(0,-2.45,3.0)); J['jaw']=('head',(0,-2.55,2.88)); J['tail']=('hips',(0,1.7,1.7)); J['tail2']=('tail',(0,2.9,1.2)); J['tail3']=('tail2',(0,4.0,.7)); J['wingL']=('chest',(.35,-.5,2.3)); J['wing2L']=('wingL',(1.8,.0,3.5)); J['wingR']=('chest',(-.35,-.5,2.3)); J['wing2R']=('wingR',(-1.8,.0,3.5))
    a=Char(n,'dragon',J); p=a.p; t=(.58,.10,.07); bl=(.8,.6,.34); a.bone('hips','spine','chest','neck'); a.sculpt([('s',p('hips'),.62,(.95,1.2,1)),('c',p('hips'),p('chest'),.6,.72),('s',p('chest')+Vector((0,-.05,-.05)),.76,(.95,1.1,1.05)),('c',p('chest')+Vector((0,-.45,.1)),p('neck')+Vector((0,-.35,.35)),.55,.34),('c',p('neck')+Vector((0,-.35,.35)),p('head')+Vector((0,.2,0)),.34,.26)],'scale',.05,2200,3,tint=t); a.sculpt([('c',p('hips')+Vector((0,-.2,-.3)),p('chest')+Vector((0,-.35,-.3)),.42,.55),('c',p('chest')+Vector((0,-.55,-.2)),p('neck')+Vector((0,-.5,.15)),.45,.25)],'bone',.055,500,2,tint=bl)
    hd=p('head'); a.bone('head'); a.sculpt([('s',hd,.34,(.85,1.05,.8)),('c',hd+Vector((0,-.15,0)),hd+Vector((0,-.85,-.08)),.25,.17),('s',hd+Vector((0,-.88,-.05)),.18,(1.05,.9,.8)),('c',hd+Vector((-.16,-.25,.2)),hd+Vector((-.16,.1,.22)),.08,.08),('c',hd+Vector((.16,-.25,.2)),hd+Vector((.16,.1,.22)),.08,.08)],'scale',.032,900,2,tint=t); [a.tube([hd+Vector((s*.2,.12,.2)),hd+Vector((s*.34,.45,.42)),hd+Vector((s*.36,.85,.5))],[.09,.06,.008],'bone',n=8) for s in(-1,1)]; [a.tube([hd+Vector((s*.28,.1,.0)),hd+Vector((s*.45,.35,.0))],[.06,.008],'bone',n=6) for s in(-1,1)]; [a.ball(.065,s*.23,hd.y-.28,hd.z+.14,mat='crystal',n=9,tint=(1.8,1.1,.2),glow=.8) for s in(-1,1)]; [a.lathe([(.04,0),(0,-.14)],s*.15,hd.y-.35-.13*i,hd.z-.17,mat='bone',n=5,cap=False) for s in(-1,1) for i in range(5)]
    a.bone('jaw'); a.sculpt([('c',hd+Vector((0,-.05,-.24)),hd+Vector((0,-.8,-.30)),.17,.11)],'scale',.03,240,2,tint=t); [a.lathe([(.03,0),(0,.1)],s*.1,hd.y-.35-.13*i,hd.z-.26,mat='bone',n=5,cap=False) for s in(-1,1) for i in range(4)]
    for S in 'LR':
        s=1 if S=='L' else -1
        for u,l,z in(('fl','fs',0),('bl','bs',1)):
            q,k=p(u+S),p(l+S); f=Vector((k.x+s*.04,k.y-.05,.12)); a.bone('chest' if z==0 else 'hips',u+S,l+S); a.sculpt([('c',q+Vector((0,0,.15)),k,.36 if z else .28,.2),('c',k,f,.19,.15),('c',f,f+Vector((0,-.2,-.03)),.16,.14)],'scale',.04,420,2,tint=t); a.bone(l+S); [a.tube([f+Vector(((i-1)*.12,-.22,-.02)),f+Vector(((i-1)*.16,-.4,-.1))],[.06,.008],'bone',n=6) for i in range(3)]
        w,e=p('wing'+S),p('wing2'+S); tip=[Vector((s*4.4,.6,2.9)),Vector((s*3.9,2.0,1.9)),Vector((s*2.7,2.5,1.5)),Vector((s*1.3,2.0,1.5))]; a.bone('wing'+S); a.tube([w,e],[.17,.11],'scale',n=8,tint=t); a.lathe([(.07,0),(0,.35)],e.x,e.y,e.z,mat='bone',n=6,cap=False); a.bone('wing2'+S); [a.tube([e,e.lerp(q,.5)+Vector((0,0,.18)),q],[.09,.06,.015],'scale',n=6,tint=t) for q in tip]
        for bn,tri in((('wing2'+S,),[(e,tip[0],tip[1]),(e,tip[1],tip[2]),(e,tip[2],tip[3])]),(('wing'+S,'wing2'+S),[(e,tip[3],w+Vector((0,.9,-.5))),(e,w+Vector((0,.9,-.5)),w)])):
            a.bone(*bn); bm=bmesh.new()
            for A,B,C in tri:
                mids=[]; n2=5
                for i in range(n2):
                    b0,b1=B.lerp(C,i/n2),B.lerp(C,(i+1)/n2); sag=lambda v,f:v+(A-v)*.14*math.sin(f*math.pi); b0,b1=sag(b0,i/n2),sag(b1,(i+1)/n2); bm.faces.new([bm.verts.new(v) for v in(A,b0,b1)])
            bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=1e-4); q2=bm.copy(); bmesh.ops.reverse_faces(q2,faces=q2.faces); a.add(bm,'leather',tint=(.75,.18,.10),smooth=180); a.add(q2,'leather',tint=(.6,.16,.10),smooth=180)
    a.bone('hips','tail','tail2','tail3'); e=p('tail3')+Vector((0,1.0,-.25)); a.sculpt([('c',p('hips')+Vector((0,.3,0)),p('tail'),.5,.38),('c',p('tail'),p('tail2'),.38,.24),('c',p('tail2'),p('tail3'),.24,.14),('c',p('tail3'),e,.14,.05)],'scale',.045,700,2,tint=t); a.bone('tail3'); a.extr([(0,.35),(.2,0),(0,-.35),(-.2,0)],.06,e.x,e.y,e.z,mat='scale',tint=t,rx=90); a.bone('spine','chest','hips','neck')
    for i in range(10): f=i/9; y=1.4-f*3.4; z=2.42+(.75 if y<-1.3 else 0)*((-y-1.3)/1)+.05*math.sin(i); a.extr([(-.16,0),(.12,0),(.2,.34)],.05,0,y,z-.12,mat='bone',rz=90)
    return a
@char('beast','foe',label='Treant',size=2)
def treant(n):
    a=H(n,3.2,sh=.2,hip=.1); K=a.k; g=(.8,.72,.62)
    def limb(bn,*pts,r0=.1,r1=.06): a.bone(*bn); a.tube([Vector(p) for p in pts],[r0*K+(r1-r0)*K*i/(len(pts)-1) for i in range(len(pts))],'bark',n=9,smooth=180,tint=g)
    limb(('hips','spine','chest','head'),(0,0,.85*K),(.02,0,1.1*K),(0,.01,1.35*K),(0,0,1.55*K),(0,.02,1.72*K),r0=.22,r1=.15); a.bone('head'); [a.ball(.03*K,s*.06*K,-.155*K,1.6*K,mat='lava',n=7,glow=.8,tint=(.9,.8,.3)) for s in(-1,1)]; a.tube([(-.08*K,-.16*K,1.5*K),(0,-.175*K,1.47*K),(.08*K,-.16*K,1.5*K)],.014*K,'rock_dark',n=5)
    for S in 'LR':
        s=1 if S=='L' else -1; u,f,h,l,k,t=[a.p(q+S) for q in('arm','fore','hand','leg','shin','foot')]; limb(('chest','arm'+S),(s*.05*K,0,1.42*K),u,f,r0=.11,r1=.075); limb(('fore'+S,'hand'+S),f,h,r0=.08,r1=.06); [limb(('hand'+S,),h,h+Vector((s*.02*i,-.06*(i-1),-.14*K)),r0=.028,r1=.008) for i in range(-1,3)]; limb(('hips','leg'+S,'shin'+S),l+Vector((0,0,.05*K)),k,t,r0=.12,r1=.09); [limb(('foot'+S,),t,t+Vector((s*.08*K*(i-1),-.16*K+.05*abs(i-1),-.07*K)),r0=.06,r1=.02) for i in range(3)]
    a.bone('head'); a.sculpt([('s',Vector((0,.03,1.86*K))+Vector((a.r.gauss(0,.16),a.r.gauss(0,.16),a.r.uniform(-.05,.2)))*K,a.r.uniform(.12,.2)*K) for i in range(11)],'moss',.05,900,1,tint=(.9,1,.7),disp=lambda p:noise.noise(p*5)*.09+noise.noise(p*14)*.03)
    a.bone('chest'); a.sculpt([('s',(s_*.2*K,.02,1.46*K),.12*K,(1.2,1,.7)) for s_ in(-1,1)],'moss',.04,260,1,tint=(.9,1,.7),disp=lambda p:noise.noise(p*9)*.05)
    return a
