# ZION — WORLD PLAN (the wild west gold town)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Dusty Gulch cabinet in the saloon — `3D-GAMES/g/dusty-gulch/index.html`
2. RESTAURANT: Zion bakery — NOT BUILT YET
3. SPORT: Foxtruck Crush + Mechanical Bull — `3D-GAMES/Zion Monster Arena.dc.html` · `3D-GAMES/g/zion-mechanical-bull/Main.dc.html`
4. SPECIALTY SHOP: Goldsmith of Zion — `3D-GAMES/g/goldsmith-of-zion/Main.dc.html`
5. Bex's Truck Shop — `3D-GAMES/g/bex-truck-shop/Main.dc.html`
6. Zion Gold Rush — `3D-GAMES/g/gold-rush/Main.dc.html`
7. Fox Hoops — `3D-GAMES/g/fox-hoops-a28312/index.html`
8. Gold panning — `(other repo FOXgate8) 3D/minigames3d/gold.html`

9. Fox Ranch (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/zion.layout.json, s348)
- Dusty Gulch cabinet + Fox Hoops cage → SALOON (zionTavern), Main Street north, west of the square
- Bakery job → BAKERY (zionBakery), Main Street north (NOW HIRING sign inside)
- Foxtruck Crush → MONSTER ARENA (zionMonsterArena), up Crest Rise off the Truck Road
- Mechanical Bull → THE BULL BARN (zionBullBarn), Truck Road south side
- Goldsmith → GOLDSMITH OF ZION (zionGoldsmith), Main Street north, east end
- Bex's Truck Shop → zionTruckshop, Truck Road north side
- Zion Gold Rush → SURVAY OFFICE (zionSurvay), Gold River north bank
- Gold panning → 3 spots on the river: zionNorthBar, zionMiddleReach, zionDeepBend (the Deep Bend = the oiled-pan quest)
- Fox Ranch → zionFoxFarm by the river
- Pinball Parlour (7 tables) → zionPinball, Main Street north (2D room, no repo game yet)

## NOT BUILT YET (ideas for later, after the list above) — spots are on the map
- Monster truck pit crew → board zionPitCrew outside the Truck Shop
- Stagecoach / mail run → board zionMailRun outside the Galactic Post
- Horseshoes → pit zionHorseshoes at the Fox Ranch

## SPECIAL VEHICLES
- Monster Truck — `3D-GAMES/Vehicle Workshop.dc.html?v=truck` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): spot zionMonsterTruck in the TRUCK STAGING YARD (east end of the Truck Road). Drive it on the roads, open ground, and the TRUCK-ONLY legs of the Hill Run up to the gang yard (the layout "roads" entry).
- Royal helicopter — ROYAL HELIPAD zionRoyalHelipad west of the castle (Meru 2 recipe: worlds/meru2-royalpad.js in the main project); flies to the other pads: zionInfirmaryHelipad (medevac), zionArenaHelipad.
- Royal teleport pad — zionRoyalTelepad beside the helipad → the Zion Space Dock (zionSpacedock, south of the river); arriving by telepad beams you in here.
- Car rental — DUSTY WHEELS (zionWagonHire, Crest Street north): buggies, a pickup, a stagecoach (DRAFT).
- Battle vehicles stay in the battle maps (Blackout: bike, walker, tank).

## STAYS IN THE MAIN PROJECT
Avatars, story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
