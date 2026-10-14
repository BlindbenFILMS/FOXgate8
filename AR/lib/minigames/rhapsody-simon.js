// RHAPSODY IN BLUE (Marcus Roberts): JAZZ SAYS, a musical Simon Says.
// Five players live in the painting: the clarinet (the big white curl, top left), the trumpet (the gold streak, top
// right), the piano (the black-and-white keys, left), the drums (the round cymbals, bottom middle) and the bass (the
// black notes, bottom right). The band plays a phrase; you play it back by tapping the players (on the painting or with
// the buttons). Every round the phrase grows by one note, up to eight. A soft swing groove plays underneath, and the
// painting answers the music: each note sends ripples across the canvas from its player, lights it up and lets notes
// float out of it, the blue swirl turns with the groove, and a finished phrase makes the whole painting dance.
// A wrong note isn't the end: the band just plays the phrase again. Every part is a sound, so it plays by ear.
import * as THREE from 'three';
import * as K from './kit.js';
// (Textures read by a custom shader stay in their own colours: NoColorSpace, so they match the painting exactly.)

const PLAYERS = [
  { id: 'clarinet', name: 'Clarinet', u: 0.13, v: 0.2, color: '#ffffff', note: 77, pan: -0.7 },
  { id: 'trumpet', name: 'Trumpet', u: 0.72, v: 0.24, color: '#ffc93c', note: 74, pan: 0.6 },
  { id: 'piano', name: 'Piano', u: 0.25, v: 0.45, color: '#7fd0ff', note: 70, pan: -0.4 },
  { id: 'drums', name: 'Drums', u: 0.45, v: 0.68, color: '#ff6fb5', note: 0, pan: 0 },
  { id: 'bass', name: 'Bass', u: 0.76, v: 0.82, color: '#9b8cff', note: 46, pan: 0.5 },
];
const START = 2, GOAL = 8, HIT_R = 0.16;
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

