// MOVE THE NEEDLE (Nikki Jeffords): YOUR VOICE MOVES THE NEEDLE.
// The painting is a sound wave: the white line across the middle is its axis, and the hundreds of coloured marks are
// its loudness, spreading out from the middle. Nikki's words are about "moving the needle": making change. Here the
// two go together: your voice comes into the painting and the wave comes alive with it (the marks ripple, stretch
// taller and spread out the louder you are, and shift colour with how high or low you sing), and your voice moves the
// needle of a big studio VU meter. Six short rounds, each one spoken: make the needle move; hum softly and hold it in
// the middle; louder, into the red; a high note; a low note; and everyone together, the biggest wave. Every round
// won lights the wave up more and the narrator says "You moved the needle." In the last round the game records a few
// seconds of your voice and plays it back as the whole painting lights up: "Your voice moved the needle."
// For players who can't see the meter: a soft ticking follows the needle (faster and higher as it rises, a bell
// when you're in the zone), and short spoken cues: "Louder." "Softer." "Hold it." "Higher." "Lower."
// No microphone (or it's not allowed)? HOLD TO HUM plays a hum that swells the longer you hold it; HIGH HUM is the high
// note. The microphone is asked for when the game starts (inside the Play tap).
// Drawn pieces: needle-voice-things.js (the VU meter and the painting's little marks).
import * as THREE from 'three';
import * as K from './kit.js';
import { meter, markTex, MARK_COLORS, MID, REDZ } from './needle-voice-things.js';

const CLIP = new URL('../../../3D/gallery/audio/wing_5_1.mp3', import.meta.url).href;   // Nikki saying it, in her own words
const CLIP2 = new URL('../../media/clips/move-the-needle.mp4', import.meta.url).href;   // backup: the sound of her statement video
const C = [0.5, 0.497];   // the crosshair: the wave's axis
const ROUNDS = [
  { id: 'move', say: 'Make the needle move.', sub: 'Speak, sing or hum', need: 0.35 },
  { id: 'mid', say: 'Hum softly. Keep the needle in the middle.', sub: 'Hold it in the blue', need: 2.0, zone: 'mid' },
  { id: 'loud', say: 'Now louder! Reach the red.', sub: 'All the way up', need: 0.4, zone: 'red' },
  { id: 'high', say: 'Sing a high note.', sub: 'No mic? Hold High hum', need: 1.0 },
  { id: 'low', say: 'Now a low note.', sub: 'No mic? Hold to hum', need: 1.0 },
  { id: 'big', say: 'Everyone together. Make the biggest wave.', sub: 'Keep it big', need: 2.5, zone: 'red' },
];
const N = ROUNDS.length;
const WIN = 'You moved the needle.';

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the painting as a living sound wave: it stretches taller and spreads wider with the voice, ripples along the axis,
// shifts colour with pitch (high: cool and bright; low: warm), and gets brighter with every round won
const FRAG = `
varying vec2 vUv;
uniform sampler2D map;
uniform float uT, uA, uLevel, uPitch, uLit, uFin, uPhase;
uniform vec2 uC;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y);
  float L = clamp(uLevel + uFin * 0.35, 0.0, 1.3);
  float dx = p.x - uC.x;
  // a travelling ripple along the axis: shorter waves for high notes, longer for low
  float freq = mix(3.0, 9.0, uPitch * 0.5 + 0.5);
  float wave = 0.5 + 0.5 * sin(dx * freq * 6.2832 - uPhase);
  float stretch = 1.0 + L * (0.35 + 0.75 * wave);
  float spread = 1.0 + L * 0.22;
  vec2 s = vec2(uC.x + dx / spread, uC.y + (p.y - uC.y) / stretch);
  vec3 col = texture2D(map, vec2(clamp(s.x, 0.001, 0.999), 1.0 - clamp(s.y, 0.001, 0.999))).rgb;
  // keep the white axis line crisp (it doesn't stretch)
  vec3 orig = texture2D(map, vUv).rgb;
  float axis = step(0.85, min(orig.r, min(orig.g, orig.b))) * (1.0 - smoothstep(0.0, 0.004, abs(p.y - uC.y)));
  float lum = max(col.r, max(col.g, col.b)), mark = smoothstep(0.22, 0.5, lum);
  float h = hash(floor(s * 160.0));
  float tw = 0.8 + 0.3 * sin(uT * (2.0 + h * 4.0) + h * 40.0) * (0.3 + L);
  // pitch colour
  vec3 c2 = col;
  c2 = mix(c2, c2 * vec3(0.8, 1.0, 1.35) + 0.08, clamp(uPitch, 0.0, 1.0) * L * 0.8);
  c2 = mix(c2, c2 * vec3(1.35, 0.95, 0.7), clamp(-uPitch, 0.0, 1.0) * L * 0.8);
  float bright = mix(0.35, 1.0, uLit) * tw + L * 0.45;
  vec3 lit = mix(col * 0.9, c2 * bright, mark);
  lit = mix(lit, vec3(1.0), axis * (0.6 + 0.4 * uLit));
  gl_FragColor = vec4(lit, uA);
}`;

