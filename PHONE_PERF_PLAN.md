# PHONE PERFORMANCE PLAN (Meru 2) — for a NEW CHAT

**Start the new chat with:** "continue PHONE_PERF_PLAN.md"

Work in this order. Each step must leave Meru 2 working, with the same look up close. Before step 1, copy the files listed for each step to `backup/phone-perf/`. Measure after every step with `Meru 2 Blockout.dc.html?phone=1`, walk mode, at the 11 points in the table below. Write the new numbers into this file.

## Budget (per frame, phones)
- Draw calls: under **500** (most phones smooth), hard ceiling 700.
- Triangles: under **500k**.
- Pixel ratio: already 1.25 on phones.

## Where we are (phone mode, walk camera, session 30)
| Area | Draws | Tris | Over? |
|---|---|---|---|
| Fountain (0, 20) | 483 | 1.24M | tris |
| Market (-100, 0) | 498 | 1.19M | tris |
| Lanes Court (100, 0) | 734 | 1.28M | both |
| Civic Row (0, -60) | 477 | 1.33M | tris |
| Castle Path (0, -250) | 338 | 478k | ok |
| Lake Path (0, 190) | 319 | 445k | ok |
| Ruins Path (-300, 0) | 364 | 251k | ok |
| Arena Path (250, 0) | 562 | 713k | both |
| Arena gate (372, 0) | 361 | 567k | tris |
| Meru Lanes inside (130, -10) | 721 | 723k | both |
| Casino inside (-127, 0) | 460 | 805k | tris |

### After session 32 (player merged, bowlers hidden from the street, phone grass 2-segment) — ALL ROWS IN BUDGET
| Area | Draws | Tris | Was (31b) |
|---|---|---|---|
| Fountain | 202 | 455k | 416 / 555k |
| Market | 343 | 499k | 494 / 578k |
| Lanes Court | 342 | 594k | 469 / 656k |
| Civic Row | 319 | 534k | 472 / 604k |
| Castle Path | 183 | 267k | 330 / 263k |
| Lake Path | 167 | 247k | 319 / 226k |
| Ruins Path | 165 | 182k | 317 / 182k |
| Arena Path | 296 | 479k | 469 / 486k |
| Arena gate | 177 | 409k | 325 / 396k |
| Meru Lanes inside | 326 | 433k | 519 / 416k |
| Casino inside | 213 | 347k | 459 / 347k |
**Session 32b (Arena Path fix):** Arena Path was really ~640 draws (the 296 readings were a fluke). The cause: the rides (carousel horses, poles, helicopter) move, so the static batch skipped them (~365 festival draws). `worlds/meru2-blockout.js` batchTick now also merges meshes that ride a moving group: per moving group + material, in the group's own space, together with their ink shells (a mesh and its shells merge together or not at all). Plain toon colours (no texture, no emissive) are baked into vertex colours, so each horse is ~2 draws. Backup `backup/phone-perf/meru2-blockout-s32.js`.
Full run after 32b: Fountain 240 / 472k · Market 214 / 476k · Lanes Court 344 / 593k · Civic 317 / 523k · Castle Path 184 / 267k · Lake Path 168 / 235k · Ruins Path 131 / 185k · **Arena Path 298 / 479k** · Arena gate 155 / 395k · Meru Lanes inside 277 / 416k · Casino inside 210 / 344k.
**Session 32c (other camera modes, phone):** night run: every row within 15 draws / 50k of the day run (max Market 370 / 517k). Fly View whole map 392 / 438k. Helicopter flight over the arena, lake, Market and the city: max 467 draws, ~605k tris (over the arena from the east, borderline; fine). Fox Workshop: `Fox Workshop.dc.html?foxmerge=1` shows the merged fox, for the side-by-side check before turning merge on in other worlds.

