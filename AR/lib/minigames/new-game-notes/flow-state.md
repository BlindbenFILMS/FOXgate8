# Flow State (flow-state): What should I paint? (POLISHED)
Files changed: AR/lib/minigames/flow-talk.js
New files: none (everything is drawn in code)
Export (unchanged): whatShouldIPaintGame          voice.js PREFIX (unchanged): 'flow-state': 'paint-',
index.js line (new description): 'flow-state': whatShouldIPaintGame, // What should I paint?: talk, type or pick an idea; Raquel says it back and paints it into her colour streams (Raquel Alim)
Artist's clip at the finale: 3D/gallery/audio/art_44.mp3
voice-lines.js: the FULL list of this game's lines (add as a new block; there was no paint- block before):
```
  "paint-intro-1": "What should I paint?",
  "paint-intro-2": "Raquel always has art flowing through her.",
  "paint-intro-3": "Wake her up, and tell her what to paint.",
  "paint-intro-4": "Talk, type, or pick an idea.",
  "paint-ask-1": "Raquel opens her eyes.",
  "paint-ask-2": "What should she paint?",
  "paint-ask-3": "What else should she paint?",
  "paint-ask-4": "One more idea.",
  "paint-paints": "She closes her eyes and paints it.",
  "paint-pick": "Pick an idea.",
  "paint-idea-ocean": "The ocean, from inside a wave.",
  "paint-idea-sunflowers": "A field of sunflowers at night.",
  "paint-idea-grandma": "My grandma dancing in the kitchen.",
  "paint-idea-city": "A city made of music.",
  "paint-idea-snow": "The first snow of winter.",
  "paint-idea-dragon": "A dragon made of flowers.",
  "paint-idea-rain": "The sound of rain.",
  "paint-idea-fox": "A fox in a golden forest.",
  "paint-idea-moon": "The moon having a picnic.",
  "paint-nomic-1": "The microphone isn’t on.",
  "paint-nomic-2": "Press Type or Pick.",
  "paint-again": "Try again.",
  "paint-hint": "Press Talk, Type or Pick.",
  "paint-end": "Three new paintings, flowing through her.",
```
Lines that are new or changed (Ben needs to record these): all 24 above.
Old lines no longer used: none (the game used the computer voice before). Raquel's own first-person lines ("What should I paint next?", "Mmm. I can see it already.") are gone; the narrator speaks instead.
What changed:
- Raquel reads her own quote at the end (art_44.mp3); music drops to a soft bed; pause/resume/story button handled.
- Three buttons: Talk / Type / Pick (no emoji icons). Pick offers 3 of 9 idea cards (read in Ben's voice).
- After an idea she says it back (your recorded voice with a soft echo, or a computer voice for typed words) and then paints it by herself (no more voice-style / Again / Paint it step).
- Painting: your words appear as glowing painted letters that swirl out of her and settle in the colour streams (3 places), and the streams take on the idea's colours (keyword colours for your own words).
- Typing fixed: "Say it" is a plain button + Enter (the form submit was blocked in some viewers).
- No microphone: says "The microphone isn't on. Press Type or Pick." instead of only a small alert.
- The big banner no longer covers her face (the score panel shows the round); buttons fit on one row.
- A dreamy band that adds a layer with each idea; spoken hint after 12 s (max 2). Her eyes are unchanged (Ben's choice).
Tested: bot (pick, type, pick) plays to the finale in about 30 s, no errors; typed path and no-mic message tested as a person; the artist's clip starts; every spoken sentence is in the list above (checked against __says).
Recordings: ALL 24 lines recorded by Ben (AR/media/voice/paint-*.mp3, included in this zip). Tested in the game: every line plays Ben's clip, no computer voice.
