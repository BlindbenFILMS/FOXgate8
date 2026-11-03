# HANDOFF — Minigame #38 · Claw Crane (Arcade · any world)

Game key: `arcadeClaw` · room name `[arcadeClaw]`
Reference used: Meru Burgers (page + module layout, own panels, no Game HUD), Skate Park (online lobby and race flow).
Checked at 390x844 and 844x390 (intro, aim, side view, reveal, shelf, party turn, results, out of tries, online lobby and race).

## What it is
A prize arcade interior that fits any building on any world: a row of five claw cabinets, arcade carpet and a neon sign.
The player's cabinet is in the middle. Prizes go on the player's shelf (shared save).

- **Prizes (16):** 6 MONSTER TRUCK MINIS (Mud Fox, Gate Crusher, Zion Duster, Night Howler, Big Wave, Gold Rush) · 6 PLUSH CREATURES (Bloop, Puffling, Sprout, Snoozle, Glowbug, Fizz) · 4 PLUSH FOX HEROES (Ben, Hope, Noble, King Might). The fox plushes use THE CAST colours (Hope: bow, sunglasses, white cane; Noble: red eyes, chair wheels; King Might: gold crown).
- **Points:** creature 1 · truck 2 · fox hero 3 · King Might 5.
- **Modes:** PLAY (tries bought with gold, prizes kept) · PRACTICE (free, nothing kept) · PARTY (2–5 players pass one phone, 3 tries each) · ONLINE PRIZE RACE (2–5 friends, peer to peer, each on their own cabinet, 90 s, most points wins) · DEMO (the claw plays itself).
- **Controls:** phone: joystick (left) + big DROP button (right), VIEW button (front / side view). Desktop: WASD or arrows, Space or Enter = drop, V = view.
- **Aim aids:** red laser and a landing ring (red = nothing there, yellow = it will touch a prize, green = good grab). **AIM BEEPS** sonar (menu toggle): beeps get faster and higher when the claw is right over a prize, so it can be played by ear. Haptics on grab and win. Every result is also announced in an aria-live line.
- **Lucky meter:** every miss fills it. After 7 misses the next grab is a POWER CLAW (extra grip).
- **Fox:** Ben, Hope or Noble (from `engine/cast.js`) stands beside the machine on the menu and cheers on a win. The choice is saved.

## Polish pass (v2): graphics, sound effects, music
- **Music:** synthesized chiptune, no audio files needed. Three 4-bar loops: MENU (98 bpm, laid back), PLAY (118 bpm, bouncy) and RACE (140 bpm, driving). Each has drums, bass, arpeggio and a lead with vibrato. Tracks change on the next bar. Music drops in volume under the win fanfare. MUSIC on/off toggle on the menu.
- **Sound effects:** coin clink + credit blip; DROP button thunk; claw motor hum that follows speed and strains when lifting a prize; claw clack; plush squish or plastic click on a grab; slide-whistle slip; prize thud down the chute; win fanfare (bigger for fox heroes); sparkle chime for a NEW prize; power-claw riser; last-5-seconds ticks; race countdown beeps; prizes bumping in the pile; restock tumble; party whoosh; win / lose stings on the results; button clicks.
- **Room sound:** quiet arcade room tone, plus distant blips from other machines panned left and right. Light room reverb on everything.
- **Graphics:** purple fog for depth; pink and cyan rim lights; glowing neon sign plus wall neons (star, lightning bolt, fox paw, heart); spotlight cones over every cabinet with glow pools on the carpet; four back-row video cabinets with scrolling screens; cabinet side art (stripes, stars, WIN!), INSERT COIN light, PRIZE / PUSH door, chrome trims, light bar inside the glass, glowing bulb rows; light cone and floating sparkles inside your cabinet; LED ring on the claw that matches the aim ring (green = good grab); camera shake on drop, grab and win; rainbow chase lights, flashing prize door and spinning light rays behind the prize on a win; soft screen vignette.
- **Extra touches (v3):** the claw swings like a pendulum on its cable when it moves and stops, and the prize swings with it; plush prizes squash and wobble when they land or bump (trucks barely flex); sparkles burst out of the prize door on every win; each prize has its own little voice on the reveal (plush squeaks, a truck engine rev, fox yips, a royal trumpet for King Might); the race music speeds up for the last 10 seconds with a 10 SECONDS! flash; the music goes back to the menu tune on the results.
- Measured: about 125 draw calls while playing in portrait, 170 in landscape.

