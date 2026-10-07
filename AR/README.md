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

## Mini games (all 49 paintings)

Every Blind Canvas painting has a "Play the game" button. Each game is about a minute long, plays over the painting, and can be played by ear: instructions are spoken, sounds come from where things are, the phone buzzes, and big buttons or screen-thirds do everything. At the end the painting's own animation plays and the "story" button opens the artist's interview.

- **lib/minigames/index.js**: which game belongs to which painting
- **lib/minigames/kit.js**: shared look (Claude Design's black / white / red style), sounds, spoken intro, 3-2-1-GO countdown and end screen
- **lib/minigames/engines/**: 11 game types: catch, rhythm, runner, reveal, beam, balance, echo, connect, pop, stack, sort
- **lib/minigames/cfg/**: one entry per painting for each type: title, instructions, positions on the painting, words, colours, sounds and difficulty
- **napkins.js, almost-blindness.js, walk-through-fear.js, curating-hope.js**: the four hand-built games, now using Claude Design's art from **media/games/** (and Ben's recorded voice for Almost Blindness). Every picture has a drawn-in fallback, so a missing file never breaks a game.

Test links: `?art=<painting-id>` plays one painting. Add `&bot=1&debug=1` and a robot plays the game by itself.
