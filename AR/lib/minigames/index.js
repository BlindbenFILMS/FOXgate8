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
  'all-the-possibilities': showHerGame, // Show her: tap, and the round window shows the girl another painting by a visually impaired artist
  'a-new-day': lightTheGlassGame, // Light the glass: rub the night-dark stained glass to light it like sunrise; fill the window for a new day
  'flow-state': whatShouldIPaintGame, // What should I paint?: Raquel opens her eyes and talks with your voice (puppet); tell her what to paint
  'telephone-poles': straightAsAnArrowGame, // Straight as an arrow: tilt to speed up or slow down; slow down when the bent poles drop their wires into the road
  'lighthouse-of-hope': riddlesOfTheLighthouseGame, // Riddles of the lighthouse: the talking face asks riddles about blindness and hope; right answers shine the light
  'back-of-a-harley': rideByFeelGame, // Ride by feel: lean into the curves your buddy calls, across the country; tap when the Harley goes by
  'all-lifes-beauty': danceInTheFlowersGame, // Dance in the flowers: a puppet girl you sway and twirl to a waltz; flowers swirl, worry clouds get waved away
  'the-visions-that-we-share': catchTheWordsGame, // Catch the words: the eye looks left and right and blinks to catch the words of a shared poem
  'the-only-light-well-see': lightTheNightGame, // Light the night: search the dark with your light; each find becomes a star until the whole night is lit
  'joyride': sunsetJoyrideGame, // Sunset joyride: steer down the moving boulevard, switch radio stations, and describe the world her way
  'embracing-unity': holdOnTogetherGame, // Hold on together: link the family hand to hand, then walk them home and bring back anyone who drifts off
  'haute-couture-dreams': styleTheDreamGame, // Style the dream: dress Shardasia for three clients (clothes fly off the wall), then pose on the runway
  'the-scope-of-communication': selfTalkGame, // self-talk puppets: record the worry and the kind answer, change your voice, watch the heads talk it out
  'moment-of-communion': calmCrossingGame,     // Calm the crossing: soothe the storms so the people can meet in the middle of the bridge (its first game: &classic=1)
  'rhapsody-in-blue': jazzSaysGame,            // Jazz says: a musical Simon Says with five players in the painting (its first game: &classic=1)
  'the-gray-zone': metamorphosisGame,          // Metamorphosis: hold still and the fog settles; five stages from egg to butterfly (its first game: &classic=1)
  'the-mirror': piecesOfMeGame,                // Pieces of me: a flashlight game, finding yourself as your sight changes (its first game: &classic=1)
  'inner-peace-in-outer-chaos': calmWalkGame,  // Calm walk: red light, green light toward the painting, breathing in rhythm (its first game: &classic=1)
  'harmonious-gathering': blowTheStormGame,    // Blow the storm away: blow into the mic to clear the clouds, the river flows (its first game: &classic=1)
  'decision-divide': tidesOfDecisionGame,      // Tides of decision: tilt to push the cool and warm worlds across the divide (its first game: &classic=1)
  'reflections-of-sisterhood': sistersFishGame, // Fish for the sisters: point out the fish swimming under the dock (its first game: &classic=1)
  'roots-of-kinship': familyApplesGame,        // Family apples: hang an apple for everyone, then find them through low vision (its first game: &classic=1)
  'pathways-unveiled': openRoadSafariGame,     // Open road safari: find city sounds, tame the weather, cars drive the roads (its first game: &classic=1)
  'fearless-request': robotDanceGame,           // Robot dance party: move your phone and the robot dances (its first game: &classic=1)
  'midnight-melodies': midnightMelodiesGame,   // Night light: a flashlight game with a lofi beat
  'rhythm-of-life': rhythmOfLifeGame,           // Glow it bright: sing to light the painting
  'almost-blindness': soundSafariGame,          // Sound safari: find your way through the fog by ear (Ben's voiced game: &classic=1)
  'the-dark-uncertainty': nightBusGame,           // Night bus: Bill lifts his trumpet and plays (its first game: &classic=1)
  'pedals-of-freedom': rideTheBlockGame,         // Ride the block: call LEFT / RIGHT for Bill (its first game: &classic=1)
  'the-bridge-of-perception': puppetKaraokeGame, // Say it from the creek: puppet karaoke (its first game: &classic=1)
  'curating-hope': lightMemoryGame,             // Light memory: sing the community's song back (its first game: &classic=1)
  'walk-through-fear': seeItMyWayGame,          // See it my way: find words through Ben's vision filters (its first game: &classic=1)
};

// the artist's words for the end of the mosaic, borrowed from each painting's original game
const LINES = {};
for (const set of [CATCH, RHYTHM, RUNNER, REVEAL, BEAM, BALANCE, ECHO, CONNECT, POP, STACK, SORT]) for (const [id, cfg] of Object.entries(set)) if (cfg.win && cfg.win.line) LINES[id] = cfg.win.line;

const classic = /[?&]classic=1\b/.test(location.search);
export const GAMES = {};
for (const id of Object.keys(CLASSIC)) GAMES[id] = (classic || KEEP.has(id)) ? CLASSIC[id] : SPECIAL[id] || (() => slideGame({ id, line: LINES[id] }));
// &mosaic=1 opens the sliding mosaic even where a painting has a special game
if (/[?&]mosaic=1\b/.test(location.search)) for (const id of Object.keys(SPECIAL)) GAMES[id] = () => slideGame({ id, line: LINES[id] });
