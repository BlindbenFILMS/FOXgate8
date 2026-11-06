# SEEING THE WORLD TOGETHER (seeing-the-world-together): Our song
Files: AR/media/voice/wife-*.mp3, AR/lib/minigames/wife-song.js, AR/lib/minigames/wife-things.js
Export: wifeSongGame
index.js import: import { wifeSongGame } from './wife-song.js';
index.js line: 'seeing-the-world-together': wifeSongGame, // Our song: a Simon Says duet: she sings a tune of LOW / MIDDLE / HIGH notes, you play it back in order; each tune grows by a note and lights up the future city (Ricky Ruzicka)
voice.js PREFIX line: 'seeing-the-world-together': 'wife-',
Artist's clip at the finale: 3D/gallery/audio/art_34.mp3
voice-lines.js entries (ready to paste):
  "wife-intro-1": "Our song.",
  "wife-intro-2": "She sings a little tune of low, middle and high notes.",
  "wife-intro-3": "Then it’s your turn.",
  "wife-intro-4": "Play them back in the same order.",
  "wife-intro-5": "Each tune gets one note longer, and every tune you finish lights up the city.",
  "wife-intro-6": "Eight tunes.",
  "wife-listen": "Listen to her.",
  "wife-your-turn": "Your turn.",
  "wife-nice-1": "Beautiful!",
  "wife-nice-2": "Together!",
  "wife-nice-3": "The city lights up!",
  "wife-half": "Halfway there!",
  "wife-last": "Last tune!",
  "wife-complete": "Our song is complete!",
  "wife-longer": "One more note.",
  "wife-again": "Try again with her.",
  "wife-listen-again": "Listen again.",
  "wife-world": "You saw the world together!",
  "wife-end": "You made it together!",

How to play (one sentence, as spoken): She sings a little tune of low, middle and high notes. Then it's your turn. Play them back in the same order. Each tune gets one note longer, and every tune you finish lights up the city. Eight tunes.
What it does: A Simon Says duet over a slow sunset groove in F. Three notes: LOW (heard on the left), MIDDLE (centre) and HIGH (right), each with a glowing pad at the bottom of the painting (coral, gold, cyan) and a big button (LOW / MIDDLE / HIGH, or tap that third of the screen). She plays the three notes once during the intro so you know them. Then she sings a tune (the pads light, pink notes float up from her); the panel turns red, YOUR TURN, and you play it back in order while Ricky sings each note with her (teal notes from him). Each tune is the last one plus a note: 2, 3, 3, 4, 4, 5, 5, 6 notes. A finished tune lights a part of the future city (tower, skyline, sky ship, water, domes, ringed planet, bridge, garden) and grows the gold glow between their hands. A wrong note: she sings it again. If you wait 7 seconds she sings it again too. The dusk lifts as you play, then the painting comes alive and Ricky speaks.
Tested: the bot plays to the finale in about 70 s on a 400x860 phone-sized screen, no console errors; the artist's clip starts 2.5 s into the finale (currentTime moving); every sentence the game said is in the voice script.
Recordings: Ben recorded every line (included in the zip: yes, AR/media/voice/, all lines for this game). Add the voice.js PREFIX line and the voice-lines.js entries above so they play.
Changes needed in shared files: artworks.js has no quote for this painting yet. Please add Ricky's quote to work.quote (the game also carries it as a QUOTE constant, so it works either way). No other shared-file changes.
