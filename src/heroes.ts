// The heroes kept on this device.
import { reactive } from 'vue'
import { sanitize, type Hero } from './rules/hero'
const KEY = 'rw.heroes'
const read = (): Hero[] => { try { return (JSON.parse(localStorage.getItem(KEY) ?? '[]') as any[]).map(sanitize).filter(Boolean) as Hero[] } catch { return [] } }
export const mine = reactive({ list: read(), chosen: localStorage.getItem('rw.hero2') ?? '' })
export const chosen = () => mine.list.find(h => h.id === mine.chosen) ?? null
export function choose(id: string) { mine.chosen = id; localStorage.setItem('rw.hero2', id) }
const write = () => { try { localStorage.setItem(KEY, JSON.stringify(mine.list)) } catch { /* full */ } }
export function keep(h: Hero) { const c = JSON.parse(JSON.stringify(h)) as Hero; const i = mine.list.findIndex(x => x.id === c.id); if (i >= 0) mine.list[i] = c; else mine.list.unshift(c); write() }
export function forget(id: string) { mine.list = mine.list.filter(h => h.id !== id); if (mine.chosen === id) choose(''); write() }
export function exportHero(h: Hero) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ realmwright: 'hero', hero: h }, null, 1)], { type: 'application/json' })); a.download = h.name.replace(/[^\w\- ]+/g, '').trim().replace(/ +/g, '-').toLowerCase() + '.hero.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000) }
export async function importHero(f: File): Promise<Hero | null> { try { const j = JSON.parse(await f.text()); const h = sanitize(j.hero ?? j); if (h) keep(h); return h } catch { return null } }
