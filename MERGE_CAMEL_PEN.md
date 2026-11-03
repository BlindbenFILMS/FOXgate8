# MERGE KIT · Ummi Reyhan's Camel Pen `[kufaCamelPen]`

Use this when the Kufa world (or any FOX world) is being built in another chat and the camel pen should be a building you can walk into.

First message for the new chat:

> Read START_HERE.md, CLAUDE.md (PROJECT_RULES.md), BUILD_PLAN.md and MERGE_CAMEL_PEN.md. Merge Ummi's Camel Pen into [world] as an interior inside [building], by the bazaar market. Mobile first: check 390x844 and 844x390.

---

## 1. Files (all already in this pack, keep the folder layout)

| File | What it is |
|---|---|
| `minigames/kufa/camel-pen.js` | The pen interior, the camels, the job, Ummi's data. Main module. |
| `minigames/kufa/pen-audio.js` | All sound effects + the music (made live with Web Audio, no audio files). |
| `Kufa Camel Pen.dc.html` | Stand-alone page (welcome card, job UI, day card, walk mode with the Game HUD). |
| `Kufa Camel Pen Phone Preview.dc.html` | iPhone portrait + landscape side by side. |
| `Game HUD.dc.html` | The shared HUD. Has the `camel` button set (1 PAT · 2 CALL · 3 JUMP). |
| Shared engine it imports (already used everywhere) | `engine/restaurant-kit.js`, `engine/save.js`, `engine/cast.js`, `fox-kit.js`, `village-game.js`, `meru-game.js`, `vendor/three/` |

Page links: `?demo=1` plays the demo · `?walk=1` starts walking · `?embedded=1` = inside a world (see 3B).

---

## 2. What `camel-pen.js` exports for a world

```js
import { buildCamelPen, addPenCamels, makeCamel, camelPose, UMMI, UMMI_TALK, PEN } from './minigames/kufa/camel-pen.js';
import { createPenAudio } from './minigames/kufa/pen-audio.js';
```

- **`buildCamelPen(ctx)`** builds the whole room at `ctx.origin` ({x, z}) inside the world's scene.
  `ctx = { THREE, M, toon, canvasTex, scene, grad, addOutline, origin }` (the same ctx the restaurants use).
  Returns `Y`:
  - `Y.root` the group (move/rotate it to fit the building)
  - `Y.walk(x, z)` → true where you can walk (local coords: room x −8.6..8.6, z −7.2..5.4). `Y.boxes` blocked rectangles, `Y.bounds`
  - `Y.spots` = `ummiHome`, `ummi` (at work), `benSpawn` (just inside the gate), `gate` (outside, west), `qamar`, `zahra`, `camel` (the work spot), `owner`, `talk`
  - `Y.walls` ({ m, side: 'L' | 'R' | 'B' }) hide a side when the camera is beyond it; `Y.front` = low front wall + potted palms (hide when the camera is outside)
  - `Y.anim(dt, t)` call every frame (bunting, doves, dust, lanterns, trough ripples). `Y.scareDoves()` on a whistle.
- **`addPenCamels(ctx, Y)`** puts QAMAR and ZAHRA in their stalls → `{ list, update(dt), pat(i), call() }`.
- **`UMMI`** her look (torso, robe, fur, elder, head-wrap colours) for `kit.makeFox`, and **`UMMI_TALK`** her talk tree: `greet`, `again`, `dahabDone`, `topics` (each has `text`, `replies`, optional `action: 'work' | 'close'`). The 2D lines are verbatim; "Put me to work with the camels." and "Who are these two?" are new.
- **`PEN`** = `{ name, room: 'kufaCamelPen', world: 'kufa', perDay: 3 }`.

The gate is on the pen's WEST wall (local x −9.2, z −2.5..0.9). Line it up with the street/bazaar door of the building it goes in.

---

## 3. Two ways to merge (pick one)

### A. Walk-in room + job panel (recommended, same as Sizzle's diner and the casino)
1. In the world module: `const Y = buildCamelPen({ ...ctx, origin })` (far from the map like other interiors and entered with the quick fade, or on the map like the Meru walk-in shops).
2. `const pens = addPenCamels(ctx, Y)`; make Ummi with `kit.makeFox` from `UMMI`, stand her at `Y.spots.ummiHome`.
3. Use `Y.walk` as the walk mask while inside; set the top-left label + `save.where('kufa', 'kufaCamelPen')`.
4. Ummi's talk = `UMMI_TALK` through the world's dialogue. Topic `action: 'work'` opens the job: show `Kufa Camel Pen.dc.html?embedded=1` in the minigame panel (iframe), like the casino games.
5. Listen for messages from the panel:
   ```js
   addEventListener('message', e => {
     if (e.data?.type === '8g:camelPen:exit') closePanel();      // BACK TO KUFA pressed
     if (e.data?.type === '8g:camelPen:day') toast('+' + e.data.gold + ' gold'); // a day finished (gold is already in the shared save)
   });
   ```
6. Every frame: `Y.anim(dt, t)`, `pens.update(dt)`. HUD buttons inside the pen: 1 PAT (`pens.pat(nearest)`), 2 CALL (`pens.call(); Y.scareDoves()`), and mount the HUD with `vehicle="camel"` while inside so the buttons read PAT / CALL / JUMP.

### B. Simply link the page
Point the building's door at `Kufa Camel Pen.dc.html` (no `embedded`). It has its own walk mode, Ummi's talk, the job and the HUD. Fastest, but it is a separate page.

---

## 4. Sound and music
- `createPenAudio(ambience)` (ambience = the kit's `Ambience`, i.e. `ST.audio` / the world's audio). It starts only after the first tap (iPhone rule).
- `play(name, { vol, pan, pitch, delay })`. Names: groan grumble hum snort spit munch gulp creak clank splash scratch pop thornCreak plink ouch squish whistle bells jingle step camelStep thump rustle coins chime done fail tap ding treat whoosh pat sigh coo cheer.
- Music: `music.mood('walk' | 'work' | 'intro' | 'off')`, `music.oud(true)` (OUD PLAYER upgrade), `music.flourish('day' | 'happy' | 'sad')`. Maqam Hijaz on D, plucked oud + darbuka (maqsum) + ney + drone.
- In the world, play `music.mood('walk')` only while inside the pen and switch back to the world's music at the door.
- Real recordings later: add them to `PEN_AUDIO_FILES` in `pen-audio.js`, e.g. `groan: 'KUFA/audio/camel-groan.mp3'`. The file replaces the synth for that name, and nothing else needs to change.
- Mute is saved in `localStorage` key `kufa.pen.muted`. The HUD's sound option calls `toggleSound()`.

---

## 5. Save keys (shared save, `engine/save.js`)
`kufa.pen.day` · `kufa.pen.best` · `kufa.pen.stars` · `kufa.pen.camels` · `kufa.pen.upg.<pump|comb|pincers|dates|oud>` · flag `camelUniform`.
Reads `w.dahabDone` (2D story flag): Dahab becomes a customer and Ummi gets her Dahab line.

---

## 6. Try-this checklist after merging (iPhone, both ways round)
1. Walk in through the gate. Doves on the back wall, bunting, Qamar + Zahra chewing.
2. Tap a camel's head (pat, hum, bells on Qamar), press 2 CALL (whistle, camels look, doves fly).
3. Talk to Ummi → "Put me to work with the camels." → the welcome card.
4. Play one camel with all six jobs; check the spit, the OUCH, the green "she is looking" ding.
5. Finish a day → day card → BACK TO KUFA returns to the world with the gold.
6. Sound on/off button; music changes between walking and working.
