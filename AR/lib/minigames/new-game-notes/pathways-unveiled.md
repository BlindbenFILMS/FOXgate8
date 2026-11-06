# Pathways Unveiled (pathways-unveiled): Clear the roads (POLISHED)
Files changed: AR/lib/minigames/pathways-safari.js
New files (if any): none; AR/media/voice/road-clear-1.mp3, road-clear-2.mp3, road-clear-3.mp3, road-cleared.mp3 (Ben's recordings)
Export (unchanged): openRoadSafariGame          voice.js PREFIX (unchanged): 'pathways-unveiled': 'road-',
index.js line (the description changes):
  'pathways-unveiled': openRoadSafariGame,     // Clear the roads: tame rain, fog, snow and a thunderstorm so the cars can drive again (April & Melissa)
Artist's clip at the finale: 3D/gallery/audio/art_9.mp3
voice-lines.js: the FULL list of this game's lines after the polish (ready to paste; replace the old block for this prefix with it):
  "road-clear-1": "Clear the roads.",
  "road-clear-2": "Bad weather is rolling in over the city.",
  "road-clear-3": "Tame it, so the cars can drive again.",
  "road-intro-7": "Headphones make it even better.",
  "road-rain": "Here comes the rain! Wipe it away: swipe back and forth like windshield wipers.",
  "road-rain-done": "You tamed the rain!",
  "road-fog": "Fog is rolling in! Rub the screen to clear it.",
  "road-fog-done": "The fog is gone!",
  "road-snow": "Snow! Hold your finger down like the sun to melt it.",
  "road-snow-done": "The snow melted!",
  "road-storm": "A thunderstorm! Tap the screen right after each lightning flash.",
  "road-storm-done": "The storm passed!",
  "road-cleared": "You cleared the roads!",
  "road-end": "The roads keep opening.",
Lines that are new or changed (Ben needs to record these): road-clear-1, road-clear-2, road-clear-3, road-cleared
Old lines no longer used: road-intro-1, road-intro-2, road-intro-3, road-intro-4, road-intro-5, road-intro-6, road-found-birds, road-found-bells, road-found-fountain, road-found-dog, road-found-train, road-found-icecream, road-4-more, road-2-more, road-all-six, road-on-it, road-very-close, road-try-up, road-try-down, road-try-left, road-try-right, road-try-up-left, road-try-up-right, road-try-down-left, road-try-down-right, road-try-further, road-back, road-caught, road-sisters
What changed:
- Weather only (Ben's pick): the sound hunt and the "find the sisters" part are gone.
- Cars drive the painting's roads. Rain, fog, snow and a thunderstorm roll in one at a time; tame each (wipe, rub, hold, tap after the lightning) or press the big Tame button.
- After each one the cars speed up and honk, then a few seconds of sunshine with birds; a rainbow after the rain and the storm.
- The end: the sisters' purple heart car beeps, the whole city honks, a fanfare and a rainbow, then April & Melissa in their own words (art_9.mp3).
- The buttons only show while there is weather: Again (repeats how to tame it) and Tame.
Tested: bot plays to the finale in about 40 s, no errors; the artist's clip starts after the finale line; every sentence the game can say is in the list above (checked with voice.js's own sentence matching).
Recordings: all of the new lines recorded (included in the zip: yes, AR/media/voice/).
Banners: Ben asked for the info banners to sit north of the painting in ALL games; that kit.js change is in the Roots of Kinship zip (KIT-CHANGE-banners-north.md).
