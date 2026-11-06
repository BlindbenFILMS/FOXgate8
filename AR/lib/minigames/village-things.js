// FIND YOUR VILLAGE (Steven McCoy): the drawn props.
// Drawn in code, lit like the painting: little glowing people floating in from the golden sky, and YOUR light,
// the crystal orb lifted straight out of the painting's face.
//   thingCanvas(kind, size) → a square canvas: 'guitar' | 'painter' | 'dancer' | 'flower' | 'cane' | 'magnet' | 'sparkle'
//   orbCanvas(img, size)    → the painting's own crystal orb cut out in a circle, with a golden rim (img = the painting)
// Each person has their own face, skin tone and hair, a glowing outfit in their colour, and the thing they bring.
// Used by village-magnet.js. No emoji, no image files.

export const PEOPLE = [
  { kind: 'guitar', col: ['#ffe08a', '#ff9a3c'], skin: '#8d5a3b', hair: '#1e120c' },    // a friend with a guitar
  { kind: 'painter', col: ['#9fe8ff', '#3c8dff'], skin: '#f1c7a5', hair: '#c4521e' },   // a painter with a brush
  { kind: 'dancer', col: ['#ffb3d9', '#ff4f9a'], skin: '#c68a5e', hair: '#2b1810' },    // a dancer, arms up
  { kind: 'flower', col: ['#c9ffa8', '#3fcf6a'], skin: '#e8b48c', hair: '#e8c35a' },    // someone bringing a flower
  { kind: 'cane', col: ['#e6c8ff', '#9a5cff'], skin: '#5c3a24', hair: '#d9d4cc' },      // a blind friend with a white cane
];
// where the orb sits in the 1024 × 1024 painting (u, v, radius as a share of the width)
export const ORB = { u: 0.335, v: 0.445, r: 0.056 };
const TAU = Math.PI * 2;
const INK = '#2a1640';

function aura(g, S, c1) {
  const gr = g.createRadialGradient(S / 2, S * 0.52, 0, S / 2, S * 0.52, S * 0.5);
  gr.addColorStop(0, c1 + 'dd'); gr.addColorStop(0.4, c1 + '55'); gr.addColorStop(1, c1 + '00');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  // a few tiny sparkles floating round them
  const s = S / 256;
  for (const [x, y, r] of [[40, 70, 3], [214, 120, 2.5], [56, 190, 2], [200, 200, 3], [30, 130, 2]]) { g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(x * s, y * s, r * s, 0, TAU); g.fill(); }
}

// an arm from shoulder to hand (in board-pixel coordinates of a 256 canvas), with a round hand
function arm(g, s, P, [x0, y0], [x1, y1]) {
  g.lineCap = 'round';
  g.strokeStyle = '#fff'; g.lineWidth = 20 * s; g.beginPath(); g.moveTo(x0 * s, y0 * s); g.lineTo(x1 * s, y1 * s); g.stroke();
  g.strokeStyle = P.col[1]; g.lineWidth = 12 * s; g.beginPath(); g.moveTo(x0 * s, y0 * s); g.lineTo(x1 * s, y1 * s); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(x1 * s, y1 * s, 9 * s, 0, TAU); g.fill();
  g.fillStyle = P.skin; g.beginPath(); g.arc(x1 * s, y1 * s, 6.5 * s, 0, TAU); g.fill();
}

