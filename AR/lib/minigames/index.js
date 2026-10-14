// Mini games that live inside a painting, keyed by the artwork's id in artworks.js.
// When the gallery finds one of these paintings it shows a "Play the game" button.
//
// The Play game button now opens the SLIDING MOSAIC (engines/slide.js) for every painting,
// except the paintings listed in KEEP, which keep their own game.
// Every original game is still here, unchanged, in CLASSIC: four hand-built games, plus config-driven games
// for every other Blind Canvas painting (engines/<type>.js holds a game type, cfg/<type>.js each painting's settings).
// To play an original game, add &classic=1 to the link (for example ?art=hope-is-not-lost&classic=1).
// To give a painting its original game back for good, add its id to KEEP.
// SPECIAL lists paintings with a brand-new game of their own (Midnight Melodies: Night light; Rhythm of Life: Glow it bright).
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
export const KEEP = new Set(['napkin-please', 'walk-through-fear']);

// paintings with a special new game of their own (instead of the mosaic)
export const SPECIAL = {
  'midnight-melodies': midnightMelodiesGame,   // Night light: a flashlight game with a lofi beat
  'rhythm-of-life': rhythmOfLifeGame,           // Glow it bright: sing to light the painting
};

// the artist's words for the end of the mosaic, borrowed from each painting's original game
const LINES = {};
for (const set of [CATCH, RHYTHM, RUNNER, REVEAL, BEAM, BALANCE, ECHO, CONNECT, POP, STACK, SORT]) for (const [id, cfg] of Object.entries(set)) if (cfg.win && cfg.win.line) LINES[id] = cfg.win.line;

const classic = /[?&]classic=1\b/.test(location.search);
export const GAMES = {};
for (const id of Object.keys(CLASSIC)) GAMES[id] = (classic || KEEP.has(id)) ? CLASSIC[id] : SPECIAL[id] || (() => slideGame({ id, line: LINES[id] }));
// &mosaic=1 opens the sliding mosaic even where a painting has a special game
if (/[?&]mosaic=1\b/.test(location.search)) for (const id of Object.keys(SPECIAL)) GAMES[id] = () => slideGame({ id, line: LINES[id] });
