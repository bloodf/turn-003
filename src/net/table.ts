import type { Transport } from './transport'
import { World, squeeze, unsqueeze, type Token } from '../core/world'
import type { Op } from '../core/ops'
/** The rules of the table. The host owns the truth; guests ask. */
export interface Roll { id: string; who: string; color: string; expr: string; parts: { d: number; v: number[]; keep?: number }[]; mod: number; total: number; secret?: boolean; t: number; crit?: 'max' | 'min'; label?: string }
export interface Chat { id: string; who: string; color: string; text: string; t: number; to?: string; kind?: 'say' | 'sys' | 'whisper' | 'read' }
export interface Player { id: string; pid: string; name: string; hero: string; color: string; token: string; online: boolean; cls?: string; race?: string; level?: number; ping?: number }
export interface Shared { fog: boolean; freeMove: boolean; doors: boolean; turn: string | null; round: number; grid: boolean; paused: boolean }
export const COLORS = ['#c0392b', '#2e86c1', '#27935a', '#b9770e', '#7d3c98', '#148f8f', '#b0413e', '#5d6d7e']
/** "2d6+3", "d20 adv", "4d6kh3" */
export function parseRoll(src: string): { dice: { n: number; d: number; keep?: number; low?: boolean }[]; mod: number } | null {
  let s = src.toLowerCase().replace(/\s+/g, ' ').trim(); let adv = 0; if (/\badv(antage)?\b/.test(s)) adv = 1; if (/\bdis(advantage)?\b/.test(s)) adv = -1; s = s.replace(/\b(adv|advantage|dis|disadvantage)\b/g, '').replace(/ /g, ''); if (!s || !/^[+-]?(\d*d\d+(k[hl]\d+)?|\d+)([+-](\d*d\d+(k[hl]\d+)?|\d+))*$/.test(s)) return null
  const dice: any[] = []; let mod = 0; for (const m of s.matchAll(/([+-]?)(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))/g)) { const sg = m[1] === '-' ? -1 : 1; if (m[6]) { mod += sg * +m[6]; continue } const n = Math.min(40, +(m[2] || 1)), d = +m[3]; if (!n || d < 2 || d > 1000) return null; const q: any = { n, d }; if (m[4]) { q.keep = Math.min(n, +m[5]); q.low = m[4] === 'l' } if (adv && d === 20 && n === 1) { q.n = 2; q.keep = 1; q.low = adv < 0 } if (sg < 0) q.n = -n; dice.push(q) } return dice.length || mod ? { dice, mod } : null
}
const die = (d: number) => { const lim = Math.floor(4294967296 / d) * d, b = new Uint32Array(1); do crypto.getRandomValues(b); while (b[0] >= lim); return b[0] % d + 1 }
export function rollDice(expr: string, who: string, color: string, o: { secret?: boolean; label?: string } = {}): Roll | null {
  const p = parseRoll(expr); if (!p) return null; const parts: Roll['parts'] = []; let total = p.mod; let crit: Roll['crit']
  for (const q of p.dice) { const neg = q.n < 0, v = Array.from({ length: Math.abs(q.n) }, () => die(q.d)); let use = v; if (q.keep !== undefined) { use = [...v].sort((a, b) => q.low ? a - b : b - a).slice(0, q.keep) } total += (neg ? -1 : 1) * use.reduce((a, b) => a + b, 0); parts.push({ d: q.d, v, keep: q.keep !== undefined ? use[0] : undefined }); if (q.d === 20 && use.length === 1) crit = use[0] === 20 ? 'max' : use[0] === 1 ? 'min' : undefined }
  return { id: Math.random().toString(36).slice(2), who, color, expr, parts, mod: p.mod, total, t: Date.now(), crit, ...o }
}
export interface HostHooks { world(): World; fow(): Uint8Array | null; shared(): Shared; players(): Player[]; onJoin(p: { peer: string; pid: string; name: string; hero: any }): Player | string; onDo(peer: string, m: any): Promise<any>; view(): any; onLeave(peer: string): void; onMove(peer: string, m: any): void; onOp(peer: string, op: Op): boolean; onRoll(peer: string, m: any): void; onChat(peer: string, m: any): void; onPing(peer: string, m: any): void; onSeen(peer: string, m: any): void; onFail(w: string): void; log(): { chat: Chat[]; rolls: Roll[]; beats: any[] } }
export class Host {
  private pid = new Map<string, string>()
  constructor(public t: Transport, private h: HostHooks) {
    t.onMsg = (id, m) => this.msg(id, m); t.onLeave = id => { if (this.pid.delete(id)) h.onLeave(id) }; t.onJoin = id => t.send(id, { t: 'hello', v: 2, name: h.world().meta.name }); t.onFail = w => h.onFail(w)
  }
  private async msg(id: string, m: any) {
    if (!m || typeof m !== 'object') return
    if (m.t === 'join') { const name = String(m.name ?? 'Stranger').slice(0, 24), pid = String(m.pid ?? id).slice(0, 40); const p = this.h.onJoin({ peer: id, pid, name, hero: m.hero }); if (typeof p === 'string') { this.t.send(id, { t: 'bye', why: p }); return } for (const [k, v] of this.pid) if (v === pid && k !== id) { this.t.send(k, { t: 'bye', why: 'You opened this table in another window.' }); this.pid.delete(k) } this.pid.set(id, pid); await this.sendWorld(id, p); return }
    if (!this.pid.has(id)) return
    if (m.t === 'mv') this.h.onMove(id, m); else if (m.t === 'op') { if (!this.h.onOp(id, m.op)) this.t.send(id, { t: 'nope' }) } else if (m.t === 'roll') this.h.onRoll(id, m); else if (m.t === 'chat') this.h.onChat(id, m); else if (m.t === 'ping') this.h.onPing(id, m); else if (m.t === 'seen') this.h.onSeen(id, m); else if (m.t === 'do') { const r = await this.h.onDo(id, m.m).catch(e => { console.error(e); return { ok: false, why: 'That went wrong.' } }); this.t.send(id, { t: 'did', rid: m.rid, r }) } else if (m.t === 'resync') { const p = this.h.players().find(q => q.id === id); if (p) await this.sendWorld(id, p) } else if (m.t === 'rtt') this.t.fast(id, { t: 'rtt', k: m.k })
  }
  async sendWorld(id: string, p: Player) { const w = this.h.world(); const hidden = [...w.tokens.values()].filter(t => t.hidden); hidden.forEach(t => w.tokens.delete(t.id)); const notes = new Map<number, string>(); for (const r of w.rooms.values()) { notes.set(r.id, r.notes); r.notes = '' } const game = w.game; w.game = null; const bytes = w.toBytes(); w.game = game; for (const r of w.rooms.values()) r.notes = notes.get(r.id) ?? ''; hidden.forEach(t => w.tokens.set(t.id, t)); const z = await squeeze(bytes); const f = this.h.fow(); const fz = f ? await squeeze(new Uint8Array(f)) : null; this.t.send(id, { t: 'welcome', you: p, shared: this.h.shared(), players: this.h.players(), log: this.h.log(), gs: this.h.view(), size: z.length }); await this.t.bytes(id, z, { k: 'world' }); if (fz) await this.t.bytes(id, fz, { k: 'fow' }) }
  all(m: any) { this.t.send(null, m) } fast(m: any) { this.t.fast(null, m) } to(id: string, m: any) { this.t.send(id, m) }
  close() { this.t.send(null, { t: 'bye', why: 'The Dungeon Master has closed the table.' }); setTimeout(() => this.t.close(), 150) }
}
export interface GuestHooks { onHello(name: string): void; onWelcome(m: any): void; onWorld(w: World): void; onFow(b: Uint8Array): void; onMsg(m: any): void; onLost(why: string): void; onFail(w: string): void; onProgress(k: number): void }
export class Guest {
  host: string | null = null; private timer: any; private last = 0; private over = false
  constructor(public t: Transport, private me: { name: string; hero: any; pid: string }, private h: GuestHooks) {
    t.onFail = w => h.onFail(w); t.onMsg = (id, m) => { if (!m) return; if (m.t === 'hello') { if (this.host && this.host !== id) return; this.host = id; h.onHello(m.name); t.send(id, { t: 'join', ...this.me }); return } if (id !== this.host) return; this.last = Date.now(); if (m.t === 'welcome') { h.onWelcome(m); return } if (m.t === 'bye') { this.over = true; clearInterval(this.timer); h.onLost(m.why); setTimeout(() => t.close(), 60); return } if (m.t === 'rtt') { return } h.onMsg(m) }
    t.onBytes = async (id, b, meta) => { if (id !== this.host) return; try { const u = await unsqueeze(new Uint8Array(b)); if (meta?.k === 'world') h.onWorld(World.fromBytes(u)); else if (meta?.k === 'fow') h.onFow(u); else if (meta?.k === 'op') h.onMsg({ t: 'op', op: JSON.parse(new TextDecoder().decode(u)) }) } catch (e) { console.error(e); t.send(id, { t: 'resync' }) } }
    t.onLeave = id => { if (id === this.host) { this.host = null; if (!this.over) h.onLost('Lost sight of the Dungeon Master. Trying to find the table again…') } }; this.timer = setInterval(() => { if (this.host) t.fast(this.host, { t: 'rtt', k: Date.now() }) }, 4000)
  }
  send(m: any) { if (this.host) this.t.send(this.host, m) } fast(m: any) { if (this.host) this.t.fast(this.host, m) }
  close() { this.over = true; clearInterval(this.timer); this.t.close() }
}
export type { Token }
