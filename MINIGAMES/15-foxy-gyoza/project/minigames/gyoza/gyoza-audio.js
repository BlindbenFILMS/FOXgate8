// 8 GATES — FOXY GYOZA sound + music. Everything is synthesised with WebAudio (no files to ship, works offline, tiny on phones).
// gyozaAudio(ambience) → { unlock, sfx(name, n), setSizzle(v), setSteam(v), setMusic('calm'|'shift'|'off'), toggle(), setMuted(b), muted(), suspend(), resume(), step(dt) }
// SFX: tap bowl scoop fold pleat seal burst plop water lidOn lidOff flip plate burnt bin glug spill drip sprinkle reveal slide bell
//      happy thrilled sad angry coin kaching error tick gong upgrade step sit talk hop wave
// MUSIC: the 2D cart's night-market loop (plucked pentatonic lead, bass, wood block) grown into an A/B song with a soft pad;
//        'shift' adds a shaker + busier block; it ducks under big moments. Mute is remembered in localStorage (foxy.gyoza.mute).
const MUTE_KEY = 'foxy.gyoza.mute';
const midi = m => 440 * Math.pow(2, (m - 69) / 12);
// lead: [beat, scale index]; scale = E major pentatonic-ish, like the 2D cart
const SCALE = [64, 66, 69, 71, 74, 76, 78, 81, 83, 86];
const PHRASE_A = [[0, 3], [0.75, 5], [1.5, 4], [2.5, 6], [4, 3], [5, 1], [6, 2], [7, 4], [8, 5], [8.75, 7], [9.5, 6], [10.5, 8], [12, 5], [13, 3], [14, 4], [15, 6], [16, 4], [16.75, 6], [17.5, 5], [18.5, 7], [20, 4], [21, 2], [22, 3], [23, 5], [24, 6], [24.75, 4], [25.5, 3], [26.5, 1], [28, 3], [29, 5], [30, 2], [31, 0]];
const PHRASE_B = [[0, 5], [0.5, 6], [1, 7], [2, 6], [3, 5], [4, 4], [6, 5], [7, 3], [8, 4], [8.5, 5], [9, 6], [10, 5], [11, 4], [12, 3], [14, 2], [15, 1], [16, 2], [16.5, 3], [17, 4], [18, 6], [19, 5], [20, 4], [22, 3], [23, 4], [24, 5], [24.5, 6], [25, 8], [26, 7], [27, 6], [28, 5], [29, 3], [30, 1], [31, 2]];
const BASS_A = [40, 40, 45, 45, 47, 47, 40, 40], BASS_B = [45, 45, 42, 42, 47, 47, 44, 40];
const PAD_A = [[52, 56, 59], [57, 61, 64], [59, 63, 66], [52, 56, 59]], PAD_B = [[57, 61, 64], [54, 57, 61], [59, 63, 66], [56, 59, 64]];

