// RELIROO (Rusty Perez): the drawn props for "Off-Duty Fetch".
// Relish herself is the real dog cut out of the painting (media/games/reliroo/relish.png, harness off, with a warm
// golden rim of light from the glowing path); the painting behind her is media/games/reliroo/clean.jpg.
// Drawn here: the tennis ball (with a soft glow so it reads on the busy painting) and a petal for the flower puffs.
// draw*(g, W, H) are plain canvas drawings (so they can be previewed anywhere); *Tex() wrap them as textures.
import * as K from './kit.js';

export function drawBall(g, W, H) {
  const x = W / 2, y = H / 2, r = Math.min(W, H) * 0.36;
  const hal = g.createRadialGradient(x, y, r * 0.6, x, y, r * 1.38); hal.addColorStop(0, 'rgba(240,255,120,.55)'); hal.addColorStop(1, 'rgba(240,255,120,0)');
  g.fillStyle = hal; g.fillRect(0, 0, W, H);
  const grd = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r); grd.addColorStop(0, '#f6ff7a'); grd.addColorStop(1, '#b6d81e');
  g.fillStyle = grd; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.16;
  g.beginPath(); g.arc(x - r * 0.9, y, r * 0.75, -0.9, 0.9); g.stroke();
  g.beginPath(); g.arc(x + r * 0.9, y, r * 0.75, Math.PI - 0.9, Math.PI + 0.9); g.stroke();
}
// one petal, white so it can be tinted orange or yellow like the flowers in the painting
export function drawPetal(g, W, H) {
  g.save(); g.translate(W / 2, H / 2); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, 0, W * 0.42, H * 0.2, 0.4, 0, Math.PI * 2); g.fill(); g.restore();
}

const cache = new Map();
const once = (key, make) => { if (!cache.has(key)) { const t = make(); t._shared = true; cache.set(key, t); } return cache.get(key); };
export const ballTex = () => once('ball', () => K.canvasTex(64, 64, drawBall));
export const petalTex = () => once('petal', () => K.canvasTex(32, 32, drawPetal));
