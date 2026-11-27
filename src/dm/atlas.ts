// A campaign has many maps. What belongs to a map stays with it when the party leaves.
import { generate } from '../core/gen'
import { nameAll } from '../core/gen/text'
import { World, type Token } from '../core/world'
import type { Game } from '../rules/state'
import type { Mod, Place } from '../modules/parse'
const KEYS = ['mons', 'chests', 'traps', 'locks', 'secrets', 'pop', 'place', 'fow'] as const
/** take from the game what belongs to this map */
export function stow(g: Game): any { const o: any = { rooms: g.camp?.rooms ?? {} }; for (const k of KEYS) o[k] = (g as any)[k]; return JSON.parse(JSON.stringify(o)) }
/** put the state of a map into the game, or a clean slate */
export function unstow(g: Game, o: any | null) { const G = g as any; G.mons = o?.mons ?? {}; G.chests = o?.chests ?? {}; G.traps = o?.traps ?? {}; G.locks = o?.locks ?? {}; G.secrets = o?.secrets ?? []; G.pop = o?.pop ?? { n: 0, bosses: 0, rooms: [] }; G.place = o?.place ?? { bind: {}, foes: {}, npcs: {}, told: {} }; G.fow = o?.fow ?? null; G.zones = []; G.sneak = {}; G.arm = {}; G.asks = []; G.calls = []; G.scene = null; G.combat = null; if (G.camp) G.camp.rooms = o?.rooms ?? {} }
/** draw a place that has never been seen */
export function draw(m: Mod, p: Place): World { const w = generate(p.gen); w.meta.name = p.name; if (p.weather) w.env.weather = p.weather as any; if (p.gen.time !== undefined && w.terrain) w.env.time = p.gen.time; void nameAll; void m; return w }
export const placeOf = (m: Mod, key: string) => m.places.find(p => p.key === key) ?? m.places[0]
/** heroes step off one map and onto another */
export function carry(from: World, to: World, ids: string[]): Token[] { const out: Token[] = []; let i = 0; for (const id of ids) { const t = from.tokens.get(id); if (!t) continue; const a = i++ * 1.3; out.push({ ...t, x: to.spawn.x + Math.cos(a) * (i > 1 ? 1.1 : 0), y: to.spawn.y, z: to.spawn.z + Math.sin(a) * (i > 1 ? 1.1 : 0), r: to.spawn.yaw }) } for (const [k, t] of [...to.tokens]) if (t.side === 'hero' && t.owner) to.tokens.delete(k); return out }
