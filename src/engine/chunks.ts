import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import type { Scene } from '@babylonjs/core/scene'
import type { Engine } from '@babylonjs/core/Engines/engine'
import { World, idx, inb } from '../core/world'
import { CH, type Geo, type Groups } from '../core/mesher'
import { N, HALF, CELL, E, FLAG, isDoor, TERRAIN, w2c } from '../core/defs'
import type { Materials, Flags, Base } from './materials'
import type { Quality } from './quality'
import type { Volume } from '../core/light'
import type { Globals } from './materials'
type G = keyof Groups
const BASE: Record<G, Base> = { solid: 'solid', cut: 'cut', ceil: 'solid', terr: 'terr', water: 'water', grass: 'cut', cap: 'solid' }
interface Slot { meshes: Partial<Record<G, Mesh>>; ver: number; ready: boolean; pending: boolean }
interface Chunk { key: string; l: number; cx: number; cz: number; lod: [Slot, Slot, Slot]; ver: number; dist: number }
export function makeMesh(name: string, g: Geo, scene: Scene, engine: Engine) {
  const m = new Mesh(name, scene); const vb = (d: any, k: string, size: number, type: number, norm: boolean) => m.setVerticesBuffer(new VertexBuffer(engine, d, k, false, false, undefined, false, 0, size, type, norm, true))
  m.setVerticesBuffer(new VertexBuffer(engine, g.p, 'position', false, false, 3)); vb(g.n, 'normal', 4, VertexBuffer.BYTE, true); m.setVerticesBuffer(new VertexBuffer(engine, g.u, 'uv', false, false, 2)); vb(g.c, 'tint', 4, VertexBuffer.UNSIGNED_BYTE, true); vb(g.x, 'xtra', 4, VertexBuffer.UNSIGNED_BYTE, true)
  m.setIndices(g.p.length / 3 < 65536 ? new Uint16Array(g.i) as any : g.i as any, g.p.length / 3); m.isPickable = false; m.doNotSyncBoundingInfo = true; m.alwaysSelectAsActiveMesh = false; return m
}
/** Low tier: light is baked into vertices on the CPU, so the GPU only transforms and textures. */
export class Baker {
  v: Volume | null = null; g: Globals | null = null; private q: Mesh[] = []; private seen = new Set<Mesh>()
  constructor(private engine: Engine) { }
  add(m: Mesh) { if (!this.seen.has(m)) { this.seen.add(m); this.q.push(m) } }
  all(ms: Iterable<Mesh>) { for (const m of ms) this.add(m) }
  step(ms: number) { if (!this.v || !this.g) return; const t = performance.now(); while (this.q.length && performance.now() - t < ms) { const m = this.q.shift()!; this.seen.delete(m); if (!m.isDisposed()) this.bake(m) } }
  get left() { return this.q.length }
  sample(x: number, y: number, z: number, out: Float32Array) { const v = this.v; if (!v) { out.fill(.1); return } const l = Math.floor((y + .6) / 4), fx = (x - v.x0) / .75 - .5, fz = (z - v.z0) / .75 - .5, Y = Math.max(0, Math.min(v.h - 1, (l - v.l0) * 3 + 1)); const xi = Math.max(0, Math.min(v.w - 1, Math.round(fx))), zi = Math.max(0, Math.min(v.d - 1, Math.round(fz))), i = (zi * v.h + Y) * v.w + xi; if (fx < -1 || fz < -1 || fx > v.w || fz > v.d) { out[0] = out[1] = out[2] = 0; out[3] = l >= 0 ? 1 : 0; out[4] = l >= 0 ? 1 : 0; out[5] = out[7] = 0; out[6] = 1; return } const q = i * 4; for (let c = 0; c < 3; c++) { const a = v.A[q + c] / 255; out[c] = a * a * 5 } out[3] = v.A[q + 3] / 255; out[4] = v.B[q + 3] / 255; for (let c = 0; c < 3; c++) out[5 + c] = v.B[q + c] / 127.5 - 1 }
  private bake(m: Mesh) {
    const d = (m as any).__g as { p: Float32Array; n: Int8Array; c: Uint8Array; cut: boolean }; if (!d) return; const v = this.v!, g = this.g!, n = d.p.length / 3, o = new Uint8Array(n * 4); const A = v.A, B = v.B, W = v.w, H = v.h, D = v.d, p = d.p, N8 = d.n; const sx = g.sunD.x, sy = g.sunD.y, sz = g.sunD.z, sc = [g.sunC.r, g.sunC.g, g.sunC.b], sk = [g.skyC.r, g.skyC.g, g.skyC.b], gn = [g.gndC.r, g.gndC.g, g.gndC.b], am = [g.ambC.r, g.ambC.g, g.ambC.b]
    for (let i = 0; i < n; i++) {
      const nx = N8[i * 4] / 127, ny = N8[i * 4 + 1] / 127, nz = N8[i * 4 + 2] / 127, x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2], vao = d.c[i * 4 + 3] / 255; const lev = Math.floor((y + ny * .3 + .05) / 4), fy0 = Math.max(.667, Math.min(3.333, y - lev * 4 + ny * .55)); let fx = (x + nx * .3 - v.x0) / .75 - .5, fz = (z + nz * .3 - v.z0) / .75 - .5, fy = (lev - v.l0) * 3 + fy0 * .75 - .5
      let r = 0, gg = 0, b = 0, sun = 1, sky = 1, dx = 0, dy = 0, dz = 0
      if (fx < -.6 || fz < -.6 || fx > W - .4 || fz > D - .4 || fy < -.6) { if (lev < 0) sun = sky = 0 } else {
        fx = Math.max(0, Math.min(W - 1.001, fx)); fz = Math.max(0, Math.min(D - 1.001, fz)); fy = Math.max(0, Math.min(H - 1, fy)); const xi = fx | 0, zi = fz | 0, yi = Math.round(fy), u = fx - xi, t = fz - zi; let k = (zi * H + yi) * W + xi; const w0 = (1 - u) * (1 - t), w1 = u * (1 - t), w2 = (1 - u) * t, w3 = u * t; sun = sky = 0
        const acc = (q: number, ww: number) => { if (ww < .01) return; const a = A[q] / 255, e = A[q + 1] / 255, c = A[q + 2] / 255; r += a * ww; gg += e * ww; b += c * ww; sun += A[q + 3] / 255 * ww; dx += (B[q] / 127.5 - 1) * ww; dy += (B[q + 1] / 127.5 - 1) * ww; dz += (B[q + 2] / 127.5 - 1) * ww; sky += B[q + 3] / 255 * ww }
        acc(k * 4, w0); acc((k + 1) * 4, w1); acc((k + H * W) * 4, w2); acc((k + H * W + 1) * 4, w3); r = r * r * 5; gg = gg * gg * 5; b = b * b * 5
      }
      const dl = Math.hypot(dx, dy, dz); let wr = 1; if (dl > .01) { const nl = (nx * dx + ny * dy + nz * dz) / dl, m2 = Math.min(1, dl * 1.25); wr = 1 + (Math.max(0, nl * .78 + .22) * 1.55 - 1) * m2 } const oc = vao * .75 + .25, h = ny * .5 + .5; let ns = nx * sx + ny * sy + nz * sz; ns = d.cut ? Math.abs(ns) * .5 + .35 : Math.max(0, ns); const sv = ns * sun * (vao * .5 + .5), av = .6 + .4 * ny
      o[i * 4] = Math.min(255, Math.sqrt((r * wr * oc + ((gn[0] + (sk[0] - gn[0]) * h) * sky + am[0] * av) * vao + sc[0] * sv) / 5) * 255); o[i * 4 + 1] = Math.min(255, Math.sqrt((gg * wr * oc + ((gn[1] + (sk[1] - gn[1]) * h) * sky + am[1] * av) * vao + sc[1] * sv) / 5) * 255); o[i * 4 + 2] = Math.min(255, Math.sqrt((b * wr * oc + ((gn[2] + (sk[2] - gn[2]) * h) * sky + am[2] * av) * vao + sc[2] * sv) / 5) * 255); o[i * 4 + 3] = 255
    }
    m.setVerticesBuffer(new VertexBuffer(this.engine, o, 'lit', false, false, undefined, false, 0, 4, VertexBuffer.UNSIGNED_BYTE, true, true))
  }
}
export class Chunks {
  baker: Baker | null = null
  map = new Map<string, Chunk>(); private queue: { c: Chunk; lod: 0 | 1 | 2; pri: number }[] = []; private busy = 0; private wi = 0; visible = new Set<string>(); pvs: Set<string> | null = null; built = 0; total = 0; ms = 0; tris = 0; draws = 0; onBuilt: () => void = () => { }
  constructor(private scene: Scene, private engine: Engine, private mats: Materials, private q: Quality, private workers: Worker[]) { }
  private mk(l: number, cx: number, cz: number): Chunk { const s = (): Slot => ({ meshes: {}, ver: -1, ready: false, pending: false }); return { key: `${l}|${cx}|${cz}`, l, cx, cz, lod: [s(), s(), s()], ver: 0, dist: 0 } }
  reset(w: World) {
    for (const c of this.map.values()) this.kill(c); this.map.clear(); this.queue = []; this.built = 0; const n = N / CH; const has = this.occupancy(w)
    for (const k of has) { const [l, x, z] = k.split('|').map(Number); if (x < 0 || z < 0 || x >= n || z >= n) continue; this.map.set(k, this.mk(l, x, z)) } this.total = this.map.size
  }
  private occupancy(w: World) { const s = new Set<string>(); for (const v of w.levels.values()) for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { const i = idx(x, z); if (v.floor[i] || v.eN[i] || v.eW[i] || v.ceil[i] || v.flag[i]) s.add(`${v.l}|${x >> 4}|${z >> 4}`); if (v.flag[i] & FLAG.cave) for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) s.add(`${v.l}|${(x + a) >> 4}|${(z + b) >> 4}`) } for (const p of w.props.values()) s.add(`${p.l}|${w2c(p.x) >> 4}|${w2c(p.z) >> 4}`); for (const r of w.rings.values()) for (let l = r.l0; l <= r.l1 + 1; l++) s.add(`${l}|${w2c(r.x) >> 4}|${w2c(r.z) >> 4}`); for (const r of w.roofs.values()) s.add(`${r.l}|${r.x0 >> 4}|${r.z0 >> 4}`); for (const t of w.spirals.values()) for (let l = t.l0; l <= t.l1; l++) s.add(`${l}|${w2c(t.x) >> 4}|${w2c(t.z) >> 4}`); for (const t of w.stairs.values()) s.add(`${t.l}|${t.x >> 4}|${t.z >> 4}`); return s }
  dirty(keys: Iterable<string>) { const n = N / CH; for (const k of keys) { let c = this.map.get(k); if (!c) { const [l, x, z] = k.split('|').map(Number); if (x < 0 || z < 0 || x >= n || z >= n) continue; c = this.mk(l, x, z); this.map.set(k, c) } c.ver++ } }
  private kill(c: Chunk) { for (const s of c.lod) for (const k in s.meshes) s.meshes[k as G]!.dispose(false, false); for (const s of c.lod) s.meshes = {} }
  /** called ~8x a second: decide detail, ask workers for what is missing */
  plan(fx: number, fz: number, zoom: number) {
    const near = this.q.near * zoom; this.queue.length = 0; const S = CH * CELL
    for (const c of this.map.values()) {
      const x0 = (c.cx * CH - HALF) * CELL, z0 = (c.cz * CH - HALF) * CELL; c.dist = Math.hypot(Math.max(x0 - fx, 0, fx - x0 - S), Math.max(z0 - fz, 0, fz - z0 - S)); const l1 = c.lod[1], l0 = c.lod[0]; const vis = this.pvs ? this.pvs.has(c.key) : true; const pri = c.dist + (vis ? 0 : 60) + Math.abs(c.l) * .01
      const l2 = c.lod[2], any = l0.ready || l1.ready || l2.ready, mid = near * this.q.mid
      if (l2.ver !== c.ver && !l2.pending) this.queue.push({ c, lod: 2, pri: any ? pri + 40 : pri - 1000 })
      if (c.dist < mid && l1.ver !== c.ver && !l1.pending) this.queue.push({ c, lod: 1, pri: pri - (l1.ready ? 1500 : 0) + 4 })
      if (c.dist < near && l0.ver !== c.ver && !l0.pending) this.queue.push({ c, lod: 0, pri: pri - (l0.ready ? 2000 : 0) })
      for (const [s, d] of [[l0, near], [l1, mid]] as const) if (c.dist > d * 1.6 + 24 && s.ready && !s.pending) { for (const k in s.meshes) s.meshes[k as G]!.dispose(false, false); s.meshes = {}; s.ready = false; s.ver = -1 }
    }
    this.queue.sort((a, b) => a.pri - b.pri); this.pump()
  }
  private pump() { while (this.busy < this.workers.length * 2 && this.queue.length) { const j = this.queue.shift()!; const s = j.c.lod[j.lod]; if (s.pending || s.ver === j.c.ver) continue; s.pending = true; this.busy++; this.workers[this.wi++ % this.workers.length].postMessage({ t: 'chunk', key: j.c.key, l: j.c.l, cx: j.c.cx, cz: j.c.cz, lod: j.lod, ver: j.c.ver }) } }
  got(m: { key: string; ver: number; lod: 0 | 1 | 2; g: Groups; ms: number }, flags: Flags) {
    this.busy--; this.ms += m.ms; const c = this.map.get(m.key); if (!c) { this.pump(); return } const s = c.lod[m.lod]; s.pending = false
    const old = s.meshes; s.meshes = {}; for (const k in m.g) { const geo = (m.g as any)[k] as Geo; const mesh = makeMesh(`${m.key}:${k}:${m.lod}`, geo, this.scene, this.engine); if (this.baker && k !== 'water') { mesh.setVerticesBuffer(new VertexBuffer(this.engine, new Uint8Array(geo.p.length / 3 * 4).fill(18), 'lit', false, false, undefined, false, 0, 4, VertexBuffer.UNSIGNED_BYTE, true, true)); (mesh as any).__g = { p: geo.p, n: geo.n, c: geo.c, cut: k === 'cut' || k === 'grass' }; this.baker.add(mesh) } mesh.material = this.mats.get(BASE[k as G], flags); mesh.freezeWorldMatrix(); mesh.setEnabled(false); if (k === 'water') mesh.alphaIndex = 10; s.meshes[k as G] = mesh } for (const k in old) old[k as G]!.dispose(false, false)
    if (!s.ready && m.lod === 2 && !(c as any).done) { (c as any).done = true; this.built++ } s.ready = true; s.ver = m.ver; if (s.ver !== c.ver) { /* edited meanwhile; plan() will ask again */ } this.onBuilt(); this.pump()
  }
  failed(key?: string) { this.busy = Math.max(0, this.busy - 1); if (key) { const c = this.map.get(key); if (c) { for (const q of c.lod) q.pending = false } } this.pump() }
  setMaterials(f: Flags) { for (const c of this.map.values()) for (const s of c.lod) for (const k in s.meshes) s.meshes[k as G]!.material = this.mats.get(BASE[k as G], f) }
  /** show the right meshes. level = highest storey shown (flat views); null in first/third person */
  show(o: { seen?: Set<string> | null; all: boolean; level: number | null; min: number; far: number; hideCeilAt: number | null; under: boolean; grass: number; zoom: number; fow: boolean; caps: boolean }) {
    const near = this.q.near * o.zoom; this.tris = 0; this.draws = 0
    for (const c of this.map.values()) {
      let vis = c.dist < o.far && c.l >= o.min && (!o.seen || o.seen.has(c.key)); if (o.all) { /* whole land */ } else if (o.level !== null) vis = vis && c.l <= o.level && (!o.under || c.l === o.level); else if (this.pvs) vis = vis && this.pvs.has(c.key)
      const w = c.dist < near ? 0 : c.dist < near * this.q.mid ? 1 : 2; const use = c.lod[w].ready ? w : w === 0 ? (c.lod[1].ready ? 1 : 2) : w === 1 ? (c.lod[2].ready ? 2 : c.lod[0].ready ? 0 : 1) : (c.lod[1].ready ? 1 : c.lod[0].ready ? 0 : 2)
      for (const q of [0, 1, 2] as const) for (const k in c.lod[q].meshes) { const m = c.lod[q].meshes[k as G]!; let on = vis && q === use; if (on && k === 'grass') on = c.dist < o.grass; if (k === 'cap') on = on && o.level !== null && c.l === o.level && o.caps; if (on && k === 'ceil' && o.hideCeilAt !== null && c.l >= o.hideCeilAt) on = false; if (m.isEnabled() !== on) m.setEnabled(on); if (on) { this.tris += m.getTotalIndices() / 3; this.draws++ } }
    }
  }
  get ready() { return this.total > 0 && this.built >= this.total }
  *meshes() { for (const c of this.map.values()) for (const s of c.lod) for (const k in s.meshes) yield s.meshes[k as G]! }
  stats() { return { chunks: this.map.size, built: this.built, busy: this.busy, queue: this.queue.length, tris: Math.round(this.tris), draws: this.draws, ms: Math.round(this.ms) } }
  meshesNear(r: number) { const out: Mesh[] = []; for (const c of this.map.values()) if (c.dist < r && c.l >= 0) { const s = c.lod.find(q => q.ready); if (!s) continue; for (const k of ['solid', 'cut', 'ceil'] as G[]) if (s.meshes[k]) out.push(s.meshes[k]!) } return out }
  dispose() { for (const c of this.map.values()) this.kill(c); this.map.clear() }
}
/** which chunks can be seen from a cell: a fan of rays through the grid, stopping at walls and closed doors */
export function sight(w: World, l: number, x: number, z: number, range = 44): Set<string> | null {
  const lv = w.levels.get(l); const S = new Set<string>(); const cx = w2c(x), cz = w2c(z); if (!inb(cx, cz)) return null
  const i0 = idx(cx, cz); if (lv && !lv.ceil[i0] && l >= 0 && w.terrain) return null; if (!lv) return null
  const add = (ll: number, a: number, b: number) => { S.add(`${ll}|${a >> 4}|${b >> 4}`) }; let outside = false; let up = false, down = false
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) add(l, cx + a * 3, cz + b * 3)
  const R = 160; for (let k = 0; k < R; k++) {
    const an = k / R * Math.PI * 2, dx = Math.cos(an), dz = Math.sin(an); let px = x / CELL + HALF, pz = z / CELL + HALF, gx = cx, gz = cz; const sx = Math.sign(dx), sz = Math.sign(dz), tdx = Math.abs(1 / dx), tdz = Math.abs(1 / dz); let tx = (sx > 0 ? gx + 1 - px : px - gx) * tdx, tz = (sz > 0 ? gz + 1 - pz : pz - gz) * tdz
    for (let s = 0; s < range; s++) {
      add(l, gx, gz); const i = idx(gx, gz); if (lv.flag[i] & FLAG.hole || (!lv.floor[i] && l > 0)) { down = true; add(l - 1, gx, gz); } if (!lv.ceil[i]) { up = true; add(l + 1, gx, gz); if (w.terrain && l >= 0 && (lv.floor[i] === TERRAIN || l > 0 || !w.levels.get(l + 1)?.floor[i])) { if (lv.floor[i] === TERRAIN) { outside = true; break } } }
      const horiz = tx < tz; const e = horiz ? (sx > 0 ? (gx + 1 < N ? lv.eW[idx(gx + 1, gz)] : 1) : lv.eW[i]) : (sz > 0 ? (gz + 1 < N ? lv.eN[idx(gx, gz + 1)] : 1) : lv.eN[i]); const t = e & 15
      if (t === E.Wall || t === E.Slit) break; if (isDoor(t) && t !== E.Cell) { const kx = horiz && sx > 0 ? gx + 1 : gx, kz = !horiz && sz > 0 ? gz + 1 : gz; if (!w.doors.get(`${l},${kx},${kz},${horiz ? 'W' : 'N'}`)) break }
      if (horiz) { gx += sx; tx += tdx } else { gz += sz; tz += tdz } if (!inb(gx, gz)) break; const j = idx(gx, gz); if (!w.open(l, gx, gz)) { add(l, gx, gz); if (!(lv.flag[i] & FLAG.cave) || s > 1) break } void j
    }
  }
  for (const st of w.stairs.values()) for (const [a, b] of World.stairCells(st)) if (Math.hypot(a - cx, b - cz) < 9 && (st.l === l || st.l + 1 === l)) { const here = `${l}|${a >> 4}|${b >> 4}`; if (S.has(here)) { const o = st.l === l ? l + 1 : l - 1; for (let p = -1; p <= 1; p++) for (let q = -1; q <= 1; q++) S.add(`${o}|${(a + p * 8) >> 4}|${(b + q * 8) >> 4}`) } }
  for (const sp of w.spirals.values()) if (Math.hypot(sp.x - x, sp.z - z) < 14) for (let ll = sp.l0; ll <= sp.l1; ll++) add(ll, w2c(sp.x), w2c(sp.z))
  if (outside) { for (const v of w.levels.keys()) if (v >= 0) for (let a = 0; a < N / CH; a++) for (let b = 0; b < N / CH; b++) S.add(`${v}|${a}|${b}`) } void up; void down; return S
}
