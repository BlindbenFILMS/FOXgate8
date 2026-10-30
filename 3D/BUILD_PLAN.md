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
  - **Later on 1 Oct:**
    - The tee's back logo now follows the shirt's profile and sits high, just under the neck (fox-kit `tee`, lathe print from y 0.79 to 1.225).
    - Art cards are bigger (3.4 m) and lower (bottom 0.75 m off the floor), and their type scales with the card. The wing's plaques are 3.3 × 0.9 m.
    - The main gallery's 17 artist kiosks now carry the wing's slate bio board.
    - **Living paintings.** 69 of Ben's Runway animations of his art (960² × 10 s, from `all art - SQUARE/<artist>/4-VIDEOS/Gen-4*`) were matched to their stills by first frame. Each was encoded as a 480² H.264 ping-pong loop (no sound, about 1.2 MB) in `gallery/anim/<image>.mp4` and listed in `gallery.json` → `anims`.
      - `engine/gallery-anim.js` fades the animation in over the still while you stand within 9 m in front of the painting, and fades it out when you leave. A pool of 2 videos (1 on phones) means only the nearest ones play.
      - Duplicates skipped: Craig's motorcycle used the newer clip, and Nikki's folder had two of Deborah's clips.
    - The blindness simulator video (`gallery/video/blindness_simulator.mp4`, 960×540, 16.5 MB) plays on both "What does blindness look like" screens (vids 8 and 24) instead of Vimeo.
    - **AMB room.** The title now reads "Academy of / Music for / the Blind", and the AMB logo is large on an ink panel on the end wall (`rooms[].logo`). Door signs shrink to fit, so the full name shows. The old hall sign's "ACADAMY" is fixed to ACADEMY.
    - **See through their eyes** (`engine/gallery-vision.js`). Two floor spots in the main hall at (-101.5, ±2.4), between Ben's and April & Melissa's screens and facing the big screen.
      - Choosing "Stand here" holds you in place and switches to a first-person view at the fox's eyes. You look around by dragging, with the joystick, or with the arrow keys/WASD.
      - The overlay is Ben's Patient Experience simulator: RP, cataracts, macular degeneration, floaters and glaucoma, with the same severity maths and a severity slider. Spot 1 starts on RP, spot 2 on cataracts.
      - Added for 3D: the clear spot leads a little in the direction you turn; floaters trail your look on a spring; your sight settles in over 2.5 s; Guided look pans between the big screen and the paintings visible from the spot. Esc or Step off leaves.
    - The phone joystick is now Meru's: it floats, appearing under your thumb anywhere on the left 45% of the screen (112 px base, red 44 px knob, 50 px travel), and hides when you let go.
    - **AMB room v2.** The far wall is one big screen playing `amb.mp4` (16:9, 5.7 m tall on an ink wall, plays while you're in the room; the totem is gone). The AMB logo lies on the floor just inside the door, upright as you walk in (`floorLogo`), and fills the empty left bay (`fillLogo`). It's also on the hall wall before the door at x -74, z -12.8 (`hallLogos`).
    - **2 Oct, midday batch.**
      - The New Artists Wing is now `spacious`: 22 m wide, 7 m tall, 124 m long, with 30 m bays. Each piece is a 3.4 m canvas with its own description card beside it (title, artist, quote). Benches sit either side of each totem.
      - Up to 3 living paintings play at once (2 on phones).
      - Zone videos are never silent inside their zone: volume falls to 45% at most, and the falloff scales to the zone size. This fixed Dave Steele and Raquel Alim on the mezzanine.
      - Vision simulator: 8 spots (main hall ×2, welcome plaza, AMB room, New Wing, "How we see" room, music room back, meditation area). Each has a pole sign with the eye logo, "CLICK/DRAG SCREEN TO LOOK AROUND" and a Learn more panel with the Patient Experience's condition pages (`LEARN` in gallery-vision.js).
      - Beam titles (MUSIC ROOM, MAIN GALLERY, HOW WE SEE, WALL OF WHY, ACADEMY, MEDITATE WITH MORTEN) now render as ink plates with padding (`plate: 1` on the sign). HOPE FLOATING is smaller. The Wall of Why name cards are small and sit above each photo.
      - Kiosks are rebuilt (`buildKiosks` in gallery-remodel.js, art inlined in `engine/kiosk-art.js`): one centred Tools kiosk behind the spawn (the spawn moved to x 3.6), and Ally Tips and Spectrum by the walkway, bigger and 3 m clear of the rails.
      - Art streams in within 115 m (75 m on phones), nearest first, 14 per tick.
    - **Six Views wall** (`engine/gallery-simwall.js`). Ben's "Vision Simulator - Six Views" page is rebuilt as shaders on both big screens in the "How we see" room (the vids marked `simwall`).
      - One film (`gallery/video/sim_hero.mp4`, 720², silent) plays six times: cataracts, regular, macular degeneration, diabetic retinopathy (floaters), RP and glaucoma. It uses the page's severity maths and wandering gaze, under a VISION SIMULATOR / BLINDNESS SPECTRUM title that swaps every 5 s.
      - A kiosk at `simKiosk` (press E or tap) opens a severity slider with Regular/Mild/Moderate/Severe presets. The wall eases to the new value, and the player's own view is untouched.
      - It plays only while you're in `simZone`. The old `blindness_simulator.mp4` no longer plays there.
    - New local videos: `blindcan_capitol.mp4` (welcome platform totem, vids[0]), `stevie_wonder.mp4` (first room after the walkway, vids[1-2], 360p to stay under 20 MB) and `goalball.mp4` (vids[17]).
    - 12 cards keep their old spot because the wall there doesn't fit a bigger card: they sit on kiosks or group walls, or would overlap other art.
    - 2 Oct fixes:
      - The phone joystick now rests faint at the bottom-left on touch screens. It jumps under your thumb anywhere on the left 45% and is hidden while you're on a vision circle.
      - Vision pole signs: the pole stops under the plate, and a short neck joins the plate to the eye disc, so nothing crosses the words. Standing within 1.6 m of a sign also gives the "See through their eyes" prompt (`signPos`).
      - The main hall circles are on the centre line (z 0) in the gaps between the ceiling dot clusters: (-97.8) back by the screen and (-88.7) toward the entrance.
      - Screen flicker: video zones were only about 1.2 m tall, so the raised floor in front of the big screen (and jumping) dropped you out and flipped the screen to its poster. Zones now reach 1 m lower and 2.6 m higher. Screen boxes are 1.25 deep, so faces sit clear of the old GLB screen.
      - AMB hallway: amb_4 (big) moved to the front of the west wall (z -10.6..-17.1), and the AMB logo moved to z -22 by the door. amb_3 hangs on a free-standing ink board (`hallBoards`) on the low east wall at z -13.5.
      - The AMB film plays and is heard from just past the Stevie Wonder screens through the whole hallway to the Wall of Why (`endVideo.extraZones`). Volume fades with distance (`reach` 100, `minVol` 0.07): about 0.08 at the Wall of Why, 0.45 at the AMB door and 0.85 at the screen.
    - 2 Oct, round 2:
      - The "How we see" room has no layered spot now; only the Six Views wall plays there.
      - Two severity lecterns (`simKiosks`) sit at (-160.1, ±5), centred in front of each screen. They line up with the foot of the entrance stairs, just off the walking path, so you face the screen while using one. They're low, so they don't block the film, and they're solid (`simCol`).
      - Layered simulator panel: the condition title is gone (the selected button shows it). "← Back" sits where Learn more was, and a full-width pulsing "Learn about: <condition>" button is the bottom row (no pulse with reduced motion).
    - 2 Oct, round 3:
      - The Learn button for Floaters reads "Learn about: Diabetic Retinopathy" (the page it opens).
      - Floor arrows (`engine/gallery-guides.js`, `guides` in gallery.json): trails of red chevrons with a floor label at the start and a wave of light running in the walking direction (it only animates when you're within 30 m).
        - Two trails, "HOW WE SEE · MORE ART", go round both ends of the big main-hall screen, through the room behind it, to the "How we see" room.
        - Two at the hallway junction: "ACADEMY OF MUSIC FOR THE BLIND" (-z) and "NEW ARTISTS WING" (+z).
        - To add one, give a polyline of [x, z] floor points in walking order, plus an optional label.
    - 2 Oct, visiting together (`engine/gallery-together.js`, on the new gallery-net `ev` channel):
      - Tours: ☰ → "Lead a tour" invites everyone with "Follow <name>". Followers' foxes walk the leader's breadcrumb path (`G.follow`). If they get stuck for 2 s they hop to the trail. If they fall 30 m behind, or the leader goes through a door, they jump in behind the leader. Moving yourself stops following. The leader sees how many are following, and "End tour" releases everyone.
      - Anyone can be followed or jumped to from ☰'s list of who's here ("Go to" / "Follow").
      - Watch parties: in any room with a film (and someone else online), "Watch together · ▶ Start" restarts that film for everyone in the room. The host sends the time every 3 s and guests re-sync when they drift by more than 0.8 s. People elsewhere get "<name> started a watch party · Join", which takes them there. The host has "From the start" and "End", and leaving the room ends it.
      - The Six Views wall is shared: a kiosk change is sent to everyone (throttled while dragging) and announced. People who arrive later get the last value.
      - Tested with two tabs (?net=local&room=test), with g3d_checks/wtog.js serving a webm stand-in from a range server on :8766.
    - 2 Oct, voice chat (`engine/gallery-voice.js`):
      - Nothing asks for the microphone at load. A "MIC / OFF" button appears beside 👋 only while someone else is in the gallery. Tapping it asks for the mic (echo cancellation, noise suppression) and sends it to everyone over WebRTC (`net.voice`, Trystero addStream). New arrivals get it too. Tap again to stop. It turns red and reads "MIC / ON" while live.
      - Voices play louder the closer the fox is (35% at the far end). Names with a live mic show 🎙 in ☰'s list, and on/off changes are announced. Your mic switches off when everyone else leaves.
      - Local test mode (?net=local) has no voice transport. g3d_checks/wvoice.js tests the button, events and playback with a fake mic. Real voice needs two devices online.
    - 2 Oct, hosting + notes:
      - Group vision: on a red circle, "👥 Show everyone" (shown when others are online) sends your condition and severity to visitors within 35 m. They see through your eyes while still walking (overlay `guestView`), with a "Seeing through Ben's eyes · Stop" bar. Changes follow live. The sender re-sends every 4 s, and a guest's view lapses after 12 s of silence or when the sender steps off.
      - Host mode (☰ → Host this visit): one host at a time (ties go to the lower id), ⭐ in the who list.
        - Bar tools: Gather everyone, Mute all mics, and 🔊 Spotlight my voice (full volume everywhere).
        - Gather moves guests into a ring round the host in private rooms. In the public gallery it's an invite with "Go".
      - Notes and guest book (`engine/gallery-notes.js`, `vendor/nostr-pure.js` = nostr-tools 2.25 signing, 26 KB):
        - Notes are kept as signed Nostr events: kind 4251 notes, kind 4252 hides, tags t=bcp-gallery-v1 and r=<room>.
        - Relays are in gallery.json `notes.relays`, overridable with ?relays=. New notes are also sent over the gallery connection, so people present see them instantly.
        - Spot notes: ☰ → 📝 Leave a note here. A card floats at the spot, opens as you walk up and is read aloud once ("Read notes aloud when I pass" in ☰, on by default). Walk up and press E to see every note there and reply.
        - Art notes: a "Notes from visitors" section in each artwork panel, and the prompt shows 💬 n.
        - The guest book: a lectern on the welcome plaza (`notes.guestbook`) showing the latest 4 signatures. Press E to read them all and sign.
        - Moderation:
          - A word filter blocks posting and display, and links are not allowed.
          - One note per 15 s and at most 40 shown per browser key.
          - "Remove mine" for your own notes, and "Hide for me" for others.
          - The admin link ?admin=<passphrase> hides any note for everyone; `notes.admins` holds the public key.
          - `notes.hidden` hides ids for good.
        - Tests: g3d_checks/wnotes.js, wadmin.js and wnote1.js against a mock relay (/tmp/claude-0/nb/relay.js on :7777).
    - 2 Oct, the world outside (`engine/gallery-world.js`; ?noworld turns it off for testing):
      - The lake runs x -43.6..122, z ±84, water at y -2.95: under the entrance bridge and out in front of the plaza. It's a see-through rippling shader (moving vertices, two noise layers, fresnel sky tint, sun glints) over a dark lake bed, with a stone rim.
      - Flags at (44, ±13) on stone bases with 15 m poles: Blind Canvas Project (white logo on ink, red hem) and Ora. They wave with a shader and read correctly from both sides.
      - Cherry trees: the park's two tree-card materials get a drawn blossom picture (material names are now kept on conversion), plus 190 more crossed-card trees (one instanced mesh) round the lake and park.
      - The city: a lawn fills the park (±275 m), a street grid with lane marks and crossings sits outside it, and ~1,900 towers make one instanced mesh with windows drawn in the shader. They get taller towards a downtown to the north-west, with five landmark spires. Fog now reaches 170..1150 m (900 on phones) and the camera sees 1,600 m.
    - 2 Oct, building polish:
      - Eye facade (`engine/gallery-eye.js`):
        - Frosted see-through glass fills the opening from the iris out to the white frame. The outline was measured from the model, 48 samples at x -28.5. The glass shader adds a ceramic frit that gets denser outward, steel mullions every 30° plus rings, faint veins, and a limbus shadow. At night it glows warm from inside.
        - The iris is 40 teal fins angled like an aperture (28 on phones), with a dark limbal ring and an ink collar round the pupil tunnel. A catch-light glint sits high on the iris.
      - Name sign: BLIND CANVAS PROJECT on an ink panel (red hem) on two steel posts in the water at x 21, readable from both sides. The flags moved to (40, ±21) so they don't hide it.
      - Sky: a gradient dome, golden hour (warm horizon, low sun at (110,60,85)), with warm sun and hemisphere light and peach haze.
      - ☰ → Atmosphere → 🌙 Night (saved) eases to a starry sky with a moon, lit city windows, a dark lake with light shimmer, and a lit-from-inside eye. Interior lights stay up.
      - Sound (`engine/gallery-sound.js`, all synthesized): lake water near the edge, birds outside, a quiet hum inside (x < -44), and wood footsteps (a soft roll in the wheelchair). It ducks under room films. ☰ → Ambient sounds turns it on or off.
      - Art: every painting has a warm light pool on the wall and a small ink spotlight fixture above it (`lightArt`, attached as art streams in).
      - Room doorways (every buildWing room): an ink portal with a red inner edge, a dark floor band, and a plant either side.
      - Plants and benches (`engine/gallery-props.js`): plants at the plaza corners and the main hall entrance, and two oak benches on the plaza facing the lake.
      - Safety: an invisible wall on the plaza's open lake side (x 7.6). Anyone below the water line outside the building is sent back to the entrance with a "Splash!" message.
      - The model's old lawn (Plane001) is lowered 0.2 m visually; it was peeking along wall bases in the main hall.
    - 2 Oct, exterior polish (round 2):
      - Shell smoothing: the curved Palette meshes of the white shell (4 meshes, 60+ vertices) get creased normals at 32°. Curves shade smoothly and flat faces and edges stay crisp. Pure-black model parts become charcoal #2b2a29, so they read as surfaces, not holes.
      - Eyelid: a slim charcoal canopy with a red edge over the top of the eye (gallery-eye.js), at x -22.1 following the measured outline. It also hides the roof beams' cut ends.
      - Glass in the tall side openings: `windows` in gallery.json (8 openings, measured), each a faint blue-white pane with a sheen streak and slim ink transoms. They're solid, so you can't walk out (`winCol`).
    - 2 Oct, museum avatars (Ben's AVATARS_for_BCP_gallary pack):
      - The opening screen has "Choose your avatar": 🦯 White cane or ♿ Wheelchair (pref.look = 'suit', extra cane or chair). ☰ → Your fox also has "Suit fox". Multiplayer sends look + extra, so others see the same avatar.
      - The suited fox wears sunglasses and an open dark jacket over an art shirt: Walk Through Fear on the front (follows the jacket's shape) and the BCP logo across the back. The tail is swept aside so the back shows.
      - Rigs: `engine/avatars/cane.js` and `chair.js` with `presets/` (Hope's tuned two-point cane, Noble's "future" chair). The chair takes `backLogo`: a curved BCP logo patch on the backrest.
      - fox-kit.js gained the pack's painted-on sunglasses (`glasses: 'sun'`), `legColor` and `rig.update` in animFox. The suit gets a `prints` variant. Suit foxes are not baked (the rigs move their parts).
    - 2 Oct, crash fix (near the vision simulator room, and upstairs by the wall next to it):
      - The Six Views wall's shader was one uber-shader (all six modes as runtime branches, 17 video taps per pixel blur, highp) on 24 tiles. It drew whenever the screens were in view, including from outside the room and upstairs.
      - Now each tile compiles only its own mode (`#if MODE`), the blur is one ring of 8 taps (6 on phones) in mediump, and the tiles only draw while you're inside `simZone`; otherwise the screens show dark.
      - Safety net: on `webglcontextlost` the page saves your position, shows a short "graphics reset" message and reloads you back at the same spot (sessionStorage `8gates.gallery.resume`, valid for 2 min).
    - 2 Oct, optimisation pass (draw calls measured in the test browser, before → after):
      - Entrance 1112 → 122, main hall 622 → 292, vision room 1160 → 320, music room 1311 → 380, upstairs 698 → 216, New Wing 268 → 91. Geometries 870 → 420.
      - Rooms (wing, AMB, north room) are hidden unless you're within 50 m of their bounds; walls don't stop the camera from drawing what's behind them.
      - `mergeStatic`: still meshes that share a material are merged per group (entrance, kiosks, props, every room, the vision pole signs).
      - `compactGroups`: boxes with a material array (art canvases, video screens) draw 2 times instead of 6.
      - Painting spotlights became two InstancedMeshes (pool + fixture) for the whole gallery.
      - The suit fox runs its rig for test frames, keeps every part that moves, and bakes the rest (about 90 → 35 draws).
      - Plants and benches share materials. Removed the rooms' 0-intensity PointLights (they still cost every lit material).
      - Signs stay loaded to 115 m (75 on phones) but draw only within 38 m (text and labels) or 70 m (art).
      - Six Views film: no src until you enter the room. On leaving, it is paused, the src removed and `load()` called (memory freed). Room films already unload in `playUrl(null)`, and living paintings release their video when you walk away.
      - Adaptive resolution: if frames average more than 30 ms over 2.5 s the pixel ratio drops 0.25 (down to 1x), and it climbs back when frames are under 17 ms.
    - 2 Oct, garden + avatar tweaks:
      - Suit avatar: the back of the shirt is now art (`SUIT_BACK_ART` = Curating Hope, wix_curating_hope.webp); the BCP logo stays on the wheelchair backrest. In the chair the tail comes out at his left side over the wheel (tail group x 0.48, tailSide 1.75, lower lift) instead of through the backrest.
      - The lake now lies only between the museum's eye and the welcome plaza (x -43.6..-12.4, under the bridge).
      - The Cherry Blossom Garden replaces the water east of the plaza (`engine/gallery-garden-plan.js` = layout, shared by scenery and collision; drawn in gallery-world.js section 3b):
        - a walkable lawn terrace level with the plaza (x -12.4..92, z ±58), with a stone wall, a clipped hedge and invisible walls round it;
        - gravel walks (from the plaza under the name sign, a ring round a big old cherry tree on a stone court, north/south walks, an east walk), and a dry river of fallen petals;
        - 78 cherry trees with petal drifts underneath, 24 stone lanterns (glow warm at night), 6 oak benches round the court, and falling petals (only animated when the garden is in view).
      - The flags stand on the ring path (40, ±21) and the BCP name sign stands on the lawn at x 21 (the walk passes under it); lanterns, benches, sign posts, flag bases and the big trunk are solid.
      - CARVES: 'old platform rim' (x 7.35..13) removes the old model's hidden rim that blocked walking from the plaza into the garden.
      - Lake sounds fade as you walk into the garden; birds stay.
    - 3 Oct, going live + fox Animoji:
      - Host live (`engine/gallery-live.js`): the host bar has "📷 Camera on screen" and "🖥 Share screen" (where the browser supports it). The host's camera or screen goes onto the big screen of the room they're in (`G.live.nearest`: the zone's screen, preferring big ones), replacing that screen's film. The room film drops to 12% volume while live.
        - The video is sent peer-to-peer (`net.video`, Trystero addStream; new arrivals get it too). Visitors far away get "Ben is live · Go watch". It stops with "⏹ Stop live", via the browser's own "Stop sharing", or when the host stops hosting. The voice stays on the MIC.
        - Peer-to-peer works for small groups (about 6–10 viewers); bigger events need a relay (e.g. LiveKit) or a YouTube Live embed.
      - Fox Animoji (`engine/gallery-face.js`, ☰ → 🦊 Fox copies my face): face-api (vendor/face-api: tiny face detector, 68 landmarks and the expression net, ~2.3 MB, loaded only when turned on) runs on the visitor's own device.
        - Head yaw, pitch and roll come from the landmarks (yaw and pitch calibrated over the first 6 frames). Blink comes from the eye aspect ratio, mouth openness from the inner-lip gap, and the mood (happy, excited, surprised, sad, stern) from the expressions.
        - The fox gets `userData.faceCtl` (fox-kit animFox uses it while it's fresh, < 1.5 s). Only six small numbers about 10× a second go to others (`{k:'face', f:[…]}`); no video is ever sent.
        - A small mirrored preview shows "Fox copies you · stays on this device". It switches off when the tab is hidden.
      - Voice ignores video streams; the live module takes them.

## Artist voices on the art (3 Oct)
- 69 artist voices cut from the artists' own interview videos: `gallery/audio/art_<n>.mp3` (main gallery, index into gallery.json `arts`) and `wing_<a>_<p>.mp3` (New Artists Wing). Linked by `au` on each artwork in gallery.json.
- Found with YouTube auto-captions + Whisper (base.en model Ben downloaded to Documents\ggml-base.en.bin; run with pywhispercpp). Every clip re-transcribed with Whisper to check first/last words. Fades (0.08 in / 0.3 out) + loudness levelled.
- Art panel: plays the artist's voice when it opens (☰ "Play the artist's voice when I open art", on by default), "▶ Hear <name>" button to replay/stop, stops on close; "Read aloud when I open art" follows after the voice.
- Story clips (`aus:1` in gallery.json, button reads "Hear <name>'s story"): where the wall quote isn't spoken, a related passage from the same interview: Delric Beauty in the Blurry, Doreen yoga teacher, April Pathways Unveiled, Bill Pedals of Freedom (geese over the driveway), Shardasia Joyride + Embracing Unity, Marcus Rhapsody in Blue (music as communication), Ben Walk Through Fear ("blindness or not, I'm going to make films").
- AMB wing photo boards (On Stage, The Ensemble, Practice, Together, Rehearsal, Bright Future) now play story clips `ambb_0..5.mp3` from the AMB film (parents, David Pinto) and the Acabella interview.
- April & Melissa "Reflections of Sisterhood": story clip art_10.mp3 = Melissa's Honduras crabbing memory from Eyes on Sedona Skies ep.3 (Blind CAN Film Festival, ~15:11).
- Still silent: the allies (no recordings).
- Video versions of each clip for Ben: Desktop\BCP -VIDEOS for CLAUDE\Quote clips\.

- AMB wing end screen now plays `gallery/video/amb_acabella.mp4` (Acabella performance, 480p re-encode). (The old main-hall AMB screen sat in the carved north annex, so it never shows.)
- Morten's room: the small screen by the Mirror (vids[15], interview poster) now plays his interview `gallery/video/morten_bonde.mp4`; the big angled screen (vids[16]) keeps the meditation.

## Meet the artist (3 Oct)
- Every artist bio board plays the artist introducing themselves (`gallery/audio/bio_<name>.mp3`, first seconds of each interview; AMB = David Pinto; April & Melissa = Melissa). Panel kicker reads MEET THE ARTIST, button "Meet Dave". After the voice ends the bio scrolls slowly (any touch/wheel/key stops it); on wide screens the photo stays put (sticky) while the text scrolls.
- New Artists Wing bio boards now show a portrait (`gallery/img2/bio_<name>.webp`, grey frames from their interviews) + voice.
- `vn` in gallery.json overrides the first name on the voice button (Melissa, David).
- Fixed the spelling RICKY RIZUKA -> RICKY RUZICKA on his labels.

## Welcome plaza rebuilt (3 Oct)
- One furniture family (gallery-remodel.js `FRONT`, `buildKiosks`, `lectern`): screen stands on two slim legs with a thin ink bezel and the red rule; reading lecterns (slim blade on a floor plate); free-standing exhibition panels on twin legs.
- Layout: lecterns flank the spawn ("How to move" at z -2.7, the guest book at z +2.7, both turned to the spawn); an avenue of screens facing in from both sides (welcome film + Tools at x -3.6, Ally tips + Spectrum at x -9.6, z ±7.7, turned a little toward arriving visitors); big panels along the plaza edges (BCP intro ×2 at x 0.6, Blindness Tip #1/#2 at x -8.6, z ±12.9). The bridge is now clear.
- Removed: the big "to move" cube (GLB, carved), the bulky kiosk columns, the welcome totem, the intro and tip boards that floated past the rails (carved; rebuilt as panels). gallery.json: vids[0] moved/turned, edu points moved (r 2.4), notes.guestbook p/face.

## Slim bio walls, quiet while viewing art, cane shirt (Oct 3)
- The 17 artist bio blocks (6.4 x 6.6 m with a black band) are carved out of the building (GLB only, regions in `gallery.json` `bioWalls[].carve`) and rebuilt by `buildBioWalls` in `engine/gallery-remodel.js`: a 3.3 m wide, 0.2 m slim wall cut to the bio card, floating on a dark base with a thin ink cap. The bio card is on the front; on the back, the square portrait (2.5 m, now a frameless canvas) under a black name strip. The old name titles were removed from the data.
- Opening any panel (artwork, bio, learning) sets `window.HUSH`: the room film pauses (and resumes where it left off), ambient sound fades out, and other visitors' voices are muted until the panel closes.
- Cane avatar: the BCP logo is back across the shirt's back. The wheelchair avatar keeps the art on its back, since its backrest carries the logo.

## Running without crashing (Oct 3)
- Running made the gallery load ~14 signs every quarter second, start a room film at every doorway it passed, and keep every wing's paintings in memory for good. Now a smoothed pace (`St.pace`, > 5.4 m/s counts as running) holds the heavy work back: 4 signs per tick instead of 14, films only start once you've been in a room 1.5 s, living paintings don't start, and wings/rooms load closer (70/55 m instead of 110/90).
- Wings and rooms let their paintings go when you're far away (`unload()` in `gallery-wing.js`, wing > 160 m, rooms > 170 m) and load them again as you come back.
- Your spot is saved every 3 s, so if the browser reloads the tab after a crash you come back where you were (on top of the existing graphics-reset recovery).

## Wear your camera: screen head and face mask (Oct 3)
- ☰ "Your fox" now has three camera options side by side: 🦊 Fox copies my face (stays on the device, as before), 📺 Screen head, 🎭 Face mask. One at a time; a note under them says which ones others can see.
- `engine/gallery-camhead.js`: the camera is drawn into a small canvas (320x240 for the screen; 240x270 around your face for the mask, the face found with face-api's tiny detector) and that canvas stream is sent to everyone (gallery-net `face` channel, stream metadata `kind: 'face'`; live and mic streams are now tagged `live` / `mic`). Event `{ k: 'camhead', mode }`. Stops when the tab goes to the background.
- `gallery-game.js` `wearCam`: screen = an ink TV with the picture and the red rule replacing the whole head; mask = the picture on a soft oval shell where the fox's face was (snout, nose and painted face hidden; `fox-kit.js` now tags those as `P.faceParts`). Ears, body and outfit stay.

## Fox Studio + all-over art tee (Oct 3)
- `engine/gallery-studio.js`: a booth on the welcome plaza at (5.0, 8.2): round "FOX STUDIO · DRESS YOUR FOX" mat, ink backdrop with the sign and three art tees on a rail. Step on the mat → panel (right side on desktop, bottom sheet on phones) with Look (Art tee · Art suit · Fox tee · Vixen tee), Shirt art (every wix_ artwork, Walk Through Fear first, lazy thumbnails), Gear, Fur (the 9 palettes), Your camera (Fox copies me / Screen head / Face mask). While open, your fox faces the plaza and the camera swings slowly side to side (`G.studioCam`, view offset keeps the fox in the free part of the screen).
- Choices save to `pref.look / pref.extra / pref.style {pal, art}` and go out in the profile, so others see them; a saved style is no longer replaced by a random one when others are in the room.
- All-over art tee: look `'wrap'` (`makeSuitFox(ex, st, true)`, same tuned cane/chair rigs). `fox-kit.js` tee takes `prints.wrap`: one lathe round the whole shirt; `wrapArt()` draws the picture across the front half, mirrored out to the sides so it meets seamlessly at the back. Also in ☰ as "Art tee". The entry avatar picker keeps the art tee if you chose it.

## Front cleared (Oct 3, late)
- The welcome film is now the only screen out front: a big 5 x 2.8 m screen on an ink pier in the lake, right-hand side of the bridge (x -19.5, z -6.4), halfway to the eye, turned to the plaza. Its zone runs from 4 m out on the platform (x -9) to the eye (x -27), so you can watch from the platform's edge.
- Tools, Ally Tips and Spectrum stand back along the plaza edges (-4.25, +12.9), (-4.25, -12.9), (5.2, -12.9), facing in; edu points moved with them. The guest book lectern moved to the west edge (-11.8, 8.2). The "How to move" lectern is gone (the help is in ☰ / the intro). The Fox Studio stays at (5.0, 8.2).

## Hope Floating in Braille, rebuilt (Oct 4)
- The old piece in the middle of the entry hall (sunken pool, floating dots, white logo frame, label) is carved out (CARVES 'braille piece' + 'braille pool water', a region limited to the mesh `Cube__30__1` via the new `only` field) and the floor patched.
- `engine/gallery-braille.js` rebuilds it against the hall's left wall (+z, x -54): a stone-rimmed tiled pool with drifting ripples and two layers of caustics, H-O-P-E as four floating braille cells that bob; a black label band with the title and the braille; behind the pool a glass block (steel frame, bright edges, sheen) with the BCP logo suspended inside in black; an LED strip between the glass and the leaning wall, a light wash up the wall and a glow spilling onto the water. The art prompt moved to the front of the pool; the tall intro poster on that wall was raised 1.6 m to clear the glass.

## Swap: braille island on the plaza, Fox Studio in the entry hall (Oct 4)
- 'Hope Floating in Braille' is now a free-standing island on the welcome plaza at the end away from the museum (centre x 4.4, z 0, glass running north-south): the glass logo block in the middle, a pool on EACH side with H-O-P-E floating in braille (reads correctly from both sides), labels on both outer rims, LED strips in the plinth and a glow behind the logo for each face. About 5.5 x 7.4 m; walk all round it; the path to the bridge stays clear. The art prompt sits at its centre (reachable from both sides).
- The spawn moved to x 0.4 (in front of the island, facing the museum).
- The Fox Studio moved into the entry hall against the left wall (-54, 9.6), where the braille piece briefly stood.

## The eye as stained glass, uplit from the lake (Oct 4)
- `gallery-eye.js` GLASS_FS: the white of the eye is now a rose window: rings of curved panels (leading waves slightly; more panels per ring going out; some split on a diagonal) in dark lead came. Deep cobalt / ultramarine / teal round the iris, then light half-clear blues, frosted pale and opal near-white panels (more white toward the frame), a rare pale gold; each panel has cathedral-glass streaks and seeds and is darker at its edges. At night every panel glows its own colour.
- Four uplights stand in the two water pockets either side of the bridge (x -19 / -21, z ±5.6 / ±8.8) throwing angled beams (additive cones) up at the top of the eye; the glass brightens where they land (`uHit`), and mist (70 puffs on phones, 150 elsewhere) rises off the water and lights up inside the beams. Faint by day, strong at night.
- Handrails on the bridge into the eye and the ramp down inside are now deep cobalt (0x15309a) to match the stained glass; the plaza's own rails stay red.
- Front opened up: the white shell walls that rose either side of the plaza and the lake (GLB `Arch__1_` and `TRIM___right___White_ext___2nd`, x -26.2..7.6, |z| > 13.75, above deck level) are carved away, so the city skyline, the lake and the cherry garden show on both sides of the stained-glass eye. The eye, its frame and eyelid, and everything at deck level stay.
- Stained glass everywhere we had glass: `engine/gallery-stained.js` (`stainedGlass({cell, y0, y1, plane})`) is a flat-glass version of the eye's style (irregular leaded panels in world space, deep blues low, light blues / opal / near-white higher, rare pale gold, streaks, seeds, glows at night via `setStainedNight`, hooked into the world's night updater). Used for the rail panels on the bridge and the ramp into the hall (deeper blue toward the bottom of the ramp) and for all the tall windows in the main hall (`data.windows`).

## Stained-glass roof + HOLT for HOPE in braille (Oct 4)
- The main hall's painted-sky ceiling and roof sheet over the bays between the beams are carved (CARVES 'main hall ceiling', `only: 'Arch'`). `engine/gallery-roof.js` puts stained glass in all 8 bays (x -116..-77), each a different design from `roofGlass` (gallery-stained.js): mosaic, ripples, harlequin, sunburst, waves, rose, harlequin, ripples.
- In the second bay (just past the hanging MAIN GALLERY sign as you walk in): HOLT / for / HOPE in braille (grade 1 letters), three centred lines of glowing gold-white glass dots with halos on a deep blue plate, laid out to read from below while facing into the hall. Beneath it on the floor, its braille shadow inside a pool of coloured light, with a faint shaft from the glass.
- Hotspot on the shadow: "LEARN: BRAILLE AND BRILLIANCE" opens the panel with the braille alphabet card (A-Z, dots over each letter, HOLT for HOPE at the foot) and the text about Steve Holt (co-creator of the Blind Canvas Project, Creative Director of sponsor Ora Clinical), with Read aloud.
- Ben asked for the NEW stained glass to be more see-through: rails, windows and roof glass alpha x0.55 with the lead came solid black and fully opaque. The eye facade stays exactly as it was.

## The eye platform over the music room + the lift (Oct 4)
- Above the music room the ceiling opens in an eye shape and the iris floats in it: a ring floor at y 14.81, pupil hole r ~2 at (-205.6, -0.5). Its tall outer rim and the white tube round the pupil are carved (CARVES 'iris platform rim + pupil tube', `only` Arch / Arch__1_, y > 15) so it's an open walkway.
- `engine/gallery-elevator.js`: a round lift (r 1.95, ink deck with a blue glowing edge, "ELEVATOR · FLOOR 2 · THE EYE" ring) on the music room floor under the pupil, a faint light shaft, and on the ring a curved stained-glass rail round the outer edge (glass wrapped round a cylinder: `stainedGlass({ plane: 'cyl', cyl })`) plus a glass rail round the pupil with a gate on the +x side whose leaves close while the lift isn't up (and the code holds you back from the hole). Prompts: "Take the elevator to floor 2" / "Going up to floor 2…" / "Take the elevator down" / "Call the elevator (up)". Riding holds you still on the deck; ~5 s for the 18 m.
- Music room floor: a wood-inlay eye round the lift (shader in gallery-elevator.js, replaces the blue floor ring): sunburst teal-stained iris veneer (24 leaves), ebonised navy limbal band, bleached maple white with grain along the eye and fine plank joints, dark stringing lines; an almond 24 x 12.4 m along z (matching the ceiling's eye opening), solid at the lift and fading into the oak toward the corners. Satin, unlit-looking flat colour toned to sit with the floor.
- The lift deck's centre (the pupil) now carries the Ora logo and tagline (sponsor), white on the black deck (drawn with 'lighten' so the card's black melts into the deck), inside the ELEVATOR · FLOOR 2 · THE EYE ring.
- Skywalk (`engine/gallery-skywalk.js`, 4 Oct): a ramp from the 2nd floor (x -145.4, y 5.66, between the Deja Hadley and Craig Ellis interview screens) up 9 m over 54 m to the eye platform ring (x -199.3, y 14.81), in the bridge's style: oak deck, ink fascia, deep blue handrails, stained-glass side panels, ink posts. The two interview screens are smaller (2.8 x 5 m) and moved apart (vids 21/22 at z -6.95 / 6.15, new slim ink frames); the old frames (`mesh_35`) and the middle of the 2nd floor's low edge wall (`mesh_32`) are carved and the wall rebuilt in two parts with a 2.9 m gap. The ring's outer rail now opens toward +x where the skywalk lands. Also fixed: the blue handrail on the ring's rails had been left unplaced (a line merged into a comment).
- Eye platform, 4 Oct (2): the ring floor is now stained glass like the facade's eye (`irisGlass` in gallery-stained.js: rings of leaded panels in cobalt, teal and ultramarine, light-teal flecks round the pupil, gold flecks, a navy limbal band; slightly see-through; lead solid black), with ink fascias and its own collision ring. The model's teal ring (Arch / Arch__1_ at y 14.4–15) is carved. From the music room it reads as a stained-glass iris floating in the eye-shaped opening.
- Two lifts in one shaft (gallery-elevator.js): the floor 2 lift rests in the pupil, level with the glass; the floor 1 lift rests on the music room floor. Ride down from floor 2: it sinks and sets down on top of the floor 1 lift, then goes home 2.5 s after you step off. Ride up from floor 1: the floor 2 lift first rises 3 m out of the way, the floor 1 lift comes up level with the ring, and once you step off it goes home and the floor 2 lift settles back into the pupil. Prompts: "Take the elevator to floor 2", "Take the elevator down to floor 1", "Take the elevator up to floor 2", "Call the elevator (up)", "One moment…". `G.elevator.state` exposes both lifts.
- Music room ceiling smoothed (`engine/gallery-eyelid.js`, 4 Oct): the eye-shaped opening's 20-sided rings (2.3 m black band, chunky white upstand, ceiling deck, black bands, tall faceted outer wall, the old support out to the iris) are carved (CARVES 'eyelid rings', a new elliptical region type `ell: [cx, cz, rx, rz], y: [y0, y1]`) and rebuilt as true ellipses on the same footprint (centre -208.08, -0.45; inner 9.6 x 17.8, outer 13.92 x 25.77): a slim white eyelid with a rounded ink lip and a blue cove light washing its inner face, a white soffit with oak on top, and an outer wall of stained glass (facade colours) over a white base with an ink cap rail and slim mullions, open where the skywalk passes. The iris platform now hangs from the eyelid on eight slim steel spokes. The 2nd floor's black ceiling brim round the void (a 12-sided edge) is faced with a smooth band. Removed the lone stained-glass pane that stood in the middle of the music room (gallery.json window at z 11.34, in front of an artwork).
- The outer ring's big windows (`engine/gallery-ringglass.js` + `artGlass` in gallery-stained.js, 4 Oct): the 21-sided ring round the back of the museum (beam underside 16.59 m) gets a pane in each opening that faces the gardens, from 4.3 m (above the ground-floor doorways) to the beam, with a slim ink transom. Each holds a stained-glass version of an artwork as a big square medallion (every small pane takes the art's colour at its centre, a little richer; ink frame, gold fillet; leading fades with distance so it doesn't shimmer), set in the facade's blue-and-opal leading; flipped where needed so the picture reads the right way from inside. Art (opening index -> title) is in `RING_ART`: The Power Within, Flow State, Midnight Melodies, Lighthouse of Hope, Rhythm of Life, Roots of Kinship, Rhapsody in Blue, Pour In The Love, The Visions That We Share, I Am Blind Like My Hair Is Brown, Reaching Past Blindness, Goalball Is..., Joyride, Pedals of Freedom, Walk Through Fear. Openings 0 and 18 (crossed by the ring's diagonal braces) get plain leaded glass; 8–10 (main-hall side, where the skywalk crosses) stay open. Art textures load (256 px) when a visitor is within 120 m. `G.ringGlass.panes` for debugging.
- HUD, 4 Oct (Ben's test notes): vision simulator panel trimmed to three rows (one line of condition chips: Tunnel · Cataracts · Macular · Floaters · Glaucoma; the red Learn button; Severity slider + Back). Removed: Guided look, the header line, the condition description (still read out by the live region), the hint line. New LOOK AROUND eye button, always bottom right (gallery-game.js): tap = first person on/off (also the V key; button fills red when on), press and drag = look around, and letting go swings the view back to the normal angle (behind the fox, or the simulator's forward view). First person: camera at the fox's eyes, fox hidden, walking still turns you. The action prompt (#act) moved up to sit above it. Joystick: round base and knob, with N/E/S/W arrows round the middle.
- Vision panel polish (4 Oct): condition chips centre their text and scale it to the screen (clamp 9–13 px) so every name sits inside its box; the Learn button is blue (#1f4fd8, blue pulse).
- Photo + voice notes (gallery-notes.js, 4 Oct): every note composer (spot notes, replies, artwork notes, guest book) has 🎙 Record voice (MediaRecorder, up to 15 s, ~16 kbps opus/aac) and 📷 Add your photo (camera on phones via capture="user", or pick a file; centre-cropped to 160 px JPEG). Both ride inside the note itself on the Nostr relays (no new storage): limits IMG_MAX 24k / AU_MAX 56k characters. A note with a photo or voice is hidden from others until the admin approves it (new kind 4253 'approve' event from an admin key; admin sees an Approve button on the note); the author sees it at once, marked "waiting for approval". In the world the card shows the photo in a red ring and 🔊; walking past plays the voice (when Read notes aloud is on); panels have a blue ▶ Voice button. Text is optional when there's a voice clip. Untested against the live relays from here (they're unreachable in the test box): if a relay refuses big notes, those notes reach fewer people.
- LEAVE NOTE button (4 Oct): a speech-bubble-with-plus circle just above LOOK AROUND (bottom right, same style); opens the note composer for the spot you're on (text, voice, photo). Hidden in the vision simulator and the Fox Studio. #act moved up to 154 px to clear both.
- ACTION button (4 Oct): bottom right, under LOOK AROUND (84 px) and LEAVE NOTE (152 px). Its word follows nearest(): VIEW ART (+ title, note count), READ, READ NOTE, SIGN GUEST BOOK, TRY IT (vision spot), SET SEVERITY, DRESS UP, LEARN, GO UP / GO DOWN / CALL ELEVATOR / WAIT, SIT / STAND UP, FULL SCREEN; ACTIONS (dim) when there's nothing. Replaces the red #act prompt (kept hidden; E still works). New: SIT on the plaza and garden benches (Pl.sit; fox-kit sit pose, legs out; push the stick or tap STAND UP to get up; not offered in the wheelchair), and FULL SCREEN for the room's film (the shared video moved into a full-screen overlay with sound, ✕ / Esc to close).

## The park campus (Oct 4, night)
- Layout (`CAMPUS` in `engine/gallery-garden-plan.js`, shared by scenery, game and petals): you now START in the middle of the cherry blossom park (x 33.5, z 0) beside the big tree, facing the museum's eye facade (west). BLIND CAN CINEMA is behind you (east, x 74..90), the WHY House on your left (north, z 25..41), the Academy of Music for the Blind on your right (south, z -23.6..-57.4). The north/south walks now leave the ring at ±120° and curve round the buildings; short forecourts lead to each door; the petal river moved west (x 60 ±6); trees and lanterns keep clear of the buildings; petals don't drift indoors. The two flags moved to the ring's west side (±135°), framing the way to the museum.
- Hope Floating in Braille (`gallery-braille.js`): now TWO pools, one either side of the walk between the sign arch and the plaza (x 13.5, z ±4.75), each with its glass logo block on the far side and the floating H-O-P-E between the glass and the walk. Its artwork card reads from beside either pool. The plaza spot is empty.
- `engine/gallery-campus.js` (new) builds:
  - BLIND CAN CINEMA: cream art-deco front (pilasters with red lines, stepped tower with a red/gold sunburst), marquee with chasing bulbs, "BLIND CAN CINEMA" crown, a lightbox with NOW SHOWING + the title, poster cases (now showing / up next), a ticket booth, a red carpet with brass posts and ropes. Inside: red carpet, red walls with sconces, a starry ceiling, curtains, a stage and a 16:9 screen; five rows of red seats (two blocks, centre and side aisles). Sit in any row (ACTION: SIT, "Cinema seat") to face the screen. The film plays while you're inside (ACTION: FULL SCREEN, "Now showing · title"). It runs a programme (`CINEMA_PROGRAM`): Blind Artists Use A.I. to Make Art (blindcan_capitol), Goalball, The Blind Canvas Project (teaser), Blind Canvas × Ora. When a film comes round to its start while you're inside, the next one goes on and the marquee and posters change. Poster stills: `gallery/img2/cinema_*.webp`.
  - The WHY House: a gabled clapboard house with a charcoal roof and red ridge, a round blue window with a red "?" in each gable, a porch canopy, warm windows and "THE WHY HOUSE" plate. The guest book moved to its porch (left of the door). Inside: "WHY DO YOU CREATE? WHY DO YOU CARE?" over the back wall, 26 story frames (back wall 5x2, each side 4x2), a rug, two benches facing the stories, and the story stand by the door.
  - The AMB building's outside: an ink parapet over the door with the AMB logo and name, a piano-key frieze round the top of the walls, an ink plinth, plants either side of the door.
  - Museum: the AMB room's old doorway (north end of the Wall of Why hallway) is walled off with a board ("The Academy has moved"); a board on the low east wall across from the Wall of Why portraits says "Add your own why". Both give ACTION: TAKE ME THERE (fade + land at the building's door). The Wall of Why's Learn panel also has "Take me to the WHY House".
- AMB room (gallery.json rooms[amb]): moved to the park, O (40, 0.06, -24), L 33, `bayW` 14.5 (new buildWing option, so all three artists' bays fit), `park: true` (always drawn, it's a building now). The film plays inside it only (the hallway extraZones are gone).
- WHY House stories (`gallery-notes.js`): a new note type 'why'. The story stand (ACTION: ADD YOUR STORY) and LEAVE NOTE inside the house open the story panel: text + voice + "Add a photo (you or your art)" (the whole picture, up to 360 px, ≤ 40 KB; shrunk to the normal 24 KB if a voice clip is added too). Stories fill the frames newest first; empty frames say YOUR STORY HERE. Stand in front of a story: ACTION READ STORY opens it (and plays the voice). Photos and voices wait for admin approval as before.
- Place label: The Park / BLIND CAN Cinema / The WHY House / Academy of Music for the Blind.
- Draw calls: the campus adds ~10 from the spawn view (merged); the spawn's view of the whole museum costs ~800 calls, same as standing there before.
- Try this: start → walk to each building; sit in the cinema; add a story in the WHY House (with a photo of your art); sign the guest book on the porch; in the museum, try the AMB door sign and the Wall of Why board.
- Signpost (4 Oct, late): an oak post with a red ball top just ahead-left of the start (`SIGNPOST` 29.6, 2.1), four cream arrows pointing at THE MUSEUM, BLIND CAN CINEMA, THE WHY HOUSE, ACADEMY OF MUSIC. Walk up: ACTION WHERE TO? opens a panel with a big button per place (your fox walks you there along the paths, `SIGN_DEST` routes; move the joystick to take over; a hint shows while walking and you're told when you arrive) and GO NOW (jump straight there). Game: `G.campus.walk(to, onEnd)`, `stopWalk()`, `walking()`; walking hops past anything it gets stuck on for 2.5 s.
- Phone speed pass (4 Oct, late): (1) small far things skip drawing: every 0.25 s, any mesh under 2.5 m across that is more than 28 m away and smaller than ~0.7° on screen moves to draw layer 1 (the camera only draws layer 0) and comes back at 0.83°/28 m; uses layers, so nothing that hides or shows itself is disturbed. Add `?detail=all` to the URL to switch it off for comparison. (2) The Hope pools' 26 floating dots are one instanced mesh and the rest of the pools merge. Opening view: ~877 → ~620 draw calls; deep in the museum ~505 → ~360; no visible difference in side-by-side screenshots.
- Park map (4 Oct, late): ☰ → "🗺 Park map · go to a place" (top of the menu). The campus drawn as you see it on arrival (museum at the top, cinema at the bottom, WHY House left, Academy right, the ring, the big tree, the Hope pools, the signpost) with you as a red dot with a heading arrow (clamped to the edge when you're deep in the museum). Tap a building or its row: in the park your fox walks you there (GO NOW jumps); anywhere else it takes you straight there.
- Friends see you sit (4 Oct, late): the multiplayer state carries a 7th value, sitting (`localState()` → [x, y, z, face, speed, air, sitting]); remote foxes take the seated pose (fox-kit `u.sit`) on benches and cinema seats. Older clients ignore it. Watch Together in the cinema names the film ("Goalball" in the cinema) instead of "the welcome screen".
- Playable grand piano (5 Oct): in the Academy of Music building, between the visitors' bench and the film wall (40, -46.6), keyboard towards the door. Gloss-black case with the lid propped open, soundboard, brass castors and pedals, music desk with a score, 5 octaves of instanced keys (C2–C7) that dip as notes play, an AMB plate, a bench (`campus.piano`). ACTION PLAY PIANO sits you on the bench and opens `engine/gallery-piano.js`'s keyboard along the bottom of the screen: as many 44 px+ white keys as fit (8 portrait, 18 landscape), multi-touch and glissando, ◀ ▶ octaves, PEDAL (sustain), ✕ DONE (stands you up); on a computer A W S E D F T G Y H U J K O L P ; play, Z/X octaves, space = pedal, Esc = done. The sound is a WebAudio piano synth (triangle + 4 partials with pitch-dependent decay, a brightness filter that closes, a filtered-noise hammer, a short room echo). Notes go to everyone on the 'ev' channel ({k:'pno', m, on, p}); others hear them softer with distance (silent beyond 40 m or another floor), see the 3D keys move, and get "Ana is playing the piano" once.
- SHOWTIME at BLIND CAN CINEMA (5 Oct): the cinema now shows Ben's "This Weekend Is Blind CAN Film Festival" (10 min; `gallery/video/blindcan_festival.mp4`, 640x360 ~370 kbps so it fits the 30 MB upload limit; poster still `img2/cinema_blindcan_festival.webp`) at fixed showtimes (`CINEMA_SHOW` in gallery-campus.js: a show every 15 minutes on the clock, :00/:15/:30/:45). The film is locked to the clock (`showtime()`), so everyone in the cinema sees the same frame (seeks at most every 3 s if you drift > 2 s); between shows it waits at the start and the screen shows a countdown ("NEXT SHOWTIME 1:15 PM · 3:20", the film's title, "Take a seat · everyone watches together"). The marquee reads NOW SHOWING · STARTED 1:00 PM or NEXT SHOWTIME 1:15 PM · IN 3:20; the left poster case is the film, the right one lists the next five showtimes. One minute before a show, everyone not in the cinema gets a SHOWTIME card ("Take me there" walks you if you're in the park, jumps you otherwise; at most every 25 minutes); people inside hear "The show starts in one minute". Watch Together isn't offered in the cinema (already in sync). The old four-film programme is retired for now (CINEMA_PROGRAM = [CINEMA_SHOW]).

## Comment spots (Oct 11) — DONE
- Floating notes can now only be left on 7 COMMENT SPOTS (`engine/gallery-comments.js`): a raised sunflower-yellow pad with an ink rim and a speech-bubble smiley, plus a sign "YOUR COMMENTS HERE 🙂 · STEP ON · TAP LEAVE NOTE".
- Spots (none where a film plays): welcome deck (2.4, 9.6), ring path NE + SE, north walk by the WHY House, south walk by the Academy of Music, inside the WHY House, the Wall of Why hallway.
- Step on: LEAVE NOTE button appears, ACTIONS says LEAVE A COMMENT, screen reader + hint announce it. Step off: button hides.
- ☰ → "Comment spots" finder (nearest first, Take me there); yellow smiley squares on the park map.
- Also fixed: 3 code lines swallowed by `//` comments (gallery-game.js x2, gallery-campus.js) that stopped the gallery loading.
- Tested 390x844 + 844x390, no errors.

## Walkways + phone draw calls (Oct 12) — DONE
- Clear walkways: the 2 plants on the main hall ramps are gone; the flags stand just outside the ring path (CAMPUS.flags; trees/lanterns still laid out round CAMPUS.oldFlags so nothing reshuffled); the name sign is narrower (14 m) with its posts inside the ring. Walk tests: all 4 ramps, ring loop, every park walk, museum entrance: no snags.
- Occlusion (gallery-game.js, occCull): everything is grouped in 14 m tiles (streamed art: one tile each); rays from the camera against the walls (glass, tree cards, invisible edges, small props don't block) skip tiles no ray reaches. Position-based (turning never pops). Tiles within 12 m always draw. ?occ=off to compare.
- mergeStatic: per-face-material boxes now merge too; merges stay in 40 m cells. Also merged: comment spots, skywalk, music room ceiling. iPads (desktop UA) now count as phones.
- Draw calls (phone portrait, before → after): 2nd floor top of ramp 316 → 160, 2nd floor south 467 → ~320, north 491 → 347, main hall 317 → 205, music room 627 → 339, park start 607 → 479.
- Still big: the fox itself (~35 draws per fox), the park seen through the entrance tunnel from upstairs (it really is visible).

## Phone pass (Oct 12, afternoon) — DONE
- Art loads as you go: the 9 MB img.pack is no longer downloaded. Each image is its own file in gallery/img/ (full) and gallery/img-m/ (phones: max 512 px, ~40% of the bytes, a quarter of the memory). The art viewer panel always shows the full one. img.index.json is still read (the shirt picker's art list). img.pack can stay in the repo (unused).
- Start-up download (iPhone): ~14.5 MB -> ~6.8 MB (raw); time to the Enter button in tests 23 s -> ~12-15 s.
- Phones keep less art loaded (50 m instead of 75 m; rooms/wing unload at 105 m). Memory tour: textures level off ~200 instead of climbing.
- three.module.js is now the official minified r160 build (same code). gallery.glb textures recompressed (3.07 -> 2.72 MB; names/structure untouched).
- Fox: body/legs/arms/tail are 2 skinned meshes (fur/clothes with baked vertex colours + outline); head unchanged (camera head/face mask still swap it). 53 -> 28 meshes per fox. ?noskin = old way.
- Controls: 'forward' is latched while you hold the stick (camera swinging behind no longer steers you). Camera rails on all 4 ramps + their top turns (railSteer, RAILS list); ☰ Guided camera on ramps ON/OFF (bcp.guided). TODO: the turn round the big screen once Ben says which screen.
- Lite mode: ☰ toggle (bcp.lite) + auto-on if still >40 ms/frame at 1x for 5 s. 1x res, sooner detail cull, haze/far at ~330 m, art/labels draw shorter, and inside the museum the park is skipped. 2nd floor (iPhone): ~304 -> 164 draws.
- Roof braille dots: 70 meshes -> 2.

## Oct 12, evening — DONE
- Lite mode: only when needed (off by default). Auto-on after the first 10 s if frames stay >40 ms at 1x, or >55 ms at any resolution, for 5 s. Turning it off in ☰ is remembered.
- Camera rails round the big screen at the front of the main hall (north and south ways round, then on behind it towards the west ramps). ☰ label now "Guided camera (ramps, big screen)".
- Fox head merged too (second skinned pass attached to the head, bones = head + ears; camera head / face mask still hide it). Meshes per fox: suit+cane 49 -> 10, art tee 36 -> 10, wheelchair 85 -> 23.
- Note: the PC bridge adds a C2PA chunk (~5.7 KB) to every .webp it writes; pixels identical.

## Oct 22: walls
- Body radius 0.32 → 0.42 (BODY_R; ?body= to test) so the fox's shoulders, arms and tail never sink into a wall.
- pushOut(): each frame, feel round in 12 directions at 0.5/1.0/1.55 m and step back out along the wall's normal (never into another wall). Stops shallow-angle slides from slipping through thin walls and glass (e.g. the window nook by April & Melissa's poster).
- Leaving a vision spot or standing up from a bench also stops short of walls.
- Tests: push.js (16k shoves into walls: crossings 11 → 0, body inside a wall 1,840 → ~20, stair edges only); walkscan at 0.45 loses no areas; drive routes unchanged.

## Oct 22 (afternoon): hedges, piano, band corner
- Park hedges: their invisible walls now cover the whole hedge (1.1 m deep), so you can't walk into the leaves.
- Standing up from any seat steps the way you face only if it's clear, else behind / to the side (the piano bench faces the piano, so you used to stand up inside it).
- AMB band corner: a drum kit east of the piano (drum stool, ACTION PLAY DRUMS: 9 big pads, keys SPACE F D E G H K R U) and a red electric guitar on a stand with an amp west of it (guitar stool, ACTION PLAY GUITAR: the guitar moves into the fox's lap; 9 chords, swipe the strings / STRUM ▼▲, DRIVE; keys 1-9, SPACE/↓/↑, A-H strings). Synth sound (drums: sweeps + noise + 808 metal; guitar: Karplus-Strong). Everyone hears it by distance, sees drums jump and strings shake. Code: gallery-campus.js (band), engine/gallery-band.js (sound + panels), gallery.html (actions).

## Oct 22 (evening): AMB stage room, no rails
- Camera rails removed completely (RAILS/railSteer, the ☰ Guided camera button, the onRail announcements), and the held-direction
  latch with them: movement is plain camera-relative again, as before 12 Oct.
- AMB second room ("The Stage", gallery.json rooms[amb2]): east of the main room (x 49.4-69.8, z -38.8..-24), through a doorway in
  the main room's east wall (buildWing sideDoor). Stage at the back (campus STAGE) with the piano, drum kit and guitar turned to face
  the doorway; title + AMB logo wall behind it. The Community artist moved there; the main room keeps AMB + On Stage, one artist per
  wall, every canvas with its text card beside it at eye level (buildWing hang).
- buildWing options: Wd, lip, frontWall, doorZ, sideDoor, hang; endVideo.extraZones take an optional gain.
- AMB film: heard through the main room and out of the front door (extra zone in front, reach 55), quiet in the stage room (gain
  0.18). Also fixed: room films were measured from the origin once their room was merged (near-silent); screens now use their p.
- Garden: trees/lanterns inside the stage room's footprint are dropped after planning (no reshuffle); petals avoid it (inBuilding).
- Fixed (22 Oct, late): room film screens were being merged into their room's meshes (12 Oct draw-call pass), so the film never
  replaced the poster (AMB showed only its logo card). Screens are now kept out of mergeStatic (userData.dyn).
- "Watch full screen" only shows within ~5 m of a screen (plus half its width) and in its own room, like walking up to a painting.
- Stage: drum kit 1.35x (stool normal size), instruments moved up to the front edge, real AMB logo on the kick drum, back sign
  "the YOU ARE IN THE BAND stage... step up and play" raised above the instruments (titleY).
- Stage room moved south (O z -40, 16 m wide) so its doorway sits right after "The Power Within" (the superhero painting) on the
  main room's east wall; east wall order: bio, Harmony of Vision, The Power Within, doorway, A Bright Future (hang gap item).
- The water either side of the bridge inside the eye is raised (gallery-world POOL, y -0.75, same water material) so you see it as
  you walk over into the museum; the uplights and mist moved up to its surface (gallery-eye WY).
- Stained glass clearer: stainedGlass/artGlass take an opacity (uOp) that also lightens the leading; building windows 0.45
  (gallery-game windows, ring art windows), bridge/ramp and skywalk rails 0.68.
- New Artists Wing split in two, 64 m each (2 bays a side): north off the hall's north corridor (Anthony Ferraro, Deborah
  Tramentozzi, Delric Pollins, Doreen Holmes), south at the end of the south corridor where the AMB's old room was (Michael Tubiak,
  Nikki Jeffords, Sophia Dunn-Walker). Removed the AMB leftovers there (the "Academy has moved" wall and sign, the hall AMB logo and
  board); the floor arrows now say NEW ARTISTS WING both ways; vision spots moved inside each half.
- Lift deck: the Ora logo turned to read from the music room's entrance side (+x).
- Skywalk: the music room's high glass band (GLB 'Arch', 12.56-14.47 m) crossed it at x -177.7 and stopped you at head height;
  carved (CARVES 'skywalk glass band') and rebuilt with an arched opening over the deck ('skywalk arch' in gallery-game.js).
- Morten Bonde's meditation screen (vids[16]) moved 1.7 m out from the wall and up 0.35 m: a slanted wall piece was cutting it.
- Trees: one landing on a roof is dropped (two had ended up on the New Artists Wing's south half); garden trees stand on the lawn
  (the big tree had been lifted 3 m by its trunk post).
- Signs on posts: thick boards with the post running up inside (comment-spot signs, the "see through their eyes" signs, the
  BLIND CANVAS PROJECT name sign), so no post crosses the words.
- WHY House: the story stand moved to the middle of the room on the line from the door; the gables' round windows show the
  Blind Canvas Project logo instead of the "?".
- BLIND CAN CINEMA rebuilt inside: a lobby (snack bar along the north wall with a menu board, popcorn machine, soda fountain; a
  rope line) and two theatres behind it, each through its own doorway with a SCREEN n sign showing its film and next show.
  Screen 1 (south): the Film Festival every 15 min; Screen 2 (north): Blind CAN's White Cane Commercial (gallery/video/white_cane.mp4,
  from Ben's upload, 60 s) every 2 min. Each screen is locked to its own clock (screen.show()); "film" labels follow the theatre
  you're in (cinema.showAt/filmAt). Staff foxes (gallery-game staff): one in the ticket booth, one behind the snack bar.
- Snack bar (evening): glass CANDY case in the counter front (two lit shelves of candy boxes), popcorn machine with kernels popping
  out of the kettle onto the pile, soda fountain on its own cabinet turned to face the door (lit BCP logo panel, four taps, drip
  tray), popcorn boxes and drinks with the Blind Canvas Project logo. The snack bar fox's job (gallery-game snackJob): scoop a
  box at the machine (it fills), set it on the counter, fill a cup at the fountain (stream, soda rises, lid and straw go on), set
  it out; seven places on the counter, oldest cleared when full.
- Cinema seats: 20 per theatre (2 rows of 10, centre aisle, rows 2.6 m apart), full-size seats (cushion, back, armrests), each
  its own seat to sit in; sitting turns you to the screen and looks at it (bench.look in sitOn).
- The walk-on FLOOR PIANO in the stage room (campus floorPiano, sound engine/gallery-floorpiano.js): 2 octaves C4-C6 of giant
  keys (white 0.5 x 2.2 m) on the floor in front of the stage, black keys at the stage end. Whoever stands on a key plays it,
  you and every other visitor, worked out from where each fox stands (no extra network messages); keys dip and light up in a
  colour per note; others' notes fade with distance. A sign beside it.
- Polish pass (22 Oct, late): checked walkability (no area lost, nothing reachable in the lake-splash zone), console clean at 12
  spots. The band instruments and the snack bar's moving props are only drawn while the camera is inside their building
  (campus `inside` list; ~110 fewer draws from the park); staff foxes hidden beyond 45 m. When someone else picks up the guitar
  it moves into their fox's lap on your screen too (band event 'gth'; holdGuitarFor; put back if they leave). The New Artists
  Wing's spare bay shows the Blind Canvas Project logo. The park map shows the AMB's stage room.
- Known: from the spawn facing the museum, a phone draws ~460 calls (the museum front, plaza and Hope pools all in view);
  Lite mode switches on if that's too slow.
- Start back on the welcome plaza (CAMPUS.spawn 2.5, 0, facing the eye); "the park" stop stays by the big tree (CAMPUS.parkStop).
- 'Hope Floating in Braille': one pool now (CAMPUS.hope), north of the walk at (13.5, 6.2), turned 90° so it reads facing the
  museum's eye; CAMPUS.pools kept only for the garden layout. Map updated.

## 22 Oct: mobile pass + longer view distance
- Art loads in further: phones 95 m (was ~60), desktop 140 m. Far paintings use small copies (gallery/img-s/, 146 webp, 780 KB) and swap to the sharp image within 42 m on phones (sharp everywhere on desktop).
- Wings/rooms load earlier (phones 80-95 m, desktop 110-130 m) and unload later, so nothing pops in near the player.
- Canvas text textures (signs, cards, panels, campus labels) are 60% size on phones and free their drawing canvas after upload (engine/gallery-texmem.js). Phone texture memory estimate 527 MB -> ~300-410 MB along a full tour, stable, no errors.
- Blind Canvas Project logo woven into rugs: the WHY House rug (gold on red, was a "?"), a navy runner in the cinema lobby between the ropes, and the drum rug on the AMB stage (campus logoRug helper).
- Community photos on bare walls (buildWing `community`): the south wing's spare bay now has the logo (smaller) with four community photos round it; both wings' end walls get a photo either side of the title. Each has an "OUR COMMUNITY" caption and can be viewed/read like the art.
- Screen readers: the 3D view is labelled, the joystick is hidden from them, and walking into a new place is announced ("You are in ...").
- Link preview: og/twitter tags + gallery/og-gallery.jpg (1200x630) so shared links show a card.
- Start view measured at ~420 draw calls on a phone (was ~466); further cuts would hide things you can see through the eye, so left as is.
- Fewer pop-ups for guests (22 Oct, late): 'Watch together', leading tours, 'show everyone my view' and the showtime pop-up are the host's only; guests only get invites from the host, the showtime is just announced for screen readers, and the comment-spot hint shows once per spot per visit.
- Assisted camera turn back (27 Oct), still no rails: the camera swings behind your fox whenever you walk (fully up to a right angle, fading only when walking toward the camera), and while the stick is held 'forward' eases slowly after the camera instead of jumping with it, so holding the stick to one side curves you round in a smooth arc. Let go or drag to look and the stick lines up with the screen again. Guided walks and tours swing the camera too.
- 27 Oct: no browser zoom (viewport user-scalable=no plus pinch / double-tap / ctrl+wheel / ctrl +/- blocked), so buttons can't be zoomed off screen.
- 27 Oct: new loading screen: the white Blind Canvas Project logo on a deep blue glow, and a card of five blindness tips (from the "Tips to be loved by the blind" kiosk) that turns over every 7 s (tap for the next). Fits 375x667, 390x844 and phones on their side (two columns).
- 27 Oct: the avatar choice is Joe or Jane, each a portrait drawn live from their own fox (G.portrait). Joe = the suited fox with his cane, Jane = the vixen in her chair; no mention of cane or wheelchair anywhere in the choice. ☰ has "Be: Joe / Jane"; Gear is None / Glasses.

## FROM CLAUDE DESIGN (29 Oct): gallery notes from its BUILD_PLAN

### WHY HOUSE RUG + STAND (Ben, 28 Oct; gallery-campus.js): the black BCP logo rug moved up to just inside the door (centre z0 + 5.4); the ADD YOUR STORY stand now right behind it (z0 + 9.4), straight ahead as you come in, between the benches.

### WHY HOUSE: FOUR EASELS, FOUR PICTURES (Ben, 28 Oct; gallery-colour.js): easels in all four corners of the WHY House, each starting on its own picture: HEART (front left; a true heart curve with two hearts inside), HELPING HAND (front right; open palm with a heart in it), SUNRISE (back left; sun over the horizon, rays, hills), BRIGHT IDEA (back right; lightbulb, filament, rays). All 8 pictures are in every easel's picker.

### WHY HOUSE EASELS + COMMENT SPOT OUT FRONT (Ben, 28 Oct): two more colouring easels INSIDE the WHY House in the front corners by the door, turned to the room (Heart, Fish; gallery-colour.js EASELS inside: 1). The WHY House YOUR COMMENTS HERE pad moved out front: on the lawn left of the door at (33.6, 23.0), facing the walk (gallery-comments.js; backup *.pre-why-move.js).

### ART CORNER (Ben, 28 Oct; gallery-colour.js, gallery-notes.js; backups *.pre-polish / *.pre-colour-share): the colouring easels moved off the walks to an ART CORNER beside the WHY House's west wall: 3 easels (Eye, Flower, Home) in an arc on a pale gravel pad with an ink edge, a round paint table with 8 pots + a brush jar, a palette with dabs on each easel shelf, the sign at the corner by the north walk. Panel: picture thumbnails (5), UNDO (12 steps), CLEAR, HANG ON THE EASEL, SHARE IN THE WHY HOUSE (hangs it, then opens the WHY House story form with the picture attached (360 px jpeg, < 38k); the visitor adds words; it shows after the gallery team approves, like other photos).

### AMB RAMP + CINEMA SEATS (Ben, 28 Oct; backups *.pre-ramp-fix / *.pre-seat-fix): the red rail + hidden blocker across the top of each AMB ramp (between its top patch and the steps) removed: the ramp now leads onto the landing and in at the door (walk-tested from the west ramp's foot to inside the door). Cinema seats: the gold cap was one bar right across the seat front (looked closed); now a small gold cap on the front of each arm only.

### COLOUR INSIDE THE LINES (Ben, 28 Oct; NEW engine/gallery-colour.js, wired in gallery.html as window.COLOUR + ACTIONS kind 'colour'): two oak easels on the lawn south-east of the ring (EASELS: (62.2, -20.6) The Eye, (66.2, -21.4) Home) + a COLOUR INSIDE THE LINES sign between them. Walk up, COLOUR: a full-screen panel (dark, Modernist): the picture's lines are RAISED (flood-filled regions: a stroke started in a shape only fills that shape), touching a line / crossing out = phone buzz (Android) + hum + red edge. 12 colours, THIN / MEDIUM / BIG, NEW PICTURE (eye · house · fish · flower · heart), CLEAR, DONE · HANG IT (shows on the easel, saved on this device: localStorage bcp.colour). TODO ideas: share hung pictures with other visitors (net event), easel colliders, a community wall.

### SIM ROOM KIOSKS OPEN (Ben, 28 Oct; gallery.json edu, simRoom: 1): copies of the entrance's TIPS TO BE LOVED (blindnessAllyTips) + TOOLS FOR THE BLIND (blindnessTools) learning stations at the room's two big stands (-160.1, -19.8) / (-160.1, 19.4), reach 4.2 m: walk up + ACTIONS / E opens the same panel as at the entrance.

### VISION SIM ROOM, PASS 3 (Ben, 28 Oct; backups *.pre-simroom2.*): the EYE CHART Six Views screen moved to the west wall's NORTH pier, same 4.6 x 4.6 size as the doctor screen (the two now flank the TO ORA EYE GALLERY door), its severity kiosk in front. North wall: RETINITIS PIGMENTOSA card · a LARGE TOOLS FOR THE BLIND stand (6.0 x 4.5) · a new GLAUCOMA card (gallery/img/blindness_edu_glaucoma.png). Six Views shader: per-wall levels (lev = black point, contrast, saturation); the doctor film gets 0.09 / 1.22 / 1.3 so it's no longer grey + washed out (it's an HDR clip). All sim films hard-muted (muted, defaultMuted, volume 0).

### SIX VIEWS: EYE CHART + DOCTOR (Ben, 28 Oct; gallery-simwall.js srcFor, gallery.json vids[8].simImg / vids[24].simVid; backup gallery-simwall.pre-eyechart.js): the big north Six Views wall shows Ben's Snellen EYE CHART (gallery/img/sim_eyechart.png, 1024 sq) through the six conditions; the small west wall shows the DOCTOR TALKING film (gallery/video/sim_doctor.mp4, centre-cropped square, muted, loops, loads only in the room). The plaza screen keeps the shared sim_hero film. NB: sim_doctor.mp4 must be uploaded to the live site too (GMEDIA is not used for it).

### LOAD SCREEN (Ben, 28 Oct; gallery.html #load): big BCP logo · NAME other gallery visitors see (input) · blue load bar (fades out when ready) · blue ENTER THE GALLERY → (glow, focus ring) · the blindness tips below. No sound-on text, no lines under the name. Soft blue glow behind the logo; tip label + dots + rule in blue. Landscape: logo + tips left, name / bar / Enter right.

### VISION SIM ROOM SWAP (Ben, 28 Oct; gallery.json, gallery-remodel.js; backups *.pre-simroom-cards.*): the SOUTH Six Views screen (vids[24]) moved to the west wall's south pier (p -173.25, -0.6, -12.05; 4.6 x 4.6, facing east) with its SEVERITY kiosk (simKiosks[0] at -169.4, -12.05, face PI/2) in front. The south wall now: DIABETIC RETINOPATHY card (signs[119], learnmore_02) left · a LARGE TIPS TO BE LOVED BY THE BLIND stand (6.0 x 4.5, ALLY_TIPS) centred at x -160.1 · a new CATARACTS card (gallery/img/blindness_edu_cataracts.png, drawn to match) right.

### EYE POOL RAISED + HIGHER MIST (Ben, 28 Oct): the pool under the bridge (gallery-world.js POOL) raised from -0.75 to -0.22 (just under the deck) and widened to z ±16: it now covers the wooden bowl either side out to about z ±11.5, up to the facade (not over it). The uplights + mist moved up with it (gallery-eye.js WY). Mist: 220 puffs (100 on phones), rises to 7.5 m (was 3.6), lives longer, fades as it climbs so the beams stay soft. NB: no // comments inside one-line code in gallery-eye.js (one broke the page today).

### EYE FRONT POLISH (Ben, 28 Oct; backups *.pre-front.js): the big dark canopy over the eye (GLB mesh Meditate_with_Morten__15_, front part x > -40 by vertex colour) is deep Ora navy, lighter toward its crown, with smoother normals (60°); the eyelid is bevelled + navy, its red edge line moved forward so the bevel doesn't hide it; a warm cove light under the lid washes down the white band (stronger at night); the lake uplights are softer (they blew the glass out to white at night).

### START SPOT + NO SCREEN-DRAG LOOK (Ben, 28 Oct): spawn = the start platform's red ring, east edge, centred under the BCP logo, in line with the main walk, facing the eye (garden-plan CAMPUS.spawn 44.7, 0). Dragging the screen no longer turns the camera; only LOOK AROUND (press + drag) does (?draglook restores screen drag). Bottom-right stack: LOOK AROUND (84) · ACTIONS (152) · LEAVE NOTE (220).

### TOP STRIP (Ben, 28 Oct; gallery.html body.barFull): the top bar is a full-width strip pinned to the top (logo + room + TAP FOR FAST TRAVEL MAP left; wave · MIC · CAM · ☰ right, menu last). Menu / camera panels open from the right under it. Portrait phones: smaller logo, room name on one line (ellipsis), 44 px buttons. ?topbar=old = the old floating bar. Foxes-here count removed. Phone preview page: 3D/phone-preview.html (?phonepreview shows the joystick on a computer).

### MUSEUM MAP POLISH (Ben, 28 Oct; gallery.html openMuseumMap): 'Fast travel · Where to?' panel: map + list side by side (stacks on narrow screens). Map laid out the way you walk (entrance right, west left, north up); every room has a big number matching its list row; the room you're in is ringed red + YOU ARE HERE in the list; yellow arrow = you; the Eye Platform is a dashed ring over the music room.

### MUSEUM MAP + TELEPORT (Ben, 28 Oct; gallery.html openMuseumMap + ROOMS_IN, gallery-game.js G.goSpot; backup gallery.pre-museum-map.html): MAP in the menu opens the museum map when you're inside (x < -13), the park map outside; each links to the other. 8 rooms, tap the map or the list to fade straight there: Entrance · Main Gallery · New Artists North / South · Vision Simulator · Music Room · The Eye Platform (top floor) · Meditate with Morten. Red dot = you. Add a room: one line in ROOMS_IN (at = x, y, z, face; r = rect or ell = ellipse on the map).

### MORTEN ROOM PLANTS (Ben, 28 Oct; gallery-zen.js): bamboo groves moved off the reading lines: now (-263, 24.2) between The Gray Zone and the meditation film, (-263, 8.4) between The Mirror and The Gray Zone card, (-247.3, 6.4) behind the Morten Bonde card. The side paper lanterns moved over the benches (r 8.2, ±24°) so they no longer hang in front of Inner Peace / The Gray Zone.

### MAIN GALLERY WALL TONES (Ben, 28 Oct; gallery-wing.js woodify walls; backup gallery-wing.pre-hall-tones.js): ground floor x -145.5..-66, |z| < 23, y < 5.4: long walls warm limestone (0.80, 0.765, 0.70 linear), every wall face that faces along the hall (end walls, the big screen's back wall, the ORA wall, the short piers between bays) deep Ora navy lighter as it rises, ink skirting 0.16 m. Upstairs + ceilings unchanged. Ideas if Ben wants more: a different deep tone per upstairs room.

### FILMS FROZEN ON BLACK (Ben, 28 Oct; gallery-game.js after unlockSound): when the browser won't allow a film's sound, Chrome froze it on frame 0 (black screen, not 'paused'). Watchdog: a film with sound that hasn't moved for 1.5 s goes muted and plays (picture runs); the next tap / key tries the sound again.

### KEY EASING (Ben, 28 Oct): the arrow / WASD keys now ease in and out (St.kx / St.kz, rate 5, ~0.3 s) only when a key is let go while the other axis is still held (presses + letting go of the last key are instant), so letting go of LEFT / RIGHT while holding UP no longer jerks the fox and camera 45°. Stick unchanged.

### MOVEMENT RESTORED (Ben, 28 Oct): move() + the camera follow are back to Ben's uploaded version (uploads/gallery-design-kit/code/engine/gallery-game.js): assisted camera-relative stick + keys, the camera swings round behind as you turn (rate 3.0). The keyboard 'car' steering, the spin-to-face change and the Meru-walk experiment below are all undone.

### (UNDONE) MERU WALK IN THE GALLERY (Ben, 28 Oct; gallery-game.js move + updateCamera; backup gallery-game.pre-movement.js)
- Same scheme as Deep Space Fox + the player planet: stick AND keys camera-relative (up = away, down = towards the camera: the fox turns and walks at you, face visible; left/right = across the screen). Replaces the keyboard 'car' steering and the lagging stick heading.
- Weight: velocity Pl.vx/vz eases (13 accelerate, 10 settle, chair 6), fox turns to face its motion (rate 11), small lean into turns (player.rotation.z, chair 40 %).
- Camera: drifts in behind (rate 1.4) only while walking away from it (cos > 0.2); across or towards it holds still, so it never spins. Drag to look still free. First person: left/right turn the view.
- Teleports, sitting, standing, respawn zero the velocity.

### CAM = SCREEN HEAD TOGGLE (Ben, 28 Oct; gallery.html): the CAM button beside MIC is one toggle now: tap = Screen head on (CAMHEAD.start('screen')), tap again = off. Fox copies my face + Face mask are gone from the UI (hidden stub buttons keep the old handlers safe). Blocked camera: a red CAMERA BLOCKED box under the bar for 12 s (the preview frame always blocks it; test on the live site / own tab).

### SEE YOUR FOX'S FACE (Ben, 28 Oct; gallery-game.js move + updateCamera): keyboard LEFT / RIGHT on the spot now turns only the fox (the camera stays), so it can spin all the way round to face you; with UP / DOWN held the camera turns with it as before, and once you walk it swings gently round behind (kbHead: full follow at rate 2.2). First person: camera still turns with the fox. Dragging the screen still orbits freely without turning the fox.

### MENU POLISH + HOST LOCK + MIC / CAM (Ben, 28 Oct; gallery.html, gallery-voice.js; backups *.pre-menu-polish.*)
- Menu rebuilt in sections with 2px rules (dark ground, light ink): big red PARK MAP · Your fox (Joe/Jane, looks, glasses) · Reading & sound (ON/OFF toggles) · Visiting together (name, room link, comment, who's here) · Lost? (entrance, Lite) · Host mode · back to the galaxy.
- HOST MODE is locked: 'I'm hosting this visit' asks for the password BCP (any case; unlocked for that tab via sessionStorage bcp.hostOk). Host this visit + Lead a tour only show after unlocking.
- Top bar: MIC (always shown now) + new CAM button beside the wave. CAM opens Fox copies my face / Screen head / Face mask / Camera off (moved out of the menu).

### WELCOME FILM FRAME + AMB BENCH (Ben, 28 Oct): the hanging film's ink frame, header bar and 2 steel cables (gallery-remodel.js buildKiosks → kiosks.filmFrame, kept out of the merge) now hide with the film once you're past it, so looking back the eye is clear. The ring bench that stood on the line from the AMB door (garden-plan angle 4.71) moved to 4.3 (west, off the door line).

### ROOM SIGNS LOAD FIRST (Ben, 28 Oct; gallery-game.js): the plate signs in gallery.json (k 't' + plate: MUSIC ROOM, MAIN GALLERY, ACADEMY OF MUSIC…, ~27) now load first on arrival whatever the distance, are never unloaded, never hidden by the label distance, the occlusion rays or the small-thing cull. Other signs: unchanged.

### MEDITATE WITH MORTEN REDESIGN (Ben, 28 Oct): DONE, needs Ben's eyes. New file engine/gallery-zen.js. Backups: backup/gallery/*.pre-zen.js
- A quiet garden room. Old flat blue pond, its rim and the 5 little stones carved (gallery-remodel.js CARVES 'morten pond …', 'morten stones').
- NEW KOI POND on the east side (ZEN.pond -249.6, 20.2, oval 2.3 x 4.2): stone coping, pale pebble border, dark pebble bed, water shader (depth, shimmer, sky at the edges, ripples from the spout), 6 lily pads, 2 lotus, 3 koi, a SHISHI-ODOSHI (fills 7 s, tips, knocks: window.__zenTok). Solid: you walk round it.
- SITTING CIRCLE facing the meditation film: round straw mat, 5 cushions on oak plinths + 2 oak benches behind, all SITTABLE (sitting turns you to the film); a stone POND BENCH at the pond's south end (looks over the water). zen.benches → BENCHES.
- 3 paper lanterns over the circle + soft floor light pools; bamboo groves (instanced) in the NE corner, SW corner, by the Morten Bonde film and in the west window gap.
- Walls: soft sage, darker toward the floor, ink skirting, warm charcoal for black pieces (gallery-wing.js woodify walls, zone x -267..-246.4, z -7.2..35).
- ONE WAY IN: the south side (low parapet onto the open deck, 2 gaps + the SW corner) glazed floor → 3.8 m with ink mullions + a solid blocker. The room's only door is the one from the curved hall.
- Big eye-level MEDITATE WITH MORTEN plaque on the door's north jamb (curved hall side); the small sign over the door stays.
- SOUND (gallery-sound.js): a soft trickle within 14 m of the pond + the shishi-odoshi's knock; ducked while a film plays, hushed with the rest.
- Phone: whole room group only drawn while the camera is within 14 m of it. Not yet checked on a real iPhone.
- PASS 3 (Ben, 28 Oct): the door's north black jamb now ends at the threshold where the stones start (CARVES 'morten door jamb west' hides mesh_34 #2; #3 stays); the old pond's sunken basin walls (a 0.75 m beam from the Morten card to the gravel garden) carved ('morten pond basin'); the room's floor is warm slate pavers in running bond with mossy joints (gallery-wing.js woodify floor branch, zone x -266.5..-246.4, z -6.7..34.5) instead of hardwood.
- PASS 2 (Ben, 28 Oct; backups *.pre-zen2.js): STEPPING-STONE PATH from the door to the circle (instanced, flat) lined by 4 glowing stone lanterns (toro, solid); a RAKED GRAVEL GARDEN (karesansui, x -260.5..-256.3, z 7..12.6, ink curb, 3 solid stones) with a sittable GARDEN BENCH on its east edge; puffy round zafu cushions; paper lanterns moved up (FY+3.7) and out to r 9.4 so they never cover the film, with soft halos; a BREATHE ring round the mat (swells 4 s in, fades 6 s out); river rocks + moss on the pond coping; a splash ring when the bamboo tube pours; sitting on a cushion or the meditation benches rings a SINGING BOWL (window.__zenBell → gallery-sound.js bowl()).

### CURVED HALL + MUSIC ROOM POLISH (Ben, 28 Oct): DONE, needs Ben's eyes. Backups: backup/gallery/*.pre-ring-polish.js
- ONE WAY IN, ONE WAY OUT: every ground-level gap in the outer ring is glazed solid (gallery-ringglass.js LOW_SPANS: clear glass floor → 4.3 m, ink mullions ~2.4 m, sill, hand-height rail, solid 'see:' blockers = ringGlass.col, registered as ringLow in gallery-game.js). Open: opening 9 (from the vision simulator room) and the gap round corner 20 (x -246, z ≈ -4..4.5) to Meditate with Morten. Ray check after: only those two are open.
- Walls (gallery-wing.js woodify, walls branch, zone x < -177.4 within 41 m of (-210, 0), y -3.6..17): white walls → warm limestone that darkens toward the floor; the black music-room drum + black frames → deep Ora navy, lighter as it rises; ink skirting (0.16 m) and an ink line at 4.3 m (y 4.3) running round the ring with the glazing transoms.
- If Ben wants more: vary the tone per bay / pillar, or a different drum colour (one line each in the shader).

### VISION SIMULATOR ROOM POLISH (Ben, 28 Oct): pass 1 DONE, needs Ben's eyes. Backups: backup/gallery/*.pre-sim-polish.js
- Walls no longer black: side walls warm grey #a39d95, the two SCREEN walls (north + south, faces |z| > 18) a deeper #6b6661 so the screens lead (gallery-game.js SIM_WALL / SIM_SCR, same per-vertex + instance-colour block after carveWorld).
- BUG FIXED: the walk-through black panel was a SIM_SKIN plane. Skins now only go on THIN walls (≤ 1.2 m) whose room face sits on the room edge (≤ 1.2 m); only 2 remain, high on the east wall (y 5.8..12.5). Console '[sim room] wall faces: n skins: […]' lists them.
- The black door jambs at the ORA / MUSIC ROOM doors are the GLB's own black pieces (mesh_34), solid, unchanged.
- ?at=sim spawns you in the room (x -149, facing west) for testing.
- Next ideas (ask Ben): a big eye-level VISION SIMULATOR ROOM door sign at the main-gallery side; warm light pools under the two screens; the room screens are content-hugging (s30 fit applies to them too) = 9.5 m wide on a 45 m wall: make them bigger?
- Not yet checked on a real phone at 390x844 / 844x390 (only colours changed, no UI).

### WHY HOUSE POLISH (Ben, 28 Oct): DONE, needs Ben's eyes. Backups: backup/gallery/*.pre-why-polish.js
- Story slots: ONE ROW at eye height (y 2.0): back wall 5 + each side 4 = 13 slots (was 26 in two rows). More stories than 13: only the newest 13 hang. Ask Ben if he wants the house deeper for more.
- Every sign black + white text: name plate, back-wall header, story stand, guest book, empty YOUR STORY HERE frames, the story cards (gallery-notes.js) and ALL the YOUR COMMENTS HERE signs + pads campus-wide (gallery-comments.js, were yellow).
- Logo rug black with a white border + white logo.
- Shape: walls 6.0 m tall (was 5.4). Real see-through windows (wallH in gallery-campus.js: wall pieces round each hole, clear glass, ink frame + cross, invisible blocker): 2 big front windows either side of the door, 4 high windows on each side wall over the stories. Fake painted windows removed. One shared clapboard texture (UVs per metre) instead of a texture per wall.
- Speed-savers: WHY House contents are noCull now (gallery-game.js inA + the story cards), so they show through the windows.
- WELCOME SCREEN (Ben, 28 Oct; gallery.html, backup gallery.pre-random-avatar.html): CHOOSE YOUR AVATAR removed; every visit WHO(random joe/jane) + a shirt art no other fox in the room wears (G.randomStyle(G.remote.arts()), re-checked after 3.5 s). The YOUR NAME box now sits above the 'Videos in each room…' line.
- WELCOME FILM (Ben, 28 Oct): the hanging film inside the eye (vids[0], keep, x -48) hides while the camera is past it (x < -48.4), so looking back from inside the eye door is clear; coming in it stays until you've walked under it (gallery-game.js, just before render).
- LOAD DISTANCES +25 % (Ben, 28 Oct; gallery-game.js, backup *.pre-load-dist.js): small-thing cull (LITE near 22/36, k 0.016/0.009, art 75/110, labels 32/50), art NEAR 120/175 + SHARP 55 on phones, wings load 100/120/160 (unload 155/215), rooms 90/110/140 (unload 150/220), room/wing groups shown within 95 m, staff 60 m, other visitors 90 m. If phones get slow, step these back first.
- VISION SIMULATOR ROOM BLACK (Ben, 28 Oct): the walls are inside the big merged GLB meshes (mesh_32, Arch__1_…), so gallery-game.js (after carveWorld) paints black VERTEX COLOURS on every wall face inside the room box x -177.6..-145.9, z -22.7..22.3 that faces into the room (those meshes get a material copy with vertexColors). Console '[sim room] black wall faces: n'. (The first try, recolouring whole pieces, matched nothing.) ORA SPONSOR text (behind the ORA screen in the main gallery, gallery.json sign at x -119.103): now 3 lines (\n), plane y -3.3..-1.95 between the floor and the screen (screen bottom -1.912), fs 28.
- AMB WINDOWS SEE-THROUGH (Ben, 28 Oct): the 4 tall front windows are real holes now. gallery.json rooms amb "frontWins" [zc, w, y0, y1] (wing-local) → buildWing (gallery-wing.js sideWall) cuts them + an unseen blocker; gallery-amb.js draws clear glass (warm glint at night), ink frames through the wall, mullions. Window blockers carry userData.see (collision label 'see:' so the behind-a-wall rays look past them); WHY House blockers too. Backups: backup/gallery/*.pre-amb-windows.*


## HANDOFF_GALLERY_29OCT.md (Claude Design)

# Blind Canvas gallery: handoff (28–29 Oct 2026)

Paste this into the original chat: "Read HANDOFF_GALLERY_29OCT.md and continue BUILD_PLAN.md (gallery)."

## Files changed (upload all of these, same paths)
New:
- 3D/engine/gallery-puzzle.js (LIVING PUZZLE, window.PUZZLE)
- 3D/engine/gallery-paint.js (PAINT TOGETHER, window.PAINT)
- 3D/engine/gallery-hunt.js (ART HUNT, window.HUNT)
- 3D/engine/gallery-bingo.js (ART BINGO, window.BINGO)

Edited:
- 3D/gallery.html (loads the four above, net events, shared clock GSES, red ✕ observer, side tabs hide when busy, park map labels + CHESS / PAINT boxes, every fox starts as a cane fox in the Art suit)
- 3D/engine/gallery-game.js (pupil hallway, Stevie zone +4 m, main film skips first 2 s, hands = fur colour)
- 3D/engine/gallery-campus.js (WHY House banner lower, Talking Chess + Paint Together spots / routes)
- 3D/engine/gallery-remodel.js (Blindness Tip 1 moved across the walk)
- 3D/engine/gallery-fun-props.js (chess tables moved, TALKING CHESS sign)
- 3D/engine/gallery-chess.js (TALKING CHESS name)
- 3D/engine/gallery-studio.js (Fox / Vixen tee + camera section removed, 6 fur colours)
- 3D/gallery/gallery.json (second notes admin key for the admin link)
- BUILD_PLAN.md (progress notes)

## What was built
- LIVING PUZZLE: VIEW ART panel → PLAY AS A LIVING PUZZLE. Tiles on the wall in front of the painting (3×3 / 4×4), camera frames it, shared board for friends (net 'pzl'), solved = flash + living mp4.
- PAINT TOGETHER: canvas at the end of the walk north of the Academy (-9, -53). 8 colours, THIN/MID/THICK, live strokes for all (net 'pnt'), black invite text until the first stroke (hidden in full screen), clears every hour on the shared clock.
- ART HUNT: left tab (n/5). 5 clue cards per 30 min, same paintings for all, each player's own order. Stand in front = ★ stamp. RACING YOU list (net 'hnt').
- ART BINGO: only with 2+ foxes (tab under ART HUNT). 3×3 of painting squares decided ONLY by Ben's list (BINGO_TAGS / BINGO_NOT in gallery-bingo.js). Fills by itself in Art Hunt range, no hand ticking, one painting = one square (the rarest it fits). First line = bell for all (net 'bng').
- SHARED CLOCK (window.GSES): starts with the first fox in; later foxes adopt it; empty gallery → fresh clock. Hunt + bingo 30 min, paint 60 min.
- TALKING CHESS (renamed) moved to the end of the walk north of the WHY House; both new spots on the park map + place list.
- Park map labels auto-fit their boxes; every ✕ button red with the ✕ centred.
- ART HUNT / ART BINGO tabs appear only after the load screen and hide during full screen / games.
- Start fox: cane fox in the Art suit (art square front, BCP logo back), a different art per fox.
- Pupil hallway: black tube behind the eye's pupil (far end 33 % wider), fades as you walk in, hidden inside.
- Stevie Wonder film starts 4 m sooner; main screen film skips its first 2 s.

## Admin link (keep private)
gallery.html?admin=bcp-409799cbfdeac3df2b34e9cb → Approve / Hide on stories with photos or voice.

## Still to check
- Phone check (390×844 + 844×390) of the puzzle, paint panel, hunt and bingo cards.
- Two-device test: shared puzzle, live paint, hunt race, bingo bell, shared clock.
- Bingo needs 2 foxes to show. The main film's 2 s skip only applies to the local mp4.
- Pupil hallway: the film's side edges may clip from outside (widen if so).


### 29 OCT INSTALL (Ben, 29 Oct; this chat): Claude Design's complete update (bcp_gallery_complete.zip) installed over 3D/. Kept from the PC: gallery.glb, img.pack, anim/*, audio/*, other video/*, vendor/face-api.
- Screen 1 (south, the left theatre facing the doors): SURFING FOR VISION, gallery/video/surfing_for_vision.mp4 (640x360 H.264 200k + AAC 64k, 30 min, 62 MB), a show every 45 min (gallery-campus.js CINEMA_SHOW). Between-shows still: img2/cinema_surfing_for_vision.webp. The festival film it replaced stays in video/. The poster still reads "Surfing While Blind" (poster_surfing_while_blind.jpg).
- Living painting: 5 Weeks On My Side (Ben Fox) = gallery/anim/5_weeks_ben_fox_270128946.mp4 (480x480, no audio), first in gallery.json anims.
- PHONE DRAW CALLS (load check + optimisation; NO load/appear distances changed): ring stained-glass frames + clear panes now in mergeStatic (ringGlass.group); the zen garden merged too (gallery-zen.js marks its koi, pads, lanterns, tube, stream, splash, breathe ring userData.dyn); the shirt booth merges its still parts via G.world.merge (new, = mergeStatic); the chess pieces (instanced, were frustumCulled = false so drawn from everywhere, ~70k tris) now have one bounding sphere round both tables and are frustum-culled. Spawn 628 -> 489 draws, 451k -> 381k tris; entry 415 -> 360; zen 116; chess corner 96.

## 29 OCT, AFTERNOON + EVENING (Ben, this chat)
- 5 WEEKS ON MY SIDE: Ben's .mov version, cropped to the original painting (Runway had added space right + bottom: the painting is the top-left 768 px of the 960 video, found by matching the still) and colour-matched to the still (lutrgb fit), WITH sound: gallery.json animSound lists it; gallery-anim.js plays an animSound painting unmuted, its volume fading with the picture (silent if the browser blocks it, or under HUSH).
- Interview sound: a film on 2 screens (Dave, Raquel: the 2nd-floor copies are vol 0) takes the louder screen's settings. The AMB film is silent in the stage room (its extraZone gain 0). A screen showing a host's camera / screen share is silent (other rooms' films still drop to a murmur).
- Camera: REST_PITCH 0.17 / AIM_UP 0.45 on computers, 0.24 / 0.15 on phones (was 0.28, aimed at the head) — more wall, less floor.
- Ring interview screens (Wayne, Marcus 1.75x; Rusty, Will 1.55x), bottoms 0.5 m off the floor, eased 0.25 m off the curved wall.
- Plaza signs + kiosks: an invisible solid 'see' block from just in front of each face to 1.2 m behind (gallery-remodel.js blockBehind) — no getting round/under/behind them.
- Doctor clip (sim_doctor.mp4) replaced with Ben's clean SDR clip; its levels eased to (0.02, 1.06, 1.08).
- PAINTING GAMES (engine/gallery-games.js): Walk Through Fear, Curating Hope, Reflections of Sisterhood, Roots of Kinship, Napkin, Please — the VIEW ART panel offers PLAY THE GAME instead of the living puzzle. Games load from ../AR/lib/minigames (playOnPainting); import map for 'three' in gallery.html; G.hold(on) freezes the fox + hides the joystick; the gallery HUD hides, HUSH on, camera squared up (frontView); ✕ Leave / Esc; Play again for Napkins.
- MENU: logo + red BACK TO THE GALLERY (closes the menu) on top, Host mode, SOUNDS and MULTIPLAYER OPTIONS fold open, Lost? (entrance, lite, night), yellow MAP at the bottom. 'Your fox' removed (the shirt booth dresses your fox).
- Ambient sound on phone data: the sound module is fetched while loading and made INSIDE the Enter tap (was fetched after it: too late on slow connections); every sound context wakes on any tap/click/key (capture listeners) and on returning to the tab.
- INTERVIEW play zones: an oval in front of the screen (side = w/2 + 2.2 m, far = max(9, 1.6 w) m), inside the old room zone (INTERVIEW list + wing totems 'interview: true'). Welcome film, AMB films, Morten's meditation, cinema, sim walls, big hall films, Stevie Wonder, goalball keep whole-room zones. (St.zUrl = the current film zone, for tests.)
- SURFING FOR VISION on Screen 1: kept as HLS (gallery/video/surfing_for_vision/index.m3u8 + 182 × 10 s .ts pieces, same 640x360 encode) because one 62 MB file was too big to copy over; CINEMA_SHOW.hls = true; playUrl plays a local .m3u8 through HLS (Safari native, hls.js elsewhere). The festival film is no longer in the cinema (blindcan_festival.mp4 + white_cane.mp4 are unused files in gallery/video).
- Videos checked for size: all are already 480p at ~130–290 kbps with faststart (play while downloading); re-encoding saved little or lost quality, so they were left as they are.
- Bingo: Roots of Kinship never counts as water; Light on the Other Side's skateboard counts as a vehicle.
- Tests: node --check does NOT catch errors in these ES modules; parse with acorn (a one-line // comment once swallowed the rest of a long line).
