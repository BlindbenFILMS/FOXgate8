// REVEAL: the painting is hidden under darkness or fog. Drag a finger to wipe it away and find the things hidden at
// real spots in the painting. A thing is found when the area around it is mostly clear: chime, its name is spoken,
// and it glows. Find them all before the time runs out.
// By ear: while you drag, a hot/cold pulse plays: its pitch and pulse rate rise as your finger nears the nearest
// thing still hidden, and it comes from that thing's side (stereo pan). The HINT button pings the nearest thing's
// direction (higher = up, lower = down) and says it in words.
//
// cfg = {
//   engine: 'reveal', title, kicker, how,
//   targets: [{ u, v, name, e: '🌙', r: 0.06 }]   hidden things (r = how much around it must be cleared, 0..1 of width)
//   fog: { colors: ['#0b1020', '#1b2340'], stars: false, opacity: 0.97, grain: '#ffffff' }   the cover's look
//   coverName: 'dark'       what the cover is called aloud
//   brush: 0.075            finger size (0..1 of width)       clear: 0.55   fraction around a thing that must be clear
//   time: 80                seconds                            unit: 'found'
//   creep: 0                fog that comes back (opacity per second over the whole cover; The Gray Zone)
//   lift: 0                 how much the whole cover thins as you find things (0..1)
//   sun: { u, v, color, size, rise }   a glow that rises and brightens as you find things (A New Day)
//   beacons: [{ u, v, color, size, opacity }]  lights that shine through the cover from the start (the moon)
//   lights: true            each found thing leaves a warm light that stays on (Find Your Village)
//   voice: { type: 'sine', base: 300 }   the hot/cold pulse's sound
//   ambient: 'wind'         a breath of wind at GO
//   color: '#ffd25a'        glow + sparkle colour
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

const MW = 256;   // mask resolution across the painting

