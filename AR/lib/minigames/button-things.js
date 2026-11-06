// THE BUTTON IS TO THE LEFT (Anthony Ferraro): the drawn props for "Find the button".
// In the painting's comic-book city style: bold ink outlines, flat yellows and steel blues.
//  · the accessible crossing button (yellow housing, a big raised arrow, raised dots), plain and glowing
//  · the walk signal (white walking person) and the don't-walk hand (orange), for the painting's own signal head
//  · a yellow taxi streaking past, and a friendly passerby who helps when you ask
// draw*(g, W, H) are plain canvas drawings (preview anywhere); *Tex() wrap them as textures.
import * as K from './kit.js';

const INK = '#141a26';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }

// the crossing button: lit adds a warm glow and a bright arrow (pressed / found)
export function drawButton(g, W, H, lit = false) {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 256; g.scale(s, s);
  if (lit) { const q = g.createRadialGradient(0, 0, 40, 0, 0, 128); q.addColorStop(0, 'rgba(255,230,120,.9)'); q.addColorStop(1, 'rgba(255,230,120,0)'); g.fillStyle = q; g.fillRect(-128, -128, 256, 256); }
  g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = INK;
  rr(g, -62, -96, 124, 192, 16); g.fillStyle = '#f2b51c'; g.fill(); g.stroke();                 // housing
  rr(g, -52, -86, 104, 62, 8); g.fillStyle = '#fbf7ea'; g.fill(); g.lineWidth = 5; g.stroke();     // the little sign
  g.fillStyle = INK; g.beginPath(); g.arc(-26, -68, 6, 0, Math.PI * 2); g.fill();                  // walking person on the sign
  g.lineWidth = 6; g.beginPath(); g.moveTo(-26, -62); g.lineTo(-28, -46); g.lineTo(-36, -34); g.moveTo(-28, -46); g.lineTo(-18, -34); g.moveTo(-34, -56); g.lineTo(-18, -52); g.stroke();
  g.lineWidth = 6; g.beginPath(); g.moveTo(-4, -55); g.lineTo(38, -55); g.stroke();                // arrow on the sign
  g.beginPath(); g.moveTo(40, -55); g.lineTo(28, -64); g.lineTo(28, -46); g.closePath(); g.fill();
  g.beginPath(); g.arc(0, 26, 46, 0, Math.PI * 2); g.fillStyle = lit ? '#2b3a55' : '#1c2433'; g.fill(); g.lineWidth = 7; g.stroke();   // the push button
  g.beginPath(); g.arc(0, 26, 36, 0, Math.PI * 2); g.fillStyle = lit ? '#3d5a8a' : '#2b3a55'; g.fill();
  g.fillStyle = lit ? '#fff3b0' : '#f2b51c'; g.beginPath();                                          // the big raised arrow
  g.moveTo(-24, 20); g.lineTo(6, 20); g.lineTo(6, 8); g.lineTo(28, 26); g.lineTo(6, 44); g.lineTo(6, 32); g.lineTo(-24, 32); g.closePath(); g.fill();
  g.fillStyle = '#f7e6a8'; for (const [x, y] of [[-30, 82], [-15, 82], [0, 82], [15, 82], [30, 82]]) { g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill(); }   // raised dots
  g.restore();
}
// the walk signal: a white walking person on black
export function drawWalk(g, W, H) {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 256; g.scale(s, s);
  const q = g.createRadialGradient(0, 0, 50, 0, 0, 128); q.addColorStop(0, 'rgba(235,250,255,.75)'); q.addColorStop(1, 'rgba(235,250,255,0)'); g.fillStyle = q; g.fillRect(-128, -128, 256, 256);
  rr(g, -86, -86, 172, 172, 18); g.fillStyle = '#0d1118'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#f4fbff'; g.strokeStyle = '#f4fbff'; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.arc(6, -52, 15, 0, Math.PI * 2); g.fill();
  g.lineWidth = 20; g.beginPath(); g.moveTo(2, -30); g.lineTo(-6, 14); g.stroke();                       // body
  g.lineWidth = 15; g.beginPath(); g.moveTo(-6, 14); g.lineTo(-30, 58); g.moveTo(-6, 14); g.lineTo(14, 36); g.lineTo(22, 64); g.stroke();   // legs
  g.beginPath(); g.moveTo(0, -24); g.lineTo(-26, 0); g.moveTo(0, -24); g.lineTo(24, -4); g.lineTo(36, 10); g.stroke();                    // arms
  g.restore();
}
// don't walk: an orange hand on black
export function drawHand(g, W, H) {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 256; g.scale(s, s);
  rr(g, -86, -86, 172, 172, 18); g.fillStyle = '#0d1118'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#ff7a1a'; g.strokeStyle = '#ff7a1a'; g.lineCap = 'round';
  rr(g, -34, -6, 68, 66, 22); g.fill();                                                                    // palm
  g.lineWidth = 17; for (const [x, top] of [[-26, -44], [-8, -58], [10, -56], [28, -40]]) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, top); g.stroke(); }   // fingers
  g.beginPath(); g.moveTo(-30, 30); g.lineTo(-52, 8); g.stroke();                                          // thumb
  g.restore();
}
// a yellow taxi streaking past (seen from the side, moving left), with a motion blur
export function drawTaxi(g, W, H) {
  g.save(); g.scale(W / 512, H / 220);
  for (let i = 6; i >= 1; i--) { g.globalAlpha = 0.08; g.fillStyle = '#f5c400'; rr(g, 40 + i * 22, 70, 420, 110, 40); g.fill(); }
  g.globalAlpha = 1; g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = INK;
  g.fillStyle = '#f5c400'; g.beginPath(); g.moveTo(40, 160); g.lineTo(48, 112); g.lineTo(140, 100); g.lineTo(190, 52); g.lineTo(330, 50); g.lineTo(390, 100); g.lineTo(470, 110); g.lineTo(478, 160); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#9fc6e6'; g.beginPath(); g.moveTo(160, 100); g.lineTo(200, 62); g.lineTo(255, 62); g.lineTo(255, 100); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(270, 100); g.lineTo(270, 62); g.lineTo(322, 62); g.lineTo(366, 100); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#141a26'; for (let x = 150; x < 380; x += 26) g.fillRect(x, 120, 13, 10);                // checker stripe
  rr(g, 220, 30, 70, 22, 6); g.fillStyle = '#fbf7ea'; g.fill(); g.stroke();                              // roof sign
  g.fillStyle = '#fff6c8'; g.beginPath(); g.ellipse(52, 128, 10, 8, 0, 0, Math.PI * 2); g.fill();         // headlight
  for (const x of [120, 390]) { g.fillStyle = INK; g.beginPath(); g.arc(x, 162, 30, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8a95a8'; g.beginPath(); g.arc(x, 162, 12, 0, Math.PI * 2); g.fill(); }
  g.restore();
}
// a friendly passerby who helps when you ask: waving, with a speech bubble
export function drawHelper(g, W, H) {
  g.save(); g.translate(W / 2, H / 2); const s = Math.min(W, H) / 256; g.scale(s, s);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 7; g.strokeStyle = INK;
  g.fillStyle = '#e94b6a'; g.beginPath(); g.moveTo(-40, 110); g.lineTo(-34, 10); g.quadraticCurveTo(0, -12, 34, 10); g.lineTo(40, 110); g.closePath(); g.fill(); g.stroke();   // coat
  g.fillStyle = '#c98a5e'; g.beginPath(); g.arc(0, -30, 26, 0, Math.PI * 2); g.fill(); g.stroke();                                                         // head
  g.fillStyle = '#2a2230'; g.beginPath(); g.arc(0, -40, 26, Math.PI, 0); g.fill();                                                                          // hair
  g.lineWidth = 14; g.strokeStyle = '#e94b6a'; g.beginPath(); g.moveTo(30, 20); g.lineTo(62, -24); g.stroke();                                               // waving arm
  g.lineWidth = 7; g.strokeStyle = INK; g.fillStyle = '#c98a5e'; g.beginPath(); g.arc(66, -30, 11, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = INK; g.beginPath(); g.arc(-9, -30, 3.5, 0, Math.PI * 2); g.arc(9, -30, 3.5, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(0, -22, 9, 0.2, Math.PI - 0.2); g.stroke();                                                                                          // smile
  rr(g, -118, -122, 104, 58, 14); g.fillStyle = '#fbf7ea'; g.fill(); g.stroke();                                                                           // speech bubble
  g.beginPath(); g.moveTo(-40, -66); g.lineTo(-28, -50); g.lineTo(-56, -66); g.fillStyle = '#fbf7ea'; g.fill();
  g.fillStyle = INK; g.font = '900 30px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HI!', -66, -93);
  g.restore();
}

// YOU, seen from behind, walking away from us across the street with a long white cane sweeping ahead. Long, wavy brown
// hair (like Anthony's). Ink outlines and two-tone shading like the painting: lit from the upper left, shadows to the right.
// pose: 'stand' | 'stepL' | 'stepR' | 'startle' (jumped back, arms up); sweep: -1 (cane tip far left) … 1 (far right)
export function drawWalker(g, W, H, pose = 'stand', sweep = 0) {
  g.save(); g.scale(W / 256, H / 384);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const st = pose === 'startle', lUp = pose === 'stepL' ? 9 : 0, rUp = pose === 'stepR' ? 9 : 0;
  const sway = pose === 'stepL' ? 3 : pose === 'stepR' ? -3 : 0, lean = st ? -4 : 0;
  const ink = (w = 5) => { g.strokeStyle = INK; g.lineWidth = w; g.stroke(); };
  const lin = (x0, y0, x1, y1, a, b) => { const q = g.createLinearGradient(x0, y0, x1, y1); q.addColorStop(0, a); q.addColorStop(1, b); return q; };
  // the long cast shadow on the street (the sun is up to the left)
  g.fillStyle = 'rgba(18,26,44,.28)'; g.beginPath(); g.moveTo(96, 372); g.lineTo(160, 372); g.lineTo(252, 330); g.lineTo(214, 326); g.closePath(); g.fill();
  g.fillStyle = 'rgba(18,26,44,.38)'; g.beginPath(); g.ellipse(128, 372, 50, 7, 0, 0, Math.PI * 2); g.fill();
  // the cane: grip in the right hand, a long white shaft out ahead (up the screen), red tip, a rolling ball tip
  const hx = st ? 190 : 170, hy = st ? 150 : 222, tx = 128 + sweep * 112, ty = st ? 118 : 300;
  const along = (k) => [hx + (tx - hx) * k, hy + (ty - hy) * k];
  g.lineWidth = 10; g.strokeStyle = INK; g.beginPath(); g.moveTo(hx, hy); g.lineTo(tx, ty); g.stroke();
  const [rx, ry] = along(0.8);
  g.lineWidth = 6; g.strokeStyle = '#ffffff'; g.beginPath(); g.moveTo(...along(0.1)); g.lineTo(rx, ry); g.stroke();
  g.strokeStyle = '#d9d4ca'; g.lineWidth = 2; g.beginPath(); g.moveTo(...along(0.12)); g.lineTo(...along(0.78)); g.stroke();   // its shaded side
  g.strokeStyle = '#d8232b'; g.lineWidth = 6; g.beginPath(); g.moveTo(rx, ry); g.lineTo(tx, ty); g.stroke();
  g.fillStyle = '#f2efe8'; g.beginPath(); g.arc(tx, ty + 2, 5.5, 0, Math.PI * 2); g.fill(); ink(3);
  g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(...along(-0.05)); g.lineTo(...along(0.1)); g.stroke();             // the black grip
  // legs: jeans with a seam and a shaded inner side; the stepping leg lifts
  const leg = (x0, x1, up, sideL) => {
    g.beginPath(); g.moveTo(x0, 228); g.lineTo(x1, 228); g.lineTo(x1 - 2 + (sideL ? 0 : 1), 350 - up); g.lineTo(x0 + 2, 350 - up); g.closePath();
    g.fillStyle = lin(x0, 0, x1, 0, sideL ? '#4a69a6' : '#3a5690', sideL ? '#2c4374' : '#22335c'); g.fill(); ink();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo((x0 + x1) / 2, 240); g.lineTo((x0 + x1) / 2 + (sideL ? -1 : 1), 344 - up); g.stroke();
    g.strokeStyle = 'rgba(12,20,40,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + 6, 300 - up); g.lineTo(x1 - 6, 304 - up); g.stroke();   // a fold at the knee
  };
  leg(100 + sway, 127 + sway, lUp, true); leg(129 + sway, 156 + sway, rUp, false);
  // sneakers: dark uppers, white soles
  const shoe = (x, up) => { g.beginPath(); g.roundRect(x, 342 - up, 32, 22, 9); g.fillStyle = '#20242e'; g.fill(); ink(4);
    g.beginPath(); g.roundRect(x + 1, 356 - up, 30, 8, 4); g.fillStyle = '#f3f1ea'; g.fill(); ink(3); };
  shoe(96 + sway, lUp); shoe(128 + sway, rUp);
  // the jacket (a teal hoodie): lit on the left, shaded on the right, with a hood bunched at the neck and a hem band
  g.beginPath(); g.moveTo(90 + lean, 112); g.quadraticCurveTo(128 + lean, 94, 166 + lean, 112); g.lineTo(170, 226); g.quadraticCurveTo(128, 236, 86, 226); g.closePath();
  g.fillStyle = lin(86, 0, 170, 0, '#35b3ad', '#14706f'); g.fill(); ink();
  g.beginPath(); g.moveTo(88, 214); g.quadraticCurveTo(128, 224, 168, 214); g.lineTo(170, 228); g.quadraticCurveTo(128, 238, 86, 228); g.closePath(); g.fillStyle = '#126463'; g.fill(); ink(4);   // hem
  g.strokeStyle = 'rgba(8,40,44,.45)'; g.lineWidth = 3;
  for (const [a, b, c, d] of [[148, 130, 156, 200], [104, 140, 100, 196], [128, 150, 130, 206]]) { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 4, (b + d) / 2, c, d); g.stroke(); }   // folds
  g.beginPath(); g.moveTo(102, 108); g.quadraticCurveTo(128, 136, 154, 108); g.quadraticCurveTo(128, 118, 102, 108); g.fillStyle = '#1b8784'; g.fill(); ink(4);   // the hood
  // arms: sleeves with cuffs and hands; the left swings with the step, the right holds the cane
  const arm = (sx, sy, ex, ey, lit) => {
    g.beginPath(); g.moveTo(sx - 9, sy); g.lineTo(ex - 8, ey); g.lineTo(ex + 8, ey); g.lineTo(sx + 9, sy); g.closePath();
    g.fillStyle = lit ? '#2ea69f' : '#167473'; g.fill(); ink();
    g.beginPath(); g.moveTo(ex - 8, ey - 6); g.lineTo(ex + 8, ey - 6); g.lineTo(ex + 8, ey); g.lineTo(ex - 8, ey); g.closePath(); g.fillStyle = '#0f5a59'; g.fill(); ink(3);   // cuff
  };
  const hand = (x, y) => { g.beginPath(); g.ellipse(x, y + 6, 8, 10, 0, 0, Math.PI * 2); g.fillStyle = lin(x - 8, 0, x + 8, 0, '#d9a074', '#b07650'); g.fill(); ink(4); };
  if (st) { arm(94, 118, 66, 70, true); hand(66, 58); arm(162, 118, 190, 136, false); hand(hx, hy - 8); }
  else { const s = pose === 'stepL' ? 9 : pose === 'stepR' ? -9 : 0; arm(96, 118, 86 + s, 214, true); hand(86 + s, 212); arm(160, 118, hx, hy - 8, false); hand(hx, hy - 10); }
  // long, wavy brown hair falling past the shoulders, swaying as you walk
  const wv = (y, k) => Math.sin(y * 0.11 + k) * 5, hs = (y) => sway * (y - 70) / 108;
  g.beginPath(); g.moveTo(98 + lean, 70);
  g.bezierCurveTo(94 + lean, 30, 162 + lean, 30, 158 + lean, 70);
  for (let y = 70; y <= 160; y += 9) g.lineTo(160 + (y - 70) * 0.06 + wv(y, 0) + hs(y), y);
  for (let x = 166; x >= 90; x -= 9) g.lineTo(x + sway, 164 + Math.sin(x * 0.22) * 7);
  for (let y = 160; y >= 70; y -= 9) g.lineTo(96 - (y - 70) * 0.06 + wv(y, 2) + hs(y), y);
  g.closePath(); g.fillStyle = lin(90, 40, 170, 180, '#9a6638', '#4c2c17'); g.fill(); ink();
  const strand = (x0, y0, y1, col, w, ph) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); for (let y = y0; y <= y1; y += 8) g.lineTo(x0 + Math.sin(y * 0.12 + ph) * 5 + hs(y), y); g.stroke(); };
  for (const [x0, ph] of [[104, 0], [118, 1], [132, 2.2], [146, 3]]) strand(x0, 50, 154, '#4a2a16', 3, ph);       // the dark waves
  for (const [x0, ph] of [[108, 0.5], [124, 1.6], [140, 2.6]]) strand(x0, 46, 140, '#c08a52', 2.5, ph);          // highlights, lit from the left
  strand(112, 42, 92, '#e0b07a', 2, 0.3);                                                                         // the shine on top
  for (const [cx, cy] of [[100, 160], [128, 168], [156, 161]]) { g.strokeStyle = '#4a2a16'; g.lineWidth = 3; g.beginPath(); g.arc(cx + sway, cy, 5, 0.3, Math.PI * 1.6); g.stroke(); }   // curls at the ends
  g.restore();
}

const cache = {};
const tex = (k, w, h, f) => cache[k] || (cache[k] = K.canvasTex(w, h, f));
export const buttonTex = (lit = false) => tex('btn' + lit, 256, 256, (g, W, H) => drawButton(g, W, H, lit));
export const walkTex = () => tex('walk', 256, 256, drawWalk);
export const handTex = () => tex('hand', 256, 256, drawHand);
export const taxiTex = () => tex('taxi', 512, 220, drawTaxi);
export const helperTex = () => tex('helper', 256, 256, drawHelper);
export const walkerTex = (pose, sweep) => tex('walker' + pose + sweep, 256, 384, (g, W, H) => drawWalker(g, W, H, pose, sweep));
