// s327 LOFI (Ben: radio lofi in the car, background lofi after you get out). Synth, no files, phone-light Web Audio, look-ahead scheduler.
// 74 BPM, swung hats, dusty kick + snare, a soft electric-piano chord loop (Fmaj7 · Em7 · Dm7 · G7sus · Cmaj7 · Am7 · Dm9 · G13), round bass,
// a sparse pentatonic melody and vinyl crackle. MODE 'radio' = the car radio (band-limited, a little crunch, hiss) · 'bg' = full range, quieter.
//   const LF = lofi({ muted }); LF.play('radio' | 'bg') · LF.stop() · LF.tick() (applies mute)
export function lofi({ muted = () => false } = {}) {
  let ac = null, out, bus, dry, radio, crk, timer = null, nextT = 0, step = 0, mode = null, noise = null, crkSrc = null;
  const BPM = 74, ST = 60 / BPM / 4, mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [55, 60, 62, 65], [48, 52, 55, 59], [45, 52, 55, 60], [50, 53, 57, 64], [55, 59, 64, 65]];
  const BASS = [41, 40, 38, 43, 36, 45, 38, 43], PENT = [72, 74, 76, 79, 81, 84];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function build() { ac = new (window.AudioContext || window.webkitAudioContext)(); out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
    bus = ac.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 2600; bus.Q.value = 0.4;
    dry = ac.createGain(); bus.connect(dry); dry.connect(out);
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 380; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.Q.value = 1.2;
    const sh = ac.createWaveShaper(), cv = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 255.5 - 1; cv[i] = Math.tanh(x * 2.2); } sh.curve = cv;
    radio = ac.createGain(); bus.connect(hp); hp.connect(lp); lp.connect(sh); sh.connect(radio); radio.connect(out);
    const n = ac.sampleRate * 2; noise = ac.createBuffer(1, n, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const cb = ac.createBuffer(1, n, ac.sampleRate), c2 = cb.getChannelData(0); for (let i = 0; i < n; i++) c2[i] = (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.9 : 0) + (Math.random() * 2 - 1) * 0.035;
    crkSrc = ac.createBufferSource(); crkSrc.buffer = cb; crkSrc.loop = true; const cf = ac.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 2400; cf.Q.value = 0.5; crk = ac.createGain(); crk.gain.value = 0; crkSrc.connect(cf); cf.connect(crk); crk.connect(out); crkSrc.start(); }
  const env = (g, t, a, peak, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  function keys(m, t, dur, v) { const f = mtof(m), g = ac.createGain(); env(g, t, 0.012, v, dur); g.connect(bus);
    for (const [ty, mul, gv, det] of [['sine', 1, 1, 0], ['triangle', 2, 0.18, 4], ['sine', 1, 0.5, -7]]) { const o = ac.createOscillator(), og = ac.createGain(); o.type = ty; o.frequency.value = f * mul; o.detune.value = det + (Math.random() - 0.5) * 6; og.gain.value = gv; o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.1); } }
  function bass(m, t, dur) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = mtof(m); env(g, t, 0.01, 0.34, dur); o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05); }
  function kick(t, v) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(g, t, 0.004, 0.55 * v, 0.24); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.3); }
  function nz(t, f, type, v, d, q = 0.8) { const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; env(g, t, 0.003, v, d); s.connect(fl); fl.connect(g); g.connect(bus); s.start(t, Math.random()); s.stop(t + d + 0.05); }
  function sched() { if (!ac) return; while (nextT < ac.currentTime + 0.25) { const s = step % 16, bar = Math.floor(step / 16) % 8, sw = s % 2 ? ST * 0.22 : 0, t = nextT + sw, c = CH[bar];
      if (s === 0) for (const m of c) keys(m, t + Math.random() * 0.02, ST * 13, 0.075);
      if (s === 10) for (const m of c.slice(1)) keys(m, t, ST * 5, 0.045);
      if (s === 0 || s === 6) bass(BASS[bar], t, ST * (s ? 3 : 5)); if (s === 10) bass(BASS[bar] + 7, t, ST * 2.5);
      if (s === 0 || s === 10) kick(t, 1); if (s === 7) kick(t, 0.45);
      if (s === 4 || s === 12) { nz(t, 1700, 'bandpass', 0.16, 0.16); nz(t, 220, 'lowpass', 0.05, 0.08); }
      if (s % 2 === 0) nz(t, 7500, 'highpass', s % 4 ? 0.025 : 0.04, 0.04);
      if ((s === 2 || s === 8 || s === 11 || s === 14) && rnd() < (bar % 2 ? 0.55 : 0.35)) keys(PENT[(rnd() * PENT.length) | 0] - (rnd() < 0.3 ? 12 : 0), t, ST * 4, 0.05);
      nextT += ST; step++; } }
  function level() { if (!ac) return; const now = ac.currentTime, m = muted(), r = mode === 'radio';
    out.gain.setTargetAtTime(m || !mode ? 0 : r ? 0.55 : 0.32, now, 0.4); dry.gain.setTargetAtTime(r ? 0 : 1, now, 0.3); radio.gain.setTargetAtTime(r ? 0.9 : 0, now, 0.3); crk.gain.setTargetAtTime(r ? 0.5 : 0.18, now, 0.3); }
  return {
    play(m) { if (mode === m) return; try { if (!ac) build(); if (ac.state === 'suspended') ac.resume(); } catch (e) { return; } mode = m; if (!timer) { nextT = ac.currentTime + 0.1; timer = setInterval(sched, 60); } level(); },
    stop() { mode = null; level(); if (timer) { const tm = timer; timer = null; setTimeout(() => { if (!timer) clearInterval(tm); else clearInterval(tm); }, 1500); clearInterval(tm); } },
    tick() { level(); }, mode: () => mode };
}
