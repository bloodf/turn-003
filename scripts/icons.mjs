// collects the icons the interface uses out of the game-icons set (CC-BY 3.0, game-icons.net)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
const set = JSON.parse(readFileSync('node_modules/@iconify-json/game-icons/icons.json', 'utf8')).icons
const files = []; const walk = d => { for (const f of readdirSync(d)) { const p = d + '/' + f; if (statSync(p).isDirectory()) walk(p); else if (/\.(vue|ts)$/.test(f)) files.push(p) } }; walk('src')
const want = new Set(); for (const f of files) { const s = readFileSync(f, 'utf8'); for (const m of s.matchAll(/(?:icon|i)(?:=|: ?|", ")["'`]([a-z0-9-]+)["'`]/g)) want.add(m[1]); for (const m of s.matchAll(/<Icon[^>]*\bn="([a-z0-9-]+)"/g)) want.add(m[1]); for (const m of s.matchAll(/gi\('([a-z0-9-]+)'\)/g)) want.add(m[1]); for (const m of s.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)+)'/g)) if (set[m[1]] && f.endsWith('.vue')) want.add(m[1]) ; for (const m of s.matchAll(/\? '([a-z0-9]+)' : '([a-z0-9]+)'/g)) { want.add(m[1]); want.add(m[2]) } }
for (const f of files) if (/rules\/|dm\/|session/.test(f)) { const s = readFileSync(f, 'utf8'); for (const m of s.matchAll(/'([a-z][a-z0-9-]{1,40})'/g)) if (set[m[1]] && (m[1].includes('-') || /items|spells|base|classes/.test(f))) want.add(m[1]) }
const out = {}, miss = []; for (const n of [...want].sort()) if (set[n]) out[n] = set[n].body.replace(/ fill="currentColor"/g, ''); else miss.push(n)
writeFileSync('src/ui/icons.json', JSON.stringify(out)); console.log(Object.keys(out).length, 'icons'); if (process.argv[2]) console.log('not icons:', miss.join(' '))
