// SPECTRUM OF SIGHT (Michael Tubiak): SOMEWHERE IN BETWEEN.
// "Blindness isn't black and white. It's a whole spectrum."
// The eye is a dial. A rainbow dial runs round the outside of the eye, one segment for each of its 7 colour rings, from
// bright red on the outside to black at the pupil. Each ring is a different way of seeing: blurry, hazy, tunnel vision,
// spots, a hole in the middle, shapes and shadows, and only light. The dial clicks round to the next ring, the eye
// becomes a window, and an everyday thing (a key, a dog, a bicycle, a guitar, a cup, a bird, a phone) appears in it,
// seen THAT way. Its own sound plays (tap the eye to hear it again). Pick what it is from 3 big buttons. Get it and the
// picture clears, that ring of the painting lights up and sings its note, and the eye breathes. Light all 7 rings and
// the whole eye glows as a rainbow chord plays; then Mike says it in his own words.
// Words show at the BOTTOM of the screen so the eye stays clear.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas, KINDS } from './spectrum-things.js';

// Mike Tubiak in his own words (the 3D gallery's clip for this painting), played as the painting comes alive
const MIKE = new URL('../../../3D/gallery/audio/wing_4_1.mp3', import.meta.url).href;

// the eye in the 900 × 900 painting: its centre, the outside of the coloured disc and the pupil (as parts of the width)
const EYE = { u: 0.5, v: 0.501, R: 0.303, pupil: 0.043 };
// the 7 rings, outside in: colour, way of seeing, what's said, its note (bright and high outside, low and dark inside)
const RINGS = [
  { col: '#ec2a1c', name: 'Blurry', say: 'Blurry. Everything is soft around the edges.', note: 79 },
  { col: '#f08a1c', name: 'Hazy', say: 'Hazy. Like looking through a foggy window.', note: 76 },
  { col: '#f5c518', name: 'Tunnel vision', say: 'Tunnel vision. You only see straight ahead.', note: 74 },
  { col: '#22a05a', name: 'Spots', say: 'Spots. Parts of the picture are missing.', note: 72 },
  { col: '#2b86d6', name: 'A hole in the middle', say: 'A hole in the middle. You see around the edges.', note: 69 },
  { col: '#7a3fc0', name: 'Shapes and shadows', say: 'Shapes and shadows. No details, just light and dark.', note: 67 },
  { col: '#1c1c22', name: 'Only light', say: 'Only light. You can tell light from dark, but not what things are. Listen closely.', note: 64 },
];
const NAMES = { key: 'Key', dog: 'Dog', bicycle: 'Bicycle', guitar: 'Guitar', cup: 'Cup', bird: 'Bird', phone: 'Phone' };
const A = { key: 'A key', dog: 'A dog', bicycle: 'A bicycle', guitar: 'A guitar', cup: 'A cup', bird: 'A bird', phone: 'A phone' };
const SEGA = Math.PI * 2 / 7;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the window in the eye: the thing, seen through one of the 7 ways of seeing (uAmt 1 = fully, 0 = clear)
const LENS = `
varying vec2 vUv;
uniform sampler2D map; uniform float uMode, uAmt, uA, uT, uSeed;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
vec3 blur(vec2 p, float b){
  float o = 0.004 * exp2(b);
  vec3 c = texture2D(map, p, b).rgb * 0.28;
  c += texture2D(map, p + vec2(o, 0.0), b).rgb * 0.18 + texture2D(map, p - vec2(o, 0.0), b).rgb * 0.18;
  c += texture2D(map, p + vec2(0.0, o), b).rgb * 0.18 + texture2D(map, p - vec2(0.0, o), b).rgb * 0.18;
  return c;
}
float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }
void main(){
  vec2 d = vUv - 0.5; float r = length(d) * 2.0;
  if (r > 1.0) discard;
  vec3 base = texture2D(map, vUv).rgb, col = base;
  float a = uAmt; int m = int(uMode + 0.5);
  if (m == 0) col = mix(base, blur(vUv, 4.2), a);
  else if (m == 1) { vec3 c = blur(vUv, 3.4 * a); c = mix(c, vec3(lum(c)) * 0.6 + vec3(0.42, 0.4, 0.32), 0.62 * a); col = mix(base, c + vec3(0.14, 0.12, 0.06) * a * (1.0 - r), a); }
  else if (m == 2) { float k = 1.0 - smoothstep(0.3, 0.44, r); col = mix(base, base * k + vec3(0.02) * (1.0 - k), a); }
  else if (m == 3) { vec2 q = vUv + vec2(sin(uT * 0.3), cos(uT * 0.25)) * 0.02; float n = vn(q * 3.6) * 0.6 + vn(q * 8.0 + 3.1) * 0.4; float s = smoothstep(0.4, 0.47, n); col = mix(base, mix(blur(vUv, 1.2), vec3(0.05, 0.04, 0.04), s), a); }
  else if (m == 4) { float k = 1.0 - smoothstep(0.34, 0.6, r + (vn(vUv * 5.0) - 0.5) * 0.15); col = mix(base, mix(blur(vUv, 1.4), vec3(0.08, 0.06, 0.06) + blur(vUv, 6.0) * 0.12, k), a); }
  else if (m == 5) { float l = lum(blur(vUv, 4.4)); l = floor(l * 3.0 + 0.5) / 3.0; col = mix(base, vec3(l) * 0.9, a); }
  else { float l = lum(blur(vUv, 6.5)); float glow = 0.42 + 0.55 * smoothstep(0.3, 0.85, l) + 0.05 * sin(uT * 1.5); vec3 c = vec3(1.0, 0.93, 0.78) * glow * (1.0 - 0.35 * r * r); col = mix(base, c, a); }
  float edge = 1.0 - smoothstep(0.96, 1.0, r);
  col *= 0.75 + 0.25 * (1.0 - smoothstep(0.7, 1.0, r));
  gl_FragColor = vec4(col, uA * edge);
}`;