- **v4 (after Ben's play test):** round arcade joystick (red ball top, direction arrows) and a round DROP button that presses in. Fixed the flicker under the claw: resting prizes now go to sleep so the pile stops micro-jittering, the landing ring glides instead of jumping, and its colour fades with a small dead zone so it no longer flashes between yellow and green. New graphics: a soft claw shadow on the pile (helps depth), softer 4-tone plush shading, darker floor edges inside the cabinet, a glass shine that slowly drifts, glowing marquee bulb strips, and twinkles over fox-hero prizes (gold for King Might) so they are easy to spot.

## Files made (new only)
- `Arcade Claw Crane.dc.html` — the page (menus, controls, shelf, lobby, results)
- `Arcade Claw Crane Phone Preview.dc.html` — portrait + landscape preview
- `minigames/arcade/claw-crane.js` — the game module: scene, prizes, physics, modes, online race
- `minigames/arcade/claw-crane-HANDOFF.md` — this file

Imports only kit files: `vendor/three/three.module.js`, `fox-kit.js`, `engine/cast.js` (and its cane / chair presets), `engine/textures.js`, `engine/save.js`.
Online play imports `engine/duel-net.js` (in the repo, not in the kit). If that file is missing, the game falls back to a same-device test mode (two tabs), shown as "TEST · THIS DEVICE".

## Save keys used (all through engine/save.js)
- Items: `arcadeClaw.<prizeId>` (16 of them, e.g. `arcadeClaw.hopePlush`, `arcadeClaw.mudFox`). Labels are exported as `ITEM_LABELS` from the module.
- Stats: `arcadeClaw.credits` (tries left) · `arcadeClaw.lucky` (lucky meter) · `arcadeClaw.tries` · `arcadeClaw.wins` · `arcadeClaw.raceBest` · `arcadeClaw.fox` · `arcadeClaw.sound` · `arcadeClaw.music` · `arcadeClaw.audioAim`
- Flags: `arcadeClaw.gift` (3 free tries on the first visit)
- Also: `save.spend()` for gold, `save.addXp()` (2 XP per prize point).

## Menu line to add (minigames/index.html)
```html
<li><a href="../Arcade%20Claw%20Crane.dc.html">Claw Crane · Prize Arcade</a></li>
```
And in MINIGAMES_MASTER.md: `38 Claw crane` → `*38 Claw crane`.

## Opening it from a world
- Panel: `Arcade Claw Crane.dc.html?embed=1`. BACK on the menu card posts `{ type: '8gates:minigame', action: 'back', game: 'arcadeClaw' }` to the parent window.
- Theme the neon sign per building: `?sign=MERU%20ARCADE` (any text).
- Other URL options: `?demo=1` (starts the demo), `?room=ABCD` (joins an online room; the SHARE LINK button makes these).

## Shared-file changes wanted (NOT made — for Ben's merge pass)
1. **engine/duel-net.js:** the race needs up to 5 peers in a room. Skate Park stops at 4 in its own page; if `connectDuel` itself caps rooms at 4, raise it to 5. API used: `connectDuel({ game, code, onJoin, onLeave, onMsg, onStatus })` → `{ id, send(type, data, to?), leave() }`, same as Skate Park.
2. **Item labels:** add `ITEM_LABELS` from `minigames/arcade/claw-crane.js` to the shared item-label list (Skate Park reads `worlds/meru-shops.js`) so the HUD item wheel shows prize names instead of ids.
3. **Embed BACK:** no shared listener exists for the BACK message yet. Suggest one standard: worlds listen for `8gates:minigame` / `back` and close the panel.
4. **Copied helpers:** `village-game.js` and `meru-game.js` are not in the kit, so the module carries its own copies of `rr / clamp / damp / smooth / pick`, a toon gradient, the camera-fit from `restaurant-kit.js`, and a small mesh-merge (`bake`). These could move into a shared `engine/arcade-kit.js` later for the other arcade cabinets (#34–#42).

## DRAFT for Ben (no 2D source for this game)
- All prize names and lines. Prices: 5 tries = 8 gold (1 try ≈ 2 gold), 3 free tries on the first visit.
- Online race prizes are kept (`CLAW.keepRacePrizes = true`). Party prizes are not kept (one phone, one save).
- Party = 3 tries each. Race = 90 seconds. Aim timer = 15 seconds a try. All in the `CLAW` object at the top of the module.

## Phone budget
- No shadow maps. Each prize is ONE merged mesh (+1 outline). Static cabinet parts are baked into one mesh per material. The neighbour cabinets' prize piles are one mesh each.
- Measured (v2): about 130 draw calls while playing in portrait, 170 in landscape (more cabinets in view), about 350 on the menu (the fox is the biggest part and is hidden while you aim).
- Pixel ratio capped at 1.75 on touch screens, antialias off on touch.

## Try this
0. Put headphones on: listen to the menu music, then the play music, then the race music. Toggle SFX, MUSIC and BEEPS on the menu. Win a truck, a plush and a fox to hear the three prize voices, and play an online race to the last 10 seconds to hear the hurry music.
1. Open `Arcade Claw Crane Phone Preview.dc.html` and check both phone sizes.
2. Tap PLAY (3 free tries). Drag the joystick until the ring turns GREEN, then tap DROP.
3. Tap VIEW to check depth from the side, then back to FRONT.
4. Miss on purpose 7 times in PRACTICE and watch the lucky meter turn into a POWER CLAW.
5. Turn AIM BEEPS on, close your eyes and try to find a prize by the beeps.
6. Win a prize: the NEW! card, then PRIZE SHELF shows it (others stay as silhouettes).
7. Run out of tries: BUY 5 TRIES takes 8 gold from the shared save.
8. PARTY with 3 players: pass the phone between turns, check the results card.
9. ONLINE: CREATE ROOM on one phone, SHARE LINK, join on a second phone, both READY. Friends' claws move in the cabinets beside yours with their name and score on top. Try REMATCH and LEAVE.
10. Switch the fox to HOPE and NOBLE on the menu.
11. Open it in a world panel with `?embed=1&sign=ZION%20ARCADE` and tap BACK.
