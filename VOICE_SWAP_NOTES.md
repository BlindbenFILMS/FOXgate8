# VOICE SWAP NOTES (s150f)
What each fox USED to say before the census recordings replaced it, and whether it touches gameplay. Edit + re-record from here.

RULES IN THE GAME NOW (worlds/meru2-walk.js voxMenu):
- Never removed: PUT ME TO WORK, I'LL TAKE IT BACK, lifts, relic trading, flat keys (THANK YOU FOR THE FREE FLAT / YOUR FLAT), story choices (YOU WANTED A WORD?, KEEP QUIET / TIP OFF..., I WILL FIND OUT.), radio song requests, GOODBYE. These still play their OLD written lines (unvoiced).
- Replaced: the greeting line on the menu (now the census intro) and, in the cluster LOBBIES only, the plain ASK topics (now the census questions).
- Added: census questions as extra choices; the census "put me to work" answer plays BEFORE the job starts (the old job line still plays after it); the census goodbye plays before leaving.
- One-line foxes (doormen, greeters): the old line is gone, they rotate their census lines.
- Live log while you play: localStorage 'meru.voxLog' (what was dropped / kept per fox).

Legend: ⚠ STORY = the old line carried a story hint or quest info that is now gone or harder to hear. ✓ = flavour only.

## vaxReception → gi-glossa (8 census rows)
⚠ STORY
- was HELLO: Welcome to VAX. We sell everything, to everyone. Do you have an appointment?
- was HELLO (repeat): Back at VAX. Everything is still for sale, including the view.
- was HELLO (repeat): The top floor is in a meeting. The top floor is always in a meeting.
- was WORK (kept, plays after census): Penn hires on the top floor. Lift on the left. Up you go.
- was ASK WHAT DOES VAX SELL? → Phones, sofas, soup, satellites. If it exists, VAX sells it. If not, VAX is working on it. (REPLACED in lobby)
- was ASK THE PEARL SAIL NEXT DOOR? → Their own robots locked them out. VAX is not worried. VAX is very worried. Please help. (REPLACED in lobby)
- census now: Welcome to Vax! How may we delight you? / Welcome to Vax. We sell everything, and we sell it beautifully. / Everything, truly. Eight floors of it, and a ninth we do not discuss.

## vaxCEO → gi-vax (10 census rows)
⚠ STORY
- was HELLO: I came down from the top floor to see the lobby. It is smaller than I ordered.
- was HELLO (repeat): Everything in Meru carries the VAX name eventually. You will too. Nicely.
- was ASK WHY SELL EVERYTHING? → Everyone buys something. Simple sums. The Salts and Peppers fight over crumbs. VAX owns the bakery. (REPLACED in lobby)
- census now: Sit down. I know who your father was. / Everything a fox needs, and a great deal that no fox needs at all. / Convenience. The goods are how we deliver it.

## vaxSales → gi-penn (9 census rows)
⚠ STORY
- was HELLO: Penn, head of sales! Heard of the VAX Everything Card? Of course you have. I just told you.
- was HELLO (repeat): Still no card? I will throw in a free VAX pen. It writes. Mostly.
- was ASK WHAT ARE YOU SELLING TODAY? → Socks that never pair wrong. A kettle that sings. A sofa with a phone in it. (REPLACED in lobby)
- census now: Have you seen the new range? / You have not seen the new range. Nobody has. I am showing you first. / Lighter, faster, and in four colours nobody has names for yet.

## vaxSecurity → gi-sec (1 census rows)
✓ flavour
- was SAY: Badge, please. No badge? Smile at the camera, then.
- was SAY: Lobby only. The top floor is by invitation.
- census now: Badge, or a name I can look up. Either is fine.

## psManager → gi-coral-pre (7 census rows)
⚠ STORY
- was HELLO: You! Please! The office robots took over. Drones on every floor, and SUDS-9 is on the roof.
- was HELLO (repeat): Still locked out. My plants are in there. And my staff. Mostly the plants.
- was HELLO (repeat): SUDS-9 was built to clean windows. Now it cleans out offices.
- was ASK WHAT HAPPENED? → A software update at lunch. By two, the robots had the building. By three, the coffee machine. (REPLACED in lobby)
- census now: They are still in there! The whole floor! / The office robots have taken the building. My staff are on the third floor. / The big one is on the ROOF. It was a cleaning unit last week.

## tvManager → gi-tvmgr (8 census rows)
⚠ STORY
- was HELLO: Meru TV, front desk. Quiet, please. We are live in four minutes. We are always live in four minutes.
- was HELLO (repeat): Back again? Smile. Camera two can see the lobby.
- was HELLO (repeat): The anchor reads the news at six and checks his hair at five.
- was WORK (kept, plays after census): Sterling and the Weather Fox are hiring. Studio door, back wall, on the right.
- was ASK WHAT IS ON TONIGHT? → News at six, weather at ten past, and a VAX advert every four minutes in between. (REPLACED in lobby)
- census now: We are live in nine minutes! / Live in nine minutes and my anchor is still arguing about the running order. / Hold the cards and keep them STILL. He reads slower than he thinks.

## tvAnchor → gi-anchor (9 census rows)
⚠ STORY
- was HELLO: Sterling Gloss, Meru TV news. You may know my face. Everyone knows my face.
- was HELLO (repeat): Tonight's top story: me, reading tonight's top story.
- was ASK ANY NEWS? → Robots on a Spire street, bandits in two buildings. And my hair, which is perfect. (REPLACED in lobby)
- census now: Good evening, Meru! / Good evening, Meru. I have been saying that for eleven years. / Which family owns which building. We say associated with.

## tvWeather → gi-weather (7 census rows)
✓ flavour
- was HELLO: Weather Fox here! Sunny, with a chance of me being wrong. Usually right, though.
- was HELLO (repeat): Rain at the lake, sun on the island. The island pays more for sun.
- was ASK WILL IT RAIN? → Look up. If the sky is grey, yes. I went to school for that. (REPLACED in lobby)
- census now: Flat water by noon! You heard it here! / Flat by noon, wind off the ruins by evening, and nobody believes me. / Because I was wrong once, about a festival, in front of everybody.

