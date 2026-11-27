import { World, idx, inb, type Room } from '../world'
import { E, FL, FLAG, DIRS, WS, THEMES, CEIL, N, isDoor, c2w, v2w, type ThemeId } from '../defs'
import { model, collider } from '../catalog'
import type { Rng } from '../rng'
export type Cell = [number, number]
export interface Rect { x0: number; z0: number; x1: number; z1: number }
export const rectCells = (x0: number, z0: number, x1: number, z1: number) => { const o: Cell[] = []; for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) o.push([x, z]); return o }
export const inR = (r: Rect, x: number, z: number) => x >= r.x0 && z >= r.z0 && x <= r.x1 && z <= r.z1
export function isVoid(w: World, l: number, x: number, z: number) { if (!inb(x, z)) return false; const v = w.levels.get(l); if (!v) return true; const i = idx(x, z); return v.floor[i] === 0 && !(v.flag[i] & (FLAG.hole | FLAG.solid | FLAG.virt)) }
export function bbox(cells: Cell[]): Rect { let x0 = N, z0 = N, x1 = 0, z1 = 0; for (const [x, z] of cells) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z) } return { x0, z0, x1, z1 } }
export function fill(w: World, l: number, cells: Cell[], o: { floor: number; ceil: number; h?: number; room?: number; flag?: number }) {
  const v = w.lv(l); for (const [x, z] of cells) { if (!inb(x, z)) continue; const i = idx(x, z); v.floor[i] = o.floor; v.ceil[i] = o.ceil; v.h[i] = o.h ?? 0; v.flag[i] = o.flag ?? 0; if (o.room !== undefined) v.room[i] = o.room }
}
/** wall every border of a cell set that has no edge yet */
export function wallAround(w: World, l: number, cells: Cell[], style: number, type: number = E.Wall, force = false) {
  const S = new Set(cells.map(c => idx(c[0], c[1])))
  for (const [x, z] of cells) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (inb(nx, nz) && S.has(idx(nx, nz))) continue; if (force || !w.edge(l, x, z, d)) w.setEdge(l, x, z, d, type, style) }
}
export function setPair(w: World, l: number, x: number, z: number, d: number, sx: number, sz: number, style: number) {
  // double gate across (x,z) and its lateral neighbour (sx,sz offset). A is the lower coordinate.
  const x2 = x + sx, z2 = z + sz, firstLow = sx > 0 || sz > 0
  w.setEdge(l, x, z, d, firstLow ? E.GateA : E.GateB, style); w.setEdge(l, x2, z2, d, firstLow ? E.GateB : E.GateA, style)
}
export function newRoom(w: World, l: number, cells: Cell[], type: string, theme: ThemeId, depth = 0): Room { const b = bbox(cells); return w.addRoom({ l, type, ...b, theme, depth }) }
export interface GrowOpts { l: number; theme: ThemeId; bounds: Rect; rooms: number; caveMix?: number; seedRooms?: Room[]; only?: { x: number; z: number; d: number }[]; big?: number }
export interface Growth { rooms: Room[]; links: [number, number][] }

