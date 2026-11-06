// ROLLER COASTER OF EMOTIONS (Alayna Lopez): the drawn props for "Pick Your Track".
// Lit like the painting: a bright, busy city seen from high up, warm light from the upper left, orange-and-red coaster tracks
// winding through the sky, tilted billboards on the towers.
//  · Alayna riding a little coaster car, side on (facing right): 'ride' (hands on the bar) | 'hands' (hands up!)
//  · a billboard with a statement on it: 'plain' | 'true' (lit gold, a tick and TRUE) | 'false' (greyed, NOT TRUE)
//  · a storm cloud (the stormy feelings), and the coaster track itself (drawn along any path)
// draw*(g, W, H, …) are plain canvas drawings (preview anywhere); *Tex() wrap them as textures (cached).
import * as K from './kit.js';

const INK = '#16120f';
export const RAIL = '#e0461f', TIE = '#f39a2b', GOLD = '#ffc928';
const FONT = (px) => `900 ${px}px Archivo, "Arial Black", Arial, sans-serif`;

/* ───────── Alayna in her coaster car, side on, facing right (draw it 256 × 192) ───────── */
export function drawCar(g, W, H, pose = 'ride') {
  g.save(); const s = Math.min(W / 256, H / 192); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  // her curls stream back in the wind
  const HAIR = ['#7a3f1d', '#9a5426', '#b8692f', '#d4843f'];
  g.fillStyle = INK; g.beginPath(); g.ellipse(92, 72, 40, 26, -0.25, 0, Math.PI * 2); g.fill();
  g.fillStyle = HAIR[1]; g.beginPath(); g.ellipse(92, 72, 37, 23, -0.25, 0, Math.PI * 2); g.fill();
  for (const [x, y, r] of [[60, 78, 12], [68, 92, 11], [78, 60, 10], [56, 64, 9], [84, 96, 9]]) { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 2.5, 0, Math.PI * 2); g.fill(); g.fillStyle = HAIR[1]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = HAIR[2]; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(58 + i * 6, 66 + (i % 3) * 10, 5, 0.5, 3.6); g.stroke(); }
  // arms: on the bar, or thrown up
  g.strokeStyle = INK; g.lineWidth = 15; const arm = (pts) => { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke(); };
  const up = pose === 'hands';
  const A = up ? [[[118, 104], [128, 64], [122, 24]], [[126, 104], [146, 66], [150, 26]]] : [[[118, 106], [150, 112], [168, 104]]];
  A.forEach(a => arm(a)); g.strokeStyle = '#2f6158'; g.lineWidth = 10; A.forEach(a => arm(a));
  g.fillStyle = '#e8b48e'; g.strokeStyle = INK; g.lineWidth = 3;
  for (const a of A) { const [x, y] = a[a.length - 1]; g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); g.stroke(); }
  // her body in the sea-green coat, and her face in profile (big brown eye, smile)
  g.fillStyle = '#336a60'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.roundRect(96, 92, 44, 40, 14); g.fill(); g.stroke();
  g.fillStyle = '#ece3cc'; g.beginPath(); g.ellipse(120, 94, 20, 7, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  const sk = g.createRadialGradient(116, 64, 3, 122, 72, 24); sk.addColorStop(0, '#f6cfaa'); sk.addColorStop(1, '#d9a07a');
  g.fillStyle = sk; g.beginPath(); g.ellipse(122, 72, 19, 20, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = '#fffaf2'; g.beginPath(); g.ellipse(132, 70, 5, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6b3516'; g.beginPath(); g.arc(133.5, 70.5, 3, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(132.5, 69.3, 1, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3a1d0c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(127, 63); g.quadraticCurveTo(133, 60, 138, 63); g.stroke();
  g.strokeStyle = '#7d2b26'; g.lineWidth = 2.4; g.beginPath(); g.arc(134, 79, up ? 5 : 4, 0.2, 1.9); g.stroke();
  g.fillStyle = 'rgba(232,110,100,.4)'; g.beginPath(); g.arc(126, 78, 4, 0, Math.PI * 2); g.fill();
  // the orange beanie
  g.beginPath(); g.ellipse(118, 58, 24, 20, -0.15, Math.PI * 0.95, Math.PI * 2.08); g.closePath();
  const hat = g.createRadialGradient(108, 44, 3, 118, 56, 28); hat.addColorStop(0, '#e9774a'); hat.addColorStop(1, '#a8421f');
  g.fillStyle = hat; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#d4643a'; g.beginPath(); g.roundRect(94, 54, 48, 10, 4); g.fill(); g.stroke();
  // the car: glossy red-orange, like the painting's tracks, with a gold stripe
  g.beginPath(); g.moveTo(40, 112); g.lineTo(206, 112); g.quadraticCurveTo(236, 112, 238, 140); g.lineTo(232, 160); g.lineTo(44, 160); g.quadraticCurveTo(30, 136, 40, 112); g.closePath();
  const car = g.createLinearGradient(0, 110, 0, 162); car.addColorStop(0, '#ff6a3a'); car.addColorStop(0.55, '#d8381a'); car.addColorStop(1, '#9e2410');
  g.fillStyle = car; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  g.fillStyle = GOLD; g.fillRect(46, 132, 186, 7); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(46, 132, 186, 7);
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.roundRect(56, 116, 120, 6, 3); g.fill();
  // the lap bar
  g.strokeStyle = '#ffd34a'; g.lineWidth = 6; g.beginPath(); g.moveTo(150, 112); g.quadraticCurveTo(168, 96, 176, 112); g.stroke();
  // wheels
  for (const x of [72, 196]) { g.fillStyle = '#2a2a2a'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x, 166, 14, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#9a9a9a'; g.beginPath(); g.arc(x, 166, 5, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

/* ───────── a billboard with a statement (draw it 512 × 320) ───────── */
function wrap(g, text, maxW) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line); return lines;
}
export function drawSign(g, W, H, text = '', state = 'plain', label = '') {
  g.save(); const s = Math.min(W / 512, H / 320); g.scale(s, s); g.lineJoin = 'round';
  const lit = state === 'true', no = state === 'false';
  if (lit) { const q = g.createRadialGradient(256, 160, 120, 256, 160, 300); q.addColorStop(0, 'rgba(255,214,90,.9)'); q.addColorStop(1, 'rgba(255,214,90,0)'); g.fillStyle = q; g.fillRect(0, 0, 512, 320); }
  // the posts and the shadow
  g.fillStyle = '#2b2b2b'; g.fillRect(150, 268, 18, 52); g.fillRect(344, 268, 18, 52);
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(36, 34, 452, 246);
  // the board
  g.fillStyle = no ? '#9a9a96' : lit ? '#fff6d8' : '#ffffff'; g.strokeStyle = INK; g.lineWidth = 10;
  g.beginPath(); g.rect(26, 22, 452, 246); g.fill(); g.stroke();
  // the header strip: which track
  g.fillStyle = no ? '#5c5c5a' : lit ? GOLD : '#ec3013'; g.fillRect(31, 27, 442, 48);
  g.fillStyle = lit ? INK : '#ffffff'; g.font = FONT(30); g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillText((label || '').toUpperCase(), 48, 52);
  // the statement, as big as fits
  g.fillStyle = no ? '#4a4a48' : INK; g.textAlign = 'center';
  let px = 44, lines; for (; px >= 22; px -= 2) { g.font = FONT(px); lines = wrap(g, text.toUpperCase(), 404); if (lines.length * px * 1.08 <= 170) break; }
  const y0 = 172 - (lines.length - 1) * px * 0.54;
  lines.forEach((l, i) => g.fillText(l, 252, y0 + i * px * 1.08));
  // the verdict
  if (lit) {
    g.fillStyle = GOLD; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.arc(452, 40, 38, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(434, 40); g.lineTo(448, 55); g.lineTo(472, 26); g.stroke();
    g.fillStyle = INK; g.fillRect(300, 28, 112, 46); g.fillStyle = GOLD; g.font = FONT(30); g.textAlign = 'center'; g.fillText('TRUE', 356, 52);
  }
  if (no) {
    g.fillStyle = INK; g.fillRect(250, 28, 222, 46); g.fillStyle = '#ffffff'; g.font = FONT(28); g.textAlign = 'center'; g.fillText('NOT TRUE', 361, 52);
    g.strokeStyle = 'rgba(22,18,15,.55)'; g.lineWidth = 8; g.beginPath(); g.moveTo(50, 250); g.lineTo(454, 92); g.stroke();
  }
  g.restore();
}

/* ───────── a storm cloud (draw it 256 × 128) ───────── */
export function drawCloud(g, W, H) {
  g.save(); const s = Math.min(W / 256, H / 128); g.scale(s, s);
  const puffs = [[60, 80, 36], [104, 58, 44], [156, 62, 40], [198, 82, 32], [128, 88, 40]];
  for (const [x, y, r] of puffs) { const q = g.createRadialGradient(x - r * 0.3, y - r * 0.4, 2, x, y, r); q.addColorStop(0, '#8a8f99'); q.addColorStop(0.7, '#555b66'); q.addColorStop(1, 'rgba(60,64,74,0)'); g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(40,44,52,.85)'; g.beginPath(); g.ellipse(128, 100, 96, 16, 0, 0, Math.PI * 2); g.fill();
  g.restore();
}

/* ───────── the coaster track along a path: pts = [[x, y], …] in canvas pixels ───────── */
export function drawTrack(g, pts, { w = 22, alpha = 1, grey = false } = {}) {
  if (pts.length < 2) return;
  g.save(); g.globalAlpha = alpha; g.lineJoin = 'round'; g.lineCap = 'round';
  const rail = grey ? '#7c7c7a' : RAIL, tie = grey ? '#a5a5a2' : TIE;
  const n = (i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
  // the ties, every few pixels
  let acc = 0; g.strokeStyle = INK; g.lineWidth = 7;
  const ties = [];
  for (let i = 1; i < pts.length; i++) { acc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc > w * 0.7) { acc = 0; ties.push(i); } }
  for (const i of ties) { const [nx, ny] = n(i), [x, y] = pts[i]; g.beginPath(); g.moveTo(x - nx * w * 0.6, y - ny * w * 0.6); g.lineTo(x + nx * w * 0.6, y + ny * w * 0.6); g.stroke(); }
  g.strokeStyle = tie; g.lineWidth = 4; for (const i of ties) { const [nx, ny] = n(i), [x, y] = pts[i]; g.beginPath(); g.moveTo(x - nx * w * 0.55, y - ny * w * 0.55); g.lineTo(x + nx * w * 0.55, y + ny * w * 0.55); g.stroke(); }
  // the two rails
  for (const side of [-0.42, 0.42]) {
    const path = () => { g.beginPath(); pts.forEach((p, i) => { const [nx, ny] = n(i), x = p[0] + nx * w * side, y = p[1] + ny * w * side; i ? g.lineTo(x, y) : g.moveTo(x, y); }); };
    g.strokeStyle = INK; g.lineWidth = 9; path(); g.stroke();
    g.strokeStyle = rail; g.lineWidth = 5; path(); g.stroke();
  }
  g.restore();
}

/* ───────── textures (cached; signs are made fresh, since each has its own words) ───────── */
const cache = new Map();
const tex = (key, w, h, fn) => { if (!cache.has(key)) { const t = K.canvasTex(w, h, fn); t._shared = true; cache.set(key, t); } return cache.get(key); };
export const carTex = (pose = 'ride') => tex('car' + pose, 256, 192, (g, W, H) => drawCar(g, W, H, pose));
export const cloudTex = () => tex('cloud', 256, 128, drawCloud);
export const signTex = (text, state, label) => K.canvasTex(512, 320, (g, W, H) => drawSign(g, W, H, text, state, label));
