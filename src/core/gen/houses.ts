import { World, idx, type Room } from '../world'
import { E, FL, WS, CEIL, FLAG, DIRS, CELL, HALF, c2w, v2w, yawOf, THEMES, type ThemeId } from '../defs'
import type { Rng } from '../rng'
import { fill, rectCells, wallAround, newRoom, type Cell, setPair, cutStair } from './build'
import { furnish } from './furnish'
export interface HouseOpts { type: string; x0: number; z0: number; x1: number; z1: number; door: number; style?: string; upper?: string | null; floor?: string; roof?: string; roofKind?: 'gable' | 'hip' | 'pyramid'; floors?: number; theme?: ThemeId; gate?: boolean; sign?: string; tall?: boolean }
/** a building with doors, windows, furnished interior and a roof */
export function house(w: World, r: Rng, o: HouseOpts): Room {
  const { x0, z0, x1, z1 } = o, style = WS[o.style ?? 'timber'], cells = rectCells(x0, z0, x1, z1), theme = o.theme ?? 'stone'; const floors = o.floors ?? 1, W = x1 - x0 + 1, D = z1 - z0 + 1
  const q = newRoom(w, 0, cells, o.type, theme); fill(w, 0, cells, { floor: FL[o.floor ?? 'planks'], ceil: o.tall ? 0 : CEIL.beams, room: q.id }); wallAround(w, 0, cells, style, E.Wall, true)
  const f = DIRS[o.door]; const side: Cell[] = cells.filter(([x, z]) => !cells.some(c => c[0] === x + f[0] && c[1] === z + f[1])); const mid = side[Math.floor((side.length - 1) / 2)]
  if (o.gate && side.length >= 4) { const s: Cell = f[0] ? [0, 1] : [1, 0]; setPair(w, 0, mid[0], mid[1], o.door, s[0], s[1], style) } else w.setEdge(0, mid[0], mid[1], o.door, E.Door, style)
  const win = (l: number, cs: Cell[], chance: number) => { for (const [x, z] of cs) for (let d = 0; d < 4; d++) { if (cs.some(c => c[0] === x + DIRS[d][0] && c[1] === z + DIRS[d][1])) continue; if (w.etype(l, x, z, d) !== E.Wall) continue; const s = DIRS[(d + 1) % 4]; const a = w.etype(l, x + s[0], z + s[1], d), b = w.etype(l, x - s[0], z - s[1], d); const inC = (p: number, q: number) => cs.some(c => c[0] === p && c[1] === q); if (a !== E.Wall || b !== E.Wall || !inC(x + s[0], z + s[1]) || !inC(x - s[0], z - s[1])) continue; if (r.chance(chance)) w.setEdge(l, x, z, d, E.Window, style) } }
  let topL = 0; const rooms: Room[] = [q]
  if (o.tall) { const lv = w.lv(1); for (const [x, z] of cells) { const i = idx(x, z); lv.floor[i] = 0; lv.flag[i] = FLAG.hole; lv.ceil[i] = CEIL.beams; lv.room[i] = q.id } wallAround(w, 1, cells, style, E.Wall, true); topL = 1; win(1, cells, .5) }
  else for (let k = 1; k < floors; k++) {
    const up = newRoom(w, k, cells, o.upper ?? 'bedroom', theme); fill(w, k, cells, { floor: FL.planks, ceil: CEIL.beams, room: up.id }); wallAround(w, k, cells, WS.timber, E.Wall, true); rooms.push(up); topL = k
    // stair along the wall opposite the door
    const placeStair = () => {
      const opp = (o.door + 2) % 4, along = W >= D; void opp
      if (along && W >= 7) { const z = o.door === 1 ? z0 : z1 - 1, sx = x0 + (k % 2 ? 1 : 1); const st = { id: w.nid++, l: k - 1, dir: 0, kind: 'wood' as const, x: sx, z }; return st }
      if (D >= 7) { const x = o.door === 0 ? x0 : x1 - 1; return { id: w.nid++, l: k - 1, dir: 1, kind: 'wood' as const, x, z: z0 + 1 } } return null
    }
    const st = placeStair()
    if (st) { w.stairs.set(st.id, st); const foot = World.stairCells(st); const U = w.lv(k), Dn = w.lv(k - 1); const set = new Set(foot.map(c => idx(c[0], c[1]))); for (const [x, z] of foot) { const i = idx(x, z); U.floor[i] = 0; U.flag[i] = FLAG.hole; Dn.ceil[i] = 0 } for (const [x, z, i] of foot) for (let d = 0; d < 4; d++) { const a = x + DIRS[d][0], b = z + DIRS[d][1]; if (set.has(idx(a, b)) || w.edge(k, x, z, d)) continue; if (d === st.dir && i === 3) continue; w.setEdge(k, x, z, d, E.Rail, 1) } }
    win(k, cells, .5)
  }
  win(0, cells, .42)
  const axis: 0 | 1 = W >= D ? 0 : 1; const rf = { id: w.nid++, x0, z0, x1, z1, l: topL, y: (topL + 1) * 4, axis, pitch: o.roof === 'slate' ? 1.0 : .85, mat: o.roof ?? r.pick(['thatch', 'thatch', 'shingle', 'clay']), kind: o.roofKind ?? 'gable' as const, gable: (floors > 1 && !o.tall) || (o.style ?? 'timber') === 'timber' ? 'plaster' : (o.style ?? 'plaster') }
  w.roofs.set(rf.id, rf)
  for (const k of rooms) furnish(w, k, r)
  if (o.sign) { const s = f[0] ? [0, 1] : [1, 0]; const px = c2w(mid[0] + s[0]) + f[0] * (CELL / 2 + .2), pz = c2w(mid[1] + s[1]) + f[1] * (CELL / 2 + .2); w.addProp(o.sign, px, 0, pz, yawOf(f[0], f[1]), 0); w.addProp('lantern_hang', c2w(mid[0] - s[0]) + f[0] * (CELL / 2 + .2), 0, c2w(mid[1] - s[1]) + f[1] * (CELL / 2 + .2), yawOf(f[0], f[1]), 0) }
  return q
}
/** round tower with a spiral stair */
export function tower(w: World, r: Rng, o: { x: number; z: number; r: number; t?: number; l0?: number; l1: number; style: string; top: 'battlement' | 'cone'; roof?: string; open: { l: number; a: number; w: number; k?: 'door' | 'slit' }[]; types?: string[]; theme?: ThemeId; light?: boolean }) {
  const t = o.t ?? .8, l0 = o.l0 ?? 0, R = o.r + t; const id = w.nid++, top = o.top === 'battlement' ? o.l1 + 1 : o.l1
  const open = [...o.open]; for (let l = l0; l <= o.l1; l++) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .6 + l * .5; if (!open.some(q => q.l === l && Math.abs(Math.atan2(Math.sin(q.a - a), Math.cos(q.a - a))) < .5)) open.push({ l, a, w: .3, k: 'slit' }) }
  w.rings.set(id, { id, x: o.x, z: o.z, r: o.r, t, l0, l1: o.l1, style: o.style, top: o.top, roof: o.roof ?? 'slate', open, floor: 'planks', hole: 2.12 })
  const c0 = Math.floor((o.x - R) / CELL + HALF), c1 = Math.floor((o.x + R) / CELL + HALF), d0 = Math.floor((o.z - R) / CELL + HALF), d1 = Math.floor((o.z + R) / CELL + HALF)
  const made: Room[] = []
  for (let l = l0; l <= top; l++) {
    const cells: Cell[] = []; for (let z = d0; z <= d1; z++) for (let x = c0; x <= c1; x++) if (Math.hypot(c2w(x) - o.x, c2w(z) - o.z) < R + .3) cells.push([x, z])
    const v = w.lv(l); for (const [x, z] of cells) for (let d = 0; d < 4; d++) if (cells.some(c => c[0] === x + DIRS[d][0] && c[1] === z + DIRS[d][1])) w.setEdge(l, x, z, d, 0)
    const inner = cells.filter(([x, z]) => Math.hypot(c2w(x) - o.x, c2w(z) - o.z) < o.r + .2)
    const room = newRoom(w, l, inner, 'tower', o.theme ?? 'stone'); room.name = l === l0 ? 'Tower Foot' : l === top && o.top === 'battlement' ? 'Tower Top' : 'Tower Chamber'; made.push(room)
    for (const [x, z] of cells) { const i = idx(x, z); const out = !inner.some(c => c[0] === x && c[1] === z); if (out && (v.floor[i] > 1 || v.flag[i] & FLAG.solid) ) { if (!(v.flag[i] & FLAG.solid)) { v.flag[i] |= 0 } continue } if (out) continue; v.floor[i] = l === l0 ? FL.flagstone : FL.planks; v.flag[i] = FLAG.virt; v.ceil[i] = l === top && o.top === 'battlement' ? 0 : CEIL.beams; v.h[i] = 0; v.room[i] = room.id }
    if (l <= o.l1) { const off = o.r - .06; let n = 0; for (let k = 0; k < 8 && n < 2; k++) { const a = k * .785 + 1.1 + l; if (open.some(q => q.l === l && Math.abs(Math.atan2(Math.sin(q.a - a), Math.cos(q.a - a))) < .55)) continue; w.addProp('torch_wall', o.x + Math.cos(a) * off, l * 4, o.z + Math.sin(a) * off, yawOf(-Math.cos(a), -Math.sin(a)), l); n++; k += 2 } }
    // a few things around the rim
    if (l > l0 && l <= o.l1 && o.r > 3.3) { const ms = ['crate', 'barrel', 'chest', 'stool', 'sacks']; for (let k = 0; k < 2; k++) { const a = r() * 6.283; if (open.some(q => q.l === l && q.k !== 'slit' && Math.abs(Math.atan2(Math.sin(q.a - a), Math.cos(q.a - a))) < .7)) continue; if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < .9) continue; w.addProp(r.pick(ms), o.x + Math.cos(a) * (o.r - .55), l * 4, o.z + Math.sin(a) * (o.r - .55), r() * 6, l, .8) } }
  }
  const s = { id: w.nid++, l0, l1: top, x: o.x, z: o.z, a: 0 }; w.spirals.set(s.id, s); return made
}
export { cutStair, THEMES, v2w }
