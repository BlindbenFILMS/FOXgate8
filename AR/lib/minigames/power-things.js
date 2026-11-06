// HERO HOP (Academy of Music for the Blind, The Power Within): the drawn props, in the painting's own style:
// flat bright blocks of colour with a painted texture, soft dark edges, warm light in the windows.
//   thingCanvas(kind, size) → a square canvas:
//     'kid0'…'kid3'  a lit window with a curious kid leaning out and waving (four different kids)
//     'ask'          a speech bubble with a big question mark (a kid has a question)
//     'heart'        a glowing heart that floats up once the kid has their answer
// No emoji, no image files. Plain canvas: no three.js here, so it can be previewed anywhere.

const INK = '#1a1530';
function ink(g, S, w = 0.03) { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = S * w; g.strokeStyle = INK; g.stroke(); }
function texture(g, S, x0, y0, w, h, alpha = 0.08) {   // the painting's dry-brush texture
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '255,255,255' : '0,0,0'},${alpha * rnd()})`; g.fillRect(S * (x0 + rnd() * w), S * (y0 + rnd() * h), S * (0.02 + rnd() * 0.08), S * 0.006); }
}

// the four kids: skin, shirt, and hair style
const KIDS = [
  { skin: '#8a5a3c', shirt: '#2e9e5b', hair: 'puffs', hairCol: '#241612' },
  { skin: '#f0c8a0', shirt: '#ec3013', hair: 'cap', hairCol: '#1f4fd8' },
  { skin: '#c48a5c', shirt: '#7a3fc4', hair: 'long', hairCol: '#3b2216' },
  { skin: '#e4b48c', shirt: '#ff9a1f', hair: 'curls', hairCol: '#6b3a1c' },
];

function kid(g, S, k) {
  const K = KIDS[k % KIDS.length];
  // the window frame: an arch, like the painting's windows, with warm light inside
  const x0 = 0.2, x1 = 0.8, top = 0.12, bot = 0.92, cx = 0.5, r = (x1 - x0) / 2;
  const arch = () => { g.beginPath(); g.moveTo(S * x0, S * bot); g.lineTo(S * x0, S * (top + r)); g.arc(S * cx, S * (top + r), S * r, Math.PI, 0); g.lineTo(S * x1, S * bot); g.closePath(); };
  g.save(); g.shadowColor = 'rgba(255,220,120,.9)'; g.shadowBlur = S * 0.08;
  arch(); const lg = g.createLinearGradient(0, S * top, 0, S * bot); lg.addColorStop(0, '#fff2b8'); lg.addColorStop(1, '#ffc24a'); g.fillStyle = lg; g.fill(); g.restore();
  g.save(); arch(); g.clip();
  // the kid, leaning out: shoulders, head, one arm waving
  g.beginPath(); g.ellipse(S * 0.5, S * 0.98, S * 0.24, S * 0.2, 0, Math.PI, 0); g.fillStyle = K.shirt; g.fill(); ink(g, S, 0.025);
  g.beginPath(); g.moveTo(S * 0.64, S * 0.82); g.quadraticCurveTo(S * 0.76, S * 0.62, S * 0.73, S * 0.42); g.lineWidth = S * 0.075; g.strokeStyle = K.shirt; g.lineCap = 'round'; g.stroke();
  g.beginPath(); g.arc(S * 0.73, S * 0.38, S * 0.05, 0, Math.PI * 2); g.fillStyle = K.skin; g.fill(); ink(g, S, 0.02);   // the waving hand
  g.beginPath(); g.ellipse(S * 0.5, S * 0.6, S * 0.12, S * 0.135, 0, 0, Math.PI * 2); g.fillStyle = K.skin; g.fill(); ink(g, S, 0.025);   // head
  // hair
  g.fillStyle = K.hairCol;
  if (K.hair === 'puffs') { for (const x of [0.37, 0.63]) { g.beginPath(); g.arc(S * x, S * 0.47, S * 0.075, 0, Math.PI * 2); g.fill(); } g.beginPath(); g.ellipse(S * 0.5, S * 0.5, S * 0.125, S * 0.07, 0, Math.PI, 0); g.fill(); }
  if (K.hair === 'cap') { g.beginPath(); g.ellipse(S * 0.5, S * 0.5, S * 0.13, S * 0.08, 0, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(S * 0.6, S * 0.505, S * 0.1, S * 0.025, 0, 0, Math.PI * 2); g.fill(); }
  if (K.hair === 'long') { g.beginPath(); g.ellipse(S * 0.5, S * 0.55, S * 0.145, S * 0.13, 0, Math.PI, 0); g.fill(); g.fillRect(S * 0.355, S * 0.55, S * 0.05, S * 0.2); g.fillRect(S * 0.595, S * 0.55, S * 0.05, S * 0.2); }
  if (K.hair === 'curls') { for (let i = 0; i < 7; i++) { const a = Math.PI + i * Math.PI / 6; g.beginPath(); g.arc(S * (0.5 + Math.cos(a) * 0.115), S * (0.56 + Math.sin(a) * 0.12), S * 0.045, 0, Math.PI * 2); g.fill(); } }
  // a big smile and bright eyes
  g.fillStyle = INK; for (const x of [0.455, 0.545]) { g.beginPath(); g.arc(S * x, S * 0.6, S * 0.016, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); g.arc(S * 0.5, S * 0.635, S * 0.045, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = S * 0.016; g.strokeStyle = INK; g.stroke();
  g.restore();
  // the frame on top
  arch(); g.lineWidth = S * 0.05; g.strokeStyle = '#3a2a5a'; g.stroke();
  g.beginPath(); g.rect(S * 0.15, S * 0.9, S * 0.7, S * 0.07); g.fillStyle = '#f2e6d0'; g.fill(); ink(g, S, 0.02);   // the sill
  texture(g, S, 0.15, 0.1, 0.7, 0.85);
}

function ask(g, S) {
  g.beginPath(); g.ellipse(S * 0.5, S * 0.44, S * 0.4, S * 0.34, 0, 0, Math.PI * 2);
  g.moveTo(S * 0.36, S * 0.72); g.lineTo(S * 0.26, S * 0.95); g.lineTo(S * 0.52, S * 0.76);
  g.fillStyle = '#ffffff'; g.fill(); ink(g, S, 0.045);
  g.fillStyle = '#ec3013'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${S * 0.5}px Archivo, "Arial Black", Arial, sans-serif`; g.fillText('?', S * 0.5, S * 0.47);
}

