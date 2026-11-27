import { World, idx, type Room } from '../world'
import { E, FL, FLAG, THEMES, WS, DIRS, HALF, N, c2w, w2c, type ThemeId } from '../defs'
import { makeRng } from '../rng'
import { grow, loops, isVoid, type Rect, newRoom, fill, wallAround, rectCells, stairDown, clearDoorways } from './build'
import { assignTypes, pools } from './dungeon'
import { furnish } from './furnish'
import { nameAll } from './text'
import { carveCave } from './cave'
import { house, tower } from './houses'
import { ruin, camp, stones } from './wilds'
import { Land } from './land'
import { wizardTower } from './village'
export interface ExpandOpts { seed: string; l: number; theme: ThemeId; count: number; caves: number; side?: 'n' | 'e' | 's' | 'w' | 'any'; from?: { x: number; z: number } }
/** grow new rooms off what exists on a level. Never overwrites anything. */
export function expandRooms(w: World, o: ExpandOpts): { made: number; why?: string } {
  const r = makeRng(o.seed); const v = w.levels.get(o.l); if (!v) return { made: 0, why: 'There is nothing on this floor to grow from.' }
  if (o.l >= 0 && w.terrain) return { made: 0, why: 'Rooms grow underground. Go down a floor, or use a building from the stamps.' }
  let B: Rect = { x0: 3, z0: 3, x1: N - 4, z1: N - 4 }; const all = [...w.rooms.values()].filter(q => q.l === o.l && q.type !== 'corridor'); if (!all.length) return { made: 0, why: 'There are no rooms on this floor yet. Draw one first.' }
  let bx0 = N, bz0 = N, bx1 = 0, bz1 = 0; for (const q of all) { bx0 = Math.min(bx0, q.x0); bx1 = Math.max(bx1, q.x1); bz0 = Math.min(bz0, q.z0); bz1 = Math.max(bz1, q.z1) }
  const only: { x: number; z: number; d: number }[] = []; const sideD = { e: 0, s: 1, w: 2, n: 3 } as const
  for (const q of all) for (const [x, z] of w.roomCells(q)) for (let d = 0; d < 4; d++) { if (!isVoid(w, o.l, x + DIRS[d][0], z + DIRS[d][1])) continue; const cave = w.flagAt(o.l, x, z) & FLAG.cave; if (!cave && w.etype(o.l, x, z, d) !== E.Wall) continue
    if (o.from) { const k = Math.hypot(x - o.from.x, z - o.from.z); if (k > 6) continue } else if (o.side && o.side !== 'any') { if (d !== sideD[o.side]) continue; const near = o.side === 'e' ? bx1 - x : o.side === 'w' ? x - bx0 : o.side === 's' ? bz1 - z : z - bz0; if (near > 8) continue } only.push({ x, z, d }) }
  if (!only.length) return { made: 0, why: 'No free wall there to build out from.' }
  const seeds = o.from ? [...new Set(only.map(a => w.roomAt(o.l, a.x, a.z)).filter(Boolean) as Room[])] : o.side && o.side !== 'any' ? [...new Set(only.map(a => w.roomAt(o.l, a.x, a.z)).filter(Boolean) as Room[])] : all
  const g = grow(w, r, { l: o.l, theme: o.theme, bounds: B, rooms: o.count, caveMix: o.caves, seedRooms: seeds, only }); if (!g.rooms.length) return { made: 0, why: 'No room left on that side. Try another side or floor.' }
  loops(w, r, o.l, o.theme, Math.round(g.rooms.length * .3), g.links, B); const ty = assignTypes(w, r, g.rooms, o.theme, g.rooms.length > 5); pools(w, r, ty, .15)
  const ids = new Set([...ty.map(q => q.id), ...g.links.flat()]); for (const q of [...w.rooms.values()]) if (ids.has(q.id) && (q.type === 'corridor' || ty.some(t => t.id === q.id)) && ![...w.props.values()].some(p => p.l === q.l && w.roomAt(q.l, w2c(p.x), w2c(p.z))?.id === q.id)) furnish(w, q, r)
  clearDoorways(w, [o.l]); nameAll(w, r); return { made: g.rooms.length }
}
export function digDeeper(w: World, o: ExpandOpts): { made: number; why?: string; l?: number } {
  const r = makeRng(o.seed); const rooms = [...w.rooms.values()].filter(q => q.l === o.l && q.type !== 'corridor' && q.type !== 'tower' && !(o.l > 0)); if (!rooms.length) return { made: 0, why: 'Stand on a floor that has rooms, then dig.' }
  const near = o.from ? rooms.filter(q => Math.hypot((q.x0 + q.x1) / 2 - o.from!.x, (q.z0 + q.z1) / 2 - o.from!.z) < 18) : rooms; const B: Rect = { x0: 3, z0: 3, x1: N - 4, z1: N - 4 }
  const s = stairDown(w, r, o.l, near.length ? near : rooms, w.env.theme, o.theme, B) ?? stairDown(w, r, o.l, rooms, w.env.theme, o.theme, B); if (!s) return { made: 0, why: 'No wall here has room for a stair behind it.' }
  const g = grow(w, r, { l: o.l - 1, theme: o.theme, bounds: B, rooms: o.count, caveMix: o.caves, seedRooms: [s] }); loops(w, r, o.l - 1, o.theme, Math.round(o.count * .25), g.links, B); const ty = assignTypes(w, r, g.rooms, o.theme, true); pools(w, r, ty)
  furnish(w, s, r); for (const q of [...w.rooms.values()]) if (q.l === o.l - 1 && (ty.some(t => t.id === q.id) || (q.type === 'corridor' && g.links.some(k => k.includes(q.id))))) furnish(w, q, r); clearDoorways(w, [o.l, o.l - 1]); nameAll(w, r); return { made: g.rooms.length, l: o.l - 1 }
}
export type StampId = 'cottage' | 'tavern' | 'smithy' | 'shop' | 'chapel' | 'stable' | 'manor' | 'tower' | 'wizard' | 'ruin' | 'camp' | 'stones' | 'cave'
export const STAMPS: { id: StampId; name: string; icon: string; w: number; d: number; out: boolean }[] = [
  { id: 'cottage', name: 'Cottage', icon: 'house', w: 7, d: 5, out: true }, { id: 'tavern', name: 'Tavern', icon: 'beer-stein', w: 11, d: 8, out: true }, { id: 'smithy', name: 'Smithy', icon: 'anvil', w: 7, d: 6, out: true }, { id: 'shop', name: 'Shop', icon: 'shop', w: 7, d: 6, out: true }, { id: 'chapel', name: 'Chapel', icon: 'church', w: 7, d: 12, out: true }, { id: 'stable', name: 'Stable', icon: 'barn', w: 9, d: 6, out: true }, { id: 'manor', name: 'Manor', icon: 'medieval-village-01', w: 13, d: 10, out: true }, { id: 'tower', name: 'Watchtower', icon: 'watchtower', w: 8, d: 8, out: true }, { id: 'wizard', name: 'Wizard tower', icon: 'evil-tower', w: 11, d: 11, out: true }, { id: 'ruin', name: 'Ruin', icon: 'ancient-ruins', w: 9, d: 8, out: true }, { id: 'camp', name: 'Camp', icon: 'camping-tent', w: 10, d: 10, out: true }, { id: 'stones', name: 'Stone circle', icon: 'stone-block', w: 12, d: 12, out: true }, { id: 'cave', name: 'Cave chamber', icon: 'cave-entrance', w: 16, d: 16, out: false }]
