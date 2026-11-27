# Realmwright: the plan

*Written before any code. Decisions that later changed are recorded in DECISIONS.md, not silently edited here.*

## 1. What this is

A browser tool for a Dungeon Master and a table of players. The DM forges a world (from a seed,
a ready-made realm, or by hand), walks through it in 3D, and opens a room. Friends scan a code
with a phone and stand in the same world. No account, no install, no server to run.

Two kinds of user, and they need different things:

- **The DM** (laptop, mouse + keyboard): forge, edit, expand, reveal, run the fight.
- **The player** (phone or tablet, thumbs): join in seconds, walk, look, roll, see who is where.

## 2. Decisions that shape everything

### 2.1 Engine: Babylon.js 9 + Vue 3 + TypeScript + Vite
You asked for a *game engine*. Three.js is a drawing library; PlayCanvas is an engine but built
around a hosted editor. Babylon is an engine (cameras, skeletons, animation blending, picking, particles)
and installs as plain modules. Vue owns the interface and never touches the render loop; the
engine owns the loop and never touches the DOM. They talk through one small store.
*Rule: no Vue reactivity on anything that changes every frame.* That is the usual cause of lag in Vue + 3D.

### 2.2 One grid, real D&D scale
1 cell = 5 ft = 1.5 m. Levels stack every 4 m, so a castle has storeys and a dungeon has depths, all
in one continuous space you can walk through. Walls live on the *edges* between cells,
which is what lets the same model make both a dungeon corridor and a house with windows.
Caves use the same cells but are drawn as smooth rock.

### 2.3 A world is data, not a recipe
The generator turns a seed into cells + props. What is saved and sent to friends is **the result**
(compressed, tens of KB), not the seed. If two phones computed a world from a seed separately, one rounding difference
would put a player inside a wall. Sending the result removes that whole class of bug,
and means hand edits and generated parts are the same thing.

### 2.4 Light: the make-or-break problem
A good dungeon has 100-300 torches. Ordinary engines manage about 8 lights at a time on a phone.
**Plan: a light volume.** When a world loads (or is edited) a background worker traces every
torch through the grid, stopping at walls, and stores the result in a 3D texture: colour,
main direction, how much sky is visible, how much sun. The shader reads it with two samples.
- 300 torches cost the same as one. - Light does not leak through walls. - Bounce light comes nearly free.
- Direction is stored, so stone still catches torchlight in relief.
Moving lights (a carried torch, spells) are added as a few ordinary point lights.

### 2.5 Drawing: one material
All PBR textures go in one texture array; each vertex says which layer it uses. So a whole
chunk of dungeon (walls, floor, furniture) is **one draw call**. Target: under 150 draw calls
for a full scene, where a naive version would use thousands.

### 2.6 Quality tiers
| Tier | For | What it does |
|---|---|---|
| Low | No GPU / old phones | 512 px textures, no normal maps, sun baked into light volume, low resolution scale |
| Medium | Phones, tablets | Normal maps, specular, point lights |
| High | Laptops | 1024 px textures, real-time sun shadows, bloom, FXAA |
| Ultra | Gaming PC | + ambient occlusion, higher shadow resolution, longer view |

Chosen automatically, then a governor moves the resolution to hold the frame rate. Overridable by hand.

### 2.7 Playing together without a server
Stated plainly: two browsers cannot find each other with nothing at all in between. WebRTC needs one
short handshake. After it, everything flows directly device to device. Three ways to do that handshake:

| Way | Needs | Use |
|---|---|---|
| **Room code** (default) | Internet; uses free public relays (Trystero/Nostr) only to introduce the devices | Type a short code, or scan one QR |
| **Handshake scroll** | Nothing. DM shows a QR/text, player answers with one | Cabin in the woods, no internet, same Wi-Fi |
| **Same device** | Nothing | A second window: put the map on the TV |

The DM's browser is the authority: it holds the world, checks moves and rolls, relays to all.
If a phone drops, it rejoins and is sent the present state.
The app itself is static files: host free on GitHub Pages / Netlify / itch.io.
Known limit: without a paid TURN relay, some strict mobile networks cannot connect peer to peer. Same Wi-Fi always works best.

### 2.8 Assets: made, not borrowed
No internet asset stores are reachable from this machine, and licences of downloaded packs would follow your project forever.
But **Blender 4.2 runs here headless**. So we build an asset forge:
- Materials: synthesised height fields (stone courses, planks, thatch, rock...) → albedo, normal, roughness, occlusion, all seamless.
- Models: scripted Blender: bevels, sculpt noise, remesh, then ambient occlusion baked by Cycles ray tracing into the vertices, plus a low-detail version of each.
- Characters: rigged and animated (idle, walk, run, attack).
Everything is yours, reproducible by one command, and extendable by adding a function.

