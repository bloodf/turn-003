<script setup lang="ts">
// the cover of a campaign, as printed
import type { Box } from '../session'
defineProps<{ b: Box; big?: boolean }>()
const base = import.meta.env.BASE_URL
</script>
<template><div class="cv" :class="{ big }" :style="{ '--d': b.inks[0], '--s': b.inks[1] }"><header><span>{{ b.code }}</span><h3>{{ b.title }}</h3></header><img :src="`${base}ui/covers/${b.id}.webp`" alt="" loading="lazy" draggable="false"><footer><span>Levels {{ b.lo }} to {{ b.hi }}</span><span>{{ b.chapters.length }} sittings</span></footer></div></template>
<style scoped>
.cv{display:flex;flex-direction:column;background:var(--d);color:var(--s);aspect-ratio:3/4.35;overflow:hidden;container-type:inline-size}.cv header{padding:5cqw 5.5cqw 4.5cqw;display:flex;gap:4cqw;align-items:flex-start;flex-direction:row-reverse;justify-content:space-between;min-height:27cqw}.cv h3{font:800 11.4cqw/.9 var(--serif);margin:0;text-wrap:balance}.cv header span{font:600 6cqw/1 var(--ui);border:.8cqw solid currentColor;padding:1.2cqw 1.8cqw;flex:none}.cv img{flex:1;min-height:0;width:100%;object-fit:cover;display:block;object-position:50% 60%}.cv footer{display:flex;justify-content:space-between;padding:3.4cqw 5.5cqw;font:500 5.3cqw/1.1 var(--ui)}
.cv.big h3{font-size:12cqw}.cv.big footer{font-size:4.6cqw}
</style>
