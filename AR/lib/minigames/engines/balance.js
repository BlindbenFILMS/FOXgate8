// BALANCE: keep something steady while the world pushes it around. A glowing marker sits on a track across the
// painting with a calm zone in the middle. Gusts, waves and swirls push it sideways; hold the left or right half of
// the screen (or the big ◀ ▶ buttons) to push back. While the marker stays in the calm zone the meter fills and the
// painting answers (petals open, greens grow, the water settles, the fog clears). Drifting off the end of the track
// is a wobble; three wobbles and the game is over.
// By ear: a soft steady tone follows the marker: its pitch rises the further you drift and its pan tells you which
// side you are on. Ticks speed up near the edge. A calm chord plays while you stay centred. Every push is announced
// with a whoosh from the side it comes from, a moment before it hits.
//
// cfg = {
//   engine: 'balance', title, kicker, how, unit,
//   center: [u, v], span: 0.3          middle of the track and its half-width (0..1 across the painting)
//   safe: 0.38                         half-width of the calm zone, as a share of the track (0..1)
//   orb: '🌼', color: '#ffd25a'        the marker and its glow / calm-zone colour
//   time: 40                           seconds of calm needed to win; drain: meter lost per second outside the zone
//   push: 2.6, damp: 2.0, spring: 0    how hard you push back, friction, gentle pull to the middle
//   drift: [0.4, 0.9]                  restless random push (start → end)
//   current: { amp: 0, period: 5 }     a steady back-and-forth push (waves)
//   gusts: { gap: [3.2, 1.6], dur: [1.2, 1.6], str: [1.6, 2.4], warn: 1.1, dirs: 'random'|'alternate', twin: 0 }
//   gust: { e: '💨', name: 'Wind', sound: 'wind'|'tick'|'water'|'chime'|'thunder', color }
//   bloom: { at: [u, v], type: 'ring'|'points', r, n, points: [[u, v], …], e: ['🌸'], size, glow }
//   veil: { color, mode: 'rise'|'fade', calm: v, storm: v, opacity }  (optional) the trouble that recedes as you stay calm
//   pitch: 330, chord: [Hz, …], stages: ['…', '…', '…'] (spoken at 25 / 50 / 75 %), wobble: 'Shaken!'
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rnd = (r) => r[0] + Math.random() * (r[1] - r[0]);
const rgbOf = (color) => { const c = new THREE.Color(color); return `${(c.r * 255) | 0},${(c.g * 255) | 0},${(c.b * 255) | 0}`; };

// the track: a dark bar with a coloured calm zone in the middle and red ends
function trackTex(safe, color) {
  return K.canvasTex(512, 64, (g, W, H) => {
    g.fillStyle = 'rgba(8,8,12,.62)'; g.fillRect(0, 14, W, H - 28);
    const s = safe * W / 2, m = W / 2;
    g.globalAlpha = 0.7; g.fillStyle = color; g.fillRect(m - s, 18, s * 2, H - 36); g.globalAlpha = 1;
    g.fillStyle = '#fff'; g.fillRect(m - 2, 8, 4, H - 16);
    g.fillStyle = K.RED; g.fillRect(0, 6, 14, H - 12); g.fillRect(W - 14, 6, 14, H - 12);
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; g.strokeRect(m - s, 16, s * 2, H - 32);
  });
}
// a soft vignette for 'fade' veils: clear in the middle, cloudy at the edges
function vignetteTex(color) {
  return K.canvasTex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 124, 0, 128, 128, 120), rgb = rgbOf(color);
    r.addColorStop(0, `rgba(${rgb},.3)`); r.addColorStop(0.45, `rgba(${rgb},.6)`); r.addColorStop(1, `rgba(${rgb},1)`);
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  });
}
// water for 'rise' veils: a wavy top edge, then deep water
function waterTex(color) {
  return K.canvasTex(256, 256, (g) => {
    const rgb = rgbOf(color), wave = (x) => 10 + Math.sin(x / 18) * 6;
    const r = g.createLinearGradient(0, 0, 0, 256); r.addColorStop(0, `rgba(${rgb},.92)`); r.addColorStop(1, `rgba(${rgb},.8)`);
    g.fillStyle = r; g.beginPath(); g.moveTo(0, wave(0));
    for (let x = 0; x <= 256; x += 8) g.lineTo(x, wave(x));
    g.lineTo(256, 256); g.lineTo(0, 256); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; g.beginPath();
    for (let x = 0; x <= 256; x += 8) g[x ? 'lineTo' : 'moveTo'](x, wave(x)); g.stroke();
  });
}

