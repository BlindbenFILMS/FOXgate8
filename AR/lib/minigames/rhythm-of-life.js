// RHYTHM OF LIFE (Will Hollimon): HUM IT BACK, a call-and-response singing game.
// The music faded and the painting went dim. Will hums a little tune, and glowing notes appear in the air for each note
// (higher notes higher up); then you hum it back. Any note, any voice: it only listens for how many notes you hum, so
// "mm, mm, mm" works. Each hum lights the next glowing note, and when they're all lit the next thing in the painting
// lights up and a piece of Will's drum groove comes back. The tunes grow from 2 notes to 5. Six tunes, then the whole
// painting glows and the band plays.
// No microphone (or prefer not)? Tap the screen, or the Tap a note button, once for each note.
// By ear: Will's hum, a chime for every note you hum, "Your turn!", and "Listen again" if a note was missed.
import * as THREE from 'three';
import * as K from './kit.js';

// what lights up, in order, and the tune for each (notes: 0 low · 1 middle · 2 high)
const TARGETS = [
  { name: 'Will', u: 0.50, v: 0.44, tune: [1, 2] },
  { name: 'the bass drum', u: 0.505, v: 0.80, tune: [0, 1] },
  { name: 'the light bulb', u: 0.50, v: 0.135, tune: [0, 1, 2] },
  { name: 'the little drummer', u: 0.11, v: 0.70, tune: [2, 1, 0] },
  { name: 'the old radio', u: 0.38, v: 0.30, tune: [1, 0, 1, 2] },
  { name: 'the planets', u: 0.885, v: 0.075, tune: [0, 1, 2, 1, 2] },
];
const PITCH = [60, 64, 67];          // Will's hum: do, mi, so
const NOTE_GAP = 0.62, QUIET = 2.6;  // seconds between Will's notes; how long a pause ends your turn

