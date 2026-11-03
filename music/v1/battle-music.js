// s197 BATTLE MUSIC v2 (Ben: "not so fast · science fiction · mystical"). Synth, no files, phone-light Web Audio, look-ahead scheduler.
// 84 BPM, D dorian, 8 bars that loop: a wide detuned PAD (slow filter sweep) through a long echo, a deep sub pulse, glassy bell
// arpeggios, a soft taiko-like drum, and a breathy theremin-style lead with vibrato and glide. Mystical, spacey, slow.
// INTENSITY 0..1 (the map sets it from how many foes are close): 0 = pad + sub + bells, 0.4+ = drums + shimmer, 0.75+ = the lead.
// The game's mute (engine/mute-all.js) silences it. Volume in localStorage 'battle.music' (0..1, default 0.5).
//   const BM = battleMusic(); BM.start() · BM.intensity(k) · BM.stop() · BM.volume(v)
// s203 SONGS: 'battle' (mystical sci-fi, s197) · 'range' = the Blaster minigame: brighter, bouncier space-arcade (104 BPM, E minor, pluck arp + steady drums + a whistled hook)
const SONGS = {
  battle: { bpm: 128, bars: 8 },   // s214 Pearl Sail floors: TOWER BATTLE (new)
  mystic: { bpm: 84, bars: 8 },    // s214 SAVED for another place: the s197 mystical sci-fi track (BGM.song('mystic'))
  range: { bpm: 122, bars: 8 } };   // s212 Ben: the blaster song is real BATTLE music now
let BPM = 84, STEP = 60 / BPM / 4, BARS = 8, SONG = 'battle';
const CHORDS = [[50, 57, 62, 65, 69], [48, 55, 60, 64, 67], [46, 53, 58, 62, 65], [45, 52, 57, 61, 64],
  [50, 57, 62, 65, 71], [53, 60, 65, 69, 72], [48, 55, 62, 64, 67], [45, 52, 57, 60, 64]];   // Dm9 · C · Bb · A · Dm6 · F · Cadd9 · Am
