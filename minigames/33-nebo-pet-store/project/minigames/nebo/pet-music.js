// 8 GATES — MARLOW'S PET STORE music. Two original pieces, played live with WebAudio (no files):
//   "Lantern Waltz"   — cozy folk waltz in D (walking the store, welcome + day cards)
//   "Suds & Scissors" — bouncy 4/4 shop tune in G (while grooming)
// createMusic() → { unlock(), setMode('walk'|'work'|'menu'), setOn(bool), on, toggle(), sting(kind), duck(v), ctx, sfxOut, destroy() }
// The same AudioContext also feeds the sound effects (sfxOut), so phones only ever open one.
const KEY = 'nebo.pets.music';
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
const SC = [0, 2, 4, 5, 7, 9, 11];
const degOf = tonic => (d, oct = 0) => tonic + Math.floor(d / 7) * 12 + SC[((d % 7) + 7) % 7] + oct * 12;
const SONGS = {
  waltz: { tonic: 62, bpm: 96, slots: 6, swing: 1.06,
    prog: [0, 5, 3, 4, 0, 2, 3, 4, 5, 3, 0, 4, 3, 4, 0, 0],
    mel: ['4-2-0-', '5--4 2', '3-4-5-', '6--5-.', '7-6-4-', '4-2-1-', '3-5-7-', '6---..', '5-7-9-', '8--7-5', '4-2-4-', '6--5-4', '3-5-3-', '1-2-4-', '2-1-0-', '0---..'],
    cnt: ['0-.2.4', '.-2.0.', '..3.5.', '4.-.2.', '.2.4.2', '2..1..', '..5.3.', '1.2.4.', '..7.5.', '3.5.3.', '..2.0.', '4.6.4.', '..1.3.', '6.4.2.', '0.2.4.', '..0...'] },
  polka: { tonic: 67, bpm: 116, slots: 8, swing: 1.1,
    prog: [0, 3, 4, 0, 5, 3, 4, 0, 3, 0, 1, 4, 0, 5, 3, 0],
    mel: ['4-4-2-0-', '3-5-7-5-', '4-6-8-6-', '7---4---', '2-4-5-4-', '3-5-7-8-', '9-8-6-4-', '7---....', '5-7-8-7-', '4-2-4-7-', '5-4-2-0-', '1-3-4-6-', '7-9-7-4-', '2-4-2-0-', '3-4-6-8-', '7---....'],
    cnt: ['..0...2.', '..3...5.', '..4...1.', '..0.2.4.', '..5...4.', '..3...0.', '..1...4.', '0.2.4.7.', '..3...5.', '..0...4.', '..1...3.', '..4...6.', '..0...2.', '..5...7.', '..3...4.', '..0.....'] } };