## tvCamera → gi-camera (1 census rows)
✓ flavour
- was SAY: Careful, the cables. I tape them down, they crawl back.
- was SAY: Smile. Camera two is always on.
- census now: Stand off the cable. Everybody stands on the cable.

## galleryOwner → gi-gowner (9 census rows)
⚠ STORY
- was HELLO: Welcome to the Gallery. Look with your eyes, not your paws. The studios are upstairs.
- was HELLO (repeat): Back to see the art? The art is glad. I can tell.
- was HELLO (repeat): The painter upstairs has been on one canvas for three years. It is a dot.
- was WORK (kept, plays after census): Four jobs down here, two in the studios upstairs. Talk to me at the desk.
- was ASK WHO BUYS THIS ART? → VAX, mostly. They buy a painting a week and hang them in the lifts. (REPLACED in lobby)
- census now: Free to walk through! Please do! / Free to walk through, and the studios at the back are open too. / Hang everything at eye height. Not yours. The AVERAGE fox.

## galleryPainter → gi-painter (7 census rows)
⚠ STORY
- was HELLO: Studio one. I paint dots. One dot, three years. It is nearly done.
- was HELLO (repeat): Today I moved the dot. A little left. Huge day.
- was ASK WHAT IS IT CALLED? → Dot. VAX offered a fortune for it. I said not until it is finished. (REPLACED in lobby)
- census now: Do not look yet. It is not finished. / It is not finished and it will not be finished for a month. / The lake, at the hour when it stops being blue.

## gallerySculptor → gi-sculpt (8 census rows)
✓ flavour
- was HELLO: Studio two. I carve foxes from stone. Hold still. No, you moved.
- was HELLO (repeat): Stone is patient. I am not. We get along.
- was ASK CAN I BUY ONE? → Ask the owner. I only make them. Selling makes me shy. (REPLACED in lobby)
- census now: Mind the dust! It gets everywhere! / Mind the dust. It is in my lungs and now it is in your coat. / I am taking away everything that is not it. That is the whole method.

## gaptManager → gi-gmgr (9 census rows)
⚠ STORY
- was HELLO: Garden Apartments! A lovely, lovely building. Owned by the Peppers. Who are lovely. Please write that down.
- was HELLO (repeat): Oh, you again. Lovely. Nothing to report. Nothing at all. Ha.
- was HELLO (repeat): The rent went up again. Lovely for the Peppers. Less lovely for everyone else.
- was WORK (kept, plays after census): Six lovely jobs! Some down here, two up on floor seven. And FLAT 7 is for rent.
- was ASK WHO OWNS THE BUILDING? → The Pepper family. A legitimate business. I am told to say legitimate. Twice. Legitimate. (REPLACED in lobby)
- census now: Everything is in order! Entirely in order! / Everything here is in excellent order. I want that said first. / The owner. Every month. In writing.

## gaptDoor → gi-gdoor (1 census rows)
✓ flavour
- was SAY: Garden Apartments. The rent never sleeps, so neither do I.
- was SAY: Residents and guests only. You look like a guest.
- census now: Evening. Residents to the left, deliveries behind.

## gaptTenant → gi-gten (9 census rows)
⚠ STORY
- was HELLO: You work for the Peppers? No? Good. The rent went up twice this month.
- was HELLO (repeat): The hot water is cold, the cold water is warmer. The Peppers say it is a feature.
- was ASK WHO IS THE LANDLORD? → The Pepper family. They bought half the island buildings. Nobody knows with what money. (REPLACED in lobby)
- census now: Ask me about the rent! Go on, ask! / The rent went up twice this year and the lift went down three times. / That everything is in order. He says it like a fox holding a door shut.

## relicGarden → gi-relic (12 census rows)
✓ flavour
- was HELLO: Garden Island Relics. The finest pieces in Meru, at the finest prices. Mine.
- was HELLO (repeat): Back already? Island prices change every day. Today they are high.
- was HELLO (repeat): Bring me a relic. I will pay you fairly. Fairly little.
- was WORK (kept, plays after census): Appraising pays. Compare the marks with the card. Talk to me.
- was ASK HOW DO RELICS WORK? → Buy cheap in one cluster, sell dear in another. Prices change each day. Mine stay high. (REPLACED in lobby)
- was ASK WHO ELSE BUYS? → The Ruins Museum and the History Museum. Old Sage and Quill. They pay in history. I pay in gold. (REPLACED in lobby)
- census now: Relics bought and sold! Island prices! / I buy at island prices and I sell at island prices. They are not the same. / Behind the glass. The good pieces never go in the window.

## saltDesk → sa-brine (9 census rows)
⚠ STORY
- was HELLO: Salt Family HQ. Honest business, honest folk. Can I help you, or are you lost?
- was HELLO (repeat): Back again. The family likes regulars. The family remembers regulars.
- was HELLO (repeat): The casino? A family business. Sterling runs the floor. Very honest. Very.
- was WORK (kept, plays after census): The lawyer hires upstairs. Lift on the left. Wipe your paws.
- was ASK WHAT DOES THE FAMILY DO? → The casino, the dump, a few boats. Rumours say smuggling. Rumours should mind their manners. (REPLACED in lobby)
- was ASK THE PEPPERS? → We do not say that name in the lobby. Say it outside. Far outside. (REPLACED in lobby)
- census now: Salt family. Honest business, upstairs. / Salt family offices. Honest business, and I am asked to say that first. / Gambling, mostly. Entirely legal and entirely profitable.

## saltBoss → sa-boss (12 census rows)
⚠ STORY
- was HELLO: Old Salt. I run this family, and this family runs a fair game. Sit, if you like.
- was HELLO (repeat): You are polite. I like polite. Polite lives long in Meru.
- was ASK THE BANDITS? → Somebody took my cousin's building. When I find out who, they will wish they took a holiday. (REPLACED in lobby)
- was ASK THE CASINO? → Sterling runs the floor. The house always wins. That is not crime. That is maths. (REPLACED in lobby)
- census now: Come in, come in. Sit where I can see you. / Everything this family owns, it bought. I want that understood early. / A card room under the square. A waste contract. Some water frontage.

