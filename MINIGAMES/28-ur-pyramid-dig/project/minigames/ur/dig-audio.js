// 8 GATES — THE PYRAMID DIG · SOUND + MUSIC [urPyramidDig]. All synthesized live with Web Audio (no files to load, phone-light).
// digAudio(amb) takes the shared Ambience from engine/restaurant-kit.js createStage (village-game.js) and plugs into its master gain,
// so the HUD's sound toggle mutes everything. Nothing plays until amb.init() has run from a tap (browser rule): call start() after it.
//   SFX:   scrape(v) crumble() chip() brush() sparkle() found() liftTick(p) crack() whoosh() land() shake() pick(n) snap() wrong()
//          glyph(k) roll(p) smudge() thunk() coin() react(level) cart() step() click() dayEnd() kneel() lamp(on)
//   MUSIC: music(mode)  'calm' (walking / cards) · 'work' (a dig) · 'off';  setMusicOn(bool) / musicOn  (remembered per device)
// The hall has its own stone reverb (generated impulse) and a quiet room tone with brazier crackle.
// Score: original, in D Hijaz (D Eb F# G A Bb C) — oud-style plucks (Karplus-Strong), a frame drum playing maqsum, a breathy ney-style flute.
export function digAudio(amb) {
  let ctx = null, out, sfxBus, musBus, verb, verbIn, started = false, mode = 'off', want = 'calm', noise = null, nextT = 0, step = 0, bar = 0, timer = 0, roomG = null, crackT = 0, lastScrape = 0;
  let musicOn = true; try { musicOn = localStorage.getItem('ur.dig.music') !== '0'; } catch (e) {}
  const R = (a, b) => a + Math.random() * (b - a);
  function start() {
    if (started) return !!ctx; if (!amb || !amb.ctx) return false; started = true; ctx = amb.ctx;
    out = ctx.createDynamicsCompressor(); out.threshold.value = -14; out.knee.value = 10; out.ratio.value = 3; out.attack.value = 0.004; out.release.value = 0.2; out.connect(amb.master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.95; sfxBus.connect(out);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(out);
    // stone hall reverb: 2.4 s stereo decaying noise, darkened
    verb = ctx.createConvolver(); { const len = Math.floor(ctx.sampleRate * 2.4), b = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < len; i++) { const k = i / len; lp = lp * 0.55 + (Math.random() * 2 - 1) * 0.45; d[i] = lp * Math.pow(1 - k, 2.6) * (i < 300 ? i / 300 : 1); } } verb.buffer = b; }
    verbIn = ctx.createGain(); verbIn.gain.value = 1; const vOut = ctx.createGain(); vOut.gain.value = 0.55; verbIn.connect(verb); verb.connect(vOut); vOut.connect(out);
    { const len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; noise = b; }
    // room tone: very low rumble + air
    { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160; roomG = ctx.createGain(); roomG.gain.value = 0.05; s.connect(f); f.connect(roomG); roomG.connect(sfxBus); s.start(); }
    if (amb.wind) amb.wind.gain.value = 0.03;
    const tick = () => { if (!ctx) return; if (ctx.state === 'running') { schedule(); crackle(); } };
    timer = setInterval(tick, 60);
    try { document.addEventListener('visibilitychange', onVis); } catch (e) {}
    nextT = ctx.currentTime + 0.1; setMode(want); return true; }
  const onVis = () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); };
  const live = () => ctx && !amb.muted && ctx.state === 'running';
  // ---------- building blocks ----------
  function env(g, t, a, peak, d, sus = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus), t + a + d); }
  function route(node, { pan = 0, wet = 0.15, bus } = {}) { let n = node; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); n.connect(p); n = p; } n.connect(bus || sfxBus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; n.connect(w); w.connect(verbIn); } }
  function nz(t, dur, { type = 'bandpass', f = 1500, q = 1, vol = 0.2, a = 0.004, f2 = 0, pan = 0, wet = 0.15, bus } = {}) { const s = ctx.createBufferSource(); s.buffer = noise; const ny = ctx.sampleRate * 0.45, b = ctx.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(Math.min(f, ny), t); b.Q.value = f2 ? Math.min(q, 1.4) : Math.min(q, 8); if (f2) b.frequency.exponentialRampToValueAtTime(Math.min(Math.max(f2, 40), ny), t + dur); const g = ctx.createGain(); env(g, t, a, vol, dur); s.connect(b); b.connect(g); route(g, { pan, wet, bus }); s.start(t, Math.random() * 1.5); s.stop(t + a + dur + 0.05); }
  function os(t, freq, dur, opts = {}) { if (!(freq > 0) || freq > 16000) return; return os2(t, freq, dur, opts); }
  function os2(t, freq, dur, { type = 'sine', vol = 0.15, a = 0.005, f2 = 0, pan = 0, wet = 0.15, bus, detune = 0 } = {}) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = ctx.createGain(); env(g, t, a, vol, dur); o.connect(g); route(g, { pan, wet, bus }); o.start(t); o.stop(t + a + dur + 0.05); }
  function bell(t, freq, vol = 0.12, dur = 1.2, pan = 0, wet = 0.35, bus) { [[1, 1], [2.76, 0.45], [5.4, 0.25], [8.93, 0.12]].forEach(([r, v], i) => os(t, freq * r, dur / (1 + i * 0.7), { vol: vol * v, a: 0.002, pan, wet, bus })); }
  // Karplus-Strong pluck (oud-ish) — real-time feedback loop
  function pluck(t, freq, o = {}) { if (!(freq > 20) || freq > 4000) return; return pluck2(t, freq, o); }
  // Karplus-Strong rendered once per note into a cached buffer (a DelayNode loop can't go below 128 samples, so high notes would be wrong)
  const KS = new Map();
  function ksBuf(freq, dur, bright) { const key = Math.round(freq * 10) + '|' + dur + '|' + bright; if (KS.has(key)) return KS.get(key); const sr = ctx.sampleRate, n = Math.floor(sr * dur), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), N = Math.max(2, Math.round(sr / freq)), ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1; let lp = 0; for (let i = 0; i < N; i++) { lp = lp * 0.5 + ring[i] * 0.5; ring[i] = lp; }
    const rho = Math.pow(0.001, 1 / (freq * dur)), s = Math.min(0.72, Math.max(0.5, 0.5 + (bright - 1600) / 6000)); let k = 0;
    for (let i = 0; i < n; i++) { const a = ring[k], c = ring[(k + 1) % N]; const v = rho * (s * a + (1 - s) * c); ring[k] = v; d[i] = a * (i < 40 ? i / 40 : 1); k = (k + 1) % N; }
    const fade = Math.floor(sr * 0.05); for (let i = 0; i < fade; i++) d[n - 1 - i] *= i / fade; if (KS.size > 80) KS.clear(); KS.set(key, b); return b; }
  function pluck2(t, freq, { vol = 0.25, dur = 1.6, bright = 2600, pan = 0, wet = 0.25, bus } = {}) { const src = ctx.createBufferSource(); src.buffer = ksBuf(freq, dur, bright); const g = ctx.createGain(); g.gain.value = vol * 1.6; src.connect(g); route(g, { pan, wet, bus }); src.start(t); }
  // ---------- SFX ----------
  const T = () => ctx.currentTime;
  const S = {
    scrape(v = 0.5) { if (!live()) return; const t = T(); if (t - lastScrape < 0.045) return; lastScrape = t; nz(t, R(0.05, 0.09), { f: R(900, 1700) + v * 900, q: 1.4, vol: 0.08 + v * 0.07, pan: R(-0.2, 0.2), wet: 0.08 }); nz(t, 0.03, { type: 'highpass', f: 3500, vol: 0.035, wet: 0 }); if (Math.random() < 0.35) S.crumble(); },
    crumble() { if (!live()) return; const t = T(); for (let i = 0; i < 4; i++) nz(t + i * R(0.02, 0.05), 0.025, { type: 'lowpass', f: R(600, 1400), vol: R(0.04, 0.08), pan: R(-0.4, 0.4), wet: 0.1 }); },
    chip() { if (!live()) return; const t = T(); os(t, 2350, 0.08, { type: 'triangle', vol: 0.12, wet: 0.3 }); os(t, 3520, 0.05, { vol: 0.06, wet: 0.3 }); nz(t, 0.05, { f: 2800, q: 3, vol: 0.2 }); os(t + 0.02, 180, 0.15, { type: 'sawtooth', vol: 0.05, f2: 110, wet: 0 }); },
    brush() { if (!live()) return; const t = T(); nz(t, R(0.09, 0.14), { type: 'highpass', f: R(3500, 5200), vol: 0.06, a: 0.02, pan: R(-0.3, 0.3), wet: 0.12 }); },
    sparkle() { if (!live()) return; const t = T(); [0, 1, 2, 3, 4].forEach(i => bell(t + i * 0.055, 1760 * Math.pow(1.122, i), 0.05, 0.7, R(-0.5, 0.5), 0.5)); },
    found() { if (!live()) return; const t = T(); [293.7, 370, 440, 587.3].forEach((f, i) => pluck(t + i * 0.09, f, { vol: 0.22, dur: 1.6, pan: (i - 1.5) * 0.25 })); [0, 1, 2, 3, 4, 5].forEach(i => bell(t + 0.32 + i * 0.05, 2349 * Math.pow(1.06, i), 0.04, 0.8, R(-0.6, 0.6), 0.6)); os(t, 73.4, 1.2, { type: 'triangle', vol: 0.12, a: 0.02, wet: 0.3 }); },
    liftTick(p) { if (!live()) return; const t = T(); os(t, 140 + p * 220, 0.07, { type: 'triangle', vol: 0.03, wet: 0.1 }); nz(t, 0.04, { type: 'lowpass', f: 700, vol: 0.03, wet: 0 }); },
    crack() { if (!live()) return; const t = T(); nz(t, 0.18, { f: 1200, q: 0.8, vol: 0.32, f2: 400 }); for (let i = 0; i < 5; i++) nz(t + R(0.01, 0.14), 0.02, { f: R(2000, 4500), q: 4, vol: 0.12, pan: R(-0.5, 0.5) }); os(t, 90, 0.25, { vol: 0.2, f2: 50, wet: 0.2 }); try { navigator.vibrate && navigator.vibrate([30, 30, 60]); } catch (e) {} },
    whoosh() { if (!live()) return; const t = T(); nz(t, 0.45, { f: 300, q: 0.9, vol: 0.12, f2: 2400, a: 0.1, wet: 0.3 }); },
    land() { if (!live()) return; const t = T(); os(t, 150, 0.12, { vol: 0.18, f2: 70, wet: 0.2 }); nz(t, 0.08, { type: 'lowpass', f: 900, vol: 0.12 }); },
    shake() { if (!live()) return; const t = T(); for (let i = 0; i < 6; i++) nz(t + i * 0.018, 0.03, { f: R(2500, 4200), q: 5, vol: 0.07, pan: R(-0.6, 0.6), wet: 0.05 }); nz(t, 0.22, { type: 'bandpass', f: 5000, q: 0.7, vol: 0.07, a: 0.03, wet: 0.1 }); os(t, 220, 0.06, { type: 'triangle', vol: 0.04, wet: 0 }); },
    pick(n = 0) { if (!live()) return; n = Math.abs(Math.floor(n)) || 0; const t = T(); const sc = [587.3, 659.3, 740, 784, 880, 987.8, 1174.7]; bell(t, sc[n % sc.length] * 2, 0.11, 1.0, 0, 0.4); },
    snap() { if (!live()) return; const t = T(); nz(t, 0.05, { type: 'lowpass', f: 1600, vol: 0.25 }); os(t, 420, 0.08, { type: 'triangle', vol: 0.12 }); bell(t + 0.06, 1320, 0.06, 0.6, 0, 0.4); },
    wrong() { if (!live()) return; const t = T(); os(t, 196, 0.22, { type: 'square', vol: 0.05, f2: 147, wet: 0.1 }); os(t, 207, 0.22, { type: 'square', vol: 0.04, f2: 155, wet: 0.1 }); try { navigator.vibrate && navigator.vibrate(40); } catch (e) {} },
    glyph(k) { if (!live()) return; k = Math.abs(Math.floor(k)) || 0; const t = T(), sc = [293.7, 311.1, 370, 392, 440, 466.2]; bell(t, sc[k % 6] * 2, 0.1, 1.3, (k - 2.5) * 0.15, 0.45); pluck(t, sc[k % 6], { vol: 0.14, dur: 1.0 }); },
    roll(p) { if (!live()) return; const t = T(); nz(t, 0.08, { type: 'lowpass', f: 300 + p * 300, vol: 0.09, wet: 0.05 }); if (Math.random() < 0.3) nz(t, 0.03, { f: 1800, q: 3, vol: 0.03, wet: 0 }); },
    smudge() { if (!live()) return; const t = T(); nz(t, 0.25, { type: 'lowpass', f: 1400, f2: 180, vol: 0.2, q: 6 }); os(t, 120, 0.2, { vol: 0.08, f2: 70 }); },
    thunk() { if (!live()) return; const t = T(); os(t, 130, 0.22, { vol: 0.28, f2: 62, wet: 0.25 }); nz(t, 0.09, { type: 'lowpass', f: 900, vol: 0.22 }); nz(t + 0.03, 0.05, { f: 2200, q: 2, vol: 0.06 }); try { navigator.vibrate && navigator.vibrate(25); } catch (e) {} },
    coin() { if (!live()) return; const t = T(); bell(t, 1975, 0.1, 0.9); bell(t + 0.09, 2637, 0.09, 1.1); },
    kneel() { if (!live()) return; const t = T(); nz(t, 0.12, { type: 'lowpass', f: 900, vol: 0.12 }); setTimeout(() => S.scrape(0.8), 120); setTimeout(() => S.crumble(), 260); },
    lamp(on) { if (!live()) return; const t = T(); os(t, on ? 1200 : 700, 0.05, { type: 'square', vol: 0.03, wet: 0 }); if (on) nz(t + 0.03, 0.25, { type: 'lowpass', f: 600, vol: 0.05, a: 0.05 }); },
    step() { if (!live()) return; const t = T(); nz(t, R(0.05, 0.08), { type: 'lowpass', f: R(500, 800), vol: 0.07, wet: 0.08, pan: R(-0.15, 0.15) }); },
    click() { if (!live()) return; const t = T(); os(t, 1500, 0.03, { type: 'triangle', vol: 0.04, wet: 0 }); },
    cart() { if (!live()) return; const t = T(); for (let i = 0; i < 10; i++) { nz(t + i * 0.22, 0.18, { type: 'lowpass', f: 260, vol: 0.09, wet: 0.1 }); if (i % 3 === 0) os(t + i * 0.22 + 0.1, R(520, 640), 0.12, { type: 'sawtooth', vol: 0.015, f2: R(480, 560), wet: 0.15 }); } },
    react(level) { if (!live()) return; const t = T(), P = (fs, gap, v = 0.22, d = 1.8) => fs.forEach((f, i) => pluck(t + i * gap, f, { vol: v, dur: d, pan: (i - fs.length / 2) * 0.15 }));
      if (level === 'thrilled') { P([293.7, 370, 440, 587.3, 740, 880], 0.08); [0, 1, 2, 3, 4, 5, 6].forEach(i => bell(t + 0.5 + i * 0.06, 1760 * Math.pow(1.122, i % 5), 0.05, 0.9, R(-0.7, 0.7), 0.6)); drum(t, 'dum', 0.5); drum(t + 0.48, 'dum', 0.5); }
      else if (level === 'happy') { P([293.7, 370, 440, 587.3], 0.1); bell(t + 0.45, 1174.7, 0.06, 1.0); }
      else if (level === 'okay') P([293.7, 392], 0.14, 0.18);
      else { P([440, 392, 311.1, 293.7], 0.16, 0.18, 1.4); os(t + 0.6, 73.4, 0.8, { type: 'triangle', vol: 0.08 }); } },
    dayEnd() { if (!live()) return; const t = T(); [293.7, 370, 440, 587.3, 740, 880, 1174.7].forEach((f, i) => pluck(t + i * 0.11, f, { vol: 0.2, dur: 2.2 })); for (let i = 0; i < 4; i++) drum(t + i * 0.22, i % 2 ? 'tek' : 'dum', 0.5); bell(t + 0.9, 1174.7, 0.08, 2); }
  };
  function crackle() { if (!live()) return; crackT -= 0.06; if (crackT > 0) return; crackT = R(0.08, 0.5); const t = T(); nz(t, 0.012, { f: R(1800, 5000), q: 2, vol: R(0.008, 0.022), pan: R(-0.9, 0.9), wet: 0.3 }); }
  // ---------- MUSIC ----------
  const HZ = [146.8, 155.6, 185, 196, 220, 233.1, 261.6, 293.7, 311.1, 370, 392, 440, 466.2, 523.3, 587.3];   // D Hijaz, D3..D5
  const BPM = 96, E8 = 60 / BPM / 2; // eighth notes
  const MAQSUM = ['D', 0, 'T', 'T', 'D', 0, 'T', 0], CALM = ['D', 0, 0, 'T', 0, 0, 'T', 0];
  const OUD = [[7, 0, 4, 0, 7, 9, 8, 7], [5, 0, 4, 0, 3, 2, 3, 4], [7, 0, 4, 0, 7, 9, 10, 9], [8, 7, 5, 4, 3, 2, 1, 0]];
  let drone = null, mel = { pos: 9, rest: 0 };
  function drum(t, k, v = 1) { if (k === 'D') { os(t, 105, 0.32, { vol: 0.32 * v, f2: 52, bus: musBus, wet: 0.2 }); nz(t, 0.06, { type: 'lowpass', f: 500, vol: 0.12 * v, bus: musBus, wet: 0.1 }); } else if (k === 'dum') { os(t, 105, 0.32, { vol: 0.3 * v, f2: 52, wet: 0.2 }); nz(t, 0.06, { type: 'lowpass', f: 500, vol: 0.12 * v, wet: 0.1 }); } else { const bus = k === 'tek' ? sfxBus : musBus; nz(t, 0.045, { f: 3200, q: 1.6, vol: 0.13 * v, bus, wet: 0.15, pan: 0.2 }); os(t, 820, 0.03, { type: 'triangle', vol: 0.03 * v, bus, wet: 0 }); } }
  function startDrone() { if (drone) return; const t = T(), g = ctx.createGain(); g.gain.value = 0; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700; g.connect(f); route(f, { bus: musBus, wet: 0.3 });
    const nodes = [73.4, 110, 146.8].map((fr, i) => { const o = ctx.createOscillator(); o.type = i === 1 ? 'triangle' : 'sawtooth'; o.frequency.value = fr; o.detune.value = R(-6, 6); const og = ctx.createGain(); og.gain.value = [0.16, 0.1, 0.05][i]; o.connect(og); og.connect(g); o.start(); return o; });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08; const lg = ctx.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); drone = { g, nodes, lfo }; g.gain.setTargetAtTime(0.5, t, 2); }
  function ney(t, freq, dur, v = 0.12) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq * 0.985, t); o.frequency.linearRampToValueAtTime(freq, t + 0.12); const vib = ctx.createOscillator(); vib.frequency.value = 5.2; const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(freq * 0.012, t + dur * 0.6); vib.connect(vg); vg.connect(o.frequency);
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2; const g2 = ctx.createGain(); g2.gain.value = 0.15; o2.connect(g2); const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.09); g.gain.setValueAtTime(v * 0.85, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g2.connect(g); route(g, { bus: musBus, wet: 0.45, pan: -0.15 });
    nz(t, dur * 0.9, { f: freq * 2, q: 6, vol: v * 0.35, a: 0.06, bus: musBus, wet: 0.4, pan: -0.15 }); [o, o2, vib].forEach(x => { x.start(t); x.stop(t + dur + 0.05); }); }
  function schedule() { if (mode === 'off') { nextT = T() + 0.1; return; } while (nextT < T() + 0.25) { playStep(nextT, step, bar); step++; if (step >= 8) { step = 0; bar++; } nextT += E8; } }
  function playStep(t, s, b) { const work = mode === 'work', pat = work ? MAQSUM : CALM, k = pat[s];
    if (k) drum(t, k === 'D' ? 'D' : 'T', work ? 0.8 : 0.55);
    if (work && s % 2 === 1 && Math.random() < 0.25) drum(t, 'T', 0.25);
    const ou = OUD[b % 4][s]; if (work ? true : s % 2 === 0) { if (ou || s === 0) pluck(t, HZ[ou], { vol: work ? 0.16 : 0.12, dur: work ? 0.9 : 1.6, bright: work ? 2400 : 1600, bus: musBus, pan: 0.25, wet: 0.3 }); }
    // ney melody: phrases of 2 bars, then 2 bars rest (calm) / sparse (work)
    const phrase = Math.floor(b / 2) % 2 === 0; if (phrase && (s === 0 || s === 3 || s === 6) && Math.random() < (work ? 0.45 : 0.8)) { const moves = [-2, -1, -1, 0, 1, 1, 2]; mel.pos = Math.max(6, Math.min(14, mel.pos + moves[Math.floor(Math.random() * moves.length)])); const len = s === 6 ? E8 * 2.5 : E8 * (Math.random() < 0.5 ? 3 : 2); ney(t, HZ[mel.pos], len, work ? 0.07 : 0.1); }
    if (b % 8 === 7 && s === 7 && !work) bell(t, 587.3 * 2, 0.03, 1.5, 0.4, 0.6, musBus); }
  function setMode(m) { want = m; if (!ctx) return; const target = musicOn ? m : 'off'; if (target === mode) return; const t = T(); mode = target;
    if (mode === 'off') { musBus.gain.setTargetAtTime(0, t, 0.5); if (drone) drone.g.gain.setTargetAtTime(0, t, 0.6); }
    else { startDrone(); musBus.gain.setTargetAtTime(mode === 'work' ? 0.55 : 0.7, t, 0.8); drone.g.gain.setTargetAtTime(mode === 'work' ? 0.3 : 0.5, t, 1.5); if (roomG) roomG.gain.setTargetAtTime(0.05, t, 1); } }
  return { ...S, start, drum,
    music(m) { setMode(m); }, get musicOn() { return musicOn; },
    setMusicOn(v) { musicOn = !!v; try { localStorage.setItem('ur.dig.music', v ? '1' : '0'); } catch (e) {} mode = '__'; setMode(want); },
    destroy() { clearInterval(timer); try { document.removeEventListener('visibilitychange', onVis); } catch (e) {} if (drone) { try { drone.nodes.forEach(o => o.stop()); drone.lfo.stop(); } catch (e) {} } ctx = null; } };
}
