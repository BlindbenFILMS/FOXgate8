# FELT'S BALL WORKS: merge guide (for the next chat)

Tennis ball factory job for **Gaya**. Room name **`[gayaBallFactory]`**. It's fully built, tested and has sound and music. This guide explains how to drop it into a world map (Gaya, or any FOX world building).

---

## 1. What to paste into the new chat

Upload the whole 8gates-pack folder with this export merged in. Then say:

> Read START_HERE.md, CLAUDE.md, BUILD_PLAN.md and BALLWORKS_MERGE_GUIDE.md. Merge Felt's Ball Works into the Gaya world: put it in a building on [THE STADIUM PATH / where you want it]. Walk in through the door with the quick fade, Felt at his office, and "Put me to work" opens the shift full-screen in the game panel. Mobile first: check 390x844 and 844x390.

---

## 2. Files in this export (keep the folder layout)

| File | What it is |
|---|---|
| `Gaya Ball Factory.dc.html` | The game page: welcome card, shift, results, walk mode. `?embed=1` = panel mode for a world. `?demo=1` starts the demo, `?walk=1` starts in walk mode. |
| `Gaya Ball Factory Phone Preview.dc.html` | iPhone portrait and landscape side by side. |
| `minigames/gaya/ball-factory.js` | The engine. Exports: `buildFactory(ctx)` (the interior), `tickFactory(K, dt)` (idle life), `createBallFactory(...)` (the stand-alone game), `mergeStatic`, plus `FELT`, `FELT_LINES`, `COLOURS`, `UPGRADES`, `CUSTOMERS`, `FACTORY`. |
| `minigames/gaya/ballworks-audio.js` | All sound effects and the music, made in code. No audio files are needed. |
| `worlds/gaya-ballworks.js` | **The world drop-in**: `BALLWORKS`, `buildBallWorks(K, origin)`, `PEOPLE(origin)`, `DYN.feltForeman`, `GAME`. |
| `engine/save.js` | **Updated shared file.** It now syncs across pages: gold earned in the panel shows up in the world straight away, and the world no longer overwrites it. It also adds `save.reload()`. This is safe for every existing world. |
| `BUILD_PLAN.md`, `START_HERE.md` | Updated notes. |

**Already in the pack (not changed):** `engine/restaurant-kit.js`, `engine/cast.js`, `fox-kit.js`, `village-game.js`, `meru-game.js`, `vendor/three/three.module.js`, `Game HUD.dc.html`, `support.js`, `_ds/…`.

---

## 3. How the merge works (same pattern as Sizzle's diner)

- **Walking inside:** the world builds the room with `buildBallWorks(...)`. The world's own player, camera and HUD walk around in it, and Felt stands at his desk as a normal world NPC.
- **Working a shift:** "Put me to work." fires `do: 'ballworks'`. The world opens `GAME.url` (`Gaya Ball Factory.dc.html?embed=1`) in its game panel, the same way Meru opens `diner.html` and the casino games.
  - In embed mode the welcome card and the results card show **BACK TO GAYA**. That button posts `{ type: '8g-game-close', game: 'gayaBallFactory' }` to the parent window.
- **Gold and progress:** these go through `engine/save.js`. The updated save.js listens for changes from the panel, so the world picks up the new gold by itself.

---

## 4. Code to add to the world engine (e.g. `gaya-game.js`, written like `meru-game.js`)

