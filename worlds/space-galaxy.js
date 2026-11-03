// 8 GATES · SPACE MAP galaxy data, taken from the 2D map (uploads/src-1792777595613-krp0.html = Space_world__asteroids_touch_350.html).
// 2D units × 0.1 = 3D units, then × SPREAD (Ben s380: planets 20 % further apart). x = east, z = south (2D y).
// The 2D '8g' PLAYER world is now SHASTA (Ben s348). 4 new player planets P1-P4 (Ben, s369): no dock yet, the players build one.
// s380 THE GRID (Ben: "a point of interest in equally distanced spaces, no pockets of empty space until you fly out far"):
// everything sits on one lattice of NODE = half a world cell (224 u). Every free node out to 1300 u holds something; past that a
// node every 2 lattice steps out to 2400 u. Frontier worlds + pirate bases are snapped onto the lattice too.
export const SPREAD = 1.2;
export const CELL = 493;                  // 373 × 1.2 = 448, s441 (Ben) +10 % = 493
export const NODE = CELL / 2;             // 224: the lattice step
const C = CELL, S = 0.1 * SPREAD;
// url = the world's 3D page (DOCK goes straight there). null = no 3D page yet → the dock is LOCKED.
export const WORLDS = [
  { key: 'shasta', name: 'SHASTA', x: -C, z: -C, r: 24, tint: '#e8eef7', look: 'snow', dock: true, url: null, lore: 'Snow world, high mountains. Clubhouse 8.' },
  { key: 'luxor', name: 'LUXOR', x: 0, z: -C, r: 24, tint: '#e0574a', look: 'desert', dock: true, url: null },
  { key: 'ur', name: 'UR', x: C, z: -C, r: 24, tint: '#e8963a', look: 'canyon', dock: true, url: null },
  { key: 'gaya', name: 'GAYA', x: -C, z: 0, r: 24, tint: '#a97bdd', look: 'terrace', dock: true, url: null },
  { key: 'meru', name: 'MERU', x: 0, z: 0, r: 24, tint: '#b9bec7', look: 'stone', ring: '#e2ecfc', dock: true, url: 'FOXGATE8-PLAYABLE.dc.html' },
  { key: 'zion', name: 'ZION', x: C, z: 0, r: 24, tint: '#e8cf4a', look: 'salt', dock: true, url: null },
  { key: 'nebo', name: 'NEBO', x: -C, z: C, r: 24, tint: '#5aa6e8', look: 'ocean', dock: true, url: null },
  { key: 'kufa', name: 'KUFA', x: 0, z: C, r: 24, tint: '#b08355', look: 'dunes', ring: '#c08a4a', dock: true, url: null },
  { key: 'jidda', name: 'JIDDA', x: C, z: C, r: 24, tint: '#5ec97e', look: 'jungle', dock: true, url: null },
  // the 4 multiplayer home planets (Ben s369): P1 north of Luxor, P2 west of Gaya, P3 south of Kufa, P4 east of Zion. Players name them.
  // s599 DEFAULT NAMES (Ben: sacred cities, letters no other world uses; all can be renamed): P1 EPHRAIM · P2 BABEL · P3 DELOS · P4 AKSUM.
  // Frontier: BETA 1 → IONA · BETA 2 → QOM · BETA 3 → ERIDU · BETA 4 → CUSCO · EARTH stays EARTH. Spare names: PURI, HARAR.
  { key: 'p1', name: 'EPHRAIM', x: 0, z: -2 * C, r: 20, tint: '#7fd0d8', look: 'fresh', dock: true, url: 'Player Planet.dc.html', player: 1 },   // s519: P1 = the player planet (Player Planet.dc.html); its landing pad is the dock
  { key: 'p2', name: 'BABEL', x: -2 * C, z: 0, r: 20, tint: '#9fd87f', look: 'fresh', dock: false, player: 2 },
  { key: 'p3', name: 'DELOS', x: 0, z: 2 * C, r: 20, tint: '#d8a07f', look: 'fresh', dock: false, player: 3 },
  { key: 'p4', name: 'AKSUM', x: 2 * C, z: 0, r: 20, tint: '#c79fe0', look: 'fresh', dock: false, player: 4 },
];
const snap = v => Math.round(v / NODE) * NODE;
// FRONTIER (2D FRONTIER: brg = compass bearing, dist in 2D units), snapped to the lattice. Uncharted, no docks. Earth: no dock (decided).
const pol = (brg, d) => { const a = (brg - 90) * Math.PI / 180; return { x: snap(Math.cos(a) * d * S), z: snap(Math.sin(a) * d * S) }; };
export const FRONTIER = [
  { key: 'beta1', name: 'IONA', ...pol(200, 11200), r: 20, tint: '#5aa6e8', look: 'ice', trait: 'Ocean under a thin crust of ice.', extra: 'icering' },
  { key: 'beta2', name: 'QOM', ...pol(38, 12200), r: 21, tint: '#7a6a5a', look: 'dunes', trait: 'Held. Black hulls in the low lane.', extra: 'held' },
  { key: 'beta3', name: 'ERIDU', ...pol(285, 13500), r: 19, tint: '#e0574a', look: 'iron', trait: 'Iron core, no air.', extra: 'iron' },
  { key: 'beta4', name: 'CUSCO', ...pol(120, 16400), r: 20, tint: '#e8cf4a', look: 'gem', trait: 'Gem seams open to the sky.', extra: 'gems' },
  { key: 'earth', name: 'EARTH', ...pol(330, 18600), r: 24, tint: '#5ec97e', look: 'earth', trait: 'Green. Actually green.', extra: 'earth' },
];
// PIRATE BASES (2D PIRATE_PORTS + seedPirateBases: HP 2200, a garrison, a HELD DEPOT 700 2D units off in double rust gas).
export const PIRATES = [
  { name: 'KRASS', ...pol(62, 9200), brg: 62 }, { name: 'GIBET', ...pol(170, 10800), brg: 170 }, { name: 'MURK', ...pol(300, 10200), brg: 300 }, { name: 'THRAX', ...pol(245, 12000), brg: 245 },
];
export const PIRATE_BASE_HP = 2200;
// THE MACHINE YARD (2D MACHINE_BERTH 1300,-1675 = "It is MERU'S. Their yards built it, their gate broke it"): snapped to the lattice node
// north-east of Meru, inside the teal nebula. A standing guard of 4 hacked machines (2D: gunners + cruisers at 180-300) circles it.
export const MACHINE_YARD = { key: 'myard', name: 'THE MACHINE YARD', x: NODE, z: -NODE, guard: [22, 27, 32, 37] };
// CREATURE NESTS (2D seedTheDeep NESTS, 9400 2D units out, 120° apart, fixed bearings in radians). Each is a PLACE: an unbreakable
// core rock with a glowing mouth, 8 big rocks (prizes) + 16 small ones on two rings turning opposite ways, a WATCH of 3 beasts
// circling it and a GARRISON of 3 more that come out of the mouth when you break rock. Beasts: maw = STARSERPENT (our Belt Serpent),
// lancer = VOIDMOTH (our giant Void Moth), spitter = DEEPHAND (our Octopus).
const nestAt = a => ({ x: snap(Math.cos(a) * 9400 * S), z: snap(Math.sin(a) * 9400 * S) });
export const NESTS = [
  { key: 'hollow', name: 'THE HOLLOW', fam: 'belt', beasts: 'STARSERPENTS', tint: '#fdba74', ...nestAt(2.35) },
  { key: 'lantern', name: 'THE LANTERN HOUSE', fam: 'vmoth', beasts: 'VOID MOTHS', tint: '#f0abfc', ...nestAt(2.35 + Math.PI * 2 / 3) },
  { key: 'cistern', name: 'THE CISTERN', fam: 'octo', beasts: 'DEEPHANDS', tint: '#5eead4', ...nestAt(2.35 + Math.PI * 4 / 3) },
];
export const NEST = { core: 26, ringA: 94, ringB: 142, big: 8, small: 16, bigHp: 34, watchR: 56, garrison: 3, wake: 420, sleep: 560, leash: 312, regrowMs: 5 * 60 * 1000 };
// s385 (Ben): each world gets its OWN uniquely shaped STATION, built one by one. DEEP SPACE FOX = MERU's station (its interior is
// built: Deep Space Fox.dc.html). KUFA STATION = Kufa's (interior built in s350: worlds/dsf-kufa.js, opened with ?at=kufa).
// A station sits south-east of its world (+112, +112). tkey = the world whose treaty it follows.
const ST_OFF = 112;
// SIZE RULE (Ben, s404): MERU's Deep Space Fox is the BIGGEST + grandest station. Every other station is at least 33 % smaller
// (on the map: footprint AND height ≤ 67 % of DSF's) and less grand (fewer guns, simpler). Measured s404 (solid meshes, model units):
// s405 (all on the DSF design): DSF 54.2 wide × 19.4 tall · Shasta 27.8 × 15.8 · Luxor 34.1 × 12 · Ur 37.6 × 14.1 · Gaya 26.3 × 11.2 · Zion 28.3 × 11
// · Nebo 28.3 × 16.7 · Jidda 29.2 × 17.8 · Kufa 55.1 × 12.9 → sc = 0.95 × min(0.67 × DSF width / w, 0.67 × DSF height / h), max 0.9.
export const STATION_MAX = 0.67;
export const STATIONS = [
  { key: 'dsf', world: 'meru', tkey: 'meru', type: 'dsf', name: 'DEEP SPACE FOX', sub: 'MERU STATION · OPEN', x: ST_OFF, z: ST_OFF, url: 'Deep Space Fox.dc.html', sc: 0.9, y: -8 },
  { key: 'shastaSt', world: 'shasta', tkey: 'shasta', type: 'shastaStation', name: 'SHASTA STATION', sub: 'SHASTA STATION · OPEN', x: -C + ST_OFF, z: -C + ST_OFF, url: 'Deep Space Fox.dc.html?at=shasta', sc: 0.7, y: -6 },
  { key: 'luxorSt', world: 'luxor', tkey: 'luxor', type: 'luxorStation', name: 'LUXOR STATION', sub: 'LUXOR STATION · OPEN', x: ST_OFF, z: -C - ST_OFF, url: 'Deep Space Fox.dc.html?at=luxor', sc: 0.9, y: -6 },   // NE of Luxor: SE would crowd the Machine Yard
  { key: 'urSt', world: 'ur', tkey: 'ur', type: 'urStation', name: 'UR STATION', sub: 'UR STATION · OPEN', x: C + ST_OFF, z: -C + ST_OFF, url: 'Deep Space Fox.dc.html?at=ur', sc: 0.79, y: -6 },
  { key: 'gayaSt', world: 'gaya', tkey: 'gaya', type: 'gayaStation', name: 'GAYA STATION', sub: 'GAYA STATION · OPEN', x: -C + ST_OFF, z: ST_OFF, url: 'Deep Space Fox.dc.html?at=gaya', sc: 0.9, y: -6 },
  { key: 'zionSt', world: 'zion', tkey: 'zion', type: 'zionStation', name: 'ZION STATION', sub: 'ZION STATION · OPEN', x: C + ST_OFF, z: ST_OFF, url: 'Deep Space Fox.dc.html?at=zion', sc: 0.9, y: -6 },
  { key: 'neboSt', world: 'nebo', tkey: 'nebo', type: 'neboStation', name: 'NEBO STATION', sub: 'NEBO STATION · OPEN', x: -C + ST_OFF, z: C + ST_OFF, url: 'Deep Space Fox.dc.html?at=nebo', sc: 0.66, y: -6 },
  { key: 'jiddaSt', world: 'jidda', tkey: 'jidda', type: 'jiddaStation', name: 'JIDDA STATION', sub: 'JIDDA STATION · OPEN', x: C + ST_OFF, z: C + ST_OFF, url: 'Deep Space Fox.dc.html?at=jidda', sc: 0.62, y: -6 },
  { key: 'kufaSt', world: 'kufa', tkey: 'kufa', type: 'kufaStation', name: 'KUFA STATION', sub: 'KUFA STATION · OPEN', x: ST_OFF, z: C + ST_OFF, url: 'Deep Space Fox.dc.html?at=kufa', sc: 0.58, y: -6 },
];
export const DSF = STATIONS[0];
// 2D INSTALLS round each charted world (dock ABOVE the planet, Ben s369). s380 (Ben): mine, stargate + shipyard TWICE as far out
// (so the swoop has room round each). The mine lands on the half-way lattice node between two worlds.
export const INSTALLS = {
  mine: { label: 'MINE', dx: -224, dz: 0, col: '#f59e0b' },
  yard: { label: 'SHIPYARD', dx: 0, dz: -128, col: '#7dd3fc' },
  fuel: { label: 'FUEL DEPOT', dx: 0, dz: 128, col: '#6ee7b7' },
  gate: { label: 'STARGATE', dx: -104, dz: -104, col: '#93c5fd' },
};
// NEBULAE: the 2D gasA0-3 clouds (they sit on the 4 inner diagonal nodes) + 3 deep ones. One colour per region (Ben).
export const NEBULAE = [
  { x: -NODE, z: -NODE, rx: 232, rz: 160, col: ['#7ec4ff', '#3a5cff'] },
  { x: NODE, z: NODE, rx: 262, rz: 175, col: ['#ff9e60', '#ff3d6e'] },
  { x: NODE, z: -NODE, rx: 246, rz: 149, col: ['#68e2c4', '#2a9dff'] },
  { x: -NODE, z: NODE, rx: 223, rz: 168, col: ['#d66eec', '#7a3dff'] },
  { x: -4 * NODE, z: -3 * NODE, rx: 312, rz: 216, col: ['#ffd23a', '#ff7a2a'] },
  { x: 4 * NODE, z: -4 * NODE, rx: 288, rz: 204, col: ['#ff5a7a', '#a03dff'] },
  { x: NODE, z: 5 * NODE, rx: 336, rz: 192, col: ['#5affc8', '#2a6bff'] },
];
// ---------- THE DEEP (2D seedTheDeep, verbatim names + log lines) ----------
export const KNOWN_EDGE = 6800 * S;      // 816: the limit of the Fox survey
export const BUOY_NOTES = [
  'LOG: WE LAID THE FIRST LIGHT AND TURNED FOR HOME. FUEL',
  'LOG: SECOND RUN, FURTHER. THE TANK IS THE WHOLE PROBLEM',
  'LOG: NAMED THIS ONE FOR MY SISTER. SHE WOULD LAUGH',
  'LOG: NOTHING OUT HERE. NOTHING IS ALSO A RESULT',
  'LOG: THE NINE SAY THERE IS NO OUTSIDE. WE ARE MEASURING IT',
  'LOG: ENOUGH MARKERS NOW TO SEE OUR OWN LINE FROM OUT HERE',
  'LOG: A ROCK WITH MACHINED FACES. WE LOGGED IT AND SAID NOTHING',
  'LOG: THE LINE IS BENDING. A STRAIGHT LINE SHOULD NOT BEND',
  'LOG: MET A FLEET PATROL AT THE EDGE. THEY LET US THROUGH',
  'LOG: WE ARE BEING FOLLOWED. THE MARKERS ARE HOW',
  'LOG: LOST WICK, AND THE THREE ABOARD HER. LIT HER BUOY ANYWAY',
  'LOG: THEY ARE PUTTING BAIT ON OUR OWN LIGHTS NOW',
  'LOG: KEEP GOING. EVERY LIGHT IS A ROOM WE HAVE ALREADY SEEN',
  'LOG: SOMETHING ANSWERED THE BEACON. NOT IN WORDS',
  'LOG: FUEL FOR ONE MORE HOP OUT, OR TWO HOPS HOME',
  'LOG: WE CHOSE OUT',
  'LOG: THERE IS A GREEN WORLD AHEAD. IT IS REAL AND IT IS FAR',
  'LOG: IT HAS AN OLD NAME AND EVERY ONE OF US KNEW IT',
  'LOG: WE WILL NOT REACH IT. WE ARE MARKING THE ROAD INSTEAD',
  'LOG: IF YOU ARE READING THE LIGHTS, THE ROAD IS YOURS',
  'LOG: GO TO EARTH. WE GOT YOU AS FAR AS WE COULD',
];
export const RELIC_NOTES = [
  'NOTE: THE ALLOY IS NOT FROM ANY OF THE NINE',
  'NOTE: MACHINED SURFACES. SOMEONE BUILT THIS',
  'NOTE: SAME ALLOY, SECOND SITE, 9,000 UNITS APART',
  'NOTE: FOX OBSERVATORY LOGS A STAR CATALOGUED TWICE',
  'NOTE: THE TWO ENTRIES DIFFER ONLY IN BEARING',
  'NOTE: SURVEY TRIANGLES CLOSE AT 180 DEGREES. SPACE IS FLAT',
  'NOTE: FLAT, FINITE AND WITHOUT EDGE. THAT COMBINATION IS NOT NATURAL',
  'NOTE: THE OLD TEXTS SAID THE PATH IS ENDLESS. THEY DID NOT SAY THE ROOM WAS',
  'NOTE: THE NINE SIT ON A PERFECT LATTICE. NOTHING NATURAL DOES THAT',
  'NOTE: IF THE ROOM WAS BUILT, THERE IS AN OUTSIDE. FIND THE FOLD',
];
const FIND_NAMES = ['ACHERON', 'VESTIBULE', 'THE STILLS', 'KETTLE', 'LONG WAKE', 'ORPHAN', 'GHOST BANK', 'THE SIEVE', 'CINDER', 'TALLOW DRIFT', 'HOLLOW', 'SALT REACH', 'BRIAR', 'THE GRIST', 'PALE HOUR',
  'WIDOWS WALK', 'LANTERN', 'THE CROP', 'SPINDLE', 'ASHFALL', 'QUIET MOUTH', 'THE LEDGER', 'MARROW', 'COLD HARBOUR', 'THE TALLY', 'WICK', 'NINE SISTERS', 'THE FURROW', 'EMBERLINE', 'SLACK WATER'];
