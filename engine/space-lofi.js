// 8 GATES · SPACE LOFI (s409, Ben: "hip + mystical sci-fi space lofi, fades into battle lofi and back when danger is gone").
// Pure Web Audio synth, no files, phone-light (one look-ahead scheduler, ~12 voices max). Both songs share 78 BPM + F dorian on the
// same bar grid, so the crossfade never clashes: they run together and the mix slides between them.
//   CRUISE  "Nebula Drift": dusty vinyl crackle + tape wobble, a warm Rhodes-style electric piano on a jazzy 4-chord loop
//           (Fm9 · B♭13 · E♭maj9 · Cm11), a round sub bass, a lazy swung boom-bap (soft kick, rimshot, shuffled hats), a breathy
//           glass-flute melody through a long echo, and slow "star chime" bells drifting in the stereo field.
//   BATTLE  "Red Shift": the same groove with the kick doubled, a crunchy snare, 16th hats, a pulsing detuned saw bass, a
//           tense minor arpeggio, a rising filter riser on bar 8, and a low warning drone.
// danger(k 0..1): the map sets it; the mix eases toward it (in ~3 s, out ~6 s) so it never snaps.
//   const L = spaceLofi(); L.start() · L.danger(k) · L.volume(v) · L.stop()   · mute: window.__8gMuted · volume localStorage 'space.music.v1'
const BPM = 78, SPB = 60 / BPM, STEP = SPB / 4, BARS = 8;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
// F dorian chords (root + voicing, MIDI)
const CH = [
  { root: 41, v: [53, 56, 60, 63, 67] },   // Fm9
  { root: 46, v: [53, 56, 58, 62, 67] },   // B♭13
  { root: 39, v: [55, 58, 62, 63, 67] },   // E♭maj9
  { root: 48, v: [51, 55, 58, 60, 65] },   // Cm11
];
// cruise flute melody (one per bar, [step, midi, len in steps]); rests are fine
const MEL = [
  [[0, 72, 6], [8, 75, 4], [12, 77, 4]], [[2, 75, 6], [10, 72, 6]], [[0, 70, 8], [10, 74, 4], [14, 75, 2]], [[0, 72, 12]],
  [[4, 77, 4], [8, 79, 4], [12, 77, 4]], [[0, 75, 6], [8, 74, 6]], [[0, 72, 4], [6, 70, 4], [12, 67, 4]], [[0, 68, 10]],
];
// battle arp (16 steps, chord-tone index, -1 = rest)
const ARP = [0, 2, 4, 2, 1, 3, 4, 3, 0, 2, 4, 2, 3, 4, 3, 1];
// s438 RED ALERT: the battle song's own key (E minor i-♭VI-♭VII-V) + a short siren-like lead
const BCH = [{ root: 40, v: [52, 55, 59, 64] }, { root: 36, v: [52, 55, 60, 64] }, { root: 38, v: [54, 57, 62, 66] }, { root: 35, v: [51, 54, 59, 63] }];
const BMEL = [[[0, 76, 3], [4, 79, 3], [8, 83, 6]], [[0, 81, 2], [2, 79, 2], [4, 76, 8]], [[0, 76, 3], [4, 79, 3], [8, 84, 6]], [[0, 83, 4], [6, 81, 2], [8, 78, 8]], [[0, 88, 3], [4, 86, 3], [8, 83, 6]], [[0, 84, 2], [2, 83, 2], [4, 79, 8]], [[0, 81, 3], [4, 83, 3], [8, 86, 6]], [[0, 87, 12]]];
// s432 A SONG FOR EVERY WORLD (Ben: "unique lofi per planet, fades between"). Same 78 BPM + 8-bar grid as Nebula Drift, so any two crossfade
// cleanly: each world has its own key + chords, lead instrument, chord style, drum feel and texture. Melodies are written by a seeded
// generator from each song's chords (same notes every visit). Deep space = Nebula Drift. lofi.world(key) picks the song; ~5 s crossfade.
const C9 = (r, v) => ({ root: r, v });
export const THEMES = {
  // Ben: the original song stays as the PLAYER'S HOME PLANET music (the new home world, later); open space gets its own sparse VOID DRIFT
  home: { title: 'NEBULA DRIFT', ch: CH, lead: 'flute', keys: 'rhodes', drums: 'boom', tex: 'chime', sw: 0.18, mel: MEL },
  deep: { title: 'VOID DRIFT', ch: [C9(45, [55, 59, 60, 64, 71]), C9(41, [55, 57, 60, 64, 71]), C9(48, [55, 59, 62, 64, 71]), C9(40, [55, 59, 62, 66, 71])], lead: 'bell', keys: 'pad', drums: 'half', tex: 'chime', sw: 0.14, seed: 5, rh: 'sparse' },
  // Ben: MERU is the centre of the galaxy, so its song is the EPIC one: D minor i–VI–III–VII, a choir pad, a brass horn lead, taiko hits + a swell
  meru: { title: 'HEART OF THE GALAXY', ch: [C9(38, [50, 57, 62, 65, 69]), C9(46, [50, 58, 62, 65, 70]), C9(41, [53, 57, 60, 65, 69]), C9(48, [52, 55, 60, 64, 67])], lead: 'horn', keys: 'choir', drums: 'epic', tex: 'lantern', sw: 0.1, seed: 11, rh: 'mid' },
  shasta: { title: 'SNOWLIGHT', ch: [C9(40, [56, 59, 63, 66, 68]), C9(37, [56, 59, 61, 64, 68]), C9(45, [56, 57, 61, 64, 68]), C9(47, [54, 56, 59, 61, 66])], lead: 'bell', keys: 'pad', drums: 'half', tex: 'wind', sw: 0.12, seed: 23, rh: 'sparse' },
  luxor: { title: 'SUN DIAL', ch: [C9(38, [52, 53, 57, 62, 64]), C9(39, [51, 55, 58, 62, 63]), C9(36, [51, 55, 58, 60, 63]), C9(38, [50, 55, 57, 62, 64])], lead: 'oud', keys: 'arp', drums: 'tabla', tex: 'sand', sw: 0.14, seed: 37, rh: 'busy' },
  ur: { title: 'RED CANYON', ch: [C9(45, [55, 57, 60, 64, 67]), C9(41, [53, 57, 60, 64, 65]), C9(43, [55, 59, 62, 64, 67]), C9(40, [55, 59, 62, 64, 67])], lead: 'harp', keys: 'rhodes', drums: 'half', tex: 'echoes', sw: 0.22, seed: 41, rh: 'mid' },
  gaya: { title: 'FIRST FLAME', ch: [C9(43, [54, 55, 59, 61, 62]), C9(43, [55, 57, 60, 64, 67]), C9(40, [54, 55, 59, 62, 66]), C9(36, [55, 59, 62, 64, 67])], lead: 'flute', keys: 'arp', drums: 'shuffle', tex: 'embers', sw: 0.26, seed: 53, rh: 'mid' },
  zion: { title: 'SALT FLATS', ch: [C9(46, [56, 58, 60, 62, 65]), C9(44, [55, 56, 60, 63, 67]), C9(41, [55, 58, 63, 65, 67]), C9(48, [55, 58, 60, 63, 67])], lead: 'marimba', keys: 'stab', drums: 'bounce', tex: 'sparkle', sw: 0.16, seed: 67, rh: 'busy' },
  nebo: { title: 'TIDE GLIDER', ch: [C9(36, [55, 59, 62, 64, 67]), C9(45, [55, 59, 60, 64, 67]), C9(41, [55, 57, 60, 64, 65]), C9(43, [53, 57, 59, 64, 65])], lead: 'whistle', keys: 'pad', drums: 'boom', tex: 'waves', sw: 0.2, seed: 71, rh: 'sparse' },
  kufa: { title: 'CRYSTAL MARKET', ch: [C9(40, [54, 55, 59, 62, 66]), C9(36, [55, 59, 60, 64, 67]), C9(45, [55, 59, 60, 64, 67]), C9(47, [54, 57, 59, 60, 63])], lead: 'vibe', keys: 'rhodes', drums: 'shuffle', tex: 'chime', sw: 0.28, seed: 83, rh: 'mid' },
  jidda: { title: 'SURF SUNSET', ch: [C9(41, [57, 60, 64, 65, 69]), C9(40, [55, 59, 62, 64, 67]), C9(38, [57, 60, 62, 65, 69]), C9(48, [55, 59, 60, 64, 67])], lead: 'steel', keys: 'stab', drums: 'reggae', tex: 'waves', sw: 0.2, seed: 97, rh: 'busy' },
};
const RH = { sparse: [[[0, 8], [10, 6]], [[2, 10]], [[0, 4], [8, 8]], [[0, 14]]], mid: [[[0, 4], [6, 2], [8, 6]], [[2, 4], [8, 4], [12, 4]], [[0, 6], [10, 4], [14, 2]], [[0, 12]]],
  busy: [[[0, 2], [3, 2], [6, 2], [8, 4], [12, 2]], [[0, 3], [4, 2], [8, 2], [10, 4]], [[2, 2], [4, 2], [6, 4], [12, 4]], [[0, 6], [8, 8]]] };
