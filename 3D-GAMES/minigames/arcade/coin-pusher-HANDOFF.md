# HANDOFF — Minigame #42 · Coin Pusher / Penny Falls  `[arcadeCoinPusher]`

**Status:** built, playable, tested at 390×844 and 844×390. Online play was tested with 3 phones (simulated in the test browser).

A penny-falls cabinet in a small arcade room. It doesn't belong to one world. Any building on any world can host it: add `?world=` to the link and the cabinet, marquee, neon and room sign change to that world's colours (DRAFT names below).

## Files made (new files only, in repo folders)
| File | What it is |
|---|---|
| `Arcade Coin Pusher.dc.html` | The game page: top bar, DROP and aim controls, bonus reel, intro card, online lobby, results, help. Supports `?embed=1`. |
| `Arcade Coin Pusher Phone Preview.dc.html` | Portrait 390×844 and landscape 844×390 side by side (same as the Skate Park preview). |
| `minigames/arcade/coin-pusher.js` | Engine module: cabinet and room, coin physics, rules, economy, online Token Race, the local test network. |
| `minigames/arcade/coin-pusher-HANDOFF.md` | This file. |

No shared file was edited. Read-only imports: `vendor/three/three.module.js`, `engine/save.js`, `engine/cast.js` (the player stands at the cabinet in the intro), `fox-kit.js`, `engine/textures.js`. When `engine/duel-net.js` exists in the repo, online play uses it. If it doesn't load, the game falls back to a same-browser test channel between tabs.