**Session 32d:** merged foxes are ON in Meru Town Square (`meru-game.js`, 74 of 76 foxes merged; Hope + Noble stay full), Meru Arena (`meru-arena.js`) and the Space Dock (`meru-spacedock.js`). `?foxmerge=0` on any of them turns it off to compare. Backups `backup/phone-perf/meru-game-s32.js`, `meru-arena-s32.js`, `meru-spacedock-s32.js`. **Next:** (3) Optional: split the whole-map blockout meshes (#56 28k, #21 18k) and the kerbs into 40 m cells so they cull.

**Ben to check (32b):** the carousel turns and the horses bob with their colours and outlines; the helicopter flies and lands; nothing on the rides is missing or frozen.

### Session 32 changes
- **The player was ~200 draws on every frame** (cast foxes were never merged). `fox-kit.js`: the merge now runs for `player` too (no rig reads its raw parts); only Hope and Noble stay unmerged. Player draws ~200 → ~50. The player keeps the full-detail head (head LOD still skips the cast). Fox swap to Hope / Noble still gives the unmerged fox.
- `worlds/meru2-funrooms.js`: the bowlers' frame `T` (Dash, Piper, their loose pins, ~100 draws / 45k) is hidden while the camera is outside the Meru Lanes footprint (x 103..152, z -40..12). The café, carpet and arcade seen through the street windows stay.
- **Grass was ~190k triangles on every phone frame** and the old probe missed it (it is `InstancedBufferGeometry`: count `geometry.instanceCount`, plus `drawRange` and groups, or the probe under-counts). `worlds/meru2-nature.js`: blades have 2 segments on phones (was 3), far layer 2,600 clumps of 4 (was 3,000 of 5). ~190k → ~110k.
- Backups: `backup/phone-perf/fox-kit-s32.js`, `meru2-funrooms-s32.js`, `meru2-nature-s32.js`.
- **Ben to check:** the player close up (sword glow, gun tip, x-ray silhouette behind walls, Fox Swap), Meru Lanes bowlers still bowling when you walk in, grass look on the iPhone.
- Not needed any more for the budget (left for later): step 1 far boxes, splitting the whole-map blockout meshes `#56` (28k) / `#21` (18k) and the 1,160-instance kerbs into cells so they cull.

### After session 31b (fox head LOD, flower LOD, small-plant draw radius, trim LOD 45 m, tree near 32 m, coarser hills)
| Area | Draws | Tris |
|---|---|---|
| Fountain | 416 | 555k |
| Market | 494 | 578k |
| Lanes Court | 469 | 656k |
| Civic Row | 472 | 604k |
| Castle Path | 330 | 263k |
| Lake Path | 319 | 226k |
| Ruins Path | 317 | 182k |
| Arena Path | 469 | 486k |
| Arena gate | 325 | 396k |
| Meru Lanes inside | 519 | 416k |
| Casino inside | 459 | 347k |
**Left over budget:** Lanes Court tris (656k), Civic Row tris (604k, borderline), Meru Lanes inside draws (519).

### After session 31 (steps 1-3 first pass: tree LOD, trims, fewer extras, merged foxes)
| Area | Draws | Tris | Was (s30) |
|---|---|---|---|
| Fountain | 425 | 658k | 483 / 1.24M |
| Market | 496 | 690k | 498 / 1.19M |
| Lanes Court | 464 | 774k | 734 / 1.28M |
| Civic Row | 476 | 771k | 477 / 1.33M |
| Castle Path | 341 | 293k | 338 / 478k |
| Lake Path | 327 | 297k | 319 / 445k |
| Ruins Path | 317 | 202k | 364 / 251k |
| Arena Path | 473 | 522k | 562 / 713k |
| Arena gate | 318 | 426k | 361 / 567k |
| Meru Lanes inside | 522 | 477k | 721 / 723k |
| Casino inside | 461 | 395k | 460 / 805k |
(Numbers move ±100k between runs; use a 3 s settle.) **Draws:** all under 500 except Meru Lanes inside (522). **Tris:** the four plaza areas are still 650-780k.
Note: `renderer.info` shows ~190k more triangles than a frustum count of the scene at Lanes Court (771k vs 580k). **Solved (31b):** not shadows (shadow map is off on phones, same count with it disabled). The gap is the long tail of small meshes plus instanced meshes whose bounding sphere covers the whole map (flowers, shrubs, trims): they are never frustum-culled. Probe that counts real draws: wrap `renderer.renderBufferDirect` for one `renderer.render(scene, camera)` call and sum per object (always restore it in a `finally`).

### Session 31b changes
- `fox-kit.js`: merged non-cast foxes on phones get a lighter head (skull 26×20 instead of 40×30, face mask 26×22 instead of 40×32, nose bridge 12×9). About 3k fewer triangles per fox.
- `worlds/meru2-flora.js`: flower clusters have 3 heads on phones (was 6), with 3-sided stems. Shrubs, tufts, flowers and reeds are only drawn within 55 m on phones (`SMALL_NEAR`, re-packed when the camera moves 4 m). Trees switch to the low version past 32 m on phones (`TREE_NEAR`).
- `worlds/meru2-city.js`: phone trim LOD 45 m.
- `worlds/meru2-heights.js`: hill terrain step 2.5 → 3.6 m on phones (check that trails and platforms still sit on the ground).
- Biggest single items left at Lanes Court: the whole-map blockout mesh (#7, 46k, never culled), foxes 79k, Meru Lanes interior seen through the glass 39k, near trees 25k.
- **Next:** step 1 far boxes (draws), then a Lanes Court pass (hide Meru Lanes interior detail beyond the glass when the player is outside).

### (first pass of step 1 only)
| Area | Draws | Tris | Was |
|---|---|---|---|
| Fountain | 424 | 660k | 1.24M |
| Market | 379 | 664k | 1.19M |
| Lanes Court | 734 | 787k | 1.28M |
| Civic Row | 476-591 | 700-800k | 1.33M |
| Castle Path | 342 | 298k | 478k |
| Lake Path | 324 | 289k | 445k |
| Ruins Path | 396 | 202k | 251k |
| Arena Path | 566 | 543k | 713k |
| Arena gate | 361 | 427k | 567k |
| Meru Lanes inside | 732 | 518k | 723k |
| Casino inside | 460 | 394k | 805k |
(Numbers move ±100k between runs because the 2.2 s settle is short; Civic Row is the noisiest.)

Measuring snippet (paste in the console of the preview, walk mode running):
`(async()=>{const p=__m2page,R=__meru2.K.renderer,o={};for(const [k,x,z,y] of [['fountain',0,20,0],['market',-100,0,-1.57],['lanesCourt',100,0,1.57],['civic',0,-60,3.14],['castlePath',0,-250,3.14],['lakePath',0,190,0],['ruinsPath',-300,0,-1.57],['arenaPath',250,0,1.57],['arenaGate',372,0,1.57],['lanesInside',130,-10,1.57],['casinoInside',-127,0,-1.57]]){p.walker.tp(x,z,0,y);await new Promise(r=>setTimeout(r,2200));o[k]=[R.info.render.calls,Math.round(R.info.render.triangles/1000)+'k']}console.log(JSON.stringify(o))})()`

## Already in place (don't redo)
- **Fox cull:** fox rigs are hidden past 40 m on phones. The outline shells are skipped past 14 m (FOX INK LOD). Code is in `worlds/meru2-blockout.js` foxCull.
- **Prop cull:** groups under 44 m across are skipped past 110 m, using camera layers and local-space centres (propCull).
- **Static batch:** festival, path and hill meshes are merged per material per 40 m cell, 4 s into the walk (batchTick).
- **Minigame sleep:** the town stops drawing while a game panel is open.
- **Pinballs:** the light version is in `worlds/pinball-lite.js`.

---

## STEP 2 RESULTS (session 31) — DONE
Phones only (`touch` / `matchMedia('(pointer: coarse)')`), extras are never built: Meru Lanes 1 cabinet player (was 2) + the pinball player, 1 dancer (was 2); background walkers 2 (was 4); carousel crowd 3 of 6; plaza chess watcher cut; stage band = vocals/guitar + drums (bass + keys cut, their instruments stay). Every named NPC, keeper, bowler and barker stays. Backups in `backup/phone-perf/`.

## STEP 3 RESULTS (session 31) — FIRST PASS DONE (needs Ben's eye check)
`fox-kit.js` `mergeFoxParts(g, P)`: at the end of `makeFox`, every static mesh is baked (vertex colours, one toon material per emissive colour) into one mesh per moving part; each part's ink shells become one BackSide `outlineMat` mesh (so FOX INK LOD / `inkList` still works). Kept as they were: everything in `P` (body, head, arms, legs, ears, tail, snout, bridge, nose, shine, sword, gun, wheels), the face mask (canvas), the crest medallions, glow/blade/tip materials, sprites, hidden meshes.
- Flag: `foxKit({ ..., merge: true })` (Meru 2 only, set in `worlds/meru2-walk.js`; `?foxmerge=0` turns it off to compare) or per fox `makeFox({ merged })`.
- Never merged: the cast (`player`, `hope`, `noble`: cane/chair rigs read the raw parts) and any `chair` fox.
- Result: Meru 2 fox meshes 12,547 → 4,001 (~127 → ~40 per fox). Triangles unchanged.
- Still to do: side-by-side check in Fox Workshop, then turn on in other worlds. Phone triangle LOD for fox heads (skull 40×30, mask 40×32 spheres) not done.

## STEP 1 RESULTS (session 31)
**Where the city triangles really were (city root, phone, 581k total):** 1) trees (flora-trees, ~2,000 tris per broad/lime tree) 119k+ · 2) park shrubs (4 detail-1 blobs = 320 tris each × 300) 96k · 3) window boxes + shutters (instanced trims, 284 + 240 tris each) ~90k · 4) stone/brick window trims 62k + 52k · 5) fins 40k. **Facade walls are only ~13k** — so the far-box idea below saves draws, not triangles; it is NOT done yet.
The triangle counter also counted hidden trims (zero-size instances still count and still cost vertex work).

