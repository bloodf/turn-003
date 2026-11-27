import type { P } from './state'
import type { Rnd } from './base'
export interface Cell extends P { k: string; ft: number; prev?: string; l: number }
/** what the rules need to know about the place they are played in */
export interface Env {
  rnd: Rnd
  pos(id: string): P | null
  yaw?(id: string): number
  place(id: string, p: P, yaw?: number): void
  los(a: P, b: P): boolean
  /** every cell within `ft` on foot. `block` stops movement, e.g. for enemies */
  flood(from: P, ft: number, block: (c: P) => boolean): Map<string, Cell>
  key(p: P): string
  dark?(p: P): boolean
  /** remember where everyone stands; the result puts them back */
  mark?(): () => void
  /** a transaction ended: tell the world who moved, or forget it */
  settle?(ok: boolean): void
}
export const FT = 1.5 / 5   // metres per foot
export const feet = (a: P, b: P) => { const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z), dy = Math.max(0, Math.abs(a.y - b.y) - 1.6); return Math.round(Math.max(dx, dz, dy) / 1.5 * 10) / 10 * 5 }
/** an empty field, for tests and simulations */
export class Arena implements Env {
  at = new Map<string, P>(); walls = new Set<string>()
  constructor(public rnd: Rnd, public size = 24) { }
  pos(id: string) { return this.at.get(id) ?? null }
  place(id: string, p: P) { this.at.set(id, { ...p }) }
  mark() { const m = new Map(this.at); return () => { this.at = m } }
  key(p: P) { return `${Math.floor(p.x / 1.5)},${Math.floor(p.z / 1.5)}` }
  los(a: P, b: P) { const n = Math.ceil(Math.hypot(a.x - b.x, a.z - b.z) / .5); for (let i = 1; i < n; i++) if (this.walls.has(this.key({ x: a.x + (b.x - a.x) * i / n, y: 0, z: a.z + (b.z - a.z) * i / n }))) return false; return true }
  flood(from: P, ft: number, block: (c: P) => boolean) {
    const out = new Map<string, Cell>(); const c0: Cell = { ...this.c(from), k: this.key(from), ft: 0, l: 0 }; out.set(c0.k, c0); const q = [c0]
    for (let h = 0; h < q.length; h++) { const c = q[h]; if (c.ft + 5 > ft) continue; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (a || b) { const p = { x: c.x + a * 1.5, y: 0, z: c.z + b * 1.5 }; const k = this.key(p); if (p.x < 0 || p.z < 0 || p.x > this.size * 1.5 || p.z > this.size * 1.5 || this.walls.has(k) || out.has(k) || block(p)) continue; const n: Cell = { ...p, k, ft: c.ft + 5, prev: c.k, l: 0 }; out.set(k, n); q.push(n) } } return out
  }
  private c(p: P): P { return { x: Math.floor(p.x / 1.5) * 1.5 + .75, y: 0, z: Math.floor(p.z / 1.5) * 1.5 + .75 } }
}