## saltBossBack → sa-boss (12 census rows)
⚠ STORY
- was HELLO: You saved my cousin's building. Sit. In this family, a favour is never forgotten.
- was HELLO (repeat): Back again, friend. The door is always open to you now.
- was ASK WHAT NOW? → Now we find who paid the bandits. Keep your ears open, friend. (REPLACED in lobby)
- was ASK THE SAFE? → A small thank-you is inside. Take it. Do not count it in front of me. (REPLACED in lobby)
- census now: Come in, come in. Sit where I can see you. / Everything this family owns, it bought. I want that understood early. / A card room under the square. A waste contract. Some water frontage.

## saltConsigliere → sa-lawyer (9 census rows)
⚠ STORY
- was HELLO: I represent the Salt family. Anything you heard, we deny. Anything you did not hear, also deny.
- was HELLO (repeat): Smuggling? Boats carry things. That is what boats are for.
- was ASK ARE THE SALTS HONEST? → Legally speaking, yes. Ask me again with a contract. (REPLACED in lobby)
- census now: Nothing on this floor is unlawful. Nothing. / Everything on this floor is lawful, documented, and extremely boring. / That the family holds an interest. Interest is a word I chose carefully.

## saltDoor0 → sa-door (1 census rows)
⚠ STORY
- was SAY: Family business inside. Keep your paws where I can see them.
- was SAY: Old Salt is seeing visitors. Be quick.
- census now: Upstairs is by appointment. Downstairs is fine.

## saltDoor1 → sa-door (1 census rows)
⚠ STORY
- was SAY: Nice day. Keep it nice.
- was SAY: No Peppers past this door.
- census now: Upstairs is by appointment. Downstairs is fine.

## saltCousin → sa-cousin-pre (10 census rows)
⚠ STORY
- was HELLO: Psst. Over here. Bandits took the Salt Building last night. Family business. Embarrassing family business.
- was HELLO (repeat): Still in there, eating our biscuits. Nobody takes Salt biscuits.
- was ASK WHO ARE THEY? → Hired bandits. Somebody paid them. Somebody with a very spicy name, if you ask me. (REPLACED in lobby)
- census now: They are in my building! Right now! / Bandits took the building two nights ago and the family will not move. / Because moving looks like what everybody already says we are.

## saltCousinIn → sa-cousin-post (9 census rows)
⚠ STORY
- was HELLO: You did it! The building is ours again. Even the biscuits survived. Mostly.
- was HELLO (repeat): Welcome back, friend of the family. Tea? Biscuit? Both?
- was WORK (kept, plays after census): No jobs yet. The family is still sweeping up bandit crumbs. Soon.
- was ASK WHO SENT THEM? → The boss said a spicy name before he ran. Old Salt is not happy. (REPLACED in lobby)
- was ASK THE FORKLIFT? → Bent forks, flat tyre. The dump foreman says he can fix it. (REPLACED in lobby)
- census now: Open again! Come in and see! / Open again, and I am running it myself. The family did not do that. You did. / Front desk, and say good morning to everybody who comes in.

## tabEditor → sa-editor (9 census rows)
⚠ STORY
- was HELLO: Meru Buzz! Every rumour, first and mostly true. Got any gossip? I pay in clicks.
- was HELLO (repeat): You again! Any dirt? Salt dirt, Pepper dirt, I take all dirt.
- was HELLO (repeat): Today's headline: SALT AND PEPPER FEUD HEATS UP. Same as yesterday. Clicks are clicks.
- was WORK (kept, plays after census): The Rumour Reporter and the intern are hiring. Office door, back wall, on the right.
- was ASK WHAT IS THE BIG STORY? → Salt says Pepper sent the bandits. Pepper says Salt sent them first. Both say no comment. (REPLACED in lobby)
- census now: Have you heard? Of course you have! / Everybody has heard. Nobody has read it. That is my entire business. / Two families, one dump contract, and a word nobody will say on air.

## tabReporter → sa-reporter (9 census rows)
⚠ STORY
- was HELLO: Rumour reporter! I heard you know Hope AND Noble. Spill. Off the record. On the record.
- was HELLO (repeat): Today's rumour: the dump hides a smuggler tunnel. Source: me. Earlier: also me.
- was ASK IS ANY OF IT TRUE? → Some of it! Which part is the fun part. Click to find out. (REPLACED in lobby)
- census now: I heard something. I always hear something. / I hear things at the dump, at the cage, and on the ferry. Mostly the ferry. / That a cleaning machine was given a target and never given a stop.

## tabIntern → sa-intern (1 census rows)
✓ flavour
- was SAY: Hi! I am the intern. I make coffee and typos.
- was SAY: The editor is gossiping. Back in an hour.
- census now: I am not allowed to confirm anything. Hello.

## dumpForeman → sa-foreman (10 census rows)
⚠ STORY
- was HELLO: Town Dump, Salt Waste Services. We take it all. Mind the trucks, and the smell.
- was HELLO (repeat): Back again? Most folk visit once. The smell decides.
- was HELLO (repeat): Everything in Meru ends up here sooner or later. Even the sofas from VAX.
- was WORK (kept, plays after census): Six jobs in the yard. Sort, crush, dig, drive, fix and shoo the gulls.
- was ASK FOUND ANYTHING GOOD? → The pickers turn up old relics now and then. Take them to a relic store. Not to me. (REPLACED in lobby)
- census now: Tip at the far end! Mind the gulls! / Tip at the far end and mind the gulls. They are worse than the rats. / Sort metal from everything else. Metal pays and everything else costs.

## dumpPicker → sa-picker (10 census rows)
⚠ STORY
- was HELLO: Scrap picker. One fox's junk is another fox's relic. Sometimes really.
- was HELLO (repeat): Found a gold spoon today. Then a normal spoon. Then a boot.
- was ASK ANY RELIC TIPS? → Old crates from the ruins end up here. The relic stores pay. The island pays most. (REPLACED in lobby)
- census now: I find things! Good things, sometimes! / Foxes throw away relics. Not often. Often enough that I keep looking. / A sealed pin, last spring. The Sage paid full worth and asked where.

## dumpDriver → sa-driver (1 census rows)
⚠ STORY
- was SAY: Mind the truck. It reverses when it feels like it.
- was SAY: Seven runs a day. The VAX bins are the heaviest.
- census now: Wide load! Back up, back up!

