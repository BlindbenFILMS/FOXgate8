# HOPE IS NOT LOST (hope-is-not-lost): Fly to the light
Files: AR/media/voice/hope-*.mp3, AR/lib/minigames/hope-fly.js, AR/lib/minigames/hope-things.js, AR/media/games/hope/island.png, AR/media/games/hope/sky.jpg
Export: hopeFlyGame
index.js import: import { hopeFlyGame } from './hope-fly.js';
index.js line: 'hope-is-not-lost': hopeFlyGame, // Fly to the light: steer the floating island LEFT / RIGHT toward the wind chimes of the dawn, around 8 rumbling storms, to the sunrise (Ricky Ruzicka)
voice.js PREFIX line: 'hope-is-not-lost': 'hope-',
Artist's clip at the finale: 3D/gallery/audio/art_35.mp3
voice-lines.js entries (ready to paste):
  "hope-intro-1": "Fly to the light.",
  "hope-intro-2": "Storm clouds rumble ahead.",
  "hope-intro-3": "Somewhere else, the wind chimes of the dawn are ringing.",
  "hope-intro-4": "Hold left or right to steer the island toward the chimes, and fly around the storm.",
  "hope-intro-5": "Pass eight storms to reach the sunrise.",
  "hope-storm-left": "Storm on the left!",
  "hope-storm-middle": "Storm in the middle!",
  "hope-storm-right": "Storm on the right!",
  "hope-follow-right": "Follow the chimes to the right.",
  "hope-follow-left": "Follow the chimes to the left.",
  "hope-pass-1": "Through the storm!",
  "hope-pass-2": "The sky is brighter!",
  "hope-pass-half": "Halfway to the sunrise!",
  "hope-pass-one": "One more storm!",
  "hope-pass-sun": "The sun is rising!",
  "hope-hit": "The storm shook the island.",
  "hope-follow": "Follow the chimes.",
  "hope-all-way": "You flew all the way to the light!",
  "hope-end": "You reached the light!",

How to play (one sentence, as spoken): Storm clouds rumble ahead. Somewhere else, the wind chimes of the dawn are ringing. Hold left or right to steer the island toward the chimes, and fly around the storm. Pass eight storms to reach the sunrise.
What it does: The floating island lifts out of the painting (cut out: media/games/hope/island.png, with the clouds behind it filled in from the painting's own clouds: sky.jpg) and flies through a dusky sky. Storm clouds come from far ahead, rumbling from their side, louder and bigger as they come. The wind chimes of the dawn ring where it's safe; hold LEFT or RIGHT (or hold that half of the screen) to steer toward them. Each storm passed warms the sky toward dawn and adds a layer to the music; flying into one shakes the island with thunder and lightning (no game over). After 8 storms the sun rises, the island floats home into the painting and Ricky speaks. Plays on screen even if the painting leaves the camera (it pauses).
Tested: the bot plays to the finale in about 77 s on a 400x860 phone-sized screen, no console errors; the artist's clip starts 2.5 s into the finale (currentTime moving); every sentence the game said is in the voice script.
Recordings: Ben recorded every line (included in the zip: yes, AR/media/voice/, all lines for this game). Add the voice.js PREFIX line and the voice-lines.js entries above so they play.
Changes needed in shared files: artworks.js has no quote for this painting yet. Please add Ricky's quote to work.quote (the game also carries it as a QUOTE constant, so it works either way). No other shared-file changes.
