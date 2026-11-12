// A DIFFERENT WAY TO SEE (Deborah Tramentozzi): FOLLOW THE LINES.
// Deborah's painting is a collage of small framed scenes joined by thin lines. "A blind person sees in an analytic
// way": the picture is built one detail at a time. The game starts with the painting faded to a pale wash, with only
// the great hall in the middle in colour. A glowing spark sits in the middle. One scene at a time makes its own sound
// (wind in a fir tree, a pencil sketching, hooves, a fountain…) from where it is in the picture, louder as the spark
// gets close. Steer the spark along the lines with four big arrow buttons (Up, Down, Left, Right), or tap the painting
// on the side you want to go. At each turn only the right way takes you on; a wrong way bumps and comes back. Reach the
// scene and it fills with colour, the narrator describes it, and its line glows gold. Eight details, and the whole
// picture is in colour, every line glows, and Deborah says, in her own voice, how a blind person sees.
import * as THREE from 'three';
import * as K from './kit.js';

const DEBORAH = new URL('../../../3D/gallery/audio/wing_1_2.mp3', import.meta.url).href;

// the line network (u, v from the painting's top-left): junctions and the eight scenes at the ends of the lines
const N = {
  S: [0.51, 0.5], JU: [0.51, 0.24], JD: [0.51, 0.66],
  JUL: [0.2, 0.24], JUR: [0.885, 0.24], JDL: [0.36, 0.66], JFL: [0.15, 0.66], JDR: [0.88, 0.66],
  T1: [0.15, 0.59], T2: [0.2, 0.36], T3: [0.51, 0.1], T4: [0.885, 0.3], T5: [0.88, 0.585], T6: [0.88, 0.7], T7: [0.36, 0.76], T8: [0.51, 0.85],
};
const E = [['S', 'JU'], ['JU', 'T3'], ['JU', 'JUL'], ['JUL', 'T2'], ['JU', 'JUR'], ['JUR', 'T4'], ['S', 'JD'], ['JD', 'T8'], ['JD', 'JDL'], ['JDL', 'T7'],
  ['JDL', 'JFL'], ['JFL', 'T1'], ['JD', 'JDR'], ['JDR', 'T5'], ['JDR', 'T6']];
// the eight scenes: their frame on the painting (pixels of 800 × 800), sound, and what the narrator says
const SCENES = [
  { node: 'T1', id: 'tree', rect: [18, 388, 242, 476], snd: 'wind', say: 'A tall fir tree stands over golden hills.' },
  { node: 'T2', id: 'fruit', rect: [108, 272, 218, 338], snd: 'fruit', say: 'Ripe fruit sits on a table.' },
  { node: 'T3', id: 'sketch', rect: [275, 22, 465, 95], snd: 'pencil', say: 'Sketches of buildings are pinned to the wall.' },
  { node: 'T4', id: 'crowd', rect: [640, 208, 776, 305], snd: 'hush', say: 'A crowd bends over a sleeping man.' },
  { node: 'T5', id: 'travel', rect: [578, 372, 742, 470], snd: 'cicada', say: 'Two travellers talk under the olive trees.' },
  { node: 'T6', id: 'books', rect: [640, 548, 782, 648], snd: 'pages', say: 'A man rests in a sunny room full of books.' },
  { node: 'T7', id: 'riders', rect: [233, 598, 343, 660], snd: 'hooves', say: 'Riders cross a wide green field.' },
  { node: 'T8', id: 'fountain', rect: [355, 675, 450, 740], snd: 'fountain', say: 'People meet beside a stone fountain.' },
];
const HUB = [242, 325, 575, 476];     // the great hall in the middle: in colour from the start
const MORE = ['', '1 more.', '2 more.', '3 more.', '4 more.', '5 more.', '6 more.', '7 more.'];
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const SPEED = 0.42, BACK = 0.9;

