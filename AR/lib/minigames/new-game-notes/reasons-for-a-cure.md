# Reasons for a Cure (reasons-for-a-cure): Pin the Memories
Files: AR/lib/minigames/pin-memories.js, AR/lib/minigames/pin-things.js
Export: pinTheMemoriesGame
index.js line: 'reasons-for-a-cure': pinTheMemoriesGame, // Pin the Memories: 10 memories float down past the photo wall, each with its own sound; tap PIN in the golden glow (Rusty Perez)
  (and at the top of index.js: import { pinTheMemoriesGame } from './pin-memories.js';)
voice.js PREFIX line: 'reasons-for-a-cure': 'cure-',
Artist's clip at the finale: 3D/gallery/audio/art_21.mp3 (Rusty reads his quote; the computer voice never reads it)
Voice prefix: cure-  (19 lines, ALL recorded by Ben, in this zip)
voice-lines.js entries (ready to paste):
```
  "cure-intro-1": "Pin the Memories.",
  "cure-intro-2": "Memories float down past the wall.",
  "cure-intro-3": "Each one has its own sound.",
  "cure-intro-4": "When it reaches the golden glow, tap pin.",
  "cure-mom": "Mom’s smile.",
  "cure-baby": "Baby’s first steps.",
  "cure-wedding": "Wedding day.",
  "cure-sunset": "Sunset at the beach.",
  "cure-candles": "Birthday candles.",
  "cure-fireworks": "Fireworks.",
  "cure-snow": "First snow.",
  "cure-swings": "Kids on the swings.",
  "cure-dancing": "Dancing in the kitchen.",
  "cure-grandpa": "Grandpa’s face.",
  "cure-full": "The wall is full.",
  "cure-not-yet": "Not yet.",
  "cure-again": "Here it comes again.",
  "cure-hint": "Listen for the sparkle, then tap pin.",
  "cure-end": "Every memory is pinned.",
```

How to play (one sentence, as spoken): Memories float down past the wall. Each one has its own sound. When it reaches the golden glow, tap pin.
What it does: The photo wall starts dim and grey. One at a time, ten drawn old photos float down past it (Mom's smile, baby's first steps, wedding
day, sunset at the beach, birthday candles, fireworks, first snow, kids on the swings, dancing in the kitchen, Grandpa's face), swaying,
each playing its own sound from its side every 1.6 s, louder as it nears the middle (a hum and a laugh, a giggle, wedding bells, waves
and a gull, Happy Birthday, fireworks, wind chimes, a creaky swing, a kitchen waltz, a harmonica). A soft golden glow runs across the
middle of the wall; when a memory is in it, it shimmers and sparkles (a high two-note sparkle every 0.35 s). Tap PIN (or anywhere): it
flies to its place on the wall with a brass pin, its sound plays in full, its name is spoken, and that part of the wall warms with
colour. Too early: "Not yet." If it floats off the bottom it comes round again and the glow gets wider (no losing). All ten: the whole
wall glows and the photos pulse, then the finale ("Reasons to see") and Rusty's clip. A gentle music-box waltz grows as the wall fills.
Tested: bot plays to the finale in about 60 s (11 taps: one too early on purpose), no errors; Rusty's clip starts at the finale; every spoken sentence is in the voice script.
Recordings: Ben has recorded ALL 19 lines: AR/media/voice/cure-*.mp3, included in this zip. Tested: every spoken line plays his recording (no computer voice).
Changes needed in shared files: only the three above (index.js import + SPECIAL line, voice.js PREFIX, voice-lines.js entries). No shared file was edited.
