// The campaigns on the shelf. Headers are read at once; the text itself is fetched when wanted.
import { parseMod, type Mod } from './parse'
const FILES = import.meta.glob('./*.txt', { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>
const cache = new Map<string, Promise<Mod>>()
export const moduleIds = () => Object.keys(FILES).map(k => k.slice(2, -4)).sort()
export function loadModule(id: string): Promise<Mod | null> { const f = FILES[`./${id}.txt`]; if (!f) return Promise.resolve(null); let p = cache.get(id); if (!p) cache.set(id, p = f().then(parseMod)); return p }
export type { Mod }
