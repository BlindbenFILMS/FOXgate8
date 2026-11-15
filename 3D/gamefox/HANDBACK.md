# HANDBACK · the new CHOOSE YOUR SHIRT studio, the game's fox + the SKATE PARK (13 Nov 2026)

For the gallery thread (`8GATES-SITE/3D`), from the 8 GATES Design thread. Answer to `message-for-claude-design`.
**No gallery file is in this folder and none was changed.** Nothing under `3D/` was copied, zipped or edited. The paintings and three.js are read from your own `3D/` at run time.

## TRY IT FIRST
Put this folder beside `3D/` (so `8GATES-SITE/handback-avatars-and-shirt-studio/` next to `8GATES-SITE/3D/`) and open `shirt-studio-preview.dc.html`.
Walk with the arrow keys, W A S D, or tap the floor. WALK TO THE NEXT CIRCLE steps through the three mats. A NEW VISITOR ARRIVES shows the arrival rule. PHONE shows it at 390 × 844.
If the folders sit somewhere else, set the page's two paths: `root` (the game files, `./game/`) and `gallery` (your `3D/` folder, `../3D/`).

## WHAT BEN DECIDED (13 Nov; these overrule the note where they differ)
- Every visitor is the 8 GATES GAME'S fox (not the gallery's older fox), with a head they choose. NO HATS, crowns, circlets or tiaras.
- The player picks MALE or FEMALE. The first foxes in the gallery are PLAYER MALE and PLAYER FEMALE in the ART SUIT: WALK THROUGH FEAR on the front, the BLIND CANVAS PROJECT logo on the back.
- Every later visitor gets a RANDOM different male or female head and a RANDOM painting nobody in the room wears, in the same ART SUIT.
- The ONLY place to change your fox is the studio.
- The studio keeps the sign board and the three mannequins (improved: headless bodies of the visitors' own fox in the ART TEE, ART SWEATSHIRT and ART SUIT; poles half as long).
- TWO MIRRORS, one each side of the board. A mirror reflects a fox walking by. When a visitor stands on a mat, the mirror shows their fox turning slowly in the chosen outfit, front then back.
- THREE MATS: one beside each mirror, to its OUTER side (so the fox on the mat never blocks its mirror), and one in front of the middle mannequin, out in the room (from it the outfit shows in both mirrors).
- The panel sits beside the mirror; a bottom sheet on a phone. FOX (male / female) · FACE (a CHANGE FACE button, then 10 faces at a time with BACK / NEXT) · SHIRT · PAINTING · GEAR · DONE.
- Names carry NO TITLES in the gallery (Prince Max is MAX).
- GEAR is written in WORDS: NONE · SUNGLASSES · CANE · WHEELCHAIR. **This overrules the note's "never write those words" rule: Ben asked for the words.**
- Every pair of sunglasses is Prince Max's: dark lenses in a gold frame.
- ART SUIT: the painting as a SQUARE on the chest, the logo across the back, no 8 crest. Pants: near-black navy (#111a2e).
- In the wheelchair the tail stays in the chair (tucked low along the outside of the left thigh) and does not wag.

## FILES (the live ones)
- `shirt-studio.js` · `setupStudio({ THREE, scene, renderer, GF, at: { x, z }, face, scale, ui, getLook, setLook, announce })`. Call `studio.update(dt, camera, playerPosition)` every frame BEFORE your own render (it draws the mirrors). `getLook()` → the visitor's look; `setLook(look)` → you rebuild the visitor's fox and tell the other visitors. Also `isOpen()`, `view(narrow)` (a camera spot), `mats`, `close()`, `dispose()`. What stands where and how the mirror works is written at the top of the file.
- `game-fox.js` · `const GF = await gameFox({ THREE, scene, root, gallery })` → `HEADS` (k, name, fur, grp, sex) · `arts` · `make(look)` → a fox · `wear(fox, artKey)` · `tick(fox, dt, speed)` every frame · `pose(fox, name, t, k)` = one of the game's 250 animations · `firstLook(sex)` · `randomLook(taken)` (the arrival rules).
  A LOOK is four short words: `{ head, shirt: 'suit' | 'tee' | 'sweat', art, gear: 'none' | 'sun' | 'cane' | 'chair' }`. That is all that has to travel between visitors.
- `fox-art-prints.js` · the print step (front, chest square, all-over wrap, sleeves, logo; the 66 shirt paintings, Walk Through Fear first, your own keys).
- `game/` · the 8 GATES game files the fox is built from, exactly the versions tested here (15 files + 2 presets, about 0.95 MB): `fox-kit.js` (the GAME'S fox kit: not your `3D/fox-kit.js`), `engine/cast.js`, `fox-poses.js`, `cane.js`, `chair.js`, `bosses.js`, `workshop-roster.js`, `meru-faces.js`, `fox-mouth3d.js`, `vehicle-kit.js` (the skateboard), `fighter-gear.js`, `fighter-sfx.js`, `armor-sets.js`, `species-armor.js`, `armor-crests.js`, `worlds/meru2-roster.js`, `presets/cane.json` + `chair.json`. They take THREE as an argument, so they run on your three.js. Keep the folder's layout: the files import each other by relative path.
- `shirt-studio-preview.dc.html`, `skate-park-preview.dc.html` + `support.js` · the two pages to try them.
- `skate-park.js` · the park + the rider (see THE SKATE PARK below).

## WIRING IT INTO THE GALLERY (not done here)
1. `const GF = await gameFox({ THREE, scene, root: <URL of this folder>/game/, gallery: <URL of 3D/> })` once.
2. A visitor's fox = `GF.make(look)`; scale it for metres (the preview uses 0.6: the fox is about 1.85 m). Each frame `GF.tick(fox, dt, speed)` (speed in fox units: metres / scale).
3. First visitor `GF.firstLook('m' | 'f')`, every later one `GF.randomLook(looksAlreadyInTheRoom)`. Send the look to the room; on a change at the studio send the new look.
4. `setupStudio({ … at, face })` at the old booth's place (the old one stood at x -57.831, z 9.625, face 2.98); remove the old booth + its panel.
5. Emotes: `GF.pose(fox, 'wave' | 's_high5' | 'groove' | 'p_sit' | …, t, k)` after `GF.tick`. The list with labels: `GF.FP.FOX_ANIMS`.

## THE SKATE PARK + SKATING ON THE MAP (Ben, 13 Nov)
Try it: `skate-park-preview.dc.html` (same folder rule: beside `3D/`). SKATEBOARD puts the fox on the board; arrow keys / W A S D / tap the ground steer and push; SPACE or OLLIE jumps; K or TRICK = kickflip in the air, manual on the ground; land on a yellow rail to grind.
- WHERE: between the WHY HOUSE and the BLIND CAN CINEMA. The preview stands it at x 49.5..73.5, z 12.5..40.5 (`at: { x: 61.5, z: 26.5 }`, 24 × 28 m) with stand-in blocks at your CAMPUS.why + CAMPUS.cinema places. **Ben: the TREES on that ground may come out.**
- `skate-park.js` · `setupSkatePark({ THREE, scene, GF, at, face, video, ground, logos })` builds: a pale concrete pad · a WOOD quarter pipe on each long side + a wood kicker · a dark concrete ledge with yellow edges · two yellow rails · a SKATE PARK sign on the path side · the BIG SCREEN (9.6 × 5.4 m, its middle 5.4 m up) on the far side, facing the path, with a white sponsor board under it. Call `park.update(dt, visitorPosition)` every frame. `park.heightAt(x, z)` + `park.rails` are what a rider needs.
- SKATING IS ON THE MAP, NO OTHER SCREEN: `makeSkater({ THREE, GF, fox, board, heightAt, rails })`, then every frame `GF.tick(fox, dt, 0); sk.update(dt, { x, z, jump, trick })`. It works ANYWHERE: pass your own floor height and no rails to let a visitor skate the whole gallery; the park only adds ramps + rails. `board = await GF.skateboard()` is Meru's own board (`game/engine/vehicle-kit.js`), shown as Meru rides it: 1.6 times its model, lengthways along the ride, the fox side-on and facing the way it goes. The skate animations are the game's (`sk_push`, `sk_ollie`, `sk_kickflip`, `sk_grind`, `sk_manual`, `sk_bail`).
- LOGOS: `logos: [{ url, u, v, w, h, y }]` turns any picture into a BLACK stencil with no background (Ben's choice): on the pad, or upright facing the path when `y` is given. The preview has the BLIND CANVAS PROJECT logo at the front (path side) and eight ORA logos (three on the pad, three on the board under the screen, one on the path end of each pipe), all read from your own `3D/gallery/img`.
  **WAITING FOR FILES FROM BEN:** the BLIND CAN FILM FESTIVAL logo (its place: the back left of the pad, about u -4.3, v 11.9, 6.4 × 3.2 m; the preview's `canLogo` prop) and a plain ORA logo (today it is cut out of `ora_card_16x9_black`, so its edges are rough).
- THE BIG SCREEN shows a poster until it gets the WHITE CANE COMMERCIAL: pass its URL as `video`. **The film is not in the Design project.** It plays muted (a browser will not start a film with sound by itself) and starts when a visitor is within 70 m.
- NOT DONE: your collisions with the park's pieces · other visitors seeing who is on a board (send "on a board" with the look) · scores, lessons, sound · a real phone test. This rider is a small one written for the gallery, not the game's full skate engine.

## KNOWN LIMITS (honest list)
- NOT tested on a real phone, and not judged by eye by the Design thread: only through automatic checks and Ben's own look.
- WEIGHT: one fox is about 190 separate meshes. A full room on a phone needs the parts merged per joint (as your `bakeLocal` does for the old fox). Not done.
- THE MIRRORS draw the whole scene again (288 × 512 each; on touch screens the two take turns). In the gallery give the mirror camera a layer with only the foxes, the floor and the wall.
- The game fox cannot wear hats here by Ben's choice; Hope's bow stays.
- Seated visitors: standing dances become upper-body dances; the cane's tip can lift a little when the body leans.
- TO CHECK IN YOUR CODE: by the lathe's own math, `wrapArt` in gallery-game.js (its outer flip) shows the painting MIRRORED on the front of the all-over tee. `fox-art-prints.js` has `wrapTrue(key)` (not mirrored; used here) beside `wrap(key)` (yours as it stands). Test with a painting that has lettering.

## PARKED (earlier direction, kept only for reference)
Before Ben chose the game's fox, a roster workshop was built on the gallery's own fox: `fox-roster-workshop.dc.html`, `fox-roster-presets.js`, `fox-face-addon.js`, `fox-animations.js`. They work beside `3D/` but are NOT part of the new studio. The game-fox version of that workshop is `Ben Art Shirt.dc.html` in the 8 GATES project (not in this folder).
