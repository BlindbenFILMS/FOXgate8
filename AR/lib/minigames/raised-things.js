// ART RAISED ME UP (Deborah Tramentozzi): the eight paintings that hang in the dark hall.
// Each one is a big, simple, high-contrast picture in a heavy gilded frame, drawn with canvas (no emoji, no images to load).
//
//   import { PAINTINGS, drawPainting, painting } from './raised-things.js';
//   drawPainting(g, id, W, H)      draws one framed painting into a 2D canvas (also used for Ben's preview sheet)
//   const p = painting(id, width)  → { group, light(v 0..1), glow(v 0..1), tick(t, dt) } for the game
import * as THREE from 'three';

export const PAINTINGS = [
  { id: 'sea', name: 'The sea' },
  { id: 'bird', name: 'The songbird' },
  { id: 'violin', name: 'The violin' },
  { id: 'sunflowers', name: 'The sunflowers' },
  { id: 'stars', name: 'The night sky' },
  { id: 'hands', name: 'The hands' },
  { id: 'dancer', name: 'The dancer' },
  { id: 'sunrise', name: 'The sunrise' },
];

const TAU = Math.PI * 2;
const lin = (g, x0, y0, x1, y1, stops) => { const r = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => r.addColorStop(o, c)); return r; };
const rad = (g, x, y, r0, r1, stops) => { const r = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => r.addColorStop(o, c)); return r; };
const circ = (g, x, y, r, fill) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = fill; g.fill(); };
const ink = '#1a1209';

// the gilded frame: a deep moulding, a bright bevel, beads and corner ornaments
function frame(g, W, H, b) {
  g.fillStyle = lin(g, 0, 0, W, H, [[0, '#f7d77a'], [0.3, '#b5821f'], [0.55, '#ffe9a0'], [0.8, '#8a5a12'], [1, '#e2b24a']]);
  g.fillRect(0, 0, W, H);
  // the moulding steps in toward the picture
  const steps = [[0.0, '#5a3a08'], [0.22, '#f2cf6c'], [0.46, '#9a6914'], [0.7, '#fff0b8'], [0.86, '#6b4509']];
  steps.forEach(([k, c]) => { const i = b * k; g.strokeStyle = c; g.lineWidth = b * 0.12; g.strokeRect(i + b * 0.06, i + b * 0.06, W - 2 * i - b * 0.12, H - 2 * i - b * 0.12); });
  // a row of beads round the middle of the moulding
  g.fillStyle = '#fff4c8';
  const bi = b * 0.34, per = (x0, y0, x1, y1) => { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / (b * 0.22)); for (let i = 0; i <= n; i++) { const t = i / n; circ(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, b * 0.055, 'rgba(255,244,200,.85)'); } };
  per(bi, bi, W - bi, bi); per(bi, H - bi, W - bi, H - bi); per(bi, bi, bi, H - bi); per(W - bi, bi, W - bi, H - bi);
  // corner ornaments: a shell of curls
  for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]]) {
    g.save(); g.translate(cx, cy); g.scale(sx, sy);
    g.fillStyle = rad(g, b * 0.55, b * 0.55, 0, b * 0.75, [[0, '#fff6cf'], [0.5, '#e9b949'], [1, '#7a4f0c']]);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(b * 1.15, 0); g.quadraticCurveTo(b * 0.9, b * 0.35, b * 0.62, b * 0.62); g.quadraticCurveTo(b * 0.35, b * 0.9, 0, b * 1.15); g.closePath(); g.fill();
    g.strokeStyle = '#5a3a08'; g.lineWidth = b * 0.06;
    g.beginPath(); g.arc(b * 0.5, b * 0.5, b * 0.2, 0.2, 4.6); g.stroke();
    g.beginPath(); g.arc(b * 0.5, b * 0.5, b * 0.08, 0, TAU); g.stroke();
    g.restore();
  }
  // the inner lip, dark, so the picture sits deep in the frame
  g.fillStyle = '#2a1a05'; g.fillRect(b - 4, b - 4, W - 2 * b + 8, H - 2 * b + 8);
}

