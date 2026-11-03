// 8 GATES — SHOOTING GALLERY [shootingGallery]. Minigame #30. A carnival cork-rifle booth that fits inside any building on any world.
// Phone first: TAP A TARGET TO SHOOT IT (mouse: aim + click). 8 corks a clip, RELOAD button (or R), four moving rows + pop-up crows.
// Green FOX CARDS are friends: don't shoot them. Hit streaks raise the multiplier (x2 at 5, x3 at 10). Centre hits = BULLSEYE +5.
// Modes: CLASSIC 45 s · RAPID FIRE 30 s · PASS & PLAY (2-5 players, one phone, everyone gets the SAME gallery) ·
//        ONLINE (2-5 players, peer to peer through engine/duel-net.js, game 'shootingGallery': everyone shoots the same targets, first hit wins it).
// Every target's path is computed from a shared seed (no position sync needed). The host (lowest id) only rules who hit a target first.
// Rows are laid out in SCREEN space, so portrait and landscape both get big, tappable targets; the booth re-frames on every resize.
// Themes: ?world=meru|gaya|jidda|kufa|luxor|nebo|ur|zion|home|earth|station|kyoto re-skins the awning, wall and sign.
// MERGE: createShootingGallery({ container, onState, world }) stands alone (the DC page opens it; a world can open the page in a panel with ?embed=1).
// Save: gold / XP / prize items only through engine/save.js; every stat, flag and item id starts with 'shootingGallery.'.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_FEMALE } from '../../fox-kit.js';
import { crestTex, canvasTex, FONT } from '../../engine/textures.js';
import { save } from '../../engine/save.js';

export const GALLERY = { key: 'shootingGallery', name: 'SHOOTING GALLERY', room: 'shootingGallery', number: 30 };
export const MODES = {
  classic: { id: 'classic', name: 'CLASSIC', dur: 45, spd: 1, gap: 1, ammo: 8, reload: 0.8, popDur: 1.5, line: '45 SECONDS · FOUR ROWS' },
  rapid: { id: 'rapid', name: 'RAPID FIRE', dur: 30, spd: 1.45, gap: 0.7, ammo: 8, reload: 0.6, popDur: 1.1, line: '30 SECONDS · FAST ROWS' },
};
export const TARGETS = {
  duck: { name: 'DUCK', pts: 10, col: '#ffd23a' }, gduck: { name: 'GOLDEN DUCK', pts: 50, col: '#ffb000' }, can: { name: 'TIN CAN', pts: 15, col: '#cfd6de' },
  star: { name: 'STAR', pts: 20, col: '#ffd23a' }, bird: { name: 'BLUEBIRD', pts: 30, col: '#38bdf8' }, bell: { name: 'GOLD BELL', pts: 75, col: '#ffcc33' },
  crow: { name: 'POP-UP CROW', pts: 25, col: '#201e1d' }, fox: { name: "FOX CARD · DON'T SHOOT", pts: -30, col: '#22c55e' },
};
// DRAFT for Ben: prize thresholds (CLASSIC and RAPID both count) and the booth keeper's name/lines.
export const PRIZES = [
  { id: 'shootingGallery.foxPlush', name: 'FOX PLUSH', at: 400 },
  { id: 'shootingGallery.corkPin', name: 'GOLD CORK PIN', at: 900 },
  { id: 'shootingGallery.ribbon', name: 'SHARPSHOOTER RIBBON', at: 1500 },
];
// s474 PHASER RANGE (world=space): the station edition's targets, keeper and prizes (same rules + points as the fair booth)
export const SPACE_TARGETS = {
  duck: { name: 'PATROL DRONE', pts: 10, col: '#7fd8ff' }, gduck: { name: 'GOLD PROBE', pts: 50, col: '#ffb000' }, can: { name: 'ASTEROID', pts: 15, col: '#c9a27a' },
  star: { name: 'SATELLITE', pts: 20, col: '#8fb8ff' }, bird: { name: 'COMET', pts: 30, col: '#5fe3ff' }, bell: { name: 'GOLD BEACON', pts: 75, col: '#ffcc33' },
  crow: { name: 'PIRATE CUT-OUT', pts: 25, col: '#ec3013' }, fox: { name: "HELPER BOT · DON'T SHOOT", pts: -30, col: '#22c55e' } };
export const SPACE_PRIZES = [{ id: 'shootingGallery.phaserPin', name: 'PHASER PIN', at: 400 }, { id: 'shootingGallery.holoRibbon', name: 'HOLO RIBBON', at: 900 }, { id: 'shootingGallery.r8Figure', name: 'R-8 FIGURE', at: 1500 }];
export const SPACE_KEEPER = { name: 'ZEE', role: 'Phaser range warden', lines: {
  intro: ['Phasers are on stun. Eight charges a cell. Tap a target to zap it.', 'Drones, rocks, satellites, comets. The gold beacon pays the most!', 'Green helper bots are friends. Do not zap them.'],
  good: ['Clean shooting, pilot!', 'You could run this range.', 'Pick a prize, sharpshooter!'], ok: ['Not bad at all!', 'Another cell?'], low: ['Warm-up round. Again?', 'Aim for the big drones first.'] } };
export const ITEM_LABELS = { 'shootingGallery.phaserPin': 'Phaser Pin', 'shootingGallery.holoRibbon': 'Holo Ribbon', 'shootingGallery.r8Figure': 'R-8 Figure', 'shootingGallery.foxPlush': 'Fox Plush', 'shootingGallery.corkPin': 'Gold Cork Pin', 'shootingGallery.ribbon': 'Sharpshooter Ribbon' };
export const KEEPER = { name: 'DOT', role: 'Booth keeper (DRAFT)', lines: {
  intro: ['Step right up! Eight corks a clip. Tap a target to shoot it.', 'Ducks, cans, stars, birds. The gold bell is worth the most!', "Green fox cards are my friends. Please don't shoot them."],
  good: ['What a shot!', 'You could run this booth.', 'Pick a prize, sharpshooter!'], ok: ['Not bad at all!', 'Have another go?'], low: ['Warm-up round. Again?', 'Aim for the big ducks first.'] } };
export const COLORS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PURPLE', '#a78bfa']];
export const MAX_PLAYERS = 5;
export const THEMES = {
  default: { label: '8 GATES', wall: '#4a1426', star: '#ffd23a', a: '#ec3013', b: '#f6f3ee', trim: '#ffd23a', wood: '#8a5a32', water: '#2f8fd8' },
  meru: { label: 'MERU', wall: '#151b3d', star: '#e6b45a', a: '#c42d3c', b: '#f6f3ee', trim: '#e6b45a', wood: '#7a4a2a', water: '#2f8fd8' },
  gaya: { label: 'GAYA', wall: '#1f3a2a', star: '#a7f3d0', a: '#16a34a', b: '#f0fdf4', trim: '#facc15', wood: '#6b4a2a', water: '#0ea5a4' },
  jidda: { label: 'JIDDA', wall: '#0b3a52', star: '#7dd3fc', a: '#0e7fb8', b: '#fffbeb', trim: '#fbbf24', wood: '#9a6b3a', water: '#0284c7' },
  kufa: { label: 'KUFA', wall: '#4a2a12', star: '#fcd34d', a: '#d97706', b: '#fef3c7', trim: '#fde68a', wood: '#a0703a', water: '#0891b2' },
  luxor: { label: 'LUXOR', wall: '#1c1917', star: '#f59e0b', a: '#b91c1c', b: '#fafaf9', trim: '#f59e0b', wood: '#57534e', water: '#2563eb' },
  nebo: { label: 'NEBO', wall: '#2e1065', star: '#f0abfc', a: '#7c3aed', b: '#faf5ff', trim: '#f0abfc', wood: '#6b4a2a', water: '#4f46e5' },
  ur: { label: 'UR', wall: '#3f2a14', star: '#fde047', a: '#a16207', b: '#fefce8', trim: '#fde047', wood: '#8a5a32', water: '#0369a1' },
  zion: { label: 'ZION', wall: '#3b1d0e', star: '#fbbf24', a: '#c2410c', b: '#fff7ed', trim: '#fbbf24', wood: '#7c2d12', water: '#1d4ed8' },
  home: { label: 'HOME', wall: '#14213d', star: '#fca311', a: '#ec3013', b: '#e5e5e5', trim: '#fca311', wood: '#8a5a32', water: '#2f8fd8' },
  earth: { label: 'EARTH', wall: '#111827', star: '#60a5fa', a: '#2563eb', b: '#f8fafc', trim: '#fbbf24', wood: '#78350f', water: '#0ea5e9' },
  station: { label: 'DEEP SPACE FOX', wall: '#020617', star: '#7dd3fc', a: '#0f172a', b: '#38bdf8', trim: '#7dd3fc', wood: '#334155', water: '#6366f1' },
  space: { label: 'PHASER RANGE', wall: '#04050d', star: '#7fd8ff', a: '#1a3fb8', b: '#dfe8f6', trim: '#5fe3ff', wood: '#2a2e38', water: '#5fe3ff' },   // s474 the station edition (Ben: phaser blaster + space targets)
  kyoto: { label: 'KYOTO', wall: '#3a0a0a', star: '#fca5a5', a: '#b91c1c', b: '#fff1f2', trim: '#fbbf24', wood: '#44281a', water: '#1e40af' },
};
// the DEMO: a scripted autopilot round with captions (no stats, gold or prizes are saved)
export const DEMO = [
  { t: -9, cap: 'Rows of targets slide across the booth. The round starts in 3…', key: '' },
  { t: 0, cap: 'TAP A TARGET TO SHOOT IT. Ducks 10 · cans 15 · stars 20 · birds 30.', key: 'TAP', prefer: ['duck', 'can', 'star', 'bird'] },
  { t: 6, cap: '8 corks a clip. When it is empty, tap RELOAD (it also reloads by itself).', key: '8', prefer: ['duck', 'can'] },
  { t: 12, cap: 'Hit 5 in a row for ×2 points, 10 in a row for ×3. A miss ends the streak.', key: '×3', prefer: ['star', 'bird', 'can', 'duck'] },
  { t: 17.5, cap: "Green FOX CARDS are friends. Shooting one costs 30 points. Don't!", key: '!', fox: true, prefer: ['duck', 'can'] },
  { t: 23, cap: 'Pop-up crows are 25. The gold bell across the top is worth 75!', key: '75', prefer: ['bell', 'gduck', 'crow', 'bird'] },
  { t: 29, cap: 'Hit the middle of a target for a BULLSEYE +5. Your turn!', key: '◎', prefer: ['bird', 'star', 'can'] },
  { t: 33.5, end: true },
];
const SK = { best: m => 'shootingGallery.best.' + m, rounds: 'shootingGallery.rounds', hits: 'shootingGallery.hits', shots: 'shootingGallery.shots', bells: 'shootingGallery.bells', wins: 'shootingGallery.onlineWins', prize: id => 'shootingGallery.prize.' + id.split('.').pop() };
const PREFS = 'shootingGallery.prefs';

// ---------------- small helpers (copied, not imported: village-game.js is a shared file this game must not depend on) ----------------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), pick = a => a[Math.floor(Math.random() * a.length)];
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const easeOut = t => 1 - (1 - t) * (1 - t);
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeGradient() { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function glowTexture() { return canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); }
function loadPrefs() { try { return { assist: false, muted: false, ...JSON.parse(localStorage.getItem(PREFS) || '{}') }; } catch (e) { return { assist: false, muted: false }; } }
function savePrefs(p) { try { localStorage.setItem(PREFS, JSON.stringify(p)); } catch (e) {} }

