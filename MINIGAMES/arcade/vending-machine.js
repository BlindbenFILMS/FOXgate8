// 8 GATES — ARCADE · SNACK STOP VENDING MACHINE [arcadeVend]
// A vending machine that fits any building on any world. Pick a snack with the buttons, pay in gold, watch the spiral
// turn and the snack drop, then your fox (Ben, Hope or Noble from engine/cast.js) walks up, reaches into the tray,
// holds it up and puts it in the bag (or eats it right there). Sometimes a snack gets STUCK (tap SHAKE),
// sometimes you get a BONUS SNACK. Snacks: HEALTH BAR · ENERGY DRINK · CHOCOLATE BAR · APPLE · CHIPS.
// MERGE: createVendingMachine({ container, onState, opts }) stands alone. Only imports kit files. Helpers and the synth
// engine are copied from minigames/arcade/claw-crane.js (not imported, so the two games never depend on each other).
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex } from '../../engine/textures.js';
import { save } from '../../engine/save.js';

export const VEND = { key: 'arcadeVend', name: 'SNACK STOP', room: 'arcadeVend', perSpiral: 4, stuckChance: 0.07, bonusChance: 0.06 };   // chances DRAFT for Ben
// prices + effects DRAFT for Ben (no 2D source). Effects are for the world to apply when the item is used from the bag.
export const SNACKS = [
  { id: 'healthBar', code: 'A', name: 'HEALTH BAR', price: 4, effect: '+25 HEALTH', line: 'Oats, honey and nuts. Keeps a fox going.', col: '#22c55e', kind: 'bar', verb: 'EAT', hh: 0.075 },
  { id: 'energyDrink', code: 'B', name: 'ENERGY DRINK', price: 5, effect: '+40 ENERGY', line: 'Fizzy, blue and a little bit loud.', col: '#38bdf8', kind: 'can', verb: 'DRINK', hh: 0.06 },
  { id: 'chocolateBar', code: 'C', name: 'CHOCOLATE BAR', price: 3, effect: '+10 HEALTH · HAPPY', line: 'Milk chocolate wrapped in gold foil.', col: '#c08040', kind: 'choc', verb: 'EAT', hh: 0.075 },
  { id: 'apple', code: 'D', name: 'APPLE', price: 2, effect: '+15 HEALTH', line: 'Crunchy and red. The healthy pick.', col: '#ec3013', kind: 'apple', verb: 'EAT', hh: 0.045 },
  { id: 'chips', code: 'E', name: 'CHIPS', price: 3, effect: '+10 HEALTH', line: 'Salty potato chips in a crinkly bag.', col: '#ffd23a', kind: 'chips', verb: 'EAT', hh: 0.08 },
];
export const itemId = id => VEND.key + '.' + id;   // save item ids: arcadeVend.<snackId>
export const ITEM_LABELS = Object.fromEntries(SNACKS.map(s => [itemId(s.id), s.name]));
export const ITEM_EFFECTS = Object.fromEntries(SNACKS.map(s => [itemId(s.id), s.effect]));
const SN = Object.fromEntries(SNACKS.map(s => [s.id, s]));

// ---------- small helpers (copied from claw-crane.js) ----------
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

// ---------- SNACK MODELS (one merged mesh each; standing upright, ~0.16 tall) ----------
function snackGeo(s) {
  const P = [];
  if (s.kind === 'bar') P.push(B(0.11, 0.14, 0.026, '#1f8f4a', [0, 0, 0]), B(0.104, 0.05, 0.029, '#f4f1e6', [0, 0.012, 0]), S(0.012, '#22c55e', [-0.025, 0.012, 0.016], [1.7, 0.8, 0.3], [0, 0, 0.5]), B(0.06, 0.008, 0.03, '#1f8f4a', [0.015, 0.02, 0]), B(0.05, 0.006, 0.03, '#1f8f4a', [0.015, 0.004, 0]),
    B(0.11, 0.009, 0.029, '#ffd23a', [0, -0.035, 0]), B(0.114, 0.014, 0.022, '#7ee2a0', [0, 0.075, 0]), B(0.114, 0.014, 0.022, '#7ee2a0', [0, -0.075, 0]));
  else if (s.kind === 'can') P.push(Cy(0.034, 0.112, '#1e6fe0', [0, 0, 0]), Cy(0.031, 0.01, '#cfd8e3', [0, 0.06, 0]), Cy(0.031, 0.01, '#cfd8e3', [0, -0.06, 0]), Cy(0.0345, 0.026, '#0b2a5a', [0, 0.025, 0]),
    B(0.012, 0.04, 0.006, '#ffd23a', [0.006, -0.008, 0.033], [0, 0, 0.45]), B(0.012, 0.04, 0.006, '#ffd23a', [-0.004, -0.03, 0.033], [0, 0, 0.45]), B(0.014, 0.003, 0.02, '#e7edf4', [0, 0.066, 0.006]), Cy(0.0345, 0.006, '#7dd3fc', [0, -0.05, 0]));
  else if (s.kind === 'choc') P.push(B(0.12, 0.14, 0.022, '#5a2e17', [0, 0, 0]), B(0.122, 0.028, 0.025, '#e6b45a', [0, 0.04, 0]), B(0.092, 0.046, 0.025, '#c42d3c', [0, -0.012, 0]), B(0.06, 0.008, 0.026, '#f4f1e6', [0, -0.012, 0]),
    B(0.124, 0.012, 0.02, '#8a4a22', [0, 0.074, 0]), B(0.124, 0.012, 0.02, '#8a4a22', [0, -0.074, 0]), B(0.012, 0.012, 0.026, '#ffe9a8', [-0.04, 0.04, 0], [0, 0, 0.8]));
  else if (s.kind === 'apple') P.push(S(0.047, '#d62a1e', [0, 0, 0], [1, 0.92, 1]), S(0.022, '#b81c12', [0, -0.03, 0], [1.4, 0.6, 1.4]), S(0.013, '#ff8a7a', [-0.02, 0.02, 0.035]), Cy(0.004, 0.03, '#5a3018', [0.002, 0.05, 0], [0, 0, 0.15]),
    S(0.016, '#3fa34d', [0.016, 0.055, 0], [1.5, 0.3, 0.75], [0, 0, -0.5]));
  else if (s.kind === 'chips') P.push(S(0.07, '#ffd23a', [0, 0, 0], [0.82, 1.08, 0.34]), B(0.112, 0.014, 0.03, '#ff9a1a', [0, 0.075, 0]), B(0.112, 0.014, 0.03, '#ff9a1a', [0, -0.075, 0]), S(0.03, '#ec3013', [0, 0.008, 0.019], [1.45, 0.95, 0.3]),
    S(0.012, '#f6c25a', [0.018, -0.03, 0.022], [1.3, 1, 0.3]), S(0.01, '#e8a838', [-0.012, -0.036, 0.021], [1.2, 1, 0.3]), B(0.05, 0.007, 0.03, '#ffffff', [0, 0.01, 0.02]));
  return merge(P);
}

