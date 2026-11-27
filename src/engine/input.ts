import type { View } from './view'
/** keyboard, mouse and touch, turned into a move vector, look deltas and taps */
export interface Tap { x: number; y: number; button: number; shift: boolean; ctrl: boolean; alt: boolean }
export class Input {
  keys = new Set<string>(); move = { x: 0, y: 0 }; stick = { x: 0, y: 0, on: false, cx: 0, cy: 0 }; locked = false; sens = 1; enabled = true
  onTap: (t: Tap) => void = () => { }; onDrag: (s: 'start' | 'move' | 'end', t: Tap) => boolean = () => false; onHover: (t: Tap) => void = () => { }; onKey: (k: string, e: KeyboardEvent) => void = () => { }; onWheel: (e: WheelEvent) => boolean = () => false; onLook: () => void = () => { }
  private pts = new Map<number, { x: number; y: number; sx: number; sy: number; t: number; role: string; btn: number }>(); private pinch = 0; private twist = 0; wantLock = false; touch = false; panned = false; private off: (() => void)[] = []
  constructor(private el: HTMLElement, private view: View, private panBy: (dx: number, dy: number) => void) {
    const on = (t: EventTarget, k: string, f: any, o?: any) => { t.addEventListener(k, f, o); this.off.push(() => t.removeEventListener(k, f, o)) }
    const typing = (e: Event) => { const t = e.target as HTMLElement; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) }
    on(window, 'keydown', (e: KeyboardEvent) => { if (!this.enabled || typing(e)) return; const k = e.code; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(k)) e.preventDefault(); if (!e.repeat) this.onKey(k, e); if (!e.ctrlKey && !e.metaKey) this.keys.add(k) }); on(window, 'keyup', (e: KeyboardEvent) => this.keys.delete(e.code)); on(window, 'blur', () => { this.keys.clear(); this.pts.clear(); this.stick.on = false; this.stick.x = this.stick.y = 0 })
    on(document, 'pointerlockchange', () => { this.locked = document.pointerLockElement === el })
    on(el, 'contextmenu', (e: Event) => e.preventDefault()); on(el, 'wheel', (e: WheelEvent) => { if (!this.enabled) return; e.preventDefault(); if (this.onWheel(e)) return; this.view.zoomBy(Math.exp(Math.sign(e.deltaY) * Math.min(1, Math.abs(e.deltaY) / 100) * .14)) }, { passive: false })
    on(el, 'pointerdown', (e: PointerEvent) => this.down(e)); on(window, 'pointermove', (e: PointerEvent) => this.moveP(e)); on(window, 'pointerup', (e: PointerEvent) => this.upP(e)); on(window, 'pointercancel', (e: PointerEvent) => this.upP(e, true))
  }
  private tap(e: PointerEvent): Tap { return { x: e.clientX, y: e.clientY, button: e.button, shift: e.shiftKey, ctrl: e.ctrlKey || e.metaKey, alt: e.altKey } }
  private down(e: PointerEvent) {
    if (!this.enabled) return; (document.activeElement as HTMLElement)?.blur?.(); this.touch = e.pointerType === 'touch'; const r = this.el.getBoundingClientRect(); let role = 'look'
    if (this.touch) { if (!this.view.flat && e.clientX - r.left < r.width * .42 && e.clientY - r.top > r.height * .3 && !this.stick.on) { role = 'stick'; this.stick = { x: 0, y: 0, on: true, cx: e.clientX, cy: e.clientY } } else role = this.view.flat ? 'pan' : 'look' }
    else if (this.view.flat) role = e.button === 0 ? 'tool' : 'pan'; else if (e.button === 0 && this.onDrag('start', this.tap(e))) role = 'tool2'
    if (this.touch && role === 'pan' && this.pts.size === 0 && this.onDrag('start', this.tap(e))) role = 'tool2'
    if (role === 'tool') { if (this.onDrag('start', this.tap(e))) role = 'tool2' }
    this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), role, btn: e.button }); this.panned = false; try { this.el.setPointerCapture(e.pointerId) } catch { /* synthetic events */ }
    if (this.pts.size === 2 && this.view.flat) { const [a, b] = [...this.pts.values()]; this.pinch = Math.hypot(a.x - b.x, a.y - b.y); this.twist = Math.atan2(b.y - a.y, b.x - a.x); if (a.role === 'tool2') this.onDrag('end', this.tap(e)); a.role = b.role = 'pinch' }
  }
  private moveP(e: PointerEvent) {
    if (!this.enabled) return; if (this.locked) { this.view.look(e.movementX * .0022 * this.sens, e.movementY * .0022 * this.sens); this.onLook(); return }
    const p = this.pts.get(e.pointerId); if (!p) { if (e.pointerType === 'mouse' && e.target === this.el) this.onHover(this.tap(e)); return } const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY
    if (p.role === 'stick') { let a = (p.x - this.stick.cx) / 52, b = (p.y - this.stick.cy) / 52; const L = Math.hypot(a, b); if (L > 1) { a /= L; b /= L } this.stick.x = a; this.stick.y = b }
    else if (p.role === 'look') { this.view.look(dx * (this.touch ? .0062 : .0046) * this.sens, dy * (this.touch ? .0052 : .0042) * this.sens); this.onLook() }
    else if (p.role === 'tool2') this.onDrag('move', this.tap(e))
    else if (p.role === 'pan') { if (Math.hypot(p.x - p.sx, p.y - p.sy) > 6) { this.panned = true; this.panBy(dx, dy) } }
    else if (p.role === 'pinch' && this.pts.size === 2) { const [a, b] = [...this.pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), t = Math.atan2(b.y - a.y, b.x - a.x); if (this.pinch > 0 && d > 0) this.view.zoomBy(this.pinch / d); let dt = t - this.twist; dt = Math.atan2(Math.sin(dt), Math.cos(dt)); if (this.view.mode === 'iso') { this.view.isoGoal += dt; this.view.isoYaw += dt } this.pinch = d; this.twist = t; this.panBy(dx * .5, dy * .5) }
  }
  private upP(e: PointerEvent, cancel = false) {
    const p = this.pts.get(e.pointerId); if (!p) return; this.pts.delete(e.pointerId); if (p.role === 'stick') { this.stick = { x: 0, y: 0, on: false, cx: 0, cy: 0 } ; if (!cancel && performance.now() - p.t < 220 && Math.hypot(p.x - p.sx, p.y - p.sy) < 9) this.onTap({ ...this.tap(e), button: 0 }); return }
    if (p.role === 'tool2') { this.onDrag('end', this.tap(e)); return } if (p.role === 'pinch') { for (const q of this.pts.values()) { q.role = 'pan'; q.sx = q.x; q.sy = q.y } return }
    if (!cancel && this.touch && performance.now() - p.t >= 420 && performance.now() - p.t < 1600 && Math.hypot(p.x - p.sx, p.y - p.sy) < 12) { this.onTap({ ...this.tap(e), button: 2 }); return }
    if (!cancel && performance.now() - p.t < 400 && Math.hypot(p.x - p.sx, p.y - p.sy) < (this.touch ? 12 : 6)) this.onTap({ ...this.tap(e), button: p.btn })
  }
  lock() { try { const r = (this.el as any).requestPointerLock?.(); r?.catch?.(() => { }) } catch { /* not available */ } } unlock() { if (this.locked) document.exitPointerLock() }
  /** -1..1 right / forward */
  vector(): [number, number] { const k = this.keys; let x = 0, y = 0; if (k.has('KeyD') || k.has('ArrowRight')) x++; if (k.has('KeyA') || k.has('ArrowLeft')) x--; if (k.has('KeyW') || k.has('ArrowUp')) y++; if (k.has('KeyS') || k.has('ArrowDown')) y--; if (this.stick.on) { x += this.stick.x; y -= this.stick.y } const L = Math.hypot(x, y); return L > 1 ? [x / L, y / L] : [x, y] }
  get run() { return this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || (this.stick.on && Math.hypot(this.stick.x, this.stick.y) > .92) }
  dispose() { this.off.forEach(f => f()); this.unlock() }
}
