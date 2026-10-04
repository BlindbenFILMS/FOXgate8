// Blind Canvas gallery: ambient sound, all made in the browser (no files to download).
//  • Outside (the plaza and the bridge): water lapping against the lake's stone edge, and birds now and then.
//  • Inside: a soft gallery hum (air, distant voices of the building).
//  • Footsteps on the wood floors while you walk (a soft roll for wheelchair users).
// For blind visitors this says where you are. It ducks under the room films, and can be turned off in the menu.
export function setupSound({ getState, inside, filmPlaying, chair }) {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC(), master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  const noiseBuf = (secs, kind) => {
    const n = ctx.sampleRate * secs, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0); let last = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; } else d[i] = w; }
    return b;
  };
  const loop = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  // water: brown noise through a low filter, swelling slowly like small waves
  const water = ctx.createGain(); water.gain.value = 0; water.connect(master);
  { const src = loop(noiseBuf(6, 'brown')), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
    const sw = ctx.createGain(); sw.gain.value = 0.6; const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.23; lg.gain.value = 0.4; lfo.connect(lg).connect(sw.gain); lfo.start();
    src.connect(lp).connect(sw).connect(water); }
  // inside: a low, quiet hum of air
  const hum = ctx.createGain(); hum.gain.value = 0; hum.connect(master);
  { const src = loop(noiseBuf(5, 'brown')), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; src.connect(lp).connect(hum); }
  // birds: a few short chirps, panned, now and then while you're outside
  function chirp() {
    const t0 = ctx.currentTime, n = 2 + (Math.random() * 4 | 0), base = 2600 + Math.random() * 2200, pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const g = ctx.createGain(); g.gain.value = 0; if (pan) { pan.pan.value = Math.random() * 1.6 - 0.8; g.connect(pan).connect(master); } else g.connect(master);
    for (let i = 0; i < n; i++) {
      const o = ctx.createOscillator(), og = ctx.createGain(), st = t0 + i * (0.09 + Math.random() * 0.06), len = 0.05 + Math.random() * 0.05;
      o.type = 'sine'; o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.2), st); o.frequency.exponentialRampToValueAtTime(base * (1.15 + Math.random() * 0.35), st + len);
      og.gain.setValueAtTime(0, st); og.gain.linearRampToValueAtTime(0.05, st + 0.01); og.gain.exponentialRampToValueAtTime(0.0008, st + len);
      o.connect(og).connect(g); o.start(st); o.stop(st + len + 0.02);
    }
    g.gain.setValueAtTime(1, t0);
  }
  // footsteps: a short knock on wood (or a soft roll in a wheelchair)
  const stepBuf = noiseBuf(0.25, 'white');
  function step(loud) {
    const s = ctx.createBufferSource(); s.buffer = stepBuf; s.playbackRate.value = 0.85 + Math.random() * 0.3;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520 + Math.random() * 180; bp.Q.value = 1.3;
    const g = ctx.createGain(), t = ctx.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11 * loud, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.13);
    s.connect(bp).connect(g).connect(master); s.start(t); s.stop(t + 0.2);
  }
  const roll = ctx.createGain(); roll.gain.value = 0; roll.connect(master);
  { const src = loop(noiseBuf(3, 'brown')), bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; src.connect(bp).connect(roll); }

  // phones only let sound start from a tap: try again on the next touch or key
  for (const ev of ['pointerdown', 'keydown', 'touchend']) addEventListener(ev, () => { if (on && ctx.state !== 'running') ctx.resume().catch(() => {}); }, { passive: true });
  let on = true, stepT = 0, birdT = 2, last = performance.now();
  const ramp = (p, v) => p.setTargetAtTime(v, ctx.currentTime, 0.4);
  setInterval(() => {
    const now = performance.now(), dt = Math.min(0.2, (now - last) / 1000); last = now;
    if (!on || ctx.state !== 'running') return;
    // an artwork (or any info panel) is open: everything else goes quiet so the art and the artist's voice have the room
    master.gain.setTargetAtTime(window.HUSH ? 0 : 0.9, ctx.currentTime, 0.12); if (window.HUSH) return;
    const [x, y, z, , speed, air] = getState(), inn = inside(x, y, z), duck = filmPlaying() ? 0.35 : 1;
    // the lake: louder the nearer you are to its edge (outside the building only)
    const nearLake = inn ? 0 : Math.max(0, 1 - Math.max(0, x > -12.4 ? x + 12.4 : 0) / 26);   // the lake lies between the plaza and the museum; it fades as you walk into the garden
    ramp(water.gain, 0.22 * nearLake * duck);
    ramp(hum.gain, (inn ? 0.06 : 0.015) * duck);
    if (!inn && (birdT -= dt) <= 0) { birdT = 3 + Math.random() * 7; chirp(); }
    // steps
    if (chair()) { ramp(roll.gain, speed > 0.4 && !air ? 0.05 : 0); }
    else if (speed > 0.4 && !air) { stepT -= dt * Math.min(2.2, speed / 3.0); if (stepT <= 0) { stepT = 0.5; step(Math.min(1, 0.5 + speed / 8)); } }
    else stepT = 0.05;
  }, 50);
  return {
    resume() { if (ctx.state !== 'running') ctx.resume().catch(() => {}); },
    set(v) { on = v; master.gain.setTargetAtTime(v ? 0.9 : 0, ctx.currentTime, 0.2); if (v) this.resume(); },
    on: () => on,
  };
}
