import { N, E, FLAG, CELL, HALF, LH, TERRAIN, type ThemeId, type BiomeId, w2c } from './defs'
export const NN = N * N
export class Level {
  floor = new Uint8Array(NN); ceil = new Uint8Array(NN); eN = new Uint8Array(NN); eW = new Uint8Array(NN)
  h = new Int8Array(NN); flag = new Uint8Array(NN); room = new Uint16Array(NN)
  constructor(public l: number) { }
  clone() { const c = new Level(this.l); c.floor.set(this.floor); c.ceil.set(this.ceil); c.eN.set(this.eN); c.eW.set(this.eW); c.h.set(this.h); c.flag.set(this.flag); c.room.set(this.room); return c }
  arrays() { return [this.floor, this.ceil, this.eN, this.eW, this.h, this.flag, this.room] as const }
}
export interface Prop { id: number; m: string; x: number; y: number; z: number; r: number; s: number; l: number; t?: string }
export interface Stair { id: number; l: number; x: number; z: number; dir: number; kind: 'stone' | 'wood' }       // x,z = grid vertex-centred low end, see footprint()
export interface Spiral { id: number; l0: number; l1: number; x: number; z: number; a: number }                    // world centre; climbs from l0 to l1
export interface Ring { id: number; x: number; z: number; r: number; t: number; l0: number; l1: number; style: string; top: 'battlement' | 'cone' | 'none'; roof: string; open: { l: number; a: number; w: number; k?: 'door' | 'slit' }[]; floor: string; hole: number }
export interface Roof { id: number; x0: number; z0: number; x1: number; z1: number; y: number; l: number; axis: 0 | 1; pitch: number; mat: string; kind: 'gable' | 'hip' | 'pyramid' | 'shed'; gable: string }
export interface Room { id: number; l: number; type: string; name: string; x0: number; z0: number; x1: number; z1: number; desc: string; notes: string; depth: number; theme: ThemeId }
export interface Terrain { h: Float32Array; w: Uint8Array; water: number | null }
export interface Env { theme: ThemeId; biome: BiomeId; time: number; fogMul: number; ambMul: number; grass: number; weather: 'clear' | 'rain' | 'snow' | 'fog' }
export interface Token { id: string; m: string; name: string; x: number; y: number; z: number; r: number; hp: number; max: number; side: 'hero' | 'foe' | 'npc'; hidden?: boolean; owner?: string; init?: number | null; note?: string; size?: number; cond?: string[] }
export interface Meta { id: string; name: string; seed: string; kind: string; made: number; edited: number; v: number }
export const VT = (N + 1) * (N + 1)
export const idx = (x: number, z: number) => z * N + x
export const inb = (x: number, z: number) => x >= 0 && z >= 0 && x < N && z < N