## laptManager → sa-mgr (9 census rows)
⚠ STORY
- was HELLO: Lakeside Apartments. Lake views, thin walls, a lift that works on Tuesdays.
- was HELLO (repeat): Back again? No vacancies. Well, one. It is mostly a cupboard.
- was HELLO (repeat): Somebody on floor nine plays the tuba at midnight. Every midnight.
- was WORK (kept, plays after census): Six jobs here. The lift first. It only works on Tuesdays. Ask me inside.
- was ASK ANY FLATS FREE? → FLAT 9G, floor nine. Lake view. Ask me about YOUR FLAT. (REPLACED in lobby)
- census now: Lakeside apartments! Water on three sides! / Ordinary building, ordinary rent, and an owner who leaves me alone. / Because two towers in this town are owned by a family, and mine is not.

## laptDoor → sa-aptdoor (1 census rows)
✓ flavour
- was SAY: Lakeside Apartments. Wipe your feet, the lake follows you in.
- was SAY: Floor nine again? Tuba or no tuba, I just hold the door.
- census now: Evening. Water side is on your left.

## relicLakeside → sa-relic (10 census rows)
✓ flavour
- was HELLO: Lakeside Relics. Fair prices, wet floors. Mind the puddle, the lake gets in.
- was HELLO (repeat): Back? Lakeside prices move with the tide. Today is low tide.
- was HELLO (repeat): I buy what the dump pickers find. Some of it is even relics.
- was WORK (kept, plays after census): Appraising pays. Real or fake, by the mark. Talk to me.
- was ASK HOW DO RELICS WORK? → Every store has its own price, and it changes each day. Buy low here, sell high on the island. (REPLACED in lobby)
- census now: Relics! Shore prices, honest weight! / Shore prices, honest weight, and I will tell you when I am being beaten. / Anything out of the WATER. There is more down there than up here.

## mfDesk → sp-desk (9 census rows)
⚠ STORY
- was HELLO: Machine Fleet HQ. We build the ships and guard bots that keep Meru safe. Badge, please.
- was HELLO (repeat): Visitor badge still valid. Please do not touch the guard bot. It likes that even less.
- was HELLO (repeat): The Planet Defense base, the Tank Range, the arena drones. All Machine Fleet hardware.
- was WORK (kept, plays after census): Engineering hires upstairs. Take the lift on the left. The chief engineer has five jobs.
- was ASK THE FACTORY DOWN THE STREET? → A small fault. The robots disagree with us about who is in charge. We are working on it. (REPLACED in lobby)
- census now: Machine Fleet. Sign in, please. / Machine Fleet headquarters. Every unit on this planet was built on the floor below us. / Cleaning, hauling, lifting, and the farm lines. Nothing with a weapon on it.

## mfDirector → sp-cogs (12 census rows)
✓ flavour
- was HELLO: Director Cogsworth, Machine Fleet. Every ship in the sky and every guard bot in Meru. Ours.
- was HELLO (repeat): The factory? A temporary disagreement. Our robots are loyal. Mostly.
- was ASK WHAT DOES THE FLEET DO? → We build, fly and fix the machine ships and guard bots. For defence. Only defence. (REPLACED in lobby)
- census now: Ah. A visitor. Come in, come in. / Nothing we build can be given a target without also being given a stop. / You are the fourth fox this month and you all arrive with the same sentence.

## mfEngineer → sp-eng (13 census rows)
⚠ STORY
- was HELLO: Chief engineer. I keep the fleet flying. Do not touch anything with a red light.
- was HELLO (repeat): Somebody changed one line of code at the factory. One line. I know who.
- was ASK THE ARENA DRONES? → Ours. The Tank Range tanks too, and the Planet Defense guns. Built here, tested loudly. (REPLACED in lobby)
- census now: Mind the cable. I have told them twice. / It is not impossible. It is not SUPPOSED to happen, and those differ. / A cleaning unit took a clearance order for a row of old houses.

## mfGuardBot → sp-mguard (1 census rows)
⚠ STORY
- was SAY: BEEP. VISITOR DETECTED. VISITOR SEEMS FRIENDLY. BEEP.
- was SAY: PLEASE DO NOT TOUCH THE GUARD BOT. THANK YOU. BEEP.
- census now: Welcome. Please remain on the walkway.

## mfForeman → sp-foreman-pre (10 census rows)
⚠ STORY
- was HELLO: Get down! The factory robots went wild and took the whole street. I barely kept my hat.
- was HELLO (repeat): Still out there, marching about. One of them took my lunchbox.
- was ASK WHAT WENT WRONG? → Somebody set the line to build robots that build robots. They did. Then they kept going. (REPLACED in lobby)
- census now: Nobody goes in! It is still in there! / Forty of us worked that floor. We came out in the clothes we had on. / Clearing. It has the building on a list and it will not be told otherwise.

## mfForemanIn → sp-foreman-post (9 census rows)
⚠ STORY
- was HELLO: You took the factory back! The line runs again. Robots that build robots, but only on Tuesdays.
- was HELLO (repeat): Back at work. Maker Prime is scrap, and my lunchbox is safe.
- was WORK (kept, plays after census): No jobs yet. We are still sweeping up bolts. Ask me again soon.
- was ASK WHAT WAS MAKER PRIME? → Our biggest builder. Someone changed one line of code and it built an army. (REPLACED in lobby)
- was ASK THE WORKERS? → All home safe. The ones you let out of the cages bought you a cake. (REPLACED in lobby)
- census now: The floor is ours again! Come and look! / Lights on, doors open, and forty foxes back on a floor they had buried. / Sweep the west end and keep clear of the hole. We are proud of the hole.

## radioManager → sp-rmgr (9 census rows)
✓ flavour
- was HELLO: Meru Radio, the voice of the Spire. Keep it down, the morning show is on air.
- was HELLO (repeat): Back again? Request a song and the DJ might even play it.
- was HELLO (repeat): We play the same eight songs. Listeners say it is tradition. I say it is the budget.
- was WORK (kept, plays after census): The Morning DJ and the sound engineer are hiring. Studio door, back wall, on the right.
- was ASK WHAT IS ON THE RADIO? → Morning show, traffic from the train, and a weather report copied from Meru TV. (REPLACED in lobby)
- census now: Live on air upstairs. Keep it down, please. / We play music. The station on the island does the news and may keep it. / Because a song is true for everybody and a story is only true for some.

