// s656 MERU CAFE LOFI (Ben: "these sound the same as the space map … make them feel more like coffee shop lofi, be creative for each area").
// Its OWN instruments (nothing shared with engine/space-lofi.js). Warm tape (low-pass + slow wow), room reverb, glue + drive, stereo spread.
// Each song = 32-bar form (intro · A · B · A' · tag), a seeded melody (same tune every visit, A sections repeat their motif), its own world sounds.
// s658 POLISH: 6 melody / 4 chord / 4 bass / 5 drum / 7 world-sound picks, 4 progressions, key, melody amount, wobble, room, 4-part mix.
// s659: OFF on every part, drum kit split (kick / snare / hats), PERCUSSION part. Workshop songs start BLANK.
// s660 (Ben: "even more options AND polish the sounds"): every voice re-made (body, breath, hammer, metallic hats, swirling brushes, Leslie organ,
// tine Rhodes, stereo) + sax / music box / harmonica / soft synth, Wurlitzer / string pad / harp, fretless / moog, bossa / half-time kits,
// snaps / congas / clave, chimes / crickets / train / typewriter, SOUL / BOSSA / MYSTIC progressions, humanize, pump, drive, width, octave, fills.
// cafeSong(c, out, key, noise, startBar, over) → { stop() }   ·   stop() fades nothing: the caller fades its gain first.
export const CAFE_ZONE = { town: 'fountain' };              // zone music key → song (outdoors)
export const CAFE_ROOM = { casino: 'casino', bowling: 'bowling' };   // building key → song (room bed, leaks from the door)
export const CAFE_TITLE = { fountain: 'FOUNTAIN MORNINGS', casino: 'VELVET CHIPS', bowling: 'LANE SEVEN' };
// s657 LOFI MUSIC WORKSHOP: Ben's edits per song → localStorage meru.cafe.v1 { songKey: { any SONGS / DEFAULTS field } }
export const CAFE_LS = 'meru.cafe.v1';
export const CAFE_OPTS = {
  prog: ['song', 'dreamy', 'jazzy', 'blue', 'soul', 'bossa', 'mystic'],
  lead: ['nylon', 'trumpet', 'sax', 'vibes', 'flute', 'kalimba', 'musicbox', 'harmonica', 'whistle', 'synth', 'none'],
  keys: ['rhodes', 'wurli', 'piano', 'guitar', 'organ', 'pad', 'harp', 'none'],
  bass: ['two', 'walk', 'fretless', 'funk', 'moog', 'sub', 'none'],
  drums: ['brush', 'ride', 'boom', 'lazy', 'bossa', 'half', 'none'],
  perc: ['shaker', 'tamb', 'snaps', 'conga', 'clave', 'none'],
  extra: ['drops', 'chips', 'pins', 'rain', 'birds', 'cafe', 'chimes', 'crickets', 'train', 'typewriter', 'none'],
};
export const DEFAULTS = { key: 0, busy: 0.5, wow: 7, room: 0.2, prog: 'song', lv: 1, kv: 1, bv: 1, dv: 1, pv: 1, xv: 1, gain: 1, perc: 'none', dk: 1, ds: 1, dh: 1,
  hum: 0.3, pump: 0.3, drive: 0.2, width: 0.5, loct: 0, fills: 1 };
// s659 (Ben: "have all settings OFF until assigned"): a workshop song starts BLANK; the game plays the original until the song has a saved entry
export const BLANK = { lead: 'none', keys: 'none', bass: 'none', drums: 'none', extra: 'none', perc: 'none' };

const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const V = { maj9: [4, 7, 11, 14], m9: [3, 7, 10, 14], m11: [3, 7, 10, 17], d13: [4, 10, 14, 21], d9: [4, 7, 10, 14], alt: [4, 8, 10, 13], lyd: [4, 7, 11, 18], m7: [3, 7, 10, 15], maj7: [4, 7, 11, 16], sus: [5, 7, 10, 14] };
// progressions relative to the song's home chord + the scale the tune uses over them
const PROGS = {
  dreamy: { ch: [[0, 'maj9'], [5, 'lyd'], [9, 'm9'], [7, 'sus'], [0, 'maj9'], [4, 'm7'], [2, 'm9'], [7, 'd9']], sc: [0, 2, 4, 7, 9] },
  jazzy:  { ch: [[2, 'm9'], [7, 'd13'], [0, 'maj9'], [9, 'alt'], [2, 'm9'], [7, 'alt'], [0, 'maj9'], [0, 'maj7']], sc: [0, 2, 4, 5, 7, 9, 11] },
  blue:   { ch: [[0, 'm9'], [8, 'maj7'], [5, 'm11'], [7, 'alt'], [0, 'm9'], [3, 'maj9'], [8, 'lyd'], [7, 'alt']], sc: [0, 2, 3, 5, 7, 8, 10] },
  soul:   { ch: [[0, 'maj9'], [9, 'm9'], [2, 'm11'], [7, 'd13'], [4, 'm7'], [9, 'd9'], [2, 'm9'], [7, 'sus']], sc: [0, 2, 4, 7, 9, 11] },
  bossa:  { ch: [[0, 'm9'], [0, 'm9'], [5, 'm9'], [10, 'd9'], [3, 'maj7'], [8, 'maj7'], [2, 'm7'], [7, 'alt']], sc: [0, 2, 3, 5, 7, 9, 10] },
  mystic: { ch: [[0, 'm11'], [1, 'maj7'], [0, 'm11'], [10, 'sus'], [0, 'm11'], [8, 'lyd'], [1, 'maj7'], [10, 'm7']], sc: [0, 1, 3, 5, 7, 8, 10] },
};

export const SONGS = {
  // Fountain Plaza: a sunny café terrace by the water. Nylon guitar + Rhodes, brushes, upright two-feel, water drops in the echo.
  fountain: { bpm: 72, sw: 0.17, tape: 3800, seed: 7, room: 0.18, prog: 'song', chords: [[51, 'maj9'], [48, 'm9'], [41, 'm9'], [46, 'd13'], [51, 'maj9'], [44, 'lyd'], [43, 'm7'], [46, 'sus']],
    scale: [63, 65, 67, 70, 72, 75, 77, 79, 82], lead: 'nylon', keys: 'rhodes', bass: 'two', drums: 'brush', extra: 'drops', echo: 0.5 },
  // Casino: late-night jazz noir. Walking bass, brushed ride, muted trumpet, Rhodes comps, chips + a slot bell far off.
  casino:   { bpm: 84, sw: 0.2, tape: 3400, seed: 23, room: 0.3, prog: 'song', chords: [[48, 'm9'], [44, 'lyd'], [41, 'm11'], [43, 'alt'], [48, 'm9'], [46, 'd13'], [44, 'maj7'], [43, 'alt']],
    scale: [60, 63, 65, 66, 67, 70, 72, 75, 77], lead: 'trumpet', keys: 'rhodes', bass: 'walk', drums: 'ride', extra: 'chips', echo: 0.32 },
  // Meru Lanes: a dusty boom-bap jukebox. Drawbar organ stabs, clean funk guitar, vibes lead, finger bass, a strike (roll + pins) every 8 bars.
  bowling:  { bpm: 90, sw: 0.14, tape: 4400, seed: 41, room: 0.22, prog: 'song', chords: [[41, 'maj9'], [40, 'm7'], [38, 'm9'], [37, 'lyd'], [41, 'maj9'], [40, 'm7'], [38, 'm11'], [43, 'd9']],
    scale: [65, 67, 69, 72, 74, 77, 79, 81, 84], lead: 'vibes', keys: 'organ', bass: 'funk', drums: 'boom', extra: 'pins', echo: 0.28, gain: 1.5 },
};
export function songCfg(key) { const B = SONGS[key]; if (!B) return null; let o = {}; try { o = (JSON.parse(localStorage.getItem(CAFE_LS) || '{}') || {})[key] || {}; } catch (e) {} return Object.assign({}, DEFAULTS, B, o); }

