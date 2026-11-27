import { World, idx, inb, type Prop, type Stair } from './world'
import { CELL, E, FLAG, HALF, N, TERRAIN, WT, isDoor, isTall, v2w, w2c, DIRS, c2w } from './defs'
import { model, collider } from './catalog'
import { caveD, caveFloor } from './cavefield'
interface Col { x: number; z: number; y0: number; y1: number; k: 'c' | 'b'; r: number; hx: number; hz: number; c: number; s: number; id: number; step: boolean }
const STEP = .56
/** walking, heights and pathfinding over a world. No engine dependency. */
export class Nav {
  grid = new Map<number, Col[]>(); where = new Map<number, number[]>(); stairsAt = new Map<number, Stair[]>()
  constructor(public w: World) { this.rebuild() }
  private key(x: number, z: number) { return (Math.floor(z / 3) + 200) * 1000 + Math.floor(x / 3) + 200 }
  rebuild() { this.grid.clear(); this.where.clear(); for (const p of this.w.props.values()) this.add(p); this.restairs() }
  restairs() { this.stairsAt.clear(); for (const s of this.w.stairs.values()) for (const [x, z] of World.stairCells(s)) { const k = idx(x, z); (this.stairsAt.get(k) ?? this.stairsAt.set(k, []).get(k)!).push(s) } }
  add(p: Prop) {
    this.remove(p.id); const m = model(p.m); if (!m) return; const c = collider(m); if (!c) return; const cs = Math.cos(p.r), sn = Math.sin(p.r), x = p.x + (c.ox * cs + c.oz * sn) * p.s, z = p.z + (-c.ox * sn + c.oz * cs) * p.s
    const col: Col = { x, z, y0: p.y + m.lo[1] * p.s, y1: p.y + Math.min(m.hi[1], m.col === 'trunk' ? 3 : 99) * p.s, k: c.k, r: c.r * p.s, hx: c.hx * p.s, hz: c.hz * p.s, c: cs, s: sn, id: p.id, step: m.hi[1] * p.s < .36 }
    const R = col.k === 'c' ? col.r : Math.hypot(col.hx, col.hz), keys: number[] = []; for (let a = Math.floor((x - R) / 3); a <= Math.floor((x + R) / 3); a++) for (let b = Math.floor((z - R) / 3); b <= Math.floor((z + R) / 3); b++) { const k = (b + 200) * 1000 + a + 200; (this.grid.get(k) ?? this.grid.set(k, []).get(k)!).push(col); keys.push(k) } this.where.set(p.id, keys)
  }
  remove(id: number) { const ks = this.where.get(id); if (!ks) return; for (const k of ks) { const a = this.grid.get(k); if (a) { const i = a.findIndex(c => c.id === id); if (i >= 0) a.splice(i, 1) } } this.where.delete(id) }
  near(x: number, z: number, R: number) { const o = new Set<Col>(); for (let a = Math.floor((x - R) / 3); a <= Math.floor((x + R) / 3); a++) for (let b = Math.floor((z - R) / 3); b <= Math.floor((z + R) / 3); b++) for (const c of this.grid.get((b + 200) * 1000 + a + 200) ?? []) o.add(c); return o }
  stairY(s: Stair, x: number, z: number) { const p = World.stairPose(s); const v = (x - p.x) * p.dx + (z - p.z) * p.dz; const lat = (x - p.x) * p.dz - (z - p.z) * p.dx; if (v < -.02 || v > 6.02 || Math.abs(lat) > 1.5) return null; return s.l * 4 + 4 * Math.max(0, Math.min(1, v / 6)) }
  /** highest thing to stand on at (x,z) that is not above y + STEP */
  ground(x: number, y: number, z: number): number | null {
    const w = this.w, cx = w2c(x), cz = w2c(z); if (!inb(cx, cz)) return null; let best = -Infinity; const lim = y + STEP, i = idx(cx, cz)
    const L = Math.floor((y + 1.3) / 4)
    for (let l = L; l >= L - 1; l--) {
      const v = w.levels.get(l); if (!v) continue; const f = v.floor[i]; if (!f || (l === 0 && f === TERRAIN)) continue
      if (v.flag[i] & FLAG.virt) { let ok = false; for (const r of w.rings.values()) { const d = Math.hypot(x - r.x, z - r.z); if (d < r.r + r.t && l >= r.l0 && l <= r.l1 + 1 && (l === r.l0 || d > r.hole - .02)) { ok = true; break } } if (!ok) continue }
      const Y = v.flag[i] & FLAG.cave ? caveFloor(w, l, x, z) : l * 4 + v.h[i] * .25; if (Y <= lim && Y > best) best = Y
    }
    for (const r of w.rings.values()) { const d = Math.hypot(x - r.x, z - r.z); if (d < r.r + r.t && d > r.hole - .02) for (let l = Math.max(r.l0, L - 1); l <= Math.min(r.l1 + (r.top === 'battlement' ? 1 : 0), L); l++) { const Y = l * 4; if (Y <= lim && Y > best) best = Y } }
    for (const s of this.stairsAt.get(i) ?? []) { const Y = this.stairY(s, x, z); if (Y !== null && Y <= lim && Y > best) best = Y }
    for (const s of w.spirals.values()) { const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz); if (d < 2.16 && d > .1) { let a = Math.atan2(-dz, dx) / (Math.PI * 2); if (a < 0) a += 1; for (let l = s.l0; l < s.l1; l++) { const Y = l * 4 + 4 * a; if (Y <= lim && Y > best) best = Y } const Yt = s.l1 * 4; if (a < .12 && Yt <= lim && Yt > best) best = Yt } }
    if (w.terrain) { const v = w.levels.get(0); const f = v ? v.floor[i] : TERRAIN; if (f === TERRAIN || (v && v.flag[i] & FLAG.bridge)) { const Y = w.terrainH(x, z); if (Y <= lim + .3 && Y > best) best = Y } }
    for (const c of this.near(x, z, .1)) if (c.step && Math.hypot(c.x - x, c.z - z) < Math.max(c.r, c.hx)) { if (c.y1 <= lim && c.y1 > best && c.y1 - y < STEP && this.inside(c, x, z, 0)) best = c.y1 }
    return best === -Infinity ? null : best
  }
  private inside(c: Col, x: number, z: number, r: number) { const dx = x - c.x, dz = z - c.z; if (c.k === 'c') return Math.hypot(dx, dz) < c.r + r; const u = dx * c.c - dz * c.s, v = dx * c.s + dz * c.c; return Math.abs(u) < c.hx + r && Math.abs(v) < c.hz + r }
  /** boxes (ax,az,bx,bz) that block a body at this cell edge */
  edgeBoxes(l: number, x: number, z: number, d: 2 | 3, out: number[][], headOnly = false) {
    const e = this.w.edge(l, x, z, d), t = e & 15; if (!t) return; if (headOnly && !isTall(t)) return
    const x0 = v2w(x), z0 = v2w(z), h = t === E.Fence || t === E.Rail || t === E.Grille ? .1 : WT / 2; const put = (a: number, b: number, th = h) => d === 3 ? out.push([x0 + a, z0 - th, x0 + b, z0 + th]) : out.push([x0 - th, z0 + a, x0 + th, z0 + b])
    const open = isDoor(t) && this.w.doors.get(`${l},${x},${z},${d === 2 ? 'W' : 'N'}`)
    if (t === E.Arch || (open && t !== E.GateA && t !== E.GateB)) { put(0, .17); put(CELL - .17, CELL) } else if (open && t === E.GateA) put(0, .2); else if (open && t === E.GateB) put(CELL - .2, CELL); else put(0, CELL)
  }
  /** storey a body standing at height y belongs to (tolerates pools, river beds and stair tops) */
  levelOf(x: number, y: number, z: number) { const w = this.w; if (w.terrain && y > -3 && y < 1) { const cx = w2c(x), cz = w2c(z); if (inb(cx, cz)) { const f = w.floorAt(0, cx, cz); if (f === TERRAIN || w.flagAt(0, cx, cz) & FLAG.bridge) return Math.max(0, Math.floor((y + 1.05) / 4)) } } else if (w.terrain && y >= 1 && y < 14) { const cx = w2c(x), cz = w2c(z); if (inb(cx, cz) && w.floorAt(0, cx, cz) === TERRAIN && Math.abs(y - w.terrainH(x, z)) < .9) return 0 } return Math.floor((y + 1.05) / 4) }
  /** push a circle out of everything solid. Returns the corrected point. */
  resolve(x: number, y: number, z: number, r: number): [number, number] {
    const w = this.w; const lf = this.levelOf(x, y, z), lh = Math.max(lf, Math.floor((y + 1.5) / 4))
    for (let it = 0; it < 3; it++) {
      const cx = w2c(x), cz = w2c(z), B: number[][] = []
      for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { this.edgeBoxes(lf, cx + a, cz + b, 2, B); this.edgeBoxes(lf, cx + a, cz + b, 3, B); if (lh !== lf) { this.edgeBoxes(lh, cx + a, cz + b, 2, B, true); this.edgeBoxes(lh, cx + a, cz + b, 3, B, true) } if (w.flagAt(lf, cx + a, cz + b) & FLAG.solid) B.push([v2w(cx + a), v2w(cz + b), v2w(cx + a + 1), v2w(cz + b + 1)]) }
      for (const [ax, az, bx, bz] of B) { const qx = Math.max(ax, Math.min(x, bx)), qz = Math.max(az, Math.min(z, bz)); let dx = x - qx, dz = z - qz, d = Math.hypot(dx, dz); if (d >= r) continue; if (d > 1e-6) { x = qx + dx / d * r; z = qz + dz / d * r } else { const l = x - ax, rr = bx - x, t = z - az, bt = bz - z, m = Math.min(l, rr, t, bt); if (m === l) x = ax - r; else if (m === rr) x = bx + r; else if (m === t) z = az - r; else z = bz + r } }
      for (const c of this.near(x, z, r + .1)) {
        if (c.step || c.y0 > y + 1.5 || c.y1 < y + .3) continue; const dx = x - c.x, dz = z - c.z
        if (c.k === 'c') { const d = Math.hypot(dx, dz), R = c.r + r; if (d < R && d > 1e-6) { x = c.x + dx / d * R; z = c.z + dz / d * R } }
        else { const u = dx * c.c - dz * c.s, v = dx * c.s + dz * c.c; const qu = Math.max(-c.hx, Math.min(u, c.hx)), qv = Math.max(-c.hz, Math.min(v, c.hz)); let du = u - qu, dv = v - qv, d = Math.hypot(du, dv); if (d >= r) continue; let nu = u, nv = v; if (d > 1e-6) { nu = qu + du / d * r; nv = qv + dv / d * r } else { const a = c.hx - Math.abs(u), b = c.hz - Math.abs(v); if (a < b) nu = Math.sign(u || 1) * (c.hx + r); else nv = Math.sign(v || 1) * (c.hz + r) } x = c.x + nu * c.c + nv * c.s; z = c.z - nu * c.s + nv * c.c }
      }
      for (const g of w.rings.values()) { const dx = x - g.x, dz = z - g.z, d = Math.hypot(dx, dz); if (d < g.r - r || d > g.r + g.t + r || lf < g.l0 || lf > g.l1 + 1) continue; if (lf === g.l1 + 1) { if (g.top === 'battlement' && d > g.r + g.t - .45 - r) { const k = (g.r + g.t - .45 - r) / d; if (d < g.r + g.t) { x = g.x + dx * k; z = g.z + dz * k } } continue }
        const a = Math.atan2(dz, dx); let free = false; for (const o of g.open) if (o.l === lf && o.k !== 'slit') { const da = Math.atan2(Math.sin(a - o.a), Math.cos(a - o.a)); if (Math.cos(da) > 0 && Math.abs(Math.sin(da)) * d < o.w / 2 - r * .55) free = true }
        if (free) continue; const mid = g.r + g.t / 2; const R = d < mid ? g.r - r : g.r + g.t + r; x = g.x + dx / d * R; z = g.z + dz / d * R }
      for (const s of w.spirals.values()) { const dx = x - s.x, dz = z - s.z, d = Math.hypot(dx, dz); if (d < .32 + r && d > 1e-6 && lf >= s.l0 && lf <= s.l1) { x = s.x + dx / d * (.32 + r); z = s.z + dz / d * (.32 + r) } }
      if (w.flagAt(lf, w2c(x), w2c(z)) & FLAG.cave || !w.open(lf, w2c(x), w2c(z))) { const D = caveD(w, lf, x, z), want = .17; if (D < want && nearCave(w, lf, w2c(x), w2c(z))) { const e = .12, gx = caveD(w, lf, x + e, z) - caveD(w, lf, x - e, z), gz = caveD(w, lf, x, z + e) - caveD(w, lf, x, z - e), gl = Math.hypot(gx, gz); if (gl > 1e-5) { const k = Math.min(.25, (want - D) / (gl / (2 * e))); x += gx / gl * k; z += gz / gl * k } } }
    }
    return [x, z]
  }
  /** try to walk; returns the new position. Never leaves solid ground. */
  walk(p: { x: number; y: number; z: number }, dx: number, dz: number, r = .28): { x: number; y: number; z: number } {
    const L = Math.hypot(dx, dz), n = Math.max(1, Math.ceil(L / .16)); let { x, y, z } = p
    for (let i = 0; i < n; i++) {
      const tryStep = (ax: number, az: number) => { const [qx, qz] = this.resolve(x + ax, y, z + az, r); const g = this.ground(qx, y, qz); if (g === null || g < y - 1.3) return false; const cx = w2c(qx), cz = w2c(qz); const lf = this.levelOf(qx, y, qz); const fl = this.w.flagAt(lf, cx, cz); if (fl & FLAG.lava) return false; if (this.w.terrain?.water != null && lf === 0 && !(fl & FLAG.bridge) && g < this.w.terrain.water - 1.0 && this.w.floorAt(0, cx, cz) === TERRAIN) return false
        // a floor on this level that is too high to step on is a wall
        const v = this.w.levels.get(lf); if (v) { const k = idx(cx, cz); if (v.floor[k] && v.floor[k] !== TERRAIN && !(v.flag[k] & (FLAG.cave | FLAG.virt)) && lf * 4 + v.h[k] * .25 > y + STEP) return false }
        if (Math.abs(qx) > HALF * CELL - 3 || Math.abs(qz) > HALF * CELL - 3) return false; x = qx; z = qz; y = g; return true }
      if (!tryStep(dx / n, dz / n)) { if (!tryStep(dx / n, 0)) tryStep(0, dz / n) }
    }
    return { x, y, z }
  }
  // ------------------------------------------------------------- pathfinding on cells
  passable(l: number, x: number, z: number, d: number, throughDoors = true): [number, number, number] | null {
    const w = this.w, nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (!inb(nx, nz)) return null; const t = w.etype(l, x, z, d)
    const here = this.stairsAt.get(idx(x, z))?.find(s => s.l === l), si = here ? World.stairCells(here).find(c => c[0] === x && c[1] === z)![2] : -1
    if (here && si === 3 && d === here.dir) { if (stand(w, l + 1, nx, nz) && pass(w.etype(l + 1, x, z, d))) return [l + 1, nx, nz]; return null }
    if (t !== E.None && t !== E.Arch && !(isDoor(t) && throughDoors)) return null
    const there = this.stairsAt.get(idx(nx, nz))?.find(s => s.l === l); const down = this.stairsAt.get(idx(nx, nz))?.find(s => s.l === l - 1)
    if (there && there !== here) { const j = World.stairCells(there).find(c => c[0] === nx && c[1] === nz)![2]; if (j !== 0) return null }
    if (here && !there && si !== 0) return null
    if (down && !stand(w, l, nx, nz)) { const j = World.stairCells(down).find(c => c[0] === nx && c[1] === nz)![2]; if (j === 3 && (d + 2) % 4 === down.dir) return [l - 1, nx, nz]; return null }
    if (!stand(w, l, nx, nz)) return null; const hy = Math.abs(cellY(w, l, x, z) - cellY(w, l, nx, nz)); if (hy > .6 && !(w.flagAt(l, nx, nz) & FLAG.cave)) return null
    return [l, nx, nz]
  }
  reach(l: number, x: number, z: number, limit = 60000) { const seen = new Set<number>(), K = (a: number, b: number, c: number) => (a + 20) * N * N + c * N + b; const q: [number, number, number][] = [[l, x, z]]; seen.add(K(l, x, z)); for (let h = 0; h < q.length && h < limit; h++) { const [a, b, c] = q[h]; for (let d = 0; d < 4; d++) { const n = this.passable(a, b, c, d); if (n && !seen.has(K(n[0], n[1], n[2]))) { seen.add(K(n[0], n[1], n[2])); q.push(n) } } for (const s of this.w.spirals.values()) if (Math.hypot(c2w(b) - s.x, c2w(c) - s.z) < 3.2) for (const nl of [a + 1, a - 1]) if (nl >= s.l0 && nl <= s.l1 && !seen.has(K(nl, b, c)) && stand(this.w, nl, b, c)) { seen.add(K(nl, b, c)); q.push([nl, b, c]) } } return { has: (a: number, b: number, c: number) => seen.has(K(a, b, c)), size: seen.size } }
  blockedCell(l: number, x: number, z: number) { const X = c2w(x), Z = c2w(z), Y = l * 4; for (const c of this.near(X, Z, .3)) if (!c.step && c.y1 > Y + .4 && c.y0 < Y + 1.2 && this.inside(c, X, Z, .12)) return true; return false }
  path(from: { x: number; y: number; z: number }, to: { x: number; z: number; l: number }, max = 9000): { x: number; y: number; z: number; l: number }[] | null {
    const w = this.w, sl = this.levelOf(from.x, from.y, from.z), K = (a: number, b: number, c: number) => (a + 20) * N * N + c * N + b; const tx = w2c(to.x), tz = w2c(to.z), sx = w2c(from.x), sz = w2c(from.z)
    const open: [number, number, number, number, number][] = [[0, sl, sx, sz, 0]], came = new Map<number, [number, number, number] | null>(), g = new Map<number, number>(); came.set(K(sl, sx, sz), null); g.set(K(sl, sx, sz), 0); let n = 0
    while (open.length && n++ < max) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i; const [, l, x, z] = open[bi]; open[bi] = open[open.length - 1]; open.pop()
      if (l === to.l && x === tx && z === tz) { const out: any[] = []; let c: [number, number, number] | null | undefined = [l, x, z]; while (c) { out.push({ x: c2w(c[1]), y: cellY(w, c[0], c[1], c[2]), z: c2w(c[2]), l: c[0] }); c = came.get(K(c[0], c[1], c[2])) } out.reverse(); return out }
      const cost = g.get(K(l, x, z))!; for (let d = 0; d < 4; d++) { const q = this.passable(l, x, z, d); if (!q) continue; const end = q[1] === tx && q[2] === tz; if (!end && this.blockedCell(q[0], q[1], q[2])) continue; const f = w.flagAt(q[0], q[1], q[2]); if (f & FLAG.lava) continue; const k = K(q[0], q[1], q[2]), c = cost + (f & FLAG.water ? 2 : 1); if (g.has(k) && g.get(k)! <= c) continue; g.set(k, c); came.set(k, [l, x, z]); open.push([c + Math.abs(q[1] - tx) + Math.abs(q[2] - tz) + Math.abs(q[0] - to.l) * 6, q[0], q[1], q[2], 0]) }
    }
    return null
  }
}
const pass = (t: number) => t === E.None || t === E.Arch || isDoor(t)
export function stand(w: World, l: number, x: number, z: number) { const f = w.flagAt(l, x, z); if (f & FLAG.solid) return false; return w.floorAt(l, x, z) !== 0 }
export function cellY(w: World, l: number, x: number, z: number) { const v = w.levels.get(l); if (!v) return l * 4; const i = idx(x, z); if (l === 0 && v.floor[i] === TERRAIN) return w.terrainH(c2w(x), c2w(z)); return l * 4 + v.h[i] * .25 }
function nearCave(w: World, l: number, x: number, z: number) { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (w.flagAt(l, x + a, z + b) & FLAG.cave) return true; return false }