export function octagon(W: number, D: number) { const c = Math.max(1, Math.floor(Math.min(W, D) / 4)); const o: Cell[] = []; for (let v = 0; v < D; v++) for (let u = 0; u < W; u++) { const a = Math.min(u, W - 1 - u), b = Math.min(v, D - 1 - v); if (a + b >= c) o.push([u, v]) } return o }
export function cross(W: number, D: number) { const a = Math.floor(W / 4), b = Math.floor(D / 4); const o: Cell[] = []; for (let v = 0; v < D; v++) for (let u = 0; u < W; u++) if ((u >= a && u < W - a) || (v >= b && v < D - b)) o.push([u, v]); return o }
export function blob(W: number, D: number, r: Rng, entry: number, wd: number) {
  let g = new Uint8Array(W * D); const cx = (W - 1) / 2, cz = (D - 1) / 2
  for (let v = 0; v < D; v++) for (let u = 0; u < W; u++) { const e = ((u - cx) / (W / 2)) ** 2 + ((v - cz) / (D / 2)) ** 2; g[v * W + u] = r() < 0.98 - e * 0.55 ? 1 : 0 }
  for (let it = 0; it < 3; it++) { const q = new Uint8Array(W * D); for (let v = 0; v < D; v++) for (let u = 0; u < W; u++) { let n = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) { const x = u + a, y = v + b; n += x >= 0 && y >= 0 && x < W && y < D ? g[y * W + x] : 0 } q[v * W + u] = n >= 5 ? 1 : 0 } g = q }
  for (let v = 0; v <= Math.ceil(cz); v++) for (let u = entry; u < entry + wd; u++) g[v * W + u] = 1
  for (let u = Math.min(entry, Math.floor(cx)); u <= Math.max(entry + wd - 1, Math.ceil(cx)); u++) { g[Math.floor(cz) * W + u] = 1; g[Math.min(D - 1, Math.floor(cz) + 1) * W + u] = 1 }
  // keep the part connected to the entry
  const seen = new Uint8Array(W * D), st = [entry], o: Cell[] = []; seen[entry] = 1
  while (st.length) { const i = st.pop()!, u = i % W, v = (i / W) | 0; o.push([u, v]); for (const [a, b] of DIRS) { const x = u + a, y = v + b; if (x < 0 || y < 0 || x >= W || y >= D) continue; const k = y * W + x; if (g[k] && !seen[k]) { seen[k] = 1; st.push(k) } } }
  return o
}
function doorKind(r: Rng, theme: ThemeId) { return r.weighted([[E.Door, 6], [E.Arch, 2.4], [E.Iron, theme === 'infernal' || theme === 'crypt' ? 1.6 : .8]] as const) }

