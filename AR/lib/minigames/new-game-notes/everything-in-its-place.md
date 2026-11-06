# Everything in Its Place (everything-in-its-place): Put it back
Files: AR/lib/minigames/place-putback.js
       AR/media/games/place/backdrop.jpg (the painting with the six desk things taken off)
       AR/media/games/place/watch.png, wallet.png, cologne.png, pencup.png, glass.png, books.png (each thing cut out of the painting)
Export: putItBackGame
index.js import: import { putItBackGame } from './place-putback.js';
index.js line: 'everything-in-its-place': putItBackGame, // Put it back: a wave knocks Delric's things into the sea; pick each one up and put it back in its place, left to right
Voice prefix: place-   (voice.js PREFIX: 'everything-in-its-place': 'place-')
How to play (one sentence, as spoken): Tap a thing, then tap its place on the desk.

What it is: Delric's desk on the cliff, the six things left to right: watch, wallet, cologne (Ben: it's cologne, not ink), pen cup,
glass, books. First a roll call: each lights up and makes its own sound as it's named (tick-tick, leather creak, click + psst psst,
pens rattling, glass clink, pages riffling). Then a wave: the sea draws back with a rumble, and a breaking wave made of the painting's
own sea (shader: steep face, glassy teal crest, white lip, spray) rolls in from the right, over the desk, sweeping each thing off as the
crest passes. They bob in the sea, each sounding from where it floats. Pick one up (tap it, or Pick up), then tap its glowing place on
the desk (or drag it there: sliding along the desk you hear each place's sound). Wrong place: "That's the wallet's place." and you keep
holding it. Every thing put back calms the sea. Three waves: 2, then 4, then all 6. Then the sea goes still, the desk glows, Delric's
quote, his animation. About 50 seconds.
Buttons: Pick up · Help (one row). Help says where the thing you're holding goes ("between the wallet and the pen cup") and its place
chimes; press it again and it goes back by itself.
Ben's fixes: no sea sound until the first wave; the sea at full volume while a wave knocks things off, half volume while picking things
up; "Splash!" and the end alert sit in the gap under the painting so the wave stays in view; name pop-ups appear just under the desk.

Tested: in a copy of the site (Ben's recorded voice included), bot plays all three waves to the finale, no console errors; phone-sized
screenshots 390×844: buttons fit on one row, the alert sits between the painting and the buttons.
Changes needed in shared files: only the usual index.js lines and the voice.js PREFIX entry above, plus the voice lines in
DELRIC-voice-lines-to-add.js.

Voice lines: recorded by Ben, all 39, in AR/media/voice/place-*.mp3 (script: DELRIC-POLLINS-VOICE-SCRIPT.txt).
(Delric's quote at the finale stays in his words, read as usual.)
