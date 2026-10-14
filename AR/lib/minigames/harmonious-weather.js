// HARMONIOUS GATHERING (Will Hollimon): BLOW THE STORM AWAY, a weather helper game.
// The musical town starts out just like the painting: golden sky, the river flowing under the bridge, the band playing,
// notes floating up from the musicians. Then a storm rolls in: dark clouds drift into the sky from off the edges of the
// painting, the light dims, the wind picks up and the music falters. Blow into the phone's microphone to blow the
// clouds back out of the sky, so the town can have its harmonious gathering. But careful:
//   · when a cloud FLICKERS (and crackles), it's charged: wait. Blowing on it then sets off lightning.
//   · and don't blow too hard for too long: that makes lightning too.
// Lightning flashes, thunder cracks, and the storm pushes back in. Three storms, each a little bigger; after each one
// the band plays on with one more instrument. No microphone? Hold the Blow button (or hold a finger on the screen).
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

// where the water is (the river in front, under the bridge, and the channel behind) and where the sky is
const WATER = [
  [[0, 0.905], [0.12, 0.895], [0.22, 0.885], [0.3, 0.865], [0.32, 0.8], [0.36, 0.785], [0.43, 0.8], [0.46, 0.85], [0.52, 0.885], [0.6, 0.905], [0.75, 0.915], [1, 0.92], [1, 1], [0, 1]],
  [[0.2, 0.555], [0.33, 0.55], [0.345, 0.6], [0.31, 0.67], [0.265, 0.7], [0.22, 0.66]],
];
const SKY = [[0, 0], [1, 0], [1, 0.14], [0.95, 0.13], [0.92, 0.1], [0.88, 0.08], [0.85, 0.06], [0.8, 0.05], [0.72, 0.06], [0.68, 0.1], [0.63, 0.17], [0.6, 0.22], [0.55, 0.3], [0.5, 0.33], [0.4, 0.36], [0.35, 0.33], [0.3, 0.33], [0.2, 0.27], [0.18, 0.3], [0.12, 0.33], [0.05, 0.3], [0, 0.32]];
const MUSICIANS = [[0.15, 0.74], [0.25, 0.72], [0.55, 0.79], [0.77, 0.77], [0.88, 0.71], [0.47, 0.57], [0.65, 0.19], [0.93, 0.16]];
const STORMS = [{ clouds: 3, speed: 0.05, charge: [5, 7] }, { clouds: 4, speed: 0.06, charge: [3.8, 5.5] }, { clouds: 5, speed: 0.07, charge: [3, 4.5] }];
const CHARGE = 1.7, TOO_HARD = 0.82, TOO_LONG = 1.3, GONE = 0.42;   // a cloud is gone once it's this far past the painting's edge

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the town: the river flows, the storm dims everything, lightning flashes, rain falls
const TOWN_FRAG = `
varying vec2 vUv;
uniform sampler2D map, uWater; uniform float uT, uStorm, uFlash, uRain, uSun, uA;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float w = texture2D(uWater, vUv).r;
  vec2 off = vec2(sin(p.y * 140.0 + uT * 2.4) * 0.0035 + sin(p.x * 25.0 - uT * 1.6) * 0.002, sin(p.x * 45.0 - uT * 3.0) * 0.0022) * w * (1.0 + uStorm);
  vec3 c = texture2D(map, vec2(p.x + off.x, 1.0 - (p.y + off.y))).rgb;
  float hl = pow(max(0.0, sin(p.x * 34.0 - uT * 1.8 + sin(p.y * 95.0 + uT) * 2.0)), 14.0);    // light on the moving water
  c += vec3(1.0, 0.92, 0.75) * hl * 0.28 * w * (1.0 - uStorm * 0.7);
  float g = dot(c, vec3(0.3, 0.59, 0.11));
  c = mix(c, vec3(g) * vec3(0.8, 0.86, 1.0), uStorm * 0.4) * (1.0 - uStorm * 0.42);       // the storm dims the town
  vec2 rq = vec2(p.x * 80.0 + p.y * 14.0, p.y * 10.0 - uT * 9.0); vec2 rc = floor(rq), rf = fract(rq);
  c += vec3(0.75, 0.82, 0.95) * step(0.84, hash(rc)) * (1.0 - smoothstep(0.0, 0.07, abs(rf.x - 0.5))) * smoothstep(0.0, 0.8, rf.y) * uRain * 0.35;
  c += vec3(0.9, 0.95, 1.0) * uFlash * 0.5;
  c += vec3(1.0, 0.8, 0.45) * uSun * 0.12 * exp(-length((p - vec2(0.48, 0.12)) * vec2(1.0, 1.3)) * 2.2);   // the sun comes back
  gl_FragColor = vec4(c, uA);
}`;
// the storm clouds: a layer wider than the painting, so they drift in from off the edges
const CLOUD_FRAG = `
varying vec2 vUv;
uniform sampler2D uSky; uniform float uT, uFlash; uniform vec4 uC[6]; uniform float uCh[6];
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 p = vec2(-0.6 + vUv.x * 2.2, 0.55 - vUv.y * 0.7);      // painting coordinates (u, v), reaching past the edges
  vec3 P = vec3(0.0); float A = 0.0;
  for (int i = 0; i < 6; i++) {
    vec4 c = uC[i]; if (c.w <= 0.0) continue;
    vec2 d = (p - c.xy) / (c.z * vec2(1.7, 0.72));
    float n = fbm(p * 5.0 + vec2(float(i) * 3.7, uT * 0.06)), dens = smoothstep(0.0, 0.32, 1.0 - length(d) + (n - 0.5) * 0.75) * c.w;
    float lit = clamp(0.45 - d.y * 0.5 + (n - 0.5) * 0.6, 0.0, 1.0);
    vec3 col = mix(vec3(0.13, 0.14, 0.19), vec3(0.52, 0.54, 0.6), lit);
    float fl = uCh[i] * (0.5 + 0.5 * step(0.5, fract(uT * 9.0 + float(i) * 0.37))) * smoothstep(0.35, 0.8, n);   // a charged cloud flickers inside
    col += vec3(0.6, 0.72, 1.0) * fl * 0.9 + vec3(0.9, 0.95, 1.0) * uFlash * 0.6;
    P = P * (1.0 - dens) + col * dens; A = A * (1.0 - dens) + dens;
  }
  float inside = step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
  float sky = mix(1.0, mix(0.15, 1.0, texture2D(uSky, vec2(clamp(p.x, 0.0, 1.0), 1.0 - clamp(p.y, 0.0, 1.0))).r), inside);
  float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) * smoothstep(0.0, 0.12, vUv.y);
  gl_FragColor = vec4(A > 0.001 ? P / A : vec3(0.0), A * sky * edge);
}`;

