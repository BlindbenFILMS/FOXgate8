// ART RAISED ME UP (Deborah Tramentozzi): RAISE THEM UP.
// A grand museum hall in the dark. One beam of light comes down from the hole in the ceiling, and YOU move it:
// drag a finger (or point your phone) and the beam swings across the hall, lighting what it touches, with dust
// drifting up through it. Eight paintings hang on the dark walls (big drawn pictures in gold frames: raised-things.js).
// They are Deborah's own frames, cut out of her painting; as each one rises into the light it turns into a big, clear
// picture, as if the light reveals it. Each one hums its own sound (waves, a robin, a violin, bees, twinkling stars, a singing bowl, a music box, a horn
// at sunrise) from its side of the hall, louder as the light gets close. Hold the light on a painting and it lifts off
// the wall, glows gold and floats up into the light, and the narrator describes it. Every painting raised brings more
// light into the hall and more notes into the music. The newest painting raised floats big in the middle of the
// hall, in the beam (the painting's own floating frames are painted out: media/games/raised/hall.jpg). Raise all eight and the hall fills with light, the floor shines,
// and Deborah tells you, in her own voice, how art raised her up.
import * as THREE from 'three';
import * as K from './kit.js';
import { PAINTINGS, painting } from './raised-things.js';

// Deborah's own words for this painting (the 3D gallery's clip): "I could say that art saved my life…"
const ART = new URL('../../media/games/raised/', import.meta.url).href;   // from this file, so it works on any page (AR, 3D gallery)
const DEBORAH = new URL('../../../3D/gallery/audio/wing_1_0.mp3', import.meta.url).href;

// Deborah's own frames on the dark walls, in the painting's pixels (x0, y0, x1, y1 of 800 × 800): left wall, then right wall.
// Each is cut out of the painting and lifts off the wall. Where they float once raised:
const RECTS = [[55, 232, 112, 397], [62, 400, 122, 530], [162, 317, 192, 430], [155, 427, 200, 527], [227, 360, 252, 540],
  [667, 207, 727, 370], [662, 362, 722, 530], [605, 340, 637, 535]];
// the newest painting raised is featured big in the middle of the hall, in the beam; the others float in a ring round it
const FEATURE = [0.53, 0.44];
const FLOAT = [[0.4, 0.2], [0.66, 0.2], [0.355, 0.34], [0.705, 0.34], [0.355, 0.5], [0.705, 0.5], [0.42, 0.68], [0.64, 0.68]];
const TILT = [-0.12, 0.1, 0.16, -0.14, -0.08, 0.12, 0.2, -0.18];
const HOLE = [0.53, 0.09];                    // the hole in the ceiling the beam comes from
const WALL_W = 0.1, FLOAT_W = 0.1, FEATURE_W = 0.22, HIT_R = 0.045, HOLD = 1.0;
// what the narrator says (fixed sentences, so Ben can record each one once)
const SAY = {
  sea: ['You raised the sea.', 'Waves roll in under a golden sky.'],
  bird: ['You raised the songbird.', 'A robin sings on a branch.'],
  violin: ['You raised the violin.', 'A violin waits for its bow.'],
  sunflowers: ['You raised the sunflowers.', 'Three sunflowers stand in a blue vase.'],
  stars: ['You raised the night sky.', 'The moon and stars swirl over a sleeping village.'],
  hands: ['You raised the hands.', 'Two marble hands hold a little light.'],
  dancer: ['You raised the dancer.', 'A dancer spins on her toes.'],
  sunrise: ['You raised the sunrise.', 'The sun rises between snowy mountains.'],
};
const MORE = ['', '1 more.', '2 more.', '3 more.', '4 more.', '5 more.', '6 more.', '7 more.'];

