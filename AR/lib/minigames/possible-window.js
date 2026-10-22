// ALL THE POSSIBILITIES (Raquel Alim): SHOW HER.
// "If I were able to sit down with my 12-year-old self, I would show her the art of other visually impaired people…
//  so that little girl could decide where she wants to go in life and how many options she has."
// One simple thing to do: tap. Raquel sits beside her younger self in front of a great round window. Each tap opens the
// window onto another Blind Canvas painting by a visually impaired artist (music, dance, painting, sport, riding,
// fashion, the world, her own power), each with its own note. The girl lifts her head to look. After the last one,
// "and anything she dreams", she turns to Raquel. So many options.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/possible/';
// what the window shows: a painting from the gallery, and what it says she could do
const SHOW = [
  { id: 'reaching-past-blindness', title: 'Reaching Past Blindness', word: 'Make music', say: 'She could make music.', by: 'Rusty Perez' },
  { id: 'all-lifes-beauty', title: 'All Life’s Beauty', word: 'Dance', say: 'She could dance.', by: 'Dave Steele' },
  { id: 'flow-state', title: 'Flow State', word: 'Paint', say: 'She could paint.', by: 'Raquel Alim' },
  { id: 'goalball-is', title: 'Goalball Is…', word: 'Play sports', say: 'She could play sports.', by: 'Ricky Ruzicka' },
  { id: 'pedals-of-freedom', title: 'Pedals of Freedom', word: 'Ride a bike', say: 'She could ride a bike.', by: 'Bill McCann' },
  { id: 'haute-couture-dreams', title: 'Haute Couture Dreams', word: 'Design fashion', say: 'She could design fashion.', by: 'Shardasia Hadley' },
  { id: 'seeing-the-world-together', title: 'Seeing the World Together', word: 'See the world', say: 'She could see the world.', by: 'Ricky Ruzicka' },
  { id: 'the-power-within', title: 'The Power Within', word: 'Find her power', say: 'She could find her power.', by: 'Academy of Music for the Blind' },
  { id: 'a-bright-future', title: 'A Bright Future', word: 'Anything she dreams', say: 'And anything she dreams.', by: 'Academy of Music for the Blind' },
];
const WAIT = 2.6;   // seconds before the next tap opens the window again

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting, with the round window opening onto another painting (swirling as it changes), the moons glowing,
// the white river of light flowing, and two heads that move: the girl lifts hers to look, Raquel leans toward her
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, win, picA, picB;
uniform float uT, uA, uMix, uOpen, uPulse, uLift, uLean, uTurn, uHasA, uHasB;
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec2 rot(vec2 p, vec2 c, float a){ vec2 d = p - c; float s = sin(a), k = cos(a); return c + vec2(k * d.x - s * d.y, s * d.x + k * d.y); }
// bend a head around its neck: full turn at the head, fading to nothing at the edge (no seams)
vec2 bend(vec2 p, vec2 neck, vec2 head, float r, float a, vec2 shift){
  float w = 1.0 - smoothstep(r * 0.55, r, length(p - head));
  return rot(p, neck, a * w) + shift * w;
}
vec3 inWin(sampler2D t, vec2 p){
  // the painting fills the window circle (centre .62,.30, radius .29), turned slowly
  vec2 q = (p - vec2(0.62, 0.30)) / 0.29 * 0.5 + 0.5;
  return texture2D(t, vec2(clamp(q.x, 0.0, 1.0), 1.0 - clamp(q.y, 0.0, 1.0))).rgb;
}
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  // the girl lifts her head to look (and turns to Raquel at the end); Raquel leans toward her
  s = bend(s, vec2(0.30, 0.56), vec2(0.30, 0.49), 0.095, -uTurn * 0.09 + uLift * 0.03, vec2(0.0, uLift * 0.012));
  s = bend(s, vec2(0.63, 0.45), vec2(0.635, 0.35), 0.13, uLean * 0.05, vec2(0.0));
  // the white river of light flows
  float river = smoothstep(0.22, 0.25, p.y) * (1.0 - smoothstep(0.30, 0.33, p.y)) * (1.0 - smoothstep(0.5, 0.62, p.x));
  s.y += sin(p.x * 30.0 - uT * 1.6) * 0.003 * river;
  vec3 c = at(s);
  // the moons breathe
  float m1 = length(p - vec2(0.448, 0.187)), m2 = length(p - vec2(0.697, 0.181));
  float glow = 0.85 + 0.15 * sin(uT * 1.3);
  c += vec3(1.0, 0.95, 0.85) * (exp(-max(m1 - 0.055, 0.0) * 40.0) * 0.12 + exp(-max(m2 - 0.06, 0.0) * 40.0) * 0.12) * glow;
  // the window
  float W = texture2D(win, vec2(p.x, 1.0 - p.y)).r;
  if (W > 0.001 && uOpen > 0.001) {
    vec2 cc = vec2(0.62, 0.30); float r = length(p - cc) / 0.29;
    float sw = uMix * (1.0 - uMix) * 4.0;                 // swirl while the picture changes
    vec2 q = rot(p, cc, sw * 2.2 * (1.0 - r) + 0.02 * sin(uT * 0.4));
    vec3 a = inWin(picA, q), b = inWin(picB, q);
    vec3 pic = mix(a * uHasA + c * (1.0 - uHasA), b * uHasB + c * (1.0 - uHasB), smoothstep(0.0, 1.0, uMix));
    // keep a little of the brushwork, so it looks painted into the window
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    pic = mix(pic, pic * (0.75 + 0.5 * lum), 0.35);
    c = mix(c, pic, W * uOpen * 0.92);
  }
  // the rim of the window shines when it opens
  float rim = abs(length(p - vec2(0.62, 0.30)) - 0.30);
  c += vec3(1.0, 0.78, 0.4) * exp(-rim * 70.0) * uPulse * 0.6 * (1.0 - smoothstep(0.45, 0.6, p.y));
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── a warm, slow music box ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function musicBox(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, out = bus, p = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  // F, Dm, Bb, C: soft pads with a slow plucked line on top
  const CH = [[53, 60, 65, 69], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]];
  let next = 0, step = 0, timer = null, warm = 0;
  function schedule() {
    while (next < ac.currentTime + 0.2) {
      const ch = CH[step % 4];
      ch.forEach(m => tone(next, midi(m), 4.2, { vol: 0.018 + 0.01 * warm, att: 1.0 }));
      [0, 1, 2, 3].forEach(i => tone(next + i * 0.9, midi(ch[(i + step) % 4] + 12), 1.2, { type: 'triangle', vol: 0.016, att: 0.01, p: (i - 1.5) * 0.3 }));
      next += 3.6; step++;
    }
  }
  // each possibility has its own note: together they climb a scale
  const NOTES = [65, 67, 69, 72, 74, 77, 79, 81, 84];
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 60); schedule(); bus.gain.setTargetAtTime(0.8, ac.currentTime, 1.2); },
    open(i) { const t = ac.currentTime + 0.01, m = NOTES[Math.min(i, NOTES.length - 1)]; warm = Math.min(1, i / 8);
      tone(t, midi(m), 2.2, { type: 'triangle', vol: 0.06, out: fx }); tone(t, midi(m + 12), 1.2, { vol: 0.02, out: fx });
      for (let k = 0; k < 5; k++) tone(t + 0.05 + k * 0.06, midi(m + 12 + [0, 4, 7, 12, 16][k]), 0.35, { vol: 0.012, out: fx, p: k * 0.3 - 0.6 }); },
    end() { const t = ac.currentTime + 0.1; [65, 69, 72, 77, 81, 84, 89].forEach((m, i) => tone(t + i * 0.18, midi(m), 4, { type: 'triangle', vol: 0.045, att: 0.05, out: fx })); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.3); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.3); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

