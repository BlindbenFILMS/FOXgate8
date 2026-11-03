# HANDOFF — #258 CAPSULE CORNER (capsule vending machines)

**New game. It is not on the master list yet.** Suggested spot: ARCADE CABINETS, next to 38 Claw crane → `*258 Capsule Corner`.
**World:** any. It is a building interior that fits any shop, arcade, mall, station or home on any world.

Three bubble-capsule machines stand side by side: **MUSCLE FOXES · MONSTER TRUCKS · CREATURES**. Each machine holds 8 figures (4 common, 2 rare, 1 super, 1 golden), so there are 24 to collect.

## How it plays
1. **Pay:** 1 free capsule per day, then 10 gold each, or 5 ★ stars.
2. **Turn the crank** by spinning it round with a finger (clockwise only, like a real ratchet), or by holding the red button or Space. A light chases round the 12 bulbs on the collar. If the turn finishes while the light is on the **★ bulb**, it is a **LUCKY SPIN** and the odds get better.
3. **The capsule drops** through the globe, rattles inside the cabinet, pushes the flap open and bounces into the tray.
4. **Tap it.** It flies up to the camera. **Twist the top 3 times** (tap or swipe) and it pops.
5. **The figure is revealed** with rays in the rarity colour, confetti, a fanfare and a NEW! or DOUBLE badge. Then **PUT IT ON THE SHELF**.
6. **SHELF:** shows all 24 figures as 3D thumbnails. Missing figures show as dark silhouettes marked ???.

- **Doubles give stars:** common or rare +1, super +2, golden +3. 5 stars buy a free capsule.
- **Pity:** after 9 capsules in a row from one machine with nothing super or better, the next one is super or golden.
- **Finishing a machine (8/8)** gives +50 gold, +25 XP and a trophy item. **All 24** gives another +100 gold.
- Odds (normal / lucky): common 60/30 · rare 28/40 · super 10/22 · golden 2/8.

