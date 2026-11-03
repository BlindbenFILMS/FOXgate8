# PARALLEL WORLD BUILDS (s344 plan, Ben)

UPDATE s345 (Ben): world chats now go on after the layout to build that world's games + jobs IN THE WORLD (IN_WORLD_GAMES.md, worlds/<world>.plan.md). Avatars, story, quests, battles still stay here.
Each world gets its OWN design chat that first builds the CITY LAYOUT: ground, roads, paths, buildings (shells + doors), zones, water, dock pad, battle-gate points, NPC stand spots, lamp lines, decoration. Everything else stays in THIS project: items, shops' insides, rosters + lines, quests, minigames, enemies, battles, save, HUD. The layout comes back as ONE data file and is merged here.

Worlds + ids: meru · gaya · jidda · kufa · luxor · nebo · ur · zion · home · earth · dsf (Deep Space Fox). Lowercase, used in every file name and key prefix.

---

## 1) STARTER KIT — BUILT (s345): folder `kit/world-layout/` (download it as a zip, drop it into the new world project)

What is in it (read-only for the world chat):
- `CLAUDE.md` — the layout-only rules (mobile first, World layout rules, path readability, phone budget, naming, story arc, Modernist, "do not build items / quests / battles").
- `PARALLEL_WORLDS.md` — this file.
- `Map Workshop.dc.html` (s345) — Ben's hands-on editor: top-down grid, tools MOVE · PATH · ROAD · AREA (zone / wild / water / plaza / grass / sand) · PLACE (building, NPC spot, game, now hiring, relic, vehicle, battle gate, cave, minigame gate, dock, start) · ERASE · UNDO; drag the red door square round the walls, the white corner to resize; GRID 1 / 2 / 5 / 10 m; an inspector for the picked thing; the EVERY WORLD HAS checklist (tap ✗ = ADD + drops that building with its default size). Saves itself to localStorage `<world>.layoutDraft`; DOWNLOAD JSON / COPY JSON; WALK IT → opens the viewer on the draft.
- `Layout Viewer.dc.html` (+ `support.js`) — pick the world: top-down map (drag, pinch / wheel zoom, tap = what is there), the checker list (tap an issue = jump to it), auto re-check every 3 s, OPEN FILE, and WALK IT: the fox walks the blockout (left thumb walk / right thumb look, WASD on desktop), zone label + ON PATH / OFF PATH top-left, PHONE 390×844 / 844×390 frames.
- `kit/layout-check.js` — the checker (section 4 A rules).
- `IN_WORLD_GAMES.md` — the recipe to build a game INSIDE its place (Meru Claw Crane way) + the phase order.
- `WORLD_GAMES_PLAN.md` + `worlds/<world>.plan.md` — which games, jobs + vehicles go in each world, in build order, with repo page paths.
- `kit/example.meru.layout.json` — Meru 2 exported into the format (reference for scale; legacy keys, so its naming issues are warnings).
- `vendor/three/three.module.js` — for WALK IT. The walker is ONE simple test fox built in the viewer (about 10 boxes, 2.6 m tall like the game fox) so it loads instantly. No fox-kit, no cast.

