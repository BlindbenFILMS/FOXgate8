// THE MIRROR: the eight pieces of who you are, each a glowing icon on a shard of the mirror (drawn in code).
//   drawPiece(g, W, word)  draws one piece into a square canvas of size W (designed at 256)
//   pieceTex(word)         a ready THREE texture (made once per word)
// The shard reflects the painting's sky; the icon is drawn in warm light on top of it, with a dark edge so it reads small.
import * as THREE from 'three';

const TAU = Math.PI * 2;
const GOLD = '#ffd66e', INK = '#2a1c08';

// a jagged shard of mirror glass, a little different for each piece
const SHARDS = {
  'Curious': [[128, 6], [214, 50], [246, 150], [186, 246], [70, 236], [12, 140], [48, 44]],
  'Kind': [[96, 8], [226, 30], [248, 140], [210, 238], [96, 248], [10, 186], [26, 60]],
  'Creative': [[140, 4], [236, 76], [228, 196], [150, 250], [36, 220], [8, 108], [62, 26]],
  'Brave': [[118, 4], [222, 40], [250, 128], [216, 232], [118, 252], [22, 214], [6, 96]],
  'Funny': [[60, 14], [190, 6], [250, 110], [224, 220], [120, 252], [16, 206], [6, 98]],
  'Patient': [[128, 2], [220, 64], [244, 176], [168, 250], [64, 240], [8, 160], [30, 48]],
  'Loved': [[86, 6], [204, 20], [252, 124], [204, 230], [96, 252], [6, 180], [20, 66]],
  'Still me': [[128, 0], [234, 58], [252, 158], [196, 248], [64, 250], [4, 166], [26, 54]],
};

function shard(g, word) {
  const base = SHARDS[word] || SHARDS['Curious'], pts = [];
  base.forEach((a, i) => { const b = base[(i + 1) % base.length], k = 0.35 + ((i * 37 + word.length * 13) % 30) / 100, inn = 10 + ((i * 53 + word.length * 7) % 22);
    const mx = a[0] + (b[0] - a[0]) * k, my = a[1] + (b[1] - a[1]) * k, dx = 128 - mx, dy = 128 - my, L = Math.hypot(dx, dy) || 1;
    pts.push(a); if ((i + word.length) % 3 === 0) pts.push([mx + dx / L * inn * 0.6, my + dy / L * inn * 0.6]); });
  g.save();
  g.beginPath(); pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y)); g.closePath();
  // the sky in the glass
  const sky = g.createLinearGradient(30, 0, 220, 256); sky.addColorStop(0, '#4f86b8'); sky.addColorStop(0.5, '#9cc6e6'); sky.addColorStop(1, '#5f8fbd');
  g.shadowColor = 'rgba(200,230,255,.9)'; g.shadowBlur = 18; g.fillStyle = sky; g.fill(); g.shadowBlur = 0;
  g.clip();
  // a soft cloud and a bright streak of reflection
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(70, 190, 90, 30, -0.2, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.moveTo(20, 80); g.lineTo(90, 0); g.lineTo(120, 0); g.lineTo(40, 110); g.closePath(); g.fill();
  // darken the middle a touch so the icon stands out
  const mid = g.createRadialGradient(128, 128, 10, 128, 128, 120); mid.addColorStop(0, 'rgba(20,40,70,.55)'); mid.addColorStop(1, 'rgba(20,40,70,0)');
  g.fillStyle = mid; g.fillRect(0, 0, 256, 256);
  g.restore();
  // the glass edge
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y)); g.closePath();
  g.lineJoin = 'miter'; g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.stroke();
  g.strokeStyle = 'rgba(70,110,150,.9)'; g.lineWidth = 2; g.stroke(); g.restore();
}

