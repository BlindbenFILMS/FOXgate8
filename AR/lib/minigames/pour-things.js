// POUR IN THE LOVE (Steven McCoy): the drawn props.
// Everything is drawn in code, lit like the painting: molten yellow-to-red love dripping into a black heart on a starry sky.
//   thingCanvas(kind, size) → a square canvas: 'drop' | 'splash' | 'heartglow' | 'wave' | 'grey' | 'target'
// Used by pour-love.js. No emoji, no image files.

function teardrop(g, S, cx, cy, r) {
  // a round-bottomed drop with a pointed top
  g.beginPath();
  g.moveTo(cx, cy - r * 2.05);
  g.bezierCurveTo(cx + r * 0.35, cy - r * 1.35, cx + r, cy - r * 0.75, cx + r, cy);
  g.arc(cx, cy, r, 0, Math.PI, false);
  g.bezierCurveTo(cx - r, cy - r * 0.75, cx - r * 0.35, cy - r * 1.35, cx, cy - r * 2.05);
  g.closePath();
}

function drop(g, S) {
  const cx = S / 2, cy = S * 0.62, r = S * 0.2;
  // a warm halo so it reads on the black sky
  const halo = g.createRadialGradient(cx, cy - r * 0.5, 0, cx, cy - r * 0.5, S * 0.5);
  halo.addColorStop(0, 'rgba(255,190,80,.55)'); halo.addColorStop(0.5, 'rgba(255,120,40,.18)'); halo.addColorStop(1, 'rgba(255,90,30,0)');
  g.fillStyle = halo; g.fillRect(0, 0, S, S);
  // a thin dark rim, then the molten body: yellow at the top melting into red at the bottom, like the painting's drips
  teardrop(g, S, cx, cy, r * 1.08); g.fillStyle = 'rgba(40,8,0,.65)'; g.fill();
  const body = g.createLinearGradient(0, cy - r * 2, 0, cy + r);
  body.addColorStop(0, '#fff2a8'); body.addColorStop(0.35, '#ffc23a'); body.addColorStop(0.7, '#ff6a1f'); body.addColorStop(1, '#d81e3a');
  teardrop(g, S, cx, cy, r); g.fillStyle = body; g.fill();
  // a soft inner glow and a bright highlight
  const inner = g.createRadialGradient(cx - r * 0.25, cy - r * 0.2, 0, cx, cy, r * 1.1);
  inner.addColorStop(0, 'rgba(255,255,220,.75)'); inner.addColorStop(0.5, 'rgba(255,220,120,.15)'); inner.addColorStop(1, 'rgba(255,200,100,0)');
  teardrop(g, S, cx, cy, r); g.fillStyle = inner; g.fill();
  g.beginPath(); g.ellipse(cx - r * 0.42, cy - r * 0.35, r * 0.16, r * 0.34, -0.35, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
  // a tiny heart reflected inside the drop
  const hx = cx + r * 0.12, hy = cy + r * 0.22, hs = r * 0.3;
  g.beginPath(); g.moveTo(hx, hy + hs * 0.8);
  g.bezierCurveTo(hx - hs * 1.3, hy, hx - hs * 0.7, hy - hs * 0.95, hx, hy - hs * 0.35);
  g.bezierCurveTo(hx + hs * 0.7, hy - hs * 0.95, hx + hs * 1.3, hy, hx, hy + hs * 0.8);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fill();
}

function splash(g, S) {
  // a crown of rainbow droplets flying out, for a caught drop
  const cx = S / 2, cy = S * 0.55;
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, S * 0.45);
  glow.addColorStop(0, 'rgba(255,240,190,.9)'); glow.addColorStop(0.25, 'rgba(255,170,80,.45)'); glow.addColorStop(1, 'rgba(255,120,60,0)');
  g.fillStyle = glow; g.fillRect(0, 0, S, S);
  const cols = ['#ffd84a', '#ff8a2a', '#ff3d5a', '#c45cff', '#3fa8ff', '#3fe0c0', '#9df05a'];
  // the back half of the crown: a molten bowl seen from the side
  const bowl = g.createLinearGradient(0, cy - S * 0.08, 0, cy + S * 0.08); bowl.addColorStop(0, '#ffe58a'); bowl.addColorStop(1, '#ff5a2a');
  g.fillStyle = bowl; g.beginPath(); g.ellipse(cx, cy + S * 0.05, S * 0.22, S * 0.07, 0, 0, Math.PI * 2); g.fill();
  // tendrils of liquid rising up and curling out, each ending in a round bead
  for (let i = 0; i < 11; i++) {
    const k = i / 10, a = -Math.PI * (0.08 + 0.84 * k), h = S * (0.18 + Math.sin(k * Math.PI) * 0.14);
    const bx = cx + Math.cos(a) * S * 0.2, by = cy + S * 0.04 + Math.sin(a) * S * 0.06;   // its foot on the rim
    const tx = cx + Math.cos(a) * S * (0.3 + 0.04 * (i % 2)), ty = by - h;                 // its tip, out and up
    const col = cols[i % cols.length], w = S * (0.03 + 0.01 * Math.sin(k * Math.PI));
    g.fillStyle = col; g.beginPath();
    g.moveTo(bx - w, by); g.quadraticCurveTo((bx + tx) / 2 - w * 0.6, (by + ty) / 2, tx, ty + w * 0.5);
    g.quadraticCurveTo((bx + tx) / 2 + w * 0.6, (by + ty) / 2, bx + w, by); g.closePath(); g.fill();
    const r = w * 0.95; g.beginPath(); g.arc(tx, ty - r * 0.2, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(tx - r * 0.3, ty - r * 0.5, r * 0.35, 0, Math.PI * 2); g.fill();
  }
  // the front lip of the crown, bright and glossy
  g.strokeStyle = '#fff6c8'; g.lineWidth = S * 0.022; g.beginPath(); g.ellipse(cx, cy + S * 0.05, S * 0.22, S * 0.07, 0, 0.05 * Math.PI, 0.95 * Math.PI); g.stroke();
  // a few loose beads flying highest
  for (const [x, y, r, c] of [[0.5, 0.12, 0.022, 0], [0.36, 0.2, 0.016, 2], [0.64, 0.18, 0.018, 4], [0.22, 0.32, 0.013, 5], [0.79, 0.3, 0.014, 1]]) {
    g.fillStyle = cols[c]; g.beginPath(); g.arc(S * x, S * y, S * r, 0, Math.PI * 2); g.fill();
  }
}

function target(g, S) {
  // where the drop lands: a golden ring with four little marks (one, two, three, four) and a heart at the top
  const c = S / 2, R = S * 0.36;
  const gl = g.createRadialGradient(c, c, R * 0.7, c, c, S * 0.5); gl.addColorStop(0, 'rgba(255,210,90,0)'); gl.addColorStop(0.35, 'rgba(255,210,90,.45)'); gl.addColorStop(1, 'rgba(255,210,90,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#ffe08a'; g.lineWidth = S * 0.035; g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = S * 0.012; g.beginPath(); g.arc(c, c, R, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.strokeStyle = '#fff3c0'; g.lineWidth = S * 0.025; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4; g.beginPath(); g.moveTo(c + Math.cos(a) * R * 0.78, c + Math.sin(a) * R * 0.78); g.lineTo(c + Math.cos(a) * R * 0.9, c + Math.sin(a) * R * 0.9); g.stroke(); }
  heartPath(g, c, c - R, S * 0.16); g.fillStyle = '#ff4f7a'; g.fill(); g.lineWidth = S * 0.012; g.strokeStyle = '#fff3c0'; g.stroke();
}

function heartPath(g, cx, cy, s) {
  g.beginPath(); g.moveTo(cx, cy + 0.42 * s);
  g.bezierCurveTo(cx - 0.62 * s, cy - 0.05 * s, cx - 0.38 * s, cy - 0.52 * s, cx, cy - 0.22 * s);
  g.bezierCurveTo(cx + 0.38 * s, cy - 0.52 * s, cx + 0.62 * s, cy - 0.05 * s, cx, cy + 0.42 * s); g.closePath();
}

function heartglow(g, S) {
  // a soft warm heart of light that fills the black heart at the end and beats with the music
  const cx = S / 2, cy = S * 0.5;
  g.save(); g.filter = `blur(${Math.round(S * 0.045)}px)`;
  heartPath(g, cx, cy, S * 0.9);
  const gr = g.createRadialGradient(cx, cy - S * 0.05, 0, cx, cy, S * 0.5);
  gr.addColorStop(0, 'rgba(255,245,210,.95)'); gr.addColorStop(0.35, 'rgba(255,170,90,.75)'); gr.addColorStop(0.75, 'rgba(255,70,110,.45)'); gr.addColorStop(1, 'rgba(200,40,140,0)');
  g.fillStyle = gr; g.fill(); g.restore();
  // fine bright rings inside, like the painting's swirling lines lit from within
  g.save(); heartPath(g, cx, cy, S * 0.86); g.clip();
  for (let i = 1; i <= 6; i++) { g.strokeStyle = `rgba(255,250,230,${0.12 + 0.05 * i})`; g.lineWidth = S * 0.006; g.beginPath(); g.ellipse(cx, cy + S * 0.04, S * 0.06 * i, S * 0.045 * i, 0, 0, Math.PI * 2); g.stroke(); }
  g.restore();
}

function wave(g, S) {
  // a rainbow ring that ripples out from the heart when a drop lands
  const c = S / 2;
  const cols = ['#ffd84a', '#ff8a2a', '#ff3d5a', '#c45cff', '#3fa8ff', '#3fe0c0'];
  for (let i = 0; i < cols.length; i++) {
    g.strokeStyle = cols[i]; g.lineWidth = S * 0.022; g.globalAlpha = 0.85;
    g.beginPath(); g.arc(c, c, S * (0.3 + i * 0.03), 0, Math.PI * 2); g.stroke();
  }
  g.globalAlpha = 1;
  const gl = g.createRadialGradient(c, c, S * 0.28, c, c, S * 0.5);
  gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,255,255,.35)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
}

function grey(g, S) {
  // a missed drop: it cools to a grey bead and sinks into the dark
  const cx = S / 2, cy = S * 0.62, r = S * 0.17;
  teardrop(g, S, cx, cy, r);
  const b = g.createLinearGradient(0, cy - r * 2, 0, cy + r); b.addColorStop(0, '#d9d4cc'); b.addColorStop(1, '#6e6a66');
  g.fillStyle = b; g.fill();
  g.beginPath(); g.ellipse(cx - r * 0.4, cy - r * 0.3, r * 0.14, r * 0.3, -0.35, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
}

const DRAW = { drop, splash, heartglow, wave, grey, target };
export function thingCanvas(kind, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); (DRAW[kind] || drop)(g, size); return c;
}
