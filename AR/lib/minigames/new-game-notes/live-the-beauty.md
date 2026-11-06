# Live the Beauty (live-the-beauty): Breathe the Beauty   · READY TO MERGE (4 Nov 2026)
Files (all NEW, already saved in Ben's site folder):
  AR/lib/minigames/live-breathe.js          the game
  AR/lib/minigames/live-things.js           its drawn props (sun, breath ring, river glint, autumn tree, bird, temple bell, petal, song ribbon)
  AR/media/voice/breathe-*.mp3              Ben's 25 recorded voice lines (recorded and checked: all present, all play)
  AR/lib/minigames/new-game-notes/LIVE-THE-BEAUTY-VOICE-SCRIPT.txt   the recording script
Uses existing media: 3D/gallery/audio/wing_1_1.mp3 (Deborah's statement audio, read only). No other media files.
Export: breatheBeautyGame

## Changes for the main chat to make in shared files (nothing else is needed)
1. AR/lib/minigames/index.js
   import { breatheBeautyGame } from './live-breathe.js';
   // in SPECIAL, NEW ARTISTS WING section:
   'live-the-beauty': breatheBeautyGame, // Breathe the beauty: hold to breathe in, let go to breathe out; each breath wakes the world in the painting
2. AR/lib/minigames/voice.js, in PREFIX:
   'live-the-beauty': 'breathe-',
3. AR/lib/minigames/voice-lines.js, add:
  "breathe-intro-1": "Breathe the beauty.",
  "breathe-intro-2": "Hold the button to breathe in.",
  "breathe-intro-3": "Let go to breathe out.",
  "breathe-intro-4": "Each breath wakes up the world around you.",
  "breathe-in": "Breathe in.",
  "breathe-out": "Breathe out.",
  "breathe-longer": "A little longer.",
  "breathe-sun-1": "The warm sun.",
  "breathe-sun-2": "Feel it on your face.",
  "breathe-touch": "Touch it on the painting to play it.",
  "breathe-river-1": "The river.",
  "breathe-river-2": "Hear it flowing.",
  "breathe-wind-1": "Wind in the trees.",
  "breathe-wind-2": "Hear the leaves.",
  "breathe-birds-1": "Birds above you.",
  "breathe-birds-2": "Hear them sing.",
  "breathe-bell-1": "The temple bell.",
  "breathe-bell-2": "Far away, on your left.",
  "breathe-flowers-1": "Flowers.",
  "breathe-flowers-2": "Breathe in their scent.",
  "breathe-song": "The figures in the clouds are singing.",
  "breathe-light-1": "The light opens.",
  "breathe-light-2": "You are inside the beauty.",
  "breathe-deborah": "Listen to Deborah.",
  "breathe-end": "You lived the beauty.",
(Deborah's quote at the finale stays in her own words; it is never recorded.)

## How to play (as spoken)
Hold the button to breathe in. Let go to breathe out. Each breath wakes up the world around you.

## What it is
A calm, no-fail breathing game, about 1.5 to 2 minutes, 8 breaths. The painting starts asleep (dim, grey, still).
- Breathe in: hold the big button, or hold a finger anywhere on the painting, or breathe out slowly into the mic.
  A golden ring grows round the sun, the cloud spiral twists inward (shader) and soft harp notes climb.
  Pressing right after the countdown starts the first breath at once.
- Let go: harp notes fall back, and the next part of the world wakes, each with a drawn prop, a spoken line and its
  own sound on its side of the painting: 1 warm sun · 2 river (flows, glints) · 3 wind in the trees · 4 birds (fly
  across; birdsong follows them) · 5 temple bell (left) · 6 flowers (petals, music box on the right) · 7 the sky
  figures sing · 8 the light opens. A too-short breath just gets "A little longer."
- Music: a slow D-major song (66 bpm) that adds one instrument per breath (pad + low piano, harp ripples, piano
  melody, flute, bass + temple bell, music box, soft choir). No buzzy tones; haptics very light.
- Touch to play: once a thing is awake, tap it or slide a finger over it to play it in tune (ring the bell, splash
  the river, shake the trees, birds sing, flowers chime, choir chord). Holding anywhere else breathes in.
- More life: motes of light float round the sun (brighter as the world wakes); the clouds always drift.
- Ending: "Listen to Deborah." then her statement audio plays (3D/gallery/audio/wing_1_1.mp3, 14 s; 20 s cap,
  skipped if missing) with a "Deborah Tramentozzi / In her own words" card and the button hidden; then K.finale
  with her quote (the painting's animation fades in as usual). work.statementAudio can override the clip URL.

## Tested
- Harness &bot=1: plays to the finale, no console errors (only 404s for media not in the test copy).
- By hand on a phone-sized screen (400x860): short press = "A little longer."; full hold wakes the next sense;
  finger on the painting works; touching awake things plays them; first breath starts right after GO.
- Ben's 25 voice clips: names match the lines exactly; played through a full game in Ben's voice with no fallback
  to the computer voice (except Deborah's quote, as intended).
- Ben played a standalone preview (painting + game + his voice + Deborah's clip) and asked for: calmer breath sound,
  a growing song, more life, touch to play, an instant first breath, Deborah's clip. All done.
- Not tested here: the mic on a real phone; the real AR viewer and 3D gallery (the main chat's merge test).
