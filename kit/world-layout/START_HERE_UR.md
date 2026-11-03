# START HERE — UR (Ben)

1. Make a NEW project (name it "8 GATES · UR"), attach the Modernist design system.
2. Unzip this folder into it (everything at the project root: CLAUDE.md, Map Workshop.dc.html, Layout Viewer.dc.html, kit/, layout/, worlds/, uploads/, vendor/ …).
3. Upload your 2D Ur file into uploads/ as `surface_ur.html` (from Documents\8 GATES\all-files\8GATES-SITE).
4. Connect GitHub (BlindbenFILMS/3D-foxgate8) when the chat asks; it copies only the games Ur needs.
5. Paste this as the first message:

```
HI CLAUDE! This project builds the world UR of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md, worlds/ur.plan.md (every game, job + vehicle and WHERE it lives on the map) and uploads/UR_BRIEF.md first, then uploads/surface_ur.html (the 2D world: the source of truth for every room name, building position and NPC key).

A first draft of the map is already in layout/ur.layout.json (open Map Workshop.dc.html, world UR). Check it against the 2D file: fix room names + NPC keys, keep what works.

PHASE 1 · LAYOUT: polish the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and keep layout/ur.layout.json passing the checker. Walk it in Layout Viewer.dc.html (WALK IT, phone sizes 390x844 and 844x390). PARALLEL_WORLDS.md section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.
- UR IS AN ORANGE TERRACOTTA CANAL CITY: the old town sits on an island inside a square CANAL RING (4 bridges) round the crested transport pad + fountain. ORANGE TERRACOTTA + clay brick is the build theme colour, turquoise glazed tile the accent, brass tokens, U-crest banners. Hot bright blue sky to a white-hot horizon. Flat river plain with low clay tells, a reed marsh, a clean blue lake and a poisoned green one (water marked "toxic": true is green until cleaned). Keep the town and every road flat.
- SWAP (Ben s348): the ZOO is now in Ur (moved from Luxor: the Zoo Path with ten cages + Hessa's Menagerie); the PYRAMID moved to Luxor. See the top of uploads/UR_BRIEF.md.
- Keep these Ur extras: the CANAL RING + 4 bridges · the TAVERN as the college pub (cribbage, skee ball, THE MACHINE) · COLLEGE WALK (College Stadium, Cricket Nets, Power House) · the LAB PATH picket line → the white UR LABORATORY → BEAST RUN, FAR END, HUNTERS POND · the CLEAN LAKE (The Storage, jetty, farm) · the TOXIC LAKE (skiff + skimmer, The Works) · the ZOO PATH → Hessa's Menagerie · the ROYAL HELIPAD + ROYAL TELEPORT PAD west of the palace (teleport → the Ur Space Dock) + 2 more helipads (Infirmary medevac, College Stadium) · the HOVERBOARD at Hover Hire.
- EVERY building: BIG ROOF SIGN + EYE-LEVEL DOOR SIGN ("sign" in the layout) and its own UNIQUE outside ("outside" note in the layout: build exactly that).
- UNIQUE BUILDINGS (Ben): NO TWO BUILDINGS LOOK ALIKE. Each one gets its own shape, roof, door and a landmark detail from its "outside" note (e.g. the Lab is the only white building with a glass orrery dome, the Relic Shop is a giant rolling cylinder seal, the Bank has a turning brass token, the College is a stepped library). Never the same box recoloured, even for the 3 houses.

PHASE 2 · EXTERIORS: every building's real outside with a BIG ROOF SIGN and a DOOR SIGN at the avatar's eye level, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9). Then stop: I walk the town.
PHASE 3 · INTERIORS: one building at a time, deluxe polish; I walk each. VERY IMPORTANT: bring in as much as possible of the rooms our games + jobs already have (repo), fitted into their buildings, so they become PLAYABLE IN THE WORLD.
TOP PRIORITY: MOBILE FIRST. Check everything at 390x844 and 844x390 before desktop.
PHASE 4 · JOBS + GAMES: each game and job in worlds/ur.plan.md INSIDE its place, one per pass, the Meru Claw Crane way (IN_WORLD_GAMES.md). Game code is in GitHub BlindbenFILMS/3D-foxgate8 (3D-GAMES/GAMES_INDEX.md); copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start.
```

## Open picks for you (marked DRAFT in the map)
- the cave (DRAFT: THE REED CAVES under the north-west marsh, replaces the pyramid) + its boss · the legendary relic to FIND (DRAFT: the FIRST CLAY TABLET in the marsh) · the famous relic to BUY (The Cylinder Seal).
- new buildings with draft names: Token House (bank), Clay Watch (police), Kiln Brigade (fire), The Tablet (news), Ur Infirmary, Garden Terrace (your home), Bronze & Bolt (special weapons), Hover Hire (car rental), Barley & Date Farm, College Stadium, Power House, 3 houses.
- jobs not built yet: TABLET SCRIBE, BRICK KILN, COLLEGE ARCHIVIST, GLYPH LOCK.
- battles: THE GAUNTLET, BEAST RUN, SPECIMEN ONE (Hunters Pond), THE TOXIC WORKS. Gate Wardens are HACKED Machine Fleet robots (free them); the lizards are collared lab mutants (victims too).
- the zoo + the lab: the picket line says SAVE the ANIMALS. Should the zoo animals tie into the lab story?