/** grow rooms outward from existing walls. Always connected: each new room hangs off a door. */
export function grow(w: World, r: Rng, o: GrowOpts): Growth {
  const th = THEMES[o.theme], out: Room[] = [], links: [number, number][] = []
  let fails = 0; const maxFails = 400 + o.rooms * 40
  const pool: Room[] = [...(o.seedRooms ?? [])]; const gates = [...w.props.values()].filter(p => p.l === o.l && (p.m === 'portcullis' || p.m === 'frame_gate' || p.m === 'portal'))
  const onlyList = o.only ? r.shuffle([...o.only]) : null
  while (out.length < o.rooms && fails < maxFails) {
    // choose an anchor wall
    let ax: number, az: number, d: number, src: Room | undefined
    if (onlyList && out.length === 0) { const a = onlyList[fails % onlyList.length]; ax = a.x; az = a.z; d = a.d; src = w.roomAt(o.l, ax, az) }
    else {
      if (!pool.length) break
      src = r.chance(.55) ? pool[Math.max(0, pool.length - 1 - r.int(0, Math.min(5, pool.length - 1)))] : r.pick(pool)
      const cells = w.roomCells(src); if (!cells.length) { fails++; continue }
      const c = r.pick(cells); ax = c[0]; az = c[1]; d = r.int(0, 3)
    }
    const f = DIRS[d], ox = ax + f[0], oz = az + f[1]
    const fromCave = !!(w.flagAt(o.l, ax, az) & FLAG.cave)
    if (gates.some(g => Math.hypot(g.x - c2w(ax), g.z - c2w(az)) < 3.4)) { fails++; continue }
    if (!isVoid(w, o.l, ox, oz) || (!fromCave && w.etype(o.l, ax, az, d) !== E.Wall && w.etype(o.l, ax, az, d) !== E.Ruin)) { fails++; continue }
    const side = r.chance(.5) ? 1 : -1, s: Cell = [-f[1] * side, f[0] * side]
    let wd = r.chance(.72) ? 2 : 1
    if (wd === 2) { const bx = ax + s[0], bz = az + s[1]; const bc = !!(w.flagAt(o.l, bx, bz) & FLAG.cave); if (!w.open(o.l, bx, bz) || (w.roomAt(o.l, bx, bz)?.id !== src?.id) || w.edge(o.l, ax, az, DIRS.findIndex(q => q[0] === s[0] && q[1] === s[1])) || !isVoid(w, o.l, bx + f[0], bz + f[1]) || (!bc && w.etype(o.l, bx, bz, d) !== E.Wall)) wd = 1 }
    const corr: Cell[] = []; let len: number = r.weighted([[0, 3], [2, 2], [3, 3], [4, 3], [5, 2], [7, 1]] as const); if (fromCave) len = Math.max(len, 1)
    if (wd === 1 && len > 4) len = 3
    let fo: Cell = [ox, oz], ff: Cell = [f[0], f[1]], fs: Cell = s
    for (let v = 0; v < len; v++) for (let u = 0; u < wd; u++) corr.push([fo[0] + fs[0] * u + ff[0] * v, fo[1] + fs[1] * u + ff[1] * v])
    if (len >= 3 && r.chance(.38)) {   // bend
      const dir = r.chance(.5) ? 1 : -1, l2 = r.int(2, 4); const bv = len - wd; const start = dir > 0 ? wd : -1
      const no: Cell = [fo[0] + fs[0] * start + ff[0] * bv, fo[1] + fs[1] * start + ff[1] * bv]; const nf: Cell = [fs[0] * dir, fs[1] * dir], ns: Cell = [ff[0], ff[1]]
      for (let v = 0; v < l2; v++) for (let u = 0; u < wd; u++) corr.push([no[0] + ns[0] * u + nf[0] * v, no[1] + ns[1] * u + nf[1] * v])
      fo = no; ff = nf; fs = ns; len = l2
    }
    // room in frame (fo, ff, fs) starting at v=len
    const isCave = r.chance(o.caveMix ?? 0), big = r.chance(o.big ?? .16)
    let W = big ? r.int(8, 12) : r.int(4, 7), D = big ? r.int(8, 13) : r.int(4, 7); if (isCave) { W = r.int(7, 13); D = r.int(7, 13) } else if (!big && r.chance(.18)) { W = r.int(3, 4); D = r.int(3, 4) }
    if (wd === 2 && W < 4) W = 4
    const a = W <= wd + 1 ? Math.floor((W - wd) / 2) : r.chance(.5) ? Math.floor((W - wd) / 2) : r.int(1, W - 1 - wd)
    const kind = isCave ? 'blob' : r.weighted([['rect', 6], ['oct', W >= 6 && D >= 6 ? 1.6 : 0], ['cross', W >= 7 && D >= 7 ? 1.4 : 0]] as const)
    let loc = kind === 'oct' ? octagon(W, D) : kind === 'cross' ? cross(W, D) : kind === 'blob' ? blob(W, D, r, a, wd) : rectCells(0, 0, W - 1, D - 1)
    if (kind === 'oct' || kind === 'cross') { const has = (u: number) => loc.some(c => c[0] === u && c[1] === 0); let ok = true; for (let u = 0; u < wd; u++) if (!has(a + u)) ok = false; if (!ok) loc = rectCells(0, 0, W - 1, D - 1) }
    const rc: Cell[] = loc.map(([u, v]) => [fo[0] + fs[0] * (u - a) + ff[0] * (v + len), fo[1] + fs[1] * (u - a) + ff[1] * (v + len)])
    const all = [...corr, ...rc]
    if (!all.every(([x, z]) => inR(o.bounds, x, z) && isVoid(w, o.l, x, z))) { fails++; continue }
    if (isCave && !rc.every(([x, z]) => DIRS.every(([p, q]) => isVoid(w, o.l, x + p, z + q) || all.some(c => c[0] === x + p && c[1] === z + q)))) { fails++; continue } // caves keep a rind of rock
    // carve
    const style = WS[r.pick(th.walls)], depth = (src?.depth ?? 0) + 1
    let cr: Room | undefined
    if (corr.length) { cr = newRoom(w, o.l, corr, 'corridor', o.theme, depth); fill(w, o.l, corr, { floor: FL[th.floor], ceil: th.ceil === 2 ? CEIL.beams : CEIL.slab, room: cr.id }); wallAround(w, o.l, corr, WS[th.wall]) }
    const room = newRoom(w, o.l, rc, isCave ? 'cave' : 'room', o.theme, depth + (cr ? 1 : 0))
    if (isCave) fill(w, o.l, rc, { floor: FL[th.rock], ceil: CEIL.rock, room: room.id, flag: FLAG.cave })
    else { const fl = r.pick(th.floors); fill(w, o.l, rc, { floor: FL[fl], ceil: fl === 'planks_old' && r.chance(.7) ? CEIL.beams : th.ceil, room: room.id }); wallAround(w, o.l, rc, style) }
    // openings
    const di = (q: readonly number[]) => DIRS.findIndex(k => k[0] === q[0] && k[1] === q[1])
    const put = (x: number, z: number, dd: number, sv: Cell, caveA: boolean, caveB: boolean, soft: boolean) => {
      if (caveA || caveB) { const t = caveA && caveB ? E.None : wd === 1 ? E.Arch : E.None; for (let u = 0; u < wd; u++) w.setEdge(o.l, x + sv[0] * u, z + sv[1] * u, dd, t, t ? WS.rock : 0); return }
      const st = WS[th.wall]
      if (wd === 1) { w.setEdge(o.l, x, z, dd, soft && r.chance(.5) ? E.Arch : doorKind(r, o.theme), st); return }
      const k = r.weighted([['open', soft ? 4 : 1.2], ['single', 4], ['gate', big ? 4 : 1.6], ['arch', soft ? 2 : 1.4]] as const)
      if (k === 'gate') { setPair(w, o.l, x, z, dd, sv[0], sv[1], st) }
      else if (k === 'single') { const u = r.int(0, 1); w.setEdge(o.l, x + sv[0] * u, z + sv[1] * u, dd, doorKind(r, o.theme), st) }
      else if (k === 'arch') { for (let u = 0; u < 2; u++) w.setEdge(o.l, x + sv[0] * u, z + sv[1] * u, dd, E.Arch, st) }
      else for (let u = 0; u < 2; u++) w.setEdge(o.l, x + sv[0] * u, z + sv[1] * u, dd, E.None)
    }
    if (corr.length) {
      put(ax, az, d, s, fromCave, false, r.chance(.45))
      const ex = fo[0] + ff[0] * (len - 1), ez = fo[1] + ff[1] * (len - 1); put(ex, ez, di(ff), fs, false, isCave, false)
      links.push([src?.id ?? 0, cr!.id], [cr!.id, room.id])
      if (len >= 5) pool.push(cr!)
    } else { put(ax, az, d, s, fromCave, isCave, false); links.push([src?.id ?? 0, room.id]) }
    out.push(room); pool.push(room); fails = Math.max(0, fails - 10)
  }
  return { rooms: out, links }
}
/** join rooms that are close but far apart on foot */
export function loops(w: World, r: Rng, l: number, theme: ThemeId, count: number, links: [number, number][], bounds: Rect) {
  const th = THEMES[theme], adj = new Map<number, number[]>(); for (const [a, b] of links) { (adj.get(a) ?? adj.set(a, []).get(a)!).push(b); (adj.get(b) ?? adj.set(b, []).get(b)!).push(a) }
  const dist = (a: number, b: number) => { const q: [number, number][] = [[a, 0]], s = new Set([a]); while (q.length) { const [n, k] = q.shift()!; if (n === b) return k; for (const m of adj.get(n) ?? []) if (!s.has(m)) { s.add(m); q.push([m, k + 1]) } } return 99 }
  const rooms = [...w.rooms.values()].filter(q => q.l === l && q.type !== 'corridor' && q.type !== 'cave'); let made = 0; const gates = [...w.props.values()].filter(p => p.l === l && (p.m === 'frame_gate' || p.m === 'portal'))
  for (let t = 0; t < count * 160 && made < count; t++) {
    if (!rooms.length) break
    const A = r.pick(rooms), cs = w.roomCells(A); if (!cs.length) continue; const [x, z] = r.pick(cs), d = r.int(0, 3), f = DIRS[d]
    if (w.etype(l, x, z, d) !== E.Wall) continue
    let n = 1; while (n <= 9 && isVoid(w, l, x + f[0] * n, z + f[1] * n) && inR(bounds, x + f[0] * n, z + f[1] * n)) n++
    const ex = x + f[0] * n, ez = z + f[1] * n, B = w.roomAt(l, ex, ez); if (!B || B.id === A.id || n > 9 || B.type === 'cave') continue
    if (w.etype(l, ex, ez, (d + 2) % 4) !== E.Wall) continue; if (dist(A.id, B.id) < 4) continue
    // no door right beside
    const side = DIRS[(d + 1) % 4]; let near = false; for (const k of [-1, 1]) if (isPass2(w, l, x + side[0] * k, z + side[1] * k, d) || isPass2(w, l, ex + side[0] * k, ez + side[1] * k, (d + 2) % 4)) near = true; if (near) continue
    const cells: Cell[] = []; for (let k = 1; k < n; k++) cells.push([x + f[0] * k, z + f[1] * k])
    if (gates.some(g => Math.hypot(g.x - c2w(ex), g.z - c2w(ez)) < 3.4 || Math.hypot(g.x - c2w(x), g.z - c2w(z)) < 3.4)) continue
    const secret = r.chance(.3)
    if (cells.length) { const c = newRoom(w, l, cells, 'corridor', theme, A.depth + 1); fill(w, l, cells, { floor: FL[th.floor], ceil: CEIL.slab, room: c.id }); wallAround(w, l, cells, WS[th.wall]); links.push([A.id, c.id], [c.id, B.id]) } else links.push([A.id, B.id])
    ; for (const [p, q] of [[A.id, B.id], [B.id, A.id]]) (adj.get(p) ?? adj.set(p, []).get(p)!).push(q)
    w.setEdge(l, x, z, d, secret ? E.Secret : E.Door, WS[th.wall]); if (cells.length) w.setEdge(l, ex, ez, (d + 2) % 4, r.chance(.5) ? E.Arch : E.Door, WS[th.wall]); made++
  }
  return made
}
const isPass2 = (w: World, l: number, x: number, z: number, d: number) => { const t = w.etype(l, x, z, d); return isDoor(t) || t === E.Arch }
/** A stair that leaves room A through its wall and comes down into a new landing room below. */
export function stairDown(w: World, r: Rng, l: number, rooms: Room[], theme: ThemeId, thBelow: ThemeId, bounds: Rect): Room | null {
  const th = THEMES[theme], t2 = THEMES[thBelow]
  for (let t = 0; t < 900; t++) {
    const A = r.pick(rooms), cs = w.roomCells(A); if (!cs.length || A.type === 'cave') continue; const [x, z] = r.pick(cs), d = r.int(0, 3), f = DIRS[d], s = DIRS[(d + 1) % 4]
    const bx = x + s[0], bz = z + s[1]; if (w.roomAt(l, bx, bz)?.id !== A.id || w.etype(l, x, z, d) !== E.Wall || w.etype(l, bx, bz, d) !== E.Wall || w.edge(l, x, z, (d + 1) % 4)) continue
    const foot: Cell[] = []; for (let v = 1; v <= 4; v++) for (let u = 0; u < 2; u++) foot.push([x + s[0] * u + f[0] * v, z + s[1] * u + f[1] * v])
    const land: Cell[] = []; for (let v = 5; v <= 8; v++) for (let u = -1; u <= 2; u++) land.push([x + s[0] * u + f[0] * v, z + s[1] * u + f[1] * v])
    if (!foot.every(([a, b]) => inR(bounds, a, b) && isVoid(w, l, a, b) && isVoid(w, l - 1, a, b)) || !land.every(([a, b]) => inR(bounds, a, b) && isVoid(w, l - 1, a, b))) continue
    cutStair(w, l, x, z, d, th.wall, t2.wall, A.id)
    const room = newRoom(w, l - 1, land, 'landing', thBelow, A.depth + 1); fill(w, l - 1, land, { floor: FL[t2.floor], ceil: t2.ceil, room: room.id }); wallAround(w, l - 1, land, WS[t2.wall])
    for (let u = 0; u < 2; u++) { const a = x + s[0] * u + f[0] * 4, b = z + s[1] * u + f[1] * 4; w.setEdge(l - 1, a, b, d, E.None) }
    return room
  }
  return null
}
/** carve the 2x4 shaft: from cell (x,z) going direction d (and lateral d+1), descending away from the room */
export function cutStair(w: World, l: number, x: number, z: number, d: number, wallUp: string, wallDn: string, roomId = 0, openTop = true) {
  const f = DIRS[d], s = DIRS[(d + 1) % 4]; const foot: Cell[] = []; for (let v = 1; v <= 4; v++) for (let u = 0; u < 2; u++) foot.push([x + s[0] * u + f[0] * v, z + s[1] * u + f[1] * v])
  const up = w.lv(l), dn = w.lv(l - 1); const outdoors = !!w.terrain
  for (const [a, b] of foot) { const i = idx(a, b); up.floor[i] = 0; up.flag[i] = FLAG.hole; up.ceil[i] = l >= 0 && outdoors && !up.ceil[i] ? 0 : CEIL.slab; up.room[i] = roomId; dn.floor[i] = FL.flagstone; dn.ceil[i] = 0; dn.flag[i] = 0 }
  wallAround(w, l, foot, WS[wallUp], E.Wall); wallAround(w, l - 1, foot, WS[wallDn], E.Wall)
  if (openTop) for (let u = 0; u < 2; u++) w.setEdge(l, x + s[0] * u, z + s[1] * u, d, E.None)
  // ascent direction is back toward the room: opposite of d. low end is at v=4
  const dir = (d + 2) % 4; const lx = [foot[6], foot[7]]; const minx = Math.min(lx[0][0], lx[1][0]), minz = Math.min(lx[0][1], lx[1][1])
  const st = { id: w.nid++, l: l - 1, dir, kind: 'stone' as const, x: dir === 2 ? minx + 1 : minx, z: dir === 3 ? minz + 1 : minz }
  w.stairs.set(st.id, st); return st
}