export function gyozaAudio(amb) {
  let A = null, muted = (() => { try { return localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { return false; } })(), mode = 'calm', want = { siz: 0, steam: 0 };
  const M = { next: 0, beat: 0, sect: 0, on: false };
  function ensure() {
    if (A) return A; try { amb.init && amb.init(); } catch (e) {} const ctx = amb.ctx; if (!ctx) return null;
    try { if (amb.wind) amb.wind.gain.value = 0; } catch (e) {}
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(ctx.destination);
    const out = ctx.createGain(); out.gain.value = muted ? 0 : 1; out.connect(comp);
    const sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(out);
    const musicBus = ctx.createGain(); musicBus.gain.value = 0.0; musicBus.connect(out);
    // a small room: short feedback delay for warmth (cheap reverb)
    const verb = ctx.createDelay(0.2); verb.delayTime.value = 0.045; const fb = ctx.createGain(); fb.gain.value = 0.28; const vlp = ctx.createBiquadFilter(); vlp.type = 'lowpass'; vlp.frequency.value = 2400; const vout = ctx.createGain(); vout.gain.value = 0.22;
    verb.connect(vlp); vlp.connect(fb); fb.connect(verb); vlp.connect(vout); vout.connect(out);
    const noise = amb.noise || (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    // continuous loops: frying sizzle (bright crackle) + steam (soft hiss), gains follow the pans
    const loop = (filters, bus) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; let n = s; for (const f of filters) { n.connect(f); n = f; } const g = ctx.createGain(); g.gain.value = 0; n.connect(g); g.connect(bus); s.start(0, Math.random()); return g; };
    const bq = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    const siz = loop([bq('highpass', 2600), bq('peaking', 5200, 1.2)], sfxBus), steam = loop([bq('bandpass', 1100, 0.5), bq('lowpass', 3000)], sfxBus);
    A = { ctx, out, sfxBus, musicBus, verb, noise, siz, steam, sizLvl: 0 };
    amb.setMuted && amb.setMuted(muted);
    return A; }
  const now = () => A.ctx.currentTime;
  function osc(f, dur, vol, type = 'sine', o = {}) { const ctx = A.ctx, t = now() + (o.delay || 0), os = ctx.createOscillator(), g = ctx.createGain(); os.type = type; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur); if (o.detune) os.detune.value = o.detune;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.atk || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); let n = os; if (o.lp) { const b = ctx.createBiquadFilter(); b.type = 'lowpass'; b.frequency.value = o.lp; n.connect(b); n = b; } n.connect(g); g.connect(o.bus || A.sfxBus); if (o.wet) g.connect(A.verb); os.start(t); os.stop(t + dur + 0.05); }
  function hit(dur, o = {}) { const ctx = A.ctx, t = now() + (o.delay || 0), s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = A.noise; b.type = o.type || 'bandpass'; b.Q.value = o.q ?? 1; b.frequency.setValueAtTime(o.f0 || 1000, t); if (o.f1) b.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.vol || 0.1, t + (o.atk || 0.004)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(b); b.connect(g); g.connect(o.bus || A.sfxBus); if (o.wet) g.connect(A.verb); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05); }
  function metal(f, dur, vol, o = {}) { const ny = A.ctx.sampleRate * 0.42; [[1, 1], [2.76, 0.5], [5.4, 0.28], [8.93, 0.14]].forEach(([r, a]) => { if (f * r < ny) osc(f * r, dur / Math.sqrt(r), vol * a, 'sine', { ...o, wet: true }); }); }
  function arp(notes, step, vol, type = 'triangle', o = {}) { notes.forEach((m, i) => osc(midi(m), 0.22, vol, type, { ...o, delay: (o.delay || 0) + i * step, wet: true })); }
  function duck(t = 0.6) { if (!A) return; const g = A.musicBus.gain, n = now(); g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(level() * 0.35, n + 0.05); g.linearRampToValueAtTime(level(), n + t); }
  const level = () => mode === 'off' ? 0 : mode === 'shift' ? 0.3 : 0.34;
  const SFX = {
    tap: () => osc(1500, 0.04, 0.05, 'triangle'),
    bowl: () => { hit(0.06, { f0: 1900, q: 5, vol: 0.12 }); osc(330, 0.08, 0.06, 'sine', { to: 260 }); },
    scoop: () => { hit(0.12, { type: 'lowpass', f0: 700, f1: 260, q: 2, vol: 0.09 }); osc(140 + Math.random() * 40, 0.08, 0.04, 'sine', { to: 90 }); },
    fold: () => { hit(0.16, { f0: 900, f1: 380, q: 1.4, vol: 0.12 }); osc(260, 0.12, 0.06, 'sine', { to: 170 }); },
    pleat: n => { const f = 1300 + (n || 0) * 90; osc(f, 0.04, 0.07, 'triangle', { to: f * 0.72 }); hit(0.02, { type: 'highpass', f0: 5000, vol: 0.05 }); },
    seal: () => { arp([76, 83], 0.07, 0.07); hit(0.08, { f0: 1500, q: 2, vol: 0.06 }); },
    burst: () => { hit(0.34, { type: 'lowpass', f0: 1400, f1: 180, q: 1.5, vol: 0.32 }); osc(150, 0.26, 0.12, 'sine', { to: 55 }); },
    plop: () => { osc(460, 0.09, 0.08, 'sine', { to: 210 }); hit(0.07, { f0: 2600, q: 2, vol: 0.07 }); hit(0.35, { type: 'highpass', f0: 3000, vol: 0.06 }); },
    water: () => { hit(1.1, { type: 'lowpass', f0: 9000, f1: 1400, q: 0.6, vol: 0.36 }); hit(0.5, { type: 'highpass', f0: 4000, vol: 0.18, delay: 0.05 }); osc(110, 0.4, 0.12, 'sine', { to: 70 }); duck(1.2); },
    lidOn: () => { metal(470, 0.9, 0.11); hit(0.08, { type: 'lowpass', f0: 600, vol: 0.2 }); osc(95, 0.18, 0.12, 'sine', { to: 60 }); },
    lidOff: () => { metal(620, 0.4, 0.06); hit(0.45, { f0: 700, f1: 2600, q: 0.8, vol: 0.14 }); },
    flip: () => { hit(0.4, { f0: 380, f1: 1800, q: 0.9, vol: 0.18 }); osc(220, 0.3, 0.05, 'sine', { to: 440 }); duck(1.0); },
    plate: () => { hit(0.05, { f0: 3200, q: 3, vol: 0.14 }); osc(980, 0.07, 0.05, 'triangle'); [0, 0.05, 0.1, 0.15, 0.2].forEach(d => osc(300 + Math.random() * 80, 0.07, 0.05, 'sine', { to: 160, delay: d })); },
    burnt: () => { osc(220, 0.35, 0.08, 'sawtooth', { lp: 900 }); osc(180, 0.45, 0.07, 'sawtooth', { lp: 700, delay: 0.12 }); },
    bin: () => { hit(0.2, { type: 'lowpass', f0: 700, f1: 200, vol: 0.18 }); metal(180, 0.3, 0.05); },
    glug: () => { const f = 170 + Math.random() * 90; osc(f, 0.09, 0.07, 'sine', { to: f * 1.5 }); },
    spill: () => { hit(0.3, { type: 'lowpass', f0: 1200, f1: 300, vol: 0.14 }); osc(200, 0.25, 0.05, 'sawtooth', { lp: 600, to: 120 }); },
    drip: () => { osc(1500, 0.09, 0.07, 'sine', { to: 520 }); },
    sprinkle: () => { hit(0.02, { type: 'highpass', f0: 6500, vol: 0.06 }); hit(0.02, { type: 'highpass', f0: 7500, vol: 0.04, delay: 0.03 }); },
    reveal: () => { arp([72, 76, 79, 84], 0.06, 0.06); metal(2093, 0.6, 0.03, { delay: 0.25 }); duck(1.4); },
    slide: () => hit(0.25, { f0: 1100, f1: 600, q: 0.7, vol: 0.08 }),
    bell: () => { metal(1318, 1.2, 0.05); metal(988, 1.4, 0.045, { delay: 0.18 }); },
    happy: () => arp([72, 76, 79], 0.08, 0.07),
    thrilled: () => { arp([72, 76, 79, 84, 88], 0.07, 0.07); metal(2637, 0.7, 0.025, { delay: 0.35 }); },
    sad: () => { osc(330, 0.3, 0.06, 'sawtooth', { lp: 900, to: 260 }); osc(262, 0.4, 0.06, 'sawtooth', { lp: 800, to: 196, delay: 0.2 }); },
    angry: () => { osc(160, 0.2, 0.07, 'square', { lp: 700 }); osc(150, 0.3, 0.07, 'square', { lp: 600, delay: 0.18 }); },
    coin: () => { metal(2400 + Math.random() * 300, 0.25, 0.05); },
    kaching: () => { metal(1760, 0.6, 0.06); metal(2637, 0.8, 0.05, { delay: 0.09 }); hit(0.06, { f0: 4000, q: 2, vol: 0.06 }); },
    error: () => { osc(220, 0.14, 0.06, 'square', { lp: 900 }); osc(196, 0.18, 0.06, 'square', { lp: 800, delay: 0.1 }); },
    tick: () => hit(0.05, { f0: 2000, q: 6, vol: 0.12 }),
    gong: () => { metal(196, 2.6, 0.12); arp([64, 68, 71, 76], 0.12, 0.05, 'triangle', { delay: 0.2 }); duck(3); },
    upgrade: () => { arp([79, 83, 86, 91], 0.05, 0.06); metal(3136, 0.6, 0.025, { delay: 0.2 }); },
    step: () => hit(0.06, { type: 'lowpass', f0: 420, q: 0.8, vol: 0.05 }),
    sit: () => { hit(0.12, { type: 'lowpass', f0: 300, vol: 0.12 }); osc(120, 0.1, 0.05, 'sine', { to: 80 }); },
    talk: () => { osc(660, 0.05, 0.035, 'triangle'); osc(880, 0.05, 0.03, 'triangle', { delay: 0.05 }); },
    hop: () => osc(380, 0.12, 0.05, 'sine', { to: 640 }),
    wave: () => arp([79, 83], 0.06, 0.04),
    start: () => { metal(1318, 0.8, 0.05); arp([64, 69, 71, 76], 0.07, 0.05, 'triangle', { delay: 0.1 }); } };
  // ---------- music scheduler ----------
  function note(m, t, dur, vol, kind) { const ctx = A.ctx, bus = A.musicBus;
    if (kind === 'pluck') { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = midi(m); o2.frequency.value = midi(m + 12); f.type = 'lowpass'; f.frequency.setValueAtTime(5200, t); f.frequency.exponentialRampToValueAtTime(900, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); const g2 = ctx.createGain(); g2.gain.value = 0.25; o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(bus); g.connect(A.verb); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05); }
    else if (kind === 'bass') { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'triangle'; o.frequency.value = midi(m); f.type = 'lowpass'; f.frequency.value = 420; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05); }
    else if (kind === 'pad') { m.forEach(n => [-7, 7].forEach(dt => { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = dt; f.type = 'lowpass'; f.frequency.value = 700; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.3); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(f); f.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05); })); }
    else if (kind === 'block') { const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = A.noise; b.type = 'bandpass'; b.frequency.value = midi(m); b.Q.value = 9; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(b); b.connect(g); g.connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.02); }
    else if (kind === 'shaker') { const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = A.noise; b.type = 'highpass'; b.frequency.value = 7000; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(b); b.connect(g); g.connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.02); } }
  function schedule() { if (!A || mode === 'off' || muted) return; const spb = mode === 'shift' ? 0.3 : 0.36, ahead = A.ctx.currentTime + 0.35; if (M.next < A.ctx.currentTime) { M.next = A.ctx.currentTime + 0.05; }
    while (M.next < ahead) { const b = M.beat, t = M.next, B = M.sect % 2, ph = B ? PHRASE_B : PHRASE_A, swing = (b % 1 === 0.5) ? 0.04 : 0;
      for (const [nb, i] of ph) if (nb >= b && nb < b + 0.25) note(SCALE[i], t + (nb - b) * spb + swing, 0.7, 0.07, 'pluck');
      if (b % 4 === 0) { note((B ? BASS_B : BASS_A)[(b / 4) % 8], t, spb * 1.6, 0.16, 'bass'); }
      if (b % 4 === 2) note((B ? BASS_B : BASS_A)[(b / 4 | 0) % 8] + 7, t, spb * 1.2, 0.12, 'bass');
      if (b % 8 === 0) note((B ? PAD_B : PAD_A)[(b / 8) % 4], t, spb * 8, 0.012, 'pad');
      if (b % 2 === 1) note(92, t, 0.09, mode === 'shift' ? 0.14 : 0.08, 'block');
      if (mode === 'shift' && b % 0.5 === 0) note(0, t, 0.05, b % 1 ? 0.025 : 0.04, 'shaker');
      M.beat += 0.25; M.next += spb * 0.25; if (M.beat >= 32) { M.beat = 0; M.sect++; } } }
  let tick = 0;
  return {
    unlock() { const a = ensure(); if (!a) return; if (a.ctx.state === 'suspended') a.ctx.resume(); if (!M.on) { M.on = true; a.musicBus.gain.setTargetAtTime(level(), a.ctx.currentTime, 0.5); } },
    sfx(name, n) { if (muted || !ensure() || A.ctx.state !== 'running') return; const f = SFX[name]; if (f) try { f(n); } catch (e) {} },
    setSizzle(v) { want.siz = v; }, setSteam(v) { want.steam = v; },
    setMusic(m) { mode = m; if (A) A.musicBus.gain.setTargetAtTime(M.on ? level() : 0, A.ctx.currentTime, 0.4); },
    setMuted(b) { muted = !!b; try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) {} if (A) A.out.gain.setTargetAtTime(muted ? 0 : 1, A.ctx.currentTime, 0.05); amb.setMuted && amb.setMuted(muted); if (!muted) M.next = 0; },
    toggle() { this.setMuted(!muted); return !muted; }, muted: () => muted,
    suspend() { if (A && A.ctx.state === 'running') A.ctx.suspend(); }, resume() { if (A && A.ctx.state === 'suspended' && M.on) A.ctx.resume(); },
    step(dt) { if (!A || A.ctx.state !== 'running') return; tick += dt; const t = A.ctx.currentTime;
      // sizzle crackles: jitter the gain so it pops like real oil
      const s = want.siz * (0.75 + Math.random() * 0.5); A.siz.gain.setTargetAtTime(muted ? 0 : s * 0.16, t, 0.03); A.steam.gain.setTargetAtTime(muted ? 0 : want.steam * 0.1, t, 0.15);
      if (want.siz > 0.05 && Math.random() < dt * 9 * want.siz) hit(0.03, { type: 'highpass', f0: 3500 + Math.random() * 3000, vol: 0.04 + Math.random() * 0.05 });
      schedule(); } };
}
