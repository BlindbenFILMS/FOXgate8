# Comfort in the Uncomfortable (comfort-in-the-uncomfortable): Drop In
Files: AR/lib/minigames/drop-in.js, AR/lib/minigames/drop-things.js, AR/media/games/drop/rider.png, AR/media/games/drop/trail.jpg
Export: dropInGame
index.js line: 'comfort-in-the-uncomfortable': dropInGame, // Drop In: ride the canyon 6 times; TAP Drop in at the edge, steer LEFT/RIGHT round rocks, hold BRAKE
Voice prefix: drop-   (Ben has recorded ALL 36 lines: AR/media/voice/drop-*.mp3, included in this zip)
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- index.js: add the line above.
- voice.js, PREFIX: add  'comfort-in-the-uncomfortable': 'drop-',
- voice-lines.js: add these 36 entries (Ben's recordings, all in AR/media/voice/):
```
  "drop-intro-1": "Drop in.",
  "drop-intro-2": "Mike always says you can't grow unless you get uncomfortable.",
  "drop-intro-3": "Ride the whole canyon, six times.",
  "drop-intro-4": "At the top edge, your heart will start to race.",
  "drop-intro-5": "Tap Drop in, and he goes.",
  "drop-intro-6": "Then the button turns into Brake.",
  "drop-intro-7": "Hold Brake to slow down.",
  "drop-intro-8": "Rocks and logs are in the trail.",
  "drop-intro-9": "Each one makes a sound from its side.",
  "drop-intro-10": "Steer left or right around them.",
  "drop-intro-11": "If he crashes, he gets back up.",
  "drop-intro-12": "Ready?",
  "drop-intro-13": "Drop in!",
  "drop-num-1": "Drop 1.",
  "drop-num-2": "Drop 2.",
  "drop-num-3": "Drop 3.",
  "drop-num-4": "Drop 4.",
  "drop-num-5": "Drop 5.",
  "drop-num-6": "Drop 6.",
  "drop-edge": "Here's the edge.",
  "drop-last-1": "The last drop.",
  "drop-last-2": "The biggest one.",
  "drop-tap": "Tap Drop in.",
  "drop-rock": "Rock ahead!",
  "drop-log": "Log ahead!",
  "drop-cactus": "Cactus ahead!",
  "drop-tumbleweed": "Tumbleweed ahead!",
  "drop-crash-1": "Crash!",
  "drop-crash-2": "He gets back up.",
  "drop-up-1": "Back up!",
  "drop-up-2": "Keep riding.",
  "drop-through": "You pushed through!",
  "drop-growth-1": "That's where the growth happens!",
  "drop-growth-2": "Growth!",
  "drop-bottom": "You made it to the bottom!",
  "drop-end": "You dropped in!",
```

How to play (one sentence, as spoken): At the top edge your heart races: tap Drop in and he goes, steer left or right around what's in the way, and hold Brake to slow down.
What it does: Mike's tiny mountain biker is cut out of the painting (rider.png; the trail behind him is painted in: trail.jpg) and rides the
whole canyon toward you, growing as he comes, 6 runs. At the top edge a heartbeat races (sound, a drawn heart, the phone buzzes) and the canyon
darkens. TAP the big middle button (or the screen) and he plunges; the button turns into BRAKE (hold to slow). Rocks, logs, cacti and
tumbleweeds sit in the trail (3 on run 1 up to 6), each ticking from its side and louder as it nears; most land in his line, so you steer
LEFT/RIGHT. Hit one and he tumbles over and gets back up. Each run adds a note to the music. Words show at the BOTTOM of the screen while he
rides and at the TOP once he's at the finish flag. Finale: Mike's quote, then his own clip (3D/gallery/audio/wing_4_0.mp3).
Tested: bot plays all 6 runs to the finale in about 100 s, no errors (it brakes once and crashes once on purpose); every spoken line plays
Ben's recording (no computer voice). Ben has played it on his phone in the preview.
Note: the intro says "Drop in." at the start and "Drop in!" at the end. They match the same words, so drop-intro-1 plays both times and
drop-intro-13 is never used (harmless).
