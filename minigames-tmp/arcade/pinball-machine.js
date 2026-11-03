// 8 GATES — ARCADE · PINBALL machine [arcadePinball]. The table layout (shared by physics + art) and the 3D cabinet.
//   tableLayout()            → walls, bumpers, flippers, targets, sensors, lamps in table units (9 wide + 1 plunger lane, 20 long)
//   buildMachine(ctx, opts)  → the whole cabinet (playfield, toys, lamps with glow, backbox with art + dot-matrix display, coin door)
//   pinballProp(ctx, opts)   → the same machine as a world prop: attract-mode lights + DMD, and a spot to stand to play. For any
//                              world interior (Meru tavern, a casino, Deep Space Fox …). Pair it with pinball-embed.js to open the game.
// ctx = { THREE, toon, M, addOutline?, grad?, renderer?, touch? } — the same shape every 8 GATES world module already has.
import { canvasTex, FONT } from '../../engine/textures.js';

export const TW = 10, TH = 20, BR = 0.27;
export const FL = { len: 1.4, r0: 0.26, r1: 0.12, rest: -0.56, up: 0.5, upSpd: 30, dnSpd: 15, e: 0.32 };
export const S = 0.068, SLOPE = 0.11;   // table units → machine metres, playfield tilt (6.3°)

export function makeGradient(THREE) { const d = new Uint8Array([110, 110, 110, 255, 185, 185, 185, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
export function mergeGeos(THREE, list) {
  let n = 0; const parts = list.map(({ geo, m }) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(m); n += g.attributes.position.count; return g; });
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; g.dispose(); }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return out;
}

export function tableLayout() {
  const segs = [], add = (ax, ay, bx, by, o = {}) => { const s = { ax, ay, bx, by, r: o.r ?? 0.07, e: o.e ?? 0.45, k: o.k || 'wall', id: o.id ?? 0, one: !!o.one, on: true, vis: o.vis !== false, h: o.h ?? 0.55, kick: !!o.kick, rub: !!o.rub }; if (s.one) { const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy); s.nx = -dy / L; s.ny = dx / L; } segs.push(s); return s; };
  const poly = (pts, o) => { for (let i = 0; i < pts.length - 1; i++) add(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], o); };
  const arc = (cx, cy, r, a0, a1, step = 7.5) => { const p = [], n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / step)); for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
  const mx = p => p.map(([x, y]) => [9 - x, y]);
  poly([[0, -2], [0, 15], ...arc(5, 15, 5, 180, 0).slice(1), [10, -2]], { k: 'outer', h: 0.7 });
  add(9, 0.55, 9, 14.2, { k: 'lane', h: 0.6 }); add(9, 0.55, 10, 0.55, { k: 'floor', vis: false });
  add(9, 14.2, 10, 14.95, { k: 'gate', one: true, r: 0.05, h: 0.3, e: 0.2 });
  poly([[1.55, 10.15], [0.95, 10.85], ...arc(5, 15, 4.05, 180, 146)], { k: 'orbit' });
  poly([[7.45, 10.15], [8.05, 10.85], ...arc(5, 15, 2.95, 0, 40)], { k: 'orbit' });
  for (const x of [2.6, 3.9, 5.1, 6.4]) add(x, 16.45, x, 17.35, { k: 'post', r: 0.12, h: 0.45, e: 0.55, rub: true });
  poly([[0.95, 5.6], [0.95, 3.9], [2.85, 2.3]], { k: 'guide' }); poly(mx([[0.95, 5.6], [0.95, 3.9], [2.85, 2.3]]), { k: 'guide' });
  const sl = [[1.75, 5.3], [1.75, 4.35], [2.65, 3.8]];
  for (const [i, P] of [[0, sl], [1, mx(sl)]]) { add(P[0][0], P[0][1], P[2][0], P[2][1], { k: 'sling', id: i, kick: true, e: 0.6, rub: true, h: 0.45 }); add(P[0][0], P[0][1], P[1][0], P[1][1], { k: 'slingside', h: 0.45 }); add(P[1][0], P[1][1], P[2][0], P[2][1], { k: 'slingside', h: 0.45 }); }
  const drops = [6.8, 7.7, 8.6].map((y, i) => add(0.38, y - 0.35, 0.38, y + 0.35, { k: 'drop', id: i, r: 0.1, e: 0.3, vis: false }));
  const stands = [6.95, 7.95].map((y, i) => add(8.62, y - 0.33, 8.62, y + 0.33, { k: 'stand', id: i, r: 0.1, e: 0.35, vis: false }));
  const bumpers = [[3.3, 14.35], [5.7, 14.35], [4.5, 12.85]].map(([x, y], i) => ({ x, y, r: 0.6, id: i, k: 'bump' }));
  const flips = [{ side: 1, px: 2.85, py: 2.3 }, { side: -1, px: 6.15, py: 2.3 }].map(f => ({ ...f, a: FL.rest, w: 0, on: false }));
  const hole = { x: 4.5, y: 9.4, r: 0.42 };
  const sensors = [
    { id: 'fox0', x0: 2.72, x1: 3.78, y0: 16.6, y1: 17.25 }, { id: 'fox1', x0: 4.02, x1: 4.98, y0: 16.6, y1: 17.25 }, { id: 'fox2', x0: 5.22, x1: 6.28, y0: 16.6, y1: 17.25 },
    { id: 'orbL', x0: 0, x1: 0.95, y0: 12, y1: 13 }, { id: 'orbR', x0: 8.05, x1: 9, y0: 12, y1: 13 }, { id: 'top', x0: 0, x1: 10, y0: 18.7, y1: 21 },
    { id: 'exit', x0: 0, x1: 8.95, y0: 13, y1: 21 }, { id: 'inL', x0: 0.95, x1: 1.8, y0: 3.2, y1: 4.2 }, { id: 'inR', x0: 7.2, x1: 8.05, y0: 3.2, y1: 4.2 },
    { id: 'outL', x0: 0, x1: 0.95, y0: 1, y1: 3 }, { id: 'outR', x0: 8.05, x1: 9, y0: 1, y1: 3 }];
  const lamps = {};
  for (let i = 0; i < 8; i++) { const a = Math.PI / 2 - i * Math.PI / 4; lamps['g' + i] = { x: hole.x + Math.cos(a) * 1.35, y: hole.y + Math.sin(a) * 1.35, r: 0.25, col: '#ffd23a' }; }
  [3.25, 4.5, 5.75].forEach((x, i) => lamps['fox' + i] = { x, y: 15.9, r: 0.3, col: '#38bdf8', shape: 'arrow' });
  [3.0, 4.0, 5.0, 6.0].forEach((x, i) => lamps['x' + (i + 2)] = { x, y: 5.15, r: 0.26, col: '#f472b6' });
  [4.0, 4.5, 5.0].forEach((x, i) => lamps['lock' + i] = { x, y: 7.55, r: 0.17, col: '#22c55e' });
  lamps.drop = { x: 1.55, y: 7.7, r: 0.2, col: '#ffd23a' }; lamps.stand = { x: 7.75, y: 7.45, r: 0.2, col: '#ec3013' };
  lamps.orbL = { x: 1.75, y: 11.1, r: 0.22, col: '#a78bfa' }; lamps.orbR = { x: 7.25, y: 11.1, r: 0.22, col: '#a78bfa' };
  lamps.again = { x: 4.5, y: 0.75, r: 0.24, col: '#ec3013' }; lamps.jack = { x: 4.5, y: 10.95, r: 0.2, col: '#ffffff' };
  lamps.extra = { x: 4.5, y: 8.25, r: 0.17, col: '#ff8a1a' };
  lamps.inL = { x: 1.35, y: 3.35, r: 0.15, col: '#7dd3fc' }; lamps.inR = { x: 7.65, y: 3.35, r: 0.15, col: '#7dd3fc' };
  return { segs, drops, stands, bumpers, flips, hole, sensors, lamps };
}

