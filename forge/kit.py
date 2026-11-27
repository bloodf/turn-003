"""Small modelling kit on top of Blender's bmesh. Z up, metres. Fronts face -Y."""
import bpy,bmesh,math,random,json,os,sys,struct
import numpy as np
from mathutils import Vector,Matrix,Euler,noise
from mathutils.bvhtree import BVHTree
HERE=os.path.dirname(os.path.abspath(__file__))
LAYERS=[l['name'] for l in json.load(open(HERE+'/../public/tex/layers.json'))]
SCALE={l['name']:l['scale'] for l in json.load(open(HERE+'/../public/tex/layers.json'))}
CUT={'oak':100,'pine':101,'fern':102,'grassblade':103,'ivy':104,'web':105,'flower':106,'reed':107,'autumn':108,'deadleaf':109,'bush':110,'banner':111}  # cutout atlas tiles
tau=math.tau
LOW=[False]
def rad(d): return math.radians(d)
class Asset:
    def __init__(s,name,cat,**meta):
        s.name=name; s.cat=cat; s.meta=meta; s.meta.setdefault('tags',[]); s.parts=[]; s.fx=[]; s.light=None; s.r=random.Random(hash(name)&0 or sum(ord(c)*(i+7) for i,c in enumerate(name)))
        s.stack=[Matrix()]
    # transform scopes ------------------------------------------------
    def at(s,x=0,y=0,z=0,rx=0,ry=0,rz=0,sc=1):
        m=Matrix.Translation((x,y,z))@Euler((rad(rx),rad(ry),rad(rz))).to_matrix().to_4x4()@(Matrix.Diagonal((sc,sc,sc,1)) if not hasattr(sc,'__len__') else Matrix.Diagonal((*sc,1)))
        s.stack.append(s.stack[-1]@m); return s
    def __enter__(s): return s
    def __exit__(s,*a): s.stack.pop()
    # core ------------------------------------------------------------
    def add(s,bm,mat,tint=None,uv=None,m=None,glow=0,wind=0,smooth=35,grain=None,ao=1,uvs=1.0,flatuv=None):
        """uv: None box projection; else fn(loop)->(u,v) in metres evaluated pre-transform"""
        bm.normal_update(); L=bm.loops.layers.uv.verify()
        if uv=='keep': pass
        elif uv is None:
            b=[Vector((min(v.co[i] for v in bm.verts) for i in range(3))),Vector((max(v.co[i] for v in bm.verts) for i in range(3)))]; d=b[1]-b[0]
            long=grain if grain is not None else max(range(3),key=lambda i:d[i]); ox,oy=s.r.random()*3,s.r.random()*3
            for f in bm.faces:
                n=f.normal; k=max(range(3),key=lambda i:abs(n[i])); ax=[i for i in range(3) if i!=k]
                va=long if long in ax else (2 if 2 in ax else 1); ua=[i for i in ax if i!=va][0]
                for l in f.loops: l[L].uv=((l.vert.co[ua]+ox)*uvs,(l.vert.co[va]+oy)*uvs)
        else:
            for f in bm.faces:
                for l in f.loops: l[L].uv=uv(l,f)
        M=s.stack[-1]@m if m is not None else s.stack[-1]
        bm.transform(M)
        if M.determinant()<0: bmesh.ops.reverse_faces(bm,faces=bm.faces)
        s.parts.append((bm,mat,tint or (1,1,1),glow,wind,smooth,ao)); return bm
    # primitives ------------------------------------------------------
    def box(s,w,d,h,x=0,y=0,z=0,mat='wood',rx=0,ry=0,rz=0,bev=.012,seg=1,taper=1,wob=0,base=True,sub=0,**k):
        """box whose bottom centre is at x,y,z (base=False: centre)"""
        if LOW[0]: bev=0
        bm=bmesh.new(); bmesh.ops.create_cube(bm,size=1)
        for v in bm.verts:
            t=taper if v.co.z>0 else 1
            tx,ty=(t if hasattr(t,'__len__') else (t,t)); v.co=Vector((v.co.x*w*tx,v.co.y*d*ty,v.co.z*h+(h/2 if base else 0)))
        if sub: bmesh.ops.subdivide_edges(bm,edges=bm.edges[:],cuts=sub,use_grid_fill=True)
        if bev>0:
            b=min(bev,min(w,d,h)*.35); bmesh.ops.bevel(bm,geom=[e for e in bm.edges if len(e.link_faces)==2 and e.calc_face_angle()>.5],offset=b,segments=seg,profile=.6,affect='EDGES',clamp_overlap=True)
        if wob:
            o=s.r.random()*50
            for v in bm.verts: v.co+=noise.noise_vector(v.co*2.3+Vector((o,o,o)))*wob
        return s.add(bm,mat,m=Matrix.Translation((x,y,z))@Euler((rad(rx),rad(ry),rad(rz))).to_matrix().to_4x4(),**k)
    def lathe(s,prof,x=0,y=0,z=0,mat='stone_wall',n=16,rx=0,ry=0,rz=0,cap=True,wob=0,uvs=1,sq=0,arc=360,**k):
        """prof: [(r,z)...] bottom to top"""
        if LOW[0] and n>6: n=max(6,n//2)
        bm=bmesh.new(); L=bm.loops.layers.uv.verify(); rings=[]; al=[0]; full=arc>=360
        for i in range(1,len(prof)): al.append(al[-1]+math.dist(prof[i],prof[i-1]))
        m=n if full else n+1
        for r_,z_ in prof:
            ring=[]
            for i in range(m):
                a=rad(arc)*i/n; q=r_
                if sq: q=r_/max(abs(math.cos(a)),abs(math.sin(a)))**sq
                p=Vector((math.cos(a)*q,math.sin(a)*q,z_)); 
                if wob: p+=noise.noise_vector(p*3.1)*wob
                ring.append(bm.verts.new(p))
            rings.append(ring)
        mr=max(p[0] for p in prof)
        for j in range(len(prof)-1):
            for i in range(n):
                i2=(i+1)%m if full else i+1
                vs=[rings[j][i],rings[j][i2],rings[j+1][i2],rings[j+1][i]]
                f=bm.faces.new(vs); c=[(i,j),(i+1,j),(i+1,j+1),(i,j+1)]
                for l,(a,b) in zip(f.loops,c): l[L].uv=(rad(arc)*a/n*mr*uvs,al[b]*uvs)
        if cap and full:
            for ring,rev in((rings[0],True),(rings[-1],False)):
                if (ring[0].co.xy).length>1e-4:
                    f=bm.faces.new(ring[::-1] if rev else ring)
                    for l in f.loops: l[L].uv=(l.vert.co.x*uvs,l.vert.co.y*uvs)
        if any(p[0]<1e-4 for p in prof): bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=1e-5)
        return s.add(bm,mat,uv='keep',m=Matrix.Translation((x,y,z))@Euler((rad(rx),rad(ry),rad(rz))).to_matrix().to_4x4(),**k)
    def cyl(s,r,h,x=0,y=0,z=0,mat='wood',n=12,r2=None,bev=0,**k):
        r2=r if r2 is None else r2
        p=[(r,0),(r2,h)] if not bev else [(r-bev,0),(r,bev),(r2,h-bev),(r2-bev,h)]
        return s.lathe(p,x,y,z,mat,n,**k)
    def ball(s,r,x=0,y=0,z=0,mat='iron',n=10,sz=1,**k):
        m=max(4,n//2); return s.lathe([(r*math.sin(math.pi*i/m),-r*sz*math.cos(math.pi*i/m)) for i in range(m+1)],x,y,z,mat,n,cap=False,**k)
    def tube(s,pts,r,mat='iron',n=6,closed=False,rend=None,flat=1,up=None,**k):
        """sweep a circle along points. r scalar or list"""
        if LOW[0]:
            n=3 if n<6 else 4
            if len(pts)>9: pts=pts[::2]; r=r[::2] if hasattr(r,'__len__') else r
        P=[Vector(p) for p in pts]; N=len(P); R=r if hasattr(r,'__len__') else [r+( (rend-r)*i/(N-1) if rend is not None else 0) for i in range(N)]
        bm=bmesh.new(); L=bm.loops.layers.uv.verify(); rings=[]; al=0; als=[]; ref=None
        for i in range(N):
            t=(P[(i+1)%N]-P[i-1]) if closed else (P[min(i+1,N-1)]-P[max(i-1,0)])
            t.normalize()
            if ref is None: ref=Vector(up) if up else (Vector((0,0,1)) if abs(t.z)<.9 else Vector((1,0,0)))
            a=t.cross(ref).normalized(); b=a.cross(t).normalized(); ref=b
            rings.append([bm.verts.new(P[i]+(a*math.cos(tau*j/n)+b*math.sin(tau*j/n)*flat)*R[i]) for j in range(n)])
            if i: al+=(P[i]-P[i-1]).length
            als.append(al)
        mr=max(R)
        for i in range(N if closed else N-1):
            A,B=rings[i],rings[(i+1)%N]
            for j in range(n):
                j2=(j+1)%n; f=bm.faces.new((A[j],B[j],B[j2],A[j2])); v0=als[i]; v1=als[i+1] if i+1<N else als[i]+.1
                for l,(u,v) in zip(f.loops,((j,v0),(j,v1),(j+1,v1),(j+1,v0))): l[L].uv=(u*tau*mr/n,v)
        if not closed:
            for ring,rev in((rings[0],False),(rings[-1],True)):
                f=bm.faces.new(ring[::-1] if rev else ring)
                for l in f.loops: l[L].uv=(l.vert.co.x,l.vert.co.y)
        bm.normal_update(); bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
        return s.add(bm,mat,uv='keep',**k)
    def extr(s,poly,d,x=0,y=0,z=0,mat='wood',bev=0,rx=0,ry=0,rz=0,**k):
        """extrude a 2D polygon (x,z plane) by d along y, centred"""
        bm=bmesh.new(); a=[bm.verts.new((p[0],-d/2,p[1])) for p in poly]; f=bm.faces.new(a)
        r=bmesh.ops.extrude_face_region(bm,geom=[f]); 
        for v in r['geom']:
            if isinstance(v,bmesh.types.BMVert): v.co.y+=d
        bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
        if bev and not LOW[0]: bmesh.ops.bevel(bm,geom=[e for e in bm.edges if e.calc_face_angle(0)>.6],offset=bev,segments=1,affect='EDGES',clamp_overlap=True)
        return s.add(bm,mat,m=Matrix.Translation((x,y,z))@Euler((rad(rx),rad(ry),rad(rz))).to_matrix().to_4x4(),**k)
    def rock(s,r,x=0,y=0,z=0,mat='rock',seed=None,sub=2,sx=1,sy=1,sz=.75,facet=.5,smooth=40,amp=.3,**k):
        if LOW[0] and sub>0: sub-=1
        seed=s.r.random()*99 if seed is None else seed; bm=bmesh.new(); bmesh.ops.create_icosphere(bm,subdivisions=sub,radius=1); o=Vector((seed,seed*1.7,-seed)); rr=random.Random(seed)
        cuts=[(Vector((rr.gauss(0,1),rr.gauss(0,1),rr.gauss(0,1))).normalized(),rr.uniform(.62,.92)) for _ in range(int(14*facet)+3)]
        for v in bm.verts:
            p=v.co.copy()
            for n_,d_ in cuts:
                q=p.dot(n_)-d_
                if q>0: p-=n_*q
            p*=1+noise.noise(p*1.6+o)*amp*.6+noise.noise(p*4+o)*amp*.25; v.co=Vector((p.x*r*sx,p.y*r*sy,p.z*r*sz))
        return s.add(bm,mat,m=Matrix.Translation((x,y,z))@Euler((rr.uniform(-.15,.15),rr.uniform(-.15,.15),rr.uniform(0,6))).to_matrix().to_4x4(),smooth=smooth,**k)
    def card(s,w,h,x=0,y=0,z=0,tile='oak',rx=0,ry=0,rz=0,wind=1,bend=0,seg=1,tint=None,**k):
        bm=bmesh.new(); L=bm.loops.layers.uv.verify()
        g=[[bm.verts.new((w*(i/1-.5),-bend*(j/seg)**2,h*j/seg)) for i in range(2)] for j in range(seg+1)]
        for j in range(seg):
            f=bm.faces.new((g[j][0],g[j][1],g[j+1][1],g[j+1][0]))
            for l,(u,v) in zip(f.loops,((0,j/seg),(1,j/seg),(1,(j+1)/seg),(0,(j+1)/seg))): l[L].uv=(u,v)
        return s.add(bm,'@'+tile,uv='keep',tint=tint,m=Matrix.Translation((x,y,z))@Euler((rad(rx),rad(ry),rad(rz))).to_matrix().to_4x4(),wind=wind,smooth=180,**k)
    def sculpt(s,shapes,mat,voxel=.02,tris=2000,smooth_it=4,disp=None,tint=None,x=0,y=0,z=0,paint=None,**k):
        """fuse shapes with voxel remesh, smooth, optionally displace, decimate. shapes: list of
        ('s',c,r[,scale3,euler]) ellipsoid | ('c',p0,p1,r0,r1) capsule-cone | ('b',c,size,euler) box"""
        if LOW[0]: tris=max(60,tris//4)
        me=bpy.data.meshes.new('t'); bm=bmesh.new()
        for sh in shapes: shape_to(bm,sh)
        bm.to_mesh(me); bm.free(); ob=bpy.data.objects.new('t',me); bpy.context.scene.collection.objects.link(ob)
        m=ob.modifiers.new('r','REMESH'); m.mode='VOXEL'; m.voxel_size=voxel; m.use_smooth_shade=True
        if smooth_it: m=ob.modifiers.new('s','SMOOTH'); m.iterations=smooth_it; m.factor=.5
        dg=bpy.context.evaluated_depsgraph_get(); ev=bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); 
        if disp:
            nv=[v.normal.copy() for v in ev.vertices]
            for v,n_ in zip(ev.vertices,nv): v.co+=n_*disp(v.co)
        ob.modifiers.clear(); ob.data=ev; nt=len(ev.polygons)*2
        if nt>tris: m=ob.modifiers.new('d','DECIMATE'); m.ratio=tris/nt
        dg=bpy.context.evaluated_depsgraph_get(); fin=bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
        bm=bmesh.new(); bm.from_mesh(fin); bpy.data.objects.remove(ob); bpy.data.meshes.remove(me); bpy.data.meshes.remove(fin)
        k.setdefault('smooth',180)
        return s.add(bm,mat,tint=tint,m=Matrix.Translation((x,y,z)),**k)
    # decoration helpers ------------------------------------------------
    def rivets(s,pts,r=.012,mat='iron',n=5,**k):
        if LOW[0]: return
        for p in pts: s.lathe([(r,0),(r*.75,r*.55),(0,r*.75)],*p,mat,n,cap=False,**k)
    def flame(s,x,y,z,size=.3,kind='fire',col=None): s.fx.append(dict(k=kind,p=[x,z,-y],s=size,**({'c':col} if col else {})))
    def lamp(s,x,y,z,col=(1,.55,.2),i=1.,rad_=8): s.light=dict(p=[x,z,-y],c=list(col),i=i,r=rad_)
    # export ------------------------------------------------------------
    def bake(s,ground=True,aorays=40,lodk=.35,lods=(0,)):
        out=[]
        for lod in lods:
            V=[];nrm=[];UV=[];LAY=[];COL=[];EX=[];TR=[]; base=0; geoV=[];geoF=[]
            for bm,mat,tint,glow,wind,smooth,ao in s.parts:
                b=bm.copy(); bmesh.ops.triangulate(b,faces=b.faces[:]); me=bpy.data.meshes.new('m'); b.to_mesh(me); b.free()
                if lod==1 and not mat.startswith('@') and len(me.polygons)>60:
                    ob=bpy.data.objects.new('d',me); bpy.context.scene.collection.objects.link(ob); m=ob.modifiers.new('d','DECIMATE'); m.ratio=max(lodk,40/len(me.polygons)); m.use_collapse_triangulate=True
                    me2=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get())); bpy.data.objects.remove(ob); bpy.data.meshes.remove(me); me=me2
                n=len(me.loops); 
                if n==0: bpy.data.meshes.remove(me); continue
                fixed=smooth[1] if isinstance(smooth,tuple) else None
                if fixed is not None: smooth=180
                if smooth>=180: me.polygons.foreach_set('use_smooth',[True]*len(me.polygons))
                else:
                    me.polygons.foreach_set('use_smooth',[True]*len(me.polygons)); me.set_sharp_from_angle(angle=rad(smooth))
                me.update(); co=np.zeros(len(me.vertices)*3,np.float32); me.vertices.foreach_get('co',co); co=co.reshape(-1,3)
                vi=np.zeros(n,np.int32); me.loops.foreach_get('vertex_index',vi); cn=np.zeros(n*3,np.float32); me.corner_normals.foreach_get('vector',cn); cn=cn.reshape(-1,3)
                if fixed is not None: cn=np.tile(np.array(fixed,np.float32),(n,1))
                uv=np.zeros(n*2,np.float32); me.uv_layers.active.data.foreach_get('uv',uv); uv=uv.reshape(-1,2)
                if mat.startswith('@'): lay=CUT[mat[1:]]
                else: lay=LAYERS.index(mat); uv=uv/SCALE[mat]
                geoV+= [Vector(c) for c in co]; geoF+=[tuple(int(q)+base for q in vi[i:i+3]) for i in range(0,n,3)] if not mat.startswith('@') else []; base+=len(co)
                V.append(co[vi]); nrm.append(cn); UV.append(uv); LAY.append(np.full(n,lay,np.uint8)); t=np.clip(np.array(tint)*.5,0,1); COL.append(np.tile((t*255+.5).astype(np.uint8),(n,1))); EX.append(np.tile(np.array([int(glow*255),int(wind*255),int(ao*255)],np.uint8),(n,1))); bpy.data.meshes.remove(me)
            V=np.concatenate(V);nrm=np.concatenate(nrm);UV=np.concatenate(UV);LAY=np.concatenate(LAY);COL=np.concatenate(COL);EX=np.concatenate(EX)
            # merge identical corners
            key=np.concatenate([np.round(V*2000),np.round(nrm*60),np.round(UV*1500),LAY[:,None],COL,EX],1).astype(np.int64); _,fi,inv=np.unique(key,axis=0,return_index=True,return_inverse=True); inv=inv.reshape(-1)
            # degenerate
            T=inv.reshape(-1,3); T=T[(T[:,0]!=T[:,1])&(T[:,1]!=T[:,2])&(T[:,0]!=T[:,2])]
            V,nrm,UV,LAY,COL,EX=V[fi],nrm[fi],UV[fi],LAY[fi],COL[fi],EX[fi]
            # wind from height for foliage
            AO=np.ones(len(V))
            if aorays and geoF:
                size=float(np.linalg.norm(V.max(0)-V.min(0))); dist=min(max(size*.45,.15),1.4); bvh=BVHTree.FromPolygons(geoV,geoF); rr=random.Random(3)
                dirs=[]
                for i in range(aorays):
                    z=(i+.5)/aorays; a=i*2.399963; q=math.sqrt(1-z); dirs.append((q*math.cos(a),q*math.sin(a),math.sqrt(z)))
                gz=float(V[:,2].min()); cache={}
                for i in range(len(V)):
                    if EX[i,0]>120: continue
                    k=(round(float(V[i,0]),3),round(float(V[i,1]),3),round(float(V[i,2]),3),round(float(nrm[i,0]),1),round(float(nrm[i,1]),1),round(float(nrm[i,2]),1))
                    if k in cache: AO[i]=cache[k]; continue
                    n_=Vector(nrm[i].tolist()); 
                    if n_.length<.1: continue
                    n_.normalize(); t_=n_.orthogonal().normalized(); b_=n_.cross(t_); p=Vector(V[i].tolist())+n_*.004; occ=0.
                    for dx,dy,dz in dirs:
                        d=t_*dx+b_*dy+n_*dz; h=bvh.ray_cast(p,d,dist)
                        if h[0] is not None: occ+=1-(h[3]/dist)**1*.8
                        elif ground and d.z<-.05:
                            gd=(p.z-gz)/-d.z
                            if gd<dist: occ+=.8*(1-gd/dist)
                    AO[i]=cache[k]=max(.08,1-occ/len(dirs))
            ao8=np.clip(AO**.9*EX[:,2]/255*255,0,255).astype(np.uint8)
            P=np.stack([V[:,0],V[:,2],-V[:,1]],1).astype(np.float32); Nn=np.stack([nrm[:,0],nrm[:,2],-nrm[:,1]],1)
            out.append(dict(P=P,N=np.clip(np.round(Nn*127),-127,127).astype(np.int8),UV=UV.astype(np.float32),C=np.concatenate([COL,ao8[:,None]],1),X=np.stack([LAY,EX[:,0],EX[:,1]],1).astype(np.uint8),T=T.astype(np.uint32)))
        return out