/* ───────────────────────── the town band ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CH = [[48, 52, 55, 57], [45, 52, 55, 60], [50, 53, 57, 60], [43, 50, 53, 59]];   // C6 · Am7 · Dm7 · G7
const WALK = [[36, 40, 43, 44], [33, 36, 40, 37], [38, 41, 45, 42], [31, 35, 38, 35]];
const TUNE = [[76, 0, 1], [79, 1, 0.5], [81, 1.5, 1], [79, 2.5, 0.5], [76, 3, 1], [72, 4, 1.5], [74, 5.5, 0.5], [76, 6, 1], [74, 7, 1], [72, 8, 0.5], [69, 8.5, 1], [72, 9.5, 1.5], [74, 12, 1], [76, 13, 0.5], [74, 13.5, 0.5], [71, 14, 2]];
function townBand(ac) {
  const BPM = 104, beat = 60 / BPM;
  const out = ac.createGain(); out.gain.value = 0;
  const muffle = ac.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = 16000; out.connect(muffle).connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);   // storm sounds (never muffled)
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  const tone = (t, f, dur, { type = 'sine', vol = 0.08, att = 0.005, p = 0, dest = out, filt = 0, vib = 0 } = {}) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (filt) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filt; o.connect(fl); n = fl; }
    if (vib) { const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 5.5; vg.gain.value = vib; v.connect(vg).connect(o.detune); v.start(t); v.stop(t + dur + 0.05); }
    n.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  };
  const noise = (t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.1, p = 0, dest = out, sweep = 0, att = 0.005 } = {}) => {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  };
  const pluck = (t, m, vol, p) => { tone(t, midi(m), 0.5, { type: 'triangle', vol, p }); tone(t, midi(m) * 2, 0.18, { type: 'sawtooth', vol: vol * 0.25, p, filt: 2600 }); };
  // the storm's own sounds: wind, your breath, the crackle of a charged cloud
  function bed(type, freq, q) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; s.connect(f).connect(g).connect(fx); s.start(); return { s, f, g }; }
  const wind = bed('bandpass', 420, 0.7), breath = bed('bandpass', 900, 0.5), crackle = bed('highpass', 3000, 0.7);
  const layers = { guitar: 1, bass: 1, brush: 0, tune: 0, horns: 0 };
  let next = ac.currentTime + 0.1, step = 0, timer = null;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, bar = Math.floor(step / 8), ch = bar % 4, sw = b8 % 2 ? beat * 0.16 : 0, tt = t + sw;
      if (layers.guitar && (b8 === 2 || b8 === 6 || b8 === 7)) CH[ch].forEach((m, i) => pluck(tt + i * 0.012, m + 12, b8 === 7 ? 0.025 : 0.04, -0.4));
      if (layers.bass && b8 % 2 === 0) tone(t, midi(WALK[ch][b8 / 2]), beat * 0.9, { type: 'triangle', vol: 0.2, att: 0.01, p: 0.1 });
      if (layers.brush) { if (b8 === 2 || b8 === 6) noise(t, 0.22, { freq: 3500, q: 0.5, vol: 0.06, att: 0.04 }); noise(tt, 0.05, { freq: 8000, type: 'highpass', vol: b8 % 2 ? 0.025 : 0.04, p: 0.3 }); }
      if (layers.tune) { const pos = (bar % 4) * 4 + b8 / 2; for (const [m, at, d] of TUNE) if (Math.abs(at - pos) < 0.01) tone(tt, midi(m), d * beat, { type: 'sawtooth', vol: 0.045, att: 0.05, p: 0.35, filt: 2200, vib: 14 }); }
      if (layers.horns && (b8 === 3 || b8 === 7) && bar % 2 === 1) CH[ch].forEach(m => tone(tt, midi(m + 12), beat * 0.4, { type: 'square', vol: 0.016, att: 0.02, filt: 1800, p: -0.1 }));
      next += beat / 2; step++;
    }
  }
  return {
    layers,
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); out.gain.setTargetAtTime(1.1, ac.currentTime, 0.3); },
    storm(s, blow, charge) {   // how stormy (0..1), how hard you're blowing, how charged the clouds are
      const t = ac.currentTime;
      out.gain.setTargetAtTime(1.1 * (1 - s * 0.75), t, 0.3); muffle.frequency.setTargetAtTime(16000 - s * 15000, t, 0.3);
      wind.g.gain.setTargetAtTime(0.02 + s * 0.13, t, 0.3); wind.f.frequency.setTargetAtTime(350 + Math.sin(t * 0.7) * 120, t, 0.3);
      breath.g.gain.setTargetAtTime(blow * 0.16, t, 0.05); breath.f.frequency.setTargetAtTime(500 + blow * 1400, t, 0.05);
      crackle.g.gain.setTargetAtTime(charge * (0.03 + Math.random() * 0.05), t, 0.02);
    },
    thunder(p = 0) { const t = ac.currentTime + 0.02; noise(t, 0.2, { freq: 2600, type: 'highpass', vol: 0.4, p, dest: fx, q: 0.5 }); noise(t + 0.06, 3, { freq: 200, type: 'lowpass', vol: 0.7, p, dest: fx, sweep: 55, q: 0.6 }); },
    rumble(p = 0) { noise(ac.currentTime + 0.02, 2.2, { freq: 140, type: 'lowpass', vol: 0.18, p, dest: fx, att: 0.4 }); },
    poof(p = 0, n = 0) { const t = ac.currentTime + 0.02; noise(t, 0.5, { freq: 600, vol: 0.12, p, dest: fx, sweep: 2400 }); [523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(t + 0.1 + i * 0.07, f * (1 + n * 0.06), 0.5, { type: 'triangle', vol: 0.06, p, dest: fx })); },
    cheer() { const t = ac.currentTime + 0.05; for (let i = 0; i < 40; i++) noise(t + Math.random() * 1.6, 0.03, { freq: 1800 + Math.random() * 1500, q: 2, vol: 0.06 + Math.random() * 0.06, p: Math.random() * 2 - 1, dest: fx }); for (let i = 0; i < 4; i++) noise(t + i * 0.3, 0.6, { freq: 900 + i * 120, q: 4, vol: 0.05, p: Math.random() - 0.5, dest: fx, att: 0.08 }); },
    volume(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.2); },
    stop() { clearInterval(timer); timer = null; out.gain.setTargetAtTime(0, ac.currentTime, 0.2); fx.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { for (const b of [wind, breath, crackle]) b.s.stop(); out.disconnect(); fx.disconnect(); } catch (e) {} }, 700); },
  };
}

/* ── the microphone: how hard you're blowing (0..1) ── */
function blowMeter(ac, stream) {
  const src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 1024; src.connect(an);
  const buf = new Float32Array(an.fftSize); let floor = 0.01, lvl = 0;
  return {
    read() {
      an.getFloatTimeDomainData(buf); let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / buf.length);
      if (rms < floor * 1.5) floor += (rms - floor) * 0.01; else floor += (rms - floor) * 0.0005;   // learn how quiet the room is
      const raw = Math.max(0, Math.min(1, (rms - floor * 2) / 0.16));
      lvl += (raw - lvl) * (raw > lvl ? 0.5 : 0.15); return lvl;
    },
    stop() { try { src.disconnect(); } catch (e) {} stream.getTracks().forEach(t => t.stop()); },
  };
}

