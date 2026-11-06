# Music On The Streets (music-on-the-streets): Cane Beat
Files: AR/lib/minigames/cane-beat.js, AR/lib/minigames/cane-things.js, AR/lib/minigames/alayna-hud.js (shared)   (no image or sound files: everything is drawn and played in code)
Export: caneBeatGame
index.js lines:
  import { caneBeatGame } from './cane-beat.js';
  'music-on-the-streets': caneBeatGame, // Cane Beat: tap on every beat as Alayna's cane touches each dome and stripe; the cane plays the tune and the grey street gets its colour back (Alayna Lopez)
voice.js PREFIX line: 'music-on-the-streets': 'cane-',
Artist's clip at the finale: 3D/gallery/audio/art_13.mp3 (Alayna, 14.1 s)
voice-lines.js entries (ready to paste):
  "cane-intro-1": "Cane Beat.",
  "cane-intro-2": "Alayna feels the city through her cane.",
  "cane-intro-3": "The stripes and the domes sound like music.",
  "cane-intro-4": "Her cane taps on every beat.",
  "cane-intro-5": "Tap with it, and the cane plays the song.",
  "cane-intro-6": "Six crossings.",
  "cane-intro-7": "Ready?",
  "cane-num-1": "Crossing 1.",
  "cane-num-2": "Crossing 2.",
  "cane-num-3": "Crossing 3.",
  "cane-num-4": "Crossing 4.",
  "cane-num-5": "Crossing 5.",
  "cane-num-6": "Crossing 6.",
  "cane-last": "The last crossing.",
  "cane-join-bass": "The bass joins in.",
  "cane-join-keys": "The keys join in.",
  "cane-join-horns": "The horns join in.",
  "cane-join-bongos": "The bongos join in.",
  "cane-join-strings": "The strings join in.",
  "cane-across-great": "The street is singing!",
  "cane-across-good": "Beautiful!",
  "cane-across-keep": "Keep tapping with the cane.",
  "cane-tap": "Tap on every beat.",
  "cane-help-1": "Listen for the cane.",
  "cane-help-2": "Tap every time it touches the ground.",
  "cane-party": "The whole street is singing!",
  "cane-end": "Your cane played the street's song!",
How to play (one sentence, as spoken): Her cane taps on every beat. Tap with it, and the cane plays the song.
What it does: The painting's graffiti drains to grey. A street groove in F plays (96 BPM) and Alayna (drawn from above: orange beanie,
curly brown hair, sea-green coat, white cane) walks the three real crosswalks in the painting, there and back: 6 crossings, 96 notes.
Her cane touches a yellow bump-dome pad (2 at each curb) or a crosswalk stripe on every beat, with a soft tap panned to where the tip
is (the timing cue). TAP anywhere (or the big TAP button) on the beat: the touch rings out as the next note of the tune (a marimba
on stripes, a bell on domes), the stripe glows, music notes fly up and the colour comes back around the cane. A miss is just a plain
cane tap; nobody fails. A new instrument joins on each crossing (bass, keys, horns, bongos, strings). Help widens the timing window
and explains. At the end the whole street floods with colour, then the finale and Alayna's own clip (the band dips under her).
Look: Alayna shows her face when she walks toward you or sideways, her back when she walks away up the screen. The score panel is
slimmer than the kit's and pinned to the very top (10 px down, not 66 px); messages (ui.alert) show slim, over the panel, so nothing
covers the painting. CSS scoped to this game, removed in stop(). Check at merge that nothing in the AR viewer sits in that top strip.
Tested: bot plays to the finale in about 100 s, no errors (it misses one note on purpose); a player who never taps hears the hint
and "Keep tapping with the cane." and the game carries on; the artist's clip starts at the finale; every spoken sentence is in the script.
Recordings: all 27 recorded by Ben (in AR/media/voice/); tested in the harness: every line the game says plays his clip, no computer voice.
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited): the index.js lines, the voice.js
PREFIX line and the voice-lines.js entries above.
