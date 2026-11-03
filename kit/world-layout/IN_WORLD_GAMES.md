# IN-WORLD GAMES — the recipe (from Meru: Claw Crane s101, Pinball s100, Burgers, Tavern darts)
Goal (Ben): every game and job is played INSIDE its real place in the world (the real cabinet, counter, court, ring), not as a separate page that rebuilds the room. Walk up, press E / TALK, the camera eases in, you play, BACK eases out.

## PHASE ORDER IN A WORLD CHAT (Ben, s345: PARALLEL_WORLDS.md section 9)
1. LAYOUT (Map Workshop), checker 0 FAIL.
2. EXTERIORS: real shells, roof + door signs, walk-in doors with the Meru cutaway. Ben walks the whole town.
3. INTERIORS: one building at a time, deluxe polish. Ben walks each.
4. JOBS + GAMES in the world, one per pass, with the recipe below.
5. AVATARS + STORY: in the main project.

## REUSE THE INTERIORS WE ALREADY BUILT (Ben, s345 — VERY IMPORTANT)
- Most of our games + jobs ALREADY HAVE A ROOM (the shop, the kitchen, the hall, the court, the cabinet). In PHASE 3 (interiors) bring in as much of that room as possible from the game's own files in GitHub BlindbenFILMS/3D-foxgate8, instead of building a new one: walls, floor, counter, stations, machines, props, lights, colours.
- Fit it INTO the building's footprint on the map (resize the footprint to the room if needed; keep the door where the room's door is). The open walkway from the door to the place of action stays clear.
- In PHASE 4 make it PLAYABLE IN THE WORLD in that same room (the Meru Claw Crane recipe below): the game's rules run on the room you are already standing in, never a separate page that rebuilds it.
- Note in each game's HANDOFF which parts came from the game (file + function) and what changed.

## MOBILE FIRST — TOP PRIORITY (Ben)
- Every step is checked on the phone FIRST: iPhone portrait 390x844 AND landscape 844x390, then desktop.
- Touch: 44 px+ targets, big readable text, tap to advance, a hint hand after 3 s, nothing covers a face or the play area, safe areas for the notch + home bar.
- Cameras framed for narrow screens (wide lens + view offset in portrait), held inside rooms.
- Phone budget: few draw calls (merge static parts by material, instance repeats), small textures, shadows off on phones, far detail hidden, rooms + game code load only when you walk in / press E.
- If something works on desktop but not on the phone, it is not done.

## THE RECIPE (one game)
Source: the game's page + module from GitHub BlindbenFILMS/3D-foxgate8 (paths in WORLD_PLAN.md / 3D-GAMES/GAMES_INDEX.md). Copy ONLY that game's files into `minigames/<world>/` (never the whole repo). Back up first: `backup/<game>.pre-world.js`.
1. WORLD MODE in the game module, behind `opts.world = { renderer, camera, parent, rot }` (the page version must keep working unchanged):
   - no own renderer, room, lights, sky or cast: send those to a throw-away scene / group;
   - build ONLY the game's own thing (cabinet + pile + claw, table + pieces, court + net…) into `world.parent` (the group of its place in the world);
   - a private game camera the host copies each frame (same fov as the host), shots fitted in world space;
   - no own render loop: the host calls `game.tick(dt)`; keys come from the host (`game.keyDown / keyUp`), joystick via `game.setJoy(x, y)`;
   - `destroy()` removes only its own group.
   - the game reports to the host with `onState(state)` (score, tries, time, prize, game over).
2. THE PLACE in the world: its group gets `.cab = { name, inworld: true, standSpot, group, deco, screen }`. START hides the decorative copy (`deco`); BACK shows it again.
3. THE HOST (the world's walk page): walk up + E / TALK → the player steps to the stand spot and faces it → camera blends (about 1.7 s, one shot) from the walk camera to the game camera → play → BACK / Esc blends back. While playing: joystick → setJoy; 1 / 3 / E / TALK = the game's main action; HUD keeps only what the game needs.
4. THE PLAY UI (Modernist, inverted menus: dark ground #201e1d, light ink #f3f2f2, red #ec3013): a top-left card (score / tries / time), short say-lines under it, a red BACK, the prize card, the GAME OVER card with PLAY AGAIN · BACK. Safe areas for portrait / phone landscape / desktop.
5. Menus on machines (arcade cabinets): the START MENU is drawn on the cabinet screen in the game's colours: 1 PLAYER · MULTIPLAYER · HOW TO PLAY · BACK.

## RULES
- MOBILE FIRST: test 390x844 and 844x390. Touch targets 44 px+. A hint hand after 3 s. Cameras stay inside the room.
- Max 4 players online (5 for poker / card tables), through engine/duel-net.js + vendor/trystero-nostr.js when the game already has it.
- Save keys prefixed with the game key (`<world><Game>.best`). Prizes / gold go through one small save adapter the main project swaps for engine/save.js at merge.
- The robots are hacked Machine Fleet units (victims, not villains) in every line you write.
- INTERIOR RULES (Ben): open walkway from the door to the place of action · a NOW HIRING sign starts the job · keeper choices: first "YES, PUT ME TO WORK!", last "GOODBYE" · every dialogue box 20 words or less · keeper idles + waves when you come in · 1-2 customers by time of day · warm window light by day, lamps at night · stars + best on the shop's board, a prize fly-in.
- Characters: ONLY the kit's one simple test fox while building. Keepers are simple stand-ins (a coloured box fox) until the merge.
- Load rules lazily: the game's module loads only when you press E (the world's load time stays fast).
