# Reliroo (reliroo): Off-Duty Fetch
Files: AR/lib/minigames/fetch-relish.js, AR/lib/minigames/relish-things.js, AR/media/games/reliroo/relish.png, AR/media/games/reliroo/clean.jpg
Export: offDutyFetchGame
index.js line: 'reliroo': offDutyFetchGame, // Off-Duty Fetch: Relish runs off and barks from the left, middle or right; throw the ball that way, she leaps and catches it (Rusty Perez)
  (and at the top of index.js: import { offDutyFetchGame } from './fetch-relish.js';)
voice.js PREFIX line: 'reliroo': 'relish-',
Artist's clip at the finale: 3D/gallery/audio/art_27.mp3 (Rusty reads his quote; the computer voice never reads it)
Voice prefix: relish-  (17 lines, ALL recorded by Ben, in this zip)
voice-lines.js entries (ready to paste):
```
  "relish-intro-1": "Off-Duty Fetch.",
  "relish-intro-2": "The harness is off, so Relish can play!",
  "relish-intro-3": "Listen for her bark.",
  "relish-intro-4": "Is she on the left, in the middle, or on the right?",
  "relish-intro-5": "Throw the ball to her.",
  "relish-catch": "Good catch!",
  "relish-count-1": "1 catch.",
  "relish-count-2": "2 catches.",
  "relish-count-3": "3 catches.",
  "relish-count-4": "4 catches.",
  "relish-count-5": "5 catches.",
  "relish-count-6": "6 catches.",
  "relish-count-7": "7 catches.",
  "relish-good-girl": "Good girl, Reliroo!",
  "relish-again": "Listen again.",
  "relish-hint": "Listen for the bark, then throw that way.",
  "relish-end": "Relish caught them all!",
```

How to play (one sentence, as spoken): Listen for her bark. Is she on the left, in the middle, or on the right? Throw the ball to her.
What it does: Relish is the real dog cut out of the painting (relish.png, harness off, with a warm golden rim); clean.jpg is the painting with
her painted out (filled with the path's own texture), so she can run off and come back. Each round she bounds off (hopping gallop, paws
pattering from her side) LEFT into the flowers, up the path in the MIDDLE (smaller, and her bark sounds further away) or RIGHT into the
meadow, turns round and barks "woof woof" (a gold ring pops at her mouth with each bark, every 2.3 s). Throw with the LEFT / MIDDLE / RIGHT
buttons or by tapping that third of the screen. Right way: the glowing tennis ball arcs from Rusty's hand, she leaps and catches it,
bounds back and drops it at his feet with a squeak. Wrong way: it lands in the flowers in a puff of petals, "Listen again.", and she
barks again. 8 catches, then zoomies round all three spots and home, then the finale and Rusty's clip about Relish. A bouncy tune
(108 bpm) adds claps, a whistle and glockenspiel as the catches add up.
Tested: bot plays to the finale in about 65 s (9 throws: one wrong on purpose, 8 catches), no errors; Rusty's clip starts at the finale; every spoken sentence is in the voice script.
Recordings: Ben has recorded ALL 17 lines: AR/media/voice/relish-*.mp3, included in this zip. Tested: every spoken line plays his recording (no computer voice).
Changes needed in shared files: only the three above (index.js import + SPECIAL line, voice.js PREFIX, voice-lines.js entries). No shared file was edited.