ADD PER WORLD (before the first message): `uploads/surface_<world>.html` (Ben's 2D world file) and that world's section of `uploads/8GATES_DESIGN_BRIEF_ALL.md`.

NOT in the kit (stays here): engine/cast.js, world-kit / building-kit (the real look is added at merge), combat, bosses, creatures, powerups, save.js, story.js, Game HUD, shop kits, minigames, audio.

---

## 2) LAYOUT DATA FORMAT — `layout/<world>.layout.json`

Plain JSON (no functions, no imports). Same frame as Meru 2: METRES, x = east, z = south, y = up, origin (0, 0) = the world's main plaza centre. Rects are `[x0, x1, z0, z1]`. Points are `[x, z]`. Faces are `N | S | E | W`. Field names copy meru2-layout.js so the Meru builders can read it with little change.

```json
{
  "meta":     { "world": "gaya", "version": 3, "date": "2026-10-22", "from": "surface_gaya.html", "notes": "" },
  "map":      { "half": 400, "spawn": [0, 20], "spawnFace": "N" },
  "palette":  { "wall": "#d9c9a8", "roof": "#7a3b2a", "path": "#e8c35a", "trim": "#201e1d" },
  "zones":    [{ "key": "gayaTown", "label": "Gaya Town", "r": [-50, 50, -40, 40], "music": "town", "depth": 80 }],
  "surfaces": [{ "s": "stone", "r": [-50, 50, -40, 40] }],
  "water":    [{ "e": [0, 300, 200, 80] }],
  "roads":    [{ "w": 12, "p": [[-150, -120], [150, -120]] }],
  "paths":    [{ "key": "toTennis", "label": "Town → Tennis", "w": 4, "p": [[0, 0], [120, 0]], "lining": "lamps", "every": 14 }],
  "buildings":[{ "key": "gayaTennis", "label": "Tennis Club", "f": [80, 120, -30, 10], "door": [80, -10], "face": "W",
                 "h": 9, "style": { "wall": "plank", "roof": "gable" }, "room": { "w": 24, "d": 20, "floor": "wood" }, "interior": true }],
  "spots":    [{ "key": "tennisCoach", "at": [74, -10], "face": "E", "kind": "npc", "zone": "gayaTown" }],
  "dock":     { "key": "gayaSpacedock", "pad": [0, -300], "r": 14, "face": "S" },
  "gates":    [{ "key": "gayaArena", "at": [380, 0], "r": 6, "kind": "battle" }],
  "wild":     [{ "key": "gayaWildEast", "r": [200, 380, 60, 300], "for": "gayaArena" }],
  "props":    [{ "k": "bench", "at": [10, 12], "face": "S" }, { "k": "tree", "at": [30, 30] }]
}
```

Field additions (s345):
- `buildings.role` = one of the EVERY WORLD HAS roles (section 7) or shop / house / other. `note` = what makes it unique.
- `spots.kind`: npc · keeper · crowd · hiring · game · relicFind (the legendary relic to find) · vehicle (the world's special vehicle).
- `gates.kind`: battle · cave · minigame.
- `wild.creatures`: any of monsters · creatures · robots.

Field rules:
- `zones` = the 2D game's separate screens as areas of ONE map (path screens become zones). `depth` ≥ 30.
- `buildings.f` = footprint rect, `door` = a point ON the footprint edge of side `face`. `interior: true` = you can go in (the room is built here, far away, quick fade). `room` = the size wish for the inside only.
- `spots` = WHERE someone stands, never what they say. `kind`: npc · keeper (inside: `"room": "<buildingKey>"`, local x/z) · crowd · hiring (NOW HIRING sign) · game (a minigame ring).
- `gates` = the entry point to a separate battle map / minigame page. `wild` = the off-path area where creatures roam for that gate (creatures picked here, not there).
- `paths.lining` = lamps | lanterns | trees (CLAUDE.md path readability). `every` = metres between them.
- `props` = decoration only, cuttable for phone budget. Kinds from a fixed list in the kit (bench, tree, lamp, planter, fence, rock, stall, sign, statue, fountain, crate, barrel). A new kind = ask Ben, add it to the kit list.
- `palette` = the only place colours are written; buildings refer to palette names.
- No `y` heights except `buildings.h`. Ground is flat unless `hills: [{ "c": [x, z], "r": 40, "h": 8 }]` is added.

---

## 3) NAMING / ID RULES

- Every key is camelCase and STARTS WITH THE WORLD ID (`gayaTennis`, `gayaWildEast`), except a 2D NPC key used verbatim (below).
- Zones + rooms: the BRACKETED 2D game name exactly (`[gayaTennis]` → `gayaTennis`). Never rename, never drop one. A place that is not in the 2D file: `<world><Name>` + `"new": true`.
- Spots: the 2D file's NPC key verbatim (`tennisCoach`) + `"from2d": true` (so the checker skips the prefix rule). If the 2D file has none: `<world>Npc01`, `02` … + `"draft": true` (named here later).
- Space dock: `<world>Spacedock` (every world except earth). Battle gates: the 2D battle room name.
- Keys are unique inside the file AND across all worlds (the world prefix does this). Keys never change after merge 1; to remove one, list it in `meta.cut` as `{ "key": "gayaOldMill", "why": "…" }`.
- Files the world chat owns (and nothing else): `layout/<world>.layout.json`, `<World> Layout.dc.html` (its own viewer copy, optional), `screenshots/<world>/*`. No changes to anything under `kit/`, `engine/`, `vendor/`, `fox-kit.js`.
- localStorage in the world chat: only `<world>.layoutDraft`. No save keys, no story flags.
- `meta.version` goes up by 1 on every hand-back.

---

## 4) MERGE CHECKLIST (done HERE, in this project)

A. Checker (kit/layout-check.js must pass before the hand-back, re-run here):
- [ ] JSON parses, `meta.world` matches the file name, `version` higher than the last merge.
- [ ] Every bracketed room / zone name in surface_<world>.html is present (or `cut` with a reason).
- [ ] All keys unique, world-prefixed, none already used by another world.
- [ ] Every door has a clear 12 x 8 m apron and a path link to a main path; nothing on the line from door to path.
- [ ] Every path has lining (`lamps / lanterns / trees`), gaps ≤ the `every` value.
- [ ] Spawn on a path; every zone reachable on foot from spawn.
- [ ] Nothing outside `map.half`; no footprints overlapping; no building in water.
- [ ] Dock present (not earth), every gate has a `wild` area, wild areas do not touch paths.
- [ ] Phone budget: buildings ≤ 40 shells, props ≤ 400, lamps ≤ 150 (tune after the first merge).

B. Bring it in:
- [ ] Copy the working files to `backup/<world>/` first.
- [ ] Copy `layout/<world>.layout.json` in (overwrite the old version only after backup).
- [ ] Build `<World>.dc.html` + `worlds/<world>-walk.js` from the Meru 2 builders reading the JSON (city shells, roads, paths, lamps, water, dock pad).
- [ ] Mount Game HUD (`data-hud-host`), cast from engine/cast.js, shared save.

C. Join it to the data that lives here:
- [ ] Map every `spot` key to the roster (lines verbatim from the 2D file); list spots with no roster entry and roster foxes with no spot.
- [ ] Map every `interior` building to its room / shop / minigame file; list the missing ones.
- [ ] Every GAMES_INDEX.md game tagged with this world has a `kind: game` spot or a building `games` entry (section 6); list the missing ones.
- [ ] Map every `gate` to its battle map / minigame page; robots written as HACKED (story arc).
- [ ] Quests: check every quest step's place key exists in the layout.

D. Test + record:
- [ ] Walk it at 390x844 and 844x390: spawn framing, every door, every zone label switch, dock, each gate.
- [ ] Phone frame time on the iPhone (shadows off, far crowds hidden).
- [ ] Update BUILD_PLAN.md: world, layout version merged, what is wired, what is missing, a TRY THIS list.
- [ ] Later layout changes: the world chat sends a new version; merge only the diff (keys added / moved / cut).

---

## 5) FIRST MESSAGE FOR EACH WORLD CHAT (replace GAYA / gaya)

```
HI CLAUDE! This project builds the world GAYA of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md and worlds/gaya.plan.md first, then uploads/surface_gaya.html (the 2D world: the source of truth for every room name, building position and NPC key).

PHASE 1 · LAYOUT: lay out the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and write layout/gaya.layout.json (PARALLEL_WORLDS.md section 2). Check it in Layout Viewer.dc.html (WALK IT, phone sizes 390x844 and 844x390). Section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.

PHASE 2 · EXTERIORS (big roof signs + eye-level door signs, walk-in doors like Meru 2), then I walk it. PHASE 3 · INTERIORS one by one, deluxe. PHASE 4 · each game and job in worlds/gaya.plan.md INSIDE its place, the Meru Claw Crane way (IN_WORLD_GAMES.md); game code from GitHub BlindbenFILMS/3D-foxgate8, copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start Phase 1.
```

---

## 6) MINIGAMES REPO (Ben, s345: "it will soon become relevant")
All 8 GATES 3D minigames live in GitHub **BlindbenFILMS/3D-foxgate8** (live: https://blindbenfilms.github.io/3D-foxgate8/3D-GAMES/ · Ben's PC: Documents\8 GATES\all-files\FOXgate8-3D\3D-GAMES\).
- START HERE: `3D-GAMES/GAMES_INDEX.md` = every game (~125) + 29 vehicles, grouped by type, each with its world tag (Meru, Gaya, Jidda, Kufa, Luxor, Nebo, Ur, Zion, Home, Earth, Kyoto, or "Any world" / Town / Tavern…) and the exact page path.
- `3D-GAMES/index.html` = the Game Room menu.
- `3D-GAMES/<Name>.dc.html` games share `3D-GAMES/engine/`, `minigames/`, `fox-kit.js`, `vendor/`.
- `3D-GAMES/g/<folder>/` games are self-contained (own engine, vendor, support.js); code in that folder's `minigames/` or `blob/*.js` / `*.bundle.js`.
- Vehicles: all in `3D-GAMES/Vehicle Workshop.dc.html?v=<key>` (models engine/vehicle-kit.js + engine/vehicle-fun.js).
- Fox Fighters: `FOXFIGHTERS-FINAL/FoxFighters/`. Online: engine/duel-net.js + vendor/trystero-nostr.js, cap 4 players (5 for poker + card tables).

FOR THE WORLD LAYOUT CHATS: every game in GAMES_INDEX.md tagged with your world needs a place on the map. Put it as a spot with `"kind": "game"` and `"game": "<page path from GAMES_INDEX.md>"` (for example `{ "key": "gayaTennisRing", "kind": "game", "game": "3D-GAMES/Gaya Tennis.dc.html", "at": [90, -12] }`), or on a building as `"games": ["<path>", …]` when it is played inside. "Any world" / Town / Tavern games: only where Ben asks. Do NOT copy the game code into the layout project; the wiring happens here at merge.
MERGE (add to section 4 C): every GAMES_INDEX game tagged with the world has a spot or building; list the missing ones.

---

## 7) EVERY WORLD HAS (Ben, s345) — the Map Workshop checklist + checker rule "every world"
Buildings (role): castle · barracks · police · fire · news (News Station) · tavern (UNIQUE minigame) · itemshop · armory · post (GALACTIC POST OFFICE = Meru Embassy) · farm · restaurant (UNIQUE) · sport (UNIQUE) · specialty (UNIQUE shop, like a pet store) · weapons (SPECIAL WEAPONS: the 8 extra ranged + melee, not the bug catcher) · relicShop (the 1 famous relic to BUY) · bank · carRental · home (APARTMENT OR HOUSE the player rents / buys) · hospital · housing (residential, 3 or more).
On the map: 1 CAVE (gate kind cave) · at least 4 BATTLE AREAS (gate kind battle, each with its wild area) · wild areas with MONSTERS, CREATURES and ROBOTS · the 1 LEGENDARY + HISTORICAL relic to FIND (spot relicFind) · at least 1 SPECIAL VEHICLE (spot vehicle) · the space dock (not Earth).
Layout: buildings EASY TO FIND, laid out ON A GRID · LARGE, EASY walking paths (6 m default in the workshop; the checker warns under 4 m) · lit paths.
Remember the story (CLAUDE.md): the robots are hacked Machine Fleet units, victims not villains.

---

## 8) EACH WORLD LOOKS LIKE ITSELF (Ben, s345) — "look" + "terrain" in the layout file
```json
"look":    { "sky": ["#b9a3e3", "#e6dcf5"], "fog": "#e2d6f3", "sun": "#ffe8c8", "light": "#f4eefc", "grass": "#9db38a", "ground": "#b7a98e", "water": "#6fa6d6", "lamps": "#ffd58a", "notes": "…" },
"terrain": { "hills": [{ "key": "gayaMountain", "c": [350, -310], "r": 130, "h": 70 }], "cuts": [{ "key": "gayaGorge", "r": [-120, 120, 206, 240], "depth": 18 }], "notes": "…" }
```
- sky = [top, horizon]. The viewer's WALK IT paints the sky, fog, light, grass and water from it; the Map Workshop draws hills as rings + cuts (gorges, quarries) in black.
- Hills sit OUTSIDE the town grid (the checker warns if a hill reaches a building or a path); towns stay flat + easy to walk. A path over a cut = a bridge. Snow = surface "snow".
- Every world needs its own look (the checker warns without one). Ideas: Gaya lilac sky + gold stone + violet roofs · Kyoto pink-gold dusk, red lacquer · Jidda turquoise sea + white sand · Kufa amber desert haze + dunes · Luxor smoky orange sky + black basalt + the volcano · Nebo deep green pines + mountain mist · Ur pale gold stone + pyramids under a hot white sky · Zion red rock mesas + dusty sunset · Home snow + ice-blue sky · Earth neon city night.

---

## 9) BUILD ORDER, SIGNS + DOORS (Ben, s345 — every world)
TOP PRIORITY: MOBILE FIRST (390x844 + 844x390 before desktop).
BUILD ORDER (one world chat):
1. LAYOUT — the Map Workshop map passes the checker.
2. EXTERIORS — every building gets its real outside: its own shape + roof + door (not the same box recoloured), the world's look (section 8), the ROOF SIGN + DOOR SIGN (below), lit windows at night, working doors (below). Lamps + trees along every path. → BEN WALKS IT (phone + desktop) and says OK before any interior.
3. INTERIORS — one building at a time, DELUXE POLISH; REUSE the room our game / job already has (repo files), fitted into the footprint, so phase 4 makes it playable right there (INTERIOR RULES in IN_WORLD_GAMES.md: open walkway door → place of action, window light by day, lamps at night, small moving details, a door chime). Ben walks each one before the next.
4. JOBS + GAMES IN THE WORLD — worlds/<world>.plan.md order, the Meru Claw Crane recipe (IN_WORLD_GAMES.md), with stand-in keepers.
5. AVATARS + STORY — back in the main project (the cast, keepers, lines, quests).

SIGNS (Ben has low vision: BIG + high contrast, always):
- ROOF SIGN on every building: the name in big capitals (Archivo-style bold) on a board along the roof edge facing the main path; readable from 60 m+ on a phone; light ink on a dark board (or dark on light), lit at night; 1–3 words. Signature buildings may add a 3D roof toy (like Meru's spinning burger / gold coin).
- DOOR SIGN at the AVATAR'S EYE LEVEL (about 1.8–2.2 m; the fox is 2.6 m to the ear tips): a plate on the wall or a post BESIDE the door, facing the path you walk in on: the name + what is inside ("TAVERN · PING-PONG"). Letters 0.35 m+ tall so it reads from 10 m on a phone. NOW HIRING board next to it when the shop hires.
- Canvas text keeps a margin (never cut off). Signs hide while the camera is inside their building. Layout data: optional `"sign": { "roof": "TAVERN", "door": "TAVERN · PING-PONG" }` on a building (default = its label). The viewer's WALK IT shows both.

DOORS — ENTER + EXIT LIKE MERU 2:
- Town buildings are WALK-IN: real shells (4 walls + a top) with a gold light-up frame round automatic sliding glass doors (about 4 × 4.5 m, open at 2.5 m, chime). You walk straight in: no loading, no fade.
- CUTAWAY inside: the top and the walls between the camera and the player fade out; the camera is held inside the room (0.35 m in from every wall, under the ceiling); a gold X-RAY silhouette of the fox shows through anything that hides it. Walk out through the same door (or a back door onto the road side).
- The room is built INSIDE the building's footprint, so footprint = room size (the layout's room w / d).
- QUICK FADE only for big separate places: the castle keep, the cave, tower lobbies, battle maps (a short fade, the room lives far away in the same scene, no load screen).
