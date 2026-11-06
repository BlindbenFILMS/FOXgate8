# Almost Blindness (almost-blindness): Yesterday I Saw It (POLISHED)
Files changed: AR/lib/minigames/almost-blindness.js, AR/media/games/almost-blindness/voice/lines.json (replace)
New files: AR/media/games/almost-blindness/voice/mp3/27_morning_3_last.mp3, 28_intro.mp3
Re-recorded (replace the old files of the same names): the other 22 mp3s in AR/media/games/almost-blindness/voice/mp3/
Export (unchanged): almostBlindnessGame. This game has its own voice files (lines.json), not voice.js / voice-lines.js. Nothing to add there.
index.js: unchanged. It stays the painting's voiced game (&classic=1); Sound Safari stays the main game.
  If Ben wants Yesterday I Saw It as the main game instead, swap line 193 to:
  'almost-blindness': almostBlindnessGame,      // Yesterday I saw it: remember the wet floor signs, then walk the closing tunnel (Ben's voice)
Artist's clip at the finale: 3D/gallery/audio/art_1.mp3 (played after "This is almost blindness" and the bruise count, music soft under it)
lines.json: now lists the 24 lines the game uses. No longer listed (the files can stay on the site, nothing plays them):
  03_morning_4_intro, 04_morning_5_intro, 10_morning_3_done, 11_morning_4_done, 12_morning_5_done (and the ogg folder)
What changed:
- Three mornings instead of five (2, 3, then 4 signs; 5, 4.5, then 4 seconds to look). Title: "Yesterday I saw it. Three mornings. Look, remember, then walk to the light." (Ben's new 28_intro, played once it has loaded).
- The last morning ends with Ben's new "Morning three done." (27_morning_3_last).
- Smaller tunnel (150 / 125 / 100, was 230 down to 120). While you walk, the tunnel slowly closes in to about half and opens back up, every 6 seconds.
- A bump: he tips over sideways away from the sign, lands with a thud and a buzz, lies there a moment, then gets back up (2.3 s). The sign wobbles. The sight stays on him while he's down.
- Joystick at the bottom left, shown while walking (push up = forward; let go = stop). Drag-anywhere and arrow keys still work, and dragging is now measured on the screen, so it doesn't break if the painting moves. The on-screen walking hint says "Use the joystick…".
- Cane button: a straight white cane (no hook) with its red band.
- Wet floor signs: spaced further out left and right (0.6 to 1.4 from the middle, switching sides), recoloured from gold to bright safety yellow in code (no new pictures).
- Finale: shows the full quote; after Ben's ending lines his clip art_1 reads it. Pause/resume/stop and the story button handle the clip.
Tested: the bot plays all three mornings to the finale with no errors; all 24 recordings load and every scripted line plays from them (the phone voice is only used for the cane callouts like "Wet floor sign, ahead to your left", which are built as you play); the joystick walks him forward.
Note for the main chat (not changed here): on Ben's test page the painting sits between the top messages and the joystick / cane so nothing covers it. On the live AR page the game's big messages can still sit over the painting.
