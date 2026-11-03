# START HERE — LUXOR (Ben)

1. Make a NEW project (name it "8 GATES · LUXOR"), attach the Modernist design system.
2. Unzip this folder into it (everything at the project root: CLAUDE.md, Map Workshop.dc.html, Layout Viewer.dc.html, kit/, layout/, worlds/, uploads/, vendor/ …).
3. Upload your 2D Luxor file into uploads/ as `surface_luxor.html` (from Documents\8 GATES\all-files\8GATES-SITE).
4. Connect GitHub (BlindbenFILMS/3D-foxgate8) when the chat asks; it copies only the games Luxor needs.
5. Paste this as the first message:

```
HI CLAUDE! This project builds the world LUXOR of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md, worlds/luxor.plan.md (every game, job + vehicle and WHERE it lives on the map) and uploads/LUXOR_BRIEF.md first, then uploads/surface_luxor.html (the 2D world: the source of truth for every room name, building position and NPC key).

A first draft of the map is already in layout/luxor.layout.json (open Map Workshop.dc.html, world LUXOR). Check it against the 2D file: fix room names + NPC keys, keep what works.

PHASE 1 · LAYOUT: polish the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and keep layout/luxor.layout.json passing the checker. Walk it in Layout Viewer.dc.html (WALK IT, phone sizes 390x844 and 844x390). PARALLEL_WORLDS.md section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.
- LUXOR IS THE VOLCANO WORLD: a walled basalt FORTRESS TOWN in rings (the red-cobbled square, the clockwise BIKE TRACK round it, four avenues out through the black city wall). SLIGHTLY RED SKY (warm red dusk). RED IS THE BUILD THEME COLOUR: red walls, roofs, trim, doors + banners, black basalt second, iron + lava orange accents. THE VOLCANO is the big landmark: a 110 m cone south of the lava river with a glowing lava crater, smoke plume + embers, seen from everywhere (terrain hill luxorVolcano). Keep the town and every road flat. Water marked "lava": true is LAVA (paint it glowing).
- SWAP (Ben s348): the PYRAMID is now in Luxor (moved from Ur: Pyramid Path + 4 pyramid rooms, Pyramid Dig, Wrecking Crane); the ZOO moved to Ur. See the top of uploads/LUXOR_BRIEF.md.
- Keep these Luxor extras: the BIKE TRACK round the square + the CINDER CUP stand · the tar SPIKE DITCH + iron bridge on the Castle Path · PIT ROAD → the FIGHTING PIT (boxing) · the VOLCANO PLAINS: lava river + lava bridge, the VOLCANO RUN track (lava jump), the VOLCANO CAVE · the PYRAMID with the sphinx, monolith + dig site · the RED PLAINS (3 bridges, hidden ship) · the ROYAL HELIPAD + ROYAL TELEPORT PAD west of the keep (teleport → the Ember Dock) + 2 more helipads (Infirmary medevac, Fighting Pit) · MOTORCYCLE, ROBOT SPIDER + WRECKING CRANE spots.
- EVERY building: BIG ROOF SIGN + EYE-LEVEL DOOR SIGN ("sign" in the layout) and its own UNIQUE outside ("outside" note in the layout: build exactly that).
- UNIQUE BUILDINGS (Ben): NO TWO BUILDINGS LOOK ALIKE. Each one gets its own shape, roof, door and a landmark detail from its "outside" note (e.g. the Tavern's foosball player over the door, the Deli's sandwich sign, the Obsidian Vault's black mini-pyramid, the keep shaped like a cut-off pyramid). Never the same box recoloured, even for the 3 tower houses.

PHASE 2 · EXTERIORS: every building's real outside with a BIG ROOF SIGN and a DOOR SIGN at the avatar's eye level, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9). Then stop: I walk the town.
PHASE 3 · INTERIORS: one building at a time, deluxe polish; I walk each. VERY IMPORTANT: bring in as much as possible of the rooms our games + jobs already have (repo), fitted into their buildings, so they become PLAYABLE IN THE WORLD.
TOP PRIORITY: MOBILE FIRST. Check everything at 390x844 and 844x390 before desktop.
PHASE 4 · JOBS + GAMES: each game and job in worlds/luxor.plan.md INSIDE its place, one per pass, the Meru Claw Crane way (IN_WORLD_GAMES.md). Game code is in GitHub BlindbenFILMS/3D-foxgate8 (3D-GAMES/GAMES_INDEX.md); copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start.
```

## Open picks for you (marked DRAFT in the map)
- the new SPECIALTY SHOP that replaces the zoo (DRAFT: Lava Glass Works) · the legendary relic to FIND (DRAFT: buried by the hidden ship on the Red Plains) · the famous relic to BUY (The Obsidian Vault) · does the pyramid's crystal seam tie to Lox's missing crystal?
- the pyramid's NPCs came from Ur (Carter Ur-Nanshe, Ninshubur, Puzur, Bau, Hero Eresh): keep or rename for Luxor.
- new buildings with draft names: Ash Watch (police), Cinder Brigade (fire), The Ember Times (news), Basalt Bank, Luxor Infirmary, Basalt Loft (your home), Spike & Spark (special weapons), Ash Farm, The Cinder Court (basketball + dodgeball), 3 tower houses. The Bike Shop is also the car rental.
- jobs not built yet: BIKE PIT CREW (Volcano Run pits), BASALT FORGE (by the Armory).
- battles: FURNACE, the ASH FIELDS, the RED PLAINS (Ashwalker), the PYRAMID STEPS (DRAFT). Furnace machines + Ray Sentinels are HACKED Machine Fleet robots: free them.