/* ── Will's drum kit, made in WebAudio ── */
function drums(ac, onHit) {
  const BPM = 100, beat = 60 / BPM;
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const layers = { hats: 1, kick: 0, snare: 0, toms: 0, bass: 0, ride: 0, pad: 1, lead: 0 };
  // the chords and the finale melody have their own volume, so they can step aside while someone sings
  const padBus = ac.createGain(); padBus.gain.value = 1; padBus.connect(bus); let ducked = false;
  const warm = ac.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 1100; warm.Q.value = 0.6; warm.connect(padBus);
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  // a soft, wide chord: two slightly detuned saws per note, slow in and out
  function pad(t, notes, dur, vol = 0.028) {
    for (const m of notes) for (const det of [-7, 7]) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = midi(m); o.detune.value = det;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.45); g.gain.setValueAtTime(vol, t + dur - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
      o.connect(g).connect(warm); o.start(t); o.stop(t + dur + 0.35);
    }
  }
  // the finale melody: a bright synth lead
  function lead(t, m, d) {
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o1.type = 'square'; o2.type = 'sawtooth'; o1.frequency.value = o2.frequency.value = midi(m); o2.detune.value = 9;
    f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.05); f.frequency.exponentialRampToValueAtTime(1400, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o1.connect(f); o2.connect(f); f.connect(g).connect(padBus); o1.start(t); o2.start(t); o1.stop(t + d + 0.02); o2.stop(t + d + 0.02);
  }
  const CHORDS = [[48, 51, 55, 58, 62], [51, 55, 58, 62, 65]];   // Cm9 · Ebmaj9
  // the melody, in 16ths over two bars: [step, note, length in 16ths]
  const RIFF = [[0, 72, 2], [3, 75, 1], [4, 77, 2], [6, 79, 2], [10, 77, 1], [11, 75, 1], [12, 72, 3], [16, 70, 2], [19, 72, 1], [20, 75, 2], [22, 77, 3], [26, 79, 1], [27, 82, 1], [28, 79, 3]];
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  function noise(t, dur, freq, type, vol, q = 0.8) { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = type; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(bus); s.start(t); s.stop(t + dur + 0.02); }
  function drum(t, f0, f1, dur, vol, type = 'sine') { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.02); }
  const kick = t => { drum(t, 140, 45, 0.4, 0.55); onHit(t); };
  const snare = t => { noise(t, 0.18, 1900, 'bandpass', 0.22); drum(t, 230, 170, 0.12, 0.12, 'triangle'); onHit(t); };
  const hat = (t, v) => { noise(t, 0.04, 8000, 'highpass', v); };
  const tom = (t, f) => { drum(t, f, f * 0.6, 0.35, 0.3); onHit(t); };
  const crash = t => { noise(t, 1.4, 5200, 'highpass', 0.12, 0.4); onHit(t); };
  function bass(t, m, d) { const o = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    f.type = 'lowpass'; f.frequency.value = 500; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(f).connect(g).connect(bus); o.start(t); o.stop(t + d + 0.02); }
  const BASS = [36, 36, 39, 41, 43, 41, 39, 34];
  let next = 0, step = 0, timer = null;
  function schedule() {
    while (next < ac.currentTime + 0.15) {
      const t = next, s16 = step % 16, bar = Math.floor(step / 16);
      if (layers.hats) hat(t, s16 % 4 === 2 ? 0.09 : s16 % 2 ? 0.03 : 0.06);
      if (layers.kick && (s16 === 0 || s16 === 7 || s16 === 10)) kick(t);
      if (layers.snare && (s16 === 4 || s16 === 12)) snare(t);
      if (layers.toms && bar % 2 === 1 && s16 >= 12) tom(t, [260, 210, 170, 130][s16 - 12]);
      if (layers.bass && s16 % 2 === 0) { const i = (bar % 2) * 4 + Math.floor(s16 / 4); if (s16 % 4 === 0) bass(t, BASS[i], beat * 0.9); }
      if (layers.ride && s16 % 4 === 0) noise(t, 0.5, 6500, 'bandpass', 0.05, 2);
      if (layers.ride && bar % 4 === 0 && s16 === 0) crash(t);
      if (layers.pad && s16 === 0) pad(t, CHORDS[bar % 2], beat * 4);
      if (layers.lead) { const at = (bar % 2) * 16 + s16; for (const [st, m, d] of RIFF) if (st === at) lead(t, m, d * beat / 4 * 0.95); }
      next += beat / 4; step++;
    }
  }
  // Will's hum: a soft, round "mmm" with a little vibrato, over the quiet chords
  function hum(t, m, d) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = midi(m); o2.frequency.value = midi(m) * 2; f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 2;
    v.frequency.value = 5.5; vg.gain.value = 8; v.connect(vg); vg.connect(o.detune); vg.connect(o2.detune);
    const g2 = ac.createGain(); g2.gain.value = 0.25; o2.connect(g2).connect(f); o.connect(f); f.connect(g).connect(bus);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.07); g.gain.setValueAtTime(0.3, t + d - 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    for (const x of [o, o2, v]) { x.start(t); x.stop(t + d + 0.05); }
  }
  return {
    layers, crash, snare, hum,
    duck(on) { if (on === ducked) return; ducked = on; padBus.gain.cancelScheduledValues(ac.currentTime); padBus.gain.setTargetAtTime(on ? 0.08 : 1, ac.currentTime, on ? 0.06 : 0.5); },
    get padLoud() { return padBus.gain.value > 0.3; },
    start() { next = ac.currentTime + 0.1; timer = setInterval(schedule, 30); bus.gain.setTargetAtTime(0.7, ac.currentTime, 0.5); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.2); },
    fill() { const t = ac.currentTime + 0.05; [300, 260, 210, 170, 130, 110].forEach((f, i) => tom(t + i * beat / 4, f)); crash(t + beat * 1.5); kick(t + beat * 1.5); },
    stop() { clearInterval(timer); bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); setTimeout(() => { try { bus.disconnect(); } catch (e) {} }, 500); },
  };
}

