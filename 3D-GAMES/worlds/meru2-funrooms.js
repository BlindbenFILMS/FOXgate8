// MERU 2.0 — step 10 ART PASS 6b: MERU LANES [meruBowling] (redesigned) + CASINO [meruCasino] (dressing).
// LANES (f 105..150 × -38..10, door W at z -14): 6 maple lanes running east (foul line x 126.55, head pin x 142), gutters, cappings,
// kickbacks, pit, a lit masking unit, ball returns, overhead score screens, red vinyl settees, ball racks, the shoe desk (Mott),
// a snack bar, high tables, two pool tables and an arcade row. DASH bowls lane one on a loop (worlds/meru-bowler.js, unchanged).
// CASINO (f -150..-105 × -32..32, door E at z 0): keeps the three sound bays (slots W, poker N, wheel S) + cashier; spots + people stay in meru2-rooms.js.
import { makeRoomKit } from './meru2-roomkit.js';
import { createBowler } from './meru-bowler.js';
const pinGeo = THREE => { const pts = [[0, 0], [0.026, 0], [0.05, 0.05], [0.06, 0.1], [0.058, 0.16], [0.04, 0.22], [0.022, 0.27], [0.024, 0.31], [0.03, 0.34], [0.022, 0.375], [0, 0.38]].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 12), p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), red = (y > 0.24 && y < 0.255) || (y > 0.262 && y < 0.278); c[i * 3] = red ? 0.85 : 0.97; c[i * 3 + 1] = red ? 0.12 : 0.97; c[i * 3 + 2] = red ? 0.15 : 0.96; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); return g; };

