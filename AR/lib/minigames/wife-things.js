// SEEING THE WORLD TOGETHER (Ricky Ruzicka): the drawn props for "Our song".
// Drawn in code in the painting's sunset colours: warm coral-pink for her, cool teal for him, gold where they meet,
// over the deep violet of the jungle. No emoji, no image files.
//   thingCanvas(kind, size) → a square canvas:
//     'note-her'  her note: a glowing coral-pink music note
//     'note-his'  his answer: a glowing teal music note
//     'heart'     their two notes together: a heart, half pink, half teal, with a gold seam
//     'beat'      the beat ring that pulses on his side when it's his turn to answer
//     'light'     a city light coming on (a soft star of light)
//     'ship'      the little flying saucer from the sky, lit up
//     'note'      a white glowing note, tinted in the game to the colour of the pad it was sung on
//     'pad'       one of the three note pads (white, tinted low / middle / high in the game): a glowing ring with a note inside

const PINK = '#ff7aa2', CORAL = '#ff9a6b', TEALC = '#3fe0d0', CYAN = '#7ff3ff', GOLD = '#ffd36a', VIOLET = '#2a1748';

function halo(g, S, col, r = 0.46) {
  const c = S / 2, gr = g.createRadialGradient(c, c, 0, c, c, S * r);
  gr.addColorStop(0, col.replace(')', ',.55)').replace('rgb', 'rgba')); gr.addColorStop(1, col.replace(')', ',0)').replace('rgb', 'rgba'));
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
}
function note(g, S, a, b, glow) {
  halo(g, S, glow);
  const gr = g.createLinearGradient(S * 0.3, S * 0.2, S * 0.7, S * 0.85); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.save(); g.shadowColor = a; g.shadowBlur = S * 0.05;
  // stem + flag
  g.fillStyle = gr; g.fillRect(S * 0.555, S * 0.18, S * 0.065, S * 0.5);
  g.beginPath(); g.moveTo(S * 0.62, S * 0.18); g.bezierCurveTo(S * 0.66, S * 0.3, S * 0.82, S * 0.32, S * 0.76, S * 0.5);
  g.bezierCurveTo(S * 0.74, S * 0.4, S * 0.68, S * 0.36, S * 0.62, S * 0.34); g.closePath(); g.fill();
  // head
  g.beginPath(); g.ellipse(S * 0.47, S * 0.69, S * 0.15, S * 0.105, -0.45, 0, Math.PI * 2); g.fill();
  g.restore();
  g.lineWidth = S * 0.016; g.strokeStyle = VIOLET; g.beginPath(); g.ellipse(S * 0.47, S * 0.69, S * 0.15, S * 0.105, -0.45, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(S * 0.42, S * 0.65, S * 0.045, S * 0.022, -0.45, 0, Math.PI * 2); g.fill();
}
function heart(g, S) {
  halo(g, S, 'rgb(255,211,106)', 0.5);
  const c = S / 2, s = S * 0.0042;
  const path = () => { g.beginPath(); g.moveTo(c, c + 82 * s); g.bezierCurveTo(c - 122 * s, c - 4 * s, c - 72 * s, c - 100 * s, c, c - 44 * s); g.bezierCurveTo(c + 72 * s, c - 100 * s, c + 122 * s, c - 4 * s, c, c + 82 * s); g.closePath(); };
  g.save(); path(); g.clip();
  g.fillStyle = PINK; g.fillRect(0, 0, c, S); g.fillStyle = TEALC; g.fillRect(c, 0, c, S);
  const sh = g.createRadialGradient(c - 40 * s, c - 40 * s, 0, c, c, 120 * s); sh.addColorStop(0, 'rgba(255,255,255,.45)'); sh.addColorStop(1, 'rgba(0,0,0,.15)'); g.fillStyle = sh; g.fillRect(0, 0, S, S);
  g.fillStyle = GOLD; g.fillRect(c - 5 * s, 0, 10 * s, S);
  g.restore();
  path(); g.lineWidth = 9 * s; g.strokeStyle = VIOLET; g.stroke();
}
function beat(g, S) {
  const c = S / 2;
  for (let i = 0; i < 3; i++) { g.lineWidth = S * (0.05 - i * 0.014); g.strokeStyle = `rgba(127,243,255,${0.95 - i * 0.3})`; g.beginPath(); g.arc(c, c, S * (0.2 + i * 0.1), 0, Math.PI * 2); g.stroke(); }
  g.fillStyle = 'rgba(127,243,255,.35)'; g.beginPath(); g.arc(c, c, S * 0.17, 0, Math.PI * 2); g.fill();
}
function light(g, S) {
  const c = S / 2; halo(g, S, 'rgb(255,226,150)', 0.5);
  g.fillStyle = '#fffbe6';
  g.beginPath(); g.moveTo(c, S * 0.12); g.lineTo(c + S * 0.05, c - S * 0.05); g.lineTo(S * 0.88, c); g.lineTo(c + S * 0.05, c + S * 0.05); g.lineTo(c, S * 0.88); g.lineTo(c - S * 0.05, c + S * 0.05); g.lineTo(S * 0.12, c); g.lineTo(c - S * 0.05, c - S * 0.05); g.closePath(); g.fill();
}
function ship(g, S) {
  const c = S / 2; halo(g, S, 'rgb(255,211,106)', 0.5);
  g.fillStyle = 'rgba(160,240,255,.85)'; g.beginPath(); g.ellipse(c, S * 0.46, S * 0.13, S * 0.1, 0, Math.PI, 0); g.fill();
  const gr = g.createLinearGradient(0, S * 0.44, 0, S * 0.58); gr.addColorStop(0, '#5a4a8a'); gr.addColorStop(1, '#221a3c');
  g.fillStyle = gr; g.beginPath(); g.ellipse(c, S * 0.5, S * 0.34, S * 0.075, 0, 0, Math.PI * 2); g.fill();
  g.lineWidth = S * 0.012; g.strokeStyle = '#140c28'; g.stroke();
  for (let i = 0; i < 7; i++) { const x = c + (i - 3) * S * 0.08; g.fillStyle = i % 2 ? GOLD : CYAN; g.beginPath(); g.arc(x, S * 0.505, S * 0.016, 0, Math.PI * 2); g.fill(); }
}

function pad(g, S) {
  const c = S / 2;
  const d = g.createRadialGradient(c, c, 0, c, c, S * 0.5); d.addColorStop(0, 'rgba(20,10,40,.85)'); d.addColorStop(0.7, 'rgba(20,10,40,.6)'); d.addColorStop(1, 'rgba(20,10,40,0)');
  g.fillStyle = d; g.fillRect(0, 0, S, S);
  g.lineWidth = S * 0.05; g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(c, c, S * 0.34, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#ffffff';
  g.fillRect(S * 0.53, S * 0.28, S * 0.05, S * 0.34);
  g.beginPath(); g.moveTo(S * 0.58, S * 0.28); g.bezierCurveTo(S * 0.62, S * 0.36, S * 0.72, S * 0.37, S * 0.68, S * 0.5); g.bezierCurveTo(S * 0.66, S * 0.42, S * 0.62, S * 0.4, S * 0.58, S * 0.38); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(S * 0.47, S * 0.63, S * 0.1, S * 0.072, -0.45, 0, Math.PI * 2); g.fill();
}

export function thingCanvas(kind, size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  if (kind === 'note-her') note(g, size, PINK, CORAL, 'rgb(255,122,162)');
  else if (kind === 'note-his') note(g, size, TEALC, CYAN, 'rgb(63,224,208)');
  else if (kind === 'heart') heart(g, size);
  else if (kind === 'beat') beat(g, size);
  else if (kind === 'light') light(g, size);
  else if (kind === 'ship') ship(g, size);
  else if (kind === 'pad') pad(g, size);
  else if (kind === 'note') note(g, size, '#ffffff', '#e8e8e8', 'rgb(255,255,255)');
  return c;
}