// 2D wisps: the colour IS the information. BLUE cover · GREEN skimmable fuel · YELLOW bleeds energy · VIOLET deep murk.
export const GAS = {
  cover: { name: 'COLD DRIFT', col: ['#9fd2ff', '#3a6fd8'], sub: 'Cover. Pirates lose you in here.' },
  skim: { name: 'FUEL SHOAL', col: ['#9dffb8', '#2fae5a'], sub: 'Green gas. A GAS SKIMMER lifts fuel here.' },
  ion: { name: 'ION HAZE', col: ['#fff07a', '#d8a020'], sub: 'Bleeds your energy.' },
  dark: { name: 'DEEP MURK', col: ['#c79bff', '#5a2aa8'], sub: 'Something lives in the dark ones.' },
  held: { name: 'HELD GAS', col: ['#e6b183', '#b06a3e'], sub: 'Rust gas. Pirates skim it.' },
};
// seeded RNG so every node keeps the same thing between sessions (found flags are keyed by id)
let sd = 80880; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
export function buildDeep() {
  sd = 80880;
  const taken = [];
  const take = (x, z, r = 110) => taken.push({ x, z, r });
  WORLDS.forEach(w => { take(w.x, w.z, 130); if (w.dock) for (const I of Object.values(INSTALLS)) take(w.x + I.dx, w.z + I.dz, 100); });
  STATIONS.forEach(s => take(s.x, s.z, 120)); NESTS.forEach(n => take(n.x, n.z, 260)); FRONTIER.forEach(w => take(w.x, w.z, 150)); PIRATES.forEach(p => take(p.x, p.z, 160));
  NEBULAE.forEach(n => take(n.x, n.z, Math.min(n.rx, n.rz) * 0.6));
  const free = (x, z) => !taken.some(t => Math.hypot(t.x - x, t.z - z) < t.r);
  const nodes = [];
  for (let i = -11; i <= 11; i++) for (let j = -11; j <= 11; j++) { const x = i * NODE, z = j * NODE, r = Math.hypot(x, z);
    if (r > 2400) continue; if (r > 1300 && (i % 2 || j % 2)) continue; if (free(x, z)) nodes.push({ x, z, r }); }
  const near = nodes.filter(n => n.r <= KNOWN_EDGE - 40), deep = nodes.filter(n => n.r > KNOWN_EDGE - 40);
  const out = [], jit = () => (rnd() - 0.5) * 36;
  // charted space: NAV BUOYS on the lanes, small rock fields, fuel shoals
  near.forEach((n, k) => { const kind = ['nav', 'debris', 'wisp'][k % 3]; out.push({ kind, id: kind + '_c' + k, x: n.x + jit(), z: n.z + jit(), gas: kind === 'wisp' ? 'skim' : null, charted: true }); });
  // the deep: the 2D counts. buoys in the near band, wrecks further out, then derelicts + wisps, the rest debris fields
  const pick = (lo, hi, safe) => { let c = deep.filter(n => !n.used && n.r >= lo && n.r <= hi && (!safe || n.portSafe)); if (!c.length) c = deep.filter(n => !n.used); if (!c.length) return null; const n = c[(rnd() * c.length) | 0]; n.used = true; return n; };
  // 2D clearBuoys: a buoy never sits on a pirate base's doorstep (2D 3200 → 380 u)
  deep.forEach(n => { n.portSafe = PIRATES.every(p => Math.hypot(p.x - n.x, p.z - n.z) > 380) && NESTS.every(p => Math.hypot(p.x - n.x, p.z - n.z) > 360); });
  const first = deep.filter(n => !n.used && n.portSafe).sort((a, b) => a.r - b.r)[0]; if (first) { first.used = true; out.push({ kind: 'buoy', id: 'buoy_first', name: 'FIRST LIGHT', primer: true, x: first.x, z: first.z }); }
  for (let i = 0; i < 20; i++) { const n = pick(KNOWN_EDGE, 1800, true); if (n) out.push({ kind: 'buoy', id: 'buoy_' + i, name: FIND_NAMES[i % FIND_NAMES.length], bait: i % 5 === 3, x: n.x + jit(), z: n.z + jit() }); }
  for (let i = 0; i < 10; i++) { const n = pick(1100, 2400); if (n) out.push({ kind: 'wreck', id: 'wreck_' + i, name: FIND_NAMES[(i + 11) % FIND_NAMES.length] + ' WRECK', value: 700 + Math.floor(rnd() * 900), x: n.x + jit(), z: n.z + jit(), rot: i * 0.83 }); }
  for (let i = 0; i < 11; i++) { const n = pick(KNOWN_EDGE + 60, 2400); if (n) out.push({ kind: 'derelict', id: 'der_' + i, x: n.x + jit(), z: n.z + jit(), rot: rnd() * 6.28, len: i === 0 || i === 6 ? 22 : 12 + rnd() * 6 }); }
  const WG = ['cover', 'skim', 'ion', 'dark'];
  for (let i = 0; i < 22; i++) { const n = pick(KNOWN_EDGE, 2400); if (n) out.push({ kind: 'wisp', id: 'wisp_' + i, gas: WG[i % 4], lair: WG[i % 4] === 'dark' && i % 8 === 3, x: n.x + jit(), z: n.z + jit() }); }
  deep.filter(n => !n.used).forEach((n, k) => out.push({ kind: 'debris', id: 'deb_' + k, x: n.x + jit(), z: n.z + jit() }));
  // sizes + per-item seeds
  out.forEach(o => { o.seed = rnd(); if (o.kind === 'wisp') o.r = o.charted ? 46 + rnd() * 20 : 62 + rnd() * 55; if (o.kind === 'debris') o.r = o.charted ? 20 : 26 + rnd() * 12; });
  return out;
}
export const START_KEY = 'p1';            // first time ever: above P1 (Ben s369)
export const LAST_DOCK = 'space.lastDock.v1';
export const NAMES = 'space.planetNames.v1';
export const FINDS = 'space.finds.v1';     // { buoys:[id], logs:n, wrecks:[id], relics:n, surveyed:[key], razed:[name] }
