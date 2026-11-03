// s367 ORE SHAFT AMBIENCE + SFX. Synth only (Web Audio, phone-light). Muted by default by engine/mute-all.js (?sound=1 = sound on).
//   const A = oreAmbient(); A.level(i) · A.start() · A.stop() · A.duck(on) · A.sfx(name)
// Beds: L1 ROBOT WORKS = machine hum + far clanks · L2 ASTEROID HALL = water rush + drips · L3 THE DEEP = icy wind + metal creaks.
// SFX: stun · free · part · lift · pulse · slam · zap · fix
let one = null;
export function oreAmbient() {
  if (one) return one;
  let ctx = null, out = null, bed = null, noise = null, lv = 0, on = false, timer = 0, duckK = 1;
  const init = () => { if (ctx) return true; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false; ctx = new AC();
    out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noise.getChannelData(0); let b = 0; for (let i = 0; i < d.length; i++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = b * 3.5; }
    return true; };
  const N = (g, type, f, q = 0.7) => { const s = ctx.createBufferSource(); s.buffer = noise; s.loop = true; const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; s.connect(fl); fl.connect(g); s.start(); return [s, fl]; };
  const O = (g, type, f) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.connect(g); o.start(); return o; };
  function buildBed() { if (bed) { for (const n of bed.nodes) try { n.stop ? n.stop() : 0; n.disconnect(); } catch (e) {} bed = null; } const g = ctx.createGain(); g.gain.value = 1; g.connect(out); const nodes = [g];
    const hum = ctx.createGain(); hum.gain.value = lv === 0 ? 0.05 : 0.025; hum.connect(g); nodes.push(hum, O(hum, 'sine', lv === 2 ? 41 : 55), O(hum, 'sine', lv === 2 ? 82.4 : 110));
    const rush = ctx.createGain(); rush.gain.value = [0.06, 0.12, 0.05][lv]; rush.connect(g); nodes.push(rush, ...N(rush, lv === 2 ? 'bandpass' : 'lowpass', [260, 520, 900][lv]));
    if (lv === 2) { const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.13; lg.gain.value = 0.04; lfo.connect(lg); lg.connect(rush.gain); lfo.start(); nodes.push(lfo, lg); }
    bed = { g, nodes }; }
  function blip(f, dur, v, type = 'sine', glide = 0, at = 0, filt) { if (!ctx || !on) return; const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * glide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (filt) { const fl = ctx.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = filt; fl.Q.value = 4; o.connect(fl); fl.connect(g); } else o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05); }
  function hiss(dur, v, f, at = 0) { if (!ctx || !on) return; const t = ctx.currentTime + at, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = 1.2; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + dur + 0.05); }
  function tick() { if (!on || !ctx) return; const r = Math.random();
    if (lv === 0 && r < 0.18) { const f = 180 + Math.random() * 160; blip(f, 0.12, 0.05, 'square', 0.6, 0, f * 3); if (Math.random() < 0.5) blip(f * 0.8, 0.1, 0.04, 'square', 0.6, 0.22, f * 2.5); }
    if (lv === 1 && r < 0.45) { const f = 900 + Math.random() * 900; blip(f, 0.18, 0.05, 'sine', 1.8); if (Math.random() < 0.4) blip(f * 1.3, 0.12, 0.025, 'sine', 1.6, 0.3); }
    if (lv === 2 && r < 0.12) blip(70 + Math.random() * 40, 1.4, 0.035, 'sawtooth', 1.4, 0, 300); }
  const SFX = {
    stun: () => { blip(520, 0.5, 0.12, 'sawtooth', 0.15, 0, 900); hiss(0.4, 0.08, 2400); },
    free: () => { [0, 4, 7, 12].forEach((s, i) => blip(523 * Math.pow(2, s / 12), 0.5, 0.08, 'triangle', 1, i * 0.09)); },
    part: () => { [0, 7, 12, 16, 19].forEach((s, i) => blip(392 * Math.pow(2, s / 12), 0.4, 0.07, 'triangle', 1, i * 0.07)); },
    lift: () => { blip(60, 2.2, 0.14, 'sawtooth', 0.7, 0, 220); hiss(2.0, 0.05, 500); blip(880, 0.25, 0.05, 'sine', 1, 1.9); },
    fix: () => { for (let i = 0; i < 6; i++) hiss(0.08, 0.08, 3000 + Math.random() * 2000, i * 0.11); },
    pulse: () => { blip(160, 0.9, 0.12, 'sawtooth', 2.5, 0, 500); },
    slam: () => { blip(70, 0.6, 0.2, 'square', 0.4, 0, 180); hiss(0.5, 0.12, 300); },
    zap: () => { blip(1800, 0.12, 0.04, 'square', 0.4, 0, 2600); } };
  const wake = () => { if (ctx && on && ctx.state === 'suspended' && !window.__8gMuted) ctx.resume().catch(() => {}); };
  addEventListener('pointerdown', wake, true); addEventListener('keydown', wake, true);
  one = {
    level(i) { if (i === lv && bed) return; lv = i; if (ctx && on) buildBed(); },
    start() { if (on) return; if (!init()) return; on = true; buildBed(); wake(); out.gain.cancelScheduledValues(ctx.currentTime); out.gain.setTargetAtTime(0.8 * duckK, ctx.currentTime, 0.8); clearInterval(timer); timer = setInterval(tick, 700); },
    stop(fade = 0.6) { if (!on) return; on = false; clearInterval(timer); if (ctx) out.gain.setTargetAtTime(0.0001, ctx.currentTime, fade / 3); },
    duck(d) { const k = d ? 0.45 : 1; if (k === duckK) return; duckK = k; if (ctx && on) out.gain.setTargetAtTime(0.8 * k, ctx.currentTime, 0.6); },
    sfx(name) { if (SFX[name]) try { SFX[name](); } catch (e) {} },
    get on() { return on; } };
  return one;
}
