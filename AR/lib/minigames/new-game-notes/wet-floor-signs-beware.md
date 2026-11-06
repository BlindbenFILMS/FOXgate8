# Wet Floor Signs, Beware! (wet-floor-signs-beware): SHWAK!
Files: AR/lib/minigames/shwak-signs.js, AR/lib/minigames/shwak-things.js, AR/media/games/shwak/cane.png, AR/media/games/shwak/panel.jpg
Export: shwakGame
index.js line: 'wet-floor-signs-beware': shwakGame, // SHWAK!: wet floor signs squeak in left/ahead/right; swing the cane that way, then beat the GIANT sign
Voice prefix: shwak-   (Ben has recorded ALL 29 lines: AR/media/voice/shwak-*.mp3, included in this zip)
Changes needed in shared files (the main chat does these at merge time; nothing shared was edited):
- index.js: add the line above.
- voice.js, PREFIX: add  'wet-floor-signs-beware': 'shwak-',
- voice-lines.js: add these 29 entries (Ben's recordings, all in AR/media/voice/):
```
  "shwak-intro-1": "Shwak!",
  "shwak-intro-2": "You are the Tubiak Maniak.",
  "shwak-intro-3": "Wet floor signs are sneaking up on you.",
  "shwak-intro-4": "Each one squeaks from its side: on the left, straight ahead, or on the right.",
  "shwak-intro-5": "Swing your cane that way and shwak it before it gets you.",
  "shwak-intro-6": "Ready?",
  "shwak-left": "Sign on the left!",
  "shwak-ahead": "Sign straight ahead!",
  "shwak-right": "Sign on the right!",
  "shwak-shwak": "Shwak!",
  "shwak-thwack": "Thwack!",
  "shwak-kapow": "Ka-pow!",
  "shwak-bonk": "Bonk!",
  "shwak-wham": "Wham!",
  "shwak-klonk": "Klonk!",
  "shwak-bam": "Bam!",
  "shwak-splash": "Splash!",
  "shwak-slipped": "He slipped!",
  "shwak-boss-1": "Oh no!",
  "shwak-boss-2": "The giant wet floor sign!",
  "shwak-boss-3": "Find it by its stomp, and shwak it five times!",
  "shwak-more-4": "4 more!",
  "shwak-more-3": "3 more!",
  "shwak-more-2": "2 more!",
  "shwak-more-1": "1 more!",
  "shwak-stomp": "Stomp!",
  "shwak-win-1": "Ka shwak!",
  "shwak-win-2": "The Tubiak Maniak wins!",
  "shwak-end": "The wet floor signs are beaten!",
```

How to play (one sentence, as spoken): Each sign squeaks from its side, on the left, straight ahead, or on the right; swing your cane that way and shwak it before it gets you.
What it does: yellow wet floor signs creep along the floor of the comic panel on the LEFT, AHEAD or RIGHT, growing as they come, each
squeaking and dripping from its side (left low, ahead middle, right high). Swing with 3 big buttons (or tap that third of the screen).
Mike's white cane is CUT OUT of the panel (cane.png; the panel with the cane painted out: panel.jpg) and really swings to that side; a big
comic word bursts (SHWAK! THWACK! KA-POW!…), the panel lunges and the sign spins away. Wrong side: Whiff. Too slow: SPLASH, he slips.
12 signs, faster and faster, over a superhero theme; then the GIANT WET FLOOR SIGN (angry eyes, gritted teeth) hops side to side and
stomps: SHWAK it 5 times. His cape flutters and his cane glints the whole time. Pop-ups (SPLASH!, the boss) show over the score panel at
the top, not over the art. Finale: Mike's quote, then his clip (wing_4_2.mp3).
Tested: bot plays 12 signs and the boss to the finale in about 51 s, no errors (one whiff, one slip and one stomp on purpose); every spoken
line plays Ben's recording. Ben has played it on his phone in the preview.
Note: the game loads its own panel.jpg (the painting with the cane removed) instead of the AR target, so the cut-out cane can move.
