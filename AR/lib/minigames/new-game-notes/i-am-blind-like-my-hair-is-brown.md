# I Am Blind, Like My Hair Is Brown (i-am-blind-like-my-hair-is-brown): Still Me
Files: AR/lib/minigames/hair-still.js, AR/lib/minigames/hair-things.js, AR/lib/minigames/alayna-hud.js (shared by all three Alayna games)
(no image or sound files: the pieces are cut from the painting at run time; everything else is drawn and played in code)
Export: stillMeGame
index.js lines:
  import { stillMeGame } from './hair-still.js';
  'i-am-blind-like-my-hair-is-brown': stillMeGame, // Still Me: her mosaic face scatters but her hair stays; follow each spot's hum and tap to bring the pieces home, her brown eyes last (Alayna Lopez)
voice.js PREFIX line: 'i-am-blind-like-my-hair-is-brown': 'still-',
Artist's clip at the finale: 3D/gallery/audio/art_15.mp3 (Alayna)
voice-lines.js entries (ready to paste; "Listen for the hum." appears twice in the script but is one clip):
  "still-intro-1": "Still Me.",
  "still-intro-2": "Alayna's face breaks into pieces.",
  "still-intro-3": "But her brown hair stays right where it is.",
  "still-intro-4": "Each empty spot hums from where it is.",
  "still-intro-5": "Tap the spot, and its piece flies home.",
  "still-intro-6": "Eight pieces.",
  "still-intro-7": "Ready?",
  "still-forehead": "Her forehead.",
  "still-nose": "Her nose.",
  "still-cheek-1": "One cheek.",
  "still-cheek-2": "The other cheek.",
  "still-mouth": "Her smile.",
  "still-chin": "Her chin.",
  "still-last": "Last of all, her brown eyes.",
  "still-eye-1": "One eye.",
  "still-eye-2": "And the other eye.",
  "still-home": "Home!",
  "still-there": "There it is.",
  "still-up": "Up.",
  "still-down": "Down.",
  "still-left": "Left.",
  "still-right": "Right.",
  "still-up-left": "Up and left.",
  "still-up-right": "Up and right.",
  "still-down-left": "Down and left.",
  "still-down-right": "Down and right.",
  "still-close": "So close!",
  "still-listen": "Listen for the hum.",
  "still-help-1": "It comes from where the piece belongs.",
  "still-help-2": "Tap there, or drag the glowing piece there.",
  "still-help-3": "Slide your finger and listen: the pings get faster when you are close.",
  "still-party-1": "Every piece is home.",
  "still-party-2": "She was there all along.",
  "still-end": "Still Alayna, all along!",
How to play (one sentence, as spoken): Tap the spot, and its piece flies home.
What it does: The painting's face breaks along its own mosaic shapes into 8 pieces (forehead, nose, two cheeks, smile, chin, then the
two eyes; polygons in hair-things.js, cut from the loaded painting) with a glassy shatter; they float over her hair and the wall, and
their spots show the tan wall with a dashed outline. Her dark brown hair never moves and gets a warm glint that runs through it.
One at a time the empty spot hums: a pulsing tone panned left/right by where it is and higher near the top of her face; sighted players
also see it glow, and the floating piece they need gets a pulsing gold outline. Tap inside the spot (or near it; the target grows after misses and with Help) and the piece flies home with a note
of a little tune. Or drag the glowing piece itself onto its spot (it floats back with a spoken hint if dropped in the wrong place). Or hold a finger
down on the painting: sonar pings speed up as it nears the spot, and lifting on it places the piece. A miss says
which way to go ("Up and left.", "So close! Right."). HEAR IT repeats the piece and the hum, louder. After the eyes: a bright chord,
"Every piece is home. She was there all along.", then the finale and Alayna's own clip (sound dips under her).
Look: the slim score panel at the very top and slim messages over it, from alayna-hud.js. Music sits a third under the effects.
Tested: bot plays to the finale in about 40 s, no errors (it misses once on purpose at piece 2: the spoken hint works; it drags piece 4 home by drag and drop); the artist's
clip starts at the finale; every spoken sentence is in the script.
Recordings: all 34 recorded by Ben (in AR/media/voice/); tested in the harness: every line the game says plays his clip, no computer voice.
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited): the index.js lines, the voice.js
PREFIX line and the voice-lines.js entries above.
