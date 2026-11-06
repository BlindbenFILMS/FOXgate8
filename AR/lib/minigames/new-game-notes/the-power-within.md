# The Power Within (the-power-within): Hero Hop
Files: AR/lib/minigames/power-hop.js, AR/lib/minigames/power-things.js, AR/media/games/power/hero.png, AR/media/games/power/city.jpg
Export: heroHopGame   (in power-hop.js)
index.js lines:
  import { heroHopGame } from './power-hop.js';
  'the-power-within': heroHopGame, // Hero Hop: fly the hero LEFT/RIGHT to 8 curious kids calling from windows; she answers their questions about blindness (Academy of Music for the Blind)
voice.js PREFIX line: 'the-power-within': 'power-',
Artist's clip at the finale: 3D/gallery/audio/art_58.mp3 (Acabella, AMB Performance Group)
voice-lines.js entries (ready to paste, 33 lines):
```
  "power-intro-1": "Hero hop.",
  "power-intro-2": "Blindness is her superpower, and the kids in the city are curious about it.",
  "power-intro-3": "Listen for a kid calling from a window.",
  "power-intro-4": "Hold left or right to fly the hero toward the sound.",
  "power-intro-5": "When she gets there, she'll answer their question.",
  "power-intro-6": "Ready?",
  "power-left": "On your left.",
  "power-right": "On your right.",
  "power-q-1": "How do you read?",
  "power-q-2": "How do you cross the street?",
  "power-q-3": "Can you see anything at all?",
  "power-q-4": "What's your cane for?",
  "power-q-5": "How do you use a phone?",
  "power-q-6": "Can I help you?",
  "power-q-7": "Can you play music?",
  "power-q-8": "Is it hard being blind?",
  "power-a-1": "With my fingers, in braille. And my phone reads to me out loud.",
  "power-a-2": "I listen to the traffic, and my white cane finds the curb.",
  "power-a-3": "Every blind person is different. Some of us see light, colours or shapes.",
  "power-a-4": "It finds steps, curbs and things in my way, before I bump into them.",
  "power-a-5": "It talks to me! A screen reader says everything out loud.",
  "power-a-6": "Thank you for asking first! Then I'll tell you what I need.",
  "power-a-7": "Yes! I sing with my friends at the Academy of Music for the Blind.",
  "power-a-8": "Some days are hard. But I find my own way, and I keep going.",
  "power-more-7": "7 more.",
  "power-more-6": "6 more.",
  "power-more-5": "5 more.",
  "power-more-4": "4 more.",
  "power-more-3": "3 more.",
  "power-more-2": "2 more.",
  "power-last": "The last kid.",
  "power-home": "Every kid got an answer!",
  "power-end": "That's the power within!",
```

How to play (one sentence, as spoken): Listen for a kid calling from a window, and hold left or right to fly the hero toward the sound.
What it does: The hero is cut out of the painting (hero.png); behind her the city is painted in (city.jpg) so her rooftop shows the skyline when she
leaves. She leaps off and flies over the city (her cape ripples more as she flies, with a trail of red and gold sparks). A kid leans out of a
lit window and calls: a whistled "hey-oh" and a bell, panned to where the kid is compared with the hero, louder as she gets close. Hold
LEFT/RIGHT (or touch and hold the left/right half of the screen). The first two kids are also called out ("On your right."); later, after 8 s
stuck, it says which way again. When she reaches the window she swoops down beside it; the kid's question is spoken and shown, then her
answer, then a heart floats up. 8 kids from 6 windows, alternating sides. The song (bright F major) adds a part every two kids. Finale: she
flies home to her rooftop, every window fills with waving kids, then the performance group's own clip.
Timing: she waits about 0.36 s per word for each spoken line, so Ben's recordings won't be cut off.
Tested: the bot plays it to the finale in about 57 s (a real player takes about 2 minutes, because she waits for each question and answer to finish) on a 400 × 860 phone-shaped screen, no errors (only the test site's missing voice
mp3s, as expected); the artist's clip starts at the finale (it was 3.5-4 s in when checked); every spoken sentence is in the voice script.
Voices: narrator (Ben) for the intro, directions, counts and ending; four kid voices for power-q-1..8 (Kid 1-4, two each); a hero voice
for power-a-1..8 (casting notes in the voice script). Same file names whoever records them: no code changes.
Recordings: 33 of 33 are recorded and included in AR/media/voice/ (power-*.mp3), checked against the script.
Timing checked against the real recordings: the intro waits for the whole spoken intro (about 20 s), and a tap on the screen skips it;
no line is cut off by the next one.
Changes needed in shared files (the main chat does these; nothing shared was edited): the index.js import and SPECIAL line above, the
voice.js PREFIX line, and the voice-lines.js entries.
