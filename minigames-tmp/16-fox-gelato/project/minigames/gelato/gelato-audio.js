// 8 GATES — FOX GELATO AUDIO: every sound in the parlour is synthesised live (no files to load, works offline and on iPhone).
//   const A = createGelatoAudio(ambience)   ambience = the restaurant-kit Ambience (shares its AudioContext, master gain and mute)
//   A.sfx(name, opts)                       one-shot sounds (see SFX below)
//   A.scrape(on, speed) / A.pour(on, wet)   continuous loops: carving a scoop, squeezing sauce
//   A.music.tick(mode, opts)                call every frame: mode 'parlour' (walk / welcome card), 'shift' (working) or null (off)
//   A.blip(freq, dur, vol, type)            a soft marimba voice that replaces bare oscillator beeps
export function createGelatoAudio(amb) {
  let ctx = null, out = null, sfxBus = null, musBus = null, verb = null, noise = null;
  const R = (a, b) => a + Math.random() * (b - a), mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function ready(init) {
    if (!amb.ctx && init) { try { amb.init(); } catch (e) {} } if (!amb.ctx) return false;
    if (ctx === amb.ctx) return true; ctx = amb.ctx; try { if (amb.wind) amb.wind.gain.value = 0; } catch (e) {}
    out = ctx.createGain(); out.gain.value = 1; out.connect(amb.master);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(out);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(comp); musBus = ctx.createGain(); musBus.gain.value = 0.5; musBus.connect(comp);
    // small parlour room: a generated impulse response (tiled room, short and bright)
    const len = Math.floor(ctx.sampleRate * 1.1), ir = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2) * (i < 80 ? i / 80 : 1); }
    verb = ctx.createConvolver(); verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = 0.28; verb.connect(vg); vg.connect(comp);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    return true; }
  const live = init => ready(init) && !amb.muted && ctx.state !== 'closed';
  // ---- building blocks ----
  function env(g, t, a, peak, d, sus = 0, rel = 0.05, hold = 0) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (sus > 0) { g.gain.setTargetAtTime(peak * sus, t + a, d / 3); g.gain.setTargetAtTime(0.0001, t + a + hold, rel / 3); } else g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function osc(type, f, t, dur, peak, { to, a = 0.004, bus = sfxBus, wet = 0.15, detune = 0, pan = 0, glide } = {}) { if (f > 15000) return { frequency: { value: 0 } }; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + (glide || dur)); o.detune.value = detune; env(g, t, a, peak, dur); o.connect(g); route(g, bus, wet, pan); o.start(t); o.stop(t + a + dur + 0.05); return o; }
  function nz(t, dur, peak, { type = 'bandpass', f = 1000, to, q = 1, a = 0.003, bus = sfxBus, wet = 0.15, pan = 0 } = {}) { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; fl.type = type; fl.frequency.setValueAtTime(f, t); if (to) fl.frequency.exponentialRampToValueAtTime(Math.max(30, to), t + dur); fl.Q.value = q; env(g, t, a, peak, dur); s.connect(fl); fl.connect(g); route(g, bus, wet, pan); s.start(t, Math.random()); s.stop(t + a + dur + 0.05); }
  function route(node, bus, wet, pan) { let n = node; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; n.connect(p); n = p; } n.connect(bus); if (wet > 0) { const w = ctx.createGain(); w.gain.value = wet; n.connect(w); w.connect(verb); } }
  // marimba-ish voice: sine + 4x partial with a quick decay (used for every UI blip and the 'bell' family)
  function mar(f, t, dur, v, bus = sfxBus, wet = 0.2, pan = 0) { osc('sine', f, t, dur, v, { bus, wet, pan }); osc('sine', f * 4.01, t, dur * 0.18, v * 0.22, { bus, wet, pan }); osc('triangle', f * 2, t, dur * 0.4, v * 0.12, { bus, wet: 0, pan }); }
  function bell(f, t, dur, v) { [[1, 1], [2.76, 0.42], [5.4, 0.2], [8.93, 0.08]].forEach(([r, a]) => osc('sine', f * r, t, dur / Math.sqrt(r), v * a, { wet: 0.35 })); }
  function chord(ms, t, gap, dur, v) { ms.forEach((m, i) => mar(mtof(m), t + i * gap, dur, v)); }
  // ---- the sound list ----
  const SFX = {
    ui: t => mar(1046, t, 0.08, 0.05),
    cone: t => { osc('sine', 520, t, 0.05, 0.14, { to: 300 }); nz(t, 0.03, 0.08, { f: 2600, q: 2 }); nz(t + 0.03, 0.06, 0.05, { f: 1400, q: 1.5 }); },                      // waffle cone out of the stack
    cup: t => { for (let i = 0; i < 3; i++) nz(t + i * 0.025, 0.035, 0.07, { type: 'highpass', f: R(2500, 4500) }); osc('sine', 340, t, 0.06, 0.06, { to: 250 }); },     // paper cup
    bin: t => { osc('sine', 130, t, 0.22, 0.32, { to: 55 }); nz(t, 0.18, 0.18, { type: 'lowpass', f: 900, to: 200 }); nz(t + 0.05, 0.1, 0.06, { f: 3000, q: 3 }); },
    pop: t => { osc('sine', 260, t, 0.09, 0.2, { to: 720 }); nz(t, 0.12, 0.12, { type: 'lowpass', f: 2400, to: 500 }); },                                            // the ball lifts out of the tub
    fly: t => nz(t, 0.28, 0.07, { f: 500, to: 2600, q: 1.6, wet: 0.25 }),
    plop: (t, o = {}) => { const s = o.size || 1; osc('sine', 210 / s, t, 0.14, 0.34, { to: 85 / s }); nz(t, 0.09, 0.2, { type: 'lowpass', f: 1500, to: 300 }); nz(t + 0.01, 0.04, 0.06, { f: 3800, q: 2 }); },
    splat: t => { nz(t, 0.24, 0.32, { type: 'lowpass', f: 1300, to: 180 }); osc('sine', 120, t, 0.16, 0.24, { to: 50 }); for (let i = 0; i < 4; i++) nz(t + 0.04 + i * 0.03, 0.04, 0.05, { f: R(1500, 3500), q: 3 }); },
    slide: t => { nz(t, 0.35, 0.12, { f: 2400, to: 400, q: 2 }); SFX.splat(t + 0.32); },
    topple: t => { [0, 0.09, 0.18].forEach((d, i) => osc('triangle', 520 - i * 120, t + d, 0.12, 0.12, { to: 380 - i * 110, wet: 0.2 })); nz(t + 0.2, 0.4, 0.14, { f: 1800, to: 300, q: 1.2 }); [0.45, 0.58, 0.7].forEach(d => SFX.splat(t + d)); },
    lean: t => { osc('sine', 440, t, 0.25, 0.08, { to: 330, wet: 0.2 }); osc('sine', 448, t, 0.25, 0.06, { to: 336 }); },
    drop: t => osc('sine', R(1100, 1700), t, 0.03, 0.035, { to: R(600, 900), wet: 0.1 }),                                                                         // a sauce blob lands
    rattle: t => { for (let i = 0; i < 7; i++) nz(t + i * R(0.006, 0.014), 0.018, R(0.04, 0.08), { type: 'highpass', f: R(4500, 8000), pan: R(-0.3, 0.3) }); },  // sprinkles in the shaker
    crunch: t => { for (let i = 0; i < 5; i++) nz(t + i * 0.022, 0.03, 0.12, { f: R(1800, 4200), q: 2.5 }); osc('sine', 900, t, 0.04, 0.05, { to: 500 }); },
    bell: t => { bell(1318.5, t, 1.4, 0.09); bell(1568, t + 0.16, 1.6, 0.08); },                                                                                 // the door bell: a customer comes in
    order: t => { mar(784, t, 0.12, 0.07); mar(988, t + 0.08, 0.16, 0.07); },
    serve: t => chord([72, 76, 79, 84], t, 0.07, 0.35, 0.09),
    thrilled: t => { chord([72, 76, 79, 84, 88], t, 0.06, 0.5, 0.1); for (let i = 0; i < 10; i++) osc('sine', R(2600, 4800), t + 0.3 + i * 0.045, 0.12, 0.03, { wet: 0.5, pan: R(-0.8, 0.8) }); },
    happy: t => chord([76, 79, 84], t, 0.08, 0.35, 0.09),
    neutral: t => chord([72, 74], t, 0.12, 0.3, 0.07),
    unhappy: t => { mar(523, t, 0.3, 0.08); mar(415, t + 0.16, 0.45, 0.08); },
    insulted: t => { const o = osc('square', 150, t, 0.5, 0.07, { to: 110, wet: 0.1 }); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 9; lg.gain.value = 12; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 0.6); osc('sawtooth', 152, t, 0.45, 0.04, { to: 112 }); },
    coin: (t, o = {}) => { const f = 2200 + (o.v || 1) * 70; osc('sine', f, t, 0.35, 0.1, { wet: 0.3 }); osc('sine', f * 1.414, t, 0.2, 0.06, { wet: 0.3 }); osc('sine', f * 2.73, t, 0.08, 0.04); nz(t, 0.015, 0.06, { type: 'highpass', f: 6000 }); },
    till: t => { nz(t, 0.12, 0.16, { f: 1800, q: 1.2 }); osc('sine', 240, t, 0.08, 0.14, { to: 120 }); bell(2637, t + 0.1, 0.7, 0.06); bell(3136, t + 0.16, 0.8, 0.05); },        // register drawer + ching
    wrong: t => { osc('square', 220, t, 0.14, 0.05, { to: 180, wet: 0.05 }); osc('square', 165, t + 0.14, 0.22, 0.05, { to: 140, wet: 0.05 }); },
    tick: (t, o = {}) => { const hi = o.hi; osc('sine', hi ? 1760 : 1175, t, 0.05, 0.1, { wet: 0.1 }); nz(t, 0.02, 0.06, { f: hi ? 3000 : 2200, q: 4 }); },
    fanfare: t => { [[67, 0], [72, 0.14], [76, 0.28], [79, 0.42], [84, 0.62]].forEach(([m, d]) => mar(mtof(m), t + d, d > 0.5 ? 0.9 : 0.25, 0.1)); chord([60, 64, 67], t + 0.62, 0, 1.0, 0.05); },
    buy: t => { chord([84, 88, 91], t, 0.05, 0.25, 0.07); SFX.coin(t + 0.12, { v: 5 }); },
    combo: t => { for (let i = 0; i < 6; i++) mar(mtof(84 + [0, 4, 7, 12, 16, 19][i]), t + i * 0.04, 0.2, 0.05); },
    drip: t => { osc('sine', 1600, t, 0.06, 0.05, { to: 600, wet: 0.35 }); },
    step: (t, o = {}) => { nz(t, 0.05, 0.1, { type: 'lowpass', f: o.alt ? 900 : 700 }); nz(t, 0.012, 0.04, { f: o.alt ? 2600 : 2200, q: 3 }); },
    wave: t => { osc('sine', 880, t, 0.16, 0.08, { to: 1320, wet: 0.25 }); osc('sine', 1320, t + 0.16, 0.18, 0.07, { to: 990, wet: 0.25 }); },
    taste: t => { nz(t, 0.18, 0.08, { f: 900, to: 2400, q: 3 }); const o = osc('sine', 220, t + 0.15, 0.55, 0.09, { a: 0.05, to: 196 }); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 6; lg.gain.value = 6; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 0.8); },
    hop: t => { osc('sine', 300, t, 0.08, 0.12, { to: 620, glide: 0.08 }); osc('sine', 620, t + 0.08, 0.18, 0.09, { to: 330 }); },
    talk: t => mar(659, t, 0.07, 0.04),
    wafer: t => SFX.crunch(t),
    flip: t => nz(t, 0.12, 0.05, { f: 1200, to: 3000, q: 2 }),
    freeze: t => { for (let i = 0; i < 3; i++) osc('sine', R(3000, 5000), t + i * 0.05, 0.25, 0.025, { wet: 0.6 }); },
  };
  let lastT = {};
  function sfx(name, o = {}) { if (!live(true) || !SFX[name]) return; if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } const now = ctx.currentTime; if (o.gap && lastT[name] && now - lastT[name] < o.gap) return; lastT[name] = now; try { SFX[name](now + (o.delay || 0), o); } catch (e) {} }
  // ---- continuous loops ----
  const loops = {};
  function loop(key, build) { if (!loops[key]) { const L = build(); loops[key] = L; } return loops[key]; }
  function scrape(on, speed = 0) { if (!live()) { if (loops.scrape) { loops.scrape.g.gain.value = 0; } return; } const L = loop('scrape', () => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.4; bp.frequency.value = 900; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000; const am = ctx.createGain(); am.gain.value = 0.6; const lfo = ctx.createOscillator(); lfo.frequency.value = 26; const lg = ctx.createGain(); lg.gain.value = 0.4; lfo.connect(lg); lg.connect(am.gain); const g = ctx.createGain(); g.gain.value = 0; s.connect(bp); bp.connect(lp); lp.connect(am); am.connect(g); route(g, sfxBus, 0.08, 0); s.start(); lfo.start(); return { g, bp, lfo }; });
    const t = ctx.currentTime, v = on ? Math.min(1, speed) : 0; L.g.gain.setTargetAtTime(v * 0.22, t, on ? 0.03 : 0.06); L.bp.frequency.setTargetAtTime(700 + v * 1700, t, 0.05); L.lfo.frequency.setTargetAtTime(18 + v * 30, t, 0.05); }
  function pour(on, wet = 0.5) { if (!live()) { if (loops.pour) loops.pour.g.gain.value = 0; return; } const L = loop('pour', () => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5; bp.frequency.value = 600; const lfo = ctx.createOscillator(); lfo.frequency.value = 7; const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency); const g = ctx.createGain(); g.gain.value = 0; s.connect(bp); bp.connect(g); route(g, sfxBus, 0.12, 0); s.start(); lfo.start(); return { g, bp, lfo }; });
    const t = ctx.currentTime; L.g.gain.setTargetAtTime(on ? 0.12 + wet * 0.12 : 0, t, on ? 0.03 : 0.05); L.lfo.frequency.setTargetAtTime(5 + wet * 6, t, 0.1); }
  // ---- MUSIC: an Italian café band (oom-pah bass, accordion, mandolin), F major, 16-bar song with A and B halves ----
  const SONG = (() => { const A = [[[0, 69, .5], [.5, 72, .5], [1, 77, 1], [2, 76, .5], [2.5, 74, .5], [3, 72, 1]], [[0, 74, 1.5], [1.5, 72, .5], [2, 69, 1], [3, 65, 1]], [[0, 70, .5], [.5, 74, .5], [1, 77, 1], [2, 77, .5], [2.5, 76, .5], [3, 74, 1]], [[0, 72, 2], [2, 70, .5], [2.5, 69, .5], [3, 67, 1]],
      [[0, 69, .5], [.5, 72, .5], [1, 77, 1], [2, 79, .5], [2.5, 77, .5], [3, 76, 1]], [[0, 74, 1], [1, 77, 1], [2, 81, 1.5], [3.5, 79, .5]], [[0, 77, 1], [1, 74, 1], [2, 72, 1], [3, 76, 1]], [[0, 77, 3], [3, 72, 1]]];
    const Bm = [[[0, 74, 1], [1, 77, .5], [1.5, 74, .5], [2, 70, 2]], [[0, 72, 1], [1, 77, .5], [1.5, 72, .5], [2, 69, 2]], [[0, 70, .5], [.5, 74, .5], [1, 79, 1], [2, 77, .5], [2.5, 74, .5], [3, 70, 1]], [[0, 72, 1], [1, 76, 1], [2, 79, 1], [3, 82, 1]],
      [[0, 81, 1.5], [1.5, 79, .5], [2, 76, 1], [3, 72, 1]], [[0, 77, 1.5], [1.5, 76, .5], [2, 74, 1], [3, 69, 1]], [[0, 70, 1], [1, 74, 1], [2, 72, 1], [3, 67, 1]], [[0, 65, 1], [1, 69, 1], [2, 72, 1], [3, 77, 1]]];
    const ch = { F: [[53, 57, 60], 41, 48], Dm: [[53, 57, 62], 38, 45], Bb: [[53, 58, 62], 46, 41], C7: [[52, 55, 58, 60], 36, 43], Gm: [[55, 58, 62], 43, 38], Gm7: [[53, 55, 58, 62], 43, 38], Am: [[52, 57, 60], 45, 40] };
    const prog = ['F', 'Dm', 'Bb', 'C7', 'F', 'Dm', ['Gm7', 'C7'], 'F', 'Bb', 'F', 'Gm', 'C7', 'Am', 'Dm', ['Gm', 'C7'], 'F'];
    return { mel: [...A, ...Bm], ch, prog }; })();
  const M = { mode: null, beat: 0, at: 0, bar: 0, gain: null, bpm: 100, fade: 1 };
  function accordion(midis, t, dur, v) { const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; lp.Q.value = 0.7; const trem = ctx.createOscillator(), tg = ctx.createGain(); trem.frequency.value = 5.2; tg.gain.value = v * 0.18; trem.connect(tg); tg.connect(g.gain);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.04); g.gain.setValueAtTime(v, t + dur - 0.06); g.gain.linearRampToValueAtTime(0.0001, t + dur); lp.connect(g); route(g, M.gain, 0.25, -0.15);
    midis.forEach(m => [-7, 7].forEach(dt => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur + 0.05); })); trem.start(t); trem.stop(t + dur + 0.05); }
  function mandolin(m, t, dur, v, trem) { const f = mtof(m), n = trem ? Math.max(1, Math.round(dur / 0.09)) : 1; for (let i = 0; i < n; i++) { const tt = t + i * (dur / n), vv = v * (i ? 0.62 : 1); osc('triangle', f, tt, 0.22, vv, { bus: M.gain, wet: 0.3, pan: 0.2 }); osc('sine', f * 2, tt, 0.09, vv * 0.35, { bus: M.gain, wet: 0.2, pan: 0.2 }); nz(tt, 0.01, vv * 0.25, { type: 'highpass', f: 5000, bus: M.gain, wet: 0 }); } }
  function bass(m, t, v) { osc('triangle', mtof(m), t, 0.32, v, { bus: M.gain, wet: 0.08 }); osc('sine', mtof(m) / 2, t, 0.3, v * 0.6, { bus: M.gain, wet: 0 }); }
  function hat(t, v) { nz(t, 0.03, v, { type: 'highpass', f: 7000, bus: M.gain, wet: 0.05, pan: -0.25 }); }
  function clap(t, v) { for (let i = 0; i < 3; i++) nz(t + i * 0.011, 0.05, v * (i === 2 ? 1 : 0.6), { f: 1400, q: 1.2, bus: M.gain, wet: 0.3 }); }
  function scheduleBar(bar, t0, spb, shift, hurry) { const idx = bar % 16, name = SONG.prog[idx], halves = Array.isArray(name) ? name : [name, name];
    for (let b = 0; b < 4; b++) { const C = SONG.ch[halves[b < 2 ? 0 : 1]], t = t0 + b * spb; if (b % 2 === 0) bass(b === 0 ? C[1] : C[2], t, shift ? 0.13 : 0.11); else accordion(C[0], t, spb * (shift ? 0.55 : 0.8), shift ? 0.022 : 0.026);
      if (shift) { hat(t + spb / 2, 0.03); hat(t, b % 2 ? 0.02 : 0.035); if (b % 2) clap(t, 0.05); if (hurry) hat(t + spb * 0.75, 0.02); } else if (b % 2) hat(t + spb * 0.5, 0.012); }
    const mel = SONG.mel[idx]; for (const [b, m, d] of mel) mandolin(m + (bar % 32 >= 16 && shift ? 12 : 0) * 0, t0 + b * spb, d * spb, shift ? 0.05 : 0.045, d >= 1);
    if (!shift && idx === 15) { const t = t0 + 3.5 * spb; mar(mtof(89), t, 0.6, 0.03, M.gain, 0.5); } }
  const music = { tick(mode, o = {}) { if (!ready()) return; const on = mode && !amb.muted && ctx.state === 'running';
      if (!on) { if (M.gain) { const g = M.gain; g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.12); setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 800); M.gain = null; M.mode = null; } return; }
      if (!M.gain || M.mode !== mode) { if (M.gain) { const g = M.gain; g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15); setTimeout(() => { try { g.disconnect(); } catch (e) {} }, 900); } M.gain = ctx.createGain(); M.gain.gain.value = 0.0001; M.gain.gain.setTargetAtTime(1, ctx.currentTime, 0.4); M.gain.connect(musBus); M.mode = mode; M.at = ctx.currentTime + 0.12; M.bar = mode === 'shift' ? 0 : 0; }
      const bpm = mode === 'shift' ? (o.hurry ? 150 : 138) : 104, spb = 60 / bpm; musBus.gain.setTargetAtTime(o.duck ? 0.25 : 0.5, ctx.currentTime, 0.2);
      while (M.at < ctx.currentTime + 0.35) { scheduleBar(M.bar, M.at, spb, mode === 'shift', !!o.hurry); M.at += 4 * spb; M.bar++; } } };
  return { sfx, scrape, pour, music, blip(f, d, v, type) { if (!live()) return; const t = ctx.currentTime; if (type === 'sawtooth' || type === 'square') osc(type, f, t, d, v * 0.6, { wet: 0.08 }); else mar(f, t, Math.max(0.08, d), v * 1.4); }, ready, get ctx() { return ctx; } };
}
