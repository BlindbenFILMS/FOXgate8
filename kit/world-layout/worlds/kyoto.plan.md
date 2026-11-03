# KYOTO — WORLD PLAN (old samurai-age Japan in cherry blossom season, Ben s348)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Liar's Dice in the sake house — `3D-GAMES/g/liars-dice/liars-dice.dc.html`
2. RESTAURANT: Foxy Maki + Foxy Gyoza — `3D-GAMES/g/foxy-maki/Main.dc.html` · `3D-GAMES/g/foxy-gyoza/Foxy Gyoza.dc.html`
3. SPORT: Sumo Streak + Sword Duel — `3D-GAMES/Kyoto Sumo Hall.dc.html` · `3D-GAMES/Kyoto Sword Duel.dc.html`
4. SPECIALTY SHOP: Tea ceremony house — NOT BUILT YET
5. Archery on the Mountain Road — `3D-GAMES/g/8-gates-archery/Archery.dc.html`
6. Go Club — `3D-GAMES/g/go-club/go-club.dc.html`
7. Fox Gate Pachinko parlour — `3D-GAMES/g/fox-gate-pachinko/Main.dc.html`
8. Capsule Corner — `3D-GAMES/Capsule Corner.dc.html`
9. Kyoto Theatre (The Fox Wife) — `3D-GAMES/Kyoto Theatre.dc.html`

10. Rice Terraces (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/kyoto.layout.json, s348)
- Liar's Dice (+ 2D tea, geisha dance, go, ping-pong, darts) → TEAHOUSE (kyotoTeahouse), Lantern Street north, west of the square
- Foxy Maki (sushi ring bar, NOW HIRING) → kyotoMerchant, Lantern Street south · Foxy Gyoza → kyotoGyoza next door
- Sumo Streak → THE DOHYO (kyotoSumo) at the end of the Sumo Approach (west)
- Sword Duel (kendo) → SAMURAI BARRACKS yard (kyotoBarracks) on the Castle Approach
- Archery → spot kyotoArchery on the cherry-pink Mountain Road (east)
- Go Club → kyotoGoClub on Garden Row · Go board also in the square (spot kyotoGoBoard)
- Fox Gate Pachinko → kyotoPachinko, Lantern Street north, west end
- Capsule Corner → kyotoCapsule on Temple Row
- Kyoto Theatre (The Fox Wife) → kyotoTheatre, Lantern Street north, east end
- Tea Ceremony House (specialty, NOT BUILT YET) → kyotoTeaCeremony on Garden Row
- Rice Terraces → kyotoFarm off Shrine Street south
- The Kitsune Wood + Kitsune Beach (2D earthKitsune) → south of town down the Kitsune Lantern Path; spot kyotoKitsune = the wedding clearing (story scene in the main project)

## NOT BUILT YET (ideas for later, after the list above)
- Tea ceremony → kyotoTeaCeremony (the specialty shop)
- Noh Stage → spot kyotoNohStage beside the Theatre

## SPECIAL VEHICLES
- Dragon Hatchling — `3D-GAMES/Vehicle Workshop.dc.html?v=dragon` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot kyotoDragon behind the RICKSHAW STAND (the Kyoto car rental) on the Sumo Approach.
- Royal helicopter — kyotoRoyalHelipad west of Kyoto Castle (Meru 2 recipe: worlds/meru2-royalpad.js); flies to kyotoInfirmaryHelipad (medevac) + kyotoSumoHelipad.
- Royal teleport pad — kyotoRoyalTelepad beside it (ringed by little torii) → the Kyoto Space Dock (kyotoSpacedock, south by The Wood).

## STAYS IN THE MAIN PROJECT
Avatars (SAMURAI + SUMO avatars come at the MERGE, Ben s348), story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
