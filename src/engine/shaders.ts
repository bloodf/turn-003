import { ShaderStore } from '@babylonjs/core/Engines/shaderStore'
import '@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration'
import '@babylonjs/core/Shaders/ShadersInclude/instancesVertex'
const NOISE = `
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float fbm2(vec2 p){ float a=.5,r=0.; for(int i=0;i<4;i++){ r+=a*vn(p); p=p*2.03+17.; a*=.5; } return r; }
`
const LIT = `
#ifdef LITVERT
uniform vec4 fogC; uniform vec4 fogP; uniform vec4 volS; uniform vec3 sunD; uniform vec3 sunC; varying vec4 vLit; varying vec3 vFogC;
#ifdef LITUNI
uniform vec4 litU; uniform vec4 litV;
#else
attribute vec4 lit;
#endif
#if NPL > 0
uniform vec4 plP[NPL]; uniform vec4 plC[NPL];
#endif
void lightVert(vec3 w, vec3 N, float vao){
#ifdef LITUNI
  vec3 d=litU.rgb*(.62+.38*N.y+.35*max(dot(N,litV.xyz),0.))*(.35+.65*vao)+sunC*max(dot(N,sunD),0.)*litU.a;
#else
  vec3 d=lit.rgb*lit.rgb*volS.z;
#endif
  d*=1.+volS.w*.7*sin(time*8.+w.x*.3+w.z*.2);
#if NPL > 0
  { vec4 P=plP[0]; vec3 l=P.xyz-w; float d2=dot(l,l); float q=d2/(P.w*P.w+.001); if(q<1.){ q=1.-q*q; d+=plC[0].rgb*(q*q/(d2*.32+.5))*(max(dot(N,l)*inversesqrt(d2),0.)*.85+.08)*vao; } }
#endif
  vec3 e=w-eye; float fg=0.;
#ifndef ORTHO
  float q2=dot(e,e)*fogC.a*fogC.a; fg=clamp(q2/(q2+.55),0.,1.)*fogP.y;
#endif
  vLit=vec4(d,fg); vFogC=fogC.rgb;
}
#endif
`
ShaderStore.ShadersStore.realmVertexShader = `
precision highp float; precision highp sampler3D;
attribute vec3 position; attribute vec4 normal; attribute vec2 uv; attribute vec4 tint; attribute vec4 xtra;
#include<instancesDeclaration>
uniform mat4 viewProjection; uniform float time; uniform vec3 eye; uniform vec4 wind;
varying vec3 vW; varying vec3 vN; varying vec2 vUV; varying vec4 vC; flat varying vec4 vX;${LIT}void main(){
  vec3 p=position; vec3 n=normal.xyz;
  #include<instancesVertex>
  vec4 w=finalWorld*vec4(p,1.);
  vec4 ex=floor(xtra*255.+.5);
#ifdef WIND
  float k=xtra.z; float ph=w.x*.35+w.z*.27; w.xyz+=k*wind.x*vec3(sin(time*1.7+ph)+.5*sin(time*4.1+ph*3.), .25*sin(time*2.3+ph), cos(time*1.3+ph*1.3))*.055;
#endif
  vW=w.xyz; vN=normalize(mat3(finalWorld)*n); vUV=uv; vC=tint; vX=vec4(ex.x,xtra.y,xtra.z,xtra.w);
#ifdef LITVERT
  lightVert(vW,vN,vC.a);
#endif
  gl_Position=viewProjection*w;
}`
// characters: our own skinning, 4 weights, uniform bones
ShaderStore.ShadersStore.rskinVertexShader = `
precision highp float; precision highp sampler3D;
attribute vec3 position; attribute vec4 normal; attribute vec2 uv; attribute vec4 tint; attribute vec4 xtra; attribute vec4 bi; attribute vec4 bw;
uniform mat4 world; uniform mat4 viewProjection; uniform mat4 bn[NB]; uniform float time; uniform vec3 eye;
varying vec3 vW; varying vec3 vN; varying vec2 vUV; varying vec4 vC; flat varying vec4 vX;${LIT}void main(){ ivec4 b=ivec4(bi*255.+.5); mat4 m=bn[b.x]*bw.x+bn[b.y]*bw.y+bn[b.z]*bw.z+bn[b.w]*bw.w; vec4 p=world*(m*vec4(position,1.)); vW=p.xyz; vN=normalize(mat3(world)*(mat3(m)*normal.xyz)); vUV=uv; vC=tint; vec4 ex=floor(xtra*255.+.5); vX=vec4(ex.x,xtra.y,0.,0.);
#ifdef LITVERT
  lightVert(vW,vN,vC.a);
#endif
 gl_Position=viewProjection*p; }`
