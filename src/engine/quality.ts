export type Tier = 'low' | 'medium' | 'high' | 'ultra'
export interface Quality { tier: Tier; tex: number; normal: boolean; spec: boolean; shadow: number; pl: number; post: boolean; msaa: boolean; scale: number; minScale: number; near: number; mid: number; view: number; grass: number; halos: boolean; motes: number; dither: boolean; software: boolean; mobile: boolean; gpu: string; fps: number }
const T: Record<Tier, Omit<Quality, 'tier' | 'software' | 'mobile' | 'gpu'>> = {
  low: { tex: 256, normal: false, spec: false, shadow: 0, pl: 1, post: false, msaa: false, scale: .7, minScale: .38, near: 1.5, mid: 7, view: 62, grass: 10, halos: false, motes: 0, dither: false, fps: 30 },
  medium: { tex: 512, normal: true, spec: true, shadow: 0, pl: 4, post: false, msaa: true, scale: .85, minScale: .5, near: 22, mid: 2.4, view: 110, grass: 22, halos: true, motes: 160, dither: true, fps: 50 },
  high: { tex: 1024, normal: true, spec: true, shadow: 2048, pl: 6, post: true, msaa: true, scale: 1, minScale: .6, near: 34, mid: 2.6, view: 190, grass: 34, halos: true, motes: 320, dither: true, fps: 58 },
  ultra: { tex: 1024, normal: true, spec: true, shadow: 4096, pl: 8, post: true, msaa: true, scale: 1.25, minScale: .8, near: 50, mid: 3, view: 300, grass: 48, halos: true, motes: 500, dither: true, fps: 58 },
}
export function detect(): Quality {
  let gpu = ''; try { const g = document.createElement('canvas').getContext('webgl2'); const e = g?.getExtension('WEBGL_debug_renderer_info'); gpu = String(g && e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g?.getParameter(g.RENDERER) ?? ''); g?.getExtension('WEBGL_lose_context')?.loseContext() } catch { /* fall through */ }
  const software = /swiftshader|llvmpipe|software|basic render|softpipe/i.test(gpu); const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 2 && /Mac/.test(navigator.userAgent)); const mem = (navigator as any).deviceMemory ?? 8
  let tier: Tier = 'high'; if (software) tier = 'low'; else if (mobile) tier = mem <= 3 || /Mali-(4|T|G3|G5[12])|Adreno \(TM\) [3-5]|PowerVR/i.test(gpu) ? 'low' : 'medium'; else if (/Intel\(R\)? (U?HD|HD) Graphics|Intel.*HD Graphics [2-6]\d\d|Mali|Adreno/i.test(gpu) || mem <= 4) tier = 'medium'; else if (/RTX|RX (6|7|9)\d\d\d|Apple M[2-9]|Arc A7/i.test(gpu)) tier = 'ultra'
  const saved = localStorage.getItem('rw.tier') as Tier | null; if (saved && T[saved]) tier = saved
  return make(tier, software, mobile, gpu)
}
export function make(tier: Tier, software: boolean, mobile: boolean, gpu: string): Quality { const q = { tier, ...T[tier], software, mobile, gpu }; if (software) { q.scale = Math.min(q.scale, tier === 'low' ? .5 : .7); q.minScale = .36; if (tier === 'low') { q.view = 52; q.fps = 26 } } return q }
export const TIERS: Tier[] = ['low', 'medium', 'high', 'ultra']
