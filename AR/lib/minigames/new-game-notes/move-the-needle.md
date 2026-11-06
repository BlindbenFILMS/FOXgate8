# Move the Needle (move-the-needle): Your Voice Moves the Needle
Files: AR/lib/minigames/needle-voice.js, AR/lib/minigames/needle-voice-things.js (no media files; everything is drawn in code)
Export: needleVoiceGame
index.js line: 'move-the-needle': needleVoiceGame, // Your Voice Moves the Needle: the painting is a sound wave; speak, sing or hum to make it come alive and move a studio VU needle (Hold to hum if no mic)
Voice prefix: needle  (voice.js PREFIX: 'move-the-needle': 'needle-')
How to play (as spoken): Move the needle. This painting is a sound wave. Use your voice to move the needle. Speak, sing or hum into your phone. No microphone? Hold the Hum button.

The game, round by round:
- 6 short rounds: make the needle move, hum softly in the middle, go louder into the red, sing a high note, sing a low note, then everyone together for the biggest wave.
- The painting's wave reacts to the player's voice: it grows taller and wider with volume and shifts colour with pitch.
- The last round records a few seconds of the player's voice and plays it back as the whole painting lights up.
- At the end: the finale, Nikki's quote, then her own clip (3D/gallery/audio/wing_5_1.mp3). If the clip can't play, the quote is read instead.

How it works:
- **Microphone:** it is asked for when the game starts, and its tracks are stopped in stop().
- **No microphone:** HOLD TO HUM (a hum that swells while held) and HIGH HUM.
- **Nobody gets stuck:** after 25 s in a round, any strong sound wins it.

Tested: the bot plays to the finale with no errors (400×860, in the test harness and in the preview page). It was also checked with a fake mic (&fakeVoice=1) through every round, including singing, high notes and the biggest wave.

RETIRED: needle-nudge.js and needle-things.js (the first "Just a Little Bit" game, saved 3 Nov) are replaced by this game and can be deleted. Don't register them.

Changes needed in shared files: only the index.js line above and the voice.js PREFIX entry.

Voice lines for Ben to record:
needle-intro-1    Move the needle.
needle-intro-2    This painting is a sound wave.
needle-intro-3    Use your voice to move the needle.
needle-intro-4    Speak, sing or hum into your phone.
needle-intro-5    No microphone? Hold the Hum button.
needle-r1         Make the needle move.
needle-r2a        Hum softly.
needle-r2b        Keep the needle in the middle.
needle-r3         Now louder! Reach the red.
needle-r4         Sing a high note.
needle-r5         Now a low note.
needle-r6a        Everyone together.
needle-r6b        Make the biggest wave.
needle-win        You moved the needle.
needle-cue-louder Louder.
needle-cue-softer Softer.
needle-cue-hold   Hold it.
needle-cue-higher Higher.
needle-cue-lower  Lower.
needle-cue-keep   Keep going.
needle-nomic-1    No microphone.
needle-nomic-2    Hold the Hum button instead.
needle-voice      Your voice moved the needle.
needle-end        It is a big deal.
