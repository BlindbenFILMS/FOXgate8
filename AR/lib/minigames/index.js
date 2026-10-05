// Mini games that live inside a painting, keyed by the artwork's id in artworks.js.
// When the gallery finds one of these paintings it shows a "Play the game" button.
// Four hand-built games, plus config-driven games for every other Blind Canvas painting:
// engines/<type>.js holds a game type, cfg/<type>.js holds each painting's settings for it.
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

export const GAMES = {
  'napkin-please': napkinsGame,
  'almost-blindness': almostBlindnessGame,
  'walk-through-fear': walkThroughFearGame,
  'curating-hope': curatingHopeGame,
};
const ENGINES = { catch: catchGame, rhythm: rhythmGame, runner: runnerGame, reveal: revealGame, beam: beamGame, balance: balanceGame, echo: echoGame, connect: connectGame, pop: popGame, stack: stackGame, sort: sortGame };
for (const set of [CATCH, RHYTHM, RUNNER, REVEAL, BEAM, BALANCE, ECHO, CONNECT, POP, STACK, SORT]) for (const [id, cfg] of Object.entries(set)) {
  const make = ENGINES[cfg.engine];
  if (make && !GAMES[id]) GAMES[id] = () => make({ ...cfg, id });
}
