# A New Day (a-new-day): Light the glass (POLISHED)
Files changed: AR/lib/minigames/newday-glass.js
New files: none (everything is drawn in code)
Export (unchanged): lightTheGlassGame          voice.js PREFIX (unchanged): 'a-new-day': 'glass-',
index.js line (new description): 'a-new-day': lightTheGlassGame, // Light the glass: rub the 8 dark stained-glass panes to light them, following their hum; a down moment, then sunrise (Raquel Alim)
Artist's clip at the finale: 3D/gallery/audio/art_12.mp3
voice-lines.js: the FULL list of this game's lines (add as a new block; there was no glass- block before):
```
  "glass-intro-1": "Light the glass.",
  "glass-intro-2": "It’s night.",
  "glass-intro-3": "Rub the dark glass to light it.",
  "glass-intro-4": "Follow the hum.",
  "glass-pane-arch": "The orange arch.",
  "glass-pane-sunset": "The sunset.",
  "glass-pane-blue": "The blue arches.",
  "glass-pane-white": "The white arch.",
  "glass-pane-sea": "The sea.",
  "glass-pane-round": "The round window.",
  "glass-pane-tiles": "The blue tiles.",
  "glass-pane-floating": "The floating glass.",
  "glass-num-1": "1 of 8.",
  "glass-num-2": "2 of 8.",
  "glass-num-3": "3 of 8.",
  "glass-num-4": "4 of 8.",
  "glass-num-5": "5 of 8.",
  "glass-num-6": "6 of 8.",
  "glass-num-7": "7 of 8.",
  "glass-num-8": "8 of 8.",
  "glass-down-1": "A down moment.",
  "glass-down-2": "That’s okay.",
  "glass-down-3": "Light it again.",
  "glass-hint": "Rub where it hums.",
  "glass-morning": "Good morning.",
  "glass-end": "A new day.",
```
Lines that are new or changed (Ben needs to record these): all 26 above.
Old lines no longer used: none (the game used the computer voice before).
What changed:
- Raquel reads her own quote at the end (art_12.mp3); music drops to a soft bed; pause/resume/story button handled.
- The window is 8 panes (ellipses on the painting; a pane's edge follows the glass pieces). Rub a pane for 1.5 s and it lights fully with a glass chord, its name and the count.
- Each dark pane hums from its side (two soft detuned tones), louder near your finger, and breathes a faint blue. New "Listen" button: each dark pane hums in turn. Spoken hint after 9 s of nothing lit (max 3).
- The light comes on a glass piece at a time (cells in the shader); the dark leading stays dark; a glass crackle under your finger.
- Down moment after 4 panes: a cloud un-lights the two highest lit panes.
- Sunrise after all 8: the day floods in, the sun rises over the sea, birds wake.
- Removed the confusing "Point to light" button; intro cut from 5 long sentences to 4 short ones. Timers pause with the game.
Tested: bot plays to the finale in about 30 s, no errors from the game; the artist's clip starts (currentTime moving); every spoken sentence is in the list above (checked against __says).
Recordings: ALL 26 lines recorded by Ben (AR/media/voice/glass-*.mp3, included in this zip). Tested in the game: every line plays Ben's clip, no computer voice.
