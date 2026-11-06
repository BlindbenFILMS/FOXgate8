# All the Possibilities (all-the-possibilities): Show her (POLISHED)
Files changed: AR/lib/minigames/possible-window.js
New files: none (pictures in AR/media/games/possible/ are unchanged)
Export (unchanged): showHerGame          voice.js PREFIX (unchanged): 'all-the-possibilities': 'show-',
index.js line (new description): 'all-the-possibilities': showHerGame, // Show her: tap, and the round window shows the girl what she could do one day; hear each one, collect 9 lights (Raquel Alim)
Artist's clip at the finale: 3D/gallery/audio/art_11.mp3
voice-lines.js: the FULL list of this game's lines (add as a new block; there was no show- block before):
```
  "show-intro-1": "Show her.",
  "show-intro-2": "Raquel sits beside her 12-year-old self.",
  "show-intro-3": "Tap to show the girl what she could do one day.",
  "show-music": "She could make music.",
  "show-dance": "She could dance.",
  "show-paint": "She could paint.",
  "show-sports": "She could play sports.",
  "show-bike": "She could ride a bike.",
  "show-fashion": "She could design fashion.",
  "show-world": "She could see the world.",
  "show-power": "She could find her power.",
  "show-dreams": "And anything she dreams.",
  "show-hint": "Tap to show her more.",
  "show-end": "So many options.",
```
Lines that are new or changed (Ben needs to record these): all 14 above.
Old lines no longer used: none (the game used the computer voice before). The old intro and the finale no longer read the quote in the computer voice.
What changed:
- Raquel reads her own quote at the end (art_11.mp3); the music drops to a soft bed under her; pause/resume/story button handled.
- Each possibility has its own sound picture, panned left to right: piano, dancing feet, brush strokes, the goalball bell rolling past, a bike bell, a sewing machine, the sea and gulls, a deep drum, a shower of stars.
- The painting in the window swirls in, then settles sharp and bright.
- A glass-orb light in each possibility's colour flies to the girl and stays in an arc over her head (9 by the end), glowing, shimmering in a wave and twinkling with a tiny chime; at the end they circle the window and she turns to Raquel.
- Shorter intro; a spoken hint after 9 s without a tap (at most 3 times); tidier top panel (the word big, painting and artist on the sub line).
- Timers pause with the game (no setTimeout).
Note for the main chat: Ben asked (in the preview) for the top panel to sit above the painting, not over it. In the AR viewer that depends on where the camera sees the painting, and the panel is the shared kit HUD, so nothing was changed for that; consider it at merge time if wanted for all games.
Tested: bot plays to the finale in about 40 s, no errors from the game; the artist's clip starts (currentTime moving); every spoken sentence is in the list above (checked against __says).
Recordings: ALL 14 lines recorded by Ben (AR/media/voice/show-*.mp3, included in this zip). Tested in the game: every line plays Ben's clip, no computer voice.
