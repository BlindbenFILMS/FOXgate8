# 8 GATES 3D: handoff

This is the 3D rebuild of the 2D game "8 GATES" (fox characters, 11 worlds), done one world at a time. Meru is the first world. Its Town Square, Tavern, Casino and Arena all play.
Read this file first, then `CLAUDE.md` (the user's standing rules), then `BUILD_PLAN.md` (progress, and the file to keep updated every session).

> **THE BIG RULE: ONE BIG EXTERIOR MAP PER WORLD.**
> The 2D game splits each world into separate path screens (Castle Path, Arena Path, Ruins Path, Lake…). In 3D they are **one connected outdoor map**, and each old screen becomes a **zone** on it. The zone keeps its bracket name (`meruThronePath`, `meruRuins`, `meruLake`…), and the top-left label changes as the player walks in.
> Only **interiors** (buildings you walk into) use the quick fade, and they live in the same 3D scene, far from the map. **Battle maps** (the Arena, The Bridge) are the only separate pages.
> Do not build path screens as separate pages.

---

## 1. How to run it

ES modules do not load from `file://`, so serve the folder:

```
cd <unzipped folder>
python -m http.server 8000        (or: npx serve .)
```

Open `http://localhost:8000/Meru%20Town%20Square.dc.html`.

- **Entry pages:** `Meru Town Square.dc.html` is the game. `Meru Arena.dc.html` opens on its own too; the town's east exit also leads there.
- **Internet:** three.js and the Archivo fonts are local (`vendor/`). `support.js` (the runtime for the `.dc.html` page format) still loads React 18.3.1 from unpkg, and Babel 7.29.0 only if a `.jsx` file is used (none are). For fully offline use, point the two React URLs in `support.js` at `vendor/react/`.
- **Phone testing:** open the same URL from the phone on the same network (`http://<pc-ip>:8000/...`). Check 390×844 portrait and 844×390 landscape.
- **Debug hooks** (browser console):
  - `__8G_SAVE`: the save. Try `.data`, `.setFlag('tournamentWon')` or `.reset()`.
  - `__8G_GAME`: the running scene's API. In town, `__8G_GAME.warp('tavern' | 'casino')` jumps inside. In the arena, `.advance()` and `.attack()`.

## 2. File map (start reading at ★)

**Pages** (`.dc.html` = "Design Component": an HTML template with `{{holes}}` plus a small `class Component` logic block; inline styles only)

| File | What it is |
|---|---|
| ★ `Meru Town Square.dc.html` | The outdoor map, plus the Tavern and Casino interiors. The HUD is drawn here: place/clock, quest banner, dialogue with choices, phone pad, item wheel, darts meter, jukebox list, casino iframe panel. It loads `meru-game.js`. |
| ★ `Meru Arena.dc.html` | The battle page (meruArenaInterior). Its HUD covers vitals, boss bar, style rank, phone pad, results and the King dialogue. It loads `meru-arena.js`. |
| `Fox Workshop.dc.html` + `fox-workshop.js` | Tool for tuning a fox's look and outfit and saving presets. |
| `Combat Workshop.dc.html` + `move-lab.js` | Tool for tuning movement, dodge, swing and camera against dummies. |
| `Hollow Vale.dc.html` | The first style test (village). It shows the toon look and is kept for reference only. |

**Engine and scene code** (plain ES modules, readable, not minified)

| File | What it is |
|---|---|
| ★ `meru-game.js` (~950 lines) | The town scene: renderer, sky/day-night/weather, terrain, buildings, foxes walking routes, camera and collision, input, fade doors, the Tavern (bar, darts, jukebox), the Casino (tables, TVs, cashier), talk, zones, and the HUD state it sends to the page. Still one big file; Step 0 is splitting it (see Status). |
| `meru-arena.js` | Battle engine: laser plus sword, lock-on, dodge, jump, floor lasers and shockwaves, boss "Iron Warden", style rank, 8-Gate Burst, pickups, King Might close-ups. |
| ★ `fox-kit.js` | Every fox: `foxKit({...}).makeFox(opts)` and `animFox(fox, dt)`, expressive canvas faces with moods, outfits, weapons in hand. Exports the presets `PLAYER_MALE`, `PLAYER_FEMALE` and `KING_MIGHT`. |
| `village-game.js` | Shared helpers: random/math (`rnd rr pick clamp smooth lerp damp vnoise fbm`), `paletteAt` (sky colours by hour), `makeGradient` (toon ramp), `glowTexture`, the `Ambience` audio class. |
| ★ `worlds/meru.js` | Meru **data**: map scale, buildings, exits, NPC foxes and routes, dialogue (verbatim from the 2D game), ZONES, INTERIORS, QUEST, TALK trees, the MINIGAMES list. New worlds start as a file like this. |
| `engine/save.js` | One save for all worlds (see Kit §K). |
| `engine/story.js` | Quests, steps and dialogue choices as data (see Kit §G). |
| `engine/textures.js` | Canvas textures: signs, emblems, crests, banners, cobble, plaza, asphalt. |

**Assets and data**

| Path | What it is |
|---|---|
| `meru-town-map.png`, `meru-town-walk.json` | The 2D Meru town art and its walk map. The 3D layout is placed in the art's own pixels (2880×1620). |
| `foxes/PLAYER MALE.json`, `foxes/PLAYER FEMALE.json`, `foxes/KING MIGHT.json` | Workshop presets (look plus outfit). |
| `presets/looks.json`, `presets/outfits.json` | Every look and outfit preset as data. The code copies in `fox-kit.js` and `fox-workshop.js` are what the game actually reads. |
| `presets/weapons.json` | Sword and laser placement in the hands. |
| `presets/combat-tune.json` | Movement and combat numbers. |
| `casino/*.html` | The user's original casino minigames (slots, wheel, poker), opened in the panel. |
| `minigames/<world>/*.html` | Every original minigame copied out of the world files (base64 inside them). Meru has 14; Jidda, Luxor, Ur, Zion and Earth have their own. |
| `uploads/` | **Source of truth.** The 2D world files: `surface_meru.html` plus `world_files-*.html`, one per world (see BUILD_PLAN for which is which), and `8GATES_DESIGN_BRIEF_ALL.md`. Every NPC name, line, quest step, shop item and price comes from here. |
| `vendor/three/three.module.js` | **three.js r160 (0.160.0)**, MIT, see `LICENSE`. |
| `vendor/react/` | React and ReactDOM 18.3.1 UMD (used by `support.js`). |
| `vendor/fonts/` | Archivo 400/600/800, latin and latin-ext (OFL). `archivo.css` holds the @font-face rules. |
| `_ds/modernist-…/` | The Modernist design system the UI uses (`styles.css` tokens). |
| `support.js` | The `.dc.html` runtime. Do not edit by hand. |
| `ref/` | Reference renders of the town, arena and walk map. |
| `backup/meru/` | A copy of the working Meru files from before the engine split began. |
| `handoff/screenshots/` | The look to match (§6). |

**No 3D model files exist.** Everything is built in code from three.js primitives with toon materials and ink outlines. Textures are drawn on canvas at runtime. Keep it that way; it is what keeps the build light on iPhone.

---

## 3. The kit: how each system works, and how to reuse it for a new world

### A. Avatars and presets (`fox-kit.js`)
- `const FK = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp })` builds the kit.
- `FK.makeFox({ outfit, female, torso:[light,mid,dark], crest, glasses, cane, crown, gear, look })` returns a Group with `userData` for animation. `FK.animFox(fox, dt, speed)` animates it each frame.
- **Outfits:** `armor`, `robe`, `coat`, `dress`, `vest`, `suit`, `royal`. Guards always wear armor.
- **The player is `PLAYER_MALE`.** `PLAYER_FEMALE` and `KING_MIGHT` are the other named presets. The Fox Workshop saves the player's look to localStorage `meru.foxLook.v1`; `loadLook()` reads it.
- **Faces** are a canvas texture with moods (`FK.MOOD`). `moodOf(text)` picks a mood from a dialogue line, or a line can set `mood` itself. Faces blink and talk.
- **New world:** add the world's NPCs to `worlds/<world>.js` as `FOXES` entries. Pick colours and crest letters from the 2D files; don't invent new body parts.

### B. Weapons in hand
- Set `gear: 'laser' | 'sword' | 'both' | 'none'` on `makeFox`. The sword is on the right arm and the laser on the left; numbers are in `presets/weapons.json`.
- The blade glows in the armor accent colour and is kept level while the arm swings.
- In town the player carries the sword, but 1 Melee and 2 Range only show "Weapons stay holstered in town."

### C. Building polish kit (walls, trims, windows, doors, roofs)
- **Today it lives inside `meru-game.js`.** Search for the BUILDINGS loop: walls use canvas textures with plank/brick lines, a trim band, a base course, lit windows that glow at night, a door with frame and step, pitched or flat roofs with an overhang, and signs from `signTex()`. Banners use `bannerTex()`, lamps are glow sprites plus point lights.
- Buildings are placed from `BUILDINGS` in the world data: art-pixel rectangles plus the face (N/S) and the door's x. Round buildings use `cx, cy, r`.
- **Planned (Step 0):** move this to `engine/building-kit.js` so a world only lists buildings and picks palettes.

### D. Interiors in the same map, with the quick fade
- Interiors are real rooms built far from the outdoor map in the **same scene**, so there is no loading. Today these are the Tavern (`TAV`) and Casino (`CAS`).
- `goTo(x, z, face, indoor)` fades the screen to black (0.28 s), moves the player, sets `St.indoor` and `St.room`, then fades back in.
- A door is a spot in `nearSpot()`: standing at a building door shows "Enter …"; standing at the interior exit shows "Leave". `CAS_EXIT`, `TAV_EXIT` and the `*_DOOR_OUT` points pair each inside with its outside.
- Interior lights only switch on while you are inside (phone budget).
- **New interior:** add an entry to `INTERIORS` in the world data (with its bracket key and label), build the room at a far offset, and add a door spot and exit spot. Plan: `engine/room-kit.js` for a generic shell and furniture.

### E. Day/night and weather
- `St.time` is the hour (0–24). It advances at `timeScale` game-minutes per second (prop, default 2) and starts at `startHour` (default 19.5, dusk).
- `paletteAt(hour, pal)` gives sky, fog, sun/moon and ambient colours. Window glow, lamps and stars follow the hour.
- `St.weather` is `clear`, `fog` or `rain`, eased in and out. The ☰ menu cycles weather and skips +3 h.

### F. Sound and music
- The `Ambience` class (`village-game.js`) is a synthesised WebAudio bed (wind, crowd, night insects) plus UI blips and tones. It starts on the first user tap (an iOS rule) and can be muted from ☰.
- **Jukebox:** see §H.
- **Arena:** synthesised crowd plus hit sounds (`meru-arena.js`).

### G. Dialogue and the talk system (`engine/story.js` + page HUD)
- **Lines** are written word for word from the 2D files (`DIALOGUE` in the world data). Never reword them.
- `treeFromLinear(lines)` turns the 2D game's Q&A lists into a **choice menu**: each player line becomes a choice, the NPC lines after it become the answer, and "Goodbye." is added at the end.
- Hand-written trees are supported too: `{ start, nodes: { id: { lines, choices: [{ text, go, end, if: 'flag' | '!flag' | [...], set: 'flag', once }], next } } }`.
- `new Conversation(tree, { test, set, asked })` runs a tree. The town wires `test` and `set` to the save. Choices you have already asked show in grey.
- **Controls:** E, a tap on the box, or the TALK button advances. Number keys 1–9 pick a choice on desktop.
- **Quest banner:** `QUEST = { title, allDone, steps: [{ text, done: 'flag', at, who }] }`. `questBanner()` follows the 2D guide's rule: find the last finished step, then show the first unfinished step after it. Meru's steps are copied word for word from the 2D guide card.

### H. Darts (Tavern)
- Walk to the oche and press E. A power meter fills; press or tap to throw, and the perfect band gives a bull. Three darts per round.
- Score and best are shown; the best is saved as `meru.darts.best`.
- Board and chalkboard are canvas textures (`DART`, `drawChalk`).
- The user's original darts game is also kept at `minigames/meru/darts.html`.

### I. Jukebox (Tavern)
- `SONGS` in `meru-game.js`: A1 Country "SPACE HORSE", A2 Jazz "FLY ME PAST THE MOON", A3 Opera "PHANTOM OF THE UNIVERSE", A4 Rockabilly "SPACE FOX", A5 Rock & Roll "BLAST OFF".
- Each song plays `MERU/MUSIC/JUKEBOX/<file>.mp3`. If the file is missing, `synthSong()` plays a stand-in groove at the song's BPM.
- Music stops when you leave the tavern. The box lights pulse to the beat.

### J. Casino panel (opens the existing minigames)
- In the Casino, each table or machine is a spot in `CAS_GAMES`. Pressing E calls `onPlayGame(key, label)`, and the page opens an `<iframe src="casino/<key>.html">` in a full-screen panel with a 48 px "Leave table" button.
- The original games post `backToCasino` or `backToTavern` to close themselves.
- **Any world:** list its games in `MINIGAMES` (key → `minigames/<world>/<key>.html`) and point the panel's `src` at that path. 3D rebuilds of minigames come later, in the user's order (BUILD_PLAN).

### K. Save (`engine/save.js`)
- Uses localStorage `8gates.save.v1`: `{ world, zone, gold, xp, items, relics, outfit, flags, stats }`.
- Main calls: `save.flag(k)`, `setFlag`, `test('a' | '!a' | [...])`, `addGold`, `spend`, `give`, `take`, `count`, `addRelic`, `best(stat, v)`, `where(world, zone)`, `on(fn)`.
- **Flags so far:** `tournamentEntered` and `tournamentWon` (set by the arena); `maxFreed`, `maxFollowing` and `maxHome` come later (Ruins and Castle). Flag names match the 2D game's.

### L. Arena battle engine (`meru-arena.js`)
- **Rounds:**
  1. Laser: 4 drones.
  2. Sword: 4 shielded robots. The sword unlocks here.
  3. Boss: the Iron Warden. His front is shielded, so stun him and then strike.
- Floor-laser sweeps and shockwave rings must be jumped. Style rank (D→S) rises when you mix weapons and avoid hits. The burst meter fills, then R or the Burst button unleashes the 8-Gate Burst.
- **Controls:** C locks on and Tab cycles targets. Pickups restore health and energy.
- King Might speaks from the royal box with camera close-ups. `SCRIPT` holds his lines word for word.
- Results show splits, rank and score. "Back to the town square" sets `sessionStorage meru.spawn = 'east'`, so you reappear at the arena gate.
- **Plan:** pull this into `engine/combat.js` plus `engine/enemies.js` (melee, ranged, charger, boss behaviours; each world picks names and colours). Creatures roam the off-path wilds and never step onto paths.

### M. Phone controls
- **Joystick:** the left half of the screen. Dragging the right half moves the camera.
- **Right column:**
  - **1 MELEE · 2 RANGE · 3 JUMP · 4 ITEM**. 4 opens a radial item wheel of the save's items.
  - **TALK** appears only when you're near someone or something.
  - In the arena, a **Lock / Dodge / Burst** column sits beside it.
- Every button is at least 44 px.
- Dialogue sits at the bottom across the screen in portrait, and in a left column in landscape. Camera close-ups put the speaker's face in the upper third (portrait) or right of centre (landscape), so the box never covers the face.
- World settings sit behind ☰. Graphics drop to `quality: 'low'` automatically on touch screens (pixel ratio 1, fewer shadows).
- **Desktop:** WASD, Shift to run, E to talk, keys 1–4 for the same actions, drag to look.

---

## 4. Room names (keep the 2D bracket names exactly)

| Bracket name | 3D room | How you get there / where its doors lead |
|---|---|---|
| `meruTown` | Town Square: the centre zone of the one outdoor map (art 0–2880 × 0–1620) | Start point. Doors lead to the Casino and Tavern. Exits: north to Castle Path, east to the Arena, west to Ruins Path, south gate to the Lake. |
| `meruTavern` | Tavern interior (same scene, fade) | Tavern door, south face, art x 2150. Exit returns to the tavern door. Inside: bar, darts, jukebox. |
| `meruCasino` | Casino interior (same scene, fade) | Casino door, south face, art x 725. Exit returns to the casino door. Inside: 3 slots, wheel, 5-card poker, Texas hold'em, cashier. |
| `meruArena` | Arena Path zone (east of x 2880) | The east exit "Meru Arena" opens `Meru Arena.dc.html`. |
| `meruArenaInterior` | `Meru Arena.dc.html` (battle page) | "Back to the town square" returns you to the east gate of `meruTown`. |
| `meruThronePath` | Castle Path zone (north) | **Zone label only for now.** To build: path up to the castle gate, leading to `meruThroneroom` (interior). |
| `meruRuins` | Ruins Path zone (west) | **Label only.** To build: the Desert Ruins dig site (`meruDesert`) and `meruRuinsInterior` (bandit camp, caged Max). |
| `meruLake` | Lake zone (south) | **Label only.** To build: jetty, boat, fishing, dive spots, Nelly. |
| Not yet entered | Item Shop, Meru Lanes (bowling), Armory, Fortune Teller | The buildings stand on the square, but their doors don't open yet. Other rooms still to build: `meruBurgers`, the Barracks, the Permit Office, the battle map `meruBridge`, the space dock. |

Zones are rectangles in `ZONES` in `worlds/meru.js`; the first match wins. Walking into a zone changes the HUD label and calls `save.where('meru', key)`.

## 5. Media paths (must match the game's folders)

- The user's full game folder is on their PC: `C:\Users\Ben Fox\Documents\8 GATES\all-files\8GATES-SITE`. Media is **not** in this package yet; ask the user to attach that folder, then copy only what each world uses.
- Paths are **relative to the page**, mirroring the 2D site, so the files drop in unchanged:
  - Jukebox: `MERU/MUSIC/JUKEBOX/JUKEBOX-COUNTRY.mp3`, `…-FLY-ME-PAST-THE-MOON.mp3`, `…-PHANTOM.mp3`, `…-SPACE-FOX.mp3`, `…-ROCK-AND-ROLL.mp3`.
  - Cutscenes: `MERU/videos/...`, using the same names as the 2D game. Nothing references them yet. When added, use a `<video>` overlay that is skippable, and fall back to an in-engine scene if the file is missing.
- Other worlds follow the same pattern: `<WORLD>/MUSIC/...` and `<WORLD>/videos/...`.
- Missing media must never break anything: music falls back to the synth, and video is skipped.

## 6. Screenshots (`handoff/screenshots/`)

- `town-00-intro.jpg`: the intro panel over the town at dusk.
- `town-01-meruTown-square.jpg`: the square, HUD, quest banner, Talk prompt.
- `town-02-meruTavern.jpg`: the tavern.
- `town-03-meruCasino.jpg`: the casino.
- `arena-00-intro.jpg`, `arena-01-briefing-king.jpg`: the arena intro and the King briefing dialogue.
- `arena-02-fight-laser-round.jpg`, `arena-03-fight-drones.jpg`: round 1 fight HUD.
- `ref/town.png`, `ref/arena.png`: earlier reference renders.

The screenshots were taken with a DOM capture, so the 3D view can look slightly darker or cut off at the bottom. Open the pages to see the true look.

## 7. Decisions and rules (settled with the user; do not re-ask)

**Style**
- Toon shading (3-step gradient) with ink outlines (back-face hulls, `#1a1626`).
- Chunky stylised foxes with expressive canvas faces.
- Warm dusk light, lanterns, glow sprites.
- UI follows the **Modernist** design system: Archivo, 2px ink rules, red accent `#ec3013`, flush-left text even inside buttons, **no rounded corners**, ink-on-paper boxes.

**Scale**
- 1 unit = 1 m. The town square is 80 m × 45 m, mapped from the 2D art's 2880×1620 px (`S = 80/2880`).
- A fox is about 1.6 m tall.
- Lay out every world from its 2D map data (walk maps, building positions), like Meru.

**Camera**
- Third-person follow camera behind the player (drag to orbit; `followCam` prop), with collision against walls.
- Dialogue uses close-up shots framed for narrow screens.

**Naming**
- Keep every bracket room name exactly.
- One page per world, named after it (`Gaya.dc.html`), plus `worlds/<world>.js` for its data.
- Never break Meru. Back up to `backup/<world>/` before starting each world.

**Content**
- Every NPC, line, quest step, shop item and price comes from `uploads/`.
- If something must be cut, cut decoration, never a listed room, NPC or minigame.

**Paths and wilds**
- Every path is lined with lamps, lanterns or trees so the player can always see it.
- The player may leave the paths. Creatures live off-path, especially near battle places, and do not come onto the path.

**Space docks**
- One unique dock per world, except Earth.

**iPhone budget**
- Pixel ratio 1 on phones, fewer shadow casters, interior lights only when inside.
- Hide far crowds and small detail; distant buildings stay simple.
- Canvas textures stay at 512 px or less; no model files.
- Aim for 60 fps on a recent iPhone.

**Mobile first**
- Design and check every screen at 390×844 and 844×390 before calling it done.
- Touch targets are at least 44 px. Dialogue is readable and never covers the speaker's face; tap to advance.

**Work rhythm**
- Fewer rooms per message, each fully polished.
- Start each world in a new chat ("continue BUILD_PLAN.md").
- Update BUILD_PLAN.md every session, and leave a "try this" checklist at the end of each world.

## 8. Status

**Finished**
- Town Square (meruTown) with walking NPC routes and talk with choices.
- Tavern with darts and jukebox.
- Casino, with all original casino games in the panel.
- Arena: 3 rounds plus the boss, rank, burst and results.
- Fox and Combat Workshops.
- Shared save, the story system, zones, the quest banner.
- Phone HUD for the town and arena.
- Minigame HTMLs extracted for every world.
- three.js and fonts vendored.

**Partial**
- Step 0 engine split. `engine/` holds save, story and textures, but most of the engine is still inside `meru-game.js`.
- Zones: Castle, Ruins and Lake exist as labels only. Their outdoor areas aren't built yet.
- The item wheel works but is empty, because nothing gives items yet.
- 1 Melee and 2 Range do nothing in town (on purpose, until enemies exist).

**Not started**
- `engine/world-kit.js`, `building-kit.js`, `room-kit.js`, `combat.js`, `enemies.js`, and a path-marker helper.
- The other Meru rooms (see §4).
- Media copy-in.
- Every other world.

**Known issues**
- Not yet tested on a real iPhone; check frame rate in the casino (TVs redraw at 20 fps) and the arena crowd.
- `meru-game.js` is large; edit with care.
- The quest banner reads the save. Testing may leave flags set; reset with `__8G_SAVE.reset()`.
- The minimap is removed from the UI, but its code is still in `meru-game.js` (`setMinimap`).

**What I would build next, in order**
1. Finish Step 0:
   1. Move renderer, sky, toon materials, camera, input, fade doors and the panel out of `meru-game.js` into `engine/world-kit.js`.
   2. Build `building-kit.js` and `room-kit.js` from the Meru polish.
   3. Move `meru-arena.js` into `engine/combat.js` plus `engine/enemies.js`.
   4. Add a path-marker helper.
   5. Re-test Meru at both phone sizes after every move.
2. Grow Meru's one exterior map: Castle Path to `meruThroneroom`, Ruins Path to Desert Ruins, `meruRuinsInterior` (free Max), the Lake. Put off-path wilds with creatures between them.
3. The remaining Meru interiors: Item Shop (prices from `surface_meru.html`), Meru Lanes (`minigames/meru/tenpin.html`), Armory, Fortune Teller, Barracks, Burgers, Permit Office. Then the Bridge battle and the space dock.
4. Then Gaya, Jidda, Kufa, Luxor, Nebo, Ur, Zion, Home, Earth and Deep Space Fox, per BUILD_PLAN.
