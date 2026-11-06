// DROP IN (Michael Tubiak, Comfort in the Uncomfortable): the drawn props.
// Everything is drawn in code on a canvas, lit like the painting (warm low sun from the upper left on red canyon sand).
//   thingCanvas(kind, size) → a square canvas: 'heart' | 'dust' | 'lip' | 'shadow' | 'streak' | 'flag'
// Used by drop-in.js. No emoji, no image files.

const SAND = ['#f3c58a', '#e2a466', '#c9814a', '#9c5a32'];

function heart(g, S) {
  const c = S / 2, s = S * 0.0042;
  const path = () => {
    g.beginPath(); g.moveTo(c, c + 78 * s);
    g.bezierCurveTo(c - 118 * s, c - 6 * s, c - 70 * s, c - 96 * s, c, c - 44 * s);
    g.bezierCurveTo(c + 70 * s, c - 96 * s, c + 118 * s, c - 6 * s, c, c + 78 * s); g.closePath();
  };
  // a hard black comic shadow, then the white outline, then the red heart
  g.save(); g.translate(7 * s, 7 * s); path(); g.fillStyle = '#000'; g.fill(); g.restore();
  path(); g.lineJoin = 'round'; g.lineWidth = 18 * s; g.strokeStyle = '#fff'; g.stroke();
  const gr = g.createRadialGradient(c - 30 * s, c - 40 * s, 4 * s, c, c, 110 * s);
  gr.addColorStop(0, '#ff7a5c'); gr.addColorStop(0.45, '#ec3013'); gr.addColorStop(1, '#9e1606');
  path(); g.fillStyle = gr; g.fill();
  // shine
  g.beginPath(); g.ellipse(c - 40 * s, c - 34 * s, 16 * s, 9 * s, -0.7, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.75)'; g.fill();
  // the heartbeat line across it
  g.beginPath(); g.moveTo(c - 70 * s, c + 4 * s); g.lineTo(c - 26 * s, c + 4 * s); g.lineTo(c - 12 * s, c - 30 * s); g.lineTo(c + 6 * s, c + 34 * s);
  g.lineTo(c + 20 * s, c + 4 * s); g.lineTo(c + 70 * s, c + 4 * s);
  g.lineWidth = 9 * s; g.lineCap = 'round'; g.strokeStyle = '#fff'; g.stroke();
}

function dust(g, S) {
  // a puff of canyon dust kicked up by the tyres: soft warm lumps, lit from the upper left
  const blobs = [[0.5, 0.58, 0.3], [0.32, 0.64, 0.2], [0.68, 0.64, 0.22], [0.42, 0.44, 0.2], [0.6, 0.42, 0.17], [0.22, 0.74, 0.12], [0.8, 0.74, 0.13]];
  for (const [x, y, r] of blobs) {
    const gr = g.createRadialGradient(S * (x - r * 0.3), S * (y - r * 0.35), 0, S * x, S * y, S * r);
    gr.addColorStop(0, 'rgba(255,228,190,.95)'); gr.addColorStop(0.45, 'rgba(226,164,102,.75)'); gr.addColorStop(1, 'rgba(201,129,74,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(S * x, S * y, S * r, 0, Math.PI * 2); g.fill();
  }
  // a few grains of sand flying out
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const a = -Math.PI * (0.1 + rnd() * 0.8), d = S * (0.28 + rnd() * 0.2);
    g.fillStyle = SAND[(i % 3) + 1]; g.beginPath(); g.arc(S / 2 + Math.cos(a) * d, S * 0.6 + Math.sin(a) * d * 0.8, S * (0.006 + rnd() * 0.01), 0, Math.PI * 2); g.fill();
  }
}

function lip(g, S) {
  // the edge of a drop: a bright sunlit rim with a fat downward chevron, so it reads at a glance
  const y = S * 0.36;
  const gr = g.createLinearGradient(0, y - S * 0.08, 0, y + S * 0.1);
  gr.addColorStop(0, 'rgba(255,240,200,0)'); gr.addColorStop(0.5, 'rgba(255,240,200,.95)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(S * 0.04, y + S * 0.03); g.quadraticCurveTo(S / 2, y - S * 0.07, S * 0.96, y + S * 0.03); g.lineTo(S * 0.96, y + S * 0.09); g.quadraticCurveTo(S / 2, y - S * 0.01, S * 0.04, y + S * 0.09); g.fill();
  g.lineCap = 'round'; g.lineJoin = 'round';
  const chev = (yy, a) => {
    g.beginPath(); g.moveTo(S * 0.36, yy); g.lineTo(S * 0.5, yy + S * 0.11); g.lineTo(S * 0.64, yy);
    g.lineWidth = S * 0.075; g.strokeStyle = `rgba(0,0,0,${a})`; g.stroke();
    g.lineWidth = S * 0.045; g.strokeStyle = `rgba(255,255,255,${a})`; g.stroke();
  };
  chev(S * 0.5, 1); chev(S * 0.64, 0.6); chev(S * 0.78, 0.3);
}

function shadow(g, S) {
  const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, 'rgba(60,24,8,.55)'); gr.addColorStop(0.6, 'rgba(60,24,8,.25)'); gr.addColorStop(1, 'rgba(60,24,8,0)');
  g.save(); g.translate(S / 2, S / 2); g.scale(1, 0.32); g.translate(-S / 2, -S / 2); g.fillStyle = gr; g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.fill(); g.restore();
}