// the eight pictures (drawn into the box x, y, w, h)
const PICTURE = {
  sea(g, w, h) {
    g.fillStyle = lin(g, 0, 0, 0, h * 0.55, [[0, '#ffb347'], [0.6, '#ffd98a'], [1, '#fff1c4']]); g.fillRect(0, 0, w, h * 0.56);
    circ(g, w * 0.5, h * 0.5, w * 0.16, '#fff8e0'); circ(g, w * 0.5, h * 0.5, w * 0.24, 'rgba(255,248,224,.25)');
    g.fillStyle = '#0b3b6f'; g.fillRect(0, h * 0.52, w, h * 0.48);
    // the sun's path on the water
    g.fillStyle = 'rgba(255,230,150,.75)'; for (let i = 0; i < 6; i++) { const yy = h * (0.56 + i * 0.045), ww = w * (0.08 + i * 0.035); g.fillRect(w * 0.5 - ww / 2, yy, ww, h * 0.012); }
    // three rolling waves with white crests
    [[0.68, '#1565a8'], [0.8, '#0f4f8c'], [0.92, '#0a3866']].forEach(([y, c], k) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) g.lineTo(x, h * y + Math.sin(x / w * TAU * 1.5 + k * 1.7) * h * 0.035);
      g.lineTo(w, h); g.closePath(); g.fill();
      g.strokeStyle = '#ffffff'; g.lineWidth = h * 0.016; g.lineCap = 'round'; g.beginPath();
      for (let x = 0; x <= w; x += 4) { const yy = h * y + Math.sin(x / w * TAU * 1.5 + k * 1.7) * h * 0.035; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
      g.stroke();
    });
  },
  bird(g, w, h) {
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, '#bfe6ff'], [1, '#e9f6ff']]); g.fillRect(0, 0, w, h);
    // the branch, with leaves
    g.strokeStyle = '#4a2c12'; g.lineWidth = h * 0.05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-5, h * 0.78); g.quadraticCurveTo(w * 0.5, h * 0.66, w + 5, h * 0.72); g.stroke();
    g.fillStyle = '#2f8a3a'; for (const [x, y, a] of [[0.12, 0.72, -0.6], [0.85, 0.66, 0.5], [0.72, 0.78, 2.4], [0.25, 0.83, 2.6]]) { g.save(); g.translate(w * x, h * y); g.rotate(a); g.beginPath(); g.ellipse(0, -h * 0.05, w * 0.045, h * 0.06, 0, 0, TAU); g.fill(); g.restore(); }
    // the robin
    const cx = w * 0.5, cy = h * 0.5;
    g.fillStyle = '#5b3a1f'; g.beginPath(); g.moveTo(cx + w * 0.18, cy + h * 0.02); g.lineTo(cx + w * 0.38, cy + h * 0.14); g.lineTo(cx + w * 0.3, cy + h * 0.18); g.closePath(); g.fill();   // tail
    g.beginPath(); g.ellipse(cx, cy + h * 0.04, w * 0.26, h * 0.16, -0.15, 0, TAU); g.fill();    // back
    g.fillStyle = '#e8451c'; g.beginPath(); g.ellipse(cx - w * 0.06, cy + h * 0.08, w * 0.19, h * 0.12, -0.1, 0, TAU); g.fill();   // red breast
    circ(g, cx - w * 0.17, cy - h * 0.1, w * 0.13, '#5b3a1f');       // head
    circ(g, cx - w * 0.2, cy - h * 0.12, w * 0.035, '#fff'); circ(g, cx - w * 0.205, cy - h * 0.12, w * 0.02, ink);
    g.fillStyle = '#f2b01e'; g.beginPath(); g.moveTo(cx - w * 0.29, cy - h * 0.11); g.lineTo(cx - w * 0.42, cy - h * 0.13); g.lineTo(cx - w * 0.29, cy - h * 0.07); g.closePath(); g.fill();   // open beak
    g.strokeStyle = '#4a2c12'; g.lineWidth = w * 0.02; g.beginPath(); g.moveTo(cx - w * 0.04, cy + h * 0.19); g.lineTo(cx - w * 0.06, cy + h * 0.27); g.moveTo(cx + w * 0.06, cy + h * 0.18); g.lineTo(cx + w * 0.06, cy + h * 0.26); g.stroke();
    // its song: three notes
    g.strokeStyle = '#1f4fd8'; g.lineWidth = w * 0.022; g.fillStyle = '#1f4fd8';
    for (const [x, y] of [[0.14, 0.24], [0.27, 0.13], [0.42, 0.2]]) { g.beginPath(); g.ellipse(w * x, h * y, w * 0.035, h * 0.022, -0.4, 0, TAU); g.fill(); g.beginPath(); g.moveTo(w * x + w * 0.03, h * y); g.lineTo(w * x + w * 0.03, h * y - h * 0.08); g.stroke(); }
  },
  violin(g, w, h) {
    g.fillStyle = lin(g, 0, 0, w, h, [[0, '#7a0f1c'], [1, '#3d0610']]); g.fillRect(0, 0, w, h);
    circ(g, w * 0.5, h * 0.5, w * 0.5, 'rgba(255,170,90,.12)');
    g.save(); g.translate(w * 0.5, h * 0.54); g.rotate(-0.18);
    const s = Math.min(w, h * 0.8);
    g.fillStyle = lin(g, -s * 0.3, 0, s * 0.3, 0, [[0, '#8a3b06'], [0.5, '#f0a032'], [1, '#8a3b06']]);
    g.beginPath(); g.ellipse(0, s * 0.18, s * 0.27, s * 0.22, 0, 0, TAU); g.fill();        // lower bout
    g.beginPath(); g.ellipse(0, -s * 0.16, s * 0.21, s * 0.17, 0, 0, TAU); g.fill();       // upper bout
    g.fillRect(-s * 0.15, -s * 0.12, s * 0.3, s * 0.26);                                   // waist
    g.fillStyle = ink; g.fillRect(-s * 0.045, -s * 0.62, s * 0.09, s * 0.62);               // neck
    g.fillStyle = '#5a2a06'; g.beginPath(); g.arc(0, -s * 0.66, s * 0.06, 0, TAU); g.fill(); // scroll
    g.lineWidth = s * 0.018; g.strokeStyle = ink; for (const x of [-0.09, 0.09]) { g.beginPath(); g.moveTo(s * x, -s * 0.02); g.bezierCurveTo(s * x * 1.6, s * 0.06, s * x * 0.4, s * 0.16, s * x, s * 0.24); g.stroke(); }  // f-holes
    g.fillStyle = ink; g.fillRect(-s * 0.1, s * 0.25, s * 0.2, s * 0.035);                   // bridge
    g.strokeStyle = '#f5f0e0'; g.lineWidth = s * 0.008; for (let i = 0; i < 4; i++) { const x = -s * 0.03 + i * s * 0.02; g.beginPath(); g.moveTo(x, -s * 0.6); g.lineTo(x, s * 0.36); g.stroke(); }
    g.fillStyle = ink; g.beginPath(); g.moveTo(-s * 0.06, s * 0.33); g.lineTo(s * 0.06, s * 0.33); g.lineTo(s * 0.03, s * 0.42); g.lineTo(-s * 0.03, s * 0.42); g.closePath(); g.fill();  // tailpiece
    g.restore();
    // the bow across it
    g.strokeStyle = '#f5f0e0'; g.lineWidth = w * 0.012; g.beginPath(); g.moveTo(w * 0.06, h * 0.28); g.lineTo(w * 0.94, h * 0.62); g.stroke();
    g.strokeStyle = '#3a1a04'; g.lineWidth = w * 0.02; g.beginPath(); g.moveTo(w * 0.06, h * 0.25); g.lineTo(w * 0.94, h * 0.59); g.stroke();
  },
  sunflowers(g, w, h) {
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, '#0f6b6b'], [1, '#0a4848']]); g.fillRect(0, 0, w, h);
    g.fillStyle = '#c98a2b'; g.fillRect(0, h * 0.84, w, h * 0.16);                       // the table
    // stems
    g.strokeStyle = '#2e7d32'; g.lineWidth = w * 0.03; for (const [x, y] of [[0.28, 0.3], [0.55, 0.2], [0.76, 0.38]]) { g.beginPath(); g.moveTo(w * 0.5, h * 0.62); g.quadraticCurveTo(w * (x + 0.5) / 2, h * 0.5, w * x, h * y); g.stroke(); }
    // three sunflowers
    for (const [x, y, r] of [[0.28, 0.3, 0.17], [0.55, 0.2, 0.19], [0.76, 0.38, 0.15]]) {
      const cx = w * x, cy = h * y, R = w * r;
      g.fillStyle = '#ffc61a'; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; g.save(); g.translate(cx, cy); g.rotate(a); g.beginPath(); g.ellipse(R * 0.62, 0, R * 0.42, R * 0.16, 0, 0, TAU); g.fill(); g.restore(); }
      g.fillStyle = '#ff9d00'; for (let i = 0; i < 14; i++) { const a = (i + 0.5) / 14 * TAU; g.save(); g.translate(cx, cy); g.rotate(a); g.beginPath(); g.ellipse(R * 0.55, 0, R * 0.32, R * 0.11, 0, 0, TAU); g.fill(); g.restore(); }
      circ(g, cx, cy, R * 0.4, '#4a2a0c'); circ(g, cx, cy, R * 0.25, '#2a1606');
    }
    // the blue vase
    g.fillStyle = lin(g, w * 0.32, 0, w * 0.68, 0, [[0, '#1c3fa0'], [0.45, '#4f7cff'], [1, '#132c73']]);
    g.beginPath(); g.moveTo(w * 0.4, h * 0.58); g.lineTo(w * 0.6, h * 0.58); g.quadraticCurveTo(w * 0.74, h * 0.72, w * 0.62, h * 0.86); g.lineTo(w * 0.38, h * 0.86); g.quadraticCurveTo(w * 0.26, h * 0.72, w * 0.4, h * 0.58); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(w * 0.36, h * 0.7, w * 0.28, h * 0.02);
  },
  stars(g, w, h) {
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, '#060c2e'], [0.7, '#14246b'], [1, '#1d2f80']]); g.fillRect(0, 0, w, h);
    // swirls of light
    g.strokeStyle = 'rgba(140,190,255,.55)'; g.lineWidth = h * 0.02; g.lineCap = 'round';
    for (const [x, y, r] of [[0.35, 0.36, 0.15], [0.66, 0.54, 0.11]]) { g.beginPath(); for (let a = 0; a < TAU * 1.6; a += 0.1) { const rr = w * r * (1 - a / (TAU * 2)); g.lineTo(w * x + Math.cos(a) * rr, h * y + Math.sin(a) * rr * 0.75); } g.stroke(); }
    // the moon
    circ(g, w * 0.76, h * 0.2, w * 0.13, '#fff3b0'); circ(g, w * 0.82, h * 0.17, w * 0.11, '#0a1440');
    circ(g, w * 0.76, h * 0.2, w * 0.22, 'rgba(255,243,176,.12)');
    // stars: bright four-pointed
    g.fillStyle = '#fff8d8';
    for (const [x, y, r] of [[0.15, 0.14, 0.05], [0.5, 0.12, 0.04], [0.32, 0.55, 0.035], [0.88, 0.45, 0.04], [0.58, 0.32, 0.03], [0.12, 0.42, 0.03]]) {
      const cx = w * x, cy = h * y, R = w * r; g.beginPath();
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, rr = i % 2 ? R * 0.3 : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.closePath(); g.fill(); circ(g, cx, cy, R * 1.4, 'rgba(255,248,216,.15)'); g.fillStyle = '#fff8d8';
    }
    // a village on the hills
    g.fillStyle = '#050816'; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * 0.74); g.quadraticCurveTo(w * 0.3, h * 0.64, w * 0.55, h * 0.76); g.quadraticCurveTo(w * 0.8, h * 0.86, w, h * 0.7); g.lineTo(w, h); g.fill();
    g.fillStyle = '#ffd34d'; for (const [x, y] of [[0.2, 0.8], [0.3, 0.84], [0.62, 0.86], [0.8, 0.83]]) g.fillRect(w * x, h * y, w * 0.03, h * 0.025);
    // a cypress tree, like a flame
    g.fillStyle = '#0d1f12'; g.beginPath(); g.moveTo(w * 0.1, h); g.quadraticCurveTo(w * 0.02, h * 0.6, w * 0.13, h * 0.32); g.quadraticCurveTo(w * 0.22, h * 0.6, w * 0.17, h); g.fill();
  },
  hands(g, w, h) {
    // a marble sculpture of two open hands, holding a light
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, '#3b2a4a'], [1, '#1d1426']]); g.fillRect(0, 0, w, h);
    circ(g, w * 0.5, h * 0.4, w * 0.45, 'rgba(255,214,120,.18)');
    circ(g, w * 0.5, h * 0.4, w * 0.13, 'rgba(255,230,160,.35)');
    circ(g, w * 0.5, h * 0.4, w * 0.075, '#fff2b8');                                          // the light they hold
    g.fillStyle = '#6d5a4e'; g.fillRect(w * 0.26, h * 0.82, w * 0.48, h * 0.18);                // plinth
    g.fillStyle = '#8a7566'; g.fillRect(w * 0.22, h * 0.8, w * 0.56, h * 0.04);
    const marble = lin(g, 0, h * 0.4, 0, h * 0.8, [[0, '#fbf6ee'], [1, '#c9bfb2']]);
    for (const sx of [-1, 1]) {
      g.save(); g.translate(w * 0.5, 0); g.scale(sx, 1);
      g.fillStyle = marble; g.strokeStyle = '#8f8172'; g.lineWidth = w * 0.012;
      // palm and wrist
      g.beginPath(); g.moveTo(w * 0.02, h * 0.62); g.quadraticCurveTo(w * 0.04, h * 0.72, w * 0.1, h * 0.8); g.lineTo(w * 0.24, h * 0.8); g.quadraticCurveTo(w * 0.3, h * 0.66, w * 0.34, h * 0.56); g.lineTo(w * 0.36, h * 0.46); g.quadraticCurveTo(w * 0.2, h * 0.58, w * 0.02, h * 0.62); g.closePath(); g.fill(); g.stroke();
      // four fingers curving up and in, and a thumb
      for (const [x, y, a, l] of [[0.33, 0.47, -0.15, 0.2], [0.28, 0.5, -0.05, 0.22], [0.22, 0.53, 0.06, 0.2], [0.16, 0.56, 0.18, 0.16]]) {
        g.save(); g.translate(w * x, h * y); g.rotate(a); g.beginPath(); g.ellipse(0, -h * l / 2, w * 0.035, h * l / 2, 0, 0, TAU); g.fill(); g.stroke(); g.restore();
      }
      g.save(); g.translate(w * 0.09, h * 0.6); g.rotate(-0.9); g.beginPath(); g.ellipse(0, -h * 0.06, w * 0.035, h * 0.07, 0, 0, TAU); g.fill(); g.stroke(); g.restore();
      g.restore();
    }
  },
  dancer(g, w, h) {
    g.fillStyle = lin(g, 0, 0, 0, h, [[0, '#4a1240'], [1, '#2a0a24']]); g.fillRect(0, 0, w, h);
    // the stage light
    g.fillStyle = 'rgba(255,220,240,.22)'; g.beginPath(); g.moveTo(w * 0.42, 0); g.lineTo(w * 0.58, 0); g.lineTo(w * 0.9, h * 0.92); g.lineTo(w * 0.1, h * 0.92); g.closePath(); g.fill();
    g.fillStyle = '#7a3a2a'; g.fillRect(0, h * 0.9, w, h * 0.1);
    g.fillStyle = 'rgba(255,220,240,.35)'; g.beginPath(); g.ellipse(w * 0.5, h * 0.91, w * 0.36, h * 0.03, 0, 0, TAU); g.fill();
    const skin = '#f2c6a0', cx = w * 0.5;
    g.strokeStyle = skin; g.lineCap = 'round'; g.lineWidth = w * 0.045;
    // arms raised in a circle above her head
    g.beginPath(); g.moveTo(cx - w * 0.05, h * 0.33); g.quadraticCurveTo(cx - w * 0.28, h * 0.2, cx - w * 0.06, h * 0.08); g.stroke();
    g.beginPath(); g.moveTo(cx + w * 0.05, h * 0.33); g.quadraticCurveTo(cx + w * 0.28, h * 0.2, cx + w * 0.06, h * 0.08); g.stroke();
    // legs: one on point, one lifted
    g.lineWidth = w * 0.05; g.beginPath(); g.moveTo(cx - w * 0.02, h * 0.6); g.lineTo(cx - w * 0.03, h * 0.89); g.stroke();
    g.beginPath(); g.moveTo(cx + w * 0.03, h * 0.6); g.quadraticCurveTo(cx + w * 0.22, h * 0.66, cx + w * 0.36, h * 0.6); g.stroke();
    g.fillStyle = '#ff7eb6'; g.fillRect(cx - w * 0.055, h * 0.86, w * 0.05, h * 0.035);
    // body and bodice
    g.fillStyle = '#ff4f9a'; g.beginPath(); g.moveTo(cx - w * 0.07, h * 0.3); g.lineTo(cx + w * 0.07, h * 0.3); g.lineTo(cx + w * 0.05, h * 0.55); g.lineTo(cx - w * 0.05, h * 0.55); g.closePath(); g.fill();
    // the tutu
    g.fillStyle = '#ffd1e6'; g.beginPath(); g.ellipse(cx, h * 0.56, w * 0.3, h * 0.06, -0.12, 0, TAU); g.fill();
    g.strokeStyle = '#ff7eb6'; g.lineWidth = w * 0.01; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(cx + i * w * 0.03, h * 0.54); g.lineTo(cx + i * w * 0.066, h * 0.585 - i * h * 0.004); g.stroke(); }
    // head and hair bun
    circ(g, cx, h * 0.24, w * 0.075, skin); circ(g, cx, h * 0.17, w * 0.045, '#3a1a0a');
    g.fillStyle = '#3a1a0a'; g.beginPath(); g.arc(cx, h * 0.23, w * 0.078, Math.PI, TAU); g.fill();
  },
  sunrise(g, w, h) {
    g.fillStyle = lin(g, 0, 0, 0, h * 0.7, [[0, '#2a1b6e'], [0.45, '#e2557a'], [0.8, '#ff9f45'], [1, '#ffd36a']]); g.fillRect(0, 0, w, h);
    // the rising sun with rays
    g.strokeStyle = 'rgba(255,236,160,.7)'; g.lineWidth = w * 0.02; for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) / 9 * Math.PI; g.beginPath(); g.moveTo(w * 0.5 + Math.cos(a) * w * 0.22, h * 0.58 + Math.sin(a) * w * 0.22); g.lineTo(w * 0.5 + Math.cos(a) * w * 0.4, h * 0.58 + Math.sin(a) * w * 0.4); g.stroke(); }
    circ(g, w * 0.5, h * 0.58, w * 0.18, '#ffeaa0');
    // mountains with snowy peaks
    const mtn = (pts, fill, snow) => {
      g.fillStyle = fill; g.beginPath(); g.moveTo(0, h); pts.forEach(([x, y]) => g.lineTo(w * x, h * y)); g.lineTo(w, h); g.closePath(); g.fill();
      if (snow) { g.fillStyle = '#ffffff'; for (const [x, y] of pts.filter(p => p[2])) { g.beginPath(); g.moveTo(w * x, h * y); g.lineTo(w * (x - 0.07), h * (y + 0.09)); g.lineTo(w * (x - 0.02), h * (y + 0.07)); g.lineTo(w * x, h * (y + 0.1)); g.lineTo(w * (x + 0.03), h * (y + 0.07)); g.lineTo(w * (x + 0.07), h * (y + 0.09)); g.closePath(); g.fill(); } }
    };
    mtn([[0, 0.7], [0.25, 0.42, 1], [0.45, 0.66], [0.72, 0.38, 1], [1, 0.62]], '#3c2a7a', true);
    mtn([[0, 0.86], [0.2, 0.72], [0.4, 0.84], [0.62, 0.7], [0.85, 0.82], [1, 0.76]], '#1d1446', false);
    // two birds
    g.strokeStyle = '#1d1446'; g.lineWidth = w * 0.015; for (const [x, y] of [[0.28, 0.2], [0.38, 0.26]]) { g.beginPath(); g.moveTo(w * x - w * 0.05, h * y); g.quadraticCurveTo(w * x - w * 0.02, h * y - h * 0.03, w * x, h * y); g.quadraticCurveTo(w * x + w * 0.02, h * y - h * 0.03, w * x + w * 0.05, h * y); g.stroke(); }
  },
};

