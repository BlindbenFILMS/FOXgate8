// MIDNIGHT MELODIES (Wayne Pearcy): NIGHT LIGHT, a flashlight game with a lofi beat.
// The room goes dark. Your phone is the flashlight: wherever the middle of the screen points on the real painting,
// a warm beam lights it up (or drag a finger to move the light). Seven little things are hidden in the dark. Hold the
// light on one to find it: it plays a trumpet note and stays softly lit, and the lofi song grows a new layer
// (vinyl and chords, then hats, then the beat, then bass, then a sleepy trumpet). When all seven are found,
// shine on the trumpet lamp above Wayne: it switches on, the whole room fills with light, and a lullaby plays.
// By ear: a soft twinkle comes from the side of the nearest hidden thing and speeds up as you get close, a rising
// hum means you're on it, and the Hint button says which way to move.
import * as THREE from 'three';
import * as K from './kit.js';

/* things to find: u, v on the painting (0..1 from the top-left) */
const SPOTS = [
  { name: 'a little pine tree', u: 0.315, v: 0.085 },
  { name: 'a comet', u: 0.115, v: 0.245 },
  { name: 'a paper sailboat', u: 0.155, v: 0.395 },
  { name: 'a sleepy star', u: 0.05, v: 0.585 },
  { name: 'the trumpet’s valves', u: 0.40, v: 0.60 },
  { name: 'Wayne, fast asleep', u: 0.60, v: 0.47 },
  { name: 'a cosy pillow', u: 0.86, v: 0.19 },
];
const LAMP = { name: 'the trumpet lamp', u: 0.385, v: 0.285 };
const FIND_R = 0.075, DWELL = 0.55, BEAM_R = 0.13;

