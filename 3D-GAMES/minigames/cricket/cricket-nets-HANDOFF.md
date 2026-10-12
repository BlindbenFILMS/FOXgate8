# HANDOFF — Cricket Nets [cricketNets]

**Game:** Cricket Nets (indoor cricket). Not on the numbered master list yet, so add it as a new line (suggested: **SPORTS & FIGHTING**, number 258, or wherever Ben wants it).
**World:** any. It's a netted indoor sports hall that fits inside any building on any world.
**Reference used:** Skate Park (sport/action) for the HUD mount, Phone Preview page and online lobby pattern.

## Files (all new, repo folders)
- `Cricket Nets.dc.html`: the game page (mounts the standard Game HUD; supports `?embed=1`, `?demo=1`, `?phone=1|2`, `?mode=nets|chase|bowl|pass`, `?room=CODE`)
- `Cricket Nets Phone Preview.dc.html`: 390×844 + 844×390 preview
- `minigames/cricket/cricket-nets.js`: the game module (`createCricket({ container, onState })`)
- `minigames/cricket/cricket-nets-HANDOFF.md`: this file

Uses (read-only): `vendor/three`, `fox-kit.js`, `engine/cast.js`, `engine/save.js`, `engine/textures.js`, `Game HUD.dc.html`, `_ds/modernist…`, and **`engine/duel-net.js` for online play** (same connector Skate Park uses).

## How it plays
- **Bat:** 1 DRIVE · 2 LOFT · 3 BLOCK. Tap when the timing ring turns green; the joystick angles the shot.
- **Indoor scoring:** back net on the full = 6, back net after a bounce = 4, far side net = 2, near side net / behind = 1. Out (bowled, caught, caught behind) = −5 and you keep batting. Wide = +1.
- **Modes:** THE NETS (2 overs, medals 10/18/26) · RUN CHASE (3 overs, beat a target, +50 gold, trophy) · BOWL (you bowl; keep Skipper Rusty under 16, +40 gold) · PASS & PLAY (2–5 players, one phone, 1 over each) · ONLINE (2–5 friends, each bats an innings while the others take turns bowling; 1/2/3 overs each).
- **Bowling:** stick/drag the yellow ring, bowl 1 PACE · 2 SPIN · 3 YORKER when the red dot sits in the ring.
- **Cast:** FOX SWAP picks Ben, Hope or Noble. Hope bats with the BELL BALL (blind cricket: underarm along the ground, a rattle you hear move left/right, beeps on the swing moment). Noble bats from his chair.
- **Embed:** `?embed=1` hides QUIT, shows ← BACK, and posts to the parent:
  `{ type: '8gates:minigame', game: 'cricketNets', action: 'back' }` and on each finished match
  `{ type: '8gates:minigame', game: 'cricketNets', action: 'result', mode, win, title, score }`.

## Save keys used (all prefixed `cricketNets.`)
Through `engine/save.js`:
- stats: `cricketNets.best.nets`, `cricketNets.best.chase`, `cricketNets.wins.chase`, `cricketNets.wins.bowl`, `cricketNets.best.bowlWickets`, `cricketNets.wins.online`
- flags: `cricketNets.trophy` (RUN CHASE won once), `cricketNets.medal` (any medal in THE NETS)
- item: `cricketNetsTrophy` (label "Cricket Nets Trophy")
- gold + XP via `save.addGold` / `save.addXp`

localStorage (outside the shared save):
- `cricketNets.prefs.v1`: sound cue, timing ring, sound on/off, pass-and-play player count, online overs
- reads and writes the shared FOX SWAP key `meru.combatHero.v1` (the same one the HUD uses; not a new key)

Online room channel name (fallback only): `8g-cricket-<CODE>`. Online game id for duel-net: `'cricket'`.

## Menu line to add (minigames/index.html, in the "MERU 2.0 JOBS" list or a new SPORTS list)
```html
<li><a href="../Cricket%20Nets.dc.html">Cricket Nets</a></li>
```
Master list line (Ben adds the asterisk when merged):
```
*258 Cricket nets (indoor)
```

## Shared-file changes wanted
None required. Notes:
- **`engine/duel-net.js` must be in the repo** (it isn't in the minigame kit). The game calls `connectDuel({ game: 'cricket', code, onJoin, onLeave, onMsg, onStatus })` and uses `{ id, send(type, data, toId?), leave() }`, the same shape as Skate Park. If the file is missing, online falls back to a same-device test room (works between tabs; the lobby shows "TEST · TABS").
- Nice-to-have, later: a world/building door that opens `Cricket Nets.dc.html?embed=1` in a panel and listens for the `8gates:minigame` messages above.

## Fixed this session
- **Online with 3+ players could split the score and freeze** when one phone ran slower: the host could call "NO SIGNAL · DOT" while the batter's phone had scored a 4, and a fast bowler's next ball could wipe a ball not yet counted. Now the batter's phone owns the score and sends the full innings state after every ball. Messages carry the batter index, a late phone finishes the last ball before taking the next one, and the host only steps in when the batter has been silent for 8 s (auto-bowl after 15 s, in real time).
- **Bowling camera** no longer swoops through your own bowler; it stays high and to the left of the run-up for the whole ball.
- **WATCH DEMO** mode (menu row, or `?demo=1`): the game bats by itself with captions explaining the controls; any tap takes over. The demo never touches the save.
- **Landscape start menu** is two columns so all five games and the options fit in 390 px.
- **Portrait:** the tip box hides while FOUR!/SIX!/OUT shows, so they don't overlap.
- The "Score 10 in THE NETS" quest step now completes (it pointed at a flag nothing set).

## DRAFT for Ben (not from the 2D game; cricket isn't in it)
- NPC names: **COACH BAILS** (bowls to you), **SKIPPER RUSTY** (bats when you bowl).
- Rewards: Nets up to +30 gold (runs ÷ 2), Chase +50 gold + trophy, Bowl +40 gold, Online +25 XP for the winner.

## Try this
1. Open `Cricket Nets.dc.html?demo=1` and watch the demo, then tap to play.
   Then open `Cricket Nets Phone Preview.dc.html`: both phone sizes should show the menu with every game visible (landscape = two columns).
2. THE NETS as Ben: tap DRIVE when the ring goes green; try LOFT for sixes (risky: caught = −5).
3. FOX SWAP to Hope and play THE NETS with sound on: listen for the bell ball's rattle and swing on the high beep.
4. FOX SWAP to Noble: he bats from his chair.
5. BOWL: drag the yellow ring to a good length, bowl PACE / SPIN / YORKER; keep Rusty under 16.
6. PASS & PLAY with 3–5: hand the phone over at each "TAP TO BAT" card; check the final board.
7. ONLINE on 2–5 phones: MAKE A ROOM → SHARE LINK → everyone READY. Check every phone shows the same score after each ball, including when one phone is slow.
8. Landscape on a real iPhone: thumbs reach DRIVE / LOFT / BLOCK, and nothing covers the batter.
9. `Cricket Nets.dc.html?embed=1` inside a world panel: ← BACK returns to the world.
