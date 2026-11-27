<script setup lang="ts">
// the sheet is amended at the table, for a level taken by hand or a gift from the Dungeon Master
import { ref } from 'vue'
import { app, act, close, gs, hands, onState, real, toast } from '../session'
import { sanitize, type Hero } from '../rules/hero'
import { settle, toPaper } from '../rules/paper'
import Record from './Record.vue'
const who = (app.modalArg as string) || app.seat; const h = ref<Hero>(JSON.parse(JSON.stringify(toPaper(JSON.parse(JSON.stringify(gs.value!.chars[who])))))); const hp0 = gs.value!.chars[who].hp
const sign = async () => { const n = sanitize(JSON.parse(JSON.stringify(settle(h.value)))); if (!n) { toast('Something on the sheet cannot be read.', true); return } if (h.value.hp === hp0) n.hp = Math.max(1, hp0); if (who === app.seat) { const r = await act({ k: 'sheet', hero: n } as any, app.seat); if (r.ok) close() } else { const c = real().chars[who]; const { conds, death, dead, insp, kills, campaigns, id, pid } = c; for (const k of Object.keys(c)) delete (c as any)[k]; Object.assign(c, n, { id, pid, conds, death, dead, insp, kills, campaigns }); onState(); close() } }; void hands
</script>
<template><div class="veil"><section class="modal paper am"><header><h2>Amend {{ h.name }}</h2><button class="btn" @click="close">Put it back</button><button class="btn primary big" @click="sign">Sign the sheet</button></header><div class="body"><Record :h="h" /></div></section></div></template>
<style scoped>.am{width:min(1240px,100%);height:100%}</style>
