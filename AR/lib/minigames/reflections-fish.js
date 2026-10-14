// REFLECTIONS OF SISTERHOOD (April & Melissa): FISH FOR THE SISTERS.
// April and Melissa sit on the dock in Guanaja with their feet in the water. Tropical fish swim through it (blue tangs,
// yellowtail snappers, parrotfish, angelfish, sergeant majors, a little puffer, and later a spotted eagle ray and a
// sea turtle). Point them out so the sisters can see them: tap a fish (or hold the middle of the screen on it). The
// sister on that side hears what it is, and the fish swims over to tickle her toes with a splash. Spot 12 fish.
// The water ripples all the time, every tap and splash sends out rings, a lofi island band plays (keys, a soft beat, a
// shaker and waves), and every fish you point out adds a marimba note. By ear: each fish makes little bubbles from its
// side, louder as you get close, and the Point button points out the fish nearest to where you're looking.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const WATER = 0.6;                                             // the waterline (v)
const SISTERS = [{ name: 'April', feet: { u: 0.235, v: 0.625 } }, { name: 'Melissa', feet: { u: 0.6, v: 0.625 } }];
const GOAL = 12, HOLD = 0.6;
const KINDS = {
  tang: { name: 'a blue tang', size: 0.22, pitch: 880 },
  snapper: { name: 'a yellowtail snapper', size: 0.27, pitch: 740 },
  parrot: { name: 'a parrotfish', size: 0.27, pitch: 620 },
  angel: { name: 'a queen angelfish', size: 0.21, pitch: 990 },
  sergeant: { name: 'a sergeant major', size: 0.20, pitch: 1100 },
  puffer: { name: 'a little puffer fish', size: 0.17, pitch: 1320 },
  ray: { name: 'a spotted eagle ray', size: 0.45, pitch: 330, special: true },
  turtle: { name: 'a sea turtle', size: 0.42, pitch: 260, special: true },
};
const COMMON = ['tang', 'snapper', 'parrot', 'angel', 'sergeant', 'puffer'];

