<script setup lang="ts">
// a die as it is drawn in a rule book
const p = defineProps<{ d: number; v?: number | null; size?: number; off?: boolean }>()
const SHAPE: Record<number, string> = { 4: 'M50 8 94 86H6Z', 6: 'M14 14h72v72H14Z', 8: 'M50 4 92 50 50 96 8 50Z', 10: 'M50 4 94 44 80 74 50 96 20 74 6 44Z', 12: 'M50 5 83 17 95 50 83 83 50 95 17 83 5 50 17 17Z', 20: 'M50 3 91 26v48L50 97 9 74V26Z', 100: 'M50 4 94 44 80 74 50 96 20 74 6 44Z' }
const LINES: Record<number, string> = { 4: '', 6: '', 8: 'M8 50h84', 10: 'M6 44 50 62 94 44M50 62v34', 12: 'M50 24 76 43 66 73H34L24 43ZM50 5v19M95 50 76 43M80 84 66 73M20 84l14-11M5 50l19-7', 20: 'M50 3 24 66h52ZM24 66 9 26M76 66 91 26M24 66 50 97 76 66M9 74l15-8M91 74l-15-8', 100: 'M6 44 50 62 94 44M50 62v34' }
void p
</script>
<template><svg class="die" :class="{ off }" viewBox="0 0 100 100" :style="{ width: (size ?? 56) + 'px', height: (size ?? 56) + 'px' }" :aria-label="v ? `${v} on a d${d}` : `d${d}`"><path :d="SHAPE[d] ?? SHAPE[20]" class="b" /><path v-if="!v && LINES[d]" :d="LINES[d]" class="l" /><text x="50" :y="d === 4 ? 74 : 64" text-anchor="middle" :class="{ q: !v }">{{ v ?? d }}</text></svg></template>
<style scoped>.die{display:block;flex:none;overflow:visible}.b{fill:var(--spot);stroke:var(--ink);stroke-width:4;stroke-linejoin:round}.l{fill:none;stroke:var(--ink);stroke-width:2;opacity:.55}text{font:800 48px var(--serif);fill:var(--on-spot)}text.q{font-size:32px}.off{opacity:.35}</style>
