// CLIMB THE SCALE (Academy of Music for the Blind, A Bright Future): the drawn props, in the painting's own style:
// soft watercolour light, warm orange rising to gold and pale sky blue, thin sheet-music lines.
//   thingCanvas(kind, size, i) → a square canvas:
//     'stair'  stair number i (0–7) of the new staircase into the sky: a glowing block of sheet music with
//              its note on it, warm orange at the bottom of the scale rising to gold and sky white at the top
//     'ring'   the soft ring that pulses on the next stair with every beat
//     'note'   a little floating music note (for the sparkles when she lands)
// No emoji, no image files. Plain canvas: no three.js here, so it can be previewed anywhere.

const INK = '#3a1a10';
// colours from the bottom of the scale (warm, like her stairs) to the top (the bright misty sky)
const COLS = [['#ff7a2e', '#c8401a'], ['#ff9433', '#cf5a1c'], ['#ffad3a', '#d4721e'], ['#ffc444', '#d88a22'],
  ['#ffd75e', '#d9a12e'], ['#ffe68a', '#d8b54e'], ['#fff1bc', '#cdb878'], ['#ffffff', '#b9c8d2']];
export const NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Ti', 'Do'];

function stair(g, S, i) {
  const [top, side] = COLS[i % 8];
  // the soft glow around it
  const r = g.createRadialGradient(S * 0.5, S * 0.5, S * 0.1, S * 0.5, S * 0.5, S * 0.5); r.addColorStop(0, 'rgba(255,240,200,.65)'); r.addColorStop(1, 'rgba(255,200,120,0)');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
  // the block: a top face and a front, like her painted stairs, with uneven painted edges
  const x0 = 0.1, x1 = 0.9, y0 = 0.36, y1 = 0.48, y2 = 0.7;
  g.beginPath(); g.moveTo(S * x0, S * y1); g.lineTo(S * (x0 + 0.06), S * y0); g.lineTo(S * (x1 + 0.02), S * (y0 + 0.01)); g.lineTo(S * x1, S * y1); g.closePath();
  g.fillStyle = top; g.fill();
  g.beginPath(); g.moveTo(S * x0, S * y1); g.lineTo(S * x1, S * y1); g.lineTo(S * (x1 - 0.01), S * y2); g.lineTo(S * (x0 + 0.01), S * (y2 + 0.01)); g.closePath();
  const lg = g.createLinearGradient(0, S * y1, 0, S * y2); lg.addColorStop(0, top); lg.addColorStop(1, side); g.fillStyle = lg; g.fill();
  g.lineWidth = S * 0.012; g.strokeStyle = 'rgba(58,26,16,.55)'; g.stroke();
  // sheet-music lines across the front, and its note
  g.strokeStyle = 'rgba(58,26,16,.5)'; g.lineWidth = S * 0.006;
  for (let k = 0; k < 5; k++) { const y = S * (y1 + 0.04 + k * 0.032); g.beginPath(); g.moveTo(S * (x0 + 0.04), y); g.lineTo(S * (x1 - 0.04), y); g.stroke(); }
  const ny = S * (y1 + 0.04 + (4 - Math.min(4, i * 0.55)) * 0.032), nx = S * 0.5;
  g.fillStyle = INK; g.save(); g.translate(nx, ny); g.rotate(-0.4); g.beginPath(); g.ellipse(0, 0, S * 0.045, S * 0.032, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.fillRect(nx + S * 0.034, ny - S * 0.15, S * 0.012, S * 0.15);
  // a bright painted highlight along the top edge
  g.beginPath(); g.moveTo(S * (x0 + 0.08), S * (y0 + 0.02)); g.lineTo(S * (x1 - 0.02), S * (y0 + 0.025)); g.lineWidth = S * 0.018; g.strokeStyle = 'rgba(255,255,255,.75)'; g.stroke();
}
function ring(g, S) {
  g.beginPath(); g.ellipse(S * 0.5, S * 0.5, S * 0.44, S * 0.2, 0, 0, Math.PI * 2); g.lineWidth = S * 0.04; g.strokeStyle = 'rgba(255,255,255,.95)'; g.stroke();
  g.beginPath(); g.ellipse(S * 0.5, S * 0.5, S * 0.44, S * 0.2, 0, 0, Math.PI * 2); g.lineWidth = S * 0.1; g.strokeStyle = 'rgba(255,210,120,.35)'; g.stroke();
}
function noteSpark(g, S) {
  const r = g.createRadialGradient(S * 0.45, S * 0.65, 0, S * 0.45, S * 0.65, S * 0.4); r.addColorStop(0, 'rgba(255,240,190,.9)'); r.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S);
  g.fillStyle = INK; g.save(); g.translate(S * 0.4, S * 0.68); g.rotate(-0.4); g.beginPath(); g.ellipse(0, 0, S * 0.13, S * 0.09, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.fillRect(S * 0.5, S * 0.2, S * 0.04, S * 0.46);
  g.beginPath(); g.moveTo(S * 0.54, S * 0.2); g.quadraticCurveTo(S * 0.7, S * 0.3, S * 0.66, S * 0.44); g.quadraticCurveTo(S * 0.64, S * 0.32, S * 0.54, S * 0.3); g.closePath(); g.fill();
}

export function thingCanvas(kind, size = 256, i = 0) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  ({ stair: (g, S) => stair(g, S, i), ring, note: noteSpark })[kind](g, size);
  return c;
}

// the girl, cut out of the painting (media/games/steps/girl.png; the wall painted in behind her: wall.jpg),
// in pixels of the 666 × 654 painting: the cut-out's box and where her feet are
export const GIRL = { W: 666, H: 654, box: [485, 108, 586, 268], feet: [536, 262] };
// where she stands now (on the painting's top stair), then the 8 new stairs, rising up and left into the misty sky
// (u, v of the painting: the middle of each stair's top)
export const START = { u: 0.805, v: 0.4 };
export const STAIRS = [
  { u: 0.715, v: 0.37 }, { u: 0.64, v: 0.345 }, { u: 0.565, v: 0.32 }, { u: 0.49, v: 0.295 },
  { u: 0.415, v: 0.27 }, { u: 0.34, v: 0.245 }, { u: 0.265, v: 0.22 }, { u: 0.19, v: 0.195 },
];
