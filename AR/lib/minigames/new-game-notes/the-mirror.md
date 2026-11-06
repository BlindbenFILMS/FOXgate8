# The Mirror (the-mirror): Pieces of me (POLISHED)
Files changed: AR/lib/minigames/mirror-light.js
New files: AR/lib/minigames/mirror-things.js (the eight pieces, drawn in code; no pictures needed); AR/lib/minigames/morten-banner.js (shared by all three Morten Bonde games: keeps the top banner above the painting; identical in each zip)
Export (unchanged): piecesOfMeGame          voice.js PREFIX (unchanged): 'the-mirror': 'mirror-',
index.js line (description updated, optional): 'the-mirror': piecesOfMeGame, // Pieces of me: a flashlight game; find eight icons of who you are on shards of mirror as your sight changes, and they heal the mirror; Morten's own voice at the end (its first game: &classic=1)
Artist's clip at the finale: 3D/gallery/audio/art_61.mp3
voice-lines.js: the FULL list of this game's lines after the polish (ready to paste; replace the old mirror- block with it):
```
  "mirror-intro-1": "Pieces of me.",
  "mirror-intro-3": "Your phone is a flashlight: move it across the painting, or drag a finger, and find eight pieces of the mirror.",
  "mirror-intro-4": "Each one holds a piece of who you are.",
  "mirror-intro-5": "Hold the light on a glint of glass to find it.",
  "mirror-lights-out": "Lights out. Move your phone to shine the light.",
  "mirror-found-curious": "You found a piece of yourself: curious.",
  "mirror-found-kind": "You found a piece of yourself: kind.",
  "mirror-found-creative": "You found a piece of yourself: creative.",
  "mirror-found-brave": "You found a piece of yourself: brave.",
  "mirror-found-funny": "You found a piece of yourself: funny.",
  "mirror-found-patient": "You found a piece of yourself: patient.",
  "mirror-found-loved": "You found a piece of yourself: loved.",
  "mirror-found-still-me": "You found a piece of yourself: still me.",
  "mirror-sight-1": "Your light is getting smaller. Listen closer.",
  "mirror-sight-2": "Things are getting blurry. Your ears are getting sharper.",
  "mirror-sight-3": "Your light is fading. Trust the sound.",
  "mirror-7-to-go": "7 to go.",
  "mirror-6-to-go": "6 to go.",
  "mirror-5-to-go": "5 to go.",
  "mirror-4-to-go": "4 to go.",
  "mirror-3-to-go": "3 to go.",
  "mirror-2-to-go": "2 to go.",
  "mirror-1-to-go": "1 to go.",
  "mirror-word-still-me": "Still me.",
  "mirror-every-piece": "That's every piece. Now shine your light on the mirror.",
  "mirror-very-close": "Very close.",
  "mirror-getting-warm": "Getting warm.",
  "mirror-move-up": "Move up.",
  "mirror-move-down": "Move down.",
  "mirror-move-left": "Move left.",
  "mirror-move-right": "Move right.",
  "mirror-move-up-left": "Move up and left.",
  "mirror-move-up-right": "Move up and right.",
  "mirror-move-down-left": "Move down and left.",
  "mirror-move-down-right": "Move down and right.",
  "mirror-move-little": "Move just a little.",
  "mirror-on-it": "You're right on it. Hold still.",
  "mirror-still-you": "The man in the mirror is still you. Every piece.",
  "mirror-end": "Still you.",
```
Lines that are new or changed (Ben needs to record these): none. Every line is one Ben already has, word for word.
Old lines no longer used: mirror-intro-2, mirror-intro-6, mirror-intro-7, mirror-word-curious, mirror-word-kind, mirror-word-creative, mirror-word-brave, mirror-word-funny, mirror-word-patient, mirror-word-loved. Their recordings can stay; nothing plays them.
What changed:
- The pieces are icons of who you are, each on a jagged shard of mirror glass (mirror-things.js): Curious (magnifying glass), Kind (cupped hand with a heart), Creative (paintbrush and paint), Brave (shield with a star), Funny (laughing face), Patient (hourglass), Loved (two hearts), Still me (a face with glasses, like both men in the painting). They show only inside your light, with a small glint, and fade a little as your sight changes.
- "Still me" is always the last piece: it only appears once the other seven are found, and it rests in the middle of the mirror.
- Found pieces fly to the mirror and STAY there, in a ring round the crack, each with its word, so the mirror slowly carries all eight. The found word also shows in the on-screen banner (the old word drawn on the painting got cut off at the screen edge: fixed).
- The mirror heals at the end: shining on it, all eight pieces gather in a slowly turning ring round the crack, a burst of light, the desert lights up.
- Shorter intro (4 of the existing lines, about 15 s instead of 30 s).
- Morten reads his own quote at the finale (art_61.mp3) with the lofi song softened; the computer voice no longer reads the quote. The clip pauses with the game and stops if the story video is opened.
- Unchanged: the flashlight, the sight changing (smaller, blurrier, paler light, flickers), the glass shimmer that leads you, the Hint button, and the lofi song that grows with every piece.
- The top banner stays OFF the painting: the kit's top panel and intro banner sit right above the painting, exactly its width, every frame (morten-banner.js); the messages that used to drop over the painting (alert blocks and pop-ups) show in that banner instead. Long intro titles shrink or wrap to fit.
Tested: bot plays to the finale with "Still me" last; a finger-drag run finds all eight and the mirror; the artist's clip plays; no errors; 400x860 phone screen.
Recordings: none needed.
