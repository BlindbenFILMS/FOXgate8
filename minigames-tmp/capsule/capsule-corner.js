// 8 GATES — CAPSULE CORNER (minigame #258 · any world, any building). Three bubble-capsule vending machines:
//   MUSCLE FOXES · MONSTER TRUCKS · CREATURES — 8 figures each (4 common, 2 rare, 1 super, 1 golden).
// Loop: pay (gold / free daily / 5 stars) → turn the crank (stop the chasing light on the ★ = LUCKY) → the capsule drops
// into the tray → tap it → twist it open → the figure pops out → it goes on your SHELF. Doubles give ★ stars.
// PARTY: up to 5 players online (engine/duel-net.js, local-tab fallback): 5 rounds, everyone turns at once, best pull scores.
// Shared files are only IMPORTED, never edited. Every save key starts with 'capsuleCorner.'.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE } from '../../fox-kit.js';
import { crestTex } from '../../engine/textures.js';
import { save } from '../../engine/save.js';
import { vehicleKit } from '../../engine/vehicle-kit.js';
import { creatureKit } from '../../engine/creature-kit.js';

export const GAME = 'capsuleCorner';
const SK = k => GAME + '.' + k;                       // save key helper
export const PRICE = 10;                              // DRAFT for Ben: gold per capsule
export const STAR_COST = 5;                           // DRAFT: stars for a free capsule
export const ROUNDS = 5, MAXP = 5;
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];

// ---------------------------------------------------------------- helpers (copied, shared files untouched)
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const pick = a => a[Math.floor(Math.random() * a.length)];
const easeOut = t => 1 - Math.pow(1 - t, 3), easeBack = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function makeGradient() { const d = new Uint8Array([70, 150, 220, 255]); const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

// ---------------------------------------------------------------- data
export const RARITY = {
  common: { key: 'common', name: 'COMMON', col: '#d7d3d3', fg: '#000000', pts: 1, odds: 60, lucky: 30, stars: 1 },
  rare: { key: 'rare', name: 'RARE', col: '#38bdf8', fg: '#000000', pts: 3, odds: 28, lucky: 40, stars: 1 },
  super: { key: 'super', name: 'SUPER', col: '#a855f7', fg: '#ffffff', pts: 6, odds: 10, lucky: 22, stars: 2 },
  golden: { key: 'golden', name: 'GOLDEN', col: '#ffd23a', fg: '#000000', pts: 12, odds: 2, lucky: 8, stars: 3 },
  vrare: { key: 'vrare', name: 'VERY RARE', col: '#ffb020', fg: '#000000', pts: 15, odds: 1, lucky: 4, stars: 4 },   // s481 station packs: 1 per machine, ~1 % (4 % lucky)
};
const GLD = r => r === 'golden' || r === 'vrare';
export const ALL_SERIES = [
  { id: 'muscle', name: 'MUSCLE FOXES', short: 'MUSCLE', col: '#ec3013', dark: '#8f1a08', light: '#ff8a70', line: 'Eight buff foxes. Flex, lift, win the belt.' },
  { id: 'truck', name: 'MONSTER TRUCKS', short: 'TRUCKS', col: '#1d6fe0', dark: '#0f3d80', light: '#7db4ff', line: 'Eight mini monster trucks with big squishy tyres.' },
  { id: 'creature', name: 'CREATURES', short: 'CREATURES', col: '#1f9d55', dark: '#0f5a30', light: '#7be0a5', line: 'Eight creatures from the wilds of the 8 GATES worlds.' },
  // s174 MERU MARKET PACKS (Ben): the FRESH FISH stall + the CHEESE stall are each a one-machine Capsule Corner (?pack=fish | ?pack=cheese)
  { id: 'fish', name: 'FISH FRIENDS', short: 'FISH', col: '#1d8fb8', dark: '#0e4f66', light: '#8fd8ef', line: 'Eight fish from Meru Lake and the deep sea.' },
  { id: 'cheese', name: 'CHEESE CHUMS', short: 'CHEESE', col: '#e0a020', dark: '#8a5a10', light: '#ffd98a', line: 'Eight cheeses with faces. Say cheese!' },
  // s481 SPACE STATION COLLECTABLES (Ben): two machines side by side on every station (?pack=space)
  { id: 'ships', name: 'STATIONS & STARSHIPS', short: 'SHIPS', col: '#1a3fb8', dark: '#0e2470', light: '#7db4ff', line: 'Eight ships and stations of the 8 GATES skies. One is VERY RARE.' },
  { id: 'rides', name: '8 GATES VEHICLES', short: 'VEHICLES', col: '#f2741f', dark: '#a2420c', light: '#ffb37a', line: 'Eight rides from all 8 worlds. One is VERY RARE.' },
];
export const PACKS = { classic: ['muscle', 'truck', 'creature'], fish: ['fish'], cheese: ['cheese'], space: ['ships', 'rides'] };
export const SERIES = ALL_SERIES.slice(0, 3);   // the machines in this room (createCapsuleCorner swaps them for opts.pack)
// Names + lines final (Ben s181: "feel free to name the foxes"). Creatures keep their creature-kit names (the 2D world names).
export const FIGS = [
  { id: 'm1', s: 'muscle', rar: 'common', name: 'FLEX FOX', line: 'Two arms up. Every day is arm day.', f: { fur: '#f2741f', furDark: '#c2410c', trunks: '#ec3013', band: '#ffffff', glove: '#f2741f', pose: 'double', mood: 'excited' } },
  { id: 'm2', s: 'muscle', rar: 'common', name: 'BENCH BANDIT', line: 'Steals the bench. Never gives it back.', f: { fur: '#9aa3ad', furDark: '#5b6470', fluff: '#eef1f4', muzzle: '#e2e6ea', snout: '#cfd5db', trunks: '#1d6fe0', band: '#ffd23a', glove: '#9aa3ad', pose: 'dumbbell', mood: 'smug' } },
  { id: 'm3', s: 'muscle', rar: 'common', name: 'IRON TAIL', line: 'Headband on. Hands on hips. Ready.', f: { fur: '#7a4a2a', furDark: '#4a2a14', trunks: '#201e1d', band: '#ec3013', glove: '#7a4a2a', pose: 'hips', headband: '#ec3013', mood: 'determined' } },
  { id: 'm4', s: 'muscle', rar: 'common', name: 'PROTEIN PUP', line: 'Shakes first, questions later.', f: { fur: '#f2c48a', furDark: '#c98f4a', fluff: '#fff6e8', trunks: '#22c55e', band: '#ffffff', glove: '#f2c48a', pose: 'one', shaker: true, mood: 'happy' } },
  { id: 'm5', s: 'muscle', rar: 'rare', name: 'ARCTIC CRUSHER', line: 'Cool shades. Cold stare. Warm heart.', f: { fur: '#f4f6fa', furDark: '#b9c3d0', fluff: '#ffffff', muzzle: '#ffffff', snout: '#e8edf3', trunks: '#38bdf8', band: '#0f3d80', glove: '#38bdf8', pose: 'double', glasses: 'sun', mood: 'smug' } },
  { id: 'm6', s: 'muscle', rar: 'rare', name: 'STAR SLAMMER', line: 'Cape on. Ring bell. Here he comes.', f: { fur: '#d9381e', furDark: '#8f1a08', trunks: '#ffd23a', band: '#201e1d', glove: '#ec3013', pose: 'one', cape: '#7c3aed', headband: '#ffd23a', mood: 'excited' } },
  { id: 'm7', s: 'muscle', rar: 'super', name: 'BARBELL BOSS', line: 'Lifts the heaviest bar in all 8 worlds.', f: { fur: '#2a2a33', furDark: '#121218', fluff: '#e5e7eb', muzzle: '#d4d4d8', snout: '#a1a1aa', trunks: '#a855f7', band: '#ffd23a', glove: '#a855f7', pose: 'bar', eye: '#ffd23a', mood: 'determined' } },
  { id: 'm8', s: 'muscle', rar: 'golden', name: 'GOLDEN GAINS', line: 'The champion. Gold fur, gold belt, gold crown.', f: { fur: '#e6b45a', furDark: '#a8792e', fluff: '#fff3c4', muzzle: '#fff3c4', snout: '#f6d38a', trunks: '#201e1d', band: '#e6b45a', glove: '#e6b45a', pose: 'double', belt: true, crown: true, gold: true, mood: 'excited' } },
  { id: 't1', s: 'truck', rar: 'common', name: 'RED RUMBLE', line: 'The classic. Flames on both sides.', f: { paint: '#ec3013', dark: '#b91c1c', trim: '#f3f2f2', accent: '#e6b45a' } },
  { id: 't2', s: 'truck', rar: 'common', name: 'MUD MUNCHER', line: 'Never been washed. Never will be.', f: { paint: '#7a5a3a', dark: '#4a3420', trim: '#c8b08a', accent: '#5b6b3a', flames: false, mud: true } },
  { id: 't3', s: 'truck', rar: 'common', name: 'BLUE BOOMER', line: 'You hear it before you see it.', f: { paint: '#1d6fe0', dark: '#0f3d80', trim: '#f3f2f2', accent: '#38bdf8' } },
  { id: 't4', s: 'truck', rar: 'common', name: 'LIME LOCO', line: 'Bright green. Bouncy. A little crazy.', f: { paint: '#7bd23a', dark: '#4a8a1a', trim: '#201e1d', accent: '#ffd23a' } },
  { id: 't5', s: 'truck', rar: 'rare', name: 'FOX FURY', line: 'Fox ears on the roof. Tail on the back.', f: { paint: '#f2741f', dark: '#c2410c', trim: '#ffffff', accent: '#ffffff', topper: 'fox' } },
  { id: 't6', s: 'truck', rar: 'rare', name: 'SHARK BITE', line: 'Fin up. Teeth out. Chomp the cars.', f: { paint: '#8a98a8', dark: '#4b5563', trim: '#f3f2f2', accent: '#ec3013', flames: false, topper: 'shark' } },
  { id: 't7', s: 'truck', rar: 'super', name: 'GALAXY GRINDER', line: 'Painted with stars from deep space.', f: { paint: '#5b2bc4', dark: '#2e1470', trim: '#38bdf8', accent: '#f472b6', topper: 'stars' } },
  { id: 't8', s: 'truck', rar: 'golden', name: 'GOLDEN GROWLER', line: 'Solid gold. The rarest truck there is.', f: { paint: '#e6b45a', dark: '#a8792e', trim: '#fff3c4', accent: '#fff3c4', gold: true, topper: 'horns' } },
  { id: 'c1', s: 'creature', rar: 'common', name: 'SPORELING', kit: 'Sporeling', line: 'A little mushroom with big feelings.' },
  { id: 'c2', s: 'creature', rar: 'common', name: 'EMBER', kit: 'Ember', line: 'Warm to hold. Do not hold it.' },
  { id: 'c3', s: 'creature', rar: 'common', name: 'HORNET', kit: 'Hornet', line: 'Buzzes in Nebo. Stings in Nebo.' },
  { id: 'c4', s: 'creature', rar: 'common', name: 'FLAMINGO', kit: 'Flamingo', line: 'Stands on one leg. All day.' },
  { id: 'c5', s: 'creature', rar: 'rare', name: 'CRYSTAL CRAB', kit: 'Crystal Crab', line: 'Gaya purple. Glowing geode on its back.' },
  { id: 'c6', s: 'creature', rar: 'rare', name: 'THORNBACK', kit: 'Thornback', line: 'A log with legs and a bad mood.' },
  { id: 'c7', s: 'creature', rar: 'super', name: 'THE PAINTED GIANT', kit: 'The Painted Giant', line: 'Every colour of the rainbow, all at once.' },
  { id: 'c8', s: 'creature', rar: 'golden', name: 'HIVE QUEEN', kit: 'Hive Queen', line: 'Queen of the hive, on her honey throne.' },
  // DRAFT names + lines for Ben (s174): FISH FRIENDS
  { id: 'f1', s: 'fish', rar: 'common', name: 'SARDINE SAM', line: 'Loves a crowd. Hates a tin.', f: { body: '#9fb3c2', belly: '#eef3f6', fin: '#6f8797', stripe: '#3d5a73', stripes: 1, h: 0.5 } },
  { id: 'f2', s: 'fish', rar: 'common', name: 'CLOWN CLAUDE', line: 'Tells the same joke every tide.', f: { body: '#f97316', belly: '#fdba74', fin: '#201e1d', stripe: '#ffffff', stripes: 3 } },
  { id: 'f3', s: 'fish', rar: 'common', name: 'BLUE TANG TESS', line: 'Forgets where she swam. Swims anyway.', f: { body: '#2563eb', belly: '#60a5fa', fin: '#facc15', stripe: '#1e1b4b', stripes: 0, h: 0.75 } },
  { id: 'f4', s: 'fish', rar: 'common', name: 'PUFFY', line: 'Do not make him nervous. Please.', f: { body: '#facc15', belly: '#fef3c7', fin: '#d97706', stripe: '#a16207', stripes: 0, kind: 'puffer' } },
  { id: 'f5', s: 'fish', rar: 'rare', name: 'OCTO OLLIE', line: 'Eight arms. Eight hugs. No waiting.', f: { body: '#a855f7', belly: '#e9d5ff', fin: '#7e22ce', kind: 'octo' } },
  { id: 'f6', s: 'fish', rar: 'rare', name: 'SWORDFISH SID', line: 'Fences for fun. Always wins.', f: { body: '#1e3a5f', belly: '#cbd5e1', fin: '#0f2440', stripe: '#38bdf8', stripes: 0, kind: 'sword', h: 0.5 } },
  { id: 'f7', s: 'fish', rar: 'super', name: 'GRINNING GUS', line: 'The shark with the biggest smile in the sea.', f: { body: '#64748b', belly: '#f1f5f9', fin: '#475569', stripes: 0, kind: 'shark', h: 0.55 } },
  { id: 'f8', s: 'fish', rar: 'golden', name: 'GOLDEN KOI', line: 'One wish. Choose it well.', f: { body: '#e6b45a', belly: '#fff3c4', fin: '#f6d38a', stripe: '#ec3013', stripes: 0, kind: 'koi', gold: true } },
  // DRAFT names + lines for Ben (s174): CHEESE CHUMS
  { id: 'k1', s: 'cheese', rar: 'common', name: 'CHEDDAR CHAD', line: 'Sharp. Mature. Still a big kid.', f: { col: '#f59e0b', side: '#d97706', shape: 'wedge' } },
  { id: 'k2', s: 'cheese', rar: 'common', name: 'SWISS MISS', line: 'Full of holes. Full of heart.', f: { col: '#fde047', side: '#eab308', shape: 'wedge', holes: true } },
  { id: 'k3', s: 'cheese', rar: 'common', name: 'MOZZA MO', line: 'Soft, round and very stretchy.', f: { col: '#f8f6ee', side: '#e7e2d2', shape: 'ball' } },
  { id: 'k4', s: 'cheese', rar: 'common', name: 'LITTLE RED', line: 'Red wax coat. Never takes it off.', f: { col: '#dc2626', side: '#b91c1c', shape: 'wheel', small: true, peel: '#fde68a' } },
  { id: 'k5', s: 'cheese', rar: 'rare', name: 'BRIE-ANNA', line: 'Soft in the middle. Fancy on the outside.', f: { col: '#f5f1e4', side: '#fff7d6', shape: 'wheel', flat: true } },
  { id: 'k6', s: 'cheese', rar: 'rare', name: 'BLUE BOB', line: 'Smells strong. Means well.', f: { col: '#eef0e6', side: '#d9dccf', shape: 'block', veins: '#4f6b8f' } },
  { id: 'k7', s: 'cheese', rar: 'super', name: 'GRAND GOUDA', line: 'The big wheel of Meru Market.', f: { col: '#f2b632', side: '#e8a317', shape: 'wheel', wax: '#ec3013', crown: '#c0c4cc' } },
  { id: 'k8', s: 'cheese', rar: 'golden', name: 'GOLDEN WEDGE', line: 'The rarest cheese in all 8 worlds.', f: { col: '#e6b45a', side: '#c9952f', shape: 'wedge', holes: true, crown: '#ffd23a', gold: true } },
  // s481 STATIONS & STARSHIPS (4 common, 2 rare, 1 super, 1 VERY RARE)
  { id: 's1', s: 'ships', rar: 'common', name: 'SCOUT 8', line: 'Your little red ship. Fast, nippy, brave.', f: { kind: 'scout', body: '#f3f2f2', trim: '#ec3013' } },
  { id: 's2', s: 'ships', rar: 'common', name: 'U.S.S. VOLE', line: 'The runabout that flies you to Kufa Station.', f: { kind: 'vole', body: '#c9ccd2', trim: '#1a3fb8' } },
  { id: 's3', s: 'ships', rar: 'common', name: 'ORE BARGE', line: 'Slow, heavy, full of rocks. Proud of it.', f: { kind: 'barge', body: '#7a7e86', trim: '#e8b42a' } },
  { id: 's4', s: 'ships', rar: 'common', name: 'PIRATE SKIFF', line: 'Black hull, red X. Flies out of the pirate ports.', f: { kind: 'skiff', body: '#201e1d', trim: '#ec3013' } },
  { id: 's5', s: 'ships', rar: 'rare', name: 'KUFA STATION', line: 'Copper ring, a garden dome, pods on catwalks.', f: { kind: 'kufa', body: '#d08a4a', trim: '#7a4a22' } },
  { id: 's6', s: 'ships', rar: 'rare', name: 'LUXOR STATION', line: 'A floating pyramid with a golden cap.', f: { kind: 'luxor', body: '#c9a46a', trim: '#2a2220' } },
  { id: 's7', s: 'ships', rar: 'super', name: 'FREED HAULER', line: 'A Machine Fleet hauler. Its eyes glow cyan again.', f: { kind: 'hauler', body: '#5a6a72', trim: '#38bdf8' } },
  { id: 's8', s: 'ships', rar: 'vrare', name: 'GOLDEN DEEP SPACE FOX', line: 'The grandest station of all, in solid gold.', f: { kind: 'dsf', body: '#e6b45a', trim: '#a8792e', gold: true } },
  // s481 8 GATES VEHICLES (engine/vehicle-kit.js models)
  { id: 'v1', s: 'rides', rar: 'common', name: 'DECK DASH', line: 'Four wheels, one fox, zero brakes.', f: { kit: 'skate' } },
  { id: 'v2', s: 'rides', rar: 'common', name: 'POGO PETE', line: 'Boing. Boing. Boing. Still boing.', f: { kit: 'pogo' } },
  { id: 'v3', s: 'rides', rar: 'common', name: 'WAVE RIPPER', line: 'A jet ski built for the Jidda surf.', f: { kit: 'jetski' } },
  { id: 'v4', s: 'rides', rar: 'common', name: 'ROAD FOX', line: 'Lean low, drift long, wave to the crowd.', f: { kit: 'moto' } },
  { id: 'v5', s: 'rides', rar: 'rare', name: 'SPEEDWAY STAR', line: 'Born on the Earth speedway.', f: { kit: 'racecar' } },
  { id: 'v6', s: 'rides', rar: 'rare', name: 'NEBO GLIDER', line: 'Rides the warm air over Nebo.', f: { kit: 'glider' } },
  { id: 'v7', s: 'rides', rar: 'super', name: 'ROYAL CHOPPER', line: 'Lands on every castle helipad.', f: { kit: 'heli' } },
  { id: 'v8', s: 'rides', rar: 'vrare', name: 'GOLDEN TANK', line: 'Solid gold tracks. The rarest ride in 8 GATES.', f: { kit: 'tank', gold: true } },
];
export const FIG = Object.fromEntries(FIGS.map(f => [f.id, f]));
let SERIES_OF = Object.fromEntries(SERIES.map((s, i) => [s.id, i]));

// ---------------------------------------------------------------- collection (shared save, prefixed keys)
const ownedAll = () => ({ ...(save.stat(SK('owned'), null) || {}) });
export const owned = id => (save.stat(SK('owned'), null) || {})[id] || 0;
function addOwned(id, n = 1) { const o = ownedAll(); o[id] = Math.max(0, (o[id] || 0) + n); if (!o[id]) delete o[id]; save.setStat(SK('owned'), o); return o[id] || 0; }
const stars = () => save.stat(SK('stars'), 0);
const haveIn = sid => FIGS.filter(f => f.s === sid && owned(f.id) > 0).length;

// the roll: rarity table (lucky = better table), pity after 9 misses → super or better
export function rollFigure(sid, lucky = false, pity = 0) {
  const has = new Set(FIGS.filter(f => f.s === sid).map(f => f.rar));
  let rar; if (pity >= 9) rar = has.has('golden') && Math.random() < 0.2 ? 'golden' : 'super';
  else { const tbl = Object.values(RARITY).filter(r => has.has(r.key)), tot = tbl.reduce((a, r) => a + (lucky ? r.lucky : r.odds), 0); let x = Math.random() * tot; for (const r of tbl) { x -= lucky ? r.lucky : r.odds; if (x <= 0) { rar = r.key; break; } } rar = rar || 'common'; }
  return pick(FIGS.filter(f => f.s === sid && f.rar === rar));
}

// ---------------------------------------------------------------- tiny synth (no audio files needed)
function synth() {
  let ac = null, master = null, muted = false;
  const ok = () => { if (muted) return false; if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination); } catch (e) { return false; } } if (ac.state === 'suspended') ac.resume(); return true; };
  function tone(f, d = 0.12, v = 0.2, type = 'triangle', at = 0, slide = 0) { if (!ok()) return; const t = ac.currentTime + at, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02); }
  function noise(d = 0.1, v = 0.2, at = 0, hp = 800) { if (!ok()) return; const t = ac.currentTime + at, n = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ac.createBufferSource(); s.buffer = b; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; const g = ac.createGain(); g.gain.value = v; s.connect(f); f.connect(g); g.connect(master); s.start(t); }
  return {
    unlock: () => ok(), setMuted(m) { muted = m; }, get muted() { return muted; },
    coin() { tone(1900, 0.08, 0.18, 'square'); tone(2600, 0.22, 0.14, 'triangle', 0.06); noise(0.05, 0.12, 0.25, 3000); },
    click(k = 0) { noise(0.035, 0.28, 0, 1800); tone(220 + k * 30, 0.05, 0.12, 'square'); },
    lucky() { [880, 1108, 1318, 1760].forEach((f, i) => tone(f, 0.16, 0.16, 'square', i * 0.06)); },
    rattle() { for (let i = 0; i < 7; i++) noise(0.03, 0.18, i * 0.06 + rr(0, 0.02), 1200); },
    thunk() { tone(140, 0.18, 0.3, 'sine', 0, 0.5); noise(0.06, 0.2, 0, 400); },
    roll() { for (let i = 0; i < 4; i++) tone(320 - i * 30, 0.06, 0.08, 'triangle', i * 0.09); },
    twist(k) { noise(0.08, 0.2, 0, 2500); tone(500 + k * 160, 0.09, 0.1, 'sawtooth', 0, 1.4); },
    pop() { noise(0.12, 0.35, 0, 600); tone(300, 0.25, 0.25, 'sine', 0, 3); },
    fanfare(r) { const seq = r === 'golden' ? [523, 659, 784, 1046, 1318, 1568] : r === 'super' ? [523, 659, 784, 1046, 1318] : r === 'rare' ? [523, 659, 784, 1046] : [523, 784]; seq.forEach((f, i) => { tone(f, 0.22, 0.16, 'triangle', i * 0.09); tone(f * 2, 0.12, 0.05, 'square', i * 0.09); }); if (r === 'golden') for (let i = 0; i < 6; i++) tone(2093 + i * 200, 0.1, 0.05, 'sine', 0.6 + i * 0.05); },
    whoosh() { noise(0.25, 0.15, 0, 1500); },
    nope() { tone(200, 0.15, 0.15, 'square', 0, 0.7); },
    star() { tone(1318, 0.1, 0.12, 'triangle'); tone(1760, 0.18, 0.1, 'triangle', 0.08); },
  };
}

