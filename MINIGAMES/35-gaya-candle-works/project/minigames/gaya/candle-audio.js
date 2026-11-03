// 8 GATES — GAYA · CANDLE WORKS AUDIO. Procedural sound effects + music (no files to load, phone-light).
// createCandleAudio(audio) takes the restaurant-kit Ambience (ST.audio) and returns { sfx, music, init, update, setMuted, muted }.
//   sfx.*   : dipIn, dipOut, layer(n), perfect, bad, melt, pour.start/set(fill)/stop, set(kind), unmould, spill, snip, stamp, pack,
//             sparkle, order, served(stars), walkout, light, snuff, step, jump, click, tick, endShift, upgrade, select
//   music   : setMode('calm' | 'work' | 'rush' | 'off'). Calm = temple pad + harp in D dorian; work = + marimba ostinato + shaker;
//             rush (last 30 s) = faster, extra high line. Everything runs through a small generated hall reverb.
const MUTE_KEY = '8gates.candles.muted';
export function createCandleAudio(audio) {
  const A = { ctx: null, ready: false, muted: false, mode: 'off', nextT: 0, step: 0, bar: 0, pour: null };
  try { A.muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) {}
  function init() {
    try { audio.init && audio.init(); } catch (e) {}
    if (A.ready || !audio.ctx) return; const ctx = A.ctx = audio.ctx; A.ready = true;
    try { if (audio.wind) audio.wind.gain.value = 0.015; } catch (e) {}
    A.out = ctx.createGain(); A.out.gain.value = A.muted ? 0 : 1; A.out.connect(audio.master || ctx.destination);
    A.sfxBus = ctx.createGain(); A.sfxBus.gain.value = 0.9; A.sfxBus.connect(A.out);
    A.musBus = ctx.createGain(); A.musBus.gain.value = 0.0; A.musBus.connect(A.out);
    // hall reverb from a generated impulse (stone temple, ~2.4 s)
    const len = Math.floor(ctx.sampleRate * 2.4), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 600 ? i / 600 : 1); } }
    A.verb = ctx.createConvolver(); A.verb.buffer = ir; A.verbIn = ctx.createGain(); A.verbIn.gain.value = 0.32; const vlp = ctx.createBiquadFilter(); vlp.type = 'lowpass'; vlp.frequency.value = 4200; A.verbIn.connect(vlp); vlp.connect(A.verb); A.verb.connect(A.out);
    A.noise = audio.noise || (() => { const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    A.nextT = ctx.currentTime + 0.1;
  }
  const now = () => A.ctx ? A.ctx.currentTime : 0;
  function dest(bus, send) { const g = A.ctx.createGain(); g.connect(bus); if (send) { const s = A.ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(A.verbIn); } return g; }
  function panNode(p) { if (!p || !A.ctx.createStereoPanner) return null; const n = A.ctx.createStereoPanner(); n.pan.value = p; return n; }
  // a shaped oscillator note
  function osc({ f, f2 = 0, type = 'sine', vol = 0.1, a = 0.005, d = 0.3, t = 0, send = 0.2, bus, pan = 0, detune = 0 }) {
    if (!A.ready || A.muted) return; const ctx = A.ctx, t0 = now() + t, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); o.detune.value = detune; if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    const p = panNode(pan), out = dest(bus || A.sfxBus, send); o.connect(g); if (p) { g.connect(p); p.connect(out); } else g.connect(out); o.start(t0); o.stop(t0 + a + d + 0.05); }
  // a filtered noise shot
  function noise({ type = 'bandpass', f = 1000, f2 = 0, q = 1, vol = 0.1, a = 0.003, d = 0.15, t = 0, send = 0.15, bus, pan = 0 }) {
    if (!A.ready || A.muted) return; const ctx = A.ctx, t0 = now() + t, s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = A.noise; b.type = type; b.frequency.setValueAtTime(f, t0); b.Q.value = q; if (f2) b.frequency.exponentialRampToValueAtTime(f2, t0 + a + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    const p = panNode(pan), out = dest(bus || A.sfxBus, send); s.connect(b); b.connect(g); if (p) { g.connect(p); p.connect(out); } else g.connect(out); s.start(t0, Math.random() * 0.5); s.stop(t0 + a + d + 0.05); }
  // a bell: inharmonic partials, long ring into the hall
  function bell(f, vol = 0.08, d = 1.6, t = 0, send = 0.5, bus) { [[1, 1], [2.0, 0.5], [2.76, 0.35], [5.4, 0.18], [8.93, 0.08]].forEach(([m, v], i) => osc({ f: f * m, vol: vol * v, a: 0.004, d: d / (1 + i * 0.6), t, send, bus, type: 'sine' })); }
  // a plucked harp / marimba voice
  function pluck(f, vol = 0.06, t = 0, d = 0.9, bus, send = 0.35, wood = false) { osc({ f, vol, a: 0.004, d, t, bus, send, type: 'sine' }); osc({ f: f * (wood ? 4 : 2), vol: vol * (wood ? 0.25 : 0.3), a: 0.002, d: d * (wood ? 0.15 : 0.35), t, bus, send, type: wood ? 'sine' : 'triangle' }); }
  const PENTA = [587.3, 659.3, 784, 880, 987.8, 1174.7, 1318.5, 1568, 1760];
  const vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const sfx = {
    click() { osc({ f: 1800, vol: 0.03, d: 0.03, send: 0 }); noise({ f: 3000, vol: 0.03, d: 0.02, send: 0 }); },
    select() { pluck(880, 0.05, 0, 0.25, null, 0.15, true); },
    dipIn() { osc({ f: 220, f2: 90, vol: 0.14, d: 0.22, send: 0.25 }); noise({ type: 'lowpass', f: 900, f2: 300, vol: 0.08, d: 0.25 }); },
    dipOut() { noise({ type: 'highpass', f: 2500, vol: 0.05, a: 0.02, d: 0.35, send: 0.1 }); for (let i = 0; i < 3; i++) osc({ f: 1400 - i * 180, f2: 700, vol: 0.035, d: 0.07, t: 0.12 + i * 0.13 + Math.random() * 0.05, send: 0.4, pan: (Math.random() - 0.5) * 0.6 }); },
    layer(n) { pluck(PENTA[Math.min(PENTA.length - 1, n)], 0.07, 0.02, 0.7, null, 0.35, true); vib(8); },
    perfect() { bell(1174.7, 0.07, 1.8); bell(1760, 0.05, 1.6, 0.09); osc({ f: 2349, vol: 0.03, d: 0.6, t: 0.18, send: 0.6 }); },
    bad() { osc({ f: 180, f2: 90, type: 'triangle', vol: 0.12, d: 0.35, send: 0.1 }); noise({ type: 'lowpass', f: 500, vol: 0.08, d: 0.2 }); vib([20, 30, 20]); },
    melt() { noise({ type: 'highpass', f: 1800, f2: 4000, vol: 0.06, a: 0.05, d: 0.7, send: 0.1 }); osc({ f: 300, f2: 150, type: 'triangle', vol: 0.06, d: 0.5 }); },
    pour: {
      start() { if (!A.ready || A.muted || A.pour) return; const ctx = A.ctx, s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), b2 = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        s.buffer = A.noise; s.loop = true; b.type = 'bandpass'; b.frequency.value = 500; b.Q.value = 3; b2.type = 'lowpass'; b2.frequency.value = 2400; lfo.frequency.value = 7; lg.gain.value = 120; lfo.connect(lg); lg.connect(b.frequency);
        g.gain.setValueAtTime(0.0001, now()); g.gain.exponentialRampToValueAtTime(0.16, now() + 0.08); s.connect(b); b.connect(b2); b2.connect(g); g.connect(dest(A.sfxBus, 0.15)); s.start(); lfo.start(); A.pour = { s, b, g, lfo }; },
      set(fill) { if (!A.pour) return; A.pour.b.frequency.setTargetAtTime(420 + fill * 1300, now(), 0.05); },
      stop() { if (!A.pour) return; const P = A.pour; A.pour = null; P.g.gain.setTargetAtTime(0.0001, now(), 0.05); setTimeout(() => { try { P.s.stop(); P.lfo.stop(); } catch (e) {} }, 300); } },
    set(kind) { if (kind === 'jar') { bell(2637, 0.03, 0.5, 0, 0.3); } else { pluck(392, 0.06, 0, 0.3, null, 0.2, true); } },
    unmould() { osc({ f: 260, f2: 900, vol: 0.09, d: 0.12, send: 0.2 }); noise({ f: 1200, q: 2, vol: 0.06, d: 0.08 }); vib(10); },
    spill() { noise({ type: 'lowpass', f: 1400, f2: 300, vol: 0.15, a: 0.01, d: 0.6, send: 0.2 }); osc({ f: 160, f2: 70, type: 'triangle', vol: 0.08, d: 0.5 }); vib([30, 40, 30]); },
    snip() { noise({ type: 'highpass', f: 4000, vol: 0.09, d: 0.025, send: 0.05 }); noise({ type: 'highpass', f: 5200, vol: 0.07, d: 0.02, t: 0.045, send: 0.05 }); osc({ f: 3600, vol: 0.02, d: 0.06, t: 0.04, send: 0.3 }); vib(6); },
    stamp() { osc({ f: 120, f2: 60, vol: 0.2, d: 0.18, send: 0.2 }); noise({ f: 420, q: 1.5, vol: 0.12, d: 0.08 }); bell(1568, 0.025, 0.8, 0.08, 0.5); vib(15); },
    pack() { noise({ f: 260, q: 4, vol: 0.14, d: 0.09, send: 0.2 }); noise({ f: 340, q: 4, vol: 0.1, d: 0.07, t: 0.07, send: 0.2 }); noise({ type: 'highpass', f: 3000, vol: 0.04, a: 0.02, d: 0.2, t: 0.03 }); vib(10); },
    sparkle() { for (let i = 0; i < 5; i++) osc({ f: 2000 + Math.random() * 2400, vol: 0.022, d: 0.25, t: i * 0.05, send: 0.6, pan: (Math.random() - 0.5) * 0.8 }); },
    order() { bell(1318.5, 0.05, 1.4, 0, 0.6); bell(1760, 0.04, 1.2, 0.16, 0.6); },
    served(stars) { const n = [587.3, 740, 880, 1174.7]; for (let i = 0; i < 1 + stars; i++) pluck(n[i], 0.06, i * 0.09, 0.9); if (stars === 3) { bell(2349, 0.04, 1.6, 0.36, 0.6); } for (let i = 0; i < 6; i++) osc({ f: 2600 + Math.random() * 1600, vol: 0.02, d: 0.09, t: 0.3 + i * 0.045, send: 0.2 }); },
    walkout() { [440, 392, 349.2, 293.7].forEach((f, i) => pluck(f, 0.05, i * 0.13, 0.6)); },
    light() { noise({ type: 'lowpass', f: 300, f2: 2200, vol: 0.07, a: 0.04, d: 0.25, send: 0.2 }); bell(1760, 0.025, 0.9, 0.12, 0.6); },
    snuff() { noise({ type: 'lowpass', f: 1600, f2: 200, vol: 0.08, a: 0.01, d: 0.22, send: 0.2 }); },
    step(side) { noise({ type: 'lowpass', f: 520 + Math.random() * 200, vol: 0.05, d: 0.06, send: 0.25, pan: side ? 0.15 : -0.15 }); },
    jump() { noise({ type: 'bandpass', f: 600, f2: 1400, q: 1.2, vol: 0.05, a: 0.02, d: 0.18, send: 0.1 }); },
    tick(hi) { pluck(hi ? 1760 : 1318.5, 0.03, 0, 0.12, null, 0.1, true); },
    endShift() { bell(293.7, 0.12, 3.2, 0, 0.7); bell(440, 0.07, 2.6, 0.05, 0.7); bell(587.3, 0.05, 2.4, 0.1, 0.7); },
    upgrade() { [880, 1108.7, 1318.5, 1760].forEach((f, i) => pluck(f, 0.05, i * 0.07, 0.6)); sfx.sparkle(); },
  };
  // ---------- music ----------
  // D dorian progression: Dm9 · G6 · Fmaj7 · Em7 (bass, chord tones)
  const CH = [[73.4, [293.7, 349.2, 440, 523.3, 659.3]], [98, [293.7, 392, 493.9, 587.3, 659.3]], [87.3, [349.2, 440, 523.3, 659.3, 698.5]], [82.4, [293.7, 392, 493.9, 587.3, 740]]];
  function pad(freqs, t, dur) { if (!A.ready) return; const ctx = A.ctx, lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 1.2); g.gain.setValueAtTime(0.05, t + dur - 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.4);
    lp.connect(g); g.connect(dest(A.musBus, 0.6)); freqs.forEach((f, i) => [-6, 6].forEach(dt => { const o = ctx.createOscillator(); o.type = i ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = dt; const og = ctx.createGain(); og.gain.value = 0.32; o.connect(og); og.connect(lp); o.start(t); o.stop(t + dur + 1.6); })); }
  function noteAt(fn, t) { const d = t - now(); fn(Math.max(0, d)); }
  function schedule() { if (!A.ready || A.mode === 'off') return; const ctx = A.ctx, bpm = A.mode === 'calm' ? 64 : A.mode === 'rush' ? 112 : 96, s8 = 60 / bpm / 2;
    while (A.nextT < ctx.currentTime + 0.25) { const t = A.nextT, st = A.step % 16, ch = CH[A.bar % 4];
      if (st === 0) { pad(ch[1].slice(0, 4), t, s8 * 16); noteAt(d => osc({ f: ch[0], vol: 0.07, a: 0.08, d: s8 * 14, t: d, bus: A.musBus, send: 0.3, type: 'sine' }), t); }
      if (A.mode === 'calm') { if (st % 4 === 2 && Math.random() < 0.75) { const f = ch[1][Math.floor(Math.random() * ch[1].length)] * (Math.random() < 0.4 ? 2 : 1); noteAt(d => pluck(f, 0.035, d, 1.4, A.musBus, 0.6), t); } if (st === 8 && A.bar % 2) noteAt(d => bell(ch[1][2] * 2, 0.018, 2.2, d, 0.8, A.musBus), t); }
      else { const pat = [0, 2, 1, 3, 2, 4, 3, 1]; if (st % 2 === 0) { const f = ch[1][pat[(st / 2) % 8] % ch[1].length]; noteAt(d => pluck(f, 0.04, d, 0.35, A.musBus, 0.25, true), t); }
        if (st % 4 === 2) noteAt(d => noise({ type: 'highpass', f: 6000, vol: 0.02, d: 0.05, t: d, bus: A.musBus, send: 0.1 }), t);
        if (st % 8 === 0) noteAt(d => osc({ f: ch[0] * 2, vol: 0.06, a: 0.005, d: 0.25, t: d, bus: A.musBus, send: 0.1, type: 'triangle' }), t);
        if (A.mode === 'rush' && st % 2 === 1) { const f = ch[1][(st + A.bar) % ch[1].length] * 2; noteAt(d => pluck(f, 0.025, d, 0.2, A.musBus, 0.2), t); } }
      A.nextT += s8; A.step++; if (A.step % 16 === 0) A.bar++; } }
  const music = { setMode(m) { if (m === A.mode) return; A.mode = m; if (!A.ready) return; const v = m === 'off' ? 0.0001 : m === 'calm' ? 0.8 : 0.7; A.musBus.gain.setTargetAtTime(v, now(), 0.6); if (m !== 'off' && A.nextT < now()) { A.nextT = now() + 0.05; A.step = 0; } }, get mode() { return A.mode; } };
  return { sfx, music, init, update() { if (A.ready && !A.muted) schedule(); },
    setMuted(m) { A.muted = !!m; try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch (e) {} if (A.ready) A.out.gain.setTargetAtTime(m ? 0 : 1, now(), 0.08); if (m) sfx.pour.stop(); else A.nextT = now() + 0.05; },
    get muted() { return A.muted; }, suspend(v) { try { if (A.ctx) v ? A.ctx.suspend() : A.ctx.resume(); } catch (e) {} } };
}
