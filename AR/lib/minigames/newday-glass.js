// A NEW DAY (Raquel Alim): LIGHT THE GLASS.  (polished 5 Nov 2026)
// "I have my down moments, and that's okay. Tomorrow is a new day." One simple thing to do: rub the glass.
// It's night: Raquel's stained-glass window is dark and blue, in 8 big panes (the orange arch, the sunset, the blue
// arches, the white arch, the sea, the round window, the blue tiles, the floating glass). Each dark pane hums softly
// from its side, louder as your finger gets near, and breathes a faint blue so you can see where it is. Rub a pane and
// its glass lights up piece by piece, warm as a sunrise behind it, then the whole pane rings out with a glass chord
// and its name. Halfway there, a down moment: a cloud drifts over and two panes go dark again. That's okay: light them
// again. Light all 8 and the sun rises over the sea, the birds wake, and Raquel reads her own words (art_12).
// Press Listen to hear each dark pane hum in turn, from its side.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const ARTIST = new URL('../../../3D/gallery/audio/art_12.mp3', import.meta.url).href;   // Raquel, in her own words
const N = 96;          // the light map (where you've rubbed) is N×N
const BRUSH = 0.075;   // how big a touch is
const RUB = 1.5;       // seconds of rubbing to light a pane
const HINT_AFTER = 9;  // seconds without lighting anything before the hint
// the 8 panes: an ellipse on the painting (centre u, v and radii), its name and its hum (a note of the chord)
const PANES = [
  { name: 'The orange arch.', u: 0.40, v: 0.14, rx: 0.24, ry: 0.12, m: 74 },
  { name: 'The sunset.', u: 0.22, v: 0.47, rx: 0.085, ry: 0.16, m: 62 },
  { name: 'The blue arches.', u: 0.53, v: 0.30, rx: 0.10, ry: 0.11, m: 69 },
  { name: 'The white arch.', u: 0.45, v: 0.50, rx: 0.085, ry: 0.12, m: 66 },
  { name: 'The sea.', u: 0.40, v: 0.72, rx: 0.19, ry: 0.07, m: 57 },
  { name: 'The round window.', u: 0.79, v: 0.57, rx: 0.115, ry: 0.21, m: 71 },
  { name: 'The blue tiles.', u: 0.065, v: 0.35, rx: 0.065, ry: 0.30, m: 64 },
  { name: 'The floating glass.', u: 0.86, v: 0.19, rx: 0.13, ry: 0.17, m: 78 },
];
const NUM = PANES.map((p, i) => `${i + 1} of ${PANES.length}.`);   // "3 of 8."

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// night: the painting dark and blue. Each pane's glass lights piece by piece (the pieces are cells, so light pops on
// a piece at a time, and the dark leading between them stays dark). Dark panes breathe a faint blue with their hum.
// The sea shimmers, and at the end the sun rises over the horizon.
const FRAG = `
varying vec2 vUv;
uniform sampler2D map, light;
uniform vec4 uPane[8];
uniform float uT, uA, uH, uDay, uSun, uCloud;
uniform float uLit[8], uHum[8];
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
float h1(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), s = p;
  float sea = smoothstep(0.6, 0.62, p.y) * (1.0 - smoothstep(0.72, 0.76, p.y)) * step(0.15, p.x) * step(p.x, 0.92);
  s.x += sin(p.y * 220.0 + uT * 1.8) * 0.0022 * sea;
  vec3 c = at(s);
  float lum = dot(c, vec3(0.299, 0.587, 0.114));
  // glass pieces: cells, each with its own threshold, so the light comes on a piece at a time
  vec2 sc = vec2(30.0, 30.0 * uH), g = p * sc, gi = floor(g), gf = fract(g); float md = 8.0; vec2 best = gi;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 o = vec2(float(x), float(y)); vec2 r = o + h2(gi + o) - gf; float d = dot(r, r); if (d < md) { md = d; best = gi + o; } }
  float hc = h1(best) * 0.85 + 0.1;
  // which pane is this piece in? (judged at the piece's centre, so a pane's edge follows the pieces)
  vec2 cp = (best + h2(best)) / sc;
  float litP = 0.0, hum = 0.0, inPane = 0.0;
  for (int i = 0; i < 8; i++) { vec4 e = uPane[i]; vec2 q = (cp - e.xy) / e.zw; if (dot(q, q) <= 1.0) { litP = uLit[i]; hum = uHum[i]; inPane = 1.0; } }
  float L = texture2D(light, vec2(p.x, 1.0 - p.y)).r * inPane;
  float fill = max(L, litP);
  float on = smoothstep(hc - 0.06, hc + 0.02, fill * 1.08);
  // night: dark and blue
  vec3 night = mix(vec3(lum) * vec3(0.35, 0.45, 0.75), c * vec3(0.4, 0.5, 0.8), 0.45) * 0.55;
  // lit glass: the painting, brightened warmly where the glass is light (the leading stays dark)
  float glass = smoothstep(0.18, 0.55, lum);
  vec3 lit = c * (1.0 + 0.45 * glass) + vec3(0.12, 0.06, 0.0) * glass;
  float flick = 0.94 + 0.06 * sin(uT * 2.0 + p.x * 20.0 + p.y * 13.0);
  float k = clamp(max(on, uDay), 0.0, 1.0) * (1.0 - uCloud * 0.35);
  vec3 col = mix(night, lit * flick, k);
  // a warm glow where the light is spreading
  col += vec3(1.0, 0.7, 0.35) * glass * fill * (1.0 - fill) * 0.7 * (1.0 - uDay);
  // a dark pane breathes a faint blue with its hum (so you can see where the dark glass is, too)
  col += vec3(0.2, 0.32, 0.65) * (0.35 + glass) * hum * inPane * (1.0 - on) * (1.0 - uDay);
  // sunrise: the sun comes up over the sea, and its path glitters on the water
  vec2 sp = vec2(0.375, 0.615 - uSun * 0.07);
  float sd = length((p - sp) * vec2(1.0, uH));
  col += vec3(1.0, 0.75, 0.4) * (exp(-sd * 22.0) * 0.9 + exp(-sd * 6.0) * 0.25) * uSun;
  col += vec3(1.0, 0.8, 0.5) * sea * exp(-abs(p.x - 0.375) * 30.0) * (0.5 + 0.5 * sin(p.y * 300.0 - uT * 4.0)) * 0.4 * uSun;
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── the night pad, the humming panes, glass chimes and a dawn chorus ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function dawn(ac) {
  const master = ac.createGain(); master.gain.value = 1; master.connect(ac.destination);
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(master);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(master);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const panner = (p, dest) => { if (!ac.createStereoPanner) return { node: dest, pan: null }; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return { node: n, pan: n.pan }; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.005, out = bus, p = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(panner(p, out).node); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, { freq = 1000, type = 'lowpass', q = 1, vol = 0.1, sweep = 0, att = 0.5, p = 0, out = bus } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q; if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(panner(p, out).node); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  // each pane's hum: two soft sines a hair apart (a slow beat, like a wine glass), panned to its side
  const hums = PANES.map(P => {
    const g = ac.createGain(); g.gain.value = 0; const pn = panner(P.u * 1.7 - 0.85, fx); g.connect(pn.node);
    const f = midi(P.m), o1 = ac.createOscillator(), o2 = ac.createOscillator(); o1.frequency.value = f; o2.frequency.value = f * 1.004; o2.type = 'triangle';
    const g2 = ac.createGain(); g2.gain.value = 0.35; o1.connect(g); o2.connect(g2).connect(g); o1.start(); o2.start();
    return { g, o1, o2 };
  });
  const CH = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 50, 55, 59], [45, 52, 57, 61]];
  let next = 0, step = 0, timer = null, waveT = 0, day = 0;
  function schedule() {
    while (next < ac.currentTime + 0.2) { const ch = CH[step % 4]; ch.forEach((m, i) => tone(next + i * 0.15, midi(m), 5.5, { vol: 0.016 + 0.016 * day, att: 1.2 })); next += 4.8; step++; }
    if (ac.currentTime > waveT) { waveT = ac.currentTime + 6 + Math.random() * 2; noise(ac.currentTime + 0.05, 3.5, { freq: 380, vol: 0.09, att: 1.5, sweep: 900 }); }
    // birds wake as the day comes
    if (Math.random() < 0.02 * day * day) { const t = ac.currentTime + 0.05, f = 2200 + Math.random() * 1200, p = Math.random() * 1.6 - 0.8; for (let i = 0; i < 3; i++) tone(t + i * 0.09, f * (1 + i * 0.08), 0.07, { vol: 0.025, out: fx, p }); }
  }
  return {
    start() { if (timer) return; next = ac.currentTime + 0.1; timer = setInterval(schedule, 60); schedule(); bus.gain.setTargetAtTime(0.8, ac.currentTime, 1.5); },
    day(v) { day = v; },
    hum(i, v) { hums[i].g.gain.setTargetAtTime(v, ac.currentTime, 0.08); },
    // a little glass crackle as light spreads under your finger
    spark(u, v) { const m = 81 + [0, 2, 4, 7, 9, 12][Math.floor(Math.random() * 6)] - Math.round(v * 12); tone(ac.currentTime + 0.01, midi(m), 0.5, { vol: 0.02, out: fx, p: u * 1.6 - 0.8 }); },
    // a pane lights: a bright glass chord from its side
    ring(i) { const t = ac.currentTime + 0.02, P = PANES[i], p = P.u * 1.6 - 0.8;
      [0, 4, 7, 12, 16].forEach((k, j) => { tone(t + j * 0.07, midi(P.m + k), 2.4, { type: 'triangle', vol: 0.045, out: fx, p }); tone(t + j * 0.07, midi(P.m + k) * 2.76, 0.6, { vol: 0.01, out: fx, p }); }); },
    cloud() { noise(ac.currentTime + 0.05, 3, { freq: 250, vol: 0.16, att: 1 }); tone(ac.currentTime + 0.1, midi(45), 3, { type: 'triangle', vol: 0.03, att: 1, out: fx }); },
    sunrise() { const t = ac.currentTime + 0.1; [62, 66, 69, 74, 78, 81, 86].forEach((m, i) => tone(t + i * 0.22, midi(m), 4.5, { type: 'triangle', vol: 0.05, att: 0.1, out: fx, p: -0.6 + i * 0.2 })); },
    hush() { master.gain.setTargetAtTime(0.3, ac.currentTime, 0.6); },
    volume(v) { master.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    stop() { clearInterval(timer); timer = null; try { master.gain.setTargetAtTime(0, ac.currentTime, 0.1); setTimeout(() => hums.forEach(h => { try { h.o1.stop(); h.o2.stop(); } catch (e) {} }), 400); } catch (e) {} },
  };
}

export function lightTheGlassGame() {
  let G = null;
  const later = (secs, fn) => G.queue.push({ t: secs, fn });

  // which pane is at (u, v)? (later panes sit on top, as in the pane map)
  function paneAt(u, v) { for (let i = PANES.length - 1; i >= 0; i--) { const P = PANES[i], x = (u - P.u) / P.rx, y = (v - P.v) / P.ry; if (x * x + y * y <= 1) return i; } return -1; }
  function brush(u, v, amt) {
    const g = G.lg, r = BRUSH * N, x = u * N, y = v * N;
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${amt})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over';
    G.lightTex.needsUpdate = true;
  }
  function clearPane(i) {   // the down moment: the rubbed light in this pane fades
    const P = PANES[i], g = G.lg; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000';
    g.beginPath(); g.ellipse(P.u * N, P.v * N, P.rx * N * 1.1, P.ry * N * 1.1, 0, 0, Math.PI * 2); g.fill(); g.restore(); G.lightTex.needsUpdate = true;
  }
  function panel() {
    G.ui.panel('Light the glass', `${G.lit} <small>of ${PANES.length} panes</small>`, { segs: [G.lit, PANES.length], sub: G.lastName || 'Follow the hum' });
  }
  function aim() {
    if (G.touch) return G.touch;
    if (G.bot) return G.botAim;
    return null;
  }
  function lightPane(i) {
    const S = G.st[i]; S.done = true; S.to = 1; G.lit++; G.lastName = PANES[i].name.replace('.', ''); G.idle = 0;
    G.band.ring(i); G.band.hum(i, 0); G.buzz && G.buzz([30, 30, 60]);
    const [x, y] = G.S.P(PANES[i].u, PANES[i].v); G.fx.add(x, y, '#ffd28a', 22, 0.3);
    G.say(PANES[i].name + ' ' + NUM[G.lit - 1]);
    panel();
    if (G.lit >= PANES.length) { G.phase = 'sunrise'; later(2.6, sunrise); return; }
    // halfway: the down moment
    if (G.lit === 4 && !G.cloudDone) { G.cloudDone = true; G.phase = 'cloud'; later(2.4, downMoment); }
  }
  function downMoment() {
    // the cloud covers the two lit panes highest in the window
    const lit = G.st.map((s, i) => i).filter(i => G.st[i].done).sort((a, b) => PANES[a].v - PANES[b].v).slice(0, 2);
    lit.forEach(i => { const S = G.st[i]; S.done = false; S.to = 0; S.rub = 0; clearPane(i); });
    G.lit -= lit.length; G.lastName = 'A down moment'; panel();
    G.cloud = { t: 0 }; G.band.cloud();
    G.say('A down moment. That’s okay. Light it again.');
    G.ui.alert('A down moment', 'That’s okay. Light it again.', 3, 'black');
    later(2.5, () => { if (G.phase === 'cloud') G.phase = 'play'; });
  }
  function listen() {   // each dark pane hums in turn, from its side
    if (G.phase !== 'play' && G.phase !== 'cloud') return;
    G.idle = 0;
    const dark = G.st.map((s, i) => i).filter(i => !G.st[i].done);
    dark.forEach((i, k) => later(k * 0.75, () => { G.st[i].call = 0.7; }));
  }
  function sunrise() {
    G.phase = 'end'; G.band.sunrise(); G.ui.buttons([]);
    G.say('Good morning.');
    later(6, () => {
      K.finale(G, { won: true, kicker: 'Light the glass', title: 'A new day', line: G.work && G.work.quote,
        cells: [{ k: 'Panes lit', v: `${PANES.length} of ${PANES.length}` }], say: 'A new day.' });
      G.endT = 0;
    });
  }

  return {
    title: 'Light the glass',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', lit: 0, lastName: '', day: 0, sun: 0, cloud: null, cloudK: 0, cloudDone: false, touch: null, sparkT: 0, idle: 0, hints: 0,
        queue: [], botAim: [0.5, 0.5], botT: 0, endT: 0, artist: null,
        st: PANES.map(() => ({ rub: 0, done: false, lit: 0, to: 0, hum: 0, call: 0 })) });
      G.band = dawn(K.audio());
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
      const cv = document.createElement('canvas'); cv.width = cv.height = N; G.lg = cv.getContext('2d', { willReadFrequently: true }); G.lg.fillStyle = '#000'; G.lg.fillRect(0, 0, N, N);
      G.lightTex = new THREE.CanvasTexture(cv); G.lightTex.colorSpace = THREE.NoColorSpace;
      G.uni = { map: { value: null }, light: { value: G.lightTex }, uPane: { value: PANES.map(P => new THREE.Vector4(P.u, P.v, P.rx, P.ry)) }, uT: { value: 0 }, uA: { value: 0 }, uH: { value: G.h }, uDay: { value: 0 }, uSun: { value: 0 }, uCloud: { value: 0 },
        uLit: { value: PANES.map(() => 0) }, uHum: { value: PANES.map(() => 0) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.root.add(G.face); G.face.visible = false;
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      G.ring = K.sprite(K.glowTex, 0.12, { color: '#ffd9a0', additive: true, order: 20, opacity: 0 }); G.root.add(G.ring);
      G.onGo = () => {
        G.phase = 'play'; G.band.start(); panel();
        G.ui.buttons([{ label: 'Listen', icon: '♪', kind: 'black', aria: 'Hear where the dark glass is: each dark pane hums in turn, from its side', press: () => listen() }]);
      };
      K.intro(G, { title: 'Light the glass', how: 'It’s night. Rub the dark glass to light it. Follow the hum.',
        say: 'Light the glass. It’s night. Rub the dark glass to light it. Follow the hum.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.queue.length) { const due = []; G.queue = G.queue.filter(q => (q.t -= dt) > 0 || (due.push(q), false)); due.forEach(q => G && q.fn()); if (!G) return; }
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 2.5) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); } }
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      const playing = G.phase === 'play' || G.phase === 'cloud';
      // the robot goes to the nearest dark pane and rubs it
      if (G.bot && playing) {
        const dark = G.st.map((s, i) => i).filter(i => !G.st[i].done);
        if (dark.length) { const i = dark[0], P = PANES[i]; G.botT += dt * 7; G.botAim = [P.u + Math.sin(G.botT) * P.rx * 0.45, P.v + Math.cos(G.botT * 0.7) * P.ry * 0.45]; }
      }
      const a = playing ? aim() : null;
      if (a) {
        const i = paneAt(a[0], a[1]);
        if (i >= 0 && !G.st[i].done && G.phase === 'play') {
          brush(a[0], a[1], 0.5); G.st[i].rub += dt / RUB;
          G.sparkT -= dt; if (G.sparkT <= 0) { G.sparkT = 0.13; G.band.spark(a[0], a[1]); }
          if (G.st[i].rub >= 1) lightPane(i);
        }
        const [x, y] = G.S.P(a[0], a[1]); G.ring.position.set(x, y, 0.06); G.ring.material.opacity = i >= 0 && !G.st[i].done ? 0.6 : 0.25;
      } else G.ring.material.opacity *= Math.pow(0.05, dt);
      // the hint, if nothing's been lit for a while
      if (G.phase === 'play' && !G.bot) { G.idle += dt; if (G.idle > HINT_AFTER) { G.idle = 0; if (G.hints++ < 3) { G.say('Rub where it hums.'); listen(); } } }
      // each pane: its light, and its hum (soft everywhere, louder near your finger, loud when Listen calls it)
      G.st.forEach((S, i) => {
        S.lit += (S.to - S.lit) * Math.min(1, dt * (S.to ? 1.6 : 0.8)); u.uLit.value[i] = S.lit;
        S.call = Math.max(0, S.call - dt);
        let h = 0;
        if (!S.done && playing) {
          const P = PANES[i]; let near = 0;
          if (a) { const dx = (a[0] - P.u) / (P.rx + 0.12), dy = (a[1] - P.v) / (P.ry + 0.12); near = Math.exp(-(dx * dx + dy * dy) * 1.5); }
          h = 0.006 + 0.04 * near + (S.call > 0 ? 0.06 * Math.sin(Math.PI * S.call / 0.7) : 0);
        }
        S.hum += (h - S.hum) * Math.min(1, dt * 8); G.band.hum(i, S.hum);
        u.uHum.value[i] = Math.min(1, S.hum * 14) * (0.75 + 0.25 * Math.sin(G.t * 2.2 + i));
      });
      G.band.day(G.lit / PANES.length);
      // the cloud of a down moment passes
      if (G.cloud) { G.cloud.t += dt; G.cloudK = Math.sin(Math.min(1, G.cloud.t / 4) * Math.PI); if (G.cloud.t > 4) G.cloud = null; } else G.cloudK = 0;
      u.uCloud.value = G.cloudK;
      if (G.phase === 'end') { G.day = Math.min(1, G.day + dt * 0.35); G.sun = Math.min(1, G.sun + dt * 0.25); G.band.day(1); }
      u.uDay.value = G.day; u.uSun.value = G.sun;
    },
    pointer(kind, ev) {
      if (!G || (G.phase !== 'play' && G.phase !== 'cloud')) return;
      if (kind === 'down' || (kind === 'move' && G.touch)) { const p = G.S.toBoard(ev, G.root); if (p) G.touch = [p.u, p.v]; }
      if (kind === 'up') G.touch = null;
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(G.artist ? 0.3 : 1); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'newday', playing: G.playing, over: G.over, phase: G.phase, lit: G.lit, cloud: !!G.cloud, sun: +G.sun.toFixed(2),
      artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
