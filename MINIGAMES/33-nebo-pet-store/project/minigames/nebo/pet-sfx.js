// 8 GATES — MARLOW'S PET STORE sound effects. Layered WebAudio synthesis (no files), sharing the music's AudioContext.
// createSfx(music) → one-shots: brush, foam, pop, snip, clip, crunch, whoosh, splash, chime, squeak, step, coins, bell, door, knot, wrong, ok, click
//                    voices: voice(type, kind) — dog / cat / pig × happy, giggle, yelp, angry, love, yawn, sneeze, sniff
//                    loops: loop('spray' | 'dryer', on) — water hiss and dryer whirr while you hold
export function createSfx(MUS) {
  const C = () => MUS.ctx, out = () => MUS.sfxOut; let last = {};
  const ok = (k, gap = 0) => { const c = C(); if (!c || !out() || c.state !== 'running') return false; const now = c.currentTime; if (gap && now - (last[k] || 0) < gap) return false; last[k] = now; return true; };
  const g0 = (t, a, peak, dec, dest) => { const c = C(), g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); g.connect(dest || out()); return g; };
  const osc = (type, f, t, dur, dest) => { const o = C().createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.connect(dest); o.start(t); o.stop(t + dur + 0.05); return o; };
  const nz = (t, dur, dest, rate = 1) => { const s = C().createBufferSource(); s.buffer = MUS.noise; s.loop = true; s.playbackRate.value = rate; s.connect(dest); s.start(t, Math.random() * 0.15); s.stop(t + dur + 0.05); return s; };
  const filt = (type, f, q = 1, dest) => { const b = C().createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; b.connect(dest); return b; };
  const T = () => C().currentTime + 0.005;
  const S = {
    // bristles through fur: a short band-passed noise sweep
    brush(v = 0.25) { if (!ok('brush', 0.07)) return; const t = T(), d = 0.09 + Math.random() * 0.05, g = g0(t, 0.01, v, d), f = filt('bandpass', 2600, 1.2, g); f.frequency.setValueAtTime(3200 + Math.random() * 800, t); f.frequency.exponentialRampToValueAtTime(1400, t + d); nz(t, d + 0.02, f); },
    // lather: wet squelch + 2-3 tiny bubble blips
    foam(v = 0.2) { if (!ok('foam', 0.09)) return; const t = T(), g = g0(t, 0.01, v * 0.7, 0.12), f = filt('lowpass', 1400, 4, g); f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.1); nz(t, 0.14, f);
      for (let i = 0; i < 2 + (Math.random() * 2 | 0); i++) { const tt = t + i * 0.03 + Math.random() * 0.02, gg = g0(tt, 0.002, v * 0.5, 0.04), o = osc('sine', 900 + Math.random() * 1200, tt, 0.05, gg); o.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 600, tt + 0.04); } },
    pop(v = 0.25) { if (!ok('pop', 0.04)) return; const t = T(), g = g0(t, 0.001, v, 0.05), o = osc('sine', 1400 + Math.random() * 600, t, 0.06, g); o.frequency.exponentialRampToValueAtTime(260, t + 0.05); },
    // scissors: two metallic clicks with a ring
    snip(v = 0.35) { if (!ok('snip', 0.05)) return; const t = T(); for (const [dt, f] of [[0, 3400], [0.055, 2900]]) { const g = g0(t + dt, 0.001, v, 0.035), h = filt('highpass', 4000, 0.7, g); nz(t + dt, 0.03, h, 1.5); const r = g0(t + dt, 0.001, v * 0.25, 0.12); osc('triangle', f, t + dt, 0.13, r); } },
    clip(v = 0.4) { if (!ok('clip', 0.05)) return; const t = T(), g = g0(t, 0.001, v, 0.025), h = filt('highpass', 2500, 0.7, g); nz(t, 0.03, h, 2); const k = g0(t + 0.01, 0.002, v * 0.5, 0.06); osc('sine', 420, t + 0.01, 0.07, k).frequency.exponentialRampToValueAtTime(180, t + 0.07); },
    crunch(v = 0.35) { if (!ok('crunch', 0.1)) return; const t = T(); for (let i = 0; i < 4; i++) { const tt = t + i * 0.065 + Math.random() * 0.02, g = g0(tt, 0.002, v * (1 - i * 0.18), 0.05), f = filt('bandpass', 1600 + Math.random() * 900, 1.5, g); nz(tt, 0.06, f, 1.3); } },
    whoosh(v = 0.2) { if (!ok('whoosh', 0.1)) return; const t = T(), g = g0(t, 0.04, v, 0.22), f = filt('bandpass', 600, 2, g); f.frequency.setValueAtTime(500, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.25); nz(t, 0.3, f); },
    // shake-off: big wet spray + droplets
    splash(v = 0.4) { if (!ok('splash', 0.3)) return; const t = T(), g = g0(t, 0.02, v, 0.7), f = filt('bandpass', 1800, 0.8, g); f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(900, t + 0.7); nz(t, 0.8, f, 1.2);
      for (let i = 0; i < 9; i++) { const tt = t + 0.05 + Math.random() * 0.6, gg = g0(tt, 0.001, v * 0.3, 0.05), o = osc('sine', 700 + Math.random() * 900, tt, 0.06, gg); o.frequency.exponentialRampToValueAtTime(1800 + Math.random() * 900, tt + 0.05); } },
    chime(v = 0.18) { if (!ok('chime', 0.08)) return; const t = T(); [1567, 2093, 2637].forEach((f, i) => { const g = g0(t + i * 0.05, 0.002, v * (1 - i * 0.2), 0.6); osc('sine', f, t + i * 0.05, 0.7, g); const g2 = g0(t + i * 0.05, 0.002, v * 0.12, 0.25); osc('sine', f * 2.76, t + i * 0.05, 0.3, g2); }); },
    // polish: rubbery squeak with vibrato
    squeak(v = 0.15) { if (!ok('squeak', 0.12)) return; const t = T(), d = 0.12, g = g0(t, 0.01, v, d), f = filt('bandpass', 1800, 6, g), o = osc('sawtooth', 1100 + Math.random() * 500, t, d + 0.02, f), l = C().createOscillator(), lg = C().createGain(); l.frequency.value = 38; lg.gain.value = 90; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + d + 0.05); o.frequency.linearRampToValueAtTime(1700 + Math.random() * 400, t + d); },
    // footsteps on wooden planks
    step(v = 0.12, alt = false) { if (!ok('step', 0.18)) return; const t = T(), g = g0(t, 0.002, v, 0.07), f = filt('lowpass', alt ? 700 : 560, 1, g); nz(t, 0.08, f, 0.6); const k = g0(t, 0.001, v * 0.6, 0.05); osc('sine', alt ? 150 : 130, t, 0.06, k).frequency.exponentialRampToValueAtTime(70, t + 0.05); },
    coins(v = 0.18) { if (!ok('coins', 0.3)) return; const t = T(); for (let i = 0; i < 5; i++) { const tt = t + i * 0.07 + Math.random() * 0.03, f = 2600 + Math.random() * 1600, g = g0(tt, 0.001, v, 0.25); osc('sine', f, tt, 0.3, g); const g2 = g0(tt, 0.001, v * 0.4, 0.12); osc('square', f * 1.5, tt, 0.14, filt('highpass', 3000, 1, g2)); } },
    // door bell when a customer walks in
    door(v = 0.18) { if (!ok('door', 0.5)) return; const t = T(); [[1318, 0], [1046, 0.28]].forEach(([f, dt]) => { const g = g0(t + dt, 0.002, v, 1.1); osc('sine', f, t + dt, 1.2, g); const g2 = g0(t + dt, 0.002, v * 0.3, 0.5); osc('sine', f * 3, t + dt, 0.6, g2); }); },
    knot(v = 0.25) { if (!ok('knot', 0.1)) return; const t = T(), g = g0(t, 0.002, v, 0.08), o = osc('triangle', 500, t, 0.1, g); o.frequency.exponentialRampToValueAtTime(1400, t + 0.08); S.brush(0.2); },
    wrong(v = 0.16) { if (!ok('wrong', 0.25)) return; const t = T(); [[220, 0], [185, 0.11]].forEach(([f, dt]) => { const g = g0(t + dt, 0.005, v, 0.12); osc('square', f, t + dt, 0.14, filt('lowpass', 900, 1, g)); }); },
    ok(v = 0.14) { if (!ok('okk', 0.1)) return; const t = T(); [[880, 0], [1320, 0.07]].forEach(([f, dt]) => { const g = g0(t + dt, 0.003, v, 0.15); osc('triangle', f, t + dt, 0.18, g); }); },
    click(v = 0.12) { if (!ok('click', 0.03)) return; const t = T(), g = g0(t, 0.001, v, 0.03); osc('square', 1800, t, 0.04, filt('bandpass', 2400, 2, g)); },
  };
  // ---------- voices ----------
  function bark(t, f0, f1, d, v, q = 4) { const g = g0(t, 0.008, v, d), bp = filt('bandpass', 900, q, g), o = osc('sawtooth', f0, t, d + 0.02, bp); o.frequency.exponentialRampToValueAtTime(f1, t + d); bp.frequency.setValueAtTime(1300, t); bp.frequency.exponentialRampToValueAtTime(700, t + d); const gn = g0(t, 0.002, v * 0.5, 0.03); nz(t, 0.04, filt('bandpass', 2000, 1, gn)); }
  function meow(t, f0, fp, f1, d, v) { const g = g0(t, 0.04, v, d), bp = filt('bandpass', 1200, 3, g), o = osc('sawtooth', f0, t, d + 0.05, bp); o.frequency.linearRampToValueAtTime(fp, t + d * 0.4); o.frequency.linearRampToValueAtTime(f1, t + d); bp.frequency.setValueAtTime(700, t); bp.frequency.linearRampToValueAtTime(2200, t + d * 0.45); bp.frequency.linearRampToValueAtTime(900, t + d);
    const l = C().createOscillator(), lg = C().createGain(); l.frequency.value = 6; lg.gain.value = 12; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + d); }
  function oink(t, f0, f1, d, v) { const g = g0(t, 0.01, v, d), bp = filt('bandpass', 650, 5, g), o = osc('square', f0, t, d + 0.02, bp); o.frequency.exponentialRampToValueAtTime(f1, t + d); const gn = g0(t, 0.01, v * 0.6, d), lp = filt('lowpass', 500, 2, gn); nz(t, d + 0.02, lp, 0.5); }
  function purr(t, d, v) { const g = C().createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.15); g.gain.linearRampToValueAtTime(0.0001, t + d); g.connect(out()); const am = C().createGain(); am.gain.value = 0; am.connect(g); const l = C().createOscillator(), lg = C().createGain(); l.frequency.value = 24; lg.gain.value = 1; l.connect(lg); lg.connect(am.gain); l.start(t); l.stop(t + d); nz(t, d, filt('lowpass', 260, 2, am), 0.4); }
  function hiss(t, d, v) { const g = g0(t, 0.03, v, d); nz(t, d, filt('highpass', 3500, 0.6, g), 1.2); }
  function voice(type, kind = 'happy') { if (!ok('v' + type + kind, 0.25)) return; const t = T();
    if (type === 'dog') { if (kind === 'yelp') { bark(t, 1300, 700, 0.12, 0.3, 3); bark(t + 0.15, 1100, 600, 0.14, 0.25, 3); } else if (kind === 'giggle' || kind === 'sniff') { for (let i = 0; i < (kind === 'sniff' ? 3 : 4); i++) { const g = g0(t + i * 0.09, 0.005, kind === 'sniff' ? 0.12 : 0.16, 0.05); nz(t + i * 0.09, 0.06, filt('bandpass', kind === 'sniff' ? 3000 : 1600, 1.5, g)); } }
      else if (kind === 'angry') { const g = g0(t, 0.05, 0.18, 0.6), bp = filt('lowpass', 500, 3, g); osc('sawtooth', 95, t, 0.65, bp); } else if (kind === 'yawn') { const g = g0(t, 0.1, 0.16, 0.8), bp = filt('bandpass', 800, 3, g), o = osc('sawtooth', 520, t, 0.85, bp); o.frequency.exponentialRampToValueAtTime(220, t + 0.8); bp.frequency.exponentialRampToValueAtTime(400, t + 0.8); }
      else if (kind === 'sneeze') { const g = g0(t, 0.2, 0.08, 0.1), o = osc('sine', 500, t, 0.3, g); o.frequency.linearRampToValueAtTime(900, t + 0.28); const g2 = g0(t + 0.32, 0.003, 0.3, 0.18); nz(t + 0.32, 0.2, filt('bandpass', 2400, 0.8, g2)); }
      else { bark(t, 620, 380, 0.11, 0.28); bark(t + 0.16, 560, 330, 0.12, 0.24); } }
    else if (type === 'cat') { if (kind === 'angry') hiss(t, 0.6, 0.18); else if (kind === 'love') purr(t, 1.3, 0.35); else if (kind === 'yelp') meow(t, 900, 1500, 800, 0.35, 0.22); else if (kind === 'yawn') meow(t, 700, 600, 380, 0.7, 0.14); else if (kind === 'sneeze') { const g2 = g0(t, 0.003, 0.2, 0.1); nz(t, 0.12, filt('bandpass', 3200, 1, g2)); } else if (kind === 'giggle' || kind === 'sniff') purr(t, 0.6, 0.25); else meow(t, 650, 1050, 700, 0.42, 0.2); }
    else { if (kind === 'yelp') { oink(t, 900, 1300, 0.18, 0.25); oink(t + 0.2, 1100, 700, 0.2, 0.22); } else if (kind === 'angry') oink(t, 140, 90, 0.4, 0.28); else if (kind === 'giggle' || kind === 'happy' || kind === 'love') { oink(t, 200, 150, 0.12, 0.28); oink(t + 0.16, 230, 170, 0.12, 0.26); if (kind !== 'giggle') oink(t + 0.32, 260, 200, 0.14, 0.24); } else if (kind === 'sniff') { for (let i = 0; i < 3; i++) oink(t + i * 0.12, 120, 100, 0.07, 0.18); } else if (kind === 'sneeze') { const g2 = g0(t + 0.2, 0.003, 0.25, 0.15); nz(t + 0.2, 0.18, filt('bandpass', 1800, 1, g2)); } else oink(t, 170, 120, 0.18, 0.26); } }
  // ---------- loops ----------
  const L = {};
  function loop(name, on, level = 1) { const c = C(); if (!c || !out() || c.state !== 'running') return; let l = L[name];
    if (on && !l) { const t = c.currentTime, g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.connect(out()); const nodes = [];
      if (name === 'spray') { const bp = filt('bandpass', 3800, 0.7, g), hp = filt('highpass', 900, 0.7, bp), s = C().createBufferSource(); s.buffer = MUS.noise; s.loop = true; s.connect(hp); s.start(t); nodes.push(s); const lf = c.createOscillator(), lg = c.createGain(); lf.frequency.value = 13; lg.gain.value = 600; lf.connect(lg); lg.connect(bp.frequency); lf.start(t); nodes.push(lf); }
      else { const lp = filt('lowpass', 1300, 0.8, g), s = C().createBufferSource(); s.buffer = MUS.noise; s.loop = true; s.playbackRate.value = 0.8; s.connect(lp); s.start(t); nodes.push(s); const hg = c.createGain(); hg.gain.value = 0.25; hg.connect(g); const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.5); o.connect(filt('lowpass', 500, 2, hg)); o.start(t); nodes.push(o); }
      l = L[name] = { g, nodes }; g.gain.linearRampToValueAtTime(0.16 * level, t + 0.12); MUS.duck(0.55); }
    else if (!on && l) { const t = c.currentTime; l.g.gain.cancelScheduledValues(t); l.g.gain.setValueAtTime(l.g.gain.value, t); l.g.gain.linearRampToValueAtTime(0.0001, t + 0.15); l.nodes.forEach(n => { try { n.stop(t + 0.2); } catch (e) {} }); delete L[name]; if (!Object.keys(L).length) MUS.duck(1); } }
  const stopAll = () => Object.keys(L).forEach(k => loop(k, false));
  return { ...S, voice, loop, stopAll };
}
