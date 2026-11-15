// REACHING PAST BLINDNESS (Rusty Perez): REACH OUT, a "strum on the big drum" game.
// "I think it's also helped me reach past the blindness… and connect with me on a personal level."
// The painting starts dark, with only Rusty and his guitar glowing. Eight listeners wait in the dark around the edge.
// A warm acoustic groove plays. Every bar the waiting listener hums three soft notes (beats 1, 2, 3, from their side),
// then comes THE BIG DRUM on beat 4. Tap STRUM on the big drum: Rusty's guitar rings out (a real plucked-string chord)
// and a ray of colour shoots from the guitar toward that listener. Two good strums reach them: they light up in their
// colour, throw their arms in the air and cheer, their part of the painting lights up, and a new instrument joins the band:
//   bass · claps · piano · picking guitar · strings · whistle · drums · everyone singing.
// Reach all eight: the whole painting glows, every ray shimmers, the full band plays, and Rusty's own words play at the end.
// Accessible: the three hums and the big drum are the same every bar; the hums come from the listener's side and get
// louder as the ray gets closer; early/late is spoken; the window gets wider after misses; phones buzz on a good strum.
// Props: reach-things.js (drawn in canvas). Voice prefix: strum-
import * as THREE from 'three';
import * as K from './kit.js';
import { COLORS, listenerTex, streakTex, noteTex } from './reach-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_20.mp3', import.meta.url).href;   // Rusty, in his own words

