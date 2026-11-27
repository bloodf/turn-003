import { N } from '../core/defs'
export { CEIL, FLAG, w2c } from '../core/defs'
export const idx_ = (x: number, z: number) => z * N + x
export class Emitter<T extends Record<string, any>> { private m = new Map<keyof T, Set<(a: any) => void>>(); on<K extends keyof T>(k: K, f: (a: T[K]) => void) { (this.m.get(k) ?? this.m.set(k, new Set()).get(k)!).add(f); return () => this.m.get(k)?.delete(f) } emit<K extends keyof T>(k: K, a: T[K]) { this.m.get(k)?.forEach(f => f(a)) } clear() { this.m.clear() } }
