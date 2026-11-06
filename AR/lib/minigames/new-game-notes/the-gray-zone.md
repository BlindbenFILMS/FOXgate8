# The Gray Zone (the-gray-zone): Metamorphosis (POLISHED)
Files changed: AR/lib/minigames/gray-metamorphosis.js
New files: AR/lib/minigames/gray-things.js (the five creatures, drawn in code; no pictures needed); AR/lib/minigames/morten-banner.js (shared by all three Morten Bonde games: keeps the top banner above the painting; identical in each zip)
Export (unchanged): metamorphosisGame          voice.js PREFIX (unchanged): 'the-gray-zone': 'meta-',
index.js line (description updated, optional): 'the-gray-zone': metamorphosisGame, // Metamorphosis: hold still and the fog clears; five living stages from egg to butterfly, Morten's own voice at the end (its first game: &classic=1)
Artist's clip at the finale: 3D/gallery/audio/art_59.mp3
voice-lines.js: the FULL list of this game's lines after the polish (ready to paste; replace the old meta- block with it):
```
  "meta-intro-1": "Metamorphosis.",
  "meta-intro-4": "Hold your phone very still, and the fog settles so you can see it.",
  "meta-intro-5": "Move, and the fog swirls back.",
  "meta-be-still": "Be still.",
  "meta-no-sensor": "No motion sensor? Hold a finger on the screen, and keep it still.",
  "meta-what-1": "An egg, resting on a leaf.",
  "meta-name-1": "Not fully sighted.",
  "meta-what-2": "A caterpillar, hungry to grow.",
  "meta-name-2": "Not yet blind.",
  "meta-what-3": "A chrysalis, quiet and hidden.",
  "meta-name-3": "In between.",
  "meta-what-4": "Wings, unfolding.",
  "meta-name-4": "Named.",
  "meta-what-5": "A butterfly.",
  "meta-name-5": "Free.",
  "meta-again-1": "The fog rolls back in. Be still again.",
  "meta-again-2": "Something is changing. Be still.",
  "meta-again-3": "Stiller now. Almost there.",
  "meta-again-4": "One last time. Be still.",
  "meta-set-free": "Naming the in-between is what set him free.",
  "meta-end": "Free.",
```
Lines that are new or changed (Ben needs to record these): none. Every line is one Ben already has, word for word.
Old lines no longer used: meta-intro-2, meta-intro-3, meta-intro-6 (the intro is shorter). Their recordings can stay; nothing plays them.
What changed:
- Morten reads his own quote at the finale (art_59.mp3), with the music dropped to a soft bed; the computer voice no longer reads the quote. The clip pauses with the game and stops if the story video is opened.
- The fog really clears: as you hold still, the painted fog inside the cube gives way to clear dark glass with a warm light, and the creature glows out of it.
- Five new creatures, drawn in code and alive (gray-things.js): an egg that glows and wobbles, a caterpillar that inches and blinks, a swaying chrysalis, wings opening, and a full-colour butterfly. Colour grows stage by stage.
- Sound: a shimmer that rises in pitch as the fog clears, a chime at each quarter, and a song that gains a part at each stage (root, arpeggio, heartbeat, bells, melody).
- Shorter intro (3 of the existing lines). "Be still." as a reminder if you keep moving for a while.
- Bigger finale: the butterfly flies out of the glass with colour sparkles, the room fills with stronger colour that stays on through the end panel, and the butterfly circles in front of the cube.
- Bug fixes: the stage word under the cube no longer gets cut off; phones without a motion sensor now hear the "hold a finger on the screen" line (it used to be swallowed by the intro). A finger that is already on the screen when play starts now counts (before, only a finger put down after the sensor check worked).
- The top banner stays OFF the painting: the kit's top panel and intro banner sit right above the painting, exactly its width, every frame (morten-banner.js); the messages that used to drop over the painting (alert blocks and pop-ups) show in that banner instead. Long intro titles shrink or wrap to fit.
Tested: bot plays to the finale in about 55 s of play, no errors; the artist's clip starts and plays (currentTime moving); finger-hold mode tested without a sensor; every spoken sentence is in the list above; 400x860 phone screen, no buttons needed.
Recordings: none needed (included in the zip: no).
