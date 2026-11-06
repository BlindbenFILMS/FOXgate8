// BACK OF A HARLEY: the drawn props for "Ride by feel".
// A big yellow "curve ahead" road sign (one for each way), drawn like a real highway sign with a little wear, and a
// soft warm glow to sit behind it so it reads over the painting.
import * as K from './kit.js';

function sign(dir) {
  return K.canvasTex(256, 256, (g) => {
    const ink = '#15110c';
    g.save(); g.translate(128, 128);
    // the post shadow and the diamond
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.moveTo(6, -110); g.lineTo(116, 6); g.lineTo(6, 122); g.lineTo(-104, 6); g.closePath(); g.fill();
    g.fillStyle = ink; g.beginPath(); g.moveTo(0, -118); g.lineTo(118, 0); g.lineTo(0, 118); g.lineTo(-118, 0); g.closePath(); g.fill();
    const y = g.createLinearGradient(-90, -90, 90, 90); y.addColorStop(0, '#ffd23a'); y.addColorStop(1, '#f2a91c');
    g.fillStyle = y; g.beginPath(); g.moveTo(0, -104); g.lineTo(104, 0); g.lineTo(0, 104); g.lineTo(-104, 0); g.closePath(); g.fill();
    g.strokeStyle = ink; g.lineWidth = 5; g.beginPath(); g.moveTo(0, -94); g.lineTo(94, 0); g.lineTo(0, 94); g.lineTo(-94, 0); g.closePath(); g.stroke();
    // the curved arrow
    g.scale(dir, 1);
    g.strokeStyle = ink; g.lineWidth = 20; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(-14, 62); g.lineTo(-14, 10); g.quadraticCurveTo(-14, -26, 24, -32); g.stroke();
    g.fillStyle = ink; g.beginPath(); g.moveTo(14, -62); g.lineTo(58, -30); g.lineTo(14, 2); g.closePath(); g.fill();
    // a little road wear
    g.scale(dir, 1); g.globalAlpha = 0.18; g.fillStyle = '#7a4a10';
    for (let i = 0; i < 26; i++) { const a = (i * 137.5) % 360 * Math.PI / 180, r = 30 + (i * 37) % 60; g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 2 + (i % 3), 0, Math.PI * 2); g.fill(); }
    g.restore();
  });
}
export const curveLeftTex = sign(-1);
export const curveRightTex = sign(1);
export const glowTex = K.canvasTex(128, 128, (g) => {
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(255,214,90,.9)'); r.addColorStop(0.4, 'rgba(255,190,60,.35)'); r.addColorStop(1, 'rgba(255,170,40,0)');
  g.fillStyle = r; g.fillRect(0, 0, 128, 128);
});

/* ── the distant country he rides past: one long strip per place (2048 × 256, tiles left to right) ──
   The strip covers the painting from 60% down to 80% down; the horizon is at y = 243. Soft, hazy silhouettes in the
   painting's own warm light, a far row and a nearer row, so they slide past at different speeds. */
const W = 2048, H = 256, HZ = 243;
function strip(draw) {
  const t = K.canvasTex(W, H, (g) => {
    const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    // draw a shape three times so the strip wraps without a seam
    const wrap = (fn) => { for (const o of [-W, 0, W]) { g.save(); g.translate(o, 0); fn(); g.restore(); } };
    draw(g, rnd, wrap);
  });
  return t;
}
function ridge(g, rnd, wrap, color, base, amp, step, rough) {
  // a rolling line of hills from left to right, closed down to the bottom
  const pts = []; for (let x = 0; x <= W; x += step) pts.push([x, base - amp * (0.5 + 0.5 * Math.sin(x / W * Math.PI * 2 * 3 + 1.3)) * (0.55 + 0.45 * Math.sin(x / W * Math.PI * 2 * 7)) - rnd() * rough]);
  if (pts[pts.length - 1][0] < W) pts.push([W, pts[0][1]]); else pts[pts.length - 1][1] = pts[0][1];
  wrap(() => { g.fillStyle = color; g.beginPath(); g.moveTo(0, H); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W, H); g.closePath(); g.fill(); });
}
function haze(g, top, color) { const gr = g.createLinearGradient(0, top, 0, HZ); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, color); g.fillStyle = gr; g.globalCompositeOperation = 'source-atop'; g.fillRect(0, top, W, H - top); g.globalCompositeOperation = 'source-over'; }
function ground(g, color) { g.fillStyle = color; g.fillRect(0, HZ, W, H - HZ); }

