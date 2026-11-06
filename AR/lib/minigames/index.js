// Mini games that live inside a painting, keyed by the artwork's id in artworks.js.
// When the gallery finds one of these paintings it shows a "Play the game" button.
//
// The Play game button now opens the SLIDING MOSAIC (engines/slide.js) for every painting,
// except the paintings listed in KEEP, which keep their own game.
// Every original game is still here, unchanged, in CLASSIC: four hand-built games, plus config-driven games
// for every other Blind Canvas painting (engines/<type>.js holds a game type, cfg/<type>.js each painting's settings).
// To play an original game, add &classic=1 to the link (for example ?art=hope-is-not-lost&classic=1).
// To give a painting its original game back for good, add its id to KEEP.
// SPECIAL lists paintings with a brand-new game of their own (Midnight Melodies: Night light; Rhythm of Life: Glow it bright; Walk Through Fear: See it my way; Almost Blindness: Sound safari; Curating Hope: Light memory; The Bridge of Perception: Say it from the creek; Pedals of Freedom: Ride the block; The Dark Uncertainty: Night bus; Fearless Request: Robot dance party; Pathways Unveiled: Open road safari; Roots of Kinship: Family apples; Reflections of Sisterhood: Fish for the sisters; Decision Divide: Tides of decision; Harmonious Gathering: Blow the storm away; Inner Peace in Outer Chaos: Calm walk; The Mirror: Pieces of me; The Gray Zone: Metamorphosis; Rhapsody in Blue: Jazz says; Moment of Communion: Calm the crossing; The Scope of Communication: Self-talk; Haute Couture Dreams: Style the dream; Embracing Unity: Hold on together; Joyride: Sunset joyride; The Only Light We’ll See: Light the night; The Visions That We Share: Catch the words; All Life’s Beauty: Dance in the flowers; Back of a Harley: Ride by feel; Lighthouse of Hope: Riddles of the lighthouse; Telephone Poles: Straight as an arrow; Flow State: What should I paint?; A New Day: Light the glass; All the Possibilities: Show her).
import { napkinsGame } from './napkins.js';
import { almostBlindnessGame } from './almost-blindness.js';
import { walkThroughFearGame } from './walk-through-fear.js';
import { curatingHopeGame } from './curating-hope.js';
import { catchGame } from './engines/catch.js';
import CATCH from './cfg/catch.js';
import { rhythmGame } from './engines/rhythm.js';
import RHYTHM from './cfg/rhythm.js';
import { runnerGame } from './engines/runner.js';
import RUNNER from './cfg/runner.js';
import { revealGame } from './engines/reveal.js';
import REVEAL from './cfg/reveal.js';
import { beamGame } from './engines/beam.js';
import BEAM from './cfg/beam.js';
import { balanceGame } from './engines/balance.js';
import BALANCE from './cfg/balance.js';
import { echoGame } from './engines/echo.js';
import ECHO from './cfg/echo.js';
import { connectGame } from './engines/connect.js';
import CONNECT from './cfg/connect.js';
import { popGame } from './engines/pop.js';
import POP from './cfg/pop.js';
import { stackGame } from './engines/stack.js';
import STACK from './cfg/stack.js';
import { sortGame } from './engines/sort.js';
import SORT from './cfg/sort.js';
import { slideGame } from './engines/slide.js';
import { midnightMelodiesGame } from './midnight-melodies.js';
import { rhythmOfLifeGame } from './rhythm-of-life.js';
import { seeItMyWayGame } from './walk-through-fear-see.js';
import { soundSafariGame } from './almost-blindness-safari.js';
import { lightMemoryGame } from './curating-hope-memory.js';
import { puppetKaraokeGame } from './bridge-karaoke.js';
import { rideTheBlockGame } from './pedals-ride.js';
import { nightBusGame } from './dark-uncertainty-play.js';
import { robotDanceGame } from './fearless-dance.js';
import { openRoadSafariGame } from './pathways-safari.js';
import { familyApplesGame } from './roots-apples.js';
import { sistersFishGame } from './reflections-fish.js';
import { tidesOfDecisionGame } from './decision-tides.js';
import { blowTheStormGame } from './harmonious-weather.js';
import { calmWalkGame } from './inner-peace-walk.js';
import { piecesOfMeGame } from './mirror-light.js';
import { metamorphosisGame } from './gray-metamorphosis.js';
import { jazzSaysGame } from './rhapsody-simon.js';
import { calmCrossingGame } from './communion-bridge.js';
import { selfTalkGame } from './scope-selftalk.js';
import { styleTheDreamGame } from './haute-style.js';
import { holdOnTogetherGame } from './unity-together.js';
import { callAndAnswerGame } from './unity-call.js';
import { sunsetJoyrideGame } from './joyride-sunset.js';
import { lightTheNightGame } from './onlylight-find.js';
import { catchTheWordsGame } from './visions-eye.js';
import { danceInTheFlowersGame } from './beauty-dance.js';
import { rideByFeelGame } from './harley-ride.js';
import { riddlesOfTheLighthouseGame } from './lighthouse-riddles.js';
import { straightAsAnArrowGame } from './poles-drive.js';
import { whatShouldIPaintGame } from './flow-talk.js';
import { lightTheGlassGame } from './newday-glass.js';
import { showHerGame } from './possible-window.js';
// New Artists Wing
import { crossTheStreetGame } from './button-cross.js';
import { keepRollingGame } from './roll-keep.js';
import { lightUpOneLoveGame } from './onelove-light.js';
import { raiseThemUpGame } from './raised-up.js';
import { followTheLinesGame } from './diffway-lines.js';
import { breatheBeautyGame } from './live-breathe.js';
import { firstFlightGame } from './hnw-flight.js';
import { meetCrowdGame } from './crowd-meet.js';
import { treePoseGame } from './unstop-tree.js';
import { fellowshipPassGame } from './fellowship-pass.js';
import { needleVoiceGame } from './needle-voice.js';
import { selfWorthDoorGame } from './selfworth-door.js';
import { bringTheBlurGame } from './blurry-wake.js';
import { putItBackGame } from './place-putback.js';
import { handsUpGame } from './temp-hands.js';
import { crewCallGame } from './strengths-crew.js';
import { askFirstGame } from './where-ask.js';
import { streetOfSensesGame } from './immersion-senses.js';
import { dropInGame } from './drop-in.js';
import { somewhereInBetweenGame } from './spectrum-between.js';
import { shwakGame } from './shwak-signs.js';
import { pourLoveGame } from './pour-love.js';
import { villageMagnetGame } from './village-magnet.js';
import { bloomClockGame } from './bloom-clock.js';
import { reachOutGame } from './reach-out.js';
import { offDutyFetchGame } from './fetch-relish.js';
import { pinTheMemoriesGame } from './pin-memories.js';
import { goalBlockGame } from './goal-block.js';
import { hopeFlyGame } from './hope-fly.js';
import { wifeSongGame } from './wife-song.js';
import { caneBeatGame } from './cane-beat.js';
import { pickTrackGame } from './coaster-track.js';
import { stillMeGame } from './hair-still.js';
import { tuneItUpGame } from './harmony-tune.js';
import { heroHopGame } from './power-hop.js';
import { climbTheScaleGame } from './steps-climb.js';
import { holdStillGame } from './weeks-still.js';

