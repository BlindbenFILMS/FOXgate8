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

## Open road safari (Pathways Unveiled)

**Pathways Unveiled** has **Open road safari**, a sound safari where you also tame the weather. Cars drive along the painting's roads (keeping to their lanes, with headlights and tail lights). Six city sounds are hidden in the neighbourhoods between the roads: birds in a garden, church bells, a fountain, a dog in a yard, a train crossing and an ice cream truck. Move your finger, or point your phone: each sound gets louder, brighter and comes from its side as you get close; hold still on it to find it. Then the weather rolls in over the map and muffles the city, and you tame it: **rain** (swipe back and forth like windshield wipers), **fog** (rub the screen clear), **snow** (hold your finger down like the sun to melt it) and a **thunderstorm** (tap right after each lightning flash). The **Tame** button works for all of them. In bad weather the cars slow down and switch their lights on; when it clears they speed up and honk, and after the rain comes a rainbow. When all six sounds are found, find the sisters' car (the purple one with the heart) by its happy horn and follow it.

- **lib/minigames/pathways-safari.js**: the game; `ROADS` are the roads traced through the painting, `SOUNDS` the hidden sounds, `WEATHER` the four kinds of weather. Add `&wx=rain` (or fog, snow, storm) to the link to start with that weather. Its first game is still there: add `&classic=1`.

## Family apples (Roots of Kinship)

**Roots of Kinship** has **Family apples**. First you grow the family: tap the tree to hang ten apples, one for each person (Grandma, Grandpa, Mom, Dad, Auntie, Uncle, Big sister, Little sister, Cousin, Baby). Each one blossoms, swells into an apple with its own note, and shows its name. Then a low-vision filter comes over the painting (not total blindness): can you still find them? Five apples through a cloudy haze (cataracts), then the last five through tunnel vision (retinitis pigmentosa), where the clear circle follows where the phone points. Tap each apple to pick it into the basket. At the end the filter lifts and the whole family is back on the tree. The apples are painted into the picture, so the filter covers them exactly like the painting. A soft hum grows as you get near an apple, and Hint says which way to look.

- **lib/minigames/roots-apples.js**: the game; `FAMILY` is who the apples are for, `ROUNDS` the two filters (the same maths as See it my way). Its first game is still there: add `&classic=1`.

## Fish for the sisters (Reflections of Sisterhood)

