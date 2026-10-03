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
