# START HERE — JIDDA (Ben)

1. Make a NEW project (name it "8 GATES · JIDDA"), attach the Modernist design system.
2. Unzip this folder into it (everything at the project root: CLAUDE.md, Map Workshop.dc.html, Layout Viewer.dc.html, kit/, layout/, worlds/, uploads/, vendor/ …).
3. Upload your 2D Jidda file into uploads/ as `surface_jidda.html` (from Documents\8 GATES\all-files\8GATES-SITE).
4. Connect GitHub (BlindbenFILMS/3D-foxgate8) when the chat asks; it copies only the games Jidda needs.
5. Paste this as the first message:

```
HI CLAUDE! This project builds the world JIDDA of my game 8 GATES (3D rebuild of my 2D fox game).
Read CLAUDE.md, PARALLEL_WORLDS.md, IN_WORLD_GAMES.md, worlds/jidda.plan.md (every game, job + vehicle and WHERE it lives on the map) and uploads/JIDDA_BRIEF.md first, then uploads/surface_jidda.html (the 2D world: the source of truth for every room name, building position and NPC key).

A first draft of the map is already in layout/jidda.layout.json (open Map Workshop.dc.html, world JIDDA). Check it against the 2D file: fix room names + NPC keys, keep what works.

PHASE 1 · LAYOUT: polish the city with me in Map Workshop.dc.html (I can move things myself; it saves a draft on my device) and keep layout/jidda.layout.json passing the checker. Walk it in Layout Viewer.dc.html (WALK IT; the sea + islands show there, phone sizes 390x844 and 844x390). PARALLEL_WORLDS.md section 7 = what every world must have.
- ONE connected outdoor map; keep every bracketed room name exactly. Buildings on a grid, easy to find; large lit paths.
- Only ONE test avatar, as simple as possible (the viewer's test fox), so it loads fast.
- JIDDA FEELS LIKE VENICE (Ben s348): TOWN ISLAND is a Venice-style canal town: the GRAND CANAL right through it (water "canal": true cuts the island) + side rios, gondolas + a water-taxi stop, fondamenta walks, arched stone bridges (the big covered CREST BRIDGE like the Rialto), PIAZZA DELLA CRESTA with a tall brick CAMPANILE on the north bank, pastel palazzi with white gothic arches + wooden altana roof terraces, striped mooring poles, geraniums, Burano-bright houses, a pink + white Doge-style sea palace for the castle. The outer islands stay lush garden islands.
- ISLANDS SPREAD OUT (Ben s348): wide channels of open sea between Town Island and every other island (map.half 540): Farm Island far south, the castle + barracks north, surf beach, Ocean World + dock east.
- JIDDA IS THE WATER WORLD: a bright turquoise LAGOON ARCHIPELAGO, the water is the road. The whole map is SEA; land is the new "islands" field (Map Workshop: AREA → ISLAND). PLENTY OF OPEN SEA TO SAIL AND JETSKI: keep the wide ring of open water round the islands clear. Sun-bleached white stone + pale timber, cyan-blue trim + turquoise domes, coral pink, piers, boats + buoys, LUSH TROPICAL ISLANDS with natural coastlines (bays, points, coves; never boxes: islands use "blob": true), thick jungle of palms, banana plants, ferns + flowering bushes (hibiscus) down to a pale sand ring (terrain.forests mix "tropical"). Paths across water are piers / causeways / bridges / the ferry lane (walkable). EVERY BRIDGE IS HIGH ("bridge": true): jet skis, the speedboat + small boats pass underneath, so you can ride between all the areas.
- 2D keys are short (jTown, jFarm…): the 3D keys start with jidda…, the 2D key is in "room2d".
- Keep these Jidda extras: TOWN ISLAND (crest mooring, transport pad, piers to every building) · the CASTLE CAUSEWAY → a SMALL CASTLE ISLAND (the sea palace set well back, a wide CASTLE FORECOURT to walk across first, + the royal court) + a BIG BARRACKS ISLE across a high bridge (barracks, training yard, sea wall + the LIGHTHOUSE) · FARM ISLAND (carrot rows, whack a mole, mole hole) · the SURF beach island (contest stands facing THE BREAK: waves rolling in from the east, surf zone flags, JIDDA MARINA, volleyball, swim + tube starts) · OCEAN WORLD isle · CORSAIR REACH across the FERRY LANE = FOUR SEPARATE ISLANDS joined by HIGH ARCHED BRIDGES you can JETSKI UNDER (Landing, The Crag, The Shoals DIG SITE (the red X in the sand: dig and the floor gives way, you FALL into THE DROP cave; you climb back out of the MOLE HOLE on Farm Island), the Pirate Hideout + Corsair Hut) · the SANDBAR relic islet · the ROYAL HELIPAD + ROYAL TELEPORT PAD west of the castle (teleport → the Jidda Space Dock, SE isle) + 2 more helipads (Infirmary, Surf Contest) · JET SKI, SPEEDBOAT, SAILBOAT, SURFBOARD + GIANT TURTLE spots.
- EVERY building: BIG ROOF SIGN + EYE-LEVEL DOOR SIGN ("sign" in the layout) and its own UNIQUE outside ("outside" note in the layout: build exactly that).
- UNIQUE BUILDINGS (Ben): NO TWO BUILDINGS LOOK ALIKE. Each one gets its own shape, roof, door and a landmark detail from its "outside" note (e.g. the smoothie hut's giant pineapple cup, the Surf Shop fenced with boards, the Sea Chest shaped like a treasure chest, the Boat House with an upturned hull roof, the Shell House's conch roof, the striped lighthouse). Never the same box recoloured, even for the 3 houses.

PHASE 2 · EXTERIORS: every building's real outside with a BIG ROOF SIGN and a DOOR SIGN at the avatar's eye level, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9). Then stop: I walk the town.
PHASE 3 · INTERIORS: one building at a time, deluxe polish; I walk each. VERY IMPORTANT: bring in as much as possible of the rooms our games + jobs already have (repo), fitted into their buildings, so they become PLAYABLE IN THE WORLD.
TOP PRIORITY: MOBILE FIRST. Check everything at 390x844 and 844x390 before desktop.
PHASE 4 · JOBS + GAMES: each game and job in worlds/jidda.plan.md INSIDE its place, one per pass, the Meru Claw Crane way (IN_WORLD_GAMES.md). Game code is in GitHub BlindbenFILMS/3D-foxgate8 (3D-GAMES/GAMES_INDEX.md); copy only that game's files.

Avatars, story, quests and battles stay in my main project. Ask me questions first (one round), then start.
```

## Open picks for you (marked DRAFT in the map)
- the SPEEDBOAT + SAILBOAT models (Vehicle Workshop: add them if they are not in vehicle-kit yet) · a SAILING REGATTA game? · the legendary relic to FIND (DRAFT: on the lonely sandbar) · the famous relic to BUY (The Sea Chest).
- new buildings with draft names: Pearl Bank, Harbour Watch (police), Sea Rescue & Fire, The Tide Times (news), Harbour Infirmary, Driftwood Cottage (your home), Hook & Harpoon (special weapons), Jidda Marina (boat hire), Ocean World, Lighthouse, 3 houses.
- jobs not built yet: WATER TAXI PILOT, FISH MARKET AUCTION, LIGHTHOUSE KEEPER, SKIMMER.
- battles: THE SINK (landing), REACH LANDING, THE CRAG, PIRATE HIDEOUT; cave THE DROP → Flooded Gallery → Mole Shaft (the Jidda Crystal). The pirates' rewired SENTRY BOTS are HACKED Machine Fleet units (DRAFT): free them.
