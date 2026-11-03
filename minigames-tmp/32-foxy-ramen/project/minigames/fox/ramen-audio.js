// 8 GATES — FOXY RAMEN · SOUND + MUSIC. Everything is synthesized with Web Audio (no files to ship), routed through the
// shared Ambience master (village-game.js) with its own compressor, so it is loud enough on a phone speaker but never clips.
//   const snd = createRamenAudio(audio)   // audio = createStage(...).audio
//   snd.unlock()                           // call from a pointer/key handler (browsers need a gesture)
//   snd.play('chop' | 'plop' | 'splash' | 'lift' | 'shake' | 'drop' | 'clink' | 'top' | 'ding' | 'knock' | 'crash' | 'coin' |
//            'register' | 'door' | 'gong' | 'step' | 'swish' | 'slurp' | 'ui' | 'bell' | 'thrilled' | 'happy' | 'okay' |
//            'grumpy' | 'refused' | 'walkout' | 'fanfare' | 'nest')
//   snd.loop('pour' | 'slide' | 'boil', level 0..1)   // continuous sounds; level 0 = off
//   snd.music('walk' | 'shift' | 'off')    // the late-night shamisen loop from the 2D Foxy Ramen game, two tempos
//   snd.setSound(bool) · snd.setMusic(bool) · snd.state() → { sound, music } · snd.buzz(ms | pattern) (phone haptics)
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
const rnd = (a, b) => a + Math.random() * (b - a);

// the 2D game's loop: pentatonic-ish plucks over a low drone, a bell at the end of each phrase
const SCALE = [60, 63, 65, 67, 70, 72, 75, 77, 79, 82];
const PHRASE = [[0, 4], [1, 6], [2, 5], [3.5, 7], [5, 4], [6, 2], [7, 3], [8, 5], [9, 7], [10, 6], [11.5, 8], [13, 5], [14, 3], [15, 4], [16, 6], [17, 8], [18, 7], [19.5, 9], [21, 6], [22, 4], [23, 5], [24, 3], [25, 5], [26, 4], [27.5, 2], [29, 4], [30, 1], [31, 0]];
const BASS = [[0, 36], [8, 41], [16, 39], [24, 43]];

