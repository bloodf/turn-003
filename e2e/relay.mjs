// a tiny Nostr relay, only so the room-code path can be tested without the internet
import { WebSocketServer } from 'ws'
export function relay(port) {
  const s = new WebSocketServer({ port }), subs = new Map()
  const match = (f, e) => (!f.kinds || f.kinds.includes(e.kind)) && (!f.since || e.created_at >= f.since) && Object.entries(f).every(([k, v]) => k[0] !== '#' || e.tags.some(t => t[0] === k[1] && v.includes(t[1])))
  s.on('connection', w => { subs.set(w, new Map()); w.on('close', () => subs.delete(w)); w.on('message', d => { let m; try { m = JSON.parse(d) } catch { return } if (m[0] === 'REQ') { subs.get(w).set(m[1], m.slice(2)); w.send(JSON.stringify(['EOSE', m[1]])) } else if (m[0] === 'CLOSE') subs.get(w).delete(m[1]); else if (m[0] === 'EVENT') { w.send(JSON.stringify(['OK', m[1].id, true, ''])); for (const [c, l] of subs) for (const [id, fs] of l) if (fs.some(f => match(f, m[1])) && c.readyState === 1) c.send(JSON.stringify(['EVENT', id, m[1]])) } }) })
  return s
}