// ---------------- the target schedule: every target of a round, from one seed ----------------
// row targets: { id, row, type, t0, dir, spd } → u(t) = dir * (-U + spd * (t - t0)), on screen while |u| <= U
// pop-ups:     { id, row: 4, type, t0, u, dur }
export const U = 1.16;
export const ROWS = [
  { z: -2.5, f: 0.31, dir: 1, spd: 0.30, gap: [1.5, 2.3], mix: [['duck', 0.8], ['fox', 0.12], ['gduck', 0.08]], kind: 'water' },
  { z: -2.9, f: 0.50, dir: -1, spd: 0.25, gap: [1.6, 2.4], mix: [['can', 0.82], ['fox', 0.18]], kind: 'shelf' },
  { z: -3.3, f: 0.68, dir: 1, spd: 0.40, gap: [1.4, 2.2], mix: [['star', 0.85], ['fox', 0.15]], kind: 'rail' },
  { z: -3.7, f: 0.86, dir: -1, spd: 0.52, gap: [1.9, 3.0], mix: [['bird', 1]], kind: 'sky' },
];
export const POP = { z: -1.95, f: 0.155 };
export function makeSchedule(seed, modeId, slow = 1) {
  const md = MODES[modeId] || MODES.classic, R = rng(seed), out = []; let id = 0;
  const mix = m => { let x = R(), acc = 0; for (const [t, p] of m) { acc += p; if (x <= acc) return t; } return m[m.length - 1][0]; };
  ROWS.forEach((row, ri) => { const spd = row.spd * md.spd * slow; let t = -2.3 / spd + R() * 0.8; let lastFox = -9;
    while (t < md.dur) { let type = mix(row.mix); if (type === 'fox' && t - lastFox < 3.5) type = row.mix[0][0]; if (type === 'fox') lastFox = t;
      out.push({ id: id++, row: ri, type, t0: t, dir: row.dir, spd }); t += (row.gap[0] + R() * (row.gap[1] - row.gap[0])) * md.gap / slow; } });
  // gold bells across the top: two in CLASSIC, one in RAPID, always one in the last call
  const bells = md.dur > 40 ? [md.dur * 0.35 + R() * 4, md.dur - 9] : [md.dur - 8]; bells.forEach((t, i) => out.push({ id: id++, row: 3, type: 'bell', t0: t, dir: i % 2 ? 1 : -1, spd: 0.85 * md.spd * slow, bell: true }));
  // pop-up crows (and the odd fox) from behind the counter
  let t = 1.2 + R(); while (t < md.dur - 0.6) { out.push({ id: id++, row: 4, type: R() < 0.16 ? 'fox' : 'crow', t0: t, u: (R() * 2 - 1) * 0.8, dur: md.popDur / Math.sqrt(slow) }); t += (2.2 + R() * 1.6) * md.gap / slow; }
  return out;
}
const life = e => e.row === 4 ? [e.t0, e.t0 + e.dur] : [e.t0, e.t0 + 2 * U / e.spd];

// ---------------- sound: tiny WebAudio synth (pop, ding, clank, bell, buzzer) + a soft calliope loop ----------------
class Sfx {
  constructor() { this.ctx = null; this.muted = false; this.music = null; this.beat = 0; this.nextT = 0; }
  unlock() { try { if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; this.ctx = new C(); this.out = this.ctx.createGain(); this.out.gain.value = 0.7; this.out.connect(this.ctx.destination); const n = this.ctx.sampleRate * 0.4, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.noiseB = b; } if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) {} }
  ok() { return this.ctx && !this.muted; }
  tone(f, d, v = 0.15, type = 'triangle', at = 0, f2, pan = 0) { if (!this.ok()) return; const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); let n = g; if (c.createStereoPanner && pan) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); n = p; } o.connect(g); n.connect(this.out); o.start(t); o.stop(t + d + 0.02); }
  noise(d, v = 0.2, fq = 1800, at = 0, q = 0.8) { if (!this.ok()) return; const c = this.ctx, t = c.currentTime + at, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noiseB; f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = q; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(this.out); s.start(t); s.stop(t + d + 0.02); }
  shot() { this.noise(0.07, 0.35, 2400); this.tone(180, 0.08, 0.18, 'sine', 0, 70); }
  hit(pan) { this.tone(880, 0.12, 0.12, 'triangle', 0, null, pan); this.tone(1320, 0.18, 0.1, 'triangle', 0.05, null, pan); }
  clank(pan) { this.tone(310, 0.16, 0.08, 'square', 0, 240, pan); this.noise(0.12, 0.18, 4200, 0, 3); }
  bell() { [1568, 2093, 2637].forEach((f, i) => this.tone(f, 1.1, 0.09, 'sine', i * 0.04)); }
  buzz() { this.tone(140, 0.28, 0.12, 'sawtooth'); this.tone(110, 0.28, 0.1, 'sawtooth', 0.02); }
  miss() { this.noise(0.05, 0.12, 600); }
  click() { this.tone(1200, 0.03, 0.06, 'square'); this.tone(700, 0.04, 0.06, 'square', 0.12); }
  empty() { this.tone(400, 0.04, 0.05, 'square'); }
  beep(hi) { this.tone(hi ? 1046 : 659, hi ? 0.35 : 0.14, 0.13, 'square'); }
  fanfare() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 0.1, 'square', i * 0.12)); }
  // a soft carnival waltz, scheduled a beat ahead from update()
  tick(on) { if (!this.ok() || !on) return; const c = this.ctx; if (this.nextT < c.currentTime) this.nextT = c.currentTime + 0.05; while (this.nextT < c.currentTime + 0.2) { const b = this.beat++, bar = Math.floor(b / 3) % 8, k = b % 3, root = [262, 262, 349, 349, 392, 392, 262, 392][bar];
      const at = this.nextT - c.currentTime; if (k === 0) this.tone(root / 2, 0.28, 0.05, 'triangle', at); else this.tone(root * (k === 1 ? 1.25 : 1.5), 0.16, 0.025, 'square', at);
      const mel = [784, 659, 698, 784, 880, 784, 659, 587, 523, 587, 659, 523, 587, 659, 784, 0, 880, 784, 698, 659, 587, 659, 523, 0][b % 24]; if (mel) this.tone(mel, 0.2, 0.03, 'triangle', at); this.nextT += 0.36; } }
}

