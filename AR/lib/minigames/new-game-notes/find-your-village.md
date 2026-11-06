# Find Your Village (find-your-village): Like a magnet
Files: AR/lib/minigames/village-magnet.js, AR/lib/minigames/village-things.js
Export: villageMagnetGame
index.js line: 'find-your-village': villageMagnetGame, // Like a magnet: you are the glowing orb; steer LEFT / RIGHT under each humming friend and they are pulled in; bring 10 home (Steven McCoy)
voice.js PREFIX line: 'find-your-village': 'village-',
Artist's clip at the finale: 3D/gallery/audio/art_3.mp3 (Steven's own voice, starts 3.3 s after the end panel, so the end line finishes first; all game music fades to silence while he speaks)
voice-lines.js entries (ready to paste, 22 lines):
```
  "village-intro-1": "Like a magnet.",
  "village-intro-2": "Steven says when you live as yourself, you find your village.",
  "village-intro-3": "You are the glowing orb.",
  "village-intro-4": "Your people float down from the sky, humming.",
  "village-intro-5": "Listen for which side the humming is on.",
  "village-intro-6": "Steer left or right, to be right under them.",
  "village-intro-7": "When they get close, they are pulled in, like a magnet.",
  "village-intro-8": "Bring 10 people home to your village.",
  "village-intro-9": "Here they come.",
  "village-left": "On your left.",
  "village-middle": "In the middle.",
  "village-right": "On your right.",
  "village-guitar": "A guitar player found you.",
  "village-painter": "A painter found you.",
  "village-dancer": "A dancer found you.",
  "village-flower": "A friend with a flower found you.",
  "village-cane": "A friend with a white cane found you.",
  "village-five": "5 in your village.",
  "village-one-more": "Just 1 more!",
  "village-all": "Your whole village is here!",
  "village-back": "They'll come back around.",
  "village-end": "You found your village.",
```

How to play (one sentence, as spoken): Your people float down humming from their side: steer left or right to be right under them, and they are pulled in like a magnet.
What it does: The crystal orb lifts out of the painting's face (cut from the painting in code): that's you, and it floats down to the bottom row
(3 spots: left, middle, right). Friends float down from the sky one at a time (two at once later), each humming their own note from their
side, louder as they come, brighter when you're right under them; the game also says "On your left." / "In the middle." / "On your right.".
Steer with LEFT / RIGHT (or tap the left, middle or right of the screen). Under them when they get close = pulled in like a magnet, then
they fly up to their own spot on the floating land and stay there glowing, and their hum joins a choir that grows. Miss one and they float
past and come back later. 5 kinds of friend (guitar player, painter, dancer, someone with a flower, a blind friend with a white cane).
The painting starts dim; light spreads from the golden right side toward the dark face as the village grows. 10 friends: the orb flies
back into the face and Steven speaks. About 1 to 1.5 minutes. All drawn in code (village-things.js), no image files.
Tested: the bot plays to the finale in about 49 s (bot intro is shortened), no console errors from this game; Steven's clip starts at the
finale (currentTime moving); phone-sized screenshots (400 x 860) look right; every sentence it says is in steven-mccoy-VOICE-SCRIPT.txt.
Recordings: ALL recorded by Ben and included in this zip (AR/media/voice/, copy them into the site's AR/media/voice/). Checked: every line the game says plays its own clip (none fall back to the computer voice).
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- index.js: add the import  import { villageMagnetGame } from './village-magnet.js';  and the SPECIAL line above.
- voice.js, PREFIX: add the line above.
- voice-lines.js: add the entries above.
