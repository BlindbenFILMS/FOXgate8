// ARCADE CABINET (Ben: "fine tune the cabinets themselves"): the one light-gun cabinet model every arcade uses (Meru Lanes now).
// Tuned in Arcade Cabinet Workshop.dc.html → localStorage 'arcade.cabinet' (falls back to CAB_DEFAULTS). Measurements are in cabinet
// units before `size` scales the whole thing (1 unit ≈ 1 m at size 1). Front = local −x. Built into a roomkit Bin (merged draws).
export const CAB_KEY = 'arcade.cabinet';
export const CAB_DEFAULTS = {
  size: 1.34,                       // overall scale (Ben: 2x, then 33 % smaller)
  width: 0.94, height: 1.9, depth: 0.82,   // between the side panels, side panel height, side panel depth
  lean: 0,                          // degrees the top leans back
  screenW: 0.7, screenH: 0.52, screenY: 1.42, screenTilt: 0, bezel: 0.04,
  panelY: 1.0, panelDepth: 0.36, panelTilt: 14, gun: true,
  marqueeH: 0.3, marqueeY: 2.0, marqueeOut: 0.0,
  kick: true, trim: true, sideStripe: true, glowEdge: false, screenAnim: true,
};
export const CAB_RANGES = [
  ['size', 'Overall size', 0.8, 2.2, 0.02], ['width', 'Width', 0.7, 1.3, 0.01], ['height', 'Height', 1.5, 2.4, 0.01], ['depth', 'Depth', 0.6, 1.2, 0.01], ['lean', 'Top leans back °', 0, 12, 1],
  ['screenW', 'Screen width', 0.4, 1.0, 0.01], ['screenH', 'Screen height', 0.3, 0.8, 0.01], ['screenY', 'Screen height from floor', 1.1, 1.8, 0.01], ['screenTilt', 'Screen tilt °', 0, 25, 1], ['bezel', 'Screen frame', 0, 0.1, 0.005],
  ['panelY', 'Control panel height', 0.8, 1.2, 0.01], ['panelDepth', 'Control panel depth', 0.2, 0.6, 0.01], ['panelTilt', 'Control panel tilt °', 0, 35, 1],
  ['marqueeH', 'Sign height', 0.18, 0.5, 0.01], ['marqueeY', 'Sign from floor', 1.7, 2.4, 0.01], ['marqueeOut', 'Sign sticks out', 0, 0.2, 0.01],
];
export const CAB_TOGGLES = [['screenAnim', 'Screen animation'], ['gun', 'Controls (guns / joysticks)'], ['kick', 'Kick plate'], ['trim', 'Gold edge trim'], ['sideStripe', 'Side stripe'], ['glowEdge', 'Neon edges']];
export function loadCab() { try { const s = JSON.parse(localStorage.getItem(CAB_KEY) || 'null'); if (s && typeof s === 'object') return { ...CAB_DEFAULTS, ...s }; } catch (e) {} return { ...CAB_DEFAULTS }; }
export function saveCab(cfg) { localStorage.setItem(CAB_KEY, JSON.stringify(cfg)); }
// how far the cabinet's back is behind its centre spot (layout x, z = the centre)
export const cabBackOffset = c => (c.depth / 2 + 0.09) * c.size;

