// 8 GATES — DOMINOES CLUB [dominoesClub] · sound. Everything is synthesised with Web Audio (no media files to ship or load).
// Copied from the Go Club's audio and re-voiced for dominoes on a porch table:
//   SFX   — bone-on-felt clicks (and the proud SLAM), the "wash" when tiles are shuffled face down, drawing from the boneyard,
//           the double knock on the table that means "pass", a bright clave + coins when All Fives scores, the spinner shimmer,
//           DOMINÓ (slam + bell + crowd), a dull thud for a blocked game, buttons, ticks, cheers, win / lose stings.
//   MUSIC — "porch": a generative son montuno at 100 bpm — 3-2 clave, bongo martillo, maracas, a tumbao bass and a tres guitar
//           playing montuno patterns over C–F–G–F. Lighter under the menu, full in play, filtered when someone has one tile left.
// createDominoesAudio() → { unlock, sfx(name, opt), setSound(on), setMusic(on), mood('menu'|'play'|'tense'|'over'), duck(on), suspend(on) }

const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

export function createDominoesAudio({ sound = true, music = true } = {}) {
  let ctx = null, master, sfxBus, musBus, musFilter, verb, verbIn, noiseBuf, on = { sound, music }, moodNow = 'menu', duckOn = false, susp = false;
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = on.sound ? 1 : 0; sfxBus.connect(master);
    musFilter = ctx.createBiquadFilter(); musFilter.type = 'lowpass'; musFilter.frequency.value = 5200; musFilter.Q.value = 0.4; musFilter.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(musFilter);
    // a covered porch: short, airy stereo impulse
    verb = ctx.createConvolver(); const len = Math.floor(ctx.sampleRate * 1.1), ir = ctx.createBuffer(2, len, ctx.sampleRate);
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
    noise(t + 0.004, 0.012, { type: 'highpass', f: 6000, q: 0.5, gain: 0.05 * loud, wet: 0, pan });
  }
  // a wooden disc slid a little then set down: a soft felt slide, then a flat click with a hollow body
  function disc(t, pitch = 1, loud = 1, pan = 0, slide = true) {
    if (slide) noise(t, 0.07, { type: 'bandpass', f: 1400, f2: 900, q: 0.8, gain: 0.05 * loud, a: 0.03, wet: 0.05, pan });
    const t1 = t + (slide ? 0.05 : 0);
    noise(t1, 0.025, { f: 2100 * pitch, q: 5, gain: 0.48 * loud, wet: 0.12, pan });
    noise(t1, 0.045, { type: 'lowpass', f: 700, q: 0.8, gain: 0.22 * loud, wet: 0.06, pan });
    osc(t1, 260 * pitch, 0.06, { gain: 0.26 * loud, f2: 150 * pitch, wet: 0.05, pan });
  }

  // ---------- dominoes ----------
  // a bone/resin tile set down on felt over wood: short bright click, a soft felt thump, a little wood body
  function tile(t, loud = 1, pan = 0, slam = false) {
    const l = loud * (slam ? 1.6 : 1);
    noise(t, 0.012, { type: 'highpass', f: 4200, q: 0.7, gain: 0.32 * l, wet: 0.08, pan });
    noise(t, 0.03, { f: rr(2500, 3100), q: 5, gain: 0.55 * l, wet: 0.12, pan });
    noise(t, slam ? 0.12 : 0.05, { type: 'lowpass', f: slam ? 600 : 900, q: 0.8, gain: (slam ? 0.7 : 0.25) * l, wet: slam ? 0.2 : 0.06, pan });
    osc(t, slam ? 120 : 190, slam ? 0.18 : 0.07, { gain: (slam ? 0.45 : 0.18) * l, f2: slam ? 55 : 110, wet: 0.08, pan });
    if (slam) for (let i = 0; i < 4; i++) noise(t + 0.03 + i * 0.025 + rr(0, 0.015), 0.012, { f: rr(2800, 4200), q: 6, gain: 0.18 * loud, wet: 0.1, pan: pan + rr(-0.3, 0.3) });   // the other tiles jump
  }
  function slide(t, dur = 0.12, loud = 1, pan = 0) { noise(t, dur, { type: 'bandpass', f: 1800, f2: 1100, q: 0.7, gain: 0.09 * loud, a: dur * 0.5, wet: 0.05, pan }); }
  function knock(t, loud = 1) { loud *= 0.62; osc(t, 140, 0.09, { type: 'sine', gain: 0.5 * loud, f2: 90, wet: 0.12 }); noise(t, 0.03, { type: 'lowpass', f: 1300, q: 1.2, gain: 0.45 * loud, wet: 0.12 }); noise(t, 0.008, { f: 3000, q: 2, gain: 0.12 * loud, wet: 0.05 }); }
  const clave = (t, gain = 0.3, bus = sfxBus, pan = 0) => { osc(t, 2500, 0.06, { gain, f2: 2450, bus, wet: 0.15, pan }); osc(t, 1700, 0.05, { gain: gain * 0.4, bus, wet: 0.1, pan }); };

  // ---------- SFX ----------
  const SFX = {
    tile: o => { const t = T(); tile(t, (o && o.loud) || 1, (o && o.pan) || 0, !!(o && o.slam)); },
    wash: o => { const t = T(); for (let i = 0; i < 26; i++) { const tt = t + rr(0, 1.1); noise(tt, 0.016, { f: rr(2200, 3800), q: 5, gain: rr(0.12, 0.32), wet: 0.1, pan: rr(-0.6, 0.6) }); } slide(t, 1.1, 1.4); },
    deal: o => { const t = T(), n = (o && o.n) || 7; for (let i = 0; i < n; i++) { slide(t + i * 0.07, 0.06, 0.8, rr(-0.4, 0.4)); tile(t + i * 0.07 + 0.05, 0.45, rr(-0.4, 0.4)); } },
    draw: o => { const t = T(), pan = (o && o.pan) || 0; slide(t, 0.16, 1.2, pan); tile(t + 0.15, 0.5, pan); },
    knock: o => { const t = T(); knock(t); knock(t + 0.17, 0.85); },
    score: o => { const t = T(), pts = (o && o.pts) || 5, k = Math.min(6, Math.round(pts / 5)); clave(t, 0.2); clave(t + 0.12, 0.16);
      for (let i = 0; i < k; i++) bell(t + 0.2 + i * 0.07, mtof(84 + [0, 4, 7, 12, 16, 19][i]), 0.6, 0.045, 3.5, 1.6); },
    spinner: o => { const t = T(); for (let i = 0; i < 5; i++) bell(t + i * 0.05, mtof(88 + i * 2), 0.8, 0.03, 2.76, 0.8); },
    domino: o => { const t = T(); tile(t, 1.2, 0, true); bell(t + 0.12, mtof(72), 1.6, 0.09, 2, 1.4); bell(t + 0.12, mtof(79), 1.6, 0.06, 2, 1.4); SFX.ooh(); },
    blocked: o => { const t = T(); osc(t, 98, 0.5, { type: 'triangle', gain: 0.22, f2: 82, wet: 0.2 }); osc(t + 0.18, 73, 0.6, { type: 'triangle', gain: 0.18, f2: 65, wet: 0.2 }); knock(t, 0.6); },
    turn: o => { const t = T(); osc(t, 880, 0.06, { type: 'triangle', gain: 0.08, wet: 0.1 }); osc(t + 0.07, 1320, 0.08, { type: 'triangle', gain: 0.06, wet: 0.1 }); },
    pick: o => { const t = T(); noise(t, 0.016, { f: 3600, q: 3, gain: 0.45, wet: 0.05 }); noise(t, 0.03, { type: 'lowpass', f: 1200, q: 0.7, gain: 0.12, wet: 0 }); osc(t, 1250, 0.035, { gain: 0.05, wet: 0 }); },
    bad: o => { const t = T(); osc(t, 150, 0.09, { type: 'triangle', gain: 0.16, f2: 110, wet: 0.05 }); osc(t + 0.1, 120, 0.12, { type: 'triangle', gain: 0.12, f2: 90, wet: 0.05 }); },
    ui: o => { const t = T(); noise(t, 0.014, { f: 2800, q: 2, gain: 0.32, wet: 0 }); osc(t, 900, 0.025, { gain: 0.03, wet: 0 }); },
    tick: o => { const t = T(), hi = o && o.hi; noise(t, 0.02, { f: hi ? 4200 : 3000, q: 3, gain: hi ? 0.6 : 0.42, wet: 0.05 }); osc(t, hi ? 1760 : 1320, 0.05, { gain: hi ? 0.06 : 0.035, wet: 0 }); },
    start: o => { SFX.wash(); },
    win: o => { const t = T(); [60, 64, 67, 72, 76].forEach((m, i) => { bell(t + i * 0.11, mtof(m + 12), 1.6, 0.08, 2.0, 1.6); }); [48, 55, 64, 67].forEach(m => ep(t + 0.55, mtof(m), 2.5, 0.06, sfxBus)); for (let i = 0; i < 6; i++) clave(t + 0.55 + [0, 0.3, 0.6, 1.05, 1.35][i % 5] + (i > 4 ? 1.2 : 0), 0.18); },
    lose: o => { const t = T(); [67, 63, 60, 55].forEach((m, i) => bell(t + i * 0.2, mtof(m), 1.6, 0.06, 1.0, 0.8)); },
    clap: o => { const t = T(), n = 14 + Math.floor(rr(0, 10)); for (let i = 0; i < n; i++) { const tt = t + rr(0, 0.9); noise(tt, 0.025, { f: rr(900, 2200), q: 1.2, gain: rr(0.16, 0.34), wet: 0.35, pan: rr(-0.7, 0.7) }); } },
    ooh: o => { const t = T(); for (const [f, p] of [[220, -0.4], [277, 0.1], [330, 0.5]]) vowel(t, f, f * 1.25, 0.7, 0.16, p, [700, 1100]); },
    oof: o => { const t = T(); for (const [f, p] of [[196, -0.3], [233, 0.3]]) vowel(t, f, f * 0.7, 0.5, 0.18, p, [500, 800]); },
  };
  function vowel(t, f1, f2, dur, gain, pan, form) {   // a crowd voice: a saw through two formants
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f1, t); o.frequency.linearRampToValueAtTime(f2, t + dur);
    const sum = ctx.createGain(); for (const ff of form) { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = ff; b.Q.value = 6; o.connect(b); b.connect(sum); }
    sum.connect(g); env(g, t, 0.08, gain, dur); out(g, sfxBus, 0.4, pan); o.start(t); o.stop(t + dur + 0.2);
  }

  // ---------- shared voices ----------
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
  // ---------- porch: son montuno ----------
  // tres: a doubled-course plucked string (two detuned saws an octave apart through a closing lowpass)
  function tres(t, f, dur, gain, pan = 0.25) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(4200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.25); lp.connect(g);
    for (const [m, d] of [[1, -4], [1, 4], [2, 2]]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * m; o.detune.value = d; const og = ctx.createGain(); og.gain.value = m === 2 ? 0.4 : 0.5; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 0.05); }
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.004); g.gain.exponentialRampToValueAtTime(gain * 0.25, t + 0.18); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); out(g, musBus, 0.18, pan); }
  const bongo = (t, hi, gain) => { osc(t, hi ? 420 : 300, hi ? 0.09 : 0.12, { gain, f2: hi ? 360 : 250, bus: musBus, wet: 0.12, pan: -0.35 }); noise(t, 0.012, { f: hi ? 3000 : 2000, q: 2, gain: gain * 0.6, bus: musBus, wet: 0.08, pan: -0.35 }); };
  const maraca = (t, gain) => noise(t, 0.045, { type: 'highpass', f: 6500, q: 0.7, gain, a: 0.012, bus: musBus, wet: 0.08, pan: 0.45 });
  const CHORDS = [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]];   // C F G F
  const CLAVE = [0, 3, 6, 10, 12];   // 3-2 son clave on a 16-step bar … two bars long (steps 0..31)
  const MONTUNO = [0, 2, 3, 5, 6, 8, 10, 11, 13, 14];   // tres attacks in a bar (16ths)
  const seq = { running: false, timer: 0, next: 0, step: 0, bar: 0, bpm: 100, root: 60 };
  function schedule() {
    if (!ctx) return; const s16 = 60 / seq.bpm / 4, now = T();
    if (seq.next < now - 0.2) seq.next = now + 0.05;
    while (seq.next < now + 0.25) {
      const t = seq.next, st = seq.step, bar = seq.bar, full = moodNow === 'play' || moodNow === 'tense', soft = moodNow === 'menu', over = moodNow === 'over';
      const ch = CHORDS[bar % 4], root = seq.root, sw = (st % 2) ? s16 * 0.08 : 0, tt = t + sw;
      // clave: 3 side on even bars, 2 side on odd bars (steps 0,3,6 | 4,8 → mapped)
      const clv = bar % 2 === 0 ? [0, 6, 12] : [4, 8]; if (clv.includes(st)) clave(tt, soft ? 0.05 : 0.08, musBus, 0.1);
      // bass tumbao: the "and" of 2 and beat 4 (steps 6 and 12), anticipating the next chord
      if (!over && (st === 6 || st === 12)) { const nx = CHORDS[(bar + (st === 12 ? 1 : 0)) % 4]; bassNote(tt, mtof(root - 24 + (st === 6 ? ch[0] + 7 - 12 : nx[0])), s16 * 6, soft ? 0.14 : 0.2); }
      // tres montuno: broken chord tones in a syncopated pattern
      if (MONTUNO.includes(st) && (full || st % 4 !== 2)) { const k = MONTUNO.indexOf(st), note = root + ch[k % 3] + (k % 4 === 3 ? 12 : 0); tres(tt, mtof(note), s16 * 2.2, soft ? 0.03 : 0.045); if (k % 3 === 0 && !soft) tres(tt, mtof(note + (k % 2 ? 4 : 3)), s16 * 2, 0.02, 0.35); }
      // bongos (martillo) and maracas in play
      if (full) { if (st % 2 === 0) bongo(tt, st % 4 === 2 || st === 12, st % 4 === 0 ? 0.06 : 0.1); maraca(tt, st % 4 === 0 ? 0.05 : 0.025); }
      if (over && st === 0 && bar % 2 === 0) for (const n of ch) tres(tt + n * 0.004, mtof(root + n), s16 * 10, 0.025);
      seq.next += s16; seq.step++;
      if (seq.step >= 16) { seq.step = 0; seq.bar++; }
    }
  }
  function startMusic() { if (!ctx || seq.running) return; seq.running = true; seq.next = T() + 0.1; seq.timer = setInterval(schedule, 60); schedule(); fadeMusic(); }
  function stopMusic() { seq.running = false; clearInterval(seq.timer); if (ctx) { musBus.gain.cancelScheduledValues(T()); musBus.gain.setTargetAtTime(0, T(), 0.3); } }
  function fadeMusic() { if (!ctx) return; const lvl = !on.music ? 0 : (moodNow === 'over' ? 0.4 : moodNow === 'menu' ? 0.7 : 0.9) * (duckOn ? 0.35 : 1); musBus.gain.cancelScheduledValues(T()); musBus.gain.setTargetAtTime(lvl, T(), 0.6); musFilter.frequency.setTargetAtTime(moodNow === 'tense' ? 2200 : moodNow === 'over' ? 2000 : 6000, T(), 0.8); }

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
