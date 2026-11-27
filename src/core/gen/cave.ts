import { World, idx, inb, type Room } from '../world'
import { FL, FLAG, CEIL, HALF, c2w, THEMES, DIRS, N, type ThemeId } from '../defs'
import { makeRng, type Rng } from '../rng'
import { furnish } from './furnish'
import { nameAll } from './text'
import { type Cell, type Rect, newRoom } from './build'
export interface CaveOpts { size: number; theme: ThemeId; water: number; levels?: number }
/** one connected organic cavern inside a rectangle. `keep` cells are always open (stairs, doors). */
export function carveCave(w: World, r: Rng, l: number, R: Rect, theme: ThemeId, water: number, keep: Cell[] = []) {
  const W = R.x1 - R.x0 + 1, D = R.z1 - R.z0 + 1; const v = w.lv(l), th = THEMES[theme]; let g = new Uint8Array(W * D)
  const free = (u: number, q: number) => { const x = R.x0 + u, z = R.z0 + q; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if (!inb(x + a, z + b)) return false; const i = idx(x + a, z + b); if (v.floor[i] || v.flag[i]) return keep.some(k => k[0] === x + a && k[1] === z + b) } return true }
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) { const e = Math.max(Math.abs(x / (W - 1) * 2 - 1), Math.abs(z / (D - 1) * 2 - 1)); g[z * W + x] = r() < .60 - Math.max(0, e - .7) * 1.6 ? 1 : 0; if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) g[z * W + x] = 0 }
  for (let it = 0; it < 5; it++) { const q = new Uint8Array(W * D); for (let z = 1; z < D - 1; z++) for (let x = 1; x < W - 1; x++) { let n = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) n += g[(z + b) * W + x + a]; q[z * W + x] = n >= 5 ? 1 : 0 } g = q }
  for (const [x, z] of keep) { const u = x - R.x0, q = z - R.z0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (u + a >= 0 && q + b >= 0 && u + a < W && q + b < D) g[(q + b) * W + u + a] = 1 }
  for (let z = 0; z < D; z++) for (let x = 0; x < W; x++) if (g[z * W + x] && !free(x, z)) g[z * W + x] = 0
  // no diagonal-only contacts
  for (let z = 0; z < D - 1; z++) for (let x = 0; x < W - 1; x++) { const a = g[z * W + x], b = g[z * W + x + 1], c = g[(z + 1) * W + x], d = g[(z + 1) * W + x + 1]; if (a && d && !b && !c) g[z * W + x + 1] = free(x + 1, z) ? 1 : 0; if (b && c && !a && !d) g[z * W + x] = free(x, z) ? 1 : 0 }
  // regions
  const lab = new Int32Array(W * D); let n = 0; const regs: number[][] = []
  for (let i = 0; i < W * D; i++) if (g[i] && !lab[i]) { n++; const st = [i], o: number[] = []; lab[i] = n; while (st.length) { const k = st.pop()!; o.push(k); const x = k % W, z = (k / W) | 0; for (const [a, b] of DIRS) { const u = x + a, q = z + b; if (u < 0 || q < 0 || u >= W || q >= D) continue; const j = q * W + u; if (g[j] && !lab[j]) { lab[j] = n; st.push(j) } } } regs.push(o) }
  regs.sort((a, b) => b.length - a.length); for (const o of regs.slice(1)) if (o.length < 12 && !keep.some(k => o.includes((k[1] - R.z0) * W + k[0] - R.x0))) for (const i of o) g[i] = 0
  const big = regs.filter((o, i) => i === 0 || o.some(k => g[k])); const tied = big.length ? [big[0]] : []
  for (let i = 1; i < big.length; i++) {
    let best: [number, number] | null = null, bd = 1e9; const pool = tied.flat(); for (let t = 0; t < 900; t++) { const a = r.pick(big[i]), b = r.pick(pool); const k = (a % W - b % W) ** 2 + (((a / W) | 0) - ((b / W) | 0)) ** 2; if (k < bd) { bd = k; best = [a, b] } }
    let x = best![0] % W, z = (best![0] / W) | 0; const tx = best![1] % W, tz = (best![1] / W) | 0; let guard = 0; let ok = true; const dug: number[] = []
    while ((x !== tx || z !== tz) && guard++ < 400) { if (r.chance(.2)) { if (r.chance(.5)) x += r.chance(.5) ? 1 : -1; else z += r.chance(.5) ? 1 : -1 } else if (Math.abs(tx - x) > Math.abs(tz - z)) x += Math.sign(tx - x); else z += Math.sign(tz - z); x = Math.max(1, Math.min(W - 3, x)); z = Math.max(1, Math.min(D - 3, z)); for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { if (free(x + a, z + b)) { dug.push((z + b) * W + x + a) } else if (!g[(z + b) * W + x + a]) ok = ok && a + b > 0 } }
    for (const k of dug) g[k] = 1; void ok; tied.push(big[i])
  }
  // final: keep only what is connected to the biggest (or to keep cells)
  const st: number[] = []; const seen = new Uint8Array(W * D); const s0 = keep.length ? (keep[0][1] - R.z0) * W + keep[0][0] - R.x0 : big[0]?.[0]; if (s0 === undefined) return []; st.push(s0); seen[s0] = 1; g[s0] = 1
  while (st.length) { const k = st.pop()!, x = k % W, z = (k / W) | 0; for (const [a, b] of DIRS) { const u = x + a, q = z + b; if (u < 0 || q < 0 || u >= W || q >= D) continue; const j = q * W + u; if (g[j] && !seen[j]) { seen[j] = 1; st.push(j) } } }
  const cells: Cell[] = []; for (let i = 0; i < W * D; i++) if (seen[i]) { const x = R.x0 + i % W, z = R.z0 + ((i / W) | 0); const k = idx(x, z); if (v.floor[k] && keep.some(c => c[0] === x && c[1] === z)) { cells.push([x, z]); continue } v.floor[k] = FL[th.rock]; v.ceil[k] = CEIL.rock; v.flag[k] = FLAG.cave; v.h[k] = 0; cells.push([x, z]) }
  // split into chambers by distance to rock
  const open = new Set(cells.map(c => idx(c[0], c[1]))), dist = new Map<number, number>(); let q: number[] = []
  for (const k of open) { const x = k % N, z = (k / N) | 0; if (DIRS.some(([a, b]) => !open.has(idx(x + a, z + b)))) { dist.set(k, 1); q.push(k) } }
  while (q.length) { const nx: number[] = []; for (const k of q) { const x = k % N, z = (k / N) | 0; for (const [a, b] of DIRS) { const j = idx(x + a, z + b); if (open.has(j) && !dist.has(j)) { dist.set(j, dist.get(k)! + 1); nx.push(j) } } } q = nx }
  const peaks = [...dist.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]); const cores: number[] = []; for (const [k, d] of peaks) { if (d < 3 && cores.length) break; const x = k % N, z = (k / N) | 0; if (cores.every(c => Math.hypot(c % N - x, ((c / N) | 0) - z) > 8)) cores.push(k); if (cores.length > 40) break }
  const owner = new Map<number, number>(); let fr = cores.map((c, i) => { owner.set(c, i); return c }); while (fr.length) { const nx: number[] = []; for (const k of fr) { const x = k % N, z = (k / N) | 0; for (const [a, b] of DIRS) { const j = idx(x + a, z + b); if (open.has(j) && !owner.has(j)) { owner.set(j, owner.get(k)!); nx.push(j) } } } fr = nx }
  const rooms: Room[] = []; const groups = cores.map(() => [] as Cell[]); for (const [k, i] of owner) groups[i].push([k % N, (k / N) | 0])
  groups.forEach((cs, i) => { if (!cs.length) return; const t = r.weighted([['cave', 3], ['crystal', 1.4], ['fungus', 1.3], ['nest', .7], ['cavecamp', .8], ['mine', .7]] as const); const q = newRoom(w, l, cs, t, theme, i); for (const [x, z] of cs) v.room[idx(x, z)] = q.id; rooms.push(q) })
  // lakes
  for (const q of rooms) if (r.chance(water)) { const cs = w.roomCells(q); const mid = cs.filter(([x, z]) => (dist.get(idx(x, z)) ?? 0) >= 3); if (mid.length > 5) { const liq = th.liquid === 'lava' ? FLAG.lava : FLAG.water; for (const [x, z] of mid) { const k = idx(x, z); if (keep.some(c => Math.hypot(c[0] - x, c[1] - z) < 4)) continue; v.flag[k] |= liq; v.h[k] = -4 } } }
  return rooms
}
export function genCave(w: World, r: Rng, o: CaveOpts) {
  const s = o.size; const R = { x0: HALF - s, z0: HALF - s, x1: HALF + s - 1, z1: HALF + s - 1 }; const rooms = carveCave(w, r, -1, R, o.theme, o.water)
  for (const q of rooms) furnish(w, q, r); nameAll(w, r)
  let best: Cell | null = null, bz = -1; for (const q of rooms) for (const [x, z] of w.roomCells(q)) { const k = w.flagAt(-1, x, z); if (!(k & (FLAG.water | FLAG.lava)) && z > bz && DIRS.every(([a, b]) => w.open(-1, x + a, z + b))) { bz = z; best = [x, z] } }
  if (best) { w.spawn = { x: c2w(best[0]), y: -4, z: c2w(best[1]), yaw: Math.PI }; const q = w.roomAt(-1, best[0], best[1]); if (q) { for (const p of [...w.props.values()]) if (Math.hypot(p.x - w.spawn.x, p.z - w.spawn.z) < 1.4 && !p.m.startsWith('stalac')) w.props.delete(p.id) } }
  return rooms
}
void makeRng