const BELL = [0, 2, 4, 3, 1, 4, 2, 3];   // index into the chord, one per 8th
const LEAD = [[0, 74, 6], [6, 76, 2], [8, 77, 8], [32, 81, 6], [38, 79, 2], [40, 77, 4], [44, 76, 4], [64, 74, 8], [72, 72, 4], [76, 69, 4], [96, 76, 6], [102, 74, 2], [104, 73, 8]];
const R_CH = [[52, 59, 64, 67, 71], [48, 55, 60, 64, 67], [55, 62, 67, 71, 74], [50, 57, 62, 66, 69]];   // Em · C · G · D
const R_ARP = [0, 2, 4, 2, 3, 4, 2, 1], R_HOOK = [[0, 76, 2], [2, 79, 2], [4, 83, 4], [10, 81, 2], [12, 79, 4], [16, 76, 2], [18, 79, 2], [20, 84, 4], [26, 83, 2], [28, 79, 4], [32, 76, 2], [34, 79, 2], [36, 83, 4], [42, 86, 2], [44, 83, 4], [48, 81, 4], [52, 79, 4], [56, 78, 8]];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
let one = null;
export function battleMusic() {
  if (one) return one;
  let ctx = null, out = null, wet = null, nb = null, timer = 0, next = 0, step = 0, on = false, want = 0, k = 0;
  let vol = 0.5; try { const v = parseFloat(localStorage.getItem('battle.music')); if (!isNaN(v)) vol = v; } catch (e) {}
  const init = () => { if (ctx) return true; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; out = ctx.createGain(); out.gain.value = vol * 0.92; out.connect(comp); comp.connect(ctx.destination);
    // a long ping-pong-ish echo that makes everything feel like it is in a vast space
    wet = ctx.createGain(); wet.gain.value = 0.5; const d1 = ctx.createDelay(2), d2 = ctx.createDelay(2), fb = ctx.createGain(), lp = ctx.createBiquadFilter();
    d1.delayTime.value = STEP * 3; d2.delayTime.value = STEP * 5; fb.gain.value = 0.42; lp.type = 'lowpass'; lp.frequency.value = 2600;
    wet.connect(d1); d1.connect(lp); lp.connect(d2); d2.connect(fb); fb.connect(d1); const wo = ctx.createGain(); wo.gain.value = 0.55; lp.connect(wo); d2.connect(wo); wo.connect(out);
    const n = ctx.sampleRate * 2; nb = ctx.createBuffer(1, n, ctx.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return true; };
  const vca = (t, a, peak, hold, rel, send = 0) => { const x = ctx.createGain(); x.gain.setValueAtTime(0.0001, t); x.gain.linearRampToValueAtTime(peak, t + a); x.gain.setValueAtTime(peak, t + a + hold); x.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + rel); x.connect(out); if (send) { const s = ctx.createGain(); s.gain.value = send; x.connect(s); s.connect(wet); } return x; };
  const end = (o, t) => { o.start(t); o.stop(t + 0.05); };
  function pad(t, notes, dur) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1200 + 1600 * k, t + dur * 0.5); f.frequency.linearRampToValueAtTime(500, t + dur);
    const g = vca(t, dur * 0.35, 0.05, dur * 0.3, dur * 0.5, 0.6); f.connect(g);
    for (const m of notes.slice(1)) for (const det of [-11, 0, 12]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur * 1.2); } }
  function sub(t, m, v) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(m - 12); const g = vca(t, 0.03, 0.4 * v, STEP * 2, STEP * 3); o.connect(g); o.start(t); o.stop(t + STEP * 6); }
  function bell(t, m, v) { for (const [r, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(m) * r; const g = vca(t, 0.004, 0.07 * v * a, 0, 1.6 / r, 0.8); o.connect(g); o.start(t); o.stop(t + 2); } }
  function drum(t, v, low) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(low ? 95 : 160, t); o.frequency.exponentialRampToValueAtTime(low ? 40 : 70, t + 0.3); const g = vca(t, 0.003, 0.7 * v, 0, 0.45, 0.15); o.connect(g); o.start(t); o.stop(t + 0.5);
    const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = low ? 300 : 700; f.Q.value = 1.5; const ng = vca(t, 0.002, 0.05 * v, 0, 0.06); s.connect(f); f.connect(ng); s.start(t, Math.random()); s.stop(t + 0.1); }   // s197b: only a soft skin tap, no rattle
  function shimmer(t, v) { const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 9000; const g = vca(t, 0.01, 0.05 * v, 0, 0.25, 0.5); s.connect(f); f.connect(g); s.start(t, Math.random()); s.stop(t + 0.3); }
  function lead(t, m, dur, from) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(); o.type = 'sine'; o2.type = 'triangle'; const f0 = mtof(from ?? m), f1 = mtof(m);
    for (const x of [o, o2]) { x.frequency.setValueAtTime(f0, t); x.frequency.exponentialRampToValueAtTime(f1, t + 0.12); }
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f1 * 0.012, t + dur * 0.6); lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    const g = vca(t, 0.15, 0.09, dur * 0.6, dur * 0.6, 0.7); const g2 = ctx.createGain(); g2.gain.value = 0.35; o.connect(g); o2.connect(g2); g2.connect(g);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur * 1.4 + 0.3); } }
  let lastLead = null;
  function play(s, t) { const bar = Math.floor(s / 16) % BARS, i = s % 16, C = CHORDS[bar], hot = k > 0.4, fire = k > 0.75, s128 = s % (16 * BARS);
    if (i === 0) pad(t, C, STEP * 16);
    if (i === 0 || i === 10 || (hot && i === 6)) sub(t, C[0], i === 0 ? 1 : 0.6);
    if (i % 2 === 0 && (k > 0.12 || i % 4 === 0)) bell(t, C[BELL[(i / 2) % 8]] + 12, 0.8 + 0.4 * k);
    if (hot) { if (i === 0 || i === 8) drum(t, 1, true); if (i === 4 || i === 12) drum(t, 0.55, false); if (fire && (i === 14 || i === 15) && bar % 2 === 1) drum(t, 0.4, false); }
    if (fire) for (const [st, m, len] of LEAD) if (st === s128) { lead(t, m, STEP * len, lastLead); lastLead = m; } }
  function pluck(t, mm, v) { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = mtof(mm); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3800, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.18); o.connect(f); f.connect(vca(t, 0.003, 0.06 * v, 0, 0.22, 0.35)); o.start(t); o.stop(t + 0.3); }
  function whistle(t, mm, dur) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(mm); const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 6; lg.gain.value = mtof(mm) * 0.008; lfo.connect(lg); lg.connect(o.frequency); o.connect(vca(t, 0.03, 0.08, dur * 0.6, dur * 0.4, 0.5)); for (const x of [o, lfo]) { x.start(t); x.stop(t + dur + 0.4); } }
  function hatR(t, v) { const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 8000; s.connect(f); f.connect(vca(t, 0.001, 0.035 * v, 0, 0.04)); s.start(t, Math.random()); s.stop(t + 0.06); }
  // s212 BLASTER BATTLE: 122 BPM, C minor, a driving 8th-note bass ostinato, punchy kick + snare, tom fills, saw POWER-CHORD stabs and a brassy lead.
  const B_CH = [[48, 55, 60], [44, 51, 56], [46, 53, 58], [43, 50, 55], [48, 55, 60], [44, 51, 56], [41, 48, 53], [43, 50, 55]];   // Cm · Ab · Bb · G · Cm · Ab · Fm · G
  const B_LEAD = [[0, 72, 3], [3, 74, 1], [4, 75, 4], [8, 74, 2], [10, 72, 2], [12, 70, 4], [16, 68, 3], [19, 70, 1], [20, 72, 6], [26, 70, 2], [28, 67, 4],
    [64, 79, 3], [67, 77, 1], [68, 75, 4], [72, 74, 2], [74, 75, 2], [76, 77, 4], [80, 75, 3], [83, 74, 1], [84, 72, 4], [88, 71, 4], [92, 74, 4]];
  function bKick(t, v) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.11); o.connect(vca(t, 0.002, 0.95 * v, 0, 0.22)); o.start(t); o.stop(t + 0.26); }
  function bSnare(t, v) { const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.7; s.connect(f); f.connect(vca(t, 0.001, 0.42 * v, 0, 0.16, 0.25)); s.start(t, Math.random()); s.stop(t + 0.2);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(230, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.07); o.connect(vca(t, 0.001, 0.28 * v, 0, 0.09)); o.start(t); o.stop(t + 0.12); }
  function bTom(t, f0, v) { const o = ctx.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + 0.2); o.connect(vca(t, 0.002, 0.5 * v, 0, 0.25, 0.2)); o.start(t); o.stop(t + 0.3); }
  function bBass(t, mm, v) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(mm); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 6; f.frequency.setValueAtTime(1300 + 700 * k, t); f.frequency.exponentialRampToValueAtTime(220, t + STEP * 1.6); o.connect(f); f.connect(vca(t, 0.003, 0.3 * v, STEP * 0.6, STEP * 0.8)); o.start(t); o.stop(t + STEP * 2); }
  function bStab(t, C, dur, v) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 2; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(900, t + dur); const g = vca(t, 0.004, 0.06 * v, dur * 0.4, dur * 0.6, 0.35); f.connect(g);
    for (const mm of C) for (const det of [-9, 9]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(mm + 12); o.detune.value = det; o.connect(f); o.start(t); o.stop(t + dur * 1.2 + 0.05); } }
  function bLead(t, mm, dur) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(2600, t + 0.08); f.frequency.linearRampToValueAtTime(1500, t + dur); const g = vca(t, 0.04, 0.085, dur * 0.7, dur * 0.4, 0.45); f.connect(g);
    for (const [ty, det] of [['sawtooth', -6], ['sawtooth', 6], ['square', 0]]) { const o = ctx.createOscillator(); o.type = ty; o.frequency.value = mtof(mm); o.detune.value = det; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(mtof(mm) * 0.006, t + dur); lfo.connect(lg); lg.connect(o.frequency); o.connect(f); for (const x of [o, lfo]) { x.start(t); x.stop(t + dur * 1.3 + 0.1); } } }
  function playRange(s, t) { const bar = Math.floor(s / 16) % BARS, i = s % 16, C = B_CH[bar], s128 = s % 128, hot = k > 0.5, fire = k > 0.8;
    if (i % 4 === 0 || (hot && i === 10)) bKick(t, 1); if (i === 4 || i === 12) bSnare(t, 1); if (hot && i % 2 === 1) hatR(t, 0.9);
    if (bar % 4 === 3 && i >= 12) bTom(t, [220, 180, 150, 120][i - 12], 0.9);
    bBass(t, C[0] - 12 + (i % 4 === 3 ? 12 : 0) + (i === 14 ? 7 : 0), i % 4 === 0 ? 1 : 0.7);
    if (i === 0 || i === 6 || (hot && i === 10)) bStab(t, C, STEP * (i === 0 ? 3 : 2), 1);
    if (i === 0 && bar % 2 === 0) pad(t, C.map(x => x + 12).concat([C[0] + 24]), STEP * 32);
    if (fire || (hot && s128 < 64)) for (const [st, mm, len] of B_LEAD) if (st === s128) bLead(t, mm, STEP * len); }
  // s214 TOWER BATTLE (Pearl Sail floors): 128 BPM E minor, four-on-the-floor kick + clap, 16th synth arp, pulsing octave bass, a wide pad, heroic lead in the hot moments
  const T_CH = [[52, 59, 64, 67], [48, 55, 60, 64], [50, 57, 62, 66], [47, 54, 59, 62], [52, 59, 64, 67], [55, 62, 67, 71], [48, 55, 60, 64], [50, 57, 62, 66]];   // Em · C · D · Bm · Em · G · C · D
  const T_ARP = [0, 1, 2, 3, 2, 1, 2, 3], T_LEAD = [[0, 76, 4], [4, 79, 2], [6, 78, 2], [8, 76, 4], [12, 74, 4], [16, 72, 6], [22, 74, 2], [24, 76, 8], [64, 79, 4], [68, 81, 2], [70, 79, 2], [72, 78, 4], [76, 76, 4], [80, 74, 4], [84, 76, 4], [88, 78, 8]];
  function clap(t, v) { for (const dl of [0, 0.012, 0.024]) { const s = ctx.createBufferSource(); s.buffer = nb; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 1.2; s.connect(f); f.connect(vca(t + dl, 0.001, 0.22 * v, 0, 0.09, 0.3)); s.start(t + dl, Math.random()); s.stop(t + dl + 0.12); } }
  function arp(t, mm, v) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(mm); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 8; f.frequency.setValueAtTime(900 + 2600 * k, t); f.frequency.exponentialRampToValueAtTime(350, t + STEP * 0.9); o.connect(f); f.connect(vca(t, 0.002, 0.07 * v, 0, STEP * 0.95, 0.4)); o.start(t); o.stop(t + STEP * 1.2); }
  function playTower(s, t) { const bar = Math.floor(s / 16) % BARS, i = s % 16, C = T_CH[bar], s128 = s % 128, hot = k > 0.45, fire = k > 0.75;
    if (i % 4 === 0) bKick(t, 1); if (hot && (i === 4 || i === 12)) clap(t, 1); if (i % 4 === 2) hatR(t, 1.2); if (hot && i % 2 === 1) hatR(t, 0.6);
    if (fire && bar % 4 === 3 && i >= 12) bTom(t, [200, 170, 140, 110][i - 12], 0.8);
    bBass(t, C[0] - 12 + (i % 2 ? 12 : 0), i % 4 === 0 ? 1 : 0.6);
    if (k > 0.2) arp(t, C[T_ARP[i % 8]] + 12 + (i >= 8 ? 12 : 0), 0.8 + 0.4 * k);
    if (i === 0) pad(t, [C[0]].concat(C.map(x => x + 12)), STEP * 16);
    if (fire) for (const [st, mm, len] of T_LEAD) if (st === s128) bLead(t, mm, STEP * len); }
  function tick() { if (window.__8gMuted && ctx) { try { if (ctx.state === 'running') AudioContext.prototype.suspend.call(ctx); } catch (e) {} }   /* s267 hard mute */ if (!on || !ctx) return; k += (want - k) * 0.05; while (next < ctx.currentTime + 0.15) { (SONG === 'range' ? playRange : SONG === 'mystic' ? play : playTower)(step, next); next += STEP; step++; } }
  one = {
    start() { if (on || window.__8gMuted) return; if (!init()) return; if (ctx.state === 'suspended' && !window.__8gMuted) ctx.resume().catch(() => {}); on = true; next = ctx.currentTime + 0.08; step = 0; clearInterval(timer); timer = setInterval(tick, 30);
      out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(vol * 0.92, ctx.currentTime, 0.6); },
    stop(fade = 1.2) { if (!on) return; on = false; clearInterval(timer); if (ctx) out.gain.setTargetAtTime(0.0001, ctx.currentTime, fade / 3); },
    song(name) { if (!SONGS[name] || name === SONG) return; SONG = name; BPM = SONGS[name].bpm; STEP = 60 / BPM / 4; BARS = SONGS[name].bars; step = 0; if (ctx && on) next = ctx.currentTime + 0.1; }, get songName() { return SONG; },
    intensity(v) { want = Math.max(0, Math.min(1, v)); }, get on() { return on; },
    volume(v) { vol = Math.max(0, Math.min(1, v)); try { localStorage.setItem('battle.music', String(vol)); } catch (e) {} if (ctx && on) out.gain.setTargetAtTime(vol * 0.92, ctx.currentTime, 0.1); },
    get vol() { return vol; },
  };
  const wake = () => { if (on && ctx && ctx.state === 'suspended' && !window.__8gMuted) ctx.resume().catch(() => {}); };
  addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);
  window.__battleMusic = one; return one;
}