ShaderStore.ShadersStore.realmFragmentShader = `
precision highp float; precision highp sampler2DArray; precision highp sampler3D;
varying vec3 vW; varying vec3 vN; varying vec2 vUV; varying vec4 vC; flat varying vec4 vX;
uniform sampler2DArray albA; uniform sampler2DArray datA; uniform sampler3D volA; uniform sampler3D volB;
#ifdef CUTOUT
uniform sampler2DArray cutA;
#endif
#ifdef FOGWAR
uniform sampler2DArray fowA;
uniform vec4 fowP;
#endif
#ifdef SUNSHADOW
uniform sampler2D shA; uniform mat4 shM; uniform vec4 shP;
#endif
uniform float time; uniform vec3 eye; uniform vec4 volO; uniform vec4 volS;  // volO: x0,z0,l0,nl ; volS: 1/(w*.75),1/(d*.75), VS, flicker
uniform vec3 sunD; uniform vec3 sunC; uniform vec3 skyC; uniform vec3 gndC; uniform vec3 ambC; uniform vec4 fogC; uniform vec4 fogP; // fogC.a density
uniform float metalT[64];
uniform vec4 cutP; // y, cx, cz, radius
uniform vec3 selC; uniform vec4 fadeP;
#ifdef TERRAIN
uniform vec4 terL; uniform vec4 terS;
#endif
#if NPL > 0
uniform vec4 plP[NPL]; uniform vec4 plC[NPL];
#endif
${NOISE}
float ggx(float nh,float r){ float a=r*r; a*=a; float d=nh*nh*(a-1.)+1.; return a/(3.14159*d*d+1e-4); }
vec3 tone(vec3 x){ x*=.92; vec3 a=x*(x*2.51+.03), b=x*(x*2.43+.59)+.14; return clamp(a/b,0.,1.); }
void main(){
#ifdef CUTAWAY
  if(vW.y>cutP.x){ vec2 q=vW.xz-cutP.yz; if(dot(q,q)<cutP.w*cutP.w) discard; }
#ifndef CUTOUT
  if(!gl_FrontFacing){ if(vX.w>.3) discard; glFragColor=vec4(.10,.085,.075,1.); return; }
#endif
#endif
  vec3 N=normalize(vN);
#ifdef TWOSIDE
  N=gl_FrontFacing?N:N; 
#endif
  vec3 Ng=N; float layer=vX.x; vec3 alb; float rough=.9, ao=1., metal=0.; vec3 tn=vec3(0.,0.,1.); float emis=vX.y;
#ifdef CUTOUT
  vec4 ct=texture(cutA,vec3(vUV.x,1.-vUV.y,layer));
  float cov=ct.a; if(cov<.42) discard;
  alb=ct.rgb*ct.rgb*vC.rgb*2.; rough=.85;
#elif defined(TERRAIN)
  vec4 wt=vec4(vC.rgb,vX.w); wt/=dot(wt,vec4(1.))+1e-4;
  float nz=vn(vW.xz*.9)*.6+vn(vW.xz*3.1)*.4; wt=max(wt+ (nz-.5)*.5*step(.02,wt),0.); wt*=wt; wt/=dot(wt,vec4(1.))+1e-4;
  vec4 d=vec4(0.); alb=vec3(0.); float lw=0.;
  for(int i=0;i<4;i++){ float w=wt[i]; if(w>.03){ vec2 t=vW.xz/terS[i]; t.y=-t.y; vec3 c=texture(albA,vec3(t,terL[i])).rgb; alb+=c*c*w; 
#ifdef NORMALMAP
   { vec4 q=texture(datA,vec3(t,terL[i]));
#ifdef BCDATA
 q=q.agbr;
#endif
 d+=q*w; }
#endif
   lw+=w; } }
  alb/=lw; 
#ifdef NORMALMAP
  d/=lw; tn.xy=d.xy*2.-1.; rough=d.z; ao=d.w;
#else
  rough=.92;
#endif
#else
  vec4 d;
  vec2 tuv=vUV; bool cave=vX.w>.3&&vX.w<.7; vec3 wx=dFdx(vW), wy=dFdy(vW); vec2 gx=dFdx(vUV), gy=dFdy(vUV);
#ifndef SKINNED
  if(cave){ bool zx=abs(N.x)+(h21(gl_FragCoord.xy)-.5)*.34>abs(N.z); tuv=(zx?vW.zy:vW.xy)/4.5; gx=(zx?wx.zy:wx.xy)/4.5; gy=(zx?wy.zy:wy.xy)/4.5; }
#endif
  alb=textureGrad(albA,vec3(tuv,layer),gx,gy).rgb; alb*=alb;
#ifdef NORMALMAP
  d=textureGrad(datA,vec3(tuv,layer),gx,gy);
#ifdef BCDATA
  d=d.agbr;
#endif
  tn.xy=(d.xy*2.-1.); rough=d.z; ao=d.w;
#else
  rough=.75;
#endif
  alb*=vC.rgb*2.; int li=int(layer); metal=metalT[li];
#endif
  // break up tiling
#if !defined(CUTOUT) && !defined(SKINNED) && !defined(LOWQ)
  float mac=vn(vW.xz*.13+vW.y*.11)*.55+vn(vW.xz*.61+vW.y*.5)*.45; alb*=.80+.40*mac;
#endif
#ifdef TERRAIN
  float vao=vC.a;
#else
  float vao=vC.a;
#endif
#ifdef NORMALMAP
#ifndef CUTOUT
  { vec3 dp1=dFdx(vW), dp2=dFdy(vW);
#ifdef TERRAIN
    vec2 tt=vec2(vW.x,-vW.z);
#endif
#ifdef TERRAIN
    vec2 du1=dFdx(tt), du2=dFdy(tt);
#else
    vec2 du1=gx, du2=gy;
#endif
    vec3 p2=cross(dp2,N), p1=cross(N,dp1); vec3 T=p2*du1.x+p1*du2.x, B=p2*du1.y+p1*du2.y; float im=inversesqrt(max(max(dot(T,T),dot(B,B)),1e-12));
    tn.z=sqrt(max(0.,1.-dot(tn.xy,tn.xy))); float dist=length(eye-vW); float fade=clamp(1.6-dist*.022,.25,1.); N=normalize(T*im*tn.x*fade*1.15+B*im*tn.y*fade*1.15+N*tn.z); }
#endif
#endif
  vec3 V=normalize(eye-vW);
#ifdef ORTHO
  V=fadeP.xyz;
#endif
  // ---- light volume
  float lev=floor((vW.y+Ng.y*.3+.05)*.25); float fy=clamp(vW.y-lev*4.+Ng.y*.55,.667,3.333);
  vec3 uvw=vec3((vW.x+Ng.x*.30-volO.x)*volS.x, (lev-volO.z+fy*.25)/volO.w, (vW.z+Ng.z*.30-volO.y)*volS.y);
  vec4 A=texture(volA,uvw), Bv=texture(volB,uvw);
  vec2 inb=step(abs(uvw.xz-.5),vec2(.5)); float inside=inb.x*inb.y*step(0.,uvw.y);
  if(inside<.5){ A=vec4(0.,0.,0.,1.); Bv=vec4(.5,.5,.5,1.); if(lev<0.) { A.a=0.; Bv.a=0.; } }
  vec3 irr=A.rgb*A.rgb*volS.z; float sunV=A.a, skyV=Bv.a;
  vec3 ld=Bv.rgb*2.-1.; float dl=length(ld); vec3 L=dl>.01?ld/dl:vec3(0.,1.,0.);
  float fl=1.+volS.w*(sin(time*7.3+vW.x*.31+vW.z*.27)*.5+sin(time*12.7+vW.x*.17-vW.z*.41)*.35+sin(time*3.1-vW.z*.2)*.3);
  float nl=dot(N,L); float wr=mix(1., max(0.,nl*.78+.22)*1.55, min(1.,dl*1.25));
  ao=min(ao,1.); float occ=ao*vao;
  vec3 dif=irr*fl*wr*mix(occ,1.,.25);
  vec3 amb=mix(gndC,skyC,N.y*.5+.5)*skyV; 
  dif+=(amb+ambC*(.6+.4*N.y))*occ;
  // ---- sun
  float ns=dot(N,sunD); float sh=sunV;
#ifdef SUNSHADOW
  if(skyV>.02){ vec4 sp=shM*vec4(vW+Ng*.06,1.); vec3 sc=sp.xyz*.5+.5; if(all(greaterThan(sc.xy,vec2(.01)))&&all(lessThan(sc.xy,vec2(.99)))){ float bias=shP.y*(1.+2.*(1.-clamp(ns,0.,1.))); float s=0.; float rr=h21(gl_FragCoord.xy)*6.283; mat2 rm=mat2(cos(rr),sin(rr),-sin(rr),cos(rr)); 
    vec2 o[4]; o[0]=vec2(-.7,-.3); o[1]=vec2(.4,-.8); o[2]=vec2(.75,.45); o[3]=vec2(-.35,.8);
    for(int i=0;i<4;i++) s+=step(sc.z-bias,texture2D(shA,sc.xy+rm*o[i]*shP.x*1.6).r); s*=.25; vec2 e=smoothstep(.40,.49,abs(sc.xy-.5)); sh=mix(s,sunV,max(e.x,e.y)); } }
#endif
#ifdef CUTOUT
  ns=abs(ns)*.5+.35; 
#endif
  dif+=sunC*max(ns,0.)*sh*mix(occ,1.,.5);
  vec3 F0=mix(vec3(.04),alb,metal); vec3 spec=vec3(0.);
#ifdef SPECULAR
  { float r=clamp(rough,.08,1.); vec3 H=normalize(V+L); float nh=max(dot(N,H),0.); float vis=.25/(mix(.35,1.,r)+.05); spec+=irr*fl*dl*ggx(nh,max(r,.22))*max(nl,0.)*vis*F0*2.2;
    vec3 H2=normalize(V+sunD); spec+=sunC*sh*ggx(max(dot(N,H2),0.),max(r,.15))*max(ns,0.)*vis*F0;
    float fr=pow(1.-max(dot(N,V),0.),5.); vec3 R=reflect(-V,N); vec3 env=mix(gndC,skyC*1.6,clamp(R.y*.5+.5,0.,1.))*skyV+irr*(.25+.35*max(dot(R,L),0.))+ambC; spec+=env*(F0+(vec3(max(1.-r,.04))-F0)*fr)*(1.-r*.75)*occ*(metal>.1?1.7:.8); }
#else
  spec+=(irr*.5+skyC*skyV*.6)*F0*metal*1.6;
#endif
#if NPL > 0
  for(int i=0;i<NPL;i++){ vec4 P=plP[i]; if(P.w<=0.) break; vec3 l=P.xyz-vW; float d2=dot(l,l); float q=d2/(P.w*P.w); if(q<1.){ q=1.-q*q; float di=sqrt(d2); l/=di; float n2=max(dot(N,l),0.); float at=q*q/(d2*.32+.5); vec3 c=plC[i].rgb*at; dif+=c*(n2*.85+.08)*mix(occ,1.,.35);
#ifdef SPECULAR
    vec3 H=normalize(V+l); spec+=c*ggx(max(dot(N,H),0.),max(rough,.22))*n2*F0*1.4;
#endif
  } }
#endif
  vec3 col=dif*alb*(1.-metal*.85)+spec;
  // emission: tint * texture, flickering slightly
  if(emis>.004){ float e=emis*(.92+.08*sin(time*5.+vW.x)); 
#ifndef CUTOUT
    if(abs(layer-float(LAVA))<.5){ vec2 lu=vUV+vec2(time*.012,time*.007); vec3 a1=texture(albA,vec3(lu,layer)).rgb, a2=texture(albA,vec3(vUV*1.37-vec2(time*.009,-time*.011),layer)).rgb; vec3 lv=max(a1,a2*.8)*vC.rgb*2.; col=lv*lv*2.6*vec3(1.25,.75,.5)+lv*.25; }
    else
#endif
    col+=alb*e*2.6; }
  else {
#ifndef CUTOUT
#ifndef TERRAIN
    if(abs(layer-float(RUNE))<.5){ float g=smoothstep(.25,.75,alb.b-alb.r*.7); col+=vec3(.15,.65,1.)*g*(.55+.25*sin(time*1.7+vW.x*2.+vW.y)); }
#endif
#endif
  }
  col+=selC*alb*1.2+selC*.04;
#ifdef FOGWAR
  { float lvF=floor((vW.y+(Ng.y>.5?.6:Ng.y<-.5?-.4:.0))*.25)-fowP.z; vec2 fu=(vW.xz+Ng.xz*.35)*fowP.x+.5; float f=(lvF<0.||lvF>=fowP.w)?fowP.y:texture(fowA,vec3(fu,lvF)).r; float seen=smoothstep(.12,.42,f), now=smoothstep(.55,.95,f); vec3 g=vec3(dot(col,vec3(.3,.55,.15))); col=mix(g*vec3(.30,.32,.40),col,now)*seen; }
#endif
  float dist=length(vW-eye);
#ifdef ORTHO
  dist=fogP.x;
#endif
  float fg=1.-exp(-pow(dist*fogC.a,1.35)); vec3 fc=fogC.rgb+irr*.05+skyC*skyV*0.; col=mix(col,fc,clamp(fg,0.,1.)*fogP.y);
  col=tone(col); col=sqrt(col);
#ifdef DITHER
  col+=(h21(gl_FragCoord.xy)-.5)/255.;
#endif
  glFragColor=vec4(col,1.);
}`
ShaderStore.ShadersStore.realmloFragmentShader = `
precision highp float; precision highp sampler2DArray;
varying vec3 vW; varying vec3 vN; varying vec2 vUV; varying vec4 vC; flat varying vec4 vX; varying vec4 vLit; varying vec3 vFogC;
uniform sampler2DArray albA;
#ifdef CUTOUT
uniform sampler2DArray cutA;
#endif
#ifdef FOGWAR
uniform sampler2DArray fowA; uniform vec4 fowP;
#endif
uniform float time; uniform vec4 cutP; uniform vec3 selC;
#ifdef TERRAIN
uniform vec4 terL; uniform vec4 terS;
#endif
vec3 tone(vec3 x){ x*=.92; vec3 a=x*(x*2.51+.03), b=x*(x*2.43+.59)+.14; return clamp(a/b,0.,1.); }
void main(){
#ifdef CUTAWAY
  if(vW.y>cutP.x){ vec2 q=vW.xz-cutP.yz; if(dot(q,q)<cutP.w*cutP.w) discard; }
#ifndef CUTOUT
  if(!gl_FrontFacing){ if(vX.w>.3) discard; glFragColor=vec4(.10,.085,.075,1.); return; }
#endif
#endif
  vec3 alb; float layer=vX.x, emis=vX.y;
#ifdef CUTOUT
  vec4 ct=texture(cutA,vec3(vUV.x,1.-vUV.y,layer)); if(ct.a<.42) discard; alb=ct.rgb*ct.rgb*vC.rgb*2.;
#elif defined(TERRAIN)
  vec4 wt=vec4(vC.rgb,vX.w); alb=vec3(0.); float lw=0.; for(int i=0;i<4;i++){ float w=wt[i]; if(w>.12){ w*=w; vec2 t=vW.xz/terS[i]; t.y=-t.y; vec3 c=texture(albA,vec3(t,terL[i])).rgb; alb+=c*c*w; lw+=w; } } alb/=max(lw,.001);
#else
  vec2 tuv=vUV; if(vX.w>.3&&vX.w<.7) tuv=(abs(vN.x)>abs(vN.z)?vW.zy:vW.xy)*.222; alb=texture(albA,vec3(tuv,layer)).rgb; alb*=alb*vC.rgb*2.;
#endif
  vec3 col=alb*vLit.rgb;
  if(emis>.004) col+=alb*emis*2.4;
  col+=selC*alb*1.2+selC*.04;
#ifdef FOGWAR
  { float lvF=floor((vW.y+(vN.y>.5?.6:vN.y<-.5?-.4:.0))*.25)-fowP.z; vec2 fu=(vW.xz+vN.xz*.35)*fowP.x+.5; float f=(lvF<0.||lvF>=fowP.w)?fowP.y:texture(fowA,vec3(fu,lvF)).r; float seen=smoothstep(.12,.42,f), now=smoothstep(.55,.95,f); vec3 g=vec3(dot(col,vec3(.3,.55,.15))); col=mix(g*vec3(.30,.32,.40),col,now)*seen; }
#endif
  col=mix(col,vFogC,vLit.a); glFragColor=vec4(sqrt(tone(col)),1.);
}`
// depth only, for the sun
ShaderStore.ShadersStore.rdepthVertexShader = `
precision highp float; attribute vec3 position; attribute vec2 uv; attribute vec4 xtra;
#include<instancesDeclaration>
uniform mat4 viewProjection; varying float vZ; varying vec3 vU;
void main(){
  #include<instancesVertex>
 gl_Position=viewProjection*finalWorld*vec4(position,1.); vZ=gl_Position.z*.5+.5; vU=vec3(uv,floor(xtra.x*255.+.5)); }`
