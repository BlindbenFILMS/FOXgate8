# Blind Canvas gallery: handoff (28–29 Oct 2026)

Paste this into the original chat: "Read HANDOFF_GALLERY_29OCT.md and continue BUILD_PLAN.md (gallery)."

## Files changed (upload all of these, same paths)
New:
- 3D/engine/gallery-puzzle.js (LIVING PUZZLE, window.PUZZLE)
- 3D/engine/gallery-paint.js (PAINT TOGETHER, window.PAINT)
- 3D/engine/gallery-hunt.js (ART HUNT, window.HUNT)
- 3D/engine/gallery-bingo.js (ART BINGO, window.BINGO)

Edited:
- 3D/gallery.html (loads the four above, net events, shared clock GSES, red ✕ observer, side tabs hide when busy, park map labels + CHESS / PAINT boxes, every fox starts as a cane fox in the Art suit)
- 3D/engine/gallery-game.js (pupil hallway, Stevie zone +4 m, main film skips first 2 s, hands = fur colour)
- 3D/engine/gallery-campus.js (WHY House banner lower, Talking Chess + Paint Together spots / routes)
- 3D/engine/gallery-remodel.js (Blindness Tip 1 moved across the walk)
- 3D/engine/gallery-fun-props.js (chess tables moved, TALKING CHESS sign)
- 3D/engine/gallery-chess.js (TALKING CHESS name)
- 3D/engine/gallery-studio.js (Fox / Vixen tee + camera section removed, 6 fur colours)
- 3D/gallery/gallery.json (second notes admin key for the admin link)
- BUILD_PLAN.md (progress notes)

## What was built
- LIVING PUZZLE: VIEW ART panel → PLAY AS A LIVING PUZZLE. Tiles on the wall in front of the painting (3×3 / 4×4), camera frames it, shared board for friends (net 'pzl'), solved = flash + living mp4.
- PAINT TOGETHER: canvas at the end of the walk north of the Academy (-9, -53). 8 colours, THIN/MID/THICK, live strokes for all (net 'pnt'), black invite text until the first stroke (hidden in full screen), clears every hour on the shared clock.
- ART HUNT: left tab (n/5). 5 clue cards per 30 min, same paintings for all, each player's own order. Stand in front = ★ stamp. RACING YOU list (net 'hnt').
- ART BINGO: only with 2+ foxes (tab under ART HUNT). 3×3 of painting squares decided ONLY by Ben's list (BINGO_TAGS / BINGO_NOT in gallery-bingo.js). Fills by itself in Art Hunt range, no hand ticking, one painting = one square (the rarest it fits). First line = bell for all (net 'bng').
- SHARED CLOCK (window.GSES): starts with the first fox in; later foxes adopt it; empty gallery → fresh clock. Hunt + bingo 30 min, paint 60 min.
- TALKING CHESS (renamed) moved to the end of the walk north of the WHY House; both new spots on the park map + place list.
- Park map labels auto-fit their boxes; every ✕ button red with the ✕ centred.
- ART HUNT / ART BINGO tabs appear only after the load screen and hide during full screen / games.
- Start fox: cane fox in the Art suit (art square front, BCP logo back), a different art per fox.
- Pupil hallway: black tube behind the eye's pupil (far end 33 % wider), fades as you walk in, hidden inside.
- Stevie Wonder film starts 4 m sooner; main screen film skips its first 2 s.

## Admin link (keep private)
gallery.html?admin=bcp-409799cbfdeac3df2b34e9cb → Approve / Hide on stories with photos or voice.

## Still to check
- Phone check (390×844 + 844×390) of the puzzle, paint panel, hunt and bingo cards.
- Two-device test: shared puzzle, live paint, hunt race, bingo bell, shared clock.
- Bingo needs 2 foxes to show. The main film's 2 s skip only applies to the local mp4.
- Pupil hallway: the film's side edges may clip from outside (widen if so).