## Multiplayer: CAPSULE PARTY (up to 5 online)
- PARTY → CREATE ROOM (4-letter code + SHARE LINK), or type a friend's code. Everyone taps READY, and the lowest id hosts.
- **5 rounds.** Every round uses one machine (the host deals all three, then two random ones). Everyone turns their own crank at the same time.
- **Score:** common 1, rare 3, super 6, golden 12, +2 for a lucky spin. A results card follows every round, then the final standings. The winner gets +30 gold and everyone else +10.
- Party capsules are free and **do** count toward your shelf (DRAFT: tell me if they shouldn't).
- **GIFT A DOUBLE:** in a room, SHELF cards you own 2+ of get a GIFT button. Pick a friend and they get the figure.
- Networking uses `engine/duel-net.js` (the same `connectDuel` call as Skate Park, game key `'capsule'`). If that file can't load, the game falls back to a tab-to-tab test on one device (the status shows `TEST · THIS DEVICE`). I tested the whole party with 2 players this way: 5 rounds, results, final and gold.
- `?room=ABCD` in the URL auto-joins a room. SHARE LINK builds this URL.

## Files made (new files only, no shared file was edited)
- `Capsule Corner.dc.html` — the page (UI overlays, shelf, party lobby, help)
- `Capsule Corner Phone Preview.dc.html` — 390×844 + 844×390 side by side
- `minigames/capsule/capsule-corner.js` — the 3D room, the 3 machines, 24 figures, game loop, synth sounds, party netcode
- `minigames/capsule/capsule-corner-HANDOFF.md` — this file

Shared files it **imports read-only**: `vendor/three`, `fox-kit.js` (muscle foxes are `makeFox` with the `boxer` outfit plus added muscles and props), `engine/vehicle-kit.js` (monster trucks are `make('truck')` repainted through a remapped `toon()`), `engine/creature-kit.js` (creatures), `engine/textures.js` (crestTex), `engine/save.js`. Optional: `engine/duel-net.js`.

## Saved data (all through engine/save.js, all prefixed `capsuleCorner.`)
| kind | key |
|---|---|
| stat | `capsuleCorner.owned` — `{ figId: count }` |
| stat | `capsuleCorner.stars` |
| stat | `capsuleCorner.freeDay` — `YYYY-MM-DD` of the last free capsule |
| stat | `capsuleCorner.spins`, `capsuleCorner.lucky`, `capsuleCorner.partyWins` |
| stat | `capsuleCorner.lastSeries` |
| stat | `capsuleCorner.pity.muscle`, `capsuleCorner.pity.truck`, `capsuleCorner.pity.creature` |
| flag | `capsuleCorner.seenHelp` |
| flag | `capsuleCorner.done.muscle`, `.done.truck`, `.done.creature`, `.done.all` |
| item | `capsuleCorner.trophy_muscle`, `capsuleCorner.trophy_truck`, `capsuleCorner.trophy_creature` |
| shared | gold (spend / add), XP (+2 per capsule, +5 if new, +25 per finished machine) |

## Menu line for minigames/index.html
Add to the "MERU 2.0 JOBS" list (or a new "ARCADE" list):
```html
<li><a href="../Capsule%20Corner.dc.html">Capsule Corner</a></li>
```
Master list: add `*258 Capsule Corner` (ARCADE CABINETS).

## Putting it in a building (any world)
- **Panel:** `Capsule Corner.dc.html?embed=1` shows a **← BACK** button that posts
  `{ type: '8gates:minigame', action: 'back', game: 'capsuleCorner' }` to the parent window.
- **Open on one machine:** `&series=muscle` | `truck` | `creature` (for example, a garage on Zion opens on the trucks).
- No Game HUD on this page, the same as Meru Burgers (it's a counter/arcade interior with its own top bar: gold, stars, shelf, party, sound, help).

## Shared-file changes I'd like (not made)
1. **Item labels:** add to the item label list (`worlds/meru-shops.js` ITEM_LABELS):
   `capsuleCorner.trophy_muscle: 'Muscle Foxes Trophy'`, `capsuleCorner.trophy_truck: 'Monster Trucks Trophy'`, `capsuleCorner.trophy_creature: 'Creatures Trophy'`.
2. **duel-net.js:** if it caps rooms at 4 players, raise it to 5 for game `'capsule'`. The page already handles 5 (RED, BLUE, GOLD, GREEN, PINK).
3. *(Nice to have)* A world-side listener for the `8gates:minigame` back message, so every embedded minigame closes the same way.

## DRAFT for Ben (my picks, change freely)
- Price 10 gold · 5 stars per free capsule · daily free capsule · rarity odds and points · party prizes (30 / 10 gold).
- All muscle fox and truck names and lines: FLEX FOX, BENCH BANDIT, IRON TAIL, PROTEIN PUP, ARCTIC CRUSHER, STAR SLAMMER, BARBELL BOSS, GOLDEN GAINS · RED RUMBLE, MUD MUNCHER, BLUE BOOMER, LIME LOCO, FOX FURY, SHARK BITE, GALAXY GRINDER, GOLDEN GROWLER.
- Creatures keep their creature-kit names: Sporeling, Ember, Hornet, Flamingo, Crystal Crab, Thornback, The Painted Giant (super), Hive Queen (golden). To swap one, change `kit:` in `FIGS`. Any name from `creatureKit().families` works.
- Everything is in the `FIGS`, `RARITY` and `SERIES` tables at the top of `capsule-corner.js`. Adding a 4th machine means adding a series and 8 figures there.

## Try this
- [ ] Open `Capsule Corner Phone Preview.dc.html`, check both phones, then take the FREE CAPSULE and do one full spin with your finger on the crank.
- [ ] Try to finish the turn with the light on the ★ to see LUCKY SPIN!
- [ ] Twist with swipes instead of taps.
- [ ] Open SHELF and check the silhouettes, then the colour figure you just got.
- [ ] Swipe left/right on the machines (or use ←/→ on desktop) to change machine.
- [ ] Test mode: `Capsule Corner.dc.html?test=1&force=m8` always gives GOLDEN GAINS from the muscle machine (`t8` = Golden Growler, `c8` = Hive Queen). It only works with `test=1`.
- [ ] Party: open the page on 2 phones → PARTY → CREATE ROOM → SHARE LINK → the other phone opens it → both READY → play 5 rounds.
- [ ] In a party room, own a double, open SHELF and use GIFT A DOUBLE.
- [ ] Embedded: `?embed=1&series=truck` and press ← BACK.
- [ ] Desktop keys: Space/Enter = main button (hold Space to turn), ←/→ machine, C shelf, P party, M sound, H help, Esc closes.