function streak(g, S) {
  // speed lines for the drop: warm white strokes, thick in the middle, thin at the ends
  for (let i = 0; i < 7; i++) {
    const x = S * (0.12 + i * 0.127), len = S * (0.45 + ((i * 37) % 5) * 0.08), y0 = S * 0.1 + ((i * 53) % 4) * S * 0.06;
    const gr = g.createLinearGradient(0, y0, 0, y0 + len); gr.addColorStop(0, 'rgba(255,246,225,0)'); gr.addColorStop(0.5, 'rgba(255,246,225,.9)'); gr.addColorStop(1, 'rgba(255,246,225,0)');
    g.strokeStyle = gr; g.lineWidth = S * (i % 2 ? 0.012 : 0.02); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + len); g.stroke();
  }
}

function flag(g, S) {
  // the finish: a little checkered flag on a pole stuck in the sand
  g.fillStyle = '#2a1a10'; g.fillRect(S * 0.3, S * 0.12, S * 0.035, S * 0.78);
  g.beginPath(); g.ellipse(S * 0.32, S * 0.9, S * 0.12, S * 0.03, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(60,24,8,.4)'; g.fill();
  const x0 = S * 0.335, y0 = S * 0.14, w = S * 0.42, h = S * 0.28, n = 5, m = 3;
  g.save(); g.beginPath();
  g.moveTo(x0, y0); g.quadraticCurveTo(x0 + w * 0.5, y0 - S * 0.04, x0 + w, y0 + S * 0.02); g.lineTo(x0 + w, y0 + h + S * 0.02); g.quadraticCurveTo(x0 + w * 0.5, y0 + h - S * 0.04, x0, y0 + h); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.lineWidth = S * 0.02; g.strokeStyle = '#000'; g.stroke(); g.clip();
  g.fillStyle = '#111';
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) if ((i + j) % 2) g.fillRect(x0 + (i * w) / n, y0 - S * 0.05 + (j * (h + S * 0.07)) / m, w / n + 1, (h + S * 0.07) / m + 1);
  g.restore();
}

