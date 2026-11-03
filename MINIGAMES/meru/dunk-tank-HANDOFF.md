# HANDOFF · #62 Dunk Tank (Meru, re-themes to any world)

STATUS: playable and tested in the kit (Chromium at 390x844 + 844x390).
Tested: menu (both orientations), solo rounds 1 + 3 incl. wind arrow (both orientations), bullseye dunk + splash, aim sound toggle,
party (3 players, pass-the-phone screen, leader moves to the seat), online with 3 tabs over the local fallback link
(room code, ready, countdown, same score on every screen, seat goes to the leader, a player leaving mid-game).
NOT tested: real engine/duel-net.js between two real phones (it isn't in the kit) — test that first after merging.
A phone that falls behind (e.g. screen locked for a moment) fast-forwards through queued throws to catch up.

## Files (new only)
- `Meru Dunk Tank.dc.html` — the page (add `?embed=1` for a world panel; BACK posts `{type:'8gates:minigame', game:'dunkTank', action:'back'}` to the parent; `?world=gaya|jidda|kufa|luxor|nebo|ur|zion|home|earth|station` re-themes; `?room=ABCD` joins an online room)
- `Meru Dunk Tank Phone Preview.dc.html` — 390x844 + 844x390 side by side
- `minigames/meru/dunk-tank.js` — game module (`createDunkTank({ container, onState, world, embed })`)
- `minigames/meru/dunk-tank-HANDOFF.md` — this file

## Modes
- SOLO: 3 rounds x 5 balls — STILL (full aim line) → SLIDER (moving target, shorter line) → STORM (slide + bob + wind).
- PARTY: 2–5 players, one phone, one ball each in turn, leader sits on the seat.
- ONLINE: 2–5 players over `engine/duel-net.js` (`connectDuel`, game key `dunkTank`). Leader sits on the seat and can tap TAUNTS. Host picks target + balls. If duel-net.js is missing (as in the kit), it falls back to a same-browser tab link for testing; `?net=local` forces that.
- AIM SOUND (on by default, H key): pitch + beep speed climb as the aim lines up with the bullseye, panned left/right — play by ear.

## Save keys (engine/save.js)
- stats: `dunkTank.best`, `dunkTank.dunks`, `dunkTank.played`, `dunkTank.onlineWins`
- flag: `dunkTank.trophy` · item: `dunkTankTrophy` (score 1200+ in solo, once)
- gold (solo: score/20) + XP (solo score/10, online score/20)
- local prefs (not game save): localStorage `dunkTank.prefs`

## Menu line for minigames/index.html
`<li><a href="../Meru%20Dunk%20Tank.dc.html">Dunk Tank</a></li>` (MERU 2.0 JOBS list) · add * to "62 Dunk tank" in MINIGAMES_MASTER.md

## Shared-file changes wanted
- Game HUD / item labels: add label `dunkTankTrophy: 'Dunk Tank Trophy'`.
- None required otherwise. Helpers (gradient, glow, fitShot) were copied in, per PARALLEL RULES.

## DRAFT for Ben
- Seat-sitters (solo): MICHAEL JAY, FLICK, DOC BRAUN (names borrowed from Meru Burgers customers). All taunt/dunk lines are DRAFT.
- World colour palettes, scoring (bull 100 + dunk 50, inner 50, outer 25, streak +10), trophy at 1200, gold/XP rates.

## Try this
1. Solo round 1: drag up-right until the ring on the target turns green, let go → dunk.
2. Round 3: watch the WIND arrow and aim into it.
3. Turn AIM SOUND on, close your eyes, aim by the beep.
4. Party with 3 players: check PASS THE PHONE screen and that the leader moves to the seat.
5. Online: two phones, CREATE ROOM, SHARE LINK, both READY; try TAUNT buttons while on the seat.
6. Rotate the phone mid-game; target + seat-sitter's face must stay clear of panels.
