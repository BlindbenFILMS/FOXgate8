# JIDDA — WORLD PLAN (the water world: islands + open sea to sail and jetski, Ben s348)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Cornhole + Washers at the beach bar — `3D-GAMES/g/8-gates-minigames-phone-preview/Cornhole.dc.html` · `3D-GAMES/g/8-gates-minigames-phone-preview/Washers.dc.html`
2. RESTAURANT: Foxy Blends Smoothies (+ a FOX Gelato kiosk) — `3D-GAMES/Jidda Smoothie.dc.html` · `3D-GAMES/g/fox-gelato/Main.dc.html`
3. SPORT: Surf Contest — `3D-GAMES/Jidda Surf.dc.html`
4. SPECIALTY SHOP: Jib's Surf Shop — `3D-GAMES/g/jibs-surf-shop/Main.dc.html`
5. Ocean World Dolphin Trainer — `3D-GAMES/g/ocean-world-aquarium/Main.dc.html`
6. Swim Trials — `3D-GAMES/Jidda Swim.dc.html`
7. Deep Dive — `3D-GAMES/Jidda Deep Dive.dc.html`
8. Submarine — `3D-GAMES/Jidda Submarine.dc.html`
9. Jetski Run — `3D-GAMES/Jidda Jetski.dc.html`
10. Inner Tube Run — `3D-GAMES/Jidda Inner Tube.dc.html`
11. Volleyball on the beach — `3D-GAMES/g/volleyball/Volleyball.dc.html`

12. Farm Island (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/jidda.layout.json, s348)
- Cornhole + Washers (+ the 2D LONG BOARD) → TAVERN (jiddaTavern) on Town Island, Harbour Row North; boards out on the beach deck too
- Foxy Blends Smoothies (NOW HIRING) + FOX Gelato cart → jiddaSmoothie, Harbour Row North east
- Surf Contest → SURF CONTEST STANDS (jiddaSurfContest) on the Surf beach island (east)
- Jib's Surf Shop → jiddaSurfShop, Harbour Row (the SURFBOARD)
- Ocean World Dolphin Trainer → OCEAN WORLD (jiddaOceanWorld) on its own isle NE (pier from the surf beach)
- Swim Trials → spot jiddaSwim · Inner Tube Run → spot jiddaInnerTube (surf beach)
- Deep Dive → buoy jiddaDeepDive off Ocean World · Submarine → dock jiddaSubmarine at Ocean World
- Jetski Run → start jiddaJetskiRun at the MARINA; the course loops the OPEN SEA
- Volleyball → court jiddaVolleyball on the surf beach
- Farm → FARM ISLAND (jiddaFarm, south); 2D WHACK A MOLE spot jiddaMole
- Sailing regatta (DRAFT) → buoys round the open sea (spot jiddaRegatta)

## NOT BUILT YET (ideas for later, after the list above)
- Water taxi pilot → board jiddaWaterTaxi at the ferry quay (+ the Marina)
- Fish market auction → jiddaFishMarket on the ferry quay
- Lighthouse keeper → the LIGHTHOUSE (jiddaLighthouse) on the castle headland
- Skimmer

## SPECIAL VEHICLES
- Jet Ski — `3D-GAMES/Vehicle Workshop.dc.html?v=jetski` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot jiddaJetSki at JIDDA MARINA (the Jidda car rental) on the surf beach.
- SPEEDBOAT (Ben s348) — `3D-GAMES/Vehicle Workshop.dc.html?v=speedboat` (DRAFT: add the model to vehicle-kit if it is not there): spot jiddaSpeedboat at the Marina. Fast, carries 4, crosses the open sea.
- GONDOLA (DRAFT, ?v=gondola): spot jiddaGondola on the Grand Canal; a gondolier rows you through the canals.
- SAILBOAT (DRAFT) — `?v=sail`: spot jiddaSailboat at the Marina: wind + sail trim, for the regatta.
- Surfboard — `3D-GAMES/Vehicle Workshop.dc.html?v=surf` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot jiddaSurfboard at Jib's Surf Shop.
- Giant Turtle — `3D-GAMES/Vehicle Workshop.dc.html?v=turtle` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot jiddaTurtle on the Farm Island beach.
- WATER VEHICLES RIDE ON THE SEA: the whole map is water round the islands (layout "islands" = land); keep the open ring clear of props so sailing + jetski have room.
- Royal helicopter — jiddaRoyalHelipad west of the castle (Meru 2 recipe: worlds/meru2-royalpad.js); flies to jiddaInfirmaryHelipad (medevac + sea rescue) + jiddaSurfHelipad.
- Royal teleport pad — jiddaRoyalTelepad beside it → the Jidda Space Dock (jiddaSpacedock, SE isle).

## STAYS IN THE MAIN PROJECT
Avatars, story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
