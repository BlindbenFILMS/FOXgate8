// 8 GATES — CAMEL PEN SOUND + MUSIC. Everything is made live with Web Audio (no files to load), on a shared bus with a small courtyard reverb.
//   createPenAudio(ambience) → { ensure, play(name, o), water(level), music, setMuted, muted, tick(dt, ctx) }
//   SFX names: groan grumble hum snort spit munch gulp creak clank splash scratch pop thornCreak plink ouch squish whistle bells jingle
//              step camelStep thump rustle coins chime done fail tap ding treat whoosh pat sigh coo cheer
//   o = { vol (0..2), pan (-1..1), pitch (×) }
//   MUSIC: an oud (Karplus-Strong plucked string, played with risha tremolo) + darbuka in maqsum + a ney breath and a drone, maqam Hijaz on D.
//          music.mood('walk' | 'work' | 'intro' | 'off'), music.oud(true) = the OUD PLAYER upgrade (second oud + fuller), music.flourish('day' | 'happy' | 'sad').
// REAL RECORDINGS LATER: put a file name in PEN_AUDIO_FILES (e.g. groan: 'KUFA/audio/camel-groan.mp3'); it is loaded once and used instead of the synth.
export const PEN_AUDIO_FILES = {};

export function createPenAudio(amb, { files = PEN_AUDIO_FILES, base = '' } = {}) {
  let ctx = null, bus = null, sfx = null, mus = null, rev = null, revSend = null, noise = null, pink = null, ready = false, muted = false;
  const fileBufs = {}, R = Math.random, rr = (a, b) => a + R() * (b - a);
  try { muted = localStorage.getItem('kufa.pen.muted') === '1'; } catch (e) {}
  function ensure() {
    if (ready) return !!ctx; try { amb.init && amb.init(); } catch (e) {} ctx = amb.ctx; if (!ctx) return false; ready = true;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5; comp.attack.value = 0.004; comp.release.value = 0.2;
    bus = ctx.createGain(); bus.gain.value = muted ? 0 : 1; bus.connect(comp); comp.connect(ctx.destination);
    sfx = ctx.createGain(); sfx.gain.value = 0.85; sfx.connect(bus); mus = ctx.createGain(); mus.gain.value = 0.34; mus.connect(bus);
    // courtyard reverb: decaying stereo noise, darkened
    const len = Math.floor(ctx.sampleRate * 1.5), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); let lp = 0; for (let i = 0; i < len; i++) { const t = i / len; lp += 0.35 * ((R() * 2 - 1) - lp); d[i] = lp * Math.pow(1 - t, 3.2) * (i < 220 ? i / 220 : 1); } }
    rev = ctx.createConvolver(); rev.buffer = ir; const rg = ctx.createGain(); rg.gain.value = 0.55; rev.connect(rg); rg.connect(bus); revSend = rev;
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = R() * 2 - 1; }
    pink = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = pink.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0; for (let i = 0; i < d.length; i++) { const w = R() * 2 - 1; b0 = 0.997 * b0 + w * 0.029; b1 = 0.985 * b1 + w * 0.032; b2 = 0.95 * b2 + w * 0.048; d[i] = (b0 + b1 + b2 + w * 0.02) * 2.2; } }
    try { if (amb.master) amb.master.gain.value = muted ? 0 : 0.35; } catch (e) {} // the kit's wind loop, quieter under our ambience
    for (const k in files) loadFile(k);
    startBeds(); return true; }
  function loadFile(k) { fetch(new URL(files[k], document.baseURI + base)).then(r => r.ok ? r.arrayBuffer() : null).then(b => b && ctx.decodeAudioData(b)).then(buf => { if (buf) fileBufs[k] = buf; }).catch(() => {}); }
  // ---------- building blocks ----------
  const now = () => ctx.currentTime;
  function outChain(vol, pan, wet = 0.18, dest = sfx) { const g = ctx.createGain(); g.gain.value = vol; let n = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); g.connect(p); n = p; } n.connect(dest); if (wet > 0) { const s = ctx.createGain(); s.gain.value = wet; n.connect(s); s.connect(revSend); } return g; }
  function env(g, t, a, peak, d, hold = 0) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (hold) g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t + a + hold + d); }
  function osc(type, f, t, dur, { to = null, vol = 0.3, a = 0.005, d = null, dest, filt = null, q = 1, ftype = 'lowpass', vib = 0, vibF = 6, det = 0 } = {}) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (det) o.detune.value = det; if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    if (vib) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = vibF; lg.gain.value = vib; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + dur + 0.1); }
    const g = ctx.createGain(); let n = o; if (filt) { const bq = ctx.createBiquadFilter(); bq.type = ftype; bq.frequency.value = filt; bq.Q.value = q; o.connect(bq); n = bq; } n.connect(g); g.connect(dest); env(g, t, a, vol, d == null ? dur : d); o.start(t); o.stop(t + a + (d == null ? dur : d) + 0.05); return o; }
  function nz(t, dur, { f = 1000, to = null, q = 1, type = 'bandpass', vol = 0.3, a = 0.003, dest, buf = noise, rate = 1, hold = 0 } = {}) {
    const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate; const bq = ctx.createBiquadFilter(); bq.type = type; bq.frequency.setValueAtTime(f, t); if (to) bq.frequency.exponentialRampToValueAtTime(to, t + a + hold + dur); bq.Q.value = q;
    const g = ctx.createGain(); s.connect(bq); bq.connect(g); g.connect(dest); env(g, t, a, vol, dur, hold); s.start(t, R() * 1.5); s.stop(t + a + hold + dur + 0.05); return s; }
  // ---------- the sound library ----------
  const LIB = {
    groan(t, o, D) { // camel groan: buzzy glottal tone through two formants, wobbling gurgle
      const len = rr(0.75, 1.1) * (o.len || 1), f0 = rr(88, 104) * (o.pitch || 1), src = ctx.createOscillator(); src.type = 'sawtooth'; src.frequency.setValueAtTime(f0 * 1.15, t); src.frequency.linearRampToValueAtTime(f0, t + 0.2); src.frequency.linearRampToValueAtTime(f0 * 0.78, t + len);
      const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = rr(5, 7); vg.gain.value = 6; vib.connect(vg); vg.connect(src.frequency);
      const gur = ctx.createOscillator(), gg = ctx.createGain(), am = ctx.createGain(); gur.type = 'square'; gur.frequency.value = rr(14, 22); gg.gain.value = 0.35; am.gain.value = 0.65; gur.connect(gg); gg.connect(am.gain);
      const mix = ctx.createGain(); for (const [ff, qq, gv] of [[520, 5, 1], [1150, 6, 0.55], [2500, 8, 0.2]]) { const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = ff * rr(0.92, 1.08); b.Q.value = qq; const g = ctx.createGain(); g.gain.value = gv; src.connect(b); b.connect(g); g.connect(am); }
      am.connect(mix); mix.connect(D); env(mix, t, 0.07, 0.9, len * 0.75, len * 0.2); [src, vib, gur].forEach(x => { x.start(t); x.stop(t + len + 0.2); });
      nz(t, len * 0.8, { f: 260, q: 0.8, type: 'lowpass', vol: 0.25, a: 0.1, dest: D, buf: pink }); },
    grumble(t, o, D) { LIB.groan(t, { ...o, len: 0.55, pitch: (o.pitch || 1) * 1.1 }, D); },
    sigh(t, o, D) { nz(t, 0.7, { f: 900, to: 400, q: 0.7, vol: 0.35, a: 0.15, dest: D, buf: pink }); osc('sine', 150, t, 0.6, { to: 110, vol: 0.08, a: 0.1, dest: D }); },
    hum(t, o, D) { const f = rr(150, 175) * (o.pitch || 1); osc('triangle', f, t, 0.7, { to: f * 1.12, vol: 0.18, a: 0.12, filt: 700, q: 3, dest: D, vib: 4, vibF: 5 }); osc('sine', f * 2, t + 0.05, 0.6, { to: f * 2.2, vol: 0.05, a: 0.12, dest: D }); },
    snort(t, o, D) { nz(t, 0.18, { f: 900, to: 280, q: 1.4, vol: 0.55, a: 0.01, dest: D, buf: pink }); nz(t + 0.2, 0.12, { f: 700, to: 300, q: 1.4, vol: 0.3, dest: D, buf: pink }); },
    spit(t, o, D) { nz(t, 0.03, { f: 1800, type: 'lowpass', vol: 0.8, dest: D }); osc('sine', 260, t, 0.08, { to: 90, vol: 0.35, dest: D }); const s = nz(t + 0.03, 0.32, { f: 1500, to: 600, q: 2, vol: 0.55, a: 0.005, dest: D });
      for (let i = 0; i < 6; i++) osc('sine', rr(600, 1400), t + 0.05 + i * 0.045, 0.05, { to: rr(1500, 2600), vol: 0.06, dest: D }); },
    munch(t, o, D) { const n = 4 + (R() * 2 | 0); for (let i = 0; i < n; i++) { const tt = t + i * rr(0.13, 0.19); nz(tt, 0.06, { f: rr(2200, 3600), q: 0.9, vol: 0.32, dest: D }); nz(tt + 0.01, 0.05, { f: 500, type: 'lowpass', vol: 0.3, dest: D }); } },
    gulp(t, o, D) { osc('sine', rr(200, 240), t, 0.13, { to: 95, vol: 0.32, a: 0.008, dest: D }); nz(t + 0.05, 0.1, { f: 650, q: 3, vol: 0.18, dest: D }); osc('sine', rr(700, 900), t + 0.09, 0.05, { to: 1500, vol: 0.05, dest: D }); },
    creak(t, o, D) { const f = rr(820, 1050) * (o.pitch || 1); osc('sawtooth', f, t, 0.16, { to: f * rr(1.15, 1.35), vol: 0.05, a: 0.02, filt: 2200, q: 6, ftype: 'bandpass', vib: 25, vibF: 31, dest: D }); },
    clank(t, o, D) { for (const [f, v, d] of [[183, 0.18, 0.25], [467, 0.12, 0.18], [1130, 0.06, 0.12], [2310, 0.03, 0.08]]) osc('sine', f * (o.pitch || 1), t, d, { vol: v, a: 0.002, dest: D }); nz(t, 0.03, { f: 3000, vol: 0.15, dest: D }); },
    splash(t, o, D) { nz(t, 0.35, { f: 2600, to: 900, q: 0.6, vol: 0.45, a: 0.01, dest: D }); for (let i = 0; i < 5; i++) osc('sine', rr(900, 2200), t + rr(0.02, 0.25), 0.05, { to: rr(1800, 3200), vol: 0.05, dest: D }); },
    scratch(t, o, D) { nz(t, rr(0.05, 0.09), { f: rr(4200, 6500), q: 1.2, vol: 0.18 * (o.vol || 1), a: 0.006, dest: D }); },
    pop(t, o, D) { osc('triangle', rr(900, 1300), t, 0.06, { to: 300, vol: 0.2, dest: D }); nz(t, 0.025, { f: 4000, vol: 0.2, dest: D }); },
    thornCreak(t, o, D) { const f = 600 + (o.k || 0) * 900; osc('sawtooth', f, t, 0.07, { to: f * 1.08, vol: 0.03, filt: 2500, q: 8, ftype: 'bandpass', dest: D }); },
    plink(t, o, D) { for (const [f, v] of [[2093, 0.16], [3140, 0.07], [4700, 0.03]]) osc('sine', f, t, 0.35, { vol: v, a: 0.002, dest: D }); nz(t, 0.02, { f: 6000, vol: 0.2, dest: D }); },
    ouch(t, o, D) { osc('sawtooth', 300, t, 0.25, { to: 520, vol: 0.08, filt: 1500, q: 4, ftype: 'bandpass', dest: D }); LIB.groan(t + 0.12, { pitch: 1.25, len: 0.6 }, D); },
    squish(t, o, D) { const s = nz(t, 0.14, { f: rr(500, 800), to: 300, q: 3, vol: 0.25, a: 0.02, dest: D, buf: pink }); },
    whistle(t, o, D) { for (const [st, f1, f2, d] of [[0, 1480, 1760, 0.14], [0.17, 1320, 2100, 0.26]]) { osc('sine', f1, t + st, d, { to: f2, vol: 0.16, a: 0.02, vib: 18, vibF: 9, dest: D }); nz(t + st, d, { f: f1 * 1.5, q: 4, vol: 0.03, a: 0.02, dest: D }); } },
    bells(t, o, D) { const f = (o.pitch || 1) * rr(1180, 1320); for (const [m, v, d] of [[1, 0.12, 0.9], [2.76, 0.06, 0.6], [5.4, 0.03, 0.35], [8.9, 0.015, 0.2]]) osc('sine', f * m, t, d, { vol: v * (o.vol || 1), a: 0.002, dest: D }); },
    jingle(t, o, D) { for (let i = 0; i < 4; i++) LIB.bells(t + i * rr(0.05, 0.11), { pitch: rr(0.9, 1.4), vol: 0.6 }, D); },
    step(t, o, D) { nz(t, 0.07, { f: rr(500, 800), type: 'lowpass', vol: 0.22 * (o.vol || 1), a: 0.004, dest: D, buf: pink }); nz(t + 0.01, 0.04, { f: rr(2500, 3500), q: 1, vol: 0.04 * (o.vol || 1), dest: D }); },
    camelStep(t, o, D) { osc('sine', rr(70, 90), t, 0.12, { to: 50, vol: 0.22 * (o.vol || 1), a: 0.004, dest: D }); nz(t, 0.12, { f: 420, type: 'lowpass', vol: 0.22 * (o.vol || 1), dest: D, buf: pink }); },
    thump(t, o, D) { osc('sine', 95, t, 0.2, { to: 45, vol: 0.45, a: 0.003, dest: D }); nz(t, 0.16, { f: 380, type: 'lowpass', vol: 0.35, dest: D, buf: pink }); nz(t + 0.02, 0.08, { f: 2600, q: 1, vol: 0.05, dest: D }); },
    rustle(t, o, D) { nz(t, 0.18, { f: 2600, q: 0.8, vol: 0.12, a: 0.03, dest: D }); nz(t + 0.06, 0.12, { f: 4200, q: 1, vol: 0.06, a: 0.02, dest: D }); },
    coins(t, o, D) { const n = o.n || 6; for (let i = 0; i < n; i++) { const tt = t + i * rr(0.05, 0.09), f = rr(2300, 3100); for (const [m, v] of [[1, 0.09], [1.52, 0.05], [2.61, 0.03]]) osc('sine', f * m, tt, 0.22, { vol: v, a: 0.001, dest: D }); } },
    tap(t, o, D) { osc('sine', 1250, t, 0.04, { to: 900, vol: 0.08, dest: D }); },
    ding(t, o, D) { LIB.bells(t, { pitch: 1.35, vol: 0.9 }, D); },
    whoosh(t, o, D) { nz(t, 0.25, { f: 600, to: 2400, q: 1.2, vol: 0.12, a: 0.06, dest: D }); },
    pat(t, o, D) { for (let i = 0; i < 2; i++) nz(t + i * 0.16, 0.06, { f: 380, type: 'lowpass', vol: 0.35, dest: D, buf: pink }); },
    coo(t, o, D) { const f = rr(380, 430); for (const [st, d, k] of [[0, 0.16, 1], [0.2, 0.32, 1.12], [0.56, 0.18, 0.95]]) osc('sine', f * k, t + st, d, { to: f * k * 0.93, vol: 0.05, a: 0.04, dest: D, vib: 6, vibF: 12 }); },
    // musical stingers use the oud
    chime(t, o, D) { music.pluckAt(t, 7, 0.7, D); music.pluckAt(t + 0.11, 9, 0.7, D); },
    done(t, o, D) { music.pluckAt(t, 4, 0.7, D); music.pluckAt(t + 0.09, 7, 0.75, D); music.pluckAt(t + 0.18, 11, 0.8, D); },
    treat(t, o, D) { music.pluckAt(t, 9, 0.6, D); music.pluckAt(t + 0.1, 11, 0.6, D); LIB.hum(t + 0.15, {}, D); },
    fail(t, o, D) { music.pluckAt(t, 1, 0.6, D, 0.5); music.pluckAt(t + 0.14, 0, 0.6, D, 0.5); },
    cheer(t, o, D) { [4, 7, 9, 11, 14].forEach((n, i) => music.pluckAt(t + i * 0.08, n, 0.7, D)); LIB.coins(t + 0.25, { n: 8 }, D); } };
  function play(name, o = {}) { if (!ensure() || muted) return; const t = now() + (o.delay || 0), D = outChain(o.vol == null ? 1 : o.vol, o.pan || 0, o.wet == null ? 0.18 : o.wet);
    if (fileBufs[name]) { const s = ctx.createBufferSource(); s.buffer = fileBufs[name]; s.playbackRate.value = (o.pitch || 1) * rr(0.96, 1.04); s.connect(D); s.start(t); return; }
    const f = LIB[name]; if (f) try { f(t, o, D); } catch (e) {} }
  // ---------- beds: pump water stream, bazaar murmur ----------
  let waterG = null, murG = null;
  function startBeds() { { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const b1 = ctx.createBiquadFilter(); b1.type = 'bandpass'; b1.frequency.value = 1400; b1.Q.value = 0.8; const b2 = ctx.createBiquadFilter(); b2.type = 'highshelf'; b2.frequency.value = 3500; b2.gain.value = 6; waterG = ctx.createGain(); waterG.gain.value = 0; s.connect(b1); b1.connect(b2); b2.connect(waterG); const D = outChain(1, 0.25, 0.25); waterG.connect(D); s.start(); }
    { const s = ctx.createBufferSource(); s.buffer = pink; s.loop = true; const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 480; b.Q.value = 1.3; const b2 = ctx.createBiquadFilter(); b2.type = 'lowpass'; b2.frequency.value = 1000; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 0.004; murG = ctx.createGain(); murG.gain.value = 0.009; lfo.connect(lg); lg.connect(murG.gain); s.connect(b); b.connect(b2); b2.connect(murG); const D = outChain(1, -0.6, 0.6); murG.connect(D); s.start(); lfo.start(); } }
  function water(v) { if (!ready || !waterG) return; waterG.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.32, now(), 0.05); }
  // ---------- MUSIC ----------
  const HIJAZ = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66, 311.13, 369.99, 392.0, 440.0, 466.16, 523.25, 587.33]; // D3 .. D5 (index 0 = D3, 7 = D4, 14 = D5)
  const ksCache = new Map();
  function ks(f, bright = 0.5) { const key = Math.round(f * 10) + '|' + bright; if (ksCache.has(key)) return ksCache.get(key); const sr = ctx.sampleRate, N = Math.max(2, Math.round(sr / f)), L = Math.floor(sr * 1.9), buf = ctx.createBuffer(1, L, sr), d = buf.getChannelData(0), ring = new Float32Array(N);
    let lp = 0; for (let i = 0; i < N; i++) { const w = R() * 2 - 1; lp += (0.35 + bright * 0.5) * (w - lp); ring[i] = lp; } // plectrum: filtered noise burst
    let p = 0, prev = 0; const decay = f < 120 ? 0.9975 : 0.9962; for (let i = 0; i < L; i++) { const cur = ring[p]; const nx = decay * 0.5 * (cur + prev); prev = cur; ring[p] = nx; d[i] = cur; p = (p + 1) % N; }
    for (let i = 0; i < 64; i++) d[i] *= i / 64; ksCache.set(key, buf); return buf; }
  let oudBody = null; function body() { if (oudBody) return oudBody; const lo = ctx.createBiquadFilter(); lo.type = 'peaking'; lo.frequency.value = 210; lo.Q.value = 1.4; lo.gain.value = 5; const hi = ctx.createBiquadFilter(); hi.type = 'lowpass'; hi.frequency.value = 3200; hi.Q.value = 0.5; lo.connect(hi); const g = ctx.createGain(); g.gain.value = 0.9; hi.connect(g); g.connect(mus); const s = ctx.createGain(); s.gain.value = 0.32; hi.connect(s); s.connect(revSend); oudBody = lo; return lo; }
  function pluck(t, f, vel = 0.7, dest = null, bright = 0.5, pan = 0) { const s = ctx.createBufferSource(); s.buffer = ks(f, bright); s.playbackRate.value = 1 + rr(-0.002, 0.002); const g = ctx.createGain(); g.gain.setValueAtTime(vel, t); g.gain.setTargetAtTime(0, t + 1.3, 0.25); let n = g; if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; } s.connect(g); n.connect(dest || body()); s.start(t); s.stop(t + 1.95); }
  const M = { mood: 'off', oud2: false, step: 0, next: 0, iv: null, phrase: null, bar: 0, lastNey: 0, target: 'off' };
  // darbuka: doum (low, centre), tek (rim, bright), ka (soft rim); riq = small jingles
  function doum(t, v) { osc('sine', 115, t, 0.28, { to: 58, vol: 0.55 * v, a: 0.002, dest: mus }); nz(t, 0.09, { f: 260, type: 'lowpass', vol: 0.3 * v, dest: mus, buf: pink }); }
  function tek(t, v) { nz(t, 0.05, { f: 3600, q: 2.2, vol: 0.35 * v, a: 0.001, dest: mus }); osc('sine', 1180, t, 0.035, { vol: 0.08 * v, a: 0.001, dest: mus }); }
  function riq(t, v) { for (let i = 0; i < 3; i++) osc('sine', rr(5200, 7400), t + i * 0.006, 0.08, { vol: 0.02 * v, a: 0.001, dest: mus }); nz(t, 0.06, { f: 8000, type: 'highpass', vol: 0.05 * v, dest: mus }); }
  function ney(t, deg, dur) { const f = HIJAZ[deg] * 2; const o = osc('sine', f, t, dur, { vol: 0.07, a: 0.35, d: dur, dest: mus, vib: 4, vibF: 5.2 }); nz(t, dur, { f: f * 2, q: 6, vol: 0.02, a: 0.4, dest: mus, hold: dur * 0.3 }); }
  function drone(t, dur) { for (const [f, v] of [[73.42, 0.06], [110, 0.03]]) osc('triangle', f, t, dur, { vol: v, a: 0.8, d: dur, filt: 400, dest: mus }); }
  const MAQSUM = ['D', 'T', '.', 'T', 'D', '.', 'T', '.']; // 8 eighths
  // motifs: 16 eighths, numbers = HIJAZ index, '-' = hold (tremolo if long), null = rest
  const MOTIFS = [
    [7, null, 8, 9, 10, '-', 9, 8, 7, '-', '-', '-', null, null, 4, null],
    [4, 5, 6, 7, 8, '-', 7, 6, 5, 4, '-', 3, 2, '-', '-', null],
    [11, '-', 10, 9, 10, 11, 12, '-', 11, 10, 9, 8, 7, '-', '-', null],
    [7, 9, 10, 9, 8, 7, 8, 9, 7, '-', null, 4, 5, 4, 3, 2],
    [0, null, 2, 3, 4, '-', 5, 4, 3, 2, 1, '-', 0, '-', '-', null],
    [9, 10, 11, '-', 10, 9, 8, '-', 9, 8, 7, '-', 4, '-', '-', null]];
  function newPhrase() { const A = MOTIFS[R() * MOTIFS.length | 0], B = MOTIFS[R() * MOTIFS.length | 0]; return [A, B, A, MOTIFS[1]]; }
  function schedule(until) { if (!ready) return; if (muted) { M.next = now() + 0.05; return; } const ahead = until || now() + 0.15;
    while (M.next < ahead) { const t = M.next, mood = M.mood, bpm = mood === 'work' ? 104 : 88, e = 60 / bpm / 2; M.next += e; if (mood === 'off') { M.step = 0; continue; }
      const s = M.step % 16, beat = M.step % 8, sw = (beat % 2) ? e * 0.08 : 0;
      if (s === 0) { if (!M.phrase || M.bar >= M.phrase.length) { M.phrase = newPhrase(); M.bar = 0; } M.cur = M.phrase[M.bar++]; if (M.bar === 1) drone(t, e * 16 * 4); pluck(t, 73.42, 0.75, null, 0.3); }
      if (s === 8 && R() < 0.6) pluck(t, R() < 0.5 ? 110 : 73.42, 0.55, null, 0.3);
      const dv = mood === 'work' ? 1 : mood === 'walk' ? 0.55 : 0.35, hit = MAQSUM[beat]; if (hit === 'D') doum(t, dv); else if (hit === 'T') tek(t + sw, dv * 0.9); else if (mood === 'work' && R() < 0.35) tek(t + sw, dv * 0.35);
      if (mood === 'work' && beat % 2 === 1) riq(t + sw, M.oud2 ? 1 : 0.6);
      const n = M.cur && M.cur[s]; const play = mood === 'intro' ? (s % 2 === 0) : true;
      if (typeof n === 'number' && play) { const f = HIJAZ[n]; pluck(t + sw, f, 0.62 + R() * 0.12, null, 0.55); if (M.oud2 && (s % 4 === 0)) pluck(t + sw + 0.012, f / 2, 0.38, null, 0.4, -0.35); M.last = n; }
      else if (n === '-' && M.last != null) { const f = HIJAZ[M.last]; pluck(t + sw, f, 0.28, null, 0.6); pluck(t + sw + e / 2, f, 0.22, null, 0.6); } // risha tremolo
      if (mood === 'walk' && s === 0 && now() - M.lastNey > 9 && R() < 0.45) { M.lastNey = now(); ney(t + e * 4, R() < 0.5 ? 7 : 11, e * 10); }
      M.step++; } }
  const music = { mood(m) { if (m === M.mood) return; if (!ensure()) { M.mood = m; return; } if (M.mood === 'off' && m !== 'off') { M.next = now() + 0.05; M.step = 0; M.phrase = null; } M.mood = m; if (!M.iv) M.iv = setInterval(schedule, 40); },
    oud(on) { M.oud2 = !!on; if (ready) mus.gain.setTargetAtTime(on ? 0.42 : 0.34, now(), 0.4); },
    flourish(kind) { if (!ensure() || muted) return; const t = now() + 0.05; const seq = kind === 'sad' ? [7, 5, 4, 2, 1, 0] : kind === 'happy' ? [7, 9, 10, 11, 14] : [0, 2, 3, 4, 7, 9, 10, 11, 14]; seq.forEach((n, i) => pluck(t + i * 0.085, HIJAZ[n], 0.75, null, 0.6)); if (kind !== 'sad') { doum(t, 0.8); doum(t + seq.length * 0.085, 1); } },
    _render(mood, until) { M.mood = mood; M.next = M.next || 0.05; schedule(until); }, pluckAt(t, idx, vel, dest, bright = 0.6) { pluck(t, HIJAZ[idx] * (idx > 9 ? 1 : 2), vel, null, bright); }, get current() { return M.mood; } };
  // ---------- ambience events (doves, distant bells) ----------
  let ambT = 4;
  function tick(dt) { if (!ready || muted) return; ambT -= dt; if (ambT <= 0) { ambT = rr(6, 14); const r = R(); if (r < 0.45) play('coo', { pan: rr(-0.8, 0.8), vol: 0.8, wet: 0.4 }); else if (r < 0.75) play('bells', { pan: rr(-1, 1), vol: 0.35, wet: 0.5, pitch: rr(0.8, 1.1) }); else play('groan', { vol: 0.25, pan: 0.7, wet: 0.5, pitch: rr(0.9, 1.1) }); } }
  function setMuted(m) { muted = !!m; try { localStorage.setItem('kufa.pen.muted', muted ? '1' : '0'); } catch (e) {} if (ready) { bus.gain.setTargetAtTime(muted ? 0 : 1, now(), 0.05); try { amb.master.gain.setTargetAtTime(muted ? 0 : 0.35, now(), 0.05); } catch (e) {} } }
  function destroy() { clearInterval(M.iv); }
  return { ensure, play, water, music, tick, setMuted, destroy, get muted() { return muted; }, get ready() { return ready; } };
}
