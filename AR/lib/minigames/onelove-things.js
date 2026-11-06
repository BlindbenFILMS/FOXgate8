// ONE LOVE (Anthony Ferraro): the drawn props for "Light up ONE LOVE".
// Three ink birds like the ones flying over the peace sign in the painting, drawn in canvas in five poses
// (wings up, wings level, wings down, perched, singing), and a little red heart for the bursts.
// draw*(g, W, H, …) are plain canvas drawings (so they can be previewed anywhere); *Tex() wrap them as textures.
import * as K from './kit.js';

const INK = '#1b1a18', INK2 = '#3a3834', CHEST = '#efe9da';

// one bird, facing right, centred in a W×H box. pose: 'up' | 'mid' | 'down' | 'perch' | 'sing'
export function drawBird(g, W, H, pose = 'mid') {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 256; g.scale(s, s);
  const perched = pose === 'perch' || pose === 'sing';
  // a soft cream halo so the dark bird reads on the dark hand photo as well as on the cream paper
  const halo = g.createRadialGradient(0, 4, 30, 0, 4, 122); halo.addColorStop(0, 'rgba(250,246,234,.55)'); halo.addColorStop(1, 'rgba(250,246,234,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(0, 4, 122, 0, Math.PI * 2); g.fill();
  g.lineJoin = 'round'; g.lineCap = 'round';
  // tail: a swallow's forked tail
  g.fillStyle = INK;
  g.beginPath();
  if (perched) { g.moveTo(-34, 26); g.lineTo(-92, 74); g.lineTo(-70, 50); g.lineTo(-96, 52); g.lineTo(-30, 12); }
  else { g.moveTo(-40, 6); g.lineTo(-108, 30); g.lineTo(-78, 8); g.lineTo(-110, -10); g.lineTo(-40, -8); }
  g.closePath(); g.fill();
  // the far wing (behind the body), a little lighter
  const wing = (near) => {
    g.fillStyle = near ? INK : INK2;
    const dx = near ? 0 : 10, dy = near ? 0 : -6;
    g.beginPath();
    if (pose === 'up') { g.moveTo(-6 + dx, -10 + dy); g.bezierCurveTo(-20 + dx, -60 + dy, -54 + dx, -96 + dy, -92 + dx, -112 + dy); g.bezierCurveTo(-60 + dx, -70 + dy, -40 + dx, -36 + dy, -30 + dx, -4 + dy); }
    else if (pose === 'mid') { g.moveTo(10 + dx, -8 + dy); g.bezierCurveTo(-20 + dx, -40 + dy, -70 + dx, -44 + dy, -112 + dx, -34 + dy); g.bezierCurveTo(-74 + dx, -18 + dy, -44 + dx, -6 + dy, -24 + dx, 4 + dy); }
    else if (pose === 'down') { g.moveTo(8 + dx, 0 + dy); g.bezierCurveTo(-10 + dx, 30 + dy, -40 + dx, 68 + dy, -78 + dx, 96 + dy); g.bezierCurveTo(-56 + dx, 56 + dy, -40 + dx, 26 + dy, -28 + dx, 6 + dy); }
    else { g.moveTo(12 + dx, -8 + dy); g.bezierCurveTo(-8 + dx, -16 + dy, -44 + dx, -2 + dy, -74 + dx, 42 + dy); g.bezierCurveTo(-40 + dx, 30 + dy, -14 + dx, 18 + dy, 4 + dx, 10 + dy); }
    g.closePath(); g.fill();
  };
  wing(false);
  // body
  g.fillStyle = INK;
  g.beginPath();
  if (perched) g.ellipse(-2, 8, 50, 34, -0.45, 0, Math.PI * 2);
  else g.ellipse(-4, 0, 58, 22, -0.05, 0, Math.PI * 2);
  g.fill();
  // pale chest, like the light undersides of the birds in the painting
  g.fillStyle = CHEST;
  g.beginPath();
  if (perched) { g.ellipse(26, 14, 18, 24, -0.5, 0, Math.PI * 2); }
  else { g.ellipse(14, 9, 30, 9, 0, 0, Math.PI * 2); }
  g.fill();
  // head
  const hx = perched ? 40 : 52, hy = perched ? -22 : -4;
  g.fillStyle = INK; g.beginPath(); g.arc(hx, hy, perched ? 24 : 21, 0, Math.PI * 2); g.fill();
  // beak (open when singing)
  g.fillStyle = '#2b2925';
  if (pose === 'sing') {
    g.beginPath(); g.moveTo(hx + 18, hy - 8); g.lineTo(hx + 50, hy - 20); g.lineTo(hx + 22, hy + 1); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(hx + 18, hy + 4); g.lineTo(hx + 46, hy + 14); g.lineTo(hx + 20, hy + 11); g.closePath(); g.fill();
  } else {
    g.beginPath(); g.moveTo(hx + 18, hy - 7); g.lineTo(hx + 46, hy + 1); g.lineTo(hx + 18, hy + 8); g.closePath(); g.fill();
  }
  // eye: a bright ring so it reads as a face
  g.fillStyle = '#fbf6e8'; g.beginPath(); g.arc(hx + 8, hy - 5, 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#000'; g.beginPath(); g.arc(hx + 9.5, hy - 5, 3.6, 0, Math.PI * 2); g.fill();
  wing(true);
  // little feet when perched
  if (perched) {
    g.strokeStyle = INK; g.lineWidth = 5;
    for (const fx of [-2, 16]) { g.beginPath(); g.moveTo(fx, 36); g.lineTo(fx + 2, 56); g.lineTo(fx + 12, 58); g.stroke(); }
  }
  g.restore();
}

// a red heart, in the letters' red, with a white edge so it shows on any part of the painting
export function drawHeart(g, W, H, color = '#d81e3c') {
  g.save(); g.translate(W / 2, H / 2 + H * 0.04); const s = Math.min(W, H) / 256; g.scale(s, s);
  const path = () => { g.beginPath(); g.moveTo(0, 86); g.bezierCurveTo(-120, 10, -96, -92, -30, -82); g.bezierCurveTo(-10, -78, 0, -60, 0, -46); g.bezierCurveTo(0, -60, 10, -78, 30, -82); g.bezierCurveTo(96, -92, 120, 10, 0, 86); g.closePath(); };
  path(); g.lineWidth = 16; g.strokeStyle = '#fff8ec'; g.lineJoin = 'round'; g.stroke();
  path(); g.fillStyle = color; g.fill();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-46, -46, 20, 12, -0.6, 0, Math.PI * 2); g.fill();
  g.restore();
}

export const POSES = ['up', 'mid', 'down', 'perch', 'sing'];
const cache = {};
export function birdTex(pose) { return cache[pose] || (cache[pose] = K.canvasTex(256, 256, (g, W, H) => drawBird(g, W, H, pose))); }
export function heartTex() { return cache.heart || (cache.heart = K.canvasTex(128, 128, (g, W, H) => drawHeart(g, W, H))); }

// a music note (a beamed pair of eighth notes), in a colour, with a cream edge so it reads on any part of the painting
export function drawNote(g, W, H, color = '#ffc83d') {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 256; g.scale(s, s);
  const path = () => { g.beginPath();
    g.ellipse(-46, 60, 30, 22, -0.4, 0, Math.PI * 2); g.moveTo(84, 40); g.ellipse(54, 40, 30, 22, -0.4, 0, Math.PI * 2);
    g.rect(-24, -78, 14, 140); g.rect(76, -98, 14, 140);
    g.moveTo(-24, -78); g.lineTo(90, -98); g.lineTo(90, -66); g.lineTo(-24, -46); g.closePath(); };
  path(); g.lineWidth = 18; g.strokeStyle = '#fff8ec'; g.lineJoin = 'round'; g.stroke();
  path(); g.fillStyle = color; g.fill();
  g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(-54, 52, 10, 6, -0.4, 0, Math.PI * 2); g.fill();
  g.restore();
}
// a burst of coloured rays (a lit letter's flash), transparent at the edges so it can be added over the painting
export function drawBurst(g, W, H) {
  const c = W / 2, cols = ['#ff3b52', '#ffc83d', '#2fbf71', '#ff7ab8', '#9b6bff', '#36c5f0'];
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2, w = 0.07, q = g.createLinearGradient(c, c, c + Math.cos(a) * c, c + Math.sin(a) * c);
    q.addColorStop(0, cols[i % cols.length]); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q;
    g.beginPath(); g.moveTo(c, c); g.arc(c, c, c * (i % 2 ? 0.75 : 1), a - w, a + w); g.closePath(); g.fill();
  }
  const r = g.createRadialGradient(c, c, 0, c, c, c * 0.35); r.addColorStop(0, 'rgba(255,250,230,1)'); r.addColorStop(1, 'rgba(255,250,230,0)'); g.fillStyle = r; g.fillRect(0, 0, W, H);
}
export function noteTex(color) { return cache['note' + color] || (cache['note' + color] = K.canvasTex(128, 128, (g, W, H) => drawNote(g, W, H, color))); }
export function heartTexC(color) { return cache['heart' + color] || (cache['heart' + color] = K.canvasTex(128, 128, (g, W, H) => drawHeart(g, W, H, color))); }
export function burstTex() { return cache.burst || (cache.burst = K.canvasTex(256, 256, drawBurst)); }
