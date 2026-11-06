# The Button is to the Left (the-button-is-to-the-left): Cross the street
(Second version: Ben asked for something simpler, with a person with a cane crossing one street, and a car running the
light. This replaces the first "Find the button" version: same file names, new export name.)
Files: AR/lib/minigames/button-cross.js, AR/lib/minigames/button-things.js, AR/media/games/button/pole.png,
  AR/media/games/button/clean.jpg, AR/media/games/button/taxi.png
Export: crossTheStreetGame
index.js import: import { crossTheStreetGame } from './button-cross.js';
index.js line: 'the-button-is-to-the-left': crossTheStreetGame, // Cross the street: press the button, wait for WALK, hold to cross with your white cane, stop for the car that runs the red light
Voice prefix: button   (voice.js PREFIX: 'the-button-is-to-the-left': 'button-')
How to play (one sentence, as spoken): Press the button. Wait for the walk sign. Hold Walk to walk, let go to stop. Listen for cars!

What it is:
- YOU are the person at the curb with the long white cane (drawn, seen from behind, walking away from us across the
  crosswalk and getting smaller). The painting's own crossing button is right next to you on the pole to your left,
  ticking like a real accessible button (from the left). Press it (PRESS, or tap anywhere): "Wait."
- Waiting: traffic roars (cars whoosh both ways, horns, a bus, the yellow taxi crossing). Hold Walk too early: you
  step off the curb, a car honks you back.
- WALK: the painting's yellow signal shows the walking person, the rapid walk tick plays, "Walk sign is on. Hold Walk
  to cross." HOLD WALK (or hold anywhere on the screen) to walk; footsteps and cane taps; let go to stop.
- A car RUNS THE RED LIGHT once you're 20% across: its engine roars in from the right, headlights flare, the screen
  gets a red frame, "Listen! A car!". Let go and stop in time: it shoots past ("Good stop! That car ran the red
  light."). Keep walking into the lane: a close call: it swerves, horn blaring, you jump back ("Whoa! ... Are you OK?
  Keep going."). You are never hurt. Then keep going to the far curb.
- THE POLE IN FRONT: the left pole (with its signal heads, the button and the base) is cut out of the painting
  (media/games/button/pole.png, full-size with alpha, drawn over everything), so the cars pass behind it.
- THE PAINTED TAXI DRIVES OFF: the painting's own blurred yellow taxi (right) is cut out (taxi.png); the game draws the
  painting from clean.jpg (taxi taken out, the street filled in from just to its left). The taxi idles, then pulls away
  to the RIGHT (we only see its back end) and off the screen the moment you press the button.
- The walker has long, wavy brown hair (like Anthony's; from behind it could be him or a woman), swaying as you walk;
  polished: ink outlines and two-tone shading like the painting (lit from the upper left), a teal hoodie with hood and
  folds, jeans with seams, sneakers, hands, a cane with a black grip, red tip and rolling ball tip, and a long cast shadow.
- ASK any time: a passerby pops up and says what you need ("The button is right next to you, on your left." /
  "Not yet." / "Go now." / "Stop! A car is running the red light!").
- Finale cells: The red-light car (Good stop / Close call), Asked for help, Time. Anthony's own statement
  (3D/gallery/audio/wing_0_0.mp3) plays 2.6 s after the finale (work.statementAudio can point elsewhere; the preview does).
- Like the other Anthony games, its style tag moves the kit's alert and countdown just above the buttons. kit.js untouched.
- Test the close call with &bot=1&close=1 (the robot keeps walking).

Tested: bot plays to the finale in about 18 s (it tries to go early once and asks once), both "Good stop" and "Close
call" runs, no errors. Phone-sized screenshots checked.
Changes needed in shared files: only the index.js lines and the voice.js PREFIX entry above, plus voice-lines.js.

*** KEEP "WAIT" IN THE COMPUTER VOICE (Ben's instruction) ***
After the button is pressed, the game says "Wait." over and over (every 1.6 s, skipping when another line is being
said) until the walk sign comes on, like a real accessible crossing button. It ALWAYS uses the phone's computer voice:
the game calls ctx.say (the raw text-to-speech) directly, not G.say, so it never plays a recording. Do NOT record a
"Wait." line for this game, and do NOT add one to voice-lines.js with the button- prefix, when natural voice audio is
made for these games.

Polish (3 Nov, evening): every text box got a little breathing room via this game's own style tag (finish card inset
18 px with 20 px padding, score cells padded with smaller labels so they don't wrap badly, quote, panel, alerts, pop-ups
kept on one line). kit.js untouched.
Also added: a slight LOFI music bed (dusty keys, lazy swung beat, soft bass, vinyl crackle, 76 bpm) from the intro to the
end; it dips while the red-light car comes so you can hear the engine. The finish card's first cell is now 'The car'.

Ending (3 Nov, late): Anthony's own clip now starts 2.2 s after the finish card comes up (right after the narrator's
last line), with the game's music dipped right down under him (4%); when he finishes the music comes back up gently, then
fades out about 7 s later. (If the clip can't play, the music comes straight back.)
VOICE SCRIPT: use new-game-notes/ANTHONY-FERRARO-VOICE-SCRIPT.txt for the voice lines (it replaces the list below and splits
longer lines into single sentences).
Voice lines for Ben to record (everything except "Wait."):
button-intro-1   Cross the street.
button-intro-2   You are at the curb with your white cane.
button-intro-3   The crossing button is right next to you.
button-intro-4   Press it, then wait for the walk sign.
button-intro-5   Hold Walk to walk, and let go to stop.
button-intro-6   Listen out for cars!
button-early     Wait for the walk sign!
button-walk-1    Walk sign is on.
button-walk-2    Hold Walk to cross.
button-listen    Listen! A car!
button-good      Good stop! That car ran the red light.
button-whoa      Whoa! That car ran the red light.
button-ok        Are you OK?
button-keep      Keep going.
button-waiting   Keep going. The cars are waiting for you.
button-left      The button is right next to you, on your left.
button-notyet    Not yet. Wait for the walk sign.
button-go        Go now. Hold Walk to cross.
button-almost    Keep going. You are almost there.
button-stop      Stop! A car is running the red light!
button-made-it   You made it across!
(Anthony's quote stays in his own words.)
