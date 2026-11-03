# RANGED WEAPON SOUND PROMPTS (s339)

One prompt per sound. Paste each into your sound generator (ElevenLabs Sound Effects or similar). Settings: duration about 1 s for shots and hits, about 1.5 s for draw and holster, prompt influence high. Make 3 takes of each and keep the best; the game can pick between takes at random.

File names: `audio/ranged/<weapon>-<sound>.mp3`, for example `audio/ranged/laser-hit-wood.mp3`. Keep the names exactly; the game will look for them.

The 9 sounds for each weapon: fire · hit-cloth · hit-wood · hit-stone · hit-metalthick · hit-metalthin · hit-flesh · draw · holster. The three throwers also get **loop** (holding the trigger, seamless) and **stop**.

## BEN'S NOTE: KEEP WHAT THE LASER DOES NOW

The laser's recorded hits already in the game are the reference for every ranged weapon:
- **The SIZZLE** (`audio/laser/hit-*.mp3` + the synth 'sizzle' in engine/fighter-sfx.js): an energy hit leaves a short hot sizzle on whatever it touches. Ben likes it. Every energy weapon (laser, laser rifle, scatter gun, staff) keeps a sizzle tail on its hits, each in its own colour: the laser rifle deeper and longer, the scatter gun as 5 tiny quick sizzles, the staff as a fiery crackle-sizzle with electric snaps.
- **The THICK-METAL hit** (`audio/laser/hit-metal-thick.mp3`, the laser hitting a robot): a great fun, ringing, slightly musical zap-clang. Ben loves it. Every ranged weapon's **hit-metalthick** should be that fun: a bright satisfying ring with a zap or ping, never a dull clunk. Use the laser's file as the sound to match when you pick the best take.
- The laser's own hits stay as they are (the recorded ones). Only make new laser prompts if a surface has none yet.

## LASER (`laser`)

**laser-fire**
Isolated single sound effect, a compact sci-fi laser pistol firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One shot: a short bright sci-fi laser zap, punchy, no echo.

**laser-hit-cloth**
Isolated single sound effect, a small energy bolt hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit with a short electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**laser-hit-wood**
Isolated single sound effect, a small energy bolt hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk with a short electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**laser-hit-stone**
Isolated single sound effect, a small energy bolt hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles with a short electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**laser-hit-metalthick**
Isolated single sound effect, a small energy bolt hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring with a short electric sizzle. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**laser-hit-metalthin**
Isolated single sound effect, a small energy bolt hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz with a short electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**laser-hit-flesh**
Isolated single sound effect, a small energy bolt hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice with a short electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**laser-draw**
Isolated single sound effect, a compact sci-fi laser pistol being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Drawn from a hip holster: a leather holster slide and a soft electronic power-up chirp. No shot.

**laser-holster**
Isolated single sound effect, a compact sci-fi laser pistol being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Slid into a hip holster: a power-down blip and a leather holster slide with a snap. No shot.

## STAFF (`staff`)

**staff-fire**
Isolated single sound effect, a magic staff with a glass orb crackling with electricity firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One cast: an electric crackle building for a moment, then a whooshing fireball launched with a soft roar.

**staff-hit-cloth**
Isolated single sound effect, an exploding fireball hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit and the fireball bursting in a small fiery explosion. End on a short hot SIZZLE tail like the laser's hits.

**staff-hit-wood**
Isolated single sound effect, an exploding fireball hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk and the fireball bursting in a small fiery explosion. End on a short hot SIZZLE tail like the laser's hits.

**staff-hit-stone**
Isolated single sound effect, an exploding fireball hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles and the fireball bursting in a small fiery explosion. End on a short hot SIZZLE tail like the laser's hits.

**staff-hit-metalthick**
Isolated single sound effect, an exploding fireball hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring and the fireball bursting in a small fiery explosion. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**staff-hit-metalthin**
Isolated single sound effect, an exploding fireball hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz and the fireball bursting in a small fiery explosion. End on a short hot SIZZLE tail like the laser's hits.

