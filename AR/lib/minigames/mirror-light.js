// THE MIRROR (Morten Bonde): PIECES OF ME, a flashlight game about finding yourself while your sight changes.
// The desert goes dark. Your phone is a flashlight: wherever it points (or where you drag a finger) the painting shows
// through. Eight broken pieces of the mirror are hidden around the painting, and each one holds a piece of who you are
// (curious, kind, creative, brave, funny, patient, loved… still me). Hold the light on a glint to find it: the word
// flies back to the mirror and the crack starts to glow. But with every piece, your sight changes: the light gets
// smaller, blurrier and paler, and later it flickers out for a moment. Your hearing gets sharper instead: the glass
// shimmer that leads you to the next piece gets louder and clearer. When all eight are found, shine on the mirror:
// it lights up the whole desert, the two men meet, and Morten's words close the game.
// A lofi song (keys, vinyl, a soft beat, bass, a glockenspiel tune) grows with every piece. Hint says which way to go.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const PIECES = [
  { word: 'Curious', u: 0.1, v: 0.31 },
  { word: 'Kind', u: 0.52, v: 0.82 },
  { word: 'Creative', u: 0.88, v: 0.24 },
  { word: 'Brave', u: 0.07, v: 0.59 },
  { word: 'Funny', u: 0.4, v: 0.79 },
  { word: 'Patient', u: 0.6, v: 0.1 },
  { word: 'Loved', u: 0.9, v: 0.66 },
  { word: 'Still me', u: 0.27, v: 0.31 },
];
const MIRROR = { u: 0.48, v: 0.45 };
const R0 = 0.15, R1 = 0.065, FIND_R = 0.07, DWELL = 0.6;

