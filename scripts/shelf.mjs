// The backs of the boxes: what the shelf shows without opening a campaign. Run by the build.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
const hours = existsSync('docs/campaign-hours.json') ? JSON.parse(readFileSync('docs/campaign-hours.json', 'utf8')) : {}
const out = []; for (const f of readdirSync('src/modules').filter(f => f.endsWith('.txt'))) {
  const t = readFileSync('src/modules/' + f, 'utf8'), g = k => (new RegExp(`^${k}: (.+)$`, 'm').exec(t) ?? [])[1] ?? ''; const about = [...t.matchAll(/^about: (.+)$/gm)].map(m => m[1]); const lv = /(\d+)\D+(\d+)/.exec(g('levels'))
  const places = [...t.matchAll(/^place (\w+) = ([^|]+)\| *(\w+)/gm)].map(m => ({ key: m[1], name: m[2].trim(), kind: m[3] })); const ch = [...t.matchAll(/^== ([^|\n]+)\| *(\d+) *\| *(\w+)/gm)].map(m => ({ title: m[1].trim(), lvl: +m[2], at: places.find(p => p.key === m[3])?.name ?? '' }))
  const pat = g('patron').split('|').map(s => s.trim()); const n = re => (t.match(re) ?? []).length
  out.push({ id: g('id'), code: g('code'), title: g('title'), lo: +lv[1], hi: +lv[2], tags: g('tags').split(',').map(s => s.trim()), tone: g('tone'), inks: g('ink').split(/\s+/), pitch: g('pitch'), about, patron: pat, places, chapters: ch, hours: hours[g('id')] ?? null, words: t.split(/\s+/).length, people: n(/^-- npc /gm), fights: n(/^-- (fight|boss) /gm), scenes: n(/^-- (scene|trial|puzzle) /gm), endings: n(/^ending/gm) })
}
out.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })); writeFileSync('src/modules/shelf.json', JSON.stringify(out, null, 1)); console.log(out.length + ' campaigns on the shelf')
