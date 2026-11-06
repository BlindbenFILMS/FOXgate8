// LIVE THE BEAUTY (Deborah Tramentozzi): the drawn things for "Breathe the Beauty".
// Each one is painted to sit inside Deborah's painting: warm, classical colours, lit from the glowing sun at the
// centre (a soft golden rim on the side facing it), with a gentle glow behind so it reads on the busy clouds.
// No emoji: they're drawn, so they're big, clear and the same on every phone.
//   DRAW[id](g, S)        paints one thing on a S×S canvas (plain canvas 2D, used by the game and the preview)
//   thing(id, size)       → { group, opacity(v), tick(t, dt) }: a moving version for the game (size = width, board units)
import * as THREE from 'three';
import * as K from './kit.js';

export const S = 256;
// a little seeded random, so every phone draws the same tree
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// paint a shape with a soft warm glow behind it, a lit fill, and a fine golden edge on the top (sun-facing) side
function lit(g, path, fill, { glow = 'rgba(255,214,150,.6)', blur = 7, edge = 'rgba(255,236,190,.95)', ew = 3 } = {}) {
  g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = glow; path(g); g.fill(); g.restore();
  // a crescent of sunlight along the top: fill with the light colour, then the body shifted down a little over it
  g.save(); path(g); g.clip(); g.fillStyle = edge; path(g); g.fill(); g.translate(0, ew * 1.4); g.fillStyle = fill; path(g); g.fill(); g.restore();
  g.strokeStyle = 'rgba(255,236,190,.35)'; g.lineWidth = 1.5; g.lineJoin = 'round'; path(g); g.stroke();
}
const grad = (g, y0, y1, stops) => { const f = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => f.addColorStop(o, c)); return f; };

