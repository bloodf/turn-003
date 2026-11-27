import { TargetCamera } from '@babylonjs/core/Cameras/targetCamera'
import { Camera } from '@babylonjs/core/Cameras/camera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { Scene } from '@babylonjs/core/scene'
import { World } from '../core/world'
import { Nav } from '../core/collide'
import { CEIL, FLAG, w2c, idx_ } from './util'
export type Mode = 'fps' | 'tps' | 'iso' | 'top' | 'fly'
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
/** one camera, five ways to hold it */
export class View {
  cam: TargetCamera; mode: Mode = 'tps'; yaw = Math.PI; pitch = -.12; dist = 4.4; zoom = { iso: 11, top: 15 }; isoYaw = Math.PI / 4; isoGoal = Math.PI / 4; focus = new Vector3(); pan = new Vector3(); flyP = new Vector3(0, 8, 0); eye = new Vector3(); fwd = new Vector3(0, 0, 1); right = new Vector3(1, 0, 0); up = new Vector3(0, 1, 0); bob = 0; private sm = new Vector3(); private curDist = 4; fov = 1.18; level = 0; private first = true; blend = 0; private from = new Vector3(); shake = 0
  constructor(private scene: Scene) { this.cam = new TargetCamera('cam', new Vector3(0, 10, 10), scene); this.cam.minZ = .06; this.cam.maxZ = 420; this.cam.fov = this.fov; scene.activeCamera = this.cam }
  get flat() { return this.mode === 'iso' || this.mode === 'top' }
  get ortho() { return this.flat }
  set(m: Mode) { if (m === this.mode) return; const was = this.mode; this.mode = m; this.pan.setAll(0); if (m === 'fly') { this.flyP.copyFrom(was === 'fly' ? this.flyP : this.eye); if (was === 'iso' || was === 'top') { this.flyP.copyFrom(this.focus).addInPlaceFromFloats(0, 7, 8); this.yaw = Math.PI; this.pitch = -.6 } } if (m === 'fps') this.pitch = clamp(this.pitch, -.5, .4); this.first = true }
  look(dx: number, dy: number) { if (this.flat) return; this.yaw -= dx; this.pitch = clamp(this.pitch - dy, this.mode === 'tps' ? -1.1 : -1.5, this.mode === 'tps' ? .9 : 1.5) }
  zoomBy(f: number) { if (this.mode === 'iso') this.zoom.iso = clamp(this.zoom.iso * f, 3.5, 70); else if (this.mode === 'top') this.zoom.top = clamp(this.zoom.top * f, 4, 110); else if (this.mode === 'tps') this.dist = clamp(this.dist * f, 1.4, 9) }
  get z() { return this.mode === 'iso' ? this.zoom.iso : this.zoom.top }
  /** directions for "forward" and "right" on the ground, as the player sees them */
  ground(): [number, number, number, number] { const y = this.mode === 'iso' ? this.isoYaw : this.mode === 'top' ? Math.PI : this.yaw; return [Math.sin(y), Math.cos(y), -Math.cos(y), Math.sin(y)] }
  update(dt: number, p: { x: number; y: number; z: number }, w: World | null, nav: Nav | null, aspect: number) {
    const k = this.first ? 1 : 1 - Math.exp(-dt * 9); const cam = this.cam; if (this.first) { this.sm.set(p.x, p.y, p.z) } this.sm.x += (p.x - this.sm.x) * (this.mode === 'fps' ? 1 : Math.min(1, dt * 22)); this.sm.z += (p.z - this.sm.z) * (this.mode === 'fps' ? 1 : Math.min(1, dt * 22)); this.sm.y += (p.y - this.sm.y) * (1 - Math.exp(-dt * 12)); const s = this.sm; const sh = this.shake > 0 ? (this.shake = Math.max(0, this.shake - dt)) * .25 : 0
    if (this.mode === 'fps') { this.eye.set(s.x, s.y + 1.62 + Math.sin(this.bob * 2) * .028, s.z); this.eye.x += Math.cos(this.bob) * .014; this.dir(this.yaw, this.pitch); cam.position.copyFrom(this.eye); this.focus.set(s.x, s.y, s.z) }
    else if (this.mode === 'tps') {
      this.dir(this.yaw, this.pitch); const hx = s.x, hy = s.y + 1.5, hz = s.z; const side = .32; const ox = hx + this.right.x * side * .0, oz = hz + this.right.z * side * .0; let d = this.dist; if (w && nav) d = this.clear(w, nav, ox, hy, oz, -this.fwd.x, -this.fwd.y, -this.fwd.z, this.dist); this.curDist += (d - this.curDist) * (d < this.curDist ? 1 - Math.exp(-dt * 24) : 1 - Math.exp(-dt * 5)); if (this.first) this.curDist = d
      this.eye.set(ox - this.fwd.x * this.curDist, hy - this.fwd.y * this.curDist, oz - this.fwd.z * this.curDist); if (w) { const g = nav?.ground(this.eye.x, this.eye.y + .6, this.eye.z); if (g !== null && g !== undefined && this.eye.y < g + .25 && g < p.y + 3) this.eye.y = g + .25 } cam.position.copyFrom(this.eye); this.focus.set(s.x, s.y, s.z)
    } else if (this.mode === 'fly') { this.dir(this.yaw, this.pitch); this.eye.copyFrom(this.flyP); cam.position.copyFrom(this.eye); this.focus.copyFrom(this.flyP) }
    else {
      let dy = this.isoGoal - this.isoYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.isoYaw += dy * (1 - Math.exp(-dt * 10)); this.focus.x += (s.x + this.pan.x - this.focus.x) * k; this.focus.y += (s.y + this.pan.y - this.focus.y) * k; this.focus.z += (s.z + this.pan.z - this.focus.z) * k; const pit = this.mode === 'iso' ? -.6155 : -1.5707; this.dir(this.mode === 'iso' ? this.isoYaw : Math.PI, pit); if (this.mode === 'top') { this.up.set(0, 0, -1); this.right.set(1, 0, 0) } const D = 110; this.eye.set(this.focus.x - this.fwd.x * D, this.focus.y - this.fwd.y * D, this.focus.z - this.fwd.z * D); cam.position.copyFrom(this.eye)
    }
    if (sh) { cam.position.x += (Math.random() - .5) * sh; cam.position.y += (Math.random() - .5) * sh }
    this.first = false; const orth = this.flat; cam.mode = orth ? Camera.ORTHOGRAPHIC_CAMERA : Camera.PERSPECTIVE_CAMERA; if (orth) { const z = this.z; cam.orthoTop = z; cam.orthoBottom = -z; cam.orthoLeft = -z * aspect; cam.orthoRight = z * aspect; cam.minZ = 1; cam.maxZ = 320 } else { cam.minZ = .06; cam.maxZ = 420; cam.fov = this.mode === 'fps' ? (aspect < 1 ? 1.45 : this.fov) : (aspect < 1 ? 1.25 : 1.02) }
    if (this.mode === 'top') cam.upVector.set(0, 0, -1); else cam.upVector.set(0, 1, 0); cam.setTarget(new Vector3(cam.position.x + this.fwd.x, cam.position.y + this.fwd.y, cam.position.z + this.fwd.z))
  }
  private dir(yaw: number, pitch: number) { const c = Math.cos(pitch); this.fwd.set(Math.sin(yaw) * c, Math.sin(pitch), Math.cos(yaw) * c); this.right.set(-Math.cos(yaw), 0, Math.sin(yaw)); Vector3.CrossToRef(this.right, this.fwd, this.up) }
  /** how far the camera can back off before a wall, ceiling or rock */
  private clear(w: World, nav: Nav, x: number, y: number, z: number, dx: number, dy: number, dz: number, max: number) {
    const st = .16; for (let d = .25; d < max; d += st) { const px = x + dx * d, py = y + dy * d, pz = z + dz * d; if (this.blocked(w, nav, px, py, pz, y)) return Math.max(.35, d - .22) } return max
  }
  private blocked(w: World, nav: Nav, x: number, y: number, z: number, hy: number) {
    const l = Math.floor((y + .02) / 4), cx = w2c(x), cz = w2c(z), v = w.levels.get(l); const lh = nav.levelOf(x, hy - 1.5, z)
    if (v) { const i = idx_(cx, cz); if (v.flag[i] & FLAG.solid) return true; const ry = y - l * 4; if (v.ceil[i]) { if (ry > (v.ceil[i] === CEIL.vault ? 3.0 : v.ceil[i] === CEIL.rock ? 2.9 : 3.35)) return true } if (v.floor[i] && v.floor[i] !== 1 && l > lh && ry < .3) return true; if (l < 0 && !w.open(l, cx, cz)) return true; const B: number[][] = []; for (let b = 0; b <= 1; b++) for (let a = 0; a <= 1; a++) { nav.edgeBoxes(l, cx + a, cz + b, 2, B, true); nav.edgeBoxes(l, cx + a, cz + b, 3, B, true) } for (const [ax, az, bx, bz] of B) if (x > ax - .16 && x < bx + .16 && z > az - .16 && z < bz + .16) return true; if (v.flag[i] & FLAG.cave) { const [qx, qz] = nav.resolve(x, l * 4, z, .12); if (Math.hypot(qx - x, qz - z) > .16) return true } }
    for (const r of w.rings.values()) if (l >= r.l0 && l <= r.l1) { const d = Math.hypot(x - r.x, z - r.z); if (d > r.r - .18 && d < r.r + r.t + .18) return true; if (d < r.r && d > r.hole && y - l * 4 > 3.5 && l < r.l1) return true }
    return false
  }
  /** world ray through a pixel (ndc -1..1) */
  ray(nx: number, ny: number, aspect: number): { o: Vector3; d: Vector3 } {
    if (this.flat) { const z = this.z; const o = this.cam.position.clone(); o.addInPlace(this.right.scale(nx * z * aspect)).addInPlace(this.up.scale(ny * z)); return { o, d: this.fwd.clone() } }
    const t = Math.tan(this.cam.fov / 2); const d = this.fwd.clone().addInPlace(this.right.scale(nx * t * aspect)).addInPlace(this.up.scale(ny * t)); d.normalize(); return { o: this.cam.position.clone(), d }
  }
  project(x: number, y: number, z: number, aspect: number): { x: number; y: number; d: number } | null { const v = new Vector3(x, y, z).subtractInPlace(this.cam.position); const d = Vector3.Dot(v, this.fwd); const a = Vector3.Dot(v, this.right), b = Vector3.Dot(v, this.up); if (this.flat) { const q = this.z; return { x: a / (q * aspect), y: b / q, d } } if (d < .2) return null; const t = Math.tan(this.cam.fov / 2); return { x: a / (d * t * aspect), y: b / (d * t), d } }
}
