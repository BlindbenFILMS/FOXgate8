# HANDOFF — Five Card Stud (Meru Casino poker table)

**Game:** Five Card Stud, the poker table in the Meru casino (meruCasino). It is a new stud variant beside #157 Five-card poker on the master list; suggested line: `*157b Five card stud (Meru casino)`.

## What it is
**Two games on one table.** Pick FIVE CARD STUD or TEXAS HOLD'EM on the welcome card (saved as `meruStud.game`). Same room, Kane, foxes, deck, chips, tray, music and online play.

TEXAS HOLD'EM (`HoldemTable` in `five-card-stud.js`):
- **Rules:** fixed limit, with blinds of 1 and 2, bets of 2 pre-flop and on the flop, and 4 on the turn and river. A round allows a bet and three raises. Heads-up, the button posts the small blind. Side pots and the button moving one seat each hand are handled.
- **The table:** two hole cards each. The flop, turn and river land face up across the middle, in five dashed board slots. A white D puck glides to the button. Your two hole cards fill the tray, extra large.
- **Foxes:** they play by Monte-Carlo odds over the unseen board and the other hole cards (`aiDecideHoldem`), with the same personalities as in Stud.
- **Online:** the host's choice of game rides along in every view, so friends' tables switch automatically.
- **Checked:** a sim of 300 hands at 2 and at 5 players with chips conserved, and a full board at every showdown.

- A 3D Meru-style casino room (gold trim, slot machines, treasure wheel, neon sign). You walk up to Kane's table, tap SIT DOWN, and the camera drops into your seat. Every card and chip is played on the felt.
- Rules: ante 1, one card down and one up, then three more up cards with a betting round after each. Bets are 2 on 2nd and 3rd street and 4 on 4th and 5th, with at most a bet and three raises per round. Side pots work for all-ins.
- The deck: the foxes are the face cards. J is the Fox Knave in 8 armour, Q is the Fox Queen in a dress and crown, and K is the Fox King in royal robes and crown. The portraits are rendered from the real fox-kit foxes when the game loads. The ace is the SHUTTLE and plays high. A royal flush is called "Royal Launch". The cards are sharp (2x to 2.5x textures), with rounded corners, an inked edge and a soft shadow on the felt that lifts as each card flies in.
- Heads-up (the default): you against Lyra. She sits back on the left, lined up with her name tag, and Kane deals from the top of the table, just right of centre, and both rows of cards are blown up to fill the felt, landing in dashed gold boxes printed on it, with a margin to the rail.
- Solo play: you against 1 to 4 foxes (Lyra, Grand, Ulric, Jamos, Lucius), each with a different playing style. The buy-in comes from shared save gold, up to 100. With under 10 gold you play with practice chips.
- Online play: 2 to 5 players. The host runs the table and the other foxes' hole cards are never sent to anyone else. The host can fill empty seats with foxes. Each turn has a 30-second timer, after which the player auto-checks or folds. People who join late take a seat at the next hand. Online games use friendly chips, not gold.
- Top-left: a red BACK button (it leaves the table while playing, and goes back to the casino from the welcome card).
- Phone: tested at 390x844 (deep table, buttons along the bottom) and 844x390 (wide table, buttons in a right-hand column). All buttons are 44px or larger. Kane's lines appear in a box that never covers his face. Seat tags show each fox's name, chips, last move and the hand they are showing.

- Table polish: the felt has a woven nap, lettering (MERU CASINO / FIVE CARD STUD) and a crest. There is a walnut racetrack with a gold inlay and a stitched padded rail. Kane has a deck and a chip tray on the rail, and the cards fly from that deck. Chips have striped edges and inlaid tops. A glowing gold frame marks whose turn it is. The winner's cards glow at showdown. Your hole card tips up toward you so you can peek at it, pivoting on its near edge so no part of it goes under the felt.

- Living cards: the face-card foxes are lit like a bright studio portrait on a light suit-coloured background. Every few seconds each one on the table smiles, winks (one eye) or breaks into a grin. Each Shuttle ace fires its thrusters, climbs out of a puff of smoke, then floats back down to its pad with a little bob. Only the cards on the table animate; each card texture is redrawn only while it moves.

