# Back of a Harley (back-of-a-harley): Ride by feel (POLISHED)
Files changed: AR/lib/minigames/harley-ride.js
New files: AR/lib/minigames/harley-things.js (the drawn yellow curve signs, and the four distant-country strips; imported by the game, nothing to register)
           AR/lib/minigames/craig-hud.js (Craig's three games share it: the score panel, start banner and pop-ups sit just above the painting, as wide as it, following it in the camera; the same file is in all three zips)
           AR/media/games/harley/sky.jpg (a clean copy of the painting's sky with Craig and the moon painted out, so it can scroll behind him)
Pictures: AR/media/games/harley/info.png is unchanged and still used (not in this zip).
Export (unchanged): rideByFeelGame          voice.js PREFIX (unchanged): 'back-of-a-harley': 'harley-',
index.js line (new description): 'back-of-a-harley': rideByFeelGame, // Ride by feel: hold Left or Right and Craig leans his Harley into the curves your buddy calls, then tap when the Harley goes by (Craig Ellis)
Artist's clip at the finale: 3D/gallery/audio/art_47.mp3
voice-lines.js: the FULL list of this game's lines (ready to paste; there was no harley- block before):
  "harley-intro": "Ride by feel. Craig has seen a whole lot of this country on the back of a Harley, and he still rides by feel. Your buddy rides out front and calls each curve, and you’ll hear his bike from that side. Hold Left or Right to lean that way. That’s all. Enjoy the ride.",
  "harley-desert": "The desert. Hot wind on your face, and the smell of sage.",
  "harley-coast": "The coast. Cool salt spray, and gulls overhead.",
  "harley-rain": "A summer storm. Warm rain on your arms, and thunder rolling.",
  "harley-sunset": "Sunset. The air cools, and the whole sky glows.",
  "harley-left": "Curve left!",
  "harley-right": "Curve right!",
  "harley-stop": "Last stop. A diner at sunset. Kick back and listen: cars and bikes are going by. Tap when you hear the Harley, the one with the right pipes.",
  "harley-car": "That was a car.",
  "harley-scooter": "That was a scooter.",
  "harley-truck": "That was a truck.",
  "harley-again": "Let’s listen again. The Harley has a low, lumpy rumble: potato, potato.",
  "harley-yes": "That’s it. The right pipes.",
  "harley-reveal": "That was the Harley, the low potato potato rumble.",
  "harley-end": "Coast to coast.",Lines that are new or changed: all 15 above (the game used the computer voice before). Ben has recorded all 15 (included).
Old lines no longer used: none (there were none).
What changed:
- Layout (all three Craig games): the score panel, the start banner and every pop-up now sit just ABOVE the painting and are exactly as wide as it (at least 260 px, never off screen), following the painting as it moves; pop-ups cover the score panel exactly. Done with craig-hud.js; kit.js unchanged.
- Shorter and clearer: 8 curves (2 in each place: desert, coast, summer rain, sunset) instead of 12, then the last stop. About 1 minute 45.
- Craig and his Harley really lean into each curve with you (up to about 8 degrees, tipping from where the tyres meet the road), cut out with the mask in info.png.
- The world behind him is rebuilt so it moves: the clouds drift past (sky.jpg scrolls round), soft wisps race over them, the moon stays put, the wheat streams past below the horizon, and a drawn strip of distant country slides by for each place (desert mesas and saguaros, the sea with a little lighthouse, farm hills with a red barn, a sunset town with a water tower and windmill), fading from one to the next. Because the sky behind him is clean, nothing of him is left floating when he leans.
- The summer storm: slanting rain in three layers, the light goes grey and cool, a low mist, his highlights look wet, and lightning flashes with thunder a moment later.
- A big drawn yellow "curve ahead" sign swings in on the side of each curve and flashes while your buddy calls it, so you can see the call as well as hear it.
- Lean with big Left / Right buttons, or hold the left or right half of the screen. Tilt removed (a phone held slightly tilted leaned all the time and overrode the buttons).
- Curves alternate fairly (never three the same way in a row).
- Pop-ups (place names, Smooth!, A little gravel) appear up top over the score panel, never over the painting. (A small style tag the game adds and removes itself; kit.js unchanged.)
- Last stop: no emoji on the button; a wrong tap names what went by once; a tap just as the Harley starts is ignored instead of being called wrong.
- Finale: "Coast to coast." → Craig's own clip. Story button stops the clip; pause/resume pause it.
- Fixed: the computer voice read the quote.
- Every sentence is a fixed line (15 lines).
Tested: bot plays to the finale in about 95 s, no errors; the artist's clip starts and plays to the end (22 s); every spoken sentence is in the list; 400×860 phone screen.
Recordings: all 15 lines recorded by Ben, included in this zip as AR/media/voice/harley-*.mp3 (mp3, 24 kHz mono). Checked: every file present and named right, even loudness, and every sentence the game says plays Ben's recording (none fall back to the computer voice).
