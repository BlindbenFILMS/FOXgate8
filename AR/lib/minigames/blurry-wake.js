// BEAUTY IN THE BLURRY (Delric Pollins): BRING THE BLUR TO LIFE.
// "There's beauty in the blurry. When the details fade, you start to feel the world instead of just seeing it."
// Delric's night street is asleep: dim, grey and still, with only the rain. Drag a finger across the painting and it
// wakes under your touch: wherever you go the street brightens, the colour comes back, and the wet road ripples.
// Seven lights are sleeping in the painting (the neon sign, the shop windows on both sides, the street lamps, the
// billboard, the cars, the wet road). Hold your finger on one and it wakes: it glows for good, and adds its part to
// the music (bass, chords, a twinkling arpeggio, a soft pad, a beat, a melody, rain and water). When all seven
// are awake, the whole street sings and glows. There are no wrong moves.
// For players who can't see where to go: the nearest sleeping light calls out from its side (louder when you're close),
// a rising tone tells you you're waking one, "Where next?" says which way to go, and "Glow" wakes one without dragging.
import * as THREE from 'three';
import * as K from './kit.js';

const midi = m => 440 * Math.pow(2, (m - 69) / 12);
// the seven sleeping lights: where they are in the painting (u, v, radius), their colour, the note they call with
const ZONES = [
  { id: 'neon',   name: 'The neon sign',             u: 0.15, v: 0.26, r: 0.14, color: '#3ff0e0', call: 784, where: 'on the left, up high' },
  { id: 'winL',   name: 'The shop windows',          u: 0.13, v: 0.48, r: 0.14, color: '#ffc04d', call: 523, where: 'on the left, in the middle' },
  { id: 'lamps',  name: 'The street lamps',          u: 0.35, v: 0.26, r: 0.11, color: '#ffb347', call: 1047, where: 'up top, a little left' },
  { id: 'sign',   name: 'The billboard',             u: 0.58, v: 0.33, r: 0.13, color: '#cfe2ff', call: 880, where: 'up top, in the middle' },
  { id: 'cars',   name: 'The cars',                  u: 0.63, v: 0.53, r: 0.12, color: '#ff4050', call: 196, where: 'in the middle, a little right' },
  { id: 'winR',   name: 'The windows on the right',  u: 0.85, v: 0.44, r: 0.14, color: '#ffd27a', call: 659, where: 'on the right' },
  { id: 'road',   name: 'The wet road',              u: 0.42, v: 0.82, r: 0.2,  color: '#5fb8ff', call: 262, where: 'down low' },
];
const WAKE_TIME = 0.75;  // seconds of touch to wake one (tracing over it wakes it faster still)
const REACH = 1.45;      // how far from a light (× its radius) your finger starts waking it
const TRACE = 3.2;       // how much moving your finger across a light adds (per unit of painting crossed)
// a ring that fills up around a light while you wake it: 24 shared steps
const ARCS = Array.from({ length: 25 }, (_, i) => K.canvasTex(128, 128, (g) => {
  g.lineCap = 'round'; g.lineWidth = 10; g.strokeStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
  if (i) { g.strokeStyle = '#fff'; g.lineWidth = 12; g.beginPath(); g.arc(64, 64, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * i / 24); g.stroke(); }
}));
const BPM = 84, STEP = 60 / BPM / 2;   // eighth notes
const CHORDS = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]];   // Am · F · C · G
const ROOTS = [45, 41, 48, 43];
const MELODY = [[0, 76], [2, 72], [3, 74], [6, 69]];   // [step, note] for each bar, moved to fit the chord

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
uniform sampler2D map; uniform vec4 zones[7]; uniform vec3 finger; uniform float time; uniform float wet; uniform float glow; uniform float ready;
varying vec2 vUv;
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);                       // painting space: u right, v down
  float road = smoothstep(0.56, 0.72, p.y);
  vec2 off = vec2(sin(p.y * 140.0 - time * 2.6 + sin(p.x * 18.0) * 2.0) * 0.0025 * wet * road, 0.0);
  float fd = distance(p, finger.xy);
  off += normalize(p - finger.xy + 1e-4) * sin(fd * 80.0 - time * 9.0) * exp(-fd * 11.0) * 0.006 * finger.z;
  vec3 col = texture2D(map, vUv + vec2(off.x, -off.y)).rgb;
  float light = 0.0;
  for (int i = 0; i < 7; i++) { float d = distance(p, zones[i].xy); light += zones[i].w * (1.0 - smoothstep(zones[i].z * 0.4, zones[i].z * 1.9, d)); }
  light += finger.z * exp(-fd * fd * 70.0) * 0.8;          // your touch is a soft light
  light = clamp(light + glow, 0.0, 1.25);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 asleep = mix(vec3(lum) * vec3(0.6, 0.68, 0.85), col, 0.15) * 0.62;   // dim and grey-blue, but still Delric's street
  vec3 awake = col * (1.0 + 0.1 * glow + 0.05 * sin(time * 1.3));
  gl_FragColor = vec4(mix(asleep, awake, clamp(light, 0.0, 1.0)) * (1.0 + max(0.0, light - 1.0)), ready);
}`;

export function bringTheBlurGame() {
  let G = null;

  /* ───────── the music: it grows as the street wakes ───────── */
  function rainStart() {
    const ac = K.audio(); if (!ac) return;
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; src.loop = true; f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.5; g.gain.value = 0;
    src.connect(f).connect(g).connect(ac.destination); src.start();
    G.rain = { src, g };
  }
  function on(id) { return G.zones.find(z => z.id === id).awake; }
  function step(i, at) {
    const ac = K.audio(); if (!ac) return;
    const delay = Math.max(0, at - ac.currentTime), s = i % 8, bar = Math.floor(i / 8) % 4, ch = CHORDS[bar], end = G.endT >= 0 ? 1.2 : 1;
    if (s === 0) K.chord(ch.map(m => midi(m - 12)), 2.6, { vol: 0.016, type: 'sine', spread: 0.1, delay });   // always: a quiet low pad
    if (on('neon') && (s === 0 || s === 5)) K.tone(midi(ROOTS[bar]), 0.55, { type: 'triangle', vol: 0.11 * end, pan: -0.5, delay });
    if (on('winL') && (s === 0 || s === 3)) K.chord(ch.map(midi), 0.5, { vol: 0.028 * end, type: 'triangle', spread: 0.015, pan: -0.7, delay });
    if (on('lamps')) K.tone(midi(ch[s % 3] + 12 + (s >= 4 ? 12 : 0)), 0.28, { vol: 0.03 * end, pan: -0.25, delay });
    if (on('sign') && s === 0) K.chord(ch.map(m => midi(m + 12)), 2.7, { vol: 0.02 * end, type: 'sine', spread: 0.2, pan: 0.15, delay });
    if (on('cars')) {
      if (s === 0 || s === 4) K.tone(62, 0.28, { vol: 0.26 * end, slide: -28, delay, pan: 0.3 });
      if (s % 2 === 1) K.noise(0.05, { vol: 0.05 * end, freq: 8000, type: 'highpass', delay, pan: 0.35 });
      if (s === 2 || s === 6) K.noise(0.12, { vol: 0.07 * end, freq: 1800, q: 0.8, delay, pan: 0.3 });
    }
    if (on('winR')) for (const [ms, n] of MELODY) if (ms === s) { const m = ch.includes(n - 12) || ch.includes(n - 24) ? n : n - 1; K.tone(midi(m), 0.5, { type: 'triangle', vol: 0.06 * end, pan: 0.7, delay }); }
    if (on('road') && Math.random() < 0.35) K.tone(midi(ch[Math.floor(Math.random() * 3)] + 24), 0.18, { vol: 0.025, pan: Math.random() * 1.6 - 0.8, delay, slide: 30 });
  }
  function music(dt) {
    const ac = K.audio(); if (!ac) return;
    if (G.nextT == null) { G.nextT = ac.currentTime + 0.1; G.stepI = 0; }
    while (G.nextT < ac.currentTime + 0.15) { step(G.stepI++, G.nextT); G.nextT += STEP; }
    if (G.rain) G.rain.g.gain.setTargetAtTime(0.025 + (on('road') ? 0.03 : 0), ac.currentTime, 0.5);
  }

  /* ───────── waking the street ───────── */
  const awakeN = () => G.zones.filter(z => z.awake).length;
  function hud() {
    const n = awakeN();
    G.ui.panel('Bring the blur to life', `${n}<small>of 7 lights awake</small>`,
      { segs: [n, 7], sub: n === 7 ? 'The whole street is alive' : 'Drag your finger across the painting' });
  }
  function nearestSleeping(u, v) {
    let best = null, bd = 9;
    for (const z of G.zones) if (!z.awake) { const d = Math.hypot(z.u - u, (z.v - v) * G.h); if (d < bd) { bd = d; best = z; } }
    return best && { z: best, d: bd };
  }
  function wake(z) {
    z.awake = true; z.charge = 1; z.burst = 1;
    const [x, y] = G.S.P(z.u, z.v), pan = (z.u - 0.5) * 1.6;
    G.fx.add(x, y, z.color, 26, 0.35); G.buzz([30, 40, 80]);
    K.chord([z.call, z.call * 1.25, z.call * 1.5].map(f => Math.min(f, 2000)), 1.4, { vol: 0.05, type: 'triangle', spread: 0.06, pan });
    K.sfx.whoosh(pan);
    G.ui.pop(z.name.replace(/^The /, '').toUpperCase() + '!');
    const left = 7 - awakeN();
    hud();
    if (left > 0) G.say(`${z.name} ${/s$|windows/.test(z.name) ? 'are' : 'is'} awake. ${left} more.`);   // 'The cars are awake.' · 'The billboard is awake.'
    else { G.say('The whole street is alive.'); G.endT = 0; G.ui.alert('The street is alive', 'All seven lights', 3, 'red'); G.buzz([60, 60, 160]); }
  }
  function charge(z, amount) {
    if (z.awake || G.over) return;
    z.charge = Math.min(1, z.charge + amount);
    if (G.t - z.tickT > 0.1) { z.tickT = G.t; K.tone(z.call * (0.5 + z.charge * 0.5), 0.11, { type: 'triangle', vol: 0.09 + z.charge * 0.08, pan: (z.u - 0.5) * 1.6 }); G.buzz(6); }   // a rising tone (and a tiny buzz): you're waking it
    if (z.charge >= 1) wake(z);
  }
  function whereNext() {
    if (!G.playing || G.over) return;
    const f = G.finger, n = nearestSleeping(f.seen ? f.u : 0.5, f.seen ? f.v : 0.5); if (!n) return;
    G.say(`Try ${n.z.where}.`); G.callT = 0; callOut(n.z, 0.12);
    G.ui.alert('Try ' + n.z.where, n.z.name, 2, 'blue'); n.z.flash = 1.2;
  }
  function glowPress() {   // for players who can't drag: each press wakes the next light a third of the way
    if (!G.playing || G.over) return;
    const f = G.finger, n = nearestSleeping(f.seen ? f.u : 0.5, f.seen ? f.v : 0.5); if (!n) return;
    n.z.tickT = -1; charge(n.z, 0.34); n.z.flash = 0.6;
    const [x, y] = G.S.P(n.z.u, n.z.v); G.fx.add(x, y, n.z.color, 8, 0.2);
  }
  function callOut(z, vol) { K.tone(z.call, 0.35, { vol, pan: (z.u - 0.5) * 1.8 }); K.tone(z.call * 2, 0.2, { vol: vol * 0.3, pan: (z.u - 0.5) * 1.8, delay: 0.05 }); }
  function trail(u, v) {   // a soft light left behind your finger
    const [x, y] = G.S.P(u, v), col = G.trailCols[G.trailI++ % G.trailCols.length];
    const s = K.sprite(K.glowTex, 0.09, { additive: true, opacity: 0.7, order: 25, color: col }); s.position.set(x, y, 0.04); G.root.add(s);
    G.trails.push({ s, t: 0 });
  }
  function touch(u, v) {
    const f = G.finger;
    if (f.seen && Math.hypot(u - f.u, v - f.v) > 0.012) trail(u, v);
    if (f.seen && f.down && G.playing) { const moved = Math.hypot(u - f.u, (v - f.v) * G.h);
      for (const z of G.zones) if (!z.awake && Math.hypot(z.u - u, (z.v - v) * G.h) < z.r * REACH) charge(z, Math.min(0.25, moved * TRACE)); }
    f.u = u; f.v = v; f.seen = true;
  }

  return {
    title: 'Bring the blur to life',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { zones: ZONES.map(z => ({ ...z, awake: false, charge: 0, tickT: 0, flash: 0, ph: Math.random() * 6 })),
        finger: { u: 0.5, v: 0.5, down: false, seen: false, str: 0 }, trails: [], trailCols: ['#ffc04d', '#5fb8ff', '#ff8a4d', '#3ff0e0'], trailI: 0,
        endT: -1, t0: 0, callT: 2, botZ: 0, rainDrops: [] });
      // the painting itself, asleep: a shader over it that dims it, greys it, and wakes it wherever there's light
      G.uni = { map: { value: null }, zones: { value: G.zones.map(() => new THREE.Vector4()) }, finger: { value: new THREE.Vector3(0.5, 0.5, 0) },
        time: { value: 0 }, wet: { value: 0.25 }, glow: { value: 0 }, ready: { value: 0 } };
      const mat = new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false });
      G.street = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), mat); G.street.position.z = 0.02; G.street.renderOrder = 11; G.root.add(G.street);
      new THREE.TextureLoader().load((ctx.work && ctx.work.image) || '', t => { if (!G) return; t.colorSpace = THREE.SRGBColorSpace; G.uni.map.value = t; G.ready = true; });
      // each light's glow, which stays once it's awake
      for (const z of G.zones) { z.glow = K.sprite(K.glowTex, z.r * 2.4, { additive: true, opacity: 0, order: 22, color: z.color }); z.glow.position.set(...G.S.P(z.u, z.v), 0.035); G.root.add(z.glow);
        z.ring = K.sprite(ARCS[0], z.r * 1.5, { opacity: 0, order: 26, color: z.color }); z.ring.position.set(...G.S.P(z.u, z.v), 0.05); G.root.add(z.ring); }
      // rain: thin streaks, more of them once the road is awake
      const streak = K.canvasTex(8, 64, g => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(220,235,255,.9)'); g.fillStyle = gr; g.fillRect(3, 0, 2, 64); });
      for (let i = 0; i < 46; i++) { const m = K.plane(streak, 0.004, 0.05, { additive: true, opacity: 0, order: 24 }); m.rotation.z = 0.12; G.root.add(m);
        G.rainDrops.push({ m, u: Math.random(), v: Math.random(), sp: 0.5 + Math.random() * 0.4, on: i < 14 }); }
      G.ui.buttons([
        { label: 'Where next?', kind: 'black', aria: 'Where is the next sleeping light?', press: () => whereNext() },
        { label: 'Glow', kind: 'red', aria: 'Glow: wake the nearest sleeping light without dragging', press: () => glowPress() },
      ]);
      hud();
      rainStart();
      G.onGo = () => { G.t0 = G.t; };
      K.intro(G, { title: 'Bring the blur to life', how: 'Delric’s night street is asleep. Drag your finger across the painting to wake it up. Hold it on a light to wake it for good. Wake all 7.',
        say: 'Bring the blur to life. Delric’s night street is asleep. Drag your finger across the painting to wake it up. When you are close to a sleeping light, you will hear it call. Hold your finger there, and it wakes up. Wake all 7 lights, and the whole street will sing. You can also press Glow.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.time.value = G.t; U.ready.value = Math.min(1, U.ready.value + (G.ready ? dt * 1.5 : 0));
      music(dt);
      // the bot: drags to each sleeping light in turn and holds there
      if (G.bot && G.playing && !G.over) {
        const z = G.zones.find(q => !q.awake);
        if (z) { G.finger.down = true; const f = G.finger, k = Math.min(1, dt * 4); touch(f.seen ? f.u + (z.u - f.u) * k : z.u, f.seen ? f.v + (z.v - f.v) * k : z.v); }
        else G.finger.down = false;
      }
      // your finger: a soft light that wakes whatever it's on
      const f = G.finger; f.str += ((f.down && G.playing ? 1 : 0) - f.str) * Math.min(1, dt * 8);
      U.finger.value.set(f.u, f.v, f.str);
      if (f.down && G.playing) { for (const z of G.zones) if (!z.awake && Math.hypot(z.u - f.u, (z.v - f.v) * G.h) < z.r * REACH) charge(z, dt / WAKE_TIME); }
      // the nearest sleeping light calls out from its side: louder when you're close (every 2.5 s, or 1 s while dragging nearby)
      G.callT -= dt;
      if (G.playing && !G.over && G.callT <= 0) {
        const n = nearestSleeping(f.seen ? f.u : 0.5, f.seen ? f.v : 0.5);
        if (n) { const close = Math.max(0, 1 - n.d / 0.7); callOut(n.z, 0.03 + close * 0.09); n.z.flash = Math.max(n.z.flash, 0.4); G.callT = f.down && close > 0.4 ? 1 : 2.5; }
      }
      // the lights: dim while asleep, glowing (and breathing) once awake, everything brighter at the end
      awakeN();
      G.zones.forEach((z, i) => {
        z.flash = Math.max(0, z.flash - dt);
        const lvl = z.awake ? 1 : z.charge * 0.9 + z.flash * 0.25;
        z.shown = (z.shown || 0) + (lvl - (z.shown || 0)) * Math.min(1, dt * 3);
        U.zones.value[i].set(z.u, z.v, z.r, z.shown);
        z.burst = Math.max(0, (z.burst || 0) - dt * 1.4);
        z.glow.material.opacity = Math.min(1, (z.awake ? 0.42 + Math.sin(G.t * 1.6 + z.ph) * 0.1 : z.charge * 0.6 + z.flash * 0.25) * (G.endT >= 0 ? 1.3 : 1) + z.burst * 0.6);
        z.glow.scale.setScalar(z.r * 2.4 * (1 + (z.awake ? Math.sin(G.t * 1.1 + z.ph) * 0.06 : 0) + z.burst * 0.8));
        // the waking ring: shows as soon as you start, fills up, then bursts outward and fades when it wakes
        z.ring.material.map = ARCS[Math.round((z.awake ? 1 : z.charge) * 24)];
        z.ring.material.opacity = z.awake ? z.burst : (z.charge > 0 ? 0.95 : 0);
        z.ring.scale.setScalar(z.r * 1.5 * (1 + (z.awake ? (1 - z.burst) * 0.9 : Math.sin(G.t * 8) * 0.03 * z.charge)));
      });
      U.wet.value += ((on('road') ? 1 : 0.25) - U.wet.value) * Math.min(1, dt);
      U.glow.value += ((G.endT >= 0 ? 1.1 : awakeN() * 0.07) - U.glow.value) * Math.min(1, dt * 0.8);   // each light wakes the whole street a little; at the end, all of it
      // the trail behind your finger fades away
      for (const tr of G.trails) { tr.t += dt; tr.s.material.opacity = 0.7 * Math.max(0, 1 - tr.t / 0.9); tr.s.scale.setScalar(0.09 + tr.t * 0.05); if (tr.t > 0.9 && !tr.gone) { tr.gone = true; G.root.remove(tr.s); } }
      G.trails = G.trails.filter(tr => !tr.gone);
      // rain
      const heavy = on('road') ? 1 : 0;
      for (const d of G.rainDrops) {
        d.v += d.sp * dt; if (d.v > 1.05) { d.v = -0.05; d.u = Math.random(); }
        const [x, y] = G.S.P(d.u, d.v); d.m.position.set(x, y, 0.045);
        d.m.material.opacity = (d.on || heavy ? 0.22 + heavy * 0.12 : 0) * Math.min(1, G.uni.ready.value);
      }
      // the finale: everything glows and sings, then the end panel
      if (G.endT >= 0) { G.endT += dt;
        if (G.endT > 5 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('beauty-in-the-blurry:wake', t, 'lower');
          K.finale(G, { won: true, title: 'The street is alive', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Lights', v: '7/7' }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        } }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over) return;
      if (kind === 'up') { G.finger.down = false; return; }
      if (kind === 'move' && !G.finger.down) return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      if (kind === 'down') { G.finger.down = true; K.audio(); G.finger.seen = false; }
      touch(Math.max(0, Math.min(1, p.u)), Math.max(0, Math.min(1, p.v)));
    },
    pause() { if (G) { G.paused = true; G.finger.down = false; } },
    resume() { if (G) { G.paused = false; G.nextT = null; } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'bring-the-blur', playing: G.playing, over: G.over, awake: G.zones.filter(z => z.awake).map(z => z.id), t: +G.t.toFixed(1) }; },
    stop() {
      if (G && G.rain) { try { const a = K.audio(); G.rain.g.gain.setTargetAtTime(0, a.currentTime, 0.2); G.rain.src.stop(a.currentTime + 1); } catch (e) {} }
      K.cleanup(G); G = null;
    },
  };
}
