// THE ONLY LIGHT WE'LL SEE (Dave Steele): LIGHT THE NIGHT.
// A still lake under a full moon. The night starts very dark; the moon glows and slowly pulses, its reflection
// shimmers on the water, and little waves lap against the shore. You carry a small light: point your phone across the
// painting (or drag a finger). Eight things are hidden in the night: an owl, a canoe, fireflies, a deer, a jumping fish,
// a cabin's lantern, a heron and a loon. Each one makes its own sound, from its side and louder as you get close.
// Hold your light on it to find it: it lights up in silver, a spark flies up and becomes a star, and the whole night
// gets a little brighter. Find all eight and the stars join into a constellation, the moon's path blazes across the
// water, and the whole painting is lit. "In the darkest of nights, we learn to find our own light."
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ART = 'media/games/onlylight/';
// each hidden thing: where it might be (one spot is picked each game), its sound, and where its star goes
const THINGS = [
  { id: 'owl', emoji: '🦉', name: 'an owl in the trees', spots: [[0.12, 0.2], [0.27, 0.19], [0.32, 0.29]], size: 0.06, snd: 'owl', star: [0.46, 0.08] },
  { id: 'canoe', emoji: '🛶', name: 'a canoe drifting on the lake', spots: [[0.76, 0.72], [0.47, 0.78], [0.86, 0.57]], size: 0.09, snd: 'paddle', star: [0.56, 0.12] },
  { id: 'fireflies', emoji: '✨', name: 'fireflies over the grass', spots: [[0.2, 0.51], [0.36, 0.48], [0.08, 0.55]], size: 0.06, snd: 'fireflies', star: [0.68, 0.07] },
  { id: 'deer', emoji: '🦌', name: 'a deer on the shore', spots: [[0.46, 0.505], [0.24, 0.47]], size: 0.07, snd: 'deer', star: [0.79, 0.13] },
  { id: 'fish', emoji: '🐟', name: 'a fish jumping', spots: [[0.82, 0.82], [0.56, 0.7], [0.92, 0.64]], size: 0.06, snd: 'fish', star: [0.9, 0.22] },
  { id: 'lantern', emoji: '🏮', name: 'a lantern at a cabin across the lake', spots: [[0.79, 0.425], [0.9, 0.43], [0.53, 0.415]], size: 0.04, snd: 'cabin', star: [0.82, 0.31] },
  { id: 'heron', emoji: '🦢', name: 'a heron standing in the shallows', spots: [[0.3, 0.66], [0.39, 0.62], [0.14, 0.7]], size: 0.07, snd: 'heron', star: [0.44, 0.24] },
  { id: 'loon', emoji: '🦆', name: 'a loon calling on the water', spots: [[0.7, 0.5], [0.95, 0.53], [0.4, 0.88]], size: 0.06, snd: 'loon', star: [0.38, 0.15] },
];
const FIND_R = 0.075, HOLD = 1.0;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the night: dark except around your light, getting brighter with every find; the moon glows and pulses, its
// reflection shimmers, the lake ripples and laps at the shore, and at the end the moon's path blazes across the water
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, water;
uniform float uT, uA, uH, uLit, uLightR, uFinale, uTouch;
uniform vec2 uLight;
vec3 at(sampler2D t, vec2 p){ return texture2D(t, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
const vec2 MOON = vec2(0.63, 0.265), REFL = vec2(0.625, 0.625);
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 wi = at(water, p); float wat = wi.r, shore = wi.g;
  // the lake: gentle ripples, stronger closer to you
  vec2 s = p;
  float near = smoothstep(0.45, 1.0, p.y);
  s.x += sin(p.y * 160.0 - uT * 1.8 + sin(p.x * 9.0 + uT * 0.6) * 2.0) * (0.0012 + 0.003 * near) * wat;
  s.y += sin(p.x * 40.0 + uT * 1.3) * 0.0008 * wat;
  // the moon's reflection breaks up and shimmers
  vec2 rd = (p - REFL) * vec2(1.0, uH);
  float inRefl = (1.0 - smoothstep(0.035, 0.06, length(rd * vec2(0.8, 1.0)))) * wat;
  s.x += sin(p.y * 260.0 + uT * 3.0 + sin(p.y * 37.0 - uT) * 2.0) * 0.0022 * inRefl;
  vec3 col = at(map, s);
  // waves lap against the shore: a silver edge of foam that slides in and out
  float lap = 0.5 + 0.5 * sin(uT * 1.25);
  float band = (1.0 - smoothstep(0.0, 0.05, abs(shore - (0.05 + 0.18 * lap)))) * wat * step(shore, 0.6);
  float foam = band * (0.55 + 0.45 * sin(p.x * 90.0 + uT * 2.0)) * (0.6 + 0.4 * lap);
  col += vec3(0.55, 0.62, 0.7) * foam * 0.35;
  // the moon glows and slowly pulses; so does its reflection, with a path of light glittering toward you
  float pulse = 0.5 + 0.5 * sin(uT * 0.9);
  vec2 md = (p - MOON) * vec2(1.0, uH);
  float halo = exp(-length(md) * 16.0) * (0.35 + 0.2 * pulse) + exp(-length(md) * 5.0) * 0.12;
  vec3 moonC = vec3(1.0, 0.95, 0.82);
  float glowR = exp(-length(rd * vec2(0.9, 1.6)) * 14.0) * (0.25 + 0.15 * pulse) * wat;
  float path = wat * exp(-abs(p.x - REFL.x + sin(p.y * 30.0 + uT) * 0.01) * (60.0 - 40.0 * uFinale)) * smoothstep(0.45, 0.5, p.y);
  float glitter = path * step(0.86, fract(sin(dot(floor(vec2(p.x * 520.0, p.y * 260.0 + uT * 3.0)), vec2(12.9898, 78.233))) * 43758.5453)) * (0.3 + 0.5 * uLit) * smoothstep(0.66, 1.0, p.y + 0.2 * uFinale);
  // how lit the night is: dark at first, with your light, and brighter with every find
  float lr = length((p - uLight) * vec2(1.0, uH));
  float torch = (1.0 - smoothstep(uLightR * 0.35, uLightR, lr)) * uTouch;
  float expo = mix(0.22, 1.08, uLit);
  vec3 lit = col * mix(expo, max(expo, 1.05), torch);
  lit = mix(lit, lit * vec3(0.92, 1.0, 1.12), 0.25 * (1.0 - uLit));   // the dark is cool and blue
  lit += moonC * (halo + glowR) * (0.7 + 0.5 * uLit);
  lit += moonC * (path * (0.05 + 0.25 * uFinale) + glitter * 0.35);
  // the moon itself never goes dark
  float md0 = length(md); lit = mix(lit, col * (1.08 + 0.08 * pulse), 1.0 - smoothstep(0.044, 0.05, md0));
  gl_FragColor = vec4(lit, uA);
}`;

/* ───────────────────────── the night: sounds and a slow nocturne ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function night(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, dest = fx, sweep = 0, att = 0.005 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, dest)); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, dest = fx, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  // the nocturne: soft chords and a few piano notes; more notes join as the night lights up
  const CH = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 64], [43, 50, 55, 59, 62], [40, 47, 52, 56, 59]];   // Am(add9) · F · G · E
  const MEL = [76, 72, 74, 71, 69, 72, 76, 79, 77, 74, 72, 71];
  let next = ac.currentTime + 0.1, step = 0, timer = null, lit = 0;
  // the lake and the crickets, always there
  const lake = (() => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = 'lowpass'; f.frequency.value = 380; g.gain.value = 0; s.connect(f).connect(g).connect(fx); s.start(); return g; })();
  function schedule() {
    const beat = 60 / 62;
    while (next < ac.currentTime + 0.2) {
      const t = next, b = step % 8, bar = Math.floor(step / 8) % 4;
      if (b === 0) CH[bar].forEach((m, i) => tone(t + i * 0.08, midi(m), beat * 8, { vol: 0.03, att: 0.8, dest: bus }));
      if ((b === 2 || b === 5) && Math.random() < 0.35 + lit * 0.6) tone(t, midi(MEL[(step / 2 | 0) % MEL.length]), 2.6, { type: 'triangle', vol: 0.04 + 0.02 * lit, att: 0.005, dest: bus, p: Math.random() * 0.6 - 0.3 });
      if (lit > 0.5 && b === 4) tone(t, midi(CH[bar][4] + 12), 3, { vol: 0.02, att: 0.6, dest: bus });
      // crickets
      if (Math.random() < 0.7) { const cp = Math.random() * 1.6 - 0.8; for (let k = 0; k < 3; k++) noise(t + k * 0.05 + Math.random() * 0.2, 0.025, { freq: 4300 + Math.random() * 400, q: 12, vol: 0.025, p: cp }); }
      next += beat / 2; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 40); schedule(); bus.gain.setTargetAtTime(0.9, ac.currentTime, 1); lake.gain.setTargetAtTime(0.09, ac.currentTime, 1.5); },
    lit(v) { lit = v; },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.3); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.3); },
    lap() { noise(ac.currentTime + 0.02, 1.4, { freq: 900, q: 0.6, vol: 0.06, p: -0.4, sweep: 400, att: 0.5 }); },
    // each hidden thing's voice
    call(kind, p, v) {
      const t = ac.currentTime + 0.02;
      if (kind === 'owl') [0, 0.45, 0.65].forEach((d, i) => tone(t + d, i ? 380 : 400, i ? 0.22 : 0.35, { vol: 0.12 * v, p, att: 0.04, slide: i ? 340 : 360 }));
      if (kind === 'paddle') [0, 0.9].forEach(d => { noise(t + d, 0.35, { freq: 1200, q: 0.8, vol: 0.18 * v, p, sweep: 500, att: 0.03 }); noise(t + d + 0.2, 0.5, { freq: 700, type: 'lowpass', vol: 0.08 * v, p }); });
      if (kind === 'fireflies') for (let i = 0; i < 6; i++) tone(t + i * 0.09 + Math.random() * 0.05, midi(88 + [0, 3, 7, 10, 12, 15][i]), 0.25, { vol: 0.035 * v, p: p + (Math.random() - 0.5) * 0.3 });
      if (kind === 'deer') { noise(t, 0.05, { freq: 2200, q: 3, vol: 0.2 * v, p }); [0.3, 0.55, 0.85].forEach(d => noise(t + d, 0.07, { freq: 500, q: 1.5, vol: 0.12 * v, p })); }
      if (kind === 'fish') { noise(t, 0.12, { freq: 1600, q: 1.2, vol: 0.2 * v, p }); tone(t + 0.02, 500, 0.12, { vol: 0.08 * v, p, slide: 900 }); noise(t + 0.15, 0.6, { freq: 900, q: 0.7, vol: 0.08 * v, p, sweep: 300 }); }
      if (kind === 'cabin') [55, 59, 62, 67].forEach((m, i) => tone(t + i * 0.07, midi(m), 1.4, { type: 'triangle', vol: 0.06 * v, p, att: 0.003 }));
      if (kind === 'heron') { tone(t, 210, 0.35, { type: 'sawtooth', vol: 0.05 * v, p, slide: 160 }); noise(t, 0.3, { freq: 900, q: 2, vol: 0.06 * v, p }); }
      if (kind === 'loon') { tone(t, 520, 1.1, { vol: 0.09 * v, p, att: 0.2, slide: 780 }); tone(t + 1.1, 780, 0.9, { vol: 0.08 * v, p, att: 0.05, slide: 640 }); }
    },
    near(f, v, p) { tone(ac.currentTime + 0.01, f, 0.12, { vol: 0.03 * v, p }); },
    found() { const t = ac.currentTime + 0.02; [69, 76, 81, 88].forEach((m, i) => tone(t + i * 0.1, midi(m), 1.6, { type: 'triangle', vol: 0.07, att: 0.005 })); noise(t + 0.3, 1.2, { freq: 3000, q: 0.5, vol: 0.06, sweep: 9000, att: 0.4 }); },
    twinkle(i) { tone(ac.currentTime + 0.05, midi([81, 84, 86, 88, 91, 93, 96, 98][i % 8]), 2.2, { vol: 0.05, att: 0.01 }); },
    constellation() { const t = ac.currentTime + 0.1; [57, 64, 69, 72, 76, 81, 84, 88, 93].forEach((m, i) => tone(t + i * 0.18, midi(m), 4, { type: 'triangle', vol: 0.05, att: 0.08 })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

// a thing drawn as a moonlit silhouette: dark with a silver rim, which glows when found
function silhouette(emoji) {
  return K.canvasTex(128, 128, (g) => {
    g.font = '92px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.filter = 'blur(3px)'; g.globalAlpha = 0.9; g.fillStyle = '#cfe0ff';
    for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) g.fillText(emoji, 64 + dx, 68 + dy);
    g.filter = 'none'; g.globalAlpha = 1; g.fillText(emoji, 64, 68);
    // keep the shape, cool the colours to moonlight
    const d = g.getImageData(0, 0, 128, 128), a = d.data;
    for (let i = 0; i < a.length; i += 4) { const l = (a[i] * 0.3 + a[i + 1] * 0.59 + a[i + 2] * 0.11) / 255; a[i] = 60 + l * 170; a[i + 1] = 70 + l * 175; a[i + 2] = 95 + l * 160; }
    g.putImageData(d, 0, 0);
  });
}

export function lightTheNightGame() {
  let G = null;
  const dist = (a, b) => Math.hypot(a[0] - b[0], (a[1] - b[1]) * G.h);

  function aim() {
    // a finger on the screen, or (with no finger) wherever the middle of the screen points
    if (G.touch) return G.touch;
    const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root);
    return p ? [Math.max(0, Math.min(1, p.u)), Math.max(0, Math.min(1, p.v))] : [0.5, 0.5];
  }
  function find(th) {
    th.found = true; G.found++; G.night.found(); G.buzz([30, 40, 80]);
    const [x, y] = G.S.P(...th.at); G.fx.add(x, y, '#dfe9ff', 18, 0.12);
    th.sprite.material.opacity = 1;
    G.say(`You found ${th.name}.` + (G.found < THINGS.length ? ` ${THINGS.length - G.found} more.` : ''));
    // a spark flies up and becomes a star
    const sp = K.sprite(K.glowTex, 0.05, { color: '#ffffff', additive: true, order: 30 }); sp.position.set(x, y, 0.06); G.root.add(sp);
    G.sparks.push({ s: sp, from: [x, y], to: G.S.P(...th.star), t: 0, th });
    G.ui.panel('Light the night', `${G.found} <small>of ${THINGS.length} found</small>`, { segs: [G.found, THINGS.length] });
    if (G.found === THINGS.length) setTimeout(() => G && finale(), 3200);
  }
  function addStar(th, i) {
    const [x, y] = G.S.P(...th.star);
    const s = K.sprite(K.glowTex, 0.045, { color: '#ffffff', additive: true, order: 26 }), c = K.sprite(K.dotTex, 0.012, { color: '#ffffff', order: 27 });
    s.position.set(x, y, 0.05); c.position.set(x, y, 0.051); G.root.add(s); G.root.add(c);
    G.stars.push({ s, c, ph: Math.random() * 6.28, big: true }); G.night.twinkle(i);
  }
  function finale() {
    G.phase = 'finale'; G.finT = 0; G.night.constellation();
    G.say('The whole night is lit. The stars join hands across the sky, and the moon lights a path across the water. A light worth following.');
    // the constellation: a line of light joining the eight stars
    const order = THINGS.map(t => t.star).sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < order.length - 1; i++) for (let k = 1; k < 8; k++) {
      const f = k / 8, u = order[i][0] + (order[i + 1][0] - order[i][0]) * f, v = order[i][1] + (order[i + 1][1] - order[i][1]) * f;
      const d = K.sprite(K.dotTex, 0.006, { color: '#dfe9ff', order: 25, opacity: 0 }); const [x, y] = G.S.P(u, v); d.position.set(x, y, 0.05); G.root.add(d); G.lines.push({ d, at: i * 0.35 + f * 0.35 });
    }
    // and the sky fills with little stars
    for (let i = 0; i < 70; i++) {
      let u, v; do { u = Math.random(); v = 0.02 + Math.random() * 0.36; } while (u < 0.38 && v > 0.1);
      const c = K.sprite(K.dotTex, 0.004 + Math.random() * 0.006, { color: '#ffffff', order: 24, opacity: 0 }); const [x, y] = G.S.P(u, v); c.position.set(x, y, 0.05); G.root.add(c);
      G.stars.push({ c, ph: Math.random() * 6.28, delay: Math.random() * 3 });
    }
    G.ui.buttons([]);
    setTimeout(() => {
      if (!G) return;
      K.finale(G, { won: true, kicker: 'Light the night', title: 'The whole night is lit', line: G.work && G.work.quote,
        cells: [{ k: 'Found', v: `${G.found}/${THINGS.length}` }, { k: 'Stars', v: G.found }],
        say: 'The whole night is lit. ' + ((G.work && G.work.quote) || '') });
    }, 9000);
  }
  // Listen: the nearest hidden thing calls out loudly, and glints
  function listen() {
    const a = aim(); let best = null, bd = 9;
    for (const th of G.things) if (!th.found) { const d = dist(a, th.at); if (d < bd) { bd = d; best = th; } }
    if (!best) return;
    G.night.call(best.snd, (best.at[0] - a[0]) * 2.5, 1); best.glint = 1.2;
    const dx = best.at[0] - a[0], dy = best.at[1] - a[1];
    const dir = Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx > 0 ? 'right' : 'left') : Math.abs(dy) > Math.abs(dx) * 1.2 ? (dy > 0 ? 'down' : 'up') : `${dy > 0 ? 'down' : 'up'} and ${dx > 0 ? 'right' : 'left'}`;
    G.say(bd < FIND_R * 1.4 ? 'It’s right here. Hold your light still.' : `Something is ${dir}.`);
  }

  return {
    title: 'Light the night',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', found: 0, things: [], stars: [], sparks: [], lines: [], touch: null, lit: 0, light: [0.5, 0.6], callT: 2, lapT: 3, nearT: 0, finT: 0, botI: 0 });
      G.night = night(K.audio());
      G.uni = { map: { value: null }, water: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uLit: { value: 0 }, uLightR: { value: 0.16 }, uFinale: { value: 0 }, uTouch: { value: 1 },
        uLight: { value: new THREE.Vector2(0.5, 0.6) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const L = new THREE.TextureLoader(); let need = 2; const ok = () => { if (--need === 0 && G) G.face.visible = true; };
      const raw = (url, key) => L.load(url, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni[key].value = t; ok(); });
      const src = ctx.work && ctx.work.image; if (src) raw(src, 'map');
      raw(ART + 'water.png', 'water');
      // hide the eight things, each in one of its spots
      for (const t of THINGS) {
        const at = t.spots[Math.floor(Math.random() * t.spots.length)];
        const sprite = K.sprite(silhouette(t.emoji), t.size, { order: 20, opacity: 0 }); const [x, y] = G.S.P(...at); sprite.position.set(x, y, 0.045); G.root.add(sprite);
        G.things.push({ ...t, at, sprite, hold: 0, found: false, glint: 0 });
      }
      // the light you carry
      G.ring = K.sprite(K.ringTex, 0.1, { color: '#dfe9ff', order: 28, opacity: 0 }); G.root.add(G.ring);
      G.onGo = () => {
        G.phase = 'search'; G.night.start();
        G.ui.panel('Light the night', `0 <small>of ${THINGS.length} found</small>`, { segs: [0, THINGS.length] });
        G.ui.buttons([{ label: 'Listen', icon: '👂', kind: 'black', aria: 'Listen: the nearest hidden thing calls out', press: () => listen() }]);
      };
      K.intro(G, { title: 'Light the night', how: 'Eight things are hidden in the dark. Point your phone, or drag a finger, to search with your light. Listen: each one makes a sound. Hold your light on it to find it, and it becomes a star.',
        say: 'Light the night. It’s a dark night by the lake, and the moon is the only light. Eight things are hidden in the dark: an owl, a canoe, fireflies, a deer, a jumping fish, a lantern, a heron and a loon. Point your phone across the painting, or drag your finger, to search with your light. Each one makes its own sound, from its side, louder as you get close. Hold your light on it to find it, and it becomes a star. Light up the whole night.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      // the night brightens with every find
      G.lit += (G.found / THINGS.length - G.lit) * Math.min(1, dt * 0.9); u.uLit.value = G.lit; G.night.lit(G.lit);
      u.uFinale.value += ((G.phase === 'finale' ? 1 : 0) - u.uFinale.value) * Math.min(1, dt * 0.5);
      // waves lap the shore
      G.lapT -= dt; if (G.lapT <= 0) { G.lapT = 5; G.night.lap(); }
      // your light
      const a = G.phase === 'search' ? (G.bot ? G.botAim || [0.5, 0.6] : aim()) : G.light;
      G.light[0] += (a[0] - G.light[0]) * Math.min(1, dt * 10); G.light[1] += (a[1] - G.light[1]) * Math.min(1, dt * 10);
      u.uLight.value.set(G.light[0], G.light[1]); u.uLightR.value = 0.16 + 0.04 * Math.sin(G.t * 2.1); u.uTouch.value += ((G.phase === 'search' ? 1 : 0) - u.uTouch.value) * Math.min(1, dt * 2);
      const [rx, ry] = G.S.P(G.light[0], G.light[1]); G.ring.position.set(rx, ry, 0.06); G.ring.material.opacity = G.phase === 'search' ? 0.25 : 0;
      if (G.phase === 'search') {
        // the nearest hidden thing calls now and then, from its side, louder as you get close
        let best = null, bd = 9;
        for (const th of G.things) if (!th.found) { const d = dist(G.light, th.at); if (d < bd) { bd = d; best = th; } }
        G.callT -= dt;
        if (best && G.callT <= 0) { G.callT = 2.4 + bd * 3; G.night.call(best.snd, (best.at[0] - G.light[0]) * 2.5, Math.max(0.25, 1 - bd * 1.8)); }
        // a soft shimmer that quickens as your light gets close
        if (best && bd < 0.25) { G.nearT -= dt; if (G.nearT <= 0) { G.nearT = 0.12 + bd * 2.5; G.night.near(900 + (0.25 - bd) * 3000, 1 - bd * 3, (best.at[0] - G.light[0]) * 2.5); } }
        for (const th of G.things) {
          if (th.found) continue;
          const d = dist(G.light, th.at), inside = d < FIND_R;
          th.hold = inside ? th.hold + dt : Math.max(0, th.hold - dt * 2);
          // a faint glint when your light passes near, more as you hold it there
          th.glint = Math.max(th.glint - dt, 0);
          th.sprite.material.opacity = Math.min(0.85, Math.max(th.glint * 0.6, (1 - Math.min(1, d / 0.14)) * 0.35 + th.hold / HOLD * 0.5));
          th.sprite.scale.setScalar(th.size * (1 + th.hold / HOLD * 0.15));
          if (th.hold >= HOLD) find(th);
        }
      }
      // found things glow softly; sparks fly up to become stars
      for (const th of G.things) if (th.found) { th.sprite.material.opacity = 0.85 + 0.15 * Math.sin(G.t * 2 + th.at[0] * 9); }
      for (let i = G.sparks.length - 1; i >= 0; i--) {
        const s = G.sparks[i]; s.t += dt / 1.6; const k = Math.min(1, s.t), e = 1 - Math.pow(1 - k, 3);
        s.s.position.x = s.from[0] + (s.to[0] - s.from[0]) * e; s.s.position.y = s.from[1] + (s.to[1] - s.from[1]) * e + Math.sin(k * Math.PI) * 0.05;
        if (k >= 1) { G.root.remove(s.s); s.s.material.dispose(); G.sparks.splice(i, 1); addStar(s.th, G.stars.length); }
      }
      for (const st of G.stars) {
        const tw = 0.65 + 0.35 * Math.sin(G.t * (st.big ? 2.2 : 3.1) + st.ph);
        if (st.big) { st.s.material.opacity = 0.7 * tw + 0.2; st.s.scale.setScalar(0.04 + 0.015 * tw); st.c.material.opacity = 1; }
        else { st.delay -= dt; st.c.material.opacity = st.delay > 0 ? 0 : Math.min(1, -st.delay) * (0.4 + 0.6 * tw); }
      }
      if (G.phase === 'finale') { G.finT += dt; for (const l of G.lines) l.d.material.opacity = Math.max(0, Math.min(0.9, (G.finT - 1 - l.at) * 2)); }
      // the robot: sweeps its light to each thing in turn
      if (G.bot && G.phase === 'search') {
        const th = G.things.find(t => !t.found); if (th) { G.botAim = G.botAim || [0.5, 0.6]; G.botAim[0] += (th.at[0] - G.botAim[0]) * Math.min(1, dt * 3); G.botAim[1] += (th.at[1] - G.botAim[1]) * Math.min(1, dt * 3); }
      }
    },
    pointer(kind, ev) {
      if (!G || G.phase !== 'search') return;
      if (kind === 'down' || (kind === 'move' && G.touch)) { const p = G.S.toBoard(ev, G.root); if (p) G.touch = [Math.max(0, Math.min(1, p.u)), Math.max(0, Math.min(1, p.v))]; }
      if (kind === 'up') G.touch = null;
    },
    pause() { if (G) { G.paused = true; G.night.volume(0); } },
    resume() { if (G) { G.paused = false; G.night.volume(0.9); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'night', playing: G.playing, over: G.over, phase: G.phase, found: G.found, lit: +G.lit.toFixed(2), light: G.light.map(v => +v.toFixed(2)), t: +G.t.toFixed(1) }; },
    stop() { if (G) G.night.stop(); K.cleanup(G); G = null; },
  };
}