/* ───────────────────────── the lofi band: dreamy, a little bittersweet ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[51, 55, 58, 62, 65], [48, 51, 55, 58, 62], [44, 48, 51, 55, 58], [46, 50, 53, 56, 60]];   // Ebmaj9 · Cm9 · Abmaj9 · Bb7sus
const BASS = [39, 36, 32, 34];
const TUNE = [[79, 0, 1], [77, 1, 0.5], [75, 1.5, 1.5], [74, 4, 1], [75, 5, 0.5], [77, 5.5, 1.5], [72, 8, 1.5], [70, 9.5, 0.5], [72, 10, 1], [75, 12, 1], [74, 13, 0.5], [70, 13.5, 2]];
function band(ac) {
  const BPM = 72, beat = 60 / BPM, bar = beat * 4;
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3000; tape.Q.value = 0.5; bus.connect(tape).connect(ac.destination);
  const air = ac.createGain(); air.gain.value = 0; air.connect(ac.destination);
  const wob = ac.createOscillator(), wobG = ac.createGain(); wob.frequency.value = 0.3; wobG.gain.value = 8; wob.connect(wobG); wob.start();
  const layers = { hats: 0, beat: 0, bass: 0, lead: 0 };
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, pan = 0, out = bus } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), p = ac.createStereoPanner ? ac.createStereoPanner() : null;
    s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g); if (p) { p.pan.value = pan; g.connect(p).connect(out); } else g.connect(out); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  function keys(t, m, dur, vol = 0.05) {
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.04); g.gain.exponentialRampToValueAtTime(vol * 0.4, t + 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [mul, v, type] of [[1, 1, 'sine'], [2, 0.16, 'triangle'], [3.01, 0.04, 'sine']]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = type; o.frequency.value = midi(m) * mul; og.gain.value = v; wobG.connect(o.detune); o.connect(og).connect(g); o.start(t); o.stop(t + dur + 0.05); }
    g.connect(bus);
  }
  function glock(t, m, vol = 0.05) { for (const [mul, v, d] of [[1, 1, 1.2], [2.76, 0.3, 0.4], [5.4, 0.12, 0.2]]) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = midi(m) * mul; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(air); o.start(t); o.stop(t + d + 0.02); } }
  function kick(t) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.25); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); o.connect(g).connect(bus); o.start(t); o.stop(t + 0.5); }
  function snare(t) { noise(t, 0.22, { freq: 1600, q: 0.6, vol: 0.13 }); }
  const hat = (t, v) => noise(t, 0.04, { freq: 7000, type: 'highpass', q: 0.6, vol: v, pan: 0.25, out: air });
  function bass(t, m, dur) { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = midi(m); f.type = 'lowpass'; f.frequency.value = 400; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f).connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05); }
  const bed = ac.createBufferSource(), bedF = ac.createBiquadFilter(), bedG = ac.createGain(); bed.buffer = nb; bed.loop = true; bedF.type = 'bandpass'; bedF.frequency.value = 2400; bedF.Q.value = 0.4; bedG.gain.value = 0.012; bed.connect(bedF).connect(bedG).connect(bus); bed.start();
  let next = ac.currentTime + 0.1, step = 0, timer = null;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, barN = Math.floor(step / 8), ch = barN % 4, sw = b8 % 2 ? beat * 0.08 : 0, tt = t + sw;
      if (b8 === 0) CHORDS[ch].forEach((m, i) => keys(t + i * 0.015, m + 12, bar * 0.95, 0.05));
      if (b8 === 6) keys(tt, CHORDS[ch][CHORDS[ch].length - 1] + 24, beat, 0.025);
      if (layers.hats) hat(tt, (b8 % 2 ? 0.045 : 0.08) * (0.8 + Math.random() * 0.4));
      if (layers.beat) { if (b8 === 0 || b8 === 5) kick(tt); if (b8 === 2 || b8 === 6) snare(tt); }
      if (layers.bass) { if (b8 === 0) bass(t, BASS[ch], beat * 1.8); if (b8 === 3) bass(tt, BASS[ch] + 7, beat * 0.8); if (b8 === 6) bass(tt, BASS[ch] + 12, beat * 0.9); }
      if (layers.lead) { const pos = (barN % 4) * 4 + b8 / 2; for (const [m, at] of TUNE) if (Math.abs(at - pos) < 0.01) glock(tt, m, 0.06); }
      if (Math.random() < 0.3) noise(t + Math.random() * beat / 2, 0.012, { freq: 2500 + Math.random() * 2500, q: 3, vol: 0.03 + Math.random() * 0.04, pan: Math.random() - 0.5, out: air });   // vinyl pops
      next += beat / 2; step++;
    }
  }
  return {
    layers, glock: (m, v) => glock(ac.currentTime + 0.02, m, v),
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.9); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); air.gain.setTargetAtTime(v, ac.currentTime, 0.25); },
    stop() { clearInterval(timer); timer = null; this.volume(0); setTimeout(() => { try { bed.stop(); wob.stop(); bus.disconnect(); air.disconnect(); } catch (e) {} }, 600); },
  };
}

/* ───────────────────────── the dark, and a light that changes ───────────────────────── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform vec2 uBeam; uniform float uR, uH, uDark, uOn, uT, uBlur, uPale, uAll, uMend, uA;
vec3 tex(vec2 q){ q = clamp(q, 0.0, 1.0); return texture2D(map, vec2(q.x, 1.0 - q.y)).rgb; }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // what you see in the light: sharp at first, then blurrier and paler as your sight changes
  vec3 c = tex(p) * 0.2; float w = 0.2;
  if (uBlur > 0.0005) { for (int i = 0; i < 8; i++) { float a = float(i) * 0.785398; c += tex(p + vec2(cos(a), sin(a) * uH) * uBlur) * 0.1; w += 0.1; } }
  else { c = tex(p); w = 1.0; }
  c /= w;
  float g = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(c, vec3(g) * vec3(1.02, 1.0, 0.96) + 0.06, uPale);
  // the beam
  float d = length((p - uBeam) * vec2(1.0, uH)), flick = 1.0 + 0.04 * sin(uT * 13.0) * sin(uT * 7.3);
  float beam = uOn * smoothstep(uR * flick, uR * 0.4, d);
  // the mirror's crack glows as it mends
  float dm = length((p - vec2(0.48, 0.45)) * vec2(1.6, 0.55 * uH));
  float mend = uMend * smoothstep(0.32, 0.0, dm) * (0.55 + 0.25 * sin(uT * 2.0));
  float light = clamp(beam + mend * 0.6 + uAll, 0.0, 1.0);
  vec3 dark = vec3(0.01, 0.015, 0.03);
  vec3 col = mix(dark, c, light) + vec3(0.75, 0.9, 1.0) * mend * 0.18 * (1.0 - uAll);
  float rim = uOn * smoothstep(uR * 1.08, uR * 0.85, d) * (1.0 - smoothstep(uR * 0.85, uR * 0.55, d)) * (1.0 - uAll);
  col += vec3(0.9, 0.95, 1.0) * rim * 0.12;
  gl_FragColor = vec4(mix(c, col, uDark), uA);
}`;
const glintTex = K.canvasTex(64, 64, (g) => {
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(210,235,255,.7)'); gr.addColorStop(1, 'rgba(160,200,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(32, 2); g.lineTo(36, 28); g.lineTo(62, 32); g.lineTo(36, 36); g.lineTo(32, 62); g.lineTo(28, 36); g.lineTo(2, 32); g.lineTo(28, 28); g.closePath(); g.fill();
});

export function piecesOfMeGame() {
  let G = null;
  const N = PIECES.length;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);
  const nextTarget = () => (G.found >= N ? (G.mirrorDone ? null : MIRROR) : PIECES.filter(s => !s.got).sort((a, b) => dist(a, G.beam) - dist(b, G.beam))[0]);

  function hud() { G.ui.panel('Pieces of me', `${G.found}<small>of ${N} pieces</small>`, { segs: [G.found, N], sub: G.found < N ? (G.found ? 'Your sight is changing. Listen for the glass.' : 'Hold the light on a glint of glass') : 'Now shine your light on the mirror' }); }
  function find(s) {
    s.got = true; G.found++;
    const k = G.found / N;
    G.R = R0 + (R1 - R0) * k; G.blur = 0.012 * k * k * 1.4; G.pale = 0.45 * k;            // the light shrinks, blurs and fades
    G.hear = 1 + k * 1.6;                                                                    // and your hearing sharpens
    const [x, y] = G.S.P(s.u, s.v), pan = Math.max(-1, Math.min(1, (s.u - 0.5) * 1.8));
    G.music.glock([75, 77, 79, 82, 84, 87, 89, 91][G.found - 1], 0.09); K.tone(2093, 0.6, { vol: 0.04, pan, delay: 0.05 });
    G.fx.add(x, y, '#dff1ff', 22, 0.25); G.buzz([30, 40, 60]);
    // the word flies home to the mirror
    const tag = K.plane(K.wordTex(s.word), 0.3, 0.075, { order: 31 }); tag.position.set(x, y, 0.07); G.root.add(tag); G.tags.push({ tag, t: 0, x, y });
    const L = G.music.layers, add = { 1: 'hats', 3: 'beat', 5: 'bass', 7: 'lead' }[G.found]; if (add) L[add] = 1;
    hud();
    if (G.found === N) { G.ui.alert('Now look in the mirror', 'Shine your light on it.', 2.6, 'blue'); G.say(`${s.word}. That's every piece. Now shine your light on the mirror.`); }
    else {
      const extra = { 2: 'Your light is getting smaller. Listen closer.', 4: 'Things are getting blurry. Your ears are getting sharper.', 6: 'Your light is fading. Trust the sound.' }[G.found];
      G.say(`You found a piece of yourself: ${s.word.toLowerCase()}. ${extra ? extra + ' ' : ''}${N - G.found} to go.`);
    }
  }
  function mirror() {
    G.mirrorDone = true; G.allT = 0; G.blur = 0; G.pale = 0; G.R = R0 * 1.5; G.buzz([40, 60, 120]);   // in the mirror's light, everything is clear again
    [63, 67, 70, 75, 79].forEach((m, i) => setTimeout(() => G && G.music.glock(m + 12, 0.08), i * 160));
    const [x, y] = G.S.P(MIRROR.u, MIRROR.v); G.fx.add(x, y, '#ffffff', 44, 0.45);
    G.ui.alert('The man in the mirror', 'Every piece of him, still him.', 3, 'red'); G.say('The man in the mirror is still you. Every piece.');
    G.settle = 4.5;
  }
  function hint() {
    const s = nextTarget(); if (!s) return;
    const du = s.u - G.beam.u, dv = s.v - G.beam.v, d = dist(s, G.beam);
    if (d < FIND_R) { G.say('You’re right on it. Hold still.'); return; }
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const way = [v, h].filter(Boolean).join(' and ') || 'just a little';
    const near = d < 0.18 ? 'Very close. ' : d < 0.35 ? 'Getting warm. ' : '';
    G.ui.alert(near + 'Move ' + way, s === MIRROR ? 'The mirror is in the middle' : '', 1.6, 'blue'); G.say(near + 'Move ' + way + '.');
  }

  return {
    title: 'Pieces of me',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { found: 0, beam: { u: 0.5, v: 0.5 }, aim: { u: 0.5, v: 0.5 }, dwell: 0, twinkleT: 0, touch: null, touchT: 0, mirrorDone: false, allT: -1, settle: 0, t0: 0,
        R: R0, blur: 0, pale: 0, hear: 1, outT: 0, outNext: 9, tags: [] });
      PIECES.forEach(s => { s.got = false; });
      G.uni = { map: { value: null }, uBeam: { value: new THREE.Vector2(0.5, 0.5) }, uR: { value: R0 }, uH: { value: G.h }, uDark: { value: 0 }, uOn: { value: 0 }, uT: { value: 0 },
        uBlur: { value: 0 }, uPale: { value: 0 }, uAll: { value: 0 }, uMend: { value: 0 }, uA: { value: 0 } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // a glint of glass at each piece (it only shows in your light)
      G.glints = PIECES.map(s => { const g = K.sprite(glintTex, 0.05, { additive: true, opacity: 0, order: 14 }); const [x, y] = G.S.P(s.u, s.v); g.position.set(x, y, 0.05); G.root.add(g); return g; });
      G.music = K.audio() ? band(K.audio()) : new Proxy({ layers: {} }, { get: (o, k) => (k in o ? o[k] : () => {}) });
      G.music.start();
      G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: which way to move the light', press: () => G.playing && hint() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.say('Lights out. Move your phone to shine the light.'); };
      K.intro(G, { title: 'Pieces of me', how: 'The mirror is broken and the desert is dark. Shine your light to find 8 pieces of who you are. Your sight will change as you go: listen for the glass.',
        say: 'Pieces of me. The mirror is broken, and the desert has gone dark. Your phone is a flashlight: move it across the painting, or drag a finger, and find eight pieces of the mirror. Each one holds a piece of who you are. Hold the light on a glint of glass to find it. As you go, your sight will change, and your light will get smaller and blurrier. But your hearing gets sharper: follow the shimmer of the glass.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.uT.value = G.t;
      U.uA.value += ((G.ready && !G.over ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2);
      U.uDark.value += (0.96 - U.uDark.value) * Math.min(1, dt * 1.5);
      // later on, the light flickers out for a moment now and then
      let on = G.playing || G.mirrorDone ? 1 : 0.6;
      if (G.playing && !G.mirrorDone && G.found >= 5) { G.outNext -= dt; if (G.outNext <= 0) { G.outT = 0.8 + Math.random() * 0.6; G.outNext = 7 + Math.random() * 6; K.tone(180, 0.2, { type: 'triangle', vol: 0.04 }); } }
      if (G.outT > 0) { G.outT -= dt; on = 0.08; }
      U.uOn.value += (on - U.uOn.value) * Math.min(1, dt * 6);
      U.uR.value += (G.R - U.uR.value) * Math.min(1, dt * 2); U.uBlur.value += (G.blur - U.uBlur.value) * Math.min(1, dt * 2); U.uPale.value += (G.pale - U.uPale.value) * Math.min(1, dt * 2);
      U.uMend.value += (G.found / N - U.uMend.value) * Math.min(1, dt * 1.5);
      // where the light points: a finger, else the middle of the screen
      if (G.bot && G.playing) { const s = nextTarget(); if (s) G.aim = { u: G.aim.u + (s.u - G.aim.u) * Math.min(1, dt * 2.2), v: G.aim.v + (s.v - G.aim.v) * Math.min(1, dt * 2.2) }; }
      else if (G.touch) G.aim = G.touch;
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(-0.1, Math.min(1.1, p.u)), v: Math.max(-0.1, Math.min(1.1, p.v)) }; }
      const k = Math.min(1, dt * 14); G.beam.u += (G.aim.u - G.beam.u) * k; G.beam.v += (G.aim.v - G.beam.v) * k;
      U.uBeam.value.set(G.beam.u, G.beam.v);
      // glints show only in the light
      PIECES.forEach((s, i) => { const d = dist(s, G.beam), g = G.glints[i]; g.material.opacity = s.got ? Math.max(0, g.material.opacity - dt * 3) : U.uOn.value * Math.max(0, 1 - d / (U.uR.value * 0.9)) * (0.6 + 0.4 * Math.sin(G.t * 5 + i)) * (1 - U.uAll.value); g.scale.setScalar(0.04 + 0.015 * Math.sin(G.t * 3 + i)); });
      // words fly back to the mirror
      const [mx, my] = G.S.P(MIRROR.u, MIRROR.v);
      for (let i = G.tags.length - 1; i >= 0; i--) { const T = G.tags[i]; T.t += dt; const e = Math.min(1, Math.max(0, (T.t - 1.0) / 1.2)), ee = e * e * (3 - 2 * e);
        T.tag.position.set(T.x + (mx - T.x) * ee, T.y + (my - T.y) * ee + Math.sin(ee * Math.PI) * 0.05, 0.07); T.tag.scale.setScalar(1 - 0.6 * ee); T.tag.material.opacity = T.t < 1.8 ? 1 : Math.max(0, 1 - (T.t - 1.8) * 2.5);
        if (T.t > 2.3) { G.root.remove(T.tag); G.tags.splice(i, 1); } }
      if (G.allT >= 0) { G.allT += dt; U.uAll.value = Math.min(1, G.allT / 2.4); U.uPale.value *= Math.max(0, 1 - dt * 1.2); U.uBlur.value *= Math.max(0, 1 - dt * 1.2); }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && G.mirrorDone && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('the-mirror:pieces', t, 'lower');
        K.finale(G, { won: true, title: 'Still you', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Pieces', v: `${N}/${N}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        G.music.volume(0.6); } }
      if (!G.playing || G.mirrorDone) return;
      // searching: hold the light on a glint; the shimmer of glass leads you there, louder as your hearing sharpens
      const s = nextTarget(); if (!s) return;
      const d = dist(s, G.beam), pan = Math.max(-1, Math.min(1, (s.u - G.beam.u) * 2.5)), findR = Math.max(0.05, Math.min(FIND_R, U.uR.value * 0.8));
      if (d < findR) {
        G.dwell += dt;
        if (Math.floor((G.dwell - dt) / 0.1) !== Math.floor(G.dwell / 0.1)) K.tone(700 + G.dwell * 1400, 0.09, { type: 'triangle', vol: 0.05, pan });
        if (G.dwell >= DWELL) { G.dwell = 0; if (s === MIRROR) mirror(); else find(s); }
      } else {
        G.dwell = Math.max(0, G.dwell - dt * 2);
        G.twinkleT -= dt;
        const near = 1 - Math.min(1, d / 0.7);
        if (G.twinkleT <= 0 && d < 0.7) { G.twinkleT = 0.13 + (1 - near) * 0.8 / G.hear; const f = 2400 + near * 1200;
          K.tone(f, 0.12, { vol: (0.02 + near * 0.035) * G.hear, pan }); K.tone(f * 1.5, 0.08, { vol: (0.008 + near * 0.012) * G.hear, pan, delay: 0.03 }); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'up') { G.touch = null; G.touchT = 0.8; return; }
      if (kind === 'down' || (kind === 'move' && G.touch)) { const p = G.S.toBoard(ev, G.root); if (p) G.touch = { u: p.u, v: p.v }; }
    },
    pause() { if (G) { G.paused = true; G.music && G.music.volume(0); } },
    resume() { if (G) { G.paused = false; G.music && G.music.volume(G.mirrorDone ? 0.6 : 0.9); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'pieces-of-me', playing: G.playing, over: G.over, found: G.found, mirror: G.mirrorDone, R: +G.uni.uR.value.toFixed(3), beam: [+G.beam.u.toFixed(2), +G.beam.v.toFixed(2)], t: +G.t.toFixed(1) }; },
    stop() { if (G && G.music) G.music.stop(); K.cleanup(G); G = null; },
  };
}
