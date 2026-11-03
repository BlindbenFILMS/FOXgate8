// MERU 2.0 — step 10 ART PASS 6b: MERU LANES [meruBowling] (redesigned) + CASINO [meruCasino] (dressing).
// LANES (f 105..150 × -38..10, door W at z -14): 6 maple lanes running east (foul line x 126.55, head pin x 142), gutters, cappings,
// kickbacks, pit, a lit masking unit, ball returns, overhead score screens, red vinyl settees, ball racks, the shoe desk (Mott),
// a diner snack bar, high tables and an arcade corner (Marsh Blaster, Claw Crane). DASH bowls lane one on a loop (worlds/meru-bowler.js, unchanged).
// CASINO (f -150..-105 × -32..32, door E at z 0): keeps the three sound bays (slots W, poker N, wheel S) + cashier; spots + people stay in meru2-rooms.js.
import { makeRoomKit } from './meru2-roomkit.js';
import { createBowler } from './meru-bowler.js?v=s645';
import { applyPose, endPose, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';
// s616 LANES + DINER LIFE (Ben): the existing Meru Lanes people loop jointed job moves while you are nearby (no new graphics)
const LANE_JOBS = { lanesKeeper: ['shoe_desk', 'bar_wipe'], lanesRegular: ['ball_polish', 'lane_watch'], lanesRecord: ['lane_watch', 'ball_polish'], lanesRival: ['rival_stare'], dinerCook: ['grill_flip'], dinerServer: ['take_order', 'bar_wipe'] };
import { pinballSet } from './pinball-lite.js';
import { loadCab, gameSkins, buildCabinet, cabBackOffset } from './arcade-cabinet.js';
const pinGeo = THREE => { const pts = [[0, 0], [0.026, 0], [0.05, 0.05], [0.06, 0.1], [0.058, 0.16], [0.04, 0.22], [0.022, 0.27], [0.024, 0.31], [0.03, 0.34], [0.022, 0.375], [0, 0.38]].map(([r, y]) => new THREE.Vector2(r, y));
  const g = new THREE.LatheGeometry(pts, 12), p = g.attributes.position, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), red = (y > 0.24 && y < 0.255) || (y > 0.262 && y < 0.278); c[i * 3] = red ? 0.85 : 0.97; c[i * 3 + 1] = red ? 0.12 : 0.97; c[i * 3 + 2] = red ? 0.15 : 0.96; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); g.computeVertexNormals(); return g; };

