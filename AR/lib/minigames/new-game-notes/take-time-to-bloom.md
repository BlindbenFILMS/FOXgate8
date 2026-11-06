# Take Time to Bloom (take-time-to-bloom): Wind the clockwork
Files: AR/lib/minigames/bloom-clock.js, AR/lib/minigames/bloom-things.js
Export: bloomClockGame
index.js line: 'take-time-to-bloom': bloomClockGame, // Wind the clockwork: draw slow circles to wind the gear like a music box; slow and steady opens 8 petals, too fast jams it (Steven McCoy)
voice.js PREFIX line: 'take-time-to-bloom': 'bloom-',
Artist's clip at the finale: 3D/gallery/audio/art_4.mp3 (Steven's own voice, starts 3.3 s after the end panel, so the end line finishes first; all game music fades to silence while he speaks)
voice-lines.js entries (ready to paste, 23 lines):
```
  "bloom-intro-1": "Wind the clockwork.",
  "bloom-intro-2": "Steven says you deserve your time too.",
  "bloom-intro-3": "Draw slow circles on the screen, anywhere, to turn the gear.",
  "bloom-intro-4": "Like winding a music box.",
  "bloom-intro-5": "Every click plays a note.",
  "bloom-intro-6": "Slow and steady, and the petals open.",
  "bloom-intro-7": "Too fast, and the clock jams.",
  "bloom-intro-8": "You can also hold the Wind button.",
  "bloom-intro-9": "Open all 8 petals.",
  "bloom-petal-1": "Take your time.",
  "bloom-petal-2": "You are a person.",
  "bloom-petal-3": "You deserve your time.",
  "bloom-petal-4": "Little by little.",
  "bloom-petal-5": "You are worth it.",
  "bloom-petal-6": "Breathe.",
  "bloom-petal-7": "Almost in bloom.",
  "bloom-full": "You are in full bloom!",
  "bloom-jam-1": "Too fast!",
  "bloom-jam-2": "The clock jammed.",
  "bloom-steady": "Slow and steady.",
  "bloom-hint-1": "Draw slow circles on the screen.",
  "bloom-hint-2": "Or hold Wind.",
  "bloom-end": "You took the time, and you bloomed.",
```

How to play (one sentence, as spoken): Draw slow circles on the screen to turn the gear, like winding a music box: slow and steady opens the petals, too fast and the clock jams.
What it does: The flower is grey and sleepy. Draw circles anywhere on the screen (either way round) to turn the brass gear in the painting; every
click of the gear plays the next note of a music-box waltz, so slow sounds lovely. Colour sweeps round the flower like a clock hand (an
ornate hand drawn at the flower's centre points at the edge), and every 2 turns a silver petal swings open with a kind line ("Take your time.").
Faster than 1.45 turns a second for a moment and it jams (a whirr warns first; then a clank, a red burst, the gear shakes) for about 2 s.
HOLD TO WIND winds at a calm steady pace (for anyone who can't draw circles). 8 petals: full bloom and Steven speaks. About 1 minute.
All drawn in code (bloom-things.js), no image files.
Tested: the bot plays to the finale in about 25 s (bot intro is shortened), no console errors from this game; Steven's clip starts at the
finale (currentTime moving); phone-sized screenshots (400 x 860) look right; every sentence it says is in steven-mccoy-VOICE-SCRIPT.txt.
Recordings: ALL recorded by Ben and included in this zip (AR/media/voice/, copy them into the site's AR/media/voice/). Checked: every line the game says plays its own clip (none fall back to the computer voice).
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- index.js: add the import  import { bloomClockGame } from './bloom-clock.js';  and the SPECIAL line above.
- voice.js, PREFIX: add the line above.
- voice-lines.js: add the entries above.