/* ───────────────────────── the lofi band (all made with WebAudio, no files) ───────────────────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
// Fmaj9 · Em7 · Dm9 · Cmaj7: one bar each, a slow, warm loop
const CHORDS = [[53, 57, 60, 64, 67], [52, 55, 59, 62], [50, 53, 57, 60, 64], [48, 52, 55, 59]];
const BASS = [41, 40, 38, 36];
const LEAD = [[72, 0, 1], [69, 1.5, 0.5], [67, 2, 1.5], [64, 3.5, 0.5], [65, 4, 1], [64, 5, 0.5], [62, 5.5, 1.5], [60, 8, 1], [62, 9, 0.5], [64, 9.5, 1.5], [67, 11, 0.5], [69, 12, 2], [67, 14, 1]];
const LULLABY = [[72, 0, .6], [69, .6, .6], [67, 1.2, 1.2], [65, 2.4, .6], [67, 3.0, .6], [69, 3.6, 1.6], [72, 5.4, .5], [74, 5.9, .5], [72, 6.4, 2.4]];

function band(ac) {
  const BPM = 74, beat = 60 / BPM, bar = beat * 4;
  const bus = ac.createGain(); bus.gain.value = 0;
  const tape = ac.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 3400; tape.Q.value = 0.5;   // warm, a bit dusty
  bus.connect(tape).connect(ac.destination);
  const air = ac.createGain(); air.gain.value = 0; air.connect(ac.destination);   // hats and vinyl pops skip the tape filter, so they stay crisp
  const wob = ac.createOscillator(), wobG = ac.createGain(); wob.frequency.value = 0.35; wobG.gain.value = 7; wob.connect(wobG); wob.start();   // tape wobble (cents)
  const layers = { crackle: 1, chords: 1, hats: 0, beat: 0, bass: 0, lead: 0 };
  const noiseBuf = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function noise(t, dur, { freq = 1000, type = 'bandpass', q = 1, vol = 0.2, pan = 0, out = bus } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), p = ac.createStereoPanner ? ac.createStereoPanner() : null;
    s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g); if (p) { p.pan.value = pan; g.connect(p).connect(out); } else g.connect(out);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  // an electric-piano note: sine + a soft bell partial, gentle attack, slow fade, tape wobble
  function keys(t, m, dur, vol = 0.05) {
    const f = midi(m), g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const [mul, v, type] of [[1, 1, 'sine'], [2, 0.18, 'triangle'], [3.01, 0.05, 'sine']]) {
      const o = ac.createOscillator(), og = ac.createGain(); o.type = type; o.frequency.value = f * mul; og.gain.value = v;
      wobG.connect(o.detune); o.connect(og).connect(g); o.start(t); o.stop(t + dur + 0.05);
    }
    g.connect(bus);
  }
  function kick(t) {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g).connect(bus); o.start(t); o.stop(t + 0.45);
  }
  function snare(t) {
    noise(t, 0.2, { freq: 1700, q: 0.7, vol: 0.16 });
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = 190;
    g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(g).connect(bus); o.start(t); o.stop(t + 0.14);
  }
  const hat = (t, v) => noise(t, 0.045, { freq: 6500, type: 'highpass', q: 0.6, vol: v, pan: 0.25, out: air });
  function bass(t, m, dur) {
    const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = midi(m);
    f.type = 'lowpass'; f.frequency.value = 420; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  // a soft, muted trumpet: saw + square through a filter that opens as the note speaks, with a little vibrato
  function horn(t, m, dur, vol = 0.07, dest = bus) {
    const f = midi(m), lp = ac.createBiquadFilter(), g = ac.createGain(), vib = ac.createOscillator(), vg = ac.createGain();
    lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(2300, t + 0.09); lp.frequency.exponentialRampToValueAtTime(1300, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06); g.gain.setValueAtTime(vol, t + Math.max(0.07, dur - 0.12)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(9, t + 0.25); vib.connect(vg);
    for (const [type, v] of [['sawtooth', 1], ['square', 0.35]]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = type; o.frequency.value = f; og.gain.value = v; vg.connect(o.detune); o.connect(og).connect(lp); o.start(t); o.stop(t + dur + 0.15); }
    lp.connect(g).connect(dest); vib.start(t); vib.stop(t + dur + 0.15);
  }
  // the vinyl bed: a quiet hiss plus random pops
  const bed = ac.createBufferSource(), bedF = ac.createBiquadFilter(), bedG = ac.createGain();
  bed.buffer = noiseBuf; bed.loop = true; bedF.type = 'bandpass'; bedF.frequency.value = 2600; bedF.Q.value = 0.4; bedG.gain.value = 0.012;
  bed.connect(bedF).connect(bedG).connect(bus); bed.start();

  let next = ac.currentTime + 0.1, step = 0, timer = null;   // step = 8th notes
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, barN = Math.floor(step / 8), ch = barN % 4, swing = b8 % 2 ? beat * 0.08 : 0, tt = t + swing;
      if (layers.chords && b8 === 0) CHORDS[ch].forEach((m, i) => keys(t + i * 0.012, m, bar * 0.95, 0.055));
      if (layers.chords && b8 === 5) keys(tt, CHORDS[ch][CHORDS[ch].length - 1] + 12, beat * 1.2, 0.03);
      if (layers.hats) hat(tt, (b8 % 2 ? 0.05 : 0.09) * (0.8 + Math.random() * 0.4));
      if (layers.beat) { if (b8 === 0 || b8 === 5) kick(tt); if (b8 === 2 || b8 === 6) snare(tt); }
      if (layers.bass) { if (b8 === 0) bass(t, BASS[ch], beat * 1.8); if (b8 === 3) bass(tt, BASS[ch] + 7, beat * 0.8); if (b8 === 6) bass(tt, BASS[ch], beat * 0.9); }
      if (layers.lead) { const pos = (barN % 4) * 4 + b8 / 2; for (const [m, at, d] of LEAD) if (Math.abs(at - pos) < 0.01) horn(tt, m, d * beat, 0.05); }
      if (layers.crackle && Math.random() < 0.35) noise(t + Math.random() * beat / 2, 0.012, { freq: 2500 + Math.random() * 2500, q: 3, vol: 0.03 + Math.random() * 0.04, pan: Math.random() - 0.5, out: air });
      next += beat / 2; step++;
    }
  }
  return {
    layers, horn,
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 30); schedule(); this.volume(0.85); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.25); air.gain.setTargetAtTime(v, ac.currentTime, 0.25); },
    stop() { clearInterval(timer); timer = null; this.volume(0); setTimeout(() => { try { bed.stop(); wob.stop(); bus.disconnect(); air.disconnect(); } catch (e) {} }, 600); },
    lullaby() { const t = ac.currentTime + 0.2; for (const [m, at, d] of LULLABY) horn(t + at * beat, m, d * beat, 0.09, ac.destination); },
  };
}

/* ───────────────────────── the dark, with a beam of light in it ───────────────────────── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform vec2 uBeam; uniform float uR, uH, uDark, uLamp, uOn, uT;
uniform vec3 uSpots[9];
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float d = length((p - uBeam) * vec2(1.0, uH));
  float flick = 1.0 + 0.03 * sin(uT * 13.0) * sin(uT * 7.3);
  float beam = uOn * smoothstep(uR * flick, uR * 0.45, d);
  float lit = 0.0;
  for (int i = 0; i < 9; i++) { vec3 s = uSpots[i]; float ds = length((p - s.xy) * vec2(1.0, uH)); lit += s.z * smoothstep(0.1, 0.025, ds) * (0.82 + 0.08 * sin(uT * 2.0 + float(i))); }
  float light = clamp(beam + lit, 0.0, 1.0);
  float a = uDark * (1.0 - light) * (1.0 - uLamp);
  float rim = uOn * smoothstep(uR * 1.1, uR * 0.8, d) * (1.0 - smoothstep(uR * 0.8, uR * 0.5, d));
  vec3 col = mix(vec3(0.012, 0.018, 0.045), vec3(1.0, 0.72, 0.35), rim * 0.55);
  gl_FragColor = vec4(col, max(a, rim * 0.18 * (1.0 - uLamp)));
}`;

export function midnightMelodiesGame() {
  let G = null;
  const N = SPOTS.length;
  const toU = (x) => x + 0.5, toV = (y) => 0.5 - y / G.h;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);

  function hud() { G.ui.panel('Night light', `${G.found}<small>of ${N} found</small>`, { segs: [G.found, N], sub: G.found < N ? 'Hold the light on what you find' : 'Now light the trumpet lamp' }); }
  const nextTarget = () => (G.found >= N ? (G.lampDone ? null : LAMP) : SPOTS.filter(s => !s.got).sort((a, b) => dist(a, G.beam) - dist(b, G.beam))[0]);

  function find(s) {
    s.got = true; G.found++; s.lit = 0.001;
    const [x, y] = G.S.P(s.u, s.v), pan = Math.max(-1, Math.min(1, (s.u - 0.5) * 1.8));
    G.music.horn(K.audio().currentTime + 0.02, [65, 67, 69, 72, 74, 76, 77][G.found - 1], 0.9, 0.09);
    K.tone(1568, 0.5, { vol: 0.05, pan, delay: 0.05 }); G.fx.add(x, y, '#ffd27a', 26, 0.28); G.buzz([30, 40, 60]);
    G.ui.pop(s.name.replace(/^(a|the) /, '').toUpperCase() + '!');
    // the song grows a layer
    const L = G.music.layers, add = { 1: 'hats', 3: 'beat', 5: 'bass', 7: 'lead' }[G.found];
    if (add) L[add] = 1;
    const msg = { 1: 'The hats came in.', 3: 'Here comes the beat.', 5: 'The bass wakes up.', 7: 'The trumpet joins in.' }[G.found];
    hud();
    if (G.found === N) { G.ui.alert('Now light the lamp', 'Shine on the trumpet lamp above Wayne.', 2.6, 'blue'); G.say(`You found ${s.name}. That's all seven! Now shine your light on the trumpet lamp above Wayne.`); }
    else { G.say(`You found ${s.name}. ${msg ? msg + ' ' : ''}${N - G.found} to go.`); if (msg) G.ui.alert(msg, `${N - G.found} more hidden in the dark`, 1.6, 'black'); }
  }
  function lampOn() {
    G.lampDone = true; G.lampT = 0;
    K.tone(2200, 0.03, { type: 'square', vol: 0.08 }); K.noise(0.05, { vol: 0.2, freq: 3000 });   // click
    G.buzz([40, 60, 120]); G.music.lullaby(); G.music.volume(0.45);
    const [x, y] = G.S.P(LAMP.u, LAMP.v); G.fx.add(x, y, '#fff2b0', 40, 0.45);
    G.ui.alert('Lights on!', 'Goodnight, Wayne.', 3, 'red'); G.say('The lamp is on. Goodnight, Wayne.');
    G.settle = 4.2;
  }
  function hint() {
    const s = nextTarget(); if (!s) return;
    const du = s.u - G.beam.u, dv = s.v - G.beam.v, d = dist(s, G.beam);
    if (d < FIND_R) { G.say('You’re right on it. Hold still.'); return; }
    const h = Math.abs(du) > 0.08 ? (du < 0 ? 'left' : 'right') : '', v = Math.abs(dv) > 0.08 ? (dv < 0 ? 'up' : 'down') : '';
    const way = [v, h].filter(Boolean).join(' and ') || 'just a little';
    const near = d < 0.18 ? 'Very close. ' : d < 0.35 ? 'Getting warm. ' : '';
    G.ui.alert(near + 'Move ' + way, s === LAMP ? 'The lamp is above Wayne' : '', 1.6, 'blue'); G.say(near + 'Move ' + way + '.');
  }

  return {
    title: 'Night light',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { found: 0, beam: { u: 0.5, v: 0.5 }, aim: { u: 0.5, v: 0.5 }, dwell: 0, twinkleT: 0, touch: null, touchT: 0, lampDone: false, lampT: -1, settle: 0, t0: 0 });
      SPOTS.forEach(s => { s.got = false; s.lit = 0; }); LAMP.lit = 0;
      G.uni = { uBeam: { value: new THREE.Vector2(0.5, 0.5) }, uR: { value: BEAM_R }, uH: { value: G.h }, uDark: { value: 0 }, uLamp: { value: 0 }, uOn: { value: 0 }, uT: { value: 0 },
        uSpots: { value: Array.from({ length: 9 }, () => new THREE.Vector3(0, 0, 0)) } };
      G.dark = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.dark.position.z = 0.03; G.dark.renderOrder = 12; G.root.add(G.dark);
      G.glow = K.sprite(K.glowTex, BEAM_R * 2.2, { color: '#ffc46b', additive: true, opacity: 0, order: 13 }); G.glow.position.z = 0.035; G.root.add(G.glow);
      G.music = band(K.audio()); G.music.start();
      G.ui.buttons([{ label: 'Hint', icon: '?', kind: 'red', aria: 'Hint: which way to move the light', press: () => hint() }]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.say('Lights out. Move your phone to shine the light.'); };
      K.intro(G, { title: 'Night light', how: 'The room went dark. Move your phone to shine your light and find 7 hidden things. Each one adds to the music.',
        say: 'Night light. Wayne is asleep and the room went dark. Your phone is a flashlight: move it across the painting, or drag a finger, and find 7 hidden things. Hold the light on each one. Listen: a twinkle comes from the side of the nearest one and gets faster as you get close. Every find adds to the music.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t;
      // fade the dark in during the intro
      G.uni.uDark.value += ((G.lampDone ? 0.94 : 0.94) - G.uni.uDark.value) * Math.min(1, dt * 1.5);
      G.uni.uOn.value += ((G.playing || G.lampDone ? 1 : 0.6) - G.uni.uOn.value) * Math.min(1, dt * 3);
      // where the light points: a finger on the screen, else the middle of the screen (where the phone points)
      if (G.bot && G.playing) { const s = nextTarget(); if (s) G.aim = { u: G.aim.u + (s.u - G.aim.u) * Math.min(1, dt * 2.2), v: G.aim.v + (s.v - G.aim.v) * Math.min(1, dt * 2.2) }; }
      else if (G.touch) G.aim = G.touch;
      else if (G.touchT > 0) G.touchT -= dt;
      else { const r = G.renderer.domElement.getBoundingClientRect(), p = G.S.toBoard({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, G.root); if (p) G.aim = { u: Math.max(-0.1, Math.min(1.1, p.u)), v: Math.max(-0.1, Math.min(1.1, p.v)) }; }
      const k = Math.min(1, dt * 14); G.beam.u += (G.aim.u - G.beam.u) * k; G.beam.v += (G.aim.v - G.beam.v) * k;
      G.uni.uBeam.value.set(G.beam.u, G.beam.v);
      const [bx, by] = G.S.P(G.beam.u, G.beam.v); G.glow.position.set(bx, by, 0.035); G.glow.material.opacity = G.uni.uOn.value * 0.32 * (1 - G.uni.uLamp.value);
      // found things glow up; the lamp floods the room
      [...SPOTS, LAMP].forEach((s, i) => { if (s.lit > 0 && s.lit < 1) s.lit = Math.min(1, s.lit + dt * 1.6); G.uni.uSpots.value[i].set(s.u, s.v, s.lit || 0); });
      if (G.lampT >= 0) { G.lampT += dt; G.uni.uLamp.value = Math.min(1, G.lampT / 2.2); }
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && G.lampDone && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('midnight-melodies:light', t, 'lower');
        K.finale(G, { won: true, title: 'Goodnight, Wayne', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Found', v: `${N}/${N}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        G.music.volume(0.6); G.music.layers.lead = 1; } }
      if (!G.playing || G.lampDone) return;
      // searching: hold the light on a hidden thing to find it; the twinkle leads you there
      const s = nextTarget(); if (!s) return;
      const d = dist(s, G.beam), pan = Math.max(-1, Math.min(1, (s.u - G.beam.u) * 2.5));
      if (d < FIND_R) {
        G.dwell += dt;
        if (Math.floor((G.dwell - dt) / 0.1) !== Math.floor(G.dwell / 0.1)) K.tone(600 + G.dwell * 1400, 0.09, { type: 'triangle', vol: 0.05, pan });
        if (G.dwell >= DWELL) { G.dwell = 0; if (s === LAMP) { LAMP.lit = 0.001; lampOn(); } else find(s); }
      } else {
        G.dwell = Math.max(0, G.dwell - dt * 2);
        G.twinkleT -= dt;
        if (G.twinkleT <= 0 && d < 0.6) { G.twinkleT = 0.14 + Math.min(1, d / 0.6) * 0.8; K.tone(1760 + (1 - d) * 900, 0.08, { vol: 0.025 + (1 - Math.min(1, d / 0.6)) * 0.035, pan }); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'up') { G.touch = null; G.touchT = 0.8; return; }
      if (kind === 'down' || (kind === 'move' && G.touch)) { const p = G.S.toBoard(ev, G.root); if (p) G.touch = { u: p.u, v: p.v }; }
    },
    pause() { if (G) { G.paused = true; G.music && G.music.volume(0); } },
    resume() { if (G) { G.paused = false; G.music && G.music.volume(G.lampDone ? 0.6 : 0.85); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'night-light', playing: G.playing, over: G.over, found: G.found, lamp: G.lampDone, beam: [+G.beam.u.toFixed(3), +G.beam.v.toFixed(3)], layers: { ...G.music.layers } }; },
    stop() { if (G && G.music) G.music.stop(); K.cleanup(G); G = null; },
  };
}
export { band as lofiBand };   // for testing the music on its own
