import { readFileSync } from 'node:fs'
import { setCatalog } from '../src/core/catalog'
import { generate } from '../src/core/gen'
import { PRESETS } from '../src/core/presets'
import { Nav } from '../src/core/collide'
import { makeRng } from '../src/core/rng'
import { newGame } from '../src/rules/state'
import { defaultDraft, makeHero, raise } from '../src/rules/hero'
import { RACES } from '../src/rules/races'
import { Stage, bareHost } from '../src/dm/stage'
import { Director } from '../src/dm/director'
import { commit, order, populate } from '../src/dm/populate'
setCatalog(JSON.parse(readFileSync('public/assets/props.json', 'utf8')))
export function setup(preset: string, level = 1, classes = ['fighter', 'cleric', 'rogue', 'wizard'], mode: 'ai' | 'dm' = 'ai') {
  const P = PRESETS.find(p => p.id === preset)!; const w = generate(P.o); const nav = new Nav(w); const g = newGame(mode, { level, party: classes.length, askDice: false }); const b = populate(w, g, order(w).concat([...w.rooms.values()].filter(r => r.type === 'corridor')), { level, party: classes.length, set: g.set, seed: 's' + preset }, nav); const rng = makeRng('bots' + preset); const host = bareHost(w, nav); host.online = () => false; const s = new Stage(w, nav, g, host); s.env.rnd = n => rng.int(1, n); s.put(commit(g, b)); const d = new Director(s); d.r = makeRng('d' + preset); d.begin('heroic', 'c' + preset)
  classes.forEach((c, i) => s.seat('p' + i, raise(makeHero({ ...defaultDraft(c as any, RACES[(i * 3) % RACES.length].id), name: c[0].toUpperCase() + c.slice(1) }), level))); return { w, nav, g, s, d, rng, b }
}