// ---------- music + synth (engine copied from claw-crane.js; one easy-listening shop tune) ----------
const MUSIC = {
  shop: { bpm: 96, swing: 0.16, chords: [[48, 'maj'], [45, 'min'], [50, 'min'], [43, 'maj']],
    lead: [76, 0, 79, 0, 81, 79, 76, 0, 72, 0, 74, 76, 0, 0, 0, 0, 77, 0, 76, 74, 72, 0, 74, 0, 71, 0, 72, 74, 0, 0, 0, 0], hat: 0.5, kick: [0, 8, 10], snare: [4, 12], arp: 0.022, leadV: 0.032 },
};
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function ShopAudio() {
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
    select() { const t = ctx.currentTime; osc('square', 880, t, 0.06, 0.07, { lp: 3000 }); osc('square', 1320, t + 0.05, 0.08, 0.06, { lp: 3000 }); },
    coin() { const t = ctx.currentTime; [2637, 3520].forEach((f, i) => { osc('sine', f, t + i * 0.07, 0.3, 0.14, { send: 0.3 }); osc('sine', f * 2.76, t + i * 0.07, 0.1, 0.04); }); [0.22, 0.3, 0.36].forEach((d, i) => noise(t + d, 0.05, 0.14 - i * 0.03, { f: 2400, q: 4 })); },
    paid() { const t = ctx.currentTime; [660, 990].forEach((f, i) => osc('square', f, t + i * 0.08, 0.1, 0.07, { lp: 3000 })); },
    nope() { const t = ctx.currentTime; osc('square', 220, t, 0.18, 0.09, { lp: 1200 }); osc('square', 180, t + 0.12, 0.25, 0.09, { lp: 1000 }); },
    clunk() { const t = ctx.currentTime; osc('sine', 90, t, 0.18, 0.4, { f2: 50 }); noise(t, 0.08, 0.25, { type: 'lowpass', f: 600 }); },
    thud(kind) { const t = ctx.currentTime;
      if (kind === 'can') { [0, 0.09, 0.15].forEach((d, i) => { osc('triangle', 1800 - i * 200, t + d, 0.18, 0.12 - i * 0.03, { send: 0.3 }); osc('triangle', 2650 - i * 250, t + d, 0.12, 0.06 - i * 0.015); noise(t + d, 0.04, 0.15 - i * 0.04, { f: 4000, q: 3 }); }); }
      else if (kind === 'apple') { osc('sine', 140, t, 0.16, 0.45, { f2: 70 }); noise(t, 0.06, 0.15, { type: 'lowpass', f: 500 }); osc('sine', 120, t + 0.14, 0.1, 0.18, { f2: 70 }); }
      else if (kind === 'chips') { for (let i = 0; i < 6; i++) noise(t + i * 0.025 + Math.random() * 0.015, 0.04, 0.14, { f: 3000 + Math.random() * 2500, q: 3 }); osc('sine', 110, t, 0.1, 0.18, { f2: 70 }); }
      else { osc('sine', 160, t, 0.12, 0.35, { f2: 80 }); noise(t, 0.05, 0.2, { f: 1400, q: 2 }); } },
    flap() { const t = ctx.currentTime; osc('square', 420, t, 0.12, 0.04, { f2: 620, lp: 1800 }); noise(t + 0.1, 0.05, 0.12, { f: 900, q: 2 }); },
    shake() { const t = ctx.currentTime; osc('sine', 70, t, 0.3, 0.45, { f2: 50 }); for (let i = 0; i < 5; i++) noise(t + i * 0.05, 0.06, 0.18, { f: 900 + Math.random() * 1500, q: 2 }); },
    stuck() { const t = ctx.currentTime; osc('square', 300, t, 0.14, 0.08, { f2: 240, lp: 1400 }); osc('square', 200, t + 0.16, 0.3, 0.08, { f2: 150, lp: 1200, vib: 30 }); },
    grab() { const t = ctx.currentTime; noise(t, 0.12, 0.12, { f: 2500, q: 1.5 }); osc('sine', 600, t, 0.1, 0.06, { f2: 900 }); },
    got() { const t = ctx.currentTime + 0.02; duckUntil = ctx.currentTime + 1.6; [72, 76, 79, 84].forEach((n, i) => { osc('square', mtof(n), t + i * 0.09, i === 3 ? 0.45 : 0.12, 0.08, { lp: 4000, send: 0.4 }); osc('triangle', mtof(n - 12), t + i * 0.09, 0.14, 0.1); }); for (let i = 0; i < 6; i++) osc('sine', 2200 + Math.random() * 2500, t + 0.4 + i * 0.05, 0.12, 0.035, { send: 0.6, pan: Math.random() * 1.6 - 0.8 }); },
    bonus() { const t = ctx.currentTime; duckUntil = t + 1.4; [84, 88, 91, 96, 91, 96].forEach((n, i) => osc('square', mtof(n), t + i * 0.07, 0.1, 0.06, { lp: 4500, send: 0.5 })); },
    crunch() { const t = ctx.currentTime; for (let i = 0; i < 7; i++) noise(t + i * 0.022 + Math.random() * 0.01, 0.035, 0.22, { f: 1600 + Math.random() * 2600, q: 1.2 }); osc('sine', 150, t, 0.08, 0.12, { f2: 90 }); },
    chew() { const t = ctx.currentTime; [0, 0.16, 0.32].forEach(d => noise(t + d, 0.09, 0.08, { type: 'lowpass', f: 700 })); },
    glug() { const t = ctx.currentTime; for (let i = 0; i < 4; i++) { osc('sine', 260 - i * 18, t + i * 0.16, 0.12, 0.2, { f2: 420 - i * 20, slide: 0.08 }); noise(t + i * 0.16, 0.08, 0.06, { type: 'lowpass', f: 900 }); } osc('sine', 900, t + 0.75, 0.12, 0.05, { f2: 600 }); },
    open() { const t = ctx.currentTime; noise(t, 0.18, 0.2, { type: 'highpass', f: 3500, f2: 1500, attack: 0.002 }); osc('sine', 1800, t + 0.03, 0.06, 0.05, { f2: 1200 }); },
    burp() { const t = ctx.currentTime; osc('sawtooth', 95, t, 0.4, 0.09, { f2: 70, lp: 500, vib: 40 }); },
    yum() { const t = ctx.currentTime; [0, 0.15].forEach((d, i) => osc('sine', 600 + i * 150, t + d, 0.14, 0.12, { f2: 1100 + i * 200, slide: 0.08, send: 0.3 })); },
    whoosh() { const t = ctx.currentTime; noise(t, 0.35, 0.16, { type: 'bandpass', f: 400, f2: 2600, q: 1.5, attack: 0.12 }); },
    step() { const t = ctx.currentTime; noise(t, 0.04, 0.05, { type: 'lowpass', f: 500 }); },
  };
  return {
    unlock, get on() { return sfxOn; }, set on(v) { sfxOn = !!v; if (ctx) sfx.gain.setTargetAtTime(sfxOn ? 0.9 : 0, ctx.currentTime, 0.05); },
    get music() { return musOn; }, set music(v) { musOn = !!v; },
    track(name) { want = name; },
    play(name, ...a) { if (!live() || !sfxOn || !S[name]) return; try { S[name](...a); } catch (e) {} },
    selfTest() { if (!live()) return 'audio not running'; const errs = []; for (const k of Object.keys(S)) { try { k === 'thud' ? ['can', 'apple', 'chips', 'bar'].forEach(S.thud) : S[k](); } catch (e) { errs.push(k + ': ' + e.message); } } return errs.length ? errs : 'ok ' + Object.keys(S).length + ' sounds · music ' + (track || 'none'); },
    // spiral motor hum: level 0..1, pitch 0..1
    motor(level, pitch) { if (!live() || !motor) return; const t = ctx.currentTime; motor.mg.gain.setTargetAtTime(sfxOn ? level * 0.1 : 0, t, 0.05); const f = 70 + pitch * 50; motor.o1.frequency.setTargetAtTime(f, t, 0.08); motor.o2.frequency.setTargetAtTime(f * 1.012, t, 0.08); motor.lp.frequency.setTargetAtTime(380 + pitch * 500, t, 0.08); },
    // the fridge compressor hum of the machine (very quiet), ticks of the cooling fins
    ambience(dt) { if (!live() || !sfxOn) return; ambT -= dt; if (ambT > 0) return; ambT = 2.5 + Math.random() * 4; const t = ctx.currentTime; if (Math.random() < 0.6) noise(t, 0.03, 0.02, { f: 2600, q: 6, pan: 0.3 }); else osc('sine', 120, t, 1.4, 0.012, { f2: 118, attack: 0.4 }); },
    destroy() { clearInterval(timer); removeEventListener('pointerdown', unlock, { capture: true }); removeEventListener('keydown', unlock, { capture: true }); removeEventListener('touchend', unlock, { capture: true }); try { ctx && ctx.close(); } catch (e) {} },
  };
}

