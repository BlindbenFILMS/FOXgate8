# 8 GATES 3D: handoff

This is the 3D rebuild of the 2D game "8 GATES" (fox characters, 11 worlds), done one world at a time. Meru is the first world. Its whole story plays end to end (arena → caves → Max → castle → King), on one connected outdoor map with 6 zones and 13 interiors.

> **NEXT CHAT, START HERE (updated Meru session 15).** Say "continue BUILD_PLAN.md". The next job is the **Meru space dock [meruSpacedock] + The Bridge battle [meruBridge]**. They are the game's opening: arrive at the dock, step on the pad ("TELEPORT to PLANET MERU?"), the beam is interrupted and drops you on The Bridge. All the 2D data found so far (exits, the four landings, the Sink Sentry / Charger / Warden enemies and their numbers) is in BUILD_PLAN.md's session log. After that, Meru is done apart from small gaps (Mott's best-score talk, gear stats, return to orbit, media). Then Gaya.
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
| `worlds/meru-interiors.js` | Barracks and Throne Room: layout, people, verbatim lines, the King's audience and gifts. |
| `worlds/meru-arenapath.js` (+ `meru-arenapath-dialogue.json`) | The Arena Path market: stalls, banners, 15 people, their verbatim lines. |
| `worlds/meru-shops.js` | Item Shop and Armory: rooms, keepers, verbatim stock and prices, the counter menu, buying. |
| `worlds/meru-lake.js` | Lake: water/walk/boat tests from the 2D water map, basin terrain, people, the boat rental, dive and fishing spots, the boat and Nelly. |
| `engine/combat.js` | Light combat for walk-around rooms, also used for critters: `add(n, { aggro, fly, critter, reach })` (bats and rats in the caves). Melee arc and laser hitscan with soft auto-aim; foes chase, wind up and strike; ranged shots lock their aim at wind-up, so moving dodges them. |
| `worlds/meru-lanes.js` (+ `meru-lanes-dialogue.json`) | Meru Lanes: three lanes, scoreboards, Mott, Gale, Nera, Rook; bowl spots open tenpin. |
| `worlds/meru-fortune.js` (+ `meru-ora.json`) | Ora's tent; her talk picks one of 8 story states like the 2D openSeerTalk. |
| `worlds/meru-burgers.js` | Burgers diner (outside on the Tavern's east wall + the inside room), Sizzle, Michael Jay, and Doc Braun (stands in the Tavern); their talk trees; 'Put me to work' opens the diner game. |
| `worlds/meru-ruins.js` | Ruins Path + Desert zones, the walk-in museum and the walk-in Permit Office (both lift their roofs when you are inside), Snag, Sage, Spade. |
| `worlds/meru-castlepath.js`, `worlds/meru-meet.json` | Castle Path zone; the Arena Path meeting with Michelle and Max. |
| `worlds/meru-caves.js` | The caves: layout from the 2D fractions, walk/camera tests, the bandit crew, verbatim story beats, build. |
| `engine/save.js` | One save for all worlds (see Kit §K). |
| `engine/story.js` | Quests, steps and dialogue choices as data (see Kit §G). |
| `engine/textures.js` | Canvas textures: signs, emblems, crests, banners, cobble, plaza, asphalt. |
| `engine/world-kit.js` | `createWorldKit({container, opts})`: renderer, toon materials, ink outlines, `M`/`BOX`, glow materials and sprites, sun/hemi lights, sky dome, stars. `phoneBudget()`. |
| `engine/building-kit.js` | `createBuildingKit(K, {DARK, STEEL, lampM, windowM})`: wall textures, `dress()` polish, sconces, windows, planters, `lampPost`/`lantern`/`tree`, `linePath()` for lining paths. |

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
| `ref/` | Reference renders of the town, arena and walk map. Also `meruThronePath.json/.svg/.png`: the 2D Castle Path scene (walk map, lights, portals) it was laid out from. |
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
- **Lives in `engine/building-kit.js`** (`dress()`); the basic box/roof/sign shapes are still in `place()` in `meru-game.js`: walls use canvas textures with plank/brick lines, a trim band, a base course, lit windows that glow at night, a door with frame and step, pitched or flat roofs with an overhang, and signs from `signTex()`. Banners use `bannerTex()`, lamps are glow sprites plus point lights.
- Buildings are placed from `BUILDINGS` in the world data: art-pixel rectangles plus the face (N/S) and the door's x. Round buildings use `cx, cy, r`.
- **Paths:** `BK.linePath([[x,z],…], { every: 7, side: 2.6, kind: 'lamp' | 'tree' | 'lantern' })` lines any path, which is the "always see the path" rule.

### D. Interiors in the same map, with the quick fade
- Interiors are real rooms built far from the outdoor map in the **same scene**, so there is no loading. Today these are the Tavern (`TAV`) and Casino (`CAS`).
- `goTo(x, z, face, indoor)` fades the screen to black (0.28 s), moves the player, sets `St.indoor` and `St.room`, then fades back in.
- A door is a spot in `nearSpot()`: standing at a building door shows "Enter …"; standing at the interior exit shows "Leave". `CAS_EXIT`, `TAV_EXIT` and the `*_DOOR_OUT` points pair each inside with its outside.
- Interior lights only switch on while you are inside (phone budget).
- **Room registry:** `ROOMS = { tavern, casino, barracks, throneroom }` in `meru-game.js`; `RM()` returns the current one. Interior lights live in `roomLights` and switch on only inside.
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
- **Flags so far:** `tournamentEntered`, `tournamentWon`, `banditsDown`, `maxFreed`, `maxFollowing`, `maxHome`, `caveChest0`/`caveChest1`, `ransomNamed`, `ringJob`, `hasSageRing`, `banditsJoined`, `digPermit`, `boatRented`, `arenaMeetDone`, `maxTavernLead`, `maxTavernAsked`, `bigLaser`, `castleAudienceDone`. Flag names match the 2D game's.

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
| `meruArena` | Arena Path zone, **built**: `worlds/meru-arenapath.js` | Walk east from the square down the market road. E at the arena gate opens `Meru Arena.dc.html`. |
| `meruArenaInterior` | `Meru Arena.dc.html` (battle page) | "Back to the town square" returns you to the east gate of `meruTown`. |
| `meruThronePath` | Castle Path zone (north), **built**: `worlds/meru-castlepath.js` | Walk north from the square; there is no fade. The castle doors lead to `meruThroneroom`; the guards let you in once Max is found. The east road leads to `meruBarracks`. |
| `meruBarracks` | Barracks interior (same scene, fade): `worlds/meru-interiors.js` | Barracks gate on the Castle Path east road. Leave returns you to the gate. |
| `meruThroneroom` | Throne Room interior (same scene, fade) | Castle doors once `maxFollowing` (the King's audience plays) or `maxHome` is set. Leave returns you to the castle plaza. |
| `meruRuins` | Ruins Path zone (west), **built**: `worlds/meru-ruins.js` | Walk west from the square; there is no fade. The museum is walk-in, and its roof lifts while you are inside. The west end runs straight into the desert. |
| `meruRuinsInterior` | Caves (same scene, fade): `worlds/meru-caves.js` | Desert temple cave mouth. Leave returns you to the desert just outside it. Inside: the bandit camp and Max's cage. |
| `meruDesert` | Desert Ruins zone, **built** | Reached from the Ruins Path. The cave mouth leads to `meruRuinsInterior`. |
| `meruPermitOffice` | Permit Office, walk-in building in the Desert (no fade, roof lifts) | Spade behind his counter; the permit leads to the dig game. Label switches while you are inside. |
| `meruLake` | Lake zone (south), **built**: `worlds/meru-lake.js` | Walk out of the square's south gate; there is no fade. Rent the boat from the Fisherman, board at the jetty end. Dive rings and the fishing ring open the original games. |
| `meruItemshop`, `meruArmory` | Shop interiors (fade): `worlds/meru-shops.js` | Their doors on the square. Kia and Bram run the counters; buying goes into the save and the 4 ITEM wheel. |
| `meruBowling` | Meru Lanes (fade): `worlds/meru-lanes.js` | Its door on the square. Bowling opens the original tenpin game. |
| `meruFortune` | Ora's tent (fade): `worlds/meru-fortune.js` | Its door on the square. |
| `meruBurgers` | Burgers diner (fade): `worlds/meru-burgers.js` | Door on the Tavern's east side, facing the east road. Sizzle offers the diner game; Michael Jay stops you once. |
| **Not built yet** | | `meruSpacedock` (space dock) and the battle map `meruBridge`. |

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
- `castle-03-meruBarracks.jpg`, `castle-04-meruThroneroom.jpg`, `castle-05-throne-audience.jpg`: the two castle interiors and the King's audience.
- `lanes-01-meruBowling.jpg`: Meru Lanes.
- `shops-01-meruItemshop.jpg`, `shops-02-meruArmory.jpg`: the two shops.
- `arenapath-01-meruArena-market.jpg`, `arenapath-02-gate.jpg`: the Arena Path market.
- `lake-01-meruLake-beach.jpg`, `lake-02-jetty.jpg`, `lake-03-boat-nelly.jpg`: the lake zone.
- `caves-01…05`: the crossing, the parley with Rook, the fight, the lockpick and Max freed.
- `ruins-01-meruRuins-road.jpg`, `ruins-02-museum.jpg`, `ruins-03-meruDesert-temple.jpg`, `ruins-04-permit-office.jpg`: the two west zones.
- `castle-01-meruThronePath-road.jpg`, `castle-02-meruThronePath-gate.jpg`: the Castle Path zone at midday.
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

## 8. Status (Meru session 15)

**Finished**
- Engine: shared save, story/choices, textures, world-kit, building-kit, light combat (`engine/combat.js`), zones, path lamps (`linePath`), phone HUD (joystick, 1–4 column, item wheel, contextual TALK, quest banner).
- Meru outdoor map, one connected world: Town Square, Castle Path, Ruins Path, Desert Ruins, Lake (boat, fishing, diving), Arena Path market (Michelle + Max meeting). Off-path wilds with bats and rats.
- Meru interiors: Tavern (darts, jukebox, Doc Braun), Casino, Barracks, Throne Room (King's audience), Caves (bandits, lockpick, Max), Ruins Museum, Item Shop, Armory, Meru Lanes, Fortune Teller, Burgers, Permit Office.
- Meru Arena battle page (3 rounds + Iron Warden).
- The Meru story plays end to end. Fox and Combat Workshops.

**Still to do in Meru**
- Space dock [meruSpacedock] + The Bridge battle [meruBridge] (the opening; notes in BUILD_PLAN).
- RETURN TO ORBIT, Gaya monks' loading screens.
- Mott's best-score talk at the Lanes; gear from Bram doesn't change stats yet.
- Fortune Teller untested on device. Media (videos, jukebox MP3s) not in the project yet; synth fallback plays.
- Engine split leftovers: room-kit, enemies.js, merge arena combat into combat.js; day/night, camera, input, fade doors still inside meru-game.js.

**Not started:** every other world (Gaya → Deep Space Fox), the space map, the 3D minigame rebuilds.

**Debug warps:** `__8G_GAME.warp(name)` with `tavern casino barracks throneroom itemshop armory bowling fortune burgers permit cave camp rescue ruins museum desert castle castleSouth lake beach boat arenapath audience`.

**Save flags added recently:** `mjGreeted`, `docGreeted`, `docTold`, `gear.<key>`, `caveChest0/1`, `arenaMeetDone`.

**Backups:** `backup/meru/` (before the engine split) and `backup/meru/s15/` (meru-game.js + worlds/meru.js before Burgers).

**Performance (phone budget)** is handled by `cull()` in `meru-game.js`:
- Interiors only draw while you are in them, and the camera far plane drops to 60 m indoors.
- Each zone group (Castle Path, Ruins, Desert) hides when you are far from it.
- Foxes beyond 55 m hide.
- `phoneBudget()` drops small shadow casters on low quality.
- Without this the scene had reached about 3,100 draw calls. Keep every new zone in its own group, and add it to `cull()`.

**How a zone joins the one map** (Castle Path is the example to copy):
- Lay the 2D path scene into town art px with one offset (`ax = px + 560`, `ay = py - 2880`). The 2D exit seams line up, so you walk straight across.
- `walkable()`: the 2D walk map, plus open grass (off-path), minus water, walls and landmarks.
- `flatMask()`: flattens the terrain under the zone.
- `treeOK()`: keeps trees off the roads.
- `FOXES` / `DIALOGUE` are merged into the world's lists. `SPOTS` are the doors.

**Known issues**
- Not yet tested on a real iPhone; check frame rate in the casino (TVs redraw at 20 fps) and the arena crowd.
- `meru-game.js` is large; edit with care.
- The quest banner reads the save. Testing may leave flags set; reset with `__8G_SAVE.reset()`.
- The minimap is removed from the UI, but its code is still in `meru-game.js` (`setMinimap`).

**What I would build next, in order**
1. Meru space dock + The Bridge battle (new chat).
2. The small Meru gaps above, then a Meru polish pass and the "try this" checklist; test on iPhone at 390×844 and 844×390.
3. Back up Meru to `backup/meru/`, then start Gaya (39 rooms incl. Kyoto quarter) in a new chat.
