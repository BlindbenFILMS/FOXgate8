// ALMOST BLINDNESS (Ben Fox): SOUND SAFARI, find your way by ear.
// Swirling fog fills the tunnel. Six everyday sounds that help a blind person find their way are hidden in it: birdsong,
// a bicycle bell, dripping water, wind chimes, a crosswalk signal and a guide dog's tags. Move your finger (or point the
// phone) through the fog: each sound gets louder, brighter and comes from its side as you get close. Hold still on one
// to find it, and the fog clears there. When all six are found, follow the door chime home to the light.
// Headphones make the left / right sounds even clearer. Every sound is made live with WebAudio (no files).
import * as THREE from 'three';
import * as K from './kit.js';

const SOUNDS = [
  { id: 'birds', name: 'birdsong in a tree', u: 0.2, v: 0.22 },
  { id: 'bell', name: 'a bicycle bell', u: 0.8, v: 0.2 },
  { id: 'drips', name: 'dripping water', u: 0.17, v: 0.79 },
  { id: 'chimes', name: 'wind chimes on a porch', u: 0.87, v: 0.55 },
  { id: 'crossing', name: 'a crosswalk signal', u: 0.78, v: 0.86 },
  { id: 'dog', name: 'a guide dog’s tags', u: 0.1, v: 0.5 },
];
const HOME = { id: 'home', name: 'home', u: 0.5, v: 0.42 };
const FIND_R = 0.075, HOLD = 1.0, HEAR = 0.7;

/* ── the sound makers: each one is played into its own channel (volume, brightness, left / right) ── */
function soundscape(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function channel() {
    const g = ac.createGain(), f = ac.createBiquadFilter(), p = ac.createStereoPanner ? ac.createStereoPanner() : null; g.gain.value = 0; f.type = 'lowpass'; f.frequency.value = 800;
    g.connect(f); if (p) { f.connect(p); p.connect(out); } else f.connect(out);
    return { in: g, set(vol, bright, pan) { const t = ac.currentTime; g.gain.setTargetAtTime(vol, t, 0.08); f.frequency.setTargetAtTime(600 + bright * 9000, t, 0.08); if (p) p.pan.setTargetAtTime(pan, t, 0.08); } };
  }
  const tone = (dest, t, f, dur, { type = 'sine', vol = 0.3, to = 0, attack = 0.005 } = {}) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.02); };
  const hiss = (dest, t, dur, freq, type, vol, q = 1) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(dest); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02); };
  // each sound: what one "call" sounds like, and how long until the next
  const MAKE = {
    birds: (d, t) => { const n = 3 + Math.floor(Math.random() * 3), base = 2600 + Math.random() * 900; for (let i = 0; i < n; i++) tone(d, t + i * 0.13, base + i * 120, 0.09, { to: base * 1.45, vol: 0.32 }); return 1.4 + Math.random() * 1.6; },
    bell: (d, t) => { for (const k of [0, 0.22]) for (const [f, v] of [[2100, 0.3], [3350, 0.16], [5250, 0.08]]) tone(d, t + k, f, 0.9, { type: 'triangle', vol: v }); return 2.6 + Math.random(); },
    drips: (d, t) => { tone(d, t, 900 + Math.random() * 500, 0.06, { to: 2200, vol: 0.4 }); hiss(d, t + 0.02, 0.08, 1800, 'bandpass', 0.15, 2); return 0.35 + Math.random() * 0.9; },
    chimes: (d, t) => { const s = [1047, 1175, 1319, 1568, 1760, 2093], n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) { const f = s[Math.floor(Math.random() * s.length)]; tone(d, t + i * 0.18 + Math.random() * 0.06, f, 2.2, { type: 'triangle', vol: 0.18 }); tone(d, t + i * 0.18, f * 2.76, 0.8, { vol: 0.04 }); } return 1.8 + Math.random() * 1.6; },
    crossing: (d, t) => { tone(d, t, 880, 0.035, { type: 'square', vol: 0.34 }); hiss(d, t, 0.035, 3000, 'bandpass', 0.3, 3); return 1.0; },   // the locator tick of an accessible crosswalk
    dog: (d, t) => { const n = 3 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) { const tt = t + i * 0.07 + Math.random() * 0.03; tone(d, tt, 4200 + Math.random() * 2400, 0.12, { type: 'triangle', vol: 0.2 }); hiss(d, tt, 0.05, 7000, 'highpass', 0.12); }
      if (Math.random() < 0.3) { tone(d, t + 0.6, 420, 0.16, { type: 'sawtooth', to: 260, vol: 0.18, attack: 0.01 }); } return 2.2 + Math.random() * 1.4; },
    home: (d, t) => { tone(d, t, 659, 0.9, { type: 'triangle', vol: 0.3 }); tone(d, t + 0.45, 523, 1.3, { type: 'triangle', vol: 0.3 }); return 2.4; },   // ding-dong
  };
  const ch = {}, next = {};
  for (const id of Object.keys(MAKE)) { ch[id] = channel(); next[id] = ac.currentTime + 0.5 + Math.random() * 1.5; }
  let timer = null;
  const on = new Set(Object.keys(MAKE).filter(k => k !== 'home'));
  function tick() { for (const id of on) while (next[id] < ac.currentTime + 0.12) next[id] += MAKE[id](ch[id].in, next[id]); }
  return {
    ch, on,
    start() { timer = setInterval(tick, 30); out.gain.setTargetAtTime(1.8, ac.currentTime, 0.4); },
    volume(v) { out.gain.setTargetAtTime(v * 1.8, ac.currentTime, 0.2); },
    once(id, vol = 1) { const d = ac.createGain(); d.gain.value = vol; d.connect(out); MAKE[id](d, ac.currentTime + 0.03); },
    stop() { clearInterval(timer); out.gain.setTargetAtTime(0, ac.currentTime, 0.1); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 400); },
  };
}

