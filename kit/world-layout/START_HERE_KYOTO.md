# START HERE — KYOTO (Ben)

1. Make a NEW project (name it "8 GATES · KYOTO"), attach the Modernist design system.
2. Unzip this folder into it (everything at the project root: CLAUDE.md, Map Workshop.dc.html, Layout Viewer.dc.html, kit/, layout/, worlds/, uploads/, vendor/ …).
3. Upload your 2D GAYA file into uploads/ as `surface_gaya.html` (the Kyoto rooms are inside it) (from Documents\8 GATES\all-files\8GATES-SITE).
4. Connect GitHub (BlindbenFILMS/3D-foxgate8) when the chat asks; it copies only the games Kyoto needs.
5. Paste this as the first message:

```
HI CLAUDE! This project builds the world KYOTO of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md, worlds/kyoto.plan.md (every game, job + vehicle and WHERE it lives on the map) and uploads/KYOTO_BRIEF.md first, then uploads/surface_gaya.html (the 2D Gaya file holds the Kyoto rooms, kyoto… keys: the source of truth for every room name, building position and NPC key).

A first draft of the map is already in layout/kyoto.layout.json (open Map Workshop.dc.html, world KYOTO). Check it against the 2D file: fix room names + NPC keys, keep what works.

PHASE 1 · LAYOUT: polish the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and keep layout/kyoto.layout.json passing the checker. Walk it in Layout Viewer.dc.html (WALK IT, phone sizes 390x844 and 844x390). PARALLEL_WORLDS.md section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.
- KYOTO IS OLD SAMURAI-AGE JAPAN IN CHERRY BLOSSOM SEASON: OLD-STYLE JAPANESE BUILDINGS only (wooden machiya with lattice fronts, temples with sweeping grey-tile roofs + upturned eaves, a white 5-roof castle keep, thatched farmhouses), red torii gates, stone + paper lanterns, noren curtains. CHERRY TREES everywhere (terrain.forests mix "cherry": pink blossom, petals drifting). Soft blue sky to a pink-blush horizon, a holy mountain to the east. Keep the town and every road flat.
- The SAMURAI + SUMO AVATARS come LATER at the MERGE (main project): keep the one test fox + box stand-ins here.
- Keep these Kyoto extras: the red-lacquer square (stage, notice board, go board, tea mat) · the CASTLE APPROACH as a tunnel of RED TORII → the white castle keep + the Samurai Barracks kendo yard · the TEMPLE + ONSEN on Temple Row · the cherry-pink MOUNTAIN ROAD (archery range, shrines, cairns, shrine stair + platform, the Sage's Hut) → UNDER THE MOUNTAIN (river, bridge) → THE HIDEOUT cave · the SUMO APPROACH (stalls, scoreboards) → THE DOHYO · THE KITSUNE WOOD (earthKitsune: the moonlit kitsune clearing with the fire, stone, wedding table + chest, a lantern-lined path, fox-fire wisps) → KITSUNE BEACH (pale sand, calm sea, the DOCK with 2 boats, a red torii in the shallows) · the ROYAL HELIPAD + ROYAL TELEPORT PAD west of the castle (teleport → the Kyoto Space Dock) + 2 more helipads (Infirmary medevac, Sumo Hall) · the DRAGON HATCHLING behind the Rickshaw Stand.
- EVERY building: BIG ROOF SIGN + EYE-LEVEL DOOR SIGN ("sign" in the layout) and its own UNIQUE outside ("outside" note in the layout: build exactly that).
- UNIQUE BUILDINGS (Ben): NO TWO BUILDINGS LOOK ALIKE. Each one gets its own shape, roof, door and a landmark detail from its "outside" note (e.g. the castle's 5 stacked roofs with gold fish, the temple's sweeping double roof + bell tower, the thatched tea hut in a moss garden, the sushi house's giant carp sign, the Fox Shrine Shop under its own little torii). Never the same box recoloured, even for the 3 houses (machiya, thatched minka, garden house).

PHASE 2 · EXTERIORS: every building's real outside with a BIG ROOF SIGN and a DOOR SIGN at the avatar's eye level, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9). Then stop: I walk the town.
PHASE 3 · INTERIORS: one building at a time, deluxe polish; I walk each. VERY IMPORTANT: bring in as much as possible of the rooms our games + jobs already have (repo), fitted into their buildings, so they become PLAYABLE IN THE WORLD.
TOP PRIORITY: MOBILE FIRST. Check everything at 390x844 and 844x390 before desktop.
PHASE 4 · JOBS + GAMES: each game and job in worlds/kyoto.plan.md INSIDE its place, one per pass, the Meru Claw Crane way (IN_WORLD_GAMES.md). Game code is in GitHub BlindbenFILMS/3D-foxgate8 (3D-GAMES/GAMES_INDEX.md); copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start.
```

## Open picks for you (marked DRAFT in the map)
- the legendary relic to FIND (DRAFT: on the platform at the top of the shrine stair) · the famous relic to BUY (The Fox Shrine Shop) · the specialty shop (Tea Ceremony House, game NOT BUILT YET).
- battles: Mountain Road pack, Under the Mountain pack, the NORTHERN GUARDS (DRAFT), CLOCKWORK RONIN (DRAFT: hacked Machine Fleet guard robots dressed as samurai, free them). Cave: THE HIDEOUT (ninja boss + big dog).
- new buildings with draft names: General Store (item shop), Rice Exchange (bank), Magistrate's Watch (police), Fire Watch, The Kawaraban (news), Herb Infirmary, Lantern Row Lodgings (your room), Bow & Blade (special weapons), Rickshaw Stand (car rental), Rice Terraces (farm), Foxy Gyoza, Go Club, Capsule Corner, Fox Gate Pachinko, 3 houses.
- jobs not built yet: TEA CEREMONY, NOH STAGE.
