# 8 GATES 3D — build plan and progress

**TOP PRIORITY: mobile first.** Every room, minigame panel, dialogue box, camera shot and HUD is checked at phone size (390x844 portrait, 844x390 landscape) before it counts as done.

Update this file at the end of every session. One chat per step keeps each session focused.

## Rules for every world (see CLAUDE.md)
One connected outdoor map with zones (paths become zones, bracket names kept) + fade interiors + separate battle maps. Off-path wilds with creatures that stay off the path; paths always lined with lamps or trees. Shared save, story/choices, enemy library. Backup before each world. Phone budget.

## Step 0 — Engine split (in progress — session 1 done)
Turn `meru-game.js` into a shared engine + per-world data, so new worlds are mostly data.
- [~] `engine/textures.js` split out (canvasTex, emblem/crest/sign/banner, cobble/plaza/asphalt; meru-game.js re-exports for old imports). `engine/world-kit.js` itself not started:: renderer, sky/day-night/weather, toon materials, outlines, camera + collision, input (joystick + right-side buttons 1 Melee, 2 Range, 3 Jump, 4 Item wheel, contextual Talk), dialogue, quest banner, fade-door interiors, minigame panel (iframe for original HTML), audio.
- [ ] `engine/building-kit.js`: wall textures, trims, windows, doors, roofs, signs, banners, lamps (from the Meru polish pass).
- [ ] `engine/room-kit.js`: generic interior shell + furniture parts (bar, tables, counters, shelves, beds, altars, thrones, stalls).
- [ ] Fight system pulled from `meru-arena.js` into `engine/combat.js` so battle maps and enemy rooms can use it in any world.
- [~] Data format: `worlds/<world>.js` — `worlds/meru.js` done for the square (map, buildings, exits, foxes, dialogue, ZONES, INTERIORS, QUEST, TALK trees, MINIGAMES); still to move: building/room layouts, shops, NPC placements of interiors. Original spec: exporting rooms (bracket name, kind outdoor/interior/battle, layout, props, NPCs with lines, doors → room), shops, minigames (key → original HTML file), quests.
- [x] Extract each world's minigame HTMLs (done: meru 14, jidda smoothie, kufa none of its own, luxor deli, nebo none, ur espresso, zion bakery, home none, earth breakfast/blackjack/craps/roulette, station none; gaya build has none embedded — it loads Meru's. Darts/jukebox/casino games are shared copies of Meru's. Surf, tennis, archery etc. are inline code in the world files, not separate HTML.) Original spec: to `minigames/<world>/<key>.html` (as done for `casino/`).
- [x] `engine/save.js` (localStorage `8gates.save.v1`, `window.__8G_SAVE`; arena sets tournamentEntered / tournamentWon; darts best saved). Original spec:: one save for all worlds (flags, gold, XP, items, relics, outfit, current world/zone).
- [x] `engine/story.js` (Conversation trees with choices/flags/conditions, treeFromLinear, quest steps using the 2D guide rule; Meru NPCs now use choice menus). Original spec:: quests, steps and dialogue choices as data; port Meru's choice menus.
- [ ] `engine/enemies.js`: enemy library (melee / ranged / charger / boss) + off-path wander zones that never step onto paths.
- [x] Zones (Meru: meruTown, meruArena, meruThronePath, meruRuins, meruLake rects; label + save follow the player). Original spec: world map is split into named zones (bracket names); HUD label follows the player.
- [ ] Path markers: helper that lines any path with lamps/trees automatically.
- [x] Phone UI in Town Square (right column 1–4, TALK only when near, radial item wheel, quest banner, keys 1–4 on desktop; melee/range show "holstered in town"). Arena done too (1 Melee = sword, 2 Range = laser, 3 Jump, 4 Item wheel; Lock/Dodge/Burst column beside it; vitals + boss bar move to the top on phones; ☰ menu). Original spec: joystick left; right column 1 MELEE, 2 RANGE, 3 JUMP, 4 ITEM (quick item wheel); TALK only when near; quest banner.
- [~] Mobile pass: Town Square done (dialogue size/position per orientation, choices 48px, casino panel full-screen with 48px Leave button, darts bar fits landscape, jukebox scrolls, settings tucked behind ☰, intro fits landscape, low quality auto on touch). Arena done: King close-up puts the face in the upper third in portrait and right of centre in landscape; dialogue box per orientation; results panel fits landscape. Original spec: dialogue box size + position, King close-up framing in portrait, casino/minigame panels full-screen on phones with a big close button, darts/jukebox HUD at phone sizes, 44px+ targets.
- [ ] Media: ask the user to attach `C:\Users\Ben Fox\Documents\8 GATES\all-files\8GATES-SITE` and copy MERU/videos + MERU/MUSIC/JUKEBOX into the project.

