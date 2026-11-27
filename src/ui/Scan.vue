<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import jsQR from 'jsqr'
const emit = defineEmits<{ found: [string]; close: [] }>(); const v = ref<HTMLVideoElement>(), err = ref(''); let s: MediaStream | null = null, on = true
onMounted(async () => { try { if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera'); s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } }); v.value!.srcObject = s; await v.value!.play(); const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true })!; const tick = () => { if (!on) return; const e = v.value!; if (e.videoWidth) { c.width = Math.min(720, e.videoWidth); c.height = c.width * e.videoHeight / e.videoWidth; x.drawImage(e, 0, 0, c.width, c.height); const r = jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height); if (r?.data) { on = false; emit('found', r.data); return } } setTimeout(tick, 140) }; tick() } catch { err.value = 'No camera here, or it was not allowed. Paste the text instead.' } })
onBeforeUnmount(() => { on = false; s?.getTracks().forEach(t => t.stop()) })
</script>
<template><div class="scan"><video v-show="!err" ref="v" playsinline muted /><p v-if="err">{{ err }}</p><button class="btn sm" @click="$emit('close')">Close</button></div></template>
<style scoped>.scan{display:grid;gap:10px;justify-items:center;margin:10px 0}video{width:100%;max-height:300px;object-fit:cover;background:#000}p{margin:0}</style>