**staff-hit-flesh**
Isolated single sound effect, an exploding fireball hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice and the fireball bursting in a small fiery explosion. End on a short hot SIZZLE tail like the laser's hits.

**staff-draw**
Isolated single sound effect, a magic staff with a glass orb crackling with electricity being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Pulled off a back strap: a wooden staff slide and the glass orb starting to crackle with small electric sparks. No shot.

**staff-holster**
Isolated single sound effect, a magic staff with a glass orb crackling with electricity being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Strapped to the back: the electric crackle fading out and a wooden staff slide into a strap. No shot.

## SCATTER GUN (`scatter`)

**scatter-fire**
Isolated single sound effect, a stubby sci-fi scatter gun with five barrels firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One blast: five short energy pellets fired at once, a wide punchy sci-fi shotgun burst.

**scatter-hit-cloth**
Isolated single sound effect, a spray of five short energy pellets hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit as five quick little pellet hits spread across it. End on a short hot SIZZLE tail like the laser's hits.

**scatter-hit-wood**
Isolated single sound effect, a spray of five short energy pellets hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk as five quick little pellet hits spread across it. End on a short hot SIZZLE tail like the laser's hits.

**scatter-hit-stone**
Isolated single sound effect, a spray of five short energy pellets hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles as five quick little pellet hits spread across it. End on a short hot SIZZLE tail like the laser's hits.

**scatter-hit-metalthick**
Isolated single sound effect, a spray of five short energy pellets hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring as five quick little pellet hits spread across it. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**scatter-hit-metalthin**
Isolated single sound effect, a spray of five short energy pellets hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz as five quick little pellet hits spread across it. End on a short hot SIZZLE tail like the laser's hits.

**scatter-hit-flesh**
Isolated single sound effect, a spray of five short energy pellets hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice as five quick little pellet hits spread across it. End on a short hot SIZZLE tail like the laser's hits.

**scatter-draw**
Isolated single sound effect, a stubby sci-fi scatter gun with five barrels being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unslung from the back: a sling strap slide and a chunky mechanical pump-and-charge. No shot.

**scatter-holster**
Isolated single sound effect, a stubby sci-fi scatter gun with five barrels being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Slung onto the back: a short power-down hum and a sling strap slide. No shot.

## ROCKET LAUNCHER (`rocket`)

**rocket-fire**
Isolated single sound effect, a shoulder rocket launcher firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One launch: a hollow thump and a hissing rocket whoosh flying away.

**rocket-hit-cloth**
Isolated single sound effect, a small rocket hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit and a loud punchy explosion.

**rocket-hit-wood**
Isolated single sound effect, a small rocket hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk and a loud punchy explosion.

**rocket-hit-stone**
Isolated single sound effect, a small rocket hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles and a loud punchy explosion.

**rocket-hit-metalthick**
Isolated single sound effect, a small rocket hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring and a loud punchy explosion. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**rocket-hit-metalthin**
Isolated single sound effect, a small rocket hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz and a loud punchy explosion.

**rocket-hit-flesh**
Isolated single sound effect, a small rocket hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice and a loud punchy explosion.

**rocket-draw**
Isolated single sound effect, a shoulder rocket launcher being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unslung from the back: a heavy tube shifting, a sling strap release and a metallic latch click. No shot.

**rocket-holster**
Isolated single sound effect, a shoulder rocket launcher being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Slung onto the back: a heavy tube settling against armour and a sling strap cinching. No shot.

## CROSSBOW (`crossbow`)

**crossbow-fire**
Isolated single sound effect, a wooden crossbow firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One shot: a sharp string twang and a wooden thunk, the bolt whistling away.

**crossbow-hit-cloth**
Isolated single sound effect, a crossbow bolt hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit as the bolt sinks in.

**crossbow-hit-wood**
Isolated single sound effect, a crossbow bolt hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk as the bolt sinks in.

**crossbow-hit-stone**
Isolated single sound effect, a crossbow bolt hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles as the bolt sinks in.

**crossbow-hit-metalthick**
Isolated single sound effect, a crossbow bolt hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring as the bolt sinks in. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**crossbow-hit-metalthin**
Isolated single sound effect, a crossbow bolt hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz as the bolt sinks in.

