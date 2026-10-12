// 8 GATES — ARCADE · CLAW CRANE [arcadeClaw]  (minigame #38)
// An arcade interior that drops into any building on any world: a row of five claw cabinets, carpet, neon.
// Win prizes for your shelf: MONSTER TRUCK MINIS, PLUSH CREATURES and PLUSH FOX HEROES (Ben, Hope, Noble, King Might).
// Modes: PLAY (tries bought with gold, prizes kept) · PRACTICE (free, nothing kept) · PARTY (2–5 pass one phone)
//        ONLINE PRIZE RACE (2–5 friends, peer to peer through engine/duel-net.js, each on their own cabinet, 90 s).
// Accessibility: AUDIO AIM sonar (beeps faster + higher when the claw is right over a prize), a landing ring that turns
// green on a good grab, haptics, and every result also goes to an aria-live line in the page.
// MERGE: createClawCrane({ container, onState, opts }) stands alone. Only imports kit files (vendor/three, fox-kit,
// engine/cast, engine/save, engine/textures). Helpers that live in village-game.js / restaurant-kit.js are copied here.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex } from '../../engine/textures.js';
import { save } from '../../engine/save.js';

export const CLAW = { key: 'arcadeClaw', name: 'CLAW CRANE', room: 'arcadeClaw', tryCost: 2, packTries: 5, packCost: 8, giftTries: 3, aimTime: 15, raceTime: 90, partyTries: 3, maxPlayers: 5, powerAfter: 7, keepRacePrizes: true };   // prices DRAFT for Ben
export const KINDS = {
  creature: { label: 'PLUSH CREATURE', pts: 1, weight: 0.85, col: '#7dd3fc', rarity: 'COMMON' },
  truck: { label: 'MONSTER TRUCK MINI', pts: 2, weight: 1.15, col: '#ffd23a', rarity: 'COLLECTABLE' },
  fox: { label: 'FOX HERO PLUSH', pts: 3, weight: 1.0, col: '#ec3013', rarity: 'RARE' },
};
// every prize name is DRAFT for Ben (no 2D source); fox heroes use THE CAST colours from fox-kit / engine/cast.js
export const PRIZES = [
  { id: 'bloop', kind: 'creature', name: 'BLOOP', line: 'A wobbly blue slime. Squeeze it, it squeaks.', w: 3 },
  { id: 'puffling', kind: 'creature', name: 'PUFFLING', line: 'A round owl puff with very big eyes.', w: 3 },
  { id: 'sprout', kind: 'creature', name: 'SPROUT', line: 'A green bun with a leaf that never wilts.', w: 3 },
  { id: 'snoozle', kind: 'creature', name: 'SNOOZLE', line: 'A sleepy seal. Always napping.', w: 3 },
  { id: 'glowbug', kind: 'creature', name: 'GLOWBUG', line: 'A yellow bug that lights the shelf at night.', w: 3 },
  { id: 'fizz', kind: 'creature', name: 'FIZZ', line: 'A pink jelly with three wiggly legs.', w: 3 },
  { id: 'mudFox', kind: 'truck', name: 'MUD FOX', line: 'Orange monster truck mini. Mud flaps included.', w: 1.6, body: '#f2741f', acc: '#1d1b20', hub: '#ffd23a' },
  { id: 'gateCrusher', kind: 'truck', name: 'GATE CRUSHER', line: 'Red crusher with the 8 on the doors.', w: 1.6, body: '#d62a1e', acc: '#e7edf4', hub: '#e7edf4' },
  { id: 'zionDuster', kind: 'truck', name: 'ZION DUSTER', line: 'Desert truck from the Zion crush pit.', w: 1.6, body: '#d9b26a', acc: '#6b3f1d', hub: '#6b3f1d' },
  { id: 'nightHowler', kind: 'truck', name: 'NIGHT HOWLER', line: 'Purple truck with green glow rims.', w: 1.6, body: '#6d3fc0', acc: '#7cf06a', hub: '#7cf06a' },
  { id: 'bigWave', kind: 'truck', name: 'BIG WAVE', line: 'Jidda surf truck. Blue and white.', w: 1.6, body: '#2a8de0', acc: '#ffffff', hub: '#ffffff' },
  { id: 'goldRush', kind: 'truck', name: 'GOLD RUSH', line: 'A gold truck. Very shiny. Very rare paint.', w: 1.2, body: '#e6b45a', acc: '#201e1d', hub: '#201e1d' },
  { id: 'benPlush', kind: 'fox', name: 'BEN PLUSH', line: 'Ben in his 8 armour, blue eyes.', w: 1 },
  { id: 'hopePlush', kind: 'fox', name: 'HOPE PLUSH', line: 'Hope with her bow, sunglasses and white cane.', w: 1 },
  { id: 'noblePlush', kind: 'fox', name: 'NOBLE PLUSH', line: 'Noble in his chair, red eyes.', w: 1 },
  { id: 'kingPlush', kind: 'fox', name: 'KING MIGHT PLUSH', line: 'The king with his gold crown. The rarest one.', w: 0.35, pts: 5 },
];
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
export const itemId = id => CLAW.key + '.' + id;   // save item ids: arcadeClaw.<prizeId>
export const ITEM_LABELS = Object.fromEntries(PRIZES.map(p => [itemId(p.id), p.name]));
const PZ = Object.fromEntries(PRIZES.map(p => [p.id, p]));
const ptsOf = p => p.pts || KINDS[p.kind].pts;

// ---------- small helpers (copied, not imported: village-game.js is not in the kit) ----------
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rr = (a, b) => a + Math.random() * (b - a), damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, pick = a => a[Math.floor(Math.random() * a.length)];
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gradientMap() { const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function texOf(w, h, draw, repeat) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); } return t; }
const FONT = '"Archivo", "Arial Black", Arial, sans-serif';

// merge many coloured parts into ONE geometry (vertex colours) → 1 draw call per prize (+1 outline)
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _pv = new THREE.Vector3();
function merge(parts) {
  const pos = [], nor = [], col = [], c = new THREE.Color();
  for (const pt of parts) {
    const g = pt.g.index ? pt.g.toNonIndexed() : pt.g.clone(); _e.set(...(pt.r || [0, 0, 0])); _q.setFromEuler(_e); _s.set(...(pt.s || [1, 1, 1])); _pv.set(...(pt.p || [0, 0, 0]));
    g.applyMatrix4(_m4.compose(_pv, _q, _s)); c.set(pt.c); const P = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < P.length; i++) { pos.push(P[i]); nor.push(N[i]); } for (let i = 0; i < P.length / 3; i++) col.push(c.r, c.g, c.b); g.dispose();
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere(); return g;
}
function mergeVC(parts) { const pos = [], nor = [], col = []; for (const pt of parts) { const g = pt.g.clone(); _e.set(...pt.r); _q.setFromEuler(_e); _pv.set(...pt.p); g.applyMatrix4(_m4.compose(_pv, _q, _s.set(1, 1, 1))); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); col.push(...g.attributes.color.array); g.dispose(); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere(); return g; }
const SPH = new THREE.SphereGeometry(1, 14, 10), SPHL = new THREE.SphereGeometry(1, 9, 7), BOX = new THREE.BoxGeometry(1, 1, 1), CYL = new THREE.CylinderGeometry(1, 1, 1, 14), CON = new THREE.ConeGeometry(1, 1, 10);
const S = (r, c, p, s = [1, 1, 1], rot) => ({ g: SPH, c, p, s: [r * s[0], r * s[1], r * s[2]], r: rot });
const Sl = (r, c, p, s = [1, 1, 1], rot) => ({ g: SPHL, c, p, s: [r * s[0], r * s[1], r * s[2]], r: rot });
const B = (w, h, d, c, p, rot) => ({ g: BOX, c, p, s: [w, h, d], r: rot });
const Cy = (rad, h, c, p, rot) => ({ g: CYL, c, p, s: [rad, h, rad], r: rot });
const Co = (rad, h, c, p, rot) => ({ g: CON, c, p, s: [rad, h, rad], r: rot });
const eyes = (x, y, z, r, col = '#141019', glint = true) => [Sl(r, col, [-x, y, z]), Sl(r, col, [x, y, z]), ...(glint ? [Sl(r * 0.38, '#ffffff', [-x + r * 0.3, y + r * 0.35, z + r * 0.7]), Sl(r * 0.38, '#ffffff', [x + r * 0.3, y + r * 0.35, z + r * 0.7])] : [])];
const tag = (x, y, z) => B(0.012, 0.03, 0.022, '#ffffff', [x, y, z], [0, 0, 0.2]);

// ---------- PRIZE MODELS (collider radius 0.1; models sit inside ~0.11) ----------
function prizeGeo(p) {
  const P = [];
  if (p.id === 'bloop') P.push(S(0.1, '#5ec8ff', [0, -0.02, 0], [1.08, 0.82, 1.05]), S(0.035, '#5ec8ff', [0.01, 0.07, -0.01]), S(0.018, '#5ec8ff', [0.03, 0.1, -0.01]), S(0.05, '#a5e4ff', [0, -0.02, 0.06], [1, 0.7, 0.5]), ...eyes(0.035, 0.015, 0.085, 0.017), B(0.03, 0.006, 0.01, '#141019', [0, -0.02, 0.098]), tag(0.1, -0.05, 0));
  else if (p.id === 'puffling') P.push(S(0.095, '#9b7ce0', [0, -0.01, 0]), S(0.06, '#d9ccf5', [0, -0.03, 0.05], [1, 1, 0.6]), Co(0.025, 0.05, '#9b7ce0', [-0.05, 0.09, 0], [0, 0, 0.35]), Co(0.025, 0.05, '#9b7ce0', [0.05, 0.09, 0], [0, 0, -0.35]),
    S(0.03, '#ffffff', [-0.033, 0.025, 0.075]), S(0.03, '#ffffff', [0.033, 0.025, 0.075]), ...eyes(0.033, 0.025, 0.098, 0.015), Co(0.014, 0.03, '#ff9a3a', [0, -0.005, 0.098], [Math.PI / 2 + 0.6, 0, 0]), S(0.035, '#7d5cc4', [-0.09, -0.02, 0], [0.5, 1, 0.9]), S(0.035, '#7d5cc4', [0.09, -0.02, 0], [0.5, 1, 0.9]), tag(0.09, -0.06, -0.03));
  else if (p.id === 'sprout') P.push(S(0.1, '#8fd16a', [0, -0.02, 0], [1.05, 0.85, 1]), Cy(0.008, 0.05, '#4f8a2e', [0, 0.085, 0]), S(0.04, '#5cb83a', [0.035, 0.11, 0], [1, 0.25, 0.6], [0, 0, 0.4]), S(0.035, '#5cb83a', [-0.03, 0.105, 0], [1, 0.25, 0.6], [0, 0, -0.5]), ...eyes(0.034, 0.0, 0.088, 0.016), S(0.016, '#ff9fb5', [-0.06, -0.025, 0.07]), S(0.016, '#ff9fb5', [0.06, -0.025, 0.07]), tag(-0.1, -0.05, 0));
  else if (p.id === 'snoozle') P.push(S(0.1, '#b9c3cf', [0, -0.03, 0], [1.1, 0.72, 1.05]), S(0.06, '#e8edf2', [0, -0.03, 0.06], [1, 0.7, 0.6]), B(0.026, 0.005, 0.01, '#2a2830', [-0.035, 0.02, 0.092], [0, 0, 0.15]), B(0.026, 0.005, 0.01, '#2a2830', [0.035, 0.02, 0.092], [0, 0, -0.15]), S(0.012, '#2a2830', [0, -0.0, 0.1]),
    S(0.04, '#9aa6b4', [-0.085, -0.06, 0.03], [1, 0.3, 0.7], [0, 0.4, -0.3]), S(0.04, '#9aa6b4', [0.085, -0.06, 0.03], [1, 0.3, 0.7], [0, -0.4, 0.3]), S(0.045, '#9aa6b4', [0, -0.06, -0.1], [1.2, 0.3, 0.6]), tag(0.1, -0.04, -0.02));
  else if (p.id === 'glowbug') P.push(S(0.09, '#ffd84a', [0, -0.015, 0]), S(0.05, '#ffe98a', [0, -0.03, 0.055], [1, 0.8, 0.5]), Cy(0.005, 0.06, '#201e1d', [-0.03, 0.09, 0.02], [0.3, 0, 0.35]), Cy(0.005, 0.06, '#201e1d', [0.03, 0.09, 0.02], [0.3, 0, -0.35]), S(0.014, '#ff6a3a', [-0.042, 0.12, 0.03]), S(0.014, '#ff6a3a', [0.042, 0.12, 0.03]),
    S(0.055, '#f4f8ff', [-0.06, 0.03, -0.06], [1, 0.25, 0.7], [0.3, 0.6, 0.6]), S(0.055, '#f4f8ff', [0.06, 0.03, -0.06], [1, 0.25, 0.7], [0.3, -0.6, -0.6]), ...eyes(0.03, 0.015, 0.078, 0.016), Sl(0.014, '#201e1d', [-0.07, -0.03, 0.03]), Sl(0.014, '#201e1d', [0.07, -0.03, 0.03]), Sl(0.012, '#201e1d', [0, 0.06, -0.06]), tag(0.09, -0.06, 0));
  else if (p.id === 'fizz') P.push(S(0.09, '#ff7fb6', [0, 0.01, 0], [1.05, 0.85, 1.05]), S(0.05, '#ffc2dc', [0, 0.05, 0.03], [1, 0.4, 0.8]), Cy(0.018, 0.06, '#ff7fb6', [-0.045, -0.07, 0.02], [0.2, 0, 0.25]), Cy(0.018, 0.06, '#ff7fb6', [0.045, -0.07, 0.02], [0.2, 0, -0.25]), Cy(0.018, 0.06, '#ff7fb6', [0, -0.07, -0.045], [-0.3, 0, 0]),
    S(0.02, '#ff7fb6', [-0.055, -0.1, 0.03]), S(0.02, '#ff7fb6', [0.055, -0.1, 0.03]), S(0.02, '#ff7fb6', [0, -0.1, -0.06]), ...eyes(0.032, 0.02, 0.078, 0.016), B(0.022, 0.012, 0.01, '#8a1f4a', [0, -0.012, 0.085]), tag(-0.09, -0.02, 0));
  else if (p.kind === 'truck') {
    const tire = '#1d1b20', glass = '#1f3d66';
    P.push(B(0.2, 0.03, 0.08, '#2c2a30', [0, -0.03, 0]), B(0.21, 0.05, 0.115, p.body, [0, 0.0, 0]), B(0.1, 0.05, 0.1, p.body, [-0.02, 0.05, 0]), B(0.104, 0.032, 0.104, glass, [-0.02, 0.053, 0]), B(0.075, 0.032, 0.106, glass, [-0.02, 0.053, 0]),
      B(0.212, 0.012, 0.117, p.acc, [0, 0.0, 0]), B(0.015, 0.02, 0.1, p.acc, [0.11, -0.01, 0]), B(0.015, 0.02, 0.1, p.acc, [-0.11, -0.01, 0]));
    for (let i = 0; i < 4; i++) P.push(Sl(0.008, '#ffd23a', [-0.05 + i * 0.02, 0.08, 0.035 - (i % 2) * 0.07]));
    for (const x of [-0.068, 0.068]) for (const z of [-0.066, 0.066]) { P.push(Cy(0.052, 0.042, tire, [x, -0.045, z], [Math.PI / 2, 0, 0]), Cy(0.026, 0.046, p.hub, [x, -0.045, z], [Math.PI / 2, 0, 0])); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; P.push(B(0.012, 0.012, 0.044, tire, [x + Math.cos(a) * 0.052, -0.045 + Math.sin(a) * 0.052, z], [0, 0, a])); } }
    P.push(Sl(0.012, '#fff6c8', [0.106, 0.012, 0.035]), Sl(0.012, '#fff6c8', [0.106, 0.012, -0.035]));
  } else if (p.kind === 'fox') {
    const o = { benPlush: { fur: '#f2741f', dark: '#c2410c', white: '#ffe4c4', eye: '#38bdf8', leg: '#e2e8f0' }, hopePlush: { fur: '#f2741f', dark: '#c2410c', white: '#ffffff', eye: '#f472b6', leg: '#38bdf8' }, noblePlush: { fur: '#f2741f', dark: '#c2410c', white: '#ffe4c4', eye: '#dc2626', leg: '#38bdf8' }, kingPlush: { fur: '#d9733a', dark: '#9a4a22', white: '#f4f4f6', eye: '#38bdf8', leg: '#e7edf4' } }[p.id];
    P.push(S(0.068, o.fur, [0, 0.035, 0.005], [1.08, 0.95, 1]), S(0.042, o.white, [0, 0.012, 0.055], [0.85, 0.62, 0.9]), Sl(0.012, '#141019', [0, 0.03, 0.098]),
      Co(0.03, 0.06, o.fur, [-0.045, 0.105, -0.005], [0, 0, 0.38]), Co(0.03, 0.06, o.fur, [0.045, 0.105, -0.005], [0, 0, -0.38]), Co(0.016, 0.034, '#1e293b', [-0.046, 0.12, 0.004], [0, 0, 0.38]), Co(0.016, 0.034, '#1e293b', [0.046, 0.12, 0.004], [0, 0, -0.38]),
      S(0.05, '#e7edf4', [0, -0.055, 0], [1.02, 0.92, 0.9]), Cy(0.022, 0.006, '#38bdf8', [0, -0.045, 0.047], [Math.PI / 2 - 0.2, 0, 0]), Cy(0.012, 0.008, '#ffffff', [0, -0.044, 0.049], [Math.PI / 2 - 0.2, 0, 0]),
      S(0.022, o.fur, [-0.055, -0.05, 0.015]), S(0.022, o.fur, [0.055, -0.05, 0.015]), S(0.024, o.leg, [-0.028, -0.1, 0.025], [1, 0.7, 1.3]), S(0.024, o.leg, [0.028, -0.1, 0.025], [1, 0.7, 1.3]),
      S(0.04, o.fur, [0, -0.055, -0.07], [0.7, 0.7, 1.35], [-0.6, 0, 0]), S(0.024, o.white, [0, -0.025, -0.112]), tag(0.05, -0.07, -0.02));
    if (p.id === 'hopePlush') P.push(B(0.084, 0.02, 0.012, '#141019', [0, 0.055, 0.072]), Sl(0.016, '#141019', [-0.022, 0.052, 0.074]), Sl(0.016, '#141019', [0.022, 0.052, 0.074]), S(0.018, '#ffffff', [0.03, 0.1, 0.03], [1.2, 0.8, 0.6], [0, 0, 0.6]), S(0.018, '#ffffff', [0.052, 0.088, 0.03], [1.2, 0.8, 0.6], [0, 0, -0.4]), Cy(0.004, 0.17, '#ffffff', [0.07, -0.04, 0.04], [0.15, 0, 0.25]), Sl(0.006, '#ec3013', [0.05, -0.12, 0.05]));
    else P.push(...eyes(0.027, 0.05, 0.064, 0.013, o.eye));
    if (p.id === 'noblePlush') P.push(Cy(0.045, 0.01, '#201e1d', [-0.07, -0.075, -0.005], [0, 0, Math.PI / 2]), Cy(0.045, 0.01, '#201e1d', [0.07, -0.075, -0.005], [0, 0, Math.PI / 2]), Cy(0.03, 0.012, '#7dd3fc', [-0.071, -0.075, -0.005], [0, 0, Math.PI / 2]), Cy(0.03, 0.012, '#7dd3fc', [0.071, -0.075, -0.005], [0, 0, Math.PI / 2]));
    if (p.id === 'kingPlush') { P.push(Cy(0.04, 0.025, '#e6b45a', [0, 0.1, 0.0]), Sl(0.009, '#ec3013', [0, 0.1, 0.04])); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; P.push(Co(0.011, 0.03, '#e6b45a', [Math.sin(a) * 0.034, 0.125, Math.cos(a) * 0.034])); } P.push(S(0.05, '#7e22ce', [0, -0.06, -0.035], [1.1, 1, 0.5])); }
  }
  return merge(P);
}

