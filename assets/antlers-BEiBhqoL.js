var e=`id: antlers
title: A Crown of Antlers
code: R4
levels: 1-8
tags: forest, the old bargain, hunters hunted
tone: grim
ink: #24381f #ee6a35
pitch: Every harvest the village crowns a King for a day. This year he went up into the wood, and the wood has sent him back with horns.
about: Hazelmere has kept the bargain for three hundred years: one day in the year a man wears the straw crown, is feasted, is chased laughing to the edge of the trees, and comes home to bed. Nobody remembers what it was for. The wood does.
about: A Crown of Antlers is a campaign of forests, laws and consequences. The heroes will be hunted, and will learn the rules; and at the end of it someone has to wear the crown.
villain: The Huntsman, Oswy Thorn | druid_npc | wants the wood paid in full for three hundred years of straw | loves the village, and grew up in it
patron: Goodwife Annis Hale | who keeps the harvest, and was this year's Queen
secret: The first King was no sacrifice. He gave himself to the wood for a year and a day, and came home, and it was the best year anyone ever had. It was his grateful people who made it straw, so that no one need go again.
place hazel = Hazelmere | village size=2 seed=hazel-14 biome=autumn time=16 open=yes | Barley stubble, apple smoke, and every door hung with a plait of straw. All of the plaits have been turned to face the wall.
place wood = The Hither Wood | wilds size=2 seed=hither-5 biome=autumn theme=overgrown time=17 weather=fog fams=beast+plant+wild pop=.59 | Beech and hazel, and a light like the inside of a barrel. It is noisy until you step under it.
place law = The Law Stones | wilds size=3 seed=lawstone-2 biome=autumn theme=overgrown time=20 fams=beast+plant+wild pop=.64 | Nine stones on a bare hill, and the whole of the wood round it, breathing.
place camp = The Charcoal Camp | dungeon size=2 seed=charcoal-9 theme=dwarven caves=.5 fams=bandit+kobold pop=.64 | A valley of stumps. They have followed the roots down, because there is iron under them.
place hall = Thornwick Hall | castle size=1 seed=thornwick-6 biome=autumn moat=yes time=12 roofs=cone fams=knight+bandit+beast pop=.18 | A handsome house, panelled throughout in oak. There is a very great deal of oak.
place barrow = The First King's Barrow | dungeon size=2 seed=firstking-3 theme=crypt levels=2 caves=.2 fams=undead+plant pop=.64 | A green hill with a door of two leaning stones. Deer have been lying on it. The grass is warm.
place grove = The Drowned Grove | dungeon size=3 seed=grove-17 theme=overgrown caves=.5 fams=plant+beast+wild pop=.59 | The oldest trees have fallen in on themselves and made rooms. The druids live in the rooms. So does other weather.
place heart = The Heart-Oak | dungeon size=2 seed=heartoak-8 theme=overgrown levels=2 caves=.4 fams=plant+wild+beast pop=.64 | It is a tree in the way that the sea is water. There is a door in the root. It has been left ajar.

== Harvest Home | 1 | hazel
read: They had crowned Jem Hale, because he was twenty and could run. They chased him up the stubble with pans and whistles at sunset; he went in under the trees, bowing; and everybody went home to supper. That was Monday. It is Thursday. Last night he came back, eight feet tall, and walked through the miller's wall.

“He knew me,” says his mother. “He stopped and looked. And then he heard the pans.”
goal: Find out what happened to Jem Hale.
dm: Jem is the antlered thing; he can be saved up to sitting 7. The Huntsman took him as the debt. Villagers turned their plaits to the wall from shame.
-- npc annis @hazel:cottage stays | Annis Hale | Harvest Queen, Jem's mother | commoner/townswoman
look: still has barley in her hair, and has not noticed
hi: He'd laid a place for himself. Before. He said keep me some crust.
? Jem (son, king): Soft. Everyone'll tell you he's a lad for a joke, but he moves worms off the path. He bowed to the trees. I saw him. It wasn't for the joke.
? The crown (straw, harvest): I plait it. My mother did. There's a verse goes with the plaiting, only I lost the end of it. “Straw for the man and straw for the day, something something—” I always hum that bit. {+verse}
? What came back (antlers, horns): It'd got his scar. Here, under the chin. I kissed that better.
! The end of the verse (insight 12) [verse]: She plaits nothing, in the air, with her lips moving. “*—and horn for the man who stays*,” says Annis slowly. “Oh. *Oh*. And I've been humming it.” {+fullverse, xp 40} // “It's gone,” she says. “I always hum it.”
-- npc corder @hazel:tavern stays | Will Corder | miller, at present without a wall | commoner/innkeeper
look: has a bandage, a pitchfork and an audience
shop: general
hi: It's simple. There's a beast. There's six of us. There's torches.
? The wall (beast, night): Come straight through. Stood in my flour. It wasn't after me. It was looking at the scales. Broke 'em. Broke every weight.
? The torches (hunt, kill): Tomorrow night, before it does for somebody. I know it's Annis's boy. You don't have to *say* it. I've known him since he could stand. I'll do it quick. {job stop}
? The timber (oak, mill): New beams. Thornwick oak. His lordship let me have them cheap. What's that to do with the price of bread? {+cheapoak}
-- npc mother @hazel:chapel | Mother Wick | hedge-priest | acolyte/h:druid:human:f
look: is turning the altar-plait round to face the room, and it keeps turning back
hi: They do that by themselves. I've tried nails.
? The bargain (wood, old): There was one. There always is, where there's a wood that big and a village that small. What we gave, I can't tell you. What we got is that nobody here's ever been lost in it. Not a child. Three hundred years.
? The Huntsman (thorn, oswy): Oswy Thorn. Born in the end cottage. Went up to the druids at fifteen because he couldn't bear the pig-killing. They say he's their Huntsman now. I taught him his letters. {+oswy_local, xp 20}
? The stones (law, where): Up on the bare hill. There's three laws cut on 'em. I could only ever read two. {+lawstones}
-- scene wall @hazel:smithy many | The Miller's Wall
say: There's a hole in it the shape of something in a hurry. Flour, splinters; and right through the flour, very clear, a line of prints.
> Read the prints | survival 11 | They begin as a boot. By the doorway the boot has split. By the scales they're hooves, but turned in at the toe, the way that Jem Hale's mother will tell you he walked. {+prints, xp 25} // Large. Heavy. Gone.
> Look at the scales | investigation 11 | He didn't smash about. He broke the weights, one after the other, smallest to largest. Somebody has been giving short measure, and somebody was cross. {+weights, xp 25} // Broken scales.
> Find what it brought | perception 12 | In the corner, where it had been put down gently: a straw crown, soaked, and a fistful of late wild strawberries, not crushed. {+strawberries, xp 30} // Flour. You sneeze for some time.
-- scene mob @hazel:out:.15 [prints or weights or strawberries] | Six Men With Torches
say: They have not waited for tomorrow night. Will Corder's at the front. One of them's laughing in the wrong places.
> Show them the strawberries [strawberries] | | Nobody says anything. “Every year,” says Will, at last, “he'd bring her them. From when he was four.” He puts down the torch and stands on it. {+mob_home, jobdone stop, inspire, xp 50}
> Stand in the road | intimidation 12 | They'd need to go through you, and you're not a beast; it's different when it's not a beast. They go home, walking rather close together. {+mob_home, jobdone stop, xp 40} // “It's *our* wood,” says the laughing one, and shoves past. You will find two of them again later, up trees.
> Go with them | | “Good,” says Will. He can't look at you. “Good. You go first.” {+mob_came}
-- fight boar @wood:out:.2 | The Acorn Road | boar*, boar | easy
say: A sow with nine striped young, and her brothers, and you're between them and the acorns.
> Give them the road | animal 11 | You step off it. They pass in order of size, and the smallest gives you a look. {skip, xp 20} // You've stepped on an acorn.
win: Round one tusk is knotted a plait of straw.
-- scene whistle @wood:out:.4 | Tin Whistle
say: A penny whistle hangs from a twig at about the height of a tall man's mouth. As you look at it the wind, or something with about as much breath as the wind, plays two notes.
> Answer it | performance 11 | Two notes. From up the hill, from a chest the size of a barrel, come the next two. It's the harvest tune. He's got as far as the turn. {+answered, xp 40} // Something crashes away from you through the hazels, frightened.
> Call Jem by name | persuasion 12 | Nothing. Then, as you turn away, there is a strawberry lying on the path which was not there before. {+jem_near, xp 40} // Only leaves.
> Take it down | sleight 10 | It's his. There are new scratches round the mouthpiece, from teeth that weren't meant for it. {+whistle, xp 20} // It falls, and goes on falling: there was a badger-set. 
-- trial dusk @wood:out:.6 | Getting Lost | 4 before 3
say: In three hundred years nobody from Hazelmere has been lost in the Hither Wood. You are lost. The path goes along behind you, being rolled up.
try: survival 12 Take the moss's word for it
try: perception 12 Listen for the weir
try: religion 12 Ask leave, aloud
try: athletics 11 Climb, and look
try: animal 12 Follow the deer
win: You come out in a clearing that was looking for you. {xp 40}
lose: It lets you go in the end. It has got your measure. {hurt 1d6 slashing all dex 11, tired one}
-- fight snares @wood:.3 | The Snares | spider*, wolf | medium
say: A hollow hung with wire: good new wire, a lord's sort of wire. Things are dead in it, and other things have come for those.
win: Forty snares, and a gamekeeper's tag on every one: THORNWICK. {+snares, xp 25}
-- boss jem @wood:last | The Harvest King | The Antlered King = brown_bear!, wolf* | hard
say: He is sitting on a fallen oak with his head in his hands. It's a heavy head. The antlers have caught every kind of thing: ribbon, wire, a saucepan lid. When he sees you he stands up and tries to bow, and it frightens you so much that somebody reaches for a weapon, and then it's all too quick.
> Play the harvest tune to the end [whistle or answered] | performance 12 | He listens with his whole body. At the end he takes the saucepan lid off his horns and holds it out to you, in both hands; and then a horn blows, up on the hill, and all the wolves of the wood come in to fetch him. He goes with them like a boy who's been called in. {+jem_calm, skip, done} // You lose the turn. So does he.
> Give him the strawberries [strawberries] | | He takes one. He's so careful. He's crying, you think; it's hard to tell with the fur. “*Mam*,” he says. And a horn blows. {+jem_calm, skip, done}
win: He is only stunned. A horn blows on the hill; a stag the colour of smoke steps between you and him, and by the time it has gone, so has he. {+jem_fought, done}
end [jem_calm]: A man's voice comes down to you through the trees, quite close, and tired. “I'll not hurt him,” it says. “He's the first one that has been paid in three hundred years. Tell them to come to the stones and hear the bill.” {+ch1, open law, xp 50}
end: You find the saucepan lid. Scratched inside, with a claw that's just learning: SORRY. And a man's voice, from the trees: “Come to the stones. Hear the bill.” {+ch1, open law, xp 50}
job stop = No Torches | Keep Will Corder from killing Annis's boy. | flag mob_home | gold=15 xp=40

== The Law of the Wood | 2 | law
read: The Huntsman's terms are posted on the chapel door with a thorn. ANY WHO WILL SPEAK FOR HAZELMERE MAY COME TO THE STONES BY DARK AND BE HUNTED UNTIL DAWN. THOSE WHO KEEP THE LAW WILL BE HEARD. There are three laws. Mother Wick knows two of them. *Take nothing that begs. Waste nothing that bleeds.* “And the third?” you say. “That's the one they come down and teach you,” says Mother Wick.
goal: Last the night at the Law Stones, and learn the third law.
dm: Heroes are the quarry. Each scene tests a law: take nothing that begs; waste nothing that bleeds; *carry what you cannot mend*. Track 'law' count.
-- npc oswy @law:start | Oswy Thorn | the Huntsman | druid_npc/h:ranger:human:m
look: is a thin man of forty in a deerskin, with the saddest boots you have ever seen
hi: You came. I had thought that it'd be Corder, with a torch.
? Jem Hale (king, horns): He's well. He's frightened, but he is well. He asked what he was *for*; I said, a year. He thought about it. He said, who'll do the worms?
? The bill (debt, bargain): A King for a year and a day. That was the price. It's been three hundred years of straw. I can read you the whole of it, in oaks.
? Why you (hazelmere, born): Because I loved them both. You'll find it isn't possible. You'll find that you go on.
? The hunt (law, dawn): My hounds will run you till cock-crow. Keep the laws and they can't bite. You know two. You'll meet the third.
-- scene fawn @law:out:.2 | Something That Begs
say: A fawn in the bracken, one leg in a wire, looking straight at you. It makes a small noise. Behind you on the hill the hounds have begun.
> Free it, and leave it | sleight 11 | It takes time that you can't spare. It runs off without a thank-you. The hounds, when they come up, nose the wire and look at you, and sit down. {add law 1, xp 50} // The wire's cruel; by the time you have it off the hounds are on you. But they sniff the fawn, and only one of them bites. {add law 1, hurt 1d6 piercing one}
> Kill it, cleanly, to spare it | | It begged. You knew that it was begging. The whole wood goes quiet. {add broke 1}
> Run | | You run. You can hear it behind you for a good long way. {add broke 1}
-- fight hounds @law:out:.35 | Hounds of the Hunt | wolf*, dire_wolf | medium
say: They come over the bank like water, white, with red ears, and the eyes of clever men.
> Stand still and show your hands | animal 12 | They go round you, breathing. They know to a hair what you've done tonight. It appears it'll do. {skip, add law 1, xp 40} // Hands are meat.
win: They get up again when you have gone. You can hear them talking it over.
-- scene stag @law:out:.5 | Something That Bleeds
say: A stag lies across the path with a bolt behind the shoulder. Thornwick's mark. It has been dead an hour. Whoever shot it took the horns and left the rest to spoil.
> Dress it and carry it | survival 12 | You do it as it should be done, and it takes an hour, and the hunt, when it arrives, stands about on the edge of the light waiting for you to finish. You give the hounds their share. {add law 1, item rations*4, xp 60} // You do it badly, but you do it all. The hounds are fair-minded. {add law 1, xp 30}
> Bury it | athletics 12 | It's decent. It isn't the law; but it's decent. {xp 30} // You've no spade. {time 60}
> Leave it | | You step over. Something, in the dark, adds it up. {add broke 1}
-- trial run @law:out:.7 | Until Cock-Crow | 5 before 3
say: They've stopped playing. Now there's only running.
try: athletics 12 Up the scree
try: acrobatics 12 Along the fallen ash
try: stealth 12 Lie under the bank
try: survival 12 Up the stream
try: animal 13 Turn the lead hound
try: perception 12 See the gap
win: Grey light. Somewhere a cock, from an extremely long way off, has an opinion. {add law 1, xp 80}
lose: They pull you down at the edge of the light, all of you, and stand on you, panting and pleased. {hurt 2d6 piercing all dex 12}
-- scene houndcub @law:out:.85 | The Third Law
say: A hound has broken its leg in your chase. It's young. It lies by the stream with its red ears flat, and looks not at you but past you, the way that the hunt went. They haven't stopped for it.
> Carry it | | It's as heavy as a calf. It's got your blood on its muzzle. You carry it. You carry it all the way to the stones. Oswy Thorn is standing there, and when he sees you his whole face comes undone. {+third, add law 2, inspire all, xp 100}
> Set the leg | medicine 13 | You set it well. It licks your chin. But it can't walk; and there's still the hill; so you pick it up. {+third, add law 2, inspire all, xp 120} // You can't mend it. So. You pick it up. {+third, add law 1, xp 60}
> Let its own see to it | | You go round. At the stones they ask you what you carried; and you have nothing to say. {add broke 1}
-- fight tree @law:.3 | Under the Stones | violet_fungus*, shrieker, ghoul | medium
say: There's a stair down between the stones. What's down there has been fed by all those who didn't learn the laws in time.
win: Bones, and belts; and a lord's gilt spur.  {+spur, item gem_small}
-- scene read2 @law:library~.55 | The Cut Words
say: Under the hill the laws are carved large; and below them, small, is a sort of ledger: one line for each year, and in each the same word. *Straw. Straw. Straw.* Right at the top the word is a name.
> Read the name | history 12 | *Alder*. And after it, where each of the other lines has a reckoning, only: *Came home.* {+alder, xp 80} // It's worn. *Al* something.
> Count the straws | investigation 11 | Two hundred and ninety-nine. And against each a small tally of oaks, which are all paid out of the same account. The last twenty are Thornwick's, and are the most by far. {+tally, xp 50} // Many.
> Put your hand on it | | It's warm. It gives you, all at once, the whole of one good year, and you have to sit down. {+goodyear, inspire all}
-- boss rider @law:last | The Hunt's Judgment | The Smoke Stag = griffon!, dire_wolf* | hard
say: Dawn, and the last of it comes up the hill out of the mist: a stag the colour of smoke with the sun in its horns. It's come to see what you're made of. It lowers its head.
> Kneel [law>=4] | | It puts its muzzle on the top of each of your heads; you count, afterwards, and there is one white hair. {+judged_well, skip, inspire all, done}
> Meet its eye | insight 14 | You hold it as long as you can, which is as long as you've got nothing to hide. It seems that you've just enough. {+judged_well, skip, done} // It sees something. It isn't angry. It only comes on.
win: It dissolves in your hands like breath. What's left is a single tine, warm as toast. {+judged_hard, item druid_focus, done}
end [law>=4]: “You'll be heard,” says Oswy Thorn. He has the lame hound across his knees. “*Carry what you cannot mend.* I've been trying for twenty years to teach them that, and you did it for a dog.” He tells you who has been cutting the oaks. {+ch2, +oswy_respect, open camp, xp 70}
end: “You lived,” says Oswy Thorn. “That isn't the same as being right.” But he tells you who's been cutting the oaks. It's a fair question, and you've earned one answer. {+ch2, open camp, xp 70}

== The Charcoal Camp | 3 | camp
read: You smell it a mile off: wet ash and iron. They have taken a whole valley down to the stumps, and gone in underneath. Over the gate's a board with a very good painting of an oak tree, and under it THORNWICK IRON: PROSPERITY FOR ALL.
goal: Stop the cutting, and find who holds the felling rights.
dm: Foreman Rudge is a decent man with 60 mouths to feed. The ironmaster Sable has the charter. Wood-spirits are sabotaging lethally.
-- npc rudge @camp:.15 | Foreman Rudge | foreman | veteran/h:fighter:human:m
look: has a tally-stick, three missing fingers and a child's drawing pinned inside his hat
hi: Not hiring. Unless you can swing an axe. Can you swing an axe?
? The oaks (cutting, trees): Sixty a week. It's a lot. I'd never have believed there *was* sixty a week. I go home and I dream that I'm standing in a field and it's me that's the field.
? The men (camp, hungry): Sixty-one, with wives. They've all come off land somebody enclosed. Same somebody. You stop the cutting, you tell me what they eat. I'm *asking*.
? Accidents (wood, killed): Nine. A tree that fell uphill. A lad that sat down for his dinner and they found him with bluebells. I've said that we should ask someone. I don't know who you ask.
! There might be a way (persuasion 13): He takes off the hat and looks in it. “If you'd work that's *carrying* instead of cutting,” he says, “there's enough windfall in that wood to burn for ten years. They'd never let us. Who'd ask?” {+windfall, xp 60} // “There's always a way,” says Rudge, “for them as have dinners.”
-- npc pip @camp:kitchen~.3 | Pip | powder-boy | commoner/h:rogue:human:m
look: is eleven, black all over, and keeping a woodlouse in a matchbox
hi: D'you want to see a woodlouse?
? The woodlouse (matchbox): He was under a log. They burned the log. I told him I'd find him another.
? The ironmaster (sable, boss): Sable. He don't blink. He's got a room with a lock, and there's a tree in it. A little one. He waters it. It don't make sense.
? The powder (blasting, below): Nine kegs at the back. I could tell you how to *not* make them go off. If you were thinking of it. I could tell you what not to do. {+powder}
-- scene bluebells @camp:start many | Where He Sat Down
say: On the edge of the stumps, out of season, a patch of bluebells, in the shape of a lad asleep.
> Say something for him | religion 11 | You say it. On the hillside a stump puts out one green leaf. {+leaf, xp 30} // You don't know what he believed. You say that.
> Ask what killed him | nature 12 | Nothing killed him. He sat; it was comfortable; it was *made* comfortable. Something here's very angry, and it's not in the least cruel. {+comfortable, xp 40} // Bluebells.
> Lie down | | It's extremely comfortable. Your friends get you up, in the end, by the feet. {hurt 1d6 psychic one, +liedown, inspire}
-- fight overseers @camp:guard~.3 | The Timber-Watch | thug*, scout | medium
say: Men with whistles, and a big dog that's had its bark beaten out of it. “Visitors,” says the eldest, and smiles at your boots as though they were already his.
> Say that you are from his lordship | deception 12 | “*Which* one?” he says slyly. You say: the one who pays. That's good enough. {skip, +lordship} // “He's *in*,” says the eldest. “He's having his dinner.”
win: The dog sits down beside you and will not be moved.
-- fight dryad @camp:cave~.45 | What Was Under the Roots | centipede*, violet_fungus, spider | medium
say: They've opened a cavern where the roots came down, and broken what lived in it, and not even noticed.
win: At the back a seep of clear water. It fills your cup and stops exactly at the brim.
-- trial kegs @camp:storage~.58 [powder] | What Not To Do | 3 before 3
say: Nine kegs and a slow-match. If the adit comes down there will be no more iron. If it comes down with people in it...
try: persuasion 12 Get the night shift out
try: deception 12 Call a false dinner
try: sleight 12 Cut the fuse to the length you want
try: investigation 12 Put it where it'll only shut the door
win: It goes off like an enormous cough. When the dust has cleared there is not an adit, and there's sixty-one people on the hillside with their hands over their ears, and Pip, counting. “All out,” says Pip. “And *him*,” and shakes the matchbox. {+adit_shut, xp 100}
lose: It goes off. Nobody is killed; there's that. Half the hill sits down, and it sits down on you. {hurt 3d6 bludgeoning all dex 13, +adit_shut}
-- scene sapling @camp:alchemy~.7 | The Room With a Lock
say: A white room, very clean, and in it an oak sapling in a glazed pot, chained. It's a hundred years old, by the bark, and no higher than your knee. There are silver taps in it.
> Unchain it | sleight 13 | The moment it's loose every stick of furniture in the room remembers what it was. You get out just before the door does. {+sapling, item druid_focus, xp 80} // There's a needle in the lock. It goes to sleep, the hand; then you do. {hurt 2d4 poison one con 12}
> Taste what's in the tap | nature 13 | It's *years*. He's been drinking years. Sable is two hundred if he's a day, and he's been paying it all out of this. {+years, xp 60} // It's sweet. You're twelve, for a minute, and it is the first day of the holidays.
> Water it | | You give it your bottle. It turns all its leaves toward you, like a face. {inspire, +watered}
-- fight saws @camp:forge~.82 | The Saw-Floor | animated_armor*, thug | hard
say: The great saws were built to stop when a man fell in. Somebody's taken that part out.
win: You find the part on a hook, labelled TO BE FITTED.
-- boss sable @camp:last | The Ironmaster | Ironmaster Sable = cult_fanatic!, thug*, animated_armor | hard
say: He's at his desk, a smooth man with no age at all, writing with a goose quill in a hand that went out of fashion under the old Duke. He doesn't blink. “There's always someone,” says Sable, “who is fond of *trees*.”
> Show him the sapling [sapling] | | The quill stops. For the first time he looks at something. “Put that down,” he says. “Please. You don't know how *short* it is.” His hair's going white as you watch. {inspire all, +sable_weak, hurt 1d4 necrotic one}
> Ask the men what they want | persuasion 13 | You ask it through the door, loudly. It's Rudge who answers. “I'd want to go *home*,” he says. “If there was any.” The whistles all fall silent. {+men_turned, inspire all} // They look at the floor. It's sawdust.
win: On the desk, the charter: all felling rights in the Hither Wood, granted to Sable by Lord Averill of Thornwick, “the old obligations being void, no King having been rendered”. {+charter, note charter4, gold 40, magic, open hall, done}
end [windfall]: Oswy Thorn comes down to the edge of the stumps himself, alone. Rudge goes up. You can't hear what is said. Rudge shows him the picture in the hat. They shake hands on it: windfall, and coppice, and every tenth log left for the woodlice. That last is Pip's. {+ch3, +coppice, gold 40, xp 90}
end: The saws are quiet. The sixty-one stand about in the ash with their bundles. “Where to?” says Rudge. You wish that you had something better. “Thornwick,” you say. “To complain.” {+ch3, xp 90}
note charter4 = The Thornwick Charter: “…the old obligations being void, no King having been rendered to the said wood in living memory, but only straw; whereof his lordship has taken the advice of counsel.”

== Thornwick Hall | 4 | hall
read: His lordship is At Home. He's a pink, worried, pleasant man who shakes hands with all of you, and tells you about the panelling. He had not known about the snares. He had not known about the nine. He's got a way of not having known that's almost a kind of talent. “My great-grandfather was King, you know,” says Lord Averill. “Of the harvest. It's a charming custom.”
goal: Make Lord Averill of Thornwick give up the wood.
dm: Averill can be shamed, legally bound, or frightened. His daughter Rowan is secretly with the druids. His house is being eaten by ivy from inside. His wife was taken by the wood and he blames it.
-- npc averill @hall:dining | Lord Averill | lord of Thornwick | commoner/king
look: touches the panelling now and then as one might touch a horse
hi: Sit, sit. Claret? It's the oak that gives it that.
? The wood (oaks, charter): It's only *trees*. They grow. One's told that they grow.
? Your wife (lady, portrait): Elowen. She walked in it. Every evening. One evening she didn't come home. (The pinkness goes.) They said: *nobody's ever lost in that wood*. They all said it. I thought, well. Then it's got her. Then it can pay.
? The charter (rights, sign): My man Sable handles all of that.
! She wasn't lost (persuasion 14) [rowan_told]: “She's a druid,” you say. “She's been in the grove for nineteen years. She left because you would not stop.” He looks for some time at the claret. “Is she well?” says Lord Averill. {+averill_broken, xp 120} // “You're very kind,” he says, not hearing.
-- npc rowan @hall:study | Rowan Averill | daughter of the house | commoner/h:druid:human:f
look: has a leaf in her hair that she has given up removing
hi: You've been in the wood. You smell of it. Shut the door, they think I paint.
? The grove (druids, mother): I go out by the ivy. My mother taught me; she's alive, you know. She's *alive*. I'm the only one who knows it and I have dinner with him every night. {+rowan_told, xp 60}
? The panelling (ivy, house): It's started to bud. Behind the wainscot. I can hear it when I'm in bed. I think it's going to be a wood again whether we're in here or not.
? Oswy (huntsman, plan): He means to call the Hunt, the real one, at Samhain. Through Hazelmere. My mother won't have it. The grove's split. You'd better be quick.
-- scene gate4 @hall:start many | Thornwick
say: A moat, a bridge, a butler. The butler has a twig growing from his cuff. He has decided not to mention it.
> Mention it | persuasion 11 | “It came on Tuesday, sir,” says the butler, low. “The footman's got blossom. We've not liked to trouble his lordship.” {+butler, xp 30} // “I could not say, sir,” says the butler, and folds the cuff.
> Ask for the Hall's accounts | deception 13 | He assumes that you're counsel. Everyone's always counsel. You're given an hour with the rent-rolls; they're appalling. {+rentroll, xp 40} // “His lordship's man has those,” says the butler.
> Present the charter [charter] | | He reads it. He is the first person in that house who's read it to the end. “*Void*,” says the butler. “Well, well.” He holds the door very wide. {+butler, xp 40}
-- fight gamekeepers @hall:armory | The Keepers | scout*, veteran | medium
say: Six men in green, cleaning guns that aren't for rabbits. Their head has a lord's gilt spur on one boot and nothing on the other.
> Give him back the spur [spur] | | He turns it over. He knows where it was found, and what that means about his brother. He sits down. “You'd better go up,” he says. {skip, xp 60}
win: In the gun-room book, under *Vermin*: badgers, kites, a figure they've written as “deerskin man, winged”.
-- trial supper @hall:hall | The Averill Supper | 4 before 3
say: Thirty neighbours, nine courses, and a toast to *Prosperity*. You're expected to sing for your supper. Every one of them has shares.
try: performance 13 The song about the nine men
try: persuasion 13 Talk to the wives
try: history 13 The old bargain, as an anecdote
try: insight 13 Find the one who can't sleep
try: deception 13 Sell them short
win: By the cheese there are eleven people who'd like, quietly, to be out of timber. You watch it go round the table like a draught. {+shares, xp 100}
lose: They clap in the wrong places. Under the cloth something with tendrils takes hold of your ankle in sympathy. {hurt 1d8 bludgeoning one}
-- puzzle portrait @hall:library | The Covered Portrait
say: In the library, a picture under a cloth, and on the frame a cipher of acorns and leaves. Rowan says that her mother painted it, and hid something in the back, and the catch is a word. “She said: it's what I am, it's what he says I am, and it's what the wood has never let anyone be.”
answer: lost
hint insight 12: They said it to him so many times. *Nobody's ever—*
hint investigation 12: Four letters. The acorns have been pressed in order.
wrong: A thorn, neatly, under the nail. {hurt 1d4 piercing one}
win: The back opens: a bundle of letters, all to him, none of them sent; and the deed of the Hither Wood, which had been hers to begin with. {+deed, xp 120, note elowen}
lose: You break the frame. It's very good oak, and it says so. {+deed}
-- fight ivy @hall:bedroom | The Panelling | shrieker, violet_fungus*, snake | hard
say: It's not waiting any longer. The wainscot bulges, and buds, and the whole of the east wing starts to be a wood.
> Open the windows | | All of them. It had only wanted the light. It goes out past you like a sigh, and over the sill, and stops. {skip, inspire, xp 60}
win: Behind the panels there's a nest with a wren sitting in it, extremely cross.
-- scene butlertree @hall:kitchen [butler] | Below Stairs
say: The whole staff, in a row, in blossom. They'd be obliged for your opinion.
> Tell them to give notice | | They've been wanting to, for years. They hang their aprons on the butler. He's rather good at it. {+staff_gone, xp 50}
> Prune them | medicine 12 | You do it kindly, above the bud. The cook cries; but it's from relief. {+pruned, inspire, xp 50} // It hurts them, and it grows back in front of your eyes.
-- boss sable4 @hall:throne [deed or averill_broken or shares] | The Advice of Counsel | Counsellor Vex = mage!, thug*, animated_armor | deadly
say: “His lordship regrets,” says a smooth young man with Sable's eyes, “that he's indisposed.” He has on his lap a sapling in a pot, with taps. There's one in every room of the house. They've been quite discreet. “You killed my brother. We had a hundred and ten years on the clock.”
> Read her letters aloud [deed] | | You read the first. From behind him comes a sound; and Lord Averill, in his nightshirt, pink as a child, takes the poker to the first pot. Then the next. {inspire all, +averill_acts, xp 80}
> Break the pots | acrobatics 13 | It's like breaking clocks. Each one lets out a year, and it goes by you with its own smell. The counsellor's hands begin to spot. {inspire all, +pots} // You've broken one, and he's seen you do it.
win: He goes to dust all at once, with an expression of the greatest professional annoyance. {+counsel_down, gold 90, magic, done}
end [deed]: The deed was never Averill's to sign. It was hers; and Rowan's; and Rowan, standing in the ruins of the panelling with her hair full of leaves, gives it back. “Tell my mother,” she says. “No. I'll tell her.” Lord Averill goes with you as far as the bridge. He'd like to go further. He isn't sure that he's allowed. {+ch4, +wood_free, gold 60, xp 110, open barrow}
end: He'll cut no more. He's no one left to cut it, and no one left to tell him that he didn't know. But the Hunt isn't called off. “It was never the oaks,” says Rowan. “It's the *King*. You'd better find out what a King was.” {+ch4, gold 40, xp 110, open barrow}
note elowen = Elowen's Letters: “My dear. I'm quite well. I can see the house from here when the leaves are down. I thought you would come and look for me, and then we should have had to talk. I still think so, every autumn.”

== The First King | 5 | barrow
read: *Alder. Came home.* It's the one line in the book that isn't straw. The barrow where they put him is a mile beyond the village and nobody has ever robbed it, which in a poor country is remarkable. When you move the stone, warm air comes out, and the smell of bread.
goal: Learn from the First King what the bargain was.
dm: Alder is at peace; his guardians (his own grateful people) are not: they sealed him to keep the secret that going was voluntary and joyful.
-- npc keeper @barrow:start | Old Marl | barrow-keeper, very dead | skeleton/skeleton
look: has knitted himself a scarf, out of roots
hi: You'll be wanting the King. They all don't.
? Alder (king, first): Lovely man. Couldn't carry a tune. He gave his year, and he came home brown as a nut, and it was twins in every cottage. *Then* they got frightened.
? Frightened (who, people): Well, suppose that he hadn't come home? Suppose it was *your* boy next? So they made it straw. And they walled me in here to keep people from asking him. I was only sixteen. I don't hold a grudge. I hold a broom.
? The way (down, tomb): His friends are between you and him. They loved him so much that it went bad.
-- scene bread @barrow:kitchen~.15 | The King's Loaf
say: On a stone, a loaf, hot. There's no oven. There's a knife, and a place laid, and a pot of something made of strawberries.
> Eat, and leave half | | It's the best bread you have ever had. You leave half. When you look back there's somebody, very faint, spreading it. {+ate_half, heal 10, inspire all, xp 50}
> Eat it all | | It's the best bread that you've ever had. There's a draught. {heal 15}
> Take the knife | | It's bronze, and it cuts nothing but bread. {+breadknife}
-- fight friends @barrow:.25 | The Friends at the Table | skeleton*, wight | medium
say: A feast of the dead, all facing the door. They raise their cups. *Nobody*, they say, quite kindly, *is to trouble him.*
> Give them the toast | performance 13 | “To Alder, that came home!” They drink. You see them think it over. It isn't what they've been saying. {skip, xp 60} // “To *absent* friends,” says one, and gets up.
win: Under each chair a little heap of straw.
-- puzzle spindle @barrow:library~.38 | The Plaiter's Door
say: A door of three woven strands, bronze, in a plait, the end left loose. Beside it the harvest verse, as far as Annis knows it. It wants the last line. “Straw for the man and straw for the day, straw for the running and straw for the play, straw for the King that we send on his ways—”
answer: and horn for the man who stays|horn for the man who stays|horn for the man that stays|horn for the one who stays
hint history 12: It rhymes with *days*. Annis hums it.
hint insight 12: The whole verse is about pretending. The last line is about the one who isn't.
wrong: The bronze tightens about your wrist like a child's hand, and then like a man's. {hurt 1d8 bludgeoning one}
win: The plait undoes itself, strand by strand. {xp 90, +plaitdoor}
lose: You cut it. It plaits itself again, behind you, tighter. {+plaitdoor}
-- fight roots @barrow:.5 | What Feeds on Grateful Dead | ghoul*, violet_fungus, ghast | hard
say: It came in by the drain. It's been eating gratitude for three centuries, and it is as fat as butter.
win: The drain wants clearing. Marl says that he'll see to it.
-- trial year @barrow:.62 | The Year in the Wall | 5 before 3
say: The passage is painted with Alder's year, and you go through it as he did: snow, then mud, then green. By May it's hard to remember that you've a name. By August you don't mind.
try: nature 13 Know the signs
try: animal 13 Go as the beasts go
try: survival 13 Eat what there is
try: insight 13 Remember that you mean to go home
try: athletics 13 Keep the stag's pace
try: performance 13 Hum the tune
win: And then there's smoke, and stubble, and a woman at a door with barley in her hair; and you've never been so glad of anything. You come out on the far side with leaves in your pockets. {+lived_year, inspire all, xp 150}
lose: You stay in November. It lets you out at last, a good deal colder. {hurt 3d6 cold all con 13}
-- fight sons @barrow:.75 | The Eleven Who Were Afraid | wight*, shadow | hard
say: Here are those who made it straw: eleven fathers, in their best. They're standing in front of the last door with their arms out, and each of them has a boy's cap in his hand.
> Tell them about Jem | persuasion 14 | “He went,” you say. “He didn't know, and he bowed, and he went.” They look down at the caps. “*Whose* was he?” says one. “Hale's,” you say. A man at the end puts on his cap, which is too small, and stands aside. They all do. {skip, xp 100, +fathers} // “*Not mine*,” they say. “*Not mine. Not mine.*”
win: Eleven caps. You hang them on the door.
-- scene alder @barrow:throne~.88 | Alder
say: He's lying on a bed of barley with his boots off. He's brown as a nut. He opens one eye. “Is it *morning?*” says the First King of the Harvest.
> Ask him what it was for | | “It wants *company*,” says Alder. “That's all. It's very big, and it's very old, and it had never been anyone. So I went and was it, for a year; and then I'd had enough, and it'd had enough, and I came home. It was no trouble. It's a bit like minding a baby.” {+company, xp 150}
> Ask if Jem can come home | insight 12 | “Course he can. Year and a day. Or if someone'll spell him.” He yawns. “You can take it in *turns*, you know. I always thought they'd take it in turns.” {+turns, xp 150, inspire all} // “Who's Jem?” says Alder.
> Tell him it's been straw for three hundred years | | He sits right up. “*Straw?*” he says. “The poor old thing. No wonder it's *cross*.” {+poorthing, inspire, xp 80}
win: He gives you a crown: hazel, plain, with the nuts on. “That's the real one,” says Alder. “It doesn't hurt. Who told them that it hurt?” {+realcrown}
-- boss barrowking @barrow:last | The Grateful Dead | The Steward of the Barrow = wraith!, wight, skeleton* | deadly
say: You turn to go; and there's a man in the doorway who was Alder's steward, and loved him, and lied for him, and can't be doing with its all having been for nothing. “He's *tired*,” says the Steward. “He's not to be *asked things*.”
> Let Alder speak to him | | “Ned,” says Alder, from the bed. “Ned. I was *happy*.” The Steward doesn't know what to do with his hands. It takes all the heart out of him; but he's been so long in that doorway. {inspire all, +ned, hurt 1d4 necrotic one}
win: He's dust. Behind you Alder has gone back to sleep with his feet crossed. {+steward_down, magic, gold 50, open grove, done}
end: Outside it's snowing, and shouldn't be. A crow with a druid's voice says to you, out of the top of a thorn, “The grove has met. They've split. Thorn's calling the Hunt. Elowen says come *now*.” {+ch5, xp 130}

== The Drowned Grove | 6 | grove
read: The grove is where the river used to be. There are forty druids in it, and two camps, and down the middle a rope. On the one side they're sharpening things. On the other there is a woman of fifty with paint on her sleeve, painting: the house, from a long way off, in winter, with one window lit.
goal: Win the druids of the Drowned Grove, or as many as you can, before the Hunt is called.
dm: Elowen leads the moderates. Oswy's hounds and wolves are at the horn. Each side has a claim. Track 'moot' points.
-- npc elowen @grove:.1 | Elowen | a druid of the grove | druid_npc/h:druid:human:f
look: doesn't put down the brush
hi: You've met my husband. How's his cough?
? The Hunt (horn, samhain): Once it's called it goes through whatever's in front. It doesn't know Corder from a cradle. Oswy thinks he can steer it. I love Oswy. He can't steer a *gate*.
? The King (jem, crown): They've got him by the horn-stone. He's being very good. He moved some slugs.
? Your family (rowan, averill): She told me. And he came to the bridge? (She paints for a while, rather badly.) Well. It's a start. It's only nineteen years.
! Will you speak for us (persuasion 13): “I'll speak for the *baby*,” says Elowen. “It's what it is, you know; Alder had it right. One doesn't sacrifice to a baby. One picks it up.” {add moot 1, xp 80} // “I've been speaking for nineteen years,” says Elowen. “I've got hoarse.”
-- npc bran @grove:.3 | Bran Sedge | hound-master | druid_npc/h:ranger:half_orc:m
look: has a lame red-eared hound asleep on his feet and can't move
hi: Shh.
? The hound (lame, carried): She's told the others. They've been talking about it. I've never known hounds talk about *anything* that wasn't dinner.
? Oswy's side (horn, hunt): My sister's lad sat down in some bluebells. I'm for the horn.  I was for the horn.
! He sat in the camp (insight 13): “*Our* side did that,” you say. “The wood. It wasn't Thornwick.” He looks at the hound. “I know it,” says Bran. “I've been trying not to.” {add moot 1, xp 80} // “Shh,” says Bran.
-- scene rope @grove:start | The Rope
say: You've got to go in on the one side or on the other. They are all watching to see which.
> Elowen's side | | There's soup. {+side_e}
> Oswy's side | persuasion 12 | There's a silence. Nobody comes in on that side, to *talk*. Somebody moves over on a log. {add moot 1, xp 50} // They let you sit. They don't stop sharpening.
> Walk in along the rope | acrobatics 12 | You go down it heel and toe with your arms out. There's no law against it. Somebody laughs; then on the other side somebody else does. {add moot 1, inspire all, xp 60} // You fall off. On, as it turns out, both sides.
-- fight bog @grove:cave~.28 | The Old River | lizardfolk*, crocodile, snake | medium
say: The river remembers its bed, and so do the things that lived in it, and they've not been told about the rope.
win: You've cleared the spring. Both sides drink from it, without looking at each other. {add moot 1}
-- trial moot @grove:hall~.42 | The Moot | 5 before 3
say: It's held in a hollow oak, and the rule is that you speak standing on one leg, so that nobody goes on.
try: persuasion 13 The case for the baby
try: nature 13 The case from the wood
try: history 13 Alder came home
try: religion 13 Bless both sides
try: insight 13 Say what they are afraid of
try: acrobatics 12 Stand there, longest
win: When the last hand goes up it's twenty-six to fourteen. The fourteen don't say anything. One of them goes and unties the rope at his end. {+moot_won, add moot 2, xp 150}
lose: It's nineteen to twenty-one. Nobody's pleased, least of all the twenty-one. {xp 50}
-- fight thorns @grove:.55 | The Fourteen | scout*, druid_npc, dire_wolf | hard
say: Some don't stay to be counted. They're on the path to the horn-stone, with their hoods up, and their beasts.
> Let them see the crown [realcrown] | | Hazel, with the nuts on. The eldest puts out a hand to it. “But that's *ours*,” he says. “That's off the tree by the *ford*.” They'd always pictured gold, and blood. {skip, add moot 1, xp 100}
win: They'll live; you carried them to the spring. It's the law.
-- puzzle horn @grove:shrine~.68 | The Horn-Stone
say: A horn as long as a man lies in a cradle of rock; Jem Hale is sitting beside it with slugs on his knees. The cradle's locked with runes, in the shape of a question. “I have a crown and no head. I have a heart and no breast. I'm dressed in the heat and I strip for the snow. Every year I'm given straw. What do I want?”
answer: company|a king|someone|a friend|to be someone|somebody
hint nature 12: The first three lines are a tree, any tree, the wood. It's the last line that matters.
hint insight 12: Alder told you. Jem, if you look at him, is already doing it.
wrong: The horn sounds, half a breath, by itself. Every hair that you've got stands up and looks round. {hurt 2d6 thunder all con 12}
win: The cradle opens. It's only a horn. Jem wipes the mouthpiece for you with his sleeve. {+horn_ours, xp 150, inspire all}
lose: It comes out with a crack. There's a chip in the rim now. It'll blow sharp. {+horn_sharp}
-- scene jem6 @grove:.78 | Jem Hale
say: He's nine feet tall. He's moved over to make room for you.
> Give him his mother's love, and a crust | | He holds it. It's about the size of his thumbnail. He eats it one crumb at a time, shutting his eyes. {+jem_crust, inspire all, xp 60}
> Ask if he wants to come home | insight 12 | He thinks. He points to the wood: he makes a shape, with his arms, like someone holding a baby; he makes the face of somebody whose arm's gone to sleep. *Soon*, he says. It's the first word that he's got the mouth round. {+jem_soon, xp 100} // He holds your hand. He doesn't know his own strength; but he tries.
> Offer to spell him [turns] | | His whole face lights up. Then he looks at how big you are, and gently pats you on the head. But he's pleased. He's told the wood; you can feel it look. {+offered, inspire, xp 100}
-- boss thorn6 @grove:last | The Huntsman's Choice | The Huntsman's Bear = owlbear!, dire_wolf*, druid_npc | deadly
say: Oswy Thorn is standing on the last rock with a second horn, a small one: a boy's, for calling pigs. “It'll come to anything,” he says, “if you *mean* it. I'm sorry. I've been reasonable for twenty years.” He puts it to his lips, and something the size of a haystack gets up behind him to see that you don't stop him.
win: It's down. But he's blown it. It's a silly, wavering, pig-calling note, and it goes on and on; and the sky over Hazelmere answers. {+hunt_called, magic, gold 70, done}
end: “I meant it,” says Oswy, looking at the little horn. “Oh, God. I did mean it.” There's hooves in the cloud. You have until moonrise. Elowen's already rolling up her painting. “*Well?*” she says, to forty druids. “Pick it *up*.” {+ch6, xp 150}

== The Wild Hunt | 7 | hazel
read: Hazelmere at dusk, with the plaits all turned to the wall. They've heard it. Everyone has heard it. Annis Hale is in the middle of the green, plaiting, very fast; and her lips are moving; she's got to the last line. “Somebody's going to have to *stay*,” she says, when she sees you. “Aren't they? I keep coming to it.”
goal: Keep Hazelmere alive until moonset.
dm: Three passes of the Hunt, then choose a new King: Jem, a hero, Oswy, Averill, or 'turns'. The choice flags set the ending.
-- npc corder7 @hazel:tavern | Will Corder | miller | commoner/innkeeper
look: has got honest weights; he's holding one as though it might go off
hi: I remade them. All of them. It seemed like the sort of thing.
? The short measure (weights, scales): Two ounces in the pound. Since my dad. You get so you think that it's what a pound *is*.
? Help (doors, men): Tell me where. I'll not take a torch. What do I take?
! Take a lantern and bring them in (persuasion 11): “In? Off the farms? In the *dark?*” He swallows. “Right,” says Will Corder. “Carry what you can't. Right.” {+corder_lantern, xp 60} // “I'll bar the door,” says Will. “I'm good at a door.”
-- npc rudge7 @hazel:smithy [coppice] | Rudge | coppice-master | veteran/h:fighter:human:m
look: has sixty-one people behind him with billhooks
hi: We've had our dinners. What wants doing?
? A hedge (wall, defend): A *laid* hedge? Round the lot? By moonrise? (He looks at the sixty-one.) Aye. {+hedge, inspire all, xp 60}
-- scene door7 @hazel:out:.1 many | Before Moonrise
say: There's an hour. The hounds are giving tongue, a long way up.
> Turn the plaits round | | You go from door to door. It's a small thing. They don't fight you any more. {+plaits, xp 40}
> Put food out | survival 12 | On every step: bread, milk, a strawberry. *Take nothing that begs.* You're betting it goes both ways. {+steps, xp 50} // There isn't much. You put out what there is.
> Teach them the laws | persuasion 12 | Three. The children get them at once. “*Carry what you cannot mend*,” they shout, up and down the lane, under the noise in the sky. {+taught, inspire all, xp 60} // “What's it *mean*, though?” says someone.
> Lay fires | athletics 11 | Windfall, in nine heaps. {+fires, xp 30} // It's wet.
-- fight pass1 @hazel:out:.25 at_once | The First Pass | dire_wolf*, worg | hard
say: It comes down off the hill like a landslide with eyes.
> Stand on your step with the bread [steps] | | They take the bread. They take it out of your hand. They go on by, and only some of them look back. {skip, xp 80}
win: They wheel, over the church. {+pass1}
-- fight pass2 @hazel:out:.4 at_once [pass1] | The Second Pass | griffon*, dire_wolf | hard
say: Now it's got riders. They are in straw, three hundred of them, with straw faces.
> Throw back your hood and laugh | performance 13 | It's what was done. Pans, and whistles. The whole of Hazelmere does it with you, howling with fright. The straw men falter; they had been Kings for a day, once, and enjoyed it. Half of them ride straight up and off. {skip, inspire all, xp 120} // Nobody can laugh. You make a sort of noise.
win: Straw, blowing along the lane. {+pass2}
-- trial bring @hazel:out:.55 [pass1] | Bringing Them In | 4 before 3
say: There's folk on the outlying farms: you can see the windows. Someone's got to go and get them, under that.
try: athletics 13 Two under each arm
try: stealth 13 Ditch to ditch
try: animal 13 Get the cart-horse to go
try: perception 13 Call the turns
try: persuasion 13 Make Old Betty leave her hens
win: You bring in everyone. You bring in the hens. {+all_in, inspire all, xp 120}
lose: You bring in everyone but one; she wouldn't leave the hens. You go by there at dawn and she's sitting on the step, straight-backed, in bluebells. {hurt 2d8 piercing all dex 13, +lost_betty}
-- scene choose @hazel:out:.12 [pass2] | Who Stays
say: The Hunt stands in the air over the green, wheeling; at the front of it is an empty saddle. It's not angry. It's asking. Jem Hale comes down out of the trees with his arms full of it, tired to death. Annis holds up the crown.
> One of us will take a turn [turns] | | You say it aloud, in front of everyone. Somebody else does. Then Rudge; then Rowan, who's come with her father; and then Will Corder says “What, *turns?* Like a watch?” And hands go up all round the green. You've never seen a wood surprised before. {+turns_taken, inspire all, xp 200}
> Let Oswy go | persuasion 13 | “It should be me,” says Oswy. “I called it.” Annis looks at him for a time; she knew his mother. She has to stand on a box to put it on him. He weeps; and the antlers come in quite small and velvety, and he laughs out loud. {+oswy_king, xp 150} // He can't. He takes a step, and can't. “I love it so,” he says. “I'd never come back.”
> Take the crown yourself | | It doesn't hurt. Who told them it hurt? It's like being picked up; no: it's like picking up. You can feel every bird. Behind your eyes something huge says, shyly, *hello*. {+hero_king, inspire all, xp 200}
> Ask Jem | insight 13 | He looks at his mother, he looks at the trees. *I'll do mine*, says Jem, quite clearly. *I'll do my year. Then someone come.* {+jem_stays, xp 150} // He can't choose. He's so tired. Somebody has to.
win: It's nearly over. There's one thing left that doesn't want it to be. {+chosen}
-- boss hunt7 @hazel:out:.3 later at_once | The Master of Straw | The Straw Lord = chimera!, dire_wolf*, scarecrow = gargoyle | deadly
say: Three hundred years of pretending has a shape. It's been riding at the back. It's got a straw crown, a crown on the crown, and no face whatever, and it doesn't want a *King*. It wants *another one next year*.
win: It burns like what it is. {+straw_down, magic, gold 60}
-- scene after7 @hazel:start [chosen] | The Empty Saddle
say: The saddle's filled. And from the back of the Hunt comes a rustling.
> Turn and face it | | You turn round. {fight hunt7}
-- scene moonset @hazel:out:.08 [straw_down] | Moonset
say: Moonset. It's gone; there's only cloud. The wood is standing at the edge of the stubble, the way that a child stands at a door.
> Go up to meet it | | You go up, all of you, the whole village, with pans. But nobody bangs them. {done}
end: There's a door in the oldest root. It's ajar. Whoever wears it has to be brought in, and introduced; and there's something in there, Elowen says, that's been eating the straw. “It's a *dragon*,” she says. “A small one. I'm sorry; I'd hoped that it was a metaphor.” {+ch7, open heart, xp 170}

== The Heart-Oak | 7 | heart
read: You go in procession as far as the root: the new King, or those who'll share it; Annis, with the crust; forty druids; sixty-one woodcutters; a lord with a cough. It's only you who go on down. Inside, it is all one room, and all one thing, and it's holding its breath.
goal: Bring the King to the Heart-Oak, and drive out what has been eating the straw.
dm: A green wyrmling/young dragon, Verdigris, has fed for centuries on false offerings. It's the real enemy; the wood was only lonely. Bringing company wins.
-- npc wren8 @heart:start | A Wren | king of the birds, by its own account | commoner/imp
look: is about the size of a walnut and extremely angry
hi: WIPE your FEET!
? The dragon (verdigris, green): It says that it's the HEART! It's not the HEART! It's a LODGER!
? The way (down, tree): Left at the owl! Don't SPEAK to the owl!
-- fight door8 @heart:.12 | The Sapwood | violet_fungus*, shrieker, spider | hard
say: It's sick here: it weeps, and the weeping's grown legs.
win: Under the rot there's green.
-- scene owl @heart:library~.22 | The Owl
say: It's as big as a door. It opens its eyes one after the other. “Who?” it says.
> Tell it who | | You tell it. You tell it all of it. It takes a while. “Oh,” says the owl, interested. “I'd only meant *generally*.” It moves over. {inspire all, xp 60}
> Say nothing | stealth 12 | “*Well*,” says the owl, after you've gone by. “No *conversation*.” {xp 40} // “*Who?*” says the owl, much closer.
> Ask it about the dragon | persuasion 13 | “It came in with the straw,” says the owl. “It ate the compliments. It's terribly well-*spoken*. It'll ask you something reasonable. Don't.” {+dontanswer, xp 100} // “*Who?*” says the owl.
-- trial sap @heart:.35 | Against the Sap | 5 before 3
say: The way is up: a hundred feet of living pipe, and something's poisoned it.
try: athletics 14 Climb
try: nature 13 Know where it's sound
try: medicine 13 Clean the wound as you go
try: acrobatics 14 Jump the bad place
try: religion 13 Bless it
try: survival 13 Cut handholds where it won't mind
win: It helps you at the last: a sort of shrug. You come up into leaves. {xp 140, +cleaned}
lose: You come up, green to the gills. {hurt 4d6 poison all con 13}
-- fight scare @heart:.48 | The Straw Men | wight*, animated_armor | hard
say: Each year's King, as he was given: stuffed, crowned, smiling. It's kept every one. It moves them about, to have someone to talk down to.
> Give them the true verse [fullverse or plaitdoor] | | You say the last line. Three hundred straw men turn round to look at what they were instead of. And then they simply stop being pretended. {skip, inspire all, xp 120}
win: You sweep it up. It's what one does.
-- puzzle heart8 @heart:shrine~.6 | What the Wood Asks
say: A chamber like the inside of a nut. It speaks: not in words; you find that you've thought it. *They brought me a thing in the shape of you. I asked it and it didn't say. I've asked it every year.* And it asks you.
answer: hello|yes|i am here|here i am|i'm here|what is your name|who are you|welcome
hint insight 13: It isn't a riddle. It's *shy*.
hint animal 13: What would you say to a very large, very young animal that was hoping that you'd be nice?
wrong: It waits. You can feel it not minding, as hard as it can. {hurt 1d8 psychic one}
win: *OH*, says the wood. Every bird in it begins at once. {+hello, inspire all, heal all, xp 200}
lose: You put your hand on the wall, since you can't think what to say. It turns out that does nearly as well. {+hello, xp 80}
-- fight roots8 @heart:.72 | The Lodger's Furniture | troll, spider*, dire_wolf | deadly
say: It's had three centuries to make itself comfortable. It has staff.
win: The furniture's on fire. It's only the furniture.
-- scene bring8 @heart:.82 | The Introduction
say: The last door before the hollow. Behind you somebody clears his throat. Somebody else has a crust in a cloth.
> Send up the whole village [turns_taken] | | They come up the stair in ones and twos with their hats off. Everyone says who they are. It's getting to be the kind of noise that you have at a wedding. {+whole_village, inspire all, xp 150}
> Go up with the King | | You go up together. It's the third law, really: you just pick up the other end. {+together, inspire, xp 80}
> Leave straw | | You put down a plait of it, for the sake of form. Something in the dark licks its lips. {+straw_left}
-- boss verdigris @heart:throne~last | The Lodger | Verdigris = green_young!, violet_fungus*, spider | deadly
say: In the hollow at the top of the world, coiled on three hundred years of ribbons, there's a dragon the size of a hay-cart and as green as envy. It has a lovely voice. “*There* you are,” says Verdigris. “I've been meaning to have a word about the standard of the straw.”
> Don't answer [dontanswer] | | You say nothing. It asks another. You say nothing. It's the worst thing that's ever happened to it. It begins to explain itself; its voice goes up; by the end it's just a lizard, shouting. {inspire all, +unanswered, xp 100}
> Let the wood answer [hello] | | *I DON'T THINK I LIKE YOU*, says the wood, finding it out. All the branches close. {+wood_fights, hurt 1d4 poison one, inspire all, xp 100}
> Serve it notice [deed or wood_free] | persuasion 14 | You read it the deed. *Sole occupancy.* It's so outraged that for a moment it forgets to breathe. {inspire all, +notice} // “*Charming*,” says Verdigris.
win: It goes down through the branches, a long way, breaking every one. The light comes in after it. {+lodger_out, done}
end: It's very quiet. Then it's not; there's a wren. {xp 250}
ending [turns_taken]: Turn and Turn About | They drew up a list. It's on the chapel door, with a thorn: a month each, to start with, and Will Corder's down for February, “as nobody else would want it”. Jem Hale came home on a Tuesday, with velvet on his forehead, and slept for a week. He moves worms off the path. So, now, does everybody. It's been twins in every cottage.
ending [hero_king]: The King Who Stayed | You gave it a year and a day. You can't describe it, and you've stopped trying; but there's a place just behind your eyes that's always green. You came home at harvest, brown as a nut. Annis had kept you some crust. It's somebody else's turn now; you find, at about this time of the evening, that you've walked up to the edge of the stubble, and are saying hello.
ending [jem_stays]: A Year and a Day | He did his year. Every week there was something on Annis's step: a feather, a nut, a strawberry in December. At the next harvest the whole of Hazelmere went up to the trees, and nobody chased anybody. There was a bit of an argument about who'd go. Everybody wanted to.
ending: The Huntsman's Year | They say that Oswy Thorn is the best King there's been since Alder, and a terrible one for forgetting to come in. The Hunt rides still, on Samhain; it goes round. If you leave your door open there'll be a hound asleep by the fire in the morning. It isn't any use telling it to go home. It is.
`;export{e as default};