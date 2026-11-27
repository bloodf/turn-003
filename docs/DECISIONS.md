# Decisions and changes of mind

The plan stays as written. This is where reality pushed back.

| # | Planned | What happened | Why |
|---|---|---|---|
| 1 | Trystero for room codes | Replaced by our own introduction layer (`src/net/nostr.ts`, `CodeTransport`) | A stress test (join, cut, rejoin) hung for good about 1 time in 15. Ours: 40 of 40, and it reconnects by itself |
| 2 | Low tier = fewer effects in the same shader | Low tier is a different, tiny shader; light is baked into vertices on the CPU | With no GPU the per-pixel light cost 170 ns a pixel. Now about a quarter of that |
| 3 | Two levels of detail | Three. Far trees are 15 triangles, far windows 4 | Outdoor scenes were 600k triangles; now 30-120k in view |
| 4 | Ultra adds screen-space ambient occlusion | Not built. Occlusion is baked instead (ray traced into every model, computed at every wall foot) | Looks better at zero run-time cost; SSAO needs a second geometry pass |
| 5 | Ready animations from Blender | Animation is procedural, in code | Walk, run, strike, fall for 48 bodies (humanoid, four-legged, eight-legged, winged, floating, blob) in 60 lines; no animation download |
| 6 | Physics engine (implied) | Own walker: circle against grid edges, props, rock field, round towers, stairs | Deterministic, no WASM, and the same code proves every room reachable in tests |
| 7 | ~80 icons, 30 materials, 150 models | 73 icons, 58 materials, 203 models, 48 creatures | |
| 8 | A room is rectangular walls on edges | Castle towers are true circles (`Ring`) | Square towers looked wrong. Walking, light and meshing all know about rings |
| 9 | Light volume, 2 samples | As planned. Leak-free because samples are pushed off the surface by more than half a texel, and clamped to a storey | 420 torches in the largest realm cost the same as one |
| 10 | Undo by command objects | Undo by diff: run any function, record what changed (`transact`) | Generators, brushes, the expander and the network all use the same `Op`. A test checks every edit undoes to the byte |

## Bugs the tests caught before you could
- Standing in a cave pool trapped you for ever (storey computed from the pool floor, not the room floor)
- Expander opened a corridor through the entrance portcullis
- Doors led into the dead side of a castle stair hall
- A ruin on a slope could not be entered
- Editor-dug stairs were walled off at the foot
- In the built site (not in development) no texture ever loaded: the texture worker resolved its paths against itself. Found by opening the build in the desktop's own Chrome; now checked every run
- A river could cut a wilderness in two with no way across
- Guests could send edits to the map (now refused: only doors, chests and their own hero)

# Turn 2

| Plan | What was built | Why |
|---|---|---|
| DM avatar | The DM is a ghost: no body, free camera, drag in any view, *Possess* to walk as any creature | Asked for |
| LLM as the Dungeon Master | Storyteller first, model optional, both through the same verified Hands | A model needs a key and money, can fail, and must not be able to cheat. The game must work without one |
| Guests act | Guests send intents, the host resolves, state comes back as diffs | One place where the rules run; a modified client gains nothing |
| Reactions ask the player | Shield, Uncanny Dodge, Deflect, Cutting Words, opportunity attacks, Hellish Rebuke fire by themselves when they would help | A prompt across the network on every enemy hit stops the game |
| 3D physics dice | Each die is a true polyhedron with a scripted tumble that ends on the number the host rolled | Honest result, same on every screen, no physics engine |
| Heroes as finished models | 12 outfits x 2 builds, 18 heads, 11 hair, 11 headgear, 29 weapons, fused in the browser | 10,000+ looks, and what you equip is what you see |
| One creature file | One file per creature, fetched when first seen | 11.5 MB of creatures, but a game loads a few hundred KB |
| Portraits drawn ahead | A small separate WebGL stage draws portraits and the creator | No world needs to be loaded; works on the title screen |
| Full map stat blocks | 129 creatures, 140 spells, 162 items, condensed | See below |

## Rules that are simplified
- One subclass per class (the SRD one). No feats, no multiclassing.
- Spells keep damage, saves, areas, conditions, concentration and slots. Purely narrative spells (Identify, Fly as true flight, Wish) are noted, not simulated.
- Dragonborn are fire-blooded only. Human is the standard human.
- Flying creatures move fast but on the ground plan. Cover is yes or no (line of sight).
- Grapple is "speed 0 until it breaks free". Two-weapon fighting needs light weapons and a main attack first.
- Difficulty: in an AI campaign a fight the party could not survive loses some of its creatures before it starts. If everyone falls they wake at the entrance, poorer, unless the campaign is *deadly*.

## Bugs the tests caught
- A guest's welcome failed on "this device" because a Vue proxy cannot be posted
- The hero's own walk, driven by the host, was reported back and charged twice
- Ceilings and wall tops were black under fog: they were looked up on the storey above
- Torches in unexplored rooms glowed through the fog
- A party that fell was woken beside the creatures that had beaten it
- A party member's death after the last fall left the table waiting for ever

# Turn 3

| Plan | What was built | Why |
|---|---|---|
| A better interface | Everything redrawn as printed matter: paper, a navy referee's screen, one spot colour that is the campaign's. Two typefaces. No gradients, glows, gold, parchment or rounded boxes. Words instead of icons, except on the build tools | The old look was the stock fantasy kit |
| One hand for all pictures | Covers, title, portraits and bestiary are rendered by the game and cut to two inks and paper. Portraits are cut in the browser, so a new hero belongs too | Colour renders beside flat print looked pasted in |
| The view makes room | The 3D picture ends where the story column begins | The hero was off centre behind it |
| Dice called by the game | A transaction tape: an act that needs a player's die is rolled back, the player is asked, it runs again with that die on the tape | The rules stay one synchronous engine; monsters are never rerolled |
| Typed dice | Checked against what those dice can show; refused otherwise, and can be switched off | Trust at the table is the table's business, impossible numbers are not |
| Own sheets | Numbers written on the sheet win over numbers the rules compute. Empty boxes follow the rules | A blank sheet can be filled in two minutes or in twenty |
| PDF | Form fields are read by name (official sheet, D&D Beyond export); without fields, its text | Handwriting is not read: a photo is pinned beside the form |
| Fifteen campaigns | 134,000 words in a text format of my own (CAMPAIGNS.md), eight of eight sittings and seven of seven | Seven long sittings beat eight padded ones; the hours are what was asked for |
| 24 hours | Measured by playing each to the end with four bots, three ways, and turning what happened into minutes with a stated model (`tests/playmod.ts`): 0.9 min a hero's turn, no fight above seven rounds, 2.4 min a decision, reading at 140 words a minute, 1.1 min a room. The lowest of the three counts | No person has timed them |
| Campaigns move between maps | Each map is kept beside the saved game. Guests are sent the new one | One map per campaign is not a campaign |
| No dead ends | When nothing is left to try the barred way opens and costs eight hours | Bots that fail every check found five places to be stuck for good |

Also: from outside a house you now see its roof and upper walls under fog of war; nights and overcast days are lighter.

## Bugs the tests caught in turn 3
- A path up a stair could not be walked by a click (found by bots)
- Hills counted as the first floor; long walks gave up
- Mercy after a lost fight healed the boss
- A boss with two ways of ending a sitting ended two
- A potion drunk from the sheet asked for dice behind the sheet
- Typed dice outside the die's faces were quietly replaced by a throw
- A call for dice ran off the side of a phone
- The host's hero looked away from the table on a guest's screen