/* ───────────────────────── the fish (drawn facing right) ───────────────────────── */
function fishTex(kind) {
  return K.canvasTex(256, 128, (g, W, H) => {
    const body = (rx, ry, fill, x = 120, y = 64) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
    const tail = (fill, x = 40, s = 1) => { g.fillStyle = fill; g.beginPath(); g.moveTo(x + 22 * s, 64); g.lineTo(x - 18 * s, 64 - 34 * s); g.quadraticCurveTo(x - 4 * s, 64, x - 18 * s, 64 + 34 * s); g.closePath(); g.fill(); };
    const eye = (x = 176, y = 56, r = 7) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x + 1, y, r * 0.55, 0, Math.PI * 2); g.fill(); };
    const fin = (fill, pts) => { g.fillStyle = fill; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); g.fill(); };
    g.lineJoin = 'round';
    if (kind === 'tang') { tail('#f4cf2a'); body(78, 44, '#1f5fd6'); fin('#173e94', [80, 24, 170, 22, 150, 40, 90, 40]); g.strokeStyle = '#0b1b44'; g.lineWidth = 7; g.beginPath(); g.moveTo(160, 40); g.quadraticCurveTo(110, 60, 70, 50); g.stroke(); eye(); }
    if (kind === 'snapper') { tail('#f7d33a', 44, 1.1); body(88, 30, '#c9d4e6'); g.fillStyle = '#f2c62e'; g.fillRect(50, 58, 150, 9); fin('#e9c23a', [90, 36, 150, 30, 140, 44]); eye(182, 58, 6); }
    if (kind === 'parrot') { tail('#ff6fa8', 44, 1.1); const gr = g.createLinearGradient(40, 0, 210, 0); gr.addColorStop(0, '#2ec4a6'); gr.addColorStop(0.6, '#3fae5a'); gr.addColorStop(1, '#5fd0e8'); body(86, 38, gr); g.strokeStyle = '#ff8fc0'; g.lineWidth = 4; for (let x = 90; x < 180; x += 22) { g.beginPath(); g.arc(x, 64, 24, -1, 1); g.stroke(); } fin('#ff6fa8', [96, 28, 160, 26, 150, 38]); eye(184, 54, 7); }
    if (kind === 'angel') { fin('#f2c92e', [120, 4, 60, 40, 100, 60]); fin('#f2c92e', [120, 124, 60, 88, 100, 68]); tail('#f6d23c', 54, 0.9); body(62, 46, '#3b74d4'); g.fillStyle = '#f5cf2f'; g.beginPath(); g.ellipse(132, 64, 50, 34, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1f4fb0'; g.beginPath(); g.arc(150, 40, 9, 0, Math.PI * 2); g.fill(); eye(172, 58, 6); }
    if (kind === 'sergeant') { tail('#e8e2a0'); body(74, 40, '#f0e46a'); g.fillStyle = '#e9f0f2'; g.beginPath(); g.ellipse(120, 82, 70, 20, 0, 0, Math.PI); g.fill(); g.fillStyle = '#1b1b1b'; for (let x = 76; x < 180; x += 24) g.fillRect(x, 26, 8, 76); eye(178, 58, 6); }
    if (kind === 'puffer') { tail('#c9a35a', 66, 0.8); body(54, 44, '#d9b45f'); g.fillStyle = '#f4ecd4'; g.beginPath(); g.ellipse(124, 84, 46, 20, 0, 0, Math.PI); g.fill(); g.fillStyle = '#6b4a22'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(90 + (i * 37) % 70, 40 + (i * 23) % 34, 3.5, 0, Math.PI * 2); g.fill(); } eye(158, 54, 8); }
    if (kind === 'ray') { g.fillStyle = '#20263a'; g.beginPath(); g.moveTo(232, 64); g.quadraticCurveTo(150, 0, 110, 6); g.quadraticCurveTo(130, 50, 60, 64); g.quadraticCurveTo(130, 78, 110, 122); g.quadraticCurveTo(150, 128, 232, 64); g.fill(); g.strokeStyle = '#20263a'; g.lineWidth = 4; g.beginPath(); g.moveTo(62, 64); g.lineTo(4, 64); g.stroke(); g.fillStyle = '#e8eef5'; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(130 + (i * 31) % 80, 30 + (i * 17) % 68, 3, 0, Math.PI * 2); g.fill(); } }
    if (kind === 'turtle') { g.fillStyle = '#6f8f4a'; for (const [x, y, a] of [[170, 28, -0.7], [170, 100, 0.7], [80, 34, -2.3], [80, 94, 2.3]]) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 30, 11, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
      g.fillStyle = '#8aa85a'; g.beginPath(); g.ellipse(212, 64, 22, 16, 0, 0, Math.PI * 2); g.fill(); eye(220, 58, 4);
      const gr = g.createRadialGradient(120, 58, 6, 124, 64, 66); gr.addColorStop(0, '#9a7a3c'); gr.addColorStop(1, '#4e3b1c'); g.fillStyle = gr; g.beginPath(); g.ellipse(124, 64, 66, 46, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(240,220,160,.45)'; g.lineWidth = 3; for (const [x, y] of [[124, 64], [92, 46], [156, 46], [92, 82], [156, 82]]) { g.beginPath(); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * 15, y + Math.sin(a) * 15); } g.closePath(); g.stroke(); } }
  });
}
const FISH_VERT = `
varying vec2 vUv; uniform float uT, uWig;
void main(){ vUv = uv; vec3 p = position;
  p.y += sin(uT * 9.0 + uv.x * 5.0) * uWig * (1.0 - uv.x) * 0.25;      // the tail swishes, the head stays steady
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const FISH_FRAG = `
varying vec2 vUv; uniform sampler2D map; uniform float uA, uDeep, uGlow;
void main(){ vec4 c = texture2D(map, vUv);
  vec3 col = mix(c.rgb, vec3(0.16, 0.36, 0.52), uDeep) + uGlow * 0.25;     // seen through the water
  gl_FragColor = vec4(col, c.a * uA); }`;

/* ───────────────────────── the water ───────────────────────── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const WATER_FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uH, uA, uLine; uniform vec4 uRip[8];
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float w = smoothstep(uLine - 0.01, uLine + 0.03, p.y), deep = clamp((p.y - uLine) / (1.0 - uLine), 0.0, 1.0);
  vec2 off = vec2(sin(p.y * 90.0 - uT * 1.6 + sin(p.x * 7.0) * 1.5) * 0.0028, sin(p.x * 40.0 + uT * 1.1) * 0.0012) * (0.4 + deep);
  float crest = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 R = uRip[i]; if (R.w <= 0.0) continue;
    vec2 d = (p - R.xy) * vec2(1.0, uH * 2.2); float r = length(d), front = R.z * 0.22;
    float ring = sin((r - front) * 110.0) * exp(-abs(r - front) * 22.0) * R.w;
    off += normalize(d + 1e-5) * ring * 0.006; crest += max(0.0, ring) * 0.35;
  }
  vec3 c = texture2D(map, vec2(p.x + off.x * w, 1.0 - (p.y + off.y * w))).rgb;
  float sh = pow(max(0.0, sin(p.x * 60.0 + p.y * 30.0 + uT * 1.4) * sin(p.x * 23.0 - p.y * 70.0 - uT * 1.1)), 6.0);   // sparkles on the surface
  c += (vec3(0.85, 0.95, 1.0) * (sh * 0.1 + crest)) * w;
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── the island lofi band + the waves ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[48, 52, 55, 59, 62], [45, 52, 55, 60, 64], [50, 53, 57, 60, 64], [43, 50, 53, 59, 62]];   // Cmaj9 · Am7 · Dm9 · G9
const BASS = [36, 33, 38, 31];
const MARIMBA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93];
function band(ac) {
  const BPM = 82, beat = 60 / BPM, bar = beat * 4;
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3200; tape.Q.value = 0.5; bus.connect(tape).connect(ac.destination);
  const air = ac.createGain(); air.gain.value = 0; air.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, out = bus, sweep = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  function keys(t, m, dur, vol = 0.045) { tone(t, midi(m), dur, { vol, att: 0.03 }); tone(t, midi(m) * 2, dur * 0.5, { type: 'triangle', vol: vol * 0.15, att: 0.03 }); }
  const marimba = (t, m, p = 0, vol = 0.14) => { tone(t, midi(m), 0.6, { vol, p, out: air }); tone(t, midi(m) * 4, 0.12, { vol: vol * 0.35, p, out: air }); tone(t, midi(m) * 10, 0.04, { vol: vol * 0.1, p, out: air }); };
  const kick = t => tone(t, 110, 0.35, { vol: 0.42, slide: 42, att: 0.006 });
  const snare = t => { noise(t, 0.16, { freq: 1800, q: 0.7, vol: 0.12 }); tone(t, 200, 0.1, { type: 'triangle', vol: 0.04 }); };
  const shaker = (t, v) => noise(t, 0.06, { freq: 7000, type: 'highpass', q: 0.6, vol: v, p: 0.3, out: air });
  const bass = (t, m, dur) => tone(t, midi(m), dur, { type: 'triangle', vol: 0.2, att: 0.02 });
  // the waves: a soft wash that rises and falls, and little laps against the dock
  const sea = ac.createBufferSource(), seaF = ac.createBiquadFilter(), seaG = ac.createGain(), lfo = ac.createOscillator(), lfoG = ac.createGain();
  sea.buffer = nb; sea.loop = true; seaF.type = 'lowpass'; seaF.frequency.value = 650; seaG.gain.value = 0.035; lfo.frequency.value = 0.16; lfoG.gain.value = 0.025;
  lfo.connect(lfoG).connect(seaG.gain); sea.connect(seaF).connect(seaG).connect(air); sea.start(); lfo.start();
  let next = ac.currentTime + 0.1, step = 0, timer = null;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, ch = Math.floor(step / 8) % 4, sw = b8 % 2 ? beat * 0.09 : 0, tt = t + sw;
      if (b8 === 0) CHORDS[ch].forEach((m, i) => keys(t + i * 0.015, m + 12, bar * 0.95));
      if (b8 === 5) keys(tt, CHORDS[ch][3] + 24, beat * 1.2, 0.025);
      shaker(tt, (b8 % 2 ? 0.035 : 0.05) * (0.8 + Math.random() * 0.4));
      if (b8 === 0 || b8 === 5) kick(tt); if (b8 === 2 || b8 === 6) snare(tt);
      if (b8 === 0) bass(t, BASS[ch], beat * 1.8); if (b8 === 3) bass(tt, BASS[ch] + 7, beat * 0.8); if (b8 === 6) bass(tt, BASS[ch] + 12, beat * 0.9);
      if (Math.random() < 0.12) noise(t + Math.random() * beat, 0.25, { freq: 500 + Math.random() * 400, q: 0.8, vol: 0.05, p: Math.random() - 0.5, out: air, sweep: 300 });   // a lap of water
      next += beat / 2; step++;
    }
  }
  return {
    marimba: (i, p) => marimba(ac.currentTime + 0.02, MARIMBA[i % MARIMBA.length], p),
    splash: (p = 0, big = 1) => { const t = ac.currentTime + 0.02; noise(t, 0.35 * big, { freq: 2200, q: 0.6, vol: 0.22 * big, p, out: air, sweep: 600 }); for (let i = 0; i < 4; i++) tone(t + 0.04 + Math.random() * 0.2, 600 + Math.random() * 900, 0.06, { vol: 0.05, p, out: air, slide: 1600 }); },
    bubbles: (p, vol, pitch) => { const t = ac.currentTime + 0.02; for (let i = 0; i < 3; i++) tone(t + i * 0.07, pitch * (0.8 + Math.random() * 0.5), 0.07, { vol, p, out: air, slide: pitch * 2 }); },
    giggle: (p) => { const t = ac.currentTime + 0.05; [0, 1, 2, 3].forEach(i => tone(t + i * 0.09, 900 + i * 140 + (i % 2) * 120, 0.08, { type: 'triangle', vol: 0.06, p, out: air })); },
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(1.3); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); air.gain.setTargetAtTime(v, ac.currentTime, 0.25); },
    stop() { clearInterval(timer); timer = null; this.volume(0); setTimeout(() => { try { sea.stop(); lfo.stop(); bus.disconnect(); air.disconnect(); } catch (e) {} }, 700); },
  };
}

export function sistersFishGame() {
  let G = null;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);

  function hud() {
    G.ui.panel('Fish for the sisters', `${G.spotted}<small>of ${GOAL} fish</small>`, { segs: [G.spotted, GOAL], sub: G.kinds.size ? `${G.kinds.size} of ${Object.keys(KINDS).length} kinds · tap a fish to point it out` : 'Tap a fish to point it out' });
  }
  function ripple(u, v, big = 1) { const r = G.rips[G.ripI++ % G.rips.length]; r.set(u, v, 0, big); }
  function spawn(kind) {
    const K0 = KINDS[kind], dir = Math.random() < 0.5 ? 1 : -1, v = 0.68 + Math.random() * 0.27;
    const uni = { map: { value: G.tex[kind] }, uT: { value: Math.random() * 10 }, uWig: { value: kind === 'turtle' ? 0.01 : kind === 'ray' ? 0.03 : 0.04 }, uA: { value: 0 }, uDeep: { value: 0.3 }, uGlow: { value: 0 } };
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5, 12, 1), new THREE.ShaderMaterial({ uniforms: uni, vertexShader: FISH_VERT, fragmentShader: FISH_FRAG, transparent: true, depthWrite: false }));
    m.renderOrder = 13; G.root.add(m);
    const f = { kind, m, uni, u: dir > 0 ? -0.08 : 1.08, v, v0: v, dir, speed: (K0.special ? 0.035 : 0.05) + Math.random() * 0.035, ph: Math.random() * 6, state: 'swim', t: 0, bubT: Math.random() };
    G.fish.push(f); return f;
  }
  function point(f, how = 'tap') {
    if (!f || f.state !== 'swim') return;
    f.state = 'go'; f.t = 0; G.spotted++; G.kinds.add(f.kind);
    const sis = f.u < 0.42 ? SISTERS[0] : SISTERS[1]; f.sis = sis;
    const p = (f.u - 0.5) * 1.6;
    G.band.marimba(G.spotted - 1, p); G.band.bubbles(p, 0.06, KINDS[f.kind].pitch); ripple(f.u, f.v, 0.8); G.buzz(25);
    const [x, y] = G.S.P(f.u, f.v); G.fx.add(x, y, '#d8f6ff', 14, 0.22);
    G.ui.pop(KINDS[f.kind].name.replace(/^(a|an) /, '').toUpperCase());
    G.say(`${sis.name}, look! ${KINDS[f.kind].name[0].toUpperCase() + KINDS[f.kind].name.slice(1)}!`);
    hud();
    if (G.spotted >= GOAL) { G.ending = 4.5; G.ui.alert('You helped them see', 'Every fish, together.', 2.6, 'red'); }
  }
  function nearestTo(at, maxD = 9) { let best = null, bd = maxD; for (const f of G.fish) if (f.state === 'swim' && f.u > -0.02 && f.u < 1.02) { const d = dist(f, at); if (d < bd) { bd = d; best = f; } } return best; }
  const hitR = f => KINDS[f.kind].size * (0.75 + (f.v - WATER) * 0.9) * 0.42 + 0.015;

  return {
    title: 'Fish for the sisters',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { fish: [], spotted: 0, kinds: new Set(), nextT: 0.5, aim: { u: 0.5, v: 0.8 }, touch: null, touchT: 0, hold: 0, holdF: null, ending: 0, ripI: 0, splashT: 3, specials: [], t0: 0 });
      G.tex = {}; for (const k of Object.keys(KINDS)) { G.tex[k] = fishTex(k); G.tex[k].colorSpace = THREE.NoColorSpace; }
      // the water: the painting itself, rippling below the waterline
      G.rips = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 0, 0));
      G.wu = { map: { value: null }, uT: { value: 0 }, uH: { value: G.h }, uA: { value: 0 }, uLine: { value: WATER }, uRip: { value: G.rips } };
      G.water = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.wu, vertexShader: VERT, fragmentShader: WATER_FRAG, transparent: true, depthWrite: false }));
      G.water.position.z = 0.03; G.water.renderOrder = 12; G.root.add(G.water);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.wu.map.value = t; G.ready = true; });
      G.ring = K.sprite(K.ringTex, 0.08, { color: '#e8fbff', order: 16, opacity: 0 }); G.ring.position.z = 0.05; G.root.add(G.ring);
      G.band = K.audio() ? band(K.audio()) : null;
      if (!G.band) G.band = new Proxy({}, { get: () => () => {} });
      G.ui.buttons([{ label: 'Point', icon: '👉', kind: 'red', aria: 'Point out the fish nearest to where you are looking', press: () => { if (G.playing) { const f = nearestTo(G.aim, 0.45); if (f) point(f, 'button'); else { G.say('No fish near there. Try lower in the water.'); } } } }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); };
      K.intro(G, { title: 'Fish for the sisters', how: 'Fish are swimming under the dock. Point them out so April and Melissa can see them: tap a fish, or hold the middle of the screen on it.',
        say: 'Fish for the sisters. April and Melissa are sitting on the dock in Guanaja, with their feet in the water. Tropical fish are swimming by. Point them out so the sisters can see them: tap a fish, or hold the middle of the screen on it. Each fish makes little bubbles from its side, so you can find them by ear too. Spot twelve fish!' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.wu.uT.value = G.t; G.wu.uA.value += ((G.ready && !G.over ? 1 : 0) - G.wu.uA.value) * Math.min(1, dt * 2);
      for (const r of G.rips) if (r.w > 0) { r.z += dt; r.w = Math.max(0, r.w - dt * 0.45); }
      // the sisters kick their feet now and then
      G.splashT -= dt; if (G.splashT <= 0 && G.ready) { G.splashT = 4 + Math.random() * 5; const s = SISTERS[Math.floor(Math.random() * 2)]; ripple(s.feet.u + (Math.random() - 0.5) * 0.04, s.feet.v + 0.01, 0.55); if (G.playing) G.band.splash((s.feet.u - 0.5) * 1.6, 0.4); }
      // where you're looking: a finger, else the middle of the screen
      if (G.bot && G.playing) { const f = nearestTo(G.aim); if (f) { G.aim.u += (f.u - G.aim.u) * Math.min(1, dt * 3); G.aim.v += (f.v - G.aim.v) * Math.min(1, dt * 3); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const [ax, ay] = G.S.P(G.aim.u, G.aim.v); G.ring.position.set(ax, ay, 0.05);
      G.ring.material.opacity = G.playing && G.aim.v > WATER ? 0.45 : 0; G.ring.scale.setScalar(0.07 + G.hold * 0.05);
      // the fish
      if (G.playing && !G.ending) {
        G.nextT -= dt;
        const swimming = G.fish.filter(f => f.state === 'swim').length;
        if (G.nextT <= 0 && swimming < 5) {
          G.nextT = 1.4 + Math.random() * 1.8;
          let kind = COMMON[Math.floor(Math.random() * COMMON.length)];
          if (G.spotted >= 4 && !G.specials.includes('ray')) { kind = 'ray'; G.specials.push('ray'); }
          else if (G.spotted >= 8 && !G.specials.includes('turtle')) { kind = 'turtle'; G.specials.push('turtle'); }
          const f = spawn(kind);
          if (KINDS[kind].special) { G.ui.alert(kind === 'turtle' ? 'A sea turtle!' : 'A ray is gliding by!', 'Point it out!', 2, 'blue'); G.say(kind === 'turtle' ? 'Something big is coming. A sea turtle!' : 'Something big is gliding by. A spotted eagle ray!'); G.band.bubbles((f.u - 0.5) * 1.6, 0.08, 300); }
        }
      }
      let near = null, nearD = 9;
      for (let i = G.fish.length - 1; i >= 0; i--) {
        const f = G.fish[i], K0 = KINDS[f.kind]; f.t += dt; f.uni.uT.value += dt;
        if (f.state === 'swim') {
          f.u += f.dir * f.speed * dt; f.v = f.v0 + Math.sin(G.t * 0.9 + f.ph) * 0.015;
          if (f.u < -0.12 || f.u > 1.12) { G.root.remove(f.m); G.fish.splice(i, 1); continue; }
          const d = dist(f, G.aim); if (d < nearD) { nearD = d; near = f; }
          // bubbles from its side, louder as you get close
          f.bubT -= dt; if (f.bubT <= 0 && G.playing) { f.bubT = 0.9 + Math.random() * 1.2 + d * 2; if (d < 0.5) G.band.bubbles(Math.max(-1, Math.min(1, (f.u - G.aim.u) * 2.6)), 0.012 + (0.5 - d) * 0.07, K0.pitch); }
          f.uni.uA.value = Math.min(0.92, f.t * 1.5); f.uni.uGlow.value = f === G.holdF ? G.hold : 0;
        } else if (f.state === 'go') {   // off to tickle her toes
          const tgt = { u: f.sis.feet.u + Math.sin(f.t * 3) * 0.035, v: f.sis.feet.v + 0.045 + Math.cos(f.t * 3) * 0.01 }, k = Math.min(1, dt * 1.6);
          const du = tgt.u - f.u; f.u += du * k; f.v += (tgt.v - f.v) * k; if (Math.abs(du) > 0.004) f.dir = Math.sign(du);
          f.uni.uGlow.value = Math.max(0, 0.6 - f.t * 0.3);
          if (f.t > 1.4 && !f.tickled) { f.tickled = true; ripple(f.sis.feet.u, f.sis.feet.v + 0.01, 1); G.band.splash((f.sis.feet.u - 0.5) * 1.6, 0.8); G.band.giggle((f.sis.feet.u - 0.5) * 1.6); const [x, y] = G.S.P(f.sis.feet.u, f.sis.feet.v); G.fx.add(x, y, '#ffffff', 12, 0.2); }
          if (f.t > 3.2) { f.state = 'leave'; f.dir = f.u < 0.5 ? -1 : 1; f.t = 0; }
        } else {   // swims away and fades
          f.u += f.dir * 0.12 * dt; f.v += 0.02 * dt; f.uni.uA.value = Math.max(0, 0.92 - f.t * 0.5);
          if (f.uni.uA.value <= 0) { G.root.remove(f.m); G.fish.splice(i, 1); continue; }
        }
        // place it: bigger nearer the bottom (closer to you), deeper-looking further under the dock
        const s = K0.size * (0.75 + (f.v - WATER) * 0.9), [x, y] = G.S.P(f.u, f.v);
        f.m.position.set(x, y, 0.04); f.m.scale.set(s * f.dir, s, 1); f.m.rotation.z = Math.sin(G.t * 1.3 + f.ph) * 0.06;
        f.uni.uDeep.value = 0.12 + Math.max(0, 0.3 - (f.v - WATER)) * 0.9;
      }
      if (!G.playing) return;
      // hold the middle of the screen (or your finger) on a fish to point it out
      if (near && nearD < hitR(near) && !G.ending) {
        if (G.holdF !== near) { G.holdF = near; G.hold = 0; }
        G.hold += dt / HOLD; if (G.hold >= 1) { G.hold = 0; point(near, 'hold'); G.holdF = null; }
      } else { G.hold = Math.max(0, G.hold - dt * 2); }
      if (G.ending > 0) { G.ending -= dt; if (G.ending <= 0 && !G.over) {
        SISTERS.forEach((s, i) => setTimeout(() => { if (!G) return; ripple(s.feet.u, s.feet.v + 0.01, 1); G.band.splash((s.feet.u - 0.5) * 1.6, 1); }, i * 350));
        G.band.volume(0.6);
        const t = Math.round(G.t - G.t0), r = K.best('reflections-of-sisterhood:fish', t, 'lower');
        K.finale(G, { won: true, title: 'You helped them see', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Fish', v: `${G.spotted}` }, { k: 'Kinds', v: `${G.kinds.size}/${Object.keys(KINDS).length}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
      } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      if (kind === 'down') {
        G.touch = { u: p.u, v: p.v };
        if (p.v > WATER - 0.02) ripple(p.u, Math.max(WATER + 0.01, p.v), 0.6);
        const f = nearestTo(p); if (f && dist(f, p) < hitR(f) + 0.015 && !G.ending) point(f, 'tap');
      } else if (kind === 'move' && G.touch) G.touch = { u: p.u, v: p.v };
      else if (kind === 'up') { G.touch = null; G.touchT = 1.0; }
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(G.over ? 0.6 : 1.3); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'sisters-fish', playing: G.playing, over: G.over, spotted: G.spotted, kinds: [...G.kinds], fish: G.fish.map(f => `${f.kind}:${f.state}@${f.u.toFixed(2)},${f.v.toFixed(2)}`), t: +G.t.toFixed(1) }; },
    stop() { if (G && G.band) G.band.stop(); K.cleanup(G); G = null; },
  };
}
export { band as islandBand };   // for testing the music on its own
