// FIND YOUR VILLAGE (Steven McCoy): LIKE A MAGNET.
// "You think that you're alone, but eventually, like a magnet, you just start attracting everyone you're supposed to."
// The glowing crystal orb lifts out of the painting's face: that's you. It floats down to the bottom of the painting.
// Your people float down from the sky one at a time, each humming their own note from their side (left, middle or
// right), louder as they come. Steer LEFT or RIGHT to be right under them (or tap the left, middle or right of the
// screen) and, when they get close, they're pulled in like a magnet. Each one then flies up to their own spot on the
// floating land and stays there, glowing, and their hum joins a choir that grows with every friend. Miss someone and
// they float past and come back around later. The light spreads across the painting from the golden right side toward
// the dark face on the left as your village grows. Bring 10 people home, the orb floats back to its place in the
// face, and Steven says it in his own words.
import * as THREE from 'three';
import * as K from './kit.js';
import { thingCanvas, orbCanvas, PEOPLE, ORB } from './village-things.js';

// Steven McCoy reading his quote, in his own voice
const ARTIST = new URL('../../../3D/gallery/audio/art_3.mp3', import.meta.url).href;

const LANE_U = [0.22, 0.5, 0.78];                 // left, middle, right
const ROW_V = 0.84;                               // the orb's row near the bottom
const TOP_V = 0.05;
const PULL_V = 0.64;                              // close enough to be pulled in
const GOAL = 10;
const FALL = [5.6, 5.4, 5.2, 5.0, 4.7, 4.5, 4.4, 4.3, 4.2, 4.1];   // seconds to float down, a little quicker as you go
// each friend's spot on the floating land (u, v), filled in this order
const HOMES = [[0.30, 0.215], [0.17, 0.27], [0.42, 0.19], [0.60, 0.30], [0.47, 0.34], [0.22, 0.37], [0.72, 0.42], [0.83, 0.30], [0.62, 0.49], [0.38, 0.27]];
const NOTES = [62, 66, 69, 71, 74];               // each kind of person hums their own note (D major pentatonic)
const SIDE = ['On your left.', 'In the middle.', 'On your right.'];
const FOUND = {
  guitar: 'A guitar player found you.', painter: 'A painter found you.', dancer: 'A dancer found you.',
  flower: 'A friend with a flower found you.', cane: 'A friend with a white cane found you.',
};

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting starts dim and grey; light spreads from the golden right side toward the face as the village grows
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uK, uA, uT, uGlow;
void main(){
  vec3 col = texture2D(map, vUv).rgb;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 dim = mix(vec3(l), col, 0.15) * 0.4;
  float edge = 1.08 - uK * 1.25;                       // where the light has reached
  float lit = smoothstep(edge - 0.12, edge + 0.12, vUv.x + 0.06 * sin(vUv.y * 9.0 + uT * 0.7));
  vec3 c = mix(dim, col * (1.0 + 0.1 * uGlow) + vec3(0.06, 0.04, 0.0) * uGlow, lit);
  gl_FragColor = vec4(c, uA);
}`;

/* ───────────────────────── the band: a warm drone, a soft hand drum, and a choir that grows ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const mix = ac.createGain(); mix.gain.value = 1; mix.connect(out);
  const choir = ac.createBiquadFilter(); choir.type = 'lowpass'; choir.frequency.value = 1400; choir.connect(mix);
  const mkPan = (p) => { if (!ac.createStereoPanner) { const g = ac.createGain(); g.connect(mix); return g; } const n = ac.createStereoPanner(); n.pan.value = p; n.connect(mix); return n; };
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const oscs = [];
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(mkPan(p)); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, p = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(mkPan(p)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // a held, humming voice: two detuned oscillators through a soft "mm" filter, with vibrato
  function hummer(m, p, vol) {
    const g = ac.createGain(); g.gain.value = 0; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 3;
    const pn = ac.createStereoPanner ? ac.createStereoPanner() : null; if (pn) pn.pan.value = p;
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain();
    o1.type = 'triangle'; o2.type = 'sawtooth'; o1.frequency.value = midi(m); o2.frequency.value = midi(m) * 1.004;
    const g2 = ac.createGain(); g2.gain.value = 0.25; lfo.frequency.value = 5.2; lg.gain.value = midi(m) * 0.008;
    lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    o1.connect(f); o2.connect(g2).connect(f); f.connect(g); if (pn) { g.connect(pn).connect(mix); } else g.connect(mix);
    o1.start(); o2.start(); lfo.start(); oscs.push(o1, o2, lfo);
    return {
      set(v, bright, pan) { const t = ac.currentTime; g.gain.setTargetAtTime(v * vol, t, 0.08); f.frequency.setTargetAtTime(700 + bright * 1600, t, 0.1); if (pn && pan !== undefined) pn.pan.setTargetAtTime(pan, t, 0.1); },
      off() { const t = ac.currentTime; g.gain.setTargetAtTime(0, t, 0.3); setTimeout(() => { try { o1.stop(); o2.stop(); lfo.stop(); } catch (e) {} }, 1500); },
    };
  }
  // the drone: D and A, always there
  const drone = [];
  for (const [m, v] of [[38, 0.05], [45, 0.035], [50, 0.02]]) {
    const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = midi(m); f.type = 'lowpass'; f.frequency.value = 600; g.gain.value = v;
    o.connect(f).connect(g).connect(mix); o.start(); oscs.push(o); drone.push(g);
  }
  let level = 0;
  return {
    start() { out.gain.setTargetAtTime(0.8, ac.currentTime, 0.6); },
    hummer,
    set level(n) { level = n; }, get level() { return level; },
    // the friend joins the choir: their note stays, softly
    join(m, p) { const h = hummer(m - 12 * (Math.random() < 0.5 ? 1 : 0), p * 0.6, 0.35); h.set(1, 0.2); },
    // a soft hand drum on a slow walk (b = beat 0..7 of a two-bar loop)
    beat(b) {
      const t = ac.currentTime + 0.01;
      if (b === 0 || b === 3 || b === 6) { tone(t, 140, 0.25, { vol: 0.2, slide: 70 }); noise(t, 0.05, { freq: 300, type: 'lowpass', vol: 0.12 }); }
      if (b === 2 || b === 5 || b === 7) noise(t, 0.08, { freq: 2400, q: 1.5, vol: 0.06, p: 0.2 });
      if (level >= 4 && b % 2 === 1) noise(t, 0.04, { freq: 7000, q: 1.5, vol: 0.03, p: -0.3 });
      if (level >= 7 && (b === 0 || b === 4)) [62, 66, 69].forEach((m, i) => tone(t + i * 0.02, midi(m + (b === 4 ? 5 : 0)), 1.8, { type: 'triangle', vol: 0.025, p: (i - 1) * 0.4 }));
    },
    pulled(p) { const t = ac.currentTime + 0.01; tone(t, 500, 0.35, { vol: 0.06, slide: 1400, p }); noise(t, 0.3, { freq: 3000, q: 2, vol: 0.06, p }); },
    caught(n, p) { const t = ac.currentTime + 0.01; [0, 4, 7, 12].forEach((d, i) => tone(t + i * 0.06, midi(62 + d + (n % 3) * 2), 1.2, { type: 'triangle', vol: 0.07, p })); tone(t + 0.3, midi(86), 0.4, { vol: 0.04, p }); },
    settle(p) { const t = ac.currentTime + 0.01; tone(t, midi(81), 0.6, { vol: 0.05, p }); tone(t + 0.08, midi(86), 0.5, { vol: 0.03, p }); },
    move(dir) { noise(ac.currentTime + 0.01, 0.15, { freq: 1200, q: 0.8, vol: 0.08, p: dir * 0.7 }); tone(ac.currentTime + 0.01, 420 + dir * 60, 0.1, { vol: 0.04, p: dir * 0.7 }); },
    wall(dir) { tone(ac.currentTime + 0.01, 150, 0.12, { type: 'square', vol: 0.05, p: dir * 0.8 }); },
    gone(p) { tone(ac.currentTime + 0.01, 400, 0.6, { vol: 0.05, slide: 200, p }); },
    finale() { const t = ac.currentTime + 0.1; [50, 57, 62, 66, 69, 74, 78, 81].forEach((m, i) => tone(t + i * 0.12, midi(m), 3.5, { type: 'triangle', vol: 0.05, att: 0.05, p: (i - 3.5) * 0.2 })); choir.frequency.setTargetAtTime(3000, ac.currentTime, 1); },
    quiet(v) { mix.gain.setTargetAtTime(v, ac.currentTime, 0.6); },
    // Steven is about to speak: fade every sound in the game to silence (and it stays silent while he talks)
    hush() { out.gain.cancelScheduledValues(ac.currentTime); out.gain.setTargetAtTime(0, ac.currentTime, 0.35); },
    pause() { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); },
    resume() { out.gain.setTargetAtTime(0.8, ac.currentTime, 0.2); },
    stop() { try { out.gain.setTargetAtTime(0, ac.currentTime, 0.08); } catch (e) {} setTimeout(() => { for (const o of oscs) { try { o.stop(); } catch (e) {} } }, 400); },
  };
}

export function villageMagnetGame() {
  let G = null;
  const tex = {};
  const thingTex = (k) => { if (!tex[k]) { const t = new THREE.CanvasTexture(thingCanvas(k, 256)); t.colorSpace = THREE.SRGBColorSpace; tex[k] = t; } return tex[k]; };
  const panOf = u => Math.max(-1, Math.min(1, (u - 0.5) * 1.9));

  function hud() {
    G.ui.panel('Like a magnet', `${G.found}<small>of ${GOAL} in your village</small>`, { segs: [G.found, GOAL], sub: G.found >= GOAL ? 'Your whole village is here!' : 'Steer LEFT / RIGHT toward the humming' });
  }
  function steer(dir) {
    if (!G || !G.playing || G.over) return;
    const to = Math.max(0, Math.min(2, G.lane + dir));
    if (to === G.lane) { G.band.wall(dir); return; }
    G.lane = to; G.band.move(dir); G.buzz(12);
  }
  function goLane(l) { if (!G || !G.playing || G.over || l === G.lane) return; steer(l > G.lane ? 1 : -1); if (l !== G.lane) steer(l > G.lane ? 1 : -1); }

  // the next friend floats in from the sky
  function spawn() {
    const who = G.queue.shift(); if (!who) return;
    // usually not right above you, so you have to listen and move
    let lane = Math.floor(Math.random() * 3);
    if (lane === G.lane && Math.random() < 0.75) lane = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
    if (G.people.some(p => p.state === 'fall' && p.lane === lane)) lane = (lane + 1) % 3;
    const s = K.sprite(thingTex(who.kind), 0.13, { order: 22, opacity: 0 }); s.position.z = 0.055; G.root.add(s);
    const note = NOTES[PEOPLE.findIndex(p => p.kind === who.kind)];
    const hum = G.band.hummer(note, panOf(LANE_U[lane]), 0.11);
    const fall = FALL[Math.min(FALL.length - 1, G.found)];
    G.spawned = (G.spawned || 0) + 1;
    G.people.push({ ...who, idx: G.spawned, lane, s, hum, note, state: 'fall', v: TOP_V, u: LANE_U[lane], t: 0, fall, sway: Math.random() * 6 });
    G.say(SIDE[lane]);
  }
  function pullIn(p) { p.state = 'pull'; p.t = 0; G.band.pulled(panOf(p.u)); G.buzz(20); }
  function arrive(p) {
    p.state = 'fly'; p.t = 0; G.found++; G.band.level = G.found;
    const home = HOMES[(G.found - 1) % HOMES.length]; p.home = { u: home[0], v: home[1] }; p.from = { u: p.u, v: p.v };
    G.band.caught(G.found, panOf(p.u)); p.hum.off(); G.buzz([30, 30, 70]);
    const [x, y] = G.S.P(p.u, p.v); G.fx.add(x, y, p.col[0], 20, 0.35); G.orbPulse = 1;
    G.ui.pop('+1', innerWidth * 0.5, innerHeight * 0.62);
    // each kind of friend is named the first time; then the count at 5, and "just 1 more" at 9
    let line = '';
    if (!G.named[p.kind]) { G.named[p.kind] = true; line = FOUND[p.kind]; }
    if (G.found === 5) line += (line ? ' ' : '') + '5 in your village.';
    if (G.found === GOAL - 1) line += (line ? ' ' : '') + 'Just 1 more!';
    if (G.found >= GOAL) line = (line ? line + ' ' : '') + 'Your whole village is here!';
    if (line) G.say(line);
    G.ui.alert(G.found >= GOAL ? 'Your whole village!' : 'They found you', `${G.found} of ${GOAL}`, 1.4, 'blue');
    G.gap = 1.0; hud();
    if (G.found >= GOAL) { G.phase = 'home'; G.phT = 0; }
  }
  function drift(p) {
    p.state = 'drift'; p.t = 0; G.missed++; p.hum.off(); G.band.gone(panOf(p.u));
    G.queue.push({ kind: p.kind, col: p.col });   // they come back around later
    if (!G.toldBack) { G.toldBack = true; G.say('They’ll come back around.'); }
    G.gap = 0.8; hud();
  }

  return {
    title: 'Like a magnet',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', phT: 0, lane: 1, laneX: 1, found: 0, missed: 0, people: [], queue: [], named: {}, gap: 0, beatT: 0, beatN: 0, k: 0, glow: 0,
        orbPulse: 0, orbP: 0, endT: 0, artist: null, toldBack: false, botIgnored: false, botT: 0 });
      for (let i = 0; i < GOAL; i++) G.queue.push(PEOPLE[i % PEOPLE.length]);
      G.band = band(K.audio());
      G.uni = { map: { value: null }, uK: { value: 0 }, uA: { value: 0 }, uT: { value: 0 }, uGlow: { value: 0 } };
      G.art = new THREE.Mesh(new THREE.PlaneGeometry(1, G.h), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.art.renderOrder = 11; G.art.position.z = 0.03; G.root.add(G.art);
      new THREE.TextureLoader().load(G.work.image, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.artOK = true; });
      // YOU: the crystal orb, cut out of the painting (its empty spot dims while you're away)
      G.orb = K.sprite(K.dotTex, 0.17, { order: 24, opacity: 0 }); G.orb.position.z = 0.06; G.root.add(G.orb);
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => { if (!G) return; const t = new THREE.CanvasTexture(orbCanvas(img, 256)); t.colorSpace = THREE.SRGBColorSpace; G.orb.material.map = t; G.orb.material.needsUpdate = true; G.orbOK = true; };
      img.src = G.work.image;
      G.hole = K.sprite(K.glowTex, 0.16, { color: '#000000', opacity: 0, order: 15 }); const [hx, hy] = G.S.P(ORB.u, ORB.v); G.hole.position.set(hx, hy, 0.04); G.root.add(G.hole);
      G.pull = K.sprite(thingTex('magnet'), 0.22, { order: 23, additive: true, opacity: 0 }); G.pull.position.z = 0.058; G.root.add(G.pull);
      G.lanes = LANE_U.map(u => { const s = K.sprite(K.glowTex, 0.12, { color: '#ffd66e', additive: true, opacity: 0, order: 19 }); const [x, y] = G.S.P(u, ROW_V); s.position.set(x, y, 0.045); G.root.add(s); return s; });
      G.btns = G.ui.buttons([
        { label: 'Left', icon: '◀', kind: 'black', aria: 'Steer left', press: () => steer(-1) },
        { label: 'Right', icon: '▶', kind: 'black', aria: 'Steer right', press: () => steer(1) },
      ]);
      hud();
      G.onGo = () => { G.phase = 'play'; G.phT = 0; G.gap = 1.6; };
      K.intro(G, { title: 'Like a magnet',
        how: 'You are the glowing orb. Your people float down, humming from their side. Steer LEFT or RIGHT to be under them and they are pulled in. Bring 10 home.',
        say: 'Like a magnet. Steven says when you live as yourself, you find your village. You are the glowing orb. Your people float down from the sky, humming. Listen for which side the humming is on. Steer left or right, to be right under them. When they get close, they are pulled in, like a magnet. Bring 10 people home to your village. Here they come.' });
      G.band.start();
      const story = G.story; G.story = () => { if (G && G.artist) G.artist.pause(); story && story(); };
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.phT += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      G.uni.uA.value += ((G.artOK ? 1 : 0) - G.uni.uA.value) * Math.min(1, dt * 2);
      if (G.over && !G.artist) { G.endT += dt; if (G.endT > 3.3) { G.artist = new Audio(ARTIST); G.artist.play().catch(() => {}); G.band.hush(); } }

      // a slow walking beat (2 bars of 4 at 84 bpm, in eighths of a loop)
      if (!G.artist) G.beatT += dt; if (G.beatT >= 60 / 84) { G.beatT -= 60 / 84; G.band.beat(G.beatN % 8); G.beatN++; }

      // ── friends float in, one at a time (two at once later on) ──
      if (G.phase === 'play') {
        const falling = G.people.filter(p => p.state === 'fall'), pulling = G.people.some(p => p.state === 'pull');
        G.gap -= dt;
        const allowTwo = G.found >= 4 && falling.length === 1 && falling[0].v > 0.42;
        if (G.queue.length && G.gap <= 0 && !pulling && (falling.length === 0 || allowTwo)) { spawn(); G.gap = 1.2; }
      }
      const [ox, oy] = G.S.P(LANE_U[0] + (LANE_U[2] - LANE_U[0]) * G.laneX / 2, ROW_V);
      for (let i = G.people.length - 1; i >= 0; i--) {
        const p = G.people[i]; p.t += dt;
        let a = 1, size = 0.13;
        if (p.state === 'fall') {
          p.v = TOP_V + (ROW_V - TOP_V) * Math.min(1, p.t / p.fall);
          p.u = LANE_U[p.lane] + Math.sin(G.t * 1.3 + p.sway) * 0.012;
          a = Math.min(1, p.t * 2);
          const close = (p.v - TOP_V) / (ROW_V - TOP_V), under = p.lane === G.lane;
          p.hum.set(0.25 + close * 0.85, under ? 1 : 0.2, panOf(p.u));
          if (under && p.v >= PULL_V) pullIn(p);
          else if (p.v >= ROW_V - 0.005) drift(p);
        } else if (p.state === 'pull') {
          // pulled in toward the orb, faster and faster
          const k = Math.min(1, p.t / 0.45), [px, py] = G.S.P(p.u, p.v);
          const x = px + (ox - px) * k * k, y = py + (oy - py) * k * k; p.u = x + 0.5; p.v = 0.5 - y / G.h;
          size = 0.13 * (1 - k * 0.35); p.hum.set(1.2, 1, panOf(p.u));
          if (k >= 1) arrive(p);
        } else if (p.state === 'fly') {
          // up to their spot on the floating land, in a little arc
          const k = Math.min(1, p.t / 1.3), e = 1 - Math.pow(1 - k, 3);
          p.u = p.from.u + (p.home.u - p.from.u) * e; p.v = p.from.v + (p.home.v - p.from.v) * e - Math.sin(k * Math.PI) * 0.08;
          size = 0.1 - 0.012 * e;
          if (k >= 1) { p.state = 'home'; p.t = 0; G.band.settle(panOf(p.u)); G.band.join(p.note, panOf(p.u)); const [x, y] = G.S.P(p.u, p.v); G.fx.add(x, y, '#fff3c0', 10, 0.15); }
        } else if (p.state === 'home') {
          size = 0.088 * (1 + Math.sin(G.t * 2 + p.sway) * 0.04); p.v = p.home.v + Math.sin(G.t * 1.4 + p.sway) * 0.004;
        } else if (p.state === 'drift') {
          // they float on past and fade away, to come back later
          p.v += dt * 0.05; p.u += (p.lane - 1 || 0.5) * dt * 0.08; a = Math.max(0, 1 - p.t * 1.2);
          if (a <= 0) { G.root.remove(p.s); p.s.material.dispose(); G.people.splice(i, 1); continue; }
        }
        const [x, y] = G.S.P(p.u, p.v);
        p.s.position.set(x, y, p.state === 'home' ? 0.05 : 0.055); p.s.scale.setScalar(size);
        p.s.material.opacity += (a - p.s.material.opacity) * Math.min(1, dt * 6);
        p.s.material.rotation = p.state === 'home' ? Math.sin(G.t * 1.6 + p.sway) * 0.06 : Math.sin(G.t * 2.4 + p.sway) * 0.12;
      }

      // ── you: the orb lifts out of the face, sits on the bottom row, and goes home at the end ──
      G.laneX += (G.lane - G.laneX) * Math.min(1, dt * 9);
      const goingHome = G.phase === 'home' && G.phT > 1.4;
      const toP = G.phase === 'intro' ? 0 : goingHome ? 0 : 1;
      G.orbP += (toP - G.orbP) * Math.min(1, dt * (G.phase === 'intro' ? 0 : 1.8));
      const [hx, hy] = G.S.P(ORB.u, ORB.v), e = G.orbP * G.orbP * (3 - 2 * G.orbP);
      const bx = hx + (ox - hx) * e, by = hy + (oy - hy) * e + Math.sin(e * Math.PI) * 0.08;
      G.orbPulse = Math.max(0, G.orbPulse - dt * 1.5);
      G.orb.position.set(bx, by + Math.sin(G.t * 2) * 0.004 * e, 0.06);
      G.orb.scale.setScalar((0.165 + 0.05 * e) * (1 + G.orbPulse * 0.15));
      G.orb.material.opacity += ((G.orbOK ? 1 : 0) - G.orb.material.opacity) * Math.min(1, dt * 3);
      G.hole.material.opacity = Math.min(0.7, e * 0.8);
      // the magnet pull glows stronger when someone is right above you
      const above = G.people.some(p => p.state === 'fall' && p.lane === G.lane);
      G.pull.position.set(bx, by, 0.058); G.pull.scale.setScalar((0.24 + 0.03 * Math.sin(G.t * 4)) * (0.6 + e * 0.4));
      G.pull.material.opacity += (((G.playing && e > 0.5) ? (above ? 0.95 : 0.35) : 0) - G.pull.material.opacity) * Math.min(1, dt * 6);
      G.pull.material.rotation -= dt * (above ? 1.6 : 0.4);
      // the three spots along the bottom, faintly
      G.lanes.forEach((s, i) => { s.material.opacity = G.playing && G.phase === 'play' ? (i === G.lane ? 0.05 : 0.22) : 0; });

      // ── the light spreads as your village grows ──
      const kTo = G.over ? 1.05 : G.found / GOAL;
      G.k += (kTo - G.k) * Math.min(1, dt * 1.2); G.uni.uK.value = G.k;
      G.glow += ((G.over ? 1 : 0) - G.glow) * Math.min(1, dt); G.uni.uGlow.value = G.glow;

      // ── home: the orb floats back into the face, then the finale ──
      if (G.phase === 'home' && G.phT > 3.2 && !G.over) {
        G.band.finale();
        const r = K.best('find-your-village:magnet', G.missed, 'lower');
        K.finale(G, { won: true, kicker: 'Like a magnet', title: 'You found your village', line: G.work && G.work.quote, best: r.isBest,
          say: 'You found your village.', cells: [{ k: 'Village', v: G.found }, { k: 'Came back', v: G.missed }] });
        G.endT = 0;
      }

      // ── the robot: listens (after a short pause) and steers under each friend; it lets one drift past to test that ──
      if (G.bot && G.playing && !G.over && G.phase === 'play') {
        G.botT -= dt;
        const p = G.people.filter(q => q.state === 'fall').sort((a, b) => b.v - a.v)[0];
        if (p && p.t > 0.8 && G.botT <= 0) {
          if (p.idx === 3) { if (p.lane === G.lane) { steer(G.lane === 2 ? -1 : 1); G.botT = 0.35; } if (p.v > 0.8) G.botIgnored = true; }
          else if (p.lane !== G.lane) { steer(p.lane > G.lane ? 1 : -1); G.botT = 0.35; }
        }
      }
    },
    pointer(kind, ev) {
      if (!G || G.paused || G.over || kind !== 'down') return;
      // tap the left, middle or right of the screen to go there
      const third = G.S.screenThird(ev); goLane(third + 1);
    },
    pause() { if (G) { G.paused = true; G.band.pause(); if (G.artist) G.artist.pause(); } },
    resume() { if (G) { G.paused = false; if (!G.artist) G.band.resume(); if (G.artist && G.over) G.artist.play().catch(() => {}); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'village', phase: G.phase, playing: G.playing, over: G.over, found: G.found, missed: G.missed, lane: G.lane, falling: G.people.filter(p => p.state === 'fall').length, artist: G.artist ? +G.artist.currentTime.toFixed(1) : null, t: +G.t.toFixed(1) }; },
    stop() { if (G) { try { if (G.artist) { G.artist.pause(); G.artist = null; } } catch (e) {} for (const p of G.people) { try { p.state === 'fall' && p.hum.off(); } catch (e) {} } try { G.band.stop(); } catch (e) {} } K.cleanup(G); G = null; },
  };
}
