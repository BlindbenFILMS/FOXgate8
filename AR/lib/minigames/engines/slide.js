// SLIDE: the sliding mosaic. The painting is cut into a 3 × 3 mosaic with one piece missing, and the pieces are
// shuffled. Slide pieces into the gap until the painting is whole again; then the missing piece drops in and the
// painting comes alive. Tap a piece next to the gap to slide it, or use the big arrow buttons (each moves a piece that way
// into the gap, like a classic sliding puzzle). Hold Peek to see the finished painting for a moment.
// By ear: every piece has its own note. A piece that lands in its right place plays its note with a sparkle and a buzz,
// slides whoosh from where they are, a tap that can't move bumps, and the score panel and voice keep count.
// Works for any painting: it uses the painting's own photo (work.image), so it needs no settings.
//
// cfg = { id, line (the artist's words for the end), size: 3 }
import * as THREE from 'three';
import * as K from '../kit.js';

let outlineTex = null;

export function slideGame(cfg = {}) {
  let G = null;
  const n = Math.max(2, Math.min(5, cfg.size || 3)), N = n * n, GAP = N - 1;   // the last piece (bottom right) is the missing one
  const notes = K.SCALES.major;

  const col = i => i % n, row = i => Math.floor(i / n);
  function nbrs(i) { const r = row(i), c = col(i), o = []; if (r > 0) o.push(i - n); if (r < n - 1) o.push(i + n); if (c > 0) o.push(i - 1); if (c < n - 1) o.push(i + 1); return o; }
  // board position of a cell's centre
  function cellXY(i) { const tw = 1 / n, th = G.h / n; return new THREE.Vector2(-0.5 + (col(i) + 0.5) * tw, G.h / 2 - (row(i) + 0.5) * th); }
  const inPlace = () => G.tiles.reduce((k, t, i) => k + (t === i && t !== GAP ? 1 : 0), 0);
  const solved = () => G.tiles.every((t, i) => t === i);
  const panOf = i => (col(i) - (n - 1) / 2) / ((n - 1) / 2 || 1) * 0.8;

  // a piece: the right crop of the painting's photo
  function makeTile(id) {
    const geo = new THREE.PlaneGeometry(1 / n * 0.965, G.h / n * 0.965), uv = geo.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, (col(id) + uv.getX(k)) / n, (n - 1 - row(id) + uv.getY(k)) / n);
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: G.tex, transparent: true, depthWrite: false, color: G.tex ? 0xffffff : 0x555555 }));
    m.renderOrder = 14; G.root.add(m); return m;
  }
  function place(id, i, z = 0.04) { const p = cellXY(i); G.meshes[id].position.set(p.x, p.y, z); }

  function hud() {
    G.ui.panel('Sliding mosaic', `${inPlace()}<small>of ${N - 1} in place</small>`, { segs: [inPlace(), N - 1], sub: `Moves ${G.moves}` });
  }
  function gapMark() { const p = cellXY(G.tiles.indexOf(GAP)); G.gapM.position.set(p.x, p.y, 0.045); }

  // slide the piece at cell `pos` into the gap (if it's next to the gap)
  function slideFrom(pos, byBot = false) {
    if (!G || !G.playing || G.settle > 0) return false;
    const b = G.tiles.indexOf(GAP);
    if (pos < 0 || pos >= N || !nbrs(b).includes(pos)) { K.tone(140, 0.12, { type: 'square', vol: 0.06 }); G.buzz(15); return false; }
    const id = G.tiles[pos]; G.tiles[b] = id; G.tiles[pos] = GAP; G.moves++;
    if (!byBot) G.history.push(b);   // to undo this move, slide from where the piece went... recorded as the gap's old cell
    G.anim.push({ id, from: cellXY(pos), to: cellXY(b), t: 0 });
    const pan = panOf(b);
    if (id === b) {   // it landed in its right place
      const f = notes[id % notes.length]; K.tone(f, 0.5, { type: 'triangle', vol: 0.15, pan }); K.tone(f * 2, 0.3, { vol: 0.05, pan, delay: 0.04 });
      const p = cellXY(b); G.fx.add(p.x, p.y, '#ffd25a', 16, 0.22); G.buzz([20, 30, 20]);
      const k = inPlace(); if (k > G.bestIn) { G.bestIn = k; if (!solved()) G.say(k === N - 2 ? 'One more piece!' : `${k} of ${N - 1} in place.`, false); }
    } else { K.noise(0.16, { vol: 0.12, freq: 700, sweepTo: 1600, pan, q: 0.9 }); G.buzz(10); }
    gapMark(); hud();
    if (solved()) { G.settle = 0.5; G.winning = true; G.gapM.visible = false; }
    return true;
  }
  // arrow buttons move a piece in the arrow's direction into the gap: Left moves the piece on the gap's right, and so on
  function arrow(dc, dr) {
    const b = G.tiles.indexOf(GAP), c = col(b) - dc, r = row(b) - dr;
    if (c < 0 || c >= n || r < 0 || r >= n) { K.tone(140, 0.12, { type: 'square', vol: 0.06, pan: dc * 0.8 }); G.buzz(15); G.say('No piece can move that way.', false); return; }
    slideFrom(r * n + c);
  }

  function end() {
    G.playing = false; G.ui.buttons([]);
    const t = Math.round(G.t - G.t0), r = K.best((cfg.id || 'slide') + ':slide', G.moves, 'lower');
    // the missing piece drops in and the seams close: the whole painting, then its animation (the finale)
    G.done = true; if (G.peekM.material.map) G.peekM.visible = true; G.gapM.visible = false;
    const p = cellXY(GAP); G.fx.add(p.x, p.y, '#ffd25a', 30, 0.35);
    K.finale(G, { won: true, title: 'The painting is whole', line: cfg.line || (G.work ? `${G.work.title} by ${G.work.artist}.` : ''), best: r.isBest,
      cells: [{ k: 'Moves', v: G.moves }, { k: 'Time', v: Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0') }] });
  }

  return {
    title: 'Sliding mosaic',
    start(ctx) {
      if (G) this.stop();
      G = K.makeBase(ctx);
      Object.assign(G, { tiles: [], meshes: [], anim: [], history: [], moves: 0, bestIn: 0, settle: 0, winning: false, peek: 0, t0: 0, tex: null });
      // the dark card behind the mosaic hides the real painting, so only the pieces show
      const back = new THREE.Mesh(new THREE.PlaneGeometry(1.02, G.h + 0.02), new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.94, depthWrite: false }));
      back.position.z = 0.03; back.renderOrder = 12; G.root.add(back);
      // the painting's own photo, cut into pieces
      const src = ctx.work && ctx.work.image;
      if (src) new THREE.TextureLoader().load(src, t => { t.colorSpace = THREE.SRGBColorSpace; G && (G.tex = t, G.meshes.forEach(m => { if (m) { m.material.map = t; m.material.color.set(0xffffff); m.material.needsUpdate = true; } }), G.peekM && (G.peekM.material.map = t, G.peekM.material.needsUpdate = true)); });
      for (let i = 0; i < N; i++) G.tiles.push(i);
      // shuffle with real slides from the solved picture, so it can always be solved (about a minute to put back)
      let b = GAP, prev = -1;
      const steps = cfg.shuffle || (n === 3 ? 22 : n * n * 4);
      for (let k = 0; k < steps || G.tiles.every((t, i) => t === i); k++) {
        const opts = nbrs(b).filter(x => x !== prev), nb = opts[Math.floor(Math.random() * opts.length)];
        G.tiles[b] = G.tiles[nb]; G.tiles[nb] = GAP; prev = b; b = nb; G.history.push(prev);
        if (k > 400) break;
      }
      for (let i = 0; i < N; i++) G.meshes[i] = G.tiles.indexOf(i) >= 0 && i !== GAP ? makeTile(i) : null;
      G.tiles.forEach((id, i) => { if (id !== GAP) place(id, i); });
      if (!outlineTex) outlineTex = K.canvasTex(128, 128, (g, W, H) => { g.setLineDash([16, 10]); g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(8, 8, W - 16, H - 16); });
      G.gapM = K.plane(outlineTex, 1 / n * 0.9, G.h / n * 0.9, { order: 15, opacity: 0.9 }); G.root.add(G.gapM); gapMark();
      G.peekM = K.plane(null, 1, G.h, { order: 40, opacity: 0 }); G.peekM.position.z = 0.08; G.peekM.visible = false; G.root.add(G.peekM);
      if (G.tex) G.peekM.material.map = G.tex;
      G.ui.buttons([
        { label: '◀', aria: 'Move a piece left into the gap', press: () => arrow(-1, 0) },
        { label: '▲', aria: 'Move a piece up into the gap', press: () => arrow(0, -1) },
        { label: '▼', aria: 'Move a piece down into the gap', press: () => arrow(0, 1) },
        { label: '▶', aria: 'Move a piece right into the gap', press: () => arrow(1, 0) },
        { label: 'Peek', kind: 'red', aria: 'Hold to see the finished painting', press: () => { G.peek = 1; if (G.peekM.material.map) G.peekM.visible = true; G.say(`${inPlace()} of ${N - 1} pieces are in place.`, false); }, release: () => { G.peek = 0; } },
      ]);
      hud();
      G.onGo = () => { G.t0 = G.t; G.botT = 0.6; };
      K.intro(G, { title: 'Sliding mosaic', how: 'Slide the pieces back into place. Tap a piece next to the gap, or use the arrows. Each piece sings its note when it is home.',
        say: 'Sliding mosaic. The painting is in pieces. Slide them back into place. Tap a piece next to the gap, or use the arrow buttons. Each piece sings its note when it is home. Hold Peek to see the finished painting.' });
    },
    update(dt) {
      if (!G || G.paused) return;
      G.t += dt; G.ui.update(dt); G.fx.update(dt); K.introUpdate(G, dt); K.finaleUpdate(G, dt);
      for (let i = G.anim.length - 1; i >= 0; i--) {   // pieces glide into the gap
        const a = G.anim[i]; a.t = Math.min(1, a.t + dt / 0.16); const e = 1 - Math.pow(1 - a.t, 3), m = G.meshes[a.id];
        if (m) m.position.set(a.from.x + (a.to.x - a.from.x) * e, a.from.y + (a.to.y - a.from.y) * e, 0.042);
        if (a.t >= 1) { if (m) m.position.z = 0.04; G.anim.splice(i, 1); }
      }
      if (G.gapM.visible) G.gapM.material.opacity = 0.55 + Math.sin(G.t * 4) * 0.3;
      const want = G.done ? 1 : G.peek ? 0.92 : 0; G.peekM.material.opacity += (want - G.peekM.material.opacity) * Math.min(1, dt * 10);
      if (!G.peek && !G.done && G.peekM.material.opacity < 0.02) G.peekM.visible = false;
      if (!G.playing) return;
      if (G.settle > 0) { G.settle -= dt; if (G.settle <= 0 && G.winning) end(); return; }
      // the robot: undo the shuffle, one slide at a time
      if (G.bot && G.history.length) { G.botT -= dt; if (G.botT <= 0) { G.botT = 0.25; const to = G.history.pop(); slideFrom(to, true); } }
    },
    pointer(kind, ev) {
      if (!G || !G.playing || G.paused || kind !== 'down') return;
      const p = G.S.toBoard(ev, G.root); if (!p || p.u < 0 || p.u > 1 || p.v < 0 || p.v > 1) return;
      const c = Math.min(n - 1, Math.floor(p.u * n)), r = Math.min(n - 1, Math.floor(p.v * n));
      slideFrom(r * n + c);
    },
    pause() { if (G) G.paused = true; },
    resume() { if (G) G.paused = false; },
    get over() { return !!(G && G.over); },
    get debug() { return G && { engine: 'slide', playing: G.playing, over: G.over, inPlace: inPlace(), moves: G.moves, tiles: G.tiles.join(','), textured: !!G.tex }; },
    stop() { K.cleanup(G); G = null; },
  };
}