// The end card: roomy margins round all its text, and it never runs off the bottom of the screen (it scrolls instead).
// (Added while this game runs, removed when it stops: kit.js isn't changed.)
const END_CSS = `.mgk-end{max-height:calc(100% - 150px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow-y:auto;-webkit-overflow-scrolling:touch}
.mgk-end .top{padding:16px 22px 18px!important}
.mgk-end .cells div{padding:12px 22px 14px!important}
.mgk-end .line{padding:16px 22px 18px!important;line-height:1.5!important;font-size:16px!important}
.mgk-end .best{padding:10px 22px!important}
.mgk-end button{padding:0 22px!important}`;
function endCardStyle(on) {
  let el = document.getElementById('bc-endcard-margins');
  if (on && !el) { el = document.createElement('style'); el.id = 'bc-endcard-margins'; el.textContent = END_CSS; document.head.appendChild(el); }
  if (!on && el) el.remove();
}

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the hall: dark, except where your beam reaches; brighter with every painting raised; the floor mirrors the light
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uH, uLit, uFin, uOn, uPress;
uniform vec2 uAim;
const vec2 HOLE = vec2(0.53, 0.09);
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = texture2D(map, vUv).rgb;
  // the beam: a soft shaft from the ceiling down to where you aim, widening as it falls
  vec2 pa = p - HOLE, ba = uAim - HOLE;
  float k = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  float d = length((pa - ba * k) * vec2(1.0, uH));
  float wid = 0.018 + 0.06 * k + 0.05 * uFin;
  float shaft = (1.0 - smoothstep(wid * 0.35, wid, d)) * uOn;
  float rays = 0.75 + 0.25 * sin(d * 260.0 - uT * 1.5) * sin(p.y * 30.0 + uT);
  // the pool of light where it lands
  float pool = (1.0 - smoothstep(0.03, 0.13 + 0.03 * uPress, length((p - uAim) * vec2(1.0, uH)))) * uOn;
  float expo = mix(0.26, 1.0, uLit);
  vec3 lit = col * (expo + 0.95 * pool + 0.35 * shaft);
  lit += vec3(1.0, 0.86, 0.58) * shaft * 0.2 * rays;
  // the polished floor mirrors the beam: a golden shimmer under it
  float fl = smoothstep(0.76, 0.83, p.y);
  float refl = fl * exp(-abs(p.x - uAim.x) * (16.0 - 10.0 * uFin)) * (0.55 + 0.45 * sin(p.y * 140.0 - uT * 2.0 + sin(p.x * 50.0 + uT)));
  lit += vec3(1.0, 0.8, 0.45) * refl * (0.12 + 0.3 * uFin) * max(uOn, uFin);
  // at the end the whole hall warms and the floor shines
  lit += col * fl * uFin * 0.35;
  lit = mix(lit, lit * vec3(1.06, 1.0, 0.9), uFin * 0.5);
  lit = mix(lit, lit * vec3(0.9, 0.97, 1.08), 0.3 * (1.0 - uLit));   // the dark is cool
  gl_FragColor = vec4(lit, uA);
}`;

/* ───────────────────────── the hall's sound: a reverb, a slow hymn, and each painting's voice ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function hall(ac) {
  const master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);       // the music
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(master);          // the sounds
  // a big stone hall: a long, soft reverb
  const verb = ac.createConvolver(), wet = ac.createGain(); wet.gain.value = 0.55;
  { const len = ac.sampleRate * 3.2, b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    verb.buffer = b; }
  verb.connect(wet).connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { const out = dest || fx; if (!ac.createStereoPanner) return out; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(out); return n; };
  // every sound goes out on its side, and into the hall's reverb
  function route(node, p, dest) { node.connect(pan(p, dest)); node.connect(verb); }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, p = 0, slide = 0, dest, filter = 0, vib = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    if (vib) { const l = ac.createOscillator(), lg = ac.createGain(); l.frequency.value = 5.5; lg.gain.value = f * vib; l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o.connect(g); if (filter) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = filter; n = n.connect(f2); }
    route(n, p, dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.01, dest, trem = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = s.connect(f).connect(g);
    if (trem) { const tg = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain(); tg.gain.value = 0.5; l.frequency.value = trem; lg.gain.value = 0.5; l.connect(lg).connect(tg.gain); n = n.connect(tg); l.start(t); l.stop(t + dur + 0.05); }
    route(n, p, dest); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  // the hymn: slow warm chords, and harp notes that grow with every painting raised
  const CH = [[48, 55, 59, 64, 67], [45, 52, 57, 60, 64], [41, 48, 53, 57, 64], [43, 50, 55, 59, 62]];   // Cmaj7 · Am · Fmaj7 · G
  const HARP = [72, 74, 76, 79, 81, 84, 86, 88];
  let next = 0, step = 0, timer = null, raised = 0, hum = null;
  function schedule() {
    const beat = 60 / 58;
    while (next < ac.currentTime + 0.25) {
      const t = next, b = step % 8, bar = Math.floor(step / 8) % 4;
      if (b === 0) CH[bar].forEach((m, i) => tone(t + i * 0.06, midi(m), beat * 8.5, { type: 'triangle', vol: 0.022, att: 1.2, dest: bus, filter: 1400 }));
      if (b % 2 === 1 && Math.random() < 0.12 + raised * 0.09) tone(t, midi(HARP[(Math.random() * Math.min(HARP.length, 3 + raised)) | 0]), 2.4, { type: 'triangle', vol: 0.035, att: 0.004, dest: bus, p: Math.random() * 1.2 - 0.6 });
      if (raised >= 5 && b === 4) tone(t, midi(CH[bar][4] + 12), 3.5, { vol: 0.02, att: 0.8, dest: bus });
      next += beat / 2; step++;
    }
  }
  return {
    start() {
      if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 50); schedule(); bus.gain.setTargetAtTime(1, ac.currentTime, 1.2);
      // the hush of a big empty hall
      const s = ac.createBufferSource(), f = ac.createBiquadFilter(); hum = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'lowpass'; f.frequency.value = 260; hum.gain.value = 0;
      s.connect(f).connect(hum).connect(fx); s.start(); hum.gain.setTargetAtTime(0.05, ac.currentTime, 2); hum._s = s;
    },
    raised(n) { raised = n; },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    // the music fades right out (over about 2 seconds) so Deborah can be heard
    fadeOut() { bus.gain.cancelScheduledValues(ac.currentTime); bus.gain.setTargetAtTime(0, ac.currentTime, 0.6); if (hum) hum.gain.setTargetAtTime(0, ac.currentTime, 0.6); },
    // each painting's own voice, from its side (p) and louder when near (v)
    call(id, p, v) {
      const t = ac.currentTime + 0.02;
      if (id === 'sea') { noise(t, 2.2, { freq: 300, type: 'lowpass', q: 0.5, vol: 0.26 * v, p, sweep: 1500, att: 0.9 }); noise(t + 1.0, 1.4, { freq: 3000, q: 0.6, vol: 0.05 * v, p, sweep: 900, att: 0.1 }); }
      if (id === 'bird') [0, 0.16, 0.32, 0.7, 0.82].forEach((d, i) => tone(t + d, i < 3 ? 2600 : 3100, 0.09, { vol: 0.07 * v, p, slide: i < 3 ? 3500 : 2300, att: 0.005 }));
      if (id === 'violin') [[69, 0, 0.7], [76, 0.7, 1.3]].forEach(([m, d, l]) => tone(t + d, midi(m), l, { type: 'sawtooth', vol: 0.06 * v, p, att: 0.15, filter: 1800, vib: 0.008 }));
      if (id === 'sunflowers') { noise(t, 1.2, { freq: 420, q: 6, vol: 0.12 * v, p, att: 0.2, trem: 22 }); noise(t + 0.4, 0.9, { freq: 560, q: 7, vol: 0.08 * v, p: p + 0.1, att: 0.2, trem: 27 }); }
      if (id === 'stars') [93, 98, 100, 105, 98].forEach((m, i) => tone(t + i * 0.17, midi(m), 0.9, { vol: 0.04 * v, p: p + (i % 2 ? 0.1 : -0.1), att: 0.004 }));
      if (id === 'hands') [[67, 0.07], [79.1, 0.035], [86, 0.018]].forEach(([m, vol]) => tone(t, midi(m), 2.6, { vol: vol * v, p, att: 0.01 }));
      if (id === 'dancer') [84, 88, 91, 88, 84].forEach((m, i) => tone(t + [0, 0.36, 0.54, 0.72, 1.08][i], midi(m), 0.6, { type: 'triangle', vol: 0.06 * v, p, att: 0.003 }));
      if (id === 'sunrise') { tone(t, midi(55), 1.6, { type: 'triangle', vol: 0.07 * v, p, att: 0.35, slide: midi(60) }); tone(t + 0.1, midi(64), 1.5, { type: 'triangle', vol: 0.05 * v, p, att: 0.4, slide: midi(67) }); }
    },
    // a soft shimmer that quickens as your light gets close
    near(f, v, p) { tone(ac.currentTime + 0.01, f, 0.14, { vol: 0.025 * v, p }); },
    // as you hold the light on a painting: a note that climbs
    hold(i, p) { tone(ac.currentTime + 0.01, midi(64 + [0, 2, 4, 7, 9, 12, 14][Math.min(6, i)]), 0.3, { type: 'triangle', vol: 0.05, p, att: 0.01 }); },
    // the light lands (a finger touches down)
    land() { noise(ac.currentTime + 0.01, 0.45, { freq: 1800, q: 0.7, vol: 0.05, sweep: 5000, att: 0.04 }); tone(ac.currentTime + 0.01, midi(76), 0.5, { vol: 0.03, att: 0.01 }); },
    // a painting rises: a swell of light going up
    rise(p) {
      const t = ac.currentTime + 0.02;
      noise(t, 1.8, { freq: 400, q: 0.8, vol: 0.12, p, sweep: 6000, att: 0.6 });
      [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => tone(t + 0.15 + i * 0.09, midi(m), 1.8, { type: 'triangle', vol: 0.045, p: p * (1 - i / 7), att: 0.005 }));
    },
    // everything rises: the hall is full of light
    finale() {
      const t = ac.currentTime + 0.05;
      noise(t, 4, { freq: 200, q: 0.6, vol: 0.12, sweep: 7000, att: 2 });
      [48, 55, 60, 64, 67, 72, 76, 79, 84, 88, 91, 96].forEach((m, i) => tone(t + i * 0.16, midi(m), 5, { type: 'triangle', vol: 0.04, att: 0.02, p: Math.sin(i) * 0.5 }));
    },
    stop() {
      clearInterval(timer); timer = null;
      try { master.gain.setTargetAtTime(0, ac.currentTime, 0.1); if (hum && hum._s) hum._s.stop(ac.currentTime + 0.5); } catch (e) {}
    },
  };
}

export function raiseThemUpGame() {
  let G = null;
  const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * G.h);
  // how far the light is from a painting: from the nearest edge of its frame, so tall, thin frames are as easy to catch as wide ones
  const pdist = (a, pt) => { const [u0, v0, u1, v1] = pt.box; return Math.hypot(Math.max(u0 - a[0], 0, a[0] - u1), Math.max(v0 - a[1], 0, a[1] - v1) * G.h); };

  // where the light points: a finger on the screen, or (with no finger) the middle of the screen
  function aim() {
    if (G.touch) return G.touch;
    const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root);
    return p ? [Math.max(0.02, Math.min(0.98, p.u)), Math.max(0.14, Math.min(0.95, p.v))] : [0.5, 0.6];
  }
  const sideOf = (u) => Math.max(-1, Math.min(1, (u - G.light[0]) * 2.4));

  function raise(pt) {
    // the painting featured until now moves out to its place in the ring
    const old = G.featured;
    if (old) { Object.assign(old, { state: 'moving', mt: 0, from: old.pos.slice(), to: FLOAT[old.slot], fromW: FEATURE_W, toW: FLOAT_W, fromTilt: old.tilt, tilt: TILT[old.slot], featured: false }); }
    // and this one rises into the middle of the light
    Object.assign(pt, { state: 'rising', t: 0, from: pt.at.slice(), to: FEATURE, toW: FEATURE_W, tilt: 0, slot: G.raised, featured: true });
    G.featured = pt;
    G.raised++; G.band.raised(G.raised); G.band.rise(sideOf(pt.at[0])); G.buzz([30, 40, 90]);
    const [x, y] = G.S.P(...pt.at); G.fx.add(x, y, '#ffd98a', 22, 0.18);
    G.say(SAY[pt.id].join(' ') + (G.raised < PAINTINGS.length ? ' ' + MORE[PAINTINGS.length - G.raised] : ''));
    G.ui.panel('Raise them up', `${G.raised} <small>of ${PAINTINGS.length} raised</small>`, { segs: [G.raised, PAINTINGS.length] });
    G.ui.pop('Raised!');
    if (G.raised === PAINTINGS.length) setTimeout(() => G && finale(), 4200);
  }
  function finale() {
    G.phase = 'finale'; G.finT = 0; G.band.finale(); G.ui.buttons([]);
    G.say('Every painting is raised up. The whole hall is full of light.');
    setTimeout(() => {
      if (!G) return;
      K.finale(G, { won: true, kicker: 'Raise them up', title: 'The hall is full of light', line: G.work && G.work.quote,
        cells: [{ k: 'Raised', v: `${G.raised}/${PAINTINGS.length}` }, { k: 'Time', v: fmt(G.playT) }],
        say: 'The hall is full of light. Here is Deborah, in her own words.' });
      // then Deborah herself
      // the music fades away as the card appears, and once the narrator has finished, Deborah speaks in her own voice
      G.musicOff = true; G.band.fadeOut();
      try { G.deb = new Audio((G.work && G.work.artistAudio) || DEBORAH); G.deb.preload = 'auto'; } catch (e) {}
      setTimeout(() => { if (!G || G.bot || !G.deb) return; G.debStarted = true; G.deb.play().catch(() => {}); }, 5600);
    }, 6500);
  }
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  // Listen: the nearest painting calls out loudly, and the narrator says which way
  function listen() {
    const a = G.light; let best = null, bd = 9;
    for (const pt of G.pieces) if (pt.state === 'wall') { const d = pdist(a, pt); if (d < bd) { bd = d; best = pt; } }
    if (!best) return;
    G.band.call(best.id, sideOf(best.at[0]), 1); best.glint = 1.4;
    const dx = best.at[0] - a[0], dy = best.at[1] - a[1];
    if (bd < HIT_R) { G.say('It’s right here. Hold the light still.'); return; }
    const h = Math.abs(dx) > 0.06 ? (dx > 0 ? 'right' : 'left') : '', v = Math.abs(dy) > 0.06 ? (dy > 0 ? 'down' : 'up') : '';
    G.say(h && v ? `A painting is ${v} and to the ${h}.` : h ? `A painting is to the ${h}.` : `A painting is ${v || 'here'}.`);
  }

  return {
    title: 'Raise them up',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      endCardStyle(true);
      Object.assign(G, { phase: 'intro', raised: 0, pieces: [], motes: [], touch: null, light: [0.53, 0.7], lit: 0, press: 0, callT: 2.5, nearT: 0, finT: 0, playT: 0 });
      G.band = hall(K.audio());
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uLit: { value: 0 }, uFin: { value: 0 }, uOn: { value: 0 }, uPress: { value: 0 },
        uAim: { value: new THREE.Vector2(0.53, 0.7) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      // the hall with the painting's own floating frames painted out (only Deborah's wall frames can be raised), falling back to the painting
      const hallLoaded = t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; };
      new THREE.TextureLoader().load(ART + 'hall.jpg', hallLoaded, undefined, () => { if (src) new THREE.TextureLoader().load(src, hallLoaded); });
      // Deborah's eight frames: each cut out of her painting (and an empty dark wall behind it, for when it lifts off);
      // each hides one of the clear pictures, which appears as it rises (shuffled every game)
      const spots = RECTS.map((r, i) => i).sort(() => Math.random() - 0.5);
      // (each frame gets its own copy of the painting, cropped to it, once the picture has loaded)
      const real = src ? new THREE.TextureLoader().load(src, t => {
        if (!G) return; t.colorSpace = THREE.SRGBColorSpace;
        for (const pt of G.pieces) if (pt.frame) { const c = t.clone(); c.offset.copy(pt.crop[0]); c.repeat.copy(pt.crop[1]); c.needsUpdate = true; pt.frame.material.map = c; pt.frame.material.needsUpdate = true; pt.frame.visible = pt.state === 'wall' || pt.state === 'rising'; }
      }) : null;
      PAINTINGS.forEach((p, i) => {
        const [x0, y0, x1, y1] = RECTS[spots[i]], W = ctx.work.width || 800, H = ctx.work.height || 800;
        const at = [(x0 + x1) / 2 / W, (y0 + y1) / 2 / H], cw = (x1 - x0) / W, ch = (y1 - y0) / H * G.h;
        const [x, y] = G.S.P(...at);
        const wall = new THREE.Mesh(new THREE.PlaneGeometry(cw * 1.08, ch * 1.04), new THREE.MeshBasicMaterial({ color: 0x0a0c0b, transparent: true, opacity: 0, depthWrite: false }));
        wall.position.set(x, y, 0.04); wall.renderOrder = 18; G.root.add(wall);
        let frame = null;
        if (real) {
          frame = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }));
          frame.position.set(x, y, 0.046); frame.renderOrder = 19; frame.visible = false; G.root.add(frame);
        }
        const view = painting(p.id, WALL_W); view.fade(0); view.group.position.set(x, y, 0.05); G.root.add(view.group);
        G.pieces.push({ id: p.id, at, view, frame, wall, box: [x0 / W, y0 / H, x1 / W, y1 / H], hsize: Math.max(cw, ch) * 1.7, crop: [new THREE.Vector2(x0 / W, 1 - y1 / H), new THREE.Vector2(cw, (y1 - y0) / H)], hold: 0, state: 'wall', glint: 0, ph: Math.random() * 6.28, t: 0 });
      });
      // dust drifting up through the beam
      for (let i = 0; i < 34; i++) {
        const s = K.sprite(K.dotTex, 0.006 + Math.random() * 0.008, { color: '#ffe7b0', additive: true, order: 25, opacity: 0 }); G.root.add(s);
        G.motes.push({ s, k: Math.random(), off: Math.random() * 2 - 1, sp: 0.05 + Math.random() * 0.08, ph: Math.random() * 6.28 });
      }
      // the light's ring, where it lands
      G.ring = K.sprite(K.ringTex, 0.13, { color: '#ffe7b0', order: 28, opacity: 0 }); G.root.add(G.ring);
      G.onGo = () => {
        G.phase = 'play'; G.band.start();
        G.ui.panel('Raise them up', `0 <small>of ${PAINTINGS.length} raised</small>`, { segs: [0, PAINTINGS.length] });
        G.ui.buttons([{ label: 'Listen', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 15c0-6 2-11 7-11 4 0 6 3 6 6 0 4-4 4-4 8a3 3 0 0 1-6 0"/><path d="M10 10a3 3 0 0 1 5 0"/></svg>',
          kind: 'black', aria: 'Listen: the nearest painting calls out, and you hear which way it is', press: () => listen() }]);
      };
      K.intro(G, { title: 'Raise them up',
        how: 'Move the beam of light with your finger, or point your phone. Hold it on a painting to raise it up. Listen: each one makes a sound from its side.',
        say: 'Raise them up. Eight paintings hang in the dark hall. Each one makes its own sound, from its side, louder as your light gets close. Drag your finger, or point your phone, to move the beam of light. Hold the light on a painting, and it rises up into the light.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += (1 - u.uA.value) * Math.min(1, dt * 2);   // (stays on at the end, so the hall stays clear)
      G.lit += (G.raised / PAINTINGS.length - G.lit) * Math.min(1, dt * 0.8); u.uLit.value = G.lit;
      u.uFin.value += ((G.phase === 'finale' ? 1 : 0) - u.uFin.value) * Math.min(1, dt * 0.45);
      u.uOn.value += ((G.phase === 'intro' ? 0.6 : 1) - u.uOn.value) * Math.min(1, dt * 2);
      G.press = Math.max(0, G.press - dt * 2); u.uPress.value = G.press;
      // the light follows your finger (or your phone), smoothly; at the end it settles in the middle of the hall
      const a = G.phase === 'play' ? (G.bot ? (G.botAim || [0.53, 0.7]) : aim()) : [0.53, 0.72];
      G.light[0] += (a[0] - G.light[0]) * Math.min(1, dt * 9); G.light[1] += (a[1] - G.light[1]) * Math.min(1, dt * 9);
      u.uAim.value.set(G.light[0], G.light[1]);
      const [rx, ry] = G.S.P(G.light[0], G.light[1]); G.ring.position.set(rx, ry, 0.06);
      G.ring.material.opacity = G.phase === 'play' ? 0.35 + 0.15 * Math.sin(G.t * 3) : Math.max(0, G.ring.material.opacity - dt);
      G.ring.scale.setScalar(0.13 + 0.015 * Math.sin(G.t * 3));
      if (G.phase === 'play') {
        G.playT += dt;
        let best = null, bd = 9;
        for (const pt of G.pieces) if (pt.state === 'wall') { const d = pdist(G.light, pt); if (d < bd) { bd = d; best = pt; } }
        // the nearest painting calls now and then, from its side, louder as you get close
        G.callT -= dt;
        if (best && G.callT <= 0) { G.callT = 2.6 + bd * 2.5; G.band.call(best.id, sideOf(best.at[0]), Math.max(0.3, 1 - bd * 1.6)); }
        if (best && bd < 0.22) { G.nearT -= dt; if (G.nearT <= 0) { G.nearT = 0.14 + bd * 2.2; G.band.near(1000 + (0.22 - bd) * 3200, 1 - bd * 3, sideOf(best.at[0])); } }
        for (const pt of G.pieces) {
          if (pt.state !== 'wall') continue;
          const d = pdist(G.light, pt), inside = d < HIT_R && pt === best;
          const before = pt.hold;
          pt.hold = inside ? pt.hold + dt : Math.max(0, pt.hold - dt * 2);
          if (inside && Math.floor(pt.hold / 0.16) > Math.floor(before / 0.16)) G.band.hold(Math.floor(pt.hold / 0.16), sideOf(pt.at[0]));
          if (pt.hold >= HOLD) raise(pt);
        }
      }
      // the paintings: dark on the wall until the light finds them; once raised they float and glow
      for (const pt of G.pieces) {
        const g = pt.view.group;
        pt.glint = Math.max(0, pt.glint - dt);
        if (pt.state === 'wall') {
          const d = pdist(G.light, pt), near = Math.max(0, 1 - d / 0.2), h = pt.hold / HOLD;
          // Deborah's frame: dark until the light finds it; it glows gold, trembles and starts to lift as you hold the light on it
          const [x, y] = G.S.P(...pt.at);
          if (pt.frame) {
            const k = 0.3 + near * 0.9 + h * 0.6 + G.lit * 0.3 + pt.glint * 0.6; pt.frame.material.color.setRGB(k, k * 0.95, k * 0.82);
            pt.frame.rotation.z = Math.sin(G.t * 0.9 + pt.ph) * 0.015 + Math.sin(G.t * 40) * 0.015 * h;
            pt.frame.position.set(x, y + h * 0.012, 0.046); pt.frame.scale.setScalar(1 + h * 0.15);
          }
          // a golden halo behind it, so it's easy to see where it is
          g.position.set(x, y, 0.044); pt.view.light(0); pt.view.glow(0); pt.view.fade(0);
          if (!pt.halo) { pt.halo = K.sprite(K.glowTex, pt.hsize, { color: '#ffcf70', additive: true, order: 17, opacity: 0 }); G.root.add(pt.halo); }
          // it always pulses softly (each in its own rhythm), and glows brighter as the light comes near
          const beat = 0.5 + 0.5 * Math.sin(G.t * 2.2 + pt.ph * 3), pulse = G.phase === 'play' ? 0.3 + 0.35 * beat : 0;
          pt.halo.position.set(x, y, 0.043); pt.halo.material.opacity = Math.min(0.95, pulse + near * 0.35 + h * 0.6 + pt.glint * 0.5);
          pt.halo.scale.setScalar(pt.hsize * (0.9 + 0.2 * beat + h * 0.3));
        } else {
          if (pt.state === 'rising') {
            pt.t += dt / 2.4; const k = Math.min(1, pt.t), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
            // up through the beam and out to its place in the air
            const cx = 0.53, cy = Math.min(pt.from[1], pt.to[1]) - 0.08;
            pt.pos = [(1 - e) * (1 - e) * pt.from[0] + 2 * (1 - e) * e * cx + e * e * pt.to[0], (1 - e) * (1 - e) * pt.from[1] + 2 * (1 - e) * e * cy + e * e * pt.to[1]];
            g.scale.setScalar(0.7 + (pt.toW / WALL_W - 0.7) * e); g.rotation.z = pt.tilt * e + Math.sin(k * Math.PI) * 0.25;
            // Deborah's frame rises off the wall, and in the light it turns into the picture it holds
            const show = Math.min(1, Math.max(0, (e - 0.3) / 0.35));
            pt.view.fade(show);
            if (pt.frame) {
              const [fx, fy] = G.S.P(pt.pos[0], pt.pos[1]); pt.frame.position.set(fx, fy, 0.048); pt.frame.rotation.z = g.rotation.z; pt.frame.scale.setScalar(1.15 + 0.4 * e);
              pt.frame.material.opacity = 1 - show; pt.frame.material.color.setRGB(1.3, 1.2, 1);
            }
            if (!pt.flashed && e > 0.45) { pt.flashed = true; const [fx, fy] = G.S.P(pt.pos[0], pt.pos[1]); G.fx.add(fx, fy, '#fff1c0', 26, 0.22); }
            pt.wall.material.opacity = Math.min(0.85, k * 2);
            if (pt.halo) pt.halo.material.opacity = Math.max(0, 0.6 - k);
            if (k >= 1) { pt.state = 'float'; if (pt.frame) pt.frame.visible = false; }
          } else if (pt.state === 'moving') {
            // out of the middle to its place in the ring, shrinking as it goes
            pt.mt += dt / 1.3; const k = Math.min(1, pt.mt), e = 1 - Math.pow(1 - k, 3);
            pt.pos = [pt.from[0] + (pt.to[0] - pt.from[0]) * e, pt.from[1] + (pt.to[1] - pt.from[1]) * e];
            g.scale.setScalar((pt.fromW + (pt.toW - pt.fromW) * e) / WALL_W); g.rotation.z = pt.fromTilt + (pt.tilt - pt.fromTilt) * e;
            pt.view.fade(1); pt.wall.material.opacity = 0.85; if (pt.frame) pt.frame.visible = false; if (pt.halo) pt.halo.material.opacity = 0;
            if (k >= 1) pt.state = 'float';
          } else {
            pt.pos = pt.to; g.scale.setScalar(pt.toW / WALL_W);
            g.rotation.z = pt.featured ? Math.sin(G.t * 0.6 + pt.ph) * 0.03 : pt.tilt + Math.sin(G.t * 0.8 + pt.ph) * 0.05;
          }
          const lift = G.phase === 'finale' ? Math.min(0.05, G.finT * 0.012) : 0;
          // (the featured painting sits in front of the others)
          const [x, y] = G.S.P(pt.pos[0], pt.pos[1] - lift); g.position.set(x, y + Math.sin(G.t * 1.1 + pt.ph) * 0.008, pt.featured ? 0.058 : 0.05);
          pt.view.light(1); pt.view.glow((pt.featured ? 0.9 : 0.55) * Math.min(1, pt.state === 'rising' ? pt.t * 1.5 : 1) + (G.phase === 'finale' ? 0.1 : 0));
        }
        pt.view.tick(G.t + pt.ph, dt);
      }
      // dust rises up the beam, toward the ceiling
      const A = HOLE, B = G.light, wid = 0.02 + 0.05 * (1 + u.uFin.value);
      for (const m of G.motes) {
        m.k -= dt * m.sp * (1 + u.uFin.value * 2); if (m.k < 0) { m.k = 1; m.off = Math.random() * 2 - 1; }
        const px = A[0] + (B[0] - A[0]) * m.k, py = A[1] + (B[1] - A[1]) * m.k;
        const nx = -(B[1] - A[1]), ny = B[0] - A[0], nl = Math.hypot(nx, ny) || 1;
        const o = m.off * wid * m.k + Math.sin(G.t + m.ph) * 0.006;
        const [x, y] = G.S.P(px + nx / nl * o, py + ny / nl * o); m.s.position.set(x, y, 0.055);
        m.s.material.opacity = u.uOn.value * Math.sin(m.k * Math.PI) * (0.5 + 0.3 * Math.sin(G.t * 3 + m.ph));
      }
      if (G.phase === 'finale') G.finT += dt;
      // the robot: carries its light to each painting in turn
      if (G.bot && G.phase === 'play') {
        const pt = G.pieces.find(p => p.state === 'wall');
        if (pt) { G.botAim = G.botAim || [0.53, 0.7]; G.botAim[0] += (pt.at[0] - G.botAim[0]) * Math.min(1, dt * 3); G.botAim[1] += (pt.at[1] - G.botAim[1]) * Math.min(1, dt * 3); }
      }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'play') return;
      if (kind === 'down' || (kind === 'move' && G.touch)) {
        const p = G.S.toBoard(ev, G.root);
        if (p) { G.touch = [Math.max(0.02, Math.min(0.98, p.u)), Math.max(0.14, Math.min(0.95, p.v))]; if (kind === 'down') { G.press = 1; G.band.land(); } }
      }
      if (kind === 'up') G.touch = null;
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); if (G.deb) G.deb.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(1); if (G.deb && G.debStarted) G.deb.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'raise', playing: G.playing, over: G.over, phase: G.phase, raised: G.raised, lit: +G.lit.toFixed(2), light: G.light.map(v => +v.toFixed(2)), t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.band.stop(); if (G.deb) { G.deb.pause(); G.deb = null; } } K.cleanup(G); endCardStyle(false); G = null; },
  };
}
