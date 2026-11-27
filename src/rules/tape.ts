// A transaction over the rules. Dice are written on a tape; when a player must throw one, everything is undone, the player is asked, and it runs again.
export interface Roller { id: string; kind: 'hit' | 'dmg' | 'save' | 'check' | 'init' | 'death' | 'heal' | 'luck'; label: string; mod?: number; adv?: number; dst?: string; dc?: number; type?: string; note?: string }
export interface Entry { who: string; d: number; v: number; wait?: boolean }
export interface Need { rc: Roller; at: number[]; dice: number[] }
export interface Tape { list: Entry[]; pos: number; need: Need[]; out: (() => void)[] }
export const NEED = Symbol('a die is needed')
export const TAPE = (): Tape => ({ list: [], pos: 0, need: [], out: [] })
const obj = (x: any): x is Record<string, any> => !!x && typeof x === 'object'
/** put `to` back as it was in `from`, keeping the identity of the objects others may hold */
export function restore(to: any, from: any, skip: string[] = []) {
  if (Array.isArray(from)) { to.length = from.length; for (let i = 0; i < from.length; i++) to[i] = put(to[i], from[i]); return }
  for (const k in to) if (!(k in from) && !skip.includes(k)) delete to[k]
  for (const k in from) if (!skip.includes(k)) to[k] = put(to[k], from[k])
}
function put(a: any, b: any) { if (obj(a) && obj(b) && Array.isArray(a) === Array.isArray(b)) { restore(a, b); return a } return b }
