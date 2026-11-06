// WHERE PEOPLE ARE (Sophia Dunn-Walker): ASK FIRST.
// "Let the individual tell you what they need… there's such a range in what people need and where people are."
// Sophia's great round amphitheater comes alive: its rings slowly turn like a record, each at its own speed, carrying
// all her little people round with them. Five of the people in the painting (one on each ring) hum, one at a time, from where they are
// (you hear which side). Tap them (or press Find them) and they step forward in a big round close-up, cut from the
// painting, and tell you what they need in one short line. Only then do the answer buttons appear: An arm · Quiet ·
// Hello. Give them what they asked for. You go ring by ring, from the people standing alone at the edge down to the
// very centre, and each ring glows gold once everyone on it has been heard. Some people need nothing at all.
// Everything is drawn from the painting itself with shaders (no extra pictures needed).
import * as THREE from 'three';
import * as K from './kit.js';

const C = [0.5, 0.497];   // the centre of the rings (u, v)
// the rings: outer edge radius of each, and how fast each turns (radians a second)
const RINGS = [
  { id: 'edge', name: 'the edge', r0: 0.415, r1: 0.49, speed: 0 },
  { id: 'outer', name: 'the outer ring', r0: 0.305, r1: 0.415, speed: 0.035 },
  { id: 'middle', name: 'the middle ring', r0: 0.215, r1: 0.305, speed: -0.05 },
  { id: 'inner', name: 'the inner ring', r0: 0.125, r1: 0.215, speed: 0.07 },
  { id: 'centre', name: 'the centre', r0: 0, r1: 0.125, speed: -0.1 },
];
// (no words are drawn over the painting: what each person says is spoken and shown in the panel above it)
// five people in the painting, one on each ring (pixels of the 768 painting), the ring they're on, what they say, and what they need
const PEOPLE = [
  { x: 388, y: 42, ring: 0, need: 'hello', short: 'Just say hello', line: 'I like it up here on my own. Just say hello.', voice: 196 },
  { x: 395, y: 100, ring: 1, need: 'arm', short: 'Your arm, please', line: 'Could I take your arm on these steps?', voice: 220 },
  { x: 400, y: 200, ring: 2, need: 'quiet', short: 'Somewhere quiet', line: 'So many voices. Somewhere quiet, please.', voice: 247 },
  { x: 384, y: 250, ring: 3, need: 'hello', short: 'Just say hello', line: 'Hi! I do not need anything. Just say hello.', voice: 330 },
  { x: 370, y: 350, ring: 4, need: 'arm', short: 'An arm, please', line: 'Will you walk me to the very middle? I would love an arm.', voice: 208 },
];
const ANS = [
  { id: 'arm', label: 'An arm', kind: 'black', said: 'Here is my arm.' },
  { id: 'quiet', label: 'Quiet', kind: 'black', said: 'Let us find a quiet spot.' },
  { id: 'hello', label: 'Hello', kind: 'red', said: 'Hello!' },
];
const HUM_EVERY = 3.2;

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uA, uT, uA1, uA2, uA3, uA4, uAll;
uniform float uG[5];
uniform vec3 uP;
const vec2 C = vec2(${C[0]}, ${C[1]});
vec3 at(vec2 p){ return texture2D(map, vec2(clamp(p.x, 0.001, 0.999), 1.0 - clamp(p.y, 0.001, 0.999))).rgb; }
float angAt(float r){
  float a = uA4;
  a = mix(a, uA3, smoothstep(0.119, 0.131, r));
  a = mix(a, uA2, smoothstep(0.209, 0.221, r));
  a = mix(a, uA1, smoothstep(0.299, 0.311, r));
  a = mix(a, 0.0, smoothstep(0.405, 0.425, r));
  return a;
}
float bandOf(float r, float r0, float r1){ return smoothstep(r0 - 0.01, r0 + 0.01, r) * (1.0 - smoothstep(r1 - 0.01, r1 + 0.01, r)); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y), d = p - C;
  float r = length(d), a = -angAt(r);
  vec2 s = C + mat2(cos(a), -sin(a), sin(a), cos(a)) * d;   // each ring turns at its own speed
  vec3 col = at(s);
  // rings glow gold once everyone on them has been heard
  float g = uG[0] * bandOf(r, 0.415, 0.49) + uG[1] * bandOf(r, 0.305, 0.415) + uG[2] * bandOf(r, 0.215, 0.305) + uG[3] * bandOf(r, 0.125, 0.215) + uG[4] * bandOf(r, -0.1, 0.125);
  g = max(g, uAll * (1.0 - smoothstep(0.47, 0.5, r)));
  g *= 0.85 + 0.15 * sin(uT * 2.0 - r * 30.0);
  col = mix(col, col * vec3(1.12, 1.0, 0.72) + vec3(0.16, 0.1, 0.0), g * 0.55);
  // the person humming right now glows softly
  float dp = length(p - uP.xy);
  col += vec3(1.0, 0.92, 0.7) * uP.z * smoothstep(0.07, 0.0, dp) * 0.38;
  gl_FragColor = vec4(col, uA);
}`;
// the close-up: a round window onto the painting, zoomed in on the person, with a white rim
const ZOOM_FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform vec2 uC;
uniform float uSpan, uA, uRot;
void main(){
  vec2 q = vUv - 0.5; float r = length(q);
  if (r > 0.5) discard;
  vec2 d = vec2(q.x, -q.y) * uSpan;
  float a = -uRot; d = mat2(cos(a), -sin(a), sin(a), cos(a)) * d;
  vec2 s = uC + d;
  vec3 col = texture2D(map, vec2(clamp(s.x, 0.001, 0.999), 1.0 - clamp(s.y, 0.001, 0.999))).rgb;
  col = mix(col, vec3(1.0), smoothstep(0.43, 0.45, r));
  col = mix(col, vec3(0.0), smoothstep(0.485, 0.5, r));
  gl_FragColor = vec4(col, uA);
}`;

