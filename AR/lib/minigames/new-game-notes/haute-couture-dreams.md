# Haute Couture Dreams (haute-couture-dreams): Style the dream (polished)
Files: AR/lib/minigames/haute-style.js (replaces the old one)
Pictures: none new. It uses the same AR/media/games/haute/ files already on the site (backdrop.jpg, body.png, layer.png, fab-*.jpg, wall-*.png).
Export: styleTheDreamGame (unchanged)
index.js line: unchanged ('haute-couture-dreams': styleTheDreamGame)
Voice prefix: style-   (already in voice.js PREFIX; no change)
Artist's own voice at the end: 3D/gallery/audio/art_50.mp3 (already on the site; the game plays it after the finale line)
Ben has recorded the 10 new lines: AR/media/voice/style-*.mp3, included in this zip.

Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- voice-lines.js: add these 10 entries next to the other style- lines (for example just before "style-end"):
```
  "style-intro-7": "Press Next to see each look, and Wear It when it fits.",
  "style-intro-8": "Then take her down the runway, and press Pose on the beat.",
  "style-first": "Press Next to see the first look.",
  "style-next": "Try the next look.",
  "style-bottom-coral": "And a swingy coral skirt: warm and sunny.",
  "style-look-navy-tee": "A navy tee with her long black skirt.",
  "style-maya-no-floral": "Pretty, but not bold enough for me.",
  "style-jordan-no-floral": "Pretty, but too busy next to my paintings.",
  "style-shardasia-no-navy": "Too quiet for a dance party! Bolder, please.",
  "style-shardasia-no-yellow": "I always wear yellow!",
```
- index.js, voice.js, kit.js, artworks.js: no changes.

How to play (as spoken): Press Next to see each look, and Wear It when it fits. Then take her down the runway, and press Pose on the beat.

What changed:
- One simple action. The old Top / Bottom / Layer / Colour rack, the 11-colour cycle and the "more comfy / more bold" scoring are gone.
  Each client has 4 ready-made looks: NEXT shows the next one on her, WEAR IT picks it. One look is right; wrong ones get a
  reason and a hint (all existing lines where possible).
  Maya: floral dress, blazer, yellow tee + coral skirt (right), navy tee + black skirt.
  Jordan: hot pink dress, beige shirt + black skirt (right), yellow tee + pink skirt, floral dress.
  Shardasia: navy dress, beige with the blazer, sunflower dress, emerald dress (right: "a colour I've never worn").
- She moves. She twirls into each look and the new outfit goes on while she's side-on. Wall garments fly off their hangers onto her.
  The new colours stay on the clothes only (her hands and arms stay skin).
- The runway is a real beat game: music at 100 BPM, lights drop, a spotlight, camera flashes from the photos on the wall, she walks
  towards you. POSE on the beat makes her lean, spin, step or pop (6 poses per walk, timed off the music clock). The spot where she
  stood in the painting blends into the wall, so no copy of her shows behind.
- Stars: 3 per client (fewer if it took more tries). Finale shows Stars x/9 and Poses x/18, then Shardasia's quote in her own voice.
- Tap her to hear the current look (or the brief) again; tap a wall garment to try it.

Recorded lines no longer used (harmless, can stay): style-intro-4, -5, -6, style-top-floral, style-top-pink, style-top-tee,
style-bottom-floral, style-bottom-beige, style-bottom-skirt, style-layer-none, style-wall-blazer, style-wall-beige,
style-color-coral, -hotpink, -red, -sky, -lavender, -black, -white, -sand, all style-yes-*, style-hmm, all style-more-*,
style-hint-dark, -structured, -smart and all style-hint-*-more, style-shardasia-no-smart, style-close-enough.
(The game matches by words, so "The floral dress: red roses on cream." still plays style-wall-floral, "The blazer: …" plays
style-layer-blazer, and "Try something calmer, like the beige shirt." plays style-hint-bold.)

Tested: the robot (&bot=1) plays all three clients and all three runways to the finale, no errors, poses 18/18. Every sentence it said
is in the voice script, and with the 10 new recordings added every line plays Ben's voice (no computer voice). The artist's clip starts
after the finale line. Ben played it in the preview.
