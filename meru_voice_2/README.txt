MERU VOICE PACK 2 - 681 new lines (MERU_NEW_LINES_2)

Same format as the first Meru voice pack. Put these clips in the same vo/ folder; none of the names clash.

vo/<id>.mp3          one clip per script row, named by its row id
meru_voice_2.json    one entry per clip: id, file, fox, voice, delivery, text,
                     scene and length in seconds, in script order

To hook these up:
- Proximity lines: foxes now have -prox AND -prox2. Teach meru2-vo.js to pick one
  at random each time (the townsfolk have -prox to -prox6).
- Townsfolk: the 109 crowd foxes share 4 voices (TOWNSFOLK MAN, WOMAN, ELDER, KID).
  Any crowd fox can play any line of its own voice.
- 1-on-1 talks: -01/-02 is what the fox says first, -q1/-q2 are the player's questions
  (FOX, Ben's voice), -a1a/-a1b are the answers, -qbye/-bye are the goodbyes.
- Play all clips at the same volume. Shouts and whispers are already louder or quieter on purpose.
- Captions: the "text" field is exactly what is spoken.
