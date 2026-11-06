// REASONS FOR A CURE (Rusty Perez): the drawn props for "Pin the Memories".
// Ten small painted photographs in the warm, worn style of the photos on the wall in the painting (cream border, soft
// muted colours, a little paper grain), each one a moment you'd want to see:
//   Mom's smile · baby's first steps · wedding day · sunset at the beach · birthday candles ·
//   fireworks · first snow · kids on the swings · dancing in the kitchen · Grandpa's face
// No words on the photos (the game says each name out loud and shows it big). All drawn in canvas, no emoji.
// draw*(g, W, H, …) are plain canvas drawings (so they can be previewed anywhere); *Tex() wrap them as textures.
import * as K from './kit.js';

export const MEMORIES = ['Mom’s smile', 'Baby’s first steps', 'Wedding day', 'Sunset at the beach', 'Birthday candles',
  'Fireworks', 'First snow', 'Kids on the swings', 'Dancing in the kitchen', 'Grandpa’s face'];

const SKIN = '#e2b48c', SKIN2 = '#b98559', INK = '#3a2c22';

// one photo, in a W×H box (designed at 200×240): cream border, the picture, paper grain, a pin hole at the top
export function drawMemory(g, W, H, i = 0, { glow = 0 } = {}) {
  g.save(); const s = Math.min(W / 200, H / 240); g.translate((W - 200 * s) / 2, (H - 240 * s) / 2); g.scale(s, s);
  // soft shadow and the cream card
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(8, 10, 188, 226);
  g.fillStyle = '#efe4cc'; g.fillRect(4, 4, 188, 226);
  // the picture
  g.save(); g.beginPath(); g.rect(16, 16, 164, 166); g.clip(); g.translate(16, 16);
  SCENES[i](g, 164, 166);
  // a warm, faded, old-photo wash
  g.fillStyle = 'rgba(214,170,110,.16)'; g.fillRect(0, 0, 164, 166);
  const v = g.createRadialGradient(82, 83, 40, 82, 83, 120); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,24,10,.38)'); g.fillStyle = v; g.fillRect(0, 0, 164, 166);
  g.restore();
  // paper grain
  for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,250,235' : '90,60,30'},${0.05 + Math.random() * 0.07})`; g.fillRect(4 + Math.random() * 188, 4 + Math.random() * 226, 2, 2); }
  // the brass pin at the top
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(100, 13, 7, 0, Math.PI * 2); g.fill();
  const pg = g.createRadialGradient(97, 9, 1, 98, 10, 7); pg.addColorStop(0, '#fff3c4'); pg.addColorStop(1, '#b8892f'); g.fillStyle = pg; g.beginPath(); g.arc(98, 10, 6.5, 0, Math.PI * 2); g.fill();
  if (glow) { g.strokeStyle = `rgba(255,214,120,${glow})`; g.lineWidth = 8; g.strokeRect(4, 4, 188, 226); }
  g.restore();
}

