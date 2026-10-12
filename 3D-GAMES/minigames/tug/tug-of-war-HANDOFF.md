# HANDOFF — Minigame #61 · TUG OF WAR [tugOfWar]

A building interior that fits any world. The room re-dresses itself from the URL:
`?theme=hall|stone|tech|sand` (wood hall · stone keep · space deck · desert court) and `?place=<label>` (the name shown on the menu, e.g. `ZION SALOON`).

## Files made (drop into the repo at these paths)
| File | What it is |
|---|---|
| `Tug of War.dc.html` | The game page (menu, HUD, touch pads, online lobby, result card). Supports `?embed=1`. |
| `Tug of War Phone Preview.dc.html` | 390×844 portrait + 844×390 landscape (stone theme) side by side. |
| `minigames/tug/tug-of-war.js` | The game module: 3D room, 8 foxes + referee, rope physics, beat judge, CPU, online. |
| `minigames/tug/tug-of-war-HANDOFF.md` | This file. |

Note on names: the rule says `<World> <Name>`. Tug of War is world-neutral (themed by URL), so it ships as `Tug of War.dc.html` and `minigames/tug/`. Rename if you want one copy per world; nothing inside depends on the file name except the import path `minigames/tug/tug-of-war.js` in the page.

## How it plays
- **PULL** (right thumb): tap when the ring closes on the button — PERFECT / GOOD / SLIP. A drum, a tick and a short buzz mark every beat.
- **COMBO**: perfect pulls in a row. Your CPU teammates fall into your rhythm as it grows.
- **DIG IN** (left thumb, hold): brace. The rope barely moves against you and your stamina refills fast. Rivals **SURGE** with a red warning one beat ahead: be dug in on that beat to BLOCK it.
- Drag the ribbon past your tape. Best of 3 rounds, 45 s each.
- Desktop keys: SPACE / J pull · hold K or SHIFT dig in · ESC menu. Two players on one keyboard: A / hold S (left) · L / hold K (right).

## Juice (session 2)
- Cheering crowd: ~44 fans on back bleachers and side walls (instanced, 8 draw calls), team shirts and flags; they bounce when their side gains, go wild in FRENZY, slump when they lose. Fans between the camera and the rope hide themselves.
- Mud pit in the middle: at a round win the losing front fox goes face-first into it (SPLAT!), the others stumble; winners jump with arms up.
- FRENZY: 8 perfect pulls in a row. Pulls hit 35% harder, the rope glows orange on the beat, sparks at the team's feet, PULL pad turns orange. One slip ends it.
- Pop-up words over your fox (PERFECT ×N, GOOD, SLIP!, BLOCKED!), camera shake, a slow push-in as the ribbon nears a tape, confetti for the round winner.
- Music: bass line + hi-hats on the beat (double hats in FRENZY), crowd roar that rises with the excitement, referee whistle on HEAVE.
- Online snapshot now carries each puller's combo so FRENZY shows on every phone.

## Modes
1. **Solo ladder** — 4 rival teams, each unlocks the next. (DRAFT names for Ben: THE PUPS, MILL HANDS, IRON TAILS, THE ANCHORS.) First win pays full gold, repeats pay a quarter. Beating THE ANCHORS gives the trophy item.
2. **2 players · one phone** — left vs right, each with its own PULL + DIG IN. Portrait shows a "turn sideways" tip.
3. **Online · 2 to 5 players** — red vs blue (players alternate teams), CPU foxes fill each side to 4. Make a room → share link / 4-letter code → everyone taps READY. Host = lowest id; the host runs the rope, each phone judges its own beat and sends its pull. If the host leaves mid-match the next player takes over the rope (tested). Players who drop become CPU foxes.

## Save keys used (all prefixed `tugWar.`, through engine/save.js)
- flags: `tugWar.beat.pups`, `tugWar.beat.mill`, `tugWar.beat.iron`, `tugWar.beat.anchors`
- stats: `tugWar.wins`, `tugWar.bestCombo`, `tugWar.perfects`, `tugWar.onlineWins`, `tugWar.sound`
- item: `tugWarTrophy` (shown on the result card as THE GOLDEN ROPE)
- gold: solo 10 / 20 / 35 / 60 (DRAFT), online win +10. XP: 10 × rival number.

## Menu line to add to `minigames/index.html` (MERU 2.0 JOBS list, or a new STRENGTH & SPECTACLE list)
```html
<li><a href="../Tug%20of%20War.dc.html">Tug of War</a></li>
```
And mark `*61 Tug of war` in MINIGAMES_MASTER.md.

## Putting it in a world building
Open it in the world's panel/iframe:
```
Tug of War.dc.html?embed=1&theme=stone&place=Zion%20Saloon
```
Add `&demo=1` for attract mode: your fox plays itself (silent, no save writes, loops) until someone taps TAP TO PLAY. Good for a building's doorway screen.
In embed mode the menu shows BACK, which posts `{ type: '8gates:minigame', action: 'back', game: 'tugWar' }` to the parent.
Gold/items land in the shared save (localStorage `8gates.save.v1`), and save.js already syncs other open pages through the `storage` event.

## Shared-file changes wanted (NOT made — read-only rule)
1. **`engine/duel-net.js`** — not in this kit, but Skate Park already imports it in the repo. Tug of War uses the same `connectDuel({ game: 'tugWar', code, onJoin, onLeave, onMsg, onStatus })` call, so real phone-to-phone play works as soon as the file is in the repo. Without it the game falls back to a same-browser test link (two tabs), shown as "TEST · SAME DEVICE".
2. Optional: add `tugWarTrophy: 'The Golden Rope'` to the item labels list (`worlds/meru-shops.js` ITEM_LABELS) so the trophy has a proper name in the bag.
3. Optional (fox-kit.js): a "lite" fox option for crowd scenes. Ten foxes are ~950 draw calls; this module hides the outlines on tiny fox parts on phones to get it to ~760, but a lighter fox in fox-kit would help every crowd game.

## Checked
- 390×844 and 844×390: menu, how-to-play, solo match, 2-player match, online lobby, result card; all buttons 44 px+.
- All four room themes, and embed mode with a place name.
- Online: 2-player match played to the end on both phones (same score and result on both), 5 players in one room, host leaving mid-match.

## Try this
- [ ] Open `Tug of War Phone Preview.dc.html` and play a round in each frame.
- [ ] Beat THE PUPS → MILL HANDS should unlock and gold should go up on the menu stat line.
- [ ] Hold DIG IN when the red "THEY'RE ABOUT TO HEAVE" banner shows → BLOCKED!
- [ ] Two players on one phone held sideways: each thumb gets PULL + DIG IN.
- [ ] Two phones: MAKE A ROOM on one, SHARE LINK, open it on the other, both READY.
- [ ] Three to five phones: check teams alternate red/blue and CPU foxes fill the gaps.
- [ ] Close the host's browser mid-match: the rope should keep going on the other phones.
- [ ] Try `?theme=tech&place=Deep%20Space%20Fox` and `?theme=sand&place=Kufa%20Court`.
- [ ] Open `Tug of War.dc.html?demo=1`: it should play itself, then TAP TO PLAY opens the menu.
- [ ] Hit 8 perfect pulls in a row: FRENZY banner, orange pad, glowing rope, crowd goes wild.
- [ ] Win a round: the other front fox should splat into the mud, confetti on your side.
- [ ] Ben: confirm or rename the 4 rival teams and gold amounts (DRAFT).
