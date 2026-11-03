# START HERE — SHASTA (Ben)

1. Make a NEW project (name it "8 GATES · SHASTA"), attach the Modernist design system.
2. Unzip this folder into it (everything at the project root: CLAUDE.md, Map Workshop.dc.html, Layout Viewer.dc.html, kit/, layout/, worlds/, uploads/, vendor/ …).
3. Upload your 2D file for this world (the old Home planet) into uploads/ as `surface_player.html` (from Documents\8 GATES\all-files\8GATES-SITE).
4. Connect GitHub (BlindbenFILMS/3D-foxgate8) when the chat asks; it copies only the games Shasta needs.
5. Paste this as the first message:

```
HI CLAUDE! This project builds the world SHASTA of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md, worlds/shasta.plan.md (every game, job + vehicle and WHERE it lives on the map) and uploads/SHASTA_BRIEF.md first, then uploads/surface_player.html (the 2D world, it uses gaya… keys; the 3D keys are shasta… with the 2D key in "room2d": the source of truth for every room name, building position and NPC key).

A first draft of the map is already in layout/shasta.layout.json (open Map Workshop.dc.html, world SHASTA). Check it against the 2D file: fix room names + NPC keys, keep what works.

PHASE 1 · LAYOUT: polish the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and keep layout/shasta.layout.json passing the checker. Walk it in Layout Viewer.dc.html (WALK IT, phone sizes 390x844 and 844x390). PARALLEL_WORLDS.md section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.
- SHASTA IS A SNOW WORLD WITH MOUNTAINS (Ben s348; it was the Home planet, there is a NEW player planet now): an alpine town in a valley under MOUNT SHASTA. The CROSS-SHAPED square with an OUTDOOR SKATING RINK where the two avenues cross. Timber + grey stone under deep snow, ice-blue + gold trim, lilac window boxes, warm amber windows. Ice-blue sky to a white horizon, snowy ground, dark pines, a glassy lake with ice at the edges. Mountains ring the valley; the town and every road stay flat.
- CLUBHOUSE 8 stays in Shasta. The PLAYER'S APARTMENT is a FLAT INSIDE the Summit View Apartments block on the square (not its own house). See the top of uploads/SHASTA_BRIEF.md.
- Keep these Shasta extras: the outdoor SKATING RINK in the square · CLUBHOUSE 8 · the SKI LODGE (Bram's Ski Works, Mountain Hut, fire, CHAIR LIFT) → MOUNT SHASTA SLOPES (three slalom runs, Ice Gates, GLOW-WORM GROTTO, SNOW FORT) · SHASTA LAKE (jetty, pontoon, drone range) · THE RINK + Curling Club on the Stadium Path · the playground · the ROYAL HELIPAD + ROYAL TELEPORT PAD EAST of the castle (teleport → the Shasta Space Dock) + 2 more helipads (Infirmary medevac, Ski Lodge heli-ski) · ROCKET SKATES, HAMSTER BALL, POGO STICK + SPACE HOPPER spots.
- EVERY building: BIG ROOF SIGN + EYE-LEVEL DOOR SIGN ("sign" in the layout) and its own UNIQUE outside ("outside" note in the layout: build exactly that).
- UNIQUE BUILDINGS (Ben): NO TWO BUILDINGS LOOK ALIKE. Each one gets its own shape, roof, door and a landmark detail from its "outside" note (e.g. Clubhouse 8 with the giant glowing 8, Foxy Cakes like a frosted layer cake, the Chess Club's giant knight, the Checkers Club's stacked-piece roof, the Frost Vault carved like glacier ice). Never the same box recoloured, even for the apartment blocks + chalet.

PHASE 2 · EXTERIORS: every building's real outside with a BIG ROOF SIGN and a DOOR SIGN at the avatar's eye level, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9). Then stop: I walk the town.
PHASE 3 · INTERIORS: one building at a time, deluxe polish; I walk each. VERY IMPORTANT: bring in as much as possible of the rooms our games + jobs already have (repo), fitted into their buildings, so they become PLAYABLE IN THE WORLD.
TOP PRIORITY: MOBILE FIRST. Check everything at 390x844 and 844x390 before desktop.
PHASE 4 · JOBS + GAMES: each game and job in worlds/shasta.plan.md INSIDE its place, one per pass, the Meru Claw Crane way (IN_WORLD_GAMES.md). Game code is in GitHub BlindbenFILMS/3D-foxgate8 (3D-GAMES/GAMES_INDEX.md); copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start.
```

## Open picks for you (marked DRAFT in the map)
- the 4th battle (DRAFT: FROST RIDGE, snow wolves in the north-west pines) · the legendary relic to FIND (DRAFT: frozen under the ice at the end of the jetty) · the famous relic to BUY (The Frost Vault).
- new buildings with draft names: Foxy Cakes, Toy Workshop, Chess Club, Checkers Club, Curling Club, Glacier Bank, Snow Watch (police), Avalanche & Fire, The Shasta Snowpost (news), Shasta Infirmary, Frost & Flint (special weapons), Sled & Skate Hire (car rental), Snowberry Farm, Summit View Apartments (your flat), Pinecone Flats, Icicle Row, Chalet.
- jobs not built yet: PAPER ROUTE (Snowpost), PIZZA DELIVERY runs (Pizza Place).
- the story: Shasta is no longer the player's home planet. Who lives in the castle now, and does Hope still gather the nine seams here? (story stays in the main project)
