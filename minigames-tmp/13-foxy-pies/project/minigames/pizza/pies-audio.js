// 8 GATES — FOXY PIES SOUND: every sound effect, the oven loop, the room ambience and the pizza-parlour music, all synthesised
// (no audio files to ship, works offline and inside any world). Built on the Ambience context from village-game.js.
//   const SND = createPiesAudio(audio);   SND.sfx('toss')   SND.oven(true)   SND.music(true)   SND.update(dt) once a frame
// Music: the 2D Foxy Pies loop (oom-pah bass, mandolin, the eight-bar tune) re-arranged for accordion, mandolin tremolo,
// upright bass, tambourine and shaker, in an A A B A form (B goes up a fourth), with a shop-bell intro and a day-end fanfare.
export function createPiesAudio(amb) {
  let ctx = null, out, sfxBus, musBus, musFilter, verbIn, brown, noise, mOn = false, mAt = 0, mBar = 0, duck = 1, duckT = 1, crackT = 0, ovenNode = null, ovenLevel = 0, ambNode = null, clinkT = 4, last = {};
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  function ready() {
    if (!amb || !amb.ctx) return false; if (ctx === amb.ctx) return ctx.state !== 'closed';
    ctx = amb.ctx; out = amb.master || ctx.destination; noise = amb.noise;
    { const len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); let l = 0; for (let i = 0; i < len; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.5; } brown = b; }
    if (!noise) { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; noise = b; }
    // a small warm room: generated impulse response, a little on everything
    const ir = ctx.createBuffer(2, ctx.sampleRate * 0.9, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6); }
    const verb = ctx.createConvolver(); verb.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.22; verb.connect(wet); wet.connect(out); verbIn = verb;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(out);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.85; sfxBus.connect(comp); const sv = ctx.createGain(); sv.gain.value = 0.5; sfxBus.connect(sv); sv.connect(verb);
    musFilter = ctx.createBiquadFilter(); musFilter.type = 'lowpass'; musFilter.frequency.value = 12000; musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(musFilter); musFilter.connect(comp); const mv = ctx.createGain(); mv.gain.value = 0.35; musFilter.connect(mv); mv.connect(verb);
    return true; }
  // ---- building blocks ----
  function env(g, at, a, peak, d) { g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + a); g.gain.exponentialRampToValueAtTime(0.0001, at + a + d); }
  function osc(type, f0, f1, at, a, peak, d, dest = sfxBus, detune = 0) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.detune.value = detune; o.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, at + a + d); env(g, at, a, peak, d); o.connect(g); g.connect(dest); o.start(at); o.stop(at + a + d + 0.05); return o; }
  function nz(type, f0, f1, q, at, a, peak, d, dest = sfxBus, buf = noise) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = buf; s.loop = true; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, at); if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), at + a + d); env(g, at, a, peak, d); s.connect(f); f.connect(g); g.connect(dest); s.start(at, Math.random() * 1.5); s.stop(at + a + d + 0.05); }
  function bell(f, at, peak = 0.08, d = 1.1, dest = sfxBus) { [[1, 1], [2.0, 0.45], [2.76, 0.3], [4.07, 0.14], [5.4, 0.07]].forEach(([m, v]) => osc('sine', f * m, 0, at, 0.003, peak * v, d / Math.sqrt(m), dest)); }
  // ---- the sound effects ----
  const FX = {
    ui: (t) => { osc('triangle', 880, 1100, t, 0.004, 0.05, 0.06); },
    toss: (t) => { nz('bandpass', 280, 2200, 1.2, t, 0.05, 0.22, 0.32); osc('sine', 160, 320, t, 0.01, 0.06, 0.18); },
    catch: (t) => { osc('sine', 150, 55, t, 0.004, 0.32, 0.16); nz('lowpass', 1400, 300, 0.7, t, 0.004, 0.16, 0.12); nz('highpass', 3000, 3000, 0.5, t + 0.02, 0.01, 0.04, 0.2); },
    perfect: (t) => { [1568, 2093, 2637, 3136].forEach((f, i) => osc('triangle', f, 0, t + i * 0.045, 0.004, 0.05, 0.22)); },
    wide: (t) => { osc('sawtooth', 220, 150, t, 0.01, 0.04, 0.22, sfxBus); },
    sauce: (t, o = {}) => { nz('lowpass', 1100, 180, 1.6, t, 0.006, 0.34, 0.2); osc('sine', 260 + Math.random() * 120, 80, t, 0.008, 0.14, 0.15); },
    cheese: (t) => { for (let i = 0; i < 3; i++) nz('bandpass', 3800 + Math.random() * 1500, 2600, 2.2, t + i * 0.028, 0.002, 0.09, 0.022); },
    pick: (t) => { osc('sine', 2350, 0, t, 0.002, 0.06, 0.16); osc('sine', 3530, 0, t + 0.005, 0.002, 0.035, 0.12); },
    pat: (t, o = {}) => { const p = o.pitch || 1; osc('triangle', 340 * p, 190 * p, t, 0.003, 0.11, 0.07); nz('lowpass', 1600 * p, 600, 0.8, t, 0.002, 0.08, 0.05); },
    slide: (t) => { nz('bandpass', 700, 260, 0.9, t, 0.06, 0.12, 0.45); },
    fire: (t) => { nz('lowpass', 180, 1100, 0.8, t, 0.12, 0.3, 0.55, sfxBus, brown); osc('sine', 70, 45, t, 0.05, 0.12, 0.5); },
    ding: (t) => { bell(1318.5, t, 0.09, 1.3); bell(1975.5, t + 0.12, 0.06, 1.2); },
    over: (t) => { osc('sawtooth', 196, 180, t, 0.02, 0.05, 0.35); osc('sawtooth', 207, 190, t, 0.02, 0.04, 0.35); },
    cut: (t) => { nz('bandpass', 5200, 1300, 2.6, t, 0.01, 0.16, 0.2); for (let i = 0; i < 6; i++) nz('highpass', 2500, 2500, 0.7, t + 0.02 + i * 0.028 + Math.random() * 0.01, 0.001, 0.07, 0.012); },
    box: (t) => { osc('sine', 120, 70, t, 0.003, 0.25, 0.14); nz('lowpass', 500, 200, 0.8, t, 0.002, 0.14, 0.09); },
    register: (t) => { nz('highpass', 4000, 4000, 0.6, t, 0.001, 0.08, 0.03); bell(2637, t + 0.05, 0.07, 0.9); bell(3951, t + 0.11, 0.05, 0.8); for (let i = 0; i < 5; i++) osc('sine', 4200 + Math.random() * 1800, 0, t + 0.2 + i * 0.05, 0.001, 0.025, 0.08); },
    chime: (t) => { osc('triangle', 784, 0, t, 0.005, 0.07, 0.18); osc('triangle', 1046.5, 0, t + 0.09, 0.005, 0.07, 0.28); },
    tick: (t, o = {}) => { osc('sine', o.hi ? 1500 : 1150, 0, t, 0.001, 0.08, 0.04); nz('highpass', 4000, 4000, 0.7, t, 0.001, 0.03, 0.015); },
    fanfare: (t) => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => { osc('sawtooth', f, 0, t + i * 0.1, 0.01, 0.035, i === 3 ? 0.6 : 0.16, sfxBus, -6); osc('sawtooth', f, 0, t + i * 0.1, 0.01, 0.035, i === 3 ? 0.6 : 0.16, sfxBus, 6); }); bell(2093, t + 0.32, 0.05, 1.2); },
    happy: (t) => { [659.25, 783.99, 1046.5].forEach((f, i) => osc('triangle', f, 0, t + i * 0.09, 0.005, 0.07, 0.22)); },
    sad: (t) => { osc('sawtooth', 311, 277, t, 0.03, 0.05, 0.3, sfxBus); osc('sawtooth', 262, 220, t + 0.3, 0.03, 0.05, 0.5, sfxBus); },
    angry: (t) => { osc('square', 130, 110, t, 0.01, 0.05, 0.35); osc('square', 138, 116, t, 0.01, 0.04, 0.35); },
    doorbell: (t) => { bell(1567.98, t, 0.08, 1.2); bell(1318.5, t + 0.22, 0.08, 1.4); },
    coin: (t) => { bell(2793, t, 0.04, 0.5); bell(3729, t + 0.06, 0.03, 0.5); },
  };
  function sfx(name, o) { if (!ready() || amb.muted || !FX[name]) return; const now = ctx.currentTime; if (last[name] && now - last[name] < (o && o.gap != null ? o.gap : 0.025)) return; last[name] = now; try { FX[name](now + 0.005, o || {}); } catch (e) {} }
  // ---- the oven: a low roar of burning wood + random crackles; louder while you hold BAKE ----
  function oven(on, level = 1) { if (!ready()) return; ovenLevel = on ? level : 0; const t = ctx.currentTime;
    if (!ovenNode) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = brown; s.loop = true; f.type = 'lowpass'; f.frequency.value = 380; g.gain.value = 0.0001; s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); ovenNode = { s, f, g }; }
    ovenNode.g.gain.cancelScheduledValues(t); ovenNode.g.gain.setTargetAtTime(Math.max(0.0001, ovenLevel * 0.22), t, 0.12); ovenNode.f.frequency.setTargetAtTime(260 + ovenLevel * 420, t, 0.2); }
  // ---- room tone: a soft murmur of a busy shop and the odd dish clink ----
  function ambience(on) { if (!ready()) return; const t = ctx.currentTime; if (!ambNode) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = brown; s.loop = true; f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 0.6; g.gain.value = 0.0001; s.connect(f); f.connect(g); g.connect(sfxBus); s.start(); ambNode = { s, g, on: false }; }
    ambNode.on = !!on; ambNode.g.gain.setTargetAtTime(on ? 0.05 : 0.0001, t, 0.4); }
  // ---- MUSIC ----
  const CH = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65], [60, 64, 67], [59, 62, 67], [57, 60, 65], [59, 62, 67]], RT = [36, 31, 33, 29, 36, 31, 29, 31];
  const TUNE = [[[0, 76, 0.4], [0.5, 79, 0.4], [1, 76, 0.4], [2, 72, 0.7]], [[0, 74, 0.4], [0.5, 77, 0.4], [1, 74, 0.4], [2, 71, 0.7]], [[0, 72, 0.4], [0.5, 76, 0.4], [1, 72, 0.4], [2, 69, 0.7]], [[0, 77, 0.4], [0.5, 81, 0.4], [1, 77, 0.4], [2, 72, 0.7]], [[0, 76, 0.4], [0.5, 79, 0.4], [1, 83, 0.4], [2, 79, 0.7]], [[0, 74, 0.4], [0.5, 79, 0.4], [1, 78, 0.4], [2, 74, 0.7]], [[0, 77, 0.4], [0.5, 74, 0.4], [1, 72, 0.4], [2, 69, 0.7]], [[0, 71, 0.4], [0.5, 74, 0.4], [1, 79, 0.5], [2.5, 72, 0.9]]];
  const SPB = 0.4, FORM = [0, 0, 5, 0];   // A A B(+4th) A, eight bars each
  function accordion(m, at, dur, vol) { const f = midi(m), g = ctx.createGain(), lp = ctx.createBiquadFilter(), lfo = ctx.createOscillator(), lg = ctx.createGain(); lp.type = 'lowpass'; lp.frequency.value = 2200; lfo.frequency.value = 5.6; lg.gain.value = 5; lfo.connect(lg);
    [-7, 7, 0].forEach((dt, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'square' : 'sawtooth'; o.frequency.value = i === 2 ? f / 2 : f; o.detune.value = dt; lg.connect(o.detune); const og = ctx.createGain(); og.gain.value = i === 2 ? 0.25 : 0.5; o.connect(og); og.connect(lp); o.start(at); o.stop(at + dur + 0.1); });
    lfo.start(at); lfo.stop(at + dur + 0.1); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.03); g.gain.setValueAtTime(vol, at + dur * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.06); lp.connect(g); g.connect(musBus); }
  function mandolin(m, at, dur, vol) { const n = Math.max(1, Math.round(dur / 0.1)); for (let i = 0; i < n; i++) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = midi(m) * (1 + (Math.random() - 0.5) * 0.004); f.type = 'highpass'; f.frequency.value = 300; const tt = at + i * 0.1, v = vol * (i === 0 ? 1 : 0.6); g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(v, tt + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12); o.connect(f); f.connect(g); g.connect(musBus); o.start(tt); o.stop(tt + 0.14); } }
  function bass(m, at, dur, vol) { const g = ctx.createGain(); [['triangle', 1, 1], ['sine', 0.5, 0.7]].forEach(([ty, k, v]) => { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = ty; o.frequency.value = midi(m) * k * 2; og.gain.value = v; o.connect(og); og.connect(g); o.start(at); o.stop(at + dur + 0.05); }); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(vol, at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); g.connect(musBus); }
  function perc(kind, at, vol) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = kind === 'tamb' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 'tamb' ? 7200 : 8000; f.Q.value = kind === 'tamb' ? 1.4 : 0.7; const d = kind === 'tamb' ? 0.14 : 0.035; env(g, at, 0.002, vol, d); s.connect(f); f.connect(g); g.connect(musBus); s.start(at, Math.random()); s.stop(at + d + 0.03);
    if (kind === 'kick') { const o = ctx.createOscillator(), og = ctx.createGain(); o.frequency.setValueAtTime(110, at); o.frequency.exponentialRampToValueAtTime(45, at + 0.12); env(og, at, 0.003, vol * 3, 0.14); o.connect(og); og.connect(musBus); o.start(at); o.stop(at + 0.2); } }
  function scheduleBar(bar, at) { const sec = Math.floor(bar / 8) % FORM.length, tr = FORM[sec], b = bar % 8, ch = CH[b].map(n => n + tr), rt = RT[b] + tr, B = SPB;
    [0, 2].forEach(o => bass(rt, at + o * B, 0.3, 0.12)); [1, 3].forEach(o => bass(rt + 7, at + o * B, 0.22, 0.08));
    [0.5, 1.5, 2.5, 3.5].forEach((o, i) => { mandolin(ch[i % 3] + 12, at + o * B, 0.12, 0.022); if (i % 2 === 0) mandolin(ch[(i + 2) % 3] + 12, at + o * B, 0.1, 0.016); });
    TUNE[b].forEach(([o, m, d]) => accordion(m + tr, at + o * B, d * B * 2.2, sec === 1 ? 0.03 : 0.036));
    if (sec === 1) TUNE[b].forEach(([o, m, d]) => mandolin(m + tr - 12, at + o * B, d * B * 2, 0.02));   // second A: mandolin doubles the tune an octave down
    for (let i = 0; i < 8; i++) perc('shaker', at + i * B / 2, i % 2 ? 0.02 : 0.035); perc('tamb', at + B, 0.05); perc('tamb', at + 3 * B, 0.05); perc('kick', at, 0.04); perc('kick', at + 2 * B, 0.03); }
  function music(on) { if (!ready()) return; const t = ctx.currentTime; if (on && !mOn) { mOn = true; mAt = t + 0.15; mBar = 0; musBus.gain.cancelScheduledValues(t); musBus.gain.setValueAtTime(0.0001, t); musBus.gain.linearRampToValueAtTime(0.75 * duck, t + 1.2); }
    else if (!on && mOn) { mOn = false; musBus.gain.cancelScheduledValues(t); musBus.gain.setTargetAtTime(0.0001, t, 0.25); } }
  function setDuck(v) { duckT = v; }
  function update(dt) { if (!ctx || ctx.state === 'closed') return; const t = ctx.currentTime;
    if (Math.abs(duck - duckT) > 0.01) { duck += (duckT - duck) * Math.min(1, dt * 4); if (mOn) musBus.gain.setTargetAtTime(0.75 * duck, t, 0.1); musFilter.frequency.setTargetAtTime(duck < 0.7 ? 1400 : 12000, t, 0.2); }
    if (mOn) while (mAt < t + 1.0) { scheduleBar(mBar, mAt); mAt += 4 * SPB; mBar++; }
    if (ovenNode && !amb.muted) { crackT -= dt; if (crackT <= 0) { crackT = (ovenLevel > 0.6 ? 0.05 : 0.22) * (0.4 + Math.random()); const at = t + 0.01; nz('highpass', 1800 + Math.random() * 3000, 0, 0.8, at, 0.001, (ovenLevel > 0.6 ? 0.07 : 0.03) * Math.random() + 0.01, 0.01 + Math.random() * 0.02); } }
    if (ambNode && ambNode.on) { clinkT -= dt; if (clinkT <= 0) { clinkT = 4 + Math.random() * 6; const at = t + 0.01; osc('sine', 2600 + Math.random() * 900, 0, at, 0.002, 0.012, 0.15); osc('sine', 3900 + Math.random() * 900, 0, at + 0.03, 0.002, 0.008, 0.12); } } }
  function stopAll() { if (!ctx) return; try { oven(false); ambience(false); music(false); } catch (e) {} }
  return { sfx, oven, ambience, music, setDuck, update, stopAll, get on() { return mOn; } };
}
