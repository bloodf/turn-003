<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Studio } from '../engine/studio'
import type { Look } from '../engine/actors'
const p = defineProps<{ look: Look; frame?: 'full' | 'bust' | 'head' }>(); const c = ref<HTMLCanvasElement>(); let st: Studio | null = null, raf = 0, cur: any = null, a: any = null, yaw = .35, zoom = 1, drag = 0, last = 0, token = 0, spin = true
const load = async () => { if (!st) return; const t = ++token; try { const r = await st.ready(p.look); if (t !== token) return; const had = a; cur = r; a = st.actor(r); if (had) a.t = had.t; if (had && had.def.id !== a.def.id) a.atk = 0 } catch (e) { console.warn(e) } }
onMounted(() => { try { st = new Studio(c.value!, new URL(import.meta.env.BASE_URL, location.href).href) } catch { return } load(); const tick = (now: number) => { raf = requestAnimationFrame(tick); const el = c.value; if (!el || !cur || now - last < 30) return; const dt = Math.min(.1, (now - last) / 1000); last = now; const d = Math.min(2, devicePixelRatio || 1), W = Math.round(el.clientWidth * d), H = Math.round(el.clientHeight * d); if (el.width !== W || el.height !== H) { el.width = W; el.height = H } if (spin && !drag) yaw = .35 + Math.sin(now / 3800) * .45; st!.draw(cur, a, { yaw, zoom, frame: p.frame ?? 'full', dt, floor: true }) }; raf = requestAnimationFrame(tick) })
onBeforeUnmount(() => { cancelAnimationFrame(raf); st?.gl.getExtension('WEBGL_lose_context')?.loseContext() }); watch(() => JSON.stringify(p.look), load)
const down = (e: PointerEvent) => { drag = e.clientX; spin = false; (e.target as HTMLElement).setPointerCapture(e.pointerId) }, move = (e: PointerEvent) => { if (drag) { yaw += (e.clientX - drag) * .012; drag = e.clientX } }, up = () => drag = 0, wheel = (e: WheelEvent) => { zoom = Math.max(.8, Math.min(4, zoom * Math.exp(-e.deltaY * .001))) }
defineExpose({ play: (what = 'attack') => { if (a) { a.atk = 1; a.act = what } } })
</script>
<template><canvas ref="c" class="s3" aria-label="Preview" @pointerdown="down" @pointermove="move" @pointerup="up" @wheel.passive="wheel" /></template>
<style scoped>.s3{width:100%;height:100%;display:block;touch-action:none;cursor:grab}</style>