// one framed painting, drawn to fill a W×H canvas
export function drawPainting(g, id, W, H) {
  const b = Math.round(Math.min(W, H) * 0.14);
  frame(g, W, H, b);
  g.save(); g.translate(b, b); g.beginPath(); g.rect(0, 0, W - 2 * b, H - 2 * b); g.clip();
  PICTURE[id](g, W - 2 * b, H - 2 * b);
  // a soft varnish sheen
  g.fillStyle = lin(g, 0, 0, W - 2 * b, H - 2 * b, [[0, 'rgba(255,255,255,.12)'], [0.4, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,0,.18)']]); g.fillRect(0, 0, W - 2 * b, H - 2 * b);
  g.restore();
}

export const ASPECT = 1.25;   // every painting is 4 wide × 5 tall
const cache = new Map();
function tex(id) {
  if (cache.has(id)) return cache.get(id);
  const c = document.createElement('canvas'); c.width = 320; c.height = 400; drawPainting(c.getContext('2d'), id, 320, 400);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t._shared = true; cache.set(id, t); return t;
}
let glowT = null;
function glowTex() {
  if (glowT) return glowT;
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = rad(g, 64, 64, 0, 64, [[0, 'rgba(255,225,150,1)'], [0.35, 'rgba(255,200,100,.5)'], [1, 'rgba(255,190,80,0)']]); g.fillRect(0, 0, 128, 128);
  glowT = new THREE.CanvasTexture(c); glowT._shared = true; return glowT;
}

// the game piece: a framed painting with a golden glow behind it and a soft shadow
export function painting(id, width) {
  const group = new THREE.Group(), H = width * ASPECT;
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(width * 2.4, H * 2.1), new THREE.MeshBasicMaterial({ map: glowTex(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.renderOrder = 20; group.add(glow);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.06, H * 1.06), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.55, depthWrite: false }));
  shadow.position.set(width * 0.04, -width * 0.05, -0.002); shadow.renderOrder = 21; group.add(shadow);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, H), new THREE.MeshBasicMaterial({ map: tex(id), transparent: true, depthWrite: false }));
  face.renderOrder = 22; group.add(face);
  let lit = 0.3, glowV = 0, fadeV = 1;
  const api = {
    group, width, height: H,
    light(v) { lit = v; },               // 0 = in the dark, 1 = fully lit
    glow(v) { glowV = v; },              // the golden glow round it
    fade(v) { fadeV = v; },              // 0 = invisible, 1 = solid (it appears as the light reveals it)
    tick(t, dt) {
      const k = 0.25 + 0.95 * lit; face.material.color.setRGB(k, k * 0.97, k * 0.9);
      face.material.opacity = fadeV; group.visible = fadeV > 0.001;
      glow.material.opacity = glowV * fadeV * (0.75 + 0.25 * Math.sin(t * 2.3));
      shadow.material.opacity = 0.55 * (1 - glowV * 0.6) * fadeV;
    },
  };
  api.tick(0, 0); return api;
}
