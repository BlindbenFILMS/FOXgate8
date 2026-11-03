// 8 GATES · SPACE SHIPYARD (s375): the 2D RESEARCH ladders + PROGRAMMES verbatim (names, steps, lines, costs in gold).
// soon: true = listed but not working yet (scanner needs the survey, skimmer needs the green gas shoals).
export const RESEARCH = {
 "wrate": {
  "n": "FIRE RATE",
  "grp": "weapon",
  "max": 3,
  "step": "+18% rate on EVERY gun, +12% cell turnaround",
  "d": "A shorter beat between volleys — and a reactor that keeps up with it. Every weapon you carry fires on this clock, not only the lasers.",
  "cost": [
   180,
   450,
   1100
  ]
 },
 "wreach": {
  "n": "RANGE",
  "grp": "weapon",
  "max": 2,
  "step": "+20% range",
  "d": "Tighter collimation. Every gun you carry throws further.",
  "cost": [
   250,
   800
  ]
 },
 "wpower": {
  "n": "POWER",
  "grp": "weapon",
  "max": 5,
  "step": "+18% damage, a heavier beam",
  "d": "More energy down the same barrel. You can see it: the beam thickens with every tier.",
  "cost": [
   200,
   420,
   900,
   1900,
   4000
  ]
 },
 "fuel": {
  "n": "FUEL",
  "grp": "fuel",
  "max": 5,
  "step": "-8% burn",
  "d": "Cleaner injection and a tighter loop. Every hull drinks less for the same distance.",
  "cost": [
   150,
   320,
   700,
   1500,
   3200
  ]
 },
 "shield": {
  "n": "SHIELDS",
  "grp": "shield",
  "max": 5,
  "step": "+20% bank",
  "d": "A denser weave. Your shield bank holds more before it collapses.",
  "cost": [
   180,
   380,
   820,
   1750,
   3700
  ]
 },
 "hull": {
  "n": "HULL",
  "grp": "hull",
  "max": 8,
  "step": "+9 HP",
  "d": "Deeper frames and layered plate. Raw hit points, on every hull in the group.",
  "cost": [
   120,
   220,
   400,
   720,
   1300,
   2300,
   4100,
   7300
  ]
 },
 "speed": {
  "n": "SPEED",
  "grp": "speed",
  "max": 3,
  "step": "+6% thrust",
  "d": "Rebalanced drives. You were already faster than they are — this is the margin.",
  "cost": [
   220,
   560,
   1400
  ]
 },
 "scanner": {
  "n": "SCANNER",
  "grp": "scanner",
  "max": 3,
  "step": "+50% scan reach, alerts",
  "d": "You see further, and the boards shout about it: unsurveyed worlds, hidden depots, drifting wrecks.",
  "cost": [
   160,
   400,
   1000
  ]
 },
 "cargo": {
  "n": "CARGO SPACE",
  "grp": "cargo",
  "max": 3,
  "step": "+2 crates/hull",
  "d": "Lighter bracing. Two more crates in every hull of the group.",
  "cost": [
   150,
   380,
   950
  ]
 },
 "skim": {
  "n": "GAS SKIMMER",
  "grp": "skim",
  "max": 3,
  "step": "+fuel from green gas",
  "d": "Intake vanes and a cracking stack. The green shoals out past the edge are fuel nobody has ever bothered to lift — hold still inside one and this lifts it. The only refuelling in the game that does not need a depot.",
  "cost": [
   240,
   600,
   1500
  ]
 },
 "special": {
  "n": "SPECIAL WEAPONS",
  "grp": "special",
  "max": 3,
  "step": "+18% damage",
  "d": "Heavier charges in the bought weapons — whichever ones you fly with. Their rate of fire is not bought here: every gun beats on the lasers’ clock, so FIRE RATE speeds all of them, and the cells decide the rest.",
  "cost": [
   260,
   660,
   1650
  ]
 }
};
export const PROGRAMMES = [
 {
  "k": "weapon",
  "n": "STANDARD WEAPON",
  "keys": [
   "wrate",
   "wreach",
   "wpower"
  ],
  "d": "Your twin lasers: how fast, how far, how hard."
 },
 {
  "k": "fuel",
  "n": "FUEL",
  "keys": [
   "fuel"
  ],
  "d": "Range between refuels."
 },
 {
  "k": "shield",
  "n": "SHIELDS",
  "keys": [
   "shield"
  ],
  "d": "How much you can take before the bubble goes."
 },
 {
  "k": "hull",
  "n": "HULL",
  "keys": [
   "hull"
  ],
  "d": "Hit points. The longest ladder in the yard."
 },
 {
  "k": "speed",
  "n": "SPEED",
  "keys": [
   "speed"
  ],
  "d": "Thrust, and the option to leave."
 },
 {
  "k": "scanner",
  "n": "SCANNER",
  "keys": [
   "scanner"
  ],
  "d": "What you notice, and what shouts at you."
 },
 {
  "k": "cargo",
  "n": "CARGO SPACE",
  "keys": [
   "cargo"
  ],
  "d": "Crates per hull, across the whole group."
 },
 {
  "k": "skim",
  "n": "GAS SKIMMER",
  "keys": [
   "skim"
  ],
  "d": "Fuel out of the green shoals, with no depot in it."
 },
 {
  "k": "special",
  "n": "SPECIAL WEAPONS",
  "keys": [
   "special"
  ],
  "d": "Every bought weapon, upgraded at once."
 }
];
const KEY = 'spaceResearch';
export function tiers(save) { const r = save.stat(KEY, null); return { ...Object.fromEntries(Object.keys(RESEARCH).map(k => [k, 0])), ...(r && typeof r === 'object' ? r : {}) }; }
export function buyTier(save, k) { const R = RESEARCH[k], T = tiers(save), t = T[k] || 0; if (!R || R.soon || t >= R.max) return false; if (!save.spend(R.cost[t])) return false; T[k] = t + 1; save.setStat(KEY, T); return true; }
// what each tier does to the ship
export function shipMods(T) { return { rate: 1 + 0.18 * T.wrate, reach: 1 + 0.2 * T.wreach, power: 1 + 0.18 * T.wpower, burn: 1 - 0.08 * T.fuel, shield: 1 + 0.2 * T.shield, hull: 100 + 9 * T.hull, speed: 1 + 0.06 * T.speed, cargo: 2 * T.cargo, special: 1 + 0.18 * T.special }; }