// shared soft-glow texture (one per THREE instance)
const glowCache = new WeakMap();
export function glowTex(THREE) { if (glowCache.has(THREE)) return glowCache.get(THREE); const t = canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.55)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); glowCache.set(THREE, t); return t; }

// ---------------- dot-matrix display (the orange score screen in the backbox) ----------------
export function makeDMD(THREE, { on = '#ff8a1a', mid = '#7a3a0c', off = '#2a1206', bg = '#120804', glow = 0 } = {}) {   // colours: lit dot, edge dot, unlit dot, background
  const W = 128, H = 32, src = document.createElement('canvas'); src.width = W; src.height = H; const sg = src.getContext('2d', { willReadFrequently: true });
  const tex = canvasTex(512, 128, g => { g.fillStyle = bg; g.fillRect(0, 0, 512, 128); }), cv = tex.image, g = cv.getContext('2d');
  let last = '';
  function draw(lines) {
    const key = JSON.stringify(lines); if (key === last) return; last = key;
    sg.clearRect(0, 0, W, H); sg.fillStyle = '#fff'; sg.textAlign = 'center'; sg.textBaseline = 'middle';
    const fit = (txt, px, y, wt = 900) => { let s = px; do { sg.font = wt + ' ' + s + 'px ' + FONT; s--; } while (sg.measureText(txt).width > W - 4 && s > 6); sg.fillText(txt, W / 2, y); };
    if (lines.length === 1) fit(String(lines[0]), 22, H / 2 + 1); else { fit(String(lines[0]), 12, 8, 800); fit(String(lines[1]), 16, 23); }
    const d = sg.getImageData(0, 0, W, H).data; g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = d[(y * W + x) * 4 + 3]; if (a > 110) continue; g.fillStyle = a > 40 ? mid : off; g.fillRect(x * 4 + 0.6, y * 4 + 0.6, 2.8, 2.8); }
    if (glow) { g.save(); g.shadowColor = on; g.shadowBlur = glow; }   // lit dots last, with an optional glow so pale colours read bright
    g.fillStyle = on; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 110) g.fillRect(x * 4 + 0.4, y * 4 + 0.4, 3.2, 3.2);
    if (glow) g.restore();
    tex.needsUpdate = true;
  }
  draw(['GATE RUSH']);
  return { tex, draw };
}