## Step 1 — Finish MERU (19 rooms)
Done: Town Square (meruTown), Tavern (meruTavern: bar, darts 3D, jukebox), Casino (meruCasino: slots x3, wheel, poker x2 via original games, TVs, cashier), Arena interior (meruArenaInterior, in `Meru Arena.dc.html`).
Outdoor map (one map, zones): extend the square into the Castle Path zone (north, up to castle gate), Arena Path zone (east, crowd, already has the arena), Ruins Path + Desert Ruins zones (west, dig site), Lake zone (south: jetty, boat, fishing, dive spots, Nelly). Wilds between zones with off-path creatures. Battle map: The Bridge.
Interiors to do: Throne Room, Barracks (range/darts, sparring), Meru Lanes (bowling, darts, jukebox), Fortune Teller, Item Shop, Armory, Burgers, Permit Office, Ruins caves (bandit camp, caged Max). Space dock (Meru), RETURN TO ORBIT, Gaya monks' loading screens.

## Step 2+ — Worlds, in order
World kit v1 (overnight 1 Oct, Claude in Cowork): every world below is PLAYABLE as a first pass from its 2D data via `world.html?w=<world>` — one exterior with zones + roads, all rooms as fade interiors with furniture and props, all NPCs with their lines/topics/shops, arrival intros, music, minigame panels (original HTMLs), light combat in the wilds. Next per world: hand-polish (landmark buildings, set dressing), space dock, battle maps.
- [~] GAYA (39 rooms incl. Kyoto quarter) — kit v1
- [~] JIDDA (20) — kit v1, lagoon water, smoothie + tavern darts/jukebox
- [~] KUFA (23) — kit v1
- [~] LUXOR (17) — kit v1, deli
- [~] NEBO (22) — kit v1
- [~] UR (20) — kit v1, espresso
- [~] ZION (18) — kit v1, bakery
- [~] HOME PLANET (21) — kit v1 (silent, like 2D)
- [~] EARTH (29) — kit v1, casino games + breakfast
- [~] DEEP SPACE FOX station (19) — kit v1, thin (promenade + 4 areas in the data)
- [x] Space docks in 3D (every world but Earth)
- [ ] Battle maps in 3D (data has them; not reachable yet)
- [x] Space map in 3D — v2 (space.html + engine/space-game.js + engine/space-play.js): 3x3 grid, 5 installations per world, DSF, ports, raids, trade/upgrades/refit/gates, chart

## 3D minigame rebuilds (after panels work), user's order
- [x] All seven built in `minigames3d/` on a shared shell (shell.js): surf, trucks, tennis, archery, glider, gold, speedway. Next: fishing, diving, bowling, darts in 3D.

## Session log
- Step 0 session 1: backup/meru/, engine/textures.js, engine/save.js, engine/story.js, worlds/meru.js, minigames/<world>/ extracted, Town Square phone HUD + dialogue choices + quest banner + zones. Then session 2: Arena phone HUD + King framing. Next: engine/world-kit.js (renderer/sky/toon/camera/input/fade doors out of meru-game.js), building-kit, room-kit, combat.js from meru-arena.js, enemies.js, path markers, Arena phone UI.
- Meru Town Square, Tavern, Casino, Arena, Fox/Combat workshops built. Minimap removed (code kept).
- 1 Oct overnight: engine/world-kit.js + tools/gen_worlds.py + world.html + index.html (galaxy). 10 worlds generated and checked for errors; minigame panel; room dressing (tables/stools/candles, wall trim, lamps, banners, rugs); indoor lighting fix. Morning checklist: TRY_THIS.md.
- 1 Oct (cont.): hero pass — layered ground, Meru-style trees/lamps/tufts, per-world building kit + baking, zone props from 2D spots, castles at every castle gate, Kyoto quarter (torii, pagoda, keep, dohyo, sakura), Vegas vision, set pieces in every world, station pass, creatures.js (12 kinds + combat feel), space.html, HUD compass/banners, 7 3D minigames. All 216 places load with no errors.
- 1 Oct (second night): surface polish on every world (see TRY_THIS.md 'second night'), space map v2. Sweep: all 216 places load with no errors.

