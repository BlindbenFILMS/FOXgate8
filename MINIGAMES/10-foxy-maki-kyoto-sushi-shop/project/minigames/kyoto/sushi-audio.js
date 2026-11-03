// 8 GATES — KYOTO · FOXY MAKI: SOUND + MUSIC. All synthesised in the browser (no audio files), so it ships with the shop and works offline.
//   SFX: knife slice, roll chop, rice rub/scoop, nori rustle, filling plop, bamboo-mat roll clacks, nigiri press/squash, ceramic plate clink,
//        ginger/wasabi, soy pour (loop while held), coins, register cha-ching, furin door chime for arrivals, noren swish, reactions, gong at shift end.
//   MUSIC: a generative koto band in the Japanese "in" scale (D Eb G A Bb). Koto notes are real plucked-string tones (Karplus-Strong, rendered once
//        into buffers), with a breathy shakuhachi-style flute, taiko + woodblock. Modes: 'calm' (welcome / day card), 'shift', 'rush' (last 30 s), 'off'.
// API: const AU = sushiAudio(); AU.init() on a user tap · AU.play(name, { pan, vol, pitch }) · AU.loopStart('pour') / AU.loopStop('pour')
//      AU.setMode(mode) · AU.setMute({ sfx, music }) · AU.muted() · AU.tone(freq, dur, vol, type) · AU.burst(dur, freq, vol) · AU.destroy()
export function sushiAudio() {
  let ctx = null, master, sfxBus, musBus, verbSend, noise, plucks = null, mode = 'off', timer = 0, nextT = 0, step = 0, bar = 0, phraseI = 0;
  const loops = {}, M = { sfx: true, music: true };
  try { const s = JSON.parse(localStorage.getItem('kyoto.sushi.audio') || '{}'); if (s.sfx === false) M.sfx = false; if (s.music === false) M.music = false; } catch (e) {}
  const SC = [50, 55, 57, 58, 62, 63, 67, 69, 70, 74, 75, 79, 81, 82, 86];   // D3 G3 A3 Bb3 D4 Eb4 G4 A4 Bb4 D5 Eb5 G5 A5 Bb5 D6 (in-scale)
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function init(given) {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC && !given) return;
    try { ctx = given || new AC(); } catch (e) { ctx = null; return; }
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.18; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.85; master.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = M.sfx ? 0.9 : 0; sfxBus.connect(master);
    musBus = ctx.createGain(); musBus.gain.value = M.music ? 0.26 : 0; musBus.connect(master);
    // a small wooden room: generated stereo impulse, short and warm
    const len = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < len; i++) { const t = i / len; lp += (Math.random() * 2 - 1 - lp) * 0.35; d[i] = lp * Math.pow(1 - t, 3.2) * (i < 40 ? i / 40 : 1); } }
    const verb = ctx.createConvolver(); verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = 0.32; verb.connect(vg); vg.connect(master);
    verbSend = ctx.createGain(); verbSend.gain.value = 1; verbSend.connect(verb);
    const nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; noise = nb;
    plucks = renderPlucks();
    if (given) return; document.addEventListener('visibilitychange', onVis);
    if (mode !== 'off') startClock();
  }
  const onVis = () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); };

  // ---------- Karplus-Strong koto: rendered once per scale note ----------
  function ks(freq, dur, bright, decay) { const sr = ctx.sampleRate, n = Math.floor(sr * dur), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), N = Math.max(2, Math.round(sr / freq)), ring = new Float32Array(N);
    let lp = 0; for (let i = 0; i < N; i++) { lp += (Math.random() * 2 - 1 - lp) * bright; ring[i] = lp; }
    let k = 0; for (let i = 0; i < n; i++) { const a = ring[k], c = ring[(k + 1) % N]; const y = (a * 0.5 + c * 0.5) * decay; ring[k] = y; d[i] = a; k = (k + 1) % N; }
    let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(d[i])); const g = pk ? 0.9 / pk : 1; for (let i = 0; i < n; i++) d[i] *= g * Math.min(1, (n - i) / (sr * 0.05)); return b; }
  function renderPlucks() { const o = {}; SC.forEach(m => { o[m] = ks(hz(m), m < 60 ? 2.6 : 1.9, m < 60 ? 0.5 : 0.72, m < 60 ? 0.9985 : 0.997); }); o.sawari = ks(hz(38), 1.4, 0.95, 0.996); return o; }

  // ---------- building blocks ----------
  const now = () => ctx.currentTime;
  function out(bus, pan = 0, wet = 0.25) { const g = ctx.createGain(); let n = g; if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); n = p; } n.connect(bus); if (wet) { const s = ctx.createGain(); s.gain.value = wet; n.connect(s); s.connect(verbSend); } return g; }
  function env(g, t, a, peak, d, hold = 0) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); if (hold) g.gain.setValueAtTime(Math.max(0.0002, peak), t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + d); }
  function osc(type, f, t, a, peak, d, dest, f2) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + a + d); env(g, t, a, peak, d); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + d + 0.05); return o; }
  function nz(t, dur, peak, dest, { type = 'bandpass', f = 2000, f2, q = 1, a = 0.004 } = {}) { const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; b.type = type; b.frequency.setValueAtTime(f, t); if (f2) b.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur); b.Q.value = q; env(g, t, a, peak, dur); s.connect(b); b.connect(g); g.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + dur + a + 0.05); return s; }
  function pluck(m, t, vol, dest, rate = 1) { if (!plucks) return; const key = plucks[m] ? m : SC.reduce((a, b) => Math.abs(b - m) < Math.abs(a - m) ? b : a), s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = plucks[key]; s.playbackRate.value = rate * Math.pow(2, (m - key) / 12); g.gain.value = vol; s.connect(g); g.connect(dest); s.start(t); return s; }
  function bell(t, f, vol, dest, dec = 0.6) { const ny = ctx.sampleRate * 0.45; [[1, 1], [2.76, 0.5], [5.4, 0.28], [8.93, 0.14]].forEach(([r, v]) => { if (f * r < ny) osc('sine', f * r, t, 0.002, vol * v, dec / Math.sqrt(r), dest); }); }
  function thud(t, f, vol, dest, dec = 0.12) { osc('sine', f, t, 0.003, vol, dec, dest, f * 0.5); }

  // ---------- sound effects ----------
  const SFX = {
    slice(t, d, o) { nz(t, 0.13, 0.5 * o.vol, d, { f: 7000, f2: 1800, q: 1.4 }); nz(t + 0.05, 0.05, 0.25 * o.vol, d, { type: 'highpass', f: 3500 }); thud(t + 0.06, 170, 0.35 * o.vol, d, 0.08); },
    sliced(t, d, o) { pluck(74, t, 0.5 * o.vol, d); pluck(79, t + 0.09, 0.45 * o.vol, d); },
    chop(t, d, o) { nz(t, 0.06, 0.45 * o.vol, d, { type: 'highpass', f: 2400 }); nz(t + 0.01, 0.09, 0.3 * o.vol, d, { f: 900, f2: 500, q: 2 }); thud(t + 0.03, 130, 0.55 * o.vol, d, 0.1); },
    rub(t, d, o) { nz(t, 0.11 + Math.random() * 0.05, 0.16 * o.vol, d, { f: 2200 + Math.random() * 900, q: 0.8, a: 0.02 }); },
    scoop(t, d, o) { thud(t, 210, 0.3 * o.vol, d, 0.09); nz(t, 0.16, 0.18 * o.vol, d, { f: 1600, q: 0.7, a: 0.02 }); },
    nori(t, d, o) { for (let i = 0; i < 4; i++) nz(t + i * 0.03, 0.05, (0.22 - i * 0.03) * o.vol, d, { type: 'highpass', f: 3200 + Math.random() * 1500 }); },
    plop(t, d, o) { osc('sine', 420 * o.pitch, t, 0.003, 0.4 * o.vol, 0.09, d, 210 * o.pitch); nz(t, 0.03, 0.12 * o.vol, d, { f: 1800, q: 2 }); },
    roll(t, d, o) { for (let i = 0; i < 5; i++) { const tt = t + i * 0.035; nz(tt, 0.025, (0.3 - i * 0.04) * o.vol, d, { f: 1300 + i * 90, q: 6 }); } thud(t, 110, 0.35 * o.vol, d, 0.22); },
    rolled(t, d, o) { pluck(62, t, 0.45 * o.vol, d); pluck(69, t + 0.08, 0.42 * o.vol, d); pluck(74, t + 0.16, 0.4 * o.vol, d); },
    press(t, d, o) { nz(t, 0.09, 0.32 * o.vol, d, { type: 'lowpass', f: 700, a: 0.01 }); thud(t, 160 * o.pitch, 0.3 * o.vol, d, 0.08); },
    squash(t, d, o) { nz(t, 0.22, 0.45 * o.vol, d, { type: 'lowpass', f: 500, f2: 200, a: 0.01 }); thud(t, 110, 0.4 * o.vol, d, 0.2); pluck(50, t + 0.05, 0.4 * o.vol, d, 0.97); },
    plate(t, d, o) { bell(t, 1650 * o.pitch, 0.22 * o.vol, d, 0.45); thud(t, 300, 0.18 * o.vol, d, 0.05); },
    garnish(t, d, o) { osc('sine', 880 * o.pitch, t, 0.003, 0.25 * o.vol, 0.08, d, 1300 * o.pitch); bell(t + 0.02, 2600 * o.pitch, 0.06 * o.vol, d, 0.2); },
    coin(t, d, o) { const f = 2300 * o.pitch; bell(t, f, 0.2 * o.vol, d, 0.35); bell(t + 0.07, f * 1.06, 0.12 * o.vol, d, 0.25); nz(t, 0.02, 0.15 * o.vol, d, { type: 'highpass', f: 5000 }); },
    register(t, d, o) { nz(t, 0.18, 0.2 * o.vol, d, { type: 'lowpass', f: 900, a: 0.02 }); bell(t + 0.12, 2100, 0.22 * o.vol, d, 0.5); bell(t + 0.22, 2800, 0.22 * o.vol, d, 0.8); },
    drawer(t, d, o) { nz(t, 0.2, 0.18 * o.vol, d, { type: 'lowpass', f: 700, f2: 300, a: 0.03 }); thud(t + 0.18, 140, 0.25 * o.vol, d, 0.06); },
    chime(t, d, o) { const fs = [2349, 2794, 3136, 3520]; for (let i = 0; i < 3; i++) { const f = fs[(i + Math.floor(Math.random() * 4)) % 4]; bell(t + i * 0.13 + Math.random() * 0.04, f, 0.11 * o.vol, d, 1.4); } },
    noren(t, d, o) { nz(t, 0.35, 0.16 * o.vol, d, { type: 'lowpass', f: 1400, f2: 500, a: 0.08 }); },
    ui(t, d, o) { osc('sine', 1650 * o.pitch, t, 0.002, 0.22 * o.vol, 0.045, d, 1350 * o.pitch); nz(t, 0.015, 0.2 * o.vol, d, { f: 2400, q: 2 }); },
    good(t, d, o) { pluck(69, t, 0.45 * o.vol, d); pluck(74, t + 0.07, 0.5 * o.vol, d); },
    bad(t, d, o) { const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = plucks && plucks.sawari; b.type = 'lowpass'; b.frequency.value = 1200; g.gain.value = 0.5 * o.vol; if (s.buffer) { s.connect(b); b.connect(g); g.connect(d); s.start(t); } osc('square', 98, t, 0.005, 0.07 * o.vol, 0.25, d, 82); },
    serve(t, d, o) { [62, 67, 69, 74].forEach((m, i) => pluck(m, t + i * 0.07, 0.42 * o.vol, d)); bell(t + 0.3, 2349, 0.08 * o.vol, d, 1); },
    thrilled(t, d, o) { [62, 63, 67, 69, 70, 74, 79, 81].forEach((m, i) => pluck(m, t + i * 0.045, 0.38 * o.vol, d)); bell(t + 0.38, 3136, 0.1 * o.vol, d, 1.4); taiko(t + 0.36, 0.5 * o.vol, d); },
    happy(t, d, o) { [67, 69, 74].forEach((m, i) => pluck(m, t + i * 0.08, 0.42 * o.vol, d)); },
    neutral(t, d, o) { pluck(69, t, 0.4 * o.vol, d); pluck(67, t + 0.12, 0.35 * o.vol, d); },
    unhappy(t, d, o) { pluck(63, t, 0.42 * o.vol, d); pluck(58, t + 0.14, 0.4 * o.vol, d); },
    insulted(t, d, o) { [70, 63, 58, 50].forEach((m, i) => pluck(m, t + i * 0.09, 0.42 * o.vol, d)); taiko(t + 0.3, 0.7 * o.vol, d); },
    leave(t, d, o) { pluck(58, t, 0.4 * o.vol, d); pluck(55, t + 0.18, 0.38 * o.vol, d); SFX.noren(t + 0.2, d, o); },
    start(t, d, o) { taiko(t, 0.8 * o.vol, d); taiko(t + 0.28, 0.6 * o.vol, d); SFX.chime(t + 0.5, d, o); },
    gong(t, d, o) { [[110, 1], [167, 0.6], [263, 0.4], [391, 0.25], [554, 0.15]].forEach(([f, v]) => osc('sine', f, t, 0.01, 0.3 * v * o.vol, 3.2, d, f * 0.985)); nz(t, 0.25, 0.15 * o.vol, d, { type: 'lowpass', f: 600 }); },
    upgrade(t, d, o) { [74, 79, 81, 86].forEach((m, i) => pluck(m, t + i * 0.06, 0.4 * o.vol, d)); bell(t + 0.25, 3520, 0.08 * o.vol, d, 1); },
    tick(t, d, o) { osc('sine', 2100 * o.pitch, t, 0.002, 0.3 * o.vol, 0.05, d, 1800 * o.pitch); nz(t, 0.012, 0.25 * o.vol, d, { f: 3200, q: 2 }); },
    restock(t, d, o) { thud(t, 120, 0.35 * o.vol, d, 0.12); nz(t, 0.05, 0.15 * o.vol, d, { type: 'highpass', f: 4000 }); },
    bin(t, d, o) { nz(t, 0.2, 0.3 * o.vol, d, { type: 'lowpass', f: 900, f2: 200 }); thud(t + 0.08, 90, 0.4 * o.vol, d, 0.15); },
  };
  function taiko(t, vol, dest) { osc('sine', 92, t, 0.004, 0.9 * vol, 0.42, dest, 52); nz(t, 0.08, 0.35 * vol, dest, { type: 'lowpass', f: 380 }); osc('triangle', 180, t, 0.002, 0.18 * vol, 0.06, dest, 110); }
  const GAIN = { rub: 3, press: 2.5, scoop: 2.5, nori: 2.2, plop: 1.8, garnish: 2.5, noren: 2.5, roll: 2.2, restock: 2, plate: 1.6, slice: 1.4, chop: 1.4, drawer: 1.2, coin: 1.3 };
  const live = () => !(typeof OfflineAudioContext !== 'undefined' && ctx instanceof OfflineAudioContext);
  function play(name, o = {}) { if (!ctx || !M.sfx || !SFX[name]) return; if (ctx.state === 'suspended' && live()) ctx.resume(); const opts = { vol: (o.vol ?? 1) * (GAIN[name] || 1), pitch: o.pitch ?? (0.97 + Math.random() * 0.06), pan: o.pan ?? 0 }; try { SFX[name](now() + 0.005, out(sfxBus, opts.pan, name === 'chime' || name === 'gong' ? 0.5 : 0.22), opts); } catch (e) {} }

  // ---------- loops (held actions) ----------
  function loopStart(name) { if (!ctx || !M.sfx || loops[name]) return; const t = now();
    if (name === 'pour') { const s = ctx.createBufferSource(), b = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(); s.buffer = noise; s.loop = true; b.type = 'bandpass'; b.Q.value = 7; b.frequency.value = 650; lfo.type = 'triangle'; lfo.frequency.value = 9; lg.gain.value = 260; lfo.connect(lg); lg.connect(b.frequency); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.08); s.connect(b); b.connect(g); g.connect(out(sfxBus, 0.1, 0.2)); s.start(t); lfo.start(t); loops.pour = { s, g, lfo, glug: setInterval(() => { if (ctx) osc('sine', 260 + Math.random() * 160, now(), 0.004, 0.14, 0.06, out(sfxBus, 0.1, 0.1), 160); }, 120) }; } }
  function loopStop(name) { const L = loops[name]; if (!L) return; delete loops[name]; clearInterval(L.glug); const t = now(); try { L.g.gain.cancelScheduledValues(t); L.g.gain.setValueAtTime(Math.max(0.0002, L.g.gain.value), t); L.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); L.s.stop(t + 0.15); L.lfo.stop(t + 0.15); } catch (e) {} }

  // ---------- music: generative koto band ----------
  // 16th-step phrases over SC indexes (null = rest). A, B, A, C, then D as a turnaround; every bar gets a bass koto note.
  const PH = [
    [9, null, 8, null, 7, null, 6, null, 7, null, null, null, 4, null, null, null],
    [6, 7, 8, null, 9, null, 8, 7, 6, null, 5, null, 4, null, null, null],
    [9, null, 8, null, 7, null, 6, null, 7, null, null, null, 4, null, null, null],
    [4, null, 6, null, 7, 8, 9, null, 10, null, 9, null, 8, 7, 6, null],
    [9, null, null, 10, 9, null, 8, null, 7, null, 6, null, 5, null, 4, null],
    [11, null, 10, 9, null, 8, null, null, 9, 8, 7, null, 6, null, null, null],
    [6, null, 7, null, 9, null, 7, null, 6, null, 5, 6, 4, null, null, null],
    [4, null, null, null, 6, null, 7, null, 8, null, 9, null, 11, null, 9, null]];
  const BASS = [0, 0, 1, 2, 0, 1, 2, 0];
  const BPM = { calm: 72, shift: 92, rush: 112 };
  function setMode(m) { if (m === mode) return; mode = m; if (!ctx) return; if (m === 'off') stopClock(); else startClock(); }
  function startClock() { if (timer || !ctx) return; nextT = now() + 0.12; step = 0; timer = setInterval(sched, 40); }
  function stopClock() { clearInterval(timer); timer = 0; }
  function flute(t, m, dur, vol) { const d = out(musBus, -0.2, 0.55), f = hz(m), o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), vib = ctx.createOscillator(), vg = ctx.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2; vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.6); vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g); o.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.25); g.gain.setValueAtTime(vol, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); g.connect(d); nz(t, dur * 0.9, vol * 0.5, d, { f: f * 2, q: 3, a: 0.2 });
    o.start(t); o2.start(t); vib.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05); vib.stop(t + dur + 0.05); }
  function sched(horizon = 0.25) { if (!ctx || mode === 'off') return; const spb = 60 / BPM[mode] / 4;
    while (nextT < now() + horizon) { const t = nextT, s = step % 16, ph = PH[[0, 1, 2, 3, 0, 4, 5, 6, 0, 1, 7, 4][phraseI % 12]], d = out(musBus, 0.25, 0.4);
      if (s === 0) { pluck(SC[BASS[bar % 8]], t, mode === 'calm' ? 0.5 : 0.6, out(musBus, -0.15, 0.3)); if (mode === 'calm' && bar % 4 === 0) flute(t + spb * 2, SC[[6, 7, 9, 7][(bar / 4) % 4 | 0]], spb * 26, 0.07); }
      const n = ph[s]; if (n != null && (mode !== 'calm' || s % 2 === 0)) { pluck(SC[n], t + (Math.random() - 0.5) * 0.008, 0.36 + Math.random() * 0.08, d); if (mode === 'rush' && s % 4 === 0) pluck(SC[Math.min(SC.length - 1, n + 2)], t + spb * 0.5, 0.22, d); }
      if (mode !== 'calm') { const dd = out(musBus, 0, 0.15); if (s === 0 || s === 8) taiko(t, mode === 'rush' ? 0.42 : 0.32, dd); if (s === 12 && bar % 2) taiko(t, 0.18, dd); if (s % 4 === 2) nz(t, 0.025, mode === 'rush' ? 0.14 : 0.09, dd, { f: 1900, q: 9 }); if (mode === 'rush' && s % 2 === 1) nz(t, 0.02, 0.05, dd, { type: 'highpass', f: 6000 }); }
      nextT += spb * (s % 2 ? 0.94 : 1.06); step++; if (step % 16 === 0) { bar++; if (bar % 2 === 0) phraseI++; } } }

  function setMute(m) { Object.assign(M, m); try { localStorage.setItem('kyoto.sushi.audio', JSON.stringify(M)); } catch (e) {} if (!ctx) return; sfxBus.gain.setTargetAtTime(M.sfx ? 0.9 : 0, now(), 0.05); musBus.gain.setTargetAtTime(M.music ? 0.26 : 0, now(), 0.1); if (!M.sfx) Object.keys(loops).forEach(loopStop); }
  function tone(f, dur, vol, type = 'triangle') { if (!ctx || !M.sfx) return; osc(type, f, now(), 0.008, vol * 3, dur, out(sfxBus, 0, 0.15)); }
  function burst(dur, f, vol) { if (!ctx || !M.sfx) return; nz(now(), dur, vol * 2, out(sfxBus, 0, 0.1), { type: 'lowpass', f }); }
  function destroy() { stopClock(); Object.keys(loops).forEach(loopStop); document.removeEventListener('visibilitychange', onVis); try { ctx && ctx.close(); } catch (e) {} ctx = null; }
  return { _schedTo(sec, m) { mode = m; nextT = 0.1; step = 0; sched(sec); }, init, play, loopStart, loopStop, setMode, setMute, muted: () => ({ ...M }), tone, burst, destroy, get ctx() { return ctx; } };
}
