<script setup lang="ts">
import { watchEffect, ref } from 'vue'
import QRCode from 'qrcode'
const p = defineProps<{ text: string }>(); const src = ref('')
watchEffect(async () => { try { src.value = p.text ? await QRCode.toDataURL(p.text, { margin: 2, width: 520, errorCorrectionLevel: p.text.length > 350 ? 'L' : 'M', color: { dark: '#15171b', light: '#ffffff' } }) : '' } catch { src.value = '' } })
</script>
<template><img v-if="src" class="qr" :src="src" alt="Scan to join"></template>
<style scoped>.qr{display:block;width:min(260px,70vw);margin:10px auto;border:3px solid var(--ink);image-rendering:pixelated}</style>
