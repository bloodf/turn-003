// How creatures (and heroes left alone) fight.
import { average } from './base'
import { castable, has } from './hero'
import { item } from './items'
import type { MonAct } from './monsters'
import { spell } from './spells'
import type { Cell } from './env'
import { feet } from './env'
import type { Rules, Unit } from './engine'
import type { P } from './state'
export type Wait = (ms: number, id?: string) => Promise<void> | void
/** walk a route one step at a time, letting the rules react to every step */
export async function walk(R: Rules, id: string, cells: Cell[], wait: Wait): Promise<boolean> {
  for (const c of cells) { const f = R.env.pos(id); if (!f || !R.canAct(id)) return false; if (R.moveLeft(id) < 5 && R.g.combat) return false; const to: P = { x: c.x, y: c.y, z: c.z }; R.env.place(id, to, Math.atan2(to.x - f.x, to.z - f.z)); const ok = await R.atom(() => R.moved(id, f, to, 5)); await wait(170, id); if (!ok) return false } return true
}
/** the cell from which `ok` holds, reachable now, cheapest by `cost` */
export function spot(R: Rules, id: string, cells: Map<string, Cell>, ok: (p: Cell) => boolean, cost: (p: Cell) => number): Cell | null { let best: Cell | null = null, bc = 1e9; for (const c of cells.values()) { if (!ok(c)) continue; if (c.ft > 0 && R.occupied(c, id)) continue; const k = cost(c); if (k < bc) { bc = k; best = c } } return best }
/** edge to edge, the way the rules measure it */
const edge = (R: Rules, id: string, a: P, tid: string) => { const u = R.unit(id)!, t = R.unit(tid)!; return Math.max(0, Math.floor((feet(a, R.env.pos(tid)!) - u.rad - t.rad) / 5 + .45) * 5) }
/** go as far as possible toward a target, stopping when within reach and in sight */
export async function approach(R: Rules, id: string, tid: string, reach: number, wait: Wait, needLos = true, keep = 0): Promise<boolean> {
  const tp = R.env.pos(tid); if (!tp) return false; const close = (p: P) => edge(R, id, p, tid); const here = R.env.pos(id)!; if (close(here) <= reach && close(here) >= keep && (!needLos || R.env.los(here, tp))) return true
  const cells = R.flood(id); const goal = spot(R, id, cells, p => { const d = close(p); return d <= reach && d >= keep && (!needLos || R.env.los(p, tp)) }, p => p.ft); if (goal) { await walk(R, id, R.route(cells, goal), wait); const q = R.env.pos(id); return !!q && close(q) <= reach }
  const back = R.env.flood(tp, 320, () => false); const near = spot(R, id, cells, p => back.has(p.k), p => back.get(p.k)!.ft + p.ft * .01); if (near && near.ft > 0 && (back.get(near.k)?.ft ?? 1e9) < (back.get(R.env.key(here))?.ft ?? 1e9)) await walk(R, id, R.route(cells, near), wait); return close(R.env.pos(id)!) <= reach
}
const enemies = (R: Rules, id: string) => R.ids().filter(q => R.hostile(q, id) && R.alive(q))
function pick(R: Rules, id: string, L: string[]): string | null { const me = R.unit(id)!; let best: string | null = null, bs = -1e9; const smart = (me.M?.ab[3] ?? 10) >= 9; for (const q of L) { const t = R.unit(q)!; if (R.is(t, 'hidden') && !R.los(id, q)) continue; const d = R.dist(id, q); let s = -d * 1.1; if (d <= 5) s += 25; if (smart) { s += (1 - t.hp / t.max) * 14; if (R.is(t, 'concentrating')) s += 8; s -= (t.ac - 14) * .8 } if (me.conds.some(c => c.id === 'frightened' && c.src === q)) s -= 60; if (!R.los(id, q)) s -= 8; if (R.fx(t, m => m.invisible)) s -= 30; s += (hash(id + q + (R.g.combat?.round ?? 0)) % 10); if (s > bs) { bs = s; best = q } } return best }
const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }
function areaHits(R: Rules, id: string, a: MonAct, at: P) { const L = R.inArea(a.area, a.size ?? 30, R.env.pos(id)!, at).filter(q => q !== id); return { foes: L.filter(q => R.hostile(q, id)).length, mates: L.filter(q => !R.hostile(q, id)).length } }
/** one creature's whole turn */
export async function monsterTurn(R: Rules, id: string, wait: Wait = () => { }): Promise<void> {
  let u = R.unit(id); if (!u?.M || !R.canAct(id)) return; let foes = enemies(R, id); if (!foes.length) return; const M = u.M, e = R.econ(id)!
  if (R.is(u, 'turned') || u.conds.some(c => c.id === 'frightened') && M.cr < 2) { await flee(R, id, wait); return }
  if (R.is(u, 'grappled', 'restrained') && foes.every(q => R.dist(id, q) > 5 || !R.attacksOf(id).some(a => !a.ranged))) { R.action(id, 'escape'); await wait(500, id) }
  const mates = R.ids().filter(q => q !== id && R.sideOf(q) === u!.side && R.alive(q)).length
  if (!u.m?.boss && ['humanoid', 'giant', 'beast', 'monstrosity'].includes(M.type) && u.hp < u.max * .22 && !mates && R.g.combat!.round > 1 && hash(id) % 100 < 45) { await flee(R, id, wait); return }
  let tid = pick(R, id, foes); if (!tid) return; await wait(350, id)
  // ---- specials first: breath, webs, gazes, spells
  const ready = M.acts.filter(a => (a.k === 'save' || a.k === 'spell') && !(a.rc && u!.m?.used['a:' + a.n]) && !(a.uses && (u!.m?.used['a:' + a.n] ?? 0) >= a.uses))
  for (const a of ready) {
    if (a.k === 'spell') { if (hash(id + a.n + R.g.combat!.round) % 100 > (a.uses ? 70 : 85)) continue; const s = spell(a.spell!); const fx = s.fx; let tg: { ids?: string[]; at?: P } = {}
      if (fx.kind === 'heal') { const w = R.ids().filter(q => R.sideOf(q) === u!.side && R.alive(q) && R.dist(id, q) <= Math.max(5, s.range) && R.unit(q)!.hp < R.unit(q)!.max * .5); if (!w.length) continue; tg = { ids: [w[0]] } } else if (fx.kind === 'buff') { const fxid = fx.fx ?? ''; if (s.time === 'reaction' || R.g.combat!.round > 3 || R.is(u, fxid, 'concentrating')) continue; const allies = R.ids().filter(q => R.sideOf(q) === u!.side && R.alive(q) && R.dist(id, q) <= Math.max(5, s.range) && !R.is(R.unit(q)!, fxid)); tg = { ids: [id, ...allies.filter(q => q !== id)].slice(0, fx.targets ?? 1) } } else if (['save', 'attack', 'auto', 'zone'].includes(fx.kind)) {
        if (s.conc && R.is(u, 'concentrating')) continue; const range = Math.max(5, s.range || (fx.size ?? 5)); if (R.dist(id, tid) > range || !R.los(id, tid)) { await approach(R, id, tid, range, wait) } if (R.dist(id, tid) > range || !R.los(id, tid)) continue; const t = R.unit(tid)!; if (fx.cond && !fx.dmg && R.is(t, fx.cond)) continue; const at = R.env.pos(tid)!; if (fx.area) { const h = areaHits(R, id, { n: '', k: 'save', dmg: [], area: fx.area === 'cube' ? 'sphere' : fx.area, size: fx.size }, fx.self ? at : at); if (h.mates > 0 && h.mates >= h.foes) continue } tg = { ids: Array(Math.max(1, fx.beams ?? 1)).fill(tid), at }
      } else continue
      const r = await R.atom(() => R.special(id, a, tg)); await wait(900, id); if (r.ok) { if (e.act < 1) break } ; continue
    }
    const reach = a.area === 'cone' || a.area === 'line' ? a.size! : a.area === 'sphere' ? a.size! : a.range?.[0] ?? 30; if (!a.area && a.save?.cond && R.is(R.unit(tid)!, a.save.cond)) continue
    if (R.dist(id, tid) > reach || !R.los(id, tid)) { if (R.dist(id, tid) > reach + R.moveLeft(id)) continue; await approach(R, id, tid, reach, wait) } if (R.dist(id, tid) > reach || !R.los(id, tid)) continue
    const at = R.env.pos(tid)!; if (a.area) { let best = { at, s: -9 }; for (const q of foes) { const p = R.env.pos(q)!; if (R.dist(id, q) > reach || !R.los(id, q)) continue; const h = areaHits(R, id, a, p); const s = h.foes * 2 - (a.area === 'sphere' ? 0 : h.mates * 1.6); if (s > best.s) best = { at: p, s } } if (best.s <= 0) continue; const bp = best.at; await R.atom(() => R.special(id, a, { at: bp })) } else { const tt = tid; await R.atom(() => R.special(id, a, { ids: [tt] })) }
    await wait(1000, id); break
  }
  u = R.unit(id); if (!u || !R.canAct(id) || !R.g.combat) return
  if (e.act > 0 || e.atk > 0) await strikes(R, id, tid, wait)
  u = R.unit(id); if (u && R.canAct(id) && R.g.combat && M.traits.includes('nimbleEscape') && e.bonus > 0 && R.attacksOf(id).some(a => a.ranged) && u.hp < u.max * .6) { e.bonus--; if (!R.hide(id).ok) void 0 }
}
async function strikes(R: Rules, id: string, tid: string, wait: Wait) {
  const u = R.unit(id)!, M = u.M!, e = R.econ(id)!; let atks = R.attacksOf(id); const melee = atks.filter(a => !a.ranged), ranged = atks.filter(a => a.ranged); const clumsy = M.ab[3] <= 7
  let t: string | null = tid; if (!atks.length) { await approach(R, id, tid, 5, wait); return }
  const adj = melee.length && R.dist(id, tid) <= Math.max(...melee.map(a => a.reach)); const bestM = [...melee].sort((a, b) => average(b.dmg) - average(a.dmg))[0], bestR = [...ranged].sort((a, b) => average(b.dmg) - average(a.dmg))[0]
  let useR = false; if (!adj) { if (bestR && (!bestM || average(bestR.dmg) >= average(bestM.dmg) * .8 || R.dist(id, tid) > R.moveLeft(id) + 10)) useR = true }
  if (useR && !adj && !clumsy && bestR) { const range = Math.min(bestR.range[0], 90); const threat = enemies(R, id).some(q => R.dist(id, q) <= 5); await approach(R, id, tid, range, wait, true, threat ? 0 : 10); if (!(R.dist(id, tid) <= Math.max(...bestR.range) && R.los(id, tid))) useR = false } else if (useR) { await approach(R, id, tid, bestR!.range[0], wait); if (R.dist(id, tid) > Math.max(...bestR!.range) || !R.los(id, tid)) useR = false }
  if (!useR && bestM) { const reach = Math.max(...melee.map(a => a.reach)); let ok = await approach(R, id, tid, reach, wait); if (!ok && R.canAct(id) && R.g.combat) { const other = enemies(R, id).find(q => R.dist(id, q) <= reach && R.los(id, q)); if (other) { t = other; ok = true } else if (bestR && R.dist(id, tid) <= Math.max(...bestR.range) && R.los(id, tid)) { useR = true; ok = true } else if (e.act > 0) { const free = M.traits.includes('aggressive') && e.bonus > 0; R.action(id, 'dash', undefined, free ? 'bonus' : 'action'); ok = await approach(R, id, tid, reach, wait); if (!ok || e.act < 1) return } } if (!ok) return }
  const seq = M.multi.length ? M.multi : [(useR ? bestR : bestM ?? bestR)?.name ?? '']; let n = 0
  for (const want of seq) { if (!R.canAct(id) || !R.g.combat) return; if (!t || !R.alive(t)) { t = pick(R, id, enemies(R, id).filter(q => R.dist(id, q) <= 10 + R.moveLeft(id))); if (!t) return; const reach = useR ? 60 : Math.max(5, ...melee.map(a => a.reach)); if (!(await approach(R, id, t, reach, wait))) { t = enemies(R, id).find(q => R.dist(id, q) <= reach && R.los(id, q)) ?? null; if (!t) return } }
    const d = R.dist(id, t); let a = useR ? bestR! : atks.find(x => x.name === want && !x.ranged) ?? bestM ?? bestR!; if (!a.ranged && d > a.reach) { const b = atks.find(x => !x.ranged && x.reach >= d) ?? ranged.find(x => Math.max(...x.range) >= d); if (!b) continue; a = b } if (useR && n >= Math.max(1, M.multi.filter(x => ranged.some(r => r.name === x)).length || (M.multi.length > 1 ? 2 : 1))) break
    const tt: string = t; const r = await R.atom(() => R.attack(id, a.id, tt)); n++; if (!r.ok) break; await wait(950, id) }
}
export async function flee(R: Rules, id: string, wait: Wait) {
  const foes = enemies(R, id); const e = R.econ(id)!; if (e.act > 0) R.action(id, foes.some(q => R.dist(id, q) <= 5) && R.unit(id)!.speed >= 25 ? 'disengage' : 'dash'); const cells = R.flood(id); const far = spot(R, id, cells, () => true, p => -foes.reduce((a, q) => Math.min(a, feet(p, R.env.pos(q)!)), 999) - (foes.some(q => R.env.los(p, R.env.pos(q)!)) ? 0 : 30)); if (far && far.ft > 0) await walk(R, id, R.route(cells, far), wait)
  const m = R.g.mons[id]; if (m && !R.is(m, 'turned', 'frightened') && foes.every(q => R.dist(id, q) > 55 || !R.los(id, q)) && R.alive(id)) { m.state = 'fled'; R.ev({ t: 'note', src: id, type: 'fled', text: `${m.name} flees` }); R.leaveFightQuiet(id) }
}
/** a legendary creature strikes between turns */
export async function legendary(R: Rules, after: string, wait: Wait) { for (const id of R.ids()) { const u = R.unit(id); if (!u?.M?.legend || u.h || id === after || !R.alive(id) || !R.canAct(id) || !R.g.combat) continue; const used = u.m!.used.legend ?? 0; if (used >= u.M.legend) continue; const A = R.attacksOf(id).filter(a => !a.ranged); const t = enemies(R, id).find(q => A.some(a => R.dist(id, q) <= a.reach) && R.los(id, q)); if (!t) continue; u.m!.used.legend = used + 1; const a = A.find(x => R.dist(id, t) <= x.reach)!; await R.atom(() => R.attack(id, a.id, t, { free: true })); await wait(800, id) } }
/** a sensible turn for a hero whose player is away (and for the simulations) */
export async function heroTurn(R: Rules, id: string, wait: Wait = () => { }): Promise<void> {
  let u = R.unit(id); if (!u?.h || !R.canAct(id)) return; const h = u.h, e = R.econ(id)!; const foes = () => enemies(R, id); if (!foes().length) return
  if (R.is(u, 'prone')) R.action(id, 'stand')
  const hurt = R.heroes().filter(q => q !== id && R.g.chars[q].hp <= 0 && !R.g.chars[q].stable); const sp = h.shape ? [] : castable(u.S!); const can = (x: string) => sp.some(s => s.id === x) && !!R.spendSlot(h, sp.find(s => s.id === x)!.lv || 1, true)
  if (hurt.length) { if (can('healing_word') && R.dist(id, hurt[0]) <= 60 && R.los(id, hurt[0])) { R.cast(id, 'healing_word', { ids: [hurt[0]] }); await wait(600, id) } else if (can('cure_wounds') && e.act > 0) { if (await approach(R, id, hurt[0], 5, wait)) { R.cast(id, 'cure_wounds', { ids: [hurt[0]] }); await wait(600, id) } } }
  const pot = h.inv.find(s => s.id.startsWith('potion_h') || s.id.startsWith('potion_g')); if (u.hp < u.max * .3 && e.bonus > 0 && has(h, 'wind')) R.feature(id, 'wind'); else if (u.hp < u.max * .25 && pot && item(pot.id).heal && e.act > 0 && foes().length) { R.useItem(id, pot.uid); await wait(500, id) }
  if (has(h, 'rage') && !R.is(u, 'rage') && e.bonus > 0) R.feature(id, 'rage'); if (has(h, 'surge') && R.g.combat!.round === 1) R.feature(id, 'surge')
  let tid = pick(R, id, foes()); if (!tid) return; u = R.unit(id)!
  const caster = !!u.S!.cls.caster && u.S!.cls.caster.kind !== 'half' && u.S!.spellHit >= (u.S!.attacks[0]?.hit ?? 0)
  for (let k = 0; k < 3 && e.act > 0 && caster && !h.shape; k++) { const L = sp.filter(s => ['attack', 'save', 'auto'].includes(s.fx.kind) && s.fx.dmg && s.time === 'action' && !(s.fx.self && s.fx.area && R.dist(id, tid!) > (s.fx.size ?? 15))).filter(s => s.lv === 0 || R.spendSlot(h, s.lv, true)).sort((a, b) => (average(b.fx.dmg!) * (b.fx.area ? 1.5 : 1) * (b.fx.beams ?? 1)) - (average(a.fx.dmg!) * (a.fx.area ? 1.5 : 1) * (a.fx.beams ?? 1))); let s = L.find(x => { if (!x.fx.area || x.fx.self) return true; const q = R.inArea(x.fx.area, x.fx.size ?? 10, R.env.pos(id)!, R.env.pos(tid!)!); return !q.some(y => R.sideOf(y) === 'hero') && (x.lv < 3 || q.length >= 2) }); if (s && s.lv > 0 && R.unit(tid)!.hp < 8) s = L.find(x => x.lv === 0) ?? s; if (!s) break; const range = Math.max(5, s.range || (s.fx.size ?? 5)); if (!(await approach(R, id, tid, range, wait))) break; const tt: string = tid, sx = s; const r = await R.atom(() => R.cast(id, sx.id, { ids: Array(sx.fx.targets ?? 1).fill(tt), at: R.env.pos(tt)! })); await wait(800, id); if (!r.ok) break; if (!foes().length || !R.g.combat) return }
  for (let k = 0; k < 8 && (e.act > 0 || e.atk > 0 || e.flags.haste > 0) && R.canAct(id) && R.g.combat; k++) { tid = tid && R.alive(tid) ? tid : pick(R, id, foes()); if (!tid) break; const A = R.attacksOf(id); const m = A.filter(a => !a.ranged).sort((a, b) => average(b.dmg) + b.hit - average(a.dmg) - a.hit)[0], r = A.filter(a => a.ranged).sort((a, b) => average(b.dmg) - average(a.dmg))[0]; const main = h.inv.find(s => s.eq === 'main'); const bow = !!r && (!!main && A.find(a => a.at?.uid === main.uid)?.ranged || false); let use = bow ? r : m; if (!use) break
    if (!(await approach(R, id, tid, use.ranged ? use.range[0] : use.reach, wait))) { if (r && R.dist(id, tid) <= Math.max(...r.range) && R.los(id, tid)) use = r; else { if (e.act > 0 && !e.dash) { R.action(id, 'dash'); await approach(R, id, tid, use.reach, wait) } break } } if (has(h, 'smite') && R.spendSlot(h, 1, true) && !use.ranged) (R.g.arm[id] ??= {}).smite = 1; if (has(h, 'reckless') && e.swung === 0 && !use.ranged) R.feature(id, 'reckless'); const x = R.attack(id, use.id, tid); if (!x.ok) break; await wait(800, id) }
  if (R.g.combat && tid && R.alive(tid) && e.bonus > 0 && e.swung) { if (h.cls === 'monk' && R.dist(id, tid) <= 5) R.feature(id, has(h, 'flurry') ? 'flurry' : 'martial', { ids: [tid] }); else if (has(h, 'frenzy') && R.is(R.unit(id)!, 'rage') && R.dist(id, tid) <= 5) R.feature(id, 'frenzy', { ids: [tid] }); else { const off = h.inv.find(s => s.eq === 'off'); if (off && item(off.id).kind === 'weapon' && R.dist(id, tid) <= 5) R.attack(id, off.uid, tid, { off: true }) } }
}
/** run a whole fight with nobody watching */
export async function autoFight(R: Rules, max = 4000): Promise<{ rounds: number; turns: number; won: boolean }> { let turns = 0, rounds = 0; while (R.g.combat && turns < max) { const id = R.current(); if (!id) break; rounds = R.g.combat.round; turns++; if (R.g.chars[id]) await heroTurn(R, id); else await monsterTurn(R, id); if (R.g.combat) { await legendary(R, id, () => { }); if (R.g.combat && R.current() === id) R.next() } } return { rounds, turns, won: R.up().length > 0 && turns < max } }
export type { Unit }
