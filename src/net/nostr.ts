/** A whisper channel over free public Nostr relays, used only so two browsers can find each other.
 *  Everything is encrypted with the room code. Nothing of the game ever passes through here. */
import { schnorr } from '@noble/secp256k1'
export const RELAYS = ['nos.lol', 'relay.damus.io', 'relay.primal.net', 'nostr.mom', 'offchain.pub', 'nostr.data.haus', 'purplerelay.com', 'relay.mostr.pub', 'relay.mostro.network', 'staging.yabu.me'].map(u => 'wss://' + u)
const KIND = 25417 // ephemeral: relays pass it on and forget it
const hex = (u: Uint8Array) => [...u].map(b => b.toString(16).padStart(2, '0')).join(''); const enc = new TextEncoder(), dec = new TextDecoder()
const sha = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)))
const b64 = (u: Uint8Array) => { let s = ''; for (const b of u) s += String.fromCharCode(b); return btoa(s) }, un64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0))
export class Whisper {
  private ws = new Map<string, { s: WebSocket | null; tries: number; timer: any }>(); private seen = new Set<string>(); private topic = ''; private key!: CryptoKey; private sk: Uint8Array; private pk: string; private closed = false; onMsg: (m: any) => void = () => { }; onState: (open: number, total: number) => void = () => { }
  constructor(private code: string, private urls: string[]) { const k = schnorr.keygen(); this.sk = k.secretKey; this.pk = hex(k.publicKey) }
  async open() { this.topic = hex(await sha('realmwright-v1|' + this.code)); this.key = await crypto.subtle.importKey('raw', await sha('realmwright-key|' + this.code), 'AES-GCM', false, ['encrypt', 'decrypt']); for (const u of this.urls) { this.ws.set(u, { s: null, tries: 0, timer: 0 }); this.dial(u) } }
  get live() { let n = 0; for (const w of this.ws.values()) if (w.s?.readyState === 1) n++; return n }
  private dial(u: string) {
    const w = this.ws.get(u)!; if (this.closed) return; let s: WebSocket; try { s = new WebSocket(u) } catch { return } w.s = s
    s.onopen = () => { w.tries = 0; s.send(JSON.stringify(['REQ', 'rw', { kinds: [KIND], '#x': [this.topic], since: Math.floor(Date.now() / 1000) - 20 }])); this.onState(this.live, this.urls.length) }
    s.onmessage = async e => { let m: any; try { m = JSON.parse(e.data) } catch { return } if (m[0] !== 'EVENT' || !m[2] || m[2].pubkey === this.pk || this.seen.has(m[2].id)) return; this.seen.add(m[2].id); if (this.seen.size > 4000) this.seen = new Set([...this.seen].slice(-2000)); try { const b = un64(m[2].content); const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, this.key, b.slice(12)); if (!this.closed) this.onMsg(JSON.parse(dec.decode(p))) } catch { /* not for us */ } }
    const again = () => { if (w.s !== s) return; w.s = null; this.onState(this.live, this.urls.length); if (!this.closed) { clearTimeout(w.timer); w.timer = setTimeout(() => this.dial(u), Math.min(30000, 1500 * 2 ** w.tries++)) } }; s.onclose = again; s.onerror = () => { try { s.close() } catch { /* closing */ } }
  }
  async send(o: any) {
    if (this.closed) return; const iv = crypto.getRandomValues(new Uint8Array(12)); const c = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, enc.encode(JSON.stringify(o)))); const all = new Uint8Array(12 + c.length); all.set(iv); all.set(c, 12)
    const ev: any = { pubkey: this.pk, created_at: Math.floor(Date.now() / 1000), kind: KIND, tags: [['x', this.topic]], content: b64(all) }; const id = await sha(JSON.stringify([0, ev.pubkey, ev.created_at, ev.kind, ev.tags, ev.content])); ev.id = hex(id); ev.sig = hex(await schnorr.signAsync(id, this.sk)); const msg = JSON.stringify(['EVENT', ev]); for (const w of this.ws.values()) if (w.s?.readyState === 1) try { w.s.send(msg) } catch { /* dropped */ }
  }
  close() { this.closed = true; for (const w of this.ws.values()) { clearTimeout(w.timer); try { w.s?.close() } catch { /* closed */ } } this.ws.clear() }
}