**crossbow-hit-flesh**
Isolated single sound effect, a crossbow bolt hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice as the bolt sinks in.

**crossbow-draw**
Isolated single sound effect, a wooden crossbow being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unslung from the back: a sling strap slide and the string being cranked back with a ratchet click. No shot.

**crossbow-holster**
Isolated single sound effect, a wooden crossbow being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Slung across the back: a wooden stock knocking armour once and a sling strap slide. No shot.

## LASER RIFLE (`rifle`)

**rifle-fire**
Isolated single sound effect, a long sci-fi laser rifle firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One shot: a deep powerful sci-fi laser beam blast with a short electric crackle tail.

**rifle-hit-cloth**
Isolated single sound effect, a long powerful laser beam hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit with a hot searing electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**rifle-hit-wood**
Isolated single sound effect, a long powerful laser beam hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk with a hot searing electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**rifle-hit-stone**
Isolated single sound effect, a long powerful laser beam hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles with a hot searing electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**rifle-hit-metalthick**
Isolated single sound effect, a long powerful laser beam hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring with a hot searing electric sizzle. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**rifle-hit-metalthin**
Isolated single sound effect, a long powerful laser beam hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz with a hot searing electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**rifle-hit-flesh**
Isolated single sound effect, a long powerful laser beam hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice with a hot searing electric sizzle. End on a short hot SIZZLE tail like the laser's hits.

**rifle-draw**
Isolated single sound effect, a long sci-fi laser rifle being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unslung from the back: a sling strap slide and a rising electronic charge whine. No shot.

**rifle-holster**
Isolated single sound effect, a long sci-fi laser rifle being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Slung onto the back: a falling power-down whine and a sling strap slide. No shot.

## FLAMETHROWER (`flame`)

**flame-fire**
Isolated single sound effect, a flamethrower with a fuel tank and a hand wand firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One short burst: a roaring whoosh of flame jetting out, about one second, then cutting off.

**flame-hit-cloth**
Isolated single sound effect, a burst of fire hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit as the fire splashes over it and crackles.

**flame-hit-wood**
Isolated single sound effect, a burst of fire hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk as the fire splashes over it and crackles.

**flame-hit-stone**
Isolated single sound effect, a burst of fire hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles as the fire splashes over it and crackles.

**flame-hit-metalthick**
Isolated single sound effect, a burst of fire hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring as the fire splashes over it and crackles. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**flame-hit-metalthin**
Isolated single sound effect, a burst of fire hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz as the fire splashes over it and crackles.

**flame-hit-flesh**
Isolated single sound effect, a burst of fire hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice as the fire splashes over it and crackles.

**flame-draw**
Isolated single sound effect, a flamethrower with a fuel tank and a hand wand being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unclipped from the hip: a metal clip release, a hose shifting and the pilot light igniting with a small whoomp. No shot.

**flame-holster**
Isolated single sound effect, a flamethrower with a fuel tank and a hand wand being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Clipped to the hip: the pilot light hissing out and a metal clip snap. No shot.

**flame-loop**
Isolated seamless loop, a flamethrower with a fuel tank and a hand wand held on: a steady roaring jet of flame. Even level, no start and no end, loops cleanly. Dry, no reverb, no music, no voices. 3 s.

**flame-stop**
Isolated single sound effect, a flamethrower with a fuel tank and a hand wand released. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. The flame jet cutting off: a short tail-off and a valve click.

## FREEZE THROWER (`freeze`)

**freeze-fire**
Isolated single sound effect, a freeze thrower with a coolant tank and a hand wand firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One short burst: a hard cold hiss of freezing spray with crackling ice forming, about one second.

**freeze-hit-cloth**
Isolated single sound effect, a blast of freezing frost hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit as frost crackles across it and ice forms with a glassy crunch.

**freeze-hit-wood**
Isolated single sound effect, a blast of freezing frost hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk as frost crackles across it and ice forms with a glassy crunch.