// the game skins: body colour, accent, screen + marquee art, the page it opens
export const ARCADE_GAMES = [
  { name: 'MARSH BLASTER', ctrl: 'gun', body: '#2b1a4a', acc: '#ffd23a', url: 'Marsh%20Blaster.dc.html?embed=1', marsh: true, mq: ['#2b1a4a', '#ffd23a'] },
  { name: 'HUMAN COMBAT', body: '#3b0a0a', acc: '#ec3013', url: 'Kyoto%20Sword%20Duel.dc.html?embed=1', scr: ['#1a0606', '#7a1d2a', '#ec3013'], mq: ['#201e1d', '#ec3013'] },
  { name: 'TANK RANGE', body: '#3f4a1e', acc: '#a3e635', url: 'Tank%20Range.dc.html?embed=1', scr: ['#141a08', '#3f4a1e', '#a3e635'], mq: ['#3f4a1e', '#ffffff'] },
  { name: 'SUBMARINE', body: '#0c3a5a', acc: '#38bdf8', url: 'Jidda%20Submarine.dc.html?embed=1', scr: ['#020c1a', '#0c3a5a', '#38bdf8'], mq: ['#0c3a5a', '#ffd23a'] },
  { name: 'SURF', body: '#0e7490', acc: '#fde047', url: 'Jidda%20Surf.dc.html?embed=1', scr: ['#38bdf8', '#0e7490', '#fde047'], mq: ['#0e7490', '#ffffff'] },
  { name: 'DUSTY GULCH', ctrl: 'gun', body: '#5a3a1e', acc: '#e6b45a', url: 'g/dusty-gulch/index.html?embed=1', scr: ['#f4b860', '#c2662d', '#5a3a1e'], mq: ['#3a2410', '#e6b45a'] },
];
export function gameSkins(CT) {
  const marq = (txt, bg, fg) => CT(256, 64, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; fitTxt(g, txt, '900', 30, w - 24); g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(txt, w / 2, 34); });   // s101 Ben: game names centred + all white
  const scrOf = (a, b2, c2, txt) => CT(256, 192, (g, w, h) => { const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, a); q.addColorStop(0.6, b2); q.addColorStop(1, c2); g.fillStyle = q; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; fitTxt(g, txt, '900', 26, w - 32); g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(txt, w / 2, 40); g.textAlign = 'left'; g.fillStyle = '#ffffff'; g.font = '800 15px Archivo, sans-serif'; g.fillText('INSERT COIN', 16, h - 22); });
  const marsh = () => CT(256, 192, (g, w, h) => { const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, '#2a1b5e'); q.addColorStop(0.55, '#ff7a3d'); q.addColorStop(1, '#ffd23a'); g.fillStyle = q; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(180, 110, 26, 0, 7); g.fill(); g.fillStyle = '#1f3d22'; g.fillRect(0, 150, w, 42); g.strokeStyle = '#2f5a2f'; g.lineWidth = 3; for (let x = 4; x < w; x += 9) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 4, 128 + (x * 7) % 22); g.stroke(); }
    g.fillStyle = '#201e1d'; for (const [x, y, k] of [[60, 60, 1], [120, 40, 0.8], [200, 70, 0.9]]) { g.beginPath(); g.moveTo(x - 16 * k, y); g.quadraticCurveTo(x - 6 * k, y - 12 * k, x, y); g.quadraticCurveTo(x + 6 * k, y - 12 * k, x + 16 * k, y); g.lineTo(x, y + 4 * k); g.fill(); }
    g.strokeStyle = '#ec3013'; g.lineWidth = 3; g.beginPath(); g.arc(120, 96, 16, 0, 7); g.stroke(); g.fillRect(118, 74, 4, 10); g.fillRect(118, 108, 4, 10); });
  return ARCADE_GAMES.map(G => { const scrT = G.marsh ? marsh() : scrOf(...G.scr, G.name), cv = scrT.image, g = cv.getContext('2d');
    return { ...G, scrT, mqT: marq(G.name, ...G.mq), anim: t => { ATTRACT[G.name](g, cv.width, cv.height, t, G); scrT.needsUpdate = true; } }; });
}
// ATTRACT MODE: a short looping demo on each screen (redrawn ~10x a second by the room's tick, only while you are near)
const bgGrad = (g, w, h, a, b, c) => { const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, a); q.addColorStop(0.6, b); q.addColorStop(1, c); g.fillStyle = q; g.fillRect(0, 0, w, h); };
const fitTxt = (g, txt, wt, px, max) => { let f = px; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (f > 10 && g.measureText(txt).width > max) { f -= 1; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } };   // s101 Ben: labels shrink to fit (never squashed or cut)
const title = (g, txt, col, t) => { g.fillStyle = '#ffffff'; fitTxt(g, txt, '900', 26, 224); g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(txt, g.canvas.width / 2, 30); g.textAlign = 'left'; };   // s101 Ben: centred + white
const coin = (g, h, t) => { if (Math.floor(t * 1.6) % 2) return; g.fillStyle = '#ffffff'; g.font = '800 15px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText('INSERT COIN', 16, h - 18); };
const scan = (g, w, h, t) => { g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, (t * 60) % h, w, 10); };
const ATTRACT = {
  'MARSH BLASTER': (g, w, h, t) => { bgGrad(g, w, h, '#2a1b5e', '#ff7a3d', '#ffd23a'); g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(190, 112, 24, 0, 7); g.fill();
    g.fillStyle = '#1f3d22'; g.fillRect(0, 150, w, 42); g.strokeStyle = '#2f5a2f'; g.lineWidth = 3; for (let x = 4; x < w; x += 9) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 4 + Math.sin(t * 2 + x) * 2, 128 + (x * 7) % 22); g.stroke(); }
    g.fillStyle = '#201e1d'; for (let i = 0; i < 3; i++) { const x = ((t * 46 + i * 100) % 320) - 30, y = 50 + i * 22 + Math.sin(t * 3 + i) * 8, k = 0.9, f = Math.sin(t * 14 + i) * 7; g.beginPath(); g.moveTo(x - 16 * k, y - f); g.quadraticCurveTo(x - 6, y - 10, x, y); g.quadraticCurveTo(x + 6, y - 10, x + 16 * k, y - f); g.lineTo(x, y + 4); g.fill(); }
    const cx = 128 + Math.sin(t * 0.9) * 70, cy = 80 + Math.sin(t * 1.4) * 30; g.strokeStyle = '#ec3013'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 14, 0, 7); g.stroke(); g.fillStyle = '#ec3013'; g.fillRect(cx - 2, cy - 22, 4, 9); g.fillRect(cx - 2, cy + 13, 4, 9);
    title(g, 'MARSH BLASTER', '#ffffff', t); coin(g, h, t); scan(g, w, h, t); },
  'HUMAN COMBAT': (g, w, h, t, G) => { bgGrad(g, w, h, ...G.scr); g.fillStyle = '#201e1d'; g.fillRect(0, 150, w, 42);
    const fig = (x, dir, ph) => { const lunge = Math.max(0, Math.sin(t * 3 + ph)) * 14 * dir; g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(x + lunge, 92, 9, 0, 7); g.fill(); g.fillRect(x - 4 + lunge, 102, 8, 30); g.fillRect(x - 10 + lunge, 132, 6, 18); g.fillRect(x + 4 + lunge, 132, 6, 18);
      g.strokeStyle = '#ffd23a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + lunge, 110); g.lineTo(x + lunge + dir * 34, 92 - Math.sin(t * 3 + ph) * 16); g.stroke(); };
    fig(86, 1, 0); fig(170, -1, Math.PI); if (Math.floor(t * 2) % 2) { g.fillStyle = '#ffd23a'; g.font = '900 30px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('VS', 128, 70); g.textAlign = 'left'; }
    title(g, 'HUMAN COMBAT', '#ffffff', t); coin(g, h, t); scan(g, w, h, t); },
  'TANK RANGE': (g, w, h, t, G) => { bgGrad(g, w, h, ...G.scr); const cx = 128, cy = 104, R = 54; g.strokeStyle = 'rgba(163,230,53,0.5)'; g.lineWidth = 2; for (const r of [18, 36, 54]) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
    const a = t * 2; g.fillStyle = 'rgba(163,230,53,0.35)'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a - 0.6, a); g.closePath(); g.fill();
    for (let i = 0; i < 4; i++) { const ba = i * 1.7 + 0.4, d = Math.abs(Math.atan2(Math.sin(a - ba), Math.cos(a - ba))), al = Math.max(0, 1 - d / 2.5); g.fillStyle = 'rgba(236,48,19,' + al + ')'; g.beginPath(); g.arc(cx + Math.cos(ba) * (20 + i * 9), cy + Math.sin(ba) * (20 + i * 9), 4, 0, 7); g.fill(); }
    title(g, 'TANK RANGE', '#ffffff', t); coin(g, h, t); scan(g, w, h, t); },
  'SUBMARINE': (g, w, h, t, G) => { bgGrad(g, w, h, ...G.scr); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 12; i++) { const x = (i * 37) % w, y = h - ((t * 30 + i * 41) % (h + 20)); g.beginPath(); g.arc(x + Math.sin(t * 2 + i) * 4, y, 2 + i % 3, 0, 7); g.fill(); }
    const sx = 60 + Math.sin(t * 0.6) * 30, sy = 110 + Math.sin(t * 1.2) * 6; g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(sx, sy, 34, 12, 0, 0, 7); g.fill(); g.fillRect(sx - 6, sy - 22, 14, 12); g.fillStyle = '#0c3a5a'; g.beginPath(); g.arc(sx + 16, sy, 4, 0, 7); g.fill();
    const pr = (t * 50) % 90; g.strokeStyle = 'rgba(56,189,248,' + (1 - pr / 90) + ')'; g.lineWidth = 2; g.beginPath(); g.arc(190, 110, pr, 0, 7); g.stroke();
    title(g, 'SUBMARINE', '#ffffff', t); coin(g, h, t); scan(g, w, h, t); },
  'SURF': (g, w, h, t) => { bgGrad(g, w, h, '#7dd3fc', '#38bdf8', '#0e7490'); g.fillStyle = '#fde047'; g.beginPath(); g.arc(206, 62, 18, 0, 7); g.fill();
    g.fillStyle = '#0e7490'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 8) g.lineTo(x, 120 + Math.sin(x * 0.04 + t * 3) * 12); g.lineTo(w, h); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; for (let x = 0; x <= w; x += 16) g.fillRect(x, 118 + Math.sin(x * 0.04 + t * 3) * 12, 8, 3);
    const px = 100 + Math.sin(t * 0.8) * 50, py = 112 + Math.sin(px * 0.04 + t * 3) * 12; g.fillStyle = '#ec3013'; g.save(); g.translate(px, py); g.rotate(Math.cos(px * 0.04 + t * 3) * 0.4); g.fillRect(-18, -2, 36, 5); g.fillStyle = '#201e1d'; g.fillRect(-3, -22, 6, 20); g.beginPath(); g.arc(0, -26, 5, 0, 7); g.fill(); g.restore();
    title(g, 'SURF', '#ffffff', t); coin(g, h, t); scan(g, w, h, t); },
  'DUSTY GULCH': (g, w, h, t) => { bgGrad(g, w, h, '#f4b860', '#e08a3c', '#c2662d'); g.fillStyle = '#fff1c8'; g.beginPath(); g.arc(190, 80, 22, 0, 7); g.fill(); g.fillStyle = '#5a3a1e'; g.fillRect(0, 148, w, 44);
    g.fillStyle = '#3f6b2a'; for (const x of [40, 220]) { g.fillRect(x, 112, 8, 36); g.fillRect(x - 10, 122, 6, 16); g.fillRect(x - 10, 122, 12, 5); g.fillRect(x + 12, 116, 6, 14); g.fillRect(x + 6, 126, 12, 5); }
    const up = Math.max(0, Math.sin(t * 1.8)), oy = 148 - up * 42; g.fillStyle = '#201e1d'; g.fillRect(118, oy, 20, 42); g.beginPath(); g.arc(128, oy - 6, 9, 0, 7); g.fill(); g.fillRect(114, oy - 15, 28, 4); g.fillRect(120, oy - 22, 16, 8);
    const bx = 76, by = 140 - Math.abs(Math.sin(t * 4)) * 4; g.fillStyle = '#7cd36b'; g.fillRect(bx, by - 18, 8, 18); g.fillRect(bx + 2, by - 24, 4, 7);
    title(g, 'DUSTY GULCH', '#201e1d', t); coin(g, h, t); scan(g, w, h, t); },
};