// ---------------- the cabinet ----------------
export function buildMachine(ctx, opts = {}) {
  const { THREE, toon, M } = ctx, touch = ctx.touch ?? matchMedia('(pointer: coarse)').matches, grad = ctx.grad || makeGradient(THREE), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const LAY = opts.layout || tableLayout(), TX = x => x - 5, TZ = y => 10 - y, ink = new THREE.LineBasicMaterial({ color: 0x1a1626 }), glow = glowTex(THREE);
  const machine = new THREE.Group(); machine.name = 'arcadePinball'; machine.scale.setScalar(opts.scale ?? 1.45);
  const table = new THREE.Group(); table.scale.setScalar(S); table.rotation.x = SLOPE; table.position.set(0, 0.88 + 13 * S * Math.sin(SLOPE), 0); machine.add(table);
  // ---- playfield art ----
  const TWpx = touch ? 768 : 1024, PX = TWpx / 10;
  const pfTex = canvasTex(TWpx, TWpx * 2, (g, w, h) => {
    const P = (x, y) => [x * PX, (20 - y) * PX], k = PX / 51.2, F = (wt, px) => wt + ' ' + Math.round(px * k) + 'px ' + FONT;
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#141f52'); bg.addColorStop(0.5, '#0b1430'); bg.addColorStop(1, '#170b33'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.5})`; const r = rnd() * 1.6 * k + 0.4; g.beginPath(); g.arc(rnd() * w, rnd() * h, r, 0, 7); g.fill(); }
    const gr = g.createRadialGradient(...P(4.5, 9.4), 10 * k, ...P(4.5, 9.4), 330 * k); gr.addColorStop(0, 'rgba(70,100,230,0.75)'); gr.addColorStop(0.5, 'rgba(60,40,160,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(125,211,252,0.16)'; g.lineWidth = 2 * k; for (let r = 56; r < 620; r += 44) { g.beginPath(); g.arc(...P(4.5, 9.4), r * k, 0, 7); g.stroke(); }
    // eight gate arches around the hole
    for (let i = 0; i < 8; i++) { const a = Math.PI / 2 - i * Math.PI / 4, [cx, cy] = P(4.5 + Math.cos(a) * 1.35, 9.4 + Math.sin(a) * 1.35); g.save(); g.translate(cx, cy); g.rotate(-a + Math.PI / 2);
      g.strokeStyle = '#e6b45a'; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(-17 * k, 14 * k); g.lineTo(-17 * k, -4 * k); g.arc(0, -4 * k, 17 * k, Math.PI, 0); g.lineTo(17 * k, 14 * k); g.stroke(); g.restore();
      g.save(); g.translate(cx, cy); g.fillStyle = '#ffe7b0'; g.font = F(900, 14); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), Math.cos(a) * 31 * k, -Math.sin(a) * 31 * k); g.restore(); }
    g.fillStyle = '#e6b45a'; g.font = F(900, 15); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('GATE HOLE', ...P(4.5, 10.45)); g.fillStyle = '#ffb066'; g.font = F(900, 10); g.fillText('EXTRA BALL', ...P(4.5, 7.9));
    // top lanes
    for (const [i, c] of ['F', 'O', 'X'].entries()) { const [cx, cy] = P([3.25, 4.5, 5.75][i], 16.95); g.fillStyle = 'rgba(56,189,248,0.18)'; g.fillRect(cx - 24 * k, cy - 28 * k, 48 * k, 56 * k); g.font = F(900, 28); g.fillStyle = '#7dd3fc'; g.fillText(c, cx, cy); }
    g.font = F(900, 12); g.fillStyle = '#fbcfe8'; [2, 3, 4, 5].forEach((m, i) => g.fillText(m + 'X', ...P([3.0, 4.0, 5.0, 6.0][i], 4.62)));
    g.fillStyle = '#86efac'; g.font = F(900, 11); g.fillText('LOCK · MULTIBALL', ...P(4.5, 7.08));
    const arrow = (x, y, ang, col, txt, sz = 1) => { const [cx, cy] = P(x, y); g.save(); g.translate(cx, cy); g.rotate(-ang); g.scale(sz * k, sz * k); g.fillStyle = col; g.globalAlpha = 0.9; g.beginPath(); g.moveTo(28, 0); g.lineTo(-14, -17); g.lineTo(-5, 0); g.lineTo(-14, 17); g.closePath(); g.fill(); g.globalAlpha = 0.45; g.beginPath(); g.moveTo(4, 0); g.lineTo(-30, -15); g.lineTo(-22, 0); g.lineTo(-30, 15); g.closePath(); g.fill(); g.restore(); if (txt) { g.font = F(900, 11); g.fillStyle = col; g.fillText(txt, cx, cy + 30 * k); } };
    arrow(2.3, 10.1, 2.3, '#a78bfa', 'ORBIT'); arrow(6.7, 10.1, 0.84, '#a78bfa', 'ORBIT'); arrow(2.0, 6.9, Math.PI, '#ffd23a', 'TARGETS'); arrow(7.1, 6.6, 0, '#ec3013', '');
    arrow(4.5, 8.7, Math.PI / 2, '#e6b45a', '', 0.7);
    // inlane / outlane guides
    g.font = F(800, 9); g.fillStyle = '#fca5a5'; g.save(); g.translate(...P(0.47, 3.4)); g.rotate(-Math.PI / 2); g.fillText('OUT', 0, 0); g.restore(); g.save(); g.translate(...P(8.53, 3.4)); g.rotate(-Math.PI / 2); g.fillText('OUT', 0, 0); g.restore();
    // title above the flippers
    g.save(); g.translate(...P(4.5, 3.55)); { let fs = 34; g.font = F(900, fs); while (fs > 14 && g.measureText('GATE RUSH').width > 5.6 * PX) { fs -= 2; g.font = F(900, fs); } } g.textAlign = 'center'; g.fillStyle = '#ec3013'; g.fillText('GATE RUSH', 2.5 * k, 2.5 * k); g.fillStyle = '#ffffff'; g.fillText('GATE RUSH', 0, 0); g.restore();
    g.font = F(800, 10); g.fillStyle = '#fca5a5'; g.fillText('SHOOT AGAIN', ...P(4.5, 0.22));
    // plunger lane + wood outside the arch
    g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(...P(9, 20), 1 * PX, 20 * PX); g.strokeStyle = 'rgba(255,210,58,0.35)'; g.setLineDash([6 * k, 8 * k]); g.lineWidth = 2 * k; g.beginPath(); g.moveTo(...P(9.5, 1.4)); g.lineTo(...P(9.5, 13.5)); g.stroke(); g.setLineDash([]);
    g.save(); g.beginPath(); g.rect(0, 0, w, h); g.arc(...P(5, 15), 5 * PX, 0, Math.PI * 2, true); g.clip('evenodd'); const wd = g.createLinearGradient(0, 0, w, 0); wd.addColorStop(0, '#4a2c12'); wd.addColorStop(0.5, '#6b3e18'); wd.addColorStop(1, '#4a2c12'); g.fillStyle = wd; g.fillRect(0, 0, w, P(0, 15)[1]); g.restore();
    g.strokeStyle = '#ec3013'; g.lineWidth = 4 * k; g.strokeRect(2, 2, w - 4, h - 4);
  });
  pfTex.anisotropy = 8;
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), new THREE.MeshToonMaterial({ map: pfTex, gradientMap: grad })); pf.rotation.x = -Math.PI / 2; pf.receiveShadow = !touch; table.add(pf);
  // ---- walls (one merged mesh) + rubbers + ink edges ----
  const wallParts = [], rubParts = [], capParts = [];
  for (const s of LAY.segs) { if (!s.vis) continue; const L = Math.hypot(s.bx - s.ax, s.by - s.ay), th = Math.max(0.12, s.r * 2), m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), Math.atan2(s.by - s.ay, s.bx - s.ax));
    m.compose(V3(TX((s.ax + s.bx) / 2), s.h / 2, TZ((s.ay + s.by) / 2)), q, V3(1, 1, 1)); (s.rub ? rubParts : wallParts).push({ geo: new THREE.BoxGeometry(L + th, s.h, th), m });
    if (!s.rub && s.k !== 'gate') { const m2 = new THREE.Matrix4(); m2.compose(V3(TX((s.ax + s.bx) / 2), s.h + 0.02, TZ((s.ay + s.by) / 2)), q, V3(1, 1, 1)); capParts.push({ geo: new THREE.BoxGeometry(L + th, 0.04, th + 0.02), m: m2 }); } }
  const wallGeo = mergeGeos(THREE, wallParts), walls = new THREE.Mesh(wallGeo, toon('#aeb8cc')); walls.castShadow = !touch; table.add(walls); table.add(new THREE.LineSegments(new THREE.EdgesGeometry(wallGeo, 30), ink));
  table.add(new THREE.Mesh(mergeGeos(THREE, capParts), toon('#eef3fa')));
  const rubGeo = mergeGeos(THREE, rubParts), rubs = new THREE.Mesh(rubGeo, toon('#f6f3ea')); table.add(rubs); table.add(new THREE.LineSegments(new THREE.EdgesGeometry(rubGeo, 30), ink));
  function prism(pts, h, mat) { const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(TX(x), y - 10))); const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); const m = new THREE.Mesh(geo, mat); table.add(m); table.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), ink)); return m; }
  const slingMats = [0, 1].map(() => new THREE.MeshToonMaterial({ color: '#ec3013', gradientMap: grad, emissive: '#ffb347', emissiveIntensity: 0 }));
  prism([[1.75, 5.3], [1.75, 4.35], [2.65, 3.8]], 0.42, slingMats[0]); prism([[7.25, 5.3], [6.35, 3.8], [7.25, 4.35]], 0.42, slingMats[1]);
  // ---- rails, apron, plunger ----
  const wood = toon('#6e3a1a'), dark = toon('#1b1733'), chrome = toon('#dfe6ee'), red = toon('#c42d3c'), black = toon('#0e0c16');
  M(new THREE.BoxGeometry(0.5, 1.6, 23.4), wood, -5.25, 0.2, 0.5, table, 0.05); M(new THREE.BoxGeometry(0.5, 1.6, 23.4), wood, 5.25, 0.2, 0.5, table, 0.05);
  M(new THREE.BoxGeometry(0.56, 0.12, 23.4), chrome, -5.25, 1.04, 0.5, table, 0); M(new THREE.BoxGeometry(0.56, 0.12, 23.4), chrome, 5.25, 1.04, 0.5, table, 0);
  M(new THREE.BoxGeometry(11, 1.6, 0.5), wood, 0, 0.2, -10.95, table, 0.05);
  const apronTex = canvasTex(1024, 224, (g, w, h) => {   // s100 (Ben): polished apron: margins, a mark, ruled columns, 1–4 players
    const ink = '#201e1d', red = '#ec3013', yel = '#ffd23a', M0 = 40; g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = red; g.fillRect(0, 0, w, 16); g.fillStyle = yel; g.fillRect(0, 16, w, 6); g.fillStyle = ink; g.fillRect(0, h - 6, w, 6);
    g.textBaseline = 'middle'; const fitT = (t, x, y, mw, px, wt, col) => { let s = px; g.font = wt + ' ' + s + 'px ' + FONT; while (s > 10 && g.measureText(t).width > mw) { s -= 2; g.font = wt + ' ' + s + 'px ' + FONT; } g.fillStyle = col; g.fillText(t, x, y); };
    const cy = (h + 22) / 2; g.fillStyle = red; g.fillRect(M0, cy - 30, 22, 60); fitT('8 GATES', M0 + 40, cy + 2, 250, 66, 900, ink);
    const c1 = 360, c2 = 650; g.fillStyle = ink; g.fillRect(c1 - 24, 50, 4, h - 80); g.fillRect(c2 - 24, 50, 4, h - 80);
    fitT('PINBALL', c1, cy - 26, c2 - c1 - 48, 20, 800, '#7a746d'); fitT('GATE RUSH', c1, cy + 12, c2 - c1 - 48, 40, 900, ink);
    fitT('3 BALLS \u00b7 1\u20134 PLAYERS', c2, cy - 26, w - c2 - M0, 22, 900, ink); fitT('OPEN ALL 8 GATES', c2, cy + 6, w - c2 - M0, 19, 800, '#5c5856'); fitT('SHOOT THE HOLE 3\u00d7 = MULTIBALL', c2, cy + 34, w - c2 - M0, 19, 800, '#5c5856'); });
  const apron = M(new THREE.BoxGeometry(10, 0.5, 2.3), [chrome, chrome, new THREE.MeshToonMaterial({ map: apronTex, gradientMap: grad }), chrome, chrome, chrome], 0, 0.25, 11.15, table, 0.04); apron.castShadow = false;
  M(new THREE.BoxGeometry(11, 1.6, 0.5), wood, 0, 0.2, 12.45, table, 0.05);
  M(new THREE.BoxGeometry(11.0, 0.35, 0.6), chrome, 0, 1.15, 12.5, table, 0.03);
  const plunger = new THREE.Group(); plunger.position.set(TX(9.5), 0.3, 12.7); table.add(plunger);
  M(new THREE.CylinderGeometry(0.09, 0.09, 1.2, 10), chrome, 0, 0, 0.3, plunger, 0.02).rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.28, 14, 10), red, 0, 0, 0.95, plunger, 0.03, 0.28);
  const spring = M(new THREE.TorusGeometry(0.16, 0.035, 5, 12), chrome, 0, 0, -0.1, plunger, 0); spring.scale.z = 3;
  // ---- glass sheen (very faint diagonal streaks) ----
  const glassTex = canvasTex(128, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const l = g.createLinearGradient(0, 0, w, h); l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.42, 'rgba(255,255,255,0)'); l.addColorStop(0.47, 'rgba(255,255,255,0.9)'); l.addColorStop(0.52, 'rgba(255,255,255,0)'); l.addColorStop(0.6, 'rgba(255,255,255,0.35)'); l.addColorStop(0.63, 'rgba(255,255,255,0)'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 23), new THREE.MeshBasicMaterial({ map: glassTex, transparent: true, opacity: 0.07, depthWrite: false })); glass.rotation.x = -Math.PI / 2; glass.position.set(0, 1.0, 0.5); glass.renderOrder = 5; table.add(glass);
  // ---- cabinet body, legs, coin door, flipper buttons ----
  const body = new THREE.Group(); machine.add(body);
  M(new THREE.BoxGeometry(0.78, 0.36, 1.62), toon('#201a3a'), 0, 0.66, 0.04, body, 0.012);
  const sideTex = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#201a3a'; g.fillRect(0, 0, w, h); const st = (x0, col, wd) => { g.fillStyle = col; g.beginPath(); g.moveTo(x0, h); g.lineTo(x0 + h * 1.2, 0); g.lineTo(x0 + h * 1.2 + wd, 0); g.lineTo(x0 + wd, h); g.fill(); }; st(w * 0.08, '#ec3013', 46); st(w * 0.08 + 56, '#ffd23a', 14); st(w * 0.08 + 78, '#38bdf8', 8); g.fillStyle = '#ffffff'; g.font = '900 44px ' + FONT; g.textBaseline = 'middle'; g.fillText('GATE RUSH', w * 0.45, h / 2 + 4); });
  for (const s of [-1, 1]) { const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.34), new THREE.MeshToonMaterial({ map: sideTex, gradientMap: grad })); sp.position.set(s * 0.392, 0.67, 0.04); sp.rotation.y = s * Math.PI / 2; if (s < 0) sp.scale.x = -1; body.add(sp);
    M(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12), red, s * 0.398, 0.76, 0.72, body, 0.006).rotation.z = Math.PI / 2; }
  for (const [x, z] of [[-0.34, 0.78], [0.34, 0.78], [-0.34, -0.7], [0.34, -0.7]]) { M(new THREE.BoxGeometry(0.07, 0.62, 0.07), chrome, x, 0.31, z, body, 0.012); M(new THREE.CylinderGeometry(0.05, 0.06, 0.03, 10), black, x, 0.015, z, body, 0); }
  const doorTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#12101c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#dfe6ee'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#7a746d'; g.font = '800 15px ' + FONT; g.textAlign = 'center'; g.fillText('INSERT COIN', w / 2, h - 22); });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshToonMaterial({ map: doorTex, gradientMap: grad })); door.position.set(0, 0.64, 0.853); body.add(door);
  const slotMat = new THREE.MeshBasicMaterial({ color: '#ff3b2a' }), slots = [-0.07, 0.07].map(x => { const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.07), slotMat); sm.position.set(x, 0.665, 0.855); body.add(sm); return sm; });
  // ---- backbox: art + DMD ----
  const backTex = canvasTex(1024, 768, (g, w, h) => {   // s100 (Ben): final polish: 2x sharper, 64 px margins, fitted title, ruled kicker
    const M0 = 64, fitC = (t, y, mw, px, col, sh) => { let s = px; g.font = '900 ' + s + 'px ' + FONT; while (s > 12 && g.measureText(t).width > mw) { s -= 4; g.font = '900 ' + s + 'px ' + FONT; } if (sh) { g.fillStyle = sh; g.fillText(t, w / 2 + s * 0.06, y + s * 0.06); } g.fillStyle = col; g.fillText(t, w / 2, y); return s; };
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a1d7a'); gr.addColorStop(1, '#0b1430'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const sun = g.createRadialGradient(w / 2, h * 0.98, 20, w / 2, h * 0.98, 500); sun.addColorStop(0, 'rgba(255,120,60,0.85)'); sun.addColorStop(1, 'rgba(255,60,120,0)'); g.fillStyle = sun; g.fillRect(0, 0, w, h);
    const gw = (w - M0 * 2) / 8; for (let i = 0; i < 8; i++) { const x = M0 + i * gw + gw * 0.14, ww = gw * 0.72; g.strokeStyle = i % 2 ? '#38bdf8' : '#ffd23a'; g.lineWidth = 10; g.beginPath(); g.moveTo(x, h - M0); g.lineTo(x, h - 210); g.arc(x + ww / 2, h - 210, ww / 2, Math.PI, 0); g.lineTo(x + ww, h - M0); g.stroke(); }
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.font = '900 44px ' + FONT; const kw = g.measureText('8 GATES PINBALL').width; g.fillStyle = '#7dd3fc'; g.fillText('8 GATES PINBALL', w / 2, M0 + 60); g.fillStyle = '#7dd3fc'; g.fillRect(w / 2 - kw / 2, M0 + 76, kw, 4);
    fitC('GATE RUSH', 340, w - M0 * 2 - 24, 190, '#ffffff', '#ec3013');
    g.strokeStyle = '#ffd23a'; g.lineWidth = 14; g.strokeRect(16, 16, w - 32, h - 32); g.strokeStyle = '#201e1d'; g.lineWidth = 4; g.strokeRect(30, 30, w - 60, h - 60); });
  const backbox = new THREE.Group(); backbox.position.set(0, table.position.y + Math.sin(SLOPE) * 11 * S + 0.04, -0.8); machine.add(backbox);
  M(new THREE.BoxGeometry(0.78, 0.9, 0.2), dark, 0, 0.45, 0, backbox, 0.012); M(new THREE.BoxGeometry(0.8, 0.06, 0.24), chrome, 0, 0.92, 0, backbox, 0.01);
  const art = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.525), new THREE.MeshBasicMaterial({ map: backTex })); art.position.set(0, 0.6, 0.102); backbox.add(art);
  const dmd = makeDMD(THREE), dmdM = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), new THREE.MeshBasicMaterial({ map: dmd.tex })); dmdM.position.set(0, 0.2, 0.103); backbox.add(dmdM);
  for (const s of [-1, 1]) { const sp = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), new THREE.MeshBasicMaterial({ color: '#2a2440' })); sp.position.set(s * 0.31, 0.2, 0.103); backbox.add(sp); }
  M(new THREE.BoxGeometry(0.06, 0.4, 0.06), chrome, 0, -0.1, -0.04, backbox, 0.01);
  const artGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ff4fd8', transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending })); artGlow.scale.set(1.3, 1.1, 1); artGlow.position.set(0, 0.55, 0.15); backbox.add(artGlow);
  // ---- flippers ----
  function flipperShape() { const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI / 2 + i / 12 * Math.PI; pts.push(new THREE.Vector2(Math.cos(a) * FL.r0, Math.sin(a) * FL.r0)); } for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; pts.push(new THREE.Vector2(FL.len + Math.cos(a) * FL.r1, Math.sin(a) * FL.r1)); } return new THREE.Shape(pts); }
  const flipGeo = new THREE.ExtrudeGeometry(flipperShape(), { depth: 0.38, bevelEnabled: false }); flipGeo.rotateX(-Math.PI / 2);
  const flipMeshes = LAY.flips.map(f => { const g = new THREE.Group(); g.position.set(TX(f.px), 0.02, TZ(f.py)); table.add(g); g.add(new THREE.Mesh(flipGeo, toon('#f6f3ea'))); g.add(new THREE.LineSegments(new THREE.EdgesGeometry(flipGeo, 30), ink));
    const band = new THREE.Mesh(new THREE.BoxGeometry(FL.len * 0.85, 0.16, 0.06), toon('#ec3013')); band.position.set(FL.len * 0.48, 0.2, 0); g.add(band);
    M(new THREE.CylinderGeometry(0.1, 0.1, 0.42, 10), chrome, 0, 0.21, 0, g, 0); return g; });
  // ---- bumpers (with light halo) ----
  const bumpCols = ['#38bdf8', '#38bdf8', '#ec3013'];
  const bumpMeshes = LAY.bumpers.map((b, i) => { const g = new THREE.Group(); g.position.set(TX(b.x), 0, TZ(b.y)); table.add(g);
    M(new THREE.CylinderGeometry(0.66, 0.7, 0.1, 24), dark, 0, 0.05, 0, g, 0.03, 0.7); const ring = M(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 24), chrome, 0, 0.2, 0, g, 0.02, 0.62);
    M(new THREE.CylinderGeometry(0.46, 0.5, 0.42, 20), toon(bumpCols[i]), 0, 0.3, 0, g, 0.03, 0.5);
    const capMat = new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad, emissive: '#ffd23a', emissiveIntensity: 0.15 }); const cap = M(new THREE.CylinderGeometry(0.58, 0.58, 0.14, 24), capMat, 0, 0.58, 0, g, 0.03, 0.58);
    const star = new THREE.Mesh(new THREE.CircleGeometry(0.3, 5), new THREE.MeshBasicMaterial({ color: '#ec3013' })); star.rotation.x = -Math.PI / 2; star.position.y = 0.66; g.add(star);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: bumpCols[i], transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(2.4); halo.position.y = 0.5; g.add(halo);
    return { g, ring, cap, capMat, star, halo, t: 0 }; });
  const dropMeshes = LAY.drops.map(s => { const m = M(new THREE.BoxGeometry(0.2, 0.55, 0.68), toon('#ffd23a'), TX(s.ax), 0.275, TZ((s.ay + s.by) / 2), table, 0.03); M(new THREE.BoxGeometry(0.02, 0.22, 0.3), toon('#201e1d'), 0.105, 0.06, 0, m, 0); return { m }; });
  const standMeshes = LAY.stands.map(s => { const m = M(new THREE.BoxGeometry(0.2, 0.5, 0.62), toon('#ec3013'), TX(s.ax), 0.25, TZ((s.ay + s.by) / 2), table, 0.03); M(new THREE.BoxGeometry(0.1, 0.5, 0.1), chrome, 0.15, 0, 0, m, 0); return { m, t: 0 }; });
  const holeM = new THREE.Mesh(new THREE.CircleGeometry(LAY.hole.r, 24), new THREE.MeshBasicMaterial({ color: '#05030c' })); holeM.rotation.x = -Math.PI / 2; holeM.position.set(TX(LAY.hole.x), 0.01, TZ(LAY.hole.y)); table.add(holeM);
  const holeRing = new THREE.Mesh(new THREE.TorusGeometry(LAY.hole.r + 0.04, 0.06, 6, 28), toon('#e6b45a')); holeRing.rotation.x = -Math.PI / 2; holeRing.position.copy(holeM.position); table.add(holeRing);
  const holeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#ffd23a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); holeGlow.scale.setScalar(2.2); holeGlow.position.set(holeM.position.x, 0.3, holeM.position.z); table.add(holeGlow);
  // ---- lamps: insert + halo; set(key, on) ----
  const lampGeo = new THREE.CircleGeometry(1, 20), rimGeo = new THREE.RingGeometry(1, 1.22, 20), rimMat = new THREE.MeshBasicMaterial({ color: '#05030c' }), lamps = {};
  // arrow inserts (the F-O-X lane lights): a chrome bezel, coloured plastic, a hot white core when lit and a gloss highlight
  const arrowShape = sc => new THREE.Shape([[0, -1], [0.82, -0.12], [0.82, 0.72], [-0.82, 0.72], [-0.82, -0.12]].map(([x, y]) => new THREE.Vector2(x * sc, y * sc)));
  const arrowGeo = new THREE.ShapeGeometry(arrowShape(1)), bezelGeo = new THREE.ShapeGeometry(arrowShape(1.26)), inkGeo = new THREE.ShapeGeometry(arrowShape(1.36)), coreGeo = new THREE.ShapeGeometry(arrowShape(0.5));
  const bezelMat = new THREE.MeshBasicMaterial({ color: '#d9e0ea' }), glossMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.38, depthWrite: false }), glossGeo = new THREE.CircleGeometry(1, 16);
  for (const [k, l] of Object.entries(LAY.lamps)) { const c = new THREE.Color(l.col), arrow = l.shape === 'arrow', offK = arrow ? 0.34 : 0.2, mat = new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(offK) }); const m = new THREE.Mesh(arrow ? arrowGeo : lampGeo, mat); m.scale.setScalar(l.r); m.rotation.x = -Math.PI / 2; m.position.set(TX(l.x), 0.014, TZ(l.y)); table.add(m);
    let core = null;
    if (arrow) { const flat = (geo, mt, y, sc = l.r) => { const o = new THREE.Mesh(geo, mt); o.rotation.x = -Math.PI / 2; o.scale.setScalar(sc); o.position.set(m.position.x, y, m.position.z); table.add(o); return o; };
      flat(inkGeo, rimMat, 0.010); flat(bezelGeo, bezelMat, 0.012);
      core = flat(coreGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false }), 0.016); core.position.z += l.r * 0.12;
      const gl = flat(glossGeo, glossMat, 0.018, l.r * 0.2); gl.scale.x = l.r * 0.42; gl.position.x -= l.r * 0.3; gl.position.z -= l.r * 0.36; }
    else { const rim = new THREE.Mesh(rimGeo, rimMat); rim.rotation.x = -Math.PI / 2; rim.scale.setScalar(l.r); rim.position.copy(m.position); rim.position.y = 0.011; table.add(rim); }
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: c, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(l.r * 4.2); halo.position.set(m.position.x, 0.12, m.position.z); table.add(halo);
    lamps[k] = { m, halo, core, on: c, off: c.clone().multiplyScalar(offK), st: -1, lvl: 0 }; }
  function setLamp(k, on) { const L = lamps[k]; if (!L) return; const v = on ? 1 : 0; if (L.st === v) return; L.st = v; L.m.material.color.copy(on ? L.on : L.off); }
  function lampTick(dt) { for (const L of Object.values(lamps)) { L.lvl += ((L.st > 0 ? 1 : 0) - L.lvl) * Math.min(1, dt * 18); L.halo.material.opacity = L.lvl * 0.55; L.halo.visible = L.lvl > 0.02; if (L.core) L.core.material.opacity = L.lvl * 0.75; } }
  // attract-mode light show (used on the menu and by the world prop)
  let attractT = 0; const keys = Object.keys(lamps), ring = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
  function attract(dt) { attractT += dt; const ph = Math.floor(attractT / 4) % 3, i = Math.floor(attractT * 8);
    keys.forEach((k, n) => setLamp(k, ph === 0 ? (n + i) % 6 === 0 : ph === 1 ? (ring.includes(k) ? ring.indexOf(k) === i % 8 || ring.indexOf(k) === (i + 4) % 8 : (n + (i >> 1)) % 2 === 0) : Math.sin(lamps[k].m.position.z * 0.6 - attractT * 6) > 0.4));
    bumpMeshes.forEach((b, j) => { b.capMat.emissiveIntensity = 0.15 + 0.4 * Math.max(0, Math.sin(attractT * 5 + j * 2)); });
    slotMat.color.setHex(Math.floor(attractT * 2) % 2 ? 0xff3b2a : 0x7a1d12); lampTick(dt); }
  return { machine, table, body, backbox, LAY, TX, TZ, pf, flipMeshes, bumpMeshes, dropMeshes, standMeshes, slingMats, lamps, setLamp, lampTick, attract, plunger, spring, dmd, holeGlow, glass, slotMat, grad };
}

// ---------------- a world prop: the same machine, idling in attract mode ----------------
// const pb = pinballProp(ctx, { x, z, rotY }); scene.add(pb.group); each frame pb.update(dt);
// best = save.stat('arcadePinball.best') so the DMD shows the high score. pb.standAt = where the player stands to play (world coords); open the game with openPinball() from pinball-embed.js.
export function pinballProp(ctx, { x = 0, y = 0, z = 0, rotY = 0, scale = 1.45, best = 0 } = {}) {
  const { THREE } = ctx, M0 = buildMachine(ctx, { scale }), group = new THREE.Group(); group.add(M0.machine); group.position.set(x, y, z); group.rotation.y = rotY;
  let t = 0; // best: pass save.stat('arcadePinball.best') from engine/save.js
  const standAt = new THREE.Vector3(0, 0, 1.3 * scale / 1.45).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(group.position);
  return { group, standAt, machine: M0,
    update(dt) { t += dt; M0.attract(dt); M0.dmd.draw(Math.floor(t / 3) % 2 ? ['HIGH SCORE', best.toLocaleString('en-US')] : ['GATE RUSH']); },
    setBest(v) { best = v || 0; } };
}
