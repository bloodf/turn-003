var e=`id: lich
title: When the Lich Forgot
code: R15
levels: 11-17
tags: high magic, memory, the end of the world
tone: mystery
ink: #25143a #6fd6a0
pitch: The greatest necromancer who ever lived has begun to lose his memory. He cannot recall what he was holding shut.
about: For nine centuries Azhrak the Deathless has sat on his throne in the Black Spire with both arms stretched out, and the world has taken it for a threat. Last month he put one arm down to look for his spectacles. Something on the far side of the sky noticed.
about: When the Lich Forgot is for high-level heroes. The monster is old, frightened and courteous. You have been hired by his valet to find out who he was, before he puts down the other arm.
villain: The Patient | balor | wants to be let in | has been waiting so long that it has forgotten what for
patron: Mr. Knuckle | valet to Azhrak the Deathless
secret: Azhrak became a lich for one reason: a door opened in the sky over his village, and a living man's arms get tired. He has held it for nine hundred years. He's forgotten his own name, his wife's, and the word that shuts it; which were all the same word.
place spire = The Black Spire | tower seed=spire-6 biome=blight theme=crypt time=1 fams=undead+construct+arcane pop=.45 open=yes | It's black, it's sharp, there's lightning. There's also a boot-scraper, and a mat that says NOT TODAY.
place dread = Dreadham | village size=2 seed=dreadham-8 biome=blight time=16 weather=fog | The nearest village. It's been terrorised every Michaelmas for nine centuries. They've put up the bunting. Nobody's come.
place school = The Drowned School | dungeon size=3 seed=drownschool-3 theme=stone caves=.2 fams=undead+arcane+construct pop=.45 | A college of magic, at the bottom of a lake. It was a small lake. He'd been told that he couldn't.
place tomb = The Garden Tomb | dungeon size=2 seed=gardentomb-7 theme=overgrown levels=2 caves=.3 fams=plant+undead+construct pop=.45 | There's a wall round it, and roses; there's a sundial. It's the only thing for forty miles that has been watered.
place siege = The Conclave's Camp | castle size=1 seed=conclave-5 biome=blight theme=crypt moat=no roofs=battlement time=22 fams=undead+cult pop=.2 folk=no | Eleven necromancers have heard that he's slipping. They've come to pay their respects. They've brought eleven armies and a will.
place sky = The Underside of the Sky | dungeon size=3 seed=undersky-9 theme=infernal levels=2 caves=.3 fams=fiend+elemental+aberration pop=.5 | You go up through where the lightning comes from. There's a sort of attic. The beams are under strain.
place mind = The House of Azhrak | dungeon size=3 seed=azhrakmind-4 theme=stone levels=2 caves=.1 fams=undead+arcane+construct pop=.5 | It's the inside of somebody. It's a nice house. Somebody's been going round it, turning out the lights.

== The Situation | 11 | spire
read: “*He mustn't know that you're here on account of him,*” says Mr. Knuckle. He's a skeleton in a tail-coat. He has polished himself. “*We've put it about that you're the chimney.*”

At the top of the stair, upon a throne of skulls, there's a very old dead man in a dressing-gown, with his left arm stretched out to the side, as stiff as a beam. His right's going through his pockets. “Knuckle,” says Azhrak the Deathless, “have I had my lunch? Who're these? Are they my *sons?*”
goal: Learn what Azhrak is holding, before he lets go.
dm: Azhrak is dignified, wandering. Daily lapses let monsters loose. 'memory' counter: each recovered memory helps the finale.
-- npc knuckle @spire:tower1 stays | Mr. Knuckle | valet | skeleton/skeleton
look: has a duster in his ribs
hi: Four hundred years, sir. One gets to know a gentleman's ways.
? What's wrong (forgetting, ill): It began with the spectacles. He hasn't got *eyes*, sir. Then he asked me who I'd been. I told him. I'd been a burglar. He said, was I any good?
? The arm (holding, door): I always took it for a *gesture*. He's never once put down the both of them. A month ago he scratched his nose. There was a noise, sir, as if the sky'd got its foot in something.
? The last thing (remember): He'll be quite himself for an hour, of an evening. He asks for somebody. He can't get the name. He gets as far as the *shape* of it.
! You're fond of him (insight 15): “He caught me in the plate-room,” says Mr. Knuckle, “with the forks. He said, would I like something that I needn't *run* with.” He does a bit of dusting. “I wouldn't care to break in a new one.” {+knuckle, xp 250} // “One has one's *pride*, sir.”
-- npc azhrak @spire:tower4 stays | Azhrak the Deathless | archlich, retired | lich/lich
look: is looking at you with enormous politeness, trying to place you
hi: How *very* good of you to come. Is it about the roof?
? Your arm (holding, what): It's *important*. (He looks along it.) It's got pins and needles. I don't know when I've—. There's something leaning on the other side. It's quite all right. I've got it.
? Who are you (name, azhrak): I'm—. It's on the door. I had a, before that I'd got a proper one. She used to call it up the garden.
? The forgetting (lost): It's not so bad when it's gone. It's the *going*. One comes into a room for something. And then one thinks: was it this room?
? What did you do (why, lich): I did something *dreadful*. I'm almost sure I'd got a reason.
! You're doing very well (insight 14): You just say it. You put a cushion beneath the elbow. “*Am* I?” says the terror of nine centuries. “I do try. It's *heavy*.” {+cushion, add memory 1, inspire all, xp 300} // “You're too kind,” he says. “Have we met?”
-- scene lapse1 @spire:tower2 many | Things He's Put Down
say: All over the Spire there are things that he set going and forgot. They're still going.
> A kettle, nine hundred years old | arcana 15 | There's a fire elemental in it, about as big as a pea. It's been told *just until I'm back*. You tell it that he's back. It cries; it boils. {add memory 1, +kettle, xp 250} // It whistles. {hurt 5d6 fire one}
> A letter, half-written | history 15 | “*My dear, I shall be late. There is something in the sky. I've only to hold it till*” That's all. There's a pressed flower, blue. {add memory 1, +letter1, xp 250} // It's in a hand like a spider's.
> A war | intimidation 15 | Two armies of the dead have been fighting on the landing since before the Empire. You ask them who's winning. They stop. They all sit down. {+landing, inspire, xp 200} // They think that you're the other side.
> A small hat, on a peg, at the height of a child | | It's been dusted every day. Mr. Knuckle doesn't know whose it is. Nobody's ever told him not to. {+hat1, add memory 1, xp 200}
-- fight loose1 @spire:.3 | Loose Ends | flesh_golem, wraith*, specter | deadly
say: He used to feed them. They're in the cellars. They aren't angry. It's just past dinner.
win: Mr. Knuckle finds the tin.
-- trial roof1 @spire:out:.3 | About the Roof | 5 before 3
say: His arm dipped. There's a crack right across the night. It's an inch wide; there's an *eye* at it.
try: arcana 16 The old ward
try: athletics 16 Push
try: religion 16 Name the stars, in order
try: persuasion 15 Call up to him: “Left a bit!”
try: performance 15 Sing; it steadies him
win: The crack closes on a claw. It falls in the garden. It's the size of a plough. {xp 600, inspire all, +crack}
lose: It got an arm in to the elbow. It felt about. {hurt 8d6 necrotic all dex 16, +crack}
-- fight claw1 @spire:out:.5 [crack] | What Fell | vrock*, hell_hound | deadly
say: It's let go some of its fleas.
win: They burn green.
-- boss heir1 @spire:last [memory>=1] | The Heir Presumptive | Malachar the Pale = mage!, wight*, wraith | deadly
say: He was the apprentice; four centuries since. He's come in by the coal-hole. “*Uncle,*” he calls up the stair, in a voice like treacle. “*It's Malachar. You promised me the chair.*” To you, not at all like treacle: “He *needn't know.*”
win: “Who was that?” calls the old man. “It was the chimney, sir,” says Mr. Knuckle. {+malachar, magic, gold 300, done}
end: That evening he's quite himself, for an hour. “I was holding it *for* someone,” he tells you. “I wrote it all down, so that I shouldn't forget. I can't think where I—. There was a village. They'd know. They've known me all of my life.” {+ch1, open dread, xp 500}

== Dreadham | 12 | dread
read: They're out in the square. They've got pitchforks; they're newly painted. There's a band. “*He's not* coming?” says the Mayor of Dreadham. “*He* always *comes. He does the voice. My little girl's been chosen to* faint.”
goal: Find out what Dreadham knows.
dm: Dreadham = his own village; he terrorises them yearly so that they'd never grow complacent: it's a fire drill for the sky. Town records; children; old midwife ghost. The festival's ritual is the shutting rite in disguise.
-- npc mayor @dread:tavern | Mayor Prudence Grisly | mayor | commoner/townswoman
look: has got the chain on, and a wreath
hi: It's *tradition*. He comes down of a Michaelmas, says “TREMBLE”, and everybody runs for the cellar. We've got it down to nine minutes.
? The cellar (run, why): It's a lovely cellar. It's solid lead. I don't know why it's *lead*. He gave it us.
? The band (tune, song): It's a very old tune. You can't dance to it; it goes round the wrong way. He gets quite cross if we leave out a bar.
? Him (azhrak, like): He's *our* lich. They've got a dragon over at Marl. It's not the same; you can't depend on it.
-- npc crone @dread:chapel | Old Mother Bane | a hundred and four | commoner/h:druid:human:f
look: is shelling peas into a skull
hi: He was born third house along.
? His name (born, proper): It'd be in the register. It's a funny thing: it's been *cut out*. It was done with scissors; round ones, that you'd give a child.
? His wife (she, garden): My great-great's great minded the baby. It was blue flowers. That's all I know. Blue flowers; and she'd stand at the gate, and call.
? A child (baby, hat): Well, there was a *hat*. {+hatclue, add memory 1}
-- scene fete2 @dread:start many | The Terror
say: Nine hundred people are looking forward to being frightened. If they aren't, says the Mayor, they don't know what they'll *do*.
> Do it for him | performance 15 | You do the voice. “*TREMBLE!*” They scream; they run; it's eight minutes forty. In the cellar in the dark they're all laughing, and holding hands. In the lead there's a pattern; it's a *ward*. You're standing on it. {+terror, add memory 1, inspire all, xp 400} // “It wants more from the *chest*,” says the Mayor.
> Play the tune | performance 15 | You take the cornet. It goes round the wrong way; and then, as you come to the end, something in the sky goes *click*, like a latch that hasn't caught. {+tune, add memory 1, xp 400} // You've left out a bar. Everybody looks up.
> Tell them that he's ill | persuasion 14 | There's a silence. Then someone goes in, and comes out with a pie. Then they're *all* doing it. {+pies, add memory 1, inspire all, xp 350} // “He's *dead*,” they say. “How's he ill?”
-- fight sky2 @dread:out:.3 at_once | A Bit of Sky | vrock*, hell_hound, air = air_elemental | deadly
say: It comes down on the bandstand, smoking. It's got wings. It's the wrong colour. This isn't in the programme.
win: “Well, *that's* different,” says the Mayor.
-- trial cellar2 @dread:out:.5 | Nine Minutes | 5 before 3
say: It's not a drill.
try: persuasion 15 “*It's only the rehearsal*”
try: athletics 15 The pram; the bandstand; the Mayor
try: intimidation 15 TREMBLE
try: perception 15 Who's missing?
try: medicine 15 The fainter's really fainted
win: Seven minutes fifty. “*He'd be so proud,*” sobs the Mayor. You shut the lead. You understand what it's for: it's for *this*. He's been drilling them for nine hundred years. {+drill, add memory 1, inspire all, xp 650}
lose: Ten. Somebody'd gone back for the pies. {hurt 8d6 fire all dex 16, +drill}
-- scene house2 @dread:cottage | Third House Along
say: It's a ruin, with a plaque. There's a gate; it's been painted blue, every year, by nobody. There're four hooks inside the door: at three heights; and a low one.
> Hang up the hat [hat1] | | It fits on the low one. There's a breath: as if a house had been holding it. You can hear, upstairs, somebody small being told for the last time. {add memory 2, +hathung, inspire all, xp 500}
> Stand at the gate, and call | insight 15 | You've no name to call. You do the *shape*. Out over the fields a bird stops. From the Spire there's a flash of lightning, sideways: he's *turned his head*. {add memory 1, +called, xp 400} // You feel a fool.
> Look for the register | investigation 15 | There're the pages. There's the hole. It's been folded up, very small, and used to wedge the cradle. You can read half. *—an, son of the miller.* {add memory 1, +half, xp 400} // It's mice.
-- boss herald2 @dread:out:.75 [drill or terror or tune] | The Herald | The Tongue of the Patient = balor!, vrock* | deadly
say: There's a thing standing in the square with its head bowed. It's as tall as the church. “*EXCUSE ME,*” it says, in a voice like a furnace being considerate. “*I REPRESENT SOMEBODY WHO HAS BEEN WAITING. IS THE GENTLEMAN STILL HOLDING THE DOOR?*”
win: It goes out backwards, begging your pardon. {+herald, magic, gold 350, done}
end: So that's what he's holding. It's got a Herald; it's *polite*. You've a tune, half a name and a gate. “He'd have learned it at the School,” says Mother Bane. “How you shut a thing like that. He went off with a spotted handkerchief. He was ever so clever. He couldn't do up his boots.” {+ch2, open school, xp 600}

== The Drowned School | 13 | school
read: You walk down into it with a bubble each. It's all there: the bells still ring, a bit slow. There's a scorched desk in the front row. It's got AZH scratched out; and underneath, in a rounder hand, somebody had begun to put another name, and been caned.
goal: Find out how a young man learned to hold the sky.
dm: Headmaster-ghost proud; exam: the Binding; the fiancée's letters; a rival now demilich-like; his first mistake opened the door (his fault?).
-- npc head @school:start | Headmaster Ovid | deceased | specter/h:wizard:human:m
look: has gills drawn on in chalk, to be going on with
hi: *Late.* By nine centuries. I'll see you after.
? Azhrak (student, clever): That's not his *name*. One gave them all names; it frightened the parents. He could do anything, and he'd do it to see if it'd *go*.
? The door (sky, opened): It was his degree. “*On the Far Side of Things.*” He got it open. He was so pleased. He called us all to come and look.
? Shut it (how, word): He couldn't. It shuts to a name. He'd used up his own in the opening. One would need somebody who knew him from *before*.
-- fight prefects3 @school:.15 | Prefects | wraith*, mage | deadly
say: They've canes. They've waited such a time for someone to be running in the corridor.
win: You walk.
-- trial class3 @school:.3 | Lessons | 6 before 3
say: You can't get to the Library but by going to school.
try: arcana 16 Applied Impossibility
try: history 16 Dates
try: athletics 15 Games
try: performance 15 Elocution
try: sleight 15 Notes, in class
try: insight 15 Who's crying in the boot-room
win: You've a certificate. It says *Could Try*. {xp 700, inspire all}
lose: You're kept in. {hurt 8d6 psychic all wis 16, time 240}
-- scene boot3 @school:storage~.45 | The Boot-Room
say: There's an echo of somebody, about sixteen, with one boot on. “I can move *Saturn*,” he's saying. “I can't do *laces*.” And a girl, laughing; she's got a blue flower in her buttonhole; she kneels.
> Watch | | Over; under; round the back. She says something; it's his name. There's water in your ears. You see her mouth. {add memory 2, +mouth, xp 500}
> Learn the knot | sleight 15 | It goes round the wrong way. It's the *tune*; it's the ward on the cellar floor; it's the whole of the Binding. He'd no more idea than a baby how a door's shut. He just tied its laces. {add memory 2, +knot, inspire all, xp 700} // You've got your own thumb in it.
> Leave them to it | | You go out on tiptoe. {inspire all, xp 200}
-- fight thesis3 @school:library~.58 | His Thesis | eye_tyrant, air = air_elemental | deadly
say: It's on a lectern: it's chained. It's got annotations; some of those have got annotations. It sees you; it *opens*.
win: The last page reads, in another hand: *You clever, clever idiot. Come home.* {+comehome, add memory 1}
-- puzzle exam3 @school:hall~.72 | The Finals
say: There's only one paper. He sat it here, the morning that it opened; he'd left it blank; he'd run. “*What's the one thing that can hold a door against a thing that doesn't tire?*”
answer: nothing|love|someone who won't let go|a dead man|the dead|a promise|stubbornness|something that doesn't tire|death
hint insight 15: He'd eleven hours left in his arms. He thought about it for ten of them.
hint medicine 15: What's the only sort of man that doesn't need to put them down?
wrong: “*See me,*” in red. {hurt 7d6 necrotic one con 16}
win: So that's why. He'd died on purpose, standing up, with his arms out, so as not to *drop* it. “*First,*” says the Headmaster. He can't see the paper. “*First-class honours. I ought to have put it on the board.*” {add memory 2, +why, inspire all, xp 900}
lose: It's still blank. You can see where his thumbs were.
-- boss rival3 @school:last | Second in the Year | Sextus Vane = archmage!, iron_golem, animated_armor* | deadly
say: He's never left. He came second. He's been marking time: he's got it in jars. “I'd have *thought* of it,” says Sextus Vane. “I'd have held it *beautifully*. Nobody ever asked me to. They only ever asked *him*.”
> Ask him to hold it | persuasion 16 | He's got an answer ready for everything else. “*What?*” says Sextus. “*Me?* — For how *long?*” You tell him. He looks at his arms. He's quite thin. {+sextus, skip, xp 900, done} // “*Now* you ask,” he says.
win: He's put it all on the one throw. He always did. {magic, gold 400, done}
end: A knot; a tune; a girl with a blue flower. The name'd be on her grave. “She'd never have let him put up anything grand,” says the Headmaster. “She'd say, *who's to dust it?*” {+ch3, open tomb, xp 700}

== The Garden Tomb | 14 | tomb
read: You can smell it from a long way off: roses, in that country. There's a gate, painted blue. There's a path edged with skulls, whitewashed, as you'd do with stones. He's come here by himself, says Mr. Knuckle, every night for nine hundred years, in his *head*. “*He never could get away, sir.*”
goal: Learn her name.
dm: Guardian constructs he made; she left messages; their child; a rose-dryad. The name on the stone has worn off by being touched (by him in spirit).
-- npc gardener @tomb:start | Mr. Spade | gardener | skeleton/zombie
look: is a skeleton with a rose growing up through him, tied in
hi: Mind the border.
? Her (wife, name): I never heard it. He'd say “*her* garden”. I do blue ones. He'd like there to be a *true* blue. There isn't. I've got it to a sort of mauve.
? The stone (grave, inside): It's in the middle. He's worn it right away. He only ever *thinks* of touching it; but it's nine hundred years.
? The guards (safe): There's four. He made 'em before he'd got out of the way of being angry.
-- fight roses4 @tomb:.15 | The Border | treant, violet_fungus* | deadly
say: You didn't mind it.
win: Mr. Spade ties them back. He's not cross. He's had worse from greenfly.
-- trial maze4 @tomb:.3 | The Four Angers | 6 before 3
say: He planted them: At God; at the School; at Her, For Dying; at Himself. You've got to go through.
try: religion 16 The first
try: history 16 The second
try: insight 16 The third
try: medicine 16 The fourth
try: persuasion 15 Say that it wasn't
try: athletics 15 Hold somebody's hand
win: The last of them's the tallest. It lets you by. It's so tired of being right. {+angers, add memory 1, inspire all, xp 900}
lose: You come out of it hating somebody. You can't think who. {hurt 9d6 psychic all wis 17}
-- fight golem4 @tomb:.45 | At Himself | iron_golem, clay_golem | deadly
say: It's got his face. It's got both fists up. There's nobody else that it wants to hit.
> Tell it why he did it [why] | | It stops. It puts down one arm; it puts down the other. You have never seen anything look so much as if it'd been *told it could*. {skip, inspire all, add memory 1, xp 700}
win: It's got no face left. It'd done that.
-- scene stone4 @tomb:shrine~.62 many | The Stone
say: It's plain; it's about as high as your knee. It's as smooth as soap. There's not a letter.
> Feel it | perception 16 | There's a dip, where a thumb has been; it's the shape of a tear. If you lay your own in it you can *almost*—. It's five letters. {+five, add memory 1, xp 500} // It's smooth.
> Lay the knot on it, in string [knot] | | Over; under. You do it with a bit of Mr. Spade's twine; you pull it snug. On the face of the stone, as if it'd been breathed on, the letters come up, for as long as a breath lasts: *ROWAN*. {+rowan, add memory 2, inspire all, xp 900}
> Plant something blue | nature 15 | It's the pressed one, from the letter. It was only ever asleep. It's *blue*. Mr. Spade takes off his hat; and what's beneath it. {+blue, add memory 1, inspire all, xp 500} // It wants a bit more muck.
-- fight thieves4 @tomb:.75 | Resurrectionists | mage*, mummy, assassin | deadly
say: The Conclave have sent for her. If they've the bones they've got *him*. They're very respectful. They've brought a clean sheet.
win: You use the sheet, for them.
-- puzzle cradle4 @tomb:bedroom~.85 | The Second Stone
say: It's next to hers. It's so small that you'd taken it for a footstool. There's a rhyme cut round the edge; she'd have sung it. “*I've the shape of him and the eyes of you. I was with you both for a year and two. I'm why she called, and I'm why he ran. What was I to the broken man?*”
answer: son|a son|his son|child|his child|a child|daughter
hint insight 15: There was a low hook, and a hat.
hint history 15: The door opened over the *village*.
wrong: It's cold. That's all.
win: *Was looking up*, it says, beneath the moss. *Aged three.* The door'd opened; somebody small had been out in the garden. {add memory 2, +child, xp 1000}
lose: You clear the moss with your sleeve. You'd rather that you hadn't. {+child, add memory 1}
-- boss guard4 @tomb:last | At Her, For Dying | The Fourth Anger = mummy_lord!, wraith* | deadly
say: It's the one that he's most ashamed of. It's standing on the path to the gate, where she'd stand. It's screaming at her to *stop calling*.
win: It's quiet; there's a bird. {magic, gold 450, done}
end [rowan]: *Rowan.* It isn't his name; it's hers. She'd called it up the garden for his tea. No: it's the other way about. It was *both*; it was what they were called. “*Rowan, like me,*” she'd say. “*Now you can't lose it.*” The word that shuts the door's the word that she called it with. {+ch4, +theword, open siege, xp 800}
end: It's five letters. You've the shape; you've the tune to it. There're lights on the road: a great many. They're coming to the Spire. {+ch4, open siege, xp 800}

== The Conclave | 15 | siege
read: Eleven of them. They've come to pay their respects. They're in the courtyard of an old fort below the Spire: eleven pavilions; eleven armies, arranged by freshness. “*We quite understand,*” says the Chair, “*that he's not receiving. We only want to know who's to have the* throne.” Up above the arm's begun to shake.
goal: Break the Conclave.
dm: Politics among villains; turn them; tell them about the door; some would help hold; others want to open.
-- npc chair5 @siege:throne | Dame Ligeia Crake | chair of the Conclave | archmage/h:warlock:human:f
look: is knitting, with her own finger-bones
hi: Tea? It's *only* tea.
? The throne (want, why): It's *power*. Everyone knows it. He's sat there for nine centuries with his arms out, and nobody's dared to move. What else would it be for?
? The door (sky, holding): (The needles stop.) What *door?*
! It isn't power (persuasion 16): You tell her. She's the cleverest of them; she doesn't interrupt. At the end she looks out of the tent, at the arm. “He's been doing that by *himself?*” says Dame Ligeia. “I've been so *rude* about him.” {+ligeia, add arms 3, xp 1000, inspire all} // “How *very* like him,” she says.
-- npc small5 @siege:chapel | Necromancer Third Class Pim | junior | acolyte/h:wizard:lightfoot:m
look: has one skeleton; it's a cat's
hi: I only wanted to see him. I've got the poster.
? Help (hold, arms): *Me?* I can only do the one cat. (It's looking at him.) I suppose that it's got four *paws*. {+pim5, add arms 1}
-- scene tents5 @siege:dining many | Eleven Pavilions
say: Each thinks that the other ten are in the way.
> Sow discord | deception 16 | By supper there's six. {+discord, xp 500} // They've done that. They've got a *rota*.
> Show them a crack in the sky | arcana 16 | You point. It's hairline; it's weeping light. One by one they stop talking. Somebody's dropped a skull. {add arms 3, inspire all, xp 700} // “It's *weather*,” they say.
> Ask them who they lost | insight 15 | They none of them got into it for the *skulls*. It takes till morning. There's a ring; a dog; there's a very small shoe. {add arms 2, inspire all, xp 600} // “*Really*,” they say.
-- fight fresh5 @siege:armory | Freshest First | wight*, vampire_spawn, mummy | deadly
say: Lord Gravesend is making his bid.
win: You've put him down to nine.
-- trial parley5 @siege:hall | The Reading of the Rules | 6 before 3
say: It's a tradition: a challenge for the chair: three questions, three duels, and a cake.
try: arcana 16 A duel
try: history 16 A precedent
try: performance 16 A eulogy; he's not dead
try: persuasion 15 A motion
try: insight 16 A weakness
try: medicine 14 The cake
win: Carried, seven to four: *that the Conclave do lend a hand*. It's been minuted. {add arms 3, inspire all, xp 1000}
lose: It's tabled. So are you. {hurt 10d6 necrotic all con 17}
-- fight two5 @siege:study | The Four Against | lich, vampire, mage* | deadly
say: “Let it *in*,” says Lord Gravesend. “I should think that it'd be *grateful*.”
win: It wouldn't have been.
-- scene arm5 @siege:tower2 | He's Forgotten the Left
say: There's a shout from the Spire. He's put it down. He's only looking at his watch; he's wondering if it's time for somebody's tea. The whole of the west goes white.
> Run up there, and be it | athletics 16 | You get your own arms under. It's—. You've never held anything. It's like holding up the idea of *up*. It's eleven minutes. You know just what he's been doing. {+held5, inspire all, add arms 2, xp 1200} // It's got you flat on the floor. It's held. It's *held*. {hurt 10d6 force one, +held5}
> Give him the hat [hat1 or hathung] | | He turns it over. “That's—,” he says. The arm goes back up, by itself, like a man who's heard a cry in the next room. {add memory 2, inspire all, xp 800}
> Call him by half of it | persuasion 16 | “*—an!*” you shout, up the stair. “*Mind the door!*” “Oh, *Lord*,” says the old man, and grabs. {add memory 1, xp 600} // He can't hear, for the light.
-- boss grave5 @siege:out:.4 [arms>=1 or discord or held5] | Lord Gravesend Opens a Window | Lord Gravesend = lich!, balor | deadly
say: He's done it on the lawn with eleven hundred dead for a fuse. It's about the size of a sash. “*Do come in,*” says Lord Gravesend; he's got a very good bow. It takes him by the head.
win: You get the sash down on its wrist. {magic, gold 500, done}
end: They come up the Spire in single file: seven necromancers, and a cat. “*Where'd you like us?*” says Dame Ligeia Crake. She's rolled up her sleeves; so far as they'd go. It'll buy a night. “Then somebody,” she says, looking up, “had better go and *tie the thing off*. And somebody else'll have to go in, and find him.” {+ch5, open sky, open mind, xp 900}

== The Underside of the Sky | 16 | sky
read: You go up by the lightning-rod. There's an attic; it goes on for ever; the beams are as thick as counties. You can see it from here. It's a door, about so big. It's perfectly ordinary; it was painted blue once. All of the rest of what there is is leaning on it. It *knocks*.
goal: Lace up the sky.
dm: Patient's servants; lacing points; speak with the Patient. It is waiting for... it has forgotten; lonely cosmic thing? Possibly was told "come in" by Azhrak: an invitation. Must be withdrawn politely.
-- npc voice6 @sky:.3 | The Patient | at the door | balor/demon
look: is a voice, on the other side of a plank
hi: IS THAT SOMEBODY? I DON'T LIKE TO KEEP KNOCKING.
? What do you want (in, why): TO COME IN. I WAS ASKED. A YOUNG MAN SAID, “COME AND LOOK.” I CAME AS FAST AS I COULD.
? You'd destroy us (big, world): WOULD I? I'M ONLY *LARGE*. I'D NOT THOUGHT.
? What've you forgotten (waiting): I HAD A REASON. IT WAS A LONG WAY. I'VE BEEN HOLDING THIS HAT.
! He'd want you to have it back (insight 16) [child or why]: You tell it about somebody who'd been out in the garden, looking up. Everything stops leaning. OH, says the Patient. WAS THAT A *PERSON?* I THOUGHT THAT IT WAS A LIGHT. I ONLY *TOUCHED* IT. {+sorry6, add memory 2, inspire all, xp 1500} // I'LL WAIT, it says.
-- fight legs6 @sky:.15 | Draughts | air = air_elemental*, vrock, fire = fire_elemental | deadly
say: What gets in under a door.
win: You roll up a rug.
-- trial lace6 @sky:.42 | Over | 6 before 3
say: You've got rope: it's Mr. Spade's; there's a mile of it, mauve. There're nine eyelets, one to a constellation.
try: athletics 17 The Plough
try: acrobatics 17 The Swan
try: arcana 16 The Eye
try: survival 16 The Ship
try: sleight 16 The needle
try: performance 16 Keep time; the tune
win: Over. Under. It's snug as far as Orion. {+laced, inspire all, xp 1300}
lose: It's come undone at the Bear. {hurt 11d6 force all dex 17, +laced}
-- fight knock6 @sky:.56 | It Leans | balor, hell_hound* | deadly
say: It isn't anger. It's only shifted its weight.
win: It says that it's *sorry*.
-- scene gap6 @sky:.68 many | The Gap
say: An inch; you can get an eye to it.
> Look | | It's very dark, it goes on for ever. In the very middle of it something enormous is sitting on a suitcase. {+seen6, inspire, xp 500}
> Pass it something | sleight 15 | You've a pie. You've got a blue flower; you've got the poster. It takes it, in a claw like a crane, as if it was a *moth*. {+gift6, inspire all, xp 800} // It's got your sleeve. It's mortified.
> Withdraw the invitation | persuasion 17 | You say it as nicely as it's ever been said. *There's been a mistake. It's not you. We're so very small.* It's quite some time before it speaks. I SEE, it says. I'D ONLY HOPED. {+withdrawn, xp 1200} // It can't hear. It's *knocking*.
-- puzzle hinge6 @sky:library~.8 | The Latch
say: It's in his own hand, on the inside, where he'd thought that nobody would be: all he'd got time for. “*It opened to my name; so I haven't any. It'll shut to what she calls me. I can't hear her from here. Who am I?*”
answer: rowan
hint history 16: It's five letters. It was on the stone, for as long as a breath.
hint insight 16: “*Like me,*” she'd say. “*Now you can't lose it.*” It's a tree; it's got red berries: you plant it by a gate.
wrong: It rattles. {hurt 9d6 force one}
win: The latch lifts. It's *listening*. It'll only take it from him. {+latch, inspire all, xp 1500}
lose: You've bent a nail round it. It'll do until he comes. {+latch}
-- boss porter6 @sky:last | The Porter | Him Who Carries the Bags = balor!, balor | deadly
say: THE GENTLEMAN MAY BE PREPARED TO WAIT, says something in the dark, in buttons. I'M NOT. I'VE BEEN ON MY *FEET*.
win: It's dropped the lot. There's nothing in any of them but a very old, very large, spotted handkerchief; it'd been going to *stay*. {magic, gold 600, done}
end: It's laced. It's snug. It wants only the bow. “*He's got to say it,*” calls Dame Ligeia, up the rod. There's seven of them in a row with their arms out, shaking, and a cat. “*He's asking for his mother! You'll have to go in!*” {+ch6, xp 1200}

== The House of Azhrak | 17 | mind
read: You go in by way of the eyes. It's a nice house. It's got a blue gate. There's a lamp in every window; and as you come up the path one of them goes out. Somebody's moving about in there, from room to room, with a candle-snuffer, quite gently. It's him.
goal: Find him before the last light goes out, and bring him to the gate.
dm: The finale in his mind: rooms of memory; 'memory' total influences. The Forgetting (boss) is a kindness gone wrong: he is removing pain. Needs Rowan's call.
-- npc boy7 @mind:start | A Boy With One Boot On | sixteen | commoner/h:wizard:human:m
look: is looking for the other
hi: I've lost my—. I can move Saturn, you know.
? Where are you (old, azhrak): There's a lot of us. There's me; there's him on the roof. There's a nice one in the kitchen, but he can't stop crying. There's one going round with the *lamps*. We're hiding.
? Tie it (lace, boot) [knot or mouth]: You kneel down. Over; under; round the back. He watches you do it with his whole face. “That's how *she* does it,” he says. He comes with you. {+boy7, add memory 1, inspire all, xp 800}
-- fight fears7 @mind:.12 | In the Hall | wraith*, specter, lich | deadly
say: They're what people said of him. They've been hung up by the door. They're quite a good likeness.
win: You turn them to the wall.
-- scene kitchen7 @mind:kitchen~.25 many | The Kitchen
say: There's a big man at the table, floury, about thirty. He's got his head on his arms. There's a place laid at his elbow with a very small spoon.
> Sit down | insight 16 | You don't say anything. You hold the spoon. After some time he reaches out, and holds the other end. {add memory 2, +sat7, inspire all, xp 900} // You can't think of anything to say. It's all right. Nor can he. {+sat7}
> Tell him that it's sorry [sorry6] | | “*It thought he was a light,*” you say. “He *was*,” says the miller's son. And then he can breathe. {add memory 3, +forgave, inspire all, xp 1500}
> Give him the hat [hat1] | | He puts his face in it. {add memory 2, xp 800}
-- trial lamps7 @mind:.4 | The Lamps | 6 before 3
say: He's ahead of you. It's a corridor. There's one for each thing. There goes the way to do sums; there goes the smell of rain. You can light them again, if you know what was *in* them.
try: history 17 The School
try: performance 17 The tune
try: insight 17 The gate
try: arcana 17 Saturn
try: persuasion 16 Dreadham, and the pies
try: medicine 17 How she took her tea
win: It's like the front at Lammas. It goes all the way up the stairs. {add memory 3, +lamps7, inspire all, xp 1600}
lose: You've lost your own. You can't think what you came in for. {hurt 12d6 psychic all wis 17}
-- fight proud7 @mind:library~.55 | The One on the Roof | archmage, air = air_elemental, fire = fire_elemental | deadly
say: He's twenty. He's just got it open. “*Come and LOOK!*” he's yelling. He'd be so handsome if you could get him to shut up.
win: You sit on him. “It was going to be for *everybody*,” he says.
-- puzzle door7 @mind:bedroom~.68 | The Shut Room
say: There's one door that he's never opened. He put the bed against it. There's a child's chalk on the panel: it's a picture, of three people and a sun; the sun's got a face. Somebody's written, for him, what he'd said it was. “*This is Mam. This is me. This is the one who's always there when I look up.*”
answer: dad|father|papa|daddy|his father|da|azhrak|rowan|him
hint insight 16: He'd been out in the garden, looking up. What was he looking up *for?*
hint perception 16: It isn't a sun. It's got a pointed hat on.
wrong: It's only chalk. It comes off on your sleeve.
win: He'd run out, to see his father's light. It's not that he looked up at the *door*. The bed slides away by itself. In the cot, in the dark, there's a lamp still burning; he'd never once let himself come and put it out. {add memory 3, +shutroom, inspire all, xp 2000}
lose: You move the bed. There's a lamp, in there. You leave it lit. {+shutroom}
-- fight dark7 @mind:.82 | What Comes In Where He's Been | balor, wraith* | deadly
say: It's the gaps. Something's got its fingers in.
win: You've stopped them up with pie.
-- boss forget @mind:throne~last [memory>=3] | The Forgetting | The Kind Old Man = lich!, wraith*, iron_golem | deadly
say: He's come to the last. He's a tall, stooped, gentle, dead old man, in a dressing-gown, with a snuffer. “I'm only putting them *out*,” he says. “It hurts him so. He's so tired. There's just this one more and then it'll be quite dark, and he can put down his arms.” It's a blue gate; there's a lamp on it. There's somebody standing at it, with her hand up, about to call.
> Let her call [theword or rowan] | | You stand aside, is all. She puts her hands round her mouth. “*ROWAN!*” It goes right up the garden. It goes up the stair; out at the top of the Spire. It goes through the sky like a needle. And the old man turns round, with the snuffer in his hand; his whole face has come up like a lamp. “*Coming!*” says Rowan. “I'm *coming*. I'll just get the *door*.” {+home, skip}
> Take the snuffer, gently | insight 17 | “You've been very good to him,” you say. “You can stop.” “*Can* I?” says the Forgetting. It's the first time that anybody's thanked it. It sits down. {inspire all, +eased, hurt 1d6 psychic one, xp 2000} // He's holding it so tight.
> Stand in front of the gate | | He looks at you, he's so sorry. “It's only the one,” he says. {inspire all, xp 500}
win: It's out of his hand. It rolls under a chair. {+forget_done, done}
end: Somewhere a long way over your heads there's a click. It's such a small one. It's the sound of a door that's been pulled to, by somebody who was on his way out. {xp 3000}
ending [home & forgave]: Rowan | They found him on the throne with both of his arms down. He'd got his boots done up. Mr. Knuckle's put a cloth over the chair; he does the forks. It's a school; it's got nine necromancers, and a cat; it's all on how you'd *shut* a thing. There's a third stone in the garden with a rowan by it; the roses are blue: they're really blue. On the other side of the sky somebody very large is eating a pie. It's sent back the dish.
ending [home]: I'll Just Get the Door | It shut. You were all in the garden at Dreadham, when it did, in the lead; and it was eight minutes dead. They do it still, of a Michaelmas. Somebody's got to do the voice. “*TREMBLE!*” you say; you've the chest for it; and everyone screams. Then, afterwards, they come up out of the cellar in the dark, and look at the stars, all of them; there isn't one out of place.
ending: Two Arms | He's forgotten all of it. He's got a nice room, it looks out on some roses. He thinks that you're the chimney. There's seven of them take it in turns upon the throne, now, an hour each, with their arms out; and there's a list on the door; you've signed it. It isn't so bad. You have a cushion. When it's your hour, and it's leaning, you say it under your breath, the thing that she called. You say it for him.
`;export{e as default};