export function createRamenAudio(audio) {
  let c = null, sfx = null, mus = null, comp = null, noise = null, on = true, musicOn = true, mode = 'off', loopAt = 0, beat = 0, iv = 0, hidden = false;
  const loops = {};
  try { const v = JSON.parse(localStorage.getItem('fox.ramen.audio') || 'null'); if (v) { on = v.sound !== false; musicOn = v.music !== false; } } catch (e) {}
  const persist = () => { try { localStorage.setItem('fox.ramen.audio', JSON.stringify({ sound: on, music: musicOn })); } catch (e) {} };
  function ready() {
    if (c) { if (c.state === 'suspended' && !hidden) c.resume(); return c; }
    try { audio.init && audio.init(); } catch (e) {}
    c = audio.ctx; if (!c) return null;
    try { audio.wind.gain.value = 0; audio.rain.gain.value = 0; audio.water.gain.value = 0; } catch (e) {}   // no outdoor wind in a ramen bar
    comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(audio.master || c.destination);
    sfx = c.createGain(); sfx.gain.value = on ? 1 : 0; sfx.connect(comp);
    mus = c.createGain(); mus.gain.value = 0; mus.connect(comp);
    noise = audio.noise || (() => { const b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
    return c; }
  // ---------- building blocks ----------
  function env(g, t, a, peak, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function osc(type, f, dur, vol, o = {}) { if (!ready() || !on) return; const t = c.currentTime + (o.delay || 0), s = c.createOscillator(), g = c.createGain(); s.type = type; s.frequency.setValueAtTime(f, t); if (o.f2) s.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + (o.glide || dur)); env(g, t, o.attack || 0.004, vol, dur);
    let n = s; if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.setValueAtTime(o.lp, t); if (o.lp2) f2.frequency.exponentialRampToValueAtTime(o.lp2, t + dur); n.connect(f2); n = f2; }
    n.connect(g); g.connect(o.bus || sfx); s.start(t); s.stop(t + dur + 0.05); }
  function nz(dur, vol, o = {}) { if (!ready() || !on) return; const t = c.currentTime + (o.delay || 0), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = noise; f.type = o.type || 'bandpass'; f.Q.value = o.q || 1; f.frequency.setValueAtTime(o.f || 1500, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur); env(g, t, o.attack || 0.003, vol, dur); s.connect(f); f.connect(g); g.connect(o.bus || sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05); }
  const bellNote = (f, dur, vol, delay = 0) => { osc('sine', f, dur, vol, { delay }); osc('sine', f * 2.76, dur * 0.5, vol * 0.35, { delay }); osc('sine', f * 5.4, dur * 0.25, vol * 0.12, { delay }); };
  const ceramic = (vol = 0.25, delay = 0) => { const b = rnd(1500, 2100); [1, 1.52, 2.33, 3.1].forEach((k, i) => osc('sine', b * k, 0.35 - i * 0.06, vol / (i + 1.4), { delay })); };
  // ---------- one-shots ----------
  const SND = {
    ui: () => osc('sine', 1180, 0.05, 0.12),
    chop: () => { nz(0.06, 0.55, { f: 3800, f2: 1400, q: 1.2 }); osc('triangle', 210, 0.07, 0.35, { f2: 110 }); nz(0.04, 0.2, { type: 'lowpass', f: 500, delay: 0.01 }); },
    plop: () => { osc('sine', 190, 0.14, 0.4, { f2: 80 }); nz(0.09, 0.18, { type: 'lowpass', f: 700 }); },
    nest: () => { bellNote(1046, 0.35, 0.12); bellNote(1568, 0.35, 0.1, 0.07); },
    splash: () => { nz(0.4, 0.45, { type: 'lowpass', f: 3200, f2: 400 }); for (let i = 0; i < 6; i++) osc('sine', rnd(500, 900), 0.06, 0.12, { f2: rnd(1100, 1600), delay: 0.08 + i * rnd(0.03, 0.07) }); },
    lift: () => { nz(0.35, 0.35, { f: 2200, f2: 700, q: 0.8 }); for (let i = 0; i < 5; i++) osc('sine', rnd(900, 1500), 0.05, 0.1, { f2: rnd(1600, 2400), delay: 0.12 + i * rnd(0.05, 0.1) }); },
    shake: () => { nz(0.14, 0.5, { type: 'highpass', f: 2600 }); osc('square', rnd(700, 900), 0.025, 0.08); nz(0.08, 0.2, { f: 1200, delay: 0.06 }); },
    drop: () => { osc('sine', rnd(240, 300), 0.12, 0.22, { f2: 120 }); nz(0.12, 0.2, { type: 'lowpass', f: 1600, f2: 400 }); },
    clink: () => ceramic(0.3),
    top: () => { osc('sine', rnd(330, 420), 0.09, 0.25, { f2: 180 }); nz(0.05, 0.12, { type: 'lowpass', f: 900 }); },
    ding: () => bellNote(1318, 0.9, 0.22),
    bell: () => { bellNote(2093, 0.6, 0.18); bellNote(2637, 0.6, 0.14, 0.12); },
    knock: () => { osc('sine', 230, 0.12, 0.4, { f2: 160 }); nz(0.05, 0.25, { f: 900, q: 2 }); ceramic(0.12, 0.02); },
    crash: () => { nz(0.7, 0.6, { type: 'lowpass', f: 6000, f2: 300 }); for (let i = 0; i < 7; i++) ceramic(0.16, i * rnd(0.03, 0.08)); osc('sine', 90, 0.4, 0.4, { f2: 50 }); },
    coin: () => { const f = rnd(2300, 2700); osc('sine', f, 0.22, 0.16); osc('sine', f * 2.7, 0.12, 0.07); osc('triangle', f * 0.5, 0.05, 0.05); },
    register: () => { nz(0.08, 0.25, { f: 2500, q: 3 }); osc('square', 320, 0.04, 0.08, { delay: 0.02 }); bellNote(1760, 0.6, 0.2, 0.09); bellNote(2349, 0.7, 0.18, 0.18); },
    door: () => { bellNote(880, 1.0, 0.18); bellNote(660, 1.2, 0.16, 0.22); },
    gong: () => { osc('sine', 98, 2.4, 0.5, { attack: 0.01 }); osc('sine', 98 * 2.41, 1.6, 0.18); osc('sine', 98 * 3.9, 1.0, 0.08); nz(0.4, 0.12, { type: 'lowpass', f: 400 }); },
    step: () => nz(0.06, 0.16, { type: 'lowpass', f: rnd(380, 520) }),
    swish: () => nz(0.32, 0.18, { f: 1300, f2: 600, q: 0.7, attack: 0.08 }),
    slurp: () => { nz(0.35, 0.22, { f: 500, f2: 2600, q: 3, attack: 0.05 }); nz(0.2, 0.12, { f: 900, f2: 1800, q: 4, delay: 0.38, attack: 0.04 }); },
    thrilled: () => [72, 76, 79, 84].forEach((m, i) => { osc('triangle', midiHz(m), 0.3, 0.2, { delay: i * 0.09 }); osc('sine', midiHz(m + 12), 0.2, 0.06, { delay: i * 0.09 }); }),
    happy: () => [72, 79].forEach((m, i) => osc('triangle', midiHz(m), 0.3, 0.2, { delay: i * 0.1 })),
    okay: () => osc('triangle', midiHz(69), 0.35, 0.16),
    grumpy: () => [67, 63].forEach((m, i) => osc('triangle', midiHz(m), 0.3, 0.16, { delay: i * 0.16 })),
    refused: () => { osc('square', 150, 0.32, 0.14, { lp: 900 }); osc('square', 112, 0.32, 0.12, { lp: 900, delay: 0.16 }); },
    walkout: () => { osc('sawtooth', 300, 0.5, 0.08, { f2: 140, lp: 1200 }); },
    fanfare: () => [60, 64, 67, 72, 76, 79].forEach((m, i) => { osc('triangle', midiHz(m), 0.35, 0.18, { delay: i * 0.11 }); if (i === 5) bellNote(midiHz(m + 12), 1.2, 0.12, i * 0.11); }),
  };
  // ---------- continuous loops ----------
  function loopNode(k) { if (loops[k]) return loops[k]; if (!ready()) return null; const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), L = { s, f, g };
    s.buffer = noise; s.loop = true; g.gain.value = 0;
    if (k === 'pour') { f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8; const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 7; lg.gain.value = 300; l.connect(lg); lg.connect(f.frequency); l.start(); }
    else if (k === 'slide') { f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 1.4; }
    else { f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 0.6; }
    s.connect(f); f.connect(g); g.connect(sfx); s.start(); loops[k] = L; return L; }
  let boilT = 0;
  const api = {
    unlock() { ready(); },
    play(k) { const f = SND[k]; if (f && on) try { f(); } catch (e) {} },
    loop(k, level) { if (!c && level <= 0) return; const L = loopNode(k); if (!L) return; const v = on ? Math.max(0, level) : 0, peak = k === 'pour' ? 0.32 : k === 'slide' ? 0.4 : 0.14; L.g.gain.setTargetAtTime(v * peak, c.currentTime, 0.05);
      if (k === 'slide') L.f.frequency.setTargetAtTime(300 + level * 500, c.currentTime, 0.05); },
    // a random bubble 'blip' while baskets boil (call every frame with dt and how many baskets are cooking)
    boil(dt, n) { if (!c || !on || !n) return; boilT -= dt; if (boilT > 0) return; boilT = rnd(0.05, 0.22) / n; osc('sine', rnd(250, 520), 0.05, 0.05 + 0.02 * n, { f2: rnd(700, 1100), glide: 0.04 }); },
    music(m) { mode = m; if (!ready()) return; if (m === 'off' || !musicOn) { mus.gain.setTargetAtTime(0, c.currentTime, 0.4); return; } mus.gain.setTargetAtTime(m === 'shift' ? 0.5 : 0.36, c.currentTime, 0.6); if (!iv) { loopAt = c.currentTime + 0.1; beat = 0; iv = setInterval(schedule, 110); } },
    setSound(v) { on = !!v; persist(); if (sfx) sfx.gain.setTargetAtTime(on ? 1 : 0, c.currentTime, 0.05); if (!on) Object.values(loops).forEach(L => L.g.gain.value = 0); },
    setMusic(v) { musicOn = !!v; persist(); api.music(mode); },
    state: () => ({ sound: on, music: musicOn }),
    buzz(p) { try { if (on && navigator.vibrate) navigator.vibrate(p); } catch (e) {} },
    pause(v) { hidden = !!v; if (!c) return; try { v ? c.suspend() : c.resume(); } catch (e) {} },
    destroy() { clearInterval(iv); iv = 0; Object.values(loops).forEach(L => { try { L.s.stop(); } catch (e) {} }); } };
  // ---------- music scheduler: 32-beat phrase, look-ahead 0.5 s ----------
  function voice(kind, f, t, dur, vol) { const s = c.createOscillator(), g = c.createGain();
    if (kind === 'pluck') { s.type = 'sawtooth'; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(3400, t); lp.frequency.exponentialRampToValueAtTime(500, t + dur * 0.8); s.connect(lp); lp.connect(g); env(g, t, 0.004, vol, dur); const s2 = c.createOscillator(), g2 = c.createGain(); s2.type = 'triangle'; s2.frequency.value = f * 2.005; env(g2, t, 0.003, vol * 0.25, dur * 0.5); s2.connect(g2); g2.connect(mus); s2.start(t); s2.stop(t + dur + 0.05); }
    else if (kind === 'drone') { s.type = 'sine'; s.connect(g); env(g, t, 0.35, vol, dur); }
    else if (kind === 'bass') { s.type = 'triangle'; s.connect(g); env(g, t, 0.01, vol, dur); }
    else if (kind === 'bell') { s.type = 'sine'; s.connect(g); env(g, t, 0.004, vol, dur); const s2 = c.createOscillator(), g2 = c.createGain(); s2.frequency.value = f * 2.76; env(g2, t, 0.004, vol * 0.3, dur * 0.5); s2.connect(g2); g2.connect(mus); s2.start(t); s2.stop(t + dur); }
    else if (kind === 'wood') { s.type = 'sine'; s.frequency.setValueAtTime(f, t); s.frequency.exponentialRampToValueAtTime(f * 0.7, t + dur); s.connect(g); env(g, t, 0.002, vol, dur); }
    if (kind !== 'wood') s.frequency.value = f; g.connect(mus); s.start(t); s.stop(t + dur + 0.05); }
  function schedule() { if (!c || mode === 'off' || !musicOn || hidden) { if (c) loopAt = Math.max(loopAt, c.currentTime + 0.05); return; } const spb = mode === 'shift' ? 0.3 : 0.42;
    while (loopAt < c.currentTime + 0.5) { const t = loopAt, b = beat % 32;
      PHRASE.forEach(([pb, i]) => { if (Math.floor(pb) === b) voice('pluck', midiHz(SCALE[i]), t + (pb - b) * spb, 0.9 * spb / 0.38, 0.05); });
      if (b % 8 === 0) voice('drone', midiHz(b % 16 ? 43 : 36), t, 3.0, 0.05);
      BASS.forEach(([bb, m]) => { if (bb === b && mode === 'shift') voice('bass', midiHz(m), t, spb * 3, 0.07); });
      if (b % 8 === 7) voice('bell', midiHz(84), t + spb * 0.5, 0.6, 0.02);
      if (mode === 'shift') { if (b % 2 === 0) voice('wood', b % 4 === 0 ? 900 : 1300, t, 0.05, b % 4 === 0 ? 0.06 : 0.035); }
      loopAt += spb; beat++; } }
  return api;
}
