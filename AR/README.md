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

**Play game** now opens the **sliding mosaic** for most paintings. **Napkin Please** keeps its own game, and Midnight Melodies, Rhythm of Life, Walk Through Fear, Almost Blindness, Curating Hope, The Bridge of Perception, Pedals of Freedom and The Dark Uncertainty have new games of their own (below). The painting is cut into a 3 × 3 mosaic with one piece missing and shuffled; slide the pieces back (tap a piece next to the gap, or the arrow buttons) and the painting closes up and comes alive. Each piece sings its note when it lands in place, the voice keeps count, and **Peek** (hold) shows the finished painting. It uses each painting's own photo in `targets/`, so new paintings get it automatically.

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

## See it my way (Walk Through Fear)

**Walk Through Fear** has **See it my way**. Words are hidden in Ben's painting, and the painting is seen through Ben's vision-condition filters (the same maths as the Blindness Spectrum Simulator): 1 cataracts, 2 macular degeneration, 3 glaucoma, 4 retinitis pigmentosa, Ben's own diagnosis. Find and tap each word (BREATHE, STEP · TRUST, LISTEN · COURAGE, FORWARD · WALK, THROUGH, FEAR). Where a filter has a centre (the macular smudge, the glaucoma and RP tunnels) it follows where the phone points, so players look around, or just beside a word, the way people with these conditions do. A hum grows near a hidden word and **Hint** says where to look. Between rounds the filter lifts to show the painting clearly.

- **lib/minigames/walk-through-fear-see.js**: the game; `ROUNDS` at the top sets each condition, its strength (`sev`) and its words. The original Walk Through Fear game is still there: add `&classic=1`.

## Sound safari (Almost Blindness)

**Almost Blindness** has **Sound safari**. Swirling fog fills the tunnel, and you find your way by ear. Six everyday sounds that help a blind person get around are hidden in it: birdsong, a bicycle bell, dripping water, wind chimes, a crosswalk signal and a guide dog's tags. Move a finger (or point the phone) through the fog: each sound gets louder, brighter and comes from its side as you get close; hold still on one to find it and the fog clears there. Then follow the door chime home to the light, and the fog lifts. **Hint** says which way to go; the panel says Listen / Getting warmer / Very close. Headphones make left and right clearer. All sounds are made live (no files).

- **lib/minigames/almost-blindness-safari.js**: the game, the fog and the sounds; the hidden sounds are `SOUNDS` at the top. Ben's voiced Almost Blindness game is still there: add `&classic=1`.

## Light memory (Curating Hope)

**Curating Hope** has **Light memory**, a song the community remembers together. The six people under the tree are the voices (low on the left, high on the right); each lights up and sings a note. Listen to a few notes of their song, then sing it back by tapping the people in order (anywhere across the screen works: left to right picks the singer). Each round adds a note (3 up to 8) and fills more of the tree with light. A wrong note isn't a loss: everyone sings it again, together. At the end the whole song is sung in harmony and the tree glows. **Again** replays the song. Voices are made live (no files).

- **lib/minigames/curating-hope-memory.js**: the game; `SONG` is the melody, `PEOPLE` the singers. The first Curating Hope game is still there: add `&classic=1`.

## Say it from the creek (The Bridge of Perception)

**The Bridge of Perception** has **Say it from the creek**, a puppet karaoke. Bill's face becomes a puppet: a prompt card asks something (first, Ben's: "What would you say if you fell through a hole other people can easily see and avoid?"; **Shuffle / Next** deals another). Press **Talk** and answer: his mouth moves with your voice as you speak. Then he says it back: his jaw drops with each word, his eyes blink and pop wide on loud bits, the creek ripples out from his chin and bubbles rise at the waterline. Pick his voice (Normal, Echo under the bridge, Gurgly, Deep, Squeaky); live captions show your words where the phone supports speech recognition. **Type** lets people write it instead, and he says it in a computer voice. Nothing is uploaded or saved: it all stays on the phone.

- **lib/minigames/bridge-karaoke.js**: the game; `PROMPTS` at the top are the prompt cards, and the face points (mouth, jaw, eyes) are at the top of the shader. Its first game is still there: add `&classic=1`.

## Ride the block (Pedals of Freedom)

