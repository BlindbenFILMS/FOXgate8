# Invisibly, Ours (invisibly-ours): Meet the Crowd
Files: AR/lib/minigames/crowd-meet.js (no media of its own: everything drawn in code)
Export: meetCrowdGame
index.js import: import { meetCrowdGame } from './crowd-meet.js';
index.js line: 'invisibly-ours': meetCrowdGame, // Meet the Crowd: tap anyone in the crowd to meet them; 5 people tell you what they live with that you can't see; then Doreen's own voice
Voice prefix: crowd-   (voice.js PREFIX: 'invisibly-ours': 'crowd-')
How to play (one sentence, as spoken): Tap anyone in the crowd to meet them, or press Meet someone.
What it does: tap anywhere on the crowd (or the one big MEET SOMEONE button). That spot lights up with a gold ring, the crowd dims around it, a chime plus that person's own little sound, and they introduce themselves (Maria, James, Keisha, Leo, then always Rosa last), each in their own recorded voice; a black card shows name and line. Meet 5. Then the whole crowd glows and Doreen's own clip plays with a caption (3D/gallery/audio/wing_3_1.mp3); then the finale with her quote.
Tested: bot plays to the finale, no errors; a person takes about 1 minute. Ben's recorded clips play for every line (checked in the preview).
Note for the merge: the game sets window.__sayVoice for a moment while a person speaks; it was only a hint for the preview's computer voice and does nothing in the site.
Changes needed in shared files: index.js (import + SPECIAL line), voice.js PREFIX entry above, voice-lines.js (lines below). Nothing else.
Voice lines (ALREADY RECORDED, in AR/media/voice/; the 5 people are 5 different voices: Maria F, James M, Keisha F, Leo M, Rosa F):
crowd-intro-1    Meet the Crowd.
crowd-intro-2    Everyone here has a story you cannot see.
crowd-intro-3    Tap anyone in the crowd to meet them, or press Meet someone.
crowd-intro-4    Meet 5 people.
crowd-end-1    Everyone here is ours.
crowd-maria    Hi, my name is Maria. I have low vision. My phone reads the signs to me.
crowd-james    Hi, my name is James. I wear hearing aids. You can’t see them under my hair.
crowd-keisha    Hi, my name is Keisha. I live with pain every day. Some days I need to sit.
crowd-leo    Hi, my name is Leo. I am autistic. My headphones help with the noise.
crowd-rosa    Hi, my name is Rosa. I am blind. People tell me I don’t look blind.
(Doreen's own clip and quote are never recorded.)
