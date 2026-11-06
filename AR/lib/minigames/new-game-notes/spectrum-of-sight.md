# Spectrum of Sight (spectrum-of-sight): Somewhere In Between
Files: AR/lib/minigames/spectrum-between.js, AR/lib/minigames/spectrum-things.js   (everything is drawn in code; no media files)
Export: somewhereInBetweenGame
index.js line: 'spectrum-of-sight': somewhereInBetweenGame, // Somewhere In Between: each colour ring is a way of seeing; name the thing you see (and hear) through it
Voice prefix: ring-   (Ben has recorded ALL 44 lines: AR/media/voice/ring-*.mp3, included in this zip)
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- index.js: add the line above.
- voice.js, PREFIX: add  'spectrum-of-sight': 'ring-',
- voice-lines.js: add these 44 entries (Ben's recordings, all in AR/media/voice/):
```
  "ring-intro-1": "Somewhere in between.",
  "ring-intro-2": "Mike says blindness is not black and white.",
  "ring-intro-3": "It is a whole spectrum.",
  "ring-intro-4": "Each colour ring of this eye is a different way of seeing.",
  "ring-intro-5": "Something will appear in the eye, seen that way, and you will hear its sound.",
  "ring-intro-6": "Pick what it is from the three buttons.",
  "ring-intro-7": "Tap the eye to hear it again.",
  "ring-intro-8": "Ready?",
  "ring-num-1": "Ring 1.",
  "ring-num-2": "Ring 2.",
  "ring-num-3": "Ring 3.",
  "ring-num-4": "Ring 4.",
  "ring-num-5": "Ring 5.",
  "ring-num-6": "Ring 6.",
  "ring-num-7": "Ring 7.",
  "ring-blurry-1": "Blurry.",
  "ring-blurry-2": "Everything is soft around the edges.",
  "ring-hazy-1": "Hazy.",
  "ring-hazy-2": "Like looking through a foggy window.",
  "ring-tunnel-1": "Tunnel vision.",
  "ring-tunnel-2": "You only see straight ahead.",
  "ring-spots-1": "Spots.",
  "ring-spots-2": "Parts of the picture are missing.",
  "ring-hole-1": "A hole in the middle.",
  "ring-hole-2": "You see around the edges.",
  "ring-shapes-1": "Shapes and shadows.",
  "ring-shapes-2": "No details, just light and dark.",
  "ring-light-1": "Only light.",
  "ring-light-2": "You can tell light from dark, but not what things are.",
  "ring-light-3": "Listen closely.",
  "ring-ask": "What is it?",
  "ring-yes": "Yes!",
  "ring-key": "A key.",
  "ring-dog": "A dog.",
  "ring-bicycle": "A bicycle.",
  "ring-guitar": "A guitar.",
  "ring-cup": "A cup.",
  "ring-bird": "A bird.",
  "ring-phone": "A phone.",
  "ring-wrong-1": "Not that one.",
  "ring-wrong-2": "Listen again.",
  "ring-all-1": "You saw all seven!",
  "ring-all-2": "Every one of them is a way of seeing.",
  "ring-end": "Seven ways of seeing!",
```

How to play (one sentence, as spoken): Something will appear in the eye, seen that way, and you will hear its sound; pick what it is from the three buttons.
What it does: a rainbow dial runs round the eye, one segment per colour ring (7). The pointer clicks round to the next ring and the eye
becomes a window showing an everyday thing (key, dog, bicycle, guitar, cup, bird, phone, drawn in a sunny room) seen that ring's way:
Blurry, Hazy, Tunnel vision, Spots (big drifting spots), A hole in the middle, Shapes and shadows, Only light (a soft glow). Each thing
has its own sound (tap the eye to hear it again). Pick from 3 big buttons: right, and the picture clears, that ring of the painting lights
up and sings its note; wrong, and that button greys out. The 7th ring always gets a thing with a clear sound. All 7: the eye glows in a
wave and a rainbow chord plays. Words show at the BOTTOM so the eye stays clear. Finale: Mike's quote, then his clip (wing_4_1.mp3).
Tested: bot plays all 7 rings to the finale in about 37 s, no errors (one wrong answer on purpose); every spoken line plays Ben's recording.
Ben has played it on his phone in the preview.