// which way an edge goes, from node a to node b
const dirOf = (a, b) => { const dx = N[b][0] - N[a][0], dy = N[b][1] - N[a][1]; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); };
const nbrs = (n) => E.filter(e => e.includes(n)).map(e => e[0] === n ? e[1] : e[0]);
function route(from, to) {   // the nodes from one place to another
  const prev = { [from]: null }, q = [from];
  while (q.length) { const n = q.shift(); if (n === to) break; for (const m of nbrs(n)) if (!(m in prev)) { prev[m] = n; q.push(m); } }
  const out = []; for (let n = to; n; n = prev[n]) out.unshift(n); return out;
}

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
// the painting faded to a pale wash, with each found scene in full colour (and a bright edge as it arrives)
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform vec4 uR[9];
uniform float uV[9];
uniform float uT, uA, uAll;
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  vec3 col = texture2D(map, vUv).rgb;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 wash = mix(vec3(lum), vec3(0.9, 0.89, 0.86), 0.55);
  float on = uAll, edge = 0.0;
  for (int i = 0; i < 9; i++) {
    vec4 r = uR[i];
    vec2 c = (r.xy + r.zw) * 0.5, h = (r.zw - r.xy) * 0.5 + 0.004;
    vec2 d = abs(p - c) - h;
    float inside = 1.0 - smoothstep(-0.004, 0.004, max(d.x, d.y));
    // the colour spreads out from the middle of the frame as it is found
    float grow = smoothstep(0.0, 1.0, uV[i] * 1.6 - length((p - c) / max(h, vec2(0.001))) * 0.45);
    on = max(on, inside * grow);
    edge = max(edge, (1.0 - smoothstep(0.0, 0.006, abs(max(d.x, d.y)))) * step(0.01, uV[i]) * (1.0 - smoothstep(0.6, 1.0, uV[i])));
  }
  vec3 outc = mix(wash, col * 1.04, on);
  outc += vec3(1.0, 0.82, 0.35) * edge * 0.8;
  gl_FragColor = vec4(outc, uA);
}`;

/* ───────────────────────── the sound: a lute tune and each scene's own sound ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(master);
  const verb = ac.createConvolver(), wet = ac.createGain(); wet.gain.value = 0.3;
  { const len = ac.sampleRate * 1.6, b = ac.createBuffer(2, len, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } verb.buffer = b; }
  verb.connect(wet).connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  const route = (node, p, dest = fx) => { node.connect(pan(p, dest)); node.connect(verb); };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, p = 0, slide = 0, dest = fx, filter = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o.connect(g); if (filter) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = filter; n = n.connect(f2); }
    route(n, p, dest); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0, sweep = 0, att = 0.005, dest = fx } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    route(s.connect(f).connect(g), p, dest); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  }
  // a lute: plucked notes in D dorian over a slow bass; more notes join as the picture fills in
  const pluck = (t, m, vol, p = 0) => { tone(t, midi(m), 1.1, { type: 'triangle', vol, p, dest: bus, filter: 2600 }); tone(t, midi(m + 12), 0.25, { vol: vol * 0.25, p, dest: bus }); };
  const BASS = [38, 38, 41, 36, 38, 43, 45, 45];
  const TUNE = [62, 65, 69, 67, 65, 64, 62, 64, 65, 69, 72, 69, 67, 65, 64, 62];
  let next = 0, step = 0, timer = null, found = 0;
  function schedule() {
    const beat = 60 / 84;
    while (next < ac.currentTime + 0.25) {
      const t = next, b = step % 4, bar = Math.floor(step / 4) % 8;
      if (b === 0) { tone(t, midi(BASS[bar]), beat * 3.8, { type: 'triangle', vol: 0.05, dest: bus, filter: 600, att: 0.02 }); pluck(t, BASS[bar] + 19, 0.03, -0.3); }
      if (b === 2) pluck(t, BASS[bar] + 24, 0.025, 0.3);
      if (found > 0 && (b === 1 || b === 3) && Math.random() < 0.25 + found * 0.08) pluck(t, TUNE[(step / 2 | 0) % TUNE.length], 0.04, Math.random() * 0.6 - 0.3);
      next += beat / 2 * 1; step++;
    }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 50); schedule(); bus.gain.setTargetAtTime(1, ac.currentTime, 1); },
    found(n) { found = n; },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    // the music fades right out (over about 2 seconds) so Deborah can be heard
    fadeOut() { bus.gain.cancelScheduledValues(ac.currentTime); bus.gain.setTargetAtTime(0, ac.currentTime, 0.6); },
    // each scene's own sound, from its side (p), louder when near (v)
    call(snd, p, v) {
      const t = ac.currentTime + 0.02;
      if (snd === 'wind') { noise(t, 1.8, { freq: 500, q: 0.7, vol: 0.18 * v, p, sweep: 1600, att: 0.6 }); [0.5, 0.65].forEach(d => tone(t + d, 3200, 0.08, { vol: 0.05 * v, p, slide: 4200 })); }
      if (snd === 'fruit') [0, 0.32, 0.56, 0.74].forEach((d, i) => { tone(t + d, 210 - i * 15, 0.12, { vol: 0.14 * v, p, att: 0.002 }); noise(t + d, 0.05, { freq: 900, q: 2, vol: 0.08 * v, p }); });
      if (snd === 'pencil') for (let i = 0; i < 6; i++) noise(t + i * 0.16 + Math.random() * 0.04, 0.11, { freq: 4500, q: 3, vol: 0.12 * v, p, sweep: 3000 });
      if (snd === 'hush') { [57, 60, 64].forEach((m, i) => tone(t + i * 0.1, midi(m), 1.6, { vol: 0.045 * v, p, att: 0.4, filter: 900, type: 'sawtooth' })); noise(t, 1.4, { freq: 2200, q: 1.2, vol: 0.06 * v, p, att: 0.3 }); }
      if (snd === 'cicada') for (let i = 0; i < 4; i++) noise(t + i * 0.28, 0.2, { freq: 5200, q: 8, vol: 0.12 * v, p, att: 0.05 });
      if (snd === 'pages') [0, 0.55].forEach(d => noise(t + d, 0.3, { freq: 2500, q: 0.8, vol: 0.2 * v, p, sweep: 6000, att: 0.04 }));
      if (snd === 'hooves') for (let i = 0; i < 8; i++) { const d = Math.floor(i / 2) * 0.32 + (i % 2) * 0.09; noise(t + d, 0.06, { freq: 700, q: 2, vol: 0.2 * v, p }); tone(t + d, 160, 0.06, { vol: 0.08 * v, p }); }
      if (snd === 'fountain') for (let i = 0; i < 9; i++) tone(t + i * 0.11 + Math.random() * 0.05, 900 + Math.random() * 900, 0.07, { vol: 0.05 * v, p, slide: 1800 + Math.random() * 900 });
    },
    step(p) { tone(ac.currentTime + 0.01, 1320, 0.05, { vol: 0.03, p }); },
    turn(p) { tone(ac.currentTime + 0.01, midi(74), 0.25, { type: 'triangle', vol: 0.07, p }); tone(ac.currentTime + 0.06, midi(81), 0.25, { type: 'triangle', vol: 0.05, p }); },
    bump(p) { tone(ac.currentTime + 0.01, 140, 0.25, { type: 'square', vol: 0.06, p, slide: 90, filter: 700 }); },
    junction() { tone(ac.currentTime + 0.01, midi(86), 0.4, { vol: 0.04 }); },
    found1(p) { const t = ac.currentTime + 0.02; [62, 66, 69, 74, 78, 81].forEach((m, i) => tone(t + i * 0.08, midi(m), 1.4, { type: 'triangle', vol: 0.06, p, att: 0.004 })); noise(t + 0.2, 1, { freq: 3000, q: 0.5, vol: 0.05, sweep: 8000, att: 0.3 }); },
    whole() { const t = ac.currentTime + 0.05; [50, 57, 62, 66, 69, 74, 78, 81, 86, 90].forEach((m, i) => tone(t + i * 0.15, midi(m), 4, { type: 'triangle', vol: 0.045, att: 0.01, p: Math.sin(i * 1.7) * 0.6 })); },
    stop() { clearInterval(timer); timer = null; try { master.gain.setTargetAtTime(0, ac.currentTime, 0.1); } catch (e) {} },
  };
}

const ARROW = {
  up: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M5 11l7-7 7 7"/></svg>',
  down: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M5 13l7 7 7-7"/></svg>',
  left: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H5M11 5l-7 7 7 7"/></svg>',
  right: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15M13 5l7 7-7 7"/></svg>',
};

export function followTheLinesGame() {
  let G = null;
  const W = () => (G.work && G.work.width) || 800, H = () => (G.work && G.work.height) || 800;
  const pos = (n) => N[n];
  const sideOf = (u) => Math.max(-1, Math.min(1, (u - G.spark[0]) * 2.2));

  function nextTarget() {
    G.target = G.order[G.found]; G.callT = 0.6; G.idleT = 0;
  }
  // the way to go from where the spark is now
  function rightWay() { const r = route(G.at, G.target.node); return r.length > 1 ? dirOf(r[0], r[1]) : null; }
  function go(dir) {
    if (!G || G.phase !== 'play' || G.move) return;
    G.idleT = 0;
    const to = nbrs(G.at).find(m => dirOf(G.at, m) === dir);
    if (!to) { G.band.bump(0); G.buzz([40]); G.say('No line that way.'); G.wiggle = 0.3; return; }
    const r = route(G.at, G.target.node);
    if (r[1] === to) { G.band.turn(sideOf(N[to][0])); G.move = { from: G.at, to, t: 0, len: Math.hypot(N[to][0] - N[G.at][0], (N[to][1] - N[G.at][1]) * G.h) }; }
    else { G.band.bump(sideOf(N[to][0])); G.buzz([30, 30, 30]); G.say('Not that way. Listen.'); G.move = { from: G.at, to, t: 0, len: Math.hypot(N[to][0] - N[G.at][0], (N[to][1] - N[G.at][1]) * G.h), bounce: true }; }
  }
  function arrive(n) {
    G.at = n; G.path.push(n);
    const sc = G.order.find(s => s.node === n);
    if (sc && sc === G.target) return found(sc);
    G.band.junction();
  }
  function found(sc) {
    sc.on = true; G.found++; G.band.found(G.found); G.band.found1(sideOf(N[sc.node][0])); G.buzz([30, 40, 90]);
    const [x, y] = G.S.P(...N[sc.node]); G.fx.add(x, y, '#ffcf4a', 24, 0.2);
    // the route there glows gold for good
    for (let i = 0; i < G.path.length - 1; i++) { const k = [G.path[i], G.path[i + 1]].sort().join('-'); if (G.lines[k]) G.lines[k].gold = true; }
    G.say(sc.say + (G.found < SCENES.length ? ' ' + MORE[SCENES.length - G.found] : ''));
    G.ui.panel('Follow the lines', `${G.found} <small>of ${SCENES.length} details</small>`, { segs: [G.found, SCENES.length] });
    if (G.found === SCENES.length) { G.phase = 'done'; K.later(G, 3.8, () => G && finale()); return; }   // (game time: the ending waits while the painting is out of view)
    // the spark glides back to the middle, and the next scene starts to call
    G.phase = 'back'; G.backRoute = route(sc.node, 'S'); G.backI = 0; G.backT = -1.2;
  }
  function finale() {
    G.phase = 'finale'; G.finT = 0; G.band.whole(); G.ui.buttons([]);
    G.say('Every detail is in place. The picture is whole.');
    for (const k in G.lines) G.lines[k].gold = true;
    K.later(G, 6, () => {   // (game time, like the wait before it: the ending never plays while the painting is out of view)
      if (!G) return;
      K.finale(G, { won: true, kicker: 'Follow the lines', title: 'The picture is whole', line: G.work && G.work.quote,
        cells: [{ k: 'Details', v: `${G.found}/${SCENES.length}` }, { k: 'Wrong turns', v: G.wrong }],
        say: 'The picture is whole. Here is Deborah, in her own words.' });
      // the music fades away as the card appears, and once the narrator has finished, Deborah speaks in her own voice
      G.musicOff = true; G.band.fadeOut();
      try { G.deb = new Audio((G.work && G.work.artistAudio) || DEBORAH); G.deb.preload = 'auto'; } catch (e) {}
      K.later(G, 5.6, () => { if (!G || G.bot || !G.deb) return; G.debStarted = true; G.deb.play().catch(() => {}); });
    });
  }
  function hint() {
    const d = rightWay(); if (!d) return;
    G.say({ up: 'The sound is up.', down: 'The sound is down.', left: 'The sound is to the left.', right: 'The sound is to the right.' }[d]);
  }

  return {
    title: 'Follow the lines',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      endCardStyle(true);
      const order = SCENES.map(s => ({ ...s, on: false })).sort(() => Math.random() - 0.5);
      Object.assign(G, { phase: 'intro', found: 0, wrong: 0, order, at: 'S', path: ['S'], move: null, spark: N.S.slice(), callT: 1, idleT: 0, wiggle: 0, lines: {}, trail: [], finT: 0 });
      G.band = band(K.audio());
      // the shader's frames: the eight scenes and the great hall
      const rects = [...SCENES.map(s => s.rect), HUB].map(([x0, y0, x1, y1]) => new THREE.Vector4(x0 / W(), y0 / H(), x1 / W(), y1 / H()));
      G.uni = { map: { value: null }, uR: { value: rects }, uV: { value: new Array(9).fill(0) }, uT: { value: 0 }, uA: { value: 0 }, uAll: { value: 0 } };
      G.uni.uV.value[8] = 1;
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the lines: bright paths over the painting's own lines (white; gold once travelled)
      for (const [a, b] of E) {
        const [ax, ay] = G.S.P(...N[a]), [bx, by] = G.S.P(...N[b]), len = Math.hypot(bx - ax, by - ay);
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(len + 0.012, 0.016), new THREE.MeshBasicMaterial({ color: 0xffd25a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        const m = new THREE.Mesh(new THREE.PlaneGeometry(len + 0.006, 0.006), new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.75, depthWrite: false }));
        for (const o of [glow, m]) { o.position.set((ax + bx) / 2, (ay + by) / 2, o === glow ? 0.04 : 0.041); o.rotation.z = Math.atan2(by - ay, bx - ax); o.renderOrder = o === glow ? 14 : 15; G.root.add(o); }
        G.lines[[a, b].sort().join('-')] = { m, glow, gold: false, a, b };
      }
      // the junctions: small rings; the scenes: a pulsing gold ring when it is the one calling
      G.dots = {};
      for (const n in N) { const s = K.sprite(K.ringTex, n === 'S' ? 0.05 : n[0] === 'T' ? 0.045 : 0.03, { color: '#1a1a1a', order: 16, opacity: 0.8 }); const [x, y] = G.S.P(...N[n]); s.position.set(x, y, 0.042); G.root.add(s); G.dots[n] = s; }
      // the spark
      G.halo = K.sprite(K.glowTex, 0.14, { color: '#ffb31a', additive: false, order: 30, opacity: 0.9 });
      G.core = K.sprite(K.dotTex, 0.045, { color: '#ec3013', order: 31 });
      G.root.add(G.halo); G.root.add(G.core);
      for (let i = 0; i < 14; i++) { const s = K.sprite(K.dotTex, 0.022 * (1 - i / 16), { color: '#ffb31a', order: 29, opacity: 0 }); G.root.add(s); G.trail.push({ s, p: N.S.slice() }); }
      G.onGo = () => {
        G.phase = 'play'; G.band.start(); nextTarget();
        G.ui.panel('Follow the lines', `0 <small>of ${SCENES.length} details</small>`, { segs: [0, SCENES.length] });
        G.btns = G.ui.buttons(['left', 'up', 'down', 'right'].map(d => ({ label: '', icon: ARROW[d], kind: 'black', aria: `Go ${d}`, press: () => go(d) })));
      };
      K.intro(G, { title: 'Follow the lines',
        how: 'Listen for a sound, and steer the glowing spark along the lines toward it with the arrows (or tap the side you want). Each place you reach fills with colour.',
        say: 'Follow the lines. Deborah builds a picture one detail at a time. Your spark starts in the middle of the painting. Listen for a sound, and steer the spark toward it along the lines: up, down, left or right. Each place you reach fills with colour, and you hear what is there.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const u = G.uni; u.uT.value = G.t; u.uA.value += (1 - u.uA.value) * Math.min(1, dt * 2);
      SCENES.forEach((s, i) => { const want = G.order.find(o => o.id === s.id).on ? 1 : 0; u.uV.value[i] += (want - u.uV.value[i]) * Math.min(1, dt * 0.9); });
      u.uAll.value += ((G.phase === 'finale' ? 1 : 0) - u.uAll.value) * Math.min(1, dt * 0.5);
      // the spark moves along a line
      if (G.move) {
        const m = G.move; m.t += dt * SPEED / Math.max(0.02, m.len);
        const k = m.bounce ? (m.t < 0.5 ? m.t * 0.6 : Math.max(0, (1 - m.t) * 0.6)) : Math.min(1, m.t);
        G.spark = [N[m.from][0] + (N[m.to][0] - N[m.from][0]) * k, N[m.from][1] + (N[m.to][1] - N[m.from][1]) * k];
        if (Math.floor(G.t * 12) !== Math.floor((G.t - dt) * 12)) G.band.step(sideOf(G.spark[0]) * 0);
        if (m.bounce && m.t >= 1) { G.move = null; G.wrong++; G.spark = N[G.at].slice(); }
        else if (!m.bounce && m.t >= 1) { G.move = null; arrive(m.to); }
      }
      // back to the middle after a find
      if (G.phase === 'back') {
        G.backT += dt * BACK / 0.25;
        if (G.backT >= 0) {
          const r = G.backRoute, i = Math.min(r.length - 2, Math.floor(G.backT)), f = Math.min(1, G.backT - i);
          if (G.backT >= r.length - 1) { G.at = 'S'; G.path = ['S']; G.spark = N.S.slice(); G.phase = 'play'; nextTarget(); }
          else G.spark = [N[r[i]][0] + (N[r[i + 1]][0] - N[r[i]][0]) * f, N[r[i]][1] + (N[r[i + 1]][1] - N[r[i]][1]) * f];
        }
      }
      if (G.phase === 'play' && G.target) {
        // the scene that's waiting calls now and then, from its side, louder as the spark gets close
        const tp = N[G.target.node], d = Math.hypot(tp[0] - G.spark[0], (tp[1] - G.spark[1]) * G.h);
        G.callT -= dt; if (G.callT <= 0) { G.callT = 2.4; G.band.call(G.target.snd, sideOf(tp[0]), Math.max(0.35, 1 - d * 0.9)); }
        if (!G.move) { G.idleT += dt; if (G.idleT > 7) { G.idleT = 0; hint(); } }
      }
      // draw the spark, its trail and the lines
      const wig = G.wiggle > 0 ? Math.sin(G.t * 60) * 0.006 * G.wiggle / 0.3 : 0; G.wiggle = Math.max(0, G.wiggle - dt);
      const [sx, sy] = G.S.P(G.spark[0] + wig, G.spark[1]);
      G.core.position.set(sx, sy, 0.06); G.halo.position.set(sx, sy, 0.059);
      G.halo.scale.setScalar(0.12 + 0.025 * Math.sin(G.t * 5)); G.core.scale.setScalar(0.04 + 0.006 * Math.sin(G.t * 5));
      let prev = G.spark; for (const tr of G.trail) { tr.p[0] += (prev[0] - tr.p[0]) * Math.min(1, dt * 18); tr.p[1] += (prev[1] - tr.p[1]) * Math.min(1, dt * 18); const [x, y] = G.S.P(...tr.p); tr.s.position.set(x, y, 0.058); tr.s.material.opacity = Math.min(0.8, Math.hypot(tr.p[0] - G.spark[0], tr.p[1] - G.spark[1]) * 20); prev = tr.p; }
      for (const k in G.lines) { const L = G.lines[k]; L.glow.material.opacity += ((L.gold ? 0.75 + 0.2 * Math.sin(G.t * 2 + L.m.position.x * 9) : 0) - L.glow.material.opacity) * Math.min(1, dt * 3); L.m.material.color.set(L.gold ? 0x6b4a00 : 0x1a1a1a); }
      for (const n in G.dots) {
        const s = G.dots[n], calling = G.phase === 'play' && G.target && G.target.node === n;
        const done = n[0] === 'T' && SCENES.find(c => c.node === n) && G.order.find(o => o.node === n).on;
        s.material.color.set(calling ? '#ec3013' : done ? '#b88400' : '#1a1a1a');
        const base = n === 'S' ? 0.05 : n[0] === 'T' ? 0.045 : 0.03; s.scale.setScalar(calling ? base * (1.3 + 0.35 * Math.sin(G.t * 6)) : base);
      }
      if (G.phase === 'finale') G.finT += dt;
      // the robot: takes the right way at every turn
      if (G.bot && G.phase === 'play' && !G.move) { G.botT = (G.botT || 0) + dt; if (G.botT > 0.35) { G.botT = 0; const d = rightWay(); if (d) go(d); } }
    },
    pointer(kind, ev) {
      // tap the painting on the side you want the spark to go
      if (!G || kind !== 'down' || G.phase !== 'play') return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      const dx = p.u - G.spark[0], dy = (p.v - G.spark[1]) * G.h;
      if (Math.hypot(dx, dy) < 0.04) { hint(); return; }
      go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); if (G.deb) G.deb.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(1); if (G.deb && G.debStarted) G.deb.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'lines', playing: G.playing, over: G.over, phase: G.phase, found: G.found, at: G.at, target: G.target && G.target.id, wrong: G.wrong, t: +G.t.toFixed(1) }; },
    stop() { if (G) { G.band.stop(); if (G.deb) { G.deb.pause(); G.deb = null; } } K.cleanup(G); endCardStyle(false); G = null; },
  };
}