export function buildLanes2({ THREE, scene, kit, cols, touch, M, toon, audio }) {
  const { CT, Bin, flat, wallPlane, signTex, pendant, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const G = new THREE.Group(); scene.add(G); const b = Bin(), npcs = [], spots = [];
  const fox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); npcs.push(f); return f; };
  const LZ = [-36, -34.1, -32.2, -30.3, -28.4, -26.5], FOUL = 126.55, LEND = 143, AX = 122.5, ZC = -31.25, PAIRS = [0, 1, 2].map(k => (LZ[2 * k] + LZ[2 * k + 1]) / 2);
  // carpet (retro confetti on navy) over the whole hall
  const carpet = CT(256, 256, (g, w) => { g.fillStyle = '#1b1830'; g.fillRect(0, 0, w, w); const C = ['#ff3fb4', '#38bdf8', '#ffd23a', '#7cff9b'];
    for (let i = 0; i < 70; i++) { const x = rnd() * w, y = rnd() * w, c = C[i % 4], s = 5 + rnd() * 8, k = i % 3;
      for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, w], [0, -w]]) { g.save(); g.translate(x + ox, y + oy); g.rotate(rnd() * 6.28); g.strokeStyle = g.fillStyle = c; g.lineWidth = 3;
        if (k === 0) { g.beginPath(); g.arc(0, 0, s * 0.6, 0, 7); g.stroke(); } else if (k === 1) { g.beginPath(); g.moveTo(-s, s * 0.6); g.lineTo(0, -s * 0.7); g.lineTo(s, s * 0.6); g.closePath(); g.fill(); }
        else { g.beginPath(); g.moveTo(-s, 0); g.bezierCurveTo(-s / 2, -s, s / 2, s, s, 0); g.stroke(); } g.restore(); } } });
  flat(G, carpet, 44.2, 47.2, 127.5, 0.05, -14, 2);
  // ---- the six lanes: one instanced maple plane (boards, approach dots, foul line, range dots, arrows, pin spots) ----
  const laneTex = CT(1024, 64, (g, w, h) => { const ppm = w / 20.5;
    for (let i = 0; i < 39; i++) { const k = 0.9 + rnd() * 0.16; g.fillStyle = `rgb(${226 * k | 0},${186 * k | 0},${128 * k | 0})`; g.fillRect(0, i * h / 39, w, h / 39 + 1); }
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 40; i++) g.fillRect(0, i * h / 39, w, 0.6);
    const fx = 4.05 * ppm; g.fillStyle = '#201e1d'; g.fillRect(fx - 1.5, 0, 3, h);
    for (const m of [0.6, 1.8, 3.6]) for (const t of [10, 15, 20, 25, 30]) { g.beginPath(); g.arc(m * ppm, t * h / 39, 1.6, 0, 7); g.fill(); }
    for (const t of [3, 5, 8, 11, 28, 31, 34, 36]) { g.beginPath(); g.arc(fx + 2.1 * ppm, t * h / 39, 1.4, 0, 7); g.fill(); }
    for (let i = 0; i < 7; i++) { const t = 5 + i * 5, x0 = fx + (4.0 + Math.abs(3 - i) * -0.3 + 0.9) * ppm, y = t * h / 39; g.fillStyle = '#3a2a1a'; g.beginPath(); g.moveTo(x0 + 12, y); g.lineTo(x0, y - 3); g.lineTo(x0, y + 3); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(19.1 * ppm, 0, w - 19.1 * ppm, h);
    g.fillStyle = '#3a2a1a'; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) { g.beginPath(); g.arc((19.5 + r * 0.28) * ppm, h / 2 + (c - r / 2) * 0.32 / 1.07 * h, 1.8, 0, 7); g.fill(); } });
  { const lg = new THREE.PlaneGeometry(20.5, 1.07).rotateX(-Math.PI / 2).translate(AX + 10.25, 0, 0), lm = new THREE.InstancedMesh(lg, new THREE.MeshPhongMaterial({ map: laneTex, shininess: 90, specular: 0x555555 }), 6);
    const m4 = new THREE.Matrix4(); LZ.forEach((z, i) => lm.setMatrixAt(i, m4.makeTranslation(0, 0.105, z))); if (!touch) lm.receiveShadow = true; G.add(lm); }
  b.box('mat', '#d9b27a', FOUL - AX, 0.1, 12.1, (AX + FOUL) / 2, 0.05, ZC);
  const caps = [LZ[0] - 0.95, ...LZ.slice(1).map((z, i) => (z + LZ[i]) / 2), LZ[5] + 0.95];
  for (const z of LZ) for (const s of [-1, 1]) b.box('gls', '#26243a', LEND - FOUL, 0.06, 0.24, (FOUL + LEND) / 2, 0.06, z + s * 0.655);
  for (const z of caps) { b.box('mat', '#3a3448', LEND - FOUL, 0.16, 0.35, (FOUL + LEND) / 2, 0.08, z); b.box('mat', '#201e1d', 3.4, 0.8, 0.1, 141.6, 0.4, z); b.box('glo', '#52e3ff', 0.04, 0.04, 0.35, FOUL + 0.02, 0.17, z); }
  b.box('mat', '#0d0d12', 1.6, 0.04, 12.1, 143.8, 0.02, ZC); b.box('mat', '#0d0d12', 0.1, 1.3, 12.1, 144.6, 0.65, ZC);
  // masking unit over the pin decks + the pinsetter wall behind
  const maskTex = CT(1024, 160, (g, w, h) => { g.fillStyle = '#141838'; g.fillRect(0, 0, w, h); const seg = w / 6;
    for (let i = 0; i < 6; i++) { const x = i * seg, c = ['#ff3fb4', '#38bdf8', '#ffd23a'][i % 3]; g.fillStyle = c; g.fillRect(x + 6, 10, seg - 12, 6); g.fillRect(x + 6, h - 16, seg - 12, 6);
      g.fillStyle = '#f3f2f2'; for (let k = -1; k <= 1; k++) { const px = x + seg / 2 + k * 30, py = h / 2 + 6; g.beginPath(); g.ellipse(px, py + 14, 10, 22, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(px, py - 18, 6, 9, 0, 0, 7); g.fill(); g.fillStyle = '#ec3013'; g.fillRect(px - 6, py - 6, 12, 4); g.fillStyle = '#f3f2f2'; }
      g.fillStyle = c; g.font = '800 22px Archivo, Helvetica, sans-serif'; g.fillText(String(i + 1), x + 14, 44); } });
  wallPlane(G, maskTex, 12.1, 1.9, 140.98, 2.25, ZC, -Math.PI / 2, true);
  b.box('mat', '#201e1d', 0.3, 2.0, 12.3, 141.2, 2.25, ZC); b.box('glo', '#52e3ff', 0.1, 0.06, 12.1, 140.85, 1.27, ZC); b.box('mat', '#15131f', 0.2, 4.4, 12.3, 141.3, 5.45, ZC);
  b.box('mat', '#24222e', 4.6, 3, 12.2, 147.2, 1.5, ZC);
  // side wall between the lanes and the café floor, neon on top
  b.box('mat', '#201e1d', 23.1, 1.1, 0.2, 138.05, 0.55, -25.2); b.box('glo', '#ff3fb4', 23.1, 0.05, 0.22, 138.05, 1.12, -25.2);
  box(126.45, 149.6, -37.6, -25.1);
  // trusses with downlights + neon over the lanes; score screens hung over the foul line
  for (const x of [127.2, 133, 138.6]) { b.box('gls', '#2a2a33', 0.25, 0.25, 12.3, x, 4.4, ZC); b.box('glo', '#fff1c8', 0.1, 0.04, 11.6, x, 4.26, ZC); b.box('glo', x === 133 ? '#38bdf8' : '#ff3fb4', 0.04, 0.1, 12.3, x - 0.14, 4.4, ZC);
    for (const z of [ZC - 5.5, ZC + 5.5]) b.box('mat', '#201e1d', 0.03, 2.6, 0.03, x, 5.8, z); }
  const scr = CT(512, 384, (g, w) => { ['HOUSE 212 \u00b7 NERA', 'MERU LANES', 'ROOK 147'].forEach((t, i) => { const y = i * 128; g.fillStyle = '#0e1230'; g.fillRect(0, y, w, 128); g.fillStyle = '#ec3013'; g.fillRect(0, y, 12, 128);
    g.strokeStyle = '#38bdf8'; g.lineWidth = 2; for (let k = 0; k < 10; k++) g.strokeRect(24 + k * 47, y + 76, 44, 38); g.fillStyle = '#f3f2f2'; g.font = '800 38px Archivo, Helvetica, sans-serif'; g.fillText(t, 26, y + 52); }); });
  PAIRS.forEach((zc, i) => { b.box('mat', '#201e1d', 0.15, 1.0, 1.75, 127.1, 3.35, zc); b.box('mat', '#201e1d', 0.03, 0.9, 0.03, 127.1, 4.1, zc);
    const pg = new THREE.PlaneGeometry(1.6, 0.9), uv = pg.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, (2 - i + uv.getY(k)) / 3);
    const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: scr, color: 0xdddddd })); m.position.set(127.02, 3.35, zc); m.rotation.y = -Math.PI / 2; G.add(m); });
  // ball returns, settees + scoring consoles behind each lane pair
  const BALL = ['#7c3aed', '#ec3013', '#38bdf8', '#ffd23a', '#22c55e', '#f472b6', '#201e1d', '#f97316'];
  PAIRS.forEach((zc, i) => {
    b.box('mat', '#3a3448', 1.3, 0.55, 0.42, 123.8, 0.38, zc); b.cyl('gls', '#3a3448', 0.21, 1.3, 123.8, 0.66, zc, 12, 0, Math.PI / 2); b.box('gls', '#c0c4cc', 1.0, 0.03, 0.3, 123.7, 0.88, zc);
    for (let k = 0; k < 3; k++) b.sph('gls', BALL[(i * 3 + k) % 8], 0.11, 123.35 + k * 0.24, 0.98, zc, 1, 10);
    box(123.1, 124.5, zc - 0.25, zc + 0.25);
    b.box('mat', '#201e1d', 0.62, 0.3, 3.0, 119.6, 0.15, zc); b.box('mat', '#c42d3c', 0.6, 0.14, 2.9, 119.6, 0.37, zc); b.box('mat', '#c42d3c', 0.18, 0.6, 3.0, 119.2, 0.74, zc);
    for (const s of [-1, 1]) b.box('mat', '#a8323e', 0.66, 0.28, 0.18, 119.6, 0.52, zc + s * 1.55);
    b.box('mat', '#201e1d', 0.3, 0.8, 0.3, 121.4, 0.4, zc); b.box('mat', '#201e1d', 0.08, 0.4, 0.55, 121.4, 0.95, zc, 0, 0, 0.3); b.box('glo', '#52e3ff', 0.01, 0.32, 0.46, 121.36, 0.95, zc, 0, 0, 0.3);
    b.cyl('mat', '#201e1d', 0.05, 0.6, 120.7, 0.3, zc + 1.0, 6); b.cyl('mat', '#3a3448', 0.32, 0.04, 120.7, 0.62, zc + 1.0, 14); b.cyl('gls', '#f3f2f2', 0.04, 0.12, 120.6, 0.7, zc + 1.05, 8); b.cyl('gls', '#ec3013', 0.04, 0.14, 120.8, 0.71, zc + 0.9, 8);
    box(119.0, 120.0, zc - 1.65, zc + 1.65); ring(121.4, zc, 0.3); ring(120.7, zc + 1.0, 0.35); });
  // ball racks (3 tiers) on the concourse
  for (const [z0, z1] of [[-36.8, -32.6], [-30.0, -25.8]]) { const zc = (z0 + z1) / 2, L = z1 - z0; b.box('mat', '#201e1d', 0.8, 0.12, L, 115.8, 0.06, zc); for (const z of [z0, z1]) b.box('mat', '#3a3448', 0.8, 1.35, 0.08, 115.8, 0.68, z);
    [[0.45, 116.0], [0.85, 115.8], [1.25, 115.6]].forEach(([y, x], t) => { for (const s of [-0.07, 0.07]) b.box('gls', '#c0c4cc', 0.03, 0.03, L, x + s, y, zc);
      for (let z = z0 + 0.2; z < z1 - 0.1; z += touch ? 0.36 : 0.25) b.sph('gls', BALL[Math.floor(rnd() * 8)], 0.11, x, y + 0.1, z, 1, touch ? 8 : 10); });
    box(115.35, 116.3, z0 - 0.05, z1 + 0.05); }
  // shoe desk (Mott) + the cubby wall of bowling shoes + sign
  b.box('mat', '#3a3448', 10, 1.05, 1.0, 113, 0.525, -8.9); b.box('gls', '#e6e1d3', 10.2, 0.06, 1.15, 113, 1.08, -8.9); b.box('glo', '#ff3fb4', 10, 0.05, 0.02, 113, 0.9, -9.41); b.box('glo', '#38bdf8', 10, 0.05, 0.02, 113, 0.2, -9.41);
  b.box('mat', '#201e1d', 0.5, 0.16, 0.4, 111, 1.19, -8.8); b.box('glo', '#7cffd0', 0.32, 0.18, 0.01, 111, 1.38, -9.0, 0, 0.3); b.cyl('gls', '#c0c4cc', 0.05, 0.22, 114.5, 1.22, -8.8, 8);
  b.box('mat', '#3d2a1c', 10, 2.4, 0.6, 113, 1.2, -5.6); b.box('mat', '#1a120c', 9.9, 2.2, 0.02, 113, 1.25, -5.9);
  for (let i = 0; i <= 10; i++) b.box('mat', '#5a3d26', 0.04, 2.2, 0.06, 108 + i, 1.25, -5.91);
  for (let j = 0; j <= 6; j++) b.box('mat', '#5a3d26', 10, 0.04, 0.06, 113, 0.15 + j * 0.367, -5.91);
  for (let i = 0; i < 10; i++) for (let j = 0; j < 6; j++) { if (rnd() < 0.3) continue; const x = 108.5 + i, y = 0.2 + j * 0.367, c = rnd() < 0.5 ? '#c42d3c' : '#2e4a6b';
    for (const s of [-0.09, 0.09]) { b.box('mat', c, 0.13, 0.1, 0.26, x + s, y + 0.05, -5.98); b.box('mat', '#f3f2f2', 0.135, 0.025, 0.27, x + s, y + 0.012, -5.98); } }
  wallPlane(G, signTex('MERU LANES'), 4.4, 0.82, 113, 2.95, -5.89, Math.PI, true);
  box(108, 118, -9.45, -8.35); box(108, 118, -5.95, -5.25);
  for (const [x, z] of [[110, -20], [116, -20], [110, -13], [116, -13]]) pendant(b, x, z, 3.6, 9.6, '#ec3013');
  // snack bar on the south wall + high tables
  b.box('mat', '#3d2a1c', 16, 0.9, 0.6, 132, 0.45, 9.2); b.box('gls', '#e6e1d3', 16.1, 0.05, 0.65, 132, 0.92, 9.2);
  for (let x = 125; x <= 139; x += 0.35) b.cyl('gls', BALL[Math.floor(rnd() * 6)], 0.04, 0.14, x, 1.02, 9.25, 6);
  b.box('gls', '#c0c4cc', 1.2, 0.6, 0.5, 128, 1.25, 9.2); for (let k = 0; k < 4; k++) b.box('glo', BALL[k], 0.2, 0.25, 0.02, 127.55 + k * 0.3, 1.35, 8.94);
  for (const x of [126, 132, 138]) { b.box('mat', '#201e1d', 3.2, 1.4, 0.1, x, 3.0, 9.45); b.box('glo', '#fff6e0', 3.0, 1.2, 0.02, x, 3.0, 9.39); b.box('mat', '#201e1d', 2.8, 0.04, 0.03, x, 3.0, 9.37); }
  b.box('mat', '#c42d3c', 16, 1.05, 0.8, 132, 0.525, 7.4); b.box('gls', '#e6e1d3', 16.2, 0.06, 0.95, 132, 1.08, 7.4); b.box('glo', '#ffd23a', 16, 0.05, 0.02, 132, 0.95, 6.99);
  for (let x = 125; x <= 139; x += 2) { b.cyl('gls', '#c0c4cc', 0.04, 0.72, x, 0.36, 6.5, 6); b.cyl('mat', '#c42d3c', 0.22, 0.08, x, 0.76, 6.5, 12); b.cyl('mat', '#201e1d', 0.2, 0.03, x, 0.015, 6.5, 12); }
  box(124, 140, 6.95, 9.6);
  for (const [x, z] of [[112, 2], [118, 2], [112, 6.5], [118, 6.5], [127, 2], [135, 2]]) { b.cyl('gls', '#c0c4cc', 0.05, 1.0, x, 0.5, z, 6); b.cyl('mat', '#201e1d', 0.45, 0.04, x, 1.02, z, 16); b.cyl('mat', '#201e1d', 0.25, 0.03, x, 0.015, z, 12);
    for (const s of [-1, 1]) { b.cyl('gls', '#c0c4cc', 0.035, 0.7, x + s * 0.8, 0.35, z, 6); b.cyl('mat', '#c42d3c', 0.2, 0.06, x + s * 0.8, 0.72, z, 12); }
    ring(x, z, 0.55); pendant(b, x, z, 2.4, 9.6, '#201e1d'); }
  // two pool tables + the arcade row (east wall)
  for (const x of [133, 141]) { const z = -15; b.box('mat', '#3d2a1c', 2.7, 0.2, 1.55, x, 0.78, z); b.box('mat', '#1f6b45', 2.4, 0.02, 1.25, x, 0.885, z);
    for (const [w, d, ox, oz] of [[2.7, 0.15, 0, 0.7], [2.7, 0.15, 0, -0.7], [0.15, 1.55, 1.27, 0], [0.15, 1.55, -1.27, 0]]) b.box('mat', '#5a3d26', w, 0.08, d, x + ox, 0.92, z + oz);
    for (const [ox, oz] of [[1.15, 0.6], [-1.15, 0.6], [1.15, -0.6], [-1.15, -0.6]]) b.box('mat', '#2a1d14', 0.14, 0.7, 0.14, x + ox, 0.35, z + oz);
    for (let k = 0; k < 6; k++) b.sph('gls', k ? BALL[k] : '#f3f2f2', 0.028, x - 0.6 + rnd() * 1.2, 0.92, z - 0.4 + rnd() * 0.8, 1, 8);
    b.box('mat', '#c9a878', 1.45, 0.025, 0.025, x + 0.2, 0.92, z + 0.3, 0.2);
    b.box('gls', '#1f6b45', 1.8, 0.2, 0.4, x, 2.2, z); b.box('glo', '#fff1c8', 1.7, 0.02, 0.3, x, 2.09, z); for (const s of [-0.7, 0.7]) b.box('mat', '#201e1d', 0.012, 7.4, 0.012, x + s, 6.0, z);
    box(x - 1.4, x + 1.4, z - 0.8, z + 0.8); }
  for (let i = 0; i < 6; i++) { const z = -22 + i * 2.4, c = ['#2e4a6b', '#c42d3c', '#3a3448', '#ffd23a'][i % 4];
    b.box('mat', c, 0.9, 1.8, 0.8, 149.0, 0.9, z); b.box('mat', '#201e1d', 0.4, 0.12, 0.8, 148.4, 1.0, z); b.box('glo', ['#7cff9b', '#38bdf8', '#ff3fb4'][i % 3], 0.02, 0.5, 0.62, 148.54, 1.42, z, 0, 0, -0.15);
    b.box('glo', ['#ffd23a', '#ff3fb4', '#52e3ff'][i % 3], 0.02, 0.24, 0.7, 148.54, 1.94, z); b.sph('glo', '#ff3030', 0.03, 148.3, 1.08, z - 0.12, 1, 6); b.sph('glo', '#ffd23a', 0.03, 148.3, 1.08, z + 0.12, 1, 6);
    box(148.1, 149.6, z - 0.45, z + 0.45); }
  b.build(G);
  // DASH on lane one (the old bowler, unchanged): its frame T has "down the lane" = −z, so T is turned to run east
  const T = new THREE.Group(); T.position.set(132, 0, -32); T.rotation.y = -Math.PI / 2; G.add(T);
  const pg = pinGeo(THREE), pinMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0x666666 }), pins = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) { const p = new THREE.Mesh(pg, pinMat); p.position.set(-4 + (c - r / 2) * 0.32, 0.105, -10 - r * 0.28); T.add(p); pins.push(p); }
  let pinIM = null; { const im = new THREE.InstancedMesh(pg, pinMat, 50), m4 = new THREE.Matrix4(); let n = 0; pinIM = im;
    for (let i = 1; i < 6; i++) for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) im.setMatrixAt(n++, m4.makeTranslation(142 + r * 0.28, 0.105, LZ[i] + (c - r / 2) * 0.32)); G.add(im); }
  const bowler = createBowler({ THREE, T, makeFox: kit.makeFox, animFox: kit.animFox, M, toon, pins, lane: -4, audio: audio || (() => null) });
  // the people (positions only; names + lines unchanged)
  fox('lanesKeeper', { torso: '#c94c3a', outfit: 'vest' }, 113, -7.7, Math.PI);
  fox('lanesRegular', { torso: '#6b737b', outfit: 'coat' }, 122.2, -33.15, Math.PI / 2);
  fox('lanesRecord', { torso: '#ffc64a', outfit: 'vest' }, 116.9, -31.3, Math.PI / 2);
  fox('lanesRival', { torso: '#201e1d', outfit: 'armor' }, 122.3, -26.0, Math.PI / 2);
  // TENPIN is now the 3D game on lane 4 (worlds/meru2-bowling.js, mounted by the walk); the old 2D page minigames/meru/tenpin.html is kept
  const far = touch ? 60 : 120;
  function tick(dt, t, cam) { const on = !cam || Math.hypot(cam.x - 127.5, cam.z + 14) < far; G.visible = on; for (const f of npcs) kit.animFox(f, dt, 0, false); bowler.update(dt, on); }
  return { spots, npcs, tick, LZ, PAIRS, pinIM, pinGeo: pg };
}