Honest ceiling: this gets to "good indie game", not photogrammetry scans. The library format takes any GLB later, so
scanned assets (e.g. Poly Haven, CC0) can be dropped in when you are online.

## 3. Asset library (target 150+ models, 30+ materials)
- **Masonry**: pillars (5), arches, door frames, stairs, battlements, buttress, gargoyle, statues
- **Dungeon**: sconces, braziers, chandeliers, candles, sarcophagi, coffins, altar, throne, cages, racks, stocks, chains, spikes, levers, bones, webs, urns, portals
- **Furnishing**: tables, chairs, beds, shelves, books, rugs, banners, chests, barrels, crates, weapon racks, armour stands, fireplaces, cauldrons, alchemy
- **Village**: carts, hay, fences, stalls, wells, anvils, forge, signposts, lanterns, gravestones, tents, campfires, bridges, boats
- **Nature**: pines, oaks, dead trees, bushes, ferns, grass, mushrooms, crystals, stalagmites, boulders
- **Creatures**: heroes (fighter, wizard, rogue, cleric, ranger, barbarian...) and monsters (goblin, orc, skeleton, zombie, troll, spider, wolf, dragon, slime, ghost, golem, mimic...)
(Names and designs stay generic fantasy; Wizards of the Coast owns things like the Beholder.)

## 4. Generators
| Kind | Method | Must hold |
|---|---|---|
| Dungeon | Rooms by rejection sampling → Delaunay-like graph → spanning tree + loops → corridors; room purposes; furnishing grammar | Every room reachable; stairs line up |
| Cavern | Cellular automata + region joining + pools, crystals | One connected region |
| Castle | Concentric plan: curtain walls, towers, gatehouse, courtyard buildings, keep of several floors, undercroft | Can walk gate → keep → tower top → undercroft |
| Village | Road skeleton, plots facing roads, houses with interiors, square, church, smithy, tavern | Every door reachable from the road |
| Wilds | Terrain, river, forest density, camps, ruins, standing stones | Start point not in water |
| Realm | Wilds + village + castle + cavern, joined by road, dungeon beneath | All of the above |

Each room also gets a name, a read-aloud description and DM notes.
**Themes**: Old Stone, Crypt, Sandstone Tomb, Frost, Infernal, Overgrown, Dwarven.
**Random expander**: pick a side or an open wall; it grows new rooms there without touching what exists.

## 5. Editor
Tools: select/move, room, floor brush, wall/door/arch/window/bars, cave brush, stairs, terrain (raise, lower, smooth, paint), props
(searchable library with pictures), lights, creatures, notes, erase, "furnish this room", "expand from here". Undo/redo for everything. Levels up/down. Autosave in the browser; export/import as a file.

## 6. Play
Views: first person, third person, isometric (rotates by 90°), top-down. Fog of war. Tokens on the 5-ft grid with measured movement.
Dice d4-d100 with shared results. Initiative. Ping. "Everyone look here". Doors open for all.

## 7. Interface
Not a web app with a brown theme. Blackened oak and iron for the frame, parchment for anything you read, wax-red for one main action,
gilt for what is selected. Blackletter only for titles; an old-style book face for reading. ~80 engraved icons (game-icons.net, CC-BY).
Phone: left thumb walks, right thumb looks, one bar of actions, sheets slide up from below.

## 8. Not buggy, not laggy: how it is checked
- Unit tests: every generator over hundreds of seeds (connected, stairs valid, nothing outside bounds, props not in doorways).
- Save → load → identical. Edit → undo → identical.
- Real browsers: scripted playthroughs; two browsers joined over real WebRTC; phone-sized touch run.
- Measured budgets: draw calls, triangles, main-thread time per frame, world build time.
- This machine has **no GPU**. Software rendering here is the worst case, so if Low tier is usable here it will be smooth anywhere. Real GPU frame rates I cannot measure here and will not claim.

## 9. Order of work
1. Plan (this) → zip. 2. Materials. 3. Blender models. 4. World model + generators + tests. 5. Mesher + light volume. 6. Shader + views + movement.
7. UI shell. 8. Editor + expander. 9. Multiplayer. 10. Creatures + play tools. 11. Test, measure, fix. 12. Zip.

## 10. Risks
| Risk | Answer |
|---|---|
| Scope | Layers are independent; each step ends with something that runs |
| Characters look wrong | Helms and hoods; sculpted-miniature look; most visible last |
| Phones choke | Low tier, 512 px, chunk culling, adaptive resolution |
| Peer connection fails | Three handshakes, clear messages, rejoin |
| Shader differs by GPU | WebGL2 baseline only, no optional extensions required |
