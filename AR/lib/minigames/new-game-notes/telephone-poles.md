# Telephone Poles (telephone-poles): Straight as an arrow (POLISHED)
Files changed: AR/lib/minigames/poles-drive.js
New files: AR/lib/minigames/poles-things.js (the drawn pickup and its tail-light glow; imported by the game, nothing to register)
           AR/lib/minigames/craig-hud.js (Craig's three games share it: the score panel, start banner and pop-ups sit just above the painting, as wide as it, following it in the camera; the same file is in all three zips)
Export (unchanged): straightAsAnArrowGame          voice.js PREFIX (unchanged): 'telephone-poles': 'poles-',
index.js line (new description): 'telephone-poles': straightAsAnArrowGame, // Straight as an arrow: hold Go to drive Craig's highway, let go when the poles bend over the road toward your truck (Craig Ellis)
Artist's clip at the finale: 3D/gallery/audio/art_46.mp3
voice-lines.js: the FULL list of this game's lines (ready to paste; there was no poles- block before):
  "poles-intro": "Straight as an arrow. When Craig’s sight began to change, the telephone poles looked like they bent over at the top. Drive his highway at dusk. Hold the Go button to drive. When the poles bend over the road, let go, and wait. When they stand up, drive on.",
  "poles-hold": "Hold the Go button to drive.",
  "poles-down-1": "The poles are bending over the road. Let go!",
  "poles-down-2": "Here they come again. Let go.",
  "poles-down-3": "Slow down, Dad!",
  "poles-down-4": "They’re bending again. Ease off.",
  "poles-down-5": "Careful, here they come.",
  "poles-down-6": "Last one. Let go and wait.",
  "poles-whoa": "Whoa! Too fast.",
  "poles-up-1": "They’re up. Go!",
  "poles-up-2": "Clear. Go!",
  "poles-up-3": "Up again. Go!",
  "poles-left-5": "5 to go.",
  "poles-left-4": "4 to go.",
  "poles-left-3": "3 to go.",
  "poles-left-2": "2 to go.",
  "poles-left-1": "1 to go.",
  "poles-home": "Home. And your son says, Dad, those things are straight as an arrow.",
  "poles-end": "Home safe.",
Lines that are new or changed: all 19 above (the game used the computer voice before). Ben has recorded all 19 (included).
Old lines no longer used: none (there were none).
What changed:
- Layout (all three Craig games): the score panel, the start banner and every pop-up now sit just ABOVE the painting and are exactly as wide as it (at least 260 px, never off screen), following the painting as it moves; pop-ups cover the score panel exactly. Done with craig-hud.js; kit.js unchanged.
- One action: HOLD Go (or hold anywhere on the painting) to drive, LET GO to stop. Tilt and drag removed: on phones the tilt baseline was faster than "safe", so players got zapped without doing anything wrong.
- Craig's old pickup (drawn, with him and his son in the cab) replaces the generic car. It drives ahead up the road (smaller, further away) while you hold Go and drifts back toward you when you let go; tail lights glow when you stop.
- The poles themselves now bend over at the top toward the road and the truck: the near pole and the next one bend from low down and arch right over the road (with soft sky painted back in behind them), the far ones sway. The old drooping-wire effect is gone.
- Every pole whooshes past on your left (faster when you drive faster); the poles creak and hum when they bend.
- More time to react (the zap only comes 1.8 s after the warning), a nudge if you haven't started driving, a count after each bend ("3 to go.").
- At home the poles slowly stand straight as your son says "straight as an arrow", with a shimmer.
- Finale: "Home safe." → Craig's own clip (music soft under him, then back). Story button stops the clip; pause/resume pause it.
- Pop-ups (Let go, Whoa!, Nice and easy!, the countdown) appear up top over the score panel, never over the painting. (Done with a small style tag the game adds and removes itself; kit.js unchanged.)
- Every sentence is a fixed line (19 lines).
Tested: bot plays to the finale in about 70 s (it drives through one set of wires on purpose), no errors; the artist's clip starts and plays; every spoken sentence is in the list; 400×860 phone screen.
Recordings: all 19 lines recorded by Ben, included in this zip as AR/media/voice/poles-*.mp3 (mp3, 24 kHz mono). Checked: every file present and named right, even loudness, and every sentence the game says plays Ben's recording (none fall back to the computer voice).