export const DRAW = {
  // 1 · the warm sun: a soft bloom with slow rays (drawn additive, so it brightens the painting's own sun)
  sun(g, W) {
    const c = W / 2;
    g.save(); g.translate(c, c);
    for (let i = 0; i < 16; i++) {
      g.rotate(Math.PI * 2 / 16);
      const r = g.createLinearGradient(0, 0, 0, -c); r.addColorStop(0, 'rgba(255,236,190,.55)'); r.addColorStop(1, 'rgba(255,200,120,0)');
      g.fillStyle = r; g.beginPath(); g.moveTo(-c * (i % 2 ? 0.05 : 0.08), 0); g.lineTo(0, -c * (i % 2 ? 0.78 : 0.98)); g.lineTo(c * (i % 2 ? 0.05 : 0.08), 0); g.fill();
    }
    g.restore();
    const r = g.createRadialGradient(c, c, 0, c, c, c); r.addColorStop(0, 'rgba(255,253,240,1)'); r.addColorStop(0.22, 'rgba(255,240,200,.95)'); r.addColorStop(0.45, 'rgba(255,205,130,.45)'); r.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = r; g.fillRect(0, 0, W, W);
  },
  // 2 · the breath ring: a golden ring with a soft inner light; it grows as you breathe in
  ring(g, W) {
    const c = W / 2;
    const r = g.createRadialGradient(c, c, c * 0.55, c, c, c * 0.95); r.addColorStop(0, 'rgba(255,225,160,0)'); r.addColorStop(0.75, 'rgba(255,225,160,.35)'); r.addColorStop(1, 'rgba(255,225,160,0)');
    g.fillStyle = r; g.fillRect(0, 0, W, W);
    g.save(); g.filter = 'blur(5px)'; g.strokeStyle = 'rgba(255,200,110,.9)'; g.lineWidth = 16; g.beginPath(); g.arc(c, c, c * 0.8, 0, Math.PI * 2); g.stroke(); g.restore();
    g.strokeStyle = '#fff3d6'; g.lineWidth = 7; g.beginPath(); g.arc(c, c, c * 0.8, 0, Math.PI * 2); g.stroke();
    // eight little beads of light around it, like a clock face you can feel through the sound
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, x = c + Math.cos(a) * c * 0.8, y = c + Math.sin(a) * c * 0.8, d = g.createRadialGradient(x, y, 0, x, y, 14); d.addColorStop(0, '#fffaf0'); d.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = d; g.fillRect(x - 14, y - 14, 28, 28); }
  },
  // 3 · a glint of light on the river
  sparkle(g, W) {
    const c = W / 2;
    const r = g.createRadialGradient(c, c, 0, c, c, c * 0.5); r.addColorStop(0, 'rgba(255,255,250,1)'); r.addColorStop(0.3, 'rgba(220,240,255,.6)'); r.addColorStop(1, 'rgba(200,230,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, W, W);
    g.fillStyle = '#ffffff';
    for (const [a, L, w] of [[0, 0.95, 0.06], [Math.PI / 2, 0.95, 0.06], [Math.PI / 4, 0.5, 0.035], [-Math.PI / 4, 0.5, 0.035]]) {
      g.save(); g.translate(c, c); g.rotate(a); g.beginPath(); g.moveTo(-c * L, 0); g.quadraticCurveTo(0, -c * w, c * L, 0); g.quadraticCurveTo(0, c * w, -c * L, 0); g.fill(); g.restore();
    }
  },
  // 4 · an autumn tree like the ones along the river: a dark trunk and a big, glowing canopy of red, orange and gold
  tree(g, W) {
    const R = rnd(7), u = W / 256;
    g.save(); g.filter = 'blur(8px)'; g.fillStyle = 'rgba(255,190,120,.45)'; g.beginPath(); g.ellipse(128 * u, 100 * u, 104 * u, 84 * u, 0, 0, Math.PI * 2); g.fill(); g.restore();
    // trunk and branches
    g.strokeStyle = '#3b2418'; g.lineCap = 'round';
    g.lineWidth = 20 * u; g.beginPath(); g.moveTo(128 * u, 250 * u); g.bezierCurveTo(124 * u, 200 * u, 134 * u, 170 * u, 128 * u, 130 * u); g.stroke();
    g.lineWidth = 8 * u; for (const [x, y] of [[80, 110], [176, 104], [110, 80], [150, 76]]) { g.beginPath(); g.moveTo(128 * u, 168 * u); g.quadraticCurveTo((128 + x) / 2 * u, 140 * u, x * u, y * u); g.stroke(); }
    g.strokeStyle = 'rgba(255,214,150,.6)'; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(122 * u, 248 * u); g.bezierCurveTo(118 * u, 200 * u, 128 * u, 170 * u, 122 * u, 132 * u); g.stroke();
    // the canopy: hundreds of small painterly dabs of leaves, darker underneath and inside, lit gold on top
    const cols = ['#4a160e', '#6f1f12', '#962a16', '#b8401d', '#d2622a', '#e48a38', '#efb256', '#f7d58c'];
    const blobs = [[128, 92, 88, 62], [74, 116, 46, 34], [184, 112, 48, 36], [128, 60, 60, 36]];
    for (let i = 0; i < 420; i++) {
      const [bx, by, rx, ry] = blobs[i % blobs.length], a = R() * Math.PI * 2, d = Math.sqrt(R()), x = bx + Math.cos(a) * d * rx, y = by + Math.sin(a) * d * ry;
      const top = 1 - (y - 30) / 130, edge = d;                                            // lighter toward the top and the outside
      const light = Math.max(0, Math.min(1, top * 0.75 + edge * 0.25 + (R() - 0.5) * 0.35 + i / 420 * 0.15)), ci = Math.round(light * (cols.length - 1));
      const r = 4 + R() * 7, rot = R() * Math.PI;
      g.fillStyle = cols[ci]; g.beginPath(); g.ellipse(x * u, y * u, r * u, r * 0.62 * u, rot, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 40; i++) { const x = 50 + R() * 156, y = 34 + R() * 60; g.fillStyle = `rgba(255,238,190,${0.3 + R() * 0.5})`; g.beginPath(); g.ellipse(x * u, y * u, (2 + R() * 3) * u, (1.4 + R() * 2) * u, R() * 3, 0, Math.PI * 2); g.fill(); }
  },
  // 5 · a swallow in flight (wings up and wings down, so it can flap)
  birdUp(g, W) { bird(g, W, 1); },
  birdDown(g, W) { bird(g, W, -1); },
  // 6 · a golden temple bell hanging from a little beam, like the bell in the temple by the river
  bell(g, W) {
    const u = W / 256;
    g.fillStyle = '#4a2d1b'; g.fillRect(40 * u, 22 * u, 176 * u, 16 * u); g.fillStyle = 'rgba(255,220,160,.7)'; g.fillRect(40 * u, 22 * u, 176 * u, 4 * u);
    g.strokeStyle = '#6b4a2e'; g.lineWidth = 6 * u; g.beginPath(); g.moveTo(128 * u, 38 * u); g.lineTo(128 * u, 58 * u); g.stroke();
    const path = p => { p.beginPath(); p.moveTo(128 * u, 56 * u); p.bezierCurveTo(88 * u, 56 * u, 84 * u, 100 * u, 80 * u, 150 * u); p.bezierCurveTo(76 * u, 190 * u, 60 * u, 200 * u, 50 * u, 212 * u); p.lineTo(206 * u, 212 * u); p.bezierCurveTo(196 * u, 200 * u, 180 * u, 190 * u, 176 * u, 150 * u); p.bezierCurveTo(172 * u, 100 * u, 168 * u, 56 * u, 128 * u, 56 * u); p.closePath(); };
    const f = g.createLinearGradient(50 * u, 0, 206 * u, 0); f.addColorStop(0, '#6e4513'); f.addColorStop(0.3, '#e7b04a'); f.addColorStop(0.45, '#fff0b8'); f.addColorStop(0.6, '#d69a34'); f.addColorStop(1, '#5c3a10');
    lit(g, path, f);
    // the lip and two bands
    g.fillStyle = '#7a4e17'; g.beginPath(); g.ellipse(128 * u, 212 * u, 80 * u, 12 * u, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,240,200,.8)'; g.lineWidth = 3 * u; g.beginPath(); g.ellipse(128 * u, 210 * u, 78 * u, 10 * u, 0, Math.PI, Math.PI * 2); g.stroke();
    g.strokeStyle = 'rgba(90,55,15,.7)'; g.lineWidth = 4 * u; for (const y of [120, 170]) { g.beginPath(); g.moveTo((y < 150 ? 84 : 78) * u, y * u); g.quadraticCurveTo(128 * u, (y + 10) * u, (y < 150 ? 172 : 178) * u, y * u); g.stroke(); }
    // the clapper
    g.fillStyle = '#3d2610'; g.beginPath(); g.arc(128 * u, 222 * u, 11 * u, 0, Math.PI * 2); g.fill();
  },
  // 7 · a blossom petal drifting on the air (the scent of flowers)
  petal(g, W) {
    const u = W / 256;
    g.save(); g.translate(128 * u, 128 * u); g.rotate(-0.5);
    const path = p => { p.beginPath(); p.moveTo(0, -96 * u); p.bezierCurveTo(70 * u, -60 * u, 64 * u, 60 * u, 0, 96 * u); p.bezierCurveTo(-64 * u, 60 * u, -70 * u, -60 * u, 0, -96 * u); p.closePath(); };
    const f = g.createRadialGradient(-20 * u, -30 * u, 0, 0, 0, 100 * u); f.addColorStop(0, '#fff2ea'); f.addColorStop(0.5, '#f7b8a6'); f.addColorStop(1, '#d9707a');
    lit(g, path, f, { glow: 'rgba(255,200,190,.6)' });
    g.strokeStyle = 'rgba(190,80,90,.45)'; g.lineWidth = 3 * u; g.beginPath(); g.moveTo(0, -80 * u); g.quadraticCurveTo(10 * u, 0, 0, 84 * u); g.stroke();
    g.restore();
  },
  // 8 · the song of the sky figures: a ribbon of golden light with notes riding on it
  song(g, W) {
    const u = W / 256;
    const wave = (p, off) => { p.beginPath(); for (let x = 16; x <= 240; x += 4) { const y = 128 + Math.sin(x / 34 + off) * 40 * Math.sin(x / 256 * Math.PI); x === 16 ? p.moveTo(x * u, y * u) : p.lineTo(x * u, y * u); } };
    g.lineCap = 'round';
    g.save(); g.filter = 'blur(6px)'; g.strokeStyle = 'rgba(255,205,120,.9)'; g.lineWidth = 22 * u; wave(g, 0); g.stroke(); g.restore();
    const f = g.createLinearGradient(0, 0, W, 0); f.addColorStop(0, 'rgba(255,240,200,0)'); f.addColorStop(0.2, '#ffe6a8'); f.addColorStop(0.5, '#fffaf0'); f.addColorStop(0.8, '#ffe6a8'); f.addColorStop(1, 'rgba(255,240,200,0)');
    g.strokeStyle = f; g.lineWidth = 8 * u; wave(g, 0); g.stroke();
    g.strokeStyle = 'rgba(255,230,170,.55)'; g.lineWidth = 3 * u; wave(g, 1.2); g.stroke();
    // two drawn notes (heads + stems), gold with a pale edge
    for (const [x, s] of [[78, 1], [176, 0.85]]) {
      const y = 128 + Math.sin(x / 34) * 40 * Math.sin(x / 256 * Math.PI) - 34;
      g.save(); g.translate(x * u, y * u); g.scale(s, s);
      g.fillStyle = '#f6c65a'; g.strokeStyle = '#fff6dc'; g.lineWidth = 2.5 * u;
      g.beginPath(); g.ellipse(0, 0, 13 * u, 9.5 * u, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillRect(10 * u, -46 * u, 4.5 * u, 46 * u);
      g.beginPath(); g.moveTo(14 * u, -46 * u); g.quadraticCurveTo(32 * u, -36 * u, 26 * u, -18 * u); g.quadraticCurveTo(26 * u, -30 * u, 14 * u, -34 * u); g.fill();
      g.restore();
    }
  },
};
function bird(g, W, up) {
  const u = W / 256;
  // seen from below, wings spread wide like a gull or swallow in the sky: up = wingtips raised, down = wings sweeping low
  const tip = up > 0 ? 70 : 168, mid = up > 0 ? 96 : 150;
  const shape = p => {
    p.beginPath();
    p.moveTo(128 * u, 104 * u);                                                                   // the head
    p.quadraticCurveTo(100 * u, (mid - 4) * u, 72 * u, (mid - 6) * u);                             // left wing, top edge
    p.quadraticCurveTo(40 * u, (mid + (up > 0 ? -10 : 0)) * u, 10 * u, tip * u);                   // to the left wingtip
    p.quadraticCurveTo(46 * u, (mid + 16) * u, 80 * u, (mid + 14) * u);                            // back along the trailing edge
    p.quadraticCurveTo(106 * u, (mid + 12) * u, 118 * u, 140 * u);
    p.lineTo(104 * u, 176 * u); p.lineTo(128 * u, 156 * u); p.lineTo(152 * u, 176 * u); p.lineTo(138 * u, 140 * u);   // the forked tail
    p.quadraticCurveTo(150 * u, (mid + 12) * u, 176 * u, (mid + 14) * u);
    p.quadraticCurveTo(210 * u, (mid + 16) * u, 246 * u, tip * u);                                 // the right wingtip
    p.quadraticCurveTo(216 * u, (mid + (up > 0 ? -10 : 0)) * u, 184 * u, (mid - 6) * u);
    p.quadraticCurveTo(156 * u, (mid - 4) * u, 128 * u, 104 * u);
    p.closePath();
  };
  lit(g, shape, grad(g, 70, 176, [[0, '#7a4e36'], [0.5, '#3a2419'], [1, '#1d120d']]), { ew: 3 });
  g.fillStyle = '#e98a5a'; g.beginPath(); g.ellipse(128 * u, 116 * u, 7 * u, 9 * u, 0, 0, Math.PI * 2); g.fill();   // a warm throat
}

/* ───────────── the moving versions, for the game ───────────── */
const cache = {};
export function texFor(id) { return cache[id] || (cache[id] = K.canvasTex(S, S, g => DRAW[id](g, S))); }

export function thing(id, size) {
  const group = new THREE.Group(), parts = [];
  const add = (tid, w, x = 0, y = 0, { order = 20, additive = false, color } = {}) => {
    const sp = K.sprite(texFor(tid), w, { order, additive, color }); sp.position.set(x, y, 0); group.add(sp); parts.push(sp); return sp;
  };
  const u = size;
  let tick = () => {};
  if (id === 'sun') {
    const a = add('sun', u, 0, 0, { additive: true }), b = add('sun', u * 0.7, 0, 0, { additive: true });
    tick = t => { a.material.rotation = t * 0.05; b.material.rotation = -t * 0.08; const p = 1 + Math.sin(t * 1.1) * 0.04; a.scale.set(u * p, u * p, 1); };
  } else if (id === 'tree') {
    const tr = add('tree', u);
    tick = t => { tr.material.rotation = Math.sin(t * 1.3) * 0.035 + Math.sin(t * 2.9) * 0.012; };
  } else if (id === 'bird') {
    const a = add('birdUp', u), b = add('birdDown', u);
    tick = t => { const up = Math.sin(t * 9) > 0; a.userData.k = up ? 1 : 0; b.userData.k = up ? 0 : 1; group.position.y = (group.userData.y || 0) + Math.sin(t * 9) * u * 0.04; };
  } else if (id === 'bell') {
    const bl = add('bell', u);
    tick = t => { bl.material.rotation = Math.sin(t * 2.2) * 0.12 * (group.userData.swing ?? 1); };
  } else if (id === 'sparkle') {
    const s = add('sparkle', u, 0, 0, { additive: true });
    tick = t => { const k = Math.max(0, Math.sin(t * 2.3 + (group.userData.ph || 0))); s.userData.k = k; s.scale.set(u * (0.6 + k * 0.5), u * (0.6 + k * 0.5), 1); s.material.rotation = t * 0.3; };
  } else if (id === 'petal') {
    const p = add('petal', u);
    tick = t => { p.material.rotation = t * 1.4 + (group.userData.ph || 0); p.scale.set(u * (0.6 + 0.4 * Math.abs(Math.cos(t * 2 + (group.userData.ph || 0)))), u, 1); };
  } else if (id === 'song') {
    const s = add('song', u, 0, 0, { additive: true });
    tick = t => { s.scale.set(u, u * (0.85 + Math.sin(t * 2) * 0.15), 1); };
  } else if (id === 'ring') {
    add('ring', u, 0, 0, { additive: true });
  }
  let op = 0;
  return {
    group,
    opacity(v) { op = v; },
    tick(t, dt) { tick(t, dt); for (const p of parts) { const k = p.userData.k == null ? 1 : p.userData.k; p.material.opacity = op * k; } },
  };
}
