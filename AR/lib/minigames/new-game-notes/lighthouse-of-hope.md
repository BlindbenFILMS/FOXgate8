# Lighthouse of Hope (lighthouse-of-hope): Riddles of the lighthouse (POLISHED)
Files changed: AR/lib/minigames/lighthouse-riddles.js
New files: AR/lib/minigames/lighthouse-things.js (the drawn ship, its lantern glow and gold wake; imported by the game, nothing to register)
           AR/lib/minigames/craig-hud.js (Craig's three games share it: the score panel, start banner and pop-ups sit just above the painting, as wide as it, following it in the camera; the same file is in all three zips)
Export (unchanged): riddlesOfTheLighthouseGame          voice.js PREFIX (unchanged): 'lighthouse-of-hope': 'light-',
index.js line (new description): 'lighthouse-of-hope': riddlesOfTheLighthouseGame, // Riddles of the lighthouse: answer riddles about blindness and hope (left, middle, right); each right answer guides a ship home on the beam (Craig Ellis)
Artist's clip at the finale: 3D/gallery/audio/art_45.mp3
voice-lines.js: the FULL list of this game's lines (ready to paste; there was no light- block before):
  "light-intro": "Riddles of the lighthouse. Hello, traveller. Six ships are lost at sea tonight. Answer my riddles, and my light will guide them home. The answers are left, middle and right.",
  "light-r1": "Riddle 1.",
  "light-q1": "I have no hands, but I lead the way. I walk beside you every day. I stop at every curb and stair, and wag my tail to say we’re there. What am I? Left, a guide dog. Middle, a cat. Right, a pigeon.",
  "light-hint1": "I wear a harness, and I love a good belly rub.",
  "light-yes1": "Yes! A guide dog. A best friend and a guide.",
  "light-home1": "1 ship is home.",
  "light-r2": "Riddle 2.",
  "light-q2": "I’m long and white, I tap and sweep. I find the curb before you leap. Fold me up and I fit in a bag. What am I? Left, an umbrella. Middle, a white cane. Right, a broom.",
  "light-hint2": "People who are blind hold me out in front, tapping side to side.",
  "light-yes2": "Yes! A white cane. Tap, sweep, and step with confidence.",
  "light-home2": "2 ships are home.",
  "light-r3": "Riddle 3.",
  "light-q3": "I’m little bumps, in groups of six. You read me with your fingertips. What am I? Left, Morse code. Middle, sign language. Right, Braille.",
  "light-hint3": "Louis Braille invented me when he was only fifteen.",
  "light-yes3": "Yes! Braille. Reading with your fingertips.",
  "light-home3": "3 ships are home.",
  "light-r4": "Riddle 4.",
  "light-q4": "Touch me and I talk. I read your messages and your books out loud, so you can use a phone without seeing it. What am I? Left, a radio. Middle, a screen reader. Right, an alarm clock.",
  "light-hint4": "I live inside phones and computers, and I speak whatever is on the screen.",
  "light-yes4": "Yes! A screen reader. A voice for everything on the screen.",
  "light-home4": "4 ships are home.",
  "light-r5": "Riddle 5.",
  "light-q5": "I stand on the shore and shine all night, so ships lost at sea can find their way. Craig says I’m just like hope. What am I? Left, a lighthouse. Middle, the moon. Right, a campfire.",
  "light-hint5": "I stand tall by the sea, with a great lamp at the top.",
  "light-yes5": "Yes! A lighthouse. A light that says, this way, you’re not alone.",
  "light-home5": "5 ships are home.",
  "light-r6": "Riddle 6.",
  "light-q6": "Craig says it’s the very first thing they give to someone losing their sight. It weighs nothing at all, but it lights the way to the future. What is it? Left, a map. Middle, a flashlight. Right, hope.",
  "light-hint6": "Look at the name of this painting.",
  "light-yes6": "Yes. Hope. The first thing they give, and the light that shines out of the lighthouse.",
  "light-no": "Not that one.",
  "light-all-home": "Every ship is home.",
  "light-end": "Hope is the light.",Lines that are new or changed: all 33 above (the game used the computer voice before). Ben has recorded all 33 (included).
Old lines no longer used: none (there were none).
What changed:
- Layout (all three Craig games): the score panel, the start banner and every pop-up now sit just ABOVE the painting and are exactly as wide as it (at least 260 px, never off screen), following the painting as it moves; pop-ups cover the score panel exactly. Done with craig-hud.js; kit.js unchanged.
- Six little drawn sailboats wait on the horizon, one per riddle, ringing a bell from their side. A right answer locks the moon-lamp's beam onto the ship and it sails home into the near water; the sea grows more golden and the music adds voices with every ship.
- A dim searching beam sweeps the sea while a riddle is asked.
- Answers are in a fixed order per riddle and read as "Left, … Middle, … Right, …"; tap the button or that third of the screen. Taps sound from their side.
- Big answer buttons (16px), Again is an icon button. The right answer shows as a blue pop-up above the painting. A wrong answer greys out and the ship rocks.
- Shorter intro. Every sentence is a fixed line (33 lines). Hint for riddle 5 no longer names a specific organisation.
- Finale: "Every ship is home." → end panel "Hope is the light." → Craig's own clip (music drops to a soft bed under him, then comes back). Story button stops the clip. Pause/resume pause the clip and music.
- Fixed: "First try" showed 0; the computer voice read the quote.
Tested: bot plays to the finale in about 40 s, no errors; the artist's clip starts and plays to the end (24 s); every spoken sentence is in the list; 400×860 phone screen, buttons fit on one row.
Recordings: all 33 lines recorded by Ben, included in this zip as AR/media/voice/light-*.mp3 (mp3, 24 kHz mono). Checked: every file present and named right, even loudness, and every sentence the game says plays Ben's recording (none fall back to the computer voice).
