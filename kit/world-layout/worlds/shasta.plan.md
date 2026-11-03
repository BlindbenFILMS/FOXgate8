# SHASTA — WORLD PLAN (the snow world with mountains; was the Home planet, Ben s348)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Air hockey — `3D-GAMES/g/tavern-games/HockeyMain.dc.html`
2. RESTAURANT: Foxy Cakes — `3D-GAMES/g/foxy-cakes/Main.dc.html`
3. SPORT: The Iron Cup (ice hockey) + Curling — `3D-GAMES/Home Hockey.dc.html` · `3D-GAMES/g/curling-club/Main.dc.html`
4. SPECIALTY SHOP: Bramble's Comics — `3D-GAMES/Comic Shop.dc.html`
5. Bram's Ski Works — `3D-GAMES/g/bram-ski-works/Main.dc.html`
6. Clubhouse 8 · The Counter — `3D-GAMES/g/clubhouse-8/Main.dc.html`
7. Toy Workshop — `3D-GAMES/g/toy-workshop/Main.dc.html`
8. Chess Club — `3D-GAMES/g/chess-club/chess-club.dc.html`
9. Checkers Club — `3D-GAMES/g/checkers-club/checkers-club.dc.html`
10. Playground — `3D-GAMES/g/playground/Playground.dc.html`

11. Snowberry Farm (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/shasta.layout.json, s348)
- Air hockey → TAVERN (shastaTavern), North Avenue west side
- Foxy Cakes → shastaCakes, Lodge Road south side (NOW HIRING)
- The Iron Cup (ice hockey) → THE RINK (shastaRink), West Avenue · Curling → CURLING CLUB (shastaCurling) opposite
- Bramble's Comics → shastaComics, North Avenue east side
- Bram's Ski Works → shastaSkiWorks at the SKI LODGE (east end of Lodge Road)
- Clubhouse 8 · The Counter → shastaClub8, the big arcade lodge on the square
- Toy Workshop → shastaToyWorkshop, South Avenue west side
- Chess Club → shastaChess · Checkers Club → shastaCheckers, South Avenue east side
- Playground → spot shastaPlayground off West Avenue
- Snowberry Farm → shastaFarm on the lake's east shore
- Sal's Pizza Place (2D oven game + deliveries, NOT BUILT YET in 3D) → shastaPizza, North Avenue east side
- Drone range (2D Lake 8 Range) → spot shastaDroneRange on Shasta Lake
- Slalom runs → up the CHAIR LIFT (spot shastaChairLift) on Mount Shasta

## NOT BUILT YET (ideas for later, after the list above)
- Paper route → board shastaPaperRoute at The Shasta Snowpost
- Pizza delivery runs → board shastaPizzaRuns outside the Pizza Place

## SPECIAL VEHICLES
- Rocket Skates — `3D-GAMES/Vehicle Workshop.dc.html?v=rskates` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot shastaRocketSkates at Sled & Skate Hire (the car rental).
- Hamster Ball — `3D-GAMES/Vehicle Workshop.dc.html?v=hamster` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot shastaHamsterBall at the playground.
- Pogo Stick — `3D-GAMES/Vehicle Workshop.dc.html?v=pogo` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot shastaPogo outside the Toy Workshop.
- Space Hopper — `3D-GAMES/Vehicle Workshop.dc.html?v=hopper` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot shastaHopper at the playground.
- Royal helicopter — shastaRoyalHelipad EAST of the castle (Meru 2 recipe: worlds/meru2-royalpad.js); flies to shastaInfirmaryHelipad (medevac + mountain rescue) + shastaLodgeHelipad (heli-ski).
- Royal teleport pad — shastaRoyalTelepad beside it → the Shasta Space Dock (shastaSpacedock, south-west by the lake).
- Chair lift — from the Ski Lodge up Mount Shasta (spot shastaChairLift).

## STAYS IN THE MAIN PROJECT
Avatars, story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
