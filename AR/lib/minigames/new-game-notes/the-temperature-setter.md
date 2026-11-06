# The Temperature Setter (the-temperature-setter): Hands up, hands down
Files: AR/lib/minigames/temp-hands.js
       AR/lib/minigames/temp-things.js (drawn props: the two button pictures and the crowd hands; also a mic and a meter, not used yet)
       (no picture files: the crowd's wave and the heat are a shader over the real painting; the beat and the crowd are Web Audio)
Export: handsUpGame
index.js import: import { handsUpGame } from './temp-hands.js';
index.js line: 'the-temperature-setter': handsUpGame, // Hands up, hands down: lead the crowd on the beat; their hands rise and fall, the room heats up, 50 to 5,000 people
Voice prefix: heat-   (voice.js PREFIX: 'the-temperature-setter': 'heat-')
How to play (one sentence, as spoken): Listen for the call, then press hands up, or hands down, on the next beat.

What it is: you're Delric on stage. A hip-hop beat (kick, clap, hats, bass, 92 BPM) plays two bars, then the calls come: Ben's
"Hands up!" with a rising whoosh or "Hands down!" with a falling whoosh and a boom, plus a sign over the stage and the matching button
outlined. Press on the beat the call ends on (each call starts early by the length of Ben's clip, VO_LEN in the file: up 0.77 s,
down 1.51 s; change those numbers if he re-records). The painted crowd's hands rise or fall in a wave out from the stage, the crowd
roars, drawn hands pack in at the front, and the room heats up: cool grey, then gold, then red hot, the stage light blooming on the beat.
On the beat = PERFECT (more heat); a bit late still counts; wrong button = "Other way!" (no losing). Calls get closer together as it
heats up. At 5,000 people: the stage blazes, sparks, roar, Delric's quote, his animation. About 45 seconds; score = PERFECTs.
Buttons: Hands up · Hands down (one row, with drawn pictures). Tapping the top or bottom half of the screen works too.

Tested: in a copy of the site (Ben's recorded voice included), bot plays to the finale, no console errors; phone-sized screenshots
390×844: buttons fit on one row.
Changes needed in shared files: only the usual index.js lines and the voice.js PREFIX entry above, plus the voice lines in
DELRIC-voice-lines-to-add.js.

Voice lines: recorded by Ben, all 10, in AR/media/voice/heat-*.mp3 (script: DELRIC-POLLINS-VOICE-SCRIPT.txt).
(Delric's quote at the finale stays in his words, read as usual.)
