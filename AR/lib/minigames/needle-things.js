// MOVE THE NEEDLE: the drawn pieces. A big gauge (a dial with a red needle that ratchets up notch by notch) and
// eight "moments": the everyday things a little more sight lets you see. Bright, bold and drawn in code (no emoji),
// each on a soft dark halo so it reads clearly on the painting's black field.
//   gauge(width) → { group, set(v 0..1), quiver(), tick(t, dt) }
//   moment(id, size) → { group, opacity(v), tick(t, dt) }
//   drawMoment(g, id, S) / drawGaugeFace(g, W, H): the plain 2D drawings (also used for Ben's props sheet)
import * as THREE from 'three';
import * as K from './kit.js';

export const MOMENT_IDS = ['smile', 'bus', 'door', 'coffee', 'drawing', 'page', 'wave', 'sunset'];
const RED = '#ec3013';

/* ───────────────────────── the gauge ───────────────────────── */
export function drawGaugeFace(g, W, H) {
  const cx = W / 2, cy = H - 40, R = W * 0.44;
  // the black body of the gauge, square bottom like the kit's panels
  g.fillStyle = '#000'; g.beginPath(); g.moveTo(cx - R - 26, cy + 30); g.lineTo(cx - R - 26, cy); g.arc(cx, cy, R + 26, Math.PI, 0); g.lineTo(cx + R + 26, cy + 30); g.closePath(); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, R + 20, Math.PI, 0); g.stroke();
  g.fillStyle = RED; g.fillRect(cx - R - 26, cy + 22, (R + 26) * 2, 10);
  // the coloured scale: a thin band from dim to bright, like the painting's marks (dark → red → orange → yellow → white)
  const stops = ['#5a1a10', '#c0281a', '#ec3013', '#f07a1e', '#f5b81f', '#f6e27a', '#ffffff'];
  for (let i = 0; i < 48; i++) {
    const a0 = Math.PI + (i / 48) * Math.PI, a1 = Math.PI + ((i + 1) / 48) * Math.PI + 0.01;
    g.strokeStyle = stops[Math.min(stops.length - 1, Math.floor(i / 48 * stops.length))];
    g.lineWidth = 20; g.beginPath(); g.arc(cx, cy, R - 14, a0, a1); g.stroke();
  }
  // nine notches (0 to 8), big and white
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI, big = i % 2 === 0;
    g.strokeStyle = '#fff'; g.lineWidth = big ? 8 : 5;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - 32), cy + Math.sin(a) * (R - 32)); g.lineTo(cx + Math.cos(a) * (R - (big ? 72 : 60)), cy + Math.sin(a) * (R - (big ? 72 : 60))); g.stroke();
  }
  // the label
  g.fillStyle = '#fff'; g.font = '900 40px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('SIGHT', cx, cy - R * 0.42);
  g.font = '900 26px Archivo, "Arial Black", Arial, sans-serif'; g.fillStyle = '#bbb';
  g.textAlign = 'left'; g.fillText('LESS', cx - R + 84, cy - 14); g.textAlign = 'right'; g.fillText('MORE', cx + R - 84, cy - 14);
}
export function drawNeedle(g, W, H) {
  // a long red needle pointing straight up, its pivot at the bottom centre
  g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.moveTo(W / 2 - 14, H - 24); g.lineTo(W / 2, 6); g.lineTo(W / 2 + 14, H - 24); g.closePath(); g.fill();
  g.fillStyle = RED; g.beginPath(); g.moveTo(W / 2 - 10, H - 24); g.lineTo(W / 2, 10); g.lineTo(W / 2 + 10, H - 24); g.closePath(); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(W / 2, H - 24, 20, 0, Math.PI * 2); g.fill();
  g.fillStyle = RED; g.beginPath(); g.arc(W / 2, H - 24, 10, 0, Math.PI * 2); g.fill();
}
export function gauge(width) {
  const FW = 512, FH = 300, group = new THREE.Group();
  const face = K.plane(K.canvasTex(FW, FH, drawGaugeFace), width, width * FH / FW, { order: 40 });
  group.add(face);
  // the needle pivots where the dial's centre is drawn (40 px up from the bottom of the face)
  const px = width / FW, pivot = new THREE.Group(); pivot.position.set(0, -width * FH / FW / 2 + 40 * px, 0.002); group.add(pivot);
  const NL = 0.44 * FW * 0.92 * px, NW = 64 * px, NH = NL + 24 * px;
  const needle = K.plane(K.canvasTex(64, Math.round(NH / px), drawNeedle), NW, NH, { order: 41 });
  needle.position.set(0, NH / 2 - 24 * px, 0); pivot.add(needle);
  // a soft red glow at the needle's tip that flares when it moves
  const tip = K.sprite(K.glowTex, width * 0.16, { color: '#ff7a4a', additive: true, order: 42, opacity: 0 }); tip.position.set(0, NL, 0.001); pivot.add(tip);
  let shown = 0, target = 0, vel = 0, quiv = 0, flare = 0;
  return {
    group,
    set(v) { target = Math.max(0, Math.min(1, v)); flare = 1; },
    quiver() { quiv = 1; flare = Math.max(flare, 0.5); },
    get value() { return shown; },
    tick(t, dt) {
      // a springy needle: it overshoots a hair and settles, and always trembles a tiny bit, like a real meter
      vel += (target - shown) * 60 * dt; vel *= Math.pow(0.002, dt); shown += vel * dt;
      quiv = Math.max(0, quiv - dt * 2.5); flare = Math.max(0, flare - dt * 1.2);
      const tremble = Math.sin(t * 23) * 0.004 + Math.sin(t * 37) * 0.003 + Math.sin(t * 40) * quiv * 0.06;
      pivot.rotation.z = Math.PI / 2 - Math.PI * (shown + tremble);
      tip.material.opacity = flare * 0.9;
    },
  };
}