// where the listeners stand (centre of the figure, u, v from the top-left), in the order they are reached
const SPOTS = [[0.12, 0.30], [0.88, 0.31], [0.12, 0.61], [0.88, 0.62], [0.30, 0.14], [0.71, 0.14], [0.14, 0.89], [0.86, 0.89]];
const ORDER_KIND = [0, 4, 1, 5, 3, 7, 2, 6];        // which drawn listener stands at each spot
const HOLE = [0.47, 0.63];                           // the guitar's sound hole, where the rays start
const BAND = ['Bass', 'Claps', 'Piano', 'Picking guitar', 'Strings', 'Whistle', 'Drums', 'Everyone sings'];
const NEED = 2;                                      // good strums to reach one listener
const BPM = 92, BEAT = 60 / BPM, BAR = BEAT * 4, STEP = BEAT / 4;
const WIN0 = 0.2, WIN_MAX = 0.36, PERFECT = 0.09, LATE = 0.14;
const LW = 0.15, LH = LW * 1.25;                     // a listener's size on the painting
const DOTS = 26;                                     // glow dots along each ray
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const SAY_REACHED = ['1 reached.', '2 reached.', '3 reached.', '4 reached.', '5 reached.', '6 reached.', '7 reached.', 'Everyone is listening!'];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform vec2 uPos[8];
uniform float uLit[8];
uniform float uT, uA, uBase, uRusty, uAll, uKick;
vec4 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // the explosion of colour behind Rusty's head pushes outward on every good strum
  vec2 c = vec2(0.46, 0.30), d = p - c;
  vec2 q = c + d * (1.0 - uKick * 0.03 * smoothstep(0.0, 0.7, length(d)));
  q += vec2(sin(p.y * 24.0 + uT * 0.8), cos(p.x * 21.0 + uT * 0.7)) * 0.0012 * (uAll + 0.3);
  vec3 col = at(q).rgb;
  // light: dark all round, a glow on Rusty, a pool of light round every listener who has been reached
  float L = uBase + uRusty * (1.0 - smoothstep(0.10, 0.34, length((p - vec2(0.46, 0.55)) * vec2(1.15, 0.85))));
  for (int i = 0; i < 8; i++) L += uLit[i] * 0.95 * (1.0 - smoothstep(0.04, 0.30, length(p - uPos[i])));
  L = max(L, uAll) + uKick * 0.10;
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(g), col, clamp(0.35 + 0.75 * L, 0.0, 1.0)) * min(L, 1.2);
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the band: a warm acoustic groove that grows with every listener ───────────────────────── */
function band(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp).connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p) => { if (!ac.createStereoPanner) return master; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(master); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, lp = 0, vib = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.4; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.002 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // a real-sounding plucked string (Karplus–Strong), made once per note
  const ks = new Map();
  function string(m) {
    if (ks.has(m)) return ks.get(m);
    const sr = ac.sampleRate, f = midi(m), N = Math.max(2, Math.round(sr / f)), len = Math.floor(sr * 2.2), b = ac.createBuffer(1, len, sr), y = b.getChannelData(0);
    let prev = 0; for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; prev = prev * 0.5 + r * 0.5; y[i] = prev; }   // a soft pick
    const damp = 0.4985 + Math.min(0.0012, f / 400000);
    for (let i = N; i < len; i++) y[i] = (y[i - N] + y[i - N + 1 < i ? i - N + 1 : i - N]) * damp;
    ks.set(m, b); return b;
  }
  function pluck(t, m, { vol = 0.25, p = 0, dur = 2.0 } = {}) {
    const s = ac.createBufferSource(), g = ac.createGain(), f = ac.createBiquadFilter(); s.buffer = string(m); f.type = 'lowpass'; f.frequency.value = 3800;
    g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0.0001, t + dur * 0.7, dur * 0.12);
    s.connect(f).connect(g).connect(pan(p)); s.start(t); s.stop(t + dur + 0.1);
  }
  // G – D – Em – C, round and round (open guitar shapes, and the bass roots)
  const SHAPES = [[43, 47, 50, 55, 59, 67], [45, 50, 57, 62, 66], [40, 47, 52, 55, 59, 64], [48, 52, 55, 60, 64]];
  const ROOT = [31, 38, 40, 36];
  const PAD = [[55, 59, 62], [54, 57, 62], [55, 59, 64], [55, 60, 64]];
  const MEL = [[[0, 79, 3], [4, 78, 2], [6, 76, 2], [8, 74, 6]], [[0, 74, 3], [4, 76, 2], [6, 78, 2], [8, 81, 6]],
    [[0, 79, 3], [4, 78, 2], [6, 76, 4], [10, 74, 2], [12, 71, 4]], [[0, 72, 4], [4, 74, 2], [6, 76, 2], [8, 79, 8]]];
  SHAPES.flat().forEach(string);   // make the strings now, so the first strum doesn't stutter
  const B = {
    layers: 0, bar: 0, step: 0, next: 0, timer: null, cue: null, onBar: null, party: false,
    // Rusty's strum: down across the strings, from the guitar (a little left of centre)
    strum(t, bar = B.bar, up = false, vol = 0.24) {
      const sh = SHAPES[(bar % 4 + 4) % 4], list = up ? sh.slice().reverse() : sh;
      list.forEach((m, k) => pluck(t + k * 0.014, m, { vol: vol * (up ? 0.6 : 1), p: -0.1 }));
      noise(t, 0.05, { freq: 3000, q: 0.8, vol: 0.06, p: -0.1 });
    },
    dead(t) { noise(t, 0.06, { freq: 900, q: 1.2, vol: 0.22, p: -0.1 }); noise(t + 0.02, 0.05, { freq: 1500, q: 1.5, vol: 0.12, p: -0.1 }); },   // a muted "chk"
    // a listener's soft hum: louder as the ray gets closer
    hum(t, i, p, near) { const f = midi([69, 71, 74, 76, 79, 81, 83, 86][i] - (12 * (i % 2))); const v = 0.05 + near * 0.06; tone(t, f, 0.34, { type: 'sine', vol: v, att: 0.05, p, vib: 0.006 }); tone(t, f * 2, 0.22, { vol: v * 0.25, att: 0.04, p }); },
    // THE BIG DRUM on beat 4
    drum(t) { tone(t, 110, 0.5, { vol: 0.9, slide: 40, att: 0.003 }); noise(t, 0.18, { freq: 1600, q: 0.7, vol: 0.5 }); tone(t, 190, 0.22, { type: 'triangle', vol: 0.22, slide: 120 }); },
    cheer(t, p) {   // a little crowd "yaaay" and claps from the listener's side
      for (let k = 0; k < 3; k++) noise(t + k * 0.04, 0.9, { freq: 900 + k * 500, q: 2.5, vol: 0.1, p, att: 0.12 });
      for (let k = 0; k < 6; k++) noise(t + 0.1 + k * 0.11 + Math.random() * 0.03, 0.05, { freq: 1800, q: 1.2, vol: 0.18, p: p + (Math.random() - 0.5) * 0.3 });
      [72, 76, 79, 84].forEach((m, k) => tone(t + k * 0.06, midi(m), 0.5, { type: 'triangle', vol: 0.09, p }));
    },
    sched(step, t) {
      const L = B.layers, bar = B.bar, b4 = bar % 4, sh = SHAPES[b4], r = ROOT[b4];
      if (step === 0 && B.onBar) B.onBar(bar, t);
      // always: a soft shaker on the eighths and the big drum on beat 4
      if (step % 2 === 0) noise(t, 0.04, { freq: 7000, type: 'highpass', vol: step % 4 === 2 ? 0.07 : 0.035, p: 0.3 });
      if (step === 12) B.drum(t);
      if (B.cue && (step === 0 || step === 4 || step === 8)) B.cue(step, t);
      if (L >= 1 && { 0: 1, 6: 1, 8: 1, 14: 1 }[step]) tone(t, midi(step === 6 || step === 14 ? r + 7 : r), 0.42, { type: 'triangle', vol: 0.32, lp: 480, att: 0.01 });   // bass
      if (L >= 2 && (step === 4 || step === 12)) { noise(t, 0.08, { freq: 1500, q: 1.1, vol: 0.2, p: -0.35 }); noise(t + 0.012, 0.07, { freq: 2200, q: 1.3, vol: 0.14, p: 0.35 }); }   // claps
      if (L >= 3 && (step === 2 || step === 6 || step === 10)) sh.slice(-3).forEach(m => tone(t, midi(m + 12), 0.28, { type: 'triangle', vol: 0.035, p: 0.45 }));   // piano
      if (L >= 4 && step % 2 === 1) pluck(t, sh[[1, 3, 2, 4, 3, 5, 2, 4][(step - 1) / 2] % sh.length] + 12, { vol: 0.12, p: 0.55, dur: 0.9 });   // picking guitar
      if (L >= 5 && step === 0) PAD[b4].forEach(m => tone(t, midi(m), BAR * 0.98, { type: 'sawtooth', vol: 0.016, att: 0.5, lp: 1200, vib: 0.003, p: -0.5 }));   // strings
      if (L >= 6) for (const [st, m, d] of MEL[b4]) if (st === step) tone(t, midi(m), d * STEP * 0.95, { type: 'sine', vol: 0.06, att: 0.04, vib: 0.012, p: 0.2 });   // whistle
      if (L >= 7) { if (step === 0 || step === 8) tone(t, 70, 0.3, { vol: 0.5, slide: 40, att: 0.003 }); if (step % 4 === 2) noise(t, 0.09, { freq: 9000, type: 'highpass', vol: 0.06, p: -0.6 }); }   // drums, tambourine
      if (L >= 8 && step === 0) PAD[b4].concat([PAD[b4][0] + 12]).forEach(m => tone(t, midi(m), BAR * 0.95, { type: 'triangle', vol: 0.03, att: 0.4, vib: 0.005 }));   // everyone sings
      if (B.party && step % 4 === 0) B.strum(t, bar, false, 0.2);
      if (B.party && step % 4 === 2) B.strum(t, bar, true, 0.2);
    },
    tick() {
      const now = ac.currentTime;
      while (B.next < now + 0.18) { B.sched(B.step, B.next); B.next += STEP; B.step++; if (B.step === 16) { B.step = 0; B.bar++; } }
    },
    start() { B.next = ac.currentTime + 0.12; B.step = 0; master.gain.setTargetAtTime(0.85, ac.currentTime, 0.05); clearInterval(B.timer); B.timer = setInterval(B.tick, 25); B.tick(); },
    hold() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    resume() { if (B.step !== 0) { B.step = 0; B.bar++; } B.start(); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    stop() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { try { master.disconnect(); } catch (e) {} }, 600); },
  };
  return B;
}

