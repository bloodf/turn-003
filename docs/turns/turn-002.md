# Turn 2

## Asked
A more professional interface. An AI Dungeon Master that controls everything, with dice, so people can play online without a human DM. The whole game: characters, skills, points, XP, files kept for players and DM. Race and class before joining. The human DM as a ghost who sees and moves everything. Monsters by hand or at random, in every new room, bosses after so many rooms. Better assets.

## Done
- **Interface**: rebuilt on one system (slate for tools, vellum for reading, wax red for the one next step). Dock, hotbar, initiative ribbon, story feed, roll log, minimap, right-click menus, Ctrl K, tooltips with keys, journal, settings. Phone layouts.
- **Rules** (`src/rules`): 11 races, 12 classes to level 20, 10 backgrounds, 18 skills, 129 creatures, 140 spells, 162 items, conditions, concentration, reactions, death saves, rests, XP, levels.
- **AI Dungeon Master** (`src/dm`): Storyteller, 54 verbs, campaign generator, plain-words understanding, people, shops, quests, traps, locks, secret doors, wandering creatures, endless growth, optional language model.
- **Heroes**: creator with live 3D preview, living sheet, pack, spellbook, level-up; kept on the device, carried between tables, saved with each campaign.
- **Ghost DM**, possession, drag anything, every AI power as a button.
- **Populate**: by theme or family, budgets by level and party, boss every N rooms, treasure, traps, locks; new rooms fill themselves.
- **Dice**: true polyhedra across the screen, decided by the host.
- **Assets**: modular heroes, 39 new creatures, better townsfolk, recoloured dragons and kin, 26 new props, effects, portraits, new title picture.

## Checked
See the numbers in the final message of the turn. Language models were tested only against mock servers speaking each provider's format: no real provider can be reached from the build machine.
