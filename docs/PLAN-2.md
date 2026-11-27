# Plan for turn 2: from map tool to game

## 1. What was wrong with the interface (honest look)
Turn 1 leaned on texture: oak planks on every button, one heavy frame around every panel, the same round stud for everything.
It reads as a skin, not a tool. Professional tools (Foundry, Baldur's Gate 3, Blender) earn trust with **hierarchy, density and state**, not ornament.
- Too few levels: a primary action, a toggle and a tab all looked alike.
- Icons without words. No tooltips with shortcuts, no right-click, no search.
- Panels floated over the map and covered each other.
- Body text in a display serif at every size.

**New system.** Three materials, each with one meaning: *slate* (tool chrome), *vellum* (things you read: story, sheets, rulebook), *wax red* (the one thing to do next).
Gilt hairlines mark edges and selection only. Alegreya Sans for interface, Alegreya for reading, blackletter only for the name of the game.
4-px spacing grid; four text sizes; every control has rest, hover, focus, pressed, disabled.
**Layouts.** DM: top bar, tool rail, right dock with tabs (Scene, Bestiary, Party, Story, Rules). Player: portrait and party at left, initiative ribbon on top, hotbar at the bottom, story feed at right. Phone: the same parts as sheets.
Plus: Ctrl-K palette, right-click menus, rebindable-free shortcut sheet, undo history, settings, minimap.

## 2. Rules engine (`src/rules`, pure, tested, no engine and no UI)
SRD 5.1 (CC BY 4.0): 9 races, 12 classes with an SRD subclass each to level 20, 18 skills, 15 conditions, weapons, armour, gear, ~100 spells, ~120 monsters, magic items, encounter and treasure tables.
Wizards' own creatures outside the SRD stay out. Attribution shown in the app.
- `Character` = choices + state. Everything else (AC, attacks, DCs) is *derived* by one function, so it can never drift.
- `Combat` = initiative, action economy, movement in feet, attack/save/damage pipeline with advantage, resistance, conditions, concentration, opportunity attacks, death saves, XP.
- `Game` state lives on the host, saved inside the world file, sent to guests in sections.
- Guests send *intents* ("cast fireball there"), never results.

## 3. The AI Dungeon Master
Two brains, one pair of hands.
- **Hands** (`src/dm/hands.ts`): ~45 verbs. Spawn, move, start fight, roll check, give item, open door, lock, trap, weather, hour, reveal, grow rooms, place furniture, quest, NPC speech, XP, rest, camera, sound. Every verb validates.
- **Storyteller** (built in, always works, no key, no internet, free): campaign generator (hook, villain, chapters tied to real rooms), perception and traps, who notices whom, monster tactics, checks from plain words ("I pick the lock"), loot, rumours, shops, chapters that dig deeper without end.
- **Language model** (optional): Anthropic, OpenAI, Gemini, OpenRouter, a local model (Ollama, LM Studio) or Chrome's built-in one. It gets the scene as facts and may only act through the hands. If it fails or is slow, the Storyteller carries on. The key stays in the host's browser.
Stated plainly: the built-in Storyteller is a rules-and-templates brain. It is fair and tireless but not a novelist. Free conversation needs a model, and most models cost money.

## 4. Populating
Per world: density, difficulty, creature families by theme, **boss every N rooms**, traps, locked doors, treasure, and *auto-populate new rooms*. Applied at forging, by button, and to every room the expander grows. XP budgets use the party's level.

## 5. Joining
Title: My heroes. No hero, no entry: the join screen asks you to choose or make one. A hero lives on your device; the campaign keeps its own copy of state so progress is not lost if either side is.

## 6. DM as ghost
No body. Flies, ignores walls, sees hidden things and fog. Drag any figure in any view. Possess a creature to walk as it.

## 7. Assets
Heroes from parts: 12 class outfits x 2 builds, 9 race heads x 2, recoloured skin, hair and cloth, race proportions; merged to one mesh per hero. ~40 more SRD monsters. Portraits rendered in the app. 3D dice.

## 8. Checks
Rules: unit tests against known 5e numbers. Combat: thousands of simulated fights, no stuck turns, sane win rates. Storyteller: whole campaigns played by bots, headless. Language model: mock servers speaking each provider's format (no real provider can be reached from here). Browsers: full multiplayer run.

## 9. Order
Plan+zip, rules, combat, populate, hands, Storyteller, model adapter, assets, engine, interface, network, tests, measure, zip.
