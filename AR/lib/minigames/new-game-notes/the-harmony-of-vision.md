# The Harmony of Vision (the-harmony-of-vision): Tune It Up
Files: AR/lib/minigames/harmony-tune.js, AR/lib/minigames/harmony-things.js (no pictures: everything is drawn in code)
Export: tuneItUpGame   (in harmony-tune.js)
index.js lines:
  import { tuneItUpGame } from './harmony-tune.js';
  'the-harmony-of-vision': tuneItUpGame, // Tune It Up: slide the student's note UP/DOWN until it rings true with Deb's; 6 notes light the painting's circles (Academy of Music for the Blind)
voice.js PREFIX line: 'the-harmony-of-vision': 'harmony-',
Artist's clip at the finale: 3D/gallery/audio/art_57.mp3 (Deb Beyer)
voice-lines.js entries (ready to paste, 24 lines):
```
  "harmony-intro-1": "Tune it up.",
  "harmony-intro-2": "Deb teaches singing at the Academy of Music for the Blind.",
  "harmony-intro-3": "Listen to her golden note.",
  "harmony-intro-4": "Then a student sings a note that's a little off.",
  "harmony-intro-5": "Slide it up or down until the two notes ring together as one.",
  "harmony-intro-6": "When it's close, it wobbles. When it's in tune, it's smooth.",
  "harmony-intro-7": "Ready?",
  "harmony-note-1": "Note 1.",
  "harmony-note-2": "Note 2.",
  "harmony-note-3": "Note 3.",
  "harmony-note-4": "Note 4.",
  "harmony-note-5": "Note 5.",
  "harmony-note-last": "The last note.",
  "harmony-higher": "Higher.",
  "harmony-lower": "Lower.",
  "harmony-hold": "Hold it there.",
  "harmony-tune": "In tune!",
  "harmony-more-5": "5 more.",
  "harmony-more-4": "4 more.",
  "harmony-more-3": "3 more.",
  "harmony-more-2": "2 more.",
  "harmony-more-1": "1 more.",
  "harmony-all": "All six notes are in tune!",
  "harmony-end": "The whole painting sings in harmony!",
```

How to play (one sentence, as spoken): Slide the student's note up or down until the two notes ring together as one.
What it does: Deb's golden note sings (a little to the left), then a student sings a note that's off by 3 to 5 semitones (a little to the right).
Hold UP or DOWN (slow at first for fine tuning, faster the longer you hold) or slide a finger up or down the screen. You can hear how close
you are: near the right pitch the two voices beat against each other (a wobble that slows down as you get closer) and drift toward the
middle; in tune it goes smooth. Hold it in tune for 1 second and it locks: one of the painting's six round shapes lights up (white moon,
coloured ball, golden sun, red circle, blue ball, yellow moon) and adds a music-box part to the song. Each note is a little stricter than the
last. On screen, Deb's note sits on a dashed golden line and the student's blue note rides above or below it (level = in tune); the panel
also says "Too high / Too low / IN TUNE". If you're stuck for 5-7 s it says "Higher." or "Lower." The painting starts dim and gets its
colour and flow back note by note. Finale: the six notes play as a chord, then Deb's own clip.
Tested: the bot plays it to the finale in about 47 s on a 400 × 860 phone-shaped screen, no errors (only the test site's missing voice
mp3s, as expected); the artist's clip starts at the finale (it was 3.5-4 s in when checked); every spoken sentence is in the voice script.
Recordings: 24 of 24 are recorded and included in AR/media/voice/ (harmony-*.mp3), checked against the script.
Timing checked against the real recordings: the intro waits for the whole spoken intro (about 20 s), and a tap on the screen skips it;
no line is cut off by the next one.
Changes needed in shared files (the main chat does these; nothing shared was edited): the index.js import and SPECIAL line above, the
voice.js PREFIX line, and the voice-lines.js entries.
Note for merging: harmony-more-N and power-more-N say the same words ("5 more." etc.); each game plays its own recording (prefix match).