/* ───────────────────────── the band ───────────────────────── */
function band(ac) {
  const BPM = 112, beat = 60 / BPM;
  const out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  const groove = ac.createGain(); groove.gain.value = 0.55; groove.connect(out);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = p; n.connect(dest); return n; };
  const osc = (t, f, dur, { type = 'sine', vol = 0.1, att = 0.008, dest = out, filt = 0, fEnd = 0, q = 1, vib = 0, rel = 0 } = {}) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att);
    if (rel) { g.gain.setValueAtTime(vol, t + Math.max(att, dur - rel)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); } else g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o; if (filt) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.Q.value = q; f2.frequency.setValueAtTime(filt, t); if (fEnd) f2.frequency.exponentialRampToValueAtTime(fEnd, t + dur); o.connect(f2); n = f2; }
    if (vib) { const v = ac.createOscillator(), vg = ac.createGain(); v.frequency.value = 5.3; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(vib, t + 0.25); v.connect(vg).connect(o.detune); v.start(t); v.stop(t + dur + 0.05); }
    n.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05);
  };
  const noise = (t, dur, { freq = 6000, type = 'highpass', q = 0.7, vol = 0.05, dest = out } = {}) => { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(dest); s.start(t, Math.random()); s.stop(t + dur + 0.02); };
  // the five players' voices
  const VOICE = {
    clarinet: (t, p, len = 0.55) => { const d = pan(p, out); osc(t, midi(77), len, { type: 'square', vol: 0.07, att: 0.04, filt: 1800, q: 0.8, vib: 12, rel: 0.1, dest: d }); osc(t, midi(77) * 2, len, { type: 'sine', vol: 0.012, att: 0.05, dest: d }); },
    trumpet: (t, p, len = 0.5) => { const d = pan(p, out); osc(t, midi(74), len, { type: 'sawtooth', vol: 0.08, att: 0.03, filt: 700, fEnd: 2600, q: 1.5, vib: 10, rel: 0.12, dest: d }); },
    piano: (t, p, len = 0.9) => { const d = pan(p, out); for (const m of [70, 74, 77]) { osc(t, midi(m), len, { type: 'triangle', vol: 0.06, att: 0.004, dest: d }); osc(t, midi(m) * 2, len * 0.5, { vol: 0.012, att: 0.004, dest: d }); } },
    drums: (t, p) => { const d = pan(p, out); noise(t, 0.9, { freq: 5000, vol: 0.12, dest: d }); osc(t, 160, 0.18, { type: 'triangle', vol: 0.12, dest: d }); noise(t, 0.12, { freq: 1500, type: 'bandpass', vol: 0.15, dest: d }); },
    bass: (t, p, len = 0.6) => { const d = pan(p, out); osc(t, midi(46), len, { type: 'triangle', vol: 0.3, att: 0.01, dest: d }); osc(t, midi(58), len * 0.4, { type: 'sine', vol: 0.05, dest: d }); noise(t, 0.03, { freq: 400, type: 'bandpass', vol: 0.08, dest: d }); },
  };
  // a quiet swing groove underneath: brushes, walking bass, piano comping (Bb7 · Eb7)
  const WALK = [[34, 38, 41, 43], [39, 43, 46, 44]], COMP = [[56, 60, 63, 67], [55, 58, 61, 65]];
  let next = ac.currentTime + 0.1, step = 0, timer = null, on = false, gain = 0.55;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, b8 = step % 8, bar = Math.floor(step / 8), ch = bar % 2, sw = b8 % 2 ? beat * 0.16 : 0;
      if (on) {
        if (b8 % 2 === 0) osc(t, midi(WALK[ch][b8 / 2]), beat * 0.9, { type: 'triangle', vol: 0.12, dest: groove });
        if (b8 === 2 || b8 === 6) noise(t, 0.2, { freq: 3500, type: 'bandpass', q: 0.5, vol: 0.05, dest: groove });
        noise(t + sw, 0.05, { freq: 8000, vol: b8 % 2 ? 0.02 : 0.035, dest: groove });
        if (b8 === 3 || b8 === 7) COMP[ch].forEach(m => osc(t + sw, midi(m), beat * 0.45, { type: 'triangle', vol: 0.018, dest: groove }));
      }
      next += beat / 2; step++;
    }
  }
  return {
    beat, play: (id, t, p, len) => VOICE[id](t ?? ac.currentTime + 0.01, p, len), now: () => ac.currentTime,
    nextBeat() { const b = beat; return Math.ceil((ac.currentTime + 0.12) / b) * b; },
    start() { if (timer) return; next = ac.currentTime + 0.08; timer = setInterval(schedule, 25); schedule(); out.gain.setTargetAtTime(1, ac.currentTime, 0.3); },
    groove(v) { on = v > 0; gain = v; groove.gain.setTargetAtTime(v, ac.currentTime, 0.3); },
    // the opening: a clarinet trill and a long rising run, the way the Rhapsody begins
    overture() { const t = ac.currentTime + 0.05, d = pan(-0.6, out); for (let i = 0; i < 8; i++) osc(t + i * 0.09, midi(i % 2 ? 55 : 53), 0.1, { type: 'square', vol: 0.05, filt: 1600, dest: d });
      const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter(); o.type = 'square'; f.type = 'lowpass'; f.frequency.value = 2200;
      o.frequency.setValueAtTime(midi(53), t + 0.75); o.frequency.exponentialRampToValueAtTime(midi(82), t + 2.0);
      g.gain.setValueAtTime(0.0001, t + 0.72); g.gain.exponentialRampToValueAtTime(0.06, t + 0.8); g.gain.setValueAtTime(0.06, t + 2.1); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(f).connect(g).connect(d); o.start(t + 0.72); o.stop(t + 2.7); },
    oops() { const t = ac.currentTime + 0.01; [49, 50, 55].forEach(m => osc(t, midi(m), 0.5, { type: 'sawtooth', vol: 0.05, filt: 900 })); noise(t, 0.4, { freq: 300, type: 'lowpass', vol: 0.2 }); },
    yeah(n) { const t = ac.currentTime + 0.05; [70, 74, 77, 82].forEach((m, i) => osc(t + i * 0.08, midi(m + (n % 3)), 0.6, { type: 'triangle', vol: 0.07 })); noise(t + 0.32, 1.0, { freq: 5000, vol: 0.1 }); },
    finale() { const t = ac.currentTime + 0.05; PLAYERS.forEach((P, i) => VOICE[P.id](t + i * 0.18, P.pan, 1.6)); [46, 58, 62, 65, 69, 72].forEach(m => osc(t + 1.0, midi(m), 3, { type: 'triangle', vol: 0.05, att: 0.05 })); noise(t + 1.0, 2.5, { freq: 5000, vol: 0.12 }); },
    volume(v) { out.gain.setTargetAtTime(v, ac.currentTime, 0.2); },
    stop() { clearInterval(timer); timer = null; out.gain.setTargetAtTime(0, ac.currentTime, 0.2); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 600); },
  };
}