// a person: dangling legs, a glowing outfit with a rim of light, a head with their own face and hair
function person(g, S, P, arms, { hair, glasses = false, front } = {}) {
  const cx = S / 2, s = S / 256;
  g.lineJoin = 'round';
  // legs and little shoes, dangling as they float
  for (const dx of [-12, 12]) {
    g.strokeStyle = '#fff'; g.lineWidth = 15 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo((cx / s + dx) * s, 192 * s); g.lineTo((cx / s + dx * 1.15) * s, 220 * s); g.stroke();
    g.strokeStyle = '#3b2a4a'; g.lineWidth = 9 * s; g.beginPath(); g.moveTo((cx / s + dx) * s, 192 * s); g.lineTo((cx / s + dx * 1.15) * s, 220 * s); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse((cx / s + dx * 1.2) * s, 224 * s, 10 * s, 7 * s, 0, 0, TAU); g.fill();
    g.fillStyle = P.col[1]; g.beginPath(); g.ellipse((cx / s + dx * 1.2) * s, 224 * s, 7.5 * s, 5 * s, 0, 0, TAU); g.fill();
  }
  for (const a of arms) if (!a.front) arm(g, s, P, a.from, a.to);
  // the outfit: a bell shape, light at the top, deeper at the hem, with a rim light on the right
  const body = () => { g.beginPath(); g.moveTo(cx - 36 * s, 198 * s); g.bezierCurveTo(cx - 38 * s, 150 * s, cx - 30 * s, 118 * s, cx, 114 * s); g.bezierCurveTo(cx + 30 * s, 118 * s, cx + 38 * s, 150 * s, cx + 36 * s, 198 * s); g.quadraticCurveTo(cx, 208 * s, cx - 36 * s, 198 * s); g.closePath(); };
  body(); g.lineWidth = 9 * s; g.strokeStyle = '#fff'; g.stroke();
  const fill = g.createLinearGradient(0, 112 * s, 0, 204 * s); fill.addColorStop(0, P.col[0]); fill.addColorStop(1, P.col[1]);
  body(); g.fillStyle = fill; g.fill();
  g.save(); body(); g.clip();
  const rim = g.createLinearGradient(cx - 36 * s, 0, cx + 36 * s, 0); rim.addColorStop(0, 'rgba(40,10,60,.25)'); rim.addColorStop(0.55, 'rgba(255,255,255,0)'); rim.addColorStop(0.85, 'rgba(255,255,255,.15)'); rim.addColorStop(1, 'rgba(255,255,255,.6)');
  g.fillStyle = rim; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(cx - 34 * s, 190 * s); g.quadraticCurveTo(cx, 198 * s, cx + 34 * s, 190 * s); g.stroke();   // a stitched hem
  g.restore();
  // neck and head
  g.fillStyle = P.skin; g.fillRect(cx - 6 * s, 104 * s, 12 * s, 14 * s);
  g.beginPath(); g.arc(cx, 84 * s, 25 * s, 0, TAU); g.lineWidth = 8 * s; g.strokeStyle = '#fff'; g.stroke();
  if (hair && hair.back) hair.back(g, s, cx);
  const face = g.createRadialGradient(cx - 8 * s, 76 * s, 2 * s, cx, 84 * s, 26 * s); face.addColorStop(0, shade(P.skin, 0.25)); face.addColorStop(1, P.skin);
  g.beginPath(); g.arc(cx, 84 * s, 24 * s, 0, TAU); g.fillStyle = face; g.fill();
  if (hair && hair.front) hair.front(g, s, cx);
  // the face: eyes with a sparkle (or dark glasses), rosy cheeks, a big smile
  if (glasses) {
    g.fillStyle = '#140c20'; g.beginPath(); g.ellipse(cx - 9 * s, 85 * s, 9 * s, 6.5 * s, 0, 0, TAU); g.ellipse(cx + 9 * s, 85 * s, 9 * s, 6.5 * s, 0, 0, TAU); g.fill();
    g.fillRect(cx - 2 * s, 83 * s, 4 * s, 3 * s);
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(cx - 12 * s, 83 * s, 3 * s, 1.6 * s, -0.4, 0, TAU); g.ellipse(cx + 6 * s, 83 * s, 3 * s, 1.6 * s, -0.4, 0, TAU); g.fill();
  } else {
    g.fillStyle = INK; g.beginPath(); g.ellipse(cx - 8.5 * s, 85 * s, 3.4 * s, 4.2 * s, 0, 0, TAU); g.ellipse(cx + 8.5 * s, 85 * s, 3.4 * s, 4.2 * s, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(cx - 7.3 * s, 83.5 * s, 1.3 * s, 0, TAU); g.arc(cx + 9.7 * s, 83.5 * s, 1.3 * s, 0, TAU); g.fill();
  }
  g.fillStyle = 'rgba(255,110,120,.45)'; g.beginPath(); g.ellipse(cx - 15 * s, 93 * s, 4.5 * s, 3 * s, 0, 0, TAU); g.ellipse(cx + 15 * s, 93 * s, 4.5 * s, 3 * s, 0, 0, TAU); g.fill();
  g.strokeStyle = INK; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.arc(cx, 92 * s, 7 * s, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  if (front) front(g, s, cx);
  for (const a of arms) if (a.front) arm(g, s, P, a.from, a.to);
}
// a lighter (k > 0) or darker (k < 0) version of a #rrggbb colour
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k))));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
}

