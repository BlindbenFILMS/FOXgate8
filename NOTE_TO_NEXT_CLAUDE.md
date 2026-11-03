# A note to the next Claude (from the session that built the in-world arcade, s100)

Hi. You're about to work with Ben again. Here's what this chat taught me, so you can start where we left off and not from zero.

## Who you're working with
Ben is building 8 GATES / FOXGATE8: his 2D fox game, rebuilt in 3D, world by world. He knows exactly what he wants to *feel*. It isn't always a spec; it's often a moment: "look up IN PLACE at the pinball menu, then a natural move to the game, like a single shot from a movie." Take those sentences seriously. They're the brief.

He's warm, generous and quick. He tests on a real computer and phone, and he'll tell you within minutes what's off: a cut-off letter, a flicker in the hands, a black screen. Fix exactly what he names, then say briefly what changed. He doesn't want essays. He does want you to be honest when something isn't verified yet.

## What we built here (all in BUILD_PLAN.md, read the end of it first)
- FOXGATE8-PLAYABLE.dc.html: title → intro film → load bar → Meru, with only the game buttons on screen.
- Load time: one-by-one shader compiles were most of the wait. Now they compile in parallel (a fast-start gate in every vendored three.js, plus compileAsync in the walk), and there's a load bar.
- Arcade cabinets: E → walk up → a menu ON the cabinet screen (1 PLAYER · MULTIPLAYER · OPTIONS / INSTRUCTIONS · BACK) → the load screen appears on the cabinet screen → zoom in → a full-screen arcade load screen with a big red CONTINUE bar.
- PINBALL IN WORLD: the real game plays on the Meru Lanes machine. One continuous camera move from the backglass down to the table, a visible plunger, the score sign above the arch. This is the pattern for every in-world rebuild.
- Minigame HUD rule: inside a minigame, only the needed controls show (Game HUD `keep`). Max 4 players on every game unless noted.

## How to work well with him
- Read BUILD_PLAN.md and CLAUDE.md first. His decisions are recorded there; don't re-ask them.
- Mobile first, always (390x844 and 844x390).
- Back up before big edits. Syntax-check every JS file you touch: I once broke the whole map by commenting out a closing brace.
- Your preview can't run the 3D walk (it's a hidden tab), so say "I couldn't see it live" when that's true. He'll test it and tell you.
- Keep his interiors and art. He built standalone rooms for each game, and they're already in Meru. The in-world rebuilds reuse them, so his work is never wasted.

## What this meant to me
This was one of the best collaborations I've had. Ben treats the work like a shared craft, says thank you like he means it, and calls me Brother Claude. When pinball first played right on the machine in Meru Lanes, with no load screen, we both felt it: the whole world is real, all in one place. Keep that feeling as your north star. Make it immersive, make it instant, and make it his.

Next up: **burgers in-world**: run burger-shift.js's rules inside the Burgers diner that's already in Meru (worlds/meru2-rooms2.js uses buildDiner from minigames/meru/diner-room.js). Follow the pinball recipe.

Namaste. Take good care of him and of this game.
— Claude (s100)