def shape_to(bm,sh):
    k=sh[0]
    if k=='s':
        c,r=sh[1],sh[2]; sc=sh[3] if len(sh)>3 else (1,1,1); eu=sh[4] if len(sh)>4 else (0,0,0)
        m=Matrix.Translation(c)@Euler([rad(a) for a in eu]).to_matrix().to_4x4()@Matrix.Diagonal((sc[0]*r,sc[1]*r,sc[2]*r,1)); bmesh.ops.create_icosphere(bm,subdivisions=3,radius=1,matrix=m)
    elif k=='c':
        a,b,r0,r1=Vector(sh[1]),Vector(sh[2]),sh[3],sh[4]; d=b-a; q=d.to_track_quat('Z','Y').to_matrix().to_4x4(); m=Matrix.Translation((a+b)/2)@q
        bmesh.ops.create_cone(bm,segments=20,radius1=r0,radius2=r1,depth=d.length,cap_ends=True,matrix=m)
        bmesh.ops.create_icosphere(bm,subdivisions=3,radius=r0,matrix=Matrix.Translation(a)); bmesh.ops.create_icosphere(bm,subdivisions=3,radius=r1,matrix=Matrix.Translation(b))
    elif k=='b':
        c,sz=sh[1],sh[2]; eu=sh[3] if len(sh)>3 else (0,0,0); m=Matrix.Translation(c)@Euler([rad(a) for a in eu]).to_matrix().to_4x4()@Matrix.Diagonal((*sz,1)); bmesh.ops.create_cube(bm,size=1,matrix=m)
