# MERGE PACK: Deborah Tramentozzi's two New Artists Wing games
(made 3–4 Nov 2026 in one chat; for the MAIN chat to merge, test and get ready to publish)

Two finished games, both tested with the bot to the finale (no errors) and on phone-sized screens, both with
Ben's recorded narration (all lines recorded and already in AR/media/voice/) and Deborah's own voice at the end.

| Painting id | Game | File | Export | Voice prefix |
|---|---|---|---|---|
| `art-raised-me-up` | Raise them up | `raised-up.js` (+ `raised-things.js`) | `raiseThemUpGame` | `raise-` (43 lines) |
| `a-different-way-to-see` | Follow the lines | `diffway-lines.js` | `followTheLinesGame` | `diffway-` (30 lines) |

Full details of each game: `new-game-notes/art-raised-me-up.md` and `new-game-notes/a-different-way-to-see.md`.

---------------------------------------------------------------------------------------------------------------
## 1. Files (all already saved on Ben's computer; nothing shared was edited)

AR/lib/minigames/raised-up.js            the game: Raise them up
AR/lib/minigames/raised-things.js        the 8 drawn paintings in gold frames (canvas, no images)
AR/lib/minigames/diffway-lines.js        the game: Follow the lines
AR/media/games/raised/hall.jpg           Deborah's hall with the painting's own floating frames painted out
AR/media/voice/raise-*.mp3               43 narration clips (Ben)
AR/media/voice/diffway-*.mp3             30 narration clips (Ben)
AR/lib/minigames/new-game-notes/art-raised-me-up.md, a-different-way-to-see.md   merge notes
AR/lib/minigames/new-game-notes/VOICE_SCRIPT_DEBORAH_GAMES.txt                   the recording script

Uses (already in the site, unchanged): 3D/gallery/audio/wing_1_0.mp3 (Deborah, Art Raised Me Up) and
3D/gallery/audio/wing_1_2.mp3 (Deborah, A Different Way to See), and the paintings' own animations via K.finale.

---------------------------------------------------------------------------------------------------------------
## 2. index.js (AR/lib/minigames/index.js)

Add with the other imports:

```js
import { raiseThemUpGame } from './raised-up.js';
import { followTheLinesGame } from './diffway-lines.js';
```

Add in SPECIAL, in the NEW ARTISTS WING section:

```js
  'art-raised-me-up': raiseThemUpGame, // Raise them up: steer the beam of light, lift Deborah's 8 frames off the dark walls; each turns into a clear picture as it rises
  'a-different-way-to-see': followTheLinesGame, // Follow the lines: steer a spark along the collage's lines to each scene's sound; each scene fills with colour
```

---------------------------------------------------------------------------------------------------------------
## 3. voice.js (AR/lib/minigames/voice.js): add to PREFIX

```js
  'art-raised-me-up': 'raise-', 'a-different-way-to-see': 'diffway-',
```

---------------------------------------------------------------------------------------------------------------
## 4. voice-lines.js (AR/lib/minigames/voice-lines.js): add inside `export default { ... }`

All 73 mp3s are already in AR/media/voice/. (Checked: every sentence both games say matches one of these.)

