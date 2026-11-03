# LUXOR — WORLD PLAN (the volcano, the ring and the pyramid)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Foosball — `3D-GAMES/g/tavern-games/FoosMain.dc.html`
2. RESTAURANT: Foxy Deli — `3D-GAMES/Luxor Deli.dc.html`
3. SPORT: Foxy Boxing — `3D-GAMES/Luxor Boxing.dc.html`
4. SPECIALTY SHOP: Lava Glass Works (DRAFT, NOT BUILT YET; the zoo moved to Ur, Ben s348)
5. Luxor Bike Shop — `3D-GAMES/g/luxor-bike-shop/Main.dc.html`
6. Moto School + Volcano Run — `3D-GAMES/Luxor Moto.dc.html`
7. Basketball — `3D-GAMES/g/basketball/Main.dc.html`
8. Dodgeball — `3D-GAMES/g/dodgeball/Dodgeball.dc.html`
9. Pyramid Dig (MOVED FROM UR) — `3D-GAMES/g/ur-dig/Main.dc.html`
10. Ash Farm (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/luxor.layout.json, s348)
- Foosball (+ the 2D pool table) → TAVERN (luxorTavern), west avenue north side
- Foxy Deli → luxorDeli, west avenue (NOW HIRING)
- Foxy Boxing → FIGHTING PIT (luxorFightingPit) at the end of Pit Road; Boxing Gym (luxorBoxingGym) on Pit Road
- Lava Glass Works → luxorGlassWorks, east avenue south side
- Luxor Bike Shop (also the car rental: rent a motorcycle) → luxorBikeShop, east avenue north side
- Moto School + Volcano Run → spot luxorMotoSchool at the pits on the Volcano Plains; the track is the Volcano Run road loop (lava jump)
- Basketball + Dodgeball → THE CINDER COURT (luxorCinderCourt), Pit Road south side
- Pyramid Dig → spot luxorPyramidDig beside the pyramid (west end of the Pyramid Path)
- Ash Farm → luxorAshFarm on the Volcano Road

## NOT BUILT YET (ideas for later, after the list above)
- Bike pit crew → board luxorPitCrew at the Volcano Run pits
- Basalt forge / blacksmith → board luxorForge by the Armory

## SPECIAL VEHICLES
- Motorcycle — `3D-GAMES/Vehicle Workshop.dc.html?v=moto` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground. Spot luxorMoto at the Volcano Run pits; rent at the Bike Shop.
- Robot Spider — `3D-GAMES/Vehicle Workshop.dc.html?v=spider` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot luxorSpider on the ash fields (climbs the volcano).
- Wrecking Crane (MOVED FROM UR) — `3D-GAMES/Vehicle Workshop.dc.html?v=crane`: spot luxorCrane at the Pyramid Dig.
- Royal helicopter — luxorRoyalHelipad west of the keep (Meru 2 recipe: worlds/meru2-royalpad.js); flies to luxorInfirmaryHelipad + luxorPitHelipad.
- Royal teleport pad — luxorRoyalTelepad beside it → the Ember Dock (luxorSpacedock, north of Pit Road).

## STAYS IN THE MAIN PROJECT
Avatars, story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
