// HOLD STILL (5 WEEKS ON MY SIDE, Ben Fox): the drawn pieces.
//   drawLens(g, S, state): the round "x-ray" look inside Ben's eye, under the patch: the retina, its stitches, the
//                          safe band over them, and the gas bubble that has to stay there.
//   tapeTex(color, title): one VHS tape with a coloured label (for the pile that grows each week).
//   tvGlowTex():           a soft glowing screen, tinted per movie.
import * as K from './kit.js';

// state: { x (bubble, -1..1), y (a little bob), zone (half-width of the safe band, in the same units), inZ, strain 0..1,
//          t (seconds), held 0..1 (this week), bump 0..1 (a jolt just happened) }
export function drawLens(g, S, st) {
  const c = S / 2, R = S * 0.47, span = R * 0.62;            // span: how far x = ±1 moves the bubble from the middle
  g.clearRect(0, 0, S, S);
  g.save();
  g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.clip();
  // the retina: warm red-orange, darker toward the edge
  const r = g.createRadialGradient(c - R * 0.15, c - R * 0.1, R * 0.05, c, c, R);
  r.addColorStop(0, '#f2934f'); r.addColorStop(0.55, '#c8502a'); r.addColorStop(1, '#4a120a');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
  // the optic disc (a pale spot on the left) and the blood vessels branching out of it
  const dx = c - R * 0.55, dy = c + R * 0.05;
  const od = g.createRadialGradient(dx, dy, 0, dx, dy, R * 0.18); od.addColorStop(0, 'rgba(255,236,190,.95)'); od.addColorStop(1, 'rgba(255,200,140,0)');
  g.fillStyle = od; g.beginPath(); g.arc(dx, dy, R * 0.18, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(110,14,10,.75)'; g.lineCap = 'round';
  const vessel = (a, bend, len, w) => {
    g.lineWidth = w; g.beginPath(); g.moveTo(dx, dy);
    const ex = dx + Math.cos(a) * len, ey = dy + Math.sin(a) * len;
    g.quadraticCurveTo(dx + Math.cos(a + bend) * len * 0.55, dy + Math.sin(a + bend) * len * 0.55, ex, ey); g.stroke();
  };
  vessel(-0.55, -0.35, R * 1.25, S * 0.018); vessel(0.5, 0.35, R * 1.25, S * 0.018);
  vessel(-0.15, 0.2, R * 1.1, S * 0.011); vessel(0.2, -0.2, R * 1.05, S * 0.011); vessel(-1.0, -0.2, R * 0.8, S * 0.009); vessel(1.0, 0.2, R * 0.8, S * 0.009);
  // the safe band over the stitches: green-gold when the bubble is in it, reddening as the stitches strain
  const zw = st.zone * span, band = st.inZ ? `rgba(120,255,170,${0.18 + 0.08 * Math.sin(st.t * 3)})` : `rgba(255,${Math.round(90 - 60 * st.strain)},60,${0.16 + 0.3 * st.strain})`;
  g.fillStyle = band; g.fillRect(c - zw, c - R * 0.26, zw * 2, R * 0.52);
  g.strokeStyle = st.inZ ? 'rgba(170,255,200,.8)' : 'rgba(255,120,90,.7)'; g.lineWidth = S * 0.008; g.setLineDash([S * 0.02, S * 0.016]);
  g.strokeRect(c - zw, c - R * 0.26, zw * 2, R * 0.52); g.setLineDash([]);
  // the tear line and its stitches (little black crosses), wobbling when they strain
  const wob = st.strain * S * 0.012;
  g.strokeStyle = 'rgba(60,8,6,.9)'; g.lineWidth = S * 0.012; g.beginPath();
  for (let i = 0; i <= 20; i++) { const xx = c - zw * 1.25 + (zw * 2.5) * i / 20, yy = c + Math.sin(i * 1.7 + st.t * 30) * wob * 0.5 + Math.sin(i * 0.9) * S * 0.006; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); }
  g.stroke();
  g.strokeStyle = '#111'; g.lineWidth = S * 0.011;
  for (let i = 0; i < 5; i++) {
    const xx = c - zw * 0.9 + (zw * 1.8) * i / 4 + Math.sin(st.t * 40 + i) * wob, yy = c + Math.cos(st.t * 37 + i) * wob, s = S * 0.022;
    g.beginPath(); g.moveTo(xx - s, yy - s); g.lineTo(xx + s, yy + s); g.moveTo(xx + s, yy - s); g.lineTo(xx - s, yy + s); g.stroke();
  }
  // the gas bubble: a clear, shining sphere
  const bx = c + st.x * span, by = c + st.y * S * 0.03, br = S * 0.15 * (1 + st.bump * 0.12);
  const b = g.createRadialGradient(bx - br * 0.35, by - br * 0.4, br * 0.05, bx, by, br);
  b.addColorStop(0, 'rgba(255,255,255,.95)'); b.addColorStop(0.35, 'rgba(225,245,255,.42)'); b.addColorStop(0.85, 'rgba(190,230,255,.22)'); b.addColorStop(1, 'rgba(255,255,255,.7)');
  g.fillStyle = b; g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = S * 0.01; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(bx - br * 0.38, by - br * 0.42, br * 0.22, br * 0.12, -0.6, 0, Math.PI * 2); g.fill();
  // the strain: a red pulse over everything
  if (st.strain > 0.05) { g.fillStyle = `rgba(255,30,20,${st.strain * (0.25 + 0.2 * Math.sin(st.t * 14))})`; g.fillRect(0, 0, S, S); }
  g.restore();
  // the rim of the lens: thick black, a thin white line, and the week's progress as a gold arc around it
  g.lineWidth = S * 0.035; g.strokeStyle = '#0c0c0e'; g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2); g.stroke();
  g.lineWidth = S * 0.008; g.strokeStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(c, c, R + S * 0.02, 0, Math.PI * 2); g.stroke();
  if (st.held > 0) { g.lineWidth = S * 0.028; g.strokeStyle = '#ffc21a'; g.lineCap = 'round'; g.beginPath(); g.arc(c, c, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, st.held)); g.stroke(); }
}

