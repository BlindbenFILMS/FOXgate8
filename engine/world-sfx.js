// s711 MERU WORLD SOUNDS (Runway batch 1, audio/meru/*.mp3, prompts in MERU_SOUND_PROMPTS.md).
// One shared loader for vehicles, skate park + weather. Every file is levelled at load (one-shots by their loudest 50 ms, loops by RMS),
// one-shots lose leading silence, loops get a baked 0.25 s crossfade so the seam never clicks. Multi-take names pick a take at random.
// Context + mute: the walk sets window.__wsfxCtx = () => (muted ? null : audio()); without it a private context is used.
// WS.play(name, vol = 1, rate = 1) · WS.loop(name) → { set(vol, rate), stop() } (starts silent; set() eases) · WS.preload()
const BASE = new URL('../audio/meru/', import.meta.url).href;
const TAKES = { 'swim-stroke': 2, sheep: 2, 'boat-jump-land': 2, 'range-tank-fire': 2, 'skate-land': 2, thunder: 2, 'step-stone': 2, 'step-grass': 2, 'step-wood': 2 };
const LOOPS = ['boat-idle', 'boat-run', 'boat-wake', 'range-tank-drive', 'heli-rotor', 'car-drive', 'skate-roll', 'rain', 'wind', 'plaza-crowd', 'market-crowd', 'arena-crowd', 'casino-floor', 'bowling-roll', 'lake-lap', 'train-run', 'ferry-engine', 'fountain', 'falls', 'aviary', 'grill-sizzle'];   // s712 batch 2 · s713 batch 3
const ONES = ['boat-jump-land-1', 'boat-jump-land-2', 'buoy-bump', 'range-tank-fire-1', 'range-tank-fire-2', 'range-target-hit', 'heli-startup', 'car-horn', 'tow-winch', 'skate-land-1', 'skate-land-2', 'thunder-1', 'thunder-2', 'shop-bell', 'door-wood', 'door-glass', 'step-stone-1', 'step-stone-2', 'step-grass-1', 'step-grass-2', 'step-wood-1', 'step-wood-2', 'arena-cheer', 'slot-win', 'bowling-strike', 'espresso-steam', 'gulls', 'train-brake', 'train-chime', 'ferry-horn', 'swim-stroke-1', 'swim-stroke-2', 'splash-in', 'castle-gate', 'castle-bell', 'sheep-1', 'sheep-2', 'cow', 'rooster', 'cash-register'];
const BUF = {}, LOADING = {};
let own = null, dec = null;
const ctx = () => { try { if (window.__wsfxCtx) return window.__wsfxCtx(); own = own || new (window.AudioContext || window.webkitAudioContext)(); if (own.state === 'suspended') own.resume(); return own; } catch (e) { return null; } };
const decoder = () => dec || (dec = (() => { try { return new OfflineAudioContext(1, 44100, 44100); } catch (e) { return ctx(); } })());
function level(b, loop) { const d = b.getChannelData(0), n = d.length, sr = b.sampleRate;
  if (loop) { let s = 0; for (let i = 0; i < n; i++) s += d[i] * d[i]; const rms = Math.sqrt(s / Math.max(1, n)) || 1e-4, k = Math.min(8, 0.16 / rms); for (let c = 0; c < b.numberOfChannels; c++) { const x = b.getChannelData(c); for (let i = 0; i < n; i++) x[i] *= k; } return b; }
  const w = Math.round(sr * 0.05); let best = 1e-4; for (let i = 0; i + w <= n; i += w >> 1) { let s = 0; for (let j = i; j < i + w; j++) s += d[j] * d[j]; best = Math.max(best, Math.sqrt(s / w)); }
  const k = Math.min(8, 0.3 / best); let st = 0; const th = 0.02 / k; while (st < n - 1 && Math.abs(d[st]) < th) st++; st = Math.max(0, st - Math.round(sr * 0.004));
  const out = new AudioBuffer({ length: n - st, numberOfChannels: 1, sampleRate: sr }), o = out.getChannelData(0); for (let i = st; i < n; i++) o[i - st] = d[i] * k; return out; }
function seam(b) { const d = b.getChannelData(0), n = d.length, F = Math.min(Math.round(b.sampleRate * 0.25), n >> 2); if (F < 32) return b;
  const out = new AudioBuffer({ length: n - F, numberOfChannels: 1, sampleRate: b.sampleRate }), o = out.getChannelData(0);
  for (let i = 0; i < n - F; i++) o[i] = i < F ? d[i] * Math.sqrt(i / F) + d[n - F + i] * Math.sqrt(1 - i / F) : d[i]; return out; }
function load(name) { if (BUF[name] || LOADING[name]) return LOADING[name]; const loop = LOOPS.includes(name);
  return LOADING[name] = fetch(BASE + name + '.mp3').then(r => r.ok ? r.arrayBuffer() : Promise.reject(r.status)).then(a => new Promise((ok, no) => decoder().decodeAudioData(a, ok, no)))
    .then(b => { b = level(b, loop); if (loop) b = seam(b); BUF[name] = b; return b; }).catch(e => { console.warn('world-sfx', name, e); }); }
const pickName = n => TAKES[n] ? n + '-' + (1 + Math.floor(Math.random() * TAKES[n])) : n;
export const WS = {
  preload() { for (const n of [...LOOPS, ...ONES]) load(n); return Promise.all([...LOOPS, ...ONES].map(n => LOADING[n])); },
  ready: n => !!BUF[pickName(n)],
  play(name, vol = 1, rate = 1) { const n = pickName(name), c = ctx(); if (!BUF[n]) { load(n); return null; } if (!c) return null;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = BUF[n]; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g); g.connect(c.destination); s.start(); return s; },
  // a loop that stops getting set() for 0.7 s (its job ended, the panel closed) fades out by itself; the next set() starts it again
  loop(name) { let s = null, g = null, c = null, rate = 1, dead = false;
    const start = () => { if (s || dead || !BUF[name] || !(c = ctx())) return; s = c.createBufferSource(); g = c.createGain(); s.buffer = BUF[name]; s.loop = true; s.playbackRate.value = rate; g.gain.value = 0; s.connect(g); g.connect(c.destination); s.start(0, Math.random() * BUF[name].duration); };
    const fade = () => { LIVE.delete(H); if (!s) return; const a = s, t = c.currentTime; g.gain.setTargetAtTime(0, t, 0.1); setTimeout(() => { try { a.stop(); } catch (e) {} }, 600); s = g = null; };
    load(name);
    const H = { _t: 0, _sleep: fade,
      set(v, r = 1) { if (dead) return; rate = r; H._t = performance.now(); LIVE.add(H); if (!s && v > 0.001) start(); if (!s) return; const t = c.currentTime; g.gain.setTargetAtTime(ctx() ? v : 0, t, 0.08); s.playbackRate.setTargetAtTime(r, t, 0.1); },
      stop() { dead = true; fade(); }, get on() { return !!s; } };
    return H; } };
const LIVE = new Set(); setInterval(() => { const now = performance.now(); for (const h of [...LIVE]) if (now - h._t > 700) h._sleep(); }, 300);
if (typeof window !== 'undefined') window.__WS = WS;
