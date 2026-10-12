# HANDOFF · Minigame #46 · Coconut Shy / Tin Can Alley

A carnival stall interior that fits inside any building on any world. First-person: swipe up to throw (a longer swipe throws harder). Three rounds:
1. **Tin Can Alley**: three pyramids of cans, 6 balls.
2. **Coconut Shy**: five coconuts in cups, 6 balls. A square hit knocks one out, and every hit loosens it.
3. **The Runaway Shelf**: a sliding pyramid with two coconuts up top, 8 balls.

The barker fox runs the stall. Your fox stands at the counter, and in pass & play each player gets their own fox.

## Play modes
- **Solo**: 3 rounds, then a prize.
- **Pass & play**: 2–5 players on one phone. Turn by turn, with the same stall layout for everyone, standings after every round, and a winner screen.
- **Online**: 2–5 phones, peer to peer through `engine/duel-net.js` (game key `coconutShy`). Every phone gets the same seed, so everyone gets the same stall, with live scores. One player makes a 4-letter room, the others join by code or by the shared link (`?room=ABCD`). Everyone taps READY and the host starts it. If `engine/duel-net.js` is missing, it falls back to a same-browser test channel (tabs), shown as "TEST · TABS".
- **How to play**: a self-playing demo.

## Files made (all new, nothing shared was edited)
- `Carnival Coconut Shy.dc.html`: the page (menu, HUD, cards, online lobby). Supports `?embed=1` (BACK posts `{type:'minigame:back', game:'coconutShy'}` to the parent), `?phone=1|2`, `?demo=1` (plays the demo and loops it until someone touches the screen) and `?room=ABCD`.
- `Carnival Coconut Shy Phone Preview.dc.html`: playable 390×844 and 844×390 side by side, plus a third phone running the looping demo.
- `minigames/carnival/coconut-shy.js`: the game module (3D stall, throw physics, rounds, pass & play, online, audio).
- `minigames/carnival/coconut-shy-HANDOFF.md`: this file.

## Save data used (all prefixed `coconutShy`)
Through `engine/save.js` (shared save `8gates.save.v1`):
- stats: `coconutShy.best`, `coconutShy.plays`, `coconutShy.wins` (online wins)
- flags: `coconutShy.played`, `coconutShy.giantPlush`
- items: `coconutShyPinwheel` (200+), `coconutShyCoconut` (400+), `coconutShyGiantPlush` (600+)
- gold and XP: `save.addGold` / `save.addXp` at the end of each game

Own localStorage (settings only): `coconutShy.settings` (`{aimHelp, sound}`).

## Menu line to add (minigames/index.html, in the MERU 2.0 JOBS list or a new CARNIVAL list)
```html
<li><a href="../Carnival%20Coconut%20Shy.dc.html">Coconut Shy · Tin Can Alley</a></li>
```
In MINIGAMES_MASTER.md: `46 Coconut shy / tin can alley` becomes `*46 Coconut shy / tin can alley`.

## Shared-file changes wanted (not made)
- **engine/save.js / item list**: add display names for the three prize items (`coconutShyPinwheel` "Pinwheel", `coconutShyCoconut` "Coconut", `coconutShyGiantPlush` "Giant Fox Plush") wherever the bag or menu looks up item names. The module exports `ITEM_LABELS` for this.
- **engine/duel-net.js**: no change needed. The game uses `connectDuel({game, code, onJoin, onLeave, onMsg, onStatus})` exactly like Skate Park.
- The toon helpers (gradient, outline, small math) are copied into the module per the PARALLEL RULES. No change is needed in fox-kit or engine.
- **_ds/…/styles.css**: it loads Archivo 400/600/800 only, but the HUDs ask for 900. This page adds its own Archivo 700/800/900 link. Adding 900 to the design system's font link would fix every game at once.

## DRAFT for Ben (not from a 2D world file)
- The barker's lines, the prize names, the score thresholds (200 / 400 / 600) and the gold amounts are all marked DRAFT in `coconut-shy.js` (`PRIZES`, `SAY`, `PTS`).

## Accessibility
- **AIM EASY / FREE** toggle: a dotted path and target ring while you swipe.
- **Sound aim**: hot/cold ticks, panned left and right to where the throw will land. Hits clang or thunk on the side they happen, for low-vision players.
- **Keyboard**: arrow keys aim and set power, Space throws.
- All buttons are 44px or larger. The camera reframes around the panels in portrait and landscape. Known: in landscape play, the score card sits over the barker's head at the far left (he only speaks through the bubble at the bottom). Moving him is a possible later polish.

## Tested (this chat)
- 390×844 and 844×390: menu, play, turn card, round card, results, online lobby.
- A full solo game reaches the prize card, and save data is written.
- Pass & play with 3 and 5 players: turn order, standings and the winner screen are correct.
- Online with 3 phones: lobby, ready, auto-start, live scores, the same final standings on every phone. Tested on the local fallback channel; please retest with the real `duel-net.js` across two phones.
- `?embed=1` BACK sends the parent message.
- Graphics polish:
  - **Can labels**: redrawn at the can's real proportions, with every word the same size and fitted to the front of the can. Each can is turned to face you, so no more half words ("X F", "ANBE").
  - **Stall sign**: rebuilt as a marquee board with bulbs, a red pinline and a TIN CAN ALLEY ribbon. Title and ribbon text are measured to fit with wide margins. It now sits in front of the net, so no grid lines cross it, and stays on screen in landscape: the landscape play camera looks slightly higher.
  - **Pop-ups** (+10, +50, CLEAR, WOBBLE): fitted to a wider canvas with rounded outlines, so long words are no longer cropped. Pop-ups that land close together stack instead of printing over each other.
  - **Fonts**: all canvas text waits for Archivo to load, instead of drawing in a wider fallback font.
- Text fit (checked by script in every state at 390×844 and 844×390: nothing clipped, at least 10px side margin):
  - The AIM, SOUND and MENU buttons are 76×52.
  - Menu prize cells have more padding, and names wrap instead of cutting off.
  - The prize banner shows the prize name with "SAVED TO YOUR BAG" / "WON BY BLUE" underneath.
  - The score card keeps "THE RUNAWAY SHELF" whole (it used to cut off as "THE RUNAWAY SH…").
- Fixed this chat: in landscape with 5 players, the round card and results card pushed their main button off screen. The header and buttons now stay pinned and only the list scrolls.

## Try this
1. Open `Carnival Coconut Shy Phone Preview.dc.html`. Both phone views should load the stall with the barker at the counter.
2. Play solo on an iPhone. Swipe short for a soft lob and long for a fast throw. Clear a full pyramid for the +25 bonus.
3. In round 2, hit the same coconut twice: it wobbles, then falls.
4. Turn AIM to FREE and play a round by sound only (headphones). The ticks should lead you onto the cans.
5. Pass & play with 5: check that the PASS TO button is visible in landscape, and that the winner's fox steps forward at the end.
6. Online: open on two phones, CREATE ROOM on one and SHARE LINK to the other. Both tap READY, play, and both should show the same final standings. Then try REMATCH.
7. Open it inside a world building with `?embed=1` and check that BACK closes the panel.
8. Look at the cans up close in each round. Every word (FOX, BEAN, PEA, 8) should face you whole, and the sign should be fully on screen in landscape.
