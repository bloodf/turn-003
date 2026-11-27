/// <reference lib="webworker" />
import { World } from '../core/world'
import { apply, type Op } from '../core/ops'
import { setCatalog, models } from '../core/catalog'
import { buildChunk, CH, type Lib, type LibGeo, type Groups } from '../core/mesher'
import { buildVolume } from '../core/light'
import { generate, type GenOpts } from '../core/gen'
import { w2c } from '../core/defs'
let world: World | null = null, lib: Lib | null = null, propIdx: Map<string, number[]> | null = null
const cache = new Map<string, LibGeo>()
async function init(base: string) {
  const [man, bin, layers] = await Promise.all([fetch(base + 'assets/props.json').then(r => r.json()), fetch(base + 'assets/props.bin').then(r => r.arrayBuffer()), fetch(base + 'tex/layers.json').then(r => r.json())])
  setCatalog(man); const raw = await gunzip(bin)
  lib = { layers: layers.map((l: any) => l.name), scale: layers.map((l: any) => l.scale), geo(id, lod) { const k = id + lod; let g = cache.get(k); if (g) return g; const m = models().find(x => x.id === id); if (!m) return null; const L = m.lod[Math.min(lod, m.lod.length - 1)]; g = decode(raw, m, L); cache.set(k, g); return g } }
}
export async function gunzip(b: ArrayBuffer) { const u = new Uint8Array(b); if (u[0] !== 0x1f || u[1] !== 0x8b) return b; return await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer() }
const half = (() => { const f = new Float32Array(65536); for (let i = 0; i < 65536; i++) { const s = i >> 15 ? -1 : 1, e = (i >> 10) & 31, m = i & 1023; f[i] = e === 0 ? s * m * 2 ** -24 : e === 31 ? 0 : s * (1 + m / 1024) * 2 ** (e - 15) } return f })()
function decode(raw: ArrayBuffer, m: any, L: any): LibGeo {
  const q = new Uint16Array(raw, L.p, L.nv * 4), p = new Float32Array(L.nv * 3); for (let i = 0; i < L.nv; i++) for (let k = 0; k < 3; k++) p[i * 3 + k] = m.lo[k] + q[i * 4 + k] / 65535 * (m.hi[k] - m.lo[k])
  const hu = new Uint16Array(raw, L.u, L.nv * 2), u = new Float32Array(L.nv * 2); for (let i = 0; i < u.length; i++) u[i] = half[hu[i]]
  return { nv: L.nv, ni: L.ni, nc: L.nc, p, n: new Int8Array(raw, L.n, L.nv * 4), u, c: new Uint8Array(raw, L.c, L.nv * 4), x: new Uint8Array(raw, L.x, L.nv * 4), i: new Uint16Array(raw, L.i, L.ni) }
}
function indexProps() { propIdx = new Map(); for (const p of world!.props.values()) { const k = `${Math.floor(w2c(p.x) / CH)}|${Math.floor(w2c(p.z) / CH)}`; (propIdx.get(k) ?? propIdx.set(k, []).get(k)!).push(p.id) } }
const send = (m: any, t: Transferable[] = []) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m, t)
let ready: Promise<void> | null = null
self.onmessage = async (e: MessageEvent) => {
  const m = e.data
  try {
    if (m.t === 'init') { ready = init(m.base); await ready; send({ t: 'ready' }); return }
    await ready
    if (m.t === 'world') { world = World.fromBytes(m.bytes); propIdx = null }
    else if (m.t === 'op') { if (world) { apply(world, m.op as Op); propIdx = null } }
    else if (m.t === 'doors') { if (world) world.doors = new Map(m.doors) }
    else if (m.t === 'gen') { const w = generate(m.o as GenOpts); const b = w.toBytes(); send({ t: 'gen', id: m.id, bytes: b }, [b.buffer]) }
    else if (m.t === 'chunk') {
      if (!world || !lib) return; if (!propIdx) indexProps(); const t0 = performance.now(); const ps = (propIdx!.get(`${m.cx}|${m.cz}`) ?? []).map(i => world!.props.get(i)!).filter(Boolean)
      const g: Groups = buildChunk(world, lib, m.l, m.cx, m.cz, m.lod, ps); const tr: Transferable[] = []; for (const k in g) { const q = (g as any)[k]; tr.push(q.p.buffer, q.n.buffer, q.u.buffer, q.c.buffer, q.x.buffer, q.i.buffer) } send({ t: 'chunk', key: m.key, ver: m.ver, lod: m.lod, g, ms: performance.now() - t0 }, tr)
    }
    else if (m.t === 'light') { if (!world) return; const v = buildVolume(world); send({ t: 'light', ver: m.ver, v }, [v.A.buffer, v.B.buffer]) }
    else if (m.t === 'geo') { const g = lib!.geo(m.id, m.lod ?? 0); send({ t: 'geo', rid: m.rid, g: g ? { ...g, p: g.p.slice(), n: g.n.slice(), u: g.u.slice(), c: g.c.slice(), x: g.x.slice(), i: new Uint32Array(g.i) } : null }) }
  } catch (err: any) { send({ t: 'error', id: m.id, of: m.t, msg: String(err?.stack ?? err) }) }
}
