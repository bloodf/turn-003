import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial'
import { Vector4 } from '@babylonjs/core/Maths/math.vector'
import { Constants } from '@babylonjs/core/Engines/constants'
import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder'
import type { Game, Hit } from './game'
import type { Tap } from './input'
import { World, idx, inb, type Prop } from '../core/world'
import { model } from '../core/catalog'
import { makeMesh } from './chunks'
import { CELL, N, E, FL, WS, FLAG, THEMES, TERRAIN, DIRS, WT, c2w, v2w, w2c, yawOf, CEIL, isDoor, type ThemeId } from '../core/defs'
import { makeRng } from '../core/rng'
import { furnish, clearRoom } from '../core/gen/furnish'
import { wallAround, clearDoorways, newRoom, rectCells } from '../core/gen/build'
import { nameRoom, nameAll } from '../core/gen/text'
import { drawRoom, expandRooms, stamp, STAMPS, type StampId } from '../core/gen/expand'
export type Tool = 'select' | 'prop' | 'room' | 'floor' | 'wall' | 'cave' | 'liquid' | 'height' | 'stairs' | 'terrain' | 'erase' | 'stamp' | 'grow' | 'roominfo'
export interface ToolState { tool: Tool; model: string; floor: string; wall: string; edge: number; theme: ThemeId; roomType: string; furnish: boolean; brush: number; liquid: 'water' | 'lava' | 'none'; raise: number; terrain: 'raise' | 'lower' | 'smooth' | 'flat' | 'paint'; layer: number; stamp: StampId; rot: number; snap: boolean; scale: number; strength: number; count: number; caves: number; stairDir: number; stairDown: boolean; ceil: number }
export const defaultTool = (): ToolState => ({ tool: 'select', model: 'barrel', floor: 'flagstone', wall: 'stone_wall', edge: E.Door, theme: 'stone', roomType: 'room', furnish: true, brush: 1, liquid: 'water', raise: 1, terrain: 'raise', layer: 2, stamp: 'cottage', rot: 0, snap: false, scale: 1, strength: .5, count: 4, caves: .15, stairDir: 0, stairDown: true, ceil: CEIL.vault })
/** turns pointer gestures into world edits */
export class Editor {
  s: ToolState = defaultTool(); sel: number | null = null; onSelect: (p: Prop | null) => void = () => { }; onRoom: (id: number | null) => void = () => { }; onEdit: (t: { op: any; inv: any }, label: string) => void = () => { }; toast: (m: string) => void = () => { }
  private rect: Mesh; private rectM: ShaderMaterial; private grid: Mesh; private gridM: ShaderMaterial; private ghost: Mesh | null = null; private ghostId = ''; private start: Hit | null = null; private last: Hit | null = null; private drag: { id: number; dx: number; dz: number; orig: Prop; moved: boolean } | null = null; private stroke: (() => void)[] = []; private snapW: { before: any } | null = null; private dirtyT = 0; gridOn = false; private strokeSet = new Set<string>(); private bound = false
  constructor(private g: Game) {
    const s = g.scene; this.rectM = new ShaderMaterial('rectM', s, 'rrect', { attributes: ['position', 'uv'], uniforms: ['world', 'viewProjection', 'col', 'dim'], needAlphaBlending: true }); this.rectM.disableDepthWrite = true; this.rectM.backFaceCulling = false; this.rectM.alphaMode = Constants.ALPHA_COMBINE; (this.rectM as any).disableDepthTest = true; this.rectM.depthFunction = Constants.ALWAYS; this.rect = CreateGround('rect', { width: 1, height: 1 }, s); this.rect.material = this.rectM; this.rect.isPickable = false; this.rect.setEnabled(false); this.rect.alphaIndex = 40; this.rect.alwaysSelectAsActiveMesh = true
    this.gridM = new ShaderMaterial('gridM', s, 'rgrid', { attributes: ['position'], uniforms: ['world', 'viewProjection', 'cen', 'col'], needAlphaBlending: true }); this.gridM.disableDepthWrite = true; this.gridM.backFaceCulling = false; this.gridM.alphaMode = Constants.ALPHA_COMBINE; this.grid = CreateGround('grid', { width: 1, height: 1 }, s); this.grid.material = this.gridM; this.grid.isPickable = false; this.grid.setEnabled(false); this.grid.alphaIndex = 4; this.grid.alwaysSelectAsActiveMesh = true
  }
  bind() { if (this.bound) return; this.bound = true; const i = this.g.input; i.onDrag = (st, t) => this.onDrag(st, t); i.onHover = t => this.hover(t); this.g.tapHook = (t, h, a) => this.tap(t, h, a); i.onWheel = e => { if (!this.g.editing) return false; if ((this.s.tool === 'prop' || this.sel) && e.altKey) { this.rotate(Math.sign(e.deltaY) * Math.PI / 12); return true } return false } }
  get active() { return this.g.editing }
  set(p: Partial<ToolState>) { Object.assign(this.s, p); if (p.tool) { this.select(null); this.hideRect(); this.start = null } this.updateGhost() }
  clear() { this.select(null); this.hideRect(); this.ghost?.dispose(false, false); this.ghost = null; this.ghostId = '' }
  /** grid overlay and ghost follow, once a frame */
  frame() { const g = this.g, on = (this.gridOn || g.editing) && g.view.flat && !!g.world; this.grid.setEnabled(on); if (on) { const f = g.view.focus, z = g.view.z * 3.2, y = g.shownLevel * 4 + .03; this.grid.position.set(f.x, y, f.z); this.grid.scaling.set(z * 2, 1, z * 2); this.gridM.setVector4('cen', new Vector4(f.x, f.z, z, CELL)); const a = (g.view.z > 46 ? .08 : .15) * (g.q.tier === 'low' ? .6 : 1); this.gridM.setVector4('col', new Vector4(.95, .82, .55, g.editing ? a * 1.25 : a)) } if (!g.editing && this.rect.isEnabled()) this.hideRect(); if (this.ghost && (!g.editing || this.s.tool !== 'prop')) this.ghost.setEnabled(false) }
  private showRect(x0: number, z0: number, x1: number, z1: number, y: number, c: [number, number, number, number]) { this.rect.setEnabled(true); this.rect.position.set((x0 + x1) / 2, y + .06, (z0 + z1) / 2); this.rect.scaling.set(Math.max(.05, x1 - x0), 1, Math.max(.05, z1 - z0)); this.rectM.setVector4('col', new Vector4(...c)); this.rectM.setVector4('dim', new Vector4(x1 - x0, z1 - z0, 0, 0)) }
  private hideRect() { this.rect.setEnabled(false) }
  private cellsRect(a: Hit, b: Hit) { return { x0: Math.max(2, Math.min(a.cx, b.cx)), z0: Math.max(2, Math.min(a.cz, b.cz)), x1: Math.min(N - 3, Math.max(a.cx, b.cx)), z1: Math.min(N - 3, Math.max(a.cz, b.cz)) } }
  private commit(label: string, fn: () => void) { const t = this.g.edit(fn); if (t) this.onEdit(t, label); return t }
  // ------------------------------------------------------------ select
  select(id: number | null) { this.sel = id; const p = id !== null ? this.g.world!.props.get(id) ?? null : null; if (!p) this.hideRect(); else this.outline(p); this.onSelect(p) }
  private outline(p: Prop) { const m = model(p.m); if (!m) return; const c = Math.abs(Math.cos(p.r)), s = Math.abs(Math.sin(p.r)), hx = (m.hi[0] - m.lo[0]) / 2 * p.s, hz = (m.hi[2] - m.lo[2]) / 2 * p.s, ex = hx * c + hz * s + .08, ez = hx * s + hz * c + .08, ox = (m.hi[0] + m.lo[0]) / 2 * p.s, oz = (m.hi[2] + m.lo[2]) / 2 * p.s, x = p.x + ox * Math.cos(p.r) + oz * Math.sin(p.r), z = p.z - ox * Math.sin(p.r) + oz * Math.cos(p.r); this.showRect(x - ex, z - ez, x + ex, z + ez, Math.max(p.y, p.l * 4), [1, .8, .3, 1]) }
  change(patch: Partial<Prop>, label = 'Change') { const p = this.sel !== null ? this.g.world!.props.get(this.sel) : null; if (!p) return; this.commit(label, () => this.g.world!.props.set(p.id, { ...p, ...patch })); this.select(p.id) }
  rotate(a: number) { if (this.s.tool === 'prop') { this.s.rot = (this.s.rot + a) % (Math.PI * 2); this.updateGhost(); return } if (this.sel !== null) { const p = this.g.world!.props.get(this.sel); if (p) this.change({ r: p.r + a }, 'Rotate') } }
  remove() { if (this.sel === null) return; const id = this.sel; this.commit('Remove', () => this.g.world!.props.delete(id)); this.select(null) }
  duplicate() { const p = this.sel !== null ? this.g.world!.props.get(this.sel) : null; if (!p) return; let id = 0; this.commit('Copy', () => { id = this.g.world!.addProp(p.m, p.x + .6, p.y, p.z + .6, p.r, p.l, p.s, p.t).id }); this.select(id) }
  // ------------------------------------------------------------ ghost
  private async updateGhost() {
    const id = this.s.tool === 'prop' && this.g.editing ? this.s.model : ''; if (id !== this.ghostId) { this.ghostId = id; this.ghost?.dispose(false, false); this.ghost = null; if (id) { const geo = await this.g.geo(id); if (!geo || this.ghostId !== id) return; const x = geo.x.slice(); for (let k = 0; k < x.length; k += 4) if (x[k] >= 100) x[k] = 0; this.ghost = makeMesh('ghost', { p: geo.p, n: geo.n, u: geo.u, c: geo.c, x, i: geo.i as any, lo: [0, 0, 0], hi: [0, 0, 0] }, this.g.scene, this.g.engine); (this.ghost as any).__solid = true; this.g.overlays.push(this.ghost); this.ghost.material = this.g.mats.get('door', this.g.flags); this.ghost.doNotSyncBoundingInfo = false; this.ghost.setEnabled(false) } } this.placeGhost()
  }
  private placeGhost() { if (!this.ghost || !this.last) return; const q = this.snapPlace(this.last); this.ghost.material = this.g.mats.get('door', this.g.flags); this.ghost.position.set(q.x, q.y + .01, q.z); this.ghost.rotation.y = q.r; this.ghost.scaling.setAll(this.s.scale); this.ghost.setEnabled(true) }
  /** where the chosen model would land: walls pull wall pieces, tables lift small things */
  snapPlace(h: Hit): { x: number; y: number; z: number; r: number } {
    const w = this.g.world!, m = model(this.s.model)!; let x = h.x, z = h.z, r = this.s.rot, y = h.l * 4; const v = w.levels.get(h.l); const i = inb(h.cx, h.cz) ? idx(h.cx, h.cz) : 0; if (h.l === 0 && w.terrain && (!v || v.floor[i] === TERRAIN)) y = w.terrainH(x, z); else if (v) y = h.l * 4 + v.h[i] * .25
    if (m.mount === 'wall' || m.back) { let best = 1.1, bx = x, bz = z, br = r; for (let d = 0; d < 4; d++) { const t = w.etype(h.l, h.cx, h.cz, d); if (t !== E.Wall && t !== E.Window && t !== E.Slit) continue; const f = DIRS[d], off = CELL / 2 - WT / 2 - .07; const px = f[0] ? c2w(h.cx) + f[0] * off : x, pz = f[1] ? c2w(h.cz) + f[1] * off : z, dist = Math.hypot(px - x, pz - z); if (dist < best) { best = dist; bx = px; bz = pz; br = yawOf(-f[0], -f[1]) } } x = bx; z = bz; if (best < 1.1) r = br }
    else if (m.fit === 'pillar' && !this.s.snap) { x = v2w(Math.round(x / CELL + N / 2)); z = v2w(Math.round(z / CELL + N / 2)) } else if (this.s.snap) { x = Math.round(x / .75) * .75; z = Math.round(z / .75) * .75 }
    if (m.small) { for (const c of this.g.nav.near(x, z, .1)) { const p = w.props.get(c.id), pm = p && model(p.m); if (p && pm?.top && p.l === h.l && Math.hypot(p.x - x, p.z - z) < 1.3) y = p.y + pm.top * p.s } } return { x, y, z, r }
  }
  // ------------------------------------------------------------ pointer
  private hover(t: Tap) {
    if (!this.active || !this.g.world) return; const h = this.g.pick(t, false); this.last = h; if (!h) { this.hideRect(); return } const s = this.s, y = h.l * 4; const gold: [number, number, number, number] = [1, .8, .35, .9], red: [number, number, number, number] = [1, .25, .15, .9]
    if (s.tool === 'prop') { this.placeGhost(); this.hideRect() }
    else if (s.tool === 'wall') { if (h.edge) this.edgeRect(h, y, gold); else this.hideRect() }
    else if (s.tool === 'stamp') { const S = STAMPS.find(q => q.id === s.stamp)!; const al = s.rot % 2 === 0, W = al ? S.w : S.d, D = al ? S.d : S.w, x0 = h.cx - (W >> 1), z0 = h.cz - (D >> 1); this.showRect(v2w(x0), v2w(z0), v2w(x0 + W), v2w(z0 + D), y, gold) }
    else if (s.tool === 'stairs') { const c = World.stairCells(this.stairAt(h) as any); const xs = c.map(q => q[0]), zs = c.map(q => q[1]); this.showRect(v2w(Math.min(...xs)), v2w(Math.min(...zs)), v2w(Math.max(...xs) + 1), v2w(Math.max(...zs) + 1), y, gold) }
    else if (s.tool === 'terrain') { const r = s.brush * CELL; this.showRect(h.x - r, h.z - r, h.x + r, h.z + r, h.y, gold) }
    else if (s.tool === 'select') { if (this.sel === null) this.hideRect() }
    else if (s.tool === 'grow' || s.tool === 'roominfo') { const q = this.g.world.roomAt(h.l, h.cx, h.cz); if (q) this.showRect(v2w(q.x0), v2w(q.z0), v2w(q.x1 + 1), v2w(q.z1 + 1), y, gold); else this.showRect(v2w(h.cx), v2w(h.cz), v2w(h.cx + 1), v2w(h.cz + 1), y, red) }
    else if (!this.start) { const b = s.tool === 'room' ? 0 : s.brush - 1; const x0 = h.cx - (b >> 1), z0 = h.cz - (b >> 1); this.showRect(v2w(x0), v2w(z0), v2w(x0 + b + 1), v2w(z0 + b + 1), y, s.tool === 'erase' ? red : gold) }
  }
  private edgeRect(h: Hit, y: number, c: any) { const e = h.edge!; if (e.d === 3) this.showRect(v2w(e.x), v2w(e.z) - .22, v2w(e.x + 1), v2w(e.z) + .22, y, c); else this.showRect(v2w(e.x) - .22, v2w(e.z), v2w(e.x) + .22, v2w(e.z + 1), y, c) }
  private onDrag(st: 'start' | 'move' | 'end', t: Tap): boolean {
    if (!this.active || !this.g.world) return false; if (st === 'start' && t.button !== 0) return false; if (st === 'start' && !this.g.view.flat && !['prop', 'select'].includes(this.s.tool)) return false; const s = this.s, h = this.g.pick(t, st === 'start' && s.tool === 'select'); if (st !== 'end') this.last = h
    if (st === 'start') {
      if (!h) return false
      if (s.tool === 'select') { if (h.prop) { this.drag = { id: h.prop.id, dx: h.prop.x - h.x, dz: h.prop.z - h.z, orig: h.prop, moved: false }; this.select(h.prop.id); return true } this.select(null); return false }
      if (s.tool === 'prop' && !this.g.view.flat) { this.placeProp(h); return true }
      this.start = h; this.strokeSet.clear(); if (['floor', 'cave', 'liquid', 'height', 'erase', 'terrain', 'wall'].includes(s.tool)) { this.beginStroke(); this.paint(h) } return true
    }
    if (st === 'move') {
      if (this.drag) { if (!h) return true; const p = this.g.world.props.get(this.drag.id)!; const m = model(p.m)!; let x = h.x + this.drag.dx, z = h.z + this.drag.dz, r = p.r, y = p.y; if (m.mount === 'wall' || m.back) { const keep = this.s.model; this.s.model = p.m; const q = this.snapPlace(h); this.s.model = keep; x = q.x; z = q.z; r = q.r } else if (this.s.snap || t.shift) { x = Math.round(x / .75) * .75; z = Math.round(z / .75) * .75 } if (!m.mount) { const g = this.g.nav; const w = this.g.world; const cx = w2c(x), cz = w2c(z); if (inb(cx, cz)) { const v = w.levels.get(p.l); if (v) y = p.l === 0 && v.floor[idx(cx, cz)] === TERRAIN ? w.terrainH(x, z) : m.small ? p.y : p.l * 4 + v.h[idx(cx, cz)] * .25 } void g } if (Math.hypot(x - p.x, z - p.z) > .02) { this.drag.moved = true; const np = { ...p, x, z, r, y }; this.preview(np); this.outline(np) } return true }
      if (!this.start || !h) return true; if (s.tool === 'room') { const q = this.cellsRect(this.start, h); this.showRect(v2w(q.x0), v2w(q.z0), v2w(q.x1 + 1), v2w(q.z1 + 1), h.l * 4, [1, .8, .35, .95]) } else if (['floor', 'cave', 'liquid', 'height', 'erase', 'terrain', 'wall'].includes(s.tool)) { this.paint(h); this.hover(t) } else if (s.tool === 'prop') this.placeGhost(); return true
    }
    // end
    if (this.drag) { const d = this.drag; this.drag = null; const np = this.previewP; this.endPreview(); if (d.moved && np) { this.commit('Move', () => this.g.world!.props.set(np.id, np)); this.select(np.id) } return true }
    const a = this.start; this.start = null; if (!a) return true; const b = h ?? this.last ?? a
    if (s.tool === 'room') { const q = this.cellsRect(a, b); if (q.x1 - q.x0 < 1 || q.z1 - q.z0 < 1) { this.toast('Drag out at least two squares each way.'); this.hideRect(); return true } this.commit('Room', () => { drawRoom(this.g.world!, a.l, q, { floor: s.floor, wall: s.wall, ceil: a.l >= 0 && this.g.world!.terrain ? CEIL.beams : s.ceil, theme: s.theme, type: s.roomType, furnish: s.furnish, seed: 'r' + Math.random() }); clearDoorways(this.g.world!, [a.l]) }); this.hideRect() }
    else if (s.tool === 'prop') this.placeProp(b); else if (s.tool === 'stamp') { let why = ''; const r = this.commit('Build', () => { const q = stamp(this.g.world!, s.stamp, b.l, b.cx, b.cz, s.rot % 4, 's' + Math.random()); if (!q.ok) why = q.why!; else clearDoorways(this.g.world!, [0, 1]) }); if (!r) this.toast(why || 'It does not fit there.') }
    else if (s.tool === 'stairs') this.putStairs(b); else if (s.tool === 'grow') { let why = '', made = 0; const r = this.commit('Grow', () => { const q = expandRooms(this.g.world!, { seed: 'g' + Math.random(), l: b.l, theme: s.theme, count: s.count, caves: s.caves, from: { x: b.cx, z: b.cz } }); made = q.made; why = q.why ?? '' }); this.toast(r && made ? `${made} new room${made > 1 ? 's' : ''} grew from here.` : why || 'Nothing could grow from there.') }
    else if (s.tool === 'roominfo') { const q = this.g.world.roomAt(b.l, b.cx, b.cz); this.onRoom(q?.id ?? null); if (!q) this.toast('That square is not part of a room.') }
    else this.endStroke()
    return true
  }
  private tap(_t: Tap, _h: Hit | null, _a: string | null): boolean { return this.active }
  private placeProp(h: Hit) { const q = this.snapPlace(h), s = this.s; const r = model(s.model)?.leafy || model(s.model)?.tags.includes('rock') ? s.rot + Math.random() * .0 : q.r; this.commit('Place', () => this.g.world!.addProp(s.model, q.x, q.y, q.z, r, h.l, s.scale)) }
  // ------------------------------------------------------------ drag preview of an existing prop
  private pv: Mesh | null = null; private previewP: Prop | null = null
  private preview(p: Prop) { this.previewP = p; if (!this.pv) { const id = p.m; this.g.geo(id).then(geo => { if (!geo || this.pv || !this.previewP) return; const x = geo.x.slice(); for (let k = 0; k < x.length; k += 4) if (x[k] >= 100) x[k] = 0; this.pv = makeMesh('pv', { p: geo.p, n: geo.n, u: geo.u, c: geo.c, x, i: geo.i as any, lo: [0, 0, 0], hi: [0, 0, 0] }, this.g.scene, this.g.engine); this.pv.material = this.g.mats.get('door', this.g.flags); this.pv.doNotSyncBoundingInfo = false; this.preview(this.previewP) }); return } this.pv.position.set(p.x, p.y + .02, p.z); this.pv.rotation.y = p.r; this.pv.scaling.setAll(p.s) }
  private endPreview() { this.pv?.dispose(false, false); this.pv = null; this.previewP = null }
  // ------------------------------------------------------------ brushes. A stroke is many small edits folded into one undo step
  private parts: { op: any; inv: any }[] = []
  private beginStroke() { this.parts = [] }
  private endStroke() { if (!this.parts.length) return; const p = this.parts; this.parts = []; this.onEdit({ op: p.map(q => q.op), inv: p.map(q => q.inv).reverse() } as any, 'Brush') }
  private paint(h: Hit) {
    const s = this.s, w = this.g.world!; if (s.tool === 'terrain') { const now = performance.now(); if (now - this.dirtyT < 90) return; this.dirtyT = now; this.sculpt(h); return }
    if (s.tool === 'wall') { if (!h.edge) return; const k = `${h.edge.x},${h.edge.z},${h.edge.d}`; if (this.strokeSet.has(k)) return; this.strokeSet.add(k); this.putEdge(h); return }
    const b = s.brush, x0 = h.cx - ((b - 1) >> 1), z0 = h.cz - ((b - 1) >> 1), cells: [number, number][] = []; for (let z = z0; z < z0 + b; z++) for (let x = x0; x < x0 + b; x++) { if (x < 2 || z < 2 || x > N - 3 || z > N - 3) continue; const k = x + ',' + z; if (this.strokeSet.has(k)) continue; this.strokeSet.add(k); cells.push([x, z]) } if (!cells.length) return
    const t = this.g.edit(() => {
      const lv = w.lv(h.l); for (const [x, z] of cells) {
        const i = idx(x, z), ground = h.l === 0 && !!w.terrain
        if (s.tool === 'floor') { const was = lv.floor[i]; lv.floor[i] = FL[s.floor]; if (!was && !ground) { lv.ceil[i] = s.ceil; const near = [0, 1, 2, 3].map(d => w.roomAt(h.l, x + DIRS[d][0], z + DIRS[d][1])).find(Boolean); if (near && !w.edge(h.l, x, z, DIRS.findIndex((d) => w.roomAt(h.l, x + d[0], z + d[1]) === near))) lv.room[i] = near.id } lv.flag[i] &= ~(FLAG.cave | FLAG.solid | FLAG.hole) }
        else if (s.tool === 'cave') { if (ground) continue; lv.floor[i] = FL[THEMES[s.theme].rock]; lv.ceil[i] = CEIL.rock; lv.flag[i] = FLAG.cave; lv.h[i] = 0; for (let d = 0; d < 4; d++) w.setEdge(h.l, x, z, d, 0) }
        else if (s.tool === 'liquid') { if (!lv.floor[i] || (ground && lv.floor[i] === TERRAIN)) continue; lv.flag[i] &= ~(FLAG.water | FLAG.lava); if (s.liquid === 'none') lv.h[i] = 0; else { lv.flag[i] |= s.liquid === 'lava' ? FLAG.lava : FLAG.water; lv.h[i] = lv.flag[i] & FLAG.cave ? -4 : -2 } }
        else if (s.tool === 'height') { if (!lv.floor[i] || (ground && lv.floor[i] === TERRAIN)) continue; lv.h[i] = Math.max(-4, Math.min(8, lv.h[i] + s.raise)) }
        else if (s.tool === 'erase') { for (const p of [...w.props.values()]) if (p.l === h.l && w2c(p.x) === x && w2c(p.z) === z) w.props.delete(p.id); if (!_soft(s)) { for (let d = 0; d < 4; d++) w.setEdge(h.l, x, z, d, 0); lv.floor[i] = ground ? TERRAIN : 0; lv.ceil[i] = 0; lv.flag[i] = 0; lv.h[i] = 0; lv.room[i] = 0 } }
      }
      if (s.tool === 'floor' && h.l < 0 || (s.tool === 'floor' && !w.terrain)) { // keep dug floors enclosed
        for (const [x, z] of cells) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (!inb(nx, nz)) continue; if (!w.open(h.l, nx, nz)) { if (!w.edge(h.l, x, z, d)) w.setEdge(h.l, x, z, d, E.Wall, WS[s.wall]) } else if (cells.some(c => c[0] === nx && c[1] === nz) || (this.strokeSet.has(nx + ',' + nz) && w.etype(h.l, x, z, d) === E.Wall)) w.setEdge(h.l, x, z, d, 0) } }
      if (s.tool === 'erase' && !_soft(s) && !(h.l === 0 && w.terrain)) for (const [x, z] of cells) for (let d = 0; d < 4; d++) { const nx = x + DIRS[d][0], nz = z + DIRS[d][1]; if (w.open(h.l, nx, nz) && !(w.flagAt(h.l, nx, nz) & FLAG.cave)) w.setEdge(h.l, x, z, d, E.Wall, WS[s.wall]) }
      for (const q of [...w.rooms.values()]) if (q.l === h.l && s.tool === 'erase' && !w.roomCells(q).length) w.rooms.delete(q.id)
    }); if (t) this.parts.push(t)
  }
  private putEdge(h: Hit) {
    const w = this.g.world!, e = h.edge!, s = this.s; const t = this.g.edit(() => {
      const set = (x: number, z: number, d: number, k: number) => w.setEdge(h.l, x, z, d, k, k === E.Rail ? (s.wall === 'planks' || s.wall === 'timber' ? 1 : 0) : k === E.Fence ? (s.wall === 'stone_wall' ? 2 : s.wall === 'planks' ? 1 : 0) : WS[s.wall])
      if (s.edge === E.GateA) { const [sx, sz] = e.d === 3 ? [1, 0] : [0, 1]; set(e.x, e.z, e.d, E.GateA); set(e.x + sx, e.z + sz, e.d, E.GateB) }
      else { const was = w.etype(h.l, e.x, e.z, e.d); if (was === E.GateA || was === E.GateB) { const k = was === E.GateA ? 1 : -1; const [sx, sz] = e.d === 3 ? [k, 0] : [0, k]; w.setEdge(h.l, e.x + sx, e.z + sz, e.d, E.Wall, WS[s.wall]) } set(e.x, e.z, e.d, s.edge) } if (isDoor(s.edge) || s.edge === E.Arch) clearDoorways(w, [h.l])
    }); if (t) this.parts.push(t)
  }
  private sculpt(h: Hit) {
    const w = this.g.world!; if (!w.terrain) { this.toast('This world has no land to shape.'); return } const s = this.s, R = s.brush + .5, cx = h.x / CELL + N / 2, cz = h.z / CELL + N / 2; const t = this.g.edit(() => {
      const T = w.terrain!, H = T.h.slice(); const at = (x: number, z: number) => z * (N + 1) + x; for (let z = Math.floor(cz - R); z <= cz + R; z++) for (let x = Math.floor(cx - R); x <= cx + R; x++) { if (x < 1 || z < 1 || x >= N || z >= N) continue; const d = Math.hypot(x - cx, z - cz) / R; if (d > 1) continue; const k = (1 - d * d) ** 1.5 * s.strength, i = at(x, z); const built = [[0, 0], [-1, 0], [0, -1], [-1, -1]].some(([a, b]) => { const f = w.floorAt(0, x + a, z + b); return f !== TERRAIN && f !== 0 })
        if (s.terrain === 'paint') { for (let c = 0; c < 4; c++) { const v = T.w[i * 4 + c]; T.w[i * 4 + c] = Math.round(v + ((c === s.layer ? 255 : 0) - v) * Math.min(1, k * .8)) } } else if (!built) { if (s.terrain === 'raise') T.h[i] = Math.min(30, H[i] + k * .6); else if (s.terrain === 'lower') T.h[i] = Math.max(-3.2, H[i] - k * .6); else if (s.terrain === 'smooth') T.h[i] = H[i] + ((H[i - 1] + H[i + 1] + H[i - N - 1] + H[i + N + 1]) / 4 - H[i]) * Math.min(1, k * 1.4); else T.h[i] = H[i] + (0 - H[i]) * Math.min(1, k) } }
      if (s.terrain === 'lower' && T.water === null) { let m = 0; for (const v of T.h) if (v < m) m = v; if (m < -1) T.water = -.55 } for (const p of [...w.props.values()]) if (p.l === 0 && Math.hypot(p.x - h.x, p.z - h.z) < (R + 1) * CELL) { const c = [w2c(p.x), w2c(p.z)]; if (w.floorAt(0, c[0], c[1]) === TERRAIN) { const ny = w.terrainH(p.x, p.z); if (Math.abs(ny - p.y) > .05) w.props.set(p.id, { ...p, y: ny - .03 }) } }
    }); if (t) this.parts.push(t)
  }
  private stairAt(h: Hit) { const d = this.s.stairDir; const s = { id: 0, l: h.l, dir: d, kind: 'stone' as const, x: d === 2 ? h.cx + 1 : h.cx, z: d === 3 ? h.cz + 1 : h.cz }; return s }
  private putStairs(h: Hit) {
    const w = this.g.world!, up = !this.s.stairDown; let why = ''; const r = this.commit('Stairs', () => {
      const l = up ? h.l : h.l - 1, s = { ...this.stairAt(h), l, id: w.nid++ }; const foot = World.stairCells(s); if (foot.some(([x, z]) => x < 3 || z < 3 || x > N - 4 || z > N - 4)) { why = 'Too close to the edge.'; return } if ([...w.stairs.values()].some(q => Math.abs(q.l - l) <= 1 && World.stairCells(q).some(c => foot.some(f => f[0] === c[0] && f[1] === c[1])))) { why = 'Another stair is in the way.'; return }
      const U = w.lv(l + 1), D = w.lv(l), th = THEMES[w.roomAt(h.l, h.cx, h.cz)?.theme ?? this.s.theme], ground = l + 1 === 0 && !!w.terrain; const F = new Set(foot.map(c => idx(c[0], c[1]))); const f = DIRS[s.dir]
      // landing beyond each end
      const ends: [number, number, number][] = []; for (const [x, z, i] of foot) { if (i === 0) ends.push([x - f[0], z - f[1], l]); if (i === 3) ends.push([x + f[0], z + f[1], l + 1]) }
      const mk = (x: number, z: number, q: number) => { const V = w.lv(q), k = idx(x, z); if (!V.floor[k]) { V.floor[k] = FL[th.floor]; V.ceil[k] = q >= 0 && w.terrain ? 0 : CEIL.slab } V.flag[k] &= ~(FLAG.hole | FLAG.solid) }
      for (const [x, z, q] of ends) { for (let e = 0; e < 2; e++) mk(x + (q === l ? -f[0] : f[0]) * e, z + (q === l ? -f[1] : f[1]) * e, q) }
      for (const [x, z] of foot) { const k = idx(x, z); U.floor[k] = 0; U.flag[k] = FLAG.hole; if (!ground) U.ceil[k] = U.ceil[k] || (l + 1 < 0 ? CEIL.slab : 0); if (!D.floor[k] || D.floor[k] === TERRAIN) D.floor[k] = FL[th.floor]; D.ceil[k] = 0; D.flag[k] &= ~FLAG.solid }
      for (const p of [...w.props.values()]) if ((p.l === l || p.l === l + 1) && F.has(idx(w2c(p.x), w2c(p.z)))) w.props.delete(p.id)
      for (const [x, z, i] of foot) for (let d = 0; d < 4; d++) { const a = x + DIRS[d][0], b = z + DIRS[d][1]; if (F.has(idx(a, b))) { w.setEdge(l, x, z, d, 0); w.setEdge(l + 1, x, z, d, 0); continue } const low = i === 0 && d === (s.dir + 2) % 4, high = i === 3 && d === s.dir; w.setEdge(l, x, z, d, low ? 0 : w.open(l, a, b) ? (w.edge(l, x, z, d) & 15) || E.Wall : E.Wall, WS[th.wall]); if (high) w.setEdge(l + 1, x, z, d, 0); else w.setEdge(l + 1, x, z, d, w.open(l + 1, a, b) ? E.Rail : E.Wall, w.open(l + 1, a, b) ? 0 : WS[th.wall]) }
      const land = ends.flatMap(([x, z, q]) => [[x, z, q], [x + (q === l ? -f[0] : f[0]), z + (q === l ? -f[1] : f[1]), q]] as [number, number, number][]); for (const q of [l, l + 1]) if (!(q === 0 && w.terrain)) wallAround(w, q, land.filter(c => c[2] === q).map(c => [c[0], c[1]]), WS[th.wall])
      for (const [x, z, i] of foot) { if (i === 0) w.setEdge(l, x, z, (s.dir + 2) % 4, 0); if (i === 3) w.setEdge(l + 1, x, z, s.dir, 0) }
      for (const q of [l, l + 1]) { const cs = land.filter(c => c[2] === q && !w.roomAt(q, c[0], c[1]) && !(q === 0 && w.terrain)).map(c => [c[0], c[1]] as [number, number]); if (cs.length) { const rm = newRoom(w, q, cs, 'landing', th.id); for (const [x, z] of cs) w.lv(q).room[idx(x, z)] = rm.id } }
      w.stairs.set(s.id, s); nameAll(w, makeRng('st' + s.id))
    }); if (!r) this.toast(why || 'Stairs do not fit there.')
  }
  // ------------------------------------------------------------ room actions
  refurnish(id: number, type?: string) { const w = this.g.world!; this.commit('Furnish', () => { const q = w.rooms.get(id); if (!q) return; const r = makeRng('f' + Math.random()); const n = { ...q, type: type ?? q.type }; if (type && type !== q.type) { n.name = ''; nameRoom(r, n) } w.rooms.set(id, n); clearRoom(w, n); furnish(w, n, r); clearDoorways(w, [n.l]) }) }
  emptyRoom(id: number) { const w = this.g.world!; this.commit('Empty', () => { const q = w.rooms.get(id); if (q) clearRoom(w, q) }) }
  setRoom(id: number, patch: any) { const w = this.g.world!; this.commit('Room', () => { const q = w.rooms.get(id); if (q) w.rooms.set(id, { ...q, ...patch }) }) }
  retheme(id: number, th: ThemeId) { const w = this.g.world!; this.commit('Theme', () => { const q = w.rooms.get(id); if (!q) return; const T = THEMES[th], lv = w.lv(q.l); w.rooms.set(id, { ...q, theme: th }); for (const [x, z] of w.roomCells(q)) { const i = idx(x, z); lv.floor[i] = lv.flag[i] & FLAG.cave ? FL[T.rock] : FL[T.floor]; for (let d = 0; d < 4; d++) { const e = w.edge(q.l, x, z, d); if (e && (e & 15) !== E.Rail && (e & 15) !== E.Fence && (e >> 4) !== WS.rock) w.setEdge(q.l, x, z, d, e & 15, WS[T.wall]) } } }) }
  dispose() { this.rect.dispose(); this.grid.dispose(); this.ghost?.dispose(); this.rectM.dispose(); this.gridM.dispose() }
}
const _soft = (s: ToolState) => s.raise === 0
void rectCells
