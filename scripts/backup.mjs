// npm run backup -- <turn>   Zips source, assets, plans and turn notes into backups/. Also zips the built site if dist/ exists.
import { execFileSync } from 'node:child_process'; import { existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
const turn = String(process.argv[2] ?? '').padStart(3, '0'); if (!process.argv[2]) { console.error('Which turn? npm run backup -- 2'); process.exit(1) }
mkdirSync('backups', { recursive: true }); const out = `backups/turn-${turn}.zip`; rmSync(out, { force: true })
execFileSync('zip', ['-rq', out, '.', '-x', 'node_modules/*', 'dist/*', 'backups/*', '.git/*', 'forge/.work/*', '*/__pycache__/*', 'captures/*', '.cap/*', 'shots-*', 'test-results/*']); console.log(out, (statSync(out).size / 1e6).toFixed(1) + ' MB')
if (existsSync('dist/index.html')) { const s = `../backups/turn-${turn}-site.zip`; rmSync(`backups/turn-${turn}-site.zip`, { force: true }); execFileSync('zip', ['-rq', s, '.'], { cwd: 'dist' }); console.log(s.slice(3), (statSync(s.slice(3)).size / 1e6).toFixed(1) + ' MB') }