**Reflections of Sisterhood** has **Fish for the sisters**. April and Melissa sit on the dock in Guanaja with their feet in the water, and tropical fish swim through it: blue tangs, yellowtail snappers, parrotfish, queen angelfish, sergeant majors and little puffer fish, then a spotted eagle ray and a sea turtle. Point them out so the sisters can see them: tap a fish, or hold the middle of the screen on it (the **Point** button points out the one nearest to where you're looking). The sister on that side hears what it is ("April, look! A parrotfish!") and the fish swims over to tickle her toes with a splash and a giggle. Spot 12 fish. The water ripples all the time (the painting itself moves below the waterline, reflections and all), every tap and splash sends out rings, the sisters kick their feet now and then, and a lofi island band plays with the sound of waves. Every fish you point out adds a marimba note. By ear: each fish makes little bubbles from its side, louder as you get close.

- **lib/minigames/reflections-fish.js**: the game; `KINDS` are the fish (drawn in code), `band()` is the music and the waves. Its first game is still there: add `&classic=1`.

## Tides of decision (Decision Divide)

**Decision Divide** has **Tides of decision**. Will's painting splits down the middle: the cool, familiar blue world and the bright, fiery unknown, with the bridge between (his choice about cataract surgery). Here the two sides battle like weather: the warm side glows (embers rise, the light pulses) and the cool side sways and swirls (mist, wind, the picture itself drifts). Tilt the phone to give one side strength: it pushes across the middle and washes over the other in waves, repainting it in its own colours. A five-step timeline gives it a purpose: **1 Today** (fill the picture with the cool side), **2 A new hope** (fill it with the warm side), **3 The storm of questions** (gusts blow both ways: keep the line in the middle), **4 Riding the waves** (follow the moving marker), **5 Finding balance** (hold the middle, and the two worlds meet in the light, the sun and the bridge lamp shine). The target zone glows at the top and bottom of the picture; no step can trap you (after about 30 seconds it moves on). By ear: wind and a minor chord on the cool side, a crackling fire and a major chord on the warm side, mixed by how much of each you see; ticks from the line's side, and a higher chime while you're in the zone. No tilt? Hold the **Cool / Warm** buttons, or drag left and right.

- **lib/minigames/decision-tides.js**: the game; `CHAPTERS` is the timeline (what each step says and its target zone). Its first game is still there: add `&classic=1`.

## Blow the storm away (Harmonious Gathering)

**Harmonious Gathering** has **Blow the storm away**, a weather helper game. The town starts out just like the painting: golden sky, the river flowing and sparkling under the bridge, the band playing (guitar and walking bass) with notes floating up from the musicians. Then a storm rolls in: dark clouds drift into the sky from off the edges of the painting (in AR you see them coming from beside it), the light dims, rain falls, the wind picks up and the music fades. **Blow into the phone's microphone** to blow the clouds back out of the sky. But careful: when a cloud **flickers and crackles**, it's charged, so wait, because blowing on it sets off lightning; and **blowing too hard for too long** makes lightning too. Lightning flashes, thunder cracks, and the storm pushes back in. Three storms, each bigger; after each one the town cheers and the band adds an instrument (brushes, then a fiddle tune, then horns), and at the end the sun comes back for the gathering. No microphone? Hold the **Blow** button, or hold a finger on the screen.

- **lib/minigames/harmonious-weather.js**: the game; `WATER` and `SKY` are the river and sky outlines, `STORMS` the three storms, `townBand()` the music. Its first game is still there: add `&classic=1`.

## Calm walk (Inner Peace in Outer Chaos)

**Inner Peace in Outer Chaos** has **Calm walk**, red light, green light. It's played by **moving**: players are told at the start to step back from the painting, then walk toward it, but only on **GREEN LIGHT**. Walk on **RED LIGHT** and the storm around the head grows: the clouds swirl and wave harder, and the reds and oranges glow and pulse bigger and faster (the face itself always stays calm). At the same time, tap **Breathe** in rhythm, when the breathing ring around the face is at its biggest: calm breaths settle the storm, missed ones let it grow. You win when you're close (the painting fills the screen) **and** you've taken 24 calm breaths, however fast you walked. Closeness is measured from how big the painting is on screen. The whole screen has a green or red border and a light at the bottom, and "Green light!" / "Red light!" are spoken with their own sounds. Can't walk up to it? Hold the **Walk** button on green light (it counts the same; if you start already very close, the game tells you to use it).

- **lib/minigames/inner-peace-walk.js**: the game; `BREATHS` (how many), `BEAT` (seconds per breath), `START_MAX` / `GOAL` (how much of the screen the painting fills at the start and the finish). Its first game is still there: add `&classic=1`.

## Ben's voice in the games

The games now speak in Ben's recorded voice. Every game talks through `G.say(text)`; **lib/minigames/voice.js** splits the text into sentences and plays the matching recordings from **media/voice/** in order (for example "You found a comet." + "Here comes the beat." + "4 to go."). Anything that hasn't been recorded (the artists' quotes, or newer games still waiting for their batch) is read by the computer voice, as before. Each painting's clips load as soon as its game starts.

- **lib/minigames/voice-lines.js**: every recording and the words it says. To add new recordings: put the mp3s in **media/voice/** and add a line for each here.
- Batch 1 is in (210 lines: the sliding mosaic, Night light, Glow it bright, See it my way, Sound safari, Light memory, Say it from the creek, Ride the block, Night bus, Robot dance party). Recordings were trimmed and levelled to the same loudness and saved as small mp3s.
- Batch 2 is in (143 lines: Open road safari, Family apples, Fish for the sisters, Tides of decision, Blow the storm away, Calm walk).
- Batch 3 is in (130 lines: Pieces of me, Metamorphosis, Jazz says, Calm the crossing, Healthy self-talk). Batch 4 (Style the dream, Hold on together, Sunset joyride, Light the night, Catch the words) is still to come.

## Pieces of me (The Mirror)

**The Mirror** has **Pieces of me**, a flashlight game about finding yourself while your sight changes. The desert goes dark; your phone is the flashlight (or drag a finger). Eight broken pieces of the mirror are hidden around the painting, and each one holds a piece of who you are: curious, kind, creative, brave, funny, patient, loved, still me. Hold the light on a glint of glass to find it, and the word flies back to the mirror, whose crack starts to glow. With every piece your sight changes: the light gets smaller, blurrier and paler, and later it flickers out for a moment. Your hearing sharpens instead: the shimmer of glass that leads you to the next piece gets louder and clearer. When all eight are found, shine on the mirror: it lights the whole desert, clear again. A dreamy lofi song (keys and vinyl, then hats, a soft beat, bass and a glockenspiel tune) grows with every piece. **Hint** says which way to go.

- **lib/minigames/mirror-light.js**: the game; `PIECES` are the words and where they hide, `band()` is the music. Its first game is still there: add `&classic=1`.

## Metamorphosis (The Gray Zone)

**The Gray Zone** has **Metamorphosis**, a movement-and-calm game with a purpose. The glass cube holds the gray zone ("no longer fully sighted, not yet identifying as blind"), and something is growing in its fog. **Hold your phone very still** and the fog settles so you can see it; **move**, and the fog churns and swirls back (the whole gray room stirs too). Five times the fog clears, and each time the creature changes and the in-between gets a name: an egg (**not fully sighted**), a caterpillar (**not yet blind**), a chrysalis (**in between**), wings unfolding (**named**), and a butterfly (**free**). Each stage asks for a little more stillness. At the end the butterfly flies out of the glass and the gray room fills with colour, because naming the in-between is what set Morten free. By ear: a soft chord opens up as the fog clears, the wind rises when you move, and every stage is spoken. No motion sensor? Hold a finger on the screen and keep it still.

- **lib/minigames/gray-metamorphosis.js**: the game; `STAGES` (each stage's words and how long to stay still), `STILL` (how still is still). Its first game is still there: add `&classic=1`.

## Jazz says (Rhapsody in Blue)

**Rhapsody in Blue** has **Jazz says**, a musical Simon Says. Five players live in the painting: the **clarinet** (the big white curl, top left), the **trumpet** (the gold streak, top right), the **piano** (the black-and-white keys, left), the **drums** (the round cymbals, bottom middle) and the **bass** (the black notes, bottom right). It opens with a clarinet trill and a long rising run, the way the Rhapsody begins. Then the band plays a phrase, on the beat over a soft swing groove (brushes, walking bass, piano), and you play it back by tapping the players on the painting or with the five buttons. Every round adds a note, up to eight. The painting answers the music: each note sends coloured ripples across the canvas from its player, lights it up and lets music notes float out, the big blue swirl turns with the groove (more as you go), and a finished phrase makes the whole painting dance. A wrong note turns it gray for a moment and the band plays the phrase again, so nobody gets stuck.

- **lib/minigames/rhapsody-simon.js**: the game; `PLAYERS` (where each one lives and its sound), `START` / `GOAL` (first and longest phrase). Its first game is still there: add `&classic=1`.

## Calm the crossing (Moment of Communion)

**Moment of Communion** has **Calm the crossing**. The people on the bridge were cut out of the painting (and the bridge filled in), and now they really walk: people from both towns start at the two ends and walk toward each other to meet in the middle. The river runs toward you under the bridge, and the water falls away into the deep below it. But storms keep rolling in: the sky swirls with dark clouds, everything dims, rain falls, lightning flashes, and the people stop and huddle and wait. **Calm the storm with slow, gentle strokes across the screen** (soothe it; fast, rough swipes only stir it up and make thunder), or hold the **Calm** button. When it's calm, they walk on. Three storms; when everyone meets in the middle, the clouds part, the sun pours down, and it's a moment of communion. Lofi music (keys, a soft beat, a piano tune) plays throughout, muffled by the storms. By ear: wind, rain and thunder; a soft rising chime with every gentle stroke; footsteps when they walk; and everything is spoken.

- **lib/minigames/communion-bridge.js**: the game; `PEOPLE` (where each starts and where they meet), `STORMS`, `WALK` (walking speed). **media/games/communion/**: **bridge.jpg** (the painting with the people taken off the bridge) and **p1–p5.png** (the people). Its first game is still there: add `&classic=1`.

## Healthy self-talk (The Scope of Communication)

**The Scope of Communication** has **Healthy self-talk**: "Good communication starts with healthy self-talk." The two heads become puppets for the two voices inside your own head. **Voice 1, the worry** (the swirly head on the left): press **Talk** and say something you tell yourself when things get hard. **Voice 2, the answer** (the inky head on the right): answer it back like your best friend would. The game cues you to change your own voice for each head (a low, grumbly worry; a bright, warm answer), and after each take you pick a voice changer (**Deep, Squeaky, Robot, Echo, Normal**) and hear it straight away. Then the heads play your conversation back: the speaking head's jaw drops with every word, a glow runs around its outline (rainbow for the worry, fire for the answer), its colours swirl, the room dims a little, and a cloud of coloured ink-smoke drifts from its mouth to the other head, like the painting's own animation. **Keep going** for up to 3 back-and-forths, the kind voice gets the last word, and the painting's animation plays at the end. No microphone? Press **Type** and the head says it in a computer voice. Captions show the words where the phone can hear them. Nothing is uploaded or saved.

- **lib/minigames/scope-selftalk.js**: the game; `ROUNDS` (the prompts), `STYLES` (the voice changers), `MAX_REC` (seconds per take). **media/games/scope/glow-l.png / glow-r.png**: the outline of each head (red = tight glow, green = wide halo, blue = the head). Test with `&mouth=L` or `&mouth=R` to hold a mouth open. Its first game is still there: add `&classic=1`.

## Style the dream (Haute Couture Dreams)

**Haute Couture Dreams** has **Style the dream**. Shardasia loves fashion, chic or kind of baggy, being comfortable, and trying out colours, so you are her stylist. Three clients each give a brief: **Maya** (a sunny day in the park: comfy, bright, bold), **Jordan** (a gallery opening: chic, smart, calm) and **Shardasia** herself (a dance party: bold, party, comfy). **Tap the clothes on the collage wall** and they lift off their hangers and fly onto her: the blazer, the floral dress, the beige shirt, the hot pink dress. Or use the buttons: **Top**, **Bottom** and **Layer** go through the rack (her yellow tee, the floral blouse, the beige shirt, the pink top, a plain tee; her black skirt, floral, pink, beige or plain skirts; the blazer on or off), and **Colour** recolours the last piece you touched, with 11 colours that each have a name, a feeling and their own sound (sunflower yellow rings like a bell, navy hums like a cello). Her clothes keep the folds and light of the painting. The client's wishes show as a checklist, ticked off out loud as you dress her; press **Done** and the client says yes, or tells you what's missing and gives a hint. Then the runway: the lights drop to a spotlight, cameras flash from the photos on the wall, a fashion-show beat kicks in, and you press **Pose** on the beat to make her strike a pose. Tap her any time to hear what she's wearing.

- **lib/minigames/haute-style.js**: the game; `RACK` (the clothes and what each one says), `COLORS`, `CLIENTS` (briefs, wishes and what they don't want), `WALL` (where each garment hangs). **media/games/haute/**: **body.png** (her shirt, skirt and figure), **layer.png** (the blazer), **backdrop.jpg** (the wall behind her, for when she sways), **fab-*.jpg** (fabrics from the wall) and **wall-*.png** (the garments that fly). Its first game is still there: add `&classic=1`.

## Hold on together (Embracing Unity)

**Embracing Unity** has **Hold on together**. Shardasia is the oldest of six, in a family that moves together. **Part 1: link the family.** Drag from one person to the person next to them (or press **Link**): a golden thread joins their hands, each of them glows, and every link adds a note to the family's chord in the music, so the more of them you join, the richer the harmony. Grandpa, the sisters, Shardasia, Dad, her brother, the baby and Mom: when all ten are linked, gold flows along the chain and the colours bloom. **Part 2: walk home together.** The family really walks, stepping in time with the lofi, and the city comes closer. Three things happen on the way (a busy crossing, a loud bus, a puppy across the street) and one of the children lets go: their link snaps, they drift off into the crowd and keep calling from their side. **Tap them**, or press **Left** or **Right**, to bring them back into the chain; if you don't, they find their own way back after a few seconds. Bring everyone home together.

- **lib/minigames/unity-together.js**: the game; `FAM` (each of the family: where they stand, where their hands are, their note), `EVENTS` (what happens on the walk and who lets go), `WAIT`. **media/games/unity/**: **ids.png** (which pixels are which of the family), **backdrop.jpg** (the wall behind them, when someone drifts off) and **fig-*.png** (each of the family, cut out). Its first game is still there: add `&classic=1`.

## Sunset joyride (Joyride)

**Joyride** has **Sunset joyride**. "She tries to see the world through my perspective." You're Mom, at the wheel. The painting is on the move: the road rolls toward you from the horizon, the palms and trees stream past, their hair blows in the wind, and they both bob their heads to the radio. **Tilt the phone** (or hold **Left** / **Right**, or drag) to keep the car in its lane as the boulevard curves; drift out and you hear the rumble strip ("Whoa, Mom! Stay in your lane."). The little **radio panel** switches between three stations, each with its own music and its own sky: **88.1 Sunset Lofi** (the painting's own colours), **96.5 Neon Drive** (synthwave: a magenta sky and a striped sun) and **101.3 Golden Soul** (warm electric piano, a golden glow). Along the way six things pass by the road (palm trees, the ocean, the ice cream truck, a dog with its head out the window, Grandma's house, the sunset), each with its own sound, and Shardasia asks "Mom, what's that?" Pick the description that helps her see it her way (how it sounds, feels and smells) and she lights up: "I can see it!" Pick the plain one and she asks what it sounds like, and you hear the better way to say it. Then you drive right into the sun as it swells to fill the sky.

- **lib/minigames/joyride-sunset.js**: the game; `MOMENTS` (each thing by the road, its sound and the two descriptions), `STATIONS` (the radio), `GAP` (seconds between moments). **media/games/joyride/**: **world.jpg** (the boulevard with the car taken out, for the moving road), **info.png** (what moves: the world, Mom's hair, Shardasia's curls) and **car.png** (the car and the two of them). Its first game is still there: add `&classic=1`.

## Light the night (The Only Light We’ll See)

**The Only Light We’ll See** (Dave Steele) has **Light the night**. The painting comes alive: the moon glows and slowly pulses, its reflection shimmers and breaks up on the water with a path of glittering light toward you, the lake ripples, and little waves of silver foam lap in and out against the shore. The night starts very dark. You carry a small light: **point your phone** across the painting (or drag a finger). Eight things are hidden in the dark, each in one of a few spots so every game is different: an owl in the trees, a canoe, fireflies, a deer on the shore, a jumping fish, a cabin's lantern across the lake, a heron and a loon. Each makes its own sound (a hoot, paddle splashes, tiny chimes, hooves, a splash, a guitar, a croak, a loon's call) from its side and louder as you get close, with a shimmer that quickens when your light is near. **Hold your light on it** to find it: it lights up in silver, a spark flies up and **becomes a star**, and the whole night gets brighter. **Listen** makes the nearest one call out and says which way it is. Find all eight and the stars join into a constellation, the sky fills with stars, the moon's path blazes across the water, and the whole painting is lit. A quiet piano nocturne with crickets and the lake plays throughout, gaining notes as the night lights up.

- **lib/minigames/onlylight-find.js**: the game; `THINGS` (each hidden thing, its possible spots, its sound and where its star goes), `FIND_R` and `HOLD` (how close and how long). **media/games/onlylight/water.png**: the lake (red) and the distance to the shore (green), for the ripples and the waves. Its first game is still there: add `&classic=1`.

## Catch the words (The Visions That We Share)

**The Visions That We Share** (Dave Steele) has **Catch the words**. The great eye comes alive: it **blinks** (now and then by itself, and whenever you press Blink), and its **iris looks left and right** inside the eye. Dave lives with Retinitis Pigmentosa, a bright circle of sight with darkness all around it, so the painting starts dark except for a tunnel of light around wherever the eye is looking, and the tunnel moves with the eye. Words of a short poem drift in through the dark from the left or the right; each is spoken with its side ("Light. On your right.") and a chime from that side. **Turn the eye toward it** (tilt the phone, drag, or hold **Left** / **Right**) and press **Blink** (or just tap the word) while it's in view to catch it. Caught words fly into the poem at the bottom; each finished line is read out and **the tunnel of light grows wider**: sharing words widens the view. Miss one and it drifts away and comes back. Four lines, then the whole painting opens up and Dave's words close it. Lofi plays throughout, opening up as the view does.

- **lib/minigames/visions-eye.js**: the game; `POEM` (the poem, with the words you catch in [brackets]), `IRIS` / `LOOK` (where the iris is and how far it looks), `STAY` (how long a word drifts). **media/games/visions/**: **eyeball.jpg** (the eye with its iris taken out, so the iris can move) and **eye.png** (the eye's opening and where each point sits between the lids, for the blink). Its first game is still there: add `&classic=1`.

## Dance in the flowers (All Life’s Beauty)

**All Life’s Beauty** (Dave Steele) has **Dance in the flowers**. The girl in the garden becomes a puppet. **Tilt the phone** (or drag) and she sways with you, the garden bending around her; **wave the phone** (or swipe back and forth fast) and she twirls, her dress flaring and her hair swinging, while the stream of flowers pouring from her book swirls. A gentle lofi **waltz** plays, and every other bar a move is called (with a chime from its side): **Sway left**, **Sway right** or **Twirl**. Do it in time and flowers burst from her book and join a ring of real blossoms from the painting, spinning around her (behind her, then in front). After a few moves, **grey clouds of worry** drift in and the garden fades to grey and the music goes muffled: wave them away and the colour comes back. Twelve moves, then the whole garden dances and glows. Buttons for everything: **◀ Sway**, **Twirl**, **Sway ▶**.

- **lib/minigames/beauty-dance.js**: the game; `MOVES` (how many), `WINDOW` (seconds to do each move), `FEET` (where she sways from). **media/games/beauty/**: **info.png** (the stream of flowers, her hair and her), **flower-0–11.png** (flowers from the painting, for the ring). Its first game is still there: add `&classic=1`.

## Ride by feel (Back of a Harley)

**Back of a Harley** (Craig Ellis) has **Ride by feel**. Craig can't see the road any more, but he still rides by feel, so the game is played by sound and lean, with one thing to do. The bike rides itself: a real-sounding V-twin (the "potato, potato" rumble) fires up, the clouds and the wheat stream past, the sunbeams pulse and his jacket ripples in the wind. Your buddy rides out front and calls each curve ("Curve left!"), his bike sounding from that side. **Lean that way**: tilt the phone, hold **Left** / **Right**, or drag. The whole view banks with you; lean well and it's a smooth swoosh and the engine sings, lean wrong and you hear gravel (nothing worse). Every three curves the country changes, told through the senses and the light: **the desert** (hot wind, warm gold light), **the coast** (salt spray, gulls, cool light), **a summer rainstorm** (rain streaks, thunder) and **sunset**. At **the last stop**, a diner at sunset, the engines go quiet and vehicles roar past left to right (a car, a scooter, a truck... and a Harley): **tap when the Harley goes by**, the one with the right pipes. Then Craig's own words.

- **lib/minigames/harley-ride.js**: the game; `STRETCHES` (each part of the country: what's said and its light), `PER` (curves in each), `CALL` / `CURVE` (timing). The engine and every sound are made live in the browser. **media/games/harley/info.png**: what moves (sky and field), his jacket, and the sunbeams. Its first game is still there: add `&classic=1`.

## Riddles of the lighthouse (Lighthouse of Hope)

**Lighthouse of Hope** (Craig Ellis) has **Riddles of the lighthouse**. The great face by the sea comes alive: its **mouth moves as it talks** (the jaw drops and a notch of sky opens between the lips), the **moon-lamp glows and slowly pulses**, the star by its eye twinkles, its hair of clouds drifts and the **whole sea ripples**. The face asks six riddles about living with blindness and about Craig's lighthouse: a guide dog, a white cane, Braille, a screen reader, a lighthouse, and hope ("the very first thing they give"). Each has three answers, read out loud and on the buttons (**Again** repeats the riddle). A wrong answer gets "Not that one" and a kind clue, and drops away. Every right answer sends a **beam of light sweeping from the moon-lamp** across the sea and turns more of the sea gold; after all six, the lighthouse shines out across the whole sea. Gentle chords and ocean waves play throughout.

- **lib/minigames/lighthouse-riddles.js**: the game; `RIDDLES` (each riddle, its answer, two wrong answers, a clue and the reply). The face, moon, sea and beam are all done on the painting itself, so there are no extra image files. Its first game is still there: add `&classic=1`.

## Straight as an arrow (Telephone Poles)

**Telephone Poles** (Craig Ellis) has **Straight as an arrow**, from Craig's story: "all the telephone poles looked like they went straight up and then bent over at the top." You drive his highway as dusk falls, in a car with glowing headlights and tail lights that brighten when you slow. The road's centre line streams toward you and the grass shimmers past. The poles sway and **bend over at the top** like puppets, and every so often a glowing wire **droops right down across the road** (with a creak and an electric hum). One thing to do: **tilt the phone forward to speed up, back to slow down** (or hold **Go**, or drag up and down). Slow down while the wires are in the road and wait for them to lift ("They're up. Go!"); too fast and you get a zap and a jolt, nothing worse. Six times, then you're home, and your son says what he told Craig: "Those things are straight as an arrow." A laid-back road-trip groove plays, and the engine and wind follow your speed.

- **lib/minigames/poles-drive.js**: the game; `WIRES` (how many times they come down), `SAFE` (how slow is slow enough), `VP` (where the road meets the sky). Everything is drawn on the painting itself (the car is drawn in code), so there are no extra image files. Its first game is still there: add `&classic=1`.

## Mini games (all 49 paintings)

Every Blind Canvas painting has a "Play the game" button. Each game is about a minute long, plays over the painting, and can be played by ear: instructions are spoken, sounds come from where things are, the phone buzzes, and big buttons or screen-thirds do everything. At the end the painting's own animation plays and the "story" button opens the artist's interview.

- **lib/minigames/index.js**: which game belongs to which painting
- **lib/minigames/kit.js**: shared look (Claude Design's black / white / red style), sounds, spoken intro, 3-2-1-GO countdown and end screen
- **lib/minigames/engines/**: 11 game types: catch, rhythm, runner, reveal, beam, balance, echo, connect, pop, stack, sort
- **lib/minigames/cfg/**: one entry per painting for each type: title, instructions, positions on the painting, words, colours, sounds and difficulty
- **napkins.js, almost-blindness.js, walk-through-fear.js, curating-hope.js**: the four hand-built games, now using Claude Design's art from **media/games/** (and Ben's recorded voice for Almost Blindness). Every picture has a drawn-in fallback, so a missing file never breaks a game.

Test links: `?art=<painting-id>` plays one painting. Add `&bot=1&debug=1` and a robot plays the game by itself.