export function showHerGame() {
  let G = null;

  function load(i, cb) {
    if (G.tex[i]) return cb(G.tex[i]);
    new THREE.TextureLoader().load(ART + SHOW[i].id + '.jpg', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.tex[i] = t; cb(t); }, undefined, () => cb(null));
  }
  // the panel says what the window shows (one box, so the window above the figures stays clear)
  function panel(s) {
    G.ui.panel(s ? `Show her · ${G.n} of ${SHOW.length}` : 'Show her', s ? `${s.word} <small>${s.title}, by ${s.by}</small>` : `${G.n} <small>of ${SHOW.length} possibilities</small>`, { segs: [G.n, SHOW.length] });
  }
  // open the window onto the next possibility
  function next() {
    if (G.phase !== 'play' || G.wait > 0 || G.n >= SHOW.length) return;
    const i = G.n; G.n++; G.wait = WAIT; G.busy = true;
    load(i, t => {
      if (!G) return;
      const u = G.uni;
      // what was showing slides back to A; the new picture comes in as B
      u.picA.value = u.picB.value; u.uHasA.value = u.uHasB.value;
      u.picB.value = t; u.uHasB.value = t ? 1 : 0; u.uMix.value = 0; G.mixing = true; G.busy = false;
      G.pulse = 1; G.lift = 1; G.band.open(i); G.buzz && G.buzz(20);
      const s = SHOW[i];
      G.say(s.say);
      // sparkles drift from the window to the girl
      for (let k = 0; k < 6; k++) G.sparks.push({ t: -k * 0.08, a: [0.52 + Math.random() * 0.2, 0.2 + Math.random() * 0.15] });
      panel(s);
      if (G.n >= SHOW.length) setTimeout(() => G && finish(), 3200);
    });
  }
  function finish() {
    G.phase = 'end'; G.ui.buttons([]); G.band.end(); G.turnTo = 1;
    setTimeout(() => { if (!G) return;
      K.finale(G, { won: true, kicker: 'Show her', title: 'So many options', line: G.work && G.work.quote, cells: [{ k: 'Possibilities', v: String(SHOW.length) }],
        say: 'So many options. ' + ((G.work && G.work.quote) || '') }); }, 4500);
  }

  return {
    title: 'Show her',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', n: 0, wait: 0, busy: false, mixing: false, pulse: 0, lift: 0, liftK: 0, turnTo: 0, turn: 0, lean: 0, open: 0, tex: [], sparks: [], botT: 1 });
      G.band = musicBox(K.audio());
      const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blank.needsUpdate = true;
      G.uni = { map: { value: null }, win: { value: blank }, picA: { value: blank }, picB: { value: blank }, uT: { value: 0 }, uA: { value: 0 }, uMix: { value: 1 }, uOpen: { value: 0 },
        uPulse: { value: 0 }, uLift: { value: 0 }, uLean: { value: 0 }, uTurn: { value: 0 }, uHasA: { value: 0 }, uHasB: { value: 0 } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      new THREE.TextureLoader().load(ART + 'window.png', t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.win.value = t; });
      load(0, () => {});   // the first picture, ready for the first tap
      // sparkles
      G.sparkS = []; for (let k = 0; k < 8; k++) { const sp = K.sprite(K.glowTex, 0.035, { color: '#ffe2a8', additive: true, order: 20, opacity: 0 }); G.root.add(sp); G.sparkS.push(sp); }
      G.onGo = () => {
        G.phase = 'play'; G.band.start(); panel();
        G.ui.buttons([{ label: 'Show her', icon: '✦', kind: 'black', aria: 'Show her the next possibility', press: () => next() }]);
        for (let i = 1; i < SHOW.length; i++) load(i, () => {});
      };
      K.intro(G, { title: 'Show her', how: 'Raquel sits with her 12-year-old self. Tap anywhere, and the big round window shows the girl another painting by a visually impaired artist: something she could do one day.',
        say: 'Show her. Raquel sits beside her 12-year-old self, in front of a big round window. Tap anywhere, and the window shows the girl another painting by a visually impaired artist. Something she could do one day. Show her all the possibilities.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      if (G.wait > 0) G.wait -= dt;
      if (G.phase === 'play' && G.bot) { G.botT -= dt; if (G.botT <= 0) { G.botT = WAIT + 0.2; next(); } }
      // the window opens with the first tap and stays open
      if (G.n > 0) G.open = Math.min(1, G.open + dt * 1.2);
      u.uOpen.value = G.open;
      if (G.mixing) { u.uMix.value = Math.min(1, u.uMix.value + dt / 1.4); if (u.uMix.value >= 1) G.mixing = false; }
      G.pulse *= Math.pow(0.25, dt); u.uPulse.value = G.pulse + 0.15 * G.open * (0.5 + 0.5 * Math.sin(G.t * 1.5));
      // the girl lifts her head, then slowly settles (still a little lifted, watching)
      G.lift *= Math.pow(0.4, dt); G.liftK += ((G.n ? 0.35 : 0) + G.lift * 0.65 - G.liftK) * Math.min(1, dt * 4);
      u.uLift.value = G.liftK * (1 - G.turn);
      G.turn += (G.turnTo - G.turn) * Math.min(1, dt * 1.5); u.uTurn.value = G.turn;
      G.lean += (G.turnTo * 1 + (G.n ? 0.25 : 0) - G.lean) * Math.min(1, dt * 1.2); u.uLean.value = G.lean;
      // sparkles: from the window down to the girl
      let k = 0;
      G.sparks = G.sparks.filter(s => (s.t += dt) < 1.3);
      for (const s of G.sparks) { if (k >= G.sparkS.length) break; const f = Math.max(0, s.t) / 1.3, e = f * f * (3 - 2 * f);
        const [x, y] = G.S.P(s.a[0] + (0.31 - s.a[0]) * e, s.a[1] + (0.46 - s.a[1]) * e - Math.sin(f * Math.PI) * 0.05);
        const sp = G.sparkS[k++]; sp.position.set(x, y, 0.06); sp.material.opacity = s.t < 0 ? 0 : Math.sin(f * Math.PI) * 0.9; }
      for (; k < G.sparkS.length; k++) G.sparkS[k].material.opacity = 0;
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      if (kind === 'down') next();
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'possible', playing: G.playing, over: G.over, phase: G.phase, n: G.n, mix: +G.uni.uMix.value.toFixed(2), t: +G.t.toFixed(1) }; },
    stop() { if (G) G.band.stop(); K.cleanup(G); G = null; },
  };
}
