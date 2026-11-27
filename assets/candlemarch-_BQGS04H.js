var e=`id: candlemarch
title: Murder at Candlemarch
code: R8
levels: 2-8
tags: murder mystery, snowed in, everyone lies
tone: mystery
ink: #1f1f28 #e5434c
pitch: The Duke is dead at his own table, the bridge is down, and there are nine people in the house who are glad.
about: You came to Candlemarch to deliver a letter. By the fish course your host was face down in it. Now the snow has shut the valley, the Duke's heirs are dying in order of precedence, and the only people in the house without a motive are you.
about: Murder at Candlemarch is played for clues. Every servant knows something. Every guest is hiding something, and only one of the things is murder. On the last night you will have to stand up in the hall and say a name.
villain: Duke Aldous of Candlemarch | vampire_spawn | means to outlive every one of his heirs | cannot bear to be laughed at
patron: Mrs. Threnn | housekeeper, who has buried two dukes and is not sure about the third
secret: The Duke is not dead. The body at the table was his double. He has traded his line's blood, heir by heir, for immortality, to a thing in the family vault; nine must die by nine nights, and he meant it to look like an enemy's revenge.
place house = Candlemarch | castle size=2 seed=candlemarch-8 biome=snow theme=crypt moat=yes roofs=cone time=21 weather=snow open=yes fams=undead pop=.22 folk=no | Four hundred candles, by the terms of an old bequest, burn in the front of the house all night. Someone has begun to blow them out.
place vault = The Ducal Vault | dungeon size=2 seed=ducal-5 theme=crypt levels=1 caves=.05 fams=undead+vermin pop=.75 | Sixteen dukes in marble with their dogs at their feet. The dogs have all been turned to face the wall.
place village = Marchfoot | village size=1 seed=marchfoot-3 biome=snow time=14 weather=snow | A village that lives by selling candles to one house, and has heard.
place ice = The Ice-House and the Frozen Mere | wilds size=2 seed=mere-6b biome=snow theme=frost time=16 fams=beast+undead+frost pop=.65 | The mere's frozen a yard thick. There's a light under it, moving.
place walls = Between the Walls | dungeon size=3 seed=walls-9 theme=stone caves=.05 fams=vermin+undead+cult pop=.7 | A second house, eighteen inches wide, inside the first. There are spy-holes at the height of each duke's eyes. One set's still warm.
place abbey = Saint Ember's | dungeon size=2 seed=ember-2 theme=crypt levels=2 caves=.1 fams=undead+cult pop=.75 | A chapel of ease for people who weren't easy. The candles in it burn blue, and downward.
place under = The Ninth Night | dungeon size=3 seed=ninthnight-7 theme=crypt levels=2 caves=.2 fams=undead+cult pop=.75 | Under the vault there's another; under that a stair; it's warm, and there's a pulse in the wall.

== The Fish Course | 2 | house
read: Duke Aldous raises his glass to his heirs. “To my dear expectations,” he says; there's some laughter. Then he puts down his face in the sole. It takes a moment for anybody to be rude enough to notice.

By the time that the doctor's been sent for the bridge is down, the doctor's on the other side of it, and Mrs. Threnn, the housekeeper, is standing before you with a bunch of keys. “You're the only ones that came after the soup was made,” she says. “So I know it wasn't you.”
goal: Secure the scene, and learn who was at the table.
dm: Nine heirs: Lady Isolde (daughter), Lord Crispin (son), Canon Ambrose (brother), Dame Hester (sister), the twins Lev & Lucan, Colonel Pyke (cousin), Miss Vane (ward), Sir Roland (bastard). Track 'clues' count. The body is a double: dyed hair, a missing scar.
-- npc threnn @house:kitchen stays | Mrs. Threnn | housekeeper | commoner/townswoman
look: has not cried, and has counted the spoons
hi: It wants someone to ask the questions that I can't. I've to go on working here.
? The Duke (dead, body): Forty years I've laid out that man's linen. When I went to close his eyes I thought: you've let yourself *go*. I can't say more than that. It was only a thought.
? The heirs (nine, family): Nine, with the ward. It goes by age. They can none of them bear one another. There's eleven lines in the will and nine of them are insults.
? The soup (fish, poison): It wasn't the soup. It was not the fish; I had some. He'd his own cup. Sir Roland filled it. Miss Vane passed it. And then everybody touched it, for luck, it's the custom. {+cup, xp 20}
? The candles (four hundred): The first Duke's vow. Four hundred, every night, or the line fails. There were thirty out, this evening, in the west range. I relit them. There's thirty out again. {+candles}
! What was the thought (insight 13): She straightens a cloth that's straight. “He'd a scar,” says Mrs. Threnn. “Behind the ear; a dog. I've combed round it for forty years.” She looks at you. “I *couldn't find it*.” {+noscar, add clues 1, xp 60} // “I've the beds to see to,” says Mrs. Threnn.
-- npc isolde @house:chapel stays | Lady Isolde | the Duke's daughter | commoner/h:cleric:human:f
look: is praying so hard that she's bitten through her lip
hi: Did he say anything? At the end? He never did.
? Your father (duke, love): He used to measure us. Every birthday, against the door; he'd write it in a book. He wasn't sentimental. I don't know what it was *for*. {+measured, add clues 1}
? Who did it (murder, poison): Crispin would like to have. Roland could've. I prayed for it, so I suppose that it was me.
? Tonight (safe, afraid): I'm first. If it goes by age. I'm to lock my door; but I've locked it since I was nine. It doesn't lock from the inside.
-- npc roland @house:armory stays | Sir Roland Fitzmarch | a bastard, and frank about it | veteran/h:fighter:human:m
look: is drinking from the cup that everybody's looking for
hi: Before you ask: I filled it. From the same jug as mine. I'm fine. I'm *disappointed*.
? The cup (poison): Here. Smell. It's only wine. Whatever killed the old man wasn't in his cup. {+cupclean, add clues 1, xp 40}
? Your father (duke, inherit): He'd have acknowledged me. He said so, on Tuesday. “I'm putting you in the line,” he says, “after all.” He was *grinning*. {+inline, add clues 1}
? The others (heirs, who): Crispin's broke. Pyke's worse. The Canon's been selling candlesticks. Hester hasn't a heart to poison anyone with. The twins are seventeen. Vane's... I'd rather that it wasn't Vane.
-- scene table1 @house:dining many | The High Table
say: No one's been allowed to clear. He's still in the fish. There's a candle in front of each place, with a name on it; the Duke's has burned right down.
> Examine the body | medicine 12 | No froth, no colour. He's been dead for longer than he's been dead: there's stiffness in the jaw, and he'd been *speaking*. {+deadbefore, add clues 1, xp 60} // He's dead. It's mostly sole.
> Look at the hair | perception 12 | It's been dyed, and lately: there's a line of it on the collar. The Duke was vain, says everyone. But he was vain of being *grey*. {+dyed, add clues 1, xp 60} // It's got sauce in it.
> Look at the candles | investigation 12 | Nine places, nine names. On eight of them the wick's trimmed. On Lady Isolde's there's a ring cut round the wax, an inch from the top; that's about as far as it'll burn by midnight. {+ringed, add clues 1, xp 60} // They're candles.
> Read the letter that you brought | | You'd been told to give it to him by hand. It's open; the seal's quite dry. “*Sir. I regret that the gentleman you enquired for, he who so resembles your Grace, left his lodgings on Friday, saying he'd a position.*” {+double, add clues 1, note doubleletter, xp 60}
-- scene doors1 @house:guard | Locking Up
say: It's eleven o'clock. There are nine people in nine rooms. You can't watch all of them.
> Put a hair across each door | sleight 11 | In the morning eight are broken from within. The ninth isn't broken at all. And the room's empty. {+hairs, add clues 1, xp 40} // The draught has had them by midnight.
> Sit in the corridor | perception 13 | At two there's a sound like a man walking; only it's *in* the wall. It stops behind Lady Isolde's door. You run. {+walker, add clues 1, xp 60} // You all sit there with your eyes wide open. You'd swear to it. The clock says four.
> Sit with Lady Isolde | | She shows you how to play patience. At two the candle reaches the ring. It goes out by itself; *and the panel by the bed comes open*; and there's a hand. {+satwith, xp 60}
-- fight night1 @house:bedroom at_once | The Hand in the Panel | ghoul*, skeleton | medium
say: It's got a footman's cuff. It's been dead for about a year. It has her by the hair.
win: It drops her. Behind the panel, a passage, eighteen inches wide; and a smell, quite fresh, of pomade. {+passage, +isolde_safe, add clues 1, open walls, xp 40}
-- fight cellar1 @house:storage- | The Wine Cellar | rat*, zombie | medium
say: The Colonel's sent you for a bottle. There's somebody down here who was sent for one in the autumn.
win: In the footman's pocket: a list. *1, the daughter. 2, the brother. 3, the son.* And so forth. It's in the Duke's own hand. {+list, add clues 1, note orderlist}
-- trial crowd1 @house:hall | The Heirs Assembled | 4 before 3
say: Eight people in dressing-gowns, all accusing one another. Somebody's got a poker.
try: persuasion 12 Sit them down
try: intimidation 12 Take the poker
try: insight 12 Ask the one who isn't shouting
try: performance 11 Drop a tray
try: deception 12 “I know who did it”
win: They sit. In the quiet, one after another, they look at the empty chair at the head; and you notice that not one of them's sorry, and that two of them are frightened, and that one is *listening*. {+assembled, add clues 1, xp 60}
lose: Somebody's got the poker in his foot. {hurt 1d6 bludgeoning one}
-- boss canon1 @house:library [clues>=3] | The Second Night | The Thing in the Canon's Chair = ghast!, ghoul*, skeleton | hard
say: Canon Ambrose is in the library, with his back to you. He's second, by age. His candle has gone out. “Come in,” says the Canon's voice; and his head comes round, and goes on coming. “*Two*,” it says.
win: He's been dead since supper. In his breviary, marked with a candle-end, there's one line underscored: *and the father shall devour*. {+canon_dead, +breviary, add clues 1, magic, gold 30, done}
end [isolde_safe]: Lady Isolde's alive: that's one off the list who oughtn't to be. In the morning all the four hundred candles are burning; but there's a new one, thin, at the end of the row, that nobody lit. Mrs. Threnn gives you her second-best keys. “The vault,” she says. {+ch1, open vault, xp 70}
end: There're seven heirs at breakfast. Mrs. Threnn has laid for nine. She gives you a key. “The vault,” she says, “is where they go. I'd like to know if *he's* gone.” {+ch1, open vault, xp 70}
note doubleletter = The Letter You Brought: “Sir. I regret that the gentleman you enquired for, he who so resembles your Grace as to have been cheered in the street, left his lodgings on Friday last, saying he had obtained a position with good food.”
note orderlist = A List in the Duke's Hand: “1, the daughter. 2, the brother. 3, the son. 4, the sister. 5, the cousin. 6 & 7, the pair. 8, the ward. 9, the by-blow (acknowledge first!).”

== Sixteen Dukes | 3 | vault
read: They carry the Duke down to the vault on a door. There're sixteen already, in marble; the seventeenth niche has been cut and polished for years, with the name on. It's got a date of birth. Somebody has chiselled the other date in already. It isn't this week's. It's in nine days' time.
goal: Find out what the dukes of Candlemarch have in their vault.
dm: The previous dukes tried the same bargain and failed. A ghost duke can explain the candles.
-- npc hal @vault:start | Old Hal | sexton | commoner/villager
look: is sitting on the sixteenth duke's dog
hi: I turned 'em. The dogs. They'd started looking.
? The date (nine, niche): His Grace ordered it cut in the summer. I thought it was his doctor'd told him. He came down himself to see that it was spelled right.
? The dukes (sixteen): Good ones, bad ones. You can tell by the weight. There's four that don't weigh *anything*.
? Below (deeper, stair): There's no below. (He gets up off the dog.) It's been bricked since the ninth. I can hear someone *sweeping* it.
-- scene double2 @vault:.15 | The Man on the Door
say: It's cold and there's a good light. You can take your time over him.
> Wash his face | medicine 12 | It comes off: powder, wax, a shade of nose. Underneath there's an actor, about sixty, with a kind mouth. In his shoe's a week's wages. {+actor, add clues 1, xp 80} // You've got his chin wet. It's a very good chin.
> Find what killed him | investigation 13 | A pin, behind the ear, where the scar ought to be. It went in on a hinge; it's in the *headrest* of the Duke's chair. It was wound on a clock. {+chair, add clues 1, xp 80} // It wasn't the fish.
> Ask Hal whose boots those are | | “Those're his Grace's boots,” says Hal. “But that's not how he wore 'em down.” {+boots, add clues 1, xp 40}
-- fight hounds2 @vault:.3 | The Marble Dogs | gargoyle, skeleton* | medium
say: You've turned one round to look at its collar.
> Sit | animal 13 | They sit. All sixteen; it shakes the roof. They were good dogs, they were only ever told the one thing. {skip, xp 70} // You said it in the voice that you'd use to a dog. They're *dukes'* dogs.
win: On the collar: GUARD HIS HEIRS. They'd been turning round to *warn* you. {+guardheirs, xp 40}
-- puzzle wax @vault:library~.45 | The Chandlery
say: A store of candles, four hundred to a shelf; and, behind them, nine moulds in the shape of people. A verse is stamped in the lead: “I weep though I've no eyes, I'm longer born than dying. I'm made for the dark and the dark unmakes me; and what I give you I can't keep. What are they making of us?”
answer: candle|candles|a candle
hint perception 11: You're standing in a chandlery.
hint religion 12: “Four hundred, or the line fails.” It's not that the candles keep the line. It's the other way round.
wrong: A drip of something hot. It smells of you. {hurt 1d8 fire one}
win: The moulds open like books. In each there's hair, or a milk-tooth, or a height marked on a strip of paper. He measured them every birthday: *for the mould*. {+moulds, add clues 1, xp 120}
lose: You break a mould. It's Colonel Pyke's. He'll feel better for the rest of the week, and not know why. {+moulds, +pyke_free}
-- trial bricks2 @vault:.6 | The Bricked Arch | 4 before 3
say: It was bricked from this side: by the tenth Duke, at night, by himself; he wasn't a bricklayer.
try: athletics 13 Pull
try: investigation 12 Find the keystone
try: religion 13 Read what he scratched
try: perception 12 Listen
try: stealth 13 Quietly!
win: There's a hole, and a draught. It smells of pomade. On the inside of each brick he'd written *sorry*. {+arch, xp 100, add clues 1}
lose: It falls; and something sweeping, on the other side, stops. {hurt 2d8 bludgeoning one, +arch}
-- fight light2 @vault:.72 | The Four That Weigh Nothing | specter*, shadow | hard
say: Four marble dukes sit up out of their own lids.
> Ask the ninth what he did | religion 13 | “*I had eight children*,” says the Ninth Duke. “*It wanted nine. I'd have got away with it; I'd only to marry again*.” He puts his face in his hands. It doesn't stop there. {skip, +ninthduke, add clues 1, xp 120} // They would rather that you'd been nine.
win: They're lighter than ever.
-- boss sweeper @vault:last | Somebody Sweeping | The Valet = wight!, ghoul*, skeleton | hard
say: A thin man in good black is sweeping the steps beyond the arch. He has a whisk, and a pot of pomade. He's the Duke's valet; he died, with every sign of grief, on Monday. “His Grace is not receiving,” he says.
> Ask what time his Grace will rise | deception 14 | “At nine, on the ninth, madam, as—” He stops. He's an excellent valet. He's just realised that he is talking. {+slip, add clues 2, xp 150} // “I couldn't say,” he says; and takes out a razor.
win: In his waistcoat: the *real* Duke's watch, going. On the chain there are nine little gold candles. Two have been snapped off. {+watch, add clues 1, gold 40, magic, done}
end: He's alive. He's in the walls; he's watching; he's got seven to go. And up in the great hall the third candle's burned as far as its ring. That's Lord Crispin. “Don't *tell* them,” says Mrs. Threnn. “They'd never stop screaming. Or they'd offer to help.” {+ch2, +alive, xp 100}

== The Village Below | 4 | village
read: Lord Crispin's gone. He isn't dead: he's *gone*, down the ice, in the night, with the family silver and the stable's best horse. It's the first sensible thing that he's ever done. His candle's still burning. It's burning *sideways*, toward Marchfoot.
goal: Find Lord Crispin before midnight.
dm: Marchfoot folk supply the candles; they've been supplying other things. The chandler's daughter was to be the actor's wife. Crispin is hiding in a brothel/inn; he's third; hunted by wolves.
-- npc wick3 @village:tavern | Goody Tallow | landlady of the Snuffer | commoner/innkeeper
look: is very slowly polishing one glass with the wrong side of the cloth
hi: I've not seen him. Who?
? Lord Crispin (silver, hiding): Third door on the left, under the bed. I said I'd not say. He's paid me in a fish-slice.
? The actor (double, friday): *Him!* Lovely man. Did us all the kings. He said that he'd got a week playing a *duke*; said it was the only part he'd ever been asked to do sitting down.
? Candles (chandler, house): Four hundred a night for three hundred years. It's tallow. You'd think there wouldn't be that many *sheep*. {+sheep, add clues 1}
-- npc bet @village:shop | Bet Chandler | chandler's daughter | commoner/townswoman
look: has a ring on her finger that's made of gilt pasteboard
hi: Is he coming down? He said he'd be down on Sunday.
? The actor (he, ring): He was going to do me Juliet. He was going to be her *father*, he said, he was past the other. You can tell me. You've got the face on.
? Your father's work (tallow, moulds): He doesn't do the thin ones. They come back down from the house, the moulds, warm; he says don't touch. I touched. It'd got a *heartbeat*. {+heartbeat, add clues 1, xp 60}
! He wasn't afraid (persuasion 12): You tell her that he'd a kind mouth; and his wages were in his shoe. “That'd be for the hall,” says Bet. She doesn't make any noise. “He said that he'd *hire the hall*.” She gives you what she found in the last mould. {+tooth, inspire, add clues 1, xp 80} // She can see that you're making it up.
-- scene crispin3 @village:bedroom | Under the Bed
say: Lord Crispin of Candlemarch, and eleven hundredweight of plate.
> Tell him it's his father | insight 12 | He's quiet for some time, under there. “I *knew* that he'd never have died of a fish,” says Crispin. “He'd have sent it back.” {+crispin_told, add clues 1, xp 80} // “You're all in it,” says the bed.
> Make him come home | intimidation 13 | “I'm *third*,” he says. “Do you know what it's like? I've never been anything but second.” But he comes. He carries the silver himself. {+crispin_home, xp 60} // He's got hold of the leg.
> Hide him better | stealth 13 | In the chandler's vat, with a straw. He says that it's the warmest he's been in years. {+crispin_hid, xp 80} // Goody Tallow finds him in her flour.
-- fight wolves3 @village:out:.4 | What Came Down the Ice | wolf*, dire_wolf | medium
say: They run like dogs that've been whistled for. There's a red ribbon round each neck, with a number on. It's a 3.
win: The ribbon's off a jewel-case. There's a scent on it: pomade. {add clues 1}
-- trial vat3 @village:out:.6 | The Rendering-House | 4 before 3
say: It's at the far end of the village, and the snow's melted off the roof. Somebody's got to look.
try: stealth 13 By the flue
try: perception 13 Count the hooks
try: medicine 13 Know what you're looking at
try: athletics 13 The lid
win: It's sheep. It's only sheep; all but one vat. That one's very small, and clean, and it's marked with a coronet. There's nothing in it yet. It's been got ready for nine. {+vat, add clues 1, xp 120}
lose: The lid comes down. {hurt 2d8 fire one dex 13}
-- fight men3 @village:smithy | The Chandlers' Company | thug*, cult_fanatic | hard
say: The Master Chandler, and his journeymen, in leather. “It's three hundred years' custom,” says he. “You'll not come between a village and its *custom*.”
> Show them Bet's ring | persuasion 13 | It's only pasteboard. It goes round the room from hand to hand. She's stood here at every one of their Christmases. “He never said that it was to be *folk*,” says a journeyman. {skip, add clues 1, xp 100, +chandlers} // “He'd no business to be *like*,” says the Master.
win: They've a pattern-book. The last page is a child. “Lucan & Lev: to match.” {+chandlers, add clues 1}
-- boss carriage3 @village:out:.8 | The Carriage | The Coachman = wight!, zombie*, dire_wolf | hard
say: At midnight a black coach comes across the ice without any noise. It's the Duke's own. The door opens; the step's let down. “Lord Crispin's carriage,” says somebody with no head. Inside it there's a single, lit, thin candle, set in a stand, about the height of a man.
win: You put out the candle. A mile away up the hill, through four hundred windows, somebody *howls* with temper. {+third_saved, add clues 1, gold 40, magic, done}
end: He's missed one. He's missed two, if Isolde's alive. He has to get his nine, or start again. So he'll stop being careful. “What's between the walls?” you ask Mrs. Threnn. “*Dust*,” she says. And then, “It's never needed dusting.” {+ch3, open walls, xp 120}

== Between the Walls | 5 | walls
read: It's eighteen inches wide. It goes all the way round. At every room there's a slot, at a duke's eye-level, worn smooth; there's a peg for his hat. You go in by Lady Isolde's panel. You've chalk and a lamp. It's already been chalked, low down, in a child's hand: *Lev woz here*.
goal: Hunt the Duke inside his own house.
dm: The twins know the passages. Dame Hester is complicit? red herring. The Duke's den. Colonel Pyke is fifth; Hester fourth. Save as many.
-- npc lev @walls:.1 | Lev | one of the twins | commoner/h:rogue:human:m
look: is seventeen, sixth, and eating a stolen pie
hi: I'm Lev. Or I'm Lucan. He's behind you. He isn't. *Made* you look.
? The passages (know, map): Since we were six. We've seen *everything*. Dame Hester's got a wig. The Colonel cries. Roland and Miss Vane, well.
? Your uncle (duke, here): We saw him Thursday. After. He was sitting in the slot behind the nursery writing down how tall we were. We thought that he was a ghost. He'd got *gravy* on him. {+gravy, add clues 1, xp 60}
? Hester (aunt, fourth): She's up to something. She goes out by the still-room with a basket. It's not murder. It *smells*.
-- npc hester @walls:storage~.3 | Dame Hester | the Duke's sister | commoner/h:cleric:human:f
look: has a basket over one arm; it's moving
hi: If you tell a soul I'll have you flogged.
? The basket (secret): Kittens. There're nineteen. He had them all drowned: he did it when we were children and he's never got out of the way of it. I keep them in the wall.
? Your brother (aldous, cruel): He could never stand to see a thing *finish*. He'd eat half of a cake. He'd start a book at the end. He was afraid, you see. I used to sit up with him. I wish now that I hadn't.
? Tonight (fourth, candle): Mine's got about an hour. I looked. I'm seventy-one; I'd just like to get the *little* ones on to solids.
! Come and sit with us (persuasion 12): “And be *watched?*” says Dame Hester. You hold out your hat. She looks at it; and she puts in it, one after another, nineteen kittens. {+hester_safe, inspire all, add clues 1, xp 100} // “I've my own room,” she says.
-- fight walkers4 @walls:.2 | The Footmen | zombie*, ghoul | medium
say: He's kept them all. They stand in niches, in livery, waiting to be rung for. You've put your hand on a bell-pull.
win: One of them has a tray, still. There's a card on it: *Dame Hester's cocoa*. {+cocoa, add clues 1}
-- trial squeeze4 @walls:.35 | The Squeeze | 4 before 3
say: It narrows. You've got to breathe out to go forward. There's somebody ahead; you can hear him doing the same.
try: acrobatics 13 Sideways
try: athletics 13 Push
try: stealth 13 Breathe when he breathes
try: insight 13 Don't think about it
win: You come out in his dressing-room with your buttons off. There's the hat. It's *warm*. {+warmhat, add clues 1, xp 120}
lose: It's got you. It's some time before you're ungot. {hurt 3d6 bludgeoning one, tired one}
-- scene den4 @walls:study~.5 many | The Duke's Own Room
say: A chair; a wash-hand-stand; eleven spy-holes; the book.
> Read the book of heights | investigation 13 | It's every birthday, for seventy years. He's in there himself, as a boy. Next to each of the others there's a little drop, in red, and a figure. It's pints. {+pints, add clues 1, xp 100} // Four foot one; four foot three.
> Look through the holes | perception 13 | Hall; library; *and a room that you don't know*, with a blue light. It's under water. No: it's under *ice*. {+icelight, open ice, add clues 1, xp 80} // It's you, looking for him.
> Move his hat | | You put it on the wrong peg. Somewhere in the wall there's a hiss of pure annoyance; now you know how far away he is. {+hatmoved, inspire, xp 50}
> Read his letters | history 13 | They're from someone who signs only with a candle. *Nine of thy line, each by a death thou hast not shown thy face at; and I will give thee all their years. Fail, and I'll have thine.* {+terms, add clues 2, note bargain, xp 120} // They're blank. They're written in fat. You'd need to warm them. You warm them; they burn.
-- fight pyke4 @walls:.65 | The Colonel's Last Stand | wight, skeleton*, zombie | hard
say: Colonel Pyke is fifth. He's found the passage by himself, in his nightshirt, with a sabre. He's got his back to a corner. “*There* you are,” he says to you. “Thought it'd be natives.”
win: He's cut about. He cries. “Never *really* been in a war,” says the Colonel. “Only said so. Was it all right?” You tell him it was all right. {+pyke_safe, add clues 1, inspire, xp 80}
-- puzzle slot4 @walls:.78 | The Nursery Slot
say: The way on is locked with a child's alphabet, on a wheel: he used it when he was small; he's used it for the same thing since. “*What's in the middle of March and April, that you can't see in either?*” And, scratched beside it in a boy's hand: “*I'm not afraid of it. I'M NOT.*”
answer: r|the letter r|letter r
hint insight 11: It's a nursery riddle. Spell it out.
hint history 12: March. ApRil. It's the letter that's in the middle.
wrong: A pin, on a hinge. {hurt 2d6 poison one con 13}
win: The wall turns. Behind it there's a child's bed, with a candle-end on every inch of the rail. He must've lit the lot, each night. {+nursery, add clues 1, xp 120}
lose: You kick it in.
-- boss duke4 @walls:last [clues>=4] | His Grace | Aldous in the Wall = vampire_spawn!, ghoul*, zombie | deadly
say: He's at the end of the passage, in a quilted dressing-gown, with a lamp. He's a handsome man. He has still got a little gravy on his cuff. “I do think,” says Duke Aldous, “that in one's own *house*—” and all the footmen in the wall step out.
> Laugh at the gravy | performance 13 | Somebody does; and then you can't stop. It goes on and on. You have never seen a man look so *old*. {+laughed, inspire all, xp 150} // You can't. It's too near.
win: He goes backward through a panel, with a kind of squeak. There's blood on the paper, thick, like wax. {+duke_hurt, add clues 1, magic, gold 60, done}
end: He's hurt, he's late; he's four short. “He'll have gone to *her*,” says one of the twins. You turn round. “The lady under the ice. He talks to her when he thinks that nobody's there. We thought she was a *fish*.” {+ch4, open ice, xp 140}
note bargain = A Letter Written in Fat: “Nine of thy line, each by a death thou hast not shown thy face at, and I will give thee all their years. If one of the nine shall look on thee and laugh, it is forfeit. Fail, and I will have thine. — The Chandler”

== The Lady Under the Ice | 6 | ice
read: There's a light in the mere. It's got a voice, say the twins, like putting your ear to a shell. Miss Vane, the ward, goes as white as the window. “I've heard it since I came here,” she says. “I thought it was my *mother*. She drowned.” She's eighth.
goal: Learn who the Chandler is, and save Miss Vane.
dm: The Lady is the first Duchess, drowned, keeper of the true vow: four hundred candles light the way home. She's the Chandler's captive. Miss Vane can speak with her.
-- npc vane @ice:start | Miss Vane | the Duke's ward | commoner/h:sorcerer:human:f
look: has bare feet, on the ice, and hasn't noticed
hi: She's saying that it's cold. She says: *somebody's moved the lamps*.
? Your mother (drowned): My mother was a lady's maid here. She went in when I was two. He took me for a ward; everyone said how kind. He measured me, too.
? Sir Roland (love): He asked me on Sunday. I said, let me think. Now he's to be ninth, and I'm eighth; and he's sitting outside my door with a sword, being *cheerful*.
! What does she want (insight 12): She lies down flat, with her cheek on it. “She wants someone to *count*,” says Miss Vane. “There should be four hundred. He's let some of them be made of the wrong thing. They don't show the way home; they show the way *in*.” {+wrongcandles, add clues 1, xp 100} // “I can't hear when you're talking.”
-- scene hole5 @ice:out:.3 many | The Ice-House
say: A brick dome, with straw, and a trapdoor. The Duke's blocks are stacked there, very clear. There's somebody in each.
> Look at the faces | perception 12 | Maids; a boy; a governess. They're the ones who were *nearly* family. He'd been practising. {+practice, add clues 1, xp 80} // They're looking at you.
> Find Miss Vane's mother | investigation 13 | She's the eleventh. She's holding a lamp. Between her hands, where it's been melted and has frozen again, is a message in lamp-black: TELL HER NOT TO LET HIM MEASURE HER. {+mothernote, inspire, add clues 1, xp 120} // There are so many.
> Chop one out | athletics 13 | It's the governess. She sits up; she says, quite distinctly, “*Posture*,” and falls to bits. {xp 40} // You've made a terrible noise.
-- fight skaters5 @ice:out:.5 | The Skating Party | zombie*, wight | hard
say: They come across the mere in pairs, with their arms linked, going round and round. It's a quadrille.
> Dance through | acrobatics 14 | You take a hand; you take another. You're passed down the whole length of the set, and out at the bottom, with a curtsey. {skip, inspire all, xp 150} // You're out of time, and they're not.
win: They go through the ice two by two.
-- trial dive5 @ice:out:.7 | Under | 5 before 3
say: The light's forty feet down. It's a yard of ice, and then it's black.
try: athletics 14 Cut
try: athletics 13 Swim
try: survival 14 Hold the rope
try: perception 13 Follow the light
try: religion 13 Pray, in bubbles
try: medicine 13 Bring them round
win: You've touched it: a lantern, the first of the four hundred; it's held by a hand in a glove three centuries out of date. You're let *go*. {+touched, xp 200, inspire all}
lose: Somebody doesn't come up. Then somebody does. {hurt 4d6 cold all con 14}
-- scene duchess5 @ice:shrine~.4 | The First Duchess
say: There's a grotto under the bank, and you can stand. She's sitting in the water with her lamp in her lap. “*I had them lit*,” she says, “*so he could see to come home across the ice. He never did. So I went out to look.*”
> Ask about the Chandler | history 13 | “*He came for the stubs. It was so little to give. Then he came for the tallow. My grandson gave him that. Then the wicks.*” She looks up. “*He's nothing but a hunger with an apron. But he keeps his books. He'd be bound to take what's written.*” {+books, add clues 1, xp 150} // “*Are you he?*” says the Duchess.
> Promise to count the candles | | “*Would you?*” she says. “*I lose my place.*” The lamp goes up a little. {+promise_count, inspire all, xp 100}
> Ask her to light you home | persuasion 13 | She holds it out. It weighs nothing at all; it's warm. “*It'll only burn true*,” says the Duchess. {+truelamp, xp 150} // She can't let go of it.
-- fight fish5 @ice:.6 | The Wax Man | flesh = flesh_golem, ghast | hard
say: Something has been put together, here, of drippings. It's to be the new Duke, when it's got its nine: it's a bit like him already about the mouth.
win: It runs. You step back so as not to get it on your boots.  {+waxman, add clues 1, xp 80}
-- puzzle ledger5 @ice:library~.75 | The Chandler's Book
say: It's chained to the wall: sixteen dukes; each with a column. It's shut with a clasp, in the shape of a snuffer. “*Light me and I'm gone. Name me and I'm broken. Count me and you'll have none. I'm what he's paid in.*”
answer: years|silence|darkness|the dark|days|a promise|time|breath|nothing
hint religion 13: What does a candle spend, while it's burning?
hint insight 13: “I will give thee all their *years*.”
wrong: Every light that you've got goes out. {hurt 3d6 cold one con 14}
win: The clasp falls off. It's a book of *years*. Under Aldous: nine lines, two crossed through, and the rest, in pencil. There's a rubber on a string. {+ledger5, add clues 1, xp 180}
lose: You take it, chain and all. {+ledger5}
-- boss drowned5 @ice:last | The Eighth Night | The Chandler's Man = wraith!, wight, ghoul* | deadly
say: “Miss Vane,” says a man in an apron with no face under his hat. “Your light's wanted.” Her candle's in his hand. It's down to the ring. Behind you Sir Roland comes down the bank in three strides with no coat on.
> Let Miss Vane blow it out | | “It's *mine*,” says Miss Vane. She walks up to him in her bare feet and puffs. You'd never have thought of it. Nor had he. {+vane_safe, inspire all, add clues 1, xp 200}
> Rub out her line [ledger5] | sleight 14 | It takes a bit of rubbing; it's a soft pencil. He looks at the candle. He can't think whose it is. {+vane_safe, inspire all, xp 150} // It smears.
win: His apron's empty. There's nine snuffers in the pocket, in a set. {+eighth_done, +vane_safe, magic, gold 60, done}
end: You come up to the house by lamplight, all of you who're left. It's the eighth night. Four hundred candles are burning in the front windows. You stop; you begin to count; Miss Vane counts with you. It's three hundred and ninety-one. {+ch5, xp 160}

== The Accusation | 7 | house
read: Mrs. Threnn has rung the gong. They're all in the great hall, everyone that you've kept alive, and whoever's behind the panelling. It's ten o'clock on the eighth night. “You'd best tell them,” says Mrs. Threnn. “You'd best say a name.”
goal: Stand up in the hall, and say who did it.
dm: The accusation can be right or wrong; the Duke's listening. The right answer with laughter ruins him. Then he breaks cover. Candles must be recounted. Conclude with St Ember's opening.
-- npc threnn7 @house:kitchen | Mrs. Threnn | housekeeper | commoner/townswoman
look: has counted the spoons, and there's one too many
hi: He took his own out from the canteen, and tonight it's back. He never *could* leave a place-setting.
? The candles (nine, wrong): I've all the footmen looking. You'll know them: they burn toward you.
? Your money (who, guess): I've always known. I laid out the linen. I only wanted it said by somebody who needn't stay.
-- scene count7 @house:guard many | Three Hundred and Ninety-One
say: Nine of the lights in the windows are wrong. If you can find them before midnight he's got nothing to see by.
> Hold the true lamp to each [truelamp] | | They lean away from it. You go along the whole front: nine. You pinch out every one. {+nine_out, inspire all, xp 150}
> Have the twins do it | stealth 12 | They know which ones he used to *look* at. Eight. And the ninth's in the nursery. {+nine_out, xp 100} // Seven. It's something.
> Watch which way they flicker | perception 14 | There's no draught. They lean, the nine, like dogs at a door; all toward the same panel. {+nine_out, +behind, xp 120} // Your eyes water.
-- scene accuse @house:hall | The Name
say: Nine chairs and a fire. They're sitting in order of age, from habit. Somebody's scraped a place for you on the hearthrug. It's so quiet that you can hear the wax.
> “Sir Roland” | | You hear yourself say it. Miss Vane stands up. Somewhere, inside the wall, there's a very small contented sigh. So now you know where *that* is. {+accuse_wrong, +behind}
> “Dame Hester” | | A kitten walks out of her sleeve. There's rather a silence. “I *beg* your pardon?” says Dame Hester. {+accuse_wrong}
> “The Duke” | | “*But he's dead*,” says everyone. You tell them. You begin with the scar: the gravy: the chair with the pin, the actor who'd been promised that he could do it sitting down. Half-way through somebody starts to giggle. It's Lev; or it's Lucan. It spreads. {+accuse_right, inspire all, xp 250}
> “All of you” | insight 14 | “You none of you *liked* him,” you say, “and you all touched the cup.” They look at their hands. Then Lady Isolde gets up. “I'd rather it had been me,” she says; “but it was *Father*, wasn't it? He's in the wall. I can smell him.” {+accuse_right, xp 200} // “That's absurd,” says the Colonel. “I wasn't even *trying*.”
win: A panel opens, in the hall, in front of them all. {+accused}
-- fight rage7 @house:dining at_once [accused] | Unmasked | vampire_spawn, ghoul*, zombie | deadly
say: “How *dare* you,” says Duke Aldous. He's had to come out by the serving-hatch. There's soot on his nose; and nine of his nearest relations are *laughing* at him.
> Laugh [accuse_right] | | It isn't brave. You just can't help it. It's as if someone had opened all of the windows. He's putting his hands up to his face; it's running. {inspire all, +laughed2, hurt 1d4 psychic one, xp 150}
win: He's gone: up the chimney, like a bad smell. He's left his slippers.  {+routed}
-- trial siege7 @house:out:.15 [routed] | The Household Dead | 5 before 3
say: Every bell in the house rings. All the footmen who ever were come out of the walls to wait at table.
try: persuasion 14 Give them notice
try: athletics 14 Hold the pantry door
try: religion 14 Grace, before meat
try: intimidation 13 Mrs. Threnn's voice
try: performance 13 Sound the gong
try: insight 13 Ask for your coats
win: “That'll be *all*,” says Mrs. Threnn. Forty dead footmen bow. They hang up their livery. You've never seen anyone so tired. {+dismissed, inspire all, xp 220}
lose: You're served. {hurt 4d8 necrotic all con 14}
-- scene morning7 @house:library [routed] | Before Midnight
say: He's got one way left to go. It was in the Canon's breviary: Saint Ember's, the private chapel: where dukes were taken who weren't easy.
> Read the page | religion 13 | *And the father shall devour; but if the children be of one mind, he shall choke.* It's not scripture. Somebody's added it, in a woman's hand, with a wet glove. {+onemind, xp 120} // It's a sermon upon fish.
> Ask the heirs to come | persuasion 14 | All of them. Together. Nobody can recall that ever having happened. “Shall I wear the *wig?*” says Dame Hester. {+heirs_come, inspire all, xp 200} // “In this *weather?*” they say. Some come.
> Take the ledger | | You put it under your arm. The rubber swings. {+ledger_carried}
-- boss canon7 @house:chapel [routed] | The Canon's Candle | Canon Ambrose Alight = wraith!, specter*, ghast | deadly
say: In the chapel, on the altar rail, is a candle as thick as a man; and it's got the Canon's face. It's been burning since the second night. “*I sold the candlesticks*,” it says. “*I only wanted to get* away.” It guards the stair; it can't not.
> Snuff him, kindly | religion 14 | You say the words. You wet your finger and thumb. “*Oh, thank you*,” says the Canon. {skip, inspire all, xp 200, +stair7, done} // He flares.
win: He gutters. There's a stair, down, behind the altar. {+stair7, magic, gold 80, done}
end: Eleven o'clock. Blue light's coming up the stair; it smells of pomade and hot wax. Somebody at the bottom is talking, very fast, like a man at a counter. “I've *got* them,” he's saying, “they're only *upstairs*—” {+ch6, open abbey, open under, xp 190}

== The Ninth Night | 8 | under
read: He's under the vault, under the chapel, under the first stone of the house. There's a counter there, and a scale, and somebody in an apron who's adding up. “*Nine*,” says the Chandler. “*Or thine.*” It's quite polite. It's got all of the time in the world; it's been given it in jars.
goal: See that the Duke of Candlemarch pays his own bill.
dm: Endings: heirs of one mind laughing; erase the book; strike a bargain; or kill Aldous. Count who's safe: isolde_safe, third_saved, hester_safe, pyke_safe, vane_safe.
-- npc roland8 @under:start [heirs_come] | Sir Roland | and the rest of the family | veteran/h:fighter:human:m
look: is carrying Dame Hester's basket
hi: We've agreed about something. It's only the one thing. It's rather a novelty.
? What (agreed): That we're none of us having it. The duchy. We tossed for it and everybody lost.
? Miss Vane (love): She said yes. On the ice. I had one boot on.
-- fight drips8 @under:.12 | The Drippings | ochre_jelly*, ghoul | hard
say: What comes down from four hundred candles in three hundred years.
win: It's set.
-- scene jars8 @under:storage~.25 many | The Years
say: Jars, on shelves, by the reign. In each there's a little clear fat, and a light. They're labelled with names, and a number. It's how much was left.
> Open the governess | | Nineteen years go by you in a bonnet. {inspire, xp 60}
> Find the actor's | investigation 13 | Eleven. *Eleven years*, he'd had; and a hall to hire. You take it under your coat, for Bet. {+actorjar, inspire all, xp 150} // They're in order of *weight*.
> Weigh them | | You put the whole shelf on the scale, on the side that's marked OWED. Somewhere ahead of you the adding stops. {+weighed, xp 100}
-- trial wicks8 @under:.38 | The Wick Gallery | 5 before 3
say: Strings, thousands, from the ceiling to the floor; each goes up through the rock, to somebody, in a bed, in Candlemarch. You mustn't so much as breathe.
try: acrobatics 14 Between
try: stealth 14 Hold it in
try: sleight 14 Untie your own
try: perception 14 See the one that's pulled
try: religion 14 A word for each
win: You're through. Nobody's died of it. In the village somebody turns over, and smiles. {xp 250}
lose: One snaps. It's yours. {hurt 5d6 necrotic one con 15, tired one}
-- fight pair8 @under:.5 | To Match | wight*, shadow, ghast | deadly
say: Two wax boys, seventeen, with no faces yet. They've been told to wait for them. “*Lev?*” says the one. “*Lucan?*” says the other. They hold out their hands.
win: You melt them down together. It seemed to be what they'd want.
-- puzzle till8 @under:library~.63 | The Till
say: The Chandler's till is locked with the first question that it ever asked; it was the first Duchess who answered. “*I'm worth the most when I'm given to one who's lost. I'm worth nothing in the daytime. I'm put in the window by one who waits. What did she sell me?*”
answer: light|a light|a candle|a lamp|the light|hope
hint insight 12: She had them lit so he could see to come home.
hint religion 12: It's the only thing that it's ever had which it didn't have to *take*.
wrong: The drawer shuts, and keeps the tip of something. {hurt 4d6 cold one con 15}
win: Ting. It's three hundred years' takings, in one small, warm, honest stub. It'll light *anything*. {+firststub, inspire all, xp 300}
lose: You jemmy it. Ting.
-- fight guard8 @under:.76 | The Sixteen | specter*, wraith, wight | deadly
say: All of the dukes; they've come down off their lids. They'd each have done it if they'd had the *nerve*.
> Send in the dogs [guardheirs] | | GUARD HIS HEIRS. You whistle. You can hear them coming from three floors up. {skip, inspire all, xp 250}
win: Sixteen marble hands let go of you.
-- boss aldous @under:last | The Bill | Duke Aldous of Candlemarch = vampire!, vampire_spawn, ghoul* | deadly
say: He's leaning on the counter. He's got the knack of it; he has always had credit. “They're *mine*,” says the Duke. “I made them. I *measured* them. I'm only asking for what I put in.” The apron turns its hat toward you. “*Who speaks for the debt?*” it says.
> The heirs, of one mind [heirs_come & onemind] | | They're behind you on the stairs, all that're left. Nobody gives a signal. It's Lady Isolde who starts: a sort of hiccup. “He's got *gravy* on him,” she says. Nine of his line look upon him, and laugh. The Chandler closes the book. “*Forfeit*,” it says; it's quite pleased. {+forfeit, skip}
> Rub out all nine lines [ledger_carried or ledger5] | sleight 15 | There's just one left at the bottom. It's in ink. *Aldous.* The apron reads it upside-down; it reaches below the counter for a jar. {+rubbed, inspire all, xp 250} // It isn't pencil now. He's been down and gone over it.
> Light the first stub [firststub] | | It's a very small light. It's the only one in the whole of that place that was ever meant *kindly*. Everything in the room which has been taken turns round to see. {+lit, inspire all, hurt 1d4 radiant one, xp 250}
win: There's a jar on the counter. It's quite a large one. There's something in it, going round and round, that wants to see the manager. {+duke_done, done}
end: “*Paid*,” says the Chandler, and writes it; blows on the ink. “*Will there be anything else?*” You look along the shelves. “Yes,” you say. “All of them.” {xp 350}
ending [forfeit]: Nine Places | They live there still, all that were spared; nobody's the Duke. They quarrel frightfully. At dinner there are nine candles, with a name to each, and a tenth for whoever's lost; and no one may touch anybody's cup. The twins have been measured against the dining-room door, once, by Mrs. Threnn, for trousers. On the mere, at night, there's a lamp going slowly home.
ending [actorjar & duke_done]: A Week Sitting Down | Bet Chandler hired the hall. It's eleven years' run, they say, and not a dry seat. The part of the Duke's played by a marionette. Candlemarch burns four hundred lights, all sheep. You have had a letter from Lady Isolde. “*It's very quiet*,” she writes. “*Last night I locked my door. From the inside.*”
ending: The Eighteenth Niche | They put him in the seventeenth, in the end, in a jar, with the date as he'd had it cut. Sir Roland and his wife have the house. When there's company, and the wind gets up in the panelling, everybody stops talking. Then Dame Hester says, “It's only the cat.” It is. There're nineteen.
`;export{e as default};