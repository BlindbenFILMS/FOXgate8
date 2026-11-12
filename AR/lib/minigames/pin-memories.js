// REASONS FOR A CURE (Rusty Perez): PIN THE MEMORIES, a calm "pin it in the glow" game.
// "…we can't see a loved one's face. And that is so much more meaningful, I think, than the reading or driving."
// The wall of photos is dim. One at a time, ten memories float down past it, each playing its own sound from its side
// (a laugh, a baby's giggle, wedding bells, waves, Happy Birthday, fireworks, wind chimes, a creaky swing, a kitchen
// waltz, Grandpa's harmonica). Across the middle of the wall there's a soft golden glow. When the memory floats into
// the glow it shimmers (you hear a soft sparkle): tap PIN (or anywhere) and it flies to its place on the wall with a
// brass pin, its sound plays out, its name is spoken, and that part of the wall warms up. Too early: "Not yet." Missed it:
// it floats round again. No losing. Ten memories pinned: the whole wall glows, then Rusty's own words.
// Accessible: each memory's sound comes from its side and grows as it nears the glow; the sparkle means "now"; the glow
// gets wider after a miss; names are spoken and shown big. Props: pin-things.js. Voice prefix: cure-
import * as THREE from 'three';
import * as K from './kit.js';
import { MEMORIES, memoryTex } from './pin-things.js';

const ARTIST = new URL('../../../3D/gallery/audio/art_21.mp3', import.meta.url).href;   // Rusty, in his own words
const N = 10;
// where each memory is pinned on the wall (u, v), clear of the man in the middle
const SLOTS = [[0.15, 0.14], [0.38, 0.11], [0.62, 0.11], [0.85, 0.14], [0.13, 0.40], [0.87, 0.40], [0.14, 0.66], [0.86, 0.66], [0.15, 0.89], [0.85, 0.89]];
const MW = 0.15, MH = MW * 1.2, PW = 0.13;           // a floating memory's size, and its size pinned
const BAND = 0.38, BAND_H0 = 0.17, BAND_MAX = 0.27;  // the golden glow across the wall (centre v, height)
const FALL = 0.16;                                   // how fast memories float down (painting heights per second)
const SAY_NAME = ['Mom’s smile.', 'Baby’s first steps.', 'Wedding day.', 'Sunset at the beach.', 'Birthday candles.',
  'Fireworks.', 'First snow.', 'Kids on the swings.', 'Dancing in the kitchen.', 'Grandpa’s face.'];
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform vec2 uPos[10];
uniform float uLit[10];
uniform float uT, uA, uBase, uAll, uBand, uBandH, uBandOn;
vec4 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = at(p).rgb;
  float L = uBase;
  for (int i = 0; i < 10; i++) L += uLit[i] * 0.85 * (1.0 - smoothstep(0.05, 0.30, length((p - uPos[i]) * vec2(1.0, 1.2))));
  L = max(L, uAll);
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 warm = mix(vec3(g) * vec3(0.92, 0.88, 0.84), col * vec3(1.08, 1.0, 0.9), clamp(L, 0.0, 1.0));
  col = warm * (0.45 + 0.6 * min(L, 1.1));
  // the golden glow band across the wall (behind the man: fade it out over him)
  float man = (1.0 - smoothstep(0.17, 0.22, abs(p.x - 0.5))) * smoothstep(0.44, 0.50, p.y);
  float band = exp(-pow((p.y - uBand) / (uBandH * 0.5), 2.0)) * uBandOn * (1.0 - man);
  col += vec3(1.0, 0.78, 0.42) * band * (0.30 + 0.08 * sin(uT * 2.2));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── sounds: each memory's own sound, and a gentle music box that grows ───────────────────────── */