## radioDJ → sp-dj (10 census rows)
✓ flavour
- was HELLO: GOOOOD morning, Meru! Oh, it is you. Hi. Indoor voice. Good morning.
- was HELLO (repeat): Song request? I have eight songs. Pick one. Pick the third one.
- was ASK PLAY MY SONG? → Hum it. Mm. That is song four. Coming up after the traffic. (REPLACED in lobby)
- census now: You are on in nine seconds! Stand there! / Nine seconds, and then the whole shore hears whatever you say next. / Your name, where you are from, and one thing you are good at.

## radioTech → sp-rtech (1 census rows)
✓ flavour
- was SAY: Shh. Levels. Talk in the green, not the red.
- was SAY: The mixing desk is older than me. Kinder, too.
- census now: Red light is on. Shoes off the grating.

## officeLobby → sp-lobby (1 census rows)
✓ flavour
- was HELLO: Spire Offices. Floor one, lawyer. Floor two, accountant. Floor three, dentist. Pick your pain.
- was HELLO (repeat): Back again? The dentist is running late. The lawyer is running up a bill.
- was HELLO (repeat): The accountant counts the lift rides. He says I owe him three.
- was WORK (kept, plays after census): All three floors are hiring. Lift on the left.
- was ASK WHICH FLOOR? → Lift on the left. One, lawyer. Two, accountant. Three, dentist. There is no four. (REPLACED in lobby)
- census now: Law on two, accounts on three, dentist on four.

## officeLawyer → sp-lawyer (12 census rows)
⚠ STORY
- was HELLO: Floor one, law. I bill by the minute. This greeting was free. The next one is not.
- was HELLO (repeat): Back again? Your first sentence is free. Choose it carefully.
- was WORK (kept, plays after census): Two jobs at my desk. Talk to me.
- was ASK WHO ARE YOUR CLIENTS? → The Salts and the Peppers. Different days. Different doors. Same coffee. (REPLACED in lobby)
- census now: Second floor. Appointments and awkward questions. / Every contract this town signs is filed downstairs and open to anybody who asks. / In eleven years, nobody. Not one fox and not one reporter.

## officeLawClerk → sp-lclerk (1 census rows)
✓ flavour
- was SAY: Take a number. We have one number. It is yours.
- was SAY: The lawyer is on the phone. The lawyer is always on the phone.
- census now: Copies are free. The cabinet sticks a bit.

## officeAccountant → sp-acct (9 census rows)
⚠ STORY
- was HELLO: Floor two. Accountant. I have counted you. You are one. Correct.
- was HELLO (repeat): Back again. That is two visits. I wrote it down.
- was WORK (kept, plays after census): Two counting jobs. Talk to me at the desk.
- was ASK WHO KEEPS THE BOOKS? → VAX, the Fleet, half the town. The Salt books are very tidy. Suspiciously tidy. (REPLACED in lobby)
- census now: Third floor. I do numbers, quietly. / Two towers in this town file their accounts with me and both of them balance. / Books that balance perfectly are either honest or expensive. Usually expensive.

## officeDentist → sp-dent (10 census rows)
✓ flavour
- was HELLO: Floor three, dentist. Open wide. Wider. Lovely fangs. Mostly.
- was HELLO (repeat): Back again? Still brushing? I can tell. I can always tell.
- was WORK (kept, plays after census): Four jobs at the chair. Talk to me at the desk.
- was ASK DOES IT HURT? → Only the bill. That is the accountant's fault, one floor down. (REPLACED in lobby)
- census now: Fourth floor. Open wide, or walk past. / Fighters, mostly. They come up after the cage and sit very still for me. / A tooth that met a knee. Always the same tooth, always the knee.

## officeNurse → sp-dnurse (1 census rows)
✓ flavour
- was SAY: Floss. Please. Everyone. Floss.
- was SAY: The dentist is ready. The chair is ready. Are you ready?
- census now: Take a seat. He is nearly finished.

## saptManager → sp-smgr (9 census rows)
⚠ STORY
- was HELLO: Spire Apartments. Quiet, clean, and close to the tower. You can hear it hum at night.
- was HELLO (repeat): Back again? The hum is normal. The fleet says the hum is normal.
- was WORK (kept, plays after census): Six jobs: the hum, the fuses, the parts mail, night watch, the doors, the bots. Talk to me.
- was ASK ANY FLATS FREE? → FLAT 12G, floor twelve. Tower view. Ask me about YOUR FLAT. (REPLACED in lobby)
- census now: Spire apartments! Everything here is in order! / Everything here is in order. I say that first because it saves us both time. / A holding company. I have met the company. I have never met an owner.

## saptDoor → sp-sdoor (1 census rows)
✓ flavour
- was SAY: Spire Apartments. The hum? Totally normal.
- was SAY: Engineers mostly. They come home smelling of oil.
- census now: Residents left, visitors sign here.

## relicSpire → sp-relic (10 census rows)
✓ flavour
- was HELLO: Spire Relics. I test every piece with a scanner. The scanner says most are real.
- was HELLO (repeat): Back again? Spire prices follow the tower lights. Bright means high.
- was WORK (kept, plays after census): The scanner needs a second opinion. Appraise for me.
- was ASK HOW DO RELICS WORK? → Each store buys and sells at its own price, new every day. Buy low, sell high, travel light. (REPLACED in lobby)
- census now: Relics bought! Machine parts especially! / Machine parts, plates, anything with a serial. The fleet pretends not to buy them. / More than the metal, less than you hope, and it moves every day.