// ======================================================================================================
// WORLD MODE (s102, Ben: Arena Path games in world): opts.inWorld = { renderer, camera, parent } plays at Meru's gallery booth: no own renderer or lights
// (throw-away scene LS), the game's own screen-fitted booth, targets, corks and keeper live in a 'festWorld' group under parent (Meru's stall hides);
// the rifle rides a rig that copies the camera; the camera is mirrored to world (wcam); taps on the map canvas are captured.
export async function createShootingGallery({ container, onState = () => {}, world, opts = {} } = {}) {
  const WD = opts.inWorld || null, wel = WD && WD.renderer.domElement;
  const qs = new URLSearchParams(location.search), worldKey = String(world || qs.get('world') || 'default').toLowerCase(), theme = THEMES[worldKey] || THEMES.default, SP = worldKey === 'space';
  const TGT = SP ? SPACE_TARGETS : TARGETS, PZ = SP ? SPACE_PRIZES : PRIZES, KP = SP ? SPACE_KEEPER : KEEPER;
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => (wel || container).clientWidth || 1, CHh = () => (wel || container).clientHeight || 1;
  let renderer; if (WD) renderer = WD.renderer; else { renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.75 : 2)); renderer.setSize(CW(), CHh());
  renderer.shadowMap.enabled = false; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;cursor:none'; container.appendChild(renderer.domElement); }
  const LS = new THREE.Scene(); let scene = LS; if (WD) { scene = new THREE.Group(); scene.name = 'festWorld'; WD.parent.add(scene); } else scene.background = new THREE.Color(theme.wall);
  const camera = new THREE.PerspectiveCamera(WD ? WD.camera.fov : 50, CW() / CHh(), 0.05, 140); LS.add(camera); const wcam = WD ? new THREE.PerspectiveCamera(50, 1, 0.02, 400) : null, _wq = new THREE.Quaternion(), camRig = new THREE.Group(); if (WD) scene.add(camRig);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  LS.add(new THREE.HemisphereLight(0xfff6e8, 0x6a4a5a, 1.25)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(2, 6, 8); LS.add(sun);
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const sfx = new Sfx(), prefs = loadPrefs(); sfx.muted = !!prefs.muted;
  if (SP) Object.assign(sfx, { shot() { this.tone(1800, 0.16, 0.12, 'sawtooth', 0, 260); this.tone(900, 0.12, 0.08, 'square', 0.01, 180); this.noise(0.05, 0.12, 5200); },
    hit(pan) { this.tone(660, 0.08, 0.1, 'square', 0, 1320, pan); this.tone(1760, 0.16, 0.07, 'sine', 0.05, null, pan); },
    clank(pan) { this.noise(0.2, 0.3, 900, 0, 0.6); this.tone(120, 0.2, 0.12, 'sine', 0, 60, pan); },
    bell() { [1318, 1760, 2637, 3520].forEach((f, i) => this.tone(f, 0.9, 0.07, 'sine', i * 0.06)); },
    click() { this.tone(300, 0.25, 0.06, 'sawtooth', 0, 1200); },
    tick(on) { if (!this.ok() || !on) return; const c = this.ctx; if (this.nextT < c.currentTime) this.nextT = c.currentTime + 0.05; while (this.nextT < c.currentTime + 0.2) { const b = this.beat++, at = this.nextT - c.currentTime, root = [220, 220, 196, 175][Math.floor(b / 8) % 4];
      if (b % 4 === 0) this.tone(root / 2, 0.5, 0.05, 'triangle', at); const arp = [1, 1.5, 2, 2.5, 3, 2.5, 2, 1.5][b % 8]; this.tone(root * arp, 0.14, 0.02, 'square', at); if (b % 16 === 14) this.tone(root * 4, 0.4, 0.02, 'sine', at); this.nextT += 0.18; } } });

  // ---------------- textures ----------------
  const wallTex = SP ? canvasTex(512, 512, (g) => { g.fillStyle = theme.wall; g.fillRect(0, 0, 512, 512); const ng = g.createRadialGradient(360, 150, 10, 360, 150, 260); ng.addColorStop(0, 'rgba(95,227,255,0.22)'); ng.addColorStop(1, 'rgba(95,227,255,0)'); g.fillStyle = ng; g.fillRect(0, 0, 512, 512); const n2 = g.createRadialGradient(120, 380, 10, 120, 380, 220); n2.addColorStop(0, 'rgba(160,90,255,0.18)'); n2.addColorStop(1, 'rgba(160,90,255,0)'); g.fillStyle = n2; g.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${(0.3 + Math.random() * 0.7).toFixed(2)})`; const s = Math.random() < 0.08 ? 3 : 1.5; g.fillRect(Math.random() * 512, Math.random() * 512, s, s); } g.strokeStyle = 'rgba(95,227,255,0.12)'; g.lineWidth = 1; for (let x = 0; x <= 512; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } }, [3, 2]) : canvasTex(256, 256, (g) => { g.fillStyle = theme.wall; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 32, 256);
    g.fillStyle = theme.star; const star = (cx, cy, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2); } g.closePath(); g.fill(); };
    star(48, 48, 10); star(176, 112, 8); star(80, 190, 7); star(220, 220, 10); star(140, 30, 5); }, [6, 4]);
  const woodTex = canvasTex(256, 128, (g) => { g.fillStyle = theme.wood; g.fillRect(0, 0, 256, 128); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 3, 128); g.fillStyle = 'rgba(255,255,255,0.07)'; for (let x = 8; x < 256; x += 32) g.fillRect(x, 0, 6, 128); g.fillStyle = theme.a; g.fillRect(0, 0, 256, 22); g.fillStyle = theme.trim; g.fillRect(0, 22, 256, 6); for (let x = 16; x < 256; x += 32) { g.beginPath(); g.arc(x, 11, 4, 0, 7); g.fill(); } }, [6, 1]);
  const waveTex = canvasTex(256, 64, (g) => { g.clearRect(0, 0, 256, 64); g.fillStyle = theme.water; g.beginPath(); g.moveTo(0, 64); for (let x = 0; x <= 256; x += 4) g.lineTo(x, 22 + Math.sin(x / 256 * Math.PI * 4) * 12); g.lineTo(256, 64); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= 256; x += 4) g.lineTo(x, 22 + Math.sin(x / 256 * Math.PI * 4) * 12); g.stroke(); g.strokeStyle = '#1a1626'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= 256; x += 4) g.lineTo(x, 26 + Math.sin(x / 256 * Math.PI * 4) * 12); g.stroke(); }, [4, 1]);
  const signTex = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#141018'; g.fillRect(0, 0, w, h); g.strokeStyle = theme.trim; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = theme.trim; for (let x = 40; x < w - 20; x += 44) { g.beginPath(); g.arc(x, 30, 7, 0, 7); g.fill(); g.beginPath(); g.arc(x, h - 30, 7, 0, 7); g.fill(); }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.font = `900 104px ${FONT}`; const TT = SP ? 'PHASER RANGE' : 'SHOOTING GALLERY'; { const k = Math.min(1, (w - 90) / g.measureText(TT).width); g.font = `900 ${Math.floor(104 * k)}px ${FONT}`; } g.fillText(TT, w / 2, h / 2 - 12); g.fillStyle = theme.trim; g.font = `900 40px ${FONT}`; g.fillText(SP ? 'STATION SECURITY · PHASERS ON STUN' : (theme.label + ' · STEP RIGHT UP').toUpperCase(), w / 2, h / 2 + 66); });
  const foxCardTex = canvasTex(256, 256, (g) => { g.fillStyle = '#22c55e'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 100, 0, 7); g.fill();
    g.fillStyle = '#f2741f'; g.beginPath(); g.moveTo(58, 60); g.lineTo(96, 96); g.lineTo(70, 120); g.closePath(); g.fill(); g.beginPath(); g.moveTo(198, 60); g.lineTo(160, 96); g.lineTo(186, 120); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(64, 104); g.quadraticCurveTo(128, 70, 192, 104); g.quadraticCurveTo(176, 168, 128, 192); g.quadraticCurveTo(80, 168, 64, 104); g.fill();
    g.fillStyle = '#fff3e4'; g.beginPath(); g.moveTo(84, 140); g.quadraticCurveTo(128, 120, 172, 140); g.quadraticCurveTo(156, 184, 128, 192); g.quadraticCurveTo(100, 184, 84, 140); g.fill();
    g.fillStyle = '#1a1626'; g.beginPath(); g.arc(104, 122, 9, 0, 7); g.arc(152, 122, 9, 0, 7); g.fill(); g.beginPath(); g.arc(128, 160, 10, 0, 7); g.fill();
    g.strokeStyle = '#1a1626'; g.lineWidth = 5; g.beginPath(); g.arc(128, 166, 16, 0.2, Math.PI - 0.2); g.stroke(); g.fillStyle = '#15803d'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.fillText("DON'T", 128, 224); g.fillText('SHOOT', 128, 46); });
  const canTex = canvasTex(256, 128, (g) => { g.fillStyle = '#d7dde3'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#ec3013'; g.fillRect(0, 30, 256, 68); g.fillStyle = '#ffffff'; for (let x = 32; x < 256; x += 64) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 9 : 22; g.lineTo(x + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.closePath(); g.fill(); } g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 26, 256, 4); g.fillRect(0, 98, 256, 4); });
  const ringTex = canvasTex(128, 128, (g) => { [[62, '#ffffff'], [50, '#ec3013'], [38, '#ffffff'], [26, '#ec3013'], [13, '#ffd23a']].forEach(([r, c]) => { g.fillStyle = c; g.beginPath(); g.arc(64, 64, r, 0, 7); g.fill(); }); });

  // ---------------- target art (each about 0.5 m, centred at 0,0,0 facing the camera) ----------------
  const flatShape = (pts, depth = 0.05) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 }); g.translate(0, 0, -depth / 2); return g; };
  const starPts = (r1, r2, n = 5) => Array.from({ length: n * 2 }, (_, i) => { const a = Math.PI / 2 + i * Math.PI / n, r = i % 2 ? r2 : r1; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const GEO = {
    duckBody: new THREE.SphereGeometry(1, 16, 12), duckHead: new THREE.SphereGeometry(0.1, 14, 10), beak: new THREE.ConeGeometry(0.045, 0.1, 8), eye: new THREE.SphereGeometry(0.018, 8, 6),
    stick: new THREE.BoxGeometry(0.035, 0.32, 0.035), can: new THREE.CylinderGeometry(0.115, 0.115, 0.28, 20, 1, true), canTop: new THREE.CylinderGeometry(0.115, 0.115, 0.012, 20),
    star: flatShape(starPts(0.26, 0.11), 0.05), disc: new THREE.CylinderGeometry(1, 1, 0.03, 32), ringPlane: new THREE.CircleGeometry(1, 32),
    bird: flatShape([[-0.22, 0.02], [-0.1, 0.1], [0.06, 0.1], [0.16, 0.14], [0.24, 0.08], [0.18, 0.03], [0.08, -0.06], [-0.12, -0.08], [-0.26, -0.02]], 0.05),
    wing: flatShape([[-0.08, 0], [0.08, 0], [0.02, 0.2], [-0.1, 0.16]], 0.03),
    bell: new THREE.LatheGeometry([[0, 0.2], [0.05, 0.19], [0.08, 0.15], [0.1, 0.05], [0.13, -0.06], [0.19, -0.14], [0.2, -0.17], [0, -0.17]].map(([x, y]) => new THREE.Vector2(x, y)), 24),
    clap: new THREE.SphereGeometry(0.045, 10, 8), rope: new THREE.BoxGeometry(0.014, 1.2, 0.014),
    crow: flatShape([[-0.24, -0.26], [-0.22, 0.02], [-0.12, 0.16], [-0.02, 0.24], [0.1, 0.26], [0.2, 0.2], [0.3, 0.18], [0.2, 0.12], [0.16, 0.0], [0.24, -0.14], [0.2, -0.26]], 0.04),
    sparkle: new THREE.OctahedronGeometry(0.04, 0),
  };
  const MAT = { stick: toon(SP ? '#3a3f4a' : '#6b4a2a'), duck: toon('#ffd23a'), duckW: toon('#f0b400'), gold: toon('#ffcc33', { emissive: new THREE.Color('#ff9a00'), emissiveIntensity: 0.35 }), beak: toon('#ff7a1a'), ink: toon('#1a1626'),
    can: new THREE.MeshToonMaterial({ map: canTex, gradientMap: grad }), canTop: toon('#aab4be'), star: toon('#ffd23a'), bird: toon('#38bdf8'), birdW: toon('#0e7fb8'), white: toon('#ffffff'),
    crow: toon('#201e1d'), ring: new THREE.MeshBasicMaterial({ map: ringTex }), fox: new THREE.MeshBasicMaterial({ map: foxCardTex }), foxRim: toon('#22c55e') };
  const SPM = SP ? { hull: toon('#c8d0dc'), dark: toon('#2a2e38'), lens: new THREE.MeshBasicMaterial({ color: '#ff3a2a' }), cyan: new THREE.MeshBasicMaterial({ color: '#5fe3ff' }), panel: toon('#1a3fb8', { emissive: new THREE.Color('#0a1a5a'), emissiveIntensity: 0.6 }),
    rock: toon('#8a7a68'), rockD: toon('#5a4e42'), comet: new THREE.MeshBasicMaterial({ color: '#e8fbff' }), tail: new THREE.MeshBasicMaterial({ color: '#5fe3ff', transparent: true, opacity: 0.55, depthWrite: false }), pirate: toon('#141218'), red: new THREE.MeshBasicMaterial({ color: '#ec3013' }), bot: toon('#e8eef6'), screen: toon('#0e1a24') } : null;
  const GS = SP ? { ico: new THREE.IcosahedronGeometry(0.15, 0), oct: new THREE.OctahedronGeometry(0.17, 0), box: new THREE.BoxGeometry(1, 1, 1), sph: new THREE.SphereGeometry(1, 16, 12), cone: new THREE.ConeGeometry(1, 1, 14, 1, true), torus: new THREE.TorusGeometry(1, 0.08, 8, 28) } : null;
  function buildSpaceArt(type) { const g = new THREE.Group(); let flap = null; const S = SPM, G = GS;
    if (type === 'duck' || type === 'gduck') { const gold = type === 'gduck'; const b = M(G.sph, gold ? MAT.gold : S.hull, 0, 0, 0, g, 0.012, 1); b.scale.set(0.17, 0.11, 0.12); const r = M(G.torus, gold ? MAT.gold : S.dark, 0, -0.01, 0, g, 0); r.scale.set(0.24, 0.24, 0.24); r.rotation.x = Math.PI / 2;
      const l = M(G.sph, gold ? S.cyan : S.lens, 0.1, 0.0, 0.07, g, 0); l.scale.setScalar(0.045); const a = M(G.box, S.dark, 0, 0.14, 0, g, 0); a.scale.set(0.012, 0.08, 0.012); M(G.sph, gold ? S.cyan : S.lens, 0, 0.19, 0, g, 0).scale.setScalar(0.02);
      if (gold) for (let i = 0; i < 3; i++) { const s = M(GEO.sparkle, MAT.white, rr(-0.2, 0.2), rr(0.05, 0.28), 0.1, g, 0); s.userData.spark = i; } }
    else if (type === 'can') { const a = M(G.ico, S.rock, 0, 0, 0, g, 0.012, 0.15); a.scale.set(1, 0.85, 0.9); a.rotation.set(rr(0, 3), rr(0, 3), 0); for (let i = 0; i < 3; i++) { const c = M(G.sph, S.rockD, rr(-0.08, 0.08), rr(-0.07, 0.07), 0.11, g, 0); c.scale.set(0.035, 0.035, 0.01); } flap = a; }
    else if (type === 'star') { const b = M(G.box, MAT.gold, 0, 0, 0, g, 0.01); b.scale.set(0.12, 0.1, 0.1); for (const s of [-1, 1]) { const p = M(G.box, S.panel, s * 0.2, 0, 0, g, 0.008); p.scale.set(0.2, 0.12, 0.012); const st = M(G.box, S.dark, s * 0.08, 0, 0, g, 0); st.scale.set(0.06, 0.012, 0.012); } const d = M(G.cone, S.hull, 0, 0.09, 0.02, g, 0); d.scale.set(0.05, 0.05, 0.05); }
    else if (type === 'bird') { M(G.sph, S.comet, 0.12, 0, 0, g, 0).scale.setScalar(0.08); flap = new THREE.Group(); g.add(flap); const t = M(G.cone, S.tail, -0.08, 0, 0, flap, 0); t.scale.set(0.075, 0.36, 0.075); t.rotation.z = Math.PI / 2; const t2 = M(G.cone, S.tail, -0.02, 0, 0, flap, 0); t2.scale.set(0.11, 0.2, 0.11); t2.rotation.z = Math.PI / 2; }
    else if (type === 'bell') { M(GEO.rope, S.dark, 0, 0.8, 0, g, 0); M(G.oct, MAT.gold, 0, 0, 0, g, 0.014, 0.17); const r = M(G.torus, MAT.gold, 0, 0, 0, g, 0); r.scale.setScalar(0.24); for (let i = 0; i < 3; i++) { const s = M(GEO.sparkle, MAT.white, rr(-0.25, 0.25), rr(-0.1, 0.25), 0.15, g, 0); s.userData.spark = i; } }
    else if (type === 'crow') { const b = M(G.box, S.pirate, 0, 0.02, 0, g, 0.014); b.scale.set(0.36, 0.42, 0.03); for (const s of [-1, 1]) { const x = M(G.box, S.red, 0, -0.05, 0.02, g, 0); x.scale.set(0.3, 0.05, 0.01); x.rotation.z = s * 0.7; } for (const s of [-1, 1]) { const e = M(G.sph, MAT.white, s * 0.07, 0.12, 0.02, g, 0); e.scale.set(0.04, 0.03, 0.01); } }
    else if (type === 'fox') { const d = M(GEO.disc, MAT.foxRim, 0, 0, -0.01, g, 0.014, 0.25); d.scale.set(0.25, 1, 0.25); d.rotation.x = Math.PI / 2; const h = M(G.sph, S.bot, 0, 0, 0.02, g, 0); h.scale.set(0.17, 0.15, 0.06); const sc = M(G.box, S.screen, 0, -0.005, 0.075, g, 0); sc.scale.set(0.22, 0.14, 0.01);
      for (const s of [-1, 1]) M(G.sph, S.cyan, s * 0.05, 0, 0.082, g, 0).scale.setScalar(0.022); const a = M(G.box, S.dark, 0, 0.19, 0, g, 0); a.scale.set(0.012, 0.08, 0.012); M(G.sph, MAT.foxRim, 0, 0.235, 0, g, 0).scale.setScalar(0.025); }
    return { g, flap }; }
  function buildArt(type) {
    if (SP) return buildSpaceArt(type);
    const g = new THREE.Group(); let flap = null;
    if (type === 'duck' || type === 'gduck') { const body = M(GEO.duckBody, type === 'gduck' ? MAT.gold : MAT.duck, 0, -0.03, 0, g, 0.014); body.scale.set(0.2, 0.14, 0.11);
      M(GEO.duckHead, type === 'gduck' ? MAT.gold : MAT.duck, 0.13, 0.12, 0, g, 0.012, 0.1); const bk = M(GEO.beak, MAT.beak, 0.24, 0.1, 0, g, 0.01); bk.rotation.z = -Math.PI / 2;
      M(GEO.eye, MAT.ink, 0.16, 0.15, 0.085, g, 0); const w = M(GEO.duckBody, type === 'gduck' ? MAT.gold : MAT.duckW, -0.03, -0.01, 0.08, g, 0.008); w.scale.set(0.1, 0.06, 0.03);
      M(GEO.ringPlane, MAT.ring, -0.04, -0.03, 0.115, g, 0).scale.setScalar(0.07);
      if (type === 'gduck') for (let i = 0; i < 3; i++) { const s = M(GEO.sparkle, MAT.white, rr(-0.2, 0.2), rr(0.05, 0.28), 0.1, g, 0); s.userData.spark = i; } }
    else if (type === 'can') { M(GEO.can, MAT.can, 0, 0, 0, g, 0.012, 0.115); M(GEO.canTop, MAT.canTop, 0, 0.14, 0, g, 0); }
    else if (type === 'star') { M(GEO.star, MAT.star, 0, 0, 0, g, 0.014); M(GEO.ringPlane, MAT.ring, 0, 0, 0.03, g, 0).scale.setScalar(0.085); }
    else if (type === 'bird') { M(GEO.bird, MAT.bird, 0, 0, 0, g, 0.012); M(GEO.eye, MAT.white, 0.15, 0.09, 0.03, g, 0).scale.setScalar(1.3); M(GEO.eye, MAT.ink, 0.155, 0.09, 0.045, g, 0); const bk = M(GEO.beak, MAT.beak, 0.27, 0.1, 0, g, 0.008); bk.rotation.z = -Math.PI / 2; bk.scale.setScalar(0.7);
      flap = new THREE.Group(); flap.position.set(-0.02, 0.06, 0.04); g.add(flap); M(GEO.wing, MAT.birdW, 0, 0, 0, flap, 0.01); }
    else if (type === 'bell') { M(GEO.rope, MAT.stick, 0, 0.8, 0, g, 0); M(GEO.bell, MAT.gold, 0, 0, 0, g, 0.014, 0.2); M(GEO.clap, MAT.ink, 0, -0.18, 0, g, 0); for (let i = 0; i < 3; i++) { const s = M(GEO.sparkle, MAT.white, rr(-0.25, 0.25), rr(-0.1, 0.25), 0.15, g, 0); s.userData.spark = i; } }
    else if (type === 'crow') { M(GEO.crow, MAT.crow, 0, 0, 0, g, 0.014); M(GEO.eye, MAT.white, 0.12, 0.17, 0.025, g, 0).scale.setScalar(1.4); const bk = M(GEO.beak, MAT.beak, 0.31, 0.18, 0, g, 0.008); bk.rotation.z = -Math.PI / 2; M(GEO.ringPlane, MAT.ring, -0.02, -0.06, 0.022, g, 0).scale.setScalar(0.12); }
    else if (type === 'fox') { const d = M(GEO.disc, MAT.foxRim, 0, 0, 0, g, 0.014, 0.25); d.scale.set(0.25, 1, 0.25); d.rotation.x = Math.PI / 2; M(GEO.ringPlane, MAT.fox, 0, 0, 0.017, g, 0).scale.setScalar(0.245); }
    return { g, flap };
  }

  // ---------------- the booth (unit meshes, placed and sized by layout() for any screen) ----------------
  const booth = new THREE.Group(); scene.add(booth);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshToonMaterial({ map: wallTex, gradientMap: grad })); booth.add(wall);
  const counter = M(new THREE.BoxGeometry(1, 1, 0.5), [toon(theme.wood), toon(theme.wood), toon(SP ? '#1a1d24' : '#5a3a22'), toon(theme.wood), new THREE.MeshToonMaterial({ map: woodTex, gradientMap: grad }), toon(theme.wood)], 0, 0, 0, booth, 0);
  const counterLip = M(new THREE.BoxGeometry(1, 1, 1), toon(theme.trim), 0, 0, 0, booth, 0);
  const rails = ROWS.map((row, i) => { const m = M(new THREE.BoxGeometry(1, 1, 1), i === 1 ? toon(SP ? '#3a3f4a' : '#d8c7a8') : toon(theme.wood), 0, 0, 0, booth, 0); const lip = M(new THREE.BoxGeometry(1, 1, 1), toon(i === 1 ? theme.a : theme.trim), 0, 0, 0, booth, 0); return { m, lip }; });
  const waveMat = new THREE.MeshBasicMaterial({ map: waveTex, transparent: true, alphaTest: 0.1 }), waveMat2 = waveMat.clone(); waveMat2.map = waveTex.clone(); waveMat2.map.needsUpdate = true; waveMat2.color = new THREE.Color('#bfe3ff');
  if (SP) for (const wm of [waveMat, waveMat2]) { wm.opacity = 0.5; wm.alphaTest = 0; wm.blending = THREE.AdditiveBlending; wm.depthWrite = false; }   /* s475 space: the duck pond becomes a glowing energy stream */
  const waves = [new THREE.Mesh(new THREE.PlaneGeometry(1, 1), waveMat2), new THREE.Mesh(new THREE.PlaneGeometry(1, 1), waveMat)]; waves.forEach(w => booth.add(w));
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.25), new THREE.MeshBasicMaterial({ map: signTex, transparent: true })); booth.add(sign);
  const awning = new THREE.Group(); booth.add(awning); const bulbOn = new THREE.MeshBasicMaterial({ color: 0xfff1a8 }), bulbOff = new THREE.MeshBasicMaterial({ color: 0x8a6a3a }); let bulbs = [];
  function buildAwning(width, h, y, z) { awning.clear(); bulbs = []; const n = Math.max(6, Math.ceil(width / (h * 0.9))), sw = width / n, ma = toon(theme.a), mb = toon(theme.b), half = new THREE.CircleGeometry(sw / 2, 14, Math.PI, Math.PI), box = new THREE.PlaneGeometry(sw, h);
    for (let i = 0; i < n; i++) { const x = -width / 2 + sw * (i + 0.5), m = i % 2 ? mb : ma; const b = new THREE.Mesh(box, m); b.position.set(x, y + h / 2, z); awning.add(b); const c = new THREE.Mesh(half, m); c.position.set(x, y, z); awning.add(c);
      const bl = new THREE.Mesh(new THREE.SphereGeometry(sw * 0.09, 8, 6), bulbOn); bl.position.set(x - sw / 2, y + 0.02, z + 0.04); awning.add(bl); bulbs.push(bl); }
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(width, h * 0.12), toon(theme.trim)); edge.position.set(0, y + h, z + 0.01); awning.add(edge); }
  // the booth keeper (a townsfox from fox-kit; DRAFT name in KEEPER)
  const keeper = kit.makeFox({ key: 'keeper', torso: [theme.a, theme.b, '#1a1626'], crest: '', outfit: 'vest', gear: 'none', mood: 'happy', look: { ...PLAYER_FEMALE, fur: '#e8873a', furDark: '#b5531c', tailTip: '#ffffff' }, eyes: ['#22c55e', '#22c55e'] });
  scene.add(keeper); const kb = new THREE.Box3().setFromObject(keeper), keeperH0 = Math.max(0.5, kb.max.y - kb.min.y), keeperY0 = kb.min.y; keeper.rotation.y = 0.35;
  // the cork rifle, held at the bottom of the screen; it swings to where you aim
  const rifle = new THREE.Group(), rifleKick = new THREE.Group(); rifle.add(rifleKick); (WD ? camRig : camera).add(rifle);
  if (SP) { const R = rifleKick, white = toon('#e8eef6'), dark = toon('#2a2e38'), cyan = new THREE.MeshBasicMaterial({ color: '#5fe3ff' });
    M(new THREE.BoxGeometry(0.1, 0.16, 0.22), dark, 0, -0.08, -0.06, R, 0.012); M(new THREE.BoxGeometry(0.13, 0.11, 0.5), white, 0, 0.03, 0.18, R, 0.012); M(new THREE.BoxGeometry(0.135, 0.02, 0.36), cyan, 0, 0.0, 0.2, R, 0);
    const em = M(new THREE.CylinderGeometry(0.045, 0.06, 0.16, 14), dark, 0, 0.03, 0.5, R, 0.008, 0.05); em.rotation.x = Math.PI / 2; for (let i = 0; i < 3; i++) { const r = M(new THREE.TorusGeometry(0.05, 0.008, 6, 16), cyan, 0, 0.03, 0.44 + i * 0.05, R, 0); void r; }
    M(new THREE.BoxGeometry(0.03, 0.05, 0.1), dark, 0, 0.11, 0.08, R, 0.006);
    const ck = M(new THREE.SphereGeometry(0.04, 12, 10), cyan, 0, 0.03, 0.6, R, 0); rifle.userData.cork = ck;
    const muz = new THREE.Object3D(); muz.position.set(0, 0.03, 0.62); R.add(muz); rifle.userData.muzzle = muz; }
  else { const R = rifleKick, wood = toon('#8a4a22'), steel = toon('#3a3f4a'), brass = toon('#e6b45a');
    M(new THREE.BoxGeometry(0.11, 0.13, 0.42), wood, 0, -0.03, -0.12, R, 0.012); M(new THREE.BoxGeometry(0.09, 0.09, 0.3), wood, 0, -0.01, 0.2, R, 0.01);
    const br = M(new THREE.CylinderGeometry(0.03, 0.034, 0.6, 12), steel, 0, 0.04, 0.48, R, 0.01, 0.03); br.rotation.x = Math.PI / 2;
    M(new THREE.BoxGeometry(0.02, 0.04, 0.02), brass, 0, 0.09, 0.74, R, 0.006); M(new THREE.TorusGeometry(0.034, 0.008, 6, 14), brass, 0, 0.04, 0.62, R, 0);
    const ck = M(new THREE.CylinderGeometry(0.026, 0.022, 0.05, 10), toon('#d9a066'), 0, 0.04, 0.8, R, 0.006, 0.026); ck.rotation.x = Math.PI / 2; rifle.userData.cork = ck;
    const muz = new THREE.Object3D(); muz.position.set(0, 0.04, 0.82); R.add(muz); rifle.userData.muzzle = muz; }
  rifle.scale.setScalar(0.55);

  // ---------------- screen-space layout: the rows sit at fixed fractions of the free screen area ----------------
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }, CY = 1.7, ZP = -3.1, COUNTER_F = 0.085, tanH = Math.tan((WD ? WD.camera.fov : 50) / 2 * Math.PI / 180);
  const L = { CZ: 6, d: 9, tS: 1, a: 1, nt: 1, nb: -1, xc: 0, xh: 1, pull: 0 };
  const yAt = (f, z) => CY + (L.nb + f * (L.nt - L.nb)) * tanH * (L.CZ - z);
  const yNdc = (n, z) => CY + n * tanH * (L.CZ - z);
  const xAt = (u, z) => (L.xc + u * L.xh) * tanH * L.a * (L.CZ - z);
  const halfW = z => tanH * L.a * (L.CZ - z), halfH = z => tanH * (L.CZ - z);
  const ART_Y = { duck: 0.42, gduck: 0.42, star: 0.42, bird: 0.42, fox: 0.42, can: 0.14, bell: 0, crow: 0.4 };
  function layout() {
    const W = CW(), H = CHh(); L.a = W / H; camera.aspect = L.a;
    L.nt = Math.min(1 - 2 * SAFE.top / H, 0.84); L.nb = -1 + 2 * SAFE.bottom / H; const nl = -1 + 2 * SAFE.left / W, nr = 1 - 2 * SAFE.right / W; L.xc = (nl + nr) / 2; L.xh = (nr - nl) / 2;
    const dH = 3.2 / (tanH * Math.max(0.3, L.nt - L.nb)), dW = 3.6 / (2 * tanH * L.a * Math.max(0.3, L.xh)); L.d = Math.max(dH, dW, 2.6); L.CZ = ZP + L.d;
    const gapW = 0.18 * (L.nt - L.nb) * tanH * L.d, useW = 2 * L.xh * tanH * L.a * L.d; L.tS = clamp(Math.min(gapW * 0.98 / 0.55, useW / 5.2 / 0.55), 0.55, 1.8);
    camera.position.set(0, CY, L.CZ); camera.lookAt(0, CY, -100); camera.updateProjectionMatrix();
    const zw = -4.3, ww = halfW(zw) * 2.3, wh = halfH(zw) * 2.3; wall.position.set(0, CY, zw); wall.scale.set(ww, wh, 1); wallTex.repeat.set(ww / 1.4, wh / 1.4);
    const zc = -1.4, ct = yAt(COUNTER_F, zc), cw = halfW(zc) * 2.4, chh = Math.max(0.3, ct - yNdc(-1.08, zc)); counter.position.set(0, ct - chh / 2, zc - 0.25); counter.scale.set(cw, chh, 1); woodTex.repeat.set(cw / 1.6, 1);
    counterLip.position.set(0, ct + 0.03 * L.tS, zc + 0.02); counterLip.scale.set(cw, 0.06 * L.tS, 0.12 * L.tS);
    ROWS.forEach((row, i) => { const y = yAt(row.f, row.z), w = halfW(row.z) * 2.4, top = i === 1 ? y - ART_Y.can * L.tS - 0.005 : y - 0.42 * L.tS + 0.02 * L.tS, h = 0.12 * L.tS;
      rails[i].m.position.set(0, top - h / 2, row.z + 0.08); rails[i].m.scale.set(w, h, 0.12 * L.tS); rails[i].lip.position.set(0, top - h + 0.012 * L.tS, row.z + 0.15 * L.tS); rails[i].lip.scale.set(w, 0.025 * L.tS, 0.02); row.y = y; });
    { const r = ROWS[0], y = r.y - 0.17 * L.tS, w = halfW(r.z) * 2.4; waves[1].position.set(0, y - 0.12 * L.tS, r.z + 0.14); waves[1].scale.set(w, 0.3 * L.tS, 1); waveTex.repeat.set(w / (0.9 * L.tS), 1);
      waves[0].position.set(0, y - 0.05 * L.tS, r.z - 0.12); waves[0].scale.set(w, 0.3 * L.tS, 1); waveMat2.map.repeat.set(w / (1.1 * L.tS), 1); rails[0].m.visible = rails[0].lip.visible = false; }
    { const za = -1.5, h = halfH(za) * 2 * 0.075, top = yNdc(1, za) - h * 0.15; buildAwning(halfW(za) * 2.2, h, top - h, za); }
    { const zs = -1.65, sw = Math.min(halfW(zs) * 2 * L.xh * 0.8, halfH(zs) * 2 * 0.14 * 4), y = yNdc(Math.min(L.nt, 0.82), zs) - sw * 0.125 - halfH(zs) * 0.03; sign.position.set(xAt(0, zs), y, zs); sign.scale.setScalar(sw); }
    const kh = Math.min(halfH(-1.9) * 2 * 0.34, L.tS * 1.6), ks = kh / keeperH0; keeper.scale.setScalar(ks); keeper.rotation.y = L.a > 1 ? -0.35 : 0.35; keeper.userData.home = { x: xAt(L.a > 1 ? 0.78 : -0.7, -1.9), y: yAt(COUNTER_F, -1.9) - kh * 0.38 - keeperY0 * ks, hide: kh * 0.8 };
    keeper.position.x = keeper.userData.home.x; keeper.position.z = -1.9;
    rifle.position.set(L.xc * tanH * L.a * 1.0, -tanH * 1.02, -1.0); rifle.scale.setScalar(L.a < 1 ? 0.3 : 0.36);
    rifle.userData.base = rifle.position.clone();
    if (!WD) { renderer.setSize(W, H, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%'; }
  }

  // ---------------- live targets (pooled by type) ----------------
  const pools = {}, live = new Map();
  function takeTarget(e) { const pool = pools[e.type] || (pools[e.type] = []); let o = pool.pop();
    if (!o) { const root = new THREE.Group(), pivot = new THREE.Group(); root.add(pivot); const art = buildArt(e.type); art.g.position.y = ART_Y[e.type]; pivot.add(art.g);
      let stick = null; if (e.type !== 'can' && e.type !== 'bell') { stick = new THREE.Mesh(GEO.stick, MAT.stick); stick.position.set(0, 0.16, -0.03); pivot.add(stick); }
      o = { root, pivot, art, stick, type: e.type }; }
    o.e = e; o.hitT = 0; o.by = null; o.root.visible = true; o.pivot.rotation.set(0, 0, 0); o.art.g.position.set(0, ART_Y[e.type], 0); o.art.g.rotation.set(0, 0, 0); o.root.rotation.set(0, 0, 0); scene.add(o.root); live.set(e.id, o); return o; }
  function dropTarget(o) { scene.remove(o.root); live.delete(o.e.id); (pools[o.type] || (pools[o.type] = [])).push(o); }
  function clearTargets() { [...live.values()].forEach(dropTarget); }

  // ---------------- effects: cork flights, puffs, floating score text, hit marker, desktop crosshair ----------------
  const corks = Array.from({ length: 8 }, () => { const m = SP ? new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: '#bff6ff' })) : new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.06, 8), toon('#d9a066')); m.visible = false; scene.add(m); return { m, t: 1, a: V3(), b: V3() }; }); let corkI = 0;
  const puffs = Array.from({ length: 24 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); return { s, life: 0, v: V3(), sz: 0.2 }; }); let puffI = 0;
  function puff(p, col = 0xffffff, n = 5, sz = 0.22) { for (let i = 0; i < n; i++) { const q = puffs[puffI = (puffI + 1) % puffs.length]; q.s.position.copy(p); q.s.material.color.set(col); q.life = 1; q.sz = sz * L.tS; q.v.set(rr(-0.8, 0.8), rr(-0.2, 1.0), rr(0, 0.6)).multiplyScalar(L.tS); } }
  const texts = Array.from({ length: 12 }, () => { const c = document.createElement('canvas'); c.width = 256; c.height = 96; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, depthWrite: false })); s.renderOrder = 50; s.visible = false; scene.add(s); return { c, t, s, life: 0 }; }); let textI = 0;
  function floatText(txt, col, p, big = false) { const q = texts[textI = (textI + 1) % texts.length], g = q.c.getContext('2d'); g.clearRect(0, 0, 256, 96); g.font = `900 ${big ? 54 : 48}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#1a1626'; g.strokeText(txt, 128, 50); g.fillStyle = col; g.fillText(txt, 128, 50); q.t.needsUpdate = true;
    q.s.position.copy(p); q.s.visible = true; q.life = 1; const k = (L.CZ - p.z) * tanH * 0.16 * (big ? 1.25 : 1) * clamp(1 / Math.max(L.a, 0.5), 0.8, 1.4); q.s.scale.set(k * 2.67, k, 1); q.k = k; }
  const marker = document.createElement('div'); marker.style.cssText = 'position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border:3px solid #ffd23a;border-radius:50%;box-sizing:border-box;pointer-events:none;opacity:0;transition:opacity .25s,transform .25s;z-index:2';
  const cross = document.createElement('div'); cross.style.cssText = 'position:absolute;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;pointer-events:none;display:none;z-index:2'; cross.innerHTML = '<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="11" fill="none" stroke="#1a1626" stroke-width="5"/><circle cx="17" cy="17" r="11" fill="none" stroke="#ffd23a" stroke-width="2.5"/><path d="M17 1v9M17 24v9M1 17h9M24 17h9" stroke="#1a1626" stroke-width="5"/><path d="M17 2v8M17 24v8M2 17h8M24 17h8" stroke="#ffd23a" stroke-width="2.5"/><circle cx="17" cy="17" r="2" fill="#ec3013"/></svg>';
  const ovEl = WD ? (wel.parentElement || document.body) : container; if (!WD && getComputedStyle(container).position === 'static') container.style.position = 'relative'; ovEl.appendChild(marker); ovEl.appendChild(cross);
  function showMarker(x, y, col) { marker.style.borderColor = col; marker.style.transition = 'none'; marker.style.opacity = '1'; marker.style.transform = `translate(${x}px,${y}px) scale(0.6)`; void marker.offsetWidth; marker.style.transition = 'opacity .3s,transform .3s'; marker.style.opacity = '0'; marker.style.transform = `translate(${x}px,${y}px) scale(1.2)`; }

  // ---------------- game state ----------------
  const st = { phase: 'intro', paused: false, flash: null, flashT: 0, say: pick(KP.lines.intro), assist: !!prefs.assist, muted: !!prefs.muted, net: null, pass: null, done: null, lastCount: 0, demo: false };
  let R = null, attract = null, aim = { x: CW() / 2, y: CHh() / 2, mouse: false };
  const me = () => (R && R.me) || 'me';
  function flash(txt, col = '#ffd23a', dur = 1.1) { st.flash = { txt, col }; st.flashT = dur; emit(true); }
  function newAttract() { const seed = (Math.random() * 1e9) >>> 0; attract = { sched: makeSchedule(seed, 'classic'), t0: performance.now() - 2500 }; }
  function newRound({ kind = 'solo', mode = 'classic', seed = (Math.random() * 1e9) >>> 0, startAt = null, players = null, me: myId = 'me' } = {}) {
    clearTargets(); const md = MODES[mode] || MODES.classic, slow = kind === 'solo' && st.assist ? 0.78 : 1;
    R = { kind, mode, md, seed, slow, sched: makeSchedule(seed, mode, slow), startPerf: startAt != null ? startAt : performance.now() + 3000, score: 0, streak: 0, bestStreak: 0, hits: 0, shots: 0, bulls: 0, foxHits: 0, bells: 0, gotBest: 0,
      ammo: md.ammo, reloadT: 0, over: false, ended: false, me: myId, players: players || [{ id: myId, name: 'YOU', col: COLORS[0][1] }], scores: {}, claimed: {}, pending: {}, lastTick: 99, lastCall: false, endAt: md.dur + (kind === 'online' ? 1.2 : 0) };
    R.players.forEach(p => R.scores[p.id] = 0); hitIdx = new Map(); st.phase = 'count'; st.lastCount = 99; st.done = null; st.paused = false; aimRifle(true); emit(true); }
  let hitIdx = new Map();
  const tNow = () => R ? (performance.now() - R.startPerf) / 1000 : 0;
  const pendingSum = () => R ? Object.values(R.pending).reduce((s, p) => s + p.pts, 0) : 0;
  const myScore = () => !R ? 0 : R.kind === 'online' ? (R.scores[R.me] || 0) + pendingSum() : R.score;

  // ---------------- shooting ----------------
  const _v = V3(), _w = V3();
  function screenOf(p) { _v.copy(p).project(camera); return { x: (_v.x + 1) / 2 * CW(), y: (1 - _v.y) / 2 * CHh(), z: _v.z }; }
  function artCentre(o, out) { o.art.g.getWorldPosition(out); if (o.type === 'can') out.y += 0.0; return out; }
  function findTarget(px, py) { const assist = st.assist, pad = (touch ? 12 : 6) + (assist ? 16 : 0), grow = assist ? 1.35 : 1.12; let best = null, bestK = 9;
    for (const o of live.values()) { if (o.hitT || !o.root.visible || o.hideT) continue; if (o.e.row === 4 && o.popK < 0.6) continue; artCentre(o, _w); const c = screenOf(_w); if (c.z > 1) continue;
      _w.y += 0.26 * L.tS; const r = Math.abs(screenOf(_w).y - c.y), d = Math.hypot(px - c.x, py - c.y), lim = r * grow + pad; if (d > lim) continue; const k = d / lim - (o.e.row === 4 ? 0.05 : 0) + o.e.row * 0.01; if (k < bestK) { bestK = k; best = { o, d, r, c }; } }
    return best; }
  function aimRifle(reset) { const rc = new THREE.Raycaster(), n = new THREE.Vector2(aim.x / CW() * 2 - 1, -(aim.y / CHh()) * 2 + 1); rc.setFromCamera(n, camera); const p = rc.ray.at(L.CZ - ZP, V3()); rifle.userData.aimW = p;
    const loc = camera.worldToLocal(p.clone()); rifle.userData.want = loc; if (reset) rifle.lookAt(p); }
  function shoot(px, py, auto) {
    if (!R || st.phase !== 'play' || st.paused || (R.demo && !auto)) return; const t = tNow(); if (t < 0 || t > R.md.dur) return; sfx.unlock();
    if (R.reloadT > 0) { sfx.empty(); return; } if (R.ammo <= 0) { startReload(); return; }
    aim.x = px; aim.y = py; aimRifle(true); R.ammo--; R.shots++; sfx.shot(); rifleKick.position.z = -0.12; rifleKick.rotation.x = -0.15; rifle.userData.cork.visible = false;
    const muzzle = rifle.userData.muzzle.getWorldPosition(V3()), hit = findTarget(px, py), ck = corks[corkI = (corkI + 1) % corks.length]; ck.a.copy(muzzle); ck.t = 0; ck.m.visible = true; ck.m.scale.setScalar(L.tS);
    if (hit) { artCentre(hit.o, ck.b); ck.b.z += 0.1; showMarker(hit.c.x, hit.c.y, '#ffd23a'); registerHit(hit.o, hit.d < hit.r * 0.34); }
    else { const rc = new THREE.Raycaster(); rc.setFromCamera(new THREE.Vector2(px / CW() * 2 - 1, -(py / CHh()) * 2 + 1), camera); ck.b.copy(rc.ray.at(L.CZ + 4.25, V3())); showMarker(px, py, '#ffffff');
      if (R.streak >= 5) flash('COMBO LOST', '#ff9a8a', 0.8); R.streak = 0; setTimeout(() => { puff(ck.b, SP ? 0x5fe3ff : 0xd9c7a8, 3, 0.15); sfx.miss(); }, 70); }
    if (R.ammo <= 0) setTimeout(() => { if (R && R.ammo <= 0 && !R.reloadT) startReload(); }, 160);
    emit(true); }
  function startReload() { if (!R || R.reloadT > 0 || R.ammo >= R.md.ammo) return; R.reloadT = R.md.reload; sfx.click(); emit(true); }
  function multFor(streak) { return 1 + Math.min(2, Math.floor(streak / 5)); }
  function registerHit(o, bull) { const e = o.e, def = TGT[e.type], t = tNow(); let pts;
    if (def.pts < 0) { pts = def.pts; R.foxHits++; if (R.streak >= 5) flash('COMBO LOST', '#ff9a8a', 0.8); R.streak = 0; }
    else { const m = multFor(R.streak); pts = def.pts * m + (bull ? 5 : 0); R.streak++; R.bestStreak = Math.max(R.bestStreak, R.streak); R.hits++; if (bull) R.bulls++; if (e.type === 'bell') R.bells++; if (multFor(R.streak) > m) flash('COMBO ×' + multFor(R.streak), '#ffd23a', 1.0); }
    knock(o, R.me, pts, bull);
    if (R.kind === 'online') { R.pending[e.id] = { pts, t: performance.now() }; netSend('ev', { k: 'hit', id: e.id, pts, mid: R.mid }); if (isHost()) resolveHit(e.id, R.me, pts); }
    else R.score = Math.max(0, R.score + pts); }
  function knock(o, by, pts, bull) { if (o.hitT) return; o.hitT = performance.now(); o.by = by; const e = o.e, pl = playerOf(by), col = by === R.me ? (pts < 0 ? '#ff6a5a' : bull ? '#ffffff' : '#ffd23a') : pl.col;
    const p = artCentre(o, V3()); p.z += 0.15; const pan = clamp(screenOf(p).x / CW() * 2 - 1, -1, 1);
    if (e.type === 'fox') { sfx.buzz(); puff(p, 0xff6a5a, 6); if (by === R.me) flash("THAT'S A FRIEND! " + pts, '#ff9a8a', 1.0); }
    else if (e.type === 'bell') { sfx.bell(); puff(p, 0xffd23a, 10, 0.3); if (by === R.me) flash('GOLD BELL! +' + pts, '#ffd23a', 1.2); }
    else if (e.type === 'can') { sfx.clank(pan); puff(p, 0xffffff, 4); } else { sfx.hit(pan); puff(p, e.type === 'gduck' ? 0xffd23a : 0xffffff, 5); }
    floatText((pts > 0 ? '+' : '') + pts + (bull && by === R.me ? ' ◎' : ''), col, p, e.type === 'bell' || e.type === 'gduck'); }
  const playerOf = id => (R && R.players.find(p => p.id === id)) || { id, name: '?', col: '#ffffff' };

  // ---------------- DEMO (scripted autopilot) ----------------
  function demoSchedule(sched) { const out = sched.filter(e => !(e.row === 4 && ((e.t0 > 16.4 && e.t0 < 21.6) || (e.t0 > 21.6 && e.t0 < 26.4))) && !(e.type === 'fox' && e.t0 > 12 && e.t0 < 22)); let id = 9000;
    out.push({ id: id++, row: 4, type: 'fox', t0: 18.4, u: 0, dur: 2.6, demoFox: true }, { id: id++, row: 4, type: 'crow', t0: 23.2, u: -0.45, dur: 2.2 }, { id: id++, row: 3, type: 'bell', t0: 22.6, dir: 1, spd: 0.62, bell: true }); return out; }
  function demoStart() { sfx.unlock(); st.pass = null; newRound({ kind: 'solo', mode: 'classic', seed: 20261007 }); R.demo = true; R.sched = demoSchedule(R.sched); R.nextShot = 0.5; R.demoFoxShot = false; st.demo = { cap: DEMO[0].cap, key: DEMO[0].key, n: 1, of: DEMO.length - 1 }; emit(true); }
  function demoStop() { st.demo = null; api.toIntro(); }
  function demoTick(t) { let i = 0; while (i + 1 < DEMO.length && t >= DEMO[i + 1].t) i++; const step = DEMO[i]; if (step.end) { demoStop(); return; }
    if (!st.demo || st.demo.n !== i + 1) { st.demo = { cap: step.cap, key: step.key, n: i + 1, of: DEMO.length - 1 }; dirty = true; }
    if (st.phase !== 'play' || t < R.nextShot || R.reloadT > 0 || R.ammo <= 0) return; R.nextShot = t + 0.62;
    const cands = []; for (const o of live.values()) { if (o.hitT || (o.e.row === 4 && (o.popK || 0) < 0.8)) continue; const c = screenOf(artCentre(o, V3())); if (c.x < SAFE.left + 30 || c.x > CW() - SAFE.right - 30 || c.y < SAFE.top + 20 || c.y > CHh() - SAFE.bottom - 20) continue; cands.push({ o, c }); }
    let pickT = null; if (step.fox && !R.demoFoxShot) { pickT = cands.find(x => x.o.e.demoFox); if (pickT) R.demoFoxShot = true; }
    if (!pickT) for (const ty of step.prefer || []) { pickT = cands.find(x => x.o.e.type === ty); if (pickT) break; }
    if (!pickT) pickT = cands.find(x => x.o.e.type !== 'fox'); if (!pickT) return; const j = Math.random() < 0.5 ? 0 : 9; shoot(pickT.c.x + rr(-j, j), pickT.c.y + rr(-j, j), true); }

  // ---------------- per-frame update ----------------
  function placeTargets(sched, t, now) {
    for (const e of sched) { const [a, b] = life(e); const on = t >= a - 0.05 && t <= b; let o = live.get(e.id);
      if (!on) { if (o && !o.hitT) dropTarget(o); continue; } if (!o) { if (hitIdx.has(e.id)) continue; o = takeTarget(e); } }
    for (const o of live.values()) { const e = o.e, row = e.row === 4 ? POP : ROWS[e.row], s = L.tS; o.root.scale.setScalar(s); const ph = e.id * 1.7;
      if (e.row === 4) { const k = t - e.t0, up = clamp(Math.min(k / 0.2, (e.dur - k) / 0.2), 0, 1); o.popK = up; const cy = yAt(POP.f, POP.z); o.root.position.set(xAt(e.u, POP.z), cy - ART_Y[e.type] * s - (1 - easeOut(up)) * 0.95 * s, POP.z); }
      else { const u = e.dir * (-U + e.spd * (t - e.t0)); const z = row.z + (e.type === 'bell' ? 0.25 : 0), y0 = row.y - ART_Y[e.type] * s; o.root.position.set(xAt(u, z), y0, z); o.art.g.scale.x = e.dir;
        if (e.type === 'duck' || e.type === 'gduck') { o.art.g.rotation.z = Math.sin(now * 0.004 + ph) * 0.08; o.art.g.position.y = ART_Y.duck + Math.sin(now * 0.005 + ph) * 0.02; }
        if (e.type === 'bird' && o.art.flap) o.art.flap.scale.y = 0.55 + 0.45 * Math.sin(now * 0.016 + ph);
        if (e.type === 'bell') { o.art.g.rotation.z = Math.sin(now * 0.004 + ph) * 0.22; o.art.g.position.y = Math.sin(now * 0.003) * 0.05; }
        if (e.type === 'star') o.art.g.rotation.z = Math.sin(now * 0.002 + ph) * 0.3; }
      o.art.g.children.forEach(c => { if (c.userData.spark != null) { c.rotation.y += 0.08; c.scale.setScalar(0.6 + 0.5 * Math.abs(Math.sin(now * 0.006 + c.userData.spark * 2))); } });
      if (o.hitT) { const k = (now - o.hitT) / 1000;
        if (o.type === 'can') { o.art.g.position.set(0, ART_Y.can + k * 1.2 - k * k * 6, -k * 1.4); o.art.g.rotation.x = -k * 12; }
        else if (o.type === 'bell') { o.art.g.rotation.y = k * 20; o.art.g.position.y = -k * k * 5; }
        else if (o.type === 'fox') { o.pivot.rotation.z = Math.sin(k * 50) * 0.2 * Math.max(0, 1 - k * 3); o.pivot.rotation.x = -easeOut(clamp((k - 0.2) / 0.25, 0, 1)) * 1.55; }
        else o.pivot.rotation.x = -easeOut(clamp(k / 0.25, 0, 1)) * 1.55;
        if (k > 0.6) { hitIdx.set(o.e.id, true); dropTarget(o); } } } }
  function draw() { if (!WD) { renderer.render(scene, camera); return; } camera.updateMatrixWorld(); camRig.position.copy(camera.position); camRig.quaternion.copy(camera.quaternion); scene.updateWorldMatrix(true, false); wcam.position.copy(camera.position); scene.localToWorld(wcam.position); scene.getWorldQuaternion(_wq); wcam.quaternion.copy(_wq).multiply(camera.quaternion); wcam.fov = camera.fov; wcam.aspect = camera.aspect; wcam.updateProjectionMatrix(); wcam.updateMatrixWorld(); }
  let last = performance.now(), raf = 0, emitT = 0, dirty = true, bulbT = 0, bulbStep = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (st.paused) { draw(); return; }
    if (st.flashT > 0) { st.flashT -= dt; if (st.flashT <= 0) { st.flash = null; dirty = true; } }
    const playing = R && (st.phase === 'count' || st.phase === 'play');
    if (playing) { const t = tNow();
      if (st.phase === 'count') { const c = Math.ceil(-t); if (c !== st.lastCount && c >= 1 && c <= 3) { st.lastCount = c; sfx.beep(false); dirty = true; } if (t >= 0) { st.phase = 'play'; sfx.beep(true); flash('FIRE!', '#ffd23a', 0.7); } }
      if (st.phase === 'play') { if (R.reloadT > 0) { R.reloadT -= dt; if (R.reloadT <= 0) { R.reloadT = 0; R.ammo = R.md.ammo; rifle.userData.cork.visible = true; sfx.click(); dirty = true; } }
        const left = R.md.dur - t; if (!R.lastCall && left <= 10 && left > 0) { R.lastCall = true; flash('LAST CALL · 10 S', '#ff9a8a', 1.2); }
        if (left <= 5 && left > 0 && Math.ceil(left) !== R.lastTick) { R.lastTick = Math.ceil(left); sfx.beep(false); }
        if (R.kind === 'online') netTickRound();
        if (t >= R.endAt && !R.ended) endRound(); }
      if (R && R.demo) demoTick(t); if (R) placeTargets(R.sched, t, now); dirty = true; }
    else if (attract && (st.phase === 'intro' || st.phase === 'lobby' || st.phase === 'done' || st.phase === 'pass')) { let t = (now - attract.t0) / 1000; if (t > 40) { clearTargets(); hitIdx = new Map(); newAttract(); t = 0; } placeTargets(attract.sched, t, now); }
    // keeper: up when you're not shooting, ducks down behind the counter while you are
    const kh = keeper.userData.home; if (kh) { const down = st.phase === 'play' || st.phase === 'count'; keeper.position.y = damp(keeper.position.y, kh.y - (down ? kh.hide : 0), 6, dt); keeper.position.x = kh.x; kit.animFox(keeper, dt, 0); }
    sign.material.opacity = damp(sign.material.opacity, st.phase === 'play' || st.phase === 'count' ? 0 : 1, 6, dt); sign.visible = sign.material.opacity > 0.02;
    // rifle swing + recoil
    if (rifle.userData.aimW) { const q0 = rifle.quaternion.clone(); rifle.lookAt(rifle.userData.aimW); const q1 = rifle.quaternion.clone(); rifle.quaternion.copy(q0).slerp(q1, 1 - Math.exp(-14 * dt)); }
    rifleKick.position.z = damp(rifleKick.position.z, 0, 14, dt); rifleKick.rotation.x = damp(rifleKick.rotation.x, R && R.reloadT > 0 ? 0.5 : 0, 12, dt);
    rifle.visible = st.phase === 'play' || st.phase === 'count';
    corks.forEach(c => { if (c.t >= 1) { c.m.visible = false; return; } c.t = Math.min(1, c.t + dt / 0.08); c.m.position.lerpVectors(c.a, c.b, c.t); c.m.lookAt(c.b); c.m.rotateX(Math.PI / 2); });
    puffs.forEach(p => { if (p.life <= 0) return; p.life -= dt * 2.2; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life) * 0.9; p.s.scale.setScalar(p.sz * (1.6 - p.life)); });
    texts.forEach(q => { if (q.life <= 0) return; q.life -= dt * 1.25; q.s.position.y += dt * q.k * 0.9; q.s.material.opacity = clamp(q.life * 2, 0, 1); if (q.life <= 0) q.s.visible = false; });
    waveTex.offset.x = (waveTex.offset.x + dt * 0.12) % 1; waveMat2.map.offset.x = (waveMat2.map.offset.x - dt * 0.08) % 1; waves.forEach((w, i) => { w.position.y += Math.sin(now * 0.002 + i * 2) * 0.0006; });
    bulbT += dt; if (bulbT > 0.22) { bulbT = 0; bulbStep++; bulbs.forEach((b, i) => b.material = (i + bulbStep) % 3 ? bulbOn : bulbOff); }
    sfx.tick(st.phase !== 'intro' || true);
    draw();
    if (dirty && now - emitT > 66) { emitT = now; dirty = false; emit(); } }

  // ---------------- end of a round: solo results, pass & play turns, online board ----------------
  function gradeOf(s) { return s >= PZ[2].at ? 'S' : s >= PZ[1].at ? 'A' : s >= PZ[0].at ? 'B' : 'C'; }
  function endRound() {
    if (R.demo) { demoStop(); return; }
    R.ended = true; const score = myScore(), acc = R.shots ? Math.round(R.hits / R.shots * 100) : 0;
    try { save.setStat(SK.rounds, save.stat(SK.rounds) + 1); save.setStat(SK.hits, save.stat(SK.hits) + R.hits); save.setStat(SK.shots, save.stat(SK.shots) + R.shots); if (R.bells) save.setStat(SK.bells, save.stat(SK.bells) + R.bells); } catch (e) {}
    const rows = [['Hits', R.hits + ' / ' + R.shots + (SP ? ' zaps' : ' corks')], ['Accuracy', acc + '%'], ['Bullseyes', String(R.bulls)], ['Best combo', R.bestStreak + ' in a row'], ['Gold bells', String(R.bells)], ['Fox cards hit', String(R.foxHits)]];
    if (R.kind === 'solo') {
      const newBest = save.best(SK.best(R.mode), score), best = save.stat(SK.best(R.mode)), gold = Math.min(50, Math.floor(score / 40)); if (gold) save.addGold(gold); save.addXp(10 + Math.floor(score / 100));
      const won = []; PZ.forEach(p => { if (score >= p.at && !save.flag(SK.prize(p.id))) { save.setFlag(SK.prize(p.id)); save.give(p.id, 1); won.push(p.name); } });
      const line = score >= PZ[1].at ? pick(KP.lines.good) : score >= PZ[0].at ? pick(KP.lines.ok) : pick(KP.lines.low); st.say = line;
      st.done = { kind: 'solo', kicker: R.md.name + ' · ' + (SP ? 'DEEP SPACE FOX · PHASER RANGE' : theme.label + ' SHOOTING GALLERY'), title: score >= PZ[1].at ? 'Sharpshooter!' : score >= PZ[0].at ? 'Nice shooting' : 'Round over', grade: gradeOf(score), total: score, best, newBest, gold, prizes: won, rows, line, mode: R.mode,
        next: PZ.find(p => score < p.at) || null };
      st.phase = 'done'; sfx.fanfare(); emit(true); return; }
    if (R.kind === 'pass') { const P = st.pass, pl = P.players[P.turn]; pl.score = score; pl.stats = { hits: R.hits, shots: R.shots, acc, bulls: R.bulls, combo: R.bestStreak }; P.turn++;
      if (P.turn < P.players.length) { st.phase = 'pass'; sfx.beep(true); emit(true); return; }
      const board = P.players.slice().sort((a, b) => b.score - a.score); board.forEach((p, i) => p.place = i + 1); const top = board[0], tie = board.length > 1 && board[1].score === top.score;
      st.done = { kind: 'pass', kicker: 'PASS & PLAY · ' + R.md.name, title: tie ? "It's a tie!" : top.name + ' wins!', grade: tie ? '=' : '1ST', winCol: top.col, total: top.score, board: board.map(p => ({ name: p.name, col: p.col, score: p.score, sub: p.stats.hits + ' hits · ' + p.stats.acc + '%' })), rows: [], mode: R.mode };
      st.phase = 'done'; sfx.fanfare(); emit(true); return; }
    // online
    const board = R.players.map(p => ({ id: p.id, name: p.name, col: p.col, score: R.scores[p.id] || 0, me: p.id === R.me, gone: !!p.gone })).sort((a, b) => b.score - a.score), mine = board.findIndex(b => b.me), won = mine === 0 && (board.length < 2 || board[1].score < board[0].score);
    const gold = Math.min(30, Math.floor((R.scores[R.me] || 0) / 60)) + (won ? 10 : 0); if (gold) save.addGold(gold); save.addXp(10); if (won) save.setStat(SK.wins, save.stat(SK.wins) + 1);
    st.done = { kind: 'online', kicker: 'ONLINE · ' + R.md.name + ' · ROOM ' + (st.net ? st.net.code : ''), title: won ? 'You win!' : board[0] ? board[0].name + ' wins' : 'Round over', grade: ['1ST', '2ND', '3RD', '4TH', '5TH'][mine] || '–', won, total: R.scores[R.me] || 0, gold,
      board: board.map(b => ({ name: b.name + (b.me ? ' · YOU' : '') + (b.gone ? ' · LEFT' : ''), col: b.col, score: b.score, sub: '' })), rows, mode: R.mode };
    st.phase = 'done'; sfx.fanfare(); if (st.net) { st.net.st = 'room'; st.net.ready = false; netSend('ev', { k: 'playing', on: false }); } emit(true); }

  // ---------------- ONLINE: up to 5, through engine/duel-net.js (same contract as the Skate Park). Fallback: BroadcastChannel (two tabs) ----------------
  function localDuel({ game, code, onJoin, onLeave, onMsg, onStatus }) {
    const id = Math.random().toString(36).slice(2, 8), known = new Set(); let bc; try { bc = new BroadcastChannel('8g-' + game + '-' + code); } catch (e) { onStatus && onStatus('offline'); return { id, send() {}, leave() {} }; }
    bc.onmessage = ({ data: m }) => { if (!m || m.from === id || (m.to && m.to !== id)) return; if (m.t === '__bye') { if (known.delete(m.from)) onLeave(m.from); return; }
      if (!known.has(m.from)) { known.add(m.from); bc.postMessage({ from: id, to: m.from, t: '__hi' }); onJoin(m.from); } if (m.t === '__hi') return; onMsg(m.t, m.d, m.from); };
    bc.postMessage({ from: id, t: '__hi' }); setTimeout(() => onStatus && onStatus('local'), 0);
    return { id, send(t, d, to) { try { bc.postMessage({ from: id, to, t, d }); } catch (e) {} }, leave() { try { bc.postMessage({ from: id, t: '__bye' }); bc.close(); } catch (e) {} } };
  }
  let NET = null, netTok = 0, netTimer = 0, lastSeen = {}, matchIds = null, mid = 0;
  const netSend = (t, d, to) => { if (NET) NET.send(t, d, to); };
  function members() { const n = st.net; if (!n || !NET) return []; const all = [{ id: NET.id, j: n.j, ready: n.ready, playing: n.st === 'play', me: true }, ...Object.entries(n.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAX_PLAYERS); }
  const inRoom = () => members().some(m => m.me);
  function hostId(match = true) { let m = members(); if (match && matchIds) m = m.filter(x => matchIds.includes(x.id)); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : NET ? NET.id : null; }
  const isHost = () => !!NET && hostId(true) === NET.id;
  function playerList(ids) { const s = ids.slice().sort(); return s.map((id, slot) => ({ id, slot, col: COLORS[slot][1], name: COLORS[slot][0] })); }
  function netOpen() { st.net = { st: 'menu', code: '', peers: {}, ready: false, j: 0, status: '', msg: '', mode: 'classic', modeSet: false, ping: null }; st.phase = 'lobby'; emit(true); }
  async function netJoin(code) { code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { if (st.net) { st.net.msg = 'Type the 4-letter room code from your friend.'; emit(true); } return; }
    netLeave(); if (!st.net) netOpen(); lastSeen = {}; Object.assign(st.net, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', ping: null }); st.phase = 'lobby'; emit(true);
    const tok = ++netTok, opts = { game: 'shootingGallery', code, onJoin: id => nHello(id), onLeave: id => nGone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => { if (st.net) { st.net.status = s; emit(true); } } };
    let N; try { const mod = await import(new URL('../../engine/duel-net.js', import.meta.url).href); N = await mod.connectDuel(opts); } catch (e) { N = localDuel(opts); }
    if (tok !== netTok) { N.leave(); return; } NET = N; nHello(); emit(true);
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(netTimer); netTimer = setInterval(nTick, 1000); }
  function netLeave() { netTok++; clearInterval(netTimer); if (NET) { NET.send('ev', { k: 'bye' }); NET.leave(); } NET = null; matchIds = null; lastSeen = {};
    if (R && R.kind === 'online' && !R.ended) { R = null; clearTargets(); } try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} }
  function nHello(to) { const n = st.net; if (!NET || !n) return; NET.send('hi', { v: 1, j: n.j, ready: n.ready, mode: n.mode, playing: n.st === 'play' }, to); }
  function peerSet(id, p) { const n = st.net; if (!n) return; n.peers[id] = { ...(n.peers[id] || {}), ...p }; dirty = true; }
  function nMsg(t, d, id) { const n = st.net; if (!n || !NET || !d) return; const now = performance.now(), known = !!lastSeen[id];
    if (t === 'hi') { lastSeen[id] = now; peerSet(id, { j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }); if (!n.modeSet && d.mode && +d.j < n.j) n.mode = MODES[d.mode] ? d.mode : 'classic'; if (!known) setTimeout(() => nHello(id), 0); setTimeout(nMaybeStart, 0); emit(true); return; }
    if (!known) return; lastSeen[id] = now;
    if (t === 'pg') { if (d.t != null) NET.send('pg', { e: d.t }, id); else if (d.e != null) { n.ping = Math.max(1, Math.round(now - d.e)); dirty = true; } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { peerSet(id, { ready: !!d.on }); setTimeout(nMaybeStart, 0); }
    else if (d.k === 'mode') { n.mode = MODES[d.m] ? d.m : 'classic'; n.modeSet = true; n.ready = false; Object.values(n.peers).forEach(p => p.ready = false); }
    else if (d.k === 'start') nStart(d);
    else if (d.k === 'playing') peerSet(id, { playing: !!d.on });
    else if (d.k === 'bye') nGone(id);
    else if (R && R.kind === 'online' && d.mid === R.mid && matchIds && matchIds.includes(id)) {
      if (d.k === 'hit' && isHost()) resolveHit(d.id, id, +d.pts || 0);
      else if (d.k === 'own') applyOwn(d.id, d.by, +d.pts || 0); }
    emit(true); }
  function nGone(id) { if (!lastSeen[id]) return; delete lastSeen[id]; if (st.net) delete st.net.peers[id]; if (R && R.kind === 'online') { const p = R.players.find(q => q.id === id); if (p && !p.gone) { p.gone = true; flash(p.name + ' LEFT', '#cfcac4', 1); } } emit(true); }
  function nTick() { if (!NET) return; NET.send('pg', { t: performance.now() }); if (Math.random() < 0.25) nHello(); const now = performance.now(); for (const id of Object.keys(lastSeen)) if (now - lastSeen[id] > 25000) nGone(id); }
  function nMaybeStart() { const n = st.net; if (!n || !NET || n.st !== 'room' || !inRoom() || hostId(false) !== NET.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    mid++; const d = { k: 'start', t0: Date.now() + 3500, mode: n.mode, ids: m.map(x => x.id), mid: NET.id + ':' + mid, seed: (Math.random() * 1e9) >>> 0 }; NET.send('ev', d); nStart(d); }
  function nStart(d) { const n = st.net; if (!n || !NET || !Array.isArray(d.ids)) return; if (!d.ids.includes(NET.id)) { n.msg = 'A round started without you. You join the next one.'; emit(true); return; }
    matchIds = d.ids.slice(); let t0 = +d.t0; const w = t0 - Date.now(); if (!(w >= 0 && w <= 6000)) t0 = Date.now() + 3000;
    n.st = 'play'; n.ready = false; n.msg = ''; Object.entries(n.peers).forEach(([k, p]) => { p.ready = false; p.playing = d.ids.includes(k); });
    newRound({ kind: 'online', mode: MODES[d.mode] ? d.mode : 'classic', seed: +d.seed || 1, startAt: performance.now() + (t0 - Date.now()), players: playerList(d.ids), me: NET.id }); R.mid = d.mid; }
  function resolveHit(id, by, pts) { if (!R || R.claimed[id]) return; netSend('ev', { k: 'own', id, by, pts, mid: R.mid }); applyOwn(id, by, pts); }
  function applyOwn(id, by, pts) { if (!R || R.claimed[id]) return; R.claimed[id] = by; R.scores[by] = (R.scores[by] || 0) + pts;
    if (by === R.me) { delete R.pending[id]; return; }
    if (R.pending[id]) { delete R.pending[id]; flash(playerOf(by).name + ' GOT IT FIRST', playerOf(by).col, 0.9); const o = live.get(id); if (o) o.by = by; return; }
    const o = live.get(id); if (o && !o.hitT) knock(o, by, pts, false); else if (!o) hitIdx.set(id, true); }
  function netTickRound() { const now = performance.now(); for (const [id, p] of Object.entries(R.pending)) if (now - p.t > 1500) { p.t = now; netSend('ev', { k: 'hit', id: +id, pts: p.pts, mid: R.mid }); if (isHost()) resolveHit(+id, R.me, p.pts); } }
  function netReady() { const n = st.net; if (!n || !NET) return; n.ready = !n.ready; NET.send('ev', { k: 'ready', on: n.ready }); setTimeout(nMaybeStart, 0); emit(true); }
  function netMode(m) { const n = st.net; if (!n || n.mode === m || !MODES[m]) return; n.mode = m; n.modeSet = true; n.ready = false; Object.values(n.peers).forEach(p => p.ready = false); netSend('ev', { k: 'mode', m }); emit(true); }

  // ---------------- input ----------------
  const cv = renderer.domElement;
  const onDown = e => { sfx.unlock(); const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; aim.mouse = e.pointerType === 'mouse'; if (st.phase === 'play') { e.preventDefault(); shoot(x, y); } };
  const onMove = e => { if (e.pointerType !== 'mouse') return; const r = cv.getBoundingClientRect(); aim.x = e.clientX - r.left; aim.y = e.clientY - r.top; aim.mouse = true; cross.style.display = st.phase === 'play' && !st.paused ? 'block' : 'none'; cross.style.transform = `translate(${aim.x}px,${aim.y}px)`; if (R && st.phase === 'play') aimRifle(false); };
  const onLeave = () => { cross.style.display = 'none'; };
  const onKey = e => { if (/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; if (st.phase === 'play') { if (e.code === 'KeyR') { startReload(); e.preventDefault(); } else if (e.code === 'Space' || e.code === 'Enter') { shoot(aim.x, aim.y); e.preventDefault(); } else if (e.code === 'Escape' || e.code === 'KeyP') { togglePause(); e.preventDefault(); } } else if (st.paused && (e.code === 'Escape' || e.code === 'KeyP')) togglePause(); };
  const onVis = () => { if (document.hidden && R && st.phase === 'play' && R.kind !== 'online' && !st.paused) togglePause(); };
  const onDownW = e => { if (e.target !== cv) return; e.stopImmediatePropagation(); onDown(e); e.preventDefault(); };   /* world: taps on the map canvas are the game's */
  if (WD) { addEventListener('pointerdown', onDownW, true); addEventListener('resize', layout); } else cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave); addEventListener('keydown', onKey); document.addEventListener('visibilitychange', onVis);
  cv.addEventListener('contextmenu', e => e.preventDefault());
  let pausedAt = 0; function togglePause() { if (!R || (st.phase !== 'play' && st.phase !== 'count') || R.kind === 'online' || R.demo) return; if (!st.paused) { st.paused = true; pausedAt = performance.now(); } else { st.paused = false; R.startPerf += performance.now() - pausedAt; last = performance.now(); } cross.style.display = 'none'; emit(true); }
  const ro = new ResizeObserver(() => layout()); if (!WD) ro.observe(container);

  // ---------------- state for the DC page ----------------
  function emit(now) { if (!now) { onState(hud()); return; } dirty = false; emitT = performance.now(); onState(hud()); }
  function hud() {
    const t = R ? tNow() : 0, md = R ? R.md : MODES.classic, n = st.net, m = n ? members() : [], hostNow = n && NET ? hostId(false) : null;
    const board = !R ? [] : R.kind === 'online' ? R.players.map(p => ({ name: p.name, col: p.col, score: (R.scores[p.id] || 0) + (p.id === R.me ? pendingSum() : 0), me: p.id === R.me, gone: !!p.gone })) : R.kind === 'pass' && st.pass ? st.pass.players.map((p, i) => ({ name: p.name, col: p.col, score: i === st.pass.turn ? myScore() : p.score, me: i === st.pass.turn, gone: false })) : [];
    const pl = R && R.kind === 'pass' && st.pass ? st.pass.players[Math.min(st.pass.turn, st.pass.players.length - 1)] : R && R.kind === 'online' ? playerOf(R.me) : null;
    return {
      phase: st.phase, paused: st.paused, kind: R ? R.kind : null, mode: R ? R.mode : null, modeName: md.name, theme: theme.label, world: worldKey,
      time: Math.max(0, md.dur - Math.max(0, t)), dur: md.dur, count: st.phase === 'count' ? Math.max(1, Math.ceil(-t)) : null,
      score: myScore(), streak: R ? R.streak : 0, mult: R ? multFor(R.streak) : 1, ammo: R ? R.ammo : 8, ammoMax: md.ammo, reloading: R && R.reloadT > 0 ? 1 - R.reloadT / md.reload : 0,
      flash: st.flash, say: st.say, keeper: KP, space: SP, game: SP ? 'PHASER RANGE' : 'SHOOTING GALLERY', ammoWord: SP ? 'CHARGES' : 'CORKS', ammoCol: SP ? '#5fe3ff' : '#d9a066', player: pl ? { name: pl.name, col: pl.col } : null, board,
      pass: st.pass ? { n: st.pass.players.length, turn: st.pass.turn, next: st.pass.players[st.pass.turn] || null, players: st.pass.players.map(p => ({ name: p.name, col: p.col, score: p.score })) } : null,
      done: st.done, demo: R && R.demo ? st.demo : null, assist: st.assist, muted: st.muted, gold: save.data.gold,
      bests: { classic: save.stat(SK.best('classic')), rapid: save.stat(SK.best('rapid')) }, prizes: PZ.map(p => ({ ...p, got: save.flag(SK.prize(p.id)) })),
      net: n ? { st: n.st, code: n.code, status: n.status, msg: n.msg, mode: n.mode, ping: n.ping, ready: n.ready, connected: !!NET,
        full: !!NET && n.st !== 'menu' && m.length === MAX_PLAYERS && !m.some(x => x.me),
        members: playerList(m.map(x => x.id)).map(p => { const x = m.find(q => q.id === p.id) || {}; return { name: p.name, col: p.col, me: !!x.me, ready: !!x.ready, host: p.id === hostNow, playing: !!x.playing && !x.me }; }) } : null };
  }

  // ---------------- boot ----------------
  layout(); newAttract(); requestAnimationFrame(t => { last = t; frame(t); }); emit(true);
  const api = {
    hud,
    start(mode = 'classic') { sfx.unlock(); st.pass = null; newRound({ kind: 'solo', mode }); },
    startPass(nPlayers = 2, mode = 'classic') { sfx.unlock(); const k = clamp(nPlayers | 0, 2, MAX_PLAYERS), seed = (Math.random() * 1e9) >>> 0; st.pass = { mode, seed, turn: 0, players: COLORS.slice(0, k).map(([name, col]) => ({ name, col, score: 0 })) }; st.phase = 'pass'; emit(true); },
    nextTurn() { const P = st.pass; if (!P || P.turn >= P.players.length) return; sfx.unlock(); const p = P.players[P.turn]; newRound({ kind: 'pass', mode: P.mode, seed: P.seed, players: [{ id: 'me', name: p.name, col: p.col }] }); },
    again() { if (!st.done) return; if (st.done.kind === 'pass' && st.pass) return api.startPass(st.pass.players.length, st.pass.mode); if (st.done.kind === 'online') return netReady(); api.start(st.done.mode || 'classic'); },
    reload: startReload, pause: togglePause, shootAt: (x, y) => shoot(x, y), demoStart, demoStop,
    toIntro() { if (R && R.kind === 'online') { netLeave(); st.net = null; } R = null; st.demo = null; st.pass = null; st.done = null; st.paused = false; st.phase = 'intro'; st.say = pick(KP.lines.intro); clearTargets(); hitIdx = new Map(); newAttract(); emit(true); },
    setAssist(on) { st.assist = !!on; prefs.assist = st.assist; savePrefs(prefs); emit(true); },
    toggleMute() { st.muted = !st.muted; sfx.muted = st.muted; prefs.muted = st.muted; savePrefs(prefs); if (!st.muted) sfx.unlock(); emit(true); },
    setSafe(top, bottom, left = 0, right = 0) { const ch = Math.abs(SAFE.top - top) > 2 || Math.abs(SAFE.bottom - bottom) > 2 || Math.abs(SAFE.left - left) > 2 || Math.abs(SAFE.right - right) > 2; if (ch) { Object.assign(SAFE, { top, bottom, left, right }); layout(); } },
    netOpen, netJoin, netReady, netMode,
    netCreate() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; return netJoin(k); },
    netLobby() { if (st.net) { st.phase = 'lobby'; emit(true); } },
    netLeave() { netLeave(); st.net = null; api.toIntro(); },
    netBack() { const n = st.net; if (!n) return api.toIntro(); if (n.st === 'menu') { st.net = null; return api.toIntro(); } netLeave(); n.st = 'menu'; n.code = ''; n.peers = {}; n.msg = ''; emit(true); },
    debug: () => ({ L: { ...L }, safe: { ...SAFE }, keeper: { ...keeper.userData.home, at: keeper.position.toArray(), s: keeper.scale.x, h0: keeperH0, y0: keeperY0 } }),
    skip(sec = 5) { if (R) R.startPerf -= sec * 1000; }, // test hook: jump the round clock forward
    // test hook: aim at the best live target (used by the demo/bot in testing)
    autoShot() { if (!R || st.phase !== 'play') return false; let best = null; for (const o of live.values()) { if (o.hitT || o.e.type === 'fox' || (o.e.row === 4 && o.popK < 0.6)) continue; const c = screenOf(artCentre(o, V3())); if (c.x < SAFE.left + 10 || c.x > CW() - SAFE.right - 10 || c.y < SAFE.top || c.y > CHh() - SAFE.bottom) continue; if (!best || TGT[o.e.type].pts > TGT[best.o.e.type].pts) best = { o, c }; } if (!best) return false; shoot(best.c.x, best.c.y); return true; },
    destroy() { cancelAnimationFrame(raf); netLeave(); ro.disconnect(); cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave); removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onVis);
      try { sfx.ctx && sfx.ctx.close(); } catch (e) {} if (WD) { removeEventListener('pointerdown', onDownW, true); removeEventListener('resize', layout); if (scene.parent) scene.parent.remove(scene); [marker, cross].forEach(el => el.remove()); } else { renderer.dispose(); [cv, marker, cross].forEach(el => el.remove()); } },
    world: !!WD, key: e => onKey(e), snapCam() { layout(); draw(); }, get camera() { return wcam || camera; },
  };
  return api;
}
