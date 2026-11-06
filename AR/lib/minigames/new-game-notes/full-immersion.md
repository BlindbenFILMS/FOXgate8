# Full Immersion (full-immersion): Street of senses
Files: AR/lib/minigames/immersion-senses.js (no pictures or sounds to add: the walk, banners, umbrellas and light are drawn from the painting with a shader; music and sounds are Web Audio)
Export: streetOfSensesGame
index.js import: import { streetOfSensesGame } from './immersion-senses.js';
index.js line: 'full-immersion': streetOfSensesGame, // Street of senses: walk up the market street; step left or right toward each sound, smell and light to catch 10 moments
Voice prefix: street-   (voice.js PREFIX: 'full-immersion': 'street-')
How to play (one sentence, as spoken): When something comes alive on the left or the right, tap it, or press its side, to catch the moment.

What it is: You walk up Sophia's own market street: the painting slowly moves in around you with a little step in each stride, the
orange banners flutter, the umbrellas sway, and light streaks drift down between the buildings. Real things in the painting come alive
one at a time on the LEFT or RIGHT, glowing, with their own sound from their own side: fresh bread at the stall, a sizzling pan under the
blue umbrella, the warm lamp, voices in another language, cobblestones underfoot, a flag in the wind, spices, street music, church
bells, sunlight. Each moment has a pulsing target on the painting with a big TAP sign above it (Ben asked for TAP on the screen): white ripples,
and a red ring that drains like a clock as the moment's 4 seconds run out. TAP it (a tap right on it always catches it), tap that
half of the painting, or press Left / Right. A catch bursts with light, sparks fly up into the sky, and each catch rings a little
higher up the scale; more light comes into the street, and the sense you caught (Smell, Light,
Language, Cobblestones, Wind, Sound) is spoken and shown in the panel above. No words are drawn over the painting (Ben asked for no pop-ups). Each moment waits 4 seconds; missed ones come back later. Catch 10 and the
light floods the whole street while every moment in it lights up one after another, then her animation fades in. About 1 minute (more with misses).
Buttons: ← Left · Right → (one row).

Tested: test-site harness, bot plays to the finale in 40 s, no console errors (only voice-clip 404s); 30 s with no input (moments pass
and come back). Phone-sized screenshots 400×860.
Changes needed in shared files: only the usual index.js lines and the voice.js PREFIX entry above.

Voice lines for Ben to record:
street-intro       Street of senses. You are walking up a market street in a city far from home. Listen. When something comes alive on the left or the right, tap it, or press its side, to catch the moment. Catch 10.
street-bread       Fresh bread, on the left.
street-sizzle      A sizzling pan, on the right.
street-lamp        A warm lamp, on the left.
street-voices      Voices in another language, on the right.
street-cobbles     Cobblestones under your feet, on the left.
street-flag        A flag in the wind, on the right.
street-spice       Spices, on the left.
street-music       Street music, on the right.
street-bells       Church bells, on the left.
street-sun         Sunlight, on the right.
street-smell       Smell.
street-light       Light.
street-language    Language.
street-cobblestones Cobblestones.
street-wind        Wind.
street-sound       Sound.
street-9-more      9 more.
street-8-more      8 more.
street-7-more      7 more.
street-6-more      6 more.
street-5-more      5 more.
street-4-more      4 more.
street-3-more      3 more.
street-2-more      2 more.
street-1-more      1 more.
street-full        The whole street is full of light!
street-passed      It passed by.
street-other-way   Other way.
street-on-left     On the left.
street-on-right    On the right.
street-end         You were really there.
(Sophia's quote at the finale stays in her words, read as usual.)