function maskTex(polys, blur = 4) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.filter = `blur(${blur}px)`; g.fillStyle = '#fff';
  for (const P of polys) { g.beginPath(); P.forEach(([u, v], i) => g[i ? 'lineTo' : 'moveTo'](u * 256, v * 256)); g.closePath(); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}
const boltTex = K.canvasTex(64, 256, (g) => {
  g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineJoin = 'round'; g.shadowColor = '#a9d4ff'; g.shadowBlur = 14;
  g.beginPath(); let x = 32; g.moveTo(x, 0); for (let y = 16; y <= 256; y += 16) { x += (Math.random() - 0.5) * 26; x = Math.max(8, Math.min(56, x)); g.lineTo(x, y); } g.stroke();
});
const noteTex = ['♪', '♫'].map(ch => K.canvasTex(96, 96, (g) => { g.font = '900 78px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(ch, 48, 52); }));

export function blowTheStormGame() {
  let G = null;

  function hud() {
    if (G.phase === 'calm' || G.phase === 'between') { G.ui.panel('Harmonious gathering', G.phase === 'calm' ? 'The band is playing' : 'The band plays on!', { segs: [G.cleared, STORMS.length], sub: G.phase === 'calm' ? 'Enjoy the music… for now' : 'Another storm is coming' }); return; }
    if (G.phase !== 'storm') return;
    const left = G.clouds.filter(c => !c.gone).length;
    const warn = G.blow > TOO_HARD ? 'Easy! Too hard!' : G.clouds.some(c => c.charge > 0) ? 'A cloud is flickering: WAIT!' : G.blow > 0.15 ? 'Blowing…' : 'Blow into the phone';
    G.ui.panel(`Storm ${G.wave + 1} of ${STORMS.length}`, `${left}<small>${left === 1 ? 'cloud' : 'clouds'} left</small>`, { segs: [G.cleared, STORMS.length], sub: warn + (G.strikes ? ` · ⚡ ${G.strikes}` : ''), warn: G.blow > TOO_HARD || G.clouds.some(c => c.charge > 0) });
  }
  function startStorm(i) {
    const S = STORMS[i]; G.phase = 'storm'; G.wave = i; G.chargeT = S.charge[0] + 1.5; G.hard = 0;
    G.clouds = [];
    for (let k = 0; k < S.clouds; k++) {
      const side = k % 2 ? 1 : -1, u = side < 0 ? -0.5 - Math.random() * 0.25 : 1.5 + Math.random() * 0.25;
      G.clouds.push({ u, v: 0.05 + Math.random() * 0.17, r: 0.17 + Math.random() * 0.07, side, home: 0.2 + (k / Math.max(1, S.clouds - 1)) * 0.6, charge: 0, gone: false, a: 1, bump: 0 });
    }
    const first = i === 0;
    G.ui.alert(first ? 'A storm is rolling in!' : 'Here comes another storm!', 'Blow into your phone to blow the clouds away', 2.8, 'red');
    G.say(first ? 'Oh no, a storm is rolling in! Blow into your phone to blow the clouds away, so the town can play. But when a cloud flickers and crackles, wait! Blowing on it makes lightning. And don’t blow too hard.' : `Here comes storm ${i + 1}! Blow the clouds away. Wait when they flicker.`);
    G.band.rumble(0); hud();
  }
  function strike(c, why) {
    G.strikes++; G.flash = 1; G.buzz([80, 40, 140]);
    const p = Math.max(-1, Math.min(1, (c.u - 0.5) * 1.6)); G.band.thunder(p);
    const tu = Math.max(0.08, Math.min(0.92, c.u)), [x0, y0] = G.S.P(tu, c.v + 0.05), [x1, y1] = G.S.P(tu + (Math.random() - 0.5) * 0.1, 0.55);
    G.bolt.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.09); G.bolt.scale.set(0.12, Math.abs(y0 - y1), 1); G.bolt.material.opacity = 1;
    // the storm pushes back in
    for (const k of G.clouds) if (!k.gone) { k.u += -k.side * 0.12; k.bump = 1; }
    c.charge = 0; G.hard = 0;
    G.ui.alert('⚡ Lightning!', why, 1.6, 'black'); G.say(why);
  }

  return {
    title: 'Blow the storm away',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', wave: -1, cleared: 0, strikes: 0, clouds: [], blow: 0, hard: 0, chargeT: 0, phaseT: 0, flash: 0, storm: 0, sun: 0, notes: [], noteT: 0, btn: false, hold: false, endT: 0, t0: 0, micOK: false, micNo: false });
      // the town (the painting, with the river flowing) and the cloud layer that reaches past the edges
      G.tu = { map: { value: null }, uWater: { value: maskTex(WATER, 3) }, uT: { value: 0 }, uStorm: { value: 0 }, uFlash: { value: 0 }, uRain: { value: 0 }, uSun: { value: 0 }, uA: { value: 0 } };
      G.town = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.tu, vertexShader: VERT, fragmentShader: TOWN_FRAG, transparent: true, depthWrite: false }));
      G.town.position.z = 0.03; G.town.renderOrder = 12; G.root.add(G.town);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.tu.map.value = t; G.ready = true; });
      G.cu = { uSky: { value: maskTex([SKY], 5) }, uT: { value: 0 }, uFlash: { value: 0 }, uC: { value: Array.from({ length: 6 }, () => new THREE.Vector4()) }, uCh: { value: new Array(6).fill(0) } };
      G.cloudM = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.7 * G.h), new THREE.ShaderMaterial({ uniforms: G.cu, vertexShader: VERT, fragmentShader: CLOUD_FRAG, transparent: true, depthWrite: false }));
      { const [, y] = G.S.P(0.5, 0.2); G.cloudM.position.set(0, y, 0.06); } G.cloudM.renderOrder = 20; G.root.add(G.cloudM);
      G.bolt = K.plane(boltTex, 0.12, 0.4, { order: 22, additive: true, opacity: 0 }); G.root.add(G.bolt);
      G.band = K.audio() ? townBand(K.audio()) : new Proxy({ layers: {} }, { get: (o, k) => (k in o ? o[k] : () => {}) });
      // the microphone (no microphone: the Blow button, or hold a finger on the screen)
      if (!G.bot && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } })
          .then(st => { if (!G) { st.getTracks().forEach(t => t.stop()); return; } G.mic = blowMeter(K.audio(), st); G.micOK = true; })
          .catch(() => { if (G) G.micNo = true; });
      } else G.micNo = !G.bot;
      G.ui.buttons([{ label: 'Blow', icon: '🌬', kind: 'red', aria: 'Blow (hold)', press: () => { G.btn = true; }, release: () => { G.btn = false; } }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); G.phase = 'calm'; G.phaseT = 6; hud(); if (G.micNo) G.ui.alert('No microphone?', 'Hold the Blow button instead', 2.5, 'blue'); };
      K.intro(G, { title: 'Blow the storm away', how: 'The town is gathering for music. When a storm rolls in, blow into your phone to blow the clouds away. When a cloud flickers, wait! And don’t blow too hard.',
        say: 'Blow the storm away. The whole town is gathering to play music by the river. But a storm is coming. When the clouds roll in, blow into your phone to blow them out of the sky. Careful: when a cloud flickers and crackles, wait, or you’ll set off lightning. And don’t blow too hard. No microphone? Hold the blow button.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.tu.uA.value += ((G.ready && !G.over ? 1 : 0) - G.tu.uA.value) * Math.min(1, dt * 2);
      G.tu.uT.value = G.t; G.cu.uT.value = G.t;
      // how hard you're blowing
      let blow = G.mic ? G.mic.read() : 0;
      if (G.btn || G.hold) blow = Math.max(blow, 0.55);
      if (G.bot && G.phase === 'storm') blow = G.clouds.some(c => c.charge > 0) ? 0 : 0.6;
      G.blow = blow;
      const charge = G.clouds.reduce((m, c) => Math.max(m, c.gone ? 0 : c.charge > 0 ? 1 : 0), 0);
      // the timeline: calm → storm → the band plays on → … → the gathering
      if (G.phase === 'calm' || G.phase === 'between') { G.phaseT -= dt; if (G.phaseT <= 0 && G.playing) startStorm(G.phase === 'calm' ? 0 : G.wave + 1); }
      if (G.phase === 'storm' && G.playing) {
        const S = STORMS[G.wave];
        // too hard, for too long: lightning
        if (blow > TOO_HARD) { G.hard += dt; if (G.hard > TOO_LONG) { const c = G.clouds.filter(c => !c.gone).sort((a, b) => Math.abs(a.u - 0.5) - Math.abs(b.u - 0.5))[0]; if (c) strike(c, 'Too hard! A gentle, steady breath works best.'); } }
        else G.hard = Math.max(0, G.hard - dt * 2);
        // clouds charge up now and then: wait until they settle
        G.chargeT -= dt;
        if (G.chargeT <= 0) { G.chargeT = S.charge[0] + Math.random() * (S.charge[1] - S.charge[0]); const live = G.clouds.filter(c => !c.gone && c.u > -0.1 && c.u < 1.1); const c = live[Math.floor(Math.random() * live.length)]; if (c) { c.charge = CHARGE; G.say('Wait!'); } }
        for (const c of G.clouds) {
          if (c.gone) { c.a = Math.max(0, c.a - dt * 1.5); continue; }
          if (c.charge > 0) { c.charge -= dt; if (blow > 0.3 && CHARGE - c.charge > 0.4) strike(c, 'Lightning! Wait while the clouds flicker.'); else if (c.charge <= 0) G.band.rumble((c.u - 0.5) * 1.6); }
          // the storm drifts in toward the sky over the town; your breath pushes it back out
          const off = c.u < 0 || c.u > 1, sp = off && !c.entered ? 0.11 : S.speed, inward = (c.home - c.u) * sp * 3, push = c.entered ? blow * 0.32 * c.side * (c.charge > 0 ? 0 : 1) : 0;
          c.u += (Math.sign(inward) * Math.min(Math.abs(inward), sp) + push) * dt;
          if (!c.entered && c.u > 0.02 && c.u < 0.98) c.entered = true;
          c.v = Math.max(0.03, Math.min(0.25, c.v + Math.sin(G.t * 0.4 + c.home * 9) * 0.004 * dt));
          c.bump = Math.max(0, c.bump - dt * 2);
          if (c.u < -GONE || c.u > 1 + GONE) { if (Math.abs(c.u - 0.5) > 0.5 + GONE && push !== 0) { c.gone = true; G.band.poof((c.u - 0.5) * 1.6, G.clouds.filter(k => k.gone).length); G.buzz(30); G.ui.pop('Whoosh!'); } }
        }
        if (G.clouds.every(c => c.gone)) {
          G.cleared++; G.band.cheer();
          const L = G.band.layers; if (G.cleared === 1) L.brush = 1; if (G.cleared === 2) L.tune = 1; if (G.cleared === 3) L.horns = 1;
          if (G.cleared >= STORMS.length) { G.phase = 'done'; G.endT = 0; G.ui.alert('The sky is clear!', 'Let the gathering begin!', 3, 'red'); G.say('You blew the storm away! The sky is clear, and the whole town plays together.'); }
          else { G.phase = 'between'; G.phaseT = 6; G.ui.alert('The sky is clear!', 'The band plays on!', 2.4, 'red'); G.say(['The sky is clear! Listen, the drums are back.', 'Clear again! Now the fiddle joins in.'][G.cleared - 1] || 'Clear again!'); }
        }
      }
      // the picture and the sound follow the storm
      const cover = G.clouds.reduce((s, c) => s + (c.gone ? 0 : c.a * Math.max(0, 1 - Math.max(0, Math.abs(c.u - 0.5) - 0.45) / 0.35)), 0);
      G.storm += (Math.min(1, cover / 3) - G.storm) * Math.min(1, dt * 1.5);
      G.sun += ((G.phase === 'done' ? 1 : 0) - G.sun) * Math.min(1, dt * 0.8);
      G.flash = Math.max(0, G.flash - dt * 2.8);
      G.tu.uStorm.value = G.storm; G.tu.uFlash.value = G.flash; G.tu.uRain.value = Math.max(0, G.storm - 0.45) * 1.8; G.tu.uSun.value = G.sun; G.cu.uFlash.value = G.flash;
      G.clouds.forEach((c, i) => { if (i < 6) { G.cu.uC.value[i].set(c.u, c.v, c.r * (1 + c.bump * 0.15), c.gone ? c.a : 1); G.cu.uCh.value[i] = c.charge > 0 && !c.gone ? 1 : 0; } });
      for (let i = G.clouds.length; i < 6; i++) G.cu.uC.value[i].w = 0;
      G.bolt.material.opacity = Math.max(0, G.bolt.material.opacity - dt * 3);
      G.band.storm(G.storm, blow, charge);
      // music notes float up from the musicians while the sky is clear
      G.noteT -= dt;
      if (G.noteT <= 0 && G.playing !== false && G.phase !== 'intro') {
        G.noteT = (G.phase === 'done' ? 0.12 : 0.45) / Math.max(0.2, 1 - G.storm);
        if (G.storm < 0.6) { const [u, v] = MUSICIANS[Math.floor(Math.random() * MUSICIANS.length)], s = K.sprite(noteTex[Math.floor(Math.random() * 2)], 0.04, { color: ['#ffe9a8', '#ffd0a0', '#fff6e0'][Math.floor(Math.random() * 3)], opacity: 0, order: 18 });
          const [x, y] = G.S.P(u, v - 0.04); s.position.set(x, y, 0.05); G.root.add(s); G.notes.push({ s, t: 0, x, y, dx: (Math.random() - 0.5) * 0.05 }); }
      }
      for (let i = G.notes.length - 1; i >= 0; i--) { const n = G.notes[i]; n.t += dt; n.s.position.set(n.x + n.dx * n.t + Math.sin(n.t * 3) * 0.006, n.y + n.t * 0.05, 0.05); n.s.material.opacity = Math.min(0.9, n.t * 3) * Math.max(0, 1 - n.t / 2.2) * (1 - G.storm * 0.8); if (n.t > 2.2) { G.root.remove(n.s); G.notes.splice(i, 1); } }
      if (G.phase === 'storm' || G.phase === 'calm' || G.phase === 'between') { G.hudT = (G.hudT || 0) - dt; if (G.hudT <= 0) { G.hudT = 0.25; hud(); } }
      // the gathering
      if (G.phase === 'done') {
        G.endT += dt;
        if (G.endT > 5 && !G.over) {
          if (G.mic) { G.mic.stop(); G.mic = null; }
          const t = Math.round(G.t - G.t0), r = K.best('harmonious-gathering:storm', G.strikes, 'lower');
          K.finale(G, { won: true, title: 'Let the gathering begin', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Storms', v: `${STORMS.length}/${STORMS.length}` }, { k: 'Lightning', v: G.strikes }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
          G.band.volume(0.8);
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') G.hold = true; else if (kind === 'up') G.hold = false;   // no microphone: hold a finger on the screen to blow
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(1.1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'blow-storm', playing: G.playing, over: G.over, phase: G.phase, wave: G.wave, cleared: G.cleared, strikes: G.strikes, storm: +G.storm.toFixed(2), blow: +G.blow.toFixed(2), clouds: G.clouds.map(c => `${c.u.toFixed(2)}${c.charge > 0 ? '⚡' : ''}${c.gone ? '✓' : ''}`), mic: G.micOK, t: +G.t.toFixed(1) }; },
    stop() { if (G) { if (G.mic) G.mic.stop(); G.band && G.band.stop && G.band.stop(); } K.cleanup(G); G = null; },
  };
}
