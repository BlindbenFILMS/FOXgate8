# A Different Way to See (a-different-way-to-see): Follow the lines
Files: AR/lib/minigames/diffway-lines.js (no media files: the spark, lines and colour are all drawn in code)
Export: followTheLinesGame
index.js line: 'a-different-way-to-see': followTheLinesGame, // Follow the lines: steer a spark along the lines to each scene
index.js import: import { followTheLinesGame } from './diffway-lines.js';
Voice prefix: diffway   (voice.js PREFIX: 'a-different-way-to-see': 'diffway-')
How to play (one sentence, as spoken): Listen for a sound, and steer the spark toward it along the lines: up, down, left or right.

What it is: Deborah's collage starts faded to a pale wash; only the great hall in the middle is in colour. A glowing
red spark sits in the middle, on a network of bright lines laid over the painting's own lines. One scene at a time
makes its own sound (wind in a fir tree, fruit rolling on a table, a pencil sketching, a hushed choir, cicadas,
turning pages, hooves, a fountain) from where it is in the picture, louder as the spark gets close; its end of the
line pulses red. Four big arrow buttons (Left, Up, Down, Right) steer the spark, or tap the painting on the side you
want (tap the spark itself for a spoken hint). Only the right way moves on; a wrong way bumps and comes back ("Not that
way. Listen."); after 7 s idle a hint says which way the sound is. Reaching the scene: it fills with colour from the
middle out, the narrator describes it, and the route glows gold; the spark glides back to the middle and the next
scene calls. A lute tune in D dorian gains notes with each find. 8 details: the whole painting comes into colour,
every line glows gold, then the end panel (Details, Wrong turns) with Deborah's quote, then Deborah's own voice
(3D/gallery/audio/wing_1_2.mp3).

Tested: bot plays to the finale in about 37 s, no errors (only 404s for the not-yet-recorded voice clips);
phone-sized (400x860) screenshots checked; the 4 arrow buttons fit on one row.
Changes needed in shared files: only the index.js line + import, the voice.js PREFIX entry, and these voice lines in voice-lines.js.

Voice lines for Ben to record:
diffway-intro-1        Follow the lines.
diffway-intro-2        Deborah builds a picture one detail at a time.
diffway-intro-3        Your spark starts in the middle of the painting.
diffway-intro-4        Listen for a sound, and steer the spark toward it along the lines: up, down, left or right.
diffway-intro-5        Each place you reach fills with colour, and you hear what is there.
diffway-tree           A tall fir tree stands over golden hills.
diffway-fruit          Ripe fruit sits on a table.
diffway-sketch         Sketches of buildings are pinned to the wall.
diffway-crowd          A crowd bends over a sleeping man.
diffway-travel         Two travellers talk under the olive trees.
diffway-books          A man rests in a sunny room full of books.
diffway-riders         Riders cross a wide green field.
diffway-fountain       People meet beside a stone fountain.
diffway-more-7         7 more.
diffway-more-6         6 more.
diffway-more-5         5 more.
diffway-more-4         4 more.
diffway-more-3         3 more.
diffway-more-2         2 more.
diffway-more-1         1 more.
diffway-no-line        No line that way.
diffway-wrong-1        Not that way.
diffway-wrong-2        Listen.
diffway-hint-up        The sound is up.
diffway-hint-down      The sound is down.
diffway-hint-left      The sound is to the left.
diffway-hint-right     The sound is to the right.
diffway-end-1          Every detail is in place.
diffway-end-2          The picture is whole.
diffway-end-3          Here is Deborah, in her own words.
(Deborah's quote and her own clip stay in her words: not recorded. Note: "7 more." … "1 more." are the same words as
the raise- lines in Art Raised Me Up; voice.js picks the clip with this game's prefix.)
