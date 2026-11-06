// SHWAK! (Michael Tubiak, Wet Floor Signs, Beware!): the drawn props, in the painting's own comic-book style:
// thick black ink lines, flat bright colour with a darker shade, white shine, halftone dots.
//   thingCanvas(kind, size, text) → a square canvas:
//     'sign'   a yellow wet floor sign (an A-frame with a slipping figure)
//     'boss'   the GIANT wet floor sign, a villain with angry eyes and gritted teeth
//     'burst'  a comic sound-effect burst with `text` in it ("SHWAK!", "THWACK!"…)
//     'splash' a comic water splash        'swoosh' the white motion arc of the cane swing
//     'drop'   a water drop
// No emoji, no image files.

const INK = '#0b0b0d';
function ink(g, S, w = 0.03) { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = S * w; g.strokeStyle = INK; g.stroke(); }
function dots(g, S, x0, y0, x1, y1, col = 'rgba(0,0,0,.18)', step = 0.028) {
  g.fillStyle = col;
  for (let y = y0; y < y1; y += step) for (let x = x0 + ((Math.round(y / step) % 2) * step) / 2; x < x1; x += step) { g.beginPath(); g.arc(S * x, S * y, S * step * 0.28, 0, Math.PI * 2); g.fill(); }
}

// the slipping stick figure that's on every wet floor sign
function slipper(g, S, cx, cy, s) {
  g.save(); g.translate(S * cx, S * cy); g.scale(s, s); g.fillStyle = INK; g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.arc(-S * 0.02, -S * 0.12, S * 0.03, 0, Math.PI * 2); g.fill();
  g.lineWidth = S * 0.028;
  g.beginPath(); g.moveTo(-S * 0.01, -S * 0.08); g.lineTo(S * 0.03, S * 0.02); g.stroke();                       // body leaning back
  g.beginPath(); g.moveTo(S * 0.0, -S * 0.05); g.lineTo(-S * 0.07, -S * 0.07); g.moveTo(S * 0.0, -S * 0.05); g.lineTo(S * 0.06, -S * 0.1); g.stroke();   // arms flailing
  g.beginPath(); g.moveTo(S * 0.03, S * 0.02); g.lineTo(S * 0.1, -S * 0.02); g.moveTo(S * 0.03, S * 0.02); g.lineTo(-S * 0.03, S * 0.06); g.stroke(); // legs flying
  g.beginPath(); g.ellipse(-S * 0.02, S * 0.085, S * 0.07, S * 0.012, 0, 0, Math.PI * 2); g.fill();                // the puddle
  g.restore();
}
function signShape(g, S, top, bot, w0, w1) {
  g.beginPath(); g.moveTo(S * (0.5 - w0), S * top); g.lineTo(S * (0.5 + w0), S * top); g.lineTo(S * (0.5 + w1), S * bot); g.lineTo(S * (0.5 - w1), S * bot); g.closePath();
}
function sign(g, S) {
  // shadow on the floor
  g.beginPath(); g.ellipse(S * 0.5, S * 0.9, S * 0.3, S * 0.04, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(0,40,60,.3)'; g.fill();
  // the back leg peeking out on the right
  g.beginPath(); g.moveTo(S * 0.62, S * 0.14); g.lineTo(S * 0.82, S * 0.88); g.lineTo(S * 0.74, S * 0.88); g.lineTo(S * 0.6, S * 0.2); g.closePath(); g.fillStyle = '#c99a00'; g.fill(); ink(g, S, 0.025);
  // the front face
  signShape(g, S, 0.1, 0.88, 0.12, 0.27);
  const gr = g.createLinearGradient(S * 0.25, 0, S * 0.75, 0); gr.addColorStop(0, '#ffe24a'); gr.addColorStop(0.6, '#ffd000'); gr.addColorStop(1, '#e0a800'); g.fillStyle = gr; g.fill();
  g.save(); signShape(g, S, 0.1, 0.88, 0.12, 0.27); g.clip(); dots(g, S, 0.5, 0.1, 0.8, 0.9, 'rgba(150,90,0,.25)');
  g.beginPath(); g.moveTo(S * 0.33, S * 0.12); g.lineTo(S * 0.38, S * 0.12); g.lineTo(S * 0.27, S * 0.86); g.lineTo(S * 0.22, S * 0.86); g.closePath(); g.fillStyle = 'rgba(255,255,255,.7)'; g.fill(); g.restore();
  signShape(g, S, 0.1, 0.88, 0.12, 0.27); ink(g, S);
  // the handle hole at the top
  g.beginPath(); g.ellipse(S * 0.5, S * 0.16, S * 0.06, S * 0.022, 0, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
  // black band with the words
  g.beginPath(); g.rect(S * 0.31, S * 0.25, S * 0.38, S * 0.13); g.fillStyle = INK; g.fill();
  g.fillStyle = '#ffd000'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 ${S * 0.075}px "Arial Black", Impact, Arial, sans-serif`; g.fillText('WET', S * 0.5, S * 0.29); g.font = `900 ${S * 0.06}px "Arial Black", Impact, Arial, sans-serif`; g.fillText('FLOOR', S * 0.5, S * 0.345);
  // the warning triangle with the slipping figure
  g.beginPath(); g.moveTo(S * 0.5, S * 0.44); g.lineTo(S * 0.66, S * 0.74); g.lineTo(S * 0.34, S * 0.74); g.closePath(); g.fillStyle = '#ffd000'; g.fill(); ink(g, S, 0.028);
  slipper(g, S, 0.505, 0.65, 0.8);
}
function boss(g, S) {
  g.beginPath(); g.ellipse(S * 0.5, S * 0.92, S * 0.4, S * 0.045, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(0,40,60,.35)'; g.fill();
  // back legs
  g.beginPath(); g.moveTo(S * 0.66, S * 0.1); g.lineTo(S * 0.9, S * 0.9); g.lineTo(S * 0.8, S * 0.9); g.lineTo(S * 0.62, S * 0.18); g.closePath(); g.fillStyle = '#b88a00'; g.fill(); ink(g, S, 0.03);
  // face
  signShape(g, S, 0.06, 0.9, 0.15, 0.34);
  const gr = g.createLinearGradient(S * 0.2, 0, S * 0.8, 0); gr.addColorStop(0, '#ffe24a'); gr.addColorStop(0.55, '#ffc400'); gr.addColorStop(1, '#d08c00'); g.fillStyle = gr; g.fill();
  g.save(); signShape(g, S, 0.06, 0.9, 0.15, 0.34); g.clip(); dots(g, S, 0.45, 0.06, 0.85, 0.92, 'rgba(150,70,0,.28)', 0.024);
  g.beginPath(); g.moveTo(S * 0.3, S * 0.08); g.lineTo(S * 0.36, S * 0.08); g.lineTo(S * 0.2, S * 0.88); g.lineTo(S * 0.14, S * 0.88); g.closePath(); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill(); g.restore();
  signShape(g, S, 0.06, 0.9, 0.15, 0.34); ink(g, S, 0.035);
  // angry eyebrows and eyes
  for (const d of [-1, 1]) {
    g.beginPath(); g.ellipse(S * (0.5 + d * 0.11), S * 0.34, S * 0.075, S * 0.06, 0, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); ink(g, S, 0.022);
    g.beginPath(); g.arc(S * (0.5 + d * 0.09), S * 0.355, S * 0.032, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
    g.beginPath(); g.arc(S * (0.5 + d * 0.08), S * 0.345, S * 0.01, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
    g.beginPath(); g.moveTo(S * (0.5 + d * 0.2), S * 0.24); g.lineTo(S * (0.5 + d * 0.035), S * 0.3); g.lineTo(S * (0.5 + d * 0.035), S * 0.27); g.lineTo(S * (0.5 + d * 0.19), S * 0.2); g.closePath(); g.fillStyle = INK; g.fill();
  }
  // gritted teeth
  g.beginPath(); g.moveTo(S * 0.33, S * 0.5); g.quadraticCurveTo(S * 0.5, S * 0.47, S * 0.67, S * 0.5); g.lineTo(S * 0.64, S * 0.6); g.quadraticCurveTo(S * 0.5, S * 0.63, S * 0.36, S * 0.6); g.closePath();
  g.fillStyle = '#fff'; g.fill(); ink(g, S, 0.025);
  g.beginPath(); g.moveTo(S * 0.345, S * 0.55); g.quadraticCurveTo(S * 0.5, S * 0.54, S * 0.655, S * 0.55); for (let i = 1; i < 7; i++) { const x = 0.34 + i * 0.045; g.moveTo(S * x, S * 0.495); g.lineTo(S * x, S * 0.61); } ink(g, S, 0.012);
  // the warning triangle on its belly
  g.beginPath(); g.moveTo(S * 0.5, S * 0.66); g.lineTo(S * 0.62, S * 0.87); g.lineTo(S * 0.38, S * 0.87); g.closePath(); g.fillStyle = '#ffd000'; g.fill(); ink(g, S, 0.025);
  slipper(g, S, 0.505, 0.8, 0.6);
  // little puddle drips off its feet
  for (const [x, y] of [[0.2, 0.95], [0.78, 0.96]]) { g.beginPath(); g.ellipse(S * x, S * y, S * 0.06, S * 0.012, 0, 0, Math.PI * 2); g.fillStyle = '#8fe3ff'; g.fill(); ink(g, S, 0.01); }
}
function burst(g, S, text = 'SHWAK!') {
  // a spiky comic explosion: black spikes, then yellow, then the word
  const star = (r0, r1, n, rot) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = (i % 2 ? r0 : r1) * (0.85 + ((i * 37) % 7) / 30); g.lineTo(S * 0.5 + Math.cos(a) * S * r, S * 0.5 + Math.sin(a) * S * r * 0.8); } g.closePath(); };
  star(0.26, 0.48, 14, 0.1); g.fillStyle = INK; g.fill();
  star(0.23, 0.43, 14, 0.1); g.fillStyle = '#ffe600'; g.fill();
  star(0.17, 0.3, 14, 0.3); g.fillStyle = '#ff7a00'; g.fill();
  g.save(); star(0.23, 0.43, 14, 0.1); g.clip(); dots(g, S, 0, 0, 1, 1, 'rgba(200,40,0,.25)', 0.03); g.restore();
  // the word, slanted, with a fat black outline and a red drop shadow
  let fs = S * 0.2; g.font = `italic 900 ${fs}px "Arial Black", Impact, Arial, sans-serif`;
  while (g.measureText(text).width > S * 0.86 && fs > S * 0.08) { fs -= S * 0.01; g.font = `italic 900 ${fs}px "Arial Black", Impact, Arial, sans-serif`; }
  g.save(); g.translate(S * 0.5, S * 0.52); g.rotate(-0.12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = fs * 0.22; g.strokeStyle = INK; g.strokeText(text, fs * 0.05, fs * 0.06);
  g.fillStyle = '#ec3013'; g.fillText(text, fs * 0.05, fs * 0.06);
  g.lineWidth = fs * 0.14; g.strokeStyle = INK; g.strokeText(text, 0, 0);
  const tg = g.createLinearGradient(0, -fs / 2, 0, fs / 2); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, '#bff0ff'); g.fillStyle = tg; g.fillText(text, 0, 0);
  g.restore();
}
function splash(g, S) {
  // a white-and-blue comic splash of water, jagged like the one in the painting
  const ring = (r0, r1, n, fill) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = Math.PI + i * Math.PI / (n * 2 - 1), r = i % 2 ? r0 : r1 * (0.8 + ((i * 13) % 5) / 12); g.lineTo(S * 0.5 + Math.cos(a) * S * r, S * 0.78 + Math.sin(a) * S * r); } g.closePath(); g.fillStyle = fill; g.fill(); ink(g, S, 0.02); };
  ring(0.2, 0.46, 9, '#bff0ff'); ring(0.14, 0.32, 8, '#ffffff');
  g.beginPath(); g.ellipse(S * 0.5, S * 0.8, S * 0.42, S * 0.07, 0, 0, Math.PI * 2); g.fillStyle = '#8fe3ff'; g.fill(); ink(g, S, 0.02);
  for (const [x, y, r] of [[0.18, 0.32, 0.03], [0.8, 0.28, 0.035], [0.34, 0.14, 0.025], [0.66, 0.12, 0.022], [0.9, 0.5, 0.02]]) { g.beginPath(); g.arc(S * x, S * y, S * r, 0, Math.PI * 2); g.fillStyle = '#ffffff'; g.fill(); ink(g, S, 0.012); }
}
function swoosh(g, S) {
  // the white motion arc of the cane: thick at the front, fading to nothing behind, with speed streaks
  g.save(); g.translate(S * 0.5, S * 0.8); g.scale(0.62, 0.62); g.translate(-S * 0.5, -S * 0.8);
  const cx = S * 0.5, cy = S * 0.95;
  for (let i = 0; i < 26; i++) {
    const k = i / 25, a0 = Math.PI * (1.12 + k * 0.62), a1 = a0 + Math.PI * 0.045;
    g.beginPath(); g.arc(cx, cy, S * 0.78, a0, a1); g.arc(cx, cy, S * (0.78 - 0.03 - k * 0.12), a1, a0, true); g.closePath();
    g.fillStyle = `rgba(255,255,255,${0.1 + k * 0.85})`; g.fill();
  }
  g.beginPath(); g.arc(cx, cy, S * 0.78, Math.PI * 1.55, Math.PI * 1.78); g.lineWidth = S * 0.012; g.strokeStyle = INK; g.stroke();
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(cx, cy, S * (0.6 - i * 0.05), Math.PI * (1.4 + i * 0.03), Math.PI * 1.72); g.lineWidth = S * 0.006; g.strokeStyle = 'rgba(255,255,255,.7)'; g.stroke(); }
  // the red tip of the white cane at the front of the swing
  const a = Math.PI * 1.76, tx = cx + Math.cos(a) * S * 0.72, ty = cy + Math.sin(a) * S * 0.72;
  g.beginPath(); g.arc(tx, ty, S * 0.045, 0, Math.PI * 2); g.fillStyle = '#ec3013'; g.fill(); ink(g, S, 0.014);
  g.beginPath(); g.arc(tx - S * 0.012, ty - S * 0.012, S * 0.013, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
  g.restore();
}
function drop(g, S) {
  g.beginPath(); g.moveTo(S * 0.5, S * 0.12); g.bezierCurveTo(S * 0.72, S * 0.45, S * 0.78, S * 0.62, S * 0.5, S * 0.86); g.bezierCurveTo(S * 0.22, S * 0.62, S * 0.28, S * 0.45, S * 0.5, S * 0.12);
  g.fillStyle = '#8fe3ff'; g.fill(); ink(g, S, 0.05);
  g.beginPath(); g.ellipse(S * 0.42, S * 0.58, S * 0.05, S * 0.1, 0.3, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
}

const DRAW = { sign, boss, burst, splash, swoosh, drop };
export const WORDS = ['SHWAK!', 'THWACK!', 'KA-POW!', 'BONK!', 'WHAM!', 'SHWAK!', 'KLONK!', 'BAM!'];
export function thingCanvas(kind, size = 512, text) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); (DRAW[kind] || sign)(g, size, text); return c;
}
