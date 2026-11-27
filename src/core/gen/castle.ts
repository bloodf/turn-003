import { World, idx, type Room } from '../world'
import { E, FL, WS, CEIL, FLAG, DIRS, CELL, c2w, v2w, N, THEMES, type ThemeId } from '../defs'
import type { Rng } from '../rng'
import { fill, rectCells, wallAround, newRoom, setPair, cutStair, grow, loops, type Cell } from './build'
import { furnish } from './furnish'
import { assignTypes, pools } from './dungeon'
import { house, tower } from './houses'
import type { Land } from './land'
export interface CastleOpts { size: number; style: string; moat: boolean; under: number; theme: ThemeId; roofs: 'cone' | 'battlement' }
/** split a rect into rooms, linked by doors */
export function bsp(w: World, r: Rng, l: number, x0: number, z0: number, x1: number, z1: number, theme: ThemeId, style: number, floor: string, ceil: number, types: string[], skip: (x: number, z: number) => boolean, min = 4): Room[] {
  const leaves: [number, number, number, number][] = []; const walls: { x0: number; z0: number; x1: number; z1: number; d: number }[] = []
  const split = (a: number, b: number, c: number, d: number, k: number) => {
    const W = c - a + 1, D = d - b + 1; const canX = W >= min * 2, canZ = D >= min * 2
    if ((!canX && !canZ) || (k > 1 && W * D < 46 && r.chance(.55)) || k > 4) { leaves.push([a, b, c, d]); return }
    if (canX && (!canZ || W > D * 1.15 || (W >= D * .85 && r.chance(.5)))) { const m = r.int(a + min, c - min + 1); walls.push({ x0: m, z0: b, x1: m, z1: d, d: 2 }); split(a, b, m - 1, d, k + 1); split(m, b, c, d, k + 1) }
    else { const m = r.int(b + min, d - min + 1); walls.push({ x0: a, z0: m, x1: c, z1: m, d: 3 }); split(a, b, c, m - 1, k + 1); split(a, m, c, d, k + 1) }
  }
  split(x0, z0, x1, z1, 0); const rooms: Room[] = []; const q = [...types]
  for (const [a, b, c, d] of leaves.sort((p, s) => (s[2] - s[0]) * (s[3] - s[1]) - (p[2] - p[0]) * (p[3] - p[1]))) { const cs = rectCells(a, b, c, d).filter(([x, z]) => !skip(x, z)); if (!cs.length) continue; const room = newRoom(w, l, cs, q.shift() ?? r.pick(['bedroom', 'storage', 'guard', 'room']), theme); fill(w, l, cs, { floor: FL[floor], ceil, room: room.id }); rooms.push(room) }
  for (const W of walls) for (let z = W.z0; z <= W.z1; z++) for (let x = W.x0; x <= W.x1; x++) if (!skip(x, z) || !skip(x + DIRS[W.d][0], z + DIRS[W.d][1])) w.setEdge(l, x, z, W.d, E.Wall, style)
  return rooms
}
/** make sure every room in a set can reach the others by punching doors in shared walls */
export function connect(w: World, r: Rng, l: number, rooms: Room[], style: number, hub?: (x: number, z: number) => boolean) {
  const owner = new Map<number, number>(); rooms.forEach((q, i) => w.roomCells(q).forEach(([x, z]) => owner.set(idx(x, z), i))); const HUB = rooms.length
  const of = (x: number, z: number) => owner.get(idx(x, z)) ?? (hub?.(x, z) ? HUB : -1)
  const par = [...Array(rooms.length + 1).keys()]; const find = (a: number): number => par[a] === a ? a : (par[a] = find(par[a])); const cand: [number, number, number, number, number][] = []
  const all: Cell[] = []; for (const q of rooms) all.push(...w.roomCells(q))
  for (const [x, z] of all) for (let d = 0; d < 4; d++) { const a = of(x, z), b = of(x + DIRS[d][0], z + DIRS[d][1]); if (b < 0 || a === b) continue; const t = w.etype(l, x, z, d); if (t === E.None) par[find(a)] = find(b); else if (t === E.Wall) cand.push([x, z, d, a, b]) }
  r.shuffle(cand); let extra = 0
  for (const [x, z, d, a, b] of cand) { const s = DIRS[(d + 1) % 4]; const corner = w.edge(l, x, z, (d + 1) % 4) || w.edge(l, x, z, (d + 3) % 4); if (find(a) === find(b)) { if (extra < rooms.length * .25 && !corner && r.chance(.02)) { extra++; w.setEdge(l, x, z, d, E.Door, style) } continue } if (corner && cand.some(c => ((c[3] === a && c[4] === b) || (c[3] === b && c[4] === a)) && !(w.edge(l, c[0], c[1], (c[2] + 1) % 4) || w.edge(l, c[0], c[1], (c[2] + 3) % 4)))) continue; void s; w.setEdge(l, x, z, d, r.chance(.25) ? E.Arch : E.Door, style); par[find(a)] = find(b) }
}
export function castle(w: World, r: Rng, land: Land, cx: number, cz: number, o: CastleOpts) {
  const hx = o.size, hz = Math.round(o.size * .9), x0 = cx - hx, x1 = cx + hx - 1, z0 = cz - hz, z1 = cz + hz - 1, st = WS[o.style], th = o.theme
  const cobble: Cell[] = []
  // ---- curtain wall: two cells thick, walkway on top
  const L0 = w.lv(0), L1 = w.lv(1); const strip: Cell[] = []
  for (let z = z0 - 2; z <= z1 + 2; z++) for (let x = x0 - 2; x <= x1 + 2; x++) if (x < x0 || x > x1 || z < z0 || z > z1) strip.push([x, z])
  const gate = (x: number, z: number) => z > z1 && (x === cx - 1 || x === cx)
  for (const [x, z] of strip) { const i = idx(x, z); if (gate(x, z)) { L0.floor[i] = FL.cobble; L0.flag[i] = 0; L0.ceil[i] = CEIL.slab } else { L0.floor[i] = 0; L0.flag[i] = FLAG.solid; L0.ceil[i] = 0 } L1.floor[i] = FL.flagstone; L1.ceil[i] = 0 }
  for (const [x, z] of strip) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; const ns = nx < x0 || nx > x1 || nz < z0 || nz > z1, inS = ns && nx >= x0 - 2 && nx <= x1 + 2 && nz >= z0 - 2 && nz <= z1 + 2; if (inS) { if (gate(x, z) !== gate(nx, nz)) w.setEdge(0, x, z, d, E.Wall, st); continue } if (!gate(x, z)) w.setEdge(0, x, z, d, E.Wall, st); w.setEdge(1, x, z, d, ns ? E.Merlon : E.Rail, st) }
  setPair(w, 0, cx - 1, z1 + 2, 1, 1, 0, st)
  w.addProp('portcullis', c2w(cx - 1) + .75, 2.6, v2w(z1 + 1) + .4, 0, 0)
  for (const q of [-1, 1]) w.addProp('torch_wall', c2w(cx - 1) + .75 + q * 1.26, 0, v2w(z1 + 2), q > 0 ? -Math.PI / 2 : Math.PI / 2, 0)
  // ---- towers
  const clearT = (vx: number, vz: number, R: number) => { for (const l of [0, 1]) { const v = w.lv(l); for (let z = vz - 4; z < vz + 4; z++) for (let x = vx - 4; x < vx + 4; x++) { if (Math.hypot(c2w(x) - v2w(vx), c2w(z) - v2w(vz)) < R) { const i = idx(x, z); for (let d = 0; d < 4; d++) w.setEdge(l, x, z, d, 0); v.flag[i] = 0; v.floor[i] = l === 0 ? 1 : 0 } } } }
  const Tt: [number, number, number, number, number][] = [[x0 - 1, z0 - 1, 3.7, 0.785, 2], [x1 + 2, z0 - 1, 3.7, 2.356, 2], [x1 + 2, z1 + 2, 3.7, -2.356, 2], [x0 - 1, z1 + 2, 3.7, -0.785, 2]]
  Tt.forEach(([vx, vz, R, a, top], k) => {
    clearT(vx, vz, R + .45); const open = [{ l: 0, a, w: 1.3, k: 'door' as const }]; const sx = vx < cx ? 0 : Math.PI, sz = vz < cz ? Math.PI / 2 : -Math.PI / 2
    tower(w, r, { x: v2w(vx), z: v2w(vz), r: R, t: .8, l1: top + (k === 0 ? 1 : 0), style: o.style, top: o.roofs === 'cone' && k % 2 === 0 ? 'cone' : o.roofs, open: [...open, { l: 1, a: sx, w: 1.5, k: 'door' }, { l: 1, a: sz, w: 1.5, k: 'door' }], theme: th })
  })
  for (const s of [-1, 1]) { const vx = cx + s * 4, vz = z1 + 2; clearT(vx, vz, 3.2 + .45); tower(w, r, { x: v2w(vx), z: v2w(vz), r: 3.2, t: .75, l1: 2, style: o.style, top: 'battlement', open: [{ l: 0, a: -Math.PI / 2, w: 1.3, k: 'door' }, { l: 1, a: 0, w: 1.5, k: 'door' }, { l: 1, a: Math.PI, w: 1.5, k: 'door' }], theme: th }) }
  for (const [x, z] of strip) for (const l of [0, 1]) { const v = w.lv(l), i = idx(x, z); if (!(v.flag[i] & FLAG.virt)) continue; for (let d = 0; d < 4; d++) { const t = w.etype(l, x, z, d); if (t === E.Merlon || t === E.Rail || t === E.Wall) w.setEdge(l, x, z, d, 0) } }
  // ---- keep
  const kw = Math.max(8, Math.round(hx * .42)), kd = Math.max(8, Math.round(hz * .42)); const kx0 = cx - kw, kx1 = cx + kw - 1, kz0 = z0 + 3, kz1 = kz0 + kd * 2 - 1, floors = 3
  const keepCells = rectCells(kx0, kz0, kx1, kz1); const sx = kx0, sz = kz0 + Math.max(0, Math.floor(kd - 4)); const inHall = (x: number, z: number) => x >= sx && x <= sx + 3 && z >= sz && z <= sz + 7
  const keepTypes = [['hall', 'kitchen', 'guard', 'storage', 'armory', 'dining'], ['library', 'dining', 'chapel', 'bedroom', 'armory', 'barracks'], ['throne', 'bedroom', 'study', 'treasury', 'bedroom', 'alchemy']]
  for (let l = 0; l < floors; l++) {
    fill(w, l, keepCells, { floor: FL[l ? 'planks' : 'flagstone'], ceil: l < floors - 1 ? CEIL.beams : CEIL.beams }); wallAround(w, l, keepCells, st, E.Wall, true)
    const hall = rectCells(sx, sz, sx + 3, sz + 7); const hr = newRoom(w, l, hall, 'landing', th); hr.name = 'Stair Hall'; fill(w, l, hall, { floor: FL[l ? 'planks' : 'flagstone'], ceil: CEIL.beams, room: hr.id }); wallAround(w, l, hall, st)
    const rooms = bsp(w, r, l, kx0, kz0, kx1, kz1, th, st, l ? 'planks' : 'flagstone', CEIL.beams, keepTypes[l], inHall, 5)
    ; (w as any)._keep = (w as any)._keep ?? []; (w as any)._keep.push([l, rooms, hr])
  }
  const roofCells = keepCells; fill(w, floors, roofCells, { floor: FL.flagstone, ceil: 0 }); wallAround(w, floors, roofCells, st, E.Merlon, true)
  const laneA = (l: number) => ({ id: w.nid++, l, dir: 1, kind: 'stone' as const, x: sx, z: sz + 1 }), laneB = (l: number) => ({ id: w.nid++, l, dir: 3, kind: 'stone' as const, x: sx + 2, z: sz + 7 })
  const addStair = (s: any) => { w.stairs.set(s.id, s); const foot = World.stairCells(s), U = w.lv(s.l + 1), D = w.lv(s.l), set = new Set(foot.map(c => idx(c[0], c[1]))); for (const [x, z] of foot) { const i = idx(x, z); U.floor[i] = 0; U.flag[i] = FLAG.hole; D.ceil[i] = 0; if (!D.floor[i]) D.floor[i] = FL.flagstone } for (const [x, z, i] of foot) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (set.has(idx(nx, nz)) || w.edge(s.l + 1, x, z, d)) continue; if (d === s.dir && i === 3) continue; w.setEdge(s.l + 1, x, z, d, E.Rail, 1) } }
  addStair(laneA(0)); addStair(laneB(1)); addStair(laneA(2))
  // roof hut over the last stair is open: it comes out on the leads
  // gate into the keep
  const gx = cx - 1; w.setEdge(0, gx, kz1, 1, E.Wall, st); setPair(w, 0, gx, kz1, 1, 1, 0, st)
  let under: Room[] = []
  if (o.under > 0) {
    const s = laneB(-1); addStair(s); const D = w.lv(-1); const t2 = THEMES[th]; void D
    for (const [x, z] of World.stairCells(s)) { w.lv(-1).floor[idx(x, z)] = FL.flagstone; w.lv(-1).ceil[idx(x, z)] = 0 } const foot = World.stairCells(s).map(c => [c[0], c[1]] as Cell); wallAround(w, -1, foot, WS[t2.wall])
    const land: Cell[] = rectCells(sx + 1, sz + 7, sx + 4, sz + 10); const q = newRoom(w, -1, land, 'landing', th); fill(w, -1, land, { floor: FL[t2.floor], ceil: t2.ceil, room: q.id }); wallAround(w, -1, land, WS[t2.wall]); for (let u = 0; u < 2; u++) w.setEdge(-1, sx + 2 + u, sz + 6, 1, E.None)
    const B = { x0: x0 + 1, z0: z0 + 1, x1: x1 - 1, z1: z1 - 1 }; const g = grow(w, r, { l: -1, theme: th, bounds: B, rooms: o.under, caveMix: .08, seedRooms: [q] }); loops(w, r, -1, th, Math.round(o.under * .2), g.links, B); under = assignTypes(w, r, g.rooms, th, true); pools(w, r, under, .12); under.push(q)
  }
  for (const [l, rooms, hr] of (w as any)._keep as [number, Room[], Room][]) { connect(w, r, l, rooms, st, (x, z) => inHall(x, z) && (l === 1 ? z === sz + 7 || (z >= sz + 5 && x < sx + 2) : z === sz || (z <= sz + 2 && x >= sx + 2))); for (const [x, z] of keepCells) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (nx >= kx0 && nx <= kx1 && nz >= kz0 && nz <= kz1) continue; if (w.etype(l, x, z, d) !== E.Wall) continue; const s = DIRS[(d + 1) % 4]; if (w.edge(l, x, z, (d + 1) % 4) || w.edge(l, x, z, (d + 3) % 4)) continue; if (w.etype(l, x - s[0], z - s[1], d) === E.Window || w.etype(l, x + s[0], z + s[1], d) === E.Window) continue; if (r.chance(l ? .35 : .14)) w.setEdge(l, x, z, d, l ? E.Window : E.Slit, st) } const big = rooms[0]; if (l === 0 && big) { /* hall holds the gate */ } for (const q of rooms) furnish(w, q, r); furnish(w, hr, r) } delete (w as any)._keep
  for (const [sxx, szz] of [[kx0, kz0], [kx1, kz0], [kx0, kz1], [kx1, kz1]] as Cell[]) w.addProp('brazier', c2w(sxx) , floors * 4, c2w(szz), 0, floors)
  for (const q of under) furnish(w, q, r); for (const q of [...w.rooms.values()]) if (q.l === -1 && q.type === 'corridor') furnish(w, q, r)
  // ---- bailey
  land.use(x0 - 2, z0 - 2, x1 + 2, z1 + 2, 4)
  const free = new Uint8Array(N * N); const blockR = (a: number, b: number, c: number, d: number) => { for (let z = b; z <= d; z++) for (let x = a; x <= c; x++) free[idx(x, z)] = 1 }; blockR(kx0 - 2, kz0 - 2, kx1 + 2, kz1 + 3); blockR(cx - 3, kz1, cx + 2, z1); for (const [vx, vz] of Tt) blockR(vx - 5, vz - 5, vx + 5, vz + 5); blockR(cx - 8, z1 - 3, cx + 8, z1)
  const B: [string, number, number, string, any][] = [['stable', 8, 5, 'planks', { roof: 'thatch' }], ['smithy', 6, 5, 'stone_wall', { roof: 'shingle', gate: true }], ['barracks', 9, 5, 'stone_wall', { roof: 'clay' }], ['chapel', 6, 9, 'ashlar', { roof: 'slate', tall: true, gate: true, floor: 'flagstone' }], ['storage', 6, 5, 'planks', { roof: 'shingle' }], ['cottage', 6, 5, 'timber', {}]]
  for (const [type, a, b, style, ex] of B) {
    let ok = false
    for (let t = 0; t < 120 && !ok; t++) { const rot = r.chance(.5), W = rot ? b : a, D = rot ? a : b; const edge = r.int(0, 2); const px = edge === 0 ? x0 + 1 : edge === 1 ? x1 - W : r.int(x0 + 1, x1 - W), pz = edge === 2 ? z1 - D - 1 : r.int(z0 + 1, z1 - D - 1); if (px < x0 + 1 || pz < z0 + 1 || px + W - 1 > x1 - 1 || pz + D - 1 > z1 - 1) continue; let f = true; for (let z = pz - 1; z <= pz + D && f; z++) for (let x = px - 1; x <= px + W; x++) if (free[idx(x, z)]) { f = false; break } if (!f) continue
      const door = edge === 0 ? 0 : edge === 1 ? 2 : 3; house(w, r, { type, x0: px, z0: pz, x1: px + W - 1, z1: pz + D - 1, door, style, theme: th, ...ex }); blockR(px - 1, pz - 1, px + W, pz + D); ok = true; blockR(px - 2, pz - 2, px + W + 1, pz + D + 1) }
  }
  // road from gate to keep, yard props
  for (let z = kz1 + 1; z <= z1; z++) for (let x = cx - 2; x <= cx + 1; x++) { if (w.floorAt(0, x, z) === 1) { L0.floor[idx(x, z)] = FL.cobble; cobble.push([x, z]) } }
  const yard = (m: string, n: number, s: [number, number] = [1, 1]) => { for (let t = 0, k = 0; t < n * 40 && k < n; t++) { const x = r.int(x0 + 1, x1 - 1), z = r.int(z0 + 1, z1 - 1); if (free[idx(x, z)] || w.floorAt(0, x, z) !== 1) continue; w.addProp(m, c2w(x), 0, c2w(z), r.int(0, 3) * Math.PI / 2 + r.range(-.2, .2), 0, r.range(...s)); blockR(x - 1, z - 1, x + 1, z + 1); k++ } }
  yard('well', 1); yard('cart', 1); yard('hay_cart', 1); yard('hay_bale', 4); yard('crates', 3); yard('barrel_stack', 3); yard('woodpile', 2); yard('weapon_rack', 2); yard('armor_stand', 3); yard('scarecrow', 3); yard('lantern_post', 5); yard('tent_red', 1); yard('trough', 2); yard('stocks', 1); yard('brazier', 4); yard('stall_red', 1); yard('stall_blue', 1); yard('oak', 2, [.7, .9])
  for (let k = 0; k < 10; k++) { const x = r.int(x0, x1); w.addProp('brazier', c2w(x), 4, c2w(r.chance(.5) ? z0 - 1 : z1 + 1), 0, 1, .8) }
  if (o.moat) { land.moat(x0 - 2, z0 - 2, x1 + 3, z1 + 3, 4.2, 10.5); const cells: [number, number][] = []; for (let z = z1 + 3; z <= z1 + 15; z++) for (const x of [cx - 1, cx]) cells.push([x, z]); land.bridge(cells); for (const [x, z] of cells) { w.setEdge(0, x, z, x === cx ? 0 : 2, E.Rail, 1) } for (const z of [z1 + 4, z1 + 14]) for (const s of [-2.1, 2.1]) w.addProp('lantern_post', c2w(cx - 1) + .75 + s, 0, c2w(z), s > 0 ? Math.PI : 0, 0) }
  w.spawn = { x: c2w(cx - 1) + .75, y: 0, z: c2w(Math.min(N - 6, z1 + (o.moat ? 19 : 10))), yaw: Math.PI }
  return { x0, z0, x1, z1, under }
}
void CELL
