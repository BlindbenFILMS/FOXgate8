# Roots of Kinship (roots-of-kinship): Picking apples with vision loss (POLISHED)
Files changed: AR/lib/minigames/roots-apples.js, AR/lib/minigames/roots-things.js
New files (if any): roots-things.js (the drawn apples, blossom, wicker basket and warm glow); AR/media/voice/apples-intro-vision.mp3 (Ben's recordings)
Export (unchanged): familyApplesGame          voice.js PREFIX (unchanged): 'roots-of-kinship': 'apples-',
index.js line (the description changes):
  'roots-of-kinship': familyApplesGame,        // Picking apples with vision loss: apples grow on the tree, pick them through tunnel vision, then cataracts (April & Melissa)
Artist's clip at the finale: 3D/gallery/audio/art_6.mp3
voice-lines.js: the FULL list of this game's lines after the polish (ready to paste; replace the old block for this prefix with it):
  "apples-intro-vision": "Picking apples with vision loss.",
  "apples-intro-4": "Can you still find every apple? Tap each one to pick it.",
  "apples-intro-5": "A soft hum means you're close.",
  "apples-k1": "Round 1 of 2.",
  "apples-cond-rp": "Retinitis pigmentosa. Tunnel vision: only a small clear circle in the middle. Move your phone slowly to look around.",
  "apples-find-5": "Find 5 apples.",
  "apples-k2": "Round 2 of 2.",
  "apples-cond-cat": "Cataracts. A cloudy haze: everything is blurry and faded. Look for round shapes, not details.",
  "apples-found-grandma": "You found Grandma's apple!",
  "apples-found-grandpa": "You found Grandpa's apple!",
  "apples-found-mom": "You found Mom's apple!",
  "apples-found-dad": "You found Dad's apple!",
  "apples-found-auntie": "You found Auntie's apple!",
  "apples-found-uncle": "You found Uncle's apple!",
  "apples-found-big-sister": "You found Big sister's apple!",
  "apples-found-little-sister": "You found Little sister's apple!",
  "apples-found-cousin": "You found Cousin's apple!",
  "apples-found-baby": "You found Baby's apple!",
  "apples-hint-right-there": "It's right around where you're looking. Tap it.",
  "apples-close": "Close.",
  "apples-look-up": "Look up.",
  "apples-look-down": "Look down.",
  "apples-look-left": "Look left.",
  "apples-look-right": "Look right.",
  "apples-look-up-left": "Look up and left.",
  "apples-look-up-right": "Look up and right.",
  "apples-look-down-left": "Look down and left.",
  "apples-look-down-right": "Look down and right.",
  "apples-whole-family": "You found the whole family. Everyone, together.",
Lines that are new or changed (Ben needs to record these): apples-intro-vision
Old lines no longer used: apples-intro-1, apples-intro-2, apples-intro-3, apples-hang-grandma, apples-hang-grandpa, apples-hang-mom, apples-hang-dad, apples-hang-auntie, apples-hang-uncle, apples-hang-big-sister, apples-hang-little-sister, apples-hang-cousin, apples-hang-baby, apples-all-on-tree, apples-round-1, apples-round-2, apples-end
What changed:
- No more hanging apples: ten apples blossom and grow on the tree by themselves, and the game says "Picking apples with vision loss."
- Round 1, tunnel vision (retinitis pigmentosa): pick 5 apples. The apples grow back in new places. Round 2, cataracts: pick 5 more.
- New hand-drawn shiny apples, blossoms and a woven wicker basket the apples drop into; a plucked tune that grows as you pick.
- The finale: the whole family back on the tree, then April & Melissa in their own words (art_6.mp3).
- Big start/round banners and pop-ups now sit at the top, above the painting (see KIT-CHANGE-banners-north.md: a toolkit change for ALL games, for the main chat to apply).
Tested: bot plays to the finale in about 43 s, no errors; the artist's clip starts after the finale line; every sentence the game can say is in the list above (checked with voice.js's own sentence matching).
Recordings: all of the new lines recorded (included in the zip: yes, AR/media/voice/).
Also in this zip: KIT-CHANGE-banners-north.md, a toolkit change for ALL games (Ben asked for it). Please apply it to kit.js.
