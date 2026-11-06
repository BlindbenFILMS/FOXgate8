# Inner Peace in Outer Chaos (inner-peace-in-outer-chaos): Breathe through the storm (POLISHED, was "Calm walk")
Files changed: AR/lib/minigames/inner-peace-walk.js
New files: AR/lib/minigames/morten-banner.js (shared by all three Morten Bonde games: keeps the top banner above the painting; identical in each zip)
Export (unchanged): calmWalkGame          voice.js PREFIX (unchanged): 'inner-peace-in-outer-chaos': 'calm-',
index.js line (description updated): 'inner-peace-in-outer-chaos': calmWalkGame, // Breathe through the storm: hold Breathe in, Hold, Breathe out (3 s each); each calm breath brings you closer to the calm face as the storm settles; Morten's own voice at the end (its first game: &classic=1)
Artist's clip at the finale: 3D/gallery/audio/art_60.mp3
voice-lines.js: the FULL list of this game's lines after the polish (ready to paste; replace the old calm- block with it):
```
  "calm-title": "Breathe through the storm.",
  "calm-how": "Hold breathe in, then hold, then breathe out, three seconds each.",
  "calm-how-2": "Each calm breath brings you closer to peace.",
  "calm-in": "Breathe in.",
  "calm-hold": "Hold.",
  "calm-out": "And out.",
  "calm-wrong-in": "Breathe in first.",
  "calm-wrong-hold": "Now hold.",
  "calm-wrong-out": "Now breathe out.",
  "calm-slower": "Slower. Keep holding.",
  "calm-closer": "Closer.",
  "calm-halfway": "Halfway there.",
  "calm-one-more": "One more breath.",
  "calm-gust": "Let the storm swirl. Stay calm.",
  "calm-peace": "You found inner peace. The storm can swirl all around, and you stay calm.",
  "calm-end": "Peace within.",
```
Lines that are new or changed (recorded by Ben, included in this zip): calm-title, calm-how, calm-how-2, calm-in, calm-hold, calm-out, calm-wrong-in, calm-wrong-hold, calm-wrong-out, calm-slower, calm-closer, calm-halfway, calm-one-more, calm-gust (14). Kept word for word: calm-peace, calm-end.
Old lines no longer used: calm-intro-1 to calm-intro-6, calm-step-back, calm-too-close, calm-green, calm-red, calm-freeze, calm-made-it, calm-keep-walking. Their recordings can stay; nothing plays them.
All 14 new lines are recorded and included (AR/media/voice/calm-*.mp3). They were level-matched to Ben's earlier recordings (about +7 dB, with a gentle limiter, 24 kHz mono 64 kbps like the others); nothing else about them was changed.
What changed (Ben's direction: simpler, no walking, three buttons):
- No physical walking and no Walk button, no motion sensor, no red light / green light. The game is three press-and-hold buttons: Breathe in, Hold, Breathe out, three seconds each (box breathing). The button whose turn it is lights up red; the others are black.
- The ring around the face grows while you hold Breathe in, glows while you hold Hold, and shrinks while you hold Breathe out. It only moves while the right button is held; let go too soon and it slips back ("Slower. Keep holding."). The wrong button makes the storm flare ("Breathe in first." / "Now hold." / "Now breathe out."). No timing fails.
- The journey without walking: each calm breath carries you a step closer. The painting zooms in toward the face (inside the frame), the storm settles, a wave of calm rolls out from the face, and the light on the forehead grows brighter. Six breaths and the storm parts: inner peace.
- The storm still gusts every 8 to 13 seconds ("A gust: let the storm swirl. Keep breathing"); it also builds if you stop breathing for a while.
- Sound: a rising breath of air while you breathe in, a soft hum while you hold, a falling breath out, a tick each second, a cue tone at each new phase, a calm drone that gains a note per breath, and the storm's roar fading as you calm down. Each step is spoken for the first two breaths, then sounds only.
- Intro cut from about 35 s to about 10 s, and play starts straight away (no stepping back).
- Morten reads his own quote at the finale (art_60.mp3) with the drone softened; the computer voice no longer reads the quote. The clip pauses with the game and stops if the story video is opened.
- Finale score cells: Calm breaths, Gusts, Time. Best time key: inner-peace:breathe.
- The top banner stays OFF the painting: the kit's top panel and intro banner sit right above the painting, exactly its width, every frame (morten-banner.js); the messages that used to drop over the painting (alert blocks and pop-ups) show in that banner instead. Long intro titles shrink or wrap to fit.
Tested: bot plays to the finale (about 65 s of play), and a real press-and-hold run of all 18 steps also reaches the finale; the artist's clip plays; no errors; 400x860 phone screen, three buttons fit (two-line labels).
Recordings: included (yes): AR/media/voice/ calm-title, calm-how, calm-how-2, calm-in, calm-hold, calm-out, calm-wrong-in, calm-wrong-hold, calm-wrong-out, calm-slower, calm-closer, calm-halfway, calm-one-more, calm-gust (.mp3). Played through with them: every spoken line plays a recording, no computer voice.
