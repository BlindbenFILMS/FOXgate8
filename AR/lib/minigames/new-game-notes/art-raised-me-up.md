# Art Raised Me Up (art-raised-me-up): Raise them up
Files: AR/lib/minigames/raised-up.js, AR/lib/minigames/raised-things.js, AR/media/games/raised/hall.jpg
(hall.jpg = Deborah's painting with the floating frames in the middle painted out, so only her wall frames, which can be raised, are left; the drawn pictures are all in code)
Export: raiseThemUpGame
index.js line: 'art-raised-me-up': raiseThemUpGame, // Raise them up: lift Deborah's frames into the beam of light
index.js import: import { raiseThemUpGame } from './raised-up.js';
Voice prefix: raise   (voice.js PREFIX: 'art-raised-me-up': 'raise-')
How to play (one sentence, as spoken): Drag your finger, or point your phone, to move the beam of light, and hold it on a painting to raise it up.

What it is: the hall starts dark. You steer the beam of light from the hole in the ceiling (finger or phone), with dust
drifting up through it and the floor mirroring it. Deborah's own 8 gold frames are cut out of her painting and hang on
the walls; each hums its own sound (waves, robin, violin, bees, stars, singing bowl, music box, sunrise horn) from its
side, louder as the light gets close. Hold the light on one for 1 second: it glows, trembles, lifts off the wall, and
as it rises into the beam it turns into a clear drawn picture (sea, songbird, violin, sunflowers, night sky, marble
hands, dancer, sunrise) and the narrator describes it. The newest painting raised is featured big in the middle of the
hall, in the beam; when you raise the next one, the last one moves out to the ring of floating paintings around it. Each one raised brightens the hall and adds notes to a slow
hymn (with a big stone-hall reverb). LISTEN button: the nearest painting calls out and the narrator says which way.
All 8 raised: the hall fills with light, the paintings rise together, then the end panel shows Deborah's quote and
Deborah's own voice plays (3D/gallery/audio/wing_1_0.mp3, "I could say that art saved my life...").

Tested: bot plays to the finale in about 25 s, no errors (only 404s for the not-yet-recorded voice clips);
phone-sized (400x860) screenshots checked: beam, frames lifting, all 8 floating, end panel. Buttons: one row (Listen).
Changes needed in shared files: only the index.js line + import and the voice.js PREFIX entry above, and the voice lines below in voice-lines.js.

Voice lines for Ben to record:
raise-intro-1          Raise them up.
raise-intro-2          Eight paintings hang in the dark hall.
raise-intro-3          Each one makes its own sound, from its side, louder as your light gets close.
raise-intro-4          Drag your finger, or point your phone, to move the beam of light.
raise-intro-5          Hold the light on a painting, and it rises up into the light.
raise-raised-sea       You raised the sea.
raise-about-sea        Waves roll in under a golden sky.
raise-raised-bird      You raised the songbird.
raise-about-bird       A robin sings on a branch.
raise-raised-violin    You raised the violin.
raise-about-violin     A violin waits for its bow.
raise-raised-flowers   You raised the sunflowers.
raise-about-flowers    Three sunflowers stand in a blue vase.
raise-raised-stars     You raised the night sky.
raise-about-stars      The moon and stars swirl over a sleeping village.
raise-raised-hands     You raised the hands.
raise-about-hands      Two marble hands hold a little light.
raise-raised-dancer    You raised the dancer.
raise-about-dancer     A dancer spins on her toes.
raise-raised-sunrise   You raised the sunrise.
raise-about-sunrise    The sun rises between snowy mountains.
raise-more-7           7 more.
raise-more-6           6 more.
raise-more-5           5 more.
raise-more-4           4 more.
raise-more-3           3 more.
raise-more-2           2 more.
raise-more-1           1 more.
raise-here-1           It’s right here.
raise-here-2           Hold the light still.
raise-dir-left         A painting is to the left.
raise-dir-right        A painting is to the right.
raise-dir-up           A painting is up.
raise-dir-down         A painting is down.
raise-dir-up-left      A painting is up and to the left.
raise-dir-up-right     A painting is up and to the right.
raise-dir-down-left    A painting is down and to the left.
raise-dir-down-right   A painting is down and to the right.
raise-end-1            Every painting is raised up.
raise-end-2            The whole hall is full of light.
raise-end-3            The hall is full of light.
raise-end-4            Here is Deborah, in her own words.
(Deborah's quote and her own clip stay in her words: not recorded.)