export function reachOutGame() {
  let G = null;
  const panOf = (i) => (SPOTS[i][0] - 0.5) * 1.8;
  const heard = () => { const ac = K.audio(); return ac ? ac.currentTime - (ac.outputLatency || ac.baseLatency || 0) : G.t; };

  // the ray's curve from the guitar to listener i (u, v), bowing upward like an arc of music
  function curve(i, k) {
    const [u1, v1] = SPOTS[i], [u0, v0] = HOLE, mu = (u0 + u1) / 2, mv = (v0 + v1) / 2 - 0.16 - Math.abs(u1 - u0) * 0.1;
    const a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, c = k * k;
    return [a * u0 + b * mu + c * u1, a * v0 + b * mv + c * (v1 + LH * 0.15)];
  }
  function popLow(text) { G.ui.pop(text, innerWidth / 2, innerHeight - 250); }
  function hudCss() {
    const st = document.createElement('style'); st.dataset.reach = '1';
    st.textContent = '.mgk.mgk-alert,.mgk.mgk-count{top:auto!important;bottom:calc(152px + env(safe-area-inset-bottom))!important}' +
      '.mgk.mgk-end{left:calc(18px + env(safe-area-inset-left))!important;right:calc(18px + env(safe-area-inset-right))!important}' +
      '.mgk-end .top{padding:14px 20px 16px!important}.mgk-end .cells div{padding:10px 12px 12px!important;min-width:0}' +
      '.mgk-end .cells b{font-size:12px!important;letter-spacing:.1em!important;line-height:1.25!important}.mgk-end .cells span{font-size:clamp(22px,7vw,38px)!important}' +
      '.mgk-end .line{padding:12px 20px 14px!important}.mgk-end button{padding:0 20px!important}' +
      '.mgk.mgk-alert{left:calc(18px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;padding:14px 20px 16px!important}' +
      '.mgk.mgk-panel{padding:10px 20px 12px!important}.mgk.mgk-pop{padding:6px 14px 5px!important;white-space:nowrap}';
    document.head.appendChild(st); return st;
  }
  function hud() {
    const n = G.reached;
    G.ui.panel('Reach out', `${n}<small>of 8 reached</small>`, { segs: [n, 8], sub: G.phase === 'party' ? 'Everyone is listening!' : G.listen ? 'Listen…' : 'Three soft beats, then strum on the big drum' });
  }
  function nextListener() {
    const i = G.reached; if (i >= 8) return;
    G.target = i; G.misses = 0; G.hinted = false; G.idleBars = 0;
  }
  // the band calls this at the start of every bar (in audio time)
  function onBar(bar, t) {
    G.barStarts.push(t); if (G.barStarts.length > 8) G.barStarts.shift();
    if (G.phase === 'play' && G.target >= 0 && t >= G.activeFrom - 0.01) {
      G.drops.push({ t: t + 3 * BEAT, tapped: false }); if (G.drops.length > 6) G.drops.shift();
      if (t > G.activeFrom + 0.01) { G.idleBars++; if (G.idleBars === 3 && !G.hinted) { G.hinted = true; G.say('Listen for the big drum, then strum.'); } }
    }
    if (G.phase === 'party') { G.partyBars++; if (G.partyBars === 3) G.endAt = t + BAR * 0.5; }
  }
  function cue(step, t) {
    if (G.phase !== 'play' || G.target < 0 || t < G.activeFrom - 0.01) return;
    const i = G.target; G.band.hum(t, i, panOf(i), G.prog[i] / NEED);
    G.humAt.push({ t, i });
  }
  function tap() {
    if (!G || !G.playing || G.over || G.phase !== 'play' || G.target < 0) return;
    const now = heard();
    const d = G.drops.filter(x => !x.tapped).map(x => ({ x, e: now - x.t })).sort((a, b) => Math.abs(a.e) - Math.abs(b.e))[0];
    G.taps++;
    if (!d || now < G.activeFrom - 0.25) { G.band.strum(K.audio().currentTime, G.band.bar, false, 0.12); popLow('Listen…'); return; }
    if (d.e >= -G.win && d.e <= G.win + LATE) { d.x.tapped = true; hit(Math.abs(d.e) <= PERFECT); }
    else miss(d.e);
  }
  function hit(perfect) {
    const i = G.target, ac = K.audio();
    if (perfect) G.perfect++;
    G.prog[i]++; G.kick = 1; G.strums++;
    G.band.strum(ac.currentTime); G.buzz([30, 20, 60]);
    const [hx, hy] = G.S.P(HOLE[0], HOLE[1]); G.fx.add(hx, hy, COLORS[ORDER_KIND[i]], 16, 0.3);
    for (let k = 0; k < 3; k++) floaty(hx, hy, COLORS[(ORDER_KIND[i] + k) % 8]);
    if (G.prog[i] >= NEED) reach(i, perfect);
    else popLow(perfect ? 'PERFECT!' : 'STRUM!');
    hud();
  }
  function reach(i, perfect) {
    const ac = K.audio(), L = G.L[i];
    G.reached++; G.target = -1;
    L.lit = true; L.litT = 0; L.mesh.material.map = listenerTex(ORDER_KIND[i], 'cheer'); L.mesh.material.needsUpdate = true;
    G.band.layers = G.reached;
    setTimeout(() => { if (G) G.band.cheer(K.audio().currentTime, panOf(i)); }, 380);   // when the ray arrives
    popLow(perfect ? 'PERFECT!' : 'REACHED!');
    G.ui.alert('Reached!', BAND[i] + ' joins the band', 1.8, 'red');
    G.say(SAY_REACHED[G.reached - 1]);
    const bs = G.barStarts[G.barStarts.length - 1] || ac.currentTime;
    G.activeFrom = bs + BAR * 2; G.listen = true;
    if (G.reached >= 8) { G.phase = 'party'; G.partyBars = 0; G.band.party = true; G.band.cue = null; }
    else setTimeout(() => { if (G && G.phase === 'play') nextListener(); }, 450);
  }
  function floaty(x, y, color, big = false) {
    const s = K.sprite(noteTex(), (big ? 0.06 : 0.045) + Math.random() * 0.02, { order: 32, color }); s.position.set(x, y, 0.07); G.root.add(s);
    G.notes.push({ s, vx: (Math.random() - 0.5) * 0.6, vy: 0.3 + Math.random() * 0.35, t: 0, life: 1.4 + Math.random() * 0.6, rot: (Math.random() - 0.5) * 1.2, ph: Math.random() * 6 });
  }
  function miss(e) {
    const ac = K.audio();
    G.misses++; G.missN++; G.band.dead(ac.currentTime); G.buzz(15);
    if (G.misses >= 2) G.win = Math.min(WIN_MAX, G.win + 0.04);
    const far = Math.abs(e) > BEAT * 1.2;
    if (G.t - G.lastSay > 2.5) { G.lastSay = G.t; G.say(far ? 'Wait for the big drum.' : e < 0 ? 'A little early.' : 'A little late.'); }
    popLow(far ? 'WAIT FOR THE DRUM' : e < 0 ? 'EARLY' : 'LATE');
  }
  function help() {
    if (!G || !G.playing || G.over) return;
    G.win = Math.min(WIN_MAX, G.win + 0.06); G.lastSay = G.t;
    G.say('Three soft beats, then the big drum. Strum on the big drum.');
    G.ui.alert('Three beats, then DRUM', 'Strum on the big drum, anywhere on the screen', 2.4, 'black');
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('reaching-past-blindness:reach', G.perfect, 'higher');
    K.finale(G, { won: true, kicker: 'You reached out', title: 'Everyone is listening', line: G.work && G.work.quote, best: r.isBest && G.perfect > 0, say: 'You reached everyone!',
      cells: [{ k: 'Reached', v: '8/8' }, { k: 'Perfect', v: `${G.perfect}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.band.fade(0.35, 2); G.overT = 0;
  }

  return {
    title: 'Reach Out',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = hudCss();
      Object.assign(G, { phase: 'intro', reached: 0, target: -1, activeFrom: 1e9, drops: [], barStarts: [], humAt: [], prog: SPOTS.map(() => 0), misses: 0, missN: 0,
        perfect: 0, taps: 0, strums: 0, win: WIN0, lastSay: -9, hinted: false, idleBars: 0, listen: true, kick: 0, notes: [], t0: 0, partyBars: 0, endAt: 0, overT: 0, endT: 0, all: 0, partyBeat: -1 });
      G.band = band(K.audio()); G.band.onBar = onBar; G.band.cue = cue;
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      // the painting, dark at first
      G.uni = { map: { value: null }, uPos: { value: SPOTS.map(([u, v]) => new THREE.Vector2(u, v)) }, uLit: { value: SPOTS.map(() => 0) },
        uT: { value: 0 }, uA: { value: 0 }, uBase: { value: 0.16 }, uRusty: { value: 0.55 }, uAll: { value: 0 }, uKick: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      new THREE.TextureLoader().load((ctx.work && ctx.work.image) || new URL('../../targets/reaching-past-blindness.jpg', import.meta.url).href, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the eight listeners, their rays, and a ring that pulses round the one you're reaching
      G.L = SPOTS.map(([u, v], i) => {
        const mesh = K.plane(listenerTex(ORDER_KIND[i], 'wait'), LW, LH, { order: 30 }); const [x, y] = G.S.P(u, v); mesh.position.set(x, y, 0.06); G.root.add(mesh);
        const color = new THREE.Color(COLORS[ORDER_KIND[i]]);
        // each dot of the ray: a wide coloured glow with a bright core on top, so it reads on the busy painting
        const core = color.clone().lerp(new THREE.Color('#ffffff'), 0.55);
        const dots = Array.from({ length: DOTS }, (_, k) => {
          const [du, dv] = curve(i, k / (DOTS - 1)), [dx, dy] = G.S.P(du, dv);
          const s = K.sprite(K.glowTex, 0.06, { color, additive: true, order: 25, opacity: 0 }); s.position.set(dx, dy, 0.05); s.visible = false; G.root.add(s);
          const c = K.sprite(K.dotTex, 0.02, { color: core, order: 26, opacity: 0 }); c.position.set(dx, dy, 0.052); s.core = c; c.visible = false; G.root.add(c);
          return s;
        });
        const head = K.sprite(streakTex(), 0.09, { color, additive: true, order: 26, opacity: 0 }); head.visible = false; G.root.add(head);
        return { mesh, x, y, dots, head, shown: 0, lit: false, litT: -1, ph: i * 1.3, pulse: 0 };
      });
      G.ring = K.sprite(K.ringTex, 0.2, { additive: true, order: 24, opacity: 0 }); G.root.add(G.ring);
      G.ui.buttons([
        { label: 'Strum', kind: 'red', aria: 'Strum on the big drum', press: () => tap() },
        { label: 'Help', kind: 'black', aria: 'Help: how to strum on the big drum', press: () => help() },
      ]);
      hud();
      G.onGo = () => {
        G.phase = 'play'; G.t0 = G.t; G.band.start();
        nextListener();
        G.activeFrom = K.audio().currentTime + 0.12 + BAR;   // one bar of the groove first
      };
      K.intro(G, { title: 'Reach Out', how: 'Three soft beats, then the big drum. Tap STRUM on the big drum to send Rusty’s music out to each listener.',
        say: 'Reach Out. Rusty’s music can reach people in the dark. Listen for three soft beats, then the big drum. Tap strum on the big drum. Two good strums reach each listener.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni, now = heard();
      u.uT.value = G.t; u.uA.value += ((G.over && G.overT > 5 ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      const bs = G.barStarts.filter(x => x <= now).pop();
      const beatPos = bs !== undefined ? (now - bs) / BEAT : 0, beatFrac = beatPos % 1;
      if (G.listen && now >= G.activeFrom - BEAT * 0.25) { G.listen = false; if (G.phase === 'play') hud(); }
      const active = G.phase === 'play' && G.target >= 0 && now >= G.activeFrom - 0.02;
      // the light: Rusty glows, reached listeners light their corner, everything at the end
      G.kick = Math.max(0, G.kick - dt * 2.5); u.uKick.value = G.kick;
      const drumFlash = bs !== undefined && Math.floor(beatPos) === 3 && (G.phase === 'play' || G.phase === 'party') ? Math.exp(-beatFrac * 5) : 0;
      u.uRusty.value = 0.55 + 0.25 * drumFlash + 0.05 * Math.sin(G.t * 2);
      const allTo = G.phase === 'party' || G.over ? 1 : G.reached / 8 * 0.3;
      G.all += (allTo - G.all) * Math.min(1, dt * 1.2); u.uAll.value = G.all;
      // the listeners: breathe and sway; the one you're reaching bobs on its hums; lit ones bounce on the beat
      G.L.forEach((L, i) => {
        const hummed = G.humAt.some(h => h.i === i && now >= h.t && now - h.t < 0.25);
        let sc = 1 + Math.sin(G.t * 1.6 + L.ph) * 0.015, bob = 0, rot = Math.sin(G.t * 1.1 + L.ph) * 0.03;
        if (hummed) { sc += 0.07; bob = 0.006; }
        if (L.lit) {
          L.litT += dt; u.uLit.value[i] = Math.min(1, L.litT / 0.8);
          bob = bs !== undefined ? Math.exp(-beatFrac * 5) * 0.012 * (G.phase === 'party' ? 1.6 : 1) : 0;
          sc = 1 + Math.max(0, 0.35 - L.litT) * 0.8 + bob * 2;
        }
        L.mesh.scale.set(sc, sc, 1); L.mesh.position.y = L.y + bob; L.mesh.rotation.z = rot;
        // the ray: grows toward the listener with every good strum; the comet head flies out in front
        const want = L.lit ? 1 : G.prog[i] / NEED;
        const was = L.shown; L.shown = Math.min(want, L.shown + dt * 1.8);
        const moving = L.shown < want - 0.002;
        L.dots.forEach((s, k) => {
          const kk = k / (DOTS - 1); s.visible = s.core.visible = kk <= L.shown + 0.001 && L.shown > 0;
          if (s.visible) {
            const shimmer = 0.5 + 0.5 * Math.sin(G.t * 7 - k * 0.6 + i);   // light flowing out along the ray
            s.material.opacity = 0.45 + 0.35 * shimmer + (G.phase === 'party' ? 0.15 : 0); s.scale.setScalar(0.05 + 0.02 * shimmer + (L.lit ? 0.008 : 0));
            s.core.material.opacity = 0.75 + 0.25 * shimmer; s.core.scale.setScalar(0.018 + 0.008 * shimmer);
          }
        });
        L.head.visible = moving;
        if (moving) {
          const [a, b] = curve(i, L.shown), [c, d] = curve(i, Math.max(0, L.shown - 0.03));
          const [x1, y1] = G.S.P(a, b), [x0, y0] = G.S.P(c, d);
          L.head.position.set(x1, y1, 0.055); L.head.material.rotation = Math.atan2(y1 - y0, x1 - x0); L.head.material.opacity = 1;
          if (Math.random() < dt * 30) G.fx.add(x1, y1, COLORS[ORDER_KIND[i]], 2, 0.12);
        }
        if (L.lit && was < 1 && L.shown >= 1 && !L.burst) {   // the ray arrives: the listener bursts into colour
          L.burst = true; G.fx.add(L.x, L.y, COLORS[ORDER_KIND[i]], 34, 0.4); G.fx.add(L.x, L.y, '#ffffff', 12, 0.25);
          for (let k = 0; k < 5; k++) floaty(L.x, L.y + LH * 0.3, COLORS[(ORDER_KIND[i] + k) % 8], true);
        }
      });
      // a ring round the listener you're reaching: a soft pulse on each hum, a big one on the big drum
      if (active) {
        const L = G.L[G.target], ph = beatPos < 3 ? Math.exp(-beatFrac * 4) * 0.4 : Math.exp(-(beatPos - 3) * 3) * 1;
        G.ring.position.set(L.x, L.y, 0.058); G.ring.scale.setScalar(LH * (1.1 + ph * 0.35)); G.ring.material.opacity = 0.25 + ph * 0.6;
        G.ring.material.color.set(COLORS[ORDER_KIND[G.target]]);
      } else G.ring.material.opacity = Math.max(0, G.ring.material.opacity - dt * 3);
      G.humAt = G.humAt.filter(h => now - h.t < 1);
      // at the party, notes rise from everyone on each beat
      if (G.phase === 'party' && bs !== undefined && Math.floor(beatPos) !== G.partyBeat) {
        G.partyBeat = Math.floor(beatPos); G.kick = 0.6;
        for (let k = 0; k < 3; k++) { const L = G.L[Math.floor(Math.random() * 8)]; floaty(L.x, L.y + LH * 0.3, COLORS[Math.floor(Math.random() * 8)]); }
      }
      for (let i = G.notes.length - 1; i >= 0; i--) { const h = G.notes[i]; h.t += dt; h.vy -= dt * 0.15;
        h.s.position.x += h.vx * dt * 0.3 + Math.sin(h.t * 5 + h.ph) * 0.0012; h.s.position.y += h.vy * dt * 0.3; h.s.material.rotation += h.rot * dt; h.s.material.opacity = Math.max(0, 1 - h.t / h.life);
        if (h.t > h.life) { G.root.remove(h.s); h.s.material.dispose(); G.notes.splice(i, 1); } }
      // the party, then the finale, then Rusty in his own words
      if (G.phase === 'party' && G.endAt && K.audio().currentTime >= G.endAt) finish();
      if (G.over) {
        G.overT += dt;
        if (G.overT > 2.5 && !G.artist) {
          G.band.fade(0.05, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.band.fade(0.2, 2); G.fadeAt = G.overT + 7; } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.onerror = back; G.artist.play().catch(back); } catch (e) { G.artist = { pause() {} }; back(); }
          G.clipSafety = G.overT + 23;
        }
        if (G.artist && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.band.fade(0.2, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.band.fade(0.0001, 3); }
      }
      // the robot: strums right on each big drum
      if (G.bot && G.phase === 'play' && G.target >= 0) {
        const d = G.drops.find(x => !x.tapped && now >= x.t - 0.01 && now - x.t < 0.1 && x.t >= G.activeFrom - 0.02);
        if (d && G.botLast !== d) { G.botLast = d; tap(); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      tap();   // anywhere on the screen counts
    },
    pause() { if (G) { G.paused = true; G.band.hold(); if (G.artist) G.artist.pause(); } },
    resume() {
      if (!G) return; G.paused = false;
      if (G.phase === 'play' || G.phase === 'party') { G.band.resume(); if (G.phase === 'play' && G.activeFrom < K.audio().currentTime + BAR) G.activeFrom = K.audio().currentTime + 0.12 + BAR; }
      if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {});
    },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'reach-out', phase: G.phase, playing: G.playing, over: G.over, reached: G.reached, target: G.target, strums: G.strums, perfect: G.perfect, misses: G.missN, taps: G.taps, artist: !!(G.artist && G.artist.currentTime > 0), artistT: G.artist ? +(G.artist.currentTime || 0).toFixed(1) : 0, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.band.stop(); if (G.artist) { try { G.artist.pause(); } catch (e) {} G.artist = null; } G.notes.forEach(h => h.s.material.dispose()); if (G.css) G.css.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
