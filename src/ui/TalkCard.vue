<script setup lang="ts">
// whoever stands before you, and what you might ask
import { computed, ref, watch } from 'vue'
import { app, gs, act, say } from '../session'
import { SKILLS, SKILL_NAME, type Skill } from '../rules/base'
import { rich } from './rich'
import Portrait from './Portrait.vue'
const list = computed(() => app.chips.filter(c => c.do?.k === 'talk')); const id = computed(() => list.value[0]?.do?.npc as string | undefined); const m = computed(() => id.value ? gs.value?.mons[id.value] : null); const tok = computed(() => app.tokens.find(t => t.id === id.value)); const shut = ref(''); watch(id, () => { if (id.value !== shut.value) shut.value = '' }); const text = ref(''); const last = computed(() => { for (let i = app.feed.length - 1; i >= 0 && i > app.feed.length - 7; i--) { const b = app.feed[i]; if (b.k === 'npc' && b.who === m.value?.name) return b.text } return '' }); const go = (c: any) => void act(c.do, app.seat); const ask = () => { if (text.value.trim()) { say(text.value, 'say'); text.value = '' } }
const skill = (s?: string) => s ? (s in SKILLS ? SKILL_NAME[s as Skill] : s) : ''
</script>
<template><section v-if="m && !gs?.combat && shut !== id && !(gs as any)?.scene" class="tk paper"><aside><Portrait :mon="m" :model="m.npc?.as ? undefined : tok?.m" :id="id" :size="104" /></aside><div class="bd"><header><h3>{{ m.name }}</h3><small>{{ m.npc?.role }}</small><button class="x" aria-label="Step away" @click="shut = id!">×</button></header><p v-if="last" class="aloud scroll" v-html="'“' + rich(last.replace(/^“|”$/g, '')) + '”'" /><div class="tp"><button v-for="c in list" :key="c.text" :class="{ old: (c as any).old }" @click="go(c)">{{ c.text }}<i v-if="(c as any).skill">{{ skill((c as any).skill) }}</i></button></div><form @submit.prevent="ask"><input v-model="text" class="field" :placeholder="`Ask ${m.name.split(' ')[0]} something else`" aria-label="Ask" maxlength="200"></form></div></section></template>
<style scoped>
.tk{width:min(660px,94vw);display:grid;grid-template-columns:104px 1fr;pointer-events:auto;animation:rise .16s;max-height:46vh;border-top:8px solid var(--spot)}aside{background:#93a3b0;display:flex;align-items:flex-end}.bd{padding:9px 14px 8px;min-width:0;display:flex;flex-direction:column;min-height:0}header{display:flex;gap:12px;align-items:baseline}h3{font-size:25px}header small{color:var(--ink2);font-size:15.5px}.x{margin-left:auto;font:400 30px/.7 var(--ui);width:28px;text-align:center}.aloud{font-size:19px;margin:4px 0 8px;max-height:112px}.tp{display:flex;flex-wrap:wrap;gap:3px;overflow:auto}.tp button{background:var(--paper2);padding:4px 11px;min-height:32px;font-size:16px}.tp button:hover{background:var(--spot);color:var(--on-spot)}.tp .old{color:var(--ink3)}.tp i{font-style:normal;font-weight:600;font-size:14px;margin-left:8px}form{margin-top:5px}.field{min-height:32px;font-size:16px;border-bottom-width:1px!important}
@media(max-width:640px){.tk{grid-template-columns:1fr}aside{display:none}}
</style>