export const CLASSIC = {
  'napkin-please': napkinsGame,
  'almost-blindness': almostBlindnessGame,
  'walk-through-fear': walkThroughFearGame,
  'curating-hope': curatingHopeGame,
};
const ENGINES = { catch: catchGame, rhythm: rhythmGame, runner: runnerGame, reveal: revealGame, beam: beamGame, balance: balanceGame, echo: echoGame, connect: connectGame, pop: popGame, stack: stackGame, sort: sortGame };
for (const set of [CATCH, RHYTHM, RUNNER, REVEAL, BEAM, BALANCE, ECHO, CONNECT, POP, STACK, SORT]) for (const [id, cfg] of Object.entries(set)) {
  const make = ENGINES[cfg.engine];
  if (make && !CLASSIC[id]) CLASSIC[id] = () => make({ ...cfg, id });
}

// paintings that keep their own game (not the mosaic)
export const KEEP = new Set(['napkin-please']);

// paintings with a special new game of their own (instead of the mosaic)
export const SPECIAL = {
  // ── NEW ARTISTS WING (21 paintings, no old game behind them). New games are added here at merge time, one line each:
  //    'painting-id': theGameFunction, // Game name: one line on what it is
  'the-button-is-to-the-left': crossTheStreetGame, // Cross the street: press the button, wait for WALK, hold to cross with your white cane, stop for the car that runs the red light (Anthony Ferraro)
  'light-on-the-other-side': keepRollingGame, // Keep rolling: skate through the dark wave; jump when the cane hits something; fall, get back up, reach the light (Anthony Ferraro)
  'one-love': lightUpOneLoveGame, // Light up ONE LOVE: a reggae one-drop groove; a bird sings two notes on each dark letter, tap on the drop to light it (Anthony Ferraro)
  'art-raised-me-up': raiseThemUpGame, // Raise them up: steer the beam of light, lift Deborah's 8 frames off the dark walls; each turns into a clear picture as it rises (Deborah Tramentozzi)
  'a-different-way-to-see': followTheLinesGame, // Follow the lines: steer a spark along the collage's lines to each scene's sound; each scene fills with colour (Deborah Tramentozzi)
  'live-the-beauty': breatheBeautyGame, // Breathe the beauty: hold to breathe in, let go to breathe out; each breath wakes the world in the painting (Deborah Tramentozzi)
  'how-not-who': firstFlightGame, // First Flight: Doreen's butterfly lifts off the painting; move her LEFT / MIDDLE / RIGHT to drink from 8 humming paper flowers, then she flies home (Doreen Holmes)
  'invisibly-ours': meetCrowdGame, // Meet the Crowd: tap anyone in the crowd to meet them; 5 people tell you what they live with that you can't see; then Doreen's own voice (Doreen Holmes)
  'unstoppable': treePoseGame, // Tree Pose: keep Doreen balanced on one leg with LEFT / RIGHT; steady time opens 8 lotus petals; gusts of doubt blow by (Doreen Holmes)
  'fellowship': fellowshipPassGame, // Pass It On: tap PASS when the bell rings to pass the glow around the circle (Nikki Jeffords)
  'move-the-needle': needleVoiceGame, // Your Voice Moves the Needle: speak, sing or hum to move the sound wave and the VU needle; Hold to hum if no mic (Nikki Jeffords)
  'self-worth-a-new-understanding': selfWorthDoorGame, // Set It Down: let go of six bundles of old embarrassment and walk through the door (Nikki Jeffords)
  'beauty-in-the-blurry': bringTheBlurGame, // Bring the blur to life: drag your finger over the sleeping night street to wake its seven lights, each adding a part to the music (Delric Pollins)
  'everything-in-its-place': putItBackGame, // Put it back: a wave knocks Delric's things into the sea; pick each one up and put it back in its place, left to right (Delric Pollins)
  'the-temperature-setter': handsUpGame, // Hands up, hands down: lead the crowd on the beat; their hands rise and fall, the room heats up, 50 to 5,000 people (Delric Pollins)
  'strengths-limitations': crewCallGame, // Crew call: a film-set Simon Says with the camera, lights and sound built into the collage; each round the reel spins and a colour comes back (Sophia Dunn-Walker)
  'where-people-are': askFirstGame, // Ask first: find each person humming in the turning rings; they tell you what they need, you give exactly that (Sophia Dunn-Walker)
  'full-immersion': streetOfSensesGame, // Street of senses: walk up the market street; step left or right toward each sound, smell and light to catch 10 moments (Sophia Dunn-Walker)
  'comfort-in-the-uncomfortable': dropInGame, // Drop In: ride the canyon 6 times; TAP Drop in at the edge, steer LEFT/RIGHT round rocks, hold BRAKE (Michael Tubiak)
  'spectrum-of-sight': somewhereInBetweenGame, // Somewhere In Between: each colour ring is a way of seeing; name the thing you see (and hear) through it (Michael Tubiak)
  'wet-floor-signs-beware': shwakGame, // SHWAK!: wet floor signs squeak in left/ahead/right; swing the cane that way, then beat the GIANT sign (Michael Tubiak)
  'pour-in-the-love': pourLoveGame, // Pour in the love: tap on four as each drop of love lands in the heart; 8 rings fill with colour (Steven McCoy)
  'find-your-village': villageMagnetGame, // Like a magnet: you are the glowing orb; steer LEFT / RIGHT under each humming friend and they are pulled in; bring 10 home (Steven McCoy)
  'take-time-to-bloom': bloomClockGame, // Wind the clockwork: draw slow circles to wind the gear like a music box; slow and steady opens 8 petals, too fast jams it (Steven McCoy)
  'reaching-past-blindness': reachOutGame, // Reach Out: three soft beats then the big drum; tap STRUM on the drum to send Rusty's music out to 8 listeners in the dark (Rusty Perez)
  'reliroo': offDutyFetchGame, // Off-Duty Fetch: Relish runs off and barks from the left, middle or right; throw the ball that way, she leaps and catches it (Rusty Perez)
  'reasons-for-a-cure': pinTheMemoriesGame, // Pin the Memories: 10 memories float down past the photo wall, each with its own sound; tap PIN in the golden glow (Rusty Perez)
  'goalball-is': goalBlockGame, // Block the shot: the jingling ball rolls at you from the left, the middle or the right; tap that side to dive and block it; block 10 shots (Ricky Ruzicka)
  'hope-is-not-lost': hopeFlyGame, // Fly to the light: steer the floating island LEFT / RIGHT toward the wind chimes of the dawn, around 8 rumbling storms, to the sunrise (Ricky Ruzicka)
  'seeing-the-world-together': wifeSongGame, // Our song: a Simon Says duet: she sings a tune of LOW / MIDDLE / HIGH notes, you play it back in order; each tune grows by a note and lights up the future city (Ricky Ruzicka)
  'music-on-the-streets': caneBeatGame, // Cane Beat: tap on every beat as Alayna's cane touches each dome and stripe; the cane plays the tune and the grey street gets its colour back (Alayna Lopez)
  'roller-coaster-of-emotions': pickTrackGame, // Pick Your Track: at each fork, steer onto the billboard that tells the truth about blind people; the storm clears (Alayna Lopez)
  'i-am-blind-like-my-hair-is-brown': stillMeGame, // Still Me: her mosaic face scatters but her hair stays; follow each spot's hum and tap to bring the pieces home, her brown eyes last (Alayna Lopez)
  'the-harmony-of-vision': tuneItUpGame, // Tune It Up: slide the student's note UP/DOWN until it rings true with Deb's; 6 notes light the painting's circles (Academy of Music for the Blind)
  'the-power-within': heroHopGame, // Hero Hop: fly the hero LEFT/RIGHT to 8 curious kids calling from windows; she answers their questions about blindness (Academy of Music for the Blind)
  'a-bright-future': climbTheScaleGame, // Climb the Scale: each new stair counts in 1-2-3 then sings; TAP on the note and she climbs Do to Do into the sky (Academy of Music for the Blind)
  '5-weeks-on-my-side': holdStillGame, // Hold Still: keep the gas bubble over the stitches in Ben's eye for 5 weeks of movies with friends; tilt or hold LEFT / RIGHT (Ben Fox)
  // ── (end of New Artists Wing)
  'all-the-possibilities': showHerGame, // Show her: tap, and the round window shows the girl what she could do one day; hear each one, collect 9 lights (Raquel Alim)
  'a-new-day': lightTheGlassGame, // Light the glass: rub the 8 dark stained-glass panes to light them, following their hum; a down moment, then sunrise (Raquel Alim)
  'flow-state': whatShouldIPaintGame, // What should I paint?: talk, type or pick an idea; Raquel says it back and paints it into her colour streams (Raquel Alim)
  'telephone-poles': straightAsAnArrowGame, // Straight as an arrow: hold Go to drive Craig's highway, let go when the poles bend over the road toward your truck (Craig Ellis)
  'lighthouse-of-hope': riddlesOfTheLighthouseGame, // Riddles of the lighthouse: answer riddles about blindness and hope (left, middle, right); each right answer guides a ship home on the beam (Craig Ellis)
  'back-of-a-harley': rideByFeelGame, // Ride by feel: hold Left or Right and Craig leans his Harley into the curves your buddy calls, then tap when the Harley goes by (Craig Ellis)
  'all-lifes-beauty': danceInTheFlowersGame, // Dance in the flowers: a puppet girl you sway and twirl to a waltz; flowers swirl, worry clouds get waved away
  'the-visions-that-we-share': catchTheWordsGame, // Catch the words: the eye looks left and right and blinks to catch the words of a shared poem
  'the-only-light-well-see': lightTheNightGame, // Light the night: search the dark with your light; each find becomes a star until the whole night is lit
  'joyride': sunsetJoyrideGame, // Sunset joyride: steer down the moving boulevard, switch radio stations, and describe the world her way
  'embracing-unity': callAndAnswerGame, // Call and answer: Shardasia calls for her family in the busy city; tap whoever answers “Here!” to bring them home (the earlier Hold on together: unity-together.js)
  'haute-couture-dreams': styleTheDreamGame, // Style the dream: dress Shardasia for three clients (clothes fly off the wall), then pose on the runway
  'the-scope-of-communication': selfTalkGame, // self-talk puppets: record the worry and the kind answer, change your voice, watch the heads talk it out
  'moment-of-communion': calmCrossingGame,     // Calm the crossing: soothe the storms so the people can meet in the middle of the bridge (its first game: &classic=1)
  'rhapsody-in-blue': jazzSaysGame,            // Jazz says: a musical Simon Says with five players in the painting (its first game: &classic=1)
  'the-gray-zone': metamorphosisGame, // Metamorphosis: hold still and the fog clears; five living stages from egg to butterfly, Morten's own voice at the end (its first game: &classic=1)
  'the-mirror': piecesOfMeGame, // Pieces of me: a flashlight game; find eight icons of who you are on shards of mirror as your sight changes, and they heal the mirror; Morten's own voice at the end (its first game: &classic=1)
  'inner-peace-in-outer-chaos': calmWalkGame, // Breathe through the storm: hold Breathe in, Hold, Breathe out (3 s each); each calm breath brings you closer to the calm face as the storm settles; Morten's own voice at the end (its first game: &classic=1)
  'harmonious-gathering': blowTheStormGame,    // Blow the storm away: blow into the mic to clear the clouds, the river flows (its first game: &classic=1)
  'decision-divide': tidesOfDecisionGame,      // Tides of decision: tilt to push the cool and warm worlds across the divide (its first game: &classic=1)
  'reflections-of-sisterhood': sistersFishGame, // Feed the fish: drop food in the water, the fish swim up to eat and tickle the sisters' toes (April & Melissa)
  'roots-of-kinship': familyApplesGame,        // Picking apples with vision loss: apples grow on the tree, pick them through tunnel vision, then cataracts (April & Melissa)
  'pathways-unveiled': openRoadSafariGame,     // Clear the roads: tame rain, fog, snow and a thunderstorm so the cars can drive again (April & Melissa)
  'fearless-request': robotDanceGame,           // Robot dance party: move your phone and the robot dances (its first game: &classic=1)
  'midnight-melodies': midnightMelodiesGame,   // Night light: a flashlight game with a lofi beat
  'rhythm-of-life': rhythmOfLifeGame,           // Glow it bright: sing to light the painting
  'almost-blindness': soundSafariGame,          // Sound safari: find your way through the fog by ear (Ben's voiced game: &classic=1)
  'the-dark-uncertainty': nightBusGame,           // Night bus: Bill lifts his trumpet and plays (its first game: &classic=1)
  'pedals-of-freedom': rideTheBlockGame,         // Ride the block: call LEFT / RIGHT for Bill (its first game: &classic=1)
  'the-bridge-of-perception': puppetKaraokeGame, // Say it from the creek: puppet karaoke (its first game: &classic=1)
  'curating-hope': lightMemoryGame,             // Light memory: sing the community's song back; the tree fills with light (its first game: &classic=1)
  'walk-through-fear': seeItMyWayGame,          // See it my way: find words through Ben's vision filters while his light grows (its first game: &classic=1)
};

// the artist's words for the end of the mosaic, borrowed from each painting's original game
const LINES = {};
for (const set of [CATCH, RHYTHM, RUNNER, REVEAL, BEAM, BALANCE, ECHO, CONNECT, POP, STACK, SORT]) for (const [id, cfg] of Object.entries(set)) if (cfg.win && cfg.win.line) LINES[id] = cfg.win.line;

const classic = /[?&]classic=1\b/.test(location.search);
export const GAMES = {};
for (const id of Object.keys(CLASSIC)) GAMES[id] = (classic || KEEP.has(id)) ? CLASSIC[id] : SPECIAL[id] || (() => slideGame({ id, line: LINES[id] }));
// paintings that only have a new game (the New Artists Wing has no classic game or mosaic behind it)
for (const id of Object.keys(SPECIAL)) if (!GAMES[id]) GAMES[id] = SPECIAL[id];
// &mosaic=1 opens the sliding mosaic even where a painting has a special game
if (/[?&]mosaic=1\b/.test(location.search)) for (const id of Object.keys(SPECIAL)) GAMES[id] = () => slideGame({ id, line: LINES[id] });