// this game's own layout addition (the kit's styles stay as they are): alerts that sit low, under the eye
let cssDone = false;
function css() {
  if (cssDone) return; cssDone = true;
  const s = document.createElement('style');
  s.textContent = `.mgk-alert.eye-low{top:auto;bottom:calc(156px + env(safe-area-inset-bottom))}
  .mgk-btns button.eye-out{opacity:.35;filter:grayscale(1)}`;
  document.head.appendChild(s);
}

/* ───────────────────────── sounds: each thing's own sound, the dial, and a chord that grows ring by ring ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const pad = ac.createBiquadFilter(); pad.type = 'lowpass'; pad.frequency.value = 1400; const padG = ac.createGain(); padG.gain.value = 1; pad.connect(padG).connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  const oscs = [];
  function hum(m, vol) {
    const o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain();
    o.type = 'sine'; o.frequency.value = midi(m - 12); g.gain.value = 0; lfo.frequency.value = 0.15 + Math.random() * 0.25; lg.gain.value = vol * 0.4;
    lfo.connect(lg).connect(g.gain); o.connect(g).connect(pad); o.start(); lfo.start(); g.gain.setTargetAtTime(vol, ac.currentTime, 1.5); oscs.push(o, lfo);
  }
  hum(48, 0.04); hum(55, 0.025);
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, out)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.008, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  const CLUE = {
    key(t) { for (let i = 0; i < 9; i++) { const tt = t + i * 0.055 + Math.random() * 0.02; tone(tt, 3200 + Math.random() * 2600, 0.12, { type: 'triangle', vol: 0.05, p: (Math.random() - 0.5) * 0.3 }); noise(tt, 0.04, { freq: 7000, type: 'highpass', vol: 0.05 }); } },
    dog(t) { for (const d of [0, 0.32]) { tone(t + d, 330, 0.16, { type: 'sawtooth', vol: 0.13, slide: 170 }); noise(t + d, 0.12, { freq: 700, q: 1.5, vol: 0.15 }); } },
    bicycle(t) { for (const d of [0, 0.22]) [2100, 3300, 4400].forEach((f, i) => tone(t + d, f, 0.7, { type: 'triangle', vol: [0.12, 0.06, 0.03][i] })); },
    guitar(t) { [52, 59, 64, 68, 71, 76].forEach((m, i) => { tone(t + i * 0.035, midi(m), 1.4, { type: 'triangle', vol: 0.07, att: 0.003 }); tone(t + i * 0.035, midi(m) * 2, 0.4, { type: 'sine', vol: 0.02, att: 0.003 }); }); },
    cup(t) { noise(t, 0.9, { freq: 600, q: 2, vol: 0.12, sweep: 1800, att: 0.05 }); tone(t + 1.0, 2700, 0.4, { type: 'sine', vol: 0.08 }); tone(t + 1.0, 4100, 0.25, { type: 'sine', vol: 0.03 }); },
    bird(t) { for (let i = 0; i < 4; i++) tone(t + i * 0.16, 2600 + (i % 2) * 500, 0.11, { vol: 0.09, slide: 4200 - (i % 2) * 600 }); },
    phone(t) { for (let i = 0; i < 12; i++) tone(t + i * 0.07, i % 2 ? 1320 : 1050, 0.06, { type: 'square', vol: 0.035 }); for (let i = 0; i < 12; i++) tone(t + 1.0 + i * 0.07, i % 2 ? 1320 : 1050, 0.06, { type: 'square', vol: 0.035 }); },
  };
  return {
    start() { out.gain.setTargetAtTime(0.9, ac.currentTime, 0.4); },
    clue(kind) { CLUE[kind] && CLUE[kind](ac.currentTime + 0.02); },
    click(n) { const t = ac.currentTime + 0.01; tone(t, 1800 - n * 60, 0.03, { type: 'square', vol: 0.05 }); noise(t, 0.02, { freq: 4000, q: 2, vol: 0.08 }); },
    ring(n) { const t = ac.currentTime + 0.01, f = midi(RINGS[n].note); tone(t, f, 1.6, { type: 'triangle', vol: 0.12 }); tone(t, f * 2, 0.8, { vol: 0.04 }); [0, 4, 7].forEach((d, i) => tone(t + 0.12 + i * 0.07, midi(RINGS[n].note + d + 12), 0.6, { type: 'triangle', vol: 0.04 })); hum(RINGS[n].note, 0.02); },
    wrong() { const t = ac.currentTime + 0.01; tone(t, 200, 0.35, { type: 'sawtooth', vol: 0.06, slide: 140 }); },
    reveal() { noise(ac.currentTime + 0.01, 0.9, { freq: 1200, q: 0.6, vol: 0.06, sweep: 6000, att: 0.2 }); },
    finale() { const t = ac.currentTime + 0.05; RINGS.slice().reverse().forEach((r, i) => tone(t + i * 0.16, midi(r.note), 3.2, { type: 'triangle', vol: 0.06, att: 0.03 })); pad.frequency.setTargetAtTime(5000, ac.currentTime, 1); },
    quiet(v) { padG.gain.setTargetAtTime(v, ac.currentTime, 0.5); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} setTimeout(() => { for (const o of oscs) { try { o.stop(); } catch (e) {} } }, 400); },
  };
}

// the rainbow dial round the eye: 7 segments, lit when that ring is done, the current one bright
function dialTex(state) {
  return K.canvasTex(1024, 1024, (g, W) => drawDial(g, W, state));
}
function drawDial(g, W, { cur = -1, lit = [] }) {
  g.clearRect(0, 0, W, W);
  const c = W / 2, s = W / 0.84, r0 = (EYE.R + 0.016) * s, r1 = (EYE.R + 0.058) * s;
  for (let k = 0; k < 7; k++) {
    const a0 = -Math.PI / 2 + k * SEGA + 0.025, a1 = a0 + SEGA - 0.05, on = lit[k], now = k === cur;
    g.beginPath(); g.arc(c, c, r1, a0, a1); g.arc(c, c, r0, a1, a0, true); g.closePath();
    g.fillStyle = '#000'; g.fill();
    g.globalAlpha = on || now ? 1 : 0.35; g.fillStyle = RINGS[k].col === '#1c1c22' ? '#4a4a55' : RINGS[k].col; g.fill(); g.globalAlpha = 1;
    g.lineWidth = now ? 10 : 5; g.strokeStyle = now ? '#fff' : '#000'; g.stroke();
    // a white dot for every ring that's done
    if (on) { const am = (a0 + a1) / 2, rr = (r0 + r1) / 2; g.beginPath(); g.arc(c + Math.cos(am) * rr, c + Math.sin(am) * rr, 12, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); }
  }
}
// the pointer that turns round the dial (drawn at the top, pointing in)
const pointerTex = () => K.canvasTex(1024, 1024, (g, W) => {
  const c = W / 2, s = W / 0.84, r1 = (EYE.R + 0.062) * s;
  g.beginPath(); g.moveTo(c, c - r1 + 6); g.lineTo(c - 30, c - r1 - 46); g.lineTo(c + 30, c - r1 - 46); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#000'; g.stroke();
});
// one ring of the painting, as a soft glowing band (for lighting it up)
const bandTex = (k) => K.canvasTex(512, 512, (g, W) => {
  const c = W / 2, s = W / (EYE.R * 2.05), w = (EYE.R - EYE.pupil) / 7, ro = (EYE.R - k * w) * s, ri = (EYE.R - (k + 1) * w) * s;
  const gr = g.createRadialGradient(c, c, Math.max(0, ri - 6), c, c, ro + 6);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.2, 'rgba(255,255,255,.9)'); gr.addColorStop(0.8, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.beginPath(); g.arc(c, c, ro + 6, 0, Math.PI * 2); g.arc(c, c, Math.max(0, ri - 6), 0, Math.PI * 2, true); g.fillStyle = gr; g.fill('evenodd');
});

export function somewhereInBetweenGame() {
  let G = null;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function alert(title, sub, secs, kind = 'red') { G.ui.alert(title, sub, secs, kind + ' eye-low'); }
  function hud() {
    G.ui.panel('Somewhere in between', `${G.lit.filter(Boolean).length}<small>of 7 rings</small>`,
      { segs: [G.lit.filter(Boolean).length, 7], sub: G.ring >= 0 && G.ring < 7 ? `Ring ${G.ring + 1}: ${RINGS[G.ring].name} · Tap the eye to hear it again` : '' });
  }
  function setPhase(ph) { G.phase = ph; G.phT = 0; }
  function redrawDial() { drawDial(G.dialTex.image.getContext('2d'), 1024, { cur: G.ring, lit: G.lit }); G.dialTex.needsUpdate = true; }

  // the dial clicks round to the next ring, then the thing appears in the eye
  function nextRing() {
    G.ring++;
    if (G.ring >= 7) return finish();
    setPhase('turn'); G.turnFrom = G.ptrAng; G.turnTo = -(G.ring + 0.5) * SEGA; G.clicks = 0;
    G.ui.buttons([]); redrawDial(); hud();
  }
  function ask() {
    const kind = G.order[G.ring], wrong = shuffle(KINDS.filter(k => k !== kind)).slice(0, 2), opts = shuffle([kind, ...wrong]);
    G.kind = kind; G.tries = 0; G.opts = opts;
    G.lensMap.image = thingCanvas(kind, 512); G.lensMap.needsUpdate = true;
    G.uni.uMode.value = G.ring; G.uni.uAmt.value = 1; G.uni.uSeed.value = Math.random() * 50;
    setPhase('ask'); G.clueT = 1.6;
    G.btns = G.ui.buttons(opts.map(k => ({ label: NAMES[k], kind: 'black', aria: NAMES[k], press: () => answer(k) })));
    G.say(`Ring ${G.ring + 1}. ${RINGS[G.ring].say} What is it?`);
    hud();
  }
  function answer(k) {
    if (!G || G.phase !== 'ask' || G.over) return;
    const i = G.opts.indexOf(k), b = G.btns && G.btns[i];
    if (b && b.classList.contains('eye-out')) return;
    if (k === G.kind) {
      if (G.tries === 0) G.first++;
      G.lit[G.ring] = true; setPhase('reveal'); G.band.reveal(); G.band.ring(G.ring); G.buzz([30, 30, 60]);
      G.btns.forEach((e, j) => { if (j !== i) e.classList.add('eye-out'); });
      alert(`Yes! ${A[k]}.`, `${RINGS[G.ring].name}: ring ${G.ring + 1} of 7.`, 2.2, 'blue');
      G.say(`Yes! ${A[k]}.`);
      const [x, y] = G.S.P(EYE.u, EYE.v); G.fx.add(x, y, RINGS[G.ring].col === '#1c1c22' ? '#ffffff' : RINGS[G.ring].col, 26, 0.4);
      redrawDial(); hud();
    } else {
      G.tries++; G.band.wrong(); G.buzz([80]);
      if (b) b.classList.add('eye-out');
      alert('Not that one', 'Listen again.', 1.4, 'black'); G.say('Not that one. Listen again.');
      G.clueT = 1.2;
    }
  }
  function finish() {
    setPhase('glow'); G.ui.buttons([]); redrawDial(); hud();
    G.band.finale(); G.buzz([60, 40, 60, 40, 180]);
    alert('All 7 ways of seeing!', 'Every one of them is a way of seeing.', 3, 'red');
    G.say('You saw all seven! Every one of them is a way of seeing.');
  }

  return {
    title: 'Somewhere in between',
    start(ctx) {
      if (G) this.stop();
      css();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, ring: -1, lit: [false, false, false, false, false, false, false], first: 0, tries: 0, ptrAng: SEGA * 0.5, breathe: 0, glowAll: 0 });
      // the 7th ring (only light) gets a thing with a clear sound; the rest are shuffled
      const pool = shuffle(KINDS.slice()), loud = ['phone', 'dog', 'bicycle', 'bird'].find(k => pool.indexOf(k) >= 0);
      G.order = pool.filter(k => k !== loud).concat(loud);
      G.band = band(K.audio());
      const [ex, ey] = G.S.P(EYE.u, EYE.v);
      // the rings of the painting light up one by one
      G.bands = RINGS.map((r, k) => { const m = K.plane(bandTex(k), EYE.R * 2.05, EYE.R * 2.05, { order: 14, additive: true, opacity: 0 }); m.material.color = new THREE.Color(k === 6 ? '#ffffff' : r.col).lerp(new THREE.Color('#ffffff'), 0.35); m.position.set(ex, ey, 0.035); G.root.add(m); return m; });
      // the pupil breathes (a soft dark disc over it that grows and shrinks)
      G.pupil = K.sprite(K.dotTex, EYE.pupil * 3.2, { color: '#000000', opacity: 0, order: 15 }); G.pupil.position.set(ex, ey, 0.036); G.root.add(G.pupil);
      // the window in the eye
      G.lensMap = new THREE.CanvasTexture(thingCanvas('key', 512)); G.lensMap.colorSpace = THREE.SRGBColorSpace;
      G.uni = { map: { value: G.lensMap }, uMode: { value: 0 }, uAmt: { value: 1 }, uA: { value: 0 }, uT: { value: 0 }, uSeed: { value: 0 } };
      G.lens = new THREE.Mesh(new THREE.PlaneGeometry(EYE.R * 2 * 0.97, EYE.R * 2 * 0.97), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: LENS, transparent: true, depthWrite: false }));
      G.lens.renderOrder = 16; G.lens.position.set(ex, ey, 0.04); G.root.add(G.lens);
      // the rim of the window, in the ring's own colour
      G.rim = K.sprite(K.ringTex, EYE.R * 2.12, { opacity: 0, order: 17 }); G.rim.position.set(ex, ey, 0.041); G.root.add(G.rim);
      // the dial and its pointer
      G.dialTex = dialTex({ cur: -1, lit: G.lit });
      G.dial = K.plane(G.dialTex, 0.84, 0.84, { order: 18, opacity: 0 }); G.dial.position.set(ex, ey, 0.045); G.root.add(G.dial);
      G.ptr = K.plane(pointerTex(), 0.84, 0.84, { order: 19, opacity: 0 }); G.ptr.position.set(ex, ey, 0.046); G.root.add(G.ptr);
      hud();
      G.onGo = () => { G.t0 = G.t; nextRing(); };
      K.intro(G, { title: 'Somewhere in between',
        how: 'Each colour ring of the eye is a different way of seeing. Something appears in the eye, seen that way, and you hear its sound. Pick what it is.',
        say: 'Somewhere in between. Mike says blindness is not black and white. It is a whole spectrum. Each colour ring of this eye is a different way of seeing. Something will appear in the eye, seen that way, and you will hear its sound. Pick what it is from the three buttons. Tap the eye to hear it again. Ready?' });
      G.band.start();
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      if (G.over && !G.mikeAu) { G.overT = (G.overT || 0) + dt; if (G.overT > 2.4) { try { G.mikeAu = new Audio(MIKE); G.mikeAu.play().catch(() => {}); } catch (e) {} } }
      const ph = G.phase;

      if (ph === 'turn') {
        // the pointer swings round, clicking past the segments
        const k = Math.min(1, G.phT / 0.9), e = 1 - Math.pow(1 - k, 3);
        G.ptrAng = G.turnFrom + (G.turnTo - G.turnFrom) * e;
        const n = Math.floor(k * 4); if (n > G.clicks) { G.clicks = n; G.band.click(G.ring); }
        if (k >= 1) ask();
      } else if (ph === 'ask') {
        G.clueT -= dt; if (G.clueT <= 0) { G.clueT = 4; G.band.clue(G.kind); }
        if (G.bot && G.phT > 1.4) { const k = G.ring === 1 && G.tries === 0 ? G.opts.find(o => o !== G.kind) : G.kind; answer(k); }
      } else if (ph === 'reveal') {
        G.uni.uAmt.value = Math.max(0, 1 - G.phT / 1.0);   // the picture clears
        if (G.phT > 2.4) nextRing();
      } else if (ph === 'glow') {
        G.glowAll = Math.min(1, G.phT / 1.5);
        if (G.phT > 3.6 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('spectrum-of-sight:first', G.first, 'higher');
          K.finale(G, { won: true, kicker: 'Spectrum of Sight', title: 'Somewhere in between', line: G.work && G.work.quote, best: r.isBest, say: 'Seven ways of seeing!',
            cells: [{ k: 'Rings', v: '7' }, { k: 'First try', v: G.first }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
          G.band.quiet(0.4);
        }
      }

      // the window shows while you're guessing, then fades to show the painting's ring light up
      const lensOn = ph === 'ask' || (ph === 'reveal' && G.phT < 1.8) || (ph === 'turn' && G.phT > 0.6);
      G.uni.uA.value += ((lensOn ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * (lensOn ? 4 : 3));
      const rc = G.ring >= 0 && G.ring < 7 ? RINGS[G.ring].col : '#ffffff';
      G.rim.material.color.set(rc === '#1c1c22' ? '#9a9aa8' : rc); G.rim.material.opacity = G.uni.uA.value * (0.85 + 0.15 * Math.sin(G.t * 4));
      // the dial
      const play = G.playing || G.over;
      const fadeOut = G.over && G.overT > 1.2;
      G.dial.material.opacity += ((play && !fadeOut ? 1 : 0) - G.dial.material.opacity) * Math.min(1, dt * 3);
      G.ptr.material.opacity = ph === 'glow' || G.over ? Math.max(0, G.ptr.material.opacity - dt * 2) : G.dial.material.opacity;
      G.ptr.rotation.z = G.ptrAng;
      // lit rings glow and breathe; in the finale, all of them in a wave
      G.bands.forEach((m, k) => {
        const on = G.lit[k] ? 1 : 0, wave = 0.5 + 0.5 * Math.sin(G.t * 3 - k * 0.8);
        const fresh = ph === 'reveal' && k === G.ring ? Math.max(0, 1 - G.phT / 2.4) : 0;
        m.material.opacity = fadeOut ? Math.max(0, m.material.opacity - dt) : on * (0.16 + 0.1 * wave) + fresh * 0.5 + G.glowAll * 0.35 * wave;
      });
      // the pupil breathes, more and more as the rings light up
      const nLit = G.lit.filter(Boolean).length;
      G.pupil.material.opacity = play && !fadeOut ? 0.9 : Math.max(0, G.pupil.material.opacity - dt);
      G.pupil.scale.setScalar(EYE.pupil * 3.2 * (1 + Math.sin(G.t * 1.6) * (0.04 + nLit * 0.02) + G.glowAll * 0.35 * Math.sin(G.t * 2.4)));
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over || kind !== 'down' || G.phase !== 'ask') return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      if (Math.hypot(p.u - EYE.u, p.v - EYE.v) < EYE.R) { G.band.clue(G.kind); G.clueT = 4; G.buzz(15); }   // tap the eye to hear it again
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'spectrum', phase: G.phase, playing: G.playing, over: G.over, ring: G.ring, kind: G.kind, lit: G.lit.filter(Boolean).length, first: G.first, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { G.mikeAu && G.mikeAu.pause(); } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
