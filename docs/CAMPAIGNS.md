# How a campaign is written

One plain text file per campaign in `src/modules/`. `npm test` reads every file, checks every cross-reference and plays the first sitting. `npm run campaigns` plays all of them to the end with bots, three ways (chance dice, every check made, every check failed), and fails if any comes to less than 24 hours.

A new paragraph continues the line above it. `#` starts a comment.

## The head
```
id: saltledger
title: The Salt Ledger
code: R1                         printed on the cover
levels: 1-7
tags: coast, smugglers
ink: #123f4f #e2643c             the two inks of the cover and of the interface
pitch: one sentence
about: a paragraph               as many as you like
villain: Name | creature | what they want | their flaw
patron: Name | who they are
secret: what is really going on  only the Dungeon Master sees it
place town = Harrow Quay | village size=2 seed=harrow-9 time=8 weather=fog open=yes | What you see on arriving.
ending [flag]: Title | Text      first that holds; the last one has no condition
job clerks = The Missing Clerks | What is asked | flag clerks_safe | gold=50 xp=100
note page = A torn page: The text of the handout.
```
Map kinds: village, castle, dungeon, cave, wilds, tower, realm. Settings: `size` 1-4, `seed`, `theme`, `biome`, `levels`, `caves`, `time`, `weather`, `moat`, `roofs`, `style`, `fams` (who lives there, joined by +), `pop` (how many rooms are lived in), `folk`, `boss`, `open` (known from the start). The same seed always gives the same map.

## A sitting
```
== Title | level | place
read: boxed text, read aloud
goal: one line for the players
dm: what is going on, for the Dungeon Master
end [condition]: what happens when it is over {+flag, open place}
```

## Blocks
`-- kind key @place:where flags [condition] | Name | ...`

Where: a room type (`tavern`), a depth (`library~.6`, turned into a library), `start`, `last`, or open ground (`out:.4`). Flags: `many` (can be returned to), `stays` (a person who stays for later sittings), `later` (waits to be called), `ambush`, `at_once`, `free` (may end the sitting at any time).

| Kind | Extra | Lines under it |
|---|---|---|
| `npc` | role, `creature/model` | `look:`, `hi:`, `bye:`, `shop:`; `? Topic (words): answer`; `! Pressing question (insight 13): yes // no` |
| `scene` | | `say:`, options, `win:` |
| `fight`, `boss` | foes, threat | `say:`, options before blows, `win:`, `lose:`. `ogre!` is the boss, `goblin*` a crowd; numbers are balanced to the party at the table |
| `trial` | `5 before 3` | `try: athletics 14 Cut the anchor`, `win:`, `lose:` |
| `puzzle` | | `answer: a|b|c`, `hint insight 13:`, `wrong:`, `win:`, `lose:` |

An option is `> What you do [condition] | check | what happens // what happens if it fails`. The check is `persuasion 13`, `gold 20`, `item rope`, `leave` or empty.

## Effects
In braces after any text: `{+flag, -flag, add trust 2, xp 50, gold 30, item rope, magic, note page, job clerks, open place, shut place, go place, time 60, hour 22, weather snow, rest long, heal all, inspire, hurt 2d6 fire all dex 13, tired all, fight key, scene key, skip, reveal, unlock, gone key, mood key 10, done}`. `done` ends the sitting.

Conditions: `flag`, `!flag`, `a & b`, `a or b`, `trust>=3`, `item rope`, `cls rogue`, `race dwarf`, `solo`, `done key`. Text may say `%who` and `%party`. `*Stars*` are italics.

## What the game does with it
- A choice is put to the whole table. Most votes win; after 25 seconds the votes that were cast decide. Whoever made the suggestion throws.
- Fights are rebuilt for the number and level of the heroes present and for the difficulty.
- A place keeps its dead, doors, chests and fog when you leave.
- The block that ends a sitting waits until most of the rest is behind you (unless `free`).
- Dice cannot close a sitting for good. When nothing is left to try, the way opens after all and costs eight hours.
- If a person is the Dungeon Master, nothing starts by itself (there is a box to tick): the file is their script.

## The covers
`node scripts/capture/covers.cjs` stages each picture in the game's own world, `python3 forge/covers.py` inks it. `python3 forge/thumbs.py forge/art/mons_colour.webp public/ui/mons.webp 144` inks the bestiary.