ShaderStore.ShadersStore.rdepthFragmentShader = `
precision highp float; precision highp sampler2DArray; varying float vZ; varying vec3 vU;
#ifdef CUTOUT
uniform sampler2DArray cutA;
#endif
void main(){
#ifdef CUTOUT
 if(texture(cutA,vec3(vU.x,1.-vU.y,vU.z)).a<.45) discard;
#endif
 glFragColor=vec4(vZ,0.,0.,1.); }`
ShaderStore.ShadersStore.rdepthskinFragmentShader = `precision highp float; void main(){ glFragColor=vec4(gl_FragCoord.z,0.,0.,1.); }`
// water
ShaderStore.ShadersStore.rwaterVertexShader = `
precision highp float; attribute vec3 position; uniform mat4 viewProjection; varying vec3 vW; void main(){ vW=position; gl_Position=viewProjection*vec4(position,1.); }`
ShaderStore.ShadersStore.rwaterFragmentShader = `
precision highp float; precision highp sampler3D; precision highp sampler2DArray; varying vec3 vW; uniform float time; uniform vec3 eye; uniform sampler3D volA; uniform sampler3D volB; uniform vec4 volO; uniform vec4 volS; uniform vec3 sunD; uniform vec3 sunC; uniform vec3 skyC; uniform vec3 gndC; uniform vec3 ambC; uniform vec4 fogC; uniform vec4 fogP; uniform vec4 fadeP; uniform vec4 cutP;
#ifdef FOGWAR
uniform sampler2DArray fowA; uniform vec4 fowP;
#endif
${NOISE}
vec3 tone(vec3 x){ x*=.92; vec3 a=x*(x*2.51+.03), b=x*(x*2.43+.59)+.14; return clamp(a/b,0.,1.); }
#ifdef LOWQ
void main(){ vec3 V=normalize(eye-vW);
#ifdef ORTHO
  V=fadeP.xyz;
#endif
  float lev=floor((vW.y+.6)*.25); vec3 uvw=vec3((vW.x-volO.x)*volS.x,(lev-volO.z+.35)/volO.w,(vW.z-volO.y)*volS.y); vec4 A=texture(volA,uvw); vec2 inb=step(abs(uvw.xz-.5),vec2(.5)); if(inb.x*inb.y<.5) A=vec4(0.,0.,0.,1.); float sk=lev<0.?0.:1.; vec3 irr=A.rgb*A.rgb*volS.z;
  float rip=sin(vW.x*1.9+time*1.1+sin(vW.z*1.3+time*.7)*1.4)*.5+.5; float fr=.06+.5*pow(1.-max(V.y,0.),3.); vec3 col=vec3(.010,.030,.036)*(skyC*sk*1.8+irr*1.6+ambC*2.5)+(skyC*1.3*sk+irr*.5+ambC)*fr*(.9+.2*rip)+sunC*sk*A.a*.004*rip;
#ifdef FOGWAR
  float f=texture(fowA,vec3(vW.xz*fowP.x+.5,lev-fowP.z)).r; col*=smoothstep(.12,.42,f)*(.35+.65*smoothstep(.55,.95,f)); if(f<.12) discard;
#endif
  glFragColor=vec4(sqrt(tone(col)),.88); }
#else
void main(){
  vec2 p=vW.xz; vec2 e=vec2(.12,0.);
#ifdef LOWQ
  vec3 N=normalize(vec3((vn(p*1.3+time*.5)-.5)*.25,1.,(vn(p*1.3-time*.4+9.)-.5)*.25));
#else
  #define WH(q) (vn((q)*1.1+vec2(time*.35,time*.22))*.6+vn((q)*2.7-vec2(time*.5,-time*.31))*.3+vn((q)*6.1+vec2(-time*.7,time*.6))*.12)
  float h0=WH(p); vec3 N=normalize(vec3(h0-WH(p+e.xy),.55,h0-WH(p+e.yx)));
#endif
  vec3 V=normalize(eye-vW);
#ifdef ORTHO
  V=fadeP.xyz;
#endif
  float lev=floor((vW.y+.6)*.25); float fy=clamp(vW.y-lev*4.+.4,.667,3.333); vec3 uvw=vec3((vW.x-volO.x)*volS.x,(lev-volO.z+fy*.25)/volO.w,(vW.z-volO.y)*volS.y); vec4 A=texture(volA,uvw),B=texture(volB,uvw); vec2 inb=step(abs(uvw.xz-.5),vec2(.5)); if(inb.x*inb.y<.5){A=vec4(0.,0.,0.,1.);B=vec4(.5,.5,.5,1.);}
  vec3 irr=A.rgb*A.rgb*volS.z; float fr=.04+.96*pow(1.-max(dot(N,V),0.),4.);
  vec3 R=reflect(-V,N); vec3 env=(skyC*1.5*clamp(R.y*.6+.4,0.,1.))*B.a+irr*.55+ambC; vec3 deep=vec3(.012,.035,.040)*(skyC*B.a*1.6+irr*1.4+ambC*2.+sunC*A.a*.3);
  vec3 H=normalize(V+sunD); vec3 col=mix(deep,env,fr)+sunC*A.a*pow(max(dot(N,H),0.),180.)*2.5; vec3 ld=B.rgb*2.-1.; vec3 H2=normalize(V+normalize(ld+vec3(0.,.001,0.))); col+=irr*pow(max(dot(N,H2),0.),60.)*1.5;
  float al=mix(.72,.96,fr);
#ifdef FOGWAR
  { float lvF=lev-fowP.z; float f=texture(fowA,vec3(vW.xz*fowP.x+.5,lvF)).r; col*=smoothstep(.12,.42,f)*(.35+.65*smoothstep(.55,.95,f)); if(f<.12) al=0.; }
#endif
  float dist=length(vW-eye);
#ifdef ORTHO
  dist=fogP.x;
#endif
  float fg=1.-exp(-pow(dist*fogC.a,1.35)); col=mix(col,fogC.rgb,fg*fogP.y); glFragColor=vec4(sqrt(tone(col)),al); }
#endif
`
// sky dome
ShaderStore.ShadersStore.rskyVertexShader = `precision highp float; attribute vec3 position; uniform mat4 viewProjection; uniform vec3 eye; varying vec3 vD; void main(){ vD=position; vec4 p=viewProjection*vec4(position*200.+eye,1.); gl_Position=p.xyww; }`
ShaderStore.ShadersStore.rskyFragmentShader = `precision highp float; varying vec3 vD; uniform vec3 sunD; uniform vec3 sunC; uniform vec3 zen; uniform vec3 hor; uniform float time; uniform float night; uniform float cloud;
${NOISE}
vec3 tone(vec3 x){ x*=.92; vec3 a=x*(x*2.51+.03), b=x*(x*2.43+.59)+.14; return clamp(a/b,0.,1.); }
void main(){ vec3 d=normalize(vD); float y=max(d.y,0.); vec3 c=mix(hor,zen,pow(y,.45)); float s=max(dot(d,sunD),0.); c+=sunC*(pow(s,900.)*6.+pow(s,24.)*.18+pow(s,4.)*.08)*(1.-night*.75);
  if(night>.4&&d.y>0.){ vec2 q=d.xz/(d.y+.35)*90.; vec2 i=floor(q); float r=h21(i); vec2 f=fract(q)-.5; float st=step(.978,r)*smoothstep(.22,.0,length(f+vec2(r-.5,h21(i+3.)-.5)*.5)); c+=st*smoothstep(.4,.9,night)*(.5+.5*sin(time*2.+r*60.)); }
#ifndef LOWQ
  if(d.y>.02){ vec2 q=d.xz/(d.y+.12)*1.15+time*.006; float n=fbm2(q*1.4); n=smoothstep(.44,.78,n+cloud*.3); float lit=fbm2(q*1.4+sunD.xz*.25); vec3 cc=mix(hor*1.15,zen*.55+hor*.25,clamp(lit*1.2,0.,1.))+sunC*.10*(1.-lit); c=mix(c,cc,n*smoothstep(.02,.22,d.y)*.85); }
#endif
  if(d.y<0.) c=mix(hor,hor*.55,min(1.,-d.y*3.)); glFragColor=vec4(sqrt(tone(c)),1.); }`
