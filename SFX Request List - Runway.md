# 8 GATES 3D · Sound effect request list for Runway

Every sound in the game today is made by the synth in `engine/fighter-sfx.js`. Pearl Sail's explosions and gate blasts are the only recorded sounds. Each line below is one file to generate, written as a prompt you can paste into Runway.

**Format for every file:** WAV or MP3, mono, 44.1 kHz, about −3 dB peak, no music, no voices unless the line asks for one, and a clean start with no silence. Make 3 takes of each, and keep the length given.
**Engine loops:** make each one loop with no click at the seam (the end must flow into the start). The game raises their pitch and volume with speed, so record them at a steady cruising speed.
**Style:** stylised sci-fi for a toon-shaded fox adventure. Punchy, clean and readable on phone speakers. Not gritty realism.
**Naming (important):** Runway names the downloaded file after the first words of the prompt, so every prompt **starts with its own title tag**: `8G <GROUP> <NAME>:`, e.g. `8G SPACE SHIP LASER: Bright cyan twin laser…`. That way:
- every file starts with **8G**, so they sort together in your Downloads folder and are easy to search for ("8G"),
- the **GROUP** word (SPACE, STATION, CREATURE, MACHINE, PIRATE, DOCK) keeps each section together,
- the **NAME** matches the key in the first column, so you or I can rename it to `sfx/<key>.mp3` without guessing.
Paste the whole prompt cell **including the bold tag**. Keep the tag exactly as written; the description after the colon can be changed freely. For takes 2 and 3, add " TAKE 2" / " TAKE 3" right after the name (`8G SPACE SHIP LASER TAKE 2: …`).

## 1 · Space flight (Space Map)
| Key | Length | Prompt |
|---|---|---|
| shipLaser | 0.25 s | **8G SPACE SHIP LASER:** Bright cyan twin laser burst from a small starfighter, two quick overlapping zaps, crisp attack, short airy tail |
| enemyLaser | 0.25 s | **8G SPACE ENEMY LASER:** The same twin laser burst but lower and harsher, a red pirate blaster, slightly distorted |
| missile | 0.8 s | **8G SPACE MISSILE:** Small homing missile launch, a whoosh with a thin rocket hiss that fades as it flies away |
| torpedo | 1.2 s | **8G SPACE TORPEDO:** Heavy plasma torpedo charging for half a second, then a deep thump launch |
| shipExplodeSmall | 1.0 s | **8G SPACE SHIP EXPLODE SMALL:** Small spaceship exploding in space, a sharp crack and a bright pop, with metal debris tinkling away |
| shipExplodeBig | 2.0 s | **8G SPACE SHIP EXPLODE BIG:** Large warship or pirate base exploding, a deep layered boom, a long rumbling tail and a shower of debris |
| shieldHit | 0.4 s | **8G SPACE SHIELD HIT:** Energy shield absorbing a hit, a glassy electric ripple, a bright shimmer |
| shieldDown | 0.8 s | **8G SPACE SHIELD DOWN:** Ship shield collapsing, a descending electric fizzle and crackle |
| shieldUp | 0.8 s | **8G SPACE SHIELD UP:** Ship shield powering up, a rising hum that ends in a soft chime |
| hullHit | 0.4 s | **8G SPACE HULL HIT:** A laser striking a small ship's metal hull, a hard clang with a sizzle |
| asteroidBump | 0.5 s | **8G SPACE ASTEROID BUMP:** A ship scraping and bouncing off a rocky asteroid, a stony crunch and a metal thud |
| asteroidBreak | 0.7 s | **8G SPACE ASTEROID BREAK:** A laser shattering a space rock, a crackle and gravel bursting apart |
| boostStart | 0.6 s | **8G SPACE BOOST START:** Starfighter afterburner kicking in, a quick rising whoosh and a roar |
| engineLoop | 4 s, seamless loop | **8G SPACE ENGINE LOOP:** Small starfighter engine idle hum, smooth and warm, sci-fi |
| boostLoop | 4 s, seamless loop | **8G SPACE BOOST LOOP:** The same engine at full afterburner, brighter and more intense |
| engineSmallLoop | 4 s, seamless loop | **8G SPACE ENGINE SMALL LOOP:** Scout and fighter engine cruising, a light fast turbine whine over a soft plasma purr, smooth and steady, seamless loop |
| engineHeavyLoop | 4 s, seamless loop | **8G SPACE ENGINE HEAVY LOOP:** Gunner and cruiser engine cruising, a deep throbbing plasma drive with a low rumble, steady and powerful, seamless loop |
| engineHugeLoop | 4 s, seamless loop | **8G SPACE ENGINE HUGE LOOP:** Flagship and colony ship engines, a massive slow capital-ship drone, layered deep hums and a distant reactor pulse, seamless loop |
| enginePirateLoop | 4 s, seamless loop | **8G SPACE ENGINE PIRATE LOOP:** Pirate ship engine flying past, a rough rattling sputtering thruster with a harsh buzz, seamless loop |
| engineMachineLoop | 4 s, seamless loop | **8G SPACE ENGINE MACHINE LOOP:** Robot ship engine, a clean electric hum with a faint glitchy flutter, seamless loop |
| burstStart | 0.8 s | **8G SPACE BURST START:** Starfighter hitting the burst boost, an instant ignition punch, a sharp whoosh and a roar kicking in |
| burstLoop | 3 s, seamless loop | **8G SPACE BURST LOOP:** Starfighter at full burst speed, a bright intense roaring plasma thrust with wind-rush texture, higher pitched than cruising, seamless loop |
| burstEnd | 1.0 s | **8G SPACE BURST END:** Burst boost cutting out, a roar spooling down into a soft hiss and settling back to a cruising hum |
| flyBy | 1.5 s | **8G SPACE FLY BY:** A small spaceship zooming past close, a doppler whoosh with an engine whine rising then falling |
| lowHull | 1.0 s | **8G SPACE LOW HULL:** Ship cockpit low-hull warning, a soft double beep with a heartbeat thump |
| scannerPing | 0.6 s | **8G SPACE SCANNER PING:** Ship scanner detecting something, a sonar-like ping with a soft echo |
| pickupCrate | 0.5 s | **8G SPACE PICKUP CRATE:** Collecting a floating cargo crate, a bright magnetic clunk and a sparkle |
| refuel | 2 s | **8G SPACE REFUEL:** Ship refuelling at a depot, liquid gurgle, a pump hum and a click at the end |
| towLatch | 0.6 s | **8G SPACE TOW LATCH:** Tow beam latching onto a wreck, a magnetic clamp and a short electric hum |
| dockLand | 1.5 s | **8G SPACE DOCK LAND:** Small ship landing on a docking pad, landing gear thuds, a hydraulic hiss and engines winding down |
| undock | 1.5 s | **8G SPACE UNDOCK:** Docking clamps releasing, then engines spooling up for take-off |
| swoopIn | 1.2 s | **8G SPACE SWOOP IN:** Camera swooping close to a space station, a smooth airy whoosh with a soft doppler |

