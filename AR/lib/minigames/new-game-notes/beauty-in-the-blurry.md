# Beauty in the Blurry (beauty-in-the-blurry): Bring the blur to life
Files: AR/lib/minigames/blurry-wake.js (no pictures to add: the painting is woken up with a shader, the music and sounds are Web Audio)
Export: bringTheBlurGame
index.js import: import { bringTheBlurGame } from './blurry-wake.js';
index.js line: 'beauty-in-the-blurry': bringTheBlurGame, // Bring the blur to life: drag your finger over the sleeping night street to wake its seven lights, each adding a part to the music
Voice prefix: blur-   (voice.js PREFIX: 'beauty-in-the-blurry': 'blur-')
How to play (one sentence, as spoken): Drag your finger across the painting to wake it up.

What it is (Ben's pick, 4 Nov, after starting over from "Feel the lights"): Delric's night street is asleep: dim, grey-blue, only the
rain. Wherever your finger goes the street brightens, the colour comes back and the wet road ripples (a shader over the real painting),
leaving a soft trail of light. Seven lights sleep in the painting: the neon sign, the shop windows (left), the street lamps, the
billboard, the cars, the windows on the right, the wet road. Trace over or hold on one and a ring in its colour fills up with a rising
tone and little buzzes, then it wakes for good: it glows and adds its part to the music (bass, chords, a twinkling arpeggio, a pad, a
beat, a melody, rain and water drops; Am F C G at 84 BPM). Wake all seven and the whole street sings and glows; Delric's quote, his
animation fades in. No wrong moves. About 30 to 60 seconds.
For blind players: the nearest sleeping light calls out from its side (louder when close); "Where next?" says which way; "Glow" wakes
the nearest light without dragging (3 presses).
Buttons: Where next? · Glow (one row).
Ben's fixes: lights at the edges were hard to wake, so tracing over a light now counts, each light's reach is bigger, the edge lights
moved in a little, holding takes 0.75 s, and the filling ring shows it's working.

Tested: in a copy of the site (Ben's recorded voice included), bot plays to the finale, no console errors, phone-sized screenshots
390×844: buttons fit on one row. A quick half-second swipe down the left side wakes both left lights.
Changes needed in shared files: only the usual index.js lines and the voice.js PREFIX entry above, plus the voice lines in
DELRIC-voice-lines-to-add.js. (Not used any more: an earlier "Feel the lights" version; nothing from it is saved here.)

Voice lines: recorded by Ben, all 29, in AR/media/voice/blur-*.mp3 (script: DELRIC-POLLINS-VOICE-SCRIPT.txt).
(Delric's quote at the finale stays in his words, read as usual.)
