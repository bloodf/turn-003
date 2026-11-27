# Turn 1

Request: see `turn-001-request.md`. Plan: see `../PLAN.md` (zipped before any code, `backups/turn-001a-plan-before-code.zip`).

## Thinking, in order
1. Looked at the machine first. No GPU, no asset sites, npm and PyPI reachable. Found a way to run Blender headless (bpy wheel + a CPython from Maven). That turned "boxes with colours" into a real asset pipeline.
2. Chose Babylon.js because you asked for a game engine, and because Vue must never sit in the render loop.
3. Decided the two things that would sink the project if wrong: **light** (hundreds of torches on a phone) and **multiplayer truth** (send the world, not the seed).
4. Wrote the plan, zipped it, then built bottom-up: materials, models, world model, tests, mesher, light, shader, views, editor, network, interface.
5. Measured, found what was slow or broken, fixed, measured again. See DECISIONS.md.

## Requirements, checked
| # | Requirement | State |
|---|---|---|
| R1 | Game engine + Vue | Babylon.js 9, Vue 3, TypeScript |
| R2 | Dungeons, castles and more | Dungeon, cavern, castle, village, wilderness, wizard's tower, whole realm, blank |
| R3 | Seeds and predefined models | Seed box, dice, "let fate decide", 13 ready-made realms |
| R4 | Rooms, no server, phones and tablets | Room code, handshake scroll, same device. Tested with three browsers over real WebRTC |
| R5 | D&D look | Rendered iron, oak, parchment, wax; blackletter titles |
| R6 | Lots of assets | 203 models, 48 creatures, 58 materials |
| R7 | Random expander | Any side, anywhere, from a clicked room, or a new floor down |
| R8 | Map editor | 14 tools, undo/redo, works on phones |
| R9 | Four views | First person, third person, isometric, top (and a fly camera for the DM) |
| R10 | Full 3D, realistic | PBR materials, traced light, sun shadows. "Good indie game", not photo scans |
| R11 | Not buggy | 15 unit tests over hundreds of seeds, 86 checks in real browsers. Safari, Firefox and real phones not tested |
| R12 | Not laggy | Building is off the main thread; 4-110 draw calls. No GPU here: 15-27 frames a second drawn by the processor. Real GPU speed not measured |
| R13 | Plan first | Yes |
| R14 | Zip every turn | `backups/turn-001.zip`, plus the built site |

## Not done, said plainly
- Real phones, Safari, Firefox and a real GPU have not been tried: this machine has none of them.
- The public relays could not be reached from here. The room-code path was tested against a local relay speaking the same protocol.
- No TURN relay, so a few strict networks will not connect.
- Scanned (photo) assets and a GLB importer are not in.
- Fog of war is per square, not per pixel. Monsters do not act by themselves. Dice are drawn, not simulated.