**Done:**
- TREE LOD in `worlds/meru2-flora.js` `plantTrees` (all worlds' trees: city, paths, hills, districts, gardens, lake): per kind a near mesh (full) + a far mesh (`geoFar`: icosahedron detail 0, 5-sided trunks, no clumps/roots, ~1/7 tris). Trees are re-sorted when the camera moves 3 m (perspective camera only). Near = 40 m phone / 100 m desktop (`TREE_NEAR`). Bounding spheres cover all trees so culling never drops one.
- Shrubs and flower stems are built low (detail 0) on phones.
- City trims: hidden instances are compacted out (`flushTrims`, `mesh.count` shrinks). Phone trims: window boxes 3 leaves + 2 flowers, shutters 4 slats, stone arch torus 6 segments. Trim LOD 90 → 70 m on phones.
- Backups: `backup/phone-perf/meru2-city.js`, `backup/phone-perf/meru2-flora.js`.

**Still to do in step 1:** far boxes for draws (2-4 below), the heights terrain segment counts (5). Remaining big triangle items seen at Civic Row: ground group #7 (52k), shutters (33k), near trees (27k), shrubs (23k), districts (20k), each fox ~13-14k (head spheres are 2,560 tris → step 3).

## STEP 1 — Distant city buildings: a simple version (goal: plaza triangles ~1.25M → ~600k)
Files: `worlds/meru2-city.js` (backup first).
1. **Find out where the triangles are.** In `buildCity`, count the triangles of each part: facades (`bd.cut[side]`), the instanced trims (step 10 facade detail), roofs, glass, signs, and the fountain. Write the top 5 into this file.
2. **Build a far version per building.** At build time, make one box per building block with the same footprint and height, plus a roof cap. Give it the same facade texture with UVs that tile per 3 × 3.5 m cell, so the windows still read. Merge all far versions into one mesh per facade material (brick, stone, panel, glass), 4 draws in total. Night window light must work the same way, using the same `winify` material.
3. **Swap near and far.** In `tick`, the existing `LOD` loop (line ~543) already measures each building's distance. Use the full building near and the far box past the distance (phones 70 m, desktop 140 m). Hide the far box for a building when its full version is showing. Do this with a per-vertex "show" attribute or by splitting the far set into chunks by district, but never one draw per building.
4. **Keep the cutaway, doors and NOW HIRING signs on the full version only.** The far box never fades.
5. **Skyline and heights:** check `meru2Heights` (338 meshes, 239k tris) and the skyline. Lower the segment counts for terrain and hills on phones only.
6. Measure, update the table, and check fountain, market, Civic Row and Lanes Court in both screen orientations, at day and at night.

## STEP 2 — Fewer festival and alley foxes on phones (goal: Arena Path and Meru Lanes under 500 draws)
Files: `worlds/meru2-festival.js`, `worlds/meru2-funrooms.js`, `worlds/meru2-walkers.js`, `worlds/meru2-paths.js` (buildPathLife), `worlds/meru2-plazagames.js`.
1. **Count the foxes per area on phones.** The festival alone has about 1,950 fox meshes, roughly 13 foxes.
2. **Choose which foxes stay and which go on phones, using these rules:**
   - Never cut a named NPC with lines (anything in TALK / SPEAKERS / BAR_PEOPLE), a shop keeper, or a booth keeper that has a PLAY spot.
   - On phones, cut background extras: festival crowd and fans, band extras beyond 2, alley dancers beyond 1, arcade players beyond 2, and plaza-game watchers.
   - Keep the band leader, one dancer, both bowlers and one pinball player.
3. **Flag them in code.** Add `phoneSkip: true` to each extra that goes. Have `kit.makeFox` callers skip building it when `touch` is true, so nothing is hidden-but-built.
4. Measure the Arena Path, Meru Lanes and Lanes Court again.

## STEP 3 — Rebuild each fox as about 10 pieces (goal: −60 % on every fox; the biggest win everywhere)
Files: `fox-kit.js` (shared by every world, so test Meru Town Square, Meru Arena, the workshops and Meru 2), `engine/cast.js`, `engine/cane.js`, `engine/chair.js`.
1. **Read `makeFox` and `animFox` first and map the parts.** A fox today is about 150 meshes: body, head, snout, ears, eyes and face canvas, arms, legs, tail, outfit pieces, gear, and outline shells (BackSide, about a third of the meshes).
2. **Plan: group by bone, not by material.** The animation moves these parts: `P.body`, `P.head`, `P.arms[0/1]`, `P.legs[0/1]`, `P.tail`, `P.ears`, plus the snout jaw and the sword or gun. Merge every static mesh under each of those groups into ONE mesh per group. Use vertex colours with one shared toon material, so the colours are baked in. That gives about 10 meshes: body + outfit, head + ears + snout, 2 arms, 2 legs, tail, face plane, gear.
3. **Outlines:** merge each group's outline shells into one BackSide mesh per group, or drop them for a screen-space ink pass later. Keep the FOX INK LOD hook working: `userData.inkList` must still list the outline meshes.
4. **Things that must keep working:**
   - Moods and the face canvas (eyes, brows, mouth).
   - Blink, talking mouth, look-at, hop, lineMood and the sit / chair pose.
   - Hope's cane rig and Noble's chair rig (`u.rig`), and the sword glow and gun tip pulse (their own materials, so leave them unmerged).
   - Outfits: armor, robe, coat, dress, vest, suit and royal.
   - The Fox Workshop's live editing. Rebuild on change rather than editing merged geometry.
5. **Roll it out:** do it behind a flag `makeFox({ ..., merged: true })`. Default it ON in Meru 2 only. Compare side by side in Fox Workshop, then turn it on everywhere.
6. Measure every area again; expect Lanes Court and Meru Lanes to drop by several hundred draws.

## Done when (s32: met in the desktop phone test; Ben's iPhone check 2026-10-10: "everything is running really great" — PHONE PERF DONE for Meru 2)
Every row in the table is under 500 draws and under ~600k triangles on `?phone=1`. Ben checks it on a real iPhone in portrait (390 × 844) and landscape (844 × 390). Then `MERU_2_PLAN.md` gets a line pointing here.
