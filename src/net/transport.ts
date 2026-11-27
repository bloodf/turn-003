import type { Whisper } from './nostr'
/** What the table needs from any kind of connection. Peers are opaque ids. */
export interface Transport {
  kind: 'code' | 'scroll' | 'local'
  send(to: string | null, msg: any): void          // null = everyone connected
  fast(to: string | null, msg: any): void          // may be dropped
  bytes(to: string, b: Uint8Array, meta: any): Promise<void>
  onJoin: (id: string) => void; onLeave: (id: string) => void; onMsg: (id: string, msg: any) => void; onBytes: (id: string, b: Uint8Array, meta: any) => void; onFail: (why: string) => void
  close(): void; peers(): string[]
}
const nop = () => { }
export abstract class Base implements Transport {
  abstract kind: 'code' | 'scroll' | 'local'; onJoin: (id: string) => void = nop; onLeave: (id: string) => void = nop; onMsg: (id: string, msg: any) => void = nop; onBytes: (id: string, b: Uint8Array, meta: any) => void = nop; onFail: (why: string) => void = nop
  abstract send(to: string | null, msg: any): void; fast(to: string | null, msg: any) { this.send(to, msg) } abstract bytes(to: string, b: Uint8Array, meta: any): Promise<void>; abstract close(): void; abstract peers(): string[]
}
export const randId = () => { const b = new Uint8Array(9); crypto.getRandomValues(b); return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_') }
// ------------------------------------------------------------------ same browser, other windows
export class LocalTransport extends Base {
  kind = 'local' as const; private ch: BroadcastChannel; private id = randId(); private seen = new Map<string, number>(); private timer: any; private gone: () => void
  constructor(room: string, private host: boolean) {
    super(); this.ch = new BroadcastChannel('realmwright:' + room); this.ch.onmessage = e => { const m = e.data; if (m.from === this.id || (m.to && m.to !== this.id)) return; const isNew = !this.seen.has(m.from); this.seen.set(m.from, Date.now()); if (m.k === 'bye') { if (!isNew) { this.seen.delete(m.from); this.onLeave(m.from) } return } if (isNew) { this.post(m.from, 'hi'); if (this.host !== m.host) this.onJoin(m.from) } if (m.k === 'm') this.onMsg(m.from, m.d); else if (m.k === 'b') this.onBytes(m.from, m.d, m.meta) }
    this.timer = setInterval(() => { this.post(null, 'hi'); for (const [k, t] of this.seen) if (Date.now() - t > 9000) { this.seen.delete(k); this.onLeave(k) } }, 2000); setTimeout(() => this.post(null, 'hi'), 30); this.gone = () => this.post(null, 'bye'); addEventListener('pagehide', this.gone)
  }
  private post(to: string | null, k: string, d?: any, meta?: any) { try { this.ch.postMessage({ from: this.id, to, k, d, meta, host: this.host }) } catch { /* closed */ } }
  send(to: string | null, msg: any) { this.post(to, 'm', JSON.parse(JSON.stringify(msg))) } async bytes(to: string, b: Uint8Array, meta: any) { this.post(to, 'b', b, meta) } peers() { return [...this.seen.keys()] } close() { clearInterval(this.timer); this.gone(); removeEventListener('pagehide', this.gone); this.ch.close() }
}
// ------------------------------------------------------------------ handshake scroll: two pasted/scanned texts, no internet at all
const ICE = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] }]
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); const un64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
/** squeeze an SDP down to what matters so it fits a QR code */
function pack(sdp: string, id: string): string {
  const g = (r: RegExp) => sdp.match(r)?.[1] ?? ''; const fp = g(/a=fingerprint:sha-256 ([0-9A-F:]+)/i).split(':').map(h => parseInt(h, 16)); const c: string[] = []; for (const m of sdp.matchAll(/a=candidate:(\S+) 1 (udp|tcp) (\d+) (\S+) (\d+) typ (\w+)(?: raddr (\S+) rport (\d+))?/gi)) { if (m[2].toLowerCase() !== 'udp') continue; c.push([m[6][0], m[4], m[5]].join(',')) }
  return [id, g(/a=setup:(\w+)/)[0], g(/a=ice-ufrag:(\S+)/), g(/a=ice-pwd:(\S+)/), b64(new Uint8Array(fp)), ...c.slice(0, 7)].join('~')
}
function unpack(s: string, type: 'offer' | 'answer'): { id: string; sdp: string } {
  const p = s.split('~'); if (p.length < 6) throw new Error('That scroll is torn: part of it is missing. Copy the whole text.'); const [id, setup, uf, pw, fp, ...cs] = p; const hex = [...un64(fp)].map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(':'); const su = setup === 'a' && type === 'offer' ? 'actpass' : setup === 'a' ? 'active' : 'passive'
  const cand = cs.map((c, i) => { const [t, ip, port] = c.split(','); const typ = t === 's' ? 'srflx' : t === 'r' ? 'relay' : 'host'; const pri = typ === 'host' ? 2122260223 - i : 1686052607 - i; return `a=candidate:${i + 1} 1 udp ${pri} ${ip} ${port} typ ${typ}${typ !== 'host' ? ' raddr 0.0.0.0 rport 0' : ''} generation 0` })
  return { id, sdp: ['v=0', `o=- ${Date.now()} 2 IN IP4 127.0.0.1`, 's=-', 't=0 0', 'a=group:BUNDLE 0', 'a=extmap-allow-mixed', 'a=msid-semantic: WMS', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel', 'c=IN IP4 0.0.0.0', ...cand, 'a=end-of-candidates', `a=ice-ufrag:${uf}`, `a=ice-pwd:${pw}`, 'a=ice-options:trickle', `a=fingerprint:sha-256 ${hex}`, `a=setup:${su}`, 'a=mid:0', 'a=sctp-port:5000', 'a=max-message-size:262144', ''].join('\r\n') }
}
interface Link { pc: RTCPeerConnection; ch?: RTCDataChannel; fast?: RTCDataChannel; rx?: { meta: any; parts: Uint8Array[]; got: number; size: number } }
export class ScrollTransport extends Base {
  kind = 'scroll' as const; private links = new Map<string, Link>(); private open = new Set<string>(); me = randId()
  private mk(id: string): Link { const pc = new RTCPeerConnection({ iceServers: navigator.onLine ? ICE : [] }); const l: Link = { pc }; this.links.set(id, l); pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') { this.onFail('The two devices could not reach each other. Same Wi-Fi on both usually fixes it.'); this.drop(id) } if (pc.connectionState === 'closed') this.drop(id); if (pc.connectionState === 'disconnected') setTimeout(() => { if (pc.connectionState !== 'connected') this.drop(id) }, 9000) }; return l }
  private wire(id: string, l: Link, ch: RTCDataChannel) { ch.binaryType = 'arraybuffer'; if (ch.label === 'fast') { l.fast = ch; ch.onmessage = e => { try { this.onMsg(id, JSON.parse(e.data)) } catch { /* junk */ } }; return } l.ch = ch; const ready = () => { if (!this.open.has(id)) { this.open.add(id); this.onJoin(id) } }; ch.onopen = ready; if (ch.readyState === 'open') ready(); ch.onclose = () => this.drop(id)
    ch.onmessage = e => { if (typeof e.data === 'string') { let m: any; try { m = JSON.parse(e.data) } catch { return } if (m.__bin) { l.rx = { meta: m.meta, parts: [], got: 0, size: m.__bin } } else this.onMsg(id, m) } else if (l.rx) { const u = new Uint8Array(e.data); l.rx.parts.push(u); l.rx.got += u.length; if (l.rx.got >= l.rx.size) { const o = new Uint8Array(l.rx.got); let k = 0; for (const q of l.rx.parts) { o.set(q, k); k += q.length } const meta = l.rx.meta; l.rx = undefined; this.onBytes(id, o, meta) } } } }
  private drop(id: string) { const l = this.links.get(id); if (!l) return; this.links.delete(id); try { l.pc.close() } catch { /* closed */ } if (this.open.delete(id)) this.onLeave(id) }
  private gathered(pc: RTCPeerConnection): Promise<string> { return new Promise(res => { const done = () => res(pc.localDescription!.sdp); if (pc.iceGatheringState === 'complete') return done(); const t = setTimeout(done, 2600); pc.onicegatheringstatechange = () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); done() } } }) }
  /** host: one invitation per guest */
  async invite(): Promise<{ id: string; text: string }> { const id = randId().slice(0, 6); const l = this.mk(id); this.wire(id, l, l.pc.createDataChannel('main', { ordered: true })); this.wire(id, l, l.pc.createDataChannel('fast', { ordered: false, maxRetransmits: 0 })); await l.pc.setLocalDescription(await l.pc.createOffer()); return { id, text: pack(await this.gathered(l.pc), id) } }
  /** host: read the guest's reply */
  async accept(text: string) { const { id, sdp } = unpack(clean(text), 'answer'); const l = this.links.get(id); if (!l) throw new Error('That reply belongs to another invitation. Make a new one.'); if (l.pc.signalingState === 'stable') throw new Error('That reply was already used.'); await l.pc.setRemoteDescription({ type: 'answer', sdp }); return id }
  /** guest: answer an invitation */
  async answer(text: string): Promise<string> { const { id, sdp } = unpack(clean(text), 'offer'); const l = this.mk(id); l.pc.ondatachannel = e => this.wire(id, l, e.channel); await l.pc.setRemoteDescription({ type: 'offer', sdp }); await l.pc.setLocalDescription(await l.pc.createAnswer()); return pack(await this.gathered(l.pc), id) }
  send(to: string | null, msg: any) { const s = JSON.stringify(msg); for (const id of to ? [to] : this.open) { const c = this.links.get(id)?.ch; if (c?.readyState === 'open') try { c.send(s) } catch { /* full */ } } }
  fast(to: string | null, msg: any) { const s = JSON.stringify(msg); for (const id of to ? [to] : this.open) { const l = this.links.get(id), c = l?.fast?.readyState === 'open' ? l.fast : l?.ch; if (c?.readyState === 'open' && c.bufferedAmount < 65536) try { c.send(s) } catch { /* full */ } } }
  async bytes(to: string, b: Uint8Array, meta: any) { const c = this.links.get(to)?.ch; if (!c || c.readyState !== 'open') return; c.send(JSON.stringify({ __bin: b.length, meta })); const S = 16384; for (let o = 0; o < b.length; o += S) { while (c.bufferedAmount > 1 << 20) await new Promise(r => setTimeout(r, 20)); if (c.readyState !== 'open') return; c.send(b.slice(o, o + S)) } }
  /** drop links that never opened */
  reset() { for (const id of [...this.links.keys()]) if (!this.open.has(id)) this.drop(id) } forget(id: string) { if (!this.open.has(id)) this.drop(id) }
  peers() { return [...this.open] } close() { for (const id of [...this.links.keys()]) this.drop(id) }
}
// ------------------------------------------------------------------ room code: the same handshake, carried by a whisper channel
/** Host: answers every knock with a fresh invitation. Guest: knocks until let in, and knocks again if the line drops. */
export class CodeTransport extends Base {
  kind = 'code' as const; private s = new ScrollTransport(); private w!: Whisper; private over = false; private me = randId(); private inv = new Map<string, { n: string; id: string; text: string; t: number }>(); private nonce = ''; private ans = ''; private timer: any; private t0 = 0; private inFlight = false; private hadLink = false
  static async open(code: string, host: boolean, relays?: string[]): Promise<CodeTransport> {
    if (!window.isSecureContext || !crypto.subtle) throw new Error('Room codes need a secure (https) page. Use the handshake scroll instead, or open the https link.')
    const { Whisper, RELAYS } = await import('./nostr'); const t = new CodeTransport(); t.w = new Whisper(code.trim().toLowerCase(), relays?.length ? relays : RELAYS); t.s.onMsg = (id, m) => t.onMsg(id, m); t.s.onBytes = (id, b, m) => t.onBytes(id, b, m); t.s.onLeave = id => { t.onLeave(id); if (!host && !t.over) t.knock(true) }
    t.s.onJoin = id => { t.hadLink = true; if (!host) { clearTimeout(t.timer); t.nonce = '' } t.onJoin(id) }; t.s.onFail = w => { if (host || t.hadLink) { if (host) t.onFail(w) } else t.fails++ ; if (!host && t.fails === 3) t.onFail('The devices found each other but the networks will not let them talk directly. Put both on the same Wi-Fi, or try a phone hotspot.') }
    t.w.onMsg = m => host ? t.asHost(m) : t.asGuest(m); await t.w.open(); if (!host) t.knock(true); else t.timer = setInterval(() => { for (const [g, v] of t.inv) if (Date.now() - v.t > 40000) { t.inv.delete(g) } }, 10000); return t
  }
  private fails = 0
  // ---- host
  private async asHost(m: any) {
    if (m.k === 'knock' && m.g) { const old = this.inv.get(m.g); if (old && old.n === m.n) { if (old.text && Date.now() - old.t > 600) this.w.send({ k: 'inv', g: m.g, n: m.n, s: old.text }); return } const v = { n: m.n, id: '', text: '', t: Date.now() }; this.inv.set(m.g, v); if (old?.id) this.s.forget(old.id); const i = await this.s.invite(); v.id = i.id; v.text = i.text; v.t = Date.now(); if (!this.over) this.w.send({ k: 'inv', g: m.g, n: m.n, s: i.text }) }
    else if (m.k === 'ans' && m.g) { const v = this.inv.get(m.g); if (v && v.n === m.n) try { await this.s.accept(m.s) } catch { /* a repeat of one already taken */ } }
  }
  // ---- guest
  private knock(fresh: boolean) { if (this.over) return; clearTimeout(this.timer); if (fresh) { this.nonce = randId(); this.ans = ''; this.t0 = Date.now(); this.inFlight = false } const stale = Date.now() - this.t0 > (this.ans ? 13000 : 9000); if (stale && !fresh) { this.knock(true); return } if (this.w.live) this.w.send(this.ans ? { k: 'ans', g: this.me, n: this.nonce, s: this.ans } : { k: 'knock', g: this.me, n: this.nonce }); else this.t0 = Date.now(); this.timer = setTimeout(() => this.knock(false), this.w.live ? 2400 : 500) }
  private async asGuest(m: any) { if (m.k !== 'inv' || m.g !== this.me || m.n !== this.nonce || this.inFlight || this.ans) return; this.inFlight = true; const n = this.nonce; try { this.s.reset(); const a = await this.s.answer(m.s); if (n !== this.nonce || this.over) return; this.ans = a; this.t0 = Date.now(); clearTimeout(this.timer); this.knock(false) } catch { this.inFlight = false } }
  get relays() { return this.w.live }
  send(to: string | null, m: any) { this.s.send(to, m) } fast(to: string | null, m: any) { this.s.fast(to, m) } bytes(to: string, b: Uint8Array, meta: any) { return this.s.bytes(to, b, meta) } peers() { return this.s.peers() } close() { this.over = true; clearTimeout(this.timer); clearInterval(this.timer); this.w?.close(); this.s.close() }
}
export function clean(t: string) { let s = t.trim(); const k = s.match(/[#&?](?:j|a)=([^&\s]+)/); if (k) s = decodeURIComponent(k[1]); return s.replace(/\s+/g, '') }
/** several transports at once behave like one */
export class Hub extends Base {
  kind = 'code' as const; list: Transport[] = []; private owner = new Map<string, Transport>()
  add(t: Transport) { this.list.push(t); t.onJoin = id => { this.owner.set(id, t); this.onJoin(id) }; t.onLeave = id => { this.owner.delete(id); this.onLeave(id) }; t.onMsg = (id, m) => { if (!this.owner.has(id)) this.owner.set(id, t); this.onMsg(id, m) }; t.onBytes = (id, b, m) => this.onBytes(id, b, m); t.onFail = w => this.onFail(w) }
  send(to: string | null, msg: any) { if (to) this.owner.get(to)?.send(to, msg); else for (const t of this.list) t.send(null, msg) } fast(to: string | null, msg: any) { if (to) this.owner.get(to)?.fast(to, msg); else for (const t of this.list) t.fast(null, msg) }
  async bytes(to: string, b: Uint8Array, meta: any) { await this.owner.get(to)?.bytes(to, b, meta) } peers() { return this.list.flatMap(t => t.peers()) } close() { for (const t of this.list) t.close(); this.list = []; this.owner.clear() }
}