/* ───────────────────────── music: a gentle walk in three ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [[50, 57, 62, 66], [52, 59, 64, 67], [47, 54, 59, 62], [45, 52, 57, 61]];
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < d.length; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, out = bus, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, out)); o.start(t); o.stop(t + dur + 0.03);
  }
  // the murmur of the crowd, very soft
  const crowd = ac.createBufferSource(), cf = ac.createBiquadFilter(), cg = ac.createGain(); crowd.buffer = nb; crowd.loop = true; cf.type = 'bandpass'; cf.frequency.value = 500; cf.Q.value = 0.6; cg.gain.value = 0.12;
  crowd.connect(cf).connect(cg).connect(bus); let crowdOn = false;
  const beat = 60 / 84;
  let next = 0, step = 0, timer = null, lit = 0;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b = step % 3, bar = Math.floor(step / 3), ch = CHORDS[bar % 4];
      if (b === 0) tone(t, midi(ch[0] - 12), beat * 2.8, { type: 'triangle', vol: 0.13, att: 0.04 });
      tone(t, midi(ch[1 + b] + 12), beat * 1.6, { type: 'triangle', vol: 0.03 + lit * 0.004, att: 0.006, p: (b - 1) * 0.4 });
      if (lit > 2 && b === 2) tone(t + beat / 2, midi(ch[3] + 24), beat, { vol: 0.02 });
      next += beat; step++;
    }
  }
  return {
    start() { if (timer) return; if (!crowdOn) { crowd.start(); crowdOn = true; } next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.8); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.25); },
    lit(n) { lit = n; },
    // a person humming two notes from where they stand
    hum(f, p, near = 1) {
      const t = ac.currentTime + 0.02;
      [[0, 1], [0.34, 1.26]].forEach(([at, k]) => {
        const o = ac.createOscillator(), g = ac.createGain(), bp = ac.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * k, t + at);
        bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 2.5;
        g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(0.22 * near, t + at + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.32);
        o.connect(bp).connect(g).connect(pan(p, fx)); o.start(t + at); o.stop(t + at + 0.4);
      });
    },
    step(p) { const t = ac.currentTime + 0.01; tone(t, 660, 0.2, { type: 'triangle', vol: 0.06, p, out: fx }); tone(t + 0.08, 990, 0.25, { type: 'triangle', vol: 0.05, p, out: fx }); },
    ok(p, n) { const t = ac.currentTime + 0.01; [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.07, midi(69 + d + (n % 4)), 0.7, { type: 'triangle', vol: 0.07, p, out: fx })); },
    no(p) { const t = ac.currentTime + 0.01; tone(t, 330, 0.18, { type: 'triangle', vol: 0.06, p, out: fx }); tone(t + 0.16, 294, 0.3, { type: 'triangle', vol: 0.06, p, out: fx }); },
    glow() { const t = ac.currentTime + 0.05; [62, 66, 69, 74, 78].forEach((m, i) => tone(t + i * 0.09, midi(m + 12), 1.6, { vol: 0.04, out: fx })); },
    finale() { const t = ac.currentTime + 0.1; [50, 57, 62, 66, 69, 74, 78, 81].forEach((m, i) => tone(t + i * 0.15, midi(m), 3.5, { type: 'triangle', vol: 0.05, att: 0.05, out: fx })); },
    stop() { clearInterval(timer); timer = null; try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); if (crowdOn) crowd.stop(ac.currentTime + 0.3); } catch (e) {} },
  };
}

export function askFirstGame() {
  let G = null;
  const rot = (u, v, a) => { const dx = u - C[0], dy = v - C[1], c = Math.cos(a), s = Math.sin(a); return [C[0] + c * dx - s * dy, C[1] + s * dx + c * dy]; };
  // where a person is right now (their ring has turned)
  const posOf = (p) => rot(p.u, p.v, -G.ang[p.ring]);
  const sideOf = (u) => u < 0.38 ? 'on the left' : u > 0.62 ? 'on the right' : (G.focus && posOf(G.focus)[1] < 0.5 ? 'near the top' : 'near the bottom');

  function hud() {
    const n = G.done, sub = G.phase === 'ask' ? `They asked: “${G.focus.short}”` : G.phase === 'find' ? `Someone is humming ${sideOf(posOf(G.focus)[0])}. Tap them.` : n >= PEOPLE.length ? 'Everyone has been heard' : 'Listen for the next person…';
    G.ui.panel('Ask first', `${n}<small>of ${PEOPLE.length} heard</small>`, { segs: [n, PEOPLE.length], sub });
  }
  function findButtons() {
    G.ui.buttons([
      { label: 'Listen', kind: 'black', aria: 'Hear them hum again', press: () => { if (G.phase === 'find') hum(); } },
      { label: 'Find them', kind: 'red', aria: 'Go to the person humming', press: () => { if (G.phase === 'find') { G.hints++; meet(); } } },
    ]);
  }
  function askButtons() { G.ui.buttons(ANS.map((a, i) => ({ label: a.label, kind: a.kind, aria: a.label, press: () => answer(i) }))); }
  function nextPerson() {
    G.focus = G.people[G.done]; G.phase = 'find'; G.humT = 0.4; G.findT = 0;
    if (G.focus.ring !== G.lastRing) { G.lastRing = G.focus.ring; G.say(G.done ? `Now, ${RINGS[G.focus.ring].name}.` : `First, ${RINGS[G.focus.ring].name}.`); }
    findButtons(); hud();
  }
  function hum() {
    const [u] = posOf(G.focus); G.band.hum(G.focus.voice, (u - 0.5) * 1.8); G.humGlow = 1; G.humT = HUM_EVERY;
  }
  function meet() {
    G.phase = 'ask'; G.askT = 0; G.zoomA = 0;
    const [u, v] = posOf(G.focus); G.band.step((u - 0.5) * 1.6);
    G.say(G.focus.line);
    askButtons(); hud();
  }
  function answer(i) {
    if (!G || G.phase !== 'ask' || G.over) return;
    const a = ANS[i], p = G.focus, [u, v] = posOf(p), pan = (u - 0.5) * 1.6;
    if (a.id === p.need) {
      G.phase = 'walk'; G.done++; G.band.ok(pan, G.done); G.buzz([30, 30, 60]);
      const [x, y] = G.S.P(u, v); G.fx.add(x, y, '#ffd982', 22, 0.3);
      G.ui.hideAlert(); G.ui.buttons([]);
      p.done = true;
      const ringDone = G.people.filter(q => q.ring === p.ring).every(q => q.done);
      if (ringDone) { G.glowT[p.ring] = 1; G.band.glow(); }
      G.band.lit(G.done);
      const left = PEOPLE.length - G.done;
      if (!left) { G.say(`${a.said} Everyone has been heard.`); G.endT = 0; G.band.finale(); hud(); return; }
      G.say(`${a.said} ${left} more.`); G.waitT = 2.4; hud();
    } else {
      G.misses++; G.band.no(pan); G.buzz([20, 40, 20]);
      G.say(`That is not what I asked for. ${p.line}`);
    }
  }
  function tapAt(u, v) {
    if (G.phase !== 'find') return;
    const [pu, pv] = posOf(G.focus);
    if (Math.hypot(u - pu, (v - pv) * G.h) < 0.11) meet();
    else { G.band.no((u - 0.5) * 1.6); hum(); }   // not them: they hum again so you can follow the sound
  }

  return {
    title: 'Ask first',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      const ppx = 768;
      Object.assign(G, { phase: 'intro', done: 0, misses: 0, hints: 0, focus: null, lastRing: -1, humT: -1, waitT: -1, endT: -1, askT: 0, findT: 0, humGlow: 0, zoomA: 0, t0: 0, botT: 0,
        ang: RINGS.map(() => 0), glow: RINGS.map(() => 0), glowT: RINGS.map(() => 0), all: 0, spin: 1 });
      G.people = PEOPLE.map(P => ({ ...P, u: P.x / ppx, v: P.y / ppx, done: false }));
      G.band = band(K.audio());
      G.uni = { map: { value: null }, uA: { value: 0 }, uT: { value: 0 }, uA1: { value: 0 }, uA2: { value: 0 }, uA3: { value: 0 }, uA4: { value: 0 }, uAll: { value: 0 },
        uG: { value: [0, 0, 0, 0, 0] }, uP: { value: new THREE.Vector3(0.5, 0.5, 0) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.02; G.face.renderOrder = 11; G.root.add(G.face);
      // the close-up of whoever is talking
      G.zu = { map: { value: null }, uC: { value: new THREE.Vector2(0.5, 0.5) }, uSpan: { value: 0.11 }, uA: { value: 0 }, uRot: { value: 0 } };
      G.zoom = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.ShaderMaterial({ uniforms: G.zu, vertexShader: VERT, fragmentShader: ZOOM_FRAG, transparent: true, depthWrite: false }));
      G.zoom.position.z = 0.07; G.zoom.renderOrder = 40; G.zoom.visible = false; G.root.add(G.zoom);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.zu.map.value = t; G.ready = true; });
      // a ring that pulses around whoever is humming
      G.ring = K.sprite(K.ringTex, 0.1, { color: '#fff1c2', opacity: 0, order: 25 }); G.ring.position.z = 0.05; G.root.add(G.ring);
      // a beacon on whoever is humming, so they're easy to find: a soft dark halo, a bright red ring that breathes, and red ripples
      G.halo = K.sprite(K.glowTex, 0.2, { color: '#000000', opacity: 0, order: 23 }); G.halo.position.z = 0.048; G.root.add(G.halo);
      G.rips = [0, 1, 2].map(() => { const r = K.sprite(K.ringTex, 0.1, { color: '#ec3013', opacity: 0, order: 24 }); r.position.z = 0.049; G.root.add(r); return r; });
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.start(); nextPerson(); };
      K.intro(G, { title: 'Ask first', how: 'Find each person who hums, and let them tell you what they need. Then give them exactly that.',
        say: 'Ask first. Sophia’s circle is full of people, and each one needs something different. When someone hums, tap them, or press Find them. Let them tell you what they need. Then give them exactly that.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni;
      U.uA.value += ((G.ready ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2.5); U.uT.value = G.t;
      // the rings turn, each at its own speed; at the end they all turn together
      RINGS.forEach((R, i) => { const sp = G.endT >= 0 ? 0.12 : R.speed; G.ang[i] += sp * dt * (i ? 1 : 0); });
      U.uA1.value = G.ang[1]; U.uA2.value = G.ang[2]; U.uA3.value = G.ang[3]; U.uA4.value = G.ang[4];
      RINGS.forEach((R, i) => { G.glow[i] += (G.glowT[i] - G.glow[i]) * Math.min(1, dt * 1.5); U.uG.value[i] = G.glow[i]; });
      // timers
      if (G.waitT > 0) { G.waitT -= dt; if (G.waitT <= 0) nextPerson(); }
      if (G.phase === 'find') { G.findT += dt; G.humT -= dt; if (G.humT <= 0) hum(); }
      if (G.phase === 'ask') G.askT += dt;
      if (G.bot) {
        G.botT -= dt;
        if (G.phase === 'find' && G.findT > 1.2 && G.botT <= 0) { G.botT = 0.6; const [u, v] = posOf(G.focus); tapAt(u, v); }
        if (G.phase === 'ask' && G.askT > 1.6 && G.botT <= 0) { G.botT = 0.6; answer(ANS.findIndex(a => a.id === G.focus.need)); }
      }
      // who's humming glows, with a ring around them
      G.humGlow = Math.max(G.phase === 'find' ? 0.25 : 0, G.humGlow - dt * 0.9);
      if (G.focus && !G.over) {
        const [u, v] = posOf(G.focus), [x, y] = G.S.P(u, v);
        U.uP.value.set(u, v, G.phase === 'find' ? G.humGlow : G.phase === 'ask' ? 0.6 : Math.max(0, U.uP.value.z - dt));
        const finding = G.phase === 'find', beat = 0.5 + 0.5 * Math.sin(G.t * 5.5);
        G.ring.position.set(x, y, 0.05); G.ring.scale.setScalar(0.075 + beat * 0.02 + G.humGlow * 0.03);
        G.ring.material.color.set(finding ? '#ec3013' : '#fff1c2'); G.ring.material.opacity = finding ? 1 : 0;
        G.halo.position.set(x, y, 0.048); G.halo.scale.setScalar(0.2 + beat * 0.04); G.halo.material.opacity = finding ? 0.35 + beat * 0.15 : 0;
        G.rips.forEach((r, i) => { const k = (G.t * 0.7 + i / 3) % 1; r.position.set(x, y, 0.049); r.scale.setScalar(0.08 + k * 0.22); r.material.opacity = finding ? (1 - k) * 0.85 : 0; });
        U.uP.value.z = finding ? Math.max(G.humGlow, 0.55 + 0.45 * beat) : U.uP.value.z;
        // the close-up: a round window onto them, next to where they stand, turning with their ring
        const showZ = G.phase === 'ask' ? 1 : 0; G.zoomA += (showZ - G.zoomA) * Math.min(1, dt * 5);
        G.zoom.visible = G.zoomA > 0.02; G.zu.uA.value = Math.min(1, G.zoomA * 1.2);
        G.zu.uC.value.set(G.focus.u, G.focus.v); G.zu.uRot.value = G.ang[G.focus.ring];
        const zu = Math.min(0.78, Math.max(0.22, u + (u < 0.5 ? 0.2 : -0.2))), zv = Math.min(0.78, Math.max(0.22, v + (v < 0.5 ? 0.18 : -0.18)));
        const [zx, zy] = G.S.P(zu, zv); G.zoom.position.set(zx, zy + Math.sin(G.t * 2) * 0.004, 0.07); G.zoom.scale.setScalar(0.6 + 0.4 * G.zoomA);
      } else { G.ring.material.opacity = 0; G.halo.material.opacity = 0; G.rips.forEach(r => { r.material.opacity = 0; }); G.zu.uA.value = 0; G.zoom.visible = false; U.uP.value.z = 0; }
      // the end: the whole circle glows and turns as one
      if (G.endT >= 0) {
        G.endT += dt; G.all = Math.min(1, G.endT / 2.5); U.uAll.value = G.all;
        if (G.endT > 3.4 && !G.over) {
          const t = Math.round(G.t - G.t0), r = K.best('where-people-are:ask', G.misses, 'lower');
          G.ui.hideAlert(); G.focus = null;
          K.finale(G, { won: true, kicker: 'Everyone heard', title: 'You asked first', line: G.work && G.work.quote, best: r.isBest,
            cells: [{ k: 'Heard', v: `${PEOPLE.length}/${PEOPLE.length}` }, { k: 'Misses', v: String(G.misses) }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const p = G.S.toBoard(ev, G.root); if (p) tapAt(p.u, p.v);
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.8); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'ask-first', playing: G.playing, over: G.over, phase: G.phase, done: G.done, misses: G.misses, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.band) G.band.stop(); K.cleanup(G); G = null; },
  };
}
