// 8 GATES — SKI WORKS SOUND + MUSIC. Pure Web Audio synthesis: no audio files to host, works offline, in the Design canvas and on phones.
// skiAudio(ambience) → { sfx(name, opts), loop(name, on, level), music(mode), setLevel('all'|'fx'|'off'), level, cue(...) }
//   ambience = the Ambience from village-game.js (owns the AudioContext + master gain; call ambience.init() on the first tap).
// SFX: thud, hiss, pressDown, pressPop, layer, saw, click, dialTick, lock, ok, done, bad, bell, door, kaching, coin, fanfare, star, pop, sip, boing, whistle, step, swish, bump, sparkle, page
// LOOPS (continuous, level 0..1): router, roller, sizzle, glide, fire
// MUSIC moods: 'lodge' (walk / intro / day card: slow, warm), 'work' (a shift: a bit brighter, brushed shaker + soft kick), null = off
// Every sound goes through one bus with a small generated room reverb (log cabin), so it all sits together.
const LKEY = 'ski.audio.level';
export function skiAudio(amb) {
  let ctx = null, out = null, fx = null, mus = null, rev = null, revIn = null, noise = null, pink = null; const loops = {}; let level = 'all';
  try { const v = localStorage.getItem(LKEY); if (v === 'fx' || v === 'off' || v === 'all') level = v; } catch (e) {}
  function setup() { if (ctx || !amb || !amb.ctx) return !!ctx; ctx = amb.ctx;
    out = ctx.createGain(); out.gain.value = 1; out.connect(amb.master);
    fx = ctx.createGain(); fx.connect(out); mus = ctx.createGain(); mus.connect(out);
    // generated room impulse: short wooden room, ~1.4 s tail
    const len = Math.floor(ctx.sampleRate * 1.4), ir = ctx.createBuffer(2, len, ctx.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 600 ? i / 600 : 1); } }
    rev = ctx.createConvolver(); rev.buffer = ir; revIn = ctx.createGain(); revIn.gain.value = 0.32; revIn.connect(rev); const rl = ctx.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 3800; rev.connect(rl); rl.connect(out);
    noise = amb.noise || (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    pink = (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2) * 3; } return b; })();
    applyLevel(); return true; }
  function applyLevel() { if (!ctx) return; const t = ctx.currentTime; fx.gain.setTargetAtTime(level === 'off' ? 0 : 0.9, t, 0.05); mus.gain.setTargetAtTime(level === 'all' ? 0.3 : 0, t, 0.3); if (amb.wind) amb.wind.gain.setTargetAtTime(level === 'off' ? 0 : 0.05, t, 0.3); }
  const ok = () => setup() && level !== 'off' && !amb.muted;
  // ---- building blocks ----
  const env = (g, t, a, peak, d, sus = 0.0001) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(sus, t + a + d); };
  function tone(f, { t = 0, type = 'sine', a = 0.004, d = 0.25, v = 0.2, to = null, wet = 0.15, pan = 0, bus = fx, det = 0, lp = 0 } = {}) { const T = ctx.currentTime + t, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, T); o.detune.value = det; if (to) o.frequency.exponentialRampToValueAtTime(to, T + a + d); let n = o; if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); n = fl; } n.connect(g); env(g, T, a, v, d); const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null; if (p) { p.pan.value = pan; g.connect(p); p.connect(bus); if (wet) { const s = ctx.createGain(); s.gain.value = wet; p.connect(s); s.connect(revIn); } } else { g.connect(bus); } o.start(T); o.stop(T + a + d + 0.05); return o; }
  function nz(f, { t = 0, type = 'bandpass', q = 1, a = 0.003, d = 0.15, v = 0.3, to = null, wet = 0.1, src = 'white', bus = fx, rate = 1 } = {}) { const T = ctx.currentTime + t, s = ctx.createBufferSource(); s.buffer = src === 'pink' ? pink : noise; s.playbackRate.value = rate; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, T); fl.Q.value = q; if (to) fl.frequency.exponentialRampToValueAtTime(to, T + a + d); const g = ctx.createGain(); s.connect(fl); fl.connect(g); g.connect(bus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(revIn); } env(g, T, a, v, d); s.start(T, Math.random() * 1.5); s.stop(T + a + d + 0.05); }
  const knock = (t = 0, f = 160, v = 0.5) => { tone(f, { t, type: 'sine', d: 0.12, v, to: f * 0.45, wet: 0.2 }); nz(f * 6, { t, q: 2, d: 0.04, v: v * 0.5 }); };
  // ---- one-shot effects ----
  const S = {
    thud(o) { knock(0, 120, 0.6); nz(400, { type: 'lowpass', d: 0.2, v: 0.3 }); },
    layer(o = {}) { const k = o.i || 0; knock(0, 220 - k * 18, 0.35); nz(2500, { q: 0.8, d: 0.06, v: 0.12 }); tone(660 + k * 110, { t: 0.02, type: 'triangle', d: 0.18, v: 0.08, wet: 0.3 }); },
    hiss() { nz(5000, { type: 'highpass', a: 0.02, d: 0.7, v: 0.22, to: 2000, src: 'white' }); },
    pressDown() { tone(70, { type: 'sawtooth', a: 0.05, d: 0.5, v: 0.08, lp: 300 }); nz(800, { type: 'lowpass', a: 0.05, d: 0.5, v: 0.12 }); },
    pressPop(o = {}) { knock(0, 90, 0.7); S.hiss(); if (o.good) S.ok({ t: 0.25 }); },
    click(o = {}) { nz(4200, { q: 4, d: 0.02, v: 0.25 * (o.v || 1) }); tone(1800, { type: 'square', d: 0.015, v: 0.03, wet: 0 }); },
    dialTick(o = {}) { const n = o.n || 1; nz(3000 + n * 120, { q: 6, d: 0.018, v: 0.28 }); tone(900 + n * 45, { type: 'triangle', d: 0.03, v: 0.05, wet: 0 }); },
    dialMatch() { tone(1568, { type: 'sine', d: 0.25, v: 0.09, wet: 0.4 }); tone(2093, { t: 0.06, type: 'sine', d: 0.3, v: 0.07, wet: 0.4 }); },
    lock() { knock(0, 300, 0.45); nz(2200, { q: 3, d: 0.05, v: 0.3, t: 0.06 }); knock(0.07, 520, 0.3); S.ok({ t: 0.15 }); },
    ok(o = {}) { const t = o.t || 0; tone(1046.5, { t, type: 'triangle', d: 0.16, v: 0.1, wet: 0.35 }); tone(1568, { t: t + 0.08, type: 'triangle', d: 0.24, v: 0.09, wet: 0.35 }); },
    done() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, { t: i * 0.07, type: 'triangle', d: 0.3, v: 0.08, wet: 0.45 })); nz(9000, { type: 'highpass', t: 0.2, d: 0.4, v: 0.05 }); },
    bad() { tone(196, { type: 'square', d: 0.14, v: 0.06, lp: 900 }); tone(185, { t: 0.12, type: 'square', d: 0.2, v: 0.06, lp: 900 }); },
    page() { nz(3000, { q: 0.7, a: 0.01, d: 0.09, v: 0.12, to: 6000 }); },
    bell() { [1318.5, 1760, 2637].forEach((f, i) => tone(f, { t: i * 0.004, type: 'sine', d: 1.4 - i * 0.3, v: 0.06 / (i + 1) * 2, wet: 0.5 })); tone(1318.5, { t: 0.18, type: 'sine', d: 1.0, v: 0.04, wet: 0.5 }); },
    door() { tone(180, { type: 'sawtooth', a: 0.05, d: 0.35, v: 0.03, to: 140, lp: 700 }); knock(0.38, 110, 0.35); S.bell(); },
    coin(o = {}) { const t = o.t || 0; tone(1975, { t, type: 'square', d: 0.06, v: 0.04, lp: 6000, wet: 0.2 }); tone(2637, { t: t + 0.05, type: 'square', d: 0.18, v: 0.04, lp: 6000, wet: 0.3 }); },
    kaching() { nz(3500, { q: 2, d: 0.08, v: 0.2 }); knock(0.02, 400, 0.25); tone(2093, { t: 0.08, d: 0.6, v: 0.08, wet: 0.5 }); tone(2637, { t: 0.1, d: 0.7, v: 0.07, wet: 0.5 }); for (let i = 0; i < 4; i++) S.coin({ t: 0.2 + i * 0.07 }); },
    fanfare() { const n = [523.25, 659.25, 783.99, 1046.5]; n.forEach((f, i) => { tone(f, { t: i * 0.11, type: 'triangle', d: 0.35, v: 0.1, wet: 0.4 }); tone(f / 2, { t: i * 0.11, type: 'sine', d: 0.3, v: 0.08 }); }); [1046.5, 1318.5, 1568].forEach(f => tone(f, { t: 0.5, type: 'triangle', a: 0.02, d: 1.2, v: 0.07, wet: 0.5 })); },
    star(o = {}) { tone(1568 * Math.pow(1.122, o.i || 0), { t: o.t || 0, type: 'sine', d: 0.4, v: 0.08, wet: 0.5 }); },
    grumpy() { tone(311, { type: 'triangle', d: 0.25, v: 0.08 }); tone(277, { t: 0.2, type: 'triangle', d: 0.4, v: 0.08, to: 233 }); },
    pop() { tone(600, { d: 0.06, v: 0.1, to: 1200, wet: 0.1 }); },
    sip() { nz(1200, { q: 3, a: 0.05, d: 0.25, v: 0.1, to: 2400 }); tone(220, { t: 0.32, d: 0.15, v: 0.08, to: 180 }); S.ok({ t: 0.5 }); },
    boing() { tone(220, { type: 'triangle', d: 0.25, v: 0.12, to: 520, wet: 0.2 }); },
    land() { knock(0, 140, 0.25); },
    whistle() { tone(1400, { type: 'sine', a: 0.03, d: 0.12, v: 0.06, to: 1900, wet: 0.3 }); tone(1900, { t: 0.16, type: 'sine', a: 0.02, d: 0.2, v: 0.06, to: 1500, wet: 0.3 }); },
    step(o = {}) { const k = o.k || 0; nz(k % 2 ? 900 : 700, { type: 'lowpass', q: 1, d: 0.07, v: 0.16, src: 'pink' }); if (Math.random() < 0.08) tone(150 + Math.random() * 60, { t: 0.03, type: 'sawtooth', a: 0.03, d: 0.18, v: 0.015, lp: 500 }); },
    swish() { nz(1800, { q: 1.2, a: 0.05, d: 0.3, v: 0.16, to: 4000 }); },
    bump() { knock(0, 100, 0.5); nz(500, { type: 'lowpass', d: 0.1, v: 0.2 }); },
    sparkle() { for (let i = 0; i < 5; i++) tone(2000 + Math.random() * 2000, { t: i * 0.05, type: 'sine', d: 0.15, v: 0.03, wet: 0.6 }); },
    chip() { nz(2600 + Math.random() * 2000, { q: 5, d: 0.025, v: 0.18 }); },
    paintDab() { nz(900, { type: 'lowpass', d: 0.05, v: 0.08, src: 'pink' }); },
    measure(o = {}) { const p = o.p || 0; tone(440 + p * 880, { type: 'sine', d: 0.05, v: 0.05 + p * 0.04, wet: 0.1 }); },
    talk() { tone(520 + Math.random() * 120, { type: 'triangle', d: 0.05, v: 0.04 }); tone(660 + Math.random() * 120, { t: 0.06, type: 'triangle', d: 0.05, v: 0.035 }); },
  };
  // ---- continuous loops (start on demand, level 0..1 sets the volume/pitch) ----
  const LOOPS = {
    router: () => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 180; const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = 361; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 2; const g = ctx.createGain(); g.gain.value = 0; const og = ctx.createGain(); og.gain.value = 0.4; o.connect(bp); o2.connect(og); og.connect(bp); const ns = ctx.createBufferSource(); ns.buffer = noise; ns.loop = true; const nf = ctx.createBiquadFilter(); nf.type = 'highpass'; nf.frequency.value = 3000; const ng = ctx.createGain(); ng.gain.value = 0.5; ns.connect(nf); nf.connect(ng); ng.connect(g); bp.connect(g); g.connect(fx); [o, o2, ns].forEach(n => n.start()); return { g, set(l) { o.frequency.setTargetAtTime(150 + l * 90, ctx.currentTime, 0.05); o2.frequency.setTargetAtTime(300 + l * 180, ctx.currentTime, 0.05); return 0.08 * l; }, stop() { [o, o2, ns].forEach(n => n.stop()); } }; },
    roller: () => { const ns = ctx.createBufferSource(); ns.buffer = pink; ns.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; const g = ctx.createGain(); g.gain.value = 0; ns.connect(lp); lp.connect(g); g.connect(fx); ns.start(); return { g, set(l) { lp.frequency.setTargetAtTime(500 + l * 900, ctx.currentTime, 0.05); return 0.35 * l; }, stop() { ns.stop(); } }; },
    sizzle: () => { const ns = ctx.createBufferSource(); ns.buffer = noise; ns.loop = true; const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4500; const am = ctx.createGain(); am.gain.value = 0.6; const lfo = ctx.createOscillator(); lfo.frequency.value = 13; const lg = ctx.createGain(); lg.gain.value = 0.4; lfo.connect(lg); lg.connect(am.gain); const g = ctx.createGain(); g.gain.value = 0; ns.connect(hp); hp.connect(am); am.connect(g); g.connect(fx); ns.start(); lfo.start(); return { g, set(l) { return 0.12 * l; }, tick(l) { if (Math.random() < 0.25 * l) nz(5000 + Math.random() * 3000, { q: 8, d: 0.012, v: 0.12 }); }, stop() { ns.stop(); lfo.stop(); } }; },
    glide: () => { const ns = ctx.createBufferSource(); ns.buffer = pink; ns.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.8; const g = ctx.createGain(); g.gain.value = 0; ns.connect(bp); bp.connect(g); g.connect(fx); ns.start(); return { g, set(l) { bp.frequency.setTargetAtTime(600 + l * 2200, ctx.currentTime, 0.08); return 0.3 * l; }, stop() { ns.stop(); } }; },
    fire: () => { const ns = ctx.createBufferSource(); ns.buffer = pink; ns.loop = true; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; const g = ctx.createGain(); g.gain.value = 0; ns.connect(lp); lp.connect(g); g.connect(fx); ns.start(); return { g, set(l) { return 0.12 * l; }, tick(l) { if (Math.random() < 0.18 * l) nz(1500 + Math.random() * 3000, { q: 3, d: 0.02 + Math.random() * 0.03, v: 0.12 * l, wet: 0.2 }); }, stop() { ns.stop(); } }; },
  };
  function loop(name, lvl) { if (!ok()) { if (loops[name]) loops[name].g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); return; } let L = loops[name]; if (!L) { if (lvl <= 0.001) return; L = loops[name] = LOOPS[name](); } const v = L.set(Math.max(0, Math.min(1, lvl))); L.g.gain.setTargetAtTime(lvl > 0.001 ? v : 0, ctx.currentTime, lvl > 0.001 ? 0.04 : 0.12); if (L.tick && lvl > 0.01) L.tick(lvl); }
  // ---- music: generative cozy lodge tune in D major ----
  const M = { mode: null, next: 0, step: 0, bar: 0, timer: 0, last: -1 };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const PROG = { lodge: [[50, [62, 66, 69, 73]], [47, [59, 62, 66, 69]], [43, [59, 62, 66, 71]], [45, [57, 61, 64, 66]]],          // Dmaj7 · Bm7 · Gmaj7 · A6
    work: [[43, [59, 62, 66, 71]], [45, [61, 64, 69, 71]], [42, [57, 61, 64, 69]], [47, [59, 62, 66, 69]], [43, [59, 62, 67, 71]], [45, [57, 61, 64, 69]], [50, [62, 66, 69, 74]], [45, [61, 64, 67, 69]]] };
  const PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83];
  function pad(notes, t, dur) { notes.forEach((m, i) => { for (const det of [-7, 7]) tone(hz(m), { t, type: 'triangle', a: 0.5, d: dur, v: 0.028, det, lp: 1500, wet: 0.35, pan: (i - 1.5) * 0.25, bus: mus }); }); }
  function pluck(m, t, v = 0.11) { tone(hz(m), { t, type: 'triangle', a: 0.005, d: 0.5, v, lp: 900, wet: 0.1, bus: mus }); tone(hz(m), { t, type: 'sine', a: 0.005, d: 0.6, v: v * 0.8, wet: 0.05, bus: mus }); }
  function glock(m, t, v = 0.05) { tone(hz(m), { t, type: 'sine', a: 0.003, d: 1.3, v, wet: 0.55, pan: Math.random() * 0.6 - 0.3, bus: mus }); tone(hz(m) * 2.76, { t, type: 'sine', a: 0.002, d: 0.25, v: v * 0.25, wet: 0.5, bus: mus }); }
  function shaker(t, v) { nz(7500, { t, type: 'highpass', a: 0.008, d: 0.06, v, wet: 0.05, bus: mus }); }
  function kick(t) { tone(120, { t, d: 0.18, v: 0.16, to: 45, wet: 0, bus: mus }); }
  function jingle(t) { for (let i = 0; i < 3; i++) nz(8500, { t: t + i * 0.035, q: 6, d: 0.05, v: 0.05, wet: 0.3, bus: mus }); }
  let mel = 4;
  function schedule() { if (!ctx || !M.mode) return; const bpm = M.mode === 'work' ? 104 : 80, eighth = 60 / bpm / 2, P = PROG[M.mode];
    while (M.next < ctx.currentTime + 0.25) { const t = M.next - ctx.currentTime, s = M.step % 8, [root, ch] = P[M.bar % P.length];
      if (level === 'all' && !amb.muted) {
        if (s === 0) { pad(ch, t, eighth * 8.5); pluck(root, t); }
        if (M.mode === 'lodge') { if (s === 4) pluck(root + 7, t, 0.07); if (s === 6 && M.bar % 2) jingle(t); }
        else { if (s === 3 || s === 4) pluck(s === 3 ? root + 12 : root + 7, t, 0.07); if (s % 4 === 0) kick(t); shaker(t, s % 2 ? 0.035 : 0.06); }
        const prob = M.mode === 'work' ? (s % 2 ? 0.35 : 0.65) : (s % 2 ? 0.15 : 0.5);
        if (Math.random() < prob) { mel = Math.max(0, Math.min(PENTA.length - 1, mel + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)])); let m = PENTA[mel]; if (s === 0) { const tones = ch.map(c => c % 12); while (!tones.includes(m % 12) && mel > 0) m = PENTA[--mel]; } glock(m, t, M.mode === 'work' ? 0.045 : 0.05); }
      }
      M.next += eighth; M.step++; if (M.step % 8 === 0) M.bar++; } }
  function music(mode) { if (!setup()) { M.want = mode; return; } if (mode === M.mode) return; M.mode = mode; if (mode) { M.next = Math.max(M.next, ctx.currentTime + 0.1); if (!M.timer) M.timer = setInterval(schedule, 60); } }
  return {
    get level() { return level; },
    init() { if (setup() && M.want !== undefined) { const w = M.want; M.want = undefined; music(w); } },
    sfx(name, o) { if (!ok() || !S[name]) return; try { S[name](o); } catch (e) {} },
    loop(name, lvl) { try { loop(name, lvl); } catch (e) {} },
    music,
    setLevel(l) { level = l; try { localStorage.setItem(LKEY, l); } catch (e) {} applyLevel(); if (l === 'off') Object.keys(loops).forEach(k => loops[k].g.gain.setTargetAtTime(0, ctx ? ctx.currentTime : 0, 0.05)); },
    cycle() { const n = level === 'all' ? 'fx' : level === 'fx' ? 'off' : 'all'; this.setLevel(n); return n; },
    destroy() { clearInterval(M.timer); Object.values(loops).forEach(L => { try { L.stop(); } catch (e) {} }); }
  };
}
