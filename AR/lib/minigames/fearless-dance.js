// FEARLESS REQUEST (Wayne Pearcy): ROBOT DANCE PARTY.
// The big robot is a puppet: his head, both arms and the lantern move, his legs bend and step, and he dances to a
// funk band made right here in the browser. Move your phone and he dances; the more you move, the more he grooves
// (and the more the band plays). Every two bars he calls a move and shows it: LEAN LEFT, LEAN RIGHT (tilt the phone),
// BOUNCE (pump it up and down), WIGGLE (shake it), FREEZE (hold still: the music stops too). The sky is a club:
// coloured beams sweep and pulse on the beat, they follow the way you tilt the phone, the colours change every bar,
// and a mirror ball throws sparkles across the stars. Every cue is spoken and has its own sound, so it plays by ear.
// No motion sensor? The buttons (and tapping the screen) work too.
// Art: media/games/fearless/ — stage.jpg (the painting with the robot taken out), and his parts cut out:
// body.png, head.png, armL.png (the arm holding the lantern), lant.png (the lantern), armR.png.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/fearless/';
// where each cut-out part sits in the painting: [u0, v0, u1, v1]
const BOX = {
  body: [0.4561, 0.1729, 0.9531, 0.9307], head: [0.4629, 0.0283, 0.7451, 0.3232], armR: [0.7168, 0.2773, 0.8838, 0.7061],
  armL: [0.4551, 0.4297, 0.5635, 0.6191], lant: [0.4141, 0.5732, 0.5088, 0.7002],
};
const FEET = { u: 0.665, v: 0.885 }, HIP_V = 0.52;                        // he stands here; his legs end at the hip
const NECK = { u: 0.585, v: 0.30 }, SHOULDER = { u: 0.765, v: 0.32 }, ELBOW = { u: 0.545, v: 0.46 }, HAND = { u: 0.468, v: 0.578 };
const EYES = [{ u: 0.525, v: 0.223 }, { u: 0.603, v: 0.207 }], LAMP = { u: 0.455, v: 0.645 };
const BPM = 112, BEAT = 60 / BPM, BAR = BEAT * 4;
const WARM = 2, SLOT = 2;                                                 // bars before the first move; bars per move
const MOVES = {
  L: { word: 'Lean left', icon: '◀', say: 'Lean left!', how: 'Tilt your phone to the left' },
  R: { word: 'Lean right', icon: '▶', say: 'Lean right!', how: 'Tilt your phone to the right' },
  B: { word: 'Bounce', icon: '↕', say: 'Bounce!', how: 'Pump your phone up and down' },
  W: { word: 'Wiggle', icon: '〰', say: 'Wiggle!', how: 'Shake it all about' },
  F: { word: 'Freeze!', icon: '✋', say: 'Freeze!', how: 'Hold your phone still' },
  A: { word: 'Arms up!', icon: '🙌', say: 'Arms up! Big finish!', how: 'Move everything!' },
};
const ROUTINE = ['L', 'R', 'B', 'W', 'R', 'L', 'B', 'F', 'L', 'R', 'W', 'B', 'R', 'L', 'F', 'W'];
const PRAISE = ['Groovy!', 'Funky!', 'Smooth!', 'Robot approved!', 'Fearless!', 'Electric!', 'Yes!'];
const END_BAR = WARM + ROUTINE.length * SLOT + 2;                         // two bars of "arms up", then the finale

