// STACK: build something one well-timed piece at a time. A piece slides back and forth over the next build spot;
// tap anywhere (or the big DROP button) to set it down. Lined up well, it stays; any overhang is trimmed off and falls,
// so sloppy drops make the next ones narrower (like the classic stacking game). Miss completely and it falls: you lose
// one of 3 lives. Three perfect drops in a row grow the piece back a little. Finish the structure to win.
// By ear: while a piece slides it blips; the blips pan left/right with how far off it is and their pitch rises to a peak
// when it lines up, with a bright click (and a tiny buzz) at the exact "now". Each piece that lands plays the next
// note of a scale, so the structure builds a melody; a perfect drop adds a bright chord, a miss thuds and falls away.
//
// cfg = {
//   engine: 'stack', title, kicker, how, unit: 'planks', pieceName: 'plank'
//   start: [u, v]          centre of the first piece in its ideal spot (0..1 on the painting)
//   step: [du, dv]         how far each next piece's ideal spot moves (the build direction: across, up, diagonal)
//   axis: 'x' | 'y'        the axis the piece slides along (and gets trimmed along)
//   span: 0.07             piece length along the slide axis (fraction of the painting's width)
//   thick: 0.03            piece size on the other axis
//   range: 0.12            how far it slides each side of its spot
//   count: 12, lives: 3, speed: [0.11, 0.2] (slide speed start → end), perfect: 0.01 (snap tolerance)
//   look: 'plank' | 'score'    how a piece is drawn; colors: { a, b, line }
//   walker: { e, at: [u, v], size }   someone who steps onto each new piece; waiter: { e, at, size } (who they reach)
//   goal: [u, v]           where the walker goes when the build is complete (a soft glow marks it)
//   notes: 'major' (K.SCALES key), color: '#ffd25a' (sparkles), doneAlert, doneSub
//   win: { title, line }, lose: { title, line }
// }
import * as THREE from 'three';
import * as K from '../kit.js';

// a piece's picture (drawn tall): wood planks or a strip of sheet music
function pieceTex(look, colors = {}) {
  return K.canvasTex(128, 256, (g, W, H) => {
    if (look === 'score') {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, colors.a || '#fff4dc'); gr.addColorStop(1, colors.b || '#ffc070');
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
      g.strokeStyle = colors.line || '#3a2210'; g.lineWidth = 3;
      for (let i = 0; i < 5; i++) { const x = 28 + i * 18; g.beginPath(); g.moveTo(x, 10); g.lineTo(x, H - 10); g.stroke(); }
      g.fillStyle = colors.line || '#3a2210';
      [[46, 50], [82, 120], [64, 190]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 8, 11, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(x - 2, y + 8, 50 - (x - 28), 4); });
    } else {
      g.fillStyle = colors.a || '#c98d4a'; g.fillRect(0, 0, W, H);
      g.strokeStyle = colors.b || '#8a5626'; g.lineWidth = 3;
      for (let i = 0; i < 7; i++) { const x = 12 + i * 17 + Math.sin(i * 2.3) * 4; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, H * 0.3, x - 6, H * 0.7, x + 3, H); g.stroke(); }
      g.fillStyle = colors.line || '#3d220c'; [[W / 2, 22], [W / 2, H - 22]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); });
    }
    g.strokeStyle = '#120a04'; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.strokeRect(12, 12, W - 24, H - 24);
  });
}
let outlineTex = null;

