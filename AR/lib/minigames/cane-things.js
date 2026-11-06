// MUSIC ON THE STREETS (Alayna Lopez): the drawn props for "Cane Beat".
// Lit like the painting: a bird's-eye view of a grey city street, soft daylight from the upper left, with bright
// graffiti music notes in orange, yellow, pink and blue.
//  · Alayna seen from above (her orange beanie, curly brown hair, sea-green puffer coat, as in her Roller Coaster painting),
//    from behind or from the front (her face, big brown eyes as in her self-portrait), walking: 'stand' | 'stepL' | 'stepR'
//  · her long white cane (black grip, red band, rolling tip), drawn upright with the grip at the top
//  · the yellow bump-dome pad at each curb (plain, and lit when she steps on it)
//  · the graffiti music notes that fly up when the cane sings: 'eighth' | 'beamed' | 'quarter' | 'clef'
//  · the glow that runs along a stripe when the cane touches it
// draw*(g, W, H, …) are plain canvas drawings (preview anywhere); *Tex() wrap them as textures (cached).
import * as K from './kit.js';

export const NOTE_COLORS = ['#ff9a1f', '#ffc928', '#ff6fae', '#4fb0ff'];
const INK = '#16120f';

/* ───────── Alayna, from above and behind ───────── */
// view: 'back' (walking away, up the screen) | 'front' (walking toward you or sideways: her face, big brown eyes as in her self-portrait)
export function drawAlayna(g, W, H, pose = 'stand', view = 'back') {
  if (view === 'front') return drawAlaynaFront(g, W, H, pose);
  g.save(); const s = Math.min(W, H) / 256; g.scale(s, s);
  const step = pose === 'stepL' ? -1 : pose === 'stepR' ? 1 : 0;
  g.lineJoin = 'round'; g.lineCap = 'round';
  // a soft light halo so she reads on the dark street, and her shadow (light from the upper left → shadow lower right)
  const halo = g.createRadialGradient(128, 128, 30, 128, 128, 126); halo.addColorStop(0, 'rgba(255,250,235,.38)'); halo.addColorStop(1, 'rgba(255,250,235,0)');
  g.fillStyle = halo; g.fillRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(0,0,0,.38)'; g.beginPath(); g.ellipse(140, 222, 50, 15, 0.12, 0, Math.PI * 2); g.fill();
  // legs (dark jeans) and boots: one steps forward (lower on the screen), the other back
  const leg = (x, len, lift) => {
    g.fillStyle = '#26324a'; g.strokeStyle = INK; g.lineWidth = 4;
    g.beginPath(); g.roundRect(x - 13, 160 - lift, 26, len, 10); g.fill(); g.stroke();
    g.fillStyle = '#3a2418'; g.beginPath(); g.ellipse(x, 160 - lift + len, 15, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  };
  leg(112, 50 + step * -10, step < 0 ? -2 : 0); leg(144, 50 + step * 10, step > 0 ? -2 : 0);
  // left arm swings with the step (the right one holds the cane out in front: drawn by the game, the hand is here)
  g.fillStyle = '#2f6158'; g.strokeStyle = INK; g.lineWidth = 4;
  g.save(); g.translate(84, 104); g.rotate(0.18 + step * 0.22);
  g.beginPath(); g.roundRect(-14, 0, 26, 62, 12); g.fill(); g.stroke();
  g.fillStyle = '#e8b48e'; g.beginPath(); g.arc(-1, 64, 9, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  // the puffer coat: quilted, sea green, lit from the upper left
  g.beginPath(); g.moveTo(84, 96); g.quadraticCurveTo(128, 80, 172, 96); g.lineTo(178, 150); g.quadraticCurveTo(128, 176, 78, 150); g.closePath();
  const coat = g.createLinearGradient(80, 90, 180, 170); coat.addColorStop(0, '#4f8a7f'); coat.addColorStop(0.5, '#336a60'); coat.addColorStop(1, '#22493f');
  g.fillStyle = coat; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = 'rgba(15,40,34,.7)'; g.lineWidth = 3;
  for (const y of [116, 134, 152]) { g.beginPath(); g.moveTo(82, y - 2); g.quadraticCurveTo(128, y + 12, 176, y - 2); g.stroke(); }
  g.strokeStyle = 'rgba(160,220,205,.45)'; g.lineWidth = 3;
  for (const y of [108, 126, 144]) { g.beginPath(); g.moveTo(90, y); g.quadraticCurveTo(110, y + 6, 124, y + 6); g.stroke(); }
  // the cream scarf / hood round her neck
  g.fillStyle = '#ece3cc'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.ellipse(128, 96, 38, 13, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // the right arm reaches forward to the middle, where the cane's grip is (the game draws the cane from this hand)
  g.save(); g.translate(176, 100); g.rotate(0.62); g.fillStyle = '#2f6158'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(-13, 0, 26, 64, 12); g.fill(); g.stroke(); g.restore();
  g.fillStyle = '#e8b48e'; g.beginPath(); g.arc(152, 162, 10, 0, Math.PI * 2); g.fill(); g.stroke();
  // curly brown hair: a big springy mass round her shoulders, then curls on top
  const curl = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
  g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.ellipse(128, 74, 48, 42, 0, 0, Math.PI * 2); g.stroke();
  for (const [x, y, r] of [[90, 96, 15], [166, 96, 15], [94, 116, 14], [162, 116, 14], [100, 134, 13], [156, 134, 13], [112, 148, 12], [144, 148, 12], [128, 150, 13], [128, 124, 20]]) {
    g.beginPath(); g.arc(x, y, r + 2, 0, Math.PI * 2); g.fillStyle = INK; g.fill();
  }
  const HAIR = ['#7a3f1d', '#9a5426', '#b8692f', '#d4843f'];
  for (const [x, y, r] of [[90, 96, 15], [166, 96, 15], [94, 116, 14], [162, 116, 14], [100, 134, 13], [156, 134, 13], [112, 148, 12], [144, 148, 12], [128, 150, 13], [128, 124, 20]]) curl(x, y, r, HAIR[1]);
  curl(128, 74, 46, HAIR[1]); curl(128, 104, 34, HAIR[1]);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 120; i++) {
    const x = 92 + rnd() * 72, y = 66 + rnd() * 86; if (Math.abs(x - 128) > 40 - (y - 66) * 0.12) continue;
    g.strokeStyle = HAIR[i % 2 ? 0 : 2]; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 4 + rnd() * 4, rnd() * 6, rnd() * 6 + 3.6); g.stroke();
    if (i % 5 === 0) { g.strokeStyle = HAIR[3]; g.lineWidth = 2; g.beginPath(); g.arc(x - 1, y - 1, 3, 3.6, 5.4); g.stroke(); }
  }
  // the orange knit beanie, ribbed, with a folded cuff (seen from above it fills the top of her head)
  g.beginPath(); g.ellipse(128, 58, 36, 34, 0, Math.PI * 0.98, Math.PI * 2.02); g.lineTo(164, 72); g.quadraticCurveTo(128, 84, 92, 72); g.closePath();
  const hat = g.createRadialGradient(114, 40, 4, 128, 58, 46); hat.addColorStop(0, '#e9774a'); hat.addColorStop(0.6, '#c4532b'); hat.addColorStop(1, '#93381a');
  g.fillStyle = hat; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  g.strokeStyle = 'rgba(110,35,12,.55)'; g.lineWidth = 2.5;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(128 + i * 9, 26 + Math.abs(i) * 3); g.quadraticCurveTo(128 + i * 11, 52, 128 + i * 12, 70); g.stroke(); }
  g.beginPath(); g.moveTo(92, 66); g.quadraticCurveTo(128, 80, 164, 66); g.lineTo(165, 76); g.quadraticCurveTo(128, 92, 91, 76); g.closePath();
  g.fillStyle = '#d4643a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  g.strokeStyle = 'rgba(255,190,150,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(116, 44, 14, 3.5, 4.6); g.stroke();
  g.restore();
}

function drawAlaynaFront(g, W, H, pose) {
  g.save(); const s = Math.min(W, H) / 256; g.scale(s, s);
  const step = pose === 'stepL' ? -1 : pose === 'stepR' ? 1 : 0;
  g.lineJoin = 'round'; g.lineCap = 'round';
  const halo = g.createRadialGradient(128, 128, 30, 128, 128, 126); halo.addColorStop(0, 'rgba(255,250,235,.38)'); halo.addColorStop(1, 'rgba(255,250,235,0)');
  g.fillStyle = halo; g.fillRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(0,0,0,.38)'; g.beginPath(); g.ellipse(140, 222, 50, 15, 0.12, 0, Math.PI * 2); g.fill();
  const leg = (x, len, lift) => {
    g.fillStyle = '#26324a'; g.strokeStyle = INK; g.lineWidth = 4;
    g.beginPath(); g.roundRect(x - 13, 160 - lift, 26, len, 10); g.fill(); g.stroke();
    g.fillStyle = '#3a2418'; g.beginPath(); g.ellipse(x, 160 - lift + len, 15, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  };
  leg(112, 50 + step * 10, step > 0 ? -2 : 0); leg(144, 50 - step * 10, step < 0 ? -2 : 0);
  // the free arm swings with the step
  g.fillStyle = '#2f6158'; g.strokeStyle = INK; g.lineWidth = 4;
  g.save(); g.translate(84, 104); g.rotate(0.18 - step * 0.22);
  g.beginPath(); g.roundRect(-14, 0, 26, 62, 12); g.fill(); g.stroke();
  g.fillStyle = '#e8b48e'; g.beginPath(); g.arc(-1, 64, 9, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  // the puffer coat from the front, zipped up
  g.beginPath(); g.moveTo(84, 100); g.quadraticCurveTo(128, 88, 172, 100); g.lineTo(178, 152); g.quadraticCurveTo(128, 176, 78, 152); g.closePath();
  const coat = g.createLinearGradient(80, 90, 180, 170); coat.addColorStop(0, '#4f8a7f'); coat.addColorStop(0.5, '#336a60'); coat.addColorStop(1, '#22493f');
  g.fillStyle = coat; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = 'rgba(15,40,34,.7)'; g.lineWidth = 3;
  for (const y of [124, 144]) { g.beginPath(); g.moveTo(82, y - 2); g.quadraticCurveTo(128, y + 10, 176, y - 2); g.stroke(); }
  g.strokeStyle = '#1d3d36'; g.lineWidth = 3; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 168); g.stroke();
  // the cane arm reaches forward to the middle (the game draws the cane from this hand)
  g.save(); g.translate(176, 100); g.rotate(0.62); g.fillStyle = '#2f6158'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.roundRect(-13, 0, 26, 64, 12); g.fill(); g.stroke(); g.restore();
  // curly brown hair behind her head and over her shoulders
  const HAIR = ['#7a3f1d', '#9a5426', '#b8692f', '#d4843f'];
  const back = [[128, 84, 50], [88, 104, 18], [168, 104, 18], [86, 124, 15], [170, 124, 15], [92, 140, 12], [164, 140, 12]];
  for (const [x, y, r] of back) { g.fillStyle = INK; g.beginPath(); g.arc(x, y, r + 2.5, 0, Math.PI * 2); g.fill(); }
  for (const [x, y, r] of back) { g.fillStyle = HAIR[1]; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  // the cream scarf under her chin
  g.fillStyle = '#ece3cc'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.ellipse(128, 128, 30, 11, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // her face, warm and lit from the upper left
  const sk = g.createRadialGradient(118, 88, 4, 128, 98, 36); sk.addColorStop(0, '#f6cfaa'); sk.addColorStop(0.7, '#e8b48e'); sk.addColorStop(1, '#d09470');
  g.fillStyle = sk; g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath(); g.ellipse(128, 98, 28, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  // rosy cheeks
  g.fillStyle = 'rgba(232,110,100,.35)'; g.beginPath(); g.arc(111, 108, 6, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(145, 108, 6, 0, Math.PI * 2); g.fill();
  // big brown eyes, as in her self-portrait
  for (const x of [116, 140]) {
    g.fillStyle = '#fffaf2'; g.beginPath(); g.ellipse(x, 98, 8.5, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6b3516'; g.beginPath(); g.arc(x, 98.5, 5.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1c0e06'; g.beginPath(); g.arc(x, 98.5, 2.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x - 1.8, 96.6, 1.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = INK; g.lineWidth = 2.6; g.beginPath(); g.ellipse(x, 98, 8.5, 6, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    g.lineWidth = 3; g.strokeStyle = '#3a1d0c'; g.beginPath(); g.moveTo(x - 8, 89); g.quadraticCurveTo(x, 85, x + 8, 89); g.stroke();
  }
  // nose and a soft smile
  g.strokeStyle = '#a5684a'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(128, 102); g.quadraticCurveTo(131, 108, 126, 110); g.stroke();
  g.fillStyle = '#c9524a'; g.beginPath(); g.moveTo(119, 116); g.quadraticCurveTo(128, 113, 137, 116); g.quadraticCurveTo(128, 123, 119, 116); g.fill();
  g.strokeStyle = '#7d2b26'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(119, 116); g.quadraticCurveTo(128, 119, 137, 116); g.stroke();
  // curls framing her face
  let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (const side of [-1, 1]) for (let i = 0; i < 22; i++) {
    const x = 128 + side * (30 + rnd() * 26), y = 74 + rnd() * 70;
    g.strokeStyle = HAIR[i % 2 ? 0 : 2]; g.lineWidth = 3; g.beginPath(); g.arc(x, y, 4 + rnd() * 4, rnd() * 6, rnd() * 6 + 3.6); g.stroke();
  }
  // the orange knit beanie, pulled down to her eyebrows
  g.save(); g.translate(0, -2);
  g.beginPath(); g.ellipse(128, 62, 34, 32, 0, Math.PI * 0.98, Math.PI * 2.02); g.lineTo(162, 76); g.quadraticCurveTo(128, 86, 94, 76); g.closePath();
  const hat = g.createRadialGradient(114, 44, 4, 128, 62, 44); hat.addColorStop(0, '#e9774a'); hat.addColorStop(0.6, '#c4532b'); hat.addColorStop(1, '#93381a');
  g.fillStyle = hat; g.fill(); g.strokeStyle = INK; g.lineWidth = 5; g.stroke();
  g.strokeStyle = 'rgba(110,35,12,.55)'; g.lineWidth = 2.5;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(128 + i * 8, 32 + Math.abs(i) * 3); g.quadraticCurveTo(128 + i * 10, 56, 128 + i * 11, 72); g.stroke(); }
  g.beginPath(); g.moveTo(94, 70); g.quadraticCurveTo(128, 82, 162, 70); g.lineTo(163, 80); g.quadraticCurveTo(128, 93, 93, 80); g.closePath();
  g.fillStyle = '#d4643a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  g.strokeStyle = 'rgba(255,190,150,.5)'; g.lineWidth = 3; g.beginPath(); g.arc(116, 48, 13, 3.5, 4.6); g.stroke();
  g.restore();
  // the hand on the cane's grip
  g.fillStyle = '#e8b48e'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(152, 162, 10, 0, Math.PI * 2); g.fill(); g.stroke();
  g.restore();
}

/* ───────── the white cane: grip at the top, tip at the bottom (draw it tall, e.g. 64 × 512) ───────── */
export function drawCane(g, W, H, lit = false) {
  g.save(); g.lineCap = 'round';
  const x = W / 2, top = H * 0.03, bot = H * 0.93, w = W * 0.2;
  if (lit) { const q = g.createRadialGradient(x, bot, 2, x, bot, W * 0.5); q.addColorStop(0, 'rgba(255,240,170,.95)'); q.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = q; g.fillRect(0, bot - W * 0.5, W, W); }
  // a dark edge so it reads on the white stripes
  g.strokeStyle = INK; g.lineWidth = w + 6; g.beginPath(); g.moveTo(x, top); g.lineTo(x, bot); g.stroke();
  g.strokeStyle = '#f7f7f2'; g.lineWidth = w; g.beginPath(); g.moveTo(x, top + 4); g.lineTo(x, bot); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = w * 0.3; g.beginPath(); g.moveTo(x - w * 0.18, top + 8); g.lineTo(x - w * 0.18, bot - 6); g.stroke();
  // the red band near the bottom
  g.strokeStyle = '#d8261a'; g.lineWidth = w; g.beginPath(); g.moveTo(x, H * 0.7); g.lineTo(x, H * 0.86); g.stroke();
  // the black rubber grip
  g.strokeStyle = '#1b1b1b'; g.lineWidth = w * 1.25; g.beginPath(); g.moveTo(x, top + 2); g.lineTo(x, H * 0.16); g.stroke();
  g.strokeStyle = '#3a3a3a'; g.lineWidth = 2; for (let y = top + 8; y < H * 0.16; y += 8) { g.beginPath(); g.moveTo(x - w * 0.5, y); g.lineTo(x + w * 0.5, y); g.stroke(); }
  // the rolling ball tip
  g.fillStyle = lit ? '#fff4c0' : '#e6e6e0'; g.strokeStyle = INK; g.lineWidth = 3;
  g.beginPath(); g.arc(x, bot, w * 0.95, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x - w * 0.3, bot - w * 0.3, w * 0.3, 0, Math.PI * 2); g.fill();
  g.restore();
}

/* ───────── the yellow bump-dome pad at the curb (square) ───────── */
export function drawDomes(g, W, H, lit = false) {
  g.save(); const s = Math.min(W, H) / 256; g.scale(s, s);
  if (lit) { const q = g.createRadialGradient(128, 128, 60, 128, 128, 128); q.addColorStop(0, 'rgba(255,236,120,.85)'); q.addColorStop(1, 'rgba(255,236,120,0)'); g.fillStyle = q; g.fillRect(0, 0, 256, 256); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.roundRect(42, 44, 184, 184, 10); g.fill();
  g.fillStyle = lit ? '#ffd83a' : '#e8b800'; g.strokeStyle = INK; g.lineWidth = 5;
  g.beginPath(); g.roundRect(34, 34, 184, 184, 10); g.fill(); g.stroke();
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    const x = 56 + i * 28, y = 56 + j * 28;
    const d = g.createRadialGradient(x - 4, y - 4, 1, x, y, 11);
    d.addColorStop(0, lit ? '#fffbe0' : '#fff3a6'); d.addColorStop(0.55, lit ? '#ffe04a' : '#f2c40a'); d.addColorStop(1, lit ? '#d9a800' : '#b88a00');
    g.fillStyle = d; g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(90,60,0,.55)'; g.lineWidth = 1.5; g.stroke();
  }
  g.restore();
}

/* ───────── the graffiti music notes (painted, with a dark edge and a highlight) ───────── */
export function drawNote(g, W, H, kind = 'eighth', color = NOTE_COLORS[0]) {
  g.save(); const s = Math.min(W, H) / 256; g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  const head = (x, y) => { g.beginPath(); g.ellipse(x, y, 30, 22, -0.45, 0, Math.PI * 2); };
  const paint = (fn, lw) => {   // dark edge, then the colour, then a light streak
    g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = lw + 12; fn(true);
    g.strokeStyle = color; g.fillStyle = color; g.lineWidth = lw; fn(false);
  };
  if (kind === 'clef') {
    const path = () => {
      g.beginPath(); g.moveTo(140, 236); g.quadraticCurveTo(110, 240, 112, 214); g.quadraticCurveTo(116, 196, 134, 204);
      g.lineTo(122, 30); g.quadraticCurveTo(150, 10, 156, 50); g.quadraticCurveTo(160, 90, 96, 140);
      g.quadraticCurveTo(70, 168, 96, 192); g.quadraticCurveTo(132, 214, 168, 184); g.quadraticCurveTo(190, 150, 150, 132); g.quadraticCurveTo(112, 124, 108, 158);
    };
    g.strokeStyle = INK; g.lineWidth = 34; path(); g.stroke();
    g.strokeStyle = color; g.lineWidth = 20; path(); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(126, 44); g.quadraticCurveTo(146, 30, 148, 56); g.stroke();
  } else if (kind === 'beamed') {
    paint((edge) => { head(78, 196); g.fill(); head(184, 176); g.fill();
      g.beginPath(); g.moveTo(102, 186); g.lineTo(102, 58); g.moveTo(208, 166); g.lineTo(208, 40); g.stroke();
      g.beginPath(); g.moveTo(96, 46); g.lineTo(214, 28); g.lineTo(214, 62); g.lineTo(96, 80); g.closePath(); g.fill(); }, 16);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(68, 188, 10, 5, -0.45, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(174, 168, 10, 5, -0.45, 0, Math.PI * 2); g.fill();
  } else {
    const flag = kind === 'eighth';
    paint((edge) => { head(104, 194); g.fill(); g.beginPath(); g.moveTo(130, 184); g.lineTo(130, 36); g.stroke();
      if (flag) { g.beginPath(); g.moveTo(130, 38); g.quadraticCurveTo(150, 80, 196, 96); g.quadraticCurveTo(206, 130, 180, 156); g.stroke(); } }, 16);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(94, 186, 11, 6, -0.45, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

/* ───────── the glow along a stripe (wide and thin: e.g. 256 × 64) ───────── */
export function drawStripeGlow(g, W, H) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,248,215,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const side = g.createLinearGradient(0, 0, W, 0); side.addColorStop(0, 'rgba(0,0,0,1)'); side.addColorStop(0.15, 'rgba(0,0,0,0)'); side.addColorStop(0.85, 'rgba(0,0,0,0)'); side.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = side; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
}

/* ───────── textures (cached) ───────── */
const cache = new Map();
const tex = (key, w, h, fn) => { if (!cache.has(key)) { const t = K.canvasTex(w, h, fn); t._shared = true; cache.set(key, t); } return cache.get(key); };
export const alaynaTex = (pose = 'stand', view = 'back') => tex('al' + pose + view, 256, 256, (g, W, H) => drawAlayna(g, W, H, pose, view));
export const caneTex = (lit = false) => tex('cane' + lit, 64, 512, (g, W, H) => drawCane(g, W, H, lit));
export const domesTex = (lit = false) => tex('dome' + lit, 256, 256, (g, W, H) => drawDomes(g, W, H, lit));
export const noteTex = (kind, color) => tex('n' + kind + color, 256, 256, (g, W, H) => drawNote(g, W, H, kind, color));
export const stripeGlowTex = () => tex('glow', 256, 64, drawStripeGlow);
