var e=`id: sarrakesh
title: Sand Over Sarrakesh
code: R6
levels: 4-10
tags: desert, water, patient kings
tone: mystery
ink: #5a2a12 #e8a33d
pitch: The wells are failing one by one, in an order. Somebody buried is counting down.
about: Nine wells keep the city of Sarrakesh alive, and nine kings lie under the sand, each of whom dug one. This year the first well went dry. Then the second. The water-priests have worked out what happens after the ninth, and have started to pack.
about: Sand Over Sarrakesh is a desert campaign of tombs, water and bargains. The dead here are reasonable. They only want what they are owed, and they have had a long time to work out the sum.
villain: Nemtep the Ninth | mummy | wants his name put back | was erased for opening the granaries
patron: Ziza Om-Harran | Mistress of Wells, who has eleven days of water
secret: The ninth king was struck from the walls because he broke the royal granaries open in a famine. The other eight had him walled up alive. He is not cursing the city. He is turning off the taps until somebody asks his name.
place city = Sarrakesh | village size=3 seed=sarrakesh-5 biome=desert time=10 open=yes | A city the colour of bread, folded round nine wells. At three of them women are sitting with empty jars, not going home, in case.
place well = The Third Well | dungeon size=2 seed=thirdwell-7 theme=desert caves=.3 fams=desert+vermin pop=.45 | You go down by the bucket. Eighty feet below there's a stone door that has been under water for a thousand years and isn't any more.
place waste = The Salt Waste | wilds size=3 seed=saltwaste-2b biome=desert theme=desert time=13 fams=desert+gnoll+bandit pop=.45 | White to the edge of the world, with a line across it that might be a road or might be a decision.
place tomb1 = The Tomb of the Measurer | dungeon size=2 seed=measurer-4 theme=desert levels=2 caves=.05 fams=undead+desert+construct pop=.45 | The second king measured the river. It has moved since. The tomb still has the old river painted on the floor, to scale, and takes it personally if you step in it.
place camp = The Caravanserai of Bitter Water | castle size=1 seed=bitter-3 biome=desert style=sandstone roofs=battlement moat=no time=19 fams=bandit+knight pop=.18 | Forty walls and no roof, at the only spring that no king dug. Everybody who hates everybody stops here, and hands in his knives at the door.
place quarry = The Namecutters' Quarry | dungeon size=3 seed=quarry-8 theme=desert caves=.4 fams=construct+elemental+desert pop=.5 | They cut the kings' names here, forty feet high; and in the eighth reign they were set to cutting one out again.
place court = The Court of the Eight | dungeon size=3 seed=eightcourt-6 theme=desert levels=2 caves=.05 fams=undead+construct pop=.5 | Eight thrones and a gap. The lamps light themselves. Eight voices, dry as seeds, are saying at the same time that you may approach.
place ninth = The Ninth King's House | dungeon size=3 seed=ninth-11 theme=desert levels=2 caves=.15 fams=undead+elemental+desert pop=.5 | It isn't a tomb; it's a granary. The door was bricked up from the outside, by somebody in a hurry, with his own fingers still in the mortar.

== Eleven Days | 4 | city
read: Ziza Om-Harran receives you at the dry lip of the Third Well, in the full sun, because it's honest. She gives you each a cup. You can see what it costs. “Drink,” she says. “I'd rather you were useful.”

Four wells are left, she says, since this morning; there were five when you sat down.
goal: Go down the Third Well and learn what stopped it.
dm: The wells each have a tap-stone marked with a king's cartouche. A ninth cartouche has been chiselled off. Introduce the Water-Priests (cowardly), the thief-prince Kadro, the namecutter's widow.
-- npc ziza @city:start stays | Ziza Om-Harran | Mistress of Wells | priest/h:cleric:human:f
look: has a knotted cord at her belt, and unties a knot whenever a cart goes by
hi: I am the plumber. They give me a gold hat for feast days, but I'm the plumber.
? The wells (order, dry): Third, sixth, first, second, eighth. It's not the deep ones first, or the shallow. I've tried everything. It isn't geology. It's somebody's *opinion*.
? The water (days, left): Eleven, if nobody washes. Seven, if they panic. The priests are panicking at eight. {+eleven}
? The kings (dead, nine): Nine dug them. The song has nine verses; only you'll find that everyone mumbles the last. I always thought that I'd just never learned it. {+mumble, xp 20}
! What do you want us to say to them (insight 13): “To the *city?* Say eleven. I have been saying eleven,” says Ziza, “since it was fourteen. It keeps better than the truth.” She shows you the cord. It has eight knots. {+eight_days, xp 50} // “Say that it's in hand.”
-- npc kadro @city:tavern stays | Kadro the Open Hand | thief-prince | spy/h:rogue:half_elf:m
look: is selling water by the thimble, at a loss
shop: general
hi: You're looking at me like the guard. I bought this for a fortune, and I'm giving it away. Ask me why. No. Don't.
? Why (loss, water): Because if they die who'll I rob?
? The tombs (robbing, way): I've been in three. Never again. They're so *polite*. One of 'em asked me to sit. I sat. I was there nine hours. He wanted to know what bread cost.
? The ninth (king, name): Blank. Every wall. Somebody's gone over the lot with a chisel. I've got one bit with a foot on it. I could be persuaded. {job foot}
-- npc sefu @city:smithy | Sefu | last of the namecutters | commoner/merchant
look: has hands like roots, and a blank slab he has been polishing for forty years
shop: smith
hi: Mind the slab. It's a commission.
? The slab (blank, whose): My great-great's great. A man paid him to keep a stone ready. “For when they ask.” He never said who. We've each of us kept it up.
? Cutting out a name (chisel, ninth): It's the one thing that we don't do. It's been done the once. The man who did it walked into the desert with his tools and didn't stop walking. You can still see the chisel-marks are *crying*. I don't mean wet. The angle.
? The quarry (where, cut): Three days. I could draw it. I'd sooner not have been asked. {+quarry_known}
-- scene queue1 @city:out:.15 many | The Queue
say: Nine hundred people with jars. It goes twice round the square. There's almost no noise at all.
> Carry for somebody | athletics 11 | She's eighty. She tells you, all the way, about her grandmother's grandmother, who ate king's bread in the bad year. “Which king?” you say. She mumbles. {+bread, xp 40} // You spill a mouthful. Nine hundred people look at the stain.
> Sing the well-song | performance 12 | They join in. Eight verses, one for each. At the ninth the whole square drops its voice, and hums, and looks at its feet. {+mumble, +song, xp 40} // They've heard it better.
> Ask what the priests are doing | perception 12 | “Packing,” says a small boy. “You can see the gold hats going out by the back.” {+packing, xp 30} // “Praying,” says everyone, and spits; dryly.
-- fight thugs1 @city:out:.35 | Water-Sellers | thug*, spy | medium
say: Four men are selling from a cart at a price that's written on a child's arm. There's a queue for that, too.
> Show them who's watching | intimidation 13 | You look round, slowly; so do they. It's nine hundred people. They leave the cart. {skip, add trust 1, xp 50} // They're armed, and it's only thirst.
win: You give it away by the cup. It's gone in nine minutes. {add trust 1}
-- scene door1 @well:start | The Door Under the Water
say: A cartouche as tall as you are: *Third, who dug*. Beneath it, a hand-hold, worn; and, beneath that, in fresh dust, a small, neat, polite inscription. It says: CLOSED.
> Knock | | After a moment, from inside, something knocks back. It does it in the rhythm of the well-song, as far as the eighth verse, and then stops. It's waiting. {+knocked, inspire, xp 40}
> Read the dust | investigation 12 | It was written from within. The finger had a ring on. It's this week's. {+ring_dust, xp 40} // Dust.
> Force it | athletics 13 | It grinds open. You feel rude. {xp 30} // It grinds open, on your foot. {hurt 1d6 bludgeoning one}
-- fight scarabs @well:.25 | The Bucket-Room | scorpion, centipede*, snake | medium
say: It had been cool and wet for a thousand years. Now it's only cool. Things have moved in.
win: Under the sand: a thousand years of dropped bracelets. {gold 60}
-- puzzle tap @well:shrine~.5 | The Tap-Stone
say: A granite wheel, and a bronze plate with the third king's joke on it: he was known for them. “I'm full of holes and yet I hold. I am let down, and rise again. I'm hanged, I'm drowned, I've never sinned. What am I, that you drank from?”
answer: bucket|a bucket|sponge|well bucket
hint history 12: It's a *well*. He dug it. He was proud of it.
hint investigation 11: There's a rope-groove in the plate. “Let down, and rise again.”
wrong: The wheel turns the wrong way a notch. Up above, faintly, a groan. {hurt 2d4 bludgeoning one}
win: The wheel opens, so that you can see behind it. The channel isn't blocked. There's a hand of stone, closed on it, politely. On the wrist: a cartouche with nothing in it. {+blankhand, xp 100}
lose: You break the plate. You can see the channel: and a hand of stone shut on it, with a blank seal at the wrist. {+blankhand}
-- fight guards1 @well:.7 | The Third King's Plumbers | mummy, skeleton* | hard
say: They rise from the settling-tanks with wrenches of bronze. They're not hostile; they only want to see your authorisation.
> Tell them you are from the Mistress of Wells | persuasion 13 | “*Still?*” says the foreman. “Is there still one?” He'd like, he says, to see the hat. {skip, xp 60} // You've no form.
win: The foreman's dying remark is about washers.
-- boss third @well:last | The Third King | Attendant of the Third = wight!, skeleton*, mummy | hard
say: He doesn't get up. The Third King's a small brown bundle on a gold chair, with very bright eyes. “I'm *so* sorry about the water,” he says. “It isn't me. It's the other fellow; we don't say his name. Do excuse my attendant. He thinks that you've come about the gold.”
> Ask him what bread costs now | | He laughs until his jaw comes off. He puts it back. “*Nobody* ever,” says the Third King. “Sit down. Amenet, put that axe away; they're *guests*.” {skip, +third_friend, xp 120, done}
win: “Oh, well *struck*,” says the king. “Amenet, lie down.” He leans forward. “We did him a wrong, you see. Eight of us. I held the lamp. He'll stop them all, one at a time, in the order that we voted.” {+voted, magic, done}
end: Nine kings, and eight who voted. He won't say the name; he *can't*, it was cut out of his mouth as well. But there's a Measurer, he says, who wrote everything down. “Second from the end. Mind the river.” Ziza unties another knot. Three wells. {+ch1, open waste, open tomb1, gold 50, xp 90}
job foot = Kadro's Foot | Look in the tombs for more of the broken relief. | flag relief | gold=60 xp=100

== The Measurer | 5 | tomb1
read: The Measurer lies two days out, across the Salt. Ziza can spare you a camel-load of water; she's weighed it. “If you find that you've some left,” she says, “bring it back.”
goal: Cross the Salt, and read the Measurer's book.
dm: Crossing (waste) then tomb. The Measurer's record: he abstained. Gnolls follow a lioness-priest; bandits of the priests try to steal the water.
-- trial salt @waste:out:.4 | The Crossing | 5 before 3
say: Nothing moves but you. Then you notice that something's moving.
try: survival 13 Walk by night
try: nature 13 Read the salt-crust
try: animal 12 Keep the camel's heart up
try: perception 13 Know mirage from water
try: athletics 12 Carry the camel's load
try: persuasion 12 Share it out, fairly, aloud
win: You come in with a skin and a half to spare. The camel has a name now. {+spare, xp 120}
lose: You come in with your tongues like shoes. {tired all, hurt 2d6 fire all con 12}
-- fight gnolls @waste:out:.6 | The Laughing Dead | gnoll*, gnoll | medium
say: They're lying in the road, a dozen, as if they'd died there; and one of them can't help it, and giggles.
> Laugh too | performance 13 | It's a real one. You're so tired. It sets them all off; they lie there howling, and slapping the salt; and by the time that they have stopped you're half a mile on. {skip, xp 70} // You've the wrong kind of laugh.
win: Round each neck a priest's gold seal. Somebody is paying in hats.  {+hats, gold 40}
-- scene bones @waste:out:.8 | The Man Who Kept Walking
say: A skeleton, upright, leaning on nothing, with a mallet in one hand. He's facing away from the city. In the other's a chisel, and his arm is drawn back to throw it.
> Take the chisel from him | sleight 12 | As it leaves his fingers he goes down like a tent. On the blade is a smear of blue, from a wall forty centuries old. {+chisel, xp 80} // He doesn't want to let it go. Then he does, gladly, at you. {hurt 1d8 piercing one, +chisel}
> Bury him | religion 12 | You put him facing home. {inspire, +namecutter_rests, xp 60} // It's salt. You do what you can.
-- npc scribe @tomb1:start | The Measurer's Scribe | long deceased | skeleton/skeleton
look: has a reed behind where his ear was
hi: Height? Weight? Purpose of visit?
? The Measurer (king, book): His majesty is in. His majesty's always in. His majesty is measuring how long.
? The river (floor): Do NOT step in the river.
? The book (names, vote): It's all in the book. He can't read it to you, he's no voice since the vote. He can show you. It's at the bottom. It's *very* accurate.
-- fight river @tomb1:.2 | Those Who Stepped in the River | water = water_elemental, crocodile* | hard
say: It's lapis, and gold wire; it's painted. It's wet.
> Cross by the painted bridge | acrobatics 13 | It's two inches wide. The painted fishermen look up as you go over. {skip, xp 80} // It's painted on.
win: There's a painted fish in your boot. It's still flapping.
-- puzzle weight @tomb1:library~.4 | The Nilometer
say: A column, graduated, and a sluice for sand. On it: “I am taller when I'm drunk up and shorter when I've drunk. I'm the one thing that grows as the well goes down. Pour me my measure.” There's a set of labelled jars.
answer: rope|the rope|well rope|thirst|queue|the queue
hint nature 12: What gets longer as the water gets lower?
hint insight 12: Ziza would answer this at once. She'd not be amused.
wrong: Sand. It's got very good aim. {hurt 2d6 bludgeoning one}
win: “*Correct*,” writes the column, in sand. “*Both answers accepted*.” {xp 120, +nilometer}
lose: The door opens anyhow, but it makes a note. {+nilometer}
-- scene relief2 @tomb1:hall~.55 many | The Broken Relief
say: Nine kings in a row, with their hands out. The ninth's been chiselled off, from the ankles up.
> Take a rubbing | investigation 12 | With charcoal you can bring up the ghost: a thin man. He's not holding a sceptre. He's holding a loaf. {+relief, +loaf, jobdone foot, xp 80} // It comes up as a smear. {+relief}
> Look at the others | perception 13 | Eight kings; and each has a hand over his mouth. But it's been added, later, and badly. {+mouths, xp 60} // Very regal.
> Lay the chisel in its marks [chisel] | | It fits. And the wall, under your hand, shudders; and gives you one letter, like a tooth coming out: *N*. {+letter1, inspire all, xp 100}
-- fight taps @tomb1:.75 | The Inaccurate | mummy*, skeleton | hard
say: Royal surveyors who once got a sum wrong. They've been allowed to go on checking it.
win: You've found the mistake. It's a nine, read as a blank.
-- boss measurer @tomb1:last | The Measurer | Keeper of the Rod = mummy!, mummy, skeleton* | deadly
say: The Second King's hand is walking by itself across a papyrus forty yards long. It writes: YOU'RE LATE. SIX HUNDRED AND ELEVEN YEARS, FOUR MONTHS. It writes: KEEPER. And a thing with a measuring-rod unfolds from the wall.
> Give him an exact figure | investigation 14 | You tell him the days of water left: not eleven, and not eight. Six and a quarter. The hand stops; and then, tenderly, underlines it. *AT LAST.* {skip, +measurer_friend, xp 150, done} // About a week, you say. The hand *shudders*.
win: The hand turns back the scroll to a day, and a vote. Seven for. One against, which was the First. One abstained, since the motion had been put without a measured count. And the name is there. You can see the hole where it is. NE_ _ _ _.  {+votes, +letter2, magic, gold 80, done}
end: *He opened the granaries*, writes the hand. *I counted what he gave away. It came to one hundred and four thousand people.* And then, slowly, as though it hurt: *I ought not to have abstained.* {+ch2, +granary, xp 120}

== Bitter Water | 6 | camp
read: There's another party that wants the name: to burn it. The High Priest of the Eight is at Bitter Water with forty carts of gold hats and the only other copy of the vote. “He's got to stop for water,” says Ziza. “Everybody does. It's neutral ground. *You* couldn't cause trouble there, could you?” She's down to five days.
goal: Get the priests' half of the Name at the Caravanserai of Bitter Water.
dm: Heist/social in a peace-bonded inn. The innkeeper Grandmother Ash enforces. Kadro arrives. High Priest Ptahor is a coward; his guard captain is not.
-- npc ash @camp:dining | Grandmother Ash | keeper of Bitter Water | veteran/h:druid:human:f
look: has a table of four hundred confiscated knives, and knows whose each is
hi: Knives. All of them. And that one. And, dear, that one.
? The rule (peace, fight): Nobody bleeds within the wall. It's never been broken. It's been *bent*.
? The spring (water, dug): No king dug it. My grandmother's goat did. That's why it's bitter, and that's why it's still here.
? The priests (hats, ptahor): Forty carts, and he haggled over the stabling. The chest that he sleeps on is the one.
! Which side are you on (persuasion 14): “The goat's,” says Grandmother Ash. But she looks at your rubbing, of the thin man with the loaf; and moves a lamp, so that it shows you a door. {+ash_help, xp 100} // “The wall's,” she says.
-- npc ptahor @camp:chapel | High Priest Ptahor | in flight | priest/h:cleric:human:m
look: is wearing three gold hats, for safety
hi: I'm on a *pilgrimage*.
? The wells (city, water): It's in the hands of the Eight. It's quite out of mine. I've washed them.
? The name (ninth, vote): There are eight. There have only ever been eight. Who's been *talking?*
! You know what he did (intimidation 14) [granary or loaf]: All three hats shake. “If they know,” says Ptahor, “that a king can just open the door and give it *away*, what are we *for?*” {+ptahor_cracked, xp 100} // “Guards,” says Ptahor; but it's neutral ground.
-- scene knives @camp:start | Handing In
say: The table. Behind you is the desert, in front of you are all the people who'd like to kill you; Grandmother Ash has her hand out.
> Hand over everything | | She writes you a ticket for each. She counts your fingers. {+honest3, xp 40}
> Keep one back | sleight 14 | She knows. She lets you. “*One*,” she says. {+onekept, xp 50} // “And *that* one,” says Grandmother Ash, not looking up.
> Hand over something that isn't a knife | performance 12 | You put down the chisel: you say what it's for. She doesn't file it with the others. {+ash_chisel, inspire, xp 60} // “That's a spoon,” she says.
-- trial heist @camp:storage | The Chest He Sleeps On | 5 before 3
say: Forty carts, forty guards, no weapons; the one chest; and on top of it one High Priest, snoring.
try: stealth 14 Through the hats
try: sleight 14 The key's in his beard
try: performance 13 A lullaby
try: deception 14 “Room service”
try: athletics 13 Lift him, gently
try: animal 13 Borrow the goat
win: You have it; and he's asleep, still, on a sack of turnips, with one hat on. {+chest3, xp 180}
lose: He wakes. He screams. No one bleeds: but there's a great deal that you can do to a person without it. {hurt 3d6 bludgeoning all, +chest3, +loud3}
-- puzzle chest3 @camp:study | The Chest
say: Eight locks, with eight gold keyholes; and no ninth. The lid's carved with all eight kings looking left. “What is it that eight can keep,” says the rim, “and nine cannot?”
answer: a secret|secret|the secret|silence|a lie
hint insight 12: They're all looking away from the same place.
hint investigation 13: There's no lock. All eight are dummies. You just have to say it.
wrong: Something needle-thin, from Anubis' eye. {hurt 1d8 poison one con 13}
win: It opens. The tablet's broken across; on it you read, in the eight's own hand: *NE—TEP, called—* The rest is in the quarry, ground up for sand. {+letter3, xp 150}
lose: You drop it. *NE*, it says, on the one bit; and on the other, *TEP*. {+letter3}
-- fight assassins3 @camp:bedroom ambush | Not Bleeding | spy*, thug | hard
say: The rule says that nobody *bleeds*. They've brought cords.
win: Four men tied up in their own rope. Grandmother Ash gives them back their knives, outside, in the sun. {+ash_help}
-- scene auction3 @camp:hall many | The Water Auction
say: It's every night at nine. A jar goes up on the table. Six princes, four caravans and a man from Sarrakesh with his whole savings in a sock.
> Outbid the princes | gold 80 | You give it to the man with the sock. It goes round the room like a smell of cooking. {+kind3, inspire all, xp 80}
> Shame them | persuasion 14 | You tell them about the queue. There's a silence; and a prince, with very bad grace, pushes across a skin. Then they're all doing it. It comes to two days' worth. {+twodays, inspire all, xp 150} // A prince yawns. It's a dry place, for yawning.
> Cheat | sleight 14 | The jar's half as heavy as it was. So is yours twice. {+cheat3, xp 60} // “*Bent*,” observes Grandmother Ash, and puts you to wash up. {time 120}
-- boss captain3 @camp:throne [letter3 or chest3] | Outside the Wall | Captain Sehet of the Hats = gladiator!, veteran*, thug | deadly
say: She's had the sense to wait for you past the gate, by ten feet, with her back to a rule that she respects. “I don't care about the name,” says Captain Sehet. “I was given a wage, and I've a brother in that queue. Do you want to tell me how I *do* this?”
> Hire her | persuasion 14 | “What does he pay?” you ask. “In *hats*,” says Sehet. She takes the job for a cup of water, and a place at the head of the line for her brother; then she changes that, to the back. {skip, +sehet, xp 150, done} // “I'd want it in writing,” she says, “and there's nobody left that I'd believe.”
win: She gives up her sword by the point. “My brother's called Hem,” she says. “He's got a limp.”  {+sehet_beaten, magic, gold 70, done}
end [twodays]: You bring two days' water back, in every kind of vessel there is. Ziza ties two knots *on*. It's the first time that anybody's seen her do it. {+ch3, xp 140}
end: NE, and TEP, and a hole in the middle. Ziza listens. Then she says it over, as far as it goes; and, in the dry well behind her, something drips once. {+ch3, xp 140}

== The Namecutters' Quarry | 7 | quarry
read: The middle of a name is lying somewhere in a thousand tons of chippings. Sefu has come. He's never left the city before. He's brought the slab; it's on a sledge. “It'll want to be there,” says Sefu, “when you find it.”
goal: Find the missing letters of the ninth name.
dm: The quarry's stone has become elementals that remember. Sefu must choose to cut. The foreman-ghost of the chiseller is here.
-- npc sefu4 @quarry:start | Sefu | last of the namecutters | commoner/merchant
look: is walking about with his palm on the rock, as one calms a horse
hi: Hear that? It's *humming*. It's got the tune. It's only waiting for the words.
? The chippings (find, where): They'd not have thrown it away. You don't throw away a name. You'd sweep it up, in a cloth, and you'd hide it, and you'd never tell your wife.
? The stones (alive, elemental): They were going to be kings. They've been let down. You'd be short with people.
? Cutting it (slab, you): When you've got it I'll cut it. I've practised every letter but I've never done the word. (His hands shake.) It's a *big* slab.
-- fight stones4 @quarry:.2 | The Unfinished | earth = earth_elemental, gargoyle* | hard
say: Half a king gets up out of the wall: the good half. It's cross about the other.
> Finish its face | sleight 14 | You've got the chisel. It holds quite still; it even shuts its eye. When you have done it goes and looks at itself in a puddle for a very long time. {skip, xp 120, inspire} // You've given it somebody else's nose.
win: It lies down into the shape that it was always going to be.
-- scene weepers @quarry:.3 | The Chisel-Marks
say: A wall forty feet high, blank. When you put your cheek to it you can see that every mark's at the same angle: the angle of a man who is leaning away.
> Follow the angle | investigation 13 | They drift. He was backing off as he worked. The last of them's at the mouth of a small side cutting, which has been walled up, rather lovingly. {+sidecut, xp 90} // Forty feet of regret.
> Put the chisel back in its own cut [chisel] | | The rock takes it from you. There's a groan, and a slab slides. {+sidecut, inspire, xp 90}
> Sing it the eight verses [song or mumble] | performance 13 | It hums the ninth. The *tune* has eleven notes, so the name has to fit: three beats. Nem. Tep. No; there's something on the end of it. {+scansion, xp 100} // It hums louder.
-- trial crane @quarry:.42 | The Great Crane | 4 before 3
say: To get to the upper galleries somebody's got to go up with the block.
try: athletics 14 Turn the wheel
try: acrobatics 14 Ride the block
try: investigation 13 Choose the rope that's sound
try: perception 13 Watch the pin
win: Up you go, on a hundred tons of what was going to be somebody's kneecap. {xp 150}
lose: The rope that was sound is now two ropes. {hurt 4d6 bludgeoning all dex 13}
-- fight eaters @quarry:cave~.55 | Name-Eaters | basilisk, cockatrice* | hard
say: Things have come to live on the chippings. They've licked a great many proper nouns; they've eyes that put you in mind of your obituary.
win: In the gizzard of the largest, polished like a pearl: a piece of lapis, with one letter. It's an M. {+letterM, xp 80}
-- scene side4 @quarry:shrine~.68 [sidecut] | The Side Cutting
say: A little room. A lamp. A cloth, knotted; and, sitting with his back against the wall, the ghost of a man with no tools. “I only did as I was told,” he says. “I only did as I was told. I swept it all up.”
> Forgive him | religion 13 | It isn't yours to do. But there's nobody else; and the man on the salt, you say, let go in the end. He gives you the cloth. It's heavier than a child. {+cloth, inspire all, xp 150} // “It's not *you* that I did it to,” he says. He gives you the cloth, though. He'd like to put it down. {+cloth}
> Ask him to help you put it together | persuasion 13 | It takes all night. He knows every grain. NEMTEP: and after it, where the titles go, there's not *Lord of* nor *Son of*; only two words. *Who Asked.* {+cloth, +fullname6, xp 200, inspire all} // “I can't look at it,” he says. {+cloth}
> Just take the cloth | | He lets you. {+cloth}
-- fight golem4 @quarry:.82 | The Overseer | clay_golem | deadly
say: The quarry's overseer was baked with one instruction in its mouth: NOTHING LEAVES.
> Take the word from its mouth | acrobatics 15 | You're up, and in, and out, with a slip of clay in your teeth. It stands there like a man who's come into a room for something. {skip, xp 200} // You're up, and in.
win: It breaks along the word.
-- boss voice4 @quarry:last | The Eighth King's Agent | Imy-ra the Effacer = mage!, mummy*, animated_armor | deadly
say: “Give that to me,” says a voice like a rasp. He's here, he has been here all the time: the man who gave the order, bandaged, upright, with a pumice stone in each hand. “It took me *years*.”
> Make Sefu cut the first letter now | persuasion 13 | You turn your back on the mummy, and you ask him. The old man picks up his mallet. *Tock.* “No,” says the Effacer. *Tock.* “No no *no*—” and there's half as much of him. {inspire all, +cutting, xp 150} // His hands won't hold it.
win: The pumice goes to powder. So does he. On the slab, plain as a loaf, stands an N. {+effacer, magic, gold 100, done}
end [fullname6]: Sefu cuts it all that night by the light of four lamps. You hold them. At dawn you stand back. NEMTEP WHO ASKED. “It's *good*,” says Sefu, amazed. In Sarrakesh, they'll tell you afterwards, the Eighth Well filled to the brim. Then it stopped, as somebody stops who's been interrupted. {+ch4, +slab, xp 170}
end: You've got most of it, in a cloth. Sefu has cut as far as he can see. “Somebody'll have to ask him the rest,” says the old man, and covers it against the wind. {+ch4, +slab, xp 170}

== The Long Queue | 7 | city
read: You come back to Sarrakesh to find the gates shut. The priests have told the city that you broke the wells. It's a simple story, and they've had four days with nothing to do but listen. Ziza's under guard in her own house. There are two knots left; the Fourth Well is the last, and someone's put a lock on it.
goal: Turn the city round, and open the Fourth Well to everybody.
dm: Political sitting. Win 'trust'. Riot or no riot. A false Mistress of Wells; the Fourth King's daughter-ghost.
-- npc hem @city:out:.1 | Hem | a man with a limp, at the back of the queue | commoner/villager
look: is holding three other people's places
hi: You'll be the ones who poisoned it. You don't look like much.
? The lock (fourth, well): Priests' guard. They're letting in those with hats. A hat's four hundred.
? Your sister (sehet): *Sehet?* She's alive? She's not still with that lot? {add trust 1}
? What would turn them (city, people): They're not bad. They're thirsty. If someone'd just say what's *true*; I mean in a loud voice. Nobody's done that since I was born.
-- npc ziza5 @city:study | Ziza Om-Harran | under guard | priest/h:cleric:human:f
look: has tied the whole cord into one enormous knot
hi: I told them two. They'd rather have had eleven. I ought to have lied better.
? The Fourth (lock, well): It's shared with the priests' garden. There's a culvert. They're watering *lilies*.
? The name (slab, nemtep): Say it to me again. (She listens with her eyes shut, like a person drinking.) Yes. There's a pipe in that somewhere.
! Tell them the truth about the eleven (persuasion 13): “Stand up,” she says, “in front of nine hundred people and say that I lied about water? Yes. Help me with the hat. No. *Without* the hat.” {+ziza_speaks, add trust 2, xp 120} // “Then they'd never believe me about anything.”
-- scene square5 @city:tavern many | The Square
say: They're at every window. There's somebody on a barrel with a rope.
> Stand on the other barrel | persuasion 14 | You say it: there were nine. He gave away bread. They cut his name out; and it's *that* that's shut the taps. A woman of eighty says, “I *told* you.” {add trust 2, +told5, xp 150} // A jar hits the barrel. It's empty. They're all empty.
> Sing the ninth verse | performance 14 | You've no words for it. You just put in the three that you've got. It fits like a key. Nine hundred people find that they've known it all along. {add trust 2, inspire all, xp 150} // You've pitched it too high.
> Let Sehet talk [sehet] | | “I guarded the *chest*,” says Captain Sehet. She tells them what was in it. She's not a speaker. It's very effective. {add trust 2, xp 100}
> Give them what you've got | | You pour out your own skins into the first jar. It's nothing. It goes hand to hand down the whole of the queue, and nobody drinks; and comes back to you, full. {add trust 2, inspire all, xp 120}
-- trial culvert @city:out:.5 | The Culvert | 4 before 3
say: Forty yards on your stomach, in the dark, toward the smell of lilies.
try: stealth 13 Quietly
try: athletics 13 The grating
try: survival 13 Read the flow
try: sleight 13 The sluice-pin
win: You turn it. Four hundred lilies bow their heads. In the square a fountain that's been dry since spring coughs up one frog and then, gloriously, water. {+fountain, add trust 2, inspire all, xp 180}
lose: You come up amongst the lilies. There's a guard sitting there with his boots off. {hurt 2d8 piercing one}
-- fight hats5 @city:out:.65 | The Hats | veteran*, priest | hard
say: The temple guard, in gilt. They're well watered.
> Ask which of them's family is in the queue | insight 13 | It goes along the rank like wind in barley. One takes off the gilt helmet; it's only tin. {skip, add trust 1, xp 120} // “Ours got *hats*,” says the sergeant.
win: Under the gilt it's tin.
-- scene daughter5 @city:chapel | The Fourth Well
say: On the kerb there's a child in royal braids, quite transparent, trailing her feet in nothing. “I was six,” she says. “I was his niece. He used to do a thing with a coin.” She looks at you sideways. “You're going to *see* him.”
> Ask her what thing | | She shows you. It comes out of your ear. It's a very old trick, and a bad one. “If you do that,” says the princess, “he'll know that it was me.” {+coin, inspire all, xp 100}
> Ask her to hold the water | persuasion 13 | “I can hold it for *one* day,” she says, “if I hold my breath.” She does. She goes slightly pink. {+held5, add trust 1, xp 120} // “I'm only six,” she says.
> Tell her that he's angry | insight 12 | “He isn't *angry*,” says the princess with scorn. “He's *waiting*. It's different. Grown-ups always think that it's angry.” {+waiting, xp 80} // “You're being silly,” says the princess.
-- boss ptahor5 @city:out:.3 [trust>=3 or fountain or told5] | The False Mistress | Nebet in the Gold Hat = cult_fanatic!, gladiator, thug* | deadly
say: They've made another one: a frightened girl in a gold hat that's too big, with a bodyguard that is not frightened at all. “The Eight are *merciful*,” she reads off a card. “The Eight will—” She loses her place. The man behind her puts a blade to it.
> Talk to the girl | persuasion 14 | “What's your name?” you say. She looks up. It's the first time that anyone's asked since Tuesday. “Meri,” she says; and takes off the hat; and ducks. {inspire all, +meri, xp 120} // “I'm the Mistress of—” She can't see past the brim.
win: The hat rolls right across the square, and into the fountain, and sinks. {+hat_sunk, magic, gold 90, done}
end: The Fourth Well's open. There's a line, and it moves. Ziza stands beside it in her own hair, saying the real number aloud to each of them as they come. Nobody runs. “One day,” says Ziza. “And the Court of the Eight's under the palace. It always has been. I've got the key; I'm the plumber.” {+ch5, xp 190}

== The Court of the Eight | 8 | court
read: Eight thrones, a gap, a table. You've been announced. It's a *hearing*, says the clerk; he's a baboon, mummified, with a very beautiful hand. Eight kings and queens lean out of their chairs. Each has a hand over its mouth. They would like, one gathers, to explain.
goal: Make the Eight vote again.
dm: Win 5 of 8 votes: the First (against originally), Third (if friend), Second (if friend), Fourth (niece), others by scene. 'votes6' counter. Then the Eighth King, who led it, attacks.
-- npc clerk6 @court:start | Thoth-em-Heb | clerk of the Court | commoner/imp
look: is a baboon, in linen, sharpening a reed
hi: *State your cause*. Spell it.
? The vote (rules, again): A motion to rescind. It wants five. You've *one*, if the First's awake. He voted against; he's been asleep since, out of spite.
? The Eighth (leader, who): He moved it. He'd the most granaries. Do *not* look at his hands.
? Third (friend) [third_friend]: “He's asked me to say *aye* for him,” says the baboon, disapproving. “And he wants to know the price of onions.” {add votes6 1}
? Second (measurer) [measurer_friend]: “One,” writes a hand on a scroll. “*Exactly* one.” {add votes6 1}
-- scene first6 @court:.15 | The First
say: He's enormous, he's snoring; there's a cat on him, mummified, kneading.
> Wake him | athletics 12 | “Is it *done?*” he roars. “Have they said that they're sorry? No? *Well, then!*” He votes aye without being asked, and goes back to sleep. The cat turns round twice. {add votes6 1, xp 100} // He rolls over. There's a hundredweight of gold on the side that you're on. {hurt 3d6 bludgeoning one}
> Wake the cat | animal 13 | She looks at you. She extends one claw, and puts it in his nose. {add votes6 1, inspire all, xp 120} // She extends one claw.
-- fight sixth6 @court:.28 | The Sixth's Objection | mummy*, flesh = wight | hard
say: “I *object*,” say the bandages of a queen, “to the *tone*.” Her ladies rise.
> Apologise for the tone | persuasion 14 | You do it with a bow in the right place. It appears that nobody's ever; they've always thrown spears. “*Well*,” says the Sixth. {skip, add votes6 1, xp 150} // You've bowed to a lamp.
win: “Oh, have it your own way,” says the Sixth Queen, from the floor. {add votes6 1}
-- trial argue6 @court:hall~.42 | The Pleading | 5 before 3
say: You've the floor. Eight dry faces. The baboon dips his reed.
try: history 14 The famine, with dates
try: investigation 14 One hundred and four thousand
try: persuasion 14 The queue
try: religion 14 What the gods said of bread
try: performance 14 The ninth verse
try: insight 14 What you were each afraid of
win: When you stop it's so quiet that you can hear the resin creak. Two of them have taken down their hands. {add votes6 2, inspire all, xp 250}
lose: “*Noted*,” says the baboon. One's taken down her hand; but only to yawn. {add votes6 1}
-- puzzle fifth6 @court:library~.55 | The Fifth's Riddle
say: The Fifth King will only vote if he's amused. “A man gives away all that he has, and has more than he had. A man keeps all that he has, and has less. What is it that they're holding?”
answer: a name|name|love|honour|honor|friends|gratitude
hint insight 13: One of them's got his carved in eight places. The other's got a hole in eight walls; and nine hundred people humming it.
hint history 13: He wants a word that can be given and kept.
wrong: “*No*,” says the Fifth, delighted, and something bites. {hurt 2d8 necrotic one con 14}
win: He laughs, until the beetles come out. “*Aye!*” says the Fifth. “Oh, *aye!*” {add votes6 1, xp 180}
lose: “Oh, you're no *fun*,” says the Fifth. “Abstain.”
-- fight seventh6 @court:.68 | The Seventh's Regiment | skeleton*, wight, skeleton_archer | deadly
say: The Seventh never goes anywhere without eleven hundred men. He has them line up, so you can see the difficulty.
> Ask to inspect them | intimidation 14 | You find a button undone. In the whole of eleven hundred. The Seventh is so mortified that he'll vote for anything. {skip, add votes6 1, xp 200} // They're immaculate.
win: He counts what's left. “I suppose,” he says, “that I could *abstain*.”
-- scene niece6 @court:crypt~.8 | The Fourth
say: She's a queen with a small empty chair beside hers. She has both hands over her mouth.
> Do the trick with the coin [coin] | | It comes out of the queen's ear. She makes a sound. She takes down her hands. “*Aye*,” she says, “aye, aye,” and can't seem to stop. {add votes6 1, inspire all, xp 200}
> Sit in the small chair | insight 14 | You just sit. After a while a hand, very light, comes down on your hair. “She *liked* him,” says the Fourth. “We all did. That's what was so frightening.” {add votes6 1, xp 150} // The chair isn't yours.
-- boss eighth @court:throne~last [votes6>=3] | The Eighth King | The Eighth = mummy!, mummy*, wight | deadly
say: “The motion,” says the Eighth King, rising, “is *out of order*.” He has the hands of a man who's dug through a wall. “He'd have given it *all*. He would've given away *us*.” He hasn't a vote left in the room; and there's a sword in the chair.
> Put it to the vote, now [votes6>=5] | | “Those in favour,” says the baboon, very fast. Hands come up: off mouths, off swords. You can feel it go through the stone like a bolt being drawn. He has no throne under him. {inspire all, +carried, hurt 1d4 necrotic one, xp 250}
win: “He asked me to *help* him,” whispers what's left of the Eighth. “He held the door for me. He *held* the—” Then the wind's got it. {+eighth_down, magic, gold 150, done}
end [carried]: It's carried. Eight voices say it, all together, each as much as it remembers: and the gap between the thrones is a door. It's bricked up. There's someone's finger in the mortar. {+ch6, open ninth, xp 220}
end: There's no vote. But there's nobody to stop you, either. The baboon writes *by default*, and lays down his reed. The gap between the thrones is a door. {+ch6, open ninth, xp 220}

== The Man Who Asked | 9 | ninth
read: There isn't a treasure. It's a granary, the biggest that you've ever seen, bin upon bin; and swept, with a broom, quite clean. There's the broom. On the wall by the door, scratched with something soft, are forty centuries of days; and, next to each of them, a tick.
goal: Reach the ninth king, and ask him.
dm: Servants who stayed with him voluntarily; tests of patience; the thing that grew in the dark of resentment: his Thirst (an elemental shadow). He himself should be asked: name, and then what he needs.
-- npc broom @ninth:start | Bek | baker to the ninth | commoner/h:cleric:hill_dwarf:m
look: is dead, and has flour on his hands
hi: You're not from the *Eight?* No. You've no hats.
? The king (nemtep, who): He's in the back. He's got very quiet, the last thousand years. We stayed. Nobody made us. There's forty.
? The wells (water, stopped): That's not *him*. Well, it is. It's the Thirst. It's what grew. He'd sit there, and not be asked, and not be asked; and one morning there was another one of him. It does all the things that he doesn't.
? What does he want (ask, need): Nobody's ever said. I did him a loaf. I've not had flour since; I do it from memory. {+loaf8}
-- fight dry @ninth:.15 | The Dry Ones | mummy*, skeleton | hard
say: They came to steal, over the centuries; the Thirst has had them. They've nothing in them. They'd like some of yours.
win: They go to powder, with a sigh, as if it had been a long while to hold one's breath.
-- trial tally @ninth:.28 | The Days | 5 before 3
say: The passage is all ticks. You can't get by without reading them; each of them takes exactly a day.
try: insight 14 Keep him company
try: religion 14 Give the hours their names
try: performance 14 Sing them by
try: survival 14 Sleep in turns
try: investigation 14 Find where he skipped
try: athletics 14 Keep walking
win: You come out forty centuries older. You've not missed one. At the very end there's a tick that's got a small face drawn on. {xp 300, inspire all, +ticks}
lose: You come out on your knees. {hurt 4d8 psychic all wis 14}
-- scene ovens @ninth:kitchen~.4 | The Ovens
say: Forty bakers, dead by choice, round a cold oven. They've kneaded the same dough for four thousand years; there's nothing in the trough.
> Give them flour | | You've some: it's what's left of the crossing. They look at it as Ziza looks at water. There's a loaf, in the end, the size of your fist. {+real_loaf, inspire all, xp 150}
> Light the oven | survival 12 | It draws. Some of them hold their hands to it; they'd forgotten about *that* part. {+oven, xp 80} // It's been out for too long.
> Knead with them | | They make room. {xp 60, inspire}
-- fight thirst1 @ninth:.52 | The Thirst's Hands | wraith, mummy*, specter | deadly
say: It has forty hands for forty wells, in case there are ever forty. They come out of the plaster.
win: One's still shut on something. You prise it open: it's a tap.  {+tap7, xp 100}
-- puzzle last7 @ninth:library~.65 | The Last Wall
say: He wrote it himself, when he'd still got something to write with. “I've asked this of eight and had no answer. I have asked it of the wall. *What is it that costs nothing, that a beggar may give a king, and I would've opened every door for?*”
answer: thanks|thank you|a thank you|gratitude|his name|a name|to be asked|an answer|asking
hint insight 13: He gave bread to one hundred and four thousand. Then there was a wall. In all that noise what hadn't anyone had time to say?
hint persuasion 13: It's the first thing that you'd teach a child of three.
wrong: The wall sweats salt. {hurt 3d6 necrotic one con 14}
win: It comes down quite softly, brick by brick, from the top. {xp 250}
lose: You take it down. It's only bricks.
-- fight thirst2 @ninth:.78 | The Drought | air = air_elemental, fire = fire_elemental | deadly
say: Every stopped well, every dry mouth, all turned round and given a shape and let out. It comes along the passage with its tongue hanging.
> Let the princess breathe out [held5] | | She's followed you, on tiptoe, with her cheeks full. She lets it go. It goes by you like the sea. {skip, inspire all, xp 200}
win: It rains, briefly, indoors.
-- boss thirst @ninth:last | Nemtep | The Thirst of Nemtep = mummy_lord!, wraith*, mummy | deadly
say: A thin man's sitting on an upturned bin, with his back to you, facing the wall. There's another of him behind: the same, but ten feet high, with no lips. “*They never asked*,” says the tall one. “*They drank; they never once asked*.” The thin one hasn't moved. He's got one hand held out, a little, palm up. He's been holding it like that for some time.
> Ask him his name [fullname6 or slab] | | You go round, and sit down in front of him on the floor. “What's your name?” you say. It takes him a great while to find where it's kept. “*Nemtep*,” he says. It's hardly a sound. The tall one screams. It's already as thin as smoke. {+asked, inspire all, hurt 1d4 necrotic one, xp 300}
> Give him the loaf [real_loaf or loaf8] | | You put it into the hand. It's still warm, or you say that it is. He looks at it. He breaks it in half; he looks up, for someone to give it to. {+fed7, inspire all, xp 200}
> Do the trick with the coin [coin] | | It comes out of his ear. There's a silence. Then Nemtep, Who Asked, Ninth of His Line, laughs out loud; and the thing behind him puts its hands over its own face. {+laughed, inspire all, xp 200}
> Thank him | persuasion 13 | “Thank you,” you say, “for the bread.” It's four thousand years late. There're nine hundred people above you who'd like to say it too, and you say it for each of them; you get as far as forty. {+thanked, inspire all, xp 250} // It sticks in your throat; you're so dry.
win: The tall one pours away into the floor. You hear it go: down, and along; it's in the pipes. Somewhere up above a great many people have begun to shout. {+thirst_down, done}
end: The thin man's stood up. He's looking at the door as if it might be for him. {xp 350}
ending [asked & thanked]: Nemtep Who Asked | It's in the main square, forty feet high. Sefu wouldn't let anyone help. There are nine verses in the song. On the feast day the Mistress of Wells takes off the gold hat, goes down to the kerb of the Ninth with a loaf, and says *thank you*; and from below, quite politely, there's a knock. They've named a great many children Nemtep. It's a nuisance, in school.
ending [asked or fed7 or laughed]: The Ninth Well | There'd been a ninth well all along, under the granary; nobody'd ever thought to look, for it wasn't in the song. It's sweet. He comes up some evenings, they say, a thin brown man with a coin, and does a trick for whoever's there. The Eight have asked if he'd care to sit down. He's thinking about it.
ending: Water | The wells are running. The wall of the Ninth's been whitewashed, by order; but whenever it rains, which it does now, something comes up through the white that might be letters. Ziza goes and looks at it. She's got the cord in her pocket, with a knot in it, in case. “I ought to have asked,” she says.
`;export{e as default};