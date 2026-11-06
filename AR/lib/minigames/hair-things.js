// I AM BLIND, LIKE MY HAIR IS BROWN (Alayna Lopez): the props for "Still Me".
// The painting is a mosaic self-portrait: flat shapes of cream, teal, yellow, salmon and orange, big brown eyes, and long dark
// brown hair on a warm tan wall. The game's pieces are cut from the painting itself, along its own shapes, so they fit back exactly.
//  · PIECES: the 8 face pieces (forehead, nose, two cheeks, smile, chin, then the two eyes), as polygons on the 1024 × 1024 painting
//  · an empty spot: the tan wall showing through, with a dashed outline (and a glow when it's the one humming)
//  · a piece: the painting cut to its polygon, with a dark edge so it reads when it floats over the hair
// draw*(…) are plain canvas drawings; *Canvas() / *Tex() build them from the loaded painting.
import * as K from './kit.js';

export const WALL = '#ead3a8';
// [name, spoken name, polygon]; the eyes come last
export const PIECES = [
  { id: 'forehead', say: 'Her forehead.', poly: [[292, 300], [300, 252], [372, 196], [446, 150], [512, 104], [586, 186], [656, 250], [706, 300], [512, 306]] },
  { id: 'nose', say: 'Her nose.', poly: [[428, 306], [512, 306], [516, 452], [524, 540], [500, 572], [406, 572], [388, 536], [430, 446]] },
  { id: 'cheek1', say: 'One cheek.', poly: [[266, 438], [424, 446], [388, 536], [400, 600], [330, 624], [282, 576], [262, 500]] },
  { id: 'cheek2', say: 'The other cheek.', poly: [[524, 434], [700, 430], [748, 410], [752, 540], [724, 610], [608, 616], [524, 586], [524, 540]] },
  { id: 'mouth', say: 'Her smile.', poly: [[352, 612], [452, 596], [576, 610], [572, 664], [520, 702], [420, 704], [372, 662]] },
  { id: 'chin', say: 'Her chin.', poly: [[372, 704], [420, 704], [520, 702], [600, 690], [612, 744], [540, 784], [452, 794], [384, 760]] },
  { id: 'eye1', say: 'Last of all, her brown eyes. One eye.', poly: [[278, 330], [426, 330], [428, 438], [374, 444], [300, 438], [270, 400]], eye: true },
  { id: 'eye2', say: 'And the other eye.', poly: [[518, 318], [664, 306], [724, 340], [748, 402], [702, 434], [576, 438], [522, 420]], eye: true },
];
export function bounds(poly) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const [x, y] of poly) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}
const path = (g, poly, ox = 0, oy = 0) => { g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x - ox, y - oy) : g.moveTo(x - ox, y - oy)); g.closePath(); };

/* ───────── an empty spot on the board (draw onto the 1024 × 1024 board) ───────── */
export function drawHole(g, poly) {
  g.save(); path(g, poly);
  const b = bounds(poly), q = g.createRadialGradient(b.cx, b.cy, 4, b.cx, b.cy, Math.max(b.w, b.h) * 0.7);
  q.addColorStop(0, '#f3dfba'); q.addColorStop(1, '#d9bd8c');
  g.fillStyle = q; g.fill();
  // the wall's soft texture, so it reads as "empty", not as a new shape
  g.clip(); g.globalAlpha = 0.18; g.strokeStyle = '#a8865a'; g.lineWidth = 2;
  for (let i = -20; i < 40; i++) { g.beginPath(); g.moveTo(b.x0 + i * 14, b.y0 - 10); g.lineTo(b.x0 + i * 14 - 60, b.y1 + 10); g.stroke(); }
  g.restore();
  g.save(); path(g, poly); g.setLineDash([14, 10]); g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
  g.setLineDash([14, 10]); g.lineDashOffset = 12; g.lineWidth = 5; g.strokeStyle = 'rgba(60,40,24,.6)'; g.stroke(); g.restore();
}

/* ───────── a piece, cut from the painting (its own small canvas, with a margin for the edge) ───────── */
export function pieceCanvas(img, poly, scale = 1024 / (img.naturalWidth || img.width)) {
  const b = bounds(poly), M = 12, c = document.createElement('canvas');
  c.width = Math.ceil(b.w + M * 2); c.height = Math.ceil(b.h + M * 2);
  const g = c.getContext('2d'), ox = b.x0 - M, oy = b.y0 - M;
  g.lineJoin = 'round';
  g.save(); path(g, poly, ox, oy); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 10; g.shadowOffsetY = 4; g.fillStyle = '#000'; g.fill(); g.restore();
  g.save(); path(g, poly, ox, oy); g.clip(); g.drawImage(img, -ox, -oy, 1024, 1024); g.restore();
  g.save(); path(g, poly, ox, oy); g.lineWidth = 5; g.strokeStyle = '#1b120c'; g.stroke(); g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.55)'; g.stroke(); g.restore();
  return { canvas: c, b, M };
}
// the pulsing outline round the piece you're looking for: same size and place as its piece canvas
export function outlineTex(poly) {
  const b = bounds(poly), M = 12, ox = b.x0 - M, oy = b.y0 - M, w = Math.ceil(b.w + M * 2), h = Math.ceil(b.h + M * 2);
  return K.canvasTex(w, h, (g) => {
    g.lineJoin = 'round';
    path(g, poly, ox, oy); g.shadowColor = 'rgba(255,200,40,1)'; g.shadowBlur = 14; g.lineWidth = 9; g.strokeStyle = '#ffc928'; g.stroke();
    g.shadowBlur = 0; path(g, poly, ox, oy); g.lineWidth = 3; g.strokeStyle = '#fff6cf'; g.stroke();
  });
}
export function pieceTex(img, poly) { const p = pieceCanvas(img, poly), t = K.canvasTex(p.canvas.width, p.canvas.height, (g) => g.drawImage(p.canvas, 0, 0)); return { tex: t, ...p }; }

/* ───────── the glow on the spot that's humming (draw 256 × 256) ───────── */
export function drawGlow(g, W, H) {
  const q = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
  q.addColorStop(0, 'rgba(255,236,170,.9)'); q.addColorStop(0.45, 'rgba(255,200,90,.45)'); q.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = q; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 6; g.setLineDash([18, 12]); g.beginPath(); g.arc(W / 2, H / 2, W * 0.36, 0, Math.PI * 2); g.stroke();
}
let glowT = null;
export const glowTex = () => glowT || (glowT = Object.assign(K.canvasTex(256, 256, drawGlow), { _shared: true }));
