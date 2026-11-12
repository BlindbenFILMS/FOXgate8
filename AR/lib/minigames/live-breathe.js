// LIVE THE BEAUTY (Deborah Tramentozzi): BREATHE THE BEAUTY, a calm breathing game.
// “You don’t have to see beauty to live it. Beauty is something you move through, something you breathe.”
// The world in the painting starts out asleep: dim and still, the sun faint. Hold the big button (or hold a finger
// anywhere on the screen, or breathe out slowly into the phone) to breathe in: a golden ring grows around the sun, the
// clouds swirl inward and the light warms, with a soft rising tone. Let go to breathe out, and one more part of the
// world wakes up, each with its own sound from where it sits in the painting:
//   1 the warm sun · 2 the river · 3 wind in the trees · 4 birds · 5 the temple bell · 6 flowers · 7 the sky figures sing
//   8 the light opens, and you're inside the beauty.
// Nothing to lose and no rush: a breath that's too short just gets "A little longer." Then Deborah speaks, and the finale.
import * as THREE from 'three';
import * as K from './kit.js';
import { thing } from './live-things.js';

const CEN = [0.49, 0.43];                         // the glowing sun at the heart of the spiral (u, v)
const IN = 3.0, OK = 0.6, OUT = 3.2;              // seconds to fill a breath, how full counts as a breath, seconds to breathe out
const RIVER = [[0.44, 0.7], [0.5, 0.7], [0.56, 0.78], [0.6, 0.86], [0.58, 0.94], [0.45, 0.97], [0.3, 0.93], [0.24, 0.88], [0.33, 0.82], [0.42, 0.76]];
// the eight breaths: what wakes, where it is, which side its sound comes from, and what the narrator says
const SENSES = [
  { id: 'sun', name: 'The warm sun', at: CEN, pan: 0, say: 'The warm sun. Feel it on your face.' },
  { id: 'river', name: 'The river', at: [0.45, 0.85], pan: -0.1, say: 'The river. Hear it flowing.' },
  { id: 'wind', name: 'Wind in the trees', at: [0.86, 0.8], pan: 0.3, say: 'Wind in the trees. Hear the leaves.' },
  { id: 'birds', name: 'Birds', at: [0.75, 0.16], pan: 0.5, say: 'Birds above you. Hear them sing.' },
  { id: 'bell', name: 'The temple bell', at: [0.09, 0.62], pan: -0.8, say: 'The temple bell. Far away, on your left.' },
  { id: 'flowers', name: 'Flowers', at: [0.82, 0.84], pan: 0.7, say: 'Flowers. Breathe in their scent.' },
  { id: 'song', name: 'The sky figures sing', at: [0.42, 0.2], pan: 0, say: 'The figures in the clouds are singing.' },
  { id: 'light', name: 'The light opens', at: CEN, pan: 0, say: 'The light opens. You are inside the beauty.' },
];
const LINES = {
  title: 'Breathe the beauty',
  how: 'Hold the button to breathe in. Let go to breathe out. Each breath wakes up the world around you.',
  in: 'Breathe in.', out: 'Breathe out.', longer: 'A little longer.', remind: 'Hold the button to breathe in.',
  touch: 'Touch it on the painting to play it.',
  deborah: 'Listen to Deborah.', end: 'You lived the beauty',
};
const CLIP = new URL('../../../3D/gallery/audio/wing_1_1.mp3', import.meta.url).href;   // Deborah's own words for this painting

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, alive: the cloud spiral twists in as you breathe in and out, the river flows, the trees sway in the wind,
// and the colour and light come back to the sleeping world breath by breath
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, uRiverM; uniform float uT, uBreath, uLife, uSun, uRiver, uWind, uA, uH; uniform vec2 uC;
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec2 d = (p - uC) * vec2(1.0, uH); float r = length(d);
  float w = smoothstep(0.04, 0.2, r) * (1.0 - smoothstep(0.32, 0.66, r));         // the ring of clouds turns; the sun and the edges stay put
  float ang = (uBreath * 0.2 + 0.06 * sin(uT * 0.22) + 0.025 * sin(uT * 0.7 + r * 9.0)) * w;   // the clouds always drift a little
  float zoom = 1.0 - uBreath * 0.05 * (1.0 - smoothstep(0.0, 0.7, r));             // breathing in draws the world toward you
  float cs = cos(ang), sn = sin(ang); d = vec2(d.x * cs - d.y * sn, d.x * sn + d.y * cs) * zoom;
  vec2 q = uC + d / vec2(1.0, uH);
  float rv = texture2D(uRiverM, vec2(q.x, 1.0 - q.y)).r * uRiver;                  // the river flows
  q += vec2(sin(q.y * 150.0 + uT * 2.2) * 0.003 + sin(q.x * 30.0 - uT * 1.4) * 0.0015, sin(q.x * 50.0 - uT * 2.6) * 0.002) * rv;
  float low = smoothstep(0.62, 0.95, q.y) * (1.0 - rv);                             // the trees along the bottom sway in the wind
  q.x += (sin(q.y * 26.0 + uT * 1.6) * 0.0022 + sin(q.x * 40.0 + uT * 2.7) * 0.001) * uWind * low;
  vec3 c = texture2D(map, vec2(q.x, 1.0 - q.y)).rgb;
  float hl = pow(max(0.0, sin(q.x * 38.0 - uT * 1.7 + sin(q.y * 90.0 + uT) * 2.0)), 16.0);
  c += vec3(1.0, 0.95, 0.85) * hl * 0.3 * rv;                                       // light dancing on the water
  float g = dot(c, vec3(0.3, 0.59, 0.11));
  vec3 asleep = vec3(g) * vec3(0.78, 0.84, 0.95) * 0.62;                            // the sleeping world: dim, cool and grey
  c = mix(asleep, c, uLife);
  c += vec3(1.0, 0.82, 0.55) * (uSun * 0.16 + uBreath * 0.1) * exp(-r * 6.0);    // the sun's warmth
  gl_FragColor = vec4(c, uA);
}`;

function maskTex(poly, blur = 4) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.filter = `blur(${blur}px)`; g.fillStyle = '#fff';
  g.beginPath(); poly.forEach(([u, v], i) => g[i ? 'lineTo' : 'moveTo'](u * 256, v * 256)); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

/* ───────────────────────── the soundscape: a calm song that grows with every breath ─────────────────────────
   A slow ballad in D major (D · Bm · G · A, 66 beats a minute), played on soft, warm instruments: no buzzing tones.
   Breathing in plucks harp notes that climb with your breath; breathing out lets them fall gently back down.
   Every part of the world that wakes adds one instrument, placed on its side of the painting:
     sun: warm pad + low piano · river: harp ripples · wind: the piano melody · birds: a flute up high + birdsong
     bell: soft bass + the temple bell (left) · flowers: music box sparkles (right) · song: a soft choir · light: everything */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const BPM = 66, BEAT = 60 / BPM;
const CHORDS = [[50, 62, 66, 69], [47, 59, 62, 66], [43, 55, 59, 62], [45, 57, 61, 64]];      // root, then the chord: D · Bm · G · A
const MELODY = [   // [note, beat, length] over 8 bars (32 beats), then it loops
  [74, 0, 2], [73, 2, 1], [71, 3, 1], [69, 4, 3], [66, 7, 1], [67, 8, 2], [69, 10, 1], [71, 11, 1], [69, 12, 4],
  [74, 16, 1.5], [76, 17.5, 0.5], [78, 18, 2], [76, 20, 1], [74, 21, 1], [71, 22, 2], [71, 24, 1], [74, 25, 1], [76, 26, 2], [73, 28, 2], [69, 30, 2],
];
const FLUTE = [[81, 0, 3.5], [78, 4, 3.5], [79, 8, 3.5], [76, 12, 3.5], [78, 16, 3.5], [74, 20, 3.5], [74, 24, 3.5], [73, 28, 3.5]];
const BREATH_NOTES = [62, 64, 66, 69, 71, 74, 76, 78].map(midi);   // the harp climbs these as you breathe in

function soundscape(ac) {
  const master = ac.createGain(); master.gain.value = 0;
  const warm = ac.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 5200; warm.Q.value = 0.4;   // nothing harsh gets through
  master.connect(warm).connect(ac.destination);
  const verb = ac.createConvolver(); {   // a big, soft hall so everything sounds far and wide
    const n = Math.floor(ac.sampleRate * 3.4), b = ac.createBuffer(2, n, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.8); }
    verb.buffer = b;
  }
  const wet = ac.createGain(); wet.gain.value = 0.55; verb.connect(wet).connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const out = (p, send = 1) => {
    const g = ac.createGain(); let n = g;
    if (ac.createStereoPanner) { const s = ac.createStereoPanner(); s.pan.value = Math.max(-1, Math.min(1, p)); g.connect(s); n = s; }
    n.connect(master); if (send) { const sg = ac.createGain(); sg.gain.value = send; n.connect(sg).connect(verb); }
    return g;
  };
  const voice = (t, f, dur, { type = 'sine', vol = 0.05, att = 0.01, p = 0, filt = 0, vib = 0, send = 1 } = {}) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (filt) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filt; o.connect(fl); n = fl; }
    if (vib) { const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 5; vg.gain.value = vib; v.connect(vg).connect(o.detune); v.start(t); v.stop(t + dur + 0.05); }
    n.connect(g).connect(out(p, send)); o.start(t); o.stop(t + dur + 0.05);
  };
  // the instruments
  const harp = (t, f, vol = 0.05, p = 0) => { voice(t, f, 2.6, { type: 'triangle', vol, att: 0.004, p, filt: 2400 }); voice(t, f * 2, 0.9, { vol: vol * 0.35, att: 0.003, p }); };
  const piano = (t, f, vol = 0.06, p = 0, dur = 2.8) => { voice(t, f, dur, { vol, att: 0.006, p }); voice(t, f * 2, dur * 0.5, { type: 'triangle', vol: vol * 0.22, att: 0.006, p, filt: 3000 }); voice(t, f * 3, dur * 0.25, { vol: vol * 0.08, att: 0.006, p }); };
  const flute = (t, f, dur, vol = 0.03, p = 0.45) => voice(t, f, dur, { vol, att: 0.25, p, vib: 6, filt: 2800 });
  const musicBox = (t, f, vol = 0.022, p = 0.7) => { voice(t, f, 1.6, { vol, att: 0.002, p }); voice(t, f * 4.02, 0.5, { vol: vol * 0.3, att: 0.002, p }); };
  const bass = (t, f, dur) => voice(t, f, dur, { vol: 0.07, att: 0.05, filt: 400, send: 0.4 });
  const pad = (t, notes, dur, vol) => notes.forEach((m, i) => voice(t, midi(m), dur, { type: 'triangle', vol, att: 1.4, p: (i % 2 ? 0.3 : -0.3), filt: 900 }));
  const choir = (t, notes, dur, vol) => notes.forEach((m, i) => { voice(t, midi(m + 12), dur, { type: 'triangle', vol, att: 1.2, p: (i - 1) * 0.3, filt: 1300, vib: 8 }); });
  function bell(t, p = -0.8, vol = 0.045) { [1, 2.76, 5.4, 8.93].forEach((k, i) => voice(t, midi(62) * k, 5 - i, { vol: vol / (1 + i * 0.9), att: 0.004, p })); }
  function chirp(t, p) {   // a little bird: a few quick whistled slides, soft
    const n = 2 + Math.floor(Math.random() * 3), base = 2400 + Math.random() * 1200;
    for (let i = 0; i < n; i++) { const o = ac.createOscillator(), g = ac.createGain(), tt = t + i * 0.1; o.type = 'sine';
      o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.3), tt); o.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.3), tt + 0.07);
      g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.03, tt + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.09);
      o.connect(g).connect(out(p, 0.6)); o.start(tt); o.stop(tt + 0.12); }
  }
  const swish = (t, dur, { freq = 900, vol = 0.03, p = 0, sweep = 0 } = {}) => {   // soft air: leaves, water
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = 'lowpass'; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out(p, 0.5)); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  };
  // the river and the wind, very soft, always moving
  const bed = (freq, p) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'lowpass'; f.frequency.value = freq; g.gain.value = 0; s.connect(f).connect(g).connect(out(p, 0.3)); s.start(); return { s, f, g }; };
  const river = bed(700, -0.15), wind = bed(500, 0.3);
  const on = { sun: 0, river: 0, wind: 0, birds: 0, bell: 0, flowers: 0, song: 0, light: 0 };
  let next = 0, step = 0, timer = null, birds = [], life = 0.3, breathStep = -1;
  const bar = () => Math.floor(step / 8) % 4, chord = () => CHORDS[bar()];
  function schedule() {
    while (next < ac.currentTime + 0.2) {
      const t = next, e = step % 8, b = Math.floor(step / 8), pos = (step % 64) / 2, C = CHORDS[b % 4], vol = 0.6 + life * 0.4 + on.light * 0.2;
      if (e === 0) pad(t, C.slice(1), BEAT * 4.3, 0.016 * vol + on.sun * 0.008);                                   // the warm pad, always there
      if (on.sun && e === 0) piano(t, midi(C[0] + 12), 0.045 * vol, -0.1, 3.5);                                     // a low piano note each bar
      if (on.river) { const arp = [C[1], C[2], C[3], C[1] + 12, C[2] + 12, C[3] + 12, C[1] + 12, C[3]]; harp(t, midi(arp[e]), 0.022 * vol, -0.35 + e * 0.04); }   // harp ripples, like water
      if (on.wind) for (const [m, at, d] of MELODY) if (Math.abs(at - pos) < 0.01) piano(t, midi(m), 0.055 * vol, 0.05, Math.max(1.6, d * BEAT * 1.4));
      if (on.birds) { for (const [m, at, d] of FLUTE) if (Math.abs(at - pos) < 0.01) flute(t, midi(m), d * BEAT, 0.022 * vol); if (Math.random() < 0.12) { const p = birds.length ? birds[Math.floor(Math.random() * birds.length)] : 0.5; chirp(t + 0.1, p); } }
      if (on.bell) { if (e === 0) bass(t, midi(C[0] - 12), BEAT * 3.6); if (e === 0 && b % 2 === 0) bell(t + BEAT * 2, -0.8, 0.03 * vol); }
      if (on.flowers && (e % 2 === 1) && Math.random() < 0.45) musicBox(t, midi(C[1 + Math.floor(Math.random() * 3)] + 24), 0.016 * vol, 0.7);
      if (on.song && e === 0) choir(t, C.slice(1), BEAT * 4.4, 0.012 * vol);
      next += BEAT / 2; step++;
    }
    const tt = ac.currentTime, gust = 0.5 + 0.5 * Math.sin(tt * 0.45) * Math.sin(tt * 0.17 + 1);
    river.g.gain.setTargetAtTime(on.river * 0.035, tt, 0.6);
    wind.g.gain.setTargetAtTime(on.wind * (0.012 + gust * 0.03), tt, 0.6); wind.f.frequency.setTargetAtTime(380 + gust * 420, tt, 0.6);
  }
  return {
    on,
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 40); schedule(); master.gain.setTargetAtTime(1, ac.currentTime, 0.8); },
    // fill: how full the breath is (0..1); mode: 'in' | 'out' | 'rest'; w: how awake the world is (0..1)
    breathe(fill, mode, w) {
      life = w;
      // the harp climbs one note for every eighth of a breath in, and steps back down as you breathe out
      const k = Math.min(BREATH_NOTES.length - 1, Math.floor(fill * BREATH_NOTES.length - 0.001));
      if (mode === 'in' && k > breathStep && fill > 0.02) { breathStep = k; harp(ac.currentTime, BREATH_NOTES[k], 0.05, (k / 7 - 0.5) * 0.5); }
      else if (mode === 'out' && k < breathStep) { breathStep = k; harp(ac.currentTime, BREATH_NOTES[Math.max(0, k)], 0.03, (k / 7 - 0.5) * 0.5); }
      else if (mode === 'rest') breathStep = -1;
      if (mode === 'in' && fill <= 0.02 && breathStep < 0) { breathStep = 0; harp(ac.currentTime, BREATH_NOTES[0], 0.05, -0.25); }
    },
    wake(id) {
      const t = ac.currentTime + 0.05; on[id] = 1;
      const C = chord();
      if (id === 'sun') C.slice(1).concat([C[1] + 12]).forEach((m, i) => harp(t + i * 0.14, midi(m + 12), 0.04));
      if (id === 'bell') bell(t, -0.8, 0.055);
      if (id === 'birds') chirp(t, 0.5);
      if (id === 'light') { [50, 57, 62, 66, 69, 74, 78, 81, 86].forEach((m, i) => harp(t + i * 0.11, midi(m), 0.045, (i % 2 ? 0.4 : -0.4))); bell(t + 1.0, 0.6, 0.035); bell(t + 1.6, -0.6, 0.035); }
    },
    // touching something you've woken plays it (always in tune with the song)
    touch(id, p = 0) {
      const t = ac.currentTime + 0.01, C = chord(), r = () => C[1 + Math.floor(Math.random() * 3)];
      if (id === 'sun') C.slice(1).forEach((m, i) => harp(t + i * 0.07, midi(m + 12), 0.05, p));
      else if (id === 'river') { for (let i = 0; i < 3; i++) { const o = ac.createOscillator(), g = ac.createGain(), tt = t + i * 0.13, f = 500 + Math.random() * 400; o.type = 'sine'; o.frequency.setValueAtTime(f, tt); o.frequency.exponentialRampToValueAtTime(f * 2.2, tt + 0.08); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.06, tt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.16); o.connect(g).connect(out(p, 0.8)); o.start(tt); o.stop(tt + 0.2); } harp(t + 0.3, midi(r() + 12), 0.035, p); }
      else if (id === 'wind') { swish(t, 1.1, { freq: 2400, vol: 0.05, p, sweep: 700 }); piano(t + 0.1, midi(r() + 12), 0.045, p); }
      else if (id === 'birds') { chirp(t, p); flute(t + 0.2, midi(r() + 24), 1.2, 0.03, p); }
      else if (id === 'bell') bell(t, p, 0.06);
      else if (id === 'flowers') [0, 1, 2].forEach(i => musicBox(t + i * 0.12, midi(C[1 + i] + 24), 0.03, p));
      else if (id === 'song') choir(t, C.slice(1), 2.4, 0.025);
    },
    birdsAt(pans) { birds = pans; },
    soft() { harp(ac.currentTime, midi(62), 0.035); },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() {
      clearInterval(timer); timer = null; master.gain.setTargetAtTime(0, ac.currentTime, 0.3);
      setTimeout(() => { try { river.s.stop(); wind.s.stop(); master.disconnect(); } catch (e) {} }, 900);
    },
  };
}

/* ── the microphone: a slow breath out into the phone counts like holding the button (adapted from Harmonious Gathering) ── */
function breathMeter(ac, stream) {
  const src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.3; src.connect(an);
  const spec = new Float32Array(an.frequencyBinCount), hz = ac.sampleRate / an.fftSize, b0 = Math.max(1, Math.round(80 / hz)), b1 = Math.round(1500 / hz);
  let lvl = 0; const hist = [];
  return {
    read() {
      an.getFloatFrequencyData(spec);
      let sum = 0, logSum = 0, cnt = 0;
      for (let i = b0; i <= b1; i++) { const pw = Math.pow(10, spec[i] / 10) + 1e-14; sum += pw; logSum += Math.log(pw); cnt++; }
      const mean = sum / cnt, db = 10 * Math.log10(mean), flat = Math.exp(logSum / cnt) / mean;
      if (db > -110) { hist.push(db); if (hist.length > 360) hist.shift(); }
      if (hist.length < 8) return 0;
      const floor = [...hist].sort((a, b) => a - b)[Math.floor(hist.length * 0.1)];
      const raw = flat > 0.12 ? Math.max(0, Math.min(1, (db - floor - 6) / 30)) : 0;   // only breathy, noisy sound counts
      lvl += (raw - lvl) * (raw > lvl ? 0.5 : 0.15); return lvl;
    },
    stop() { try { src.disconnect(); } catch (e) {} stream.getTracks().forEach(t => t.stop()); },
  };
}

export function breatheBeautyGame() {
  let G = null;
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  function hud() {
    const n = G.woke, sense = SENSES[n - 1];
    const v = G.phase === 'in' ? (G.fill >= 1 ? 'Hold it…' : 'Breathe in…') : G.phase === 'out' ? 'Breathe out…' : G.phase === 'ready' ? 'Hold to breathe in' : G.phase === 'end' ? 'Inside the beauty' : 'Get comfortable';
    G.ui.panel(n >= SENSES.length ? 'Every breath' : `Breath ${Math.min(n + 1, SENSES.length)} of ${SENSES.length}`, v, { segs: [n, SENSES.length], sub: sense ? 'Just woke up: ' + sense.name : 'The world is asleep' });
  }
  function ready() { G.phase = 'ready'; G.idle = 0; G.say(LINES.in); hud(); }
  // the awake things you can touch: [key, u, v, how close counts]
  function targets() {
    const on = G.band.on || {}, out = [], uv = t => [t.group.position.x + 0.5, 0.5 - t.group.position.y / G.h];
    if (on.sun) out.push(['sun', ...CEN, 0.13]);
    if (on.river) G.things.river.forEach(t => out.push(['river', ...uv(t), 0.07]));
    if (on.wind) G.things.wind.forEach(t => out.push(['wind', ...uv(t), 0.12]));
    if (on.birds) G.things.birds.forEach(t => out.push(['birds', ...uv(t), 0.09]));
    if (on.bell) out.push(['bell', 0.09, 0.62, 0.09]);
    if (on.flowers) { out.push(['flowers', 0.84, 0.82, 0.1]); G.things.flowers.forEach(t => out.push(['flowers', ...uv(t), 0.05])); }
    if (on.song) [[0.38, 0.22], [0.6, 0.27], [0.5, 0.15]].forEach(p => out.push(['song', ...p, 0.1]));
    return out;
  }
  function hitAt(u, v) { let best = null, bd = 1e9; for (const [k, x, y, r] of targets()) { const d = Math.hypot(u - x, v - y); if (d < r && d < bd) { bd = d; best = [k, x, y]; } } return best; }
  const COLORS = { sun: '#ffe2a0', river: '#cfeaff', wind: '#f2a24a', birds: '#ffe9c8', bell: '#ffd36a', flowers: '#ffc0c8', song: '#fff0b0' };
  function touchThing(k, [u, v]) {
    if (G.lastTouch && G.lastTouch.k === k && G.t - G.lastTouch.t < 0.45) return;   // sliding plays each thing once as you pass over it
    G.lastTouch = { k, t: G.t }; G.touches = (G.touches || 0) + 1;
    G.band.touch(k, Math.max(-1, Math.min(1, (u - 0.5) * 1.8)));
    const [x, y] = G.S.P(u, v); G.fx.add(x, y, COLORS[k], 14, 0.18);
    const s = K.sprite(K.ringTex, 0.05, { color: COLORS[k], additive: true, opacity: 0.8, order: 26 }); s.position.set(x, y, 0.072); G.root.add(s); G.pulses.push({ s, t: 0 });
    if (k === 'wind') G.shake.wind = 1; if (k === 'bell') G.shake.bell = 1;
    G.buzz(12);
  }
  function press(on) { G.holdIn = on; }

  // the props for each breath (all hidden until their breath wakes them)
  function buildThings() {
    const T = G.things = {};
    const put = (key, id, [u, v], size, z = 0.05) => { const t = thing(id, size), [x, y] = G.S.P(u, v); t.group.position.set(x, y, z); t.home = [x, y]; G.root.add(t.group); (T[key] = T[key] || []).push(t); return t; };
    put('sun', 'sun', CEN, 0.4, 0.06);
    G.ring = thing('ring', 0.3); { const [x, y] = G.S.P(...CEN); G.ring.group.position.set(x, y, 0.07); } G.root.add(G.ring.group);
    [[0.45, 0.74], [0.5, 0.8], [0.4, 0.84], [0.54, 0.87], [0.33, 0.89], [0.47, 0.91], [0.56, 0.82]].forEach((p, i) => { const t = put('river', 'sparkle', p, 0.05); t.group.userData.ph = i * 1.7; });
    put('wind', 'tree', [0.88, 0.78], 0.27); put('wind', 'tree', [0.11, 0.86], 0.23);
    for (let i = 0; i < 3; i++) { const t = put('birds', 'bird', [0.6 + i * 0.12, 0.12 + (i % 2) * 0.06], 0.14 - i * 0.02, 0.065); t.fly = { sp: 0.05 + i * 0.012, ph: i * 0.37, v: 0.1 + i * 0.045 }; }
    put('bell', 'bell', [0.09, 0.6], 0.13);
    for (let i = 0; i < 9; i++) { const t = put('flowers', 'petal', [0.82, 0.84], 0.042 + (i % 3) * 0.008, 0.065); t.group.userData.ph = i * 0.9; t.drift = { ph: i / 9, sp: 0.06 + (i % 4) * 0.012 }; }
    [[0.38, 0.22], [0.6, 0.27], [0.5, 0.15]].forEach((p, i) => { const t = put('song', 'song', p, 0.2 - i * 0.03, 0.065); t.rise = { ph: i / 3 }; });
    G.op = Object.fromEntries(Object.keys(T).map(k => [k, 0]));
    // motes of light that float slowly around the sun, more and brighter as the world wakes; breathing in draws them toward the light
    G.motes = Array.from({ length: 46 }, (_, i) => { const s = K.sprite(K.dotTex, 0.008 + (i % 5) * 0.003, { color: ['#fff3d0', '#ffd9a0', '#fffaf0'][i % 3], additive: true, opacity: 0, order: 24 });
      s.position.z = 0.068; G.root.add(s); return { s, a: Math.random() * Math.PI * 2, r: 0.08 + Math.random() * 0.4, sp: 0.03 + Math.random() * 0.05, ph: Math.random() * 9, rise: Math.random() }; });
    G.pulses = []; G.shake = { wind: 0, bell: 0 };
  }

  return {
    title: LINES.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', woke: 0, fill: 0, holdIn: false, btn: false, hold: false, life: 0.3, sun: 0, river: 0, wind: 0, bloom: 0, idle: 0, outT: 0, endT: 0, t0: 0, short: 0, botT: 0, micOK: false, micNo: false });
      G.u = { map: { value: null }, uRiverM: { value: maskTex(RIVER, 4) }, uT: { value: 0 }, uBreath: { value: 0 }, uLife: { value: G.life }, uSun: { value: 0 }, uRiver: { value: 0 }, uWind: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uC: { value: new THREE.Vector2(...CEN) } };
      G.world = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.u, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.world.position.z = 0.03; G.world.renderOrder = 12; G.root.add(G.world);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.u.map.value = t; G.ready = true; });
      buildThings();
      G.band = K.audio() ? soundscape(K.audio()) : new Proxy({ on: {} }, { get: (o, k) => (k in o ? o[k] : () => {}) });
      if (!G.bot && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
          .then(st => { if (!G) { st.getTracks().forEach(t => t.stop()); return; } G.mic = breathMeter(K.audio(), st); G.micOK = true; })
          .catch(() => { if (G) G.micNo = true; });
      }
      G.btn = (G.ui.buttons([{ label: 'Hold to breathe', kind: 'red', aria: 'Hold to breathe in, let go to breathe out', press: () => press(true), release: () => press(false) }]) || [])[0];
      if (G.btn) { G.btn.style.borderColor = '#fff'; G.btn.style.minHeight = '84px'; }   // one big button: easy to find and hold
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); G.phase = 'settle'; G.outT = G.bot ? 0.5 : 4; hud(); };
      K.intro(G, { title: LINES.title, how: LINES.how, say: `${LINES.title}. ${LINES.how}` });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.u.uA.value += ((G.ready && !G.over ? 1 : 0) - G.u.uA.value) * Math.min(1, dt * 2);
      G.u.uT.value = G.t;
      // are you breathing in? (the button, a finger on the screen, a breath into the mic, or the bot)
      let mic = G.mic ? G.mic.read() : 0;
      if (G.bot && G.playing) {
        G.botT += dt;
        if (G.phase === 'ready' && G.botT > 0.6) { G.holdIn = true; G.botT = 0; }
        if (G.phase === 'in' && G.fill >= 0.95 && G.botT > 0.3) { G.holdIn = false; G.botT = 0; }
      }
      const inhaling = G.holdIn || G.hold || mic > 0.2;
      if (G.phase === 'settle') { if (inhaling) { G.phase = 'in'; G.say(''); hud(); } else { G.outT -= dt; if (G.outT <= 0) ready(); } }   // pressing right after the countdown starts the first breath at once
      else if (G.phase === 'ready') {
        if (inhaling) { G.phase = 'in'; hud(); }
        else { G.idle += dt; if (G.idle > (G.bot ? 99 : 10)) { G.idle = 0; G.say(LINES.remind); } }
      } else if (G.phase === 'in') {
        G.fill = Math.min(1, G.fill + dt / IN);
        if (G.fill >= 1 && !G.full) { G.full = true; hud(); }
        if (!inhaling) {
          G.full = false;
          if (G.fill < OK) { G.phase = 'ready'; G.idle = 0; G.say(LINES.longer); G.band.soft(); G.short++; hud(); }
          else {
            // a full breath: breathe out, and the next part of the world wakes up
            const s = SENSES[G.woke]; G.woke++; G.phase = 'out'; G.outT = G.bot ? 1.4 : OUT + 1.6; G.outFrom = G.fill;
            G.band.wake(s.id); G.say(`${LINES.out} ${s.say}` + (G.woke === 1 ? ` ${LINES.touch}` : ''));
            G.ui.alert(s.name, s.say.split('. ').slice(1).join('. ') || 'Breathe out…', 2.6, 'black');
            const [x, y] = G.S.P(...s.at); G.fx.add(x, y, '#ffe2a0', 22, 0.25);
            if (s.id === 'sun') G.buzz([30, 70, 30]);   // just a soft touch of warmth
            hud();
          }
        }
      } else if (G.phase === 'out') {
        G.fill = Math.max(0, G.fill - dt / OUT * Math.max(0.4, G.outFrom));
        G.outT -= dt;
        if (G.outT <= 0) { if (G.woke >= SENSES.length) { G.phase = 'end'; G.endT = 0; G.ui.buttons([]); G.btn = null; G.holdIn = false; hud(); } else ready(); }
      }
      if (G.phase === 'ready' || G.phase === 'settle') G.fill = Math.max(0, G.fill - dt * 0.8);
      // the world comes back to life, breath by breath
      const n = G.woke, on = G.band.on || {};
      G.life += ((0.3 + 0.7 * n / SENSES.length) - G.life) * Math.min(1, dt * 0.7);
      G.sun += ((on.sun ? 1 : 0) + (on.light ? 1.2 : 0) - G.sun) * Math.min(1, dt * 0.8);
      G.river += ((on.river ? 1 : 0) - G.river) * Math.min(1, dt * 0.6);
      G.wind += ((on.wind ? 1 : 0) - G.wind) * Math.min(1, dt * 0.6);
      const breathe = G.phase === 'end' ? 0.5 + 0.5 * Math.sin(G.t * 0.8) : G.fill;
      G.u.uBreath.value = breathe; G.u.uLife.value = G.life; G.u.uSun.value = G.sun; G.u.uRiver.value = G.river; G.u.uWind.value = G.wind;
      G.band.breathe(G.fill, G.phase === 'in' ? 'in' : G.phase === 'out' ? 'out' : 'rest', G.life);
      // the breath ring around the sun: grows as you breathe in, shrinks as you breathe out
      const rs = 0.16 + breathe * 0.26; G.ring.group.scale.set(rs / 0.3, rs / 0.3, 1);
      G.ring.opacity(G.over ? 0 : G.phase === 'intro' ? 0.25 : 0.35 + breathe * 0.6 + (G.phase === 'ready' ? 0.15 * Math.sin(G.t * 3) : 0)); G.ring.tick(G.t, dt);
      if (G.btn) G.btn.style.background = `linear-gradient(90deg, #7d1606 ${Math.round(G.fill * 100)}%, #ec3013 ${Math.round(G.fill * 100)}%)`;
      // each part of the world fades in when it wakes, and moves
      for (const [k, list] of Object.entries(G.things)) {
        const want = k === 'sun' ? (on.sun ? 0.22 + breathe * 0.16 + (on.light ? 0.2 : 0) : 0) : on[k] ? 1 : 0;
        G.op[k] += (want - G.op[k]) * Math.min(1, dt * 1.2);
        list.forEach((t, i) => {
          if (t.fly) {   // birds glide across the sky from left to right and around again
            const k2 = (G.t * t.fly.sp + t.fly.ph) % 1, u = -0.1 + k2 * 1.2, [x, y] = G.S.P(u, t.fly.v + Math.sin(G.t * 0.8 + i) * 0.02);
            t.group.position.x = x; t.group.userData.y = y; t.group.position.y = y; t.opacity(G.op[k] * Math.min(1, k2 * 8, (1 - k2) * 8));
          } else if (t.drift) {   // petals drift up and left on the air
            const k2 = (G.t * t.drift.sp + t.drift.ph) % 1, [x, y] = G.S.P(0.86 - k2 * 0.5, 0.86 - k2 * 0.35 + Math.sin(G.t * 1.3 + i) * 0.02);
            t.group.position.x = x; t.group.position.y = y; t.opacity(G.op[k] * Math.min(1, k2 * 6, (1 - k2) * 4));
          } else if (t.rise) {    // song ribbons rise slowly from the figures and fade
            const k2 = (G.t * 0.12 + t.rise.ph) % 1; t.group.position.y = t.home[1] + k2 * 0.08; t.opacity(G.op[k] * Math.sin(k2 * Math.PI) * 0.9);
          } else t.opacity(G.op[k] * (k === 'river' ? 0.9 : 1));
          t.tick(G.t, dt);
        });
      }
      for (const m of G.motes) {
        m.a += dt * m.sp * (1 + breathe * 1.5); m.r += (G.phase === 'in' ? -0.02 : 0.004) * dt; if (m.r < 0.05) m.r = 0.45; if (m.r > 0.48) m.r = 0.08;
        const [x, y] = G.S.P(CEN[0] + Math.cos(m.a) * m.r, CEN[1] + Math.sin(m.a) * m.r * 0.9 - Math.sin(G.t * 0.3 + m.ph) * 0.02);
        m.s.position.x = x; m.s.position.y = y; m.s.material.opacity = (0.12 + G.life * 0.7) * (0.5 + 0.5 * Math.sin(G.t * 1.7 + m.ph)) * (G.over ? 0.4 : 1);
      }
      // what you touched: rings of light spread out from it, the bell swings, the trees shake
      for (let i = G.pulses.length - 1; i >= 0; i--) { const q = G.pulses[i]; q.t += dt; const k = q.t / 0.9; q.s.scale.set(0.04 + k * 0.16, 0.04 + k * 0.16, 1); q.s.material.opacity = Math.max(0, 0.8 * (1 - k)); if (k >= 1) { G.root.remove(q.s); q.s.material.dispose(); G.pulses.splice(i, 1); } }
      G.shake.wind = Math.max(0, G.shake.wind - dt * 1.2); G.shake.bell = Math.max(0, G.shake.bell - dt * 0.5);
      for (const t of G.things.wind) t.group.rotation.z = Math.sin(G.t * 22) * 0.06 * G.shake.wind;
      for (const t of G.things.bell) t.group.userData.swing = 1 + G.shake.bell * 4;
      if (G.bot && G.phase === 'out' && G.botTouched !== G.woke) { G.botTouched = G.woke; const k = SENSES[G.woke - 1].id; if (k !== 'light') touchThing(k, SENSES[G.woke - 1].at); }
      if (G.band.birdsAt && G.things.birds) G.band.birdsAt(G.things.birds.map(b => Math.max(-1, Math.min(1, b.group.position.x * 1.8))));
      if (G.phase === 'ready' || G.phase === 'in' || G.phase === 'out') { G.hudT = (G.hudT || 0) - dt; if (G.hudT <= 0) { G.hudT = 0.4; hud(); } }
      // the end: the light opens, Deborah speaks, then the finale
      if (G.phase === 'end') {
        G.endT += dt;
        if (G.endT > (G.bot ? 0.5 : 4) && !G.clipStarted) {
          G.clipStarted = true; G.say(LINES.deborah); G.band.volume(0.45);
          const a = new Audio((G.work && G.work.statementAudio) || CLIP); G.clip = a; a.preload = 'auto';   // (a page can hand in its own copy of the clip)
          G.ui.alert('Deborah Tramentozzi', 'In her own words', 14, 'black');
          const done = () => { if (G && !G.over && !G.clipDone) { G.clipDone = true; G.finT = G.endT; } };
          a.addEventListener('ended', done); a.addEventListener('error', done);
          setTimeout(() => { if (G && G.clip === a) a.play().catch(done); }, G.bot ? 0 : 1400);
          G.clipCap = G.endT + (G.bot ? 2 : 20);   // never wait forever
        }
        if (G.clipStarted && !G.clipDone && G.endT > G.clipCap) { G.clipDone = true; G.finT = G.endT; }
        if (G.clipDone && !G.over && G.endT > G.finT + 0.8) {
          if (G.mic) { G.mic.stop(); G.mic = null; }
          if (G.clip) { G.clip.pause(); } G.ui.hideAlert();
          G.band.volume(0.8);
          const t = Math.round(G.t - G.t0);
          K.finale(G, { won: true, kicker: 'Beautiful', title: LINES.end, line: G.work && G.work.quote, say: LINES.end + '.',   // (Deborah has just said her words herself: they aren't read out again)
            cells: [{ k: 'Breaths', v: `${SENSES.length}/${SENSES.length}` }, { k: 'Awake', v: SENSES.length - 1 }, { k: 'Time', v: fmt(t) }] });
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      // touch something you've woken to play it (slide across the painting to find them); hold anywhere else to breathe in
      const b = (kind === 'down' || (kind === 'move' && G.ptr && !G.hold)) ? G.S.toBoard(ev, G.root) : null, hit = b && hitAt(b.u, b.v);
      if (kind === 'down') { G.ptr = true; if (hit) touchThing(hit[0], [hit[1], hit[2]]); else G.hold = true; }
      else if (kind === 'move') { if (hit) touchThing(hit[0], [hit[1], hit[2]]); }
      else if (kind === 'up') { G.ptr = false; G.hold = false; }
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); if (G.clip) G.clip.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(G.over ? 0.8 : 1); if (G.clip && G.clipStarted && !G.clipDone) G.clip.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'breathe', phase: G.phase, playing: G.playing, over: G.over, woke: G.woke, fill: +G.fill.toFixed(2), life: +G.life.toFixed(2), short: G.short, touches: G.touches || 0, mic: G.micOK, t: +G.t.toFixed(1) }; },
    stop() { if (G) { if (G.mic) G.mic.stop(); if (G.clip) { G.clip.pause(); G.clip = null; } G.band && G.band.stop && G.band.stop(); } K.cleanup(G); G = null; },
  };
}
