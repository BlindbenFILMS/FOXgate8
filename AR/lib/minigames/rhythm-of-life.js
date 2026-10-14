// RHYTHM OF LIFE (Will Hollimon): GLOW IT BRIGHT, a singing game.
// The music faded and the painting went dim. Your voice is the light: sing, hum or "ooh", and a glowing orb rises and
// falls with your pitch (low notes down by the drums, high notes up by the light bulb and the planets); louder glows
// brighter. Hold the orb on the glowing ring to light each thing, and Will's drum groove comes back a piece at a time.
// Clap for a flash of light. No microphone (or prefer not)? Touch the screen and slide up and down: your finger is the voice.
// By ear: each thing to light is named, with "sing low / middle / high"; a buzz pulses while you're on it, and a rising
// shimmer fills as it lights. The first thing to light (Will) is in the middle, and while you hum it the game learns
// your comfortable note, so any voice works: deep, high, kid or grown-up.
import * as THREE from 'three';
import * as K from './kit.js';

const TARGETS = [
  { name: 'Will', u: 0.50, v: 0.44, where: 'middle', say: 'Hum any comfortable note to light Will.' },
  { name: 'the bass drum', u: 0.505, v: 0.80, where: 'low', say: 'Now sing low, deep down, to light the bass drum.' },
  { name: 'the light bulb', u: 0.50, v: 0.135, where: 'high', say: 'Now sing high to light the light bulb.' },
  { name: 'the little drummer', u: 0.11, v: 0.70, where: 'low', say: 'Sing a little low to light the little drummer.' },
  { name: 'the old radio', u: 0.38, v: 0.30, where: 'high', say: 'A little high now, for the old radio.' },
  { name: 'the planets', u: 0.885, v: 0.075, where: 'highest', say: 'Last one: sing your highest note to light the planets!' },
];
const HOLD = 1.5, NEAR = 0.095, OCT = 0.40;   // seconds to light one; how close counts; how far one octave moves the orb

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
  return {
    layers, crash, snare,
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
  const colFor = v => new THREE.Color().setHSL(0.08 + (1 - v) * 0.12, 0.95, 0.55 + (1 - v) * 0.25);   // low: deep orange · high: bright gold-white

  function hud() {
    const t = TARGETS[G.i];
    G.ui.panel('Glow it bright', `${G.lit}<small>of ${N} lit</small>`, { segs: [G.lit, N], sub: t ? `Sing ${t.where} for ${t.name}` : 'Everything is glowing!' });
  }
  function deaf(secs) { G.deafUntil = Math.max(G.deafUntil, G.t + secs); }
  function say(text) { G.say(text); deaf(Math.min(5, 0.6 + text.split(/\s+/).length * 0.33)); }   // don't hear our own voice as singing
  function announce() { const t = TARGETS[G.i]; if (!t) return; say(t.say); G.ring.visible = true; const [x, y] = G.S.P(t.u, t.v); G.ring.position.set(x, y, 0.06); G.prog = 0; hud(); }

  function lightIt() {
    const t = TARGETS[G.i]; t.lit = 0.001; G.lit++; G.i++;
    const [x, y] = G.S.P(t.u, t.v); G.fx.add(x, y, '#ffd25a', 34, 0.4); G.buzz([40, 40, 90]);
    K.chord([392, 494, 587, 784].map(f => f * (0.75 + (1 - t.v) * 0.6)), 1.1, { vol: 0.06 }); deaf(1.3);
    G.ui.pop(t.name.replace(/^the /, '').toUpperCase() + '!');
    const L = G.band.layers; ({ 1: () => L.kick = 1, 2: () => L.snare = 1, 3: () => L.bass = 1, 4: () => L.toms = 1, 5: () => L.ride = 1 })[G.lit]?.();
    if (G.lit >= N) { G.ring.visible = false; G.done = true; G.settle = 3.4; G.band.fill(); if (G.ear) { G.ear.stop(); G.ear = null; } G.band.duck(false); setTimeout(() => G && (G.band.layers.lead = 1), 1800); G.ui.alert('Glowing bright!', 'Will’s band is back.', 2.8, 'red'); say('Everything is glowing. Will’s band is back!'); hud(); return; }
    G.ui.alert(['The kick is back!', 'Here’s the snare!', 'The bass is in!', 'Toms rolling!', 'Cymbals!'][G.lit - 1] || 'Lit!', `${N - G.lit} to go`, 1.5, 'black');
    G.ring.visible = false; G.wait = 1.4; hud();
  }
  function clap() {
    G.claps++; G.flash = 1; G.band.crash(K.audio().currentTime + 0.01); deaf(0.35);
    TARGETS.forEach(t => { if (t.lit) { const [x, y] = G.S.P(t.u, t.v); G.fx.add(x, y, '#fff3b0', 8, 0.3); } });
    G.ui.pop('CLAP!', innerWidth * (0.3 + Math.random() * 0.4), innerHeight * 0.55); G.buzz(30);
  }

  return {
    title: 'Glow it bright',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { i: 0, lit: 0, prog: 0, orb: { v: 0.5, s: 0 }, center: 0, calib: [], deafUntil: 0, wait: 0, settle: 0, done: false, flash: 0, claps: 0, touch: null, micOK: false, slow: 0.02, lastClap: 0, ownHits: [], t0: 0, onFor: 0 });
      TARGETS.forEach(t => t.lit = 0);
      G.uni = { uOrb: { value: new THREE.Vector3(0.5, 0.5, 0) }, uOrbCol: { value: new THREE.Color(1, 0.7, 0.3) }, uH: { value: G.h }, uDim: { value: 0 }, uAll: { value: 0 }, uT: { value: 0 }, uFlash: { value: 0 },
        uSpots: { value: Array.from({ length: 6 }, () => new THREE.Vector3()) } };
      G.dark = new THREE.Mesh(new THREE.PlaneGeometry(1.004, G.h + 0.004), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.dark.position.z = 0.03; G.dark.renderOrder = 12; G.root.add(G.dark);
      G.orbS = K.sprite(K.glowTex, 0.2, { additive: true, opacity: 0, order: 16 }); G.orbS.position.z = 0.05; G.root.add(G.orbS);
      G.core = K.sprite(K.dotTex, 0.05, { additive: true, opacity: 0, order: 17 }); G.core.position.z = 0.055; G.root.add(G.core);
      G.ring = K.sprite(K.ringTex, 0.16, { color: '#ffd25a', order: 15, opacity: 0.9 }); G.ring.visible = false; G.root.add(G.ring);
      G.halo = K.sprite(K.glowTex, 0.24, { color: '#ffd25a', additive: true, opacity: 0, order: 14 }); G.halo.position.z = 0.045; G.root.add(G.halo);
      const ac = K.audio();
      G.band = drums(ac, t => G && G.ownHits.push(t));
      // the microphone (asked for inside the Play tap). Echo cancelling keeps the game from hearing its own drums.
      if (!G.bot && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } })
          .then(st => { if (!G) { st.getTracks().forEach(t => t.stop()); return; } G.ear = ear(K.audio(), st); G.micOK = true; })
          .catch(() => { if (G) { G.micNo = true; } });
      } else G.micNo = !G.bot;
      G.ui.buttons([{ label: 'Clap', icon: '👏', kind: 'red', aria: 'Clap: a flash of light', press: () => G.playing && clap() }]);
      hud();
      G.onGo = () => {
        G.t0 = G.t; G.band.start();
        if (G.micNo) { G.ui.alert('No microphone?', 'Touch the screen and slide up and down to sing.', 3, 'blue'); say('No microphone. Touch the screen and slide up and down instead.'); setTimeout(() => G && G.playing && announce(), 3500); }
        else announce();
      };
      K.intro(G, { title: 'Glow it bright', how: 'The music faded. Sing or hum: your voice is the light. Low notes glow by the drums, high notes up in the sky. Light 6 things to bring Will’s band back.',
        say: 'Glow it bright. The music faded and the painting went dim. Your voice is the light. Sing or hum: low notes glow down by the drums, high notes up in the sky, and louder glows brighter. Light six things to bring Will’s band back. Clap for a flash. No microphone? Touch the screen and slide up and down.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      G.uni.uT.value = G.t; G.uni.uDim.value += (0.72 - G.uni.uDim.value) * Math.min(1, dt * 1.2);
      G.flash = Math.max(0, G.flash - dt * 3); G.uni.uFlash.value = G.flash;
      if (G.done) G.uni.uAll.value = Math.min(1, G.uni.uAll.value + dt * 0.5);
      TARGETS.forEach((t, i) => { if (t.lit > 0 && t.lit < 1) t.lit = Math.min(1, t.lit + dt * 1.5); G.uni.uSpots.value[i].set(t.u, t.v, t.lit || 0); });

      // ── the voice: where the orb wants to be (v) and how bright (s) ──
      let wantV = null, wantS = 0;
      const ac = K.audio(), now = ac.currentTime;
      G.ownHits = G.ownHits.filter(x => x > now - 0.3);
      if (G.playing && !G.done) {
        if (G.bot) { const t = TARGETS[G.i]; if (t && G.wait <= 0) { wantV = t.v + Math.sin(G.t * 3) * 0.02; wantS = 0.8; } }
        else if (G.touch) { wantV = G.touch; wantS = 0.85; }
        else if (G.ear) {
          const { rms, f } = G.ear.read(), heard = G.t >= G.deafUntil;
          G.slow += (rms - G.slow) * Math.min(1, dt * 2);
          // a clap: a sudden, loud, un-pitched burst that isn't one of our own drum hits
          if (heard && !f && rms > 0.09 && rms > G.slow * 3.2 && G.t - G.lastClap > 0.25 && !G.ownHits.some(x => Math.abs(x - now) < 0.12)) { G.lastClap = G.t; clap(); }
          const strict = G.band.padLoud && G.t - (G.sangAt || -9) > 0.7;   // the chords are playing: only a clear, close voice counts
          if (heard && f > 70 && f < 1000 && rms > (strict ? 0.03 : 0.012)) {
            G.sangAt = G.t;
            const lf = Math.log2(f);
            if (!G.center) { G.calib.push(lf); if (G.calib.length > 25) { const s = [...G.calib].sort((a, b) => a - b); G.center = s[Math.floor(s.length / 2)]; } }
            const c = G.center || (G.calib.length ? G.calib.reduce((a, b) => a + b, 0) / G.calib.length : lf);
            wantV = Math.max(0.03, Math.min(0.97, 0.47 - (lf - c) * OCT)); wantS = Math.max(0.25, Math.min(1, (20 * Math.log10(rms) + 42) / 24));
          }
        }
      }
      const o = G.orb;
      if (!G.done) G.band.duck(wantV !== null || (G.sangAt !== undefined && G.t - G.sangAt < 0.6));
      if (wantV !== null) { o.v += (wantV - o.v) * Math.min(1, dt * 9); o.s += (wantS - o.s) * Math.min(1, dt * 8); G.onFor += dt; }
      else { o.s = Math.max(0, o.s - dt * 1.8); o.v += (0.92 - o.v) * dt * 0.25; G.onFor = 0; }   // silence: it dims and sinks
      const tgt = TARGETS[G.i];
      o.u = (o.u ?? 0.5) + ((tgt && G.wait <= 0 ? tgt.u : 0.5) - (o.u ?? 0.5)) * Math.min(1, dt * 3);
      const [x, y] = G.S.P(o.u, o.v), col = colFor(o.v);
      G.uni.uOrb.value.set(o.u, o.v, o.s); G.uni.uOrbCol.value.copy(col);
      G.orbS.position.set(x, y, 0.05); G.orbS.material.color.copy(col); G.orbS.material.opacity = o.s * 0.75 * (1 - G.uni.uAll.value); G.orbS.scale.setScalar(0.14 + o.s * 0.2);
      G.core.position.set(x, y, 0.055); G.core.material.opacity = Math.min(1, o.s * 1.4) * (1 - G.uni.uAll.value); G.core.scale.setScalar(0.03 + o.s * 0.03);
      if (G.ring.visible) { G.ring.material.opacity = 0.55 + Math.sin(G.t * 5) * 0.3; G.ring.scale.setScalar(0.15 + G.prog / HOLD * 0.06);
        G.halo.position.copy(G.ring.position); G.halo.material.opacity = G.prog / HOLD * 0.8; } else G.halo.material.opacity = 0;

      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && !G.over) {
        const t = Math.round(G.t - G.t0), r = K.best('rhythm-of-life:glow', t, 'lower');
        G.band.volume(0.45);
        K.finale(G, { won: true, title: 'Will’s band is back', line: G.work && G.work.quote, best: r.isBest,
          cells: [{ k: 'Lit', v: `${N}/${N}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }, { k: 'Claps', v: G.claps }] });
      } }
      if (!G.playing || G.done || !tgt) return;
      if (G.wait > 0) { G.wait -= dt; if (G.wait <= 0) announce(); return; }
      // on the ring: fill it up (louder fills faster)
      const on = o.s > 0.2 && Math.abs(o.v - tgt.v) < NEAR;
      if (on) {
        G.prog += dt * (0.75 + o.s * 0.5);
        G.pulse = (G.pulse || 0) - dt; if (G.pulse <= 0) { G.pulse = 0.25; G.buzz(12); }
        if (G.prog >= HOLD) lightIt();
      } else {
        G.prog = Math.max(0, G.prog - dt * 0.6);
        // a gentle spoken nudge if someone is singing but missing for a while
        G.nudgeT = (G.nudgeT || 0) + (o.s > 0.2 ? dt : 0);
        if (G.nudgeT > 5) { G.nudgeT = 0; say(o.v > tgt.v ? 'Go higher.' : 'Go lower.'); }
      }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'up') { G.touch = null; return; }
      if (kind === 'down' || (kind === 'move' && G.touch !== null)) {
        // finger height on the SCREEN is the "pitch" (top = high), so it works even when the painting is small
        G.touch = Math.max(0.03, Math.min(0.97, (ev.clientY / innerHeight - 0.18) / 0.62));
      }
    },
    pause() { if (G) { G.paused = true; G.band && G.band.volume(0); } },
    resume() { if (G) { G.paused = false; G.band && G.band.volume(G.done ? 0.45 : 0.7); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'glow', playing: G.playing, over: G.over, lit: G.lit, i: G.i, orbV: +G.orb.v.toFixed(3), orbS: +G.orb.s.toFixed(2), center: G.center ? +Math.pow(2, G.center).toFixed(1) : 0, mic: G.micOK, claps: G.claps, prog: +G.prog.toFixed(2) }; },
    stop() { if (G) { G.band && G.band.stop(); G.ear && G.ear.stop(); } K.cleanup(G); G = null; },
  };
}
export { drums as willBand };   // for testing the music on its own
