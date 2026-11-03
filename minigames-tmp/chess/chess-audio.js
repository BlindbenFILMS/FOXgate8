// 8 GATES — CHESS CLUB [chessClub] · sound. Everything is synthesised with Web Audio (no media files to ship or load):
//   SFX   — wooden piece clacks (weight per piece), pick-up tick, capture knock + tray drop, castle, check bell, promotion sparkle,
//           illegal thud, button tick, clock ticks under 10 s, crowd cheers for online reactions, win / lose / draw stings.
//   MUSIC — "club lounge": a generative late-night jazz trio (electric piano comping, walking bass, brushed ride) at ~84 bpm.
//           Never the same twice; soft under the menu, full during play, it ducks while moves are spoken, fades at game end.
// createChessAudio() → { unlock, sfx(name, opt), setSound(on), setMusic(on), mood('menu'|'play'|'tense'|'over'), duck(on), suspend(on) }

const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

export function createChessAudio({ sound = true, music = true } = {}) {
  let ctx = null, master, sfxBus, musBus, musFilter, verb, verbIn, noiseBuf, on = { sound, music }, moodNow = 'menu', duckOn = false, susp = false;
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = on.sound ? 1 : 0; sfxBus.connect(master);
    musFilter = ctx.createBiquadFilter(); musFilter.type = 'lowpass'; musFilter.frequency.value = 5200; musFilter.Q.value = 0.4; musFilter.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(musFilter);
    // a small wood-panelled room: generated stereo impulse
    verb = ctx.createConvolver(); const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 220 ? i / 220 : 1); } }
    verb.buffer = ir; verbIn = ctx.createGain(); verbIn.gain.value = 0.22; verbIn.connect(verb); const vOut = ctx.createGain(); vOut.gain.value = 0.55; verb.connect(vOut); vOut.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    return true;
  }
  function unlock() { if (!ctx && !build()) return; if (ctx.state === 'suspended' && !susp) ctx.resume(); if (on.music && !seq.running) startMusic(); }
  const T = () => ctx.currentTime;

  // ---------- building blocks ----------
  function env(g, t, a, peak, d, end = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
  function out(node, bus, wet = 0, pan = 0) { let n = node; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; n.connect(p); n = p; } n.connect(bus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; n.connect(w); w.connect(verbIn); } }
  function noise(t, dur, { type = 'bandpass', f = 2000, q = 1, gain = 0.3, a = 0.001, bus = sfxBus, wet = 0.15, pan = 0, f2 } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = rr(0.9, 1.1); const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q; const g = ctx.createGain();
    s.connect(fl); fl.connect(g); env(g, t, a, gain, dur); out(g, bus, wet, pan); s.start(t, rr(0, 0.5)); s.stop(t + a + dur + 0.05);
  }
  function osc(t, f, dur, { type = 'sine', gain = 0.2, a = 0.002, f2, bus = sfxBus, wet = 0.2, pan = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); o.connect(g); env(g, t, a, gain, dur); out(g, bus, wet, pan); o.start(t); o.stop(t + a + dur + 0.05);
  }
  function bell(t, f, dur = 1.4, gain = 0.12, ratio = 3.5, index = 2.2, bus = sfxBus, wet = 0.45) {   // FM bell
    const c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain(); c.frequency.value = f; m.frequency.value = f * ratio;
    mg.gain.setValueAtTime(f * index, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur); m.connect(mg); mg.connect(c.frequency); c.connect(g); env(g, t, 0.003, gain, dur); out(g, bus, wet); c.start(t); m.start(t); c.stop(t + dur + 0.1); m.stop(t + dur + 0.1);
  }
  // a wooden piece set down on a wooden board. weight 0 (pawn) … 1 (king)
  function clack(t, weight = 0.5, loud = 1, pan = 0) {
    const f = 2600 - weight * 900 + rr(-120, 120);
    noise(t, 0.035, { f, q: 6, gain: 0.5 * loud, wet: 0.12, pan });
    noise(t, 0.018, { f: f * 1.9, q: 9, gain: 0.22 * loud, wet: 0.05, pan });
    noise(t, 0.06, { type: 'lowpass', f: 900, q: 0.7, gain: 0.25 * loud, wet: 0.08, pan });
    osc(t, 230 - weight * 70, 0.07, { gain: 0.32 * loud, f2: 120, wet: 0.05, pan });   // the board's body
    noise(t + 0.004, 0.012, { type: 'highpass', f: 6000, q: 0.5, gain: 0.05 * loud, wet: 0, pan });   // felt brush
  }
  const W = { p: 0.1, n: 0.45, b: 0.5, r: 0.65, q: 0.85, k: 1 };

  // ---------- SFX ----------
  const SFX = {
    pick: o => { const t = T(); noise(t, 0.016, { f: 3600, q: 3, gain: 0.45, wet: 0.05 }); noise(t, 0.03, { type: 'lowpass', f: 1200, q: 0.7, gain: 0.12, wet: 0 }); osc(t, 1250, 0.035, { gain: 0.05, wet: 0 }); },
    move: o => clack(T() + 0.005, W[(o && o.t) || 'p'], 1, o && o.pan),
    capture: o => { const t = T(); clack(t, W[(o && o.t) || 'n'], 1.25, o && o.pan); clack(t + 0.065, 0.3, 0.55, o && o.pan); noise(t, 0.12, { type: 'lowpass', f: 400, q: 1, gain: 0.25, wet: 0.2 }); },
    tray: o => { const t = T(); clack(t, 0.2, 0.35); clack(t + 0.07, 0.2, 0.18); clack(t + 0.12, 0.2, 0.08); },
    castle: o => { const t = T(); clack(t, 1, 0.7); clack(t + 0.13, 0.65, 0.6); },
    check: o => { const t = T(); bell(t, 1318.5, 1.3, 0.09); bell(t + 0.09, 1975.5, 1.1, 0.05); },
    promote: o => { const t = T(); [0, 4, 7, 12, 16].forEach((s, i) => bell(t + i * 0.055, mtof(84 + s), 0.9, 0.05, 2.01, 1.2)); noise(t, 0.6, { type: 'highpass', f: 7000, q: 0.5, gain: 0.05, a: 0.05, wet: 0.5 }); },
    bad: o => { const t = T(); osc(t, 150, 0.09, { type: 'triangle', gain: 0.16, f2: 110, wet: 0.05 }); osc(t + 0.1, 120, 0.12, { type: 'triangle', gain: 0.12, f2: 90, wet: 0.05 }); },
    ui: o => { const t = T(); noise(t, 0.014, { f: 2800, q: 2, gain: 0.32, wet: 0 }); osc(t, 900, 0.025, { gain: 0.03, wet: 0 }); },
    tick: o => { const t = T(), hi = o && o.hi; noise(t, 0.02, { f: hi ? 4200 : 3000, q: 3, gain: hi ? 0.6 : 0.42, wet: 0.05 }); osc(t, hi ? 1760 : 1320, 0.05, { gain: hi ? 0.06 : 0.035, wet: 0 }); },
    start: o => { const t = T(); noise(t, 0.5, { type: 'bandpass', f: 600, f2: 2400, q: 1.2, gain: 0.07, a: 0.2, wet: 0.4 }); bell(t + 0.35, mtof(72), 1.4, 0.06, 2, 1.3); bell(t + 0.35, mtof(79), 1.4, 0.04, 2, 1.3); },
    win: o => { const t = T(); [60, 64, 67, 72, 76].forEach((m, i) => { bell(t + i * 0.11, mtof(m + 12), 1.6, 0.08, 2.0, 1.6); }); [48, 55, 64, 67].forEach(m => ep(t + 0.55, mtof(m), 2.5, 0.06, sfxBus)); },
    lose: o => { const t = T(); [67, 63, 60, 55].forEach((m, i) => bell(t + i * 0.2, mtof(m), 1.6, 0.06, 1.0, 0.8)); },
    draw: o => { const t = T(); bell(t, mtof(67), 1.5, 0.06, 2, 1); bell(t + 0.25, mtof(67), 1.5, 0.05, 2, 1); },
    clap: o => { const t = T(), n = 14 + Math.floor(rr(0, 10)); for (let i = 0; i < n; i++) { const tt = t + rr(0, 0.9); noise(tt, 0.025, { f: rr(900, 2200), q: 1.2, gain: rr(0.16, 0.34), wet: 0.35, pan: rr(-0.7, 0.7) }); } },
    ooh: o => { const t = T(); for (const [f, p] of [[220, -0.4], [277, 0.1], [330, 0.5]]) vowel(t, f, f * 1.25, 0.7, 0.16, p, [700, 1100]); },
    oof: o => { const t = T(); for (const [f, p] of [[196, -0.3], [233, 0.3]]) vowel(t, f, f * 0.7, 0.5, 0.18, p, [500, 800]); },
  };
  function vowel(t, f1, f2, dur, gain, pan, form) {   // a crowd voice: a saw through two formants
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f1, t); o.frequency.linearRampToValueAtTime(f2, t + dur);
    const sum = ctx.createGain(); for (const ff of form) { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = ff; b.Q.value = 6; o.connect(b); b.connect(sum); }
    sum.connect(g); env(g, t, 0.08, gain, dur); out(g, sfxBus, 0.4, pan); o.start(t); o.stop(t + dur + 0.2);
  }

  // ---------- MUSIC: club lounge trio ----------
  // electric piano voice (FM: ratio 1 body + a bright tine that dies fast)
  function ep(t, f, dur, gain, bus = musBus, pan = 0) {
    const c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), tine = ctx.createOscillator(), tg = ctx.createGain(), g = ctx.createGain();
    c.frequency.value = f; m.frequency.value = f; mg.gain.setValueAtTime(f * 1.4, t); mg.gain.exponentialRampToValueAtTime(f * 0.15, t + 0.6); m.connect(mg); mg.connect(c.frequency);
    tine.frequency.value = f * 14.1; tg.gain.setValueAtTime(0.0001, t); tg.gain.exponentialRampToValueAtTime(gain * 0.12, t + 0.002); tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); tine.connect(tg);
    c.connect(g); tg.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.006); g.gain.exponentialRampToValueAtTime(gain * 0.4, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out(g, bus, 0.28, pan); for (const n of [c, m, tine]) { n.start(t); n.stop(t + dur + 0.05); }
  }
  function bassNote(t, f, dur, gain) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(280, t + 0.25); o.connect(lp); o2.connect(lp); lp.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(gain * 0.5, t + 0.15); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    out(g, musBus, 0.08); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function ride(t, gain, pan = 0.35) {   // metallic: inharmonic squares through a highpass
    const g = ctx.createGain(), hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500; hp.connect(g);
    for (const r of [1, 1.342, 1.807, 2.413, 3.031]) { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 310 * r; o.connect(hp); o.start(t); o.stop(t + 0.5); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45); out(g, musBus, 0.25, pan);
  }
  const brush = (t, d, gain) => noise(t, d, { type: 'bandpass', f: 4500, f2: 3000, q: 0.8, gain, a: d * 0.6, bus: musBus, wet: 0.1, pan: -0.3 });
  const kick = (t, gain) => osc(t, 95, 0.18, { gain, f2: 45, bus: musBus, wet: 0 });
  // progressions: chords as MIDI (rootless-ish voicings) + bass root
  const SONGS = [
    [['D', [53, 57, 60, 64], 38], ['G', [53, 57, 59, 64], 43], ['C', [52, 55, 59, 62], 36], ['A', [55, 58, 61, 64], 45]],          // ii V I VI (C)
    [['F', [52, 57, 60, 64], 41], ['E', [50, 55, 59, 62], 40], ['A', [55, 60, 64, 67], 45], ['D', [54, 57, 60, 64], 38]],          // IV iii vi II
    [['Eb', [55, 58, 62, 65], 39], ['Ab', [55, 60, 63, 67], 44], ['D', [53, 57, 60, 63], 38], ['G', [53, 57, 59, 63], 43]],      // a turn to minor
  ];
  const seq = { running: false, timer: 0, next: 0, step: 0, bar: 0, song: 0, bpm: 84 };
  function schedule() {
    if (!ctx) return; const spb = 60 / seq.bpm, eighth = spb / 2, now = T();
    if (seq.next < now - 0.2) seq.next = now + 0.05;
    while (seq.next < now + 0.25) {
      const t = seq.next, beat = Math.floor(seq.step / 2), off = seq.step % 2, bar = seq.bar, prog = SONGS[seq.song], ch = prog[bar % prog.length], nextCh = prog[(bar + 1) % prog.length];
      const swing = off ? eighth * 0.34 : 0, tt = t + swing, full = moodNow === 'play' || moodNow === 'tense', soft = moodNow === 'menu';
      // ride: ding ... ding-da ding
      if (!soft || bar % 2) { if (!off) ride(tt, beat % 2 ? 0.035 : 0.05, 0.35); else if (beat % 2 === 1) ride(tt, 0.022, 0.35); }
      if (full && !off) brush(tt, spb * 0.9, 0.025);
      if (full && !off && beat === 0 && Math.random() < 0.6) kick(tt, 0.09);
      // walking bass on every beat
      if (!off) { const root = ch[2], tgt = nextCh[2]; let n; if (beat === 0) n = root; else if (beat === 3) n = tgt + (Math.random() < 0.5 ? 1 : -1); else n = root + pick(beat === 1 ? [4, 3, 7] : [7, 5, 10]); bassNote(tt, mtof(n), spb * 0.95, soft ? 0.11 : 0.15); }
      // piano comping: on 1, and a pushed hit on the and-of-2 / and-of-4
      const hit = (!off && beat === 0 && Math.random() < 0.85) || (off && beat === 1 && Math.random() < 0.55) || (off && beat === 3 && Math.random() < 0.3);
      if (hit) ch[1].forEach((m, i) => ep(tt + i * 0.008, mtof(m), spb * rr(1.2, 2.2), soft ? 0.035 : 0.045, musBus, (i - 1.5) * 0.15));
      // sparse melody
      if (full && Math.random() < 0.09) { const sc = ch[1].map(m => m + 12).concat([ch[2] + 26, ch[2] + 33]); ep(tt, mtof(pick(sc)), spb * 1.6, 0.04, musBus, 0.3); }
      seq.next += eighth; seq.step++;
      if (seq.step >= 8) { seq.step = 0; seq.bar++; if (seq.bar % (prog.length * 2) === 0 && Math.random() < 0.6) seq.song = (seq.song + 1) % SONGS.length; }
    }
  }
  function startMusic() { if (!ctx || seq.running) return; seq.running = true; seq.next = T() + 0.1; seq.timer = setInterval(schedule, 60); schedule(); fadeMusic(); }
  function stopMusic() { seq.running = false; clearInterval(seq.timer); if (ctx) { musBus.gain.cancelScheduledValues(T()); musBus.gain.setTargetAtTime(0, T(), 0.3); } }
  function fadeMusic() { if (!ctx) return; const lvl = !on.music ? 0 : (moodNow === 'over' ? 0.14 : moodNow === 'menu' ? 0.32 : 0.4) * (duckOn ? 0.35 : 1); musBus.gain.cancelScheduledValues(T()); musBus.gain.setTargetAtTime(lvl, T(), 0.6); musFilter.frequency.setTargetAtTime(moodNow === 'tense' ? 2600 : moodNow === 'over' ? 1800 : 5200, T(), 0.8); }

  return {
    unlock,
    sfx(name, o) { if (!on.sound || !ctx || ctx.state !== 'running') return; const f = SFX[name]; if (f) try { f(o); } catch (e) {} },
    setSound(v) { on.sound = !!v; if (ctx) sfxBus.gain.setTargetAtTime(v ? 1 : 0, T(), 0.05); },
    setMusic(v) { on.music = !!v; if (!ctx) return; if (v) { if (!seq.running) startMusic(); else fadeMusic(); } else stopMusic(); },
    mood(m) { if (m === moodNow) return; moodNow = m; fadeMusic(); },
    duck(v) { if (duckOn === !!v) return; duckOn = !!v; fadeMusic(); },
    suspend(v) { susp = !!v; if (!ctx) return; if (v) ctx.suspend(); else ctx.resume(); },
    get ready() { return !!ctx && ctx.state === 'running'; },
  };
}