export function tapeTex(color, title) {
  return K.canvasTex(256, 72, (g, W, H) => {
    g.fillStyle = '#16161a'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#2a2a30'; g.fillRect(4, 4, W - 8, 10);
    g.fillStyle = color; g.fillRect(14, 18, W * 0.62, H - 30);
    g.fillStyle = '#111'; g.font = '900 22px Archivo, "Arial Black", Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText(title.toUpperCase(), 22, 18 + (H - 30) / 2 + 1);
    g.fillStyle = '#0a0a0c'; g.fillRect(W * 0.7, 20, W * 0.26, H - 34);
    g.fillStyle = '#d8d8d8'; for (const k of [0.76, 0.9]) { g.beginPath(); g.arc(W * k, H / 2 + 1, 9, 0, Math.PI * 2); g.fill(); }
  });
}

export function tvGlowTex() {
  return K.canvasTex(256, 200, (g, W, H) => {
    const r = g.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.6);
    r.addColorStop(0, 'rgba(255,255,255,.95)'); r.addColorStop(0.55, 'rgba(255,255,255,.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, W, H);
  });
}

// the words over the eye: HOLD STILL, and why, in the kit's style (white Archivo 900 on black, a red bar under it)
export function holdLabelTex() {
  return K.canvasTex(640, 200, (g, W, H) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H - 14); g.fillStyle = '#ec3013'; g.fillRect(0, H - 14, W, 14);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 86px Archivo, "Arial Black", Arial, sans-serif'; g.fillText('HOLD STILL', W / 2, 64);
    g.font = '900 34px Archivo, "Arial Black", Arial, sans-serif'; g.fillStyle = '#ffd9a8'; g.fillText('TO HOLD THE STITCHES IN PLACE', W / 2, 140);
  });
}
