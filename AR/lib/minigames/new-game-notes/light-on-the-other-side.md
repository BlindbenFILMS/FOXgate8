# Light on the Other Side (light-on-the-other-side): Keep rolling
Files: AR/lib/minigames/roll-keep.js, AR/lib/minigames/roll-things.js, AR/media/games/roll/clean.jpg, AR/media/games/roll/sk-body.png,
  AR/media/games/roll/sk-cane.png, AR/media/games/roll/sk-leg.png (skater.png = the whole cut-out, kept for reference, not loaded)
Export: keepRollingGame
index.js import: import { keepRollingGame } from './roll-keep.js';
index.js line: 'light-on-the-other-side': keepRollingGame, // Keep rolling: skate through the dark wave; jump when the cane hits something; fall, get back up, reach the light
Voice prefix: roll   (voice.js PREFIX: 'light-on-the-other-side': 'roll-')
How to play (one sentence, as spoken): Listen to his cane. When it hits something, jump!

What it is:
- Anthony is cut out of the painting (drawn 1.7x bigger so he reads on a phone) and skates down the road through the
  dark wave; the road flows past, the wave churns, the wheels rumble, his cane taps ahead (tik… tik…).
- Ten things come out of the light toward him (crack, curb, puddle, rock, cone, painted in roll-things.js). You hear each
  one rumble closer from the left, then the cane HITS it (each has its own sound). From that moment there's about half a
  second to jump: tap anywhere or press JUMP and he ollies over it. Jumping 0.16 to 0.42 s before it reaches him = SMOOTH.
- Miss: he falls, lies there a moment, gets back up and keeps going. No game over, no lost progress.
- Each thing he gets past sends a spark of light to the burst: the light grows, the dark pulls back, and the music turns
  from a dark D-minor drone to a hopeful D-major groove (arpeggio from 3, tune from 7). It speeds up a little each time.
- At ten he rolls right into the light (white-out), then the finale; Anthony's own statement plays 2.6 s later
  (3D/gallery/audio/wing_0_1.mp3, 20 s).
- Help: says how, and slows the next things down a little.

Added in round 2 (Ben asked for all six):
1. THE CANE LIGHTS THE WAY: every cane tap sends a ripple of light along the road; things glow when a ripple reaches them
   and light up bright when the cane hits them.
2. ANTHONY'S OWN VOICE mid-run, cut from 3D/gallery/audio/wing_0_1.mp3 by the pauses between his phrases (BITS in the
   file, seconds): halfway = 9.70-13.45 "giving up is just not an option ever. So you have to keep going.";
   first dark wave = 15.55-17.75 "it always keeps getting dark and light again"; after the first light moment =
   18.0-20.3 "the dark helps you enjoy those light moments"; 2nd fall = 11.75-13.45 "So you have to keep going."
   His words also show on screen. The music ducks under him. PLEASE CHECK BY EAR that each piece starts and ends cleanly.
   (A game can pass work.statementAudio to use another copy of the file; the preview does this.)
3. DARK AND LIGHT: after 3 and after 7 things, a dark wave rolls over for 2 things: the picture goes almost black, the
   music muffles, the things only show when the cane's light reaches them. Then "The light is back": 7 sparks float
   around him for about 6 s; each tap catches one (chimes up the scale; they twinkle from their side).
4. FLOW: 3 SMOOTH jumps in a row: he spins in the air (360), leaves a trail of light, a beat kicks in. Resets on a
   non-smooth jump or a fall.
