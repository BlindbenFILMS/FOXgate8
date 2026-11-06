# Reaching Past Blindness (reaching-past-blindness): Reach Out
Files: AR/lib/minigames/reach-out.js, AR/lib/minigames/reach-things.js
Export: reachOutGame
index.js line: 'reaching-past-blindness': reachOutGame, // Reach Out: three soft beats then the big drum; tap STRUM on the drum to send Rusty's music out to 8 listeners in the dark (Rusty Perez)
  (and at the top of index.js: import { reachOutGame } from './reach-out.js';)
voice.js PREFIX line: 'reaching-past-blindness': 'strum-',
Artist's clip at the finale: 3D/gallery/audio/art_20.mp3 (Rusty reads his quote; the computer voice never reads it)
Voice prefix: strum-  (20 lines, ALL recorded by Ben, in this zip)
voice-lines.js entries (ready to paste):
```
  "strum-intro-1": "Reach Out.",
  "strum-intro-2": "Rusty’s music can reach people in the dark.",
  "strum-intro-3": "Listen for three soft beats, then the big drum.",
  "strum-intro-4": "Tap strum on the big drum.",
  "strum-intro-5": "Two good strums reach each listener.",
  "strum-reached-1": "1 reached.",
  "strum-reached-2": "2 reached.",
  "strum-reached-3": "3 reached.",
  "strum-reached-4": "4 reached.",
  "strum-reached-5": "5 reached.",
  "strum-reached-6": "6 reached.",
  "strum-reached-7": "7 reached.",
  "strum-everyone": "Everyone is listening!",
  "strum-early": "A little early.",
  "strum-late": "A little late.",
  "strum-wait": "Wait for the big drum.",
  "strum-hint": "Listen for the big drum, then strum.",
  "strum-help-1": "Three soft beats, then the big drum.",
  "strum-help-2": "Strum on the big drum.",
  "strum-end": "You reached everyone!",
```

How to play (one sentence, as spoken): Listen for three soft beats, then the big drum. Tap strum on the big drum. Two good strums reach each listener.
What it does: The painting starts dark, with only Rusty and his guitar glowing. Eight drawn listeners wait round the edge (a kid, a woman, a man in a
cap, a woman with a white cane, an older man with a walking stick, someone in a wheelchair, a teen with headphones, a man with his guide
dog), each outlined in their own colour with a hand cupped to the ear. An acoustic groove plays (92 bpm, G-D-Em-C). Each bar the waiting
listener hums three soft notes from their side (louder as the ray gets closer), then THE BIG DRUM on beat 4. Tap STRUM (or anywhere) on
the drum: a real plucked-string guitar chord rings (Karplus-Strong, made in Web Audio) and a ray of colour shoots out from the sound hole
toward that listener. Two good strums reach them: they light up in their colour, arms in the air, cheer and clap from their side, their
corner of the painting lights up, and a new part joins the band (bass, claps, piano, picking guitar, strings, whistle, drums, everyone
sings). After all 8: three bars of the full band with Rusty strumming, every ray shimmering, then the finale and Rusty's clip.
Early/late is spoken; the timing window widens after misses; a Help button explains it again.
Tested: bot plays to the finale in about 70 s (16 strums, 8 listeners), no errors; Rusty's clip starts at the finale; every spoken sentence is in the voice script. Ben played the preview.
Recordings: Ben has recorded ALL 20 lines: AR/media/voice/strum-*.mp3, included in this zip. Tested: every spoken line plays his recording (no computer voice).
Changes needed in shared files: only the three above (index.js import + SPECIAL line, voice.js PREFIX, voice-lines.js entries). No shared file was edited.