export function balanceGame(cfg) {
  let G = null;
  const C = {
    span: 0.3, safe: 0.38, time: 40, drain: 0.012, push: 2.6, damp: 2.0, spring: 0, drift: [0.4, 0.9], limit: 150,
    pitch: 330, chord: [261.6, 329.6, 392], wobble: 'Wobble!', unit: 'calm', color: '#ffd25a', orb: '●',
    ...cfg,
    gusts: { gap: [3.2, 1.8], dur: [1.1, 1.5], str: [1.5, 2.3], warn: 1.1, dirs: 'random', twin: 0, ...(cfg.gusts || {}) },
    gust: { e: '\u{1F4A8}', name: 'Wind', sound: 'wind', ...(cfg.gust || {}) },
    current: { amp: 0, period: 5, ...(cfg.current || {}) },
  };
  const side = (d) => (d < 0 ? 'left' : 'right');
  const posX = (x) => G.S.P(C.center[0] + x * C.span, C.center[1]);

  /* ── sound: the steady tone that follows the marker ── */
  function humStart() {
    const a = K.audio(); if (!a || G.hum) return;
    const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), g2 = a.createGain(), p = a.createStereoPanner ? a.createStereoPanner() : null;
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = C.pitch; o2.frequency.value = C.pitch * 1.5; g.gain.value = 0.0001; g2.gain.value = 0.25;
    o2.connect(g2).connect(g); o.connect(g);
    if (p) g.connect(p).connect(a.destination); else g.connect(a.destination);
    o.start(); o2.start(); G.hum = { a, o, o2, g, p };
  }
  function humSet(x, on) {
    const h = G && G.hum; if (!h) return;
    const t = h.a.currentTime, ax = Math.min(1, Math.abs(x)), f = C.pitch * Math.pow(2, ax * 1.1);
    h.o.frequency.setTargetAtTime(f, t, 0.05); h.o2.frequency.setTargetAtTime(f * (ax < C.safe ? 1.5 : 1.414), t, 0.05);   // a sweet fifth in the zone, a sour tritone outside
    h.g.gain.setTargetAtTime(on ? 0.035 + ax * 0.03 : 0.0001, t, 0.08);
    if (h.p) h.p.pan.setTargetAtTime(clamp(x, -1, 1) * 0.9, t, 0.05);
  }
  function humStop() {
    const h = G && G.hum; if (!h) return;
    try { h.g.gain.setTargetAtTime(0.0001, h.a.currentTime, 0.05); h.o.stop(h.a.currentTime + 0.3); h.o2.stop(h.a.currentTime + 0.3); } catch (e) {}
    G.hum = null;
  }
  // a push is announced from the side it comes FROM (the other side of where it pushes)
  function warnSound(dir) {
    const pan = -dir * 0.9, s = C.gust.sound;
    if (s === 'tick') { [0, 0.28, 0.56].forEach((d, i) => K.tone(i % 2 ? 1000 : 1400, 0.05, { type: 'square', vol: 0.07, pan, delay: d })); K.noise(0.5, { vol: 0.16, pan, freq: 500, sweepTo: 2000, delay: 0.5 }); }
    else if (s === 'water') K.noise(0.9, { vol: 0.3, pan, freq: 250, sweepTo: 900, type: 'lowpass', q: 0.7 });
    else if (s === 'chime') { [0, 1, 2].forEach(i => K.tone(K.SCALES.penta[4 + i * 2], 0.2, { vol: 0.06, pan, delay: i * 0.12, type: 'triangle' })); K.sfx.whoosh(pan); }
    else if (s === 'thunder') { K.noise(1.0, { vol: 0.32, pan, freq: 120, sweepTo: 600, type: 'lowpass', q: 0.8 }); K.noise(0.4, { vol: 0.18, pan, freq: 1800, delay: 0.4 }); }
    else K.sfx.whoosh(pan);
  }
  function hitSound(g) {
    const pan = -g.dir * 0.8, s = C.gust.sound;
    if (s === 'water') K.noise(g.dur, { vol: 0.22, pan, freq: 300, sweepTo: 160, type: 'lowpass', q: 0.6 });
    else if (s === 'thunder') K.noise(g.dur, { vol: 0.26, pan, freq: 90, sweepTo: 300, type: 'lowpass' });
    else K.wind(g.dur, { vol: 0.2, pan, from: 400, to: s === 'chime' ? 2200 : 1200 });
  }

  /* ── pictures ── */
  function build() {
    const R = G.root, [cx, cy] = G.S.P(C.center[0], C.center[1]);
    if (C.veil) {
      const v = C.veil;
      G.veil = v.mode === 'rise' ? K.plane(waterTex(v.color), 1, G.h, { opacity: v.opacity ?? 0.6, order: 11 })
        : K.plane(vignetteTex(v.color), 1, G.h, { opacity: 0, order: 11 });
      G.veil.position.z = 0.02; R.add(G.veil);
    }
    const B = C.bloom, [bx, by] = G.S.P(B.at[0], B.at[1]);
    G.bloomGlow = K.sprite(K.glowTex, B.glow || 0.3, { color: C.color, additive: true, opacity: 0, order: 12 });
    G.bloomGlow.position.set(bx, by, 0.022); R.add(G.bloomGlow);
    const n = B.n || 8;
    const pts = B.type === 'points' ? B.points.map(p => G.S.P(p[0], p[1]))
      : Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 + Math.PI / 2; return [bx + Math.cos(a) * B.r, by + Math.sin(a) * B.r]; });
    G.bloom = pts.map((p, i) => {
      const s = K.sprite(K.emojiTex(B.e[i % B.e.length]), B.size || 0.07, { order: 13, opacity: 0 });
      s.position.set(p[0], p[1], 0.025); if (B.type === 'ring') s.material.rotation = Math.atan2(p[1] - by, p[0] - bx) - Math.PI / 2; R.add(s);
      return { s, x: p[0], y: p[1], shown: 0, k: i };
    });
    G.track = K.plane(trackTex(C.safe, C.color), C.span * 2 + 0.03, 0.045, { order: 14 }); G.track.position.set(cx, cy, 0.03); R.add(G.track);
    G.zone = K.plane(K.glowTex, C.span * 2 * C.safe * 1.5, 0.12, { order: 15, additive: true, opacity: 0 }); G.zone.material.color = new THREE.Color(C.color); G.zone.position.set(cx, cy, 0.031); R.add(G.zone);
    G.halo = K.sprite(K.glowTex, 0.2, { color: C.color, additive: true, opacity: 0.6, order: 16 }); G.halo.position.set(cx, cy, 0.035); R.add(G.halo);
    G.orb = K.sprite(K.emojiTex(C.orb, { ring: true, color: C.color }), 0.095, { order: 18 }); G.orb.position.set(cx, cy, 0.04); R.add(G.orb);
    G.signs = [-1, 1].map(d => {
      const s = K.sprite(K.emojiTex(C.gust.e, { ring: true, color: '#ff5a4a' }), 0.085, { order: 19, opacity: 0 });
      const [x, y] = G.S.P(clamp(C.center[0] + d * (C.span - 0.02), 0.06, 0.94), C.center[1]); s.position.set(x, y + 0.085, 0.04); s.userData.home = [x, y + 0.085]; s.userData.on = 0; R.add(s); return s;
    });
    G.streaks = [];
  }
  function streak(dir) {
    const s = K.sprite(K.dotTex, 0.02, { color: C.gust.color || '#ffffff', additive: true, opacity: 0.8, order: 17 });
    const [x0, y0] = G.S.P(C.center[0] - dir * (C.span + 0.05), C.center[1]);
    s.position.set(x0, y0 + (Math.random() - 0.5) * 0.14, 0.036); s.scale.set(0.06, 0.012, 1); G.root.add(s);
    G.streaks.push({ s, vx: dir * (0.5 + Math.random() * 0.4), life: 0.9 });
  }

  /* ── controls: hold a side ── */
  function holdSet() {
    let sum = G.btnHold; for (const d of G.touches.values()) sum += d;
    const h = Math.sign(sum);
    if (h !== G.hold) { G.hold = h; if (h && G.playing) K.tone(h < 0 ? 300 : 400, 0.05, { type: 'triangle', vol: 0.05, pan: h * 0.7 }); }
  }
  function press(dir) { if (!G || G.over) return; G.btnHold = dir; holdSet(); }
  function release(dir) { if (!G) return; if (G.btnHold === dir) G.btnHold = 0; holdSet(); }

  /* ── gusts ── */
  function nextGust(force) {
    const p = G.prog, Q = C.gusts;
    let dir = force || (Q.dirs === 'alternate' ? -(G.lastDir || 1) : (Math.random() < 0.5 ? -1 : 1));
    if (!force && Q.dirs !== 'alternate' && dir === G.lastDir && G.sameRun >= 2) dir = -dir;   // no long runs on one side
    G.sameRun = dir === G.lastDir ? (G.sameRun || 0) + 1 : 1; G.lastDir = dir;
    const g = { dir, str: lerp(Q.str[0], Q.str[1], p) * (0.85 + Math.random() * 0.3), dur: rnd(Q.dur), t: -Q.warn, hit: false };
    G.gustList.push(g); G.gustCount++;
    warnSound(dir); G.buzz(15);
    G.signs[dir < 0 ? 0 : 1].userData.on = Q.warn + g.dur;     // the sign shows on the side it comes from
    if (G.gustCount <= 3 || g.str > Q.str[1] * 1.0) G.say(C.gust.name + ' from the ' + side(-dir), false);
    if (!force && Q.twin && Math.random() < Q.twin * (0.4 + p)) { G.twinT = Q.warn + g.dur * 0.6; G.twinDir = -dir; }  // then a push straight back
    G.gapT = lerp(Q.gap[0], Q.gap[1], p) * (0.8 + Math.random() * 0.4) + g.dur;
  }

  /* ── HUD ── */
  function hud(force) {
    const pct = Math.floor(G.prog * 100), inZ = Math.abs(G.x) < C.safe, key = pct + '|' + G.wob + '|' + inZ + '|' + Math.sign(G.x);
    if (!force && key === G.hudKey) return; G.hudKey = key;
    G.ui.panel(C.kicker || C.title, `${pct}%<small>${C.unit}</small>`,
      { segs: [Math.floor(G.prog * 12), 12], sub: (inZ ? 'Steady. ' : 'Drifting ' + side(G.x) + '. ') + `Wobbles ${G.wob} of 3`, warn: !inZ || G.wob >= 2 });
  }
  function wobble() {
    G.wob++; G.buzz([90, 50, 160]); K.sfx.bad(Math.sign(G.x) * 0.8);
    const [x, y] = posX(Math.sign(G.x)); G.fx.add(x, y, '#ff5a4a', 22);
    G.ui.alert(C.wobble, G.wob >= 3 ? '' : `${3 - G.wob} left. Push back toward the middle.`, 1.4);
    G.say(C.wobble + ' ' + (3 - G.wob) + ' left.');
    G.prog = Math.max(0, G.prog - 0.06);
    G.x = 0; G.v = 0; G.grace = 1.6; G.gustList = []; G.twinT = 0; G.gapT = Math.max(G.gapT, 2.2);
    for (const s of G.signs) s.userData.on = 0;
    hud(true);
    if (G.wob >= 3) end(false);
  }
  function end(won) {
    if (G.over) return;
    humStop(); G.hold = 0;
    for (const o of [G.track, G.zone, G.halo, G.orb, G.bloomGlow, G.veil, ...G.signs, ...G.bloom.map(b => b.s)]) if (o) o.visible = false;
    for (const s of G.streaks) G.root.remove(s.s); G.streaks = [];
    if (won) { const [bx, by] = G.S.P(C.bloom.at[0], C.bloom.at[1]); G.fx.add(bx, by, C.color, 34, 0.5); }
    const secs = Math.round(G.played), r = K.best(C.id + ':balance', secs, 'lower');
    const W = won ? C.win : (C.lose || C.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: C.unit, v: Math.floor(G.prog * 100) + '%' }, { k: 'Time', v: secs + 's' }, { k: 'Wobbles', v: G.wob }] });
  }

  /* ── the robot: see where the marker is heading, and lean against it ── */
  function bot() {
    let incoming = 0;
    for (const g of G.gustList) if (g.t > -0.3) incoming += g.dir * g.str * (g.t < 0 ? 0.6 : 1.1);
    const cur = C.current.amp * (0.7 + 0.5 * G.prog) * Math.sin(G.t * Math.PI * 2 / C.current.period);
    const want = -(G.x * 2.4 + G.v * 1.2) - (incoming + cur + G.drift) / C.push;
    const dir = want > 0.15 ? 1 : want < -0.15 ? -1 : 0;
    if (dir !== G.btnHold) { if (G.btnHold) release(G.btnHold); if (dir) press(dir); }
  }

  /* ── one physics step ── */
  function step(dt) {
    G.t += dt; G.played += dt;
    const p = G.prog;
    let f = G.hold * C.push - G.v * C.damp - G.x * C.spring;
    G.driftT -= dt; if (G.driftT <= 0) { G.driftT = 0.6 + Math.random() * 0.8; G.driftTo = (Math.random() * 2 - 1) * lerp(C.drift[0], C.drift[1], p); }
    G.drift += (G.driftTo - G.drift) * Math.min(1, dt * 2);
    if (G.grace > 0) { G.grace -= dt; f = G.hold * C.push * 0.5 - G.v * C.damp * 2; }
    else {
      f += G.drift;
      if (C.current.amp) f += C.current.amp * (0.7 + 0.5 * p) * Math.sin(G.t * Math.PI * 2 / C.current.period);
      G.gapT -= dt; if (G.gapT <= 0) nextGust();
      if (G.twinT > 0) { G.twinT -= dt; if (G.twinT <= 0) { const gp = G.gapT; nextGust(G.twinDir); G.gapT = Math.max(gp, 1.2); } }
      for (const g of G.gustList.slice()) {
        g.t += dt;
        if (g.t < 0) continue;
        if (!g.hit) { g.hit = true; hitSound(g); G.buzz(30); }
        f += g.dir * g.str * Math.sin(Math.PI * clamp(g.t / g.dur, 0, 1)) * 1.3;
        if (Math.random() < dt * 22) streak(g.dir);
        if (g.t >= g.dur) G.gustList.splice(G.gustList.indexOf(g), 1);
      }
    }
    G.v += f * dt; G.x += G.v * dt;
    if (G.bot) bot();
    if (Math.abs(G.x) >= 1) { wobble(); return; }
    const ax = Math.abs(G.x), inZ = ax < C.safe;
    if (inZ) G.prog = Math.min(1, G.prog + dt / C.time); else G.prog = Math.max(0, G.prog - dt * C.drain);
    if (inZ !== G.inZ) { G.inZ = inZ; if (!inZ) K.tone(240, 0.18, { type: 'triangle', vol: 0.05, pan: Math.sign(G.x) * 0.8, slide: -40 }); else K.tone(660, 0.12, { vol: 0.05 }); }
    // ticks near the edge, faster the closer you are
    if (ax > 0.7) { G.tickT -= dt; if (G.tickT <= 0) { G.tickT = lerp(0.32, 0.08, (ax - 0.7) / 0.3); K.tone(1200 + ax * 400, 0.04, { type: 'square', vol: 0.06, pan: Math.sign(G.x) * 0.95 }); if (ax > 0.85) G.buzz(12); } }
    else G.tickT = 0;
    // a calm chord while centred
    if (ax < C.safe * 0.6) { G.calmT += dt; if (G.calmT > 2.6) { G.calmT = 0; K.chord(C.chord, 1.6, { vol: 0.035 }); } } else G.calmT = 0;
    // milestones
    const q = Math.floor(G.prog * 4);
    if (q > G.stage && q < 4) { G.stage = q; const w = (C.stages || [])[q - 1]; K.sfx.good(0, q * 2); if (w) { G.say(w, false); G.ui.alert(w, '', 1.4, 'blue'); } G.buzz([20, 30, 20]); }
    if (G.prog >= 1) { end(true); return; }
    if (G.played > C.limit) end(false);
  }

  return {
    title: C.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { x: 0, v: 0, hold: 0, btnHold: 0, touches: new Map(), prog: 0, wob: 0, stage: 0, played: 0, drift: 0, driftTo: 0, driftT: 0,
        gapT: 2.0, twinT: 0, twinDir: 0, gustList: [], gustCount: 0, grace: 0, tickT: 0, calmT: 0, inZ: true, show: 0, danger: 0, lastDir: 0, sameRun: 0 });
      build();
      G.ui.buttons([
        { label: '◀ Push', aria: 'Push left. Press and hold.', press: () => press(-1), release: () => release(-1) },
        { label: 'Push ▶', aria: 'Push right. Press and hold.', press: () => press(1), release: () => release(1) },
      ]);
      hud(true);
      G.onGo = () => humStart();
      K.intro(G, { title: C.title, how: C.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      if (G.over) return;
      if (G.playing) {
        let left = Math.min(dt, 0.1);
        while (left > 1e-6 && G.playing) { const h = Math.min(left, 1 / 60); step(h); left -= h; }
        if (G.over) return;
        humSet(G.x, true); hud();
      }
      // the pictures follow the state
      const t = performance.now() / 1000, ax = Math.abs(G.x), inZ = ax < C.safe;
      const [ox, oy] = posX(clamp(G.x, -1, 1));
      G.orb.position.set(ox, oy + Math.sin(t * 3) * 0.003, 0.04); G.orb.material.rotation = -G.x * 0.6;
      G.halo.position.set(ox, oy, 0.035); G.halo.material.opacity = inZ ? 0.55 + Math.sin(t * 4) * 0.1 : 0.35;
      G.halo.material.color.set(inZ ? C.color : '#ff5a4a'); G.halo.scale.setScalar(inZ ? 0.2 : 0.16 + ax * 0.06);
      G.zone.material.opacity = inZ ? 0.35 + Math.sin(t * 2.5) * 0.08 : 0.08;
      for (const s of G.signs) { const on = s.userData.on > 0; if (on) s.userData.on -= dt; s.material.opacity += ((on ? 1 : 0) - s.material.opacity) * Math.min(1, dt * 8); s.position.x = s.userData.home[0] + (on ? Math.sin(t * 20) * 0.004 : 0); }
      for (let i = G.streaks.length - 1; i >= 0; i--) { const s = G.streaks[i]; s.life -= dt; s.s.position.x += s.vx * dt; s.s.material.opacity = Math.max(0, s.life); if (s.life <= 0) { G.root.remove(s.s); s.s.material.dispose(); G.streaks.splice(i, 1); } }
      // the painting answers: the bloom grows with the meter and shivers while you drift
      G.show += (G.prog - G.show) * Math.min(1, dt * 3);
      G.danger += ((inZ ? 0 : ax) - G.danger) * Math.min(1, dt * 3);
      const B = C.bloom, [bx, by] = G.S.P(B.at[0], B.at[1]), n = G.bloom.length;
      G.bloomGlow.material.opacity = 0.15 + G.show * 0.55; G.bloomGlow.scale.setScalar((B.glow || 0.3) * (0.5 + G.show * 0.7 + Math.sin(t * 2) * 0.03));
      for (const b of G.bloom) {
        const target = clamp(G.show * n * 1.08 - b.k, 0, 1);
        b.shown += (target - b.shown) * Math.min(1, dt * 4);
        const shake = G.danger * 0.012, open = B.type === 'ring' ? 0.55 + 0.45 * b.shown : 1;
        b.s.position.set(bx + (b.x - bx) * open + Math.sin(t * 17 + b.k) * shake,
          by + (b.y - by) * open + Math.cos(t * 13 + b.k) * shake + (B.type === 'points' ? Math.sin(t * 2 + b.k) * 0.003 : 0), 0.025);
        b.s.material.opacity = b.shown; b.s.scale.setScalar((B.size || 0.07) * (0.4 + 0.6 * b.shown));
      }
      if (G.veil) {
        const v = C.veil, trouble = clamp(1 - G.show + G.danger * 0.8, 0, 1) * (G.playing ? 1 : 0.6);
        if (v.mode === 'rise') { const top = lerp(v.calm, v.storm, trouble), [, ty] = G.S.P(0.5, top); G.veil.position.y = ty - G.h / 2 + Math.sin(t * 1.6) * 0.004; }
        else G.veil.material.opacity = (v.opacity ?? 0.6) * trouble;
      }
    },
    pointer(kind, ev) {
      if (!G || G.over || G.paused) return;
      const id = ev.pointerId ?? 0, d = ev.clientX < innerWidth / 2 ? -1 : 1;
      if (kind === 'down') { G.touches.set(id, d); holdSet(); }
      else if (kind === 'move') { if (G.touches.has(id) && G.touches.get(id) !== d) { G.touches.set(id, d); holdSet(); } }
      else if (kind === 'up') { G.touches.delete(id); holdSet(); }
    },
    pause() { if (G) { G.paused = true; humSet(G.x, false); } },
    resume() { if (G) { G.paused = false; G.touches.clear(); G.btnHold = 0; holdSet(); } },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'balance', playing: G.playing, over: G.over, progress: +G.prog.toFixed(3), wobbles: G.wob, x: +G.x.toFixed(2), gusts: G.gustCount, played: +G.played.toFixed(1) }; },
    stop() { if (G) humStop(); K.cleanup(G); G = null; },
  };
}