5. HAPTICS: each thing has its own buzz when the cane hits it (crack double, curb long thud, puddle ripple, rock, cone).
6. TWO IN A ROW: from 5 things on, up to 2 pairs come 1.15 s apart (not in dark waves).
Round 3: Anthony is now three pieces (body, cane, back leg). His cane sweeps side to side, tapping the road at each
end of the sweep in time with the tik… tik…; every 2-3 s (when nothing is close) his back leg reaches down to the road and
pushes, with a scuff sound, and he dips as he pushes.
Round 4: THREE LANES. LEFT = toward us (lower on the screen), MIDDLE, RIGHT = away (higher up), across the road.
Buttons: ◀ LEFT · JUMP · RIGHT ▶ in the kit's row, and HELP in its own slim bar along the bottom (the game makes it and
removes it on stop). Swipe left/right also changes lanes; a tap anywhere still jumps. The game's style tag moves the
kit's row up to 122 px and puts Help at 64 px from the bottom, just above the viewer's own bottom bar (#topBar, 52 px):
PLEASE CHECK on a phone in the real viewer that Help sits above the Stop bar and nothing overlaps.
Things come in a lane. In your lane the cane hits it: jump, or move out of the lane. In the next lane the cane only
brushes it (its sound, quieter, from that side) and it rolls past ("AROUND IT!", counts as past). From 2 things on,
up to 2 "walls" block two lanes at once (jump, or find the free lane). The approach rumble comes from the thing's side.
The cane now sweeps across BOTH sides of his path: out in front of him on his left, then behind his feet on his right,
tapping at each end (left tap panned left, right tap panned right), and the ripples land on each side.
The panel shows which lane he's in.
Finale cells now: Past, Light caught, Got back up. Bot run: about 72 s, every mode reached (dark, flow, light moments,
a fall), no errors.
- Pop-ups: like One Love, this game moves the kit's alert and countdown just above the buttons (a style tag it adds on
  start and removes on stop) and puts its pop-up words above him, so he and the road stay clear. kit.js is untouched.
- Best score key: light-on-the-other-side:roll (fewest falls).

Art: media/games/roll/clean.jpg = the painting with Anthony painted out; skater.png = Anthony cut out (3x, with alpha).

Tested: bot plays to the finale in about 65 s (it misses the 3rd thing on purpose to test falling and getting back up),
no errors from the game (only 404s in the test copy: files not in the test pack, incl. wing_0_1.mp3, which is on the
real site). Phone-sized (400x860) screenshots checked; playable preview published for Ben.
Changes needed in shared files: only the index.js lines and the voice.js PREFIX entry above, plus voice-lines.js.

Polish (3 Nov, evening): every text box got a little breathing room via this game's own style tag (finish card inset
18 px with 20 px padding, score cells padded with smaller labels so they don't wrap badly, quote, panel, alerts, pop-ups
kept on one line). kit.js untouched.

ANTHONY IS HEARD IN FULL (Ben: "we need to hear it all, even if we need to pause"): whenever a piece of Anthony's
recording plays mid-run, THE RIDE PAUSES: nothing moves toward him, the cane and the spawns stop, jumps and lane changes
wait ("Listen…"), the road barely drifts, the music ducks, and any narrator line waits until he has finished. Then the
ride carries on. His recording is now decoded once at the start and each piece is played straight from it (exact start
and end, no seeking an audio element, which some servers can't do). The pieces were widened to start and end in the
quiet between his phrases. UPDATED to WHOLE LINES (Ben: "he should complete his line"), captions word for word:
  giveUp 8.85-13.50 "And it's like giving up is just not an option, ever. So you have to keep going." (halfway)
  darkLight 13.75-17.85 "And I think it always keeps getting dark and light again." (first dark wave)
  enjoy 17.85-20.40 "And it's like the dark helps you enjoy those light moments." (after the first light moment)
  keepGoing 11.60-13.50 "So you have to keep going." (second fall)
  Each has a 40 ms fade in and 120 ms fade out (no clicks).
Ending (3 Nov, late): Anthony's own clip now starts 2.2 s after the finish card comes up (right after the narrator's
last line), with the game's music dipped right down under him (4%); when he finishes the music comes back up gently, then
fades out about 7 s later. (If the clip can't play, the music comes straight back.)
VOICE SCRIPT: use new-game-notes/ANTHONY-FERRARO-VOICE-SCRIPT.txt for the voice lines (it replaces the list below and splits
longer lines into single sentences).
Voice lines for Ben to record:
roll-intro-1    Keep rolling.
roll-intro-2    Anthony is skating through the dark, toward the light.
roll-intro-3    Listen to his cane.
roll-intro-4    When it hits something, jump!
roll-intro-5    If you fall, get back up and keep going.
roll-up         Get back up.
roll-keep       Keep going.
roll-never      Giving up is not an option.
roll-wait       Wait for the cane.
roll-half       Halfway. The light is getting closer.
roll-one        One more.
roll-made-it    You made it to the light.
roll-kept       He kept going.
roll-flow       Flow!
roll-dark-1     A dark wave is coming.
roll-listen     Listen to the cane.
roll-dark-2     Another dark wave.
roll-back       The light is back.
roll-catch      Tap to catch the light!
roll-around     Or move left or right to go around it.
(Anthony's quote stays in his own words.)
