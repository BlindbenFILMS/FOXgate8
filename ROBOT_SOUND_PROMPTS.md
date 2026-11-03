# ROBOT SOUND PROMPTS · Pearl Sail robots (tank, drone, walker)

Paste each prompt into your sound generator. Save each file with the **exact name** shown, as MP3, into the folder **audio/robots/**.
They replace the synth sounds; I wire them in once they are uploaded.

## RULES FOR EVERY FILE (so 6 robots moving at once still sound clean)

- **Mono**, 44.1 kHz, MP3 192 kbps.
- **Dry**: no reverb, no echo, no music. The game adds distance + walls itself.
- **Same loudness** for all files: about -16 LUFS, peaks no higher than -3 dB.
- **No silence** at the start. Tails short (under 0.3 s) unless the prompt says otherwise.
- **LOOPS** (marked LOOP) must loop **seamlessly**: same sound at the end as at the start, no fade, no click.
- Keep **low bass light** on movement loops (the game layers many robots; heavy bass turns to mud).
- **Robots are hacked, not evil**: mechanical, a little sad and glitchy, never monster growls.
- Where a prompt asks for **3 versions**, make 3 short takes that differ slightly (the game picks one at random so repeats don't sound robotic).

---

## TANK (the crawler: glove tank + cannon tank)

| File name | Prompt | Length |
|---|---|---|
| `tank-roll.mp3` (LOOP) | Small armored robot tank rolling on rubber-and-steel treads over a smooth tower floor. Steady clicking track links, soft motor whine underneath. Medium speed. Seamless loop. | 2 s |
| `tank-idle.mp3` (LOOP) | The same small robot tank parked, engine idling: low gentle electric hum with a slow mechanical tick. Quiet. Seamless loop. | 2 s |
| `tank-turn.mp3` | Robot tank turret turning: short servo whir with a soft gear click at the end. | 0.6 s |
| `tank-windup.mp3` | Robot tank winding up a punch with big boxing-glove arms: rising hydraulic hiss and spring tension creak, building fast. | 0.8 s |
| `tank-lunge.mp3` | Robot tank charging forward: tread burst, motor revs up hard, quick whoosh. | 0.7 s |
| `tank-cannon-charge.mp3` | Small plasma cannon charging on a robot: rising electric hum, crackle, bright whine at the top. | 1.2 s |
| `tank-cannon-fire.mp3` | Small plasma cannon firing one shot: punchy electric thump with a short sizzle. Make 3 versions: `tank-cannon-fire-1.mp3`, `-2`, `-3`. | 0.5 s |
| `tank-pop.mp3` | Robot hatch popping open: pneumatic puff and a metal clack. | 0.4 s |

## DRONE (flying robot)

| File name | Prompt | Length |
|---|---|---|
| `drone-hover.mp3` (LOOP) | Small flying robot drone hovering: four little rotors, smooth airy buzz, slight soft wobble. Not too high-pitched. Seamless loop. | 2 s |
| `drone-fly.mp3` (LOOP) | The same small drone moving fast: rotors pitched up a little, light wind rush. Seamless loop. | 2 s |
| `drone-aim.mp3` | Drone locking on: three quick rising beeps and a tiny lens servo. | 0.6 s |
| `drone-charge.mp3` | Drone charging its laser: thin rising electric whine. | 0.9 s |
| `drone-shot.mp3` | Drone firing one small laser bolt: quick bright zap. Make 3 versions: `drone-shot-1.mp3`, `-2`, `-3`. | 0.3 s |
| `drone-dive.mp3` | Drone diving at the player: rotors scream up in pitch, sharp air whoosh past the ear, then a quick pull-up. | 1.0 s |
| `drone-dive-warn.mp3` | Drone about to dive: rotors stall for a beat, then a short rising whistle. | 0.5 s |
| `drone-fall.mp3` | Drone knocked out of the air: rotors sputter and wind down, a small metal clatter on the floor. | 1.2 s |

## WALKER (the guard: sword guard, pistol guard; the boss uses the same, pitched lower)

| File name | Prompt | Length |
|---|---|---|
| `walker-step.mp3` | One footstep of a two-legged metal robot on a hard floor: soft metal foot thud with a small servo whir. Make 4 versions: `walker-step-1.mp3` … `-4`. | 0.35 s |
| `walker-shuffle.mp3` (LOOP) | The same robot standing still, shifting weight: very quiet servo hums and an occasional tiny creak. Seamless loop. | 3 s |
| `walker-windup.mp3` | Robot raising its sword for a big swing: servo whine rising, armor plates shifting. | 0.7 s |
| `walker-bash.mp3` | Robot shield-bash: heavy metal shove, a grunt of hydraulics, a clang. | 0.5 s |
| `walker-block.mp3` | Robot blocking a sword hit with its arm guard: bright metal clang, short ring. Make 3 versions: `walker-block-1.mp3`, `-2`, `-3`. | 0.5 s |
| `walker-shield-break.mp3` | Robot energy shield shattering: glassy electric crack, sparkle, fizzle out. | 0.9 s |
| `walker-stagger.mp3` | Robot knocked off balance: servos grind, a stumble of two metal steps, a glitch beep. | 0.8 s |
| `walker-aim.mp3` | Pistol robot raising its gun: servo click, short targeting chirp. | 0.5 s |

## ALL ROBOTS (shared)

| File name | Prompt | Length |
|---|---|---|
| `robot-chirp.mp3` | Small friendly-sounding robot chirp, two notes, like it noticed you. Make 3 versions: `robot-chirp-1.mp3`, `-2`, `-3`. | 0.4 s |
| `robot-glitch.mp3` | A hacked robot's voice breaking: a short garbled digital stutter, a split second of a gentle real voice underneath, then static. No words. | 1.0 s |
| `robot-hit.mp3` | Laser hitting robot armor: hot sizzle on metal with a small spark crackle. Make 3 versions: `robot-hit-1.mp3`, `-2`, `-3`. | 0.4 s |
| `robot-down.mp3` | A robot powering down after being beaten (not exploding): servos wind down, a soft metal sag, a fading beep. | 1.5 s |
| `robot-freed.mp3` | A hacked robot set free: static clears, a warm rising chime, a calm single beep. Hopeful. | 1.5 s |

## SCOPE (the new called-shot mode)

| File name | Prompt | Length |
|---|---|---|
| `scope-in.mp3` | Time freezing: a deep soft whoosh down, a muffled heartbeat thump, the world goes quiet. | 0.8 s |
| `scope-tag.mp3` | Marking a target in a tactical scope: crisp short UI click with a tiny rising tone. | 0.2 s |
| `scope-out.mp3` | Time snapping back: a quick rising whoosh and a bright snap. | 0.6 s |

---

**When they are ready:** upload the files (or attach the folder) and say "robot sounds are in". I will wire each one in, mix the loops so many robots blend (nearest robots loudest, far ones softer, never more than 4 loops at once), and add a volume row for each in the Fighter Gear Lab → SOUNDS.