export function stackGame(cfg) {
  let G = null;
  const lives0 = cfg.lives || 3, perfectTol = cfg.perfect || 0.01, unit = cfg.unit || 'pieces', name = cfg.pieceName || 'piece';
  const scale = K.SCALES[cfg.notes || 'major'] || K.SCALES.major;
  const along = cfg.axis === 'x' ? new THREE.Vector2(1, 0) : new THREE.Vector2(0, -1);   // slide axis on the board (y: + is down the painting)

  // board position of piece k's ideal spot, and of a spot offset o along the slide axis
  function ideal(k) { const [x, y] = G.S.P(cfg.start[0] + cfg.step[0] * k, cfg.start[1] + cfg.step[1] * k); return new THREE.Vector2(x, y); }
  const at = (k, o) => ideal(k).add(along.clone().multiplyScalar(o));
  // size a piece mesh: centre c, length s along the slide axis
  function shape(m, c, s, z = 0.04) {
    m.position.set(c.x, c.y, z);
    m.scale.set(cfg.axis === 'x' ? s : cfg.thick, cfg.axis === 'x' ? cfg.thick : s, 1);
  }
  function makePiece() {
    const m = K.plane(G.tex, 1, 1, { order: 14 });
    if (cfg.axis === 'x') m.geometry.rotateZ(Math.PI / 2);   // the picture is drawn tall; lay it down for horizontal pieces
    G.root.add(m); return m;
  }
  function hud() {
    G.ui.panel(cfg.kicker || cfg.title, `${G.placed}<small>of ${cfg.count} ${unit}</small>`,
      { segs: [G.placed, cfg.count], sub: `Lives ${G.lives} of ${lives0} · Perfect ${G.perfects}`, warn: G.lives <= 1 });
  }
  function placeWalker(p) {
    if (!G.walker) return;
    const halfH = cfg.axis === 'x' ? cfg.thick / 2 : p.span / 2;
    G.walkTo = new THREE.Vector2(p.c.x, p.c.y + halfH + (cfg.walker.size || 0.07) * 0.42);
  }
  const target = () => G.stack.length ? G.stack[G.stack.length - 1].o : 0;
  // a new piece slides in from one end
  function nextPiece() {
    const k = G.placed, side = Math.random() < 0.5 ? -1 : 1;
    G.cur = { k, o: side * cfg.range, dir: -side, span: G.span, t: 0, lastDiff: null, blipT: 0 };
    G.cur.m = makePiece(); shape(G.cur.m, at(k, G.cur.o), G.span, 0.05);
    G.ghost.visible = true; shape(G.ghost, at(k, target()), G.span, 0.035);
    G.botAt = 0.9 + Math.random() * 0.9;
    G.botErr = Math.random() < 0.75 ? perfectTol * 0.5 : perfectTol + G.span * 0.12;
    K.noise(0.22, { vol: 0.08, freq: 900, sweepTo: 2200, pan: side * 0.7 });
  }
  // a falling bit (a missed piece or a trimmed overhang)
  function fall(m, vx) { G.falling.push({ m, vx, vy: 0.05, t: 0 }); }

  function drop() {
    if (!G || !G.playing || !G.cur || G.settle > 0) return;
    const c = G.cur, prev = target(), diff = c.o - prev, pan = Math.max(-1, Math.min(1, diff / cfg.range));
    G.cur = null; G.drops++;
    const lo = Math.max(c.o, prev) - c.span / 2, hi = Math.min(c.o, prev) + c.span / 2;
    if (hi - lo <= 0.002) {   // missed: it falls
      fall(c.m, Math.sign(diff) * 0.06 * (cfg.axis === 'x' ? 1 : 0.3));
      G.lives--; G.streak = 0; K.sfx.bad(pan); K.noise(0.7, { vol: 0.16, freq: 600, sweepTo: 110, pan }); G.buzz([90, 50, 160]);
      hud();
      if (G.lives <= 0) { G.settle = 1.0; return; }
      G.ui.alert('It fell!', `${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left. Tap on the high click.`, 1.4);
      G.say(`It fell. ${G.lives} ${G.lives === 1 ? 'life' : 'lives'} left.`, false);
      G.settle = 0.9; return;
    }
    const perfect = Math.abs(diff) <= perfectTol;
    let o, span;
    if (perfect) { o = prev; span = c.span; G.streak++; G.perfects++; }
    else {
      o = (lo + hi) / 2; span = hi - lo; G.streak = 0;
      const cut = c.span - span, cutO = diff > 0 ? hi + cut / 2 : lo - cut / 2;   // the overhang breaks off and falls
      const bit = makePiece(); shape(bit, at(c.k, cutO), cut, 0.045); fall(bit, Math.sign(diff) * 0.08 * (cfg.axis === 'x' ? 1 : 0.3));
    }
    let grew = false;
    if (perfect && G.streak >= 3 && span < cfg.span - 1e-4) { span = Math.min(cfg.span, span + cfg.span * 0.15); G.streak = 0; grew = true; }
    const p = { k: c.k, o, span, m: c.m, c: at(c.k, o) };
    shape(p.m, p.c, span, 0.04 + c.k * 0.0004);
    G.stack.push(p); G.span = span; G.placed++;
    // sound: the next note of the melody, plus a bright chord for a perfect drop
    const f = scale[c.k % scale.length] * (c.k >= scale.length ? 2 : 1);
    K.tone(f, 0.55, { type: 'triangle', vol: 0.15, pan: pan * 0.6 });
    K.noise(0.08, { vol: 0.14, freq: cfg.look === 'score' ? 2400 : 380, pan: pan * 0.6 });
    if (perfect) {
      K.chord([f * 2, f * 2.52, f * 3, f * 4], 0.9, { vol: 0.05, delay: 0.05 }); G.fx.add(p.c.x, p.c.y, cfg.color || '#ffd25a', 22, 0.3); G.buzz([25, 30, 25]);
      G.ui.pop(grew ? 'Wider!' : 'Perfect!');
    } else { G.fx.add(p.c.x, p.c.y, cfg.color || '#ffd25a', 8, 0.18); G.buzz(30); K.noise(0.12, { vol: 0.1, freq: 250, pan, delay: 0.05 }); }
    placeWalker(p);
    hud();
    if (G.placed >= cfg.count) { G.ghost.visible = false; G.settle = 0.6; G.winning = true; return; }
    if (grew) G.say('Perfect streak. It grew wider.', false);
    else if (perfect && G.perfects % 3 === 1) G.say('Perfect!', false);
    else if (G.placed % 4 === 0) G.say(`${G.placed} of ${cfg.count}. ${cfg.count - G.placed} to go.`, false);
    if (!perfect && span < cfg.span * 0.45 && !G.warnedNarrow) { G.warnedNarrow = true; G.ui.alert('Getting narrow', 'Wait for the high click, then tap.', 1.5, 'blue'); G.say('Getting narrow. Wait for the high click.', false); }
    G.settle = 0.45;
  }

  function end(won) {
    G.playing = false;
    for (const p of G.stack) G.root.remove(p.m); for (const f of G.falling) G.root.remove(f.m); G.stack = []; G.falling = [];
    if (G.cur) { G.root.remove(G.cur.m); G.cur = null; }
    for (const o of [G.ghost, G.walker, G.waiter, G.goalGlow]) if (o) o.visible = false;
    const r = K.best(cfg.id + ':stack', won ? G.perfects : 0, 'higher');
    const W = won ? cfg.win : (cfg.lose || cfg.win);
    K.finale(G, { won, title: W.title, line: W.line, best: won && r.isBest,
      cells: [{ k: unit, v: `${G.placed}/${cfg.count}` }, { k: 'Perfect', v: G.perfects }, { k: 'Lives', v: G.lives }] });
  }

  return {
    title: cfg.title,
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { stack: [], falling: [], placed: 0, perfects: 0, streak: 0, drops: 0, lives: lives0, span: cfg.span, cur: null, settle: 0, winning: false, meet: false });
      G.tex = pieceTex(cfg.look, cfg.colors);
      if (!outlineTex) outlineTex = K.canvasTex(128, 128, (g, W, H) => { g.setLineDash([16, 10]); g.strokeStyle = '#fff'; g.lineWidth = 9; g.strokeRect(6, 6, W - 12, H - 12); });
      G.ghost = K.plane(outlineTex, 1, 1, { order: 12, opacity: 0.85 }); G.ghost.visible = false; G.root.add(G.ghost);
      if (cfg.goal) {
        const [x, y] = G.S.P(...cfg.goal);
        G.goalGlow = K.sprite(K.glowTex, 0.2, { color: cfg.color || '#ffd25a', additive: true, opacity: 0.55, order: 11 });
        G.goalGlow.position.set(x, y, 0.03); G.root.add(G.goalGlow);
      }
      if (cfg.waiter) {
        const [x, y] = G.S.P(...cfg.waiter.at);
        G.waiter = K.sprite(K.emojiTex(cfg.waiter.e, { ring: true, color: '#fff' }), cfg.waiter.size || 0.07, { order: 21 });
        G.waiter.position.set(x, y, 0.06); G.root.add(G.waiter);
      }
      if (cfg.walker) {
        const [x, y] = G.S.P(...cfg.walker.at);
        G.walker = K.sprite(K.emojiTex(cfg.walker.e, { ring: true, color: cfg.color || '#ffd25a' }), cfg.walker.size || 0.07, { order: 22 });
        G.walker.position.set(x, y, 0.06); G.root.add(G.walker); G.walkTo = new THREE.Vector2(x, y);
      }
      G.ui.buttons([{ label: 'Drop', icon: '▼', kind: 'red', aria: 'Drop the ' + name, press: () => drop() }]);
      hud();
      G.onGo = () => nextPiece();
      K.intro(G, { title: cfg.title, how: cfg.how });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      for (let i = G.falling.length - 1; i >= 0; i--) {   // falling bits tumble away
        const f = G.falling[i]; f.t += dt; f.vy -= 0.9 * dt;
        f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.rotation.z += f.vx * dt * 10; f.m.material.opacity = Math.max(0, 1 - f.t * 0.9);
        if (f.t > 1.2) { G.root.remove(f.m); f.m.material.dispose(); G.falling.splice(i, 1); }
      }
      if (G.walker && G.walker.visible) {
        const w = G.walker.position, e = Math.min(1, dt * (G.meet ? 2.5 : 6));
        w.x += (G.walkTo.x - w.x) * e; w.y += (G.walkTo.y - w.y) * e + Math.sin(G.t * 9) * 0.0005;
      }
      if (G.goalGlow) G.goalGlow.material.opacity = 0.4 + Math.sin(G.t * 2.5) * 0.15;
      if (!G.playing) return;
      if (G.settle > 0) {
        G.settle -= dt; if (G.settle > 0) return;
        if (G.lives <= 0) { end(false); return; }
        if (G.winning && !G.meet) {   // complete: the walker crosses to the goal, then the finale
          G.meet = true; G.settle = 1.8;
          G.ui.alert(cfg.doneAlert || 'Complete!', cfg.doneSub || '', 1.7, 'blue'); G.say(cfg.doneAlert || 'Complete!', false);
          if (cfg.goal) { const [x, y] = G.S.P(...cfg.goal); G.walkTo = new THREE.Vector2(x, y); }
          scale.slice(0, 6).forEach((f, i) => K.tone(f * 2, 0.45, { type: 'triangle', vol: 0.1, delay: i * 0.12 }));
          return;
        }
        if (G.winning) { end(true); return; }
        nextPiece(); return;
      }
      const c = G.cur; if (!c) return;
      c.t += dt;
      const speed = cfg.speed[0] + (cfg.speed[1] - cfg.speed[0]) * (G.placed / cfg.count);
      c.o += c.dir * speed * dt;
      if (c.o > cfg.range) { c.o = cfg.range; c.dir = -1; } else if (c.o < -cfg.range) { c.o = -cfg.range; c.dir = 1; }
      shape(c.m, at(c.k, c.o), c.span, 0.05);
      // by ear: blips that pan with the offset and rise to a peak when lined up; a bright click at the exact moment
      const diff = c.o - target(), close = 1 - Math.min(1, Math.abs(diff) / cfg.range), pan = Math.max(-1, Math.min(1, diff / cfg.range));
      c.blipT -= dt;
      if (c.blipT <= 0) { c.blipT = 0.11; K.tone(220 * Math.pow(2, close * close * 2), 0.07, { vol: 0.03 + close * 0.05, pan }); }
      if (c.lastDiff !== null && Math.sign(c.lastDiff) !== Math.sign(diff)) { K.tone(2093, 0.05, { type: 'square', vol: 0.06 }); K.noise(0.04, { vol: 0.12, freq: 4000, q: 2 }); G.buzz(10); }
      c.lastDiff = diff;
      // the robot: watch for a moment, then drop when it lines up
      if (G.bot && c.t > G.botAt && Math.abs(diff) <= Math.max(G.botErr, speed * dt * 0.6)) drop();
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused) return;
      if (kind === 'down') drop();
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'stack', playing: G.playing, over: G.over, placed: G.placed, count: cfg.count, perfects: G.perfects, lives: G.lives, drops: G.drops, span: +G.span.toFixed(4) }; },
    stop() { K.cleanup(G); G = null; },
  };
}