// build one cabinet. b = roomkit Bin (call b.build yourself), wallPlane = roomkit helper, G = group for the screen/sign planes,
// box(x0, x1, z0, z1) = collider callback. (x, z) = middle of the BACK, ry = facing (0 = faces −x). Returns the [x, z] to stand at.
export function buildCabinet({ b, wallPlane, G, box = () => {} }, cfg, x, z, ry, skin) {
  const C = { ...CAB_DEFAULTS, ...cfg }, s = C.size, P = skin.body, Gd = skin.acc, D = C.depth, hw = C.width / 2, H = C.height;
  const c = Math.cos(ry), sn = Math.sin(ry), at = (lx, lz) => [x + (lx * c + lz * sn) * s, z + (-lx * sn + lz * c) * s];
  const bx = (k, col, w, h, d, lx, y, lz, rz = 0) => { const [wx, wz] = at(lx, lz); b.box(k, col, w * s, h * s, d * s, wx, y * s, wz, ry, 0, rz); };
  const back = -0.09, fr = back - D;                    // local x of the back face and the front edge of the sides
  const lean = C.lean * Math.PI / 180, lx = y => Math.max(0, y - C.panelY) * Math.tan(lean);   // above the control panel, the front steps back with the lean
  const midX = (back + fr) / 2;
  // side panels (+ gold top trim, stripe, neon edge)
  for (const q of [-hw, hw]) { bx('mat', P, D, H, 0.06, midX, H / 2, q);
    if (C.trim) bx('gls', Gd, D + 0.02, 0.04, 0.065, midX, H, q);
    if (C.sideStripe) bx('glo', Gd, D * 0.8, 0.06, 0.065, midX + 0.02, H * 0.42, q, 0.35);
    if (C.glowEdge) bx('glo', Gd, 0.03, H, 0.07, fr + 0.015, H / 2, q); }
  const inW = C.width - 0.06;
  // lower body (coin door + slots), kick plate
  bx('mat', P, D - 0.12, C.panelY - 0.05, inW, midX + 0.04, (C.panelY - 0.05) / 2, 0);
  bx('mat', '#120c1e', 0.02, 0.24, 0.34, fr + 0.09, 0.55, 0); bx('glo', '#ff3030', 0.02, 0.09, 0.04, fr + 0.075, 0.57, -0.07); bx('glo', '#ff3030', 0.02, 0.09, 0.04, fr + 0.075, 0.57, 0.07);
  if (C.kick) bx('gls', '#201e1d', 0.03, 0.14, inW, fr + 0.09, 0.07, 0);
  // upper body behind the screen
  const upH = C.marqueeY - C.marqueeH / 2 - C.panelY, upY = C.panelY + upH / 2;
  bx('mat', P, D * 0.6, upH, inW, back - D * 0.3 - lx(upY) * 0.2, upY, 0);
  // control panel
  bx('gls', Gd, C.panelDepth, 0.08, inW, fr + 0.16 - C.panelDepth / 2 + 0.18, C.panelY, 0, C.panelTilt * Math.PI / 180);
  // CONTROLS for two players: light-gun games get two guns (P1 orange, P2 blue); the rest get a joystick + 3 buttons per side
  if (C.gun) { const th = C.panelTilt * Math.PI / 180, pcx = fr + 0.34 - C.panelDepth / 2, topY = dx => C.panelY + 0.04 * Math.cos(th) + dx * Math.sin(th), atX = dx => pcx + dx * Math.cos(th);
    const cy = (k, col, r, h, lx, y, lz) => { const [wx, wz] = at(lx, lz); b.cyl(k, col, r * s, h * s, wx, y * s, wz, 10); }, sp = (k, col, r, lx, y, lz) => { const [wx, wz] = at(lx, lz); b.sph(k, col, r * s, wx, y * s, wz, 1, 8); };
    if (skin.ctrl === 'gun') for (const [q, col] of [[-0.22, '#f97316'], [0.22, '#38bdf8']]) { const gx = fr + 0.05; bx('mat', col, 0.3, 0.07, 0.07, gx, C.panelY + 0.1, q); bx('mat', col, 0.07, 0.12, 0.06, gx + 0.1, C.panelY + 0.04, q); bx('mat', '#201e1d', 0.06, 0.06, 0.05, gx - 0.13, C.panelY + 0.11, q); bx('mat', '#201e1d', 0.03, 0.05, 0.03, gx + 0.06, C.panelY + 0.05, q); }
    else for (const sd of [-1, 1]) { const ball = sd < 0 ? '#ec3013' : '#38bdf8', dx = -0.04, y = topY(dx), x = atX(dx);
      cy('mat', '#120c1e', 0.035, 0.016, x, y + 0.008, sd * 0.31); cy('gls', '#c0c4cc', 0.008, 0.07, x, y + 0.045, sd * 0.31); sp('gls', ball, 0.026, x, y + 0.085, sd * 0.31);
      [['#ec3013', 0.2, -0.01], ['#ffd23a', 0.13, -0.03], ['#38bdf8', 0.06, -0.01]].forEach(([bc, lz, ddx]) => { const yy = topY(dx + ddx), xx = atX(dx + ddx); cy('mat', '#120c1e', 0.024, 0.012, xx, yy + 0.006, sd * lz); cy('glo', bc, 0.019, 0.022, xx, yy + 0.016, sd * lz); });
      cy('glo', '#f3f2f2', 0.012, 0.016, atX(dx + 0.09), topY(dx + 0.09) + 0.008, sd * 0.36); } }
  // marquee box
  bx('mat', P, D * 0.73 + C.marqueeOut, C.marqueeH, inW + 0.02, back - (D * 0.73 + C.marqueeOut) / 2 - lx(C.marqueeY), C.marqueeY, 0);
  // screen (with a frame) + marquee art
  const sxL = fr + D * 0.35 + lx(C.screenY), tilt = C.screenTilt * Math.PI / 180;
  if (C.bezel > 0) bx('mat', '#120c1e', 0.02, C.screenH + C.bezel * 2, C.screenW + C.bezel * 2, sxL + 0.012, C.screenY, 0, -tilt);
  let [wx, wz] = at(sxL, 0); const sc = wallPlane(G, skin.scrT, C.screenW * s, C.screenH * s, wx, C.screenY * s, wz, ry - Math.PI / 2, true); sc.rotation.order = 'YXZ'; sc.rotation.x = -tilt;
  [wx, wz] = at(back - (D * 0.73 + C.marqueeOut) - lx(C.marqueeY) - 0.006, 0); wallPlane(G, skin.mqT, inW * s, C.marqueeH * 0.74 * s, wx, C.marqueeY * s, wz, ry - Math.PI / 2, true);
  // collider + stand spot
  const pts = [at(back, -hw), at(back, hw), at(fr - 0.2, -hw), at(fr - 0.2, hw)];
  box(Math.min(...pts.map(p => p[0])) - 0.05, Math.max(...pts.map(p => p[0])) + 0.05, Math.min(...pts.map(p => p[1])) - 0.05, Math.max(...pts.map(p => p[1])) + 0.05);
  const r = at(fr - 0.7, 0); r.screen = sc; return r;   // s100: the screen mesh (cabinet menus draw on it)
}
