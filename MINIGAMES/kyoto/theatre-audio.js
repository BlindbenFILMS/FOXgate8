// 8 GATES — KYOTO THEATRE AUDIO. All synthesised (no samples): koto plucks, shakuhachi breath-flute, taiko + kotsuzumi, hyoshigi clappers,
// mask rustle, audience murmur / ooh / gasp / cough / applause, all through one small hall reverb. Scale: hirajoshi on D (the 2D game's koto).
// const A = theatreAudio(ambience); A.init() on a user gesture; A.tick(dt, mood) each frame drives the music; one-shots below.
const HIRA = [293.66, 311.13, 392, 440, 466.16];
export const MOODS = { gate: { bpm: 66, dens: 0.42, oct: 0, flute: 0.5 }, house: { bpm: 78, dens: 0.55, oct: 0, flute: 0.15 }, field: { bpm: 88, dens: 0.62, oct: 1, flute: 0.25 }, door: { bpm: 58, dens: 0.3, oct: -1, flute: 0.4 }, wood: { bpm: 62, dens: 0.34, oct: -1, flute: 0.7 }, dawn: { bpm: 70, dens: 0.45, oct: 1, flute: 0.6 }, intro: { bpm: 60, dens: 0.3, oct: 0, flute: 0.4 } };

export function theatreAudio(amb) {
  let ctx = null, out = null, wet = null, noise = null, murmur = null, murG = null, ready = false, muted = false;
  const M = { beat: 0, deg: 2, lastFlute: -9, on: false };
  function init() { try { amb.init && amb.init(); } catch (e) {} if (ready || !amb.ctx) return; ctx = amb.ctx; if (amb.wind) amb.wind.gain.value = 0; if (amb.rain) amb.rain.gain.value = 0; if (amb.water) amb.water.gain.value = 0;
    out = ctx.createGain(); out.gain.value = 0.9; out.connect(amb.master);
    const rev = ctx.createConvolver(), len = Math.floor(ctx.sampleRate * 2.4), ir = ctx.createBuffer(2, len, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4) * (i < 400 ? i / 400 : 1); } rev.buffer = ir;
    wet = ctx.createGain(); wet.gain.value = 0.32; out.connect(rev); rev.connect(wet); wet.connect(amb.master);
    noise = amb.noise || (() => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    // the house: a low murmur bed that swells with the audience
    { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.8; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; murG = ctx.createGain(); murG.gain.value = 0; s.connect(bp); bp.connect(lp); lp.connect(murG); murG.connect(out); s.start(); murmur = s; }
    ready = true; }
  const T = () => ctx.currentTime, env = (g, t, a, peak, d, end = 0.0001) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); };
  const nz = (t, dur, type, f, q, vol, a = 0.004, dest = out) => { const s = ctx.createBufferSource(); s.buffer = noise; const f1 = ctx.createBiquadFilter(); f1.type = type; f1.frequency.setValueAtTime(f, t); f1.Q.value = q; const g = ctx.createGain(); env(g, t, a, vol, dur); s.connect(f1); f1.connect(g); g.connect(dest); s.start(t, Math.random() * 1.5); s.stop(t + a + dur + 0.05); return { f: f1, g }; };
  const osc = (t, type, f0, f1, dur, vol, a = 0.004, dest = out) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6); const g = ctx.createGain(); env(g, t, a, vol, dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + a + dur + 0.05); return { o, g }; };
  // ---- instruments
  function koto(f, vol = 0.16, t = T(), bend = 0) { if (!ready || muted) return; const g = ctx.createGain(); env(g, t, 0.003, vol, 1.8); const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(Math.min(9000, f * 9), t); lp.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.45); lp.connect(g); g.connect(out);
    for (const [ty, dt, k] of [['sawtooth', 0, 0.55], ['triangle', 1.003, 0.8], ['square', 2.001, 0.12]]) { const o = ctx.createOscillator(); o.type = ty; o.frequency.setValueAtTime(f * (dt || 1), t); if (bend) { o.frequency.setValueAtTime(f * (dt || 1), t + 0.18); o.frequency.exponentialRampToValueAtTime(f * (dt || 1) * Math.pow(2, bend / 12), t + 0.32); } const og = ctx.createGain(); og.gain.value = k; o.connect(og); og.connect(lp); o.start(t); o.stop(t + 2); }
    nz(t, 0.02, 'highpass', 3000, 0.7, vol * 0.5); }
  function flute(f, dur = 2.2, vol = 0.07, t = T()) { if (!ready || muted) return; const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 0.94, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.35); const v = ctx.createOscillator(); v.frequency.value = 5.2; const vg = ctx.createGain(); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.7); v.connect(vg); vg.connect(o.frequency);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.25); g.gain.setValueAtTime(vol, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.setValueAtTime(f * 2 * 0.94, t); o2.frequency.exponentialRampToValueAtTime(f * 2, t + 0.35); const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(out); o.start(t); o2.start(t); v.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1); v.stop(t + dur + 0.1);
    const b = nz(t, dur * 0.9, 'bandpass', f * 2.1, 2.5, vol * 0.55, 0.08); b.g.gain.setValueAtTime(vol * 0.9, t + 0.06); b.g.gain.exponentialRampToValueAtTime(vol * 0.25, t + 0.4); }
  function taiko(ok = true, vol = 0.65, t = T()) { if (!ready || muted) return; osc(t, 'sine', ok ? 105 : 82, ok ? 46 : 40, 0.55, vol); osc(t, 'triangle', ok ? 160 : 120, 70, 0.18, vol * 0.3); nz(t, 0.12, 'lowpass', ok ? 420 : 260, 0.8, vol * 0.5, 0.002); nz(t, 0.03, 'bandpass', 1800, 2, vol * 0.25, 0.001); }
  function pon(t = T(), vol = 0.2) { if (!ready || muted) return; osc(t, 'sine', 340, 210, 0.22, vol); nz(t, 0.05, 'bandpass', 900, 4, vol * 0.4, 0.002); }
  function ta(t = T(), vol = 0.18) { if (!ready || muted) return; nz(t, 0.035, 'bandpass', 2600, 6, vol, 0.001); osc(t, 'square', 1200, 900, 0.03, vol * 0.2); }
  function clap(t = T(), vol = 0.32) { if (!ready || muted) return; nz(t, 0.045, 'bandpass', 2300, 9, vol, 0.0008); nz(t, 0.02, 'highpass', 5000, 1, vol * 0.4, 0.0008); osc(t, 'sine', 1900, 1700, 0.05, vol * 0.25); }
  function hyoshigi(n = 2, accel = false, t = T()) { if (!ready || muted) return; let tt = t; for (let i = 0; i < n; i++) { clap(tt, 0.3 + (accel ? i / n * 0.1 : 0)); tt += accel ? Math.max(0.045, 0.5 * Math.pow(0.82, i)) : 0.11; } return tt - t; }
  function rustle(t = T()) { if (!ready || muted) return; const r = nz(t, 0.22, 'bandpass', 2400, 0.9, 0.09, 0.04); r.f.frequency.exponentialRampToValueAtTime(4200, t + 0.2); nz(t + 0.24, 0.05, 'bandpass', 700, 3, 0.12, 0.002); osc(t + 0.24, 'sine', 420, 300, 0.06, 0.06); }
  function stamp(t = T()) { if (!ready || muted) return; osc(t, 'sine', 70, 34, 0.7, 0.8); nz(t, 0.25, 'lowpass', 300, 0.7, 0.6, 0.002); nz(t, 0.06, 'bandpass', 900, 1.5, 0.3, 0.001); }
  // ---- the audience
  function ooh(t = T(), vol = 0.1) { if (!ready || muted) return; for (const [f, q] of [[480, 6], [900, 7]]) { const n = nz(t, 1.1, 'bandpass', f, q, vol, 0.35); n.f.frequency.exponentialRampToValueAtTime(f * 0.86, t + 1.2); } }
  function gasp(t = T(), vol = 0.16) { if (!ready || muted) return; const n = nz(t, 0.5, 'bandpass', 1300, 1.2, vol, 0.06); n.f.frequency.exponentialRampToValueAtTime(2600, t + 0.25); }
  function cough(t = T()) { if (!ready || muted) return; for (const dt of [0, 0.22]) { nz(t + dt, 0.12, 'bandpass', 650 + Math.random() * 200, 1.4, 0.13, 0.008); nz(t + dt, 0.06, 'lowpass', 300, 1, 0.08, 0.004); } }
  function applause(dur = 2.6, dens = 40, vol = 0.12, t = T()) { if (!ready || muted) return; const n = Math.floor(dur * dens); for (let i = 0; i < n; i++) { const tt = t + Math.random() * dur, k = 1 - Math.max(0, (tt - t) / dur - 0.6) / 0.4; nz(tt, 0.03, 'bandpass', 1500 + Math.random() * 2500, 1.5, vol * k * (0.5 + Math.random() * 0.5), 0.001); } }
  function swell(level) { if (!ready || !murG) return; murG.gain.setTargetAtTime(muted ? 0 : 0.015 + level * 0.05, T(), 0.6); }
  // ---- the music: a koto line that wanders hirajoshi, kotsuzumi calls that lead into every drum, the shakuhachi on the long notes
  function tick(dt, mood, lineU, playing) { if (!ready || muted) return; const md = MOODS[mood] || MOODS.house, spb = 60 / md.bpm / 2; M.beat += dt / spb;
    while (M.beat >= 1) { M.beat -= 1; M.n = (M.n || 0) + 1; const t = T() + 0.02, ph = M.n % 16;
      if (Math.random() < md.dens * (ph % 4 === 0 ? 1.4 : ph % 2 ? 0.55 : 0.9)) { const step = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]; M.deg = Math.max(0, Math.min(11, M.deg + step)); const oc = Math.floor(M.deg / 5) + md.oct, f = HIRA[M.deg % 5] * Math.pow(2, oc - (md.oct < 0 ? 0 : 0)); koto(f * (oc < 0 ? 0.5 : 1), 0.1 + Math.random() * 0.05, t, Math.random() < 0.12 ? 1 : 0);
        if (ph === 0 && Math.random() < 0.5) koto(HIRA[(M.deg + 2) % 5] * 0.5, 0.08, t + 0.01); }
      if (ph === 8 && Math.random() < 0.35) { koto(HIRA[0] * 0.5, 0.12, t); koto(HIRA[2] * 0.5, 0.08, t + 0.06); }
      if (Math.random() < md.flute * 0.05 && T() - M.lastFlute > 7) { M.lastFlute = T(); flute(HIRA[[0, 2, 3, 4][Math.floor(Math.random() * 4)]] * (md.oct > 0 ? 2 : 1), 2.4 + Math.random() * 1.6, 0.055, t); } }
    if (playing && lineU != null) { for (const [at, fn] of [[0.52, 'pon'], [0.72, 'ta'], [0.86, 'pon']]) { if (M.lastU < at && lineU >= at) { if (fn === 'pon') pon(T(), 0.17); else ta(T(), 0.16); } } M.lastU = lineU; } else M.lastU = 0; }
  return { init, koto, flute, taiko, pon, ta, hyoshigi, rustle, stamp, ooh, gasp, cough, applause, swell, tick, setMuted(v) { muted = !!v; swell(0); }, get ready() { return ready; }, HIRA };
}