function genMel(T) { let x = T.seed * 9301 + 49297; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280; const out = []; let last = 74;
  for (let bar = 0; bar < BARS; bar++) { const ch = T.ch[Math.floor(bar / 2) % 4], tones = []; for (const m of ch.v) for (const o of [12, 24]) if (m + o >= 67 && m + o <= 86) tones.push(m + o); tones.sort((a, b) => a - b);
    const rr = RH[T.rh][bar % 4], notes = []; for (const [st, ln] of rr) { if (bar === 7 && st > 0) continue; let i = tones.reduce((bi, m, j) => Math.abs(m - last) < Math.abs(tones[bi] - last) ? j : bi, 0); i = Math.max(0, Math.min(tones.length - 1, i + Math.round((rnd() - 0.45) * 3)));
      last = tones[i]; notes.push([st, last, ln]); } out.push(notes); } return out; }
for (const T of Object.values(THEMES)) if (!T.mel) T.mel = genMel(T);
// s439 (Ben): every song uses NEBULA DRIFT's sound (flute lead, rhodes chords, boom-bap drums, chimes, its swing); each keeps its own key, chords + melody.
// The s432 per-world instruments are kept in T.orig to bring back later.
// s452 (Ben: "the music needs to be different, still lofi"): each world its OWN lofi sound again (lead + chord style + drum feel + texture),
// all kept lofi: warm rhodes underneath, lazy swing, soft drums (no epic / reggae / tabla extremes). Nebula Drift (home) unchanged.
const LOFI_SET = {
  deep:   { lead: 'bell',    keys: 'pad',    drums: 'half',    tex: 'chime',   sw: 0.14 },
  meru:   { lead: 'kalimba', keys: 'choir',  drums: 'boom',    tex: 'lantern', sw: 0.2 },
  shasta: { lead: 'bell',    keys: 'pad',    drums: 'half',    tex: 'wind',    sw: 0.12 },
  luxor:  { lead: 'oud',     keys: 'rhodes', drums: 'shuffle', tex: 'sand',    sw: 0.22 },
  ur:     { lead: 'harp',    keys: 'rhodes', drums: 'half',    tex: 'echoes',  sw: 0.22 },
  gaya:   { lead: 'flute',   keys: 'arp',    drums: 'shuffle', tex: 'embers',  sw: 0.26 },
  zion:   { lead: 'marimba', keys: 'stab',   drums: 'boom',    tex: 'sparkle', sw: 0.16 },
  nebo:   { lead: 'whistle', keys: 'pad',    drums: 'boom',    tex: 'waves',   sw: 0.2 },
  kufa:   { lead: 'vibe',    keys: 'rhodes', drums: 'shuffle', tex: 'chime',   sw: 0.28 },
  jidda:  { lead: 'steel',   keys: 'stab',   drums: 'half',    tex: 'waves',   sw: 0.2 },
};
// s455 SONG SETS (Ben): SET 1 = the lofi versions above (saved, switch back any time). SET 2 "MYSTIC" = more mystical: choirs, bells,
// deep pads, long echoes, slower half-time drums. Same keys, chords + melodies per world. Choice saved in localStorage space.music.set.v1.
const MYSTIC_SET = {
  home:   { lead: 'bell',    keys: 'choir', drums: 'half', tex: 'chime',   sw: 0.12 },
  deep:   { lead: 'bell',    keys: 'choir', drums: 'half', tex: 'echoes',  sw: 0.1 },
  meru:   { lead: 'harp',    keys: 'choir', drums: 'half', tex: 'lantern', sw: 0.14 },
  shasta: { lead: 'bell',    keys: 'pad',   drums: 'half', tex: 'wind',    sw: 0.1 },
  luxor:  { lead: 'oud',     keys: 'choir', drums: 'half', tex: 'sand',    sw: 0.16 },
  ur:     { lead: 'flute',   keys: 'choir', drums: 'half', tex: 'echoes',  sw: 0.14 },
  gaya:   { lead: 'harp',    keys: 'pad',   drums: 'half', tex: 'embers',  sw: 0.16 },
  zion:   { lead: 'vibe',    keys: 'choir', drums: 'half', tex: 'sparkle', sw: 0.12 },
  nebo:   { lead: 'whistle', keys: 'pad',   drums: 'half', tex: 'waves',   sw: 0.14 },
  kufa:   { lead: 'bell',    keys: 'choir', drums: 'half', tex: 'chime',   sw: 0.16 },
  jidda:  { lead: 'kalimba', keys: 'pad',   drums: 'half', tex: 'waves',   sw: 0.14 },
};
const PICK = o => ({ lead: o.lead, keys: o.keys, drums: o.drums, tex: o.tex, sw: o.sw });
for (const [k2, v] of Object.entries(LOFI_SET)) if (THEMES[k2]) { THEMES[k2].orig = PICK(THEMES[k2]); Object.assign(THEMES[k2], v); }
const SET1 = Object.fromEntries(Object.keys(THEMES).map(k2 => [k2, PICK(THEMES[k2])]));
const BCH2 = [{ root: 38, v: [50, 53, 57, 60] }, { root: 39, v: [51, 55, 58, 62] }, { root: 34, v: [50, 53, 58, 62] }, { root: 33, v: [49, 52, 57, 61] }];   // Dm · E♭ · B♭ · A
const BCH3 = [{ root: 40, v: [64, 68, 71, 76] }, { root: 47, v: [63, 66, 71, 75] }, { root: 37, v: [64, 68, 73, 76] }, { root: 45, v: [64, 69, 73, 76] }];   // E · B · C#m · A
const GMEL = [[[0, 83, 3], [4, 80, 2], [6, 83, 2], [8, 85, 4], [12, 83, 4]], [[0, 82, 6], [8, 78, 4], [12, 82, 4]], [[0, 80, 3], [4, 81, 2], [6, 80, 2], [8, 76, 6]], [[0, 81, 4], [4, 83, 4], [8, 85, 8]],
  [[0, 88, 3], [4, 85, 2], [6, 88, 2], [8, 87, 4], [12, 85, 4]], [[0, 83, 6], [8, 82, 4], [12, 78, 4]], [[0, 80, 4], [4, 85, 4], [8, 83, 4], [12, 81, 4]], [[0, 80, 12]]];