// flames, halos, portals, magic circles: camera-facing or oriented quads, additive
ShaderStore.ShadersStore.rfxVertexShader = `
precision highp float; precision highp sampler2DArray; uniform sampler2DArray fowA; uniform vec4 fowP; uniform float fowOn; attribute vec3 position; attribute vec4 fxA; attribute vec4 fxB; attribute vec2 uv; uniform mat4 viewProjection; uniform vec3 eye; uniform vec3 camR; uniform vec3 camU; uniform float time; uniform vec4 cutP; uniform vec4 lvP; varying vec2 vU; varying vec4 vA; varying vec3 vCol; varying float vFog; uniform vec4 fogC;
void main(){ float kind=floor(fxA.w+.5); float s=fxA.x; vec2 q=uv*2.-1.; vec3 p=position; 
 if(kind<1.5){ vec3 r=normalize(vec3(camR.x,0.,camR.z)); vec3 up=vec3(0.,1.,0.); up=normalize(mix(camU,up,clamp(abs(camU.y)*1.5,.0,1.))); p+=r*q.x*s*.55+up*(q.y*.5+.42)*s*1.55; }
 else if(kind<2.5){ float c=cos(fxA.z),n=sin(fxA.z); p+=vec3(c,0.,-n)*q.x*s+vec3(0.,1.,0.)*q.y*s*1.16; }
 else if(kind<3.5){ p+=vec3(q.x,0.,q.y)*s*1.15; }
 else { p+=camR*q.x*s+camU*q.y*s; }
 vU=uv; vA=vec4(fxA.x,fxA.y,fxA.z,kind); vCol=fxB.rgb; float d=length(eye-position); vFog=exp(-d*fogC.a*.8)*smoothstep(.7,2.4,d); if(position.y>cutP.x){ vec2 z=position.xz-cutP.yz; if(dot(z,z)<cutP.w*cutP.w) vFog=0.; } if(position.y<lvP.x||position.y>lvP.y) vFog=0.; if(fowOn>.5){ float lv=floor((position.y+.6)*.25)-fowP.z; float fv=(lv<0.||lv>=fowP.w)?0.:textureLod(fowA,vec3(position.xz*fowP.x+.5,lv),0.).r; vFog*=smoothstep(.42,.9,fv); } gl_Position=viewProjection*vec4(p,1.); if(vFog<=.001) gl_Position=vec4(2.,2.,2.,1.); if(kind>3.5){ gl_Position.z-=.0006*gl_Position.w; } }`