export function createMusic() {
  let ctx = null, master = null, bus = null, sfxOut = null, duckG = null, on = true, mode = 'menu', timer = 0, nextT = 0, step = 0, noise = null, song = 'waltz';
  try { const v = localStorage.getItem(KEY); if (v === '0') on = false; } catch (e) {}
  const VOL = 0.2;
  function build() { if (ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = on ? VOL : 0.0001; duckG = ctx.createGain(); duckG.gain.value = 1; master.connect(duckG); duckG.connect(comp);
    sfxOut = ctx.createGain(); sfxOut.gain.value = 0.9; sfxOut.connect(comp);
    bus = ctx.createBiquadFilter(); bus.type = 'lowpass'; bus.frequency.value = 5200; bus.connect(master);
    const rev = ctx.createDelay(); rev.delayTime.value = 0.23; const fb = ctx.createGain(); fb.gain.value = 0.28; const wet = ctx.createGain(); wet.gain.value = 0.22; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    bus.connect(rev); rev.connect(lp); lp.connect(fb); fb.connect(rev); lp.connect(wet); wet.connect(master);
    const len = ctx.sampleRate * 0.2; noise = ctx.createBuffer(1, len, ctx.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; }
  const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
  function pluck(n, t, vol = 0.32, dec = 0.7, type = 'triangle') { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = type; o2.type = 'sine'; o.frequency.value = midi(n); o2.frequency.value = midi(n + 12); f.type = 'lowpass'; f.frequency.setValueAtTime(3800, t); f.frequency.exponentialRampToValueAtTime(900, t + dec);
    const g2 = ctx.createGain(); g2.gain.value = 0.25; o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); g.connect(bus); env(g, t, 0.006, vol, dec); o.start(t); o2.start(t); o.stop(t + dec + 0.1); o2.stop(t + dec + 0.1); }
  function marimba(n, t, vol = 0.3) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(); o.type = 'sine'; o2.type = 'sine'; o.frequency.value = midi(n); o2.frequency.value = midi(n) * 4; g2.gain.value = 0.18; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(bus); env(g, t, 0.003, vol, 0.45); o.start(t); o2.start(t); o.stop(t + 0.55); o2.stop(t + 0.55); }
  function accordion(n, t, dur, vol = 0.05) { for (const det of [-7, 7]) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'square'; o.frequency.value = midi(n); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 1500; o.connect(f); f.connect(g); g.connect(bus); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.03); g.gain.setValueAtTime(vol, t + dur * 0.8); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.05); } }
  function bass(n, t, dur, vol = 0.42) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = midi(n); o.connect(g); g.connect(bus); env(g, t, 0.01, vol, dur); o.start(t); o.stop(t + dur + 0.1); }
  function pad(ns, t, dur, vol = 0.05) { ns.forEach(n => { for (const det of [-6, 6]) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = midi(n); o.detune.value = det; f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); f.connect(g); g.connect(bus);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.05); } }); }
  function shaker(t, vol = 0.06) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 6500; s.connect(f); f.connect(g); g.connect(bus); env(g, t, 0.004, vol, 0.06); s.start(t); s.stop(t + 0.12); }
  function thump(t, vol = 0.32) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.12); o.connect(g); g.connect(bus); env(g, t, 0.003, vol, 0.16); o.start(t); o.stop(t + 0.2); }
  function bell(n, t, vol = 0.12) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = midi(n); o.connect(g); g.connect(bus); env(g, t, 0.003, vol, 1.2); o.start(t); o.stop(t + 1.3); }
  const songFor = m => m === 'work' ? 'polka' : 'waltz';
  function schedule() { if (!ctx || !on) return; const S = SONGS[song], deg = degOf(S.tonic), eighth = 60 / S.bpm / 2;
    while (nextT < ctx.currentTime + 0.25) { const n = S.slots, bar = Math.floor(step / n) % 16, s = step % n, t = nextT, root = S.prog[bar], m = S.mel[bar][s], c = S.cnt[bar][s], hold = S.mel[bar][s + 1] === '-';
      if (song === 'waltz') {
        if (s === 0) { bass(deg(root, -2), t, eighth * 2.6); pad([deg(root), deg(root + 2), deg(root + 4)], t, eighth * 6, mode === 'menu' ? 0.06 : 0.05); }
        if (s === 2 || s === 4) { pluck(deg(root + 2, -1), t, 0.12, 0.25, 'sine'); pluck(deg(root + 4, -1), t, 0.1, 0.25, 'sine'); }
        if (s === 4 && bar % 2 === 1) bass(deg(root + 4, -2), t, eighth * 1.6);
        if (m && '.- '.indexOf(m) < 0) pluck(deg(+m), t, mode === 'menu' ? 0.22 : 0.3, hold ? 1.0 : 0.6);
        if (mode === 'walk' && bar >= 8 && c && '.-'.indexOf(c) < 0) pluck(deg(+c, 1), t, 0.07, 0.4, 'sine');
        if (bar === 15 && s === 0) bell(deg(7), t + eighth * 3, 0.08);
      } else {
        if (s === 0 || s === 4) { bass(deg(s ? root + 4 : root, -2), t, eighth * 1.6, 0.4); thump(t, s ? 0.2 : 0.3); }
        if (s === 2 || s === 6) { [0, 2, 4].forEach(k => pluck(deg(root + k, -1), t, 0.07, 0.18, 'square')); }
        if (m && '.- '.indexOf(m) < 0) { marimba(deg(+m, 1), t, 0.26); if (bar >= 8) accordion(deg(+m), t, eighth * (hold ? 3 : 1.4), 0.035); }
        if (c && '.-'.indexOf(c) < 0) pluck(deg(+c), t, 0.08, 0.3, 'sine');
        shaker(t, s % 2 ? 0.03 : 0.055);
        if (bar === 7 && s === 6) bell(deg(11), t, 0.08);
      }
      nextT += eighth * (s % 2 === 0 ? S.swing : 2 - S.swing); step++; } }
  function unlock() { build(); if (!ctx) return; if (ctx.state === 'suspended') ctx.resume(); if (!timer) { nextT = ctx.currentTime + 0.1; timer = setInterval(schedule, 60); } }
  const fadeTo = (v, dt = 0.3) => { if (!ctx || !master) return; const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t); master.gain.linearRampToValueAtTime(Math.max(0.0001, v), t + dt); };
  const api = { get on() { return on; }, get ctx() { return ctx; }, get sfxOut() { return sfxOut; }, get noise() { return noise; }, unlock,
    setMode(m) { if (m === mode) return; mode = m; const want = songFor(m); if (ctx && master) { const t = ctx.currentTime; fadeTo(0.0001, 0.35); if (want !== song) setTimeout(() => { song = want; step = 0; nextT = ctx.currentTime + 0.05; fadeTo(on ? VOL : 0.0001, 0.6); }, 380); else setTimeout(() => fadeTo(on ? (m === 'menu' ? VOL * 0.8 : VOL) : 0.0001, 0.6), 380); } else song = want; },
    setOn(v) { on = !!v; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (on) unlock(); fadeTo(on ? VOL : 0.0001, 0.3); if (ctx) nextT = Math.max(nextT, ctx.currentTime + 0.1); return on; },
    toggle() { return api.setOn(!on); },
    duck(v) { if (!ctx || !duckG) return; const t = ctx.currentTime; duckG.gain.cancelScheduledValues(t); duckG.gain.setValueAtTime(duckG.gain.value, t); duckG.gain.linearRampToValueAtTime(v, t + 0.2); },
    sting(kind) { if (!ctx || !on) return; const t = ctx.currentTime + 0.02, deg = degOf(62);
      if (kind === 'done') [4, 6, 9].forEach((d, i) => bell(deg(d, 1), t + i * 0.08, 0.1));
      else if (kind === 'star') [7, 9, 11, 14].forEach((d, i) => bell(deg(d, 1), t + i * 0.07, 0.11));
      else if (kind === 'oops') [3, 2].forEach((d, i) => pluck(deg(d), t + i * 0.12, 0.18, 0.3, 'sine'));
      else if (kind === 'day') { [0, 2, 4, 7].forEach((d, i) => pluck(deg(d), t + i * 0.14, 0.3, 0.9)); bell(deg(14), t + 0.6, 0.12); } },
    destroy() { clearInterval(timer); timer = 0; try { ctx && ctx.close(); } catch (e) {} ctx = null; } };
  return api;
}