**freeze-hit-stone**
Isolated single sound effect, a blast of freezing frost hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles as frost crackles across it and ice forms with a glassy crunch.

**freeze-hit-metalthick**
Isolated single sound effect, a blast of freezing frost hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring as frost crackles across it and ice forms with a glassy crunch. Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**freeze-hit-metalthin**
Isolated single sound effect, a blast of freezing frost hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz as frost crackles across it and ice forms with a glassy crunch.

**freeze-hit-flesh**
Isolated single sound effect, a blast of freezing frost hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice as frost crackles across it and ice forms with a glassy crunch.

**freeze-draw**
Isolated single sound effect, a freeze thrower with a coolant tank and a hand wand being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unclipped from the hip: a metal clip release and a cold hiss of coolant pressurising. No shot.

**freeze-holster**
Isolated single sound effect, a freeze thrower with a coolant tank and a hand wand being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Clipped to the hip: a coolant valve closing with a short hiss and a metal clip snap. No shot.

**freeze-loop**
Isolated seamless loop, a freeze thrower with a coolant tank and a hand wand held on: a steady hard hiss of freezing spray with ice crackle. Even level, no start and no end, loops cleanly. Dry, no reverb, no music, no voices. 3 s.

**freeze-stop**
Isolated single sound effect, a freeze thrower with a coolant tank and a hand wand released. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. The freezing spray cutting off: a short tail-off and a valve click.

## FOG THROWER (`fog`)

**fog-fire**
Isolated single sound effect, a fog thrower with a smoke tank and a hand wand firing. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One short burst: a deep soft billowing whoosh of thick fog pouring out, about one second.

**fog-hit-cloth**
Isolated single sound effect, a thick fog cloud hitting a hanging cloth / padded fabric target. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a soft muffled fabric hit as the fog cloud softly puffs against it (very gentle, almost no impact).

**fog-hit-wood**
Isolated single sound effect, a thick fog cloud hitting a solid wooden plank or post. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a solid wooden thunk as the fog cloud softly puffs against it (very gentle, almost no impact).

**fog-hit-stone**
Isolated single sound effect, a thick fog cloud hitting a stone block or rock wall. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a hard gritty stone crack with a few small grit particles as the fog cloud softly puffs against it (very gentle, almost no impact).

**fog-hit-metalthick**
Isolated single sound effect, a thick fog cloud hitting a thick steel plate or heavy armour. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a deep heavy metal clang with a short low ring as the fog cloud softly puffs against it (very gentle, almost no impact). Make it FUN: a bright, ringing, slightly musical zap-clang like the laser hitting a robot (match audio/laser/hit-metal-thick.mp3), never a dull clunk.

**fog-hit-metalthin**
Isolated single sound effect, a thick fog cloud hitting a thin sheet-metal panel, like a bin lid or tin sign. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a bright tinny metal bang with a short rattling buzz as the fog cloud softly puffs against it (very gentle, almost no impact).

**fog-hit-flesh**
Isolated single sound effect, a thick fog cloud hitting a fleshy body hit (a creature, game style, no gore). Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. One impact: a dull body thud, no squelch, no blood, no voice as the fog cloud softly puffs against it (very gentle, almost no impact).

**fog-draw**
Isolated single sound effect, a fog thrower with a smoke tank and a hand wand being readied. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Unclipped from the hip: a metal clip release and a low breathy hiss of fog starting to seep. No shot.

**fog-holster**
Isolated single sound effect, a fog thrower with a smoke tank and a hand wand being put away. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. Clipped to the hip: the fog hiss closing off and a metal clip snap. No shot.

**fog-loop**
Isolated seamless loop, a fog thrower with a smoke tank and a hand wand held on: a steady deep billowing hiss of thick fog pouring out. Even level, no start and no end, loops cleanly. Dry, no reverb, no music, no voices. 3 s.

**fog-stop**
Isolated single sound effect, a fog thrower with a smoke tank and a hand wand released. Dry, close-miked, no reverb, no music, no voices, no background ambience. Starts on a clean attack, short tail, then silence. The fog stream cutting off: a short tail-off and a valve click.