## Link options
- `?world=meru|gaya|jidda|kufa|luxor|nebo|ur|zion|home|earth|station` picks the theme (default `meru`). **DRAFT** place labels: MERU ARCADE, GAYA ARCADE, JIDDA BOARDWALK, KUFA BAZAAR, LUXOR ARCADE, NEBO ARCADE, UR ARCADE, ZION SALOON, HOME ARCADE, EARTH ARCADE, DEEP SPACE FOX. Each world keeps its own saved board.
- `?embed=1` shows BACK and LEAVE buttons. They post `{ type: '8gates:minigame', action: 'back', game: 'arcadeCoinPusher' }` to the parent window.
- `?room=ABCD` joins an online room straight away (this is the share link).
- `?play=1` skips the intro and starts free play.
- For testing: `?race=20` makes a short race (the host's value is used), `?net=local` forces the tab-to-tab test channel, and `?pdb=1` is only for headless screenshot tests.

## Save keys used (all prefixed `arcadeCoinPusher`)
Through the shared save (`engine/save.js`):
- stats: `arcadeCoinPusher.tokens` (your token cup), `arcadeCoinPusher.pot` (free-play jackpot pot), `arcadeCoinPusher.won` (lifetime coins won), `arcadeCoinPusher.bestRace`, `arcadeCoinPusher.cashDay`, `arcadeCoinPusher.cashToday` (daily cash-out cap)
- flag: `arcadeCoinPusher.welcome` (free first cup of 10 tokens given)
- item: `arcadeCoinPusher.charm` (Fox Charm prize; the label is exported as `ITEM_LABELS`)
- gold and XP go through `save.addGold`, `save.spend` and `save.addXp`

Game-local localStorage (not the shared save, because it's large and only this machine uses it):
- `arcadeCoinPusher.board.v1.<world>`: the saved coin layout for free play, one per world

## Menu line to add to `minigames/index.html`
Add it to the "MERU 2.0 JOBS" list:
```html
<li><a href="../Arcade%20Coin%20Pusher.dc.html">Arcade Coin Pusher</a></li>
```
Then mark **#42** with an asterisk in MINIGAMES_MASTER.md: `*42 Coin pusher / penny falls`.

## Shared-file changes wanted (not made)
1. **engine/duel-net.js**: the race calls `connectDuel({ game: 'coinpusher', code, … })` with up to **5** players. Please check that duel-net accepts the new game name `coinpusher` and doesn't cap rooms at 4. The page itself caps rooms at 5.
2. **Inventory labels**: add `arcadeCoinPusher.charm: 'Fox Charm'` wherever item labels live (Skate imports `ITEM_LABELS` from `worlds/meru-shops.js`), so the bag shows a nice name.
3. Optional, **engine/restaurant-kit.js `cameraFit`**: the game copies it and adds a RIGHT inset (used for the landscape control column). If you like that, it could go into the shared copy.

## DRAFT numbers for Ben to approve
- Tokens: **5g buys 25**. Cash out **10 tokens = 1g**, at most **30g a day** (stops gold farming). The first visit gives **10 free tokens**.
- Prizes: Gem = 5 tokens · Gold Bar = 3 gold · Fox Charm = item + 10 XP. Big Coin = 8 tokens.
- Bonus reel odds: Shower 4 coins (30) · Big Coin (20) · Walls Up 20 s (14) · Power Push 12 s (14) · Prize (13) · Jackpot (9).
- Token Race: 30 race tokens, 90 s, then 5 s for the last coins to fall. Rewards: 1st 15g + 25 XP · 2nd 8g + 12 XP · 3rd and lower 3g + 5 XP. The shared pot starts at 10.
- The board pays out about 82% from the front edge; drains take about 18%. Bonuses lift it to roughly 100% with careless aim and above that with good gate timing. The daily cash cap keeps that safe.

## How it works (short)
- **Physics:** a light model built for phones, no physics engine. Coins are discs on three surfaces: the shelf top, the bed and one stacked layer. Each 60 Hz step costs about 0.13 ms.
- **Drawing:** all coins are one InstancedMesh plus one outline mesh, so about 3 draw calls for around 100–250 coins. Shadows are off on touch devices.
- **Online:** the host is the lowest id. The host sends `{k:'start', t0, seed, dur, ids, mid}`, so every phone builds the **same seeded board**. Each phone runs its own physics and sends its score every 0.6 s. The host owns the shared jackpot pot: drains feed it, and the first JACKPOT claim wins it.
- **Engine API:** `createCoinPusher({ container, onState, world })` returns `{ start, toIntro, drop, hold, setAim, nudge, buy, cashOut, raceBegin, netRecv, netDrop, netEnd, mute, setSafe, destroy, sim, forceBonus, reset }`.

## Try this
1. Open `Arcade Coin Pusher Phone Preview.dc.html` and check both phone sizes.
2. Tap **FREE PLAY**. Drag across the board to aim (watch the yellow drop line), tap the board to drop one token, then **hold DROP** to auto-feed.
3. Time a drop so it falls through the moving **BONUS** gate on the back wall. The reel spins at the top. Or open the console and run `__coinPusher.forceBonus('jackpot')` (or `shower`, `big`, `walls`, `push`, `prize`).
4. Watch a coin slide into a **red corner drain**: the JACKPOT number goes up by 1. After a **WALLS UP** bonus, green guards cover the drains for 20 s.
5. Spend down to 0 tokens. **BUY 25 · 5g** appears in the bottom bar.
6. Tap **MENU**, then **CASH OUT** (10 tokens = 1g). Reload the page: your tokens and the exact board are still there.
7. Try `?world=jidda` and `?world=station` to see the re-skins.
8. Online: tap **ONLINE TOKEN RACE**, then **CREATE ROOM**, and **SHARE LINK** to a second phone (or a second tab for a local test). Both tap **READY**. You get a 3-2-1, the same board on both phones and a live scoreboard. Hit a jackpot on one phone: the other phone sees "<COLOUR> TOOK THE JACKPOT".
9. Try 3–5 players. Portrait shows a score strip under the top bar; landscape shows a score column on the left.
10. Embedded: `?embed=1` shows BACK in the top bar and LEAVE on the intro card.

## Known limits / later
- If a phone leaves the app mid-race, its own board pauses, but the race clock keeps running and its last score still counts.
- No music: the sound effects are small built-in synth sounds (clink, win chime, drain thud, reel tick, jackpot fanfare). The SOUND button mutes them.
- v2 ideas: an attendant fox at a token desk, a prize-counter shop for charms, tilt alarm, a seasonal prize per world.
