var e=`id: ninthfloor
title: The Ninth Floor
code: R7
levels: 3-9
tags: wizard's tower, comedy, impossible rooms
tone: light
ink: #2d1b46 #e0459b
pitch: The archmage is dead, his will is alive and walking about, and the floors of the tower have got into the wrong order.
about: Ptolemy Quill left everything to whoever reaches the ninth floor. There's a queue. There are also a will with legs, a lodger who has not paid rent in two hundred years, a floor made entirely of weather, and one room which is always, whichever door you take, next.
about: The Ninth Floor is a comic adventure with teeth. The tower is grieving, and when a tower grieves it moves the furniture.
villain: The Understudy | mage | wants to have been the real one | was made to take the archmage's appointments, and nobody told it they were over
patron: Mistress Adelina Crump | executor, and the only person who ever got a bill out of him
secret: Ptolemy Quill is not dead. He is gardening on the third floor under the name of Tom. He got tired. His simulacrum, the Understudy, was left to answer the door, and has been answering it ever since.
place lawn = Quill's Lawn | tower seed=quill-4 biome=temperate theme=stone time=11 fams=construct+arcane pop=.4 open=yes | A tower that you can see is nine floors high. When you count them you get eight. When you count again you get ten, and one of them waves.
place garden = The Third Floor | dungeon size=3 seed=floor3-7 theme=overgrown caves=.4 fams=plant+beast+wild pop=.45 | You open a door off a perfectly ordinary landing and it's a Tuesday in June, with bees.
place weather = The Seventh Floor | dungeon size=2 seed=floor7-9 theme=frost levels=2 caves=.3 fams=elemental+frost pop=.5 | The stair-carpet runs up to a door marked WEATHER (KEEP SHUT). It's open. It has been snowing on the carpet.
place lost = The Second Floor | dungeon size=3 seed=floor2-3 theme=stone caves=.15 fams=construct+vermin+goblin pop=.45 | Shelves. Umbrellas. Single gloves, forty thousand. Lost causes are under C. Something large is moving about in Marbles.
place exam = The Fifth Floor | dungeon size=3 seed=floor5-12 theme=crypt caves=.05 fams=undead+arcane+construct pop=.45 | A long corridor smelling of ink and fear. On every door it says SILENCE: EXAMINATION IN PROGRESS, and on every door somebody has added, in blood or jam, HELP.
place lease = The Eighth Floor | dungeon size=2 seed=floor8-6 theme=infernal levels=2 caves=.2 fams=fiend+infernal pop=.5 | It's very well appointed, it's rather warm, and there's a brass plate: A. MEPHIT-JONES, ESQ. NO HAWKERS.
place ninth = The Ninth Floor | dungeon size=3 seed=floor9-2 theme=stone levels=2 caves=.1 fams=arcane+construct+elemental pop=.5 | You go up one more stair, and it isn't there; then you stop looking for it, and it is.

== The Reading of the Will | 3 | lawn
read: “*I, Ptolemy Quill,*” reads Mistress Crump, on a picnic chair on the lawn, “*being of sound mind and several bodies*—” Then the will jumps off her lap and runs in at the front door. It has little legs. Eleven heirs go after it. Three of them are still on the lawn by the time that the door shuts; one of those is a frog.

“I shall want it served,” says Mistress Crump to you. “He owes me for six hundred visits, and a hat.”
goal: Get into the tower, and catch the will.
dm: Comic start. Heirs: Lord Basil Quill (pompous nephew), Prunella Wex (adventuress), the Frog (genuine heir). The door has a personality.
-- npc crump @lawn:start stays | Mistress Adelina Crump | executor | commoner/h:wizard:human:f
look: has a parasol, an itemised bill and an expression
hi: Adelina Crump. Solicitor. I've outlived three of his enemies and I've billed all of them.
? The will (legs, estate): Enchanted, against forgery. It's supposed to *bark*. The clause you want is on the last page, so it'll be the last thing that you catch.
? The archmage (quill, dead): Died on the fourth. I've the certificate. It's a very *good* certificate; it's in his own hand.
? The floors (order, nine): He always ran them in numerical order. He was a fool but he was a tidy fool. Now the Seventh's between the Second and the cellar and there's snow in my shoes.
! You were fond of him (insight 12): “One hundred and four pounds eleven and six,” says Mistress Crump, “and he brought me a plum, every time. *Off his own tree*. I never put it on the bill.” {+plum, xp 30} // “I'm fond of being *paid*.”
-- npc frog @lawn:out:.15 | The Frog | third heir | commoner/h:wizard:rock_gnome:m
look: is a gnome who has lately stopped being a frog, and keeps checking
hi: Ribbit. Sorry. Hello. I'm his cousin Fipps. I only came for the sandwiches.
? The other heirs (basil, prunella): Basil went in with six guards and a coat of arms. Prunella Wex went in with a grappling hook and a smile. I'd have said hello to her, but I was green.
? The door (in, knocker): It likes riddles. No, it likes *answers*. It's very particular; it turned me into the frog.
? Come with us (help): I could *carry* things. I'm good with flies.
-- scene lawn1 @lawn:out:.3 many | The Lawn
say: Topiary in the shape of topiarists. Eight garden gnomes (stone). A sundial which is slow.
> Set the sundial right | arcana 12 | You turn it by a hair. Overhead the tower gives a sort of hiccup, and for one moment all nine floors are in order. You get a good look. The third has *curtains*. {+sundial, xp 50} // It's now Thursday. It wasn't. {time 120}
> Count the floors, out loud | perception 13 | One to eight. There's a gap between the eighth and the roof, the height of a floor; the birds go round it. {+gapseen, xp 40} // Eight. Ten. Four. It's doing it on purpose.
> Look under the gnomes | investigation 11 | There's a spare key; it says SPARE. Under the next there's a note, TOM: MORE MULCH. {+sparekey, +tomnote, xp 50} // The gnomes are heavy, and one's ticklish. It bites.  {hurt 1d4 piercing one}
-- fight topiary @lawn:out:.5 | The Clipped Hedge | boar*, animated_armor | medium
say: A box-hedge lion, and a yew boar, and a privet gentleman with shears, who feels that you are untidy.
> Let him do your hair | performance 12 | It's a bold look. He steps back; he kisses his twigs; you may pass. {skip, inspire, xp 50} // He takes a little off the top.
win: It'll all grow back, says the sundial. {xp 20}
-- puzzle knocker @lawn:tower0 | The Door
say: A lion's-head knocker. “You'll be wanting to come in,” it says, round the ring. “Ah'll hab a proper answer. *What'th the one thing Mithter Quill never onthe gave anybody, though he wath alwayth promithing it?*”
answer: his time|time|a moment|a minute|notice|an hour
hint insight 11: Six hundred appointments. Mistress Crump saw him for, in total, eleven minutes.
hint history 11: On his coat of arms is the motto MOX. It means *presently*.
wrong: “Ribbit,” says the knocker, with relish. You're all right; but your tongue's a *bit* long. {hurt 1d4 poison one}
win: “Correct,” says the knocker, sadly; and the door comes open. “I waited for him every night.” {+door1, xp 80}
lose: You use the window. “*Philithtineth*,” says the knocker. {+door1}
-- fight will1 @lawn:.2 [door1] | The Will Goes to Ground | flying_sword*, animated_armor | medium
say: You've seen it go down into the cellar: little legs. It's found friends. The umbrella-stand has views.
win: You've got one page. It bit you. “*Item: to my nephew Basil, the coat-hanger, he'll know why.*” {+page1, note page1}
-- scene basil1 @lawn:hall~.45 | Lord Basil
say: He's stuck in a doorway. It's a perfectly normal doorway, but it's been told about him. Six guards are pulling. “*Do* something,” says Lord Basil. “I'm *rich*. I'm about to be.”
> Butter | sleight 12 | He comes out like a cork. He's almost grateful; it's a new feeling, and he's not sure where it goes. {+basil_owes, gold 20, xp 40} // He comes out; not all at once.
> Ask the doorway why | persuasion 12 | “He called her *staff*,” says the doorway. You make him apologise: to the doorway, to Mistress Crump, and to a housemaid, deceased. By the end he seems smaller. He fits. {+basil_better, inspire, xp 60} // The doorway tightens.
> Leave him | | “I shall remember this!” cries Lord Basil. The doorway says that so will it.
-- boss butler1 @lawn:last [page1] | The Cellars | Havisham the Butler = flesh_golem!, animated_armor, flying_sword* | hard
say: A butler nine feet tall, and assembled from several others, is standing at the foot of the stair with a salver. On it is the rest of the will; under it a calling card. THE MASTER WILL SEE NO ONE. THE MASTER IS NOT DEAD. THE MASTER IS *IN*. It's signed, with a flourish, *P. Quill*; the ink's wet.
> Send up your own card | performance 13 | He considers the card. He considers his instructions. It says *no one*; but this is clearly *someone*. He bows in three sections. {skip, +havisham, xp 100, done} // You haven't one. You write it on a sandwich.
win: The salver goes spinning. The will's gone up the stair; but you've the card. Somebody's up there, answering the door.  {+card1, gold 30, magic, done}
end: “That's his hand,” says Mistress Crump. She looks at it a long while through the glass. “It's the hand that he did *cheques* in.” Above you the tower shifts its weight; and the landing which had gone to the second floor, you notice, now smells of June. {+ch1, open garden, xp 80}
note page1 = Page One: “Item: to my nephew Basil, the coat-hanger; he'll know why. Item: to Prunella, whatever she has already taken. Item: to my cousin Fipps, an apology. Item: to A.C., the plum tree, if she can find it.”

== Third Floor: Tuesday | 4 | garden
read: It's a Tuesday in June. It's been the same one, to judge by the roses, for some time. Bees; a wheelbarrow; a straw hat going along behind a hedge, and under it somebody whistling. “*Mind the lettuces!*” calls a voice.
goal: Find the second page of the will in the garden.
dm: Tom the gardener is Quill. He won't admit it. Give hints. Prunella is here, trapped by a rose that's fallen in love. A green wyrmling has been raised on slugs.
-- npc tom @garden:.1 stays | Tom | gardener | commoner/h:druid:human:m
look: is a small round man in a straw hat, with ink, very old ink, in the creases of his right hand
hi: Morning. It's always morning. Hand us that trowel.
? The will (page, legs): Little fellow with the legs? Went through the sweet peas. Took one of my strings.
? The archmage (quill, master): Never met him. Busy man, I heard. Always *presently*. I'd not have wanted to be him. I should think that he'd not much wanted to, either.
? The tower (floors, upset): Well, she's missing somebody. You'd move the chairs about.
? Plums (plum, tree): (He goes rather still.) There's a tree. It's not ready. It was for somebody. They never had *time*.
! Adelina Crump sends her bill (persuasion 13) [plum]: “Does she?” says Tom. He takes off the hat. He's going bald. “What's it come to? — No. What did she *say?*” {+tom_moved, xp 100} // “Couldn't tell you,” says Tom, to the lettuces.
-- npc prunella @garden:.35 | Prunella Wex | adventuress | scout/h:rogue:half_elf:f
look: is being embraced, warmly, by nineteen feet of climbing rose
hi: Don't laugh. It's sincere.
? The rose (help, down): I said it was pretty. I was being *polite*. It's proposed.
? Race you (partner, heir): Partners to the ninth? Then it's every girl for herself. I always tell people beforehand. {+prunella_deal}
! Let it down gently (persuasion 12): You explain to the rose about adventuresses. It weeps: dew. It lets go, one thorn at a time; it gives her a bud. She's quite quiet for some minutes. {+prunella_free, xp 60} // It holds her tighter.
-- scene bees2 @garden:start many | The Bees
say: They're reading. It's a sort of hive; it's got shelves.
> Ask the bees | animal 12 | They dance it: a small square thing, with legs; *left* at the compost. And something else, in the dance for *queen*, only upside-down, and with a hat. {+bees, xp 60} // They're on a difficult chapter.
> Return a book | investigation 11 | It's on the bench; it's ninety years overdue. You're given honey; also a fine. {gold -2, heal 8, xp 30} // You've put it back in the wrong place.
-- fight slugs2 @garden:.25 | The Bad Bed | ochre_jelly, violet_fungus*, shrieker | medium
say: Every garden's got one. Tom calls this “the bad bed”. It's called Derek.
> Salt | survival 12 | You've only a pinch; you show it to him. Derek reconsiders. {skip, xp 50} // It's sugar.
win: You bring Tom a bucket of Derek. He's got a use for it.
-- trial maze2 @garden:.5 | The Hedge Maze | 4 before 3
say: It moves when you're not looking. And it moves when you are, out of pride.
try: survival 12 Left hand on the hedge
try: perception 12 Listen for bees
try: athletics 12 Through
try: persuasion 12 Compliment it
try: acrobatics 12 Over
win: In the middle there's a sundial; a bench; a plum tree with one plum. You don't touch it. {+plumtree, xp 80}
lose: In the middle there's a minotaur. He's lost as well. He cries on you. {hurt 2d6 bludgeoning one, +plumtree}
-- fight dragon2 @garden:cave~.68 | The Compost | green_wyrmling, violet_fungus* | hard
say: “I'm a *salamander*,” says the thing in the compost, which isn't. “The gentleman said so. I've got papers.” There's a corner of parchment in its claws; legs are waving out at the side.
> Play chess for it | investigation 13 | It learned from Tom. It gives itself away by breathing. {skip, +page2, xp 100} // Mate in four. It eats your bishop, and then leans across for yours.
win: Page two. It's a bit chewed. {+page2}
-- scene shed2 @garden:study~.8 | The Shed
say: Tom's shed: pots; twine; a deckchair; a picture, turned to the wall. There's a pointed hat, with runner beans in it.
> Turn the picture round | | It's a portrait of Ptolemy Quill, in all of his robes, at his desk; he's got the same ears. In his hand's a list. At the top of it, underlined, *Tuesday: lunch, A.C.* It's got a line through it: *presently*. {+tom_is_quill, xp 120}
> Put it back as it was, and say nothing | | There's a hand on the door. It's Tom; he's seen. “I'm just so *tired* of presently,” he says. He doesn't say any more. You get the plum jam. {+tom_is_quill, +tom_trust, inspire all, xp 120}
> Look at the appointments book | investigation 13 | It's full, every line, to the very end of the century. They've all been ticked; but in another hand, just like it. Neater. {+understudy1, xp 100} // It's all “presently”.
-- boss wasps2 @garden:last [page2 or tom_is_quill] | The Walled Garden | The Collector of Specimens = mage!, spider*, animated_armor | hard
say: “There you are,” says a voice like Tom's, with all the gravel sifted out. A man in robes is at the gate; he's got the ears; he's holding a specimen jar. He's *slightly* see-through. “I'm so sorry. I have you down for a quarter past. Could you be dead by then?”
win: He folds up, like a letter. He was one of several. In his place there's a card. *P. QUILL. THE REAL ONE.* It's been underlined so hard that it's torn. {+understudy1, magic, gold 40, done}
end: Page two: “*The ninth floor is to go to the person who makes me come down from it.*” Tom reads it over your shoulder with his lips moving. “I was ever so clever,” says Tom, “wasn't I?” and goes in to see about the beans. {+ch2, open weather, xp 110}

== Seventh Floor: Keep Shut | 5 | weather
read: The weather's kept in rooms: Drizzle, Gale, Heat (Unbearable), Heat (Bearable), and a long gallery of assorted Skies. Somebody's propped all the doors open with a boot. They've begun to *mix*.
goal: Shut the doors of the Seventh Floor, and get the third page back from the wind.
dm: Elementals are unhappy staff. Nimbus, a small cloud, befriends. The page is inside a storm.
-- npc nimbus @weather:start | Nimbus | a small cloud | commoner/air_elemental
look: is about the size of a sofa, and raining on itself
hi: I'm not *crying*. It's condensation.
? The doors (open, who): A man with no shadow. He said that it was an *appointment*. He wanted a storm, to go. He didn't say please.
? The storm (page, wind): That's Aunt Cumula. She's got a bit of paper in her eye. It's made her ever so cross.
? Come with us (help, rain): Can I? Can I be *indoors?* I'll be so light.
! You're a very good cloud (persuasion 11): There's a rainbow. It's brief; it's embarrassed. {+nimbus, inspire all, xp 60} // It pours.
-- npc warden @weather:guard~.2 | Old Frostwick | barometer | commoner/h:wizard:rock_gnome:m
look: has a glass tube for a spine, and taps himself
hi: Falling. *Falling*.
? The rooms (shut, order): Gale first, it's nearest. Then Hail. Never, *never* open Heat with Hail. I was taller.
? The Understudy (shadow, man): Him? He comes on Thursdays to be rained on. He's read that it makes one melancholy. He times it.
-- fight gale3 @weather:.22 | Gale | air = air_elemental, harpy | hard
say: It's got your hat before you've got the door open.
> Give it something better to blow | performance 13 | Somebody has a whistle; somebody's got a bottle. It's never been *music* before. It shuts the door behind itself so as to practise. {skip, xp 100} // It takes the bottle.
win: The door shuts. You find your hat in Drizzle. {+gale, xp 40}
-- trial mix3 @weather:.38 | Hail With Heat | 5 before 3
say: He told you. He *told* you.
try: athletics 13 Shoulder to Hail
try: athletics 13 Shoulder to Heat
try: survival 13 Wet blankets
try: acrobatics 13 Between the stones
try: arcana 13 The latch-word
try: persuasion 13 Talk Fog round
win: Click; click. There's a pink sort of light. It smells like a school holiday. {+mix, xp 150}
lose: Thunder isn't on the list. You've invented it. {hurt 4d6 lightning all dex 13, +mix}
-- scene skies3 @weather:hall~.5 many | The Gallery of Skies
say: Forty framed skies, and you can put your arm through.
> Look in the one marked OURS | perception 13 | It's your own sky, from above; there's the tower. From here you can see the ninth floor perfectly well: there's a man in the window, at a desk, writing, and writing. He has no shadow. {+seen9, xp 80} // It's overcast.
> Take a pocketful of Morning | sleight 12 | It's warm all the way down to the knee. {+morning, inspire all, xp 60} // You've got Half Past Four in November.
> Straighten one | | You put it level. Somewhere a whole country stops feeling that there's something wrong. {xp 30}
-- fight frost3 @weather:.62 | Hard Frost | white_wyrmling, winter = polar_bear, ice = water_elemental | hard
say: It's been let out of the cold store; and so's what was in there with it.
win: You put them back on the shelf in order of size.
-- puzzle cumula @weather:shrine~.78 | The Eye
say: It's quite still in here. Round you there's a wall of wind a mile high, with a sort of face. “*I'VE A THING IN MY EYE*,” says Aunt Cumula, “*AND I'LL BLOW TILL IT'S OUT. WHAT COMES DOWN BUT NEVER GOES UP, AND I'VE NOT GOT ANY, AND IT'D DO ME SO MUCH GOOD?*”
answer: rain|tears|a tear|a good cry
hint nature 12: It's the obvious one. She's a storm.
hint insight 12: She won't. She's holding it in. It's a family thing.
wrong: You're picked up and put down. {hurt 3d6 bludgeoning one}
win: Nimbus shows her how. It's a wonderful cry; it lasts an hour, it washes out the page. “*BETTER*,” says Aunt Cumula, and blows her nose on a county. {+page3, xp 180, inspire all}
lose: You climb up, and take it out with the corner of a hanky. She's *extremely* brave. {+page3, hurt 2d6 lightning one}
-- boss thunder3 @weather:last [page3] | The Ten O'Clock | Understudy in Oilskins = mage!, air = air_elemental, harpy* | deadly
say: “I ordered a *storm*,” says the man with the ears. He's in oilskins. He's brought a notebook. “I'm to be tragic on the ninth at ten. *He* never had to book.”
> Ask him what he's tragic about | insight 14 | The pencil stops. “I'm not certain,” he says. “I've the *posture*.” He looks, for an instant, dreadfully like somebody at a party who doesn't know anyone. {inspire all, +posture, xp 120} // “*Everything*,” he says, with a gesture. He's practised it.
win: He rains out. In the notebook, over and over: *Today I felt* — and then nothing. {+notebook3, magic, gold 60, done}
end: Page three: “*Nobody's to be blamed for the Understudy. I told it: keep them happy till I'm back. I didn't say when.*” Nimbus reads it. It goes off by itself for a bit, over the umbrella-stand. {+ch3, open lost, xp 140}

== Second Floor: Lost Property | 6 | lost
read: Everything that was ever lost comes here in the end. You're given a ticket. Ahead of you in the line there's a dog, the better half of a treaty, and a thing with tentacles that's holding somebody's innocence, rather carefully, by the edges.
goal: Find the page that the archmage lost on purpose.
dm: Each hero may find something they lost (roleplay). Kleptomaniac goblin clerks. Lost causes army. The Minotaur librarian.
-- npc gimble @lost:start | Mr. Gimble | clerk | goblin/goblin
look: has four pairs of spectacles, none his
hi: Describe it. No, don't point. *Describe* it.
? A page (will, legs): On Purpose, aisle nine. It's a restricted section. People get *so* upset.
? Things of ours (lost, mine): We never give 'em back without a form. Ooh, there's one of you's got a big one. I'm not to say.
? The floors (moved): We didn't lose it! We've still got the third. It's in Gardens, Various.
-- scene own4 @lost:.15 many | Yours
say: A pigeon-hole with your name on it.
> Take out what's in it | | It's quite small. You know it at once. You'd forgotten how it *smelled*. {inspire all, +own, xp 60}
> Leave it there | | You look. You shut the little door. There's some things that are better lost; though you feel for it, now and then, all day. {xp 60}
> Read the label | investigation 11 | *Handed in by P.Q.* They've all got that on. It was he who went round picking them up. {+pq_kind, xp 80} // It's in Goblin.
-- fight causes4 @lost:.28 | Lost Causes | knight*, animated_armor | hard
say: Nineteen gallant gentlemen, with eleven flags. They've not been told. They'd be so pleased to fight somebody.
> Lose to them | performance 13 | You put up a good show, and surrender. They're beside themselves. They've *never*. They let you keep your swords. {skip, inspire all, xp 120} // You've accidentally won.
win: They take it so well. They've had the practice.
-- trial marbles4 @lost:.42 | Marbles | 4 before 3
say: A room with a floor of marbles. Forty generations' worth. Through the middle, on tiptoe, very upset, is the person who's come to look for his.
try: acrobatics 13 Skate
try: athletics 13 Wade
try: sleight 13 Roll him his
try: insight 13 Know a marble when you see one
win: He's got them. He shakes hands all round. He was the Prime Minister. {xp 120, gold 50}
lose: You go the length of the room on your back. {hurt 3d6 bludgeoning all dex 13}
-- fight gloves4 @lost:.55 | Single Gloves | flying_sword*, spider = roper | hard
say: Forty thousand, all left hands. They've been looking for somebody to hold.
win: You shake the last of them off. It waves.
-- puzzle nine4 @lost:library~.7 | Aisle Nine: On Purpose
say: A grille; and a lady minotaur in half-moon glasses, knitting. “*I'm lost by the young and I'm found by the old. I am given, not lent. I'm asked for by everyone and he'd got none to spare; so he lost it, on purpose, and that's why I'm here.*”
answer: time|patience|youth
hint insight 11: The knocker wanted the same thing.
hint history 12: She's knitting a sort of a clock.
wrong: “*Shh*,” she says. It takes off your eyebrows. {hurt 2d6 thunder one con 12}
win: “He left it with me in a jar,” says the minotaur. She gives you the page; and the jar. It's got about an hour in it. “Tell him I've never *touched* it.” {+page4, +hour_jar, xp 180}
lose: She sighs and lets you sign for it. {+page4}
-- scene basil4 @lost:.82 | Lord Basil Loses His Way
say: He's down a side aisle, sitting on a crate labelled DIGNITY (ASSORTED). He's been here for three days. His guards have been claimed.
> Help him look | investigation 12 | You find it. It's his own: a small one, from when he was nine; it's a medal for swimming. He pins it on. You'd hardly know him. {+basil_better, inspire, xp 100} // It's not in there. But somebody's looked.
> Take him along | | “I don't know what I'm for,” says Lord Basil. You say that you'll need somebody to carry Fipps. {+basil_joined, xp 60}
> Claim him | persuasion 12 | You fill in the form. *Finder's relation to item:* you put *friend*. He reads it over your shoulder, and is no use for some time. {+basil_better, +basil_joined, xp 100} // Gimble wants to see a receipt.
-- boss hoarder4 @lost:last [page4] | The Thing in Marbles | The Hoarder = otyugh!, mimic*, rust_monster | deadly
say: Something's been living behind *Miscellaneous* since before the shelves. It has eaten a great deal that nobody asked for. It's holding on to a door. It's the door to the stair; and it's lost its *number*.
win: It coughs up a brass 5. You screw it to the door. The door looks happier.  {+five, magic, gold 90, done}
end: Page four's very short. “*Dear Adelina. I've lost the knack of it. Don't wait lunch.*” It's never been sent. Mistress Crump, when you give it to her, puts up her parasol, though you're indoors. {+ch4, +letter_ac, open exam, xp 160}

== Fifth Floor: Silence | 7 | exam
read: There were forty apprentices. Nobody had told them that it was over. They're at their desks, in rows, in a hall with a clock that has stopped; they've been sitting the same paper for eleven years. The invigilator has no shadow. “*You may turn over,*” he says to you, “*now*.”
goal: Get the apprentices through their examination.
dm: The Understudy invigilates because he was told to keep them busy. Exam scenes. Some have died at their desks. The fifth page is the exam's final question.
-- npc wick @exam:start | Wick | apprentice, candidate 17 | commoner/h:wizard:lightfoot:m
look: has a beard that he didn't have when he sat down
hi: Psst. What's the date? No. Don't. What's the *year?*
? The paper (exam, question): There's one question. Forty marks. “*What is magic for? Show your working.*” I'm on my third volume.
? The others (forty, apprentices): Thirty-one. Some of 'em finished, sort of. They're still at it. You can hear the nibs when it's quiet; it's *always* quiet.
? The invigilator (shadow): He says that the Master'll mark it presently.
! Put your pen down (persuasion 13): He looks at it. He's got a callus as big as an egg. “*Am I allowed?*” says Wick. {+wick, add pens 1, xp 100} // “I've nearly *got* it.”
-- scene sit5 @exam:dining~.12 | Candidate 41
say: There's a desk with your name on it. There's a pen; and the paper. It would be so easy.
> Write one line, and hand it in | insight 14 | You don't say what you've put. The pen comes up out of your fingers and bows. {+handed_in, inspire all, add pens 1, xp 120} // You look up. It's dark. You've filled nine sheets and you can't read any of it. {time 240, hurt 2d6 psychic one}
> Fold it into a dart | sleight 12 | It goes the length of the hall. Thirty-one heads come up. It's the first thing that has *moved*. {add pens 2, inspire all, xp 100} // It hits the clock.
> Eat it | | It tastes of Thursday. There's nothing in the rules. {add pens 1, xp 60}
-- fight finished5 @exam:.25 | Those Who Finished | skeleton*, specter | hard
say: Nine of them, in gowns, dry as quills. They raise their hands for more paper.
> Give them a pass | religion 13 | You write it on the board: ALL: DISTINCTION. They put down their pens, lining them up, quite square. They shake one another by the hand. {skip, add pens 1, inspire all, xp 120} // You've spelled it with one S.
win: You close their books.
-- trial viva5 @exam:hall~.4 | The Viva | 5 before 3
say: Five professors in five frames. They ask all together; they do not wait.
try: arcana 14 The theory
try: history 14 The precedents
try: religion 13 The ethics
try: performance 13 The bluff
try: insight 14 The question behind the question
try: deception 13 The footnote
win: The portraits confer. “*It's not the worst that we've heard*,” says the eldest; and dies, in paint, of satisfaction. {add pens 1, xp 200}
lose: You are asked to leave, by way of the window. {hurt 4d6 bludgeoning all dex 14}
-- puzzle clock5 @exam:alchemy~.55 | The Stopped Clock
say: The hands are at five to. There's a slot, as for a jar. It's engraved. “*I was stopped so that they'd never fail. Say what they lost by it, the whole thirty-one; or put some in.*”
answer: time|their time|youth|eleven years|their youth|life
hint investigation 12: The slot's about the size of the jar that you were given.
hint insight 12: He was being *kind*. It's the worst of him.
wrong: It goes back a minute. So do you; you have to have it over again. {hurt 2d8 psychic one wis 14}
win: Tick. {+clock5, add pens 2, xp 200, inspire all}
lose: You get the back off, and push. Tick. It'll want seeing to. {+clock5, add pens 1}
-- fight gowns5 @exam:.7 | The Proctors | animated_armor*, gargoyle, wraith | deadly
say: Empty gowns, mortar-boards, canes. There's *talking*.
win: You hang them up.
-- scene dorm5 @exam:bedroom~.82 | The Dormitory
say: Forty beds, made. On each pillow there's a letter from home; it's the top one of a pile.
> Take them their letters | | Row by row. You put each pile down on the desk, next to the ink. You can hear the nibs stopping. {add pens 2, inspire all, xp 150}
> Write back for the nine | | There's nothing to say; you say it nine times. {xp 100, inspire}
-- boss invig5 @exam:last [pens>=3 or clock5] | Pens Down | The Invigilator = mage!, gargoyle*, wraith | deadly
say: “Nobody may leave,” says the man with the ears, “until it has been *marked*.” He's got thirty-one essays under each arm. He's been reading them. There're notes all down the margins: *is this so? — how do you know? — what does it feel like?* “He said that he would come. I've kept them so *quiet*.”
> Mark it yourself | persuasion 14 | You take the top one. You read the last line: it's very good. You write *Yes* at the bottom, and give it to him. He looks at it. “Is that all it—?” says the Understudy. {inspire all, +marked, xp 200} // “You're not *qualified*,” he says.
> Ask him for his own answer | insight 15 | What's magic for? He opens his mouth. You watch him go right to the bottom of himself, and there's nothing there but other people's appointments. “*I don't know*,” he says. “I've only ever done it.” {inspire all, +asked5, xp 200} // “*Silence*,” he says.
win: Thirty-one people stand up. Somebody throws a mortar-board. It's the wrong sort of ceiling; it sticks.  {+exam_over, magic, gold 100, done}
end: On the last blank page there's one line in a round gardener's hand: page five. “*What's magic for? I had it on the tip of my tongue. I think that it was for showing somebody.*” {+ch5, open lease, xp 190}

== Eighth Floor: No Hawkers | 8 | lease
read: The eighth's been let. It was let by the archmage, on a Friday, when he was short, to a gentleman who gave excellent references; they were all dead. Two hundred years' rent is owing. He'd be *delighted* to pay it. It's just that it's in souls, and the landlord's never in.
goal: Evict Mr. Mephit-Jones, or settle the rent.
dm: A devil who loves contracts. The lease says the landlord must ask in person. He holds page six as security. The Understudy has been signing extensions with a soul it doesn't have.
-- npc jones @lease:hall~.15 | Mr. Augustus Mephit-Jones | tenant | commoner/h:warlock:tiefling:m
look: has horns, a smoking-jacket and a genuine interest in your health
hi: *Do* come in. Wipe your hooves. My little joke. Sherry?
? The rent (souls, owing): I've it ready. In the scullery. Two hundred years at one a month: they're very quiet. I've never liked to *spend* them. The landlord keeps sending such a nice young man to say *presently*.
? The lease (contract, evict): Ninety-nine pages. The break clause is on the ninety-ninth: “*the Landlord to ask the Tenant, in person, nicely*.” I thought that it was a joke. It's held up in three courts.
? The young man (understudy, signed): He signs with such *conviction*. But the ink won't bind. It says “the undersigned's immortal soul”, and it just sits there, like a cheque on no bank. I've never had the heart to tell him.
! You don't want to go (insight 14): He swirls the sherry. “It's the *view*,” says Mr. Mephit-Jones. “One sees all the weathers. At home there's only the one.” {+jones_view, xp 120} // “Is it warm in here?” he says.
-- npc maid8 @lease:kitchen~.28 | Ember | maid of all work | imp/imp
look: is an imp, in a cap
hi: He don't mean no harm. I mean, he *do*. He's in the profession.
? The scullery (souls): Two thousand four hundred. In jam jars. I dusts 'em. Mrs. Pargeter's a love.
? Page six (will, security): In the safe. It bit him. He was that pleased.
-- fight hounds6 @lease:.22 | Followers | hell_hound*, imp | hard
say: The area steps, and a number of gentlemen callers, with teeth.
> “Mr. Jones is not at home” | deception 13 | You do it in Havisham's voice. They leave cards. They're still hot. {skip, xp 120} // “We can smell 'im,” they say. They can smell you, too.
win: There's a smell of singed visiting-card.
-- trial dinner6 @lease:.38 | Dinner for Eleven | 4 before 3
say: The tenant gives a dinner. All of the other guests are devils; the conversation's *contract*. Every polite remark is an offer. You mustn't accept, you mustn't be rude, and you must on no account ask for the salt.
try: deception 14 Say nothing, charmingly
try: insight 14 See the hook
try: history 14 Cite a precedent
try: persuasion 14 Counter-offer
try: performance 13 Faint
win: By the savoury you own a small lake of fire. You give it to Ember. {+lake, xp 220}
lose: You asked for the salt. {hurt 5d6 fire one dex 14}
-- scene jars6 @lease:storage~.5 many | The Scullery
say: Jam jars, floor to ceiling, with gingham tops. Every one has a light in it, about as bright as a match.
> Open Mrs. Pargeter | | “*About time*,” says Mrs. Pargeter. She goes up through the ceiling like a homing pigeon. The rest all crowd to the glass. {+pargeter, inspire, xp 80}
> Count them | investigation 12 | Two thousand, four hundred; and one more: empty, with a label. RESERVED: P.Q. (UNDERSTUDY). He's left it on the shelf, on purpose, where it'd get the sun. {+reserved, xp 120} // You lose your place at *raspberry*.
> Ask Ember to look away | persuasion 13 | She looks away for as long as it takes. It's a good twenty minutes. It's like being inside a firework. {+jars_free, inspire all, xp 250} // “I'd lose me *place*,” says Ember.
-- puzzle safe6 @lease:study~.65 | The Safe
say: It has a dial with letters; and an engraved card. “*I'm signed but I'm not a sign. I'm broken and never mended. I run for years and I haven't a leg. One of us wrote me, and one of us meant it.*”
answer: lease|a lease|contract|a contract|promise|the lease
hint history 12: It's on every page that he's shown you.
hint insight 12: The last line's about Quill; he never meant a word of it, he only wanted the fellow out of the hall.
wrong: The safe *sues*. {hurt 3d6 psychic one int 14}
win: Page six, in a muzzle. And the counterfoil to the lease, with the signature: not *Ptolemy* at all. It's signed *Tom*. {+page6, +signedtom, xp 220}
lose: You blow it. “*I say*,” calls Mr. Mephit-Jones. {+page6}
-- fight bailiffs6 @lease:.78 | Counsel for the Tenant | bearded_devil*, chain_devil | deadly
say: Three learned friends, barbed. They'd like to put it to you.
win: They rest their case.
-- scene ask6 @lease:throne~.86 [signedtom or tom_is_quill] | In Person, Nicely
say: The clause says the landlord. You know where the landlord is: he's two floors down, in July now, with a hat full of beans.
> Go and fetch Tom | persuasion 14 | He doesn't want to. He comes. He stands on the mat, turning his hat. “Mr. Jones,” says Tom, “I'm ever so sorry that I've been out. Would you mind very much—?” “My dear fellow,” says the devil; he's got something in his eye; “you'd only to *ask*.” {+evicted, +tom_out, inspire all, xp 300} // “I can't,” says Tom. “If I go up, I'm *him*.” You go back alone.
> Ask him to stay, and pay in views | insight 14 [jones_view] | A new lease: one page. The rent is to be *company on Thursdays*. You've never seen a devil look at a contract as if it might be a trick on him. {+newlease, xp 250} // “One couldn't,” he says; “the *rates*.”
> Go on up without it | | You leave your card.
-- boss solicitor6 @lease:last [page6] | The Reversion | Baalphegor of Head Office = chain_devil!, bearded_devil*, hell_hound | deadly
say: “Head Office,” says Mr. Mephit-Jones, going pale pink. It's come up through the floor: a devil with no smoking-jacket at all. “*Two hundred years*,” it says, “*and he's DUSTED them*.”
> Stand with your tenant | intimidation 14 | “*He's got a lease*,” you say. Mr. Mephit-Jones looks at you; and takes off the jacket, and folds it, and turns out to be a good deal larger than you had thought. {inspire all, +jones_ally, xp 200} // “*Then I'll have you as well*,” says Head Office, reasonably.
win: It goes down with a noise like a stamp on a form: VOID. {+headoffice, magic, gold 150, done}
end: Page six. “*If I'm ever found, tell the young man upstairs that he can stop. I'd have told him myself; but I was afraid that he would ask me what to do instead.*” {+ch6, open ninth, xp 220}

== The Ninth Floor | 8 | ninth
read: It isn't there; and then, when you've stopped looking, there's a stair. Everyone you've met's on it, waiting to see who's going first. At the top there's a plain door, slightly ajar, and, inside, a pen going. It's dotting every *i*.
goal: Reach the study, and decide who was Ptolemy Quill.
dm: Understudy's despair has remade the ninth as a perfect copy of Quill's life. Final choice: destroy him, give him a name, give him the tower, bring Tom. Plum.
-- npc crump7 @ninth:start | Mistress Adelina Crump | executor | commoner/h:wizard:human:f
look: has left the parasol at the bottom
hi: I'm serving it in person. I've the stamp.
? Tom (third, quill) [tom_is_quill]: I know. Of *course* I know. I saw the ears in June. I've been charging him for it.
? The plum (tree) [plumtree]: It's ripe on Tuesday. It's always Tuesday. I've never gone *down*. He might've asked me to lunch, and then I should've had to say yes.
! Go down (persuasion 13) [tom_is_quill]: “I'm *working*,” says Mistress Crump. Then she takes off her hat. She looks at it. “It *is* Tuesday,” she says. She goes. {+crump_gone, inspire all, xp 200} // “Presently,” says Mistress Crump; and hears herself.
-- fight copy7 @ninth:.12 | Perfect Copies | animated_armor*, flying_sword | hard
say: The hall, exactly as it was; the umbrella-stand; a Havisham with all his parts matching. Nothing has a shadow.
win: You look behind you. It's putting itself back.
-- trial stairs7 @ninth:.25 | A Day in the Life | 5 before 3
say: Every room's an appointment: eight o'clock, Envoy; nine, Prince, cursed; ten, tragic (storm). You're in it. You've got lines.
try: performance 14 Give them the speech
try: insight 14 Play it as *him*
try: acrobatics 14 Exit, pursued
try: arcana 14 The trick with the smoke
try: history 14 Know your cue
try: persuasion 14 Ad lib
win: The scenery claps. You come out in the wings, with somebody's moustache. {+played, xp 250}
lose: You dry. The boards open. {hurt 5d6 bludgeoning all dex 14}
-- scene mirror7 @ninth:bedroom~.38 | His Room
say: A narrow bed, never slept in. A washstand; a mirror, with a cloth over. A diary, and a pencil on a string. *Today I felt* —
> Write something in it | | You write what *you* felt. All of you take a turn. When you've done the last page is full; and there's a smell, quite faint, of somebody having been alive in here. {+diary, inspire all, xp 200}
> Uncover the mirror | insight 14 | He's not in it. He's scratched where he would be, with a pin: quite a good likeness. He's given himself a *smile*. {+likeness, xp 150} // It's you. You look tired.
> Leave him the jar of light [reserved] | | You put the empty jar on the sill, where it'll get the sun. {+jar_given, xp 100}
-- fight elems7 @ninth:.52 | The Ten O'Clock, Again | air = air_elemental, fire = fire_elemental, water = water_elemental | deadly
say: He couldn't get the storm; he's sent for the ingredients.
> Send up Nimbus [nimbus] | | “*Hello*,” says Nimbus. “I'm a cloud.” They've never been introduced. There's quite soon a very mild sort of a spring afternoon. {skip, inspire all, xp 250}
win: It clears from the west.
-- puzzle study7 @ninth:library~.66 | The Study Door
say: On it there's a card, in that neat hand, the last. “*I look like him, and I sound like him. I have kept every promise he made, and not one was mine. If you know what I want you may come in.*”
answer: a name|name|to be asked|thanks|to be real|to stop|a shadow|his own name|my own name
hint insight 13: Every card has got *P. Quill* on it. Nobody's ever given him one of his own.
hint persuasion 13: “Tell the young man that he can stop.”
wrong: The pen on the far side stops: for a moment. Goes on. {hurt 4d6 psychic one wis 15}
win: The pen stops. “*Come in*,” says somebody who isn't putting on a voice. {+admitted, xp 300}
lose: You push. It wasn't locked.
-- fight will7 @ninth:.8 | The Will, Cornered | mimic, flying_sword*, animated_armor | deadly
say: It's the last page. It's the size of a pony. It doesn't *want* to be read; when it's read it's over.
> Promise to read it slowly | persuasion 14 | It comes and lies down on your feet. {skip, +page7, inspire all, xp 200} // It barks. It does bark.
win: It gives in. It's only a sheet of paper, with legs. It's shaking. {+page7, note lastpage}
-- boss understudy @ninth:throne~last | The Understudy | The Understudy = archmage!, animated_armor*, air = air_elemental | deadly
say: He's at the desk. There are two hundred years of letters, answered, in stacks; he has one sheet left. “I'm *so* nearly up to date,” says the Understudy. “If you would only not be here. If there's no one who can say that I'm not him, then I *am*. It's quite simple. I've drawn a diagram.” All of his shadow that there isn't gets up on the wall.
> Give him a name [admitted or diary] | persuasion 14 | You'd talked it over on the stair. You tell him. It's not a grand one. He tries it, under his breath; he tries it with his own mouth. He looks down; and on the floor, leading away from his feet, pale as tea, there's a *shadow*. {+named, skip} // “I don't want *another* one,” he whispers. “I want that one to have been mine.”
> Bring Tom up [tom_out or tom_moved or tom_trust] | | Tom comes in with his hat in his hands. They've the same ears. “You've done it ever so *well*,” says Tom. “Better than me. I'm sorry I didn't come back. You can stop, now.” The pen rolls off the desk. “What do I do *instead?*” says the Understudy. Tom thinks. “D'you like beans?” he says. {+stopped, skip}
> Mark his diagram | investigation 14 | It's beautiful work. There's one mistake. You show him: *here*, where it says “no one would know”. “*You* would,” you say. He's been trying for two hundred years not to see that. {inspire all, +flaw7, hurt 1d4 psychic one, xp 200} // He's very good at diagrams.
win: There's a great rustle, and two hundred years of letters settle, like snow, to the floor. {+study_won, done}
end: And the tower, from the cellar to the roof, draws a breath; and there's a long, rumbling, comfortable sound, as if somebody were putting all the chairs back. One. Two. Three. {xp 320}
ending [stopped or named]: Presently | The brass plate says QUILL & QUILL: GARDENS. On Tuesdays there's lunch, under the plum tree. Mistress Crump's brought her own chair; she has sent in her final account, and it's for a plum. The young one's no hand at beans. But he's started a diary, and the first line runs to eleven pages; his shadow comes out quite dark when it's sunny. Nimbus does the watering.
ending [crump_gone]: It Was Tuesday | The tower went to Fipps, in the end, who only came for the sandwiches; he's kept on everybody. There's nobody at the desk on the ninth. The letters come, and pile up; they're about all the usual things. “Presently,” says Fipps, and goes down to see if there's jam. There are two chairs under the tree.
ending: The Estate of P. Quill, Deceased | It was served; it was stamped. All nine floors are in numerical order. Sometimes, on the ninth, at ten, there's a little dry click like a pen being put down, and everybody on the stairs stops for a moment, and then goes on up.
note lastpage = The Last Page: “I leave the whole tower to anyone who has been all the way up it and was kind. It is not mine to leave; it belongs to itself. But it likes to be asked.”
`;export{e as default};