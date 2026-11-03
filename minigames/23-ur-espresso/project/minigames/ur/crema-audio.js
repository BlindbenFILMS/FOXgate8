// 8 GATES — UR · FOXY CREMA audio: synthesized café sound effects + an original bossa-nova loop (no sample files needed).
// createCremaAudio(audio) wraps the restaurant kit's Ambience (audio.ctx / audio.master / audio.noise) and returns:
//   sfx(name, opts)      one-shots: tamp knock clack creak spring pump clink slide leaf coin ching bell door step ui good bad serve tick ding refuse
//   loop(name)           holds: grind pour steam milk honey  → { set(params), stop() }
//   meter(v, inBand)     soft "audio meter" tone while a hold is running (pitch follows the meter, a fifth joins it in the green)
//   ambience(on)         café murmur + far-off cup clinks
//   music: start(mode) / stop() / setOn(bool) / step()   (call step() every frame; it schedules ahead)
export function createCremaAudio(audio) {
  const A = { on: true, musicOn: true, ctx: null };
  let ctx = null, out = null, verb = null, sfxBus = null, musBus = null, noise = null;
  function ready() {
    if (!audio.ctx) return false; if (ctx) return true;
    ctx = A.ctx = audio.ctx; noise = audio.noise;
    out = ctx.createGain(); out.gain.value = 1; out.connect(audio.master);
    // small room reverb from a synthesized impulse (warm, 1.1 s)
    const len = Math.floor(ctx.sampleRate * 1.1), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 80 ? i / 80 : 1); } }
    verb = ctx.createConvolver(); verb.buffer = ir; const vl = ctx.createBiquadFilter(); vl.type = 'lowpass'; vl.frequency.value = 3800; const vg = ctx.createGain(); vg.gain.value = 0.22; verb.connect(vl); vl.connect(vg); vg.connect(out);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(out); const sSend = ctx.createGain(); sSend.gain.value = 0.35; sfxBus.connect(sSend); sSend.connect(verb);
    musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(out); const mSend = ctx.createGain(); mSend.gain.value = 0.5; musBus.connect(mSend); mSend.connect(verb);
    return true; }
  const now = () => ctx.currentTime;
  const G = (v = 0) => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const F = (type, f, q = 0.8) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const O = (type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; return o; };
  const N = (loop = false) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = loop; return s; };
  const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };
  // percussive envelope on a gain node
  const env = (g, t, a, d, peak, curve = 'exp') => { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); else g.gain.linearRampToValueAtTime(0, t + a + d); };
  function tone(f, t, d, v, type = 'sine', to = null, dest = sfxBus, a = 0.004) { const o = O(type, f), g = G(); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + d); env(g, t, a, d, v); chain(o, g, dest); o.start(t); o.stop(t + a + d + 0.05); }
  function burst(t, d, v, type, f, q = 0.8, f2 = null, dest = sfxBus, off = Math.random() * 1.5) { const s = N(), b = F(type, f, q), g = G(); if (f2) b.frequency.exponentialRampToValueAtTime(Math.max(40, f2), t + d); env(g, t, 0.003, d, v); chain(s, b, g, dest); s.start(t, off); s.stop(t + d + 0.06); }
  // ceramic / metal: a few inharmonic partials with fast decay
  function bellish(t, base, parts, d, v, dest = sfxBus) { parts.forEach(([r, a], i) => tone(base * r, t, d * (1 - i * 0.12), v * a, 'sine', null, dest, 0.002)); }
  const SFX = {
    tamp(t) { tone(130, t, 0.16, 0.5, 'sine', 55); burst(t, 0.09, 0.35, 'lowpass', 700, 0.7); burst(t + 0.02, 0.05, 0.12, 'bandpass', 2400, 2); },
    knock(t) { for (const dt of [0, 0.11]) { tone(95, t + dt, 0.14, 0.45, 'sine', 60); burst(t + dt, 0.07, 0.3, 'bandpass', 420, 1.2); } burst(t + 0.05, 0.25, 0.08, 'lowpass', 900); },
    clack(t) { burst(t, 0.03, 0.4, 'highpass', 2500, 0.7); bellish(t, 1780, [[1, 1], [1.52, 0.6], [2.31, 0.35]], 0.12, 0.12); tone(260, t + 0.05, 0.08, 0.2, 'triangle', 180); /* twist */ burst(t + 0.09, 0.18, 0.06, 'bandpass', 1400, 6, 2200); },
    creak(t) { const o = O('sawtooth', 150), b = F('bandpass', 900, 5), g = G(); o.frequency.linearRampToValueAtTime(95, t + 0.32); b.frequency.linearRampToValueAtTime(600, t + 0.32); env(g, t, 0.04, 0.3, 0.2, 'lin'); chain(o, b, g, sfxBus); o.start(t); o.stop(t + 0.4); burst(t, 0.3, 0.12, 'bandpass', 700, 3); },
    spring(t) { const o = O('triangle', 300), g = G(); o.frequency.exponentialRampToValueAtTime(900, t + 0.18); env(g, t, 0.005, 0.2, 0.08); chain(o, g, sfxBus); o.start(t); o.stop(t + 0.25); burst(t + 0.16, 0.05, 0.3, 'highpass', 2200); bellish(t + 0.17, 1500, [[1, 1], [1.7, 0.5]], 0.1, 0.06); },
    pump(t) { burst(t, 0.16, 0.25, 'bandpass', 380, 3, 1300); burst(t, 0.02, 0.2, 'highpass', 3000); tone(220, t + 0.02, 0.1, 0.12, 'sine', 320); },
    clink(t, v = 1) { bellish(t, 2240 + Math.random() * 80, [[1, 1], [1.41, 0.7], [1.83, 0.45], [2.72, 0.25]], 0.28, 0.1 * v); burst(t, 0.012, 0.25 * v, 'highpass', 4000); },
    slide(t) { burst(t, 0.48, 0.3, 'bandpass', 1500, 1.4, 500); burst(t, 0.48, 0.12, 'lowpass', 300); SFX.clink(t + 0.5, 0.7); },
    leaf(t) { tone(700 + Math.random() * 300, t, 0.08, 0.06, 'sine', 1100); },
    coin(t) { const f = 2500 + Math.random() * 500; bellish(t, f, [[1, 1], [1.5, 0.6], [2.08, 0.45], [2.9, 0.2]], 0.32, 0.07); burst(t, 0.008, 0.2, 'highpass', 5000); },
    ching(t) { burst(t, 0.22, 0.12, 'bandpass', 900, 0.8, 300); /* drawer */ bellish(t + 0.18, 1568, [[1, 1], [2, 0.5], [2.76, 0.4], [5.4, 0.15]], 0.9, 0.09); bellish(t + 0.26, 2093, [[1, 1], [2, 0.4], [2.76, 0.3]], 0.8, 0.07); },
    bell(t) { bellish(t, 1318, [[1, 1], [2.0, 0.35], [2.76, 0.3], [5.4, 0.1]], 1.4, 0.06); bellish(t + 0.16, 1046, [[1, 1], [2.0, 0.35], [2.76, 0.3], [5.4, 0.1]], 1.6, 0.06); },
    door(t) { SFX.bell(t); burst(t, 0.12, 0.04, 'lowpass', 600); },
    step(t) { burst(t, 0.05, 0.09, 'bandpass', 1700 + Math.random() * 500, 1.6); tone(90, t, 0.06, 0.08, 'sine', 60); },
    ui(t) { tone(1320, t, 0.035, 0.05, 'triangle'); },
    tick(t) { burst(t, 0.012, 0.18, 'highpass', 3500); tone(1900, t, 0.02, 0.03, 'sine'); },
    ding(t) { bellish(t, 1760, [[1, 1], [2, 0.3], [3, 0.15]], 0.5, 0.08); },
    good(t) { [0, 4, 7, 12].forEach((s, i) => marimba(midi(72 + s), t + i * 0.07, 0.07)); },
    serve(t) { [0, 4, 7, 11, 14].forEach((s, i) => marimba(midi(67 + s), t + i * 0.09, 0.07)); },
    stage(t) { [0, 7].forEach((s, i) => marimba(midi(69 + s), t + i * 0.09, 0.06)); },
    bad(t) { tone(196, t, 0.25, 0.1, 'sawtooth', 150); tone(185, t + 0.02, 0.25, 0.08, 'square', 140); },
    refuse(t) { tone(240, t, 0.18, 0.1, 'sawtooth', 160); tone(160, t + 0.18, 0.3, 0.1, 'sawtooth', 110); },
    sting(t) { [0, 4, 7, 11, 14, 19].forEach((s, i) => marimba(midi(65 + s), t + i * 0.06, 0.06)); SFX.bell(t + 0.45); },
    puff(t) { burst(t, 0.6, 0.05, 'highpass', 3000, 0.7); } };
  const midi = m => 440 * Math.pow(2, (m - 69) / 12);
  function marimba(f, t, v, dest = sfxBus, d = 0.5) { tone(f, t, d, v, 'sine', null, dest, 0.003); tone(f * 4, t, 0.06, v * 0.35, 'sine', null, dest, 0.001); tone(f * 10, t, 0.02, v * 0.12, 'sine', null, dest, 0.001); }
  A.sfx = (name, opts) => { if (!A.on || !ready()) return; try { SFX[name] && SFX[name](now() + 0.005, opts); } catch (e) {} };
  // ---- holds (continuous) ----
  A.loop = name => { if (!A.on || !ready()) return { set() {}, stop() {} }; const t = now(), nodes = [], stopAll = [];
    const mk = (type, f, q, v, lfoHz = 0, lfoAmt = 0) => { const s = N(true), b = F(type, f, q), g = G(0); chain(s, b, g, sfxBus); s.start(t, Math.random()); g.gain.linearRampToValueAtTime(v, t + 0.08); let l = null; if (lfoHz) { l = O('sine', lfoHz); const lg = G(lfoAmt); chain(l, lg, g.gain); l.start(t); } nodes.push({ s, b, g, l, v }); return nodes[nodes.length - 1]; };
    let timer = null; const P = { v: 1 };
    if (name === 'grind') { mk('bandpass', 850, 1.3, 0.16, 27, 0.07); mk('highpass', 3200, 0.7, 0.04); const crunch = () => { if (!P.alive) return; const tt = now(); burst(tt, 0.012 + Math.random() * 0.01, 0.12 * P.v, 'bandpass', 2000 + Math.random() * 3000, 2); timer = setTimeout(crunch, 25 + Math.random() * 45); }; P.alive = true; crunch(); }
    else if (name === 'pour') { mk('lowpass', 700, 0.9, 0.09, 6, 0.04); mk('bandpass', 1900, 3, 0.03, 9, 0.02); const bub = () => { if (!P.alive) return; tone(260 + Math.random() * 380, now(), 0.06, 0.035, 'sine', 500 + Math.random() * 300); timer = setTimeout(bub, 60 + Math.random() * 140); }; P.alive = true; bub(); }
    else if (name === 'steam') { mk('highpass', 2600, 0.7, 0.07); mk('bandpass', 3600, 7, 0.05, 11, 0.03); mk('lowpass', 260, 0.9, 0.0); }
    else if (name === 'milk') { mk('lowpass', 1300, 0.7, 0.06, 4, 0.02); mk('bandpass', 2400, 4, 0.015); }
    else if (name === 'honey') { mk('lowpass', 500, 0.7, 0.03, 3, 0.01); }
    else if (name === 'tamp') { mk('lowpass', 180, 0.7, 0.03); }
    return { set(p = {}) { try { if (name === 'steam' && p.depth != null) { const d = p.depth, tt = now(); nodes[0].g.gain.setTargetAtTime(0.03 + (1 - d) * 0.07, tt, 0.05); nodes[1].b.frequency.setTargetAtTime(2800 + (1 - d) * 2600, tt, 0.05); nodes[1].g.gain.setTargetAtTime((1 - d) * 0.07, tt, 0.05); nodes[2].g.gain.setTargetAtTime(d * 0.16, tt, 0.08); }
          if (name === 'grind' && p.v != null) { P.v = p.v; nodes[0].g.gain.setTargetAtTime(0.06 + 0.12 * p.v, now(), 0.04); } } catch (e) {} },
      stop() { P.alive = false; clearTimeout(timer); const tt = now(); nodes.forEach(n => { try { n.g.gain.cancelScheduledValues(tt); n.g.gain.setValueAtTime(n.g.gain.value, tt); n.g.gain.linearRampToValueAtTime(0.0001, tt + 0.1); n.s.stop(tt + 0.15); n.l && n.l.stop(tt + 0.15); } catch (e) {} }); } }; };
  // ---- audio meter: pitch follows a hold's meter; a fifth joins in when you are in the green ----
  let MT = null;
  A.meter = (v, inBand) => { if (!A.on || !ready()) return; const t = now();
    if (v == null) { if (MT) { const m = MT; MT = null; m.g.gain.setTargetAtTime(0.0001, t, 0.04); setTimeout(() => { try { m.o.stop(); m.o2.stop(); } catch (e) {} }, 300); } return; }
    if (!MT) { const o = O('sine', 300), o2 = O('sine', 450), g = G(0), g2 = G(0), lp = F('lowpass', 1800); chain(o, g, lp, sfxBus); chain(o2, g2, lp); o.start(); o2.start(); MT = { o, o2, g, g2 }; }
    const f = 260 + clamp01(v) * 620; MT.o.frequency.setTargetAtTime(f, t, 0.03); MT.o2.frequency.setTargetAtTime(f * 1.5, t, 0.03); MT.g.gain.setTargetAtTime(0.022, t, 0.05); MT.g2.gain.setTargetAtTime(inBand ? 0.016 : 0, t, 0.05); };
  const clamp01 = v => Math.max(0, Math.min(1, v));
  // ---- café ambience ----
  let AMB = null;
  A.ambience = on => { if (!ready()) return; if (on && !AMB && A.on) { const s = N(true), b1 = F('bandpass', 420, 0.8), b2 = F('lowpass', 900), g = G(0), l = O('sine', 0.13), lg = G(0.006); chain(s, b1, b2, g, out); chain(l, lg, g.gain); s.start(); l.start(); g.gain.linearRampToValueAtTime(0.018, now() + 1.5); AMB = { s, g, l, next: now() + 2 }; }
    else if (!on && AMB) { const a = AMB; AMB = null; a.g.gain.setTargetAtTime(0.0001, now(), 0.3); setTimeout(() => { try { a.s.stop(); a.l.stop(); } catch (e) {} }, 1500); } };
  function ambTick() { if (!AMB || !A.on) return; const t = now(); if (t < AMB.next) return; AMB.next = t + 3 + Math.random() * 6; const r = Math.random(); if (r < 0.55) SFX.clink(t, 0.25 + Math.random() * 0.2); else if (r < 0.75) { SFX.clink(t, 0.2); SFX.clink(t + 0.09, 0.15); } else burst(t, 0.8, 0.012, 'highpass', 3200, 0.7); /* far-off steam */ }
  // ---- MUSIC: an original bossa nova (Fmaj7 · G7 · Gm7 C7 · Fmaj7 Dm7 · Gm7 C7), guitar comp, upright bass, rhodes pad, vibes, shaker + rim ----
  const BPM = 132, E8 = 60 / BPM / 2; // eighth note
  const CH = [['F', [65, 69, 72, 76], 41], ['F', [65, 69, 72, 76], 41], ['G7', [67, 71, 74, 77], 43], ['G7', [67, 71, 74, 77], 43], ['Gm7', [67, 70, 74, 77], 43], ['C7', [64, 67, 70, 72], 36], ['F', [65, 69, 72, 76], 41], ['Dm7', [62, 65, 69, 72], 38], ['Gm7', [67, 70, 74, 77], 43], ['C7', [64, 67, 70, 72], 36], ['Am7', [64, 67, 69, 72], 45], ['D7', [66, 69, 72, 74], 38], ['Gm7', [67, 70, 74, 77], 43], ['C7', [64, 67, 70, 72], 36], ['F', [65, 69, 72, 76], 41], ['C7', [64, 67, 70, 72], 36]];
  const COMP = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0]; // two-bar bossa guitar pattern in eighths
  const RIM = [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0];
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const MEL = (() => { const out = []; seed = 11; for (let bar = 0; bar < CH.length; bar++) { const tones = CH[bar][1].map(m => m + 12); const n = []; for (let e = 0; e < 8; e++) { const r = rnd(); if ((e === 0 && r < 0.7) || (e % 2 === 1 && r < 0.35) || (e === 4 && r < 0.6)) n.push({ e, m: tones[Math.floor(rnd() * tones.length)] + (rnd() < 0.2 ? 2 : 0), d: e === 7 ? 1 : 1 + Math.floor(rnd() * 3) }); } out.push(n); } return out; })();
  const M = { on: false, at: 0, i: 0, mode: 'walk', loopN: 0 };
  function guitar(m, t, v) { const f = midi(m); const o = O('triangle', f), o2 = O('sine', f * 2), g = G(), lp = F('lowpass', 2600, 0.5); lp.frequency.setValueAtTime(3200, t); lp.frequency.exponentialRampToValueAtTime(700, t + 0.5); env(g, t, 0.004, 0.55, v); const g2 = G(0.3); chain(o, g); chain(o2, g2, g); chain(g, lp, musBus); o.start(t); o2.start(t); o.stop(t + 0.7); o2.stop(t + 0.7); }
  function bass(m, t, d) { const f = midi(m); const o = O('sine', f), o2 = O('triangle', f), g = G(), g2 = G(0.25), lp = F('lowpass', 420); env(g, t, 0.01, d, 0.32); chain(o, g); chain(o2, g2, g); chain(g, lp, musBus); o.start(t); o2.start(t); o.stop(t + d + 0.1); o2.stop(t + d + 0.1); }
  function rhodes(ms, t, d) { ms.forEach(m => { const f = midi(m); const o = O('sine', f), mod = O('sine', f * 2), mg = G(f * 0.6), g = G(), trem = O('sine', 4.5), tg = G(0.012); chain(mod, mg, o.frequency); chain(trem, tg, g.gain); env(g, t, 0.02, d, 0.03); mg.gain.setValueAtTime(f * 0.6, t); mg.gain.exponentialRampToValueAtTime(f * 0.05, t + 0.6); chain(o, g, musBus); [o, mod, trem].forEach(x => { x.start(t); x.stop(t + d + 0.1); }); }); }
  function vibes(m, t, d) { const f = midi(m); const o = O('sine', f), o2 = O('sine', f * 4), g = G(), g2 = G(0.12), trem = O('sine', 5.5), tg = G(0.01); env(g, t, 0.003, d * 1.6, 0.05); chain(o2, g2, g); chain(o, g, musBus); chain(trem, tg, g.gain); [o, o2, trem].forEach(x => { x.start(t); x.stop(t + d * 1.6 + 0.1); }); }
  function shaker(t, v) { burst(t, 0.045, v, 'highpass', 6500, 0.7, null, musBus); }
  function rim(t) { burst(t, 0.03, 0.08, 'bandpass', 1900, 3, null, musBus); tone(820, t, 0.03, 0.02, 'square', null, musBus); }
  function musicStep() { if (!M.on || !ready() || !A.musicOn || !A.on) return; const ahead = now() + 0.35;
    while (M.at < ahead) { const t = Math.max(M.at, now() + 0.01), i = M.i, bar = Math.floor(i / 8) % CH.length, e = i % 8, e16 = i % 16, ch = CH[bar], walk = M.mode === 'walk';
      if (COMP[e16]) ch[1].forEach((m, k) => guitar(m - 12 + (k === 0 ? 0 : 0), t + k * 0.012, 0.055));
      if (e === 0) { bass(ch[2], t, E8 * 2.6); rhodes(ch[1], t, E8 * 7.5); } if (e === 3 || e === 4) { if (e === 3 && bar % 2 === 1) bass(ch[2] + 7, t, E8 * 1.6); if (e === 4 && bar % 2 === 0) bass(ch[2] + 7, t, E8 * 2.4); }
      shaker(t, e % 2 ? 0.02 : 0.035); shaker(t + E8 / 2, 0.015); if (RIM[e16]) rim(t);
      if (!walk || M.loopN % 2 === 1) MEL[bar].forEach(n => { if (n.e === e) vibes(n.m + (M.loopN % 3 === 2 && n.e === 0 ? 2 : 0), t, E8 * n.d); });
      M.i++; M.at += E8; if (M.i % (8 * CH.length) === 0) M.loopN++; } }
  A.start = (mode = 'walk') => { M.mode = mode; if (!ready()) return; if (!M.on) { M.on = true; M.at = now() + 0.15; M.i = 0; } musBus.gain.setTargetAtTime(A.musicOn && A.on ? (mode === 'walk' ? 0.55 : 0.7) : 0, now(), 0.6); };
  A.stop = () => { M.on = false; if (musBus) musBus.gain.setTargetAtTime(0, now(), 0.3); };
  A.setMusic = on => { A.musicOn = !!on; if (musBus) musBus.gain.setTargetAtTime(on && A.on ? (M.mode === 'walk' ? 0.55 : 0.7) : 0, now(), 0.3); if (on && !M.on && ctx) { M.on = true; M.at = now() + 0.15; } };
  A.setOn = on => { A.on = !!on; if (!on) { A.meter(null); A.ambience(false); } if (musBus) musBus.gain.setTargetAtTime(on && A.musicOn ? 0.6 : 0, now(), 0.2); };
  A.step = () => { if (!ctx && !ready()) return; musicStep(); ambTick(); };
  A.duck = (on) => { if (musBus && A.musicOn && A.on) musBus.gain.setTargetAtTime(on ? 0.3 : (M.mode === 'walk' ? 0.55 : 0.7), now(), 0.2); };
  return A;
}
