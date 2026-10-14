// PATHWAYS UNVEILED (April & Melissa): OPEN ROAD SAFARI, a sound safari where you also tame the weather.
// Cars drive along the painting's roads. Six city sounds are hidden in the neighbourhoods between them: birds in a
// garden, church bells, a fountain, a dog in a yard, a train crossing and an ice cream truck. Move your finger (or point
// the phone): each sound gets louder, brighter and comes from its side as you get close; hold still on it to find it.
// Then the weather rolls in over the map and muffles everything, and you tame it:
//   RAIN: swipe back and forth like windshield wipers   ·  FOG: rub the screen clear
//   SNOW: hold your finger down like the sun to melt it ·  THUNDERSTORM: tap right after each lightning flash
// (or press the Tame button). The cars slow down and switch their headlights on in bad weather, and speed up and honk
// when it clears; after the rain comes a rainbow. When all six sounds are found, find the sisters' car by its happy
// horn and follow it. Every sound is made live with WebAudio, every line is spoken, so it plays by ear.
import * as THREE from 'three';
import * as K from './kit.js';

// the painting's roads, traced along their middles (u, v from the top-left)
const ROADS = [
  [[-0.02, 0.375], [0.1, 0.385], [0.2, 0.41], [0.3, 0.44], [0.4, 0.48], [0.5, 0.52], [0.6, 0.57], [0.7, 0.625], [0.8, 0.67], [0.9, 0.72], [1.02, 0.765]],
  [[0.36, 0.2], [0.42, 0.245], [0.5, 0.275], [0.6, 0.305], [0.7, 0.345], [0.8, 0.385], [0.9, 0.43], [1.02, 0.49]],
  [[0.53, -0.02], [0.53, 0.1], [0.52, 0.2], [0.51, 0.3], [0.49, 0.4], [0.47, 0.5], [0.445, 0.6], [0.44, 0.7], [0.435, 0.8], [0.425, 0.9], [0.415, 1.02]],
  [[0.7, -0.02], [0.65, 0.06], [0.63, 0.13], [0.65, 0.2], [0.71, 0.25], [0.8, 0.272], [0.87, 0.27]],
  [[0.31, -0.02], [0.31, 0.1], [0.3, 0.2], [0.24, 0.27], [0.14, 0.31], [0.0, 0.33], [-0.02, 0.33]],
  [[0.28, 0.5], [0.25, 0.6], [0.2, 0.7], [0.12, 0.8], [0.05, 0.9], [-0.02, 0.96]],
  [[0.48, 0.55], [0.53, 0.61], [0.565, 0.7], [0.575, 0.8], [0.57, 0.9], [0.555, 1.02]],
];
// [road, how many cars each way]
const TRAFFIC = [[0, 2], [1, 2], [2, 2], [3, 1], [4, 1], [5, 1], [6, 1]];
const CAR_COLOURS = ['#f2c230', '#d8352a', '#f1ece0', '#4fa3b8', '#ee7a2a', '#2d5fae', '#f4f0e8', '#e9a3b8'];
const SISTERS = { road: 0, dir: 1, colour: '#b44fd6' };
const SOUNDS = [
  { id: 'birds', name: 'the birds in a garden', short: 'birds', u: 0.08, v: 0.12 },
  { id: 'bells', name: 'the church bells', short: 'church bells', u: 0.88, v: 0.1 },
  { id: 'fountain', name: 'a fountain', short: 'fountain', u: 0.62, v: 0.42 },
  { id: 'dog', name: 'a dog in a yard', short: 'dog', u: 0.08, v: 0.5 },
  { id: 'train', name: 'a train crossing', short: 'train', u: 0.85, v: 0.87 },
  { id: 'icecream', name: 'the ice cream truck', short: 'ice cream', u: 0.33, v: 0.78 },
];
const WEATHER = {
  rain: { after: 1, title: 'Here comes the rain', how: 'Swipe back and forth like windshield wipers', say: 'Here comes the rain! Wipe it away: swipe back and forth like windshield wipers.', done: 'You tamed the rain!', slow: 0.55 },
  fog: { after: 3, title: 'Fog is rolling in', how: 'Rub the screen to clear it', say: 'Fog is rolling in! Rub the screen to clear it.', done: 'The fog is gone!', slow: 0.4 },
  snow: { after: 4, title: 'Snow!', how: 'Hold your finger down like the sun', say: 'Snow! Hold your finger down like the sun to melt it.', done: 'The snow melted!', slow: 0.3 },
  storm: { after: 5, title: 'Thunderstorm', how: 'Tap right after each lightning flash', say: 'A thunderstorm! Tap the screen right after each lightning flash.', done: 'The storm passed!', slow: 0.45 },
};
const FIND_R = 0.075, HOLD = 1.0, HEAR = 0.7, CAR_L = 0.036, CAR_W = 0.018, LANE = 0.013;

