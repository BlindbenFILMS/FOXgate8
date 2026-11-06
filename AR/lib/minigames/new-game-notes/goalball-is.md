# GOALBALL IS... (goalball-is): Block the shot
Files: AR/media/voice/goal-*.mp3, AR/lib/minigames/goal-block.js, AR/lib/minigames/goal-things.js
Export: goalBlockGame
index.js import: import { goalBlockGame } from './goal-block.js';
index.js line: 'goalball-is': goalBlockGame, // Block the shot: the jingling ball rolls at you from the left, the middle or the right; tap that side to dive and block it; block 10 shots (Ricky Ruzicka)
voice.js PREFIX line: 'goalball-is': 'goal-',
Artist's clip at the finale: 3D/gallery/audio/art_42.mp3
voice-lines.js entries (ready to paste):
  "goal-intro-1": "Block the shot.",
  "goal-intro-2": "Goalball is played by ear.",
  "goal-intro-3": "The ball has bells inside.",
  "goal-intro-4": "Listen.",
  "goal-intro-5": "Is it coming from the left, the middle, or the right?",
  "goal-intro-6": "Tap that side to dive and block it.",
  "goal-intro-7": "Block ten shots!",
  "goal-quiet": "Quiet please.",
  "goal-from-left": "From the left!",
  "goal-from-middle": "Down the middle!",
  "goal-from-right": "From the right!",
  "goal-block-1": "Block!",
  "goal-block-2": "Great block!",
  "goal-block-3": "What a save!",
  "goal-block-4": "Stopped it!",
  "goal-half": "Halfway there!",
  "goal-one-more": "One more!",
  "goal-ten": "Ten blocks!",
  "goal-star": "You are a goalball star!",
  "goal-goal": "Goal.",
  "goal-listen": "Listen for the bells.",
  "goal-end": "What a game!",

How to play (one sentence, as spoken): Goalball is played by ear. The ball has bells inside. Listen: is it coming from the left, the middle or the right? Tap that side to dive and block it. Block 10 shots!
What it does: You are the defender, kneeling on your goal line in blackout eyeshades like a real goalball player. The arena goes quiet, the whistle blows and the ball is thrown from the far end. It rolls down the LEFT, MIDDLE or RIGHT lane, its bells jingling from that side and getting louder and faster as it comes. Tap that side (three big buttons, or that third of the screen) and the defender dives full length. Lying where it arrives = BLOCK: the painting's shards flash through its colours, the crowd cheers and the arena groove plays until the next throw. Otherwise it's a goal for them and you go again. The first three throws are called out; then it's all ear, faster each time. The defender and ball are drawn in the painting's geometric style (goal-things.js).
Tested: the bot plays to the finale in about 68 s on a 400x860 phone-sized screen, no console errors; the artist's clip starts 2.5 s into the finale (currentTime moving); every sentence the game said is in the voice script.
Recordings: Ben recorded every line (included in the zip: yes, AR/media/voice/, all lines for this game). Add the voice.js PREFIX line and the voice-lines.js entries above so they play.
Changes needed in shared files: artworks.js has no quote for this painting yet. Please add Ricky's quote to work.quote (the game also carries it as a QUOTE constant, so it works either way). No other shared-file changes.
