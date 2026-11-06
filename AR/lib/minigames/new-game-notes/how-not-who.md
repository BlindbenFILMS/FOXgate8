# How, Not Who (how-not-who): First Flight
Files: AR/lib/minigames/hnw-flight.js, AR/lib/minigames/hnw-things.js (drawn paper-coil flowers, rain cloud, sparkle), AR/media/games/hnw/butterfly.png (Doreen's butterfly cut out of the painting)
Export: firstFlightGame
index.js import: import { firstFlightGame } from './hnw-flight.js';
index.js line: 'how-not-who': firstFlightGame, // First Flight: Doreen's butterfly lifts off the painting; move her LEFT / MIDDLE / RIGHT to drink from 8 humming paper flowers, then she flies home
Voice prefix: flight-   (voice.js PREFIX: 'how-not-who': 'flight-')
How to play (one sentence, as spoken): Move her left, middle or right to drink from 8 flowers.
What it does: the butterfly is cut out of the painting (a soft patch of wall covers her spot) and flaps down to the bottom. 8 quilled flowers drift down in 3 lanes, each humming its own note from its side, louder as it nears. Buttons LEFT / MIDDLE / RIGHT or tap that third of the screen. Drinking blooms the flower and her tune grows by one note. Gentle rain clouds to dodge (a bump only wobbles her). A missed flower comes back later. After 8 she flies home and lands back in the painting; finale with Doreen's quote.
Tested: bot plays to the finale in about 29 s, no errors; a person takes about 1 to 2 minutes. Phone screenshots 400x860. Ben's recorded clips play for every line (checked in the preview).
Changes needed in shared files: index.js (import + SPECIAL line), voice.js PREFIX entry above, voice-lines.js (lines below, also in DOREEN-voice-lines-to-add.js). Nothing else.
Voice lines (ALREADY RECORDED, in AR/media/voice/):
flight-intro-1    First Flight.
flight-intro-2    The caterpillar found a new way.
flight-intro-3    Now she can fly.
flight-intro-4    Move her left, middle or right to drink from 8 flowers.
flight-intro-5    Listen.
flight-intro-6    Each flower hums from its side, louder as it comes close.
flight-sunflower    A sunflower.
flight-poppy    A poppy.
flight-daisy    A daisy.
flight-tulip    A tulip.
flight-bluebell    A bluebell.
flight-violet    A violet.
flight-lily    A lily.
flight-rose    A rose.
flight-one-more    One more!
flight-all-8    That is all 8!
flight-rain    Rain!
flight-rain-2    Fly around the clouds.
flight-missed    It drifted past.
flight-missed-2    It will come back.
flight-end-1    She flew home.
flight-end-2    The same butterfly, with a new way to live.
(Doreen's quote is never recorded.)