/* ───────────────────────── sounds: the hidden ones, the weather, the traffic ───────────────────────── */
function soundscape(ac) {
  const out = ac.createGain(); out.gain.value = 0;
  const muffle = ac.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = 18000; muffle.Q.value = 0.5;   // bad weather muffles the city
  out.connect(muffle).connect(ac.destination);
  const wxOut = ac.createGain(); wxOut.gain.value = 0.9; wxOut.connect(ac.destination);   // the weather itself is never muffled
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const panner = (pan, dest) => { if (!ac.createStereoPanner) return dest; const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(dest); return p; };
  function channel() {
    const g = ac.createGain(), f = ac.createBiquadFilter(), p = ac.createStereoPanner ? ac.createStereoPanner() : null; g.gain.value = 0; f.type = 'lowpass'; f.frequency.value = 800;
    g.connect(f); if (p) { f.connect(p); p.connect(out); } else f.connect(out);
    return { in: g, set(vol, bright, pan) { const t = ac.currentTime; g.gain.setTargetAtTime(vol, t, 0.08); f.frequency.setTargetAtTime(600 + bright * 9000, t, 0.08); if (p) p.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan)), t, 0.08); } };
  }
  const tone = (dest, t, f, dur, { type = 'sine', vol = 0.3, to = 0, attack = 0.005 } = {}) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.02); };
  const hiss = (dest, t, dur, freq, type, vol, q = 1, sweep = 0) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.02); };
  const ICE = [659, 784, 880, 784, 659, 523, 587, 659, 587, 523];   // a little music-box tune
  let iceI = 0;
  const MAKE = {
    birds: (d, t) => { const n = 3 + Math.floor(Math.random() * 3), base = 2600 + Math.random() * 900; for (let i = 0; i < n; i++) tone(d, t + i * 0.13, base + i * 120, 0.09, { to: base * 1.45, vol: 0.32 }); return 1.4 + Math.random() * 1.6; },
    bells: (d, t) => { const s = [392, 330, 294, 262]; for (let i = 0; i < 4; i++) { const f = s[(i + iceI) % 4]; tone(d, t + i * 0.55, f, 2.4, { type: 'sine', vol: 0.3 }); tone(d, t + i * 0.55, f * 2.4, 1.2, { vol: 0.08 }); tone(d, t + i * 0.55, f * 3.0, 0.8, { vol: 0.05 }); } return 3.6; },
    fountain: (d, t) => { hiss(d, t, 1.1, 1400 + Math.random() * 900, 'bandpass', 0.35, 0.6); for (let i = 0; i < 3; i++) tone(d, t + Math.random() * 0.8, 700 + Math.random() * 900, 0.05, { to: 1800, vol: 0.12 }); return 0.9; },
    dog: (d, t) => { const n = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) { tone(d, t + i * 0.28, 520, 0.16, { type: 'sawtooth', to: 260, vol: 0.28, attack: 0.008 }); hiss(d, t + i * 0.28, 0.1, 900, 'bandpass', 0.2, 1.5); } return 1.6 + Math.random() * 1.4; },
    train: (d, t) => { for (let i = 0; i < 4; i++) { tone(d, t + i * 0.5, 1180, 0.4, { type: 'triangle', vol: 0.24 }); tone(d, t + i * 0.5, 1640, 0.25, { vol: 0.08 }); } return 2.0; },   // ding, ding: the crossing bell
    icecream: (d, t) => { for (let i = 0; i < 5; i++) { const f = ICE[(iceI + i) % ICE.length]; tone(d, t + i * 0.22, f, 0.4, { type: 'triangle', vol: 0.2 }); tone(d, t + i * 0.22, f * 2, 0.15, { vol: 0.05 }); } iceI = (iceI + 5) % ICE.length; return 1.3; },
    sisters: (d, t) => { tone(d, t, 523, 0.14, { type: 'square', vol: 0.16 }); tone(d, t, 659, 0.14, { type: 'square', vol: 0.1 }); tone(d, t + 0.2, 659, 0.22, { type: 'square', vol: 0.16 }); tone(d, t + 0.2, 784, 0.22, { type: 'square', vol: 0.1 }); return 1.5; },   // beep-beep!
  };
  const ch = {}, next = {};
  for (const id of Object.keys(MAKE)) { ch[id] = channel(); next[id] = ac.currentTime + 0.5 + Math.random() * 1.5; }
  const on = new Set(SOUNDS.map(s => s.id));
  // weather beds: rain (a hiss), wind (a moving whoosh), traffic (a low hum)
  function bed(type, freq, q) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; s.connect(f).connect(g).connect(wxOut); s.start(); return { s, f, g }; }
  const rain = bed('highpass', 1800, 0.4), wind = bed('bandpass', 500, 0.8), traffic = bed('lowpass', 160, 0.7);
  let timer = null, wt = 0;
  function tick() { for (const id of on) while (next[id] < ac.currentTime + 0.12) next[id] += MAKE[id](ch[id].in, next[id]); }
  return {
    ch, on,
    start() { timer = setInterval(tick, 30); out.gain.setTargetAtTime(1.8, ac.currentTime, 0.4); traffic.g.gain.setTargetAtTime(0.05, ac.currentTime, 1); },
    volume(v) { out.gain.setTargetAtTime(v * 1.8, ac.currentTime, 0.2); wxOut.gain.setTargetAtTime(v * 0.9, ac.currentTime, 0.2); },
    // how much weather there is (0..1 each); muffles the city
    weather(w, dt) {
      const t = ac.currentTime, total = Math.min(1, w.rain + w.fog + w.snow + w.storm); wt += dt;
      rain.g.gain.setTargetAtTime(0.16 * (w.rain + w.storm * 1.2), t, 0.2);
      wind.g.gain.setTargetAtTime(0.1 * (w.fog * 0.8 + w.snow * 0.9 + w.storm * 0.6) + 0.02 * total, t, 0.3); wind.f.frequency.setTargetAtTime(380 + 260 * Math.sin(wt * 0.7), t, 0.3);
      muffle.frequency.setTargetAtTime(18000 - 16800 * total, t, 0.2);
    },
    once(id, vol = 1, pan = 0) { const d = ac.createGain(); d.gain.value = vol; d.connect(panner(pan, out)); MAKE[id](d, ac.currentTime + 0.03); },
    honk(pan, vol = 0.06) { const t = ac.currentTime + 0.02, f = 330 + Math.random() * 160, d = panner(pan, wxOut); for (const k of [0, 0.25]) if (k === 0 || Math.random() < 0.5) { tone(d, t + k, f, 0.18, { type: 'square', vol }); tone(d, t + k, f * 1.26, 0.18, { type: 'square', vol: vol * 0.6 }); } },
    thunder(pan, big = 1) { const t = ac.currentTime + 0.02, d = panner(pan, wxOut); hiss(d, t, 0.25, 2500, 'highpass', 0.35 * big, 0.5); hiss(d, t + 0.05, 2.8, 220, 'lowpass', 0.6 * big, 0.6, 60); },
    foghorn() { const t = ac.currentTime + 0.05, d = panner(-0.3, wxOut); for (const f of [110, 112.5]) { const o = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = 420;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.3); g.gain.setValueAtTime(0.09, t + 1.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6); o.connect(lp).connect(g).connect(d); o.start(t); o.stop(t + 2.7); } },
    chime(up = true) { const s = up ? [523, 659, 784, 1047] : [784, 659]; s.forEach((f, i) => tone(wxOut, ac.currentTime + 0.03 + i * 0.1, f, 0.8, { type: 'triangle', vol: 0.12 })); },
    stop() { clearInterval(timer); out.gain.setTargetAtTime(0, ac.currentTime, 0.1); wxOut.gain.setTargetAtTime(0, ac.currentTime, 0.1); setTimeout(() => { try { for (const b of [rain, wind, traffic]) b.s.stop(); out.disconnect(); wxOut.disconnect(); } catch (e) {} }, 500); },
  };
}

