# One Love (one-love): Light up ONE LOVE
Files: AR/lib/minigames/onelove-light.js, AR/lib/minigames/onelove-things.js, AR/media/games/onelove/clean.jpg, AR/media/games/onelove/info.png
Export: lightUpOneLoveGame
index.js import: import { lightUpOneLoveGame } from './onelove-light.js';
index.js line: 'one-love': lightUpOneLoveGame, // Light up ONE LOVE: a reggae one-drop groove; a bird sings two notes on each dark letter, tap on the drop to light it and add an instrument
Voice prefix: love   (voice.js PREFIX: 'one-love': 'love-')
How to play (one sentence, as spoken): A bird lands on each letter and sings two notes. Then comes the drop. Tap anywhere on the drop to light the letter.

What it is:
- The seven red letters go dark. An original reggae one-drop groove plays (74 bpm, C G Am F).
- The three ink birds from the painting fly down, one letter at a time. Each bar the bird sings two notes on beats 1 and 2
  (from the letter's side), the letter fills with red from the bottom, then THE DROP (kick + rimshot) on beat 3.
- Tap anywhere (or the big red button) on the drop: the letter lights and bounces, hearts fly, and a new instrument joins:
  O bass, N skank guitar, E bubble organ, L melodica, O horns, V shaker and drums, E choir and bells.
- Each lit letter brings more colour into the black-and-white world inside the hand; the trees sway.
- The bird hops on beat 1, jumps twice as high on beat 2 and LANDS ON THE DROP (a little puff of dust). On the drop the
  letter PULSES twice, and the tap still counts for an extra 0.16 s after the drop while it pulses.
- After a hit there is one bar to hear the new instrument while the next bird flies over.
- Misses: spoken "A little early." / "A little late." / "Wait for the drop."; the timing window widens after 2 misses
  and with Help. Phones buzz on each hit.
- All seven lit: 3 bars of party (full band, birds circle the hand, colour blooms), then the finale; Anthony's own
  statement plays 2.6 s later (3D/gallery/audio/wing_0_2.mp3).
- Pause stops the band; resume restarts it on a new bar and gives a bar of listening before the next drop counts.
- Best score key: one-love:light (Perfect hits, higher is better).

Art: media/games/onelove/clean.jpg = the painting with the letters and the 3 birds painted out (so letters can bounce
and the birds can fly off); info.png = R letters mask, G inside-the-hand mask. Birds and hearts are drawn in code.

Tested: bot plays to the finale in about 52 s with all 7 perfect, no errors from the game (the only 404s in the test
copy were files that aren't in the test pack, incl. wing_0_2.mp3, which is on the real site). Phone-sized (400x860)
screenshots checked: buttons on one row, letters fill toward the drop, lit letters glow, finale panel.
Pop-ups: this game moves the kit's alert and countdown to just above the buttons (over the bottom of the painting) with a
small style tag it adds on start and removes on stop, and puts its pop-up words over the middle of the hand, so the
letters and birds stay clear. kit.js itself is untouched.
Changes needed in shared files: only the index.js lines and the voice.js PREFIX entry above, plus voice-lines.js.

More colour and flair (Ben, 3 Nov evening): a warm sunrise (gold near the hand, coral at the edges) spreads over the
cream paper as the letters light; the paper flashes gold on every drop; each letter's glow, burst, hearts and notes have
its own colour (red, gold, green, pink, orange, violet, sky); a burst of coloured rays spins out of each letter as it
lights, with floating music notes and coloured hearts; at the party, rainbow sun-rays turn slowly behind the hand and
notes and hearts in every colour rise on each beat. New props in onelove-things.js: drawNote, drawBurst, coloured hearts.
Polish (3 Nov, evening): every text box got a little breathing room via this game's own style tag (finish card inset
18 px with 20 px padding, score cells padded with smaller labels so they don't wrap badly, quote, panel, alerts, pop-ups
kept on one line). kit.js untouched.

Ending (3 Nov, late): Anthony's own clip now starts 2.2 s after the finish card comes up (right after the narrator's
last line), with the game's music dipped right down under him (4%); when he finishes the music comes back up gently, then
fades out about 7 s later. (If the clip can't play, the music comes straight back.)
VOICE SCRIPT: use new-game-notes/ANTHONY-FERRARO-VOICE-SCRIPT.txt for the voice lines (it replaces the list below and splits
longer lines into single sentences).
Voice lines for Ben to record:
love-intro-1    Light up One Love.
love-intro-2    The letters have gone dark.
love-intro-3    A bird lands on each letter and sings two notes.
love-intro-4    Then comes the drop.
love-intro-5    Tap anywhere on the drop to light the letter.
love-o          O.
love-n          N.
love-e          E.
love-l          L.
love-v          V.
love-one        One.
love-one-love   One Love!
love-listen     Listen for the drop, then tap.
love-wait       Wait for the drop.
love-early      A little early.
love-late       A little late.
love-help-1     The bird sings two notes.
love-help-2     Tap on the drop.
love-end        You lit up One Love.
(The Help button also says "Then comes the drop." = love-intro-4. Anthony's quote stays in his own words.)
