import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Vector4, Vector2 } from '@babylonjs/core/Maths/math.vector'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import { BoundingInfo } from '@babylonjs/core/Culling/boundingInfo'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Constants } from '@babylonjs/core/Engines/constants'
import type { Scene } from '@babylonjs/core/scene'
import type { Engine } from '@babylonjs/core/Engines/engine'
import { BONES, type Materials, type Flags } from './materials'
import { compose, lookKey, partsOf, recolour, type Geo, type HeroLook, type Sources } from './compose'
import type { Token } from '../core/world'
export interface CharDef { id: string; label: string; kind: 'hero' | 'folk' | 'foe' | 'beast' | 'part'; side: 'hero' | 'foe' | 'npc'; rig: string; size: number; bones: string[]; joints: [number, [number, number, number]][]; lo: number[]; hi: number[]; lod: any[]; light: any; pose?: string; o?: number[] }
let DEFS: CharDef[] = [], BY = new Map<string, CharDef>()
export const charDefs = () => DEFS.filter(d => d.kind !== 'part')
export const charDef = (id: string) => BY.get(id)
const half = new Float32Array(65536); for (let i = 0; i < 65536; i++) { const s = i >> 15 ? -1 : 1, e = (i >> 10) & 31, m = i & 1023; half[i] = e === 0 ? s * m * 2 ** -24 : e === 31 ? 0 : s * (1 + m / 1024) * 2 ** (e - 15) }
/** how a token should look */
export interface Look { model: string; hero?: HeroLook; color?: string; scale?: number }
export type Anim = 'attack' | 'shoot' | 'cast' | 'hurt' | 'die' | 'rise' | 'cheer'
export interface Actor { id: string; key: string; def: CharDef; mesh: Mesh; far: Mesh | null; x: number; y: number; z: number; yaw: number; tx: number; ty: number; tz: number; tyaw: number; v: number; phase: number; t: number; atk: number; act: Anim; hurt: number; dead: number; R: Float32Array; M: Float32Array; blob: Mesh; ring: Mesh | null; sel: number; scale: number; sx: number; local: boolean; hidden: boolean; ghost: boolean; guard: number; crouch: number; fight: boolean; sneak: boolean; lit: boolean }
export class Actors {
  map = new Map<string, Actor>(); private files = new Map<string, Promise<ArrayBuffer>>(); private raw = new Map<string, ArrayBuffer>(); private geos = new Map<string, Geo>(); private bases = new Map<string, { near: Mesh; far: Mesh | null; def: CharDef; sx: number; sy: number }>(); private making = new Map<string, Promise<any>>(); private blobM: ShaderMaterial; private ringM = new Map<string, ShaderMaterial>(); private flags: Flags = { flat: false, cut: false, fow: false }; private plane: Mesh; ready = false; private avg: Record<string, number[]> = {}; private layers: string[] = []; onReady: () => void = () => { }
  /** set by the session: what a token looks like */
  look: (t: Token) => Look = t => ({ model: t.m })
  constructor(private scene: Scene, private engine: Engine, private mats: Materials, private base: string) {
    this.plane = CreateGround('plane', { width: 1, height: 1 }, scene); this.plane.setEnabled(false); this.blobM = this.ringMat('blob', [0, 0, 0, .62], 0)
  }
  private ringMat(k: string, c: number[], kind: number) { let m = this.ringM.get(k); if (!m) { m = new ShaderMaterial(k, this.scene, 'rblob', { attributes: ['position', 'uv'], uniforms: ['world', 'viewProjection', 'col', 'kind'], needAlphaBlending: true }); m.setVector4('col', new Vector4(c[0], c[1], c[2], c[3])); m.setVector2('kind', new Vector2(kind, 0)); m.disableDepthWrite = true; m.backFaceCulling = false; m.alphaMode = Constants.ALPHA_COMBINE; this.ringM.set(k, m) } return m }
  async load() { const [man, avg, layers] = await Promise.all([fetch(this.base + 'assets/chars.json').then(r => r.json()), fetch(this.base + 'tex/avg.json').then(r => r.json()), fetch(this.base + 'tex/layers.json').then(r => r.json())]); DEFS = man; BY = new Map(DEFS.map(d => [d.id, d])); this.avg = avg; this.layers = layers.map((l: any) => l.name); this.ready = true }
  /** fetch one creature's geometry, once */
  private file(id: string): Promise<ArrayBuffer> { let p = this.files.get(id); if (!p) { p = fetch(this.base + 'assets/c/' + id + '.bin').then(async r => { if (!r.ok) throw new Error('missing ' + id); const bin = await r.arrayBuffer(), u = new Uint8Array(bin); const raw = u[0] === 0x1f && u[1] === 0x8b ? await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() : bin; this.raw.set(id, raw); return raw }); this.files.set(id, p); p.catch(() => this.files.delete(id)) } return p }
  private geo(id: string, lod = 0): Geo {
    const k = id + ':' + lod; let g = this.geos.get(k); if (g) return g; const d = BY.get(id)!, raw = this.raw.get(id)!, L = d.lod[lod] ?? d.lod[0]; const q = new Uint16Array(raw, L.p, L.nv * 4), p = new Float32Array(L.nv * 3); for (let i = 0; i < L.nv; i++) for (let k2 = 0; k2 < 3; k2++) p[i * 3 + k2] = d.lo[k2] + q[i * 4 + k2] / 65535 * (d.hi[k2] - d.lo[k2]); const hu = new Uint16Array(raw, L.u, L.nv * 2), u = new Float32Array(L.nv * 2); for (let i = 0; i < u.length; i++) u[i] = half[hu[i]]
    g = { nv: L.nv, p, n: new Int8Array(raw, L.n, L.nv * 4).slice(), u, c: new Uint8Array(raw, L.c, L.nv * 4).slice(), x: new Uint8Array(raw, L.x, L.nv * 4).slice(), bi: new Uint8Array(raw, L.bi, L.nv * 4).slice(), bw: new Uint8Array(raw, L.bw, L.nv * 4).slice(), i: new Uint16Array(raw, L.i, L.ni - L.nc).slice() }; this.geos.set(k, g); return g
  }
  private meshOf(g: Geo, name: string): Mesh { const m = new Mesh(name, this.scene); const vb = (a: any, k: string, s: number, t: number) => m.setVerticesBuffer(new VertexBuffer(this.engine, a, k, false, false, undefined, false, 0, s, t, true, true)); m.setVerticesBuffer(new VertexBuffer(this.engine, g.p, 'position', false, false, 3)); vb(g.n, 'normal', 4, VertexBuffer.BYTE); m.setVerticesBuffer(new VertexBuffer(this.engine, g.u, 'uv', false, false, 2)); vb(g.c, 'tint', 4, VertexBuffer.UNSIGNED_BYTE); vb(g.x, 'xtra', 4, VertexBuffer.UNSIGNED_BYTE); vb(g.bi, 'bi', 4, VertexBuffer.UNSIGNED_BYTE); vb(g.bw, 'bw', 4, VertexBuffer.UNSIGNED_BYTE); m.setIndices(g.i as any, g.nv); m.setEnabled(false); m.isPickable = false; return m }
  sources(): Sources { return { def: id => BY.get(id), geo: id => this.geo(id), avg: this.avg, layers: this.layers } }
  lookKey(l: Look) { return l.hero ? 'h:' + lookKey(l.hero) : l.model + (l.color ?? '') }
  /** make sure a look can be drawn */
  async prepare(l: Look): Promise<void> {
    const key = this.lookKey(l); if (this.bases.has(key)) return; let p = this.making.get(key); if (!p) {
      p = (async () => {
        if (l.hero) { const parts = partsOf(l.hero).filter(q => BY.has(q.id)); await Promise.all(parts.map(q => this.file(q.id))); const c = compose(l.hero, this.sources()); this.trim(); this.bases.set(key, { near: this.meshOf(c.geo, 'c:hero'), far: null, def: c.def, sx: c.scale[0], sy: c.scale[1] }) }
        else { const id = BY.has(l.model) ? l.model : 'villager'; await this.file(id); const d = BY.get(id)!; let g = this.geo(id), f = d.lod[1] && d.lod[0].ni > 4500 ? this.geo(id, 1) : null; if (l.color) { g = recolour(g, l.color, this.sources()); if (f) f = recolour(f, l.color, this.sources()) } this.bases.set(key, { near: this.meshOf(g, 'c:' + id), far: f ? this.meshOf(f, 'c1:' + id) : null, def: d, sx: 1, sy: 1 }) }
      })(); this.making.set(key, p); p.finally(() => this.making.delete(key)).catch(() => { })
    } return p
  }
  /** old hero compositions nobody wears any more */
  private trim() { const used = new Set([...this.map.values()].map(a => a.key)); const L = [...this.bases.keys()].filter(k => k.startsWith('h:') && !used.has(k)); for (const k of L.slice(0, Math.max(0, L.length - 24))) { this.bases.get(k)!.near.dispose(); this.bases.delete(k) } }
  add(id: string, l: Look, x: number, y: number, z: number, yaw: number, local = false): Actor | null {
    const b = this.bases.get(this.lookKey(l)); if (!b) return null; this.remove(id); const d = b.def; const mesh = b.near.clone('a:' + id, null, true, false) as Mesh; mesh.setEnabled(true); const mat = this.mats.get('skin', this.flags); mesh.material = mat; this.hook(mat); const s = Math.max(1, d.hi[1], d.hi[0], d.hi[2]); const bb = () => new BoundingInfo(new Vector3(-s, -.5, -s), new Vector3(s, s * 1.4, s)); mesh.setBoundingInfo(bb()); mesh.doNotSyncBoundingInfo = false; let far: Mesh | null = null; if (b.far) { far = b.far.clone('f:' + id, null, true, false) as Mesh; far.material = mat; far.setBoundingInfo(bb()); far.setEnabled(false) }
    const sc = l.scale ?? 1; const blob = this.plane.clone('b:' + id) as Mesh; blob.setEnabled(true); blob.material = this.blobM; blob.alphaIndex = 5; const w = Math.min(5, .95 * d.size ** .75 + (d.kind === 'beast' ? .25 : 0)) * sc * (l.hero ? Math.max(.7, b.sx) : 1); blob.scaling.set(w, 1, w)
    const a: Actor = { id, key: this.lookKey(l), def: d, mesh, far, x, y, z, yaw, tx: x, ty: y, tz: z, tyaw: yaw, v: 0, phase: Math.random() * 6, t: Math.random() * 9, atk: 0, act: 'attack', hurt: 0, dead: 0, R: new Float32Array(d.bones.length * 3 + 3), M: new Float32Array(BONES * 16), blob, ring: null, sel: 0, scale: b.sy * sc, sx: b.sx * sc, local, hidden: false, ghost: false, guard: 0, crouch: 0, fight: false, sneak: false, lit: false }
    for (let i = 0; i < BONES; i++) a.M[i * 16] = a.M[i * 16 + 5] = a.M[i * 16 + 10] = a.M[i * 16 + 15] = 1; (mesh as any).__actor = a; if (far) (far as any).__actor = a; this.map.set(id, a); return a
  }
  height(a: Actor) { return a.def.hi[1] * a.scale }
  private hooked = new WeakSet<ShaderMaterial>()
  private hook(m: ShaderMaterial) { if (this.hooked.has(m)) return; this.hooked.add(m); m.onBindObservable.add(mesh => { const a = (mesh as any)?.__actor as Actor | undefined; const e = m.getEffect(); if (!a || !e) return; e.setMatrices('bn', a.M); const s = a.hurt > 0 ? a.hurt : 0; if (a.sel || s || a.ghost) e.setFloat3('selC', a.sel * .25 + s * .9 + (a.ghost ? .04 : 0), a.sel * .2 + (a.ghost ? .1 : 0), a.sel * .08 + (a.ghost ? .2 : 0)); else e.setFloat3('selC', 0, 0, 0) }) }
  setFlags(f: Flags) { this.flags = f; const mat = this.mats.get('skin', f); this.hook(mat); for (const a of this.map.values()) { a.mesh.material = mat; if (a.far) a.far.material = mat } }
  remove(id: string) { const a = this.map.get(id); if (!a) return; a.mesh.dispose(false, false); a.far?.dispose(false, false); a.blob.dispose(false, false); a.ring?.dispose(false, false); this.map.delete(id) }
  clear() { for (const id of [...this.map.keys()]) this.remove(id) }
  ring(id: string, kind: '' | 'sel' | 'turn' | 'hero' | 'foe' | 'npc' | 'aim') { const a = this.map.get(id); if (!a) return; if (!kind) { a.ring?.dispose(false, false); a.ring = null; return } const c = { sel: [1, .78, .25, .95], turn: [.35, .9, .45, .95], hero: [.35, .6, 1, .6], foe: [.95, .2, .12, .6], npc: [.9, .85, .7, .45], aim: [1, .25, .1, 1] }[kind]!; if (!a.ring) { a.ring = this.plane.clone('r:' + id) as Mesh; a.ring.setEnabled(true); a.ring.alphaIndex = 6; const w = 1.5 * Math.max(1, a.def.size ** .5 * (a.def.size > 1 ? 1.35 : 1)) * (a.def.id === 'hero' ? 1 : Math.max(.7, a.scale)); a.ring.scaling.set(w, 1, w) } a.ring.material = this.ringMat('ring' + kind, c, 1) }
  update(dt: number, eye: { x: number; y: number; z: number }, vis: (a: Actor) => boolean) {
    for (const a of this.map.values()) {
      const ox = a.x, oz = a.z; if (!a.local) { const k = 1 - Math.exp(-dt * 10), dx = a.tx - a.x, dz = a.tz - a.z, d = Math.hypot(dx, dz); if (d > 9) { a.x = a.tx; a.y = a.ty; a.z = a.tz } else { const st = Math.min(d, Math.max(2.4, d * 5) * dt); if (d > 1e-4) { a.x += dx / d * st; a.z += dz / d * st } a.y += (a.ty - a.y) * k } let dy = a.tyaw - a.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); if (d > .05) { dy = Math.atan2(dx, dz) - a.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)) } a.yaw += dy * (1 - Math.exp(-dt * 9)) }
      const sp = dt > 0 ? Math.hypot(a.x - ox, a.z - oz) / dt : 0; if (!a.local) a.v += (sp - a.v) * Math.min(1, dt * 8); a.t += dt; const sc = (a.def.hi[1] > 2.2 ? 1.5 : a.def.hi[1] < 1.3 ? .7 : 1) * Math.max(.55, a.scale); a.phase += a.v * dt * 2.15 / sc; a.atk = Math.max(0, a.atk - dt * (a.act === 'cast' ? 1.15 : a.act === 'cheer' ? .6 : 1.7)); a.hurt = Math.max(0, a.hurt - dt * 2.2); a.guard += ((a.fight ? 1 : 0) - a.guard) * Math.min(1, dt * 4); a.crouch += ((a.sneak ? 1 : 0) - a.crouch) * Math.min(1, dt * 6)
      const on = !a.hidden && vis(a); const d = Math.hypot(a.x - eye.x, a.z - eye.z, a.y - eye.y); const useFar = on && !!a.far && d > 24; if (a.mesh.isEnabled() !== (on && !useFar)) a.mesh.setEnabled(on && !useFar); if (a.far && a.far.isEnabled() !== useFar) a.far.setEnabled(useFar); a.lit = on; if (a.blob.isEnabled() !== (on && !a.dead)) a.blob.setEnabled(on && !a.dead); if (a.ring && a.ring.isEnabled() !== (on || a.sel > 0)) a.ring.setEnabled(on || a.sel > 0); if (!on) continue
      for (const m of useFar ? [a.far!] : [a.mesh]) { m.position.set(a.x, a.y, a.z); m.rotation.y = a.yaw; m.scaling.set(a.sx, a.scale, a.sx) } a.blob.position.set(a.x, a.y + .03, a.z); a.ring?.position.set(a.x, a.y + .045, a.z); if (d < 70) { pose(a); solve(a) }
    }
  }
  play(id: string, what: Anim) { const a = this.map.get(id); if (!a) return; if (what === 'attack' || what === 'shoot' || what === 'cast' || what === 'cheer') { a.atk = 1; a.act = what } if (what === 'hurt') a.hurt = 1; if (what === 'die') a.dead = Math.max(a.dead, .001); if (what === 'rise') a.dead = 0 }
  private wanted = new Map<string, { t: Token; me: string | null }>()
  sync(tokens: Iterable<Token>, me: string | null) {
    const seen = new Set<string>(); for (const t of tokens) { seen.add(t.id); const L = this.look(t), key = this.lookKey(L); let a = this.map.get(t.id); if (!a || a.key !== key) { if (!this.bases.has(key)) { this.wanted.set(t.id, { t, me }); this.prepare(L).then(() => { const w = this.wanted.get(t.id); if (w) { this.wanted.delete(t.id); this.onReady() } }).catch(e => console.warn('actor', t.m, e)); if (!a) continue } else { const keep = a ? { x: a.x, y: a.y, z: a.z, yaw: a.yaw } : null; const ringed = !!a?.ring; const n = this.add(t.id, L, keep?.x ?? t.x, keep?.y ?? t.y, keep?.z ?? t.z, keep?.yaw ?? t.r, t.id === me); if (!n) continue; a = n; void ringed } }
      if (!a) continue; a.local = t.id === me; if (!a.local) { a.tx = t.x; a.ty = t.y; a.tz = t.z; a.tyaw = t.r } a.ghost = !!t.hidden; const down = t.hp <= 0; if (down && !a.dead) a.dead = .001; if (!down) a.dead = 0 } for (const id of [...this.map.keys()]) if (!seen.has(id)) this.remove(id); for (const id of [...this.wanted.keys()]) if (!seen.has(id)) this.wanted.delete(id)
  }
  get pending() { return this.making.size }
  meshes() { return [...this.map.values()].map(a => a.far?.isEnabled() ? a.far : a.mesh) }
  dispose() { this.clear(); for (const b of this.bases.values()) { b.near.dispose(); b.far?.dispose() } this.plane.dispose() }
}
// ------------------------------------------------------------------ procedural animation
export function pose(a: Actor) {
  const R = a.R, d = a.def, n = d.bones.length; R.fill(0); const B = (name: string) => d.bones.indexOf(name) * 3; const set = (name: string, x = 0, y = 0, z = 0) => { const i = B(name); if (i >= 0) { R[i] += x; R[i + 1] += y; R[i + 2] += z } }; const root = n * 3; const t = a.t, ph = a.phase, A = Math.min(1, a.v / 2.2), run = Math.max(0, Math.min(1, (a.v - 3) / 2.5)), s = Math.sin(ph), c = Math.cos(ph); const atk = a.atk > 0 ? 1 - a.atk : -1, gd = a.guard * (1 - A * .6), cr = a.crouch
  if (a.dead > 0) { a.dead = Math.min(1, a.dead + .03) }
  if (d.rig === 'humanoid' || d.rig === 'float') {
    const fl = d.rig === 'float' && d.bones.includes('armL'); const br = Math.sin(t * 1.7)
    if (d.rig === 'float') { R[root + 1] = .18 + Math.sin(t * 1.3) * .08 }
    if (!fl && d.rig !== 'float') { R[root + 1] = (Math.abs(c) * .045 - .03) * A + Math.abs(c) * .03 * run; set('legL', -s * (.55 + .3 * run) * A, 0, 0); set('legR', s * (.55 + .3 * run) * A); set('shinL', Math.max(0, c) * (.75 + .6 * run) * A + .06 * A); set('shinR', Math.max(0, -c) * (.75 + .6 * run) * A + .06 * A); set('footL', -s * .15 * A + .1 * Math.max(0, -s) * A); set('footR', s * .15 * A + .1 * Math.max(0, s) * A) }
    set('hips', 0, -s * .10 * A, c * .02 * A); set('spine', .04 * A + .20 * run + br * .008, s * .05 * A); set('chest', br * .014 + .03 * run, s * .14 * A); set('head', -.04 * A - .16 * run + Math.sin(t * .37) * .03, -s * .12 * A + Math.sin(t * .43) * .09 * (1 - A))
    const z = d.pose === 'zombie'; if (z) { set('armL', -1.25 + Math.sin(t * 1.1) * .08, 0, .1); set('armR', -1.1 + Math.sin(t * 1.3 + 1) * .1, 0, -.1); set('foreL', -.2); set('foreR', -.3); set('head', .15, 0, .12); set('spine', .14) }
    else { set('armL', s * (.45 + .35 * run) * A + br * .015, 0, .05); set('armR', -s * (.38 + .35 * run) * A + br * .015, 0, -.05); set('foreL', -.18 - .30 * A - .6 * run); set('foreR', -.24 - .30 * A - .5 * run) }
    set('cape', -(.05 + .24 * A + .35 * run) * -1 * .0 + (.04 + .2 * A + .3 * run), 0, Math.sin(t * 1.1) * .02); set('cape2', .06 * A + .15 * run + Math.sin(t * 1.9 + ph) * .05 * (.3 + A))
    if (fl) { set('spine', .12 * A + .05); set('armL', -.5 + Math.sin(t) * .1, 0, .25); set('armR', -.5 + Math.sin(t + 1) * .1, 0, -.25); set('cape', .15 + Math.sin(t * 1.5) * .05) }
    if (!z && !fl && (gd > .01 || cr > .01)) { const k = Math.max(gd * .55, cr); set('legL', -.34 * k, 0, .1 * gd); set('legR', -.12 * k, 0, -.1 * gd); set('shinL', .5 * k); set('shinR', .42 * k); R[root + 1] -= .07 * k * d.joints[0][1][1]; set('spine', .12 * gd + .42 * cr); set('head', -.1 * gd - .34 * cr); set('armR', -.42 * gd - .2 * cr, 0, -.05); set('foreR', -.55 * gd); set('armL', -.5 * gd - .2 * cr, 0, .12 * gd); set('foreL', -.7 * gd); set('chest', 0, -.22 * gd) }
    if (atk >= 0 && a.act === 'cast') { const h = Math.sin(Math.min(1, atk * 1.6) * Math.PI / 2) * (1 - Math.max(0, (atk - .7) / .3)); set('armL', -1.55 * h, 0, .3 * h); set('armR', -1.7 * h, 0, -.3 * h); set('foreL', -.35 * h); set('foreR', -.3 * h); set('chest', -.14 * h); set('head', -.1 * h); R[root + 1] += .04 * h }
    else if (atk >= 0 && a.act === 'shoot') { const h = Math.min(1, atk * 4) * (1 - Math.max(0, (atk - .75) / .25)); const rel = atk > .5 ? 1 : 0; set('chest', 0, -.9 * h); set('armL', -1.45 * h, .75 * h); set('foreL', .1 * h); set('armR', -1.2 * h, -.6 * h, -.5 * h); set('foreR', (-1.7 + .7 * rel) * h); set('head', 0, .8 * h) }
    else if (atk >= 0 && a.act === 'cheer') { const h = Math.sin(atk * Math.PI); set('armR', -2.6 * h, 0, .1); set('head', -.25 * h); R[root + 1] += Math.abs(Math.sin(atk * 9)) * .06 * h }
    else if (atk >= 0) { const w = atk < .35 ? atk / .35 : 1 - (atk - .35) / .65, hit = atk < .35 ? 0 : Math.sin(Math.min(1, (atk - .35) / .3) * Math.PI / 2) * (1 - Math.max(0, (atk - .65) / .35)); const up = atk < .35 ? w : Math.max(0, 1 - (atk - .35) / .18); set('armR', -2.1 * up - 1.0 * hit, 0, .25 * hit); set('foreR', -.7 * up + .2 * hit); set('chest', .0 + .28 * hit, .5 * up - .55 * hit); set('spine', .12 * hit); set('armL', -.3 * w); set('legL', -.28 * hit); set('shinR', .2 * hit) }
    if (a.hurt > 0) { set('chest', -.35 * a.hurt); set('head', -.25 * a.hurt) }
    if (a.dead) { const k = a.dead * a.dead * (3 - 2 * a.dead); set('hips', -1.5 * k); R[root + 1] = -d.joints[0][1][1] * k * .86; set('armL', 0, 0, .7 * k); set('armR', 0, 0, -.8 * k); set('legL', .1 * k, 0, .12 * k); set('legR', -.1 * k) }
  } else if (d.rig === 'flyer') {
    R[root + 1] = Math.sin(t * 2.3) * .1; set('chest', .1 + Math.sin(t * 2.3) * .05 + .25 * A); set('head', -.1 - .2 * A, Math.sin(t * .6) * .2); if (atk >= 0) { const h = Math.sin(atk * Math.PI); R[root + 2] = .5 * h; R[root + 1] -= .35 * h; set('head', .3 * h) } if (a.dead) { const k = a.dead; R[root + 1] = -d.joints[0][1][1] * .9 * k; set('hips', 0, 0, 2.6 * k) }
  } else if (d.rig === 'serpent') {
    const w = .1 + .2 * A; R[root] = 0; for (let i = 1; i < 9; i++) set('s' + i, i > 5 ? Math.sin(t * 1.1 + i) * .03 : 0, Math.sin(ph * 1.5 - i * .95 + t * .8) * w * (i > 6 ? .5 : 1)); set('head', Math.sin(t * 1.3) * .05, Math.sin(t * .7) * .2 * (1 - A)); if (atk >= 0) { const h = Math.sin(atk * Math.PI); set('s7', -.25 * h + .0); set('s6', .4 * h); set('head', .2 * h); R[root + 2] = .3 * h } if (a.dead) { const k = a.dead; set('hips', 0, 0, 1.2 * k); for (let i = 5; i < 9; i++) set('s' + i, .28 * k); R[root + 1] = -.02 * k }
  } else if (d.rig === 'quad' || d.rig === 'dragon') {
    const gal = run, A2 = A; R[root + 1] = Math.abs(s) * .02 * A2 + Math.sin(ph * 1) * .05 * gal * d.hi[1]; const leg = (u: string, l: string, p: number) => { const q = Math.sin(ph + p), k = Math.cos(ph + p); set(u, -q * (.45 + .25 * gal) * A2); set(l, Math.max(0, k) * .7 * A2 + .04) }; leg('flL', 'fsL', 0); leg('flR', 'fsR', Math.PI * (1 - .85 * gal)); leg('blL', 'bsL', Math.PI + .4 * gal); leg('blR', 'bsR', .0 + Math.PI * gal * .9); set('spine', Math.sin(ph) * .07 * gal); set('chest', Math.sin(t * 1.7) * .012); set('neck', Math.sin(t * .9) * .04 - .05 * A2 + Math.sin(ph * 2) * .03 * A2, Math.sin(t * .5) * .14 * (1 - A2)); set('head', Math.sin(t * .8 + 1) * .05, Math.sin(t * .37) * .12 * (1 - A2)); set('tail', .1 + Math.sin(t * 1.1) * .05, Math.sin(t * 2.1) * .18); set('tail2', .05, Math.sin(t * 2.1 - .8) * .24); set('tail3', 0, Math.sin(t * 2.1 - 1.6) * .28); set('jaw', .06 + Math.max(0, Math.sin(t * 2.2)) * .07)
    if (d.rig === 'dragon') { const f = Math.sin(t * 1.1) * .05; for (const sd of ['L', 'R']) { const q = sd === 'L' ? 1 : -1; set('wing' + sd, 0, -.35 * q, (.25 + f) * q); set('wing2' + sd, 0, .75 * q, (-.55 - f) * q) } }
    if (atk >= 0) { const h = Math.sin(atk * Math.PI); set('neck', .35 * h); set('head', -.3 * h); set('jaw', .75 * h); set('chest', .12 * h); R[root + 2] = .28 * h * d.hi[1] * .5; if (d.rig === 'dragon') for (const sd of ['L', 'R']) set('wing' + sd, 0, 0, (sd === 'L' ? 1 : -1) * .6 * h) }
    if (a.dead) { const k = a.dead; set('hips', 0, 0, 1.45 * k); R[root + 1] = -d.joints[0][1][1] * .55 * k }
  } else if (d.rig === 'spider') {
    for (let i = 0; i < 4; i++) set('tl' + i, Math.sin(t * 1.4 + i) * .05 - (atk >= 0 ? Math.sin(atk * Math.PI) * .32 : 0))
    R[root + 1] = Math.sin(t * 2) * .015; set('abd', Math.sin(t * 1.5) * .05); for (let i = 0; i < 4; i++) for (const [sd, q] of [['L', 1], ['R', -1]] as const) { const p = ph * 1.6 + (i % 2 ? Math.PI : 0) + (q > 0 ? 0 : Math.PI); set(`u${i}${sd}`, 0, Math.sin(p) * .34 * A * q * (1), 0); set(`l${i}${sd}`, 0, 0, Math.max(0, Math.cos(p)) * .32 * A * q); set(`u${i}${sd}`, 0, 0, Math.max(0, Math.cos(p)) * .18 * A * q + Math.sin(t * 1.3 + i) * .01) } if (atk >= 0) { const h = Math.sin(atk * Math.PI); set('hips', -.4 * h); R[root + 2] = .4 * h } if (a.dead) { set('hips', 0, 0, 3.0 * a.dead); R[root + 1] = .55 * a.dead }
  } else { // blob
    const w = Math.sin(t * 2.2) * .03 + Math.abs(Math.sin(ph)) * .08 * A; R[root + 1] = w * .4; set('mid', Math.sin(t * 1.3) * .03 + .1 * A, 0, Math.sin(t * 1.7) * .03); set('head', Math.sin(t * 1.9) * .04 - (atk >= 0 ? Math.sin(atk * Math.PI) * .7 : 0) - (d.id === 'mimic' ? .18 + Math.sin(t * 3) * .08 : 0), 0, Math.cos(t * 1.5) * .04); if (a.dead) { set('head', .5 * a.dead); R[root + 1] = -.15 * a.dead }
  }
  const alive = 1 - a.dead
  for (let i = 0; i < 8; i++) { set('t' + i, Math.sin(t * 1.6 + i) * .2 * alive + (atk >= 0 ? Math.sin(Math.min(1, Math.max(0, atk * 1.6 - i * .08)) * Math.PI) * .4 : 0), 0, Math.cos(t * 1.3 + i * 2) * .16 * alive); set('tt' + i, Math.sin(t * 1.4 + i * 1.7) * .16 * alive, Math.sin(t * .9 + i) * .22 * alive) }
  if (d.rig !== 'dragon' && d.bones.includes('wingL')) { const fly = d.rig === 'flyer', f = fly ? Math.sin(t * (d.hi[1] < 1.7 ? 17 : 9)) : Math.sin(t * 1.2) * .12 + A * Math.sin(ph * .8) * .25; const fold = fly ? 0 : d.rig === 'quad' ? .55 : .5; for (const [sd, q] of [['L', 1], ['R', -1]] as const) { set('wing' + sd, 0, -fold * .9 * q * (1 - (atk >= 0 ? Math.sin(atk * Math.PI) : 0)), (f * (fly ? .6 : .3) + (fly ? .1 : .12) - a.dead * .6) * q); set('wing2' + sd, 0, fold * 1.3 * q, (f * (fly ? .4 : .2) - fold * .5) * q) } }
}
export function solve(a: Actor) {
  const d = a.def, n = d.bones.length, M = a.M, R = a.R, r0 = n * 3
  for (let i = 0; i < n; i++) {
    const [p, j] = d.joints[i], x = R[i * 3], y = R[i * 3 + 1], z = R[i * 3 + 2]; const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z)
    // R = Ry * Rx * Rz
    const m00 = cy * cz + sy * sx * sz, m01 = -cy * sz + sy * sx * cz, m02 = sy * cx, m10 = cx * sz, m11 = cx * cz, m12 = -sx, m20 = -sy * cz + cy * sx * sz, m21 = sy * sz + cy * sx * cz, m22 = cy * cx
    let tx = j[0] - (m00 * j[0] + m01 * j[1] + m02 * j[2]), ty = j[1] - (m10 * j[0] + m11 * j[1] + m12 * j[2]), tz = j[2] - (m20 * j[0] + m21 * j[1] + m22 * j[2]); const o = i * 16
    if (p < 0) { M[o] = m00; M[o + 1] = m10; M[o + 2] = m20; M[o + 3] = 0; M[o + 4] = m01; M[o + 5] = m11; M[o + 6] = m21; M[o + 7] = 0; M[o + 8] = m02; M[o + 9] = m12; M[o + 10] = m22; M[o + 11] = 0; M[o + 12] = tx + R[r0]; M[o + 13] = ty + R[r0 + 1]; M[o + 14] = tz + R[r0 + 2]; M[o + 15] = 1; continue }
    const q = p * 16, P = M; const mul = (a0: number, a1: number, a2: number, w: number, k: number) => { M[o + k] = P[q] * a0 + P[q + 4] * a1 + P[q + 8] * a2 + P[q + 12] * w; M[o + k + 1] = P[q + 1] * a0 + P[q + 5] * a1 + P[q + 9] * a2 + P[q + 13] * w; M[o + k + 2] = P[q + 2] * a0 + P[q + 6] * a1 + P[q + 10] * a2 + P[q + 14] * w; M[o + k + 3] = w }
    mul(m00, m10, m20, 0, 0); mul(m01, m11, m21, 0, 4); mul(m02, m12, m22, 0, 8); mul(tx, ty, tz, 1, 12)
  }
}