// ---------------------------------------------------------------- online: engine/duel-net.js if the repo has it, else a same-device tab test
function localDuel({ game, code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10); let bc = null;
  try { bc = new BroadcastChannel('8g-duel-' + game + '-' + code); } catch (e) { setTimeout(() => onStatus && onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; if (m.t === '__join') { onJoin && onJoin(m.from); return; } if (m.t === '__leave') { onLeave && onLeave(m.from); return; } onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => { onStatus && onStatus('local'); bc.postMessage({ from: id, t: '__join' }); }, 0);
  return { id, send(t, d, to) { try { bc.postMessage({ from: id, t, d, to }); } catch (e) {} }, leave() { try { bc.postMessage({ from: id, t: '__leave' }); bc.close(); } catch (e) {} } };
}

// =====================================================================================================================
// WORLD MODE (s178): opts.inWorld = { renderer, camera, parent, scale, pack } stands ONE machine on a Meru market counter (parent = a group on the counter top,
// +z = the player side): no renderer / room / marquee / lights of its own (lights → throw-away scene, the machine flash is a stand-in so Meru never recompiles
// its shaders); camera at Meru's fov, view offset turned into a camera shift, mirrored to world (api.camera); drags on the map canvas or the overlay's bare
// background (data-fest-pass) turn the crank; keys via api.key.
export async function createCapsuleCorner({ container, onState = () => {}, opts = {} }) {
  const WD = opts.inWorld || null, wel = WD && WD.renderer.domElement, WS = WD ? (WD.scale || 0.55) : 1; if (WD && WD.pack && !opts.pack) opts = { ...opts, pack: WD.pack };
  const PK = PACKS[opts.pack] ? opts.pack : 'classic', PSUF = PK === 'classic' ? '' : '.' + PK;   // s174: which machines stand in this room
  SERIES.splice(0, SERIES.length, ...PACKS[PK].map(id => ALL_SERIES.find(s => s.id === id))); SERIES_OF = Object.fromEntries(SERIES.map((s, i) => [s.id, i]));
  const NS = SERIES.length, PACK_FIGS = FIGS.filter(f => SERIES_OF[f.s] != null);
  const touch = matchMedia('(pointer: coarse)').matches || /[?&]phone=/.test(location.search);
  const CW = () => (wel || container).clientWidth || 1, CH = () => (wel || container).clientHeight || 1;
  let renderer; if (WD) renderer = WD.renderer; else { renderer = new THREE.WebGLRenderer({ antialias: !touch || devicePixelRatio < 2, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none';
  container.appendChild(renderer.domElement); }
  const LS = new THREE.Scene(); let scene = LS; if (WD) { scene = new THREE.Group(); scene.name = 'festWorld'; scene.scale.setScalar(WS); WD.parent.add(scene); } else scene.background = new THREE.Color('#2a1c3a');
  const camera = new THREE.PerspectiveCamera(38, CW() / CH(), 0.05, 60), wcam = WD ? new THREE.PerspectiveCamera(50, 1, 0.02, 400) : null, _wq = new THREE.Quaternion();
  function syncW() { camera.updateMatrixWorld(); if (!WD) return; scene.updateWorldMatrix(true, false); wcam.position.copy(camera.position).applyMatrix4(scene.matrixWorld); scene.getWorldQuaternion(_wq); wcam.quaternion.copy(_wq).multiply(camera.quaternion); wcam.fov = camera.fov; wcam.aspect = camera.aspect; wcam.updateProjectionMatrix(); wcam.updateMatrixWorld(); }
  const L2W = (o, v) => { o.localToWorld(v); return WD ? scene.worldToLocal(v) : v; };   // machine-local → scene-local (in world the scene is a scaled group)
  const grad = makeGradient(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...(extra || {}), ...(extra && extra.emissive ? { emissive: new THREE.Color(extra.emissive) } : {}) })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); o.userData.outline = true; if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const FK = foxKit({ THREE, scene: WD ? LS : scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const CK = creatureKit({ THREE, toon, M });
  const snd = synth();

  // lights
  LS.add(new THREE.HemisphereLight(0xfff3e6, 0x5a4a7a, 1.15));
  const sun = new THREE.DirectionalLight(0xfff0dc, 1.55); sun.position.set(2.5, 6, 5); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -1, near: 1, far: 16 }); LS.add(sun);
  const fill = new THREE.DirectionalLight(0xc9b8ff, 0.45); fill.position.set(-4, 3, 3); LS.add(fill);

  // ---------------------------------------------------------------- the room (neutral so it drops into any building)
  const GAP = 1.75;
  if (!WD) {
    const floorT = canvasTex(128, 128, (g) => { g.fillStyle = '#f3ead8'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#2b2440'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, 128, 2); }, [9, 5]);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshToonMaterial({ map: floorT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.position.z = 2; fl.receiveShadow = true; scene.add(fl);
    const wallT = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#ffd9c2' : '#ffc7a8'; g.fillRect(i * 32, 0, 32, 256); } g.fillStyle = 'rgba(255,255,255,0.35)'; for (let y = 16; y < 256; y += 64) for (let x = 16; x < 256; x += 64) { g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 4 : 9; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); } }, [6, 2.4]);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), new THREE.MeshToonMaterial({ map: wallT, gradientMap: grad })); wall.position.set(0, 3, -1.25); scene.add(wall);
    M(new THREE.BoxGeometry(14, 0.9, 0.12), toon('#3b2a5a'), 0, 0.45, -1.2, scene, 0.015);
    M(new THREE.BoxGeometry(14, 0.08, 0.16), toon('#ffd23a'), 0, 0.92, -1.18, scene, 0);
    for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshToonMaterial({ map: wallT, gradientMap: grad })); sw.rotation.y = -s * Math.PI / 2; sw.position.set(s * 5.2, 3, 2.5); scene.add(sw); }
    // header sign with marquee bulbs
    const signT = canvasTex(1024, 160, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.font = '900 96px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd23a'; g.fillText('CAPSULE CORNER', w / 2, h / 2 + 6); });
    const sg = M(new THREE.BoxGeometry(5.0, 0.78, 0.12), toon('#201e1d'), 0, 3.25, -1.12, scene, 0.02);
    const sf = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 0.75), new THREE.MeshBasicMaterial({ map: signT })); sf.position.set(0, 0, 0.065); sg.add(sf);
  }
  const marquee = []; if (!WD) { const geo = new THREE.SphereGeometry(0.045, 8, 6); for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: '#7a5a20' })); const top = i < 13; m.position.set(-2.4 + (i % 13) * 0.4, top ? 3.69 : 2.81, -1.04); scene.add(m); marquee.push(m); } }

  // ---------------------------------------------------------------- machines
  const capGeoTop = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), capGeoBot = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const CAPR = 0.085, CAP_COLS = ['#ec3013', '#38bdf8', '#ffd23a', '#22c55e', '#f472b6', '#a855f7', '#ff8a1a', '#7dd3fc'];
  const glassMat = new THREE.MeshPhongMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.16, shininess: 120, specular: 0xffffff, depthWrite: false, side: THREE.FrontSide });
  const hiMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
  function signTexFor(S) { return canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.fillStyle = S.col; g.fillRect(0, 0, w, 74); g.fillStyle = '#201e1d'; g.fillRect(0, 74, w, 6); g.font = '900 52px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(S.name, w / 2, 40, w - 28);
    g.fillStyle = '#201e1d'; g.font = '900 40px ' + FONT; g.fillText('★ COLLECT ALL 8 ★', w / 2, 128); g.fillStyle = S.col; g.fillRect(150, 168, 212, 64); g.fillStyle = '#ffffff'; g.font = '900 44px ' + FONT; g.fillText(PRICE + ' GOLD', w / 2, 202); }); }
  const machines = SERIES.map((S, i) => {
    const g = new THREE.Group(); g.position.x = (i - (NS - 1) / 2) * GAP; scene.add(g);
    const col = toon(S.col), dark = toon(S.dark), light = toon(S.light), chrome = toon('#e8ebef'), ink = toon('#201e1d');
    M(new THREE.BoxGeometry(1.02, 0.1, 0.84), ink, 0, 0.05, 0, g, 0.015);
    M(new THREE.BoxGeometry(0.94, 1.06, 0.74), col, 0, 0.63, 0, g, 0.03);
    for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.05, 1.06, 0.76), dark, sx * 0.47, 0.63, 0, g, 0);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshToonMaterial({ map: signTexFor(S), gradientMap: grad, emissive: 0xffffff, emissiveIntensity: 0.15 })); sign.material.emissiveMap = sign.material.map; sign.position.set(0, 0.93, 0.372); g.add(sign);
    M(new THREE.BoxGeometry(0.66, 0.34, 0.05), chrome, 0, 0.55, 0.39, g, 0.012);
    M(new THREE.BoxGeometry(0.1, 0.16, 0.03), ink, -0.24, 0.57, 0.42, g, 0.006); M(new THREE.BoxGeometry(0.02, 0.1, 0.03), toon('#000000'), -0.24, 0.57, 0.436, g, 0);
    const crank = new THREE.Group(); crank.position.set(0.07, 0.55, 0.44); g.add(crank);
    M(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 28), chrome, 0, 0, 0, crank, 0.012, 0.14).rotation.x = Math.PI / 2;
    M(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 18), dark, 0, 0, 0.03, crank, 0.008, 0.07).rotation.x = Math.PI / 2;
    M(new THREE.BoxGeometry(0.32, 0.075, 0.07), col, 0, 0, 0.065, crank, 0.012);
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.048, 12, 8), light, sx * 0.16, 0, 0.07, crank, 0.008, 0.048);
    M(new THREE.BoxGeometry(0.4, 0.24, 0.05), chrome, 0, 0.26, 0.38, g, 0.012);
    M(new THREE.BoxGeometry(0.32, 0.17, 0.05), ink, 0, 0.26, 0.392, g, 0);
    const flap = new THREE.Group(); flap.position.set(0, 0.345, 0.42); g.add(flap);
    { const fm = new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.17), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); fm.position.y = -0.085; flap.add(fm); }
    M(new THREE.BoxGeometry(0.42, 0.035, 0.2), chrome, 0, 0.165, 0.49, g, 0.01); M(new THREE.BoxGeometry(0.42, 0.06, 0.03), chrome, 0, 0.19, 0.585, g, 0.008);
    M(new THREE.CylinderGeometry(0.52, 0.56, 0.12, 32), dark, 0, 1.22, 0, g, 0.02, 0.56);
    const bulbs = []; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, star = k === 0; const m = new THREE.Mesh(star ? new THREE.OctahedronGeometry(0.06, 0) : new THREE.SphereGeometry(0.032, 10, 8), new THREE.MeshBasicMaterial({ color: star ? '#8a6a1a' : '#5a4a3a' })); m.position.set(Math.sin(a) * 0.565, 1.22, Math.cos(a) * 0.565); if (star) m.scale.set(1, 1.2, 0.6); g.add(m); bulbs.push(m); }
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 20), glassMat); globe.position.y = 1.72; globe.renderOrder = 5; g.add(globe);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.012, 6, 64), toon('#201e1d')); ring.position.y = 1.72; ring.renderOrder = 6; g.add(ring);
    const hl = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 6, 24, 1.0), hiMat); hl.position.set(0, 1.72, 0); hl.renderOrder = 7; g.add(hl);
    M(new THREE.SphereGeometry(0.17, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), dark, 0, 2.17, 0, g, 0.015, 0.17).scale.y = 0.6;
    M(new THREE.SphereGeometry(0.06, 12, 8), toon('#ffd23a'), 0, 2.29, 0, g, 0.01, 0.06);
    // capsules in the globe (two instanced meshes = 2 draw calls per machine)
    const pos = []; let tries = 0; while (pos.length < 34 && tries++ < 4000) { const p = V3(rr(-0.4, 0.4), rr(-0.42, 0.1), rr(-0.4, 0.4)); if (p.length() > 0.5 - CAPR - 0.01) continue; if (pos.some(q => q.distanceTo(p) < CAPR * 1.95)) continue; pos.push(p); }
    pos.sort((a, b) => a.y - b.y);
    const iTop = new THREE.InstancedMesh(capGeoTop, new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), pos.length), iBot = new THREE.InstancedMesh(capGeoBot, toon('#f7f4ee'), pos.length);
    const caps = pos.map((p, k) => ({ p, base: p.clone(), q: new THREE.Euler(rr(0, 6), rr(0, 6), rr(0, 6)), col: pick(CAP_COLS), j: rr(0, 6) }));
    caps.forEach((c, k) => iTop.setColorAt(k, new THREE.Color(c.col)));
    iTop.position.y = iBot.position.y = 1.72; g.add(iTop, iBot);
    const flash = WD ? { color: new THREE.Color(), intensity: 0 } : new THREE.PointLight(S.light, 0, 2.5); if (!WD) { flash.position.set(0, 1.72, 0.3); g.add(flash); }
    return { S, i, g, crank, flap, bulbs, globe, ring, hl, iTop, iBot, caps, flash, wob: 0 };
  });
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = V3(1, 1, 1);
  function updateCaps(m, t) { m.caps.forEach((c, k) => { const w = m.wob; const p = V3(c.base.x + Math.sin(t * 13 + c.j) * 0.012 * w, c.base.y + Math.abs(Math.sin(t * 9 + c.j)) * 0.03 * w, c.base.z + Math.cos(t * 11 + c.j) * 0.012 * w); _q.setFromEuler(new THREE.Euler(c.q.x + Math.sin(t * 5 + c.j) * 0.3 * w, c.q.y, c.q.z)); _s.setScalar(c.hidden ? 0.0001 : CAPR); _m4.compose(p, _q, _s); m.iTop.setMatrixAt(k, _m4); m.iBot.setMatrixAt(k, _m4); }); m.iTop.instanceMatrix.needsUpdate = m.iBot.instanceMatrix.needsUpdate = true; }
  machines.forEach(m => updateCaps(m, 0));

  // the capsule that drops out
  const cap = new THREE.Group(); cap.visible = false; scene.add(cap);
  const capTopMat = new THREE.MeshToonMaterial({ color: '#ec3013', gradientMap: grad, transparent: true }), capBotMat = new THREE.MeshToonMaterial({ color: '#f7f4ee', gradientMap: grad, transparent: true });
  const capTop = new THREE.Group(), capBot = new THREE.Group(); cap.add(capTop, capBot);
  { const t = new THREE.Mesh(capGeoTop, capTopMat); t.scale.setScalar(CAPR); capTop.add(t); addOutline(t, 0.006, CAPR); const b = new THREE.Mesh(capGeoBot, capBotMat); b.scale.setScalar(CAPR); capBot.add(b); addOutline(b, 0.006, CAPR);
    const seam = new THREE.Mesh(new THREE.TorusGeometry(CAPR * 1.01, CAPR * 0.09, 6, 24), toon('#201e1d')); seam.rotation.x = Math.PI / 2; capBot.add(seam);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(CAPR * 0.25, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); shine.position.set(-CAPR * 0.45, CAPR * 0.6, CAPR * 0.5); shine.scale.set(1, 0.6, 0.4); capTop.add(shine); }
  const capGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), color: 0xffd23a, transparent: true, depthWrite: false, opacity: 0 })); capGlow.scale.setScalar(0.5); cap.add(capGlow);

  // reveal: base + rays + confetti
  const stage = new THREE.Group(); scene.add(stage); stage.visible = false;
  const baseMat = new THREE.MeshToonMaterial({ color: '#ec3013', gradientMap: grad });
  const base = M(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 28), baseMat, 0, 0.02, 0, stage, 0.008, 0.22);
  const rayTex = canvasTex(256, 256, (g) => { g.translate(128, 128); for (let i = 0; i < 16; i++) { g.rotate(Math.PI / 8); const gr = g.createLinearGradient(0, 0, 0, -128); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-7, 0); g.lineTo(-20, -128); g.lineTo(20, -128); g.lineTo(7, 0); g.fill(); } const r = g.createRadialGradient(0, 0, 0, 0, 0, 70); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(-128, -128, 256, 256); });
  const rays = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, depthWrite: false, color: 0xffffff, opacity: 0 })); rays.renderOrder = 1; scene.add(rays);
  const CONF = 60, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.03, 0.05), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONF); conf.frustumCulled = false; scene.add(conf);
  const confP = Array.from({ length: CONF }, () => ({ p: V3(), v: V3(), r: V3(), w: V3(), life: 0 })); confP.forEach((c, k) => conf.setColorAt(k, new THREE.Color(pick(CAP_COLS))));
  const coin = M(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 20), toon('#e6b45a', { emissive: '#5a3e10', emissiveIntensity: 0.3 }), 0, 0, 0, scene, 0.005, 0.05); coin.visible = false;

  // ---------------------------------------------------------------- figures
  function buildMuscle(F) {
    const f = F.f, look = { ...PLAYER_MALE, fur: f.fur, furDark: f.furDark, tailBase: f.furDark, tailMid: f.fur, paw: f.fur, fluff: f.fluff || PLAYER_MALE.fluff, muzzle: f.muzzle || PLAYER_MALE.muzzle, chin: f.muzzle || PLAYER_MALE.chin, snout: f.snout || PLAYER_MALE.snout };
    const fox = FK.makeFox({ look, outfit: 'boxer', torso: [f.trunks, f.band, f.glove || f.fur], glasses: f.glasses, crown: f.crown, mood: f.mood || 'determined', eyes: [f.eye || '#38bdf8', f.eye || '#38bdf8'], crest: '8' });
    fox.parent && fox.parent.remove(fox);
    const P = fox.userData.P, lift = 0.5 * (look.legLength - 1), fur = f.gold ? toon(f.fur, { emissive: '#7a5a1a', emissiveIntensity: 0.35 }) : toon(f.fur), lite = toon(f.fluff || '#ffe4c4'), dk = toon(f.furDark);
    // the muscles: pecs, abs, delts, biceps, a wider back
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.15, 16, 12), fur, s * 0.125, 1.04 + lift, 0.2, P.body, 0.014, 0.15).scale.set(1.05, 0.78, 0.62); M(new THREE.SphereGeometry(0.155, 14, 10), fur, s * 0.37, 1.16 + lift, 0, P.body, 0.016, 0.155).scale.set(1, 0.95, 1.05); M(new THREE.SphereGeometry(0.13, 12, 10), dk, s * 0.2, 1.0 + lift, -0.17, P.body, 0.012, 0.13).scale.set(1.2, 1.3, 0.6); }
    for (let r = 0; r < 3; r++) for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.085, 0.06, 0.05), lite, s * 0.05, 0.9 - r * 0.075 + lift, 0.265 - r * 0.004, P.body, 0.008).scale.set(1, 1, 1);
    P.arms.forEach((a, k) => { const s = k ? 1 : -1; M(new THREE.SphereGeometry(0.1, 12, 10), fur, 0, -0.14, 0.035, a, 0.012, 0.1).scale.set(1, 1.15, 1.05); M(new THREE.SphereGeometry(0.075, 10, 8), fur, 0, -0.29, 0.01, a, 0.01, 0.075); });
    P.body.scale.set(1.1, 1, 1.05);
    if (f.headband) { const hb = M(new THREE.TorusGeometry(0.33, 0.035, 8, 28), toon(f.headband), 0, 0.12, -0.02, P.head, 0.006); hb.rotation.x = Math.PI / 2 - 0.15; const kn = M(new THREE.BoxGeometry(0.06, 0.18, 0.03), toon(f.headband), 0.05, 0.02, -0.34, P.head, 0.006); kn.rotation.z = 0.4; }
    if (f.belt) { const gold = toon('#e6b45a', { emissive: '#7a5a1a', emissiveIntensity: 0.35 }); const b = M(new THREE.TorusGeometry(0.3, 0.06, 8, 30), gold, 0, 0.7 + lift, 0, P.body, 0.01); b.rotation.x = Math.PI / 2; b.scale.set(1, 1.08, 1.6); const pl = M(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 24), gold, 0, 0.7 + lift, 0.33, P.body, 0.01, 0.12); pl.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 5), toon('#ec3013'), 0, 0.7 + lift, 0.345, P.body, 0).rotation.x = Math.PI / 2; }
    if (f.cape) { const cp = M(new THREE.CylinderGeometry(0.34, 0.5, 1.0, 24, 1, true, Math.PI * 0.6, Math.PI * 0.8), toon(f.cape, { side: THREE.DoubleSide }), 0, 0.72 + lift, -0.04, P.body, 0.02); cp.material.side = THREE.DoubleSide; }
    if (f.shaker) { const sh = new THREE.Group(); sh.position.set(0, -0.5, 0.06); P.arms[0].add(sh); M(new THREE.CylinderGeometry(0.07, 0.06, 0.2, 14), toon('#ffffff'), 0, -0.02, 0, sh, 0.008, 0.07); M(new THREE.CylinderGeometry(0.072, 0.072, 0.06, 14), toon('#22c55e'), 0, 0.1, 0, sh, 0.008, 0.072); }
    if (f.pose === 'dumbbell') { const db = new THREE.Group(); db.position.set(0, -0.44, 0.04); db.rotation.y = Math.PI / 2; P.arms[1].add(db); M(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 8), toon('#4b5563'), 0, 0, 0, db, 0.006).rotation.z = Math.PI / 2; for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 16), toon('#201e1d'), sx * 0.15, 0, 0, db, 0.008, 0.09).rotation.z = Math.PI / 2; }
    if (f.pose === 'bar') { const bb = new THREE.Group(); bb.position.set(0, 2.45 + lift, 0.05); P.body.add(bb); M(new THREE.CylinderGeometry(0.025, 0.025, 1.7, 8), toon('#9ca3af'), 0, 0, 0, bb, 0.006).rotation.z = Math.PI / 2; for (const sx of [-1, 1]) for (const [x, r] of [[0.66, 0.24], [0.74, 0.19]]) M(new THREE.CylinderGeometry(r, r, 0.07, 22), toon(f.trunks), sx * x, 0, 0, bb, 0.012, r).rotation.z = Math.PI / 2; }
    const POSE = { double: [2.25, 2.25, 0, 0], one: [0.35, 2.75, 0, 0], hips: [0.55, 0.55, 0.15, 0.15], bar: [2.75, 2.75, 0, 0], dumbbell: [0.3, 0.25, 0, -1.5] }[f.pose] || [0.3, 0.3, 0, 0];
    fox.userData.pose = () => { P.arms[0].rotation.set(POSE[2], 0, -POSE[0]); P.arms[1].rotation.set(POSE[3], 0, POSE[1]); };
    fox.userData.anim = (dt) => { FK.animFox(fox, dt, 0); fox.userData.pose(); };
    fox.userData.anim(0.016); fox.rotation.y = 0;
    return fox;
  }
  function buildTruck(F) {
    const f = F.f, goldX = f.gold ? { emissive: '#7a5a1a', emissiveIntensity: 0.4 } : null;
    const remap = { '#ec3013': f.paint, '#b91c1c': f.dark, '#f3f2f2': f.trim, '#e6b45a': f.accent };
    const vt = (c, x) => { const n = remap[c]; return n ? toon(n, goldX || x) : f.gold && (c === '#e5e7eb' || c === '#9ca3af') ? toon('#f6d38a', goldX) : toon(c, x); };
    const g = vehicleKit({ THREE, M, toon: vt }).make('truck'), body = g.userData.V.body;
    g.traverse(o => { if (o.isMesh && o.material && o.material.map && o.geometry.type === 'PlaneGeometry' && f.flames === false) o.visible = false; });
    const bodyY = 1.95, cy1 = bodyY + 1.45, ink = toon('#201e1d');
    if (f.mud) for (let k = 0; k < 14; k++) M(new THREE.SphereGeometry(rr(0.14, 0.26), 8, 6), toon('#3a2614'), pick([-1.26, 1.26]), rr(1.9, 2.5), rr(-2.2, 2.2), body, 0).scale.set(0.3, 1, 1.4); for (let k = 0; k < 8; k++) M(new THREE.SphereGeometry(rr(0.12, 0.2), 8, 6), toon('#3a2614'), rr(-1, 1), bodyY + 0.7, rr(0.8, 2.1), body, 0).scale.set(1.3, 0.3, 1);
    if (f.topper === 'fox') { for (const s of [-1, 1]) { const e = M(new THREE.ConeGeometry(0.45, 1.0, 4), toon(f.paint), s * 0.62, cy1 + 0.52, -0.1, body, 0.03); e.rotation.set(0, Math.PI / 4, -s * 0.18); const e2 = M(new THREE.ConeGeometry(0.24, 0.6, 4), toon('#201e1d'), s * 0.6, cy1 + 0.45, 0.12, body, 0); e2.rotation.set(0, Math.PI / 4, -s * 0.18); }
      const tl = new THREE.Group(); tl.position.set(0, bodyY + 0.8, -2.45); tl.rotation.x = -0.9; body.add(tl); M(new THREE.SphereGeometry(0.3, 14, 10), toon(f.paint), 0, 0.5, 0, tl, 0.03, 0.3).scale.set(1, 2.2, 1); M(new THREE.SphereGeometry(0.22, 12, 8), toon('#ffffff'), 0, 1.15, 0, tl, 0.02, 0.22).scale.set(1, 1.3, 1); }
    if (f.topper === 'shark') { const fin = M(new THREE.ConeGeometry(0.75, 1.5, 3), toon(f.paint), 0, cy1 + 0.55, -0.2, body, 0.03); fin.scale.z = 0.25; fin.rotation.x = -0.25; fin.position.y = cy1 + 0.75; for (let k = 0; k < 9; k++) M(new THREE.ConeGeometry(0.08, 0.2, 4), toon('#ffffff'), -0.96 + k * 0.24, bodyY + 0.12, 2.44, body, 0.006).rotation.x = Math.PI; }
    if (f.topper === 'stars') { const st = toon('#ffd23a', { emissive: '#ffd23a', emissiveIntensity: 0.6 }); for (let k = 0; k < 16; k++) M(new THREE.OctahedronGeometry(rr(0.07, 0.13), 0), st, pick([-1.27, 1.27]), rr(1.9, 2.55), rr(-2.2, 2.2), body, 0); for (let k = 0; k < 6; k++) M(new THREE.OctahedronGeometry(0.1, 0), st, rr(-1, 1), bodyY + 0.8, rr(0.8, 2.1), body, 0); }
    if (f.topper === 'horns') for (const s of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.16, 0.9, 10), toon('#fff3c4', goldX), s * 1.1, bodyY + 0.9, 2.1, body, 0.02); h.rotation.z = -s * 0.9; h.rotation.x = 0.4; }
    g.rotation.y = -0.55; return g;
  }
  function buildCreature(F) { const g = CK.build(F.kit, { noPolish: false }); g.userData.anim = (dt, t) => { try { CK.animate(g, 'idle', t, dt); } catch (e) {} }; try { CK.animate(g, 'idle', 0.5, 0.016); } catch (e) {} if (F.kit === 'Hornet' || F.kit === 'Crystal Crab' || F.kit === 'Thornback') g.rotation.y = -0.5; return g; }
  // s174 FISH FRIENDS: a fish on a coral stick over a sandy base (side view, eyes to the camera); octopus stands on the base
  const UPV = new THREE.Vector3(0, 1, 0);
  function buildFish(F) {
    const f = F.f, gx = f.gold ? { emissive: '#7a5a1a', emissiveIntensity: 0.4 } : null, T = c => toon(c, gx), g = new THREE.Group(), ink = toon('#201e1d'), wht = toon('#ffffff'), H = f.h || 0.62;
    M(new THREE.CylinderGeometry(0.42, 0.48, 0.12, 16), toon('#e9d9b0'), 0, 0.06, 0, g, 0.015);
    for (let k = 0; k < 6; k++) M(new THREE.SphereGeometry(rr(0.04, 0.08), 8, 6), toon(pick(['#f472b6', '#fb923c', '#a3e635', '#f3f2f2'])), rr(-0.32, 0.32), 0.12, rr(-0.3, 0.3), g, 0.006);
    const eye = (x, y, z, r, p) => { M(new THREE.SphereGeometry(r, 12, 10), wht, x, y, z, p, 0.01, r); M(new THREE.SphereGeometry(r * 0.55, 10, 8), ink, x + r * 0.15, y, z + r * 0.6, p, 0); };
    if (f.kind === 'octo') {
      const o = new THREE.Group(); o.position.y = 0.12; g.add(o); const arms = [];
      M(new THREE.SphereGeometry(0.3, 18, 14), T(f.body), 0, 0.55, 0, o, 0.02, 0.3).scale.set(1, 1.15, 1);
      for (const s of [-1, 1]) eye(s * 0.12, 0.55, 0.24, 0.075, o);
      M(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), ink, 0, 0.44, 0.28, o, 0).rotation.z = Math.PI;
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2, arm = new THREE.Group(); arm.position.set(Math.sin(a) * 0.16, 0.3, Math.cos(a) * 0.16); arm.rotation.y = a; o.add(arm); arms.push(arm);
        for (let j = 0; j < 4; j++) M(new THREE.SphereGeometry(0.075 - j * 0.014, 10, 8), T(j % 2 ? f.fin : f.body), 0, -0.05 - j * 0.06, 0.06 + j * 0.07, arm, 0.008); }
      g.userData.anim = (dt, t) => { arms.forEach((a, k) => { a.rotation.x = Math.sin(t * 2.4 + k) * 0.18; }); o.position.y = 0.12 + Math.sin(t * 1.6) * 0.015; };
      return g; }
    M(new THREE.CylinderGeometry(0.025, 0.025, 0.6, 6), toon('#f472b6'), 0, 0.42, -0.02, g, 0.006);
    const fish = new THREE.Group(); fish.position.y = 0.78; g.add(fish); const sc = f.kind === 'puffer' ? [0.78, 0.78, 0.74] : [1, H, 0.42];
    M(new THREE.SphereGeometry(0.5, 22, 16), T(f.body), 0, 0, 0, fish, 0.02, 0.5).scale.set(...sc);
    M(new THREE.SphereGeometry(0.48, 18, 12), T(f.belly), 0.02, -0.07 * (f.kind === 'puffer' ? 2 : 1), 0, fish, 0).scale.set(sc[0] * 0.92, sc[1] * 0.62, sc[2] * 1.04);
    for (let k = 0; k < (f.stripes || 0); k++) { const x = f.stripes === 1 ? 0 : 0.28 - k * 0.28, e = Math.sqrt(Math.max(0.05, 1 - (x / 0.5) ** 2)); M(new THREE.SphereGeometry(0.5, 18, 12), T(f.stripe), x, 0, 0, fish, 0).scale.set(0.07, H * e * 1.03, 0.42 * e * 1.03); }
    const tail = new THREE.Group(); tail.position.x = -0.42 * sc[0]; fish.add(tail); const tf = M(new THREE.ConeGeometry(0.24, 0.32, 4), T(f.fin), -0.16, 0, 0, tail, 0.015); tf.rotation.z = -Math.PI / 2; tf.scale.set(1, 1, 0.22);
    if (f.kind !== 'puffer') { const big = f.kind === 'shark'; const df = M(new THREE.ConeGeometry(big ? 0.2 : 0.14, big ? 0.36 : 0.22, 3), T(f.fin), big ? 0.02 : -0.04, 0.5 * H * 0.92, 0, fish, 0.012); df.scale.z = 0.25; df.rotation.z = -0.35; }
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.1, 10, 8), T(f.fin), 0.1, -0.08, s * 0.2 * (f.kind === 'puffer' ? 1.7 : 1), fish, 0.008).scale.set(1, 0.45, 0.2); }
    const ez = f.kind === 'puffer' ? 0.3 : 0.15, ex = f.kind === 'puffer' ? 0.2 : 0.3; for (const s of [-1, 1]) eye(ex, 0.07, s * ez, f.kind === 'puffer' ? 0.085 : 0.07, fish);
    fish.children.filter(c => c.geometry && c.geometry.type === 'SphereGeometry' && c.position.z < -0.05 && c.material === wht).forEach(c => { c.children.filter(q => !q.userData.outline).forEach(q => { q.position.z *= -1; }); });
    M(new THREE.TorusGeometry(0.045, 0.012, 6, 12, Math.PI), ink, 0.44 * sc[0], -0.06, 0.08, fish, 0).rotation.set(0, Math.PI / 2, Math.PI);
    if (f.kind === 'puffer') for (let k = 0; k < 26; k++) { const d = new THREE.Vector3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize(); if (d.x > 0.75) continue; const sp = M(new THREE.ConeGeometry(0.03, 0.1, 4), T(f.stripe), d.x * 0.39, d.y * 0.39, d.z * 0.37, fish, 0.005); sp.quaternion.setFromUnitVectors(UPV, d); }
    if (f.kind === 'sword') { const sw = M(new THREE.ConeGeometry(0.035, 0.6, 8), T('#cbd5e1'), 0.72, 0.02, 0, fish, 0.006); sw.rotation.z = -Math.PI / 2; }
    if (f.kind === 'shark') for (let k = 0; k < 6; k++) { const th = M(new THREE.ConeGeometry(0.018, 0.045, 4), wht, 0.42, -0.07, -0.08 + k * 0.032, fish, 0); th.rotation.z = Math.PI; }
    if (f.kind === 'koi') { for (const s of [-1, 1]) { const w = M(new THREE.CylinderGeometry(0.008, 0.004, 0.22, 4), T('#a8792e'), 0.52, -0.1, s * 0.06, fish, 0); w.rotation.set(s * 0.4, 0, 0.9); } for (const [x, y] of [[0.05, 0.12], [-0.18, 0.05]]) M(new THREE.SphereGeometry(0.08, 10, 8), toon('#ec3013'), x, y, 0.17, fish, 0).scale.set(1, 0.7, 0.25); }
    g.userData.anim = (dt, t) => { tail.rotation.y = Math.sin(t * 6) * 0.4; fish.position.y = 0.78 + Math.sin(t * 2) * 0.02; fish.rotation.z = Math.sin(t * 1.3) * 0.05; };
    g.rotation.y = -0.35; return g;
  }
  // s174 CHEESE CHUMS: a cheese body (wedge / wheel / ball / block) with a face, little arms + legs
  function buildCheese(F) {
    const f = F.f, gx = f.gold ? { emissive: '#7a5a1a', emissiveIntensity: 0.4 } : null, T = c => toon(c, gx), g = new THREE.Group(), ink = toon('#201e1d'), wht = toon('#ffffff');
    const b = new THREE.Group(); b.position.y = 0.16; g.add(b); let W = 0.6, Hh = 0.4, FZ = 0.25, CY = 0.2;
    if (f.shape === 'wedge') { const m = M(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 3), T(f.col), 0, 0.2, 0, b, 0.02); m.rotation.y = Math.PI; m.scale.x = 1.1; W = 0.95; FZ = 0.25; CY = 0.2;
      if (f.holes) for (const [x, y, r] of [[-0.25, 0.26, 0.06], [0.05, 0.12, 0.045], [0.3, 0.28, 0.05], [0.18, 0.08, 0.03]]) M(new THREE.CircleGeometry(r, 14), T(f.side), x, y, FZ + 0.003, b, 0);
      if (f.holes) for (const [x, z, r] of [[-0.1, 0.0, 0.05], [0.15, -0.1, 0.04]]) M(new THREE.CircleGeometry(r, 14), T(f.side), x, 0.403, z, b, 0).rotation.x = -Math.PI / 2; }
    else if (f.shape === 'wheel') { const r = f.small ? 0.28 : 0.38, h = f.flat ? 0.22 : f.small ? 0.3 : 0.34; Hh = h; W = r * 2; FZ = r; CY = h / 2;
      M(new THREE.CylinderGeometry(r, r, h, 26), T(f.wax || f.col), 0, h / 2, 0, b, 0.02, r);
      if (f.wax) { const cut = M(new THREE.CylinderGeometry(r * 0.98, r * 0.98, h * 1.01, 20, 1, false, Math.PI * 0.25, Math.PI * 0.5), T(f.col), 0, h / 2, 0, b, 0); cut.scale.set(1.01, 1, 1.01); }
      if (f.peel) M(new THREE.CylinderGeometry(r * 1.01, r * 1.01, 0.05, 24, 1, true, Math.PI * 0.7, Math.PI * 0.6), T(f.peel), 0, h * 0.82, 0, b, 0).material.side = THREE.DoubleSide;
      if (f.flat) M(new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.02, 24), T(f.side), 0, h + 0.005, 0, b, 0); }
    else if (f.shape === 'ball') { M(new THREE.SphereGeometry(0.3, 20, 16), T(f.col), 0, 0.3, 0, b, 0.02, 0.3); Hh = 0.6; W = 0.6; FZ = 0.29; CY = 0.32; }
    else { M(new THREE.BoxGeometry(0.62, 0.44, 0.44), T(f.col), 0, 0.22, 0, b, 0.02); Hh = 0.44; W = 0.62; FZ = 0.22; CY = 0.22;
      if (f.veins) for (let k = 0; k < 14; k++) { const top = k > 8, m = M(new THREE.SphereGeometry(rr(0.02, 0.04), 6, 5), toon(f.veins), rr(-0.26, 0.26), top ? 0.441 : rr(0.06, 0.4), top ? rr(-0.18, 0.18) : FZ + 0.002, b, 0); m.scale.set(1.6, top ? 0.2 : 1, top ? 1 : 0.2); } }
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.06, 12, 10), wht, s * 0.1, CY + 0.05, FZ + 0.01, b, 0.008, 0.06); M(new THREE.SphereGeometry(0.034, 10, 8), ink, s * 0.1 + 0.008, CY + 0.05, FZ + 0.055, b, 0);
      M(new THREE.SphereGeometry(0.04, 8, 6), toon('#f9a8d4'), s * 0.19, CY - 0.04, FZ + 0.005, b, 0).scale.set(1, 0.6, 0.2); }
    M(new THREE.TorusGeometry(0.055, 0.013, 6, 12, Math.PI), ink, 0, CY - 0.05, FZ + 0.012, b, 0).rotation.z = Math.PI;
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * (W / 2 - 0.02), CY, 0.02); b.add(a); const c = M(new THREE.CylinderGeometry(0.022, 0.022, 0.2, 6), ink, s * 0.08, -0.05, 0, a, 0); c.rotation.z = s * 1.0; M(new THREE.SphereGeometry(0.05, 10, 8), wht, s * 0.17, -0.11, 0, a, 0.008, 0.05); return a; });
    for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.024, 0.024, 0.14, 6), ink, s * 0.12, 0.09, 0, g, 0); M(new THREE.SphereGeometry(0.06, 10, 8), ink, s * 0.12, 0.03, 0.03, g, 0.006).scale.set(1, 0.6, 1.4); }
    if (f.crown) { const cg = T(f.crown), cy = (f.shape === 'ball' ? 0.58 : Hh) + 0.01; M(new THREE.CylinderGeometry(0.13, 0.13, 0.07, 14, 1, true), cg, 0, cy + 0.035, 0, b, 0.008).material.side = THREE.DoubleSide; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; M(new THREE.ConeGeometry(0.03, 0.08, 4), cg, Math.sin(a) * 0.13, cy + 0.1, Math.cos(a) * 0.13, b, 0.004); } }
    g.userData.anim = (dt, t) => { b.position.y = 0.16 + Math.abs(Math.sin(t * 3)) * 0.025; arms[1].rotation.z = 0.4 + Math.sin(t * 5) * 0.35; arms[0].rotation.z = -0.1 + Math.sin(t * 3) * 0.08; };
    g.rotation.y = -0.3; return g;
  }
  // s481 STATIONS & STARSHIPS: a model on a clear display rod over a black stand
  const goldOf = c => '#' + new THREE.Color(c).lerp(new THREE.Color('#e6b45a'), 0.75).getHexString();
  function buildSpace(F) {
    const f = F.f, gx = f.gold ? { emissive: '#7a5a1a', emissiveIntensity: 0.45 } : null, T = c => toon(f.gold ? goldOf(c) : c, gx), lit = c => toon(f.gold ? '#fff3c4' : c, { emissive: f.gold ? '#ffd23a' : c, emissiveIntensity: 0.9 });
    const G = new THREE.Group(), body = T(f.body), trim = T(f.trim), ink = T('#201e1d'), glass = toon('#9ad8ff', { transparent: true, opacity: 0.45 });
    M(new THREE.CylinderGeometry(0.42, 0.48, 0.1, 24), toon('#201e1d'), 0, 0.05, 0, G, 0.015, 0.48); M(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8), glass, 0, 0.35, 0, G, 0);
    const m = new THREE.Group(); m.position.y = 0.8; G.add(m); let spin = false;
    const X = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, ol = 0.012) => { const o = M(geo, mat, x, y, z, m, ol); o.rotation.set(rx, ry, rz); return o; };
    if (f.kind === 'scout') { X(new THREE.CylinderGeometry(0.1, 0.17, 0.8, 14), body, 0, 0, 0, Math.PI / 2); X(new THREE.ConeGeometry(0.1, 0.32, 14), trim, 0, 0, 0.56, Math.PI / 2); X(new THREE.SphereGeometry(0.1, 12, 10), glass, 0, 0.1, 0.12).scale.set(0.8, 0.7, 1.5);
      for (const s2 of [-1, 1]) { const w = X(new THREE.BoxGeometry(0.55, 0.035, 0.36), body, s2 * 0.36, -0.02, -0.12, 0, s2 * 0.35); X(new THREE.BoxGeometry(0.05, 0.16, 0.24), trim, s2 * 0.62, 0.04, -0.22); X(new THREE.CylinderGeometry(0.07, 0.07, 0.24, 12), ink, s2 * 0.15, -0.02, -0.42, Math.PI / 2); X(new THREE.CircleGeometry(0.06, 12), lit('#ff8a2a'), s2 * 0.15, -0.02, -0.545, 0, Math.PI, 0, 0); void w; } }
    else if (f.kind === 'vole') { X(new THREE.BoxGeometry(0.56, 0.3, 0.9), body, 0, 0, 0); X(new THREE.BoxGeometry(0.56, 0.18, 0.3), body, 0, -0.05, 0.55, -0.35); X(new THREE.BoxGeometry(0.5, 0.06, 0.02), lit('#7fd8ff'), 0, 0.06, 0.62, -0.35, 0, 0, 0);
      for (const s2 of [-1, 1]) { X(new THREE.BoxGeometry(0.14, 0.12, 0.9), trim, s2 * 0.38, -0.06, -0.05); X(new THREE.BoxGeometry(0.1, 0.04, 0.8), lit('#38bdf8'), s2 * 0.38, 0.01, -0.05, 0, 0, 0, 0); } X(new THREE.BoxGeometry(0.3, 0.12, 0.02), lit('#ff8a2a'), 0, 0, -0.46, 0, 0, 0, 0); }
    else if (f.kind === 'barge') { X(new THREE.BoxGeometry(0.46, 0.16, 1.35), body, 0, 0, 0); ['#ec3013', '#1a3fb8', '#22c55e'].forEach((c, i) => X(new THREE.BoxGeometry(0.38, 0.2, 0.32), T(c), 0, 0.18, 0.4 - i * 0.36)); X(new THREE.BoxGeometry(0.28, 0.22, 0.2), trim, 0, 0.18, -0.58); X(new THREE.BoxGeometry(0.22, 0.05, 0.02), lit('#7fd8ff'), 0, 0.22, -0.47, 0, 0, 0, 0); for (const s2 of [-1, 1]) X(new THREE.CircleGeometry(0.06, 12), lit('#ff8a2a'), s2 * 0.13, -0.01, -0.68, 0, Math.PI, 0, 0); }
    else if (f.kind === 'skiff') { const h = X(new THREE.ConeGeometry(0.34, 1.0, 3), body, 0, 0, 0.05, Math.PI / 2); h.scale.set(1, 1, 0.35); for (const r2 of [0.7, -0.7]) X(new THREE.BoxGeometry(0.5, 0.02, 0.06), trim, 0, 0.1, 0, 0, r2, 0, 0); for (const s2 of [-1, 1]) X(new THREE.BoxGeometry(0.04, 0.2, 0.3), ink, s2 * 0.3, 0.02, -0.3, 0, 0, s2 * 0.5); X(new THREE.CircleGeometry(0.08, 12), lit('#ff3a2a'), 0, 0, -0.46, 0, Math.PI, 0, 0); }
    else if (f.kind === 'hauler') { X(new THREE.BoxGeometry(0.7, 0.46, 0.95), body, 0, 0, 0); X(new THREE.BoxGeometry(0.6, 0.3, 0.06), ink, 0, 0.02, 0.49); for (const s2 of [-1, 1]) { X(new THREE.SphereGeometry(0.065, 12, 10), lit(f.trim), s2 * 0.14, 0.05, 0.53, 0, 0, 0, 0); X(new THREE.BoxGeometry(0.1, 0.5, 0.7), T('#3a454c'), s2 * 0.42, -0.03, -0.05); }
      for (const [x, y] of [[-0.18, 0.12], [0.18, 0.12], [-0.18, -0.12], [0.18, -0.12]]) X(new THREE.CircleGeometry(0.07, 12), lit('#ff8a2a'), x, y, -0.48, 0, Math.PI, 0, 0); X(new THREE.BoxGeometry(0.4, 0.1, 0.6), T('#e8b42a'), 0, 0.28, -0.08); }
    else if (f.kind === 'kufa') { spin = true; X(new THREE.TorusGeometry(0.55, 0.06, 10, 36), body, 0, 0, 0, Math.PI / 2); X(new THREE.CylinderGeometry(0.34, 0.36, 0.08, 24), trim, 0, -0.02, 0); X(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24), T('#4a8a3a'), 0, 0.03, 0); X(new THREE.SphereGeometry(0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass, 0, 0.03, 0, 0, 0, 0, 0);
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; X(new THREE.BoxGeometry(0.05, 0.03, 0.32), trim, Math.sin(a) * 0.76, 0, Math.cos(a) * 0.76, 0, a); X(new THREE.BoxGeometry(0.22, 0.12, 0.16), body, Math.sin(a) * 0.98, 0, Math.cos(a) * 0.98, 0, a); }
      X(new THREE.ConeGeometry(0.12, 0.3, 12), trim, 0, -0.2, 0, Math.PI); }
    else if (f.kind === 'luxor') { spin = true; [0.8, 0.62, 0.44, 0.26].forEach((w, i) => X(new THREE.BoxGeometry(w, 0.12, w), i % 2 ? T('#a8844e') : body, 0, i * 0.12, 0)); X(new THREE.ConeGeometry(0.13, 0.16, 4), lit('#ffd23a'), 0, 0.52, 0, 0, Math.PI / 4); const kl = X(new THREE.ConeGeometry(0.56, 0.6, 4), trim, 0, -0.36, 0, Math.PI, Math.PI / 4); void kl;
      for (const [x, z] of [[-0.46, -0.46], [0.46, -0.46], [-0.46, 0.46], [0.46, 0.46]]) { X(new THREE.BoxGeometry(0.06, 0.4, 0.06), trim, x, 0.14, z); X(new THREE.ConeGeometry(0.045, 0.07, 4), lit('#ffd23a'), x, 0.37, z, 0, Math.PI / 4); } X(new THREE.BoxGeometry(0.82, 0.02, 0.02), lit('#ff6a1a'), 0, -0.07, 0.4, 0, 0, 0, 0); }
    else { spin = true; X(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 16), body, 0, 0, 0); X(new THREE.TorusGeometry(0.62, 0.075, 10, 40), body, 0, -0.05, 0, Math.PI / 2); for (let k = 0; k < 4; k++) X(new THREE.BoxGeometry(0.05, 0.04, 0.6), trim, Math.sin(k * Math.PI / 2) * 0.32, -0.05, Math.cos(k * Math.PI / 2) * 0.32, 0, k * Math.PI / 2);
      X(new THREE.CylinderGeometry(0.32, 0.18, 0.16, 24), body, 0, 0.42, 0); X(new THREE.ConeGeometry(0.04, 0.26, 8), trim, 0, 0.62, 0); X(new THREE.ConeGeometry(0.2, 0.36, 16), trim, 0, -0.58, 0, Math.PI); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; X(new THREE.SphereGeometry(0.025, 8, 6), lit('#ffd23a'), Math.sin(a) * 0.62, 0.03, Math.cos(a) * 0.62, 0, 0, 0, 0); } }
    if (!spin) m.rotation.x = -0.18;
    G.userData.anim = (dt, t) => { m.position.y = 0.8 + Math.sin(t * 1.6) * 0.03; if (spin) m.rotation.y += dt * 0.4; else m.rotation.z = Math.sin(t * 1.2) * 0.12; };
    G.rotation.y = spin ? 0 : -0.5; return G;
  }
  // s481 8 GATES VEHICLES: the real vehicle-kit models (the very rare one repainted gold)
  function buildRide(F) { const f = F.f, gx = f.gold ? { emissive: '#7a5a1a', emissiveIntensity: 0.4 } : null, vt = (c, x) => f.gold ? toon(goldOf(c), gx) : toon(c, x);
    let g; try { g = vehicleKit({ THREE, M, toon: vt }).make(f.kit); } catch (e) { console.warn('capsule ride ' + f.kit, e); g = new THREE.Group(); M(new THREE.BoxGeometry(1.2, 0.5, 2), vt('#f2741f'), 0, 0.25, 0, g); }
    g.rotation.y = -0.55; return g; }
  const _b = new THREE.Box3(), _bb = new THREE.Box3();
  function visBox(o) { _b.makeEmpty(); o.updateWorldMatrix(true, true); o.traverse(m => { if (!m.isMesh || m.userData.outline || !m.geometry) return; let v = true; for (let p = m; p; p = p.parent) if (p.visible === false) { v = false; break; } if (!v) return; if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); _bb.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); _b.union(_bb); }); return _b.clone(); }
  // a figure = normalized group: stands on y=0, centred, fits a 0.5 box
  function buildFig(id, H = 0.5) {
    const F = FIG[id], inner = F.s === 'muscle' ? buildMuscle(F) : F.s === 'truck' ? buildTruck(F) : F.s === 'fish' ? buildFish(F) : F.s === 'cheese' ? buildCheese(F) : F.s === 'ships' ? buildSpace(F) : F.s === 'rides' ? buildRide(F) : buildCreature(F);
    const holder = new THREE.Group(); holder.add(inner); const b = visBox(inner), sz = b.getSize(V3()), c = b.getCenter(V3());
    const k = H / Math.max(sz.y, sz.x * 0.82, sz.z * 0.7, 0.01); inner.position.set(-c.x, -b.min.y, -c.z); const fig = new THREE.Group(); fig.add(holder); holder.scale.setScalar(k);
    fig.userData = { id, inner, anim: inner.userData.anim || null, h: sz.y * k };
    if (!WD && GLD(F.rar) && F.s !== 'muscle') { const sp = new THREE.PointLight('#ffd23a', 0.8, 1.2); sp.position.set(0, H, 0.3); fig.add(sp); }
    return fig;
  }
  function disposeFig(fig) { fig.traverse(o => { if (o.isMesh && o.geometry && !o.userData.keepGeo) o.geometry.dispose(); }); fig.parent && fig.parent.remove(fig); }

  // thumbnails for the SHELF (rendered once, owned = colour, missing = silhouette)
  const TS = 192, thumbRT = new THREE.WebGLRenderTarget(TS, TS), thumbScene = new THREE.Scene(), thumbCam = new THREE.PerspectiveCamera(30, 1, 0.01, 20), thumbs = new Map(), silMat = new THREE.MeshBasicMaterial({ color: '#4a4644' });
  thumbScene.add(new THREE.HemisphereLight(0xffffff, 0x6a5a7a, 1.25)); { const d = new THREE.DirectionalLight(0xffffff, 1.5); d.position.set(2, 4, 5); thumbScene.add(d); }
  const thumbCv = document.createElement('canvas'); thumbCv.width = thumbCv.height = TS; const thumbPx = new Uint8Array(TS * TS * 4);
  function renderThumb(id, sil) {
    const fig = buildFig(id, 0.5); thumbScene.add(fig); if (fig.userData.anim) fig.userData.anim(0.016, 1);
    const b = visBox(fig), c = b.getCenter(V3()), sz = b.getSize(V3()), r = Math.max(sz.y, sz.x, sz.z * 0.8) * 0.5;
    const d = r / Math.tan(15 * Math.PI / 180) * 1.12; thumbCam.position.set(c.x + d * 0.08, c.y + d * 0.18, c.z + d); thumbCam.lookAt(c);
    thumbScene.overrideMaterial = sil ? silMat : null;
    const prevC = renderer.getClearColor(new THREE.Color()), prevA = renderer.getClearAlpha();
    renderer.setRenderTarget(thumbRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(thumbScene, thumbCam);
    renderer.readRenderTargetPixels(thumbRT, 0, 0, TS, TS, thumbPx); renderer.setRenderTarget(null); renderer.setClearColor(prevC, prevA); thumbScene.overrideMaterial = null;
    const g = thumbCv.getContext('2d'), img = g.createImageData(TS, TS); for (let y = 0; y < TS; y++) img.data.set(thumbPx.subarray((TS - 1 - y) * TS * 4, (TS - y) * TS * 4), y * TS * 4);
    // colour space: the render target holds linear values → convert for display
    for (let i = 0; i < img.data.length; i += 4) for (let j = 0; j < 3; j++) { const v = img.data[i + j] / 255; img.data[i + j] = Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)); }
    g.putImageData(img, 0, 0); const url = thumbCv.toDataURL('image/png'); disposeFig(fig); return url;
  }
  const thumbQ = []; let thumbBusy = false;
  function thumb(id, sil, cb) { const key = id + (sil ? ':s' : ''); if (thumbs.has(key)) { cb && cb(thumbs.get(key)); return thumbs.get(key); } thumbQ.push({ id, sil, key, cb }); return null; }
  function pumpThumbs() { if (!thumbQ.length) return; const t0 = performance.now(); while (thumbQ.length && performance.now() - t0 < 24) { const j = thumbQ.shift(); if (thumbs.has(j.key)) { j.cb && j.cb(thumbs.get(j.key)); continue; } let u = ''; try { u = renderThumb(j.id, j.sil); } catch (e) { console.warn('thumb ' + j.id + ': ' + e.message); } thumbs.set(j.key, u); j.cb && j.cb(u); } }

  // ---------------------------------------------------------------- game state
  const G = { series: clamp(SERIES_OF[opts.series] ?? save.stat(SK('lastSeries' + PSUF), 0), 0, NS - 1), state: 'idle', t: 0, st: 0, accum: 0, clicks: 0, lucky: false, hold: false, twist: 0, fig: null, figObj: null, roll: null, pay: null, flash: null, flashT: 0, party: false, block: false, safe: { top: 0, bottom: 0, left: 0, right: 0 } };
  const M_ = () => machines[G.series];
  const REVEAL = () => V3(M_().g.position.x, 0.78, 0.95);
  function setState(s) { G.state = s; G.st = 0; emit(); }
  function flash(txt, col = '#ffd23a', dur = 1.8) { G.flash = { txt, col }; G.flashT = dur; emit(); }
  const freeToday = () => save.stat(SK('freeDay' + PSUF), '') !== today();   // s174: each pack (market stall) has its own free daily capsule
  function primary() {
    const s = G.state, gold = save.data.gold;
    if (s === 'idle') { if (G.party) return { kind: 'wait', label: 'WAITING', sub: 'NEXT ROUND SOON', enabled: false };
      if (freeToday()) return { kind: 'free', label: 'FREE CAPSULE', sub: 'ONE FREE EVERY DAY', enabled: true, col: '#22c55e' };
      if (gold >= PRICE) return { kind: 'coin', label: 'INSERT ' + PRICE + ' GOLD', sub: 'YOU HAVE ' + gold + ' GOLD', enabled: true, col: '#ec3013' };
      if (stars() >= STAR_COST) return { kind: 'stars', label: 'USE ' + STAR_COST + ' ★', sub: 'FREE CAPSULE FROM STARS', enabled: true, col: '#ffd23a' };
      return { kind: 'none', label: 'NEED ' + PRICE + ' GOLD', sub: 'EARN GOLD AT JOBS · FREE ONE TOMORROW', enabled: false }; }
    if (s === 'coin') return { kind: 'wait', label: 'CLINK…', sub: '', enabled: false };
    if (s === 'crank') return { kind: 'turn', label: 'HOLD TO TURN', sub: 'OR SPIN THE CRANK WITH YOUR FINGER', enabled: true, col: '#ec3013' };
    if (s === 'drop') return { kind: 'wait', label: 'HERE IT COMES…', sub: '', enabled: false };
    if (s === 'tray') return { kind: 'open', label: 'TAKE THE CAPSULE', sub: 'OR TAP IT', enabled: true, col: '#ec3013' };
    if (s === 'lift') return { kind: 'wait', label: '…', sub: '', enabled: false };
    if (s === 'twist') return { kind: 'twist', label: 'TWIST IT OPEN', sub: 'TAP OR SWIPE · ' + G.twist + '/3', enabled: true, col: '#ec3013' };
    if (s === 'pop') return { kind: 'wait', label: '…', sub: '', enabled: false };
    if (s === 'reveal') return G.party ? { kind: 'wait', label: 'ROUND ' + (P.match ? P.match.round : '') , sub: 'WAITING FOR EVERYONE', enabled: false } : { kind: 'stow', label: 'PUT IT ON THE SHELF', sub: '', enabled: true, col: '#ec3013' };
    return { kind: 'wait', label: '…', sub: '', enabled: false };
  }
  function secondary() { if (G.state === 'idle' && !G.party && !freeToday() && save.data.gold >= PRICE && stars() >= STAR_COST) return { kind: 'stars', label: 'USE ' + STAR_COST + ' ★ INSTEAD' }; return null; }
  function hint() {
    const s = G.state, S = SERIES[G.series];
    if (s === 'idle') return G.party ? 'Get ready…' : S.line;
    if (s === 'crank') return 'Turn it once round. Finish when the light hits the ★ for a LUCKY capsule!';
    if (s === 'tray') return 'Your capsule is in the tray.';
    if (s === 'twist') return 'Twist the top three times.';
    if (s === 'reveal') return G.fig ? FIG[G.fig.id].line : '';
    return '';
  }
  let emitT = 0; function emit() { if (emitT) return; emitT = requestAnimationFrame(() => { emitT = 0; try { onState(hud()); } catch (e) { console.warn(e); } }); }
  function hud() {
    const S = SERIES[G.series];
    return {
      ready: true, series: G.series, state: G.state, gold: save.data.gold, stars: stars(), starCost: STAR_COST, price: PRICE, free: freeToday(), clicks: G.clicks, twist: G.twist, muted: snd.muted,
      seriesList: SERIES.map((s, i) => ({ i, id: s.id, name: s.name, short: s.short, col: s.col, have: haveIn(s.id), total: 8, done: haveIn(s.id) === 8 })),
      seriesName: S.name, seriesCol: S.col, primary: primary(), secondary: secondary(), hint: hint(), canSwitch: G.state === 'idle' && !G.party,
      fig: G.fig, flash: G.flash, total: PACK_FIGS.filter(f => owned(f.id) > 0).length, totalAll: PACK_FIGS.length, seenHelp: save.flag(SK('seenHelp')),
      party: partyHud(),
    };
  }
  save.on(() => emit());

  // ---------------------------------------------------------------- actions
  function act(kind) {
    snd.unlock();
    if (G.block) return;
    if (kind === 'coin' && G.state === 'idle' && !G.party) { if (!save.spend(PRICE)) { snd.nope(); flash('NOT ENOUGH GOLD', '#ec3013'); return; } G.pay = 'gold'; startCoin(); }
    else if (kind === 'free' && G.state === 'idle' && !G.party && freeToday()) { save.setStat(SK('freeDay' + PSUF), today()); G.pay = 'free'; startCoin(); }
    else if (kind === 'stars' && G.state === 'idle' && !G.party) { if (stars() < STAR_COST) { snd.nope(); return; } save.setStat(SK('stars'), stars() - STAR_COST); G.pay = 'stars'; startCoin(); }
    else if (kind === 'open' && G.state === 'tray') { setState('lift'); snd.whoosh(); }
    else if (kind === 'twist' && G.state === 'twist') doTwist();
    else if (kind === 'stow' && G.state === 'reveal' && !G.party) { setState('stow'); snd.whoosh(); }
  }
  function startCoin() { coin.visible = true; G.coinFrom = camera.position.clone().add(V3(0.2, -0.4, 0).applyQuaternion(camera.quaternion)).addScaledVector(camera.getWorldDirection(V3()), 0.6); setState('coin'); }
  function beginCrank() { G.accum = 0; G.clicks = 0; G.lucky = false; setState('crank'); }
  function turnHold(on) { G.hold = !!on && (G.state === 'crank' || G.state === 'coin'); if (on) snd.unlock(); }
  function addTurn(da) { if (G.state !== 'crank' || da <= 0) return; G.accum += da; const c = Math.min(4, Math.floor(G.accum / (Math.PI / 2))); while (G.clicks < c) { G.clicks++; snd.click(G.clicks); M_().wob = 1; if (G.clicks < 4) emit(); } if (G.accum >= Math.PI * 2) finishCrank(); }
  function finishCrank() {
    const m = M_(), lit = G.bulbIdx === 0; G.hold = false; G.lucky = lit; G.accum = Math.PI * 2;
    if (lit) { snd.lucky(); flash('★ LUCKY SPIN! ★', '#ffd23a'); }
    const pity = save.stat(SK('pity.' + m.S.id), 0), F = G.forceFig && FIG[G.forceFig] && FIG[G.forceFig].s === m.S.id ? FIG[G.forceFig] : rollFigure(m.S.id, lit || (save.perk && save.perk.cocoa() && Math.random() < 0.25), pity);   /* s181 COCOA CHARM: 1 in 4 plain spins use the lucky table */
    save.setStat(SK('pity.' + m.S.id), RARITY[F.rar].pts >= 6 ? 0 : pity + 1);
    G.roll = F.id; capTopMat.color.set(GLD(F.rar) ? '#ffd23a' : pick(CAP_COLS)); capTopMat.emissive = new THREE.Color(GLD(F.rar) ? '#7a5a1a' : '#000000');
    const k = m.caps.reduce((bi, c, i) => (!c.hidden && c.base.y < m.caps[bi].base.y ? i : bi), 0); G.dropCap = k; G.dropFrom = m.caps[k].base.clone().add(V3(0, 1.72, 0)); capTopMat.color.set(GLD(F.rar) ? '#ffd23a' : m.caps[k].col);
    m.caps[k].hidden = true; capTop.rotation.set(0, 0, 0); capTop.position.set(0, 0, 0); capBot.position.set(0, 0, 0); capTop.scale.setScalar(1); capBot.scale.setScalar(1); capTopMat.opacity = capBotMat.opacity = 1; cap.scale.setScalar(1); capGlow.material.opacity = 0;
    setTimeout(() => snd.rattle(), 250); setState('drop');
  }
  function doTwist() { if (G.state !== 'twist' || G.twist >= 3) return; G.twist++; G.twistAnim = 0.28; snd.twist(G.twist); if (G.twist >= 3) setTimeout(() => { if (G.state === 'twist') pop(); }, 260); else emit(); }
  function pop() {
    const F = FIG[G.roll], R = RARITY[F.rar], m = M_();
    const prev = owned(F.id), count = addOwned(F.id, 1), isNew = prev === 0; let starGain = 0;
    if (!isNew) { starGain = R.stars; save.setStat(SK('stars'), stars() + starGain); }
    save.addXp(isNew ? 5 : 2); save.setStat(SK('spins'), save.stat(SK('spins'), 0) + 1); if (G.lucky) save.setStat(SK('lucky'), save.stat(SK('lucky'), 0) + 1);
    save.setStat(SK('lastSeries'), G.series);
    G.fig = { id: F.id, name: F.name, seriesName: SERIES[SERIES_OF[F.s]].name, seriesCol: SERIES[SERIES_OF[F.s]].col, rar: F.rar, rarName: R.name, rarCol: R.col, rarFg: R.fg, isNew, count, lucky: G.lucky, line: F.line, pts: R.pts + (G.lucky ? 2 : 0), starGain };
    thumbs.delete(F.id); // colour version renders fresh next time the shelf opens
    if (G.figObj) disposeFig(G.figObj);
    const fig = buildFig(F.id, 0.5); G.figObj = fig; stage.add(fig); stage.visible = true; stage.position.copy(REVEAL()).add(V3(0, -0.24, 0)); fig.scale.setScalar(0.001); baseMat.color.set(SERIES[SERIES_OF[F.s]].col);
    rays.material.color.set(R.col); rays.position.copy(REVEAL()).add(V3(0, 0.02, -0.25)); rays.material.opacity = 0;
    for (let i = 0; i < CONF; i++) { const c = confP[i]; c.p.copy(REVEAL()); c.v.set(rr(-1.2, 1.2), rr(1.2, 2.8), rr(-0.4, 1.0)); c.r.set(rr(0, 6), rr(0, 6), rr(0, 6)); c.w.set(rr(-12, 12), rr(-12, 12), rr(-12, 12)); c.life = F.rar === 'common' ? (i < 25 ? 2.2 : 0) : 2.6; }
    m.flash.color.set(R.col); m.flash.intensity = 0;
    snd.pop(); setTimeout(() => snd.fanfare(F.rar === 'vrare' ? 'golden' : F.rar), 220);
    const done = haveIn(F.s);
    if (isNew && done === 8 && !save.flag(SK('done.' + F.s))) { save.setFlag(SK('done.' + F.s)); save.addGold(50); save.addXp(25); save.give(SK('trophy_' + F.s)); setTimeout(() => flash(SERIES[SERIES_OF[F.s]].name + ' COMPLETE! +50 GOLD', '#22c55e', 3.2), 1500); }
    else if (isNew) setTimeout(() => flash('NEW! ' + done + '/8 ' + SERIES[SERIES_OF[F.s]].short, '#22c55e'), 900);
    else setTimeout(() => flash('DOUBLE · +' + starGain + ' ★', '#ffd23a'), 900);
    if (NS > 1 && PACK_FIGS.every(f => owned(f.id) > 0) && !save.flag(SK('done.all' + PSUF))) { save.setFlag(SK('done.all' + PSUF)); save.addGold(100); setTimeout(() => flash('ALL ' + PACK_FIGS.length + ' COLLECTED! +100 GOLD', '#ffd23a', 4), 4800); }
    setState('pop');
    if (G.party) partyPulled(F.id, G.lucky);
  }
  function pickSeries(i) { if (!(G.state === 'idle' && !G.party)) return; i = ((i % NS) + NS) % NS; if (i === G.series) return; G.series = i; save.setStat(SK('lastSeries' + PSUF), i); snd.click(0); emit(); }
  function resetMachine() { cap.visible = false; stage.visible = false; if (G.figObj) { disposeFig(G.figObj); G.figObj = null; } G.fig = null; G.twist = 0; rays.material.opacity = 0; machines.forEach(m => m.caps.forEach(c => c.hidden = false)); }

  // ---------------------------------------------------------------- camera framing (fits the free screen area between the UI panels)
  const CAM = { pos: V3(0, 1.4, 6), look: V3(0, 1.1, 0), off: [0, 0] };
  function shot() {
    const s = G.state, m = M_(), x = m.g.position.x;
    if (s === 'reveal' || s === 'pop' || s === 'twist' || s === 'lift' || s === 'stow') return { c: s === 'twist' || s === 'lift' ? REVEAL() : REVEAL().add(V3(0, 0.03, 0)), hw: s === 'twist' || s === 'lift' ? 0.3 : 0.31, hh: s === 'twist' || s === 'lift' ? 0.28 : 0.33, el: 0.1 };
    if (s === 'tray' || s === 'drop') return { c: V3(x, 0.62, 0.3), hw: 0.62, hh: 0.62, el: 0.2 };
    return { c: V3(x, 1.18, 0), hw: 0.62, hh: 1.22, el: 0.12 };
  }
  function frame(sh) {
    const W = CW(), H = CH(), sf = G.safe, fw = Math.max(80, W - sf.left - sf.right), fh = Math.max(80, H - sf.top - sf.bottom), tan = Math.tan(camera.fov * Math.PI / 360), asp = W / H;
    const d = Math.max(sh.hh * 1.06 / (tan * fh / H), sh.hw * 1.06 / (tan * asp * fw / W)) + 0.4;
    const dir = V3(0, Math.sin(sh.el), Math.cos(sh.el));
    const cx = sf.left + fw / 2, cy = sf.top + fh / 2;
    return { pos: sh.c.clone().addScaledVector(dir, d), look: sh.c.clone(), off: [W / 2 - cx, H / 2 - cy] };
  }

  // ---------------------------------------------------------------- input: drag the crank round, tap the capsule, swipe to twist / change machine
  const el = renderer.domElement, ptr = { id: null, x: 0, y: 0, x0: 0, y0: 0, t0: 0, a: null, twDx: 0 };
  const crankScreen = () => { const m = M_(), p = m.crank.getWorldPosition(V3()).project(wcam || camera), r = el.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height }; };
  const passW = e => { const q = e.target; return q === el || !!(q && q.dataset && q.dataset.festPass != null); };
  const onPD = e => { if (WD && !passW(e)) return; snd.unlock(); if (G.block) return; if (WD) e.stopImmediatePropagation(); ptr.id = e.pointerId; ptr.x = ptr.x0 = e.clientX; ptr.y = ptr.y0 = e.clientY; ptr.t0 = performance.now(); ptr.twDx = 0; ptr.a = null; try { el.setPointerCapture(e.pointerId); } catch (er) {} if (G.state === 'crank') { const c = crankScreen(); ptr.a = Math.atan2(e.clientY - c.y, e.clientX - c.x); } };
  const onPM = e => { if (e.pointerId !== ptr.id) return; if (WD) e.stopImmediatePropagation(); const dx = e.clientX - ptr.x; ptr.x = e.clientX; ptr.y = e.clientY;
    if (G.state === 'crank') { const c = crankScreen(), a = Math.atan2(e.clientY - c.y, e.clientX - c.x); if (ptr.a != null && Math.hypot(e.clientX - c.x, e.clientY - c.y) > 14) { let d = a - ptr.a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; if (d > 0) addTurn(Math.min(d, 0.9)); } ptr.a = a; }
    if (G.state === 'twist') { ptr.twDx += Math.abs(dx); if (ptr.twDx > 45) { ptr.twDx = 0; doTwist(); } } };
  const up = e => { if (e.pointerId !== ptr.id) return; ptr.id = null; const dx = e.clientX - ptr.x0, dy = e.clientY - ptr.y0, dt = performance.now() - ptr.t0, tap = Math.hypot(dx, dy) < 14 && dt < 450;
    if (tap && G.state === 'tray') act('open'); else if (tap && G.state === 'twist') doTwist();
    else if (G.state === 'idle' && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 700) pickSeries(G.series + (dx < 0 ? 1 : -1)); };
  if (WD) { addEventListener('pointerdown', onPD, true); addEventListener('pointermove', onPM, true); addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true); }
  else { el.addEventListener('pointerdown', onPD); el.addEventListener('pointermove', onPM); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); }
  const onKey = e => { if (G.block || e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const k = e.code;
    if (k === 'Space' || k === 'Enter') { e.preventDefault(); if (e.type === 'keydown') { if (G.state === 'crank') turnHold(true); else if (!e.repeat) { const p = primary(); if (p.enabled && p.kind !== 'turn') act(p.kind); } } else if (G.state === 'crank') turnHold(false); }
    else if (e.type === 'keydown' && (k === 'ArrowLeft' || k === 'KeyA')) pickSeries(G.series - 1); else if (e.type === 'keydown' && (k === 'ArrowRight' || k === 'KeyD')) pickSeries(G.series + 1); };
  if (!WD) { addEventListener('keydown', onKey); addEventListener('keyup', onKey); }   // world: Meru's walk hands the keys over through api.key

  // ---------------------------------------------------------------- the loop
  const clock = new THREE.Clock(); let raf = 0, dead = false;
  const _v = V3();
  function tick() {
    if (dead) return; raf = requestAnimationFrame(tick); if (document.hidden) return;
    const dt = Math.min(0.05, clock.getDelta()); G.t += dt; G.st += dt; const t = G.t, m = M_();
    pumpThumbs();
    if (G.flashT > 0) { G.flashT -= dt; if (G.flashT <= 0) { G.flash = null; emit(); } }
    // marquee + lucky ring
    marquee.forEach((b, i) => b.material.color.set(((Math.floor(t * 4) + i) % 3 === 0) ? '#ffd23a' : '#7a5a20'));
    machines.forEach(mm => { const act = mm === m, crank = act && G.state === 'crank'; const idx = crank ? Math.floor(t * 7) % 12 : Math.floor(t * 2.5) % 12; if (act && crank) G.bulbIdx = idx;
      mm.bulbs.forEach((b, k) => { const on = crank ? k === idx : (act ? (k === idx || k === (idx + 6) % 12) : false); b.material.color.set(k === 0 ? (on ? '#fff3a0' : (crank ? '#c99a2a' : '#8a6a1a')) : on ? '#ffd23a' : '#5a4a3a'); b.scale.setScalar(k === 0 && on ? 1.5 : 1); if (k === 0) b.scale.set(on ? 1.5 : 1, on ? 1.8 : 1.2, 0.6); });
      mm.wob = Math.max(0, mm.wob - dt * 2); updateCaps(mm, t); mm.ring.quaternion.copy(camera.quaternion); mm.hl.quaternion.copy(camera.quaternion); mm.hl.rotateZ(2.0); });
    // crank
    if (G.state === 'crank' && G.hold) addTurn(dt * Math.PI * 2 * 0.7);
    m.crank.rotation.z = damp(m.crank.rotation.z, -G.accum, 18, dt);
    if (G.state === 'coin') { const k = Math.min(1, G.st / 0.55), slot = L2W(m.g, V3(-0.24, 0.57, 0.46)); coin.position.lerpVectors(G.coinFrom, slot, easeOut(k)); coin.position.y += Math.sin(k * Math.PI) * 0.25; coin.rotation.set(Math.PI / 2, 0, k * 8); if (k >= 1) { coin.visible = false; snd.coin(); beginCrank(); } }
    if (G.state === 'idle' && !G.party) m.crank.rotation.z = damp(m.crank.rotation.z, Math.round(m.crank.rotation.z / (Math.PI * 2)) * Math.PI * 2, 4, dt);
    // drop: inside the globe → hidden in the cabinet → out of the chute → bounce in the tray
    if (G.state === 'drop') { const s = G.st, g = m.g; cap.visible = true; cap.rotation.set(0, 0, 0);
      if (s < 0.4) { const k = s / 0.4; cap.position.copy(G.dropFrom).lerp(L2W(g, V3(0, 1.24, 0)), k * k); cap.visible = true; }
      else if (s < 0.85) { cap.visible = false; }
      else if (s < 1.6) { const k = (s - 0.85) / 0.75, b = Math.abs(Math.sin(k * Math.PI * 2.5)) * (1 - k) * 0.08; cap.position.copy(L2W(g, V3(0, 0.3 - 0.07 * Math.min(1, k * 3) + b, 0.39 + 0.14 * easeOut(Math.min(1, k * 1.6))))); cap.rotation.x = k * 6; m.flap.rotation.x = -Math.sin(Math.min(1, k * 2) * Math.PI) * 1.1; if (!G.thunk) { G.thunk = 1; snd.thunk(); setTimeout(() => snd.roll(), 120); } }
      else { G.thunk = 0; m.flap.rotation.x = 0; cap.rotation.x = 0; setState('tray'); }
    }
    if (G.state === 'tray') { cap.position.copy(L2W(m.g, V3(0, 0.255 + Math.abs(Math.sin(t * 3)) * 0.015, 0.53))); cap.rotation.z = Math.sin(t * 2) * 0.15; capGlow.material.opacity = 0.35 + Math.sin(t * 5) * 0.2; capGlow.material.color.set(G.roll && GLD(FIG[G.roll].rar) ? '#ffd23a' : '#ffffff'); }
    if (G.state === 'lift') { const k = Math.min(1, G.st / 0.55); cap.position.lerpVectors(L2W(m.g, V3(0, 0.255, 0.53)), REVEAL(), easeOut(k)); cap.scale.setScalar(1 + easeOut(k) * 1.9); cap.rotation.set(0, k * Math.PI * 2, 0); capGlow.material.opacity = 0.2; if (k >= 1) { G.twist = 0; G.twistAnim = 0; setState('twist'); } }
    if (G.state === 'twist') { cap.position.copy(REVEAL()); G.twistAnim = Math.max(0, (G.twistAnim || 0) - dt); const tw = G.twistAnim > 0 ? Math.sin(G.twistAnim / 0.28 * Math.PI) : 0; capTop.rotation.y = damp(capTop.rotation.y, G.twist * 0.75, 14, dt); cap.rotation.z = tw * 0.12 + Math.sin(t * 2.4) * 0.04; cap.rotation.y = Math.sin(t * 1.3) * 0.2; capTop.position.y = G.twist * 0.006; capGlow.material.opacity = 0.25 + G.twist * 0.15; if (G.roll && FIG[G.roll].rar !== 'common') capGlow.material.color.set(RARITY[FIG[G.roll].rar].col); }
    if (G.state === 'pop' || G.state === 'reveal') { const s = G.st, R = G.fig ? RARITY[G.fig.rar] : RARITY.common, fig = G.figObj;
      if (G.state === 'pop') { const k = Math.min(1, s / 0.9); capTop.position.set(-k * 0.06, k * 0.35, -k * 0.12); capTop.rotation.z = k * 2.5; capBot.position.set(k * 0.04, -k * 0.18, -k * 0.05); capTopMat.opacity = capBotMat.opacity = 1 - smooth(0.05, 0.55, k); capTop.scale.setScalar(1 - k * 0.5); capBot.scale.setScalar(1 - k * 0.5); capGlow.material.opacity = (1 - k) * 0.8; if (fig) fig.scale.setScalar(Math.max(0.001, easeBack(Math.min(1, s / 0.7)))); if (k >= 1) { cap.visible = false; setState('reveal'); } }
      if (fig) { fig.rotation.y = Math.sin(t * 0.8) * 0.5; if (fig.userData.anim) fig.userData.anim(dt, t); if (G.state === 'reveal') fig.scale.setScalar(1 + Math.sin(t * 2.2) * 0.012); }
      rays.material.opacity = damp(rays.material.opacity, R.key === 'common' ? 0.35 : GLD(R.key) ? 0.95 : 0.7, 4, dt); rays.rotation.z += dt * (GLD(R.key) ? 1.2 : 0.5); rays.scale.setScalar(1 + Math.sin(t * 3) * 0.04 + (GLD(R.key) ? 0.3 : 0)); rays.quaternion.copy(camera.quaternion); rays.rotateZ(t * (GLD(R.key) ? 1.2 : 0.5));
      m.flash.intensity = damp(m.flash.intensity, R.key === 'common' ? 0.3 : 1.2, 4, dt); }
    else { rays.material.opacity = damp(rays.material.opacity, 0, 6, dt); machines.forEach(mm => mm.flash.intensity = damp(mm.flash.intensity, 0, 5, dt)); }
    if (G.state === 'stow') { const k = Math.min(1, G.st / 0.5), fig = G.figObj; if (fig) { fig.scale.setScalar(Math.max(0.001, 1 - easeOut(k))); fig.position.set(k * 0.6, k * 0.9, 0); } base.scale.setScalar(Math.max(0.001, 1 - k)); if (k >= 1) { resetMachine(); base.scale.setScalar(1); setState('idle'); } }
    // confetti
    let any = false; for (let i = 0; i < CONF; i++) { const c = confP[i]; if (c.life > 0) { any = true; c.life -= dt; c.v.y -= 3.2 * dt; c.v.multiplyScalar(1 - dt * 1.2); c.p.addScaledVector(c.v, dt); c.r.addScaledVector(c.w, dt); _q.setFromEuler(new THREE.Euler(c.r.x, c.r.y, c.r.z)); _s.setScalar(c.life > 0 ? 1 : 0.0001); _m4.compose(c.p, _q, _s); } else _m4.makeScale(0.0001, 0.0001, 0.0001); conf.setMatrixAt(i, _m4); } conf.visible = any; if (any) conf.instanceMatrix.needsUpdate = true;
    // camera
    const f = frame(shot()), kc = G.state === 'idle' ? 4 : 5; CAM.pos.lerp(f.pos, 1 - Math.exp(-kc * dt)); CAM.look.lerp(f.look, 1 - Math.exp(-kc * dt)); CAM.off[0] = damp(CAM.off[0], f.off[0], kc, dt); CAM.off[1] = damp(CAM.off[1], f.off[1], kc, dt);
    applyCam();
  }
  function applyCam() {
    camera.position.copy(CAM.pos); camera.lookAt(CAM.look); const W = CW(), H = CH();
    if (WD) { if (camera.fov !== WD.camera.fov || Math.abs(camera.aspect - W / H) > 1e-3) { camera.fov = WD.camera.fov; camera.aspect = W / H; camera.updateProjectionMatrix(); }
      camera.updateMatrixWorld(); const px = 2 * CAM.pos.distanceTo(CAM.look) * Math.tan(camera.fov * Math.PI / 360) / H, rx = V3().setFromMatrixColumn(camera.matrixWorld, 0), uy = V3().setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(rx, CAM.off[0] * px).addScaledVector(uy, -CAM.off[1] * px); syncW(); }   // the view offset becomes a sideways camera shift
    else { camera.setViewOffset(W, H, CAM.off[0], CAM.off[1], W, H); renderer.render(scene, camera); }
  }
  function resize() { if (!WD) renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(wel || container); if (WD) { camera.fov = WD.camera.fov; camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); }
  { const f = frame(shot()); CAM.pos.copy(f.pos); CAM.look.copy(f.look); CAM.off = f.off.slice(); }
  tick();

  // =================================================================== PARTY (online, up to 5)
  // Room = the 5 earliest joiners; host = lowest id among them. Host deals the rounds; everyone pulls on their own phone
  // and sends what came out. Score = rarity points (+2 lucky). 5 rounds, best total wins.
  const P = { st: null, code: '', status: '', peers: {}, ready: false, j: 0, msg: '', ping: null, match: null, net: null, tok: 0, seen: {}, timer: 0, mid: 0, copied: false };
  const members = () => { if (!P.st || !P.net) return []; const all = [{ id: P.net.id, j: P.j, ready: P.ready, playing: P.st === 'play', me: true }, ...Object.entries(P.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAXP); };
  const inRoom = () => members().some(m => m.me);
  const hostId = (match = true) => { let m = members(); if (match && P.match) m = m.filter(x => P.match.ids.includes(x.id)); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : (P.net ? P.net.id : null); };
  const playerList = ids => { const s = ids.slice().sort(); return s.map((id, slot) => ({ id, slot, col: NET_COLS[slot][1], name: NET_COLS[slot][0] })); };
  function pOpen() { if (!P.st) Object.assign(P, { st: 'menu', code: '', status: '', peers: {}, ready: false, msg: '', ping: null, match: null }); emit(); }
  async function pJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { P.msg = 'Type the 4-letter room code from your friend.'; emit(); return; }
    pLeave(true); Object.assign(P, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', ping: null, match: null, seen: {} }); emit();
    let connect = localDuel; try { const mod = await import(new URL('../../engine/duel-net.js', import.meta.url).href); if (mod && mod.connectDuel) connect = mod.connectDuel; } catch (e) {}
    const tok = ++P.tok; let N;
    try { N = await connect({ game: 'capsule', code, onJoin: id => pHello(id), onLeave: id => pGone(id), onMsg: (t, d, id) => pMsg(t, d, id), onStatus: s => { P.status = s; emit(); } }); } catch (e) { N = await localDuel({ game: 'capsule', code, onJoin: id => pHello(id), onLeave: id => pGone(id), onMsg: (t, d, id) => pMsg(t, d, id), onStatus: s => { P.status = s; emit(); } }); }
    if (tok !== P.tok) { N.leave(); return; } P.net = N; pHello(); emit();
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(P.timer); P.timer = setInterval(pTick, 1000);
  }
  function pLeave(keepOpen) { P.tok++; clearInterval(P.timer); if (P.net) { try { P.net.send('ev', { k: 'bye' }); P.net.leave(); } catch (e) {} } P.net = null; P.seen = {}; if (P.match) endMatch(true); P.peers = {}; P.ready = false;
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {}
    if (!keepOpen) { P.st = null; P.code = ''; } emit(); }
  function pHello(to) { if (!P.net || !P.st) return; P.net.send('hi', { v: 1, j: P.j, ready: P.ready, playing: P.st === 'play' }, to); }
  function pMsg(t, d, id) { if (!P.net || !d) return; const now = performance.now(), known = !!P.seen[id];
    if (t === 'hi') { P.seen[id] = now; P.peers[id] = { ...(P.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (!known) setTimeout(() => pHello(id), 0); setTimeout(pMaybeStart, 0); emit(); return; }
    if (!known) return; P.seen[id] = now;
    if (t === 'pg') { if (d.t != null) P.net.send('pg', { e: d.t }, id); else if (d.e != null) { P.ping = Math.max(1, Math.round(now - d.e)); } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { P.peers[id] = { ...(P.peers[id] || {}), ready: !!d.on }; setTimeout(pMaybeStart, 0); }
    else if (d.k === 'start') pStart(d);
    else if (d.k === 'playing') P.peers[id] = { ...(P.peers[id] || {}), playing: !!d.on };
    else if (d.k === 'bye') pGone(id);
    else if (d.k === 'round') pRound(d);
    else if (d.k === 'pull') pPull(id, d);
    else if (d.k === 'final' && P.match && d.mid === P.match.mid) pFinal();
    else if (d.k === 'gift' && FIG[d.fig]) { addOwned(d.fig, 1); const who = P.match ? (P.match.players.find(p => p.id === id) || {}).name : null; snd.star(); flash((who || 'A FRIEND') + ' SENT YOU ' + FIG[d.fig].name + '!', '#22c55e', 3); }
    emit(); }
  function pGone(id) { if (!P.seen[id]) return; delete P.seen[id]; delete P.peers[id]; if (P.match && P.match.ids.includes(id)) { P.match.gone[id] = true; pCheckRound(); } emit(); }
  function pTick() { if (!P.net) return; P.net.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(P.seen)) if (now - P.seen[id] > 25000) pGone(id);
    const mt = P.match; if (mt && mt.phase === 'turn' && hostId() === P.net.id && Date.now() - mt.t0 > 60000) pResults(mt.round); }
  function pReady() { if (!P.net) return; P.ready = !P.ready; P.net.send('ev', { k: 'ready', on: P.ready }); setTimeout(pMaybeStart, 0); emit(); }
  function pMaybeStart() { if (!P.net || P.st !== 'room' || !inRoom() || hostId(false) !== P.net.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    const seq = SERIES.map((s, i) => i).sort(() => Math.random() - 0.5); while (seq.length < ROUNDS) seq.push(Math.floor(Math.random() * NS));
    const d = { k: 'start', ids: m.map(x => x.id), mid: ++P.mid + Math.floor(Math.random() * 1e6), seq }; P.net.send('ev', d); pStart(d); }
  function pStart(d) { if (!P.net || !Array.isArray(d.ids)) return; if (!d.ids.includes(P.net.id)) { P.msg = 'A game started without you. You join the next one.'; emit(); return; }
    if (G.state !== 'idle' && G.state !== 'reveal') resetMachine(); else if (G.state === 'reveal') resetMachine(); G.state = 'idle';
    P.match = { mid: d.mid, ids: d.ids.slice(), seq: d.seq || [0, 1, 2, 0, 1], players: playerList(d.ids), round: 0, phase: 'count', pulls: {}, scores: Object.fromEntries(d.ids.map(i => [i, 0])), gone: {}, t0: Date.now(), resT: 0, best: {} };
    P.st = 'play'; P.ready = false; Object.keys(P.peers).forEach(k => P.peers[k] = { ...P.peers[k], ready: false, playing: d.ids.includes(k) }); G.party = true;
    P.net.send('ev', { k: 'playing', on: true }); flash('CAPSULE PARTY! ' + ROUNDS + ' ROUNDS', '#ffd23a', 2.2);
    if (hostId() === P.net.id) setTimeout(() => pSendRound(1), 2400); emit(); }
  function pSendRound(n) { const mt = P.match; if (!mt || !P.net || hostId() !== P.net.id) return; const d = { k: 'round', n, mid: mt.mid }; P.net.send('ev', d); pRound(d); }
  function pRound(d) { const mt = P.match; if (!mt || d.mid !== mt.mid || d.n <= mt.round) return; mt.round = d.n; mt.phase = 'turn'; mt.t0 = Date.now(); mt.pulls[d.n] = mt.pulls[d.n] || {};
    resetMachine(); G.series = mt.seq[(d.n - 1) % mt.seq.length]; G.pay = 'party'; beginCrank(); snd.star(); flash('ROUND ' + d.n + ' · ' + SERIES[G.series].name, SERIES[G.series].col, 1.8); emit(); }
  function partyPulled(fig, lucky) { const mt = P.match; if (!mt || !P.net) return; const d = { k: 'pull', n: mt.round, fig, lucky: !!lucky, mid: mt.mid }; P.net.send('ev', d); pPull(P.net.id, d); }
  function pPull(id, d) { const mt = P.match; if (!mt || d.mid !== mt.mid || !FIG[d.fig]) return; (mt.pulls[d.n] = mt.pulls[d.n] || {})[id] = { fig: d.fig, lucky: !!d.lucky }; pCheckRound(); emit(); }
  function pCheckRound() { const mt = P.match; if (!mt || mt.phase !== 'turn') return; const pl = mt.pulls[mt.round] || {}, live = mt.ids.filter(i => !mt.gone[i]); if (live.every(i => pl[i])) pResults(mt.round); }
  function pResults(n) { const mt = P.match; if (!mt || mt.phase !== 'turn' || n !== mt.round) return; mt.phase = 'results'; const pl = mt.pulls[n] || {};
    for (const id of mt.ids) { const p = pl[id]; if (p) mt.scores[id] += RARITY[FIG[p.fig].rar].pts + (p.lucky ? 2 : 0); }
    const me = P.net && P.net.id; if (P.net && hostId() === me) { if (n < ROUNDS) setTimeout(() => pSendRound(n + 1), 5200); else setTimeout(() => { if (P.match === mt) pFinal(); P.net && P.net.send('ev', { k: 'final', mid: mt.mid }); }, 5200); }
    else setTimeout(() => { if (P.match === mt && mt.round === n && n >= ROUNDS && mt.phase === 'results') pFinal(); }, 6500);
    emit(); }
  function pFinal() { const mt = P.match; if (!mt || mt.phase === 'final') return; mt.phase = 'final'; const me = P.net ? P.net.id : null, top = Math.max(...mt.ids.map(i => mt.scores[i])), won = mt.scores[me] === top;
    const gold = won ? 30 : 10; save.addGold(gold); if (won) save.setStat(SK('partyWins'), save.stat(SK('partyWins'), 0) + 1); mt.goldWon = gold; mt.won = won; snd.fanfare(won ? 'golden' : 'rare'); resetMachine(); G.state = 'idle'; emit(); }
  function endMatch(silent) { P.match = null; G.party = false; if (P.st === 'play') P.st = 'room'; if (P.net) P.net.send('ev', { k: 'playing', on: false }); resetMachine(); G.state = 'idle'; if (!silent) emit(); }
  function pGift(fig, to) { if (!P.net || owned(fig) < 2) return false; addOwned(fig, -1); P.net.send('ev', { k: 'gift', fig }, to); snd.star(); flash('GIFT SENT: ' + FIG[fig].name, '#22c55e'); return true; }
  // what the page draws
  function partyHud() {
    if (!P.st) return null; const m = members(), full = P.st !== 'menu' && !!P.net && m.length === MAXP && !m.some(x => x.me), pl = playerList(m.map(x => x.id)), host = hostId(false), mt = P.match;
    const allReady = m.length >= 2 && m.every(x => x.ready), rc = m.filter(x => x.ready).length;
    const statusTxt = full ? 'ROOM FULL' : P.status === 'local' ? 'TEST · THIS DEVICE' : P.status === 'offline' ? 'OFFLINE' : P.status === 'off' ? 'NETWORK OFF' : P.status === 'online' ? (m.length > 1 ? m.length + ' IN THE ROOM' + (P.ping ? ' · ' + P.ping + ' MS' : '') : 'ONLINE') : P.st === 'menu' ? 'UP TO ' + MAXP + ' PLAYERS' : 'CONNECTING…';
    const msg = P.msg || (P.st === 'menu' ? 'Everyone turns their machine at the same time. ' + ROUNDS + ' rounds — the rarest pulls win. Make a room and send the link, or type a friend’s code.' : full ? 'Five players are already in room ' + P.code + '. Try another code.' : P.status === 'offline' ? 'Could not reach the network. Some school or work Wi-Fi blocks this.' : m.length < 2 ? 'Waiting for friends… Send them the link, or tell them the code.' : allReady ? 'Everyone is ready. Starting…' : 'Everyone taps READY. The party starts when all are ready.');
    const out = { st: P.st, code: P.code, statusTxt, statusBad: P.status === 'offline' || full, msg, full, copied: P.copied, n: m.length,
      rows: m.map(x => { const p = pl.find(q => q.id === x.id) || {}; return { id: x.id, col: p.col || '#fff', name: (p.name || '?') + (x.me ? ' · YOU' : ''), sub: x.id === host ? 'HOST' : 'PLAYER', tag: x.playing && !x.me ? 'PLAYING' : x.ready ? 'READY' : '', tagC: x.ready ? '#22c55e' : '#8a847e' }; }),
      canReady: P.st === 'room' && !full && m.length >= 2, ready: P.ready, readyTxt: P.ready ? 'READY ✓' : 'READY', readySub: P.ready ? (allReady ? 'STARTING…' : 'WAITING · ' + rc + '/' + m.length + ' READY') : ROUNDS + ' ROUNDS · ' + m.length + ' PLAYERS',
      others: m.filter(x => !x.me).map(x => { const p = pl.find(q => q.id === x.id) || {}; return { id: x.id, name: p.name, col: p.col }; }), match: null };
    if (mt) { const me = P.net ? P.net.id : null, pl2 = mt.pulls[mt.round] || {};
      const chips = mt.players.map(p => ({ col: p.col, name: p.name + (p.id === me ? ' · YOU' : ''), short: p.name, pts: mt.scores[p.id], done: !!pl2[p.id], gone: !!mt.gone[p.id], me: p.id === me }));
      const res = mt.phase === 'results' || mt.phase === 'final' ? mt.players.map(p => { const q = (mt.pulls[mt.round] || {})[p.id], F = q ? FIG[q.fig] : null, R = F ? RARITY[F.rar] : null; return { col: p.col, name: p.name + (p.id === me ? ' · YOU' : ''), fig: F ? F.name : (mt.gone[p.id] ? 'LEFT' : 'NO PULL'), rar: R ? R.name : '', rarCol: R ? R.col : '#3a3836', rarFg: R ? R.fg : '#fff', pts: q ? '+' + (R.pts + (q.lucky ? 2 : 0)) : '+0', lucky: !!(q && q.lucky), total: mt.scores[p.id] }; }) : null;
      const order = mt.players.slice().sort((a, b) => mt.scores[b.id] - mt.scores[a.id]);
      out.match = { round: mt.round, rounds: ROUNDS, phase: mt.phase, seriesName: mt.round ? SERIES[mt.seq[(mt.round - 1) % mt.seq.length]].name : 'GET READY', chips, results: res, waiting: chips.filter(c => !c.done && !c.gone).map(c => c.short),
        final: mt.phase === 'final' ? { won: mt.won, gold: mt.goldWon, title: mt.won ? 'YOU WIN THE PARTY!' : order[0] ? order[0].name + ' WINS' : '', rows: order.map((p, i) => ({ place: i + 1, col: p.col, name: p.name + (p.id === me ? ' · YOU' : ''), pts: mt.scores[p.id] })) } : null };
    }
    return out;
  }
  const party = {
    open: pOpen, close() { if (P.st === 'menu') { P.st = null; emit(); } else pLeave(); }, create() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; pJoin(k); },
    join: pJoin, leave: () => pLeave(), ready: pReady, gift: pGift, lobby() { if (P.match && P.match.phase === 'final') { endMatch(); } },
    async share(phone) { if (!P.code) return; let u; try { u = new URL(location.href); u.searchParams.set('room', P.code); u.searchParams.delete('embed'); } catch (e) { return; } try { if (navigator.share && phone) await navigator.share({ title: '8 GATES · Capsule Corner', text: 'Open capsules with me in 8 GATES. Room ' + P.code, url: u.href }); else { await navigator.clipboard.writeText(u.href); P.copied = true; emit(); setTimeout(() => { P.copied = false; emit(); }, 2000); } } catch (e) {} },
    clearMsg() { P.msg = ''; emit(); },
  };

  // ---------------------------------------------------------------- public API
  const api = {
    hud, act, pickSeries, turn: turnHold, party, thumb,
    shelf(sid) { return FIGS.filter(f => f.s === sid).map(f => ({ id: f.id, name: f.name, rar: f.rar, rarName: RARITY[f.rar].name, rarCol: RARITY[f.rar].col, rarFg: RARITY[f.rar].fg, count: owned(f.id), line: f.line })); },
    setSafe(s) { G.safe = { top: s.top || 0, bottom: s.bottom || 0, left: s.left || 0, right: s.right || 0 }; },
    setBlock(b) { G.block = !!b; if (b) G.hold = false; },
    seenHelp() { save.setFlag(SK('seenHelp')); emit(); },
    mute(m) { snd.setMuted(m == null ? !snd.muted : !!m); emit(); return snd.muted; },
    world: !!WD, snapCam() { const f = frame(shot()); CAM.pos.copy(f.pos); CAM.look.copy(f.look); CAM.off = f.off.slice(); applyCam(); },
    key(e) { onKey(e); },
    destroy() { dead = true; cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); pLeave();
      if (WD) { removeEventListener('pointerdown', onPD, true); removeEventListener('pointermove', onPM, true); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true); if (scene.parent) scene.parent.remove(scene); return; } renderer.dispose(); renderer.domElement.remove(); },
    // test hooks
    _G: G, _P: P, _force(id) { G.forceFig = id; },
  };
  { const fm = /[?&]test=1/.test(location.search) && /[?&]force=([a-z0-9]+)/.exec(location.search); if (fm && FIG[fm[1]]) G.forceFig = fm[1]; }   // test hook: ?test=1&force=m8
  Object.defineProperty(api, 'camera', { get: () => wcam || camera });
  emit();
  { const rm = !WD && /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) { pOpen(); pJoin(rm[1]); } }
  return api;
}