/* ───────────────────────── the weather layer ───────────────────────── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const WX_FRAG = `
varying vec2 vUv;
uniform float uT, uH, uRain, uFog, uSnow, uStorm, uFlash, uRainbow; uniform sampler2D uWipe;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
vec3 P; float A;
void over(vec3 c, float a){ a = clamp(a, 0.0, 1.0); P = P * (1.0 - a) + c * a; A = A * (1.0 - a) + a; }
void main(){
  vec2 p = vec2(vUv.x, (1.0 - vUv.y) * uH);
  float keep = 1.0 - texture2D(uWipe, vUv).r;          // where you wiped, it's clear
  P = vec3(0.0); A = 0.0;
  float wet = clamp(uRain + uStorm, 0.0, 1.0);
  over(vec3(0.03, 0.04, 0.09), 0.28 * wet + 0.12 * uSnow + 0.06 * uFog);           // the day goes dim
  // rain clouds drifting over the map
  float cl = fbm(p * 2.6 + vec2(uT * 0.05, uT * 0.012));
  over(mix(vec3(0.16, 0.18, 0.23), vec3(0.42, 0.45, 0.52), cl), (uRain * 0.62 + uStorm * 0.8) * smoothstep(0.3, 0.72, cl + 0.12) * keep);
  // snow settles on the map
  float sn = fbm(p * 6.0 + 3.0);
  over(vec3(0.95, 0.97, 1.0), uSnow * smoothstep(0.32, 0.6, sn + 0.2) * 0.88 * keep);
  // fog
  float fg = fbm(p * 2.0 + vec2(uT * 0.04, 0.0)) * 0.8 + fbm(p * 5.0 - uT * 0.05) * 0.3;
  over(mix(vec3(0.7, 0.74, 0.78), vec3(0.93, 0.94, 0.95), fg), uFog * clamp(0.5 + fg * 0.6, 0.0, 1.0) * 0.92 * keep);
  // falling rain
  vec2 rq = vec2(p.x * 70.0 + p.y * 9.0, p.y * 9.0 - uT * 7.0); vec2 rc = floor(rq), rf = fract(rq);
  float drop = step(0.82, hash(rc)) * (1.0 - smoothstep(0.0, 0.08, abs(rf.x - 0.5))) * smoothstep(0.0, 0.7, rf.y);
  over(vec3(0.8, 0.86, 0.95), drop * wet * 0.55);
  // falling snow
  for (int i = 0; i < 2; i++) { float fi = float(i);
    vec2 sq = p * (14.0 + fi * 9.0) + vec2(sin(uT * 0.7 + p.y * 6.0 + fi) * 0.6, -uT * (1.1 + fi * 0.5)); vec2 sc = floor(sq), sf = fract(sq) - 0.5;
    float fl = step(0.72, hash(sc + fi * 7.0)) * (1.0 - smoothstep(0.06, 0.16, length(sf - (vec2(hash(sc + 2.0), hash(sc + 5.0)) - 0.5) * 0.6)));
    over(vec3(1.0), fl * uSnow * 0.9); }
  // a rainbow after the rain
  float r = length((p - vec2(0.5, 1.15 * uH)) * vec2(1.0, 1.0));
  float band = (r - 0.62) / 0.12;
  if (band > 0.0 && band < 1.0 && uRainbow > 0.0) {
    vec3 rb = clamp(abs(mod(band * 5.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    over(rb, uRainbow * 0.42 * sin(band * 3.14159));
  }
  over(vec3(0.92, 0.95, 1.0), uFlash * 0.75);              // lightning
  gl_FragColor = vec4(A > 0.001 ? P / A : vec3(0.0), A);
}`;

/* ───────────────────────── the roads ───────────────────────── */
function makeRoad(pts, h) {
  const P = pts.map(([u, v]) => [u - 0.5, (0.5 - v) * h]), L = [0];
  for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const len = L[L.length - 1];
  function at(s) {   // position and heading at distance s along the road
    s = Math.max(0, Math.min(len - 1e-6, s)); let i = 1; while (L[i] < s) i++;
    const a = P[i - 1], b = P[i], k = (s - L[i - 1]) / (L[i] - L[i - 1]), dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy);
    return { x: a[0] + dx * k, y: a[1] + dy * k, tx: dx / n, ty: dy / n };
  }
  return { len, at };
}
function carTex(colour, heart) {
  return K.canvasTex(64, 32, (g) => {
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect ? g.roundRect(3, 5, 60, 25, 9) : g.rect(3, 5, 60, 25); g.fill();
    g.fillStyle = colour; g.beginPath(); g.roundRect ? g.roundRect(2, 3, 58, 25, 9) : g.rect(2, 3, 58, 25); g.fill();
    g.fillStyle = 'rgba(20,28,48,.85)'; g.fillRect(36, 7, 10, 17); g.fillRect(12, 8, 6, 15);   // windshield, back window
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(19, 7, 16, 17);
    g.fillStyle = '#fff6c8'; g.fillRect(56, 5, 4, 6); g.fillRect(56, 20, 4, 6);                // headlights
    g.fillStyle = '#c0182a'; g.fillRect(2, 5, 3, 6); g.fillRect(2, 20, 3, 6);                  // tail lights
    if (heart) { g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('♥', 27, 16); }
  });
}