/** remove anything solid or wall-hung that ended up in a doorway */
export function clearDoorways(w: World, levels?: number[]) {
  const H = new Map<string, [number, number, number][]>(); const add = (l: number, x: number, z: number, ax: number) => { const k = `${l}|${Math.floor(x / 3)}|${Math.floor(z / 3)}`; (H.get(k) ?? H.set(k, []).get(k)!).push([x, z, ax]) }
  for (const v of w.levels.values()) { if (levels && !levels.includes(v.l)) continue; for (let z = 1; z < N - 1; z++) for (let x = 1; x < N - 1; x++) { const i = idx(x, z); const a = v.eW[i] & 15, b = v.eN[i] & 15; if (isDoor(a) || a === E.Arch) add(v.l, v2w(x), c2w(z), 0); if (isDoor(b) || b === E.Arch) add(v.l, c2w(x), v2w(z), 1) } }
  let n = 0
  for (const p of [...w.props.values()]) { const m = model(p.m); if (!m || m.fit || m.mount === 'ceil' || p.m === 'portcullis') continue; const c = collider(m), wall = m.mount === 'wall'; if (!c && !wall) continue; const cs = Math.cos(p.r), sn = Math.sin(p.r), X = p.x + (c ? (c.ox * cs + c.oz * sn) * p.s : 0), Z = p.z + (c ? (-c.ox * sn + c.oz * cs) * p.s : 0); const R = wall ? .5 : Math.min(c!.k === 'c' ? c!.r : Math.hypot(c!.hx, c!.hz), 3) * p.s
    let hit = false; for (let a = Math.floor((X - R - 1) / 3); a <= Math.floor((X + R + 1) / 3) && !hit; a++) for (let b = Math.floor((Z - R - 1) / 3); b <= Math.floor((Z + R + 1) / 3) && !hit; b++) for (const [x, z, ax] of H.get(`${p.l}|${a}|${b}`) ?? []) {
      if (wall) { const al = ax ? Math.abs(p.x - x) : Math.abs(p.z - z), ac = ax ? Math.abs(p.z - z) : Math.abs(p.x - x); if (al < .72 && ac < .6) { hit = true; break } continue }
      for (const [u, t] of [[0, 0], [0, .7], [0, -.7], [.4, 0], [-.4, 0]]) { const px = x + (ax ? u : t), pz = z + (ax ? t : u); const dx = px - X, dz = pz - Z; if (c!.k === 'c') { if (Math.hypot(dx, dz) < c!.r * p.s + .3) { hit = true; break } } else { const q = dx * cs - dz * sn, k = dx * sn + dz * cs; if (Math.abs(q) < c!.hx * p.s + .28 && Math.abs(k) < c!.hz * p.s + .28) { hit = true; break } } } }
    if (hit) { w.props.delete(p.id); n++ } }
  return n
}
