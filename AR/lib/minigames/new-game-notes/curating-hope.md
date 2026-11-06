# Curating Hope (curating-hope): Light memory (POLISHED)
Files changed: AR/lib/minigames/curating-hope-memory.js
New files: AR/media/games/memory/singer-1.png, singer-2.png, singer-3.png, singer-1-glow.png, singer-2-glow.png, singer-3-glow.png
Export (unchanged): lightMemoryGame          voice.js PREFIX (unchanged): 'curating-hope': 'memory-',
index.js line (new description):
  'curating-hope': lightMemoryGame,             // Light memory: sing the community's song back; the tree fills with light (its first game: &classic=1)
Artist's clip at the finale: 3D/gallery/audio/art_2.mp3
voice-lines.js: the FULL list of this game's lines after the polish (replace the old memory- block with this):
```
  "memory-intro-1": "Light memory.",
  "memory-intro-2": "The people under the tree sing a song together, a few notes at a time.",
  "memory-intro-3": "Listen, then sing it back by tapping them in the same order.",
  "memory-intro-4": "Low notes are on the left, high notes on the right, and you can tap anywhere across the screen.",
  "memory-round-1": "Round 1.",
  "memory-round-2": "Round 2.",
  "memory-round-3": "Round 3.",
  "memory-round-4": "Round 4.",
  "memory-round-5": "Round 5.",
  "memory-last-round": "The last round. The whole song.",
  "memory-listen": "Listen.",
  "memory-your-turn": "Your turn.",
  "memory-remembered": "Remembered!",
  "memory-again": "Let's sing it again, together.",
  "memory-whole-song": "You remembered the whole song. Now everyone sings it, together.",
  "memory-end": "A memory we share.",
```
Lines that are new (Ben needs to record these): memory-round-1, memory-round-2, memory-round-3, memory-round-4, memory-round-5, memory-last-round, memory-remembered
Old lines no longer used: memory-intro-5
What changed:
- The three singers are cut out of the painting (traced by hand; media/games/memory/). When one sings, that person glows in their colour, grows a little from their feet and brightens; they breathe softly between notes.
- The tree fills with light: a shader brightens the painting's own colours from the trunk outward, one step per round, with a flash on each remembered round; painted paper leaves fly up from the singers into the swirling canopy. At the chorus the whole tree blazes and everyone under it lights up.
- A soft warm band in C grows a layer each round (hum, pad, wind chimes, heartbeat, shimmer, warmth); it ducks while the singers sing and the chimes wait for the song.
- Spoken progress: "Round N. Listen." before each song (waits for the line to finish), "Remembered!" after each round; after 9 quiet seconds the song is sung again.
- Intro shortened to 4 sentences (all already recorded).
- Finale: says "A memory we share." (no more computer voice reading the quote), then Ben's own clip art_2.mp3 with the band soft under him; pause/resume/stop and the story button handle the clip.
- The bot gets one note wrong in round 2 on purpose, to test "sing it again".
Tested: bot plays to the finale in about 70 s, no errors; the artist's clip starts and plays through; pause/resume work in play and during the clip; every spoken sentence is in the list above. Ben played it on his phone (test link) and approved it.
Recordings: Ben re-recorded ALL 16 lines (6 Nov). They are in this zip under AR/media/voice/ and replace the old files of the same names. Tested: every line plays from a recording, none from the computer voice.