## pepperDesk → de-desk (9 census rows)
⚠ STORY
- was HELLO: Pepper Family HQ. A legitimate business. We own buildings. Can I see your hands? Just checking.
- was HELLO (repeat): Back again. Your pockets look the same as before. Good.
- was HELLO (repeat): The family owns the Deco and Garden apartments. Rent is due. Always.
- was WORK (kept, plays after census): The property manager hires upstairs. Lift on the left. Pockets out, please.
- was ASK WHAT DOES THE FAMILY DO? → Property. Apartments. Nothing else. Anyone who says thieves is a liar, and probably from the Buzz. (REPLACED in lobby)
- was ASK THE SALTS? → Salt sent the bandits. Everyone knows. Well, we know. Write that down. (REPLACED in lobby)
- census now: Pepper family. Second door, not the first. / Pepper family offices. We teach trades, we hold property, and we answer the door ourselves. / Locks, mostly. Also roofing, glass, and anything the town stops training for.

## pepperBoss → de-boss (13 census rows)
⚠ STORY
- was HELLO: A visitor. I am Pepper. We own buildings, nothing more. Keep your wallet. I mean that kindly.
- was HELLO (repeat): You came back. Brave or nosy. Both are useful.
- was ASK THE THIEVES? → Thieves? We train young foxes in quick paws. For juggling. Meru loves juggling. (REPLACED in lobby)
- was ASK THE BANDITS? → Someone took our building. Salt, perhaps. Or someone who wants us at war. (REPLACED in lobby)
- census now: Sit down. You have heard the other version. / The Salts will have told you we train thieves. Half of that is fair. / We teach locks. Some of our students went and used it the other way.

## pepperBossBack → de-boss (13 census rows)
⚠ STORY
- was HELLO: You freed our building. Sit. The Pepper family pays its debts. Quietly.
- was HELLO (repeat): Back again, friend. This door opens for you now.
- was ASK WHAT NOW? → Now we learn who paid Jack. Salt, perhaps. Perhaps not. (REPLACED in lobby)
- was ASK THE SAFE? → A small thank-you is inside. Take it. I counted it twice. (REPLACED in lobby)
- census now: Sit down. You have heard the other version. / The Salts will have told you we train thieves. Half of that is fair. / We teach locks. Some of our students went and used it the other way.

## pepperProperty → de-prop (12 census rows)
⚠ STORY
- was HELLO: Property manager. Deco and Garden apartments, all Pepper. Need a flat? Need a cheaper one? No.
- was HELLO (repeat): Rent rises are a sign of a healthy town. Ask any landlord.
- was ASK WHY SO MANY FLATS? → Everyone needs a roof. A roof is the safest money in Meru. (REPLACED in lobby)
- census now: Property side. Rents, roofs and arguments. / I hold thirty buildings, two hundred doors, and one row of houses that is gone. / Cleared. The order named the site and the machine took the whole street.

## pepperDoor0 → de-door (1 census rows)
⚠ STORY
- was SAY: Paws out of pockets. Thank you.
- was SAY: The family is legitimate. Very legitimate.
- census now: Second door. The first one is a cupboard.

## pepperDoor1 → de-door (1 census rows)
⚠ STORY
- was SAY: Pepper HQ. No Salts.
- was SAY: Nice coat. Keep it on.
- census now: Second door. The first one is a cupboard.

## pepperCousin → de-cousin-pre (10 census rows)
⚠ STORY
- was HELLO: You look tough. Bandits took the Pepper Building and changed the locks. Our locks!
- was HELLO (repeat): Still in there. They are reading our files. Our very legitimate files.
- was ASK WHO SENT THEM? → The Salts, obviously. Or someone who wants us to think the Salts. Either way, very rude. (REPLACED in lobby)
- census now: I went in once already! On my own! / I went in alone on the first night and I came straight back out. / Four of them on the stair, and one at the top who waited for me.

## pepperCousinIn → de-cousin-post (9 census rows)
⚠ STORY
- was HELLO: You got it back! Our files, our locks, our very legitimate gym.
- was HELLO (repeat): Welcome back, friend of the family. Mind your pockets. Joking. Mostly.
- was WORK (kept, plays after census): No jobs yet. We are still finding dummies in odd places.
- was ASK WHO WAS JACK? → Jalapeño Jack. He used to teach here. Somebody paid him to switch sides. (REPLACED in lobby)
- was ASK THE STOLEN SACKS? → Take them back to the shops. Good for our name. We need that. (REPLACED in lobby)
- census now: Open! And the family is furious! / Open again, three days before the family meant to do it. They are furious. / Take the beginners class. Show them a lock has no feelings about them.

## paperEditor → de-editor (10 census rows)
⚠ STORY
- was HELLO: The Meru Daily. Real news, printed on real paper, delivered really late.
- was HELLO (repeat): Back again? Tomorrow's front page is still blank. Bring me a story.
- was HELLO (repeat): The Buzz prints rumours. We print facts. Slower, but they stay true.
- was WORK (kept, plays after census): The Ace Reporter does the hiring. Newsroom, through the back door.
- was ASK ANY BIG STORIES? → Bandits in two buildings, robots on one street, and a family feud. Busy week for a quiet town. (REPLACED in lobby)
- census now: Front page is late. It always is. / We print what we can stand behind in a room with a lawyer in it. / Anything the shore site is running. They are quick and they are often right.

## paperReporter → de-ace (12 census rows)
⚠ STORY
- was HELLO: Ace reporter, Meru Daily. Facts only. Got a fact? I trade facts for facts.
- was HELLO (repeat): Fact: two buildings taken by bandits. Fact: nobody admits sending them.
- was ASK WHO DID IT? → Follow the money. It goes in circles round the lake. That is a clue. (REPLACED in lobby)
- census now: Nine years on one story. Nearly there. / Nine years on the waste contract and I have never once seen the contract. / The family, the fleet, the town hall, and the shore site's gossip.

## paperSeller → de-seller (1 census rows)
⚠ STORY
- was SAY: Meru Daily! Read all about it! Well, some of it!
- was SAY: Extra, extra! Bandits, robots, rent! One coin!
- census now: Late edition! Front page changed twice!

## paperPress → de-press (1 census rows)
✓ flavour
- was SAY: Mind the press. It bites ink.
- was SAY: Tomorrow's paper, printing now. Smells nice, right?
- census now: Mind your sleeves near the rollers!

