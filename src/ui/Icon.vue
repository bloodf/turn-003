<script setup lang="ts">
import icons from './icons.json'
defineProps<{ n: string }>()
const I = icons as Record<string, string>
</script>
<template><svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" v-html="I[n] ?? ''" /></template>