/* ── the fog: swirling noise around the light, thinning where you listen and where sounds were found ── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform float uT, uH, uDense, uClear; uniform vec2 uEar; uniform vec3 uHoles[7];
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), c = vec2(0.5, 0.48), d = (p - c) * vec2(1.0, uH);
  float r = length(d), a = atan(d.y, d.x);
  // the fog swirls around the light, like the painting
  float sw = a + uT * 0.12 + 2.2 / (r + 0.35);
  vec2 q = vec2(cos(sw), sin(sw)) * r * 3.2;
  float f = fbm(q * 2.2 + vec2(uT * 0.05, 0.0)) * 0.75 + fbm(q * 5.0 - uT * 0.08) * 0.35;
  float dense = uDense * clamp(0.55 + f * 0.75, 0.0, 1.0);
  dense *= mix(0.86, 1.0, smoothstep(0.05, 0.3, r));           // a little of the light glows through the middle
  float e = length((p - uEar) * vec2(1.0, uH)); dense *= mix(0.55, 1.0, smoothstep(0.03, 0.12, e));   // you can just make out where you are
  for (int i = 0; i < 7; i++) { vec3 h = uHoles[i]; float dh = length((p - h.xy) * vec2(1.0, uH)); dense *= 1.0 - h.z * smoothstep(0.17, 0.04, dh); }
  dense *= 1.0 - uClear;
  vec3 col = mix(vec3(0.58, 0.63, 0.68), vec3(0.85, 0.88, 0.9), f);
  gl_FragColor = vec4(col * 0.55, dense);
}`;

export function soundSafariGame() {
  let G = null;
  const N = SOUNDS.length;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);
  const targets = () => (G.found < N ? SOUNDS.filter(s => !s.got) : (G.homeDone ? [] : [HOME]));

  function hud(near) {
    const heat = near === undefined ? '' : near < 0.1 ? 'Right here! Hold still.' : near < 0.22 ? 'Very close' : near < 0.4 ? 'Getting warmer' : 'Listen…';
    G.ui.panel('Sound safari', `${G.found}<small>of ${N} sounds</small>`, { segs: [G.found, N], sub: G.found < N ? heat : 'Follow the door chime home' + (heat ? ' · ' + heat : '') });
  }
  function find(s) {
    s.got = true; s.hole = 0.001; G.found++;
    const [x, y] = G.S.P(s.u, s.v); G.fx.add(x, y, '#e8f4ff', 26, 0.3); G.buzz([30, 40, 70]);
    K.chord([523.3, 659.3, 784].map(f => f * (1 + G.found * 0.06)), 0.9, { vol: 0.05 });
    G.ui.pop(s.name.replace(/^(a|the) /, '').toUpperCase());
    if (G.found >= N) { G.sc.on.add('home'); G.ui.alert('Now find your way home', 'Follow the door chime.', 2.6, 'blue'); G.say(`You found ${s.name}. That's all six. Now follow the door chime home.`); }
    else G.say(`You found ${s.name}. ${N - G.found} more.`);
    G.lastHud = -1;
  }
  function home() {
    G.homeDone = true; HOME.hole = 0.001; G.clearT = 0;
    G.sc.on.delete('home'); G.sc.once('home', 1.2); G.buzz([60, 60, 160]);
    G.ui.alert('You found your way', 'The fog lifts.', 3, 'red'); G.say('You found your way home. The fog lifts.');
    G.settle = 3.6;
  }
  function hint() {
    const s = targets().sort((a, b) => dist(a, G.ear) - dist(b, G.ear))[0]; if (!s) return;
    const du = s.u - G.ear.u, dv = s.v - G.ear.v, d = dist(s, G.ear);
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const msg = d < FIND_R ? 'You’re on it. Hold still.' : `${d < 0.22 ? 'Very close. ' : ''}Try ${[v, h].filter(Boolean).join(' and ') || 'a tiny bit further'}.`;
    G.ui.alert('Hint', msg, 1.8, 'blue'); G.say(msg);
  }

  return {
    title: 'Sound safari',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { found: 0, ear: { u: 0.5, v: 0.62 }, aim: { u: 0.5, v: 0.62 }, touch: null, touchT: 0, hold: 0, homeDone: false, clearT: -1, settle: 0, t0: 0, lastHud: 0 });
      [...SOUNDS, HOME].forEach(s => { s.got = false; s.hole = 0; });
      G.uni = { uT: { value: 0 }, uH: { value: G.h }, uDense: { value: 0 }, uClear: { value: 0 }, uEar: { value: new THREE.Vector2(0.5, 0.62) }, uHoles: { value: Array.from({ length: 7 }, () => new THREE.Vector3()) } };
      G.fog = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.fog.position.z = 0.03; G.fog.renderOrder = 12; G.root.add(G.fog);
      G.ring = K.sprite(K.ringTex, 0.08, { color: '#cfe8ff', order: 16, opacity: 0 }); G.ring.position.z = 0.05; G.root.add(G.ring);
      G.sc = soundscape(K.audio());
      G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: which way to go', press: () => G.playing && hint() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.sc.start(); };
      K.intro(G, { title: 'Sound safari', how: 'Fog fills the tunnel. Find your way by ear: move your finger or your phone through the fog toward each sound, and hold still when you’re on it. Headphones help.',
        say: 'Sound safari. Fog fills the tunnel, and you have to find your way by ear. Six sounds are hidden in the fog: birds, a bicycle bell, dripping water, wind chimes, a crosswalk signal and a guide dog. Move your finger, or point your phone, toward a sound. It gets louder, brighter and comes from its side as you get close. Hold still on it to find it. Headphones make it even better.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t; G.uni.uDense.value += (0.93 - G.uni.uDense.value) * Math.min(1, dt * 1.2);
      if (G.clearT >= 0) { G.clearT += dt; G.uni.uClear.value = Math.min(1, G.clearT / 2.5); }
      [...SOUNDS, HOME].forEach((s, i) => { if (s.hole > 0 && s.hole < 1) s.hole = Math.min(1, s.hole + dt * 1.2); G.uni.uHoles.value[i].set(s.u, s.v, s.hole || 0); });
      // where you're listening from: a finger, else where the phone points
      if (G.bot && G.playing) { const s = targets()[0]; if (s) { G.aim.u += (s.u - G.aim.u) * Math.min(1, dt * 1.8); G.aim.v += (s.v - G.aim.v) * Math.min(1, dt * 1.8); } }
      else if (G.touch) G.aim = { ...G.touch };
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(0, Math.min(1, p.u)), v: Math.max(0, Math.min(1, p.v)) }; }
      const k = Math.min(1, dt * 10); G.ear.u += (G.aim.u - G.ear.u) * k; G.ear.v += (G.aim.v - G.ear.v) * k; G.uni.uEar.value.set(G.ear.u, G.ear.v);
      const [ex, ey] = G.S.P(G.ear.u, G.ear.v); G.ring.position.set(ex, ey, 0.05);
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('almost-blindness:safari', t, 'lower');
        G.sc.volume(0.35); for (const s of SOUNDS) G.sc.ch[s.id].set(0.5, 0.8, (s.u - 0.5) * 1.6);   // every sound, softly, all around
        K.finale(G, { won: true, title: 'You found your way', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Sounds', v: `${N}/${N}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
      } return; }
      if (!G.playing) return;
      // every sound: louder, brighter and from its side as you get close; found sounds stay softly in the background
      let near = 9, nearS = null;
      for (const s of [...SOUNDS, HOME]) {
        if (!G.sc.on.has(s.id)) continue;
        const d = dist(s, G.ear), c = Math.max(0, 1 - d / HEAR), pan = Math.max(-1, Math.min(1, (s.u - G.ear.u) * 2.6));
        if (s.got) G.sc.ch[s.id].set(0.06 + c * c * 0.25, 0.3, pan);
        else G.sc.ch[s.id].set(0.02 + c * c * 0.95, c, pan);
        if (!s.got && d < near && (s !== HOME || G.found >= N)) { near = d; nearS = s; }
      }
      G.ring.material.opacity = 0.35 + Math.max(0, 0.5 - near) * 1.2; G.ring.scale.setScalar(0.06 + Math.max(0, 0.4 - near) * 0.12 + Math.sin(G.t * 6) * 0.004);
      if (nearS && near < FIND_R) {
        G.hold += dt; G.pulse = (G.pulse || 0) - dt; if (G.pulse <= 0) { G.pulse = 0.22; G.buzz(14); }
        if (G.hold >= HOLD) { G.hold = 0; if (nearS === HOME) home(); else find(nearS); }
      } else G.hold = Math.max(0, G.hold - dt * 2);
      G.lastHud -= dt; if (G.lastHud <= 0) { G.lastHud = 0.4; hud(near); }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'up') { G.touch = null; G.touchT = 1.0; return; }
      if (kind === 'down' || (kind === 'move' && G.touch)) { const p = G.S.toBoard(ev, G.root); if (p) G.touch = { u: p.u, v: p.v }; }
    },
    pause() { if (G) { G.paused = true; G.sc && G.sc.volume(0); } },
    resume() { if (G) { G.paused = false; G.sc && G.sc.volume(G.homeDone ? 0.35 : 1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'sound-safari', playing: G.playing, over: G.over, found: G.found, home: G.homeDone, ear: [+G.ear.u.toFixed(2), +G.ear.v.toFixed(2)], t: +G.t.toFixed(1) }; },
    stop() { if (G && G.sc) G.sc.stop(); K.cleanup(G); G = null; },
  };
}
export { soundscape as safariSounds };   // for testing the sounds on their own