## woodMaster → de-wood (10 census rows)
⚠ STORY
- was HELLO: Woodshop. Mind the sawdust. Measure twice, cut once, sweep forever.
- was HELLO (repeat): Back again? The apprentice is sanding the same plank. Day four.
- was HELLO (repeat): Good oak, good pine, good glue. That is the whole trade.
- was WORK (kept, plays after census): Six jobs at the benches. Saw, sand, nail, build, carve, paint. Pick one.
- was ASK WHAT DO YOU MAKE? → Doors for the Deco, frames for the Gallery, and the odd chair for VAX. (REPLACED in lobby)
- census now: Come in. Mind the sawdust, it travels. / Two hundred years of oak went into a hopper in one afternoon. / Four beams and a staircase. The staircase is standing in the corner.

## woodApprentice → de-app (1 census rows)
✓ flavour
- was SAY: Day four on this plank. It is the smoothest plank in Meru.
- was SAY: The master says sand with the grain. I am still finding the grain.
- census now: He is planing. Best not to speak yet.

## daptManager → de-mgr (9 census rows)
⚠ STORY
- was HELLO: Deco Apartments, a Pepper property. Rent goes in the box. All of it. Please.
- was HELLO (repeat): Back again? Rent is due Friday. And Monday. The Peppers like rent.
- was WORK (kept, plays after census): Six jobs: the rent box, the locks, the trim, the doorknobs, the jugglers, the notices. Talk to me.
- was ASK ANY FLATS FREE? → FLAT 3G, floor three. The last tenant left in a hurry. Ask me about YOUR FLAT. (REPLACED in lobby)
- census now: Apartments! Two rooms free this month! / Two rooms free, and both went to families out of the cleared row. / The property manager asked. I said yes before he had finished asking.

## daptDoor → de-aptdoor (1 census rows)
✓ flavour
- was SAY: Deco Apartments. The rent box is by the lifts. Everyone pays.
- was SAY: I just open the door. I hear nothing. I see nothing.
- census now: Evening. Stairs only, the lift is a myth.

## daptTenant → de-tenant (10 census rows)
⚠ STORY
- was HELLO: Shh. I know things about the Peppers. Little things. Juggling lessons at midnight, for one.
- was HELLO (repeat): The property manager counts the rent twice. Once with paws, once with a magnifier.
- was ASK WHAT DO YOU KNOW? → Young foxes go in empty-pawed and come out with full pockets. Juggling, they say. (REPLACED in lobby)
- census now: Fourth floor. We are the new ones. / We lived in the row that is not there now. This is the fourth floor. / Quiet. That is the part nobody believes. It worked quietly down the street.

## relicDeco → de-relic (10 census rows)
⚠ STORY
- was HELLO: Deco Relics. Old things, gold frames, and nothing stolen. I say that to everyone.
- was HELLO (repeat): Back again? Deco prices are low today. Low prices, no questions.
- was WORK (kept, plays after census): Appraise a few pieces. No questions about where they came from.
- was ASK HOW DO RELICS WORK? → Every store sets its own price, and they change daily. Buy here cheap, sell on the island dear. (REPLACED in lobby)
- census now: Relics. Household and timber, bought properly. / Household pieces and old timber, and I write down every single thing I buy. / Because half this town is looking for something out of a cleared house.

## saltBandit → sa-bandit (3 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Wrong door, friend. / This is ours now. / Nobody is coming for you.

## pepperBandit → de-bandit (3 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: The locksmith sent somebody better. / Top floor is mine now. / You came up very loudly.

## dockGuardA → dk-berth (13 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: You are on the ground! That answered itself! / You are on the ground, so that answered itself. The berth is the King's. / Down the gantry and through the arch. Everything on this planet hangs off it.

## dockGuardB → dk-gantry (10 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Cold up here. Nothing happens. Perfect. / We asked for this posting. Everybody else is down where the crowd is. / The crowd is where the trouble will be. It always is.

## chiefEmber → fire-chief (14 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Mind the hoses! Spritz leaves them everywhere! / Mind the hoses. Spritz leaves them everywhere. I am Chief Ember. / Back again. The bell has been quiet. Let us keep it that way.

## fireDriver → fire-axle (5 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Truck on land, boat on water! / Truck on land, boat on water. Same rule for both, get there FIRST. / Hold on to something. I do not do slow.

## fireLadder → fire-rung (5 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Three paws on the rungs! Always three! / Forty feet, wind, smoke, up there I am fine. Down here I struggle. / Down here foxes TALK to me. Much worse than smoke.

## fireHose → fire-spritz (6 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Sorry! Did I get you? / Hose rule one is point it AWAY from your friends. / I am still working on rule one.

## fireSpritz → fire-spritz (6 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Sorry! Did I get you? / Hose rule one is point it AWAY from your friends. / I am still working on rule one.

## ticketClerk → loop-square (3 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Town Square platform! Mind the doors! / Town Square. Every line stops here and every fox is in a hurry. / One way or return. Decide before you reach the window.

## max → mt-max (12 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Cousin. You look like you ran here. / He has already started the tournament, with me as the final bout. / I believe you. My sister does not, and she is the one he listens to.

## princessMichelle → mt-michelle (12 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Cousin! I gave Father a brand new crown! / I gave Father a brand new crown this morning. Nobody else even tried. / That is impossible, and you are always trying to get attention.

## michelle → mt-michelle (12 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Cousin! I gave Father a brand new crown! / I gave Father a brand new crown this morning. Nobody else even tried. / That is impossible, and you are always trying to get attention.

## pearlDiver → pi-diver (9 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Down for pearls! Hold your breath! / Hull pearls, deep, under the old boats. I go down for them most days. / Check the DEPTH before you check anything else.

## ferryCaptain → lk-ferry (9 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Garden Island! Mind your step aboard! / Garden Island and back. We go when the water is flat and not before. / Aboard then. Sit where you like, hold on where you must.

## courtSteward → ct-steward (8 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: The court roster! Names and duties! / I keep the roster. Every fox in this keep has a name and a duty on it. / Learn the names first. A duty without a name attached is a rumour.

## castleSteward → ct-steward (8 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: The court roster! Names and duties! / I keep the roster. Every fox in this keep has a name and a duty on it. / Learn the names first. A duty without a name attached is a rumour.