// draw a path twice: a dark edge, then the light, so it reads at any size
function ink(g, path, w = 14) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = w + 8; path(); g.stroke();
  g.shadowColor = 'rgba(255,214,110,.9)'; g.shadowBlur = 14; g.strokeStyle = GOLD; g.lineWidth = w; path(); g.stroke();
  g.restore();
}
function fillInk(g, path, color = GOLD) {
  g.save(); g.lineJoin = 'round';
  g.strokeStyle = INK; g.lineWidth = 8; path(); g.stroke();
  g.shadowColor = 'rgba(255,214,110,.9)'; g.shadowBlur = 14; g.fillStyle = color; path(); g.fill();
  g.restore();
}
const heartPath = (g, x, y, s) => () => { g.beginPath(); g.moveTo(x, y + s * 0.9); g.bezierCurveTo(x - s * 1.4, y - s * 0.1, x - s * 0.7, y - s * 1.2, x, y - s * 0.45); g.bezierCurveTo(x + s * 0.7, y - s * 1.2, x + s * 1.4, y - s * 0.1, x, y + s * 0.9); g.closePath(); };

const ICONS = {
  // a magnifying glass, with a little spark inside
  'Curious'(g) {
    ink(g, () => { g.beginPath(); g.arc(112, 108, 52, 0, TAU); });
    ink(g, () => { g.beginPath(); g.moveTo(150, 146); g.lineTo(200, 198); }, 22);
    fillInk(g, () => { g.beginPath(); g.moveTo(112, 80); g.lineTo(120, 100); g.lineTo(140, 108); g.lineTo(120, 116); g.lineTo(112, 136); g.lineTo(104, 116); g.lineTo(84, 108); g.lineTo(104, 100); g.closePath(); }, '#fff4cf');
  },
  // a cupped hand holding a heart
  'Kind'(g) {
    fillInk(g, heartPath(g, 128, 96, 38), '#ff8a7a');
    fillInk(g, () => { g.beginPath(); g.moveTo(42, 150); g.quadraticCurveTo(52, 214, 128, 216); g.quadraticCurveTo(204, 214, 214, 150);
      g.quadraticCurveTo(204, 142, 196, 152); g.quadraticCurveTo(188, 140, 178, 152); g.quadraticCurveTo(168, 140, 158, 152); g.quadraticCurveTo(148, 142, 140, 154);
      g.lineTo(78, 154); g.quadraticCurveTo(70, 120, 54, 126); g.quadraticCurveTo(40, 132, 42, 150); g.closePath(); });
    ink(g, () => { g.beginPath(); g.moveTo(80, 176); g.quadraticCurveTo(128, 194, 176, 176); }, 5);
  },
  // a paintbrush with a swirl of paint
  'Creative'(g) {
    ink(g, () => { g.beginPath(); g.moveTo(54, 196); g.bezierCurveTo(80, 120, 150, 210, 186, 130); }, 12);
    fillInk(g, () => { g.beginPath(); g.arc(70, 176, 18, 0, TAU); }, '#ff8a5a');
    fillInk(g, () => { g.beginPath(); g.arc(110, 186, 14, 0, TAU); }, '#7cc8f5');
    g.save(); g.translate(150, 100); g.rotate(0.75);
    fillInk(g, () => { g.beginPath(); g.rect(-12, -78, 24, 92); });
    fillInk(g, () => { g.beginPath(); g.rect(-15, 12, 30, 18); }, '#dfe6ee');
    fillInk(g, () => { g.beginPath(); g.moveTo(-15, 30); g.quadraticCurveTo(-18, 66, 0, 84); g.quadraticCurveTo(18, 66, 15, 30); g.closePath(); }, '#ff8a5a');
    g.restore();
  },
  // a shield with a star
  'Brave'(g) {
    fillInk(g, () => { g.beginPath(); g.moveTo(128, 34); g.quadraticCurveTo(180, 56, 210, 52); g.quadraticCurveTo(214, 164, 128, 224); g.quadraticCurveTo(42, 164, 46, 52); g.quadraticCurveTo(76, 56, 128, 34); g.closePath(); });
    g.save(); g.fillStyle = '#c0392b'; g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 22 : 50; g.lineTo(128 + Math.cos(a) * r, 120 + Math.sin(a) * r); } g.closePath(); g.fill();
    g.strokeStyle = INK; g.lineWidth = 5; g.lineJoin = 'round'; g.stroke(); g.restore();
  },
  // a laughing face
  'Funny'(g) {
    fillInk(g, () => { g.beginPath(); g.arc(128, 128, 88, 0, TAU); });
    g.save(); g.strokeStyle = INK; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.moveTo(80, 104); g.quadraticCurveTo(96, 84, 112, 104); g.moveTo(144, 104); g.quadraticCurveTo(160, 84, 176, 104); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.moveTo(74, 136); g.quadraticCurveTo(128, 136, 182, 136); g.quadraticCurveTo(170, 206, 128, 206); g.quadraticCurveTo(86, 206, 74, 136); g.closePath(); g.fill();
    g.fillStyle = '#ff8a7a'; g.beginPath(); g.ellipse(128, 186, 26, 14, 0, 0, TAU); g.fill();
    g.fillStyle = '#9fd8ff'; g.beginPath(); g.moveTo(190, 112); g.quadraticCurveTo(204, 132, 196, 142); g.quadraticCurveTo(182, 142, 186, 124); g.closePath(); g.fill();
    g.restore();
  },
  // an hourglass
  'Patient'(g) {
    ink(g, () => { g.beginPath(); g.moveTo(72, 40); g.lineTo(184, 40); g.moveTo(72, 216); g.lineTo(184, 216); }, 16);
    ink(g, () => { g.beginPath(); g.moveTo(88, 46); g.bezierCurveTo(88, 110, 124, 112, 124, 128); g.bezierCurveTo(124, 144, 88, 146, 88, 210); g.moveTo(168, 46); g.bezierCurveTo(168, 110, 132, 112, 132, 128); g.bezierCurveTo(132, 144, 168, 146, 168, 210); }, 10);
    g.save(); g.fillStyle = '#ffe9a8';
    g.beginPath(); g.moveTo(102, 86); g.lineTo(154, 86); g.quadraticCurveTo(140, 110, 128, 120); g.quadraticCurveTo(116, 110, 102, 86); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(96, 204); g.quadraticCurveTo(128, 160, 160, 204); g.closePath(); g.fill();
    g.fillRect(126, 120, 4, 60); g.restore();
  },
  // two hearts
  'Loved'(g) {
    fillInk(g, heartPath(g, 102, 132, 44), '#ff7a8a');
    fillInk(g, heartPath(g, 160, 112, 38), '#ffb0a0');
  },
  // a face with glasses, like both men in the painting
  'Still me'(g) {
    fillInk(g, () => { g.beginPath(); g.ellipse(128, 132, 68, 86, 0, 0, TAU); });
    g.save(); g.fillStyle = '#b07a3a'; g.strokeStyle = INK; g.lineWidth = 6;
    g.beginPath(); g.moveTo(62, 112); g.bezierCurveTo(56, 40, 196, 30, 196, 104); g.bezierCurveTo(170, 74, 120, 64, 62, 112); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 7; g.strokeStyle = INK;
    g.beginPath(); g.arc(102, 128, 20, 0, TAU); g.moveTo(174, 128); g.arc(154, 128, 20, 0, TAU); g.moveTo(122, 128); g.lineTo(134, 128); g.stroke();
    g.fillStyle = 'rgba(160,210,255,.5)'; g.beginPath(); g.arc(102, 128, 17, 0, TAU); g.arc(154, 128, 17, 0, TAU); g.fill();
    g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 146); g.lineTo(122, 170); g.lineTo(132, 172); g.moveTo(106, 188); g.quadraticCurveTo(128, 202, 150, 188); g.stroke();
    g.restore();
  },
};

export const WORDS = Object.keys(ICONS);

export function drawPiece(g, W, word, opts = {}) {
  g.save(); g.scale(W / 256, W / 256);
  if (!opts.bare) shard(g, word);
  g.translate(128, 128); g.scale(opts.bare ? 0.95 : 0.78, opts.bare ? 0.95 : 0.78); g.translate(-128, -128);
  (ICONS[word] || ICONS['Curious'])(g);
  g.restore();
}

const cache = {};
export function pieceTex(word, opts = {}) {
  const key = word + (opts.bare ? ':bare' : '');
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas'); c.width = c.height = 256; drawPiece(c.getContext('2d'), 256, word, opts);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (cache[key] = t);
}
