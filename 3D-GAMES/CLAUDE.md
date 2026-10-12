# 8 GATES 3D — project notes for Claude

## TOP PRIORITY: MOBILE FIRST
Everything must be designed and checked for phones first (iPhone portrait AND landscape), then desktop: minigames (panels fit the screen, touch controls, no tiny buttons), dialogue (readable size, box never covers the speaker's face, tap to advance), camera framing (subjects framed for narrow screens), HUD (thumb-reachable, 44px+ touch targets, nothing overlapping), performance (phone budget). Test at 390x844 and 844x390 before calling anything done.

## User's local files
The user's full game folder on their PC: `C:\Users\Ben Fox\Documents\8 GATES\all-files\8GATES-SITE` (has the media the uploads point to: MERU/videos cutscenes, MERU/MUSIC/JUKEBOX MP3s, etc.). Ask the user to attach that folder to the project when media is needed; copy only what each world uses.

## What this project is
The user's 2D game "8 GATES" (fox characters, 11 worlds) is being rebuilt in 3D, world by world. Source of truth for every NPC name, line, quest step, shop item and price: the uploaded world HTML files in `uploads/` (surface_meru.html, surface_gaya.html, surface_jidda.html, surface_kufa.html, surface_luxor.html, surface_nebo.html, surface_ur.html, surface_zion.html, surface_player.html = Home planet, surface_earth.html, station.html = Deep Space Fox, Space_world__asteroids_touch_350.html = space map). Design brief: `uploads/8GATES_DESIGN_BRIEF_ALL.md`. Build plan + progress: `BUILD_PLAN.md` (keep it updated every session).

## Decisions the user made (do not re-ask)
- Order: split Meru into a reusable engine first, then finish Meru (19 rooms), then Gaya, Jidda, Kufa, Luxor, Nebo, Ur, Zion, Home, Earth, Deep Space Fox. Space map: later.
- Per message: fewer rooms, full polish.
- Minigames: run the user's original minigame HTML (base64 inside each world file) in a panel first, like the Meru casino. 3D rebuilds later, in this order: Surf contest (Jidda), Monster truck crush (Zion), Tennis open (Gaya), Archery (Kyoto), Glider (Nebo), Gold panning (Zion), Speedway race (Earth).
- Phone: right-side column of buttons 1 MELEE · 2 RANGE · 3 JUMP · 4 ITEM (opens a quick item wheel); TALK appears only when near someone; joystick on the left; add a quest banner.
- Space dock: a unique dock per world (every world except Earth).
- Keep every room's bracketed game name (e.g. meruTavern) exactly. If something must be cut, cut decoration, never a listed room, NPC or minigame.
- Keep it light enough for iPhone.

## World layout rules (decided)
- ONE connected outdoor map per world. The 2D game's separate path screens (Castle Path, Arena Path, Ruins Path, Lake, etc.) become ZONES on that map; keep each zone's bracketed name and switch the top-left label as the player walks in. Interiors (buildings you enter) use the quick fade. Battle maps stay separate set pieces.
- Lay each world out from its 2D map data (walk maps, building positions), like Meru.
- Off-path freedom: the player can walk off the paths into the wild, especially in areas that lead to battle places. Creatures/enemies live out there and do not come onto the path.
- Path readability: keep light poles, lanterns or trees lining every path so the player always sees where it is and whether they are on it.
- Performance: phone budget (fewer shadows on phones, hide far crowds/detail, simple distant buildings). Test each world on iPhone when playable.

## Engine rules (decided)
- One shared SAVE system across all worlds (story flags, gold, XP, items, relics, outfits).
- Shared STORY system: quests, quest steps and dialogue CHOICES as data (not just linear lines).
- One ENEMY library (melee, ranged, charger, boss behaviours); worlds pick names/colours.
- Before each world, copy working files to `backup/<world>/`.
- Rooms first at consistent quality, then a polish pass per world. Leave a "try this" checklist at the end of each world.
- Media: cutscene videos (MERU/videos/...) and jukebox MP3s are NOT in the project yet; the user will upload them. Until then, fall back (synth music, skip or in-engine cutscenes).

## STANDARD HUD (decided, session 26 — read before touching any map's controls)
- The phone + desktop HUD is FINISHED and shared: `Game HUD.dc.html`. Every map mounts it (`<dc-import name="Game HUD" game hud started busy on-hud world keys skip-keys quest-steps orbit-url>` inside a `data-hud-host` div). Never rebuild HUD buttons, menus, joystick or key strips inside a map; change Game HUD once and every map follows.
- Phone BOTTOM STRIP (session 28, standard on every map): FOX SWAP bottom-left · ITEM bottom-right ("ITEM ·" yellow + pinned name white; tap = use, hold = change, nothing pinned = "PIN AN ITEM +"). Replaces the old fox-swap badge and bag circle. Built into Game HUD.
- Meru Bridge stays ON HOLD (do not roll out or edit until Ben says).
- Phone buttons: press = fire once. 1 MELEE → `game.melee()`, 2 RANGE → `game.range()`, 3 JUMP → `game.jump()`, 4 BAG (tap = item wheel, hold = menu). No hold-to-aim or charge on these buttons.
- Desktop keys: 1 melee · 2 range · Space jump · E talk · M map · J journal · I menu · V view · C camera · T +1 hour.
- Each map's module only implements the ENGINE CONTRACT listed in BUILD_PLAN.md ("SHARED HUD FILE"). Its own panels (round card, boss bar, minigames) sit beside the HUD.
- Done on it: Meru Town Square, Meru Arena. Meru Bridge is ON HOLD (Ben put it aside). Follow the roll-out order in BUILD_PLAN.md.

## Style already established (keep)
- THE CAST: player, Hope, Noble are defined ONLY in `engine/cast.js` (castKit().make('player'|'hope'|'noble')). Every new world/map uses it. Hope = HOPE_LOOK, 8 armour, white bow, sunglasses, blue legs, long cane (presets/cane.json, Cane Workshop, CANE SWING + pulse). Noble = 8 armour, red eyes, blue legs, futuristic chair (presets/chair.json, Noble Workshop), shoemerang off his right boot. Player = PLAYER_MALE orange, 8 armour.
- Fox kit: `fox-kit.js` (PLAYER_MALE is the player; PLAYER_FEMALE, KING_MIGHT presets; outfits armor/robe/coat/dress/vest/suit/royal; guards wear armor; expressive canvas faces, moods).
- Toon shading + ink outlines, day/night + weather, interiors live in the same scene far from the map and are entered with a quick fade (no loading).
- UI is the Modernist design system (Archivo, 2px ink rules, red accent, flush-left, no rounded corners).
- Meru Arena: `meru-arena.js` (battle engine: laser + sword, lock-on on C, boss Iron Warden, style rank, 8-Gate Burst, pickups).
- Workshops: `Fox Workshop.dc.html`, `Combat Workshop.dc.html`, `Cane Workshop.dc.html` (Hope, engine/cane.js, presets/cane.json), `Noble Workshop.dc.html` (engine/chair.js, presets/chair.json).

## Working rules
- Start each new world in a NEW chat in this project (keeps room to work). Say "continue BUILD_PLAN.md".
- Each world: one DC page named after the world (e.g. `Gaya.dc.html`) + its data/scene module. Never break Meru.
- At the end of every session, update BUILD_PLAN.md: finished / partial / not started.