export const LANES_LAYOUT_KEY = 'meru2.lanesLayout';
export const LANES_LAYOUT_DEFAULT = {dance: {x: 131.4, z: -8.75, a: 0}, cabs: [{game: 'MARSH BLASTER', x: 149.23, z: -6.09, a: 270}, {game: 'HUMAN COMBAT', x: 105.77, z: -25, a: 90}, {game: 'TANK RANGE', x: 105.77, z: -27.25, a: 90}, {game: 'SUBMARINE', x: 105.77, z: -29.5, a: 90}, {game: 'SURF', x: 149.23, z: -3.13, a: 270}, {game: 'DUSTY GULCH', x: 149.23, z: -7.65, a: 270}, {game: 'MARSH BLASTER', x: 105.77, z: -31.75, a: 90}, {game: 'HUMAN COMBAT', x: 105.77, z: -34, a: 90}], pins: [{x: 106.3, z: -21, a: 90}, {x: 106.3, z: -18.2, a: 90}, {x: 148.7, z: -9.13, a: 270}, {x: 148.7, z: -4.61, a: 270}], claws: [{x: 110.5, z: -37, a: 0}, {x: 149, z: -1.3, a: 270}]};   // Ben's layout from the workshop, backs squared to the walls
export function lanesLayout() { const D = JSON.parse(JSON.stringify(LANES_LAYOUT_DEFAULT)); try { const s = JSON.parse(localStorage.getItem(LANES_LAYOUT_KEY) || 'null'); if (s && typeof s === 'object') for (const k of Object.keys(D)) if (s[k]) D[k] = s[k]; } catch (e) {} return D; }
export function buildLanes2({ THREE, scene, kit, cols, touch, M, toon, grad, audio }) {
  const { CT, Bin, flat, wallPlane, signTex, pendant, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const G = new THREE.Group(); scene.add(G); const b = Bin(), npcs = [], spots = [];
  const laneJobs = [];
  const fox = (key, opt, x, z, ry) => { const jl = (LANE_JOBS[key] || []).filter(k => FOX_ANIMS[k]); const f = kit.makeFox({ key, ...opt, ...(jl.length ? { joints: true } : {}) }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); npcs.push(f); if (jl.length) laneJobs.push({ f, list: jl, i: Math.floor(Math.random() * jl.length), t: Math.random() * 2, on: false, k: 0 }); return f; };
  const LW = 2, LZ = [-36, -32.2, -28.4, -24.6, -20.8, -17], FOUL = 126.55, LEND = 143, AX = 122.5, ZC = -26.5,   // Ben: lanes TWICE as wide (LW = 2)
   PS = 1.5, PAIRS = [0, 1, 2].map(k => (LZ[2 * k] + LZ[2 * k + 1]) / 2);
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
  { const lg = new THREE.PlaneGeometry(20.5, 1.07 * LW).rotateX(-Math.PI / 2).translate(AX + 10.25, 0, 0), lm = new THREE.InstancedMesh(lg, new THREE.MeshPhongMaterial({ map: laneTex, shininess: 90, specular: 0x555555 }), 6);
    const m4 = new THREE.Matrix4(); LZ.forEach((z, i) => lm.setMatrixAt(i, m4.makeTranslation(0, 0.105, z))); if (!touch) lm.receiveShadow = true; G.add(lm); }
  b.box('mat', '#d9b27a', FOUL - AX, 0.1, 22.9, (AX + FOUL) / 2, 0.05, ZC);
  const caps = [LZ[0] - 0.95 * LW, ...LZ.slice(1).map((z, i) => (z + LZ[i]) / 2), LZ[5] + 0.95 * LW];
  for (const z of LZ) for (const s of [-1, 1]) b.box('gls', '#26243a', LEND - FOUL, 0.06, 0.24 * LW, (FOUL + LEND) / 2, 0.06, z + s * 0.655 * LW);
  for (const z of caps) { b.box('mat', '#3a3448', LEND - FOUL, 0.16, 0.35, (FOUL + LEND) / 2, 0.08, z); b.box('mat', '#201e1d', 3.4, 0.8, 0.1, 141.6, 0.4, z); b.box('glo', '#52e3ff', 0.04, 0.04, 0.35, FOUL + 0.02, 0.17, z); }
  b.box('mat', '#0d0d12', 1.6, 0.04, 22.9, 143.8, 0.02, ZC); b.box('mat', '#0d0d12', 0.1, 1.3, 22.9, 144.6, 0.65, ZC);
  // masking unit over the pin decks + the pinsetter wall behind
  const maskTex = CT(1024, 160, (g, w, h) => { g.fillStyle = '#141838'; g.fillRect(0, 0, w, h); const seg = w / 6;
    for (let i = 0; i < 6; i++) { const x = i * seg, c = ['#ff3fb4', '#38bdf8', '#ffd23a'][i % 3]; g.fillStyle = c; g.fillRect(x + 6, 10, seg - 12, 6); g.fillRect(x + 6, h - 16, seg - 12, 6);
      g.fillStyle = '#f3f2f2'; for (let k = -1; k <= 1; k++) { const px = x + seg / 2 + k * 30, py = h / 2 + 6; g.beginPath(); g.ellipse(px, py + 14, 10, 22, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(px, py - 18, 6, 9, 0, 0, 7); g.fill(); g.fillStyle = '#ec3013'; g.fillRect(px - 6, py - 6, 12, 4); g.fillStyle = '#f3f2f2'; }
      g.fillStyle = c; g.font = '800 22px Archivo, Helvetica, sans-serif'; g.fillText(String(i + 1), x + 14, 44); } });
  wallPlane(G, maskTex, 22.9, 1.9, 140.98, 2.25, ZC, -Math.PI / 2, true);
  b.box('mat', '#201e1d', 0.3, 2.0, 23.1, 141.2, 2.25, ZC); b.box('glo', '#52e3ff', 0.1, 0.06, 22.9, 140.85, 1.27, ZC); b.box('mat', '#15131f', 0.2, 4.4, 23.1, 141.3, 5.45, ZC);
  // s114: the solid pinsetter block (x 144.9..149.5) became the walk-in BACK ROOM (worlds/meru2-lanes-jobs.js)
  // side wall between the lanes and the café floor, neon on top
  b.box('mat', '#201e1d', 18.25, 1.1, 0.2, 135.575, 0.55, -15.0); b.box('glo', '#ff3fb4', 18.25, 0.05, 0.22, 135.575, 1.12, -15.0);   // s114: stops at the back room (its own wall + STAFF gate)
  box(126.45, 144.75, -37.6, -14.9);
  // trusses with downlights + neon over the lanes; score screens hung over the foul line
  for (const x of [127.2, 133, 138.6]) { b.box('gls', '#2a2a33', 0.25, 0.25, 23.1, x, 4.4, ZC); b.box('glo', '#fff1c8', 0.1, 0.04, 22.4, x, 4.26, ZC); b.box('glo', x === 133 ? '#38bdf8' : '#ff3fb4', 0.04, 0.1, 23.1, x - 0.14, 4.4, ZC);
    for (const z of [ZC - 10.5, ZC, ZC + 10.5]) b.box('mat', '#201e1d', 0.03, 2.6, 0.03, x, 5.8, z); }
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
  for (const [z0, z1] of [[-36.8, -32.6], [-30.0, -25.8], [-23.0, -18.8]]) { const zc = (z0 + z1) / 2, L = z1 - z0; b.box('mat', '#201e1d', 0.8, 0.12, L, 115.8, 0.06, zc); for (const z of [z0, z1]) b.box('mat', '#3a3448', 0.8, 1.35, 0.08, 115.8, 0.68, z);
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
  // Ben: the snack bar's windows became a BOWLING ALLEY DINER wall (checker backsplash, chrome rail, menu boards, MERU LANES DINER neon). Menu + prices DRAFT
  const diner = CT(1024, 224, (g, w, h) => { g.fillStyle = '#f3ead8'; g.fillRect(0, 0, w, h); const t = 16;
    for (let x = 0; x < w; x += t) for (let y = h - 48; y < h; y += t) { g.fillStyle = ((x + y) / t) % 2 ? '#201e1d' : '#f3f2f2'; g.fillRect(x, y, t, t); }
    g.fillStyle = '#c0c4cc'; g.fillRect(0, h - 56, w, 8); g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, 14); g.fillStyle = '#38bdf8'; g.fillRect(0, 14, w, 5);
    const board = (x0, title, rows) => { g.fillStyle = '#14181c'; g.fillRect(x0, 34, 250, 122); g.strokeStyle = '#c0c4cc'; g.lineWidth = 4; g.strokeRect(x0, 34, 250, 122); g.textBaseline = 'middle'; g.textAlign = 'left';
      g.fillStyle = '#ffd23a'; g.font = '900 22px Archivo, sans-serif'; g.fillText(title, x0 + 14, 54); rows.forEach(([n, p], i) => { g.fillStyle = '#f3f2f2'; g.font = '700 17px Archivo, sans-serif'; g.fillText(n, x0 + 14, 82 + i * 24); g.textAlign = 'right'; g.fillStyle = '#ffd23a'; g.fillText(p, x0 + 236, 82 + i * 24); g.textAlign = 'left'; }); };
    board(24, 'GRILL', [['PIN BURGER', '6g'], ['STRIKE DOG', '4g'], ['SPARE FRIES', '3g']]); board(750, 'SODA FOUNTAIN', [['SODA', '2g'], ['SHAKE', '3g'], ['ROOT FLOAT', '3g']]);
    g.fillStyle = '#201e1d'; g.fillRect(300, 34, 424, 122); g.strokeStyle = '#ff3fb4'; g.lineWidth = 5; g.strokeRect(306, 40, 412, 110);
    g.fillStyle = '#ff3fb4'; g.font = '900 44px Archivo, sans-serif'; g.fillText('MERU LANES', 330, 78); g.fillStyle = '#52e3ff'; g.font = '900 40px Archivo, sans-serif'; g.fillText('DINER', 330, 124);
    g.fillStyle = '#f3f2f2'; for (const [px, sc] of [[622, 1], [664, 0.85]]) { g.beginPath(); g.ellipse(px, 112, 13 * sc, 30 * sc, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(px, 72, 8 * sc, 12 * sc, 0, 0, 7); g.fill(); g.fillStyle = '#ec3013'; g.fillRect(px - 8 * sc, 86, 16 * sc, 5); g.fillStyle = '#f3f2f2'; } });
  wallPlane(G, diner, 16, 3.5, 132, 2.7, 9.56, Math.PI, true);
  b.box('gls', '#c0c4cc', 16.1, 0.06, 0.06, 132, 0.96, 9.52); b.box('gls', '#c0c4cc', 16.1, 0.08, 0.08, 132, 4.46, 9.52);
  for (const x of [124.6, 139.4]) b.box('glo', '#ff3fb4', 0.06, 3.5, 0.06, x, 2.7, 9.5);
  b.box('mat', '#c42d3c', 16, 1.05, 0.8, 132, 0.525, 7.4); b.box('gls', '#e6e1d3', 16.2, 0.06, 0.95, 132, 1.08, 7.4); b.box('glo', '#ffd23a', 16, 0.05, 0.02, 132, 0.95, 6.99);
  for (let x = 125; x <= 139; x += 2) { b.cyl('gls', '#c0c4cc', 0.04, 0.72, x, 0.36, 6.5, 6); b.cyl('mat', '#c42d3c', 0.22, 0.08, x, 0.76, 6.5, 12); b.cyl('mat', '#201e1d', 0.2, 0.03, x, 0.015, 6.5, 12); }
  box(124, 140, 6.95, 9.6);
  for (const [x, z] of [[112, 2], [118, 2], [112, 6.5], [118, 6.5], [127, 2], [135, 2]]) { b.cyl('gls', '#c0c4cc', 0.05, 1.0, x, 0.5, z, 6); b.cyl('mat', '#201e1d', 0.45, 0.04, x, 1.02, z, 16); b.cyl('mat', '#201e1d', 0.25, 0.03, x, 0.015, z, 12);
    for (const s of [-1, 1]) { b.cyl('gls', '#c0c4cc', 0.035, 0.7, x + s * 0.8, 0.35, z, 6); b.cyl('mat', '#c42d3c', 0.2, 0.06, x + s * 0.8, 0.72, z, 12); }
    ring(x, z, 0.55); pendant(b, x, z, 2.4, 9.6, '#201e1d'); }
  // Ben: pool tables taken out of Meru Lanes. s34: the old blank arcade row on the east wall (z 1.6..4.8) is gone: the BACK DOOR is there now (meru2-layout BACK_DOORS).
  // ===== ARCADE CORNER (Ben): the real 3D arcade games, each with its cabinet / booth, open in the panel =====
  const PLAY = (label, url, x, z, r = 1.3) => spots.push({ key: label, x, z, r, prompt: 'PLAY \u00b7 ' + label, play: { label, url } });
  // ARCADE LAYOUT (Ben: "move them myself"): every machine's centre (x, z) + facing a in degrees (0 = faces south / the café, 90 = east,
  // 180 = north, 270 = west). Edited in Lanes Arcade Workshop.dc.html (saved to localStorage 'meru2.lanesLayout'); these are the defaults.
  const LAYOUT = lanesLayout();
  const dirOf = a => [Math.sin(a * Math.PI / 180), Math.cos(a * Math.PI / 180)];
  const boxR = (cx, cz, a, hw, hd) => { const r = a * Math.PI / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r)), ex = hw * c + hd * s, ez = hw * s + hd * c; box(cx - ex, cx + ex, cz - ez, cz + ez); };
  const toW = (cx, cz, a, lx, lz) => { const r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [cx + lx * c + lz * s, cz - lx * s + lz * c]; };
  // Ben: the Shooting Gallery booth was taken out (the game files stay: Shooting Gallery.dc.html)
  // FOX DANCE x2 (Ben): a free-standing island in the open floor you can walk all the way round; two machines BACK TO BACK sharing one
  // double-sided screen tower. Each side: FOX DANCE screen + equaliser, two light-up 4-arrow pads, safety bars, tower speakers, neon floor ring
  const PLAY2 = (key, label, url, x, z, r) => spots.push({ key, x, z, r, prompt: 'PLAY \u00b7 ' + label, play: { label, url } });
  const ARC_D = [], DL = LAYOUT.dance, DX = 0, DZ = 0, DG = new THREE.Group(); DG.position.set(DL.x, 0, DL.z); DG.rotation.y = DL.a * Math.PI / 180; G.add(DG);
  { const b = Bin(), box = () => {}, DSCR = {}; const AR = ['#ff3d9a', '#2ee6ff', '#ffd23a', '#7cff6b'];
    const fd = CT(512, 256, (g, w, h) => { g.fillStyle = '#120c22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2ee6ff'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#ffffff'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('FOX DANCE', 24, 52); g.fillStyle = '#ffd23a'; g.font = '800 20px Archivo, sans-serif'; g.fillText('TAP START \u00b7 UP TO 5 DANCERS', 26, 96);
      for (let i = 0; i < 22; i++) { const bh = 20 + ((i * 37) % 90); g.fillStyle = AR[i % 4]; g.fillRect(28 + i * 21, h - 24 - bh, 15, bh); } });
    const pad = CT(256, 256, (g, w) => { g.fillStyle = '#1d1336'; g.fillRect(0, 0, w, w); const c = w / 3, ar = (cx, cy, r, col) => { g.save(); g.translate(cx, cy); g.rotate(r); g.fillStyle = col; g.beginPath(); g.moveTo(0, -30); g.lineTo(26, 4); g.lineTo(10, 4); g.lineTo(10, 30); g.lineTo(-10, 30); g.lineTo(-10, 4); g.lineTo(-26, 4); g.closePath(); g.fill(); g.restore(); };
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { g.fillStyle = (i + j) % 2 ? '#2a1b4a' : '#221640'; g.fillRect(i * c + 3, j * c + 3, c - 6, c - 6); }
      ar(c * 0.5, c * 1.5, -Math.PI / 2, AR[0]); ar(c * 1.5, c * 2.5, Math.PI, AR[1]); ar(c * 1.5, c * 0.5, 0, AR[2]); ar(c * 2.5, c * 1.5, Math.PI / 2, AR[3]); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c * 1.5, c * 1.5, 10, 0, 7); g.fill(); });
    b.box('mat', '#201e1d', 0.5, 4.2, 3.8, DX, 2.1, DZ); b.box('glo', '#ff3d9a', 0.54, 0.05, 3.8, DX, 4.2, DZ); box(DX - 0.3, DX + 0.3, DZ - 1.95, DZ + 1.95);
    for (const sd of [-1, 1]) { const xs = DX + sd * 0.26, xp = DX + sd * 2.0, xb = DX + sd * 1.2, ry = sd < 0 ? -Math.PI / 2 : Math.PI / 2;
      DSCR[sd] = wallPlane(DG, fd, 3.4, 1.8, xs + sd * 0.01, 2.6, DZ, ry, true); b.box('glo', '#ff3d9a', 0.04, 0.05, 3.6, xs + sd * 0.02, 1.58, DZ);
      for (const oz of [-0.85, 0.85]) { const z = DZ + oz; b.box('mat', '#2a1b4a', 1.5, 0.12, 1.5, xp, 0.06, z); b.box('glo', AR[oz < 0 ? 0 : 1], 1.54, 0.02, 1.54, xp, 0.13, z);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(1.38, 1.38).rotateX(-Math.PI / 2).rotateY(sd < 0 ? -Math.PI / 2 : Math.PI / 2), new THREE.MeshBasicMaterial({ map: pad })); m.position.set(xp, 0.146, z); DG.add(m);
        b.box('gls', '#c0c4cc', 0.04, 1.0, 0.04, xb, 0.5, z - 0.7); b.box('gls', '#c0c4cc', 0.04, 1.0, 0.04, xb, 0.5, z + 0.7); b.box('gls', '#c0c4cc', 0.04, 0.04, 1.44, xb, 1.0, z); }
      for (const z of [DZ - 2.25, DZ + 2.25]) { const x = DX + sd * 0.6; b.box('mat', '#151320', 0.6, 2.2, 0.6, x, 1.1, z); for (const y of [0.55, 1.35]) { b.cyl('mat', '#2a2838', 0.22, 0.04, x + sd * 0.3, y, z, 16, 0, Math.PI / 2); b.cyl('glo', AR[y > 1 ? 2 : 3], 0.07, 0.045, x + sd * 0.31, y, z, 12, 0, Math.PI / 2); } box(x - 0.3, x + 0.3, z - 0.3, z + 0.3); }
      b.tor('glo', AR[sd < 0 ? 0 : 1], 2.1, 0.025, xp, 0.03, DZ, Math.PI / 2); }
    b.build(DG); boxR(DL.x, DL.z, DL.a, 0.3, 1.95); for (const sd of [-1, 1]) for (const zz of [-2.25, 2.25]) { const [wx, wz] = toW(DL.x, DL.z, DL.a, sd * 0.6, zz); boxR(wx, wz, DL.a, 0.3, 0.3); }
    // s631 (Ben: "we made dance animations FOR the arcade"): one jointed DANCER on the far pad of each machine side, doing the FOX DANCE
    // MACHINE moves (fox-poses 'dancepad'); they hop off (hide) whenever you come within 4.5 m of that side, so they never stand in your way
    for (const sd of [-1, 1]) { const d = kit.makeFox({ joints: true, key: 'arcDancer' + (sd > 0 ? 2 : 1), torso: sd > 0 ? ['#a78bfa', '#ede9fe', '#5b21b6'] : ['#22c55e', '#ecfccb', '#3f6212'], outfit: sd > 0 ? 'dress' : 'vest', female: sd > 0, mood: 'happy' }); d.position.set(DX + sd * 2.0, 0.12, DZ + 0.85); d.rotation.y = sd < 0 ? Math.PI / 2 : -Math.PI / 2; DG.add(d); ARC_D.push({ f: d, sd, t: Math.random() * 6, k: 0 }); }
    for (const [k, sd] of [['FOX DANCE', -1], ['FOX DANCE 2', 1]]) { const [wx, wz] = toW(DL.x, DL.z, DL.a, sd * 3.6, 0); PLAY2(k, 'FOX DANCE', 'Fox%20Arcade.html?embed=1&game=dance', wx, wz, 1.8); spots[spots.length - 1].dance = { group: DG, side: sd, screen: DSCR[sd] }; /* s101: FOX DANCE plays IN WORLD on this side (minigames/arcade/fox-dance.js) */ } }
  const danceAt = (lx, lz) => toW(DL.x, DL.z, DL.a, lx, lz);
  // MARSH BLASTER (Marsh Blaster.dc.html): two purple + gold light-gun cabinets (the game's own buildCabinet look), marsh sunset screen, MARSH BLASTER marquee, orange gun
  // the light-gun cabinets: one shared model (worlds/arcade-cabinet.js), tuned in Arcade Cabinet Workshop.dc.html
  const CABCFG = loadCab(), SKINS = gameSkins(CT);
  const ARCADE_AT = [], GBY = Object.fromEntries(SKINS.map(g => [g.name, g])), BO = cabBackOffset(CABCFG);
  LAYOUT.cabs.forEach((c, i) => { const sk = GBY[c.game === 'SHOOTING GALLERY' ? 'DUSTY GULCH' : c.game] || SKINS[0], name = sk.name, url = sk.url, [fx, fz] = dirOf(c.a), bx = c.x - fx * BO, bz = c.z - fz * BO;
    const CR = buildCabinet({ b, wallPlane, G, box }, CABCFG, bx, bz, c.a * Math.PI / 180 + Math.PI / 2, sk), [sx, sz] = CR; ARCADE_AT.push([sx, sz, c.a]); const key = 'ARCADE ' + name + ' ' + (i + 1);
    if (url) { PLAY2(key, name, url, sx, sz, 1.0); spots[spots.length - 1].cab = { name, url, skin: sk, screen: CR.screen }; } else spots.push({ key, x: sx, z: sz, r: 1.0, prompt: name + ' \u00b7 COMING SOON' }); });
  // 4 PINBALL machines (minigames/arcade/pinball-machine.js, the same table as pinball.dc.html), backboxes to the lane wall
  const PB = pinballSet({ THREE, toon, M, grad }, LAYOUT.pins.map(p => ({ x: p.x, z: p.z, rotY: p.a * Math.PI / 180 })), { touch }); G.add(PB.group); LAYOUT.pins.forEach(p => boxR(p.x, p.z, p.a, 0.6, 1.2)); const pinballs = PB.items;   // light version: shared art, merged parts, far box
  pinballs.forEach(pb => { pb.group.scale.x = 1.3; });   // Ben s100: wider machines (the clone + the in-world table both live in this group)
  pinballs.forEach((pb, i) => { PLAY2('PINBALL ' + (i + 1), 'PINBALL', 'pinball.dc.html?embed=1', pb.standAt.x, pb.standAt.z + 0.3, 0.8);   // s100: the same cabinet menu on the backglass
    let scr = null; pb.near.traverse(o => { const t = o.isMesh && o.material && o.material.map; if (!scr && t && t.image && t.image.width === 1024 && t.image.height === 768) scr = o; });
    if (scr) spots[spots.length - 1].cab = { name: 'PINBALL', url: 'pinball.dc.html?embed=1', standSpot: true, screen: scr, pb, inworld: true, skin: { name: 'PINBALL', body: '#201a3a', acc: '#ff4fd8', scr: ['#3a1d7a', '#1a1040', '#ff4fd8'] } }; });
  // CLAW CRANE (Arcade Claw Crane.dc.html): blue + pink glass cabinets, bulb marquee, gold gantry + claw, a pile of plush creatures, fox heroes and monster truck minis
  const ccMq = CT(256, 64, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; let fs = 34; g.font = '900 34px Archivo, sans-serif'; while (fs > 12 && g.measureText('CLAW CRANE').width > w - 28) { fs--; g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText('CLAW CRANE', w / 2, 34); });
  const PL = ['#f472b6', '#7dd3fc', '#a78bfa', '#facc15', '#22c55e', '#f97316', '#ec3013', '#f3f2f2'];
  LAYOUT.claws.forEach((cl, ci) => { const body = ['#38bdf8', '#f472b6'][ci % 2], z = 0, x = 0, CS = 1.33, bb = Bin(), gg = new THREE.Group(); gg.scale.setScalar(CS); gg.position.set(cl.x, 0, cl.z); gg.rotation.y = cl.a * Math.PI / 180 + Math.PI / 2; G.add(gg);   // Ben: claw cranes +33%
    bb.box('mat', body, 1.3, 0.95, 1.3, x, 0.475, z); bb.box('glo', '#ffd23a', 0.02, 0.05, 1.2, x - 0.66, 0.9, z); bb.box('mat', '#201e1d', 0.02, 0.32, 0.36, x - 0.66, 0.42, z + 0.3); bb.box('glo', '#7cff9b', 0.02, 0.1, 0.36, x - 0.66, 0.72, z - 0.3);
    bb.box('glass', '#dff4ff', 1.22, 1.15, 1.22, x, 1.53, z); for (const [dx, dz] of [[-0.62, -0.62], [-0.62, 0.62], [0.62, -0.62], [0.62, 0.62]]) bb.box('gls', '#c0c4cc', 0.05, 1.15, 0.05, x + dx, 1.53, z + dz);
    bb.box('mat', body, 1.36, 0.34, 1.36, x, 2.28, z); for (let k = 0; k < 7; k++) bb.sph('glo', k % 2 ? '#fff1c8' : '#ffd23a', 0.035, x - 0.69, 2.14, z - 0.6 + k * 0.2, 1, 6);
    wallPlane(gg, ccMq, 1.2, 0.26, x - 0.69, 2.3, z, -Math.PI / 2, true);
    bb.box('gls', '#ffd23a', 1.1, 0.04, 0.04, x, 2.06, z - 0.3); bb.box('gls', '#ffd23a', 1.1, 0.04, 0.04, x, 2.06, z + 0.3); bb.box('gls', '#ffd23a', 0.12, 0.08, 0.7, x - 0.1, 2.02, z);
    bb.cyl('gls', '#c0c4cc', 0.01, 0.38, x - 0.1, 1.8, z, 6); bb.cyl('gls', '#c0c4cc', 0.06, 0.06, x - 0.1, 1.6, z, 10); for (let k = 0; k < 3; k++) { const a = k * 2.094; bb.box('gls', '#c0c4cc', 0.02, 0.16, 0.02, x - 0.1 + Math.cos(a) * 0.06, 1.5, z + Math.sin(a) * 0.06, 0, Math.sin(a) * 0.35, -Math.cos(a) * 0.35); }
    for (let k = 0; k < (touch ? 10 : 16); k++) bb.sph('mat', PL[k % 8], 0.09 + rnd() * 0.04, x - 0.4 + rnd() * 0.8, 1.06 + rnd() * 0.16, z - 0.42 + rnd() * 0.84, 1, 8);
    for (let k = 0; k < 2; k++) { const px = x + 0.1 + k * 0.2, pz = z - 0.25 + k * 0.45; bb.box('mat', '#ec3013', 0.2, 0.08, 0.12, px, 1.13, pz); bb.box('mat', '#201e1d', 0.22, 0.05, 0.05, px, 1.07, pz - 0.06); bb.box('mat', '#201e1d', 0.22, 0.05, 0.05, px, 1.07, pz + 0.06); }
    bb.sph('mat', '#f97316', 0.11, x + 0.25, 1.2, z + 0.2, 1, 10); for (const s of [-1, 1]) bb.box('mat', '#f97316', 0.04, 0.09, 0.04, x + 0.25, 1.33, z + 0.2 + s * 0.06);
    bb.build(gg); boxR(cl.x, cl.z, cl.a, 0.92, 0.92); const [fx, fz] = dirOf(cl.a); PLAY2(ci ? 'CLAW CRANE ' + (ci + 1) : 'CLAW CRANE', 'CLAW CRANE', 'Arcade%20Claw%20Crane.dc.html?embed=1&sign=MERU%20LANES', cl.x + fx * 1.6, cl.z + fz * 1.6, 1.3);
    // s101 CLAW IN WORLD: the cabinet menu plays on the front glass (an invisible 4:3 screen); START hides this model and claw-crane.js builds the real one here
    const deco = gg.children.slice(), scr = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.75), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); scr.position.set(x - 0.63, 1.53, z); scr.rotation.y = -Math.PI / 2; gg.add(scr);
    spots[spots.length - 1].cab = { name: 'CLAW CRANE', url: 'Arcade%20Claw%20Crane.dc.html?embed=1&sign=MERU%20LANES', standSpot: true, screen: scr, inworld: true, claw: { group: gg, deco, screen: scr }, skin: { name: 'CLAW CRANE', body, acc: '#ffd23a', scr: ['#3a1d7a', '#1a1040', body] } }; });
  b.build(G);
  // ===== MERU LANES LIGHTING (Ben) =====
  { const CY = 7.0, lb = Bin();
    lb.box('mat', '#15122a', 45, 0.2, 48, 127.5, CY + 0.1, -14);   // acoustic ceiling (the inside camera stays under it)
    for (let x = 107.5; x < 149; x += 4) for (let z = -36; z < 9.5; z += 4) { lb.cyl('mat', '#0d0b1c', 0.42, 0.06, x, CY - 0.02, z, 12); lb.cyl('glo', '#fff1d6', 0.3, 0.04, x, CY - 0.05, z, 12); }
    for (const z of [-37.7, -15.1, 9.7]) lb.box('glo', '#38bdf8', 44, 0.08, 0.08, 127.5, CY - 0.15, z);
    for (const x of [105.3, 149.7]) lb.box('glo', '#ff3fb4', 0.08, 0.08, 47, x, CY - 0.15, -14);
    for (const z of caps) { lb.box('glo', ['#38bdf8', '#ff3fb4', '#7cff9b'][Math.abs(Math.round(z)) % 3], LEND - FOUL - 0.4, 0.02, 0.06, (FOUL + LEND) / 2, 0.165, z); }   // lit capping edges down every lane
    lb.box('glo', '#ffffff', 0.12, 0.08, 22.6, 140.7, 1.18, ZC);   // pin-deck light bar under the masking unit
    lb.build(G);
    const pc = document.createElement('canvas'); pc.width = pc.height = 64; { const g = pc.getContext('2d'), q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,240,214,0.5)'); q.addColorStop(0.5, 'rgba(255,240,214,0.16)'); q.addColorStop(1, 'rgba(255,240,214,0)'); g.fillStyle = q; g.fillRect(0, 0, 64, 64); }
    const poolM = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 });
    const pools = []; for (let x = 107.5; x < 149; x += 4) for (let z = -36; z < 9.5; z += 4) { const onLane = x > FOUL && x < LEND && z < -15; if (!onLane) pools.push([x, 0.07, z, 3.4]); }
    for (const z of LZ) { pools.push([142.6, 0.13, z, 2.6]); pools.push([125, 0.13, z, 2.2]); }   // bright pin decks + approaches
    const pg2 = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), im = new THREE.InstancedMesh(pg2, poolM, pools.length), m4 = new THREE.Matrix4();
    pools.forEach(([x, y, z, r], i) => im.setMatrixAt(i, m4.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(r, 1, r)))); im.renderOrder = 3; G.add(im); }
  // BOWLERS (Ben): DASH moved to lane 6 (the far end from lane 1), a second bowler, PIPER, on lane 5 next to him. Their frame T has
  // "down the lane" = -z (T turned to run east); local x = world z - T.z. Lanes 1-4 keep the instanced standing pins (lane 4 = TENPIN)
  const T = new THREE.Group(); T.position.set(132, 0, -32); T.rotation.y = -Math.PI / 2; G.add(T);
  const pg = pinGeo(THREE).scale(PS, PS, PS), pinMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0x666666 });
  const lanePins = ln => { const out = []; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) { const p = new THREE.Mesh(pg, pinMat); p.position.set(ln + (c - r / 2) * 0.32 * PS, 0.105, -10 - r * 0.28 * PS); T.add(p); out.push(p); } return out; };
  const STILL = [0, 1, 2, 3]; let pinIM = null; { const im = new THREE.InstancedMesh(pg, pinMat, STILL.length * 10), m4 = new THREE.Matrix4(); let n = 0; pinIM = im;
    for (const i of STILL) for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) im.setMatrixAt(n++, m4.makeTranslation(142 + r * 0.28 * PS, 0.105, LZ[i] + (c - r / 2) * 0.32 * PS)); G.add(im); }
  const pinBase = i => STILL.indexOf(i) * 10;
  const bowlers = [[5, -1, {}, '#7c3aed'], [4, 1, { key: 'bowlerPiper', name: 'Piper', outfit: 'dress', female: true, torso: ['#7dd3fc', '#0284c7', '#0c4a6e'], crest: 'M', mood: 'happy' }, '#ec3013']]
    .map(([li, ret, who, ballCol]) => { const ln = LZ[li] - T.position.z; return createBowler({ THREE, T, makeFox: kit.makeFox, animFox: kit.animFox, M, toon, pins: lanePins(ln), lane: ln, ret, who, ballCol, audio: audio || (() => null) }); });
  const bowler = bowlers[0];
  // the people (positions only; names + lines unchanged)
  fox('lanesKeeper', { torso: '#c94c3a', outfit: 'vest' }, 113, -7.7, Math.PI);
  fox('lanesRegular', { torso: '#6b737b', outfit: 'coat' }, 122.2, -32.2, Math.PI / 2);
  fox('lanesRecord', { torso: '#ffc64a', outfit: 'vest' }, 116.9, -31.3, Math.PI / 2);
  fox('lanesRival', { torso: '#201e1d', outfit: 'armor' }, 120.6, -22.7, Math.PI / 2);   // moved off lane 5's approach (Piper bowls there)
  // Ben: foxes playing in the arcade + working the diner (background crowd, no lines). Phones get fewer
  const extras = [], dancers = [], PALS = [['#f97316', 'vest'], ['#38bdf8', 'coat'], ['#a78bfa', 'dress', 1], ['#22c55e', 'vest'], ['#f472b6', 'dress', 1], ['#facc15', 'coat'], ['#ec3013', 'vest']];
  const kid = (i, x, z, ry) => { const [t, o, fem] = PALS[i % PALS.length]; const f = fox('arcadeFox' + i, { torso: t, outfit: o, female: !!fem, mood: 'happy' }, x, z, ry); extras.push(f); return f; };
  const atCab = (k, i) => { const c = ARCADE_AT[i % ARCADE_AT.length]; if (c) kid(k, c[0], c[1], (c[2] + 180) * Math.PI / 180); };
  const atDance = (k, lx, lz, face) => { const [x, z] = danceAt(lx, lz); return kid(k, x, z, (LAYOUT.dance.a * Math.PI / 180) + face); };
  // Ben: 8 cabinets = one per game + 2 copies; a fox plays at each copy (the originals stay free for you)
  const players = []; const atCabP = (k, i) => { const c = ARCADE_AT[i]; if (c) players.push(kid(k, c[0], c[1], (c[2] + 180) * Math.PI / 180)); };
  // s101 Ben: the foxes playing the cabinets, pinball 2, the dance machine and the claw are REMOVED (they stood in the way); the bowlers stay (atCabP / atDance kept for later)
  fox('dinerCook', { torso: '#f3f2f2', outfit: 'coat', mood: 'warm' }, 129, 8.3, Math.PI); fox('dinerServer', { torso: '#c42d3c', outfit: 'dress', female: true, mood: 'happy' }, 135.5, 8.3, Math.PI);
  // TENPIN is now the 3D game on lane 4 (worlds/meru2-bowling.js, mounted by the walk); the old 2D page minigames/meru/tenpin.html is kept
  const far = touch ? 60 : 120;
  function tick(dt, t, cam) { const on = !cam || Math.hypot(cam.x - 127.5, cam.z + 14) < far; G.visible = on;
    if (on && ARC_D.length) { const me = window.__m2fox, w = new THREE.Vector3(); for (const A of ARC_D) { A.f.getWorldPosition(w); const near = me && Math.hypot(me.position.x - w.x, me.position.z - w.z) < 4.5, show = !near && !!(cam && Math.hypot(cam.x - w.x, cam.z - w.z) < 40);
        if (!show) { if (A.f.visible) { A.f.visible = false; endPose(A.f); } continue; } A.f.visible = true; A.t += dt; kit.animFox(A.f, dt, 0, false); applyPose(THREE, A.f, 'dancepad', A.t, 1); } }
    T.visible = !cam || (cam.x > 103 && cam.x < 152 && cam.z > -40 && cam.z < 12);   // phone perf s32: the bowlers' lanes (Dash, Piper, their pins: ~100 draws) sit behind the side wall, not seen from the street for (const f of npcs) kit.animFox(f, dt, 0, false); for (const bw of bowlers) bw.update(dt, on);
    for (const J of laneJobs) { const near = on && cam && Math.hypot(cam.x - J.f.position.x, cam.z - J.f.position.z) < 22 && !J.f.userData.talking;
      if (!near) { if (J.on) { endPose(J.f); J.on = false; } continue; } const A = FOX_ANIMS[J.list[J.i]]; J.t += dt; if (J.t >= A.dur) { J.t = 0; J.i = (J.i + 1) % J.list.length; }
      J.k = Math.min(1, (J.on ? J.k : 0) + dt * 3); J.on = true; applyPose(THREE, J.f, J.list[J.i], J.t, J.k); }
    if (!on) return;
    dancers.forEach((d, i) => { const B = d.userData.P; if (!B) return; const k = t * 4.4 + i * 1.3, s = Math.sin(k), s2 = Math.sin(k * 0.5); B.body.position.y = Math.abs(s) * 0.12; B.body.rotation.y = s2 * 0.35; B.head.rotation.z = s * 0.2;
      B.legs[0].rotation.x = Math.max(0, s) * -0.7; B.legs[1].rotation.x = Math.max(0, -s) * -0.7; if (B.arms) { B.arms[0].rotation.x = -2.4 + s * 0.6; B.arms[1].rotation.x = -2.4 - s * 0.6; B.arms[0].rotation.z = -0.3; B.arms[1].rotation.z = 0.3; } });
    players.forEach((p, i) => { const B = p.userData.P; if (!B || !B.arms) return; const j = Math.sin(t * 9 + i * 2) * 0.08; B.arms[0].rotation.x = -1.15 + j; B.arms[1].rotation.x = -1.15 - j; B.head.rotation.x = -0.08; });
    scrT += dt; if (CABCFG.screenAnim && scrT > 0.1) { scrT = 0; const sk = SKINS[scrI]; sk.anim(t); scrI = (scrI + 1) % SKINS.length; if (!touch) SKINS[scrI].anim(t), scrI = (scrI + 1) % SKINS.length; }
    PB.update(dt, cam); }
  let pbI = 0, pbAcc = 0, scrT = 0, scrI = 0;
  return { spots, npcs, tick, LZ, PAIRS, pinIM, pinBase, pinGeo: pg, LW, PS, bowler };
}

