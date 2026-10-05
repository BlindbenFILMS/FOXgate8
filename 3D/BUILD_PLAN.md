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
