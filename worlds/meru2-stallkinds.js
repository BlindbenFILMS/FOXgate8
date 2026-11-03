// MERU 2.0 — s174 MARKET STALL KINDS: shared by worlds/meru2-market.js (the goods + name board) and Market Stall Workshop.dc.html (the plan).
// shape = goods piece in each crate: ico (round produce), jar, box, cone, loaf, flat. y = lift above the crate top.
export const STALL_KINDS = [
  { key: 'fruit', label: 'FRUIT + VEG', shape: 'ico', cols: ['#ec3013', '#f59e0b', '#16a34a', '#facc15', '#7a3f6b', '#fb923c'] },
  { key: 'flowers', label: 'FLOWERS', shape: 'cone', cols: ['#f472b6', '#c084fc', '#f3f2f2', '#facc15', '#ec3013'], flip: true },
  { key: 'bakery', label: 'BAKERY', shape: 'loaf', cols: ['#c98a4b', '#a86a32', '#e0b070', '#8a5326'] },
  { key: 'fish', label: 'CAPSULES · FISH FRIENDS', sign: 'CAPSULE CORNER · FISH', capsule: { pack: 'fish', name: 'FISH FRIENDS', col: '#1d8fb8', dark: '#0e4f66', balls: ['#38bdf8', '#f97316', '#facc15', '#a855f7', '#f3f2f2'] }, shape: 'flat', cols: ['#1d8fb8', '#9aa8b2'] },
  { key: 'cheese', label: 'CAPSULES · CHEESE CHUMS', sign: 'CAPSULE CORNER · CHEESE', capsule: { pack: 'cheese', name: 'CHEESE CHUMS', col: '#e0a020', dark: '#8a5a10', balls: ['#fde047', '#f59e0b', '#dc2626', '#f3f2f2', '#4f6b8f'] }, shape: 'jar', cols: ['#e0a020', '#f5d04a'], squat: true },
  { key: 'honey', label: 'HONEY + JAM', shape: 'jar', cols: ['#e0a020', '#c97a10', '#b3261e', '#7a3f6b'] },
  { key: 'pottery', label: 'POTTERY', shape: 'jar', cols: ['#b8643a', '#2e4a6b', '#e7e1d4', '#8a5a34'], tall: true },
  { key: 'books', label: 'BOOKS', shape: 'box', cols: ['#2e4a6b', '#b3261e', '#3f7a52', '#e0a020', '#201e1d'], upright: true },
  { key: 'toys', label: 'TOYS', shape: 'box', cols: ['#ec3013', '#38bdf8', '#facc15', '#16a34a'] },
  { key: 'hats', label: 'HATS', shape: 'cone', cols: ['#201e1d', '#ec3013', '#2e4a6b', '#c9b28a'] },
  { key: 'spices', label: 'SPICES + TEA', shape: 'jar', cols: ['#b3261e', '#e0a020', '#7a4a2a', '#3f7a52'], small: true },
];
// s174d GAME STALLS (Ben: the 6 stalls round the capsule stalls become games, a fox keeper at each). game.url opens in the panel for now; in-world play next.
const G = (key, label, sign, url, keeper, col) => ({ key, label, sign, game: { key, url, keeper }, col, shape: 'box', cols: [col] });
STALL_KINDS.push(
  G('coconut', 'GAME · COCONUT SHY', 'COCONUT SHY · 3 BALLS', 'Carnival%20Coconut%20Shy.dc.html?embed=1', { name: 'COCO', torso: '#3f7a52', outfit: 'vest' }, '#3f7a52'),
  G('whack', 'GAME · WHACK-A-MOLE', 'WHACK-A-MOLE', 'Whack-a-Mole.dc.html?embed=1', { name: 'MOLLY', torso: '#7a4a2a', outfit: 'dress', female: true }, '#7a4a2a'),
  G('pachinko', 'GAME · PACHINKO', 'FOX GATE PACHINKO', 'Fox%20Gate%20Pachinko.dc.html?embed=1', { name: 'PIN', torso: '#ec3013', outfit: 'vest' }, '#ec3013'),
  G('liars', 'GAME · LIAR\u2019S DICE', 'LIAR\u2019S DICE', 'Liars%20Dice.dc.html?embed=1', { name: 'FIBBS', torso: '#201e1d', outfit: 'suit' }, '#201e1d'),
  G('shutbox', 'GAME · SHUT THE BOX', 'SHUT THE BOX', 'Shut%20the%20Box.dc.html?embed=1', { name: 'TILLY', torso: '#2e4a6b', outfit: 'dress', female: true }, '#2e4a6b'),
  G('dominoes', 'GAME · DOMINOES', 'DOMINOES', 'Dominoes%20Club.dc.html?embed=1', { name: 'DOMINIC', torso: '#e0a020', outfit: 'vest' }, '#8a5a10'));
// default kind per stall index (Market Stall Workshop can change any)
export const STALL_DEFAULT = ['coconut', 'whack', 'pachinko', 'fish', 'cheese', 'liars', 'shutbox', 'dominoes'];
export const STALL_KEY = 'meru2.stalls';        // { off: [i], sells: { i: kind } } (Market Stall Workshop)
export const STALL_SPOTS = 'meru2.stallSpots';  // [[x, z, ry]] written by the game each build, read by the workshop
