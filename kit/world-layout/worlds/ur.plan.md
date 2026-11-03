# UR — WORLD PLAN (the old college and the zoo)
From WORLD_GAMES_PLAN.md (main project, s345). Repo = GitHub BlindbenFILMS/3D-foxgate8. Build each game IN THE WORLD with IN_WORLD_GAMES.md (the Meru Claw Crane recipe).

## PHASE 1 · LAYOUT (Map Workshop)
Every building below needs its place on the map (a building with "games": [page path], or a spot kind "game"). Plus the EVERY WORLD HAS list (PARALLEL_WORLDS.md section 7).

## PHASE 2 · EXTERIORS (then Ben walks it)
Every building: own shape + roof in this world's look, a BIG ROOF SIGN + a DOOR SIGN at eye level beside the door, walk-in doors like Meru 2 (PARALLEL_WORLDS.md section 9).

## PHASE 3 · INTERIORS, one by one, DELUXE (Ben walks each)
REUSE the room each game / job below already has in the repo (its shop, kitchen, hall, court, cabinet), fitted into its building, so phase 4 plays right there. MOBILE FIRST: 390x844 + 844x390 every time.

## PHASE 4 · JOBS + GAMES IN THE WORLD, in this order (one per pass, Ben tests each on the phone)
1. TAVERN GAME: Cribbage in the college pub — `3D-GAMES/g/cribbage/cribbage.dc.html`
2. RESTAURANT: Ur Espresso + Ur Grounds — `3D-GAMES/g/ur-espresso/Main.dc.html` · `3D-GAMES/g/ur-grounds/Main.dc.html`
3. SPORT: Track and Field + Cricket Nets — `3D-GAMES/g/track-and-field/TrackField.dc.html` · `3D-GAMES/Cricket Nets.dc.html`
4. SPECIALTY SHOP: Ur Laboratory — `3D-GAMES/g/ur-lab/Main.dc.html`
5. Hessa's Menagerie, THE ZOO (MOVED FROM LUXOR, Ben s348) — `3D-GAMES/g/luxor-zoo/Main.dc.html`: the Zoo Path (urZooPath, was luxorZooPath): ten cages (LION, WOLF, BOAR, BEAR, RAM, CROC, STAG, APE, PANTHER, SERPENT), keeper hut, feed cart, Hessa. Fits the lab story (SAVE the ANIMALS).
6. Electrician Job — `3D-GAMES/g/electrician-job/ElectricianJob.dc.html`

7. Barley & Date Farm (farm job) — `3D-GAMES/g/fox-farm/Main.dc.html`

## WHERE EACH ONE LIVES ON THE MAP (layout/ur.layout.json, s348)
- Cribbage (+ the 2D skee ball lane + THE MACHINE token slot) → THE COLLEGE PUB (urTavern), north side of the square
- Ur Espresso → urCoffee, south side of the square (NOW HIRING) · Ur Grounds roastery → urGrounds on Crest Street north
- Track and Field → COLLEGE STADIUM (urStadium) on College Walk · Cricket Nets → urCricket next to it
- Ur Laboratory → urLab at the end of the Lab Path (picket line out front; Lab Vault inside)
- Hessa's Menagerie (THE ZOO, from Luxor) → urZoo at the west end of the Zoo Path; the ten cages line the path
- Electrician Job → POWER HOUSE (urPowerHouse) on College Walk
- Farm → urFarm by the Clean Lake
- Skimmer cleanup (2D) → spot urSkimmer on the Toxic Lake

## NOT BUILT YET (ideas for later, after the list above)
- Tablet scribe → board urScribe at The Tablet (news)
- Brick kiln → board urKiln by the Kiln Brigade
- College archivist → board urArchivist at the College
- Glyph Lock → spot urGlyphLock in the College

## SPECIAL VEHICLES
- Hoverboard — `3D-GAMES/Vehicle Workshop.dc.html?v=hover` (models in engine/vehicle-kit.js + engine/vehicle-fun.js): a spot kind "vehicle" where you get it; ride it on the map's roads / open ground Spot urHoverboard at HOVER HIRE (the Ur car rental), Zoo Path.
- Royal helicopter — urRoyalHelipad west of the palace (Meru 2 recipe: worlds/meru2-royalpad.js); flies to urInfirmaryHelipad (medevac) + urStadiumHelipad.
- Royal teleport pad — urRoyalTelepad beside it → the Ur Space Dock (urSpacedock, south-west).

## MOVED OUT (Ben, s348)
- The PYRAMID (Pyramid Path + Pyramid Entry, First Chamber, Gate Hall, Second Chamber), the Ur Pyramid Dig and the Wrecking Crane → LUXOR. Ur now has its own battles (Gauntlet, Beast Run, Specimen One at Hunters Pond, the Toxic Works) + a DRAFT cave (THE REED CAVES).

## STAYS IN THE MAIN PROJECT
Avatars, story, quests, dialogue, the real save, enemies + battles. Use stand-ins (the test fox, box keepers) and mark lines DRAFT.
