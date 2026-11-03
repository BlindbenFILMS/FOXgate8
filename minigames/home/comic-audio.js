// 8 GATES — BRAMBLE'S COMICS · sound + music. Everything is synthesized with Web Audio (no audio files to ship).
// Shares the AudioContext of the stage's Ambience (engine/restaurant-kit.js createStage → ST.audio) and silences its outdoor wind.
//   const SND = comicAudio(ST.audio); SND.ensure() on the first tap; SND.play('chime') · SND.loop('pencil', true, speed) · SND.setMusic('shop' | 'work' | 'rush' | 'sketch' | 'react' | null)
// Buses: sfx + music → compressor → master, with a small room reverb send. Options: musicOn, sfxOn, muted (HUD sound button), haptics.
export function comicAudio(amb) {
  const S = { ctx: null, musicOn: true, sfxOn: true, muted: false, haptics: true, mode: null, want: null, hidden: false };
  let ctx, master, sfx, mus, verb, verbIn, noise, pink, loops = {}, sched = null, bar = 0, beat = 0, nextT = 0, roomTone = null;
  const now = () => ctx.currentTime;
  function ensure() {
    if (S.ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    try { amb.init && amb.init(); } catch (e) {} ctx = amb.ctx; if (!ctx) return false; S.ctx = ctx; try { amb.wind && (amb.wind.gain.value = 0); } catch (e) {}
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.2; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = S.muted ? 0 : 2.4; const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -4; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.001; lim.release.value = 0.12; comp.connect(master); master.connect(lim); lim.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = S.sfxOn ? 0.9 : 0; sfx.connect(comp); mus = ctx.createGain(); mus.gain.value = 0; mus.connect(comp);
    // tiny room: generated impulse, short and dark (a shop full of books)
    verb = ctx.createConvolver(); const L = Math.floor(ctx.sampleRate * 1.6), ir = ctx.createBuffer(2, L, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < L; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / L, 3.2) * (i < 200 ? i / 200 : 1); } verb.buffer = ir;
    const vlp = ctx.createBiquadFilter(); vlp.type = 'lowpass'; vlp.frequency.value = 3200; verbIn = ctx.createGain(); verbIn.gain.value = 0.5; verbIn.connect(verb); verb.connect(vlp); vlp.connect(comp);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    pink = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = pink.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0527; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.22; } }
    // room tone: a whisper of air + far street, so the shop never sounds dead
    roomTone = noiseSrc(pink, true); const rt = bq('lowpass', 420), rg = ctx.createGain(); rg.gain.value = 0.035; roomTone.connect(rt); rt.connect(rg); rg.connect(sfx); roomTone.start();
    document.addEventListener('visibilitychange', onVis);
    if (S.want) setMusic(S.want, true); return true;
  }
  function onVis() { S.hidden = document.hidden; if (!ctx) return; if (document.hidden) ctx.suspend(); else ctx.resume(); }
  const bq = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  function noiseSrc(buf = noise, loop = false) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = loop; return s; }
  function env(g, t, a, peak, d, end = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
  function out(node, dest = sfx, wet = 0) { node.connect(dest); if (wet) { const w = ctx.createGain(); w.gain.value = wet; node.connect(w); w.connect(verbIn); } }
  // ---- voices ----
  function osc(type, f0, f1, t, dur, peak, dest = sfx, wet = 0.12, a = 0.004) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur); env(g, t, a, peak, dur); o.connect(g); out(g, dest, wet); o.start(t); o.stop(t + a + dur + 0.05); return o; }
  function nz(type, f, q, t, dur, peak, f1, dest = sfx, wet = 0.1, buf) { const s = noiseSrc(buf), b = bq(type, f, q), g = ctx.createGain(); if (f1) b.frequency.exponentialRampToValueAtTime(f1, t + dur); env(g, t, 0.003, peak, dur); s.connect(b); b.connect(g); out(g, dest, wet); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05); }
  function bell(f, t, dur = 1.2, peak = 0.12, dest = sfx, wet = 0.3) { // FM bell
    const c = ctx.createOscillator(), m = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain(); c.frequency.value = f; m.frequency.value = f * 3.5; mg.gain.setValueAtTime(f * 2.2, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + dur); m.connect(mg); mg.connect(c.frequency); env(g, t, 0.003, peak, dur); c.connect(g); out(g, dest, wet); c.start(t); m.start(t); c.stop(t + dur + 0.1); m.stop(t + dur + 0.1); }
  function ep(f, t, dur, peak, dest = mus) { // electric piano: sine + soft bell partial, gentle tremolo
    const g = ctx.createGain(), lp = bq('lowpass', 2600); for (const [mul, v] of [[1, 1], [2, 0.18], [3.01, 0.06]]) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'sine'; o.frequency.value = f * mul; o.detune.value = (Math.random() - 0.5) * 6; og.gain.value = v; o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.3); }
    env(g, t, 0.008, peak, dur); const tr = ctx.createOscillator(), tg = ctx.createGain(), am = ctx.createGain(); tr.frequency.value = 4.6; tg.gain.value = 0.18; am.gain.value = 0.82; tr.connect(tg); tg.connect(am.gain); tr.start(t); tr.stop(t + dur + 0.3); g.connect(am); am.connect(lp); out(lp, dest, 0.22); }
  const SFX = {
    click() { const t = now(); osc('sine', 1500, 900, t, 0.03, 0.05, sfx, 0); nz('highpass', 4000, 0.7, t, 0.012, 0.03); },
    paper() { const t = now(); nz('bandpass', 1400, 0.9, t, 0.32, 0.12, 4200, sfx, 0.08); nz('highpass', 3000, 0.5, t + 0.05, 0.18, 0.05, 7000); },
    snip() { const t = now(); nz('bandpass', 5200, 3, t, 0.03, 0.22); nz('bandpass', 4300, 3, t + 0.07, 0.035, 0.22); nz('bandpass', 1800, 1.2, t + 0.01, 0.16, 0.12, 900); osc('triangle', 2400, 1600, t + 0.07, 0.04, 0.03, sfx, 0); },
    ruler() { const t = now(); nz('bandpass', 2600, 1.4, t, 0.28, 0.1, 5200); osc('sine', 220, 180, t + 0.24, 0.08, 0.08); },
    splash(n = 1) { const t = now(), f = 260 + n * 45; osc('sine', f, f * 2.6, t, 0.11, 0.12, sfx, 0.15); osc('sine', f * 1.5, f * 3.4, t + 0.05, 0.09, 0.06, sfx, 0.15); nz('bandpass', 1100, 1.1, t, 0.2, 0.09, 500, sfx, 0.12); },
    pop() { const t = now(); osc('sine', 480, 1100, t, 0.07, 0.14, sfx, 0.12); nz('highpass', 3000, 0.7, t, 0.015, 0.05); },
    boom(i = 1) { const t = now(), k = 1 + i * 0.08; osc('sine', 140 * k, 48, t, 0.22, 0.32, sfx, 0.1); nz('lowpass', 500 * k, 0.8, t, 0.12, 0.22); osc('square', 90 * k, 60, t, 0.06, 0.03, sfx, 0); },
    kapow() { const t = now(); osc('sine', 120, 38, t, 0.55, 0.45, sfx, 0.25); nz('lowpass', 900, 0.7, t, 0.35, 0.35, 200, sfx, 0.3); nz('highpass', 2500, 0.6, t + 0.02, 0.7, 0.14, 6000, sfx, 0.35); for (let i = 0; i < 3; i++) bell(1047 * [1, 1.26, 1.5][i], t + 0.08 + i * 0.05, 0.6, 0.05); },
    stamp() { const t = now(); osc('sine', 95, 38, t, 0.22, 0.42, sfx, 0.12); nz('bandpass', 420, 1.4, t, 0.09, 0.32); nz('lowpass', 2200, 0.6, t + 0.02, 0.14, 0.08); },
    blot() { const t = now(); nz('lowpass', 900, 0.8, t, 0.24, 0.24, 180, sfx, 0.12); osc('sine', 210, 70, t, 0.2, 0.14); },
    chime() { const t = now(); bell(1319, t, 0.7, 0.07); bell(1976, t + 0.08, 0.9, 0.06); },
    clean() { const t = now(); bell(1568, t, 0.5, 0.06); osc('sine', 2093, 2093, t + 0.06, 0.25, 0.03, sfx, 0.2); },
    wrong() { const t = now(); osc('triangle', 330, 310, t, 0.1, 0.07, sfx, 0.05); osc('triangle', 262, 240, t + 0.11, 0.16, 0.07, sfx, 0.05); },
    streak(n = 3) { const t = now(), sc = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]; const k = Math.min(sc.length - 1, n - 3); bell(784 * Math.pow(2, sc[k] / 12), t, 0.6, 0.07); bell(784 * Math.pow(2, (sc[k] + 7) / 12), t + 0.06, 0.6, 0.04); },
    fanfare(stars = 3) { const t = now(), notes = [523, 659, 784, 1047, 1319]; for (let i = 0; i < 2 + stars; i++) bell(notes[i], t + i * 0.09, 0.9, 0.08); },
    sad() { const t = now(); for (let i = 0; i < 3; i++) { const o = osc('sawtooth', [233, 220, 208][i], [228, 214, 180][i], t + i * 0.26, i === 2 ? 0.6 : 0.22, 0.05, sfx, 0.1); } },
    kaching() { const t = now(); nz('lowpass', 600, 0.8, t, 0.08, 0.2); osc('sine', 120, 90, t, 0.08, 0.15); bell(2637, t + 0.06, 1.0, 0.09); bell(3136, t + 0.1, 1.1, 0.07); for (let i = 0; i < 6; i++) osc('sine', 4000 + Math.random() * 2500, 0, t + 0.14 + i * 0.045, 0.06, 0.02, sfx, 0.2); },
    doorbell() { const t = now(); for (const [f, d] of [[1568, 0], [1319, 0.22]]) { bell(f, t + d, 1.6, 0.09, sfx, 0.4); osc('sine', f * 2.76, f * 2.76, t + d, 0.5, 0.012, sfx, 0.4); } },
    step(sp = 1) { const t = now(); nz('bandpass', 300 + Math.random() * 120, 1.1, t, 0.07, 0.05 * sp, 0, sfx, 0.04, pink); nz('highpass', 2500, 0.7, t, 0.02, 0.012 * sp); },
    whoosh() { const t = now(); nz('bandpass', 600, 1, t, 0.5, 0.12, 2400, sfx, 0.1); for (let i = 0; i < 9; i++) nz('bandpass', 3000, 4, t + i * 0.05 * (1 + i * 0.12), 0.012, 0.05); },
    bite() { const t = now(); osc('square', 160, 80, t, 0.09, 0.08, sfx, 0); nz('lowpass', 1200, 0.9, t, 0.08, 0.2); osc('square', 140, 70, t + 0.12, 0.09, 0.08, sfx, 0); nz('lowpass', 1200, 0.9, t + 0.12, 0.08, 0.18); },
    box() { const t = now(); nz('lowpass', 700, 0.8, t, 0.12, 0.24); osc('sine', 150, 90, t, 0.1, 0.1); },
    sparkle() { const t = now(); for (let i = 0; i < 4; i++) osc('sine', 2600 + i * 420 + Math.random() * 200, 0, t + i * 0.035, 0.12, 0.018, sfx, 0.3); },
    pick() { const t = now(); osc('triangle', 880, 1175, t, 0.05, 0.04, sfx, 0.05); },
    open() { const t = now(); nz('bandpass', 900, 0.8, t, 0.4, 0.08, 2600, sfx, 0.12); bell(988, t + 0.1, 0.6, 0.04); },
    hum(f) { const t = now(); osc('sine', f, f, t, 0.045, 0.02, sfx, 0); } };
  // ---- continuous loops (pencil scratch, ink flow, signature) ----
  function loop(name, on, amt = 1) { if (!ctx || !S.sfxOn) { if (loops[name]) { loops[name].g.gain.setTargetAtTime(0, ctx ? now() : 0, 0.03); } return; }
    let L = loops[name]; if (!L) { const s = noiseSrc(noise, true), g = ctx.createGain(); g.gain.value = 0; let chain;
      if (name === 'pencil') { const a = bq('bandpass', 3600, 1.3), b = bq('highpass', 1600, 0.7); s.connect(a); a.connect(b); chain = b; }
      else if (name === 'ink') { const a = bq('bandpass', 700, 2.2), b = bq('lowpass', 1800, 0.7); s.connect(a); a.connect(b); chain = b; }
      else { const a = bq('bandpass', 2200, 1.6); s.connect(a); chain = a; }
      const lfo = ctx.createOscillator(), lg = ctx.createGain(), am = ctx.createGain(); lfo.frequency.value = name === 'ink' ? 7 : 23; lg.gain.value = 0.45; am.gain.value = 0.6; lfo.connect(lg); lg.connect(am.gain); chain.connect(am); am.connect(g); out(g, sfx, 0.04); s.start(); lfo.start(); L = loops[name] = { s, g }; }
    const peak = name === 'pencil' ? 0.11 : name === 'ink' ? 0.09 : 0.08; L.g.gain.setTargetAtTime(on ? peak * Math.max(0.25, Math.min(1.4, amt)) : 0, now(), on ? 0.02 : 0.05); }
  // ---- music: a little lo-fi jazz trio for the shop, generated live ----
  // F major ii–V–I–vi turnaround, swung 8ths, electric piano comping, walking bass, brushed kit, vinyl dust, a vibraphone line now and then
  const PROG = [[43, [55, 58, 62, 65]], [48, [52, 55, 58, 62]], [41, [53, 57, 60, 64]], [50, [53, 57, 60, 62]], [43, [55, 58, 62, 65]], [48, [52, 56, 58, 62]], [41, [53, 57, 60, 64]], [45, [52, 55, 61, 64]]];
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12), PENTA = [65, 67, 69, 72, 74, 77, 79, 81];
  const MODES = { shop: { bpm: 84, vol: 0.5, kick: 1, keys: 1, bass: 1, vib: 0.5, hat: 1 }, work: { bpm: 78, vol: 0.34, kick: 0, keys: 0.8, bass: 0.8, vib: 0.2, hat: 0.6 }, rush: { bpm: 104, vol: 0.5, kick: 1, keys: 1, bass: 1, vib: 0.6, hat: 1.2 }, sketch: { bpm: 70, vol: 0.38, kick: 0, keys: 1, bass: 0.6, vib: 0.8, hat: 0 }, react: { bpm: 84, vol: 0.22, kick: 0.5, keys: 0.8, bass: 0.8, vib: 0, hat: 0.5 } };
  function drum(kind, t, v) { if (kind === 'kick') { osc('sine', 120, 42, t, 0.24, 0.32 * v, mus, 0.03); nz('lowpass', 300, 0.7, t, 0.05, 0.06 * v, 0, mus, 0); }
    else if (kind === 'snare') { nz('bandpass', 1900, 0.6, t, 0.16, 0.08 * v, 1200, mus, 0.25); nz('highpass', 4000, 0.6, t, 0.09, 0.03 * v, 0, mus, 0.2); }
    else if (kind === 'hat') nz('highpass', 7600, 0.8, t, 0.03, 0.035 * v, 0, mus, 0.05);
    else if (kind === 'ride') { nz('bandpass', 6400, 2.5, t, 0.25, 0.022 * v, 0, mus, 0.15); osc('sine', 3920, 3800, t, 0.18, 0.004 * v, mus, 0.1); } }
  function tick(ahead = 0.15) { if (!ctx || !S.mode) return; const M = MODES[S.mode], spb = 60 / M.bpm;
    while (nextT < now() + ahead) { const [root, ch] = PROG[bar % PROG.length], t = nextT, sw = beat % 1 ? spb * 0.16 : 0, tt = t + sw, b = Math.floor(beat), off = beat % 1 !== 0;
      if (!off) { // on the beat: bass walks, ride swings, kick on 1/3, brush on 2/4
        if (M.bass) { const walk = b === 0 ? root : b === 1 ? root + (Math.random() < 0.5 ? 7 : 4) : b === 2 ? root + 7 : (PROG[(bar + 1) % PROG.length][0] + (Math.random() < 0.5 ? -1 : 1)); const o = ctx.createOscillator(), g = ctx.createGain(), lp = bq('lowpass', 520); o.type = 'triangle'; o.frequency.value = mtof(walk - 12); env(g, tt, 0.012, 0.2 * M.bass, spb * 0.9); o.connect(lp); lp.connect(g); g.connect(mus); o.start(tt); o.stop(tt + spb + 0.1); }
        if (M.hat) drum('ride', tt, M.hat); if (M.kick && (b === 0 || (b === 2 && Math.random() < 0.6))) drum('kick', tt, M.kick); if (b === 1 || b === 3) drum('snare', tt, M.hat ? 1 : 0.5);
        if (M.keys && (b === 0 || (b === 2 && Math.random() < 0.4))) ch.forEach((n, i) => ep(mtof(n), tt + i * 0.008, spb * (b === 0 ? 1.6 : 1.1), 0.05 * M.keys));
      } else { if (M.hat) drum('hat', tt, M.hat * 0.8); if (M.keys && b === 1 && Math.random() < 0.55) ch.slice(1).forEach((n, i) => ep(mtof(n + 12 * (i === 2 ? 0 : 0)), tt + i * 0.006, spb * 0.7, 0.035 * M.keys)); }
      if (M.vib && !off && bar % 2 === 1 && Math.random() < 0.35 * M.vib) bell(mtof(PENTA[Math.floor(Math.random() * PENTA.length)]), tt, 1.4, 0.035, mus, 0.4);
      if (Math.random() < 0.18) nz('highpass', 3000, 0.5, t + Math.random() * spb * 0.5, 0.006, 0.02, 0, mus, 0); // vinyl dust
      beat += 0.5; if (beat >= 4) { beat = 0; bar++; } nextT += spb / 2; } }
  function setMusic(mode, force) { S.want = mode; if (!ctx) return; const was = S.mode; S.mode = S.musicOn && !S.muted ? mode : null;
    mus.gain.setTargetAtTime(S.mode ? MODES[S.mode].vol * 0.6 : 0, now(), 0.6);
    if (S.mode && !sched) { nextT = now() + 0.1; beat = 0; sched = setInterval(tick, 40); } if (!S.mode && sched && (force || was)) { const k = sched; setTimeout(() => { if (!S.mode) { clearInterval(k); if (sched === k) sched = null; } }, 1600); } }
  const vibe = ms => { if (S.haptics && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };
  return { S, ensure,
    play(name, a) { if (!ctx || !S.sfxOn || S.muted || !SFX[name]) return; try { SFX[name](a); } catch (e) {} if (S.mode && /kapow|fanfare|doorbell|kaching|sad|stamp/.test(name)) { const v = MODES[S.mode].vol * 0.6, t = now(); mus.gain.cancelScheduledValues(t); mus.gain.setTargetAtTime(v * 0.35, t, 0.03); mus.gain.setTargetAtTime(v, t + 0.9, 0.5); } },
    loop, setMusic, vibe, _prerender(sec) { tick(sec); }, _play: SFX,
    setOptions({ music, sfx: fx, haptics } = {}) { if (music != null) S.musicOn = !!music; if (fx != null) { S.sfxOn = !!fx; if (sfx) sfx.gain.setTargetAtTime(fx ? 0.9 : 0, now(), 0.05); } if (haptics != null) S.haptics = !!haptics; if (ctx) setMusic(S.want); },
    setMuted(m) { S.muted = !!m; if (master) master.gain.setTargetAtTime(m ? 0 : 2.4, now(), 0.08); try { amb.setMuted && amb.setMuted(m); } catch (e) {} if (ctx) setMusic(S.want); },
    destroy() { clearInterval(sched); document.removeEventListener('visibilitychange', onVis); try { roomTone && roomTone.stop(); } catch (e) {} for (const k in loops) try { loops[k].s.stop(); } catch (e) {} } };
}