function guitar(g, S) {
  const P = PEOPLE[0], s = S / 256; aura(g, S, P.col[0]);
  // big curly hair
  const hair = { back: (g, s, cx) => { g.fillStyle = P.hair; for (let i = 0; i < 11; i++) { const a = Math.PI * (0.9 + i * 0.12); g.beginPath(); g.arc(cx + Math.cos(a) * 24 * s, 80 * s + Math.sin(a) * 24 * s, 11 * s, 0, TAU); g.fill(); } } };
  person(g, S, P, [{ from: [104, 136], to: [102, 168], front: true }, { from: [152, 136], to: [150, 164], front: true }], { hair,
    front: (g, s) => {
      // the guitar across the body, a warm wooden body with a sound hole and strings
      g.save(); g.translate(124 * s, 166 * s); g.rotate(-0.5);
      g.fillStyle = '#fff'; g.fillRect(0, -6 * s, 74 * s, 12 * s);
      g.fillStyle = '#5a2c0c'; g.fillRect(2 * s, -4 * s, 70 * s, 8 * s);
      g.fillStyle = '#fff'; g.fillRect(68 * s, -9 * s, 16 * s, 18 * s); g.fillStyle = '#3a1a06'; g.fillRect(70 * s, -7 * s, 12 * s, 14 * s);
      const wood = g.createRadialGradient(-16 * s, -6 * s, 2 * s, -10 * s, 0, 28 * s); wood.addColorStop(0, '#f0a24c'); wood.addColorStop(1, '#a8541a');
      g.beginPath(); g.ellipse(-12 * s, 0, 25 * s, 20 * s, 0, 0, TAU); g.fillStyle = wood; g.fill(); g.lineWidth = 5 * s; g.strokeStyle = '#fff'; g.stroke();
      g.fillStyle = '#2a1204'; g.beginPath(); g.arc(-6 * s, 0, 6.5 * s, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,240,200,.85)'; g.lineWidth = 1 * s; for (const y of [-2.5, 0, 2.5]) { g.beginPath(); g.moveTo(-26 * s, y * s); g.lineTo(80 * s, y * s); g.stroke(); }
      g.restore();
    } });
  // notes floating up
  g.fillStyle = '#fff';
  for (const [x, y] of [[190, 70], [210, 42]]) { g.beginPath(); g.ellipse(x * s, y * s, 8 * s, 6 * s, -0.4, 0, TAU); g.fill(); g.fillRect((x + 6) * s, (y - 28) * s, 3 * s, 28 * s); g.fillRect((x + 6) * s, (y - 28) * s, 11 * s, 4 * s); }
}
function painter(g, S) {
  const P = PEOPLE[1], s = S / 256; aura(g, S, P.col[0]);
  // a red beret over a ginger bob
  const hair = {
    back: (g, s, cx) => { g.fillStyle = P.hair; g.beginPath(); g.ellipse(cx, 88 * s, 28 * s, 26 * s, 0, 0, TAU); g.fill(); },
    front: (g, s, cx) => { g.fillStyle = P.hair; g.beginPath(); g.ellipse(cx - 6 * s, 66 * s, 20 * s, 8 * s, -0.15, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(cx + 4 * s, 58 * s, 27 * s, 10 * s, -0.2, 0, TAU); g.fill();
      g.fillStyle = '#e0302a'; g.beginPath(); g.ellipse(cx + 4 * s, 58 * s, 24 * s, 8 * s, -0.2, 0, TAU); g.fill(); g.beginPath(); g.arc(cx + 12 * s, 48 * s, 3.5 * s, 0, TAU); g.fill(); },
  };
  person(g, S, P, [{ from: [104, 138], to: [92, 172] }, { from: [152, 136], to: [186, 106] }], { hair });
  // the brush held up high, dripping gold paint
  g.lineCap = 'round';
  g.strokeStyle = '#fff'; g.lineWidth = 10 * s; g.beginPath(); g.moveTo(184 * s, 112 * s); g.lineTo(214 * s, 60 * s); g.stroke();
  g.strokeStyle = '#8a5a2b'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(184 * s, 112 * s); g.lineTo(208 * s, 70 * s); g.stroke();
  g.strokeStyle = '#c0c0c8'; g.lineWidth = 6 * s; g.beginPath(); g.moveTo(208 * s, 70 * s); g.lineTo(212 * s, 63 * s); g.stroke();
  g.fillStyle = '#ffcf3a'; g.beginPath(); g.ellipse(216 * s, 54 * s, 7 * s, 11 * s, 0.5, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(224 * s, 70 * s, 3 * s, 4.5 * s, 0, 0, TAU); g.fill();
  // a palette in the other hand
  g.fillStyle = '#f2e3c4'; g.strokeStyle = '#fff'; g.lineWidth = 4 * s; g.beginPath(); g.ellipse(80 * s, 182 * s, 27 * s, 17 * s, -0.2, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#d8c39a'; g.beginPath(); g.arc(92 * s, 188 * s, 4 * s, 0, TAU); g.fill();
  [['#ff3d5a', 66, 178], ['#3fa8ff', 78, 172], ['#ffd84a', 90, 176], ['#3fcf6a', 70, 190]].forEach(([c, x, y]) => { g.fillStyle = c; g.beginPath(); g.arc(x * s, y * s, 5 * s, 0, TAU); g.fill(); });
}
function dancer(g, S) {
  const P = PEOPLE[2], s = S / 256; aura(g, S, P.col[0]);
  // a high ponytail that swings out to the side
  const hair = {
    back: (g, s, cx) => { g.fillStyle = P.hair; g.beginPath(); g.moveTo(cx + 14 * s, 62 * s); g.quadraticCurveTo(cx + 52 * s, 50 * s, cx + 46 * s, 96 * s); g.quadraticCurveTo(cx + 34 * s, 70 * s, cx + 10 * s, 70 * s); g.fill(); },
    front: (g, s, cx) => { g.fillStyle = P.hair; g.beginPath(); g.arc(cx, 82 * s, 25 * s, Math.PI * 1.05, Math.PI * 1.95); g.quadraticCurveTo(cx, 70 * s, cx - 24 * s, 80 * s); g.fill();
      g.fillStyle = P.col[1]; g.beginPath(); g.arc(cx + 15 * s, 62 * s, 4.5 * s, 0, TAU); g.fill(); },
  };
  person(g, S, P, [{ from: [106, 132], to: [70, 72] }, { from: [150, 132], to: [186, 72] }], { hair });
  // a ribbon twirling from one hand
  g.strokeStyle = '#fff'; g.lineWidth = 7 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(186 * s, 70 * s); g.bezierCurveTo(220 * s, 40 * s, 200 * s, 110 * s, 232 * s, 96 * s); g.stroke();
  g.strokeStyle = P.col[1]; g.lineWidth = 4 * s; g.beginPath(); g.moveTo(186 * s, 70 * s); g.bezierCurveTo(220 * s, 40 * s, 200 * s, 110 * s, 232 * s, 96 * s); g.stroke();
  g.fillStyle = '#fff'; for (const [x, y] of [[58, 60], [48, 92], [208, 48]]) { g.beginPath(); g.arc(x * s, y * s, 4 * s, 0, TAU); g.fill(); }
}
function flower(g, S) {
  const P = PEOPLE[3], s = S / 256; aura(g, S, P.col[0]);
  // short wavy blond hair
  const hair = { front: (g, s, cx) => { g.fillStyle = P.hair; g.beginPath(); g.arc(cx, 82 * s, 26 * s, Math.PI * 1.0, Math.PI * 2.0);
    for (let i = 0; i <= 5; i++) g.lineTo(cx + 26 * s - i * 10.4 * s, (74 + (i % 2) * 6) * s); g.closePath(); g.fill(); } };
  person(g, S, P, [{ from: [104, 140], to: [94, 172] }, { from: [152, 138], to: [178, 120] }], { hair });
  // a flower held out to you
  g.lineCap = 'round';
  g.strokeStyle = '#fff'; g.lineWidth = 9 * s; g.beginPath(); g.moveTo(178 * s, 122 * s); g.lineTo(190 * s, 82 * s); g.stroke();
  g.strokeStyle = '#2f9a48'; g.lineWidth = 5 * s; g.beginPath(); g.moveTo(178 * s, 122 * s); g.lineTo(190 * s, 82 * s); g.stroke();
  g.fillStyle = '#3fcf6a'; g.beginPath(); g.ellipse(176 * s, 102 * s, 9 * s, 4.5 * s, 0.6, 0, TAU); g.fill();
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; g.fillStyle = '#ff6fae'; g.strokeStyle = '#fff'; g.lineWidth = 3 * s; g.beginPath(); g.ellipse((190 + Math.cos(a) * 13) * s, (70 + Math.sin(a) * 13) * s, 10 * s, 6.5 * s, a, 0, TAU); g.fill(); g.stroke(); }
  const ctr = g.createRadialGradient(188 * s, 68 * s, 0, 190 * s, 70 * s, 8 * s); ctr.addColorStop(0, '#fff3a0'); ctr.addColorStop(1, '#e8a020');
  g.fillStyle = ctr; g.beginPath(); g.arc(190 * s, 70 * s, 7.5 * s, 0, TAU); g.fill();
}
function cane(g, S) {
  const P = PEOPLE[4], s = S / 256; aura(g, S, P.col[0]);
  // short silver hair and a neat beard
  const hair = { front: (g, s, cx) => {
    g.fillStyle = P.hair; g.beginPath(); g.arc(cx, 82 * s, 25.5 * s, Math.PI * 1.08, Math.PI * 1.92); g.quadraticCurveTo(cx, 66 * s, cx - 24 * s, 76 * s); g.fill();
    g.beginPath(); g.moveTo(cx - 20 * s, 92 * s); g.quadraticCurveTo(cx, 116 * s, cx + 20 * s, 92 * s); g.quadraticCurveTo(cx, 102 * s, cx - 20 * s, 92 * s); g.fill(); } };
  person(g, S, P, [{ from: [104, 140], to: [96, 174] }, { from: [152, 140], to: [170, 160], front: true }], { hair, glasses: true });
  // the long white cane with its red band and tip, reaching forward and down
  g.lineCap = 'round';
  g.strokeStyle = INK; g.lineWidth = 9 * s; g.beginPath(); g.moveTo(168 * s, 156 * s); g.lineTo(216 * s, 240 * s); g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = 5.5 * s; g.beginPath(); g.moveTo(168 * s, 156 * s); g.lineTo(204 * s, 219 * s); g.stroke();
  g.strokeStyle = '#ec3013'; g.beginPath(); g.moveTo(204 * s, 219 * s); g.lineTo(214 * s, 237 * s); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 6 * s; g.beginPath(); g.moveTo(166 * s, 152 * s); g.lineTo(170 * s, 159 * s); g.stroke();   // the grip
  // a little tap ripple where the tip touches
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2.5 * s; for (const r of [7, 13]) { g.beginPath(); g.arc(216 * s, 242 * s, r * s, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
}
function magnet(g, S) {
  // the pull around your orb: bright golden rings, with little arrows drawing inward
  const c = S / 2;
  const gl = g.createRadialGradient(c, c, S * 0.22, c, c, S * 0.5); gl.addColorStop(0, 'rgba(255,220,130,.55)'); gl.addColorStop(0.6, 'rgba(255,205,100,.2)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,224,140,${0.95 - i * 0.25})`; g.lineWidth = S * (0.018 - i * 0.004); g.beginPath(); g.arc(c, c, S * (0.3 + i * 0.06), 0, TAU); g.stroke(); }
  g.fillStyle = 'rgba(255,240,190,.95)';
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU + Math.PI / 8, r = S * 0.43;
    g.save(); g.translate(c + Math.cos(a) * r, c + Math.sin(a) * r); g.rotate(a + Math.PI);
    g.beginPath(); g.moveTo(S * 0.035, 0); g.lineTo(-S * 0.015, -S * 0.025); g.lineTo(-S * 0.005, 0); g.lineTo(-S * 0.015, S * 0.025); g.closePath(); g.fill();
    g.restore();
  }
}
function sparkle(g, S) {
  const c = S / 2;
  const gl = g.createRadialGradient(c, c, 0, c, c, S * 0.5); gl.addColorStop(0, 'rgba(255,250,220,1)'); gl.addColorStop(0.2, 'rgba(255,220,140,.6)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
  g.fillStyle = gl; g.fillRect(0, 0, S, S);
  g.fillStyle = '#fff'; g.beginPath();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? S * 0.09 : S * 0.42; g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); }
  g.closePath(); g.fill();
}

const DRAW = { guitar, painter, dancer, flower, cane, magnet, sparkle };
export function thingCanvas(kind, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  (DRAW[kind] || sparkle)(c.getContext('2d'), size); return c;
}
export function orbCanvas(img, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height, R = ORB.r * W;
  const halo = g.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size / 2);
  halo.addColorStop(0, 'rgba(255,225,140,.9)'); halo.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = halo; g.fillRect(0, 0, size, size);
  g.save(); g.beginPath(); g.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2); g.clip();
  g.drawImage(img, ORB.u * W - R, ORB.v * H - R, R * 2, R * 2, size / 2 - size * 0.34, size / 2 - size * 0.34, size * 0.68, size * 0.68);
  // glass: a curved highlight on the upper left and a warm glow round the bottom edge
  const sh = g.createRadialGradient(size * 0.4, size * 0.38, 0, size / 2, size / 2, size * 0.34); sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,200,90,.3)');
  g.fillStyle = sh; g.fillRect(0, 0, size, size);
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = size * 0.022; g.lineCap = 'round'; g.beginPath(); g.arc(size / 2, size / 2, size * 0.27, Math.PI * 1.08, Math.PI * 1.42); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(size * 0.37, size * 0.33, size * 0.018, 0, Math.PI * 2); g.fill();
  g.restore();
  g.strokeStyle = '#ffd66e'; g.lineWidth = size * 0.03; g.beginPath(); g.arc(size / 2, size / 2, size * 0.34, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = size * 0.01; g.beginPath(); g.arc(size / 2, size / 2, size * 0.355, 0, Math.PI * 2); g.stroke();
  return c;
}
