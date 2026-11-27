<script setup lang="ts">
import { computed } from 'vue'
import { MONSTERS } from '../rules/monsters'
const p = defineProps<{ id: string; size?: number }>()
const st = computed(() => { const i = Math.max(0, MONSTERS.findIndex(m => m.id === p.id)), s = p.size ?? 48, rows = Math.ceil(MONSTERS.length / 12); return { width: s + 'px', height: s + 'px', backgroundImage: `url(${import.meta.env.BASE_URL}ui/mons.webp)`, backgroundSize: `${12 * s}px ${rows * s}px`, backgroundPosition: `-${(i % 12) * s}px -${Math.floor(i / 12) * s}px` } })
</script>
<template><i class="mt" :style="st" aria-hidden="true" /></template>
<style scoped>.mt{display:block;flex:none;background-repeat:no-repeat;background-color:var(--pm,#93a3b0)}</style>
