# Plan for turn 3: printed matter, dice on demand, fifteen campaigns

## 0. Why the interface still reads as machine-made
Looked at every screen again. What gives it away:
- Near-black panels, gold accent, cream parchment, red button: the stock fantasy kit.
- The same translucent 1-px box round everything; pills for every choice; an icon beside every word.
- A gradient washed over a screenshot for a title page.
- Half-empty pages with small text in the middle. Wizards of six steps with one question each.
- Sheets that look like dashboards. No table player has ever held one.

## 1. One idea: a boxed set
The game looks like the printed matter of a role-playing box, because that is what it replaces.
| Thing | Looks like |
|---|---|
| Title page | the box lid: lettering, illustration, contents list |
| Campaign | a module cover, each with its own two inks and its own illustration |
| Campaign page | the first spread of that module |
| Hero | a record sheet: ruled boxes you write in |
| Story, handouts | white page, boxed read-aloud text |
| In play | flat instruments, one ink, like a referee's screen |

Rules I will hold to: flat ink, square corners, ruled lines, no gradients, no glow, no glass, no gold, no parchment. Hierarchy by size and weight. Icons only on tools and in the hot bar, never as decoration. Tables where the content is a table.
Type: **Grenze** (a roman with blackletter bones) for titles and for reading; **Jost** (a Futura, the face of the old rulebooks) for everything you operate. 
Pictures: every illustration is rendered from the game's own world and creatures, then *inked*: edge lines plus flat screens of two colours, so covers, portraits and monsters belong to one hand.

## 2. Bring your own sheet; the game calls the dice
**Sheets.** Three ways in: make a hero (as now); *fill in a blank record sheet* (every number is yours, the game does not argue); or *import*: Realmwright file, D&D Beyond JSON, Foundry VTT JSON, the fillable PDF sheet, or pasted text. A photo or scan can be pinned beside the form to copy from. Numbers on the sheet win over numbers the rules would compute (AC, HP, saves, skills, attacks, spell DC, slots). Custom attacks, spells and features are allowed.
Not attempted: reading handwriting from a photo.

**Dice.** Nothing a player's hero rolls happens by itself any more. The game *calls* it: "Ysolde, attack roll: d20 + 5 against Goblin 2", then "Damage: 1d8 + 3", "Dexterity save, DC 13", "Initiative", "Death save". Each player chooses: press to throw / roll real dice and type them in / automatic.
The DM (human or AI) calls for any check, save or roll from anyone or everyone, open or secret, and sees who has not rolled yet.
*How:* the rules are one synchronous engine. Each act runs as a transaction on a tape: if it needs a die that a player should throw, everything is rolled back, the player is asked, and it runs again with that die on the tape. Monsters' dice are on the tape too, so nothing is rerolled. Rules code does not change shape, and simulated play is untouched.

## 3. Fifteen campaigns
**Format** (`src/modules/*.txt`): plain text a person can write. Places (maps made from fixed seeds, rooms renamed and refurnished to fit), eight sittings each, people with things to say, scenes with choices and checks, fights balanced to the party at the table, puzzles, group challenges, handouts, side jobs, consequences that carry over, several endings.
**Runner** (`src/dm/module.ts`): plays it for the AI Dungeon Master; for a human DM the same campaign is a script in the dock, with a button for every scene.
**Travel:** a campaign moves between maps. Each place remembers its dead, its doors and its fog. Guests are carried along.
**Voting:** a choice is put to the whole table.
**Length.** Eight sittings of about three hours at a table of four. The clock is computed, not claimed: reading time, rounds from simulated fights, scenes, people, rooms to walk. A test fails if any campaign comes to less than 24 hours for four players. Solo play with automatic dice is quicker and the page says so.
**The list:** 1 level-1 starter, then a spread to level 20: river town smuggling, dwarven hold, plague city, haunted forest, frost war, desert tomb, pirate isles, wizard's tower, infernal bargain, fey court, murder mystery, siege, dragon, underdark, world's end.
All text is mine; only SRD creatures.

## 4. Checks
Tape: same seed, same result as automatic play. Sheets: fixture files of each format. Campaigns: parser and cross-reference checks; every one of the 120 sittings generated, bound to its rooms and played to its end by bots; length test. Browsers: dice typed by a guest, saves called during a monster's turn, travel with a guest, a human DM running a script. Screens: looked at, one by one, at desktop and phone size.

## 5. Order
Plan and zip. Tape and calls. Sheets. Module format, runner, travel. Write the campaigns. Art. Interface, screen by screen. Test, measure, zip.
