export interface Model { id: string; cat: string; lo: number[]; hi: number[]; tags: string[]; lod: any[]; fx: any[]; light: { p: number[]; c: number[]; i: number; r: number } | null; col?: string; mount?: string; fit?: string; top?: number; small?: number; flat?: number; back?: number; leafy?: number }
let C: Record<string, Model> = {}, LIST: Model[] = []
export function setCatalog(list: Model[]) { LIST = list; C = {}; for (const m of list) C[m.id] = m }
export const model = (id: string): Model | undefined => C[id]
export const models = () => LIST
export const radius = (m: Model) => Math.max(m.hi[0] - m.lo[0], m.hi[2] - m.lo[2]) / 2
/** horizontal collider kind. Trunks are thin even when the crown is wide. */
export function collider(m: Model): { k: 'c' | 'b'; r: number; hx: number; hz: number; ox: number; oz: number } | null {
  const c = m.col ?? 'box'; if (c === 'none') return null
  const hx = (m.hi[0] - m.lo[0]) / 2, hz = (m.hi[2] - m.lo[2]) / 2, ox = (m.hi[0] + m.lo[0]) / 2, oz = (m.hi[2] + m.lo[2]) / 2
  if (c === 'trunk') return { k: 'c', r: 0.42, hx: 0, hz: 0, ox: 0, oz: 0 }
  if (c === 'circle') return { k: 'c', r: Math.min(hx, hz) * 0.92, hx, hz, ox, oz }
  return { k: 'b', r: Math.hypot(hx, hz), hx, hz, ox, oz }
}