export function buildCasinoArt({ THREE, scene, cols, touch }) {
  const { CT, Bin, flat, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const G = new THREE.Group(); scene.add(G); const b = Bin();
  const GOLD = '#c9a227', CYAN = '#00f0ff', PINK = '#ff007c', VIO = '#bd00ff';
  // the casino minigames' own art (casino/slot1 · slot3 · slotFox · poker5 · pokerTexas · wheel.html): neon symbols, the 8 card back, paytables
  const SYM = (g, k, x, y, r) => { g.save(); g.translate(x, y); g.lineJoin = 'round';
    if (k === 'star') { g.fillStyle = '#20e8ff'; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.1; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill(); g.stroke(); }
    else if (k === '8') { g.fillStyle = '#05080f'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = '#38bdf8'; g.lineWidth = r * 0.22; g.beginPath(); g.arc(0, 0, r * 0.86, 0, 7); g.stroke(); g.fillStyle = '#ffffff'; g.font = '900 ' + Math.round(r * 1.3) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 0, r * 0.06); }
    else if (k === 'fox') { g.fillStyle = '#f97316'; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(-r, -r * 0.75); g.lineTo(-r * 0.45, -r * 0.35); g.lineTo(r * 0.45, -r * 0.35); g.lineTo(r, -r * 0.75); g.lineTo(r * 0.85, 0); g.lineTo(0, r * 0.8); g.lineTo(-r * 0.85, 0); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#201e1d'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * 0.35, -r * 0.05, r * 0.11, 0, 7); g.fill(); } g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.05; for (const s of [-1, 1]) for (const d of [-0.1, 0.1]) { g.beginPath(); g.moveTo(s * r * 0.55, r * (0.25 + d)); g.lineTo(s * r * 1.35, r * (0.2 + d * 2)); g.stroke(); } }
    else if (k === 'rocket') { g.fillStyle = '#ff2d8a'; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.08; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.45, -r * 0.4, r * 0.32, r * 0.35); g.lineTo(r * 0.8, r * 0.8); g.lineTo(r * 0.2, r * 0.6); g.lineTo(-r * 0.2, r * 0.6); g.lineTo(-r * 0.8, r * 0.8); g.lineTo(-r * 0.32, r * 0.35); g.quadraticCurveTo(-r * 0.45, -r * 0.4, 0, -r); g.fill(); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, -r * 0.25, r * 0.16, 0, 7); g.fill(); }
    else if (k === 'heart') { g.fillStyle = '#ff4f9a'; g.beginPath(); g.moveTo(0, r * 0.8); g.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.4); g.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.8); g.fill(); }
    else if (k === 'moon') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, r * 0.8, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(r * 0.35, -r * 0.2, r * 0.7, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
    else if (k === 'bolt') { g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(r * 0.2, -r); g.lineTo(-r * 0.55, r * 0.15); g.lineTo(-r * 0.05, r * 0.15); g.lineTo(-r * 0.25, r); g.lineTo(r * 0.55, -r * 0.2); g.lineTo(r * 0.05, -r * 0.2); g.closePath(); g.fill(); }
    g.restore(); };
  const cardBack = CT(64, 90, (g, w, h) => { g.fillStyle = '#0d2236'; g.fillRect(0, 0, w, h); g.strokeStyle = '#163a57'; g.lineWidth = 4; for (let i = -h; i < w + h; i += 9) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - h, h); g.stroke(); }
    g.strokeStyle = '#7dd3fc'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); SYM(g, '8', w / 2, h / 2, 16); });
  // textured quads merged into one mesh per texture: [x, y, z, w, h, ry, rx, uv0, uv1, uv2, uv3]
  const quads = (tex, list) => { const P = [], U = [], m4 = new THREE.Matrix4(), e = new THREE.Euler(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    for (const [x, y, z, w, h, ry = 0, rx = 0, u0 = 0, v0 = 0, u1 = 1, v1 = 1] of list) { m4.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, 0, 'YXZ')), one);
      const c = [[-w / 2, -h / 2, u0, v0], [w / 2, -h / 2, u1, v0], [w / 2, h / 2, u1, v1], [-w / 2, h / 2, u0, v1]];
      for (const j of [0, 1, 2, 0, 2, 3]) { v.set(c[j][0], c[j][1], 0).applyMatrix4(m4); P.push(v.x, v.y, v.z); U.push(c[j][2], c[j][3]); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05 })); G.add(m); return m; };
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
  const reel = CT(512, 184, (g, w, h) => { g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, w, h);
    const grid = [['star', '8', 'fox'], ['8', 'fox', 'star'], ['fox', 'rocket', '8']];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = 14 + c * 78, y = 10 + r * 56; g.fillStyle = '#141a33'; g.fillRect(x, y, 70, 50); g.strokeStyle = '#1e5b6b'; g.lineWidth = 2; g.strokeRect(x, y, 70, 50); SYM(g, grid[r][c], x + 35, y + 25, 17); }
    for (let r = 0; r < 3; r++) { g.fillStyle = CYAN; g.beginPath(); g.moveTo(4, 30 + r * 56); g.lineTo(11, 35 + r * 56); g.lineTo(4, 40 + r * 56); g.fill(); }
    ['star', '8', 'fox'].forEach((k, c) => { const x = 266 + c * 80; g.fillStyle = '#141a33'; g.fillRect(x, 22, 74, 140); g.strokeStyle = '#1e5b6b'; g.lineWidth = 2; g.strokeRect(x, 22, 74, 140); SYM(g, k, x + 37, 92, 28); });
    g.fillStyle = '#ff3fb4'; g.fillRect(262, 91, 244, 2); });
  for (const [half, list] of [[0, [0, 1, 3, 4]], [1, [2, 5]]]) quads(reel, list.map(i => [-148.49, 1.45, -7.5 + i * 3, 0.72, 0.52, Math.PI / 2, 0, half * 0.5, 0, half * 0.5 + 0.5, 1]));
  const tops = CT(256, 192, (g, w) => { ['LUCKY GATES', 'LUCKY GATES', 'LUCKY GATES'].forEach((t, i) => { const y = i * 64; g.fillStyle = '#10081e'; g.fillRect(0, y, w, 64); g.strokeStyle = i === 2 ? '#f97316' : CYAN; g.lineWidth = 4; g.strokeRect(3, y + 3, w - 6, 58);
    g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(t, 16, y + 34, w - 32); }); });
  quads(tops, [0, 1, 2, 3, 4, 5].map(i => { const k = i % 3; return [-148.68, 2.2, -7.5 + i * 3, 0.86, 0.43, Math.PI / 2, 0, 0, 1 - (k + 1) / 3, 1, 1 - k / 3]; }));
  const pay = CT(1024, 192, (g, w, h) => { g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, w, h); g.strokeStyle = CYAN; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8);
    [['star', '50X', '3.0'], ['8', '25X', '2.0'], ['fox', '10X', '1.5'], ['rocket', '5X', '1.2'], ['heart', '3X', '1.1'], ['moon', '2X', '1.0'], ['bolt', '1.5X', '1.0']].forEach(([k, m3, m2], i) => { const x = 24 + i * 140;
      if (i) { g.fillStyle = '#1e2a44'; g.fillRect(x - 10, 24, 2, h - 48); } SYM(g, k, x + 50, 58, 26); g.fillStyle = ['#20e8ff', '#38bdf8', '#f97316', '#ff2d8a', '#ff4f9a', '#ffffff', '#ffd23f'][i]; g.font = '900 28px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('3: ' + m3, x + 50, 128); g.fillStyle = '#c9d2e3'; g.font = '700 24px Archivo, sans-serif'; g.fillText('2: ' + m2, x + 50, 162); }); });
  quads(pay, [[-149.48, 4.3, 0, 9.6, 1.8, Math.PI / 2]]);
  b.box('mat', '#201e1d', 0.1, 3.2, 22, -149.55, 1.6, 0); b.box('gls', GOLD, 0.12, 0.06, 22, -149.55, 3.2, 0);
  for (let i = 0; i < 6; i++) { const z = -7.5 + i * 3, col = ['#2a1640', '#1d1a44', '#2a1630'][i % 3], edge = i % 3 === 2 ? '#f97316' : CYAN;
    b.box('mat', '#201e1d', 0.95, 0.8, 1.0, -148.95, 0.4, z); b.box('gls', col, 0.9, 1.1, 1.0, -149.0, 1.35, z); b.box('mat', '#111111', 0.05, 0.62, 0.82, -148.53, 1.45, z); for (const y of [1.13, 1.77]) b.box('glo', edge, 0.03, 0.035, 0.86, -148.52, y, z); for (const s of [-0.43, 0.43]) b.box('glo', edge, 0.03, 0.64, 0.035, -148.52, 1.45, z + s); b.box('glo', VIO, 0.92, 0.03, 1.02, -149.0, 0.81, z);
    b.box('mat', '#201e1d', 0.4, 0.08, 0.95, -148.4, 0.98, z, 0, 0, -0.2); ['#ff3030', '#ffd23a', '#38ff9b'].forEach((c, k) => b.box('glo', c, 0.08, 0.03, 0.12, -148.33, 1.01, z - 0.25 + k * 0.25));
    b.box('gls', '#c0c4cc', 0.25, 0.08, 0.6, -148.4, 0.62, z);
    b.box('mat', '#201e1d', 0.7, 0.55, 1.0, -149.05, 2.2, z); b.cyl('glo', edge, 0.14, 0.2, -149.05, 2.58, z, 12);
    b.cyl('mat', '#7a2a3a', 0.26, 0.1, -147.2, 0.72, z, 14); b.cyl('gls', GOLD, 0.04, 0.7, -147.2, 0.35, z, 6); b.cyl('gls', GOLD, 0.25, 0.04, -147.2, 0.02, z, 14);
    box(-149.6, -148.2, z - 0.5, z + 0.5); }
  const cards = [], lampSigns = [];
  // POKER (north bay): racetrack tables, padded rail, felt, cards, chips, dealer tray, chairs, a low lamp over each
  for (const [x, z] of [[-137, -21], [-122, -22]]) {
    b.cyl('mat', '#201e1d', 0.4, 0.7, x, 0.35, z, 12); b.cyl('mat', '#201e1d', 0.9, 0.06, x, 0.03, z, 16);
    b.ecyl('mat', '#3d2a1c', 2.5, 1.7, 0.2, x, 0.83, z); b.ecyl('mat', '#10283a', 2.4, 1.6, 0.06, x, 0.96, z); b.etor('mat', '#201e1d', 2.45, 1.65, 0.05, x, 1.0, z, 2);
    b.ecyl('mat', '#163a52', 1.6, 0.9, 0.005, x, 0.992, z); b.etor('glo', CYAN, 1.62, 0.92, 0.012, x, 0.996, z, 2);
    const tx = x === -122; if (tx) for (let k = 0; k < 5; k++) cards.push([x - 0.44 + k * 0.22, 0.998, z, 0.17, 0.24, 0, -Math.PI / 2]);
    b.box('gls', '#201e1d', 0.6, 0.05, 0.25, x, 1.0, z - 1.3); for (let k = 0; k < 6; k++) b.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e', '#201e1d', '#ffd23a'][k], 0.035, 0.04, x - 0.22 + k * 0.09, 1.04, z - 1.3, 8);
    for (let k = 0; k < 5; k++) { const a = Math.PI * 0.2 + k * Math.PI * 0.15, px = x + Math.cos(a) * 3.0, pz = z + Math.sin(a) * 2.05, ry = Math.atan2(x - px, z - pz);
      b.box('mat', '#7a2a3a', 0.55, 0.1, 0.55, px, 0.55, pz, ry); b.box('mat', '#7a2a3a', 0.55, 0.7, 0.08, px - Math.sin(ry) * 0.26, 0.95, pz - Math.cos(ry) * 0.26, ry);
      b.cyl('gls', GOLD, 0.04, 0.5, px, 0.25, pz, 6); b.cyl('gls', GOLD, 0.22, 0.03, px, 0.015, pz, 12); ring(px, pz, 0.3);
      const cx = x + Math.cos(a) * 1.85, cz = z + Math.sin(a) * 1.2, hx = x + Math.cos(a) * 2.15, hz = z + Math.sin(a) * 1.42, n = tx ? 2 : 5; for (let c = 0; c < n; c++) { const o = (c - (n - 1) / 2) * 0.13; cards.push([hx + Math.cos(ry) * o, 0.997 + c * 0.0005, hz - Math.sin(ry) * o, 0.14, 0.2, ry, -Math.PI / 2]); } for (let s = 0; s < 3; s++) b.cyl('gls', ['#ec3013', '#2e4a6b', '#201e1d'][s], 0.04, 0.03 + rnd() * 0.08, cx + (s - 1) * 0.09, 1.03, cz, 8); }
    b.box('gls', '#201e1d', 2.6, 0.42, 1.0, x, 3.2, z); b.box('glo', '#ffe2a8', 2.4, 0.02, 0.85, x, 2.98, z); for (const sd of [-1, 1]) lampSigns.push([x, 3.2, z + sd * 0.51, 2.4, 0.34, sd > 0 ? 0 : Math.PI, 0, 0, tx ? 0 : 0.5, 1, tx ? 0.5 : 1]); for (const s of [-1, 1]) b.box('mat', '#201e1d', 0.012, 10.4, 0.012, x + s * 1.1, 8.4, z); }
  quads(cardBack, cards);
  const lampT = CT(256, 64, (g, w) => { ["FIVE CARD STUD", "TEXAS HOLD'EM"].forEach((t, i) => { const y = i * 32; g.fillStyle = '#0a0d1c'; g.fillRect(0, y, w, 32); g.fillStyle = CYAN; g.fillRect(0, y + 29, w, 3); g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(t, 10, y + 16, w - 20); }); });
  quads(lampT, lampSigns);
  const pk = CT(1024, 448, (g, w, h) => { g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1e5b6b'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8);
    g.textBaseline = 'middle'; g.font = '800 24px Archivo, sans-serif'; const cx = [36, 470, 580, 690, 800, 920]; ['HAND', 'BET 5', 'BET 10', 'BET 15', 'BET 20', 'BET 25'].forEach((t, i) => { g.fillStyle = i === 1 ? CYAN : '#5d8ba3'; g.textAlign = i ? 'right' : 'left'; g.fillText(t, i ? cx[i] + 70 : cx[0], 40); });
    g.fillStyle = 'rgba(0,240,255,0.12)'; g.fillRect(452, 14, 116, h - 28);
    [['ROYAL FLUSH', 250, 500, 750, 1000, 4000], ['STRAIGHT FLUSH', 50, 100, 150, 200, 250], ['FOUR OF A KIND', 25, 50, 75, 100, 125], ['FULL HOUSE', 9, 18, 27, 36, 45], ['FLUSH', 6, 12, 18, 24, 30], ['STRAIGHT', 4, 8, 12, 16, 20], ['THREE OF A KIND', 3, 6, 9, 12, 15]].forEach((r, j) => { const y = 92 + j * 50;
      g.fillStyle = '#1e2a44'; g.fillRect(24, y - 25, w - 48, 2); g.font = '800 28px Archivo, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8f7ff'; g.fillText(r[0], cx[0], y);
      for (let i = 1; i < 6; i++) { g.textAlign = 'right'; g.fillStyle = i === 1 ? CYAN : '#c9d2e3'; g.fillText(String(r[i] * 5), cx[i] + 70, y); } }); });
  quads(pk, [[-129.5, 4.4, -31.45, 8, 3.5, 0]]);
  // WHEEL (south bay): backboard ring of bulbs, gold rim + pegs, pointer, stage, betting table
  const SEGS = [2, 8, 'S', 3, 12, 2, 'M', 5, 15, 3, 'B', 8], TIER = { S: ['SMALL', CYAN], M: ['MID', VIO], B: ['BIG', PINK] }, HUE = ['#22c55e', '#e11d48', '#f97316', '#ec4899', '#14b8a6', '#2563eb', '#7c3aed', '#eab308', '#0891b2', '#dc2626', '#65a30d', '#c026d3'];
  const wt = CT(512, 512, (g, w) => { const cx = w / 2, n = 12; g.fillStyle = '#05080f'; g.fillRect(0, 0, w, w);
    for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 - Math.PI / n + i / n * 6.2832, sg = SEGS[i]; g.fillStyle = typeof sg === 'string' ? TIER[sg][1] : HUE[i]; g.beginPath(); g.moveTo(cx, cx); g.arc(cx, cx, cx, a0, a0 + 6.2832 / n); g.fill();
      g.save(); g.translate(cx, cx); g.rotate(a0 + Math.PI / n + Math.PI / 2); g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (typeof sg === 'string') { g.font = '900 34px Archivo, sans-serif'; g.fillText(TIER[sg][0], 0, -cx * 0.72); g.font = '800 22px Archivo, sans-serif'; g.fillText('PRIZE', 0, -cx * 0.58); } else { g.font = '900 64px Archivo, sans-serif'; g.fillText(String(sg), 0, -cx * 0.7); } g.restore(); }
    g.strokeStyle = '#0a0d1c'; g.lineWidth = 4; for (let i = 0; i < n; i++) { const a = -Math.PI / 2 - Math.PI / n + i / n * 6.2832; g.beginPath(); g.moveTo(cx, cx); g.lineTo(cx + Math.cos(a) * cx, cx + Math.sin(a) * cx); g.stroke(); }
    g.fillStyle = '#05080f'; g.beginPath(); g.arc(cx, cx, cx * 0.24, 0, 7); g.fill(); g.strokeStyle = CYAN; g.lineWidth = 6; g.beginPath(); g.arc(cx, cx, cx * 0.24, 0, 7); g.stroke(); SYM(g, '8', cx, cx, cx * 0.16); });
  const wheel = new THREE.Group(); wheel.position.set(-118, 3.0, 26); G.add(wheel);
  { const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.2, 40), new THREE.MeshLambertMaterial({ color: 0x10182a })); disc.rotation.x = Math.PI / 2; wheel.add(disc);
    const face = new THREE.Mesh(new THREE.CircleGeometry(2.18, 48), new THREE.MeshBasicMaterial({ map: wt })); face.rotation.y = Math.PI; face.position.z = -0.105; wheel.add(face);
    const w2 = Bin(); for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2; w2.cyl('gls', GOLD, 0.025, 0.14, Math.cos(a) * 2.08, Math.sin(a) * 2.08, -0.16, 6, Math.PI / 2); } w2.tor('gls', GOLD, 2.22, 0.03, 0, 0, -0.1); w2.build(wheel); }
  b.cyl('mat', '#0d1424', 2.7, 0.1, -118, 3.0, 26.2, 32, Math.PI / 2); b.tor('glo', CYAN, 2.72, 0.035, -118, 3.0, 26.14); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; b.sph('glo', i % 2 ? CYAN : '#ffd23f', 0.07, -118 + Math.cos(a) * 2.5, 3.0 + Math.sin(a) * 2.5, 26.12, 1, 6); }
  b.box('gls', GOLD, 0.3, 0.45, 0.1, -118, 5.35, 25.85); b.cyl('gls', GOLD, 0.16, 0.12, -118, 5.05, 25.85, 3, Math.PI / 2);
  b.box('mat', '#3d2a1c', 0.4, 3, 0.4, -118, 1.5, 26.45); b.box('mat', '#3d2a1c', 6, 0.3, 3, -118, 0.15, 26.6); b.box('gls', GOLD, 6.04, 0.05, 3.04, -118, 0.31, 26.6);
  b.box('mat', '#3d2a1c', 4, 0.88, 1.1, -118, 0.44, 24.4); b.box('mat', '#1f6b45', 3.9, 0.04, 1.0, -118, 0.9, 24.4); b.box('gls', GOLD, 4.04, 0.04, 1.14, -118, 0.89, 24.4);
  for (let i = 0; i < 8; i++) b.box('mat', [CYAN, VIO, PINK, '#22c55e', '#f97316', '#2563eb', '#eab308', '#e11d48'][i], 0.42, 0.006, 0.36, -119.6 + i * 0.46, 0.925, 24.3);
  for (const [cx, cy, cz, sz, t] of [[-120.45, 0.31, 25.6, 0.62, 'S'], [-115.55, 0.31, 25.6, 0.62, 'M'], [-115.6, 0.93, 25.65, 0.5, 'B']]) { const c = TIER[t][1];
    b.box('mat', '#1a2230', sz, sz, sz, cx, cy + sz / 2, cz); for (const yy of [0.12, 0.88]) b.box('glo', c, sz + 0.02, 0.04, sz + 0.02, cx, cy + sz * yy, cz); b.box('glo', c, 0.04, sz * 0.5, 0.02, cx, cy + sz / 2, cz - sz / 2 - 0.005); }
  const mq = CT(512, 128, (g, w, h) => { g.fillStyle = '#05080f'; g.fillRect(0, 0, w, h); g.strokeStyle = CYAN; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.textBaseline = 'middle';
    g.fillStyle = VIO; g.font = '800 20px Archivo, sans-serif'; g.fillText('THE CASINO PRESENTS', 24, 32); g.fillStyle = '#ffffff'; g.font = '900 54px Archivo, sans-serif'; g.fillText('TREASURE WHEEL', 22, 82, w - 44); });
  b.box('mat', '#05080f', 5.4, 1.4, 0.12, -118, 6.4, 26.25); quads(mq, [[-118, 6.4, 26.18, 5.2, 1.3, Math.PI]]);
  box(-120.6, -115.4, 23.8, 27.4);
  // SNACK STOP vending machine (Arcade Vending Machine.dc.html) against the north wall by the door: lit SNACK STOP header, glass with 5 rows of snacks, LED, coin slot, tray
  { const x = -110, z = -31.1, SN = ['#22c55e', '#2563eb', '#6b3a1f', '#e11d48', '#facc15'];
    const BL = '#1d3f8f'; b.box('mat', BL, 1.15, 2.0, 0.1, x, 1.0, z - 0.375); for (const sx of [-0.55, 0.55]) b.box('mat', BL, 0.05, 2.0, 0.85, x + sx, 1.0, z); b.box('mat', BL, 1.15, 0.64, 0.85, x, 0.32, z); b.box('mat', BL, 1.15, 0.14, 0.85, x, 1.93, z); b.box('mat', BL, 0.32, 1.22, 0.85, x + 0.39, 1.25, z); b.box('gls', '#ec3013', 1.17, 0.06, 0.87, x, 2.0, z); b.box('glo', '#ffd23a', 0.04, 1.96, 0.04, x - 0.56, 1.0, z + 0.43); b.box('glo', '#ffd23a', 0.04, 1.96, 0.04, x + 0.56, 1.0, z + 0.43);
    b.box('glo', '#dfe8f0', 0.72, 1.2, 0.02, x - 0.15, 1.25, z + 0.2); for (let r = 0; r < 5; r++) { const y = 0.78 + r * 0.22; b.box('gls', '#c0c4cc', 0.7, 0.015, 0.2, x - 0.15, y - 0.06, z + 0.33);
      for (let c = 0; c < 4; c++) b.box('mat', SN[r], 0.12, r === 1 ? 0.16 : 0.11, 0.08, x - 0.41 + c * 0.175, y + 0.02, z + 0.36); }
    b.box('glo', '#ffffff', 0.04, 1.1, 0.005, x - 0.42, 1.25, z + 0.43); b.box('gls', '#c0c4cc', 0.78, 0.04, 0.03, x - 0.15, 1.88, z + 0.43); b.box('gls', '#c0c4cc', 0.78, 0.04, 0.03, x - 0.15, 0.63, z + 0.43); b.box('mat', '#132a60', 0.26, 1.2, 0.03, x + 0.38, 1.25, z + 0.43); b.box('glo', '#7dd3fc', 0.2, 0.12, 0.01, x + 0.38, 1.78, z + 0.45);
     for (let k = 0; k < 5; k++) b.box('glo', SN[k], 0.07, 0.07, 0.01, x + 0.38, 1.5 - k * 0.1, z + 0.45); b.box('gls', '#c9a227', 0.1, 0.03, 0.01, x + 0.38, 0.95, z + 0.45);
    b.box('mat', '#05080f', 0.7, 0.24, 0.02, x - 0.15, 0.36, z + 0.43); b.box('glass', '#bfe6ff', 0.66, 0.2, 0.01, x - 0.15, 0.36, z + 0.445);
    box(x - 0.6, x + 0.6, z - 0.45, z + 0.45); }
  const vh = CT(256, 48, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SNACK STOP', 14, 26, w - 28); });
  b.box('mat', '#201e1d', 1.15, 0.3, 0.1, -110, 2.17, -30.7); quads(vh, [[-110, 2.17, -30.645, 1.1, 0.26, 0]]);
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
