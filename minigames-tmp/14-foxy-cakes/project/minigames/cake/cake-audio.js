// 8 GATES — FOXY CAKES AUDIO. Every sound and both music tracks are synthesized live with Web Audio (no files to ship).
// cakeAudio(ambience) → { ready(), sfx(name, arg), loop(name) → { set(level, x), stop() }, music(track | null), tick(), setOn({ sfx, music }), suspend(bool) }
// Buses: sfx + music → a glue compressor → the Ambience master. A synthesized room reverb gives the bakery its warm, small-room sound.
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);

export function cakeAudio(amb) {
  const A = { ctx: null, on: { sfx: true, music: true }, track: null, buses: {}, loops: new Set() };
  function ready() {
    if (A.ctx) return true; const ac = amb.ctx; if (!ac) return false; A.ctx = ac;
    try { if (amb.wind) amb.wind.gain.value = 0; if (amb.rain) amb.rain.gain.value = 0; if (amb.water) amb.water.gain.value = 0; } catch (e) {}   // no outdoor wind in a bakery
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(amb.master || ac.destination);
    A.sfxBus = ac.createGain(); A.sfxBus.gain.value = A.on.sfx ? 0.95 : 0; A.sfxBus.connect(comp);
    A.musBus = ac.createGain(); A.musBus.gain.value = A.on.music ? 0.85 : 0; A.musBus.connect(comp);
    // a small warm room: 1.6 s synthesized impulse, darkened
    const len = Math.floor(ac.sampleRate * 1.6), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { const t = i / len; lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45; d[i] = lp * Math.pow(1 - t, 2.6) * (i < 220 ? i / 220 : 1); } }
    A.rev = ac.createConvolver(); A.rev.buffer = ir; const rg = ac.createGain(); rg.gain.value = 0.55; A.rev.connect(rg); rg.connect(comp);
    A.noise = amb.noise || (() => { const b = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    return true; }
  const now = () => A.ctx.currentTime;
  // ---------- voices ----------
  function env(g, t, a, peak, dur, curve = 'exp') { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + dur); else g.gain.linearRampToValueAtTime(0.0001, t + a + dur); }
  function route(node, { bus = A.sfxBus, send = 0, pan = 0 } = {}) { let n = node; if (pan && A.ctx.createStereoPanner) { const p = A.ctx.createStereoPanner(); p.pan.value = pan; n.connect(p); n = p; } n.connect(bus); if (send) { const s = A.ctx.createGain(); s.gain.value = send; n.connect(s); s.connect(A.rev); } }
  function osc(type, f, t, dur, peak, o = {}) { if (f > 16000) return; if (o.to) o.to = Math.min(o.to, 16000); const ac = A.ctx, s = ac.createOscillator(), g = ac.createGain(); s.type = type; s.frequency.setValueAtTime(f, t); if (o.to) s.frequency.exponentialRampToValueAtTime(o.to, t + (o.slide || dur)); if (o.detune) s.detune.value = o.detune;
    let n = s; if (o.lp) { const f2 = ac.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; f2.Q.value = o.q || 0.7; s.connect(f2); n = f2; } n.connect(g); env(g, t, o.a || 0.004, peak, dur, o.curve); route(g, o); s.start(t); s.stop(t + (o.a || 0.004) + dur + 0.05); return s; }
  function noise(t, dur, peak, o = {}) { const ac = A.ctx, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = A.noise; f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 1200, t); if (o.fTo) f.frequency.exponentialRampToValueAtTime(o.fTo, t + dur); f.Q.value = o.q || 1;
    s.connect(f); f.connect(g); env(g, t, o.a || 0.003, peak, dur, o.curve); route(g, o); s.start(t, Math.random() * 1.5); s.stop(t + (o.a || 0.003) + dur + 0.05); }
  function bell(f, t, dur, peak, o = {}) { const parts = o.parts || [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]]; parts.forEach(([r, a]) => { if (f * r < 15000) osc('sine', f * r, t, dur / Math.sqrt(r), peak * a, { ...o, a: 0.002 }); }); }
  function chimeArp(notes, t, gap, peak, o = {}) { notes.forEach((m, i) => bell(mtof(m), t + i * gap, o.dur || 0.9, peak, { send: 0.35, ...o })); }
  // ---------- one-shot effects ----------
  const SFX = {
    tap: t => { osc('sine', 880, t, 0.05, 0.05); osc('triangle', 1320, t, 0.03, 0.02); },
    jarLift: t => { bell(2400, t, 0.18, 0.03, { parts: [[1, 1], [1.5, 0.4], [2.2, 0.2]] }); noise(t, 0.08, 0.03, { f: 3000, q: 2 }); },
    pourDry: t => { noise(t, 0.55, 0.11, { f: 2600, fTo: 900, q: 0.8, a: 0.05, send: 0.1 }); noise(t + 0.05, 0.4, 0.05, { f: 6000, type: 'highpass', a: 0.04 }); osc('sine', 120, t + 0.45, 0.1, 0.05); },
    eggCrack: t => { noise(t, 0.025, 0.25, { f: 3500, q: 3 }); noise(t + 0.03, 0.03, 0.15, { f: 2200, q: 4 }); noise(t + 0.09, 0.18, 0.09, { type: 'lowpass', f: 900, fTo: 300 }); osc('sine', 260, t + 0.1, 0.12, 0.06, { to: 120 }); },
    plop: t => { osc('sine', 190, t, 0.16, 0.2, { to: 70 }); noise(t, 0.08, 0.06, { type: 'lowpass', f: 700 }); },
    glug: t => { for (let i = 0; i < 4; i++) osc('sine', rnd(260, 380), t + i * 0.08, 0.07, 0.07, { to: rnd(500, 700), slide: 0.06 }); },
    wrong: t => { osc('square', 160, t, 0.18, 0.05, { lp: 900 }); osc('square', 120, t + 0.16, 0.25, 0.05, { lp: 700 }); },
    swish: (t, k = 1) => { noise(t, 0.16, 0.05 * k, { f: rnd(1600, 2600), fTo: rnd(600, 900), q: 1.4, a: 0.03 }); bell(rnd(3200, 3800), t + 0.05, 0.12, 0.006 * k); },
    turn: (t, n = 0) => bell(mtof(72 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24][Math.min(10, n)]), t, 0.35, 0.03, { send: 0.3 }),
    overmix: t => { osc('sawtooth', 220, t, 0.25, 0.03, { lp: 600, to: 150 }); },
    splash: t => { noise(t, 0.3, 0.12, { type: 'lowpass', f: 1400, fTo: 300 }); for (let i = 0; i < 5; i++) osc('sine', rnd(500, 900), t + i * 0.04, 0.05, 0.03, { to: rnd(1000, 1500), slide: 0.05 }); },
    doorOpen: t => { osc('sawtooth', 340, t, 0.45, 0.02, { lp: 1200, to: 230, q: 6 }); noise(t, 0.4, 0.03, { f: 900, q: 6 }); osc('sine', 80, t + 0.42, 0.18, 0.12, { to: 55 }); noise(t + 0.42, 0.06, 0.08, { f: 2600, q: 3 }); },
    doorClose: t => { noise(t, 0.05, 0.12, { f: 2000, q: 2 }); osc('sine', 95, t, 0.22, 0.2, { to: 50 }); bell(1800, t + 0.01, 0.25, 0.02, { parts: [[1, 1], [2.3, 0.5]] }); },
    zone: t => { bell(1568, t, 1.6, 0.07, { send: 0.4 }); bell(2093, t + 0.12, 1.4, 0.04, { send: 0.4 }); },
    alarm: t => { for (let i = 0; i < 3; i++) osc('square', 880, t + i * 0.18, 0.1, 0.04, { lp: 2400 }); },
    pullOut: t => { noise(t, 0.35, 0.07, { f: 800, fTo: 2400, q: 0.7, a: 0.08 }); osc('sine', 110, t + 0.3, 0.15, 0.1, { to: 70 }); },
    depan: t => { osc('sine', 140, t, 0.25, 0.22, { to: 60 }); noise(t, 0.25, 0.08, { type: 'lowpass', f: 1200, fTo: 200 }); chimeArp([84, 88, 91], t + 0.1, 0.05, 0.02); },
    splat: t => { noise(t, 0.12, 0.08, { type: 'lowpass', f: 900, fTo: 200 }); osc('sine', 200, t, 0.1, 0.06, { to: 90 }); },
    squish: t => { noise(t, 0.07, 0.04, { type: 'lowpass', f: rnd(500, 800), q: 3 }); osc('sine', rnd(140, 200), t, 0.06, 0.04, { to: rnd(260, 320), slide: 0.05 }); },
    undo: t => { noise(t, 0.2, 0.05, { f: 400, fTo: 2400, q: 1.2, a: 0.12, curve: 'lin' }); osc('sine', 660, t + 0.05, 0.12, 0.03, { to: 440 }); },
    plopTop: (t, n = 0) => { osc('sine', mtof(67 + (n % 8) * 2), t, 0.12, 0.08, { to: mtof(60 + (n % 8) * 2) }); noise(t, 0.04, 0.04, { type: 'lowpass', f: 1500 }); bell(mtof(84 + (n % 5) * 2), t + 0.04, 0.4, 0.015, { send: 0.3 }); },
    candle: t => { noise(t, 0.09, 0.1, { type: 'highpass', f: 2500 }); noise(t + 0.06, 0.4, 0.04, { f: 700, q: 0.6, a: 0.05 }); for (let i = 0; i < 4; i++) noise(t + 0.08 + Math.random() * 0.3, 0.01, 0.05, { f: 4000, q: 2 }); },
    sprinkle: t => { for (let i = 0; i < 3; i++) osc('sine', rnd(3000, 6000), t + i * rnd(0.01, 0.03), 0.04, 0.024); },
    stage: (t, sc = 80) => { if (sc >= 90) { chimeArp([72, 76, 79, 84, 88], t, 0.06, 0.035); osc('sine', 2093, t + 0.32, 0.5, 0.01, { to: 4186, slide: 0.4, send: 0.5 }); } else if (sc >= 60) chimeArp([72, 76, 79], t, 0.07, 0.03); else chimeArp([67, 64], t, 0.12, 0.03); },
    tick: t => { noise(t, 0.03, 0.12, { f: 1800, q: 8 }); osc('sine', 1100, t, 0.03, 0.03); },
    timeUp: t => { osc('square', 330, t, 0.35, 0.05, { lp: 1400 }); osc('square', 247, t, 0.35, 0.04, { lp: 1400 }); },
    boxClose: t => { osc('sine', 120, t, 0.15, 0.18, { to: 70 }); noise(t, 0.08, 0.1, { type: 'lowpass', f: 1800 }); noise(t + 0.15, 0.3, 0.05, { f: 4000, fTo: 1500, q: 2, a: 0.1 }); },
    serveBell: t => bell(2637, t, 1.8, 0.09, { send: 0.45, parts: [[1, 1], [2.32, 0.5], [4.25, 0.25], [6.8, 0.12]] }),
    coins: (t, n = 5) => { for (let i = 0; i < n; i++) { const tt = t + i * 0.06 + rnd(0, 0.02); bell(rnd(3800, 4600), tt, 0.25, 0.03, { parts: [[1, 1], [1.41, 0.6], [2.6, 0.3]] }); } },
    cheer: t => { chimeArp([72, 76, 79, 84, 88, 91], t, 0.07, 0.04); for (let i = 0; i < 6; i++) noise(t + i * 0.09, 0.4, 0.025, { f: rnd(900, 1800), q: 2, a: 0.05 }); },
    happy: t => chimeArp([76, 79, 84], t, 0.09, 0.035),
    meh: t => { osc('triangle', mtof(67), t, 0.25, 0.04); osc('triangle', mtof(65), t + 0.25, 0.35, 0.04); },
    sad: t => { [67, 66, 65, 62].forEach((m, i) => osc('sawtooth', mtof(m - 12), t + i * 0.22, i === 3 ? 0.6 : 0.2, 0.035, { lp: 1100, detune: i === 3 ? 30 : 0 })); },
    whoosh: t => noise(t, 0.35, 0.05, { f: 500, fTo: 3000, q: 0.8, a: 0.15, curve: 'lin' }),
    fanfare: (t, big) => { const seq = big ? [60, 64, 67, 72, 76, 79, 84] : [60, 64, 67, 72]; seq.forEach((m, i) => { osc('triangle', mtof(m), t + i * 0.11, 0.3, 0.05, { send: 0.3 }); osc('sine', mtof(m + 12), t + i * 0.11, 0.25, 0.025); }); if (big) SFX.coins(t + 0.8, 10); },
    register: t => { bell(3000, t, 0.4, 0.05, { parts: [[1, 1], [1.5, 0.5]] }); noise(t + 0.05, 0.12, 0.06, { f: 1500, q: 1 }); SFX.coins(t + 0.15, 4); },
    step: (t, k = 1) => { noise(t, 0.05, 0.05 * k, { type: 'lowpass', f: rnd(500, 750) }); noise(t + 0.03, 0.03, 0.02 * k, { f: rnd(1800, 2400), q: 2 }); },
    doorbell: t => { [[2637, 0], [3136, 0.11], [2637, 0.22], [3520, 0.33]].forEach(([f, d]) => bell(f, t + d, 0.8, 0.035, { send: 0.4 })); },
    talk: (t, pitch = 1) => { for (let i = 0; i < 6; i++) { const f = (rnd(380, 560) * pitch); osc('triangle', f, t + i * 0.075, 0.05, 0.045, { to: f * rnd(0.85, 1.2), lp: 2200 }); } },
    sparkle: t => { for (let i = 0; i < 5; i++) bell(rnd(3000, 5200), t + i * 0.04, 0.3, 0.012, { send: 0.5 }); },
  };
  function sfx(name, arg, when) { if (!ready() || !A.on.sfx) return; const f = SFX[name]; if (!f) return; try { f(when != null ? when : now() + 0.005, arg); } catch (e) {} }
  // ---------- continuous loops (oven hum, pouring stream, spatula, piping squeeze, room murmur) ----------
  function loop(kind) {
    if (!ready()) return { set() {}, stop() {} }; const ac = A.ctx, out = ac.createGain(); out.gain.value = 0; route(out, { send: kind === 'room' ? 0.2 : 0.08 });
    const nodes = []; const src = () => { const s = ac.createBufferSource(); s.buffer = A.noise; s.loop = true; s.start(0, Math.random()); nodes.push(s); return s; }; const bq = (type, f, q = 0.7) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    let filt = null, o1 = null, o2 = null, lfo = null, extra = 0;
    if (kind === 'oven') { o1 = ac.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 58; o2 = ac.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = 58.7; filt = bq('lowpass', 240, 1.5); o1.connect(filt); o2.connect(filt); const n = src(), hp = bq('bandpass', 3200, 0.5), ng = ac.createGain(); ng.gain.value = 0.25; n.connect(hp); hp.connect(ng); ng.connect(out); filt.connect(out); o1.start(); o2.start(); nodes.push(o1, o2); }
    else if (kind === 'pour') { const n = src(); filt = bq('lowpass', 700, 2); n.connect(filt); filt.connect(out); }
    else if (kind === 'smear') { const n = src(); filt = bq('bandpass', 1100, 0.6); n.connect(filt); filt.connect(out); }
    else if (kind === 'squeeze') { const n = src(); filt = bq('lowpass', 420, 4); n.connect(filt); filt.connect(out); lfo = ac.createOscillator(); lfo.frequency.value = 9; const lg = ac.createGain(); lg.gain.value = 160; lfo.connect(lg); lg.connect(filt.frequency); lfo.start(); nodes.push(lfo); }
    else if (kind === 'room') { const n = src(); filt = bq('bandpass', 420, 0.9); const f2 = bq('lowpass', 900); n.connect(filt); filt.connect(f2); f2.connect(out); lfo = ac.createOscillator(); lfo.frequency.value = 0.23; const lg = ac.createGain(); lg.gain.value = 120; lfo.connect(lg); lg.connect(filt.frequency); lfo.start(); nodes.push(lfo); }
    const L = { kind, level: 0, set(level, x = 0) { if (!A.ctx) return; const t = now(), base = { oven: 0.07, pour: 0.16, smear: 0.07, squeeze: 0.12, room: 0.05 }[kind] || 0.1; out.gain.setTargetAtTime(A.on.sfx ? level * base : 0, t, 0.05); L.level = level;
        if (kind === 'oven') { const f = 58 + x * 26; o1.frequency.setTargetAtTime(f, t, 0.1); o2.frequency.setTargetAtTime(f * 1.012, t, 0.1); filt.frequency.setTargetAtTime(240 + x * 500, t, 0.1); }
        if (kind === 'pour') filt.frequency.setTargetAtTime(500 + x * 900, t, 0.05);
        if (kind === 'smear') filt.frequency.setTargetAtTime(700 + x * 1600, t, 0.05);
        if (kind === 'room' && A.on.sfx && level > 0 && Math.random() < 0.02) { extra++; bell(rnd(2400, 3400), t + rnd(0, 0.5), 0.3, 0.01 * level, { parts: [[1, 1], [2.1, 0.3]], send: 0.5 }); } },
      stop() { try { out.gain.setTargetAtTime(0, now(), 0.05); setTimeout(() => { nodes.forEach(n => { try { n.stop(); } catch (e) {} }); try { out.disconnect(); } catch (e) {} }, 400); } catch (e) {} A.loops.delete(L); } };
    A.loops.add(L); return L; }
  // ---------- music: two tracks, scheduled ahead, crossfaded ----------
  const C = { C: [60, 64, 67], Am: [57, 60, 64], F: [53, 57, 60], G: [55, 59, 62], Em: [52, 55, 59], Dm: [50, 53, 57], G7: [55, 59, 65] }, ROOT = { C: 48, Am: 45, F: 41, G: 43, Em: 40, Dm: 38, G7: 43 };
  // the Foxy Cakes waltz: 16 bars, A then B; each bar = [chord(s by beat), melody [beat, midi, beats]]
  const WALTZ = [['C', [[0, 76, 1], [1, 79, 0.5], [1.5, 76, 0.5], [2, 72, 1]]], ['Am', [[0, 81, 1.5], [1.5, 79, 0.5], [2, 76, 1]]], ['F', [[0, 77, 1], [1, 81, 1], [2, 84, 1]]], ['G', [[0, 83, 1.5], [1.5, 81, 0.5], [2, 79, 1]]],
    ['C', [[0, 76, 1], [1, 79, 0.5], [1.5, 84, 0.5], [2, 88, 1]]], ['Em', [[0, 86, 1], [1, 83, 1], [2, 79, 1]]], [['F', 'F', 'G7'], [[0, 81, 1], [1, 77, 0.5], [1.5, 81, 0.5], [2, 83, 1]]], ['C', [[0, 84, 2], [2, 79, 1]]],
    ['F', [[0, 81, 1], [1, 84, 1], [2, 81, 1]]], ['G', [[0, 83, 1], [1, 86, 1], [2, 83, 1]]], ['Em', [[0, 79, 1.5], [1.5, 83, 0.5], [2, 88, 1]]], ['Am', [[0, 84, 1], [1, 83, 1], [2, 81, 1]]],
    ['Dm', [[0, 77, 1], [1, 81, 1], [2, 86, 1]]], ['G7', [[0, 83, 1], [1, 86, 0.5], [1.5, 89, 0.5], [2, 86, 1]]], ['C', [[0, 88, 1], [1, 86, 0.5], [1.5, 84, 0.5], [2, 79, 1]]], ['C', [[0, 84, 2.5]]]];
  const TRACKS = { shift: { bars: WALTZ, spb: 0.34, full: true }, lounge: { bars: WALTZ.slice(0, 8).concat(WALTZ.slice(8, 16)), spb: 0.5, full: false } };
  function musicVoice(bus, kind, m, t, d, v) { const ac = A.ctx;
    if (kind === 'box') { const f = mtof(m); [[1, 1], [3, 0.18], [5.04, 0.06]].forEach(([r, a]) => { const s = ac.createOscillator(), g = ac.createGain(); s.type = 'sine'; s.frequency.value = f * r; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.5, d * 1.6) / r); s.connect(g); g.connect(bus); const sd = ac.createGain(); sd.gain.value = 0.35; g.connect(sd); sd.connect(A.rev); s.start(t); s.stop(t + 2); }); }
    else if (kind === 'bass') { const s = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); s.type = 'triangle'; s.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.3); s.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(bus); s.start(t); s.stop(t + d + 0.05); }
    else if (kind === 'pluck') { const s = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); s.type = 'sawtooth'; s.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.12); s.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(bus); const sd = ac.createGain(); sd.gain.value = 0.15; g.connect(sd); sd.connect(A.rev); s.start(t); s.stop(t + d + 0.05); }
    else if (kind === 'pad') { [-7, 7].forEach(dt => { const s = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain(); s.type = 'sawtooth'; s.frequency.value = mtof(m); s.detune.value = dt; f.type = 'lowpass'; f.frequency.value = 800; s.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + d * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + d); g.connect(bus); const sd = ac.createGain(); sd.gain.value = 0.4; g.connect(sd); sd.connect(A.rev); s.start(t); s.stop(t + d + 0.05); }); }
    else if (kind === 'brush') { const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = A.noise; f.type = 'highpass'; f.frequency.value = 5500; s.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(bus); s.start(t, Math.random()); s.stop(t + d + 0.05); } }
  function scheduleBar(T, bar, t0) { const [ch, mel] = T.bars[bar], spb = T.spb, bus = T.bus, chAt = b => Array.isArray(ch) ? ch[b] : ch;
    mel.forEach(([b, m, d]) => musicVoice(bus, 'box', m, t0 + b * spb, d * spb, 0.05));
    if (T.full) { musicVoice(bus, 'bass', ROOT[chAt(0)], t0, spb * 0.9, 0.09); [1, 2].forEach(b => C[chAt(b)].forEach((m, i) => i < 3 && musicVoice(bus, 'pluck', m, t0 + b * spb, spb * 0.5, 0.012)));
      [0, 1, 2].forEach(b => musicVoice(bus, 'brush', 0, t0 + b * spb, 0.05, b ? 0.012 : 0.02)); musicVoice(bus, 'pad', C[chAt(0)][0] + 12, t0, spb * 3, 0.006); }
    else { musicVoice(bus, 'bass', ROOT[chAt(0)] + 12, t0, spb * 2.6, 0.04); C[chAt(0)].forEach(m => musicVoice(bus, 'pad', m, t0, spb * 3.2, 0.006)); musicVoice(bus, 'box', C[chAt(1)][1] + 12, t0 + spb, spb, 0.012); } }
  function music(name) { if (!ready()) return; if (name === A.track) return; const ac = A.ctx, t = now();
    if (A.cur) { const old = A.cur; old.gain.gain.setTargetAtTime(0, t, 0.35); old.dead = true; setTimeout(() => { try { old.gain.disconnect(); } catch (e) {} }, 2500); A.cur = null; }
    A.track = name; if (!name) return; const T = { ...TRACKS[name], gain: ac.createGain(), bar: 0, at: t + 0.15 }; T.gain.gain.value = 0.0001; T.gain.gain.setTargetAtTime(1, t, 0.4); T.gain.connect(A.musBus); T.bus = T.gain; A.cur = T; }
  function tick(ahead = 0.8) { if (!A.ctx || !A.cur || A.cur.dead) return; const T = A.cur; while (T.at < now() + ahead) { scheduleBar(T, T.bar, T.at); T.at += T.spb * 3; T.bar = (T.bar + 1) % T.bars.length; } }
  function setOn(o) { Object.assign(A.on, o); if (!A.ctx) return; const t = now(); A.sfxBus.gain.setTargetAtTime(A.on.sfx ? 0.95 : 0, t, 0.05); A.musBus.gain.setTargetAtTime(A.on.music ? 0.85 : 0, t, 0.1); if (!A.on.sfx) A.loops.forEach(L => L.set(0)); }
  function suspend(v) { if (!A.ctx) return; try { v ? A.ctx.suspend() : A.ctx.resume(); } catch (e) {} }
  return { ready, sfx, loop, music, tick, setOn, suspend, A };
}
