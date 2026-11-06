# A Bright Future (a-bright-future): Climb the Scale
Files: AR/lib/minigames/steps-climb.js, AR/lib/minigames/steps-things.js, AR/media/games/steps/girl.png, AR/media/games/steps/wall.jpg
Export: climbTheScaleGame   (in steps-climb.js)
index.js lines:
  import { climbTheScaleGame } from './steps-climb.js';
  'a-bright-future': climbTheScaleGame, // Climb the Scale: each new stair counts in 1-2-3 then sings; TAP on the note and she climbs Do to Do into the sky (Academy of Music for the Blind)
voice.js PREFIX line: 'a-bright-future': 'steps-',
Artist's clip at the finale: 3D/gallery/audio/art_55.mp3 (David Pinto)
voice-lines.js entries (ready to paste, 20 lines):
```
  "steps-intro-1": "Climb the scale.",
  "steps-intro-2": "Music is her staircase into a bright future.",
  "steps-intro-3": "Each new stair counts in: one, two, three.",
  "steps-intro-4": "Then it glows and sings its note.",
  "steps-intro-5": "Tap right when it sings, and she climbs.",
  "steps-intro-6": "Eight stairs, all the way up the scale.",
  "steps-intro-7": "Ready?",
  "steps-do": "Do.",
  "steps-re": "Re.",
  "steps-mi": "Mi.",
  "steps-fa": "Fa.",
  "steps-sol": "Sol.",
  "steps-la": "La.",
  "steps-ti": "Ti.",
  "steps-half": "Halfway up!",
  "steps-early": "Wait for it to sing.",
  "steps-missed": "Missed it. Try again.",
  "steps-hint": "Tap when it sings.",
  "steps-top": "She reached the top of the scale!",
  "steps-end": "A bright future!",
```

How to play (one sentence, as spoken): Each new stair counts in: one, two, three. Then it glows and sings its note. Tap right when it sings, and she climbs.
What it does: The girl is cut out of the painting (girl.png; the wall behind her painted in: wall.jpg). A gentle piano groove (C, Am, F, G at 84
beats a minute) plays on the music's own clock. Each new stair of sheet music appears above her, rising up and left into the misty sky:
three soft ticks from the stair's side, then it glows and sings its note. TAP (the big button or anywhere on the screen) within about 0.3 s of
the note and she hops up; the note name is spoken (Do, Re, Mi...), and on the next bar the staircase plays back the scale so far. Too early:
a little bump and "Wait for it to sing." (at most every 6 s). No tap: "Missed it. Try again." and the stair counts in again. The panel shows
the count (1 ... 1 · 2 ... 1 · 2 · 3 ... TAP NOW!). The music grows and the sky warms as she climbs. 8 stairs. Finale: the whole scale rings
out over a big chord, she bounces with joy at the top, then David's own clip.
Tested: the bot plays it to the finale in about 54 s on a 400 × 860 phone-shaped screen, no errors (only the test site's missing voice
mp3s, as expected); the artist's clip starts at the finale (it was 3.5-4 s in when checked); every spoken sentence is in the voice script.
Recordings: 19 of 20 are recorded and included in AR/media/voice/ (steps-*.mp3), checked against the script. Missing: steps-end ("A bright future!"), which uses the computer voice until it is recorded.
Timing checked against the real recordings: the intro waits for the whole spoken intro (about 20 s), and a tap on the screen skips it;
no line is cut off by the next one.
Changes needed in shared files (the main chat does these; nothing shared was edited): the index.js import and SPECIAL line above, the
voice.js PREFIX line, and the voice-lines.js entries.
Notes for merging:
- The top stair says "Do!" and the first says "Do." They are the same words to the voice system, so steps-do plays both times (one recording).
- "Missed it. Try again.": until Ben records steps-missed, the voice system finds the existing dance-missed clip ("Missed it!") and the
  computer voice says "Try again." Once steps-missed is recorded, it plays the whole line in one clip.
