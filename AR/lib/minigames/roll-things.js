// LIGHT ON THE OTHER SIDE (Anthony Ferraro): the drawn props for "Keep rolling".
// Things in the skater's way on the road through the dark wave, painted in quick oil-paint strokes like the painting:
// lit warm from the light ahead (the left), cool blue in their shadows (the right). Plus a spark of light.
// draw*(g, W, H) are plain canvas drawings (so they can be previewed anywhere); thingTex(id) wraps them as textures.
import * as K from './kit.js';

// a few dabs of paint along a shape, so edges look brushed, not drawn with a ruler
function dabs(g, pts, cols, w = 6, jitter = 3, seed = 1) {
  let s = seed; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  g.lineCap = 'round';
  for (const [x, y] of pts) {
    g.strokeStyle = cols[Math.floor(rnd() * cols.length)]; g.lineWidth = w * (0.6 + rnd() * 0.8);
    const a = rnd() * Math.PI, l = 6 + rnd() * 10;
    g.beginPath(); g.moveTo(x - Math.cos(a) * l / 2 + (rnd() - 0.5) * jitter, y - Math.sin(a) * l / 2); g.lineTo(x + Math.cos(a) * l / 2, y + Math.sin(a) * l / 2 + (rnd() - 0.5) * jitter); g.stroke();
  }
}
const grid = (x0, y0, x1, y1, step) => { const p = []; for (let y = y0; y <= y1; y += step) for (let x = x0; x <= x1; x += step) p.push([x, y]); return p; };
function glow(g, x, y, r, a = 0.5) { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(255,214,140,${a})`); q.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); }

export const THINGS = {
  // a jagged crack across the road
  crack(g, W, H) {
    glow(g, W * 0.45, H * 0.62, W * 0.42, 0.35);
    const pts = [[20, 100], [58, 88], [84, 104], [118, 82], [146, 98], [176, 78], [206, 96], [236, 86]];
    g.lineJoin = 'round'; g.lineCap = 'round';
    g.strokeStyle = '#ffd99a'; g.lineWidth = 22; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + 4) : g.moveTo(x, y + 4)); g.stroke();
    g.strokeStyle = '#0a1420'; g.lineWidth = 13; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    g.strokeStyle = '#1d3448'; g.lineWidth = 5; g.beginPath(); g.moveTo(84, 104); g.lineTo(92, 126); g.moveTo(176, 78); g.lineTo(170, 58); g.stroke();
  },
  // a concrete curb block, lit on its left face
  curb(g, W, H) {
    glow(g, W * 0.4, H * 0.6, W * 0.45, 0.3);
    g.fillStyle = 'rgba(8,16,28,.55)'; g.beginPath(); g.ellipse(150, 132, 100, 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e8c48a'; g.beginPath(); g.moveTo(34, 70); g.lineTo(204, 60); g.lineTo(224, 74); g.lineTo(52, 86); g.closePath(); g.fill();   // top
    g.fillStyle = '#c99a5c'; g.beginPath(); g.moveTo(34, 70); g.lineTo(52, 86); g.lineTo(52, 128); g.lineTo(34, 112); g.closePath(); g.fill();  // lit end
    g.fillStyle = '#3c5670'; g.beginPath(); g.moveTo(52, 86); g.lineTo(224, 74); g.lineTo(224, 116); g.lineTo(52, 128); g.closePath(); g.fill(); // front, in shadow
    dabs(g, grid(60, 64, 210, 80, 8), ['#f0d09a', '#e2b878', '#f6dcaa'], 2.5, 2, 3);
    dabs(g, grid(58, 92, 218, 120, 8), ['#34506a', '#40607e', '#2e475f'], 3, 2, 7);
    g.strokeStyle = '#fff1d0'; g.lineWidth = 4; g.beginPath(); g.moveTo(36, 70); g.lineTo(204, 60); g.stroke();
  },
  // a puddle that catches the light
  puddle(g, W, H) {
    g.fillStyle = '#0d2236'; g.beginPath(); g.ellipse(128, 96, 108, 34, -0.04, 0, Math.PI * 2); g.fill();
    const q = g.createLinearGradient(30, 96, 230, 96); q.addColorStop(0, '#ffe2a8'); q.addColorStop(0.45, '#7fb6d6'); q.addColorStop(1, '#173a5a');
    g.fillStyle = q; g.beginPath(); g.ellipse(128, 94, 96, 26, -0.04, 0, Math.PI * 2); g.fill();
    dabs(g, [[70, 92], [96, 100], [120, 88], [150, 96], [176, 90], [86, 84], [140, 104]], ['#fff4d6', '#cfe8f6', '#ffd38a'], 4, 2, 11);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3;
    for (const r of [18, 32]) { g.beginPath(); g.ellipse(110, 94, r, r * 0.3, 0, 0, Math.PI * 2); g.stroke(); }
  },
  // a rock in the road
  rock(g, W, H) {
    glow(g, W * 0.4, H * 0.55, W * 0.4, 0.3);
    g.fillStyle = 'rgba(8,16,28,.55)'; g.beginPath(); g.ellipse(142, 134, 76, 12, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#34485e'; g.beginPath(); g.moveTo(66, 130); g.bezierCurveTo(60, 80, 100, 44, 140, 48); g.bezierCurveTo(184, 52, 206, 96, 200, 132); g.closePath(); g.fill();
    g.fillStyle = '#d8a866'; g.beginPath(); g.moveTo(66, 130); g.bezierCurveTo(60, 84, 96, 50, 126, 50); g.bezierCurveTo(110, 74, 100, 104, 104, 132); g.closePath(); g.fill();
    dabs(g, grid(76, 60, 112, 124, 7), ['#e2b272', '#cf9c5c', '#ecc58a'], 3, 2, 5);
    dabs(g, grid(122, 60, 192, 126, 7), ['#2e4258', '#3c546e', '#34485e'], 3, 2, 9);
  },
  // a traffic cone, in the light's glow
  cone(g, W, H) {
    glow(g, W * 0.45, H * 0.5, W * 0.42, 0.3);
    g.fillStyle = 'rgba(8,16,28,.55)'; g.beginPath(); g.ellipse(140, 140, 70, 10, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2b2622'; g.beginPath(); g.moveTo(78, 138); g.lineTo(178, 138); g.lineTo(170, 126); g.lineTo(86, 126); g.closePath(); g.fill();
    g.fillStyle = '#e8641e'; g.beginPath(); g.moveTo(92, 128); g.lineTo(164, 128); g.lineTo(132, 18); g.lineTo(124, 18); g.closePath(); g.fill();
    g.fillStyle = '#ffa25a'; g.beginPath(); g.moveTo(92, 128); g.lineTo(118, 128); g.lineTo(126, 18); g.lineTo(124, 18); g.closePath(); g.fill();
    g.fillStyle = '#f5efe2'; g.beginPath(); g.moveTo(104, 88); g.lineTo(152, 88); g.lineTo(146, 66); g.lineTo(110, 66); g.closePath(); g.fill();
    g.fillStyle = '#8a3010'; g.beginPath(); g.moveTo(136, 128); g.lineTo(164, 128); g.lineTo(132, 18); g.closePath(); g.fill();
    dabs(g, [[112, 110], [140, 112], [120, 46], [132, 100]], ['#ff8a3c', '#c9480f'], 4, 2, 13);
  },
};
export const IDS = Object.keys(THINGS);

// a spark of warm light (what the light gives back after each thing he gets past)
export function drawSpark(g, W, H) {
  const c = W / 2; glow(g, c, c, c, 0.9);
  g.strokeStyle = 'rgba(255,246,220,.95)'; g.lineWidth = W * 0.035; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(c - Math.cos(a) * W * 0.32, c - Math.sin(a) * W * 0.32); g.lineTo(c + Math.cos(a) * W * 0.32, c + Math.sin(a) * W * 0.32); g.stroke(); }
  g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(c, c, W * 0.08, 0, Math.PI * 2); g.fill();
}

const cache = {};
export function thingTex(id) { return cache[id] || (cache[id] = K.canvasTex(256, 160, (g, W, H) => THINGS[id](g, W, H))); }
export function sparkTex() { return cache.spark || (cache.spark = K.canvasTex(128, 128, drawSpark)); }