```js
import * as BW from './worlds/gaya-ballworks.js';
import { canvasTex } from './meru-game.js';   // or the world's own canvasTex

// 1) BUILD. Fade interiors live far from the map (like the Tavern). Pick a free spot.
const BW_ORIGIN = { x: 900, z: 400 };
const ballworks = BW.buildBallWorks({ THREE, scene, M, toon, grad, colliders, camBlockers, canvasTex }, BW_ORIGIN);
ballworks.setVisible(false);                   // only draw it while the player is inside

// 2) PEOPLE + TALK. Add Felt to the NPC list and his talk tree to the DYN table.
PEOPLE.push(...ballworks.people);              // { key:'feltForeman', name:'Felt', outfit, torso, look:{fur,furDark}, x, z, face }
Object.assign(DYN, BW.DYN);                    // feltForeman → branch with do: 'ballworks'

// 3) DOOR. On the map building's door: fade in, put the player at ballworks.spawn facing -z, label 'gayaBallFactory'.
//    Leaving: player inside the ballworks.exit circle (x, z, r) → fade back out to the map door.
function enterBallWorks() { ballworks.setVisible(true); player.position.set(ballworks.spawn.x, 0, ballworks.spawn.z); player.rotation.y = Math.PI; St.where = 'gayaBallFactory'; save.where('gaya', 'gayaBallFactory'); }
function leaveBallWorks() { ballworks.setVisible(false); /* back to the map door */ }

// 4) EVERY FRAME while inside
if (St.where === 'gayaBallFactory') ballworks.tick(dt);

// 5) ACTION from Felt's "Put me to work."
if (a === 'ballworks') d.then = () => { St.playing = 'ballworks'; onPlayGame(BW.GAME.key, BW.GAME.title, BW.GAME.url, BW.GAME.label); };

// Optional: "Look ·" prompts at each machine
// ballworks.looks → [{ x, z, name, line, exit }]
```

**Page side (the world's `.dc.html`, where `onPlayGame` and the game panel live):**

```js
// full-screen panel for the Ball Works on phones (the game has its own HUD and bars)
gameFull: S.game && S.game.key === 'ballworks'   // → panel style: position:absolute; inset:0; no padding, no title bar
// close the panel when the game says BACK TO GAYA
componentDidMount() { this.onMsg = e => { if (e.data && e.data.type === '8g-game-close') this.closeGame(); }; addEventListener('message', this.onMsg); }
componentWillUnmount() { removeEventListener('message', this.onMsg); }
// after closing, refresh anything that shows gold (save.js has already synced; call save.reload() if in doubt)
```

---

## 5. Room data (interior metres; origin = room centre; +z = front wall)

- **Size:** 20 × 14 m, height 5.2 m. Open top, and the walls are only visible from inside (built for the top-down camera). Hide the front wall (`F.front`) when the camera is outside it; `buildBallWorks` already adds it to `camBlockers`.
- **Front door:** x 7.2, z 7.0. Spawn at x 7.2, z 5.4. Exit trigger at x 7.2, z 6.3, radius 0.9.
- **Felt's office:** front-left, Felt at x -7.3, z 2.7.
- **The line:** along z -1.8: 1 PRESS x -6.4 · 2 DYE x -3.2 · 3 SEAM x 0 · 4 TEST x 3.2 · 5 CAN x 6.4. The loading dock is behind it.
- **Colliders:** 26 boxes, already pushed in the world format `{ box: [x0, x1, z0, z1] }`.
- **Phone budget:** about 300 draw calls when the whole room is in view. Static meshes are merged per material. Always `setVisible(false)` when the player is outside.
- **Outside the building (the world's job):** a building on the map with a "BALL WORKS" sign and a door. Suggested look: cream brick, Gaya green base band, gold trim, a big tennis ball on the roof, a roll-up SHIPPING door on the side.

---

## 6. Save keys (shared save)

- **Stats:** `gaya.balls.day`, `gaya.balls.best`, `gaya.balls.upg.<guide|pump|lamp|mould|radio>`
- **Flag:** `ballUniform`
- **Gold:** `save.addGold` and `save.spend`, through the shared save. `save.where('gaya','gayaBallFactory')` runs when a shift starts.

## 7. Sound and music

- **Everything is made in code** by `ballworks-audio.js`: around 30 sound effects and an F-major factory groove in three moods (chill / work / hurry), plus end stingers. Nothing to upload.
- **Controls:** the speaker button in the shift bar or the SOUND row on the welcome card cycles MUSIC + EFFECTS → EFFECTS ONLY → OFF, and the choice is remembered. In walk mode, the Game HUD's sound toggle works too.
- **In a world:** the panel game plays its own audio. When the panel opens, the world may want to duck or mute its own music, and bring it back on `8g-game-close`.

## 8. Try this after merging (iPhone)

1. Walk in through the door and back out, and check the fade and the room label.
2. Talk to Felt, choose "Put me to work.", and check the panel opens full-screen and the music starts.
3. Play a shift, finish on the results card, tap BACK TO GAYA, and check the world's gold went up.
4. Check fps inside the room, then outside (the room should be hidden).
