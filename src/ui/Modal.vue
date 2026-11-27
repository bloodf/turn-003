<script setup lang="ts">
import { close } from '../session'
defineProps<{ title: string; width?: number; vel?: boolean; icon?: string; flush?: boolean }>()
const emit = defineEmits<{ close: [] }>(); const out = () => { emit('close'); close() }
</script>
<template><div class="veil" @pointerdown.self="out"><section class="modal paper" :style="{ width: (width ?? 560) + 'px' }" role="dialog" aria-modal="true" :aria-label="title"><header><h2>{{ title }}</h2><slot name="head" /><button class="x" aria-label="Close" @click="out">×</button></header><div :class="flush ? 'fl' : 'body'"><slot /></div><footer v-if="$slots.foot"><slot name="foot" /></footer></section></div></template>
<style scoped>.fl{min-height:0;flex:1;display:flex;flex-direction:column;overflow:hidden}.modal{border-top:8px solid var(--spot)}.x{font:400 36px/.8 var(--ui);width:44px;height:40px;text-align:center;flex:none}.x:hover{background:var(--spot);color:var(--on-spot)}header h2{font-size:32px!important;font-weight:800}</style>
