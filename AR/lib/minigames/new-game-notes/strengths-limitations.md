# Strengths & Limitations (strengths-limitations): Crew call
Files: AR/lib/minigames/strengths-crew.js (no pictures or sounds to add: everything is drawn from the painting with a shader, and the music and sounds are Web Audio)
Export: crewCallGame
index.js import: import { crewCallGame } from './strengths-crew.js';
index.js line: 'strengths-limitations': crewCallGame, // Crew call: a film-set Simon Says with the camera, lights and sound built into the collage; each round the reel spins and a colour comes back
Voice prefix: crew-   (voice.js PREFIX: 'strengths-limitations': 'crew-')
How to play (one sentence, as spoken): Watch and listen to the crew, then play it back in the same order.

What it is (updated 4 Nov, Ben's pick: Simon Says): A film-set Simon Says. The crew stations are real parts of Sophia's painting:
CAMERA = the big lens (left), LIGHTS = the projector (top), SOUND = the teal record beside her face (right). Each has its own musical
sound and character, from its own side: Camera = a warm low horn (C) with the camera's clicking whir; Lights = a bright bell (G) with a
shimmer; Sound = a round bass boom (E) with a mic-check blip. When a station plays, it flashes in its own colour, swells, shakes and turns
full colour on the black-and-white film. No words are drawn over the painting (Ben asked for no pop-ups).
Each round the crew plays a sequence (2 notes in round 1, growing by one each round to 7, a little quicker each time); then "Your turn."
and you play it back with the buttons or by tapping the stations. The film reel kicks round with every note. Right = ACTION: the reel
spins like mad with the projector racing, the lens zooms, and one colour of the collage comes back (teal, orange, purple, blue, yellow,
red). Wrong note = "Oops! Again." and the crew plays it again (no game over; best score = fewest oops). Stuck for 9 s = it plays again.
Six rounds and it's a wrap: projector beam across her face, full colour, her animation fades in. About 1.5 minutes.
Buttons: Camera · Lights · Sound (one row). Tapping a station in the painting works too. Pressing between turns just plays your note.

Tested: test-site harness, bot plays to the finale in 82 s, no console errors (only the 404s for Ben's voice clips, which aren't in the
test pack). Phone-sized screenshots 400×860: buttons fit on one row, nothing covers the painting.
Changes needed in shared files: only the usual index.js lines and the voice.js PREFIX entry above.

Voice lines for Ben to record:
crew-intro         Crew call. Your crew is built into Sophia’s painting. The camera is on the left. The lights are up top. The sound is on the right. Each one has their own sound. Watch and listen to the crew, then play it back in the same order.
crew-round-1       Round 1. Watch and listen.
crew-round-2       Round 2. 3 this time.
crew-round-3       Round 3. 4 this time.
crew-round-4       Round 4. 5 this time.
crew-round-5       Round 5. 6 this time.
crew-round-6       Round 6. 7 this time.
crew-your-turn     Your turn.
crew-oops          Oops! Again.
crew-listen-again  Listen again.
crew-action        Action!
crew-cut-5         Cut! Great take. 5 more.
crew-cut-4         Cut! Great take. 4 more.
crew-cut-3         Cut! Great take. 3 more.
crew-cut-2         Cut! Great take. 2 more.
crew-cut-1         Cut! Great take. 1 more.
crew-wrap          Cut! That’s a wrap!
crew-end           One crew, one film.
(Sophia's quote at the finale stays in her words, read as usual.)
