export type Rng = (() => number) & { int(a: number, b: number): number; pick<T>(a: readonly T[]): T; chance(p: number): boolean; range(a: number, b: number): number; shuffle<T>(a: T[]): T[]; weighted<T>(a: readonly (readonly [T, number])[]): T; gauss(): number }
export function hashStr(s: string) { let h = 1779033703 ^ s.length; for (let i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19) } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0 }
export function makeRng(seed: number | string): Rng {
  let a = (typeof seed === 'string' ? hashStr(seed) : seed) >>> 0
  const f = (() => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }) as Rng
  f.int = (x, y) => x + Math.floor(f() * (y - x + 1))
  f.pick = a => a[Math.floor(f() * a.length)]
  f.chance = p => f() < p
  f.range = (x, y) => x + f() * (y - x)
  f.shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]] } return arr }
  f.weighted = arr => { let s = 0; for (const e of arr) s += e[1]; let r = f() * s; for (const e of arr) { r -= e[1]; if (r <= 0) return e[0] } return arr[arr.length - 1][0] }
  f.gauss = () => { let u = 0, v = 0; while (!u) u = f(); while (!v) v = f(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v) }
  return f
}
const A = 'amber ash barrow black bone bright broken crimson dire dread ember elder fallen frost gilded glimmer gloom grim hollow iron ivory lost moon night oak old raven red rune salt shadow silent silver stone storm sunken thorn umber wyrm'.split(' ')
const B = 'anvil bastion candle cairn chalice cradle crown crypt deep delve dirge fang forge gate grave hall hearth hold keep lantern maw mire oath pit reach rest ridge shrine spire tomb tower vault vigil ward watch well'.split(' ')
export function wordSeed(r: () => number = Math.random) { const p = (x: string[]) => x[Math.floor(r() * x.length)]; return `${p(A)}-${p(B)}-${100 + Math.floor(r() * 900)}` }
// hash noise, deterministic
function h2(x: number, y: number, s: number) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 2147483647 ^ 0x5bd1e995); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
export function vnoise(x: number, y: number, s = 0) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10); const a = h2(xi, yi, s), b = h2(xi + 1, yi, s), c = h2(xi, yi + 1, s), d = h2(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v }
export function fbm(x: number, y: number, s = 0, o = 4) { let a = 0.5, f = 1, r = 0, n = 0; for (let i = 0; i < o; i++) { r += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= 0.5; f *= 2.03 } return r / n }
export function hash3(x: number, y: number, z: number) { return h2(x, y, z) }
