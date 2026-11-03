// 8 GATES — SHUT THE BOX · AUDIO. No sound files: every sound is built once, at start, from physical-style models
// (modal synthesis: a strike excites a few decaying resonances, the way wood, ivory dice and brass ring), then played from buffers.
// MUSIC: a small tavern-lounge combo (walking upright bass, electric-piano comping, marimba melody, brushes) in C, 96 bpm, swung,
// on a 16-bar loop. It ducks under the big moments. setMusic(false) turns it off; a world with its own music opens the page with ?music=0.
// API: on() (call from a tap) · setMusic(on) · setSfx(on) · suspend(hidden) · tick/untick/ui/knock/diceHit/rattle/coin/shutBox/stuck/turn/bad/cheer
export function makeAudio() {
  let ac = null, master, sfxBus, musBus, verbIn, B = null, musicOn = true, sfxOn = true, musTimer = 0, nextT = 0, step = 0, started = false, duckUntil = 0;
  const SPB = 60 / 96, SWING = 0.64;   // seconds per beat, swing ratio

  function on() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      master = ac.createGain(); master.gain.value = 0.8; const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2; master.connect(comp); comp.connect(ac.destination);
      sfxBus = ac.createGain(); sfxBus.gain.value = sfxOn ? 1 : 0; sfxBus.connect(master);
      musBus = ac.createGain(); musBus.gain.value = 0; musBus.connect(master);
      const verb = ac.createConvolver(); verb.buffer = impulse(1.7); verbIn = ac.createGain(); verbIn.gain.value = 0.22; const vOut = ac.createGain(); vOut.gain.value = 0.55; verbIn.connect(verb); verb.connect(vOut); vOut.connect(master);
      B = build(); }
    if (ac.state === 'suspended') ac.resume();
    if (musicOn && !started) startMusic();
    return ac;
  }

  // ---------- sound building ----------
  function impulse(dur) { const n = Math.floor(ac.sampleRate * dur), b = ac.createBuffer(2, n, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { const t = i / n; lp += 0.35 * ((Math.random() * 2 - 1) - lp); d[i] = lp * Math.pow(1 - t, 2.6) * (i < 200 ? i / 200 : 1); } } return b; }
  // partials: [freq, amp, decay s]; noise: strike transient (amount, decay s, lowpass 0..1)
  function modal(dur, partials, noise = [0, 0.01, 0.5], att = 0.0012) { const sr = ac.sampleRate, n = Math.ceil(dur * sr), b = ac.createBuffer(1, n, sr), d = b.getChannelData(0); let lp = 0, peak = 0;
    for (let i = 0; i < n; i++) { const t = i / sr; let v = 0; for (const [f, a, k] of partials) v += a * Math.exp(-t / k) * Math.sin(6.283185 * f * t);
      lp += noise[2] * ((Math.random() * 2 - 1) - lp); v += noise[0] * Math.exp(-t / noise[1]) * lp; v *= Math.min(1, t / att); d[i] = v; peak = Math.max(peak, Math.abs(v)); }
    for (let i = 0; i < n; i++) d[i] /= peak || 1; return b; }
  function noiseBuf(dur, shape, lpK = 1) { const sr = ac.sampleRate, n = Math.ceil(dur * sr), b = ac.createBuffer(1, n, sr), d = b.getChannelData(0); let lp = 0; for (let i = 0; i < n; i++) { lp += lpK * ((Math.random() * 2 - 1) - lp); d[i] = lp * shape(i / n, i / sr); } return b; }
  function build() { const f = 523.25;
    return {
      knock: modal(0.35, [[176, 1, 0.08], [412, 0.62, 0.055], [918, 0.34, 0.035], [1640, 0.18, 0.02]], [0.7, 0.008, 0.35]),           // a tile flipping onto the wood rack
      tick: modal(0.08, [[1380, 0.7, 0.018], [2950, 0.45, 0.01]], [0.35, 0.003, 0.6]),                                                   // picking a tile up
      felt: modal(0.12, [[118, 0.9, 0.03], [265, 0.45, 0.018]], [0.8, 0.012, 0.12]),                                                     // a die landing on felt
      clack: modal(0.12, [[2280, 0.6, 0.02], [3720, 0.55, 0.013], [5640, 0.32, 0.008], [7900, 0.15, 0.005]], [0.6, 0.004, 0.75]),        // ivory on wood / ivory on ivory
      coin: modal(1.2, [[2637, 0.5, 0.45], [3990, 0.4, 0.32], [6120, 0.26, 0.2], [8020, 0.15, 0.12]], [0.3, 0.003, 0.9]),                 // a gold coin
      marimba: modal(1.4, [[f, 1, 0.42], [f * 3.93, 0.32, 0.07], [f * 9.24, 0.12, 0.025]], [0.12, 0.004, 0.4], 0.002),                    // C5, repitched
      epiano: modal(2.6, [[261.63, 1, 1.5], [523.25, 0.22, 0.8], [784.9, 0.07, 0.45], [3662, 0.06, 0.04]], [0.04, 0.003, 0.3], 0.004),     // C4 tine piano
      bass: modal(1.6, [[110, 1, 0.75], [220, 0.42, 0.42], [330, 0.16, 0.22], [440, 0.06, 0.1]], [0.25, 0.01, 0.08], 0.004),             // A2 upright pluck
      brush: noiseBuf(0.32, (t, s) => Math.min(1, s / 0.02) * Math.pow(1 - t, 2.2), 0.55),
      ride: modal(0.5, [[5120, 0.4, 0.22], [7350, 0.3, 0.14], [3420, 0.25, 0.3]], [0.5, 0.006, 0.9]),
      kick: (() => { const sr = ac.sampleRate, n = Math.ceil(0.35 * sr), b = ac.createBuffer(1, n, sr), d = b.getChannelData(0); let ph = 0; for (let i = 0; i < n; i++) { const t = i / sr, fr = 48 + 70 * Math.exp(-t / 0.04); ph += 6.283185 * fr / sr; d[i] = Math.sin(ph) * Math.exp(-t / 0.13) * Math.min(1, t / 0.002); } return b; })(),
      clap: noiseBuf(0.09, (t, s) => (s < 0.004 || (s > 0.011 && s < 0.015) || s > 0.02 ? 1 : 0.3) * Math.exp(-s / 0.03), 0.7),
    }; }
  function play(buf, { when = 0, rate = 1, vol = 0.5, pan = 0, verb = 0.15, bus = sfxBus, lp = 0, hp = 0 } = {}) {
    if (!ac || !B) return; const t = ac.currentTime + Math.max(0, when), s = ac.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate; let node = s;
    if (lp) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; node.connect(f); node = f; }
    if (hp) { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; node.connect(f); node = f; }
    const g = ac.createGain(); g.gain.value = vol; node.connect(g); let out = g;
    if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); out = p; }
    out.connect(bus); if (verb) { const v = ac.createGain(); v.gain.value = verb; out.connect(v); v.connect(verbIn); } s.start(t); }
  const j = (a = 0.06) => 1 + (Math.random() * 2 - 1) * a;   // a little variation so no two hits sound the same
  const midiRate = (m, base) => Math.pow(2, (m - base) / 12);
  const mar = (m, when, vol = 0.35, pan = 0, bus = sfxBus) => play(B.marimba, { when, rate: midiRate(m, 72), vol, pan, verb: 0.3, bus });

  // ---------- the game's sounds ----------
  const S = {
    on, get ctx() { return ac; },
    tick: () => play(B && B.tick, { rate: j(0.05) * 1.05, vol: 0.32, verb: 0.05 }),
    untick: () => play(B && B.tick, { rate: j(0.05) * 0.8, vol: 0.26, verb: 0.05 }),
    ui: () => play(B && B.tick, { rate: 1.4, vol: 0.16, verb: 0 }),
    knock: (when = 0, pan = 0) => { play(B && B.knock, { when, rate: j(0.07), vol: 0.62, pan, verb: 0.18 }); play(B && B.felt, { when: when + 0.03, rate: j(), vol: 0.25, pan, verb: 0 }); },
    // a die hitting something: felt (soft thud) or wood / another die (bright click). vol 0..1 = how hard
    diceHit: (vol = 0.6, pan = 0, felt = true) => { if (felt) { play(B && B.felt, { rate: j(0.1), vol: 0.55 * vol, pan, verb: 0.04 }); play(B && B.clack, { rate: j(0.12) * 0.8, vol: 0.12 * vol, pan, verb: 0.05, lp: 2600 }); } else play(B && B.clack, { rate: j(0.12), vol: 0.5 * vol, pan, verb: 0.12 }); },
    rattle: () => { if (!B) return; for (let i = 0; i < 9; i++) play(B.clack, { when: i * 0.045 + Math.random() * 0.025, rate: j(0.15) * 0.9, vol: 0.14 + Math.random() * 0.1, pan: (Math.random() - 0.5) * 0.4, verb: 0.08, hp: 900 }); play(B.knock, { when: 0.02, rate: 1.6, vol: 0.12, verb: 0.05 }); },
    coin: (when = 0) => { play(B && B.coin, { when, rate: j(0.03), vol: 0.32, verb: 0.35 }); play(B && B.clack, { when, rate: 1.5, vol: 0.12, verb: 0 }); },
    turn: () => { if (!B) return; mar(79, 0, 0.18); mar(84, 0.11, 0.16); },
    bad: () => { if (!B) return; play(B.knock, { rate: 0.7, vol: 0.45, verb: 0.05 }); play(B.knock, { when: 0.12, rate: 0.62, vol: 0.4, verb: 0.05 }); },
    stuck: () => { if (!B) return; duck(2.2); [79, 76, 72, 67].forEach((m, i) => mar(m, i * 0.16, 0.3 - i * 0.03)); play(B.bass, { when: 0.62, rate: midiRate(36, 45), vol: 0.5, verb: 0.2 }); },
    cheer: (dur = 1.8) => { if (!B) return; for (let i = 0; i < 46; i++) { const t = Math.random() * dur, env = Math.sin(Math.PI * t / dur); play(B.clap, { when: t, rate: j(0.25), vol: 0.05 + 0.1 * env, pan: (Math.random() - 0.5) * 1.4, verb: 0.35, hp: 700 }); } },
    shutBox: () => { if (!B) return; duck(4); [60, 64, 67, 72, 76, 79, 84].forEach((m, i) => mar(m, i * 0.075, 0.28)); [72, 76, 79, 84].forEach(m => mar(m, 0.62, 0.22)); play(B.epiano, { when: 0.6, rate: midiRate(60, 60), vol: 0.3, verb: 0.4 });
      for (let i = 0; i < 6; i++) S.coin(0.7 + i * 0.09 + Math.random() * 0.04); S.cheer(2.2); },
    gold: (n = 3) => { for (let i = 0; i < n; i++) S.coin(i * 0.11); },
    setSfx(v) { sfxOn = !!v; if (sfxBus) sfxBus.gain.setTargetAtTime(sfxOn ? 1 : 0, ac.currentTime, 0.05); },
    setMusic(v) { musicOn = !!v; if (!ac) return; if (musicOn) { if (!started) startMusic(); musBus.gain.setTargetAtTime(0.45, ac.currentTime, 0.6); } else musBus.gain.setTargetAtTime(0, ac.currentTime, 0.25); },
    get music() { return musicOn; },
    suspend(hidden) { if (!ac) return; try { hidden ? ac.suspend() : ac.resume(); } catch (e) {} },
    _dbg: () => ({ ac, master, musBus, sfxBus }),
    stop() { clearInterval(musTimer); try { ac && ac.close(); } catch (e) {} ac = null; },
  };
  function duck(sec) { if (!ac || !musicOn) return; const t = ac.currentTime; musBus.gain.cancelScheduledValues(t); musBus.gain.setTargetAtTime(0.1, t, 0.08); musBus.gain.setTargetAtTime(0.45, t + sec, 0.8); duckUntil = t + sec; }

  // ---------- MUSIC: 16 bars, ii–V–I–VI in C, then a turnaround ----------
  // [bass root (midi), piano voicing (midi), scale for the melody]
  const CH = {
    Dm9: [38, [53, 57, 60, 64], [62, 64, 65, 67, 69, 72, 74, 76]], G13: [43, [53, 59, 64], [62, 64, 67, 69, 71, 74, 76]], Cmaj9: [36, [52, 55, 59, 62], [60, 62, 64, 67, 69, 71, 72, 74, 76]],
    A7b9: [45, [55, 61, 64, 70], [61, 64, 67, 69, 70, 73, 76]], Em7: [40, [55, 59, 62, 67], [59, 62, 64, 67, 71, 74, 76]], A7: [45, [55, 61, 64, 67], [61, 64, 67, 69, 73, 76]],
    Dm7: [38, [53, 57, 60, 65], [62, 65, 67, 69, 72, 74]], G7: [43, [53, 59, 62, 65], [62, 65, 67, 71, 74]], Fmaj7: [41, [52, 57, 60, 64], [60, 64, 65, 67, 69, 72, 76]] };
  // one chord per half bar (2 beats)
  const FORM = ['Dm9', 'Dm9', 'G13', 'G13', 'Cmaj9', 'Cmaj9', 'A7b9', 'A7b9', 'Dm9', 'Dm9', 'G13', 'G13', 'Em7', 'Em7', 'A7', 'A7',
    'Fmaj7', 'Fmaj7', 'Em7', 'A7', 'Dm9', 'Dm9', 'G13', 'G13', 'Cmaj9', 'Cmaj9', 'A7b9', 'A7b9', 'Dm7', 'G7', 'Cmaj9', 'A7'];
  // melody: composed once from a seed so it repeats like a real tune (A A' over 16 bars). [8th index in the loop, midi, length in 8ths]
  const MEL = (() => { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const out = [];
    const RH = [[0, 3, 2], [1, 2, 3, 5], [0, 2, 4, 6], [3, 4, 6], [0, 1, 3], [2, 5, 6], []];
    for (let bar = 0; bar < 16; bar++) { const rest = bar % 4 === 3, rh = rest ? [0] : RH[Math.floor(rnd() * RH.length)], sc = CH[FORM[bar * 2]][2]; let k = Math.floor(rnd() * sc.length);
      for (const p of rh) { const half = p < 4 ? 0 : 1, scale = CH[FORM[bar * 2 + half]][2]; k = Math.max(0, Math.min(scale.length - 1, k + Math.floor(rnd() * 5) - 2)); out.push([bar * 8 + p, scale[k], rest ? 6 : 1 + Math.floor(rnd() * 2)]); } }
    return out; })();
  const melAt = new Map(); MEL.forEach(n => { if (!melAt.has(n[0])) melAt.set(n[0], []); melAt.get(n[0]).push(n); });
  function startMusic() { if (!ac || started) return; started = true; nextT = ac.currentTime + 0.15; step = 0; musBus.gain.setValueAtTime(0, ac.currentTime); musBus.gain.setTargetAtTime(musicOn ? 0.45 : 0, ac.currentTime + 0.1, 1.2); clearInterval(musTimer); musTimer = setInterval(sched, 60); sched(); }
  function sched() { if (!ac || ac.state !== 'running') return; while (nextT < ac.currentTime + 0.25) { note(step, nextT); nextT += step % 2 ? SPB * (1 - SWING) : SPB * SWING; step = (step + 1) % (16 * 8); } }
  function note(st, t) { if (!musicOn) return; const bar = Math.floor(st / 8), e8 = st % 8, beat = Math.floor(e8 / 2), off = e8 % 2, ch = CH[FORM[bar * 2 + (beat >= 2 ? 1 : 0)]], nextCh = CH[FORM[(bar * 2 + (beat >= 2 ? 1 : 0) + 1) % FORM.length]], when = t - ac.currentTime, M = musBus;
    // upright bass: walk on every beat
    if (!off) { const r = ch[0]; let m = r;
      if (beat === 1) m = r + 7;
      else if (beat === 2) { const third = ch[1].map(x => x % 12).find(x => [3, 4].includes(((x - r) % 12 + 12) % 12)); m = third != null ? r + ((third - r) % 12 + 12) % 12 : r + 12; }
      else if (beat === 3) { let tg = nextCh[0]; while (tg < r - 2) tg += 12; while (tg > r + 9) tg -= 12; m = tg === r ? r + 5 : tg + (tg > r ? -1 : 1); }
      play(B.bass, { when, rate: midiRate(m, 45), vol: beat === 0 ? 0.62 : 0.5, verb: 0.06, bus: M, lp: 900 }); }
    // brushes + ride + soft kick
    if (!off && (beat === 1 || beat === 3)) play(B.brush, { when, rate: j(0.08), vol: 0.13, verb: 0.15, bus: M, hp: 1800, lp: 7000 });
    if (!off || beat === 1 || beat === 3) play(B.ride, { when, rate: j(0.02), vol: off ? 0.035 : 0.05, pan: 0.35, verb: 0.2, bus: M, hp: 3000 });
    if (!off && (beat === 0 || beat === 2)) play(B.kick, { when, vol: 0.22, verb: 0, bus: M });
    // electric piano comps: beat 1 and the "and" of 2, softly
    if ((!off && beat === 0 && bar % 2 === 0) || (off && beat === 1)) ch[1].forEach((m, i) => play(B.epiano, { when: when + i * 0.008, rate: midiRate(m, 60), vol: 0.085, pan: -0.25, verb: 0.3, bus: M }));
    // marimba melody
    const mm = melAt.get(st); if (mm) mm.forEach(([, m, len]) => play(B.marimba, { when, rate: midiRate(m, 72), vol: 0.13 + (len > 2 ? 0.02 : 0), pan: 0.2, verb: 0.35, bus: M }));
  }
  return S;
}