/* ───────────────────────── the painting answers ───────────────────────── */
const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform sampler2D map; uniform float uT, uH, uA, uSwirl, uFlash, uGray; uniform vec4 uRip[8]; uniform vec3 uRipC[8];
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  // the blue swirl turns with the music
  vec2 d = (p - vec2(0.5, 0.48)) * vec2(1.0, uH); float r = length(d);
  float a = uSwirl * 0.22 * sin(uT * 1.2 - r * 6.0) * smoothstep(0.55, 0.1, r);
  vec2 q = vec2(0.5, 0.48) + vec2(d.x * cos(a) - d.y * sin(a), d.x * sin(a) + d.y * cos(a)) / vec2(1.0, uH);
  vec3 glow = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    vec4 R = uRip[i]; if (R.w <= 0.0) continue;
    vec2 e = (p - R.xy) * vec2(1.0, uH); float rr = length(e), front = R.z * 0.45;
    float ring = sin((rr - front) * 70.0) * exp(-abs(rr - front) * 16.0) * R.w;
    q += normalize(e + 1e-5) * ring * 0.009;
    glow += uRipC[i] * (max(0.0, ring) * 0.35 + R.w * 0.5 * exp(-rr * 9.0));
  }
  vec3 c = texture2D(map, vec2(q.x, 1.0 - q.y)).rgb;
  float g = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(c, vec3(g) * 0.8, uGray);
  gl_FragColor = vec4(c + glow + vec3(0.35, 0.5, 0.8) * uFlash * 0.25, uA);
}`;
const noteTex = ['♪', '♫', '♩'].map(ch => K.canvasTex(96, 96, (g) => { g.font = '900 78px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(ch, 48, 52); }));

export function jazzSaysGame() {
  let G = null;
  const dist = (a, b) => Math.hypot(a.u - b.u, (a.v - b.v) * G.h);

  function hud() {
    const n = G.seq.length, sub = G.phase === 'listen' ? 'Listen to the band…' : G.phase === 'you' ? `Your turn: ${G.pos} of ${n}` : 'Get ready';
    G.ui.panel('Jazz says', `${Math.max(0, n - START)}<small>of ${GOAL - START + 1} phrases</small>`, { segs: [Math.max(0, n - START), GOAL - START + 1], sub });
  }
  // the painting reacts to a note
  function react(i, big = 1) {
    const P = PLAYERS[i], r = G.rips[G.ripI % 8], c = G.ripC[G.ripI % 8]; G.ripI++;
    r.set(P.u, P.v, 0, big); c.set(...new THREE.Color(P.color).toArray());
    G.lit[i] = 1; G.swirlKick = Math.min(1.5, G.swirlKick + 0.35 * big);
    for (let k = 0; k < 3; k++) { const s = K.sprite(noteTex[(k + i) % 3], 0.045, { color: P.color, opacity: 0, order: 18 }); const [x, y] = G.S.P(P.u + (Math.random() - 0.5) * 0.06, P.v); s.position.set(x, y, 0.05); G.root.add(s); G.notes.push({ s, t: -k * 0.08, x, y, dx: (Math.random() - 0.5) * 0.08 }); }
    G.buzz(12);
  }
  function play(i, t, len) { G.band.play(PLAYERS[i].id, t, PLAYERS[i].pan, len); }
  function listen() {
    G.phase = 'listen'; G.pos = 0; hud();
    G.say(G.seq.length === START ? 'Listen.' : G.retry ? 'Listen again.' : 'Listen.');
    const t0 = G.band.nextBeat() + G.band.beat * 2;
    G.cue = G.seq.map((i, k) => ({ i, at: t0 + k * G.band.beat }));        // each note on the beat
    G.cue.forEach(c => play(c.i, c.at, 0.5));
    G.turnAt = t0 + G.seq.length * G.band.beat + 0.15;
  }
  function yourTurn() { G.phase = 'you'; G.pos = 0; G.inputT = 0; hud(); G.say('Your turn.'); }
  function tap(i) {
    if (!G.playing || G.phase !== 'you' || G.over) return;
    play(i, undefined, 0.45); react(i, 0.8);
    if (G.seq[G.pos] !== i) {   // a wrong note: the band plays it again
      G.phase = 'oops'; G.misses++; G.retry = true; G.band.oops(); G.gray = 1; G.buzz([60, 40, 60]);
      G.ui.alert('Not quite', 'Listen again', 1.4, 'black'); G.say(`That was the ${PLAYERS[i].name.toLowerCase()}. Listen again.`);
      G.waitT = 2.2; G.after = listen; hud(); return;
    }
    G.pos++; hud();
    if (G.pos >= G.seq.length) {   // the whole phrase
      G.phase = 'yeah'; G.retry = false; G.band.yeah(G.seq.length); G.flash = 1; G.phrases++;
      PLAYERS.forEach((P, k) => setTimeout(() => G && react(k, 0.6), k * 90));
      const done = G.seq.length >= GOAL;
      G.ui.pop(['Swing!', 'Smooth!', 'Cool!', 'Hot!', 'Bravo!', 'Encore!', 'Yeah!'][G.phrases % 7]);
      if (done) { G.waitT = 2.0; G.after = finish; G.say('That\'s the whole phrase! You\'re playing with the band.'); }
      else { G.seq.push(Math.floor(Math.random() * PLAYERS.length)); G.waitT = 1.8; G.after = listen; G.say(`Yes! ${G.seq.length} notes now.`); }
    }
  }
  function finish() {
    G.phase = 'done'; G.band.groove(0); G.band.finale(); G.flash = 1.5;
    PLAYERS.forEach((P, k) => setTimeout(() => G && react(k, 1.2), k * 180));
    G.endT = 0;
  }

  return {
    title: 'Jazz says',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', seq: [], pos: 0, cue: [], turnAt: 0, waitT: 0, after: null, misses: 0, phrases: 0, retry: false, lit: PLAYERS.map(() => 0), notes: [], ripI: 0,
        swirl: 0.3, swirlKick: 0, flash: 0, gray: 0, endT: -1, t0: 0, botT: 0 });
      G.rips = Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, 0, 0)); G.ripC = Array.from({ length: 8 }, () => new THREE.Vector3(1, 1, 1));
      G.uni = { map: { value: null }, uT: { value: 0 }, uH: { value: G.h }, uA: { value: 0 }, uSwirl: { value: 0.3 }, uFlash: { value: 0 }, uGray: { value: 0 }, uRip: { value: G.rips }, uRipC: { value: G.ripC } };
      G.plane = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.plane.position.z = 0.03; G.plane.renderOrder = 12; G.root.add(G.plane);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.ready = true; });
      // each player: a glow and a ring where it lives in the painting
      G.glows = PLAYERS.map(P => { const s = K.sprite(K.glowTex, 0.26, { color: P.color, additive: true, opacity: 0, order: 15 }); const [x, y] = G.S.P(P.u, P.v); s.position.set(x, y, 0.04); G.root.add(s); return s; });
      G.rings = PLAYERS.map(P => { const s = K.sprite(K.ringTex, 0.2, { color: P.color, opacity: 0, order: 16 }); const [x, y] = G.S.P(P.u, P.v); s.position.set(x, y, 0.045); G.root.add(s); return s; });
      G.band = K.audio() ? band(K.audio()) : new Proxy({ beat: 0.5 }, { get: (o, k) => (k in o ? o[k] : k === 'now' ? () => performance.now() / 1000 : k === 'nextBeat' ? () => performance.now() / 1000 + 0.5 : () => {}) });
      G.band.start();
      G.ui.buttons(PLAYERS.map((P, i) => ({ label: P.name, kind: i % 2 ? 'black' : 'red', aria: 'Play the ' + P.name.toLowerCase(), press: () => tap(i) })))
        .forEach(e => { Object.assign(e.style, { flex: '1 1 0', minWidth: '0', padding: '0 2px', fontSize: '11px', letterSpacing: '0' }); });   // five buttons fit across a phone
      hud();
      G.onGo = () => { G.t0 = G.t; G.band.overture(); G.overT = 2.8; G.band.groove(0.55); };
      K.intro(G, { title: 'Jazz says', how: 'The band plays a phrase. Play it back by tapping the players in the painting, or the buttons. Every round adds a note.',
        say: 'Jazz says. Five players live in this painting: the clarinet, top left. The trumpet, top right. The piano, on the left. The drums, in the middle at the bottom. And the bass, bottom right. The band plays a phrase. Then you play it back, by tapping the players in the painting, or with the buttons. Each round, the phrase grows by one note. Listen to the painting move!' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      const U = G.uni; U.uT.value = G.t; U.uA.value += ((G.ready && !G.over ? 1 : 0) - U.uA.value) * Math.min(1, dt * 2);
      for (const r of G.rips) if (r.w > 0) { r.z += dt; r.w = Math.max(0, r.w - dt * 0.7); }
      // the overture, then the first phrase
      if (G.overT > 0) { G.overT -= dt; if (G.overT <= 0) { G.seq = Array.from({ length: START }, () => Math.floor(Math.random() * PLAYERS.length)); listen(); } }
      // the band's notes light up the painting right on time
      const now = G.band.now();
      for (const c of G.cue) if (!c.done && now >= c.at) { c.done = true; react(c.i, 1); }
      if (G.phase === 'listen' && now >= G.turnAt && G.cue.every(c => c.done)) yourTurn();
      if (G.waitT > 0) { G.waitT -= dt; if (G.waitT <= 0 && G.after) { const f = G.after; G.after = null; f(); } }
      // the robot player taps the phrase back
      if (G.bot && G.phase === 'you') { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.45; tap(G.seq[G.pos]); } }
      // the painting: swirling with the groove, lighting up with each note, gray for a moment after a wrong note
      G.swirlKick = Math.max(0, G.swirlKick - dt * 0.8);
      const target = (G.phase === 'intro' ? 0.2 : 0.35 + Math.min(1, G.phrases / 6) * 0.5) + G.swirlKick;
      G.swirl += (target - G.swirl) * Math.min(1, dt * 3); U.uSwirl.value = G.swirl;
      G.flash = Math.max(0, G.flash - dt * 1.5); U.uFlash.value = Math.min(1, G.flash);
      G.gray = Math.max(0, G.gray - dt * 0.7); U.uGray.value = G.gray * 0.7;
      PLAYERS.forEach((P, i) => {
        G.lit[i] = Math.max(0, G.lit[i] - dt * 2.2);
        const near = G.phase === 'you' ? 0.12 : 0;
        G.glows[i].material.opacity = U.uA.value * (0.08 + near + G.lit[i] * 0.85); G.glows[i].scale.setScalar(0.22 + G.lit[i] * 0.12);
        G.rings[i].material.opacity = U.uA.value * (G.phase === 'you' ? 0.5 : 0.18 + G.lit[i] * 0.6); G.rings[i].scale.setScalar(0.18 + G.lit[i] * 0.08 + Math.sin(G.t * 3 + i) * 0.006);
      });
      for (let i = G.notes.length - 1; i >= 0; i--) { const n = G.notes[i]; n.t += dt; if (n.t < 0) continue;
        n.s.position.set(n.x + n.dx * n.t + Math.sin(n.t * 4) * 0.008, n.y + n.t * 0.09, 0.05); n.s.material.opacity = Math.min(1, n.t * 4) * Math.max(0, 1 - n.t / 1.6); n.s.material.rotation = Math.sin(n.t * 3) * 0.3;
        if (n.t > 1.6) { G.root.remove(n.s); G.notes.splice(i, 1); } }
      if (G.phase === 'done') { G.endT += dt; if (G.endT > 4 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('rhapsody-in-blue:jazz', G.misses, 'lower');
        K.finale(G, { won: true, title: 'You played with the band', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Longest phrase', v: `${GOAL} notes` }, { k: 'Do-overs', v: G.misses }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
        G.band.volume(0.6);
      } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down' || G.phase !== 'you') return;
      const p = G.S.toBoard(ev, G.root); if (!p) return;
      let best = -1, bd = HIT_R; PLAYERS.forEach((P, i) => { const d = dist(P, p); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) tap(best);
    },
    pause() { if (G) { G.paused = true; G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band.volume(G.over ? 0.6 : 1); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'jazz-says', playing: G.playing, over: G.over, phase: G.phase, len: G.seq.length, pos: G.pos, misses: G.misses, phrases: G.phrases, t: +G.t.toFixed(1) }; },
    stop() { if (G && G.band) G.band.stop(); K.cleanup(G); G = null; },
  };
}
export { band as jazzBand };   // for testing the music on its own