const BCH4 = [{ root: 41, v: [65, 68, 72, 77] }, { root: 42, v: [66, 70, 73, 78] }, { root: 41, v: [65, 68, 72, 77] }, { root: 40, v: [64, 68, 71, 76] }];   // Fm · G♭ · Fm · E
const AMEL = [[[0, 89, 2], [2, 88, 2], [4, 89, 2], [6, 92, 2], [8, 89, 4], [12, 88, 4]], [[0, 90, 4], [4, 89, 2], [6, 90, 2], [8, 94, 8]], [[0, 89, 2], [2, 88, 2], [4, 89, 2], [6, 92, 2], [8, 96, 4], [12, 94, 4]], [[0, 92, 4], [4, 91, 4], [8, 88, 8]],
  [[0, 96, 2], [2, 94, 2], [4, 92, 2], [6, 94, 2], [8, 96, 8]], [[0, 97, 4], [4, 94, 4], [8, 90, 8]], [[0, 96, 2], [2, 92, 2], [4, 89, 2], [6, 92, 2], [8, 96, 4], [12, 97, 4]], [[0, 95, 4], [4, 92, 4], [8, 88, 8]]];
export const BATTLES = { 1: 'RED ALERT', 2: 'UNDER ATTACK', 3: 'ADVENTURE' };
if (THEMES.deep) THEMES.deep.title = 'BLACK NEBULA';
let BSET = 1; try { const n = Number(localStorage.getItem('space.music.battle.v1')); BSET = n === 2 || n === 3 ? n : 1; } catch (e) {}
export const SETS = { 1: { name: 'SET 1 · LOFI', echo: [0.75, 0.42], data: SET1 }, 2: { name: 'SET 2 · MYSTIC', echo: [1.0, 0.6], data: MYSTIC_SET } };
let SET_N = 1; try { SET_N = Number(localStorage.getItem('space.music.set.v1')) === 2 ? 2 : 1; } catch (e) {}
const applySet = n => { SET_N = n === 2 ? 2 : 1; const D = SETS[SET_N].data; for (const k2 in D) if (THEMES[k2]) Object.assign(THEMES[k2], D[k2]); };
applySet(SET_N);
export const themeTitle = k => (THEMES[k] || THEMES.deep).title;
// s655 (Ben: Meru mirrors the space map): another world registers its own songs (same 78 BPM / 8-bar grid) before start()
export function addThemes(o) { for (const [k2, T] of Object.entries(o)) { if (!T.mel) T.mel = genMel(T); THEMES[k2] = T; } }
let one = null;
export function spaceLofi(opts = {}) {
  if (one) return one;
  // s655 opts (Meru): ctx + out = play inside the world's own audio graph; ns = localStorage prefix; ahead = look-ahead seconds (stall-proof)
  const NS = opts.ns || 'space', AHEAD = opts.ahead || 0.2; let extV = 1, fedAt = -1;
  if (NS !== 'space') { try { const n = Number(localStorage.getItem(NS + '.music.battle.v1')); BSET = n === 2 || n === 3 ? n : 1; } catch (e) {} }
  let ctx = null, master = null, cruiseBus = null, battleBus = null, echo = null, fb = null, wob = null, noiseBuf = null, crackle = null;
  let on = false, timer = 0, next = 0, step = 0, want = 0, k = 0, vol = 0.5, cur = 'deep'; const TB = {}, TK = { deep: 1 };
  // s437 MUSIC WORKSHOP mix (localStorage space.music.mix.v1): world = world-song level, battle = battle-song level, duck 0-1 = how fast the world song fades OUT under the battle song
  let MX = { world: 1, battle: 1, duck: 0.7 }; try { MX = { ...MX, ...(JSON.parse(localStorage.getItem(NS + '.music.mix.v1') || '{}') || {}) }; } catch (e) {}
  const cruiseK = () => Math.cos(Math.min(1, k * (1 + MX.duck * 2)) * Math.PI / 2) * MX.world, battleK = () => Math.sin(k * Math.PI / 2) * MX.battle;
  try { const v = parseFloat(localStorage.getItem(NS + '.music.v1')); if (isFinite(v)) vol = Math.max(0, Math.min(1, v)); } catch (e) {}
  function init() {
    if (ctx) return true; const AC = window.AudioContext || window.webkitAudioContext; if (!opts.ctx && !AC) return false; ctx = opts.ctx || new AC();
    master = ctx.createGain(); master.gain.value = 0; const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6200; lp.Q.value = 0.4;   // lofi: a gentle top roll-off
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; master.connect(lp); lp.connect(comp); comp.connect(opts.out || ctx.destination);
    cruiseBus = ctx.createGain(); battleBus = ctx.createGain(); cruiseBus.gain.value = 1; battleBus.gain.value = 0; cruiseBus.connect(master); battleBus.connect(master);
    for (const key of Object.keys(THEMES)) { const g = ctx.createGain(); g.gain.value = key === 'deep' ? 1 : 0; g.connect(cruiseBus); const w = ctx.createDelay(0.05); w.delayTime.value = 0.012; w.connect(g); g.wob = w; TB[key] = g; TK[key] = TK[key] || 0; }
    // a long dark echo (the "space" in it)
    echo = ctx.createDelay(3); echo.delayTime.value = SPB * SETS[SET_N].echo[0]; fb = ctx.createGain(); fb.gain.value = SETS[SET_N].echo[1]; const eLp = ctx.createBiquadFilter(); eLp.type = 'lowpass'; eLp.frequency.value = 2200;
    echo.connect(eLp); eLp.connect(fb); fb.connect(echo); const eOut = ctx.createGain(); eOut.gain.value = 0.55; eLp.connect(eOut); eOut.connect(master);
    // tape wobble: a slow LFO on a tiny delay that everything melodic passes through
    wob = ctx.createDelay(0.05); wob.delayTime.value = 0.012; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.35; lg.gain.value = 0.0022; lfo.connect(lg); lg.connect(wob.delayTime); lfo.start(); for (const g of Object.values(TB)) lg.connect(g.wob.delayTime);
    // noise buffer (hats, snare, crackle, riser)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // vinyl crackle: sparse clicks + a soft hiss bed, looping
    { const cb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), c = cb.getChannelData(0); for (let i = 0; i < c.length; i++) c[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.5 : 0);
      crackle = ctx.createBufferSource(); crackle.buffer = cb; crackle.loop = true; cb.getChannelData(0).fill(0); /* s435 (Ben): no vinyl crackle */ const cf = ctx.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 3200; cf.Q.value = 0.6; const cg = ctx.createGain(); cg.gain.value = 0.5; crackle.connect(cf); cf.connect(cg); cg.connect(master); crackle.start(); }
    return true; }
  const env = (g, t, a, peak, dcy, sus = 0, rel = 0.3, dur = 0) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (dur) { g.gain.setTargetAtTime(sus * peak, t + a, dcy); g.gain.setTargetAtTime(0.0001, t + dur, rel); } else g.gain.setTargetAtTime(0.0001, t + a, dcy); };
  const pan = (node, p) => { if (!ctx.createStereoPanner) return node; const s = ctx.createStereoPanner(); s.pan.value = p; node.connect(s); return s; };
  // ---- voices ----
  function rhodes(bus, t, m, len, v = 0.06, p = 0) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 2.001;
    const g2 = ctx.createGain(); g2.gain.value = 0.18; o2.connect(g2); g2.connect(f); o.connect(f); f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(700, t + len); f.connect(g); env(g, t, 0.01, v, 0.6, 0.35, 0.5, len);
    const W = bus.wob || wob; pan(g, p).connect(W); if (!bus.wob) wob.connect(bus); o.start(t); o2.start(t); o.stop(t + len + 1.5); o2.stop(t + len + 1.5); }
  function sub(bus, t, m, len, v = 0.16, saw = false) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = saw ? 'sawtooth' : 'sine'; o.frequency.value = mtof(m); let n = o;
    if (saw) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(160, t + len * 0.8); f.Q.value = 6; o.connect(f); n = f; const o2 = ctx.createOscillator(); o2.type = 'sawtooth'; o2.frequency.value = mtof(m) * 1.007; o2.connect(f); o2.start(t); o2.stop(t + len + 0.3); }
    n.connect(g); env(g, t, 0.02, v, 0.25, 0.7, 0.12, len); g.connect(bus); o.start(t); o.stop(t + len + 0.4); }
  function kick(bus, t, v = 0.5) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); env(g, t, 0.004, v, 0.16); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.6); }
  function noise(bus, t, dur, v, type, freq, q = 1, p = 0) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g); env(g, t, 0.002, v, dur); pan(g, p).connect(bus); s.start(t, Math.random()); s.stop(t + dur * 4 + 0.05); }
  function rim(bus, t, v = 0.07) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = 1700; env(g, t, 0.001, v, 0.025); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.1); noise(bus, t, 0.03, v * 0.6, 'bandpass', 2600, 2); }
  function flute(bus, t, m, len, v = 0.045) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(), vib = ctx.createOscillator(), vg = ctx.createGain(); o.type = 'sine'; o.frequency.value = mtof(m); vib.frequency.value = 4.6; vg.gain.value = mtof(m) * 0.006; vib.connect(vg); vg.connect(o.frequency);
    f.type = 'lowpass'; f.frequency.value = 3000; o.connect(f); f.connect(g); env(g, t, 0.09, v, 0.5, 0.75, 0.35, len); const br = ctx.createBufferSource(), bf = ctx.createBiquadFilter(), bg = ctx.createGain(); br.buffer = noiseBuf; bf.type = 'bandpass'; bf.frequency.value = mtof(m) * 2; bf.Q.value = 8; br.connect(bf); bf.connect(bg); env(bg, t, 0.06, v * 0.35, 0.4, 0.5, 0.3, len); const W = bus.wob || wob; bg.connect(W);
    g.connect(W); const s = ctx.createGain(); s.gain.value = 0.7; g.connect(s); s.connect(echo); vib.start(t); o.start(t); br.start(t, Math.random()); o.stop(t + len + 1); vib.stop(t + len + 1); br.stop(t + len + 1); }
  function chime(bus, t, m, v = 0.03) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o2.type = 'sine'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m) * 2.76; const g2 = ctx.createGain(); g2.gain.value = 0.3; o2.connect(g2); g2.connect(g); o.connect(g); env(g, t, 0.004, v, 1.4);
    const p = pan(g, Math.random() * 1.6 - 0.8); p.connect(bus); const s = ctx.createGain(); s.gain.value = 0.8; p.connect(s); s.connect(echo); o.start(t); o2.start(t); o.stop(t + 4); o2.stop(t + 4); }
  function pluck(bus, t, m, v = 0.05) { const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'square'; o.frequency.value = mtof(m); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(400, t + 0.18); f.Q.value = 4; o.connect(f); f.connect(g); env(g, t, 0.003, v, 0.12); const p = pan(g, (Math.random() - 0.5) * 0.8); p.connect(bus); const s = ctx.createGain(); s.gain.value = 0.35; p.connect(s); s.connect(echo); o.start(t); o.stop(t + 0.5); }
  function drone(bus, t, m, len, v = 0.05) { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(); o.type = 'sawtooth'; o2.type = 'sawtooth'; o.frequency.value = mtof(m); o2.frequency.value = mtof(m + 0.15); f.type = 'lowpass'; f.frequency.setValueAtTime(180, t); f.frequency.linearRampToValueAtTime(520, t + len * 0.5); f.frequency.linearRampToValueAtTime(180, t + len); o.connect(f); o2.connect(f); f.connect(g); env(g, t, len * 0.3, v, 0.6, 0.8, len * 0.2, len * 0.8); g.connect(bus); o.start(t); o2.start(t); o.stop(t + len + 0.5); o2.stop(t + len + 0.5); }
  function riser(bus, t, len, v = 0.06) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5000, t + len); s.connect(f); f.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + len); g.gain.linearRampToValueAtTime(0.0001, t + len + 0.05); g.connect(bus); s.start(t); s.stop(t + len + 0.1); }
  // ---- s432 voices for the world songs ----
  function tonev(bus, t, m, len, v, P) { const g = ctx.createGain(), out = P.lp ? ctx.createBiquadFilter() : g; if (P.lp) { out.type = 'lowpass'; out.frequency.setValueAtTime(P.lp, t); if (P.lpEnd) out.frequency.exponentialRampToValueAtTime(P.lpEnd, t + Math.max(0.1, len)); out.connect(g); }
    const oscs = []; for (const [r, gv, ty] of P.parts) { const o = ctx.createOscillator(), og = ctx.createGain(); o.type = ty || 'sine'; o.frequency.value = mtof(m) * r; if (P.det) o.detune.value = (Math.random() - 0.5) * P.det; og.gain.value = gv; o.connect(og); og.connect(out); oscs.push(o); }
    if (P.vib) { const lf = ctx.createOscillator(), lg = ctx.createGain(); lf.frequency.value = P.vib; lg.gain.value = mtof(m) * 0.005; lf.connect(lg); for (const o of oscs) lg.connect(o.frequency); lf.start(t); lf.stop(t + len + 2); }
    if (P.trem) { const lf = ctx.createOscillator(), lg = ctx.createGain(); lf.frequency.value = P.trem; lg.gain.value = 0.35; lf.connect(lg); lg.connect(g.gain); lf.start(t); lf.stop(t + len + 2); }
    env(g, t, P.a || 0.004, v, P.dec || 0.4, P.sus || 0, P.rel || 0.3, P.sus ? len : 0); const p = pan(g, P.pan ?? (Math.random() - 0.5) * 0.6); p.connect(bus.wob || bus); if (P.echo) { const e2 = ctx.createGain(); e2.gain.value = P.echo; p.connect(e2); e2.connect(echo); }
    for (const o of oscs) { o.start(t); o.stop(t + len + (P.dec || 0.4) * 5 + 0.3); } }
  const LEADS = { bell: { parts: [[1, 1], [2.76, 0.22], [5.4, 0.08]], dec: 1.1, echo: 0.8, v: 0.04 }, kalimba: { parts: [[1, 1], [5.4, 0.18]], dec: 0.45, echo: 0.5, v: 0.05 },
    marimba: { parts: [[1, 1], [4, 0.28]], dec: 0.3, echo: 0.35, v: 0.06 }, vibe: { parts: [[1, 1], [3, 0.12]], dec: 0.9, sus: 0.25, trem: 5.5, echo: 0.6, v: 0.045 },
    steel: { parts: [[1, 1], [2, 0.42], [3, 0.18]], dec: 0.4, echo: 0.45, v: 0.05 }, harp: { parts: [[1, 1, 'triangle'], [2, 0.2]], dec: 0.85, lp: 3600, echo: 0.6, v: 0.05 },
    oud: { parts: [[1, 1, 'sawtooth'], [2, 0.25, 'triangle']], dec: 0.22, lp: 2400, lpEnd: 700, echo: 0.4, v: 0.035 },
    horn: { parts: [[1, 1, 'sawtooth'], [1, 0.8, 'sawtooth'], [0.5, 0.35, 'triangle']], det: 14, a: 0.12, dec: 0.6, sus: 0.8, rel: 0.5, lp: 1500, lpEnd: 900, vib: 4.8, echo: 0.55, v: 0.03, pan: 0 } };
  function lead(bus, T, t, m, len) { if (T.lead === 'flute') return flute(bus, t, m, len); if (T.lead === 'whistle') return flute(bus, t, m + 12, len, 0.032); const P = LEADS[T.lead]; tonev(bus, t, m, len, P.v, P); }
  function choir(bus, t, m, len, v) { tonev(bus, t, m, len, v * 0.8, { parts: [[1, 1, 'sawtooth'], [1, 1, 'sawtooth'], [2, 0.3, 'triangle']], det: 22, a: len * 0.25, dec: 1, sus: 0.85, rel: len * 0.3, lp: 800, vib: 0.3, echo: 0.45, pan: (Math.random() - 0.5) * 1.2 }); }
  function tom(bus, t, f0, v) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.45, t + 0.35); env(g, t, 0.003, v, 0.3); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 1.2); noise(bus, t, 0.08, v * 0.4, 'lowpass', 900, 0.7); }
  function swell(bus, t, len, v, type, f, q) { const s2 = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s2.buffer = noiseBuf; s2.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q; s2.connect(fl); fl.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + len * 0.5); g.gain.linearRampToValueAtTime(0.0001, t + len); g.connect(bus); s2.start(t, Math.random()); s2.stop(t + len + 0.1); }
  function playTheme(key, st, t) { const T = THEMES[key], bus = TB[key], bar = Math.floor(st / 16) % BARS, s = st % 16, ch = T.ch[Math.floor(bar / 2) % 4], T0 = t + (s % 2 ? STEP * T.sw : 0);
    // chords
    if (T.keys === 'rhodes') { if (s === 0 && bar % 2 === 0) ch.v.forEach((m, i) => rhodes(bus, T0 + i * 0.025, m, SPB * 7.5, 0.045, (i - 2) * 0.2)); if (s === 8 && bar % 2 === 1) ch.v.slice(1, 4).forEach((m, i) => rhodes(bus, T0 + i * 0.03, m, SPB * 1.6, 0.03, (i - 1) * 0.3)); }
    if (T.keys === 'pad' && s === 0 && bar % 2 === 0) ch.v.forEach((m, i) => rhodes(bus, T0 + i * 0.06, m, SPB * 7.8, 0.034, (i - 2) * 0.3));
    if (T.keys === 'stab') { if (s % 4 === 2) ch.v.slice(1, 4).forEach((m, i) => rhodes(bus, T0 + i * 0.012, m, STEP * 1.4, 0.032, (i - 1) * 0.4)); if (s === 0 && bar % 2 === 0) rhodes(bus, T0, ch.v[0], SPB * 7, 0.03, 0); }
    if (T.keys === 'arp' && s % 2 === 0) { const idx = [0, 1, 2, 3, 4, 3, 2, 1][(s / 2) % 8]; tonev(bus, T0, ch.v[idx] + 12, STEP * 2, 0.022, LEADS.harp); if (s === 0 && bar % 2 === 0) rhodes(bus, T0, ch.v[0], SPB * 7, 0.03, 0); }
    if (T.keys === 'choir') { if (s === 0 && bar % 2 === 0) ch.v.forEach(m => choir(bus, T0, m, SPB * 8, 0.016)); if (s === 0 && bar % 2 === 0) ch.v.slice(2).forEach((m, i) => rhodes(bus, T0 + i * 0.03, m + 12, SPB * 6, 0.02, (i - 1) * 0.4)); }
    // bass
    if (s === 0) sub(bus, T0, ch.root, SPB * (T.drums === 'half' ? 3.8 : 2.6), 0.14); if (T.drums !== 'half' && s === 10 && bar % 2 === 1) sub(bus, T0, ch.root + 7, SPB * 1.2, 0.1); if (T.drums === 'reggae' && s === 8) sub(bus, T0, ch.root, SPB * 1.4, 0.13);
    // drums
    const D = T.drums;
    if (D === 'boom') { if (s === 0 || s === 10) kick(bus, T0, 0.42); if (s === 7 && bar % 4 === 3) kick(bus, T0, 0.25); if (s === 4 || s === 12) rim(bus, T0, 0.06); if (s % 2 === 0) noise(bus, T0, s % 4 === 2 ? 0.05 : 0.025, s % 4 === 2 ? 0.035 : 0.02, 'highpass', 7500, 0.7, 0.3); }
    if (D === 'half') { if (s === 0) kick(bus, T0, 0.38); if (s === 8) noise(bus, T0, 0.22, 0.05, 'bandpass', 1500, 0.5); if (s % 4 === 0) noise(bus, T0, 0.03, 0.018, 'highpass', 8000, 0.7, -0.3); }
    if (D === 'shuffle') { if (s === 0 || s === 7 || s === 10) kick(bus, T0, s === 7 ? 0.25 : 0.4); if (s === 4 || s === 12) rim(bus, T0, 0.06); if (s % 2 === 0) noise(bus, T0, 0.03, s % 4 === 0 ? 0.03 : 0.018, 'highpass', 7800, 0.7, 0.35); }
    if (D === 'bounce') { if (s === 0 || s === 3 || s === 8 || s === 11) kick(bus, T0, s % 8 === 0 ? 0.42 : 0.28); if (s === 4 || s === 12) rim(bus, T0, 0.065); noise(bus, T0, 0.02, s % 2 ? 0.012 : 0.022, 'highpass', 8500, 0.7, s % 2 ? -0.4 : 0.4); }
    if (D === 'reggae') { if (s === 8) kick(bus, T0, 0.45); if (s === 4 || s === 12) rim(bus, T0, 0.07); if (s % 4 === 2) noise(bus, T0, 0.04, 0.03, 'highpass', 7000, 0.7, 0.3); if (s === 14 && bar % 2) rim(bus, T0, 0.04); }
    if (D === 'tabla') { if (s === 0 || s === 6 || s === 10) tom(bus, T0, 140, 0.22); if (s === 3 || s === 12 || s === 14) tom(bus, T0, 420, 0.07); noise(bus, T0, 0.025, s % 4 === 0 ? 0.03 : 0.016, 'highpass', 6500, 1, 0.3); if (s === 4 || s === 12) rim(bus, T0, 0.04); }
    if (D === 'epic') { if (s === 0 || s === 10) kick(bus, T0, 0.46); if (s === 4 || s === 12) { rim(bus, T0, 0.05); noise(bus, T0, 0.14, 0.07, 'bandpass', 1700, 0.7); } if (s % 2 === 0) noise(bus, T0, 0.025, 0.02, 'highpass', 8000, 0.7, 0.3);
      if (s === 0 && bar % 2 === 0) { tom(bus, T0, 70, 0.32); tom(bus, T0 + STEP * 0.5, 62, 0.18); } if (bar === 7 && s >= 8 && s % 2 === 0) tom(bus, T0, 90 + s * 4, 0.16); if (s === 0 && bar === 6) swell(bus, T0, SPB * 8, 0.05, 'bandpass', 2400, 0.4); }
    // lead
    for (const [ms, m, ln] of T.mel[bar]) if (ms === s) lead(bus, T, T0, m, ln * STEP);
    // texture
    const X = T.tex;
    if (X === 'chime' && s === 6 && (bar === 1 || bar === 5)) [ch.v[2] + 24, ch.v[3] + 24, ch.v[4] + 24].forEach((m, i) => chime(bus, T0 + i * STEP * 1.5, m));
    if (X === 'lantern' && s === 0 && bar % 4 === 0) [ch.v[1] + 24, ch.v[3] + 24].forEach((m, i) => chime(bus, T0 + i * SPB, m, 0.035));
    if (X === 'wind' && s === 0 && bar % 4 === 0) swell(bus, T0, SPB * 14, 0.05, 'bandpass', 700, 0.6);
    if (X === 'waves' && s === 0 && bar % 2 === 0) swell(bus, T0, SPB * 7, 0.06, 'lowpass', 900, 0.3);
    if (X === 'sand' && s === 0 && bar % 4 === 2) swell(bus, T0, SPB * 10, 0.03, 'highpass', 4500, 0.5);
    if (X === 'echoes' && s === 12 && bar % 4 === 1) tonev(bus, T0, ch.v[4] + 12, SPB * 2, 0.03, { parts: [[1, 1, 'triangle']], dec: 1.6, echo: 1.2 });
    if (X === 'embers' && s === 0 && bar % 4 === 0) swell(bus, T0, SPB * 12, 0.025, 'bandpass', 1200, 0.5); /* s435 a warm glow swell instead of crackles */
    if (X === 'sparkle' && s % 4 === 3 && Math.random() < 0.3) chime(bus, T0, ch.v[(Math.random() * 5) | 0] + 36, 0.018); }
  // ---- the bar grid: both songs scheduled together, step = 16th, swung ----
  function schedule(st, t) {
    let dom = 'deep'; for (const key in TK) if (TK[key] > (TK[dom] || 0)) dom = key; const bar = Math.floor(st / 16) % BARS, s = st % 16, ch = THEMES[dom].ch[Math.floor(bar / 2) % 4], sw = s % 2 ? STEP * 0.18 : 0, T = t + sw, bk = battleK(), ck = cruiseK(); /* s435: from the JS mix, not AudioParam.value (it reads the old value mid-fade) */
    // ---- CRUISE: the world songs (only the ones fading in or out are played) ----
    if (ck > 0.02) for (const key in TK) if (TK[key] > 0.02 && key !== 'deep') playTheme(key, st, t);   /* s457: open space plays BLACK NEBULA (below) */
    // ---- BATTLE V2: BLACK NEBULA (s456, Ben: "a version two danger music"): dark + mystical but urgent. Its own song: D phrygian
    // Dm · E♭ · B♭ · A (the ♭II gives the dread), half-time heavy kick, war toms rolling in triplets, a growling sub, dark choir stabs,
    // a tolling bell, a fast bell arpeggio + a ghostly high choir at full danger. Builds with the danger like RED ALERT.
    const nebula = (B, Tb, lvl) => { const bc = BCH2[Math.floor(bar / 2) % 4];
      if (s % 4 === 0 || s === 3 || s === 11) sub(B, Tb, bc.root, STEP * (s % 4 === 0 ? 1.8 : 0.7), s % 4 === 0 ? 0.15 : 0.1, true);
      if (s === 0 && bar % 2 === 0) choir(B, Tb, bc.v[0], SPB * 8, 0.02 + lvl * 0.012);
      if (s % 3 === 0) noise(B, Tb, 0.03, 0.026, 'highpass', 7800, 0.8, (s % 6 ? -0.45 : 0.45));
      if (s === 0 && bar % 2 === 0) chime(B, Tb, bc.root + 36, 0.05);
      if (lvl > 0.35) { if (s === 0 || s === 10) kick(B, Tb, 0.62); if (s === 8) { noise(B, Tb, 0.22, 0.22, 'bandpass', 1200, 0.5); noise(B, Tb + 0.015, 0.16, 0.12, 'bandpass', 3000, 0.9); }
        if ([12, 13, 14, 15].includes(s) && bar % 2) tom(B, Tb, 150 - (s - 12) * 18, 0.24); if (s % 6 === 4) tom(B, Tb, 95, 0.14); }
      if (lvl > 0.65) { if (s % 2 === 0) chime(B, Tb, bc.v[[0, 1, 2, 3, 2, 1, 0, 3][(s / 2) % 8]] + 24, 0.022);
        if ((s === 0 || s === 6) && bar % 2 === 1) bc.v.slice(0, 3).forEach((m, i) => tonev(B, Tb + i * 0.01, m + 12, STEP * 2.5, 0.022, { parts: [[1, 1, 'sawtooth'], [2, 0.4, 'triangle']], det: 20, a: 0.005, dec: 0.25, lp: 1600, lpEnd: 500, pan: (i - 1) * 0.6 }));
        if (s === 0 && bar % 4 === 2) choir(B, Tb, bc.v[2] + 24, SPB * 6, 0.012); if (s === 0 && bar === 7) riser(B, Tb, SPB * 4, 0.08); }
      if (s === 0 && bar % 4 === 0) drone(B, Tb, bc.root - 12, SPB * 16, 0.05 + lvl * 0.03); };
    // s457 (Ben): BLACK NEBULA is now the EXPLORATION song: it plays out past the planets (open space), at a calmer level (no bell run / stabs)
    if (ck > 0.02 && TK.deep > 0.02) nebula(TB.deep, t, 0.45);
    // ---- BATTLE V2: UNDER ATTACK (s458, Ben: "LET'S GO = WE ARE UNDER ATTACK!"): frantic + alarming. F minor with chromatic dread
    // (Fm · G♭ · Fm · E), a two-tone KLAXON, a pounding 8th-note kick, snare on every beat, 16th hats, a distorted 16th bass ostinato that
    // climbs chromatically, stabbing staccato saws on the off-16ths, a screaming high lead + a rising alarm sweep at full danger. No swing.
    if (bk > 0.02 && BSET === 2) { const B = battleBus, Tb = t, lvl = k, ac = BCH4[Math.floor(bar / 2) % 4];
      sub(B, Tb, ac.root + [0, 0, 12, 0, 1, 0, 12, 3][s % 8], STEP * 0.75, s % 4 === 0 ? 0.15 : 0.11, true);
      noise(B, Tb, s % 2 ? 0.016 : 0.028, s % 2 ? 0.024 : 0.036, 'highpass', 9000, 0.7, s % 2 ? -0.45 : 0.45);
      // s459 (Ben: "an in-space RED ALERT, this is happening NOW"): the STARSHIP ALARM: a rising "whoop" siren every half bar (saw + square
      // gliding up through a resonant filter, with a ship-hull echo), a computer alert bleep pattern, and a pulsing reactor throb
      const whoop = (t0, v) => { const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain(); o.type = 'sawtooth'; o2.type = 'square';
        o.frequency.setValueAtTime(330, t0); o.frequency.exponentialRampToValueAtTime(880, t0 + STEP * 3.2); o2.frequency.setValueAtTime(332, t0); o2.frequency.exponentialRampToValueAtTime(884, t0 + STEP * 3.2);
        f.type = 'bandpass'; f.Q.value = 4; f.frequency.setValueAtTime(700, t0); f.frequency.exponentialRampToValueAtTime(1900, t0 + STEP * 3.2); o.connect(f); o2.connect(f); f.connect(g);
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.03); g.gain.setValueAtTime(v, t0 + STEP * 3.0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + STEP * 3.6);
        g.connect(B); const e = ctx.createGain(); e.gain.value = 0.35; g.connect(e); e.connect(echo); o.start(t0); o2.start(t0); o.stop(t0 + STEP * 3.8); o2.stop(t0 + STEP * 3.8); };
      if (s % 8 === 0) whoop(Tb, 0.05 + lvl * 0.03);
      if (s % 2 === 1 && (s % 8 === 5 || s % 8 === 7)) tonev(B, Tb, 96 + (s % 8 === 7 ? 3 : 0), STEP * 0.35, 0.014, { parts: [[1, 1, 'sine']], a: 0.001, dec: 0.05, pan: s % 16 > 8 ? 0.6 : -0.6 });   // computer alert bleeps
      if (s % 4 === 0) tonev(B, Tb, ac.root, STEP * 2, 0.05, { parts: [[1, 1, 'sawtooth'], [0.5, 0.6, 'sine']], det: 6, a: 0.005, dec: 0.15, lp: 420, lpEnd: 140 });   // reactor throb
      if (lvl > 0.3) { if (s % 2 === 0) kick(B, Tb, s % 4 === 0 ? 0.62 : 0.42); if (s % 4 === 2) { noise(B, Tb, 0.12, 0.2, 'bandpass', 2000, 0.6); noise(B, Tb + 0.008, 0.08, 0.12, 'bandpass', 3800, 0.9); rim(B, Tb, 0.07); }
        if (s % 4 === 1 || s % 4 === 3) ac.v.slice(0, 3).forEach((m, i) => tonev(B, Tb + i * 0.003, m + 12, STEP * 0.5, 0.016, { parts: [[1, 1, 'sawtooth'], [1, 0.8, 'sawtooth']], det: 22, a: 0.002, dec: 0.06, lp: 3000 + lvl * 2500, lpEnd: 900, pan: (i - 1) * 0.6 }));
        if (bar % 2 === 1 && s >= 12) tom(B, Tb, 260 - (s - 12) * 35, 0.22); }
      if (lvl > 0.6) { for (const [ms, m, ln] of AMEL[bar]) if (ms === s) tonev(B, Tb, m, ln * STEP, 0.026, { parts: [[1, 1, 'sawtooth'], [2, 0.35, 'square']], det: 12, a: 0.006, dec: 0.2, sus: 0.8, lp: 4200, vib: 8, echo: 0.25, pan: 0 });
        if (s === 0 && bar % 2 === 1) riser(B, Tb, SPB * 4, 0.09); if (s === 0 && bar === 0) swell(B, Tb, SPB * 2, 0.08, 'highpass', 4500, 0.5); }
      if (s === 0 && bar % 4 === 0) drone(B, Tb, ac.root - 12, SPB * 16, 0.05 + lvl * 0.04); }
    // ---- BATTLE V3: ADVENTURE (s457 "LET'S GO", renamed s458: Ben heard it as adventure music) ----
    // ---- (was) BATTLE V2: LET'S GO (s457, Ben: "a faster-paced LET'S GO battle song"): bright + heroic, E major I-V-vi-IV (E B C#m A), double-time
    // breakbeat (kick + snare every half bar, 16th hats with rolls), a rolling 16th saw bass with octave jumps, brass hits, a fast heroic
    // pluck arpeggio, a soaring lead at full danger + a riser into every 4 bars. Builds with the danger like the others. No swing.
    if (bk > 0.02 && BSET === 3) { const B = battleBus, Tb = t, lvl = k, gc = BCH3[Math.floor(bar / 2) % 4], h = s % 8;
      sub(B, Tb, gc.root + ([0, 0, 12, 0, 7, 0, 12, 7][h]), STEP * 0.8, h === 0 ? 0.14 : 0.1, true);
      noise(B, Tb, s % 2 ? 0.018 : 0.03, s % 2 ? 0.022 : 0.034, 'highpass', 8600, 0.7, s % 2 ? -0.4 : 0.4); if (s >= 14 && bar % 2) noise(B, Tb + STEP * 0.5, 0.015, 0.02, 'highpass', 9000, 0.7, 0);
      if (s % 2 === 0) tonev(B, Tb, gc.v[[0, 1, 2, 3, 2, 1, 3, 2][(s / 2) % 8]] + 12, STEP * 1.2, 0.02, { parts: [[1, 1, 'square'], [2, 0.3, 'triangle']], det: 6, a: 0.003, dec: 0.12, lp: 3200 + lvl * 2000, lpEnd: 900, pan: s % 4 ? 0.35 : -0.35, echo: 0.2 });
      if (lvl > 0.3) { if (h === 0 || (h === 5 && bar % 2)) kick(B, Tb, 0.6); if (h === 2 && s === 10) kick(B, Tb, 0.4);
        if (h === 4) { noise(B, Tb, 0.14, 0.22, 'bandpass', 1900, 0.6); noise(B, Tb + 0.01, 0.1, 0.12, 'bandpass', 3400, 0.9); rim(B, Tb, 0.06); }
        if (bar % 4 === 3 && s >= 12) tom(B, Tb, 230 - (s - 12) * 30, 0.2); }
      if (lvl > 0.6) { if ((s === 0 || s === 3 || s === 6) && bar % 2 === 0) gc.v.slice(0, 3).forEach((m, i) => tonev(B, Tb + i * 0.005, m + 12, STEP * (s === 6 ? 3 : 1.5), 0.024, LEADS.horn));
        for (const [ms, m, ln] of GMEL[bar]) if (ms === s) tonev(B, Tb, m, ln * STEP, 0.024, { parts: [[1, 1, 'sawtooth'], [2, 0.25, 'square']], det: 10, a: 0.015, dec: 0.3, sus: 0.75, lp: 3400, vib: 6, echo: 0.3, pan: 0 });
        if (s === 0 && bar % 4 === 3) riser(B, Tb, SPB * 4, 0.07); } }
    // ---- BATTLE: RED ALERT (s438, Ben: "more impactful, different, urgent") ----
    // its own song, NOT the world's chords: E minor i-♭VI-♭VII-V (Em C D B), driving 16th-note saw bass, four-on-the-floor kick, big clap,
    // 16th hats, tom fills, an alarm stab every 2 bars, a siren lead. It BUILDS with the danger: low = bass + hats + pulse, mid = full drums,
    // high = stabs + lead + risers. No swing (straight = urgent).
    if (bk > 0.02 && BSET === 1) { const B = battleBus, Tb = t, lvl = k, bch = BCH[Math.floor(bar / 2) % 4];
      // bass: 16th pulse, octave jumps on the off-16ths
      sub(B, Tb, bch.root + (s % 4 === 2 ? 12 : 0), STEP * 0.8, s % 4 === 0 ? 0.13 : 0.09, true);
      // pulse pad: a gated chord on every 8th (sidechain feel)
      if (s % 2 === 0) bch.v.slice(0, 3).forEach((m, i) => tonev(B, Tb + i * 0.004, m, STEP * 1.3, 0.012, { parts: [[1, 1, 'sawtooth'], [1, 0.8, 'sawtooth']], det: 18, a: 0.01, dec: 0.12, lp: 1800 + lvl * 1800, lpEnd: 700, pan: (i - 1) * 0.5 }));
      noise(B, Tb, s % 4 === 2 ? 0.05 : 0.018, s % 4 === 2 ? 0.05 : 0.03, 'highpass', 8500, 0.7, s % 2 ? -0.4 : 0.4);
      if (lvl > 0.35) { if (s % 4 === 0) kick(B, Tb, 0.58); if (s === 14 && bar % 2) kick(B, Tb, 0.35);
        if (s === 4 || s === 12) { noise(B, Tb, 0.16, 0.2, 'bandpass', 1500, 0.6); noise(B, Tb + 0.012, 0.12, 0.12, 'bandpass', 2600, 0.8); rim(B, Tb, 0.06); }
        if (bar % 2 === 1 && s >= 12) tom(B, Tb, 200 - (s - 12) * 25, 0.2);
        if (s === 0 && bar % 2 === 0) swell(B, Tb, SPB * 2, 0.06, 'highpass', 5000, 0.4); }
      if (lvl > 0.65) { if (s === 0 && bar % 2 === 0) [bch.v[0] + 12, bch.v[2] + 12].forEach(m => tonev(B, Tb, m, STEP * 3, 0.03, LEADS.horn));
        if (s === 6 && bar % 2 === 0) [bch.v[0] + 12, bch.v[2] + 12].forEach(m => tonev(B, Tb, m, STEP * 2, 0.026, LEADS.horn));
        for (const [ms, m, ln] of BMEL[bar]) if (ms === s) tonev(B, Tb, m, ln * STEP, 0.022, { parts: [[1, 1, 'sawtooth'], [2, 0.2, 'square']], det: 8, a: 0.02, dec: 0.4, sus: 0.7, lp: 2600, vib: 6.5, echo: 0.35, pan: 0 });
        if (s === 0 && bar === 7) riser(B, Tb, SPB * 4, 0.08); if (s === 0 && bar === 3) riser(B, Tb, SPB * 4, 0.05); }
      if (s === 0 && bar % 4 === 0) drone(B, Tb, bch.root - 12, SPB * 16, 0.04 + lvl * 0.03);
    }
  }
  function tick() { if (!on) return; const now = ctx.currentTime;
    k += (want - k) * (want > k ? 0.07 : 0.018); const ext = fedAt < 0 ? 1 : performance.now() - fedAt > 600 ? 0 : extV; const target = window.__8gMuted ? 0 : vol * 0.85 * (1 + k * 0.35) * ext;   /* s655 feed(): the host's level; it fades out if the host stops feeding (left the world) */   /* s438 danger pushes the music up */   // in ~3 s, out ~6 s
    for (const key in TK) { const w = key === cur ? 1 : 0; TK[key] += (w - TK[key]) * 0.012; if (TK[key] < 0.005 && !w) TK[key] = 0; if (TB[key]) TB[key].gain.setTargetAtTime(Math.sin(TK[key] * Math.PI / 2), now, 0.3); }   // ~5 s equal-power crossfade
    master.gain.setTargetAtTime(target, now, 0.4); cruiseBus.gain.setTargetAtTime(cruiseK(), now, 0.3); battleBus.gain.setTargetAtTime(battleK(), now, 0.3);
    if (next < now - 0.05) { const n = Math.ceil((now - next) / STEP); next += n * STEP; step += n; }   /* s655: after a stall, skip lost steps on the grid */
    while (next < now + AHEAD) { schedule(step, next); next += STEP; step++; } }
  const api = {
    start() { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); if (on) return; on = true; next = ctx.currentTime + 0.1; step = 0; timer = setInterval(tick, 50); },
    stop() { on = false; clearInterval(timer); if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3); },
    resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); },
    feed(v) { extV = Math.max(0, Math.min(1.5, v || 0)); fedAt = performance.now(); },
    danger(v) { want = Math.max(0, Math.min(1, v || 0)); },
    getBattle() { return BSET; }, setBattle(n) { BSET = n === 2 || n === 3 ? n : 1; try { localStorage.setItem(NS + '.music.battle.v1', String(BSET)); } catch (e) {} },
    getSet() { return SET_N; }, setSet(n) { applySet(n); try { localStorage.setItem('space.music.set.v1', String(SET_N)); } catch (e) {} if (ctx) { const T = ctx.currentTime, E = SETS[SET_N].echo; echo.delayTime.setTargetAtTime(SPB * E[0], T, 0.3); fb.gain.setTargetAtTime(E[1], T, 0.3); } },
    getMix() { return { ...MX, volume: vol }; }, setMix(o) { MX = { ...MX, ...o }; try { localStorage.setItem(NS + '.music.mix.v1', JSON.stringify(MX)); } catch (e) {} },
    jumpWorld(key) { if (!THEMES[key]) return; cur = key; for (const q in TK) TK[q] = q === key ? 1 : 0; TK[key] = 1; },
    world(key) { if (!THEMES[key]) key = 'deep'; if (key === cur) return false; cur = key; if (!(key in TK)) TK[key] = 0; return true; }, get world_() { return cur; },
    volume(v) { vol = Math.max(0, Math.min(1, v)); try { localStorage.setItem(NS + '.music.v1', String(vol)); } catch (e) {} },
    get mix() { return k; }, get on() { return on; },
  };
  one = api; return api;
}
