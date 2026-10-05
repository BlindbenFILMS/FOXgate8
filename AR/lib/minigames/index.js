// Mini games that live inside a painting, keyed by the artwork's id in artworks.js.
// When the gallery finds one of these paintings it shows a "Play the game" button.
// To add one: write a module like napkins.js (start / update / pointer / pause / resume / stop) and list it here.
import { napkinsGame } from './napkins.js';
import { almostBlindnessGame } from './almost-blindness.js';
import { walkThroughFearGame } from './walk-through-fear.js';
import { curatingHopeGame } from './curating-hope.js';

export const GAMES = {
  'napkin-please': napkinsGame,
  'almost-blindness': almostBlindnessGame,
  'walk-through-fear': walkThroughFearGame,
  'curating-hope': curatingHopeGame,
};