- HAND TRAY (on by default, toggled with the cards button in the top bar): your five cards sit in a full-width leather tray at the bottom of the screen, drawn flat over the 3D table, so they are as big as the phone allows. Cards slide in as Kane deals them. The tray glows gold on your turn, and your winning cards glow at showdown. The camera then frames the table and the fox above the tray. The setting is saved as `meruStud.tray`.

- Card back: royal blue with a vignette, a fine crosshatch and diamond pattern, and rays from the centre. It has a double gold frame with corner brackets and red jewels, and gold ribbons reading "8 GATES" and "MERU CASINO". A haloed gold-ringed medallion holds a stylised faceted fox-head icon, with the four suits around it like compass points, plus sparkles and a glossy sheen. Face-down cards (and the deck) always show the fox upright to the player, chin toward the bottom of the screen.

- Face-card colours: black suits (♠ ♣) dress in black and white, red suits (♥ ♦) in red and white. The Knave wears white chest armour with black or red sleeves and trim. The chest crest on every face card is the card's own suit symbol (a red ♥ or ♦, or a black ♠ or ♣) in a white and gold medallion. Besides winking and grinning, the face foxes now also wave, with a paw raised beside the head rocking side to side.

- CARD WORKSHOP (`Meru Stud Card Workshop.dc.html`): Ben's editor for the deck. It shows live previews of the back, every face card, both Shuttle aces and pip cards, all animating, with buttons to play WAVE, WINK, GRIN or LAUNCH on demand. There are five tabs:
  - BACK: the three blues, gold, jewels, medallion, halo, ribbon wording, the fox-icon colours and size, and pattern/rays/sheen/sparkles/suits switches.
  - FACES: the name on each face card, fur, backgrounds, name bar, the suit-crest switch, and top/main/sleeve colours for Knave, Queen and King in red and black suits.
  - PAPER: paper colours, red and black ink, card edge, pip tint.
  - SHUTTLE: sky, body, wings, nose, stripe, windows, flame, label.
  - MOVES: wave/wink/grin/hop switches and the seconds between moves.

  The footer buttons:
  - SAVE (this device): the poker table uses the cards the next time it opens.
  - EXPORT FILE: downloads and copies `stud-cards.json`.
  - IMPORT: paste a style file.
  - RESET: back to the original cards.
  - UNSAVE: clears this device's copy.
- LIVE LINK: every workshop edit saves itself to this device (`meruStud.cardStyle`). An open poker table notices within 1.5 s (storage event plus a light check) and redraws every card, the backs and the deck on the rail, mid-hand and with no reload. EXPORT FILE then hands the same deck to every player.
- Card art lives in `minigames/meru/stud-cards.js` (no imports), shared by the game and the workshop. The table loads the style from this device's save first, then `minigames/meru/stud-cards.json` if that file exists, then the built-in defaults.

- Polish pass 2:
  - The 8 GATES crest is printed in the middle of the felt: a deep table-green disc that almost melts into the baize, with gold double rings and a beaded track, MERU CASINO / 8 GATES lettering, gold laurel sprigs, and the game's two-loop 8 in white with a gold edge and glow.
  - A warm pool of lamplight lies on the felt.
  - Chips are glossy clay with edge inserts and an inlaid top showing the value and MERU (1 white/blue, 5 red, 25 green, 100 black/gold). Stacks are sorted by colour in tidy clusters with a hand-stacked wobble.
  - Gold sparks burst from the pot when you win (blue when a fox wins).
- Kane wears a green dealer's visor: a snug dark-green band around the crown of his head, between his ears and above his eyes, with a stitched trim. A mostly solid green crescent brim tips gently forward and stays clear of his nose bridge, finished with a dark-green lip.
- MUSIC: a synthesised casino-lounge jazz loop with no files. It plays ii-V-I changes on electric piano, with walking bass, brushes, the odd vibraphone phrase and a soft echo. It starts on the first tap and pauses when the tab is hidden. A music button in the top bar toggles it (saved as `meruStud.music`).

## Files (new only)
- `Meru Texas Holdem.dc.html` + `Meru Texas Holdem Phone Preview.dc.html`: the same poker table, opening straight to Texas Hold'em. Both games are still on its welcome card.
- `Meru Five Card Stud.dc.html`: the page, with all overlays and `?embed=1` support.
- `Meru Five Card Stud Phone Preview.dc.html`: portrait and landscape iframes.
- `Meru Stud Card Workshop.dc.html`: the card editor.
- `minigames/meru/stud-cards.js`: the card art and style (shared by the game and the workshop). Optional: `minigames/meru/stud-cards.json`, exported from the workshop.
- `minigames/meru/five-card-stud.js`: the rules (StudTable, evalHand, aiDecide), the 3D room and table, the card art, sound and the online code.
- `minigames/meru/five-card-stud-HANDOFF.md`: this file.