export async function createVendingMachine({ container, onState, opts = {} }) {
  // ---------- stage ----------
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1d1630'); scene.fog = new THREE.FogExp2('#1d1630', 0.05); const camera = new THREE.PerspectiveCamera(42, CW() / CH(), 0.05, 60);
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cache = new Map();
  const mkGrad = arr => { const d = new Uint8Array(arr.flatMap(v => [v, v, v, 255])); const t = new THREE.DataTexture(d, arr.length, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; };
  const grad = mkGrad([90, 175, 255]), grad4 = mkGrad([80, 145, 210, 255]);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.02, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  function bake(root, skip = []) {
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), groups = new Map(), done = [], mm = new THREE.Matrix4();
    const skipped = o => { for (let q = o; q && q !== root; q = q.parent) if (skip.includes(q)) return true; return false; };
    root.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o.material.transparent || skipped(o)) return; const k = o.material; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(o); });
    for (const [mat, list] of groups) { if (list.length < 2) continue; const pos = [], nor = [], uv = [], wantUv = !!mat.map;
      for (const o of list) { const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(mm.multiplyMatrices(inv, o.matrixWorld)); pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); if (wantUv) uv.push(...(g.attributes.uv ? g.attributes.uv.array : new Float32Array(g.attributes.position.count * 2))); g.dispose(); done.push(o); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); if (wantUv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeBoundingSphere(); root.add(new THREE.Mesh(g, mat)); }
    for (const o of done) if (o.parent) o.parent.remove(o);
  }
  const vcMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad4, emissive: new THREE.Color('#241a30'), emissiveIntensity: 0.3 });
  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x3a2a50, 1.15)); const sun = new THREE.DirectionalLight(0xfff4e6, 1.35); sun.position.set(2.5, 5, 6); scene.add(sun);
  const rimL = new THREE.DirectionalLight(0x7dd3fc, 0.5); rimL.position.set(-5, 3, 1); scene.add(rimL);
  const snd = ShopAudio(); snd.on = save.stat(VEND.key + '.sound', 1) !== 0; snd.music = save.stat(VEND.key + '.music', 1) !== 0; snd.track('shop');
  let emitT = 0, ready = false;
  const buzz = ms => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch (e) {} };
  const glowTex = texOf(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
  const addMat = (col, op = 1, map = glowTex) => new THREE.MeshBasicMaterial({ map, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });

  // ---------- the room: tiled floor, painted wall, a bench, a plant, a drinks cooler ----------
  const tiles = texOf(256, 256, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#3b2f57' : '#4a3d6b'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); } }, [8, 6]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshLambertMaterial({ map: tiles })); floor.rotation.x = -Math.PI / 2; floor.position.z = 2; scene.add(floor);
  const wallTex = texOf(256, 256, (g) => { g.fillStyle = '#5b3f8c'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#4b3276'; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 14, 256); }, [10, 2]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), new THREE.MeshLambertMaterial({ map: wallTex })); wall.position.set(0, 2.5, -0.62); scene.add(wall);
  const wains = new THREE.Mesh(new THREE.BoxGeometry(16, 0.9, 0.05), toon('#2a1f45')); wains.position.set(0, 0.45, -0.6); scene.add(wains); const rail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.05, 0.08), toon('#e6b45a')); rail.position.set(0, 0.92, -0.58); scene.add(rail);
  const neonSign = (txt, col) => texOf(512, 128, (g) => { g.font = `900 72px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 24; g.strokeStyle = col; g.lineWidth = 8; g.strokeText(txt, 256, 68); g.shadowBlur = 6; g.fillStyle = '#fff'; g.fillText(txt, 256, 68); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshBasicMaterial({ map: neonSign(opts.sign || 'SNACKS', '#7cf06a'), transparent: true, depthWrite: false })); sign.position.set(-2.1, 2.75, -0.58); scene.add(sign);
  const sgl = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.3), addMat('#7cf06a', 0.3)); sgl.position.set(-2.1, 2.75, -0.585); scene.add(sgl);
  { const bench = new THREE.Group(); bench.position.set(-2.2, 0, 0.1); scene.add(bench); const wd = toon('#b0703a'), mt = toon('#2a2433'); M(new THREE.BoxGeometry(1.5, 0.06, 0.42), wd, 0, 0.46, 0, bench); M(new THREE.BoxGeometry(1.5, 0.3, 0.05), wd, 0, 0.72, -0.2, bench); for (const x of [-0.65, 0.65]) M(new THREE.BoxGeometry(0.06, 0.46, 0.38), mt, x, 0.23, 0, bench, 0.01); bake(bench); }
  { const pl = new THREE.Group(); pl.position.set(1.7, 0, -0.2); scene.add(pl); M(new THREE.CylinderGeometry(0.2, 0.15, 0.4, 14), toon('#c2410c'), 0, 0.2, 0, pl); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; const lf = M(new THREE.SphereGeometry(0.14, 10, 8), toon(i % 2 ? '#2f8a3e' : '#3fa34d'), Math.cos(a) * 0.12, 0.55 + (i % 3) * 0.1, Math.sin(a) * 0.12, pl, 0.012, 0.14); lf.scale.set(0.6, 1.5, 0.35); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); } bake(pl); }
  { const cool = new THREE.Group(); cool.position.set(-3.6, 0, -0.15); scene.add(cool); M(new THREE.BoxGeometry(1.0, 2.0, 0.75), toon('#e7edf4'), 0, 1.0, 0, cool); const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.4), new THREE.MeshBasicMaterial({ color: '#bfe9ff' })); gl.position.set(0, 1.05, 0.38); cool.add(gl);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const can = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8), toon(['#ec3013', '#38bdf8', '#22c55e', '#ffd23a'][(r + c) % 4])); can.position.set(-0.3 + c * 0.12, 0.5 + r * 0.33, 0.3); cool.add(can); } M(new THREE.BoxGeometry(1.0, 0.3, 0.06), toon('#ec3013'), 0, 1.86, 0.36, cool, 0.01); bake(cool, [gl]); }

  // ---------- THE MACHINE ----------
  const MW = 1.1, MH = 2.15, MD = 0.8, FZ = MD / 2, WX0 = -0.5, WX1 = 0.16, WY0 = 0.74, WY1 = 1.92, BX0 = -0.48, BX1 = 0.14, BY0 = 0.12, BY1 = 0.42, BFLOOR = 0.14;
  const ROWS = [1.72, 1.5, 1.28, 1.06, 0.84], COLS = [-0.335, -0.015], PITCH = 0.14, SHELF_FZ = 0.31, GLASS_Z = FZ - 0.012;
  const mach = new THREE.Group(); scene.add(mach); const body = toon('#1b3f8f'), trim = toon('#ec3013'), dark = toon('#0f1424'), chrome = toon('#d6dee8', { emissive: new THREE.Color('#223'), emissiveIntensity: 0.2 });
  M(new THREE.BoxGeometry(MW, MH, 0.04), body, 0, MH / 2, -MD / 2 + 0.02, mach);
  for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.05, MH, MD), body, s * (MW / 2 - 0.025), MH / 2, 0, mach);
  M(new THREE.BoxGeometry(MW, 0.06, MD), body, 0, MH - 0.03, 0, mach);
  M(new THREE.BoxGeometry(MW + 0.04, 0.08, MD + 0.04), dark, 0, 0.04, 0, mach, 0.01);
  const fp = (x0, x1, y0, y1, mat = body) => M(new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.06), mat, (x0 + x1) / 2, (y0 + y1) / 2, FZ - 0.03, mach, 0.012);
  fp(-MW / 2, MW / 2, WY1, MH - 0.06); fp(-MW / 2, WX0, WY0, WY1); fp(WX1, MW / 2, WY0, WY1, toon('#16326f')); fp(-MW / 2, MW / 2, BY1, WY0); fp(-MW / 2, MW / 2, 0.08, BY0); fp(-MW / 2, BX0, BY0, BY1); fp(BX1, MW / 2, BY0, BY1);
  for (const [w, h, x, y] of [[WX1 - WX0 + 0.04, 0.025, (WX0 + WX1) / 2, WY1], [WX1 - WX0 + 0.04, 0.025, (WX0 + WX1) / 2, WY0], [0.025, WY1 - WY0, WX0, (WY0 + WY1) / 2], [0.025, WY1 - WY0, WX1, (WY0 + WY1) / 2]]) M(new THREE.BoxGeometry(w, h, 0.03), chrome, x, y, FZ + 0.005, mach, 0.006);
  M(new THREE.BoxGeometry(MW + 0.02, 0.05, 0.08), trim, 0, WY1 + 0.03, FZ - 0.0, mach, 0.01); M(new THREE.BoxGeometry(MW + 0.02, 0.04, 0.08), trim, 0, BY1 + 0.16, FZ, mach, 0.01);
  // header sign
  const hdr = new THREE.Mesh(new THREE.PlaneGeometry(MW - 0.1, MH - 0.06 - WY1 - 0.05), new THREE.MeshBasicMaterial({ map: texOf(512, 96, (g) => { g.fillStyle = '#0d1a3a'; g.fillRect(0, 0, 512, 96); g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ffd23a'; g.shadowBlur = 16; g.fillStyle = '#ffd23a'; g.fillText(opts.title || 'SNACK STOP', 256, 52); g.shadowBlur = 0; g.fillStyle = '#ec3013'; g.fillRect(0, 86, 512, 10); }) }));
  hdr.position.set(0, (WY1 + MH - 0.06) / 2 + 0.01, FZ + 0.002); mach.add(hdr); const hdrGlow = new THREE.Mesh(new THREE.PlaneGeometry(MW + 0.6, 0.6), addMat('#ffd23a', 0.22)); hdrGlow.position.set(0, (WY1 + MH) / 2, FZ + 0.004); mach.add(hdrGlow);
  // side art (diagonal stripes)
  const sideTex = texOf(128, 256, (g) => { g.fillStyle = '#1b3f8f'; g.fillRect(0, 0, 128, 256); g.strokeStyle = '#ec3013'; g.lineWidth = 16; for (let i = -2; i < 6; i++) { g.beginPath(); g.moveTo(-20, i * 60); g.lineTo(148, i * 60 + 90); g.stroke(); } g.strokeStyle = '#ffd23a'; g.lineWidth = 5; for (let i = -2; i < 6; i++) { g.beginPath(); g.moveTo(-20, i * 60 + 18); g.lineTo(148, i * 60 + 108); g.stroke(); } });
  for (const s of [-1, 1]) { const sp = new THREE.Mesh(new THREE.PlaneGeometry(MD - 0.04, MH - 0.2), new THREE.MeshLambertMaterial({ map: sideTex })); sp.rotation.y = s * Math.PI / 2; sp.position.set(s * (MW / 2 + 0.001), MH / 2, 0); mach.add(sp); }
  // interior: lit back panel, LED strip, shelves, price tags
  const backTex = texOf(128, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#fff8ea'); gr.addColorStop(1, '#ffe2c4'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256); g.fillStyle = 'rgba(236,48,19,0.06)'; for (let y = 0; y < 256; y += 20) g.fillRect(0, y, 128, 8); });
  const inBack = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), new THREE.MeshBasicMaterial({ map: backTex, fog: false })); inBack.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, -MD / 2 + 0.05); mach.add(inBack);
  for (const s of [WX0, WX1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(MD - 0.1, WY1 - WY0), new THREE.MeshLambertMaterial({ color: '#d8d0e8' })); sw.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2; sw.position.set(s + (s < 0 ? 0.012 : -0.012), (WY0 + WY1) / 2, 0); mach.add(sw); }
  const led = new THREE.Mesh(new THREE.BoxGeometry(WX1 - WX0 - 0.04, 0.015, 0.03), new THREE.MeshBasicMaterial({ color: '#fffbea' })); led.position.set((WX0 + WX1) / 2, WY1 - 0.03, FZ - 0.1); mach.add(led);
  const inLight = new THREE.PointLight(0xfff2dc, 1.4, 2.2, 1.6); inLight.position.set((WX0 + WX1) / 2, WY1 - 0.15, 0.2); scene.add(inLight);
  const tagTex = (s, c) => texOf(256, 40, (g) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 40); g.fillStyle = s.col; g.fillRect(0, 0, 12, 40); g.fillStyle = '#201e1d'; g.font = `900 24px ${FONT}`; g.textBaseline = 'middle'; g.fillText(s.code + c, 20, 21); g.font = `800 18px ${FONT}`; g.fillText(s.name, 64, 21); g.textAlign = 'right'; g.font = `900 22px ${FONT}`; g.fillText(s.price + 'g', 248, 21); });
  ROWS.forEach((ry, r) => { M(new THREE.BoxGeometry(WX1 - WX0 - 0.02, 0.014, SHELF_FZ + 0.32), toon('#c9d2de'), (WX0 + WX1) / 2, ry - 0.007, (SHELF_FZ - 0.32) / 2, mach, 0);
    COLS.forEach((cx, c) => { const tg = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.047), new THREE.MeshBasicMaterial({ map: tagTex(SNACKS[r], c + 1) })); tg.position.set(cx, ry - 0.03, SHELF_FZ + 0.002); mach.add(tg); }); });
  // glass + sheen
  const glassM = new THREE.MeshPhongMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.1, shininess: 140, depthWrite: false });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), glassM); glass.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, GLASS_Z); glass.renderOrder = 5; mach.add(glass);
  const streak = texOf(256, 256, (g) => { g.fillStyle = 'rgba(255,255,255,0.2)'; g.beginPath(); g.moveTo(30, 256); g.lineTo(80, 256); g.lineTo(160, 0); g.lineTo(130, 0); g.fill(); g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.moveTo(100, 256); g.lineTo(112, 256); g.lineTo(192, 0); g.lineTo(180, 0); g.fill(); }); streak.wrapS = THREE.RepeatWrapping;
  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), new THREE.MeshBasicMaterial({ map: streak, transparent: true, depthWrite: false })); sheen.position.copy(glass.position); sheen.position.z += 0.002; sheen.renderOrder = 6; mach.add(sheen);
  // delivery bin: dark box, translucent push flap
  M(new THREE.BoxGeometry(BX1 - BX0, 0.02, FZ - 0.02), dark, (BX0 + BX1) / 2, BFLOOR - 0.01, FZ / 2, mach, 0); M(new THREE.BoxGeometry(BX1 - BX0, BY1 - BY0 + 0.4, 0.02), dark, (BX0 + BX1) / 2, (BY0 + BY1 + 0.4) / 2, 0.01, mach, 0);
  const binGlow = new THREE.Mesh(new THREE.PlaneGeometry(BX1 - BX0, FZ - 0.02).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.0, depthWrite: false })); binGlow.position.set((BX0 + BX1) / 2, BFLOOR + 0.002, FZ / 2); mach.add(binGlow);
  const flapPivot = new THREE.Group(); flapPivot.position.set((BX0 + BX1) / 2, BY1, FZ - 0.008); mach.add(flapPivot);
  const flap = new THREE.Mesh(new THREE.PlaneGeometry(BX1 - BX0 - 0.01, BY1 - BY0 - 0.01), new THREE.MeshPhongMaterial({ color: '#0a1020', transparent: true, opacity: 0.55, shininess: 80, depthWrite: false, side: THREE.DoubleSide })); flap.position.y = -(BY1 - BY0) / 2; flap.renderOrder = 7; flapPivot.add(flap);
  const pushTx = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.04), new THREE.MeshBasicMaterial({ map: texOf(128, 32, (g) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#000'; g.font = `900 22px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PUSH', 64, 17); }), transparent: true })); pushTx.position.set(0, -0.03, 0.002); flapPivot.add(pushTx);
  // control column: display, letter buttons, coin slot
  const CX = (WX1 + MW / 2) / 2;
  const dispCv = document.createElement('canvas'); dispCv.width = 256; dispCv.height = 96; const dispTex = new THREE.CanvasTexture(dispCv); dispTex.colorSpace = THREE.SRGBColorSpace;
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.11), new THREE.MeshBasicMaterial({ map: dispTex })); disp.position.set(CX, 1.74, FZ + 0.002); mach.add(disp); M(new THREE.BoxGeometry(0.33, 0.14, 0.02), dark, CX, 1.74, FZ - 0.008, mach, 0.006);
  let dispTxt = ['', ''], dispBlink = 0; function setDisp(a, b = '') { if (a === dispTxt[0] && b === dispTxt[1]) return; dispTxt = [a, b]; const g = dispCv.getContext('2d'); g.fillStyle = '#071a0c'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#7cf06a'; g.shadowColor = '#7cf06a'; g.shadowBlur = 10; g.font = `900 36px ${FONT}`; g.textBaseline = 'middle'; g.fillText(a, 14, 32); g.font = `800 24px ${FONT}`; g.fillText(b, 14, 72); dispTex.needsUpdate = true; }
  const btnCaps = SNACKS.map((s, i) => { const x = CX - 0.09 + (i % 3) * 0.09, y = 1.55 - Math.floor(i / 3) * 0.1; const base = M(new THREE.CylinderGeometry(0.036, 0.036, 0.02, 18), dark, x, y, FZ + 0.005, mach, 0); base.rotation.x = Math.PI / 2;
    const capM = new THREE.MeshBasicMaterial({ map: texOf(64, 64, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill(); g.fillStyle = s.col; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.fill(); g.fillStyle = '#000'; g.font = `900 34px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.code, 32, 35); }), transparent: true, color: '#9a9a9a' });
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.03, 20), capM); cap.position.set(x, y, FZ + 0.017); mach.add(cap); cap.userData.snack = s.id; return cap; });
  M(new THREE.BoxGeometry(0.13, 0.16, 0.03), chrome, CX, 1.24, FZ - 0.002, mach, 0.006); M(new THREE.BoxGeometry(0.012, 0.07, 0.035), dark, CX, 1.25, FZ, mach, 0);
  const coinLbl = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.05), new THREE.MeshBasicMaterial({ map: texOf(256, 48, (g) => { g.fillStyle = '#16326f'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#ffd23a'; g.font = `900 26px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GOLD ONLY', 128, 25); }) })); coinLbl.position.set(CX, 1.12, FZ + 0.002); mach.add(coinLbl);
  M(new THREE.BoxGeometry(0.16, 0.08, 0.05), dark, CX, 0.98, FZ - 0.01, mach, 0.006); M(new THREE.BoxGeometry(0.14, 0.2, 0.03), toon('#16326f'), CX, 0.84, FZ, mach, 0.006);
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 18), toon('#ffd23a', { emissive: new THREE.Color('#7a5a10'), emissiveIntensity: 0.5 })); coin.rotation.x = Math.PI / 2; coin.visible = false; mach.add(coin);
  bake(mach, [hdr, hdrGlow, disp, coin, flapPivot, binGlow, glass, sheen, led, inBack, ...btnCaps, coinLbl]);

  // ---------- spirals + stock ----------
  const helixGeo = (() => { const pts = []; const turns = 4, len = 0.58; for (let i = 0; i <= 160; i++) { const t = i / 160, a = t * turns * Math.PI * 2; pts.push(V3(Math.cos(a) * 0.075, Math.sin(a) * 0.075, -0.29 + t * len)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.0055, 6, false); })();
  const spiralM = toon('#e7edf4', { emissive: new THREE.Color('#334'), emissiveIntensity: 0.25 });
  const GEO = Object.fromEntries(SNACKS.map(s => [s.id, snackGeo(s)]));
  const snackMesh = id => { const m = new THREE.Mesh(GEO[id], vcMat); m.userData.snack = id; return m; };
  const spirals = []; // [row][col] { mesh, items: [mesh…] (front first), x, y }
  function stockSpiral(sp) { sp.items.forEach(m => mach.remove(m)); sp.items = []; const s = SNACKS[sp.r]; for (let k = 0; k < VEND.perSpiral; k++) { const m = snackMesh(s.id); m.position.set(sp.x, sp.y + s.hh + 0.004, 0.2 - k * PITCH); m.rotation.y = (k % 2 ? 1 : -1) * 0.08; mach.add(m); sp.items.push(m); } }
  ROWS.forEach((ry, r) => { spirals[r] = COLS.map((cx, c) => { const mesh = new THREE.Mesh(helixGeo, spiralM); mesh.position.set(cx, ry + 0.075, 0); mach.add(mesh); const sp = { r, c, mesh, items: [], x: cx, y: ry }; stockSpiral(sp); return sp; }); });
  const stockOf = id => { const r = SNACKS.findIndex(s => s.id === id); return spirals[r].reduce((n, sp) => n + sp.items.length, 0); };

  // thumbnails for the buttons (rendered once)
  const thumbs = {};
  try { const ts = new THREE.Scene(); ts.add(new THREE.HemisphereLight(0xffffff, 0x8070a0, 1.6)); const dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(1, 2, 3); ts.add(dl); const tc = new THREE.PerspectiveCamera(30, 1, 0.01, 5); tc.position.set(0.12, 0.08, 0.36); tc.lookAt(0, 0, 0);
    const rt = new THREE.WebGLRenderTarget(128, 128); rt.texture.colorSpace = THREE.SRGBColorSpace; const px = new Uint8Array(128 * 128 * 4), cv = document.createElement('canvas'); cv.width = cv.height = 128; const cx = cv.getContext('2d'), id = cx.createImageData(128, 128);
    for (const s of SNACKS) { const m = snackMesh(s.id); m.rotation.y = -0.35; ts.add(m); renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(ts, tc); renderer.readRenderTargetPixels(rt, 0, 0, 128, 128, px);
      for (let y = 0; y < 128; y++) id.data.set(px.subarray((127 - y) * 512, (128 - y) * 512), y * 512); cx.putImageData(id, 0, 0); const sid = s.id; cv.toBlob(bl => { if (bl) { thumbs[sid] = URL.createObjectURL(bl); emit(true); } }, 'image/png'); ts.remove(m); }
    renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); rt.dispose(); } catch (e) { console.warn('vend thumbs', e); }

  // ---------- fox (THE CAST) ----------
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  let foxKey = ['player', 'hope', 'noble'].includes(save.stat(VEND.key + '.fox', 'player')) ? save.stat(VEND.key + '.fox', 'player') : 'player', fox = null, foxS = 1, foxH = 1;
  const FOX_IDLE = V3(1.05, 0, 0.95), FOX_BIN = V3((BX0 + BX1) / 2 + 0.06, 0, FZ + 0.4);
  const fx = { pos: FOX_IDLE.clone(), yaw: -0.5, crouch: 0, reach: 0, raise: 0, eat: 0, walking: false };
  function makeFoxNow() { if (fox) { scene.remove(fox); } fox = cast.make(foxKey, { gear: 'none' }); const bb = new THREE.Box3().setFromObject(fox); foxH = bb.max.y - bb.min.y; foxS = 1.42 / Math.max(0.1, foxH); fox.scale.multiplyScalar(foxS); fox.position.copy(fx.pos); fox.rotation.y = fx.yaw; }
  makeFoxNow();
  const handHold = [new THREE.Group(), new THREE.Group()];   // right hand, left hand
  function attachHands() { const P = fox.userData.P; handHold[0].position.set(0, -0.44, 0.07); handHold[1].position.set(0, -0.44, 0.07); P.arms[1].add(handHold[0]); P.arms[0].add(handHold[1]); }
  attachHands();

  // ---------- falling snacks ----------
  const falling = [];   // { m, s, v, w (angular), rest, landed }
  function startFall(m, s, vz = 0.18) { const wp = m.position.clone(); falling.push({ m, s, v: V3(0, -0.05, vz), w: V3(rr(3, 6), rr(-2, 2), rr(-1.5, 1.5)), rest: 0, landed: false, hits: 0 }); m.position.copy(wp); }
  function stepFall(f, dt) {
    if (f.landed) return; f.v.y -= 9.0 * dt; f.m.position.addScaledVector(f.v, dt); const p = f.m.position, r = f.s.hh * 0.6;
    f.m.rotation.x += f.w.x * dt; f.m.rotation.y += f.w.y * dt; f.m.rotation.z += f.w.z * dt;
    const zMin = p.y > BY1 + 0.05 ? SHELF_FZ + 0.012 + r * 0.5 : 0.04 + r, zMax = GLASS_Z - 0.012 - r * 0.5;
    if (p.z < zMin) { p.z = zMin; f.v.z = Math.abs(f.v.z) * 0.3; } if (p.z > zMax) { p.z = zMax; f.v.z = -Math.abs(f.v.z) * 0.3; }
    p.x = clamp(p.x, BX0 + 0.08, BX1 - 0.08);
    const fy = BFLOOR + r * 0.75; if (p.y < fy) { p.y = fy; if (f.v.y < -0.4) { f.hits++; snd.play('thud', f.s.kind); shake = Math.max(shake, 0.01); buzz(12); } f.v.y = Math.abs(f.v.y) * 0.32; f.v.x *= 0.7; f.v.z *= 0.6; f.w.multiplyScalar(0.55); }
    if (p.y <= fy + 0.002 && f.v.length() < 0.12) { f.rest += dt; } else f.rest = 0;
    if (f.rest > 0.25) { f.landed = true; f.v.set(0, 0, 0); f.m.position.y = BFLOOR + (f.s.kind === 'apple' ? f.s.hh : 0.016); f.m.rotation.set(f.s.kind === 'apple' ? 0 : -Math.PI / 2, rr(-0.6, 0.6), 0); f.m.rotation.order = 'YXZ'; }
  }

  // ---------- state ----------
  let demoBuy = 0, phase = 'select', phT = 0, sel = SNACKS[0].id, flash = null, flashT = 0, say = '', sayT = 0, live = '', demo = false, demoT = 0, card = null, shake = 0, shakeT = 0, active = null, stuckTries = 0, bought = [], walkTo = null;
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 };
  const flashIt = (txt, col = '#ffd23a', t = 1.6) => { flash = { txt, col }; flashT = t; emit(true); };
  const sayIt = (t, d = 2.6) => { say = t; sayT = d; };
  const freeSample = () => !save.flag(VEND.key + '.sample');
  const foxName = () => ({ player: 'BEN', hope: 'HOPE', noble: 'NOBLE' })[foxKey];
  function setPhase(p) { phase = p; phT = 0; emit(true); }
  function select(id) { if (!SN[id] || (phase !== 'select' && phase !== 'show')) return; if (phase === 'show') finishShow(); sel = id; snd.play('select'); const s = SN[id]; setDisp(s.code + ' · ' + s.price + 'g', stockOf(id) ? s.name : 'SOLD OUT'); emit(true); }
  function buy() {
    if (phase !== 'select') return; const s = SN[sel]; if (!stockOf(sel)) { snd.play('nope'); flashIt('SOLD OUT · PICK ANOTHER', '#ec3013'); setDisp('SOLD OUT', 'PICK ANOTHER'); return; }
    const free = freeSample() && !demo; if (!demo && !free && !save.spend(s.price)) { snd.play('nope'); flashIt('NOT ENOUGH GOLD', '#ec3013'); setDisp('NEED ' + s.price + 'g', 'NOT ENOUGH'); buzz(40); return; }
    if (free) save.setFlag(VEND.key + '.sample');
    const r = SNACKS.indexOf(s), sp = spirals[r].slice().sort((a, b) => b.items.length - a.items.length)[0];
    active = { s, sp, free, bonus: !demo && Math.random() < VEND.bonusChance, stuck: Math.random() < VEND.stuckChance, spins: 0, items: [] }; stuckTries = 0;
    btnCaps.forEach(c => c.material.color.set(c.userData.snack === s.id ? '#ffffff' : '#9a9a9a'));
    snd.play('coin'); coin.visible = true; coin.position.set(CX, 1.42, FZ + 0.05); setDisp(free ? 'FREE SAMPLE' : 'PAID ' + s.price + 'g', s.code + c1(sp) + ' ' + s.name); live = (free ? 'Free sample: ' : 'Bought ') + s.name + '.'; setPhase('pay');
  }
  const c1 = sp => String(sp.c + 1);
  function spinStart() { active.spins++; active.t0 = active.sp.items.map(m => m.position.z); snd.play('clunk'); setPhase('spin'); }
  function shakeMachine() { if (phase !== 'stuck') return; stuckTries++; shakeT = 0.45; snd.play('shake'); buzz(60); if (stuckTries >= 3 || Math.random() < 0.45) { const m = active.hang; active.hang = null; startFall(m, active.s, 0.12); active.items.push(falling[falling.length - 1]); flashIt('IT FELL!', '#22c55e', 1.2); setPhase('fall'); } else sayIt(['Almost… shake it again!', 'It wobbled!', 'One more shake!'][Math.min(2, stuckTries - 1)], 1.8); }
  function finishShow() { for (const f of active ? active.items : []) { f.m.parent && f.m.parent.remove(f.m); } falling.length = 0; active = null; card = null; fx.raise = 0; fx.eat = 0; walkTo = FOX_IDLE; btnCaps.forEach(c => c.material.color.set('#9a9a9a')); const s = SN[sel]; setDisp(s.code + ' · ' + s.price + 'g', stockOf(sel) ? s.name : 'SOLD OUT'); }
  function keep() { if (phase !== 'show') return; snd.play('ui'); finishShow(); setPhase('select'); }
  function eat() { if (phase !== 'show' || !active) return; const s = active.s; if (!save.take(itemId(s.id))) return; snd.play(s.kind === 'can' ? 'open' : 'ui'); card.count = save.count(itemId(s.id)); card.ate = true; live = foxName() + ' ' + (s.kind === 'can' ? 'drinks' : 'eats') + ' the ' + s.name.toLowerCase() + '.'; setPhase('eat'); }
  function restock() { spirals.flat().forEach(stockSpiral); flashIt('RESTOCKED!', '#7dd3fc'); snd.play('whoosh'); emit(true); }

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
  const shotCache = new Map(), box = (x0, x1, y0, y1, z0, z1) => { const r = []; for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) r.push(V3(x, y, z)); return r; };
  function shot(key) { const ck = key + CW() + 'x' + CH() + JSON.stringify(SAFE) + (key === 'show' || key === 'pick' ? fx.pos.x.toFixed(2) : ''); if (shotCache.has(ck)) return shotCache.get(ck); if (shotCache.size > 60) shotCache.clear(); let s;
    if (key === 'select') s = fitShot([...box(-MW / 2, MW / 2, 0.05, MH, -0.2, FZ)], 0.1, 0.16);
    else if (key === 'vend') { const r = active ? active.sp : spirals[0][0]; s = fitShot([...box(WX0, WX1, BY0 - 0.02, Math.min(WY1, r.y + 0.3), 0, FZ)], 0.12, 0.1); }
    else if (key === 'pick') s = fitShot([...box(BX0 - 0.1, BX1 + 0.35, 0, 1.55, -0.1, FZ + 0.6)], 0.22, 0.75);
    else s = fitShot([...box(FOX_BIN.x - 0.62, FOX_BIN.x + 0.62, 0.0, 2.05, FOX_BIN.z - 0.35, FOX_BIN.z + 0.3)], 0.08, 0.14);
    shotCache.set(ck, s); return s; }
  const camPos = V3(0, 1.5, 4), camLook = V3(0, 1.1, 0); let camInit = false;

  // ---------- tap a snack in the window to select it ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let downAt = null;
  const onDown = e => { downAt = [e.clientX, e.clientY]; };
  const onUp = e => { if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 10) return; downAt = null; const r = renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...spirals.flat().flatMap(sp => sp.items), ...btnCaps], false); if (hits.length) { const id = hits[0].object.userData.snack; if (id) select(id); } };
  renderer.domElement.addEventListener('pointerdown', onDown); renderer.domElement.addEventListener('pointerup', onUp);
  const onKey = e => { const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA')) return; const k = e.key.toUpperCase(); const i = 'ABCDE'.indexOf(k); if (i >= 0 && e.key.length === 1) { select(SNACKS[i].id); return; } const n = '12345'.indexOf(e.key); if (n >= 0) { select(SNACKS[n].id); return; }
    if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); if (phase === 'select') buy(); else if (phase === 'stuck') shakeMachine(); else if (phase === 'show') keep(); } else if (e.code === 'KeyS' && phase === 'stuck') shakeMachine(); };
  addEventListener('keydown', onKey);

  // ---------- hud ----------
  function hud() { const s = SN[sel];
    return { phase, sel, snacks: SNACKS.map(q => ({ id: q.id, code: q.code, name: q.name, price: q.price, stock: stockOf(q.id), thumb: thumbs[q.id] || '', col: q.col, effect: q.effect, bag: save.count(itemId(q.id)) })),
      selName: s.name, selPrice: s.price, selStock: stockOf(sel), gold: save.data.gold, free: freeSample() && !demo, canAfford: demo || freeSample() || save.data.gold >= s.price, flash: flashT > 0 ? flash : null, say: sayT > 0 ? say : '', live, demo, card,
      sound: snd.on, music: snd.music, foxKey, foxName: foxName(), stuckTries, bagTotal: SNACKS.reduce((n, q) => n + save.count(itemId(q.id)), 0), allSold: SNACKS.every(q => !stockOf(q.id)) };
  }
  function emit(now) { if (!onState || !ready) return; const t = performance.now(); if (!now && t - emitT < 100) return; emitT = t; onState(hud()); }

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, alive = true, T = 0, stepT = 0;
  function update(dt) {
    phT += dt; T += dt; if (flashT > 0) { flashT -= dt; if (flashT <= 0) emit(true); } if (sayT > 0) { sayT -= dt; if (sayT <= 0) emit(true); }
    // demo: pick something, buy it, keep it, repeat
    if (demo) { demoT -= dt; if (phase === 'select' && demoBuy > 0) { demoBuy -= dt; if (demoBuy <= 0) buy(); } else if (phase === 'select' && demoT <= 0) { if (SNACKS.every(q => !stockOf(q.id))) restock(); const opts2 = SNACKS.filter(q => stockOf(q.id)); select(pick(opts2).id); demoT = 99; demoBuy = 0.9; } else if (phase === 'show' && phT > 2.4) { keep(); demoT = 1.2; } else if (phase === 'stuck' && phT > 0.8 && shakeT <= 0) shakeMachine(); }
    // phases
    if (phase === 'pay') { const k = clamp(phT / 0.5, 0, 1); coin.position.set(CX, 1.42 - k * 0.17, FZ + 0.05 - k * 0.06); coin.rotation.z = k * 4; if (phT > 0.55) { coin.visible = false; snd.play('paid'); spinStart(); } }
    else if (phase === 'spin') { const dur = 1.4, k = clamp(phT / dur, 0, 1), e = k * k * (3 - 2 * k), sp = active.sp; sp.mesh.rotation.z = -e * Math.PI * 2; snd.motor(0.9, 0.5 + Math.sin(phT * 30) * 0.05);
      sp.items.forEach((m, i) => { m.position.z = active.t0[i] + PITCH * e; });
      const front = sp.items[0]; if (front && front.position.z > SHELF_FZ - 0.03) front.rotation.x = Math.min(1.0, (front.position.z - (SHELF_FZ - 0.03)) * 9);
      if (k >= 1) { snd.motor(0, 0); sp.mesh.rotation.z = 0; const m = sp.items.shift(); if (active.stuck) { active.stuck = false; active.hang = m; m.rotation.x = 0.55; m.position.z = SHELF_FZ + 0.02; snd.play('stuck'); flashIt('IT\'S STUCK!', '#ec3013', 1.8); sayIt('Tap SHAKE to knock it loose.', 3); live = 'The snack is stuck. Shake the machine.'; setPhase('stuck'); }
        else { startFall(m, active.s); active.items.push(falling[falling.length - 1]); setPhase('fall'); } } }
    else if (phase === 'stuck') { const m = active.hang; if (m) m.rotation.x = 0.55 + Math.sin(T * 3) * 0.03; }
    else if (phase === 'fall') { if (active.items.length && active.items.every(f => f.landed) && phT > 0.4) {
        if (active.bonus && active.spins < 2 && active.sp.items.length) { active.bonus = false; flashIt('BONUS SNACK!', '#22c55e', 1.8); snd.play('bonus'); active.t0 = active.sp.items.map(m => m.position.z); active.spins++; setPhase('spin'); }
        else { binGlow.material.opacity = 0.35; sayIt(foxName() + ' is grabbing it…', 2); walkTo = FOX_BIN; setPhase('walk'); } } }
    else if (phase === 'walk') { if (fox.position.distanceTo(FOX_BIN) < 0.03) setPhase('reach'); }
    else if (phase === 'reach') { fx.crouch = smooth(0, 0.6, phT); fx.reach = smooth(0.15, 0.7, phT); flapPivot.rotation.x = smooth(0.35, 0.65, phT) * 1.15;
      if (phT > 0.75 && !active.inHand) { active.inHand = true; snd.play('flap'); snd.play('grab'); active.items.forEach((f, i) => { const m = f.m; m.parent.remove(m); handHold[i % 2].add(m); m.position.set(0, 0, 0); m.rotation.set(-0.3, 0, 0); m.scale.setScalar(1 / (foxS * 1.25) * 1.7); }); }
      if (phT > 1.05) setPhase('lift'); }
    else if (phase === 'lift') { fx.crouch = 1 - smooth(0, 0.5, phT); fx.reach = 1 - smooth(0, 0.4, phT); fx.raise = smooth(0.2, 0.8, phT); flapPivot.rotation.x = (1 - smooth(0, 0.3, phT)) * 1.15; binGlow.material.opacity = 0;
      if (phT > 0.35 && !active.cheer) { active.cheer = true; fox.userData.hop = 1; snd.play('got'); buzz([20, 30, 40]);
        const s = active.s, n = active.items.length; if (!demo) { save.give(itemId(s.id), n); save.setStat(VEND.key + '.bought', save.stat(VEND.key + '.bought') + n); save.addXp(1); }
        card = { id: s.id, name: s.name, effect: s.effect, line: s.line, col: s.col, verb: s.verb, n, demo, count: demo ? 0 : save.count(itemId(s.id)), free: active.free, thumb: thumbs[s.id] || '', ate: false };
        live = foxName() + ' got ' + (n > 1 ? n + ' ' : 'the ') + s.name.toLowerCase() + '. In your bag: ' + card.count + '.'; }
      if (phT > 0.95) setPhase('show'); }
    else if (phase === 'show') { fx.raise = 1; }
    else if (phase === 'eat') { const s = active.s, bites = 3, k = clamp(phT / 2.1, 0, 1), bi = Math.floor(k * bites + 0.0001); fx.raise = Math.max(0, 1 - phT * 3); fx.eat = smooth(0, 0.3, phT) * (1 - smooth(1.9, 2.2, phT));
      if (bi !== active.bite && bi < bites) { active.bite = bi; if (phT > 0.25) { snd.play(s.kind === 'can' ? 'glug' : s.kind === 'apple' || s.kind === 'chips' || s.kind === 'bar' ? 'crunch' : 'chew'); fox.userData.mouth = 1; } }
      const held0 = active.items[0]; if (held0) held0.m.scale.setScalar(1 / (foxS * 1.25) * 1.7 * Math.max(0.05, 1 - smooth(0.3, 2.0, phT) * 0.95));
      if (phT > 2.25 && !active.done) { active.done = true; snd.play(s.kind === 'can' ? 'burp' : 'yum'); fox.userData.hop = 1; flashIt('YUM!', s.col, 1.2); if (held0) { held0.m.parent && held0.m.parent.remove(held0.m); active.items.shift(); } }
      if (phT > 2.6) { if (active.items.length) { fx.raise = 1; setPhase('show'); } else { finishShow(); setPhase('select'); } } }
    if (phase === 'select' && walkTo === FOX_IDLE && fox.position.distanceTo(FOX_IDLE) < 0.03) walkTo = null;
    // falling physics
    for (const f of falling) if (!f.landed && f.m.parent === mach) stepFall(f, dt);
    // fox: walk, then pose on top of animFox
    let speed = 0; if (walkTo) { const d = V3().subVectors(walkTo, fox.position); d.y = 0; const dist = d.length(); if (dist > 0.03) { const st = Math.min(dist, 1.1 * dt); fox.position.addScaledVector(d.normalize(), st); speed = 2.2; fx.yaw = Math.atan2(d.x, d.z); stepT -= dt; if (stepT <= 0) { stepT = 0.28; snd.play('step'); } } }
    const yawT = speed ? fx.yaw : (['reach', 'lift'].includes(phase) || (phase === 'walk')) ? Math.PI : ['show', 'eat'].includes(phase) ? 0.15 : -0.5;
    let dy = yawT - fox.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); fox.rotation.y += dy * (1 - Math.exp(-8 * dt));
    fox.userData.lookAt = ['show', 'eat'].includes(phase) ? camera.position : phase === 'select' ? mach.localToWorld(V3(0, 1.3, FZ)) : mach.localToWorld(V3(FOX_BIN.x - 0.06, BFLOOR + 0.1, FZ));
    fox.userData.mood = ['show', 'lift'].includes(phase) ? 'excited' : phase === 'eat' ? 'happy' : phase === 'stuck' ? 'surprised' : 'happy';
    kit.animFox(fox, dt, speed);
    { const P = fox.userData.P, chair = !!fox.userData.chair, c = fx.crouch * (chair ? 0.35 : 1);
      P.body.position.y -= c * foxH * 0.2; P.body.rotation.x += c * 0.55;
      const ra = P.arms[1], la = P.arms[0], two = active && active.items.length > 1;
      if (fx.reach > 0.01) { ra.rotation.x = damp(ra.rotation.x, -1.25 - c * 0.2, 30, dt); if (two) la.rotation.x = ra.rotation.x; }
      if (fx.raise > 0.01) { ra.rotation.x = -0.6 - fx.raise * 2.1; ra.rotation.z = 0.25; if (two) { la.rotation.x = ra.rotation.x; la.rotation.z = -0.25; } }
      if (fx.eat > 0.01) { ra.rotation.x = -1.95 * fx.eat; ra.rotation.z = 0.55 * fx.eat; } }
    // machine life
    if (shakeT > 0) { shakeT -= dt; mach.position.x = Math.sin(shakeT * 60) * 0.025 * (shakeT / 0.45); mach.rotation.z = Math.sin(shakeT * 47) * 0.012 * (shakeT / 0.45); } else { mach.position.x = 0; mach.rotation.z = 0; }
    streak.offset.x = (T * 0.025) % 1; hdrGlow.material.opacity = 0.18 + 0.06 * Math.sin(T * 2.3); led.material.color.setHSL(0.12, 1, 0.92 + Math.sin(T * 1.7) * 0.04);
    if (phase === 'select' || phase === 'show') { const s = SN[sel]; if (stockOf(sel)) { dispBlink += dt; setDisp(dispBlink % 4 < 2 ? s.code + ' · ' + s.price + 'g' : 'PRESS BUY', s.name); } }
    btnCaps.forEach(c => { const on = c.userData.snack === sel && (phase === 'select' || phase === 'show'); c.material.color.set(on ? (Math.sin(T * 6) > 0 ? '#ffffff' : '#d0d0d0') : active && active.s.id === c.userData.snack ? '#ffffff' : '#9a9a9a'); });
    snd.ambience(dt);
    // camera
    const sk = phase === 'select' ? 'select' : ['pay', 'spin', 'stuck', 'fall'].includes(phase) ? 'vend' : ['walk', 'reach'].includes(phase) ? 'pick' : 'show';
    const s = shot(sk); if (!camInit) { camPos.copy(s.pos); camLook.copy(s.look); camInit = true; }
    const cr = 3.2; camPos.lerp(s.pos, 1 - Math.exp(-cr * dt)); camLook.lerp(s.look, 1 - Math.exp(-cr * dt)); camera.position.copy(camPos); camera.position.x += Math.sin(T * 0.4) * 0.02; camera.lookAt(camLook);
    if (shake > 0) { camera.position.x += (Math.random() - 0.5) * shake; camera.position.y += (Math.random() - 0.5) * shake; shake = Math.max(0, shake - dt * 0.06); }
    if (phase === 'walk' || phase === 'reach') emit(); else emit();
  }
  function frame() { if (!alive) return; raf = requestAnimationFrame(frame); update(Math.min(clock.getDelta(), 1 / 30)); renderer.render(scene, camera); }
  const onRs = () => { renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); emit(true); };
  ready = true; const ro = new ResizeObserver(onRs); ro.observe(container); onRs(); select(sel); setPhase('select'); frame();

  return {
    hud, select, buy, shake: shakeMachine, eat, keep, restock,
    setSafe(top, bottom, left = 0, right = 0) { if ([top - SAFE.top, bottom - SAFE.bottom, left - SAFE.left, right - SAFE.right].some(v => Math.abs(v) > 3)) Object.assign(SAFE, { top, bottom, left, right }); },
    setFox(k) { if (!['player', 'hope', 'noble'].includes(k) || !['select'].includes(phase)) return; foxKey = k; save.setStat(VEND.key + '.fox', k); makeFoxNow(); attachHands(); emit(true); },
    setSound(on) { snd.on = on; save.setStat(VEND.key + '.sound', on ? 1 : 0); emit(true); }, setMusic(on) { snd.music = on; save.setStat(VEND.key + '.music', on ? 1 : 0); emit(true); },
    demoStart() { demo = true; demoT = 0.5; if (phase === 'show') keep(); emit(true); }, demoStop() { demo = false; emit(true); },
    destroy() { alive = false; cancelAnimationFrame(raf); snd.destroy(); ro.disconnect(); removeEventListener('keydown', onKey); renderer.domElement.removeEventListener('pointerdown', onDown); renderer.domElement.removeEventListener('pointerup', onUp); renderer.dispose(); renderer.domElement.remove(); },
    _debug: { audio: () => snd.selfTest(), info: () => renderer.info.render, save, SAFE, run(sec) { for (let t = 0; t < sec; t += 1 / 60) update(1 / 60); return phase; }, setStuck() { if (active) active.stuck = true; }, active: () => active },
  };
}