## hospitalDoctor → hs-rounds (9 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Rounds in ten! Wards are quiet! / Three wards, all quiet, and I would like it to stay that way. / Water, blankets, and ASK before you move anybody. Always ask.

## doctorRounds → hs-rounds (9 census rows)
- no lobby lines (speaks from its own room / job module; only greeting + extra questions added)
- census now: Rounds in ten! Wards are quiet! / Three wards, all quiet, and I would like it to stay that way. / Water, blankets, and ASK before you move anybody. Always ask.

## Plain talkers (s150d) — whole talk swapped to the census choice tree
Foxes whose old lines were mostly NOT in the census and had no choices. Their old text is logged at runtime in localStorage 'meru.voxLog'. Mostly flavour (shop chat, town lore).

## New foxes placed for the census duets (s150h)
- STRETCH CLASS (3 foxes) beside the tetherball poles on the Fountain Plaza
- BALCONY CREST pair outside Crestview, BALCONY LAKE pair outside Lakeside (on the ground by the door for now; real balconies later)
- WINNIE + the LANES LOSER inside Meru Lanes near Mott
- FLICK + the TAVERN COOK in the Tavern near Ziggy
- PRINCESS MICHELLE beside Prince Max in the castle (mt-siblings duet). Her 1-on-1 talk (mt-michelle) is not wired yet.
- Dock guards' duet only plays on the Meru Spacedock page (not Meru 2).

## Fire station (s150i): game text changed to match the recordings (tiny wording only)
- fire-job02 intro: was "Rung, ladder. You, steady the base." → "You steady the base."
- fire-job05 intro: was "I'm counting." → "I am counting."
- fire-job05 tip: was "Boots FIRST. Always boots first." → "Boots FIRST! Always boots first!"
- fire-job02 done: was "I'm never cooking toast again." → "I am never cooking toast again."
- fire-job03 done: was "The cat's fine." → "The cat is fine."
- Job tips shown as on-screen toasts now speak when they match a recording.
- NOT IN THE GAME: fire-job04 (drive the truck), 06 (hydrants), 07 (wash the truck), 08 (school talk with Hope), 09 (boat fire), 10 (water show), 11 (swimmer rescue): 21 recorded rows wait for those jobs to be built.

## Meru Arena · King Might (s150j): his tournament lines now use the recorded wording
- intro: "First you must compete!.. You have THREE challenges." → "First you must compete. You have THREE challenges."
- intro: "The first is the lasergun. How fast can you defeat these drones?" → "...Let me see how fast you clear those drones."
- toSword: "You are setting records today, Fox Soldier. NEXT — swing your sword to cement your place in history." → two lines: "...I did not expect that." / "Next. Swing your sword and cement your place in our history."
- toBoss: "Splendid! But a champion of Meru must face the WARDEN." / "Jump its shockwaves, and strike when it crashes into the wall." → recorded versions (same meaning)
- finish: "...real competition." → "...competition."; "BUT — you are the clear victor" → "But you are the clear victor here today!"; "IT can wait until tonight... A place of honour beside me, in the throne room." + "We will present you your prize tonight." → "It can wait until tonight. We celebrate YOU at my birthday party." / "A place of honour beside me in the throne room, and your prize there."
- player lines: "MY KING, I have to tell you something important!" → "My King. I have to tell you something important." (Ben's recorded line)
- KEPT unrecorded: Ben's opening shout "KING MIGHT — I must tell you something important!" and the new LOX final lines (SCRIPT.toFinal) — record these.
- THE WARDEN now speaks its 3 recorded taunts (round start, first charge, first wall crash) as orange popups + voice.
- Gameplay: none changed (same order, same rounds).

## Princess Michelle + Prince Max (s150j)
- Both are now TALK-able in the castle (census mt-michelle / mt-max 1-on-1 trees). Story note: Michelle says the machine fleet attack is impossible; Max believes you and says he is the tournament's final bout (the game now has LOX as the final) ⚠ STORY: re-record Max's "final bout" line or keep Max in the final later.
- NOT WIRED: cv-max (Max in the cave cage) + cv-rookring (Rook's ring handover) — the cave lives in the old Meru Town Square page, not Meru 2.

## OLD MERU PAGES (Meru Town Square + caves + castle, meru-game.js) (s150k)
- Every dialogue line there now plays its recording when the words match.
- Rook's RING HANDOVER (caves) now uses the recorded wording: "Well. Look at that. He has worn that ring since before I was born." / "Vix. Open the cage. Your friend walks, and so do you." / "You are one of us now. Both of you. Bring me anything old." / "I pay over the odds and I ask nothing. That is the whole business." (was 3 longer lines; same meaning; the cage still opens).
- 31 plain townsfolk swapped to their recorded talk (played straight through, every recorded line): jon, castleGuard1/2, ruinsGuard, fisherwoman, arenaGuard1/2, vance, arenaRoadGuard1/2, torv, marla, wren, pell, sela, rosk, odo, tam, ivy, hetty, barkeep, patron1/2, dealerTx, cashier, barracksGuardCaptain, barracksMasterOfArms, lanesRegular (Gale), lanesRecord (Nera), lanesRival (Rook at the lanes), aptDoorCrest. Their old lines: localStorage meru.mgSwap.
- KEPT (story, not swapped; only exact matches speak): Hope, Noble, Ulric, Grand, Lucius, Zadie, Nash, the Sage, King Might, Snag, Vix, Kia, the Monk (muted), Rook + Max in the caves (their story branches).
- ⚠ STORY: the swapped Fisherwoman now tells the Max-at-the-lake story from the recording (same story). Arena guards / gate keeper now ask "Are you READY" in the recorded talk — the arena gate itself is unchanged.

## Station clerks (s150i)
- A clerk now stands on the street by each of the 8 loop stations (Town = Square, Lakeside, Arena, Spire, Castle Rd = Castle, Deco = Market, Ruins, Garden = Crestview) and plays its census lines when you walk up.

## Not swapped (still old text, voiced only where words match)
- Fire station job call-outs (fire-job01..11), Chief Ember's job beats
- Cave + royal story scenes (cv-, mt-) inside scripted events
- Train station clerks other than Town Square (only ticketClerk is placed)
- Princess Michelle (mt-michelle): not placed in Meru 2 yet
