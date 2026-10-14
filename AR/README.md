# Blind Canvas AR

No-download augmented reality for artwork. Visitors scan a QR code, the page opens in their phone browser, they point the camera at a painting, and it comes alive and describes itself aloud.

- **index.html**: the AR viewer
  - one artwork: `.../AR/?art=<id>`
  - a whole room (one QR code, many artworks): `.../AR/?show=<id>`
  - no link name: a menu of every room and artwork
- **add.html**: turns a photo of an artwork into a tracking file, tap-to-hear spots, and a QR code
- **exhibition.html**: groups artworks already on the site into one room with one QR code
- **artworks.js**: the list of artworks (ARTWORKS) and rooms (EXHIBITIONS)
- **qr.html**: printable QR cards, one per artwork, to put beside each painting
- **targets/**: tracking files (`.mind`) and photos
- **media/clips/**: the artists' interview clips (the same moments as the online gallery's audio, cut from the full interviews)
- **lib/**: MindAR (image tracking) and Three.js (3D), stored here so the site never depends on another server

Works in Safari on iPhone and Chrome on Android. Phones only allow camera access over https, which GitHub Pages provides.

Rooms: aim for 10–20 artworks each. Each one adds about 0.7 MB for visitors to download.
A room in artworks.js doesn't need its own tracking file: leave out the `target` line and the phone joins each artwork's own file. Test rooms: `?show=blind-canvas-10`, `?show=blind-canvas-25`, `?show=blind-canvas-all`.

Add `&stats=1` to any link to see download size, camera start time, frame rate, and how long each painting took to recognize.

Test it: open `targets/fox-at-dusk.jpg` and `targets/harbor-light.jpg` on a computer screen, open `.../AR/?show=test-room` on a phone, and point the phone at one painting, then the other.

The Blind Canvas artworks use the `story` layout: the animated art (from `../3D/gallery/anim/`) plays over the painting, a black title banner (TITLE / ARTIST in white capitals) sits under it, and the artist's clip plays with sound under that. The camera view has just one row of buttons, at the very top: **Play game** (Stop / Play again during a game), **Artist** (opens that artist's page on blindcanvasproject.com; the list is `ARTIST_PAGES` in index.html, or give an artwork its own `link` in artworks.js) and **Sound on / Muted** (one switch for every sound: the clip, narration, speech and the games). Everything under the row stays free of buttons. Tap the clip to pause it. Screen-reader users also get a hidden "Describe the painting" button.

## Sliding mosaic (the Play game button)

**Play game** now opens the **sliding mosaic** for every painting except **Napkin Please** and **Walk Through Fear**, which keep their own games. The painting is cut into a 3 × 3 mosaic with one piece missing and shuffled; slide the pieces back (tap a piece next to the gap, or the arrow buttons) and the painting closes up and comes alive. Each piece sings its note when it lands in place, the voice keeps count, and **Peek** (hold) shows the finished painting. It uses each painting's own photo in `targets/`, so new paintings get it automatically.

- **lib/minigames/engines/slide.js**: the sliding mosaic
- **lib/minigames/index.js**: `KEEP` lists the paintings that keep their own game; add an id there to give a painting its original game back
- Every original game below is still saved, unchanged. To play one, add `&classic=1` to the link (for example `?art=hope-is-not-lost&classic=1`).

## Night light (Midnight Melodies)

**Midnight Melodies** has a game of its own: **Night light**, a flashlight game with a lofi beat. The room goes dark and the phone becomes a flashlight: wherever the middle of the screen points on the real painting, a warm beam lights it (or drag a finger). Seven things are hidden: a pine tree, a comet, a paper sailboat, a sleepy star, the trumpet's valves, Wayne asleep and his pillow. Hold the light on one to find it; it plays a trumpet note, stays softly lit, and the lofi song grows a layer (vinyl and chords, then hats, the beat, bass and a sleepy trumpet). Then shine on the trumpet lamp: the room fills with light and a lullaby plays. By ear: a twinkle comes from the side of the nearest hidden thing and speeds up when close, and **Hint** says which way to move. The music is made live in the browser (no audio files).

- **lib/minigames/midnight-melodies.js**: the game and its music; the hidden spots are `SPOTS` at the top (u, v from the top-left)
- **lib/minigames/index.js**: `SPECIAL` lists paintings with a new game of their own. `&mosaic=1` opens the sliding mosaic instead, and `&classic=1` the original game.

## Glow it bright (Rhythm of Life)

**Rhythm of Life** has **Glow it bright**, a singing game. The painting dims; sing or hum and a glowing orb rises and falls with your pitch (low notes by the drums, high notes up by the light bulb and planets), brighter the louder you sing. Hold it on each glowing ring to light 6 things (Will, the bass drum, the light bulb, the little drummer, the old radio, the planets); each one brings back part of Will's drum groove. Clap (or press Clap) for a flash of light. While you hum for Will, the game learns your comfortable note, so any voice works. It asks for the microphone when the game starts; with no microphone, touch the screen and slide up and down instead.

Music: Will's drum groove builds as you light things, with soft chords (Cm9 · Ebmaj9) that step aside whenever someone sings, so the game never mistakes its own music for a voice. When everything is lit the microphone turns off and a synth melody joins the groove.

- **lib/minigames/rhythm-of-life.js**: the game, the drum groove and the pitch listener; the things to light are `TARGETS` at the top

## Mini games (all 49 paintings)

Every Blind Canvas painting has a "Play the game" button. Each game is about a minute long, plays over the painting, and can be played by ear: instructions are spoken, sounds come from where things are, the phone buzzes, and big buttons or screen-thirds do everything. At the end the painting's own animation plays and the "story" button opens the artist's interview.

- **lib/minigames/index.js**: which game belongs to which painting
- **lib/minigames/kit.js**: shared look (Claude Design's black / white / red style), sounds, spoken intro, 3-2-1-GO countdown and end screen
- **lib/minigames/engines/**: 11 game types: catch, rhythm, runner, reveal, beam, balance, echo, connect, pop, stack, sort
- **lib/minigames/cfg/**: one entry per painting for each type: title, instructions, positions on the painting, words, colours, sounds and difficulty
- **napkins.js, almost-blindness.js, walk-through-fear.js, curating-hope.js**: the four hand-built games, now using Claude Design's art from **media/games/** (and Ben's recorded voice for Almost Blindness). Every picture has a drawn-in fallback, so a missing file never breaks a game.

Test links: `?art=<painting-id>` plays one painting. Add `&bot=1&debug=1` and a robot plays the game by itself.