ShaderStore.ShadersStore.rfxFragmentShader = `
precision highp float; varying vec2 vU; varying vec4 vA; varying vec3 vCol; varying float vFog; uniform float time; uniform float gain;
${NOISE}
void main(){ vec2 q=vU*2.-1.; float k=vA.w; vec3 c=vec3(0.); float sd=vA.y*17.;
 if(k<1.5){ float t=time*(k<.5?1.9:.9)+sd; float y=vU.y; float dis=(vn(vec2(q.x*2.2+sd,y*2.6-t*1.6))-.5)*.75*y+(vn(vec2(q.x*5.+sd,y*5.-t*2.6))-.5)*.32*y; if(k>.5) dis*=.35; float x=q.x+dis; float w=(k<.5?.62:.42)*pow(max(1.-y,0.),.62)*smoothstep(0.,.14,y+.04); float f=smoothstep(w,w*.15,abs(x)); float brk=k<.5?vn(vec2(x*3.+sd,y*3.4-t*2.2)):0.6; f*=smoothstep(.05,.5,brk+.72-y*1.1); float core=smoothstep(w*.62,0.,abs(x)+y*.28); c=mix(vec3(1.,.28,.03),vec3(1.,.62,.16),f)*f*1.25+vec3(1.,.86,.5)*core*f*1.1; c*=vCol; }
 else if(k<2.5){ float r=length(q); float a=atan(q.y,q.x); float sw=vn(vec2(a*2.+r*5.-time*1.3,r*4.+time*.4))*.6+vn(vec2(a*4.-r*9.+time*2.,r*7.))*.4; float m=smoothstep(1.,.82,r); c=vCol*(sw*sw*1.9+pow(r,5.)*1.2+.12)*m+vec3(1.)*pow(max(0.,1.-r*1.25),4.)*.4; }
 else if(k<3.5){ float r=length(q); float a=atan(q.y,q.x); float ring=smoothstep(.02,.0,abs(r-.92))+smoothstep(.015,.0,abs(r-.80))+smoothstep(.012,.0,abs(r-.42)); float star=1.; vec2 z=q; float st=0.; for(int i=0;i<5;i++){ float b=float(i)*1.25664+time*.05; vec2 n=vec2(cos(b),sin(b)); st=max(st,smoothstep(.016,.0,abs(dot(z,n)-.25))*step(r,.80)); } float gl=step(.5,vn(vec2(floor(a*9.55)+3.,floor(r*30.))))*smoothstep(.80,.82,r)*smoothstep(.92,.90,r); c=vCol*(ring+st+gl*.7)*(.8+.3*sin(time*2.)); c+=vCol*.10*smoothstep(1.,.3,r); }
 else { float r=length(q); float g=pow(max(0.,1.-r),2.4); c=vCol*g*(.86+.14*sin(time*9.+sd)*sin(time*5.3+sd*2.)); }
 c*=vFog*gain; glFragColor=vec4(c,1.); }`
