import { describe, expect, it } from 'vitest'
import { makeRng } from '../src/core/rng'
import { Rules } from '../src/rules/engine'
import { Arena } from '../src/rules/env'
import { autoFight } from '../src/rules/brain'
import { newGame, type CallGroup } from '../src/rules/state'
import { defaultDraft, makeHero, raise } from '../src/rules/hero'
import { monster } from '../src/rules/monsters'
function arena(cls: string[], foes: string[], seed: string, level = 3) {
  const r = makeRng(seed), env = new Arena(n => 1 + Math.floor(r() * n)), g = newGame('dm'); const R = new Rules(g, env)
  cls.forEach((c, i) => { g.chars['h' + i] = raise(makeHero({ ...defaultDraft(c as any), name: c }), level); env.at.set('h' + i, { x: 6 + i * 1.5, y: 0, z: 9 }) })
  foes.forEach((f, i) => { const M = monster(f)!; g.mons['m' + i] = { id: 'm' + i, ref: f, name: M.name + i, side: 'foe', hp: M.hp, max: M.hp, temp: 0, conds: [], used: {}, state: 'idle', room: 0, home: { x: 0, y: 0, z: 0 } }; env.at.set('m' + i, { x: 6 + i * 1.5, y: 0, z: 13.5 }) })
  return { R, g, env, r }
}
describe('the tape: players throw their own dice', () => {
  it('asks for the attack, then the damage, and uses exactly those dice', async () => {
    const { R, g } = arena(['fighter'], ['ogre'], 'a'); R.start(['m0']); while (R.current() !== 'h0') R.next(); g.chars.h0.hp = 500; R.env.place('m0', { x: 6, y: 0, z: 10.5 })
    const asked: CallGroup[][] = []; R.wants = () => true; R.call = async q => { asked.push(q); return q.map(x => x.dice.map(d => d === 20 ? 15 : 3)) }; const evs: any[] = []; R.onEvent = e => evs.push(e)
    const a = R.attacksOf('h0')[0]; const hp = g.mons.m0.hp; const x: any = await R.atom(() => R.attack('h0', a.id, 'm0')); expect(x.hit).toBe(true)
    expect(asked.map(q => q.map(y => y.kind))).toEqual([['hit'], ['dmg']]); expect(asked[0][0].mod).toBe(a.hit); expect(asked[0][0].dice).toEqual([20]); const want = asked[1][0].dice.length * 3 + asked[1][0].mod; expect(hp - g.mons.m0.hp).toBe(want); expect(evs.filter(e => e.t === 'attack').length).toBe(1); expect(evs.find(e => e.t === 'attack').called).toBe(true); expect(g.combat!.econ.h0.act).toBe(0)
  })
  it('taking it back changes nothing', async () => {
    const { R, g } = arena(['fighter'], ['ogre'], 'b'); R.start(['m0']); while (R.current() !== 'h0') R.next(); R.env.place('m0', { x: 6, y: 0, z: 10.5 }); const econ = g.combat!.econ.h0; const before = JSON.stringify(g); R.wants = () => true; R.call = async () => null; const x: any = await R.atom(() => R.attack('h0', R.attacksOf('h0')[0].id, 'm0')); expect(x.ok).toBe(false); expect(JSON.stringify(g)).toBe(before); expect(g.combat!.econ.h0).toBe(econ)
  })
  it('a miss asks for no damage; a natural 1 misses', async () => { const { R } = arena(['fighter'], ['ogre'], 'c'); R.start(['m0']); while (R.current() !== 'h0') R.next(); R.env.place('m0', { x: 6, y: 0, z: 10.5 }); const k: string[] = []; R.wants = () => true; R.call = async q => { k.push(q[0].kind); return q.map(x => x.dice.map(() => 1)) }; const x: any = await R.atom(() => R.attack('h0', R.attacksOf('h0')[0].id, 'm0')); expect(x.hit).toBe(false); expect(k).toEqual(['hit']) })
  it('everyone caught in a breath is asked for a save at once, in the monster’s turn', async () => {
    const { R, g } = arena(['fighter', 'cleric', 'rogue'], ['red_young'], 'd', 5); R.start(['m0']); while (R.current() !== 'm0') R.next(); const asked: CallGroup[][] = []; R.wants = () => true; R.call = async q => { asked.push(q); return q.map(x => x.dice.map(() => 10)) }; const act = monster('red_young')!.acts.find(a => a.area === 'cone')!; const h0 = g.chars.h0.hp; await R.atom(() => R.special('m0', act, { at: R.env.pos('h1')! })); const saves = asked.find(q => q[0].kind === 'save')!; expect(saves.length).toBe(3); expect(new Set(saves.map(s => s.who)).size).toBe(3); expect(g.chars.h0.hp).toBeLessThan(h0)
  })
  it('a fireball asks for its damage once, and monsters do not reroll', async () => {
    const { R, g } = arena(['wizard'], ['goblin', 'goblin', 'goblin'], 'e', 5); g.chars.h0.prepared.push('fireball'); R.start(['m0', 'm1', 'm2']); while (R.current() !== 'h0') R.next(); const k: string[] = []; R.wants = () => true; R.call = async q => { k.push(q.map(x => x.kind + x.dice.length).join()); return q.map(x => x.dice.map(() => 1)) }; const slots = JSON.stringify(g.chars.h0.slots); await R.atom(() => R.cast('h0', 'fireball', { at: { x: 7.5, y: 0, z: 13.5 } })); expect(k).toEqual(['dmg8']); expect(g.chars.h0.slots[3]).toBe(1); expect(slots).not.toBe(JSON.stringify(g.chars.h0.slots))
  })
  it('initiative is thrown by all together, and the order follows the dice', async () => { const { R, g } = arena(['fighter', 'rogue'], ['goblin'], 'f'); const k: CallGroup[][] = []; R.wants = () => true; R.call = async q => { k.push(q); return q.map(x => x.dice.map(() => x.who === 'h1' ? 20 : 2)) }; await R.atom(() => (R.start(['m0']), 0)); expect(k[0].map(x => x.kind)).toEqual(['init', 'init']); expect(g.combat!.order.find(t => t.id === 'h1')!.d).toBe(20) })
  it('whole fights, every hero die in a player’s hand: they end, nothing is lost or doubled', async () => {
    let won = 0, calls = 0; const CL = ['barbarian', 'bard', 'cleric', 'druid', 'fighter', 'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard']
    for (let i = 0; i < 60; i++) { const { R, g, r } = arena([CL[i % 12], CL[(i * 5 + 3) % 12], CL[(i * 7 + 1) % 12]], ['orc', 'orc', 'goblin'], 'w' + i, 1 + i % 9); R.wants = () => true; R.call = async q => { calls++; for (const x of q) { expect(x.dice.length).toBeGreaterThan(0); expect(g.chars[x.who]).toBeTruthy() } return q.map(x => x.dice.map(d => 1 + Math.floor(r() * d))) }; const ids = new Set<string>(); R.onEvent = e => { expect(ids.has(e.id)).toBe(false); ids.add(e.id) }; await R.atom(() => (R.start(['m0', 'm1', 'm2']), 0)); let n = 0
      // heroes act through the same transactions a player would
      const { heroTurn, monsterTurn } = await import('../src/rules/brain'); for (const f of ['attack', 'cast', 'feature'] as const) { const o = (R as any)[f].bind(R); void o } while (g.combat && n++ < 400) { const id = R.current()!; if (g.chars[id]) { const foe = R.ids().find(q => R.hostile(q, id) && R.alive(q)); if (foe) { R.wants = () => false; await heroTurnApproach(R, id, foe); R.wants = () => true; const d = R.dist(id, foe); const a = R.attacksOf(id).find(x => d <= (x.ranged ? Math.max(...x.range) : x.reach)); if (a) await R.atom(() => R.attack(id, a.id, foe)) } } else await monsterTurn(R, id); void heroTurn; if (g.combat && R.current() === id) await R.atom(() => (R.next(), 0)) }
      expect(g.combat).toBeNull(); for (const id in g.chars) { expect(g.chars[id].hp).toBeGreaterThanOrEqual(0) } if (R.up().length) won++ }
    console.log(`tape fights won ${won}/60 with ${calls} calls`); expect(won).toBeGreaterThan(25); void autoFight
  }, 120000)
})
async function heroTurnApproach(R: Rules, id: string, foe: string) { const { approach } = await import('../src/rules/brain'); await approach(R, id, foe, 5, () => { }) }