## Blind Canvas gallery (1 Oct): playable
Ben's PlayCanvas project (BCP export) was exported with PlayCanvas's own GltfExporter and optimized with gltf-transform into `gallery/gallery.glb` (3 MB).
- **Signs and art:** the 281 UI elements (text plus 110 artworks), 73 art-viewer entries (title, quote, image description), 27 zone videos (Vimeo HLS plus posters) and 4 learning stations are in `gallery/gallery.json`. Images are packed into `gallery/img.pack` + `img.index.json`.
- **Engine:** `engine/gallery-game.js` uses three-mesh-bvh collision, streams signs in near the player, plays zone video through hls.js (native on iOS) and uses the fox kit (cane, glasses and wheelchair options). The page is `gallery.html`.
- **Not started:** multiplayer, waiting on Ben's answers about crowd size and public vs invite-only. Audio beacons on the artworks are also not started.
- **Rebuild steps** (scripts in `g3d_checks`):
  1. `wexp.js` exports the GLB and the element info.
  2. `wpos.js` exports the script entity positions.
  3. A Python step builds `gallery.json`.
  4. `conv.js` makes the webp images, then they are packed into `img.pack`.
- **1 Oct, later.** Art comes from Ben's artist pages ("BCP Viverse/all art - SQUARE/HTML files/*.html", 22 artists): titles, quotes, image descriptions, bios and the art at up to 1024 px. `/home/claude/bcp/wix/parse.js` extracts it and `apply.py` maps it onto the walls.
  - 45 existing pieces were upgraded and 16 bios replaced.
  - The Wall of Why portraits were mislabelled "Roots of Kinship" in the source; that's fixed.
  - The New Artists Wing (`engine/gallery-wing.js`) holds 7 artists × 3 canvases plus bio boards. It is built at (-100,-150,0) and you enter it through the teal doorway in the main hall at (-96,-3.35,12).
  - White floors are now honey oak. The shader swaps white, upward-facing pixels, including palette-textured materials.
- **Videos (1 Oct, evening).**
  - 23 interview videos were re-encoded to 480p H.264/AAC with faststart, about 255 MB in total, in `gallery/video/`.
  - 16 of them replace the Vimeo streams on the gallery's screens (`vids[].local`). The 7 wing artists' interviews play on two-sided totems in the middle of each pair of bays.
  - Playback tries the local file first and falls back to Vimeo. Six screens still stream from Vimeo only: Artists of the Year, Stevie Wonder, the main BCP screen, the blindness simulator, Goalball and Ora.
  - Each file must stay under 20 MB for the folder bridge.
- **Multiplayer (1 Oct, night).** `engine/gallery-net.js` uses Trystero (`vendor/trystero-nostr.js`, bundled 0.25.4): public Nostr relays handle matchmaking, then visitors connect directly over WebRTC. There is no server and no account.
  - Each visitor sends a profile (name, look, gear) plus their position 10× a second while moving and once a second while idle.
  - Other visitors appear as baked foxes in the BCP tee with name tags. There's a 👋 wave, plus screen-reader announcements when people join and leave.
  - `?room=x` makes a private room and `?net=local` uses BroadcastChannel for testing. `wmp.js` in g3d_checks tests two tabs.
  - **Limits:** a mesh like this is good for about 15–20 people per room. There's no TURN server, so some phone-carrier networks may fail to connect. For bigger events, move to Supabase Realtime.
- **Wing moved (1 Oct, night).** The New Artists Wing now joins the south end of the Wall of Why hallway, at origin (-69.9,-3.14,22), rotY π/2, with an 8.4 m open doorway. It runs 66 m out over the lawn toward +z. The teal portals are gone, and the HUD label switches as you enter the wing's bounds.

- **Remodel in the New Wing style (1 Oct, late).** The style guide is in `gallery/STYLE.md`. `engine/gallery-remodel.js` carves out old pieces (triangles and instances inside the boxes or cylinders listed in `CARVES`, along with their signs, art and screens) and builds replacements.
  - The entrance is one continuous 5.6 m oak walkway with a red handrail and glass panels. It runs through a rebuilt, bigger eye and down to an open landing 2 m short of "Hope Floating in Braille", with a skirt under the ramp's low end.
  - The opening platform's black pit walls are gone. The arrival area is now a 20 × 27 m oak plaza on a white plinth, and the welcome video stands on a wing totem at (-9,0,-6) with plenty of room behind it.
  - The north annex is the AMB room (`rooms` in gallery.json).
  - The 57 artworks are frameless canvas boxes with wing plaques.
  - Grey walls across the building are repainted gallery white in the shader.
  - A backup of the pre-remodel version is in `backup/gallery-v1/`.
