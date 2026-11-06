// HOW, NOT WHO: drawn props for First Flight, in Doreen's quilled-paper style (rolled paper coils with dark edges).
// Every draw function paints into a square canvas context of size s, centred. Pure canvas 2D, no images.

// A tight paper coil (spiral) — the basic quilling shape.
function coil(c, x, y, r, turns, col, w) {
  c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath();
  const N = 60 * turns;
  for (let i = 0; i <= N; i++) { const t = i / N, a = t * turns * Math.PI * 2, rr = r * t; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.stroke(); c.restore();
}

// Petal outline paths, pointing up from (0,0), length L, width W.
function petalPath(c, shape, L, W) {
  c.beginPath();
  if (shape === 'round') { c.ellipse(0, -L / 2, W / 2, L / 2, 0, 0, Math.PI * 2); }
  else if (shape === 'pointed') { c.moveTo(0, 0); c.bezierCurveTo(W * 0.7, -L * 0.3, W * 0.4, -L * 0.8, 0, -L); c.bezierCurveTo(-W * 0.4, -L * 0.8, -W * 0.7, -L * 0.3, 0, 0); }
  else if (shape === 'heart') { c.moveTo(0, 0); c.bezierCurveTo(W * 0.9, -L * 0.2, W * 0.75, -L * 1.05, 0.0, -L * 0.82); c.bezierCurveTo(-W * 0.75, -L * 1.05, -W * 0.9, -L * 0.2, 0, 0); }
  else { c.moveTo(0, 0); c.bezierCurveTo(W * 0.75, -L * 0.25, W * 0.55, -L, 0, -L); c.bezierCurveTo(-W * 0.55, -L, -W * 0.75, -L * 0.25, 0, 0); } // tear
  c.closePath();
}

// One quilled petal: filled paper, dark edge, a loose coil inside.
function petal(c, shape, L, W, f) {
  petalPath(c, shape, L, W);
  c.fillStyle = f.color; c.fill();
  c.save(); c.clip(); coil(c, 0, -L * 0.55, Math.min(W, L) * 0.42, 3.2, f.coil, Math.max(1.5, L * 0.035)); c.restore();
  petalPath(c, shape, L, W); c.strokeStyle = f.edge; c.lineWidth = Math.max(2.5, L * 0.07); c.lineJoin = 'round'; c.stroke();
}

function stem(c, s, sway) {
  const g = '#3f8f3a', e = '#1f4f22';
  c.save(); c.strokeStyle = e; c.lineWidth = s * 0.05; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, s * 0.48); c.quadraticCurveTo(s * 0.06 * sway, s * 0.2, 0, -s * 0.02); c.stroke();
  c.strokeStyle = g; c.lineWidth = s * 0.028; c.stroke();
  // two leaves
  for (const [side, y] of [[1, 0.3], [-1, 0.2]]) {
    c.save(); c.translate(0, s * y); c.rotate(side * 1.0); petal(c, 'tear', s * 0.2, s * 0.11, { color: '#62b04c', coil: '#a8dc7a', edge: e }); c.restore();
  }
  c.restore();
}

function centre(c, r, col, ring) {
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fillStyle = col; c.fill();
  coil(c, 0, 0, r * 0.92, 4.5, ring, Math.max(1.5, r * 0.12));
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.strokeStyle = '#2a1a0a'; c.lineWidth = Math.max(2, r * 0.16); c.stroke();
}

// Radial flower: n petals around a coil centre.
function radial(c, s, f) {
  const n = f.n, L = s * f.L, W = s * f.W;
  if (f.back) { // second ring behind, offset
    for (let i = 0; i < n; i++) { c.save(); c.rotate((i + 0.5) / n * Math.PI * 2); petal(c, f.shape, L * 0.9, W, f.back); c.restore(); }
  }
  for (let i = 0; i < n; i++) { c.save(); c.rotate(i / n * Math.PI * 2); petal(c, f.shape, L, W, f); c.restore(); }
  centre(c, s * f.cR, f.cCol, f.cRing);
}

// The 8 flowers. Each has a name (spoken), a note (its hum, Hz), and a draw(c, s, open) with open 0..1 (bud → bloom).
export const FLOWERS = [
  { id: 'sunflower', name: 'A sunflower', hz: 523.25 },
  { id: 'poppy', name: 'A poppy', hz: 587.33 },
  { id: 'daisy', name: 'A daisy', hz: 659.25 },
  { id: 'tulip', name: 'A tulip', hz: 783.99 },
  { id: 'bluebell', name: 'A bluebell', hz: 880.0 },
  { id: 'violet', name: 'A violet', hz: 1046.5 },
  { id: 'lily', name: 'A lily', hz: 1174.66 },
  { id: 'rose', name: 'A rose', hz: 1318.51 },
];

