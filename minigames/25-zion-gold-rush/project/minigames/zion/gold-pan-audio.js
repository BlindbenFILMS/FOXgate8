// 8 GATES — ZION · GOLD RUSH: sound + music for the Panning Hall. Everything is synthesized with Web Audio (no files to ship):
//   MUSIC  a frontier string band built from plucked-string physics (Karplus–Strong): walking bass, boom-chick guitar, banjo rolls,
//          shaker and a whistled tune. Moods: 'hall' (full band), 'pan' (soft, filtered, so the water and gravel lead), 'off'.
//   AMBIENCE  the flume (filtered water + bubbles), the waterwheel's creak, the stove's crackle (louder the nearer Ben stands).
//   SFX    gravel rattle + water slosh that follow the wash, the GOLD LINE warning ticks (you can hear when you wash too hard),
//          spills, splash + gurgle on a dip, tweezer tink, nugget chime, coin cascade on a bank, footsteps on boards, UI.
// Reverb: a generated wooden-room impulse. Mobile: the context starts on the first tap (init()), everything is gain-staged under a limiter.
export function createPanAudio() {
  let ctx = null, master, comp, sfx, mus, musLP, rev, revIn, noiseBuf, water = null, slosh = null, rattleT = 0, warnT = 0, bubbleT = 0.4, creakT = 3, crackT = 0.2;
  let muted = false, musicOn = true, mood = 'hall', nextT = 0, step = 0, loop = 0, timer = 0;
  const ks = new Map(), rnd = (a, b) => a + Math.random() * (b - a), mh = m => 440 * Math.pow(2, (m - 69) / 12);
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC();
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1.15; master.connect(comp);
    // a small wooden room: 1.6 s of decaying, darkening noise
    rev = ctx.createConvolver(); { const len = Math.floor(ctx.sampleRate * 1.6), b = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < len; i++) { const k = i / len; lp += (Math.random() * 2 - 1 - lp) * (0.5 - k * 0.42); d[i] = lp * Math.pow(1 - k, 2.6) * (i < 180 ? i / 180 : 1); } } rev.buffer = b; }
    const revOut = ctx.createGain(); revOut.gain.value = 0.32; rev.connect(revOut); revOut.connect(master); revIn = rev;
    sfx = ctx.createGain(); sfx.gain.value = 1; sfx.connect(master); const sfxSend = ctx.createGain(); sfxSend.gain.value = 0.22; sfx.connect(sfxSend); sfxSend.connect(rev);
    musLP = ctx.createBiquadFilter(); musLP.type = 'lowpass'; musLP.frequency.value = 9000; mus = ctx.createGain(); mus.gain.value = musicOn ? 0.6 : 0; mus.connect(musLP); musLP.connect(master); const musSend = ctx.createGain(); musSend.gain.value = 0.28; musLP.connect(musSend); musSend.connect(rev);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    // the flume: two filtered noise beds, slowly breathing
    water = loopNoise([['bandpass', 700, 0.6], ['lowpass', 2600, 0.7]], 0.0); const w2 = loopNoise([['highpass', 2400, 0.7], ['lowpass', 6000, 0.7]], 0.0); water.hi = w2;
    // the wash: a darker slosh that opens up as you swirl harder
    slosh = loopNoise([['lowpass', 500, 2.5]], 0.0); slosh.f = slosh.filters[0];
    nextT = ctx.currentTime + 0.15; timer = setInterval(schedule, 40);
  }
  function loopNoise(filters, vol) { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; let n = s; const fs = []; for (const [type, f, q] of filters) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; n.connect(b); n = b; fs.push(b); } const g = ctx.createGain(); g.gain.value = vol; n.connect(g); g.connect(sfx); s.start(); return { src: s, g, filters: fs }; }
  const T = () => ctx.currentTime;
  function envGain(t, a, peak, d, dest = sfx) { const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); g.connect(dest); return g; }
  function osc(type, f, t, a, peak, d, { to = 0, dest = sfx, detune = 0 } = {}) { if (!ctx) return; const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + a + d); o.detune.value = detune; const g = envGain(t, a, peak, d, dest); o.connect(g); o.start(t); o.stop(t + a + d + 0.05); return o; }
  function burst(t, dur, type, f, q, peak, { to = 0, dest = sfx, a = 0.002 } = {}) { if (!ctx) return; const s = ctx.createBufferSource(); s.buffer = noiseBuf; const b = ctx.createBiquadFilter(); b.type = type; b.frequency.setValueAtTime(f, t); if (to) b.frequency.exponentialRampToValueAtTime(to, t + dur); b.Q.value = q; const g = envGain(t, a, peak, dur, dest); s.connect(b); b.connect(g); s.start(t, Math.random() * 1.5); s.stop(t + dur + a + 0.05); }
  // plucked string (Karplus–Strong), rendered once per note and cached
  function pluckBuf(midi, bright, dur) { const key = midi + '|' + bright + '|' + dur; if (ks.has(key)) return ks.get(key); const sr = ctx.sampleRate, f = mh(midi), N = Math.max(2, Math.round(sr / f)), len = Math.floor(sr * dur), out = new Float32Array(len), ring = new Float32Array(N);
    let prev = 0; for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; prev = prev + (r - prev) * (0.25 + bright * 0.75); ring[i] = prev; }
    const decay = 0.9985 + Math.min(0.0012, 40 / f * 0.0004); let idx = 0; for (let i = 0; i < len; i++) { const a = ring[idx], b = ring[(idx + 1) % N]; out[i] = a; ring[idx] = (a + b) * 0.5 * decay; idx = (idx + 1) % N; }
    const buf = ctx.createBuffer(1, len, sr); buf.copyToChannel(out, 0); ks.set(key, buf); return buf; }
  function pluck(midi, t, vol, bright = 0.5, dur = 1.6, dest = mus) { if (!ctx) return; const s = ctx.createBufferSource(); s.buffer = pluckBuf(midi, bright, dur); const g = ctx.createGain(); g.gain.value = vol; s.connect(g); g.connect(dest); s.start(t); }
  // ---------------- music ----------------
  const BPM = 96, S16 = 60 / BPM / 4;
  const CH = { G: [43, 55, 59, 62, 67], C: [36, 55, 60, 64, 67], D: [38, 54, 57, 62, 66], Em: [40, 55, 59, 64, 67], Am: [45, 57, 60, 64, 69] };
  const PROG = ['G', 'C', 'G', 'D', 'Em', 'C', 'D', 'G'];
  const TUNE = [[[0, 74, 4], [4, 71, 2], [6, 74, 2], [8, 76, 4], [12, 74, 4]], [[0, 71, 4], [4, 69, 4], [8, 67, 8]], [], [[0, 69, 2], [2, 71, 2], [4, 74, 4], [8, 69, 8]], [[0, 71, 4], [4, 67, 4], [8, 64, 4], [12, 67, 4]], [[0, 76, 4], [4, 74, 4], [8, 72, 4], [12, 71, 4]], [[0, 69, 4], [4, 71, 2], [6, 69, 2], [8, 66, 8]], [[0, 67, 12]]];
  const ROLL = [1, 2, 4, 2, 3, 4, 1, 4];
  function whistle(midi, t, len) { const f = mh(midi), o = ctx.createOscillator(), v = ctx.createOscillator(), vg = ctx.createGain(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; v.frequency.value = 5.2; vg.gain.value = f * 0.012; v.connect(vg); vg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.055, t + 0.06); g.gain.setValueAtTime(0.05, t + Math.max(0.07, len - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.12); o.connect(g); g.connect(mus);
    const br = ctx.createBufferSource(); br.buffer = noiseBuf; const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = f * 2; bf.Q.value = 6; const bg = ctx.createGain(); bg.gain.value = 0.012; br.connect(bf); bf.connect(bg); bg.connect(g);
    o.start(t); v.start(t); br.start(t, Math.random()); o.stop(t + len + 0.2); v.stop(t + len + 0.2); br.stop(t + len + 0.2); }
  function schedule() { if (!ctx) return; const ahead = ctx.currentTime + 0.22;
    while (nextT < ahead) { const s = step % 16, bar = Math.floor(step / 16) % 8, ch = CH[PROG[bar]], t = nextT;
      if (musicOn && mood !== 'off') { const full = mood === 'hall';
        if (s === 0) pluck(ch[0] - (bar % 2 ? 0 : 0), t, 0.5, 0.35, 2.2); if (s === 8) pluck(ch[0] + 7, t, 0.42, 0.35, 2.0); if (s === 14 && full && bar % 2) pluck(ch[0] + 5, t, 0.3, 0.35, 1.2);
        if (s === 4 || s === 12) ch.slice(1).forEach((m, i) => pluck(m, t + i * 0.013, full ? 0.16 : 0.1, full ? 0.45 : 0.3, 1.2));
        if (full && s % 2 === 0) { const m = ch[ROLL[(s / 2) % 8]] + 12; pluck(m, t + rnd(0, 0.006), 0.075, 0.95, 0.9); }
        if (s % 2 === 0) burst(t, 0.035, 'highpass', 6500, 0.7, s % 4 === 2 ? 0.03 : 0.016, { dest: mus });
        if (full && loop % 2 === 1) for (const [st, m, l] of TUNE[bar]) if (st === s) whistle(m, t, l * S16 * 0.95); }
      nextT += S16 * (s % 2 ? 0.92 : 1.08); step++; if (step % 128 === 0) loop++; } }
  function setMood(m) { mood = m; if (!ctx) return; musLP.frequency.setTargetAtTime(m === 'pan' ? 2200 : 9000, T(), 0.4); mus.gain.setTargetAtTime(musicOn && m !== 'off' ? (m === 'pan' ? 0.44 : 0.6) : 0, T(), 0.4); }
  // ---------------- per-frame: ambience + the wash ----------------
  function update(dt, s) { if (!ctx) return; const t = T();
    const nearFlume = Math.max(0, 1 - Math.max(0, (s.benZ ?? -4) + 4.6) / 9), panning = !!s.panning, tilt = s.tilt || 0;
    water.g.gain.setTargetAtTime(0.035 + nearFlume * 0.05 + (panning ? 0.015 : 0), t, 0.3); water.hi.g.gain.setTargetAtTime(0.008 + nearFlume * 0.012, t, 0.3); water.filters[0].frequency.setTargetAtTime(650 + Math.sin(t * 0.7) * 120, t, 0.5);
    slosh.g.gain.setTargetAtTime(panning ? 0.012 + tilt * 0.09 : 0, t, 0.08); slosh.f.frequency.setTargetAtTime(300 + tilt * 1500, t, 0.08);
    if ((bubbleT -= dt) < 0) { bubbleT = rnd(0.12, 0.6) / (0.4 + nearFlume); bubble(t, rnd(0.004, 0.012) * (0.4 + nearFlume)); }
    if ((creakT -= dt) < 0) { creakT = rnd(2.6, 4.5); const g = 0.012 * (0.4 + Math.max(0, 1 - Math.hypot((s.benX ?? 0) + 7.5, (s.benZ ?? 0) + 5) / 10)); osc('sawtooth', rnd(70, 95), t, 0.08, g, 0.5, { to: rnd(55, 70) }); }
    { const ds = Math.hypot((s.benX ?? 0) - 6.8, (s.benZ ?? 0) - 4.9); if (ds < 6 && (crackT -= dt) < 0) { crackT = rnd(0.05, 0.35); burst(t, 0.012, 'highpass', rnd(1500, 4000), 1, 0.05 * (1 - ds / 6)); } }
    if (panning && tilt > 0.06 && (rattleT -= dt) < 0) { rattleT = 1 / (6 + tilt * 34) * rnd(0.6, 1.4); const g = (s.gravel ?? 1) * (0.02 + tilt * 0.06); burst(t, rnd(0.008, 0.02), 'bandpass', rnd(2500, 6000), 3, g); if (Math.random() < 0.25) burst(t, 0.03, 'bandpass', rnd(600, 1200), 4, g * 0.6); }
    if (panning && s.over && (warnT -= dt) < 0) { warnT = 0.32; osc('triangle', 1320, t, 0.004, 0.035, 0.07); osc('triangle', 990, t + 0.09, 0.004, 0.03, 0.07); } else if (!s.over) warnT = 0; }
  function bubble(t, v) { const f = rnd(350, 900); osc('sine', f, t, 0.002, v, 0.05, { to: f * rnd(1.8, 2.6) }); }
  // ---------------- one-shots ----------------
  const one = {
    click() { if (!ctx) return; osc('triangle', 1800, T(), 0.001, 0.04, 0.03); },
    open() { if (!ctx) return; const t = T(); osc('triangle', 660, t, 0.004, 0.05, 0.12); osc('triangle', 990, t + 0.07, 0.004, 0.045, 0.16); },
    step(heavy) { if (!ctx) return; const t = T(); burst(t, 0.05, 'bandpass', rnd(260, 380), 1.6, heavy ? 0.12 : 0.08); osc('sine', rnd(95, 130), t, 0.002, 0.05, 0.06, { to: 70 }); },
    hop() { if (!ctx) return; burst(T(), 0.18, 'bandpass', 900, 1, 0.04, { to: 2400 }); },
    talk() { if (!ctx) return; osc('square', rnd(380, 460), T(), 0.002, 0.012, 0.035, { dest: sfx }); },
    start() { if (!ctx) return; const t = T(); burst(t, 0.45, 'bandpass', 400, 1.2, 0.08, { to: 1800, a: 0.12 }); [55, 59, 62, 67].forEach((m, i) => pluck(m, t + 0.05 + i * 0.03, 0.22, 0.6, 1.4, sfx)); },
    spill(n, gold) { if (!ctx) return; const t = T(); for (let i = 0; i < Math.min(5, n); i++) { burst(t + i * 0.025, 0.012, 'bandpass', rnd(2000, 4500), 3, 0.05); bubble(t + 0.12 + i * 0.04, 0.02); } if (gold) { osc('sine', 1760, t, 0.002, 0.05, 0.25, { to: 1100 }); osc('triangle', 660, t + 0.05, 0.01, 0.05, 0.3, { to: 330 }); } },
    dip() { if (!ctx) return; const t = T(); burst(t, 0.45, 'lowpass', 3200, 0.8, 0.28, { to: 380, a: 0.01 }); burst(t + 0.02, 0.25, 'bandpass', 1400, 1.2, 0.08); for (let i = 0; i < 7; i++) bubble(t + 0.15 + i * rnd(0.04, 0.09), 0.035); burst(t + 0.35, 0.6, 'bandpass', 500, 2, 0.06, { to: 300, a: 0.1 }); },
    pick(nug) { if (!ctx) return; const t = T(); burst(t, 0.006, 'highpass', 5000, 1, 0.08); osc('sine', 2637, t, 0.001, 0.06, 0.16); osc('sine', 3951, t, 0.001, 0.03, 0.1); osc('sine', 1975, t + 0.16, 0.002, 0.05, 0.22, { to: 2350 });
      if (nug) [72, 76, 79, 84].forEach((m, i) => { osc('sine', mh(m + 12), t + 0.25 + i * 0.09, 0.003, 0.06, 0.6); osc('sine', mh(m + 12) * 2.76, t + 0.25 + i * 0.09, 0.002, 0.015, 0.25); }); },
    coins(n = 8) { if (!ctx) return; const t = T(); for (let i = 0; i < n; i++) { const tt = t + i * rnd(0.04, 0.075), f = rnd(3200, 4800); osc('sine', f, tt, 0.001, 0.045, 0.12); osc('sine', f * 1.47, tt, 0.001, 0.02, 0.08); osc('sine', f * 0.53, tt, 0.001, 0.02, 0.05); } },
    bank(nug) { if (!ctx) return; const t = T(); burst(t, 0.35, 'bandpass', 600, 1, 0.06, { to: 2400, a: 0.08 }); one.coins(7); [67, 71, 74].forEach((m, i) => pluck(m + 12, t + 0.1 + i * 0.07, 0.2, 0.8, 1.2, sfx)); if (nug) one.pick(true); },
    cleanup() { if (!ctx) return; const t = T(); [74, 79].forEach((m, i) => { osc('sine', mh(m), t + i * 0.1, 0.003, 0.07, 0.5); osc('sine', mh(m) * 2.76, t + i * 0.1, 0.002, 0.015, 0.2); }); },
    lip() { if (!ctx) return; const t = T(); osc('triangle', 784, t, 0.005, 0.06, 0.3, { to: 392 }); osc('sine', 1568, t, 0.002, 0.03, 0.2, { to: 784 }); },
    dry() { if (!ctx) return; const t = T(); burst(t, 0.2, 'lowpass', 300, 1, 0.2); osc('sawtooth', 110, t, 0.01, 0.05, 0.4, { to: 70 }); },
    nextPan() { if (!ctx) return; const t = T(); burst(t, 0.3, 'lowpass', 900, 1, 0.12, { to: 300, a: 0.03 }); pluck(62, t + 0.05, 0.2, 0.6, 1, sfx); },
    sluice() { if (!ctx) return; const t = T(); burst(t, 1.6, 'bandpass', 900, 0.7, 0.14, { to: 500, a: 0.3 }); for (let i = 0; i < 10; i++) setTimeout(() => one.coins(1), 300 + i * 140); },
    fanfare(best) { if (!ctx) return; const t = T(); const seq = best ? [[0, 55], [0.12, 59], [0.24, 62], [0.36, 67], [0.6, 71], [0.6, 74], [0.6, 79]] : [[0, 55], [0.14, 62], [0.28, 67]]; seq.forEach(([d, m]) => { pluck(m, t + d, 0.3, 0.7, 2, sfx); pluck(m + 12, t + d + 0.01, 0.12, 0.9, 1.5, sfx); }); if (best) { [84, 88, 91].forEach((m, i) => osc('sine', mh(m), t + 0.7 + i * 0.08, 0.003, 0.04, 0.9)); one.coins(10); } },
    error() { if (!ctx) return; osc('square', 220, T(), 0.003, 0.03, 0.12); } };
  return { init, update, setMood, ...one, get ctx() { return ctx; },
    setMuted(m) { muted = !!m; if (master) master.gain.setTargetAtTime(muted ? 0 : 1.15, T(), 0.05); }, get muted() { return muted; },
    setMusic(on) { musicOn = !!on; setMood(mood); }, get music() { return musicOn; },
    suspend(v) { if (!ctx) return; try { v ? ctx.suspend() : ctx.resume(); } catch (e) {} },
    dispose() { clearInterval(timer); try { ctx && ctx.close(); } catch (e) {} ctx = null; } };
}