export function cafeSong(c, out, key, noise, startBar = 0, over = null) {
  const S0 = songCfg(key); if (!S0) return null; const S = over ? Object.assign(S0, over) : S0;
  const nodes = [], R = rng(S.seed), Q = 60 / S.bpm, BAR = Q * 4, SW = S.sw * Q, KEY = S.key | 0, rnd = Math.random;
  const reg = r => { while (r > 52) r -= 12; while (r < 36) r += 12; return r; };
  const home = SONGS[key].chords[0][0], P = PROGS[S.prog];
  const prog = P ? P.ch.map(([iv, q]) => [reg(home + iv + KEY), q]) : S.chords.map(([r, q]) => [reg(r + KEY), q]);
  let scale = S.scale.map(m => m + KEY);
  if (P) { let t0 = home + KEY; while (t0 < 60) t0 += 12; scale = []; for (let o = 0; scale.length < 9; o++) for (const i of P.sc) if (scale.length < 9) scale.push(t0 + o * 12 + i); }
  const e8 = k => k * Q / 2 + (k % 2 ? SW : 0), e16 = k => k * Q / 4 + (k % 2 ? SW * 0.5 : 0);
  const J = t => t + (rnd() - 0.5) * S.hum * 0.026, VV = v => v * (1 + (rnd() - 0.5) * S.hum * 0.55);   // humanize: timing + velocity

  // ---- graph: parts → buses → glue (drive + comp) → tape → out;  lead + keys → echo + room ----
  const gain = (to, v = 1) => { const g = c.createGain(); g.gain.value = v; g.connect(to); return g; };
  const tape = c.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = S.tape; tape.Q.value = 0.5; tape.connect(out);
  const lowcut = c.createBiquadFilter(); lowcut.type = 'highpass'; lowcut.frequency.value = 32; lowcut.connect(tape);
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 2.6; comp.attack.value = 0.012; comp.release.value = 0.22; comp.knee.value = 12; comp.connect(lowcut);
  const sat = c.createWaveShaper(), K = 0.5 + S.drive * 6, cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cv[i] = Math.tanh(K * x) / Math.tanh(K); } sat.curve = cv; sat.oversample = '2x'; sat.connect(comp);
  const bus = c.createGain(); bus.gain.value = 0.85 * (S.gain || 1) / (0.75 + K * 0.08); bus.connect(sat);
  const pan = (to, p) => { if (!c.createStereoPanner) return to; const n = c.createStereoPanner(); n.pan.value = Math.max(-1, Math.min(1, p * S.width * 2)); n.connect(to); return n; };
  // s660 level match: every pick lands at about the same loudness (measured offline), so swapping one never jumps the mix
  const KM = { organ: 0.35, pad: 1.6, wurli: 1.2 }, BM = { two: 0.36, walk: 0.38, fretless: 0.16, moog: 0.48, sub: 0.23, funk: 1.4 }, DM = { ride: 1.8, boom: 0.75, bossa: 0.85, half: 0.78, brush: 1.05, lazy: 1 }, PM = { conga: 0.25, shaker: 1.4, tamb: 1.4 };
  const dBus = gain(bus, S.dv * (DM[S.drums] || 1)), bBus = gain(bus, S.bv * (BM[S.bass] || 1)), lBus = gain(bus, S.lv), kVol = gain(bus, S.kv * (KM[S.keys] || 1)), pBus = gain(bus, S.pv * (PM[S.perc] || 1)), xBus = gain(bus, S.xv), keysBus = gain(kVol);
  const leadP = pan(lBus, 0.08), keysL = pan(keysBus, -0.45), keysR = pan(keysBus, 0.45), hatP = pan(dBus, 0.3), rideP = pan(dBus, -0.28), percP = pan(pBus, -0.4), percR = pan(pBus, 0.4), xL = pan(xBus, -0.6), xR = pan(xBus, 0.6);
  const kSide = k => k % 2 ? keysR : keysL, xSide = () => rnd() < 0.5 ? xL : xR;
  const wow = c.createOscillator(), wg = c.createGain(); wow.frequency.value = 0.42; wg.gain.value = S.wow; wow.connect(wg); wow.start(); nodes.push(wow);
  const les = c.createOscillator(), lesG = c.createGain(); les.frequency.value = 5.8; lesG.gain.value = 9; les.connect(lesG); les.start(); nodes.push(les);   // Leslie speaker for the organ
  const dl = c.createDelay(1.5), fb = c.createGain(), wet = c.createGain(), dlp = c.createBiquadFilter(), dhp = c.createBiquadFilter(); dl.delayTime.value = Q * 0.75; fb.gain.value = S.echo * 0.8; wet.gain.value = S.echo; dlp.type = 'lowpass'; dlp.frequency.value = 2200; dhp.type = 'highpass'; dhp.frequency.value = 300;
  dl.connect(dlp); dlp.connect(dhp); dhp.connect(fb); fb.connect(dl); dhp.connect(wet); wet.connect(pan(comp, -0.3));
  const send = gain(dl);
  if (S.room > 0.01) { const conv = c.createConvolver(), n = (c.sampleRate * 2.1) | 0, ir = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / n, 3.4) * (i < 400 ? i / 400 : 1); } conv.buffer = ir;
    const rin = c.createGain(), rlp = c.createBiquadFilter(), rhp = c.createBiquadFilter(); rin.gain.value = S.room * 0.9; rlp.type = 'lowpass'; rlp.frequency.value = 3200; rhp.type = 'highpass'; rhp.frequency.value = 220;
    lBus.connect(rin); kVol.connect(rin); pBus.connect(gain(rin, 0.6)); dBus.connect(gain(rin, 0.25)); xBus.connect(gain(rin, 0.7)); rin.connect(rhp); rhp.connect(conv); conv.connect(rlp); rlp.connect(comp); }
  const duck = t => { const d = 1 - S.pump; keysBus.gain.cancelScheduledValues(t); keysBus.gain.setValueAtTime(d, t); keysBus.gain.setTargetAtTime(1, t + 0.02, Q * 0.22); };
  const env = (g, t, a, d, p) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.00011, p), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(d, a + 0.005)); };
  const adsr = (g, t, a, d, p, sus = 0.8) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.setValueAtTime(p * sus, t + Math.max(a + 0.01, d * 0.72)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); };
  const osc = (type, f, t, d, mods = [wg]) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; if (mods.length) { for (const m of mods) m.connect(o.detune); o.onended = () => { for (const m of mods) try { m.disconnect(o.detune); } catch (e) {} }; } o.start(t); o.stop(t + d + 0.08); return o; };
  const filt = (type, f, q = 0.7) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const nz = (t, type, f, p, d, q = 0.8, to = bus, a = 0.002) => { const s = c.createBufferSource(), fl = filt(type, f, q), g = c.createGain(); s.buffer = noise; env(g, t, a, d, p); s.connect(fl); fl.connect(g); g.connect(to); s.start(t, rnd() * 1.5); s.stop(t + d + 0.05); return fl; };
  const vib = (o, t, d, hz, cents, delay = 0.25) => { const v = c.createOscillator(), vg = c.createGain(); v.frequency.value = hz * (0.95 + rnd() * 0.1); vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(cents, t + Math.min(d, delay)); v.connect(vg); vg.connect(o.detune); v.start(t); v.stop(t + d + 0.1); };
  const bed = (f, q, v, lfoHz, to = xBus) => { const s = c.createBufferSource(), fl = filt('bandpass', f, q), g = c.createGain(); s.buffer = noise; s.loop = true; g.gain.value = v; s.connect(fl); fl.connect(g); g.connect(to);
    if (lfoHz) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = lfoHz; lg.gain.value = v * 0.6; l.connect(lg); lg.connect(g.gain); l.start(); nodes.push(l); } s.start(); nodes.push(s); };

  // ================= MELODY (→ leadP + echo) =================
  const toLead = g => { g.connect(leadP); g.connect(send); return g; };
  const nylon = (t, m, d, v = 1, to = null) => { const f = mtof(m), g = c.createGain(), lp = filt('lowpass', 3400), body = filt('bandpass', 210, 1.2), bg = gain(g, 0.45);
    lp.frequency.setValueAtTime(3600 * (0.7 + v * 0.3), t); lp.frequency.exponentialRampToValueAtTime(650, t + 0.45);
    for (const [ty, mul, dt, a] of [['triangle', 1, 0, 1], ['triangle', 1.0017, 0.004, 0.6], ['sine', 2, 0, 0.3]]) { const o = osc(ty, f * mul, t + dt, d), og = gain(lp, a); o.connect(og); if (mul === 1) o.connect(body); }
    body.connect(bg); lp.connect(g); env(g, t, 0.003, d, 0.06 * v); nz(t, 'bandpass', 3200, 0.03 * v, 0.012, 1.2, g);
    if (to) g.connect(to); else toLead(g); return g; };
  const trumpet = (t, m, d, v = 1) => { const f = mtof(m), o = osc('sawtooth', f, t, d), g = c.createGain(), f1 = filt('bandpass', 1150, 2.6), f2 = filt('bandpass', 2500, 3.5), lp = filt('lowpass', 3000); vib(o, t, d, 5.2, 10, 0.45);
    o.frequency.setValueAtTime(f * 0.965, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.07); o.connect(f1); o.connect(f2); f1.connect(lp); gain(lp, 0.5); f2.connect(gain(lp, 0.45)); lp.connect(g);
    adsr(g, t, 0.06, d, 0.09 * v, 0.85); nz(t, 'bandpass', 1800, 0.012 * v, 0.12, 1.5, g, 0.03); toLead(g); };
  const sax = (t, m, d, v = 1) => { const f = mtof(m), o = osc('sawtooth', f, t, d), o2 = osc('square', f, t, d), g = c.createGain(), f1 = filt('bandpass', 700, 1.8), f2 = filt('bandpass', 1650, 2.5), lp = filt('lowpass', 2800); vib(o, t, d, 4.6, 14, 0.4); vib(o2, t, d, 4.6, 14, 0.4);
    o.frequency.setValueAtTime(f * 0.94, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.09); o2.frequency.setValueAtTime(f * 0.94, t); o2.frequency.exponentialRampToValueAtTime(f, t + 0.09);
    o.connect(f1); o2.connect(gain(f2, 0.5)); f1.connect(lp); f2.connect(lp); lp.connect(g); adsr(g, t, 0.07, d + 0.05, 0.11 * v, 0.8); nz(t, 'bandpass', 2400, 0.02 * v, d * 0.8, 1, g, 0.06); toLead(g); };
  const vibes = (t, m, d, v = 1) => { const f = mtof(m), dd = Math.max(d, 0.9), o = osc('sine', f, t, dd), o2 = osc('sine', f * 4, t, 0.25), o3 = osc('sine', f * 10, t, 0.03, []), g = c.createGain(), g2 = c.createGain(), g3 = c.createGain(), tr = c.createOscillator(), tg = c.createGain(), am = c.createGain();
    tr.frequency.value = 5.5; tg.gain.value = 0.28; tr.connect(tg); tg.connect(am.gain); tr.start(t); tr.stop(t + dd + 0.1); env(g, t, 0.003, dd, 0.07 * v); env(g2, t, 0.002, 0.25, 0.014 * v); env(g3, t, 0.001, 0.03, 0.01 * v); o.connect(g); o2.connect(g2); o3.connect(g3); g.connect(am); g2.connect(am); g3.connect(am); toLead(am); };
  const flute = (t, m, d, v = 1) => { const f = mtof(m), o = osc('sine', f, t, d), o2 = osc('triangle', f * 2, t, d), g = c.createGain(), h = gain(g, 0.1); vib(o, t, d, 4.8, 9, 0.35); vib(o2, t, d, 4.8, 9, 0.35); o2.connect(h); o.connect(g);
    adsr(g, t, 0.08, d + 0.06, 0.075 * v, 0.85); nz(t, 'bandpass', f * 2, 0.014 * v, d * 0.9, 2.2, g, 0.05); nz(t, 'highpass', 5000, 0.01 * v, 0.06, 0.7, g, 0.01); toLead(g); };
  const kalimba = (t, m, d, v = 1) => { const f = mtof(m), dd = Math.min(Math.max(d, 0.7), 1.4), o = osc('sine', f, t, dd), o2 = osc('sine', f * 5.4, t, 0.12, []), o3 = osc('sine', f * 2.01, t, dd * 0.4), g = c.createGain(), g2 = c.createGain(), g3 = c.createGain(), box = filt('peaking', 400, 1); box.gain.value = 5;
    env(g, t, 0.002, dd, 0.09 * v); env(g2, t, 0.001, 0.1, 0.02 * v); env(g3, t, 0.002, dd * 0.4, 0.015 * v); o.connect(g); o2.connect(g2); o3.connect(g3); const m2 = c.createGain(); g.connect(m2); g2.connect(m2); g3.connect(m2); m2.connect(box); toLead(box); nz(t, 'bandpass', 1400, 0.012 * v, 0.015, 2, box); };
  const musicbox = (t, m, d, v = 1) => { const f = mtof(m + 12), dd = 1.6, o = osc('sine', f, t, dd, []), o2 = osc('sine', f * 3.98, t, 0.4, []), g = c.createGain(), g2 = c.createGain(); env(g, t, 0.002, dd, 0.06 * v); env(g2, t, 0.001, 0.4, 0.012 * v); o.connect(g); o2.connect(g2); g2.connect(g); toLead(g); nz(t, 'highpass', 6000, 0.008 * v, 0.01, 1, g); };
  const harmonica = (t, m, d, v = 1) => { const f = mtof(m), o = osc('square', f, t, d), o2 = osc('sawtooth', f * 1.003, t, d), g = c.createGain(), bp = filt('bandpass', 1100, 1.6), lp = filt('lowpass', 2600); vib(o, t, d, 5.8, 12, 0.3);
    o.connect(bp); o2.connect(gain(bp, 0.5)); bp.connect(lp); lp.connect(g); adsr(g, t, 0.04, d, 0.07 * v, 0.75); nz(t, 'bandpass', 1500, 0.01 * v, d * 0.7, 1.2, g, 0.04); toLead(g); };
  let lastW = 0; const whistle = (t, m, d, v = 1) => { const f = mtof(m), o = osc('sine', f, t, d), g = c.createGain(); if (lastW) { o.frequency.setValueAtTime(mtof(lastW), t); o.frequency.exponentialRampToValueAtTime(f, t + 0.07); } lastW = m; vib(o, t, d, 6, 14, 0.3);
    adsr(g, t, 0.04, d, 0.05 * v, 0.85); o.connect(g); nz(t, 'bandpass', f, 0.006 * v, d, 6, g, 0.04); toLead(g); };
  const synth = (t, m, d, v = 1) => { const f = mtof(m), g = c.createGain(), lp = filt('lowpass', 900, 2); lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(800, t + 0.3);
    for (const dt of [-7, 7]) { const o = osc('square', f, t, d); o.detune.value = dt; o.connect(gain(lp, 0.5)); } const s = osc('sine', f / 2, t, d); s.connect(gain(lp, 0.4)); lp.connect(g); adsr(g, t, 0.02, d, 0.05 * v, 0.7); toLead(g); };
  // ================= CHORDS (→ keysL / keysR, ducked by the kick) =================
  const rhodes = (t, ns, d, v = 1) => ns.forEach((m, k) => { const tt = t + k * 0.012, f = mtof(m), car = osc('sine', f, tt, d), mod = osc('sine', f, tt, d, []), tine = osc('sine', f * 7.1, tt, 0.09, []), mg = c.createGain(), g = c.createGain(), tg = c.createGain();
    mg.gain.setValueAtTime(f * (1.2 + v), tt); mg.gain.exponentialRampToValueAtTime(f * 0.04, tt + 0.4); mod.connect(mg); mg.connect(car.frequency); env(g, tt, 0.005, d, 0.03 * v); env(tg, tt, 0.001, 0.09, 0.006 * v); car.connect(g); tine.connect(tg); tg.connect(g); g.connect(kSide(k)); });
  const wurli = (t, ns, d, v = 1) => ns.forEach((m, k) => { const tt = t + k * 0.01, f = mtof(m), car = osc('triangle', f, tt, d), mod = osc('sine', f, tt, d, []), mg = c.createGain(), g = c.createGain(), lp = filt('lowpass', 2400), tr = c.createOscillator(), trg = c.createGain(), am = c.createGain();
    mg.gain.setValueAtTime(f * 2.4 * v, tt); mg.gain.exponentialRampToValueAtTime(f * 0.15, tt + 0.25); mod.connect(mg); mg.connect(car.frequency); tr.frequency.value = 5.4; trg.gain.value = 0.25; tr.connect(trg); trg.connect(am.gain); tr.start(tt); tr.stop(tt + d + 0.1);
    car.connect(lp); lp.connect(g); env(g, tt, 0.004, d, 0.03 * v); g.connect(am); am.connect(kSide(k)); });
  const piano = (t, ns, d, v = 1) => ns.forEach((m, k) => { const tt = t + k * 0.009, f = mtof(m), g = c.createGain(), lp = filt('lowpass', 1600); lp.frequency.setValueAtTime(1200 + 1400 * v, tt); lp.frequency.exponentialRampToValueAtTime(500, tt + d);
    for (const [dt, a] of [[-4, 0.5], [4, 0.5]]) { const o = osc('triangle', f, tt, d); o.detune.value = dt; o.connect(gain(lp, a)); } const o2 = osc('sine', f * 2, tt, d * 0.3); o2.connect(gain(lp, 0.25));
    lp.connect(g); env(g, tt, 0.004, d, 0.045 * v); nz(tt, 'lowpass', 2600, 0.012 * v, 0.02, 0.8, g); g.connect(kSide(k)); });
  const strum = (t, ns, d, v = 1) => ns.forEach((m, k) => nylon(t + k * 0.018, m, d, 0.5 * v, kSide(k)));
  const organ = (t, ns, d, v = 1) => { const g = c.createGain(), lp = filt('lowpass', 3200); for (const m of ns) for (const [h, a] of [[0.5, 0.5], [1, 1], [2, 0.45], [3, 0.25]]) { const o = osc('sine', mtof(m) * h, t, d, [wg, lesG]); o.connect(gain(lp, a)); }
    lp.connect(g); adsr(g, t, 0.012, d, 0.026 * v, 0.9); nz(t, 'bandpass', 2000, 0.004 * v, 0.012, 1, g); g.connect(keysL); g.connect(gain(keysR, 0.8)); };
  const pluck = (t, ns, v = 1) => ns.forEach((m, k) => { const o = osc('square', mtof(m), t + k * 0.008, 0.16), lp = filt('lowpass', 2400), g = c.createGain(); lp.frequency.setValueAtTime(2600, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.12); o.connect(lp); env(g, t + k * 0.008, 0.002, 0.15, 0.012 * v); lp.connect(g); g.connect(keysR); });
  const pad = (t, ns, d, v = 1) => ns.forEach((m, k) => { const f = mtof(m), g = c.createGain(), lp = filt('lowpass', 1100, 0.6); for (const dt of [-9, 0, 9]) { const o = osc('sawtooth', f, t, d); o.detune.value = dt; o.connect(gain(lp, 0.33)); }
    lp.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.014 * v, t + Math.min(0.7, d * 0.4)); g.gain.setValueAtTime(0.014 * v, t + d * 0.75); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.3); g.connect(kSide(k)); });
  const harpN = (t, m, v = 1, side) => { const f = mtof(m), o = osc('triangle', f, t, 1.4), o2 = osc('sine', f * 2, t, 0.5), g = c.createGain(), lp = filt('lowpass', 2800); o.connect(lp); o2.connect(gain(lp, 0.3)); lp.connect(g); env(g, t, 0.002, 1.4, 0.04 * v); g.connect(side); g.connect(gain(send, 0.4)); };
  // ================= BASS (→ bBus) =================
  const upright = (t, m, d, v = 1) => { t = J(t); v = VV(v); const f = mtof(m), o = osc('sine', f, t, d), o2 = osc('triangle', f, t, d * 0.5), o3 = osc('sine', f * 2, t, d * 0.25), lp = filt('lowpass', 900), g = c.createGain();
    o.frequency.setValueAtTime(f * 0.98, t); o.frequency.linearRampToValueAtTime(f, t + 0.05); lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(380, t + 0.2);
    o.connect(lp); o2.connect(gain(lp, 0.6)); o3.connect(gain(lp, 0.25)); lp.connect(g); env(g, t, 0.012, d, 0.24 * v); g.connect(bBus); nz(t, 'bandpass', 700, 0.03 * v, 0.03, 1.2, bBus); };
  let lastB = 0; const fretless = (t, m, d, v = 1) => { t = J(t); v = VV(v); const f = mtof(m), o = osc('sine', f, t, d), o2 = osc('triangle', f, t, d), lp = filt('lowpass', 500, 2), g = c.createGain();
    if (lastB && Math.abs(lastB - m) < 8) { for (const x of [o, o2]) { x.frequency.setValueAtTime(mtof(lastB), t); x.frequency.exponentialRampToValueAtTime(f, t + 0.09); } } lastB = m;
    lp.frequency.setValueAtTime(300, t); lp.frequency.linearRampToValueAtTime(900, t + 0.12); lp.frequency.exponentialRampToValueAtTime(350, t + d); o.connect(lp); o2.connect(gain(lp, 0.6)); lp.connect(g); adsr(g, t, 0.03, d, 0.22 * v, 0.7); g.connect(bBus); };
  const finger = (t, m, d, v = 1) => { t = J(t); v = VV(v); const f = mtof(m), o = osc('sawtooth', f, t, d), s = osc('sine', f, t, d), lp = filt('lowpass', 900, 3), g = c.createGain(); lp.frequency.setValueAtTime(1000, t); lp.frequency.exponentialRampToValueAtTime(220, t + d * 0.8); o.connect(lp); s.connect(gain(g, 0.12 * v)); env(g, t, 0.006, d, 0.12 * v); lp.connect(g); g.connect(bBus); };
  const moog = (t, m, d, v = 1) => { t = J(t); v = VV(v); const f = mtof(m), o = osc('sawtooth', f, t, d), o2 = osc('square', f / 2, t, d), lp = filt('lowpass', 400, 6), g = c.createGain(); lp.frequency.setValueAtTime(1600, t); lp.frequency.exponentialRampToValueAtTime(200, t + 0.25);
    o.connect(lp); o2.connect(gain(lp, 0.5)); lp.connect(g); adsr(g, t, 0.008, d, 0.11 * v, 0.6); g.connect(bBus); };
  const sub = (t, m, d, v = 1) => { const o = osc('sine', mtof(m), t, d), o2 = osc('sine', mtof(m) * 2, t, 0.08), g = c.createGain(), g2 = gain(g, 0.25); o2.connect(g2); adsr(g, t, 0.035, d, 0.13 * v, 0.85); o.connect(g); g.connect(bBus); };
  // ================= DRUMS (→ dBus / hatP / rideP) =================
  const kick = (t, v = 1) => { if (!S.dk) return; t = J(t); v = VV(v); const o = osc('sine', 120, t, 0.36, []), g = c.createGain(), lp = filt('lowpass', 900); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.12); o.connect(lp); lp.connect(g); env(g, t, 0.003, 0.36, 0.3 * v); g.connect(dBus);
    nz(t, 'bandpass', 2400, 0.03 * v, 0.012, 1, dBus); duck(t); };
  const snare = (t, v = 1) => { if (!S.ds) return; t = J(t); v = VV(v); nz(t, 'bandpass', 1900, 0.13 * v, 0.2, 0.8, dBus); nz(t, 'highpass', 5200, 0.05 * v, 0.12, 0.7, dBus);
    const o = osc('triangle', 200, t, 0.12, []), g = c.createGain(); o.frequency.exponentialRampToValueAtTime(160, t + 0.08); env(g, t, 0.002, 0.1, 0.07 * v); o.connect(g); g.connect(dBus); };
  const rim = (t, v = 1) => { if (!S.ds) return; t = J(t); v = VV(v); for (const [f, a] of [[1700, 0.05], [880, 0.025]]) { const o = osc('triangle', f, t, 0.04, []), g = c.createGain(); env(g, t, 0.001, 0.035, a * v); o.connect(g); g.connect(dBus); } nz(t, 'bandpass', 2600, 0.025 * v, 0.03, 2, dBus); };
  const tap = (t, v = 1) => { if (!S.ds) return; t = J(t); nz(t, 'bandpass', 3800, 0.04 * VV(v), 0.07, 0.8, dBus); };
  const MET = [205.3, 369.6, 540, 800];
  const hat = (t, v = 1, open = false) => { if (!S.dh) return; t = J(t); v = VV(v); const g = c.createGain(), hp = filt('highpass', 7200), bp = filt('bandpass', 10000, 0.8), d = open ? 0.3 : 0.045; for (const f of MET) { const o = osc('square', f * 2.6, t, d, []); o.connect(bp); } bp.connect(hp); hp.connect(g); env(g, t, 0.001, d, 0.03 * v); g.connect(hatP); nz(t, 'highpass', 8000, 0.01 * v, d, 0.7, hatP); };
  const ride = (t, v = 1) => { if (!S.dh) return; t = J(t); v = VV(v); const g = c.createGain(), bp = filt('bandpass', 5200, 1.2); for (const f of MET) { const o = osc('square', f * 1.9, t, 0.5, []); o.connect(bp); } bp.connect(g); env(g, t, 0.001, 0.5, 0.008 * v); g.connect(rideP);
    const p = osc('sine', 3150, t, 0.6, []), pg = c.createGain(); env(pg, t, 0.001, 0.6, 0.006 * v); p.connect(pg); pg.connect(rideP); nz(t, 'bandpass', 7400, 0.016 * v, 0.35, 1.3, rideP); };
  const swish = (t, d, v = 1) => { if (!S.dh) return; const fl = nz(J(t), 'bandpass', 2200, 0.03 * VV(v), d, 0.8, hatP, d * 0.45); fl.frequency.setValueAtTime(1800, t); fl.frequency.linearRampToValueAtTime(4600, t + d * 0.5); fl.frequency.linearRampToValueAtTime(2400, t + d); };
  const tom = (t, f, v = 1) => { t = J(t); const o = osc('sine', f, t, 0.3, []), g = c.createGain(); o.frequency.exponentialRampToValueAtTime(f * 0.72, t + 0.2); env(g, t, 0.002, 0.3, 0.16 * v); o.connect(g); g.connect(dBus); nz(t, 'bandpass', f * 3, 0.03 * v, 0.05, 1, dBus); };
  const shakerI = (t, v = 1, to = hatP) => nz(t, 'bandpass', 5200, 0.12 * v, 0.07, 0.9, to, 0.02);
  // ================= PERCUSSION (→ percP / percR) =================
  const shaker = (t, v = 1) => shakerI(J(t), VV(v), percR);
  const tamb = (t, v = 1) => { t = J(t); v = VV(v); nz(t, 'bandpass', 7000, 0.13 * v, 0.11, 0.7, percR, 0.003); for (let k = 0; k < 3; k++) { const o = osc('square', 5200 + k * 1700 + rnd() * 300, t + k * 0.007, 0.07, []), g = c.createGain(); env(g, t + k * 0.007, 0.001, 0.07, 0.007 * v); o.connect(g); g.connect(percR); } };
  const snap = (t, v = 1) => { t = J(t); v = VV(v); nz(t, 'bandpass', 2100, 0.2 * v, 0.06, 1.6, percP, 0.001); nz(t + 0.004, 'highpass', 4000, 0.05 * v, 0.03, 0.7, percP); };
  const conga = (t, f, v = 1, slap = false) => { t = J(t); v = VV(v); const o = osc('sine', f * 1.15, t, 0.28, []), g = c.createGain(); o.frequency.exponentialRampToValueAtTime(f, t + 0.04); env(g, t, 0.002, slap ? 0.1 : 0.28, 0.14 * v); o.connect(g); g.connect(percP); nz(t, 'bandpass', slap ? 2400 : 900, (slap ? 0.07 : 0.02) * v, 0.03, 1.2, percP); };
  const clave = (t, v = 1) => { t = J(t); v = VV(v); const o = osc('sine', 2500, t, 0.08, []), g = c.createGain(); env(g, t, 0.001, 0.07, 0.07 * v); o.connect(g); g.connect(percR); };
  // ================= WORLD SOUNDS (→ xL / xR) =================
  const drop = (t, m) => { const f = mtof(m), o = osc('sine', f * 1.08, t, 0.25, []), g = c.createGain(); o.frequency.exponentialRampToValueAtTime(f, t + 0.025); env(g, t, 0.002, 0.22, 0.028); o.connect(g); g.connect(send); g.connect(xSide()); };
  const clink = t => { for (const f of [3100, 4300]) { const o = osc('triangle', f + rnd() * 200, t, 0.06, []), o2 = osc('sine', (f + 400) * 2.7, t, 0.12, []), g = c.createGain(); env(g, t, 0.001, 0.12, 0.01); o.connect(g); o2.connect(gain(g, 0.3)); g.connect(xSide()); t += 0.06; } };
  const bell = (t, m, d) => { const o = osc('sine', mtof(m), t, d), o2 = osc('sine', mtof(m) * 4.01, t, d * 0.3), g = c.createGain(), g2 = c.createGain(); env(g, t, 0.003, d, 0.03); env(g2, t, 0.002, d * 0.3, 0.006); o.connect(g); o2.connect(g2); g.connect(send); g2.connect(send); g.connect(xR); };
  const strike = t => { const roll = nz(t, 'lowpass', 160, 0.06, 1.3, 0.7, xL, 1.1); roll.frequency.linearRampToValueAtTime(420, t + 1.3);
    const h = t + 1.32; nz(h, 'bandpass', 1500, 0.12, 0.35, 0.7, xBus); for (let k = 0; k < 7; k++) { const tt = h + k * 0.025 + rnd() * 0.03, o = osc('triangle', 700 + rnd() * 900, tt, 0.07, []), g = c.createGain(); env(g, tt, 0.001, 0.07, 0.03); o.connect(g); g.connect(xSide()); } };
  const chirp = t => { const n = 2 + (rnd() * 3 | 0), base = 2600 + rnd() * 1400, side = xSide(); for (let k = 0; k < n; k++) { const tt = t + k * 0.09, o = osc('sine', base, tt, 0.07, []), g = c.createGain(); o.frequency.exponentialRampToValueAtTime(base * 1.45, tt + 0.06); env(g, tt, 0.004, 0.07, 0.012); o.connect(g); g.connect(side); g.connect(send); } };
  const chime = (t, m) => { const f = mtof(m), o = osc('sine', f, t, 2.6, []), o2 = osc('sine', f * 2.76, t, 0.9, []), g = c.createGain(), g2 = c.createGain(), side = xSide(); env(g, t, 0.002, 2.6, 0.014); env(g2, t, 0.001, 0.9, 0.005); o.connect(g); o2.connect(g2); g.connect(side); g2.connect(side); };
  const cricket = t => { const side = xSide(), f = 4300 + rnd() * 600; for (let k = 0; k < 3; k++) { const tt = t + k * 0.05, o = osc('sine', f, tt, 0.03, []), g = c.createGain(); env(g, tt, 0.004, 0.03, 0.006); o.connect(g); g.connect(side); } };
  const horn = t => { const g = c.createGain(), lp = filt('lowpass', 800); for (const m of [58, 62, 65]) { const o = osc('sawtooth', mtof(m + KEY), t, 2.2, []); o.frequency.setValueAtTime(mtof(m + KEY), t + 0.6); o.frequency.exponentialRampToValueAtTime(mtof(m + KEY) * 0.97, t + 2.2); o.connect(gain(lp, 0.33)); }
    lp.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.022, t + 0.35); g.gain.setValueAtTime(0.02, t + 1.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2); g.connect(xL); g.connect(send); };
  const clack = t => { nz(t, 'bandpass', 500, 0.03, 0.05, 1.2, xL); nz(t + Q * 0.25, 'bandpass', 420, 0.025, 0.05, 1.2, xL); };
  const type1 = t => { nz(t, 'bandpass', 3000 + rnd() * 1500, 0.06, 0.018, 2, xR, 0.001); nz(t + 0.006, 'lowpass', 600, 0.03, 0.03, 1, xR); };
  const ding = t => { const o = osc('sine', 2637, t, 1.2, []), o2 = osc('sine', 5274 * 1.01, t, 0.4, []), g = c.createGain(); env(g, t, 0.001, 1.2, 0.018); o.connect(g); o2.connect(gain(g, 0.3)); g.connect(xR); const z = nz(t + 0.25, 'bandpass', 900, 0.03, 0.45, 1, xR, 0.2); z.frequency.linearRampToValueAtTime(2200, t + 0.7); };
  if (S.extra === 'rain') { bed(1400, 0.35, 0.004, 0.07); bed(5200, 0.5, 0.002, 0); }
  if (S.extra === 'cafe') bed(420, 0.8, 0.014, 0.18);

  // ================= the tune: a 2-bar motif per section (A repeats, B answers), built from the scale near the chord tones =================
  const RH = [[[0, 2], [2, 1], [3, 3], [6, 2]], [[1, 1], [2, 2], [4, 1], [5, 3]], [[0, 3], [3, 1], [4, 2], [6, 2]], [[0, 1], [1, 1], [2, 2], [5, 1], [6, 2]], [[2, 2], [4, 2], [6, 2]]];
  const rest = Math.max(0.02, Math.min(0.55, 0.35 - S.busy * 0.45));
  const near = (m, set) => set.reduce((b, x) => Math.abs(x - m) < Math.abs(b - m) ? x : b, set[0]);
  const motif = () => { const out = []; let p = 3 + (R() * 3 | 0); for (let b = 0; b < 2; b++) { const r = RH[R() * RH.length | 0]; for (const [s, d] of r) { if (R() < rest) continue; p = Math.max(0, Math.min(scale.length - 1, p + [-2, -1, -1, 1, 1, 2, 0][R() * 7 | 0])); out.push([b * 8 + s, d, p]);
    if (S.busy > 0.7 && d > 1 && R() < (S.busy - 0.7) * 2.5 && s % 8 < 7) out.push([b * 8 + s + 1, 1, Math.max(0, Math.min(scale.length - 1, p + (R() < 0.5 ? 1 : -1)))]); } } return out; };
  const M = { A: motif(), B: motif(), C: motif() };
  const LEAD = { nylon: (t, m, d) => nylon(t, m, d, 1.1), trumpet: (t, m, d) => trumpet(t, m, d, 0.9), sax, vibes, flute, kalimba, musicbox, harmonica, whistle: (t, m, d) => whistle(t, m + 12, d), synth };
  const LV = { nylon: 1, trumpet: 1.35, sax: 0.68, vibes: 1.2, flute: 0.47, kalimba: 0.75, musicbox: 1.1, harmonica: 1.05, whistle: 0.72, synth: 0.7 };
  const OCT = 12 * Math.round(S.loct || 0);
  const leadNote = S.lead === 'none' || !LEAD[S.lead] ? () => {} : (t, m, d) => LEAD[S.lead](J(t), m + OCT, d, VV(LV[S.lead] || 1));
  const play = (t, mo, half, chord) => { for (const [s, d, p] of mo) { if ((s >= 8) !== (half === 1)) continue; let m = scale[p]; if (s % 2 === 0 && R() < 0.5) m = near(m, chord.map(x => x + 12).concat(chord.map(x => x + 24))); leadNote(t + e8(s % 8), m, d * Q / 2 * 0.95); } };
  const kit = S.drums;

  let bar = startBar, next = c.currentTime + 0.15, dead = false;
  const sched = () => { if (dead) return; const now = c.currentTime; if (next < now - 0.05) { const k = Math.ceil((now - next) / BAR); next += k * BAR; bar += k; }
    while (next < now + 1.4) { const t = next, b32 = bar % 32, [root, q] = prog[bar % 8], [nr] = prog[(bar + 1) % 8], iv = V[q];
      const sec = b32 < 4 ? 'I' : b32 < 12 ? 'A' : b32 < 20 ? 'B' : b32 < 28 ? 'A2' : 'T', drums = kit !== 'none' && sec !== 'I' && !(sec === 'T' && b32 >= 30);
      const fill = drums && S.fills && (b32 === 11 || b32 === 19 || b32 === 27);
      const ch = iv.map(s => root + (root < 44 ? 24 : 12) + s);
      // chords
      if (S.keys === 'rhodes') { rhodes(t + 0.01, ch, BAR * 0.6, sec === 'I' ? 0.8 : 1); rhodes(t + e8(3), ch.slice(1), Q * 1.1, 0.7); if (bar % 2) rhodes(t + e8(7), ch.slice(2), Q * 0.5, 0.5); }
      else if (S.keys === 'wurli') { wurli(t + 0.01, ch, Q * 1.6); wurli(t + e8(3), ch.slice(1), Q * 0.6, 0.7); wurli(t + Q * 2 + 0.01, ch, Q * 1.2, 0.8); if (bar % 2) wurli(t + e8(7), ch.slice(2), Q * 0.4, 0.6); }
      else if (S.keys === 'piano') { piano(t + 0.01, ch.slice(0, 2), BAR * 0.7, 0.7); [0, 2, 1, 3].forEach((n, k) => piano(t + k * Q + (k % 2 ? SW * 0.5 : 0), [ch[n] + 12], Q * 1.6, k ? 0.75 : 0.9)); }
      else if (S.keys === 'guitar') { strum(t + 0.01, ch, Q * 1.4); strum(t + e8(3), ch.slice(1), Q * 0.8, 0.7); if (bar % 2) strum(t + e8(6), ch.slice(1), Q * 0.6, 0.6); }
      else if (S.keys === 'organ') { organ(t + e8(0), ch, Q * 0.45); organ(t + e8(3), ch, Q * 0.3, 0.8); organ(t + e8(6), ch, Q * 0.9, 0.9); if (sec !== 'I') [1, 5].forEach(k => pluck(t + e8(k) + Q / 4, ch.slice(1).map(x => x + 12), 1)); }
      else if (S.keys === 'pad') pad(t, ch, BAR * 0.98, sec === 'I' ? 0.8 : 1);
      else if (S.keys === 'harp') { const up = ch.concat(ch.map(x => x + 12)); up.forEach((m, k) => harpN(t + k * Q / 4 * 0.5, m, 0.8 - k * 0.04, kSide(k))); if (bar % 2) [3, 2, 1].forEach((n, k) => harpN(t + Q * 2.5 + k * Q / 4, ch[n] + 12, 0.5, kSide(k + 1))); }
      if (S.lead === 'nylon' && S.keys !== 'guitar' && S.keys !== 'harp' && (sec === 'B' || sec === 'I')) for (let k = 0; k < 8; k++) nylon(t + e8(k), ch[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12, Q * 0.9, 0.45, kSide(k));   // guitar arpeggio under the bridge
      // bass
      const br = root < 44 ? root : root - 12, nb = nr < 44 ? nr : nr - 12;
      if (S.bass === 'none') {}
      else if (sec !== 'I') {
        if (S.bass === 'two') { upright(t, br, Q * 1.8); upright(t + Q * 2, br + 7, Q * 1.4); upright(t + e8(7), nb - 1, Q * 0.45, 0.7); }
        else if (S.bass === 'walk') { [br, br + (iv[0] === 3 ? 3 : 4), br + 7, nb + (R() < 0.5 ? 1 : -1)].forEach((m, k) => upright(t + k * Q, m, Q * 0.92, k ? 0.85 : 1)); }
        else if (S.bass === 'fretless') { fretless(t, br, Q * 2.2); fretless(t + e8(5), br + 7, Q * 0.9, 0.8); fretless(t + Q * 3.5, br + 12, Q * 0.5, 0.6); }
        else if (S.bass === 'sub') { sub(t, br, Q * 2.8); sub(t + e8(6), br, Q * 0.8, 0.7); }
        else if (S.bass === 'moog') { moog(t, br, Q * 0.8); moog(t + e8(3), br, Q * 0.3, 0.7); moog(t + Q * 2, br + 7, Q * 0.6, 0.85); moog(t + e8(7), br + 12, Q * 0.3, 0.6); }
        else if (S.bass === 'funk') { finger(t, br, Q * 0.7); finger(t + e8(3), br + 12, Q * 0.3, 0.7); finger(t + e8(4), br, Q * 0.4, 0.8); finger(t + e8(6), br + 7, Q * 0.3, 0.7); finger(t + e8(7), br + 10, Q * 0.3, 0.6); }
      } else if (bar % 2 === 0) ({ sub, funk: finger, moog, fretless }[S.bass] || upright)(t, br, BAR * 0.9, 0.6);
      // drums
      if (drums) {
        const lastBeat = fill ? 3 : 4;
        if (kit === 'brush') { for (let k = 0; k < lastBeat; k++) swish(t + k * Q, Q * 0.9, k % 2 ? 1.2 : 0.8); kick(t, 0.7); kick(t + e8(5), 0.45); rim(t + Q + 0.02, 0.8); if (!fill) rim(t + Q * 3 + 0.02, 0.8); }
        else if (kit === 'ride') { [0, 1, 1 + SW / Q + 0.5, 2, 3, 3 + SW / Q + 0.5].slice(0, fill ? 4 : 6).forEach((p, k) => ride(t + p * Q, k % 3 === 2 ? 0.6 : 1)); tap(t + Q, 0.9); if (!fill) tap(t + Q * 3, 0.9); for (let k = 0; k < lastBeat; k++) swish(t + k * Q, Q * 0.8, 0.5); kick(t, 0.35); if (bar % 4 === 3) rim(t + e8(7), 1); }
        else if (kit === 'lazy') { kick(t, 0.8); kick(t + e8(5), 0.6); if (bar % 2) kick(t + e8(7), 0.4); rim(t + Q + 0.04, 0.9); if (!fill) rim(t + Q * 3 + 0.04, 0.9); if (S.dh) for (let k = 0; k < lastBeat * 4; k++) shakerI(J(t + e16(k)), VV(k % 4 === 2 ? 1.2 : k % 2 ? 0.5 : 0.8)); }
        else if (kit === 'bossa') { kick(t, 0.7); kick(t + Q * 1.5, 0.5); kick(t + Q * 2, 0.7); kick(t + Q * 3.5, 0.5); [0, 3, 6, 10, 13].forEach(s => s < lastBeat * 4 && rim(t + s * Q / 4, 0.85)); for (let k = 0; k < lastBeat * 2; k++) hat(t + k * Q / 2, k % 2 ? 0.45 : 0.7); }
        else if (kit === 'half') { kick(t); kick(t + e8(3) + Q / 4, 0.55); if (bar % 2) kick(t + e8(5), 0.7); snare(t + Q * 2 + 0.03); for (let k = 0; k < lastBeat * 4; k++) { hat(t + e16(k), k % 4 === 0 ? 0.9 : k % 2 ? 0.4 : 0.6); if (bar % 4 === 3 && k >= 12 && k < 14) { hat(t + e16(k) + Q / 12, 0.4); hat(t + e16(k) + Q / 6, 0.4); } } }
        else if (kit === 'boom') { kick(t); kick(t + e8(3), 0.6); kick(t + e8(5), 0.85); snare(t + Q + 0.025); if (!fill) snare(t + Q * 3 + 0.025); for (let k = 0; k < lastBeat * 2; k++) hat(t + e8(k), k % 2 ? 0.6 : 1); if (bar % 4 === 3 && !fill) hat(t + e8(7) + Q / 4, 0.5); if (bar % 8 === 7 && !fill) hat(t + e8(7), 0.7, true); }
        if (fill) { if (kit === 'brush' || kit === 'ride' || kit === 'bossa') { [0, 1, 2, 3].forEach(k => (S.ds ? tap : () => {})(t + Q * 3 + e16(k), 0.6 + k * 0.15)); }
          else { const fs = [[0, 210], [1, 210], [2, 160], [3, 120]]; fs.forEach(([k, f]) => tom(t + Q * 3 + e16(k), f, 0.8)); } }
      }
      // percussion layer (its own part, plays with any drum kit or none)
      const pc = S.perc; if (pc !== 'none' && sec !== 'I') {
        if (pc === 'shaker') for (let k = 0; k < 16; k++) shaker(t + e16(k), k % 4 === 2 ? 1.2 : k % 2 ? 0.5 : 0.8);
        else if (pc === 'tamb') for (let k = 0; k < 8; k++) tamb(t + e8(k), k % 2 ? 0.55 : k % 4 === 2 ? 1.2 : 0.8);
        else if (pc === 'snaps') { snap(t + Q + 0.02, 1); snap(t + Q * 3 + 0.02, 1); if (bar % 4 === 3) snap(t + e8(7), 0.6); }
        else if (pc === 'conga') { conga(t + e8(1), 190, 0.6); conga(t + e8(3), 190, 0.9, true); conga(t + e8(6), 260, 0.8); conga(t + e8(7), 260, 0.7); if (bar % 2) conga(t + e8(4), 190, 0.5); }
        else if (pc === 'clave') { (bar % 2 ? [0, 1.5, 3] : [1, 2]).forEach(p => clave(t + p * Q, 1)); }
      }
      // melody
      if (sec === 'A' || sec === 'A2') play(t, M.A, b32 % 2, ch); else if (sec === 'B') play(t, (b32 - 12) % 4 < 2 ? M.B : M.C, b32 % 2, ch); else if (sec === 'T' && b32 < 30) play(t, M.A, b32 % 2, ch);
      // world sounds
      const X = S.extra;
      if ((X === 'drops' || X === 'rain') && R() < (X === 'rain' ? 0.45 : 0.7)) { const n = 1 + (R() * 3 | 0); for (let k = 0; k < n; k++) drop(t + Q * R() * 4, scale[scale.length - 1 - (R() * 4 | 0)] + 12); }
      if (X === 'chips') { if (R() < 0.2) clink(t + Q * R() * 4); if (bar % 16 === 8) { bell(t + Q * 3, 84 + KEY, Q); bell(t + Q * 3.25, 88 + KEY, Q * 1.5); } }
      if (X === 'cafe' && R() < 0.35) clink(t + Q * R() * 4);
      if (X === 'birds' && R() < 0.4) chirp(t + Q * R() * 4);
      if (X === 'pins' && bar % 8 === 6) strike(t + Q * 2);
      if (X === 'chimes' && R() < 0.45) { const n = 2 + (R() * 3 | 0), t0 = t + Q * R() * 3; for (let k = 0; k < n; k++) chime(t0 + k * (0.08 + R() * 0.15), scale[(R() * scale.length) | 0] + 24); }
      if (X === 'crickets') { const n = 2 + (R() * 3 | 0); for (let k = 0; k < n; k++) cricket(t + Q * R() * 4); }
      if (X === 'train') { if (bar % 16 === 10) horn(t + Q); if (bar % 16 >= 9 && bar % 16 <= 12) for (let k = 0; k < 4; k += 2) clack(t + k * Q); }
      if (X === 'typewriter') { if (R() < 0.6) { const n = 3 + (R() * 6 | 0), s0 = (R() * 8) | 0; for (let k = 0; k < n; k++) type1(t + e16(s0 + k) + rnd() * 0.02); } if (bar % 8 === 7) ding(t + Q * 3); }
      bar++; next += BAR; } };
  sched(); const timer = setInterval(sched, 200);
  return { stop() { dead = true; clearInterval(timer); for (const n of nodes) try { n.stop(); } catch (e) {} try { tape.disconnect(); } catch (e) {} } };
}
