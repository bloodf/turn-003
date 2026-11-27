import { World, Level, NN, VT, idx } from './world'
import { N } from './defs'
/** One reversible change. Everything that edits a world (tools, generators, the network) becomes an Op. */
export interface Op { cells?: { l: number; i: number[]; v: number[] }[]; maps?: Record<string, { set: any[]; del: (number | string)[] }>; terr?: { i: number[]; v: number[] }; water?: number | null; env?: any; spawn?: any; newLevels?: number[]; doors?: [string, number][]; name?: string; hasTerr?: boolean }
const MAPS = ['props', 'stairs', 'spirals', 'rings', 'roofs', 'rooms', 'tokens'] as const
const STRIDE = 7
export function apply(w: World, op: Op): Op {
  const inv: Op = {}
  if (op.name !== undefined) { inv.name = w.meta.name; w.meta.name = op.name }
  if (op.hasTerr && !w.terrain) { w.terrain = { h: new Float32Array(VT), w: new Uint8Array(VT * 4), water: null } }
  if (op.cells) {
    inv.cells = []
    for (const c of op.cells) {
      const lv = w.lv(c.l), A = lv.arrays(), old: number[] = []
      for (let k = 0; k < c.i.length; k++) { const i = c.i[k]; for (let a = 0; a < STRIDE; a++) { old.push(A[a][i]); A[a][i] = c.v[k * STRIDE + a] } }
      inv.cells.push({ l: c.l, i: c.i, v: old })
    }
  }
  if (op.maps) {
    inv.maps = {}
    for (const k in op.maps) {
      const m = (w as any)[k] as Map<any, any>, o = op.maps[k], iv = { set: [] as any[], del: [] as any[] }
      for (const v of o.set) { const was = m.get(v.id); if (was) iv.set.push(was); else iv.del.push(v.id); m.set(v.id, v); if (typeof v.id === 'number' && k !== 'rooms' && v.id >= w.nid) w.nid = v.id + 1 }
      for (const id of o.del) { const was = m.get(id); if (was) { iv.set.push(was); m.delete(id) } }
      inv.maps[k] = iv
    }
  }
  if (op.terr && w.terrain) { const old: number[] = [], t = w.terrain; for (let k = 0; k < op.terr.i.length; k++) { const i = op.terr.i[k], o = k * 5; old.push(t.h[i], t.w[i * 4], t.w[i * 4 + 1], t.w[i * 4 + 2], t.w[i * 4 + 3]); t.h[i] = op.terr.v[o]; for (let a = 0; a < 4; a++) t.w[i * 4 + a] = op.terr.v[o + 1 + a] } inv.terr = { i: op.terr.i, v: old } }
  if (op.water !== undefined && w.terrain) { inv.water = w.terrain.water; w.terrain.water = op.water }
  if (op.env) { inv.env = { ...w.env }; w.env = { ...w.env, ...op.env } }
  if (op.spawn) { inv.spawn = w.spawn; w.spawn = op.spawn }
  if (op.doors) { inv.doors = op.doors.map(([k]) => [k, w.doors.get(k) ?? 0]); for (const [k, v] of op.doors) v ? w.doors.set(k, v) : w.doors.delete(k) }
  w.meta.edited = Date.now(); return inv
}
/** run any mutation and get back the Op that reproduces it (the world is already changed) */
export function transact(w: World, fn: () => void): { op: Op; inv: Op } | null {
  const L = new Map<number, Level>(); for (const [k, v] of w.levels) L.set(k, v.clone())
  const M: Record<string, Map<any, any>> = {}; for (const k of MAPS) M[k] = new Map((w as any)[k]); const doors = new Map(w.doors)
  const th = w.terrain?.h.slice(), tw = w.terrain?.w.slice(), wl = w.terrain?.water, env = w.env, spawn = w.spawn, name = w.meta.name
  fn()
  const op: Op = {}, inv: Op = {}; let any = false
  for (const [l, v] of w.levels) {
    const o = L.get(l) ?? new Level(l), A = v.arrays(), B = o.arrays(), ii: number[] = [], nv: number[] = [], ov: number[] = []
    for (let i = 0; i < NN; i++) { if (A[0][i] !== B[0][i] || A[1][i] !== B[1][i] || A[2][i] !== B[2][i] || A[3][i] !== B[3][i] || A[4][i] !== B[4][i] || A[5][i] !== B[5][i] || A[6][i] !== B[6][i]) { ii.push(i); for (let a = 0; a < STRIDE; a++) { nv.push(A[a][i]); ov.push(B[a][i]) } } }
    if (ii.length) { (op.cells ??= []).push({ l, i: ii, v: nv }); (inv.cells ??= []).push({ l, i: ii, v: ov }); any = true }
  }
  for (const k of MAPS) {
    const a = (w as any)[k] as Map<any, any>, b = M[k], s: any[] = [], d: any[] = [], is: any[] = [], id: any[] = []
    for (const [i, v] of a) { const q = b.get(i); if (q !== v) { s.push(v); if (q) is.push(q); else id.push(i) } }
    for (const [i, v] of b) if (!a.has(i)) { d.push(i); is.push(v) }
    if (s.length || d.length) { (op.maps ??= {})[k] = { set: s, del: d }; (inv.maps ??= {})[k] = { set: is, del: id }; any = true }
  }
  if (w.terrain) {
    if (!th) { op.hasTerr = true; any = true }
    const t = w.terrain, ii: number[] = [], nv: number[] = [], ov: number[] = []
    for (let i = 0; i < VT; i++) { const q = i * 4; if (!th || t.h[i] !== th[i] || t.w[q] !== tw![q] || t.w[q + 1] !== tw![q + 1] || t.w[q + 2] !== tw![q + 2] || t.w[q + 3] !== tw![q + 3]) { ii.push(i); nv.push(t.h[i], t.w[q], t.w[q + 1], t.w[q + 2], t.w[q + 3]); ov.push(th ? th[i] : 0, tw ? tw[q] : 0, tw ? tw[q + 1] : 0, tw ? tw[q + 2] : 0, tw ? tw[q + 3] : 0) } }
    if (ii.length) { op.terr = { i: ii, v: nv }; inv.terr = { i: ii, v: ov }; any = true }
    if (t.water !== (wl ?? null)) { op.water = t.water; inv.water = wl ?? null; any = true }
  }
  if (w.env !== env) { op.env = w.env; inv.env = env; any = true }
  if (w.spawn !== spawn) { op.spawn = w.spawn; inv.spawn = spawn; any = true }
  if (w.meta.name !== name) { op.name = w.meta.name; inv.name = name; any = true }
  const dd: [string, number][] = [], di: [string, number][] = []; for (const [k, v] of w.doors) if (doors.get(k) !== v) { dd.push([k, v]); di.push([k, doors.get(k) ?? 0]) } for (const [k, v] of doors) if (!w.doors.has(k)) { dd.push([k, 0]); di.push([k, v]) }
  if (dd.length) { op.doors = dd; inv.doors = di; any = true }
  return any ? { op, inv } : null
}
export interface Dirty { cells: { l: number; x0: number; z0: number; x1: number; z1: number }[]; props: Set<string>; terrain: boolean; env: boolean; doors: boolean; struct: boolean; tokens: boolean; all: boolean }
/** which 16x16 chunks an op touches, for incremental rebuild */
export function touched(w: World, op: Op, inv: Op): { chunks: Set<string>; light: boolean; env: boolean; doors: boolean; tokens: boolean } {
  const S = new Set<string>(), add = (l: number, x: number, z: number) => S.add(`${l}|${Math.floor(x / 16)}|${Math.floor(z / 16)}`); let light = false
  const area = (l: number, x0: number, z0: number, x1: number, z1: number) => { for (let cz = Math.floor(z0 / 16); cz <= Math.floor(z1 / 16); cz++) for (let cx = Math.floor(x0 / 16); cx <= Math.floor(x1 / 16); cx++) S.add(`${l}|${cx}|${cz}`) }
  for (const c of op.cells ?? []) { light = true; for (const i of c.i) { const x = i % N, z = (i / N) | 0; for (let dz = -2; dz <= 2; dz += 2) for (let dx = -2; dx <= 2; dx += 2) for (let dl = -1; dl <= 1; dl++) add(c.l + dl, x + dx, z + dz) } }
  for (const o of [op, inv]) for (const k in o.maps ?? {}) for (const v of o.maps![k].set) {
    if (k === 'props') { add(v.l, Math.floor(v.x / 1.5 + 96), Math.floor(v.z / 1.5 + 96)); light = true }
    else if (k === 'stairs') { for (const [x, z] of World.stairCells(v)) { add(v.l, x, z); add(v.l + 1, x, z) } light = true }
    else if (k === 'spirals' || k === 'rings') { const x = v.x / 1.5 + 96, z = v.z / 1.5 + 96, r = (v.r ?? 2) / 1.5 + 3; for (let l = v.l0 - 1; l <= v.l1 + 1; l++) area(l, x - r, z - r, x + r, z + r); light = true }
    else if (k === 'roofs') { area(v.l, v.x0 - 2, v.z0 - 2, v.x1 + 2, v.z1 + 2); light = true }
  }
  if (op.terr) for (const i of op.terr.i) { const x = i % (N + 1), z = (i / (N + 1)) | 0; add(0, x, z); add(0, x - 1, z - 1); add(0, x - 1, z); add(0, x, z - 1) }
  if (op.doors) light = true
  return { chunks: S, light, env: !!op.env || op.water !== undefined, doors: !!op.doors || !!op.cells, tokens: !!op.maps?.tokens }
}
export { idx }
