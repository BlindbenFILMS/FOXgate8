# Walk Through Fear (walk-through-fear): See it my way (POLISHED)
Files changed: AR/lib/minigames/walk-through-fear-see.js
New files: none (everything is drawn in code)
Export (unchanged): seeItMyWayGame          voice.js PREFIX (unchanged): 'walk-through-fear': 'see-',
index.js line (new description):
  'walk-through-fear': seeItMyWayGame,          // See it my way: find words through Ben's vision filters while his light grows (its first game: &classic=1)
Artist's clip at the finale: 3D/gallery/audio/art_63.mp3
voice-lines.js: the FULL list of this game's lines after the polish (replace the old see- block with this):
```
  "see-intro-1": "See it my way.",
  "see-intro-2": "Words are hidden in Ben's painting, Walk Through Fear.",
  "see-intro-3b": "You'll look for them through four kinds of low vision.",
  "see-intro-4": "Move your phone to look around, and tap each word you find.",
  "see-intro-5": "A soft hum means you're close.",
  "see-k1": "Round 1 of 4.",
  "see-k2": "Round 2 of 4.",
  "see-k3": "Round 3 of 4.",
  "see-k4": "Round 4 of 4.",
  "see-how-ben": "How Ben sees.",
  "see-cond-rp": "Retinitis pigmentosa. Ben's own diagnosis: a narrowing tunnel of sight, and night blindness. Sweep slowly, like a cane.",
  "see-cond-cat": "Cataracts. The eye's lens clouds over: a milky haze, faded colour and contrast. Look for shapes, not details.",
  "see-cond-mac": "Macular degeneration. The centre goes dark and blurry, right where you look. The edges stay. Look just beside a word to see it.",
  "see-cond-gla": "Glaucoma. The edges fade into a foggy frame that closes in. Move your phone to look around.",
  "see-find-2": "Find 2 hidden words.",
  "see-find-3": "Find 3 hidden words.",
  "see-word-breathe": "Breathe.",
  "see-word-step": "Step.",
  "see-word-trust": "Trust.",
  "see-word-listen": "Listen.",
  "see-word-courage": "Courage.",
  "see-word-forward": "Forward.",
  "see-word-walk": "Walk.",
  "see-word-through": "Through.",
  "see-word-fear": "Fear.",
  "see-ben-every-day": "That's how Ben sees. Every day.",
  "see-cleared": "Round cleared.",
  "see-no-filter": "Here it is without the filter.",
  "see-hint-right-there": "It's right around where you're looking. Tap it.",
  "see-close": "Close.",
  "see-look-up": "Look up.",
  "see-look-down": "Look down.",
  "see-look-left": "Look left.",
  "see-look-right": "Look right.",
  "see-look-up-left": "Look up and left.",
  "see-look-up-right": "Look up and right.",
  "see-look-down-left": "Look down and left.",
  "see-look-down-right": "Look down and right.",
  "see-all-words": "Walk through fear. You found every word. Now see it clearly.",
  "see-end": "You walked through fear.",
```
Lines that are new (Ben needs to record these): see-ben-every-day, see-cleared, see-no-filter
Old lines no longer used (the game already said these as short sentences before the polish): see-intro-3, see-round-1, see-round-2, see-round-3, see-round-4
What changed:
- Spoken round ends: after Ben's RP round "That's how Ben sees. Every day. Here it is without the filter."; after the others "Round cleared. Here it is without the filter." (they were only shown before).
- Lines wait their turn (a small queue that waits for say.busy(), at most 6 s each), and a round never starts talking until the last line has finished (at most 8 s). Fixes "Fear." being cut off by the ending line.
- Word placement: each word is measured and placed fully on the painting (5% from the edges), below the round banner (v ≥ 0.24) and above the buttons (v ≤ 0.84), never overlapping another word. Found-word pops stay on the painting too.
- Retinitis pigmentosa: smaller tunnel (sev 0.36 → 0.47, narrow 0.2 → 0.16), closing to a small circle by the last word.
- Music: an uneasy low drone (two close notes, trembling) with a thin whine melts away word by word into a warm C chord, with a bright top near the end. Ben's cane tap (on his right) and footsteps play hesitant and uneven at first, then steady. The music steps back while a line is spoken and hushes under Ben's clip.
- The light ahead of Ben (around u 0.6, v 0.44) grows with every word. It is added to the painting inside the filter shader, so the vision filters cover it too.
- The ending: WALK / THROUGH / FEAR fly from where they were found and stack in the middle like a poster, the filter lifts, the light blazes and a bright chord plays. The finale says "You walked through fear." (no more computer voice reading the quote), then Ben's own clip art_63.mp3. Pause/resume/stop and the story button handle the clip.
- Help: if no word is found for 15 quiet seconds, the hint plays on its own (not for the bot). Taps just next to a word count (wider hit area). The round banner closes as soon as a round is cleared; the Hint button goes away at the end.
- Glaucoma: about 25% easier to read (sev 0.78 → 0.6: less blur, a wider clear middle).
- The painting moves: its own looping animation (work.overlay.anim, ../3D/gallery/anim/wix_walk_through_fear.mp4, already on the site) plays muted under the filters and the words, fading in from the still once it plays (the still stays if it can't). Words are now a clear layer over it. Pause/resume/stop handle the video.
- A found word is said straight away, and a line waiting its turn (like the round's intro) still plays after it (it used to be dropped).
- Intro unchanged (5 recorded sentences).
Tested: bot plays to the finale in about 30 s with no errors; every spoken sentence is in the list above, each heard in full; the artist's clip starts and plays through. Ben played it on his phone (test file) and moved on to the next game.
Recordings: Ben re-recorded ALL 40 lines (6 Nov). They are in this zip under AR/media/voice/ and replace the old files of the same names. Tested: every line plays from a recording, none from the computer voice.
Note for the main chat (shared kit, not changed here): on Ben's test page the painting sits between the top panels and the Hint button, so nothing covers it. Ben asked for that; on the live AR page the kit's banner and alerts can still sit over the painting. Changing that would be a kit.js layout change for every game.