// ---------- ARCADE AUDIO: procedural chiptune music (3 tracks), mechanical SFX, room ambience. No audio files needed. ----------
// Buses: sfx + music → compressor → speakers, with a small generated room reverb. Music ducks under wins.
const MUSIC = {
  // 16th-note steps; chords = [root midi, 'maj'|'min'] per bar; lead = 8th notes (0 = rest), 4 bars
  menu: { bpm: 98, swing: 0.12, chords: [[48, 'maj'], [45, 'min'], [41, 'maj'], [43, 'maj']],
    lead: [72, 76, 79, 76, 84, 0, 79, 0, 81, 0, 79, 76, 72, 0, 76, 0, 77, 0, 81, 0, 84, 81, 77, 0, 79, 0, 83, 0, 86, 0, 0, 0], hat: 0.5, kick: [0, 8], snare: [4, 12], arp: 0.045, leadV: 0.05 },
  play: { bpm: 118, swing: 0.08, chords: [[41, 'maj'], [43, 'maj'], [40, 'min'], [45, 'min']],
    lead: [77, 0, 77, 81, 84, 0, 81, 0, 79, 0, 79, 83, 86, 0, 83, 0, 79, 0, 76, 0, 71, 0, 76, 79, 81, 0, 0, 84, 83, 81, 79, 0], hat: 1, kick: [0, 6, 8], snare: [4, 12], arp: 0.04, leadV: 0.045 },
  race: { bpm: 140, swing: 0, chords: [[45, 'min'], [41, 'maj'], [48, 'maj'], [43, 'maj']],
    lead: [69, 72, 76, 72, 81, 76, 72, 76, 65, 69, 72, 69, 77, 72, 69, 72, 67, 72, 76, 72, 79, 76, 72, 76, 67, 71, 74, 71, 79, 74, 71, 74], hat: 1, kick: [0, 4, 8, 12], snare: [4, 12], arp: 0.035, leadV: 0.04 },
};
MUSIC.hurry = { ...MUSIC.race, bpm: 156, hat: 1, leadV: MUSIC.race.leadV * 1.15 };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function ArcadeAudio() {
  let ctx = null, comp, master, sfx, mus, rev, noiseBuf, sfxOn = true, musOn = true, track = null, want = null, nextT = 0, step = 0, timer = 0, motor = null, ambT = 0, lastImpact = 0, duckUntil = 0;
  function init() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = 0.85; master.connect(comp);
      sfx = ctx.createGain(); sfx.gain.value = sfxOn ? 0.9 : 0; sfx.connect(master);
      mus = ctx.createGain(); mus.gain.value = musOn ? 0.3 : 0; mus.connect(master);
      // little room reverb from decaying noise
      const len = ctx.sampleRate * 1.4, ir = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
      const conv = ctx.createConvolver(); conv.buffer = ir; rev = ctx.createGain(); rev.gain.value = 0.22; rev.connect(conv); conv.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
      // claw motor: two detuned saws through a low-pass, gain follows the claw speed
      const mg = ctx.createGain(); mg.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 3; lp.connect(mg); mg.connect(sfx);
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; o1.frequency.value = 60; o2.frequency.value = 60.7; const g2 = ctx.createGain(); g2.gain.value = 0.4; o1.connect(lp); o2.connect(g2); g2.connect(lp); o1.start(); o2.start(); motor = { mg, lp, o1, o2 };
      // room tone
      const rn = ctx.createBufferSource(); rn.buffer = noiseBuf; rn.loop = true; const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 260; const rg = ctx.createGain(); rg.gain.value = 0.035; rn.connect(rf); rf.connect(rg); rg.connect(sfx); rn.start();
      timer = setInterval(schedule, 25); return true;
    } catch (e) { ctx = null; return false; }
  }
  const unlock = () => { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); };
  addEventListener('pointerdown', unlock, { capture: true }); addEventListener('keydown', unlock, { capture: true }); addEventListener('touchend', unlock, { capture: true });
  const live = () => !!ctx && ctx.state === 'running';
  const out = (bus, pan, send) => { let n = bus; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; p.connect(bus); n = p; } if (send) { const s = ctx.createGain(); s.gain.value = send; s.connect(rev); const sp = ctx.createGain(); sp.connect(n); sp.connect(s); return sp; } return n; };
  function osc(type, f, t, dur, vol, o = {}) { const os = ctx.createOscillator(), g = ctx.createGain(); os.type = type; os.frequency.setValueAtTime(f, t); if (o.f2) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + (o.slide || dur)); if (o.vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5.5; lg.gain.value = o.vib; l.connect(lg); lg.connect(os.detune); l.start(t); l.stop(t + dur + 0.05); }
    const a = o.attack || 0.005; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); let n = g; if (o.lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; g.connect(fl); n = fl; }
    os.connect(g); n.connect(out(o.bus || sfx, o.pan, o.send)); os.start(t); os.stop(t + dur + 0.05); }
  function noise(t, dur, vol, o = {}) { const s = ctx.createBufferSource(), g = ctx.createGain(), fl = ctx.createBiquadFilter(); s.buffer = noiseBuf; fl.type = o.type || 'bandpass'; fl.frequency.setValueAtTime(o.f || 1200, t); if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + dur); fl.Q.value = o.q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.003)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(out(o.bus || sfx, o.pan, o.send)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); }
  // ---------- music scheduler ----------
  const TRI = { maj: [0, 4, 7], min: [0, 3, 7] };
  function schedule() {
    if (!live()) return; const now = ctx.currentTime;
    if (want !== track && (step % 16 === 0 || !track)) { track = want; step = 0; nextT = Math.max(nextT, now + 0.05); }
    // duck music under big moments
    mus.gain.setTargetAtTime(!musOn ? 0 : now < duckUntil ? 0.08 : 0.3, now, 0.12);
    if (!track) { nextT = now + 0.05; return; }
    const T = MUSIC[track], sp = 60 / T.bpm / 4;
    while (nextT < now + 0.12) { playStep(T, step, nextT, sp); nextT += sp * (step % 2 ? 1 - T.swing : 1 + T.swing); step = (step + 1) % 64; }
  }
  function playStep(T, s, t, sp) {
    const bar = Math.floor(s / 16), b = s % 16, [root, q] = T.chords[bar], tri = TRI[q];
    // drums
    if (T.kick.includes(b)) osc('sine', 150, t, 0.16, 0.5, { f2: 42, slide: 0.12, bus: mus });
    if (T.snare.includes(b)) { noise(t, 0.12, 0.22, { f: 1900, q: 0.8, bus: mus, send: 0.3 }); osc('triangle', 210, t, 0.07, 0.12, { f2: 150, bus: mus }); }
    if (T.hat && (b % 2 === 0 || T.hat > 0.8)) noise(t, b % 4 === 2 ? 0.06 : 0.03, b % 4 === 2 ? 0.07 : 0.035, { type: 'highpass', f: 7500, bus: mus });
    // bass: root on the beat, octave bounce on the off-beats
    if (b % 4 === 0 || b % 4 === 3 && T.bpm > 110 || b === 6 || b === 14) osc('triangle', mtof(root - 12 + (b % 8 === 6 ? 12 : 0)), t, sp * 1.8, 0.32, { bus: mus });
    if (b % 4 === 0) osc('square', mtof(root - 12), t, sp * 1.2, 0.05, { bus: mus, lp: 500 });
    // arp: chord tones climbing, 16ths
    const at = root + 24 + tri[s % 3] + (Math.floor(s / 3) % 2 ? 12 : 0); osc('square', mtof(at), t, sp * 0.9, T.arp, { bus: mus, lp: 2600, pan: (s % 2 ? 0.25 : -0.25) });
    // lead: 8th notes
    if (b % 2 === 0) { const n = T.lead[bar * 8 + b / 2]; if (n) { let len = 1; while (len < 4 && !T.lead[bar * 8 + b / 2 + len] && b / 2 + len < 8) len++; osc('square', mtof(n), t, sp * 2 * len * 0.92, T.leadV, { bus: mus, vib: 12, lp: 3800, send: 0.4, attack: 0.01 }); osc('triangle', mtof(n + 12), t, sp * 2 * len * 0.6, T.leadV * 0.5, { bus: mus }); } }
  }
  // ---------- sound effects ----------
  const S = {
    ui() { const t = ctx.currentTime; osc('square', 1400, t, 0.04, 0.06, { lp: 4000 }); },
    coin() { const t = ctx.currentTime; [2637, 3520].forEach((f, i) => { osc('sine', f, t + i * 0.07, 0.35, 0.16, { send: 0.3 }); osc('sine', f * 2.76, t + i * 0.07, 0.12, 0.05); }); noise(t + 0.14, 0.18, 0.08, { f: 3000, q: 2 }); osc('square', 988, t + 0.25, 0.08, 0.1); osc('square', 1319, t + 0.32, 0.22, 0.1, { send: 0.3 }); },
    credit() { const t = ctx.currentTime; [660, 880, 1320].forEach((f, i) => osc('square', f, t + i * 0.06, 0.09, 0.07, { lp: 3000 })); },
    button() { const t = ctx.currentTime; noise(t, 0.05, 0.3, { f: 900, q: 0.7 }); osc('sine', 120, t, 0.12, 0.4, { f2: 60 }); osc('square', 520, t + 0.02, 0.12, 0.06, { f2: 260, lp: 1500 }); },
    clack() { const t = ctx.currentTime; noise(t, 0.04, 0.45, { f: 2600, q: 3 }); noise(t + 0.05, 0.05, 0.3, { f: 1800, q: 4 }); osc('square', 180, t, 0.06, 0.12, { lp: 900 }); },
    squish() { const t = ctx.currentTime; noise(t, 0.22, 0.25, { type: 'lowpass', f: 900, f2: 220, attack: 0.02 }); osc('sine', 320, t, 0.18, 0.12, { f2: 180 }); },
    plastic() { const t = ctx.currentTime; [0, 0.035, 0.07].forEach((d, i) => noise(t + d, 0.03, 0.25 - i * 0.07, { f: 3200 - i * 400, q: 6 })); },
    miss() { const t = ctx.currentTime; osc('square', 300, t, 0.12, 0.08, { f2: 200, lp: 1200 }); osc('square', 220, t + 0.13, 0.25, 0.08, { f2: 140, lp: 1000 }); },
    slip() { const t = ctx.currentTime; osc('sine', 1100, t, 0.55, 0.14, { f2: 260, slide: 0.5, vib: 30 }); noise(t + 0.5, 0.12, 0.15, { type: 'lowpass', f: 500 }); },
    release() { const t = ctx.currentTime; noise(t, 0.05, 0.25, { f: 2200, q: 3 }); osc('triangle', 700, t, 0.08, 0.06, { f2: 900 }); },
    chute() { const t = ctx.currentTime; osc('sine', 110, t, 0.22, 0.5, { f2: 55 }); noise(t, 0.18, 0.3, { type: 'lowpass', f: 700 }); [0.12, 0.2, 0.26].forEach((d, i) => noise(t + d, 0.04, 0.12 - i * 0.03, { f: 1500, q: 2 })); },
    fanfare(big) { const t = ctx.currentTime + 0.05; duckUntil = ctx.currentTime + (big ? 2.6 : 2); const N = [72, 76, 79, 84, 79, 84, 88]; N.forEach((n, i) => { osc('square', mtof(n), t + i * 0.085, i === N.length - 1 ? 0.6 : 0.12, 0.09, { lp: 4000, send: 0.4 }); osc('triangle', mtof(n - 12), t + i * 0.085, 0.14, 0.12); });
      osc('triangle', mtof(48), t + 0.6, 0.7, 0.3); [84, 88, 91].forEach(n => osc('square', mtof(n), t + 0.6, 0.7, 0.05, { lp: 3500, vib: 15, send: 0.5 })); for (let i = 0; i < (big ? 14 : 8); i++) osc('sine', 2000 + Math.random() * 3000, t + 0.6 + i * 0.05, 0.12, 0.04, { send: 0.6, pan: Math.random() * 1.6 - 0.8 }); },
    sparkle() { const t = ctx.currentTime + 0.7; [96, 100, 103, 108].forEach((n, i) => osc('sine', mtof(n), t + i * 0.07, 0.4, 0.06, { send: 0.7, pan: i % 2 ? 0.4 : -0.4 })); },
    power() { const t = ctx.currentTime; osc('sawtooth', 110, t, 0.9, 0.09, { f2: 880, slide: 0.85, lp: 2200 }); osc('square', 220, t, 0.9, 0.05, { f2: 1760, slide: 0.85, lp: 3000 }); noise(t, 0.9, 0.08, { type: 'bandpass', f: 400, f2: 5000, q: 2 }); },
    tick(hi) { const t = ctx.currentTime; osc('square', hi ? 1760 : 1320, t, 0.05, 0.08, { lp: 5000 }); },
    count(go) { const t = ctx.currentTime; osc('square', go ? 1046 : 523, t, go ? 0.45 : 0.15, 0.12, { send: 0.3 }); if (go) osc('square', 1568, t, 0.45, 0.06); },
    whoosh() { const t = ctx.currentTime; noise(t, 0.4, 0.2, { type: 'bandpass', f: 400, f2: 3000, q: 1.5, attack: 0.15 }); },
    restock() { const t = ctx.currentTime; for (let i = 0; i < 9; i++) { const d = i * 0.07 + Math.random() * 0.04; noise(t + d, 0.09, 0.18, { type: 'lowpass', f: 600 + Math.random() * 400 }); osc('sine', 140 + Math.random() * 60, t + d, 0.08, 0.15, { f2: 70 }); } },
    win() { S.fanfare(true); }, lose() { const t = ctx.currentTime; duckUntil = t + 1.6; [67, 66, 65, 64].forEach((n, i) => osc('square', mtof(n), t + i * 0.22, i === 3 ? 0.7 : 0.2, 0.08, { lp: 1800, vib: i === 3 ? 40 : 0 })); },
    // a little voice per prize kind: plush squeaks, truck engine, fox yips (King Might: a royal trumpet)
    voice(kind, id) { const t = ctx.currentTime;
      if (kind === 'truck') { osc('sawtooth', 58, t, 0.75, 0.16, { f2: 150, slide: 0.45, lp: 700 }); osc('square', 29, t, 0.75, 0.1, { f2: 75, slide: 0.45, lp: 400 }); noise(t, 0.6, 0.06, { type: 'lowpass', f: 300 }); [0.5, 0.62].forEach(d => osc('square', 700, t + d, 0.09, 0.05, { lp: 2000 })); }
      else if (kind === 'fox') { if (id === 'kingPlush') [60, 67, 72, 76, 79].forEach((n, i) => osc('sawtooth', mtof(n), t + i * 0.09, i === 4 ? 0.6 : 0.12, 0.07, { lp: 2400, send: 0.5, vib: i === 4 ? 14 : 0 }));
        else [0, 0.16].forEach((d, i) => { osc('sine', 650, t + d, 0.12, 0.16, { f2: 1350 - i * 150, slide: 0.06, send: 0.3 }); osc('triangle', 1300, t + d + 0.06, 0.06, 0.05, { f2: 800 }); }); }
      else [0, 0.13, 0.26].forEach((d, i) => osc('sine', 950 + i * 160, t + d, 0.1, 0.13, { f2: 1600 + i * 200, slide: 0.05, send: 0.35 })); },
    beep(q) { const t = ctx.currentTime; osc('sine', q > 0 ? 380 + q * 700 : 200, t, 0.06, q > 0 ? 0.08 : 0.035); },
  };
  return {
    unlock, get on() { return sfxOn; }, set on(v) { sfxOn = !!v; if (ctx) sfx.gain.setTargetAtTime(sfxOn ? 0.9 : 0, ctx.currentTime, 0.05); },
    get music() { return musOn; }, set music(v) { musOn = !!v; },
    track(name) { want = name; },
    play(name, ...a) { if (!live() || !sfxOn || !S[name]) return; try { S[name](...a); } catch (e) {} },
    selfTest() { if (!live()) return 'audio not running'; const errs = []; for (const k of Object.keys(S)) { try { k === 'voice' ? ['creature', 'truck', 'fox'].forEach(v => S.voice(v, v === 'fox' ? 'kingPlush' : '')) : S[k](true); } catch (e) { errs.push(k + ': ' + e.message); } } return errs.length ? errs : 'ok ' + Object.keys(S).length + ' sounds · music ' + (track || 'none'); },
    // per-frame motor: level 0..1 (how hard it works), pitch 0..1 (speed / up-down)
    motor(level, pitch) { if (!live() || !motor) return; const t = ctx.currentTime; motor.mg.gain.setTargetAtTime(sfxOn ? level * 0.11 : 0, t, 0.05); const f = 48 + pitch * 46; motor.o1.frequency.setTargetAtTime(f, t, 0.08); motor.o2.frequency.setTargetAtTime(f * 1.012, t, 0.08); motor.lp.frequency.setTargetAtTime(300 + pitch * 500, t, 0.08); },
    // prize bumps in the pile (rate limited)
    impact(v, kind) { if (!live() || !sfxOn) return; const t = ctx.currentTime; if (t - lastImpact < 0.07) return; lastImpact = t; const vol = Math.min(0.2, v * 0.12);
      if (kind === 'truck') noise(t, 0.035, vol, { f: 2800, q: 5 }); else noise(t, 0.09, vol, { type: 'lowpass', f: 420 + v * 200 }); },
    // distant machines blipping around the room
    ambience(dt) { if (!live() || !sfxOn) return; ambT -= dt; if (ambT > 0) return; ambT = 0.8 + Math.random() * 2.2; const t = ctx.currentTime, pan = (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.4), base = 60 + Math.floor(Math.random() * 12);
      const kind = Math.random(); if (kind < 0.5) [0, 4, 7, 12].forEach((s, i) => osc('square', mtof(base + s), t + i * 0.06, 0.07, 0.012, { pan, lp: 1600, send: 0.6 })); else if (kind < 0.8) osc('square', mtof(base + 12), t, 0.25, 0.01, { f2: mtof(base), pan, lp: 1400, send: 0.6 }); else noise(t, 0.3, 0.015, { f: 3000, q: 3, pan, send: 0.6 }); },
    destroy() { clearInterval(timer); removeEventListener('pointerdown', unlock, { capture: true }); removeEventListener('keydown', unlock, { capture: true }); removeEventListener('touchend', unlock, { capture: true }); try { ctx && ctx.close(); } catch (e) {} },
  };
}

