// 8 GATES — DINER AUDIO: every sound in the Breakfast All Day diner, made live with Web Audio (no sound files to ship).
// dinerAudio(ambience) wraps the shared Ambience (village-game.js): call it after ambience.init() has run (first tap).
//   SFX  — pour, flip, crack, bacon slap, hash scratch, coffee pour, sugar plink, mug clink, plate slide, order-up bell,
//          register drawer + coins, door chime, ticket printer, burn hiss, good / bad stingers, footsteps, ready cues
//   BEDS — griddle sizzle (crackles with how much is cooking), room tone (murmur, fridge hum, distant cutlery)
//   MUSIC — 'shuffle' (the 2D breakfast game's bright morning shuffle, re-arranged for the jukebox: walking bass, swung
//          brushes, Rhodes-style comping) and 'rush' (a boogie-woogie for the shift that speeds up for the last 30 s)
// Everything runs through a small tiled-room reverb so it sounds like it is IN the diner. Mute = ambience.setMuted().
export function dinerAudio(A) {
  let C = null, out, sfx, mus, bed, rev, revSend;
  const R = (a, b) => a + Math.random() * (b - a);
  function boot() { if (C) return true; if (!A || !A.ctx || !A.master) return false; C = A.ctx;
    out = C.createGain(); out.gain.value = 1; out.connect(A.master);
    const comp = C.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(out);
    sfx = C.createGain(); sfx.gain.value = 0.95; sfx.connect(comp); mus = C.createGain(); mus.gain.value = 0; mus.connect(comp); bed = C.createGain(); bed.gain.value = 0.9; bed.connect(comp);
    rev = C.createConvolver(); { const len = Math.floor(C.sampleRate * 1.1), ir = C.createBuffer(2, len, C.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 220 ? i / 220 : 1); } } rev.buffer = ir; }
    revSend = C.createGain(); revSend.gain.value = 0.22; revSend.connect(rev); rev.connect(comp); sfx.connect(revSend); const mr = C.createGain(); mr.gain.value = 0.35; mus.connect(mr); mr.connect(rev);
    return true; }
  const now = () => C.currentTime;
  const panner = (p, dest) => { if (!p || !C.createStereoPanner) return dest; const s = C.createStereoPanner(); s.pan.value = Math.max(-1, Math.min(1, p)); s.connect(dest); return s; };
  function env(g, t, a, peak, d, curve = 'exp') { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); else g.gain.linearRampToValueAtTime(0.0001, t + a + d); }
  function tone(f, { t = now(), type = 'sine', a = 0.004, d = 0.2, v = 0.1, to, dest = sfx, pan = 0, detune = 0 } = {}) { const o = C.createOscillator(), g = C.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + a + d); if (detune) o.detune.value = detune; env(g, t, a, v, d); o.connect(g); g.connect(panner(pan, dest)); o.start(t); o.stop(t + a + d + 0.05); return o; }
  function noise({ t = now(), d = 0.2, a = 0.004, v = 0.1, type = 'bandpass', f = 1000, f1, q = 1, dest = sfx, pan = 0, curve = 'exp' } = {}) { const s = C.createBufferSource(); s.buffer = A.noise; const fl = C.createBiquadFilter(), g = C.createGain(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + a + d); fl.Q.value = q; env(g, t, a, v, d, curve); s.connect(fl); fl.connect(g); g.connect(panner(pan, dest)); s.start(t, Math.random() * 1.5); s.stop(t + a + d + 0.05); return s; }
  const partials = (f, ratios, { t = now(), d = 0.5, v = 0.08, pan = 0, dest = sfx } = {}) => ratios.forEach((r, i) => f * r < C.sampleRate * 0.45 && tone(f * r, { t, d: d / (1 + i * 0.6), v: v / (1 + i * 0.8), pan, dest }));
  const ceramic = (f, o = {}) => { partials(f, [1, 2.32, 4.25, 6.63], { d: 0.35, v: 0.07, ...o }); noise({ t: o.t, d: 0.02, f: 5000, q: 0.8, v: 0.05, pan: o.pan }); };
  const metal = (f, o = {}) => partials(f, [1, 2.76, 5.4, 8.93], { d: 1.2, v: 0.07, ...o });
  // ---------- continuous loops (pour, coffee, cream, sizzle, room) ----------
  function loop(type, f, q, v, lfoF = 0, lfoAmt = 0, dest = sfx) { const s = C.createBufferSource(); s.buffer = A.noise; s.loop = true; const fl = C.createBiquadFilter(), g = C.createGain(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(dest); s.start();
    let lfo = null; if (lfoF) { lfo = C.createOscillator(); const lg = C.createGain(); lfo.frequency.value = lfoF; lg.gain.value = lfoAmt; lfo.connect(lg); lg.connect(fl.frequency); lfo.start(); } return { s, fl, g, lfo, v, set(on, k = 1) { g.gain.setTargetAtTime(on ? v * k : 0, now(), on ? 0.04 : 0.08); } }; }
  const L = {};
  function loops() { if (L.ok) return; L.ok = true; L.pour = loop('lowpass', 520, 3, 0.16, 6, 180); L.coffee = loop('bandpass', 820, 4, 0.2, 9, 260); L.cream = loop('bandpass', 1500, 3, 0.1, 12, 300);
    L.sizzle = loop('highpass', 3800, 0.7, 0.05, 0, 0, bed); L.sizzleLo = loop('bandpass', 1400, 0.6, 0.03, 0.3, 300, bed); L.room = loop('lowpass', 320, 0.5, 0.05, 0.13, 70, bed);
    L.hum = C.createOscillator(); L.hum.frequency.value = 58; L.humG = C.createGain(); L.humG.gain.value = 0; L.hum.connect(L.humG); L.humG.connect(bed); L.hum.start(); }
  let sizzleLevel = 0, roomOn = false, popT = 0, clinkT = 3, stepI = 0;
  // ---------- music ----------
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const M = { track: null, at: 0, bar: 0, spb: 0.3, want: true, vol: 0.5, rush: false, duck: 1 };
  const SH = (() => { const scale = [67, 69, 72, 74, 76, 79, 81, 84, 86, 88], top = [[0, 2], [0.66, 4], [1.33, 3], [2, 5], [3, 4], [4, 6], [4.66, 5], [5.33, 3], [6, 4], [7, 2], [8, 3], [8.66, 5], [9.33, 4], [10, 6], [11, 5], [12, 7], [12.66, 6], [13.33, 4], [14, 5], [15, 3], [16, 4], [16.66, 6], [17.33, 5], [18, 7], [19, 6], [20, 8], [20.66, 7], [21.33, 5], [22, 6], [23, 4], [24, 5], [24.66, 3], [25.33, 4], [26, 2], [27, 3], [28, 1], [29, 2], [30, 0], [31, 2]];
    return { lead: top.map(([b, i]) => [b, scale[i]]), bass: [43, 47, 50, 47, 45, 48, 52, 48], chords: [[55, 59, 62, 66], [57, 60, 64, 67]], beats: 32 }; })();
  const BLUES = [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7], BOOGIE = [0, 4, 7, 9, 10, 9, 7, 4];
  function rhodes(m, t, d, v) { tone(hz(m), { t, type: 'sine', a: 0.006, d, v, dest: mus }); tone(hz(m) * 2, { t, type: 'triangle', a: 0.004, d: d * 0.4, v: v * 0.25, dest: mus }); }
  function brush(t, v) { noise({ t, d: 0.09, f: 6000, type: 'highpass', q: 0.5, v, dest: mus }); }
  function kick(t, v) { tone(110, { t, a: 0.002, d: 0.16, v, to: 45, dest: mus }); }
  function snare(t, v) { noise({ t, d: 0.12, f: 2200, q: 0.7, v, dest: mus }); tone(190, { t, d: 0.06, v: v * 0.5, dest: mus }); }
  function schedShuffle(t0, spb) { const sw = b => b + (b % 1 > 0.4 ? 0.16 : 0);
    for (const [b, m] of SH.lead) { const t = t0 + sw(b) * spb; tone(hz(m), { t, type: 'triangle', a: 0.01, d: 0.42, v: 0.045, dest: mus, detune: R(-4, 4) }); tone(hz(m) * 2.005, { t, type: 'sine', a: 0.01, d: 0.25, v: 0.012, dest: mus }); }
    for (let b = 0; b < SH.beats; b++) { const t = t0 + b * spb; tone(hz(SH.bass[b % 8]), { t, type: 'triangle', a: 0.006, d: spb * 0.9, v: 0.09, dest: mus }); tone(hz(SH.bass[b % 8]) * 2, { t, type: 'sine', a: 0.006, d: spb * 0.5, v: 0.02, dest: mus });
      const ch = SH.chords[Math.floor((b % 8) / 4)]; if (b % 2 === 1) ch.forEach(m => rhodes(m, t + spb * 0.16, spb * 0.8, 0.018)); brush(t, b % 2 ? 0.035 : 0.018); brush(t + spb * 0.66, 0.012); } }
  function schedRush(t0, spb, bar) { const root = 48 + BLUES[bar % 12];
    for (let e = 0; e < 8; e++) { const t = t0 + (e + (e % 2 ? 0.18 : 0)) * spb / 2; tone(hz(root - 12 + BOOGIE[e]), { t, type: 'triangle', a: 0.004, d: spb * 0.42, v: 0.085, dest: mus }); brush(t, e % 2 ? 0.012 : 0.022); }
    for (let b = 0; b < 4; b++) { const t = t0 + b * spb; if (b % 2 === 0) kick(t, 0.12); else { snare(t, 0.05); [0, 4, 7, 10].forEach(i => rhodes(root + 12 + i, t + spb * 0.05, spb * 0.5, 0.016)); } }
    if (bar % 2 === 0) { const riff = [[0, 15], [0.5, 12], [1, 10], [1.5, 7], [2.5, 10], [3, 12]]; riff.forEach(([b, i]) => tone(hz(root + 12 + i), { t: t0 + (b + (b % 1 ? 0.09 : 0)) * spb, type: 'square', a: 0.004, d: spb * 0.4, v: 0.016, dest: mus })); } }
  function musicTick() { if (!M.track || !C) return; const ahead = now() + 0.6;
    while (M.at < ahead) { if (M.track === 'shuffle') { schedShuffle(M.at, 0.3); M.at += SH.beats * 0.3; } else { const spb = M.rush ? 0.205 : 0.25; schedRush(M.at, spb, M.bar++); M.at += 4 * spb; } } }
  function play(track) { if (!boot()) return; if (M.track === track) return; M.track = track; M.at = now() + 0.15; M.bar = 0; mus.gain.cancelScheduledValues(now()); mus.gain.setTargetAtTime(M.want ? M.vol * M.duck : 0, now(), 0.4); }
  function stopMusic() { if (!C) return; M.track = null; mus.gain.setTargetAtTime(0, now(), 0.3); }
  // ---------- public ----------
  const api = {
    boot, get on() { return !!C; },
    music(track) { if (!boot()) return; if (!track) return stopMusic(); play(track); }, musicWanted(v) { M.want = v; if (C) mus.gain.setTargetAtTime(v && M.track ? M.vol * M.duck : 0, now(), 0.3); }, get musicOn() { return M.want; },
    setRush(v) { M.rush = v; }, setMusicLevel(v) { M.duck = v; if (C && M.track && M.want) mus.gain.setTargetAtTime(M.vol * v, now(), 0.4); },
    tick(dt, st) { if (!boot()) return; loops(); musicTick();
      sizzleLevel += ((st.sizzle || 0) - sizzleLevel) * Math.min(1, dt * 3); L.sizzle.set(true, Math.min(1.6, sizzleLevel)); L.sizzleLo.set(true, Math.min(1.4, sizzleLevel * 0.8));
      popT -= dt * (0.5 + sizzleLevel * 7); if (popT <= 0) { popT = R(0.6, 1.4); if (sizzleLevel > 0.05) noise({ d: 0.012, f: R(2500, 7000), q: 2, v: R(0.02, 0.06) * Math.min(1, sizzleLevel), type: 'bandpass', pan: R(-0.6, 0.6), dest: bed }); }
      const rm = !!st.room; if (rm !== roomOn) { roomOn = rm; } L.room.set(roomOn, 1); L.humG.gain.setTargetAtTime(roomOn ? 0.012 : 0, now(), 0.5);
      clinkT -= dt; if (clinkT <= 0) { clinkT = R(2.5, 7); if (roomOn) { const f = R(2400, 4200); ceramic(f, { v: 0.018, pan: R(-0.9, 0.9) }); if (Math.random() < 0.4) ceramic(f * 1.07, { t: now() + R(0.08, 0.2), v: 0.012, pan: R(-0.9, 0.9) }); } } },
    pour(on) { if (boot()) { loops(); L.pour.set(on); } }, coffee(on) { if (boot()) { loops(); L.coffee.set(on); } }, cream(on) { if (boot()) { loops(); L.cream.set(on); } },
    flip(strong, pan = 0) { if (!boot()) return; noise({ d: 0.22, f: 500, f1: strong ? 3200 : 2200, q: 1.4, v: strong ? 0.14 : 0.09, pan }); const t = now() + (strong ? 0.42 : 0.3); tone(140, { t, d: 0.12, v: 0.12, to: 55 }); noise({ t, d: 0.09, f: 700, type: 'lowpass', v: 0.1, pan }); noise({ t: t + 0.02, d: 0.5, f: 4200, type: 'highpass', v: 0.05, pan }); },
    crack(pan = 0) { if (!boot()) return; const t = now(); noise({ t, d: 0.014, f: 3200, type: 'highpass', v: 0.22, pan }); noise({ t: t + 0.035, d: 0.02, f: 2600, type: 'highpass', v: 0.15, pan }); noise({ t: t + 0.07, d: 0.16, f: 900, f1: 300, type: 'lowpass', v: 0.12, pan }); noise({ t: t + 0.12, d: 0.7, f: 4500, type: 'highpass', v: 0.06, pan }); },
    slap(pan = 0) { if (!boot()) return; noise({ d: 0.1, f: 600, type: 'lowpass', v: 0.14, pan }); noise({ t: now() + 0.05, d: 0.9, f: 3600, type: 'highpass', v: 0.08, pan }); },
    scratch(pan = 0) { if (!boot()) return; noise({ d: 0.05, f: R(1600, 2600), q: 2.5, v: 0.05, pan }); },
    plink() { if (!boot()) return; tone(2800, { d: 0.06, v: 0.06 }); tone(4150, { d: 0.04, v: 0.03 }); tone(520, { t: now() + 0.32, d: 0.12, v: 0.06, to: 240 }); noise({ t: now() + 0.32, d: 0.06, f: 1400, v: 0.04 }); },
    clink(pan = 0) { if (boot()) ceramic(R(1600, 2000), { pan }); },
    slide(pan = 0) { if (!boot()) return; noise({ d: 0.45, a: 0.02, f: 1300, f1: 700, q: 1.5, v: 0.09, pan, curve: 'lin' }); ceramic(1500, { t: now() + 0.52, pan, v: 0.06 }); },
    bell() { if (!boot()) return; metal(2340, { d: 1.8, v: 0.11 }); noise({ d: 0.01, f: 6000, type: 'highpass', v: 0.08 }); },
    register() { if (!boot()) return; noise({ d: 0.22, f: 900, f1: 500, type: 'lowpass', v: 0.1 }); metal(3150, { t: now() + 0.18, d: 0.8, v: 0.07 }); },
    coin(v = 1) { if (!boot()) return; metal(3800 + v * 70 + R(-80, 80), { d: 0.28, v: 0.04 }); },
    door() { if (!boot()) return; metal(1568, { d: 1.0, v: 0.06, pan: -0.5 }); metal(1319, { t: now() + 0.22, d: 1.2, v: 0.06, pan: -0.5 }); for (let i = 0; i < 4; i++) metal(R(3000, 4200), { t: now() + i * 0.05, d: 0.2, v: 0.015, pan: -0.5 }); },
    ticket() { if (!boot()) return; for (let i = 0; i < 7; i++) noise({ t: now() + i * 0.028, d: 0.018, f: 2400, q: 3, v: 0.05 }); noise({ t: now() + 0.22, d: 0.05, f: 4500, type: 'highpass', v: 0.06 }); },
    burn(pan = 0) { if (!boot()) return; noise({ d: 0.8, f: 5000, type: 'highpass', v: 0.08, pan }); tone(98, { d: 0.35, v: 0.05, type: 'sawtooth', to: 70 }); },
    good(n = 3) { if (!boot()) return; const notes = [72, 76, 79, 84, 88].slice(0, 2 + n); notes.forEach((m, i) => { tone(hz(m), { t: now() + i * 0.08, type: 'triangle', d: 0.35, v: 0.07 }); tone(hz(m) * 2, { t: now() + i * 0.08, d: 0.2, v: 0.02 }); }); },
    bad() { if (!boot()) return; tone(311, { d: 0.25, v: 0.07, type: 'sawtooth', to: 233 }); tone(233, { t: now() + 0.22, d: 0.45, v: 0.07, type: 'sawtooth', to: 155 }); },
    perfect(pan = 0) { if (!boot()) return; [84, 88, 91].forEach((m, i) => tone(hz(m), { t: now() + i * 0.05, d: 0.22, v: 0.04, pan })); },
    ready(kind, pan = 0) { if (!boot()) return; const f = { cakes: 880, eggs: 988, bacon: 784, hash: 659, coffee: 1047, flip: 1175 }[kind] || 880; tone(f, { d: 0.18, v: 0.08, pan }); tone(f * 1.5, { t: now() + 0.12, d: 0.25, v: 0.065, pan }); },
    step(surface = 'tile') { if (!boot()) return; stepI++; const t = now(); noise({ t, d: 0.035, f: surface === 'tile' ? R(1500, 2200) : 600, q: 1.6, v: 0.04 }); tone(R(130, 170), { t, d: 0.04, v: 0.025 }); },
    ui() { if (boot()) tone(1200, { d: 0.03, v: 0.03, type: 'square' }); },
    hop() { if (boot()) tone(330, { d: 0.18, v: 0.06, type: 'triangle', to: 660 }); },
    talk() { if (boot()) { tone(R(500, 700), { d: 0.05, v: 0.03, type: 'triangle' }); } },
    stopLoops() { if (L.ok) { L.pour.set(false); L.coffee.set(false); L.cream.set(false); } } };
  return api;
}
