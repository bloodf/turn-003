import { World, idx, inb, type Ring, type Roof } from './world'
import { CELL, E, FLAG, FLOORS, HALF, N, TERRAIN, THEMES, WALLS, WS, WT, v2w, c2w, w2c, isTall, CEIL, DIRS, LH } from './defs'
import { model, type Model } from './catalog'
import { caveD, caveFloor } from './cavefield'
import { vnoise, hash3, fbm } from './rng'
export const CH = 16 // cells per chunk side
export interface Geo { p: Float32Array; n: Int8Array; u: Float32Array; c: Uint8Array; x: Uint8Array; i: Uint32Array; lo: [number, number, number]; hi: [number, number, number] }
export type Groups = Partial<Record<'solid' | 'cut' | 'ceil' | 'terr' | 'water' | 'grass' | 'cap', Geo>>
export interface Lib { layers: string[]; scale: number[]; geo(id: string, lod: number): LibGeo | null }
export interface LibGeo { nv: number; ni: number; nc: number; p: Float32Array; n: Int8Array; u: Float32Array; c: Uint8Array; x: Uint8Array; i: Uint16Array | Uint32Array }
class Buf {
  P = new Float32Array(3 * 4096); Nn = new Int8Array(4 * 4096); U = new Float32Array(2 * 4096); C = new Uint8Array(4 * 4096); X = new Uint8Array(4 * 4096); I = new Uint32Array(8192); nv = 0; ni = 0
  lo: [number, number, number] = [1e9, 1e9, 1e9]; hi: [number, number, number] = [-1e9, -1e9, -1e9]
  need(v: number, i: number) {
    let cap = this.P.length / 3; if (this.nv + v > cap) { while (cap < this.nv + v) cap *= 2; const g = <T extends { set(a: any): void }>(A: new (n: number) => T, o: any, k: number) => { const q = new A(cap * k); q.set(o); return q }; this.P = g(Float32Array as any, this.P, 3) as any; this.Nn = g(Int8Array as any, this.Nn, 4) as any; this.U = g(Float32Array as any, this.U, 2) as any; this.C = g(Uint8Array as any, this.C, 4) as any; this.X = g(Uint8Array as any, this.X, 4) as any }
    let ci = this.I.length; if (this.ni + i > ci) { while (ci < this.ni + i) ci *= 2; const q = new Uint32Array(ci); q.set(this.I); this.I = q }
  }
  v(x: number, y: number, z: number, nx: number, ny: number, nz: number, u: number, t: number, layer: number, ao = 255, r = 128, g = 128, b = 128, glow = 0, wind = 0, w = 0) {
    const k = this.nv++; this.P[k * 3] = x; this.P[k * 3 + 1] = y; this.P[k * 3 + 2] = z; this.Nn[k * 4] = nx * 127; this.Nn[k * 4 + 1] = ny * 127; this.Nn[k * 4 + 2] = nz * 127; this.U[k * 2] = u; this.U[k * 2 + 1] = t; this.C[k * 4] = r; this.C[k * 4 + 1] = g; this.C[k * 4 + 2] = b; this.C[k * 4 + 3] = ao; this.X[k * 4] = layer; this.X[k * 4 + 1] = glow; this.X[k * 4 + 2] = wind; this.X[k * 4 + 3] = w
    if (x < this.lo[0]) this.lo[0] = x; if (y < this.lo[1]) this.lo[1] = y; if (z < this.lo[2]) this.lo[2] = z; if (x > this.hi[0]) this.hi[0] = x; if (y > this.hi[1]) this.hi[1] = y; if (z > this.hi[2]) this.hi[2] = z; return k
  }
  tri(a: number, b: number, c: number) { this.I[this.ni++] = a; this.I[this.ni++] = b; this.I[this.ni++] = c }
  out(): Geo | undefined { if (!this.ni) return undefined; return { p: this.P.slice(0, this.nv * 3), n: this.Nn.slice(0, this.nv * 4), u: this.U.slice(0, this.nv * 2), c: this.C.slice(0, this.nv * 4), x: this.X.slice(0, this.nv * 4), i: this.I.slice(0, this.ni), lo: this.lo, hi: this.hi } }
}
type V3 = [number, number, number]
const EV = process_env()
function process_env() { return 0 }
export function buildChunk(w: World, lib: Lib, l: number, ccx: number, ccz: number, lod: number, propsHere: import('./world').Prop[]): Groups {
  const S = new Buf(), K = new Buf(), C = new Buf(), T = new Buf(), W = new Buf(), G = new Buf(), Q = new Buf(); let wf = 0
  const x0 = ccx * CH, z0 = ccz * CH, x1 = Math.min(N, x0 + CH), z1 = Math.min(N, z0 + CH), y0 = l * LH, LAY = Object.fromEntries(lib.layers.map((n, i) => [n, i])) as Record<string, number>, sc = lib.scale
  const lv = w.levels.get(l), outdoor = !!w.terrain
  const layerOf = (n: string) => LAY[n] ?? 0
  const open = (x: number, z: number) => w.open(l, x, z)
  const tallAt = (x: number, z: number, d: number) => isTall(w.etype(l, x, z, d))
  /** quad a,b,c,d counter-clockwise seen from the normal side */
  const quad = (B: Buf, a: V3, b: V3, c: V3, d: V3, n: V3, ua: [number, number], ub: [number, number], uc: [number, number], ud: [number, number], layer: number, ao: [number, number, number, number] = [255, 255, 255, 255], tint: V3 = [128, 128, 128], glow = 0) => {
    B.need(4, 6); const q = [B.v(...a, ...n, ...ua, layer, ao[0], ...tint, glow, 0, wf), B.v(...b, ...n, ...ub, layer, ao[1], ...tint, glow, 0, wf), B.v(...c, ...n, ...uc, layer, ao[2], ...tint, glow, 0, wf), B.v(...d, ...n, ...ud, layer, ao[3], ...tint, glow, 0, wf)]
    if (ao[0] + ao[2] > ao[1] + ao[3]) { B.tri(q[0], q[1], q[2]); B.tri(q[0], q[2], q[3]) } else { B.tri(q[1], q[2], q[3]); B.tri(q[1], q[3], q[0]) }
  }
  /** axis-aligned box with world-scaled uv */
  const box = (B: Buf, ax: number, ay: number, az: number, bx: number, by: number, bz: number, layer: number, o: { top?: boolean; bottom?: boolean; ao0?: number; ao1?: number; tint?: V3; grainY?: boolean; sides?: string } = {}) => {
    const s = sc[layer], A0 = o.ao0 ?? 200, A1 = o.ao1 ?? 240, t = o.tint ?? [128, 128, 128], sd = o.sides ?? 'nsew'; const uy = (y: number) => y / s
    const f = (p: V3, q: V3, r: V3, v: V3, n: V3, u0: number, u1: number, v0: number, v1: number, ao: [number, number, number, number]) => quad(B, p, q, r, v, n, [u0 / s, uy(v0)], [u1 / s, uy(v0)], [u1 / s, uy(v1)], [u0 / s, uy(v1)], layer, ao, t as V3)
    if (sd.includes('s')) f([ax, ay, bz], [bx, ay, bz], [bx, by, bz], [ax, by, bz], [0, 0, 1], ax, bx, ay, by, [A0, A0, A1, A1]); if (sd.includes('n')) f([bx, ay, az], [ax, ay, az], [ax, by, az], [bx, by, az], [0, 0, -1], -bx, -ax, ay, by, [A0, A0, A1, A1])
    if (sd.includes('e')) f([bx, ay, bz], [bx, ay, az], [bx, by, az], [bx, by, bz], [1, 0, 0], -bz, -az, ay, by, [A0, A0, A1, A1]); if (sd.includes('w')) f([ax, ay, az], [ax, ay, bz], [ax, by, bz], [ax, by, az], [-1, 0, 0], az, bz, ay, by, [A0, A0, A1, A1])
    if (o.top !== false) f([ax, by, bz], [bx, by, bz], [bx, by, az], [ax, by, az], [0, 1, 0], ax, bx, -bz, -az, [A1, A1, A1, A1]); if (o.bottom) f([ax, ay, az], [bx, ay, az], [bx, ay, bz], [ax, ay, bz], [0, -1, 0], ax, bx, az, bz, [A0, A0, A0, A0])
  }
  const prop = (m: Model, x: number, y: number, z: number, r: number, s: number, theme?: string, B?: Buf, tint?: V3, lodUse = lod) => {
    const g = lib.geo(m.id, Math.min(1, lodUse)); if (!g) return; const cs = Math.cos(r), sn = Math.sin(r), stone = theme ? layerOf(theme) : -1, ash = LAY.ashlar, rockL = LAY.rock, rockTo = m.cat === 'nature' && l < 0 || m.id === 'frame_cave' ? rockLayerAt(x, z) : -1
    const put = (D: Buf, i0: number, i1: number) => {
      if (i1 <= i0) return; D.need(g.nv, i1 - i0); const map = new Int32Array(g.nv).fill(-1)
      for (let k = i0; k < i1; k++) { const j = g.i[k]; let q = map[j]; if (q < 0) { const px = g.p[j * 3] * s, py = g.p[j * 3 + 1] * s, pz = g.p[j * 3 + 2] * s, nx = g.n[j * 4] / 127, ny = g.n[j * 4 + 1] / 127, nz = g.n[j * 4 + 2] / 127; let la = g.x[j * 4], uu = g.u[j * 2], vv = g.u[j * 2 + 1]; if (stone >= 0 && la === ash) { uu *= sc[ash] / sc[stone]; vv *= sc[ash] / sc[stone]; la = stone } if (rockTo >= 0 && la === rockL) la = rockTo
        q = D.v(x + px * cs + pz * sn, y + py, z - px * sn + pz * cs, nx * cs + nz * sn, ny, -nx * sn + nz * cs, uu, vv, la >= 100 ? la - 100 : la, g.c[j * 4 + 3], tint ? Math.min(255, g.c[j * 4] * tint[0]) : g.c[j * 4], tint ? Math.min(255, g.c[j * 4 + 1] * tint[1]) : g.c[j * 4 + 1], tint ? Math.min(255, g.c[j * 4 + 2] * tint[2]) : g.c[j * 4 + 2], g.x[j * 4 + 1], g.x[j * 4 + 2]); map[j] = q } D.I[D.ni++] = q } }
    put(B ?? S, 0, g.ni - g.nc); put(B === C ? C : K, g.ni - g.nc, g.ni)
  }
  const CAPY = 2.33; const capBox = (ax: number, az: number, bx: number, bz: number) => quad(Q, [ax, y0 + CAPY, bz], [bx, y0 + CAPY, bz], [bx, y0 + CAPY, az], [ax, y0 + CAPY, az], [0, 1, 0], [ax / 3, bz / 3], [bx / 3, bz / 3], [bx / 3, az / 3], [ax / 3, az / 3], LAY.rock_dark, [255, 255, 255, 255], [150, 138, 128])
  const TILES: Record<string, number> = { oak: 0, oak_old: 0, birch: 0, tree_autumn: 8, pine: 1, pine_tall: 1, pine_snow: 1 }
  /** far trees: a thin trunk and a handful of big leaf cards */
  const farTree = (m: Model, x: number, y: number, z: number, r: number, s: number) => {
    const H = m.hi[1] * s, tile = TILES[m.id], pine = tile === 1, R = Math.min(m.hi[0] - m.lo[0], m.hi[2] - m.lo[2]) / 2 * s, tw = H * (pine ? .02 : .028), th = H * (pine ? .3 : .5); const bl = LAY.bark
    S.need(6, 12); const b = [0, 1, 2].map(k => { const a = r + k * 2.094; return S.v(x + Math.cos(a) * tw, y, z + Math.sin(a) * tw, Math.cos(a), 0, Math.sin(a), k / 3, 0, bl, 190) }), t = [0, 1, 2].map(k => { const a = r + k * 2.094; return S.v(x + Math.cos(a) * tw * .6, y + th, z + Math.sin(a) * tw * .6, Math.cos(a), 0, Math.sin(a), k / 3, th / 1.6, bl, 220) }); for (let k = 0; k < 3; k++) { const j = (k + 1) % 3; S.tri(b[j], b[k], t[k]); S.tri(b[j], t[k], t[j]) }
    if (tile === undefined) return; const snow = m.id === 'pine_snow' ? 1.6 : 1; const tint = (k: number): V3 => [Math.min(255, 128 * k * snow), Math.min(255, 128 * k * snow), Math.min(255, 128 * k * snow)]
    const card = (cx: number, cy: number, cz: number, ax: V3, ay: V3, k: number) => { K.need(4, 6); const c = tint(k), nn: V3 = [0, .8, 0]; const q = ([[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]] as const).map(([u, v, a, d]) => { const px = ax[0] * u + ay[0] * v, py = ax[1] * u + ay[1] * v, pz = ax[2] * u + ay[2] * v, L = Math.hypot(px, py + .4, pz) || 1; return K.v(cx + px, cy + py, cz + pz, px / L * .6, (py / L * .5 + .6), pz / L * .6, a, d, tile, 235, ...c, 0, 0) }); K.tri(q[0], q[1], q[2]); K.tri(q[0], q[2], q[3]); void nn }
    if (pine) for (let k = 0; k < 3; k++) { const a = r + k * 1.047, w = R * .95, h = H * .52; card(x, y + H * .5, z, [Math.cos(a) * w, 0, Math.sin(a) * w], [0, h, 0], .8 + k * .1) }
    else { const cy = y + H * .64, w = R * 1.02, h = H * .36; for (let k = 0; k < 3; k++) { const a = r + k * 1.047; card(x, cy, z, [Math.cos(a) * w, 0, Math.sin(a) * w], [0, h, 0], .82 + k * .09) } card(x, cy + h * .15, z, [w * .9, 0, 0], [0, 0, w * .9], 1.05) }
  }
  const stoneAt = (x: number, z: number, lvl = l) => { const q = w.roomAt(lvl, x, z); return q ? THEMES[q.theme].stone : lvl < 0 ? THEMES[w.env.theme].stone : undefined }
  // ================================================================= walls on edges
  const masonry = (st: number) => st !== WS.timber && st !== WS.planks && st !== WS.rock && st !== WS.wattle
  const wallLayer = (st: number) => { const n = WALLS[st]; return layerOf(n === 'timber' || n === 'wattle' ? 'plaster' : n) }
  const ROWS: [number, number, number][] = lod ? [[.0, 0, 150], [0, 4, 220]] : [[.07, 0, 120], [.07, .34, 205], [0, .42, 190], [0, 1.3, 250], [0, 3.1, 250], [0, 3.45, 215], [.08, 3.54, 225], [.08, 4, 170]]
  const FLATR: [number, number, number][] = lod ? [[0, 0, 150], [0, 4, 220]] : [[0, 0, 130], [0, .55, 235], [0, 3.3, 245], [0, 4, 175]]
  const doWall = (x: number, z: number, d: 2 | 3) => {
    const e = d === 2 ? lv!.eW[idx(x, z)] : lv!.eN[idx(x, z)], t = e & 15, st = e >> 4; if (!t) return
    const ax = d === 3 // runs along x
    const wx = v2w(x), wz = v2w(z), mx = wx + (ax ? CELL / 2 : 0), mz = wz + (ax ? 0 : CELL / 2), rot = ax ? 0 : Math.PI / 2; const A: [number, number] = [x, z], Bc: [number, number] = ax ? [x, z - 1] : [x - 1, z]
    const va = open(...A) || (l >= 1 && outdoor), vb = open(...Bc) || (l >= 1 && outdoor); const theme = stoneAt(...A) ?? stoneAt(...Bc), h0 = WT / 2
    const M = (id: string, dy = 0, r = 0, s = 1) => { if (lod > 1 && (id.startsWith('frame_') && id !== 'frame_cave' && id !== 'frame_gate' || id === 'arrow_slit' || id === 'rubble_small')) return; if (lod > 1 && id.startsWith('window')) { const q = h0 + .01, yb = 1.1, yt = 2.2, hw = .36; for (const sd of [1, -1]) { const n: V3 = ax ? [0, 0, sd] : [sd, 0, 0]; const p = (a: number, y: number): V3 => ax ? [mx + a, y0 + y, mz + sd * q] : [mx + sd * q, y0 + y, mz + a]; const f = ax ? sd > 0 : sd < 0; const c: V3[] = f ? [p(-hw, yb), p(hw, yb), p(hw, yt), p(-hw, yt)] : [p(hw, yb), p(-hw, yb), p(-hw, yt), p(hw, yt)]; quad(S, c[0], c[1], c[2], c[3], n, [0, 0], [.5, 0], [.5, .8], [0, .8], LAY.glass, [255, 255, 255, 255], [128, 128, 128], 90) } return } const m = model(id); if (m) prop(m, mx, y0 + dy, mz, rot + r, s, masonry(st) ? WALLS[st] : theme) }
    const lbox = (a0: number, a1: number, h2: number, yb: number, yt: number, lay: number, off = 0) => ax ? box(S, wx + a0, y0 + yb, wz - h2 + off, wx + a1, y0 + yt, wz + h2 + off, lay, { bottom: yb > .2 }) : box(S, wx - h2 + off, y0 + yb, wz + a0, wx + h2 + off, y0 + yt, wz + a1, lay, { bottom: yb > .2 })
    if (lod && t === E.Merlon) { const L = wallLayer(st); lbox(0, CELL, .2, 0, .68, L); lbox(.35, 1.15, .2, .68, 1.4, L); return }
    if (lod && t === E.Rail) { const L = st === 1 ? LAY.beam : wallLayer(0); lbox(0, CELL, .06, .92, 1.04, L); if (lod < 2) { lbox(0, CELL, .03, .45, .53, L); lbox(0, .1, .05, 0, .95, L) } return }
    if (lod && t === E.Fence) { const gy = outdoor && l === 0 ? w.terrainH(mx, mz) - y0 : 0; if (st === 1) lbox(0, CELL, .1, gy, gy + 2.4, LAY.bark); else if (st === 2) lbox(0, CELL, .2, gy, gy + .9, LAY.rock); else { lbox(0, CELL, .03, gy + .4, gy + .5, LAY.planks_old); lbox(0, CELL, .03, gy + .78, gy + .89, LAY.planks_old); lbox(0, .1, .05, gy, gy + 1.1, LAY.planks_old) } return }
    if (t === E.Merlon) { const outA = !va || w.floorAt(l, ...A) === 0; M('merlon', 0, 0); void outA; return }
    if (t === E.Rail) { M(st === 1 ? 'rail_wood' : 'balustrade'); return }
    if (t === E.Fence) { const y = outdoor && l === 0 ? w.terrainH(mx, mz) - y0 : 0; M(st === 1 ? 'palisade' : st === 2 ? 'wall_low' : 'fence_wood', y); return }
    const layer = wallLayer(st), s = sc[layer], h = WT / 2, rows = masonry(st) ? ROWS : FLATR, vert = st === WS.planks
    const P = (a: number, off: number, y: number, side: number): V3 => ax ? [wx + a, y0 + y, wz + side * (h + off)] : [wx + side * (h + off), y0 + y, wz + a]
    const UV = (a: number, y: number, side: number): [number, number] => { const q = (ax ? wx + a : -(wz + a)) * side / s; return vert ? [(y + (x * 7 + z * 3) % 5) / s, q] : [q, (y + y0) / s] }
    // a wall tall on this side meets another wall at each end? darkens that end
    const meet = (end: 0 | 1, side: number) => { const cx = ax ? x : (side > 0 ? x : x - 1), cz = ax ? (side > 0 ? z : z - 1) : z; return tallAt(cx, cz, ax ? (end ? 0 : 2) : (end ? 1 : 3)) ? .66 : 1 }
    const strip = (a0: number, a1: number, yb: number, yt: number) => {
      if (yb < CAPY && yt > CAPY) capBox(ax ? wx + a0 : wx - h - .02, ax ? wz - h - .02 : wz + a0, ax ? wx + a1 : wx + h + .02, ax ? wz + h + .02 : wz + a1)
      wf = 255
      for (const side of [1, -1] as const) {
        if (side > 0 ? !va : !vb) continue; const n: V3 = ax ? [0, 0, side] : [side, 0, 0]
        const rr = rows.filter(r => r[1] > yb + .02 && r[1] < yt - .02); const at = (y: number): [number, number, number] => { for (let i = 0; i < rows.length - 1; i++) if (y >= rows[i][1] && y <= rows[i + 1][1]) { const k = (y - rows[i][1]) / (rows[i + 1][1] - rows[i][1]); return [rows[i][0] + (rows[i + 1][0] - rows[i][0]) * k, y, rows[i][2] + (rows[i + 1][2] - rows[i][2]) * k] } return [0, y, 230] }
        const list = [at(yb), ...rr, at(yt)]; const m0 = a0 < .01 ? meet(0, side) : 1, m1 = a1 > CELL - .01 ? meet(1, side) : 1; const flip = ax ? side < 0 : side > 0
        for (let i = 0; i < list.length - 1; i++) {
          const [o0, ya, aoA] = list[i], [o1, yb2, aoB] = list[i + 1]; const dy = yb2 - ya, dof = o1 - o0; const L = Math.hypot(dy, dof) || 1; const nn: V3 = [n[0] * dy / L, -dof / L, n[2] * dy / L]
          const l0: V3 = P(a0, o0, ya, side), r0: V3 = P(a1, o0, ya, side), l1: V3 = P(a0, o1, yb2, side), r1: V3 = P(a1, o1, yb2, side); const uL0 = UV(a0, ya, side), uR0 = UV(a1, ya, side), uL1 = UV(a0, yb2, side), uR1 = UV(a1, yb2, side)
          if (!flip) quad(S, l0, r0, r1, l1, nn, uL0, uR0, uR1, uL1, layer, [aoA * m0, aoA * m1, aoB * m1, aoB * m0]); else quad(S, r0, l0, l1, r1, nn, uR0, uL0, uL1, uR1, layer, [aoA * m1, aoA * m0, aoB * m0, aoB * m1])
        }
      }
      wf = 0
    }
    const topCap = (y: number) => { if (ax) quad(S, [wx, y0 + y, wz + h], [wx + CELL, y0 + y, wz + h], [wx + CELL, y0 + y, wz - h], [wx, y0 + y, wz - h], [0, 1, 0], [wx / s, h / s], [(wx + CELL) / s, h / s], [(wx + CELL) / s, -h / s], [wx / s, -h / s], layer); else quad(S, [wx - h, y0 + y, wz + CELL], [wx + h, y0 + y, wz + CELL], [wx + h, y0 + y, wz], [wx - h, y0 + y, wz], [0, 1, 0], [-h / s, wz / s], [h / s, wz / s], [h / s, (wz + CELL) / s], [-h / s, (wz + CELL) / s], layer) }
    const tim = st === WS.timber
    const beams = () => { // exposed frame on both faces
      if (!tim) return; const bl = LAY.beam, th = h + .035; for (const side of [1, -1]) { if (side > 0 ? !va : !vb) continue; const b = (a0: number, a1: number, y1: number, y2: number) => { const q0 = side > 0 ? h - .05 : -th, q1 = side > 0 ? th : -h + .05; if (ax) box(S, wx + a0, y0 + y1, wz + q0, wx + a1, y0 + y2, wz + q1, bl, { sides: side > 0 ? 's' : 'n', bottom: y1 > .1, ao0: 220 }); else box(S, wx + q0, y0 + y1, wz + a0, wx + q1, y0 + y2, wz + a1, bl, { sides: side > 0 ? 'e' : 'w', bottom: y1 > .1, ao0: 220 }) }
        if (t === E.Wall || t === E.Window) b(0, CELL, 0, .2); b(0, CELL, 3.74, 3.98); if (t === E.Wall && !lod) { b(0, CELL, 1.9, 2.06); if (hash3(x, z, l) < .34) { const n: V3 = ax ? [0, 0, side] : [side, 0, 0], dd = hash3(z, x, l + 3) < .5; const q = th - .004; const y1 = 2.06, y2 = 3.74, wB = .16; const a0 = dd ? 0 : CELL - wB * 1.2, a1 = dd ? CELL - wB * 1.2 : 0; const pt = (a: number, y: number): V3 => ax ? [wx + a, y0 + y, wz + side * q] : [wx + side * q, y0 + y, wz + a]; const pa = pt(a0, y1), pb = pt(a0 + wB * 1.2, y1), pc = pt(a1 + wB * 1.2, y2), pd = pt(a1, y2); const sb = sc[bl]; const flip = ax ? side < 0 : side > 0; if (!flip) quad(S, pa, pb, pc, pd, n, [0, 0], [wB / sb, 0], [wB / sb, 2.4 / sb], [0, 2.4 / sb], bl); else quad(S, pb, pa, pd, pc, n, [0, 0], [wB / sb, 0], [wB / sb, 2.4 / sb], [0, 2.4 / sb], bl) } } } }
    const upT = isTall(w.etype(l + 1, x, z, d))
    if (t === E.Ruin) { const n = 4; for (let k = 0; k < n; k++) { const H = .35 + 2.1 * fbm((ax ? x + k / n : z + k / n) * .55 + 9, (ax ? z : x) * 3.1, 4, 2) ** 1.2; const H2 = H + (hash3(x * 4 + k, z, 8) - .5) * .35; const a0 = CELL * k / n, a1 = CELL * (k + 1) / n; const g = outdoor && l === 0 ? Math.min(0, w.terrainH(mx, mz)) - .1 : 0; if (ax) box(S, wx + a0, y0 + g, wz - h, wx + a1, y0 + H2, wz + h, layer, { ao0: 140 }); else box(S, wx - h, y0 + g, wz + a0, wx + h, y0 + H2, wz + a1, layer, { ao0: 140 }) } if (!lod && hash3(x, z, 2) < .5) M('rubble_small', 0, hash3(z, x, 2) * 6); return }
    if (t === E.Wall) { strip(0, CELL, 0, 4); beams() }
    else if (t === E.Slit) { strip(0, CELL, 0, 4); M('arrow_slit') }
    else if (t === E.Window && lod > 1) { strip(0, CELL, 0, 4); M('window_wood') }
    else if (t === E.Window) { const w0 = tim || st === WS.planks || st === WS.wattle; const [a, b, yb, yt] = w0 ? [.3, 1.2, 1.02, 2.2] : [.44, 1.06, 1.08, 2.32]; strip(0, a, yb, yt); strip(b, CELL, yb, yt); strip(0, CELL, 0, yb); strip(0, CELL, yt, 4); M(w0 ? 'window_wood' : 'window_stone'); beams() }
    else if (t === E.Grille) { strip(0, CELL, 2.36, 4); M('bars_panel'); lintelUnder(ax, wx, wz, 2.36, layer) }
    else if (t === E.Arch) { if (st === WS.rock) { M('frame_cave'); const cl = layerOf(THEMES[w.roomAt(l, ...A)?.theme ?? w.env.theme].rock); for (const side of [1, -1]) { const n: V3 = ax ? [0, 0, side] : [side, 0, 0]; const p: V3[] = [[0, 2.5], [CELL, 2.5], [CELL, 4], [0, 4]].map(([a, y]) => P(a, 0, y, side)) as V3[]; const flip = ax ? side < 0 : side > 0; const u: [number, number][] = [[0, 0], [.3, 0], [.3, .3], [0, .3]]; if (!flip) quad(S, p[0], p[1], p[2], p[3], n, u[0], u[1], u[2], u[3], cl); else quad(S, p[1], p[0], p[3], p[2], n, u[1], u[0], u[3], u[2], cl) } } else if (tim || st === WS.planks) { strip(0, CELL, 2.4, 4); M('frame_wood'); beams() } else { strip(0, CELL, 2.7, 4); M('frame_arch') } }
    else if (t === E.GateA || t === E.GateB) { strip(0, CELL, 3.4, 4); if (t === E.GateA && lod < 2) { const m = model('frame_gate'); if (m) prop(m, ax ? wx + CELL : wx, y0, ax ? wz : wz + CELL, rot, 1, masonry(st) ? WALLS[st] : theme) } }
    else { // single doors
      strip(0, CELL, 2.4, 4); M(tim || st === WS.planks || st === WS.wattle ? 'frame_wood' : 'frame_stone'); lintelUnder(ax, wx, wz, 2.4, layer); beams()
    }
    if (!upT) topCap(l === -1 && outdoor ? 3.98 : 4); void EV
  }
  const lintelUnder = (ax: boolean, wx: number, wz: number, y: number, layer: number) => { const h = WT / 2, s = sc[layer]; if (ax) quad(S, [wx, y0 + y, wz - h], [wx + CELL, y0 + y, wz - h], [wx + CELL, y0 + y, wz + h], [wx, y0 + y, wz + h], [0, -1, 0], [wx / s, 0], [(wx + CELL) / s, 0], [(wx + CELL) / s, .12], [wx / s, .12], layer, [120, 120, 120, 120]); else quad(S, [wx - h, y0 + y, wz], [wx + h, y0 + y, wz], [wx + h, y0 + y, wz + CELL], [wx - h, y0 + y, wz + CELL], [0, -1, 0], [0, wz / s], [.12, wz / s], [.12, (wz + CELL) / s], [0, (wz + CELL) / s], layer, [120, 120, 120, 120]) }
  // posts where walls turn, end or meet
  const posts = () => {
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) {
      const eE = w.edge(l, x, z, 3), eW2 = w.edge(l, x - 1, z, 3), eS = w.edge(l, x, z, 2), eN = w.edge(l, x, z - 1, 2); const T4 = [eE, eW2, eS, eN].map(e => isTall(e & 15)); const n = T4.filter(Boolean).length; if (!n) continue
      const st = Math.max(...[eE, eW2, eS, eN].filter(e => isTall(e & 15)).map(e => e >> 4)); const tim = st === WS.timber; const straight = n === 2 && ((T4[0] && T4[1]) || (T4[2] && T4[3])); const any = open(x, z) || open(x - 1, z) || open(x, z - 1) || open(x - 1, z - 1) || (l >= 1 && outdoor); if (!any || st === WS.rock) continue
      if ([eE, eW2, eS, eN].every(e => !isTall(e & 15) || ((e & 15) === E.Arch && (e >> 4) === WS.rock))) continue
      const px = v2w(x), pz = v2w(z), TP = l === -1 && outdoor ? 3.97 : 4
      if (tim) { const r = .225; capBox(px - r, pz - r, px + r, pz + r); box(S, px - r, y0, pz - r, px + r, y0 + TP, pz + r, LAY.beam, { ao0: 170, top: !isTall(w.etype(l + 1, x, z, 3)) }); continue }
      if (straight) continue
      const layer = st === WS.planks ? LAY.beam : wallLayer(st)
      if (lod > 1 && straight) continue
      if (st === WS.planks || st === WS.wattle || lod) { const r = .215; capBox(px - r, pz - r, px + r, pz + r); box(S, px - r, y0, pz - r, px + r, y0 + TP, pz + r, layer, { ao0: 150 }); continue }
      const a = .30, b = .225; capBox(px - b, pz - b, px + b, pz + b); box(S, px - a, y0, pz - a, px + a, y0 + .38, pz + a, layer, { ao0: 130, ao1: 210 }); box(S, px - b, y0 + .38, pz - b, px + b, y0 + 3.5, pz + b, layer, { ao0: 200, ao1: 230, top: false }); box(S, px - a, y0 + 3.5, pz - a, px + a, y0 + TP, pz + a, layer, { ao0: 220, ao1: 190, bottom: true })
    }
  }
  // ================================================================= floors and ceilings
  const blobs = lod ? [] : propsHere.filter(p => p.l === l).map(p => { const m = model(p.m); if (!m || m.mount || m.flat || m.small || m.hi[1] < .25) return null; const r = m.col === 'trunk' ? .5 : Math.min(1.6, Math.max(m.hi[0] - m.lo[0], m.hi[2] - m.lo[2]) / 2) * p.s; return [p.x, p.z, r] }).filter(Boolean) as number[][]
  const blob = (px: number, pz: number) => { let k = 1; for (const [a, b, r] of blobs) { const d = Math.hypot(px - a, pz - b); if (d < r + .45) k = Math.min(k, .5 + .5 * Math.max(0, (d - r * .55) / (r * .45 + .45))) } return k }
  const cells = () => {
    const caveCells: [number, number][] = []
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) {
      const i = idx(x, z), f = lv!.floor[i], fl = lv!.flag[i], ce = lv!.ceil[i]
      if (fl & FLAG.cave) { caveCells.push([x, z]); }
      else if (f && !(l === 0 && f === TERRAIN) && !(fl & FLAG.virt) && !(fl & FLAG.solid)) {
        const y = y0 + lv!.h[i] * .25, layer = layerOf(FLOORS[f]), s = sc[layer], wx = v2w(x), wz = v2w(z); const t = [0, 1, 2, 3].map(d => tallAt(x, z, d)), cor = (gx: number, gz: number) => (isTall(w.etype(l, gx, gz, 3)) || isTall(w.etype(l, gx - 1, gz, 3)) || isTall(w.etype(l, gx, gz, 2)) || isTall(w.etype(l, gx, gz - 1, 2))) ? .52 : 1
        const nS = lod ? 1 : 2, id: number[] = []; S.need((nS + 1) ** 2, nS * nS * 6)
        for (let b = 0; b <= nS; b++) for (let a = 0; a <= nS; a++) { const px = wx + CELL * a / nS, pz = wz + CELL * b / nS; let ao = 1; const ea = a === 0 || a === nS, eb = b === 0 || b === nS; if (ea && eb) ao = cor(x + (a ? 1 : 0), z + (b ? 1 : 0)); else if (ea) ao = t[a ? 0 : 2] ? .58 : 1; else if (eb) ao = t[b ? 1 : 3] ? .58 : 1; ao *= blob(px, pz); id.push(S.v(px, y, pz, 0, 1, 0, px / s, -pz / s, layer, 255 * ao, 128, 128, 128, layer === LAY.rune ? 60 : 0)) }
        for (let b = 0; b < nS; b++) for (let a = 0; a < nS; a++) { const p = id[b * (nS + 1) + a], q = id[b * (nS + 1) + a + 1], r = id[(b + 1) * (nS + 1) + a + 1], u = id[(b + 1) * (nS + 1) + a]; if (((a + b) & 1) === 0) { S.tri(u, r, p); S.tri(r, q, p) } else { S.tri(u, r, q); S.tri(u, q, p) } }
        // risers to lower neighbours
        for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (!inb(nx, nz)) continue; const j = idx(nx, nz); const nf = lv!.floor[j]; const cave = lv!.flag[j] & FLAG.cave; let ny = nf ? y0 + lv!.h[j] * .25 : lv!.flag[j] & FLAG.hole ? y - .32 : fl & FLAG.bridge ? y - .3 : y; if (l === 0 && nf === TERRAIN) { ny = Math.min(y, w.terrainH(c2w(nx), c2w(nz)) - .1); if (!(fl & FLAG.bridge) && y - ny < .12) ny = y - .12; if (fl & FLAG.bridge) ny = y - .35 } if (cave || ny >= y - .01) continue; const rl = nf || lv!.flag[j] & FLAG.hole ? (FLOORS[f] === 'planks' ? LAY.beam : LAY.ashlar) : layer, rs = sc[rl]; const e0: V3 = d === 0 ? [wx + CELL, 0, wz + CELL] : d === 1 ? [wx, 0, wz + CELL] : d === 2 ? [wx, 0, wz] : [wx + CELL, 0, wz], e1: V3 = d === 0 ? [wx + CELL, 0, wz] : d === 1 ? [wx + CELL, 0, wz + CELL] : d === 2 ? [wx, 0, wz + CELL] : [wx, 0, wz]; const u0 = (e0[0] + e0[2]) / rs, u1 = u0 + CELL / rs; quad(S, [e0[0], ny, e0[2]], [e1[0], ny, e1[2]], [e1[0], y, e1[2]], [e0[0], y, e0[2]], [DIRS[d][0], 0, DIRS[d][1]], [u0, ny / rs], [u1, ny / rs], [u1, y / rs], [u0, y / rs], rl, [150, 150, 230, 230]) }
        if (fl & (FLAG.water | FLAG.lava)) { const Y = y0 - (lv!.h[i] <= -4 ? .3 : .14); liquid(fl & FLAG.lava ? S : W, wx, wz, wx + CELL, wz + CELL, Y, !!(fl & FLAG.lava)) }
      }
      if (ce && ce !== CEIL.rock && !(fl & FLAG.virt)) ceilCell(x, z, ce)
    }
    if (caveCells.length || nearCaves()) cave(caveCells)
  }
  const liquid = (B: Buf, a: number, b: number, c: number, d: number, Y: number, lava: boolean) => { const la = lava ? LAY.lava : 0, s = lava ? sc[LAY.lava] : 4; quad(B, [a, Y, d], [c, Y, d], [c, Y, b], [a, Y, b], [0, 1, 0], [a / s, -d / s], [c / s, -d / s], [c / s, -b / s], [a / s, -b / s], la, [255, 255, 255, 255], [128, 128, 128], lava ? 255 : 0) }
  const ceilCell = (x: number, z: number, ce: number) => {
    const wx = v2w(x), wz = v2w(z), q = w.roomAt(l, x, z), th = THEMES[q?.theme ?? w.env.theme]
    const corner = (gx: number, gz: number) => (isTall(w.etype(l, gx, gz, 3)) || isTall(w.etype(l, gx - 1, gz, 3)) || isTall(w.etype(l, gx, gz, 2)) || isTall(w.etype(l, gx, gz - 1, 2))) ? .5 : .92
    if (ce === CEIL.vault && q && q.type !== 'corridor') {
      const layer = layerOf(th.wall === 'dwarven' ? 'dwarven' : th.wall), s = sc[layer], W = q.x1 - q.x0 + 1, D = q.z1 - q.z0 + 1, nx = Math.max(1, Math.round(W / 3.2)), nz = Math.max(1, Math.round(D / 3.2)), n = lod ? 2 : 4; const arch = (t: number) => Math.sqrt(Math.max(0, 1 - t * t)); const hh = (px: number, pz: number) => { const u = ((px - v2w(q.x0)) / (W * CELL) * nx) % 1 * 2 - 1, v = ((pz - v2w(q.z0)) / (D * CELL) * nz) % 1 * 2 - 1; return y0 + 2.75 + 1.05 * Math.max(arch(u), arch(v)) }
      C.need((n + 1) ** 2, n * n * 6); const id: number[] = []; for (let b = 0; b <= n; b++) for (let a = 0; a <= n; a++) { const eps = 1e-4; const px = wx + CELL * a / n, pz = wz + CELL * b / n, qx = Math.min(Math.max(px, v2w(q.x0) + eps), v2w(q.x1 + 1) - eps), qz = Math.min(Math.max(pz, v2w(q.z0) + eps), v2w(q.z1 + 1) - eps); const y = hh(qx, qz), e = .08; const gx = (hh(Math.min(qx + e, v2w(q.x1 + 1) - eps), qz) - hh(Math.max(qx - e, v2w(q.x0) + eps), qz)) / (2 * e), gz = (hh(qx, Math.min(qz + e, v2w(q.z1 + 1) - eps)) - hh(qx, Math.max(qz - e, v2w(q.z0) + eps))) / (2 * e); const L = Math.hypot(gx, 1, gz); const ao = Math.min(1, .45 + (y - y0 - 2.75) * .55); id.push(C.v(px, y, pz, gx / L, -1 / L, gz / L, px / s, pz / s, layer, 255 * ao)) }
      for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) { const p = id[b * (n + 1) + a], k = id[b * (n + 1) + a + 1], r = id[(b + 1) * (n + 1) + a + 1], u = id[(b + 1) * (n + 1) + a]; C.tri(p, k, r); C.tri(p, r, u) } return
    }
    const wood = ce === CEIL.beams, layer = wood ? LAY.planks_old : layerOf(th.wall), s = sc[layer], Y = y0 + (wood ? 3.78 : 3.7); const A = [corner(x, z), corner(x + 1, z), corner(x + 1, z + 1), corner(x, z + 1)].map(v => v * 255) as [number, number, number, number]
    quad(C, [wx, Y, wz], [wx + CELL, Y, wz], [wx + CELL, Y, wz + CELL], [wx, Y, wz + CELL], [0, -1, 0], [wx / s, wz / s], [(wx + CELL) / s, wz / s], [(wx + CELL) / s, (wz + CELL) / s], [wx / s, (wz + CELL) / s], layer, A)
    if (lod) return; const along = q ? (q.x1 - q.x0) >= (q.z1 - q.z0) : true
    if (wood) { const c = along ? wx + .75 : wz + .75; if (along) box(C, c - .1, Y - .24, wz, c + .1, Y, wz + CELL, LAY.beam, { top: false, bottom: true, sides: 'ew', ao0: 220, ao1: 150 }); else box(C, wx, Y - .24, c - .1, wx + CELL, Y, c + .1, LAY.beam, { top: false, bottom: true, sides: 'ns', ao0: 220, ao1: 150 }) }
    else if (along ? (x & 1) === 0 : (z & 1) === 0) { if (along) box(C, wx - .16, Y - .26, wz, wx + .16, Y, wz + CELL, layer, { top: false, bottom: true, sides: 'ew', ao0: 220, ao1: 140 }); else box(C, wx, Y - .26, wz - .16, wx + CELL, Y, wz + .16, layer, { top: false, bottom: true, sides: 'ns', ao0: 220, ao1: 140 }) }
  }
  // ================================================================= caves
  const nearCaves = () => { for (let z = z0 - 1; z <= z1; z++) for (let x = x0 - 1; x <= x1; x++) if (w.flagAt(l, x, z) & FLAG.cave) return true; return false }
  const rockLayerAt = (px: number, pz: number) => { const cx = w2c(px), cz = w2c(pz); for (const [a, b] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { const q = w.roomAt(l, cx + a, cz + b); if (q) return layerOf(THEMES[q.theme].rock) } return layerOf(THEMES[w.env.theme].rock) }
  const cave = (list: [number, number][]) => {
    const sub = lod > 1 ? 1.5 : lod ? 1.5 : .5, n = Math.round(CELL / sub)
    // contour
    const D = new Map<number, number>(); const gk = (a: number, b: number) => (b + 2) * 4096 + a + 2; const nx = (x1 - x0) * n, nz = (z1 - z0) * n; const px = (a: number) => v2w(x0) + a * sub, pz = (b: number) => v2w(z0) + b * sub
    const d = (a: number, b: number) => { const k = gk(a, b); let v = D.get(k); if (v === undefined) { v = caveD(w, l, px(a), pz(b)); D.set(k, v) } return v }
    const prof: [number, number, number][] = lod ? [[.2, 0, 120], [-.05, 1.4, 255], [.7, 3.9, 140]] : [[.34, -.25, 80], [.2, .12, 130], [.02, .6, 220], [-.08, 1.3, 255], [-.03, 2.1, 255], [.16, 2.9, 230], [.5, 3.5, 180], [1.0, 3.95, 130]]
    const grad = (x: number, z: number): [number, number] => { const e = .3; let gx = caveD(w, l, x + e, z) - caveD(w, l, x - e, z), gz = caveD(w, l, x, z + e) - caveD(w, l, x, z - e); const L = Math.hypot(gx, gz) || 1; return [gx / L, gz / L] }
    const col = new Map<string, number[]>(); let alongU = 0
    const column = (x: number, z: number) => { const key = `${Math.round(x * 200)},${Math.round(z * 200)}`; let c = col.get(key); if (c) return c; const [gx, gz] = grad(x, z), la = rockLayerAt(x, z), s = sc[la]; c = []; S.need(prof.length, 0); const u = (x * (Math.abs(gz) > Math.abs(gx) ? 1 : 0) + z * (Math.abs(gx) >= Math.abs(gz) ? 1 : 0)) / s; const fy = Math.min(0, (caveFloor(w, l, x + gx * .3, z + gz * .3) - y0)); for (const [o, y, ao] of prof) { const nn = (fbm(x * .8 + y * .6, z * .8 - y * .5, 21 + l, 3) - .5) * .75; const off = o + nn * (y > 3.4 ? .4 : 1), Y = y <= .2 ? y + fy : y; c.push(S.v(x + gx * off, y0 + Y, z + gz * off, gx, y > 2.6 ? -.5 : y < .5 ? .35 : 0, gz, u, (y + y0) / s, la, ao, 128, 128, 128, 0, 0, 128)) } void alongU; col.set(key, c); return c }
    const lerp = (ax: number, az: number, da: number, bx: number, bz: number, db: number): [number, number] => { const t = da / (da - db); return [ax + (bx - ax) * t, az + (bz - az) * t] }
    for (let b = 0; b < nz; b++) for (let a = 0; a < nx; a++) {
      const cx = x0 + Math.floor(a / n), cz = z0 + Math.floor(b / n); const fc = w.flagAt(l, cx, cz), op = open(cx, cz); if (op && !(fc & FLAG.cave)) continue
      if (!op) { let near = false; for (let q = -1; q <= 1 && !near; q++) for (let r = -1; r <= 1; r++) if (w.flagAt(l, cx + q, cz + r) & FLAG.cave) { near = true; break } if (!near) continue }
      const A = d(a, b), B = d(a + 1, b), Cc = d(a + 1, b + 1), Dd = d(a, b + 1); const code = (A > 0 ? 1 : 0) | (B > 0 ? 2 : 0) | (Cc > 0 ? 4 : 0) | (Dd > 0 ? 8 : 0); if (code === 0 || code === 15) continue
      const e = [() => lerp(px(a), pz(b), A, px(a + 1), pz(b), B), () => lerp(px(a + 1), pz(b), B, px(a + 1), pz(b + 1), Cc), () => lerp(px(a + 1), pz(b + 1), Cc, px(a), pz(b + 1), Dd), () => lerp(px(a), pz(b + 1), Dd, px(a), pz(b), A)]
      const seg = (p: [number, number], q: [number, number]) => { // air must be on the left of p->q seen from above? orient by gradient
        const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2, [gx, gz] = grad(mx, mz); const cr = (q[0] - p[0]) * gz - (q[1] - p[1]) * gx; if (cr > 0) { const t = p; p = q; q = t }
        const c0 = column(...p), c1 = column(...q); S.need(0, prof.length * 6); for (let k = 0; k < c0.length - 1; k++) { S.tri(c1[k], c0[k], c0[k + 1]); S.tri(c1[k], c0[k + 1], c1[k + 1]) } }
      const M: Record<number, [number, number][]> = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[2, 0]], 10: [[0, 1], [2, 3]], 11: [[2, 1]], 12: [[1, 3]], 13: [[1, 0]], 14: [[0, 3]] }
      for (const [p, q] of M[code]) seg(e[p](), e[q]())
    }
    // floor and ceiling grids cover cave cells and a ring beyond
    const fs = lod ? 1 : 2, seen = new Set<number>(); const cover = (x: number, z: number) => { const c = w.flagAt(l, x, z); if (c & FLAG.cave) return true; if (open(x, z)) return false; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (w.flagAt(l, x + a, z + b) & FLAG.cave) return true; return false }
    void list; void seen
    const vF = new Map<number, number>(), vC = new Map<number, number>()
    const fvert = (gx: number, gz: number) => { const k = gz * 4096 + gx; let v = vF.get(k); if (v !== undefined) return v; const X = v2w(0) + gx * CELL / fs, Z = v2w(0) + gz * CELL / fs; const H = (a: number, b: number) => caveFloor(w, l, a, b) + (vnoise(a * .9, b * .9, 3) - .5) * .16; const y = H(X, Z), e = .4, nx2 = H(X - e, Z) - H(X + e, Z), nz2 = H(X, Z - e) - H(X, Z + e), L = Math.hypot(nx2, 2 * e, nz2); const la = rockLayerAt(X, Z), s = sc[la] * .9; const ao = Math.max(.42, Math.min(1, .45 + caveD(w, l, X, Z) * 1.25)) * blob(X, Z); S.need(1, 0); v = S.v(X, y, Z, nx2 / L, 2 * e / L, nz2 / L, X / s, -Z / s, la, 255 * ao); vF.set(k, v); return v }
    const cvert = (gx: number, gz: number) => { const k = gz * 4096 + gx; let v = vC.get(k); if (v !== undefined) return v; const X = v2w(0) + gx * CELL / fs, Z = v2w(0) + gz * CELL / fs; const H = (a: number, b: number) => y0 + 3.9 - (fbm(a * .35, b * .35, 41 + l, 3)) * .9 - Math.max(0, .5 - caveD(w, l, a, b)) * .35; const y = H(X, Z), e = .4, nx2 = H(X + e, Z) - H(X - e, Z), nz2 = H(X, Z + e) - H(X, Z - e), L = Math.hypot(nx2, 2 * e, nz2); const la = rockLayerAt(X, Z), s = sc[la]; C.need(1, 0); v = C.v(X, y, Z, nx2 / L, -2 * e / L, nz2 / L, X / s, Z / s, la, 255 * Math.max(.4, Math.min(.9, .4 + caveD(w, l, X, Z)))); vC.set(k, v); return v }
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) if (cover(x, z)) {
      const hole = lv ? lv.flag[idx(x, z)] & FLAG.hole : 0
      for (let b = 0; b < fs; b++) for (let a = 0; a < fs; a++) { const gx = x * fs + a, gz = z * fs + b; if (!hole) { S.need(0, 6); const p = fvert(gx, gz), q = fvert(gx + 1, gz), r = fvert(gx + 1, gz + 1), u = fvert(gx, gz + 1); S.tri(u, r, p); S.tri(r, q, p) } if (lv!.ceil[idx(x, z)] === CEIL.rock || !lv!.floor[idx(x, z)]) { C.need(0, 6); const p = cvert(gx, gz), q = cvert(gx + 1, gz), r = cvert(gx + 1, gz + 1), u = cvert(gx, gz + 1); C.tri(p, q, r); C.tri(p, r, u) } }
      let liq = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) liq |= w.flagAt(l, x + a, z + b) & (FLAG.water | FLAG.lava); if (liq) liquid(liq & FLAG.lava ? S : W, v2w(x), v2w(z), v2w(x + 1), v2w(z + 1), y0 - .3, !!(liq & FLAG.lava))
    }
  }
  // ================================================================= terrain
  const terrain = () => {
    const t = w.terrain!; const L0 = w.levels.get(0)!; const map = new Map<number, number>(); const step = lod > 1 ? 2 : 1
    const H = (a: number, b: number) => t.h[Math.max(0, Math.min(N, b)) * (N + 1) + Math.max(0, Math.min(N, a))]
    const vert = (gx: number, gz: number) => { const k = gz * (N + 1) + gx; let v = map.get(k); if (v !== undefined) return v; const X = v2w(gx), Z = v2w(gz), y = t.h[k], nx = H(gx - 1, gz) - H(gx + 1, gz), nz = H(gx, gz - 1) - H(gx, gz + 1), L = Math.hypot(nx, 2 * CELL, nz); let ao = 1; for (const d of [[0, 3], [-1, 3], [0, 2]] as const) if (isTall(w.etype(0, gx + d[0], gz, d[1]))) ao = .55; if (isTall(w.etype(0, gx, gz - 1, 2))) ao = .55; ao *= blob(X, Z); T.need(1, 0); v = T.v(X, y, Z, nx / L, 2 * CELL / L, nz / L, X, -Z, 0, 255 * ao, t.w[k * 4], t.w[k * 4 + 1], t.w[k * 4 + 2], 0, 0, t.w[k * 4 + 3]); map.set(k, v); return v }
    for (let z = z0; z < z1; z += step) for (let x = x0; x < x1; x += step) { const i = idx(x, z), f = L0.floor[i], fl = L0.flag[i]; if (f !== TERRAIN && !(fl & FLAG.bridge)) continue; T.need(0, 6); const p = vert(x, z), q = vert(x + step, z), r = vert(x + step, z + step), u = vert(x, z + step); if (Math.abs(H(x, z) - H(x + 1, z + 1)) < Math.abs(H(x + 1, z) - H(x, z + 1))) { T.tri(u, r, p); T.tri(r, q, p) } else { T.tri(u, r, q); T.tri(u, q, p) } }
    if (t.water !== null) for (let z = z0; z < z1; z += 2) for (let x = x0; x < x1; x += 2) { let m = 99; for (let a = 0; a <= 2; a++) for (let b = 0; b <= 2; b++) m = Math.min(m, H(x + a, z + b)); if (m < t.water + .05) { const a = v2w(x), b = v2w(z), c = v2w(Math.min(N, x + 2)), e = v2w(Math.min(N, z + 2)); quad(W, [a, t.water, e], [c, t.water, e], [c, t.water, b], [a, t.water, b], [0, 1, 0], [a / 4, -e / 4], [c / 4, -e / 4], [c / 4, -b / 4], [a / 4, -b / 4], 0) } }
    if (lod === 0 && w.env.grass > 0) {
      const B = model(w.env.biome === 'blight' ? 'grass_tuft' : 'grass_tuft'); const dens = ({ temperate: 2, autumn: 1.4, snow: 0, desert: .06, blight: 1 } as Record<string, number>)[w.env.biome] * w.env.grass; if (B && dens > 0) for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) { if (L0.floor[idx(x, z)] !== TERRAIN) continue; const k = z * (N + 1) + x; const g = t.w[k * 4] / 255, pth = t.w[k * 4 + 2] / 255; if (g < .25 || pth > .25) continue; const c = dens * g * (.4 + 1.1 * vnoise(x * .3, z * .3, 77)); const m = Math.floor(c + hash3(x, z, 5)); for (let q = 0; q < m; q++) { const X = v2w(x) + hash3(x, z, 11 + q) * CELL, Z = v2w(z) + hash3(x, z, 31 + q) * CELL, y = w.terrainH(X, Z); if (t.water !== null && y < t.water + .1) continue; const s = .55 + hash3(x, z, 51 + q) * .7, r = hash3(x, z, 71 + q) * 6.28; const tt: V3 = w.env.biome === 'autumn' ? [1.0, .86, .62] : w.env.biome === 'desert' ? [1.3, 1.1, .8] : [1, 1, 1]; prop2(B, X, y - .03, Z, r, s, tt) } }
    }
  }
  const prop2 = (m: Model, x: number, y: number, z: number, r: number, s: number, tint: V3) => { const g = lib.geo(m.id, 0); if (!g) return; const cs = Math.cos(r), sn = Math.sin(r); G.need(g.nv, g.ni); const base = G.nv; for (let j = 0; j < g.nv; j++) { const px = g.p[j * 3] * s, py = g.p[j * 3 + 1] * s, pz = g.p[j * 3 + 2] * s; G.v(x + px * cs + pz * sn, y + py, z - px * sn + pz * cs, 0, 1, 0, g.u[j * 2], g.u[j * 2 + 1], g.x[j * 4] - 100, py < .05 ? 105 : 235, Math.min(255, g.c[j * 4] * tint[0] * .66), Math.min(255, g.c[j * 4 + 1] * tint[1] * .68), Math.min(255, g.c[j * 4 + 2] * tint[2] * .6), 0, py > .1 ? 255 : 0) } for (let k = 0; k < g.ni; k++) G.I[G.ni++] = base + g.i[k] }
  // ================================================================= round towers, roofs
  const ring = (r: Ring) => {
    const la = layerOf(r.style), s = sc[la], seg = lod ? 24 : 44, R0 = r.r, R1 = r.r + r.t; const cosA = (a: number, R: number): [number, number] => [r.x + Math.cos(a) * R, r.z + Math.sin(a) * R]
    const cyl = (B: Buf, R: number, a0: number, a1: number, yb: number, yt: number, out: number, aoB = 255, aoT = 255, Rt = R, layer = la) => { const [ax, az] = cosA(a0, R), [bx, bz] = cosA(a1, R), [cx, cz] = cosA(a1, Rt), [dx, dz] = cosA(a0, Rt); const n0: V3 = [Math.cos(a0) * out, 0, Math.sin(a0) * out], n1: V3 = [Math.cos(a1) * out, 0, Math.sin(a1) * out]; const ss = sc[layer]; B.need(4, 6); const u0 = a0 * R / ss, u1 = a1 * R / ss; const p = B.v(ax, yb, az, ...n0, u0, yb / ss, layer, aoB), q = B.v(bx, yb, bz, ...n1, u1, yb / ss, layer, aoB), t = B.v(cx, yt, cz, ...n1, u1, yt / ss, layer, aoT), u = B.v(dx, yt, dz, ...n0, u0, yt / ss, layer, aoT); if (out > 0) { B.tri(q, p, u); B.tri(q, u, t) } else { B.tri(p, q, t); B.tri(p, t, u) } }
    const disc = (B: Buf, Ra: number, Rb: number, y: number, up: boolean, layer: number, ao = 235) => { const ss = sc[layer]; for (let k = 0; k < seg; k++) { const a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2; B.need(4, 6); const P = [cosA(a0, Ra), cosA(a1, Ra), cosA(a1, Rb), cosA(a0, Rb)].map((p, i) => B.v(p[0], y, p[1], 0, up ? 1 : -1, 0, p[0] / ss, -p[1] / ss, layer, i > 1 ? ao * .6 : ao)); if (up) { B.tri(P[0], P[2], P[1]); B.tri(P[0], P[3], P[2]) } else { B.tri(P[0], P[1], P[2]); B.tri(P[0], P[2], P[3]) } } }
    const top = r.l1 + 1; if (l < r.l0 || l > top) return
    if (l <= r.l1) {
      const Y = l * 4; const ops = r.open.filter(o => o.l === l && o.k !== 'slit'); const cuts = new Set<number>(); for (let k = 0; k < seg; k++) cuts.add(k / seg * Math.PI * 2)
      const iv: [number, number][] = ops.map(o => { const h = Math.asin(Math.min(.9, o.w / 2 / R0)); return [o.a - h, o.a + h] }); for (const [a, b] of iv) { cuts.add(mod(a)); cuts.add(mod(b)) } const cs = [...cuts].sort((a, b) => a - b); const inside = (a: number) => iv.some(([p, q]) => { const m = (p + q) / 2, h = (q - p) / 2; return Math.abs(Math.atan2(Math.sin(a - m), Math.cos(a - m))) < h - 1e-4 })
      for (let k = 0; k < cs.length; k++) {
        const a0 = cs[k], a1 = k + 1 < cs.length ? cs[k + 1] : cs[0] + Math.PI * 2; if (a1 - a0 < 1e-4) continue; const door = inside((a0 + a1) / 2), yb = door ? 2.45 : 0
        if (!door) { if (l === r.l0) cyl(S, R1 + .28, a0, a1, Y - .6, Y + .7, 1, 130, 225, R1 + .02); cyl(S, R1, a0, a1, Y + (l === r.l0 ? .7 : 0), Y + 3.72, 1, 250, 235); cyl(S, R0, a0, a1, Y, Y + .6, -1, 130, 240); cyl(S, R0, a0, a1, Y + .6, Y + 4, -1, 240, 190) }
        else { cyl(S, R1, a0, a1, Y + yb, Y + 3.72, 1); cyl(S, R0, a0, a1, Y + yb, Y + 4, -1, 220, 190); const P = [cosA(a0, R0), cosA(a1, R0), cosA(a1, R1), cosA(a0, R1)]; S.need(4, 6); const q = P.map(p => S.v(p[0], Y + yb, p[1], 0, -1, 0, p[0] / s, p[1] / s, la, 130)); S.tri(q[0], q[1], q[2]); S.tri(q[0], q[2], q[3]) }
        if (!door) { const P = [cosA(a0, R0), cosA(a1, R0), cosA(a1, R1), cosA(a0, R1)]; Q.need(4, 6); const q = P.map(p => Q.v(p[0], Y + CAPY, p[1], 0, 1, 0, p[0] / 3, p[1] / 3, LAY.rock_dark, 255, 150, 138, 128)); Q.tri(q[0], q[2], q[1]); Q.tri(q[0], q[3], q[2]) }
        if (!lod) { cyl(S, R1, a0, a1, Y + 3.72, Y + 3.8, 1, 200, 230, R1 + .1); cyl(S, R1 + .1, a0, a1, Y + 3.8, Y + 4, 1, 240, 240) } else cyl(S, R1, a0, a1, Y + 3.72, Y + 4, 1, 210, 235, R1 + .13)
      }
      for (const [p, q] of iv) for (const [a, sg] of [[p, 1], [q, -1]] as const) { const A = cosA(a, R0 - .02), B2 = cosA(a, R1 + .02), n: V3 = [-Math.sin(a) * sg, 0, Math.cos(a) * sg]; const L = (R1 - R0) / s; if (sg > 0) quad(S, [A[0], Y, A[1]], [B2[0], Y, B2[1]], [B2[0], Y + 2.45, B2[1]], [A[0], Y + 2.45, A[1]], n, [0, 0], [L, 0], [L, 2.45 / s], [0, 2.45 / s], la, [140, 140, 200, 200]); else quad(S, [B2[0], Y, B2[1]], [A[0], Y, A[1]], [A[0], Y + 2.45, A[1]], [B2[0], Y + 2.45, B2[1]], n, [L, 0], [0, 0], [0, 2.45 / s], [L, 2.45 / s], la, [140, 140, 200, 200]) }
      for (const o of r.open) if (o.l === l) { const id = o.k === 'slit' ? 'arrow_slit' : 'frame_stone', m = model(id); if (!m) continue; const R = o.k === 'slit' ? R1 - .12 : (R0 + R1) / 2; const [px, pz] = cosA(o.a, R); prop(m, px, Y, pz, Math.atan2(Math.cos(o.a), Math.sin(o.a)), o.k === 'slit' ? 1 : Math.max(1, o.w / 1.3), r.style) }
      disc(S, l === r.l0 ? 0.01 : r.hole, R0 + .05, Y, true, l === r.l0 ? LAY.flagstone : LAY.planks)
      if (l < r.l1 || r.top === 'battlement') disc(C, r.hole, R0 + .05, Y + 3.78, false, LAY.planks_old, 200); if (l > r.l0) for (let k = 0; k < seg; k++) cyl(S, r.hole, k / seg * 6.28319, (k + 1) / seg * 6.28319, Y - .22, Y, -1, 160, 220, r.hole, LAY.beam)
    }
    if (l === top && r.top === 'battlement') {
      const Y = l * 4; disc(S, r.hole, R1, Y, true, LAY.flagstone, 250); for (let k = 0; k < seg; k++) { const a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2; cyl(S, r.hole, a0, a1, Y - .22, Y, -1, 160, 220, r.hole, LAY.ashlar); const Ri = R1 - .42, Ro = R1 + .12; cyl(S, Ro, a0, a1, Y, Y + .65, 1); cyl(S, Ri, a0, a1, Y, Y + .65, -1, 150, 240); const up = Math.floor(k / 2) % 2 === 0; const H = Y + (up ? 1.35 : .65); if (up) { cyl(S, Ro, a0, a1, Y + .65, H, 1); cyl(S, Ri, a0, a1, Y + .65, H, -1) } const P = [cosA(a0, Ri), cosA(a1, Ri), cosA(a1, Ro), cosA(a0, Ro)]; S.need(4, 6); const q = P.map(p => S.v(p[0], H, p[1], 0, 1, 0, p[0] / s, p[1] / s, la, 250)); S.tri(q[0], q[2], q[1]); S.tri(q[0], q[3], q[2]); if (up !== (Math.floor(((k + 1) % seg) / 2) % 2 === 0)) { const A = cosA(a1, Ri), B2 = cosA(a1, Ro), sg = up ? 1 : -1, n: V3 = [-Math.sin(a1) * sg, 0, Math.cos(a1) * sg]; const a: V3 = [A[0], Y + .65, A[1]], b: V3 = [B2[0], Y + .65, B2[1]], c: V3 = [B2[0], Y + 1.35, B2[1]], d2: V3 = [A[0], Y + 1.35, A[1]]; if (sg < 0) quad(S, b, a, d2, c, n, [0, 0], [.2, 0], [.2, .25], [0, .25], la); else quad(S, a, b, c, d2, n, [0, 0], [.2, 0], [.2, .25], [0, .25], la) } }
    }
    if (l === r.l1 && r.top === 'cone') { const Y = top * 4, rl = layerOf(r.roof), H = (R1 + .55) * 1.75; for (let k = 0; k < seg; k++) { const a0 = k / seg * Math.PI * 2, a1 = (k + 1) / seg * Math.PI * 2, Ro = R1 + .55; const sl = Math.hypot(H, Ro); const nY = Ro / sl, nR = H / sl; const rows = 5; for (let j = 0; j < rows; j++) { const t0 = j / rows, t1 = (j + 1) / rows; const f = (t: number) => Ro * (1 - t) + .05, yy = (t: number) => Y - .2 + H * (t * .86 + t * t * .14); const p0 = cosA(a0, f(t0)), p1 = cosA(a1, f(t0)), p2 = cosA(a1, f(t1)), p3 = cosA(a0, f(t1)); const u = 3; const uu0 = k / seg * u * 3, uu1 = (k + 1) / seg * u * 3; C.need(4, 6); const q = [[p0, t0, a0, uu0], [p1, t0, a1, uu1], [p2, t1, a1, uu1], [p3, t1, a0, uu0]].map(([p, t, a, uu]: any) => C.v(p[0], yy(t), p[1], Math.cos(a) * nR, nY, Math.sin(a) * nR, uu, t * sl / sc[rl], rl, 250)); C.tri(q[1], q[0], q[3]); C.tri(q[1], q[3], q[2]) } const A = cosA(a0, Ro + .05), B2 = cosA(a1, Ro + .05), c0 = cosA(a1, R0), d0 = cosA(a0, R0); C.need(4, 6); const q = [A, B2, c0, d0].map(p => C.v(p[0], Y - .2, p[1], 0, -1, 0, p[0] / 2, p[1] / 2, LAY.planks_old, 130)); C.tri(q[1], q[0], q[3]); C.tri(q[1], q[3], q[2]) } }
  }
  const mod = (a: number) => { const t = Math.PI * 2; return ((a % t) + t) % t }
  const triN = (B: Buf, ids: number[], n: V3) => { const P = (k: number): V3 => [B.P[ids[k] * 3], B.P[ids[k] * 3 + 1], B.P[ids[k] * 3 + 2]]; const a = P(0), b = P(1), c = P(2); const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; const d = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2]; if (d > 0) B.tri(ids[0], ids[1], ids[2]); else B.tri(ids[1], ids[0], ids[2]) }
  const roof = (r: Roof) => {
    const la = layerOf(r.mat), s = sc[la], ga = layerOf(r.gable), ov = .55, ax = r.axis === 0; const a0 = (ax ? v2w(r.x0) : v2w(r.z0)) - ov, a1 = (ax ? v2w(r.x1 + 1) : v2w(r.z1 + 1)) + ov, b0 = (ax ? v2w(r.z0) : v2w(r.x0)), b1 = ax ? v2w(r.z1 + 1) : v2w(r.x1 + 1), half = (b1 - b0) / 2, mid = (b0 + b1) / 2, H = half * r.pitch, Y = r.y - .05; const P = (a: number, y: number, b: number): V3 => ax ? [a, y, b] : [b, y, a]; const th = r.mat === 'thatch' ? .34 : .14, eo = half + ov, eY = Y - ov * r.pitch, sl = Math.hypot(eo, eo * r.pitch), nb = r.pitch / Math.hypot(1, r.pitch), ny = 1 / Math.hypot(1, r.pitch)
    const swap = !ax; const Q = (B: Buf, p: V3, q: V3, t: V3, u: V3, n: V3, up: [number, number], uq: [number, number], ut: [number, number], uu: [number, number], la2: number, ao: [number, number, number, number] = [255, 255, 255, 255]) => swap ? quad(B, q, p, u, t, n, uq, up, uu, ut, la2, [ao[1], ao[0], ao[3], ao[2]]) : quad(B, p, q, t, u, n, up, uq, ut, uu, la2, ao)
    for (const sd of [1, -1]) {
      const lean = r.kind === 'hip' || r.kind === 'pyramid' ? Math.min((a1 - a0) / 2 - .01, eo) : 0; const n: V3 = ax ? [0, ny, sd * nb] : [sd * nb, ny, 0]; const e0 = P(a0, eY + th, mid + sd * eo), e1 = P(a1, eY + th, mid + sd * eo), t1 = P(a1 - lean, Y + H + th, mid), t0 = P(a0 + lean, Y + H + th, mid); const u = (a: number) => a * sd / s, vv = sl / s
      const rows = lod ? 1 : 3; for (let j = 0; j < rows; j++) { const k0 = j / rows, k1 = (j + 1) / rows, mixp = (p: V3, q: V3, k: number): V3 => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k]; const A = mixp(e0, t0, k0), B2 = mixp(e1, t1, k0), Cc = mixp(e1, t1, k1), D = mixp(e0, t0, k1); const aa = (p: V3) => ax ? p[0] : p[2]; if (sd > 0) Q(C, A, B2, Cc, D, n, [u(aa(A)), vv * k0], [u(aa(B2)), vv * k0], [u(aa(Cc)), vv * k1], [u(aa(D)), vv * k1], la); else Q(C, B2, A, D, Cc, n, [u(aa(B2)), vv * k0], [u(aa(A)), vv * k0], [u(aa(D)), vv * k1], [u(aa(Cc)), vv * k1], la) }
      // eave edge, underside
      const f0 = P(a0, eY, mid + sd * eo), f1 = P(a1, eY, mid + sd * eo), g0 = P(a0, Y + H, mid), g1 = P(a1, Y + H, mid); const en: V3 = ax ? [0, 0, sd] : [sd, 0, 0]; if (sd > 0) Q(C, f0, f1, e1, e0, en, [a0 / s, 0], [a1 / s, 0], [a1 / s, th / s], [a0 / s, th / s], la, [140, 140, 230, 230]); else Q(C, f1, f0, e0, e1, en, [a1 / s, 0], [a0 / s, 0], [a0 / s, th / s], [a1 / s, th / s], la, [140, 140, 230, 230])
      const un: V3 = ax ? [0, -ny, -sd * nb] : [-sd * nb, -ny, 0]; const pl = LAY.planks_old, ps = sc[pl]; if (r.kind === 'gable') { if (sd > 0) Q(C, f1, f0, g0, g1, un, [a1 / ps, 0], [a0 / ps, 0], [a0 / ps, sl / ps], [a1 / ps, sl / ps], pl, [150, 150, 200, 200]); else Q(C, f0, f1, g1, g0, un, [a0 / ps, 0], [a1 / ps, 0], [a1 / ps, sl / ps], [a0 / ps, sl / ps], pl, [150, 150, 200, 200]) }
      for (const [a, sg] of [[a0, -1], [a1, 1]] as const) { // gable ends and barge boards
        if (r.kind === 'gable') {
          const wa = a - sg * ov + sg * WT / 2, n2: V3 = ax ? [sg, 0, 0] : [0, 0, sg]; const gs = sc[ga]; const p0 = P(wa, Y, mid + sd * half), p1 = P(wa, Y, mid), p2 = P(wa, Y + H, mid); const B = C; B.need(3, 3); const q = [p0, p1, p2].map(p => { const b = ax ? p[2] : p[0]; return B.v(...p, ...n2, b / gs, p[1] / gs, ga, 235) }); triN(B, q, n2)
          const q0 = P(wa - sg * WT, Y, mid + sd * half), q1 = P(wa - sg * WT, Y, mid), q2 = P(wa - sg * WT, Y + H, mid); B.need(3, 3); const z = [q0, q1, q2].map(p => B.v(...p, -n2[0], 0, -n2[2], (ax ? p[2] : p[0]) / gs, p[1] / gs, ga, 200)); triN(B, z, [-n2[0], 0, -n2[2]])
          const E0 = P(a, eY - .12, mid + sd * eo), E1 = P(a, eY + th, mid + sd * eo), T0 = P(a, Y + H - .12, mid), T1 = P(a, Y + H + th, mid); const bl = r.mat === 'thatch' ? la : LAY.beam, bs = sc[bl]; const v = [E0, T0, T1, E1]; C.need(4, 6); const k = v.map((p, i) => C.v(...p, ...n2, i === 1 || i === 2 ? sl / bs : 0, i > 1 ? .2 / bs : 0, bl, 220)); triN(C, [k[0], k[1], k[2]], n2); triN(C, [k[0], k[2], k[3]], n2)
        } else if (sd > 0) { const hn: V3 = ax ? [sg * nb, ny, 0] : [0, ny, sg * nb]; const lean2 = Math.min((a1 - a0) / 2 - .01, eo); const p = [P(a, eY + th, mid - eo), P(a, eY + th, mid + eo), P(a - sg * lean2, Y + H + th, mid)]; C.need(3, 3); const k = p.map(q => C.v(...q, ...hn, (ax ? q[2] : q[0]) / s, q[1] / s, la, 250)); triN(C, k, hn) }
      }
    }
  }
  // ================================================================= run
  if (lv) {
    for (let z = z0; z < z1; z++) for (let x = x0; x < x1; x++) { const i = idx(x, z); if (lv.eW[i]) doWall(x, z, 2); if (lv.eN[i]) doWall(x, z, 3) }
    posts(); cells()
  }
  const inC = (x: number, z: number) => { const a = w2c(x), b = w2c(z); return a >= x0 && a < x1 && b >= z0 && b < z1 }
  if (l === 0 && w.terrain) terrain()
  for (const r of w.rings.values()) if (inC(r.x, r.z)) ring(r)
  for (const r of w.roofs.values()) if (r.l === l && r.x0 >= x0 && r.x0 < x1 && r.z0 >= z0 && r.z0 < z1) roof(r)
  for (const s of w.stairs.values()) if (s.l === l) { const p = World.stairPose(s); if (!inC(p.x + p.dx * .3, p.z + p.dz * .3)) continue; const m = model(s.kind === 'wood' ? 'stairs_wood' : 'stairs_stone'); if (m) prop(m, p.x, y0, p.z, Math.atan2(-p.dx, -p.dz), 1, stoneAt(w2c(p.x + p.dx), w2c(p.z + p.dz))) }
  for (const s of w.spirals.values()) if (l >= s.l0 && l < s.l1 && inC(s.x, s.z)) { const m = model('stairs_spiral'); if (m && lod < 2) prop(m, s.x, y0, s.z, 0, 1) }
  for (const p of propsHere) { if (p.l !== l) continue; const m = model(p.m); if (!m) continue; const small = (m.hi[1] - m.lo[1]) * p.s < .3 && !m.flat; if (lod && small) continue; if (lod > 1 && (m.tags.includes('tree') || (!m.light && !m.flat && Math.max(m.hi[0] - m.lo[0], m.hi[1] - m.lo[1], m.hi[2] - m.lo[2]) * p.s < 1.15))) { if (m.tags.includes('tree')) farTree(m, p.x, p.y, p.z, p.r, p.s); continue } if (lod > 1 && (m.leafy || (l >= 0 && outdoor && !m.light && (lv?.ceil[idx(w2c(p.x), w2c(p.z))] ?? 0) > 0))) continue; if (lod > 1 && l >= 0 && outdoor && m.light && (lv?.ceil[idx(w2c(p.x), w2c(p.z))] ?? 0) > 0) continue; prop(m, p.x, p.y, p.z, p.r, p.s, p.t ?? stoneAt(w2c(p.x), w2c(p.z)), m.mount === 'ceil' ? C : undefined) }
  const out: Groups = {}; const add = (k: keyof Groups, B: Buf) => { const g = B.out(); if (g) out[k] = g }
  add('solid', S); add('cut', K); add('ceil', C); add('terr', T); add('water', W); add('grass', G); add('cap', Q); return out
}
void HALF
