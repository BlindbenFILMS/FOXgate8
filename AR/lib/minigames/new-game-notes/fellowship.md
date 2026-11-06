# Fellowship (fellowship): Pass it on
Files: AR/lib/minigames/fellowship-pass.js, AR/lib/minigames/fellowship-pass-things.js (no media files: everything is drawn in code)
Export: fellowshipPassGame
index.js import: import { fellowshipPassGame } from './fellowship-pass.js';
index.js line: 'fellowship': fellowshipPassGame, // Pass it on: a warm glow travels around the circle on the beat; tap PASS when the bell rings to pass it on and bring each friend's colour back
Voice prefix: fellow   (voice.js PREFIX: 'fellowship': 'fellow-')
RETIRED: fellowship-circle.js and fellowship-things.js (the earlier "Gather the circle" game, already on Ben's computer) are not used any more and can be deleted. Don't import them.
How to play (one sentence, as spoken): When the glow lands on a friend and the bell rings, tap PASS to pass it on.
What it does: the painting starts faded to soft gray. A warm glow (like a squeeze of the hand) hops around 8 people in the painting, in a ring, on a gentle 72 bpm heartbeat groove. When it lands, a bell rings from that friend's side (panned) and they pulse. Tap PASS (one big button) or anywhere on the painting on the bell: their colour comes back, their note joins the groove. Early: a soft tick and "wait for the bell", nothing lost. Late: the glow waits and the bell rings again every beat. Two laps = 16 passes; lap 2 adds shaker and bass, then the friends' notes and a soft clap. "I've got you." is spoken for the first 3 passes, then a warm chime. After 16: the whole painting colours and glows, the music swells, "Everyone has someone.", finale with Nikki's quote, then Nikki's own audio (3D/gallery/audio/wing_5_0.mp3; if it fails, her quote is read).
Tested: bot plays to the finale in 31 s of game time (perfect timing; one deliberate missed bell), no errors (only 404s for Ben's voice clips, which the test site doesn't have). Real clicks: PASS during travel does nothing harmful; PASS after a missed bell passes on the repeat. A real player takes about 45–75 s. Phone screenshots 400×860: start, mid-game, finale, manual pass.
Changes needed in shared files: index.js (import + SPECIAL line above), voice.js PREFIX ('fellowship': 'fellow-'), voice-lines.js (lines below). Nothing else.
Voice lines for Ben to record:
fellow-intro    Pass it on. A warm glow travels around Nikki’s circle of friends, like a squeeze of the hand. When the glow lands on a friend, a bell rings from their side. Tap pass on the bell to pass it on. If you miss it, it waits for you.
fellow-got-you    I’ve got you.
fellow-one-more-lap    Everyone has the glow. One more lap.
fellow-everyone    Everyone has someone.
fellow-all-round    Passed all the way round. The whole circle is glowing.
(Nikki's quote is never recorded: her own clip plays at the end.)
