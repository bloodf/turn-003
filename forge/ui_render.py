"""Interface furniture, rendered rather than drawn: iron frame, oak plaques, wax seal, d20, parchment."""
import bpy,bmesh,math,random,os,sys
from mathutils import Vector
HERE=os.path.dirname(os.path.abspath(__file__)); TEX=HERE+'/../public/tex/'; OUT=HERE+'/../public/ui/'; os.makedirs(OUT,exist_ok=True)
sc=bpy.context.scene
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True); global sc; sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=96; sc.cycles.device='CPU'; sc.render.film_transparent=True; sc.view_settings.view_transform='AgX'; sc.view_settings.look='AgX - Medium High Contrast'; sc.cycles.use_denoising=False
    w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; bg=w.node_tree.nodes['Background']; bg.inputs[0].default_value=(.55,.5,.45,1); bg.inputs[1].default_value=.55
    for loc,e,size,col in(((-4,5,6),420,3,(1,.86,.68)),((5,-2,5),130,4,(.6,.7,1)),((0,-6,4),120,5,(1,.7,.45))):
        l=bpy.data.lights.new('l','AREA'); l.energy=e; l.size=size; l.color=col; o=bpy.data.objects.new('l',l); o.location=loc; sc.collection.objects.link(o); o.rotation_euler=(Vector((0,0,0))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
def mat(name,layer=None,metal=0,rough=None,tint=(1,1,1),scale=1.,bump=.6,emit=None):
    m=bpy.data.materials.new(name); m.use_nodes=True; nt=m.node_tree; b=nt.nodes['Principled BSDF']; b.inputs['Metallic'].default_value=metal
    if layer:
        im=bpy.data.images.load(TEX+layer+'.c.webp'); t=nt.nodes.new('ShaderNodeTexImage'); t.image=im; t.projection='BOX'; t.projection_blend=.2; c=nt.nodes.new('ShaderNodeTexCoord'); mp=nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value=(scale,)*3; nt.links.new(c.outputs['Object'],mp.inputs[0]); nt.links.new(mp.outputs[0],t.inputs[0]); mx=nt.nodes.new('ShaderNodeMix'); mx.data_type='RGBA'; mx.blend_type='MULTIPLY'; mx.inputs[0].default_value=1; mx.inputs[7].default_value=(*tint,1); nt.links.new(t.outputs[0],mx.inputs[6]); nt.links.new(mx.outputs[2],b.inputs['Base Color']); bp=nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value=bump; bp.inputs['Distance'].default_value=.03; nt.links.new(t.outputs[0],bp.inputs['Height']); nt.links.new(bp.outputs[0],b.inputs['Normal'])
    else: b.inputs['Base Color'].default_value=(*tint,1)
    if rough is not None: b.inputs['Roughness'].default_value=rough
    if emit: b.inputs['Emission Color'].default_value=(*emit,1); b.inputs['Emission Strength'].default_value=2
    return m
def add(bm,m,smooth=False):
    me=bpy.data.meshes.new('m'); bm.to_mesh(me); bm.free(); o=bpy.data.objects.new('o',me); sc.collection.objects.link(o); me.materials.append(m)
    if smooth: me.polygons.foreach_set('use_smooth',[True]*len(me.polygons)); me.set_sharp_from_angle(angle=.6)
    return o
def box(w,d,h,x,y,z,m,bev=.03,rz=0,seg=3):
    bm=bmesh.new(); bmesh.ops.create_cube(bm,size=1); bmesh.ops.scale(bm,vec=(w,d,h),verts=bm.verts); bmesh.ops.bevel(bm,geom=bm.edges[:],offset=min(bev,min(w,d,h)*.45),segments=seg,profile=.6,affect='EDGES'); o=add(bm,m,True); o.location=(x,y,z); o.rotation_euler[2]=rz; return o
def ball(r,x,y,z,m,sz=.6):
    bm=bmesh.new(); bmesh.ops.create_uvsphere(bm,u_segments=24,v_segments=12,radius=r); bmesh.ops.scale(bm,vec=(1,1,sz),verts=bm.verts); o=add(bm,m,True); o.location=(x,y,z); return o
def tube(pts,r,m,cyclic=False):
    cu=bpy.data.curves.new('c','CURVE'); cu.dimensions='3D'; cu.bevel_depth=1; cu.bevel_resolution=4; sp=cu.splines.new('NURBS'); sp.points.add(len(pts)-1)
    for p,(q,rr) in zip(sp.points,pts): p.co=(*q,1); p.radius=rr*r
    sp.use_endpoint_u=True; sp.use_cyclic_u=cyclic; sp.order_u=4; cu.materials.append(m); o=bpy.data.objects.new('t',cu); sc.collection.objects.link(o); return o
def cam(w,h,px):
    c=bpy.data.cameras.new('c'); c.type='ORTHO'; c.ortho_scale=max(w,h); o=bpy.data.objects.new('c',c); o.location=(0,0,10); sc.collection.objects.link(o); sc.camera=o; sc.render.resolution_x=px[0]; sc.render.resolution_y=px[1]; sc.render.resolution_percentage=100
def shot(name):
    sc.render.image_settings.file_format='PNG'; sc.render.image_settings.color_mode='RGBA'; sc.render.filepath=HERE+'/.work/'+name+'.png'; bpy.ops.render.render(write_still=True)
def frame():
    reset(); I=mat('i','iron',.9,.5,(.42,.38,.36),.35); G=mat('g','gold',1,.3,(1,.86,.62),.6,.2); W=mat('w','beam',0,.7,(.75,.6,.5),.5)
    S=3.0; t=.36; a=S/2-t/2
    for s in(-1,1): box(S,t,.16,0,s*a,0,W,.03); box(t,S,.16,s*a,0,0,W,.03); 
    for s in(-1,1):
        box(S-.1,.075,.1,0,s*(a+.135),.08,I,.02); box(.075,S-.1,.1,s*(a+.135),0,.08,I,.02); box(S-t*1.9,.035,.1,0,s*(a-.155),.07,G,.014); box(.035,S-t*1.9,.1,s*(a-.155),0,.07,G,.014)
    for sx in(-1,1):
        for sy in(-1,1):
            x,y=sx*a,sy*a; box(.56,.56,.14,x-sx*.08,y-sy*.08,.11,I,.04); ball(.095,x-sx*.02,y-sy*.02,.19,G,.7)
            for dx,dy in((.17,-.17),(-.17,.17),(-.25,-.25)): ball(.032,x-sx*.08+sx*dx,y-sy*.08+sy*dy,.185,G,.6)
            for k in(0,1):
                f=lambda u,v:((x-sx*.02-sx*(u if k==0 else v),y-sy*.02-sy*(v if k==0 else u),.2),1)
                def q(u,v,r): p,_=f(u,v); return(p,r)
                tube([q(.1,-.02,.9),q(.3,-.08,1.1),q(.5,.0,1),q(.6,.08,.9),q(.55,.17,.7),q(.46,.14,.5),q(.48,.08,.25)],.028,G)
    cam(S,S,(384,384)); shot('frame')
def plaque(name,tint,rim,lit=False):
    reset(); W=mat('w','planks',0,.55,tint,.28,.5); R=mat('r',rim,.95 if rim!='beam' else 0,.4,(1,.86,.6) if rim=='gold' else (.5,.47,.45),.5,.25)
    box(3.2,1.5,.2,0,0,0,W,.09); 
    for s in(-1,1): box(3.22,.07,.13,0,s*.70,.1,R,.02); box(.07,1.44,.13,s*1.56,0,.1,R,.02)
    for sx in(-1,1):
        for sy in(-1,1): ball(.075,sx*1.5,sy*.64,.16,R,.7)
    cam(3.3,1.6,(330,160)); shot(name)
def seal():
    reset(); X=mat('x',None,0,.38,(.42,.015,.02)); r=random.Random(4); bm=bmesh.new(); bmesh.ops.create_uvsphere(bm,u_segments=96,v_segments=40,radius=1)
    ph=[r.random()*6.28 for _ in range(6)]
    for v in bm.verts:
        an=math.atan2(v.co.y,v.co.x); rr=math.hypot(v.co.x,v.co.y); k=1+.045*math.sin(an*5+ph[0])+.03*math.sin(an*9+ph[1])+.02*math.sin(an*14+ph[2]); v.co.x*=k; v.co.y*=k; v.co.z*=.26
        if rr<.74: v.co.z-=.075*(1-min(1,max(0,(rr-.66)/.08)))
    add(bm,X,True)
    def poly(n,R,off=0): return[(math.cos(off+i*2*math.pi/n)*R,math.sin(off+i*2*math.pi/n)*R) for i in range(n)]
    hexa=poly(6,.54,math.pi/2); tri=poly(3,.31,math.pi/2)
    def bar(p,q): tube([((p[0],p[1],.2),1),((p[0]*.67+q[0]*.33,p[1]*.67+q[1]*.33,.2),1),((p[0]*.33+q[0]*.67,p[1]*.33+q[1]*.67,.2),1),((q[0],q[1],.2),1)],.028,X)
    for i in range(6): bar(hexa[i],hexa[(i+1)%6])
    for i in range(3): bar(tri[i],tri[(i+1)%3]); bar(tri[i],hexa[i*2]); bar(tri[i],hexa[(i*2+1)%6]); bar(tri[i],hexa[(i*2+5)%6])
    cam(2.3,2.3,(220,220)); shot('seal')
def d20():
    reset(); X=mat('x',None,0,.18,(.33,.02,.03)); G=mat('g','gold',1,.25,(1,.86,.6),.5,.1); bm=bmesh.new(); bmesh.ops.create_icosphere(bm,subdivisions=1,radius=1); bmesh.ops.bevel(bm,geom=bm.edges[:],offset=.035,segments=3,profile=.5,affect='EDGES'); o=add(bm,X,True)
    # face the camera with one triangle
    bm=bmesh.new(); bmesh.ops.create_icosphere(bm,subdivisions=1,radius=1); f=max(bm.faces,key=lambda f:f.normal.z); n=f.normal.copy(); bm.free(); o.rotation_mode='QUATERNION'; o.rotation_quaternion=n.rotation_difference(Vector((0.05,-.12,1)).normalized())
    cu=bpy.data.curves.new('t','FONT'); cu.body='20'; cu.size=.5; cu.extrude=.02; cu.align_x='CENTER'; cu.align_y='CENTER'; cu.materials.append(G); t=bpy.data.objects.new('t',cu); t.location=(.04,-.07,.8); sc.collection.objects.link(t)
    cam(2.2,2.2,(256,256)); shot('d20')
which=sys.argv[1:] or ['frame','plaque','plaque_hot','seal','d20']
if 'frame' in which: frame()
if 'plaque' in which: plaque('plaque',(.55,.44,.36),'iron')
if 'plaque_hot' in which: plaque('plaque_hot',(1.0,.78,.55),'gold')
if 'seal' in which: seal()
if 'd20' in which: d20()
sys.stdout.flush(); os._exit(0)
