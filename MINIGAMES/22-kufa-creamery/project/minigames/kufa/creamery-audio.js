// 8 GATES — KUFA · THE CREAMERY: sound + music. All synthesized with Web Audio (no files needed, nothing to download).
// creamerySound(audio) takes the restaurant kit's Ambience (audio.ctx / audio.master / audio.noise) and returns:
//   sfx(name, opts)      one-shot effects (see SFX below)
//   pull(on, speed)      the machine running + soft serve squishing out while you swirl (speed 0..1 follows your finger)
//   squeeze(on)          the sauce bottle while you hold it
//   ambience(on)         the freezer hum of the only cold room on Kufa
//   music(mood)          'walk' (lounge) · 'shift' (busy) · 'rush' (last 30 s) · 'done' · null = off;  musicOn(bool)
//   step(dt)             call every frame (schedules music, smooths the loops)
// The music is an original loop in D hijaz (D Eb F# G A Bb C): marimba lead, oud-ish plucked bass, warm pad,
// darbuka (doum / tek) in maqsum, shaker. If KUFA/KUFA-Icrecream.mp3 is in the folder, the page plays that instead.
export function creamerySound(audio) {
  let ctx = null, bus = null, sfxBus = null, musBus = null, verb = null, verbSend = null, noise = null;
  const L = { pull: null, squeeze: null, amb: null };
  const M = { mood: null, on: true, step: 0, at: 0, bar: 0, vol: 0 };
  function ensure() {
    if (!audio.ctx) return null; if (ctx === audio.ctx) return ctx; ctx = audio.ctx; noise = audio.noise;
    bus = ctx.createDynamicsCompressor(); bus.threshold.value = -16; bus.ratio.value = 3; bus.attack.value = 0.004; bus.release.value = 0.2; bus.connect(audio.master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.95; sfxBus.connect(bus);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(bus);
    // a small tiled room: a short stereo reverb shared by the bells, the coins and the music
    verb = ctx.createConvolver(); { const len = Math.floor(ctx.sampleRate * 1.1), ir = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 220 ? i / 220 : 1); } } verb.buffer = ir; }
    verbSend = ctx.createGain(); verbSend.gain.value = 0.32; verbSend.connect(verb); const vOut = ctx.createGain(); vOut.gain.value = 0.55; verb.connect(vOut); vOut.connect(bus);
    return ctx; }
  const now = () => ctx.currentTime;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  // ---- building blocks ----
  function env(g, t, a, peak, d, end = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
  function tone({ f = 440, to = 0, type = 'sine', t = now(), a = 0.004, d = 0.2, v = 0.1, dest = sfxBus, wet = 0, pan = 0, lp = 0 }) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + a + d);
    let n = o; if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; n.connect(fl); n = fl; }
    n.connect(g); env(g, t, a, v, d); let out = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
    out.connect(dest); if (wet) { const s = ctx.createGain(); s.gain.value = wet; out.connect(s); s.connect(verbSend); } o.start(t); o.stop(t + a + d + 0.05); return o; }
  function hiss({ t = now(), d = 0.1, v = 0.1, type = 'bandpass', f = 2000, f1 = 0, q = 1, a = 0.002, dest = sfxBus, wet = 0, pan = 0 }) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + a + d);
    s.connect(fl); fl.connect(g); env(g, t, a, v, d); let out = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; } out.connect(dest); if (wet) { const w = ctx.createGain(); w.gain.value = wet; out.connect(w); w.connect(verbSend); }
    s.start(t, Math.random() * 1.2); s.stop(t + a + d + 0.05); }
  // a struck metal / glass bell: inharmonic partials
  function bell(f, t = now(), v = 0.06, d = 0.9, wet = 0.6, pan = 0) { [[1, 1], [2.76, 0.5], [5.4, 0.25], [8.93, 0.12]].forEach(([k, a], i) => tone({ f: f * k, t, a: 0.002, d: d / (1 + i * 0.7), v: v * a, wet, pan })); }
  // a marimba bar: fundamental + a quiet 4th harmonic, soft attack
  function mallet(f, t, v = 0.05, d = 0.45, dest = sfxBus, wet = 0.3) { tone({ f, t, a: 0.003, d, v, dest, wet }); tone({ f: f * 4, t, a: 0.002, d: d * 0.25, v: v * 0.22, dest, wet }); tone({ f: f * 2, t, a: 0.003, d: d * 0.5, v: v * 0.15, dest, wet, type: 'triangle' }); }
  // ---- one-shot effects ----
  const SFX = {
    tap: () => { hiss({ d: 0.02, v: 0.09, f: 3200, q: 2 }); tone({ f: 900, to: 1300, d: 0.04, v: 0.04 }); },
    cone: () => { const t = now(); hiss({ t, d: 0.018, v: 0.18, type: 'highpass', f: 3500 }); hiss({ t: t + 0.03, d: 0.012, v: 0.12, type: 'highpass', f: 4500 }); tone({ f: 520, to: 380, t, d: 0.06, v: 0.05, type: 'triangle' }); },
    cup: () => { hiss({ d: 0.07, v: 0.12, f: 1400, f1: 3200, q: 1.4 }); tone({ f: 260, to: 200, d: 0.05, v: 0.04 }); },
    set: () => { tone({ f: 180, to: 120, d: 0.08, v: 0.08 }); hiss({ d: 0.03, v: 0.06, type: 'lowpass', f: 900 }); },
    lever: () => { const t = now(); tone({ f: 150, to: 85, t, d: 0.12, v: 0.12 }); hiss({ t, d: 0.04, v: 0.1, type: 'lowpass', f: 1200 }); bell(1240, t + 0.005, 0.02, 0.35, 0.4); },
    leverUp: () => { const t = now(); tone({ f: 110, to: 170, t, d: 0.08, v: 0.08 }); bell(1480, t + 0.01, 0.015, 0.25, 0.3); },
    coil: ({ i = 0 } = {}) => { const sc = [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19, 20], m = 74 + sc[Math.min(sc.length - 1, i)], t = now(); bell(hz(m), t, 0.045, 0.9, 0.7, ((i % 4) - 1.5) * 0.25); mallet(hz(m - 12), t, 0.03, 0.3); },
    inBand: () => { const t = now(); [74, 78, 81, 86].forEach((m, i) => bell(hz(m), t + i * 0.06, 0.04, 0.8, 0.7)); },
    over: () => { const t = now(); tone({ f: 330, to: 220, t, d: 0.25, v: 0.07, type: 'square', lp: 900 }); tone({ f: 311, to: 208, t: t + 0.05, d: 0.25, v: 0.05, type: 'square', lp: 900 }); },
    wobble: () => { tone({ f: 240, to: 180, d: 0.14, v: 0.05, type: 'triangle' }); },
    tip: () => { const t = now(); tone({ f: 320, to: 980, t, d: 0.16, v: 0.08 }); hiss({ t, d: 0.08, v: 0.05, type: 'lowpass', f: 700 }); [86, 90, 93].forEach((m, i) => bell(hz(m), t + 0.12 + i * 0.05, 0.03, 0.7, 0.8)); },
    whoosh: () => { hiss({ d: 0.45, v: 0.12, f: 400, f1: 2400, q: 0.8, a: 0.12, pan: 0.2 }); },
    land: () => { tone({ f: 160, to: 110, d: 0.08, v: 0.09 }); hiss({ d: 0.04, v: 0.06, type: 'lowpass', f: 600 }); },
    bottle: () => { const t = now(); hiss({ t, d: 0.05, v: 0.08, f: 1800, q: 3 }); tone({ f: 700, to: 500, t, d: 0.06, v: 0.04, type: 'triangle' }); },
    splat: () => { tone({ f: 260 + Math.random() * 120, to: 120, d: 0.05, v: 0.035 }); },
    shake: () => { const t = now(); for (let i = 0; i < 7; i++) { const tt = t + i * 0.011 + Math.random() * 0.01; hiss({ t: tt, d: 0.012, v: 0.07 + Math.random() * 0.05, type: 'highpass', f: 3500 + Math.random() * 3000, pan: Math.random() * 0.6 - 0.3 }); } tone({ f: 1800 + Math.random() * 800, t, d: 0.02, v: 0.015, type: 'square' }); },
    tick: () => { tone({ f: 2600 + Math.random() * 1500, d: 0.015, v: 0.012, type: 'triangle' }); },
    done: () => { const t = now(); mallet(hz(74), t, 0.06); mallet(hz(81), t + 0.08, 0.06); },
    stepDone: () => { const t = now(); bell(hz(81), t, 0.035, 0.6, 0.6); bell(hz(86), t + 0.07, 0.035, 0.7, 0.6); },
    hand: () => { const t = now(); hiss({ t, d: 0.3, v: 0.1, f: 600, f1: 3000, q: 0.9, a: 0.08 }); tone({ f: 200, to: 140, t: t + 0.32, d: 0.07, v: 0.08 }); },
    thrilled: () => { const t = now(); [62, 66, 69, 74, 78, 81, 86].forEach((m, i) => bell(hz(m + 12), t + i * 0.055, 0.05, 1.1, 0.8, (i - 3) * 0.12)); [62, 69, 74].forEach(m => mallet(hz(m), t, 0.04, 0.6)); },
    happy: () => { const t = now(); [74, 78, 81].forEach((m, i) => bell(hz(m), t + i * 0.07, 0.05, 0.9, 0.7)); },
    neutral: () => { const t = now(); mallet(hz(69), t, 0.05); mallet(hz(72), t + 0.12, 0.05); },
    unhappy: () => { const t = now(); mallet(hz(67), t, 0.06, 0.5); mallet(hz(63), t + 0.16, 0.06, 0.7); },
    insulted: () => { const t = now(); tone({ f: 155, t, d: 0.35, v: 0.07, type: 'sawtooth', lp: 700 }); tone({ f: 146, t: t + 0.02, d: 0.35, v: 0.06, type: 'sawtooth', lp: 700 }); },
    coin: ({ v = 1 } = {}) => { const t = now(), base = v >= 5 ? 2300 : v >= 2 ? 2700 : 3100; [[1, 1], [1.47, 0.6], [2.09, 0.4], [2.56, 0.25]].forEach(([k, a]) => tone({ f: base * k, t, a: 0.001, d: 0.25 + Math.random() * 0.1, v: 0.03 * a, wet: 0.4 })); hiss({ t, d: 0.01, v: 0.06, type: 'highpass', f: 5000 }); },
    coinLand: () => { const t = now(); for (let i = 0; i < 3; i++) tone({ f: 3400 + i * 300, t: t + i * 0.05, a: 0.001, d: 0.07, v: 0.015, wet: 0.3 }); },
    drawer: () => { const t = now(); hiss({ t, d: 0.18, v: 0.07, type: 'lowpass', f: 900, a: 0.03 }); tone({ f: 90, to: 60, t: t + 0.17, d: 0.06, v: 0.08 }); },
    register: () => { const t = now(); hiss({ t, d: 0.05, v: 0.05, type: 'lowpass', f: 1500 }); bell(1975, t + 0.04, 0.06, 1.3, 0.8); bell(2637, t + 0.1, 0.04, 1.1, 0.8); },
    wrong: () => { tone({ f: 220, to: 180, d: 0.18, v: 0.05, type: 'square', lp: 1200 }); },
    door: () => { const t = now(); bell(1318, t, 0.05, 1.4, 0.8, 0.5); bell(1046, t + 0.13, 0.045, 1.5, 0.8, 0.5); },
    hello: () => { const t = now(); tone({ f: 420, to: 560, t, d: 0.09, v: 0.025, type: 'triangle' }); tone({ f: 560, to: 470, t: t + 0.1, d: 0.1, v: 0.022, type: 'triangle' }); },
    grumble: () => { const t = now(); tone({ f: 140, to: 110, t, d: 0.2, v: 0.05, type: 'sawtooth', lp: 500 }); tone({ f: 120, to: 95, t: t + 0.18, d: 0.25, v: 0.045, type: 'sawtooth', lp: 450 }); },
    drip: () => { const t = now(); tone({ f: 1500, to: 420, t, a: 0.001, d: 0.07, v: 0.05 }); tone({ f: 900, t: t + 0.06, a: 0.001, d: 0.12, v: 0.02, wet: 0.5 }); },
    clock: () => { tone({ f: 1800, d: 0.03, v: 0.03, type: 'triangle' }); },
    shiftStart: () => { const t = now(); [62, 69, 74, 78].forEach((m, i) => mallet(hz(m), t + i * 0.09, 0.05, 0.5)); bell(hz(86), t + 0.36, 0.04, 1.2, 0.8); },
    shiftEnd: () => { const t = now(); [86, 81, 78, 74, 69, 74].forEach((m, i) => bell(hz(m), t + i * 0.12, 0.045, 1.3, 0.8)); },
    star: () => { const t = now(); [81, 86, 90, 93, 98].forEach((m, i) => bell(hz(m), t + i * 0.045, 0.035, 0.8, 0.9, (i - 2) * 0.2)); },
    step: ({ s = 0 } = {}) => { hiss({ d: 0.05, v: 0.05 + s * 0.02, type: 'lowpass', f: 420, q: 0.7 }); },
    hop: () => { tone({ f: 260, to: 520, d: 0.12, v: 0.04, type: 'triangle' }); },
    land2: () => { hiss({ d: 0.07, v: 0.08, type: 'lowpass', f: 300 }); },
    ui: () => { tone({ f: 1250, d: 0.03, v: 0.025, type: 'triangle' }); },
    talk: () => { const t = now(); tone({ f: 600, to: 760, t, d: 0.05, v: 0.02, type: 'triangle' }); },
  };
  function sfx(name, o) { if (!ensure() || audio.muted) return; const f = SFX[name]; if (f) try { f(o); } catch (e) {} }
  // ---- continuous loops ----
  function loopNoise(type, f, q) { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = ctx.createGain(); g.gain.value = 0.0001; s.connect(fl); fl.connect(g); g.connect(sfxBus); s.start(); return { s, fl, g }; }
  function pull(on, speed = 0) { if (!ensure()) return; const t = now();
    if (on && !L.pull) { const hum = ctx.createOscillator(), hg = ctx.createGain(), lp = ctx.createBiquadFilter(); hum.type = 'sawtooth'; hum.frequency.value = 52; lp.type = 'lowpass'; lp.frequency.value = 260; hg.gain.value = 0.0001; hum.connect(lp); lp.connect(hg); hg.connect(sfxBus); hum.start(); hg.gain.setTargetAtTime(0.05, t, 0.06);
      const sq = loopNoise('bandpass', 520, 2.2), whr = loopNoise('bandpass', 180, 1.2); whr.g.gain.setTargetAtTime(0.03, t, 0.1); L.pull = { hum, hg, sq, whr }; }
    if (L.pull) { if (on) { L.pull.sq.g.gain.setTargetAtTime(0.012 + speed * 0.07, t, 0.05); L.pull.sq.fl.frequency.setTargetAtTime(380 + speed * 520, t, 0.08); L.pull.hum.frequency.setTargetAtTime(50 + speed * 8, t, 0.2); }
      else { const P = L.pull; L.pull = null; [P.hg, P.sq.g, P.whr.g].forEach(g => g.gain.setTargetAtTime(0.0001, t, 0.05)); setTimeout(() => { try { P.hum.stop(); P.sq.s.stop(); P.whr.s.stop(); } catch (e) {} }, 400); } } }
  function squeeze(on) { if (!ensure()) return; const t = now();
    if (on && !L.squeeze) { const n = loopNoise('bandpass', 760, 3); n.g.gain.setTargetAtTime(0.045, t, 0.04); const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 11; lg.gain.value = 260; lfo.connect(lg); lg.connect(n.fl.frequency); lfo.start(); L.squeeze = { n, lfo }; }
    else if (!on && L.squeeze) { const Q = L.squeeze; L.squeeze = null; Q.n.g.gain.setTargetAtTime(0.0001, t, 0.04); setTimeout(() => { try { Q.n.s.stop(); Q.lfo.stop(); } catch (e) {} }, 300); } }
  function ambience(on) { if (!ensure()) return; const t = now();
    if (on && !L.amb) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 60; o.type = 'sine'; g.gain.value = 0.0001; o.connect(g); g.connect(sfxBus); o.start(); g.gain.setTargetAtTime(0.012, t, 0.8); const n = loopNoise('lowpass', 380, 0.5); n.g.gain.setTargetAtTime(0.018, t, 0.8); L.amb = { o, g, n, click: 6 }; }
    else if (!on && L.amb) { const A = L.amb; L.amb = null; A.g.gain.setTargetAtTime(0.0001, t, 0.3); A.n.g.gain.setTargetAtTime(0.0001, t, 0.3); setTimeout(() => { try { A.o.stop(); A.n.s.stop(); } catch (e) {} }, 1500); } }
  // ---- music ----
  // 16 bars, eighth-note steps. Chords per bar (D hijaz): D · Eb · D · Cm · D · Gm · Eb · D   (twice, second half with the B melody)
  const CH = [[50, 54, 57], [51, 55, 58], [50, 54, 57], [48, 51, 55], [50, 54, 57], [55, 58, 62], [51, 55, 58], [50, 54, 57]];
  // melody: [eighth index within 8 bars (0..63), midi, length in eighths]
  const MA = [[0, 74, 2], [2, 75, 1], [3, 78, 1], [4, 79, 2], [6, 78, 2], [8, 75, 3], [11, 74, 1], [12, 72, 2], [14, 74, 2], [16, 78, 1], [17, 79, 1], [18, 81, 2], [20, 82, 2], [22, 81, 2], [24, 79, 2], [26, 78, 2], [28, 75, 4],
    [32, 74, 2], [34, 78, 2], [36, 81, 3], [39, 79, 1], [40, 82, 2], [42, 81, 1], [43, 79, 1], [44, 78, 4], [48, 75, 2], [50, 74, 1], [51, 75, 1], [52, 78, 2], [54, 75, 2], [56, 74, 6]];
  const MB = [[0, 86, 1], [1, 84, 1], [2, 82, 2], [4, 81, 2], [6, 79, 2], [8, 78, 1], [9, 79, 1], [10, 81, 2], [12, 79, 4], [16, 86, 1], [17, 87, 1], [18, 86, 2], [20, 84, 2], [22, 82, 2], [24, 81, 4], [28, 79, 2], [30, 78, 2],
    [32, 81, 2], [34, 82, 1], [35, 81, 1], [36, 79, 2], [38, 78, 2], [40, 75, 2], [42, 78, 2], [44, 79, 4], [48, 78, 2], [50, 79, 1], [51, 78, 1], [52, 75, 2], [54, 74, 2], [56, 74, 6]];
  const MAQSUM = { 0: 'D', 1: 'T', 3: 'T', 4: 'D', 6: 'T' };
  function voiceOud(m, t, v, d) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.value = hz(m); o2.frequency.value = hz(m) * 1.003; lp.type = 'lowpass'; lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(320, t + 0.18); lp.Q.value = 2; o.connect(lp); o2.connect(lp); lp.connect(g); env(g, t, 0.004, v, d); g.connect(musBus); o.start(t); o2.start(t); o.stop(t + d + 0.05); o2.stop(t + d + 0.05); }
  function voicePad(ms, t, d, v) { for (const m of ms) for (const dt of [-6, 6]) { const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = hz(m + 12); o.detune.value = dt; lp.type = 'lowpass'; lp.frequency.value = 1400; o.connect(lp); lp.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.35); g.gain.setValueAtTime(v, t + d - 0.3); g.gain.linearRampToValueAtTime(0.0001, t + d); g.connect(musBus); const s = ctx.createGain(); s.gain.value = 0.5; g.connect(s); s.connect(verbSend); o.start(t); o.stop(t + d + 0.05); } }
  function doum(t, v) { tone({ f: 120, to: 55, t, a: 0.002, d: 0.22, v, dest: musBus }); }
  function tek(t, v) { hiss({ t, d: 0.03, v, type: 'bandpass', f: 3200, q: 1.5, dest: musBus }); tone({ f: 620, to: 420, t, a: 0.001, d: 0.03, v: v * 0.4, dest: musBus }); }
  function shaker(t, v) { hiss({ t, d: 0.025, v, type: 'highpass', f: 7000, a: 0.008, dest: musBus }); }
  function music(mood) { if (mood === M.mood) return; M.mood = mood; if (!ensure()) return; if (mood && M.at < now()) { M.at = now() + 0.08; } }
  function musicOn(v) { M.on = !!v; }
  function stepMusic() { if (!ctx) return; const t = now(), want = M.on && M.mood && !audio.muted ? (M.mood === 'done' ? 0.55 : 0.85) : 0; M.vol += (want - M.vol) * 0.05; musBus.gain.setTargetAtTime(M.vol * 0.9, t, 0.05);
    if (!M.mood || !M.on) { M.at = Math.max(M.at, t); return; }
    const bpm = M.mood === 'walk' || M.mood === 'done' ? 84 : M.mood === 'rush' ? 118 : 104, e8 = 60 / bpm / 2, busy = M.mood === 'shift' || M.mood === 'rush';
    if (M.at < t) M.at = t + 0.05;
    while (M.at < t + 0.3) { const s = M.step % 128, half = s >= 64, i = s % 64, bar = Math.floor(i / 8), pos = i % 8, at = M.at, sw = pos % 2 ? e8 * 0.08 : 0, T = at + sw;
      const ch = CH[bar];
      if (pos === 0) { voicePad(ch, at, e8 * 8, busy ? 0.006 : 0.009); voiceOud(ch[0] - 12, at, 0.07, e8 * 1.6); }
      if (busy && (pos === 3 || pos === 6)) voiceOud(ch[pos === 3 ? 2 : 1] - 12, T, 0.045, e8 * 1.2); else if (!busy && pos === 4) voiceOud(ch[2] - 12, at, 0.05, e8 * 2);
      const mel = (half ? MB : MA).filter(n => n[0] === i); for (const n of mel) mallet(hz(n[1] - (busy ? 0 : 12)), T, busy ? 0.05 : 0.045, Math.min(1.2, n[2] * e8 * 1.4), musBus, 0.35);
      if (busy) { const h = MAQSUM[pos]; if (h === 'D') doum(at, 0.11); else if (h === 'T') tek(T, 0.05); shaker(T, 0.02 + (pos % 2 ? 0 : 0.01)); if (M.mood === 'rush') shaker(T + e8 / 2, 0.015); }
      else if (pos === 0 || pos === 4) tek(at, 0.02);
      M.step++; M.at += e8; } }
  function step() { if (!ensure()) return; stepMusic(); if (L.amb && Math.random() < 0.0015) hiss({ d: 0.05, v: 0.01, type: 'lowpass', f: 600 }); }
  function stopAll() { pull(false); squeeze(false); ambience(false); M.mood = null; }
  return { sfx, pull, squeeze, ambience, music, musicOn, step, stopAll, get ready() { return !!audio.ctx; } };
}
