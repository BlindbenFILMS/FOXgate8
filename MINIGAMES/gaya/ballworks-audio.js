// 8 GATES — FELT'S BALL WORKS · SOUND + MUSIC. No audio files: every sound is synthesised into AudioBuffers once
// (on the first tap), then played through one mix bus (compressor + a small generated room reverb), so it is phone-light,
// works offline and can be dropped into any world. createBallworksAudio() → { init, play, loop, setLoop, stopLoop, music,
// setMusic, setSfx, prefs, suspend, resume, destroy }.
//   play(name, { vol, rate, pan, delay })   one-shot SFX (see SFX below)
//   loop(name) / setLoop(name, { vol, rate, freq }) / stopLoop(name)   held sounds: hiss (press), stitch (seam), hum (belts)
//   music(mode)   'chill' (intro + walking) · 'work' (shift) · 'hurry' (last 20 s) · 'off'; stinger(kind) 'win' | 'end'
// Prefs persist in localStorage '8gates.ballworks.audio' ({ music, sfx }).

const PREF_KEY = '8gates.ballworks.audio';
export function createBallworksAudio() {
  let ctx = null, master, sfxBus, musBus, verbIn, comp; const B = {}; const loops = {};
  let prefs = { music: true, sfx: true }; try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) {}
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} };
  let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const noise = () => rnd() * 2 - 1;
  const TAU = Math.PI * 2;

  // ---------- tiny DSP helpers (sample-level, run once) ----------
  function buf(dur, fill, ch = 1) { const sr = ctx.sampleRate, n = Math.max(1, Math.floor(dur * sr)), b = ctx.createBuffer(ch, n, sr); for (let c = 0; c < ch; c++) { const d = b.getChannelData(c); fill(d, sr, c); } return b; }
  const env = (t, a, d) => t < a ? t / a : Math.exp(-(t - a) / d);
  function lp(d, cutoff, sr) { let y = 0; const k = 1 - Math.exp(-TAU * cutoff / sr); for (let i = 0; i < d.length; i++) { y += k * (d[i] - y); d[i] = y; } }
  function hp(d, cutoff, sr) { let y = 0, x0 = 0; const rc = 1 / (TAU * cutoff), a = rc / (rc + 1 / sr); for (let i = 0; i < d.length; i++) { const x = d[i]; y = a * (y + x - x0); x0 = x; d[i] = y; } }
  function bp(d, f, q, sr) { const w = TAU * f / sr, al = Math.sin(w) / (2 * q), b0 = al, a0 = 1 + al, a1 = -2 * Math.cos(w), a2 = 1 - al; let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < d.length; i++) { const x = d[i], y = (b0 * x - b0 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; d[i] = y; } }
  function norm(d, peak = 0.9) { let m = 0; for (let i = 0; i < d.length; i++) m = Math.max(m, Math.abs(d[i])); if (m > 0) for (let i = 0; i < d.length; i++) d[i] *= peak / m; }
  function partials(d, sr, list) { for (let i = 0; i < d.length; i++) { const t = i / sr; let s = 0; for (const [f, a, dec, ph = 0] of list) s += a * Math.sin(TAU * f * t + ph) * Math.exp(-t / dec); d[i] += s; } }

  // ---------- SFX recipes ----------
  const SFX = {
    ui: () => buf(0.06, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = (Math.sin(TAU * 1800 * t) * 0.6 + noise() * 0.3) * Math.exp(-t / 0.012); } }),
    blip: () => buf(0.12, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr, f = 700 + 500 * Math.min(1, t / 0.05); d[i] = Math.sin(TAU * f * t) * env(t, 0.004, 0.04) * 0.6; } }),
    thunk: () => buf(0.7, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr, f = 46 + 70 * Math.exp(-t / 0.05); d[i] = Math.sin(TAU * f * t) * env(t, 0.002, 0.16) + noise() * Math.exp(-t / 0.015) * 0.5; } partials(d, sr, [[523, 0.12, 0.25], [1307, 0.08, 0.18], [2011, 0.05, 0.12], [3240, 0.03, 0.08]]); lp(d, 5000, sr); norm(d, 0.95); }),
    squish: () => buf(0.5, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr, f = 160 - 120 * Math.min(1, t / 0.35); d[i] = Math.sin(TAU * f * t + Math.sin(TAU * 23 * t) * 2) * env(t, 0.01, 0.15) + noise() * 0.25 * env(t, 0.005, 0.06); } lp(d, 900, sr); norm(d, 0.85); }),
    splash: () => buf(1.1, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * env(t, 0.005, 0.18); } bp(d, 1100, 0.6, sr); lp(d, 3500, sr);
      for (let k = 0; k < 14; k++) { const t0 = 0.08 + rnd() * 0.75, f0 = 350 + rnd() * 700, n = Math.floor(0.05 * sr), s = Math.floor(t0 * sr); for (let i = 0; i < n && s + i < d.length; i++) { const t = i / sr; d[s + i] += Math.sin(TAU * (f0 + 2600 * t) * t) * Math.exp(-t / 0.018) * 0.35; } } norm(d, 0.9); }),
    whoosh: () => buf(0.35, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.sin(Math.PI * Math.min(1, t / 0.33)); } bp(d, 1800, 0.9, sr); norm(d, 0.6); }),
    pock: () => buf(0.16, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.exp(-t / 0.0025) * 0.8 + Math.sin(TAU * 205 * t) * Math.exp(-t / 0.03) * 0.9 + Math.sin(TAU * 1180 * t) * Math.exp(-t / 0.012) * 0.45 + Math.sin(TAU * 2350 * t) * Math.exp(-t / 0.006) * 0.25; } hp(d, 90, sr); norm(d, 0.95); }),
    catch: () => buf(0.2, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sin(TAU * (140 - 60 * t) * t) * Math.exp(-t / 0.05) + noise() * Math.exp(-t / 0.008) * 0.5; } lp(d, 2200, sr); norm(d, 0.9); }),
    thud: () => buf(0.45, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sin(TAU * (85 - 30 * t) * t) * env(t, 0.003, 0.09) + noise() * Math.exp(-t / 0.02) * 0.4; } lp(d, 420, sr); norm(d, 0.95); }),
    clang: () => buf(1.0, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise() * Math.exp(-i / sr / 0.006) * 0.5; partials(d, sr, [[312, 0.4, 0.4], [744, 0.3, 0.3], [1281, 0.25, 0.25], [1923, 0.18, 0.15], [2860, 0.1, 0.1]]); norm(d, 0.7); }),
    plunk: () => buf(0.35, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sin(TAU * 330 * t) * Math.exp(-t / 0.07) * 0.8 + Math.sin(TAU * 990 * t) * Math.exp(-t / 0.03) * 0.3 + noise() * Math.exp(-t / 0.004) * 0.4; } norm(d, 0.85); }),
    pump: () => buf(0.28, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.sin(Math.PI * Math.min(1, t / 0.26)) * 0.9 + Math.sin(TAU * (380 + 900 * t) * t) * env(t, 0.02, 0.05) * 0.25; } bp(d, 1500, 1.2, sr); norm(d, 0.7); }),
    pop: () => buf(0.5, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.exp(-t / 0.004) + Math.sin(TAU * (700 * Math.exp(-t / 0.05) + 180) * t) * Math.exp(-t / 0.07) * 0.8 + noise() * Math.exp(-t / 0.15) * 0.15; } norm(d, 0.95); }),
    ratchet: () => buf(0.05, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = (noise() * 0.6 + Math.sin(TAU * 3100 * t) * 0.5) * Math.exp(-t / 0.006); } hp(d, 600, sr); norm(d, 0.6); }),
    seal: () => buf(1.2, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.exp(-t / 0.05) * 0.15; } partials(d, sr, [[1046.5, 0.5, 0.4], [2093, 0.15, 0.2]]); const s = Math.floor(0.11 * sr); for (let i = s; i < d.length; i++) { const t = (i - s) / sr; d[i] += Math.sin(TAU * 1568 * t) * Math.exp(-t / 0.5) * 0.5 + Math.sin(TAU * 3136 * t) * Math.exp(-t / 0.2) * 0.12; } norm(d, 0.7); }),
    ding: () => buf(1.3, (d, sr) => { partials(d, sr, [[1318.5, 0.55, 0.6], [2637, 0.18, 0.3], [3955, 0.06, 0.15]]); norm(d, 0.6); }),
    sparkle: () => buf(1.2, (d, sr) => { const notes = [2093, 2637, 3136, 3951, 4186]; notes.forEach((f, k) => { const s = Math.floor(k * 0.055 * sr); for (let i = s; i < d.length; i++) { const t = (i - s) / sr; d[i] += Math.sin(TAU * f * t) * Math.exp(-t / 0.25) * 0.3; } }); norm(d, 0.5); }),
    cash: () => buf(1.4, (d, sr) => { for (let i = 0; i < Math.floor(0.12 * sr); i++) { const t = i / sr; d[i] = noise() * Math.sin(Math.PI * t / 0.12) * 0.4; } bp(d, 2600, 0.8, sr); const s = Math.floor(0.13 * sr); for (let i = s; i < d.length; i++) { const t = (i - s) / sr; d[i] += (Math.sin(TAU * 2489 * t) * 0.5 + Math.sin(TAU * 3322 * t) * 0.35 + Math.sin(TAU * 4978 * t) * 0.12) * Math.exp(-t / 0.35); } norm(d, 0.7); }),
    doorbell: () => buf(1.6, (d, sr) => { [[659.3, 0], [523.3, 0.32]].forEach(([f, o]) => { const s = Math.floor(o * sr); for (let i = s; i < d.length; i++) { const t = (i - s) / sr; d[i] += (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.1)) * Math.exp(-t / 0.55) * 0.5; } }); norm(d, 0.55); }),
    cheer: () => buf(1.5, (d, sr) => { // party horn + rising arpeggio
      for (let i = 0; i < Math.floor(0.55 * sr); i++) { const t = i / sr, f = 520 + 260 * Math.min(1, t / 0.08) + Math.sin(TAU * 7 * t) * 12; let s = 0; for (let h = 1; h < 7; h++) s += Math.sin(TAU * f * h * t) / h; d[i] = s * 0.25 * env(t, 0.02, 0.4) * (t < 0.5 ? 1 : (0.55 - t) / 0.05); }
      [523.3, 659.3, 784, 1046.5].forEach((f, k) => { const s = Math.floor((0.45 + k * 0.08) * sr); for (let i = s; i < d.length; i++) { const t = (i - s) / sr; d[i] += (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 3.9 * t) * Math.exp(-t / 0.04)) * Math.exp(-t / 0.3) * 0.35; } }); lp(d, 6000, sr); norm(d, 0.75); }),
    wahwah: () => buf(1.5, (d, sr) => { [[311, 0, 0.3], [293.7, 0.32, 0.3], [277.2, 0.64, 0.75]].forEach(([f, o, L]) => { const s = Math.floor(o * sr), n = Math.floor(L * sr); for (let i = 0; i < n && s + i < d.length; i++) { const t = i / sr, ff = f * (1 - (o > 0.6 ? t * 0.08 : 0)) + Math.sin(TAU * 5 * t) * (o > 0.6 ? 6 : 0); let v = 0; for (let h = 1; h < 9; h++) v += Math.sin(TAU * ff * h * t) / h; d[s + i] += v * 0.2 * env(t, 0.03, L * 0.6); } }); lp(d, 1400, sr); norm(d, 0.7); }),
    error: () => buf(0.25, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sign(Math.sin(TAU * 140 * t)) * 0.4 * env(t, 0.005, 0.08) * (t < 0.1 || t > 0.13 ? 1 : 0); } lp(d, 1200, sr); norm(d, 0.5); }),
    whistle: () => buf(1.4, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr, a = Math.min(1, t / 0.08) * Math.min(1, (1.4 - t) / 0.25), f = 880 + Math.sin(TAU * 6 * t) * 8; d[i] = (Math.sin(TAU * f * t) * 0.5 + Math.sin(TAU * f * 1.5 * t) * 0.3 + Math.sin(TAU * f * 2 * t) * 0.15 + noise() * 0.08) * a; } lp(d, 4000, sr); norm(d, 0.6); }),
    tick: () => buf(0.08, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sin(TAU * 1760 * t) * Math.exp(-t / 0.02); } norm(d, 0.5); }),
    step: () => buf(0.09, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.exp(-t / 0.015) * 0.6 + Math.sin(TAU * 110 * t) * Math.exp(-t / 0.02) * 0.5; } lp(d, 1500, sr); norm(d, 0.45); }),
    // loops (held sounds)
    hiss: () => buf(2.0, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise(); bp(d, 2200, 0.7, sr); for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = d[i] * 0.6 + Math.sin(TAU * 55 * t) * 0.35 + Math.sin(TAU * 110 * t) * 0.15; } norm(d, 0.6); }),
    stitch: () => buf(1.0, (d, sr) => { const rate = 22; for (let i = 0; i < d.length; i++) { const t = i / sr, ph = (t * rate) % 1; d[i] = noise() * Math.exp(-ph / 0.03) * 0.6 + Math.sin(TAU * 2600 * t) * Math.exp(-ph / 0.012) * 0.3 + Math.sin(TAU * 132 * t) * 0.18 + Math.sin(TAU * 264 * t) * 0.08; } norm(d, 0.55); }),
    hum: () => buf(4.0, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise(); lp(d, 180, sr); for (let i = 0; i < d.length; i++) { const t = i / sr, roll = (t * 3) % 1; d[i] = d[i] * 2.2 + Math.sin(TAU * 60 * t) * 0.25 + Math.sin(TAU * 120 * t) * 0.08 + (roll < 0.02 ? noise() * 0.15 : 0); } norm(d, 0.5); }),
  };

  // ---------- room reverb (generated impulse) ----------
  function impulse(dur = 1.8) { return buf(dur, (d, sr, c) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = noise() * Math.pow(1 - t / dur, 2.6) * (t < 0.01 ? t / 0.01 : 1); } lp(d, c ? 5200 : 4800, sr); }, 2); }

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.9;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.18;
    master.connect(comp); comp.connect(ctx.destination);
    const verb = ctx.createConvolver(); verb.buffer = impulse(); const wet = ctx.createGain(); wet.gain.value = 0.22; verbIn = ctx.createGain(); verbIn.connect(verb); verb.connect(wet); wet.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = prefs.sfx ? 0.85 : 0; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = prefs.music ? 0.42 : 0; musBus.connect(master); const mSend = ctx.createGain(); mSend.gain.value = 0.35; musBus.connect(mSend); mSend.connect(verbIn);
    const sSend = ctx.createGain(); sSend.gain.value = 0.5; sfxBus.connect(sSend); sSend.connect(verbIn);
    if (wantMusic) music(wantMusic, true);
    prewarm(); return true; }
  function prewarm() { const jobs = [...['hum', 'ui', 'blip', 'thunk', 'pock', 'whoosh', 'catch', 'thud', 'splash', 'stitch', 'hiss', 'plunk', 'pump', 'ratchet', 'seal', 'cash', 'doorbell', 'sparkle', 'step', 'tick', 'whistle', 'clang', 'pop', 'cheer', 'ding', 'squish', 'error', 'wahwah'].map(n => () => get(n)), ...Object.keys(INST).map(k => () => inst(k)), ...[...new Set([...CH.flat(), ...ROOT.flatMap(r => [r, r + 7, r + 10, r + 12]), ...LEAD_A, ...LEAD_B].filter(m => m > 0))].flatMap(m => [() => note('bass', m), () => note('keys', m), () => note('mari', m), () => note('mari', m - 12)])]; const run = () => { const t0 = performance.now(); while (jobs.length && performance.now() - t0 < 8) jobs.shift()(); if (jobs.length) setTimeout(run, 16); }; setTimeout(run, 30); }
  const get = name => B[name] || (SFX[name] && (B[name] = SFX[name]()));
  function play(name, { vol = 1, rate = 1, pan = 0, delay = 0 } = {}) { if (!ctx || !prefs.sfx) return; const b = get(name); if (!b) return; const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; const g = ctx.createGain(); g.gain.value = vol; let n = s; s.connect(g); n = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); n = p; } n.connect(sfxBus); s.start(ctx.currentTime + delay); }
  function loop(name, vol = 0.5) { if (!ctx) return; if (loops[name]) return; const b = get(name); if (!b) return; const s = ctx.createBufferSource(); s.buffer = b; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 8000; const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(vol, ctx.currentTime, 0.03); s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); loops[name] = { s, g, f }; }
  function setLoop(name, { vol, rate, freq } = {}) { const L = loops[name]; if (!L || !ctx) return; const t = ctx.currentTime, ch = (k, v, tol) => v != null && (L[k] == null || Math.abs(L[k] - v) > tol) && (L[k] = v, true); // only touch AudioParams when a value really changes
    if (ch('_v', vol, 0.02)) L.g.gain.setTargetAtTime(vol, t, 0.05); if (ch('_r', rate, 0.02)) L.s.playbackRate.setTargetAtTime(rate, t, 0.05); if (ch('_f', freq, 150)) L.f.frequency.setTargetAtTime(freq, t, 0.05); }
  function stopLoop(name) { const L = loops[name]; if (!L || !ctx) return; delete loops[name]; L.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); setTimeout(() => { try { L.s.stop(); } catch (e) {} }, 400); }

  // ---------- MUSIC: a jaunty factory groove in F major, rendered instruments + a lookahead sequencer ----------
  const NB = {}; const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const INST = {
    kick: () => buf(0.45, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr, f = 45 + 110 * Math.exp(-t / 0.035); d[i] = Math.sin(TAU * f * t) * env(t, 0.001, 0.13) + noise() * Math.exp(-t / 0.003) * 0.3; } norm(d, 0.95); }),
    snare: () => buf(0.3, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise(); hp(d, 1200, sr); for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = d[i] * Math.exp(-t / 0.07) * 0.8 + Math.sin(TAU * 190 * t) * Math.exp(-t / 0.04) * 0.6; } norm(d, 0.8); }),
    rim: () => buf(0.1, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sin(TAU * 1700 * t) * Math.exp(-t / 0.012) + noise() * Math.exp(-t / 0.004) * 0.6; } bp(d, 1900, 2, sr); norm(d, 0.6); }),
    hat: () => buf(0.06, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise(); hp(d, 7000, sr); for (let i = 0; i < d.length; i++) d[i] *= Math.exp(-i / sr / 0.014); norm(d, 0.5); }),
    ohat: () => buf(0.3, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise(); hp(d, 6500, sr); for (let i = 0; i < d.length; i++) d[i] *= Math.exp(-i / sr / 0.09); norm(d, 0.4); }),
    shaker: () => buf(0.09, (d, sr) => { for (let i = 0; i < d.length; i++) d[i] = noise(); bp(d, 5500, 1.5, sr); for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] *= env(t, 0.02, 0.025); } norm(d, 0.35); }),
    cowbell: () => buf(0.35, (d, sr) => { partials(d, sr, [[562, 0.5, 0.08], [845, 0.4, 0.06]]); bp(d, 900, 1.2, sr); norm(d, 0.4); }),
  };
  const note = (kind, m) => { const k = kind + m; if (NB[k]) return NB[k]; const f = mtof(m); let b;
    if (kind === 'bass') b = buf(0.6, (d, sr) => { let y = 0; for (let i = 0; i < d.length; i++) { const t = i / sr, ph = (f * t) % 1, saw = ph * 2 - 1, sq = ph < 0.5 ? 1 : -1, x = saw * 0.6 + sq * 0.4, cut = 180 + 1600 * Math.exp(-t / 0.06), k = 1 - Math.exp(-TAU * cut / sr); y += k * (x - y); d[i] = (y + Math.sin(TAU * f * t) * 0.6) * env(t, 0.004, 0.22); } norm(d, 0.85); });
    else if (kind === 'mari') b = buf(0.9, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = Math.sin(TAU * f * t) * Math.exp(-t / 0.35) + Math.sin(TAU * f * 3.93 * t) * Math.exp(-t / 0.05) * 0.35 + Math.sin(TAU * f * 9.2 * t) * Math.exp(-t / 0.012) * 0.12; } norm(d, 0.7); });
    else if (kind === 'keys') b = buf(1.6, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr, tr = 1 + 0.08 * Math.sin(TAU * 5 * t); d[i] = (Math.sin(TAU * f * t + 0.6 * Math.sin(TAU * f * t) * Math.exp(-t / 0.3)) + 0.25 * Math.sin(TAU * f * 2 * t)) * env(t, 0.008, 0.7) * tr; } norm(d, 0.5); });
    else b = buf(0.5, (d, sr) => { // pluck (Karplus-Strong)
      const N = Math.max(2, Math.round(sr / f)), line = new Float32Array(N); for (let i = 0; i < N; i++) line[i] = noise(); let p = 0; for (let i = 0; i < d.length; i++) { const a = line[p], b2 = line[(p + 1) % N]; d[i] = a; line[p] = (a + b2) * 0.497; p = (p + 1) % N; } norm(d, 0.6); });
    return (NB[k] = b); };
  // song data (16th steps, 4 bars per loop). Chords: F · Dm · Bb · C
  const CH = [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 58], [48, 52, 55, 60]], ROOT = [41, 38, 34, 36];
  const LEAD_A = [77, -1, 72, -1, 74, 77, -1, 76, -1, 74, 72, -1, 69, -1, 72, -1, 74, -1, 69, -1, 72, 74, -1, 77, -1, 76, 74, -1, 72, -1, -1, -1, 70, -1, 74, -1, 77, 74, -1, 72, -1, 70, 69, -1, 70, -1, 72, -1, 72, -1, 76, -1, 79, 76, -1, 74, -1, 72, 71, -1, 72, -1, -1, -1];
  const LEAD_B = [81, -1, -1, 79, -1, 77, -1, 76, 77, -1, 72, -1, -1, -1, 69, 70, 72, -1, 74, -1, 72, -1, 69, -1, 65, -1, -1, -1, 69, -1, 72, -1, 74, -1, -1, 72, -1, 70, -1, 69, 70, -1, 74, -1, 77, -1, 74, -1, 76, -1, 79, -1, 76, -1, 72, -1, 74, -1, 76, -1, 77, -1, -1, -1];
  const BASS_W = [0, -1, -1, 0, -1, -1, 12, -1, 0, -1, 7, -1, -1, 0, 10, -1], BASS_C = [0, -1, -1, -1, -1, -1, -1, -1, 7, -1, -1, -1, -1, -1, -1, -1];
  let mode = 'off', wantMusic = null, step = 0, nextT = 0, timer = 0, bar = 0;
  function playBuf(b, t, vol, pan = 0, rate = 1) { const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; const g = ctx.createGain(); g.gain.value = vol; s.connect(g); if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(musBus); } else g.connect(musBus); s.start(t); }
  const IB = {}; const inst = k => IB[k] || (IB[k] = INST[k]());
  function schedule() { if (!ctx || mode === 'off') return; const bpm = mode === 'hurry' ? 128 : mode === 'work' ? 112 : 90, s16 = 60 / bpm / 4;
    if (nextT < ctx.currentTime - 0.05) nextT = ctx.currentTime + 0.02; // after a stall, skip ahead instead of flooding
    while (nextT < ctx.currentTime + 0.12) { const st = step % 16, b4 = Math.floor(step / 16) % 4, sec = Math.floor(step / 64) % 2, t = nextT + (mode === 'chill' && st % 2 ? s16 * 0.18 : 0), chill = mode === 'chill', ch = CH[b4];
      // drums
      if (chill) { if (st === 0 || st === 10) playBuf(inst('kick'), t, 0.55); if (st === 4 || st === 12) playBuf(inst('rim'), t, 0.25, 0.2); if (st % 2 === 0) playBuf(inst('shaker'), t, st % 4 ? 0.12 : 0.2, -0.3); }
      else { if (st % 4 === 0) playBuf(inst('kick'), t, 0.8); if (st === 4 || st === 12) playBuf(inst('snare'), t, 0.5, 0.05); playBuf(inst('hat'), t, st % 2 ? 0.12 : 0.22, 0.3); if (st === 14) playBuf(inst('ohat'), t, 0.18, 0.3); if (mode === 'hurry' && st % 4 === 2) playBuf(inst('cowbell'), t, 0.18, -0.4); if (st === 10 && b4 === 3) playBuf(inst('snare'), t, 0.3); }
      // bass
      const bp2 = (chill ? BASS_C : BASS_W)[st]; if (bp2 >= 0) playBuf(note('bass', ROOT[b4] + bp2), t, chill ? 0.5 : 0.6);
      // keys: chord stabs (work) or held chord (chill)
      if (chill ? st === 0 : (st === 2 || st === 6 || st === 10 || st === 14)) ch.forEach((m, i) => playBuf(note('keys', m), t + i * 0.006, chill ? 0.13 : 0.08, (i - 1.5) * 0.25));
      // lead: marimba (chill: every other note, softer; work: full; hurry: octave up pluck doubling)
      const L = (sec ? LEAD_B : LEAD_A)[(step % 64)]; if (L > 0 && (!chill || st % 4 === 0 || (st % 2 === 0 && b4 % 2))) { playBuf(note('mari', L - (chill ? 12 : 0)), t, chill ? 0.3 : 0.32, -0.15); if (mode === 'hurry') playBuf(note('pluck', L + 12), t, 0.12, 0.35); }
      if (!chill && st % 8 === 3 && b4 === 1) playBuf(note('pluck', ch[3] + 12), t, 0.1, 0.4);
      nextT += s16; step++; } }
  function music(m, force) { if (!ctx) { wantMusic = m; return; } if (m === mode && !force) return; const was = mode; mode = m; wantMusic = m; if (m === 'off') return; if (was === 'off' || force) { nextT = ctx.currentTime + 0.1; step = 0; } clearInterval(timer); timer = setInterval(schedule, 25); schedule(); }
  function stinger(kind = 'end') { if (!ctx || !prefs.music) return; const t = ctx.currentTime + 0.05, seq = kind === 'win' ? [[65, 0], [69, 0.12], [72, 0.24], [77, 0.36], [81, 0.6]] : [[72, 0], [69, 0.15], [65, 0.3], [67, 0.45], [65, 0.7]]; seq.forEach(([m, o]) => { playBuf(note('mari', m), t + o, 0.45); playBuf(note('keys', m - 12), t + o, 0.12); }); playBuf(inst('kick'), t, 0.6); playBuf(inst('ohat'), t + (kind === 'win' ? 0.6 : 0.7), 0.3); }

  return {
    init, play, loop, setLoop, stopLoop, music, stinger, get prefs() { return { ...prefs }; }, get ready() { return !!ctx; },
    setMusic(on) { prefs.music = !!on; savePrefs(); if (musBus) musBus.gain.setTargetAtTime(on ? 0.42 : 0, ctx.currentTime, 0.1); },
    setSfx(on) { prefs.sfx = !!on; savePrefs(); if (sfxBus) sfxBus.gain.setTargetAtTime(on ? 0.85 : 0, ctx.currentTime, 0.1); },
    cycle() { // ALL ON → MUSIC OFF → ALL OFF → ALL ON
      if (prefs.music && prefs.sfx) this.setMusic(false); else if (prefs.sfx) this.setSfx(false); else { this.setMusic(true); this.setSfx(true); } return this.prefs; },
    suspend() { try { ctx && ctx.suspend(); } catch (e) {} }, resume() { try { ctx && ctx.resume(); } catch (e) {} },
    destroy() { clearInterval(timer); try { ctx && ctx.close(); } catch (e) {} },
    _offline(sr = 44100) { const real = ctx; ctx = { sampleRate: sr, createBuffer: (ch, n, r) => { const data = [...Array(ch)].map(() => new Float32Array(n)); return { length: n, duration: n / r, numberOfChannels: ch, getChannelData: c => data[c] }; } };
      const out = {}, stat = (k, b) => { const d = b.getChannelData(0); let pk = 0, ss = 0, nan = 0; for (const v of d) { if (!isFinite(v)) nan++; pk = Math.max(pk, Math.abs(v)); ss += v * v; } out[k] = { pk: +pk.toFixed(2), rms: +Math.sqrt(ss / d.length).toFixed(3), dur: +b.duration.toFixed(2), nan }; return b; };
      for (const k in SFX) out[k] = stat(k, SFX[k]()) && out[k]; for (const k in INST) stat(k, INST[k]()); for (const kind of ['bass', 'mari', 'keys', 'pluck']) stat(kind + '60', note(kind, 60)); stat('impulse', impulse());
      for (const k in NB) delete NB[k]; ctx = real; return out; },
  };
}
