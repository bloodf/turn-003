<script setup lang="ts">
import { computed } from 'vue'
import { models } from '../core/catalog'
import { charDefs } from '../engine/actors'
const p = defineProps<{ id: string; kind: 'prop' | 'char'; size?: number }>()
const st = computed(() => { const i = p.kind === 'prop' ? models().findIndex(m => m.id === p.id) : charDefs().findIndex(d => d.id === p.id); const n = p.kind === 'prop' ? models().length : charDefs().length; const rows = Math.ceil(n / 16); const s = p.size ?? 64; return { width: s + 'px', height: s + 'px', backgroundImage: `url(${import.meta.env.BASE_URL}ui/${p.kind === 'prop' ? 'props' : 'chars'}.webp)`, backgroundSize: `${16 * s}px ${rows * s}px`, backgroundPosition: `-${(i % 16) * s}px -${Math.floor(i / 16) * s}px` } })
</script>
<template><i class="th" :style="st" aria-hidden="true" /></template>
<style scoped>.th{display:inline-block;flex:none;background-repeat:no-repeat}</style>
