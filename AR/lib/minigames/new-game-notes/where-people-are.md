# Where People Are (where-people-are): Ask first
Files: AR/lib/minigames/where-ask.js (no pictures or sounds to add: the rings, glow and close-up are drawn from the painting with shaders; music and sounds are Web Audio)
Export: askFirstGame
index.js import: import { askFirstGame } from './where-ask.js';
index.js line: 'where-people-are': askFirstGame, // Ask first: find each person humming in the turning rings; they tell you what they need, you give exactly that
Voice prefix: circle-   (voice.js PREFIX: 'where-people-are': 'circle-')
How to play (one sentence, as spoken): When someone hums, tap them, or press Find them, let them tell you what they need, then give them exactly that.

What it is: Sophia's amphitheater comes alive: each ring of it turns slowly at its own speed, like a record, carrying her little people
round. Five real people in the painting, one on each ring (Ben asked for 5, not 8), take turns humming from where they are (panned to their side). Whoever is humming has a pulsing red target on the painting: a breathing red ring, red ripples and a soft dark halo,
so they're easy to find. No words are drawn over the painting (Ben asked for no pop-ups): what they say is spoken and shown in the panel above. Tap them, or press FIND THEM. They step forward in a big round close-up (a zoomed window onto the painting, turning with their
ring) and say what they need. Only then do the answer buttons appear: An arm · Quiet · Hello. The right answer and they're heard; once
everyone on a ring has been heard, that ring glows gold. Ring by ring from the edge to the centre. Some need nothing at all ("Just say
hello"). The wrong answer: "That is not what I asked for." and they say it again. At the end the whole circle glows and turns as one,
and her animation fades in. About 1 minute.
Buttons: while finding: Listen · Find them. While asking: An arm · Quiet · Hello.

Tested: test-site harness, bot plays to the finale in 28 s (a person takes about a minute), no console errors (only voice-clip 404s); 30 s with
no input (hums repeat every 3.2 s). Phone-sized screenshots 400×860.
Changes needed in shared files: only the usual index.js lines and the voice.js PREFIX entry above.
Idea for later: the five people's lines could be recorded by different voices (friends, family) instead of Ben's narrator voice.

Voice lines for Ben to record:
circle-intro       Ask first. Sophia’s circle is full of people, and each one needs something different. When someone hums, tap them, or press Find them. Let them tell you what they need. Then give them exactly that.
circle-ring-edge   First, the edge.
circle-ring-outer  Now, the outer ring.
circle-ring-middle Now, the middle ring.
circle-ring-inner  Now, the inner ring.
circle-ring-centre Now, the centre.
circle-p1          I like it up here on my own. Just say hello.
circle-p2          Could I take your arm on these steps?
circle-p3          So many voices. Somewhere quiet, please.
circle-p4          Hi! I do not need anything. Just say hello.
circle-p5          Will you walk me to the very middle? I would love an arm.
circle-hello       Hello!
circle-quiet       Let us find a quiet spot.
circle-arm         Here is my arm.
circle-4-more      4 more.
circle-3-more      3 more.
circle-2-more      2 more.
circle-1-more      1 more.
circle-all-heard   Everyone has been heard.
circle-not-asked   That is not what I asked for.
circle-end         You asked first.
(Sophia's quote at the finale stays in her words, read as usual.)
