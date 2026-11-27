# Turn 1: what you asked for (verbatim)

> I play a lot of D&D with my friends, and I want to create a tool using game engine frameworks with Vue that help me create the D&D worlds, dungeons, castles and more.
>
> The idea is that I can generate those worlds or start with a random seed with predefined models and there all the other players can enter ina room using web apis, so we dont need server and they can be in that world on their mobile phones or tablets.
>
> The UI need to look similar to D&D medival and fantasy, we need to have lots of pre-generated assets for creating those worlds.
>
> And I can expand even more if I need with a random expander or manually adding more via a map editor tool.
>
> The user can see in real time 3d the map, look on the dungeon look as FPS or thrid person or top view or isometric.
>
> Everything need to be full 3d, we need to have realistic assets, and this process cannot be buggy or laggy.
>
> I need you to first think about it and plan it before coding. Before each turn answer you do I need you to save a zip file with the contents of the source and our plans and turns so we can have a backup of our thinking process and result.

## Read as requirements

| # | Requirement | How we will know it is done |
|---|---|---|
| R1 | Game-engine framework + Vue | Babylon.js (a full web game engine) under Vue 3 |
| R2 | Generate dungeons, castles "and more" | Several generators, each tested over hundreds of seeds |
| R3 | Start from a random seed or a predefined model | Seed box + dice button; gallery of named, ready worlds |
| R4 | Friends join a room, no server, phones/tablets | WebRTC between browsers; touch controls |
| R5 | Medieval-fantasy D&D look | UI of parchment, iron, leather; period type |
| R6 | Lots of pre-generated assets | A library of 150+ real 3D models + 30+ PBR materials |
| R7 | Random expander | One click grows the world from any side or any door |
| R8 | Map editor | Paint floors, walls, doors, props, terrain; undo/redo |
| R9 | Real-time 3D: FPS, third person, top, isometric | Four cameras, switchable any time |
| R10 | Full 3D, realistic | PBR shading, baked occlusion, torchlight that respects walls |
| R11 | Not buggy | Automated tests + a scripted browser playthrough |
| R12 | Not laggy | Quality tiers, few draw calls, work off the main thread |
| R13 | Plan before code | PLAN.md written and zipped before the first line of code |
| R14 | A zip every turn: source + plans + turns | `npm run backup` writes to backups/ |