function heart(g, S) {
  const r = g.createRadialGradient(S * 0.5, S * 0.5, 0, S * 0.5, S * 0.5, S * 0.5); r.addColorStop(0, 'rgba(255,220,140,.8)'); r.addColorStop(1, 'rgba(255,120,80,0)'); g.fillStyle = r; g.fillRect(0, 0, S, S);
  g.beginPath(); g.moveTo(S * 0.5, S * 0.8);
  g.bezierCurveTo(S * 0.12, S * 0.55, S * 0.18, S * 0.18, S * 0.5, S * 0.36);
  g.bezierCurveTo(S * 0.82, S * 0.18, S * 0.88, S * 0.55, S * 0.5, S * 0.8); g.closePath();
  const lg = g.createLinearGradient(0, S * 0.25, 0, S * 0.8); lg.addColorStop(0, '#ff5a7a'); lg.addColorStop(1, '#d81e4a'); g.fillStyle = lg; g.fill(); ink(g, S, 0.035);
  g.beginPath(); g.ellipse(S * 0.36, S * 0.38, S * 0.06, S * 0.035, -0.6, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.8)'; g.fill();
}

export function thingCanvas(kind, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  if (kind.startsWith('kid')) kid(g, size, +kind.slice(3)); else ({ ask, heart })[kind](g, size);
  return c;
}

// the hero, cut out of the painting (media/games/power/hero.png; the city painted in behind her: city.jpg),
// in pixels of the 661 × 542 painting: the cut-out's box
export const HERO = { W: 661, H: 542, box: [232, 42, 403, 375] };
// the windows the kids lean out of (u, v of the painting), left to right
export const WINDOWS = [
  { u: 0.07, v: 0.62 }, { u: 0.19, v: 0.79 }, { u: 0.325, v: 0.56 },
  { u: 0.655, v: 0.62 }, { u: 0.825, v: 0.5 }, { u: 0.905, v: 0.77 },
];