export class World {
  meta: Meta; levels = new Map<number, Level>(); props = new Map<number, Prop>(); stairs = new Map<number, Stair>(); spirals = new Map<number, Spiral>()
  rings = new Map<number, Ring>(); roofs = new Map<number, Roof>(); rooms = new Map<number, Room>(); doors = new Map<string, number>(); tokens = new Map<string, Token>()
  terrain: Terrain | null = null; env: Env; spawn = { x: 0, y: 0, z: 0, yaw: 0 }; nid = 1; /** the campaign being played here, if any (see rules/state) */ game: any = null
  constructor(name = 'Unnamed Realm', seed = 'seed', kind = 'blank') {
    this.meta = { id: Math.random().toString(36).slice(2, 10), name, seed, kind, made: Date.now(), edited: Date.now(), v: 1 }
    this.env = { theme: 'stone', biome: 'temperate', time: 15, fogMul: 1, ambMul: 1, grass: 1, weather: 'clear' }
  }
  lv(l: number) { let v = this.levels.get(l); if (!v) { v = new Level(l); this.levels.set(l, v) } return v }
  has(l: number) { return this.levels.has(l) }
  range() { const k = [...this.levels.keys()]; return k.length ? { min: Math.min(...k), max: Math.max(...k) } : { min: 0, max: 0 } }
  floorAt(l: number, x: number, z: number) { if (!inb(x, z)) return 0; const v = this.levels.get(l); return v ? v.floor[idx(x, z)] : 0 }
  flagAt(l: number, x: number, z: number) { if (!inb(x, z)) return 0; const v = this.levels.get(l); return v ? v.flag[idx(x, z)] : 0 }
  /** a cell someone could occupy or see into */
  open(l: number, x: number, z: number) { if (!inb(x, z)) return false; const v = this.levels.get(l); if (!v) return l >= 1 && !!this.terrain; const i = idx(x, z), f = v.flag[i]; if (f & FLAG.solid) return false; return v.floor[i] !== 0 || (f & FLAG.hole) !== 0 || (l >= 1 && !!this.terrain) }
  /** edge between (x,z) and its neighbour in direction d */
  edge(l: number, x: number, z: number, d: number) {
    if (d === 0) { x += 1; d = 2 } else if (d === 1) { z += 1; d = 3 }
    if (!inb(x, z)) return 0; const v = this.levels.get(l); if (!v) return 0; return (d === 2 ? v.eW : v.eN)[idx(x, z)]
  }
  etype(l: number, x: number, z: number, d: number) { return this.edge(l, x, z, d) & 15 }
  setEdge(l: number, x: number, z: number, d: number, type: number, style = 0) {
    if (d === 0) { x += 1; d = 2 } else if (d === 1) { z += 1; d = 3 }
    if (!inb(x, z)) return; const v = this.lv(l); (d === 2 ? v.eW : v.eN)[idx(x, z)] = type === 0 ? 0 : (type & 15) | (style << 4)
  }
  doorKey(l: number, x: number, z: number, d: number) { if (d === 0) { x += 1; d = 2 } else if (d === 1) { z += 1; d = 3 } return `${l},${x},${z},${d === 2 ? 'W' : 'N'}` }
  doorOpen(l: number, x: number, z: number, d: number) { return !!this.doors.get(this.doorKey(l, x, z, d)) }
  addProp(m: string, x: number, y: number, z: number, r = 0, l = 0, s = 1, t?: string) { const p: Prop = { id: this.nid++, m, x, y, z, r, s, l }; if (t) p.t = t; this.props.set(p.id, p); return p }
  nextRoom() { let i = 1; while (this.rooms.has(i)) i++; return i }
  addRoom(r: Partial<Room> & { l: number; type: string; x0: number; z0: number; x1: number; z1: number }): Room { const id = this.nextRoom(); const q: Room = { id, name: '', desc: '', notes: '', depth: 0, theme: this.env.theme, ...r }; this.rooms.set(id, q); return q }
  roomCells(r: Room) { const out: [number, number][] = []; const v = this.levels.get(r.l); if (!v) return out; for (let z = r.z0; z <= r.z1; z++) for (let x = r.x0; x <= r.x1; x++) if (v.room[idx(x, z)] === r.id) out.push([x, z]); return out }
  roomAt(l: number, x: number, z: number) { if (!inb(x, z)) return undefined; const v = this.levels.get(l); return v ? this.rooms.get(v.room[idx(x, z)]) : undefined }
  ensureTerrain() { if (!this.terrain) { const w = new Uint8Array(VT * 4); for (let i = 0; i < VT; i++) w[i * 4] = 255; this.terrain = { h: new Float32Array(VT), w, water: null }; const v = this.lv(0); for (let i = 0; i < NN; i++) if (!v.floor[i]) v.floor[i] = TERRAIN } return this.terrain }
  terrainH(x: number, z: number) { const t = this.terrain; if (!t) return 0; const fx = Math.max(0, Math.min(N - 1e-4, x / CELL + HALF)), fz = Math.max(0, Math.min(N - 1e-4, z / CELL + HALF)), xi = fx | 0, zi = fz | 0, u = fx - xi, v = fz - zi, k = zi * (N + 1) + xi, a = t.h[k], b = t.h[k + 1], c = t.h[k + N + 1], d = t.h[k + N + 2]; return u + v < 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v) }
  /** cells covered by a straight stair, low end first */
  static stairCells(s: Stair) { const out: [number, number, number][] = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const [x, z] = s.dir === 0 ? [s.x + i, s.z + j] : s.dir === 2 ? [s.x - 1 - i, s.z + j] : s.dir === 1 ? [s.x + j, s.z + i] : [s.x + j, s.z - 1 - i]; out.push([x, z, i]) } return out }
  static stairPose(s: Stair) { const cx = s.dir === 1 || s.dir === 3 ? s.x + 1 : s.x, cz = s.dir === 0 || s.dir === 2 ? s.z + 1 : s.z; return { x: (cx - HALF) * CELL, z: (cz - HALF) * CELL, dx: [1, 0, -1, 0][s.dir], dz: [0, 1, 0, -1][s.dir] } }
  bounds() { let x0 = N, z0 = N, x1 = -1, z1 = -1; for (const v of this.levels.values()) { const skipT = v.l === 0 && !!this.terrain; for (let z = 0; z < N; z++) for (let x = 0; x < N; x++) { const f = v.floor[idx(x, z)]; if (f && !(skipT && f === TERRAIN)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z } } } if (x1 < 0) return { x0: HALF - 8, z0: HALF - 8, x1: HALF + 8, z1: HALF + 8 }; return { x0, z0, x1, z1 } }
  // ------------------------------------------------------------- save / load
  header() { return { meta: this.meta, env: this.env, spawn: this.spawn, nid: this.nid, levels: [...this.levels.keys()], props: [...this.props.values()].map(p => [p.id, p.m, rnd(p.x), rnd(p.y), rnd(p.z), rnd(p.r), rnd(p.s), p.l, p.t ?? 0]), stairs: [...this.stairs.values()], spirals: [...this.spirals.values()], rings: [...this.rings.values()], roofs: [...this.roofs.values()], rooms: [...this.rooms.values()], doors: [...this.doors], tokens: [...this.tokens.values()], terrain: this.terrain ? { water: this.terrain.water } : null, game: this.game ?? undefined, n: N } }
  toBytes(): Uint8Array<ArrayBuffer> {
    const head = new TextEncoder().encode(JSON.stringify(this.header())); const parts: Uint8Array[] = []
    for (const v of this.levels.values()) for (const a of v.arrays()) parts.push(new Uint8Array(a.buffer, a.byteOffset, a.byteLength))
    if (this.terrain) { const q = new Int16Array(VT); for (let i = 0; i < VT; i++) q[i] = Math.round(this.terrain.h[i] * 500); parts.push(new Uint8Array(q.buffer), this.terrain.w) }
    let n = 8 + head.length; for (const p of parts) n += p.length; const out = new Uint8Array(n); const dv = new DataView(out.buffer); dv.setUint32(0, 0x31575252, true); dv.setUint32(4, head.length, true); out.set(head, 8); let o = 8 + head.length; for (const p of parts) { out.set(p, o); o += p.length } return out
  }
  static fromBytes(b: Uint8Array): World {
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength); if (b.length < 8 || dv.getUint32(0, true) !== 0x31575252) throw new Error('This is not a Realmwright world file.'); const hl = dv.getUint32(4, true); const H = JSON.parse(new TextDecoder().decode(b.subarray(8, 8 + hl))); if (H.n !== N) throw new Error('This world was made by an incompatible version.')
    const w = new World(); w.meta = H.meta; w.env = H.env; w.spawn = H.spawn; w.nid = H.nid; w.game = H.game ?? null; let o = 8 + hl
    for (const l of H.levels) { const v = w.lv(l); for (const a of v.arrays()) { new Uint8Array(a.buffer, a.byteOffset, a.byteLength).set(b.subarray(o, o + a.byteLength)); o += a.byteLength } }
    for (const p of H.props) { const q: Prop = { id: p[0], m: p[1], x: p[2], y: p[3], z: p[4], r: p[5], s: p[6], l: p[7] }; if (p[8]) q.t = p[8]; w.props.set(q.id, q) }
    for (const k of ['stairs', 'spirals', 'rings', 'roofs', 'rooms', 'tokens'] as const) for (const v of H[k]) (w[k] as Map<any, any>).set(v.id, v)
    w.doors = new Map(H.doors)
    if (H.terrain) { const q = new Int16Array(b.slice(o, o + VT * 2).buffer); o += VT * 2; const h = new Float32Array(VT); for (let i = 0; i < VT; i++) h[i] = q[i] / 500; w.terrain = { h, w: b.slice(o, o + VT * 4), water: H.terrain.water } }
    return w
  }
}
const rnd = (v: number) => Math.round(v * 1000) / 1000
export async function squeeze(b: Uint8Array<ArrayBuffer>) { return new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()) }
export async function unsqueeze(b: Uint8Array<ArrayBuffer>) { return new Uint8Array(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()) }
export { w2c, E, LH }