/* ── hearing the player: pitch (autocorrelation) and loudness from the microphone ── */
function ear(ac, stream) {
  const src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 2048; src.connect(an);
  const buf = new Float32Array(an.fftSize), sr = ac.sampleRate, minLag = Math.floor(sr / 1000), maxLag = Math.floor(sr / 70), r = new Float32Array(maxLag + 2);
  return {
    read() {
      an.getFloatTimeDomainData(buf);
      let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / buf.length);
      if (rms < 0.006) return { rms, f: 0 };
      const n = buf.length; let best = 0;
      for (let lag = minLag; lag <= maxLag; lag++) { let s = 0, e1 = 0, e2 = 0; for (let i = 0; i < n - lag; i += 2) { const a = buf[i], b = buf[i + lag]; s += a * b; e1 += a * a; e2 += b * b; } r[lag] = s / Math.sqrt(e1 * e2 + 1e-12); if (r[lag] > best) best = r[lag]; }
      if (best < 0.82) return { rms, f: 0 };
      // the first strong peak (avoids jumping an octave down)
      for (let lag = minLag + 1; lag < maxLag; lag++) if (r[lag] >= best * 0.93 && r[lag] >= r[lag - 1] && r[lag] >= r[lag + 1]) {
        const a = r[lag - 1], b = r[lag], c = r[lag + 1], sh = (a - c) / (2 * (a - 2 * b + c) || 1);   // a little more exact
        return { rms, f: sr / (lag + sh) };
      }
      return { rms, f: 0 };
    },
    stop() { try { src.disconnect(); } catch (e) {} stream.getTracks().forEach(t => t.stop()); },
  };
}

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
varying vec2 vUv;
uniform vec3 uOrb; uniform vec3 uOrbCol; uniform float uH, uDim, uAll, uT, uFlash;
uniform vec3 uSpots[6];
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float d = length((p - uOrb.xy) * vec2(1.0, uH));
  float orb = uOrb.z * smoothstep(0.14 + uOrb.z * 0.16, 0.02, d);
  float lit = 0.0;
  for (int i = 0; i < 6; i++) { vec3 s = uSpots[i]; float ds = length((p - s.xy) * vec2(1.0, uH)); lit += s.z * smoothstep(0.17, 0.03, ds) * (0.85 + 0.15 * sin(uT * 4.2 + float(i) * 1.7)); }
  float light = clamp(orb + lit + uFlash * 0.5, 0.0, 1.0);
  float a = uDim * (1.0 - light) * (1.0 - uAll);
  gl_FragColor = vec4(0.02, 0.05, 0.06, a);
}`;

export function rhythmOfLifeGame() {
  let G = null;
  const N = TARGETS.length;
  const colFor = lvl => new THREE.Color(['#ff9a3c', '#ffc94a', '#fff3b8'][lvl]);

  function hud() {
    const t = TARGETS[G.i], sub = !t ? 'Everything is glowing!' : G.phase === 'listen' ? 'Listen to Will hum…' : G.phase === 'you' ? `Your turn: hum ${t.tune.length} notes (${G.got} of ${t.tune.length})` : 'Get ready…';
    G.ui.panel('Hum it back', `${G.lit}<small>of ${N} lit</small>`, { segs: [G.lit, N], sub });
  }
  function deaf(secs) { G.deafUntil = Math.max(G.deafUntil, G.t + secs); }
  function say(text) { G.say(text); deaf(Math.min(5, 0.6 + text.split(/\s+/).length * 0.33)); }   // don't hear our own voice as humming
  // the glowing notes in the air for this tune: a little arc over the thing to light, higher notes higher up
  function makeDots() {
    G.dots.forEach(d => { G.root.remove(d.glow); G.root.remove(d.core); }); G.dots = [];
    const t = TARGETS[G.i], n = t.tune.length, span = Math.min(0.5, 0.12 * n);
    const cu = Math.max(span / 2 + 0.06, Math.min(1 - span / 2 - 0.06, t.u)), base = Math.max(0.2, Math.min(0.86, t.v + (t.v < 0.3 ? 0.17 : -0.1)));
    t.tune.forEach((lvl, k) => {
      const u = cu - span / 2 + (n > 1 ? k / (n - 1) : 0.5) * span, v = base - (lvl - 1) * 0.07, [x, y] = G.S.P(u, v);
      const glow = K.sprite(K.glowTex, 0.11, { color: colFor(lvl), additive: true, opacity: 0, order: 18 }); glow.position.set(x, y, 0.06); G.root.add(glow);
      const core = K.sprite(G.noteTex, 0.05, { color: '#ffffff', opacity: 0, order: 19 }); core.position.set(x, y, 0.065); G.root.add(core);
      G.dots.push({ u, v, lvl, glow, core, played: 0, lit: 0 });
    });
  }
  function listen(again) {
    G.phase = 'listen'; G.got = 0; G.dots.forEach(d => { d.lit = 0; d.played = 0; });
    const t = TARGETS[G.i], ac = K.audio(), t0 = ac.currentTime + (again ? 0.9 : 1.3);
    say(again ? 'Listen again.' : G.i === 0 ? 'Listen to Will hum.' : 'Listen.');
    t.tune.forEach((lvl, k) => G.band.hum(t0 + k * NOTE_GAP, PITCH[lvl], NOTE_GAP * 0.85));
    G.cues = t.tune.map((lvl, k) => ({ k, at: t0 + k * NOTE_GAP }));
    G.turnAt = t0 + t.tune.length * NOTE_GAP + 0.15;
    deaf((G.turnAt - ac.currentTime) + 0.5);   // don't hear Will's hum as yours
    hud();
  }
  function yourTurn() { G.phase = 'you'; G.lastHum = G.t; G.ui.alert('Your turn!', 'Hum it back', 1.1, 'blue'); G.say('Your turn!'); deaf(0.7); hud(); }
  // one note hummed (or tapped): the next glowing note lights up, with a chime
  function hummed() {
    if (G.phase !== 'you') return;
    const d = G.dots[G.got]; if (!d) return;
    d.lit = 1; G.got++; G.lastHum = G.t; G.orbTo = d;
    K.tone(440 * Math.pow(2, (PITCH[d.lvl] + 12 - 69) / 12), 0.35, { type: 'triangle', vol: 0.07 }); G.buzz(15);
    const [x, y] = G.S.P(d.u, d.v); G.fx.add(x, y, '#ffe9a0', 10, 0.2);
    if (G.got >= G.dots.length) { G.phase = 'lit'; G.wait = 0.6; }
    hud();
  }
  function lightIt() {
    const t = TARGETS[G.i]; t.lit = 0.001; G.lit++; G.i++;
    const [x, y] = G.S.P(t.u, t.v); G.fx.add(x, y, '#ffd25a', 34, 0.4); G.buzz([40, 40, 90]);
    K.chord([392, 494, 587, 784].map(f => f * (0.75 + (1 - t.v) * 0.6)), 1.1, { vol: 0.06 }); deaf(1.3);
    G.ui.pop(t.name.replace(/^the /, '').toUpperCase() + '!');
    G.dots.forEach(d => { d.fade = true; });
    const L = G.band.layers; ({ 1: () => L.kick = 1, 2: () => L.snare = 1, 3: () => L.bass = 1, 4: () => L.toms = 1, 5: () => L.ride = 1 })[G.lit]?.();
    if (G.lit >= N) { G.done = true; G.settle = 3.4; G.band.fill(); if (G.ear) { G.ear.stop(); G.ear = null; } G.band.duck(false); setTimeout(() => G && (G.band.layers.lead = 1), 1800); G.ui.alert('Glowing bright!', 'Will’s band is back.', 2.8, 'red'); say('Everything is glowing. Will’s band is back!'); hud(); return; }
    G.ui.alert(['The kick is back!', 'Here’s the snare!', 'The bass is in!', 'Toms rolling!', 'Cymbals!'][G.lit - 1] || 'Lit!', `${N - G.lit} to go`, 1.5, 'black');
    G.phase = 'next'; G.wait = 1.8; hud();
  }

  return {
    title: 'Hum it back',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { i: 0, lit: 0, phase: 'intro', got: 0, dots: [], cues: [], turnAt: 0, lastHum: 0, orb: { u: 0.5, v: 0.5, s: 0 }, orbTo: null, deafUntil: 0, wait: 0, settle: 0, done: false,
        voiced: 0, quiet: 1, micOK: false, misses: 0, t0: 0, botT: 0 });
      TARGETS.forEach(t => t.lit = 0);
      G.noteTex = K.canvasTex(96, 96, (g) => { g.font = '900 76px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText('♪', 48, 52); });
      G.uni = { uOrb: { value: new THREE.Vector3(0.5, 0.5, 0) }, uOrbCol: { value: new THREE.Color(1, 0.7, 0.3) }, uH: { value: G.h }, uDim: { value: 0 }, uAll: { value: 0 }, uT: { value: 0 }, uFlash: { value: 0 },
        uSpots: { value: Array.from({ length: 6 }, () => new THREE.Vector3()) } };
      G.dark = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.dark.position.z = 0.03; G.dark.renderOrder = 12; G.root.add(G.dark);
      G.orbS = K.sprite(K.glowTex, 0.2, { additive: true, opacity: 0, order: 16 }); G.orbS.position.z = 0.05; G.root.add(G.orbS);
      const ac = K.audio();
      G.band = drums(ac, () => {});
      // the microphone (asked for inside the Play tap). Echo cancelling keeps the game from hearing its own music.
      if (!G.bot && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false } })
          .then(st => { if (!G) { st.getTracks().forEach(t => t.stop()); return; } G.ear = ear(K.audio(), st); G.micOK = true; })
          .catch(() => { if (G) G.micNo = true; });
      } else G.micNo = !G.bot;
      G.ui.buttons([
        { label: 'Hear it again', icon: '↻', kind: 'black', aria: 'Hear Will hum the tune again', press: () => { if (G.playing && (G.phase === 'you' || G.phase === 'listen')) listen(true); } },
        { label: 'Tap a note', icon: '♪', kind: 'red', aria: 'Tap once for each note, instead of humming', press: () => G.playing && hummed() },
      ]);
      hud();
      G.onGo = () => {
        G.t0 = G.t; G.band.start(); G.band.duck(true); makeDots();
        if (G.micNo) { G.ui.alert('No microphone?', 'Tap the screen once for each note.', 3, 'blue'); say('No microphone. Tap the screen once for each note instead.'); setTimeout(() => G && G.playing && listen(), 3500); }
        else listen();
      };
      K.intro(G, { title: 'Hum it back', how: 'Will hums a little tune. Hum it back: any note works, just one hum for each note. Each tune lights up the painting and brings Will’s band back.',
        say: 'Hum it back. The music faded and the painting went dim. Will hums a little tune, and you hum it back. Any note, any voice: just one hum for each note, like mm, mm. Each tune lights up the painting and brings Will’s band back, piece by piece. No microphone? Tap the screen once for each note.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t; G.uni.uDim.value += (0.72 - G.uni.uDim.value) * Math.min(1, dt * 1.2);
      if (G.done) G.uni.uAll.value = Math.min(1, G.uni.uAll.value + dt * 0.5);
      TARGETS.forEach((t, i) => { if (t.lit > 0 && t.lit < 1) t.lit = Math.min(1, t.lit + dt * 1.5); G.uni.uSpots.value[i].set(t.u, t.v, t.lit || 0); });
      const ac = K.audio(), now = ac.currentTime;
      // Will's notes appear as he hums them, and the orb sings along with them
      for (const c of G.cues) if (!c.done && now >= c.at) { c.done = true; const d = G.dots[c.k]; if (d) { d.played = 1; G.orbTo = d; } }
      if (G.phase === 'listen' && now >= G.turnAt && G.cues.every(c => c.done)) yourTurn();
      // your hums: each voiced stretch after a little quiet is one note (any pitch counts)
      if (G.phase === 'you' && G.ear && G.t >= G.deafUntil) {
        const { rms, f } = G.ear.read(), on = rms > 0.014 && (f > 60 || rms > 0.04);
        if (on) { G.voiced += dt; if (G.voiced > 0.1 && G.quiet > 0.12) { G.quiet = 0; hummed(); } }
        else { G.voiced = 0; G.quiet += dt; }
      }
      if (G.phase === 'you') {
        if (G.bot) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.5; hummed(); } }
        if (G.got > 0 && G.t - G.lastHum > QUIET) { G.misses++; G.ui.alert('Almost!', `That was ${G.got} of ${G.dots.length}. Listen again.`, 1.6, 'black'); listen(true); }
        else if (G.got === 0 && G.t - G.lastHum > 7) { G.lastHum = G.t; say('Hum it back: mm, mm.'); }
      }
      if (G.wait > 0) { G.wait -= dt; if (G.wait <= 0) { if (G.phase === 'lit') lightIt(); else if (G.phase === 'next') { makeDots(); listen(); } } }
      // the notes in the air: faint until played, bright when Will hums them, golden when you hum them back
      G.dots.forEach(d => {
        const want = d.fade ? 0 : d.lit ? 1 : G.phase === 'listen' && d.played ? 0.85 : G.phase === 'you' ? 0.4 : 0.2;
        d.a = (d.a || 0) + (want - (d.a || 0)) * Math.min(1, dt * 6);
        d.glow.material.opacity = d.a * 0.9; d.core.material.opacity = Math.min(1, d.a * 1.3);
        d.glow.scale.setScalar(0.11 + d.a * 0.11 + (d.lit ? Math.sin(G.t * 6) * 0.012 : 0)); d.core.scale.setScalar(0.05 + d.a * 0.04);
      });
      // the orb: drifts to whichever note is sounding, glowing with it
      const o = G.orb, to = G.orbTo;
      if (to) { o.u += (to.u - o.u) * Math.min(1, dt * 10); o.v += (to.v - o.v) * Math.min(1, dt * 10); o.s = Math.min(1, o.s + dt * 6); }
      o.s = Math.max(0, o.s - dt * (to ? 0.6 : 1.5)); if (o.s < 0.05) G.orbTo = null;
      const [x, y] = G.S.P(o.u, o.v);
      G.uni.uOrb.value.set(o.u, o.v, o.s * 0.8);
      G.orbS.position.set(x, y, 0.05); G.orbS.material.color.copy(colFor(to ? to.lvl : 1)); G.orbS.material.opacity = o.s * 0.7 * (1 - G.uni.uAll.value); G.orbS.scale.setScalar(0.12 + o.s * 0.12);
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('rhythm-of-life:hum', G.misses, 'lower');
        G.band.volume(0.45);
        K.finale(G, { won: true, title: 'Will’s band is back', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Tunes', v: `${N}/${N}` }, { k: 'Do-overs', v: G.misses }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
      } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      hummed();   // a tap is a note, for anyone not using the microphone
    },
    pause() { if (G) { G.paused = true; G.band && G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band && G.band.volume(G.done ? 0.45 : 0.7); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'hum-back', playing: G.playing, over: G.over, lit: G.lit, i: G.i, phase: G.phase, got: G.got, notes: G.dots.length, misses: G.misses, mic: G.micOK }; },
    stop() { if (G) { G.band && G.band.stop(); G.ear && G.ear.stop(); } K.cleanup(G); G = null; },
  };
}
export { drums as willBand };   // for testing the music on its own
