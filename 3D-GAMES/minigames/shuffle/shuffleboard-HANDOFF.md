# HANDOFF — Minigame #16 · Table Shuffleboard

A lounge-room shuffleboard table that fits inside any building on any world. 1–5 players.

## Files made (all new, nothing shared was edited)
| Repo path | What it is |
|---|---|
| `Shuffleboard.dc.html` | The game page: HUD, menus, online lobby, `?embed=1` support |
| `Shuffleboard Phone Preview.dc.html` | 390×844 + 844×390 side-by-side preview (like Skate Park's) |
| `minigames/shuffle/shuffleboard.js` | The game module: 3D room + table, physics, rules, CPU foxes, online play |
| `minigames/shuffle/shuffleboard-HANDOFF.md` | This file |

The module imports only shared files that are in the kit: `vendor/three/three.module.js`, `fox-kit.js`, `engine/cast.js` (player, Hope, Noble), `engine/save.js`, `engine/textures.js`. It does **not** need `village-game.js`, `meru-game.js` or `restaurant-kit.js`.

## Save data used (all start with `shuffleboard.`)
Through `engine/save.js` (the shared save):
- `stats['shuffleboard.wins']`: wins vs CPU foxes
- `stats['shuffleboard.games']`: games started (vs foxes / pass & play)
- `stats['shuffleboard.onlineWins']`: online wins
- `stats['shuffleboard.hangers']`: your hangers (4-pointers)
- `stats['shuffleboard.bestFrame']`: best practice frame
- `flags['shuffleboard.firstWin']`: first win vs foxes
- Gold through `save.addGold`. Vs foxes win: 5 + 5 per CPU (+5 on HARD). Online: win 15, play 3. Pass & play and practice give no gold, so nobody can farm it. **DRAFT amounts for Ben.**

Per-device settings (plain localStorage, game-prefixed, not the shared save):
- `shuffleboard.settings`: ghost guide and sound on/off
- `shuffleboard.setup`: last chosen fox count, skill, target and rules

## Menu line to add to `minigames/index.html`
In the second list (next to Skate Park):
```html
<li><a href="../Shuffleboard.dc.html">Table Shuffleboard</a></li>
```
And in `MINIGAMES_MASTER.md`: `16 Table shuffleboard` → `*16 Table shuffleboard`.

## Putting it inside a world's building
- **Panel / iframe (easiest):** `Shuffleboard.dc.html?embed=1&world=meru`. With `embed=1` the menus get a **LEAVE TABLE** button. It posts `{ type: '8gates:minigame', action: 'back', game: 'shuffleboard' }` to the parent window. The world listens for that and closes the panel.
- `world=` picks the room palette: `tavern` (default), `meru`, `gaya`, `jidda`, `kufa`, `luxor`, `nebo`, `ur`, `zion`, `home`, `earth`, `station`. **The palettes are DRAFT colours.**
- **In-scene (later):** `buildShuffleTable(ctx)` builds just the table from a Meru-style ctx `{ THREE, M, toon, scene, origin, grad }` if a world wants the table in its own interior.

## Shared-file changes wanted (not made)
1. **`engine/duel-net.js` room size:** Shuffleboard allows **5** players per room (Skate Park caps at 4 in its page). If duel-net itself caps at 4, please raise it to 5. Game key used: `connectDuel({ game: 'shuffle', … })`.
2. **duel-net was not in the kit**, so the module tries `engine/duel-net.js` first. If that file is missing, it falls back to a built-in test mode (two tabs on one computer, shown as "TEST · TABS"). In the real repo it uses duel-net like Skate Park. If duel-net's API differs from what Skate Park calls (`connectDuel({game, code, onJoin, onLeave, onMsg, onStatus})` → `{ id, send(type, data, to?), leave() }`), adjust `connectNet()` in `shuffleboard.js`.
3. **World hosts:** listen for the `8gates:minigame` / `back` postMessage above (a shared helper for every minigame panel would be ideal).
4. Also missing from the kit, so Skate Park and Meru Burgers can't run inside it: `village-game.js`, `meru-game.js`, `vehicle-lab.js`, `Welcome Card.dc.html`. Shuffleboard doesn't need any of them.

## How it plays
- **Table:** 1 / 2 / 3 zones, a red FOUL LINE (weights short of it are dead and removed), and a HANGER (overhanging the far edge) worth 4. Side and end gutters.
- **Weights:** 2 players get 4 each per frame; 3–5 players get 3 each. The first thrower rotates each frame.
- **Scoring:** TABLE RULES (classic: only the leader scores, every weight past everyone else's best) or EVERY PUCK. Play to 11, 15 or 21; a tie at the top plays another frame.
- **Modes:** VS FOXES (1–4 CPU: Hope, Noble, RUSTY, MAPLE · EASY/MEDIUM/HARD) · PASS & PLAY (2–5 on one phone) · ONLINE (2–5, 4-letter room code + share link) · PRACTICE (solo, best frame).
- **Controls:** drag the puck sideways to pick a lane, then **swipe up** (swipe speed = power, a slanted swipe angles it slightly). Or **HOLD TO THROW**: a ghost ring walks down the table and you let go where it should stop. The ◀ ▶ buttons nudge the lane. Desktop: ←/→ or A/D, hold Space, V cycles the view.
- **Views:** AIM (behind the table) · FOLLOW (rides with the puck) · END (the scoring zone) · TOP (straight down). A small **END** inset always shows the scoring end from above.
- **Accessibility:** puck caps carry a letter as well as a colour (R, B, Y, G, P). There's a rising aim tone while holding THROW, slide/clack/thud sounds, and spoken-style results in an aria-live region. GHOST guide on/off.
- **Online sync:** the thrower sends lane + speed and every phone runs the same fixed-step physics. The thrower then sends the settled positions, so all boards match exactly. Leavers are skipped; if one player is left, they win. Tested with 3 tabs: identical boards after a knock-off.
- **Names / lines:** RUSTY, MAPLE and the CPU one-liners are **DRAFT** (the game isn't in a 2D world file).

## Try this
1. Open `Shuffleboard Phone Preview.dc.html` and check portrait + landscape menus.
2. VS FOXES → 1 fox, MEDIUM → swipe a few throws, then try HOLD TO THROW with the ghost.
3. Land a HANGER (puck overhanging the far edge) → red "HANGER" flash, +4.
4. Knock Noble's weight off with a fast throw down his lane → "· 1 KNOCKED OFF".
5. PASS & PLAY with 5 players on a phone → check the 5 score chips fit at 390 wide.
6. ONLINE: CREATE ROOM on the phone, SHARE LINK to a second phone, both READY. Host changes PLAY TO / SCORING; the others see it.
7. Close one phone mid-game → the other sees "<COLOUR> LEFT" and play continues.
8. `Shuffleboard.dc.html?embed=1&world=station` → teal Deep Space Fox room + LEAVE TABLE button.
9. VIEW button cycles AIM → END → TOP; pause menu toggles GHOST and SOUND.

Console helpers (like `window.__skate`): `__shuffle.hud()`, `__shuffle.debug()`, `__shuffle.testThrow(lane, speed)`, `__shuffle.testSpeed(k)`.