// drifting specks: dust, rain, snow, embers
ShaderStore.ShadersStore.rmoteVertexShader = `precision highp float; attribute vec3 position; uniform mat4 viewProjection; uniform vec3 eye; uniform vec4 mP; uniform float time; varying float vA; void main(){ vec3 box=vec3(mP.x,mP.x*.6,mP.x); vec3 v=position*box; vec3 sp=mP.y<.5?vec3(.05,.03,.04):mP.y<1.5?vec3(.4,-9.,.2):mP.y<2.5?vec3(.5,-1.1,.3):vec3(.1,.6,.1); v+=sp*time*(.6+fract(position.x*91.)*.8); v.x+=sin(time*.5+position.y*40.)*.35; v=mod(v-eye,box)-box*.5+eye; gl_Position=viewProjection*vec4(v,1.); float d=length(v-eye); vA=smoothstep(box.x*.5,box.x*.2,d)*smoothstep(.3,1.2,d); gl_PointSize=clamp(mP.z/gl_Position.w,1.,9.); }`
ShaderStore.ShadersStore.rmoteFragmentShader = `precision highp float; varying float vA; uniform vec4 mC; uniform vec4 mP; void main(){ vec2 q=gl_PointCoord*2.-1.; float r=length(q); if(mP.y>.5&&mP.y<1.5) r=abs(q.x)*2.5; float a=smoothstep(1.,.2,r)*vA*mC.a; glFragColor=vec4(mC.rgb*a,a); }`
// soft round shadow and selection rings under feet
ShaderStore.ShadersStore.rblobVertexShader = `precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 world; uniform mat4 viewProjection; varying vec2 vU; void main(){ vU=uv*2.-1.; vec4 p=viewProjection*world*vec4(position,1.); p.z-=.0004*p.w; gl_Position=p; }`
ShaderStore.ShadersStore.rblobFragmentShader = `precision highp float; varying vec2 vU; uniform vec4 col; uniform vec2 kind; void main(){ float r=length(vU); float a; if(kind.x<.5){ a=smoothstep(1.,.1,r); a*=a; } else { a=smoothstep(1.,.95,r)*smoothstep(.80,.86,r)+smoothstep(.80,.1,r)*.10; } if(a<.003) discard; glFragColor=vec4(col.rgb,col.a*a); }`
// editor: selection rectangle and the five-foot grid
ShaderStore.ShadersStore.rrectVertexShader = `precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 world; uniform mat4 viewProjection; varying vec2 vU; void main(){ vU=uv; gl_Position=viewProjection*world*vec4(position,1.); }`
ShaderStore.ShadersStore.rrectFragmentShader = `precision highp float; varying vec2 vU; uniform vec4 col; uniform vec4 dim; void main(){ vec2 d=min(vU,1.-vU)*dim.xy; float e=min(d.x,d.y); float a=smoothstep(.09,.05,e)*.95+.13; vec2 c=min(d.x,d.y)<.0?vec2(1.):vec2(0.); float cr=step(max(d.x,d.y),.45)*smoothstep(.16,.12,e); a=max(a,cr); glFragColor=vec4(col.rgb,a*col.a); }`
ShaderStore.ShadersStore.rgridVertexShader = `precision highp float; attribute vec3 position; uniform mat4 world; uniform mat4 viewProjection; varying vec2 vW; void main(){ vec4 w=world*vec4(position,1.); vW=w.xz; vec4 p=viewProjection*w; p.z-=.0002*p.w; gl_Position=p; }`
ShaderStore.ShadersStore.rgridFragmentShader = `precision highp float; varying vec2 vW; uniform vec4 cen; uniform vec4 col; void main(){ vec2 q=vW/cen.w; vec2 f=abs(fract(q-.5)-.5)/fwidth(q); float l=1.-min(min(f.x,f.y),1.); vec2 q5=q/5.; vec2 f5=abs(fract(q5-.5)-.5)/fwidth(q5); float l5=1.-min(min(f5.x,f5.y)*.6,1.); float d=length(vW-cen.xy)/cen.z; float a=max(l*.6,l5)*col.a*smoothstep(1.,.5,d); if(a<.004) discard; glFragColor=vec4(col.rgb,a); }`
// Babylon's preprocessor splits on semicolons even inside comments, so drop comments first
for (const k of Object.keys(ShaderStore.ShadersStore)) if (/^r(ealm|skin|depth|water|sky|fx|mote|blob|rect|grid)/.test(k)) ShaderStore.ShadersStore[k] = ShaderStore.ShadersStore[k].replace(/\/\/[^\n]*/g, '')
