import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { setCatalog, models } from '../src/core/catalog'
import { generate } from '../src/core/gen'
import { PRESETS } from '../src/core/presets'
import { buildChunk, CH, type Lib } from '../src/core/mesher'
import { buildVolume } from '../src/core/light'
import { N, w2c } from '../src/core/defs'
let lib: Lib
beforeAll(() => { const man = JSON.parse(readFileSync('public/assets/props.json', 'utf8')); setCatalog(man); const layers = JSON.parse(readFileSync('public/tex/layers.json', 'utf8')); const r = gunzipSync(readFileSync('public/assets/props.bin')); const raw = r.buffer.slice(r.byteOffset, r.byteOffset + r.byteLength) as ArrayBuffer
  const cache = new Map(); lib = { layers: layers.map((l: any) => l.name), scale: layers.map((l: any) => l.scale), geo(id, lod) { const k = id + lod; if (cache.has(k)) return cache.get(k); const m = models().find(x => x.id === id)!; if (!m) return null; const L = m.lod[Math.min(1, lod)]; const q = new Uint16Array(raw, L.p, L.nv * 4), p = new Float32Array(L.nv * 3); for (let i = 0; i < L.nv; i++) for (let a = 0; a < 3; a++) p[i * 3 + a] = m.lo[a] + q[i * 4 + a] / 65535 * (m.hi[a] - m.lo[a]); const g = { nv: L.nv, ni: L.ni, nc: L.nc, p, n: new Int8Array(raw, L.n, L.nv * 4), u: new Float32Array(L.nv * 2), c: new Uint8Array(raw, L.c, L.nv * 4), x: new Uint8Array(raw, L.x, L.nv * 4), i: new Uint16Array(raw, L.i, L.ni) }; cache.set(k, g); return g } } })
describe('mesher', () => {
  it('every preset meshes: finite, in range, within budget', () => {
    for (const p of PRESETS) {
      const w = generate(p.o); const rep: string[] = []; let tris = 0, tri1 = 0, tri2 = 0, ms = 0, draws = 0
      const ix = new Map<string, any[]>(); for (const q of w.props.values()) { const k = `${Math.floor(w2c(q.x) / CH)}|${Math.floor(w2c(q.z) / CH)}`; (ix.get(k) ?? ix.set(k, []).get(k)!).push(q) }
      for (const lod of [0, 1, 2]) for (const l of w.levels.keys()) for (let z = 0; z < N / CH; z++) for (let x = 0; x < N / CH; x++) { const t = performance.now(); const g = buildChunk(w, lib, l, x, z, lod, ix.get(`${x}|${z}`) ?? []); ms += performance.now() - t; for (const k in g) { const q = (g as any)[k]; if (lod === 2) tri2 += q.i.length / 3; else if (lod) tri1 += q.i.length / 3; else { tris += q.i.length / 3; draws++ } const nv = q.p.length / 3; for (let i = 0; i < q.i.length; i++) if (q.i[i] >= nv) { rep.push('index range ' + k); break } for (let i = 0; i < q.p.length; i++) if (!Number.isFinite(q.p[i])) { rep.push('NaN ' + k); break } } }
      const v = buildVolume(w); console.log(`${p.name.padEnd(22)} props ${String(w.props.size).padStart(5)}  tris ${(tris / 1000).toFixed(0).padStart(5)}k / ${(tri1 / 1000).toFixed(0)}k / ${(tri2 / 1000).toFixed(0)}k  meshes ${draws}  mesh ${ms.toFixed(0)}ms  light ${v.ms.toFixed(0)}ms  lamps ${v.lamps}  vol ${v.w}x${v.h}x${v.d}`)
      expect(rep).toEqual([])
    }
  }, 300000)
})
