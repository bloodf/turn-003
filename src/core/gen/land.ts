import { World, VT, idx, inb } from '../world'
import { N, HALF, CELL, TERRAIN, BIOMES, FLAG, c2w, v2w, w2c, type BiomeId } from '../defs'
import { fbm, vnoise, type Rng } from '../rng'
export class Land {
  flat = new Float32Array(VT); used = new Uint8Array(N * N); path = new Float32Array(VT); seed: number; riverPts: [number, number][] = []
  constructor(public w: World, public r: Rng, public biome: BiomeId) { w.ensureTerrain(); w.env = { ...w.env, biome }; this.seed = r.int(1, 99999) }
  vi(x: number, z: number) { return z * (N + 1) + x }
  /** reserve a disc or rect as level ground */
  flatten(x0: number, z0: number, x1: number, z1: number, fall = 10) { for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) { const dx = Math.max(x0 - x, 0, x - x1), dz = Math.max(z0 - z, 0, z - z1), d = Math.hypot(dx, dz); if (d < fall) { const t = d < 2 ? 1 : 1 - (d - 2) / (fall - 2); const i = this.vi(x, z); this.flat[i] = Math.max(this.flat[i], t * t * (3 - 2 * t)) } } }
  use(x0: number, z0: number, x1: number, z1: number, v = 1) { for (let z = Math.max(0, z0); z <= Math.min(N - 1, z1); z++) for (let x = Math.max(0, x0); x <= Math.min(N - 1, x1); x++) this.used[idx(x, z)] = Math.max(this.used[idx(x, z)], v) }
  free(x0: number, z0: number, x1: number, z1: number) { if (x0 < 3 || z0 < 3 || x1 > N - 4 || z1 > N - 4) return false; for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) if (this.used[idx(x, z)]) return false; return true }
  hills(amp = 5, rim = 14) {
    const t = this.w.terrain!, s = this.seed
    for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) {
      const i = this.vi(x, z), e = Math.max(Math.abs(x / N * 2 - 1), Math.abs(z / N * 2 - 1)); const n = fbm(x * .028, z * .028, s, 4), m = fbm(x * .09, z * .09, s + 7, 3)
      let h = Math.max(0, (n - .40)) * amp * 2.2 + (m - .5) * .9; const k = Math.max(0, (e - .72) / .28); h += k * k * rim * (.45 + fbm(x * .05, z * .05, s + 31, 4) * 1.1)
      h = h * (1 - this.flat[i]); t.h[i] = this.flat[i] > .985 ? 0 : Math.max(-.15, h)
    }
  }
  road(pts: [number, number][], width = 2.2, wob = 1.4) {
    const P: [number, number][] = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = pts[i], [c, d] = pts[i + 1], L = Math.hypot(c - a, d - b), n = Math.ceil(L); for (let k = 0; k <= n; k++) { const t = k / n, w = Math.sin(t * Math.PI) * (fbm((a + t * L) * .06, i * 9.1 + b * .06, this.seed + 3, 2) - .5) * 2 * wob * Math.min(6, L / 6); P.push([a + (c - a) * t - (d - b) / L * w, b + (d - b) * t + (c - a) / L * w]) } }
    const t = this.w.terrain!
    for (const [px, pz] of P) for (let z = Math.floor(pz - width - 3); z <= pz + width + 3; z++) for (let x = Math.floor(px - width - 3); x <= px + width + 3; x++) { if (x < 0 || z < 0 || x > N || z > N) continue; const d = Math.hypot(x - px, z - pz), i = this.vi(x, z); const k = Math.max(0, Math.min(1, (width + .8 - d) / 1.4)); if (k > this.path[i]) this.path[i] = k; if (d < width && x < N && z < N) this.used[idx(x, z)] = Math.max(1, this.used[idx(x, z)]) }
    // smooth along the road so carts could use it
    for (let it = 0; it < 6; it++) { const H = t.h.slice(); for (let z = 1; z < N; z++) for (let x = 1; x < N; x++) { const i = this.vi(x, z); if (this.path[i] > .05 && this.flat[i] < .98) t.h[i] = H[i] + ((H[i - 1] + H[i + 1] + H[i - N - 1] + H[i + N + 1]) / 4 - H[i]) * this.path[i] } }
    return P
  }
  river(pts: [number, number][], width = 4.5, depth = 2.0) {
    const t = this.w.terrain!; t.water = -.55; const P: [number, number][] = []
    for (let i = 0; i < pts.length - 1; i++) { const [a, b] = pts[i], [c, d] = pts[i + 1], L = Math.hypot(c - a, d - b), n = Math.ceil(L); for (let k = 0; k <= n; k++) { const q = k / n, o = (fbm((i * 40 + k) * .05, 3.7, this.seed + 5, 3) - .5) * 16 * Math.sin(q * Math.PI); P.push([a + (c - a) * q - (d - b) / L * o, b + (d - b) * q + (c - a) / L * o]) } }
    this.riverPts = P
    const carve = new Float32Array(VT).fill(99)
    for (const [px, pz] of P) for (let z = Math.floor(pz - 22); z <= pz + 22; z++) for (let x = Math.floor(px - 22); x <= px + 22; x++) { if (x < 0 || z < 0 || x > N || z > N) continue; const i = this.vi(x, z), d = Math.hypot(x - px, z - pz); if (d < carve[i]) carve[i] = d }
    for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) { const i = this.vi(x, z), d = carve[i]; if (d > 20) continue; const wv = width * (.8 + fbm(x * .07, z * .07, this.seed + 9, 2) * .5); if (d < wv + 1.4) { t.h[i] = d < wv ? -depth * Math.min(1, (wv - d) / 1.6 + .35) : -.25; if (x < N && z < N) this.used[idx(x, z)] = 3 } else { const k = Math.min(1, (d - wv - 1.4) / 9); t.h[i] = t.h[i] * k * k * (3 - 2 * k) } }
    return P
  }
  moat(x0: number, z0: number, x1: number, z1: number, a: number, b: number, depth = 2.2) { const t = this.w.terrain!; t.water = -.55; for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) { const dx = Math.max(x0 - x, 0, x - x1), dz = Math.max(z0 - z, 0, z - z1), d = Math.hypot(dx, dz); if (d > a && d < b) { const m = Math.min(d - a, b - d); t.h[this.vi(x, z)] = -Math.min(depth, m * 1.6); if (x < N && z < N) this.used[idx(x, z)] = 3 } } }
  water(x: number, z: number) { return this.w.terrain!.water !== null && this.w.terrainH(v2w(x), v2w(z)) < this.w.terrain!.water! + .15 }
  paint(forest: (x: number, z: number) => number) {
    const t = this.w.terrain!
    for (let z = 0; z <= N; z++) for (let x = 0; x <= N; x++) {
      const i = this.vi(x, z), hx = t.h[this.vi(Math.min(N, x + 1), z)] - t.h[this.vi(Math.max(0, x - 1), z)], hz = t.h[this.vi(x, Math.min(N, z + 1))] - t.h[this.vi(x, Math.max(0, z - 1))], sl = Math.hypot(hx, hz) / 3
      let rock = Math.max(0, Math.min(1, (sl - .42) * 3.2)), p = this.path[i] * (.75 + .5 * vnoise(x * .7, z * .7, 3)), f = forest(x, z); const under = t.water !== null && t.h[i] < t.water + .25 ? 1 : 0
      if (under) { p = Math.max(p, .85) } const nse = vnoise(x * .33, z * .33, this.seed); f = Math.max(0, Math.min(1, f * 1.1 + (nse - .6) * .5)); p = Math.min(1, p); rock *= 1 - p
      const g = Math.max(0, 1 - p - rock); t.w[i * 4] = 255 * g * (1 - f); t.w[i * 4 + 1] = 255 * g * f; t.w[i * 4 + 2] = 255 * p; t.w[i * 4 + 3] = 255 * rock
    }
  }
  forest(x: number, z: number) { return Math.max(0, Math.min(1, (fbm(x * .035, z * .035, this.seed + 77, 3) - .46) * 5)) * Math.max(0, 1 - this.flat[this.vi(Math.min(N, Math.max(0, Math.round(x))), Math.min(N, Math.max(0, Math.round(z))))] * 1.15) }
  trees(dens: number, scatter = 1, maxN = 1400) {
    const B = BIOMES[this.biome], { w, r } = this; let n = 0; const cells: [number, number][] = []; for (let z = 4; z < N - 4; z++) for (let x = 4; x < N - 4; x++) cells.push([x, z]); r.shuffle(cells)
    const near = (x: number, z: number, k: number) => { for (let a = -k; a <= k; a++) for (let b = -k; b <= k; b++) if (inb(x + a, z + b) && (this.used[idx(x + a, z + b)])) return true; return false }
    for (const [x, z] of cells) {
      if (w.floorAt(0, x, z) !== TERRAIN || this.used[idx(x, z)]) continue; const f = this.forest(x, z); const e = Math.max(Math.abs(x / N * 2 - 1), Math.abs(z / N * 2 - 1)); const p = (f * .15 + (e > .8 ? .03 : .004)) * dens
      const wx = c2w(x) + r.range(-.6, .6), wz = c2w(z) + r.range(-.6, .6), y = w.terrainH(wx, wz); if (w.terrain!.water !== null && y < w.terrain!.water + .3) { if (r.chance(.06 * scatter) && y > w.terrain!.water - .5) w.addProp('reeds', wx, y, wz, r() * 6, 0, r.range(.7, 1.2)); continue }
      if (n < maxN && r.chance(p) && !near(x, z, 1)) { w.addProp(r.weighted(B.trees), wx, y - .05, wz, r() * 6.283, 0, r.range(.8, 1.25)); this.used[idx(x, z)] = 2; n++ }
      else if (r.chance((.006 + f * .045) * scatter)) { const m = r.weighted(B.scatter); w.addProp(m, wx, y - (m.startsWith('boulder') ? .12 : .02), wz, r() * 6.283, 0, r.range(.75, 1.25)); if (m.startsWith('boulder')) this.used[idx(x, z)] = 2 }
    }
    return n
  }
  /** bridge cells across water along a direction, from a to b */
  bridge(cells: [number, number][]) { const v = this.w.lv(0); for (const [x, z] of cells) { const i = idx(x, z); v.floor[i] = 19; v.h[i] = 1; v.flag[i] = FLAG.bridge; v.ceil[i] = 0; this.used[i] = 3 } }
}
void HALF; void CELL; void w2c
