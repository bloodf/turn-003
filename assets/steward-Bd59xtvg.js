var e=`id: steward
title: The Dragon's Steward
code: R13
levels: 5-11
tags: dragon, estate management, civil war
tone: light
ink: #5c1a10 #f5c542
pitch: A red dragon has hired you to find out who is robbing it. It's in rather a bad temper. You have references to think of.
about: Kharzul the Red has ruled the Smoking Vale for six hundred years. Taxes are low, bandits are unheard of, and every tenth year somebody is eaten by lot. Now a coin a night has been going missing from the hoard, and it can count.
about: The Dragon's Steward puts the heroes in a gold chain of office and gives them a valley to run. Rents, marriages, a rebellion, an audit; and, at the end of it, a decision about the landlord.
villain: Kharzul | red_adult | wants an heir it can bear to be in the same room with | is dying, and would sooner burn the Vale than say so
patron: Kharzul | landlord of the Smoking Vale
secret: The thief is Kharzul's own daughter Ember, a wyrmling raised by a shepherd who found the egg Kharzul had thrown away. She's been taking one coin a night because she wanted something of her mother's to sleep on.
place vale = Ashmarket | village size=3 seed=ashmarket-6 biome=autumn time=9 open=yes | A tidy market town with iron roofs, and a painted line down the middle of every street with STAND HERE DURING PASSES.
place hall = Coinhall | castle size=1 seed=coinhall-4 style=ashlar roofs=battlement moat=no biome=autumn time=15 fams=kobold+knight pop=.14 folk=yes | The Steward's house. It's got nine predecessors' portraits up the stairs. The frames are singed.
place hoard = The Hoard | dungeon size=3 seed=hoard-8 theme=infernal caves=.5 fams=kobold+elemental+infernal pop=.4 | It isn't heaped. It's *filed*. There's a card index as tall as a house, and a smell like a struck match.
place hills = The Sheepwalks | wilds size=2 seed=sheepwalk-5b biome=temperate theme=overgrown time=12 fams=beast+wild+bandit pop=.4 | Green hills, white dots. Some of the dots are running.
place mill = The Rebels' Mill | dungeon size=2 seed=rebmill-3 theme=stone caves=.3 fams=bandit+knight pop=.45 | There's a password. It's written up over the door; they kept forgetting it.
place keep = Castle Damask | castle size=1 seed=damask-7 roofs=cone moat=yes biome=temperate time=18 fams=knight+bandit pop=.2 folk=yes | The neighbouring Duke's. It's got a dragon's skull over the gate. It's plaster.
place egg = The Cold Nest | dungeon size=2 seed=coldnest-9 theme=frost levels=2 caves=.5 fams=elemental+frost+beast pop=.5 | The back door of the mountain. It's where she'd throw out what she didn't want.
place fire = The Throat | dungeon size=3 seed=throat-2 theme=infernal levels=2 caves=.45 fams=elemental+infernal+fiend pop=.5 | You go in between the teeth. It's a volcano; it breathes when she does.

== The Situation Vacant | 5 | hall
read: “*You'll be the new ones,*” says a voice that rattles the spoons. It's coming from the fireplace. There's an eye in the grate, gold, about as big as the coal-scuttle. “*The last Steward was six coins out. I ate him; I didn't* enjoy *it. I'm ninety-one short now. That's one a night. You have the run of the Vale and a chain. Find out who. I'd rather not have to eat* everybody.”
goal: Take up your duties, and begin the audit.
dm: Meet household: Tock (kobold chief clerk), Mrs. Garland cook, predecessors. Hear petitions. Track 'fair' (people's trust) and 'favour' (dragon).
-- npc tock @hall:library stays | Tock | chief clerk | kobold/kobold
look: has sleeve-garters, a pencil behind each horn, and has served nine stewards and swept up eight
hi: Sign for the chain. It's gold-*plate*. She knows where the real one is.
? The theft (coin, ninety-one): Always from the same drawer. Small silver. One. There's eleven million gold in there. Who takes a *sixpence?*
? The dragon (kharzul, she): She's fair. It's in the lease. She's only ever eaten what it *says*. She's been a bit off her food; don't say I said.
? The lot (eaten, tenth): It's this year. Nine weeks. We draw it out of a hat. I've got the hat. I wash it.
! Is she ill (insight 14): Both pencils fall out. “She's *tired*,” says Tock. “She's had me read her the same page of the rents four times. She coughs and there's ash.” He picks up the pencils. “I've been putting nine in ten in the ledger. For the heat. So she'd not notice she's slower. That isn't *stealing*, is it?” {+tock_knows, xp 120} // “She's *never* ill,” says Tock.
-- npc garland @hall:kitchen stays | Mrs. Garland | cook | commoner/townswoman
look: is roasting nine oxen, without much hope
hi: She sends them back. She never used to send them back.
? Your nephew (rebel, mill): I haven't got a nephew. He's not at the mill. It isn't *Tuesday*.
? The last steward (eaten, mr): Mr. Pym. Lovely manners. He said grace.
? The lot (hat): My mother was drawn. She went up in her good hat. They say that she gave her such a *talking* to. {+mother_hat}
-- scene petitions1 @hall:throne many | Petitions
say: It's Monday. There's a queue. You've a chair, a bell and the power of life and death over eleven parishes.
> A dispute about a hedge | insight 13 | It isn't about the hedge. It's about who was asked to whose wedding, forty years back. You marry off the grandchildren. {add fair 1, xp 80} // It's a very *long* hedge.
> A widow who can't pay | gold 25 | “What, *you're* paying it?” says Tock. He looks for a column to put it in. There's never been one. He rules it. {add fair 2, inspire, xp 80}
> A man who's found a coin | investigation 13 | It's old silver; it's hers. It was in a sheep. That's to say that it was in the wool. {+sheepcoin, add fair 1, xp 120} // He's found a button.
> Adjourn for lunch | | It's oxen. {add fair -1}
-- fight chimney1 @hall:armory | Something in the Flue | imp, magma = fire_elemental | medium
say: The fire's spat out something that wasn't in the grate.
win: It'd been sent to listen. It's got a bit of a message on: “*—ask them if they're* nice*—*” {+nice}
-- trial ledgers1 @hall:study | Nine Stewards' Books | 4 before 3
say: You've to get the sums to agree by sundown. She'll know.
try: investigation 13 Add
try: history 13 Old money
try: persuasion 12 Get Tock to confess to the rounding
try: perception 13 Spot the wrong nine
try: arcana 13 It's a *charm*
win: It comes out: it's ninety-one short, and not by anybody in this house. You sign; the eye in the grate blinks. “*Hm,*” it says. {add favour 1, xp 150}
lose: You're singed. {hurt 3d6 fire one dex 13}
-- fight kob1 @hall:storage- | The Cellar Faction | kobold*, drow | hard
say: Not all of the clerks are loyal. They've been selling the keys.
win: There's a visiting card: *His Grace of Damask*.  {+damask1}
-- boss assay1 @hall:hall [sheepcoin or damask1 or fair>=2] | The Assayer | Magister Flux = mage!, animated_armor* | hard
say: “Allow me,” says a thin gentleman from over the border, who's come to value the fixtures. “You can't suppose that it's going to *live* for ever. One likes to know what the lead's worth.”
win: In his bag there's a very exact plan of the mountain, and a nine-foot lance head, wrapped in a duchess's stocking. {+lance, +damask1, magic, gold 80, done}
end: “*A sheep,*” says the fireplace, when you've told it. “*I've been robbed by a* sheep.” There's a long rumble. It might be a cough. You've a feeling that it's trying not to laugh; it's out of practice. {+ch1, add favour 1, open hills, xp 140}

== The Sheepwalks | 6 | hills
read: Ashmarket wool's famous. Nobody ever steals a sheep in the Smoking Vale. This year somebody's been *adding* them. “It's Old Hob's flock,” says Tock. “He's got ninety-one more than he ought. They're all a bit... *warm*.”
goal: Find out how the dragon's silver got into a sheep.
dm: Hob raised Ember; he hides her among the sheep. She's warm; each night she brings one coin; he hides coins in fleece. Pursuing dragon-slayers of Damask.
-- npc hob @hills:ruin | Old Hob | shepherd | commoner/h:ranger:human:m
look: has burns to the elbow, and is knitting something with a hole for a tail
hi: Nothing up here but sheep.
? The warm ones (sheep, extra): That's the feed.
? The silver (coin, fleece): I said to her, take it back. She'd cry. It sets light to the hay.
? Who (her, she): My girl. (He puts down the needles.) I found her. There was snow; it was stone cold, it was right at the back of the mountain with the bones. I thought, it's only an egg. I'll have it for my tea. And it *knocked*.
! We won't hurt her (persuasion 13): “You've got *her* chain on,” says Hob. You take it off. He looks at it, lying there in the grass. He whistles. {+hob_trust, add fair 1, xp 150} // “You'd *say* that.”
-- npc bell @hills:out:.35 | Bellwether Jane | a sheep | commoner/villager
look: is chewing, and standing on a lancer's hat
hi: Baa.
? Baa (sheep): Baa.
? The girl (ember): BAA.
-- fight lancers2 @hills:out:.25 | His Grace's Lancers | knight*, scout | medium
say: Six men in black and gold, going from sheep to sheep with a thermometer.
> Turn out your guard: Jane | animal 13 | You open the gate. It's four hundred sheep, it's downhill. {skip, inspire all, xp 100} // She'll not be hurried.
win: They were counting too. They'd got to ninety.
-- scene ember2 @hills:out:.55 [hob_trust or sheepcoin] | Ember
say: One of the sheep is sitting up. It takes off its fleece. She's about the size of a pony; she's red; she's got one tooth coming. “*Are you* nice?” says the dragon.
> “We try” | insight 12 | She thinks it over. She shows you her collection: it's ninety-one sixpences, polished, in rows. “*I sleep on them,*” says Ember. “*They smell of somebody.*” {+ember, inspire all, xp 150} // “*That's what the* last *one said,*” says Ember; she sneezes. {hurt 2d6 fire one, +ember}
> Show her how to do up her fleece | | It buttons at the back. She'd never been able to reach. {+ember, +ember_likes, inspire, xp 120}
> Ask where she gets in | investigation 13 | “*There's a* draught*hole,*” says Ember. “*There's an old lady asleep. She coughs. I tuck her in.*” {+tucks, +ember, xp 180} // “*It's secret,*” she says.
-- trial round2 @hills:out:.7 | Bringing Them Down | 4 before 3
say: There's a storm coming, and it's got lancers in it. Four hundred sheep, ninety-one sixpences and a dragon have to be in a barn.
try: animal 13 Go by
try: survival 13 Read the hill
try: athletics 13 One under each arm
try: performance 12 Whistle
try: persuasion 13 Get her to stop *helping*
win: She's brought in the last six herself, in her mouth. They're quite damp. {+flock, add fair 1, xp 180}
lose: The barn's on fire. It was only a sneeze. {hurt 3d6 fire all dex 13}
-- fight griff2 @hills:.3 | Under the Sheepwalk | griffon, wolf* | hard
say: There's an old barrow where the lancers have been camping; they'd left their mounts.
win: {xp 40}
-- boss captain2 @hills:last | The Warmest Sheep | Captain Orlo Vane = gladiator!, knight*, griffon | deadly
say: “It's for the *good* of everyone,” says a handsome captain; he has got a net. “A queen for a queen. If we've the whelp then the old one'll sign. It won't be harmed; much.”
win: He's got the Duke's warrant on him: *one dragon, small, alive. The mother to follow.* There's a drawing. It's got a ruff on. {+warrant, magic, gold 90, done}
end: So you know who it is. You've got to go and tell a six-hundred-year-old dragon that her thief's her daughter, whom she threw out with the bones. “*Don't say that I took them,*” says Ember. “*Say that I was* minding *them.*” {+ch2, open hoard, xp 180}

== The Audit | 7 | hoard
read: You go down to report. It isn't heaped; it's *filed*. She's lying along the top of the cabinets with her chin on the index. She is the size of a street. Close to, you can see that her scales have gone grey at the edge, like a coal. “*Well?*” says Kharzul. “*Who?*”
goal: Decide what to tell the dragon.
dm: Key decision: tell truth, lie, or stall. Explore hoard; learn of thrown egg and why (her own mother's rule: never more than can be filed). Kobold archivists; fire elementals unionised.
-- npc kharzul3 @hoard:hall~.5 | Kharzul | landlord | red_wyrmling/dragon
look: is a voice; what you're talking to is about the first nine feet of her
hi: Stand on the mat. *That's* what it's for.
? The thief (who, coin): I'm waiting. I've a drawer ready.
? The lot (eat, hat): I don't *care* for it. It was my mother's. One's got to keep something up, or they'd think that one was only *large*.
? Your mother (rule): She'd a motto. *Nothing that can't be counted.* She counted me, every day; until I bit her.
? Children (egg, heir): (There's quite a long silence. It's very hot.) There was one. It was cold. It didn't tap. One can't *file* a thing that's not going to hatch.
! It did tap (persuasion 15) [ember]: You tell her. She doesn't move: she doesn't so much as breathe; all over the mountain the fires go down. “*It* knocked?” says Kharzul. “*And I wasn't* listening?” {+told_truth, add favour 3, xp 300} // “*You're warm,*” she says. “*Step back on the mat.*”
-- scene index3 @hoard:library~.2 many | The Card Index
say: It's as tall as a house. It's every thing that she owns; under each there's what she thought when she got it.
> Look up THE VALE | investigation 14 | “*Found it wet. Drained it. They wave.*” And lower down, quite recent: “*Who's going to look after it?*” {+looksafter, xp 120} // It's eleven drawers.
> Look up STEWARDS | history 13 | Nine. “*Pym: honest; didn't like to say that he'd a bad heart. I thought that he'd been* rude.” It's been underlined so hard that the card's scorched. {+pym, xp 120} // They're under *Meat*.
> Look up MOTHER | | “*See* GRUDGES.” {xp 40}
> File a card of your own | | You put it where she'd find it. EMBER: *knocks*. {+card, inspire, xp 100}
-- fight union3 @hoard:forge~.35 | The Stokers | fire = fire_elemental*, hell_hound | hard
say: They've downed tools. She's cold, she's not paying attention; they want to know where they stand.
> Hear their grievances | persuasion 14 | They'd like Sundays. They'd like someone to say that it's a *nice* fire. You write it all down. {skip, add fair 1, xp 180} // They want it in *asbestos*.
win: They go back in, grumbling, blue.
-- trial draught3 @hoard:.5 | The Draught-Hole | 4 before 3
say: There's a way in at the back that's about as wide as a pony. Somebody else has found it: it's been *chiselled*.
try: stealth 14 Listen at it
try: athletics 14 Block it
try: acrobatics 14 Go through
try: investigation 14 Measure for a lance
win: It's sappers. They've got nine barrels. You've got them. {+sappers, add favour 1, xp 220}
lose: You've found the barrels. {hurt 4d6 fire all dex 14}
-- fight sapp3 @hoard:mine~.68 | Sappers | veteran*, mage | hard
say: Men in black and gold, with felt shoes.
win: You put the felt shoes on. They're very comfortable.
-- puzzle drawer3 @hoard:treasury~.8 | The Drawer
say: It's the one that the sixpences went from. It's not even locked. There's a card at the back, older than all of the others; it's in a very young dragon's hand. “*I've got it, and I can't count it. It's bigger when it's got two of us in. She says that there's no such thing.*”
answer: love|home|a home|a nest|nest|family
hint insight 13: She'd have been about the size of a pony.
hint history 13: “*Nothing that can't be counted.*” So she hid it.
wrong: It shuts on your thumb. It's *heavy*. {hurt 2d6 bludgeoning one}
win: In the drawer there's a bit of eggshell. It's in cotton wool. {+shell, inspire all, xp 250}
lose: You take out the drawer. Behind it there's a bit of eggshell. {+shell}
-- boss lance3 @hoard:last | The Lancer | Sir Peregrine the Slayer = knight!, veteran*, mage | deadly
say: He's got in. He's got the lance; he's a very young man in a great deal of armour. He's standing in front of the index with his mouth open. “*I thought that she'd be* wicked,” says Sir Peregrine. Then he sets his jaw; he's been to a good school.
> Ask him to mind the mat | persuasion 13 | He does. It's habit. He stands on it. “*I say,*” says Sir Peregrine; “*is that* alphabetical?” {skip, +perry, add favour 1, inspire all, xp 250, done} // He's shut his visor.
win: She's watched it all with one eye. “*He'd got his feet wrong,*” says Kharzul. {magic, gold 120, done}
end [told_truth]: “*I don't wish to* see *it,*” says Kharzul. “*I'd only.*” She doesn't say what. “*You'd better find out what it needs. Put it down to sundries.*” {+ch3, add favour 1, xp 220}
end: You tell her that it's in hand. She knows that you're lying. You can see her think about it. “*Nine weeks,*” says Kharzul; and shuts her eyes. {+ch3, xp 200}

== Tuesday at the Mill | 7 | mill
read: There's a rebellion. It meets on Tuesdays. It's got a flag, a pamphlet, a great many passwords and Mrs. Garland's nephew; and since the Duke began to pay for it, it's got crossbows. They've set a date. It's the day of the lot.
goal: Deal with the rebellion, as its landlord's steward.
dm: They've a point. Leader Wat Garland; a Damask agent. Could recruit them.
-- npc wat @mill:.2 | Wat Garland | leader of the rising | commoner/h:bard:human:m
look: is writing on an upturned barrel, and has ink on his nose
hi: The password! No, the *Tuesday* one.
? The rising (rebel, why): My gran was drawn. She went up in her good hat. I don't care how low the rents are.
? The Duke (damask, pays): A friend of liberty. He's sent us forty crossbows. He wants nothing for it; only the *mountain*.
? What then (after, plan): We'd have a committee. We have tried it, on the pamphlet. It took us a month to do the *title*.
! What if there wasn't a lot (persuasion 14): He chews the pen. “There's always been a lot,” says Wat. “If there wasn't, I'd.” You can see him look down the whole of the rest of his life. “I'd probably write about *sheep*,” he says. {+wat, add fair 2, xp 200} // “She'd *say* so,” says Wat.
-- fight guard4 @mill:guard~.15 | The Password | thug*, scout | medium
say: “What's the password?” It's over the door.
> Read it out | perception 10 | “*LIBERTY OR DEATH.*” “Pass,” they say; they're disappointed. {skip, xp 60} // You've read out the name of the builder.
win: You apologise. So do they.
-- scene pamphlet4 @mill:library~.35 many | The Pamphlet
say: A COMPLAINT TO THE WYRM. There are nine drafts.
> Help with it | history 14 | You strike out the adjectives. When you've done there's one page; it's *unanswerable*. You'd sign it yourself. {+complaint, add fair 1, xp 150} // You've added adjectives.
> Put in Mrs. Garland's mother | insight 13 | “*She gave her such a talking to.*” What did she *say?* There's an old man at the back who was the carter. He'll tell you. {+hat_speech, inspire all, xp 180} // They've done her. It's an ode.
> Read the Duke's letters | investigation 13 | It's all liberty, for two pages; then there's a sketch for a *toll-booth*. {+tollbooth, add fair 1, xp 120} // They've been very careful about the seal.
-- fight duke4 @mill:.5 | Friends of Liberty | spy*, veteran | hard
say: The Duke's men at the mill have heard the word “sheep”. They don't care for it.
win: The crossbows are marked DAMASK: PROPERTY OF.
-- trial vote4 @mill:hall~.68 | Any Other Business | 5 before 3
say: The whole of the rising's here; it's standing room. There're a hundred and nine; and a motion.
try: persuasion 14 For the petition
try: performance 13 Gran's hat
try: insight 14 Let the angry ones speak first
try: intimidation 13 Point of order
try: history 14 How the last ones ended
try: deception 13 Lose the minutes
win: They'll march. They'll march *up*, with a page of paper, in their good hats. Wat's got to sit down. {+petition, add fair 2, inspire all, xp 260}
lose: It's forty-nine to sixty. There's a scuffle about who's to hold the flag. {hurt 3d6 bludgeoning all}
-- boss agent4 @mill:last | The Committee of One | Comrade Sable = assassin!, spy*, thug | deadly
say: “I'd hoped for something with a bit more *fire*,” says the treasurer. She's the Duke's; she's always been. She lights it.
win: You get everyone out. The flag's saved. It's the only bit that they'd spelled right. {+mill_done, magic, gold 100, done}
end: You go back to the hall, and there's a letter from the Duke: cream, gilt. He'd be *enchanted* if the Steward would dine. He believes that he's got something that belongs to you. There's a sixpence in it, polished. {+ch4, open keep, xp 230}

== Castle Damask | 8 | keep
read: He's got Ember. He's got her in a ruff, at a little table. There's forty of the best people; she's to do a trick. “*I sneezed,*” Ember tells you across the soup, in a tiny voice. “*I only sneezed, and Hob fell down.*”
goal: Get Ember out of Castle Damask.
dm: Dinner, hostage; Duke Florian is charming, childless, wants a dragon to be taken seriously; hob is wounded in cells; plaster skull; duchess ally.
-- npc florian @keep:dining | Duke Florian of Damask | host | commoner/king
look: is in gold, and is so pleased that you could come
hi: Isn't she *darling?* I'm calling her Florian.
? The mountain (war, want): It's so *unfair*. It has had a dragon for six hundred years; one has a *skull*. It's plaster.
? Hob (shepherd): The rustic? He would hit people. He's below.
? Let her go (ember): To *that?* It threw her on a tip. I'd give her a room. I'd give her a *tutor*. (He means it. It's what's so awful.)
! What would you do with a dragon (insight 14): “Be *feared*,” says the Duke. Then, in quite another voice, “They laugh, you know. At my *calves*.” {+calves, xp 150} // “Oh, everything!”
-- npc duchess @keep:chapel | Duchess Amabel | wife | commoner/h:sorcerer:human:f
look: has one stocking
hi: You'll have found the other one round a lance. I want it back.
? Your husband (duke): He's not bad. He's nobody's ever told him *no*, except for me, and I've got hoarse.
? The way out (cells, hob): The ice-stair; it goes under the moat. I'd a lover. It was a long time ago; he was *extremely* cold.
? Help (ally): I'll do the port. They can't any of them move after I've done the port. {+port, xp 100}
-- trial dinner5 @keep:hall | After-Dinner Tricks | 5 before 3
say: “She'll breathe on the brandy!” cries the Duke. Ember looks at you. She's never done it on purpose.
try: performance 14 Do it yourself
try: sleight 14 Swap the brandy
try: animal 14 Show her how to hold it in
try: deception 14 “She only does it at *dukes*”
try: persuasion 13 A round of applause, for a bow
win: She takes a bow. She does it twice. In the noise you've got her ruff undone. {+bow, add favour 1, inspire all, xp 300}
lose: The brandy's fine. It's the *bishop*. {hurt 4d6 fire all dex 14}
-- fight kennel5 @keep:stable | The Slayers' Mess | knight*, gladiator | hard
say: There're nine; they've all got the tooth of something. It's plaster.
win: You put the teeth in a row. Ember's very interested.
-- scene hob5 @keep:prison- | Hob
say: He's on straw. It's a lance wound, it's gone bad; he's still got the knitting. “Is she warm?” says Hob.
> Heal him | medicine 15 | It's a long night. By the morning he's swearing at you. {+hob_lives, inspire all, xp 280} // You've only got him to sleep.
> Bring her to him | | She lies down all round. She's just as hot as she can be without it hurting. “*I'm* minding *you,*” says Ember. {+hob_lives, inspire all, xp 250}
> Finish the sleeve | | It's to go over the tail. You do it badly. He tells you so. {+hob_lives, xp 150}
-- fight ice5 @keep:storage- | The Ice-Stair | water = water_elemental, winter = polar_bear* | hard
say: It's still there, after thirty years: what'd been meant to discourage the lover.
win: He'd left a glove.
-- puzzle skull5 @keep:study | The Skull
say: The way up's by the gate; the gate's in the skull. It's got a lock that is worked by telling it a truth about dragons. The Duke couldn't ever get it to open from the inside. “*I have it by the ton, and it won't keep me warm. I count it all night, and it never comes out at enough. It isn't gold. It's not* for *gold.*”
answer: loneliness|lonely|time|years|company|sleep
hint insight 14: She lies along the top of the cabinets, with her chin on the index.
hint animal 14: Why d'you suppose that they sleep *on* it?
wrong: A very plaster sort of bite. {hurt 3d6 piercing one}
win: It opens its mouth. It's got Sir Somebody's lunch in. {xp 280}
lose: You push; it's *plaster*.
-- boss florian5 @keep:throne [bow or hob_lives or port] | His Grace Objects | The Damask Engine = iron_golem!, knight* | deadly
say: “You *shan't!*” He's stamping. He's pulled a rope; the wall's come down, there's a thing on wheels: forty feet of brass dragon, with a stove in. “I had it *made!*”
> Laugh | performance 14 | You can't help it. It's got *eyelashes*. All of the best people begin to; you see his face. Then it's the Duchess who goes to him, with one stocking on. “*Florrie,*” she says. “*No.*” {inspire all, +florrie, xp 250} // It isn't funny. It's on fire.
win: The head comes off. Ember's allowed to keep it.  {+engine_down, magic, gold 140, done}
end: You're half-way home when the mountain goes up. It's a column of fire a mile high. “*That's not temper,*” says Tock; he's met you on the road. “*That's coughing.*” {+ch5, open egg, xp 280}

== The Cold Nest | 9 | egg
read: She's sent for the chain. She's drawn the lot herself, says Tock; she's got the paper in her claw; she won't say whose name's on it. There's just one who ever knew what ails dragons. It's her mother. She's in the back of the mountain; where they put what they don't want. “*She's been dead for five hundred years,*” says Tock. “*She's not* well.”
goal: Ask old Vharra what her daughter is dying of.
dm: Vharra, dracolich-like ghost; the cold nest: other eggs; choose to rescue 3 live eggs. Learn: dragons die when their fire has nobody to warm.
-- npc vharra @egg:.75 | Vharra the Elder | her mother | wraith/lich
look: is a great rib-cage, and in it a small blue light, counting
hi: Seven thousand and four. Seven thousand and five. You've made me *lose* it.
? Your daughter (kharzul, dying): It's the cough. We all get it. It's the fire going *in*. You've got to have somewhere to put it.
? The eggs (nest, thrown): One keeps the strong ones. How would you tell which, if you were always *going and looking?*
? Were you ever warm (regret): (The counting stops.) There was once. There'd been a thing that bit me. It was so *small*. I'd to put it down, to hit it. I never picked it up.
! She kept the shell (persuasion 15) [shell]: You show it. The blue light comes right up to the bars. “*She never,*” says Vharra the Elder. “*I* told *her.*” There's a long frosty silence. “*Did it get cold?*” she says. “*When I put her down?*” {+vharra, xp 350, inspire all} // “Seven thousand and six,” says the light.
-- fight out6 @egg:.15 | The Tip | water = water_elemental, winter = polar_bear* | hard
say: Bones; broken crowns; other people's stewards. Something's been living on it.
win: There's a good hat.  {+goodhat}
-- trial slide6 @egg:.3 | The Long Chute | 5 before 3
say: It was meant to be one way.
try: athletics 15 Cut your way up
try: acrobatics 15 Chimney
try: survival 14 Read the ice
try: insight 14 Do as Ember did
try: persuasion 14 Keep each other talking
win: You've come up it. Nobody has, but one; she was an hour old. You can see her claw-marks. {+marks, xp 350, inspire all}
lose: You go down it. {hurt 5d6 cold all con 15}
-- scene eggs6 @egg:nest~.45 | Forty Eggs
say: They're in rows; it's labelled. They're all stone cold.
> Knock on each one | perception 14 | Nothing. Nothing. Nothing. And, very faint, from the back: *tap*. {+threeeggs, inspire all, xp 300} // You go along them all. You think; no.
> Light a fire | survival 14 | You burn your cloaks; your maps. You burn the pamphlet. It's an hour. *Tap. Tap tap.* There're three. {+threeeggs, inspire all, xp 350} // It's too cold for it to draw.
> Have Ember sit on them [ember] | | “*They're only little,*” says Ember. She does it very seriously, with her tongue out. {+threeeggs, inspire all, xp 350}
-- fight frost6 @egg:.6 | What the Cold Sent | frost_giant, white_wyrmling* | deadly
say: A white's moved in. It's been *collecting* them.
win: You put them back in their rows.
-- puzzle ward6 @egg:shrine~.7 | Her Mother's Motto
say: It's cut over the last door, in letters taller than you. NOTHING THAT CAN'T BE COUNTED. Some claw has been at it since: there's a question scratched underneath. “*Then how many did I love?*”
answer: one|1|one thing|just one
hint insight 14: It was so small. She'd to put it down.
hint investigation 14: The scratches are at the height of something the size of a street.
wrong: The cold gets in under your ribs; and counts them. {hurt 6d6 cold one con 16}
win: ONE, says the ice; it's a kind of sob. {xp 350}
lose: Ember sneezes on it.
-- boss white6 @egg:last | The Collector | Ysgrith Pale = white_young!, white_wyrmling*, winter = polar_bear | deadly
say: “*They're mine,*” says something that's the same colour as the wall. “*She threw them* out. *I've got nineteen reds. I keep them just as they are.*”
win: It's broken like a plate. There's nineteen, in the snow behind it, and they're all awake. {+nineteen, magic, gold 150, done}
end [vharra]: “*It's not an illness,*” says Vharra the Elder. “*She's only got nobody to be warm* at. *Take her the little one. And tell her.*” The light goes very small. “*Tell her it was seven thousand and one. I always counted her.*” {+ch6, open fire, xp 330}
end: You know what it is; you can guess the rest. There's smoke over the Vale. The bells are going. It's the day of the lot. {+ch6, open fire, xp 330}

== The Day of the Lot | 10 | vale
read: They're all in the square, in their good hats, each on the painted line. There's Tock, with *the* hat, washed. A hundred and nine rebels have brought a page of paper. The Duke's come, with what's left of an army. The sky's the wrong colour. “*She's drawn it already,*” says Tock. “*She's sent it down. It's sealed.*” He can't get it open. His hands are shaking so.
goal: Get the people of Ashmarket through the day of the lot.
dm: The name is Kharzul. She's coming down to die / or burn all. Must organise. Fire passes. Duke's last charge. Petition read.
-- npc tock7 @vale:tavern | Tock | chief clerk | kobold/kobold
look: has a bit of paper, and is reading it for the ninth time
hi: It's *her*. It's her own name. She's put herself in the hat.
? What does it mean (lot): It means she's coming down. It's in the lease. “*The one drawn shall present itself in the square.*” She's never broken a *clause*.
? She'll burn (fire, vale): She can't help it. It's all got to come *out*. It's six hundred years.
-- scene line7 @vale:start many | STAND HERE DURING PASSES
say: You've an hour.
> Get them below | persuasion 14 | Every cellar in town. They go by streets; they've drilled. Mrs. Garland's got the oxen down there. {add safe 2, xp 150} // They want to *see*.
> Wet the roofs | survival 14 | It's iron. It hisses. {add safe 1, xp 100} // It's the well that you've set fire to.
> Read her the petition [complaint or petition] | | Wat gets up on the barrel. He's got ink on his nose. “*To our landlord,*” he reads. It's a very good page. Right overhead, in the smoke, something's stopped to listen. {add safe 2, +read7, inspire all, xp 250}
> Say what Gran said [hat_speech] | | “*You great lump,*” you shout, “*you don't even LIKE it.*” There's a noise in the cloud like somebody who's been hit with a hat. {add safe 2, +gran7, inspire all, xp 250}
-- fight army7 @vale:out:.3 at_once | The Duke's Last Charge | knight*, veteran, gladiator | deadly
say: He's got to be seen to do something. “*CHAAARGE!*” cries Florian; he's chosen the wrong side of the square.
win: “*I* say,” says Sir Somebody. “Aren't we on the same *side?*” Nobody's sure. It seems a pity to go on.  {+army7}
-- trial pass7 @vale:out:.5 | The First Pass | 6 before 3
say: She goes over: she's the size of a street; it's trailing from her like a torn flag. It isn't *at* you. She's trying to hold it in.
try: athletics 15 Haul them under
try: acrobatics 15 Roof to roof
try: survival 15 Fire-break
try: persuasion 14 Keep the lines
try: medicine 14 Burns
try: religion 14 Call her by her name
win: The church is gone. Everybody's out of the church. {add safe 2, inspire all, xp 450}
lose: The church is gone. {hurt 7d6 fire all dex 15}
-- fight sparks7 @vale:out:.7 | Sparks | fire = fire_elemental*, hell_hound | deadly
say: Whatever she lets fall gets up and runs.
win: You've a bucket in each hand; so's the Duke. He's never held one before. He's rather *good* at it.
-- scene ember7 @vale:out:.4 [ember] | Ember Wants to Go Up
say: “*I'm going to* mind *her,*” says Ember. She's got her jumper on. Hob's on two sticks. He looks at you; he looks old.
> Let her | insight 13 | He does up the button at the back. “*Mind how you go,*” says Hob. {+ember_up, inspire all, xp 250} // “I can't,” says Hob. “You'll need to say it.” You say it. {+ember_up}
> Go with her | | You'll go in by the Throat. She'll go in by the draught-hole. “*Race you,*” says Ember. {+ember_up, xp 150}
-- boss florian7 @vale:out:.85 [safe>=2 or army7] | The Thing With Eyelashes | The Brass Florian = iron_golem!, fire_elemental* | deadly
say: The Engine's caught; the stove's gone wild. It's come down the high street by itself, batting its lashes, looking for something to be feared by.
win: It's the Duke who pulls the plug. He had to put his arm in. “It was a *silly* colour,” says Florian. {+brass7, magic, gold 160, done}
end: She's not come down. She's gone *back*: she couldn't hold it; she's gone back in so as not to. You can hear her, from here. The whole of the Vale's standing in the square with its hat off. “Well, *go on*,” says Mrs. Garland. “You've got the chain.” {+ch7, xp 380}

== The Landlord | 11 | fire
read: You go in between the teeth. It's breathing. It's so hot that the walls run. Somewhere ahead of you something very large is coughing, and then saying, to nobody, quite quietly, “*Excuse me.*”
goal: Reach Kharzul before the fire goes in for good.
dm: Ending: Ember; eggs; who inherits; kill her mercifully; lease.
-- fight throat8 @fire:.12 | The Uvula | fire = fire_elemental*, magma = earth_elemental | deadly
say: It's not an enemy. It's a symptom.
win: You get by while it's swallowing.
-- trial heat8 @fire:.25 | Breathing | 6 before 3
say: In: and you've got to run. Out: and you have got to not be there.
try: athletics 16 Run
try: acrobatics 16 Ledge
try: perception 15 Count the breaths
try: survival 15 Behind the wet shield
try: medicine 15 Know when she'll cough
try: religion 14 Hold on to one another
win: You're through. You've no eyebrows; it's a good look. {xp 500, inspire all}
lose: She coughs. {hurt 8d6 fire all dex 16}
-- fight memory8 @fire:.4 | What She Burned | wraith*, wight, specter | deadly
say: It's all of the tenth-years. They're on the stairs; they've got their hats on. They've come to see.
> Ask Gran to let you by [hat_speech or gran7] | | She's in front. She's just exactly like Mrs. Garland. “*She said sorry, you know,*” she tells you. “*After. I heard.*” They move over. {skip, inspire all, xp 350}
win: You pick up a hat; and put it back on.
-- scene desk8 @fire:library~.52 many | Her Desk
say: She'd been writing. It's a will. It's in triplicate. *To the Vale, the Vale.* *To Tock, my pencil.* There's a line that's been begun eleven times: *To my daughter, whom I*—
> Write it in for her | | You talk about it. It's only one word. You leave her room to change it. {+will8, inspire all, xp 250}
> Put the shell on the page [shell] | | There. {+shell8, inspire all, xp 250}
> Bring out the hoard | athletics 15 | You can't. It's eleven million. But there's ninety-one sixpences in a jumper pocket. {+sixpence8, xp 200} // It's melted.
-- puzzle name8 @fire:shrine~.64 | The Last Card
say: One drawer's left. It hasn't been filed. She's put on it, today's date: “*It costs nothing. I've had the whole Vale's for six hundred years, and sent it back unopened. It's what you do with your hand when you see someone you know, a long way off.*”
answer: wave|waving|a wave|greeting|a greeting|hello
hint insight 13: “*Found it wet. Drained it. They wave.*”
hint perception 12: You do it with your hand.
wrong: It's hot. {hurt 5d6 fire one con 15}
win: You take it with you. On the way, without a word, all of you, one after another, look back down the shaft to where there's a speck of daylight; there's people in it. You wave. {+wave8, inspire all, xp 400}
lose: You take it with you.
-- fight heart8 @fire:.78 | The Cough | balor, fire_elemental* | deadly
say: It's grown; it's six hundred years of fire with nowhere to go. It's got a face like her mother.
> Throw it Vharra's message [vharra] | | “*Seven thousand and one!*” you shout. It stops. It hadn't ever been told. It goes from white to gold; to just warm. {skip, inspire all, xp 500}
win: It goes up the chimney.
-- boss kharzul8 @fire:throne~last | Kharzul | Kharzul the Red = red_adult!, fire_elemental | deadly
say: She's curled right round. She's got her wings over her head. “*Go AWAY,*” says the dragon. “*I was drawn; I shall do it by myself. I don't wish it to be* watched.” She's beginning to shine. “*I'll burn the lot of you. I'm only a* lizard. *I've only ever been* large.”
> Let Ember tuck her in [ember_up or tucks] | | There's a scrabble in the draught-hole. She's got her jumper on. She goes straight up the side of the biggest thing in the world, and treads round and round, and lies down. “*Shove up,*” says Ember. You see it happen: it's like seeing somebody find their pocket. All of that fire turns round. It's got somewhere to *go*. {+tucked, skip}
> Give her the three eggs [threeeggs or nineteen] | persuasion 14 | You put them down, just inside of the claw. They're stone cold. She looks; she's such a long time looking. Then she breathes out: she's never done it so gently. *Tap.* {+hatched, inspire all, hurt 1d6 fire one, xp 500} // “*Don't,*” says Kharzul. “*I'd only* count *them.*”
> Serve her the lease | history 15 | There's a clause. Tock found it. “*The landlord shall be* kept in good repair *by the tenant.*” You've brought a hundred and nine of them. They've brought soup. {+lease8, inspire all, xp 400} // She's eaten better lawyers.
win: It all goes out of her in one long breath: and there isn't any fire in it. {+kharzul_done, done}
end: Outside the smoke's going straight up. Somebody has started to ring what's left of the bells. {xp 650}
ending [tucked]: Kept in Good Repair | There's no lot. There's a committee; it took a month to do the title. The Vale's got a landlord and a half; one of them's the size of a street, and does the accounts; and one's got a jumper on, and *helps*. It's all been refiled. There's a new drawer at the front: it's marked WAVES. On passes, everybody stands on the line with their hat off. It's not in the lease. She dips a wing.
ending [hatched]: Twenty-Two | They're everywhere. They're in the washing. You can't get a sheep to stand still. Kharzul's never had a day's sleep since; she's stopped coughing. She's got them in order: by size; by spots; it's not that, it's that she likes to say the names. Hob's knitted twenty-two. It's the tails that take the time.
ending: The Vale, the Vale | They buried her in the index. It took all of the town. She'd left it to them, in triplicate; they've kept the rents where they were. On the mountain there's a young red, with a patched elbow: she's been seen, of a night, on the roof of the Steward's house, looking in. There's a sixpence on the sill in the mornings. You leave it out; she likes to have somewhere to put it.
`;export{e as default};