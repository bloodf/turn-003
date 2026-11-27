<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { app, openSaved, refreshSaved, open, useInks, SHELF } from '../session'
import { mine } from '../heroes'
onMounted(() => { useInks(); void refreshSaved() }); const last = computed(() => app.saved[0] as any); const box = computed(() => SHELF.find(b => b.id === last.value?.mod)); const base = import.meta.env.BASE_URL
const go = (s: any, arg: any = null) => { app.modalArg = arg; app.screen = s }
const where = computed(() => { const l = last.value; if (!l) return ''; if (box.value) return l.over ? 'Finished: ' + l.over : `Sitting ${(l.ch ?? 0) + 1}, ${l.place ?? ''}`; return l.day ? `Day ${l.day}` : new Date(l.edited).toLocaleDateString() })
</script>
<template><main class="lid"><div class="art" :style="{ backgroundImage: `url(${base}ui/title.webp)` }" /><header><h1>Realmwright</h1><p>A role-playing game for one to six players, with or without a Dungeon Master</p></header>
  <nav><button v-if="last" class="go first" :style="box ? { '--spot': box.inks[1], '--duo': box.inks[0] } : {}" @click="openSaved(last.id)"><img v-if="box" :src="`${base}ui/covers/${box.id}.webp`" alt=""><img v-else-if="last.thumb" :src="last.thumb" alt=""><span><b>Continue</b><em class="cut">{{ last.name }}</em><small class="cut">{{ where }}</small></span></button>
    <button class="go" @click="go('shelf', 'ai')"><b>Play a campaign</b><small>Fifteen written adventures, a full day’s play in each. The game is your Dungeon Master.</small></button>
    <button class="go" @click="go('shelf', 'dm')"><b>Be the Dungeon Master</b><small>Run one of the fifteen, or build a world of your own. You see everything.</small></button>
    <button class="go" @click="go('join')"><b>Join a table</b><small>With a room code, a link, or a scroll passed by hand.</small></button>
    <div class="low"><button @click="go('heroes')">Heroes<i v-if="mine.list.length">{{ mine.list.length }}</i></button><button @click="go('worlds')">Saved games<i v-if="app.saved.length">{{ app.saved.length }}</i></button><button @click="open('settings')">Settings</button></div></nav>
  <p class="legal">Rules from the System Reference Document 5.1 © Wizards of the Coast LLC, CC BY 4.0. Icons from game-icons.net, CC BY 3.0.</p></main></template>
<style scoped>
.lid{position:fixed;inset:0;overflow:auto;background:var(--navy);color:var(--ink);display:grid;grid-template:auto 1fr auto/minmax(340px,430px) 1fr}.art{position:fixed;inset:0;background:var(--navy) 60% 60%/cover no-repeat}
header{grid-column:1/-1;position:relative;background:var(--paper);display:flex;align-items:baseline;gap:14px 34px;flex-wrap:wrap;padding:calc(16px + var(--safe-t)) 30px 13px}h1{font:800 clamp(58px,8.6vw,128px)/.74 var(--serif);letter-spacing:-.02em;padding-bottom:.06em}header p{font:400 clamp(17px,1.6vw,23px)/1.15 var(--ui);margin:0;max-width:24ch;align-self:flex-end}
nav{grid-row:2;position:relative;background:var(--paper);padding:0 0 18px;display:flex;flex-direction:column;align-self:start;border-top:5px solid var(--ink)}.go{display:block;padding:15px 30px 16px;border-bottom:2px solid var(--ink);transition:none}.go b{display:block;font:800 33px/1 var(--serif)}.go small{display:block;font-size:16.5px;line-height:1.28;color:var(--ink2);margin-top:5px;max-width:36ch}.go:hover,.go:focus-visible{background:var(--spot);color:var(--on-spot)}.go:hover small,.go:focus-visible small{color:inherit}
.first{display:flex;gap:16px;background:var(--duo);color:var(--spot);padding:0 20px 0 0;align-items:stretch;border-bottom:0}.first img{width:104px;height:112px;object-fit:cover;object-position:50% 55%}.first span{display:flex;flex-direction:column;justify-content:center;min-width:0}.first em{font:500 19px/1.2 var(--ui);font-style:normal}.first small{color:inherit;opacity:.85;margin:1px 0 0}.low{display:flex;gap:6px 22px;flex-wrap:wrap;padding:18px 30px 4px}.low button{font-weight:500;font-size:17.5px;border-bottom:2px solid transparent}.low button:hover{border-color:var(--ink)}.low i{font-style:normal;font-weight:400;color:var(--ink3);margin-left:6px}
.legal{grid-column:1/-1;position:relative;font-size:13px;margin:0;padding:8px 30px calc(10px + var(--safe-b));color:#dfe6ec;background:var(--navy)}
@media(max-width:760px){.lid{grid-template:auto auto 1fr auto/1fr}.art{position:relative;inset:auto;height:34vh;grid-row:2;grid-column:1}nav{grid-row:3;border-top:0}header{padding-left:20px;padding-right:20px}.go,.low{padding-left:20px;padding-right:20px}.first{padding-left:0}.go b{font-size:29px}.legal{padding-left:20px}}
@media(max-height:760px) and (min-width:761px){.go{padding-top:10px;padding-bottom:11px}.go b{font-size:28px}.first img{height:92px}}
</style>
