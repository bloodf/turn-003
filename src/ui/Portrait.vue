<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { portrait } from '../engine/studio'
import { lookOf, monLook } from '../engine/compose'
import { monster } from '../rules/monsters'
import type { Hero } from '../rules/hero'
import type { Mon } from '../rules/state'
import MonThumb from './MonThumb.vue'
const p = defineProps<{ hero?: Hero | null; mon?: Mon | null; size?: number; frame?: 'head' | 'bust' | 'full'; model?: string; id?: string }>()
const src = ref('')
watchEffect(async () => { const s = Math.min(256, Math.round((p.size ?? 48) * Math.min(2, devicePixelRatio || 1))); if (p.hero) { if (p.hero.shape) { src.value = ''; return } src.value = await portrait({ model: 'hero', hero: lookOf(p.hero) }, s, p.frame ?? 'head') } else if (p.mon?.npc || p.model) { src.value = await portrait(monLook(p.model ?? 'villager', p.id ?? p.mon?.id ?? ''), s, 'head') } else src.value = '' })
</script>
<template><span class="pt" :class="{ m: !hero }" :style="{ width: (size ?? 48) + 'px', height: (size ?? 48) + 'px' }"><img v-if="src" :src="src" alt="" draggable="false"><MonThumb v-else-if="mon || hero?.shape" :id="hero?.shape?.id ?? mon!.ref" :size="size ?? 48" /></span></template>
<style scoped>.pt{display:block;flex:none;overflow:hidden;background:var(--pt,var(--spot))}.pt.m{background:var(--pm,#93a3b0)}.pt img{width:100%;height:100%;display:block}</style>