function band(ac) {
  const master = ac.createGain(); master.gain.value = 0.0001;
  const sfx = ac.createGain(); sfx.gain.value = 1;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp); sfx.connect(comp); comp.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, bus) => { if (!ac.createStereoPanner) return bus; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(bus); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.006, p = 0, slide = 0, lp = 0, vib = 0, bus = sfx } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; }
    n.connect(g).connect(pan(p, bus)); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, att = 0.002, sweep = 0, bus = sfx } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur); f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(pan(p, bus)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  const bell = (t, m, v, p) => { const f = midi(m); tone(t, f, 1.6, { vol: v, p }); tone(t, f * 2.76, 0.7, { vol: v * 0.3, p }); tone(t, f * 5.4, 0.3, { vol: v * 0.12, p }); };
  // each memory's sound (about a second); v = loudness, p = pan
  const SOUNDS = [
    (t, v, p) => { tone(t, midi(64), 0.5, { vol: v * 0.5, att: 0.08, vib: 0.01, p }); [0, 0.16, 0.32].forEach((d, k) => noise(t + 0.45 + d, 0.12, { freq: 900 - k * 80, q: 4, vol: v * 0.9, att: 0.02, p })); },   // Mom: a hum and a soft laugh
    (t, v, p) => { for (let k = 0; k < 5; k++) { noise(t + k * 0.09, 0.07, { freq: 1500 + (k % 2) * 300, q: 6, vol: v * 0.9, att: 0.01, p }); tone(t + k * 0.09, 700 + k * 40, 0.07, { vol: v * 0.25, p }); } noise(t + 0.6, 0.3, { freq: 5000, q: 2, vol: v * 0.3, p }); },   // a baby's giggle and a rattle
    (t, v, p) => { bell(t, 76, v * 0.5, p); bell(t + 0.3, 79, v * 0.45, p); bell(t + 0.6, 84, v * 0.5, p); },   // wedding bells
    (t, v, p) => { noise(t, 1.3, { freq: 500, type: 'lowpass', q: 0.5, vol: v * 0.9, att: 0.5, p }); tone(t + 0.5, 1300, 0.25, { vol: v * 0.2, slide: 950, p }); tone(t + 0.8, 1250, 0.2, { vol: v * 0.15, slide: 900, p }); },   // waves and a gull
    (t, v, p) => { [[67, 0.22], [67, 0.11], [69, 0.33], [67, 0.33], [72, 0.33], [71, 0.6]].reduce((d, [m, l]) => { tone(t + d, midi(m), l * 0.95, { type: 'triangle', vol: v * 0.4, p }); return d + l; }, 0); },   // Happy Birthday
    (t, v, p) => { tone(t, 600, 0.45, { vol: v * 0.2, slide: 2400, p }); noise(t + 0.45, 0.35, { freq: 300, q: 0.7, vol: v * 1.1, p }); for (let k = 0; k < 8; k++) noise(t + 0.55 + k * 0.05, 0.03, { freq: 4000, q: 2, vol: v * 0.4, p: p + (Math.random() - 0.5) * 0.4 }); },   // fireworks
    (t, v, p) => { noise(t, 1.2, { freq: 600, q: 0.6, vol: v * 0.3, att: 0.4, sweep: 1200, p }); [96, 91, 98, 93, 100].forEach((m, k) => tone(t + k * 0.17, midi(m), 0.8, { vol: v * 0.12, p: p + (k - 2) * 0.1 })); },   // first snow: wind chimes
    (t, v, p) => { tone(t, 300, 0.35, { type: 'sawtooth', vol: v * 0.08, slide: 360, lp: 900, p }); tone(t + 0.4, 360, 0.35, { type: 'sawtooth', vol: v * 0.08, slide: 300, lp: 900, p }); tone(t + 0.2, 600, 0.6, { vol: v * 0.25, slide: 1300, p }); },   // a creaky swing and "wheee"
    (t, v, p) => { const s = 0.18; [[48, 0], [60, 1], [60, 2], [43, 3], [59, 4], [59, 5]].forEach(([m, k]) => tone(t + k * s, midi(m + (k % 3 ? 7 : 0)), 0.16, { type: 'triangle', vol: v * (k % 3 ? 0.18 : 0.35), p })); [76, 79, 77, 76].forEach((m, k) => tone(t + k * s * 1.5, midi(m), s * 1.4, { vol: v * 0.2, vib: 0.01, p })); },   // a kitchen waltz
    (t, v, p) => { [[60, 64, 67], [62, 65, 69]].forEach((c, k) => c.forEach(m => tone(t + k * 0.45, midi(m), 0.42, { type: 'square', vol: v * 0.06, lp: 1600, vib: 0.012, att: 0.05, p }))); },   // Grandpa's harmonica
  ];
  const B = {
    layers: 0, step: 0, next: 0, timer: null,
    play(i, v, p) { SOUNDS[i](ac.currentTime + 0.02, v, p); },
    sparkle(p) { const t = ac.currentTime; tone(t, midi(91), 0.25, { vol: 0.07, p }); tone(t + 0.06, midi(96), 0.25, { vol: 0.05, p }); },
    pin(p) { const t = ac.currentTime; tone(t, 1200, 0.05, { type: 'square', vol: 0.06, p }); noise(t, 0.08, { freq: 2600, q: 2, vol: 0.4, p }); tone(t, 180, 0.15, { vol: 0.3, slide: 90, p }); },
    nope(p) { const t = ac.currentTime; tone(t, 330, 0.18, { type: 'triangle', vol: 0.08, slide: 280, p }); },
    swoosh(p) { noise(ac.currentTime, 0.5, { freq: 700, q: 0.8, vol: 0.15, sweep: 2200, p }); },
    // the music box waltz: A – F#m – D – E, a note on each beat, more notes and a warm pad as the wall fills
    sched(step, t) {
      const bar = Math.floor(B.step / 3), CH = [[69, 73, 76], [66, 69, 73], [62, 66, 69], [64, 68, 71]][bar % 4], L = B.layers;
      const k = step % 3;
      tone(t, midi(CH[k] + 12), 1.4, { vol: 0.05, p: (k - 1) * 0.3, bus: master });                                  // music box
      if (k === 0) tone(t, midi(CH[0] - 24), 1.6, { type: 'triangle', vol: L >= 2 ? 0.12 : 0.06, lp: 500, bus: master });   // low note
      if (L >= 4 && k !== 0) tone(t + 0.27, midi(CH[(k + 1) % 3] + 24), 0.6, { vol: 0.025, bus: master });
      if (L >= 6 && k === 0) CH.forEach(m => tone(t, midi(m), 2.0, { type: 'triangle', vol: 0.022, att: 0.4, bus: master }));   // warm pad
      if (L >= 8 && k === 1) tone(t, midi(CH[2] + 12), 0.9, { vol: 0.04, vib: 0.01, att: 0.08, p: 0.2, bus: master });
    },
    tick() { const now = ac.currentTime; while (B.next < now + 0.2) { B.sched(B.step % 3, B.next); B.next += 0.55; B.step++; } },
    start() { B.next = ac.currentTime + 0.1; master.gain.setTargetAtTime(0.7, ac.currentTime, 0.3); clearInterval(B.timer); B.timer = setInterval(B.tick, 40); B.tick(); },
    hold() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); },
    fade(to, secs) { master.gain.setTargetAtTime(Math.max(0.0001, to), ac.currentTime, secs / 3); },
    stop() { clearInterval(B.timer); B.timer = null; master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); sfx.gain.setTargetAtTime(0.0001, ac.currentTime, 0.08); setTimeout(() => { try { master.disconnect(); sfx.disconnect(); } catch (e) {} }, 600); },
  };
  return B;
}