export function stamp(w: World, id: StampId, l: number, cx: number, cz: number, rot: number, seed: string): { ok: boolean; why?: string } {
  const r = makeRng(seed), S = STAMPS.find(s => s.id === id)!; const alongX = rot % 2 === 0; const W = alongX ? S.w : S.d, D = alongX ? S.d : S.w, x0 = cx - (W >> 1), z0 = cz - (D >> 1)
  if (x0 < 4 || z0 < 4 || x0 + W > N - 5 || z0 + D > N - 5) return { ok: false, why: 'Too close to the edge of the world.' }
  if (id === 'cave') { if (l >= 0 && w.terrain) return { ok: false, why: 'Caves go underground. Move down a floor first.' }; const R = { x0, z0, x1: x0 + W - 1, z1: z0 + D - 1 }; const q = carveCave(w, r, l, R, w.env.theme, .3); for (const k of q) furnish(w, k, r); nameAll(w, r); return q.length ? { ok: true } : { ok: false, why: 'Not enough free rock there.' } }
  if (l !== 0 || !w.terrain) return { ok: false, why: 'Buildings stand on the surface. Switch to ground level.' }
  for (let z = z0 - 1; z <= z0 + D; z++) for (let x = x0 - 1; x <= x0 + W; x++) if (w.floorAt(0, x, z) !== 1 || w.flagAt(0, x, z)) return { ok: false, why: 'Something is already built there.' }
  if (w.terrain.water !== null) for (let z = z0; z <= z0 + D; z += 2) for (let x = x0; x <= x0 + W; x += 2) if (w.terrainH(c2w(x), c2w(z)) < w.terrain.water + .1) return { ok: false, why: 'That is under water.' }
  // level the ground with a soft skirt
  const T = w.terrain; for (let z = z0 - 7; z <= z0 + D + 7; z++) for (let x = x0 - 7; x <= x0 + W + 7; x++) { if (x < 0 || z < 0 || x > N || z > N) continue; const dx = Math.max(x0 - 1 - x, 0, x - x0 - W - 1), dz = Math.max(z0 - 1 - z, 0, z - z0 - D - 1), d = Math.hypot(dx, dz); if (d < 6) { const k = d / 6, i = z * (N + 1) + x; if (T.h[i] < -.3) continue; T.h[i] = T.h[i] * k * k * (3 - 2 * k) } }
  for (const p of [...w.props.values()]) if (p.l === 0 && p.x > c2w(x0 - 1) - .75 && p.x < c2w(x0 + W) + .75 && p.z > c2w(z0 - 1) - .75 && p.z < c2w(z0 + D) + .75) w.props.delete(p.id)
  const land = { use() { }, w, r } as unknown as Land; const door = [1, 0, 3, 2][rot]; const base = { x0, z0, x1: x0 + W - 1, z1: z0 + D - 1, door, theme: w.env.theme }
  if (id === 'cottage') house(w, r, { type: 'cottage', ...base }); if (id === 'tavern') house(w, r, { type: 'tavern', ...base, floors: 2, upper: 'bedroom', roof: 'clay', sign: 'sign_tavern' }); if (id === 'smithy') house(w, r, { type: 'smithy', ...base, style: 'stone_wall', roof: 'shingle', gate: true, sign: 'sign_smith', floor: 'flagstone' }); if (id === 'shop') house(w, r, { type: 'shop', ...base, floors: 2, upper: 'bedroom', sign: 'sign_shop' }); if (id === 'chapel') house(w, r, { type: 'chapel', ...base, style: 'ashlar', tall: true, roof: 'slate', gate: true, floor: 'flagstone' }); if (id === 'stable') house(w, r, { type: 'stable', ...base, style: 'planks', roof: 'thatch', gate: true, floor: 'straw' }); if (id === 'manor') house(w, r, { type: 'hall', ...base, style: 'ashlar', floors: 2, upper: 'library', roof: 'slate', gate: true })
  if (id === 'tower') tower(w, r, { x: (cx - HALF) * 1.5, z: (cz - HALF) * 1.5, r: 3.7, l1: 2, style: 'ashlar', top: 'battlement', open: [{ l: 0, a: [Math.PI / 2, 0, -Math.PI / 2, Math.PI][rot], w: 1.3, k: 'door' }] }); if (id === 'wizard') wizardTower(w, r, land, cx, cz, 3); if (id === 'ruin') ruin(w, r, land, x0, z0, W, D); if (id === 'camp') camp(w, r, land, cx, cz); if (id === 'stones') stones(w, r, land, cx, cz)
  nameAll(w, r); return { ok: true }
}
/** editor: a plain rectangular room */
export function drawRoom(w: World, l: number, R: Rect, o: { floor: string; wall: string; ceil: number; theme: ThemeId; type: string; furnish: boolean; seed: string; outdoor?: boolean }) {
  const cells = rectCells(Math.max(2, R.x0), Math.max(2, R.z0), Math.min(N - 3, R.x1), Math.min(N - 3, R.z1)); if (!cells.length) return; const r = makeRng(o.seed); const lv = w.lv(l)
  const old = new Set<number>(); for (const [x, z] of cells) { const id = lv.room[idx(x, z)]; if (id) old.add(id) }
  for (const [x, z] of cells) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (cells.some(c => c[0] === nx && c[1] === nz)) w.setEdge(l, x, z, d, 0) }
  const q = newRoom(w, l, cells, o.type, o.theme); fill(w, l, cells, { floor: FL[o.floor], ceil: o.ceil, room: q.id }); wallAround(w, l, cells, WS[o.wall]); for (const id of old) { const k = w.rooms.get(id); if (k && !w.roomCells(k).length) w.rooms.delete(id) }
  if (o.furnish) furnish(w, q, r); nameAll(w, r); return q
}
void THEMES
