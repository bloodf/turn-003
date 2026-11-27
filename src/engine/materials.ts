import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Vector3, Vector4, Matrix } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Constants } from '@babylonjs/core/Engines/constants'
import type { Scene } from '@babylonjs/core/scene'
import type { BaseTexture } from '@babylonjs/core/Materials/Textures/baseTexture'
import './shaders'
import type { Textures, VolumeTex } from './textures'
import type { Quality } from './quality'
import { BIOMES, type BiomeId } from '../core/defs'
export type Base = 'solid' | 'cut' | 'terr' | 'water' | 'skin' | 'door'
export interface Flags { flat: boolean; cut: boolean; fow: boolean }
export const BONES = 32
const U = ['world', 'viewProjection', 'time', 'eye', 'wind', 'volO', 'volS', 'sunD', 'sunC', 'skyC', 'gndC', 'ambC', 'fogC', 'fogP', 'metalT', 'cutP', 'selC', 'fadeP', 'terL', 'terS', 'plP', 'plC', 'fowP', 'shM', 'shP', 'bn', 'litU', 'litV']
export class Globals {
  time = 0; eye = new Vector3(); sunD = new Vector3(0, 1, 0); sunC = new Color3(1, 1, 1); skyC = new Color3(.3, .4, .6); gndC = new Color3(.2, .2, .2); ambC = new Color3(.05, .05, .05); fog = new Vector4(0, 0, 0, .01); fogP = new Vector4(0, 1, 0, 0); cutP = new Vector4(1e6, 0, 0, 0); viewD = new Vector4(0, 1, 0, 0); fow = new Vector4(1 / 288, 0, 0, 1); wind = new Vector4(1, 0, 0, 0); flicker = .07
  plP: number[] = []; plC: number[] = []; shM = Matrix.Identity(); shP = new Vector4(1 / 2048, .0006, 0, 0)
}
export class Materials {
  private cache = new Map<string, ShaderMaterial>(); g = new Globals(); fowTex: BaseTexture | null = null; shTex: BaseTexture | null = null; private metal: number[]; sampler: ((x: number, y: number, z: number, o: Float32Array) => void) | null = null; private buf = new Float32Array(8); biome: BiomeId = 'temperate'; private L: Record<string, number>
  constructor(private scene: Scene, private tex: Textures, private vol: VolumeTex, private q: Quality) { this.metal = tex.layers.map(l => l.metal); while (this.metal.length < 64) this.metal.push(0); this.L = Object.fromEntries(tex.layers.map((l, i) => [l.name, i])) }
  get(base: Base, f: Flags): ShaderMaterial {
    const key = `${base}|${+f.flat}${+f.cut}${+f.fow}`; let m = this.cache.get(key); if (m) return m; const q = this.q, d: string[] = []
    if (q.normal) d.push('#define NORMALMAP'); if (q.spec) d.push('#define SPECULAR'); if (q.dither) d.push('#define DITHER'); if (this.tex.bc) d.push('#define BCDATA'); if (q.tier === 'low') d.push('#define LOWQ', '#define LITVERT'); if (f.flat) d.push('#define ORTHO'); if (f.cut && base !== 'terr') d.push('#define CUTAWAY'); if (f.fow) d.push('#define FOGWAR'); if (base === 'cut') d.push('#define CUTOUT', '#define WIND', '#define TWOSIDE'); if (base === 'solid' && q.tier !== 'low') d.push('#define WIND'); if (base === 'skin' || base === 'door') d.push('#define LITUNI'); if (base === 'terr') d.push('#define TERRAIN'); if (base === 'skin') d.push('#define SKINNED', `#define NB ${BONES}`); if (q.shadow) d.push('#define SUNSHADOW'); d.push(`#define NPL ${q.pl}`, `#define LAVA ${this.L.lava}`, `#define RUNE ${this.L.rune}`)
    const sam = ['albA', 'datA', 'volA', 'volB', 'cutA', 'fowA', 'shA']; const attr = base === 'water' ? ['position'] : ['position', 'normal', 'uv', 'tint', 'xtra']; if (base === 'skin') attr.push('bi', 'bw'); else if (q.tier === 'low' && base !== 'water' && base !== 'door') attr.push('lit')
    const low = q.tier === 'low', fr = low ? 'realmlo' : 'realm'; const sh = base === 'water' ? 'rwater' : { vertex: base === 'skin' ? 'rskin' : 'realm', fragment: fr }
    m = new ShaderMaterial('rw:' + key, this.scene, sh as any, { attributes: attr, uniforms: U, samplers: sam, defines: d, needAlphaBlending: base === 'water' })
    m.backFaceCulling = base !== 'cut' && base !== 'water' && !(f.cut && base !== 'terr'); if (base === 'water') m.disableDepthWrite = true; m.onError = (_e, err) => console.error('[shader]', key, err)
    m.sideOrientation = 1
    if (base === 'water') m.alphaMode = Constants.ALPHA_COMBINE
    if (q.tier === 'low' && (base === 'skin' || base === 'door')) { const mm = m; mm.onBindObservable.add(mesh => { const e = mm.getEffect(); if (!e || !mesh || !this.sampler) return; const p = (mesh as any).position; this.sampler(p.x, p.y + .9, p.z, this.buf); const b = this.buf, g = this.g; e.setFloat4('litU', b[0] + (g.skyC.r * .8 + g.gndC.r * .2) * b[4] + g.ambC.r, b[1] + (g.skyC.g * .8 + g.gndC.g * .2) * b[4] + g.ambC.g, b[2] + (g.skyC.b * .8 + g.gndC.b * .2) * b[4] + g.ambC.b, b[3]); e.setFloat4('litV', b[5], b[6], b[7], 0) }) }
    this.cache.set(key, m); this.bind(m, base, f, true); return m
  }
  private bind(m: ShaderMaterial, base: Base, f: Flags, first: boolean) {
    const g = this.g; if (base !== 'water') { m.setTexture('albA', this.tex.alb); if (this.q.normal) m.setTexture('datA', this.tex.dat); if (base === 'cut') m.setTexture('cutA', this.tex.cut); if (first) m.setFloats('metalT', this.metal) }
    m.setTexture('volA', this.vol.A); m.setTexture('volB', this.vol.B); if (f.fow && this.fowTex) m.setTexture('fowA', this.fowTex); if (this.q.shadow && this.shTex && base !== 'water') m.setTexture('shA', this.shTex)
    m.setFloat('time', g.time); m.setVector3('eye', g.eye); m.setVector4('wind', g.wind); m.setVector4('volO', new Vector4(...this.vol.org)); m.setVector4('volS', new Vector4(this.vol.inv[0], this.vol.inv[1], 5, g.flicker)); m.setVector3('sunD', g.sunD); m.setColor3('sunC', g.sunC); m.setColor3('skyC', g.skyC); m.setColor3('gndC', g.gndC); m.setColor3('ambC', g.ambC); m.setVector4('fogC', g.fog); m.setVector4('fogP', g.fogP); m.setVector4('cutP', g.cutP); m.setVector4('fadeP', g.viewD); m.setVector4('fowP', g.fow); m.setMatrix('shM', g.shM); m.setVector4('shP', g.shP); if (first) m.setColor3('selC', new Color3(0, 0, 0))
    if (base === 'terr') { const B = BIOMES[this.biome].layers; m.setVector4('terL', new Vector4(...(B.map(n => this.L[n]) as [number, number, number, number]))); m.setVector4('terS', new Vector4(...(B.map(n => this.tex.layers[this.L[n]].scale) as [number, number, number, number]))) }
    const n = this.q.pl; if (n && base !== 'water') { while (g.plP.length < n * 4) g.plP.push(0); while (g.plC.length < n * 4) g.plC.push(0); m.setArray4('plP', g.plP.slice(0, n * 4)); m.setArray4('plC', g.plC.slice(0, n * 4)) }
  }
  sync(active: Flags) { for (const [k, m] of this.cache) { const [b, f] = k.split('|'); const fl = { flat: f[0] === '1', cut: f[1] === '1', fow: f[2] === '1' }; if (fl.flat === active.flat && fl.cut === active.cut && fl.fow === active.fow) this.bind(m, b as Base, fl, false) } }
  all() { return [...this.cache.values()] }
  dispose() { for (const m of this.cache.values()) m.dispose(); this.cache.clear() }
}
