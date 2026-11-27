import { World, type Room } from '../world'
import { FL, THEMES, WS, CEIL, HALF, E, FLAG, c2w, DIRS, type ThemeId } from '../defs'
import type { Rng } from '../rng'
import { idx } from '../world'
import { grow, loops, newRoom, fill, wallAround, rectCells, stairDown, type Rect } from './build'
import { furnish } from './furnish'
import { nameAll } from './text'
const WEIGHTS: Record<ThemeId, [string, number][]> = {
  stone: [['barracks', 2], ['armory', 1.4], ['library', 1.2], ['shrine', 1.2], ['prison', 1.3], ['torture', .8], ['kitchen', 1], ['dining', 1.2], ['storage', 2], ['alchemy', 1], ['bedroom', 1], ['guard', 2], ['trap', 1], ['fountain', .7], ['room', 2]],
  crypt: [['crypt', 6], ['shrine', 2], ['summoning', 1.2], ['storage', .6], ['alchemy', .8], ['torture', .8], ['nest', .8], ['trap', 1.2], ['room', 1.6], ['ruin', 1]],
  desert: [['crypt', 4], ['shrine', 2], ['treasury', 1], ['trap', 2], ['storage', 1], ['library', .6], ['room', 2], ['fountain', .8]],
  frost: [['barracks', 1.4], ['crypt', 1.6], ['shrine', 1.2], ['prison', 1], ['storage', 1.2], ['guard', 1.4], ['fountain', 1], ['room', 2], ['portal', .5], ['alchemy', .6]],
  infernal: [['summoning', 2.4], ['torture', 2], ['prison', 2], ['forge', 1.4], ['shrine', 1.8], ['trap', 1.4], ['armory', 1], ['room', 1.4], ['library', .5]],
  overgrown: [['ruin', 4], ['nest', 1.6], ['fountain', 1.4], ['shrine', 1.2], ['crypt', 1], ['storage', .8], ['library', .8], ['room', 1.6]],
  dwarven: [['forge', 3], ['hall', 1], ['armory', 2], ['barracks', 1.6], ['dining', 1.6], ['storage', 2], ['treasury', 1], ['shrine', 1], ['library', .8], ['guard', 1]],
}
const CAVES: [string, number][] = [['cave', 3], ['crystal', 1.4], ['fungus', 1.2], ['nest', .8], ['cavecamp', 1], ['mine', .8]]
export function assignTypes(w: World, r: Rng, rooms: Room[], theme: ThemeId, boss = true) {
  const W = WEIGHTS[theme]; const used = new Map<string, number>(); let deepest: Room | null = null
  const set = (q: Room, t: string) => { const c = { ...q, type: t }; w.rooms.set(q.id, c); return c }
  if (boss) for (const q of rooms) if (q.type === 'room' && w.roomCells(q).length >= 30 && (!deepest || q.depth > deepest.depth)) deepest = q
  let treasure = false
  return rooms.map(q => {
    if (q.type === 'cave') return set(q, r.weighted(CAVES)); if (q.type !== 'room') return q
    if (deepest && q.id === deepest.id) return set(q, theme === 'infernal' || theme === 'crypt' ? r.pick(['summoning', 'throne', 'portal']) : 'throne')
    const a = w.roomCells(q).length
    if (!treasure && deepest && q.depth >= deepest.depth - 1 && a <= 26) { treasure = true; return set(q, 'treasury') }
    if (a >= 64 && r.chance(.55)) return set(q, r.pick(['hall', 'dining', 'shrine', 'throne']))
    const opts = W.map(([t, k]) => [t, k / (1 + (used.get(t) ?? 0) * .8) * (a < 14 && !['storage', 'prison', 'treasury', 'room', 'guard', 'trap', 'bedroom'].includes(t) ? .15 : 1)] as [string, number]); const t = r.weighted(opts); used.set(t, (used.get(t) ?? 0) + 1); return set(q, t)
  })
}
/** pools of water or lava sunk into some rooms, ringed by dry floor */
export function pools(w: World, r: Rng, rooms: Room[], chance = .22) {
  for (const q of rooms) {
    const cells = w.roomCells(q); if (cells.length < 36 || !r.chance(chance) || ['throne', 'hall', 'treasury', 'forge'].includes(q.type)) continue
    const S = new Set(cells.map(c => idx(c[0], c[1]))), lv = w.lv(q.l); const inner = cells.filter(([x, z]) => { for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) if (!S.has(idx(x + a, z + b))) return false; return true }); if (inner.length < 4) continue
    const cave = !!(lv.flag[idx(cells[0][0], cells[0][1])] & FLAG.cave)
    const use = cave ? inner.filter(([x, z]) => Math.hypot(x - (q.x0 + q.x1) / 2, z - (q.z0 + q.z1) / 2) < 3.4) : inner
    const liq = THEMES[q.theme].liquid === 'lava' ? FLAG.lava : FLAG.water
    for (const [x, z] of use) { const i = idx(x, z); lv.flag[i] |= liq; lv.h[i] = cave ? -4 : -2 }
  }
}
export interface DungeonOpts { rooms: number; levels: number; theme: ThemeId; caves: number; loops: number }
export const underRect = (n: number): Rect => ({ x0: HALF - n, z0: HALF - n, x1: HALF + n - 1, z1: HALF + n - 1 })
export function genDungeon(w: World, r: Rng, o: DungeonOpts, top = -1, start?: Room[], area?: Rect) {
  const span = Math.min(88, 16 + Math.ceil(Math.sqrt(o.rooms / o.levels) * 9)); const B = area ?? underRect(span); let seeds: Room[] = start ?? []; const themes: ThemeId[] = [o.theme]
  for (let i = 1; i < o.levels; i++) themes.push(o.theme)
  const all: Room[] = []
  for (let i = 0; i < o.levels; i++) {
    const l = top - i, th = THEMES[themes[i]]
    if (!seeds.length) {
      const W = r.int(6, 8), D = r.int(6, 8), x0 = HALF - (W >> 1), z0 = HALF + Math.floor(span * .3); const c = rectCells(x0, z0, x0 + W - 1, z0 + D - 1); const q = newRoom(w, l, c, 'entrance', o.theme, 0); fill(w, l, c, { floor: FL[th.floor], ceil: th.ceil, room: q.id }); wallAround(w, l, c, WS[th.wall])
      // great doors to the outside world
      const gx = x0 + (W >> 1) - 1; w.setEdge(l, gx, z0 + D - 1, 1, E.Wall, WS[th.wall]); w.spawn = { x: c2w(gx) + .75, y: l * 4, z: c2w(z0 + D - 2), yaw: Math.PI }; w.addProp('portcullis', c2w(gx) + .75, l * 4, (z0 + D - 96) * 1.5 - .26, Math.PI, l); w.addProp('frame_gate', c2w(gx) + .75, l * 4, (z0 + D - 96) * 1.5 - .3, 0, l)
      seeds = [q]; all.push(q)
    }
    const n = Math.max(3, Math.round(o.rooms / o.levels)); const g = grow(w, r, { l, theme: themes[i], bounds: B, rooms: n, caveMix: o.caves, seedRooms: seeds })
    loops(w, r, l, themes[i], Math.round(g.rooms.length * o.loops), g.links, B)
    const typed = assignTypes(w, r, g.rooms, themes[i], i === o.levels - 1)
    let next: Room[] = []
    if (i < o.levels - 1) { const deep = [...typed].sort((a, b) => b.depth - a.depth).slice(0, Math.max(4, typed.length >> 1)); const s = stairDown(w, r, l, deep, themes[i], themes[i + 1], B) ?? stairDown(w, r, l, [...typed, ...seeds], themes[i], themes[i + 1], B); if (s) next = [s] }
    pools(w, r, typed)
    all.push(...typed, ...seeds.filter(q => !all.includes(q)), ...next)
    if (i < o.levels - 1 && !next.length) break
    seeds = next
  }
  const done = new Set<number>(); for (const q of [...w.rooms.values()]) if (q.l <= top && !done.has(q.id) && w.roomCells(q).length) { done.add(q.id); furnish(w, q, r) }
  nameAll(w, r); return all
}
void DIRS; void CEIL
