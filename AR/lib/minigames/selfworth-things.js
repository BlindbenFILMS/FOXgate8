// SELF-WORTH: A NEW UNDERSTANDING: the drawn things for "Set it down".
// Six heavy bundles of old embarrassment (slumped cloth sacks, gathered and tied at the top, each with a big word
// on a white tag), the warm glow that fills the doorway, and a puff of dust for when a bundle hits the ground.
// bundleCanvas(word, size) → a canvas; bundleTex(word) / doorGlowTex() / dustTex() → three.js textures (cached).
import * as K from './kit.js';

export const BUNDLES = ['SORRY', 'HIDING', 'PRETEND', 'SHRINKING', 'ALONE', 'SHAME'];

// a slightly different sack for each word, so they don't look stamped out (SHAME is the biggest and darkest)
const SHAPES = {
  SORRY: { w: 0.80, lean: -0.05, hi: '#b5aa98', lo: '#5a5046' },
  HIDING: { w: 0.74, lean: 0.05, hi: '#a9a6a0', lo: '#4e4c4a' },
  PRETEND: { w: 0.84, lean: 0.02, hi: '#b8ab95', lo: '#5d5143' },
  SHRINKING: { w: 0.76, lean: -0.04, hi: '#a7a29a', lo: '#4f4a45' },
  ALONE: { w: 0.72, lean: 0.03, hi: '#a39f99', lo: '#494744' },
  SHAME: { w: 0.90, lean: 0, hi: '#8f857a', lo: '#2f2a26' },
};