/* ── obstacles in the trail: each stands on a ground line 0.8 of the way down its square, lit from the upper right ── */
function groundShadow(g, S, w = 0.36) {
  const gr = g.createRadialGradient(S * 0.46, S * 0.8, 0, S * 0.46, S * 0.8, S * w);
  gr.addColorStop(0, 'rgba(50,20,6,.55)'); gr.addColorStop(1, 'rgba(50,20,6,0)');
  g.save(); g.translate(0, S * 0.8); g.scale(1, 0.28); g.translate(0, -S * 0.8); g.fillStyle = gr; g.beginPath(); g.arc(S * 0.46, S * 0.8, S * w, 0, Math.PI * 2); g.fill(); g.restore();
}
function ink(g, S, w = 0.028) { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = S * w; g.strokeStyle = '#1a0a04'; g.stroke(); }
function rock(g, S) {
  groundShadow(g, S, 0.4);
  const path = () => { g.beginPath(); g.moveTo(S * 0.16, S * 0.8); g.lineTo(S * 0.2, S * 0.5); g.lineTo(S * 0.38, S * 0.3); g.lineTo(S * 0.62, S * 0.27); g.lineTo(S * 0.8, S * 0.44); g.lineTo(S * 0.86, S * 0.8); g.closePath(); };
  path(); const gr = g.createLinearGradient(S * 0.8, S * 0.25, S * 0.2, S * 0.8); gr.addColorStop(0, '#d9a77a'); gr.addColorStop(0.5, '#a0653d'); gr.addColorStop(1, '#5d3219'); g.fillStyle = gr; g.fill();
  // facets
  g.beginPath(); g.moveTo(S * 0.38, S * 0.3); g.lineTo(S * 0.5, S * 0.52); g.lineTo(S * 0.8, S * 0.44); g.moveTo(S * 0.5, S * 0.52); g.lineTo(S * 0.44, S * 0.8); g.lineWidth = S * 0.014; g.strokeStyle = 'rgba(40,16,4,.55)'; g.stroke();
  g.beginPath(); g.moveTo(S * 0.4, S * 0.33); g.lineTo(S * 0.6, S * 0.3); g.lineTo(S * 0.74, S * 0.43); g.lineTo(S * 0.52, S * 0.48); g.closePath(); g.fillStyle = 'rgba(255,225,180,.45)'; g.fill();
  path(); ink(g, S);
}
function log(g, S) {
  groundShadow(g, S, 0.46);
  g.save(); g.translate(S * 0.5, S * 0.66); g.rotate(-0.08);
  const L = S * 0.74, R = S * 0.13;
  g.beginPath(); g.rect(-L / 2, -R, L, R * 2); const gr = g.createLinearGradient(0, -R, 0, R); gr.addColorStop(0, '#b07a4c'); gr.addColorStop(0.5, '#7a4a28'); gr.addColorStop(1, '#3f2210'); g.fillStyle = gr; g.fill(); ink(g, S);
  // bark lines
  g.lineWidth = S * 0.012; g.strokeStyle = 'rgba(30,12,2,.6)';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-L / 2 + S * 0.05 + i * S * 0.12, -R * 0.6); g.lineTo(-L / 2 + S * 0.12 + i * S * 0.12, R * 0.4); g.stroke(); }
  // a broken-off branch
  g.beginPath(); g.moveTo(S * 0.05, -R); g.lineTo(S * 0.12, -R - S * 0.12); g.lineTo(S * 0.16, -R); g.fillStyle = '#6a3e20'; g.fill(); ink(g, S, 0.02);
  // the cut end, with rings
  g.beginPath(); g.ellipse(L / 2, 0, R * 0.55, R, 0, 0, Math.PI * 2); g.fillStyle = '#e7c08a'; g.fill(); ink(g, S);
  for (const k of [0.65, 0.35]) { g.beginPath(); g.ellipse(L / 2, 0, R * 0.55 * k, R * k, 0, 0, Math.PI * 2); g.lineWidth = S * 0.01; g.strokeStyle = '#a36a3a'; g.stroke(); }
  g.restore();
}
function cactus(g, S) {
  groundShadow(g, S, 0.3);
  const gr = g.createLinearGradient(S * 0.3, 0, S * 0.7, 0); gr.addColorStop(0, '#2f6b3a'); gr.addColorStop(0.55, '#4fa05a'); gr.addColorStop(1, '#2a5a31');
  const arm = (x, y0, y1, dir) => { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + dir * S * 0.16, y0); g.lineTo(x + dir * S * 0.16, y1); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (const pass of [0, 1]) {
    g.lineWidth = S * (pass ? 0.1 : 0.14); g.strokeStyle = pass ? gr : '#1a0a04';
    g.beginPath(); g.moveTo(S * 0.5, S * 0.8); g.lineTo(S * 0.5, S * 0.18); g.stroke();
    arm(S * 0.5, S * 0.55, S * 0.36, -1); g.stroke(); arm(S * 0.5, S * 0.47, S * 0.3, 1); g.stroke();
  }
  // spines
  g.fillStyle = '#fff3c4';
  for (let i = 0; i < 9; i++) { const y = S * (0.22 + i * 0.065); g.fillRect(S * 0.465, y, S * 0.012, S * 0.012); g.fillRect(S * 0.525, y + S * 0.03, S * 0.012, S * 0.012); }
  // a pink flower on top
  g.beginPath(); g.arc(S * 0.5, S * 0.16, S * 0.04, 0, Math.PI * 2); g.fillStyle = '#ff5aa0'; g.fill(); ink(g, S, 0.014);
}
function tumbleweed(g, S) {
  groundShadow(g, S, 0.32);
  const c = [S * 0.5, S * 0.52], r = S * 0.27;
  g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.fillStyle = 'rgba(120,80,40,.35)'; g.fill();
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  g.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    const a0 = rnd() * Math.PI * 2, a1 = a0 + 1.2 + rnd() * 2, rr = r * (0.4 + rnd() * 0.6);
    g.beginPath(); g.arc(c[0] + (rnd() - 0.5) * r * 0.3, c[1] + (rnd() - 0.5) * r * 0.3, rr, a0, a1);
    g.lineWidth = S * (0.008 + rnd() * 0.01); g.strokeStyle = ['#e5c08a', '#b98a55', '#7d5530', '#3a2410'][i % 4]; g.stroke();
  }
  g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.lineWidth = S * 0.02; g.strokeStyle = '#3a2410'; g.stroke();
}

const DRAW = { heart, dust, lip, shadow, streak, flag, rock, log, cactus, tumbleweed };
export function thingCanvas(kind, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); (DRAW[kind] || dust)(g, size); return c;
}
export const KINDS = Object.keys(DRAW);