/* ───────────────────────── the funk band (all WebAudio, no files) ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
// Am9 for a bar, D9 for a bar: a dorian vamp
const CH = [{ root: 45, stab: [60, 64, 67, 71], pad: [57, 60, 64, 67, 71] }, { root: 50, stab: [57, 60, 64, 66], pad: [54, 57, 60, 64, 69] }];
const BASS = [[0, 0, 2], [3, 0, 1], [6, 12, 1], [7, 10, 1], [10, 0, 2], [12, 3, 1], [14, 5, 1], [15, 7, 1]];   // [16th, semitones, length]
const STABS = [3, 6, 11, 14];

function funk(ac, moveAt) {
  const S16 = BEAT / 4;
  const out = ac.createGain(); out.gain.value = 0;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.18;
  out.connect(comp).connect(ac.destination);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 16000; lp.Q.value = 0.8; lp.connect(out);   // FREEZE pulls this down
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const env = (g, t, peak, dur, att = 0.004) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); };
  function noise(t, dur, { freq = 6000, type = 'highpass', q = 0.7, vol = 0.05, pan = 0, sweep = 0, dest = lp } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    env(g, t, vol, dur, 0.002); s.connect(f).connect(g);
    if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p).connect(dest); } else g.connect(dest);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function osc(t, f, dur, { type = 'sine', vol = 0.1, slide = 0, att = 0.004, dest = lp, filt = 0, q = 1, fType = 'lowpass', fEnd = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur * 0.6);
    env(g, t, vol, dur, att);
    if (filt) { const fl = ac.createBiquadFilter(); fl.type = fType; fl.Q.value = q; fl.frequency.setValueAtTime(filt, t); if (fEnd) fl.frequency.exponentialRampToValueAtTime(fEnd, t + dur); o.connect(fl).connect(g); } else o.connect(g);
    g.connect(dest); o.start(t); o.stop(t + dur + 0.03);
  }
  const kick = (t, v = 1) => { osc(t, 150, 0.38, { vol: 0.55 * v, slide: 44, att: 0.003 }); noise(t, 0.02, { freq: 3000, type: 'bandpass', vol: 0.05 * v }); };
  const clap = (t, v = 1) => { for (let i = 0; i < 3; i++) noise(t + i * 0.011, i === 2 ? 0.18 : 0.03, { freq: 1300, type: 'bandpass', q: 0.9, vol: 0.2 * v }); osc(t, 210, 0.08, { type: 'triangle', vol: 0.05 * v }); };
  const hat = (t, v, open, dest = lp) => noise(t, open ? 0.24 : 0.04, { freq: open ? 7000 : 8500, vol: v, pan: 0.2, dest });
  const bass = (t, m, dur, E) => {
    osc(t, midi(m), dur, { type: 'sawtooth', vol: 0.16, filt: 380 + 2200 * E, fEnd: 220, q: 7, att: 0.006 });
    osc(t, midi(m - 12), dur, { type: 'square', vol: 0.06, filt: 300, att: 0.006 });
  };
  const stab = (t, notes, v) => notes.forEach((m, i) => { osc(t, midi(m) * (1 + (i % 2 ? 0.003 : -0.003)), 0.13, { type: 'square', vol: 0.024 * v, filt: 1700, fType: 'bandpass', q: 1.4 }); });
  const pad = (t, notes, dur, v = 1) => notes.forEach(m => osc(t, midi(m), dur, { type: 'triangle', vol: 0.022 * v, att: 0.35, filt: 1400 }));
  const arp = (t, m) => osc(t, midi(m), 0.12, { type: 'square', vol: 0.03, filt: 2600, fEnd: 900, q: 3 });
  const crash = t => noise(t, 1.6, { freq: 4500, vol: 0.12, dest: out });
  const scratch = t => { noise(t, 0.16, { freq: 3200, type: 'bandpass', q: 3, sweep: 500, vol: 0.35, dest: out }); noise(t + 0.17, 0.12, { freq: 600, type: 'bandpass', q: 3, sweep: 2600, vol: 0.25, dest: out }); };

  const st = { E: 0.3, combo: 0, next: 0, step: 0, timer: null, t0: 0, frozen: false, done: false };
  function schedule() {
    while (st.next < ac.currentTime + 0.12) {
      const t = st.next, s = st.step % 16, bar = Math.floor(st.step / 16), ch = CH[bar % 2], E = st.E, mv = moveAt(bar);
      const sw = s % 2 ? S16 * 0.16 : 0;                                    // a little swing on the off 16ths
      if (bar >= END_BAR) {                                                 // the last hit
        if (!st.done) { st.done = true; kick(t); crash(t); pad(t, CH[0].pad, 2.6, 1.6); bass(t, 33, 1.4, 0.5); }
        st.next += S16; st.step++; continue;
      }
      if (mv === 'F') {                                                     // FREEZE: the band stops, only a ticking hat keeps time
        if (!st.frozen) { st.frozen = true; scratch(t); lp.frequency.setTargetAtTime(500, t, 0.08); }
        if (s === 0) pad(t, ch.pad, BAR, 1.5);
        if (s % 4 === 0) hat(t, 0.03, false, out);                       // (the tick skips the muffled filter)
      } else {
        if (st.frozen) { st.frozen = false; crash(t); kick(t, 1.1); lp.frequency.setTargetAtTime(16000, t, 0.05); }
        const four = E > 0.6 || mv === 'A';
        if (s === 0 || s === 8 || (four && s % 4 === 0) || (E > 0.3 && s === 10)) kick(t);
        if (s === 4 || s === 12) clap(t);
        if (bar % 2 === 1 && s >= 13 && E > 0.5) clap(t + sw, 0.35);       // a little fill into the next move
        if (s % 2 === 0) hat(t, 0.045, false); else if (E > 0.4) hat(t + sw, 0.025, false);
        if (s === 6 || s === 14) { if (E > 0.25) hat(t, 0.03, true); }
        for (const [at, semi, len] of BASS) if (at === s) bass(t + sw, ch.root + semi, len * S16 * 0.95, E);
        if (E > 0.3 && STABS.includes(s)) stab(t + sw, ch.stab, 0.6 + E * 0.6);
        if (E > 0.72 || st.combo >= 3 || mv === 'A') arp(t + sw, ch.stab[[0, 1, 2, 3, 2, 1, 3, 1][s % 8]] + 12);
        if (s === 0 && E < 0.35) pad(t, ch.pad, BAR, 0.7);
        if (s === 0 && bar === END_BAR - 2) crash(t);
      }
      st.next += S16; st.step++;
    }
  }
  return {
    st, scratch, crash,
    start(t0) { st.t0 = t0; st.next = t0; st.step = 0; st.timer = setInterval(schedule, 25); schedule(); out.gain.setTargetAtTime(0.75, ac.currentTime, 0.05); },
    duck(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { clearInterval(st.timer); st.timer = null; out.gain.setTargetAtTime(0, ac.currentTime, 0.4); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 2500); },
  };
}

/* ───────────────────────── shaders ───────────────────────── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// his body bends: knees squash, feet step, hips sway, the top shimmies, the whole robot leans from the feet
const BODY_VERT = `
varying vec2 vUv;
uniform float uSq, uSway, uShim, uLean, uStepL, uStepR, uHip;
void main(){
  vUv = uv; vec2 p = position.xy; float y0 = p.y;
  float legL = 1.0 - smoothstep(-0.015, 0.025, p.x), low = 1.0 - smoothstep(0.0, uHip * 0.85, y0);
  p.y += (uStepL * legL + uStepR * (1.0 - legL)) * low;
  p.y -= uSq * min(y0, uHip);
  p.x += uSway * smoothstep(0.0, uHip, y0) + uShim * smoothstep(uHip * 0.85, uHip * 1.5, y0);
  float c = cos(uLean), s = sin(uLean);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(c * p.x - s * p.y, s * p.x + c * p.y, position.z, 1.0);
}`;
// his parts, lit by the club lights
const PART_FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uA, uTintA, uFlash; uniform vec3 uTint;
void main(){
  vec4 c = texture2D(map, vUv);
  vec3 col = c.rgb * (1.0 - 0.2 * uTintA) + uTint * uTintA * (c.rgb * 1.4 + 0.04) + c.rgb * uFlash * 0.35;
  gl_FragColor = vec4(col, c.a * uA);
}`;
// the stage: the painting without him, the lights down, beams, mirror-ball sparkles, a pool of light on the floor
const STAGE_FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uBeat, uE, uHue, uRoll, uClub, uFreeze, uFlash, uA, uH, uBall;
vec3 hsv(float h, float s, float v){ vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); return v * mix(vec3(1.0), k, s); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 c = texture2D(map, vUv).rgb;
  vec2 p = vec2(vUv.x, (1.0 - vUv.y) * uH);
  float on = uClub * (1.0 - uFreeze * 0.8);
  c *= 1.0 - 0.36 * uClub;
  vec3 add = vec3(0.0);
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 o = vec2(0.08 + fi * 0.28, -0.05);
    float a = sin(uT * (0.5 + 0.17 * fi) + fi * 1.9) * 0.5 + uRoll;
    vec2 r = p - o; float along = r.x * sin(a) + r.y * cos(a), perp = abs(r.x * cos(a) - r.y * sin(a));
    float w = 0.01 + along * 0.1;
    add += hsv(uHue + fi * 0.21, 0.8, 1.0) * (1.0 - smoothstep(w * 0.35, w, perp)) * step(0.0, along) * exp(-along * 1.0);
  }
  add *= (0.3 + 0.7 * uBeat) * (0.45 + 0.55 * uE) * on * 0.6;
  vec2 q = p * 15.0 + vec2(uBall, 0.0), cell = floor(q), f = fract(q) - 0.5;
  float h1 = hash(cell), d = length(f - (vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5) * 0.6);
  add += hsv(uHue + h1, 0.35, 1.0) * (1.0 - smoothstep(0.03, 0.085, d)) * step(0.6, h1) * (1.0 - smoothstep(0.55 * uH, 0.8 * uH, p.y)) * on * (0.3 + 0.45 * uE) * (0.6 + 0.4 * uBeat);
  vec2 fl = (p - vec2(0.665, 0.885 * uH)) / vec2(0.24, 0.055);
  add += hsv(uHue + 0.5, 0.75, 1.0) * exp(-dot(fl, fl) * 1.4) * (0.2 + 0.5 * uBeat) * on;
  add += hsv(uHue + 0.33, 0.6, 1.0) * 0.07 * uBeat * on + vec3(uFlash * 0.16 * uClub);
  float g = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(c, vec3(g) * vec3(0.72, 0.85, 1.15), uFreeze * 0.65);
  gl_FragColor = vec4(c + add * (0.55 + c * 1.6), uA);
}`;

const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export function robotDanceGame() {
  let G = null;
  const clock = () => { const ac = K.audio(); return ac ? ac.currentTime : performance.now() / 1000; };
  const L = (pt) => [pt.u - FEET.u, (FEET.v - pt.v) * G.h];                // painting point → robot space (feet at 0,0)

  // the same bend as BODY_VERT, on the CPU, so his head and arms stay attached
  function bend(x, y) {
    const D = G.pz, hip = (FEET.v - HIP_V) * G.h, y0 = y;
    const legL = 1 - sstep(-0.015, 0.025, x), low = 1 - sstep(0, hip * 0.85, y0);
    y += (D.stepL * legL + D.stepR * (1 - legL)) * low;
    y -= D.sq * Math.min(y0, hip);
    x += D.sway * sstep(0, hip, y0) + D.shim * sstep(hip * 0.85, hip * 1.5, y0);
    const c = Math.cos(D.lean), s = Math.sin(D.lean);
    return [c * x - s * y, s * x + c * y];
  }

  /* ── phone motion: tilt (lean), how much you move (energy), pumps (bounces) ── */
  function sensors() {
    const M = G.mot = { ok: false, g: [0, 0, 0], s: 0, roll: 0, e: 0, peaks: 0, lastPeak: 0, n: 0 };
    const on = (ev) => {
      const a = ev.accelerationIncludingGravity; if (!a || a.x == null) return;
      M.ok = true; M.n++;
      const ang = (((screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0) * Math.PI) / 180, ca = Math.cos(ang), sa = Math.sin(ang);
      const x = a.x * ca - a.y * sa, y = a.x * sa + a.y * ca, z = a.z || 0, k = M.n < 4 ? 1 : 0.15;
      M.g[0] += (x - M.g[0]) * k; M.g[1] += (y - M.g[1]) * k; M.g[2] += (z - M.g[2]) * k;
      const [gx, gy, gz] = M.g;
      // iPhones and Androids report gravity with opposite signs: find which way "up" is from how the phone is held
      if (Math.abs(gy) > 6) M.s = Math.sign(gy); else if (!M.s && Math.abs(gz) > 6) M.s = Math.sign(gz);
      M.roll = (Math.atan2(-(M.s || 1) * gx, Math.hypot(gy, gz)) * 180) / Math.PI;   // + = tilted right
      let lx, ly, lz; const la = ev.acceleration;
      if (la && la.x != null) { lx = la.x; ly = la.y; lz = la.z || 0; } else { lx = x - gx; ly = y - gy; lz = z - gz; }
      const lin = Math.hypot(lx, ly, lz), r = ev.rotationRate, rot = r ? Math.hypot(r.alpha || 0, r.beta || 0, r.gamma || 0) : 0;
      const raw = Math.min(1.3, Math.max(0, (lin - 0.35) / 4.5 + rot / 420));
      M.e += (raw - M.e) * (raw > M.e ? 0.35 : 0.04);
      const now = performance.now() / 1000;
      if (lin > 3.4 && now - M.lastPeak > 0.22) { M.lastPeak = now; M.peaks++; }
    };
    addEventListener('devicemotion', on);
    G.offMotion = () => removeEventListener('devicemotion', on);
    try { const D = window.DeviceMotionEvent; if (D && typeof D.requestPermission === 'function') D.requestPermission().catch(() => {}); } catch (e) {}   // iPhone: must be asked inside the tap
  }
  function input(dt) {
    const M = G.mot, I = G.in;
    I.btnE = Math.max(0, I.btnE - dt * 0.9);
    if (G.bot) {                                                             // the robot player does what it's told
      const mv = G.move || 'W', ph = G.t % 0.45 < dt;
      I.roll = mv === 'L' ? -26 : mv === 'R' ? 26 : 0;
      I.e = mv === 'F' ? 0 : mv === 'W' || mv === 'A' ? 0.85 : 0.6;
      if (ph && (mv === 'B' || mv === 'W' || mv === 'A')) I.peaks++;
      return;
    }
    I.roll = (M.ok ? M.roll : 0) + I.btnRoll;
    I.e = Math.min(1, Math.max(M.e, I.btnE, I.btnRoll ? 0.3 : 0));
    I.peaks = M.peaks + I.btnPeaks;
  }
  const tapBounce = () => { const I = G.in; I.btnPeaks++; I.btnE = Math.min(1, I.btnE + 0.35); };

  /* ── the dance: what his body does for each move (b = beats, amp = how hard he's dancing) ── */
  function pose(mv, b, amp) {
    const P = {}, s1 = Math.sin(Math.PI * b), s2 = Math.sin(2 * Math.PI * b), dn = Math.pow(0.5 + 0.5 * Math.cos(2 * Math.PI * b), 2);
    P.sq = 0.05 * amp * dn; P.sway = 0.022 * amp * s1; P.shim = 0; P.lean = 0.045 * amp * s1; P.hop = 0;
    P.head = 0.1 * amp * Math.sin(Math.PI * b + 0.6); P.hb = -0.006 * amp * dn;
    P.armR = 0.25 + 0.4 * amp * (0.5 + 0.5 * s2); P.armL = -(0.15 + 0.35 * amp * (0.5 - 0.5 * s2));
    P.stepL = 0.026 * amp * Math.max(0, s1); P.stepR = 0.026 * amp * Math.max(0, -s1);
    if (mv === 'L') { P.lean += 0.2; P.sway -= 0.02; P.head += 0.2; P.armL = -1.35 - 0.35 * amp * (0.5 + 0.5 * s2); P.armR = 0.12; P.stepR += 0.015; }
    if (mv === 'R') { P.lean -= 0.2; P.sway += 0.02; P.head -= 0.2; P.armR = 2.05 + 0.35 * amp * (0.5 + 0.5 * s2); P.armL = -0.05; P.stepL += 0.015; }
    if (mv === 'B') {
      P.sq = (0.05 + 0.08 * amp) * dn; P.hop = 0.03 * amp * Math.max(0, Math.sin(2 * Math.PI * b - 1.2));
      P.armR = 1.1 + 0.9 * (0.5 - 0.5 * Math.cos(2 * Math.PI * b)); P.armL = -(0.9 + 0.9 * (0.5 - 0.5 * Math.cos(2 * Math.PI * b)));
    }
    if (mv === 'W') {
      const w = Math.sin(4 * Math.PI * b);
      P.shim = 0.032 * (0.4 + 0.6 * amp) * w; P.head += 0.22 * Math.sin(4 * Math.PI * b + 1); P.sq = 0.03 * amp * dn;
      P.armR = 0.7 + 0.6 * w; P.armL = -(0.6 - 0.6 * w); P.stepL = 0.02 * Math.max(0, w); P.stepR = 0.02 * Math.max(0, -w);
    }
    if (mv === 'F') { P.armR = 2.55; P.armL = -0.45; P.lean = 0.09; P.head = 0.16; P.sq = 0.02; P.sway = -0.01; P.stepL = 0.02; P.stepR = 0; P.hop = 0; P.shim = 0; }
    if (mv === 'A') { P.armR = 2.35 + 0.3 * s2; P.armL = -2.2 - 0.3 * s2; P.sq = (0.05 + 0.06 * amp) * dn; P.hop = 0.02 * amp * Math.max(0, Math.sin(2 * Math.PI * b - 1.2)); }
    return P;
  }

  /* ── pictures ── */
  function cueTex(mv, kicker) {
    const m = MOVES[mv];
    return K.canvasTex(512, 256, (g, W, H) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H - 22); g.fillStyle = K.RED; g.fillRect(0, H - 22, W, 22);
      g.font = '900 30px Archivo, "Arial Black", Arial, sans-serif'; g.fillStyle = K.RED; g.textBaseline = 'top'; g.fillText(kicker, 26, 20);
      g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.font = '900 110px "Arial Black", Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; g.fillText(m.icon, 22, 140);
      let fs = 72; const word = m.word.toUpperCase();
      const font = () => `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; g.font = font();
      while (g.measureText(word).width > W - 190 && fs > 30) { fs -= 4; g.font = font(); }
      g.fillText(word, 168, 140);
    });
  }
  const chevTex = K.canvasTex(128, 128, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 20; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(44, 22); g.lineTo(88, 64); g.lineTo(44, 106); g.stroke(); });
  function drawBall(g, ph) {
    g.clearRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(200,200,210,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 0); g.lineTo(64, 12); g.stroke();
    g.save(); g.beginPath(); g.arc(64, 66, 52, 0, Math.PI * 2); g.clip();
    g.fillStyle = '#2a2d33'; g.fillRect(0, 0, 128, 128);
    for (let j = -6; j <= 6; j++) {
      const lat = (j / 7) * (Math.PI / 2), y = 66 + 52 * Math.sin(lat), rr = 52 * Math.cos(lat), th = 52 * (Math.PI / 14) * 0.9;
      for (let k = 0; k < 24; k++) {
        const lon = (k / 24) * Math.PI * 2 + ph, cz = Math.cos(lon); if (cz <= 0) continue;
        const x = 64 + rr * Math.sin(lon), w = Math.max(1, rr * (Math.PI / 12) * cz * 0.9), sh = Math.abs(Math.sin(j * 12.9898 + k * 78.233) * 43758.5453) % 1;
        const v = Math.round(90 + 165 * cz * (0.45 + 0.55 * sh)); g.fillStyle = `rgb(${v},${v},${Math.min(255, v + 12)})`;
        g.fillRect(x - w / 2, y - th / 2, w, th);
      }
    }
    const hl = g.createRadialGradient(46, 46, 2, 46, 46, 34); hl.addColorStop(0, 'rgba(255,255,255,.85)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.fillRect(0, 0, 128, 128);
    g.restore();
  }

  function part(name, piv, order, uni, vert = VERT) {
    const b = BOX[name], w = b[2] - b[0], hh = (b[3] - b[1]) * G.h, body = name === 'body';
    const geo = new THREE.PlaneGeometry(w, hh, body ? 16 : 1, body ? 48 : 1);
    geo.translate((b[0] + b[2]) / 2 - piv.u, (piv.v - (b[1] + b[3]) / 2) * G.h, 0);
    const u = { map: { value: null }, uA: G.U.uA, uTint: G.U.uTint, uTintA: G.U.uTintA, uFlash: G.U.uFlash, ...uni };
    const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: vert, fragmentShader: PART_FRAG, transparent: true, depthWrite: false }));
    m.renderOrder = order;
    new THREE.TextureLoader().load(ART + name + '.png', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; u.map.value = t; G.loaded++; });
    return m;
  }

  /* ── the show ── */
  const bar = () => (clock() - G.t0) / BAR;
  const moveAt = (b) => { const i = Math.floor((b - WARM) / SLOT); return b < WARM ? 'warm' : i < ROUTINE.length ? ROUTINE[i] : b < END_BAR ? 'A' : 'end'; };
  function hud(force) {
    if (!force && G.t - G.hudT < 0.25) return; G.hudT = G.t;
    const mv = G.move && MOVES[G.move], sub = !G.playing ? 'Move your phone to make him dance' : mv ? `Now: ${mv.word} · ${mv.how}` : 'Move your phone: the more you move, the more he dances';
    G.ui.panel('Robot dance party', `${Math.round(G.score)}<small>groove</small>` + (G.combo > 1 ? ` <small>×${G.combo}</small>` : ''), { segs: [Math.max(0, Math.min(ROUTINE.length, G.slot)), ROUTINE.length], sub });
  }
  function cueSound(mv) {
    if (mv === 'L' || mv === 'R') { const p = mv === 'L' ? -0.85 : 0.85; K.sfx.whoosh(p); K.tone(mv === 'L' ? 520 : 780, 0.18, { type: 'triangle', vol: 0.1, pan: p, delay: 0.12 }); }
    if (mv === 'B') { K.tone(180, 0.22, { type: 'triangle', vol: 0.16, slide: 260 }); K.tone(240, 0.2, { type: 'triangle', vol: 0.12, slide: 400, delay: 0.24 }); }
    if (mv === 'W') for (let i = 0; i < 6; i++) K.tone(900 + (i % 2) * 300, 0.05, { type: 'square', vol: 0.04, delay: i * 0.05 });
    if (mv === 'A') [523, 659, 784].forEach((f, i) => K.tone(f, 0.3, { type: 'square', vol: 0.05, delay: i * 0.07 }));
  }
  function announce(mv) {
    G.cue.material.map = G.cueTex[mv + 'n']; G.cue.material.needsUpdate = true; G.cueA = 1; G.cuePop = 1;
    G.say(MOVES[mv].say); cueSound(mv);
  }
  function startSlot(mv) {
    G.move = mv; G.acc = { lean: 0, wig: 0, still: 0, peaks0: G.in.peaks, hit: false };
    G.cue.material.map = G.cueTex[mv + 'c']; G.cue.material.needsUpdate = true; G.cuePop = 1;
    if (mv === 'F') { G.freezeB = (clock() - G.t0) / BEAT; G.buzz(30); }
    hud(true);
  }
  function judge(dt, beatIn) {
    const A = G.acc, I = G.in, mv = G.move; if (!A || A.hit || mv === 'A' || beatIn < 0.5) return;
    if (mv === 'L' && I.roll < -13) A.lean += dt;
    if (mv === 'R' && I.roll > 13) A.lean += dt;
    if (mv === 'W' && I.e > 0.45) A.wig += dt;
    if (mv === 'F' && beatIn > 1 && I.e < 0.14) A.still += dt;
    const ok = (mv === 'L' || mv === 'R') ? A.lean >= 0.5 : mv === 'B' ? I.peaks - A.peaks0 >= 3 : mv === 'W' ? A.wig >= 1.0 : mv === 'F' ? A.still >= 2.0 : false;
    if (!ok) return;
    A.hit = true; G.hits++; G.combo++; G.bestCombo = Math.max(G.bestCombo, G.combo); G.score += 100 + 25 * (G.combo - 1);
    G.music.st.combo = G.combo; G.flash = 1; G.eyeFlash = 1; G.buzz([30, 30, 30]);
    K.sfx.good(0, G.hits); G.ui.pop(PRAISE[(G.hits - 1) % PRAISE.length]);
    const [x, y] = G.S.P(NECK.u, NECK.v - 0.1); G.fx.add(x, y, '#' + G.tint.getHexString(), 16, 0.35);
    hud(true);
  }
  function endSlot() {
    const A = G.acc; if (!A || G.move === 'A') return;
    if (!A.hit) { G.combo = 0; G.music.st.combo = 0; G.missed++; G.ui.pop(G.move === 'F' ? 'Too wiggly!' : 'Missed it'); }
  }
  function finish() {
    G.finished = true; G.move = 'A';
    const r = K.best('fearless-request:dance', Math.round(G.score), 'higher');
    G.music.duck(0.55);
    K.finale(G, { won: true, kicker: 'What a party', title: 'You made him dance', line: G.work && G.work.quote, best: r.isBest,
      cells: [{ k: 'Moves', v: `${G.hits}/${ROUTINE.length}` }, { k: 'Best combo', v: G.bestCombo }, { k: 'Groove', v: Math.round(G.score) }] });
    setTimeout(() => G && G.music && G.music.stop(), 4000);
  }

  return {
    title: 'Robot dance party',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { loaded: 0, score: 0, hits: 0, missed: 0, combo: 0, bestCombo: 0, slot: -1, move: null, announced: null, acc: null, hudT: -1,
        E: 0.2, club: 0, hue: 0.58, hueT: 0.58, lightT: 0, ballT: 0, ballDraw: 0, flash: 0, eyeFlash: 0, cueA: 0, cuePop: 0, swing: 0, swingV: 0, prevHand: null, prevV: [0, 0],
        lost: false, lostSaid: false, finished: false, t0: 0, lastBar: -1, freezeB: 0, tint: new THREE.Color(),
        in: { roll: 0, e: 0, peaks: 0, btnRoll: 0, btnE: 0, btnPeaks: 0 } });
      G.pz = { sq: 0, sway: 0, shim: 0, lean: 0, hop: 0, head: 0, hb: 0, armR: 0.25, armL: -0.15, stepL: 0, stepR: 0 };
      G.U = { uA: { value: 0 }, uTint: { value: new THREE.Vector3(1, 1, 1) }, uTintA: { value: 0 }, uFlash: { value: 0 } };
      // the stage: the painting with the robot taken out, lit like a club
      G.SU = { map: { value: null }, uT: { value: 0 }, uBeat: { value: 0 }, uE: { value: 0.3 }, uHue: { value: 0.58 }, uRoll: { value: 0 }, uClub: { value: 0 }, uFreeze: { value: 0 }, uFlash: { value: 0 }, uA: G.U.uA, uH: { value: G.h }, uBall: { value: 0 } };
      G.stage = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.SU, vertexShader: VERT, fragmentShader: STAGE_FRAG, transparent: true, depthWrite: false }));
      G.stage.renderOrder = 11; G.stage.position.z = 0.03; G.root.add(G.stage);
      new THREE.TextureLoader().load(ART + 'stage.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.SU.map.value = t; G.loaded++; });
      // the robot, as a puppet: body (bends), head, the arm with the lantern, the other arm
      G.D = { uSq: { value: 0 }, uSway: { value: 0 }, uShim: { value: 0 }, uLean: { value: 0 }, uStepL: { value: 0 }, uStepR: { value: 0 }, uHip: { value: (FEET.v - HIP_V) * G.h } };
      G.rob = new THREE.Group(); const [fx, fy] = G.S.P(FEET.u, FEET.v); G.rob.position.set(fx, fy, 0.05); G.root.add(G.rob);
      G.body = part('body', FEET, 20, G.D, BODY_VERT); G.rob.add(G.body);
      G.armRN = new THREE.Group(); G.armRN.add(part('armR', SHOULDER, 21, {})); G.rob.add(G.armRN);
      G.armLN = new THREE.Group(); G.armLN.add(part('armL', ELBOW, 21, {})); G.rob.add(G.armLN);
      G.lantN = new THREE.Group(); G.lantN.position.set(HAND.u - ELBOW.u, (ELBOW.v - HAND.v) * G.h, 0.001); G.lantN.add(part('lant', HAND, 22, {})); G.armLN.add(G.lantN);
      G.lamp = K.sprite(K.glowTex, 0.13, { color: '#ffd28a', additive: true, opacity: 0, order: 23 }); G.lamp.position.set(LAMP.u - HAND.u, (HAND.v - LAMP.v) * G.h, 0.002); G.lantN.add(G.lamp);
      G.headN = new THREE.Group(); G.headN.add(part('head', NECK, 24, {})); G.rob.add(G.headN);
      G.eyes = EYES.map(e => { const s = K.sprite(K.glowTex, 0.06, { color: '#ffd27a', additive: true, opacity: 0, order: 25 }); s.position.set(e.u - NECK.u, (NECK.v - e.v) * G.h, 0.002); G.headN.add(s); return s; });
      // the mirror ball, the move card, the arrows
      G.ballC = document.createElement('canvas'); G.ballC.width = G.ballC.height = 128; drawBall(G.ballC.getContext('2d'), 0);
      G.ballTex = new THREE.CanvasTexture(G.ballC); G.ballTex.colorSpace = THREE.SRGBColorSpace;
      G.ball = K.sprite(G.ballTex, 0.1, { order: 26, opacity: 0 }); { const [x, y] = G.S.P(0.3, 0.06); G.ball.position.set(x, y, 0.06); } G.root.add(G.ball);
      G.cueTex = {}; for (const k of Object.keys(MOVES)) { G.cueTex[k + 'n'] = cueTex(k, 'NEXT MOVE'); G.cueTex[k + 'c'] = cueTex(k, k === 'A' ? 'BIG FINISH' : 'NOW!'); }
      G.cue = K.plane(G.cueTex.Ln, 0.34, 0.17, { order: 30, opacity: 0 }); { const [x, y] = G.S.P(0.215, 0.2); G.cue.position.set(x, y, 0.07); G.cueXY = [x, y]; } G.root.add(G.cue);
      G.chev = []; for (let i = 0; i < 6; i++) { const s = K.sprite(chevTex, 0.06, { color: '#ffffff', additive: true, opacity: 0, order: 27 }); s.position.z = 0.065; G.root.add(s); G.chev.push(s); }
      // music, motion, buttons
      const ac = K.audio(); G.music = ac ? funk(ac, b => moveAt(b)) : { st: { combo: 0 }, start() {}, stop() {}, duck() {} };
      sensors();
      G.ui.buttons([
        { label: 'Lean', icon: '◀', kind: 'red', aria: 'Lean left', press: () => { G.in.btnRoll = -30; }, release: () => { G.in.btnRoll = 0; } },
        { label: 'Bounce', icon: '↕', kind: 'red', aria: 'Bounce', press: tapBounce },
        { label: 'Lean', icon: '▶', kind: 'red', aria: 'Lean right', press: () => { G.in.btnRoll = 30; }, release: () => { G.in.btnRoll = 0; } },
      ]);
      hud(true);
      G.onGo = () => { G.t0 = clock() + 0.12; G.music.start(G.t0); G.go = true; hud(true); };
      K.intro(G, { title: 'Robot dance party', how: 'Move your phone and he dances: the more you move, the more he grooves. Follow his moves: lean left, lean right, bounce, wiggle, and FREEZE!',
        say: 'Robot dance party! This big robot wants to dance, and you are the music. Move your phone and he dances. The more you move, the more he grooves. He will call out his moves: lean left, lean right, bounce, wiggle, and freeze, when the music stops. Tilt, pump and shake your phone with him. No motion? Use the buttons. Let’s dance!' });
    },
    update(dt) {
      if (!G) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      input(dt);
      const ready = G.loaded >= 6 ? 1 : 0;
      G.U.uA.value += (ready - G.U.uA.value) * Math.min(1, dt * 2.5);
      // the clock: everything follows the band
      let b = 0, beatF = 0, mv = 'idle';
      if (G.go) {
        b = bar(); beatF = b * 4; mv = moveAt(b);
        // the next move is called a beat and a half early, so you can get ready
        const slot = b < WARM ? -1 : Math.floor((b - WARM) / SLOT);
        const bA = b + 0.375, sA = bA < WARM ? -1 : Math.floor((bA - WARM) / SLOT), mA = moveAt(bA);
        if (sA !== slot && mA !== 'end' && mA !== 'warm' && G.annKey !== mA + sA) { G.annKey = mA + sA; announce(mA); }
        if (slot !== G.slot && mv !== 'end') { if (G.slot >= 0) endSlot(); G.slot = slot; if (mv !== 'warm') startSlot(mv); else hud(true); }
        if (mv === 'end' && !G.finished) { endSlot(); finish(); }
        const beatIn = (b - WARM - Math.max(0, slot) * SLOT) * 4;
        if (G.playing && mv !== 'warm' && mv !== 'end') judge(dt, beatIn);
        if (G.playing) G.score += G.in.e * dt * 12;
        if (Math.floor(b) !== G.lastBar) { G.lastBar = Math.floor(b); if (mv !== 'F') G.hueT += 0.13 + (G.lastBar % 4 === 0 ? 0.2 : 0); }
      }
      const live = G.go && mv !== 'F';
      const pulse = G.go ? (mv === 'F' ? 0 : Math.exp(-(beatF % 1) * 5)) : 0.3 + 0.2 * Math.sin(G.t * 2);
      // how hard he dances: your movement, smoothed
      G.E += ((G.go ? G.in.e : Math.max(0.15, G.in.e)) - G.E) * Math.min(1, dt * (G.in.e > G.E ? 4 : 1.2));
      if (G.music.st) G.music.st.E = Math.max(0.2, G.E);
      const amp = G.go ? 0.3 + 0.7 * G.E : 0.25 + 0.5 * G.E;
      const pb = mv === 'F' ? G.freezeB : G.go ? beatF : G.t * 0.8;
      const T = pose(mv === 'warm' || mv === 'idle' || mv === 'end' ? (G.finished ? 'A' : 'groove') : mv, pb, amp);
      const k = Math.min(1, dt * (mv === 'F' ? 20 : 12));
      for (const key in T) G.pz[key] += (T[key] - G.pz[key]) * k;
      const D = G.pz;
      G.D.uSq.value = D.sq; G.D.uSway.value = D.sway; G.D.uShim.value = D.shim; G.D.uLean.value = D.lean; G.D.uStepL.value = D.stepL; G.D.uStepR.value = D.stepR;
      const [fx, fy] = G.S.P(FEET.u, FEET.v); G.rob.position.set(fx, fy + D.hop, 0.05);
      const place = (node, pt, rot, dy = 0) => { const [x, y] = L(pt), [bx, by] = bend(x, y); node.position.set(bx, by + dy, node.position.z); node.rotation.z = D.lean + rot; };
      place(G.headN, NECK, D.head, D.hb); place(G.armRN, SHOULDER, D.armR); place(G.armLN, ELBOW, D.armL);
      // the lantern hangs from his hand and swings
      G.rob.updateMatrixWorld(true);
      const hw = new THREE.Vector3(); G.lantN.getWorldPosition(hw); G.rob.worldToLocal(hw);
      if (G.prevHand && dt > 0) {
        const vx = (hw.x - G.prevHand.x) / dt, ax = Math.max(-40, Math.min(40, (vx - G.prevV[0]) / dt)); G.prevV[0] = vx;
        G.swingV += (-34 * Math.sin(G.swing) - 2.6 * G.swingV - (ax / 0.07) * Math.cos(G.swing) * 0.6) * dt;
        G.swing = Math.max(-1.1, Math.min(1.1, G.swing + G.swingV * dt));
      }
      G.prevHand = hw.clone();
      G.lantN.rotation.z = -(D.lean + D.armL) + G.swing;
      // the lights
      G.club += ((G.go || G.t > 1 ? 1 : 0) - G.club) * Math.min(1, dt * 0.8);
      G.lightT += dt * (live ? 0.6 + 1.4 * G.E : 0); G.ballT += dt * (live ? 0.25 + 0.5 * G.E : 0);
      G.hue += (G.hueT + G.in.roll / 120 - G.hue) * Math.min(1, dt * 5);   // the colours change every bar, and with the tilt
      G.flash = Math.max(0, G.flash - dt * 2.5); G.eyeFlash = Math.max(0, G.eyeFlash - dt * 2);
      const S = G.SU; S.uT.value = G.lightT; S.uBeat.value = pulse; S.uE.value = G.E; S.uHue.value = G.hue; S.uClub.value = G.club;
      S.uRoll.value = Math.max(-1, Math.min(1, G.in.roll / 35)) * 0.6; S.uFlash.value = G.flash; S.uBall.value = G.ballT * 3;
      S.uFreeze.value += ((mv === 'F' ? 1 : 0) - S.uFreeze.value) * Math.min(1, dt * 10);
      G.tint.setHSL(((G.hue % 1) + 1) % 1, 0.85, 0.6);
      G.U.uTint.value.set(G.tint.r, G.tint.g, G.tint.b); G.U.uTintA.value = G.club * (mv === 'F' ? 0.12 : 0.18 + 0.3 * pulse); G.U.uFlash.value = G.flash;
      const eyeC = new THREE.Color('#ffd27a').lerp(G.tint, 0.5 * pulse).lerp(new THREE.Color('#ffffff'), G.eyeFlash);
      for (const e of G.eyes) { e.material.color.copy(eyeC); e.material.opacity = G.U.uA.value * (0.55 + 0.35 * pulse + 0.3 * G.eyeFlash); e.scale.setScalar(0.05 + 0.035 * pulse + 0.04 * G.eyeFlash); }
      G.lamp.material.opacity = G.U.uA.value * (0.6 + 0.25 * pulse); G.lamp.scale.setScalar(0.11 + 0.04 * pulse);
      G.ball.material.opacity = G.U.uA.value * G.club; G.ball.scale.setScalar(0.1 + 0.01 * pulse);
      G.ballDraw -= dt; if (G.ballDraw <= 0) { G.ballDraw = 0.06; drawBall(G.ballC.getContext('2d'), G.ballT * 2); G.ballTex.needsUpdate = true; }
      // the move card pops in on the beat; the arrows point the way to lean
      G.cuePop = Math.max(0, G.cuePop - dt * 4);
      const showCue = G.go && !G.finished && !!G.annKey;
      G.cue.material.opacity += ((showCue ? 1 : 0) - G.cue.material.opacity) * Math.min(1, dt * 8);
      G.cue.scale.setScalar(1 + 0.12 * G.cuePop + 0.04 * pulse);
      G.cue.position.y = G.cueXY[1] + (mv === 'B' ? 0.012 * Math.sin(beatF * Math.PI * 2) : 0);
      G.cue.position.x = G.cueXY[0] + (mv === 'W' ? 0.006 * Math.sin(beatF * Math.PI * 4) : mv === 'L' ? -0.008 * pulse : mv === 'R' ? 0.008 * pulse : 0);
      G.chev.forEach((s, i) => {
        const side = i < 3 ? -1 : 1, want = (mv === 'L' && side < 0) || (mv === 'R' && side > 0), n = i % 3, ph = ((G.t * 1.6 + n / 3) % 1);
        const [x, y] = G.S.P(side < 0 ? 0.43 - ph * 0.12 : 0.9 + ph * 0.07, 0.42);
        s.position.set(x, y, 0.065); s.material.rotation = side < 0 ? Math.PI : 0; s.material.color.copy(G.tint);
        s.material.opacity += ((want ? (1 - ph) * 0.9 : 0) - s.material.opacity) * Math.min(1, dt * 10); s.scale.setScalar(0.05 + 0.02 * pulse);
      });
      if (G.lost && !G.lostSaid && G.playing) { G.lostSaid = true; G.ui.alert('Keep dancing!', 'Point back at the painting to see him', 2, 'black'); }
      hud();
    },
    pointer(kind, ev) {
      if (!G || !G.playing || kind !== 'down') return;
      tapBounce();                                     // a tap is a bounce (for phones without motion sensors)
    },
    // when the painting leaves the camera the party keeps going: the moves are called out loud, so you can dance by ear
    pause() { if (G) { G.lost = true; G.music.duck && G.music.duck(0.5); } },
    resume() { if (G) { G.lost = false; G.music.duck && !G.finished && G.music.duck(0.75); } },
    get over() { return !!(G && G.over); },
    get debug() {
      return G && { engine: 'dance', playing: G.playing, over: G.over, go: !!G.go, bar: G.go ? +bar().toFixed(2) : 0, slot: G.slot, move: G.move, hits: G.hits, missed: G.missed, combo: G.combo,
        score: Math.round(G.score), E: +G.E.toFixed(2), roll: +G.in.roll.toFixed(1), loaded: G.loaded, sensor: !!(G.mot && G.mot.ok), swing: +G.swing.toFixed(2), t: +G.t.toFixed(1) };
    },
    stop() { if (G) { G.offMotion && G.offMotion(); G.music && G.music.stop(); } K.cleanup(G); G = null; },
  };
}
export { funk as danceBand };