// a soft cloth sack, gathered and tied at the top, slumped and heavy, with its word on a white tag
export function bundleCanvas(word, S = 256) {
  const c = document.createElement('canvas'); c.width = S; c.height = S; const g = c.getContext('2d');
  const sh = SHAPES[word] || SHAPES.SORRY; g.scale(S / 256, S / 256);
  const cx = 128 + sh.lean * 50, bw = 236 * sh.w, bot = 238, neckY = 86, neckW = 30;
  // shadow on the ground: it's heavy
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(cx, bot + 4, bw * 0.46, 10, 0, 0, Math.PI * 2); g.fill();
  // the body: narrow neck, slumping out wide and flat at the bottom
  const body = p => {
    p.beginPath(); p.moveTo(cx - neckW / 2, neckY);
    p.bezierCurveTo(cx - bw * 0.30, neckY + 20, cx - bw * 0.56, bot - 70, cx - bw * 0.50, bot - 18);
    p.quadraticCurveTo(cx - bw * 0.40, bot + 2, cx, bot);
    p.quadraticCurveTo(cx + bw * 0.40, bot + 2, cx + bw * 0.50, bot - 18);
    p.bezierCurveTo(cx + bw * 0.56, bot - 70, cx + bw * 0.30, neckY + 20, cx + neckW / 2, neckY);
    p.closePath();
  };
  const f = g.createLinearGradient(cx - bw / 2, neckY, cx + bw / 3, bot); f.addColorStop(0, sh.hi); f.addColorStop(1, sh.lo);
  g.fillStyle = f; body(g); g.fill();
  // burlap weave and soft folds running up to the neck
  g.save(); body(g); g.clip();
  g.globalAlpha = 0.13; g.strokeStyle = '#1c1915'; g.lineWidth = 1.5;
  for (let y = neckY; y < bot; y += 6) { g.beginPath(); g.moveTo(cx - bw / 2, y); g.lineTo(cx + bw / 2, y); g.stroke(); }
  for (let x = cx - bw / 2; x < cx + bw / 2; x += 6) { g.beginPath(); g.moveTo(x, neckY); g.lineTo(x, bot); g.stroke(); }
  g.globalAlpha = 0.35; g.strokeStyle = '#2a2520'; g.lineWidth = 3;
  for (const k of [-0.6, -0.25, 0.3, 0.62]) { g.beginPath(); g.moveTo(cx + k * 12, neckY + 6); g.quadraticCurveTo(cx + k * bw * 0.35, neckY + 60, cx + k * bw * 0.42, bot - 30); g.stroke(); }
  g.globalAlpha = 0.25; g.strokeStyle = '#fff'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(cx - bw * 0.22, neckY + 34); g.quadraticCurveTo(cx - bw * 0.42, bot - 70, cx - bw * 0.36, bot - 26); g.stroke();
  g.restore();
  g.strokeStyle = '#1e1b18'; g.lineWidth = 4; g.lineJoin = 'round'; body(g); g.stroke();
  // the gathered cloth above the tie: a ruffle of points flaring up
  const top = p => {
    p.beginPath(); p.moveTo(cx - neckW / 2, neckY);
    p.lineTo(cx - 34, 48); p.lineTo(cx - 20, 58); p.lineTo(cx - 14, 30); p.lineTo(cx - 2, 50); p.lineTo(cx + 8, 26); p.lineTo(cx + 14, 52); p.lineTo(cx + 30, 38); p.lineTo(cx + 22, 62); p.lineTo(cx + 36, 60);
    p.lineTo(cx + neckW / 2, neckY); p.closePath();
  };
  const tf = g.createLinearGradient(0, 26, 0, neckY); tf.addColorStop(0, sh.hi); tf.addColorStop(1, sh.lo);
  g.fillStyle = tf; top(g); g.fill(); g.lineWidth = 3.5; top(g); g.stroke();
  // the rope tie, wound twice, with a loose end
  g.strokeStyle = '#3a2f24'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - 22, neckY - 4); g.lineTo(cx + 22, neckY - 4); g.stroke();
  g.beginPath(); g.moveTo(cx - 20, neckY + 4); g.lineTo(cx + 20, neckY + 4); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.moveTo(cx + 20, neckY); g.quadraticCurveTo(cx + 40, neckY + 10, cx + 34, neckY + 30); g.stroke();
  // the word on a big white tag
  let fs = 50; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`;
  while (g.measureText(word).width > 222 && fs > 22) { fs -= 2; g.font = `900 ${fs}px Archivo, "Arial Black", Arial, sans-serif`; }
  const tw = g.measureText(word).width + 20, ty = bot - 62;
  g.save(); g.translate(cx, ty); g.rotate(sh.lean * 0.5);
  g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 3.5;
  g.fillRect(-tw / 2, -fs * 0.64, tw, fs * 1.28); g.strokeRect(-tw / 2, -fs * 0.64, tw, fs * 1.28);
  g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 0, 3);
  g.restore();
  return c;
}

const cache = new Map();
const once = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };
export const bundleTex = word => once('b' + word, () => K.canvasTex(256, 256, g => g.drawImage(bundleCanvas(word, 256), 0, 0)));

// the light pouring out of the doorway: warm white in the middle, soft gold edges (tall, like the door)
export function doorGlowCanvas(W = 192, H = 384) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.filter = 'blur(14px)';
  const r = g.createRadialGradient(W / 2, H * 0.55, 4, W / 2, H * 0.55, H * 0.55);
  r.addColorStop(0, 'rgba(255,252,236,1)'); r.addColorStop(0.35, 'rgba(255,226,140,.85)'); r.addColorStop(0.75, 'rgba(255,190,80,.25)'); r.addColorStop(1, 'rgba(255,170,60,0)');
  g.fillStyle = r; g.fillRect(28, 20, W - 56, H - 40);
  g.filter = 'none';
  // rays
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { const x = W * (0.2 + i * 0.1); const l = g.createLinearGradient(0, 0, 0, H); l.addColorStop(0, 'rgba(255,240,190,0)'); l.addColorStop(0.5, 'rgba(255,240,190,.18)'); l.addColorStop(1, 'rgba(255,240,190,0)'); g.fillStyle = l; g.fillRect(x - 3, 0, 6, H); }
  return c;
}
export const doorGlowTex = () => once('door', () => K.canvasTex(192, 384, g => g.drawImage(doorGlowCanvas(192, 384), 0, 0)));

// a puff of dust when a bundle hits the ground and crumbles away
export function dustCanvas(S = 128) {
  const c = document.createElement('canvas'); c.width = S; c.height = S; const g = c.getContext('2d');
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, d = S * (0.12 + 0.18 * ((i * 37) % 7) / 7), x = S / 2 + Math.cos(a) * d, y = S * 0.6 + Math.sin(a) * d * 0.55, r = S * (0.1 + 0.06 * ((i * 13) % 5) / 5);
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(214,204,190,.7)'); gr.addColorStop(1, 'rgba(214,204,190,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  return c;
}
export const dustTex = () => once('dust', () => K.canvasTex(128, 128, g => g.drawImage(dustCanvas(128), 0, 0)));