// ---------- NET (peer to peer). engine/duel-net.js is the shared transport (same as Skate Park); if it is missing, a
// BroadcastChannel fallback lets two tabs on one device play (status 'local'). ----------
async function openNet(code, h) {
  try { const mod = await import(new URL('../../engine/duel-net.js', import.meta.url).href); return await mod.connectDuel({ game: CLAW.key, code, ...h }); }
  catch (e) {
    const id = Math.random().toString(36).slice(2, 10), bc = new BroadcastChannel(CLAW.key + '-' + code);
    bc.onmessage = ev => { const m = ev.data; if (!m || m.from === id || (m.to && m.to !== id)) return; if (m.t === '__join') { h.onJoin && h.onJoin(m.from); return; } h.onMsg && h.onMsg(m.t, m.d, m.from); };
    setTimeout(() => { h.onStatus && h.onStatus('local'); bc.postMessage({ t: '__join', from: id }); }, 0);
    return { id, send(t, d, to) { bc.postMessage({ t, d, to, from: id }); }, leave() { try { bc.close(); } catch (er) {} } };
  }
}

export async function createClawCrane({ container, onState, opts = {} }) {
  // ---------- stage ----------
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#140c26'); const camera = new THREE.PerspectiveCamera(45, CW() / CH(), 0.05, 60);
  const grad = gradientMap(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.02, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const grad4 = (() => { const d = new Uint8Array([78, 78, 78, 255, 140, 140, 140, 255, 205, 205, 205, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const vcMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad4, emissive: new THREE.Color('#2a1838'), emissiveIntensity: 0.35 });
  // phone budget: fold every static mesh of a group into one mesh per material (cabinet bodies, rails, trims, outlines)
  function bake(root, skip = []) {
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), groups = new Map(), done = [], mm = new THREE.Matrix4();
    const skipped = o => { for (let q = o; q && q !== root; q = q.parent) if (skip.includes(q)) return true; return false; };
    root.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.material.transparent || skipped(o)) return; const k = o.material; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(o); });
    for (const [mat, list] of groups) { if (list.length < 2) continue; const pos = [], nor = [], uv = [], wantUv = !!mat.map;
      for (const o of list) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(mm.multiplyMatrices(inv, o.matrixWorld)); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); if (wantUv) uv.push(...(g.attributes.uv ? g.attributes.uv.array : new Float32Array(g.attributes.position.count * 2))); g.dispose(); done.push(o); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); if (wantUv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeBoundingSphere(); root.add(new THREE.Mesh(g, mat)); }
    for (const o of done) if (o.parent) o.parent.remove(o);
  }

  scene.add(new THREE.HemisphereLight(0xd8ccff, 0x3a2050, 1.25)); const sun = new THREE.DirectionalLight(0xfff2e0, 1.5); sun.position.set(2, 6, 7); scene.add(sun);
  const snd = ArcadeAudio(); snd.on = save.stat(CLAW.key + '.sound', 1) !== 0; snd.music = save.stat(CLAW.key + '.music', 1) !== 0;
  let emitT = 0, ready = false;
  const buzz = ms => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch (e) {} };

  // ---------- the room: carpet, walls, neon ----------
  const carpet = texOf(256, 256, (g, w, h) => { g.fillStyle = '#1a1036'; g.fillRect(0, 0, w, h); const cols = ['#ff4fa3', '#38bdf8', '#ffd23a', '#7cf06a'];
    for (let i = 0; i < 26; i++) { g.strokeStyle = cols[i % 4]; g.lineWidth = 5; const x = (i * 73) % w, y = (i * 131) % h; g.beginPath(); if (i % 3 === 0) { g.arc(x, y, 14, 0, 7); } else if (i % 3 === 1) { g.moveTo(x - 14, y + 10); g.lineTo(x, y - 14); g.lineTo(x + 14, y + 10); g.closePath(); } else { g.moveTo(x - 18, y); g.quadraticCurveTo(x - 9, y - 14, x, y); g.quadraticCurveTo(x + 9, y + 14, x + 18, y); } g.stroke(); } }, [7, 5]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), new THREE.MeshLambertMaterial({ map: carpet })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 2); scene.add(floor);
  const wallM = toon('#2a1850'); const wall = new THREE.Mesh(new THREE.PlaneGeometry(18, 6), wallM); wall.position.set(0, 3, -1.6); scene.add(wall);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), wallM); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 9, 3, 3); scene.add(w); }
  const neon = (txt, col, w = 1024, h = 256) => texOf(w, h, (g) => { g.font = `900 ${h * 0.62}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 28; g.strokeStyle = col; g.lineWidth = 10; g.strokeText(txt, w / 2, h / 2 + 6); g.shadowBlur = 8; g.fillStyle = '#ffffff'; g.fillText(txt, w / 2, h / 2 + 6); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), new THREE.MeshBasicMaterial({ map: neon(opts.sign || 'PRIZE ARCADE', '#ff4fa3'), transparent: true, depthWrite: false })); sign.position.set(0, 3.55, -1.58); scene.add(sign);
  const stripM = new THREE.MeshBasicMaterial({ color: '#38bdf8' }); for (const y of [0.06, 4.6]) { const st = new THREE.Mesh(new THREE.BoxGeometry(18, 0.05, 0.05), y > 1 ? new THREE.MeshBasicMaterial({ color: '#ff4fa3' }) : stripM); st.position.set(0, y, -1.56); scene.add(st); }
  // ---- polish: fog, rim lights, glow sprites, wall neon, light cones, floor glow, back-row video cabinets ----
  scene.fog = new THREE.FogExp2('#140c26', 0.055);
  const rimP = new THREE.DirectionalLight(0xff4fa3, 0.55); rimP.position.set(-6, 3, 2); scene.add(rimP); const rimC = new THREE.DirectionalLight(0x38bdf8, 0.55); rimC.position.set(6, 3, 2); scene.add(rimC);
  const glowTex = texOf(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const addMat = (col, op = 1, map = glowTex) => new THREE.MeshBasicMaterial({ map, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const signGlow = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 2.2), addMat('#ff4fa3', 0.55)); signGlow.position.set(0, 3.55, -1.585); scene.add(signGlow);
  const neonPiece = (draw, col, w, h, x, y, rot = 0) => { const t = texOf(256, 256, (g) => { g.lineCap = g.lineJoin = 'round'; g.shadowColor = col; g.shadowBlur = 22; g.strokeStyle = col; g.lineWidth = 14; draw(g); g.stroke(); g.shadowBlur = 6; g.strokeStyle = '#ffffff'; g.lineWidth = 5; draw(g); g.stroke(); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(x, y, -1.57); m.rotation.z = rot; scene.add(m); const gl = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.8, h * 1.8), addMat(col, 0.35)); gl.position.set(x, y, -1.575); scene.add(gl); return [m, gl]; };
  const star = g => { g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 44 : 104, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.closePath(); };
  const bolt = g => { g.beginPath(); g.moveTo(150, 24); g.lineTo(80, 140); g.lineTo(128, 140); g.lineTo(100, 232); g.lineTo(184, 104); g.lineTo(134, 104); g.closePath(); };
  const paw = g => { g.beginPath(); g.ellipse(128, 160, 52, 44, 0, 0, 7); for (const [px, py] of [[66, 92], [104, 62], [152, 62], [190, 92]]) { g.moveTo(px + 20, py); g.ellipse(px, py, 20, 26, 0, 0, 7); } };
  const heart = g => { g.beginPath(); g.moveTo(128, 214); g.bezierCurveTo(20, 140, 40, 40, 128, 88); g.bezierCurveTo(216, 40, 236, 140, 128, 214); };
  const neons = [neonPiece(star, '#ffd23a', 1.2, 1.2, -3.3, 3.2, -0.15), neonPiece(bolt, '#38bdf8', 1.1, 1.1, 3.3, 3.2, 0.12), neonPiece(paw, '#f2741f', 1.1, 1.1, -6.2, 2.6), neonPiece(heart, '#ff4fa3', 1.1, 1.1, 6.2, 2.6)];
  // spotlight cones over each cabinet + glow pools on the carpet
  const coneTex = texOf(4, 128, (g) => { const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 4, 128); });
  const coneGeo = new THREE.CylinderGeometry(0.12, 1.05, 2.6, 24, 1, true);
  function lightCone(x, col) { const m = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ map: coneTex, color: col, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); m.position.set(x, 3.95, 0.25); scene.add(m);
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.12, 16), new THREE.MeshBasicMaterial({ color: '#fff6e0' })); lamp.position.set(x, 5.25, 0.25); scene.add(lamp);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), addMat(col, 0.45)); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.012, 0.85); scene.add(pool); return { m, pool }; }
  // back-row video cabinets (static, baked) with glowing screens
  const screenTex = (hue) => texOf(128, 96, (g) => { g.fillStyle = '#05030c'; g.fillRect(0, 0, 128, 96); for (let i = 0; i < 70; i++) { g.fillStyle = `hsl(${(hue + i * 9) % 360},90%,60%)`; g.fillRect((i * 37) % 120, (i * 23) % 88, 6, 6); } g.fillStyle = '#fff'; g.font = `900 14px ${FONT}`; g.fillText('HI 08000', 30, 16); }, [1, 1]);
  function videoCab(x, rotY, hue) { const G = new THREE.Group(); G.position.set(x, 0, -0.9); G.rotation.y = rotY; scene.add(G); const bd = toon(`hsl(${hue},55%,32%)`), dk = toon('#120c1e');
    M(new THREE.BoxGeometry(0.8, 1.9, 0.75), bd, 0, 0.95, 0, G, 0.02); M(new THREE.BoxGeometry(0.82, 0.3, 0.5), dk, 0, 1.0, 0.36, G, 0.015); M(new THREE.BoxGeometry(0.84, 0.28, 0.8), bd, 0, 2.0, 0, G, 0.02);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.48), new THREE.MeshBasicMaterial({ map: screenTex(hue) })); sc.position.set(0, 1.45, 0.38); sc.rotation.x = -0.18; G.add(sc);
    const mq = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.2), new THREE.MeshBasicMaterial({ color: `hsl(${(hue + 40) % 360},95%,62%)` })); mq.position.set(0, 2.0, 0.405); G.add(mq);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.1), addMat(`hsl(${hue},95%,60%)`, 0.5)); sg.position.set(0, 1.45, 0.4); G.add(sg); bake(G, [sc, mq, sg]); return { sc, hue }; }
  const videos = [videoCab(-6.4, 0.25, 280), videoCab(-7.4, 0.35, 190), videoCab(6.4, -0.25, 20), videoCab(7.4, -0.35, 120)];

  // ---------- one cabinet (main + 4 neighbours share the build) ----------
  const W = 1.2, D = 0.8, IH = 1.15, F = 0.92, HX1 = -W / 2 + 0.32, HZ0 = D / 2 - 0.32, DIVH = 0.2, CHUTE = { x: (-W / 2 + HX1) / 2, z: (HZ0 + D / 2) / 2 }, TOPY = IH - 0.34, CLAWR = 0.15;
  const glassM = new THREE.MeshPhongMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.1, shininess: 120, depthWrite: false, side: THREE.DoubleSide });
  const streak = texOf(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(30, 256); g.lineTo(80, 256); g.lineTo(160, 0); g.lineTo(130, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(100, 256); g.lineTo(112, 256); g.lineTo(192, 0); g.lineTo(180, 0); g.fill(); });
  streak.wrapS = THREE.RepeatWrapping;
  const streakM = new THREE.MeshBasicMaterial({ map: streak, transparent: true, depthWrite: false, opacity: 0.8 });
  const plexM = new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.28, depthWrite: false });
  const backTex = texOf(256, 256, (g) => { g.fillStyle = '#ffe7f3'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 40; i++) { g.fillStyle = ['#ff9fd0', '#9fd8ff', '#ffe08a'][i % 3]; const x = (i * 97) % 256, y = (i * 53) % 256; g.save(); g.translate(x, y); g.rotate(i); g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 6 : 14, a = k / 10 * Math.PI * 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore(); } }, [2, 2]);
  const marqTex = (txt, col) => texOf(512, 160, (g) => { g.fillStyle = '#120a22'; g.fillRect(0, 0, 512, 160); g.strokeStyle = col; g.lineWidth = 8; g.strokeRect(10, 10, 492, 140); g.font = `900 78px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 18; g.fillStyle = '#ffffff'; g.fillText(txt, 256, 84); });
  const bulbGeo = new THREE.SphereGeometry(0.022, 8, 6);
  const sideArt = col => texOf(256, 192, (g) => { g.fillStyle = col; g.fillRect(0, 0, 256, 192); g.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = -4; i < 12; i++) { g.beginPath(); g.moveTo(i * 32, 192); g.lineTo(i * 32 + 16, 192); g.lineTo(i * 32 + 112, 0); g.lineTo(i * 32 + 96, 0); g.fill(); }
    g.fillStyle = '#ffffff'; for (const [x, y, r] of [[48, 50, 16], [200, 140, 22], [140, 40, 10], [70, 150, 12]]) { g.beginPath(); for (let k = 0; k < 10; k++) { const rr2 = k % 2 ? r * 0.45 : r, a = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.fill(); }
    g.font = `900 34px ${FONT}`; g.lineWidth = 6; g.strokeStyle = '#1a1626'; g.strokeText('WIN!', 120, 112); g.fillStyle = '#ffd23a'; g.fillText('WIN!', 120, 112); });
  const insertTex = texOf(192, 64, (g) => { g.fillStyle = '#120a22'; g.fillRect(0, 0, 192, 64); g.font = `900 24px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#7cf06a'; g.shadowBlur = 10; g.fillStyle = '#b8ffa8'; g.fillText('INSERT COIN', 96, 34); });
  const pushTex = texOf(192, 128, (g) => { g.clearRect(0, 0, 192, 128); g.font = `900 40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(0,0,0,0.55)'; g.fillText('PRIZE', 96, 52); g.font = `800 22px ${FONT}`; g.fillText('PUSH ▸', 96, 94); });
  function buildCabinet(x, col, { main = false, label = 'CLAW CRANE' } = {}) {
    const OL = main ? 1 : 0;
    const G = new THREE.Group(); G.position.x = x; scene.add(G); const body = toon(col), dark = toon('#201a2e'), trim = toon('#e7edf4');
    M(new THREE.BoxGeometry(W + 0.16, F, D + 0.22), body, 0, F / 2, 0, G, 0.02);
    M(new THREE.BoxGeometry(W + 0.16, 0.1, 0.32), dark, 0, F - 0.04, D / 2 + 0.24, G, 0.015);   // control ledge
    M(new THREE.BoxGeometry(0.36, 0.28, 0.02), dark, CHUTE.x, 0.5, D / 2 + 0.115, G, 0);   // prize door
    const flap = M(new THREE.BoxGeometry(0.3, 0.2, 0.02), new THREE.MeshBasicMaterial({ color: '#ffd23a' }), CHUTE.x, 0.5, D / 2 + 0.125, G, 0);
    M(new THREE.BoxGeometry(0.18, 0.05, 0.02), toon('#e7edf4'), 0.32, 0.55, D / 2 + 0.115, G, 0);   // coin slot
    const art = sideArt(col); for (const sx of [-1, 1]) { const sp = new THREE.Mesh(new THREE.PlaneGeometry(D + 0.1, F - 0.12), new THREE.MeshBasicMaterial({ map: art, color: '#d8d0e8' })); sp.rotation.y = sx * Math.PI / 2; sp.position.set(sx * (W / 2 + 0.081), F / 2, 0); G.add(sp); }
    const ic = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1), new THREE.MeshBasicMaterial({ map: insertTex, transparent: true })); ic.position.set(0.32, 0.68, D / 2 + 0.112); G.add(ic);
    const pd = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ map: pushTex, transparent: true, depthWrite: false })); pd.position.set(CHUTE.x, 0.5, D / 2 + 0.137); G.add(pd);
    M(new THREE.BoxGeometry(W + 0.17, 0.03, 0.03), toon('#e7edf4'), 0, F - 0.005, D / 2 + 0.11, G, 0); M(new THREE.BoxGeometry(W + 0.17, 0.03, 0.03), toon('#e7edf4'), 0, 0.03, D / 2 + 0.11, G, 0);
    const stick = new THREE.Group(); stick.position.set(-0.25, F + 0.02, D / 2 + 0.25); G.add(stick); M(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 8), trim, 0, 0.065, 0, stick, 0); M(new THREE.SphereGeometry(0.035, 12, 10), toon('#ec3013'), 0, 0.14, 0, stick, 0.01, 0.035);
    const btn = M(new THREE.CylinderGeometry(0.06, 0.06, 0.035, 18), toon('#ec3013', { emissive: new THREE.Color('#ec3013'), emissiveIntensity: 0.3 }), 0.25, F + 0.03, D / 2 + 0.25, G, 0.012);
    const inner = new THREE.Group(); inner.position.y = F; G.add(inner);
    M(new THREE.BoxGeometry(W - 0.04, 0.018, 0.03), new THREE.MeshBasicMaterial({ color: '#fffaf0' }), 0, IH - 0.012, D / 2 - 0.03, inner, 0);   // light bar inside the glass
    // floor with the chute hole, dividers, chute
    const fl = toon('#ffd6ea'); M(new THREE.BoxGeometry(W / 2 - HX1, 0.04, D), fl, (HX1 + W / 2) / 2, -0.02, 0, inner, 0); M(new THREE.BoxGeometry(HX1 + W / 2, 0.04, HZ0 + D / 2), fl, (HX1 - W / 2) / 2, -0.02, (HZ0 - D / 2) / 2, inner, 0);
    M(new THREE.BoxGeometry(0.31, 0.5, 0.31), new THREE.MeshBasicMaterial({ color: '#0a0612' }), CHUTE.x, -0.27, CHUTE.z, inner, 0);
    const d1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, DIVH, D / 2 - HZ0), plexM); d1.position.set(HX1, DIVH / 2, (HZ0 + D / 2) / 2); inner.add(d1);
    const d2 = new THREE.Mesh(new THREE.BoxGeometry(HX1 + W / 2, DIVH, 0.02), plexM); d2.position.set((HX1 - W / 2) / 2, DIVH / 2, HZ0); inner.add(d2);
    M(new THREE.BoxGeometry(0.03, 0.025, D / 2 - HZ0 + 0.02), toon('#ffd23a'), HX1, DIVH, (HZ0 + D / 2) / 2, inner, 0); M(new THREE.BoxGeometry(HX1 + W / 2 + 0.02, 0.025, 0.03), toon('#ffd23a'), (HX1 - W / 2) / 2, DIVH, HZ0, inner, 0);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, IH), new THREE.MeshBasicMaterial({ map: backTex, color: '#e8dcff' })); back.position.set(0, IH / 2, -D / 2 - 0.005); inner.add(back);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.BoxGeometry(0.05, IH, 0.05), trim, sx * (W / 2 + 0.03), IH / 2, sz * (D / 2 + 0.03), inner, 0.012);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.06, IH), glassM); gl.position.set(0, IH / 2, D / 2 + 0.03); gl.renderOrder = 5; inner.add(gl);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.06, IH), streakM); st.position.set(0, IH / 2, D / 2 + 0.032); st.renderOrder = 6; inner.add(st);
    for (const s of [-1, 1]) { const sg = new THREE.Mesh(new THREE.PlaneGeometry(D + 0.06, IH), glassM); sg.rotation.y = Math.PI / 2; sg.position.set(s * (W / 2 + 0.03), IH / 2, 0); sg.renderOrder = 5; inner.add(sg); }
    // marquee + chase bulbs
    M(new THREE.BoxGeometry(W + 0.16, 0.38, D + 0.22), body, 0, F + IH + 0.19, 0, G, 0.02);
    const mq = new THREE.Mesh(new THREE.PlaneGeometry(W, 0.3), new THREE.MeshBasicMaterial({ map: marqTex(label, '#ffd23a') })); mq.position.set(0, F + IH + 0.19, D / 2 + 0.112); G.add(mq);
    const bulbs = [new THREE.MeshBasicMaterial({ color: '#fff3b0' }), new THREE.MeshBasicMaterial({ color: '#7a5a20' })], bpos = [[], []];
    for (let i = 0; i < 14; i++) { const bx = -W / 2 - 0.04 + i * (W + 0.08) / 13; bpos[i % 2].push([bx, F + IH + 0.37], [bx, F + IH + 0.01]); }
    const bglow = [0, 1].map(k => { const gm = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.5, 0.2), addMat('#fff0a0', 0.5)); gm.position.set(0, F + IH + (k ? 0.37 : 0.01), D / 2 + 0.125); G.add(gm); return gm; });
    bpos.forEach((L, k) => { const im = new THREE.InstancedMesh(bulbGeo, bulbs[k], L.length); L.forEach(([bx, by], i) => im.setMatrixAt(i, _m4.makeTranslation(bx, by, D / 2 + 0.12))); G.add(im); });
    // gantry + claw
    const rail = toon('#c9d2de'); for (const z of [-D / 2 + 0.02, D / 2 - 0.02]) M(new THREE.BoxGeometry(W, 0.03, 0.03), rail, 0, IH - 0.03, z, inner, 0.008);
    const bridge = M(new THREE.BoxGeometry(0.05, 0.035, D), rail, 0, IH - 0.06, 0, inner, 0.008 * OL), trolley = M(new THREE.BoxGeometry(0.09, 0.05, 0.09), toon('#ec3013'), 0, IH - 0.09, 0, inner, 0.01 * OL);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 6), toon('#3a3836')); inner.add(cable);
    const claw = new THREE.Group(); inner.add(claw); const chrome = toon('#dfe6ee', { emissive: new THREE.Color('#334'), emissiveIntensity: 0.2 }), gold = toon('#e6b45a');
    M(new THREE.CylinderGeometry(0.05, 0.06, 0.09, 16), gold, 0, 0.17, 0, claw, 0.01 * OL, 0.06); M(new THREE.CylinderGeometry(0.03, 0.05, 0.04, 16), chrome, 0, 0.23, 0, claw, 0.008 * OL, 0.05);
    const led = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.009, 6, 24), new THREE.MeshBasicMaterial({ color: '#ffffff' })); led.rotation.x = Math.PI / 2; led.position.y = 0.13; claw.add(led);
    const prongs = []; for (let i = 0; i < 3; i++) { const yaw = new THREE.Group(); yaw.rotation.y = i * Math.PI * 2 / 3 + Math.PI / 6; yaw.position.y = 0.13; claw.add(yaw); const hinge = new THREE.Group(); hinge.position.x = 0.035; yaw.add(hinge);
      M(new THREE.BoxGeometry(0.018, 0.1, 0.022), chrome, 0.0, -0.05, 0, hinge, 0.006 * OL); const low = new THREE.Group(); low.position.y = -0.1; hinge.add(low); M(new THREE.BoxGeometry(0.016, 0.07, 0.02), chrome, -0.012, -0.03, 0, low, 0.006 * OL).rotation.z = -0.45; M(new THREE.SphereGeometry(0.012, 8, 6), gold, -0.03, -0.065, 0, low, 0); prongs.push({ hinge, low }); }
    const cab = { G, inner, claw, prongs, cable, bridge, trolley, stick, btn, flap, bulbs, bglow, led, col, cl: { x: CHUTE.x, z: CHUTE.z, y: TOPY, open: 1 }, tgt: null, labelSprite: null };
    cab.set = (cx, cz, ty, open) => { claw.position.set(cx, ty - 0.035, cz); bridge.position.x = cx; trolley.position.set(cx, IH - 0.09, cz); const top = IH - 0.11, bot = ty + 0.25, len = Math.max(0.01, top - bot); cable.scale.y = len; cable.position.set(cx, (top + bot) / 2, cz);
      const a = 0.08 + open * 0.5; for (const p of prongs) { p.hinge.rotation.z = a; p.low.rotation.z = -0.15 + open * 0.15; } };
    cab.set(cab.cl.x, cab.cl.z, cab.cl.y, 1); bake(G, [claw, bridge, trolley, cable, stick, btn, flap]); cab.cone = lightCone(x, col); return cab;
  }
  const SPACING = 2.2, NB = [1, -1, 2, -2], NB_COLS = ['#38bdf8', '#7cf06a', '#f472b6', '#ffd23a'];
  const mainCab = buildCabinet(0, '#ec3013', { main: true, label: 'CLAW CRANE' });
  const neighbours = NB.map((k, i) => buildCabinet(k * SPACING, NB_COLS[i], { label: ['TRUCK GRAB', 'PLUSH PIT', 'FOX DROP', 'MEGA CLAW'][i] }));
  const glow = new THREE.PointLight(0xfff0f8, 1.6, 2.6, 1.5); glow.position.set(0, F + IH - 0.15, 0.1); scene.add(glow);
  const C = mainCab.inner;
  const innerCone = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.55, IH - 0.05, 20, 1, true), new THREE.MeshBasicMaterial({ map: coneTex, color: '#fff2fa', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); innerCone.position.set(0, IH / 2, 0); C.add(innerCone);
  const spN = 26, spGeo = new THREE.BufferGeometry(), spP = new Float32Array(spN * 3), spPh = []; for (let i = 0; i < spN; i++) { spP.set([rr(-W / 2 + 0.05, W / 2 - 0.05), rr(0.15, IH - 0.1), rr(-D / 2 + 0.05, D / 2 - 0.05)], i * 3); spPh.push(rr(0, 6)); }
  spGeo.setAttribute('position', new THREE.BufferAttribute(spP, 3)); const sparkTex = texOf(32, 32, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(16, 0); g.lineTo(19, 13); g.lineTo(32, 16); g.lineTo(19, 19); g.lineTo(16, 32); g.lineTo(13, 19); g.lineTo(0, 16); g.lineTo(13, 13); g.fill(); });
  const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({ map: sparkTex, size: 0.035, color: '#fff7d0', transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); C.add(sparks);
  let shake = 0, ledPulse = 0, winFx = 0; const sw = { x: 0, z: 0 }, swV = { x: 0, z: 0 };

  // ---------- prize meshes (one merged geometry per prize, shared everywhere) ----------
  const GEO = Object.fromEntries(PRIZES.map(p => [p.id, prizeGeo(p)]));
  function prizeMesh(id, outline = true) { const m = new THREE.Mesh(GEO[id], vcMat); if (outline) { const o = new THREE.Mesh(GEO[id], outlineMat); o.scale.setScalar(1.09); m.add(o); } return m; }
  // thumbnails for the shelf (rendered once)
  const thumbs = {};
  try { const ts = new THREE.Scene(); ts.add(new THREE.HemisphereLight(0xffffff, 0x8070a0, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.2); dl.position.set(1, 2, 3); ts.add(dl); const tc = new THREE.PerspectiveCamera(30, 1, 0.01, 5); tc.position.set(0.18, 0.12, 0.42); tc.lookAt(0, 0, 0);
    const rt = new THREE.WebGLRenderTarget(128, 128); rt.texture.colorSpace = THREE.SRGBColorSpace; const px = new Uint8Array(128 * 128 * 4), cv = document.createElement('canvas'); cv.width = cv.height = 128; const cx = cv.getContext('2d'), id = cx.createImageData(128, 128);
    for (const p of PRIZES) { const m = prizeMesh(p.id); if (p.kind === 'truck') m.rotation.y = -0.5; ts.add(m); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(ts, tc); renderer.readRenderTargetPixels(rt, 0, 0, 128, 128, px);
      for (let y = 0; y < 128; y++) id.data.set(px.subarray((127 - y) * 512, (128 - y) * 512), y * 512); cx.putImageData(id, 0, 0); const pid = p.id; cv.toBlob(bl => { if (bl) { thumbs[pid] = URL.createObjectURL(bl); emit(true); } }, 'image/png'); ts.remove(m); }
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); rt.dispose(); } catch (e) { console.warn('claw thumbs', e); }

  // ---------- PILE PHYSICS (spheres in a box with a chute hole) ----------
  const BOXES = [ // floor pieces + dividers (inner coords)
    { a: V3(HX1, -0.1, -D / 2), b: V3(W / 2, 0, D / 2) }, { a: V3(-W / 2, -0.1, -D / 2), b: V3(HX1, 0, HZ0) },
    { a: V3(HX1 - 0.012, 0, HZ0), b: V3(HX1 + 0.012, DIVH, D / 2) }, { a: V3(-W / 2, 0, HZ0 - 0.012), b: V3(HX1 + 0.012, DIVH, HZ0 + 0.012) }];
  const _cp = V3(), _d = V3(), _n = V3(), _ax = V3(), _qq = new THREE.Quaternion();
  function makePile(rand, n, parent, { outline = true, spawnTop = false, onImpact = null } = {}) {
    const bodies = []; let uid = 0, settling = false;
    const roll = () => { const tot = PRIZES.reduce((s, p) => s + p.w, 0); let r = rand() * tot; for (const p of PRIZES) { r -= p.w; if (r <= 0) return p; } return PRIZES[0]; };
    function add(p, x, y, z) { const m = prizeMesh(p.id, outline); parent.add(m); const b = { uid: uid++, p: V3(x, y, z), v: V3(), r: 0.1, def: p, m, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 0.8 - 0.4, rand() * 6.28, rand() * 0.8 - 0.4)), held: false, gone: false, ct: false, goneT: 0 }; m.position.copy(b.p); m.quaternion.copy(b.q); bodies.push(b); return b; }
    function spawn(k, top) { for (let i = 0; i < k; i++) { let x, z; do { x = -W / 2 + 0.11 + rand() * (W - 0.22); z = -D / 2 + 0.11 + rand() * (D - 0.22); } while (x < HX1 + 0.12 && z > HZ0 - 0.12); add(roll(), x, (top ? IH - 0.15 : 0.12) + (top ? i * 0.06 : rand() * 0.9 + i * 0.03), z); } }
    function step(dt, held) {
      const h = dt / 3; for (let it = 0; it < 3; it++) {
        for (const b of bodies) { if (b.gone || b.held || b.sleep) continue; b.ct = false; b.v.y -= 6.5 * h; b.p.addScaledVector(b.v, h); b.v.multiplyScalar(1 - 0.4 * h);
          if (b.p.x < -W / 2 + b.r) { b.p.x = -W / 2 + b.r; b.v.x = Math.abs(b.v.x) * 0.2; } if (b.p.x > W / 2 - b.r) { b.p.x = W / 2 - b.r; b.v.x = -Math.abs(b.v.x) * 0.2; }
          if (b.p.z < -D / 2 + b.r) { b.p.z = -D / 2 + b.r; b.v.z = Math.abs(b.v.z) * 0.2; } if (b.p.z > D / 2 - b.r) { b.p.z = D / 2 - b.r; b.v.z = -Math.abs(b.v.z) * 0.2; }
          for (const bx of BOXES) { _cp.copy(b.p).clamp(bx.a, bx.b); _d.subVectors(b.p, _cp); let dist = _d.length(); if (dist >= b.r) continue; if (dist < 1e-6) { _n.set(0, 1, 0); dist = 0; } else _n.copy(_d).divideScalar(dist);
            b.p.addScaledVector(_n, b.r - dist); const vn = b.v.dot(_n); if (vn < -0.55 && !settling) { b.sq = Math.max(b.sq || 0, Math.min(1, -vn * 0.7)); onImpact && onImpact(-vn, b.def.kind); } if (vn < 0) b.v.addScaledVector(_n, -1.15 * vn); const fr = _n.y > 0.6 ? 0.82 : 0.95; const vy = b.v.dot(_n); b.v.addScaledVector(_n, -vy).multiplyScalar(fr).addScaledVector(_n, vy); b.ct = true; } }
        for (let i = 0; i < bodies.length; i++) { const a = bodies[i]; if (a.gone) continue; for (let j = i + 1; j < bodies.length; j++) { const b = bodies[j]; if (b.gone || (a.held && b.held)) continue;
          _d.subVectors(b.p, a.p); const rs = a.r + b.r, d2 = _d.lengthSq(); if (d2 >= rs * rs) continue; const d = Math.sqrt(d2); if (d < 1e-6) _n.set(0, 1, 0); else _n.copy(_d).divideScalar(d);
          if (a.sleep && !b.sleep && (b.held || b.v.lengthSq() > 0.01)) wake(a); if (b.sleep && !a.sleep && (a.held || a.v.lengthSq() > 0.01)) wake(b);
          const wa = a.held || a.sleep ? 0 : 1, wb = b.held || b.sleep ? 0 : 1, sw = wa + wb; if (!sw) continue; const pen = rs - d; a.p.addScaledVector(_n, -pen * wa / sw); b.p.addScaledVector(_n, pen * wb / sw);
          const rel = _d.subVectors(b.v, a.v).dot(_n); if (rel < -0.5 && !settling) { a.sq = Math.max(a.sq || 0, Math.min(1, -rel * 0.5)); b.sq = Math.max(b.sq || 0, Math.min(1, -rel * 0.5)); } if (rel < -0.5 && onImpact && !settling) onImpact(-rel, a.def.kind === 'truck' || b.def.kind === 'truck' ? 'truck' : 'plush'); if (rel < 0) { const jj = -1.1 * rel / sw; a.v.addScaledVector(_n, -jj * wa); b.v.addScaledVector(_n, jj * wb); } if (_n.y < -0.5) a.ct = true; if (_n.y > 0.5) b.ct = true; if (wa && wb) { a.v.multiplyScalar(0.985); b.v.multiplyScalar(0.985); } } }
        for (const b of bodies) { if (b.gone || b.held) continue; if (b.ct) { const sp = b.v.length(); if (sp < 0.22) b.v.multiplyScalar(0.8);
            const vh = Math.hypot(b.v.x, b.v.z); if (vh > 0.02) { _ax.set(b.v.z, 0, -b.v.x).divideScalar(vh); _qq.setFromAxisAngle(_ax, vh * h / b.r * 0.7); b.q.premultiply(_qq); } }
          if (b.p.y < -0.18 && !b.gone) { b.gone = true; b.goneT = 0; held && held(b); } }
      }
      // sleep: a prize that has stopped stays perfectly still (no micro-jitter → the aim ring holds steady)
      if (!settling) for (const b of bodies) { if (b.gone || b.held || b.sleep) continue; if (b.ct && b.v.lengthSq() < 0.0036) { b.rest = (b.rest || 0) + dt; if (b.rest > 0.35) { b.sleep = true; b.v.set(0, 0, 0); } } else b.rest = 0; }
      for (const b of bodies) { if (b.gone) { b.goneT += dt; b.m.position.set(CHUTE.x, -0.18 - b.goneT * 0.6, CHUTE.z); b.m.visible = b.goneT < 0.6; continue; } b.m.position.copy(b.p); b.m.quaternion.copy(b.q);
        if (b.sq > 0.01) { b.sqT = (b.sqT || 0) + dt * 22; const k = b.sq * Math.cos(b.sqT) * (b.def.kind === 'truck' ? 0.25 : 1); b.m.scale.set(1 + 0.16 * k, 1 - 0.2 * k, 1 + 0.16 * k); b.sq = Math.max(0, b.sq - dt * 3.2); } else if (b.sq !== 0) { b.sq = 0; b.sqT = 0; b.m.scale.set(1, 1, 1); } }
    }
    function settle(sec = 2.6) { settling = true; for (let t = 0; t < sec; t += 1 / 60) step(1 / 60); for (const b of bodies) if (b.gone || b.p.y > 0.6) { b.gone = false; b.p.set(0.3 + rand() * 0.2, 0.5, -0.2 + rand() * 0.2); } for (let t = 0; t < 1; t += 1 / 60) step(1 / 60); bodies.forEach(b => b.v.set(0, 0, 0)); settling = false; }
    function clear() { bodies.forEach(b => { parent.remove(b.m); }); bodies.length = 0; }
    function wake(b) { b.sleep = false; b.rest = 0; } const wakeAll = () => bodies.forEach(wake);
    spawn(n, spawnTop); return { bodies, step, settle, spawn, clear, wake, wakeAll, alive: () => bodies.filter(b => !b.gone).length };
  }
  // neighbours: settled once, then frozen (no physics) — cheap decoration
  neighbours.forEach((nb, i) => { const pl = makePile(mulberry(77 + i), 14, nb.inner, { outline: false }); pl.settle(2); const parts = pl.bodies.filter(b => !b.gone).map(b => { const e = new THREE.Euler().setFromQuaternion(b.q); return { g: GEO[b.def.id], c: '#ffffff', p: [b.p.x, b.p.y, b.p.z], r: [e.x, e.y, e.z] }; }); pl.clear(); const mg = mergeVC(parts); nb.inner.add(new THREE.Mesh(mg, vcMat)); });
  let pile = null;

  // ---------- fox at the machine (THE CAST) ----------
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  snd.track('menu');
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  let foxKey = ['player', 'hope', 'noble'].includes(save.stat(CLAW.key + '.fox', 'player')) ? save.stat(CLAW.key + '.fox', 'player') : 'player', fox = null;
  function makeFoxAt() { if (fox) { scene.remove(fox); fox = null; } fox = cast.make(foxKey, { gear: 'none' }); const bb = new THREE.Box3().setFromObject(fox), hgt = bb.max.y - bb.min.y; if (hgt > 0.1) fox.scale.multiplyScalar(1.45 / hgt); fox.position.copy(FOXAT.intro); fox.rotation.y = -1.2; }
  const FOXAT = { intro: V3(1.08, 0, 0.95), play: V3(1.1, 0, -0.15) };
  makeFoxAt();

  // ---------- reveal pop (prize floats in front of the camera) + confetti ----------
  const pop = new THREE.Group(); scene.add(pop); let popMesh = null, popT = 0;
  const raysTex = texOf(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(255,240,180,0.95)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.beginPath(); g.moveTo(128, 128); g.arc(128, 128, 128, a, a + 0.16); g.closePath(); g.fill(); } const c2 = g.createRadialGradient(128, 128, 0, 128, 128, 60); c2.addColorStop(0, 'rgba(255,255,255,0.9)'); c2.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = c2; g.fillRect(0, 0, 256, 256); });
  const rays = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: raysTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); rays.position.z = -0.16; pop.add(rays); pop.visible = false;
  const confN = 70, confGeo = new THREE.BufferGeometry(), confP = new Float32Array(confN * 3), confC = new Float32Array(confN * 3), confV = [];
  for (let i = 0; i < confN; i++) { const c = new THREE.Color(pick(['#ec3013', '#ffd23a', '#38bdf8', '#22c55e', '#f472b6'])); confC.set([c.r, c.g, c.b], i * 3); confV.push(V3()); }
  confGeo.setAttribute('position', new THREE.BufferAttribute(confP, 3)); confGeo.setAttribute('color', new THREE.BufferAttribute(confC, 3));
  const conf = new THREE.Points(confGeo, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, depthTest: false, transparent: true })); conf.renderOrder = 40; conf.visible = false; conf.frustumCulled = false; scene.add(conf); let confT = 0;
  function burst(at) { conf.visible = true; confT = 0; for (let i = 0; i < confN; i++) { confP.set([at.x, at.y, at.z], i * 3); confV[i].set(rr(-1, 1), rr(0.4, 1.6), rr(-1, 1)).multiplyScalar(1.1); } }

  // ---------- aim aids: laser + landing ring ----------
  const laser = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), new THREE.MeshBasicMaterial({ color: '#ff3b3b', transparent: true, opacity: 0.7, depthTest: false })); laser.renderOrder = 20; C.add(laser);
  const ringMat = new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.95, depthTest: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(CLAWR - 0.018, CLAWR, 32).rotateX(-Math.PI / 2), ringMat); ring.renderOrder = 21; C.add(ring);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.016, 12).rotateX(-Math.PI / 2), ringMat); dot.renderOrder = 21; C.add(dot);
  let ringGood = false, ringY = 0; const ringCol = new THREE.Color();
  // soft claw shadow on the pile (helps judge depth); drawn under the ring
  const shTex = texOf(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(20,8,30,1)'); gr.addColorStop(0.55, 'rgba(20,8,30,0.6)'); gr.addColorStop(1, 'rgba(20,8,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const cshadow = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthTest: false, depthWrite: false, opacity: 0.4 })); cshadow.renderOrder = 19; cshadow.visible = false; C.add(cshadow);
  // cabinet floor: soft dark edges (fake ambient occlusion) so the pile sits in the box
  { const ao = texOf(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 18, 64, 64, 92); gr.addColorStop(0, 'rgba(40,10,50,0)'); gr.addColorStop(1, 'rgba(40,10,50,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    const aoM = new THREE.Mesh(new THREE.PlaneGeometry(W, D).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: ao, transparent: true, depthWrite: false })); aoM.position.y = 0.002; aoM.renderOrder = 1; C.add(aoM); }
  // marquee bulb glow strips on your cabinet
  const bulbGlow = [F + IH + 0.37, F + IH + 0.01].map(y => { const m = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.5, 0.16), addMat('#fff1b8', 0.35)); m.position.set(0, y, D / 2 + 0.14); mainCab.G.add(m); return m; });
  // rare prizes twinkle in the pile (fox heroes) so kids can spot them
  const twTex = texOf(64, 64, (g) => { g.translate(32, 32); g.fillStyle = '#fff'; g.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 4 : 30, a = k * Math.PI / 4; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 14); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-14, -14, 28, 28); });
  const twinkles = Array.from({ length: 6 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: twTex, color: '#fff3b0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sp.visible = false; sp.renderOrder = 22; C.add(sp); return sp; });

  // ---------- game state ----------
  const cl = { x: CHUTE.x, z: CHUTE.z, y: TOPY, open: 1, vx: 0, vz: 0 }; let held = null, grip = 0, slipRate = 0;
  let mode = 'intro', phase = 'intro', phT = 0, aimLeft = CLAW.aimTime, power = false, flash = null, flashT = 0, say = '', sayT = 0, reveal = null, revealQ = [], tryWins = [], view = 'FRONT', done = null;
  let credits = save.stat(CLAW.key + '.credits', 0), dry = save.stat(CLAW.key + '.lucky', 0), sessionWins = [], score = 0, tries = 0, party = null, race = null, demo = false, demoTgt = null, audioAim = save.stat(CLAW.key + '.audioAim', 1) !== 0, live = '';
  if (!save.flag(CLAW.key + '.gift')) { credits += CLAW.giftTries; save.setStat(CLAW.key + '.credits', credits); save.setFlag(CLAW.key + '.gift'); }
  const joy = { x: 0, y: 0 }, keyJ = { x: 0, y: 0 }, SAFE = { top: 0, bottom: 0, left: 0, right: 0 };
  const flashIt = (txt, col = '#ffd23a', t = 1.6) => { flash = { txt, col }; flashT = t; emit(true); };
  const sayIt = (t, d = 3) => { say = t; sayT = d; };

  function newPile(seed) { if (pile) pile.clear(); pile = makePile(mulberry(seed), 26, C, { onImpact: (v, k) => snd.impact(v, k) }); pile.settle(); }
  newPile((Math.random() * 1e9) | 0);

  // what would happen if the claw dropped at (x, z)? landing height + best grab
  function probe(x, z) {
    let stop = 0.02;
    for (const b of pile.bodies) { if (b.gone || b.held) continue; const dh = Math.hypot(b.p.x - x, b.p.z - z); let s = -9;
      if (dh < 0.55 * b.r) s = b.p.y + b.r - 0.12; else if (Math.abs(dh - CLAWR) < b.r * 0.6) s = b.p.y + Math.sqrt(Math.max(0, b.r * b.r - (dh - CLAWR) * (dh - CLAWR))) * 0.55; else if (dh < CLAWR) s = b.p.y + b.r - 0.1; if (s > stop) stop = s; }
    let best = null, bg = 0;
    for (const b of pile.bodies) { if (b.gone || b.held) continue; const dh = Math.hypot(b.p.x - x, b.p.z - z); if (dh > CLAWR * 0.95 || stop > b.p.y + b.r * 0.75) continue; const center = 1 - clamp(dh / (CLAWR * 0.95), 0, 1), depth = clamp((b.p.y + b.r * 0.75 - stop) / (b.r * 0.75), 0, 1);
      const g = Math.pow(center, 0.7) * (0.2 + 0.8 * Math.sqrt(depth)) / KINDS[b.def.kind].weight * 0.97; if (g > bg) { bg = g; best = b; } }
    return { stop, best, grip: clamp(bg, 0, 1) };
  }

  // ---------- modes ----------
  function resetClaw() { Object.assign(cl, { x: CHUTE.x, z: CHUTE.z, y: TOPY, open: 1, vx: 0, vz: 0 }); held = null; }
  function startMode(m, o = {}) {
    snd.track(m === 'race' ? 'race' : 'play'); credits = save.stat(CLAW.key + '.credits', credits); mode = m; done = null; reveal = null; revealQ = []; sessionWins = []; score = 0; tries = 0; demo = m === 'demo'; party = null; race = null; resetClaw();
    if (m === 'party') { const n = clamp(o.players || 2, 2, CLAW.maxPlayers); party = { players: Array.from({ length: n }, (_, i) => ({ name: NET_COLS[i][0], col: NET_COLS[i][1], score: 0, left: CLAW.partyTries, prizes: [] })), cur: 0 }; newPile((Math.random() * 1e9) | 0); setPhase('turn'); return; }
    if (m === 'race') { race = o; newPile(o.seed); setPhase('count'); return; }
    if (pile.alive() < 14) newPile((Math.random() * 1e9) | 0);
    beginTry();
  }
  function setPhase(p) { phase = p; phT = 0;
    if (p === 'intro' || p === 'done') snd.track('menu'); else if (p === 'release') snd.play('release'); else if (p === 'turn') snd.play('whoosh');
    else if (p === 'done') snd.play(done && (done.kind === 'party' || done.won) ? 'win' : 'lose'); else if (p === 'out') { if (!(done && done.wins && done.wins.length)) snd.play('lose'); }
    emit(true); }
  function beginTry() {
    if (mode === 'play' && credits <= 0) { setPhase('out'); return; }
    if (pile.alive() < 14) { pile.spawn(8, true); flashIt('RESTOCK!', '#7dd3fc'); snd.play('restock'); }
    if (mode === 'play') { credits--; save.setStat(CLAW.key + '.credits', credits); }
    tries++; tryWins = []; power = mode !== 'race' && dry >= CLAW.powerAfter; if (power) { flashIt('POWER CLAW!', '#ec3013', 2); sayIt('The lucky meter is full. This grab is extra strong.'); snd.play('power'); } else snd.play(mode === 'play' ? 'coin' : 'credit');
    aimLeft = CLAW.aimTime; demoTgt = null; setPhase('aim');
  }
  function drop() { if (phase !== 'aim') return; snd.play('button'); shake = 0.012; buzz(15); mainCab.btn.position.y = F + 0.012; setTimeout(() => mainCab.btn.position.y = F + 0.03, 160); setPhase('drop'); }
  function grabNow() {
    const pr = probe(cl.x, cl.z); let g = pr.grip * (power ? 1.7 : 1); const b = pr.best;
    pile.wakeAll(); if (b && g >= 0.3) { held = b; b.held = true; grip = clamp(g, 0, 1); slipRate = Math.max(0, 1 - grip) * 1.4 + (power ? 0 : 0.05); snd.play('clack'); setTimeout(() => snd.play(b.def.kind === 'truck' ? 'plastic' : 'squish'), 70); shake = 0.02; ledPulse = 1; buzz(25); sayIt(grip > 0.8 ? 'Solid grab!' : grip > 0.55 ? 'Got it… hold on!' : 'Barely holding…', 2.2); }
    else { snd.play('clack'); setTimeout(() => snd.play('miss'), 150); sayIt(b ? 'Slipped right off.' : 'Nothing to grab there.', 2.2); }
    if (net && race && phase !== 'done') sendSn(true);
  }
  function release(v) { if (!held) return; pile.wakeAll(); held.held = false; held.v.set(v ? cl.vx : 0, -0.4, v ? cl.vz : 0); held = null; }
  function onFall(b) {   // a prize went down the chute
    pile.wakeAll();
    const p = b.def; tryWins.push(p.id); dry = 0; if (mode === 'play') save.setStat(CLAW.key + '.lucky', 0);
    const pts = ptsOf(p); score += pts; burst(C.localToWorld(V3(CHUTE.x, 0.05, D / 2 + 0.15))); snd.play('chute'); setTimeout(() => snd.play('fanfare', p.kind === 'fox'), 180); winFx = 1; shake = 0.025; buzz([30, 40, 60]); const flap = mainCab.flap; flap.material.color.set('#ffffff'); setTimeout(() => flap.material.color.set('#ffd23a'), 500);
    let isNew = false, count = 0;
    const keep = mode === 'play' || (mode === 'race' && CLAW.keepRacePrizes);
    if (keep) { isNew = save.count(itemId(p.id)) === 0; if (isNew) snd.play('sparkle'); save.give(itemId(p.id)); count = save.count(itemId(p.id)); save.addXp(pts * 2); save.setStat(CLAW.key + '.wins', save.stat(CLAW.key + '.wins') + 1); }
    if (party) { const P = party.players[party.cur]; P.score += pts; P.prizes.push(p.id); }
    sessionWins.push(p.id); live = 'You won ' + p.name + ', ' + KINDS[p.kind].label.toLowerCase() + ', ' + pts + ' points.';
    const rv = { id: p.id, name: p.name, kind: KINDS[p.kind].label, rarity: p.id === 'kingPlush' ? 'SUPER RARE' : KINDS[p.kind].rarity, col: KINDS[p.kind].col, line: p.line, pts, isNew, count, keep, who: party ? party.players[party.cur].name : null, thumb: thumbs[p.id] };
    if (mode === 'race' || mode === 'demo') { flashIt((mode === 'race' ? '+' + pts + ' · ' : '') + p.name + '!', rv.col, 1.8); showPop(p.id, 1.4); if (net && race) { net.send('ev', { k: 'win', id: p.id, s: score }); } } else revealQ.push(rv);
  }
  function afterTry() {
    if (!tryWins.length) { dry++; if (mode === 'play') save.setStat(CLAW.key + '.lucky', dry); }
    save.setStat(CLAW.key + '.tries', save.stat(CLAW.key + '.tries') + (mode === 'play' ? 1 : 0)); power = false;
    if (revealQ.length) { reveal = revealQ.shift(); showPop(reveal.id); setPhase('reveal'); return; }
    nextTry();
  }
  function nextTry() {
    if (mode === 'race') { if (race && Date.now() >= race.t1) return finishRace(); return beginTry(); }
    if (party) { const P = party.players[party.cur]; P.left--; if (P.left <= 0) { const nx = party.players.findIndex((q, i) => i > party.cur && q.left > 0); if (nx < 0) return finishParty(); party.cur = nx; return setPhase('turn'); } return beginTry(); }
    if (mode === 'play' && credits <= 0) { done = { kind: 'play', title: sessionWins.length ? 'Nice haul!' : 'Out of tries', wins: sessionWins.slice(), score }; return setPhase('out'); }
    beginTry();
  }
  function finishParty() { const pl = party.players.slice().sort((a, b) => b.score - a.score); const top = pl[0].score, winners = pl.filter(p => p.score === top); done = { kind: 'party', title: top === 0 ? 'Nobody grabbed one!' : winners.length > 1 ? 'A tie!' : winners[0].name + ' wins!', rows: party.players.map(p => ({ name: p.name, col: p.col, score: p.score, prizes: p.prizes.map(id => PZ[id].name).join(', ') || '—' })) }; live = done.title; setPhase('done'); }
  function revealNext() { if (phase !== 'reveal') return; hidePop(); if (revealQ.length) { reveal = revealQ.shift(); showPop(reveal.id); emit(true); return; } reveal = null; nextTry(); }
  function showPop(id, life = 0) { hidePop(); setTimeout(() => snd.play('voice', PZ[id].kind, id), life ? 250 : 650); popMesh = prizeMesh(id); popMesh.renderOrder = 39; popMesh.traverse(o => { o.renderOrder = 39; }); pop.add(popMesh); popT = 0; pop.userData.life = life; pop.visible = true; burst(camera.position.clone().add(camera.getWorldDirection(V3()).multiplyScalar(0.9))); }
  function hidePop() { if (popMesh) { pop.remove(popMesh); popMesh = null; } pop.visible = false; }
  function toIntro() { mode = 'intro'; demo = false; hidePop(); reveal = null; revealQ = []; done = null; party = null; if (race) race = null; resetClaw(); setPhase('intro'); }
  function buyPack() { if (!save.spend(CLAW.packCost)) { flashIt('NOT ENOUGH GOLD', '#ec3013'); return false; } credits += CLAW.packTries; save.setStat(CLAW.key + '.credits', credits); snd.play('coin'); flashIt('+' + CLAW.packTries + ' TRIES', '#22c55e'); emit(true); return true; }

  // ---------- ONLINE PRIZE RACE ----------
  let net = null, netTok = 0, lastSeen = {}, snT = 0, pingT = 0;
  const N = { st: 'off', code: '', status: '', peers: {}, ready: false, j: 0, msg: '' };
  const racing = () => mode === 'race' && phase !== 'intro' && phase !== 'done';
  const members = () => { if (!net) return []; const all = [{ id: net.id, j: N.j, ready: N.ready, playing: racing(), me: true }, ...Object.entries(N.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, CLAW.maxPlayers); };
  const hostId = ids => { const m = ids || members().map(x => x.id); return m.length ? m.slice().sort()[0] : net && net.id; };
  function netOpen() { netLeave(); N.st = 'menu'; N.code = ''; N.msg = ''; N.status = ''; emit(true); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { N.msg = 'Type the 4-letter room code from your friend.'; emit(true); return; }
    netLeave(); Object.assign(N, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '' }); lastSeen = {}; emit(true); const tok = ++netTok;
    const nn = await openNet(code, { onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => onMsg(t, d, id), onStatus: s => { N.status = s; emit(true); } });
    if (tok !== netTok) { nn.leave(); return; } net = nn; hello(); emit(true);
  }
  function netCreate() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; return netJoin(k); }
  function netLeave() { netTok++; if (net) { try { net.send('ev', { k: 'bye' }); net.leave(); } catch (e) {} } net = null; lastSeen = {}; N.peers = {}; N.ready = false; if (mode === 'race') { race = null; toIntro(); } neighbours.forEach(nb => { nb.tgt = null; setLabel(nb, null); }); }
  function netClose() { netLeave(); N.st = 'off'; emit(true); }
  function hello(to) { if (net) net.send('hi', { j: N.j, ready: N.ready, playing: racing() }, to); }
  function onMsg(t, d, id) {
    if (!net || !d) return; const known = !!lastSeen[id]; lastSeen[id] = performance.now();
    if (t === 'hi') { N.peers[id] = { ...(N.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (!known) hello(id); maybeStart(); emit(true); return; }
    if (!known) return;
    if (t === 'sn') { if (race && race.ids.includes(id)) { const nb = nbOf(id); if (nb) { nb.tgt = d; } const pl = race.players.find(p => p.id === id); if (pl) pl.score = d.s; } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { if (N.peers[id]) N.peers[id].ready = !!d.on; maybeStart(); emit(true); }
    else if (d.k === 'start') startRace(d);
    else if (d.k === 'playing') { if (N.peers[id]) N.peers[id].playing = !!d.on; emit(true); }
    else if (d.k === 'win' && race) { const pl = race.players.find(p => p.id === id); if (pl) { pl.score = d.s; flashIt(pl.name + ' GOT ' + PZ[d.id].name, pl.col, 1.6); } }
    else if (d.k === 'end' && race && race.mid === d.mid) { (d.scores || []).forEach(([pid, s]) => { const pl = race.players.find(p => p.id === pid); if (pl) pl.score = Math.max(pl.score, s); }); if (phase === 'done') finishRace(true); }
    else if (d.k === 'bye') gone(id);
  }
  function gone(id) { if (!lastSeen[id]) return; delete lastSeen[id]; delete N.peers[id]; const nb = nbOf(id); if (nb) { nb.tgt = null; setLabel(nb, null); } if (race) { const pl = race.players.find(p => p.id === id); if (pl) pl.left = true; } emit(true); }
  function netReady() { if (!net) return; N.ready = !N.ready; net.send('ev', { k: 'ready', on: N.ready }); maybeStart(); emit(true); }
  function maybeStart() { if (!net || N.st !== 'room' || racing()) return; const m = members(); if (m.length < 2 || hostId() !== net.id || !m.every(x => x.ready && !x.playing)) return; const d = { k: 'start', t0: Date.now() + 3500, seed: (Math.random() * 1e9) | 0, ids: m.map(x => x.id), mid: Date.now() % 1e9 }; net.send('ev', d); startRace(d); }
  function nbOf(id) { if (!race) return null; const others = race.ids.filter(x => x !== net.id); const k = others.indexOf(id); return k >= 0 ? neighbours[k] : null; }
  function setLabel(nb, txt, col) { if (nb.labelSprite) { nb.G.remove(nb.labelSprite); nb.labelSprite.material.map.dispose(); nb.labelSprite = null; } if (!txt) return; const t = texOf(256, 64, (g) => { g.fillStyle = '#000'; g.fillRect(0, 0, 256, 64); g.fillStyle = col; g.fillRect(0, 0, 14, 64); g.font = `900 34px ${FONT}`; g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.fillText(txt, 26, 34); }); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.set(0.9, 0.225, 1); sp.position.set(0, F + IH + 0.62, 0.3); sp.renderOrder = 30; nb.G.add(sp); nb.labelSprite = sp; nb.labelTxt = txt; }
  function startRace(d) {
    if (!net || !Array.isArray(d.ids) || !d.ids.includes(net.id)) { N.msg = 'A race started without you. You join the next one.'; emit(true); return; }
    let t0 = +d.t0; const w = t0 - Date.now(); if (!(w >= 0 && w <= 6000)) t0 = Date.now() + 3000; const ids = d.ids.slice(0, CLAW.maxPlayers), sorted = ids.slice().sort();
    const players = sorted.map((id, slot) => ({ id, slot, name: id === net.id ? 'YOU' : NET_COLS[slot][0], col: NET_COLS[slot][1], score: 0, me: id === net.id }));
    N.st = 'play'; N.ready = false; Object.values(N.peers).forEach(p => { p.ready = false; });
    ids.filter(x => x !== net.id).forEach((id, k) => { const pl = players.find(p => p.id === id); setLabel(neighbours[k], pl.name, pl.col); });
    net.send('ev', { k: 'playing', on: true }); startMode('race', { t0, t1: t0 + CLAW.raceTime * 1000, seed: d.seed, ids, players, mid: d.mid });
  }
  function finishRace(fromHost) {
    if (!race) return; const pl = race.players.slice().sort((a, b) => b.score - a.score), me = race.players.find(p => p.me); if (me) me.score = score; const top = Math.max(...race.players.map(p => p.score));
    const won = me && me.score === top && top > 0; save.best(CLAW.key + '.raceBest', score);
    done = { kind: 'race', title: top === 0 ? 'No prizes this time' : won ? (race.players.filter(p => p.score === top).length > 1 ? 'A tie at the top!' : 'You win the race!') : race.players.find(p => p.score === top).name + ' wins!', won, rows: race.players.slice().sort((a, b) => b.score - a.score).map(p => ({ name: p.name, col: p.col, score: p.score, me: p.me })), wins: sessionWins.slice() };
    live = done.title; if (!fromHost) { if (net) net.send('ev', { k: 'playing', on: false }); if (net && hostId(race.ids) === net.id) setTimeout(() => { if (net && race) net.send('ev', { k: 'end', mid: race.mid, scores: race.players.map(p => [p.id, p.me ? score : p.score]) }); }, 1500); }
    N.st = 'room'; if (phase !== 'done') setPhase('done'); else emit(true);
  }
  function sendSn(force) { if (!net || !race) return; net.send('sn', { x: +cl.x.toFixed(3), z: +cl.z.toFixed(3), y: +cl.y.toFixed(3), o: +cl.open.toFixed(2), s: score }); }

  // ---------- input ----------
  const keyDown = new Set();
  const onKey = (e, down) => { const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return; const k = e.code;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(k)) { e.preventDefault(); down ? keyDown.add(k) : keyDown.delete(k); keyJ.x = (keyDown.has('ArrowRight') || keyDown.has('KeyD') ? 1 : 0) - (keyDown.has('ArrowLeft') || keyDown.has('KeyA') ? 1 : 0); keyJ.y = (keyDown.has('ArrowUp') || keyDown.has('KeyW') ? 1 : 0) - (keyDown.has('ArrowDown') || keyDown.has('KeyS') ? 1 : 0); return; }
    if (!down) return; if ((k === 'Space' || k === 'Enter') && phase === 'aim') { e.preventDefault(); drop(); } else if ((k === 'Space' || k === 'Enter') && (phase === 'reveal' || phase === 'turn')) { e.preventDefault(); phase === 'reveal' ? revealNext() : beginTry(); } else if (k === 'KeyV') toggleView(); };
  const kd = e => onKey(e, true), ku = e => onKey(e, false); addEventListener('keydown', kd); addEventListener('keyup', ku);
  function toggleView() { view = view === 'FRONT' ? 'SIDE' : 'FRONT'; emit(true); }

  // ---------- camera ----------
  const fitCam = new THREE.PerspectiveCamera(45, 1, 0.05, 60), _p = V3();
  function fitShot(pts, el, yaw) { const Wd = CW(), H = CH(); fitCam.aspect = Wd / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix(); const m = 0.04;
    const yT = 1 - 2 * SAFE.top / H - m, yB = -1 + 2 * SAFE.bottom / H + m, xR = 1 - 2 * SAFE.right / Wd - m, xL = -1 + 2 * SAFE.left / Wd + m, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.3, hi = 30; for (let k = 0; k < 18; k++) { const mm = (lo + hi) / 2; if (fits(mm)) hi = mm; else lo = mm; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  const shotCache = new Map();
  function shot(key) { const ck = key + CW() + 'x' + CH() + JSON.stringify(SAFE); if (shotCache.has(ck)) return shotCache.get(ck); if (shotCache.size > 40) shotCache.clear(); let s;
    const box = (x0, x1, y0, y1, z0, z1) => { const r = []; for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) r.push(V3(x, y, z)); return r; };
    if (key === 'intro') s = fitShot([...box(-W / 2 - 0.1, W / 2 + 0.1, 0, F + IH + 0.4, -D / 2, D / 2 + 0.3), V3(1.08, 1.5, 0.95), V3(1.35, 0, 1.1)], 0.16, -0.32);
    else if (key === 'SIDE') s = fitShot(box(-W / 2, W / 2, F - 0.02, F + IH - 0.05, -D / 2, D / 2), 0.42, 1.05);
    else s = fitShot(box(-W / 2, W / 2, F - 0.02, F + IH - 0.08, -D / 2, D / 2 + 0.04), 0.46, 0.0);
    shotCache.set(ck, s); return s; }
  const camPos = V3(0, 2, 4), camLook = V3(0, 1.4, 0); let camInit = false;

  // ---------- hud ----------
  function hud() {
    const m = members(), host = net ? hostId() : null, rl = race ? Math.max(0, (race.t1 - Date.now()) / 1000) : 0, cnt = race && phase === 'count' ? Math.ceil((race.t0 - Date.now()) / 1000) : null;
    const shelf = PRIZES.map(p => ({ id: p.id, name: p.name, kind: KINDS[p.kind].label, n: save.count(itemId(p.id)), thumb: thumbs[p.id] || '', col: KINDS[p.kind].col }));
    return { phase, mode, view, credits, gold: save.data.gold, score, tries, aimLeft: Math.ceil(aimLeft), aimFrac: aimLeft / CLAW.aimTime, lucky: Math.min(1, dry / CLAW.powerAfter), power, flash: flashT > 0 ? flash : null, say: sayT > 0 ? say : '', reveal, done, demo, sound: snd.on, music: snd.music, audioAim, foxKey, live,
      party: party ? { players: party.players.map((p, i) => ({ ...p, cur: i === party.cur })), cur: party.cur, name: party.players[party.cur].name, col: party.players[party.cur].col, left: party.players[party.cur].left } : null,
      race: race ? { left: Math.ceil(rl), count: cnt, players: race.players.map(p => ({ name: p.name, col: p.col, score: p.me ? score : p.score, me: p.me })).sort((a, b) => b.score - a.score) } : null,
      net: N.st === 'off' ? null : { st: N.st, code: N.code, status: N.status, msg: N.msg, ready: N.ready, members: m.map((x, i) => ({ name: x.me ? 'YOU' : NET_COLS[[...m].map(q => q.id).sort().indexOf(x.id)][0], col: NET_COLS[[...m].map(q => q.id).sort().indexOf(x.id)][1], me: x.me, ready: x.ready, host: x.id === host, playing: x.playing })), connected: !!net },
      shelf, found: shelf.filter(s => s.n > 0).length, total: PRIZES.length, packCost: CLAW.packCost, packTries: CLAW.packTries, cost: CLAW.tryCost };
  }
  function emit(now) { if (!onState || !ready) return; const t = performance.now(); if (!now && t - emitT < 90) return; emitT = t; onState(hud()); }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, alive = true, beepT = 0, bulbT = 0, hintT = 0, lastTick = 99, lastCount = 99;
  function frame() {
    if (!alive) return; raf = requestAnimationFrame(frame); update(Math.min(clock.getDelta(), 1 / 30)); renderer.render(scene, camera); emit();
  }
  function update(dt) {
    phT += dt; hintT += dt;
    if (flashT > 0) { flashT -= dt; if (flashT <= 0) emit(true); } if (sayT > 0) { sayT -= dt; if (sayT <= 0) emit(true); }
    // claw motion per phase
    const fwd = V3(), right = V3(); camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize(); right.set(-fwd.z, 0, fwd.x);
    let jx = clamp(joy.x + keyJ.x, -1, 1), jy = clamp(joy.y + keyJ.y, -1, 1);
    if (phase === 'aim' && demo) { if (!demoTgt) { let best = null, bg = -1; for (const b of pile.bodies) { if (b.gone || b.p.x < HX1 + 0.05 && b.p.z > HZ0 - 0.05) continue; const pr = probe(b.p.x, b.p.z); if (pr.grip > bg) { bg = pr.grip; best = b; } } demoTgt = best ? { x: best.p.x + rr(-0.03, 0.03), z: best.p.z + rr(-0.03, 0.03) } : { x: 0, z: 0 }; }
      const dx = demoTgt.x - cl.x, dz = demoTgt.z - cl.z, dd = Math.hypot(dx, dz); if (dd < 0.012 && phT > 0.8) drop(); else { const wx = dx / Math.max(dd, 0.06), wz = dz / Math.max(dd, 0.06); jx = wx * right.x + wz * right.z; jy = wx * fwd.x + wz * fwd.z; } }
    if (phase === 'aim') {
      aimLeft -= dt; if (aimLeft <= 0) { aimLeft = 0; sayIt('Time! The claw drops.', 1.5); drop(); }
      const mx = right.x * jx + fwd.x * jy, mz = right.z * jx + fwd.z * jy, sp = 0.5; cl.vx = damp(cl.vx, mx * sp, 14, dt); cl.vz = damp(cl.vz, mz * sp, 14, dt);
      cl.x = clamp(cl.x + cl.vx * dt, -W / 2 + 0.1, W / 2 - 0.1); cl.z = clamp(cl.z + cl.vz * dt, -D / 2 + 0.1, D / 2 - 0.1); cl.open = damp(cl.open, 1, 8, dt);
      const pr = probe(cl.x, cl.z), gq = pr.best ? pr.grip : -1; ringGood = ringGood ? gq > 0.48 : gq > 0.58; ringCol.set(ringGood ? '#22c55e' : pr.best ? '#ffd23a' : '#ff3b3b'); ringMat.color.lerp(ringCol, 1 - Math.exp(-16 * dt));
      ringY = phT < 0.05 || !ring.visible ? pr.stop : damp(ringY, pr.stop, 20, dt);
      ring.visible = dot.visible = laser.visible = cshadow.visible = true; ring.position.set(cl.x, ringY + 0.004, cl.z); dot.position.copy(ring.position); laser.position.set(cl.x, (ringY + cl.y) / 2, cl.z); laser.scale.y = Math.max(0.01, cl.y - ringY);
      if (audioAim && !demo && snd.on) { beepT -= dt; const iv = pr.best ? 0.55 - pr.grip * 0.45 : 0.9; if (beepT <= 0) { beepT = iv; snd.play('beep', pr.best ? pr.grip : 0); } }
    } else { ring.visible = dot.visible = laser.visible = false; }
    if (['aim', 'drop', 'grab', 'lift', 'carry'].includes(phase)) { const sy = phase === 'aim' ? ringY : probe(cl.x, cl.z).stop, hgt = Math.max(0, cl.y - sy); cshadow.visible = true; cshadow.position.set(cl.x, sy + 0.003, cl.z); cshadow.scale.setScalar(0.7 + hgt * 0.6); cshadow.material.opacity = clamp(0.55 - hgt * 0.35, 0.15, 0.5); } else cshadow.visible = false;
    if (phase === 'drop') { cl.vx = cl.vz = 0; const pr = probe(cl.x, cl.z); cl.y -= 0.55 * dt; if (cl.y <= pr.stop) { cl.y = Math.max(cl.y, pr.stop); setPhase('grab'); } }
    else if (phase === 'grab') { cl.open = clamp(1 - phT / 0.45, 0, 1);
      for (const b of pile.bodies) { if (b.gone) continue; const dx = cl.x - b.p.x, dz = cl.z - b.p.z, dh = Math.hypot(dx, dz); if (dh < CLAWR + b.r && b.p.y > cl.y - b.r && b.p.y < cl.y + 0.25 && dh > 0.005) { pile.wake(b); b.v.x += dx / dh * 1.2 * dt; b.v.z += dz / dh * 1.2 * dt; b.v.y += 0.4 * dt; } }
      if (phT > 0.5) { grabNow(); setPhase('lift'); } }
    else if (phase === 'lift') { cl.y = Math.min(TOPY, cl.y + 0.42 * dt); if (held && Math.random() < 1 - Math.exp(-slipRate * 0.7 * dt)) { release(false); snd.play('slip'); sayIt('Oh no, it slipped!', 2); } if (cl.y >= TOPY) setPhase('carry'); }
    else if (phase === 'carry') { const dx = CHUTE.x - cl.x, dz = CHUTE.z - cl.z, dd = Math.hypot(dx, dz), sp = held ? 0.42 : 0.8; if (dd < 0.01) { cl.vx = cl.vz = 0; setPhase('release'); } else { const st = Math.min(dd, sp * dt); cl.vx = dx / dd * sp; cl.vz = dz / dd * sp; cl.x += dx / dd * st; cl.z += dz / dd * st; }
      if (held && Math.random() < 1 - Math.exp(-slipRate * dt)) { release(true); snd.play('slip'); sayIt(Math.hypot(cl.x - CHUTE.x, cl.z - CHUTE.z) < 0.18 ? 'So close!' : 'It slipped!', 2); } }
    else if (phase === 'release') { cl.open = clamp(phT / 0.3, 0, 1); if (phT > 0.25 && held) release(false); if (phT > 1.3 || (phT > 0.6 && !pile.bodies.some(b => !b.gone && b.v.lengthSq() > 0.04))) { setPhase('home'); } }
    else if (phase === 'home') { if (phT > 0.15) afterTry(); }
    else if (phase === 'count' && race) { if (Date.now() >= race.t0) beginTry(); else emit(); }
    if (race && mode === 'race' && phase !== 'done') { const left = race.t1 - Date.now(); if (left <= 10000 && !race.hurry) { race.hurry = true; snd.track('hurry'); flashIt('10 SECONDS!', '#ec3013', 1.4); } }
    if (race && mode === 'race' && Date.now() >= race.t1 && phase !== 'done') { if (held) release(false); finishRace(); }
    { const tz = clamp(-cl.vx * 0.55, -0.3, 0.3), tx = clamp(cl.vz * 0.55, -0.3, 0.3); swV.z += ((tz - sw.z) * 38 - swV.z * 2.6) * dt; swV.x += ((tx - sw.x) * 38 - swV.x * 2.6) * dt; sw.z += swV.z * dt; sw.x += swV.x * dt; }
    if (held) { held.p.set(cl.x + 0.21 * Math.sin(sw.z), cl.y + 0.01, cl.z - 0.21 * Math.sin(sw.x)); held.v.set(cl.vx, 0, cl.vz); }
    pile.step(dt, onFall);
    mainCab.set(cl.x, cl.z, cl.y, cl.open); { const L = 0.21, c = mainCab.claw; c.rotation.set(sw.x, 0, sw.z); c.position.x += L * Math.sin(sw.z); c.position.z -= L * Math.sin(sw.x); c.position.y += L * (2 - Math.cos(sw.z) - Math.cos(sw.x)); } mainCab.stick.rotation.set(-jy * 0.4, 0, -jx * 0.4);
    // neighbours (online friends' claws, or idle demo motion)
    neighbours.forEach((nb, i) => { const t = nb.tgt, c = nb.cl; if (t) { c.x = damp(c.x, t.x, 10, dt); c.z = damp(c.z, t.z, 10, dt); c.y = damp(c.y, t.y, 10, dt); c.open = damp(c.open, t.o, 10, dt); }
      else { const k = hintT * 0.35 + i * 1.7; c.x = Math.sin(k) * 0.35; c.z = Math.cos(k * 0.7) * 0.2; c.y = TOPY; c.open = 1; } nb.set(c.x, c.z, c.y, c.open);
      if (race && nb.labelSprite) { const id = race.ids.filter(x => x !== (net && net.id))[i], pl = id && race.players.find(p => p.id === id), tx = pl ? pl.name + ' · ' + pl.score : null; if (tx && tx !== nb.labelTxt) setLabel(nb, tx, pl.col); } });
    bulbT += dt; const on = Math.floor(bulbT * (phase === 'reveal' ? 9 : 3)) % 2; [mainCab, ...neighbours].forEach(cb => { cb.bulbs[0].color.set(on ? '#fff3b0' : '#7a5a20'); cb.bulbs[1].color.set(on ? '#7a5a20' : '#fff3b0'); });
    // ---- polish animation: sound motor, ambience, ticks, lights ----
    const spd = Math.hypot(cl.vx, cl.vz);
    if (phase === 'aim') snd.motor(Math.min(1, spd / 0.45) * 0.8, 0.3 + spd); else if (phase === 'drop') snd.motor(0.7, 0.22); else if (phase === 'lift') snd.motor(held ? 1 : 0.8, held ? 0.42 : 0.6); else if (phase === 'carry') snd.motor(0.75, 0.7); else snd.motor(0, 0.3);
    snd.ambience(dt);
    if (phase === 'aim') { const tk = Math.ceil(aimLeft); if (tk <= 5 && tk !== lastTick && tk > 0) snd.play('tick', tk <= 2); lastTick = tk; } else lastTick = 99;
    if (phase === 'count' && race) { const cn = Math.ceil((race.t0 - Date.now()) / 1000); if (cn !== lastCount && cn >= 1 && cn <= 3) snd.play('count', false); lastCount = cn; } else if (lastCount !== 99 && phase === 'aim' && mode === 'race') { snd.play('count', true); lastCount = 99; }
    winFx = Math.max(0, winFx - dt * 0.5); ledPulse = Math.max(0, ledPulse - dt * 2.5); shake = Math.max(0, shake - dt * 0.08);
    const rainbow = winFx > 0 || phase === 'reveal';
    [mainCab, ...neighbours].forEach((cb, ci) => { const isMain = cb === mainCab; if (isMain && rainbow) { const hh = (bulbT * 0.9) % 1; cb.bulbs[0].color.setHSL(hh, 1, 0.65); cb.bulbs[1].color.setHSL((hh + 0.5) % 1, 1, 0.65); }
      const ph2 = Math.floor(bulbT * (isMain && rainbow ? 9 : 3)) % 2; cb.bglow[0].material.opacity = (ph2 ? 0.55 : 0.2) * (isMain && rainbow ? 1.4 : 1); cb.bglow[1].material.opacity = (ph2 ? 0.2 : 0.55) * (isMain && rainbow ? 1.4 : 1);
      cb.cone.m.material.opacity = (isMain ? 0.16 + winFx * 0.25 : 0.1) * (0.92 + Math.sin(hintT * 3 + ci) * 0.08); });
    const ledCol = phase === 'aim' ? ringMat.color : (held ? '#22c55e' : '#ffffff'); mainCab.led.material.color.set(ledCol); mainCab.led.scale.setScalar(1 + ledPulse * 0.5);
    mainCab.flap.material.color.setHSL(0.13, 1, 0.55 + winFx * 0.4 + (phase === 'reveal' ? Math.sin(hintT * 12) * 0.15 : 0));
    sparks.material.opacity = 0.35 + 0.35 * Math.sin(hintT * 2.3) + winFx * 0.4; sparks.rotation.y += dt * 0.05; for (let i = 0; i < spN; i++) { spP[i * 3 + 1] += dt * 0.03; if (spP[i * 3 + 1] > IH - 0.08) spP[i * 3 + 1] = 0.15; } spGeo.attributes.position.needsUpdate = true;
    innerCone.material.opacity = 0.1 + winFx * 0.25;
    signGlow.material.opacity = Math.random() < 0.004 ? 0.1 : 0.45 + Math.sin(hintT * 1.7) * 0.08; neons.forEach(([m, gl], i) => { gl.material.opacity = 0.28 + Math.sin(hintT * 2 + i * 1.7) * 0.08; });
    videos.forEach((v, i) => { v.sc.material.map.offset.x = (hintT * 0.06 * (i % 2 ? 1 : -1)) % 1; });
    // fox
    if (fox) { fox.userData.lookAt = phase === 'reveal' ? camera.position : C.localToWorld(V3(cl.x, cl.y, cl.z)); fox.userData.mood = phase === 'reveal' || (flashT > 0 && flash && /!/.test(flash.txt)) ? 'excited' : held ? 'surprised' : 'happy'; if (phase === 'reveal' && phT < 0.05) fox.userData.hop = 1;
      const fp = phase === 'intro' ? FOXAT.intro : FOXAT.play, fd = fox.position.distanceTo(fp), fsp = fd > 0.02 ? 1.4 : 0; if (fsp) { fox.position.lerp(fp, Math.min(1, fsp * dt / fd)); } fox.rotation.y = damp(fox.rotation.y, phase === 'intro' ? -1.2 : -1.45, 5, dt); kit.animFox(fox, dt, fsp ? 2.2 : 0); }
    // camera
    const sk = phase === 'intro' ? 'intro' : view; const s = shot(sk); if (!camInit) { camPos.copy(s.pos); camLook.copy(s.look); camInit = true; }
    const lean = phase === 'intro' ? V3(Math.sin(hintT * 0.3) * 0.25, 0, 0) : V3(); const cr = phase === 'intro' ? 2.5 : 5; camPos.x = damp(camPos.x, s.pos.x + lean.x, cr, dt); camPos.y = damp(camPos.y, s.pos.y, cr, dt); camPos.z = damp(camPos.z, s.pos.z, cr, dt); camLook.lerp(s.look, 1 - Math.exp(-cr * dt));
    // glass sheen drifts, bulb glow breathes, rare prizes twinkle
    streak.offset.x = (hintT * 0.03) % 1; bulbGlow.forEach((m, i) => { m.material.opacity = 0.22 + 0.14 * Math.sin(hintT * 6 + i * Math.PI) + winFx * 0.3; });
    { let k = 0; for (const b of pile.bodies) { if (k >= twinkles.length) break; if (b.gone || b.held || b.def.kind !== 'fox') continue; const sp = twinkles[k], ph = hintT * 2.2 + b.uid * 1.7, pu = Math.max(0, Math.sin(ph)); sp.visible = pu > 0.05; sp.position.set(b.p.x + 0.05, b.p.y + 0.09, b.p.z + 0.04); sp.scale.setScalar(0.03 + pu * 0.07); sp.material.rotation = ph * 0.5; sp.material.color.set(b.def.id === 'kingPlush' ? '#ffd23a' : '#fff3b0'); k++; } for (; k < twinkles.length; k++) twinkles[k].visible = false; }
    camera.position.copy(camPos); camera.lookAt(camLook); if (shake > 0) { camera.position.x += (Math.random() - 0.5) * shake; camera.position.y += (Math.random() - 0.5) * shake; }
    const side = view === 'SIDE' && phase !== 'intro'; neighbours.forEach(nb => { nb.G.visible = !(side && nb.G.position.x > 0); }); if (fox) fox.visible = !side && !['aim', 'drop', 'grab', 'lift', 'carry', 'release', 'home', 'count'].includes(phase);
    // reveal pop
    if (pop.visible && popMesh) { popT += dt; const k = smooth(0, 0.45, popT), dist = 0.75, Wd = CW(), H = CH(), nx = ((2 * SAFE.left / Wd - 1) + (1 - 2 * SAFE.right / Wd)) / 2, ny = ((1 - 2 * SAFE.top / H) + (-1 + 2 * SAFE.bottom / H)) / 2;
      const dir = V3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize(), up = V3().setFromMatrixColumn(camera.matrixWorld, 1); pop.position.copy(camera.position).addScaledVector(dir, dist).addScaledVector(up, -(1 - k) * 0.3);
      const hView = 2 * Math.tan(camera.fov * Math.PI / 360) * dist * (1 - (SAFE.top + SAFE.bottom) / H); pop.scale.setScalar(k * clamp(hView * 0.26 / 0.24, 0.25, 1.3)); pop.quaternion.copy(camera.quaternion); popMesh.rotation.y += dt * 1.6; rays.rotation.z += dt * 0.6; rays.material.opacity = k * 0.8; popMesh.rotation.x = Math.sin(popT * 2) * 0.15; if (pop.userData.life && popT > pop.userData.life) hidePop(); }
    if (conf.visible) { confT += dt; for (let i = 0; i < confN; i++) { confV[i].y -= 2.5 * dt; confP[i * 3] += confV[i].x * dt; confP[i * 3 + 1] += confV[i].y * dt; confP[i * 3 + 2] += confV[i].z * dt; } confGeo.attributes.position.needsUpdate = true; conf.material.opacity = 1 - smooth(1.2, 2, confT); if (confT > 2) conf.visible = false; }
    // net snapshot
    if (net && race && mode === 'race') { snT -= dt; if (snT <= 0) { snT = 0.15; sendSn(); } }
    if (net) { pingT -= dt; if (pingT <= 0) { pingT = 3; hello(); const now = performance.now(); for (const id of Object.keys(lastSeen)) if (now - lastSeen[id] > 20000) gone(id); } }
  }
  const onRs = () => { renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); emit(true); };
  ready = true; const ro = new ResizeObserver(onRs); ro.observe(container); onRs(); setPhase('intro'); frame();
  const rm = /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) netJoin(rm[1]);

  return {
    hud, startMode, drop, toggleView, toIntro, revealNext, buyPack, netOpen, netJoin, netCreate, netReady, netClose, netLeave: () => { netLeave(); N.st = 'menu'; emit(true); },
    turnGo: () => { if (phase === 'turn') beginTry(); },
    setJoy(x, y) { joy.x = clamp(x, -1, 1); joy.y = clamp(y, -1, 1); },
    setSafe(top, bottom, left = 0, right = 0) { if ([top - SAFE.top, bottom - SAFE.bottom, left - SAFE.left, right - SAFE.right].some(v => Math.abs(v) > 3)) Object.assign(SAFE, { top, bottom, left, right }); },
    setFox(k) { if (!['player', 'hope', 'noble'].includes(k)) return; foxKey = k; save.setStat(CLAW.key + '.fox', k); makeFoxAt(); emit(true); },
    setSound(on) { snd.on = on; save.setStat(CLAW.key + '.sound', on ? 1 : 0); emit(true); }, setMusic(on) { snd.music = on; save.setStat(CLAW.key + '.music', on ? 1 : 0); emit(true); }, sfx(name) { snd.play(name); }, setAudioAim(on) { audioAim = on; save.setStat(CLAW.key + '.audioAim', on ? 1 : 0); emit(true); },
    demoStart() { startMode('demo'); }, demoStop() { toIntro(); }, roomLink: () => { try { const u = new URL(location.href); u.searchParams.set('room', N.code); return u.href; } catch (e) { return ''; } },
    destroy() { alive = false; cancelAnimationFrame(raf); netLeave(); snd.destroy(); ro.disconnect(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); renderer.dispose(); renderer.domElement.remove(); },
    _debug: { audio: () => snd.selfTest(), info: () => renderer.info.render, census() { const r = {}; scene.children.forEach((c, i) => { let n = 0; c.traverseVisible(o => { if (o.isMesh || o.isPoints || o.isSprite) n++; }); if (n) r[i + ':' + (c.type) + (c === fox ? ':FOX' : '')] = n; }); return r; }, pile: () => pile, cl, probe, save, SAFE, camera, run(sec) { for (let t = 0; t < sec; t += 1 / 60) update(1 / 60); return phase; } },
  };
}
