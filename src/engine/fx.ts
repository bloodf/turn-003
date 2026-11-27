import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Constants } from '@babylonjs/core/Engines/constants'
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder'
import type { Scene } from '@babylonjs/core/scene'
import type { Engine } from '@babylonjs/core/Engines/engine'
import type { World } from '../core/world'
import type { Globals } from './materials'
import type { Quality } from './quality'
import { model } from '../core/catalog'
import { BIOMES } from '../core/defs'
import { sunDir } from '../core/light'
const KIND: Record<string, number> = { fire: 0, candle: 1, portal: 2, circle: 3, halo: 4 }
export class Fx {
  private flames: Mesh | null = null; fmat: ShaderMaterial; dome: Mesh; smat: ShaderMaterial; motes: Mesh | null = null; mmat: ShaderMaterial; night = 0; zen = new Color3(); hor = new Color3(); outdoor = true; fowTex: any = null; fowOn = false
  constructor(private scene: Scene, private engine: Engine, private q: Quality) {
    this.fmat = new ShaderMaterial('fx', scene, 'rfx', { attributes: ['position', 'uv', 'fxA', 'fxB'], uniforms: ['viewProjection', 'eye', 'camR', 'camU', 'time', 'fogC', 'cutP', 'gain', 'lvP', 'fowP', 'fowOn'], samplers: ['fowA'], needAlphaBlending: true }); this.fmat.alphaMode = Constants.ALPHA_ONEONE; this.fmat.disableDepthWrite = true; this.fmat.backFaceCulling = false
    const d = q.tier === 'low' ? ['#define LOWQ'] : []; this.smat = new ShaderMaterial('sky', scene, 'rsky', { attributes: ['position'], uniforms: ['viewProjection', 'eye', 'sunD', 'sunC', 'zen', 'hor', 'time', 'night', 'cloud'], defines: d }); this.smat.backFaceCulling = false; this.smat.disableDepthWrite = true
    this.dome = CreateSphere('dome', { segments: 10, diameter: 2 }, scene); this.dome.material = this.smat; this.dome.alwaysSelectAsActiveMesh = true; this.dome.isPickable = false; this.dome.renderingGroupId = 0; this.dome.alphaIndex = -1
    this.mmat = new ShaderMaterial('mote', scene, 'rmote', { attributes: ['position'], uniforms: ['viewProjection', 'eye', 'mP', 'mC', 'time'], needAlphaBlending: true }); this.mmat.alphaMode = Constants.ALPHA_ONEONE; this.mmat.disableDepthWrite = true; this.mmat.pointsCloud = true; this.mmat.backFaceCulling = false
    const n = Math.max(q.motes, 260), p = new Float32Array(n * 3); let s = 7; for (let i = 0; i < n * 3; i++) { s = (s * 16807) % 2147483647; p[i] = s / 2147483647 } this.motes = new Mesh('motes', scene); this.motes.setVerticesBuffer(new VertexBuffer(engine, p, 'position', false, false, 3)); this.motes.setIndices([...Array(n).keys()]); this.motes.material = this.mmat; this.motes.alwaysSelectAsActiveMesh = true; this.motes.isPickable = false; this.motes.alphaIndex = 30
  }
  /** rebuild the single mesh that holds every flame in the world */
  build(w: World) {
    this.flames?.dispose(); this.flames = null; const P: number[] = [], U: number[] = [], A: number[] = [], B: number[] = [], I: number[] = []; let n = 0
    const quad = (x: number, y: number, z: number, size: number, kind: number, rot: number, c: number[]) => { const seed = (n * .37) % 1, b = n * 4; for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]]) { P.push(x, y, z); U.push(u, v); A.push(size, seed, rot, kind); B.push(c[0], c[1], c[2], 1) } I.push(b, b + 1, b + 2, b, b + 2, b + 3); n++ }
    for (const p of w.props.values()) { const m = model(p.m); if (!m || (!m.fx.length && !m.light)) continue; const c = Math.cos(p.r), s = Math.sin(p.r); const at = (q: number[]) => [p.x + (q[0] * c + q[2] * s) * p.s, p.y + q[1] * p.s, p.z + (-q[0] * s + q[2] * c) * p.s]
      for (const f of m.fx) { const [x, y, z] = at(f.p); quad(x, y, z, f.s * p.s, KIND[f.k] ?? 0, p.r, f.c ?? (f.k === 'fire' || f.k === 'candle' ? [1, 1, 1] : [1, .5, .2])) }
      if (m.light && this.q.halos) { const [x, y, z] = at(m.light.p), L = m.light, k = L.i * .085; quad(x, y, z, .55 + L.i * .85, 4, 0, [L.c[0] * k, L.c[1] * k, L.c[2] * k]) } }
    if (!n) return; const m = new Mesh('flames', this.scene); m.setVerticesBuffer(new VertexBuffer(this.engine, new Float32Array(P), 'position', false, false, 3)); m.setVerticesBuffer(new VertexBuffer(this.engine, new Float32Array(U), 'uv', false, false, 2)); m.setVerticesBuffer(new VertexBuffer(this.engine, new Float32Array(A), 'fxA', false, false, 4)); m.setVerticesBuffer(new VertexBuffer(this.engine, new Float32Array(B), 'fxB', false, false, 4)); m.setIndices(n * 4 < 65536 ? new Uint16Array(I) as any : new Uint32Array(I)); m.material = this.fmat; m.alwaysSelectAsActiveMesh = true; m.isPickable = false; m.alphaIndex = 20; m.freezeWorldMatrix(); this.flames = m
  }
  /** sun, sky and fog from the hour, biome and theme */
  atmosphere(w: World, g: Globals, theme: { fog: number[]; amb: number[]; fogD: number }, underground: number) {
    const t = w.env.time, B = BIOMES[w.env.biome]; const d = sunDir(t); const e = Math.sin((t - 6) / 12 * Math.PI); const day = Math.max(0, Math.min(1, (e + .24) / .5)), warm = Math.max(0, 1 - Math.abs(e) * 2.6) * day; this.night = 1 - day; const wet = w.env.weather === 'rain' || w.env.weather === 'fog' ? .45 : w.env.weather === 'snow' ? .75 : 1
    const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k); const sunc = mix(B.sun, [1.25, .55, .22], warm).map(v => v * (2.15 * Math.min(1, Math.max(0, e * 4 + .12))) * wet ** 1.3); const moon = [.30, .40, .62].map(v => v * this.night)
    if (e > -.03) { g.sunD.set(d[0], d[1], d[2]); g.sunC.set(sunc[0], sunc[1], sunc[2]) } else { const md = sunDir(((t + 12) % 24)); g.sunD.set(md[0], md[1], md[2]); g.sunC.set(moon[0], moon[1], moon[2]) }
    let zen = mix(B.sky.map(v => v * .8), [.17, .22, .36], this.night), hor = mix(mix(B.horizon as any, [1.0, .50, .22], warm * .75), [.21, .25, .37], this.night); if (wet < 1) { const gr = .92 * day + .08; zen = mix(zen, [gr * .8, gr * .85, gr * .95], .75); hor = mix(hor, [gr, gr * 1.03, gr * 1.08], .75) }
    this.zen.set(zen[0] * zen[0] * .9, zen[1] * zen[1] * .9, zen[2] * zen[2] * .95); this.hor.set(hor[0] * hor[0] * .9, hor[1] * hor[1] * .9, hor[2] * hor[2] * .9)
    const k = underground; g.skyC.set((zen[0] * .5 + hor[0] * .5) * .62 * (1.9 - .9 * day), (zen[1] * .5 + hor[1] * .5) * .62 * (1.9 - .9 * day), (zen[2] * .55 + hor[2] * .45) * .70 * (2.0 - 1.0 * day)); g.gndC.set(g.skyC.r * .5 + sunc[0] * .05, g.skyC.g * .46 + sunc[1] * .05, g.skyC.b * .36 + sunc[2] * .04)
    const am = w.env.ambMul; g.ambC.set((theme.amb[0] * k + .012 * (1 - k)) * am, (theme.amb[1] * k + .012 * (1 - k)) * am, (theme.amb[2] * k + .015 * (1 - k)) * am)
    const of = [this.hor.r, this.hor.g, this.hor.b], dens = (w.env.weather === 'fog' ? .022 : w.env.weather === 'clear' ? .0027 : .0075); const fc = mix(of, theme.fog, k); g.fog.set(fc[0], fc[1], fc[2], (dens * (1 - k) + theme.fogD * k) * w.env.fogMul)
  }
  frame(g: Globals, camR: Vector3, camU: Vector3, w: World | null, showSky: boolean, flat: boolean, gain: number, lmin: number, lmax: number) {
    const c4 = g.fog; const f = this.fmat; f.setVector3('eye', g.eye); f.setVector3('camR', camR); f.setVector3('camU', camU); f.setFloat('time', g.time); f.setVector4('fogC', flat ? new Vector4(0, 0, 0, 0) : c4); f.setVector4('cutP', g.cutP); f.setFloat('gain', gain); if (this.fowTex) { f.setTexture('fowA', this.fowTex); f.setVector4('fowP', g.fow) } f.setFloat('fowOn', this.fowOn && this.fowTex ? 1 : 0); f.setVector4('lvP', new Vector4(lmin, lmax, 0, 0))
    this.dome.setEnabled(showSky); if (showSky) { const s = this.smat; s.setVector3('eye', g.eye); s.setVector3('sunD', g.sunD); s.setColor3('sunC', g.sunC); s.setColor3('zen', this.zen); s.setColor3('hor', this.hor); s.setFloat('time', g.time); s.setFloat('night', this.night); s.setFloat('cloud', w && w.env.weather !== 'clear' ? .8 : 0) }
    const wx = w?.env.weather ?? 'clear'; const kind = this.outdoor ? (wx === 'rain' ? 1 : wx === 'snow' ? 2 : 0) : 0; const on = !flat && (kind > 0 || (this.q.motes > 0 && !this.outdoor)); this.motes!.setEnabled(on); if (on) { const m = this.mmat; m.setVector3('eye', g.eye); m.setFloat('time', g.time); m.setVector4('mP', new Vector4(kind ? 26 : 9, kind, kind === 1 ? 26 : kind === 2 ? 34 : 9, 0)); m.setVector4('mC', kind === 1 ? new Vector4(.5, .56, .62, .35) : kind === 2 ? new Vector4(.9, .92, .95, .55) : new Vector4(.9, .75, .5, .16)) }
  }
  hasFlames() { return this.flames }
  dispose() { this.flames?.dispose(); this.dome.dispose(); this.motes?.dispose(); this.fmat.dispose(); this.smat.dispose(); this.mmat.dispose() }
}
void Color4