export function revealGame(cfg) {
  let G = null;
  const T = cfg.targets.map(t => ({ ...t }));
  const fog = cfg.fog || {};
  const brush = cfg.brush || 0.075;
  const clearNeed = cfg.clear ?? 0.6;
  const color = cfg.color || '#ffd25a';
  const voice = cfg.voice || { type: 'sine', base: 300 };
  const TIME = cfg.time || 80;

  /* ── the cover: a mask canvas (white = covered) and a look canvas, combined into the shown texture ── */
  function buildCover() {
    const W = MW, H = Math.round(MW * G.h);
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    G.mask = mk(); G.look = mk(); G.show = mk();
    G.mctx = G.mask.getContext('2d', { willReadFrequently: true });
    G.mctx.fillStyle = '#fff'; G.mctx.fillRect(0, 0, W, H);
    // the look: base colour, soft cloudy blobs, grain, optional stars
    const g = G.look.getContext('2d'), cols = fog.colors || ['#0b1020', '#1b2340'];
    const lg = g.createLinearGradient(0, 0, W, H); cols.forEach((c, i) => lg.addColorStop(i / Math.max(1, cols.length - 1), c));
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    let seed = 7 + T.length * 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 40; i++) {
      const x = rnd() * W, y = rnd() * H, r = 20 + rnd() * 70, c = cols[(rnd() * cols.length) | 0];
      const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.5; g.fillStyle = rg; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.fillStyle = fog.grain || '#ffffff';
    for (let i = 0; i < 700; i++) { g.globalAlpha = rnd() * 0.04; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
    if (fog.stars) { g.fillStyle = '#fff'; for (let i = 0; i < 90; i++) { g.globalAlpha = 0.3 + rnd() * 0.6; const s = rnd() < 0.15 ? 2 : 1; g.fillRect(rnd() * W, rnd() * H, s, s); } }
    g.globalAlpha = 1;
    G.tex = new THREE.CanvasTexture(G.show); G.tex.colorSpace = THREE.SRGBColorSpace;
    G.cover = K.plane(G.tex, 1, G.h, { opacity: fog.opacity ?? 0.97, order: 12 });
    G.cover.position.z = 0.025; G.root.add(G.cover);
    G.dirty = true; compose();
  }
  function compose() {
    if (!G.dirty) return; G.dirty = false;
    const c = G.show.getContext('2d'); c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, G.show.width, G.show.height); c.drawImage(G.look, 0, 0);
    c.globalCompositeOperation = 'destination-in'; c.drawImage(G.mask, 0, 0); c.globalCompositeOperation = 'source-over';
    G.tex.needsUpdate = true;
  }
  // wipe a soft round hole at u,v
  function stamp(u, v, r = brush, strength = 0.9) {
    const W = G.mask.width, H = G.mask.height, x = u * W, y = v * H, R = r * W;
    const m = G.mctx; m.globalCompositeOperation = 'destination-out';
    const rg = m.createRadialGradient(x, y, R * 0.35, x, y, R); rg.addColorStop(0, `rgba(0,0,0,${strength})`); rg.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = rg; m.beginPath(); m.arc(x, y, R, 0, Math.PI * 2); m.fill();
    m.globalCompositeOperation = 'source-over'; G.dirty = true;
  }
  // how clear (0..1) the area around a thing is
  function clearness(t) {
    const W = G.mask.width, H = G.mask.height, R = Math.max(3, (t.r || 0.06) * W), cx = t.u * W, cy = t.v * H;
    const x0 = Math.max(0, Math.floor(cx - R)), y0 = Math.max(0, Math.floor(cy - R)), x1 = Math.min(W, Math.ceil(cx + R)), y1 = Math.min(H, Math.ceil(cy + R));
    if (x1 <= x0 || y1 <= y0) return 1;
    const d = G.mctx.getImageData(x0, y0, x1 - x0, y1 - y0).data; let n = 0, c = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > R * R) continue;
      n++; if (d[((y - y0) * (x1 - x0) + (x - x0)) * 4 + 3] < 110) c++;
    }
    return n ? c / n : 1;
  }

  /* ── finding things ── */
  const hidden = () => T.filter(t => !t.found);
  function nearest(u, v) {
    let best = null, bd = 9;
    for (const t of hidden()) { const d = Math.hypot(t.u - u, (t.v - v) * G.h); if (d < bd) { bd = d; best = t; } }
    return best && { t: best, d: bd };
  }
  function check() { for (const t of hidden()) if (clearness(t) >= clearNeed) found(t); }
  function found(t) {
    t.found = true; G.found++;
    const [x, y] = G.S.P(t.u, t.v), pan = (t.u - 0.5) * 1.8;
    stamp(t.u, t.v, (t.r || 0.06) * 1.4, 1);     // the light comes on: open it up fully
    K.sfx.good(pan, G.found + 2); K.tone(1320, 0.5, { vol: 0.05, pan, delay: 0.12 });
    G.buzz([25, 30, 50]); G.fx.add(x, y, color, 22, 0.3);
    const glow = K.sprite(K.glowTex, (t.r || 0.06) * 3, { color, additive: true, opacity: 0, order: 18 });
    glow.position.set(x, y, 0.035); G.root.add(glow);
    const icon = K.sprite(K.emojiTex(t.e, { ring: true, color }), 0.07, { order: 22, opacity: 0 });
    icon.position.set(x, y, 0.05); G.root.add(icon);
    G.marks.push({ t, glow, icon, age: 0 });
    G.ui.alert(t.name, `Found ${G.found} of ${T.length}`, 1.1, cfg.alertKind || 'black');
    G.say(t.name + (G.found < T.length ? '. ' + G.found + ' of ' + T.length : ''), false);
    hud();
    if (G.found >= T.length) G.endT = 1.0;
  }

  /* ── the finger ── */
  function wipe(u, v) {
    if (!G || !G.playing) return;
    const last = G.finger;
    if (last && last.on) {
      const d = Math.hypot(u - last.u, v - last.v), steps = Math.min(30, Math.ceil(d / (brush * 0.3)));
      for (let i = 1; i <= steps; i++) stamp(last.u + (u - last.u) * i / steps, last.v + (v - last.v) * i / steps);
    } else stamp(u, v);
    G.finger = { u, v, on: true };
    G.ring.visible = true; const [x, y] = G.S.P(u, v); G.ring.position.set(x, y, 0.045);
  }
  function lift() { if (G && G.finger) G.finger.on = false; if (G && G.ring) G.ring.visible = false; }
  // the hot/cold pulse while the finger is down
  function pulse(dt) {
    if (!G.finger || !G.finger.on) return;
    const n = nearest(G.finger.u, G.finger.v); if (!n) return;
    const hot = Math.max(0, 1 - n.d / 0.7);           // 0 far … 1 on top of it
    G.pulseT -= dt;
    if (G.pulseT <= 0) {
      G.pulseT = 0.62 - hot * 0.52;
      const pan = Math.max(-1, Math.min(1, (n.t.u - G.finger.u) * 3));
      K.tone(voice.base * (1 + hot * hot * 2.2), 0.07, { type: voice.type, vol: 0.05 + hot * 0.05, pan });
      if (hot > 0.85) G.buzz(8);
    }
  }
  function hint() {
    if (!G || !G.playing) return;
    const from = G.finger || { u: 0.5, v: 0.5 }, n = nearest(from.u, from.v); if (!n) return;
    G.hints++;
    const du = n.t.u - from.u, dv = n.t.v - from.v, pan = Math.max(-1, Math.min(1, du * 3));
    const f = 660 * Math.pow(2, -dv * 1.6);             // higher = up the painting
    [0, 0.16, 0.32].forEach(d => K.tone(f, 0.12, { vol: 0.1, pan, delay: d, type: 'triangle' }));
    const h = Math.abs(du) < 0.06 ? '' : du < 0 ? 'left' : 'right', vv = Math.abs(dv) < 0.06 ? '' : dv < 0 ? 'up' : 'down';
    const where = n.d < 0.08 ? 'Right here' : [vv, h].filter(Boolean).join(' and ') || 'Close';
    G.say(where + '.', true);
    const [x, y] = G.S.P(n.t.u, n.t.v); G.shimmer.position.set(x, y, 0.04); G.shimmerT = 1.2;   // a faint shimmer for low vision
  }

  /* ── HUD + end ── */
  function hud() {
    const left = Math.max(0, Math.ceil(G.left));
    G.ui.panel(cfg.kicker || cfg.title, `${G.found}<small>of ${T.length} ${cfg.unit || 'found'}</small>`,
      { segs: [G.found, T.length], sub: `${left} seconds left. Drag to wipe. HINT points the way.`, warn: left <= 10 });
  }
  function end(won) {
    if (G.over) return;
    lift(); G.cover.visible = false; G.shimmer.visible = false; if (G.sun) G.sun.visible = false;
    for (const b of G.beacons) b.visible = false;
    for (const m of G.marks) { m.glow.visible = false; m.icon.visible = false; }
    const secs = Math.round(TIME - Math.max(0, G.left));
    const r = won ? K.best(cfg.id + ':reveal', secs, 'lower') : { isBest: false };
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: cfg.unit || 'Found', v: G.found + '/' + T.length }, { k: 'Time', v: secs + 's' }] });
  }

  /* ── the robot: wipe toward the nearest hidden thing, then scrub around it ── */
  function bot(dt) {
    G.botT += dt;
    if (G.botRest > 0) { G.botRest -= dt; if (G.botRest <= 0) hint(); return; }      // lift, listen, ask for a hint
    if (G.botFound !== G.found) { G.botFound = G.found; lift(); G.botRest = 0.9; return; }
    const from = G.finger || { u: 0.5, v: 0.5 };
    const n = nearest(from.u, from.v); if (!n) { lift(); return; }
    // wander toward it like a person feeling their way: a wobble that tightens as the pulse gets hot
    const t = n.t, a = G.botT * 5, rr = (t.r || 0.06) * 0.6 + Math.min(0.12, n.d * 0.35);
    const gu = t.u + Math.cos(a) * rr, gv = t.v + Math.sin(a * 1.3) * rr / G.h;
    const du = gu - from.u, dv = gv - from.v, d = Math.hypot(du, dv), step = Math.min(d, 0.22 * dt);
    const u = Math.max(0, Math.min(1, from.u + (d ? du / d * step : 0))), v = Math.max(0, Math.min(1, from.v + (d ? dv / d * step : 0)));
    wipe(u, v);
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      T.forEach(t => { t.found = false; });
      Object.assign(G, { found: 0, marks: [], beacons: [], left: TIME, pulseT: 0, checkT: 0, creepT: 0, hints: 0, botT: 0, botRest: 0.6, botFound: 0, finger: null, endT: 0, shimmerT: 0 });
      buildCover();
      G.ring = K.sprite(K.ringTex, brush * 2, { color: '#ffffff', opacity: 0.55, order: 16 }); G.ring.visible = false; G.root.add(G.ring);
      G.shimmer = K.sprite(K.glowTex, 0.16, { color, additive: true, opacity: 0, order: 17 }); G.root.add(G.shimmer);
      for (const b of cfg.beacons || []) {
        const s = K.sprite(K.glowTex, b.size || 0.2, { color: b.color || '#fff6d8', additive: true, opacity: b.opacity ?? 0.8, order: 14 });
        const [x, y] = G.S.P(b.u, b.v); s.position.set(x, y, 0.03); s.userData = b; G.root.add(s); G.beacons.push(s);
      }
      if (cfg.sun) { G.sun = K.sprite(K.glowTex, cfg.sun.size || 0.3, { color: cfg.sun.color || '#ffb347', additive: true, opacity: 0.1, order: 14 }); G.root.add(G.sun); }
      G.ui.buttons([{ label: 'Hint', icon: '◎', kind: 'red', aria: 'Hint: hear the direction of the nearest hidden thing', press: hint }]);
      hud();
      K.intro(G, { title: cfg.title, how: cfg.how });
      G.onGo = () => { if (cfg.ambient === 'wind') K.wind(2.5, { vol: 0.12 }); };
    },
    update(dt) {
      if (!G || G.paused) return;
      dt = Math.min(dt, 0.1);
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over) return;
      // found things: glow fades in and breathes
      const prog = G.found / T.length;
      for (const m of G.marks) {
        m.age += dt; const inn = Math.min(1, m.age * 2);
        const base = cfg.lights ? 0.7 : Math.max(0.18, 0.8 - m.age * 0.25);
        m.glow.material.opacity = inn * base * (0.85 + Math.sin(G.t * 2.4 + m.t.u * 9) * 0.15);
        m.icon.material.opacity = inn * Math.max(cfg.lights ? 0.75 : 0.45, 1 - m.age * 0.2);
      }
      for (const b of G.beacons) b.material.opacity = (b.userData.opacity ?? 0.8) * (0.85 + Math.sin(G.t * 1.3) * 0.15);
      if (G.sun) {
        const s = cfg.sun, [x, y] = G.S.P(s.u, s.v + (1 - prog) * (s.rise ?? 0.12));
        G.sun.position.set(x, y, 0.03); G.sun.material.opacity = 0.12 + prog * 0.75;
        const sz = (s.size || 0.3) * (0.7 + prog * 0.6); G.sun.scale.set(sz, sz, 1);
      }
      if (cfg.lift) G.cover.material.opacity = (fog.opacity ?? 0.97) * (1 - cfg.lift * prog);
      if (G.shimmerT > 0) { G.shimmerT -= dt; G.shimmer.material.opacity = Math.max(0, Math.sin(Math.max(0, G.shimmerT) / 1.2 * Math.PI)) * 0.45; }
      if (!G.playing) { compose(); return; }
      if (G.endT > 0) { G.endT -= dt; compose(); if (G.endT <= 0) end(true); return; }
      // fog creeping back (The Gray Zone); things already found stay clear
      if (cfg.creep) {
        G.creepT += dt;
        if (G.creepT >= 0.25) {
          const m = G.mctx; m.globalAlpha = Math.min(1, cfg.creep * G.creepT); m.fillStyle = '#fff'; m.fillRect(0, 0, G.mask.width, G.mask.height); m.globalAlpha = 1;
          for (const k of G.marks) stamp(k.t.u, k.t.v, (k.t.r || 0.06) * 1.1, 1);
          G.creepT = 0; G.dirty = true;
        }
      }
      if (G.bot) bot(dt);
      pulse(dt);
      G.checkT -= dt; if (G.checkT <= 0) { G.checkT = 0.15; check(); }
      compose();
      const before = Math.ceil(G.left); G.left -= dt;
      if (Math.ceil(G.left) !== before) {
        hud();
        const l = Math.ceil(G.left);
        if (l === 30 || l === 10) G.say(l + ' seconds left', false);
        if (l <= 5 && l > 0) K.sfx.tick();
      }
      if (G.left <= 0 && G.endT <= 0) end(false);
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'up') { lift(); return; }
      if (kind === 'move' && !(G.finger && G.finger.on)) return;
      const b = G.S.toBoard(ev, G.root); if (!b) return;
      if (b.u < -0.05 || b.u > 1.05 || b.v < -0.05 || b.v > 1.05) { lift(); return; }
      wipe(Math.max(0, Math.min(1, b.u)), Math.max(0, Math.min(1, b.v)));
    },
    pause() { if (G) { G.paused = true; lift(); } },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'reveal', playing: G.playing, over: G.over, found: G.found, total: T.length, left: Math.round(G.left), hints: G.hints }; },
    stop() { if (G && G.tex) G.tex.dispose(); K.cleanup(G); G = null; },
  };
}
