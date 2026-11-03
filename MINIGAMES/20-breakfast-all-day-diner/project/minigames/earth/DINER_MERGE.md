# BREAKFAST ALL DAY DINER: how to put it into an Earth world

Hand this file to the chat that builds the Earth map, together with the files below.

## What it is
- A walk-in interior **and** a restaurant job, both in one module.
- Room key `diner`. It is the door labelled "Breakfast All Day Diner" in the 2D zone `earthMojave` (see `uploads/8GATES_DESIGN_BRIEF_ALL.md` under THE MOJAVE).
- Walking uses the standard **Game HUD**: the engine already has the full ENGINE CONTRACT (talk, choose, nextLine, setStick, melee/range/jump, eye, camera, mapData…).

## Files (keep these paths)
| File | What it does |
|---|---|
| `minigames/earth/breakfast-shift.js` | `buildBreakfastDiner(ctx)` (the room) + `createBreakfastShift({ container, onState, opts })` (walk + shift + demo) |
| `minigames/earth/diner-audio.js` | every sound and both music tracks, made live in Web Audio. No sound files are needed. |
| `Earth Breakfast Diner.dc.html` | the stand-alone page: welcome card, tickets, station bar, day card, Game HUD in walk mode |
| `Earth Breakfast Diner Phone Preview.dc.html` | phone check (390x844 + 844x390) |

The module also imports these shared files. They are already in the project, so don't copy or edit them:
- `engine/restaurant-kit.js`, `engine/cast.js`, `engine/save.js`
- `fox-kit.js`, `village-game.js`, `meru-game.js`
- `vendor/three/three.module.js`

## Room facts (`DINER_ROOM` export)
- The room is 14 m wide (x) by 11 m deep (z) by 4.2 m high. The origin is the floor centre.
- The street door is on the **+z wall at x 4.4**.
- Inside spawn: `{ x: 4.4, z: 4.8, face: Math.PI }`, facing into the room.
- The kitchen is at the −z end. The flat-top runs along x at z −3.2, and the counter and stools are at z −1.9 to −1.1.
- So the outside building needs a door on the street side about 2.6 m right of centre (seen from the street). Its footprint must be at least 14 x 11 m if you build the room inside it (route B).

## ROUTE A: quick-fade interior (recommended, matches the project rule)
The world page already mounts Game HUD with `game="{{ engine }}"`. While the player is inside the diner, hand the HUD the diner engine instead of the world engine.

```js
import { createBreakfastShift, DINER_ROOM } from './minigames/earth/breakfast-shift.js';
// on the diner door (doorLabel 'diner'): fade out, then
const box = document.createElement('div'); box.style.cssText = 'position:absolute;inset:0;z-index:1'; stageHost.appendChild(box);
world.setPaused(true);
diner = await createBreakfastShift({ container: box, onState: h => page.setState({ dinerH: h }), opts: {
  start: 'walk',                       // 'walk' (enter on foot) · 'intro' (welcome card) · 'shift' (straight to work)
  exitLabel: 'The Mojave',             // the door prompt says "Leave · The Mojave"
  onExit: () => { diner.destroy(); box.remove(); diner = null; world.setPaused(false); /* place player outside the door, fade in */ },
} });
page.setState({ engine: diner });     // the Game HUD now drives the diner
```

The page has to show the diner's own UI while `diner` is active:
- **Walk mode** (`h.mode === 'walk'`): no extra UI. Give the HUD `stdHud.prompt`, `dialog`, `toast`, `quest` and `place` from `h.walk`. Copy the `stdHud` line in `Earth Breakfast Diner.dc.html`.
- **Shift mode** (`intro`, `glide`, `shift`, `done`): copy every `<sc-if>` block and the `renderVals` lines from `Earth Breakfast Diner.dc.html`:
  - the top bar and tickets
  - the station bar and gauge
  - the react card, pay coins, demo caption, help, and day card
- **HUD flags:** set `busy` on the HUD whenever `h.mode !== 'walk'`, and put the stage at `top: 0` during a shift.
- **Easiest option:** turn the diner page into a component (`<dc-import name="Earth Breakfast Diner">`) and give it an `on-exit` prop.

## ROUTE B: build it inside the real building (cutaway)
- `buildBreakfastDiner({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin: { x, z } })` builds the full room at `origin` in the world's own scene. Use it for the look through the windows, or for a cutaway.
- It returns `K`, which includes:
  - `K.cut`: the back wall, ceiling, shelves and fans, to hide when the camera drops into the kitchen
  - `K.front`: the front wall and windows, to hide for a cutaway
  - `K.colliders`: local `[x0, x1, z0, z1]` boxes, which need `origin` added
- Positions in `K` are LOCAL to the origin.
- For the job itself, still use route A. The shift game owns its own renderer and camera.

## Save keys and flags (engine/save.js)
- Stats:
  - `earth.diner.day`: the day reached
  - `earth.diner.best`: the best shift pay
  - `earth.diner.stars`: employee-of-the-day count
  - `earth.diner.upg.<id>`: upgrades: ladle, pot, lamps, guard, jukebox
- Flags:
  - `grillOn`: set when Ben says "I'm on it boss!" or takes the apron. Same name as the 2D `play.marks`.
  - `dinerUniform`: the uniform is unlocked after 2 served
- Gold goes through `save.addGold` at the end of each shift. The demo saves nothing.

## People in the room (2D names and lines)
- Sunny (grill boss)
- Dottie and June (front of house)
- Marguerite
- Bobby, Faye and Duane
- The Man and The Other Man: their booth has four untouched full breakfasts
- Counter customers during a shift: Lou-Ann, Chester, Del, Hollis Deane, Wade, Dr Alma Reyes, Roxy Calderon, Hector

If the Earth map also places these people outside the diner, hide the outside copies while they are inside, or pick other people.

## Sound
- `diner-audio.js` runs on the shared `Ambience`, which starts on the first tap.
- It plays two music tracks:
  - `shuffle`: the 2D breakfast tune arranged for the jukebox, used while walking. It gets louder near the jukebox.
  - `rush`: a boogie-woogie during the shift that speeds up for the last 30 s.
- Each station has its own "ready" chime (cakes, eggs, bacon, hash, coffee, flip), panned left or right to where it is on the griddle. This helps players with low vision, and Android phones also buzz.
- `game.toggleSound()` mutes everything. `game.toggleMusic()` turns the music on and off.

## Try this after merging
1. Walk in from the street. Check that the "Leave · The Mojave" prompt shows at the door and returns you outside.
2. Talk to Sunny and pick "I'm on it boss!". The shift should start.
3. Work a shift until the day card shows, then press TAKE A BREAK. You should be back on foot in the diner.
4. Watch the demo.
5. Check 390x844 and 844x390.
