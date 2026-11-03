// MERU 2.0 — s51 TOWN 2 INTERIOR 9: GEARS' HOBBY SHOP [meruHobby] (f -148..-132 × 118..134, door W (-148, 126), side door S (-140, 134)).
// GEARS (Ben's pick): old tinkerer fox, magnifier goggles, a screwdriver behind the ear.
// ONE ORDER, ALL STEPS (Ben): 1 BUILD A MODEL: drag each part onto its yellow shadow on the kit (plane / car / ship) ·
// 2 PAINT IT: tap the pot the card asks for, then drag along the dots of that zone (stray off = a splat). GENTLE: no fail.
// Prize (Ben): a KITE (item kite: fly it from anywhere outside, tap again to reel in); after that, bonus gold.
// Room (Ben, all 6): model train round the ceiling · toy shelves to the roof · big workbench + lamp · kites + planes hanging · glass case of rare models · rocket pad by the back door.
// s70 INTERIOR POLISH 9: shopKit (Gears = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board ORDER; badge), NOW HIRING by the door,
// ONE-box menu with choices, 1-box end line, hint hand, touch radius 44 + bigger pulsing dots, portrait lens + room-clamped cameras.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildHobbyShop({ THREE, scene, kit, cols, save, touch, sayTo, camera, inside, hour = () => 12, isMuted = () => false }) { const JW = jobWorker(THREE);
  const X0 = -147.6, X1 = -132.4, Z0 = 118.4, Z1 = 133.6, CX = -140, CZ = 126;
  const G = new THREE.Group(); G.name = 'hobbyShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { put, box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] }), ringC = (x, z, r) => cols.push({ c: [x, z, r] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BLUE = '#2e86b8', GREEN = '#3f9a5e', STEEL = '#c9ced3', DARK = '#3d3b3a', WOOD = '#8a6440', CREAM = '#f1e7d0', BRASS = '#c9a24a';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const tri = (a, b, c2) => { const s = new THREE.Shape(); s.moveTo(a[0], a[1]); s.lineTo(b[0], b[1]); s.lineTo(c2[0], c2[1]); s.closePath(); return new THREE.ShapeGeometry(s); };
  // a diamond kite in its own xy plane (4 coloured quarters + cross sticks), merged into R0
  const kiteR = (x, y, z, ry, w, h, c1, c2, rz = 0) => { const t = h * 0.36, q = [[[0, 0], [w / 2, 0], [0, t]], [[0, 0], [0, t], [-w / 2, 0]], [[0, 0], [-w / 2, 0], [0, t - h]], [[0, 0], [0, t - h], [w / 2, 0]]];
    q.forEach((p, i) => put(tri(...p), x, y, z, i % 2 ? c2 : c1, ry, 0, rz)); };
  // ---------- floor: warm planks + a play-mat rug with roads ----------
  { const t = CT(256, 256, (g, W, H) => { g.fillStyle = '#b07c4f'; g.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(80,50,25,0.12)' : 'rgba(255,230,190,0.08)'; g.fillRect(0, i * 32, W, 32); g.fillStyle = 'rgba(60,36,18,0.35)'; g.fillRect(0, i * 32, W, 2); g.fillRect(((i * 97) % W), i * 32, 2, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3, (Z1 - Z0) / 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  { const t = CT(512, 384, (g, W, H) => { g.fillStyle = '#6fb46a'; g.fillRect(0, 0, W, H); g.fillStyle = '#4f8fcf'; g.beginPath(); g.ellipse(400, 290, 80, 55, 0, 0, 7); g.fill(); g.strokeStyle = '#5a5654'; g.lineWidth = 34;
      g.beginPath(); g.moveTo(0, 120); g.lineTo(W, 120); g.moveTo(170, 0); g.lineTo(170, H); g.moveTo(170, 260); g.lineTo(330, 260); g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.setLineDash([14, 12]); g.beginPath(); g.moveTo(0, 120); g.lineTo(W, 120); g.moveTo(170, 0); g.lineTo(170, H); g.stroke();
      for (const [x, y, c] of [[60, 40, RED], [260, 40, YEL], [400, 40, BLUE], [60, 200, '#ffffff'], [260, 190, RED], [40, 300, YEL]]) { g.fillStyle = c; g.fillRect(x, y, 46, 40); g.fillStyle = INK; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 23, y - 22); g.lineTo(x + 50, y); g.fill(); }
      g.fillStyle = INK; g.fillRect(0, 0, W, 8); g.fillRect(0, H - 8, W, 8); g.fillRect(0, 0, 8, H); g.fillRect(W - 8, 0, 8, H); });
    const r = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.0), new THREE.MeshLambertMaterial({ map: t })); r.rotation.x = -Math.PI / 2; r.rotation.z = Math.PI / 2; r.position.set(-140.3, 0.08, 125.4); G.add(r); }
  // ---------- walls: blue wainscot, yellow rail, cream plaster (gaps for both doors) ----------
  const wall = (len, x, z, ry) => { box(len, 0.3, 0.06, INK, x, 0.15, z, ry); box(len, 1.1, 0.05, BLUE, x, 0.62, z, ry); box(len, 0.1, 0.08, YEL, x, 1.2, z, ry); box(len, 3.5, 0.05, CREAM, x, 2.97, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(Z1 - Z0, X1 - 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, 124.6], [127.4, Z1]]) wall(b - a, X0 + 0.03, (a + b) / 2, Math.PI / 2);
  for (const [a, b] of [[X0, -141.4], [-138.6, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0);
  box(1.6, 0.02, 2.4, RED, X0 + 0.9, 0.08, 126); box(2.4, 0.02, 1.4, RED, -140, 0.08, Z1 - 0.8);
  // ================= TOY SHELVES TO THE ROOF (north wall) =================
  const SH = { x0: -147.3, x1: -134.4, z: Z0 + 0.26, d: 0.46, lv: [0.12, 0.86, 1.6, 2.34, 3.08], top: 3.62 };
  { const L = SH.x1 - SH.x0, xm = (SH.x0 + SH.x1) / 2; for (const y of [...SH.lv, SH.top]) box(L, 0.05, SH.d, WOOD, xm, y, SH.z); box(L, SH.top, 0.03, '#6a4a2e', xm, SH.top / 2, Z0 + 0.06);
    for (let x = SH.x0; x <= SH.x1 + 0.01; x += L / 5) box(0.06, SH.top, SH.d, '#6a4a2e', x, SH.top / 2, SH.z); rect(SH.x0 - 0.05, SH.x1 + 0.05, Z0, SH.z + SH.d / 2 + 0.05);
    // rolling ladder on a brass rail
    box(L, 0.04, 0.04, BRASS, xm, 3.5, SH.z + 0.3); const lx = -139.2; for (const s of [-1, 1]) box(0.05, 3.5, 0.05, WOOD, lx + s * 0.22, 1.76, SH.z + 0.5, 0, -0.12); for (let i = 0; i < 9; i++) box(0.44, 0.04, 0.05, WOOD, lx, 0.35 + i * 0.37, SH.z + 0.62 - i * 0.045);
    const TOYC = [RED, YEL, BLUE, GREEN, WHITE, '#e07a24', '#7c4dc4', '#f472b6'], items = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let l = 0; l < SH.lv.length; l++) { let x = SH.x0 + 0.12; while (x < SH.x1 - 0.3) { const w = 0.18 + rnd() * 0.32, h = Math.min(0.62, 0.16 + rnd() * 0.46), d = 0.18 + rnd() * 0.22; items.push([x + w / 2, SH.lv[l] + 0.025 + h / 2, SH.z + 0.02, w, h, d, TOYC[Math.floor(rnd() * TOYC.length)]]); x += w + 0.04 + rnd() * 0.06; } }
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), items.length), M4 = new THREE.Matrix4();
    items.forEach((q, i) => { M4.compose(V(q[0], q[1], q[2]), new THREE.Quaternion(), V(q[3], q[4], q[5])); im.setMatrixAt(i, M4); im.setColorAt(i, cc.set(q[6])); }); G.add(im);
    plane(label('TOYS · GAMES · KITS', INK, YEL, 512, 64, 40), 2.6, 0.32, xm, SH.top + 0.32, SH.z + 0.25); }
  // ================= COUNTER + KITE WALL (by the front door) =================
  box(0.8, 1.0, 2.8, BLUE, -145.0, 0.5, 121.4); box(0.86, 0.05, 2.86, YEL, -145.0, 1.02, 121.4); box(0.32, 0.24, 0.36, DARK, -145.0, 1.17, 120.6); box(0.3, 0.02, 0.2, '#7cff9b', -145.17, 1.24, 120.6, 0, 0, 0.5); rect(-145.45, -144.55, 119.95, 122.85);
  box(0.4, 0.3, 0.3, RED, -144.95, 1.2, 122.3); box(0.42, 0.04, 0.32, YEL, -144.95, 1.37, 122.3);
  [[119.5, RED, BLUE], [121.2, YEL, RED], [122.9, GREEN, YEL]].forEach(([z, a, b], i) => { kiteR(X0 + 0.08, 2.9 + (i % 2) * 0.3, z, Math.PI / 2, 0.9, 1.3, a, b, (i - 1) * 0.2); box(0.02, 0.6, 0.02, INK, X0 + 0.09, 2.2 + (i % 2) * 0.3, z); });
  plane(label('KITES', INK, YEL, 256, 64, 40), 0.9, 0.22, X0 + 0.1, 3.95, 121.2, Math.PI / 2);
  // ================= GLASS CASE OF RARE MODELS (south-west) =================
  const GC = { x: -144.6, z: 131.6 };
  box(2.1, 0.8, 0.95, '#1d3f5a', GC.x, 0.47, GC.z); box(2.16, 0.05, 1.0, BRASS, GC.x, 0.89, GC.z); for (const s of [-1, 1]) for (const t of [-1, 1]) box(0.04, 0.72, 0.04, BRASS, GC.x + s * 1.04, 1.27, GC.z + t * 0.46); box(2.12, 0.04, 0.96, BRASS, GC.x, 1.64, GC.z);
  box(0.42, 0.03, 0.16, '#e6b45a', GC.x - 0.65, 1.1, GC.z); box(0.07, 0.07, 0.5, '#e6b45a', GC.x - 0.65, 1.1, GC.z, Math.PI / 2); box(0.012, 0.07, 0.06, '#e6b45a', GC.x - 0.65, 1.15, GC.z + 0.23); cyl(0.012, 0.012, 0.18, INK, GC.x - 0.65, 1.0, GC.z, 6);
  cyl(0.09, 0.09, 0.42, '#bfe3c8', GC.x, 1.02, GC.z, 14, 0, Math.PI / 2); cyl(0.03, 0.04, 0.08, '#bfe3c8', GC.x + 0.25, 1.02, GC.z, 10, 0, Math.PI / 2); box(0.22, 0.04, 0.06, '#7a3a2a', GC.x, 0.98, GC.z); cyl(0.004, 0.004, 0.12, WOOD, GC.x, 1.04, GC.z, 4); box(0.08, 0.06, 0.003, WHITE, GC.x + 0.02, 1.05, GC.z);
  box(0.3, 0.1, 0.12, RED, GC.x + 0.62, 0.99, GC.z); cyl(0.045, 0.045, 0.22, INK, GC.x + 0.52, 1.02, GC.z, 12, 0, Math.PI / 2); cyl(0.015, 0.02, 0.07, INK, GC.x + 0.45, 1.1, GC.z, 8); box(0.1, 0.12, 0.13, RED, GC.x + 0.74, 1.05, GC.z);
  for (let i = 0; i < 4; i++) cyl(0.03, 0.03, 0.02, BRASS, GC.x + 0.5 + i * 0.08, 0.95, GC.z + 0.065, 10, Math.PI / 2);
  rect(GC.x - 1.1, GC.x + 1.1, GC.z - 0.5, GC.z + 0.5);
  plane(label("RARE MODELS · LOOK, DON'T TOUCH", BRASS, INK, 768, 64, 34), 1.8, 0.15, GC.x, 0.7, GC.z - 0.48, Math.PI);
  // ================= ROCKET PAD BY THE BACK DOOR (south, east of the door) + roof hatch =================
  const RP = { x: -136.6, z: 132.3 };
  cyl(0.62, 0.66, 0.14, '#8a8780', RP.x, 0.14, RP.z, 20); cyl(0.68, 0.68, 0.02, YEL, RP.x, 0.08, RP.z, 20); for (let i = 0; i < 8; i++) box(0.12, 0.022, 0.08, INK, RP.x + Math.cos(i * Math.PI / 4) * 0.66, 0.085, RP.z + Math.sin(i * Math.PI / 4) * 0.66, -i * Math.PI / 4);
  box(0.08, 2.0, 0.08, RED, RP.x + 0.5, 1.07, RP.z + 0.25); box(0.08, 2.0, 0.08, RED, RP.x + 0.5, 1.07, RP.z - 0.25); for (let i = 0; i < 5; i++) box(0.06, 0.04, 0.5, RED, RP.x + 0.5, 0.3 + i * 0.42, RP.z); box(0.4, 0.05, 0.06, YEL, RP.x + 0.3, 1.6, RP.z);
  ringC(RP.x, RP.z, 0.75); box(1.3, 0.05, 1.3, INK, RP.x, 4.72, RP.z); plane(label('LAUNCH PAD · STAND BACK', YEL, INK, 512, 64, 36), 1.3, 0.16, RP.x, 2.3, Z1 - 0.07, Math.PI);
  // ================= THE BIG WORKBENCH + LAMP (east wall) =================
  const M0 = V(-133.5, 0.955, 125.85), TRAY = { x: -132.9, y: 0.975 }, RIS = { x: -132.58, y: 1.14 }, SC = 1.3;
  box(1.4, 0.88, 5.0, WOOD, -133.1, 0.44, 126.4); box(1.44, 0.06, 5.04, '#c9a77a', -133.1, 0.91, 126.4); rect(-133.85, X1, 123.85, 128.95);
  box(0.9, 0.01, 1.0, '#3f7a52', M0.x + 0.02, 0.945, M0.z); for (let i = 0; i < 6; i++) box(0.9, 0.012, 0.004, '#cfe6d4', M0.x + 0.02, 0.946, M0.z - 0.45 + i * 0.18);
  box(0.44, 0.03, 1.6, '#8a8780', TRAY.x, 0.955, 125.85); box(0.3, 0.2, 1.6, '#6a4a2e', RIS.x, 1.04, 125.85);
  box(0.5, 0.02, 0.5, '#f4f1ec', -133.2, 0.95, 127.9, 0.3); box(0.4, 0.02, 0.4, '#f4f1ec', -133.0, 0.955, 128.4, -0.2);   // newspaper
  for (let i = 0; i < 4; i++) cyl(0.012, 0.012, 0.2, [RED, YEL, BLUE, DARK][i], -132.75, 1.04, 127.6 + i * 0.06, 6, 0, 0.3);   // tools
  box(0.06, 0.32, 0.06, '#e8e2d6', -132.7, 1.08, 128.6); cyl(0.04, 0.04, 0.14, WHITE, -132.7, 1.0, 128.75, 10);   // glue + tubes
  { const lx = -132.62, lz = 124.3; cyl(0.11, 0.13, 0.04, INK, lx, 0.96, lz, 14); box(0.035, 0.9, 0.035, INK, lx, 1.42, lz); box(0.035, 0.035, 0.5, INK, lx, 1.86, lz + 0.25);
    cyl(0.05, 0.16, 0.16, RED, lx, 1.8, lz + 0.52, 14); }
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff1b8 })); bulb.position.set(-132.62, 1.73, 124.82); G.add(bulb);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.22, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(M0.x + 0.05, 0.953, M0.z); G.add(pool);
  plane(label("GEARS' WORKBENCH", INK, YEL, 512, 64, 38), 1.6, 0.2, X1 - 0.07, 2.2, 126.4, -Math.PI / 2);
  // ---------- hanging sign ----------
  { const T = label("GEARS' HOBBY SHOP", YEL, INK, 768, 96, 60); const s1 = plane(T, 3.0, 0.38, -143.4, 3.3, 126, Math.PI / 2); const s2 = s1.clone(); s2.rotation.y = -Math.PI / 2; s2.position.x = -143.41; G.add(s2); for (const z of [124.6, 127.4]) box(0.01, 1.3, 0.01, DARK, -143.4, 4.1, z); }
  const SPOT = { work: { x: -134.95, z: 125.95, r: 1.0 } };
  cyl(0.5, 0.5, 0.012, YEL, SPOT.work.x, 0.075, SPOT.work.z, 22); cyl(0.42, 0.42, 0.014, INK, SPOT.work.x, 0.077, SPOT.work.z, 22);
  // ================= MODEL TRAIN ROUND THE CEILING =================
  const TR = { x0: X0 + 0.55, x1: X1 - 0.55, z0: Z0 + 0.62, z1: Z1 - 0.55, r: 0.7, y: 3.95 }, TP = [];
  { const arc = (cx, cz, a0, a1) => { for (let i = 0; i <= 8; i++) { const a = a0 + (a1 - a0) * i / 8; TP.push([cx + TR.r * Math.cos(a), cz + TR.r * Math.sin(a)]); } };
    arc(TR.x1 - TR.r, TR.z0 + TR.r, -Math.PI / 2, 0); arc(TR.x1 - TR.r, TR.z1 - TR.r, 0, Math.PI / 2); arc(TR.x0 + TR.r, TR.z1 - TR.r, Math.PI / 2, Math.PI); arc(TR.x0 + TR.r, TR.z0 + TR.r, Math.PI, Math.PI * 1.5); }
  const TL = [0]; for (let i = 1; i <= TP.length; i++) { const a = TP[i - 1], b = TP[i % TP.length]; TL.push(TL[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); } const TLEN = TL[TL.length - 1];
  for (let i = 0; i < TP.length; i++) { const a = TP[i], b = TP[(i + 1) % TP.length], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 0.01) continue; const ry = Math.atan2(dx, dz), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, px = Math.cos(ry), pz = -Math.sin(ry);
    box(0.2, 0.03, L + 0.02, '#6a4a2e', mx, TR.y - 0.03, mz, ry); for (const s of [-1, 1]) box(0.015, 0.025, L + 0.02, STEEL, mx + px * s * 0.05, TR.y, mz + pz * s * 0.05, ry); }
  { const brk = (x, z, wx, wz) => box(Math.abs(wx - x) + 0.04 || 0.04, 0.04, Math.abs(wz - z) + 0.04 || 0.04, INK, (x + wx) / 2, TR.y - 0.06, (z + wz) / 2);
    for (let x = TR.x0 + 1.2; x < TR.x1 - 1; x += 2.4) { brk(x, TR.z0, x, Z0); brk(x, TR.z1, x, Z1); } for (let z = TR.z0 + 1.2; z < TR.z1 - 1; z += 2.4) { brk(TR.x0, z, X0, z); brk(TR.x1, z, X1, z); } }
  const trainAt = s => { s = ((s % TLEN) + TLEN) % TLEN; let i = 1; while (TL[i] < s) i++; const a = TP[i - 1], b = TP[i % TP.length], k = (s - TL[i - 1]) / Math.max(1e-6, TL[i] - TL[i - 1]); return { x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, ry: Math.atan2(b[0] - a[0], b[1] - a[1]) }; };
  const ms = (geo, c, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, LM(c)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const TRAIN = []; { const eng = new THREE.Group(); eng.add(ms(new THREE.CylinderGeometry(0.07, 0.07, 0.3, 12), INK, 0, 0.1, 0.05, Math.PI / 2), ms(new THREE.BoxGeometry(0.16, 0.16, 0.14), RED, 0, 0.12, -0.15), ms(new THREE.BoxGeometry(0.18, 0.03, 0.16), INK, 0, 0.21, -0.15),
      ms(new THREE.CylinderGeometry(0.025, 0.035, 0.09, 8), INK, 0, 0.2, 0.14), ms(new THREE.BoxGeometry(0.15, 0.04, 0.42), DARK, 0, 0.03, 0), ms(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 8), BRASS, 0, 0.1, 0.205, Math.PI / 2));
    for (const s of [-1, 1]) for (const z of [-0.12, 0.02, 0.14]) eng.add(ms(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), RED, s * 0.08, 0.035, z, 0, 0, Math.PI / 2));
    G.add(eng); TRAIN.push(eng);
    [YEL, BLUE, GREEN].forEach(c => { const car = new THREE.Group(); car.add(ms(new THREE.BoxGeometry(0.15, 0.12, 0.3), c, 0, 0.1, 0), ms(new THREE.BoxGeometry(0.16, 0.02, 0.32), INK, 0, 0.17, 0), ms(new THREE.BoxGeometry(0.15, 0.04, 0.32), DARK, 0, 0.03, 0));
      for (const s of [-1, 1]) for (const z of [-0.1, 0.1]) car.add(ms(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), INK, s * 0.08, 0.03, z, 0, 0, Math.PI / 2)); G.add(car); TRAIN.push(car); }); }
  const PUFF = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; G.add(m); PUFF.push({ m, t: 9 }); }
  let trainS = 0, puffT = 0;
  // ================= HANGING KITES + PLANES =================
  const HANG = [];
  { const hk = (x, y, z, c1, c2, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); const w = 0.8, h = 1.15, t = h * 0.36; [[[0, 0], [w / 2, 0], [0, t]], [[0, 0], [0, t], [-w / 2, 0]], [[0, 0], [-w / 2, 0], [0, t - h]], [[0, 0], [0, t - h], [w / 2, 0]]].forEach((p, i) => { const m = new THREE.Mesh(tri(...p), new THREE.MeshLambertMaterial({ color: i % 2 ? c2 : c1, side: THREE.DoubleSide })); g.add(m); });
      for (let i = 0; i < 5; i++) { const b = ms(new THREE.BoxGeometry(0.1, 0.05, 0.02), i % 2 ? c1 : c2, 0, t - h - 0.18 - i * 0.2, 0); b.rotation.z = (i % 2 ? 1 : -1) * 0.5; g.add(b); } g.add(ms(new THREE.CylinderGeometry(0.004, 0.004, 4.7 - y - t, 4), INK, 0, t + (4.7 - y - t) / 2, 0)); g.rotation.y = ry; G.add(g); HANG.push({ g, ry, k: 0.35 }); };
    const hp = (x, y, z, c, ry) => { const g = new THREE.Group(); g.position.set(x, y, z); g.add(ms(new THREE.CylinderGeometry(0.09, 0.07, 0.9, 12), c, 0, 0, 0, Math.PI / 2), ms(new THREE.BoxGeometry(1.1, 0.03, 0.22), WHITE, 0, 0.02, 0.08), ms(new THREE.BoxGeometry(0.4, 0.025, 0.12), WHITE, 0, 0.02, -0.4),
      ms(new THREE.BoxGeometry(0.025, 0.18, 0.14), c, 0, 0.1, -0.42), ms(new THREE.BoxGeometry(0.03, 0.32, 0.04), INK, 0, 0, 0.47), ms(new THREE.SphereGeometry(0.06, 10, 8), '#9fd3ef', 0, 0.07, 0.15));
      for (const s of [-1, 1]) g.add(ms(new THREE.CylinderGeometry(0.004, 0.004, 4.7 - y, 4), INK, s * 0.3, (4.7 - y) / 2, 0.08)); g.rotation.y = ry; G.add(g); HANG.push({ g, ry, k: 0.2, bank: true }); };
    hk(-141.2, 3.15, 123.0, RED, YEL, 0.4); hk(-137.8, 3.25, 129.4, BLUE, WHITE, -0.6); hk(-145.6, 3.3, 128.2, GREEN, RED, 1.2);
    hp(-138.0, 3.35, 122.2, RED, 1.1); hp(-142.0, 3.45, 130.0, BLUE, -2.0); }
  // ================= ROCKET (launches when an order is done) =================
  const RK = new THREE.Group(); RK.add(ms(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 14), WHITE, 0, 0.5, 0), ms(new THREE.ConeGeometry(0.12, 0.32, 14), RED, 0, 1.16, 0), ms(new THREE.CylinderGeometry(0.125, 0.125, 0.08, 14), BLUE, 0, 0.78, 0), ms(new THREE.CircleGeometry(0.05, 12), '#9fd3ef', 0, 0.62, 0.122));
  for (let i = 0; i < 3; i++) { const f = ms(new THREE.BoxGeometry(0.02, 0.26, 0.16), RED, Math.sin(i * 2.094) * 0.17, 0.13, Math.cos(i * 2.094) * 0.17); f.rotation.y = i * 2.094; RK.add(f); }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 10), new THREE.MeshBasicMaterial({ color: 0xffa531, transparent: true, opacity: 0.9 })); flame.rotation.x = Math.PI; flame.position.y = -0.24; flame.visible = false; RK.add(flame);
  RK.position.set(RP.x, 0.21, RP.z); G.add(RK);
  const flaps = [-1, 1].map(s => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 1.2), LM('#9a958e')); const p = new THREE.Group(); p.position.set(RP.x + s * 0.6, 4.7, RP.z); f.position.x = -s * 0.3; p.add(f); G.add(p); p.userData.s = s; return p; });
  const SMOKE = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; G.add(m); SMOKE.push({ m, t: 9, vx: 0, vz: 0 }); }
  const rk = { t: -1, y: 0.21, v: 0, sm: 0 };
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  { const M4 = new THREE.Matrix4(), lm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.06, 2.6), new THREE.MeshBasicMaterial({ color: 0xfff8ec }), 6); [[-145, 122], [-140, 122], [-135.5, 122], [-145, 130], [-140, 130], [-135.5, 127]].forEach((p, i) => { M4.makeTranslation(p[0], 4.62, p[1]); lm.setMatrixAt(i, M4); }); G.add(lm); }
  // ================= GEARS =================
  const GR_LOOK = { fur: '#9a958e', furDark: '#6b665f', muzzle: '#ece7df', snout: '#ddd6cc', chin: '#f3f0ea', fluff: '#f3f0ea', leg: '#4a3a2c', boot: '#3a2a1c' };
  const gears = kit.makeFox({ key: 'gearsHobby', torso: ['#7a5638', '#e9dcc3', '#4a3424'], outfit: 'coat', mood: 'happy', eyes: ['#3a5a7a', '#3a5a7a'], look: GR_LOOK }); gears.scale.multiply(V(1.0, 1.02, 1.0));
  { const P = gears.userData && gears.userData.P; if (P && P.head) { const g = new THREE.Group(); g.position.set(0, 0.2, 0.05);
      const strap = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 6, 24), LM(INK)); strap.rotation.x = Math.PI / 2 - 0.25; g.add(strap);
      for (const s of [-1, 1]) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 16, 1, true), LM(BRASS)); ring.rotation.x = Math.PI / 2 - 0.6; ring.position.set(s * 0.1, 0.06, 0.25); g.add(ring);
        const lens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), new THREE.MeshBasicMaterial({ color: 0xbfe3f2, side: THREE.DoubleSide })); lens.rotation.x = -0.6; lens.position.set(s * 0.1, 0.075, 0.27); g.add(lens); }
      const sd = new THREE.Group(); sd.position.set(0.27, 0.0, -0.06); sd.rotation.set(0.3, 0, 1.1); sd.add(ms(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), YEL, 0, 0, 0), ms(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 6), STEEL, 0, -0.13, 0)); g.add(sd);
      g.traverse(o => { o.renderOrder = 2; }); P.head.add(g); } }
  const GS = { idle: [-146.3, 121.4, Math.PI / 2], bench: [-134.5, 123.3, Math.PI * 0.7], pad: [-137.6, 130.6, Math.PI * 0.75] };
  G.add(gears); const grCol = { c: [0, 0, 0.5] }; cols.push(grCol);
  const placeGears = k => { const s = GS[k]; gears.position.set(s[0], 0, s[1]); gears.userData.face0 = s[2]; grCol.c[0] = s[0]; grCol.c[1] = s[1]; }; placeGears('idle');
  const grT = { key: 'gearsHobby', obj: gears, ry: 0, r: 2.4 }, endT = { key: 'hobbyEnd', obj: gears, ry: 0, r: 9 };
  const ln = text => ({ who: 'gears', role: 'GEARS', text });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'hobby', color: BLUE, boardTitle: "Gears' best",
    room: { X0, X1, Z0, Z1 }, door: [-148.2, 126], keeper: gears, keeperRy: Math.PI / 2,
    games: [{ k: 'order', name: 'Order', color: BLUE }], board: { x: X1 - 0.06, y: 2.6, z: 131.2, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: -147.0, z: 128.6, ry: Math.PI / 2 }, hiringLine: 'BUILD · PAINT',
    sun: [{ x: -146.7, z: 126, w: 1.8, d: 1.8 }, { x: -140, z: 132.7, w: 1.8, d: 1.8 }], lamps: [[-145, 122], [-140, 122], [-135.5, 122], [-145, 130], [-140, 130], [-135.5, 127]].map(p => [p[0], 4.3, p[1]]),
    browse: [[-142.5, 119.5, Math.PI], [-137.5, 119.5, Math.PI], [-144.6, 130.4, 0], [-143.9, 121.4, -Math.PI / 2], [-138.3, 131.2, 1.0]],
    looks: [['#e07a24', '#fdebd8', '#7a3c0c'], ['#7c4dc4', '#ede4fb', '#3d2563']], clock: { x: X1 - 0.08, y: 3.1, z: 121.0, ry: -Math.PI / 2 } });
  // ================= KITS (plane / car / ship) =================
  const PAINT = { red: { name: 'RED', c: RED }, yellow: { name: 'YELLOW', c: YEL }, blue: { name: 'BLUE', c: BLUE }, green: { name: 'GREEN', c: GREEN }, white: { name: 'WHITE', c: '#f7f5f0' }, black: { name: 'BLACK', c: '#2a2826' } }, PK = Object.keys(PAINT);
  const PL = '#b9b7b2', ghostM = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.35, depthWrite: false });
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const grp = (...a) => { const g = new THREE.Group(); a.forEach(m => g.add(m)); return g; };
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, s = 14) => new THREE.CylinderGeometry(a, b, h, s);
  const KITS = {
    plane: { name: 'PLANE', zones: ['BODY', 'WINGS', 'TAIL', 'PROP'], lift: 0.13,
      base: z => grp(mm(Cy(0.05, 0.045, 0.4), z.BODY, 0, 0, 0.02, Math.PI / 2), mm(new THREE.SphereGeometry(0.05, 12, 8), z.BODY, 0, 0, 0.22, 0, 0, 0), mm(Cy(0.045, 0.015, 0.14), z.BODY, 0, 0, -0.25, Math.PI / 2), mm(new THREE.SphereGeometry(0.034, 10, 8), LM('#9fd3ef'), 0, 0.04, 0.08), mm(Cy(0.008, 0.012, 0.13, 6), LM(INK), 0, -0.07, 0)),
      parts: z => [{ name: 'LEFT WING', kind: 'wing', at: V(-0.16, 0, 0.04), g: grp(mm(Bx(0.24, 0.014, 0.1), z.WINGS)) }, { name: 'RIGHT WING', kind: 'wing', at: V(0.16, 0, 0.04), g: grp(mm(Bx(0.24, 0.014, 0.1), z.WINGS)) },
        { name: 'TAIL WING', kind: 'tailp', at: V(0, 0.005, -0.29), g: grp(mm(Bx(0.18, 0.012, 0.06), z.TAIL)) }, { name: 'TAIL FIN', kind: 'fin', at: V(0, 0.05, -0.3), g: grp(mm(Bx(0.012, 0.09, 0.07), z.TAIL)) },
        { name: 'PROPELLER', kind: 'prop', at: V(0, 0, 0.275), g: grp(mm(new THREE.SphereGeometry(0.02, 8, 6), z.PROP), mm(Bx(0.018, 0.16, 0.012), z.PROP, 0, 0, 0, 0, 0, 0.3)) }] },
    car: { name: 'RACING CAR', zones: ['BODY', 'ROOF', 'WHEELS', 'TRIM'], lift: 0.045,
      base: z => grp(mm(Bx(0.2, 0.05, 0.44), z.BODY, 0, 0.03, 0), mm(Bx(0.21, 0.03, 0.025), z.TRIM, 0, 0.02, 0.23), mm(Bx(0.21, 0.03, 0.025), z.TRIM, 0, 0.02, -0.23), mm(Bx(0.16, 0.02, 0.06), z.TRIM, 0, 0.065, -0.2), mm(new THREE.SphereGeometry(0.015, 8, 6), LM(YEL), -0.07, 0.035, 0.22), mm(new THREE.SphereGeometry(0.015, 8, 6), LM(YEL), 0.07, 0.035, 0.22)),
      parts: z => [{ name: 'CABIN', kind: 'cabin', at: V(0, 0.09, -0.02), g: grp(mm(Bx(0.17, 0.07, 0.2), z.ROOF), mm(Bx(0.15, 0.05, 0.005), LM('#9fd3ef'), 0, 0, 0.101)) },
        ...[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz], i) => ({ name: 'WHEEL', kind: 'wheel', at: V(sx * 0.115, 0, sz * 0.14), g: grp(mm(Cy(0.045, 0.045, 0.035, 16), z.WHEELS, 0, 0, 0, 0, 0, Math.PI / 2), mm(Cy(0.02, 0.02, 0.037, 10), LM(STEEL), 0, 0, 0, 0, 0, Math.PI / 2)) }))] },
    ship: { name: 'STEAM SHIP', zones: ['HULL', 'DECK', 'CABIN', 'FUNNEL'], lift: 0.0,
      base: z => grp(mm(Bx(0.16, 0.07, 0.4), z.HULL, 0, 0.035, -0.03), mm(Bx(0.113, 0.07, 0.113), z.HULL, 0, 0.035, 0.17, 0, Math.PI / 4), mm(Bx(0.15, 0.012, 0.39), z.DECK, 0, 0.076, -0.03), mm(Bx(0.1, 0.012, 0.1), z.DECK, 0, 0.076, 0.17, 0, Math.PI / 4)),
      parts: z => [{ name: 'CABIN', kind: 'cabin', at: V(0, 0.117, -0.06), g: grp(mm(Bx(0.11, 0.07, 0.15), z.CABIN), mm(Bx(0.112, 0.02, 0.1), LM('#9fd3ef'), 0, 0.01, 0)) },
        { name: 'FUNNEL', kind: 'funnel', at: V(0, 0.2, -0.07), g: grp(mm(Cy(0.028, 0.032, 0.1), z.FUNNEL), mm(Cy(0.03, 0.03, 0.02), LM(INK), 0, 0.05, 0)) },
        { name: 'MAST', kind: 'mast', at: V(0, 0.19, 0.11), g: grp(mm(Cy(0.007, 0.007, 0.22, 6), z.DECK), mm(Bx(0.1, 0.006, 0.006), z.DECK, 0, 0.06, 0)) },
        { name: 'LIFEBOAT', kind: 'boat', at: V(-0.07, 0.1, -0.17), g: grp(mm(Bx(0.03, 0.022, 0.08), z.CABIN)) }, { name: 'LIFEBOAT', kind: 'boat', at: V(0.07, 0.1, -0.17), g: grp(mm(Bx(0.03, 0.022, 0.08), z.CABIN)) }] } };
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', kit: 'plane', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], say: 'A little plane for the shop window, please.' },
    { name: 'PELL', forW: 'Armory', kit: 'ship', torso: ['#5a6b7a', '#e2e6ea', '#2f3a44'], say: 'A ship. A proper one, with a funnel.' },
    { name: 'OTTO', forW: 'Barracks', kit: 'car', torso: ['#7a8a3a', '#e8e2c8', '#4a5420'], say: 'A racing car. Fast looking, even if it is not.' },
    { name: 'MARLA', forW: 'Arena market', kit: 'plane', torso: ['#f472b6', '#fce7f3', '#9d174d'], say: 'For my nephew. He wants to be a pilot this week.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', kit: 'car', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], say: 'A model of my dream car. It will have to do for now.' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', kit: 'ship', torso: ['#2e4a6b', '#ffd23a', '#1d2f44'], say: 'My old boat. Well, a boat like her. Close enough.' },
    { name: 'FLICK', forW: 'Skate Park', kit: 'car', torso: ['#ffd23a', '#201e1d', '#a16207'], say: 'Make it look like it does a hundred.' }];
  const custCache = {}; const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'hbCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  // paint pots on the riser
  const POTS = PK.map((k, i) => { const z = 125.2 + i * 0.26, g = new THREE.Group(); g.position.set(RIS.x, RIS.y, z); g.add(mm(Cy(0.075, 0.075, 0.1, 16), LM('#f4f1ec'), 0, 0.05, 0), mm(Cy(0.07, 0.07, 0.012, 16), LM(PAINT[k].c), 0, 0.1, 0), mm(Cy(0.077, 0.077, 0.04, 16, 1), LM(PAINT[k].c), 0, 0.045, 0)); G.add(g); return { k, g, p: V(RIS.x, RIS.y + 0.1, z), hop: 0 }; });
  const TRAY_Z = [125.2, 125.52, 125.85, 126.18, 126.5];
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), snap = () => { tone(1800, 0.05, 0.05, 'square'); tone(900, 0.05, 0.09, 'triangle'); };
  const brushS = () => tone(500 + Math.random() * 300, 0.012, 0.08, 'triangle'), splat = () => tone(140, 0.06, 0.18, 'sawtooth', 0, 70), whoosh = () => { tone(110, 0.08, 2.2, 'sawtooth', 0, 900); tone(60, 0.07, 1.6, 'square', 0, 40); };
  // ---------- prize ----------
  const hasKite = () => save.count('kite') > 0;
  function giveGift() { save.setStat('hbClears', save.stat('hbClears', 0) + 1); if (!hasKite()) { save.give('kite'); return { kind: 'kite', label: 'A KITE' }; } const g2 = 20; save.addGold(g2); return { kind: 'gold', label: 'BONUS +' + g2 + ' GOLD' }; }
  // ---------- card (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(0); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(0.016); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  const ray = new THREE.Raycaster(), pl = new THREE.Plane(), hitP = V();
  const ptrOnPlane = y => { ray.setFromCamera(new THREE.Vector2(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1), camera); pl.set(V(0, 1, 0), -y); return ray.ray.intersectPlane(pl, hitP) ? hitP.clone() : null; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const keep = o => { J.objs.push(o); G.add(o); return o; };
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotDone = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true }), dotGeo = new THREE.SphereGeometry(0.009 * (touch ? 1.4 : 1), 8, 6);
  function makePath(pts) { clearDots(); J.path = { pts: pts.map(p => { const d = new THREE.Mesh(dotGeo, dotM); d.position.copy(p); d.renderOrder = 4; keep(d); return { p, d }; }), i: 0, wob: 0 }; }
  function clearDots() { if (J && J.path) { for (const q of J.path.pts) G.remove(q.d); J.path = null; } }
  // ================= THE ORDER =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  function startOrder() { const n = save.stat('hbVisits', 0), ci = n % CUST.length, C = CUST[ci], K = KITS[C.kit]; save.setStat('hbVisits', n + 1);
    const scheme = []; for (const z of K.zones) { let k; do { k = PK[Math.floor(Math.random() * PK.length)]; } while (k === scheme[scheme.length - 1] || (scheme.length && scheme.indexOf(k) >= 0 && Math.random() < 0.7)); scheme.push(k); }
    const zm = {}; K.zones.forEach(z => { zm[z] = new THREE.MeshLambertMaterial({ color: PL }); });
    J = { ci, C, K, kitK: C.kit, scheme, zm, step: 1, sub: 'build', gold: 0, pause: 0, t: 0, perfect: 0, miss: 0, wrongPot: 0, wob: 0, splats: 0, zi: 0, objs: [], flies: [], held: null };
    const MG = new THREE.Group(); MG.position.copy(M0).add(V(0, K.lift * SC, 0)); MG.scale.setScalar(SC); MG.add(K.base(zm)); if (K.lift > 0.05) MG.add(mm(Cy(0.06, 0.07, 0.015, 14), LM(INK), 0, -K.lift + 0.008, 0)); keep(MG); J.MG = MG;
    J.parts = K.parts(zm).map((p, i) => { p.ghost = p.g.clone(); p.ghost.traverse(o => { if (o.isMesh) { o.material = ghostM; o.renderOrder = 3; } }); p.ghost.position.copy(p.at); MG.add(p.ghost); p.done = false; p.slot = V(TRAY.x, TRAY.y + 0.03, TRAY_Z[i]); p.g.position.copy(p.slot); p.g.scale.setScalar(SC); keep(p.g); return p; });
    const f = custFox(ci); f.visible = true; f.position.set(-134.9, 0.02, 128.7); f.rotation.y = Math.PI * 0.85; f.userData.mood = f.userData.base = 'neutral'; J.cust = f;
    placeGears('bench'); busy = 'job'; snap(); toast('STEP 1 OF 2 · BUILD THE ' + K.name, 2); }
  // ---- 1 BUILD: drag each part onto its yellow shadow ----
  const freeGhosts = kind => J.parts.filter(q => q.kind === kind && !q.ghost.userData.used);
  const ghostW = q => { J.MG.updateMatrixWorld(true); return q.ghost.getWorldPosition(V()); };
  function lift(p) { J.held = { p, x0: ptr.x, y0: ptr.y, moved: false, tap: false }; p.g.position.y = TRAY.y + 0.1; pop(); }
  function dropBack(p, said) { fly(p.g, p.slot, 0.3, 0.05); if (said) { J.miss++; nope(); toast('GEARS: "CLOSE! IT GOES ON THE YELLOW SHADOW."', 1.6); } }
  function snapTo(p, gq) { gq.ghost.userData.used = true; const to = ghostW(gq); J.held = null; fly(p.g, to, 0.22, 0.04, () => { gq.ghost.visible = false; J.MG.attach(p.g); p.g.position.copy(gq.at); p.g.rotation.set(0, 0, 0); p.g.scale.setScalar(1); p.done = true; snap(); afterSnap(); }); }
  function afterSnap() { const g2 = addGold(6); const left = J.parts.filter(q => !q.done).length; toast('SNAP! +' + g2 + (left ? ' · ' + left + ' TO GO' : ''), 0.9);
    if (!left) { const clean = !J.miss, g3 = clean ? addGold(6) : 0; if (clean) J.perfect++; ding(); toast((clean ? 'GEARS: "EVERY PART IN ITS PLACE. SPLENDID."' : 'GEARS: "ALL TOGETHER. SPLENDID."') + (g3 ? ' +' + g3 : ''), 1.8); NEXT('built', beginPaint, 1.5); } }
  function buildPress() { if (J.flies.length) return; const H = J.held;
    if (H && H.tap) { const gq = nearestOf(freeGhosts(H.p.kind), ghostW, 1.8); if (gq) { snapTo(H.p, gq); return; } const o = nearestOf(J.parts.filter(q => !q.done && q !== H.p), q => q.g.position, 1.6); dropBack(H.p, false); J.held = null; if (o) lift(o); return; }
    const p = nearestOf(J.parts.filter(q => !q.done), q => q.g.position, 1.8); if (p) lift(p); }
  function buildDrag() { const H = J.held; if (!H || !ptr.down) return; if (Math.hypot(ptr.x - H.x0, ptr.y - H.y0) > 10) { H.moved = true; H.tap = false; } if (!H.moved) return;
    const h = ptrOnPlane(TRAY.y + 0.1); if (h) { H.p.g.position.set(Math.max(-133.85, Math.min(-132.5, h.x + 0.05)), TRAY.y + 0.1, Math.max(124.2, Math.min(127.6, h.z))); } }
  function release() { if (!J || J.sub !== 'build') return; const H = J.held; if (!H) return;
    if (!H.moved) { H.tap = true; toast('NOW TAP ITS YELLOW SHADOW', 1.2); return; }
    const sp = scrW(H.p.g.position); let best = null, bd = RAD() * 1.6; for (const gq of freeGhosts(H.p.kind)) { const s = scrW(ghostW(gq)), d = Math.hypot(s[0] - sp[0], s[1] - sp[1]); if (d < bd) { bd = d; best = gq; } }
    if (best) snapTo(H.p, best); else { dropBack(H.p, true); J.held = null; } }
  // ---- 2 PAINT: tap the pot, drag along the dots ----
  const brush = new THREE.Group(); brush.add(mm(Cy(0.008, 0.01, 0.22, 6), LM(WOOD), 0, 0.12, 0), mm(Cy(0.011, 0.011, 0.03, 8), LM(STEEL), 0, 0.005, 0)); const tipM = new THREE.MeshLambertMaterial({ color: PL }); brush.add(mm(new THREE.ConeGeometry(0.014, 0.04, 8), tipM, 0, -0.02, 0, Math.PI)); brush.rotation.z = -0.4; brush.visible = false; G.add(brush);
  function beginPaint() { J.step = 2; J.sub = 'pot'; J.zi = 0; J.MG.updateMatrixWorld(true); toast('STEP 2 OF 2 · PAINT IT TO THE CARD', 1.8); }
  function zoneDots(zone) { const mat = J.zm[zone], out = []; J.MG.updateMatrixWorld(true); const bb = new THREE.Box3(), sz = V(), c = V();
    J.MG.traverse(o => { if (!o.isMesh || o.material !== mat) return; bb.setFromObject(o); bb.getSize(sz); bb.getCenter(c); const vert = sz.y > Math.max(sz.x, sz.z) * 1.05, L = vert ? sz.y : Math.max(sz.x, sz.z), n = L > 0.2 ? 3 : L > 0.09 ? 2 : 1;
      for (let i = 0; i < n; i++) { const u = n === 1 ? 0 : (i / (n - 1) - 0.5) * 0.7 * L; if (vert) out.push(V(bb.min.x - 0.004, c.y + u, c.z)); else if (sz.x >= sz.z) out.push(V(c.x + u, bb.max.y + 0.004, c.z)); else out.push(V(c.x, bb.max.y + 0.004, c.z + u)); } });
    return out.slice(0, 14); }
  function potPress() { const zone = J.K.zones[J.zi], want = J.scheme[J.zi], p = nearestOf(POTS, q => q.p, 1.6); if (!p) return;
    if (p.k !== want) { J.wrongPot++; nope(); p.hop = 0.5; toast('GEARS: "THE CARD SAYS ' + PAINT[want].name + ' FOR THE ' + zone + '."', 1.7); return; }
    p.hop = 1; tone(880, 0.04, 0.15, 'triangle'); tipM.color.set(PAINT[want].c); brush.visible = true; brush.position.copy(p.p).add(V(0, 0.05, 0)); J.zoneWob = 0; makePath(zoneDots(zone)); J.sub = 'paint'; toast('PAINT THE ' + zone + ' · DRAG ALONG THE DOTS', 1.4); }
  function paintDrag(dt) { const Pa = J.path; if (!Pa) return; const by = M0.y + J.K.lift * SC + 0.22, h = ptrOnPlane(by); if (h && ptr.down) brush.position.set(Math.max(-133.9, Math.min(-132.5, h.x)), by, Math.max(124.4, Math.min(128.6, h.z)));
    if (Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 4, Pa.pts.length); j++) if (dist(scrW(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) Pa.pts[j].d.material = dotDone; Pa.i = hit + 1; brushS(); const f = Pa.i / Pa.pts.length; J.zm[J.K.zones[J.zi]].color.copy(new THREE.Color(PL).lerp(new THREE.Color(PAINT[J.scheme[J.zi]].c), f)); if (Pa.i >= Pa.pts.length) zoneDone(); }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrW(Pa.pts[j].p))); if (md > R * 2.6) { Pa.wob += dt; J.zoneWob += dt; if (Pa.wob > 0.35) { Pa.wob = 0; makeSplat(); } } } }
  const splatGeo = new THREE.CircleGeometry(1, 12);
  function makeSplat() { J.splats++; J.wob += 0.35; splat(); const s = keep(new THREE.Mesh(splatGeo, new THREE.MeshLambertMaterial({ color: PAINT[J.scheme[J.zi]].c }))); s.rotation.x = -Math.PI / 2; s.scale.setScalar(0.02 + Math.random() * 0.025); s.position.set(M0.x - 0.15 + Math.random() * 0.3, 0.952, M0.z + (Math.random() < 0.5 ? -1 : 1) * (0.3 + Math.random() * 0.15)); if (J.splats === 1 || J.splats % 4 === 0) toast('SPLAT · GEARS: "STEADY HANDS, NOW. STAY ON THE DOTS."', 1.6); }
  function zoneDone() { const zone = J.K.zones[J.zi], clean = J.zoneWob < 0.3; J.zm[zone].color.set(PAINT[J.scheme[J.zi]].c); clearDots(); const g2 = addGold(8 + (clean ? 2 : 0)); ding(); J.zi++;
    if (J.zi < J.K.zones.length) { toast(zone + ' DONE +' + g2 + ' · NEXT: ' + J.K.zones[J.zi], 1.3); NEXT('pot', null, 0.6); return; }
    brush.visible = false; const clean2 = J.wob < 0.6 && !J.wrongPot; if (clean2) J.perfect++; toast((clean2 ? 'GEARS: "NOT A SMUDGE. SPLENDID."' : 'GEARS: "LOVELY COLOURS."') + ' +' + g2, 1.6); NEXT('show', beginShow, 1.2); }
  function beginShow() { J.sub = 'show'; J.t = 0; J.cust.position.set(-134.15, 0.02, 127.95); J.cust.rotation.y = 2.8; J.cust.userData.mood = J.cust.userData.base = 'happy'; J.cust.userData.hop = 1; tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7);
    const g2 = addGold(24), K = J.K, S = J.scheme;
    setCard('pay', head(K.name + ' DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(J.C) + K.zones.map((z, i) => row(PAINT[S[i]].c, PAINT[S[i]].name + ' ' + z, '\u2713', true)).join('')
      + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['It is better than the picture on the box.', 'Gears, your helper has the hands for this.', 'I am going to put it where everyone can see it.'][J.ci % 3] + '"</div></div>'); toast(J.C.name + ' PAYS · +' + g2 + ' GOLD', 2.2); }
  function endOrder() { const C = J.C, KT0 = J.K, gold = J.gold, pf = J.perfect, gift = giveGift(), first = !K.stars('order'); save.best('hbBest', gold); { const k = { ...(save.stat('hbKits', null) || {}) }; k[J.kitK] = (k[J.kitK] || 0) + 1; save.setStat('hbKits', k); } stop();
    K.finish('order', pf >= 2 ? 3 : pf >= 1 ? 2 : 1, gold, first);
    toast('ORDER DONE · +' + gold + ' GOLD · ' + gift.label, 3.5); placeGears('pad');
    const nm = C.name.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '), kn = KT0.name.toLowerCase();
    const OPEN = [nm + ' went off with a lovely ' + kn + '. ' + gold + ' gold.', 'Splendid work. ' + gold + ' gold.', gold + ' gold. ' + nm + ' loves it.', 'One ' + kn + ', one happy customer. ' + gold + ' gold.'][save.stat('hbClears', 1) % 4];
    const GIFT = gift.kind === 'kite' ? 'A kite for you. Tap it in ITEMS outside.' : 'Plus a little extra. Stand back, now.';
    sayTo(endT, [ln(OPEN + ' ' + GIFT)], () => launch(), true); }
  function launch() { if (rk.t >= 0) return; rk.t = 0; rk.v = 0; rk.y = 0.21; whoosh(); }
  function rocketTick(dt) { if (rk.t < 0) return; rk.t += dt; const t = rk.t;
    for (const f of flaps) f.rotation.z = f.userData.s * -Math.min(1.4, Math.max(0, t - 0.2) * 2) * (t > 6 ? Math.max(0, 1 - (t - 6)) : 1);
    if (t < 1.1) { RK.position.x = RP.x + (Math.random() - 0.5) * 0.02; flame.visible = t > 0.5; } else { rk.v += dt * 6; rk.y += rk.v * dt; RK.position.x = RP.x; flame.visible = rk.y < 4.4; }
    flame.scale.set(1, 0.8 + Math.random() * 0.6, 1); RK.position.y = rk.y; RK.visible = rk.y < 4.6;
    rk.sm -= dt; if (rk.sm <= 0 && t < 3) { rk.sm = 0.12; const s = SMOKE.find(q => q.t > 1.6); if (s) { s.t = 0; s.m.visible = true; s.m.position.set(RP.x, 0.2, RP.z); s.vx = (Math.random() - 0.5) * 1.2; s.vz = (Math.random() - 0.5) * 1.2; } }
    if (t > 7.5) { rk.t = -1; RK.visible = true; RK.position.set(RP.x, 0.21, RP.z); flame.visible = false; placeGears('idle'); } }
  function jobTick(dt, fox) { J.t += dt; if (J.flies.length) flyTick(dt); if (fox) JW(fox, 'hobby build ' + (J.sub || ''));
    if (J.cust) kit.animFox && kit.animFox(J.cust, dt, 0);
    const pulse = 0.25 + 0.2 * Math.sin(performance.now() / 180); ghostM.opacity = J.held ? 0.3 + 0.25 * Math.sin(performance.now() / 120) : pulse;
    if (J.path) { const base = 1, ph = 1 + 0.35 * Math.sin(performance.now() / 140); J.path.pts.forEach((q, i) => { q.d.scale.setScalar(i === J.path.i ? base * ph : base); }); }
    if (J.held && !J.held.moved) J.held.p.g.position.y = TRAY.y + 0.1 + Math.sin(performance.now() / 150) * 0.01;
    if (J.sub === 'show') { J.MG.rotation.y += dt * 1.6; J.MG.position.y = M0.y + J.K.lift * SC + Math.min(0.12, J.t * 0.2); }
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } drawCard(); return; }
    if (J.sub === 'show' && J.t > 3.4) { endOrder(); return; } if (J) drawCard(); }
  function press() { if (!J || J.pause > 0) return; if (J.sub === 'build') buildPress(); else if (J.sub === 'pot') potPress(); }
  function drag(dt) { if (!J || J.pause > 0) return; if (J.sub === 'build') buildDrag(); else if (J.sub === 'paint') paintDrag(dt); }
  // ---- the order card ----
  const STEP_N = ['BUILD', 'PAINT'];
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 4px;font-size:10px;font-weight:900;border:2px solid #201e1d;overflow:hidden;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J || J.sub === 'show') return; const s = J.sub, K = J.K, S = J.scheme; let next = '', det = '', key = s + J.step;
    if (s === 'build' || s === 'built') { const done = J.parts.filter(q => q.done).length; key += done + '_' + (J.held ? (J.held.tap ? 't' : 'h') : '') + J.miss; next = J.held && J.held.tap ? 'TAP ITS YELLOW SHADOW' : 'DRAG A PART ONTO ITS YELLOW SHADOW';
      const seen = {}; det = J.parts.filter(q => { if (seen[q.name]) return false; seen[q.name] = 1; return true; }).map(q => { const all = J.parts.filter(r => r.name === q.name), d = all.filter(r => r.done).length; return row(PL, q.name + (all.length > 1 ? ' \u00d7' + all.length : ''), d >= all.length ? '\u2713' : all.length > 1 ? d + '/' + all.length : '\u2014', d >= all.length); }).join(''); }
    else if (s === 'pot' || s === 'paint') { const i = J.path ? J.path.i : 0, z = K.zones[J.zi]; key += J.zi + '_' + i; next = s === 'pot' ? 'TAP THE ' + PAINT[S[J.zi]].name + ' POT' : 'PAINT THE ' + z + ' · DRAG THE DOTS';
      det = K.zones.map((zz, j) => row(PAINT[S[j]].c, PAINT[S[j]].name + ' ' + zz, j < J.zi ? '\u2713' : j === J.zi ? (s === 'paint' && J.path ? i + '/' + J.path.pts.length : 'NOW') : '\u2014', j < J.zi)).join(''); }
    else return;
    setCard(key, head('STEP ' + J.step + ' OF 2', K.name + (J.gold ? ' · ' + J.gold + ' G' : '')) + foot(next) + '<div style="padding:8px 10px 10px">' + who(J.C) + (innerHeight >= 720 ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { clearDots(); J.objs.forEach(o => o.parent && o.parent.remove(o)); if (J.cust) { J.cust.visible = false; J.cust.userData.mood = J.cust.userData.base = 'neutral'; } } J = null; ptr.down = false; brush.visible = false; hideCard(); placeGears('idle'); }
  // ================= THE KITE (item: fly it from anywhere outside) =================
  let KT = null; const kiteOn = () => !!(KT && KT.on);
  function makeKite() { const g = new THREE.Group(), w = 1.1, h = 1.6, t = h * 0.36; [[[0, 0], [w / 2, 0], [0, t]], [[0, 0], [0, t], [-w / 2, 0]], [[0, 0], [-w / 2, 0], [0, t - h]], [[0, 0], [0, t - h], [w / 2, 0]]].forEach((p, i) => g.add(new THREE.Mesh(tri(...p), new THREE.MeshLambertMaterial({ color: i % 2 ? BLUE : RED, side: THREE.DoubleSide }))));
    g.add(mm(Bx(w, 0.025, 0.025), LM(YEL), 0, 0, 0.01), mm(Bx(0.025, h, 0.025), LM(YEL), 0, t - h / 2, 0.01)); const em = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); em.position.set(0, 0.05, 0.02); g.add(em);
    const tail = []; for (let i = 0; i < 8; i++) { const b = mm(Bx(0.22, 0.09, 0.02), LM(i % 2 ? YEL : RED)); scene.add(b); tail.push({ m: b, p: V() }); }
    const N = 18, lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3)); const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0x201e1d })); line.frustumCulled = false; scene.add(line); g.scale.setScalar(1.7); scene.add(g);
    return { on: false, g, tail, line, N, pos: V(), bot: t - h, show(v) { g.visible = v; line.visible = v; tail.forEach(q => { q.m.visible = v; }); } }; }
  const hand = P => V(P.x + Math.sin(P.yaw + 0.6) * 0.35, (P.y || 0) + 1.2, P.z + Math.cos(P.yaw + 0.6) * 0.35);
  const kiteBlocked = P => P.car || P.boat || P.ferry || P.swim || P.skate || P.tank || P.heli || P.ab || P.carousel || busy || (inside && inside());
  function reelIn(msg) { if (!KT) return; KT.on = false; KT.show(false); if (msg) toast(msg, 1.6); }
  function useItem(id, P) { if (id !== 'kite' || !hasKite()) return false; if (kiteOn()) { reelIn('KITE REELED IN'); tone(700, 0.04, 0.3, 'triangle', 0, 300); return true; }
    if (kiteBlocked(P)) { toast(inside && inside() ? 'TAKE THE KITE OUTSIDE' : 'NOT HERE', 1.4); return true; }
    if (!KT) KT = makeKite(); KT.on = true; KT.show(true); const h = hand(P); KT.pos.copy(h).add(V(0, 1.5, 0)); KT.tail.forEach(q => q.p.copy(KT.pos)); tone(400, 0.04, 0.6, 'triangle', 0, 1200); toast('KITE UP · TAP IT IN ITEMS AGAIN TO REEL IN', 2.6); return true; }
  function kiteTick(dt, P) { if (!kiteOn()) return; if (kiteBlocked(P)) { reelIn('KITE REELED IN'); return; } const t = performance.now() / 1000, h = hand(P), sp = Math.min(20, P.sp || 0), bx = Math.sin(P.yaw), bz = Math.cos(P.yaw);   // flies AHEAD of you so the follow camera sees it
    const d = 13 + sp * 0.3, up = 1.5 + sp * 0.1 + Math.sin(t * 1.7) * 0.4, sw = Math.sin(t * 0.8) * 1.8 + Math.sin(t * 2.3) * 0.5, T = V(h.x + bx * d - bz * sw, h.y + up, h.z + bz * d + bx * sw);
    KT.pos.lerp(T, Math.min(1, dt * 1.3)); const g = KT.g; g.position.copy(KT.pos); g.lookAt(h); g.rotateX(-0.45); g.rotateZ(Math.sin(t * 1.3) * 0.3);
    g.updateMatrixWorld(true); let prev = g.localToWorld(V(0, KT.bot, 0)); for (const q of KT.tail) { q.p.y -= dt * 1.5; q.p.x += -bx * 0 + Math.sin(t * 3 + q.p.y) * dt * 0.3; const dv = q.p.clone().sub(prev); const L = dv.length() || 1; q.p.copy(prev).addScaledVector(dv, 0.5 / L); q.m.scale.setScalar(1.6); q.m.position.copy(q.p); q.m.lookAt(prev); prev = q.p.clone(); }
    const a = KT.line.geometry.attributes.position, sag = h.distanceTo(KT.pos) * 0.06; for (let i = 0; i < KT.N; i++) { const u = i / (KT.N - 1); a.setXYZ(i, h.x + (KT.pos.x - h.x) * u, h.y + (KT.pos.y - h.y) * u - Math.sin(u * Math.PI) * sag, h.z + (KT.pos.z - h.z) * u); } a.needsUpdate = true; }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub;
    if (s === 'show') return [V(-133.6, 1.1, 126.6), 3.0, 1.5, 0.3, 2.2, -Math.PI / 2, 3.8];
    if (s === 'pot' || s === 'paint') return [V(-133.15, 1.02, 125.85), 1.9, 1.3, 0.9, 1.75, -Math.PI / 2, 3.0];
    return [V(-133.2, 1.0, 125.85), 1.9, 1.3, 0.9, 1.75, -Math.PI / 2, 3.0]; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.05; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(Math.max(X0 + 0.35, Math.min(X1 - 0.35, camCur.pos.x)), Math.min(4.0, camCur.pos.y), Math.max(Z0 + 0.35, Math.min(Z1 - 0.35, camCur.pos.z))); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'build') { const H = J.held; if (H && H.tap) { const gq = freeGhosts(H.p.kind)[0]; return gq ? [ghostW(gq), 'TAP ITS YELLOW SHADOW'] : null; } const p = J.parts.find(q => !q.done); return p ? [p.g.position.clone(), 'DRAG THE ' + p.name + ' TO ITS SHADOW'] : null; }
    if (s === 'pot') { const w = J.scheme[J.zi], p = POTS.find(q => q.k === w); return p ? [p.p.clone(), 'TAP THE ' + PAINT[w].name + ' POT'] : null; }
    if (s === 'paint' && J.path && J.path.i < J.path.pts.length) return [J.path.pts[J.path.i].p, 'DRAG ALONG THE DOTS'];
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 2.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  function prompt(P) { if (busy || !inShop(P) || P.skate) return null; if (at(P, SPOT.work)) return 'NEXT ORDER · BUILD A MODEL, PAINT IT'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, grT)) return 'TALK · GEARS'; return null; }
  // s70: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ["Ah, a visitor! Gears' Hobby Shop. Models, kits, kites, rockets. Fancy building one at my bench?", 'Back again? The yellow mark at the workbench is free.', 'A customer has a kit waiting. Steady hands today?', 'The train is on time and the glue is fresh. Splendid day for a job.'];
  const TIPS = ['Every part has its place. People are the same, mostly.', 'The goggles are magnifiers. The screwdriver? I forgot it was there. Forty years ago.', 'The rocket goes up when a job goes well. I keep a lot of spare rockets.',
    'Glue is patience in a tube.', 'The rare models are not for sale. The ship in the bottle took me a whole winter.', 'The train up there runs on time. Nothing else in Meru does.'];
  let lastP = null; const goWork = P => { if (P) Object.assign(P, { x: SPOT.work.x, z: SPOT.work.z, sp: 0 }); startOrder(); };
  const gearsMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } }, { text: "A TINKERER'S TIP, PLEASE", pick: () => sayTo(grT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(grT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P) || P.skate) return false;
    if (at(P, SPOT.work)) { startOrder(); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (!near(P, grT)) return false; pop(); gearsMenu(!talked++); return true; }
  function quit() { stop(); toast('ORDER CANCELLED · GOLD KEPT', 2); }
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; kiteTick(dt, P);
    if (busy === 'job' && !inShop(P)) stop();
    if (!G.visible) return; lastP = P; if (busy === 'job' && J) jobTick(dt, fox); hintTick(t);
    // train + puffs
    trainS += dt * 0.7; TRAIN.forEach((c, i) => { const q = trainAt(trainS - i * 0.42); c.position.set(q.x, TR.y, q.z); c.rotation.y = q.ry; });
    puffT -= dt; if (puffT <= 0) { puffT = 0.4; const p = PUFF.find(q => q.t > 1.4); if (p) { p.t = 0; p.m.visible = true; TRAIN[0].updateMatrixWorld(true); p.m.position.copy(TRAIN[0].localToWorld(V(0, 0.26, 0.14))); } }
    for (const p of PUFF) if (p.t < 1.4) { p.t += dt; p.m.position.y += dt * 0.25; p.m.scale.setScalar(1 + p.t * 1.5); p.m.material.opacity = 0.7 * (1 - p.t / 1.4); if (p.t >= 1.4) p.m.visible = false; }
    HANG.forEach((h, i) => { h.g.rotation.y = h.ry + Math.sin(t * 0.4 + i * 1.7) * h.k; if (h.bank) h.g.rotation.z = Math.sin(t * 0.6 + i) * 0.12; });
    for (const p of POTS) if (p.hop > 0) { p.hop = Math.max(0, p.hop - dt * 3); p.g.position.y = RIS.y + Math.sin(p.hop * Math.PI) * 0.05; }
    rocketTick(dt); for (const s of SMOKE) if (s.t < 1.6) { s.t += dt; s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt; s.m.position.y += dt * 0.4; s.m.scale.setScalar(1 + s.t * 2); s.m.material.opacity = 0.75 * (1 - s.t / 1.6); if (s.t >= 1.6) s.m.visible = false; }
    pool.material.opacity = 0.18 + 0.03 * Math.sin(t * 2);
    const work = busy === 'job' || rk.t >= 0; if (work) { const f0 = gears.userData.face0 ?? 0; gears.rotation.y += Math.atan2(Math.sin(f0 - gears.rotation.y), Math.cos(f0 - gears.rotation.y)) * Math.min(1, dt * 3); }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: work }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startOrder, gears, camera, save, useItem, kiteOn, launch,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); ptr.down = false; if (busy === 'job') release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); }, dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; if (busy === 'job') release(); },
    targets() { if (!J) return []; if (J.path) return J.path.pts.slice(J.path.i).map(q => scrW(q.p)); if (J.sub === 'pot') return [scrW(POTS.find(q => q.k === J.scheme[J.zi]).p)];
      if (J.sub === 'build') { const p = J.parts.find(q => !q.done); if (!p) return []; const gq = freeGhosts(p.kind)[0]; return [scrW(p.g.position), gq ? scrW(ghostW(gq)) : null]; } return []; },
    skipTo(s) { if (!J) startOrder(); J.pause = 0; J.after = null; J.flies.length = 0; J.held = null; if (s === 'paint') { for (const p of J.parts) if (!p.done) { const gq = freeGhosts(p.kind)[0]; gq.ghost.userData.used = true; gq.ghost.visible = false; J.MG.attach(p.g); p.g.position.copy(gq.at); p.g.rotation.set(0, 0, 0); p.g.scale.setScalar(1); p.done = true; } beginPaint(); } },
    hiring: K, dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__hobby = API; return API;
}
