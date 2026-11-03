/* 8 GATES 3D: BASKETBALL, WebAudio synth sound + music. No audio files. */

export function createAudio({ sound = true, music = true } = {}) {
  let ctx = null, master = null, sfxBus = null, musBus = null, noiseBuf = null;
  let soundOn = sound, musicOn = music, musTimer = null, step = 0, nextT = 0;
  let crowdSrc = null, crowdGain = null, closed = false;

  function ensure() {
    if (closed) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = soundOn ? 1 : 0; sfxBus.connect(master);
      musBus = ctx.createGain(); musBus.gain.value = musicOn ? 0.32 : 0; musBus.connect(master);
      const n = ctx.sampleRate * 1.5; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function env(g, t, a, peak, dec) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(type, f0, f1, dur, vol, t0 = 0, bus = sfxBus) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + t0;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.005, vol, dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, type = 'bandpass', f = 1500, q = 1, t0 = 0, a = 0.005, bus = sfxBus, f1 = 0) {
    const c = ensure(); if (!c) return;
    const t = c.currentTime + t0;
    const s = c.createBufferSource(); s.buffer = noiseBuf;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = c.createGain(); env(g, t, a, vol, dur);
    s.connect(fl); fl.connect(g); g.connect(bus);
    s.start(t, Math.random() * 0.5); s.stop(t + a + dur + 0.05);
  }

  const SFX = {
    dribble: (v = 1) => { tone('sine', 150, 55, 0.12, 0.5 * v); noise(0.05, 0.12 * v, 'lowpass', 900); },
    bounce: (v = 1) => { tone('sine', 130, 50, 0.16, 0.45 * Math.min(1, v)); },
    swish: () => { noise(0.35, 0.35, 'bandpass', 5200, 0.8, 0, 0.02, sfxBus, 2500); },
    rim: () => { [523, 788, 1243, 1660].forEach((f, i) => tone(i % 2 ? 'square' : 'triangle', f, f * 0.98, 0.35 - i * 0.05, 0.09)); noise(0.06, 0.2, 'highpass', 3000); },
    board: () => { tone('sine', 110, 70, 0.2, 0.5); noise(0.09, 0.3, 'lowpass', 700); },
    pass: () => { noise(0.18, 0.18, 'bandpass', 900, 1.5, 0, 0.02, sfxBus, 2600); },
    catch: () => { tone('sine', 220, 120, 0.08, 0.35); noise(0.04, 0.15, 'lowpass', 1200); },
    squeak: () => { tone('sine', 2400 + Math.random() * 600, 3200, 0.07, 0.06); },
    jump: () => { tone('triangle', 260, 520, 0.12, 0.08); },
    steal: () => { tone('square', 660, 990, 0.06, 0.08); tone('square', 990, 1320, 0.08, 0.08, 0.06); },
    block: () => { tone('sawtooth', 180, 60, 0.25, 0.22); noise(0.15, 0.3, 'lowpass', 600); },
    whistle: (len = 0.45) => {
      const c = ensure(); if (!c) return;
      const t = c.currentTime;
      const o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 2650; lfo.frequency.value = 38; lg.gain.value = 120;
      lfo.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.setValueAtTime(0.18, t + len); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.06);
      o.connect(g); g.connect(sfxBus); o.start(t); lfo.start(t); o.stop(t + len + 0.1); lfo.stop(t + len + 0.1);
    },
    buzzer: () => { tone('sawtooth', 196, 196, 1.1, 0.16); tone('square', 233, 233, 1.1, 0.08); },
    cheer: (v = 1) => { noise(1.6, 0.22 * v, 'bandpass', 1100, 0.6, 0, 0.25); noise(1.2, 0.12 * v, 'bandpass', 2400, 0.7, 0.1, 0.2); },
    groan: () => { noise(0.9, 0.12, 'lowpass', 500, 1, 0, 0.1, sfxBus, 250); },
    meter: () => { tone('square', 880, 880, 0.04, 0.05); },
    perfect: () => { tone('triangle', 1046, 1046, 0.08, 0.12); tone('triangle', 1568, 1568, 0.12, 0.1, 0.07); },
    score2: () => { [523, 659, 784].forEach((f, i) => tone('square', f, f, 0.09, 0.06, i * 0.07)); },
    score3: () => { [523, 659, 784, 1046].forEach((f, i) => tone('square', f, f, 0.1, 0.07, i * 0.07)); },
    win: () => { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone('square', f, f, 0.14, 0.07, i * 0.12)); },
    lose: () => { [392, 349, 311, 262].forEach((f, i) => tone('triangle', f, f, 0.2, 0.08, i * 0.16)); },
    click: () => { tone('square', 1200, 900, 0.03, 0.05); },
    hover: () => { tone('sine', 140, 100, 0.3, 0.05); },
  };

  /* crowd bed: quiet filtered noise that swells on big plays */
  function startCrowd() {
    const c = ensure(); if (!c || crowdSrc) return;
    crowdSrc = c.createBufferSource(); crowdSrc.buffer = noiseBuf; crowdSrc.loop = true;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 0.5;
    crowdGain = c.createGain(); crowdGain.gain.value = 0.02;
    crowdSrc.connect(f); f.connect(crowdGain); crowdGain.connect(sfxBus); crowdSrc.start();
  }
  function crowd(level) {
    if (!ctx || !crowdGain) return;
    const t = ctx.currentTime;
    crowdGain.gain.cancelScheduledValues(t);
    crowdGain.gain.setTargetAtTime(0.02 + level * 0.06, t, 0.4);
  }

  /* music: a small funk loop scheduled ahead */
  const BASS = [41, 0, 41, 44, 0, 46, 0, 44, 41, 0, 41, 48, 0, 46, 44, 0, 39, 0, 39, 43, 0, 44, 0, 43, 39, 0, 46, 0, 44, 0, 43, 0];
  const CH = [[65, 68, 72], [63, 67, 70]];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function schedule() {
    if (!ctx || !musicOn) return;
    const spb = 60 / 104 / 4;
    while (nextT < ctx.currentTime + 0.2) {
      const s = step % 32, t0 = nextT - ctx.currentTime;
      if (BASS[s]) tone('sawtooth', mtof(BASS[s]), mtof(BASS[s]) * 0.99, spb * 1.6, 0.16, t0, musBus);
      if (s % 4 === 0) { tone('sine', 120, 45, 0.18, 0.5, t0, musBus); }
      if (s % 8 === 4) noise(0.12, 0.25, 'bandpass', 1800, 0.8, t0, 0.002, musBus);
      if (s % 2 === 1) noise(0.03, 0.1, 'highpass', 7000, 1, t0, 0.002, musBus);
      if (s === 2 || s === 18 || s === 10 || s === 26) {
        (s < 16 ? CH[0] : CH[1]).forEach((m) => tone('square', mtof(m), mtof(m), spb * 0.8, 0.025, t0, musBus));
      }
      nextT += spb; step++;
    }
  }
  function startMusic() {
    if (!ensure() || musTimer) return;
    nextT = ctx.currentTime + 0.05;
    musTimer = setInterval(schedule, 60);
  }
  function stopMusic() { if (musTimer) { clearInterval(musTimer); musTimer = null; } }

  return {
    resume() { if (ensure()) { startCrowd(); if (musicOn) startMusic(); } },
    sfx(name, v) { if (!soundOn || !ctx || ctx.state !== 'running') return; const f = SFX[name]; if (f) try { f(v); } catch (e) { /* ignore */ } },
    crowd,
    setSound(b) { soundOn = !!b; if (sfxBus) sfxBus.gain.value = soundOn ? 1 : 0; },
    setMusic(b) { musicOn = !!b; if (musBus) musBus.gain.value = musicOn ? 0.32 : 0; if (musicOn && ctx) startMusic(); else stopMusic(); },
    get sound() { return soundOn; },
    get music() { return musicOn; },
    close() { closed = true; stopMusic(); try { crowdSrc && crowdSrc.stop(); } catch (e) { /* */ } if (ctx) ctx.close().catch(() => {}); ctx = null; },
  };
}
