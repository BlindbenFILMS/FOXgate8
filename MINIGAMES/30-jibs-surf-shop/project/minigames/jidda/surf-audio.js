// 8 GATES — JIB'S SURF SHOP AUDIO. All sound is made live with WebAudio (no files needed, light on phones).
//   createSurfAudio(audio, { musicUrl })   audio = the restaurant-kit Ambience (audio.init() makes audio.ctx)
//   .sfx(name)              one-shots: bell, kaching, done, stars, click, fin, crack, flip, whoosh, stoked, grumpy, step, shaka, hop, wrong, pour, upgrade, pick, eod
//   .loop(name, level)      continuous tool sounds, refreshed every pointer move, fade out by themselves: saw, planer, sander, spray, squeegee, wax, pour
//   .music(mode)            'walk' | 'work' | 'party' | 'off'  — a synth island tune (Karplus-Strong ukulele, bass, shaker, steel-drum lead)
//   .setMuted(m) / .muted   one switch for music + sfx (remembered in localStorage 'jidda.surf.sound')
//   .update(dt)             call every frame (fades loops, ocean swell, gulls)
// REAL MUSIC: the 2D game plays jidda/jidda-shops.mp3 in jSurfShop. Pass musicUrl (or drop that file at <pack>/jidda/jidda-shops.mp3)
// and it is used instead of the synth tune; if it is missing the synth plays.
export function createSurfAudio(audio, { musicUrl = null } = {}) {
  const A = { muted: false, ctx: null, ready: false };
  try { A.muted = localStorage.getItem('jidda.surf.sound') === 'off'; } catch (e) {}
  let ctx, out, sfxG, musG, ambG, noise, loops = {}, KS = {}, mp3 = null, mp3Ok = null, modeWant = 'walk', mode = null;
  const R = (a, b) => a + Math.random() * (b - a);
  function init() {
    if (A.ready) { ctx && ctx.state === 'suspended' && ctx.resume(); return true; }
    try { audio.init && audio.init(); } catch (e) {} ctx = audio.ctx; if (!ctx) return false; A.ctx = ctx;
    try { if (audio.wind) audio.wind.gain.value = 0; } catch (e) {}
    out = ctx.createGain(); out.gain.value = A.muted ? 0 : 1;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; out.connect(comp); comp.connect(ctx.destination);
    sfxG = ctx.createGain(); sfxG.gain.value = 0.9; sfxG.connect(out); musG = ctx.createGain(); musG.gain.value = 0.0; musG.connect(out); ambG = ctx.createGain(); ambG.gain.value = 0.5; ambG.connect(out);
    noise = audio.noise || (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    // a short room reverb for the music + bells
    A.verb = ctx.createConvolver(); { const n = ctx.sampleRate * 1.6, b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); } A.verb.buffer = b; }
    A.verbG = ctx.createGain(); A.verbG.gain.value = 0.22; A.verb.connect(A.verbG); A.verbG.connect(out);
    buildAmbience(); A.ready = true; setMode(modeWant); return true; }
  const bq = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const env = (g, t, a, peak, d) => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  function osc(type, f, t, dur, vol, { to = 0, dest = sfxG, a = 0.005, verb = 0, det = 0 } = {}) { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = det; if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur); const g = ctx.createGain(); env(g, t, a, vol, dur); o.connect(g); g.connect(dest); if (verb) { const v = ctx.createGain(); v.gain.value = verb; g.connect(v); v.connect(A.verb); } o.start(t); o.stop(t + a + dur + 0.05); return o; }
  function nz(t, dur, vol, filt, { dest = sfxG, a = 0.003, sweep = 0, q = 0.8 } = {}) { const s = ctx.createBufferSource(); s.buffer = noise; const f = bq(filt[0], filt[1], q); if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur); const g = ctx.createGain(); env(g, t, a, vol, dur); s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + a + dur + 0.05); }

  // ---------- one-shots ----------
  const SFX = {
    bell(t) { for (const [f, d] of [[1318.5, 1.6], [1760, 1.3]]) { osc('sine', f, t, d, 0.12, { verb: 0.6 }); osc('sine', f * 2.76, t, d * 0.4, 0.03, { verb: 0.5 }); } osc('sine', 1318.5, t + 0.16, 1.4, 0.09, { verb: 0.6 }); },
    kaching(t) { nz(t, 0.08, 0.35, ['bandpass', 3200], { q: 2 }); osc('square', 180, t, 0.06, 0.08); [2093, 2637, 3136].forEach((f, i) => osc('sine', f, t + 0.05 + i * 0.03, 0.9, 0.08, { verb: 0.5 })); nz(t + 0.06, 0.4, 0.06, ['highpass', 6000]); },
    done(t) { [784, 988, 1175].forEach((f, i) => { osc('triangle', f, t + i * 0.07, 0.25, 0.09); osc('sine', f * 2, t + i * 0.07, 0.18, 0.025); }); },
    stars(t) { [523, 659, 784, 1047, 1319].forEach((f, i) => { osc('triangle', f, t + i * 0.08, 0.35, 0.08, { verb: 0.4 }); osc('sine', f * 2.76, t + i * 0.08, 0.2, 0.02); }); },
    eod(t) { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => osc('triangle', f, t + i * 0.11, 0.4, 0.08, { verb: 0.5 })); nz(t + 0.3, 1.2, 0.05, ['highpass', 4000], { a: 0.2 }); },
    click(t) { osc('triangle', 1500, t, 0.03, 0.05); nz(t, 0.015, 0.08, ['highpass', 3000]); },
    pick(t) { osc('triangle', 880, t, 0.06, 0.06); osc('triangle', 1320, t + 0.05, 0.08, 0.05); },
    fin(t) { nz(t, 0.03, 0.4, ['bandpass', 1800], { q: 3 }); osc('sine', 160, t, 0.12, 0.25, { to: 70 }); osc('square', 2400, t + 0.01, 0.02, 0.03); },
    crack(t) { for (let i = 0; i < 4; i++) nz(t + i * 0.035, 0.07, 0.3, ['bandpass', R(900, 2200)], { q: 1.5 }); osc('sine', 120, t, 0.25, 0.2, { to: 50 }); },
    flip(t) { nz(t, 0.45, 0.25, ['bandpass', 400], { sweep: 2600, q: 1.2, a: 0.08 }); osc('sine', 90, t + 0.4, 0.18, 0.2, { to: 50 }); },
    whoosh(t) { nz(t, 0.35, 0.2, ['bandpass', 600], { sweep: 3000, q: 1, a: 0.05 }); },
    stoked(t) { osc('sine', 420, t, 0.32, 0.12, { to: 900, a: 0.03 }); osc('triangle', 840, t, 0.3, 0.03, { to: 1800, a: 0.03 }); osc('sine', 620, t + 0.36, 0.28, 0.1, { to: 1100 }); nz(t + 0.1, 0.9, 0.05, ['bandpass', 1400], { a: 0.2, q: 0.5 }); },
    grumpy(t) { osc('sawtooth', 220, t, 0.45, 0.05, { to: 130 }); osc('sine', 200, t, 0.45, 0.1, { to: 110 }); },
    step(t) { nz(t, 0.06, 0.12, ['lowpass', R(500, 800)]); osc('sine', R(90, 120), t, 0.05, 0.06, { to: 60 }); },
    shaka(t) { osc('sine', 1200, t, 0.12, 0.08, { to: 1900 }); osc('sine', 1400, t + 0.15, 0.25, 0.08, { to: 2300 }); },
    hop(t) { osc('sine', 300, t, 0.15, 0.1, { to: 700 }); },
    wrong(t) { osc('square', 196, t, 0.12, 0.05); osc('square', 147, t + 0.12, 0.18, 0.05); },
    upgrade(t) { [659, 880, 1109, 1319].forEach((f, i) => osc('triangle', f, t + i * 0.06, 0.3, 0.08, { verb: 0.4 })); },
    cutDone(t) { SFX.crack(t); SFX.done(t + 0.25); },
    plop(t) { osc('sine', 300, t, 0.12, 0.15, { to: 120 }); nz(t, 0.1, 0.08, ['lowpass', 900]); } };
  // ---------- continuous tool loops ----------
  function mkLoop(name) { const g = ctx.createGain(); g.gain.value = 0; g.connect(sfxG); const L = { g, lvl: 0, t: 0, nodes: [] }, add = n => { L.nodes.push(n); n.start && n.start(); return n; };
    const src = () => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; return s; };
    if (name === 'saw') { const o = add(ctx.createOscillator()); o.type = 'sawtooth'; o.frequency.value = 118; const o2 = add(ctx.createOscillator()); o2.type = 'square'; o2.frequency.value = 236; const f = bq('bandpass', 1700, 1.6); const trem = ctx.createGain(); trem.gain.value = 0.6; const lfo = add(ctx.createOscillator()); lfo.frequency.value = 28; const lg = ctx.createGain(); lg.gain.value = 0.4; lfo.connect(lg); lg.connect(trem.gain); o.connect(f); o2.connect(f); f.connect(trem); const n = add(src()); const nf = bq('highpass', 3500); const ng = ctx.createGain(); ng.gain.value = 0.25; n.connect(nf); nf.connect(ng); ng.connect(trem); trem.connect(g); L.peak = 0.13; L.o = o; }
    else if (name === 'planer') { const o = add(ctx.createOscillator()); o.type = 'sawtooth'; o.frequency.value = 82; const f0 = bq('lowpass', 400); const og = ctx.createGain(); og.gain.value = 0.5; o.connect(f0); f0.connect(og); og.connect(g); const n = add(src()); const nf = bq('bandpass', 1300, 0.9); n.connect(nf); nf.connect(g); L.peak = 0.22; L.o = o; }
    else if (name === 'sander') { const n = add(src()); const nf = bq('bandpass', 2400, 0.8); const trem = ctx.createGain(); trem.gain.value = 0.7; const lfo = add(ctx.createOscillator()); lfo.frequency.value = 19; const lg = ctx.createGain(); lg.gain.value = 0.3; lfo.connect(lg); lg.connect(trem.gain); n.connect(nf); nf.connect(trem); trem.connect(g); const o = add(ctx.createOscillator()); o.type = 'triangle'; o.frequency.value = 140; const og = ctx.createGain(); og.gain.value = 0.15; o.connect(og); og.connect(g); L.peak = 0.2; }
    else if (name === 'spray') { const n = add(src()); const a = bq('highpass', 4200), b = bq('peaking', 8000, 1); b.gain.value = 6; n.connect(a); a.connect(b); b.connect(g); L.peak = 0.16; }
    else if (name === 'squeegee') { const o = add(ctx.createOscillator()); o.type = 'sine'; o.frequency.value = 760; const v = add(ctx.createOscillator()); v.frequency.value = 7; const vg = ctx.createGain(); vg.gain.value = 40; v.connect(vg); vg.connect(o.frequency); const og = ctx.createGain(); og.gain.value = 0.25; o.connect(og); og.connect(g); const n = add(src()); const nf = bq('bandpass', 1800, 1.2); n.connect(nf); nf.connect(g); L.peak = 0.1; L.o = o; }
    else if (name === 'wax') { const n = add(src()); const nf = bq('bandpass', 3200, 5); n.connect(nf); nf.connect(g); const o = add(ctx.createOscillator()); o.type = 'sine'; o.frequency.value = 1350; const og = ctx.createGain(); og.gain.value = 0.12; o.connect(og); og.connect(g); L.peak = 0.16; L.o = o; }
    else if (name === 'pour') { const n = add(src()); const nf = bq('lowpass', 700, 1); n.connect(nf); nf.connect(g); const o = add(ctx.createOscillator()); o.type = 'sine'; o.frequency.value = 190; const v = add(ctx.createOscillator()); v.type = 'square'; v.frequency.value = 9; const vg = ctx.createGain(); vg.gain.value = 45; v.connect(vg); vg.connect(o.frequency); const og = ctx.createGain(); og.gain.value = 0.3; o.connect(og); og.connect(g); L.peak = 0.2; L.o = o; }
    return L; }
  // ---------- ocean + gulls outside the door ----------
  let gullT = 4, swell = 0; function buildAmbience() { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; A.sea = bq('lowpass', 520, 0.5); A.seaG = ctx.createGain(); A.seaG.gain.value = 0.05; s.connect(A.sea); A.sea.connect(A.seaG); A.seaG.connect(ambG); s.start(); }
  function gull(t) { const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null, d = p || ambG; if (p) { p.pan.value = R(-0.9, -0.3); p.connect(ambG); } for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) { const t0 = t + i * 0.32, o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(1900, t0); o.frequency.exponentialRampToValueAtTime(1150, t0 + 0.24); const g = ctx.createGain(); env(g, t0, 0.02, 0.03, 0.22); o.connect(g); g.connect(d); o.start(t0); o.stop(t0 + 0.3); } }

  // ---------- music: island tune, 96 bpm, G – Em – C – D ----------
  const BPM = 96, SPB = 60 / BPM, BAR = SPB * 4;
  const CH = [{ root: 43, notes: [55, 59, 62, 67] }, { root: 40, notes: [55, 59, 64, 67] }, { root: 36, notes: [55, 60, 64, 67] }, { root: 38, notes: [54, 57, 62, 66] }];
  const MEL = [[79, 0, 0.5], [76, 0.5, 0.5], [74, 1, 1], [76, 2.5, 0.5], [79, 3, 1], [76, 4, 0.5], [74, 4.5, 0.5], [71, 5, 1.5], [74, 7, 1], [72, 8, 0.5], [71, 8.5, 0.5], [67, 9, 1.5], [69, 11, 1], [71, 12, 0.5], [74, 12.5, 0.5], [76, 13, 1], [74, 14, 0.5], [72, 14.5, 0.5], [69, 15, 1]];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function ksBuf(midi, dur = 1.4, bright = 0.5) { const key = midi + '|' + bright; if (KS[key]) return KS[key]; const sr = ctx.sampleRate, n = Math.floor(sr * dur), b = ctx.createBuffer(1, n, sr), d = b.getChannelData(0), P = Math.max(2, Math.round(sr / mtof(midi))), ring = new Float32Array(P);
    for (let i = 0; i < P; i++) ring[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / P * Math.PI));
    let idx = 0; const k = 0.4985 + bright * 0.0013; for (let i = 0; i < n; i++) { const nx = (idx + 1) % P, v = ring[idx]; d[i] = v; ring[idx] = (v + ring[nx]) * k; idx = nx; }
    return KS[key] = b; }
  function pluck(midi, t, vol, { dest = musG, dur = 1.4, bright = 0.5, pan = 0 } = {}) { const s = ctx.createBufferSource(); s.buffer = ksBuf(midi, dur, bright); const g = ctx.createGain(); g.gain.value = vol; const f = bq('lowpass', 2600 + bright * 2000); s.connect(f); f.connect(g); if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(dest); } else g.connect(dest); s.start(t); }
  function steel(midi, t, dur, vol) { const f = mtof(midi); osc('sine', f, t, dur, vol, { dest: musG, a: 0.004, verb: 0.35 }); osc('sine', f * 2.76, t, dur * 0.35, vol * 0.25, { dest: musG }); osc('sine', f * 2, t, dur * 0.6, vol * 0.3, { dest: musG }); }
  let next = 0, beat = 0, schedIv = 0, LA = 0.25;
  function sched() { if (!ctx || mode === 'off' || mode === null || mp3Ok) return; const now = ctx.currentTime; if (next < now) next = now + 0.06;
    while (next < now + LA) { const t = next, b = beat % 16, bar = Math.floor(beat / 4) % 4, C = CH[bar], inBar = beat % 4, full = mode !== 'walk', party = mode === 'party';
      // ukulele: island strum D . D U . U D U on 8ths
      const pat = [1, 0, 1, 2, 0, 2, 1, 2]; for (let h = 0; h < 2; h++) { const p = pat[inBar * 2 + h], th = t + h * SPB / 2; if (!p) continue; const up = p === 2, ns = up ? C.notes.slice().reverse() : C.notes; ns.forEach((m, i) => pluck(m, th + i * 0.011, (up ? 0.055 : 0.08) * (inBar === 0 && h === 0 ? 1.2 : 1), { bright: up ? 0.3 : 0.6, pan: 0.15 })); }
      // bass
      if (inBar === 0) pluck(C.root, t, 0.35, { dur: 1.6, bright: 0.1 }); if (inBar === 2) pluck(C.root + 7, t, 0.28, { dur: 1.2, bright: 0.1 }); if (inBar === 3 && full) pluck(C.root + (bar === 3 ? 4 : 12), t + SPB / 2, 0.2, { dur: 0.6, bright: 0.1 });
      // shaker 8ths + kick
      for (let h = 0; h < 2; h++) nz(t + h * SPB / 2, 0.05, h ? 0.045 : 0.03, ['highpass', 7000], { dest: musG });
      if (full && (inBar === 0 || inBar === 2)) osc('sine', 120, t, 0.18, 0.28, { to: 45, dest: musG });
      if (full && inBar === 3) nz(t, 0.12, 0.08, ['bandpass', 1800], { dest: musG, q: 0.7 });
      // steel-drum melody (work + party), 4-bar phrase
      if (full) { const pos = (beat % 16); for (const [m, st, du] of MEL) if (st >= pos && st < pos + 1) steel(m, t + (st - pos) * SPB, du * SPB * 1.4, party ? 0.06 : 0.045); }
      next += SPB; beat++; } }
  function setMode(m) { modeWant = m; if (!A.ready) return; if (m === mode) return; mode = m; const t = ctx.currentTime;
    musG.gain.cancelScheduledValues(t); musG.gain.setTargetAtTime(m === 'off' ? 0 : m === 'walk' ? 0.6 : 0.75, t, 0.6);
    if (musicUrl && mp3Ok !== false) { if (!mp3) { mp3 = new Audio(); mp3.loop = true; mp3.crossOrigin = 'anonymous'; mp3.src = musicUrl; mp3.volume = 0.45; mp3.addEventListener('error', () => { mp3Ok = false; mp3 = null; }); mp3.addEventListener('canplay', () => { if (mp3Ok == null) mp3Ok = true; }); } if (mp3) { if (m === 'off' || A.muted) mp3.pause(); else mp3.play().catch(() => {}); } }
    if (!schedIv) schedIv = setInterval(sched, 60); }
  function step(dt) { if (!A.ready) return; const t = ctx.currentTime;
    for (const k in loops) { const L = loops[k]; L.t -= dt; const want = L.t > 0 ? L.lvl * L.peak : 0; L.g.gain.setTargetAtTime(want, t, want ? 0.03 : 0.08); }
    swell += dt; A.seaG.gain.setTargetAtTime(0.035 + 0.025 * (0.5 + 0.5 * Math.sin(swell * 0.45)), t, 0.4);
    if ((gullT -= dt) < 0) { gullT = R(7, 16); gull(t + 0.05); } }
  Object.assign(A, {
    init, update: step,
    sfx(name, delay = 0) { if (!A.ready && !init()) return; if (A.muted || !SFX[name]) return; try { SFX[name](ctx.currentTime + 0.01 + delay); } catch (e) {} },
    loop(name, level = 1) { if (!A.ready || A.muted) return; if (!loops[name]) loops[name] = mkLoop(name); const L = loops[name]; L.lvl = Math.min(1, level); L.t = 0.14; if (L.o && name === 'saw') L.o.frequency.setTargetAtTime(110 + level * 30, ctx.currentTime, 0.05); if (L.o && name === 'pour') L.o.frequency.setTargetAtTime(160 + level * 120, ctx.currentTime, 0.1); },
    stopLoops() { for (const k in loops) loops[k].t = 0; },
    music(m) { setMode(m); },
    setMuted(m) { A.muted = !!m; try { localStorage.setItem('jidda.surf.sound', m ? 'off' : 'on'); } catch (e) {} if (A.ready) { out.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.08); if (mp3) { if (m) mp3.pause(); else if (mode !== 'off') mp3.play().catch(() => {}); } } return A.muted; },
    pause(p) { if (!A.ready) return; if (p) { ctx.suspend && ctx.suspend(); mp3 && mp3.pause(); } else { ctx.resume && ctx.resume(); if (mp3 && !A.muted && mode !== 'off') mp3.play().catch(() => {}); } },
    _fill(sec) { const k = LA; LA = sec; sched(); LA = k; },
    destroy() { clearInterval(schedIv); if (mp3) { mp3.pause(); mp3 = null; } } });
  return A;
}
