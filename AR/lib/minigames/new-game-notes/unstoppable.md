# Unstoppable (unstoppable): Tree Pose
Files: AR/lib/minigames/unstop-tree.js (no media of its own: the painting is used through a shader)
Export: treePoseGame
index.js import: import { treePoseGame } from './unstop-tree.js';
index.js line: 'unstoppable': treePoseGame, // Tree Pose: keep Doreen balanced on one leg with LEFT / RIGHT; steady time opens 8 lotus petals; gusts of doubt blow by; then Doreen tells her story
Voice prefix: lotus-   (voice.js PREFIX: 'unstoppable': 'lotus-')
How to play (one sentence, as spoken): If she leans one way, press the other way.
What it does: a shader sways Doreen and the lotus around her standing foot. Hold LEFT / RIGHT (or press that half of the screen) to bring her back. A balance tone is pure when centred, beats and pans toward her lean. 2.6 s steady = a petal (glow + note); the painting goes from pale to warm as petals open. Gusts of doubt (word tags: THE NEWS, YOU CAN'T, TOO HARD, GIVE UP) blow in from a side and push. Leaning too far = "Whoa! Breathe." (no losing). Pop-up messages sit over the petals banner at the top so they don't cover the painting (a small style the game adds and removes itself). 8 petals: finale "Unstoppable!", then Doreen's own story clip (3D/gallery/audio/wing_3_2.mp3).
Tested: bot plays to the finale in about 24 s, no errors; a person takes about 1 minute. Ben's recorded clips play for every line (checked in the preview).
Changes needed in shared files: index.js (import + SPECIAL line), voice.js PREFIX entry above, voice-lines.js (lines below). Nothing else.
Voice lines (ALREADY RECORDED, in AR/media/voice/):
lotus-intro-1    Tree Pose.
lotus-intro-2    Doreen is balancing on one leg.
lotus-intro-3    Keep her steady.
lotus-intro-4    If she leans one way, press the other way.
lotus-intro-5    Listen: the tone is smooth when she is centered.
lotus-intro-6    Stay steady to open 8 lotus petals.
lotus-petal    A petal opens.
lotus-one-more    One more petal.
lotus-open    The lotus is open!
lotus-gust    A gust of doubt!
lotus-gust-2    Hold her steady.
lotus-whoa    Whoa!
lotus-whoa-2    Breathe, and bring her back to the middle.
lotus-end-1    Nothing stopped her.
(Doreen's own clip and quote are never recorded.)