**Pedals of Freedom** has **Ride the block**: be Bill's eyes. Bill (cut out of the painting, with the street behind him filled in) starts small far down the lane and pedals toward you, growing until he rides back into his own place in the painting. His legs pedal and the bike's headlight glows. Things appear in the road (a ball, a cat, a puddle, a trash can, a branch, a dog, a skateboard), each with its own sound from where it is; shout **LEFT** or **RIGHT** (the phone listens, where speech recognition is available), or press the buttons, or tap the left or right side of the screen, and he swerves. He rings his bell when something is close in his lane. Bumps slow him down; the finale is Bill's quote about knowing every bump in the sidewalk.

- **lib/minigames/pedals-ride.js**: the game; `THINGS` are the road obstacles, `RIDE` the seconds for the whole block
- **media/games/pedals/rider.png** (Bill cut out) and **road.jpg** (the painting with him removed and the street filled in). His first game is still there: add `&classic=1`.

## Night bus (The Dark Uncertainty)

**The Dark Uncertainty** has **Night bus**. The bus is moving: city shapes (buildings, trees, lamp posts and passing streetlights) slide past the windows in the painting's own reds, browns and creams, and the bus gently rumbles. Press **Play** and Bill lifts his trumpet to his lips and plays a tune (3 tunes: Night bus blues, Window lights, Long way home), with notes drifting from the bell. **Your solo** raises the trumpet and lets you play it: tap across the screen, low on the left, high on the right. **Done** ends with Bill's words. The trumpet is made live (brass synthesis with a little bus echo); recorded trumpet notes can replace it later.

- **lib/minigames/dark-uncertainty-play.js**: the game; `TUNES` are the melodies, the window shapes and city are in the shader
- **media/games/dark-uncertainty/trumpet.png** (the trumpet and his hands, cut out) and **body.jpg** (the painting with them lifted out). His first game is still there: add `&classic=1`.

## Robot dance party (Fearless Request)

**Fearless Request** has **Robot dance party**. The big robot is a puppet: his head bobs, both arms move, the lantern swings from his hand, his knees bend and his feet step, all to a funk band made live in the browser. Move your phone and he dances: the more you move, the more he grooves, and the more the band plays (bass, stabs and a synth line join in as you get going). Every two bars he calls and shows a move, a beat and a half early so you can get ready: **Lean left**, **Lean right** (tilt the phone), **Bounce** (pump it up and down), **Wiggle** (shake it) and **Freeze** (hold still: the music cuts out with a record scratch and comes crashing back). 16 moves, then "Arms up!" and Wayne's words. The sky turns into a club: coloured beams sweep and pulse on the beat, follow the way you tilt the phone, change colour every bar, and a mirror ball throws sparkles across the stars. Every move is spoken and has its own sound, so it plays by ear, and if the painting leaves the camera the party keeps going. No motion sensor? The **Lean / Bounce / Lean** buttons and tapping the screen work too. (On iPhone the motion permission is asked when you press Play game.)

- **lib/minigames/fearless-dance.js**: the game; `ROUTINE` is the order of the moves, `pose()` is the choreography, `funk()` is the band
- **media/games/fearless/**: **stage.jpg** (the painting with the robot taken out) and his parts, cut out: **body.png, head.png, armL.png, lant.png, armR.png**. His first game is still there: add `&classic=1`.

## Mini games (all 49 paintings)

Every Blind Canvas painting has a "Play the game" button. Each game is about a minute long, plays over the painting, and can be played by ear: instructions are spoken, sounds come from where things are, the phone buzzes, and big buttons or screen-thirds do everything. At the end the painting's own animation plays and the "story" button opens the artist's interview.

- **lib/minigames/index.js**: which game belongs to which painting
- **lib/minigames/kit.js**: shared look (Claude Design's black / white / red style), sounds, spoken intro, 3-2-1-GO countdown and end screen
- **lib/minigames/engines/**: 11 game types: catch, rhythm, runner, reveal, beam, balance, echo, connect, pop, stack, sort
- **lib/minigames/cfg/**: one entry per painting for each type: title, instructions, positions on the painting, words, colours, sounds and difficulty
- **napkins.js, almost-blindness.js, walk-through-fear.js, curating-hope.js**: the four hand-built games, now using Claude Design's art from **media/games/** (and Ben's recorded voice for Almost Blindness). Every picture has a drawn-in fallback, so a missing file never breaks a game.

Test links: `?art=<painting-id>` plays one painting. Add `&bot=1&debug=1` and a robot plays the game by itself.
