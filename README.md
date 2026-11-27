# Realmwright

A role-playing game for one to six players, with or without a Dungeon Master. Fifteen written campaigns, your own sheets, your own dice, worlds in 3D. Vue 3 + Babylon.js.
No backend. The site is static files, and players connect straight to the host's browser.

## Deployment

The source and deployment are maintained in [bloodf/turn-003](https://github.com/bloodf/turn-003).
Play at [turn-003.vercel.app](https://turn-003.vercel.app).
The former [turn-003-site.vercel.app](https://turn-003-site.vercel.app) address serves the same project.

`turn-003-site` was a compiled export of this game, not a separate application.
Its original Git history is merged here; build the site from this repository with `npm run build`.

## Run it
```
npm install
npm run dev            # http://localhost:5173
npm run build          # makes dist/, the whole site
npm test               # rules, 300 simulated fights, bot campaigns, model adapter, generators
npm run e2e            # real browsers over WebRTC (run npm run build first)
npm run campaigns      # plays all fifteen campaigns to the end, three ways (hours on one core: see docs/CAMPAIGNS.md)
npm run backup -- 3    # zip of source + plans + turns for turn 3
```
For phones it must be on the web once (any free static host, https): drag `dist` onto app.netlify.com/drop, or push to GitHub (`.github/workflows/pages.yml`), or upload the site zip to itch.io.

## Play
1. **Heroes**: make one, or bring your own sheet: fill in a blank, hand over a PDF or a D&D Beyond or Foundry export, or paste the words. Your numbers win. Heroes live on your device and follow you between tables.
2. **Play a campaign**: pick a cover. The game is the Dungeon Master. Friends join at any time from *Invite*. Below the covers, *Invent a tale* plays on any map, for ever.
3. **Be the Dungeon Master**: the same fifteen as a script in your dock, with a button for every scene, or a world of your own. You are unseen and see everything; possess, summon, populate, build.
4. **Join a table**: no hero, no seat.

**Dice.** When your hero must roll, the game calls for it: attack, damage, save, check, initiative, death. Press, or throw real dice and type what fell, or let it be automatic (Settings). The Dungeon Master asks anyone for any roll from the *Dice* page of the dock.

| | Desktop | Phone |
|---|---|---|
| Walk | WASD, or click the floor in the isometric and top views | left thumb, or tap the floor |
| Throw the dice that are called for | Space | tap *Throw* |
| Fight | click an enemy, or the table below (hover for odds), Space ends the turn | tap |
| Choose in a scene | 1 to 9, or click | tap |
| Act in words | Enter, then type anything: "I search the altar" | the story panel |
| Sheet, pack, spells, journal | C, I, K, J | your portrait |
| More about anything on the map | right-click | press and hold |
| Find any command, creature or room | Ctrl K | |
| All keys | ? | |

## The AI Dungeon Master
- **Storyteller** (default): built in, free, offline. It plays the written campaigns as they are written, or makes up a tale (hook, villain, chapters tied to real rooms), narrates, runs every creature's turn by the rules, springs traps, asks for rolls, understands plain words, plays people and shops, paces, and grows the map for ever. It is rules and templates, not a novelist.
- **A language model** (optional, Settings > Dungeon Master): Anthropic, OpenAI, Gemini, OpenRouter, a local model (Ollama, LM Studio) or the one built into Chrome. Your own key, kept in your browser. It acts only through `src/dm/hands.ts`, so it can never break the rules, and the Storyteller takes over if it fails.

## Three ways to join
1. **Room code** or link or QR. Public Nostr relays introduce the devices (encrypted with the code), then step away.
2. **Handshake scroll**: one QR or text each way. No internet needed.
3. **This device**: a second window.

Without a paid TURN relay some strict networks cannot connect peer to peer. Same Wi-Fi or a hotspot always works. The host's page must stay open and visible.

## Where things are
| | |
|---|---|
| `src/rules` | the fifth-edition rules: heroes, items, spells, creatures, combat, creature tactics. No screen, no network |
| `src/modules` | the fifteen campaigns, as text (`docs/CAMPAIGNS.md`) |
| `src/dm` | populate, Hands, Storyteller, the campaign runner (`module.ts`), language models, the table (`stage.ts`) |
| `src/core` | the world, generators, walking, meshing, light |
| `src/engine` | drawing: actors, hero composition, studio portraits, effects, marks, dice |
| `src/net` | WebRTC, room codes, scrolls, state sync |
| `src/ui` | the interface |
| `forge` | every model and texture, as Python |
| `docs` | plans, decisions, licences, a diary per turn |

Rules material: SRD 5.1 © Wizards of the Coast LLC, CC BY 4.0. See `docs/LICENCES.md`.
