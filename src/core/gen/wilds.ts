import { World, idx } from '../world'
import { E, FL, WS, HALF, c2w, v2w, N, DIRS, type ThemeId, type BiomeId } from '../defs'
import type { Rng } from '../rng'
import { Land } from './land'
import { castle } from './castle'
import { village, entranceHut, wizardTower } from './village'
import { fill, rectCells } from './build'
import { furnish } from './furnish'
import { newRoom } from './build'
export function ruin(w: World, r: Rng, land: Land, x: number, z: number, W: number, D: number) {
  const cs = rectCells(x, z, x + W - 1, z + D - 1).filter(() => r.chance(.82)); fill(w, 0, cs, { floor: FL.flag_moss, ceil: 0 }); const q = newRoom(w, 0, cs, 'ruin', 'overgrown'); for (const [a, b] of cs) w.lv(0).room[idx(a, b)] = q.id
  for (let i = 0; i < W; i++) { if (r.chance(.7)) w.setEdge(0, x + i, z, 3, r.chance(.35) ? E.Wall : E.Ruin, WS.mossy_wall); if (r.chance(.6)) w.setEdge(0, x + i, z + D - 1, 1, E.Ruin, WS.mossy_wall) } for (let i = 0; i < D; i++) { if (r.chance(.65)) w.setEdge(0, x, z + i, 2, E.Ruin, WS.mossy_wall); if (r.chance(.65)) w.setEdge(0, x + W - 1, z + i, 0, r.chance(.3) ? E.Wall : E.Ruin, WS.mossy_wall) }
  land.use(x - 1, z - 1, x + W, z + D, 2); furnish(w, q, r)
}
export function camp(w: World, r: Rng, land: Land, x: number, z: number) { const y = (a: number, b: number) => w.terrainH(a, b); const X = v2w(x), Z = v2w(z); w.addProp('campfire', X, y(X, Z), Z, 0, 0); const T = ['tent_canvas', 'tent_red', 'tent_blue']; for (let i = 0; i < 3; i++) { const a = i * 2.1 + r() * .3, px = X + Math.cos(a) * 5, pz = Z + Math.sin(a) * 5; w.addProp(T[i], px, y(px, pz), pz, Math.atan2(-Math.cos(a), -Math.sin(a)), 0) } for (let i = 0; i < 5; i++) { const a = r() * 6.28, d = r.range(2, 4), px = X + Math.cos(a) * d, pz = Z + Math.sin(a) * d; w.addProp(r.pick(['log_fallen', 'bedroll', 'crate', 'barrel', 'sacks', 'cookpot']), px, y(px, pz), pz, r() * 6, 0, .9) } land.use(x - 5, z - 5, x + 5, z + 5, 2) }
export function stones(w: World, r: Rng, land: Land, x: number, z: number, R = 7) { const n = 9; for (let i = 0; i < n; i++) { const a = i * 6.283 / n, px = v2w(x) + Math.cos(a) * R, pz = v2w(z) + Math.sin(a) * R; if (r.chance(.9)) w.addProp(i % 3 ? 'standing_stone' : 'obelisk', px, w.terrainH(px, pz) - .1, pz, -a + Math.PI / 2, 0, r.range(.8, 1.2)) } w.addProp('altar', v2w(x), w.terrainH(v2w(x), v2w(z)), v2w(z), 0, 0); w.addProp('rune_circle', v2w(x), w.terrainH(v2w(x), v2w(z)) + .02, v2w(z), 0, 0, 1.6); land.use(x - 6, z - 6, x + 6, z + 6, 2) }
export function farm(w: World, r: Rng, land: Land, x: number, z: number, W: number, D: number) { if (!land.free(x, z, x + W, z + D)) return; land.use(x, z, x + W, z + D, 2); const v = w.lv(0); for (let b = z; b <= z + D; b++) for (let a = x; a <= x + W; a++) { v.floor[idx(a, b)] = (b - z) % 2 ? FL.dirt : FL.mud; if ((b - z) % 2 && r.chance(.5)) w.addProp('grass_tuft', c2w(a), 0, c2w(b), r() * 6, 0, r.range(.8, 1.3)) } for (let a = x; a <= x + W; a++) for (const [b, d] of [[z, 3], [z + D, 1]]) if (r.chance(.9)) w.setEdge(0, a, b, d, E.Fence, 0); for (let b = z; b <= z + D; b++) for (const [a, d] of [[x, 2], [x + W, 0]]) if (r.chance(.9) && b !== z + (D >> 1)) w.setEdge(0, a, b, d, E.Fence, 0); w.addProp('scarecrow', c2w(x + (W >> 1)), 0, c2w(z + (D >> 1)), r() * 6, 0) }
export function genWilds(w: World, r: Rng, o: { biome: BiomeId; forest: number; theme: ThemeId }) {
  const land = new Land(w, r, o.biome), cx = HALF, cz = HALF; land.flatten(cx - 9, cz - 9, cx + 9, cz + 9, 16)
  const spots: [number, number, string][] = []; const kinds = ['camp', 'ruin', 'stones', 'hut', 'tower', 'ruin', 'shrine']; kinds.forEach((k, i) => { const a = i / kinds.length * 6.283 + r() * .5, d = r.range(34, 58); spots.push([Math.round(cx + Math.cos(a) * d), Math.round(cz + Math.sin(a) * d), k]) })
  for (const [x, z, k] of spots) land.flatten(x - 7, z - 7, x + 7, z + 7, k === 'hut' ? 15 : 13)
  land.hills(6, 16); if (r.chance(.75)) { const a = r() * 3.14; land.river([[HALF + Math.cos(a) * 100, HALF + Math.sin(a) * 100], [HALF + r.int(-24, 24), HALF + r.int(12, 24)], [HALF - Math.cos(a) * 100, HALF - Math.sin(a) * 100]], 3.6) }
  for (const [x, z, k] of spots) { if (land.water(x, z) || land.water(x + 6, z) || land.water(x - 6, z) || land.water(x, z + 6) || land.water(x, z - 6)) continue
    if (k === 'camp') camp(w, r, land, x, z); if (k === 'ruin') ruin(w, r, land, x - 5, z - 4, r.int(7, 10), r.int(6, 9)); if (k === 'stones') stones(w, r, land, x, z); if (k === 'tower') wizardTower(w, r, land, x, z, 3); if (k === 'shrine') { w.addProp('shrine', v2w(x), w.terrainH(v2w(x), v2w(z)), v2w(z), 0, 0); for (let i = 0; i < 6; i++) w.addProp('candles_floor', v2w(x) + r.range(-1.5, 1.5), w.terrainH(v2w(x), v2w(z)), v2w(z) + r.range(-1.5, 1.5), 0, 0) }
    if (k === 'hut') entranceHut(w, r, land, x - 2, z, 'mossy_wall', o.theme, 10, 1, { x0: Math.max(4, x - 30), z0: Math.max(4, z - 34), x1: Math.min(N - 5, x + 30), z1: Math.min(N - 5, z + 26) }, .3)
    land.road([[cx, cz], [x, z + (k === 'hut' ? 7 : 0)]], 1.1, 1.2) }
  for (let z = cz - 8; z <= cz + 8; z++) for (let x = cx - 8; x <= cx + 8; x++) if (Math.hypot(x - cx, z - cz) < 6) land.used[idx(x, z)] = 1
  bridges(w, land); land.paint((x, z) => land.forest(x, z)); land.trees(o.forest, 1.1); w.addProp('signpost', v2w(cx) + 2.4, w.terrainH(v2w(cx) + 2.4, v2w(cz)), v2w(cz), .4, 0)
  w.spawn = spawnSafe(w, cx, cz); return land
}
export function spawnSafe(w: World, cx: number, cz: number) { for (let R = 0; R < 60; R++) for (let k = 0; k < 16; k++) { const a = k * .3927, x = v2w(Math.round(cx + Math.cos(a) * R)), z = v2w(Math.round(cz + Math.sin(a) * R)), y = w.terrainH(x, z); if (w.terrain!.water !== null && y < w.terrain!.water + .3) continue; if ([...w.props.values()].some(p => p.l === 0 && Math.hypot(p.x - x, p.z - z) < 1.4)) continue; return { x, y, z, yaw: Math.PI } } return { x: 0, y: 0, z: 0, yaw: 0 } }
export function genCastle(w: World, r: Rng, o: { biome: BiomeId; size: number; moat: boolean; under: number; theme: ThemeId; style: string; roofs: 'cone' | 'battlement' }) {
  const land = new Land(w, r, o.biome), cx = HALF, cz = HALF - 8; const hx = o.size, hz = Math.round(o.size * .9); land.flatten(cx - hx - 16, cz - hz - 16, cx + hx + 16, cz + hz + 26, 30); land.hills(8, 18)
  const c = castle(w, r, land, cx, cz, { size: o.size, style: o.style, moat: o.moat, under: o.under, theme: o.theme, roofs: o.roofs }); const gz = c.z1 + (o.moat ? 14 : 3); land.road([[cx, gz], [cx + r.int(-6, 6), gz + 14], [cx + r.int(-26, 26), N - 3]], 2, 1)
  if (r.chance(.8)) camp(w, r, land, cx + 18, gz + 14); land.paint((x, z) => land.forest(x, z)); land.trees(.8, .8, 900); return land
}
export function genVillage(w: World, r: Rng, o: { biome: BiomeId; size: number; river: boolean }) {
  const land = new Land(w, r, o.biome), cx = HALF, cz = HALF; land.flatten(cx - o.size - 4, cz - o.size - 4, cx + o.size + 4, cz + o.size + 4, 26); land.hills(6, 14)
  if (o.river) { const s = r.chance(.5) ? 1 : -1, off = o.size + 14; land.river([[cx - 96, cz + s * off], [cx, cz + s * (off + 3)], [cx + 96, cz + s * off]], 4) }
  village(w, r, land, cx, cz, { size: o.size, palisade: false }); for (let i = 0; i < 4; i++) { const a = r() * 6.28, d = o.size + 8; farm(w, r, land, Math.round(cx + Math.cos(a) * d) - 6, Math.round(cz + Math.sin(a) * d) - 4, r.int(9, 13), r.int(7, 9)) }
  land.paint((x, z) => land.forest(x, z)); land.trees(.8, .8, 900); bridges(w, land); return land
}
/** deck any road that runs into water */
export function bridges(w: World, land: Land) { const cells: [number, number][] = []; for (let z = 1; z < N - 1; z++) for (let x = 1; x < N - 1; x++) if (land.path[land.vi(x, z)] > .35 && w.floorAt(0, x, z) === 1 && w.terrainH(c2w(x), c2w(z)) < -.2 ) cells.push([x, z]); if (!cells.length) return; land.bridge(cells); const S = new Set(cells.map(c => idx(c[0], c[1]))); for (const [x, z] of cells) for (let d = 0; d < 4; d++) { const a = x + DIRS[d][0], b = z + DIRS[d][1]; if (!S.has(idx(a, b)) && w.terrainH(c2w(a), c2w(b)) < -.35) w.setEdge(0, x, z, d, E.Rail, 1) } }
export function genTower(w: World, r: Rng, o: { biome: BiomeId; theme: ThemeId }) { const land = new Land(w, r, o.biome), cx = HALF, cz = HALF; land.flatten(cx - 14, cz - 14, cx + 14, cz + 18, 24); land.hills(9, 20); wizardTower(w, r, land, cx, cz - 4, 4, o.biome === 'blight' ? 'stone_wall' : 'ashlar'); land.road([[cx, cz], [cx + 6, cz + 30], [cx - 10, N - 4]], 1.4, 1.2); stones(w, r, land, cx + 18, cz + 6, 6); entranceHut(w, r, land, cx - 20, cz + 4, 'mossy_wall', o.theme, 14, 2, { x0: HALF - 60, z0: HALF - 50, x1: HALF + 50, z1: HALF + 50 }, .25); for (let i = 0; i < 8; i++) { const a = i * .785 + .4; w.addProp(i % 2 ? 'crystal_purple' : 'crystal_blue', v2w(cx) + Math.cos(a) * 9, w.terrainH(v2w(cx), v2w(cz)), v2w(cz - 4) + Math.sin(a) * 9, a, 0, r.range(.6, 1.1)) } land.paint((x, z) => land.forest(x, z)); land.trees(.9, 1, 900); w.spawn = spawnSafe(w, cx, cz + 14) }
export function genRealm(w: World, r: Rng, o: { biome: BiomeId; theme: ThemeId }) {
  const land = new Land(w, r, o.biome); const flip = r.chance(.5) ? 1 : -1, X = (x: number) => HALF + (x - HALF) * flip
  const vx = X(52), vz = 132, kx = X(134), kz = 56, dx = X(140), dz = 140, sx = X(46), sz = 50
  land.flatten(vx - 32, vz - 32, vx + 32, vz + 32, 22); land.flatten(kx - 30, kz - 28, kx + 30, kz + 36, 22); land.flatten(dx - 6, dz - 8, dx + 8, dz + 8, 14); land.flatten(sx - 8, sz - 8, sx + 8, sz + 8, 14); land.flatten(X(84) - 7, 57, X(84) + 7, 70, 14); land.flatten(X(96) - 6, 134, X(96) + 6, 146, 12); land.hills(7, 14)
  land.river([[X(4), 84], [X(70), 96], [X(100), 104], [X(188), 100]], 4)
  const c = castle(w, r, land, kx, kz, { size: 20, style: r.pick(['ashlar', 'stone_wall']), moat: r.chance(.6), under: 10, theme: o.theme, roofs: r.pick(['cone', 'battlement']) })
  village(w, r, land, vx, vz, { size: 26, palisade: false }); const sp = w.spawn
  entranceHut(w, r, land, dx - 2, dz, 'mossy_wall', o.theme, 18, 2, { x0: Math.max(4, dx - 46), z0: 112, x1: Math.min(N - 5, dx + 46), z1: N - 5 }, .3)
  stones(w, r, land, sx, sz); camp(w, r, land, X(96), 140); { const rx = X(84) - 5; let ok = true; for (let z = 58; z <= 70; z++) for (let x = rx - 2; x <= rx + 11; x++) if (land.water(x, z)) ok = false; if (ok) ruin(w, r, land, rx, 60, 9, 8) }
  const gx = kx, gz = c.z1 + 15; land.road([[vx, vz - 6], [X(78), 112], [X(96), 92], [gx, Math.min(gz + 4, 96)], [gx, gz]], 2, 1); land.road([[vx + 6 * flip, vz], [X(100), 150], [dx, dz + 7]], 1.6, 1); land.road([[X(78), 110], [sx, sz + 8]], 1.3, 1)
  for (let i = 0; i < 4; i++) { const a = r() * 6.28; farm(w, r, land, Math.round(vx + Math.cos(a) * 34) - 6, Math.round(vz + Math.sin(a) * 34) - 4, 11, 8) }
  land.paint((x, z) => land.forest(x, z)); land.trees(.8, .8, 1200); bridges(w, land); w.spawn = sp; return land
}
