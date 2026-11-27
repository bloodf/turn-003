import { World, idx } from '../world'
import { FL, E, DIRS, WS, c2w, v2w, N, THEMES, type ThemeId } from '../defs'
import type { Rng } from '../rng'
import { fill, rectCells, newRoom, wallAround, cutStair, type Cell, grow, loops } from './build'
import { assignTypes, pools } from './dungeon'
import { furnish } from './furnish'
import { house, tower } from './houses'
import type { Land } from './land'
export function village(w: World, r: Rng, land: Land, cx: number, cz: number, o: { size: number; palisade: boolean }) {
  const R = o.size; const S = 6; land.use(cx - S, cz - S, cx + S, cz + S, 1)
  const sq = rectCells(cx - S + 1, cz - S + 1, cx + S - 2, cz + S - 2).filter(([x, z]) => Math.hypot(x + .5 - cx, z + .5 - cz) < S - .3); fill(w, 0, sq, { floor: FL.cobble, ceil: 0 })
  const roads: [number, number][][] = [[[cx - R - 8, cz + r.int(-4, 4)], [cx - S, cz], [cx + S, cz], [cx + R + 8, cz + r.int(-4, 4)]], [[cx + r.int(-3, 3), cz - R - 2], [cx, cz - S], [cx, cz + S], [cx + r.int(-3, 3), cz + R + 8]]]
  const pts: [number, number, number, number][] = []
  for (const rd of roads) { const P = land.road(rd, 1.9, .6); for (let i = 2; i < P.length - 2; i += 2) { const dx = P[i + 2][0] - P[i - 2][0], dz = P[i + 2][1] - P[i - 2][1], L = Math.hypot(dx, dz) || 1; if (Math.hypot(P[i][0] - cx, P[i][1] - cz) < R) pts.push([P[i][0], P[i][1], dx / L, dz / L]) } }
  const B: [string, number, number, any][] = [
    ['tavern', 11, 8, { floors: 2, upper: 'bedroom', roof: 'clay', sign: 'sign_tavern' }], ['chapel', 7, 12, { style: 'ashlar', tall: true, roof: 'slate', gate: true, floor: 'flagstone' }], ['smithy', 7, 6, { style: 'stone_wall', roof: 'shingle', gate: true, sign: 'sign_smith', floor: 'flagstone' }], ['shop', 7, 6, { sign: 'sign_shop', floors: 2, upper: 'bedroom', roof: 'clay' }], ['study', 7, 7, { sign: 'sign_magic', floors: 2, upper: 'alchemy', roof: 'slate' }], ['stable', 9, 6, { style: 'planks', roof: 'thatch', gate: true, floor: 'straw' }], ['shop', 6, 6, { sign: 'sign_shop' }], ['storage', 7, 6, { style: 'planks', roof: 'shingle' }]]
  const n = Math.round(R * .55); for (let i = 0; i < n; i++) B.push(['cottage', r.int(5, 7), r.int(4, 6), r.chance(.25) ? { floors: 2, upper: 'bedroom', w: 8 } : {}])
  let built = 0
  for (const [type, a0, b0, ex] of B) {
    for (let t = 0; t < 160; t++) {
      const p = r.pick(pts), side = r.chance(.5) ? 1 : -1; const nx = -p[3] * side, nz = p[2] * side; const alongX = Math.abs(p[2]) > Math.abs(p[3]); const a = ex.w ?? a0; const W = alongX ? a : b0, D = alongX ? b0 : a; const off = 3 + (alongX ? D : W) / 2; const px = Math.round(p[0] + nx * off - W / 2), pz = Math.round(p[1] + nz * off - D / 2)
      if (!land.free(px - 1, pz - 1, px + W, pz + D)) continue; if (Math.hypot(px + W / 2 - cx, pz + D / 2 - cz) > R + 2) continue
      const door = alongX ? (nz > 0 ? 3 : 1) : (nx > 0 ? 2 : 0); house(w, r, { type, x0: px, z0: pz, x1: px + W - 1, z1: pz + D - 1, door, ...ex, w: undefined } as any); land.use(px - 1, pz - 1, px + W, pz + D, 2); built++
      // garden
      if (type === 'cottage') { const back = (door + 2) % 4, f = DIRS[back]; const gx0 = f[0] ? (f[0] > 0 ? px + W + 1 : px - 5) : px, gz0 = f[1] ? (f[1] > 0 ? pz + D + 1 : pz - 5) : pz, gx1 = f[0] ? gx0 + 3 : px + W - 1, gz1 = f[1] ? gz0 + 3 : pz + D - 1; if (land.free(gx0, gz0, gx1, gz1)) { land.use(gx0, gz0, gx1, gz1, 2); for (let x = gx0; x <= gx1; x++) for (const [z, d] of [[gz0, 3], [gz1, 1]]) if (!w.edge(0, x, z, d) && r.chance(.85)) w.setEdge(0, x, z, d, E.Fence, 0); for (let z = gz0; z <= gz1; z++) for (const [x, d] of [[gx0, 2], [gx1, 0]]) if (!w.edge(0, x, z, d) && r.chance(.85)) w.setEdge(0, x, z, d, E.Fence, 0); for (let k = 0; k < 3; k++) w.addProp(r.pick(['hay_bale', 'scarecrow', 'bush_flower', 'bush', 'woodpile', 'barrel', 'haystack']), c2w(r.int(gx0, gx1)), 0, c2w(r.int(gz0, gz1)), r() * 6, 0, r.range(.7, .95)) } }
      break
    }
  }
  // square
  w.addProp(r.chance(.5) ? 'well' : 'fountain', v2w(cx), 0, v2w(cz), 0, 0); ['stall_red', 'stall_blue', 'stall_green', 'stall_red'].forEach((m, i) => { const a = i * Math.PI / 2 + .78; w.addProp(m, v2w(cx) + Math.cos(a) * 5.4, 0, v2w(cz) + Math.sin(a) * 5.4, Math.atan2(-Math.cos(a), -Math.sin(a)), 0) })
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + .2; w.addProp('lantern_post', v2w(cx) + Math.cos(a) * 7.6, 0, v2w(cz) + Math.sin(a) * 7.6, r() * 6, 0) } w.addProp('signpost', v2w(cx) + 3.2, 0, v2w(cz) - 6.4, 0, 0); w.addProp('cart', v2w(cx) - 6, 0, v2w(cz) + 3.4, 1, 0); w.addProp('crates', v2w(cx) + 6.4, 0, v2w(cz) + 2.6, .4, 0)
  for (let i = 8; i < pts.length; i += 9) { const p = pts[i], s = i % 2 ? 1 : -1, x = p[0] - p[3] * s * 2.6, z = p[1] + p[2] * s * 2.6; const gx = Math.floor(x), gz = Math.floor(z); if (w.floorAt(0, gx, gz) === 1 && !w.roomAt(0, gx, gz)) { w.addProp(r.pick(['lantern_post', 'lantern_post', 'barrel', 'hay_bale', 'woodpile', 'trough']), v2w(0) + x * 1.5, 0, v2w(0) + z * 1.5, Math.atan2(p[3] * s, -p[2] * s), 0); land.use(gx, gz, gx, gz, 2) } }
  // graveyard
  for (let t = 0; t < 60; t++) { const x = cx + r.int(-R, R - 10), z = cz + r.int(-R, R - 8); if (!land.free(x, z, x + 9, z + 7)) continue; land.use(x, z, x + 9, z + 7, 2); for (let i = 0; i < 10; i++) for (const [q, d] of [[z, 3], [z + 7, 1]]) if (!(d === 1 && (i === 4 || i === 5))) w.setEdge(0, x + i, q, d, E.Fence, 2); for (let i = 0; i < 8; i++) for (const [q, d] of [[x, 2], [x + 9, 0]]) w.setEdge(0, q, z + i, d, E.Fence, 2); for (let a = 1; a < 9; a += 2) for (let b = 1; b < 7; b += 2) if (r.chance(.8)) w.addProp('gravestone_' + r.int(0, 2), c2w(x + a), 0, c2w(z + b), r.range(-.1, .1), 0); w.addProp('crypt_small', c2w(x + 7) + .2, 0, c2w(z + 2), 0, 0, .9); w.addProp('tree_dead', c2w(x + 1), 0, c2w(z + 6), 0, 0, .8); break }
  w.spawn = { x: v2w(cx), y: 0, z: v2w(cz + S + 4), yaw: Math.PI }
  return built
}
/** a small stone house whose only room holds a stair into a dungeon */
export function entranceHut(w: World, r: Rng, land: Land, x: number, z: number, style: string, theme: ThemeId, rooms: number, levels: number, area: { x0: number; z0: number; x1: number; z1: number }, caves = .2) {
  const t = THEMES[theme]; const q = house(w, r, { type: 'entrance', x0: x, z0: z, x1: x + 4, z1: z + 4, door: 1, style, roof: 'slate', floor: 'flagstone', theme, gate: true })
  const rf = [...w.roofs.values()].pop()!; w.roofs.set(rf.id, { ...rf, z0: z - 4, axis: 1 })
  for (const p of [...w.props.values()]) if (p.l === 0 && Math.abs(p.x - c2w(x + 2)) < 2.2 && p.z < c2w(z + 1) && p.z > c2w(z) - 1) w.props.delete(p.id)
  cutStair(w, 0, x + 1, z, 3, style, t.wall, q.id); land.use(x - 1, z - 5, x + 5, z + 6, 2)
  // cutStair's lateral runs d+1: for d=3 that is +x
  const foot = [...w.stairs.values()].pop()!; const fc = World.stairCells(foot); const minx = Math.min(...fc.map(c => c[0])), minz = Math.min(...fc.map(c => c[1])); for (const [a, b] of fc) w.lv(0).ceil[idx(a, b)] = 2
  const landC: Cell[] = rectCells(minx - 1, minz - 4, minx + 2, minz - 1); const lr = newRoom(w, -1, landC, 'landing', theme); fill(w, -1, landC, { floor: FL[t.floor], ceil: t.ceil, room: lr.id }); wallAround(w, -1, landC, WS[t.wall]); for (let u = 0; u < 2; u++) w.setEdge(-1, minx + u, minz, 3, E.None)
  let seeds = [lr]
  for (let i = 0; i < levels; i++) { const g = grow(w, r, { l: -1 - i, theme, bounds: area, rooms: Math.ceil(rooms / levels), caveMix: caves, seedRooms: seeds }); loops(w, r, -1 - i, theme, Math.round(g.rooms.length * .2), g.links, area); const ty = assignTypes(w, r, g.rooms, theme, i === levels - 1); pools(w, r, ty); let nx: any[] = []; if (i < levels - 1) { const { stairDown } = stairs; const s = stairDown(w, r, -1 - i, [...ty].sort((a, b) => b.depth - a.depth).slice(0, 8), theme, theme, area); if (s) nx = [s] } seeds = nx; if (!nx.length) break }
  for (const k of [...w.rooms.values()]) if (k.l < 0 && !(k as any).done) { const has = [...w.props.values()].some(p => p.l === k.l && w.roomAt(k.l, Math.floor(p.x / 1.5 + 96), Math.floor(p.z / 1.5 + 96))?.id === k.id); if (!has) furnish(w, k, r) }
  return q
}
import * as stairs from './build'
export function wizardTower(w: World, r: Rng, land: Land, cx: number, cz: number, h: number, style = 'ashlar') { land.use(cx - 5, cz - 5, cx + 5, cz + 5, 2); tower(w, r, { x: v2w(cx), z: v2w(cz), r: 5, t: .9, l1: h, style, top: 'cone', roof: 'slate', open: [{ l: 0, a: Math.PI / 2, w: 1.4, k: 'door' }] }); const kinds = [['barrel', 'crates', 'sacks'], ['bookshelf', 'lectern', 'books_pile'], ['alchemy_table', 'cauldron', 'crystal_ball'], ['bed', 'chest', 'wardrobe'], ['crystal_ball', 'candelabra', 'lectern']]; for (let l = 0; l <= h; l++) { const k = kinds[Math.min(l, 4)]; k.forEach((m, i) => { const a = 2.3 + i * 1.15; w.addProp(m, v2w(cx) + Math.cos(a) * 3.75, l * 4, v2w(cz) + Math.sin(a) * 3.75, Math.atan2(-Math.cos(a), -Math.sin(a)), l, .9) }) } }
void N
