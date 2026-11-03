// 8 GATES — CEDAR'S LUMBER MILL · SOUND. All sound effects are synthesised live (Web Audio), so they react to play:
// the band saw bites harder and goes rough when you drift off the pencil line, the cut-off saw's "parking sensor" ticks faster
// as the log nears the flag, the lathe whine climbs with the groove depth and chimes as you enter the green.
// Music = two original loops (mill-work.mp3 "Cedar's Reel", mill-walk.mp3 "Sawdust Afternoon"), passed in as URLs by the page
// (or as 'module:<path>.js' whose default export is a data: URL — used where binary files can't be served, e.g. a Design canvas).
// Everything goes through one room reverb so it sounds like a timber hall. createMillAudio({ music: { work, walk } }) → API below.
const PREF = 'nebo.mill.audio.v1';
export function createMillAudio({ music = {} } = {}) {
  let ctx = null, master, sfxBus, musBus, ambBus, verb, verbIn, comp, noiseBuf, unlocked = false;
  const prefs = (() => { try { return { sfx: true, music: true, ...JSON.parse(localStorage.getItem(PREF) || '{}') }; } catch (e) { return { sfx: true, music: true }; } })();
  const savePrefs = () => { try { localStorage.setItem(PREF, JSON.stringify(prefs)); } catch (e) {} };
  const R = (a, b) => a + Math.random() * (b - a);
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC(); const t = ctx.currentTime;
    comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;
    master = ctx.createGain(); master.gain.value = 0.9; comp.connect(master); master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.gain.value = prefs.sfx ? 1 : 0; sfxBus.connect(comp);
    musBus = ctx.createGain(); musBus.gain.value = prefs.music ? 0.42 : 0; musBus.connect(comp);
    ambBus = ctx.createGain(); ambBus.gain.value = prefs.sfx ? 0.55 : 0; ambBus.connect(comp);
    // room reverb (generated impulse: early knocks off timber walls + a short warm tail)
    const len = Math.floor(ctx.sampleRate * 1.3), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < len; i++) { const tt = i / ctx.sampleRate; lp = lp * 0.82 + (Math.random() * 2 - 1) * 0.18; d[i] = lp * Math.exp(-tt * 4.6) * (tt < 0.012 ? tt / 0.012 : 1); } for (const e of [0.011, 0.019, 0.027, 0.041]) d[Math.floor(e * ctx.sampleRate) + c * 37] += 0.5; }
    verb = ctx.createConvolver(); verb.buffer = ir; verbIn = ctx.createGain(); verbIn.gain.value = 0.22; verbIn.connect(verb); const vOut = ctx.createGain(); vOut.gain.value = 0.9; verb.connect(vOut); vOut.connect(sfxBus);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    startAmbience(); loadMusic(); return true;
  }
  // ---------- building blocks ----------
  const out = (node, wet = 0.25) => { node.connect(sfxBus); if (wet > 0) { const g = ctx.createGain(); g.gain.value = wet; node.connect(g); g.connect(verbIn); } };
  function env(g, t, a, peak, d, sustain = 0, rel = 0.05, hold = 0) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (hold) g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t + a + hold + d); if (!sustain) g.gain.setValueAtTime(0, t + a + hold + d + rel); }
  function noise({ t = ctx.currentTime, dur = 0.2, type = 'bandpass', f = 1000, q = 1, vol = 0.3, a = 0.005, d, wet = 0.25, rate = 1, pan = 0, f2 }) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = rate; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q; const g = ctx.createGain(); env(g, t, a, vol, d ?? dur);
    let n = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; } s.connect(fl); fl.connect(g); out(n, wet); s.start(t, Math.random() * 1.5); s.stop(t + a + (d ?? dur) + 0.1); return s; }
  function osc({ t = ctx.currentTime, type = 'sine', f = 440, f2, dur = 0.2, vol = 0.2, a = 0.004, wet = 0.25, lp, detune = 0 }) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); o.detune.value = detune; const g = ctx.createGain(); env(g, t, a, vol, dur); let n = o; if (lp) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); n = fl; } n.connect(g); out(g, wet); o.start(t); o.stop(t + a + dur + 0.1); return o; }
  let burstT = 0, burstN = 0;
  const ok = () => { if (!(ctx && unlocked && prefs.sfx)) return false; const now = ctx.currentTime; if (now - burstT > 0.05) { burstT = now; burstN = 0; } return ++burstN <= 40; };
  // ---------- continuous machines (start/stop + live params) ----------
  const loops = {};
  function loopVoice(key, build) { if (!ctx) return null; if (!loops[key]) loops[key] = build(); return loops[key]; }
  function stopLoop(key, rel = 0.25) { const L = loops[key]; if (!L) return; const t = ctx.currentTime; L.g.gain.cancelScheduledValues(t); L.g.gain.setTargetAtTime(0, t, rel / 3); setTimeout(() => { try { L.nodes.forEach(n => n.stop && n.stop()); } catch (e) {} }, rel * 1000 + 300); delete loops[key]; }
  function bandsawVoice() { const t = ctx.currentTime, g = ctx.createGain(); g.gain.value = 0; out(g, 0.18);
    const hum = ctx.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 98; const hl = ctx.createBiquadFilter(); hl.type = 'lowpass'; hl.frequency.value = 600; const hg = ctx.createGain(); hg.gain.value = 0.09; hum.connect(hl); hl.connect(hg); hg.connect(g);
    const whine = ctx.createOscillator(); whine.type = 'triangle'; whine.frequency.value = 196; const wg = ctx.createGain(); wg.gain.value = 0.04; whine.connect(wg); wg.connect(g);
    const cut = ctx.createBufferSource(); cut.buffer = noiseBuf; cut.loop = true; const cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 2600; cf.Q.value = 0.9; const cg = ctx.createGain(); cg.gain.value = 0; cut.connect(cf); cf.connect(cg); cg.connect(g);
    // roughness: an AM wobble that fades in when you drift off the line
    const am = ctx.createOscillator(); am.frequency.value = 31; const amg = ctx.createGain(); amg.gain.value = 0; am.connect(amg); amg.connect(cg.gain);
    [hum, whine, cut, am].forEach(n => n.start(t)); g.gain.setTargetAtTime(1, t, 0.15);
    return { g, nodes: [hum, whine, cut, am], hum, whine, cg, cf, amg }; }
  function latheVoice() { const t = ctx.currentTime, g = ctx.createGain(); g.gain.value = 0; out(g, 0.18);
    const m = ctx.createOscillator(); m.type = 'triangle'; m.frequency.value = 230; const mg = ctx.createGain(); mg.gain.value = 0.05; m.connect(mg); mg.connect(g);
    const m2 = ctx.createOscillator(); m2.type = 'sine'; m2.frequency.value = 115; const m2g = ctx.createGain(); m2g.gain.value = 0.06; m2.connect(m2g); m2g.connect(g);
    const c = ctx.createBufferSource(); c.buffer = noiseBuf; c.loop = true; const cf = ctx.createBiquadFilter(); cf.type = 'highpass'; cf.frequency.value = 1800; const cg = ctx.createGain(); cg.gain.value = 0; c.connect(cf); cf.connect(cg); cg.connect(g);
    [m, m2, c].forEach(n => n.start(t)); g.gain.setTargetAtTime(1, t, 0.25); return { g, nodes: [m, m2, c], m, cg, cf }; }
  // ---------- ambience: river + water wheel creak + stove crackle ----------
  let ambT = 0;
  function startAmbience() { const t = ctx.currentTime;
    const r = ctx.createBufferSource(); r.buffer = noiseBuf; r.loop = true; const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 520; const rf2 = ctx.createBiquadFilter(); rf2.type = 'peaking'; rf2.frequency.value = 240; rf2.gain.value = 6; const rg = ctx.createGain(); rg.gain.value = 0.16; r.connect(rf); rf.connect(rf2); rf2.connect(rg); rg.connect(ambBus); r.start(t);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.13; const lg = ctx.createGain(); lg.gain.value = 0.05; lfo.connect(lg); lg.connect(rg.gain); lfo.start(t);
    const sp = ctx.createBufferSource(); sp.buffer = noiseBuf; sp.loop = true; sp.playbackRate.value = 0.7; const sf = ctx.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 3200; sf.Q.value = 2; const sg2 = ctx.createGain(); sg2.gain.value = 0.012; sp.connect(sf); sf.connect(sg2); sg2.connect(ambBus); sp.start(t); }
  function ambienceTick(dt, near) { if (!ctx || !unlocked || ctx.state !== 'running') return; if (ctx.currentTime < ambT) return; ambT = ctx.currentTime + R(0.25, 0.7);
    if (Math.random() < 0.18) { const t = ctx.currentTime, o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(R(70, 95), t); o.frequency.linearRampToValueAtTime(R(55, 80), t + 0.5); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = R(500, 900); f.Q.value = 6; const g = ctx.createGain(); env(g, t, 0.08, 0.018, 0.5); o.connect(f); f.connect(g); g.connect(ambBus); o.start(t); o.stop(t + 0.8); }
    if (near.stove < 6) for (let i = 0; i < 1 + (Math.random() * 3 | 0); i++) { const t = ctx.currentTime + R(0, 0.3); noise({ t, dur: 0.012, type: 'highpass', f: R(2000, 5000), vol: 0.05 * (1 - near.stove / 6), wet: 0.05 }); } }
  // ---------- music ----------
  const mus = { buf: {}, cur: null, want: null, src: null, g: null };
  const LOOP = { work: 68.5714, walk: 72.0 };
  async function loadMusic() { for (const k of ['work', 'walk']) { const u = music[k]; if (!u) continue; try { const src = u.startsWith('module:') ? (await import(u.slice(7))).default : u, ab = await (await fetch(src)).arrayBuffer(); mus.buf[k] = await new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)); if (mus.want === k && mus.cur !== k) playMusic(k, true); } catch (e) { console.warn('mill music ' + k + ' failed: ' + e); } } }
  function playMusic(k, force) { mus.want = k; if (!ctx || !unlocked) return; if (mus.cur === k && !force) return; const t = ctx.currentTime;
    if (mus.src) { const s = mus.src, g = mus.g; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(0, t, 0.6); setTimeout(() => { try { s.stop(); } catch (e) {} }, 3000); mus.src = null; }
    mus.cur = k; if (!k || !mus.buf[k]) return; const b = mus.buf[k], s = ctx.createBufferSource(); s.buffer = b; s.loop = true; s.loopStart = Math.max(0, b.duration - LOOP[k]); s.loopEnd = b.duration; const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(k === 'walk' ? 0.8 : 1, t, 0.8); s.connect(g); g.connect(musBus); s.start(t, s.loopStart); mus.src = s; mus.g = g; }
  function duckMusic(on) { if (!ctx) return; musBus.gain.setTargetAtTime(prefs.music ? (on ? 0.22 : 0.42) : 0, ctx.currentTime, 0.4); }

  // ---------- one-shots ----------
  const A = {
    get ready() { return ok(); }, prefs, get loaded() { return Object.keys(mus.buf); }, get playing() { return mus.cur; },
    unlock() { if (!init()) return; unlocked = true; if (ctx.state === 'suspended') ctx.resume(); if (mus.want && mus.cur !== mus.want) playMusic(mus.want, true); },
    music(k) { playMusic(k); }, duck: duckMusic,
    setSfx(on) { prefs.sfx = !!on; savePrefs(); if (ctx) { sfxBus.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05); ambBus.gain.setTargetAtTime(on ? 0.55 : 0, ctx.currentTime, 0.1); } },
    setMusic(on) { prefs.music = !!on; savePrefs(); duckMusic(false); },
    toggleAll() { const on = !(prefs.sfx || prefs.music); A.setSfx(on); A.setMusic(on); return on; },
    suspend(v) { if (!ctx) return; v ? ctx.suspend() : ctx.resume(); },
    tick(dt, near) { ambienceTick(dt, near); },
    click() { if (!ok()) return; osc({ f: 1800, f2: 1400, dur: 0.035, vol: 0.06, type: 'triangle', wet: 0.05 }); },
    pick() { if (!ok()) return; osc({ f: 880, dur: 0.08, vol: 0.08, type: 'triangle', wet: 0.1 }); osc({ t: ctx.currentTime + 0.05, f: 1320, dur: 0.1, vol: 0.06, type: 'triangle', wet: 0.1 }); },
    chime(n = 2) { if (!ok()) return; const t = ctx.currentTime, notes = [1047, 1319, 1568, 2093]; for (let i = 0; i < n; i++) { osc({ t: t + i * 0.09, f: notes[i], dur: 0.5, vol: 0.09, type: 'sine', wet: 0.35 }); osc({ t: t + i * 0.09, f: notes[i] * 4, dur: 0.12, vol: 0.02, type: 'sine', wet: 0.2 }); } },
    nope() { if (!ok()) return; osc({ f: 180, f2: 130, dur: 0.22, vol: 0.09, type: 'sawtooth', lp: 900, wet: 0.1 }); },
    // the order bell on the counter: inharmonic partials, long ring
    bell() { if (!ok()) return; const t = ctx.currentTime; [[1, 0.16], [2.76, 0.07], [5.4, 0.035], [8.93, 0.02]].forEach(([k, v]) => osc({ t, f: 1480 * k, dur: 1.6 / Math.sqrt(k), vol: v, a: 0.002, wet: 0.4 })); },
    door() { if (!ok()) return; const t = ctx.currentTime, o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(240, t); for (let i = 1; i < 8; i++) o.frequency.linearRampToValueAtTime(R(180, 320), t + i * 0.08); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 8; const g = ctx.createGain(); env(g, t, 0.05, 0.05, 0.6); o.connect(f); f.connect(g); out(g, 0.4); o.start(t); o.stop(t + 0.8); },
    logRoll() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 6; i++) { noise({ t: t + i * 0.28, dur: 0.22, type: 'lowpass', f: 260, vol: 0.18, wet: 0.2 }); osc({ t: t + i * 0.28, f: R(70, 90), f2: 55, dur: 0.2, vol: 0.08, wet: 0.2 }); } A.thud(0.3, t + 1.8); },
    thud(v = 0.25, t) { if (!ok()) return; t = t ?? ctx.currentTime; osc({ t, f: 150, f2: 60, dur: 0.18, vol: v, wet: 0.25 }); noise({ t, dur: 0.06, type: 'lowpass', f: 700, vol: v * 0.6, wet: 0.2 }); osc({ t, f: R(380, 460), dur: 0.08, vol: v * 0.2, type: 'triangle', wet: 0.3 }); },
    whoosh() { if (!ok()) return; noise({ dur: 0.35, type: 'bandpass', f: 400, f2: 1600, q: 1.2, vol: 0.06, a: 0.12, d: 0.25, wet: 0.15 }); },
    // DEBARK: bark tearing off in fibres
    peel() { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 5; i++) noise({ t: t + i * R(0.012, 0.03), dur: R(0.02, 0.05), type: 'bandpass', f: R(1200, 3200), q: 1.5, vol: R(0.12, 0.2), wet: 0.12 }); noise({ t: t + 0.05, dur: 0.14, type: 'lowpass', f: 900, vol: 0.06, wet: 0.15 }); },
    // CUT: a "parking sensor" while you drag (faster as the end nears the flag), the saw itself when you let go
    near(prox) { if (!ok()) return; const now = ctx.currentTime; if (now - (A._lastNear || 0) < 0.05 + prox * 0.35) return; A._lastNear = now; osc({ f: prox < 0.06 ? 2093 : 1568, dur: 0.03, vol: prox < 0.06 ? 0.08 : 0.045, type: 'sine', wet: 0.05 }); },
    onMark() { if (!ok()) return; osc({ f: 1568, dur: 0.12, vol: 0.07, wet: 0.2 }); osc({ t: ctx.currentTime + 0.07, f: 2093, dur: 0.18, vol: 0.07, wet: 0.2 }); },
    cutoff() { if (!ok()) return; const t = ctx.currentTime; osc({ t, type: 'sawtooth', f: 160, f2: 820, dur: 0.35, vol: 0.06, lp: 2400, wet: 0.15 }); noise({ t: t + 0.18, dur: 0.45, type: 'bandpass', f: 2400, f2: 3400, q: 0.8, vol: 0.26, a: 0.03, wet: 0.2 }); osc({ t: t + 0.18, type: 'sawtooth', f: 620, f2: 480, dur: 0.45, vol: 0.05, lp: 3000, wet: 0.15 }); A.thud(0.22, t + 0.66); },
    // SAW (band saw): live — state 'idle' | 'on' | 'near' | 'off'
    bandsaw(state) { if (!ctx || !unlocked) return; if (!state || !prefs.sfx) { stopLoop('bs'); return; } const L = loopVoice('bs', bandsawVoice), t = ctx.currentTime, feeding = state !== 'idle';
      L.cg.gain.setTargetAtTime(feeding ? 0.11 : 0, t, 0.05); L.amg.gain.setTargetAtTime(state === 'off' ? 0.09 : state === 'near' ? 0.04 : 0, t, 0.05); L.cf.frequency.setTargetAtTime(state === 'off' ? 1600 : 2700, t, 0.08); L.hum.frequency.setTargetAtTime(feeding ? (state === 'off' ? 88 : 94) : 98, t, 0.1); L.whine.frequency.setTargetAtTime(feeding ? 182 : 196, t, 0.1); },
    lineTick() { if (!ok()) return; osc({ f: 2637, dur: 0.02, vol: 0.025, wet: 0.05 }); },
    slabs() { if (!ok()) return; A.thud(0.3); A.thud(0.24, ctx.currentTime + 0.14); },
    // TURN (lathe): motor + cutting that rises with depth, chime as you cross into the green
    lathe(on) { if (!ctx || !unlocked) return; if (!on || !prefs.sfx) { stopLoop('lathe'); return; } loopVoice('lathe', latheVoice); },
    latheCut(depth) { const L = loops.lathe; if (!L) return; const t = ctx.currentTime; L.cg.gain.setTargetAtTime(depth == null ? 0 : 0.05 + depth * 0.08, t, 0.04); L.cf.frequency.setTargetAtTime(1600 + (depth || 0) * 2600, t, 0.05); L.m.frequency.setTargetAtTime(230 - (depth || 0) * 30, t, 0.1); },
    green() { if (!ok()) return; osc({ f: 1760, dur: 0.15, vol: 0.06, wet: 0.25 }); },
    chip() { if (!ok()) return; noise({ dur: 0.08, type: 'highpass', f: 2500, vol: 0.2, wet: 0.1 }); osc({ f: 330, f2: 120, dur: 0.12, vol: 0.12, type: 'square', lp: 1200, wet: 0.1 }); },
    // PLANE / SAND
    plane(speed) { if (!ok()) return; const now = ctx.currentTime; if (now - (A._lastPl || 0) < 0.07) return; A._lastPl = now; noise({ dur: R(0.08, 0.14), type: 'bandpass', f: R(3200, 4800), q: 0.7, vol: Math.min(0.16, 0.04 + speed * 0.004), a: 0.01, wet: 0.12 }); },
    tear() { if (!ok()) return; const t = ctx.currentTime; noise({ t, dur: 0.12, type: 'lowpass', f: 1400, vol: 0.25, wet: 0.15 }); for (let i = 0; i < 4; i++) noise({ t: t + i * 0.02, dur: 0.012, type: 'highpass', f: 3500, vol: 0.18, wet: 0.05 }); },
    smooth() { if (!ok()) return; osc({ f: 1319, dur: 0.18, vol: 0.06, wet: 0.3 }); osc({ t: ctx.currentTime + 0.06, f: 1976, dur: 0.22, vol: 0.05, wet: 0.3 }); },
    // STAIN
    brush(d) { if (!ok()) return; const now = ctx.currentTime; if (now - (A._lastBr || 0) < 0.09) return; A._lastBr = now; noise({ dur: 0.12, type: 'lowpass', f: R(900, 1500), vol: Math.min(0.12, 0.03 + d * 0.002), a: 0.03, wet: 0.08 }); },
    dip() { if (!ok()) return; const t = ctx.currentTime; osc({ t, f: 900, f2: 300, dur: 0.12, vol: 0.06, wet: 0.2 }); osc({ t: t + 0.08, f: 1300, f2: 600, dur: 0.1, vol: 0.04, wet: 0.2 }); },
    brand() { if (!ok()) return; noise({ dur: 0.9, type: 'highpass', f: 4000, vol: 0.14, a: 0.02, wet: 0.15 }); noise({ dur: 0.5, type: 'bandpass', f: 1200, vol: 0.06, wet: 0.2 }); },
    // flow
    done() { A.chime(3); },
    pay(stars) { if (!ok()) return; const t = ctx.currentTime; for (let i = 0; i < 2 + stars; i++) osc({ t: t + 0.25 + i * 0.07, f: R(2400, 3200), dur: 0.25, vol: 0.05, type: 'sine', wet: 0.3 }); A.bell(); },
    react(level) { if (!ok()) return; const t = ctx.currentTime; const S = { thrilled: [784, 988, 1175, 1568], happy: [784, 988, 1175], okay: [660, 622], grumpy: [330, 294, 262] }[level] || [660]; S.forEach((f, i) => { osc({ t: t + i * 0.11, f, dur: 0.3, vol: 0.08, type: level === 'grumpy' ? 'square' : 'triangle', lp: 2400, wet: 0.3 }); }); },
    fanfare(big) { if (!ok()) return; const t = ctx.currentTime, N = big ? [587, 740, 880, 1175, 880, 1175, 1480] : [587, 740, 880, 1175]; N.forEach((f, i) => { osc({ t: t + i * 0.13, f, dur: 0.45, vol: 0.08, type: 'triangle', wet: 0.35 }); osc({ t: t + i * 0.13, f: f / 2, dur: 0.3, vol: 0.05, type: 'sine', wet: 0.2 }); }); if (big) setTimeout(() => A.bell(), N.length * 130); },
    // walk mode
    step(i) { if (!ok()) return; const t = ctx.currentTime; noise({ t, dur: 0.05, type: 'lowpass', f: i % 2 ? 520 : 600, vol: 0.09, wet: 0.2 }); osc({ t, f: i % 2 ? 190 : 210, f2: 120, dur: 0.06, vol: 0.05, type: 'triangle', wet: 0.25 }); },
    swing() { if (!ok()) return; noise({ dur: 0.18, type: 'bandpass', f: 700, f2: 2400, q: 1, vol: 0.07, a: 0.06, d: 0.12, wet: 0.1 }); },
    chop() { if (!ok()) return; const t = ctx.currentTime; osc({ t, f: 140, f2: 55, dur: 0.22, vol: 0.32, wet: 0.3 }); noise({ t, dur: 0.05, type: 'highpass', f: 1800, vol: 0.3, wet: 0.2 }); noise({ t: t + 0.03, dur: 0.12, type: 'bandpass', f: 900, vol: 0.12, wet: 0.25 }); A.thud(0.12, t + 0.32); A.thud(0.1, t + 0.45); },
    hop() { if (!ok()) return; osc({ f: 380, f2: 620, dur: 0.12, vol: 0.06, type: 'triangle', wet: 0.15 }); },
    whistleTune() { if (!ok()) return; const t = ctx.currentTime; [[1175, 0], [1480, 0.16], [1760, 0.32], [1480, 0.5], [1976, 0.64]].forEach(([f, d]) => osc({ t: t + d, f, dur: 0.18, vol: 0.05, a: 0.02, wet: 0.35 })); },
    millWhistle() { if (!ok()) return; const t = ctx.currentTime, g = ctx.createGain(); env(g, t, 0.12, 0.09, 1.6, 0, 0.1, 0.9); out(g, 0.5); const nodes = [];
      for (const [f, v] of [[523, 1], [659, 0.8], [784, 0.5], [1046, 0.25]]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.94, t); o.frequency.linearRampToValueAtTime(f, t + 0.15); const lf = ctx.createBiquadFilter(); lf.type = 'lowpass'; lf.frequency.value = 2200; const gg = ctx.createGain(); gg.gain.value = 0.25 * v; o.connect(lf); lf.connect(gg); gg.connect(g); o.start(t); o.stop(t + 2.8); nodes.push(o); }
      noise({ t, dur: 2.4, type: 'bandpass', f: 1800, q: 0.6, vol: 0.06, a: 0.1, wet: 0.4 }); },
  };
  return A;
}