## Canvas black-screen fix (built in)
- The module has **no static imports**. The page passes in `load(path)`, which tries several locations in order: the path relative to the page, then `/project/<path>`, then `/<path>` on the page origin and any parent window's origin.
- three.js, fox-kit.js and engine/duel-net.js are each loaded by their own full address. Nothing depends on `../../` links between files. I tested it from a normal URL and from a blob page (the way the canvas packs files), and both loaded the 3D table.
- If something is still missing, the page shows "The table did not load" with a TRY AGAIN button instead of a black screen.

## Save keys used
- Hold'em stats use the same names with a `meruStud.holdem.` prefix (handsPlayed, handsWon, bestPot, bestHand, firstWin, royal).
- Shared save `8gates.save.v1`: `gold` (solo buy-in and winnings, written back after every hand), and these stats:
  - `stats['meruStud.handsPlayed']`
  - `stats['meruStud.handsWon']`
  - `stats['meruStud.bestPot']`
  - `stats['meruStud.bestHand']`
  - `flags['meruStud.firstWin']`
  - `flags['meruStud.royal']`
- Local prefs: `meruStud.name`, `meruStud.sound`, `meruStud.foxes`, `meruStud.tray`, `meruStud.music`, `meruStud.game`, `meruStud.cardStyle` (the workshop's saved deck style).

## Menu line for minigames/index.html (MERU 2.0 JOBS list)
`<li><a href="../Meru%20Five%20Card%20Stud.dc.html">Meru Casino · Five Card Stud</a></li>`
`<li><a href="../Meru%20Texas%20Holdem.dc.html">Meru Casino · Texas Hold’em</a></li>`
`<li><a href="../Meru%20Stud%20Card%20Workshop.dc.html">Five Card Stud · Card Workshop</a></li>`

## Shared-file changes wanted (not made)
1. **engine/save.js**: nothing has to change. The game writes the same storage key and calls `parent.__8G_SAVE.reload()` when it runs inside a panel. A `save.mergeExternal()` would be cleaner.
2. **engine/duel-net.js**: the game calls `connectDuel({ game: 'stud', code, onJoin, onLeave, onMsg, onStatus })` and uses `send(t, d, to)` with a target id, so the host can send each player their own private view. If duel-net cannot send to one peer, add that. Without duel-net the game falls back to a BroadcastChannel test mode (same browser, other tabs only).
3. **Meru casino room (meru-game.js)**: put a poker-table hotspot on the POKER TABLE. It should open `Meru Five Card Stud.dc.html?embed=1` in the minigame panel. The BACK button sends `postMessage({ type: '8gates:minigame-back', game: 'meruStud' })` to the parent.
4. **Game HUD**: not mounted, because this is a seated card game with no joystick or melee. The page has its own LEAVE, sound and help buttons.

## DRAFT for Ben
- The 2D Meru casino file (surface_meru.html) was not in the kit, so the names, lines and look are drafts. Kane deals and Lyra plays because the design brief puts them in the casino. Grand, Ulric, Jamos and Lucius are Meru Town Square walkers.
- Stakes (ante 1, bets 2/4, buy-in up to 100) are drafts too.

## Try this
1. Open the page on a phone, hold it upright and tap SIT DOWN with 3 foxes. Check that you can read every up-card corner and every seat tag.
2. Turn the phone sideways mid-hand. The table should re-lay itself and the buttons should move to the right.
3. Keep calling until a showdown. Hole cards flip over, the pot slides to the winner and your gold changes on the welcome card.
4. Go all in with low chips against two foxes and check the side pot is right.
5. Online: tap MAKE A ROOM and share the link to a second phone. Both tap READY. Try "fill with foxes" for a 5-seat game. Let a turn time out once.
6. Play until you lose everything, then try BUY BACK IN and PRACTICE CHIPS.
7. Look for a Shuttle-high straight (A-2-3-4-5) and, if you are lucky, a Royal Launch.
