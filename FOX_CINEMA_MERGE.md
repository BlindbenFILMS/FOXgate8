# FOX CINEMA → merge into a world (handoff for a new chat)

FOX CINEMA `[foxCinema]` is a **drop-in interior + job**. Ben can walk it (lobby, snack counter, SCREEN 1), sit and watch the movie, and work the snack counter (the popcorn shift). This file says exactly how to put it into any world (Meru, Gaya, Jidda, …).

## 1. What is in the box
| File | What it is |
|---|---|
| `minigames/cinema/snack-counter.js` | `buildCinema(ctx)` = the interior (geometry, colliders, movie screen) · `createSnackCounter(opts)` = the whole game (walk + shift) · `cinemaSpots(K)`, `CINEMA_PEOPLE`, `CINEMA_DIALOGUE`, `CINEMA` |
| `minigames/cinema/cinema-audio.js` | All sound + music, synthesised live with Web Audio (no audio files to copy) |
| `Fox Cinema.dc.html` | Stand-alone page. `?work=1` opens on the welcome card · `?demo=1` plays the demo · **`?embed=1` = the shift for a world panel** (see step 5) · `&world=Meru` names the world |
| `Fox Cinema Phone Preview.dc.html` | 390×844 + 844×390 check page |

Already in the pack and used as-is: `engine/restaurant-kit.js`, `engine/cast.js`, `engine/save.js`, `engine/textures.js`, `fox-kit.js`, `village-game.js`, `meru-game.js` (canvasTex), `vendor/three`, `Game HUD.dc.html`. Nothing shared was changed.

## 2. Size and shape
- Footprint **23 m × 11 m**: lobby 14 × 11 (x −7…7) + SCREEN 1 9 × 11 (x 7…16), z −5.5…5.5, height 4.6 m. The origin is the lobby centre.
- Entrance: glass doors in the **south wall (+z)**, centre of the lobby. The snack counter is on the north wall; SCREEN 1 is to the east through curtains.
- So the outside building needs a door on the side that faces the street, and the interior's +z points out of that door.

## 3. Two ways to place it (same rule as the restaurants)
**A. Quick-fade interior (recommended, how Meru does Burgers).** Build it far from the map (e.g. origin `{ x: 640, z: 230 }`), enter with the quick fade. Any outside building works.
**B. Inside the real building (cutaway).** Only if the outside building is at least 23 × 11 m. Build it at the building's centre, hide the roof + front walls while inside.

## 4. Wiring it into the world engine (Meru-style code; adapt names to the world)
```js
import { buildCinema, cinemaSpots, CINEMA_PEOPLE, CINEMA_DIALOGUE } from './minigames/cinema/snack-counter.js';

// build (world-kit gives M, toon, grad, addOutline; canvasTex from engine/textures.js)
const CIN = buildCinema({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin: { x: 640, z: 230 } });
colliders.push(...CIN.colliders);            // Meru format: { box:[x0,x1,z0,z1] } and { c:[x,z,r] }, world coords
const SP = cinemaSpots(CIN);                 // door, enter, reel, stub, sit, posters, screenDoor, counter, screen

// add to the room table so the indoor camera/lighting logic knows it
ROOMS.cinema = { x: 640, z: 230, w: 23, d: 11, h: 4.6, exit: SP.door };
ROOM_G.cinema = CIN.root;

// NPCs: Reel at the counter, Stub at the ticket podium
CINEMA_PEOPLE.forEach(p => mkNpc({ key: p.key, name: p.name, role: p.role, outfit: p.outfit, torso: p.torso, crest: p.crest, mood: p.mood,
  x: SP[p.spot].x, z: SP[p.spot].z, face: SP[p.spot].face }));

// talk: turn CINEMA_DIALOGUE into the world's story format (engine/story.js branch); the choice with do:'work' opens the shift (step 5)
DYN.cinemaReel = () => branch(CINEMA_DIALOGUE.reel.lines.map(t => ({ who: 'npc', text: t })),
  CINEMA_DIALOGUE.reel.choices.map(c => ({ label: c.label, replies: c.replies, do: c.do === 'work' ? 'cinemaShift' : undefined })));
DYN.cinemaStub = () => branch([{ who: 'npc', text: pick(CINEMA_DIALOGUE.stub.lines) }], []);

// outside door → inside (quick fade), and the exit prompt inside
//   door label 'Fox Cinema' → St.room = 'cinema'; goTo(SP.enter.x, SP.enter.z, SP.enter.face, true);
//   inside, within 2.2 m of SP.door → { kind: 'exit', text: 'Leave' }
// extra prompt: within 1 m of SP.sit.stand → 'Sit and watch the movie' (put the player at SP.sit, face +x, camera behind looking at SP.screen)

// every frame while inside: the movie on the screen, marquee bulbs, projector beam
if (St.indoor && St.room === 'cinema') CIN.update(dt, { movie: true, dim: 0 });
```

## 5. The shift (snack counter) inside a world
Don't port the shift into the world engine. Open the page in the world's game panel (the same way Meru opens the casino games):
```js
// when the Reel choice with do:'cinemaShift' runs:
this.setState({ game: { src: 'Fox Cinema.dc.html?embed=1&world=Meru', label: 'Snack counter', where: 'Fox Cinema' } });
// close the panel when the player taps TAKE A BREAK / BACK TO THE LOBBY:
addEventListener('message', e => { if (e.data && e.data.foxCinema === 'exit') this.closeGame(); });
```
`?embed=1` opens straight on the welcome card, never shows the walk mode, and posts `{ foxCinema: 'exit', gold, day }` to the parent on leaving. Gold, the day, upgrades and the uniform are in the shared save (`engine/save.js`, keys `cinema.snack.*`, flag `cinemaUniform`), so the world's HUD sees the new gold at once.

## 6. Sound + music
- All synthesised (`cinema-audio.js`): no files. Music cues: **lobby** (lounge bossa), **shift** (snack-rush groove, speeds up in the last 30 s), **movie** (space score in SCREEN 1), plus stings. SFX for every station, the register, customers, footsteps, crowd murmur and the projector.
- In a world: if the world plays its own music, keep the cinema walk-around quiet by not calling `createSnackCounter` (the world uses `buildCinema` only, which makes no sound). For lobby atmosphere, the world can create `createCinemaAudio(audio)` itself and call `.update(dt, { cue: 'lobby', crowd: 0.8 })` while inside the room (and `.cue(null)` on leaving).
- The page has a SOUND button (sound → no music → muted), saved in `localStorage['foxCinema.audio.v1']`. Game HUD's sound toggle calls `toggleSound()`.

## 7. Customers / names per world
`createSnackCounter({ customers: [...] })` takes the world's own townsfolk (`{ name, torso:[3 colours], outfit? }`). Default is a generic list (FERN, BOLT, JUNIPER…). To pass them through the panel, add them to the page as a query or a small JSON file; simplest: edit the default list for that world.

## 8. Phone checks before calling it done
Open `Fox Cinema Phone Preview.dc.html`, check 390×844 and 844×390, then in the world: walk in, talk to Reel, work one shift, take a break, sit and watch, leave. Update BUILD_PLAN.md.

## 9. First message for the new chat
> Read START_HERE.md, then CLAUDE.md, then BUILD_PLAN.md, then FOX_CINEMA_MERGE.md. Put FOX CINEMA into [WORLD] in the [BUILDING] building, using way A (quick fade). Ask me which building if you need to. Mobile first: check 390x844 and 844x390.