/* ───────────── hearing the player: loudness and pitch from the microphone (as in rhythm-of-life.js) ───────────── */
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
      if (best < 0.8) return { rms, f: 0 };
      for (let lag = minLag + 1; lag < maxLag; lag++) if (r[lag] >= best * 0.93 && r[lag] >= r[lag - 1] && r[lag] >= r[lag + 1]) {
        const a = r[lag - 1], b = r[lag], c = r[lag + 1], sh = (a - c) / (2 * (a - 2 * b + c) || 1);
        return { rms, f: sr / (lag + sh) };
      }
      return { rms, f: 0 };
    },
    stop() { try { src.disconnect(); } catch (e) {} stream.getTracks().forEach(t => t.stop()); },
  };
}

/* ───────────── sound: the hum you can hold, the guide ticks, a soft pad, cheers ───────────── */
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
function band(ac) {
  const bus = ac.createGain(); bus.gain.value = 0; bus.connect(ac.destination);
  const fx = ac.createGain(); fx.gain.value = 1; fx.connect(ac.destination);
  const nb = (() => { const b = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const pan = (p, dest) => { if (!ac.createStereoPanner) return dest; const n = ac.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p)); n.connect(dest); return n; };
  function tone(t, f, dur, { type = 'sine', vol = 0.1, att = 0.01, dest = fx, p = 0, slide = 0 } = {}) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(pan(p, dest)); o.start(t); o.stop(t + dur + 0.03);
  }
  function noise(t, dur, { freq = 2000, q = 1, vol = 0.1, p = 0 } = {}) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f).connect(g).connect(pan(p, fx)); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  // the hum: two voices through "mm" formants, its loudness and pitch set every frame
  const humG = ac.createGain(); humG.gain.value = 0; const hf = ac.createBiquadFilter(); hf.type = 'lowpass'; hf.frequency.value = 900; hf.Q.value = 2; hf.connect(humG).connect(fx);
  const humO = [0, 1].map(i => { const o = ac.createOscillator(); o.type = i ? 'triangle' : 'sawtooth'; o.frequency.value = 130; const g = ac.createGain(); g.gain.value = i ? 0.6 : 0.25; o.connect(g).connect(hf); o.start(); return o; });
  // the pad: soft, under everything
  const padG = ac.createGain(); padG.gain.value = 0; const plp = ac.createBiquadFilter(); plp.type = 'lowpass'; plp.frequency.value = 500; plp.connect(padG).connect(bus);
  const padO = [45, 52, 57, 61, 64].map((m, i) => { const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = midi(m) * (1 + (i - 2) * 0.002); o.connect(plp); o.start(); return o; });
  return {
    start() { bus.gain.setTargetAtTime(0.9, ac.currentTime, 1); padG.gain.setTargetAtTime(0.025, ac.currentTime, 1.5); },
    lit(k) { plp.frequency.setTargetAtTime(500 + k * 500, ac.currentTime, 0.8); padG.gain.setTargetAtTime(0.025 + k * 0.006, ac.currentTime, 0.8); },
    hum(level, high) {
      const t = ac.currentTime, f = high ? 392 : 131;
      humO.forEach((o, i) => o.frequency.setTargetAtTime(f * (i ? 1.003 : 1), t, 0.06));
      humG.gain.setTargetAtTime(level * 0.22, t, 0.04); hf.frequency.setTargetAtTime(500 + level * 1400, t, 0.05);
    },
    // the guide: one soft tick, higher as the needle rises; a little bell when you're where you should be
    tick(v, inZone) { const t = ac.currentTime + 0.005; if (inZone) tone(t, midi(84), 0.18, { type: 'triangle', vol: 0.035 }); else tone(t, 300 + v * 900, 0.035, { type: 'square', vol: 0.02 }); },
    volume(v) { bus.gain.setTargetAtTime(v, ac.currentTime, 0.2); fx.gain.setTargetAtTime(v ? 1 : 0, ac.currentTime, 0.2); },
    // a round won: a bright little fanfare and a crowd of claps from both sides
    cheer(k) {
      const t = ac.currentTime + 0.02;
      [0, 4, 7, 12, 16].forEach((s, i) => tone(t + i * 0.08, midi(64 + k + s), 0.9, { type: 'triangle', vol: 0.08, att: 0.005 }));
      for (let i = 0; i < 26; i++) noise(t + 0.15 + i * 0.045 + Math.random() * 0.06, 0.06, { freq: 1200 + Math.random() * 1500, q: 0.8, vol: 0.18, p: Math.random() * 1.8 - 0.9 });
    },
    swell() { const t = ac.currentTime + 0.1; [45, 52, 57, 61, 64, 69, 73, 76, 81, 85].forEach((m, i) => tone(t + i * 0.15, midi(m), 4.5, { type: 'triangle', vol: 0.045, att: 0.3 })); },
    stop() { try { bus.gain.setTargetAtTime(0, ac.currentTime, 0.1); fx.gain.setTargetAtTime(0, ac.currentTime, 0.1); [...humO, ...padO].forEach(o => o.stop(ac.currentTime + 0.4)); } catch (e) {} },
  };
}

