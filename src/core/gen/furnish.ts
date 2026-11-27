import { World, idx, inb, type Room } from '../world'
import { E, FL, FLAG, DIRS, THEMES, CELL, c2w, v2w, yawOf, isDoor, WT, w2c } from '../defs'
import { model, collider } from '../catalog'
import type { Rng } from '../rng'
import type { Cell } from './build'
/** Places props sensibly in one room: along walls, in corners, in the middle; never blocks a door. */
export class Fit {
  cells: Cell[]; set: Set<number>; res = new Set<number>(); occ: { x: number; z: number; hx: number; hz: number }[] = []; doors: { x: number; z: number; d: number }[] = []; cx = 0; cz = 0; area: number; hasCave: boolean
  constructor(public w: World, public room: Room, public r: Rng, cells?: Cell[]) {
    this.cells = cells ?? w.roomCells(room); this.set = new Set(this.cells.map(c => idx(c[0], c[1]))); this.area = this.cells.length; const l = room.l
    this.hasCave = this.cells.some(([x, z]) => (w.flagAt(l, x, z) & FLAG.cave) !== 0)
    for (const [x, z] of this.cells) for (let d = 0; d < 4; d++) { const e = w.etype(l, x, z, d), nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (isDoor(e) || e === E.Arch || (e === E.None && inb(nx, nz) && !this.set.has(idx(nx, nz)) && w.open(l, nx, nz))) { this.doors.push({ x, z, d }); this.res.add(idx(x, z)); const bx = x - DIRS[d][0], bz = z - DIRS[d][1]; if (this.set.has(idx(bx, bz))) this.res.add(idx(bx, bz)) } }
    for (const st of w.stairs.values()) if (st.l === l || st.l + 1 === l) for (const [x, z] of World.stairCells(st)) for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (this.set.has(idx(x + a, z + b))) this.res.add(idx(x + a, z + b))
    for (const [x, z] of this.cells) { this.cx += x; this.cz += z } this.cx /= Math.max(1, this.area); this.cz /= Math.max(1, this.area)
    this.paths()
    for (const p of w.props.values()) if (p.l === l && this.set.has(idx(w2c(p.x), w2c(p.z)))) { const m = model(p.m); if (m && m.mount !== 'wall' && m.mount !== 'ceil') { const hx = (m.hi[0] - m.lo[0]) / 2 * p.s, hz = (m.hi[2] - m.lo[2]) / 2 * p.s; this.occ.push({ x: p.x, z: p.z, hx: Math.max(hx, hz), hz: Math.max(hx, hz) }) } }
  }
  /** keep one clear walking line between every door and the middle */
  private paths() {
    if (!this.doors.length) return; const { w, room } = this, l = room.l; let best: Cell = this.cells[0], bd = 1e9; for (const c of this.cells) { const k = (c[0] - this.cx) ** 2 + (c[1] - this.cz) ** 2; if (k < bd && !(w.flagAt(l, c[0], c[1]) & (FLAG.lava | FLAG.water | FLAG.hole))) { bd = k; best = c } }
    const prev = new Map<number, number>(), q = [idx(best[0], best[1])]; prev.set(q[0], -1)
    while (q.length) { const i = q.shift()!, x = i % 192, z = (i / 192) | 0; for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (!inb(nx, nz)) continue; const k = idx(nx, nz); if (!this.set.has(k) || prev.has(k) || w.edge(l, x, z, d)) continue; prev.set(k, i); q.push(k) } }
    for (const d of this.doors) { let i = idx(d.x, d.z); while (i >= 0 && prev.has(i)) { this.res.add(i); i = prev.get(i)! } }
  }
  y(x: number, z: number) { const v = this.w.levels.get(this.room.l)!; const i = idx(w2c(x), w2c(z)); return this.room.l * 4 + v.h[i] * .25 }
  free(x: number, z: number, hx: number, hz: number, solid: boolean, pad = .06) {
    const l = this.room.l
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const px = x + a * hx, pz = z + b * hz, cx = w2c(px), cz = w2c(pz); if (!inb(cx, cz) || !this.set.has(idx(cx, cz))) return false; const f = this.w.flagAt(l, cx, cz); if (f & (FLAG.hole | FLAG.lava | FLAG.water)) return false; if (solid && this.res.has(idx(cx, cz))) return false; if (this.hasCave && (a || b) && solid) { const nx = w2c(px + a * .5), nz = w2c(pz + b * .5); if (!this.w.open(l, nx, nz)) return false } }
    // do not straddle an internal wall
    const x0 = w2c(x - hx), x1 = w2c(x + hx), z0 = w2c(z - hz), z1 = w2c(z + hz)
    for (let cz = z0; cz <= z1; cz++) for (let cx = x0; cx <= x1; cx++) { if (cx < x1 && this.w.edge(l, cx, cz, 0)) return false; if (cz < z1 && this.w.edge(l, cx, cz, 1)) return false }
    for (const o of this.occ) if (Math.abs(o.x - x) < o.hx + hx + pad && Math.abs(o.z - z) < o.hz + hz + pad) return false
    return true
  }
  put(m: string, x: number, z: number, r = 0, o: { pad?: number; s?: number; force?: boolean; dy?: number; soft?: boolean } = {}) {
    const md = model(m); if (!md) return null; const s = o.s ?? 1, sn = Math.abs(Math.sin(r)), cs = Math.abs(Math.cos(r)); let hx = (md.hi[0] - md.lo[0]) / 2 * s, hz = (md.hi[2] - md.lo[2]) / 2 * s; const col = collider(md); if (md.col === 'trunk') hx = hz = .45
    const ex = hx * cs + hz * sn, ez = hx * sn + hz * cs; const oxl = md.col === 'trunk' ? 0 : (md.hi[0] + md.lo[0]) / 2 * s, ozl = md.col === 'trunk' ? 0 : (md.hi[2] + md.lo[2]) / 2 * s; const ccx = x + oxl * Math.cos(r) + ozl * Math.sin(r), ccz = z - oxl * Math.sin(r) + ozl * Math.cos(r)
    const solid = !!col
    if (!o.force && !this.free(ccx, ccz, ex, ez, solid, o.pad ?? .06)) return null
    if (!(md.flat || o.soft)) this.occ.push({ x: ccx, z: ccz, hx: ex, hz: ez })
    return this.w.addProp(m, x, this.y(x, z) + (o.dy ?? 0), z, r, this.room.l, s)
  }
  /** wall slots: solid wall segments facing into the room */
  slots(clear = 0) { const l = this.room.l, o: { x: number; z: number; d: number; wx: number; wz: number; yaw: number }[] = []; for (const [x, z] of this.cells) for (let d = 0; d < 4; d++) { const t = this.w.etype(l, x, z, d); if (t !== E.Wall) continue; let ok = true; for (let k = -clear; k <= clear && ok; k++) { if (!k) continue; const s = DIRS[(d + 1) % 4]; const e = this.w.etype(l, x + s[0] * k, z + s[1] * k, d); if (isDoor(e) || e === E.Arch || e === E.Window) ok = false } if (!ok) continue; const f = DIRS[d], off = CELL / 2 - WT / 2 - .07; o.push({ x, z, d, wx: c2w(x) + f[0] * off, wz: c2w(z) + f[1] * off, yaw: yawOf(-f[0], -f[1]) }) } return o }
  private wallUsed = new Set<string>()
  onWall(m: string, n = 1, clear = 0, spread = 0) {
    if (!model(m)) return 0; let made = 0; const used: { wx: number; wz: number }[] = []
    for (const s of this.r.shuffle(this.slots(clear))) { if (made >= n) break; const k = `${s.x},${s.z},${s.d}`; if (this.wallUsed.has(k)) continue; if (spread && used.some(u => Math.hypot(u.wx - s.wx, u.wz - s.wz) < spread)) continue
      this.wallUsed.add(k); used.push(s); this.w.addProp(m, s.wx, this.y(c2w(s.x), c2w(s.z)), s.wz, s.yaw, this.room.l); made++ }
    return made
  }
  /** furniture standing with its back to a wall */
  against(m: string, n = 1, clear = 0) {
    const md = model(m); if (!md) return 0; let made = 0; const depth = md.back ? 0 : -md.lo[2]
    for (const s of this.r.shuffle(this.slots(clear))) { if (made >= n) break; const f = DIRS[s.d], k = `${s.x},${s.z},${s.d}`; if (this.wallUsed.has(k)) continue; if (this.put(m, s.wx - f[0] * (depth + .02), s.wz - f[1] * (depth + .02), s.yaw)) { this.wallUsed.add(k); made++ } }
    return made
  }
  corner(m: string, n = 1, jitter = .1) {
    let made = 0; const l = this.room.l; const md = model(m); if (!md) return 0; const R = Math.max(md.hi[0], -md.lo[0], md.hi[2], -md.lo[2])
    for (const [x, z] of this.r.shuffle([...this.cells])) { if (made >= n) break; for (let d = 0; d < 4; d++) { const d2 = (d + 1) % 4; if (this.w.etype(l, x, z, d) === E.Wall && this.w.etype(l, x, z, d2) === E.Wall) { const a = DIRS[d], b = DIRS[d2], k = CELL / 2 - WT / 2 - .1 - Math.min(R, 1.2) * .95 - this.r() * jitter; if (md.mount === 'corner') { const kk = CELL / 2 - WT / 2; this.w.addProp(m, c2w(x) + (a[0] + b[0]) * kk, this.y(c2w(x), c2w(z)), c2w(z) + (a[1] + b[1]) * kk, yawOf(-(a[0] + b[0]), -(a[1] + b[1])) - Math.PI / 4, l); made++; break } if (this.put(m, c2w(x) + (a[0] + b[0]) * k, c2w(z) + (a[1] + b[1]) * k, yawOf(-(a[0] + b[0]), -(a[1] + b[1])) + this.r.range(-.4, .4))) { made++; break } } } }
    return made
  }
  scatter(m: string | string[], n = 1, o: { rot?: boolean; s?: [number, number]; soft?: boolean } = {}) {
    let made = 0; for (let t = 0; t < n * 14 && made < n; t++) { const c = this.r.pick(this.cells); const id = Array.isArray(m) ? this.r.pick(m) : m; if (this.put(id, c2w(c[0]) + this.r.range(-.6, .6), c2w(c[1]) + this.r.range(-.6, .6), o.rot === false ? 0 : this.r() * 6.283, { s: o.s ? this.r.range(...o.s) : 1, soft: o.soft })) made++ } return made
  }
  center(m: string, r = 0, o: any = {}) { const x = (this.cx - 96 + .5) * CELL, z = (this.cz - 96 + .5) * CELL; return this.put(m, x, z, r, o) }
  get wx() { return (this.cx - 96 + .5) * CELL } get wz() { return (this.cz - 96 + .5) * CELL }
  get wide() { return this.room.x1 - this.room.x0 + 1 } get deep() { return this.room.z1 - this.room.z0 + 1 }
  /** long axis yaw */
  get axis() { return this.wide >= this.deep ? Math.PI / 2 : 0 }
  top(m: string, on: { x: number; z: number; r: number; m: string; y: number } | null, dx: number, dz: number, r = 0) { if (!on) return; const h = model(on.m)?.top ?? .8; const c = Math.cos(on.r), s = Math.sin(on.r); this.w.addProp(m, on.x + dx * c + dz * s, on.y + h, on.z - dx * s + dz * c, on.r + r, this.room.l) }
  torches(spacing = 6, m = 'torch_wall') { const n = Math.max(1, Math.round(this.area / spacing)); return this.onWall(m, n, 1, 3.6) || this.onWall(m, Math.max(1, n >> 1), 0, 3) }
  pillars(step = 3) {
    const th = THEMES[this.room.theme], m = this.r.pick(th.pillar); const { x0, z0, x1, z1 } = this.room; const W = x1 - x0 + 1, D = z1 - z0 + 1; if (W < 6 || D < 6) return 0; let n = 0
    const ix = W >= 9 ? 2 : 2, iz = D >= 9 ? 2 : 2; const px: number[] = [], pz: number[] = []
    for (let k = ix; k <= W - ix; k += Math.max(2, Math.round((W - 2 * ix) / Math.max(1, Math.round((W - 2 * ix) / step))))) px.push(k); for (let k = iz; k <= D - iz; k += Math.max(2, Math.round((D - 2 * iz) / Math.max(1, Math.round((D - 2 * iz) / step))))) pz.push(k)
    for (const a of px) for (const b of pz) { if (a !== px[0] && a !== px[px.length - 1] && W <= D) continue; if (b !== pz[0] && b !== pz[pz.length - 1] && D < W) continue; const gx = x0 + a, gz = z0 + b; if (this.res.has(idx(gx, gz)) && this.res.has(idx(gx - 1, gz - 1)) ) continue; if (this.put(m, v2w(gx), v2w(gz), 0, { pad: .3 })) n++ }
    return n
  }
}
type Recipe = (f: Fit, r: Rng, w: World) => void
const seats = (f: Fit, t: any, len: number, both = true) => { if (!t) return; const c = Math.cos(t.r), s = Math.sin(t.r); for (const sd of both ? [-1, 1] : [1]) f.put('bench', t.x + sd * .82 * c, t.z - sd * .82 * s, t.r + Math.PI / 2, { pad: -.1 }) }
const lay = (f: Fit, t: any, r: Rng) => { if (!t) return; for (let i = -1; i <= 1; i++) { f.top(r.pick(['mug', 'plate_food', 'bottle', 'mug']), t, r.range(-.2, .2), i * .8 + r.range(-.15, .15), r() * 6); if (i === 0) f.top('candle_table', t, 0, .3) } }
const junk: Recipe = (f, r) => { const big = f.area > 20; f.corner('cobweb', r.int(0, 2)); if (r.chance(.5)) f.corner(r.pick(['barrel', 'crate', 'urn', 'sacks', 'vase_tall', 'pot_clay']), r.int(1, 2)); if (r.chance(.35)) f.scatter(['bones_pile', 'rubble_small', 'skull_one', 'skeleton_remains', 'pot_clay'], big ? 2 : 1, { soft: true }); if (r.chance(.25)) f.scatter('rubble_small', 1, { soft: true }) }
export const RECIPES: Record<string, Recipe> = {
  corridor: (f, r) => { f.torches(9); if (r.chance(.2)) f.corner(r.pick(['urn', 'barrel', 'cobweb', 'pot_clay']), 1); if (r.chance(.18)) f.scatter(['bones_pile', 'skull_one', 'rubble_small', 'skeleton_remains'], 1, { soft: true }) },
  entrance: (f, r) => { f.pillars(); f.torches(5); f.onWall(THEMES[f.room.theme].banner, 2, 0, 3); f.corner('brazier', 2); f.corner('urn', 1); if (r.chance(.5)) f.corner('statue_broken', 1) },
  landing: (f, r) => { f.torches(4); f.corner(r.pick(['urn', 'brazier', 'statue_knight']), 1) },
  hall: (f, r) => { f.pillars(); f.torches(6); f.onWall(THEMES[f.room.theme].banner, 4, 0, 3); if (f.area > 40) f.center('chandelier', 0, { force: true }); const t = f.put('table_long', f.wx, f.wz, f.axis + Math.PI / 2); seats(f, t, 2); lay(f, t, r); f.against('fireplace', 1, 1); f.onWall('shield_wall', 2, 0, 2); f.onWall(r.pick(['tapestry', 'painting']), 1, 1); f.corner(r.pick(['armor_stand', 'harp', 'globe']), 2) },
  throne: (f, r) => { f.pillars(); f.torches(7); const w = f.deep >= f.wide ? [0, 1] : [1, 0]; f.against(f.room.theme === 'crypt' || f.room.theme === 'infernal' ? 'bone_throne' : 'throne', 1, 2); if (f.area > 50) f.corner('statue_dragon', 2); f.onWall(THEMES[f.room.theme].banner, 6, 0, 2); f.center('rug_red', f.axis + Math.PI / 2, { soft: true }); f.corner('brazier_stone', 4); f.corner('statue_king', 2); void w },
  barracks: (f, r) => { f.torches(7); f.against(r.chance(.5) ? 'bunk' : 'bed', Math.max(2, Math.floor(f.area / 7))); f.against('chest', 2); f.against('weapon_rack', 1); const t = f.put('table_small', f.wx, f.wz, 0); f.top('candle_table', t, .2, .1); f.scatter('stool', 2); f.corner('armor_stand', 1); if (f.area > 30 && r.chance(.5)) f.scatter('war_table', 1, { rot: false }) },
  armory: (f, r) => { f.torches(6); f.against('weapon_rack', Math.max(2, Math.floor(f.area / 6))); f.corner('armor_stand', 2); f.scatter('armor_stand', Math.floor(f.area / 12)); f.onWall('shield_wall', 3, 0, 1.6); f.corner('crates', 1); f.against('chest', 1); f.scatter('grindstone', 1); if (f.area > 26) f.scatter('ballista', 1, { rot: false }); f.onWall('mask_wall', 1) },
  library: (f, r) => { f.torches(9, 'lantern_hang'); f.against('bookshelf', Math.max(3, Math.floor(f.area / 4))); const t = f.put('table_long', f.wx, f.wz, f.axis + Math.PI / 2); f.top('books_pile', t, .2, .6, .4); f.top('candle_table', t, -.1, 0); f.top('scrolls', t, .1, -.6); f.scatter('chair', 2); f.scatter(r.pick(['lectern', 'globe', 'orrery']), 1); f.onWall('painting', 1); f.center('rug_blue', f.axis + Math.PI / 2, { soft: true, force: true }); f.corner('candelabra', 2) },
  shrine: (f, r) => { f.pillars(); const evil = f.room.theme === 'infernal' || f.room.theme === 'crypt'; f.torches(10); f.against(evil ? 'altar_dark' : 'altar', 1, 1); f.corner('candelabra', 3); f.corner(evil ? 'brazier_stone' : 'statue_angel', 2); f.scatter('bench', Math.floor(f.area / 12)); f.onWall(evil ? 'banner_black' : 'banner_gold', 2, 0, 3); f.center(evil ? 'rug_red' : 'rug_blue', f.axis + Math.PI / 2, { soft: true }); f.onWall('window_none', 0) },
  crypt: (f, r) => { f.torches(11); const n = Math.max(2, Math.floor(f.area / 8)); f.against('sarcophagus', Math.ceil(n / 2)); for (let i = 0; i < n; i++) f.scatter(r.chance(.25) ? 'sarcophagus_open' : 'sarcophagus', 1, { rot: false }); f.against('coffin', 1); if (f.area > 22) f.center('sarcophagus_king', f.axis); f.onWall('sconce_skull', 2, 0, 3); f.corner('urn', 3); f.scatter('candles_floor', 3, { soft: true }); f.corner('cobweb', 4); f.scatter('bones_pile', 2, { soft: true }); f.corner('statue_robed', 1) },
  prison: (f, r) => { f.torches(12); f.onWall('chains_wall', Math.max(2, Math.floor(f.area / 7)), 0, 1.4); f.scatter('cage', Math.max(1, Math.floor(f.area / 16)), { rot: false }); f.corner('bedroll', 2); f.scatter('skeleton_remains', 1, { soft: true }); f.corner('bucket', 2); f.corner('cobweb', 2); f.scatter('gibbet', 1, { soft: true }); f.scatter('pillory', 1) },
  torture: (f, r) => { f.torches(9); f.center('rack', f.axis) || f.scatter('rack', 1, { rot: false }); f.against('iron_maiden', 1); f.scatter(r.pick(['stocks', 'pillory']), 1, { rot: false }); f.onWall('chains_wall', 3, 0, 1.5); f.corner('brazier', 1); f.scatter('cage', 1, { rot: false }); f.scatter('gibbet', 1, { soft: true }); f.corner('skull_one', 2); f.scatter('bones_pile', 1, { soft: true }) },
  treasury: (f, r) => { f.torches(8); f.scatter('gold_pile', Math.max(1, Math.floor(f.area / 10)), { soft: false }); f.scatter('treasure_heap', Math.max(1, Math.floor(f.area / 16))); f.against('trophy_case', 1); f.against('chest', 2); f.against('chest_open', 2); f.corner('vase_tall', 2); f.corner('urn', 2); f.corner('statue_king', 1); f.scatter('plinth', 1); f.corner('brazier', 1); f.scatter('candelabra', 1) },
  kitchen: (f, r) => { f.torches(9); f.against('fireplace', 1); const t = f.center('table_long', f.axis + Math.PI / 2); lay(f, t, r); f.against('shelf_goods', 1); f.against('wine_rack', 1); f.corner('barrel', 2); f.corner('sacks', 2); f.scatter('cauldron', 1); f.corner('bucket', 1); f.corner('crates', 1) },
  dining: (f, r) => { f.torches(8); const n = Math.max(1, Math.floor(f.area / 14)); for (let i = 0; i < n; i++) { const t = f.scatter('table_long', 1, { rot: false }); void t } for (const p of [...f.w.props.values()].filter(p => p.m === 'table_long' && p.l === f.room.l && f.set.has(idx(w2c(p.x), w2c(p.z))))) { seats(f, p, 2); lay(f, p, r) } f.against('fireplace', 1, 1); f.corner('barrel_side', 1); f.onWall('trophy_head', 2, 0, 3); f.onWall('tapestry', 1, 1) },
  storage: (f, r) => { f.torches(14); f.corner('barrel_stack', 2); f.corner('crates', 2); f.against('shelf_goods', 2); f.scatter('barrel', Math.floor(f.area / 7)); f.scatter('sacks', 2); f.against('barrel_side', 2); f.against('wine_rack', 1); f.scatter('crate', 2); f.corner('cobweb', 2); f.corner('rug_none', 0) },
  alchemy: (f, r) => { f.torches(9, 'lantern_hang'); f.against('alchemy_table', 2) || f.scatter('alchemy_table', 1, { rot: false }); f.against('bookshelf', 2); f.center('cauldron'); f.corner('crystal_ball', 1); f.against('shelf_goods', 2); f.scatter('books_pile', 1, { soft: true }); f.corner('mushroom_glow', 1); f.corner('skull_one', 1); f.corner('candelabra', 1); if (r.chance(.5)) f.scatter('orrery', 1) },
  bedroom: (f, r) => { f.torches(12, 'lantern_hang'); f.against(r.chance(.5) ? 'bed_canopy' : 'bed', 1, 0); f.against('wardrobe', 1); f.against('chest', 1); f.center('rug_red', f.axis, { soft: true }); const t = f.scatter('table_small', 1, { rot: false }); void t; f.scatter('chair', 1); f.against('fireplace', 1, 1); f.onWall(r.pick(['tapestry', 'painting']), 1, 1); f.corner('vase_round', 1); f.corner(r.pick(['candelabra', 'harp']), 1); if (r.chance(.3)) f.scatter('bathtub', 1) },
  summoning: (f, r) => { f.torches(14); f.center('rune_circle', 0, { soft: true, force: true }); f.corner('brazier_stone', 4); f.against('altar_dark', 1, 1); f.against('bookshelf', 1); f.corner(r.pick(['statue_robed', 'arcane_pylon']), 2); f.scatter('sacrificial_well', r.chance(.4) ? 1 : 0); f.onWall('mask_wall', 1); f.corner('skull_one', 2); f.onWall('banner_black', 3, 0, 2) },
  portal: (f, r) => { f.pillars(); f.torches(14); f.against('portal', 1, 1) || f.center('portal', 0, { force: true }); f.corner('arcane_pylon', 4); f.scatter('obelisk', 2); f.corner('statue_robed', 2) },
  fountain: (f, r) => { f.pillars(); f.torches(7); f.center('fountain', 0, { force: true }); f.corner('vase_tall', 2); f.corner('statue_angel', 2); f.scatter('bench', 2); f.onWall('ivy', 4, 0) },
  guard: (f, r) => { f.torches(5); const t = f.center('table_round'); f.top('candle_table', t as any, 0, .1); f.top('mug', t as any, .3, -.2); f.scatter('stool', 3); f.against('weapon_rack', 1); f.corner('barrel', 1); f.corner('crate', 1); f.onWall('shield_wall', 1); if (f.area > 24 && r.chance(.35)) f.scatter('war_table', 1, { rot: false }) },
  trap: (f, r) => { f.torches(12); f.center('spike_trap', 0, { soft: true, force: true }); f.scatter('spike_trap', Math.floor(f.area / 12), { rot: false, soft: true }); f.scatter('pressure_plate', 2, { rot: false, soft: true }); f.scatter('skeleton_remains', 2, { soft: true }); f.onWall('lever', 1, 1); f.against('chest', 1, 0) },
  forge: (f, r) => { f.torches(8); f.against('forge_hearth', 1, 0) || f.center('forge_hearth', 0); f.scatter('anvil', 2); f.scatter('grindstone', 1); f.against('weapon_rack', 2); f.corner('barrel', 2); f.corner('armor_stand', 1); f.corner('crates', 1); f.scatter('mine_cart', 1); if (f.room.theme === 'dwarven' || r.chance(.3)) f.against('clockwork', 1) },
  nest: (f, r) => { f.scatter('egg_sac', Math.floor(f.area / 14)); f.corner('cobweb', 6); f.scatter('bones_pile', 3, { soft: true }); f.scatter('skeleton_remains', 2, { soft: true }); f.scatter('mushroom_glow', 2, { soft: true }) },
  room: (f, r) => { f.torches(7); junk(f, r, f.w) },
  ruin: (f, r) => { f.scatter(['rubble_large', 'rubble_small'], Math.ceil(f.area / 10), { soft: true }); f.scatter('pillar_broken', Math.floor(f.area / 14)); f.scatter('boulder', 1); f.onWall('ivy', 3); f.scatter('fern', 3, { soft: true }); f.torches(16) },
  // ---- caves
  cave: (f, r) => { caveBase(f, r); lightCave(f, r) },
  cavecamp: (f, r) => { f.center('campfire', 0, { force: false }) || f.scatter('campfire', 1); f.scatter('bedroll', 3); f.scatter('crates', 1); f.scatter('barrel', 1); f.scatter(r.pick(['log_fallen', 'barricade']), 1); caveBase(f, r) },
  crystal: (f, r) => { const c = r.pick(['crystal_blue', 'crystal_purple', 'crystal_green', 'crystal_red']); f.scatter(c, Math.max(3, Math.floor(f.area / 9)), { s: [.7, 1.7] }); f.scatter('geode', Math.max(1, Math.floor(f.area / 30))); caveBase(f, r) },
  fungus: (f, r) => { f.scatter('mushroom_giant', Math.max(3, Math.floor(f.area / 10)), { s: [.8, 1.5] }); f.scatter('mushroom_glow', Math.floor(f.area / 8), { soft: true }); f.scatter('fern', 3, { soft: true }); caveBase(f, r) },
  mine: (f, r) => { f.scatter('mine_cart', 1); f.scatter('crates', 1); f.scatter('lantern_post', 2); f.scatter('barrel', 2); f.scatter('rubble_large', 2, { soft: true }); f.scatter('ladder_none', 0); caveBase(f, r); lightCave(f, r) },
  // ---- homes and trades
  cottage: (f, r) => { f.against('fireplace', 1, 0); f.against('bed', r.int(1, 2)); const t = f.center('table_small'); f.top('candle_table', t as any, .1, .1); f.top('mug', t as any, -.2, -.1); f.scatter('stool', 2); f.against('chest', 1); f.against('shelf_goods', 1); f.corner('barrel', 1); f.corner('pot_clay', 1); f.scatter('rug_hide', 1, { soft: true }); f.onWall('lantern_hang', 1, 0) },
  tavern: (f, r) => { f.against('fireplace', 1, 0); const sl = f.slots(1); if (sl.length) { const s = sl[Math.floor(sl.length / 2)], q = DIRS[s.d]; f.put('counter', s.wx - q[0] * 1.9, s.wz - q[1] * 1.9, s.yaw); } f.against('barrel_side', 2); f.against('shelf_goods', 2); for (let i = 0; i < Math.max(2, f.area / 14); i++) { const k = f.scatter('table_round', 1); if (k) { const p = [...f.w.props.values()].pop()!; for (let j = 0; j < 3; j++) { const a = j * 2.1 + r(); f.put('stool', p.x + Math.cos(a) * .95, p.z + Math.sin(a) * .95, 0, { pad: -.05 }) } f.top('mug', p, .2, .1); f.top('candle_table', p, 0, -.1); f.top('plate_food', p, -.25, .15) } } f.onWall('trophy_head', 2, 0, 2); f.onWall('lantern_hang', Math.ceil(f.area / 14), 0, 3); if (f.area > 40) f.center('chandelier', 0, { force: true, soft: true }); f.corner('barrel_stack', 1) },
  shop: (f, r) => { const sl = f.slots(1); if (sl.length) { const s = sl[0], q = DIRS[s.d]; f.put('counter', s.wx - q[0] * 1.7, s.wz - q[1] * 1.7, s.yaw) } f.against('shelf_goods', 4); f.against('bookshelf', 1); f.scatter('market_goods', 1, { rot: false }); f.corner('crates', 1); f.corner('barrel', 2); f.corner('sacks', 1); f.onWall('lantern_hang', 2, 0, 3); f.scatter('rug_green', 1, { rot: false, soft: true }) },
  smithy: (f, r) => { f.against('forge_hearth', 1, 0) || f.scatter('forge_hearth', 1, { rot: false }); f.center('anvil') || f.scatter('anvil', 1); f.scatter('grindstone', 1); f.against('weapon_rack', 2); f.corner('armor_stand', 1); f.corner('barrel', 1); f.corner('crate', 1); f.onWall('lantern_hang', 2, 0, 3) },
  chapel: (f, r) => { f.against('altar', 1, 1); for (let i = 0; i < f.area / 7; i++) f.scatter('bench', 1, { rot: false }); f.corner('candelabra', 4); f.corner('statue_angel', 2); f.onWall('banner_gold', 2, 0, 3); f.onWall('lantern_hang', 3, 0, 3); f.center('rug_red', f.axis + Math.PI / 2, { soft: true, force: true }) },
  stable: (f, r) => { f.scatter('hay_bale', 4, { rot: false }); f.corner('haystack', 1); f.against('trough', 2); f.corner('bucket', 2); f.onWall('lantern_hang', 2, 0, 3); f.corner('barrel', 1) },
  study: (f, r) => { f.against('bookshelf', 3); f.scatter(r.pick(['lectern', 'orrery', 'globe']), 1); f.against('alchemy_table', 1); f.corner('crystal_ball', 1); f.center('rug_blue', 0, { soft: true }); f.onWall('lantern_hang', 2, 0, 3); f.against('chest', 1); f.scatter('chair', 1) },
}
function caveBase(f: Fit, r: Rng) { const a = f.area; f.scatter(['stalagmite_0', 'stalagmite_1', 'stalagmite_2'], Math.floor(a / 9), { s: [.6, 1.3] }); for (let i = 0; i < a / 8; i++) { const c = r.pick(f.cells); if (f.w.levels.get(f.room.l)!.ceil[idx(c[0], c[1])] === 3) f.w.addProp(r.pick(['stalactite_0', 'stalactite_1']), c2w(c[0]) + r.range(-.5, .5), f.room.l * 4, c2w(c[1]) + r.range(-.5, .5), r() * 6, f.room.l, r.range(.8, 1)) } f.scatter(['rock_small', 'boulder', 'rubble_small'], Math.floor(a / 12), { s: [.6, 1.1] }); if (r.chance(.4)) f.scatter('bones_pile', 1, { soft: true }) }
function lightCave(f: Fit, r: Rng) { const n = Math.max(1, Math.round(f.area / 22)); f.scatter(r.pick(['mushroom_glow', 'mushroom_glow', 'crystal_blue', 'crystal_green', 'crystal_purple']), n, { s: [.8, 1.3] }); if (r.chance(.4)) f.scatter('brazier', 1) }
export function furnish(w: World, room: Room, r: Rng, cells?: Cell[]) { const rec = RECIPES[room.type] ?? RECIPES.room; const f = new Fit(w, room, r, cells); if (f.area) rec(f, r, w); return f }
export function clearRoom(w: World, room: Room) { const S = new Set(w.roomCells(room).map(c => idx(c[0], c[1]))); for (const p of [...w.props.values()]) if (p.l === room.l && S.has(idx(w2c(p.x), w2c(p.z)))) w.props.delete(p.id) }
export const ROOM_TYPES = ['hall', 'throne', 'barracks', 'armory', 'library', 'shrine', 'crypt', 'prison', 'torture', 'treasury', 'kitchen', 'dining', 'storage', 'alchemy', 'bedroom', 'summoning', 'portal', 'fountain', 'guard', 'trap', 'forge', 'nest', 'room', 'ruin', 'cave', 'cavecamp', 'crystal', 'fungus', 'mine', 'cottage', 'tavern', 'shop', 'smithy', 'chapel', 'stable', 'study', 'entrance']
