import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { setCatalog, model, collider } from '../src/core/catalog'
import { generate, DEFAULTS, type GenOpts } from '../src/core/gen'
import { World, idx, squeeze, unsqueeze } from '../src/core/world'
import { Nav } from '../src/core/collide'
import { PRESETS } from '../src/core/presets'
import { THEMES, BIOMES, FLAG, DIRS, E, N, isDoor, w2c, c2w, type ThemeId, type BiomeId } from '../src/core/defs'
import { expandRooms, digDeeper, stamp, STAMPS, drawRoom } from '../src/core/gen/expand'
import { apply, transact } from '../src/core/ops'
beforeAll(() => setCatalog(JSON.parse(readFileSync('public/assets/props.json', 'utf8'))))
const themes = Object.keys(THEMES) as ThemeId[], biomes = Object.keys(BIOMES) as BiomeId[]
const hash = (b: Uint8Array) => { let h = 0; for (const v of b) h = (Math.imul(h, 31) + v) | 0; return h }
/** every room must be walkable from the spawn point */
export function audit(w: World) {
  const nav = new Nav(w), sx = w2c(w.spawn.x), sz = w2c(w.spawn.z), sl = Math.round(w.spawn.y / 4), R = nav.reach(sl, sx, sz); const bad: string[] = []
  for (const q of w.rooms.values()) { const cs = w.roomCells(q); if (!cs.length) continue; if (!cs.some(([x, z]) => R.has(q.l, x, z))) bad.push(`${q.type}#${q.id}@${q.l} (${q.x0},${q.z0})`) }
  // no solid prop may sit in a doorway
  for (const v of w.levels.values()) for (let z = 1; z < N - 1; z++) for (let x = 1; x < N - 1; x++) for (const [e, dx, dz] of [[v.eW[idx(x, z)] & 15, -1, 0], [v.eN[idx(x, z)] & 15, 0, -1]] as const) if (isDoor(e)) { const X = c2w(x) + dx * .75, Z = c2w(z) + dz * .75; for (const c of (nav as any).near(X, Z, .4)) { const p = w.props.get(c.id)!; if (c.y0 > v.l * 4 + 1.5 || c.y1 < v.l * 4 + .4) continue; if ((nav as any).inside(c, X, Z, .1)) bad.push(`prop ${p.m} in doorway ${v.l},${x},${z}`) } }
  const g = nav.ground(w.spawn.x, w.spawn.y + .3, w.spawn.z); if (g === null) bad.push('spawn has no ground')
  for (const p of w.props.values()) if (!model(p.m)) bad.push('unknown model ' + p.m); else if (!Number.isFinite(p.x + p.y + p.z)) bad.push('NaN prop')
  return { bad, reach: R.size }
}
const N_SEEDS = Number(process.env.SEEDS ?? 24)
describe('generators', () => {
  for (const kind of ['dungeon', 'cave', 'castle', 'village', 'wilds', 'tower', 'realm'] as const) {
    const n = kind === 'realm' ? Math.max(3, N_SEEDS / 6) : ['castle', 'village', 'wilds', 'tower'].includes(kind) ? N_SEEDS / 2 : N_SEEDS * 2
    it(`${kind}: all rooms reachable, doors clear (${n} seeds)`, () => {
      const fails: string[] = []
      for (let i = 0; i < n; i++) { const o: GenOpts = { ...DEFAULTS, kind, seed: `t${i}`, size: (1 + i % 4) as any, theme: themes[i % themes.length], biome: biomes[i % biomes.length], levels: 1 + i % 3, caves: (i % 5) * .15 }; const w = generate(o); const a = audit(w); if (a.bad.length) fails.push(`seed t${i} size ${o.size} ${o.theme}/${o.biome}: ${a.bad.slice(0, 4).join('; ')} (${a.bad.length})`) }
      expect(fails).toEqual([])
    }, 600000)
  }
  it('presets are sound', () => { const f: string[] = []; for (const p of PRESETS) { const w = generate(p.o); const a = audit(w); if (a.bad.length) f.push(p.name + ': ' + a.bad.slice(0, 5).join('; ')) } expect(f).toEqual([]) }, 300000)
  it('same seed, same world', () => { for (const p of PRESETS.slice(0, 4)) { const strip = (w: World) => { w.meta.id = ''; w.meta.made = w.meta.edited = 0; return hash(w.toBytes()) }; expect(strip(generate(p.o))).toBe(strip(generate(p.o))) } }, 120000)
})
describe('worlds', () => {
  it('save and load is lossless', async () => { for (const p of PRESETS) { const w = generate(p.o), b = w.toBytes(), z = await squeeze(b), q = World.fromBytes(await unsqueeze(z)); expect(hash(q.toBytes())).toBe(hash(b)) ; expect(z.length).toBeLessThan(400_000) } }, 300000)
  it('rejects junk files', () => { expect(() => World.fromBytes(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]))).toThrow() })
  it('expansion never damages what exists, and stays reachable', () => {
    const f: string[] = []
    for (let i = 0; i < 24; i++) { const w = generate({ ...DEFAULTS, kind: i % 2 ? 'dungeon' : 'cave', seed: 'x' + i, size: 1, theme: themes[i % 7], levels: 1 }); const v = w.levels.get(-1)!; const before = v.floor.slice(); const rooms = w.rooms.size
      const res = expandRooms(w, { seed: 'e' + i, l: -1, theme: themes[(i + 1) % 7], count: 6, caves: .2, side: (['n', 'e', 's', 'w', 'any'] as const)[i % 5] }); for (let k = 0; k < before.length; k++) if (before[k] && v.floor[k] !== before[k]) { f.push('overwrote cell'); break }
      if (res.made && w.rooms.size <= rooms) f.push('no rooms'); const d = digDeeper(w, { seed: 'd' + i, l: -1, theme: 'crypt', count: 5, caves: 0 }); const a = audit(w); if (a.bad.length) f.push(`x${i} ${a.bad.slice(0, 3).join(';')}`); void d }
    expect(f).toEqual([])
  }, 120000)
  it('every edit undoes exactly', () => {
    const w = generate({ ...DEFAULTS, kind: 'village', seed: 'undo', size: 1 }); const sig = () => {
      const H = w.header() as any; delete H.meta; delete H.nid; H.levels = 0; H.doors.sort()
      for (const k of ['props', 'rooms', 'roofs', 'stairs', 'rings', 'spirals']) H[k].sort((a: any, b: any) => (a.id ?? a[0]) - (b.id ?? b[0]))
      let h = 0; for (const l of [...w.levels.keys()].sort((p, q) => p - q)) { const A = w.levels.get(l)!.arrays(); if (A.every(a => (a as any).every((v: number) => !v))) continue; for (const a of A) h = (Math.imul(h, 31) + hash(new Uint8Array(a.buffer))) | 0 }
      return `${hash(new TextEncoder().encode(JSON.stringify(H)))} ${h} ${hash(new Uint8Array(w.terrain!.h.buffer))} ${hash(w.terrain!.w)}`
    }
    w.lv(-1); const s0 = sig(); const invs: any[] = []
    STAMPS.filter(s => s.out).forEach((s, i) => { const t = transact(w, () => { for (let k = 0; k < 80; k++) if (stamp(w, s.id, 0, 30 + (k * 13) % 130, 30 + (k * 29 + i * 7) % 130, i % 4, 's' + i).ok) break }); if (t) invs.push(t) })
    const t2 = transact(w, () => { drawRoom(w, -1, { x0: 90, z0: 90, x1: 97, z1: 96 }, { floor: 'flagstone', wall: 'ashlar', ceil: 1, theme: 'stone', type: 'library', furnish: true, seed: 'q' }) }); invs.push(t2!); const s1 = sig()
    expect(invs.length).toBeGreaterThan(10); for (const t of [...invs].reverse()) apply(w, t.inv); expect(sig()).toBe(s0); for (const t of invs) apply(w, t.op); expect(sig()).toBe(s1)
  }, 120000)
})
describe('walking', () => {
  it('random walks never leave the map or enter rock', () => {
    const f: string[] = []
    for (const p of PRESETS) { const w = generate(p.o), nav = new Nav(w); let pos = { ...w.spawn }; let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; let a = 0, moved = 0
      for (let i = 0; i < 4000; i++) { if (i % 25 === 0) a = rnd() * 6.28; const n = nav.walk(pos, Math.cos(a) * .25, Math.sin(a) * .25); moved += Math.hypot(n.x - pos.x, n.z - pos.z); if (![n.x, n.y, n.z].every(Number.isFinite)) { f.push(p.id + ' NaN'); break } const l = nav.levelOf(n.x, n.y, n.z); const cx = w2c(n.x), cz = w2c(n.z); const ok = w.open(l, cx, cz) || w.open(l - 1, cx, cz) || [...w.rings.values()].some(r => Math.hypot(n.x - r.x, n.z - r.z) < r.r + r.t + .1); if (!ok) { f.push(`${p.id} in rock at ${cx},${cz},${n.y.toFixed(2)} step ${i}`); break } pos = n }
      if (moved < 60) f.push(p.id + ' stuck: moved ' + moved.toFixed(1)) }
    expect(f).toEqual([])
  }, 120000)
})
void collider; void DIRS; void FLAG; void E
