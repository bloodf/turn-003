import { World } from '../world'
import { makeRng } from '../rng'
import { type ThemeId, type BiomeId, HALF } from '../defs'
import { genDungeon } from './dungeon'
import { genCave } from './cave'
import { genCastle, genVillage, genWilds, genRealm, genTower } from './wilds'
import { placeName, nameAll } from './text'
import { clearDoorways } from './build'
export type Kind = 'dungeon' | 'cave' | 'castle' | 'village' | 'wilds' | 'tower' | 'realm' | 'blank'
export interface GenOpts { kind: Kind; seed: string; size: 1 | 2 | 3 | 4; theme: ThemeId; biome: BiomeId; levels: number; caves: number; name?: string; moat?: boolean; time?: number; style?: string; roofs?: 'cone' | 'battlement' }
export const DEFAULTS: GenOpts = { kind: 'dungeon', seed: 'raven-keep-1', size: 2, theme: 'stone', biome: 'temperate', levels: 1, caves: .15 }
export const KINDS: { id: Kind; name: string; icon: string; blurb: string }[] = [
  { id: 'dungeon', name: 'Dungeon', icon: 'dungeon-gate', blurb: 'Rooms, corridors, secret doors, stairs to deeper floors' },
  { id: 'cave', name: 'Cavern', icon: 'cave-entrance', blurb: 'Living rock, still pools, crystal and fungus' },
  { id: 'castle', name: 'Castle', icon: 'castle', blurb: 'Walls, towers, bailey, a keep of three storeys and an undercroft' },
  { id: 'village', name: 'Village', icon: 'village', blurb: 'Tavern, smithy, chapel, cottages you can walk into' },
  { id: 'wilds', name: 'Wilderness', icon: 'forest', blurb: 'Hills, woods, a river, camps, ruins and a buried door' },
  { id: 'tower', name: 'Wizard’s Tower', icon: 'tower-flag', blurb: 'Five floors of sorcery above, a dungeon below' },
  { id: 'realm', name: 'Whole Realm', icon: 'world', blurb: 'Village, castle, wilds and dungeon in one continuous land' },
  { id: 'blank', name: 'Blank Map', icon: 'scroll-quill', blurb: 'An empty field. Build everything by hand' },
]
export function generate(o: GenOpts): World {
  const r = makeRng(`${o.seed}|${o.kind}|${o.size}|${o.theme}|${o.biome}|${o.levels}`); const w = new World('', o.seed, o.kind); w.env = { ...w.env, theme: o.theme, biome: o.biome, time: o.time ?? 15 }
  const s = o.size
  if (o.kind === 'dungeon') genDungeon(w, r, { rooms: [7, 14, 26, 42][s - 1] * Math.max(1, o.levels * .75), levels: o.levels, theme: o.theme, caves: o.caves, loops: .25 })
  else if (o.kind === 'cave') genCave(w, r, { size: [14, 20, 28, 38][s - 1], theme: o.theme, water: .45 })
  else if (o.kind === 'castle') genCastle(w, r, { biome: o.biome, size: [17, 20, 24, 29][s - 1], moat: o.moat ?? r.chance(.5), under: [5, 9, 14, 20][s - 1], theme: o.theme, style: o.style ?? r.pick(['ashlar', 'stone_wall', 'ashlar', 'sandstone']), roofs: o.roofs ?? r.pick(['cone', 'battlement']) })
  else if (o.kind === 'village') genVillage(w, r, { biome: o.biome, size: [18, 24, 32, 42][s - 1], river: r.chance(.6) })
  else if (o.kind === 'wilds') genWilds(w, r, { biome: o.biome, forest: [.6, .9, 1.1, 1.3][s - 1], theme: o.theme })
  else if (o.kind === 'tower') genTower(w, r, { biome: o.biome, theme: o.theme })
  else if (o.kind === 'realm') genRealm(w, r, { biome: o.biome, theme: o.theme })
  else { w.ensureTerrain(); w.spawn = { x: 0, y: 0, z: 0, yaw: Math.PI } }
  clearDoorways(w); nameAll(w, r); w.meta.name = o.name || placeName(r, o.kind); w.meta.seed = o.seed; w.meta.kind = o.kind
  const outdoor = !!w.terrain; if (!outdoor) w.env.time = 15; w.rooms.forEach(q => { if (!w.levels.has(q.l)) w.rooms.delete(q.id) })
  return w
}
void HALF
