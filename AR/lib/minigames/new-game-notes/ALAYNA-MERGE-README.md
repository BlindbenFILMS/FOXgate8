# Alayna Lopez: three new Blind Canvas games, ready to merge
Built in one chat, one game at a time, each played by Ben in the preview and tested with the bot. Nothing shared was edited.

| Painting (id) | Game | Main action | Files |
|---|---|---|---|
| Music On The Streets (music-on-the-streets) | Cane Beat | tap on the beat | cane-beat.js, cane-things.js |
| Roller Coaster Of Emotions (roller-coaster-of-emotions) | Pick Your Track | steer left or right | coaster-track.js, coaster-things.js |
| I Am Blind, Like My Hair Is Brown (i-am-blind-like-my-hair-is-brown) | Still Me | find and put back (tap or drag) | hair-still.js, hair-things.js |

All three also use alayna-hud.js (new, shared by just these three): a slim score panel pinned to the very top and slim messages over it,
so nothing covers the painting. Check at merge that nothing in the AR viewer or the 3D gallery sits in that top strip.

## Copy in
- AR/lib/minigames/: cane-beat.js, cane-things.js, coaster-track.js, coaster-things.js, hair-still.js, hair-things.js, alayna-hud.js
- AR/media/voice/: 99 mp3s (cane-*, track-*, still-*), Ben's narration
- Artist clips already in the site: 3D/gallery/audio/art_13.mp3, art_14.mp3, art_15.mp3

## Shared-file changes (do these at merge)
index.js imports:
  import { caneBeatGame } from './cane-beat.js';
  import { pickTrackGame } from './coaster-track.js';
  import { stillMeGame } from './hair-still.js';
index.js SPECIAL entries:
  'music-on-the-streets': caneBeatGame,
  'roller-coaster-of-emotions': pickTrackGame,
  'i-am-blind-like-my-hair-is-brown': stillMeGame,
voice.js PREFIX entries:
  'music-on-the-streets': 'cane-', 'roller-coaster-of-emotions': 'track-', 'i-am-blind-like-my-hair-is-brown': 'still-',
voice-lines.js: the 99 entries listed in each game's note (music-on-the-streets.md, roller-coaster-of-emotions.md,
i-am-blind-like-my-hair-is-brown.md).

Details for each game (what it does, how it was tested, its voice lines) are in its own note. The full recording script is
alayna-lopez-VOICE-SCRIPT.txt.
