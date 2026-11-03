// 8 GATES — NEBO · THE CANDY SHOP · AUDIO. Every sound is synthesized live with Web Audio (no files needed, phone friendly).
//   const CA = candyAudio({ musicUrl })   → CA.unlock() on the first tap (iOS/Android need a gesture)
//   CA.play(name, { v, x })               → one-shot sound effect (names listed in SFX below)
//   CA.loop(name, level 0..1)             → continuous beds: 'boil', 'burner', 'pipe', 'warm', 'room'
//   CA.song('shop' | 'shift' | null)      → the music: a music-box waltz for the shop floor, a livelier arrangement for the shift
//   CA.jingle('day' | 'thrilled')         → short fanfares over the music
//   CA.setMuted(bool), CA.setMusic(bool), CA.setSfx(bool), CA.duck(sec)
// If musicUrl points at a real MP3 (the 2D game's nebo/NEBO-CANDY.mp3), it plays instead of the synth score.
// Signal path: voices → sfx / music / loop buses → (dry + small-room reverb) → compressor → speakers.
export function candyAudio({ musicUrl = null } = {}) {
  let ctx = null, master, comp, sfxBus, musicBus, loopBus, verb, verbIn, noiseW, noiseB, muted = false, musicOn = true, sfxOn = true;
  const loops = {}, M = { song: null, next: 0, bar: 0, tempo: 0, el: null, mp3: false, mp3Ok: null };
  const r = (a, b) => a + Math.random() * (b - a);
  function init() { if (ctx) return true; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.18;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(comp); comp.connect(ctx.destination);
    // small wooden shop: 1.2 s decaying stereo noise impulse, pre-filtered so it is warm, not splashy
    verb = ctx.createConvolver(); const len = Math.floor(ctx.sampleRate * 1.25), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { const t = i / len; lp = lp * 0.72 + (Math.random() * 2 - 1) * 0.28; d[i] = lp * Math.pow(1 - t, 3.2) * (i < 90 ? i / 90 : 1); } }
    verb.buffer = ir; verbIn = ctx.createGain(); verbIn.gain.value = 0.32; const vOut = ctx.createGain(); vOut.gain.value = 0.55; verbIn.connect(verb); verb.connect(vOut); vOut.connect(master);
    const bus = (g, wet) => { const b = ctx.createGain(); b.gain.value = g; b.connect(master); const s = ctx.createGain(); s.gain.value = wet; b.connect(s); s.connect(verbIn); return b; };
    sfxBus = bus(sfxOn ? 0.95 : 0, 0.35); musicBus = bus(musicOn ? 0.55 : 0, 0.75); loopBus = bus(sfxOn ? 0.8 : 0, 0.15);
    const nb = (brown) => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; } return b; };
    noiseW = nb(false); noiseB = nb(true);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (!muted) ctx.resume(); });
    return true; }
  const now = () => ctx.currentTime;
  // ---------- building blocks ----------
  function env(g, t, a, peak, d, sus = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus), t + a + d); }
  function osc(type, f, t, dur, peak, out, { a = 0.005, f2 = null, det = 0, pan = 0 } = {}) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur); o.detune.value = det; env(g, t, a, peak, dur);
    let node = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; } o.connect(g); node.connect(out); o.start(t); o.stop(t + a + dur + 0.05); return o; }
  function noise(t, dur, peak, out, { type = 'bandpass', f = 1000, f2 = null, q = 1, a = 0.003, brown = false, pan = 0 } = {}) { const s = ctx.createBufferSource(); s.buffer = brown ? noiseB : noiseW; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + dur); fl.Q.value = q; const g = ctx.createGain(); env(g, t, a, peak, dur);
    let node = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); node = p; } s.connect(fl); fl.connect(g); node.connect(out); s.start(t, Math.random()); s.stop(t + a + dur + 0.05); }
  // a struck metal / glass bar: a few inharmonic partials, each with its own decay
  function strike(f, t, peak, out, partials = [[1, 1, 1.4], [2.76, 0.45, 0.6], [5.4, 0.25, 0.3], [8.93, 0.12, 0.18]]) { partials.forEach(([m, g, d]) => osc('sine', f * m, t, d, peak * g, out, { a: 0.002 })); }
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  // ---------- one-shot effects ----------
  const SFX = {
    bell(t, v) { strike(1318, t, 0.13 * v, sfxBus); strike(1568, t + 0.11, 0.1 * v, sfxBus); strike(1318, t + 0.24, 0.05 * v, sfxBus); },
    arrive(t, v) { strike(2093, t, 0.05 * v, sfxBus, [[1, 1, 0.5], [2.76, 0.3, 0.2]]); },
    click(t, v) { noise(t, 0.025, 0.12 * v, sfxBus, { type: 'highpass', f: 3000 }); osc('sine', 1800, t, 0.03, 0.04 * v, sfxBus); },
    pop(t, v) { osc('sine', r(380, 520), t, 0.07, 0.22 * v, sfxBus, { f2: r(900, 1300), a: 0.002 }); noise(t, 0.012, 0.08 * v, sfxBus, { type: 'highpass', f: 4000 }); },
    bubble(t, v) { osc('sine', r(160, 320), t, r(0.04, 0.08), 0.1 * v, loopBus, { f2: r(500, 900), a: 0.002, pan: r(-0.3, 0.3) }); },
    plop(t, v) { osc('sine', r(330, 380), t, 0.13, 0.25 * v, sfxBus, { f2: 110, a: 0.002 }); noise(t, 0.02, 0.07 * v, sfxBus, { type: 'lowpass', f: 1800 }); },
    stir(t, v) { noise(t, r(0.08, 0.14), 0.07 * v, sfxBus, { type: 'bandpass', f: r(1300, 2100), f2: r(800, 1100), q: 3 }); },
    chop(t, v) { noise(t, 0.035, 0.32 * v, sfxBus, { type: 'highpass', f: 2600, a: 0.001 }); osc('sine', 150, t, 0.09, 0.32 * v, sfxBus, { f2: 70, a: 0.001 }); osc('triangle', 2400, t + 0.005, 0.05, 0.03 * v, sfxBus); },
    stretch(t, v) { const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(260, t + 0.32);
      fl.type = 'lowpass'; fl.Q.value = 9; fl.frequency.setValueAtTime(300, t); fl.frequency.exponentialRampToValueAtTime(1500, t + 0.3); lfo.frequency.value = 16; lg.gain.value = 9; lfo.connect(lg); lg.connect(o.frequency); env(g, t, 0.03, 0.1 * v, 0.32); o.connect(fl); fl.connect(g); g.connect(sfxBus); o.start(t); lfo.start(t); o.stop(t + 0.4); lfo.stop(t + 0.4); },
    fold(t, v) { noise(t, 0.16, 0.22 * v, sfxBus, { type: 'bandpass', f: 900, f2: 220, q: 2.5, brown: true }); osc('sine', 120, t, 0.12, 0.2 * v, sfxBus, { f2: 70 }); },
    squeeze(t, v) { noise(t, 0.12, 0.12 * v, sfxBus, { type: 'bandpass', f: 500, f2: 900, q: 4, brown: true }); },
    shake(t, v) { for (let i = 0; i < 6; i++) noise(t + i * 0.014 + r(0, 0.006), 0.018, r(0.05, 0.1) * v, sfxBus, { type: 'highpass', f: r(5000, 8000), a: 0.001, pan: r(-0.4, 0.4) }); },
    roll(t, v) { noise(t, 0.12, 0.06 * v, sfxBus, { type: 'lowpass', f: 600, brown: true }); },
    poof(t, v) { noise(t, 0.35, 0.16 * v, sfxBus, { type: 'lowpass', f: 2400, f2: 400, a: 0.03 }); },
    whoosh(t, v) { noise(t, 0.45, 0.18 * v, sfxBus, { type: 'bandpass', f: 300, f2: 2400, q: 0.8, a: 0.08 }); osc('sine', 90, t, 0.4, 0.08 * v, sfxBus, { a: 0.05 }); },
    off(t, v) { noise(t, 0.5, 0.2 * v, sfxBus, { type: 'lowpass', f: 3000, f2: 300, a: 0.01 }); osc('triangle', 440, t, 0.18, 0.06 * v, sfxBus, { f2: 220 }); },
    hiss(t, v) { noise(t, 0.6, 0.12 * v, sfxBus, { type: 'highpass', f: 3500, a: 0.02 }); },
    zip(t, v) { noise(t, 0.16, 0.16 * v, sfxBus, { type: 'bandpass', f: 800, f2: 5000, q: 6, a: 0.005 }); },
    slide(t, v) { noise(t, 0.28, 0.12 * v, sfxBus, { type: 'lowpass', f: 900, f2: 300, a: 0.03 }); },
    coin(t, v) { strike(2637, t, 0.08 * v, sfxBus, [[1, 1, 0.6], [2.4, 0.4, 0.3], [4.1, 0.2, 0.15]]); strike(3136, t + 0.07, 0.07 * v, sfxBus, [[1, 1, 0.7], [2.4, 0.4, 0.3]]); },
    register(t, v) { noise(t, 0.05, 0.15 * v, sfxBus, { type: 'bandpass', f: 1800, q: 2 }); SFX.coin(t + 0.06, v); },
    step(t, v) { [0, 7].forEach((s, i) => strike(hz(79 + s), t + i * 0.08, 0.05 * v, sfxBus, [[1, 1, 0.5], [3.01, 0.2, 0.2]])); },
    good(t, v) { [0, 4, 7, 12].forEach((s, i) => strike(hz(84 + s), t + i * 0.055, 0.06 * v, sfxBus, [[1, 1, 0.8], [2.76, 0.25, 0.3]])); },
    sparkle(t, v) { for (let i = 0; i < 7; i++) strike(hz(91 + [0, 4, 7, 11, 12, 16, 19][i]), t + i * 0.035, 0.03 * v, sfxBus, [[1, 1, 0.4]]); },
    bad(t, v) { osc('triangle', 220, t, 0.25, 0.12 * v, sfxBus, { f2: 150 }); osc('sine', 110, t, 0.3, 0.12 * v, sfxBus, { f2: 80 }); },
    happy(t, v) { [0, 4, 7].forEach((s, i) => { osc('triangle', hz(72 + s), t + i * 0.09, 0.25, 0.08 * v, sfxBus); osc('sine', hz(84 + s), t + i * 0.09, 0.2, 0.03 * v, sfxBus); }); },
    sad(t, v) { [4, 2, -1].forEach((s, i) => osc('triangle', hz(67 + s), t + i * 0.14, 0.3, 0.07 * v, sfxBus)); },
    footstep(t, v) { noise(t, 0.06, 0.06 * v, sfxBus, { type: 'lowpass', f: r(380, 520), brown: true, a: 0.002 }); osc('sine', r(70, 90), t, 0.05, 0.05 * v, sfxBus); },
    hop(t, v) { osc('sine', 260, t, 0.16, 0.08 * v, sfxBus, { f2: 520 }); },
    wave(t, v) { osc('sine', hz(88), t, 0.12, 0.04 * v, sfxBus); osc('sine', hz(93), t + 0.1, 0.18, 0.04 * v, sfxBus); },
    page(t, v) { noise(t, 0.09, 0.08 * v, sfxBus, { type: 'bandpass', f: 2600, f2: 1400, q: 1.2 }); },
  };
  function play(name, o = {}) { if (!ctx || muted || !sfxOn) return; const f = SFX[name]; if (!f) return; try { f(now() + (o.d || 0), o.v ?? 1); } catch (e) {} }
  // ---------- continuous beds ----------
  function makeLoop(name) { const g = ctx.createGain(); g.gain.value = 0; g.connect(loopBus); const L = { g, level: 0, srcs: [], t: 0 };
    const src = (brown, type, f, q) => { const s = ctx.createBufferSource(); s.buffer = brown ? noiseB : noiseW; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; s.connect(fl); fl.connect(g); s.start(0, Math.random()); L.srcs.push(s); return fl; };
    if (name === 'boil') { L.rumble = src(true, 'lowpass', 260, 0.7); L.fizz = src(false, 'bandpass', 2600, 0.9); }
    else if (name === 'burner') { src(false, 'highpass', 4200, 0.6); src(true, 'lowpass', 180, 0.6); }
    else if (name === 'pipe') { L.f = src(true, 'bandpass', 620, 3.5); }
    else if (name === 'warm') { src(true, 'lowpass', 220, 0.8); const o = ctx.createOscillator(); o.frequency.value = 98; const og = ctx.createGain(); og.gain.value = 0.15; o.connect(og); og.connect(g); o.start(); L.srcs.push(o); }
    else if (name === 'room') { src(true, 'lowpass', 340, 0.5); }
    return L; }
  function loop(name, level) { if (!ctx) return; const L = loops[name] || (level > 0.001 ? (loops[name] = makeLoop(name)) : null); if (!L) return; level = Math.max(0, Math.min(1, level)); L.level = level;
    const peak = { boil: 0.5, burner: 0.07, pipe: 0.35, warm: 0.3, room: 0.06 }[name] || 0.2; L.g.gain.setTargetAtTime(muted || !sfxOn ? 0 : level * peak, now(), 0.08);
    if (name === 'boil' && L.rumble) { L.rumble.frequency.setTargetAtTime(160 + level * 260, now(), 0.2); L.fizz.frequency.setTargetAtTime(1800 + level * 1600, now(), 0.2); } }
  function tickLoops(dt) { const B = loops.boil; if (B && B.level > 0.02 && sfxOn && !muted) { B.t -= dt; if (B.t <= 0) { B.t = 0.25 / (0.4 + B.level * 3) * r(0.3, 1.4); SFX.bubble(now(), 0.4 + B.level); } }
    const P = loops.pipe; if (P && P.f && P.level > 0) P.f.frequency.setTargetAtTime(500 + Math.random() * 400, now(), 0.05); }
  // ---------- music ----------
  // The theme in C major, 3/4. Bars of [chord root midi, chord quality], melody as [bar, beat, scale step, beats].
  const SCALE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84];
  const PROG_A = [[48, 'M'], [45, 'm'], [53, 'M'], [43, 'M'], [48, 'M'], [45, 'm'], [50, 'm'], [43, 'M']];
  const PROG_B = [[53, 'M'], [52, 'm'], [50, 'm'], [43, 'M'], [53, 'M'], [55, 'M'], [43, 'M'], [48, 'M']];
  const MEL_A = [[0, 0, 4, 1], [0, 1, 7, 1], [0, 2, 9, 1], [1, 0, 8, 2], [1, 2, 7, 1], [2, 0, 5, 1], [2, 1, 7, 1], [2, 2, 10, 1], [3, 0, 9, 2], [3, 2, 6, 1],
    [4, 0, 4, 1], [4, 1, 7, 1], [4, 2, 11, 1], [5, 0, 10, 1], [5, 1, 9, 1], [5, 2, 8, 1], [6, 0, 8, 1], [6, 1, 9, 1], [6, 2, 6, 1], [7, 0, 7, 3]];
  const MEL_B = [[0, 0, 10, 2], [0, 2, 9, 1], [1, 0, 8, 1], [1, 1, 9, 1], [1, 2, 7, 1], [2, 0, 8, 2], [2, 2, 5, 1], [3, 0, 6, 3],
    [4, 0, 10, 1], [4, 1, 12, 1], [4, 2, 10, 1], [5, 0, 11, 1], [5, 1, 9, 1], [5, 2, 6, 1], [6, 0, 8, 1], [6, 1, 6, 1], [6, 2, 4, 1], [7, 0, 7, 3]];
  const chord = (root, q) => [root, root + (q === 'm' ? 3 : 4), root + 7];
  function musicBox(f, t, v) { // music box tine: sine + a bright, quickly dying 3rd partial
    osc('sine', f, t, 1.1, 0.07 * v, musicBus, { a: 0.002 }); osc('sine', f * 2, t, 0.45, 0.025 * v, musicBus, { a: 0.002 }); osc('sine', f * 3.01, t, 0.12, 0.018 * v, musicBus, { a: 0.001 }); }
  function celesta(f, t, d, v) { osc('triangle', f, t, d, 0.03 * v, musicBus, { a: 0.003 }); osc('sine', f * 4, t, 0.08, 0.008 * v, musicBus, { a: 0.001 }); }
  function pizz(f, t, v) { const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.setValueAtTime(1400, t); fl.frequency.exponentialRampToValueAtTime(220, t + 0.25); env(g, t, 0.004, 0.11 * v, 0.32); o.connect(fl); fl.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.45); }
  function pad(notes, t, d, v) { notes.forEach((m, i) => { const fl = ctx.createBiquadFilter(), g = ctx.createGain(); fl.type = 'lowpass'; fl.frequency.value = 900; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.012 * v, t + d * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + d); fl.connect(g); g.connect(musicBus);
      for (const det of [-7, 7]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m + 12); o.detune.value = det; o.connect(fl); o.start(t); o.stop(t + d + 0.05); } }); }
  function shaker(t, v) { noise(t, 0.05, 0.03 * v, musicBus, { type: 'highpass', f: 7000, a: 0.008 }); }
  function block(t, v, hi) { noise(t, 0.03, 0.06 * v, musicBus, { type: 'bandpass', f: hi ? 1900 : 1300, q: 8, a: 0.001 }); }
  function scheduleBar(t, bar, song) { const spb = 60 / M.tempo, sec = Math.floor(bar / 8) % 4, b = bar % 8, B = sec === 1 || sec === 3, prog = B ? PROG_B : PROG_A, mel = B ? MEL_B : MEL_A, [root, q] = prog[b], ch = chord(root, q), shift = song === 'shift';
    pizz(hz(root - 12), t, 1); pizz(hz(ch[1]), t + spb, 0.55); pizz(hz(ch[2]), t + spb * 2, 0.55);
    if (sec >= 2 || shift) pad(ch, t, spb * 3, shift ? 0.8 : 1);
    mel.filter(n => n[0] === b).forEach(([, beat, st, d]) => { const f = hz(SCALE[st]), at = t + beat * spb; musicBox(f, at, 1); if (sec === 3 || (shift && sec === 2)) celesta(f * 2, at + spb * 0.5, spb * d, 0.6); });
    if (shift) { for (let i = 0; i < 6; i++) shaker(t + i * spb / 2, i % 2 ? 0.5 : 1); block(t, 1, true); block(t + spb, 0.6); block(t + spb * 2, 0.6); }
    else if (sec >= 1) ch.forEach((m, i) => celesta(hz(m + 24), t + spb * (0.5 + i * 0.75), 0.3, 0.35)); }
  function song(name) { if (name === M.song) return; M.song = name; if (!ctx) return;
    if (M.el) { M.el.pause(); } if (!name) return; M.tempo = name === 'shift' ? 132 : 104; M.next = Math.max(now() + 0.1, M.next);
    if (musicUrl && M.mp3Ok !== false) { if (!M.el) { M.el = new Audio(musicUrl); M.el.loop = true; M.el.crossOrigin = 'anonymous'; M.el.addEventListener('error', () => { M.mp3Ok = false; M.el = null; M.next = now() + 0.1; }); try { const s = ctx.createMediaElementSource(M.el); s.connect(musicBus); } catch (e) {} }
      M.el.play().then(() => { M.mp3Ok = true; }).catch(() => {}); } }
  function tickMusic() { if (!ctx || !M.song || M.mp3Ok === true || muted || !musicOn) return; if (!M.tempo) { M.tempo = M.song === 'shift' ? 132 : 104; M.next = now() + 0.1; } if (M.next < now() - 1) M.next = now() + 0.05; const spb = 60 / M.tempo; while (M.next < now() + 0.6) { scheduleBar(M.next, M.bar, M.song); M.next += spb * 3; M.bar = (M.bar + 1) % 32; } }
  function jingle(kind) { if (!ctx || muted || !musicOn) return; const t = now() + 0.02; duck(kind === 'day' ? 2.4 : 1.4);
    const notes = kind === 'day' ? [[0, 72], [0.15, 76], [0.3, 79], [0.45, 84], [0.75, 83], [0.9, 84], [1.05, 88]] : [[0, 79], [0.08, 84], [0.16, 88], [0.24, 91]];
    notes.forEach(([d, m]) => { musicBox(hz(m), t + d, 1.6); celesta(hz(m - 12), t + d, 0.3, 1); }); if (kind === 'day') pad(chord(48, 'M'), t + 0.75, 1.4, 2.5); }
  function duck(sec = 1) { if (!ctx) return; musicBus.gain.cancelScheduledValues(now()); musicBus.gain.setTargetAtTime(musicOn ? 0.18 : 0, now(), 0.05); musicBus.gain.setTargetAtTime(musicOn ? 0.55 : 0, now() + sec, 0.4); }
  return {
    unlock() { const first = !ctx; if (!init()) return; if (first && M.song) { const n = M.song; M.song = null; song(n); } if (ctx.state === 'suspended' && !muted) ctx.resume(); if (M.song && M.el && M.mp3Ok !== false) M.el.play().catch(() => {}); },
    get ready() { return !!ctx && ctx.state === 'running'; },
    play, loop, song, jingle, duck,
    update(dt) { if (!ctx) return; tickLoops(dt); tickMusic(); },
    setMuted(v) { muted = !!v; if (!ctx) return; master.gain.setTargetAtTime(muted ? 0 : 0.9, now(), 0.05); if (M.el) { if (muted) M.el.pause(); else if (M.song) M.el.play().catch(() => {}); } },
    setMusic(v) { musicOn = !!v; if (!ctx) return; musicBus.gain.setTargetAtTime(musicOn ? 0.55 : 0, now(), 0.1); if (M.el) { if (!musicOn) M.el.pause(); else if (M.song) M.el.play().catch(() => {}); } if (musicOn) M.next = now() + 0.1; },
    setSfx(v) { sfxOn = !!v; if (!ctx) return; sfxBus.gain.setTargetAtTime(sfxOn ? 0.95 : 0, now(), 0.05); loopBus.gain.setTargetAtTime(sfxOn ? 0.8 : 0, now(), 0.05); },
    get muted() { return muted; }, get musicOn() { return musicOn; }, get sfxOn() { return sfxOn; },
    destroy() { try { M.el && M.el.pause(); ctx && ctx.close(); } catch (e) {} } };
}