const sky = (g, W, H, a, b) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H); };
const circ = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
const line = (g, c, w, ...p) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.stroke(); };
// a simple person: head + body, facing us
function person(g, x, y, sc, body, { hair = INK, skirt = false, longHair = false } = {}) {
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.fillStyle = body; g.beginPath();
  if (skirt) { g.moveTo(-14, -52); g.lineTo(14, -52); g.lineTo(26, 0); g.lineTo(-26, 0); } else { g.moveTo(-15, -52); g.lineTo(15, -52); g.lineTo(13, 0); g.lineTo(-13, 0); }
  g.closePath(); g.fill();
  if (longHair) { g.fillStyle = hair; g.fillRect(-15, -70, 30, 22); }   // shoulder-length hair, behind the head
  circ(g, 0, -66, 12, SKIN); g.fillStyle = hair; g.beginPath(); g.arc(0, -68, 12.5, Math.PI, 0); g.fill();
  g.restore();
}
const SCENES = [
  // Mom's smile
  (g, W, H) => {
    sky(g, W, H, '#c9a27a', '#8d6a4c');
    g.fillStyle = '#5b3a26'; g.beginPath(); g.ellipse(82, 92, 56, 66, 0, 0, Math.PI * 2); g.fill();          // hair
    g.fillStyle = '#6f8a8e'; g.beginPath(); g.ellipse(82, 176, 64, 40, 0, 0, Math.PI * 2); g.fill();         // shoulders
    circ(g, 82, 88, 40, SKIN); g.fillStyle = SKIN2; g.fillRect(74, 120, 16, 18);                              // face, neck
    g.fillStyle = '#5b3a26'; g.beginPath(); g.ellipse(82, 58, 42, 18, 0, Math.PI, 0); g.fill();               // fringe
    line(g, INK, 3, 64, 84, 72, 80); line(g, INK, 3, 92, 80, 100, 84);                                        // smiling eyes
    g.strokeStyle = '#a2463a'; g.lineWidth = 4; g.beginPath(); g.arc(82, 98, 14, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();   // the smile
    circ(g, 62, 100, 6, 'rgba(220,120,110,.45)'); circ(g, 102, 100, 6, 'rgba(220,120,110,.45)');               // rosy cheeks
  },
  // Baby's first steps
  (g, W, H) => {
    sky(g, W, H, '#d8c3a0', '#b89a76'); g.fillStyle = '#8a6448'; g.fillRect(0, 118, W, 48);                    // wall, wooden floor
    for (let x = 0; x < W; x += 28) line(g, 'rgba(60,40,25,.4)', 2, x, 118, x - 10, H);
    line(g, SKIN2, 11, 18, 52, 46, 70, 58, 78); line(g, SKIN2, 11, 146, 52, 118, 70, 106, 78);               // grown-up hands reaching in
    g.fillStyle = '#f1efe6'; g.beginPath(); g.ellipse(82, 112, 18, 22, 0, 0, Math.PI * 2); g.fill();          // baby onesie
    line(g, '#f1efe6', 9, 72, 128, 68, 146); line(g, '#f1efe6', 9, 92, 128, 98, 144);                         // wobbly legs
    line(g, SKIN, 8, 68, 100, 54, 82); line(g, SKIN, 8, 96, 100, 110, 82);                                    // arms up
    circ(g, 82, 80, 15, SKIN); circ(g, 82, 68, 5, '#7a5236');                                                  // head, a curl
    g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(82, 82, 6, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  },
  // Wedding day
  (g, W, H) => {
    sky(g, W, H, '#b9c7c0', '#8fa39a'); g.fillStyle = '#6c8a5a'; g.fillRect(0, 130, W, 36);
    g.strokeStyle = '#efe7d6'; g.lineWidth = 10; g.beginPath(); g.arc(82, 120, 66, Math.PI, 0); g.stroke();   // the arch
    for (let a = 0; a <= 12; a++) { const t = Math.PI + a / 12 * Math.PI; circ(g, 82 + Math.cos(t) * 66, 120 + Math.sin(t) * 66, 7, a % 2 ? '#e7a3a9' : '#f4e3c0'); }
    person(g, 62, 150, 1.05, '#f6f2ea', { skirt: true, longHair: true, hair: '#7a5236' });                   // bride
    person(g, 104, 150, 1.05, '#2e2f38');                                                                     // groom
    circ(g, 80, 118, 8, '#e7a3a9'); circ(g, 86, 112, 6, '#f4e3c0');                                           // bouquet between them
  },
  // Sunset at the beach
  (g, W, H) => {
    sky(g, W, H, '#e9a46a', '#f3cf8e'); circ(g, 82, 92, 26, '#fbe7a6');
    g.fillStyle = '#5f7f8c'; g.fillRect(0, 98, W, 40);
    for (let y = 104; y < 136; y += 7) line(g, 'rgba(255,230,170,.55)', 2, 50 + (y % 14), y, 114 - (y % 14), y);
    g.fillStyle = '#d9b98a'; g.beginPath(); g.moveTo(0, 138); g.quadraticCurveTo(82, 124, W, 140); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    line(g, '#3a3030', 2.5, 30, 50, 36, 46, 42, 50); line(g, '#3a3030', 2.5, 48, 40, 53, 37, 58, 40);          // two gulls
  },
  // Birthday candles
  (g, W, H) => {
    sky(g, W, H, '#5a4038', '#3a2a26');
    const glow = g.createRadialGradient(82, 70, 4, 82, 70, 80); glow.addColorStop(0, 'rgba(255,200,110,.55)'); glow.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H);
    g.fillStyle = '#f0d9e0'; g.fillRect(30, 104, 104, 44); g.fillStyle = '#d98ea0'; g.fillRect(30, 98, 104, 14);   // cake, icing
    for (let k = 0; k < 5; k++) { const x = 44 + k * 19; g.fillStyle = ['#7fb0d6', '#f2c14e', '#9fd09a', '#e98a8a', '#c3a0e0'][k]; g.fillRect(x - 3, 72, 6, 26);
      g.fillStyle = '#ffd36a'; g.beginPath(); g.ellipse(x, 64, 4, 8, 0, 0, Math.PI * 2); g.fill(); circ(g, x, 66, 2.5, '#fff7d6'); }
    g.fillStyle = '#e8e2d6'; g.beginPath(); g.ellipse(82, 150, 66, 9, 0, 0, Math.PI * 2); g.fill();          // plate
  },
  // Fireworks
  (g, W, H) => {
    sky(g, W, H, '#1d2440', '#3a3050');
    const burst = (x, y, r, c) => { for (let a = 0; a < 16; a++) { const t = a / 16 * Math.PI * 2; line(g, c, 2.5, x + Math.cos(t) * r * 0.25, y + Math.sin(t) * r * 0.25, x + Math.cos(t) * r, y + Math.sin(t) * r); circ(g, x + Math.cos(t) * r, y + Math.sin(t) * r, 2.5, c); } };
    burst(52, 56, 32, '#f2c14e'); burst(116, 44, 26, '#e98a8a'); burst(100, 98, 22, '#9fd0e8');
    g.fillStyle = '#141824'; g.beginPath(); g.moveTo(0, 166); for (let x = 0; x <= W; x += 20) g.lineTo(x, 140 - ((x / 20) % 2) * 10); g.lineTo(W, 166); g.fill();   // rooftops
  },
  // First snow
  (g, W, H) => {
    sky(g, W, H, '#9fb2c2', '#d9e2e8'); g.fillStyle = '#f4f6f8'; g.beginPath(); g.moveTo(0, 130); g.quadraticCurveTo(82, 116, W, 132); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = '#3f5d4a'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(82, 34 + k * 26); g.lineTo(46 - k * 6, 82 + k * 26); g.lineTo(118 + k * 6, 82 + k * 26); g.fill(); }
    g.fillStyle = '#f4f6f8'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(82, 36 + k * 26); g.lineTo(66 - k * 3, 58 + k * 26); g.lineTo(98 + k * 3, 58 + k * 26); g.fill(); }
    g.fillStyle = '#5a4030'; g.fillRect(76, 134, 12, 14);
    for (let k = 0; k < 40; k++) circ(g, (k * 37) % W, (k * 53) % 120, 1.5 + (k % 3), 'rgba(255,255,255,.9)');
  },
  // Kids on the swings
  (g, W, H) => {
    sky(g, W, H, '#a9c4d4', '#d5e1d0'); g.fillStyle = '#86a35e'; g.fillRect(0, 136, W, 30);
    line(g, '#8a5a3a', 6, 20, 140, 40, 26, 124, 26, 144, 140);                                                // the frame
    line(g, '#3a2c22', 2, 60, 28, 46, 98); line(g, '#3a2c22', 2, 76, 28, 66, 100);                            // chains (swinging)
    g.fillStyle = '#c95a3a'; g.fillRect(40, 96, 32, 6);
    person(g, 56, 98, 0.62, '#e0b13c', { longHair: true, hair: '#7a5236' });
    line(g, SKIN, 5, 50, 96, 36, 104); line(g, SKIN, 5, 62, 96, 52, 108);                                     // legs kicking up
    line(g, '#3a2c22', 2, 106, 28, 106, 106); line(g, '#3a2c22', 2, 124, 28, 124, 106); g.fillStyle = '#4a7ab0'; g.fillRect(100, 104, 30, 6);
    person(g, 115, 106, 0.6, '#5a8fc0');
  },
  // Dancing in the kitchen
  (g, W, H) => {
    sky(g, W, H, '#e2c79a', '#cfae7c');
    for (let y = 120; y < H; y += 12) for (let x = ((y / 12) % 2) * 12; x < W; x += 24) { g.fillStyle = '#4a3a30'; g.fillRect(x, y, 12, 12); }   // checker floor
    g.fillStyle = '#9db8a6'; g.fillRect(0, 70, W, 50); g.fillStyle = '#7d9886'; for (let x = 6; x < W; x += 40) g.fillRect(x, 76, 32, 38);       // cupboards
    g.save(); g.translate(82, 140); g.rotate(-0.08);
    person(g, -18, 0, 1, '#c95a5a', { skirt: true, longHair: true, hair: '#3a2c22' }); person(g, 20, 0, 1.05, '#4a6a8a');
    line(g, SKIN, 6, -6, -46, 8, -50); line(g, SKIN, 6, -30, -46, -40, -66); line(g, SKIN, 6, 34, -46, -38, -68);   // holding hands, arms up in a twirl
    g.restore();
  },
  // Grandpa's face
  (g, W, H) => {
    sky(g, W, H, '#b9a58a', '#8e7a62');
    g.fillStyle = '#5a6a5a'; g.beginPath(); g.ellipse(82, 178, 66, 42, 0, 0, Math.PI * 2); g.fill();         // cardigan
    circ(g, 82, 92, 40, SKIN); g.fillStyle = SKIN2; g.fillRect(72, 124, 20, 18);
    g.fillStyle = '#e8e4dc'; g.beginPath(); g.ellipse(44, 92, 9, 16, 0, 0, Math.PI * 2); g.ellipse(120, 92, 9, 16, 0, 0, Math.PI * 2); g.fill();   // white hair at the sides
    g.fillStyle = '#6a4a32'; g.beginPath(); g.ellipse(82, 60, 52, 10, 0, 0, Math.PI * 2); g.fill(); g.fillRect(50, 34, 64, 26);                    // flat cap
    g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(58, 84, 20, 14); g.strokeRect(86, 84, 20, 14); line(g, INK, 2.5, 78, 90, 86, 90);         // glasses
    circ(g, 68, 91, 2.5, INK); circ(g, 96, 91, 2.5, INK);
    g.fillStyle = '#efece6'; g.beginPath(); g.ellipse(82, 110, 18, 7, 0, 0, Math.PI * 2); g.fill();          // white moustache
    g.strokeStyle = '#8a4a3a'; g.lineWidth = 3; g.beginPath(); g.arc(82, 112, 9, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  },
];

const cache = new Map();
const once = (key, make) => { if (!cache.has(key)) { const t = make(); t._shared = true; cache.set(key, t); } return cache.get(key); };
export const memoryTex = (i) => once('M' + i, () => K.canvasTex(200, 240, (g, W, H) => drawMemory(g, W, H, i)));
