# Roller Coaster Of Emotions (roller-coaster-of-emotions): Pick Your Track
Files: AR/lib/minigames/coaster-track.js, AR/lib/minigames/coaster-things.js, AR/lib/minigames/alayna-hud.js (shared by all three Alayna games)
(no image or sound files: everything is drawn and played in code)
Export: pickTrackGame
index.js lines:
  import { pickTrackGame } from './coaster-track.js';
  'roller-coaster-of-emotions': pickTrackGame, // Pick Your Track: at each fork, steer onto the billboard that tells the truth about blind people; the storm clears (Alayna Lopez)
voice.js PREFIX line: 'roller-coaster-of-emotions': 'track-',
Artist's clip at the finale: 3D/gallery/audio/art_14.mp3 (Alayna)
voice-lines.js entries (ready to paste):
  "track-intro-1": "Pick Your Track.",
  "track-intro-2": "Alayna is riding a roller coaster of emotions.",
  "track-intro-3": "At every fork, two tracks call out.",
  "track-intro-4": "One says a wrong idea about blind people.",
  "track-intro-5": "One tells the truth.",
  "track-intro-6": "Steer onto the true track.",
  "track-intro-7": "Six forks.",
  "track-intro-8": "Ready?",
  "track-fork-1": "Fork 1.",
  "track-fork-2": "Fork 2.",
  "track-fork-3": "Fork 3.",
  "track-fork-4": "Fork 4.",
  "track-fork-5": "Fork 5.",
  "track-fork-6": "Fork 6.",
  "track-left": "Left track.",
  "track-right": "Right track.",
  "track-which": "Which track is true?",
  "track-no-1": "Blind people can't go out on their own.",
  "track-no-2": "Blind people only see darkness.",
  "track-no-3": "Blind people can't make art.",
  "track-no-4": "Blind people have to give up the things they love.",
  "track-no-5": "Blind people always need help.",
  "track-no-6": "Being blind changes who you are.",
  "track-yes-1": "I go everywhere with my cane.",
  "track-yes-2": "Lots of blind people see some light and color.",
  "track-yes-3": "I paint, and so do lots of blind artists.",
  "track-yes-4": "I still love the things I always loved.",
  "track-yes-5": "I ask for help when I want it.",
  "track-yes-6": "Being blind is just one part of me.",
  "track-true": "True!",
  "track-not": "That one's not true.",
  "track-truth": "Here's the truth.",
  "track-hint": "Left, or right?",
  "track-help-1": "Tap the left side or the right side.",
  "track-help-2": "Pick the track that tells the truth.",
  "track-party-1": "The storm is over.",
  "track-party-2": "Alayna is herself again.",
  "track-end": "You rode all the way to the truth!",
How to play (one sentence, as spoken): Steer onto the true track.
What it does: Before every fork (and during the victory lap) the coaster track under the big painted Alayna rushes toward you for
3.4 s: an endless zoom out from where the rails meet behind her, only on the track and handrails (she and the city stay still), with
a long whoosh and fast click-clacks, and a "Hold on!" message. The painting turns stormy (dull, blue-grey, drifting storm clouds). Alayna rides a little red coaster car (drawn side on,
her beanie, curls and face) up a track through the sky to a fork. Two billboards pop up at the ends of the two branches: one says a
wrong idea about blind people, the other the truth (6 pairs, the truth on a fixed side each time). The voice reads "Left track. …
Right track. … Which track is true?" Steer with the LEFT / RIGHT buttons or by tapping the left or right half of the screen; HEAR
AGAIN repeats the billboards. True: the car swoops down with her hands up, the billboard lights gold with TRUE, a cheer. Not true:
thunder and a flash, the billboard greys out (NOT TRUE), then the car hops across to the true track and the voice says the truth.
Every fork ends on the truth and the sky clears a sixth each time (a stormy minor pad slides to a bright major one). After fork 6
the car does a victory lap, "The storm is over. Alayna is herself again.", then the finale and Alayna's own clip (sound dips under her).
Look: the slim score panel at the very top and slim messages over it, from alayna-hud.js (same as Cane Beat). Music sits a third
under the effects (Ben asked for it 33% lower).
Tested: bot plays to the finale in about 80 s, no errors (it picks the wrong track at fork 2 on purpose: the hop and the truth line
work); the artist's clip starts at the finale; every spoken sentence is in the script.
Recordings: all 38 recorded by Ben (in AR/media/voice/); tested in the harness: every line the game says plays his clip, no computer voice.
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited): the index.js lines, the voice.js
PREFIX line and the voice-lines.js entries above.
