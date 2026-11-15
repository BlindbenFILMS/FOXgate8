// MOMENT OF COMMUNION (Marcus Roberts): CALM THE CROSSING.
// Two towns face each other across the river, and a fragile bridge joins them. People from both sides start at the
// ends of the bridge and walk toward each other, to meet in the middle (the moment of communion). The river runs
// under the bridge and falls into the deep below. But storms keep rolling in: dark clouds swirl in the sky, rain falls,
// lightning flashes, and the people stop and huddle and wait. Calm the storm by lighting the windows: dark windows
// glow in both towns, tap each one (or press Light a window) and it lights up warm, and every warm light pushes the
// storm back. When the sky is calm, they walk on. Three storms (3, 4, then 5 windows); the towns get cosier with each,
// and when everyone meets in the middle the clouds part and the sun pours down.
// The people were cut out of the painting (media/games/communion/p1–p5.png) and the bridge filled in (bridge.jpg).
// Lofi music plays throughout (the storm muffles it). By ear: the storm's wind and thunder, a soft rising chime for every
// gentle stroke, footsteps when they walk, and everything is spoken.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = new URL('../../media/games/communion/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
// the people: where they were cut from (u0, v0, u1, v1), where they start, where they meet
const PEOPLE = [
  { id: 'p1', box: [0.3, 0.545, 0.338, 0.592], from: 0.17, to: 0.395, dir: 1 },
  { id: 'p2', box: [0.398, 0.54, 0.44, 0.597], from: 0.23, to: 0.43, dir: 1 },
  { id: 'p3', box: [0.44, 0.56, 0.465, 0.597], from: 0.74, to: 0.47, dir: -1 },
  { id: 'p4', box: [0.462, 0.552, 0.486, 0.596], from: 0.8, to: 0.5, dir: -1 },
  { id: 'p5', box: [0.545, 0.567, 0.565, 0.59], from: 0.86, to: 0.535, dir: -1 },
];
const feetV = u => (u < 0.62 ? 0.594 : 0.594 - (u - 0.62) * 0.07);   // the bridge deck, rising a little on the right
const WALK = 0.0115;
const STORMS = [{ at: 4 }, { at: 0 }, { at: 0 }];   // when the first storm comes
// the windows to light, storm by storm (u, v on the painting), back and forth between the two towns
const WINDOWS = [
  [[0.17, 0.33], [0.78, 0.33], [0.25, 0.27]],
  [[0.12, 0.42], [0.88, 0.38], [0.21, 0.18], [0.72, 0.2]],
  [[0.08, 0.22], [0.93, 0.25], [0.3, 0.38], [0.83, 0.15], [0.68, 0.3]],
];
const WIN = 0.075, WIN_HIT = 0.14;   // how big a window looks, and how close a tap must be
// a little town window: arched, four panes, a wooden frame; dark, or lit warm from inside
function windowTex(lit) {
  return K.canvasTex(128, 128, (g) => {
    if (lit) { const h = g.createRadialGradient(64, 66, 4, 64, 66, 62); h.addColorStop(0, 'rgba(255,214,120,.9)'); h.addColorStop(.5, 'rgba(255,170,60,.35)'); h.addColorStop(1, 'rgba(255,160,40,0)'); g.fillStyle = h; g.fillRect(0, 0, 128, 128); }
    const path = () => { g.beginPath(); g.moveTo(40, 100); g.lineTo(40, 50); g.arc(64, 50, 24, Math.PI, 0); g.lineTo(88, 100); g.closePath(); };
    path(); g.lineWidth = 12; g.strokeStyle = '#3a2716'; g.stroke();
    path(); g.fillStyle = lit ? (() => { const f = g.createLinearGradient(0, 26, 0, 100); f.addColorStop(0, '#fff3c4'); f.addColorStop(1, '#ffb347'); return f; })() : '#1d2433'; g.fill();
    g.lineWidth = 5; g.strokeStyle = lit ? '#8a5a26' : '#3a2716'; g.beginPath(); g.moveTo(64, 28); g.lineTo(64, 100); g.moveTo(40, 64); g.lineTo(88, 64); g.stroke();
    g.fillStyle = '#4a321c'; g.fillRect(34, 98, 60, 9);   // the sill
    if (!lit) { g.fillStyle = 'rgba(160,190,230,.25)'; g.fillRect(44, 40, 14, 20); }   // a gleam on the dark glass
  });
}
const WATER = [
  [[0.47, 0.33], [0.53, 0.33], [0.56, 0.42], [0.565, 0.5], [0.56, 0.575], [0.42, 0.575], [0.43, 0.5], [0.45, 0.42]],
  [[0.27, 0.505], [0.3, 0.47], [0.36, 0.44], [0.41, 0.445], [0.38, 0.47], [0.33, 0.49], [0.29, 0.52]],
  [[0.575, 0.42], [0.625, 0.45], [0.61, 0.485], [0.57, 0.47]],
];
const FALLS = [[[0.35, 0.615], [0.585, 0.615], [0.6, 1.0], [0.33, 1.0]]];
const SKY = [[0, 0], [1, 0], [1, 0.08], [0.92, 0.06], [0.85, 0.1], [0.75, 0.12], [0.7, 0.2], [0.62, 0.27], [0.56, 0.33], [0.44, 0.33], [0.38, 0.28], [0.3, 0.2], [0.2, 0.15], [0.1, 0.1], [0, 0.12]];

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, uMask; uniform float uT, uH, uA, uS, uFlash, uSun;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec4 m = texture2D(uMask, vUv);                 // r: the river · g: the falls below the bridge · b: the sky
  float river = m.r, falls = m.g, sky = m.b;
  // the river runs toward you; below the bridge it falls away into the deep
  float depth = clamp((p.y - 0.33) / 0.25, 0.0, 1.0);
  vec2 off = vec2(sin(p.y * 160.0 - uT * 4.0) * 0.0018 * depth, 0.0) * river;
  off += vec2(sin(p.x * 60.0 + p.y * 20.0 - uT * 2.0) * 0.002, sin(p.y * 40.0 - uT * 5.0) * 0.004) * falls;
  vec3 c = texture2D(map, vec2(p.x + off.x, 1.0 - (p.y + off.y))).rgb;
  float flow = fbm(vec2(p.x * 40.0, p.y * 18.0 - uT * (0.8 + depth * 1.6)));
  c += vec3(1.0, 0.98, 0.92) * river * pow(flow, 4.0) * 0.55;
  float streak = fbm(vec2(p.x * 70.0, p.y * 6.0 - uT * 1.8));
  c = mix(c, vec3(0.88, 0.93, 0.95), falls * smoothstep(0.55, 0.85, streak) * 0.35);
  // the storm: clouds roll into the sky, everything dims, rain falls, lightning flashes
  vec2 sc = p - vec2(0.5, 0.15); float a = atan(sc.y, sc.x) + uT * (0.05 + uS * 0.35), r = length(sc);
  float cl = fbm(vec2(cos(a), sin(a)) * r * 4.0 + vec2(uT * 0.05, 0.0)) ;
  float cover = smoothstep(0.62, 0.25, abs(p.x - 0.5) * 2.0 * (1.15 - uS) + (1.0 - cl) * 0.6) * uS;
  vec3 storm = mix(vec3(0.16, 0.17, 0.21), vec3(0.45, 0.47, 0.52), cl);
  c = mix(c, storm, cover * mix(0.35, 1.0, sky));
  c = mix(c, vec3(dot(c, vec3(0.3, 0.59, 0.11))) * vec3(0.85, 0.9, 1.0), uS * 0.35) * (1.0 - uS * 0.35);
  vec2 rq = vec2(p.x * 90.0 + p.y * 12.0, p.y * 11.0 - uT * 9.0), rc = floor(rq), rf = fract(rq);
  c += vec3(0.8, 0.86, 0.95) * step(0.86, hash(rc)) * (1.0 - smoothstep(0.0, 0.07, abs(rf.x - 0.5))) * smoothstep(0.0, 0.8, rf.y) * max(0.0, uS - 0.45) * 0.6;
  c += vec3(0.95, 0.97, 1.0) * uFlash * 0.45;
  // the sun pours down when they meet
  c += vec3(1.0, 0.86, 0.55) * uSun * 0.3 * exp(-length((p - vec2(0.5, 0.05)) * vec2(1.6, 1.0)) * 2.0);
  c += vec3(1.0, 0.9, 0.6) * uSun * 0.15 * exp(-length((p - vec2(0.46, 0.57)) * vec2(1.0, 2.0)) * 8.0);
  gl_FragColor = vec4(c, uA);
}`;

function maskTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.globalCompositeOperation = 'lighter'; g.filter = 'blur(2px)';
  const draw = (polys, col) => { g.fillStyle = col; for (const P of polys) { g.beginPath(); P.forEach(([u, v], i) => g[i ? 'lineTo' : 'moveTo'](u * 256, v * 256)); g.closePath(); g.fill(); } };
  draw(WATER, '#ff0000'); draw(FALLS, '#00ff00'); draw([SKY], '#0000ff');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; return t;
}

/* ───────────────────────── lofi, under the storm ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[50, 54, 57, 61, 64], [47, 50, 54, 57, 61], [43, 47, 50, 54, 57], [45, 49, 52, 54, 59]];   // Dmaj9 · Bm9 · Gmaj9 · A6/9
const BASS = [38, 35, 31, 33];
const MEL = [[78, 0, 1], [76, 1, 0.5], [73, 1.5, 1.5], [71, 4, 1], [73, 5, 0.5], [76, 5.5, 1.5], [74, 8, 1.5], [73, 9.5, 0.5], [71, 10, 1], [69, 12, 1], [71, 13, 0.5], [73, 13.5, 2]];
function band(ac) {
  const BPM = 76, beat = 60 / BPM, bar = beat * 4;
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3200; tape.Q.value = 0.5; bus.connect(tape).connect(ac.destination);
  const air = ac.createGain(); air.gain.value = 0; air.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  const keys = (t, m, dur, vol = 0.045) => { tone(t, midi(m), dur, { vol, att: 0.03 }); tone(t, midi(m) * 2, dur * 0.4, { type: 'triangle', vol: vol * 0.15, att: 0.02 }); };
  const piano = (t, m, vol = 0.05) => { tone(t, midi(m), 1.4, { type: 'triangle', vol, att: 0.004, out: air }); tone(t, midi(m) * 2, 0.5, { vol: vol * 0.25, att: 0.004, out: air }); };
  // the storm's wind and rain
  function bed(type, freq, q) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0; s.connect(f).connect(g).connect(fx); s.start(); return { s, f, g }; }
  const wind = bed('bandpass', 450, 0.7), rain = bed('highpass', 2000, 0.4);
  let next = ac.currentTime + 0.1, step = 0, timer = null;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, barN = Math.floor(step / 8), ch = barN % 4, sw = b8 % 2 ? beat * 0.09 : 0, tt = t + sw;
      if (b8 === 0) CHORDS[ch].forEach((m, i) => keys(t + i * 0.015, m + 12, bar * 0.95));
      noise(tt, 0.04, { freq: 7000, type: 'highpass', q: 0.6, vol: b8 % 2 ? 0.035 : 0.06, p: 0.25, out: air });
      if (b8 === 0 || b8 === 5) tone(tt, 110, 0.4, { vol: 0.4, slide: 42, att: 0.006 });
      if (b8 === 2 || b8 === 6) noise(tt, 0.2, { freq: 1700, q: 0.7, vol: 0.12 });
      if (b8 === 0) tone(t, midi(BASS[ch]), beat * 1.8, { type: 'triangle', vol: 0.2, att: 0.02 }); if (b8 === 3) tone(tt, midi(BASS[ch] + 7), beat * 0.8, { type: 'triangle', vol: 0.16 });
      { const pos = (barN % 4) * 4 + b8 / 2; for (const [m, at] of MEL) if (Math.abs(at - pos) < 0.01) piano(tt, m); }
      if (Math.random() < 0.3) noise(t + Math.random() * beat / 2, 0.012, { freq: 2500 + Math.random() * 2500, q: 3, vol: 0.03 + Math.random() * 0.04, p: Math.random() - 0.5, out: air });
      next += beat / 2; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.9); },
    storm(s) { const t = ac.currentTime; tape.frequency.setTargetAtTime(3200 - s * 2500, t, 0.3); bus.gain.setTargetAtTime(this.v * (1 - s * 0.55), t, 0.3); air.gain.setTargetAtTime(this.v * (1 - s * 0.7), t, 0.3);
      wind.g.gain.setTargetAtTime(0.02 + s * 0.15, t, 0.3); wind.f.frequency.setTargetAtTime(350 + s * 600 + Math.sin(t) * 100, t, 0.3); rain.g.gain.setTargetAtTime(Math.max(0, s - 0.4) * 0.22, t, 0.3); },
    v: 0.9,
    volume(v) { this.v = v; bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); air.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    soothe(n) { tone(ac.currentTime + 0.01, midi([74, 76, 78, 81, 83, 86][n % 6]), 0.9, { vol: 0.05, out: fx }); },
    thunder(p = 0, big = 1) { const t = ac.currentTime + 0.02; noise(t, 0.2, { freq: 2600, type: 'highpass', vol: 0.3 * big, p, out: fx, q: 0.5 }); noise(t + 0.05, 2.6, { freq: 200, type: 'lowpass', vol: 0.55 * big, p, out: fx, sweep: 55, q: 0.6 }); },
    step(p) { noise(ac.currentTime + 0.01, 0.05, { freq: 900, q: 2, vol: 0.05, p, out: fx }); },
    calm() { const t = ac.currentTime + 0.05; [62, 66, 69, 74].forEach((m, i) => tone(t + i * 0.1, midi(m + 12), 1.2, { type: 'triangle', vol: 0.07, out: fx })); },
    communion() { const t = ac.currentTime + 0.1; [50, 57, 62, 66, 69, 74, 78].forEach((m, i) => tone(t + i * 0.16, midi(m), 4, { type: 'triangle', vol: 0.06, att: 0.1, out: fx })); },
    stop() { clearInterval(timer); timer = null; this.volume(0); setTimeout(() => { try { wind.s.stop(); rain.s.stop(); bus.disconnect(); air.disconnect(); fx.disconnect(); } catch (e) {} }, 700); },
  };
}

export function calmCrossingGame() {
  let G = null;

  function hud() {
    const there = G.people.filter(p => Math.abs(p.u - p.to) < 0.005).length;
    const left = G.storming ? G.wins.filter(w => w.wave === G.wave && !w.lit).length : 0;
    const sub = G.storming ? `Tap the glowing windows to light them · ${left} to go` : there === G.people.length ? 'Together' : 'They walk while the sky is calm';
    G.ui.panel(G.sky > 0.35 ? `Storm ${G.wave + 1} of ${STORMS.length}` : 'Calm the crossing', `${there}<small>of ${G.people.length} in the middle</small>`, { segs: [G.cleared, STORMS.length], sub, warn: G.sky > 0.35 });
  }
  function startStorm() {
    G.wave++; G.storming = true;
    for (const w of G.wins) if (w.wave === G.wave) w.show = true;   // this storm's windows appear, dark, waiting to be lit
    const n = WINDOWS[G.wave].length;
    G.ui.alert(G.wave === 0 ? 'A storm is coming' : 'Another storm', `Light the ${n} windows to calm it`, 2.6, 'red');
    G.say(G.wave === 0 ? `A storm is rolling in, and the people stop to wait. Light the windows to calm it: tap the ${n} glowing windows in the towns, or press Light a window. Every warm light pushes the storm back.` : [`Here comes another storm. Light ${n} more windows.`, `One more storm. Light the last ${n} windows.`][G.wave - 1]);
    G.band.thunder(0, 0.5);
  }
  function calmed() {
    G.storming = false; G.cleared++; G.botT = 2.5; G.band.calm(); G.buzz([30, 30, 80]); G.flash = 0;
    G.ui.alert('The storm is calm', 'They walk on', 2, 'blue'); G.say('The storm is calm. They walk on.');
    G.nextStorm = G.cleared < STORMS.length ? 6 + Math.random() * 2.5 : -1;
    hud();
  }
  // light a window: it glows warm, the light pushes the storm back, and when this storm's windows are all lit it's calm
  function light(w) {
    if (!G.storming || !w || w.lit || w.wave !== G.wave) return;
    w.lit = true; w.pop = 1; w.s.material.map = G.winTex.on; w.s.material.needsUpdate = true;
    const left = G.wins.filter(x => x.wave === G.wave && !x.lit).length, n = WINDOWS[G.wave].length;
    G.band.soothe(G.chimes++); G.buzz([20, 30, 40]);
    const [x, y] = G.S.P(w.u, w.v); G.fx.add(x, y, '#ffd88a', 18, 0.25);
    G.warm.push({ x, y, t: 0 });
    G.sky = Math.min(G.sky, 0.25 + 0.75 * left / n);   // each light pushes the clouds back a step
    if (!left) calmed(); else { G.ui.pop(left === 1 ? 'One more!' : 'Warm!'); if (left === 1) G.say('One more window.'); }
    hud();
  }
  const nextWin = (near) => { const ws = G.wins.filter(w => w.wave === G.wave && !w.lit); if (!ws.length) return null;
    return near ? ws.sort((a, b) => Math.hypot(a.u - near.u, (a.v - near.v) * G.h) - Math.hypot(b.u - near.u, (b.v - near.v) * G.h))[0] : ws[0]; };

  return {
    title: 'Calm the crossing',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { wave: -1, cleared: 0, sky: 0, storming: false, nextStorm: STORMS[0].at, warm: [], winHum: 0, flash: 0, sun: 0, chimeT: 1, chimes: 0, last: null, btn: false, endT: -1, t0: 0, boltT: 3, trail: [], said: {} });
      G.uni = { map: { value: null }, uMask: { value: maskTex() }, uT: { value: 0 }, uH: { value: G.h }, uA: { value: 0 }, uS: { value: 0 }, uFlash: { value: 0 }, uSun: { value: 0 } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      new THREE.TextureLoader().load(ART + 'bridge.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // the people, cut out of the painting, at the two ends of the bridge
      G.people = PEOPLE.map(P => {
        const w = P.box[2] - P.box[0], hh = (P.box[3] - P.box[1]) * G.h;
        const m = K.plane(null, w, hh, { order: 14, opacity: 0 }); m.position.z = 0.04; G.root.add(m);
        new THREE.TextureLoader().load(ART + P.id + '.png', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; m.material.map = t; m.material.needsUpdate = true; });
        return { ...P, m, w, hh, u: P.from, ph: Math.random() * 6, stepT: 0 };
      });
      G.bolt = K.plane(K.canvasTex(64, 256, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 5; g.shadowColor = '#a9d4ff'; g.shadowBlur = 14; g.beginPath(); let x = 32; g.moveTo(x, 0); for (let y = 16; y <= 256; y += 16) { x = Math.max(8, Math.min(56, x + (Math.random() - 0.5) * 26)); g.lineTo(x, y); } g.stroke(); }), 0.1, 0.35, { order: 16, additive: true, opacity: 0 });
      G.root.add(G.bolt);
      G.band = K.audio() ? band(K.audio()) : new Proxy({}, { get: () => () => {} });
      G.band.start && G.band.start();
      // the windows, all twelve, hidden until their storm
      G.winTex = { off: windowTex(false), on: windowTex(true) };
      G.wins = WINDOWS.flatMap((list, wave) => list.map(([u, v]) => {
        const s = K.sprite(G.winTex.off, WIN, { order: 15, opacity: 0 }), [x, y] = G.S.P(u, v); s.position.set(x, y, 0.045); G.root.add(s);
        const ring = K.sprite(K.ringTex, WIN * 1.5, { color: '#ffd27a', opacity: 0, order: 15 }); ring.position.set(x, y, 0.044); G.root.add(ring);
        const glow = K.sprite(K.glowTex, WIN * 3, { color: '#ffb347', additive: true, opacity: 0, order: 13 }); glow.position.set(x, y, 0.042); G.root.add(glow);
        return { u, v, wave, s, ring, glow, show: false, lit: false, pop: 0, a: 0 }; }));
      G.ui.buttons([{ label: 'Light a window', icon: '💡', kind: 'red', aria: 'Light a window', press: () => light(nextWin()) }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.say('They start to walk toward each other.'); };
      K.intro(G, { title: 'Calm the crossing', how: 'People from both towns are crossing the bridge to meet in the middle. When a storm rolls in, they stop. Calm it by lighting the windows: tap each glowing window.',
        say: 'Calm the crossing. People from both towns are crossing the bridge, to meet each other in the middle. The river runs beneath them. But storms keep rolling in, and when they do, everyone stops and waits. Calm the storm by lighting the windows. Tap each glowing window in the towns, or press Light a window. Every warm light pushes the storm back.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.uT.value = G.t; U.uA.value += ((G.ready && !G.over ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2);
      // the storms come and go
      if (G.playing && !G.storming && G.nextStorm >= 0 && G.endT < 0) { G.nextStorm -= dt; if (G.nextStorm <= 0) { G.nextStorm = -1; startStorm(); } }
      if (G.storming) {
        { const n = WINDOWS[G.wave].length, left = G.wins.filter(w => w.wave === G.wave && !w.lit).length; G.sky = Math.min(0.25 + 0.75 * left / n, G.sky + dt * (0.1 + G.wave * 0.03)); }
        G.sky = Math.max(G.sky, 0);
        if (G.bot) { G.botT = (G.botT ?? 2.5) - dt; if (G.botT <= 0) { G.botT = 1.0; light(nextWin()); } }   // the robot lets each storm build up a moment first
        // by ear: the next dark window hums softly from its side
        G.winHum -= dt; if (G.winHum <= 0) { G.winHum = 1.6; const w = nextWin(); if (w) K.tone(660, 0.25, { type: 'triangle', vol: 0.04, pan: Math.max(-1, Math.min(1, (w.u - 0.5) * 1.8)) }); }
        if (G.sky > 0.72) { G.boltT -= dt; if (G.boltT <= 0) { G.boltT = 2.5 + Math.random() * 3; G.flash = 1; const u = 0.3 + Math.random() * 0.4; G.band.thunder((u - 0.5) * 1.6, 0.8); const [x, y] = G.S.P(u, 0.25); G.bolt.position.set(x, y, 0.05); G.bolt.material.opacity = 1; } }
      } else G.sky = Math.max(0, G.sky - dt * 0.4);
      G.flash = Math.max(0, G.flash - dt * 2.5); G.bolt.material.opacity = Math.max(0, G.bolt.material.opacity - dt * 3);
      U.uS.value += (G.sky - U.uS.value) * Math.min(1, dt * 3); U.uFlash.value = G.flash;
      G.band.storm && G.band.storm(U.uS.value);
      // the people: walk while it's calm, huddle and wait in the storm
      const walking = G.playing && U.uS.value < 0.35;
      let moved = false;
      for (const p of G.people) {
        const d = p.to - p.u, go = walking && Math.abs(d) > 0.004;
        if (go) { p.u += Math.sign(d) * Math.min(Math.abs(d), WALK * dt); p.ph += dt * 9; moved = true; p.stepT -= dt; if (p.stepT <= 0) { p.stepT = 0.42; G.band.step && G.band.step((p.u - 0.5) * 1.6); } }
        const bob = go ? Math.abs(Math.sin(p.ph)) * 0.004 : 0, huddle = U.uS.value > 0.35 ? 0.94 + Math.sin(G.t * 20 + p.ph) * 0.005 : 1;
        const [x, y] = G.S.P(p.u, feetV(p.u)); p.m.position.set(x, y + (p.hh * huddle) / 2 + bob, 0.04);
        p.m.scale.set(p.dir, huddle, 1);   // the people from the right face left
        p.m.rotation.z = go ? Math.sin(p.ph) * 0.04 : 0;
        p.m.material.opacity = U.uA.value;
      }
      // everyone meets in the middle: the moment of communion
      const together = G.people.every(p => Math.abs(p.u - p.to) < 0.005);
      if (G.playing && together && G.cleared >= STORMS.length && G.endT < 0) {
        G.endT = 0; G.band.communion(); G.buzz([60, 60, 160]);
        G.ui.alert('A moment of communion', 'They meet in the middle', 3, 'red'); G.say('They meet in the middle. A moment of communion.');
        const [x, y] = G.S.P(0.46, 0.56); G.fx.add(x, y, '#ffe6a0', 40, 0.4);
      }
      if (G.playing && together && G.cleared < STORMS.length && G.nextStorm > 1.5) G.nextStorm = 1.5;   // everyone's waiting: bring the last storm sooner
      if (G.endT >= 0) { G.endT += dt; G.sun = Math.min(1, G.endT / 2.5); U.uSun.value = G.sun;
        if (G.endT > 5 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('moment-of-communion:crossing', t, 'lower');
          K.finale(G, { won: true, title: 'A moment of communion', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Storms calmed', v: `${G.cleared}/${STORMS.length}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
          G.band.volume && G.band.volume(0.6);
        } }
      // the windows: fade in with their storm, pulse a glowing ring until lit, then glow warm for the rest of the game
      for (const w of G.wins) {
        w.a += ((w.show && !G.over ? 1 : 0) - w.a) * Math.min(1, dt * 3); w.pop = Math.max(0, w.pop - dt * 2.5);
        const waiting = w.show && !w.lit && G.storming && w.wave === G.wave;
        w.s.material.opacity = w.a * U.uA.value; w.s.scale.setScalar(WIN * (1 + Math.sin(w.pop * Math.PI) * 0.5 + (waiting ? 0.08 * Math.sin(G.t * 5) : 0)));
        w.ring.material.opacity = waiting ? w.a * (0.5 + 0.4 * Math.sin(G.t * 5)) : 0; w.ring.scale.setScalar(WIN * (1.4 + 0.25 * Math.sin(G.t * 5)));
        w.glow.material.opacity = w.lit ? w.a * (0.4 + 0.08 * Math.sin(G.t * 2 + w.u * 9)) * (1 - G.sun * 0.5) : 0;
      }
      for (let i = G.warm.length - 1; i >= 0; i--) { const r = G.warm[i]; r.t += dt;   // a warm wave of light spreading out from a lit window
        if (!r.s) { r.s = K.sprite(K.ringTex, 0.05, { color: '#ffcf7a', additive: true, opacity: 0.9, order: 16 }); r.s.position.set(r.x, r.y, 0.05); G.root.add(r.s); }
        r.s.scale.setScalar(0.05 + r.t * 0.7); r.s.material.opacity = Math.max(0, 0.9 - r.t * 0.9); if (r.t > 1) { G.root.remove(r.s); G.warm.splice(i, 1); } }
      // a soft trail where you stroke
      for (let i = G.trail.length - 1; i >= 0; i--) { const s = G.trail[i]; s.t += dt; s.s.material.opacity = Math.max(0, 0.6 - s.t * 0.8); if (s.t > 0.8) { G.root.remove(s.s); G.trail.splice(i, 1); } }
      G.hudT = (G.hudT || 0) - dt; if (G.hudT <= 0) { G.hudT = 0.3; hud(); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down' || !G.storming) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      const w = nextWin(p); if (!w) return;
      if (Math.hypot(w.u - p.u, (w.v - p.v) * G.h) < WIN_HIT) light(w);
      else { w.pop = 0.6; const s = K.sprite(K.dotTex, 0.035, { color: '#ffd27a', additive: true, opacity: 0.6, order: 17 }); const [x, y] = G.S.P(p.u, p.v); s.position.set(x, y, 0.06); G.root.add(s); G.trail.push({ s, t: 0 }); }   // missed: the nearest window nudges
    },
    pause() { if (G) { G.paused = true; G.band.volume && G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume && G.band.volume(G.over ? 0.6 : 0.9); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'calm-crossing', playing: G.playing, over: G.over, wave: G.wave, cleared: G.cleared, storm: +G.sky.toFixed(2), storming: G.storming, people: G.people.map(p => +p.u.toFixed(3)), t: +G.t.toFixed(1) }; },
    stop() { if (G && G.band && G.band.stop) G.band.stop(); K.cleanup(G); G = null; },
  };
}