export function needleVoiceGame() {
  let G = null;

  const round = () => ROUNDS[G.r];
  function hud() {
    const R = round();
    G.ui.panel('Move the needle', G.r < N ? `${G.r + 1}<small>of ${N}</small>` : `${N}<small>of ${N}</small>`, { segs: [G.won, N], sub: G.r < N ? R.say : 'Your voice moved the needle' });
  }
  function startRound() {
    const R = round(); G.prog = 0; G.roundT = 0; G.cueT = 3.5; G.wasIn = false; G.phase = 'round';
    G.meter.zone(R.zone || null); hud();
    G.say(R.say); G.ui.alert(R.say.replace(/\.$/, ''), R.sub, 2.6, 'black');
    if (R.id === 'big') record();
  }
  function winRound() {
    G.phase = 'cheer'; G.won++; G.cheerT = G.bot ? 1.6 : 3.0;
    G.band.cheer(G.won); G.band.lit(G.won); G.meter.flash(); G.buzz([30, 40, 30, 40, 90]);
    G.ui.alert(WIN.replace(/\.$/, '') + '!', `${G.won} of ${N}`, 2.4, 'red'); G.say(WIN);
    for (let i = 0; i < 3; i++) { const [x, y] = G.S.P(0.2 + 0.3 * i, 0.497); G.fx.add(x, y, MARK_COLORS[(G.won + i) % MARK_COLORS.length], 22, 0.35); }
    G.meter.zone(null); hud();
    if (round().id === 'big') stopRecording();
  }
  // the microphone: asked for as the game starts (inside the Play tap)
  function askMic() {
    if (G.bot || !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { G.micNo = !G.bot; return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } })
      .then(st => { if (!G) { st.getTracks().forEach(t => t.stop()); return; } G.stream = st; G.ear = ear(K.audio(), st); G.micOK = true; })
      .catch(() => { if (G) { G.micNo = true; if (G.playing) noMic(); } });
  }
  function noMic() { if (G.noMicSaid) return; G.noMicSaid = true; G.ui.alert('No microphone?', 'Hold the Hum button instead', 3, 'blue'); G.say('No microphone. Hold the Hum button instead.'); }
  // a few seconds of the player's own voice, from the last round, to play back at the end
  function record() {
    try {
      if (!G.stream || typeof MediaRecorder === 'undefined') return;
      const rec = new MediaRecorder(G.stream), chunks = [];
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => { if (!G || !chunks.length) return; try { G.recURL = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })); } catch (e) {} };
      rec.start(); G.rec = rec; G.recT = 8;
    } catch (e) { G.rec = null; }
  }
  function stopRecording() { try { if (G.rec && G.rec.state !== 'inactive') G.rec.stop(); } catch (e) {} G.recT = 0; }
  // play their voice back, and let it drive the wave
  function playback() {
    if (!G.recURL) { G.band.hum(0, false); G.replayHum = 2.4; return; }   // no recording (the Hum button, or no recorder): the hum sings it back
    try {
      const ac = K.audio(), a = new Audio(G.recURL); G.replay = a;
      try { const src = ac.createMediaElementSource(a), an = ac.createAnalyser(); an.fftSize = 1024; src.connect(an); an.connect(ac.destination); G.replayAn = an; } catch (e) { G.replayAn = null; }
      a.play().catch(() => { G.replay = null; });
    } catch (e) { G.replay = null; }
  }
  function playClip() {
    try {
      const a = new Audio(CLIP); G.clip = a;
      let tried = false;
      const last = () => { if (G && G.clip === b) { G.clip = null; if (G.work && G.work.quote) G.say(G.work.quote); } };
      let b = null;
      const fallback = () => { if (tried || !G || G.clip !== a) return; tried = true; b = new Audio(CLIP2); G.clip = b; b.addEventListener('error', last, { once: true }); b.play().catch(last); };
      a.addEventListener('error', fallback, { once: true }); a.play().catch(fallback);
    } catch (e) {}
  }
  function finale() {
    G.phase = 'finale'; G.finT = 0; G.ui.buttons([]); G.band.hum(0, false); G.band.swell(); G.band.lit(N + 2); G.meter.zone('all');
    G.ui.alert('Your voice moved the needle', 'Listen: that was you', 3.5, 'red'); G.say('Your voice moved the needle.');
    setTimeout(() => { if (G && !G.over) playback(); }, G.bot ? 300 : 2200);
    setTimeout(() => {
      if (!G) return;
      const t = Math.round(G.t - G.t0);
      K.finale(G, { won: true, kicker: 'Move the needle', title: 'You moved the needle', line: G.work && G.work.quote,
        cells: [{ k: 'Rounds', v: `${N}/${N}` }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }], say: 'It is a big deal.' });
      if (!G.bot) setTimeout(() => G && playClip(), 2600);
    }, G.bot ? 2500 : 6500);
  }

  // every frame: how loud (0..1) and how high (−1 low … 1 high) the player is, from the mic, the Hum buttons or the robot
  function listen(dt) {
    let lvl = 0, pitch = null;
    if (G.ear && !G.paused) {
      const { rms, f } = G.ear.read();
      const db = 20 * Math.log10(rms + 1e-9); lvl = Math.max(0, Math.min(1.05, (db + 46) / 34));
      if (f > 0 && lvl > 0.15) {
        if (G.r < 3) G.base = Math.exp(Math.log(G.base) + (Math.log(f) - Math.log(G.base)) * Math.min(1, dt * 0.8));   // learn their everyday voice in the first rounds
        pitch = Math.max(-1, Math.min(1, Math.log2(f / G.base) * 2.5));
      }
    }
    // the Hum buttons: the longer you hold, the louder it swells; let go and it falls
    if (G.holding) G.hum += (1.05 - G.hum) * Math.min(1, dt * 0.65); else G.hum = Math.max(0, G.hum - dt * 0.45);
    G.band.hum(G.paused ? 0 : G.hum, G.holdHigh);
    if (G.hum > lvl) { lvl = G.hum; if (G.hum > 0.12) pitch = G.holdHigh ? 0.85 : -0.85; }
    if (G.bot && G.phase === 'round') {
      const id = round().id, w = Math.sin(G.t * 3) * 0.04;
      const want = { move: 0.5, mid: 0.5, loud: 0.95, high: 0.6, low: 0.6, big: 0.9 }[id];
      lvl = G.roundT > 0.6 ? want + w : 0.05; pitch = id === 'high' ? 0.8 : id === 'low' ? -0.8 : 0;
    }
    if (G.replayAn) { const b = new Float32Array(1024); G.replayAn.getFloatTimeDomainData(b); let r = 0; for (const x of b) r += x * x; r = Math.sqrt(r / b.length); lvl = Math.max(lvl, Math.min(1, (20 * Math.log10(r + 1e-9) + 46) / 34)); }
    if (G.replayHum > 0) { G.replayHum -= dt; const k = Math.sin(Math.min(1, 1 - G.replayHum / 2.4) * Math.PI); G.band.hum(k, Math.floor(G.t * 1.5) % 2 === 0); lvl = Math.max(lvl, k); }
    // the meter's ballistics: rises fast, falls a little slower
    G.level += (lvl - G.level) * Math.min(1, dt * (lvl > G.level ? 14 : 5));
    if (pitch !== null) G.pitch += (pitch - G.pitch) * Math.min(1, dt * 6); else G.pitch *= Math.pow(0.4, dt);
    G.voiced = G.level > 0.18;
  }
  function judge(dt) {
    const R = round(), L = G.level, P = G.pitch; G.roundT += dt;
    if (G.roundT < 0.4) return;
    let ok = false, cue = null, inZone = false;
    if (R.id === 'move') { ok = L > 0.25; if (!G.voiced && G.roundT > 6) cue = 'Louder.'; }
    else if (R.id === 'mid') { inZone = L >= MID[0] && L <= MID[1]; ok = inZone; cue = inZone ? (!G.wasIn ? 'Hold it.' : null) : L < MID[0] ? 'Louder.' : 'Softer.'; }
    else if (R.id === 'loud') { inZone = L >= REDZ; ok = inZone; if (!inZone && G.voiced) cue = 'Louder.'; }
    else if (R.id === 'high') { ok = G.voiced && P > 0.3; if (G.voiced && !ok) cue = 'Higher.'; }
    else if (R.id === 'low') { ok = G.voiced && P < -0.25; if (G.voiced && !ok) cue = 'Lower.'; }
    else if (R.id === 'big') { inZone = L >= 0.7; ok = inZone; cue = inZone ? 'Keep going.' : G.voiced ? 'Louder.' : null; }
    // nobody gets stuck: after a while any good strong sound will do
    if (!ok && G.roundT > 25 && G.voiced && L > 0.3) ok = true;
    if (ok) G.prog += dt; else G.prog = Math.max(0, G.prog - dt * (R.id === 'mid' ? 0.35 : 0.6));
    if (inZone && !G.wasIn) G.band.tick(L, true);
    G.wasIn = inZone;
    // short spoken cues, not too often
    G.cueT -= dt;
    if (cue && G.cueT <= 0) { G.say(cue); G.cueT = cue === 'Hold it.' || cue === 'Keep going.' ? 3.5 : 2.6; }
    if (!G.voiced && G.roundT > 12 && G.cueT <= 0) { G.say(R.say); G.cueT = 8; }
    G.ui.panel('Move the needle', `${G.r + 1}<small>of ${N}</small>`, { segs: [G.won, N], sub: R.say + (G.prog > 0.05 ? '  ' + '■'.repeat(Math.ceil(Math.min(1, G.prog / R.need) * 5)) : '') });
    if (G.prog >= R.need) winRound();
  }

  return {
    title: 'Move the needle',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { phase: 'intro', r: 0, won: 0, prog: 0, roundT: 0, cueT: 0, cheerT: 0, level: 0, pitch: 0, hum: 0, holding: false, holdHigh: false, base: 190, voiced: false, tickT: 0,
        sparkT: 0, sparks: [], phaseW: 0, lit: 0, finT: 0, t0: 0, replayHum: 0 });
      G.band = band(K.audio());
      G.uni = { map: { value: null }, uT: { value: 0 }, uA: { value: 0 }, uLevel: { value: 0 }, uPitch: { value: 0 }, uLit: { value: 0 }, uFin: { value: 0 }, uPhase: { value: 0 }, uC: { value: new THREE.Vector2(...C) } };
      G.face = new THREE.Mesh(new THREE.PlaneGeometry(1.002, G.h + 0.002), new THREE.ShaderMaterial({ uniforms: G.uni, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false }));
      G.face.position.z = 0.03; G.face.renderOrder = 12; G.face.visible = false; G.root.add(G.face);
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { if (!G) return; t.colorSpace = THREE.NoColorSpace; G.uni.map.value = t; G.face.visible = true; });
      // the VU meter, low on the painting (the painting is black there)
      G.meter = meter(0.44); const [mx, my] = G.S.P(0.5, 0.835); G.meter.group.position.set(mx, my, 0.06); G.root.add(G.meter.group);
      // rings that pulse out from the middle when you make a sound
      G.rings = [0, 1, 2].map(() => { const r = K.sprite(K.ringTex, 0.1, { color: '#ffffff', opacity: 0, order: 20, additive: true }); r.position.z = 0.05; G.root.add(r); return { r, k: 1 }; });
      askMic();
      const holdBtn = (high) => ({ press: () => { if (!G || G.over) return; G.holding = true; G.holdHigh = high; G.buzz(15); }, release: () => { if (G) G.holding = false; } });
      G.onGo = () => {
        G.t0 = G.t; G.band.start();
        G.ui.buttons([
          { label: 'Hold to hum', kind: 'red', aria: 'Hold to hum: the longer you hold, the louder it gets', ...holdBtn(false) },
          { label: 'High hum', kind: 'black', aria: 'Hold for a high hum', ...holdBtn(true) },
        ]);
        if (G.micNo) noMic();
        setTimeout(() => G && !G.over && startRound(), G.micNo ? 3200 : 200);
      };
      K.intro(G, { title: 'Move the needle', how: 'This painting is a sound wave. Speak, sing or hum into your phone, and your voice moves the needle. No microphone? Hold the Hum button.',
        say: 'Move the needle. This painting is a sound wave. Use your voice to move the needle. Speak, sing or hum into your phone. No microphone? Hold the Hum button.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      listen(dt);
      if (G.phase === 'round') judge(dt);
      if (G.phase === 'cheer') { G.cheerT -= dt; if (G.cheerT <= 0) { G.r++; if (G.r >= N) finale(); else startRound(); } }
      if (G.recT > 0) { G.recT -= dt; if (G.recT <= 0) stopRecording(); }
      // the meter follows the voice; the guide ticks follow the meter (faster and higher as it rises)
      G.meter.set(G.level); G.meter.tick(G.t, dt);
      if (G.playing && G.phase === 'round') { G.tickT -= dt; if (G.tickT <= 0 && G.level > 0.05) { G.tickT = 0.32 - G.level * 0.24; G.band.tick(G.level, false); } }
      // the wave: alive with the voice
      const u = G.uni; u.uT.value = G.t; u.uA.value += ((G.over ? 0 : 1) - u.uA.value) * Math.min(1, dt * 2);
      G.phaseW += dt * (3 + G.level * 9); u.uPhase.value = G.phaseW;
      u.uLevel.value = G.level + 0.05 * Math.sin(G.t * 1.3); u.uPitch.value = G.pitch;
      G.lit += (G.won / N - G.lit) * Math.min(1, dt * 1.5); u.uLit.value = G.lit;
      u.uFin.value += ((G.phase === 'finale' ? 1 : 0) - u.uFin.value) * Math.min(1, dt * 0.8);
      // rings pulse out from the crosshair with the voice
      for (const R of G.rings) { R.k += dt / 1.1; if (R.k >= 1 && G.level > 0.2 && !G.ringBusy) { R.k = 0; G.ringBusy = 0.36; } const [x, y] = G.S.P(...C); R.r.position.set(x, y, 0.05); R.r.scale.set(0.05 + R.k * 0.5, (0.05 + R.k * 0.5) * 0.45, 1); R.r.material.opacity = (1 - R.k) * 0.5 * Math.min(1, G.level * 1.5); }
      G.ringBusy = Math.max(0, (G.ringBusy || 0) - dt) || 0;
      // loud sounds throw little marks off the wave, out along the axis
      G.sparkT -= dt;
      if (G.level > 0.45 && G.sparkT <= 0 && G.sparks.length < 60) {
        G.sparkT = 0.09 - G.level * 0.05;
        const col = MARK_COLORS[Math.floor(Math.random() * MARK_COLORS.length)], s = K.sprite(markTex(col), 0.022, { order: 22, opacity: 1 }); s.scale.set(0.011, 0.022, 1);
        const [x, y] = G.S.P(...C), side = Math.random() < 0.5 ? -1 : 1; s.position.set(x, y, 0.05); G.root.add(s);
        G.sparks.push({ s, vx: side * (0.12 + Math.random() * 0.35) * (0.6 + G.level), vy: (Math.random() - 0.5) * 0.5 * G.level, life: 1 });
      }
      for (let i = G.sparks.length - 1; i >= 0; i--) { const p = G.sparks[i]; p.life -= dt * 0.9; p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.vy *= Math.pow(0.3, dt); p.s.material.opacity = Math.max(0, p.life); if (p.life <= 0) { G.root.remove(p.s); p.s.material.dispose(); G.sparks.splice(i, 1); } }
      if (G.phase === 'finale' && G.replay && G.replay.ended) { G.replayAn = null; }
    },
    pointer(kind, ev) {
      // touching the painting does nothing: the game listens to your voice (or the Hum buttons)
    },
    pause() { if (G) { G.paused = true; G.holding = false; G.band.hum(0, false); G.band.volume(0); if (G.clip) G.clip.pause(); if (G.replay) G.replay.pause(); } },
    resume() { if (G) { G.paused = false; G.band.volume(0.9); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'needle-voice', playing: G.playing, over: G.over, phase: G.phase, round: G.r, won: G.won, level: +G.level.toFixed(2), pitch: +G.pitch.toFixed(2), prog: +G.prog.toFixed(2), mic: !!G.micOK, rec: !!G.recURL, t: +G.t.toFixed(1) }; },
    stop() {
      if (G) {
        G.band.stop(); stopRecording();
        if (G.ear) G.ear.stop(); else if (G.stream) G.stream.getTracks().forEach(t => t.stop());
        if (G.clip) { G.clip.pause(); G.clip = null; }
        if (G.replay) { G.replay.pause(); G.replay = null; }
        if (G.recURL) { try { URL.revokeObjectURL(G.recURL); } catch (e) {} }
      }
      K.cleanup(G); G = null;
    },
  };
}
