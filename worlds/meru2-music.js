// MERU 2.0 — ZONE MUSIC (s150l, Ben: "unique game music to fade in and out between each area zone"). Every zone key gets its own ORIGINAL
// procedural song: tempo, key + mode, 8-bar chord loop, drum kit pattern, bass line, arpeggio and a seeded lead melody in AABA phrases,
// on its own instrument set. Scheduled 16th by 16th (200 ms look-ahead) into the zone track's gain, so meru2-audio.js crossfades them (2.8 s).
// zoneSong(c, out, t, key) → true if this key has a song (t.timer + t.dead are honoured by killTrack).
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const MODES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phryg: [0, 1, 3, 5, 7, 8, 10], penta: [0, 2, 4, 7, 9, 12, 14] };
// k = kick, s = snare, h = hat, p = shaker, c = clap, t = tom, r = rim (16 steps, x = hit, o = soft)
const S = {
  town:       { bpm: 100, root: 53, mode: 'major', prog: [0, 5, 3, 4, 0, 5, 3, 4], lead: 'flute', arp: 'marimba', pad: 'warm', bass: 'round', dens: 0.7, k: 'x.......x.......', s: '....x.......x...', h: '..x...x...x...x.', p: 'o.o.o.o.o.o.o.o.' },
  market:     { bpm: 112, root: 50, mode: 'mixo', prog: [0, 6, 3, 0, 0, 6, 4, 4], lead: 'reed', arp: 'pluck', pad: 'reed', bass: 'bouncy', dens: 0.85, k: 'x...x...x...x...', c: '....x.......x...', p: 'xoxoxoxoxoxoxoxo', h: '' },
  court:      { bpm: 104, root: 52, mode: 'dorian', prog: [0, 3, 0, 3, 5, 4, 0, 4], lead: 'organ', arp: 'stab', pad: 'organ', bass: 'slap', dens: 0.7, swing: 0.12, k: 'x..x..x...x.....', s: '....x.......x..o', h: 'x.x.x.x.x.x.x.xo', r: '' },
  civic:      { bpm: 92, root: 46, mode: 'major', prog: [0, 3, 4, 0, 5, 3, 1, 4], lead: 'brass', arp: 'pluck', pad: 'brass', bass: 'round', dens: 0.55, k: 'x.......x.......', s: '....x.o.....x.o.', h: 'x...x...x...x...' },
  gardens:    { bpm: 78, root: 55, mode: 'lydian', prog: [0, 1, 0, 1, 3, 2, 4, 1], lead: 'bell', arp: 'harp', pad: 'soft', bass: 'soft', dens: 0.45, p: 'o...o...o...o...' },
  castlepath: { bpm: 96, root: 50, mode: 'minor', prog: [0, 5, 2, 6, 0, 5, 6, 4], lead: 'horn', arp: 'pluck', pad: 'strings', bass: 'round', dens: 0.6, k: 'x.......x.x.....', t: '....x.......x.x.', h: '' },
  barracks:   { bpm: 110, root: 48, mode: 'minor', prog: [0, 0, 5, 4, 0, 0, 3, 4], lead: 'brass', arp: 'stab', pad: 'brass', bass: 'march', dens: 0.6, k: 'x...x...x...x...', s: 'x.ox..ox..x.xoxo', h: '' },
  skate:      { bpm: 90, root: 45, mode: 'minor', prog: [0, 0, 5, 6, 0, 0, 3, 4], lead: 'saw', arp: 'stab', pad: 'none', bass: 'wobble', dens: 0.6, swing: 0.16, k: 'x.....x...x.....', s: '....x.......x...', h: 'x.xox.x.x.xox.xo' },
  ruinspath:  { bpm: 70, root: 52, mode: 'phryg', prog: [0, 1, 0, 6, 0, 1, 2, 1], lead: 'flute', arp: 'none', pad: 'drone', bass: 'drone', dens: 0.35, t: 'x......o..x.....', p: '' },
  ruins:      { bpm: 60, root: 47, mode: 'phryg', prog: [0, 0, 1, 1, 5, 5, 1, 0], lead: 'bell', arp: 'none', pad: 'choir', bass: 'drone', dens: 0.25 },
  lakepath:   { bpm: 88, root: 57, mode: 'major', prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: 'flute', arp: 'guitar', pad: 'soft', bass: 'round', dens: 0.55, s: '....o.......o...', h: 'o.o.o.o.o.o.o.o.' },
  lake:       { bpm: 72, root: 51, mode: 'major', prog: [0, 3, 5, 4, 0, 3, 1, 4], lead: 'bell', arp: 'harp', pad: 'warm', bass: 'soft', dens: 0.4 },
  island:     { bpm: 100, root: 48, mode: 'major', prog: [0, 3, 4, 0, 0, 3, 4, 4], lead: 'steel', arp: 'marimba', pad: 'none', bass: 'bouncy', dens: 0.75, k: 'x.....x.x.......', r: '...x..x....x..x.', p: 'xoxoxoxoxoxoxoxo' },
  falls:      { bpm: 66, root: 53, mode: 'lydian', prog: [0, 1, 5, 4, 0, 1, 3, 4], lead: 'horn', arp: 'harp', pad: 'strings', bass: 'soft', dens: 0.4, t: 'x...............' },
  ridge:      { bpm: 84, root: 50, mode: 'dorian', prog: [0, 6, 0, 6, 3, 4, 0, 6], lead: 'pipe', arp: 'none', pad: 'drone', bass: 'drone', dens: 0.6, t: 'x..o..x...x..o..' },
  castle:     { bpm: 80, root: 51, mode: 'major', prog: [0, 4, 5, 2, 3, 0, 1, 4], lead: 'strings', arp: 'harpsi', pad: 'strings', bass: 'round', dens: 0.6 },
  park:       { bpm: 108, root: 55, mode: 'major', prog: [0, 3, 4, 3, 0, 5, 1, 4], lead: 'kazoo', arp: 'xylo', pad: 'none', bass: 'bouncy', dens: 0.8, k: 'x.......x.......', c: '....x.......x...', h: '..x...x...x...x.' },
};
const hash = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
export const ZONE_SONGS = S;
export function zoneSong(c, out, t, key) {
  const Z = S[key]; if (!Z) return false;
  const R = rng(hash(key)), sc = MODES[Z.mode], Q = 60 / Z.bpm, ST = Q / 4;
  const deg = (d, oct = 0) => { const n = sc.length, o = Math.floor(d / n); return Z.root + sc[((d % n) + n) % n] + 12 * (o + oct); };
  const chord = d => [deg(d), deg(d + 2), deg(d + 4)];
  // mix: song bus → glue comp → out, plus a reverb send (a generated decaying-noise impulse)
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2; comp.connect(out);
  const bus = c.createGain(); bus.gain.value = 0.55; bus.connect(comp);
  const verb = c.createConvolver(); { const len = c.sampleRate * 2.2, b = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } verb.buffer = b; }
  const vs = c.createGain(); vs.gain.value = 0.3; vs.connect(verb); verb.connect(comp);
  const noise = (() => { const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; })();
  const env = (g, t0, a, peak, dec, sus = 0, rel = 0) => { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(peak, t0 + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus || 0.0001), t0 + a + dec); if (rel) g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec + rel); };
  const osc = (type, f, t0, dur, g, det = 0) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det; o.connect(g); o.start(t0); o.stop(t0 + dur + 0.05); return o; };
  const voice = (vol, wet = 0.3, pan = 0) => { const g = c.createGain(), p = c.createStereoPanner ? c.createStereoPanner() : null; if (p) { p.pan.value = pan; g.connect(p); p.connect(bus); if (wet) { const w = c.createGain(); w.gain.value = wet; p.connect(w); w.connect(vs); } } else g.connect(bus); g.gain.value = vol; return g; };
  // ---- instruments ----
  const INS = {
    marimba: (m, t0, d, v = 1) => { const g = voice(0.18 * v, 0.25, -0.2), e = c.createGain(); e.connect(g); env(e, t0, 0.004, 1, 0.35); osc('sine', mtof(m), t0, 0.5, e); const e2 = c.createGain(); e2.connect(g); env(e2, t0, 0.002, 0.3, 0.08); osc('sine', mtof(m) * 4, t0, 0.15, e2); },
    xylo: (m, t0, d, v = 1) => { const g = voice(0.14 * v, 0.25, 0.2), e = c.createGain(); e.connect(g); env(e, t0, 0.002, 1, 0.22); osc('triangle', mtof(m + 12), t0, 0.3, e); },
    pluck: (m, t0, d, v = 1) => { const g = voice(0.12 * v, 0.2, -0.25), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t0); f.frequency.exponentialRampToValueAtTime(500, t0 + 0.25); f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.003, 1, 0.3); osc('sawtooth', mtof(m), t0, 0.4, e); },
    guitar: (m, t0, d, v = 1) => { const g = voice(0.13 * v, 0.3, 0.25), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2200; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.002, 1, 0.6); osc('triangle', mtof(m), t0, 0.8, e); osc('sawtooth', mtof(m), t0, 0.8, e, 7).frequency.value = mtof(m); },
    harp: (m, t0, d, v = 1) => { const g = voice(0.13 * v, 0.5, 0.15), e = c.createGain(); e.connect(g); env(e, t0, 0.003, 1, 1.1); osc('triangle', mtof(m + 12), t0, 1.3, e); },
    harpsi: (m, t0, d, v = 1) => { const g = voice(0.09 * v, 0.3, -0.15), f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 400; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.002, 1, 0.4); osc('square', mtof(m + 12), t0, 0.5, e); osc('square', mtof(m + 24), t0, 0.5, e, 4); },
    stab: (m, t0, d, v = 1) => { const g = voice(0.07 * v, 0.2, 0), e = c.createGain(); e.connect(g); env(e, t0, 0.005, 1, 0.16); for (const n of [0, 3, 7]) osc('sawtooth', mtof(m + n), t0, 0.22, e, (n - 3) * 3); },
    bell: (m, t0, d, v = 1) => { const g = voice(0.12 * v, 0.55, 0.1), e = c.createGain(); e.connect(g); env(e, t0, 0.003, 1, 2.2); osc('sine', mtof(m + 12), t0, 2.4, e); const e2 = c.createGain(); e2.connect(g); env(e2, t0, 0.002, 0.35, 0.6); osc('sine', mtof(m + 12) * 2.76, t0, 0.8, e2); },
    flute: (m, t0, d, v = 1) => { const g = voice(0.12 * v, 0.4, 0.1), e = c.createGain(); e.connect(g); env(e, t0, 0.06, 1, d, 0.7, 0.15); const o = osc('sine', mtof(m + 12), t0, d + 0.25, e), l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 5.2; lg.gain.value = 6; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + d + 0.3); },
    pipe: (m, t0, d, v = 1) => { const g = voice(0.1 * v, 0.45, 0.1), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = mtof(m + 12) * 2; f.Q.value = 1.2; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.04, 1, d, 0.8, 0.12); osc('square', mtof(m + 12), t0, d + 0.2, e); },
    reed: (m, t0, d, v = 1) => { const g = voice(0.08 * v, 0.25, 0.1), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.02, 1, d, 0.8, 0.08); osc('square', mtof(m + 12), t0, d + 0.12, e); osc('sawtooth', mtof(m + 12), t0, d + 0.12, e, 8); },
    organ: (m, t0, d, v = 1) => { const g = voice(0.08 * v, 0.25, 0.1), e = c.createGain(); e.connect(g); env(e, t0, 0.01, 1, d, 0.9, 0.05); for (const [r, a] of [[1, 1], [2, 0.5], [3, 0.3]]) { const og = c.createGain(); og.gain.value = a; og.connect(e); osc('sine', mtof(m + 12) * r, t0, d + 0.08, og); } },
    brass: (m, t0, d, v = 1) => { const g = voice(0.09 * v, 0.3, 0.05), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(600, t0); f.frequency.linearRampToValueAtTime(2400, t0 + 0.08); f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.04, 1, d, 0.75, 0.1); osc('sawtooth', mtof(m), t0, d + 0.15, e); osc('sawtooth', mtof(m), t0, d + 0.15, e, 9); },
    horn: (m, t0, d, v = 1) => INS.brass(m - 12 + 12, t0, d, v * 1.1),
    strings: (m, t0, d, v = 1) => { const g = voice(0.07 * v, 0.5, -0.1), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2600; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.12, 1, d, 0.85, 0.3); for (const dt of [-8, 0, 8]) osc('sawtooth', mtof(m + 12), t0, d + 0.35, e, dt); },
    steel: (m, t0, d, v = 1) => { const g = voice(0.13 * v, 0.35, 0.15), e = c.createGain(); e.connect(g); env(e, t0, 0.003, 1, 0.55); osc('sine', mtof(m + 12), t0, 0.7, e); const e2 = c.createGain(); e2.connect(g); env(e2, t0, 0.003, 0.4, 0.25); osc('sine', mtof(m + 12) * 2.01, t0, 0.4, e2); },
    saw: (m, t0, d, v = 1) => { const g = voice(0.07 * v, 0.25, 0.1), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1500; f.Q.value = 4; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.01, 1, d, 0.6, 0.06); osc('sawtooth', mtof(m + 12), t0, d + 0.1, e); },
    kazoo: (m, t0, d, v = 1) => { const g = voice(0.07 * v, 0.2, 0.1), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.02, 1, d, 0.8, 0.05); const o = osc('sawtooth', mtof(m + 12), t0, d + 0.1, e), l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 7; lg.gain.value = 9; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + d + 0.15); },
  };
  const PAD = { warm: ['triangle', 900, 0.05], soft: ['sine', 700, 0.06], reed: ['square', 900, 0.025], organ: ['sine', 1400, 0.045], brass: ['sawtooth', 900, 0.022], strings: ['sawtooth', 1300, 0.02], choir: ['triangle', 1100, 0.05], drone: ['sawtooth', 500, 0.025] };
  const pad = (ch, t0, d) => { const P = PAD[Z.pad]; if (!P) return; const g = voice(P[2], 0.6, 0), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = P[1]; f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, Math.min(0.8, d * 0.3), 1, d * 0.6, 0.6, d * 0.35);
    (Z.pad === 'drone' ? [ch[0] - 12, ch[0] - 5] : ch).forEach((m, i) => { osc(P[0], mtof(m), t0, d + 0.2, e, (i - 1) * 7); if (Z.pad === 'choir') osc('sine', mtof(m + 12), t0, d + 0.2, e, (i - 1) * -5); }); };
  const bassN = (m, t0, d, v = 1) => { if (Z.bass === 'none') return; const type = Z.bass === 'slap' || Z.bass === 'wobble' ? 'sawtooth' : Z.bass === 'drone' ? 'triangle' : 'triangle', g = voice(0.2 * v, 0.05, 0), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(Z.bass === 'slap' ? 1800 : Z.bass === 'wobble' ? 300 : 600, t0); if (Z.bass === 'slap') f.frequency.exponentialRampToValueAtTime(350, t0 + 0.12);
    if (Z.bass === 'wobble') { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = Z.bpm / 60 * 2; lg.gain.value = 500; l.connect(lg); lg.connect(f.frequency); l.start(t0); l.stop(t0 + d + 0.1); } f.connect(g); const e = c.createGain(); e.connect(f); env(e, t0, 0.008, 1, d * 0.9, Z.bass === 'drone' ? 0.8 : 0.3, 0.06); osc(type, mtof(m - 12), t0, d + 0.1, e); if (Z.bass !== 'drone') osc('sine', mtof(m - 24), t0, d + 0.1, e); };
  // ---- drums ----
  const nz = (t0, dur, hp, lp, vol, pan = 0) => { const s = c.createBufferSource(); s.buffer = noise; const h = c.createBiquadFilter(); h.type = 'highpass'; h.frequency.value = hp; const l = c.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = lp; const g = voice(1, 0.1, pan), e = c.createGain(); s.connect(h); h.connect(l); l.connect(e); e.connect(g); env(e, t0, 0.002, vol, dur); s.start(t0, Math.random() * 0.5); s.stop(t0 + dur + 0.05); };
  const DR = { k: (t0, v) => { const g = voice(0.5 * v, 0, 0), e = c.createGain(); e.connect(g); env(e, t0, 0.003, 1, 0.3); const o = osc('sine', 120, t0, 0.35, e); o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(45, t0 + 0.18); },
    s: (t0, v) => { nz(t0, 0.16, 1500, 7000, 0.35 * v); const g = voice(0.15 * v, 0.1), e = c.createGain(); e.connect(g); env(e, t0, 0.002, 1, 0.08); osc('triangle', 190, t0, 0.1, e); },
    h: (t0, v) => nz(t0, 0.04, 7000, 14000, 0.12 * v, 0.3), p: (t0, v) => nz(t0, 0.05, 5000, 11000, 0.07 * v, -0.3), c: (t0, v) => { for (let i = 0; i < 3; i++) nz(t0 + i * 0.008, 0.1, 1200, 5000, 0.18 * v); },
    t: (t0, v) => { const g = voice(0.3 * v, 0.3), e = c.createGain(); e.connect(g); env(e, t0, 0.003, 1, 0.35); const o = osc('sine', 110, t0, 0.4, e); o.frequency.exponentialRampToValueAtTime(70, t0 + 0.3); },
    r: (t0, v) => { const g = voice(0.12 * v, 0.1), e = c.createGain(); e.connect(g); env(e, t0, 0.001, 1, 0.04); osc('square', 1700, t0, 0.05, e); } };
  // ---- the seeded melody: 4-bar phrases A A' B A over the 8-bar loop ×2 (16 bars) ----
  const phrase = (bars0) => { const out2 = []; for (let b = 0; b < 4; b++) { const ch = Z.prog[(bars0 + b) % 8]; let s = 0; while (s < 16) { const len = [2, 2, 4, 4, 6, 8][Math.floor(R() * 6)]; if (R() < Z.dens) { const pick = R(); const d0 = pick < 0.6 ? ch + [0, 2, 4][Math.floor(R() * 3)] : ch + Math.floor(R() * 7) - 3; out2.push({ s: b * 16 + s, d: d0, len: Math.min(len, 16 - s) }); } s += len; } } return out2; };
  const A = phrase(0), B = phrase(4), A2 = A.map(n => ({ ...n, d: n.s >= 48 ? n.d + (R() < 0.5 ? 1 : -1) : n.d }));
  const MEL = [...A.map(n => ({ ...n })), ...A2.map(n => ({ ...n, s: n.s + 64 })), ...B.map(n => ({ ...n, s: n.s + 128 })), ...A.map(n => ({ ...n, s: n.s + 192 }))];
  const melAt = {}; for (const n of MEL) melAt[n.s] = n;
  const ARPP = [0, 1, 2, 1, 0, 2, 1, 2]; const bassPat = { round: [0, 8], bouncy: [0, 6, 8, 14], slap: [0, 3, 6, 10, 12], march: [0, 4, 8, 12], soft: [0], drone: [0], wobble: [0, 10] }[Z.bass] || [0, 8];
  let step = 0, next = c.currentTime + 0.1;
  const sched = () => { if (t.dead) return; const now = c.currentTime; if (next < now - 0.05) { const k = Math.ceil((now + 0.05 - next) / ST); next += k * ST; step += k; }   /* s654: after a long stall, skip the lost steps on the beat grid (no burst of crammed notes) */
    while (next < now + 1.2) {   /* s654 SKIP FIX: 1.2 s of notes are queued ahead (was 0.25 s: any frame over ~160 ms, e.g. a build step or shader compile while walking, left a gap) */ const s16 = step % 16, bar = Math.floor(step / 16), b8 = bar % 8, ch = chord(Z.prog[b8]), sw = (s16 % 2 ? (Z.swing || 0) * ST * 2 : 0), tt = next + sw;
      const intro = bar < 2;   // the first 2 bars: pad + bass only, then the band comes in
      if (s16 === 0) pad(ch, tt, Q * 4);
      if (bassPat.includes(s16)) bassN(s16 === 0 || Z.bass === 'drone' ? ch[0] : (s16 % 4 === 2 ? ch[2] : ch[0]), tt, Z.bass === 'drone' ? Q * 4 : ST * (Z.bass === 'round' ? 7 : 3), 1);
      if (!intro) { for (const k of ['k', 's', 'h', 'p', 'c', 't', 'r']) { const pat = Z[k]; if (!pat) continue; const ch2 = pat[s16]; if (ch2 === 'x') DR[k](tt, 1); else if (ch2 === 'o') DR[k](tt, 0.45); }
        if (Z.arp !== 'none' && INS[Z.arp] && (Z.arp === 'stab' ? s16 % 4 === 2 : s16 % 2 === 0)) INS[Z.arp](ch[ARPP[(s16 / 2) % 8 | 0]] + (Z.arp === 'harp' || Z.arp === 'marimba' ? 12 : 0), tt, ST * 2, 0.8);
        const n = melAt[step % 256]; if (n && bar >= 4 && INS[Z.lead]) INS[Z.lead](deg(n.d, 1), tt, n.len * ST * 0.92, 1); }
      step++; next += ST; } };
  sched(); t.timer = setInterval(sched, 120);
  return true;
}