export function buildCasinoArt({ THREE, scene, cols, touch }) {
  const { CT, Bin, flat, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const G = new THREE.Group(); scene.add(G); const b = Bin();
  const GOLD = '#c9a227';
  const carpet = CT(256, 256, (g, w) => { g.fillStyle = '#3b1424'; g.fillRect(0, 0, w, w); const t = 64;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx = i * t + t / 2, cy = j * t + t / 2; g.strokeStyle = '#c9a227'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 22, 0, 7); g.stroke();
      g.fillStyle = '#5b2a5e'; g.beginPath(); g.moveTo(cx, cy - 14); g.lineTo(cx + 14, cy); g.lineTo(cx, cy + 14); g.lineTo(cx - 14, cy); g.closePath(); g.fill(); g.fillStyle = '#c9a227'; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill();
      g.fillStyle = '#8f1d2c'; for (const [ox, oy] of [[0, 0], [t, 0], [0, t], [t, t]]) { g.beginPath(); g.arc(i * t + ox, j * t + oy, 6, 0, 7); g.fill(); } } });
  flat(G, carpet, 44.2, 63.2, -127.5, 0.05, 0, 3);
  b.box('mat', '#8f1d2c', 37, 0.012, 2.4, -123.5, 0.062, 0); for (const s of [-1, 1]) b.box('gls', GOLD, 37, 0.014, 0.08, -123.5, 0.064, s * 1.22);
  // glass partitions: brass posts + rails, an etched band
  for (const z of [-11, 11]) { b.box('glass', '#bfe6ff', 26, 2.6, 0.06, -131, 1.3, z); b.box('glass', '#ffffff', 26, 0.25, 0.07, -131, 1.4, z); for (const y of [0.05, 2.66]) b.box('gls', GOLD, 26, 0.1, 0.1, -131, y, z);
    for (let x = -144; x <= -118 + 0.01; x += 2.6) b.box('gls', GOLD, 0.08, 2.7, 0.08, x, 1.35, z); box(-144, -118, z - 0.1, z + 0.1); }
  b.box('glass', '#bfe6ff', 0.06, 2.6, 18, -142, 1.3, 0); b.box('glass', '#ffffff', 0.07, 0.25, 18, -142, 1.4, 0); for (const y of [0.05, 2.66]) b.box('gls', GOLD, 0.1, 0.1, 18, -142, y, 0);
  for (let z = -9; z <= 9.01; z += 2.25) b.box('gls', GOLD, 0.08, 2.7, 0.08, -142, 1.35, z); box(-142.1, -141.9, -9, 9);
  for (const z of [-11.2, 11.2]) { b.cyl('mat', '#e9e3d6', 0.35, 6.2, -117.4, 3.1, z, 16); b.box('gls', GOLD, 0.9, 0.3, 0.9, -117.4, 0.15, z); b.box('gls', GOLD, 0.9, 0.3, 0.9, -117.4, 6.35, z); ring(-117.4, z, 0.5); }
  // SLOTS (west wall): six cabinets with lit reels, button decks, toppers, stools
  const reel = CT(256, 184, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3; i++) { const x = 10 + i * 82; g.fillStyle = '#f3f2f2'; g.fillRect(x, 10, 74, h - 20);
      const sym = (k, y) => { if (k === 0) { g.fillStyle = '#ec3013'; g.font = '900 54px Archivo, Helvetica, sans-serif'; g.fillText('7', x + 22, y + 20); }
        else if (k === 1) { g.fillStyle = '#c42d3c'; g.beginPath(); g.arc(x + 28, y + 8, 11, 0, 7); g.arc(x + 48, y + 12, 11, 0, 7); g.fill(); g.strokeStyle = '#2e7d32'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 28, y - 3); g.quadraticCurveTo(x + 40, y - 26, x + 48, y + 1); g.stroke(); }
        else { g.fillStyle = '#201e1d'; g.fillRect(x + 10, y - 10, 54, 22); g.fillStyle = '#f3f2f2'; g.font = '800 16px Archivo, Helvetica, sans-serif'; g.fillText('BAR', x + 21, y + 7); } };
      sym((i + 1) % 3, 30); sym(i === 1 ? 0 : 0, h / 2 + 4); sym((i + 2) % 3, h - 22); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, 10, 74, 20); g.fillRect(x, h - 30, 74, 20); }
    g.fillStyle = '#ec3013'; g.fillRect(4, h / 2 - 2, w - 8, 3); });
  const reelI = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.72, 0.52), new THREE.MeshBasicMaterial({ map: reel }), 6); { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2), one = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < 6; i++) reelI.setMatrixAt(i, m4.compose(new THREE.Vector3(-148.49, 1.45, -7.5 + i * 3), q, one)); G.add(reelI); }
  b.box('mat', '#201e1d', 0.1, 3.2, 22, -149.55, 1.6, 0); b.box('gls', GOLD, 0.12, 0.06, 22, -149.55, 3.2, 0);
  for (let i = 0; i < 6; i++) { const z = -7.5 + i * 3, col = ['#ec3013', '#2e4a6b', '#ffc64a'][i % 3];
    b.box('mat', '#201e1d', 0.95, 0.8, 1.0, -148.95, 0.4, z); b.box('gls', col, 0.9, 1.1, 1.0, -149.0, 1.35, z); b.box('mat', '#111111', 0.05, 0.62, 0.82, -148.53, 1.45, z);
    b.box('mat', '#201e1d', 0.4, 0.08, 0.95, -148.4, 0.98, z, 0, 0, -0.2); ['#ff3030', '#ffd23a', '#38ff9b'].forEach((c, k) => b.box('glo', c, 0.08, 0.03, 0.12, -148.33, 1.01, z - 0.25 + k * 0.25));
    b.box('gls', '#c0c4cc', 0.25, 0.08, 0.6, -148.4, 0.62, z);
    b.box('mat', '#201e1d', 0.7, 0.55, 1.0, -149.05, 2.2, z); b.box('glo', i % 3 === 2 ? '#ffd23a' : '#ff3fb4', 0.02, 0.42, 0.88, -148.69, 2.2, z); b.cyl('glo', '#ff3030', 0.14, 0.2, -149.05, 2.58, z, 12);
    b.cyl('mat', '#7a2a3a', 0.26, 0.1, -147.2, 0.72, z, 14); b.cyl('gls', GOLD, 0.04, 0.7, -147.2, 0.35, z, 6); b.cyl('gls', GOLD, 0.25, 0.04, -147.2, 0.02, z, 14);
    box(-149.6, -148.2, z - 0.5, z + 0.5); }
  // POKER (north bay): racetrack tables, padded rail, felt, cards, chips, dealer tray, chairs, a low lamp over each
  for (const [x, z] of [[-137, -21], [-122, -22]]) {
    b.cyl('mat', '#201e1d', 0.4, 0.7, x, 0.35, z, 12); b.cyl('mat', '#201e1d', 0.9, 0.06, x, 0.03, z, 16);
    b.ecyl('mat', '#3d2a1c', 2.5, 1.7, 0.2, x, 0.83, z); b.ecyl('mat', '#1f6b45', 2.4, 1.6, 0.06, x, 0.96, z); b.etor('mat', '#201e1d', 2.45, 1.65, 0.05, x, 1.0, z, 2);
    b.ecyl('mat', '#2a7d55', 1.6, 0.9, 0.005, x, 0.992, z);
    for (let k = 0; k < 5; k++) b.box('gls', '#f3efe2', 0.1, 0.006, 0.14, x - 0.3 + k * 0.15, 0.996, z);
    b.box('gls', '#201e1d', 0.6, 0.05, 0.25, x, 1.0, z - 1.3); for (let k = 0; k < 6; k++) b.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e', '#201e1d', '#ffd23a'][k], 0.035, 0.04, x - 0.22 + k * 0.09, 1.04, z - 1.3, 8);
    for (let k = 0; k < 5; k++) { const a = Math.PI * 0.2 + k * Math.PI * 0.15, px = x + Math.cos(a) * 3.0, pz = z + Math.sin(a) * 2.05, ry = Math.atan2(x - px, z - pz);
      b.box('mat', '#7a2a3a', 0.55, 0.1, 0.55, px, 0.55, pz, ry); b.box('mat', '#7a2a3a', 0.55, 0.7, 0.08, px - Math.sin(ry) * 0.26, 0.95, pz - Math.cos(ry) * 0.26, ry);
      b.cyl('gls', GOLD, 0.04, 0.5, px, 0.25, pz, 6); b.cyl('gls', GOLD, 0.22, 0.03, px, 0.015, pz, 12); ring(px, pz, 0.3);
      const cx = x + Math.cos(a) * 1.85, cz = z + Math.sin(a) * 1.2; for (let s = 0; s < 3; s++) b.cyl('gls', ['#ec3013', '#2e4a6b', '#201e1d'][s], 0.04, 0.03 + rnd() * 0.08, cx + (s - 1) * 0.09, 1.03, cz, 8); }
    b.box('gls', '#201e1d', 2.6, 0.18, 1.0, x, 3.1, z); b.box('glo', '#ffe2a8', 2.4, 0.02, 0.85, x, 3.0, z); for (const s of [-1, 1]) b.box('mat', '#201e1d', 0.012, 10.4, 0.012, x + s * 1.1, 8.4, z); }
  // WHEEL (south bay): backboard ring of bulbs, gold rim + pegs, pointer, stage, betting table
  const wt = CT(256, 256, (g, w) => { const cx = w / 2, n = 16; for (let i = 0; i < n; i++) { g.fillStyle = i === 0 ? '#ffc64a' : i % 2 ? '#ec3013' : '#f3f2f2'; g.beginPath(); g.moveTo(cx, cx); g.arc(cx, cx, cx, i / n * 6.283, (i + 1) / n * 6.283); g.fill(); }
    g.strokeStyle = '#c9a227'; g.lineWidth = 3; for (let i = 0; i < n; i++) { const a = i / n * 6.283; g.beginPath(); g.moveTo(cx, cx); g.lineTo(cx + Math.cos(a) * cx, cx + Math.sin(a) * cx); g.stroke(); }
    g.fillStyle = '#201e1d'; g.beginPath(); g.arc(cx, cx, cx * 0.2, 0, 7); g.fill(); g.fillStyle = '#c9a227'; g.beginPath(); g.arc(cx, cx, cx * 0.1, 0, 7); g.fill(); });
  const wheel = new THREE.Group(); wheel.position.set(-118, 3.0, 26); G.add(wheel);
  { const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.2, 40), [new THREE.MeshLambertMaterial({ color: 0x3d2a1c }), new THREE.MeshBasicMaterial({ map: wt }), new THREE.MeshLambertMaterial({ color: 0x3d2a1c })]); disc.rotation.x = Math.PI / 2; wheel.add(disc);
    const w2 = Bin(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; w2.cyl('gls', GOLD, 0.025, 0.14, Math.cos(a) * 2.08, Math.sin(a) * 2.08, -0.16, 6, Math.PI / 2); } w2.tor('gls', GOLD, 2.22, 0.03, 0, 0, -0.1); w2.build(wheel); }
  b.cyl('mat', '#5e1f2c', 2.7, 0.1, -118, 3.0, 26.2, 32, Math.PI / 2); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; b.sph('glo', i % 2 ? '#fff1c8' : '#ffd23a', 0.07, -118 + Math.cos(a) * 2.5, 3.0 + Math.sin(a) * 2.5, 26.12, 1, 6); }
  b.box('gls', GOLD, 0.3, 0.45, 0.1, -118, 5.35, 25.85); b.cyl('gls', GOLD, 0.16, 0.12, -118, 5.05, 25.85, 3, Math.PI / 2);
  b.box('mat', '#3d2a1c', 0.4, 3, 0.4, -118, 1.5, 26.45); b.box('mat', '#3d2a1c', 6, 0.3, 3, -118, 0.15, 26.6); b.box('gls', GOLD, 6.04, 0.05, 3.04, -118, 0.31, 26.6);
  b.box('mat', '#3d2a1c', 4, 0.88, 1.1, -118, 0.44, 24.4); b.box('mat', '#1f6b45', 3.9, 0.04, 1.0, -118, 0.9, 24.4); b.box('gls', GOLD, 4.04, 0.04, 1.14, -118, 0.89, 24.4);
  for (let i = 0; i < 8; i++) b.box('mat', i % 2 ? '#ec3013' : '#f3f2f2', 0.42, 0.006, 0.36, -119.6 + i * 0.46, 0.925, 24.3);
  box(-120.6, -115.4, 23.8, 27.4);
  // CASHIER cage (south-west): marble counter, brass bars, lit header, chip racks behind
  b.box('mat', '#3d2a1c', 8, 1.1, 0.8, -140, 0.55, 22); b.box('gls', '#e9e3d6', 8.2, 0.06, 0.95, -140, 1.13, 22);
  for (let x = -143.8; x <= -136.2; x += 0.4) b.box('gls', GOLD, 0.04, 1.65, 0.04, x, 1.98, 22); b.box('mat', '#201e1d', 8.2, 0.5, 1.0, -140, 3.05, 22); b.box('gls', GOLD, 8.24, 0.06, 1.04, -140, 2.8, 22); b.box('glo', '#ffe2a8', 7.8, 0.02, 0.8, -140, 2.79, 22.05);
  b.box('mat', '#201e1d', 6, 1.0, 0.4, -140, 0.5, 24.6); for (let i = 0; i < 24; i++) b.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e'][i % 4], 0.05, 0.2 + (i % 3) * 0.06, -142.6 + i * 0.22, 1.1 + (i % 3) * 0.03, 24.6, 8);
  box(-144, -136, 21.6, 22.4); box(-143, -137, 24.4, 24.8);
  // casino CEILING (after 6b, Ben noted the dark empty 14 m shell): coffered plum ceiling at 9 m with gold beams, a recessed glow dot in every coffer,
  // a gold-rimmed oval light well over each chandelier; the chandelier drops now hang from it.
  { const CY = 9, x0 = -149.6, x1 = -105.4, z0 = -31.6, z1 = 31.6, cx = (x0 + x1) / 2;
    b.box('mat', '#2a1020', x1 - x0, 0.2, z1 - z0, cx, CY + 0.1, 0);
    for (let x = x0 + 4.4; x < x1 - 1; x += 4.42) b.box('gls', GOLD, 0.22, 0.32, z1 - z0, x, CY - 0.16, 0);
    for (let z = z0 + 4.5; z < z1 - 1; z += 4.51) b.box('gls', GOLD, x1 - x0, 0.32, 0.22, cx, CY - 0.16, z);
    for (let x = x0 + 2.2; x < x1; x += 4.42) for (let z = z0 + 2.25; z < z1; z += 4.51) { if (Math.abs(z) < 4 && [-135, -124, -113].some(q => Math.abs(q - x) < 3)) continue; b.box('mat', '#3b1730', 3.2, 0.06, 3.2, x, CY - 0.03, z); b.sph('glo', '#fff1c8', 0.12, x, CY - 0.08, z); }
    for (const x of [-135, -124, -113]) { b.cyl('glo', '#ffe7b0', 3.2, 0.04, x, CY - 0.04, 0, 28); b.tor('gls', GOLD, 3.25, 0.08, x, CY - 0.08, 0, Math.PI / 2); b.tor('gls', GOLD, 2.6, 0.05, x, CY - 0.08, 0, Math.PI / 2); }
    b.box('gls', GOLD, x1 - x0, 0.4, 0.3, cx, CY - 0.2, z0 + 0.15); b.box('gls', GOLD, x1 - x0, 0.4, 0.3, cx, CY - 0.2, z1 - 0.15); b.box('gls', GOLD, 0.3, 0.4, z1 - z0, x0 + 0.15, CY - 0.2, 0); b.box('gls', GOLD, 0.3, 0.4, z1 - z0, x1 - 0.15, CY - 0.2, 0); }
  // three crystal chandeliers down the centre aisle + the pink neon round the hall
  for (const x of [-135, -124, -113]) { const y = 7.5; b.sph('gls', GOLD, 0.25, x, y, 0); b.box('gls', GOLD, 0.03, 9 - y, 0.03, x, (9 + y) / 2, 0);
    for (const [R, yy, n] of [[1.1, y - 0.2, 16], [0.7, y - 0.5, 10]]) { b.tor('gls', GOLD, R, 0.035, x, yy, 0, Math.PI / 2);
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, px = x + Math.cos(a) * R, pz = Math.sin(a) * R; b.oct('glass', '#ffffff', 0.07, px, yy - 0.2, pz, 2.2); b.sph('glo', '#fff1c8', 0.06, px, yy + 0.08, pz, 1.3, 6); } }
    b.oct('glass', '#ffffff', 0.18, x, y - 0.9, 0, 2.4); }
  for (const [w, d, x, z] of [[44, 0.1, -127.5, -31.4], [44, 0.1, -127.5, 31.4], [0.1, 62, -149.4, 0]]) b.box('glo', '#ff3fb4', w, 0.18, d, x, 6.2, z);
  b.build(G);
  const far = touch ? 70 : 130;
  function tick(dt, t, P) { if (P) G.visible = Math.hypot(P.x + 127.5, P.z) < far; wheel.rotation.z += dt * 0.4; }
  return { tick };
}