## 2 · Stations, stargates, installs
| Key | Length | Prompt |
|---|---|---|
| lanceCharge | 1.5 s | **8G STATION LANCE CHARGE:** Giant station dish charging a super laser, three rising electric hums building to a peak |
| lanceFire | 2.5 s | **8G STATION LANCE FIRE:** Massive red energy lance beam firing, a deep roaring beam with crackling electricity, fading out slowly |
| stationTurret | 0.3 s | **8G STATION STATION TURRET:** Station point-defence turret firing a rapid burst |
| stargateOpen | 3 s | **8G STATION STARGATE OPEN:** Stargate activating, a swirling energy vortex opening with a deep resonant hum |
| stargateJump | 1.5 s | **8G STATION STARGATE JUMP:** Ship jumping through a stargate, a rising whoosh into a bright flash |
| mineArm | 2 s, loop-friendly | **8G STATION MINE ARM:** Mining arm servos moving, hydraulic whirs and a gentle clank |
| siloHatch | 1.0 s | **8G STATION SILO HATCH:** Metal hatch opening on an ore silo, a hydraulic hiss and a clunk |
| oreDrop | 0.6 s | **8G STATION ORE DROP:** Chunk of glowing ore dropping into a metal silo, a rattle and a thud |
| shipyardWeld | 2 s, loop | **8G STATION SHIPYARD WELD:** Robotic welding in a shipyard, electric arc buzz with sparks |
| buoyLight | 0.8 s | **8G STATION BUOY LIGHT:** Navigation buoy lighting up, a soft electronic chime that rises |

## 3 · Creatures
| Key | Length | Prompt |
|---|---|---|
| mothScreech | 1.2 s | **8G CREATURE MOTH SCREECH:** Giant space moth cry, an eerie fluttering screech, alien and mystical |
| mothWings | 2 s, loop | **8G CREATURE MOTH WINGS:** Huge moth wings beating slowly in space, soft heavy flaps with a shimmer |
| mothPulse | 1.0 s | **8G CREATURE MOTH PULSE:** Creature releasing an energy pulse ring, a deep whoomp with an electric ripple |
| mothLaser | 0.4 s | **8G CREATURE MOTH LASER:** Organic alien laser shot, a wet buzzing zap |
| serpentHiss | 1.0 s | **8G CREATURE SERPENT HISS:** Space serpent hiss, a long sibilant hiss with a low growl |
| creatureHit | 0.3 s | **8G CREATURE CREATURE HIT:** A laser hitting an alien creature, a fleshy sizzle and a squelch |
| creatureDie | 1.5 s | **8G CREATURE CREATURE DIE:** Alien space creature dying, a fading wail and an energy dissipating |
| nestPulse | 2 s, loop | **8G CREATURE NEST PULSE:** Alien creature nest throbbing, an organic heartbeat with a hum |

