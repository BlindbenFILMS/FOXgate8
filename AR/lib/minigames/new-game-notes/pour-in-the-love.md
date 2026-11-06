# Pour In The Love (pour-in-the-love): Pour in the love
Files: AR/lib/minigames/pour-love.js, AR/lib/minigames/pour-things.js
Export: pourLoveGame
index.js line: 'pour-in-the-love': pourLoveGame, // Pour in the love: tap on four as each drop of love lands in the heart; 8 rings fill with colour (Steven McCoy)
voice.js PREFIX line: 'pour-in-the-love': 'pour-',
Artist's clip at the finale: 3D/gallery/audio/art_5.mp3 (Steven's own voice, starts 3.3 s after the end panel, so the end line finishes first; all game music fades to silence while he speaks)
voice-lines.js entries (ready to paste, 21 lines):
```
  "pour-intro-1": "Pour in the love.",
  "pour-intro-2": "Steven had to pull all the ugly out of his thoughts, and pour in the love.",
  "pour-intro-3": "Drops of love fall down into the heart.",
  "pour-intro-4": "Each drop lights three dots on the way down.",
  "pour-intro-5": "One, two, three.",
  "pour-intro-6": "Tap on four, just as it lands.",
  "pour-intro-7": "Catch 8 drops to fill the heart.",
  "pour-intro-8": "Here comes the first one.",
  "pour-thought-1": "I am enough.",
  "pour-thought-2": "I am loved.",
  "pour-thought-3": "I let the ugly go.",
  "pour-thought-4": "I am growing.",
  "pour-thought-5": "I am at peace.",
  "pour-thought-6": "I am grateful.",
  "pour-thought-7": "I am free.",
  "pour-thought-8": "I just am.",
  "pour-faster": "A little faster now.",
  "pour-miss-1": "Tap just as it lands in the heart.",
  "pour-miss-2": "Count with the dots.",
  "pour-miss-3": "One, two, three, tap!",
  "pour-end": "Your heart is full of love.",
```

How to play (one sentence, as spoken): Each drop lights three dots on the way down, one, two, three: tap on four, just as it lands in the heart.
What it does: A slow soul groove plays (kick, finger snaps, electric-piano chords). Drops of love form at the tip of the painting's long molten drip
and fall down its own line of little dots into the black heart: they light the 3 dots on beats 1, 2 and 3 (rising notes), and land on 4.
TAP the big POUR button (or anywhere on the screen) as it lands (window: 0.26 s either side). A caught drop bursts into a rainbow splash,
a ring ripples out, and colour comes back to one more ring of the heart, from the middle outward (the rest of the painting is grey and dim
until then); a kind thought replaces an ugly one ("I am enough."). A missed drop cools to grey and sinks. Each ring adds to the band (bass,
then shaker, then a melody), and after 4 rings the groove gets a little faster. 8 rings: the whole painting glows, the black heart fills
with warm light that beats with the music, and Steven speaks. About 1 minute. All drawn in code (pour-things.js), no image files.
Tested: the bot plays to the finale in about 27 s (bot intro is shortened), no console errors from this game; Steven's clip starts at the
finale (currentTime moving); phone-sized screenshots (400 x 860) look right; every sentence it says is in steven-mccoy-VOICE-SCRIPT.txt.
Recordings: ALL recorded by Ben and included in this zip (AR/media/voice/, copy them into the site's AR/media/voice/). Checked: every line the game says plays its own clip (none fall back to the computer voice).
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- index.js: add the import  import { pourLoveGame } from './pour-love.js';  and the SPECIAL line above.
- voice.js, PREFIX: add the line above.
- voice-lines.js: add the entries above.