/* ───────────────────────── the eight moments ───────────────────────── */
function halo(g, S) {
  const r = g.createRadialGradient(S / 2, S / 2, S * 0.2, S / 2, S / 2, S / 2);
  r.addColorStop(0, 'rgba(0,0,0,.82)'); r.addColorStop(0.75, 'rgba(0,0,0,.6)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, S, S);
}
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.roundRect(x, y, w, h, r); };
function outline(g, w = 6) { g.strokeStyle = '#fff'; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); }

export function drawMoment(g, id, S = 256) {
  halo(g, S);
  g.save(); g.scale(S / 256, S / 256);
  if (id === 'smile') {
    // a friend's smile: a warm face, happy closed eyes, a big grin
    g.fillStyle = '#3a2218'; g.beginPath(); g.arc(128, 116, 76, Math.PI * 0.95, Math.PI * 2.05); g.fill();
    g.fillStyle = '#e9a86a'; g.beginPath(); g.arc(128, 132, 66, 0, Math.PI * 2); g.fill(); outline(g, 5);
    g.fillStyle = '#3a2218'; g.beginPath(); g.ellipse(128, 76, 64, 24, 0, Math.PI, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a160e'; g.lineWidth = 7; g.lineCap = 'round';
    for (const x of [104, 152]) { g.beginPath(); g.arc(x, 124, 12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.fillStyle = 'rgba(236,48,19,.35)'; for (const x of [92, 164]) { g.beginPath(); g.arc(x, 146, 11, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#7a1a10'; g.beginPath(); g.moveTo(98, 148); g.quadraticCurveTo(128, 194, 158, 148); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(102, 150); g.lineTo(154, 150); g.quadraticCurveTo(150, 160, 128, 161); g.quadraticCurveTo(106, 160, 102, 150); g.fill();
  } else if (id === 'bus') {
    // the number on the bus: a bus seen from the front, its big route number lit up
    g.fillStyle = '#f5b81f'; rr(g, 58, 40, 140, 176, 18); g.fill(); outline(g, 5);
    g.fillStyle = '#111'; rr(g, 72, 52, 112, 40, 6); g.fill();
    g.fillStyle = '#ffdc3a'; g.font = '900 38px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('42', 128, 74);
    g.fillStyle = '#7fc8f0'; rr(g, 70, 100, 116, 56, 6); g.fill(); g.strokeStyle = '#2b5876'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#fff'; for (const x of [84, 172]) { g.beginPath(); g.arc(x, 182, 12, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#333'; rr(g, 104, 174, 48, 16, 3); g.fill();
    g.fillStyle = '#111'; for (const x of [70, 164]) rr(g, x, 210, 22, 20, 4), g.fill();
  } else if (id === 'door') {
    // your own front door: a red door with a little window and a warm lamp beside it
    g.fillStyle = '#e8e2d6'; rr(g, 70, 34, 116, 190, 4); g.fill();
    g.fillStyle = RED; rr(g, 82, 46, 92, 178, 3); g.fill(); outline(g, 5);
    g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(128, 78, 18, Math.PI, 0); g.lineTo(146, 92); g.lineTo(110, 92); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4; rr(g, 96, 110, 64, 44, 2); g.stroke(); rr(g, 96, 166, 64, 44, 2); g.stroke();
    g.fillStyle = '#f5b81f'; g.beginPath(); g.arc(160, 140, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#777'; g.fillRect(60, 222, 136, 12);
    const lamp = g.createRadialGradient(205, 80, 2, 205, 80, 30); lamp.addColorStop(0, 'rgba(255,230,140,1)'); lamp.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = lamp; g.beginPath(); g.arc(205, 80, 30, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff3c0'; rr(g, 198, 70, 14, 20, 3); g.fill();
  } else if (id === 'coffee') {
    // the steam on your coffee: a teal mug on a saucer (the steam is drawn on its own so it can rise)
    g.fillStyle = '#ddd'; g.beginPath(); g.ellipse(124, 206, 78, 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a9d9a'; g.beginPath(); g.moveTo(70, 112); g.lineTo(178, 112); g.lineTo(170, 196); g.quadraticCurveTo(124, 212, 78, 196); g.closePath(); g.fill(); outline(g, 5);
    g.strokeStyle = '#2a9d9a'; g.lineWidth = 14; g.beginPath(); g.arc(184, 148, 22, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(184, 148, 31, -Math.PI / 2, Math.PI / 2); g.stroke();
    g.fillStyle = '#4a2a14'; g.beginPath(); g.ellipse(124, 114, 54, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(112, 150); g.bezierCurveTo(100, 136, 122, 128, 124, 142); g.bezierCurveTo(126, 128, 148, 136, 136, 150); g.lineTo(124, 164); g.closePath(); g.fill();
  } else if (id === 'steam') {
    g.restore(); g.clearRect(0, 0, S, S); g.save(); g.scale(S / 256, S / 256);
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 8; g.lineCap = 'round';
    for (const x of [100, 128, 156]) { g.beginPath(); g.moveTo(x, 220); g.bezierCurveTo(x - 18, 180, x + 18, 150, x, 110); g.bezierCurveTo(x - 14, 80, x + 10, 60, x, 36); g.stroke(); }
  } else if (id === 'drawing') {
    // your child's drawing: a crayon picture of a sun, a house and two people holding hands
    g.save(); g.translate(128, 132); g.rotate(-0.08);
    g.fillStyle = '#fffdf4'; g.fillRect(-92, -84, 184, 168); g.strokeStyle = '#fff'; g.lineWidth = 4; g.strokeRect(-92, -84, 184, 168);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.fillStyle = '#f5b81f'; g.beginPath(); g.arc(-56, -48, 18, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f5b81f'; g.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(-56 + Math.cos(a) * 24, -48 + Math.sin(a) * 24); g.lineTo(-56 + Math.cos(a) * 34, -48 + Math.sin(a) * 34); g.stroke(); }
    g.strokeStyle = '#1f4fd8'; g.lineWidth = 6; g.strokeRect(20, -18, 52, 46); g.strokeStyle = RED; g.beginPath(); g.moveTo(12, -16); g.lineTo(46, -52); g.lineTo(80, -16); g.stroke();
    g.strokeStyle = '#2a9d58'; g.lineWidth = 6; g.beginPath(); g.moveTo(-88, 62); g.quadraticCurveTo(0, 52, 88, 64); g.stroke();
    g.strokeStyle = '#7a3ab0'; g.lineWidth = 5;
    for (const [x, hr] of [[-58, 12], [-24, 9]]) { g.beginPath(); g.arc(x, 0, hr, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(x, hr); g.lineTo(x, hr + 30); g.moveTo(x, hr + 30); g.lineTo(x - 10, hr + 48); g.moveTo(x, hr + 30); g.lineTo(x + 10, hr + 48); g.stroke(); }
    g.beginPath(); g.moveTo(-58, 26); g.lineTo(-24, 24); g.stroke();
    g.restore();
  } else if (id === 'page') {
    // the words on a page: an open book with big, clear lines of text
    g.fillStyle = '#7a3ab0'; g.beginPath(); g.moveTo(26, 70); g.lineTo(128, 82); g.lineTo(230, 70); g.lineTo(230, 200); g.lineTo(128, 212); g.lineTo(26, 200); g.closePath(); g.fill();
    g.fillStyle = '#fffdf4';
    g.beginPath(); g.moveTo(34, 62); g.quadraticCurveTo(84, 56, 126, 74); g.lineTo(126, 202); g.quadraticCurveTo(84, 186, 34, 192); g.closePath(); g.fill(); outline(g, 4);
    g.beginPath(); g.moveTo(222, 62); g.quadraticCurveTo(172, 56, 130, 74); g.lineTo(130, 202); g.quadraticCurveTo(172, 186, 222, 192); g.closePath(); g.fill(); outline(g, 4);
    g.fillStyle = '#111'; g.font = '900 30px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'left'; g.fillText('Hello', 46, 98);
    g.strokeStyle = '#333'; g.lineWidth = 7; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(46, 122 + i * 18); g.lineTo(46 + [66, 54, 70, 40][i], 122 + i * 18); g.stroke(); }
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(142, 92 + i * 18); g.lineTo(142 + [66, 58, 70, 50, 64, 30][i], 92 + i * 18); g.stroke(); }
  } else if (id === 'wave') {
    // a wave from across the street: a friend in a bright coat, waving (the arm is drawn on its own so it can wave)
    g.fillStyle = '#1f4fd8'; g.beginPath(); g.moveTo(84, 226); g.quadraticCurveTo(84, 130, 128, 126); g.quadraticCurveTo(172, 130, 172, 226); g.closePath(); g.fill(); outline(g, 5);
    g.fillStyle = '#c98a5a'; g.beginPath(); g.arc(128, 96, 32, 0, Math.PI * 2); g.fill(); outline(g, 5);
    g.fillStyle = '#2a160e'; g.beginPath(); g.arc(128, 88, 33, Math.PI * 1.05, Math.PI * 1.95); g.fill();
    g.strokeStyle = '#2a160e'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(128, 102, 13, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = '#f5b81f'; g.fillRect(100, 140, 56, 10);
  } else if (id === 'arm') {
    g.restore(); g.clearRect(0, 0, S, S); g.save(); g.scale(S / 256, S / 256);
    // an arm pointing up from the bottom centre (the shoulder), with an open hand
    g.strokeStyle = '#1f4fd8'; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(128, 236); g.lineTo(128, 120); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.moveTo(115, 236); g.lineTo(115, 120); g.moveTo(141, 236); g.lineTo(141, 120); g.stroke();
    g.fillStyle = '#c98a5a'; g.beginPath(); g.ellipse(128, 92, 22, 28, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#c98a5a'; g.lineWidth = 10;
    for (const [dx, h] of [[-14, 30], [-5, 38], [5, 38], [14, 32]]) { g.beginPath(); g.moveTo(128 + dx, 80); g.lineTo(128 + dx * 1.3, 80 - h); g.stroke(); }
    g.beginPath(); g.moveTo(108, 98); g.lineTo(92, 82); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5;
    for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(128, 70, 56 + i * 16, -Math.PI / 2 + s * 0.6 - 0.25, -Math.PI / 2 + s * 0.6 + 0.25); g.stroke(); }
  } else if (id === 'sunset') {
    // the colours of the sunset: a big sun sinking into warm bands over the water
    g.save(); g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.clip();
    const sky = g.createLinearGradient(0, 24, 0, 150); sky.addColorStop(0, '#5a2a8a'); sky.addColorStop(0.45, '#ec3013'); sky.addColorStop(1, '#f5b81f'); g.fillStyle = sky; g.fillRect(0, 0, 256, 150);
    g.fillStyle = '#ffe36a'; g.beginPath(); g.arc(128, 150, 50, Math.PI, 0); g.fill();
    g.fillStyle = '#1b2f6a'; g.fillRect(0, 150, 256, 110);
    g.fillStyle = '#f5b81f'; for (let i = 0; i < 5; i++) g.fillRect(128 - 44 + i * 6, 162 + i * 16, 88 - i * 12, 7);
    g.restore();
    g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.stroke();
  }
  g.restore();
}

const texCache = new Map();
const momentTex = id => { if (!texCache.has(id)) texCache.set(id, K.canvasTex(256, 256, (g, W) => drawMoment(g, id, W))); return texCache.get(id); };

export function moment(id, size) {
  const group = new THREE.Group(), parts = [];
  const add = (key, s, x, y, order = 31) => { const sp = K.sprite(momentTex(key), s, { order, opacity: 0 }); sp.position.set(x, y, 0); group.add(sp); parts.push(sp); return sp; };
  const body = add(id, size, 0, 0);
  let tick = () => {};
  if (id === 'coffee') {
    const steam = add('steam', size * 0.6, -size * 0.02, size * 0.48, 32);
    tick = t => { steam.position.y = size * (0.46 + ((t * 0.25) % 1) * 0.08); steam.material.rotation = Math.sin(t * 1.3) * 0.08; steam.userData.k = 0.55 + 0.45 * Math.sin(t * 2.1); };
  } else if (id === 'wave') {
    // the arm sits at the friend's right shoulder and waves back and forth
    // (the arm's shoulder is the bottom centre of its picture; it turns around that point)
    const arm = add('arm', size * 0.62, 0, 0, 30), SX = size * 0.15, SY = -size * 0.05, L = size * 0.62 * 0.42;
    tick = t => { const a = Math.sin(t * 5) * 0.35 - 0.3; arm.material.rotation = a; arm.position.set(SX - Math.sin(a) * L, SY + Math.cos(a) * L, 0); };
  } else if (id === 'smile') {
    tick = t => { body.scale.set(size, size * (1 + Math.max(0, Math.sin(t * 1.7)) * 0.03), 1); };
  } else if (id === 'bus') {
    tick = t => { body.position.y = Math.abs(Math.sin(t * 6)) * size * 0.012; };
  } else if (id === 'door') {
    tick = t => { body.material.rotation = Math.sin(t * 0.9) * 0.015; };
  } else if (id === 'drawing') {
    tick = t => { body.material.rotation = Math.sin(t * 0.8) * 0.05; };
  } else if (id === 'page') {
    tick = t => { body.scale.set(size * (1 + Math.sin(t * 1.2) * 0.02), size, 1); };
  } else if (id === 'sunset') {
    tick = t => { body.material.rotation = Math.sin(t * 0.5) * 0.02; body.scale.setScalar(size * (1 + Math.sin(t * 1.1) * 0.015)); };
  }
  let op = 0;
  return {
    group,
    opacity(v) { op = v; },
    tick(t, dt) {
      tick(t, dt);
      group.position.y = (group.userData.y || 0) + Math.sin(t * 1.4 + (group.userData.ph || 0)) * size * 0.03;   // every moment bobs gently
      for (const p of parts) { const k = p.userData.k == null ? 1 : p.userData.k; p.material.opacity = op * k; }
    },
  };
}
