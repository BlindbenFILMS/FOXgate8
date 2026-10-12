// 8 GATES — FOX CINEMA · SOUND + MUSIC. Everything is synthesised live with Web Audio (no files to load, works offline,
// tiny on phones). Sits on top of the shared Ambience (village-game.js): it reuses Ambience's AudioContext + master.
//   SFX: popcorn pops, kettle sizzle, kernels pouring, lever clunk, the dump, scoop rustle, butter pump, flavour shaker,
//        fountain pour + fizz + ice, slush machine hum, hot-dog roller, sauce squirts, cheese pump, candy box rattle,
//        tray whoosh + set-down, register ka-ching, coins, customer reactions (cheer / sad trombone), cinema chimes,
//        footsteps on carpet, lobby crowd murmur, film projector whirr, dialogue blips, UI ticks.
//   MUSIC (a little lookahead sequencer): LOBBY (lounge bossa) · SHIFT (snack-rush groove, speeds up at last call) ·
//        MOVIE (space-adventure score in SCREEN 1) · fanfare stings. Cues crossfade.
// API: createCinemaAudio(ambience) → { unlock, update(dt, mix), cue(name), sting(name), tone, burst, …sfx, setMusic, setSfx, prefs }
const PREF_KEY = 'foxCinema.audio.v1';
const mtof = n => 440 * Math.pow(2, (n - 69) / 12);
export function createCinemaAudio(amb) {
  let prefs = { music: true, sfx: true }; try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) {}
  let A = null; const rnd = (a, b) => a + Math.random() * (b - a);
  function build() { const ctx = amb.ctx; if (!ctx || A) return A; try { if (amb.wind && amb.wind.gain) amb.wind.gain.value = 0; } catch (e) {}
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(amb.master || ctx.destination);
    const bus = (v, dest = comp) => { const g = ctx.createGain(); g.gain.value = v; g.connect(dest); return g; };
    // a small room reverb (generated impulse) shared by sfx + music
    const ir = ctx.createBuffer(2, ctx.sampleRate * 1.8, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6) * (i < 400 ? i / 400 : 1); }
    const verb = ctx.createConvolver(); verb.buffer = ir; const verbOut = bus(0.9); verb.connect(verbOut);
    const sfx = bus(prefs.sfx ? 0.95 : 0), music = bus(prefs.music ? 0.34 : 0), ambB = bus(prefs.sfx ? 0.55 : 0), sfxVerb = ctx.createGain(); sfxVerb.gain.value = 0.16; sfx.connect(sfxVerb); sfxVerb.connect(verb);
    const musVerb = ctx.createGain(); musVerb.gain.value = 0.22; music.connect(musVerb); musVerb.connect(verb);
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    A = { ctx, comp, sfx, music, amb: ambB, verb, noise: nb, loops: {}, cues: {}, voices: 0, popT: -1 }; makeLoops(); return A; }
  // ---------- building blocks ----------
  const out = (dest, pan) => { if (!pan || !A.ctx.createStereoPanner) return dest; const p = A.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(dest); return p; };
  function osc(f, t, dur, vol, { type = 'sine', sweep = 0, attack = 0.004, dest, pan = 0, detune = 0, lp = 0 } = {}) { const c = A.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (sweep) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * sweep), t + dur); if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); let n = o; if (lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = lp; o.connect(f2); n = f2; } n.connect(g); g.connect(out(dest || A.sfx, pan)); o.start(t); o.stop(t + dur + 0.05); return o; }
  function noise(t, dur, vol, { type = 'bandpass', f = 2000, q = 1, f2 = 0, attack = 0.002, dest, pan = 0, hp = 0 } = {}) { const c = A.ctx, s = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(); s.buffer = A.noise; b.type = type; b.frequency.setValueAtTime(f, t); if (f2) b.frequency.exponentialRampToValueAtTime(f2, t + dur); b.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(b); let n = b; if (hp) { const h = c.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; b.connect(h); n = h; } n.connect(g); g.connect(out(dest || A.sfx, pan)); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05); }
  const T = () => A.ctx.currentTime, ok = () => !!(build() && prefs.sfx);
  const bell = (f, t, dur, vol, dest) => { [1, 2.76, 5.4, 8.93].forEach((k, i) => f * k < 16000 && osc(f * k, t, dur / (1 + i * 0.8), vol / (1 + i * 1.6), { dest })); };
  // ---------- one-shot effects ----------
  const S = {
    tone(f, d, v, type = 'triangle') { if (!ok()) return; osc(f, T(), d, v * 1.4, { type }); },
    burst(d, f, v) { if (!ok()) return; noise(T(), d, v * 1.6, { type: 'lowpass', f }); },
    tick() { if (!ok()) return; const t = T(); noise(t, 0.02, 0.12, { type: 'highpass', f: 3500 }); osc(1800, t, 0.03, 0.03); },
    talk() { if (!ok()) return; const t = T(); osc(660, t, 0.08, 0.12, { type: 'triangle' }); osc(990, t + 0.05, 0.1, 0.1, { type: 'triangle' }); },
    pop(pan = 0, big = 1) { if (!ok()) return; const t = T(); if (t - A.popT < 0.012) return; A.popT = t; const f = rnd(1300, 3400);
      noise(t, 0.016 + Math.random() * 0.012, 0.32 * big, { f, q: 1.4, pan }); noise(t, 0.006, 0.22 * big, { type: 'highpass', f: 5000, pan }); osc(rnd(450, 900), t, 0.035, 0.07 * big, { sweep: 0.45, pan }); },
    kernels() { if (!ok()) return; const t = T(); for (let i = 0; i < 34; i++) noise(t + i * 0.016 + Math.random() * 0.01, 0.01, 0.09, { type: 'highpass', f: 3800, pan: rnd(-0.3, 0.3) }); noise(t + 0.55, 0.25, 0.18, { f: 900, q: 0.8, f2: 400 }); },
    lever() { if (!ok()) return; const t = T(); osc(150, t, 0.2, 0.38, { sweep: 0.4 }); noise(t, 0.07, 0.28, { type: 'lowpass', f: 900 }); osc(1850, t + 0.01, 0.12, 0.05, { type: 'triangle' }); osc(2470, t + 0.02, 0.1, 0.03); },
    dump(big = 1, burnt = false) { if (!ok()) return; const t = T(); noise(t, 0.6, 0.22, { f: 500, f2: 2800, q: 0.7 }); for (let i = 0; i < 26 * big; i++) { const tt = t + 0.05 + Math.random() * 0.8; if (burnt) noise(tt, 0.03, 0.12, { type: 'lowpass', f: 700 }); else { noise(tt, 0.014, 0.18, { f: rnd(1500, 3200), q: 1.2, pan: rnd(-0.4, 0.4) }); } } },
    perfect() { if (!ok()) return; const t = T(); [72, 76, 79, 84, 88].forEach((n, i) => { osc(mtof(n), t + i * 0.07, 0.35, 0.09, { type: 'triangle' }); osc(mtof(n + 12), t + i * 0.07, 0.2, 0.03); }); noise(t + 0.2, 0.6, 0.06, { type: 'highpass', f: 7000 }); },
    good() { if (!ok()) return; const t = T(); osc(mtof(76), t, 0.18, 0.08, { type: 'triangle' }); osc(mtof(83), t + 0.08, 0.25, 0.08, { type: 'triangle' }); },
    error() { if (!ok()) return; const t = T(); osc(196, t, 0.14, 0.1, { type: 'square', lp: 1100 }); osc(185, t + 0.14, 0.2, 0.1, { type: 'square', lp: 1100 }); },
    scorch() { if (!ok()) return; const t = T(); noise(t, 0.6, 0.2, { type: 'lowpass', f: 1200 }); osc(110, t, 0.5, 0.12, { type: 'sawtooth', lp: 500, sweep: 0.8 }); },
    bucket() { if (!ok()) return; const t = T(); noise(t, 0.09, 0.55, { type: 'lowpass', f: 700 }); osc(190, t, 0.08, 0.3, { sweep: 0.7 }); noise(t + 0.02, 0.06, 0.18, { f: 2600, q: 2 }); },
    butter() { if (!ok()) return; const t = T(); noise(t, 0.05, 0.18, { type: 'lowpass', f: 500 }); osc(320, t + 0.02, 0.16, 0.2, { sweep: 0.35 }); noise(t + 0.05, 0.14, 0.12, { f: 900, q: 3, f2: 300 }); },
    shake() { if (!ok()) return; const t = T(); for (let i = 0; i < 6; i++) noise(t + i * 0.012, 0.012, 0.14, { type: 'highpass', f: 5200 }); noise(t, 0.08, 0.06, { f: 7000, q: 1 }); },
    cupDown() { if (!ok()) return; const t = T(); osc(880, t, 0.06, 0.26, { sweep: 0.7, type: 'triangle' }); noise(t, 0.03, 0.3, { f: 2600, q: 2 }); },
    ice() { if (!ok()) return; const t = T(); for (let i = 0; i < 4; i++) { const tt = t + i * 0.05 + Math.random() * 0.03, f = rnd(2400, 3600); osc(f, tt, 0.12, 0.05); osc(f * 1.5, tt, 0.08, 0.02); } },
    lid() { if (!ok()) return; const t = T(); noise(t, 0.016, 0.3, { type: 'highpass', f: 3000 }); osc(1500, t, 0.03, 0.08); noise(t + 0.05, 0.06, 0.1, { f: 1200, q: 4, f2: 2400 }); },
    candy() { if (!ok()) return; const t = T(); for (let i = 0; i < 7; i++) noise(t + i * 0.022 + Math.random() * 0.01, 0.014, 0.16, { f: rnd(2500, 4500), q: 2 }); noise(t + 0.17, 0.06, 0.22, { type: 'lowpass', f: 700 }); },
    sizzleTick() { if (!ok()) return; const t = T(); noise(t, 0.4, 0.14, { type: 'highpass', f: 3000 }); osc(160, t, 0.08, 0.1); },
    bun() { if (!ok()) return; const t = T(); noise(t, 0.09, 0.5, { type: 'lowpass', f: 800 }); osc(240, t, 0.09, 0.25, { sweep: 0.6 }); },
    squirt() { if (!ok()) return; const t = T(); noise(t, 0.14, 0.7, { f: 1400, q: 2.5, f2: 500 }); osc(180, t, 0.1, 0.12, { sweep: 0.6 }); },
    chips() { if (!ok()) return; const t = T(); for (let i = 0; i < 10; i++) noise(t + i * 0.018 + Math.random() * 0.01, 0.02, 0.16, { f: rnd(3000, 6000), q: 1 }); },
    tray() { if (!ok()) return; const t = T(); noise(t, 0.06, 0.5, { f: 1800, q: 1.5 }); osc(520, t, 0.06, 0.16, { type: 'triangle' }); osc(780, t + 0.05, 0.12, 0.08, { type: 'triangle' }); },
    bin() { if (!ok()) return; const t = T(); noise(t, 0.12, 0.3, { type: 'lowpass', f: 500 }); osc(120, t, 0.18, 0.18, { sweep: 0.6 }); osc(740, t + 0.02, 0.2, 0.03, { type: 'triangle' }); },
    whoosh() { if (!ok()) return; const t = T(); noise(t, 0.3, 0.45, { f: 700, f2: 2600, q: 0.9, attack: 0.05 }); },
    serve() { if (!ok()) return; const t = T(); noise(t, 0.12, 0.3, { type: 'lowpass', f: 380 }); osc(120, t, 0.14, 0.26, { sweep: 0.55 }); noise(t + 0.01, 0.04, 0.1, { f: 2200, q: 2 }); },
    coin(i = 0) { if (!ok()) return; const t = T(), f = rnd(1900, 2400); [1, 2.76, 4.1].forEach((k, j) => osc(f * k, t, 0.3 - j * 0.06, 0.14 / (1 + j), { pan: rnd(-0.3, 0.3) })); noise(t, 0.012, 0.3, { type: 'highpass', f: 6000 }); },
    kaching() { if (!ok()) return; const t = T(); noise(t, 0.1, 0.3, { type: 'lowpass', f: 450 }); osc(90, t, 0.12, 0.2, { sweep: 0.7 }); [1318.5, 1975.5].forEach((f, i) => bell(f, t + 0.1 + i * 0.09, 1.1, 0.12)); },
    drawer() { if (!ok()) return; const t = T(); noise(t, 0.16, 0.22, { f: 900, q: 0.8, f2: 400 }); osc(140, t + 0.14, 0.08, 0.15); bell(2637, t + 0.15, 0.4, 0.03); },
    react(level) { if (!ok()) return; const t = T();
      if (level === 'thrilled') { [60, 64, 67, 72, 76].forEach((n, i) => osc(mtof(n + 12), t + i * 0.06, 0.4, 0.08, { type: 'triangle' })); for (let i = 0; i < 60; i++) noise(t + 0.15 + Math.random() * 1.0, 0.03, 0.06 * (1 - i / 70), { f: rnd(1200, 3200), q: 1.4, pan: rnd(-0.7, 0.7) }); this.yay(t + 0.1); }
      else if (level === 'happy') { osc(mtof(72), t, 0.2, 0.09, { type: 'triangle' }); osc(mtof(79), t + 0.1, 0.35, 0.09, { type: 'triangle' }); }
      else if (level === 'neutral') { osc(mtof(67), t, 0.25, 0.07, { type: 'triangle' }); osc(mtof(67), t + 0.14, 0.25, 0.06, { type: 'triangle' }); }
      else if (level === 'unhappy') { osc(mtof(67), t, 0.25, 0.08, { type: 'triangle' }); osc(mtof(63), t + 0.16, 0.4, 0.08, { type: 'triangle' }); }
      else { [[233, 0], [220, 0.3], [208, 0.6], [196, 0.9]].forEach(([f, d], i) => { const o = osc(f, t + d, i === 3 ? 0.9 : 0.32, 0.13, { type: 'sawtooth', lp: 900, attack: 0.03 }); if (i === 3) { const l = A.ctx.createOscillator(), lg = A.ctx.createGain(); l.frequency.value = 6; lg.gain.value = 6; l.connect(lg); lg.connect(o.frequency); l.start(t + d); l.stop(t + d + 0.95); } }); } },
    yay(t = T()) { if (!ok()) return; [0, 0.08].forEach((d, i) => { const c = A.ctx, o = c.createOscillator(), f1 = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(260 + i * 90, t + d); o.frequency.linearRampToValueAtTime(380 + i * 90, t + d + 0.25); f1.type = 'bandpass'; f1.Q.value = 5; f1.frequency.setValueAtTime(700, t + d); f1.frequency.linearRampToValueAtTime(1300, t + d + 0.3);
      g.gain.setValueAtTime(0.0001, t + d); g.gain.linearRampToValueAtTime(0.06, t + d + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.45); o.connect(f1); f1.connect(g); g.connect(A.sfx); o.start(t + d); o.stop(t + d + 0.5); }); },
    chime() { if (!ok()) return; const t = T(); [[67, 0], [76, 0.45], [72, 0.9]].forEach(([n, d]) => bell(mtof(n), t + d, 1.6, 0.13)); },
    showtime() { if (!ok()) return; const t = T(); noise(t, 2.2, 0.1, { f: 400, f2: 120, q: 0.6, attack: 0.3 }); osc(55, t, 2.4, 0.12, { attack: 0.5 }); },
    upgrade() { if (!ok()) return; const t = T(); [67, 71, 74, 79].forEach((n, i) => osc(mtof(n), t + i * 0.06, 0.3, 0.08, { type: 'square', lp: 2200 })); },
    step(soft = 1) { if (!ok()) return; const t = T(); noise(t, 0.07, 0.3 * soft, { type: 'lowpass', f: rnd(240, 360) }); osc(rnd(60, 80), t, 0.06, 0.1 * soft); },
    jump() { if (!ok()) return; const t = T(); noise(t, 0.2, 0.3, { f: 600, f2: 1800, q: 1 }); osc(300, t, 0.16, 0.12, { sweep: 1.8, type: 'triangle' }); },
    land() { if (!ok()) return; this.step(1.6); },
    curtain() { if (!ok()) return; const t = T(); noise(t, 0.5, 0.12, { f: 500, q: 0.7, f2: 1400, attack: 0.1 }); },
    sit() { if (!ok()) return; const t = T(); noise(t, 0.2, 0.16, { type: 'lowpass', f: 400 }); osc(90, t + 0.05, 0.12, 0.08); },
    pew(pan = 0) { if (!build() || !prefs.sfx) return; const t = T(); osc(rnd(1400, 2200), t, 0.18, 0.04, { type: 'square', sweep: 0.3, lp: 3000, pan, dest: A.amb }); },
    boom() { if (!build() || !prefs.sfx) return; const t = T(); osc(70, t, 0.8, 0.12, { sweep: 0.5, dest: A.amb }); noise(t, 0.6, 0.08, { type: 'lowpass', f: 300, dest: A.amb }); },
    chatter(pan = 0) { if (!build() || !prefs.sfx) return; const t = T(), c = A.ctx, n = 2 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) { const o = c.createOscillator(), f1 = c.createBiquadFilter(), g = c.createGain(), tt = t + i * rnd(0.08, 0.14); o.type = 'sawtooth'; o.frequency.value = rnd(150, 260); f1.type = 'bandpass'; f1.Q.value = 4; f1.frequency.value = rnd(500, 1500);
        g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(0.012, tt + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12); o.connect(f1); f1.connect(g); g.connect(out(A.amb, pan)); o.start(tt); o.stop(tt + 0.15); } },
  };
  // ---------- continuous loops (gain driven every frame) ----------
  function makeLoops() { const c = A.ctx;
    const nsrc = () => { const s = c.createBufferSource(); s.buffer = A.noise; s.loop = true; s.start(0, Math.random()); return s; };
    const filt = (type, f, q = 0.7) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    const G = (dest) => { const g = c.createGain(); g.gain.value = 0; g.connect(dest); return g; };
    // kettle sizzle + oil crackle
    { const g = G(A.sfx); nsrc().connect(filt('bandpass', 5200, 0.6)).connect(filt('highpass', 2200)).connect(g); A.loops.sizzle = { g }; }
    // popcorn scoop rustle (a grainy band that flutters)
    { const g = G(A.sfx), am = c.createGain(); am.gain.value = 0.6; const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 17; lg.gain.value = 0.4; l.connect(lg); lg.connect(am.gain); l.start(); nsrc().connect(filt('bandpass', 3200, 1.3)).connect(am).connect(g); A.loops.rustle = { g }; }
    // fountain pour: two resonant bands whose pitch rises as the cup fills, with a gurgle LFO
    { const g = G(A.sfx), b1 = filt('bandpass', 700, 7), b2 = filt('bandpass', 1100, 5), l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 9; lg.gain.value = 120; l.connect(lg); lg.connect(b1.frequency); lg.connect(b2.frequency); l.start(); const s = nsrc(); s.connect(b1); s.connect(b2); b1.connect(g); b2.connect(g); A.loops.pour = { g, b1, b2 }; }
    // fizz after a soda pour
    { const g = G(A.sfx); nsrc().connect(filt('highpass', 6500)).connect(g); A.loops.fizz = { g }; }
    // machine hum (slush drums / roller / popcorn motor)
    { const g = G(A.sfx), o = c.createOscillator(), o2 = c.createOscillator(), lp = filt('lowpass', 220); o.type = 'sawtooth'; o.frequency.value = 58; o2.type = 'sawtooth'; o2.frequency.value = 58.7; o.connect(lp); o2.connect(lp); lp.connect(g); o.start(); o2.start(); A.loops.hum = { g }; }
    // cheese pump gloop
    { const g = G(A.sfx), lp = filt('lowpass', 420, 6), l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5; lg.gain.value = 180; l.connect(lg); lg.connect(lp.frequency); l.start(); nsrc().connect(lp).connect(g); A.loops.gloop = { g }; }
    // lobby crowd murmur (two vowel formants with a slow swell)
    { const g = G(A.amb), f1 = filt('bandpass', 480, 1.1), f2 = filt('bandpass', 1500, 1.4), s = nsrc(), am = c.createGain(), l = c.createOscillator(), lg = c.createGain(); am.gain.value = 0.7; l.frequency.value = 0.23; lg.gain.value = 0.3; l.connect(lg); lg.connect(am.gain); l.start(); s.connect(f1); s.connect(f2); f1.connect(am); f2.connect(am); am.connect(g); A.loops.crowd = { g }; }
    // film projector whirr (24 clicks a second) for SCREEN 1
    { const g = G(A.amb), b = filt('bandpass', 2600, 2), am = c.createGain(); am.gain.value = 0.5; const l = c.createOscillator(), lg = c.createGain(); l.type = 'square'; l.frequency.value = 24; lg.gain.value = 0.5; l.connect(lg); lg.connect(am.gain); l.start(); nsrc().connect(b).connect(am).connect(g); A.loops.projector = { g }; }
  }
  const setL = (k, v, tc = 0.06) => { const L = A.loops[k]; if (L) L.g.gain.setTargetAtTime(v, A.ctx.currentTime, tc); };

  // ---------- MUSIC: a tiny lookahead sequencer ----------
  const INST = {
    ep(n, t, d, v, dest) { const c = A.ctx, f = mtof(n), car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain(); car.frequency.value = f; mod.frequency.value = f * 1.0; mg.gain.setValueAtTime(f * 1.4, t); mg.gain.exponentialRampToValueAtTime(f * 0.08, t + 0.4); mod.connect(mg); mg.connect(car.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.5); car.connect(g); g.connect(dest); car.start(t); mod.start(t); car.stop(t + d + 0.6); mod.stop(t + d + 0.6); },
    bass(n, t, d, v, dest) { const c = A.ctx, o = c.createOscillator(), s = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = mtof(n); s.frequency.value = mtof(n); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.2);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(v * 0.4, t + 0.18); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(lp); s.connect(lp); lp.connect(g); g.connect(dest); o.start(t); s.start(t); o.stop(t + d + 0.05); s.stop(t + d + 0.05); },
    synBass(n, t, d, v, dest) { const c = A.ctx, o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); o.type = 'square'; o.frequency.value = mtof(n); lp.type = 'lowpass'; lp.Q.value = 6; lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.12);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(lp); lp.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05); },
    organ(n, t, d, v, dest) { const c = A.ctx, g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.setValueAtTime(v, t + d * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(dest); [1, 2, 3, 4].forEach((k, i) => { const o = c.createOscillator(); o.frequency.value = mtof(n) * k; const og = c.createGain(); og.gain.value = [1, 0.5, 0.3, 0.15][i]; o.connect(og); og.connect(g); o.start(t); o.stop(t + d + 0.05); }); },
    lead(n, t, d, v, dest) { const c = A.ctx, o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(), vb = c.createOscillator(), vg = c.createGain(); o.type = 'square'; o.frequency.value = mtof(n); vb.frequency.value = 5.5; vg.gain.value = 4; vb.connect(vg); vg.connect(o.detune); lp.type = 'lowpass'; lp.frequency.value = 2400;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.setValueAtTime(v * 0.8, t + d * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(lp); lp.connect(g); g.connect(dest); o.start(t); vb.start(t); o.stop(t + d + 0.05); vb.stop(t + d + 0.05); },
    vibe(n, t, d, v, dest) { const c = A.ctx, g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.8); g.connect(dest); [1, 4.0, 10.0].forEach((k, i) => { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = mtof(n) * k; og.gain.value = [1, 0.18, 0.05][i]; o.connect(og); og.connect(g); o.start(t); o.stop(t + d + 0.9); });
      const tr = c.createOscillator(), tg = c.createGain(); tr.frequency.value = 5; tg.gain.value = v * 0.3; tr.connect(tg); tg.connect(g.gain); tr.start(t); tr.stop(t + d + 0.9); },
    pad(ns, t, d, v, dest) { const c = A.ctx, lp = c.createBiquadFilter(), g = c.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(1500, t + d * 0.5); lp.frequency.linearRampToValueAtTime(700, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + d * 0.3); g.gain.linearRampToValueAtTime(v * 0.8, t + d * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + d + 0.3);
      lp.connect(g); g.connect(dest); ns.forEach(n => [-9, 9].forEach(dt => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + d + 0.4); })); },
    pluck(n, t, d, v, dest) { const c = A.ctx, o = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = mtof(n); lp.type = 'lowpass'; lp.frequency.value = 3000; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(lp); lp.connect(g); g.connect(dest); o.start(t); o.stop(t + d + 0.05); },
    brass(n, t, d, v, dest) { const c = A.ctx, lp = c.createBiquadFilter(), g = c.createGain(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(2200, t + 0.08); lp.frequency.linearRampToValueAtTime(1300, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.05); g.gain.setValueAtTime(v * 0.85, t + d * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2);
      lp.connect(g); g.connect(dest); [-6, 6].forEach(dt => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + d + 0.25); }); },
    kick(t, v, dest) { const c = A.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.25); },
    hat(t, v, dest, open = false) { noise(t, open ? 0.14 : 0.035, v, { type: 'highpass', f: 7500, dest }); },
    clap(t, v, dest) { [0, 0.012, 0.024].forEach(d => noise(t + d, 0.1, v, { f: 1600, q: 0.9, dest })); },
    brush(t, v, dest) { noise(t, 0.16, v, { f: 4500, q: 0.6, attack: 0.05, dest }); },
    rim(t, v, dest) { noise(t, 0.03, v, { f: 2500, q: 4, dest }); osc(1700, t, 0.03, v * 0.3, { dest }); },
    timp(t, v, dest) { const c = A.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(82, t); o.frequency.exponentialRampToValueAtTime(62, t + 0.6); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1); o.connect(g); g.connect(dest); o.start(t); o.stop(t + 1.2); noise(t, 0.2, v * 0.4, { type: 'lowpass', f: 400, dest }); },
  };
  // chord tables (MIDI)
  const LOBBY = [[50, [62, 65, 69, 72, 76]], [43, [59, 64, 65, 69, 74]], [48, [59, 64, 67, 71, 74]], [45, [61, 65, 67, 70, 73]]];   // Dm9 · G13 · Cmaj9 · A7alt
  const LOBBY_MEL = [[0, 81], [3, 79], [6, 77], [10, 76], [16, 77], [19, 74], [22, 76], [26, 72], [32, 76], [35, 74], [38, 72], [42, 71], [48, 73], [51, 76], [54, 79], [58, 77]];
  const RUSH = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [59, 62, 67]]];   // C · Am · F · G
  const RUSH_MEL = [[0, 76], [2, 79], [4, 81], [6, 79], [8, 76], [10, 74], [12, 72], [14, 74], [16, 76], [18, 76], [20, 72], [22, 69], [24, 72], [28, 74], [32, 77], [34, 81], [36, 84], [38, 81], [40, 77], [42, 76], [44, 74], [46, 72], [48, 74], [50, 76], [52, 79], [54, 76], [56, 74], [60, 72]];
  const MOVIE = [[48, [60, 63, 67, 72]], [44, [60, 63, 68, 72]], [51, [58, 63, 67, 70]], [46, [58, 62, 65, 70]]];   // Cm · Ab · Eb · Bb
  const MOVIE_MEL = [[0, 72], [12, 74], [16, 75], [28, 79], [32, 77], [40, 75], [44, 74], [48, 70], [56, 72]];
  const CUES = {
    lobby: { bpm: 96, swing: 0.16, vol: 0.6, step(s, t, D, dest, I) { const bar = Math.floor(s / 16) % 4, b = s % 16, [root, ch] = LOBBY[bar];
      if ([0, 3, 6, 10, 12].includes(b)) ch.forEach((n, i) => INST.ep(n, t + i * 0.008, b === 0 ? D * 5 : D * 2, 0.03, dest));
      if ([0, 6, 8, 14].includes(b)) INST.bass(b === 6 || b === 14 ? root + 7 : root, t, D * 3, 0.32, dest);
      if (b % 2 === 0) INST.brush(t, b % 4 === 2 ? 0.05 : 0.03, dest); if (b === 4 || b === 12) INST.rim(t, 0.06, dest);
      if (Math.floor(s / 64) % 2 === 1) { const m = LOBBY_MEL.find(x => x[0] === s % 64); if (m) INST.vibe(m[1], t, D * 3, 0.05, dest); } } },
    shift: { bpm: 128, swing: 0, vol: 1, step(s, t, D, dest, I) { const bar = Math.floor(s / 16) % 4, b = s % 16, [root, ch] = RUSH[bar], hot = I > 0.5;
      if (b % 4 === 0) INST.kick(t, 0.5, dest); if (b === 4 || b === 12) INST.clap(t, 0.16, dest); INST.hat(t, b % 2 ? 0.04 : 0.07, dest, b % 4 === 2);
      if (b % 2 === 0) INST.synBass(b % 4 === 2 ? root + 12 : root, t, D * 1.6, 0.2, dest);
      if ([2, 6, 10, 14].includes(b)) ch.forEach(n => INST.organ(n + 12, t, D * 1.2, 0.026, dest));
      if (Math.floor(s / 64) % 2 === 1 || hot) { const m = RUSH_MEL.find(x => x[0] === s % 64); if (m) INST.lead(m[1] + (hot ? 12 : 0) * (Math.floor(s / 64) % 2), t, D * 1.8, 0.05, dest); }
      if (hot && b % 2 === 1) INST.hat(t, 0.05, dest); } },
    movie: { bpm: 72, swing: 0, vol: 1, step(s, t, D, dest, I) { const bar = Math.floor(s / 16) % 4, b = s % 16, [root, ch] = MOVIE[bar];
      if (b === 0) { INST.pad(ch, t, D * 16, 0.035, dest); INST.bass(root - 12, t, D * 12, 0.25, dest); INST.timp(t, 0.22, dest); }
      INST.pluck(ch[[0, 1, 2, 3, 2, 1][b % 6]] + 12, t, D * 1.5, 0.035, dest);
      if (Math.floor(s / 64) % 2 === 0) { const m = MOVIE_MEL.find(x => x[0] === s % 64); if (m) INST.brass(m[1], t, D * 4, 0.05, dest); } } },
  };
  let cueName = null, intensity = 0, schedIv = 0;
  function cueNode(name) { const c = A.ctx; let Q = A.cues[name]; if (!Q) { const g = c.createGain(); g.gain.value = 0; g.connect(A.music); Q = A.cues[name] = { g, step: 0, next: c.currentTime + 0.05, on: false }; } return Q; }
  function schedule() { if (!A || A.ctx.state !== 'running') return; const c = A.ctx, ahead = c.currentTime + 0.14;
    for (const [name, Q] of Object.entries(A.cues)) { if (!Q.on && Q.g.gain.value < 0.003) continue; const C = CUES[name], bpm = C.bpm * (name === 'shift' ? 1 + 0.12 * intensity : 1), D = 60 / bpm / 4;
      if (Q.next < c.currentTime - 0.3) Q.next = c.currentTime + 0.02;
      while (Q.next < ahead) { const sw = Q.step % 2 ? D * C.swing : 0; try { if (prefs.music) C.step(Q.step, Q.next + sw, D, Q.g, intensity); } catch (e) {} Q.step++; Q.next += D; } } }
  function cue(name) { if (!build()) { cueName = name; return; } if (name === cueName && A.cues[name] && A.cues[name].on) return; cueName = name; const t = A.ctx.currentTime;
    for (const [k, Q] of Object.entries(A.cues)) { if (k !== name) { Q.on = false; Q.g.gain.cancelScheduledValues(t); Q.g.gain.setTargetAtTime(0, t, 0.5); } }
    if (name && CUES[name]) { const Q = cueNode(name); if (!Q.on) { Q.on = true; if (Q.g.gain.value < 0.01) { Q.step = 0; Q.next = t + 0.08; } Q.g.gain.cancelScheduledValues(t); Q.g.gain.setTargetAtTime(CUES[name].vol, t, 0.6); } }
    if (!schedIv) schedIv = setInterval(schedule, 25); }
  function sting(name) { if (!build() || !prefs.music) return; const t = A.ctx.currentTime + 0.05, d = A.music;
    if (name === 'start') { [[60, 0], [64, 0.12], [67, 0.24], [72, 0.36]].forEach(([n, dt]) => INST.brass(n, t + dt, 0.3, 0.07, d)); INST.kick(t + 0.36, 0.5, d); }
    if (name === 'done') { [[60, 64, 67], [65, 69, 72], [67, 71, 74], [72, 76, 79, 84]].forEach((ch, i) => ch.forEach(n => INST.brass(n, t + i * 0.22, i === 3 ? 1.4 : 0.2, 0.05, d))); INST.timp(t + 0.66, 0.3, d); }
    if (name === 'eod') { [72, 76, 79, 84, 88, 91].forEach((n, i) => INST.vibe(n, t + i * 0.09, 0.5, 0.07, d)); } }
  // ---------- per-frame mix ----------
  let chatT = 2, pewT = 1, wasHidden = false;
  function update(dt, m = {}) { if (!A) return; intensity = m.intensity || 0; const sx = prefs.sfx;
    setL('sizzle', sx ? (m.sizzle || 0) * 0.16 : 0, 0.08); setL('rustle', sx ? (m.rustle || 0) * 0.22 : 0, 0.03); setL('fizz', sx ? (m.fizz || 0) * 0.05 : 0, 0.2);
    setL('pour', sx ? (m.pour || 0) * 0.5 : 0, 0.03); if (m.pour && A.loops.pour) { const f = 520 + (m.pourF || 0) * 1100; A.loops.pour.b1.frequency.setTargetAtTime(f, A.ctx.currentTime, 0.05); A.loops.pour.b2.frequency.setTargetAtTime(f * 1.62, A.ctx.currentTime, 0.05); }
    setL('hum', sx ? (m.hum || 0) * 0.05 : 0, 0.3); setL('gloop', sx ? (m.gloop || 0) * 0.4 : 0, 0.04); setL('crowd', sx ? (m.crowd || 0) * 0.12 : 0, 0.8); setL('projector', sx ? (m.projector || 0) * 0.05 : 0, 0.5);
    chatT -= dt; if (chatT <= 0) { chatT = rnd(0.6, 2.4) / Math.max(0.2, m.crowd || 0.2); if ((m.crowd || 0) > 0.15) S.chatter(rnd(-0.6, 0.6)); }
    pewT -= dt; if (pewT <= 0) { pewT = rnd(0.5, 1.8); if ((m.movie || 0) > 0.1) { if (Math.random() < 0.15) S.boom(); else S.pew(rnd(-0.5, 0.5)); } }
    if (m.cue !== undefined && m.cue !== cueName) cue(m.cue); }
  function unlock() { if (A && A.ctx.state === 'running' && (!cueName || (A.cues[cueName] && A.cues[cueName].on))) return; try { amb.init && amb.init(); } catch (e) {} build(); if (A && A.ctx.state === 'suspended') A.ctx.resume(); if (cueName && A && !(A.cues[cueName] && A.cues[cueName].on)) { const c = cueName; cueName = null; cue(c); } }
  function setMusic(v) { prefs.music = !!v; save(); if (A) A.music.gain.setTargetAtTime(v ? 0.34 : 0, A.ctx.currentTime, 0.2); }
  function setSfx(v) { prefs.sfx = !!v; save(); if (A) { A.sfx.gain.setTargetAtTime(v ? 0.95 : 0, A.ctx.currentTime, 0.1); A.amb.gain.setTargetAtTime(v ? 0.55 : 0, A.ctx.currentTime, 0.2); } }
  const save = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} };
  const onVis = () => { if (!A) return; if (document.hidden) { wasHidden = A.ctx.state === 'running'; A.ctx.suspend(); } else if (wasHidden) A.ctx.resume(); };
  document.addEventListener('visibilitychange', onVis);
  function _offline(name, secs) { build(); const Q = cueNode(name), C = CUES[name], D = 60 / C.bpm / 4; Q.on = true; Q.g.gain.value = 1; Q.next = 0.05; Q.step = 0; while (Q.next < secs) { const sw = Q.step % 2 ? D * C.swing : 0; C.step(Q.step, Q.next + sw, D, Q.g, name === 'shift' ? 0 : 0); Q.step++; Q.next += D; } }
  return { ...S, sfx: S, _offline, unlock, update, cue, sting, setMusic, setSfx, prefs: () => ({ ...prefs }), get ready() { return !!A; }, destroy() { clearInterval(schedIv); document.removeEventListener('visibilitychange', onVis); } };
}