export function pinTheMemoriesGame() {
  let G = null;
  const panU = (u) => (u - 0.5) * 1.8;

  function popLow(text) { G.ui.pop(text, innerWidth / 2, innerHeight - 250); }
  function hud() {
    G.ui.panel('Pin the memories', `${G.pinned}<small>of ${N} pinned</small>`, { segs: [G.pinned, N],
      sub: G.pinned >= N ? 'The wall is full' : 'Tap PIN when it reaches the glow' });
  }
  function hudCss() {
    const st = document.createElement('style'); st.dataset.cure = '1';
    st.textContent = '.mgk.mgk-alert,.mgk.mgk-count{top:auto!important;bottom:calc(152px + env(safe-area-inset-bottom))!important}' +
      '.mgk.mgk-end{left:calc(18px + env(safe-area-inset-left))!important;right:calc(18px + env(safe-area-inset-right))!important}' +
      '.mgk-end .top{padding:14px 20px 16px!important}.mgk-end .cells div{padding:10px 12px 12px!important;min-width:0}' +
      '.mgk-end .cells b{font-size:12px!important;letter-spacing:.1em!important;line-height:1.25!important}.mgk-end .cells span{font-size:clamp(22px,7vw,38px)!important}' +
      '.mgk-end .line{padding:12px 20px 14px!important}.mgk-end button{padding:0 20px!important}' +
      '.mgk.mgk-alert{left:calc(18px + env(safe-area-inset-left))!important;right:calc(24px + env(safe-area-inset-right))!important;padding:14px 20px 16px!important}' +
      '.mgk.mgk-panel{padding:10px 20px 12px!important}.mgk.mgk-pop{padding:6px 14px 5px!important;white-space:nowrap}';
    document.head.appendChild(st); return st;
  }
  // the next memory floats in from the top, somewhere across the wall
  function launch(again = false) {
    const i = G.pinned, M = G.mem[i];
    Object.assign(M, { state: 'fall', u: 0.24 + Math.random() * 0.52, v: -0.12, ph: Math.random() * 6, nextSound: 0.2, sparkled: false });
    M.u0 = M.u; M.mesh.visible = true; M.mesh.material.opacity = 1;
    G.cur = i; if (again && G.t - G.lastSay > 2) { G.lastSay = G.t; G.say('Here it comes again.'); }
  }
  const inBand = (M) => Math.abs(M.v - BAND) <= G.bandH / 2;
  function pin() {
    if (!G || !G.playing || G.over || G.cur < 0) return;
    const M = G.mem[G.cur]; if (M.state !== 'fall') return;
    G.taps++;
    if (!inBand(M)) {
      G.band.nope(panU(M.u)); G.buzz(12);
      popLow(M.v < BAND ? 'NOT YET' : 'MISSED IT');
      if (G.t - G.lastSay > 2) { G.lastSay = G.t; G.say(M.v < BAND ? 'Not yet.' : 'Here it comes again.'); }
      return;
    }
    // pinned! it flies to its place on the wall
    const i = G.cur, [su, sv] = SLOTS[i];
    Object.assign(M, { state: 'fly', from: [M.u, M.v, MW, M.mesh.rotation.z], ft: 0, to: [su, sv, PW, (Math.random() - 0.5) * 0.14] });
    G.cur = -1; G.pinned++; G.band.layers = G.pinned; G.band.swoosh(panU(M.u));
    popLow('PINNED!'); G.ui.alert(MEMORIES[i], 'Pinned to the wall', 1.8, 'red');
    G.say(G.pinned >= N ? SAY_NAME[i] + ' The wall is full.' : SAY_NAME[i]);
    hud();
  }
  function landed(i) {
    const M = G.mem[i], [x, y] = G.S.P(M.u, M.v);
    M.state = 'pinned'; M.litT = 0;
    G.band.pin(panU(M.u)); G.buzz([30, 20, 60]);
    setTimeout(() => { if (G) G.band.play(i, 0.9, panU(M.u)); }, 200);   // its sound plays out in full
    G.fx.add(x, y, '#ffd98a', 24, 0.3); G.fx.add(x, y, '#ffffff', 8, 0.2);
    if (G.pinned >= N) { G.endAt = G.t + 3.2; G.allOn = true; }
    else setTimeout(() => { if (G && !G.over) launch(); }, 1400);
  }
  function finish() {
    if (G.over) return;
    const t = Math.round(G.t - G.t0), r = K.best('reasons-for-a-cure:pin', G.taps, 'lower');
    K.finale(G, { won: true, kicker: 'Pin the memories', title: 'Reasons to see', line: G.work && G.work.quote, best: r.isBest, say: 'Every memory is pinned.',
      cells: [{ k: 'Pinned', v: `${N}/${N}` }, { k: 'Taps', v: `${G.taps}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
    G.band.fade(0.3, 2); G.overT = 0;
  }

  return {
    title: 'Pin the Memories',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx); G.css = hudCss();
      Object.assign(G, { pinned: 0, cur: -1, taps: 0, misses: 0, lastSay: -9, hinted: false, bandH: BAND_H0, all: 0, allOn: false, endAt: 0, t0: 0, overT: 0 });
      G.band = band(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      G.uni = { map: { value: null }, uPos: { value: SLOTS.map(([u, v]) => new THREE.Vector2(u, v)) }, uLit: { value: SLOTS.map(() => 0) },
        uT: { value: 0 }, uA: { value: 0 }, uBase: { value: 0.12 }, uAll: { value: 0 }, uBand: { value: BAND }, uBandH: { value: BAND_H0 }, uBandOn: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      new THREE.TextureLoader().load((ctx.work && ctx.work.image) || 'targets/reasons-for-a-cure.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the ten memories (hidden until they float in) and a soft glow behind each
      G.mem = MEMORIES.map((_, i) => {
        const mesh = K.plane(memoryTex(i), MW, MH, { order: 30 + i }); mesh.visible = false; mesh.position.z = 0.06; G.root.add(mesh);
        const halo = K.sprite(K.glowTex, MW * 2.2, { color: '#ffd98a', additive: true, order: 29, opacity: 0 }); G.root.add(halo);
        return { mesh, halo, state: 'wait', u: 0.5, v: -0.2, ph: 0, litT: -1, nextSound: 0, sparkled: false };
      });
      G.ui.buttons([{ label: 'Pin', kind: 'red', aria: 'Pin the memory to the wall', press: () => pin() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); setTimeout(() => { if (G && !G.over) launch(); }, 600); };
      K.intro(G, { title: 'Pin the Memories', how: 'Memories float down past the wall, each with its own sound. When one reaches the golden glow, tap PIN.',
        say: 'Pin the Memories. Memories float down past the wall. Each one has its own sound. When it reaches the golden glow, tap pin.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over && G.overT > 5 ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      u.uBandOn.value += ((G.cur >= 0 ? 1 : 0) - u.uBandOn.value) * Math.min(1, dt * 3); u.uBandH.value = G.bandH;
      G.all += ((G.allOn ? 1 : G.pinned / N * 0.25) - G.all) * Math.min(1, dt * 1.2); u.uAll.value = G.all;
      G.mem.forEach((M, i) => {
        if (M.state === 'fall') {
          M.v += FALL * dt * (inBand(M) ? 0.8 : 1); M.ph += dt;
          M.u = M.u0 + Math.sin(M.ph * 1.3) * 0.04;
          const [x, y] = G.S.P(M.u, M.v), near = Math.max(0, 1 - Math.abs(M.v - BAND) / 0.6), hot = inBand(M);
          M.mesh.position.set(x, y, 0.06); M.mesh.rotation.z = Math.sin(M.ph * 1.1) * 0.12; M.mesh.scale.setScalar(1 + (hot ? 0.08 + 0.03 * Math.sin(G.t * 10) : 0));
          M.halo.position.set(x, y, 0.055); M.halo.material.opacity = hot ? 0.75 : 0.15 * near;
          // its own sound, from its side, louder as it nears the glow; a sparkle when it's in
          M.nextSound -= dt; if (M.nextSound <= 0) { G.band.play(i, 0.25 + near * 0.55, panU(M.u)); M.nextSound = 1.6; }
          if (hot && !M.sparkled) { M.sparkled = true; G.band.sparkle(panU(M.u)); M.sparkT = 0.35; }
          if (hot) { M.sparkT -= dt; if (M.sparkT <= 0) { G.band.sparkle(panU(M.u)); M.sparkT = 0.35; } }
          // missed: it floats off the bottom and comes round again (the glow gets wider)
          if (M.v > 1.15) { G.misses++; G.bandH = Math.min(BAND_MAX, G.bandH + 0.03); M.mesh.visible = false; M.halo.material.opacity = 0;
            if (G.misses >= 2 && !G.hinted) { G.hinted = true; G.lastSay = G.t; G.say('Listen for the sparkle, then tap pin.'); }
            launch(true); }
        } else if (M.state === 'fly') {
          M.ft += dt / 0.7; const k = Math.min(1, M.ft), e = 1 - Math.pow(1 - k, 3);
          M.u = M.from[0] + (M.to[0] - M.from[0]) * e; M.v = M.from[1] + (M.to[1] - M.from[1]) * e - Math.sin(k * Math.PI) * 0.06;
          const w = M.from[2] + (M.to[2] - M.from[2]) * e, [x, y] = G.S.P(M.u, M.v);
          M.mesh.position.set(x, y, 0.065); M.mesh.scale.setScalar(w / MW); M.mesh.rotation.z = M.from[3] + (M.to[3] - M.from[3]) * e;
          M.halo.position.set(x, y, 0.055); M.halo.material.opacity = 0.6;
          if (k >= 1) landed(i);
        } else if (M.state === 'pinned') {
          M.litT += dt; u.uLit.value[i] = Math.min(1, M.litT / 1.2);
          const [x, y] = G.S.P(M.u, M.v), pulse = G.allOn ? 0.35 + 0.25 * Math.sin(G.t * 2 + i) : Math.max(0, 0.6 - M.litT * 0.5);
          M.mesh.position.set(x, y, 0.06); M.mesh.scale.setScalar(PW / MW * (1 + Math.max(0, 0.25 - M.litT) * 0.6));
          M.halo.position.set(x, y, 0.055); M.halo.scale.setScalar(PW * 2.2); M.halo.material.opacity = pulse;
        }
      });
      if (G.endAt && G.t >= G.endAt && !G.over) finish();
      if (G.over) {
        G.overT += dt;
        if (G.overT > 2.5 && !G.artist) {
          G.band.fade(0.05, 0.6);
          const back = () => { if (G && !G.musicBack) { G.musicBack = true; G.band.fade(0.18, 2); G.fadeAt = G.overT + 7; } };
          try { G.artist = new Audio(ARTIST); G.artist.onended = back; G.artist.onerror = back; G.artist.play().catch(back); } catch (e) { G.artist = { pause() {} }; back(); }
          G.clipSafety = G.overT + 27;
        }
        if (G.artist && !G.musicBack && G.overT > G.clipSafety) { G.musicBack = true; G.band.fade(0.18, 2); G.fadeAt = G.overT + 7; }
        if (G.fadeAt && G.overT > G.fadeAt && !G.faded) { G.faded = true; G.band.fade(0.0001, 3); }
      }
      // the robot: pins each memory in the middle of the glow (one tap too early, once, to show what happens)
      if (G.bot && G.playing && G.cur >= 0) { const M = G.mem[G.cur];
        if (M.state === 'fall' && G.pinned === 1 && !G.botEarly && M.v > 0.05) { G.botEarly = true; pin(); }
        else if (M.state === 'fall' && Math.abs(M.v - BAND) < 0.02) pin(); }
    },
    pointer(kind, ev) { if (!G || !G.playing || G.paused || kind !== 'down') return; pin(); },
    pause() { if (G) { G.paused = true; G.band.hold(); if (G.artist) G.artist.pause(); } },
    resume() { if (!G) return; G.paused = false; if (G.playing || G.endAt) G.band.start(); if (G.artist && G.over && G.artist.play && !G.artist.ended) G.artist.play().catch(() => {}); },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'pin-memories', playing: G.playing, over: G.over, pinned: G.pinned, cur: G.cur, taps: G.taps, misses: G.misses, artist: !!(G.artist && G.artist.currentTime > 0), artistT: G.artist ? +(G.artist.currentTime || 0).toFixed(1) : 0, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) { G.band.stop(); if (G.artist) { try { G.artist.pause(); } catch (e) {} G.artist = null; } if (G.css) G.css.remove(); }
      K.cleanup(G); G = null;
    },
  };
}
