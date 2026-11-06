# Self-Worth: A New Understanding (self-worth-a-new-understanding): Set it down
Files: AR/lib/minigames/selfworth-door.js, AR/lib/minigames/selfworth-things.js (no media files; everything is drawn in code)
Export: selfWorthDoorGame
index.js line: 'self-worth-a-new-understanding': selfWorthDoorGame, // Set it down: let go of six heavy bundles of old embarrassment so she can walk through the door; colour returns with each one
Voice prefix: worth  (add 'self-worth-a-new-understanding': 'worth-' to voice.js PREFIX)
How to play (one sentence, as spoken): When you hear what she is carrying, press Let go. Or tap the painting.
What it does: the painting starts gray, dim and cool, and she stands a little hunched. Six drawn sacks (SORRY, HIDING, PRETEND, SHRINKING, ALONE, SHAME) hang around her. Each one is named in turn, with a low heavy note from its side and a pulsing ring. LET GO (or a tap anywhere on the painting) drops it with a thud from its side, it crumbles to dust, a rising note plays, she stands taller, the colour and warm light come back, and the view steps in toward the door. After all six: "Blindness is respectable.", a door chime, the doorway fills with warm light, and she walks through. Finale: K.finale with work.quote, then Nikki's own clip (3D/gallery/audio/wing_5_2.mp3) plays after about 3 s. If the clip can't play, the quote is read instead. The bot skips the clip. Second button: WHAT IS IT? (says the current bundle again). After 8 s idle: "Press Let go to set it down."
Tested: in a private copy of the 3 Nov test-site, the bot plays to the finale in about 38 s of game time with no errors from this game. The only 404s are media/voice clips and curating-hope media missing from the test copy. Phone screenshots at 400×860: start, mid (3 of 6), door, finale. A manual LET GO press reacts in under 150 ms (bundle drops, pop, thud), and a tap on the painting works too. pause() mutes the music and pauses Nikki's clip; stop() stops all audio.
Note: in the headless test renderer (SwiftShader), the kit's opaque score panel punched a mirrored gray box through the canvas behind the buttons (Embracing Unity shows it too). This game sets the panel to opacity 0.999 (looks identical), which stops it. The main chat could make the same tiny change in kit.js for every game.
Changes needed in shared files (if any): only the usual index.js line and the voice.js PREFIX entry above.
Voice lines for Ben to record:
worth-intro-1    Set it down.
worth-intro-2    She is walking to the door.
worth-intro-3    But she is carrying old embarrassment, and it is heavy.
worth-intro-4    When you hear what she is carrying, press Let go.
worth-intro-5    Or tap the painting.
worth-sorry      Sorry. Always saying sorry for not seeing.
worth-hiding     Hiding. Hiding her cane so nobody knows.
worth-pretend    Pretend. Pretending she can see, with a smile.
worth-shrinking  Shrinking. Trying not to make a fuss.
worth-alone      Alone. Never asking for help.
worth-shame      Shame. The heaviest one of all.
worth-let-go     Let it go.
worth-taller     She stands a little taller.
worth-5-more     5 more.
worth-4-more     4 more.
worth-3-more     3 more.
worth-2-more     2 more.
worth-1-more     1 more.
worth-last       That was the last one.
worth-nudge      Press Let go to set it down.
worth-reached    She reached the door.
worth-respect    Blindness is respectable.
worth-opens      The door opens.
worth-worth      She has worth.
worth-always     She always did.
worth-through    Through the door.
worth-nikki      Here is Nikki, in her own words.
(Nikki's quote stays in her own words, from her clip. Never re-record it. Ben may want "Blindness is respectable." in a different, warm voice: it is the blind friend speaking.)
