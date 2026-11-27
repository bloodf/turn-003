import { World, idx } from './world'
import { CELL, HALF, FLAG, N } from './defs'
import { vnoise } from './rng'
/** signed openness of rock at a point: > 0 is air. Shared by mesher, collision and light so they always agree. */
export function caveD(w: World, l: number, x: number, z: number) {
  const v = w.levels.get(l); if (!v) return -1
  const fx = x / CELL + HALF - .5, fz = z / CELL + HALF - .5, xi = Math.floor(fx), zi = Math.floor(fz), u = fx - xi, t = fz - zi
  const o = (a: number, b: number) => { if (a < 0 || b < 0 || a >= N || b >= N) return 0; const i = idx(a, b), f = v.flag[i]; return (v.floor[i] || f & FLAG.hole) && !(f & FLAG.solid) ? 1 : 0 }
  const a = o(xi, zi), b = o(xi + 1, zi), c = o(xi, zi + 1), d = o(xi + 1, zi + 1); const s = a + b + c + d
  const base = s === 0 ? 0 : s === 4 ? 1 : (a * (1 - u) + b * u) * (1 - t) + (c * (1 - u) + d * u) * t
  if (s === 0) return -.5
  return base - .5 + ((vnoise(x * .85, z * .85, 11 + l) - .5) * .36 + (vnoise(x * 2.2, z * 2.2, 5 + l) - .5) * .16) * (s === 4 ? 0 : 1) * (base > .97 ? (1 - base) / .03 : 1)
}
/** floor height inside a cave: cell heights blended so pool banks slope */
export function caveFloor(w: World, l: number, x: number, z: number) {
  const v = w.levels.get(l)!; const fx = x / CELL + HALF - .5, fz = z / CELL + HALF - .5, xi = Math.floor(fx), zi = Math.floor(fz), u = fx - xi, t = fz - zi
  const h = (a: number, b: number) => { if (a < 0 || b < 0 || a >= N || b >= N) return 0; return v.h[idx(a, b)] * .25 }
  const s = (k: number) => k * k * (3 - 2 * k), us = s(u), ts = s(t)
  return l * 4 + (h(xi, zi) * (1 - us) + h(xi + 1, zi) * us) * (1 - ts) + (h(xi, zi + 1) * (1 - us) + h(xi + 1, zi + 1) * us) * ts
}
