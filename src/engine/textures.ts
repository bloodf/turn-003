import { RawTexture2DArray } from '@babylonjs/core/Materials/Textures/rawTexture2DArray'
import { RawTexture3D } from '@babylonjs/core/Materials/Textures/rawTexture3D'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Constants } from '@babylonjs/core/Engines/constants'
import type { Scene } from '@babylonjs/core/scene'
import type { Engine } from '@babylonjs/core/Engines/engine'
import '@babylonjs/core/Engines/Extensions/engine.rawTexture'
import type { Quality } from './quality'
import type { Volume } from '../core/light'
export interface LayerInfo { name: string; scale: number; metal: number; glow: number; avg: number[]; avd: number[] }
/** All materials live in two texture arrays. Layers stream in; until then a layer shows its average colour. */
export class Textures {
  alb!: RawTexture2DArray; dat!: RawTexture2DArray; cut!: RawTexture2DArray; layers: LayerInfo[] = []; bc = false; size: number; private mips: number; private workers: Worker[] = []; private state = new Map<string, number>(); private gl: WebGL2RenderingContext; pending = 0; done = 0; bad = 0; onProgress: () => void = () => { }
  private wi = 0; private hiLeft = 0; private fmtA = 0; private fmtD = 0; cutReady = false
  constructor(private scene: Scene, private engine: Engine, private q: Quality, private base: string) { this.size = q.tex; this.mips = Math.log2(q.tex) + 1; this.gl = (engine as any)._gl }
  async init() {
    this.layers = await fetch(this.base + 'tex/layers.json').then(r => r.json()); const gl = this.gl, n = this.layers.length, ext = !this.q.software && this.size >= 1024 ? gl.getExtension('WEBGL_compressed_texture_s3tc') : null; this.bc = !!ext
    if (this.size >= 1024 && !ext) { this.size = 512; this.mips = 10 }   // never spend 600 MB of phone memory
    this.fmtA = ext ? ext.COMPRESSED_RGB_S3TC_DXT1_EXT : gl.RGBA8; this.fmtD = ext ? ext.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.RGBA8
    this.alb = this.array(n, this.size, this.mips, this.fmtA, this.layers.map(l => l.avg), true); this.dat = this.array(this.q.normal ? n : 1, this.q.normal ? this.size : 4, this.q.normal ? this.mips : 3, this.q.normal ? this.fmtD : gl.RGBA8, this.layers.map(l => l.avd), false)
    const cs = this.size >= 512 ? 512 : 256; this.cut = this.array(12, cs, Math.log2(cs) + 1, gl.RGBA8, Array(12).fill([60, 80, 40]), true)
    const W = this.q.mobile || this.q.software ? 1 : 3; for (let i = 0; i < W; i++) { const w = new Worker(new URL('./texworker.ts', import.meta.url), { type: 'module' }); w.onmessage = e => this.got(e.data); this.workers.push(w) }
    this.workers[0].postMessage({ t: 'cut', base: this.base, size: cs })
  }
  private array(depth: number, size: number, mips: number, fmt: number, avg: number[][], color: boolean) {
    const gl = this.gl; const t = new RawTexture2DArray(new Uint8Array(4 * depth), 1, 1, depth, Constants.TEXTUREFORMAT_RGBA, this.scene, false, false, Texture.TRILINEAR_SAMPLINGMODE); const h = (t as any)._texture._hardwareTexture.underlyingResource as WebGLTexture
    this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, (t as any)._texture, true)
    // re-specify the storage: mutable, so every level is allocated here
    for (let m = 0; m < mips; m++) { const s = Math.max(1, size >> m); if (fmt === gl.RGBA8) { const b = new Uint8Array(s * s * 4 * depth); for (let l = 0; l < depth; l++) { const a = avg[l], o = l * s * s * 4; for (let i = 0; i < s * s; i++) { b[o + i * 4] = a[0]; b[o + i * 4 + 1] = a[1]; b[o + i * 4 + 2] = a[2]; b[o + i * 4 + 3] = color ? 255 : a[3] } } gl.texImage3D(gl.TEXTURE_2D_ARRAY, m, gl.RGBA8, s, s, depth, 0, gl.RGBA, gl.UNSIGNED_BYTE, b) } else { const bw = Math.max(1, s >> 2), B = fmt === this.fmtA ? 8 : 16, b = new Uint8Array(bw * bw * B * depth), dv = new DataView(b.buffer); for (let l = 0; l < depth; l++) { const a = avg[l]; const c = color ? [a[0], a[1], a[2]] : [a[3], a[1], a[2]]; const v = ((c[0] >> 3) << 11) | ((c[1] >> 2) << 5) | (c[2] >> 3); for (let k = 0; k < bw * bw; k++) { let o = (l * bw * bw + k) * B; if (B === 16) { b[o] = a[0]; b[o + 1] = a[0]; o += 8 } dv.setUint16(o, v, true); dv.setUint16(o + 2, v, true) } } gl.compressedTexImage3D(gl.TEXTURE_2D_ARRAY, m, fmt, s, s, depth, 0, b) } }
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, this.q.tier === 'low' ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LEVEL, mips - 1); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT)
    const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an && this.q.tier !== 'low') gl.texParameterf(gl.TEXTURE_2D_ARRAY, an.TEXTURE_MAX_ANISOTROPY_EXT, this.q.tier === 'medium' ? 2 : 8)
    this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, null, true); const it = (t as any)._texture; it.width = it.height = it.baseWidth = it.baseHeight = size; it.generateMipMaps = true; t.wrapU = t.wrapV = Texture.WRAP_ADDRESSMODE; t.anisotropicFilteringLevel = 1; void h; return t
  }
  /** ask for layers by name; those used by the world first */
  want(names: Iterable<string>) {
    for (const n of names) { const i = this.layers.findIndex(l => l.name === n); if (i < 0 || this.state.get(n)) continue; this.state.set(n, 1); this.pending++; const lo = this.size <= 512 || this.bc; this.post({ t: 'layer', base: this.base, name: n, layer: i, lo, size: Math.min(512, this.size), data: this.q.normal, bc: this.bc }) }
  }
  private post(m: any) { this.workers[this.wi++ % this.workers.length].postMessage(m) }
  private got(m: any) {
    const gl = this.gl
    if (m.t === 'cut') { this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, (this.cut as any)._texture, true); this.unpack(); m.out.forEach((C: Uint8Array[], l: number) => C.forEach((b, k) => { const s = Math.max(1, m.n >> k); gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, k, 0, 0, l, s, s, 1, gl.RGBA, gl.UNSIGNED_BYTE, b) })); this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, null, true); this.cutReady = true; this.done++; return }
    if (m.t === 'err') { this.bad++; console.error('[texture]', m.name ?? 'cutouts', m.msg); this.pending = Math.max(0, this.pending - 1); this.state.delete(m.name); this.onProgress(); return }
    this.done++; const off = Math.log2(this.size / m.w); this.up(this.alb, m.C, m.layer, off, this.fmtA); if (m.D) this.up(this.dat, m.D, m.layer, off, this.fmtD)
    if (off === 1) { // have the small version; show it in mip 0 too by upscaling blocks until the big one lands
      this.post({ t: 'layer', base: this.base, name: m.name, layer: m.layer, lo: false, size: 1024, data: this.q.normal, bc: this.bc, only0: true }); if (this.hiLeft++ === 0) this.baseLevel(1) }
    if (m.lo || off !== 0 || this.size <= 512) { this.pending = Math.max(0, this.pending - 1) } else if (--this.hiLeft <= 0) { this.hiLeft = 0; this.baseLevel(0) }
    this.onProgress()
  }
  private unpack() { (this.engine as any)._unpackFlipY(false); this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0); this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 4) }
  /** while the 1024s are still on their way, sample from the half-size level down */
  private baseLevel(v: number) { const gl = this.gl; for (const t of [this.alb, this.dat]) { this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, (t as any)._texture, true); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_BASE_LEVEL, v) } this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, null, true) }
  private up(t: RawTexture2DArray, C: Uint8Array[], layer: number, off: number, fmt: number) {
    const gl = this.gl; this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, (t as any)._texture, true); this.unpack()
    C.forEach((b, k) => { const m = k + off, s = Math.max(1, this.size >> m); if (m >= this.mips) return; if (fmt === gl.RGBA8) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, m, 0, 0, layer, s, s, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); else gl.compressedTexSubImage3D(gl.TEXTURE_2D_ARRAY, m, 0, 0, layer, s, s, 1, fmt, b) })
    this.engine._bindTextureDirectly(gl.TEXTURE_2D_ARRAY, null, true)
  }
  dispose() { this.workers.forEach(w => w.terminate()); this.alb?.dispose(); this.dat?.dispose(); this.cut?.dispose() }
}
export class VolumeTex {
  A: RawTexture3D; B: RawTexture3D; org: [number, number, number, number] = [0, 0, 0, 1]; inv: [number, number] = [1, 1]; key = ''
  constructor(private scene: Scene) { this.A = this.mk(1, 1, 1, new Uint8Array([0, 0, 0, 255])); this.B = this.mk(1, 1, 1, new Uint8Array([128, 128, 128, 255])) }
  private mk(w: number, h: number, d: number, b: Uint8Array) { const t = new RawTexture3D(b, w, h, d, Constants.TEXTUREFORMAT_RGBA, this.scene, false, false, Texture.BILINEAR_SAMPLINGMODE); t.wrapU = t.wrapV = t.wrapR = Texture.CLAMP_ADDRESSMODE; return t }
  set(v: Volume): boolean { const k = `${v.w},${v.h},${v.d}`; this.org = [v.x0, v.z0, v.l0, v.nl]; this.inv = [1 / (v.w * .75), 1 / (v.d * .75)]; if (k === this.key) { this.A.update(v.A); this.B.update(v.B); return false } this.key = k; this.A.dispose(); this.B.dispose(); this.A = this.mk(v.w, v.h, v.d, v.A); this.B = this.mk(v.w, v.h, v.d, v.B); return true }
}
