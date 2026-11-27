// The game state, sent in pieces. The host diffs, the guest patches.
import type { Game } from '../rules/state'
const MAPS = ['chars', 'mons', 'chests', 'traps', 'arm', 'sneak'] as const
export class Differ {
  private last = new Map<string, string>()
  /** everything that changed since the last call, as path -> value */
  diff(g: Game): Record<string, any> | null { const out: Record<string, any> = {}; const seen = new Set<string>(); const put = (k: string, v: any) => { seen.add(k); const s = JSON.stringify(v ?? null); if (this.last.get(k) !== s) { this.last.set(k, s); out[k] = v ?? null } }; for (const k in g) { if ((MAPS as readonly string[]).includes(k)) { const m = (g as any)[k]; for (const id in m) put(k + '/' + id, m[id]) } else if (k !== 'beats') put(k, (g as any)[k]) } for (const k of [...this.last.keys()]) if (!seen.has(k)) { this.last.delete(k); out[k] = null } return Object.keys(out).length ? out : null }
  reset() { this.last.clear() }
}
export function patch(g: Game, d: Record<string, any>) { for (const k in d) { const i = k.indexOf('/'); if (i > 0) { const a = k.slice(0, i), b = k.slice(i + 1); if (!(MAPS as readonly string[]).includes(a) || b === '__proto__') continue; const m = ((g as any)[a] ??= {}); if (d[k] === null) delete m[b]; else m[b] = d[k] } else if (k !== '__proto__') (g as any)[k] = d[k] } }
