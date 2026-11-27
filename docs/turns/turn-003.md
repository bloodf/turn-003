# Turn 3

**Asked:** a better interface (it still looked machine-made), players' own sheets with the game calling the dice in battle and whenever the Dungeon Master wants, and at least fifteen ready campaigns of 24 hours.

**Plan:** `docs/PLAN-3.md`, zipped before any code as `backups/turn-003a-plan-before-code.zip`.

## Built
- **Interface.** Every screen redrawn as the printed matter of a boxed set: paper, a navy referee's screen, one spot colour per campaign, two typefaces, flat ink. Fifteen covers, the title, all portraits and the bestiary are rendered by the game and inked. The view now ends where the story begins. Phones too.
- **Own sheets.** Blank record sheet, fillable PDF, D&D Beyond and Foundry JSON, pasted text, photo pinned beside the form. Sheet numbers win. Amended at the table by the player or the Dungeon Master; own features are tallied, own spells and attacks are on the action table.
- **Dice.** The game calls attack, damage, save, check, initiative, death and healing rolls from the player they belong to. Press, type real dice, or automatic. The Dungeon Master asks anyone for any roll, open or secret, sees who has not thrown and can throw for them.
- **Fifteen campaigns**, 134,000 words, levels 1 to 17, journeys between 8 maps each, votes, handouts, jobs, several endings. The game runs them, or a person with the script in the dock.
- Also: roofs and upper walls are seen from outside under fog, nights and fog are lighter, a reopened game is lit again, no sitting can be closed for good by bad dice.

## Checked
- 119 unit and simulation tests; every campaign's first sitting
- All 15 campaigns to the end with four bots, three ways each (45 runs): all finish, no errors, 24.3 to 37.5 hours by the model in `tests/playmod.ts`
- 141 checks in real browsers over WebRTC (`e2e/run.cjs` 76, `e2e/table.cjs` 65)
- A game saved by turn 2's build opens in this one
- Every screen looked at, desktop and phone size

## Not checked
- No person has timed a campaign. The hours are a model of four players throwing their own dice; alone with automatic dice it is much shorter
- Real phones, tablets and graphics cards (all emulated, no GPU here)
- PDFs: one made to the official field names, not every publisher's form
- Language models only against a mock server, as before
