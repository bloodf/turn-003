// The rules' view of a real world.
import { N, E as EDGE, FLAG, DIRS, c2w, w2c, isDoor, CELL, HALF, TERRAIN } from '../core/defs'
import { World, idx, inb } from '../core/world'
import { Nav, cellY, stand } from '../core/collide'
import { cryptoDie, type Rnd } from '../rules/base'
import type { Cell, Env } from '../rules/env'
import type { P } from '../rules/state'
export class WorldEnv implements Env {
  rnd: Rnd = cryptoDie; onPlace: (id: string, p: P, yaw?: number) => void = () => { }; locked: (key: string) => boolean = () => false; unseen: (key: string) => boolean = () => false
  constructor(public w: World, public nav: Nav) { }
  pos(id: string): P | null { const t = this.w.tokens.get(id); return t ? { x: t.x, y: t.y, z: t.z } : null }
  place(id: string, p: P, yaw?: number) { const t = this.w.tokens.get(id); if (t) { t.x = p.x; t.y = p.y; t.z = p.z; if (yaw !== undefined) t.r = yaw; if (this.held) this.held.push(() => this.onPlace(id, p, yaw)); else this.onPlace(id, p, yaw) } }
  private held: (() => void)[] | null = null
  mark() { const m = [...this.w.tokens.values()].map(t => [t, t.x, t.y, t.z, t.r] as const); this.held = []; return () => { for (const [t, x, y, z, r] of m) { t.x = x; t.y = y; t.z = z; t.r = r } } }
  settle(ok: boolean) { const h = this.held; this.held = null; if (ok && h) for (const f of h) f() }
  level(p: P) { return this.nav.levelOf(p.x, p.y + .05, p.z) }
  key(p: P) { return `${this.level(p)},${w2c(p.x)},${w2c(p.z)}` }
  dark(p: P) { const w = this.w, l = this.level(p); if (l < 0 || !w.terrain) return true; return w.env.time < 5.5 || w.env.time > 20 }
  /** straight sight on one storey; walls and shut doors stop it */
  los(a: P, b: P): boolean {
    const w = this.w; let l = this.level(a); const l2 = this.level(b); if (l !== l2) { if (Math.abs(a.y - b.y) > 2.6 || Math.hypot(a.x - b.x, a.z - b.z) > 8) return false; l = Math.min(l, l2) } const lv = w.levels.get(l); if (!lv) return l >= 1 && !!w.terrain
    const ox = a.x / CELL + HALF, oz = a.z / CELL + HALF, ex = b.x / CELL + HALF, ez = b.z / CELL + HALF; const L = Math.hypot(ex - ox, ez - oz); if (L < .8) return true; if (L > 100) return false; const dx = (ex - ox) / L, dz = (ez - oz) / L; let gx = Math.floor(ox), gz = Math.floor(oz); const tx0 = Math.floor(ex), tz0 = Math.floor(ez); const sx = Math.sign(dx), sz = Math.sign(dz), tdx = Math.abs(1 / dx), tdz = Math.abs(1 / dz); let tx = (sx > 0 ? gx + 1 - ox : ox - gx) * tdx, tz = (sz > 0 ? gz + 1 - oz : oz - gz) * tdz
    for (let s = 0; s < 260; s++) { if (gx === tx0 && gz === tz0) return true; if (Math.min(tx, tz) > L + .01) return true; const hz = tx < tz; const kx = hz && sx > 0 ? gx + 1 : gx, kz = !hz && sz > 0 ? gz + 1 : gz; if (!inb(kx, kz)) return false; const e = (hz ? lv.eW : lv.eN)[idx(kx, kz)], t = e & 15; if (t === EDGE.Wall || t === EDGE.Slit || t === EDGE.Window) return false; if (isDoor(t) && t !== EDGE.Cell && !w.doors.get(`${l},${kx},${kz},${hz ? 'W' : 'N'}`)) return false; if (hz) { gx += sx; tx += tdx } else { gz += sz; tz += tdz } if (!inb(gx, gz)) return false; if (!(gx === tx0 && gz === tz0) && !w.open(l, gx, gz)) return false } return true
  }
  step(l: number, x: number, z: number, d: number): [number, number, number] | null { const q = this.nav.passable(l, x, z, d); if (!q) return null; const t = this.w.etype(l, x, z, d); if (isDoor(t)) { const k = this.w.doorKey(l, x, z, d); if (!this.w.doors.get(k) && (this.locked(k) || (t === EDGE.Secret && this.unseen(k)))) return null } return q }
  flood(from: P, ft: number, block: (c: P) => boolean): Map<string, Cell> {
    const out = new Map<string, Cell>(), l0 = this.level(from), x0 = w2c(from.x), z0 = w2c(from.z); const mk = (l: number, x: number, z: number, f: number, prev?: string): Cell => ({ k: `${l},${x},${z}`, l, x: c2w(x), y: cellY(this.w, l, x, z), z: c2w(z), ft: f, prev }); const c0 = mk(l0, x0, z0, 0); out.set(c0.k, c0); let ring: [Cell, number, number, number][] = [[c0, l0, x0, z0]]; const max = Math.floor(ft / 5); let count = 0
    for (let n = 1; n <= max && ring.length && count < (ft >= 2000 ? 40000 : 9000); n++) { const next: typeof ring = []; const add = (l: number, x: number, z: number, prev: Cell) => { const k = `${l},${x},${z}`; if (out.has(k)) return; if (this.nav.blockedCell(l, x, z)) return; const f = this.w.flagAt(l, x, z); if (f & FLAG.lava) return; const c = mk(l, x, z, n * 5, prev.k); if (block(c)) return; out.set(k, c); next.push([c, l, x, z]); count++ }
      for (const [c, l, x, z] of ring) { const ways: ([number, number, number] | null)[] = []; for (let d = 0; d < 4; d++) { const q = this.step(l, x, z, d); ways.push(q); if (q) add(q[0], q[1], q[2], c) } for (let d = 0; d < 4; d++) { const a = ways[d], b = ways[(d + 1) % 4]; if (!a || !b || a[0] !== l || b[0] !== l) continue; const p = this.step(a[0], a[1], a[2], (d + 1) % 4), q = this.step(b[0], b[1], b[2], d); if (p && q && p[0] === l && p[1] === q[1] && p[2] === q[2]) add(p[0], p[1], p[2], c) } } ring = next }
    return out
  }
  inbounds(x: number, z: number) { return inb(x, z) && x < N }
  stand(l: number, x: number, z: number) { return stand(this.w, l, x, z) }
  terrain(p: P) { return this.w.floorAt(0, w2c(p.x), w2c(p.z)) === TERRAIN }
}
export { DIRS }