export function openRoadSafariGame() {
  let G = null;
  const N = SOUNDS.length;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);
  const sistersAt = () => { const c = G.sisters, p = { u: c.x + 0.5, v: 0.5 - c.y / G.h }; return { id: 'sisters', name: 'the sisters', ...p }; };
  const targets = () => (G.found < N ? SOUNDS.filter(s => !s.got) : (G.metSisters ? [] : [sistersAt()]));

  function hud(near) {
    const heat = near === undefined ? '' : near < 0.1 ? 'Right here! Hold still.' : near < 0.22 ? 'Very close' : near < 0.4 ? 'Getting warmer' : 'Listen…';
    if (G.wx) { const W = WEATHER[G.wx.type]; G.ui.panel('Tame the weather', W.title, { segs: [Math.round(G.wx.prog * 10), 10], sub: W.how, warn: true }); return; }
    G.ui.panel('Open road safari', `${G.found}<small>of ${N} sounds</small>`, { segs: [G.found, N], sub: G.found < N ? heat || 'Listen for the hidden sounds' : 'Follow the sisters’ car horn' + (heat ? ' · ' + heat : '') });
  }

  /* ── finding things ── */
  function find(s) {
    s.got = true; G.found++;
    const [x, y] = G.S.P(s.u, s.v); G.fx.add(x, y, '#fff3c4', 26, 0.3); G.buzz([30, 40, 70]);
    K.chord([523.3, 659.3, 784].map(f => f * (1 + G.found * 0.06)), 0.9, { vol: 0.05 });
    G.ui.pop(s.short.toUpperCase());
    const W = Object.entries(WEATHER).find(([, w]) => w.after === G.found);
    if (G.found >= N) { G.ui.alert('Now find the sisters', 'Follow their car’s happy horn.', 2.6, 'blue'); G.say(`You found ${s.name}. That's all six! Now find the sisters' car. Listen for its happy horn, and follow it.`); G.sc.on.add('sisters'); }
    else if (W) { G.say(`You found ${s.name}.`); G.wxWait = 2.2; G.wxNext = W[0]; }
    else G.say(`You found ${s.name}. ${N - G.found} more.`);
    G.lastHud = -1;
  }
  function metSisters() {
    G.metSisters = true; G.settle = 3.8; G.buzz([60, 60, 160]);
    G.sc.on.delete('sisters'); G.sc.once('sisters', 1.4);
    G.cars.forEach((c, i) => setTimeout(() => G && G.sc.honk(Math.max(-1, Math.min(1, c.x * 2)), 0.05), 300 + i * 90));
    G.ui.alert('You found them!', 'The roads keep opening.', 3, 'red'); G.say('You found them! The roads keep opening.');
    G.rainbow = 1;
  }
  function hint() {
    if (G.wx) { G.say(WEATHER[G.wx.type].say); return; }
    const s = targets().sort((a, b) => dist(a, G.ear) - dist(b, G.ear))[0]; if (!s) return;
    const du = s.u - G.ear.u, dv = s.v - G.ear.v, d = dist(s, G.ear);
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const msg = d < FIND_R ? 'You’re on it. Hold still.' : `${d < 0.22 ? 'Very close. ' : ''}Try ${[v, h].filter(Boolean).join(' and ') || 'a tiny bit further'}.`;
    G.ui.alert('Hint', msg, 1.8, 'blue'); G.say(msg);
  }

  /* ── the weather ── */
  function wipeClear() { const g = G.wipeC.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, 128, 128); G.wipeTex.needsUpdate = true; }
  function wipeAt(u, v, r = 14, a = 0.55) {
    const g = G.wipeC.getContext('2d'), x = u * 128, y = v * 128, gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); G.wipeTex.needsUpdate = true;
  }
  function startWeather(type) {
    G.wx = { type, prog: 0, lvl: 0, lastX: null, dirX: 0, flashT: 2.0, flashOn: -9, strikes: 0 };
    wipeClear(); G.hold = 0;
    const W = WEATHER[type];
    G.ui.alert(W.title, W.how, 2.6, 'red'); G.say(W.say); G.buzz([40, 30, 40]);
    if (type === 'rain') G.sc.thunder(-0.6, 0.35);
    if (type === 'fog') G.sc.foghorn();
    if (type === 'storm') G.sc.thunder(0.5, 0.8);
    G.ui.buttons(buttons()); hud();
  }
  function tame(amount) {
    const X = G.wx; if (!X || X.done) return;
    X.prog = Math.min(1, X.prog + amount);
    if (X.prog >= 1) {
      X.done = true; const W = WEATHER[X.type];
      G.ui.alert(W.done, 'Back to listening.', 2, 'black'); G.say(W.done + ' Back to listening.'); G.sc.chime(true); G.buzz([30, 30, 80]);
      if (X.type === 'rain' || X.type === 'storm') G.rainbow = 1;
      G.tamed++; G.clearT = 1.4;
      G.cars.forEach((c, i) => { if (i % 3 === 0) setTimeout(() => G && G.sc.honk(Math.max(-1, Math.min(1, c.x * 2))), 400 + i * 120); });
    }
    hud();
  }
  function weatherUpdate(dt) {
    const X = G.wx, lv = G.wxLv;
    for (const k of ['rain', 'fog', 'snow', 'storm']) {
      const want = X && X.type === k && !X.done ? 1 - X.prog * 0.75 : 0;
      lv[k] += (want - lv[k]) * Math.min(1, dt * (want > lv[k] ? 1.6 : 2.2));
    }
    if (X && X.done) { G.clearT -= dt; if (G.clearT <= 0) { G.wx = null; G.ui.buttons(buttons()); hud(); } }
    // the thunderstorm: a rumble from one side, then the flash; tap just after it
    if (X && X.type === 'storm' && !X.done) {
      X.flashT -= dt;
      if (X.flashT <= 0) { X.flashT = 2.2 + Math.random() * 1.2; X.flashOn = G.t; X.side = Math.random() < 0.5 ? -1 : 1; G.flash = 1; G.sc.thunder(X.side * 0.7, 1); G.buzz(40);
        const [x, y] = G.S.P(0.5 + X.side * 0.25, 0.3); G.bolt.position.set(x, y, 0.07); G.bolt.material.opacity = 1; }
      if (G.bot && G.t - X.flashOn > 0.3 && G.t - X.flashOn < 1.0) tap();
    }
    if (G.bot && X && !X.done && X.type !== 'storm') { X.botT = (X.botT || 0) + dt; if (X.type === 'snow') { tame(dt / 3); wipeAt(0.5 + Math.sin(G.t) * 0.3, 0.5, 30, 0.08); } else if (X.botT > 0.25) { X.botT = 0; tame(0.08); wipeAt(Math.random(), Math.random(), 22, 0.7); } }
    G.flash = Math.max(0, G.flash - dt * 3.5); G.bolt.material.opacity = Math.max(0, G.bolt.material.opacity - dt * 3);
    G.rainbow = Math.max(0, G.rainbow - dt * 0.12);
    const U = G.wu; U.uT.value = G.t; U.uRain.value = lv.rain; U.uFog.value = lv.fog; U.uSnow.value = lv.snow; U.uStorm.value = lv.storm; U.uFlash.value = G.flash; U.uRainbow.value = Math.min(1, G.rainbow * 1.5);
    G.sc.weather(lv, dt);
  }
  function tap() {
    const X = G.wx; if (!X || X.done || X.type !== 'storm') return;
    const since = G.t - X.flashOn;
    if (since < 1.1) { X.flashOn = -9; G.ui.pop('Caught it!'); K.sfx.good(0, ++X.strikes); tame(0.34); wipeAt(0.5 + (X.side || 0) * 0.25, 0.3, 60, 0.9); }
    else { K.tone(180, 0.15, { type: 'triangle', vol: 0.06 }); }
  }
  function buttons() {
    const B = [{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint', press: () => G.playing && hint() }];
    if (G.wx && !G.wx.done) {
      const t = G.wx.type;
      B.push({ label: 'Tame', icon: '☀', kind: 'red', aria: 'Tame the weather',
        press: () => { if (!G.playing || !G.wx) return; if (t === 'storm') tap(); else if (t === 'snow') G.btnHold = true; else { tame(0.1); wipeAt(Math.random(), Math.random(), 26, 0.8); } },
        release: () => { G.btnHold = false; } });
    }
    return B;
  }

  /* ── the cars ── */
  function makeCars() {
    G.roads = ROADS.map(r => makeRoad(r, G.h)); G.cars = [];
    let ci = 0;
    const add = (road, dir, s, colour, heart = false) => {
      const m = K.plane(carTex(colour, heart), CAR_L, CAR_W, { order: 13, opacity: 0 }); m.position.z = 0.035; G.root.add(m);
      const lamp = K.sprite(K.glowTex, 0.05, { color: '#fff4c8', additive: true, opacity: 0, order: 14 }); lamp.position.z = 0.036; G.root.add(lamp);
      const tail = K.sprite(K.glowTex, 0.02, { color: '#ff3040', additive: true, opacity: 0, order: 14 }); tail.position.z = 0.036; G.root.add(tail);
      const c = { road, dir, s, m, lamp, tail, speed: 0.055 + (road % 3) * 0.006, x: 0, y: 0, honkT: 4 + Math.random() * 10 };
      G.cars.push(c); return c;
    };
    for (const [ri, n] of TRAFFIC) {
      const R = G.roads[ri];
      for (const dir of [1, -1]) for (let i = 0; i < n; i++) add(ri, dir, ((i + (dir < 0 ? 0.5 : 0)) / n) * R.len + Math.random() * 0.05, CAR_COLOURS[ci++ % CAR_COLOURS.length]);
    }
    G.sisters = add(SISTERS.road, SISTERS.dir, 0.25 * G.roads[SISTERS.road].len, SISTERS.colour, true);
  }
  function carsUpdate(dt) {
    const lv = G.wxLv, slow = 1 - lv.rain * (1 - WEATHER.rain.slow) - lv.fog * (1 - WEATHER.fog.slow) - lv.snow * (1 - WEATHER.snow.slow) - lv.storm * (1 - WEATHER.storm.slow);
    const lights = Math.min(1, (lv.rain + lv.fog + lv.snow + lv.storm) * 1.6), show = G.ready;
    for (const c of G.cars) {
      const R = G.roads[c.road];
      c.s += c.dir * c.speed * Math.max(0.2, slow) * dt;
      if (c.s > R.len) c.s -= R.len; if (c.s < 0) c.s += R.len;
      const p = R.at(c.s), tx = p.tx * c.dir, ty = p.ty * c.dir;
      c.x = p.x + ty * LANE; c.y = p.y - tx * LANE;                       // keep to the right of the road
      const edge = Math.min(c.s, R.len - c.s), fade = Math.min(1, edge / 0.03) * show;
      c.m.position.set(c.x, c.y, 0.035); c.m.rotation.z = Math.atan2(ty, tx); c.m.material.opacity = fade;
      c.lamp.position.set(c.x + tx * 0.03, c.y + ty * 0.03, 0.036); c.lamp.material.opacity = fade * lights * 0.75;
      c.tail.position.set(c.x - tx * 0.02, c.y - ty * 0.02, 0.036); c.tail.material.opacity = fade * lights * 0.7;
      if (G.playing && !G.wx) { c.honkT -= dt; if (c.honkT <= 0) { c.honkT = 8 + Math.random() * 14; if (fade > 0.5 && Math.random() < 0.35) G.sc.honk(Math.max(-1, Math.min(1, c.x * 2)), 0.025); } }
    }
    const s = G.sisters; s.m.scale.setScalar(1.15 + (G.found >= N && !G.metSisters ? 0.12 * Math.sin(G.t * 6) : 0));
  }

  return {
    title: 'Open road safari',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { found: 0, tamed: 0, ear: { u: 0.5, v: 0.62 }, aim: { u: 0.5, v: 0.62 }, touch: null, touchT: 0, hold: 0, metSisters: false, settle: 0, t0: 0, lastHud: 0,
        wx: null, wxNext: null, wxWait: 0, wxLv: { rain: 0, fog: 0, snow: 0, storm: 0 }, flash: 0, rainbow: 0, clearT: 0, ready: 0, btnHold: false, last: null });
      SOUNDS.forEach(s => { s.got = false; });
      // the weather layer and the "wipe" mask (where you've cleared it)
      G.wipeC = document.createElement('canvas'); G.wipeC.width = G.wipeC.height = 128;
      G.wipeTex = new THREE.CanvasTexture(G.wipeC); G.wipeTex.colorSpace = THREE.NoColorSpace; wipeClear();
      G.wu = { uT: { value: 0 }, uH: { value: G.h }, uRain: { value: 0 }, uFog: { value: 0 }, uSnow: { value: 0 }, uStorm: { value: 0 }, uFlash: { value: 0 }, uRainbow: { value: 0 }, uWipe: { value: G.wipeTex } };
      G.wxm = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.ShaderMaterial({ uniforms: G.wu, vertexShader: VERT, fragmentShader: WX_FRAG, transparent: true, depthWrite: false }));
      G.wxm.position.z = 0.045; G.wxm.renderOrder = 15; G.root.add(G.wxm);
      G.bolt = K.sprite(K.canvasTex(64, 128, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineJoin = 'round'; g.shadowColor = '#9fd0ff'; g.shadowBlur = 12; g.beginPath(); g.moveTo(38, 4); g.lineTo(22, 52); g.lineTo(40, 56); g.lineTo(18, 124); g.stroke(); }), 0.2, { additive: true, opacity: 0, order: 17 });
      G.root.add(G.bolt);
      makeCars();
      G.ring = K.sprite(K.ringTex, 0.08, { color: '#ffffff', order: 16, opacity: 0 }); G.ring.position.z = 0.05; G.root.add(G.ring);
      G.sc = K.audio() ? soundscape(K.audio()) : null;
      if (!G.sc) G.sc = new Proxy({ ch: new Proxy({}, { get: () => ({ set() {} }) }), on: new Set() }, { get: (o, k) => (k in o ? o[k] : () => {}) });   // no sound: everything still works
      G.ui.buttons(buttons());
      hud();
      G.onGo = () => { G.t0 = G.t; G.sc.start(); const w = (location.search.match(/[?&]wx=(rain|fog|snow|storm)\b/) || [])[1]; if (w) { G.wxNext = w; G.wxWait = 0.5; } };   // &wx=rain etc. starts with that weather (for testing)
      K.intro(G, { title: 'Open road safari', how: 'Find six hidden city sounds by ear: move your finger or your phone toward each one and hold still. When the weather rolls in, tame it!',
        say: 'Open road safari. The roads are busy, and six city sounds are hidden between them: birds, church bells, a fountain, a dog, a train crossing and an ice cream truck. Move your finger, or point your phone, toward a sound. It gets louder and comes from its side as you get close. Hold still on it to find it. But watch the sky: when the weather rolls in, you have to tame it. Headphones make it even better.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.ready = Math.min(1, G.ready + dt * 1.5);
      carsUpdate(dt); weatherUpdate(dt);
      // where you're listening from: a finger, else where the phone points
      if (G.bot && G.playing && !G.wx) { const s = targets()[0]; if (s) { G.aim.u += (s.u - G.aim.u) * Math.min(1, dt * 2.5); G.aim.v += (s.v - G.aim.v) * Math.min(1, dt * 2.5); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const k = Math.min(1, dt * 10); G.ear.u += (G.aim.u - G.ear.u) * k; G.ear.v += (G.aim.v - G.ear.v) * k;
      const [ex, ey] = G.S.P(G.ear.u, G.ear.v); G.ring.position.set(ex, ey, 0.05);
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('pathways-unveiled:safari', t, 'lower');
        G.sc.volume(0.35); for (const s of SOUNDS) G.sc.ch[s.id].set(0.45, 0.8, (s.u - 0.5) * 1.6);   // the whole city, softly, all around
        K.finale(G, { won: true, title: 'The roads keep opening', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Sounds', v: `${N}/${N}` }, { k: 'Weather tamed', v: G.tamed }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
      } return; }
      if (!G.playing) return;
      // the weather is coming
      if (G.wxNext) { G.wxWait -= dt; if (G.wxWait <= 0) { const w = G.wxNext; G.wxNext = null; startWeather(w); } }
      if (G.wx && !G.wx.done && G.wx.type === 'snow' && (G.btnHold || (G.touch && G.wx.touching))) {   // the sun melts the snow where you hold
        tame(dt / 3); const at = G.btnHold ? { u: 0.5, v: 0.5 } : G.touch; wipeAt(at.u, at.v, 18 + G.wx.prog * 50, 0.06);
      }
      G.ring.material.opacity = G.wx ? 0 : G.ring.material.opacity;
      // every sound: louder, brighter and from its side as you get close (all quieter while the weather is wild)
      let near = 9, nearS = null;
      const list = [...SOUNDS, ...(G.found >= N && !G.metSisters ? [sistersAt()] : [])];
      for (const s of list) {
        if (!G.sc.on.has(s.id)) continue;
        const d = dist(s, G.ear), c = Math.max(0, 1 - d / HEAR), pan = (s.u - G.ear.u) * 2.6;
        if (s.got) G.sc.ch[s.id].set(0.05 + c * c * 0.2, 0.3, pan);
        else G.sc.ch[s.id].set(0.02 + c * c * 0.95, c, pan);
        if (!s.got && d < near) { near = d; nearS = s; }
      }
      if (G.wx || G.wxNext) { G.hold = 0; return; }
      G.ring.material.opacity = 0.4 + Math.max(0, 0.5 - near) * 1.2; G.ring.scale.setScalar(0.06 + Math.max(0, 0.4 - near) * 0.12 + Math.sin(G.t * 6) * 0.004);
      const R = nearS && nearS.id === 'sisters' ? FIND_R * 1.4 : FIND_R;
      if (nearS && near < R) {
        G.hold += dt; G.pulse = (G.pulse || 0) - dt; if (G.pulse <= 0) { G.pulse = 0.22; G.buzz(14); }
        if (G.hold >= HOLD) { G.hold = 0; if (nearS.id === 'sisters') metSisters(); else find(nearS); }
      } else G.hold = Math.max(0, G.hold - dt * 2);
      G.lastHud -= dt; if (G.lastHud <= 0) { G.lastHud = 0.4; hud(near); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      const p = G.S.toBoard(ev, G.root);
      const X = G.wx && !G.wx.done ? G.wx : null;
      if (kind === 'up') { G.touch = null; G.touchT = 1.0; if (X) X.touching = false; G.last = null; return; }
      if (kind === 'down' && X && X.type === 'storm') { tap(); return; }
      if (kind === 'down' || (kind === 'move' && G.touch)) {
        if (!p) return;
        if (X) {
          X.touching = true;
          if (G.last && (X.type === 'rain' || X.type === 'fog')) {
            const dx = p.u - G.last.u, d = Math.hypot(dx, (p.v - G.last.v) * G.h);
            let gain = d / (X.type === 'rain' ? 2.4 : 2.0);
            if (X.type === 'rain' && Math.abs(dx) > 0.004) { const dir = Math.sign(dx); if (X.dirX && dir !== X.dirX) { gain += 0.035; K.noise(0.12, { vol: 0.08, freq: 1400, sweepTo: 700, pan: dir * 0.5 }); } X.dirX = dir; }   // a wiper swish on every turn
            tame(Math.min(0.06, gain)); wipeAt(p.u, p.v, X.type === 'rain' ? 12 : 16, 0.5);
          }
          G.last = { u: p.u, v: p.v };
        }
        G.touch = { u: p.u, v: p.v };
      }
    },
    pause() { if (G) { G.paused = true; G.sc && G.sc.volume(0); } },
    resume() { if (G) { G.paused = false; G.sc && G.sc.volume(G.metSisters ? 0.35 : 1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'open-road-safari', playing: G.playing, over: G.over, found: G.found, tamed: G.tamed, wx: G.wx && G.wx.type, prog: G.wx ? +G.wx.prog.toFixed(2) : null, sisters: G.metSisters, ear: [+G.ear.u.toFixed(2), +G.ear.v.toFixed(2)], cars: G.cars.length, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.sc) G.sc.stop(); K.cleanup(G); G = null; },
  };
}
export { soundscape as openRoadSounds };   // for testing the sounds on their own