```js
  "raise-intro-1": "Raise them up.",
  "raise-intro-2": "Eight paintings hang in the dark hall.",
  "raise-intro-3": "Each one makes its own sound, from its side, louder as your light gets close.",
  "raise-intro-4": "Drag your finger, or point your phone, to move the beam of light.",
  "raise-intro-5": "Hold the light on a painting, and it rises up into the light.",
  "raise-raised-sea": "You raised the sea.",
  "raise-raised-bird": "You raised the songbird.",
  "raise-raised-violin": "You raised the violin.",
  "raise-raised-flowers": "You raised the sunflowers.",
  "raise-raised-stars": "You raised the night sky.",
  "raise-raised-hands": "You raised the hands.",
  "raise-raised-dancer": "You raised the dancer.",
  "raise-raised-sunrise": "You raised the sunrise.",
  "raise-about-sea": "Waves roll in under a golden sky.",
  "raise-about-bird": "A robin sings on a branch.",
  "raise-about-violin": "A violin waits for its bow.",
  "raise-about-flowers": "Three sunflowers stand in a blue vase.",
  "raise-about-stars": "The moon and stars swirl over a sleeping village.",
  "raise-about-hands": "Two marble hands hold a little light.",
  "raise-about-dancer": "A dancer spins on her toes.",
  "raise-about-sunrise": "The sun rises between snowy mountains.",
  "raise-more-7": "7 more.",
  "raise-more-6": "6 more.",
  "raise-more-5": "5 more.",
  "raise-more-4": "4 more.",
  "raise-more-3": "3 more.",
  "raise-more-2": "2 more.",
  "raise-more-1": "1 more.",
  "raise-here-1": "It’s right here.",
  "raise-here-2": "Hold the light still.",
  "raise-dir-left": "A painting is to the left.",
  "raise-dir-right": "A painting is to the right.",
  "raise-dir-up": "A painting is up.",
  "raise-dir-down": "A painting is down.",
  "raise-dir-up-left": "A painting is up and to the left.",
  "raise-dir-up-right": "A painting is up and to the right.",
  "raise-dir-down-left": "A painting is down and to the left.",
  "raise-dir-down-right": "A painting is down and to the right.",
  "raise-dir-here": "A painting is here.",
  "raise-end-1": "Every painting is raised up.",
  "raise-end-2": "The whole hall is full of light.",
  "raise-end-3": "The hall is full of light.",
  "raise-end-4": "Here is Deborah, in her own words.",
  "diffway-intro-1": "Follow the lines.",
  "diffway-intro-2": "Deborah builds a picture one detail at a time.",
  "diffway-intro-3": "Your spark starts in the middle of the painting.",
  "diffway-intro-4": "Listen for a sound, and steer the spark toward it along the lines: up, down, left or right.",
  "diffway-intro-5": "Each place you reach fills with colour, and you hear what is there.",
  "diffway-tree": "A tall fir tree stands over golden hills.",
  "diffway-fruit": "Ripe fruit sits on a table.",
  "diffway-sketch": "Sketches of buildings are pinned to the wall.",
  "diffway-crowd": "A crowd bends over a sleeping man.",
  "diffway-travel": "Two travellers talk under the olive trees.",
  "diffway-books": "A man rests in a sunny room full of books.",
  "diffway-riders": "Riders cross a wide green field.",
  "diffway-fountain": "People meet beside a stone fountain.",
  "diffway-more-7": "7 more.",
  "diffway-more-6": "6 more.",
  "diffway-more-5": "5 more.",
  "diffway-more-4": "4 more.",
  "diffway-more-3": "3 more.",
  "diffway-more-2": "2 more.",
  "diffway-more-1": "1 more.",
  "diffway-no-line": "No line that way.",
  "diffway-wrong-1": "Not that way.",
  "diffway-wrong-2": "Listen.",
  "diffway-hint-up": "The sound is up.",
  "diffway-hint-down": "The sound is down.",
  "diffway-hint-left": "The sound is to the left.",
  "diffway-hint-right": "The sound is to the right.",
  "diffway-end-1": "Every detail is in place.",
  "diffway-end-2": "The picture is whole.",
  "diffway-end-3": "Here is Deborah, in her own words.",
```

Note: "7 more." … "1 more." exist under both prefixes; voice.js picks the clip with the game's own prefix.

---------------------------------------------------------------------------------------------------------------
## 5. How to test after merging

AR/harness.html?art=art-raised-me-up&w=800&h=800&z=2.2&bot=1        → finale in about 25 s
AR/harness.html?art=a-different-way-to-see&w=800&h=800&z=2.2&bot=1  → finale in about 37 s
Check: no console errors; Ben's voice plays (no computer voice except the quote text); at the end the music fades,
then "Here is Deborah, in her own words." then Deborah's own clip (it does not play in bot mode).

---------------------------------------------------------------------------------------------------------------
## 6. Good to know

- Both games keep the kit's look and don't edit kit.js. While a game is running it adds a small style tag
  (id `bc-endcard-margins`) that gives the end card roomier margins and lets it scroll on short screens; it is
  removed in stop().
- Deborah's clip: each game plays `work.artistAudio` if the viewer passes one, otherwise its 3D/gallery/audio clip.
  At the finale the music fades out as the card appears; her clip starts 5.6 s later, after the narrator.
- Raise them up: the base picture is media/games/raised/hall.jpg (falls back to the painting if it's missing).
  Frames you can raise always pulse gold; the light counts as "on" a frame anywhere along its edge, so the thin
  dim frame low on the left wall is easy to get. The newest raised painting floats big in the middle of the beam.
- Follow the lines: four arrow buttons (Left / Up / Down / Right) or tap the side you want; a wrong way bumps and
  comes back; a spoken hint after 7 s idle.
- Ben's 25 "breathe-" recordings (Live the Beauty, live-breathe.js, from another chat) are also already in
  AR/media/voice/; their voice-lines.js entries need that chat's notes (live-the-beauty.md).
- Playable previews (phone voice / Ben's voice, Deborah's clip): "Raise Them Up" and "Follow the Lines" artifacts.
