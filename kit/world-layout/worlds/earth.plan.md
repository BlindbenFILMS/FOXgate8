# EARTH — WORLD PLAN (modern-day Earth, the city of lights, Ben s348)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Table shuffleboard — `3D-GAMES/Shuffleboard.dc.html`
2. RESTAURANT: Breakfast All Day Diner — `3D-GAMES/g/breakfast-all-day-diner/Phone-Portrait.dc.html`
3. SPORT: Speedway race + Fox Baseball — `(other repo FOXgate8) 3D/minigames3d/speedway.html` · `3D-GAMES/g/fox-baseball/Main.dc.html`
4. SPECIALTY SHOP: Fox Cinema (+ the snack counter job) — `3D-GAMES/Fox Cinema.dc.html`
5. Airport TSA — `3D-GAMES/g/airport-tsa/Main.dc.html`
6. Car Wash — `3D-GAMES/g/car-wash/Main.dc.html`
7. Boardwalk arcade: Fox Blaster — `3D-GAMES/g/fox-blaster/Main.dc.html`
8. Skee-ball — `3D-GAMES/g/skee-ball-phone-preview/Main.dc.html`
9. Coin pusher — `3D-GAMES/Arcade Coin Pusher.dc.html`
10. Love tester — `3D-GAMES/g/8-gates-love-tester/love-tester.html`
11. Dance machine — `3D-GAMES/g/fox-arcade/index.html`
12. Bumper Cars — `3D-GAMES/g/bumper-cars/BumperCars.dc.html`
13. Funhouse Dash — `3D-GAMES/g/funhouse-dash/Main.dc.html`

14. Mojave Date Farm (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/earth.layout.json, s348)
- Table shuffleboard → THE LUCKY PUCK bar (earthTavern) on the Strip, south
- Breakfast All Day Diner → earthDiner on The Mojave highway
- Speedway race → EIGHT MILE SPEEDWAY (earthRaceway) at the end of Speedway Road (west) · Fox Baseball → FOX FIELD (earthBallpark) on Ballpark Road
- Fox Cinema + snack counter → earthCinema on the Strip, south
- Airport TSA → DESERT AIR TERMINAL (earthAirport) on The Mojave
- Car Wash → earthCarWash on The Mojave
- Boardwalk arcade (Fox Blaster, Skee-ball, Coin pusher, Dance machine) → NEON BOARDWALK ARCADE (earthArcade) on the Boardwalk pier (east, Lake Mead)
- Love tester → outside WED IN A WINK (earthChapel) on the Strip
- Bumper Cars → earthBumper on the Boardwalk · Funhouse Dash → earthFunhouse on the Boardwalk
- Casino vision games (roulette, cards, dice, slots) → BIG WIN (earthCasino) + THE PYRAMID (earthPyramid); Housekeeping shift (2D) on Pyramid Floors 1-2
- Date farm → earthFarm on The Mojave

## NOT BUILT YET (ideas for later, after the list above)
- Casino dealer → board earthDealer at Big Win
- Valet parking → stand earthValet outside Big Win (and Strip Car Rental)
- Film lot stunt double → DESERT FILM LOT (earthStudio) off Fremont

## SPECIAL VEHICLES
- Racecar — `3D-GAMES/Vehicle Workshop.dc.html?v=racecar` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot earthRacecar in the Speedway paddock.
- Shopping Cart — `3D-GAMES/Vehicle Workshop.dc.html?v=cart` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot earthShoppingCart outside Open 24/7.
- Bumper Car — `3D-GAMES/Vehicle Workshop.dc.html?v=bumper` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot earthBumperCar at the Bumper Cars.
- Mayor's helicopter — earthRoyalHelipad on the City Hall plaza (Meru 2 recipe: worlds/meru2-royalpad.js); flies to earthHospitalHelipad + earthAirportHelipad.
- City Hall teleport pad — earthRoyalTelepad → Earth's own transport (NO space dock on Earth).
- Car rental — STRIP CAR RENTAL (earthCarRental) on Flamingo Road.

## STAYS IN THE MAIN PROJECT
Avatars, story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
