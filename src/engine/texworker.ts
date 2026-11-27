/// <reference lib="webworker" />
// decodes texture layers, builds mip chains and (where useful) packs them to BC1/BC3 off the main thread
const send = (m: any, t: Transferable[] = []) => (self as unknown as DedicatedWorkerGlobalScope).postMessage(m, t)
async function img(url: string): Promise<ImageData> { const b = await fetch(url).then(r => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.blob() }); const bm = await createImageBitmap(b, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }); const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d', { willReadFrequently: true })!; x.drawImage(bm, 0, 0); return x.getImageData(0, 0, bm.width, bm.height) }
const srgb = new Float32Array(256).map((_, i) => (i / 255) ** 2)
function halve(s: Uint8Array, w: number, gamma: boolean): Uint8Array { const h = w >> 1, o = new Uint8Array(h * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < h; x++) { const a = (y * 2 * w + x * 2) * 4, b = a + 4, c = a + w * 4, d = c + 4, q = (y * h + x) * 4; for (let k = 0; k < 4; k++) o[q + k] = gamma && k < 3 ? Math.sqrt((srgb[s[a + k]] + srgb[s[b + k]] + srgb[s[c + k]] + srgb[s[d + k]]) / 4) * 255 + .5 : (s[a + k] + s[b + k] + s[c + k] + s[d + k] + 2) >> 2 } return o }
const c565 = (r: number, g: number, b: number) => ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)
/** range-fit block compression: quick and good enough for stone and wood */
function bc(s: Uint8Array, w: number, alpha: boolean): Uint8Array {
  const bw = Math.max(1, w >> 2), B = alpha ? 16 : 8, out = new Uint8Array(bw * bw * B), dv = new DataView(out.buffer)
  for (let by = 0; by < bw; by++) for (let bx = 0; bx < bw; bx++) {
    let r0 = 255, g0 = 255, b0 = 255, a0 = 255, r1 = 0, g1 = 0, b1 = 0, a1 = 0; const px = new Int32Array(16)
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const i = (Math.min(w - 1, by * 4 + y) * w + Math.min(w - 1, bx * 4 + x)) * 4; px[y * 4 + x] = i; const r = s[i], g = s[i + 1], b = s[i + 2], a = s[i + 3]; if (r < r0) r0 = r; if (r > r1) r1 = r; if (g < g0) g0 = g; if (g > g1) g1 = g; if (b < b0) b0 = b; if (b > b1) b1 = b; if (a < a0) a0 = a; if (a > a1) a1 = a }
    let o = (by * bw + bx) * B
    if (alpha) { if (a0 === a1) a1 = Math.min(255, a0 + 1); out[o] = a1; out[o + 1] = a0; let bitsL = 0, bitsH = 0; const R = a1 - a0 || 1; for (let k = 0; k < 16; k++) { let t = Math.round((a1 - s[px[k] + 3]) / R * 7); const idx = t === 0 ? 0 : t === 7 ? 1 : t + 1; if (k < 8) bitsL |= idx << (k * 3); else bitsH |= idx << ((k - 8) * 3) } out[o + 2] = bitsL; out[o + 3] = bitsL >> 8; out[o + 4] = bitsL >> 16; out[o + 5] = bitsH; out[o + 6] = bitsH >> 8; out[o + 7] = bitsH >> 16; o += 8 }
    // orient the colour line along the dominant correlation
    const mr = (r0 + r1) / 2, mg = (g0 + g1) / 2, mb = (b0 + b1) / 2; let crg = 0, cbg = 0; for (let k = 0; k < 16; k++) { const i = px[k]; crg += (s[i] - mr) * (s[i + 1] - mg); cbg += (s[i + 2] - mb) * (s[i + 1] - mg) } if (crg < 0) { const t = r0; r0 = r1; r1 = t } if (cbg < 0) { const t = b0; b0 = b1; b1 = t }
    const ir = (r1 - r0) >> 4, ig = (g1 - g0) >> 4, ib = (b1 - b0) >> 4; r0 += ir; r1 -= ir; g0 += ig; g1 -= ig; b0 += ib; b1 -= ib
    let C1 = c565(r1, g1, b1), C0 = c565(r0, g0, b0); if (C1 < C0) { const t = C1; C1 = C0; C0 = t; let q = r0; r0 = r1; r1 = q; q = g0; g0 = g1; g1 = q; q = b0; b0 = b1; b1 = q } dv.setUint16(o, C1, true); dv.setUint16(o + 2, C0, true); let bits = 0
    if (C1 !== C0) { const dr = r0 - r1, dg = g0 - g1, db = b0 - b1, dd = dr * dr + dg * dg + db * db || 1; for (let k = 0; k < 16; k++) { const i = px[k]; let t = Math.round(((s[i] - r1) * dr + (s[i + 1] - g1) * dg + (s[i + 2] - b1) * db) / dd * 3); t = t < 0 ? 0 : t > 3 ? 3 : t; bits |= (t === 0 ? 0 : t === 3 ? 1 : t + 1) << (k * 2) } } dv.setUint32(o + 4, bits >>> 0, true)
  }
  return out
}
function chain(base: Uint8Array, w: number, gamma: boolean, comp: 0 | 1 | 3, only0 = false) { const out: Uint8Array[] = []; let s = base, z = w; for (; ;) { out.push(comp ? bc(s, z, comp === 3) : s); if (only0 || z === 1) break; s = halve(s, z, gamma); z >>= 1 } return out }
function pack(d: ImageData): Uint8Array { const n = d.width, o = new Uint8Array(n * n * 4), p = d.data; for (let k = 0; k < 4; k++) for (let i = 0, q = k * n * n * 4; i < n * n; i++, q += 4) o[i * 4 + k] = p[q]; return o }
function toBc3(a: Uint8Array) { /* put normal X where BC3 is most precise: alpha <-> red */ const o = new Uint8Array(a.length); for (let i = 0; i < a.length; i += 4) { o[i] = a[i + 3]; o[i + 1] = a[i + 1]; o[i + 2] = a[i + 2]; o[i + 3] = a[i] } return o }
let q: Promise<void> = Promise.resolve()
self.onmessage = e => { q = q.then(() => job(e.data)).catch(err => send({ t: 'err', msg: String(err), ...pick(e.data) })) }
const pick = (m: any) => ({ layer: m.layer, name: m.name })
async function job(m: any) {
  if (m.t === 'layer') {
    const dir = m.base + 'tex/' + (m.lo ? 'lo/' : ''); const [c, d] = await Promise.all([img(dir + m.name + '.c.webp'), m.data ? img(dir + m.name + '.d.webp') : Promise.resolve(null)])
    let cb = new Uint8Array(c.data.buffer) as Uint8Array, w = c.width; let db = d ? pack(d) : null; while (w > m.size) { cb = halve(cb, w, true); if (db) db = halve(db, w, false); w >>= 1 }
    if (m.bc && db) db = toBc3(db); const C = chain(cb, w, true, m.bc ? 1 : 0, m.only0), D = db ? chain(db, w, false, m.bc ? 3 : 0, m.only0) : null
    send({ t: 'layer', layer: m.layer, name: m.name, w, C, D, lo: m.lo }, [...C.map(x => x.buffer), ...(D ? D.map(x => x.buffer) : [])] as Transferable[])
  } else if (m.t === 'cut') {
    const [c, a] = await Promise.all([img(m.base + 'tex/cut.c.webp'), img(m.base + 'tex/cut.a.webp')]); const n = c.width, L = c.height / n, out: Uint8Array[][] = []
    for (let l = 0; l < L; l++) { let b = new Uint8Array(n * n * 4) as Uint8Array; const o = l * n * n * 4; for (let i = 0; i < n * n; i++) { b[i * 4] = c.data[o + i * 4]; b[i * 4 + 1] = c.data[o + i * 4 + 1]; b[i * 4 + 2] = c.data[o + i * 4 + 2]; b[i * 4 + 3] = a.data[o + i * 4] } let w = n; while (w > m.size) { b = halve(b, w, false); w >>= 1 } const C: Uint8Array[] = [b]; const cov = (s: Uint8Array, k: number) => { let q = 0; for (let i = 3; i < s.length; i += 4) if (s[i] * k > 107) q++; return q / (s.length / 4) }; const want = cov(b, 1); let s = b, z = w; while (z > 1) { s = halve(s, z, false); z >>= 1; let lo = .5, hi = 4; for (let it = 0; it < 8; it++) { const k = (lo + hi) / 2; if (cov(s, k) < want) lo = k; else hi = k } const f = s.slice(); for (let i = 3; i < f.length; i += 4) f[i] = Math.min(255, f[i] * hi); C.push(f) } out.push(C) }
    send({ t: 'cut', n: Math.min(n, m.size), out }, out.flat().map(x => x.buffer) as Transferable[])
  }
}
