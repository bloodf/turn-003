import { Game } from './engine/game'
import { PRESETS } from './core/presets'
import { charDefs } from './engine/actors'
import { DEFAULTS } from './core/gen'
import { MONSTERS } from './rules/monsters'
import { portrait, studio, Studio } from './engine/studio'
import { monLook } from './engine/compose'
;(window as any).ST = { MONSTERS, portrait, studio, Studio, monLook }
const q0 = new URLSearchParams(location.search)
if (q0.get('studio')) (window as any).READY = true
else {
const q = new URLSearchParams(location.search); const g = new Game(document.getElementById('c') as HTMLCanvasElement, (q.get('tier') as any) || undefined); (window as any).G = g; (window as any).CH = charDefs; (window as any).PRESETS = PRESETS
g.ev.on('error', e => console.error(e)); await g.boot(); const p = PRESETS.find(p => p.id === (q.get('w') || 'crypt')); const w = await g.generate(p ? p.o : { ...DEFAULTS, ...(q.get('w') === 'blank' ? { kind: 'blank' as const } : {}) }); await g.load(w); if (q.get('v')) g.setView(q.get('v') as any); (window as any).READY = true
}