## 4 · Machine Fleet (hacked robots; they are victims, not villains)
| Key | Length | Prompt |
|---|---|---|
| machineSpot | 1.0 s | **8G MACHINE MACHINE SPOT:** Glitched robot voice chirp, a friendly robot voice distorted by a hack, stuttering |
| machineGlitch | 0.6 s | **8G MACHINE MACHINE GLITCH:** Digital glitch burst, data corruption crackle, brief static |
| machineDown | 1.0 s | **8G MACHINE MACHINE DOWN:** Robot ship powering down, servos winding down and a soft electronic sigh |
| unhack | 2 s | **8G MACHINE UNHACK:** Robot being freed from a hack, glitchy static clearing into a clean bright tone, hopeful |

## 5 · Pirates
| Key | Length | Prompt |
|---|---|---|
| pirateAlarm | 1.0 s | **8G PIRATE PIRATE ALARM:** Pirate ship alarm, a harsh two-tone klaxon, short |
| pirateBaseGun | 0.4 s | **8G PIRATE PIRATE BASE GUN:** Heavy pirate base cannon firing, a deep boom |
| pirateTaunt | 1.5 s | **8G PIRATE PIRATE TAUNT:** Gruff space pirate laugh over a crackly radio, no words |

## 6 · Dock walk + UI
| Key | Length | Prompt |
|---|---|---|
| footstepMetal | 0.25 s ×4 variations | **8G DOCK FOOTSTEP METAL:** Fox paw steps on a metal dock deck, light and soft |
| energyShieldHum | 4 s, loop | **8G DOCK ENERGY SHIELD HUM:** Air-holding energy shield over a walkway, a gentle steady hum |
| teleport | 1.5 s | **8G DOCK TELEPORT:** Teleporter pad beaming someone away, a rising shimmer into a soft flash |
| menuOpen | 0.2 s | **8G DOCK MENU OPEN:** Clean UI panel opening, a short soft click and a whoosh |
| menuSelect | 0.1 s | **8G DOCK MENU SELECT:** Crisp UI button tap, a short tick |
| toast | 0.4 s | **8G DOCK TOAST:** Soft notification chime for an on-screen message |
| questStep | 1.0 s | **8G DOCK QUEST STEP:** Quest step complete, a bright three-note chime |


## 7 · THRUSTERS (replaces every engine sound: the sound of MOVING, not of an engine)
Ben: no engine hum. Each loop is the sound of a ship moving through space: rushing thrust, air-like whoosh, flowing motion. Make each one loop with no click where the end meets the start, a steady level, and no fade in or out.
| Key | Length | Prompt |
|---|---|---|
| thrustSmallLoop | 4 s, seamless loop | **8G THRUST SMALL LOOP:** A small fast spaceship gliding forward, a soft steady rushing whoosh of thrusters like wind streaming past, smooth flowing motion, no engine hum, no motor, seamless loop |
| thrustHeavyLoop | 4 s, seamless loop | **8G THRUST HEAVY LOOP:** A heavy armoured spaceship pushing forward, a deep powerful rushing thrust with a low airy roar like a strong wind tunnel, steady motion, no engine hum, seamless loop |
| thrustHugeLoop | 4 s, seamless loop | **8G THRUST HUGE LOOP:** A giant flagship moving slowly through space, a vast slow deep whoosh of thrust like a huge gust that never ends, majestic flowing motion, no engine hum, seamless loop |
| thrustBurstLoop | 3 s, seamless loop | **8G THRUST BURST LOOP:** A starfighter at full burst speed, an intense fast rushing jet of thrust with wind tearing past, bright and powerful, pure motion, no engine hum, seamless loop |
| thrustPirateLoop | 4 s, seamless loop | **8G THRUST PIRATE LOOP:** A rough pirate ship flying past, a harsh rushing thrust with gritty crackle and a rattling whoosh, no engine hum, seamless loop |
| thrustMachineLoop | 4 s, seamless loop | **8G THRUST MACHINE LOOP:** A robot ship gliding, a clean airy rushing thrust with a faint shimmering digital flutter, smooth motion, no engine hum, seamless loop |
| thrustPuff | 0.4 s | **8G THRUST PUFF:** One short burst from a small manoeuvring thruster, a quick soft gas puff whoosh, like a spaceship steering jet firing once |
| thrustStart | 1.0 s | **8G THRUST START:** A spaceship starting to move from still, a rising rushing whoosh of thrusters building up into steady flow |
| thrustStop | 1.0 s | **8G THRUST STOP:** A spaceship easing to a stop, the rushing thrust whoosh fading down into silence with a soft final puff |

These replace engineSmallLoop / engineLoop / engineHeavyLoop / engineHugeLoop / burstLoop / boostLoop / enginePirateLoop / engineMachineLoop. Until they arrive, the game uses its own synth thrust (rushing filtered noise, no hum).

## How they plug in
When the files arrive, put them in `sfx/` and tell me. I'll add a sample player to `engine/fighter-sfx.js` that uses a recorded file when it has one and falls back to the synth when it doesn't. They'll show up in the Fighter Gear Lab SOUNDS panel, so you can tune volume and pitch for each one.