export const SCENES = {
  // the desert: far flat-topped mesas, nearer buttes and tall saguaros
  desert: strip((g, rnd, wrap) => {
    const mesa = (x, w, h, c) => wrap(() => { g.fillStyle = c; g.beginPath(); g.moveTo(x - w * 0.62, HZ); g.lineTo(x - w * 0.42, HZ - h * 0.9); g.lineTo(x - w * 0.36, HZ - h); g.lineTo(x + w * 0.38, HZ - h); g.lineTo(x + w * 0.44, HZ - h * 0.88); g.lineTo(x + w * 0.66, HZ); g.closePath(); g.fill(); });
    [[180, 300, 70], [700, 420, 92], [1220, 260, 60], [1650, 380, 84]].forEach(([x, w, h]) => mesa(x, w, h, 'rgba(176,132,118,.8)'));
    [[430, 120, 52], [980, 160, 64], [1480, 110, 46], [1900, 140, 58]].forEach(([x, w, h]) => mesa(x, w, h, 'rgba(132,92,80,.9)'));
    haze(g, 140, 'rgba(236,200,160,.55)');
    const cactus = (x, h) => wrap(() => { g.strokeStyle = 'rgba(70,54,44,.95)'; g.lineCap = 'round'; g.lineWidth = 7; g.beginPath(); g.moveTo(x, HZ); g.lineTo(x, HZ - h); g.stroke();
      g.lineWidth = 5; g.beginPath(); g.moveTo(x, HZ - h * 0.45); g.lineTo(x - 12, HZ - h * 0.45); g.lineTo(x - 12, HZ - h * 0.75); g.stroke(); g.beginPath(); g.moveTo(x, HZ - h * 0.58); g.lineTo(x + 11, HZ - h * 0.58); g.lineTo(x + 11, HZ - h * 0.85); g.stroke(); });
    [[90, 46], [560, 34], [860, 52], [1340, 40], [1760, 48], [1990, 30]].forEach(([x, h]) => cactus(x, h));
    ground(g, 'rgba(196,150,108,1)');
  }),
  // the coast: the sea along the horizon with glints, far headlands, a little white lighthouse
  coast: strip((g, rnd, wrap) => {
    ridge(g, rnd, wrap, 'rgba(120,138,146,.75)', 214, 54, 32, 4);
    haze(g, 150, 'rgba(220,226,222,.6)');
    g.fillStyle = 'rgba(96,128,140,1)'; g.fillRect(0, 214, W, HZ - 214);
    g.fillStyle = 'rgba(240,236,214,.7)'; for (let i = 0; i < 90; i++) { const x = rnd() * W, y = 218 + rnd() * 22, w = 8 + rnd() * 30; g.fillRect(x, y, w, 1.6); }
    const light = (x) => wrap(() => { g.fillStyle = 'rgba(90,96,98,1)'; g.beginPath(); g.moveTo(x - 60, 214); g.quadraticCurveTo(x - 10, 186, x + 70, 214); g.closePath(); g.fill();
      g.fillStyle = '#f2ece0'; g.beginPath(); g.moveTo(x - 6, 194); g.lineTo(x - 4, 156); g.lineTo(x + 4, 156); g.lineTo(x + 6, 194); g.closePath(); g.fill();
      g.fillStyle = '#b4472a'; g.fillRect(x - 5, 170, 10, 6); g.fillStyle = '#3a3a3a'; g.fillRect(x - 5, 150, 10, 7); g.fillStyle = 'rgba(255,230,150,.95)'; g.fillRect(x - 3, 151, 6, 5); });
    light(1300);
    ground(g, 'rgba(208,186,146,1)');
  }),
  // the summer storm: soft rolling farm hills, a red barn and silo, round trees and a fence
  rain: strip((g, rnd, wrap) => {
    ridge(g, rnd, wrap, 'rgba(112,126,122,.8)', 200, 60, 24, 3);
    ridge(g, rnd, wrap, 'rgba(84,100,90,.92)', 228, 36, 20, 2);
    haze(g, 140, 'rgba(176,186,190,.5)');
    const tree = (x, r) => wrap(() => { g.fillStyle = 'rgba(58,72,62,.95)'; g.beginPath(); g.arc(x, HZ - r * 1.3, r, 0, Math.PI * 2); g.arc(x + r * 0.7, HZ - r, r * 0.8, 0, Math.PI * 2); g.fill(); g.fillRect(x - 1.5, HZ - r * 0.6, 3, r * 0.6); });
    [[140, 12], [380, 9], [420, 14], [900, 11], [1180, 13], [1560, 10], [1600, 15], [1880, 12]].forEach(([x, r]) => tree(x, r));
    const barn = (x) => wrap(() => { g.fillStyle = 'rgba(138,59,44,1)'; g.fillRect(x, HZ - 22, 34, 22); g.beginPath(); g.moveTo(x - 3, HZ - 22); g.lineTo(x + 17, HZ - 36); g.lineTo(x + 37, HZ - 22); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(240,232,214,.9)'; g.lineWidth = 1.5; g.strokeRect(x + 12, HZ - 14, 10, 14); g.fillStyle = 'rgba(176,180,176,1)'; g.fillRect(x + 40, HZ - 40, 11, 40); g.beginPath(); g.arc(x + 45.5, HZ - 40, 5.5, Math.PI, 0); g.fill(); });
    barn(640); barn(1720);
    wrap(() => { g.strokeStyle = 'rgba(70,62,54,.8)'; g.lineWidth = 2; for (let x = 0; x < W; x += 26) { g.beginPath(); g.moveTo(x, HZ); g.lineTo(x, HZ - 8); g.stroke(); } g.beginPath(); g.moveTo(0, HZ - 6); g.lineTo(W, HZ - 6); g.stroke(); });
    ground(g, 'rgba(118,128,96,1)');
  }),
  // sunset: violet hills, a small town's water tower and windmill, telephone poles and a few warm lights
  sunset: strip((g, rnd, wrap) => {
    ridge(g, rnd, wrap, 'rgba(150,102,122,.78)', 206, 58, 28, 3);
    haze(g, 140, 'rgba(244,170,120,.5)');
    const tower = (x) => wrap(() => { g.strokeStyle = 'rgba(62,44,52,1)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 10, HZ); g.lineTo(x - 6, HZ - 34); g.moveTo(x + 10, HZ); g.lineTo(x + 6, HZ - 34); g.stroke(); g.fillStyle = 'rgba(62,44,52,1)'; g.beginPath(); g.ellipse(x, HZ - 42, 15, 10, 0, 0, Math.PI * 2); g.fill(); g.fillRect(x - 15, HZ - 44, 30, 6); });
    const mill = (x) => wrap(() => { g.strokeStyle = 'rgba(62,44,52,1)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 7, HZ); g.lineTo(x, HZ - 46); g.lineTo(x + 7, HZ); g.stroke(); g.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(x, HZ - 46); g.lineTo(x + Math.cos(a) * 12, HZ - 46 + Math.sin(a) * 12); g.stroke(); } });
    tower(520); mill(980); tower(1600); mill(1880);
    wrap(() => { g.strokeStyle = 'rgba(62,44,52,.85)'; g.lineWidth = 2; for (let x = 60; x < W; x += 170) { g.beginPath(); g.moveTo(x, HZ); g.lineTo(x, HZ - 30); g.moveTo(x - 6, HZ - 27); g.lineTo(x + 6, HZ - 27); g.stroke(); }
      g.lineWidth = 1; g.beginPath(); for (let x = 60; x < W; x += 170) { g.moveTo(x - 6, HZ - 27); g.quadraticCurveTo(x + 79, HZ - 20, x + 164, HZ - 27); } g.stroke(); });
    g.fillStyle = 'rgba(255,214,140,.95)'; for (let i = 0; i < 26; i++) { const x = 1100 + rnd() * 260, y = HZ - 3 - rnd() * 8; g.fillRect(x, y, 2, 2); }
    ground(g, 'rgba(150,96,80,1)');
  }),
};
for (const k in SCENES) { SCENES[k].wrapS = 1000; /* THREE.RepeatWrapping */ SCENES[k].colorSpace = ''; /* read raw, like the painting */ }
