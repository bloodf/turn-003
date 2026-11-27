// portraits of every creature in the bestiary, one atlas
const { chromium } = require('playwright'); const { spawn, execSync } = require('child_process'); const fs = require('fs')
;(async () => {
  const v = spawn('npx', ['vite', '--port', '5198', '--strictPort'], { stdio: 'ignore', detached: true }); await new Promise(r => setTimeout(r, 2500))
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage(); p.on('console', m => { if (m.type() === 'error') console.log(m.text().slice(0, 300)) }); p.on('pageerror', e => console.log('PAGEERR', e.message)); await p.goto('http://localhost:5198/dev.html?studio=1'); await p.waitForFunction('window.READY')
  const list = await p.evaluate(() => window.ST.MONSTERS.map(m => ({ id: m.id, model: m.model, color: m.color }))); fs.mkdirSync('/home/model/realmwright/.cap', { recursive: true }); let n = 0
  for (const m of list) { const d = await p.evaluate(async m => { const s = window.ST.studio(); const L = window.ST.monLook(m.model, m.id + 'x', m.color); const r = await s.ready(L); const hum = r.def.rig === 'humanoid' || r.def.rig === 'float'; return await s.portrait(L, 144, m.model === 'flying_sword' || m.model === 'eye_tyrant' || m.model === 'air_elemental' || r.def.rig === 'blob' ? 'full' : hum ? 'bust' : 'full', r.def.rig === 'quad' || r.def.rig === 'dragon' || r.def.rig === 'serpent' ? .85 : .4, 'image/png', m.model === 'dragon' || m.model === 'wyvern' ? 1.75 : ['manticore','griffon','chimera'].includes(m.model) ? 1.9 : m.model === 'bat' || m.model === 'stirge' ? 1.35 : m.model === 'eye_tyrant' ? .9 : 1.08) }, m); fs.writeFileSync(`/home/model/realmwright/.cap/${String(n++).padStart(3, '0')}.png`, Buffer.from(d.split(',')[1], 'base64')) }
  await b.close(); try { process.kill(-v.pid) } catch { } ; fs.writeFileSync('/home/model/realmwright/.cap/list.json', JSON.stringify(list.map(m => m.id)))
  execSync(`python3 - <<'P'
from PIL import Image; import json, glob
L=json.load(open('/home/model/realmwright/.cap/list.json')); n=144; cols=12; rows=-(-len(L)//cols); A=Image.new('RGBA',(cols*n,rows*n))
for i in range(len(L)): A.paste(Image.open('/home/model/realmwright/.cap/%03d.png'%i).convert('RGBA'),((i%cols)*n,(i//cols)*n))
A.save('/home/model/realmwright/public/ui/mons.webp',quality=84,method=6); print(A.size)
P`, { stdio: 'inherit', shell: '/bin/bash' }); process.exit(0)
})().catch(e => { console.error(e); process.exit(1) })
