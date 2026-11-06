# Reflections of Sisterhood (reflections-of-sisterhood): Feed the fish (POLISHED)
Files changed: AR/lib/minigames/reflections-fish.js
New files (if any): none; AR/media/voice/fish-feed-1.mp3, fish-feed-2.mp3, fish-feed-10.mp3, fish-fed-all.mp3 (Ben's recordings)
Export (unchanged): sistersFishGame          voice.js PREFIX (unchanged): 'reflections-of-sisterhood': 'fish-',
index.js line (the description changes):
  'reflections-of-sisterhood': sistersFishGame, // Feed the fish: drop food in the water, the fish swim up to eat and tickle the sisters' toes (April & Melissa)
Artist's clip at the finale: 3D/gallery/audio/art_10.mp3
voice-lines.js: the FULL list of this game's lines after the polish (ready to paste; replace the old block for this prefix with it):
  "fish-feed-1": "Feed the fish.",
  "fish-intro-2": "April and Melissa are sitting on the dock in Guanaja, with their feet in the water.",
  "fish-intro-3": "Tropical fish are swimming by.",
  "fish-feed-2": "Tap the water to drop some fish food, and the fish swim up to eat.",
  "fish-intro-5": "Each fish makes little bubbles from its side, so you can find them by ear too.",
  "fish-feed-10": "Feed ten fish!",
  "fish-april-look": "April, look!",
  "fish-tang": "A blue tang!",
  "fish-snapper": "A yellowtail snapper!",
  "fish-parrot": "A parrotfish!",
  "fish-angel": "A queen angelfish!",
  "fish-sergeant": "A sergeant major!",
  "fish-puffer": "A little puffer fish!",
  "fish-ray": "A spotted eagle ray!",
  "fish-turtle": "A sea turtle!",
  "fish-melissa-look": "Melissa, look!",
  "fish-ray-coming": "Something big is gliding by. A spotted eagle ray!",
  "fish-turtle-coming": "Something big is coming. A sea turtle!",
  "fish-none-near": "No fish near there. Try lower in the water.",
  "fish-fed-all": "You fed every fish!",
Lines that are new or changed (Ben needs to record these): fish-feed-1, fish-feed-2, fish-feed-10, fish-fed-all
Old lines no longer used: fish-intro-1, fish-intro-4, fish-intro-6, fish-end
What changed:
- Feed the fish (Ben's pick) instead of pointing fish out.
- Tap the water: a pinch of colourful fish food drops in and sinks; the nearest fish dashes over, gobbles it ("nom nom"), and swims off to tickle a sister's toes with a splash and a giggle. Feed 10 fish.
- The ray comes after 3 fish, the sea turtle after 7. Every fish fed adds a marimba note over the island band.
- By ear: each fish makes bubbles from its side; the big Feed button drops food right in front of the fish nearest where you're looking.
- The end: the sisters splash, then April & Melissa in their own words (art_10.mp3).
Tested: bot plays to the finale in about 32 s, no errors; the artist's clip starts after the finale line; every sentence the game can say is in the list above (checked with voice.js's own sentence matching).
Recordings: all of the new lines recorded (included in the zip: yes, AR/media/voice/).
Banners: Ben asked for the info banners to sit north of the painting in ALL games; that kit.js change is in the Roots of Kinship zip (KIT-CHANGE-banners-north.md).
