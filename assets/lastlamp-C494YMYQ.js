var e=`id: lastlamp
title: The Last Lamp
code: R14
levels: 8-14
tags: underdark, expedition, running out of light
tone: grim
ink: #14141c #8fd3c7
pitch: The sun did not come up. Somebody has to go down and find out where it went.
about: For nine days there has been no dawn. The scholars say that the sun sets into the earth each night and is rowed back under it, and that the boat has not come in. You are going down to look, with forty porters, eleven hundred candles and a cook.
about: The Last Lamp is an expedition. Light is counted. So are friends. The deeper you go the more the dark has to say for itself, and some of it is true.
villain: Mother Umbra | lich | has taken in the sun to keep it from going out | is afraid of the dark
patron: Professor Hesper Lyle | Royal Society of Lamps, who was laughed at
secret: The sun is dying. Mother Umbra, oldest of the lightless, who hated it all her life, found its boat wrecked on her shore with the fire almost out, and took it into her house and has been blowing on it ever since. She has not slept. She cannot do it alone.
place city = Lamplight | village size=3 seed=lamplight-5 time=1 weather=fog open=yes | Every lamp in the city is lit. It's been nine days. They've started on the furniture.
place shaft = The Setting | dungeon size=3 seed=setting-4 theme=stone caves=.4 fams=cave+vermin+kobold pop=.45 | It's where it goes down. It's a hole in the west a mile wide, with a stair; the edges are gilded.
place river = The Under-River | cave size=3 seed=underriver-8 fams=cave+sewer+drow pop=.45 | Black water and a towpath. There's a rut in the stone, from the keel. Something's been at the mile-posts.
place town = Blindfair | castle size=1 seed=blindfair-3 biome=blight theme=dwarven moat=no time=1 roofs=battlement fams=drow+dwarf pop=.18 folk=yes | A town of the lightless. It's pitch black. It's market-day. They're all very polite to you, as you're so loud.
place fungus = The Pale Forest | wilds size=2 seed=paleforest-6b biome=blight theme=overgrown time=1 fams=plant+cave+vermin pop=.45 | Trees, after a fashion. They've never seen a sun. They turn to your lantern as you pass; they lean.
place roper = The Teeth | dungeon size=2 seed=teeth-9 theme=stone levels=2 caves=.7 fams=cave+dwarf pop=.5 | Stalactites; stalagmites. Some of them have just shut.
place necro = The City of the Put-Out | dungeon size=3 seed=putout-2 theme=crypt levels=2 caves=.1 fams=undead+construct pop=.5 | A whole city, with its lamps out; and at each window a person, standing, with a taper in the hand, waiting to be told.
place house = Mother Umbra's House | dungeon size=3 seed=umbra-7 theme=crypt levels=2 caves=.25 fams=undead+aberration+cave pop=.5 | It's the darkest place that there is. It's got a chimney. It's got a very small red glow at the keyhole.

== The Ninth Night | 8 | city
read: “*I said so in a* paper,” says Professor Lyle. “*They threw buns.*” She's got a pith helmet with a candle on it, and she's holding a lamp: brass, about as big as a pear. “This is the first that was ever lit off it. It's never been out. It's how you'll get it home. If this goes,” says the Professor, “then there isn't any.”

It's noon. The stars are out.
goal: Outfit the expedition, and get it out of the city.
dm: 'lamps' counter (light). Companions: Professor Lyle, Cook Biscuit, Porter Gunn, blind guide Ilk. City panics, Candle-Guild hoards, cult of the Dark.
-- npc lyle @city:study stays | Professor Hesper Lyle | leader | mage/h:wizard:human:f
look: is talking to you and writing it down and correcting it
hi: You've got boots. Good. The last applicants had *theories*.
? The sun (where, boat): It sets; I've seen it. It goes down the Setting, there's a river, it's rowed. Twelve hours. It always struck me that nobody'd ever thanked the *rower*.
? The lamp (brass, pear): It's got to be carried by somebody who doesn't mind being looked at. They'll all look.
? They laughed (paper, buns): I was thirty. I've still got one. It's gone very hard. I shall throw it back.
? Your candles (light, supply): Eleven hundred. It's a hundred a day. I've done the sum; I'd rather that you didn't do it.
-- npc biscuit @city:tavern stays | Biscuit | expedition cook | commoner/h:cleric:lightfoot:m
look: has a stove on his back, lit
hi: I'm not going unless there's jam.
? Why go (cook, hole): Somebody's rowing twelve hours every night. I'll bet nobody's done him a *flask*. {+flask}
? The dark (afraid): I'm afraid of it something awful. So I took up cooking. You've got to have a light on.
-- npc ilk @city:chapel stays | Ilk | guide | drow/h:monk:high_elf:f
look: has a scarf over her eyes, and has turned her face to exactly where you are
hi: You breathe through your mouth. All of you. It is like being out with *bellows*.
? Home (under, lightless): I came up to see it. I saw it. It took my eyes; it was worth it. I would like it *back*.
? Mother Umbra (who, old): One does not say that name, near an ear. She is our grandmother. She hates the light. She'd have put it out when she was a girl, she could never reach. {+umbra}
? The way (guide, down): Four days by water. You will need to be *quieter*.
-- scene guild1 @city:out:.2 many | The Candle Guild
say: There're forty thousand in the vault. They've gone up to a crown apiece. Outside there's a queue of children in the dark.
> Requisition | intimidation 14 | You've got the Queen's warrant, the Professor's voice, and no time. It's five hundred; it's *one each* for the queue. {add lamps 2, inspire all, xp 200} // “Supply,” says the Guildmaster, “and demand.”
> Ask the chandlers | persuasion 14 | It isn't the masters. It's the girls in the dipping-room; they come out in their aprons by the back, all of them, with their arms full. {add lamps 3, inspire all, xp 250} // They'd lose their place.
> Buy | gold 150 | A hundred and fifty. {add lamps 1}
-- fight cult1 @city:out:.4 | The Snuffers | cult_fanatic*, cultist | hard
say: They go about in grey, with long brass poles, putting them out. “*Isn't it* restful?” they say. “*Hasn't it been* bright?”
win: One's got a burn on his cheek, in the shape of an old hand. “*She only patted me,*” he says. {+pat}
-- trial crowd1 @city:out:.6 | Through the Crowd | 5 before 3
say: It's out that you're taking the lamp. There's a hundred thousand people between you and the hole.
try: persuasion 14 Tell them why
try: stealth 14 Under a bucket
try: athletics 14 A wedge
try: performance 14 Make it a procession
try: religion 14 Let each one look
win: It takes till what'd be midnight. Every one of them has touched the brass. It's as bright as a button. {add lamps 1, inspire all, xp 320}
lose: It goes over. It doesn't go *out*. It's a long half-second. {hurt 5d6 bludgeoning all}
-- fight thieves1 @city:storage | The Night Market | assassin, spy* | deadly
say: Somebody'd pay a kingdom for it. Somebody has.
win: You find the kingdom's seal. You'll not tell them; they were just frightened.
-- boss dark1 @city:out:.85 [lamps>=1] | The First of the Dark | What Puts Out Stars = wraith!, specter*, shadow | deadly
say: It's standing on the lip of the Setting, with its back to the gilt. It's in the shape of where a person isn't. “*Don't,*” it says. “*She's* busy.”
win: It folds up like a moth. There's a smell of soot; of something very like milk. {+busy, magic, gold 180, done}
end: Forty porters, a stove, a bun, eleven hundred candles; more or less. You start down. At the bend of the stair the Professor looks back, at where it ought to be. “*Up in a minute,*” she says to it. {+ch1, open shaft, xp 280}

== The Setting | 9 | shaft
read: It's a mile across. The steps were cut for something with a longer stride. All down the western wall it's polished gold, by nothing but being gone past, every night, for ever. Then there's a line; and below it's dull. “*It stopped here,*” says the Professor.
goal: Get the expedition down the Setting.
dm: Portering logistics; kobolds who gild; collapse; purple worm.
-- npc gunn @shaft:start | Porter Gunn | head porter | commoner/h:barbarian:human:m
look: has got everyone roped, and is on both ends
hi: Forty. I don't lose 'em. I lost one in '09; I go and see his mum.
? The stair (down, steps): Nine thousand. I've counted the first hundred; I've got a *feeling*.
? The line (gold, dull): Something dragged. You see there? That's a keel. It came down *hard*.
-- npc gild @shaft:.3 | Gilder Nix | a kobold, of the Rim | kobold/kobold
look: has gold leaf on her whiskers
hi: You've tracked *dust*.
? The boat (sun, wreck): We polish up after. It's always been a *shower* of sparks. Nine nights back there was a noise. It went by all on one side. He'd got nobody at the oar.
? The rower (who, he): Old Tem. He's been doing it since there was water. He waves. He didn't wave.
? Help us (way, light): We've got the sweepings. It's only *sun*. It's in jars. You can have it, if you'll find Tem. {+sweepings, add lamps 2, job tem}
-- fight bats2 @shaft:.18 | The Flight | stirge*, manticore | hard
say: They've not been able to tell when to come home.
win: They go up past you in a long black scarf. {xp 40}
-- trial lower2 @shaft:.42 | The Broken Flight | 5 before 3
say: A thousand steps have gone. It's forty men, a stove, and a rope.
try: athletics 15 Belay
try: acrobatics 15 First down
try: survival 15 The knots
try: persuasion 14 Talk Biscuit over the edge
try: perception 15 The sound rock
win: “*Forty,*” says Gunn. There's jam. {xp 380, inspire all, add lamps 1}
lose: You lose a crate. You can see it for a long time: it's candles: they've lit. {hurt 5d6 bludgeoning all dex 15, add lamps -1}
-- fight umber2 @shaft:mine~.58 | The Ones Who Undermine | earth = earth_elemental, rust_monster* | deadly
say: It wasn't rotten. It's been *eaten*.
win: There's gold in the gizzard. It's leaf.
-- scene mark2 @shaft:.7 | The Mark on the Wall
say: It hit just here. It's a dent that you could put a church in; all round it there's a spatter of drops, gone hard. They're still warm.
> Gather them | sleight 14 | You've a bagful. They're like beads of noon. {add lamps 2, +beads, xp 180} // They run together, and through the bag. {hurt 3d6 fire one}
> Read the dent | investigation 15 | It was struck from the *inside*. It was something turning over in its sleep. It's sick. {+sick, xp 250} // It's a very large dent.
> Put your back to it | | You stand there, for a minute, all of you. You'd forgotten. {heal all, inspire all}
-- boss worm2 @shaft:last | The Bottom Stair | The Gilded Worm = purple_worm!, roper | deadly
say: It's followed the warm all the way down from the roots; it's wrapped round the last landing. It's got some of the sun in it. You can see it shining, between the ribs.
win: It's cut open. There's about a lantern's worth: and a boot, of great age; it's a rower's. {+boot2, add lamps 1, magic, gold 200, done}
end: There's a river. There's a towpath; it's dark both ways. There's a rut in the stone. “*Left,*” says Ilk. “*It's crying.*” “What is?” you say. She's got her head on one side. “*The* boat,” says Ilk. {+ch2, open river, xp 320}
job tem = Old Tem | Find the rower. | flag tem_found | gold=0 xp=400

== The Under-River | 10 | river
read: There's four days of it. It doesn't sound like much. You've no idea till you've done it what a thing a day is, when nobody comes round to tell you that it's over. They sing; then they hum. By what Biscuit says is Thursday you can hear forty men trying not to hear each other breathe.
goal: Follow the keel-mark to where the boat came ashore.
dm: Morale; drow pilots; aboleth-like; the boat Mesektet wrecked; crew shades.
-- npc pilot @river:.2 | Pilot Vesh | of the lightless | drow/h:ranger:high_elf:m
look: is poling a flat boat, and wincing at your candle
hi: *Please*. Shade it. I'll take you; only, it is like being shouted at.
? The boat (wreck, sun): It came round the bend on its side. It was *hissing*. My children had never seen a shadow. They'd one each. They ran from them.
? Mother Umbra (her, house): She came down to the shore in her nightgown. She's four thousand years old. She waded in. She picked it up in her *apron*.
? Why (did, hate): We've all of us asked. She shut the door.
-- fight kuo3 @river:.3 | Fish of the Dark | lizardfolk*, crocodile, hydra | hard
say: They're all eyes; they've been drawn to it. They would like just to hold it a minute.
> Hold it up, and let them look | religion 14 | They crowd along the bank, with their hands before their faces. It's very quiet. One gives you a pearl. {skip, add lamps 1, inspire all, gold 80, xp 280} // They'd sooner have it.
win: It goes back in the water, looking up.
-- trial days3 @river:.45 | Four Days | 6 before 3
say: No dawn, nor noon; nor anything.
try: performance 14 Ring the hours
try: persuasion 14 Settle the fight about the spoon
try: insight 14 See who's going under
try: survival 14 Ration the light
try: religion 13 Say grace, for no reason
try: medicine 14 Make them sleep
win: On the fourth morning (Biscuit says that it's morning) somebody laughs. They've all got their names scratched on the stove. {xp 450, inspire all, +morale}
lose: There's thirty-nine. Gunn doesn't say. He's put a knot in the rope. {tired all, hurt 4d6 psychic all wis 15, +lostone}
-- scene boat3 @river:cave~.6 many | Mesektet
say: She's on the shingle, on her side: she's as long as a street; she's cedar. The hold's burned right through. She's whimpering, very softly, the way that ships do.
> Go aboard | investigation 14 | There're benches for twelve. There's only ever been one used; it's got a dip in it. There's a flask, empty; a knitted cap. {+cap3, xp 180} // The deck's gone. {hurt 3d6 bludgeoning one}
> Talk to her | animal 15 | You put your hand on the wood. *He got so* tired, says the boat. *He'd nobody to spell him. He shut his eyes for a minute. It was only a* minute. {+boatspeaks, inspire, xp 250} // She flinches.
> Start to mend her | survival 14 | Gunn's got forty men, and a feeling. They'd sooner do that than sit. {+mending, xp 200} // There's not a plank on this river.
-- fight shades3 @river:.72 | The Ones Who Came to Look | drow*, mage, spider | deadly
say: The young lords of Blindfair, in smoked glass. They mean to break up the boat. “*Then it can never come* back,” they say. “*It'd be so* peaceful.”
win: You break the glasses. They stand there blinking. One says, “*Oh.*”
-- puzzle oar3 @river:shrine~.82 | The Oar
say: It's standing in the sand, upright, by itself. It's carved from end to end; it's the only thing that he left. “*I go with you to the door, and I wait. I'm there when you're not looking. I'm longest when you're going home. I was never once asked in.*”
answer: shadow|your shadow|a shadow|my shadow
hint perception 13: Pilot Vesh's children had one each.
hint nature 13: What's longest at the end of the day?
wrong: It hums; you've splinters. {hurt 4d6 force one}
win: It comes out of the sand to your hand; there's *two* handles. There'd always been two. {+oar, inspire all, xp 420}
lose: You've got to dig it up. {+oar}
-- boss dragon3 @river:last | The Black Shallows | Nethys of the Shallows = black_adult!, lizardfolk | deadly
say: “*I* salvage,” says something under the water, with an acid sort of a laugh. “*What's on my beach is mine. The rower? Oh, I've got the* rower. *I was saving him.*”
win: He's in a crack of the rock, in the wet, an old, old man with one boot. “*I only shut my eyes,*” says Tem. {+tem_found, jobdone tem, magic, gold 250, done}
end: He drinks the whole of the flask, if there's a flask. He looks at the cap for a bit. “*Is she all right?*” he says. You think that he means the boat. “*She took it in,*” says Tem. “*I saw. She'd got it in her* apron. *She was saying, there, there.*” {+ch3, open town, xp 380}

== Blindfair | 11 | town
read: It's a town of the lightless; there're forty thousand. They can't see you. You've a lamp; you can't see anything else. They've put out chairs. “*You are welcome,*” says the Reeve of Blindfair. “*You understand that we must decide whether to let you go.*” It's a fair question, when you think of it from here: nobody's asked *them* if they want it back.
goal: Persuade the lightless that the sun should return.
dm: Debate & empathy; they benefit from dark; the cold is coming though. 'voice' counter. Assassins of the Young Lords.
-- npc reeve4 @town:hall | Reeve Ossian Dim | reeve | drow/h:cleric:high_elf:m
look: has his face to you and his eyes shut, from courtesy
hi: You've a very *busy* smell. Do sit.
? The dark (sun, want): For four thousand years they've told us that we live in the absence of something. It's not absence. It's velvet. It's *ours*. Now the whole world's as we are; and you want us to give that up, as it doesn't suit you.
? The cold (getting): (He's got a shawl on.) Yes. I'd hoped that you'd not noticed. The river's got a skin. We never thought of where the *warm* came from.
? Mother Umbra (house): She's the only one of us who was ever up there as a child. They threw stones. She came home. She's kept the door shut ever since.
-- npc child4 @town:kitchen | Little Vesh | pilot's daughter | commoner/h:rogue:high_elf:f
look: is six, and following her own shadow round and round your lamp
hi: It does whatever I *do!*
? The shadow (yours): I've called it Ilk. Does everybody get one? What, for *nothing?* {+shadowkid, add voice 1, inspire}
? Are you cold (blanket): Gran says it's so we'll cuddle.
-- scene market4 @town:dining many | Market-Day
say: It's all done by smell and by touch. It's beautiful. You've been blundering about in it with a lamp like an ox.
> Put it out: just here, just for an hour | | Nobody breathes. The Professor cups it in her hands. And then, bit by bit, you can hear it: the whole of a city, like a cathedral, like the inside of somebody's *purse*. “*Now,*” says a voice, pleased. “*Now* you're visiting.” {add voice 2, inspire all, xp 300}
> Taste everything | insight 13 | There's a mushroom that is like the end of a story. You cry. They give you the recipe. {add voice 1, xp 150} // It was a stallholder.
> Learn to say good morning | persuasion 14 | They've not got one. They've a word for *I heard you wake*. You go up and down and say it, in a dreadful accent. {add voice 1, inspire, xp 200} // You've said something about a goat.
-- fight lords4 @town:armory | The Young Lords | drow*, assassin, mage | deadly
say: They've had new glasses made.
win: They were going to sell it. In *bits*.
-- trial moot4 @town:throne | The Moot of Blindfair | 6 before 3
say: Four thousand, in tiers, in the black. You've to do it without a light; it's only manners.
try: persuasion 15 The skin on the river
try: performance 15 Sing them noon
try: history 15 What was done to a child with stones
try: insight 15 Say what you've had from the dark
try: nature 15 Where warm comes from
try: religion 15 Ask pardon
win: There's a sound that they make: it's all of their hands, opened. “*We'd like it,*” says the Reeve, “*to come back by* here. *Sometimes. If it could be got to go* slowly.” {add voice 3, inspire all, xp 500}
lose: They're not against it. They're only *hurt*. {hurt 5d6 psychic all wis 15}
-- fight ice4 @town:storage- | The River's Skin | water = water_elemental, winter = polar_bear*, ice = frost_giant | deadly
say: It's come up by the cellars. It's never been cold enough for it, before.
win: You break the ice off the well. They pretend not to be frightened.
-- puzzle gift4 @town:library | The Hospitality
say: They'll not let a guest go on without the guest-riddle. “*You've brought it everywhere with you; you've never once been without it; you fought it every evening of your lives. When you shut your eyes you're home.*”
answer: dark|the dark|darkness|night
hint insight 12: They're rather hoping that you'll say it as if it was nice.
hint religion 13: What's behind your eyelids?
wrong: “*Oh dear,*” they say. {hurt 2d8 psychic one}
win: They dress you for the road: it's a cloak, it's soft as soot. It weighs nothing. “*So that she'll know you've been* asked,” says the Reeve. {+cloak4, inspire all, add voice 1, xp 420}
lose: They give you a biscuit.
-- boss inquis4 @town:study [voice>=2] | The Put-Out | The Grey Cantor = lich!, wight*, specter | deadly
say: In the Reeve's own study there's a man in grey, with a long brass pole. He's been dead for a good while. “*You'd wake them,*” he says. “*I had a whole city, once, that wouldn't stop* looking. *I put it out. It's so much better behaved.*”
win: The pole's for reaching. You keep it. It'd do for lighting, if it came to that. {+pole, magic, gold 220, done}
end: They come with you as far as the gate. There's forty porters; there's forty of theirs; they've each taken hold of one another's sleeve. “*Past the Forest,*” says Ilk, “*past the Teeth; there's the city of the Put-Out; then hers. I've never gone so far.*” She's taken off her scarf. {+ch4, open fungus, xp 420}

== The Pale Forest | 12 | fungus
read: They lean. You can hear it behind you: a creak, as the whole wood turns to see you go. It has never had a sun, and it's read about it. You're on six hundred candles. Somebody's been dropping crumbs of wax; you look round; and where each one fell there's a small, white, furious flower.
goal: Cross the Pale Forest without burning it or being planted.
dm: The forest wants light; sacrifice? treant king; porters enthralled.
-- npc king5 @fungus:ruin | The Pale King | a very old mushroom | treant/treant
look: is as big as a chapel, and is bending down to see into your lamp
hi: IS THAT IT? IT'S SMALLER THAN I'D THOUGHT.
? The forest (light, want): WE'VE GROWN TOWARD IT SINCE THERE WAS A TOWARD. NOBODY EVER SAID THAT IT WASN'T COMING.
? The porters (gone, taken): THEY'RE ONLY BEING LOOKED AT. THEY'VE GOT SOME *ON* THEM.
? Stay (price, pass): JUST ONE CANDLE. JUST SO WE'D KNOW.
-- scene candle5 @fungus:out:.3 | Just One Candle
say: You've six hundred. It's all that there is.
> Give one | | You set it on a stone. Every tree in the forest bends down. It burns for an hour; it's the quietest that you've ever been. When it's out the whole wood's *gold*; it'll fade. {+candle5, add lamps -1, inspire all, xp 300}
> Give a bead of noon [beads] | | It sits in the moss like an egg. It isn't going to go out. THANK YOU, says the wood, all the way to the edges. {+candle5, +bead5, inspire all, xp 400}
> Don't | | You go by. They don't say anything. They lean. {xp 60}
-- fight spores5 @fungus:out:.5 | Enthusiasm | violet_fungus*, shrieker, treant | deadly
say: It's the young ones. They want to *touch* it.
win: You've trodden on a good many. They'd never had anybody's boot before; they're passing it round.
-- trial planted5 @fungus:out:.65 | Rooted | 5 before 3
say: You stopped for a rest. You're very comfortable; you can't feel your feet. It's just that somebody would have to *stay*.
try: athletics 15 Pull
try: nature 15 Ask it nicely
try: medicine 15 Cut: carefully
try: persuasion 14 Tell it about the walking sort
try: survival 14 Salt
win: You're up. You've got rootlets in your socks. You'll send a postcard. {xp 450, inspire all}
lose: You stay. It's a season. The Professor comes back for you with a trowel. {hurt 6d6 poison all con 15, tired one}
-- fight drider5 @fungus:.3 | What Hunts in It | spider*, drow, mage | deadly
say: Something that was a lord of Blindfair has gone eight-legged, from spite.
win: In the web there're lanterns. They're hung up like bacon.
-- puzzle bloom5 @fungus:library~.55 | The Bloom
say: In the middle, in a hollow, there's one bud, shut; it's as high as a house. It's been going to open. They've a verse. “*I've never seen it and I know the way. I've got no eyes, I'm always right. Cut off my head, I'll turn my neck. What is it that I'm made of?*”
answer: hope|longing|wanting|faith|waiting
hint nature 14: It's what leans.
hint insight 14: “Nobody ever said that it wasn't coming.”
wrong: It sneezes. You've got a green thumb; and arm. {hurt 4d6 poison one con 15}
win: It opens. There's a seed, in there: it's warm: it's as big as a loaf. TAKE IT WITH YOU, says the King. SO IT'LL KNOW THAT WE'RE HERE. {+seed5, inspire all, xp 480}
lose: You knock. It's a nearly. {+seed5}
-- boss beetle5 @fungus:last | The Lamp-Eater | The Beetle of Dusk = purple_worm!, spider* | deadly
say: It's got a back like a moonless night. It rolls up whatever shines, and buries it for its young. It's got nine suns' worth of Thursday under it, in a ball.
win: You've a ball of assorted afternoons. Biscuit can cook by it. {add lamps 2, magic, gold 200, done}
end: The trees draw back. In front of you it's all teeth. {+ch5, open roper, xp 460}

== The Teeth, and the City | 13 | necro
read: You came through the Teeth with thirty-one men and four hundred candles. Nobody talks about the Teeth. On the other side there's a gate, and a street; and people at the windows. They've each got a taper in the hand. They've been put out for eleven hundred years. They're looking at your lamp.
goal: Cross the City of the Put-Out.
dm: The Cantor's doing. They can be lit, one by one, from the lamp; each lit is risk. 'lit' counter. Undead guardians; iron snuffer.
-- npc boy6 @necro:start | A Lamplighter's Boy | put out | skeleton/h:rogue:human:m
look: is nine, and grey, and holding up a taper as high as he can reach
hi: ...
? Light it: (It catches. It goes all the way down him, like a blush. He takes a great gasp.) *—and I'd only the one more street to do!* He looks at you. *Am I late?* {+boy6, add lit 1, inspire all, xp 200}
? The others (city): They just want a light. It goes from one to the next. It's *easy*. You've only to reach.
-- scene street6 @necro:.15 many | The First Street
say: Forty windows. Forty tapers.
> Light them | | One, and one, and one. Your own flame gets no less. It's a thing that you'd forgotten about flame. {add lit 2, inspire all, xp 250}
> Use the Cantor's pole [pole] | sleight 13 | It reaches to the third floor. They lean out to you. {add lit 3, inspire all, xp 300} // You've put one out again. He's very good about it. {add lit 1}
> Go by | | You've four hundred. You go by. They turn their heads. {add lit -1}
-- fight wardens6 @necro:guard~.28 | Wardens of the Quiet | wight*, wraith | deadly
say: They've got snuffers, on chains. They come up the street without any noise, from the far end, and behind them it's dark.
win: You light their own tapers off your lamp. They stand looking at it.
-- trial teeth6 @roper:.3 | The Teeth (Once More) | 6 before 3
say: There's a man still in there. Gunn's gone back for him. You go back for Gunn.
try: stealth 16 Between the real ones
try: athletics 16 Hold it open
try: perception 15 Which are breathing
try: acrobatics 16 Out along the tongue
try: medicine 15 Both of them
try: persuasion 14 “He's got a *mum*”
win: “*Thirty-two,*” says Gunn. {+thirtytwo, inspire all, xp 600}
lose: You bring out the rope. {hurt 7d6 piercing all dex 16}
-- fight roper6 @roper:.65 | The One That Shut | roper*, roper | deadly
say: They've been very patient. They've seen a great many go by with their eyes up.
win: You go through a gap where there'd been a smile.
-- scene found6 @roper:last | In the Back Teeth
say: There's a camp. Somebody's been here before you: Royal Society; there're buns.
> Read the log | history 14 | It's Lyle's father. *The lamp's out. We turned back; we couldn't find which way was back. Hesper will say that I should've asked somebody.* {+father, inspire, xp 250} // It's too wet.
> Take the bun | | It's gone very hard. She holds it for a while; it's a good weight. {+bun, inspire all, xp 200}
-- puzzle cantor6 @necro:library~.5 | The Cantor's Stall
say: The cathedral's dark. There's his book; his last hymn. It's locked with a line: “*I'm the only thing that's doubled when it's halved. They passed me hand to hand, the fools; and I had only ten, and then I had ten thousand. I could never find which one to blow out* first.”
answer: flame|light|a flame|fire|the light|a light
hint insight 13: Your own got no less.
hint religion 14: It's how you light a cathedral.
wrong: A cold wet thumb; a cold wet finger. {hurt 6d6 cold one con 16}
win: Every candle in the nave, all together: *whuff*. {add lit 3, +nave, inspire all, xp 550}
lose: You do it by hand. {add lit 1}
-- fight choir6 @necro:.7 | Evensong | specter*, wraith, mage | deadly
say: His choir. They've not been let to finish.
> Give them the note [nave] | | They've been holding the *A* before *men* for eleven hundred years. “*Men,*” they go. You've never heard a building sit down before. {skip, inspire all, xp 500}
win: You close the book.
-- boss snuff6 @necro:last [lit>=2] | The Great Snuffer | The Iron Evening = iron_golem!, wight*, wraith | deadly
say: It's hung over the square on a chain, since the day he did it: it's a bell with no clapper. It's got legs. It walks from street to street, and sets itself down.
win: It's cracked. The light gets in; and it rings: for the first time: it's a perfectly ordinary evening sort of bell. {+bell6, magic, gold 260, done}
end [lit>=5]: You go out by the north gate, and look back. It goes right up the hill. It's every window. The boy's on top of the wall with his taper; he's got *one more street*. You hadn't thought there'd ever again be anything you'd have to shade your eyes from. {+ch6, +citylit, open house, xp 520}
end: Behind you there's a street or two. It isn't much. You can see it for miles. {+ch6, open house, xp 500}

== The House in the Dark | 14 | house
read: It's a small house. It's got a step; it's been scrubbed. All round it's the darkest that there is: it's so dark that it's soft. Your candles have gone down to blue. There's a light at the keyhole: red: no bigger than a pea. You can hear someone in there, blowing. And stopping. And blowing.
goal: Help Mother Umbra.
dm: Trials: things of the deep dark drawn to her failing; convince her; rekindle with everything collected: lamp, beads, seed, oar w/ two handles. Who'll row?
-- npc door8 @house:start | The Door | a door | animated_armor/animated_armor
look: is ajar by about a finger
hi: *She says, go away. She says, wipe your feet.*
? Her (umbra, in): *She's not sat down for nineteen days. She's got it on her lap. She's burned all the chairs.*
? Help (let, us): *I'm to say no. I'm* saying *it. You could push.*
-- fight hungry8 @house:.12 | What Came for It | eye_tyrant, wraith* | deadly
say: The really old dark: the kind without a name. It doesn't hate it. It's just where it would all have gone, if there'd never been any. It's leaning on the house.
win: You get the door shut.
-- scene hall8 @house:bedroom~.25 many | The Passage
say: There're no pictures; but the wall's been touched, at one height, all along, by someone very small. She's four thousand. It's got a bump in it every year.
> Feel along it | perception 14 | Here there's a gap. It's where she went up; she'd have been seven. Then it goes on; but it's *lower*. She was walking bent. {+seven8, xp 300} // It's a wall.
> Find the stones | investigation 14 | They're on a shelf. She kept them. There're nineteen; each is about as big as would fit a child's hand. {+stones8, xp 300} // There's nothing but dust.
> Say who you are, out loud | | You say it. You've got their cloak on; you say the thing for *I heard you wake*. The blowing stops. “*Who taught you* manners?” says somebody. {+greeted8, inspire all, xp 350}
-- trial dark8 @house:.4 | The Dark's Own Voice | 6 before 3
say: It's got something to say; it's been saying it since the city. “*You could stop,*” it says. “*It's only that you're* used *to it. Put it down. I've got you. I always did.*” It isn't lying.
try: insight 16 “I know you have”
try: religion 16 Thank it
try: persuasion 15 “Just not yet”
try: performance 15 Sing it the porters' song
try: athletics 15 One more step
try: medicine 15 Hold on to each other
win: “*Well,*” says the dark. “*When you're ready.*” It moves over. It was only ever being kind. {+friends8, inspire all, xp 700}
lose: You put it down. It's Biscuit who picks it up. {hurt 8d6 psychic all wis 16}
-- fight kin8 @house:.55 | Her Sons | vampire, drow*, mage | deadly
say: The last of the Young Lords have got here first. They've come to help her finish it. She's told them no; she's only got the one hand free.
win: “*Thank you,*” says somebody behind the door. “*They were never any good.*”
-- puzzle hearth8 @house:library~.7 | The Inner Door
say: It's got no lock. You can hear her through it: she's asking herself, over and over, in time with her breath. “*It burned me. It never once looked. I'd have put it out with my thumb. So why's it on my* knee?”
answer: it was cold|pity|love|it was dying|kindness|because it was small|it was small|mercy|she was lonely|it needed her
hint insight 15: She knows what it is to be seven, and a long way from home; and to have nobody open the door.
hint medicine 15: *There, there*, Tem heard her say.
wrong: “*No,*” she says. “*It's not that.*”
win: “*Oh,*” says Mother Umbra. “*I suppose that it* was.” She lets you in. {+let_in, inspire all, xp 750}
lose: You go in. {xp 200}
-- scene lap8 @house:kitchen~.82 | The Sun
say: It's in her apron. It's about as large as a cat. It's dull red, with a crust on. She's a tiny bent woman with no eyelashes; her hands are burned right through. She's got soot to the elbow. “*I've tried everything,*” she says. “*I hate it. It won't* catch.”
> Give her the lamp | | The Professor holds it out; the first that was ever lit. “It's *yours*,” she says to it; her voice goes. You touch the one flame to the other. Something stirs. {+lamp8, inspire all, xp 500}
> Give it the forest's seed [seed5] | | Somebody's been growing towards it for ever. It's never been told. It opens one eye. {+seed8, inspire all, xp 500}
> Give it all your candles | | You put them in, one by one, what's left. It's a hundred and nine. You're in the dark; so's everybody. It's just that. {+candles8, inspire all, xp 500}
> Take her place for an hour | medicine 14 | “*You've got to blow,*” says Mother Umbra, “*not* hard.” She's asleep before she's finished saying it. She's got her head on Biscuit. {+spelled8, inspire all, xp 500} // You've blown too hard. It's all right. She shows you.
win: It's orange. It's the size of a sheep.
-- boss night8 @house:last | The Night Before | The Night With No Morning = lich!, wraith*, eye_tyrant | deadly
say: There's a knock. It's not the dark that you've made friends with. It's the one behind; it's what there was before there was anyone to mind. The whole of the front wall goes. “*GIVE IT*,” it says, “*HERE*.” Mother Umbra gets up. She comes about to your elbow. She picks up a stone, from the shelf.
> Stand by her | | Thirty-two porters; a cook; a professor, with a bun. “*You* shan't,” says Mother Umbra. She's been waiting for four thousand years to throw it. It hits. {inspire all, +stood8, hurt 1d6 cold one, xp 700}
> Open the window [citylit or lit>=3] | | You can see it from here. It's a hill, it's every window; there's a boy on the wall. “*That,*” you tell it, “*was you.*” It's never seen itself from outside. It goes back a step. {inspire all, +window8, xp 700}
> Let the other dark answer [friends8] | | “*No,*” says the dark; *your* dark; it's come in, it's in the corners, it has been under the bed. “*They said*, not yet.” {inspire all, +darkhelps, xp 700}
win: It's gone; it wasn't ever anywhere. It's just an old woman in a nightgown, in a house with no front, holding up something that you can't look at. {+night_done, done}
end: It's got to go back. There's the boat; there's Tem; there's an oar with two handles. “*I'm not going,*” says Mother Umbra. “*I* hate *it.*” She's got her shawl on. “*Somebody's got to see that he doesn't shut his eyes.*” {xp 800}
ending [spelled8 or lamp8]: Up in a Minute | It came up on a Thursday. It was eleven minutes late; it was a bit lopsided; you never saw such a noise. The Royal Society were on the steps; a bun came out of the crowd, and knocked off the President's hat. There're two at the oar, these days. If you're up early, and you've got good eyes, you can see them: an old man with a flask; and a very small old lady with smoked glasses, leaning over the side, saying something to it. It's probably *slower*.
ending [citylit]: One More Street | They've lamps in the Put-Out City, and a market-day in Blindfair when it comes by with its hand over its face. The Pale Forest's got a spring. Forty years on there's a lamplighter there, a tall man with a grey streak, who does the last street at what he says is evening. He's got a rope round his waist. It's got a knot in it. He goes and sees somebody's mum.
ending: The Last Lamp | You never did find out what it was that you brought home. It's in a brass thing like a pear. You carried it up nine thousand steps; and when you came over the edge, thirty-one of you, you held it up: and away in the east, on the other side of the world, as if it had just been waiting to be shown how, something went pink.
`;export{e as default};