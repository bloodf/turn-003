<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { app, boot, onHash, refreshSaved, joinLocal, openSaved, cancelJoin } from '../session'
import { chosen } from '../heroes'
import { wake } from '../audio'
import Title from './Title.vue'
import Campaign from './Campaign.vue'
import Shelf from './Shelf.vue'
import Worlds from './Worlds.vue'
import Heroes from './Heroes.vue'
import Join from './Join.vue'
import Play from './Play.vue'
import Settings from './Settings.vue'
import Icon from './Icon.vue'
const canvas = ref<HTMLCanvasElement>()
const hash = () => { const h = onHash(); if (h) { app.inviteHash = h; history.replaceState(null, '', location.pathname + location.search); app.screen = 'join'; if (h.k === 'l' && chosen()) joinLocal(h.v) } }
onMounted(async () => { refreshSaved(); hash(); window.addEventListener('hashchange', hash); window.addEventListener('pointerdown', wake, { once: true }); try { await boot(canvas.value!) } catch (e) { console.error(e) } app.loading = app.joining ? app.loading : null; const re = sessionStorage.getItem('rw.reopen'); if (re) { sessionStorage.removeItem('rw.reopen'); openSaved(re) } })
const reload = () => location.reload()
</script>
<template>
  <canvas ref="canvas" class="gl" :class="{ off: app.screen !== 'play' }" />
  <Play v-if="app.screen === 'play'" />
  <Title v-else-if="app.screen === 'title'" />
  <Shelf v-else-if="app.screen === 'shelf'" />
  <Campaign v-else-if="app.screen === 'new'" />
  <Worlds v-else-if="app.screen === 'worlds'" />
  <Heroes v-else-if="app.screen === 'heroes'" />
  <Join v-else />
  <Settings v-if="app.modal === 'settings' && app.screen !== 'play'" />
  <Transition name="fade"><div v-if="app.loading && (app.screen === 'play' || app.loading.k < 1) && (app.screen !== 'title' || app.loading.k > .62)" class="load"><div class="lt"><p>{{ app.loading.msg }}</p><button v-if="app.joining" class="btn" @click="cancelJoin">Stop looking</button></div><i class="lb" :style="{ width: Math.round(app.loading.k * 100) + '%' }" /></div></Transition>
  <div class="toasts" aria-live="polite"><TransitionGroup name="t"><div v-for="t in app.toasts" :key="t.id" class="toast" :class="{ bad: t.bad }">{{ t.text }}</div></TransitionGroup></div>
  <div v-if="app.fatal" class="veil"><section class="modal paper" style="width:460px"><div class="body"><h2>This browser cannot run it</h2><p>{{ app.fatal }}</p><button class="btn primary" @click="reload">Reload</button></div></section></div>
</template>
<style scoped>
.gl{position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none;outline:none}.gl.off{visibility:hidden}
.load{position:fixed;inset:0;z-index:60;background:var(--duo);color:var(--spot)}.lt{position:absolute;left:clamp(22px,6vw,90px);bottom:clamp(60px,12vh,130px);right:20px;display:grid;gap:18px;justify-items:start}.lt p{font:800 clamp(40px,7vw,96px)/.9 var(--serif);margin:0;max-width:14ch}.lb{position:absolute;left:0;bottom:0;height:14px;background:var(--spot);transition:width .3s}.lt .btn{background:#ffffff1c;color:#fff}
.fade-leave-active{transition:opacity .5s}.fade-leave-to{opacity:0}
.toasts{position:fixed;left:0;right:0;top:calc(70px + var(--safe-t));z-index:80;display:grid;justify-items:center;gap:3px;pointer-events:none;padding:0 14px}.toast{max-width:520px;padding:8px 16px;background:var(--ink);color:var(--paper);text-wrap:balance}.toast.bad{background:var(--bad);color:#fff}.t-enter-from{opacity:0;transform:translateY(-6px)}.t-leave-to{opacity:0}.t-enter-active,.t-leave-active{transition:.16s}
</style>