const SPEC = {
  sunflower: { n: 14, shape: 'pointed', L: 0.3, W: 0.11, color: '#ffc21a', coil: '#fff0a0', edge: '#8a5a00', back: { color: '#f0a000', coil: '#ffd860', edge: '#7a4a00' }, cR: 0.13, cCol: '#6b3a12', cRing: '#c98a3a' },
  poppy: { n: 5, shape: 'heart', L: 0.3, W: 0.3, color: '#f2452e', coil: '#ffb09a', edge: '#7a1408', cR: 0.08, cCol: '#1c1c22', cRing: '#6a6a80' },
  daisy: { n: 12, shape: 'round', L: 0.3, W: 0.09, color: '#ffffff', coil: '#c8d4ff', edge: '#3a4470', cR: 0.1, cCol: '#ffcc22', cRing: '#a06800' },
  violet: { n: 5, shape: 'round', L: 0.26, W: 0.2, color: '#8a4fd8', coil: '#d6b8ff', edge: '#2e0f62', cR: 0.06, cCol: '#ffe04a', cRing: '#a07a00' },
  lily: { n: 6, shape: 'pointed', L: 0.36, W: 0.15, color: '#ff8a1e', coil: '#ffd09a', edge: '#7a3300', cR: 0.06, cCol: '#a0381a', cRing: '#ff6a3a' },
};

export function drawFlower(c, s, id, open = 1, sway = 0) {
  c.save(); c.translate(s / 2, s * 0.5);
  stem(c, s, sway);
  c.translate(0, -s * 0.06);
  const k = 0.35 + 0.65 * open; c.scale(k, k);
  if (SPEC[id]) radial(c, s, SPEC[id]);
  else if (id === 'tulip') {
    const f = { color: '#e8307a', coil: '#ffaad0', edge: '#6a0a32' };
    for (const [r, l] of [[-0.45, 0.3], [0.45, 0.3], [0, 0.34]]) { c.save(); c.translate(0, s * 0.08); c.rotate(r); petal(c, 'tear', s * l, s * 0.2, f); c.restore(); }
  } else if (id === 'bluebell') {
    // an arching stem with three bells hanging down, each a paper cup with a scalloped lip
    c.save(); c.strokeStyle = '#1f4f22'; c.lineWidth = s * 0.035; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, s * 0.06); c.quadraticCurveTo(s * 0.02, -s * 0.3, s * 0.26, -s * 0.2); c.stroke();
    c.strokeStyle = '#3f8f3a'; c.lineWidth = s * 0.018; c.stroke(); c.restore();
    for (const [x, y, k] of [[0.02, -0.12, 0.95], [0.12, -0.24, 1.05], [0.25, -0.18, 0.85]]) {
      c.save(); c.translate(s * x, s * y); c.scale(k, k);
      const w = s * 0.11, h = s * 0.16;
      const path = () => { c.beginPath(); c.moveTo(-w * 0.5, 0); c.quadraticCurveTo(-w * 0.55, h * 0.75, -w, h);
        for (let i = 0; i < 4; i++) { const x0 = -w + i * w / 2; c.quadraticCurveTo(x0 + w / 4, h * 0.82, x0 + w / 2, h); }
        c.quadraticCurveTo(w * 0.55, h * 0.75, w * 0.5, 0); c.quadraticCurveTo(0, -h * 0.18, -w * 0.5, 0); c.closePath(); };
      path(); c.fillStyle = '#2f7cf0'; c.fill();
      c.save(); c.clip(); coil(c, 0, h * 0.5, w * 0.6, 3, '#a8ccff', s * 0.01); c.restore();
      path(); c.strokeStyle = '#0b2a66'; c.lineWidth = s * 0.02; c.lineJoin = 'round'; c.stroke();
      c.restore();
    }
  } else if (id === 'rose') { // a quilled rose IS a coil: a loose wide spiral of red paper
    c.beginPath(); c.arc(0, 0, s * 0.24, 0, Math.PI * 2); c.fillStyle = '#d81c3c'; c.fill();
    coil(c, 0, 0, s * 0.23, 4, '#7a0016', s * 0.03); coil(c, s * 0.01, 0, s * 0.2, 4, '#ff7a8c', s * 0.012);
    c.beginPath(); c.arc(0, 0, s * 0.24, 0, Math.PI * 2); c.strokeStyle = '#5a0010'; c.lineWidth = s * 0.025; c.stroke();
  }
  c.restore();
}

// The thing to dodge: a grey rain cloud, coiled, with three drops.
export function drawCloud(c, s, t = 0) {
  c.save(); c.translate(s / 2, s * 0.42);
  const f = { color: '#8a94a6', coil: '#d2d8e2', edge: '#2a3040' };
  for (const [x, y, r] of [[-0.2, 0.04, 0.15], [0.2, 0.04, 0.15], [0, -0.06, 0.2]]) {
    c.beginPath(); c.arc(s * x, s * y, s * r, 0, Math.PI * 2); c.fillStyle = f.color; c.fill();
    coil(c, s * x, s * y, s * r * 0.85, 3, f.coil, s * 0.012);
    c.beginPath(); c.arc(s * x, s * y, s * r, 0, Math.PI * 2); c.strokeStyle = f.edge; c.lineWidth = s * 0.025; c.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const y = s * (0.24 + ((t * 0.6 + i * 0.33) % 1) * 0.18);
    c.save(); c.translate(s * (-0.16 + i * 0.16), y); c.rotate(Math.PI);
    petal(c, 'tear', s * 0.1, s * 0.07, { color: '#4aa0ff', coil: '#cfe6ff', edge: '#0b3a7a' }); c.restore();
  }
  c.restore();
}

// Nectar sparkle that bursts when she drinks: a ring of tiny gold coils.
export function drawSparkle(c, s) {
  c.save(); c.translate(s / 2, s / 2);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; coil(c, Math.cos(a) * s * 0.34, Math.sin(a) * s * 0.34, s * 0.07, 2.5, i % 2 ? '#ffc21a' : '#ffffff', s * 0.018); }
  c.restore();
}
