// SOMEWHERE IN BETWEEN (Michael Tubiak, Spectrum of Sight): the drawn things you try to see through each ring.
// Big, bold, everyday things with dark outlines, lit from the upper left by a sunny window, each in a soft room with
// its own floor shadow, gloss and highlights. Everything is drawn in code on a canvas; no emoji, no image files.
//   thingCanvas(kind, size) → a square canvas: 'key' | 'dog' | 'bicycle' | 'guitar' | 'cup' | 'bird' | 'phone'
//   KINDS: the list

const INK = '#16130f';
const lin = (g, x0, y0, x1, y1, stops) => { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
const rad = (g, x0, y0, r0, x1, y1, r1, stops) => { const gr = g.createRadialGradient(x0, y0, r0, x1, y1, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
function line(g, S, w = 0.02) { g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = S * w; g.strokeStyle = INK; g.stroke(); }
// a soft highlight in the top-left of whatever path was just drawn (call right after building the path)
function gloss(g, S, x, y, rx, ry, a = 0.55, rot = -0.5) {
  g.save(); g.clip(); g.beginPath(); g.ellipse(S * x, S * y, S * rx, S * ry, rot, 0, Math.PI * 2);
  g.fillStyle = rad(g, S * x, S * y, 0, S * x, S * y, S * Math.max(rx, ry), [[0, `rgba(255,255,255,${a})`], [1, 'rgba(255,255,255,0)']]); g.fill(); g.restore();
}
function floorShadow(g, S, x, w, y = 0.8) {
  g.beginPath(); g.ellipse(S * x, S * y, S * w, S * w * 0.16, 0, 0, Math.PI * 2);
  g.fillStyle = rad(g, S * x, S * y, 0, S * x, S * y, S * w, [[0, 'rgba(50,35,20,.42)'], [0.6, 'rgba(50,35,20,.18)'], [1, 'rgba(50,35,20,0)']]);
  g.save(); g.translate(S * x, S * y); g.scale(1, 0.16); g.translate(-S * x, -S * y); g.beginPath(); g.arc(S * x, S * y, S * w, 0, Math.PI * 2); g.restore(); g.fill();
}

// a sunny room: a pale blue wall with a patch of window light, a warm wooden floor, and a gentle vignette
function room(g, S) {
  g.fillStyle = lin(g, 0, 0, 0, S * 0.7, [[0, '#bcdcf2'], [1, '#eef1ea']]); g.fillRect(0, 0, S, S * 0.7);
  g.save(); g.globalAlpha = 0.5; g.fillStyle = lin(g, S * 0.1, 0, S * 0.6, S * 0.7, [[0, 'rgba(255,250,225,1)'], [1, 'rgba(255,250,225,0)']]);
  g.beginPath(); g.moveTo(S * 0.08, 0); g.lineTo(S * 0.42, 0); g.lineTo(S * 0.66, S * 0.7); g.lineTo(S * 0.3, S * 0.7); g.closePath(); g.fill(); g.restore();
  g.fillStyle = lin(g, 0, S * 0.7, 0, S, [[0, '#e7d2b0'], [1, '#c9a979']]); g.fillRect(0, S * 0.7, S, S * 0.3);
  g.strokeStyle = 'rgba(120,85,45,.18)'; g.lineWidth = S * 0.004;
  for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(S * 0.5 + i * S * 0.08, S * 0.7); g.lineTo(S * 0.5 + i * S * 0.22, S); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, S * 0.695, S, S * 0.008);
}
function vignette(g, S) { g.fillStyle = rad(g, S * 0.5, S * 0.48, S * 0.3, S * 0.5, S * 0.5, S * 0.72, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(30,20,10,.28)']]); g.fillRect(0, 0, S, S); }

function key(g, S) {
  floorShadow(g, S, 0.52, 0.36);
  g.save(); g.translate(S * 0.5, S * 0.5); g.rotate(-0.25); g.translate(-S * 0.5, -S * 0.5);
  const gold = lin(g, 0, S * 0.36, 0, S * 0.64, [[0, '#fff1b8'], [0.3, '#f2c24a'], [0.65, '#c88c1c'], [1, '#7c520c']]);
  // the bow with its hole
  g.beginPath(); g.arc(S * 0.28, S * 0.5, S * 0.14, 0, Math.PI * 2); g.arc(S * 0.28, S * 0.5, S * 0.055, 0, Math.PI * 2, true); g.fillStyle = gold; g.fill('evenodd');
  g.beginPath(); g.arc(S * 0.28, S * 0.5, S * 0.14, 0, Math.PI * 2); line(g, S); g.beginPath(); g.arc(S * 0.28, S * 0.5, S * 0.055, 0, Math.PI * 2); line(g, S, 0.016);
  g.beginPath(); g.arc(S * 0.28, S * 0.5, S * 0.1, 0, Math.PI * 2); g.lineWidth = S * 0.008; g.strokeStyle = 'rgba(120,80,10,.6)'; g.stroke();
  g.beginPath(); g.arc(S * 0.28, S * 0.5, S * 0.12, Math.PI * 1.05, Math.PI * 1.55); g.lineWidth = S * 0.016; g.strokeStyle = 'rgba(255,255,255,.8)'; g.stroke();
  // the shaft and the teeth
  const shaft = () => { g.beginPath(); g.moveTo(S * 0.41, S * 0.465); g.lineTo(S * 0.88, S * 0.465); g.lineTo(S * 0.88, S * 0.535); g.lineTo(S * 0.85, S * 0.535); g.lineTo(S * 0.85, S * 0.6); g.lineTo(S * 0.79, S * 0.6); g.lineTo(S * 0.79, S * 0.56); g.lineTo(S * 0.74, S * 0.56); g.lineTo(S * 0.74, S * 0.61); g.lineTo(S * 0.68, S * 0.61); g.lineTo(S * 0.68, S * 0.535); g.lineTo(S * 0.41, S * 0.535); g.closePath(); };
  shaft(); g.fillStyle = gold; g.fill(); shaft(); line(g, S);
  g.beginPath(); g.moveTo(S * 0.45, S * 0.485); g.lineTo(S * 0.85, S * 0.485); g.lineWidth = S * 0.012; g.strokeStyle = 'rgba(255,252,225,.9)'; g.stroke();
  g.beginPath(); g.moveTo(S * 0.45, S * 0.515); g.lineTo(S * 0.66, S * 0.515); g.lineWidth = S * 0.008; g.strokeStyle = 'rgba(110,70,8,.6)'; g.stroke();
  g.restore();
}
function dog(g, S) {
  floorShadow(g, S, 0.5, 0.32);
  const fur = lin(g, 0, S * 0.3, 0, S * 0.68, [[0, '#e3a25a'], [0.5, '#b8742f'], [1, '#80481a']]), dark = '#6e3f14';
  // tail, wagging up
  g.beginPath(); g.moveTo(S * 0.27, S * 0.5); g.quadraticCurveTo(S * 0.12, S * 0.42, S * 0.17, S * 0.26); g.lineWidth = S * 0.055; g.lineCap = 'round'; g.strokeStyle = INK; g.stroke(); g.lineWidth = S * 0.032; g.strokeStyle = '#b8742f'; g.stroke();
  // legs, with lighter paws
  for (const x of [0.3, 0.39, 0.6, 0.69]) {
    const back = x === 0.39 || x === 0.69;
    g.beginPath(); g.rect(S * (x - 0.032), S * 0.56, S * 0.064, S * 0.22); g.fillStyle = back ? dark : '#a8652a'; g.fill(); line(g, S, 0.016);
    g.beginPath(); g.ellipse(S * x, S * 0.785, S * 0.042, S * 0.022, 0, 0, Math.PI * 2); g.fillStyle = back ? '#c9a274' : '#f2dcb8'; g.fill(); line(g, S, 0.014);
  }
  // body with a white chest
  g.beginPath(); g.ellipse(S * 0.49, S * 0.53, S * 0.25, S * 0.125, 0, 0, Math.PI * 2); g.fillStyle = fur; g.fill();
  g.beginPath(); g.ellipse(S * 0.49, S * 0.53, S * 0.25, S * 0.125, 0, 0, Math.PI * 2); gloss(g, S, 0.42, 0.45, 0.18, 0.05, 0.45, 0);
  g.beginPath(); g.ellipse(S * 0.68, S * 0.56, S * 0.07, S * 0.08, 0, 0, Math.PI * 2); g.fillStyle = '#f6e6cc'; g.fill();
  g.beginPath(); g.ellipse(S * 0.49, S * 0.53, S * 0.25, S * 0.125, 0, 0, Math.PI * 2); line(g, S);
  // head and snout
  g.beginPath(); g.ellipse(S * 0.75, S * 0.37, S * 0.12, S * 0.11, 0, 0, Math.PI * 2); g.fillStyle = fur; g.fill();
  g.beginPath(); g.ellipse(S * 0.75, S * 0.37, S * 0.12, S * 0.11, 0, 0, Math.PI * 2); gloss(g, S, 0.72, 0.31, 0.07, 0.04, 0.5); g.beginPath(); g.ellipse(S * 0.75, S * 0.37, S * 0.12, S * 0.11, 0, 0, Math.PI * 2); line(g, S);
  g.beginPath(); g.ellipse(S * 0.86, S * 0.42, S * 0.075, S * 0.055, 0, 0, Math.PI * 2); g.fillStyle = '#f2d2a0'; g.fill(); line(g, S);
  g.beginPath(); g.ellipse(S * 0.925, S * 0.4, S * 0.028, S * 0.022, 0, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
  g.beginPath(); g.arc(S * 0.918, S * 0.392, S * 0.008, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
  // tongue
  g.beginPath(); g.moveTo(S * 0.85, S * 0.46); g.quadraticCurveTo(S * 0.86, S * 0.53, S * 0.89, S * 0.5); g.quadraticCurveTo(S * 0.9, S * 0.47, S * 0.89, S * 0.455); g.closePath(); g.fillStyle = '#f2708a'; g.fill(); line(g, S, 0.012);
  // ear and eye
  g.beginPath(); g.moveTo(S * 0.68, S * 0.29); g.quadraticCurveTo(S * 0.61, S * 0.42, S * 0.665, S * 0.51); g.quadraticCurveTo(S * 0.73, S * 0.43, S * 0.735, S * 0.3); g.closePath(); g.fillStyle = dark; g.fill(); line(g, S, 0.016);
  g.beginPath(); g.arc(S * 0.79, S * 0.335, S * 0.02, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(S * 0.795, S * 0.328, S * 0.007, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
  // red collar with a gold tag
  g.beginPath(); g.moveTo(S * 0.665, S * 0.445); g.lineTo(S * 0.715, S * 0.5); g.lineWidth = S * 0.04; g.strokeStyle = '#d2261a'; g.stroke();
  g.beginPath(); g.arc(S * 0.7, S * 0.52, S * 0.018, 0, Math.PI * 2); g.fillStyle = '#f5c518'; g.fill(); line(g, S, 0.01);
}
function bicycle(g, S) {
  floorShadow(g, S, 0.5, 0.42, 0.79);
  const wheel = (x) => {
    g.beginPath(); g.arc(S * x, S * 0.6, S * 0.17, 0, Math.PI * 2); g.lineWidth = S * 0.045; g.strokeStyle = '#1d1d1f'; g.stroke();
    g.beginPath(); g.arc(S * x, S * 0.6, S * 0.17, Math.PI * 1.1, Math.PI * 1.45); g.lineWidth = S * 0.01; g.strokeStyle = 'rgba(255,255,255,.35)'; g.stroke();
    g.beginPath(); g.arc(S * x, S * 0.6, S * 0.145, 0, Math.PI * 2); g.lineWidth = S * 0.012; g.strokeStyle = '#c9ced6'; g.stroke();
    g.lineWidth = S * 0.005; g.strokeStyle = '#8a9098'; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; g.beginPath(); g.moveTo(S * x, S * 0.6); g.lineTo(S * x + Math.cos(a) * S * 0.14, S * 0.6 + Math.sin(a) * S * 0.14); g.stroke(); }
    g.beginPath(); g.arc(S * x, S * 0.6, S * 0.022, 0, Math.PI * 2); g.fillStyle = '#d8dde3'; g.fill(); line(g, S, 0.01);
  };
  wheel(0.27); wheel(0.73);
  // the chain ring
  g.beginPath(); g.arc(S * 0.45, S * 0.6, S * 0.05, 0, Math.PI * 2); g.fillStyle = '#c9ced6'; g.fill(); line(g, S, 0.012);
  g.beginPath(); g.moveTo(S * 0.45, S * 0.55); g.lineTo(S * 0.27, S * 0.585); g.moveTo(S * 0.45, S * 0.65); g.lineTo(S * 0.27, S * 0.615); g.lineWidth = S * 0.008; g.strokeStyle = '#444'; g.stroke();
  // the red frame, with a shine along it
  const frame = () => { g.beginPath(); g.moveTo(S * 0.27, S * 0.6); g.lineTo(S * 0.45, S * 0.6); g.lineTo(S * 0.62, S * 0.38); g.lineTo(S * 0.38, S * 0.38); g.closePath(); g.moveTo(S * 0.45, S * 0.6); g.lineTo(S * 0.36, S * 0.3); g.moveTo(S * 0.62, S * 0.38); g.lineTo(S * 0.73, S * 0.6); g.moveTo(S * 0.62, S * 0.38); g.lineTo(S * 0.6, S * 0.26); };
  g.lineJoin = 'round'; g.lineCap = 'round';
  frame(); g.lineWidth = S * 0.052; g.strokeStyle = INK; g.stroke(); frame(); g.lineWidth = S * 0.032; g.strokeStyle = '#e0322a'; g.stroke();
  g.beginPath(); g.moveTo(S * 0.4, S * 0.372); g.lineTo(S * 0.6, S * 0.372); g.moveTo(S * 0.3, S * 0.592); g.lineTo(S * 0.43, S * 0.592); g.lineWidth = S * 0.009; g.strokeStyle = 'rgba(255,220,210,.85)'; g.stroke();
  // seat, handlebars, pedal
  g.beginPath(); g.ellipse(S * 0.35, S * 0.28, S * 0.075, S * 0.026, -0.05, 0, Math.PI * 2); g.fillStyle = '#2a2a2e'; g.fill(); line(g, S, 0.01);
  g.beginPath(); g.ellipse(S * 0.33, S * 0.272, S * 0.04, S * 0.008, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill();
  g.beginPath(); g.moveTo(S * 0.55, S * 0.24); g.quadraticCurveTo(S * 0.6, S * 0.22, S * 0.67, S * 0.25); g.lineWidth = S * 0.035; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.rect(S * 0.42, S * 0.66, S * 0.06, S * 0.018); g.fillStyle = '#333'; g.fill();
}
function guitar(g, S) {
  floorShadow(g, S, 0.47, 0.24, 0.84);
  g.save(); g.translate(S * 0.5, S * 0.5); g.rotate(0.5); g.scale(0.86, 0.86); g.translate(-S * 0.5, -S * 0.47);
  // neck and head
  g.beginPath(); g.rect(S * 0.465, S * 0.06, S * 0.07, S * 0.42); g.fillStyle = lin(g, S * 0.465, 0, S * 0.535, 0, [[0, '#4a2810'], [0.5, '#7a4520'], [1, '#4a2810']]); g.fill(); line(g, S, 0.016);
  g.beginPath(); g.moveTo(S * 0.45, S * 0.0); g.lineTo(S * 0.55, S * 0.0); g.lineTo(S * 0.545, S * 0.1); g.lineTo(S * 0.455, S * 0.1); g.closePath(); g.fillStyle = '#2e180a'; g.fill(); line(g, S, 0.016);
  for (const [x, y] of [[0.44, 0.025], [0.44, 0.07], [0.56, 0.025], [0.56, 0.07]]) { g.beginPath(); g.arc(S * x, S * y, S * 0.014, 0, Math.PI * 2); g.fillStyle = '#e8e8e8'; g.fill(); line(g, S, 0.008); }
  for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(S * 0.467, S * (0.12 + i * 0.05)); g.lineTo(S * 0.533, S * (0.12 + i * 0.05)); g.lineWidth = S * 0.006; g.strokeStyle = '#d8c38a'; g.stroke(); }
  // the body: two rounded parts in warm wood with grain and a shine
  const body = () => { g.beginPath(); g.ellipse(S * 0.5, S * 0.55, S * 0.135, S * 0.125, 0, 0, Math.PI * 2); g.ellipse(S * 0.5, S * 0.77, S * 0.185, S * 0.165, 0, 0, Math.PI * 2); };
  body(); g.lineWidth = S * 0.04; g.strokeStyle = INK; g.stroke();
  body(); g.fillStyle = rad(g, S * 0.44, S * 0.64, S * 0.02, S * 0.5, S * 0.7, S * 0.3, [[0, '#ffe09a'], [0.55, '#e8952f'], [1, '#93460f']]); g.fill();
  g.save(); body(); g.clip(); g.strokeStyle = 'rgba(140,70,20,.25)'; g.lineWidth = S * 0.005;
  for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(S * (0.3 + i * 0.035), S * 0.4); g.quadraticCurveTo(S * (0.32 + i * 0.035), S * 0.7, S * (0.29 + i * 0.035), S * 0.96); g.stroke(); } g.restore();
  body(); gloss(g, S, 0.42, 0.68, 0.06, 0.13, 0.5, 0.2);
  // pickguard, sound hole, bridge, strings
  g.beginPath(); g.ellipse(S * 0.56, S * 0.7, S * 0.06, S * 0.05, 0.4, 0, Math.PI * 2); g.fillStyle = '#3a1d0a'; g.fill();
  g.beginPath(); g.arc(S * 0.5, S * 0.64, S * 0.052, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(S * 0.5, S * 0.64, S * 0.064, 0, Math.PI * 2); g.lineWidth = S * 0.008; g.strokeStyle = '#3a1d0a'; g.stroke();
  g.beginPath(); g.rect(S * 0.44, S * 0.83, S * 0.12, S * 0.026); g.fillStyle = '#2e180a'; g.fill();
  for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(S * (0.475 + i * 0.01), S * 0.1); g.lineTo(S * (0.475 + i * 0.01), S * 0.84); g.lineWidth = S * 0.0035; g.strokeStyle = '#f6f6f6'; g.stroke(); }
  g.restore();
}
function cup(g, S) {
  // a saucer
  floorShadow(g, S, 0.47, 0.3, 0.82);
  g.beginPath(); g.ellipse(S * 0.47, S * 0.79, S * 0.27, S * 0.055, 0, 0, Math.PI * 2); g.fillStyle = lin(g, 0, S * 0.74, 0, S * 0.85, [[0, '#ffffff'], [1, '#c8ccd4']]); g.fill(); line(g, S, 0.016);
  g.beginPath(); g.ellipse(S * 0.47, S * 0.785, S * 0.17, S * 0.03, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(150,155,165,.35)'; g.fill();
  // handle
  g.beginPath(); g.ellipse(S * 0.69, S * 0.55, S * 0.1, S * 0.12, 0, -Math.PI / 2, Math.PI / 2); g.lineWidth = S * 0.075; g.strokeStyle = INK; g.stroke(); g.lineWidth = S * 0.045; g.strokeStyle = '#d42a20'; g.stroke();
  // the mug
  const mug = () => { g.beginPath(); g.moveTo(S * 0.27, S * 0.38); g.lineTo(S * 0.3, S * 0.76); g.quadraticCurveTo(S * 0.47, S * 0.82, S * 0.64, S * 0.76); g.lineTo(S * 0.67, S * 0.38); g.closePath(); };
  mug(); g.fillStyle = lin(g, S * 0.27, 0, S * 0.67, 0, [[0, '#8e140d'], [0.3, '#ff5a48'], [0.55, '#e3352a'], [1, '#8e140d']]); g.fill();
  mug(); gloss(g, S, 0.36, 0.5, 0.03, 0.16, 0.6, 0); mug(); line(g, S);
  // a white heart on the side
  g.beginPath(); const hx = S * 0.47, hy = S * 0.59, hs = S * 0.0012; g.moveTo(hx, hy + 40 * hs); g.bezierCurveTo(hx - 60 * hs, hy, hx - 34 * hs, hy - 46 * hs, hx, hy - 20 * hs); g.bezierCurveTo(hx + 34 * hs, hy - 46 * hs, hx + 60 * hs, hy, hx, hy + 40 * hs); g.fillStyle = '#fff'; g.fill();
  // the rim and a latte with a foam heart
  g.beginPath(); g.ellipse(S * 0.47, S * 0.38, S * 0.2, S * 0.055, 0, 0, Math.PI * 2); g.fillStyle = '#f3e2c8'; g.fill(); line(g, S);
  g.beginPath(); g.ellipse(S * 0.47, S * 0.385, S * 0.165, S * 0.038, 0, 0, Math.PI * 2); g.fillStyle = rad(g, S * 0.47, S * 0.385, S * 0.01, S * 0.47, S * 0.385, S * 0.17, [[0, '#e9c79a'], [1, '#8a5428']]); g.fill();
  g.beginPath(); g.ellipse(S * 0.47, S * 0.385, S * 0.05, S * 0.016, 0, 0, Math.PI * 2); g.fillStyle = '#fff6e6'; g.fill();
  // steam
  g.lineCap = 'round'; g.lineWidth = S * 0.02; g.strokeStyle = 'rgba(140,145,160,.6)';
  for (const x of [0.38, 0.47, 0.56]) { g.beginPath(); g.moveTo(S * x, S * 0.3); g.bezierCurveTo(S * (x - 0.04), S * 0.24, S * (x + 0.04), S * 0.18, S * x, S * 0.1); g.stroke(); }
}
function bird(g, S) {
  // a branch with leaves
  g.beginPath(); g.moveTo(S * 0.02, S * 0.73); g.quadraticCurveTo(S * 0.5, S * 0.66, S * 0.98, S * 0.75); g.lineWidth = S * 0.055; g.lineCap = 'round'; g.strokeStyle = INK; g.stroke(); g.lineWidth = S * 0.036; g.strokeStyle = '#7a4a24'; g.stroke();
  g.beginPath(); g.moveTo(S * 0.05, S * 0.72); g.quadraticCurveTo(S * 0.5, S * 0.655, S * 0.95, S * 0.735); g.lineWidth = S * 0.008; g.strokeStyle = 'rgba(255,220,170,.5)'; g.stroke();
  for (const [x, y, a] of [[0.82, 0.65, -0.7], [0.9, 0.68, -0.2], [0.14, 0.68, -2.6]]) {
    g.beginPath(); g.ellipse(S * x, S * y, S * 0.065, S * 0.028, a, 0, Math.PI * 2); g.fillStyle = lin(g, S * (x - 0.05), S * y, S * (x + 0.05), S * y, [[0, '#7ed36b'], [1, '#2e8a3a']]); g.fill(); line(g, S, 0.012);
  }
  // tail
  g.beginPath(); g.moveTo(S * 0.33, S * 0.5); g.lineTo(S * 0.1, S * 0.6); g.lineTo(S * 0.14, S * 0.67); g.lineTo(S * 0.36, S * 0.58); g.closePath(); g.fillStyle = '#164f9a'; g.fill(); line(g, S, 0.018);
  // body and head
  const blue = rad(g, S * 0.48, S * 0.42, S * 0.02, S * 0.5, S * 0.5, S * 0.24, [[0, '#9ad4ff'], [0.6, '#2f82e0'], [1, '#1a56a8']]);
  g.beginPath(); g.ellipse(S * 0.48, S * 0.52, S * 0.18, S * 0.13, -0.2, 0, Math.PI * 2); g.fillStyle = blue; g.fill(); line(g, S);
  g.beginPath(); g.arc(S * 0.65, S * 0.36, S * 0.1, 0, Math.PI * 2); g.fillStyle = blue; g.fill();
  g.beginPath(); g.arc(S * 0.65, S * 0.36, S * 0.1, 0, Math.PI * 2); gloss(g, S, 0.62, 0.31, 0.05, 0.03, 0.6); g.beginPath(); g.arc(S * 0.65, S * 0.36, S * 0.1, 0, Math.PI * 2); line(g, S);
  // a warm belly, a striped wing, beak, eye, feet
  g.beginPath(); g.ellipse(S * 0.54, S * 0.58, S * 0.1, S * 0.06, -0.2, 0, Math.PI * 2); g.fillStyle = lin(g, 0, S * 0.52, 0, S * 0.64, [[0, '#ffd08a'], [1, '#f39a3a']]); g.fill();
  g.beginPath(); g.ellipse(S * 0.43, S * 0.49, S * 0.12, S * 0.065, -0.5, 0, Math.PI * 2); g.fillStyle = '#164f9a'; g.fill(); line(g, S, 0.014);
  g.strokeStyle = 'rgba(160,210,255,.7)'; g.lineWidth = S * 0.007; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(S * (0.36 + i * 0.04), S * (0.52 - i * 0.018)); g.lineTo(S * (0.44 + i * 0.04), S * (0.47 - i * 0.018)); g.stroke(); }
  g.beginPath(); g.moveTo(S * 0.74, S * 0.33); g.lineTo(S * 0.86, S * 0.365); g.lineTo(S * 0.74, S * 0.4); g.closePath(); g.fillStyle = lin(g, 0, S * 0.33, 0, S * 0.4, [[0, '#ffc04a'], [1, '#f07a10']]); g.fill(); line(g, S, 0.014);
  g.beginPath(); g.arc(S * 0.67, S * 0.34, S * 0.022, 0, Math.PI * 2); g.fillStyle = INK; g.fill(); g.beginPath(); g.arc(S * 0.676, S * 0.332, S * 0.008, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
  for (const x of [0.46, 0.54]) { g.beginPath(); g.moveTo(S * x, S * 0.63); g.lineTo(S * x, S * 0.69); g.lineWidth = S * 0.016; g.strokeStyle = '#e08a1a'; g.stroke(); }
}
function phone(g, S) {
  floorShadow(g, S, 0.5, 0.22);
  // ringing lines either side
  g.lineCap = 'round'; g.lineWidth = S * 0.024; g.strokeStyle = '#e0322a';
  for (const d of [1, -1]) for (const k of [0, 1]) { g.beginPath(); g.arc(S * 0.5, S * 0.45, S * (0.27 + k * 0.075), d > 0 ? -0.5 : Math.PI - 0.5, d > 0 ? 0.5 : Math.PI + 0.5); g.stroke(); }
  // the phone, standing a little tilted
  g.save(); g.translate(S * 0.5, S * 0.45); g.rotate(-0.06); g.translate(-S * 0.5, -S * 0.45);
  const x = S * 0.36, y = S * 0.13, w = S * 0.28, h = S * 0.62, r = S * 0.045;
  const body = () => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  body(); g.fillStyle = lin(g, x, 0, x + w, 0, [[0, '#3c3c44'], [0.5, '#1c1c22'], [1, '#3c3c44']]); g.fill(); body(); line(g, S);
  g.fillStyle = lin(g, 0, y, 0, y + h, [[0, '#6fd8ff'], [0.55, '#3c7dff'], [1, '#6a3cff']]); g.fillRect(x + S * 0.02, y + S * 0.05, w - S * 0.04, h - S * 0.11);
  // a caller (a smiling face), a green answer button and a red one
  g.beginPath(); g.arc(S * 0.5, S * 0.32, S * 0.06, 0, Math.PI * 2); g.fillStyle = '#ffd9b0'; g.fill(); g.lineWidth = S * 0.008; g.strokeStyle = '#fff'; g.stroke();
  g.beginPath(); g.arc(S * 0.48, S * 0.31, S * 0.007, 0, Math.PI * 2); g.arc(S * 0.52, S * 0.31, S * 0.007, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
  g.beginPath(); g.arc(S * 0.5, S * 0.33, S * 0.025, 0.2, Math.PI - 0.2); g.lineWidth = S * 0.006; g.strokeStyle = INK; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(S * 0.43, S * 0.41, S * 0.14, S * 0.014); g.fillRect(S * 0.45, S * 0.435, S * 0.1, S * 0.01);
  g.beginPath(); g.arc(S * 0.43, S * 0.6, S * 0.035, 0, Math.PI * 2); g.fillStyle = '#e0322a'; g.fill(); g.lineWidth = S * 0.006; g.strokeStyle = '#fff'; g.stroke();
  g.beginPath(); g.arc(S * 0.57, S * 0.6, S * 0.035, 0, Math.PI * 2); g.fillStyle = '#2ec45a'; g.fill(); g.stroke();
  g.fillStyle = '#111'; g.fillRect(S * 0.47, y + S * 0.02, S * 0.06, S * 0.012);
  // glass shine
  g.save(); body(); g.clip(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x, y + S * 0.2); g.lineTo(x + w, y); g.lineTo(x + w, y + S * 0.1); g.lineTo(x, y + S * 0.32); g.closePath(); g.fill(); g.restore();
  g.restore();
}

const DRAW = { key, dog, bicycle, guitar, cup, bird, phone };
export const KINDS = Object.keys(DRAW);
export function thingCanvas(kind, size = 512, { background = true } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); if (background) room(g, size); (DRAW[kind] || key)(g, size); if (background) vignette(g, size); return c;
}
