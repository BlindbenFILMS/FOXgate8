// MERU 2.0 — s57 TOWN 2 INTERIOR 15: MERU HOSPITAL [meruHospital] (f 72..106 × -180..-152, front door S (89, -152), ambulance door W (72, -170)).
// DR. PATCH (calm, bad jokes) + NURSE HONEY (fast, kind, clipboard) — Ben's pick: a team.
// SIX SHORT GAMES, one per station (Ben's pick): CHECK-UP (exam room: stethoscope on the beat · eye chart · knee tap) · X-RAY (find it on the light board · tweezers)
// · BANDAGE (pharmacy counter: wrap along the dots: arm, paw, tail) · HEARTBEAT (ward bed 2: tap with the beep, keep it steady) · DIAGNOSE (reception: listen, pick 1 of 3)
// · STRETCHER RUSH (ambulance bay: wheel 3 patients to the right room). Gentle: no fail. The ROUNDS board ticks each game; all 6 = FULL ROUNDS bonus.
// Prizes per clear in turn: DOCTOR WHITES (white coat + stethoscope) → FIRST AID KIT → then +20 gold, a FIRST AID KIT every 3rd clear.
// Room: reception + take-a-number, waiting chairs, fish tank, kids' corner, pharmacy, exam room, x-ray room (lit light board), ward (4 beds + curtains),
// ambulance bay, ROOF LIFT (look out from the helipad), coat stand.
// s72 INTERIOR POLISH 15: shopKit (Nurse Honey = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board for all 6 games; badge), NOW HIRING by the front door,
// ONE-box menus with choices (Patch + Honey), 1-box lines, hint hand, touch radius 44, portrait lens, cameras clamped inside the room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildHospital({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false }) {
  const X0 = 72.4, X1 = 105.6, Z0 = -179.6, Z1 = -152.4, CX = 89, CZ = -166, CEIL = 4.8, PZ = -168, PH = 2.8;
  const G = new THREE.Group(); G.name = 'hospital'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const putM = (geo, m4, hex) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m4); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => putM(geo, new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)), hex);
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, putM, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 7), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), RG = mk(), { box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, fn }; return t; };
  const redraw = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const rect = (a, b, c2, d) => { const o = { f: [a, b, c2, d] }; cols.push(o); return o; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', MINT = '#9fd1c4', TEAL = '#2e8a80', STEEL = '#9aa3ab', DARK = '#3d3b3a', WOOD = '#8a6440', PALE = '#e4ebe8';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, par = G, rx = 0, tr = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: tr, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); par.add(m); return m; };
  const plane2 = (map, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.MeshBasicMaterial({ map }); for (const k of [0, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = ry + k * Math.PI; p.position.set(x + Math.sin(ry) * (k ? -0.006 : 0.006), y, z + Math.cos(ry) * (k ? -0.006 : 0.006)); par.add(p); } };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, s = 14) => new THREE.CylinderGeometry(a, b, h, s), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b), Co = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const subMesh = R => new THREE.Mesh(R.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  const crossFn = (bg, fg) => (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; const u = W / 5; g.fillRect(u * 2, u * 0.6, u, H - u * 1.2); g.fillRect(u * 0.6, H / 2 - u / 2, W - u * 1.2, u); };
  // ================= FLOOR (pale vinyl tiles) + way lines =================
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#e9ecea' : '#dde3e0'; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = 'rgba(32,30,29,0.22)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 2.4, (Z1 - Z0) / 2.4); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, (Z0 + Z1) / 2); G.add(f); }
  box(12.2, 0.012, 0.3, RED, 82.9, 0.08, -163.6); box(12.2, 0.012, 0.3, BLUE, 95.1, 0.08, -163.2); box(0.3, 0.012, 4.6, BLUE, 101, 0.08, -165.65);
  plane(label('EMERGENCY  \u2190', RED, '#ffffff', 512, 64, 36), 2.4, 0.3, 84.5, 0.085, -164.1, 0, G, -Math.PI / 2); plane(label('WARD  \u2192', BLUE, '#ffffff', 256, 64, 36), 1.4, 0.35, 94.6, 0.085, -162.7, 0, G, -Math.PI / 2);
  // ================= WALLS (ink skirting, mint wainscot, red rail, white) + ceiling with panel lights =================
  const wall = (len, x, z, ry, h = CEIL) => { box(len, 0.15, 0.07, INK, x, 0.075, z, ry); box(len, 1.05, 0.06, MINT, x, 0.675, z, ry); box(len, 0.08, 0.09, RED, x, 1.24, z, ry); box(len, h - 1.28, 0.06, WHITE, x, 1.28 + (h - 1.28) / 2, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0);   for (const [a, b] of [[X0, 87.6], [90.4, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0);
  for (const [a, b] of [[Z0, -171.6], [-168.4, Z1]]) wall(b - a, X0 + 0.03, (a + b) / 2, Math.PI / 2);
  wall(Z1 - Z0, X1 - 0.03, (Z0 + Z1) / 2, Math.PI / 2);
  { const sh = new THREE.Shape(); sh.moveTo(X0, Z0); sh.lineTo(X1, Z0); sh.lineTo(X1, Z1); sh.lineTo(X0, Z1); sh.lineTo(X0, Z0); const cm = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({ color: '#e8ecea' })); cm.rotation.x = Math.PI / 2; cm.position.y = CEIL; G.add(cm);
    const lm = new THREE.MeshBasicMaterial({ color: '#f6fbff' }), lg = new THREE.PlaneGeometry(1.2, 0.6); for (let x = 75.5; x < X1; x += 4.2) for (let z = -177; z < Z1; z += 4.2) { const p = new THREE.Mesh(lg, lm); p.rotation.x = Math.PI / 2; p.position.set(x, CEIL - 0.01, z); G.add(p); } }
  box(1.6, 0.02, 2.4, RED, X0 + 0.9, 0.08, -170); box(2.6, 0.02, 1.4, '#c9ced3', 89, 0.08, Z1 - 0.8);
  // partitions: solid room dividers + a glass-topped corridor wall
  const part = (x0, z0, x1, z1, glass) => { const along = Math.abs(z1 - z0) < 0.01, len = along ? x1 - x0 : z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, ry = along ? 0 : Math.PI / 2, sh = glass ? 1.3 : PH;
    box(len, 0.15, 0.16, INK, cx, 0.075, cz, ry); box(len, Math.min(1.2, sh) - 0.15, 0.14, MINT, cx, 0.15 + (Math.min(1.2, sh) - 0.15) / 2, cz, ry); box(len, 0.08, 0.16, RED, cx, 1.24, cz, ry);
    if (sh > 1.3) box(len, sh - 1.28, 0.14, WHITE, cx, 1.28 + (sh - 1.28) / 2, cz, ry); else { RG.box(len, PH - 1.3, 0.04, '#cfe8f0', cx, 1.3 + (PH - 1.3) / 2, cz, ry); for (let a = 0; a <= len; a += 1.6) box(0.06, PH - 1.3, 0.1, WHITE, along ? x0 + a : cx, 1.3 + (PH - 1.3) / 2, along ? cz : z0 + a, ry); }
    box(len + 0.04, 0.1, 0.2, WHITE, cx, PH + 0.05, cz, ry); rect(along ? x0 : cx - 0.1, along ? x1 : cx + 0.1, along ? cz - 0.1 : z0, along ? cz + 0.1 : z1); };
  for (const [a, b] of [[80, 83.1], [85.4, 91.4], [93.6, 99.8], [102.2, X1]]) part(a, PZ, b, PZ, true);
  for (const x of [80, 88.5, 96.5]) part(x, Z0, x, PZ, false);
  for (const x of [84.25, 92.5, 101]) box(0.08, 0.1, 2.5, WHITE, x, PH - 0.4, PZ, Math.PI / 2);
  const roomSign = (t, x) => plane2(label(t, INK, '#ffffff', 512, 64, 34), 2.2, 0.28, x, 3.25, PZ);
  roomSign('EXAM ROOM', 84.25); roomSign('X-RAY', 92.5); roomSign('WARD · 4 BEDS', 101); for (const x of [84.25, 92.5, 101]) for (const s of [-1, 1]) cyl(0.01, 0.01, CEIL - 3.4, INK, x + s * 1, 3.4 + (CEIL - 3.4) / 2, PZ, 4);
  // ================= RECEPTION: desk, take-a-number, NOW SERVING =================
  box(6.8, 1.0, 0.9, WHITE, 89, 0.5, -159); box(6.82, 0.2, 0.02, RED, 89, 0.82, -158.54); box(7.0, 0.05, 1.04, '#cfd6da', 89, 1.03, -159); rect(85.6, 92.4, -159.5, -158.5);
  plane(label('RECEPTION · PLEASE TAKE A NUMBER', INK, '#ffffff', 1024, 64, 34), 4.2, 0.27, 89, 0.45, -158.53);
  for (const x of [87.2, 90.8]) { box(0.5, 0.34, 0.04, DARK, x, 1.32, -159.2); box(0.46, 0.3, 0.01, '#5fa8c8', x, 1.32, -159.17); box(0.1, 0.16, 0.08, DARK, x, 1.1, -159.2); box(0.42, 0.02, 0.15, INK, x, 1.07, -158.85); }
  box(0.36, 0.05, 0.26, '#cfd6da', 89, 1.07, -158.8); cyl(0.05, 0.06, 0.04, '#c9a24a', 88.4, 1.08, -158.75, 12);
  cyl(0.04, 0.05, 1.1, INK, 93.3, 0.55, -157.9, 8); box(0.3, 0.3, 0.22, RED, 93.3, 1.2, -157.9); box(0.14, 0.04, 0.02, '#ffffff', 93.3, 1.16, -157.78); cols.push({ c: [93.3, -157.9, 0.25] });
  plane(label('TAKE A NUMBER', RED, '#ffffff', 256, 48, 26), 0.42, 0.08, 93.3, 1.42, -157.78);
  let served = 41; const servFn = (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.font = '900 34px Archivo, sans-serif'; g.fillText('NOW SERVING', 18, H / 2 + 2); g.fillStyle = RED; g.fillRect(W - 150, 10, 140, H - 20); g.fillStyle = '#ffffff'; g.font = '900 60px Archivo, sans-serif'; g.fillText(String(served), W - 130, H / 2 + 4); };
  const servTex = CT(512, 112, servFn); plane2(servTex, 2.2, 0.48, 89, 3.1, -159); for (const s of [-1, 1]) cyl(0.01, 0.01, CEIL - 3.34, INK, 89 + s * 0.95, 3.34 + (CEIL - 3.34) / 2, -159, 4);
  // ================= WAITING (two rows facing the desk) + water cooler + plant =================
  for (const x of [95.4, 97.8]) { box(0.08, 0.06, 5.6, INK, x, 0.45, -156.4); for (const z of [-158.6, -154.2]) box(0.5, 0.45, 0.08, INK, x, 0.225, z); for (let i = 0; i < 5; i++) { const z = -158.6 + i * 1.1; box(0.6, 0.08, 0.58, BLUE, x, 0.61, z); box(0.06, 0.6, 0.58, BLUE, x + 0.29, 0.95, z); }   /* s181 FOX SCALE seats (top 0.65, was 0.49) */ rect(x - 0.3, x + 0.32, -159.0, -153.8); }
  box(0.36, 0.95, 0.36, WHITE, 94.1, 0.48, -153.0); cyl(0.15, 0.15, 0.4, '#8fd0f0', 94.1, 1.15, -153.0, 12); cols.push({ c: [94.1, -153.0, 0.28] });
  cyl(0.24, 0.2, 0.45, DARK, 99.2, 0.23, -153.0); sph(0.45, GREEN, 99.2, 0.85, -153.0, 1, 1.3, 1); cols.push({ c: [99.2, -153.0, 0.35] });
  // ================= FISH TANK (south wall, west of the door) =================
  box(2.6, 0.8, 0.6, NAVY, 83.4, 0.4, -152.98); box(2.62, 0.08, 0.62, INK, 83.4, 1.74, -152.98); box(2.5, 0.08, 0.5, '#d8c69a', 83.4, 0.84, -152.98); rect(82.1, 84.7, -153.3, -152.4);
  for (const [x, h] of [[82.5, 0.4], [83.1, 0.25], [84.1, 0.45]]) R0.put(Co(0.07, h, 5), x, 0.88 + h / 2, -152.9, GREEN);
  const WATER = mm(Bx(2.5, 0.86, 0.5), new THREE.MeshLambertMaterial({ color: '#5fb8e8', transparent: true, opacity: 0.38, depthWrite: false }), 83.4, 1.3, -152.98); WATER.renderOrder = 2; G.add(WATER);
  const FISH = [0, 1, 2, 3, 4].map(i => { const g = new THREE.Group(), c = ['#f28c28', YEL, '#ff5a5a', '#5ad0ff', '#f28c28'][i]; g.add(mm(Sp(0.06, 8, 6), LM(c)), mm(Co(0.045, 0.08, 4), LM(c), -0.08, 0, 0, 0, 0, Math.PI / 2)); g.children[0].scale.set(1.4, 0.9, 0.6); G.add(g); return { g, ph: i * 1.3, y: 1.05 + i * 0.12, sp: 0.4 + i * 0.07 }; });
  plane(label('MEET THE FISH · BUBBLES · SPLASH · DOC', NAVY, YEL, 1024, 64, 30), 2.4, 0.15, 83.4, 0.6, -152.67);
  // ================= COAT STAND (doctor whites on / off) =================
  cyl(0.03, 0.03, 1.9, WOOD, 86.4, 0.95, -153.1, 8); cyl(0.25, 0.25, 0.04, WOOD, 86.4, 0.02, -153.1, 14); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; box(0.22, 0.03, 0.03, WOOD, 86.4 + Math.cos(a) * 0.1, 1.8, -153.1 + Math.sin(a) * 0.1, -a); } cols.push({ c: [86.4, -153.1, 0.25] });
  const standCoat = new THREE.Group(); standCoat.add(mm(Bx(0.5, 0.95, 0.24), LM(WHITE), 0, 1.3, 0), mm(Bx(0.06, 0.9, 0.25), LM('#dfe6ea'), 0, 1.3, 0.01), mm(new THREE.TorusGeometry(0.1, 0.012, 6, 14, Math.PI), LM(INK), 0, 1.62, 0.13, 0, 0, Math.PI)); standCoat.position.set(86.4, 0, -153.0); G.add(standCoat);
  // ================= KIDS' CORNER (south-east) =================
  { const rug = CT(256, 320, (g, W, H) => { const cs = [RED, YEL, BLUE, GREEN, '#f28c28', '#c75b9b']; for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) { g.fillStyle = cs[(i + j * 2) % cs.length]; g.fillRect(i * 64, j * 64, 64, 64); } g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); });
    plane(rug, 4.6, 5.6, 102.9, 0.078, -156.0, 0, G, -Math.PI / 2); }
  { const bx = 104.3, bz = -154.0; for (const s of [-1, 1]) R0.put(new THREE.TorusGeometry(0.6, 0.03, 5, 14, Math.PI * 0.5), bx, 0.62, bz + s * 0.18, RED, 0, 0, Math.PI * 1.25);
    box(0.7, 0.3, 0.26, '#c98a4a', bx, 0.62, bz); box(0.18, 0.42, 0.2, '#c98a4a', bx + 0.34, 0.86, bz, 0, 0, -0.4); box(0.26, 0.16, 0.18, '#c98a4a', bx + 0.48, 1.04, bz); for (const s of [-1, 1]) box(0.04, 0.32, 0.04, '#c98a4a', bx + s * 0.25, 0.42, bz); box(0.1, 0.3, 0.06, INK, bx + 0.28, 0.96, bz); cols.push({ c: [bx, bz, 0.55] }); }
  { const L2 = ['A', 'B', 'C', 'M', 'E', 'R', 'U', '8', 'F'], cs = [RED, YEL, BLUE, GREEN, '#f28c28']; L2.forEach((ch, i) => { const x = 101.4 + (i % 3) * 0.32, z = -155.6 + Math.floor(i / 3) * 0.34 + (i % 2) * 0.05, y = 0.12 + (i === 4 ? 0.24 : 0); box(0.24, 0.24, 0.24, cs[i % cs.length], x, y, z, i * 0.3); }); }
  box(1.1, 0.55, 0.6, RED, 101.0, 0.28, -153.1); box(1.14, 0.06, 0.64, YEL, 101.0, 0.58, -153.1); rect(100.4, 101.6, -153.45, -152.75);
  box(0.9, 0.04, 0.6, YEL, 102.6, 0.5, -157.9); for (const [dx, dz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) box(0.04, 0.48, 0.04, BLUE, 102.6 + dx, 0.25, -157.9 + dz); for (const s of [-1, 1]) { box(0.3, 0.04, 0.3, GREEN, 102.6 + s * 0.75, 0.3, -157.9); box(0.3, 0.3, 0.04, GREEN, 102.6 + s * 0.75, 0.46, -157.9 - 0.15); } rect(101.7, 103.5, -158.3, -157.5);
  for (let i = 0; i < 4; i++) box(0.12, 0.02, 0.02, [RED, BLUE, GREEN, YEL][i], 102.4 + i * 0.1, 0.53, -157.8, i * 0.4);
  sph(0.18, '#a8743a', 104.9, 0.22, -158.6, 1, 1.1, 0.9); sph(0.13, '#a8743a', 104.9, 0.5, -158.6); for (const s of [-1, 1]) sph(0.05, '#a8743a', 104.9 + s * 0.09, 0.62, -158.6);
  { const draws = [(g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.beginPath(); g.arc(70, 60, 34, 0, 7); g.fill(); g.strokeStyle = YEL; g.lineWidth = 6; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; g.beginPath(); g.moveTo(70 + Math.cos(a) * 42, 60 + Math.sin(a) * 42); g.lineTo(70 + Math.cos(a) * 60, 60 + Math.sin(a) * 60); g.stroke(); } g.fillStyle = GREEN; g.fillRect(0, H - 40, W, 40); },
      (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = '#f28c28'; g.beginPath(); g.moveTo(60, 70); g.lineTo(196, 70); g.lineTo(128, 190); g.fill(); g.beginPath(); g.moveTo(64, 74); g.lineTo(84, 20); g.lineTo(110, 70); g.fill(); g.beginPath(); g.moveTo(146, 70); g.lineTo(172, 20); g.lineTo(192, 74); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(104, 100, 9, 0, 7); g.arc(152, 100, 9, 0, 7); g.fill(); g.fillStyle = RED; g.font = '900 30px Archivo, sans-serif'; g.fillText('DR PATCH', 40, 236); },
      (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(60, 110, 136, 110); g.fillStyle = BLUE; g.beginPath(); g.moveTo(40, 112); g.lineTo(128, 40); g.lineTo(216, 112); g.fill(); g.fillStyle = YEL; g.fillRect(110, 160, 36, 60); g.fillStyle = INK; g.font = '900 26px Archivo, sans-serif'; g.fillText('GET WELL', 70, 246); }];
    draws.forEach((fn, i) => plane(CT(256, 256, fn), 0.8, 0.8, X1 - 0.07, 1.7, -157.8 + i * 1.6, -Math.PI / 2)); }
  plane(label("KIDS' CORNER", YEL, INK, 512, 64, 36), 2.0, 0.25, X1 - 0.07, 2.65, -156.2, -Math.PI / 2);
  // ================= PHARMACY (south-west) =================
  box(6.0, 1.0, 0.7, WHITE, 76.4, 0.5, -158.2); box(6.02, 0.18, 0.02, GREEN, 76.4, 0.82, -158.56); box(6.1, 0.05, 0.8, '#cfd6da', 76.4, 1.02, -158.2); rect(73.4, 79.4, -158.6, -157.8);
  plane(label('PHARMACY · FIRST AID', GREEN, '#ffffff', 512, 64, 34), 2.6, 0.32, 76.4, 0.48, -158.57);
  { let s = 5; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280, BC = [RED, '#ffffff', BLUE, YEL, GREEN, '#f28c28', '#c75b9b'];
    box(6.6, 2.6, 0.4, '#d9dee3', 76.6, 1.3, Z1 - 0.25); for (let k = 0; k < 4; k++) { box(6.5, 0.04, 0.38, '#bfc6cc', 76.6, 0.4 + k * 0.55, Z1 - 0.3); for (let x = 73.6; x < 79.7; x += 0.22 + r() * 0.1) box(0.14, 0.18 + r() * 0.14, 0.14, BC[Math.floor(r() * BC.length)], x, 0.42 + k * 0.55 + 0.12, Z1 - 0.32); }
    box(0.4, 2.6, 4.2, '#d9dee3', X0 + 0.25, 1.3, -155.0); for (let k = 0; k < 4; k++) { box(0.38, 0.04, 4.1, '#bfc6cc', X0 + 0.3, 0.4 + k * 0.55, -155.0); for (let z = -156.9; z < -153.1; z += 0.24 + r() * 0.08) box(0.14, 0.18 + r() * 0.12, 0.14, BC[Math.floor(r() * BC.length)], X0 + 0.32, 0.54 + k * 0.55, z); } }
  rect(73.2, 80.0, Z1 - 0.5, Z1); rect(X0, X0 + 0.5, -157.2, -152.8);
  { const gc = CT(128, 128, crossFn(GREEN, '#ffffff')); plane2(gc, 0.7, 0.7, 76.4, 3.1, -158.2); plane2(label('PHARMACY', INK, '#ffffff', 512, 64, 36), 2.0, 0.26, 76.4, 2.6, -158.2); for (const s of [-1, 1]) cyl(0.01, 0.01, CEIL - 3.4, INK, 76.4 + s * 0.3, 3.4 + (CEIL - 3.4) / 2, -158.2, 4); }
  box(0.3, 0.12, 0.22, DARK, 74.2, 1.11, -158.2); cyl(0.05, 0.06, 0.04, '#c9a24a', 78.8, 1.06, -158.1, 12);
  // ================= ROUNDS BOARD (whiteboard on wheels, corridor) =================
  const GAMES = [['checkup', 'CHECK-UP'], ['xray', 'X-RAY'], ['bandage', 'BANDAGE'], ['heart', 'HEARTBEAT'], ['diagnose', 'DIAGNOSE'], ['rush', 'STRETCHER RUSH']];
  const doneMap = () => { const d = save.stat('hsDone', null); return d && typeof d === 'object' ? d : {}; };
  const roundsFn = (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, 64); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.font = '900 34px Archivo, sans-serif'; g.fillText("TODAY'S ROUNDS", 16, 34); const d = doneMap();
    GAMES.forEach(([k, n], i) => { const y = 92 + i * 42; g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(18, y - 14, 28, 28); if (d[k]) { g.strokeStyle = GREEN; g.lineWidth = 7; g.beginPath(); g.moveTo(22, y); g.lineTo(31, y + 10); g.lineTo(46, y - 14); g.stroke(); } g.fillStyle = INK; g.font = '800 26px Archivo, sans-serif'; g.fillText(n, 62, y + 2); });
    g.fillStyle = d.full ? GREEN : '#9a948c'; g.font = '900 20px Archivo, sans-serif'; g.fillText(d.full ? 'FULL ROUNDS DONE · THANK YOU!' : 'ALL 6 = FULL ROUNDS BONUS', 18, H - 18); };
  const roundsTex = CT(512, 384, roundsFn); box(1.9, 1.45, 0.06, STEEL, 82.6, 1.65, -162.4); plane(roundsTex, 1.8, 1.35, 82.6, 1.65, -162.36);
  for (const s of [-1, 1]) { box(0.05, 1.0, 0.05, STEEL, 82.6 + s * 0.85, 0.5, -162.4); box(0.05, 0.05, 0.6, STEEL, 82.6 + s * 0.85, 0.04, -162.4); } rect(81.6, 83.6, -162.7, -162.1);
  // ================= LIFT to the roof (east wall) =================
  box(0.1, 2.5, 2.0, STEEL, X1 - 0.08, 1.25, -164.5); box(0.12, 2.5, 0.03, INK, X1 - 0.08, 1.25, -164.5); box(0.12, 2.7, 0.15, RED, X1 - 0.08, 1.35, -165.6); box(0.12, 2.7, 0.15, RED, X1 - 0.08, 1.35, -163.4); box(0.12, 0.15, 2.35, RED, X1 - 0.08, 2.65, -164.5);
  box(0.06, 0.24, 0.12, DARK, X1 - 0.08, 1.2, -165.95); sph(0.035, YEL, X1 - 0.12, 1.24, -165.95);
  plane(label('LIFT · ROOF HELIPAD', INK, YEL, 512, 64, 34), 1.9, 0.24, X1 - 0.07, 3.0, -164.5, -Math.PI / 2);
  // ================= AMBULANCE BAY (west, the side door) =================
  plane(CT(256, 256, (g, W, H) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, W, H); g.fillStyle = RED; for (let i = -8; i < 16; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32 + 16, 0); g.lineTo(i * 32 + 16 + H, H); g.lineTo(i * 32 + H, H); g.fill(); } g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10); }), 5.0, 5.0, 75.6, 0.076, -170, 0, G, -Math.PI / 2);
  plane(label('EMERGENCY · AMBULANCE BAY', RED, '#ffffff', 1024, 64, 36), 3.6, 0.32, X0 + 0.07, 3.1, -170, Math.PI / 2);
  { const parkS = (x, z) => { box(2.0, 0.06, 0.62, STEEL, x, 0.78, z); box(1.9, 0.1, 0.56, '#3fb6a8', x, 0.86, z); box(0.4, 0.08, 0.45, '#ffffff', x + 0.7, 0.94, z); for (const dx of [-0.85, 0.85]) for (const dz of [-0.26, 0.26]) { box(0.04, 0.7, 0.04, STEEL, x + dx, 0.42, z + dz); cyl(0.06, 0.06, 0.05, INK, x + dx, 0.06, z + dz, 10, Math.PI / 2); } for (const s of [-1, 1]) box(2.0, 0.04, 0.04, STEEL, x, 0.98, z + s * 0.3); rect(x - 1.05, x + 1.05, z - 0.36, z + 0.36); };
    parkS(75.4, -178.6); parkS(75.4, -177.3); }
  { const x = 78.7, z = -178.6; box(0.5, 0.06, 0.48, '#3d5a7a', x, 0.5, z); box(0.5, 0.55, 0.06, '#3d5a7a', x, 0.8, z - 0.24); for (const s of [-1, 1]) R0.put(new THREE.TorusGeometry(0.3, 0.025, 6, 18), x + s * 0.28, 0.32, z - 0.05, INK, Math.PI / 2); cols.push({ c: [x, z, 0.45] }); }
  for (let i = 0; i < 3; i++) { cyl(0.12, 0.12, 1.1, GREEN, 72.9 + i * 0.3, 0.55, -175.6, 10); sph(0.12, GREEN, 72.9 + i * 0.3, 1.1, -175.6); cyl(0.03, 0.03, 0.12, STEEL, 72.9 + i * 0.3, 1.24, -175.6, 6); } rect(X0, 73.8, -175.9, -175.3);
  box(0.5, 1.6, 0.4, '#ffffff', 79.4, 0.8, -162.2); { const t = CT(128, 128, crossFn(RED, '#ffffff')); plane(t, 0.34, 0.34, 79.4, 1.2, -161.99); } rect(79.15, 79.65, -162.4, -162.0);
  // ================= EXAM ROOM =================
  box(2.0, 0.62, 0.8, WHITE, 84.2, 0.31, -176.6); box(2.0, 0.14, 0.8, MINT, 84.2, 0.69, -176.6); box(1.5, 0.01, 0.6, '#ffffff', 84.0, 0.765, -176.6); box(0.4, 0.12, 0.62, '#ffffff', 85.0, 0.82, -176.6, 0, 0, 0.2); rect(83.15, 85.25, -177.05, -176.15);
  box(6.0, 0.9, 0.6, WHITE, 84.25, 0.45, -179.25); box(6.05, 0.05, 0.64, '#cfd6da', 84.25, 0.92, -179.25); box(6.0, 0.7, 0.35, WHITE, 84.25, 2.25, -179.38); for (let i = 0; i < 6; i++) { box(0.2, 0.03, 0.03, STEEL, 81.75 + i, 0.75, -178.93); box(0.2, 0.03, 0.03, STEEL, 81.75 + i, 2.0, -179.19); }
  box(0.5, 0.05, 0.36, STEEL, 86.2, 0.95, -179.25); cyl(0.015, 0.015, 0.3, STEEL, 86.2, 1.1, -179.4, 6); for (let i = 0; i < 3; i++) { cyl(0.06, 0.06, 0.18, '#cfe8f0', 82.2 + i * 0.25, 1.04, -179.2, 10); cyl(0.065, 0.065, 0.03, [RED, BLUE, GREEN][i], 82.2 + i * 0.25, 1.14, -179.2, 10); } rect(81.2, 87.3, -179.6, -178.9);
  { const x = 87.4, z = -170.6; box(0.4, 0.06, 0.4, '#cfd6da', x, 0.03, z); box(0.06, 1.7, 0.06, STEEL, x, 0.85, z - 0.16); box(0.36, 0.04, 0.06, STEEL, x, 1.7, z - 0.1); cols.push({ c: [x, z, 0.3] }); }
  cyl(0.2, 0.2, 0.05, INK, 85.9, 0.55, -174.6, 12); cyl(0.03, 0.03, 0.5, STEEL, 85.9, 0.28, -174.6, 6);
  const ROWS = ['E', 'FP', 'TOZ', 'LPED', 'PECFD'], LETS = 'EFPTOZLDCHNR';
  let eyeHi = null; const chartFn = (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; const sz = [110, 72, 52, 38, 28]; let y = 70;
    ROWS.forEach((r, ri) => { g.font = '900 ' + sz[ri] + 'px Archivo, sans-serif'; const gap = sz[ri] * 1.05, x0 = W / 2 - (r.length - 1) * gap / 2; for (let k = 0; k < r.length; k++) { g.fillStyle = INK; g.fillText(r[k], x0 + k * gap, y); if (eyeHi && eyeHi[0] === ri && eyeHi[1] === k) { g.strokeStyle = RED; g.lineWidth = 6; g.strokeRect(x0 + k * gap - sz[ri] * 0.55, y - sz[ri] * 0.58, sz[ri] * 1.1, sz[ri] * 1.1); } } y += sz[ri] * 1.35 + 8; });
    g.textAlign = 'left'; };
  const chartTex = CT(256, 400, chartFn); plane(chartTex, 0.82, 1.28, 80.1, 1.75, -173.4, Math.PI / 2);
  // ================= X-RAY ROOM =================
  box(2.2, 0.78, 0.8, '#cfd6da', 92.5, 0.39, -175.6); box(2.2, 0.08, 0.8, MINT, 92.5, 0.82, -175.6); rect(91.4, 93.6, -176.0, -175.2);
  box(0.42, 2.6, 0.42, WHITE, 95.7, 1.3, -175.6); box(3.4, 0.24, 0.34, WHITE, 94.0, 2.45, -175.6); box(0.5, 0.36, 0.5, WHITE, 92.5, 2.15, -175.6); R0.put(Co(0.22, 0.3, 4), 92.5, 1.86, -175.6, DARK, Math.PI / 4, Math.PI); box(0.06, 0.06, 0.08, YEL, 92.75, 2.2, -175.34); rect(95.45, 95.95, -175.85, -175.35);
  box(3.2, 1.9, 0.06, DARK, 92.5, 2.25, Z0 + 0.06);
  for (const [z, c] of [[-177.4, NAVY], [-176.5, RED]]) { box(0.05, 1.0, 0.55, c, 88.6, 1.6, z); box(0.08, 0.06, 0.08, STEEL, 88.6, 2.12, z); }
  box(0.9, 0.04, 0.5, STEEL, 93.2, 0.92, -174.4); for (const [dx, dz] of [[-0.4, -0.2], [0.4, -0.2], [-0.4, 0.2], [0.4, 0.2]]) box(0.03, 0.9, 0.03, STEEL, 93.2 + dx, 0.46, -174.4 + dz); rect(92.7, 93.7, -174.7, -174.1);
  cyl(0.12, 0.09, 0.04, '#d9dee3', 92.92, 0.96, -174.4, 16); plane(label('X-RAY · LEAD APRONS ON', INK, YEL, 512, 64, 30), 1.6, 0.2, 92.5, 0.5, -175.19);
  const INUSE = mm(Bx(0.8, 0.22, 0.1), new THREE.MeshBasicMaterial({ color: '#5a2a22' }), 92.5, PH + 0.3, PZ + 0.06); G.add(INUSE); plane(label('IN USE', INK, '#ffffff', 128, 48, 26), 0.5, 0.15, 92.5, PH + 0.3, PZ + 0.115, 0);
  // ================= WARD: 4 beds, curtains, monitors =================
  const BEDZ = [-178.0, -175.2, -172.4, -169.6], BX = 104.4;
  const curtFn = (g, W, H) => { g.fillStyle = '#cfe4ec'; g.fillRect(0, 0, W, H); for (let x = 0; x < W; x += 16) { g.fillStyle = 'rgba(46,74,107,0.18)'; g.fillRect(x, 0, 7, H); } g.fillStyle = '#9fc4d4'; g.fillRect(0, H - 14, W, 14); };
  const curtTex = CT(256, 128, curtFn);
  BEDZ.forEach((z, i) => { box(2.1, 0.1, 1.0, STEEL, BX, 0.55, z); box(2.0, 0.16, 0.92, '#ffffff', BX, 0.68, z); box(0.06, 0.8, 1.0, STEEL, X1 - 0.12, 0.8, z); box(0.06, 0.45, 1.0, STEEL, BX - 1.05, 0.62, z); for (const dx of [-0.95, 0.95]) for (const dz of [-0.42, 0.42]) box(0.04, 0.5, 0.04, STEEL, BX + dx, 0.25, z + dz);
    box(0.36, 0.1, 0.6, '#ffffff', X1 - 0.42, 0.81, z); if (i === 3) box(1.3, 0.06, 0.94, BLUE, BX - 0.3, 0.78, z); rect(BX - 1.08, X1, z - 0.52, z + 0.52);
    box(0.4, 0.55, 0.4, WHITE, X1 - 0.25, 0.28, z + 0.85); cols.push({ c: [X1 - 0.25, z + 0.85, 0.28] }); box(0.04, 0.5, 0.04, STEEL, X1 - 0.08, 1.45, z - 0.66); });
  cyl(0.06, 0.05, 0.2, '#cfe8f0', X1 - 0.25, 0.66, BEDZ[0] + 0.85, 10); for (let k = 0; k < 5; k++) sph(0.05, [RED, YEL, '#ffffff', '#c75b9b', '#f28c28'][k], X1 - 0.25 + Math.cos(k) * 0.06, 0.82, BEDZ[0] + 0.85 + Math.sin(k) * 0.06);
  for (const z of [-176.6, -173.8, -171.0]) { box(3.1, 0.04, 0.04, STEEL, 104.05, 2.45, z); plane2(curtTex, 3.0, 2.15, 104.05, 1.32, z); }
  box(0.04, 0.04, 8.6, STEEL, 102.5, 2.45, -174.3); plane2(curtTex, 1.3, 2.15, 102.5, 1.32, -177.85, Math.PI / 2); plane2(curtTex, 1.3, 2.15, 102.5, 1.32, -172.2, Math.PI / 2);
  plane(label('PLEASE LET THEM SLEEP', BLUE, '#ffffff', 512, 64, 30), 1.8, 0.22, X1 - 0.07, 3.1, -173.8, -Math.PI / 2);
  const monFn = (lines, bpm, ok = true) => (g, W, H) => { g.fillStyle = '#071410'; g.fillRect(0, 0, W, H); g.strokeStyle = ok ? '#7cff9b' : '#ffd23a'; g.lineWidth = 4; g.beginPath(); lines.forEach((v, i) => { const x = i / (lines.length - 1) * (W - 70), y = H * 0.55 - v * H * 0.4; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); g.fillStyle = ok ? '#7cff9b' : '#ffd23a'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(String(bpm), W - 64, H * 0.3); g.font = '800 14px Archivo, sans-serif'; g.fillText('BPM', W - 60, H * 0.55); };
  const flatTrace = n => { const a = []; for (let i = 0; i < 96; i++) { const k = (i + n * 13) % 24; a.push(k === 6 ? 0.9 : k === 7 ? -0.5 : k === 9 ? 0.18 : 0); } return a; };
  const MONS = BEDZ.slice(0, 3).map((z, i) => { const t = CT(256, 160, monFn(flatTrace(i), 62 + i * 7)); box(0.08, 0.42, 0.6, DARK, X1 - 0.1, 1.72, z - 0.66); plane(t, 0.54, 0.36, X1 - 0.155, 1.72, z - 0.66, -Math.PI / 2); return t; });
  // ================= keepers: DR. PATCH + NURSE HONEY =================
  function stetho(par, y = 1.1) { const g = new THREE.Group(), tm = LM(INK); g.add(mm(new THREE.TorusGeometry(0.15, 0.014, 6, 18, Math.PI * 1.2), tm, 0, y, 0.04, Math.PI / 2 - 0.25, 0, -Math.PI * 0.6)); for (const s of [-1, 1]) g.add(mm(Cy(0.013, 0.013, 0.34, 5), tm, s * 0.08, y - 0.2, 0.2, 0.15, 0, s * 0.1)); g.add(mm(Cy(0.045, 0.045, 0.025, 12), LM(STEEL), 0.07, y - 0.38, 0.24, Math.PI / 2 - 0.2)); par.add(g); g.traverse(o => { o.renderOrder = 2; }); return g; }
  const PL = { fur: '#9aa3ab', furDark: '#6f7880', muzzle: '#f3f2f2', snout: '#e8e8e8', chin: '#ffffff', fluff: '#ffffff' };
  const patch = kit.makeFox({ key: 'patchHosp', torso: ['#f3f2f2', '#dfe6ea', '#9fb4c4'], outfit: 'coat', mood: 'happy', eyes: ['#3a5a7a', '#3a5a7a'], look: PL });
  { const P = patch.userData && patch.userData.P; if (P && P.body) stetho(P.body); if (P && P.head) { const hm = mm(Cy(0.07, 0.07, 0.015, 14), LM('#d9dee3'), 0, 0.36, 0.16, Math.PI / 2 - 0.4); P.head.add(hm); hm.renderOrder = 2; } if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; }
  const HL = { fur: '#e6a43a', furDark: '#b9781e', muzzle: '#fff4e0', snout: '#fbe8c8', chin: '#fffaf0', fluff: '#fffaf0', lashes: 1, blush: 0.3, eyeSize: 1.15 };
  const honey = kit.makeFox({ key: 'honeyHosp', torso: ['#3fb6a8', '#2e8a80', '#1f5f58'], outfit: 'vest', mood: 'happy', eyes: ['#5a3a1a', '#5a3a1a'], look: HL });
  { const P = honey.userData && honey.userData.P; if (P && P.head) { const cap = new THREE.Group(); cap.add(mm(Bx(0.26, 0.1, 0.16), LM('#ffffff')), mm(Bx(0.07, 0.02, 0.012), LM(RED), 0, 0.01, 0.082), mm(Bx(0.02, 0.07, 0.012), LM(RED), 0, 0.01, 0.082)); cap.position.set(0, 0.4, 0.05); P.head.add(cap); cap.traverse(o => { o.renderOrder = 2; }); }
    if (P && P.body) { const cb = new THREE.Group(); cb.add(mm(Bx(0.26, 0.34, 0.02), LM(WOOD)), mm(Bx(0.22, 0.26, 0.024), LM('#ffffff'), 0, -0.02, 0), mm(Bx(0.1, 0.04, 0.03), LM(STEEL), 0, 0.16, 0)); cb.position.set(0.1, 0.9, 0.3); cb.rotation.x = -0.5; P.body.add(cb); cb.traverse(o => { o.renderOrder = 2; }); }
    if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; }
  G.add(patch, honey); const pCol = { c: [0, 0, 0.45] }, hCol = { c: [0, 0, 0.45] }; cols.push(pCol, hCol);
  const KS = { idle: { p: [83.2, -163.9, 0.5], h: [86.6, -160.2, 0] }, checkup: { p: [85.9, -175.4, -Math.PI / 2] }, xray: { p: [94.4, -174.2, -2.4] }, bandage: { h: [74.4, -156.7, Math.PI] }, heart: { h: [102.0, -173.4, Math.PI / 2] }, diagnose: { h: [86.6, -160.2, 0] }, rush: { h: [75.2, -164.6, Math.PI / 2] } };
  const placeK = g => { const s = KS[g] || {}, i = KS.idle, a = s.p || i.p, b = s.h || i.h; patch.position.set(a[0], 0, a[1]); patch.rotation.y = patch.userData.face0 = a[2]; pCol.c[0] = a[0]; pCol.c[1] = a[1]; honey.position.set(b[0], 0, b[1]); honey.rotation.y = honey.userData.face0 = b[2]; hCol.c[0] = b[0]; hCol.c[1] = b[1]; }; placeK('idle');
  const pT = { key: 'patchHosp', obj: patch, ry: 0, r: 3.0 }, hT = { key: 'honeyHosp', obj: honey, ry: 0, r: 3.0 }, endP = { key: 'patchEnd', obj: patch, ry: 0, r: 14 }, endH = { key: 'honeyEnd', obj: honey, ry: 0, r: 14 }, ptT = { key: 'hsPatient', obj: patch, ry: 0, r: 14 };
  const lp = text => ({ who: 'DR. PATCH', role: 'DOCTOR', text }), lh = text => ({ who: 'NURSE HONEY', role: 'NURSE', text }), lx = (who, text) => ({ who, role: 'PATIENT', text });
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ================= patients (4 town foxes, made the first time they are needed) + 3 sleepers in the ward =================
  const PAT = [{ name: 'PELL', look: { fur: '#c9743a', furDark: '#9a5426', muzzle: '#f6e2cc' }, torso: ['#5a8ac8', '#3d6aa0', '#2a4a70'], outfit: 'vest' },
    { name: 'FLICK', look: { fur: '#e07a30', furDark: '#b05a1e', muzzle: '#fff0e0' }, torso: [YEL, '#c9a020', '#8a6a10'], outfit: 'vest' },
    { name: 'KIA', look: { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, torso: ['#c75b9b', '#9a4078', '#6a2a50'], outfit: 'dress' },
    { name: 'OTTO', look: { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, torso: ['#3f9a5e', '#2e7a48', '#1f5a34'], outfit: 'suit' }];
  const pf = [];
  const mkP = (key, o) => { const f = kit.makeFox({ key, torso: o.torso, outfit: o.outfit, mood: 'neutral', eyes: ['#3a2a1a', '#3a2a1a'], look: o.look }); const P = f.userData && f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; const H = new THREE.Group(); H.add(f); H.visible = false; G.add(H); return { H, f, P, name: o.name, pose: 'stand', sp: 0 }; };
  const pat = i => pf[i % 4] || (pf[i % 4] = mkP('hsPat' + (i % 4), PAT[i % 4]));
  const legs = (p, a) => { if (p.P && p.P.legs) p.P.legs.forEach(l => { l.rotation.x = a; }); };
  function pose(p, kind, x, y, z, yaw) { const f = p.f, fs = f.scale.y || 1; p.H.visible = true; p.H.rotation.set(0, yaw, 0); f.rotation.set(0, 0, 0); f.position.set(0, 0, 0); p.pose = kind; legs(p, 0);
    if (kind === 'sit') { legs(p, -1.45); p.H.position.set(x, y - 0.5 * fs, z); } else if (kind === 'lie') { f.rotation.x = -Math.PI / 2; p.H.position.set(x, y + 0.2 * fs, z); } else p.H.position.set(x, y, z); }
  const hideP = () => pf.forEach(p => { if (p) p.H.visible = false; });
  const SLEEP = [{ name: 'MARLA', look: { fur: '#b07a5a', furDark: '#80563c', muzzle: '#f4e4d8', lashes: 1 }, torso: ['#e8e0f0', '#c8c0d8', '#a8a0b8'], outfit: 'vest' }, { name: 'THE FISHERMAN', look: { fur: '#a0703a', furDark: '#704a20', muzzle: '#efe0c8' }, torso: ['#e8e0f0', '#c8c0d8', '#a8a0b8'], outfit: 'vest' }, { name: 'MICHAEL JAY', look: { fur: '#5a4a3a', furDark: '#3a2e22', muzzle: '#e0d4c4' }, torso: ['#e8e0f0', '#c8c0d8', '#a8a0b8'], outfit: 'vest' }];
  const WARD = SLEEP.map((o, i) => { const p = mkP('hsWard' + i, o); pose(p, 'lie', 103.5, 0.77, BEDZ[i], -Math.PI / 2); box(1.4, 0.36, 0.96, i === 1 ? '#c75b9b' : BLUE, 104.0, 0.95, BEDZ[i]); box(0.06, 0.37, 0.97, '#ffffff', 104.68, 0.955, BEDZ[i]); return p; });
  // ================= state, toast, sound =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, RU = null, LOOK = null, lastP = null, K = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.9); tone(2093, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), beep = () => tone(880, 0.05, 0.1, 'square'), thump = () => { tone(70, 0.14, 0.16); tone(58, 0.1, 0.16, 'sine', 0.14); }, cheer = () => { tone(784, 0.05, 0.3); tone(988, 0.05, 0.3, 'sine', 0.1); tone(1175, 0.05, 0.4, 'sine', 0.2); };
  // ================= prizes + what you wear =================
  const CUR = { outfit: 'coat', torso: ['#f3f2f2', '#dfe6ea', '#9fb4c4'], name: 'DOCTOR WHITES' };
  const ownDoc = () => !!save.stat('hsDoc', false), docOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === CUR.name); };
  const putOn = on => { if (on) { if (!docOn()) save.setStat('hsPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(CUR); wear && wear(CUR); } else { const p = save.stat('hsPrevOutfit', null), o = p && p.name !== CUR.name ? p : null; save.setOutfit(o); wear && wear(o); } };
  function giveGift() { const n = save.stat('hsClears', 0) + 1; save.setStat('hsClears', n);
    if (!ownDoc()) { save.setStat('hsDoc', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === CUR.name)) save.setStat('tailorOutfits', [...list, CUR]); putOn(true); return { kind: 'doc', label: 'DOCTOR WHITES · COAT + STETHOSCOPE' }; }
    if (!save.stat('hsKit1', false)) { save.setStat('hsKit1', true); save.give('firstAidKit'); return { kind: 'kit', label: 'FIRST AID KIT' }; }
    if (n % 3 === 0) { save.give('firstAidKit'); return { kind: 'kit', label: 'FIRST AID KIT' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const on = ownDoc() && docOn(), key = on ? 1 : 0;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; if (on && U.P.body) worn.parts.push(stetho(U.P.body)); } }
  // ================= card (Modernist) — LEFT, same spot as the other shops =================
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head2 = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const bar = (k, c = '#ffd23a') => '<div style="height:12px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:' + Math.round(clamp(k, 0, 1) * 100) + '%;background:' + c + '"></div></div>';
  const big = (txt, bg, fg = '#fff') => '<div style="background:' + bg + ';color:' + fg + ';font-weight:900;font-size:18px;padding:7px 10px;margin:2px 0 6px;border:2px solid #201e1d">' + txt + '</div>';
  const small = t => '<div style="font-size:11px;font-weight:900;padding-top:4px">' + t + '</div>';
  const btns = opts => '<div style="display:flex;flex-direction:column;gap:6px;padding-top:4px">' + opts.map((o, i) => '<button data-ans="' + i + '" style="min-height:44px;text-align:left;padding:6px 10px;font:900 16px Archivo,sans-serif;background:#ffffff;color:#201e1d;border:2px solid #201e1d;border-radius:0;cursor:pointer">' + o + '</button>').join('') + '</div>';
  const setCard = (key, html, live = false) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; card.style.pointerEvents = live ? 'auto' : 'none'; if (live) { card.style.top = (innerHeight < 500 ? 70 : 100) + 'px'; card.style.maxHeight = 'none'; } else fitCard(); };
  const hideCard = () => { card.style.display = 'none'; card.style.pointerEvents = 'none'; cardKey = ''; };
  card.addEventListener('pointerdown', e => e.stopPropagation()); card.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ans]'); if (b) answer(+b.getAttribute('data-ans')); });
  // ================= input =================
  const ptr = { down: false, x: 0, y: 0, id: null, lx: 0, ly: 0, sx: 0, sy: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label],[data-ans]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (!busy || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.lx = ptr.sx = e.clientX; ptr.y = ptr.ly = ptr.sy = e.clientY; e.stopPropagation(); if (busy === 'job') press(); }, true);
  addEventListener('pointermove', e => { if (!busy || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); if (busy === 'job') drag(); else if (busy === 'look' && LOOK) LOOK.yaw -= (ptr.x - ptr.lx) * 0.006; ptr.lx = ptr.x; ptr.ly = ptr.y; }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const RC = new THREE.Raycaster(), NDC = new THREE.Vector2(), PL0 = new THREE.Plane();
  const setRay = () => { NDC.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); RC.setFromCamera(NDC, camera); };
  const onPlane = (n, p0) => { setRay(); PL0.setFromNormalAndCoplanarPoint(n, p0); const o = V(); return RC.ray.intersectPlane(PL0, o) ? o : null; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const PART = []; for (let i = 0; i < 24; i++) { const m = mm(Sp(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: YEL, transparent: true })); m.visible = false; G.add(m); PART.push({ m, v: V(), life: 0 }); }
  const burst = (p, n, col, sp = 0.8) => { let k = 0; for (const q of PART) { if (q.life > 0) continue; q.m.visible = true; q.m.material.color.set(col); q.m.position.copy(p); q.v.set(rnd(-1, 1), rnd(0.2, 1.4), rnd(-1, 1)).multiplyScalar(sp); q.life = rnd(0.5, 0.9); if (++k >= n) break; } };
  const partTick = dt => { for (const q of PART) { if (q.life <= 0) continue; q.life -= dt; q.m.position.addScaledVector(q.v, dt); q.v.y -= dt * 1.2; q.m.material.opacity = clamp(q.life * 1.6, 0, 1); if (q.life <= 0) q.m.visible = false; } };
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false });
  const mkRing = (r = 0.12, w = 0.025) => { const m = mm(new THREE.TorusGeometry(r, w, 6, 24), ringM); m.renderOrder = 3; m.visible = false; G.add(m); return m; };
  // ================= station props =================
  const HEART = (() => { const t = CT(128, 128, (g, W) => { g.clearRect(0, 0, W, W); g.fillStyle = '#ff3b3b'; g.beginPath(); g.moveTo(64, 112); g.bezierCurveTo(4, 70, 10, 14, 64, 40); g.bezierCurveTo(118, 14, 124, 70, 64, 112); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 6; g.stroke(); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthTest: false })); m.renderOrder = 5; m.visible = false; G.add(m); return m; })();
  const DISC = new THREE.Group(); DISC.add(mm(Cy(0.06, 0.06, 0.03, 16), LM(STEEL), 0, 0, 0, Math.PI / 2), mm(Cy(0.012, 0.012, 0.5, 5), LM(INK), 0, 0.26, -0.02)); DISC.visible = false; G.add(DISC);
  const HAMMER = new THREE.Group(); { const h = new THREE.Group(); h.add(mm(Cy(0.015, 0.015, 0.3, 6), LM(STEEL), 0, -0.15, 0), mm(Co(0.05, 0.12, 3), LM(RED), 0, -0.32, 0, 0, 0, Math.PI / 2)); HAMMER.add(h); HAMMER.userData.h = h; } HAMMER.visible = false; G.add(HAMMER);
  const KNEE = mkRing(0.1, 0.022);
  const TWZ = new THREE.Group(); TWZ.add(mm(Bx(0.015, 0.012, 0.22), LM(STEEL), -0.012, 0, 0, 0, 0.06), mm(Bx(0.015, 0.012, 0.22), LM(STEEL), 0.012, 0, 0, 0, -0.06)); const TW_HOME = V(93.45, 0.95, -174.4), DISH = V(92.92, 0.98, -174.4); TWZ.position.copy(TW_HOME); G.add(TWZ);
  const BELLY = mkRing(0.16, 0.025);
  const OBJS = ['A KEY', 'A COIN', 'A BELL', 'A MARBLE', 'A RUBBER DUCK', 'A TOY CAR', 'A SPOON'];
  function obj3D(k) { const g = new THREE.Group(), gold = LM('#e6b45a');
    if (k === 0) { g.add(mm(new THREE.TorusGeometry(0.03, 0.01, 6, 12), gold, -0.05, 0, 0, Math.PI / 2), mm(Bx(0.08, 0.012, 0.014), gold, 0.02, 0, 0), mm(Bx(0.012, 0.012, 0.03), gold, 0.05, 0, 0.015)); }
    else if (k === 1) g.add(mm(Cy(0.035, 0.035, 0.008, 16), gold)); else if (k === 2) g.add(mm(Co(0.035, 0.05, 10), gold, 0, 0.02, 0), mm(Sp(0.012), gold, 0, -0.008, 0)); else if (k === 3) g.add(mm(Sp(0.025), LM(BLUE)));
    else if (k === 4) g.add(mm(Sp(0.03), LM(YEL)), mm(Sp(0.02), LM(YEL), 0.03, 0.03, 0), mm(Co(0.008, 0.02, 5), LM('#f28c28'), 0.055, 0.03, 0, 0, 0, -Math.PI / 2)); else if (k === 5) { g.add(mm(Bx(0.08, 0.03, 0.04), LM(RED), 0, 0.01, 0)); for (const s of [-1, 1]) for (const t of [-1, 1]) g.add(mm(Cy(0.012, 0.012, 0.01, 8), LM(INK), s * 0.025, -0.005, t * 0.022, Math.PI / 2)); }
    else g.add(mm(Sp(0.025), LM(STEEL), -0.04, 0, 0), mm(Bx(0.07, 0.008, 0.012), LM(STEEL), 0.02, 0, 0)); g.children[0].scale.multiplyScalar(1); g.scale.setScalar(1.6); g.visible = false; G.add(g); return g; }
  const OBJ3 = OBJS.map((_, k) => obj3D(k));
  let xr = null; const BOARD_W = 3.0, BOARD_H = 1.7;
  const xrayFn = (g, W, H) => { g.fillStyle = xr && xr.lit === false ? '#1a1d22' : '#0a1422'; g.fillRect(0, 0, W, H); if (!xr || xr.lit === false) { g.fillStyle = '#5a6470'; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LIGHT BOARD · OFF', 40, H / 2); return; }
    g.save(); g.shadowColor = '#9fd8ff'; g.shadowBlur = 14; g.strokeStyle = '#d6ecff'; g.fillStyle = '#d6ecff'; g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.ellipse(230, 210, 70, 56, -0.2, 0, 7); g.stroke(); g.beginPath(); g.moveTo(170, 230); g.lineTo(100, 262); g.lineTo(180, 268); g.stroke(); for (const [a, b] of [[200, 160], [262, 150]]) { g.beginPath(); g.moveTo(a, b + 10); g.lineTo(a + 10, b - 60); g.lineTo(a + 34, b + 4); g.stroke(); }
    g.beginPath(); g.moveTo(296, 236); g.bezierCurveTo(420, 210, 600, 220, 720, 250); g.stroke(); for (let i = 0; i < 16; i++) { const x = 310 + i * 26, y = 232 + Math.sin(i / 15 * Math.PI) * -14 + i * 1.2; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
    g.lineWidth = 7; for (let i = 0; i < 7; i++) { const x = 370 + i * 28; g.beginPath(); g.moveTo(x, 236); g.quadraticCurveTo(x - 30, 320, x + 6, 380); g.stroke(); }
    g.lineWidth = 10; g.beginPath(); g.ellipse(720, 280, 44, 34, 0.3, 0, 7); g.stroke(); for (const [x, s] of [[400, 1], [440, -1], [700, 1], [740, -1]]) { g.beginPath(); g.moveTo(x, 300); g.lineTo(x + s * 12, 410); g.lineTo(x, 500); g.lineTo(x + 26, 512); g.stroke(); }
    g.beginPath(); g.moveTo(760, 260); g.bezierCurveTo(860, 230, 900, 160, 960, 120); g.stroke(); g.restore();
    const ox = xr.u * W, oy = (1 - xr.v) * H; g.save(); g.shadowColor = '#ffffff'; g.shadowBlur = 18; g.fillStyle = '#ffffff'; g.strokeStyle = '#ffffff'; g.lineWidth = 8; const k = xr.k;
    if (k === 0) { g.beginPath(); g.arc(ox - 26, oy, 16, 0, 7); g.stroke(); g.fillRect(ox - 10, oy - 5, 52, 10); g.fillRect(ox + 26, oy, 8, 16); g.fillRect(ox + 36, oy, 6, 12); } else if (k === 1) { g.beginPath(); g.arc(ox, oy, 24, 0, 7); g.fill(); } else if (k === 2) { g.beginPath(); g.moveTo(ox - 26, oy + 18); g.quadraticCurveTo(ox - 22, oy - 28, ox, oy - 30); g.quadraticCurveTo(ox + 22, oy - 28, ox + 26, oy + 18); g.closePath(); g.fill(); g.beginPath(); g.arc(ox, oy + 26, 8, 0, 7); g.fill(); }
    else if (k === 3) { g.beginPath(); g.arc(ox, oy, 18, 0, 7); g.fill(); } else if (k === 4) { g.beginPath(); g.ellipse(ox, oy + 6, 28, 18, 0, 0, 7); g.fill(); g.beginPath(); g.arc(ox + 20, oy - 18, 13, 0, 7); g.fill(); g.fillRect(ox + 30, oy - 20, 14, 6); } else if (k === 5) { g.fillRect(ox - 30, oy - 12, 60, 22); g.beginPath(); g.arc(ox - 18, oy + 14, 9, 0, 7); g.arc(ox + 18, oy + 14, 9, 0, 7); g.fill(); }
    else { g.beginPath(); g.ellipse(ox - 22, oy, 16, 11, 0, 0, 7); g.fill(); g.fillRect(ox - 8, oy - 4, 52, 8); } g.restore();
    if (xr.found || xr.hint) { g.strokeStyle = xr.found ? '#7cff9b' : '#ffd23a'; g.lineWidth = 8; g.beginPath(); g.arc(ox, oy, 56, 0, 7); g.stroke(); } if (xr.found) { g.fillStyle = '#7cff9b'; g.font = '900 44px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText("IT'S " + OBJS[k] + '!', 40, 60); }
    g.fillStyle = '#9fb4c4'; g.font = '800 22px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU HOSPITAL · X-RAY · ' + (xr.name || ''), 40, H - 30); };
  const xrayTex = CT(1024, 576, xrayFn); const BOARD = plane(xrayTex, BOARD_W, BOARD_H, 92.5, 2.25, Z0 + 0.1);
  // bandage props: arm, paw, tail laid on the pharmacy counter
  const LIMB_C = V(76.4, 1.1, -158.2);
  function limb(k) { const g = new THREE.Group(), fur = LM(['#c9743a', '#e07a30', '#a86a9a'][k]); if (k === 0) { g.add(mm(Cy(0.075, 0.07, 0.62, 12), fur, 0, 0, 0, 0, 0, Math.PI / 2), mm(Sp(0.085), fur, 0.34, 0, 0)); }
    else if (k === 1) { g.add(mm(Cy(0.07, 0.07, 0.36, 12), fur, -0.12, 0, 0, 0, 0, Math.PI / 2), mm(Sp(0.12), fur, 0.14, 0, 0)); g.children[1].scale.set(1, 0.6, 1.1); for (let i = 0; i < 3; i++) g.add(mm(Sp(0.028), LM(INK), 0.22, 0.02, -0.06 + i * 0.06)); }
    else { g.add(mm(Co(0.1, 0.62, 12), fur, 0, 0, 0, 0, 0, Math.PI / 2), mm(Sp(0.06), LM('#ffffff'), -0.32, 0, 0)); g.children[0].scale.set(1, 1, 1); }
    g.position.copy(LIMB_C); g.visible = false; G.add(g); return g; }
  const LIMBS = [limb(0), limb(1), limb(2)], LIMB_N = ['ARM', 'PAW', 'TAIL'];
  const DOTS = []; for (let i = 0; i < 10; i++) { const m = mm(Sp(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: YEL, depthTest: false })); m.renderOrder = 4; m.visible = false; G.add(m); DOTS.push(m); }
  const WRAP = new THREE.Group(); G.add(WRAP); const wrapM = LM('#ffffff');
  const PIN = new THREE.Group(); PIN.add(mm(Bx(0.08, 0.01, 0.014), LM(STEEL)), mm(Sp(0.012), LM(RED), -0.04, 0, 0)); PIN.visible = false; G.add(PIN);
  // stretcher (rush) + arrow + beacon
  const STR = new THREE.Group(); { STR.add(mm(Bx(0.62, 0.06, 2.0), LM(STEEL), 0, 0.78, 0), mm(Bx(0.56, 0.1, 1.9), LM('#3fb6a8'), 0, 0.86, 0)); for (const dx of [-0.26, 0.26]) for (const dz of [-0.85, 0.85]) STR.add(mm(Bx(0.04, 0.7, 0.04), LM(STEEL), dx, 0.42, dz), mm(Cy(0.06, 0.06, 0.05, 10), LM(INK), dx, 0.06, dz, 0, 0, Math.PI / 2)); STR.add(mm(Cy(0.015, 0.015, 1.6, 6), LM(STEEL), 0.3, 1.2, 0.9), mm(Bx(0.14, 0.2, 0.06), new THREE.MeshLambertMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.7 }), 0.3, 1.9, 0.9)); }
  STR.position.set(75.4, 0, -166.6); G.add(STR);
  const ARROW = new THREE.Group(); { const a = mm(Co(0.22, 0.5, 4), new THREE.MeshBasicMaterial({ color: YEL, depthTest: false }), 0, 0, 0.1, Math.PI / 2); a.renderOrder = 5; ARROW.add(a); } ARROW.visible = false; G.add(ARROW);
  const BEACON = mm(Cy(0.5, 0.5, 4.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); BEACON.visible = false; G.add(BEACON); const RTGT = mkRing(1.0, 0.06); RTGT.rotation.x = Math.PI / 2;
  // station rings (yellow, on the floor)
  const SPOT = { checkup: { x: 84.2, z: -172.2, r: 1.2 }, xray: { x: 92.5, z: -172.4, r: 1.2 }, bandage: { x: 76.4, z: -156.9, r: 1.1 }, heart: { x: 102.0, z: -175.2, r: 1.0 }, diagnose: { x: 89, z: -160.5, r: 1.1 }, rush: { x: 76.8, z: -166.4, r: 1.2 }, lift: { x: 104.3, z: -164.5, r: 1.1 }, coat: { x: 86.4, z: -154.4, r: 1.0 } };
  const RS = {}; for (const k in SPOT) { const s = SPOT[k], m = mm(new THREE.TorusGeometry(s.r * 0.75, 0.06, 6, 28), ringM, s.x, 0.1, s.z, Math.PI / 2); m.renderOrder = 3; G.add(m); RS[k] = m; }
  // ================= SHORT GAMES =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const GN = { checkup: 'CHECK-UP', xray: 'X-RAY', bandage: 'BANDAGE', heart: 'HEARTBEAT', diagnose: 'DIAGNOSE', rush: 'STRETCHER RUSH' };
  const PARTS = { checkup: ['LISTEN', 'EYES', 'KNEE'], xray: ['FIND', 'PLUCK', 'FIND', 'PLUCK'], bandage: ['ARM', 'PAW', 'TAIL'], heart: ['STEADY'], diagnose: ['1', '2', '3', '4'] };
  const BEGIN = { checkup: () => beginSteth(), xray: () => beginScan(), bandage: () => beginWrap(), heart: () => beginHeart(), diagnose: () => nextCase() };
  const INTRO = {
    checkup: n => [lp(n ? 'Check-up time. Listen, look, tap. In that order. Mostly.' : 'Why did I become a doctor? Patience. Patients. Get it? Tap on each THUMP.')],
    xray: n => [lp(n ? 'Back to the light board. Someone ate something that is not food again.' : 'Someone swallowed something. Find it on the light board, then the tweezers. Gently!')],
    bandage: n => [lh(n ? 'Three more bumps today! Arm, paw, tail. Go, go, go!' : 'Three bumps! Drag the bandage along the yellow dots, then tap the pin. Easy!')],
    heart: n => [lh(n ? 'Bed two again. Keep her heart steady, nice and calm.' : 'Bed two needs a steady heart. Tap every time the monitor beeps. Same time!')],
    diagnose: n => [lh(n ? 'Busy morning! Listen to each one and pick what is wrong.' : 'Reception! Each patient tells you what happened. Pick what is wrong from three.')] };
  function startGame(g) { if (busy || RU) return false; const vk = 'hsN_' + g, n = save.stat(vk, 0); save.setStat(vk, n + 1); save.setStat('hsVisits', save.stat('hsVisits', 0) + 1);
    J = { g, step: 0, sub: 'intro', gold: 0, pause: 0, t: 0, flies: [], clean: 0, miss: 0, held: null }; busy = 'job'; placeK(g); hideP(); pop();
    const who = ['checkup', 'xray'].includes(g) ? pT : hT; sayTo(who, INTRO[g](n), null, true); NEXT('intro', BEGIN[g], n ? 1.4 : 2.6); return true; }
  // ---- CHECK-UP: 1 LISTEN (tap on the thump) · 2 EYES (read the red letter) · 3 KNEE (tap when the ring shows) ----
  const SEAT = V(84.2, 0.78, -176.25), CHEST = V(84.2, 1.32, -176.0);
  function beginSteth() { J.step = 1; J.sub = 'steth'; J.p = pat(J.pi = save.stat('hsN_checkup', 1) % 4); pose(J.p, 'sit', SEAT.x, SEAT.y, SEAT.z, 0); J.bpm = Math.round(rnd(64, 78)); J.last = J.t; J.hits = 0; J.taps = 0; J.flash = 0; HEART.visible = true; HEART.position.copy(CHEST).add(V(0, 0, 0.12)); DISC.visible = true; DISC.position.copy(CHEST).add(V(0.25, -0.1, 0.25));
    toast('PART 1 OF 3 · LISTEN · TAP ON EACH THUMP', 2.4); }
  function stethTick(dt) { const per = 60 / J.bpm; if (J.t - J.last >= per) { J.last += per; thump(); J.flash = 1; } J.flash = Math.max(0, J.flash - dt * 4); HEART.scale.setScalar(1 + J.flash * 0.6); HEART.lookAt(camera.position); }
  function stethPress() { const per = 60 / J.bpm, d = Math.min(J.t - J.last, J.last + per - J.t); J.taps++; DISC.position.copy(CHEST).add(V(rnd(-0.06, 0.06), rnd(-0.06, 0.06), 0.1));
    if (d < 0.2) { J.hits++; addGold(2); pop(); burst(CHEST.clone().add(V(0, 0, 0.15)), 3, '#ff3b3b', 0.4); toast(d < 0.09 ? 'RIGHT ON THE BEAT' : 'ON THE BEAT', 0.8); } else { J.miss++; toast('LISTEN · TAP WITH THE THUMP', 1.0); }
    if (J.hits >= 6 || J.taps >= 14) { if (J.taps - J.hits <= 2) J.clean++; HEART.visible = false; DISC.visible = false; sayTo(pT, [lp((J.hits >= 6 ? 'Strong and steady. A small, furry drum.' : 'Close enough. Hearts are forgiving.') + ' Now read the letter in the red box.')], null, true); NEXT('stethDone', beginEye, 1.6); } }
  function beginEye() { J.step = 2; J.sub = 'eye'; J.row = 0; J.ew = 0; nextLetter(); toast('PART 2 OF 3 · READ THE LETTER IN THE RED BOX', 2.2); }
  function nextLetter() { const r = ROWS[J.row + 1], k = Math.floor(Math.random() * r.length), ch = r[k]; eyeHi = [J.row + 1, k]; redraw(chartTex, chartFn); J.ans = ch; const others = shuffle(LETS.split('').filter(c => c !== ch)).slice(0, 2); J.opts = shuffle([ch, ...others]); J.sub = 'eye'; }
  function eyeAnswer(i) { if (J.sub !== 'eye' || J.pause > 0) return; const ok = J.opts[i] === J.ans; if (ok) { addGold(3); ding(); toast('THAT IS A ' + J.ans, 1); } else { J.ew++; J.miss++; nope(); toast('THAT ONE WAS A ' + J.ans, 1.4); }
    J.row++; if (J.row >= 4) { eyeHi = null; redraw(chartTex, chartFn); if (!J.ew) J.clean++; sayTo(pT, [lp((J.ew ? 'Your eyes are fine. The chart is just small.' : 'Perfect eyes!') + ' Last, the knee. Tap when the yellow ring shows.')], null, true); NEXT('eyeDone', beginKnee, 1.6); } else { J.sub = 'eyeWait'; J.pause = 0.5; J.after = nextLetter; } }
  function kneePt() { const s = J.p.f.scale.y || 1; return V(SEAT.x + 0.14 * s, SEAT.y + 0.04, SEAT.z + 0.28 * s); }
  function beginKnee() { J.step = 3; J.sub = 'knee'; pose(J.p, 'sit', SEAT.x, SEAT.y, SEAT.z, 0); J.kn = 0; J.kw = 0; J.glow = false; J.nextG = J.t + rnd(0.9, 1.6); J.kick = 0; HAMMER.visible = true; KNEE.position.copy(kneePt()).add(V(0, 0.09, 0)); KNEE.rotation.set(Math.PI / 2, 0, 0); toast('PART 3 OF 3 · TAP WHEN THE YELLOW RING SHOWS', 2.2); }
  function kneeTick(dt) { const kp = kneePt(); HAMMER.position.copy(kp).add(V(0.12, 0.42, 0.18)); if (J.swing > 0) { J.swing = Math.max(0, J.swing - dt * 5); HAMMER.userData.h.rotation.z = -Math.sin(J.swing * Math.PI) * 1.1; }
    if (J.kick > 0) { J.kick = Math.max(0, J.kick - dt * 2.6); const a = -1.45 - Math.sin(J.kick * Math.PI) * 0.75; if (J.p.P && J.p.P.legs) J.p.P.legs[1].rotation.x = a; }
    if (!J.glow && J.t > J.nextG) { J.glow = true; J.gEnd = J.t + 0.95; } if (J.glow && J.t > J.gEnd) { J.glow = false; J.nextG = J.t + rnd(0.7, 1.4); } KNEE.visible = J.glow; if (J.glow) KNEE.scale.setScalar(1 + 0.15 * Math.sin(J.t * 14)); }
  function kneePress() { J.swing = 1; if (J.glow) { J.glow = false; J.kick = 1; J.kn++; addGold(3); pop(); tone(330, 0.05, 0.12, 'triangle'); J.nextG = J.t + rnd(1.0, 1.7); toast(['BOINK', 'KICK', 'GOOD REFLEX'][J.kn - 1] || 'KICK', 0.8);
      if (J.kn >= 3) { HAMMER.visible = false; KNEE.visible = false; if (J.kw <= 1) J.clean++; finishGame([lp('Excellent reflexes. They nearly kicked me. That is how I know.')]); } } else { J.kw++; J.miss++; toast('WAIT FOR THE YELLOW RING', 1.0); } }
  // ---- X-RAY: FIND it on the light board, PLUCK it out with the tweezers (2 patients) ----
  const TABLE = V(92.5, 0.86, -175.6);
  function beginScan() { J.step = J.step ? J.step + 1 : 1; J.sub = 'scan'; J.xn = (J.xn || 0) + 1; J.p = pat(J.xn === 1 ? 0 : 3); hideP(); pose(J.p, 'lie', TABLE.x + 0.75, TABLE.y, TABLE.z, Math.PI / 2); J.k = Math.floor(Math.random() * OBJS.length);
    xr = { lit: true, k: J.k, u: rnd(0.42, 0.6), v: rnd(0.36, 0.48), found: false, hint: false, name: J.p.name, miss: 0 }; redraw(xrayTex, xrayFn); INUSE.material.color.set('#ff3b3b'); toast('PATIENT ' + J.xn + ' OF 2 · TAP WHAT ' + J.p.name + ' SWALLOWED', 2.4); }
  function scanPress() { setRay(); const h = RC.intersectObject(BOARD)[0]; if (!h || !h.uv) { toast('TAP THE LIGHT BOARD', 1); return; } const du = (h.uv.x - xr.u) * BOARD_W, dv = (h.uv.y - xr.v) * BOARD_H;
    if (Math.hypot(du, dv) < 0.2) { xr.found = true; redraw(xrayTex, xrayFn); ding(); addGold(Math.max(2, 6 - xr.miss)); if (!xr.miss) J.clean++; sayTo(pT, [lp((J.xn === 1 ? OBJS[J.k].charAt(0) + OBJS[J.k].slice(1).toLowerCase() + '! Nobody ever knows why.' : 'There it is. Of course.') + ' Tweezers to the yellow ring, hold, then the dish.')], null, true); NEXT('found', beginPluck, 1.4); }
    else { xr.miss++; J.miss++; nope(); if (xr.miss >= 3) { xr.hint = true; redraw(xrayTex, xrayFn); } toast(xr.miss >= 3 ? 'LOOK INSIDE THE YELLOW CIRCLE' : 'THAT IS A BONE · KEEP LOOKING', 1.2); } }
  const bellyPt = () => V(TABLE.x - 0.05, TABLE.y + 0.3, TABLE.z + 0.02);
  function beginPluck() { J.step++; J.sub = 'pluck'; J.got = false; J.hold = 0; TWZ.position.copy(TW_HOME); TWZ.rotation.set(0, 0, 0); BELLY.position.copy(bellyPt()); BELLY.rotation.set(Math.PI / 2, 0, 0); BELLY.visible = true; J.t0 = J.t; toast('DRAG THE TWEEZERS TO THE YELLOW RING', 2); }
  function pluckPress() { const s = scrW(TWZ.position); if (dist(s) < RAD() * 2.4) { J.held = TWZ; pop(); } else toast('PICK UP THE TWEEZERS', 1); }
  function pluckDrag() { if (!J.held) return; const p = onPlane(V(0, 1, 0), V(0, J.got ? 1.12 : bellyPt().y + 0.05, 0)); if (p) { p.x = clamp(p.x, 91.3, 93.8); p.z = clamp(p.z, -176.1, -174.0); TWZ.position.copy(p); TWZ.rotation.y = Math.sin(J.t * 3) * 0.1; } }
  function pluckTick(dt) { const o = OBJ3[J.k], bp = bellyPt(); BELLY.scale.setScalar(1 + 0.12 * Math.sin(J.t * 6));
    if (!J.got) { const d = Math.hypot(TWZ.position.x - bp.x, TWZ.position.z - bp.z); if (J.held && d < 0.24) { J.hold += dt; if (J.hold > 0.35) { J.got = true; BELLY.visible = false; o.visible = true; tone(1200, 0.04, 0.1, 'triangle'); toast('GOT IT · NOW THE DISH', 1.4); } } else J.hold = 0; }
    else { o.position.copy(TWZ.position).add(V(0, -0.03, 0.12)); const d = Math.hypot(TWZ.position.x - DISH.x, TWZ.position.z - DISH.z); if (d < 0.22) { J.got = false; J.held = null; J.sub = 'plinked'; fly(o, DISH.clone().add(V(0, 0.02, 0)), 0.25, 0.05, () => { tone(2400, 0.05, 0.25, 'triangle'); burst(DISH, 4, YEL, 0.4); }); addGold(6); if (J.t - J.t0 < 12) J.clean++;
      if (J.xn < 2) { sayTo(pT, [lp('Plink. Best sound in medicine. Next patient!')], null, true); NEXT('plinked', () => { o.visible = false; TWZ.position.copy(TW_HOME); beginScan(); }, 1.6); } else { finishGame([lp('Two out, nobody tickled too much. You have steady paws, doctor.')]); } } } }
  function pluckRelease() { J.held = null; }
  // ---- BANDAGE: wrap ARM, PAW, TAIL along the dots, then tap the pin ----
  function wrapPts(k) { const len = [0.62, 0.42, 0.58][k], r = [0.08, 0.1, 0.075][k], x0 = LIMB_C.x - len / 2, out = []; for (let i = 0; i < 10; i++) { const s = i / 9, rr = k === 2 ? r * (1 - s * 0.6) : r; out.push(V(x0 + s * len, LIMB_C.y + rr * 0.75, LIMB_C.z + (i % 2 ? -1 : 1) * rr * 0.75)); } return k === 2 ? out.reverse() : out; }
  function beginWrap() { J.step = (J.step || 0) + 1; J.sub = 'wrap'; const k = J.step - 1; LIMBS.forEach((l, i) => { l.visible = i === k; }); J.p = pat(k); hideP(); pose(J.p, 'stand', 76.4, 0, -159.35, 0); J.pts = wrapPts(k); J.di = 0; J.t0 = J.t; while (WRAP.children.length) WRAP.remove(WRAP.children[0]);
    DOTS.forEach((d, i) => { d.position.copy(J.pts[i]); d.visible = true; d.scale.setScalar(1); }); PIN.visible = false; toast('PART ' + J.step + ' OF 3 · ' + LIMB_N[k] + ' · DRAG ALONG THE DOTS', 2.2); }
  function wrapHit() { const i = J.di; if (i >= 10) return; if (dist(scrW(J.pts[i])) > RAD() * 1.5) return; DOTS[i].visible = false; if (i > 0) { const a = J.pts[i - 1], b = J.pts[i], d = b.clone().sub(a), L = d.length(), m = mm(Bx(0.085, 0.014, L + 0.03), wrapM); m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b.x, m.position.y + (b.y - a.y), b.z); WRAP.add(m); }
    J.di++; tone(500 + J.di * 40, 0.03, 0.06, 'triangle'); if (J.di >= 10) { J.sub = 'pin'; PIN.visible = true; PIN.position.copy(J.pts[9]).add(V(0, 0.03, 0)); toast('TAP THE PIN TO CLIP IT', 1.4); } }
  function wrapPress() { if (J.sub === 'pin') { if (dist(scrW(PIN.position)) < RAD() * 2.6) { PIN.visible = false; ding(); const k = J.step - 1; addGold(9); if (J.t - J.t0 < 14) J.clean++; burst(LIMB_C.clone().add(V(0, 0.1, 0)), 5, '#ffffff', 0.5);
      const lines = [[lh('Arm done! Wiggle your fingers. Good wiggle!')], [lh('Paw done! No more skating down the castle steps, OK?')], [lh('A tail bandage! I love a tail bandage. Fluffy at the end!')]][k];
      if (J.step < 3) { sayTo(hT, lines, null, true); NEXT('wrapDone', beginWrap, 1.4); } else finishGame([lh('Three bumps, three bandages. Almost as fast as me!')]); } else toast('TAP THE PIN', 0.8); return; } wrapHit(); }
  // ---- HEARTBEAT: tap with every beep, keep the line steady ----
  const BEATS = (() => { const a = []; for (let i = 0; i < 10; i++) a.push(0.95); for (let i = 0; i < 10; i++) a.push(0.72); for (let i = 0; i < 8; i++) a.push(1.15); for (let i = 0; i < 10; i++) a.push(0.62); return a; })();
  function beginHeart() { J.step = 1; J.sub = 'heart'; J.st = 0.3; J.bi = 0; J.nextB = J.t + 1.2; J.lastB = -9; J.tapped = true; J.flash = 0; J.trace = flatTrace(0).map(() => 0); J.tp = 0; J.hits = 0; toast('TAP WITH EVERY BEEP', 2.2); }
  function heartTick(dt) { if (J.t >= J.nextB) { if (!J.tapped && J.lastB > 0) { J.st = Math.max(0, J.st - 0.03); } J.lastB = J.nextB; J.tapped = false; beep(); J.flash = 1; J.tp = 0; J.bi++; J.nextB += BEATS[Math.min(J.bi, BEATS.length - 1)]; if (J.bi > BEATS.length) { heartWin(); return; } }
    J.flash = Math.max(0, J.flash - dt * 5); J.tp += dt; const tp = J.tp, wob = (1 - J.st) * 0.5, v = tp < 0.05 ? 0.9 : tp < 0.1 ? -0.45 : tp > 0.2 && tp < 0.3 ? 0.15 : 0; J.trace.push(v + (Math.random() - 0.5) * wob + Math.sin(J.t * 9) * wob * 0.4); J.trace.shift();
    J.mt = (J.mt || 0) + dt; if (J.mt > 0.08) { J.mt = 0; redraw(MONS[1], monFn(J.trace, Math.round(60 / BEATS[Math.min(J.bi, BEATS.length - 1)]), J.st > 0.6)); } }
  function heartPress() { const d = Math.min(Math.abs(J.t - J.lastB), Math.abs(J.nextB - J.t)); if (d < 0.2 && !J.tapped) { J.tapped = true; J.hits++; J.st = Math.min(1, J.st + 0.085); addGold(1); pop(); if (J.st >= 1) heartWin(); } else { J.st = Math.max(0, J.st - 0.05); J.miss++; toast('OFF THE BEAT · WAIT FOR THE BEEP', 0.9); } }
  function heartWin() { if (J.sub !== 'heart') return; J.sub = 'heartDone'; ding(); if (J.st >= 1) J.clean++; burst(V(104.4, 1.3, BEDZ[1]), 8, '#7cff9b', 0.7); redraw(MONS[1], monFn(flatTrace(1), 64, true));
    finishGame([lh(J.st >= 1 ? 'Look at that line. Calm as the lake on a Sunday. You did that!' : 'Nice and steady now. She is smiling in her sleep. That counts!'), lp('Strong work. I would give you a raise, but you are not on the payroll. Gold, then.')]); }
  // ---- DIAGNOSE: 4 patients at reception, pick what is wrong ----
  const CASES = [{ who: 'PELL', l: ['I ate seven of Granny\u2019s pies. Seven. My tummy is singing.', 'Not a happy song.'], a: 'TUMMY ACHE' }, { who: 'FLICK', l: ['I skated down the castle steps.', 'My paw went left. I went right.'], a: 'SPRAINED PAW' },
    { who: 'KIA', l: ['Achoo! Every time I walk past the flower shop. Achoo!', 'Flora says it is the lilies. I say achoo.'], a: 'HAY FEVER' }, { who: 'OTTO', l: ['Hic! I drank my fizzy drink too fast. Hic!', 'It has been an hour. Hic!'], a: 'HICCUPS' },
    { who: 'PELL', l: ['I fished on the jetty all day. No hat.', 'My ears are as red as a lobster.'], a: 'SUNBURN' }, { who: 'KIA', l: ['I bumped my tail in the bank\u2019s spinning door.', 'It goes ow when I wag.'], a: 'SORE TAIL' },
    { who: 'OTTO', l: ['I cannot sleep. I count sheep.', 'Then the sheep start counting me.'], a: "CAN'T SLEEP" }, { who: 'FLICK', l: ['I bit into a gobstopper at the minimart.', 'Now my tooth is very, very loud.'], a: 'TOOTHACHE' }];
  const ALL_A = CASES.map(c => c.a), PIDX = { PELL: 0, FLICK: 1, KIA: 2, OTTO: 3 };
  const FRONT = V(89, 0, -157.75), INDOOR = V(89, 0, -153.2);
  function nextCase() { if (!J.cases) { J.cases = shuffle(CASES).slice(0, 4); J.ci = 0; J.dw = 0; } const c = J.cases[J.ci]; J.step = J.ci + 1; J.c = c; hideP(); J.p = pat(PIDX[c.who]); pose(J.p, 'stand', INDOOR.x, 0, INDOOR.z, Math.PI); J.walk = 0; J.sub = 'walkin'; served++; redraw(servTex, servFn); tone(1046, 0.05, 0.25); }
  function caseTick(dt) { const p = J.p; if (J.sub === 'walkin') { J.walk = Math.min(1, J.walk + dt / 2.0); p.H.position.lerpVectors(INDOOR, FRONT, J.walk); kit.animFox && kit.animFox(p.f, dt, J.walk < 1 ? 2.2 : 0); if (J.walk >= 1) { J.sub = 'ask'; J.opts = shuffle([J.c.a, ...shuffle(ALL_A.filter(a => a !== J.c.a)).slice(0, 2)]); ptT.obj = p.H; sayTo(ptT, [lx(J.c.who, J.c.l.join(' '))], null, true); } }
    else if (J.sub === 'walkout') { J.walk = Math.min(1, J.walk + dt / 1.6); p.H.rotation.y = 0; p.H.position.lerpVectors(FRONT, INDOOR, J.walk); kit.animFox && kit.animFox(p.f, dt, 2.2); if (J.walk >= 1) { p.H.visible = false; J.ci++; if (J.ci >= 4) { if (!J.dw) J.clean++; finishGame([lh(J.dw ? 'Four patients, four plans. Not bad for a first day at the desk!' : 'Four for four! I am going to tell everyone. I tell everyone everything.')]); } else nextCase(); } } else kit.animFox && kit.animFox(p.f, dt, 0); }
  function diagAnswer(i) { if (J.sub !== 'ask') return; const ok = J.opts[i] === J.c.a; if (ok) { addGold(6); ding(); sayTo(hT, [lh(pick(['Yes! Spot on.', 'Exactly right!', 'That is the one!']) + ' ' + ({ 'TUMMY ACHE': 'Warm tea and no pies till Tuesday.', 'SPRAINED PAW': 'Ice and a bandage. And no more stairs!', 'HAY FEVER': 'A tissue and a different route home.', HICCUPS: 'Hold your breath and think of fish.', SUNBURN: 'Cream on those ears. And a hat!', 'SORE TAIL': 'No wagging for two days. Sorry!', "CAN'T SLEEP": 'Warm milk and no counting.', TOOTHACHE: 'Off to the dentist next door. Kidding! Ice for now.' })[J.c.a])], null, true); }
    else { addGold(2); J.dw++; J.miss++; nope(); sayTo(hT, [lh('Close! But it is ' + J.c.a.toLowerCase() + '. Listen to the clue: ' + J.c.l[0].toLowerCase())], null, true); } J.sub = 'walkout'; J.walk = 0; }
  function answer(i) { if (!J) return; if (J.sub === 'eye') eyeAnswer(i); else if (J.sub === 'ask') diagAnswer(i); }
  // ---- finish (any game): gold, prize, rounds board ----
  function finishGame(lines) { const g = J.g, tot0 = J.gold; addGold(10); if (J.clean >= (PARTS[g] ? Math.min(3, PARTS[g].length) : 3) && !J.miss) { addGold(8); toast('CLEAN WORK · +8 GOLD', 2); }
    J.sub = 'pay'; const d = doneMap(), first = !d[g]; d[g] = true; let full = false; if (GAMES.every(([k]) => d[k]) && !d.full) { d.full = true; full = true; } save.setStat('hsDone', { ...d }); redraw(roundsTex, roundsFn);
    const best = save.stat('hsBest_' + g, 0); if (J.gold > best) save.setStat('hsBest_' + g, J.gold); const g2 = giveGift(); if (full) { save.addGold(50); save.give('firstAidKit'); }
    const tot = J.gold, isP = ['checkup', 'xray'].includes(g), who = isP ? lp : lh, op = lines[0] ? lines[0].text + ' ' : '', fs = !K.stars(g), stars = !J.miss ? 3 : J.miss <= 2 ? 2 : 1;
    sayTo(isP ? endP : endH, [who((g2.kind === 'doc' ? '' : op) + tot + ' gold.' + (g2.kind === 'doc' ? ' Doctor whites are yours. The coat stand by the door swaps them.' : g2.kind === 'kit' ? ' A first aid kit for your bag!' : ' Twenty extra.')), ...(full ? [lh('ALL SIX ROUNDS DONE! Fifty gold and another first aid kit. You are basically staff!')] : [])], null, true); cheer(); K.finish(g, stars, tot, fs);
    NEXT('pay', () => stop(), 1.2); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'steth') stethPress(); else if (s === 'knee') kneePress(); else if (s === 'scan') scanPress(); else if (s === 'pluck') pluckPress(); else if (s === 'wrap' || s === 'pin') wrapPress(); else if (s === 'heart') heartPress(); else if (s === 'eye' || s === 'ask') toast('PICK ON THE CARD', 1); }
  function drag() { if (!J) return; const s = J.sub; if (s === 'pluck') pluckDrag(); else if (s === 'wrap') wrapHit(); }
  function release() { if (!J) return; if (J.sub === 'pluck') pluckRelease(); }
  // ---- the game card ----
  const strip = (names, n) => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + names.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 1px;font-size:9px;font-weight:900;border:2px solid #201e1d;overflow:hidden;text-align:left;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J) return; const s = J.sub, g = J.g, names = PARTS[g], hr = J.gold ? J.gold + ' G' : ''; let next = '', det = '', key = g + s + J.step + '_' + J.gold, live = false; const hd = GN[g] + (J.step && names.length > 1 ? ' · ' + J.step + '/' + names.length : '');
    if (s === 'intro') { next = 'LISTEN TO ' + (['checkup', 'xray'].includes(g) ? 'DR. PATCH' : 'NURSE HONEY'); det = row(RED, 'STARTING SOON', '', false); }
    else if (s === 'pay') { next = 'ALL DONE'; det = big('+' + J.gold + ' GOLD', GREEN); }
    else if (g === 'checkup') { if (s === 'steth') { key += J.hits + '_' + (J.flash > 0.5 ? 1 : 0); next = 'TAP ON EACH THUMP'; det = big('THUMP', J.flash > 0.5 ? '#ff3b3b' : '#cfcac3', J.flash > 0.5 ? '#fff' : INK) + row('#ff3b3b', 'ON THE BEAT', J.hits + '/6', J.hits > 0) + small(J.bpm + ' BEATS A MINUTE'); }
      else if (s === 'eye' || s === 'eyeWait') { key += J.row + (s === 'eye' ? 'q' : ''); next = 'READ THE RED BOX'; live = s === 'eye'; det = row(INK, 'ROW', Math.min(4, J.row + 1) + '/4', false) + (s === 'eye' ? btns(J.opts) : ''); }
      else if (s === 'knee') { key += J.kn + (J.glow ? 'g' : ''); next = J.glow ? 'TAP NOW!' : 'WAIT FOR THE RING'; det = big(J.glow ? 'TAP!' : 'WAIT\u2026', J.glow ? YEL : '#cfcac3', INK) + row(RED, 'KICKS', J.kn + '/3', J.kn > 0); } else next = 'NEXT\u2026'; }
    else if (g === 'xray') { if (s === 'scan') { key += xr.miss; next = 'TAP IT ON THE LIGHT BOARD'; det = row(INK, 'PATIENT', J.p.name, false) + small('LOOK FOR SOMETHING THAT IS NOT A BONE'); } else if (s === 'pluck') { key += (J.got ? 'g' : '') + (J.hold > 0 ? 'h' : ''); next = J.got ? 'DROP IT IN THE DISH' : J.hold > 0 ? 'HOLD STILL\u2026' : 'TWEEZERS TO THE RING'; det = row(YEL, OBJS[J.k], J.got ? 'GOT IT' : '', J.got); } else next = 'NEXT\u2026'; }
    else if (g === 'bandage') { key += J.di + s; next = s === 'pin' ? 'TAP THE PIN' : s === 'wrap' ? 'DRAG ALONG THE DOTS' : 'NEXT\u2026'; det = row('#ffffff', LIMB_N[J.step - 1] || '', Math.min(10, J.di || 0) + '/10', J.di >= 10) + bar((J.di || 0) / 10); }
    else if (g === 'heart') { key += Math.round(J.st * 20) + (J.flash > 0.5 ? 'b' : ''); next = 'TAP WITH THE BEEP'; det = big('BEEP', J.flash > 0.5 ? GREEN : '#cfcac3', J.flash > 0.5 ? '#fff' : INK) + row(GREEN, 'STEADY', Math.round(J.st * 100) + '%', J.st >= 1) + bar(J.st, GREEN); }
    else if (g === 'diagnose') { key += J.ci + (s === 'ask' ? 'q' : ''); next = s === 'ask' ? 'WHAT IS WRONG?' : 'NEXT PATIENT\u2026'; live = s === 'ask'; det = row(RED, 'PATIENT', (J.c ? J.c.who : '') + ' \u00b7 ' + served, false) + (s === 'ask' ? btns(J.opts) : ''); }
    setCard(key, head2(hd, hr) + foot(next, !live) + '<div style="padding:8px 10px 10px">' + (names.length > 1 && J.step ? strip(names, J.step) : '') + det + '</div>', live); }
  function stop() { busy = null; if (J) J.flies.length = 0; J = null; LOOK = null; ptr.down = false; hideCard(); placeK('idle'); hideP(); HEART.visible = DISC.visible = HAMMER.visible = KNEE.visible = BELLY.visible = PIN.visible = false; OBJ3.forEach(o => { o.visible = false; }); LIMBS.forEach(l => { l.visible = false; }); DOTS.forEach(d => { d.visible = false; }); while (WRAP.children.length) WRAP.remove(WRAP.children[0]);
    TWZ.position.copy(TW_HOME); eyeHi = null; redraw(chartTex, chartFn); INUSE.material.color.set('#5a2a22'); xr = { lit: false }; redraw(xrayTex, xrayFn); }
  // ================= STRETCHER RUSH (walk game, busy stays off so you can walk) =================
  const DEST = [{ n: 'EXAM ROOM', x: 84.2, z: -170.4, put: p => pose(p, 'sit', SEAT.x, SEAT.y, SEAT.z, 0) }, { n: 'X-RAY', x: 92.5, z: -170.4, put: p => pose(p, 'lie', TABLE.x + 0.75, TABLE.y, TABLE.z, Math.PI / 2) },
    { n: 'WARD · BED 4', x: 101.6, z: -169.6, put: p => pose(p, 'lie', 103.5, 0.77, BEDZ[3], -Math.PI / 2) }, { n: 'PHARMACY', x: 77.6, z: -160.2, put: p => pose(p, 'stand', 76.4, 0, -159.35, 0) }, { n: 'WAITING ROOM', x: 94.2, z: -156.4, put: p => pose(p, 'sit', 95.4, 0.65, -156.4, -Math.PI / 2) }];
  const RUSH_WHY = { 'EXAM ROOM': 'A CHECK-UP', 'X-RAY': 'SWALLOWED A MARBLE', 'WARD · BED 4': 'NEEDS A GOOD SLEEP', PHARMACY: 'NEEDS A BANDAGE', 'WAITING ROOM': 'FEELS BETTER ALREADY' };
  function startRush() { if (busy || RU) return false; const vk = 'hsN_rush', n = save.stat(vk, 0); save.setStat(vk, n + 1); hideP(); placeK('rush'); RU = { n: 0, list: shuffle(DEST).slice(0, 3), gold: 0, phase: 'load', bumps: 0, t: 0, lp: null, sp: 0, clean: 0 }; pop();
    sayTo(hT, [lh(n ? 'Ambulance! Three more. You know the drill. Follow the arrow, mind the walls!' : 'Ambulance! You push, I do the paperwork. Follow the yellow arrow. Mind the walls!')], null, true); loadNext(); return true; }
  function loadNext() { const d = RU.list[RU.n], p = pat(RU.n + (save.stat('hsN_rush', 1) % 4)); RU.p = p; RU.d = d; RU.phase = 'go'; RU.t = 0; RU.bumps = 0; RU.par = 6 + Math.hypot(d.x - SPOT.rush.x, d.z - SPOT.rush.z) / 3.2; tone(988, 0.05, 0.2); tone(784, 0.05, 0.2, 'sine', 0.2); }
  function rushTick(dt, P, fox) { const yaw = fox ? fox.rotation.y : 0, fx = Math.sin(yaw), fz = Math.cos(yaw);
    if (!inShop(P)) { cancelRush('YOU LEFT WITH THE STRETCHER · RUSH ENDED'); return; } RU.t += dt;
    if (RU.phase === 'go' || RU.phase === 'back') { STR.position.set(P.x + fx * 1.6 + fz * 0.75, 0, P.z + fz * 1.6 - fx * 0.75); STR.rotation.y = yaw; if (RU.phase === 'go') { RU.p.H.visible = true; RU.p.H.position.set(STR.position.x - fx * 0.75, 0.88 + 0.2 * (RU.p.f.scale.y || 1), STR.position.z - fz * 0.75); RU.p.f.rotation.set(-Math.PI / 2, 0, 0); RU.p.H.rotation.y = yaw + Math.PI; legs(RU.p, 0); } }
    const tg = RU.phase === 'back' ? SPOT.rush : RU.d; ARROW.visible = true; ARROW.position.set(P.x, (P.y || 0) + 2.7, P.z); ARROW.rotation.y = Math.atan2(tg.x - P.x, tg.z - P.z); BEACON.visible = RTGT.visible = true; BEACON.position.set(tg.x, 2.1, tg.z); RTGT.position.set(tg.x, 0.12, tg.z);
    if (RU.lp) { const sp = Math.hypot(P.x - RU.lp[0], P.z - RU.lp[1]) / Math.max(dt, 1e-3); if (RU.phase === 'go' && RU.sp > 3.5 && sp < 0.4 && RU.bc <= 0) { RU.bumps++; RU.bc = 0.8; nope(); toast(pick(['BUMP! OW!', 'MIND THE WALL!', 'OOF! GENTLY!']), 0.9); } RU.sp = RU.sp * 0.6 + sp * 0.4; } RU.lp = [P.x, P.z]; RU.bc = (RU.bc || 0) - dt;
    if (Math.hypot(P.x - tg.x, P.z - tg.z) < 1.6) { if (RU.phase === 'go') { const ok = RU.t <= RU.par, gld = Math.max(4, 10 + (ok ? 6 : 0) - RU.bumps * 2); RU.gold += gld; save.addGold(gld); if (ok && !RU.bumps) RU.clean++; RU.d.put(RU.p); ding(); burst(V(tg.x, 1, tg.z), 6, YEL, 0.6); toast((ok ? 'ON TIME' : 'MADE IT') + ' · +' + gld + ' GOLD' + (RU.bumps ? ' · ' + RU.bumps + ' BUMP' + (RU.bumps > 1 ? 'S' : '') : ''), 2); RU.n++; RU.phase = 'back';
        if (RU.n >= 3) { RU.phase = 'home'; } } else if (RU.phase === 'back') loadNext(); }
    if (RU.phase === 'home') { finishRush(); } }
  function finishRush() { const g0 = RU.gold; save.addGold(10); RU.gold += 10; const d = doneMap(), first = !d.rush; d.rush = true; let full = false; if (GAMES.every(([k]) => d[k]) && !d.full) { d.full = true; full = true; } save.setStat('hsDone', { ...d }); redraw(roundsTex, roundsFn); if (RU.gold > save.stat('hsBest_rush', 0)) save.setStat('hsBest_rush', RU.gold);
    if (RU.clean >= 3) { save.addGold(8); RU.gold += 8; } const g2 = giveGift(); if (full) { save.addGold(50); save.give('firstAidKit'); } cheer();
    { const fs = !K.stars('rush'); K.finish('rush', RU.clean >= 3 ? 3 : RU.clean >= 1 ? 2 : 1, RU.gold, fs); }
    sayTo(endH, [lh((g2.kind === 'doc' ? '' : RU.clean >= 3 ? 'No bumps, all on time! Are you sure you are not a nurse? ' : 'Three delivered! A few bumps. ') + RU.gold + ' gold.' + (g2.kind === 'doc' ? ' Doctor whites are yours. The coat stand swaps them.' : g2.kind === 'kit' ? ' A first aid kit for your bag!' : ' Twenty extra.')), ...(full ? [lh('ALL SIX ROUNDS DONE! Fifty gold and another first aid kit!')] : [])], null, true);
    endRush(); }
  function endRush() { RU = null; ARROW.visible = BEACON.visible = RTGT.visible = false; STR.position.set(75.4, 0, -166.6); STR.rotation.y = 0; placeK('idle'); setTimeout(() => { if (!RU && !busy) hideP(); }, 12000); hideCard(); }
  function cancelRush(msg) { if (!RU) return; hideP(); endRush(); toast(msg, 2.2); }
  function drawRushCard() { if (!RU) return; const n = Math.min(3, RU.n + (RU.phase === 'go' ? 1 : 0)), hr = RU.gold ? RU.gold + ' G' : '', left = Math.max(0, RU.par - RU.t);
    const body = RU.phase === 'back' ? row(YEL, 'BACK TO THE BAY', 'NEXT ONE', false) + small('THE AMBULANCE HAS ANOTHER') : big('TO: ' + RU.d.n, RED) + row(INK, RU.p.name, RUSH_WHY[RU.d.n] || '', false) + row('#cfcac3', 'BUMPS', String(RU.bumps), false) + bar(left / RU.par, left > 0 ? YEL : '#cfcac3') + small(left > 0 ? Math.ceil(left) + ' S · ON-TIME BONUS' : 'LATE IS FINE · KEEP GOING');
    setCard('ru' + RU.n + RU.phase + RU.bumps + Math.ceil(left), head2('STRETCHER RUSH · ' + n + '/3', hr) + foot(RU.phase === 'back' ? 'FOLLOW THE ARROW' : 'PUSH · FOLLOW THE ARROW', false) + '<div style="padding:8px 10px 10px">' + body + '</div>'); }
  // ================= camera =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT2 = Math.tan(vf), asp = camera.aspect || 1, wT = hT2 * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT2) : h / 2 / hT2, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT2 * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub, g = J.g;
    if (g === 'checkup') { if (s === 'eye' || s === 'eyeWait' || s === 'stethDone') return [V(80.1, 1.65, -173.4), 1.0, 1.6, 0.04, 1.8, Math.PI / 2, 3.6]; if (s === 'knee') return [V(84.2, 0.95, -176.0), 1.6, 1.4, 0.22, 1.8, 0.35, 3.6]; return [V(84.2, 1.15, -176.2), 2.0, 1.8, 0.12, 2.0, 0, 4.0]; }
    if (g === 'xray') { if (s === 'pluck' || s === 'plinked') return [V(92.7, 0.95, -175.1), 2.2, 1.4, 0.95, 1.8, 0, 3.4]; return [V(92.5, 2.15, Z0 + 0.1), 3.2, 1.9, 0.04, 2.4, 0, 7.0]; }
    if (g === 'bandage') return [V(76.4, 1.08, -158.2), 1.0, 0.7, 1.0, 1.4, 0, 2.6];
    if (g === 'heart') return [V(104.4, 1.05, BEDZ[1]), 2.4, 1.6, 0.62, 2.2, -Math.PI / 2, 4.0];
    if (g === 'diagnose') return [V(89, 1.3, -157.6), 3.2, 2.7, 0.2, 3.0, Math.PI, 4.4];
    return null; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } }; function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (busy === 'job' && fox) fox.visible = false; }
    if (busy === 'look' && LOOK) { lensOff(cam); const e = V(89, 18.8, -166); cam.position.copy(e); cam.lookAt(e.x + Math.sin(LOOK.yaw) * 10, e.y - 1.6, e.z + Math.cos(LOOK.yaw) * 10); return; }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); } if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v); camT.pos.x = clamp(camT.pos.x, X0 + 0.35, X1 - 0.35); camT.pos.z = clamp(camT.pos.z, Z0 + 0.35, Z1 - 0.35); camT.pos.y = Math.min(camT.pos.y, CEIL - 0.4);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot (eye chart + diagnose answers sit on the card) ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'steth') return [CHEST.clone(), 'TAP WITH EACH THUMP'];
    if (s === 'knee') return [kneePt(), J.glow ? 'TAP NOW' : 'WAIT FOR THE RING, THEN TAP'];
    if (s === 'scan') return xr.miss >= 1 ? [V(92.5 + (xr.u - 0.5) * BOARD_W, 2.25 + (xr.v - 0.5) * BOARD_H, Z0 + 0.1), 'TAP HERE'] : [V(92.5, 2.25, Z0 + 0.1), 'TAP WHAT THEY SWALLOWED'];
    if (s === 'pluck') return J.got ? [DISH.clone(), 'DRAG IT TO THE DISH'] : [J.held ? bellyPt() : TWZ.position.clone(), J.held ? 'TO THE YELLOW RING · HOLD' : 'DRAG THE TWEEZERS'];
    if (s === 'wrap') return J.pts[J.di] ? [J.pts[J.di].clone(), 'DRAG ALONG THE DOTS'] : null; if (s === 'pin') return [PIN.position.clone(), 'TAP THE PIN'];
    if (s === 'heart') return [V(104.4, 1.3, BEDZ[1]), 'TAP WITH THE BEEP'];
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HAND.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ================= talk + prompt =================
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 6;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r && (P.y || 0) < 2, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r && (P.y || 0) < 2;
  const PROMPTS = { checkup: 'CHECK-UP · DR. PATCH', xray: 'X-RAY · DR. PATCH', bandage: 'BANDAGE · NURSE HONEY', heart: 'HEARTBEAT · NURSE HONEY', diagnose: 'DIAGNOSE · RECEPTION', rush: 'STRETCHER RUSH · AMBULANCE' };
  function prompt(P) { if (busy || !inShop(P) || P.skate) return null; if (RU) { if (at(P, SPOT.rush) && RU.phase !== 'back') return 'END THE RUSH'; return null; }
    for (const k in PROMPTS) if (at(P, SPOT[k])) return PROMPTS[k] + (doneMap()[k] ? ' \u2713' : ''); if (at(P, SPOT.lift)) return 'LIFT · LOOK FROM THE ROOF';
    if (ownDoc() && at(P, SPOT.coat)) return 'DOCTOR WHITES ' + (docOn() ? 'OFF' : 'ON'); if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, pT)) return 'TALK · DR. PATCH'; if (near(P, hT)) return 'TALK · NURSE HONEY'; return null; }
  // s72: ONE box with choices each (YES, PUT ME TO WORK! first · GOODBYE last)
  const TALK_P = ["I told a joke about a broken pencil. It was pointless.","The fish tank is very good for nerves. Mine, mostly.","Every patient asks if it will hurt. I say: only my jokes.","Bed two is Marla. Or is it the fisherman? They both snore in the same key.","The lift goes to the roof. The helicopter does not come. But the view does."];
  const TALK_H = ["I walk ten thousand steps before lunch. Then ten thousand more!","Do the rounds board! Tick all six and there is a bonus. Shh, I did not tell you.","The kids’ corner has a rocking horse. I ride it on my break. Do not tell Dr. Patch.","First aid kits fix everything. Well. Almost everything. Not Dr. Patch’s jokes."];
  const ORDER = ['checkup', 'xray', 'bandage', 'heart', 'diagnose', 'rush'], MINE_P = ['checkup', 'xray'], MINE_H = ['bandage', 'heart', 'diagnose', 'rush'];
  const nextOf = list => list.find(k => !doneMap()[k]) || list[save.stat('hsVisits', 0) % list.length];
  const goGame = (k, P) => { if (busy || RU) return; if (P) Object.assign(P, { x: SPOT[k].x, z: SPOT[k].z, sp: 0 }); if (k === 'rush') startRush(); else startGame(k); };
  const ch = (k, t) => ({ text: t, pick: () => goGame(k, lastP) });
  const pMenu = first => sayTo(pT, [{ ...lp(first ? 'Dr. Patch. Six jobs, one at each yellow ring. Mine are the exam room and x-ray.' : ['Back for more? Excellent. Or, as we say here, ex-cellent.', 'Good to see you. You look well. I checked.', 'Ah, my favourite helper. Do not tell Honey.'][talked % 3]),
    choices: [ch(nextOf(MINE_P), CHOICE_WORK), ch('checkup', 'CHECK-UP'), ch('xray', 'X-RAY'), { text: 'A JOKE, PLEASE', pick: () => sayTo(pT, [lp(TALK_P[talked % TALK_P.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  const hMenu = first => sayTo(hT, [{ ...lh(first ? 'Hi hi! Nurse Honey! Bandages, the heart monitor, the desk or the stretcher rush. Pick one!' : ['You again! Yay! What shall we do?', 'Busy busy! Want to help?', 'Tick all six on the rounds board for a bonus!'][talkedH % 3]),
    choices: [ch(nextOf(MINE_H), CHOICE_WORK), ch('bandage', 'BANDAGE'), ch('heart', 'HEARTBEAT'), ch('diagnose', 'DIAGNOSE'), ch('rush', 'STRETCHER RUSH'), { text: 'A NURSE TIP, PLEASE', pick: () => sayTo(hT, [lh(TALK_H[talkedH % TALK_H.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  let talkedH = 0;
  function talk(P) { lastP = P; if (busy === 'look') { busy = null; LOOK = null; toast('BACK DOWN', 1); return true; } if (busy) return true; if (!inShop(P) || P.skate) return false;
    if (RU) { if (at(P, SPOT.rush) && RU.phase !== 'back') { cancelRush('RUSH ENDED · GOLD KEPT'); return true; } if (near(P, hT)) { sayTo(hT, [lh('Go, go! Follow the arrow!')]); return true; } return false; }
    for (const k in PROMPTS) if (at(P, SPOT[k])) { if (k === 'rush') startRush(); else startGame(k); return true; }
    if (K.atHiring(P)) { ding(); goGame(nextOf(ORDER), P); return true; }
    if (at(P, SPOT.lift)) { busy = 'look'; LOOK = { yaw: Math.PI }; tone(523, 0.05, 0.2); tone(784, 0.05, 0.3, 'sine', 0.2); toast('THE ROOF · DRAG TO LOOK · E OR ' + (touch ? '3' : 'SPACE') + ' TO GO BACK', 3); return true; }
    if (ownDoc() && at(P, SPOT.coat)) { const on = !docOn(); putOn(on); pop(); toast(on ? 'DOCTOR WHITES ON' : 'DOCTOR WHITES OFF', 1.6); return true; }
    if (near(P, pT)) { pop(); pMenu(!talked++); return true; }
    if (near(P, hT)) { pop(); hMenu(!talkedH++); return true; }
    return false; }
  function quit() { if (busy === 'look') { busy = null; LOOK = null; return; } stop(); toast('BACK TO THE ROUNDS LATER · GOLD KEPT', 2); }
  function useItem(id) { return false; }
  // ================= tick =================
  stop();
  K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'hosp', color: RED, boardTitle: 'Rounds best',
    room: { X0, X1, Z0, Z1 }, door: [89, -152.6], keeper: honey, keeperRy: honey.rotation.y,
    games: ORDER.map(k => ({ k, name: GN[k].charAt(0) + GN[k].slice(1).toLowerCase(), color: ['checkup', 'xray'].includes(k) ? NAVY : TEAL })), board: { x: 92.1, y: 2.5, z: Z1 - 0.09, ry: Math.PI, w: 1.1 },
    hiring: { x: 91.0, z: -153.8, ry: Math.PI }, hiringLine: '6 JOBS · PICK ANY', clock: { x: 89, y: 3.7, z: Z1 - 0.08, ry: Math.PI },
    sun: [{ x: 89, z: -154.0, w: 2.4, d: 2.6 }, { x: 73.8, z: -170, w: 2.6, d: 2.4 }],
    lamps: [[79.7, 4.7, -172.8], [88.1, 4.7, -172.8], [96.5, 4.7, -172.8], [79.7, 4.7, -160.2], [88.1, 4.7, -160.2], [96.5, 4.7, -160.2]],
    browse: [[83.4, -154.2, 0], [101.0, -154.4, 0], [94.1, -153.8, 0], [99.2, -154.0, 0]] });
  function tick(dt, P, fox) { const t = performance.now() / 1000, dH = Math.hypot(P.x - CX, P.z - CZ); G.visible = dH < (touch ? 45 : 90); toastT -= dt;
    if (busy === 'job' && J && !inShop(P)) stop(); if (busy === 'look' && !inShop(P)) { busy = null; LOOK = null; }
    if (RU) { rushTick(dt, P, fox); drawRushCard(); }
    if (busy === 'job' && J) { J.t += dt; if (J.flies.length) flyTick(dt);
      if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      if (J && J.sub === 'steth') stethTick(dt); if (J && J.sub === 'knee') kneeTick(dt); if (J && J.sub === 'pluck') pluckTick(dt); if (J && J.sub === 'heart') heartTick(dt); if (J && J.g === 'diagnose' && J.p) caseTick(dt);
      if (J && (J.sub === 'wrap' || J.sub === 'pin')) DOTS.forEach((d, i) => { if (d.visible) d.scale.setScalar(i === J.di ? 1.5 + 0.4 * Math.sin(t * 8) : 0.8); });
      if (J) drawCard(); }
    hintTick(t); partTick(dt); if (!G.visible) return;
    for (const k in RS) RS[k].visible = !busy && !RU && (k !== 'coat' || ownDoc()); RS.rush.visible = !busy && (!RU || RU.phase !== 'back'); standCoat.visible = ownDoc() && !docOn();
    FISH.forEach(f => { const a = t * f.sp + f.ph; f.g.position.set(83.4 + Math.sin(a) * 1.0, f.y + Math.sin(a * 2.3) * 0.05, -152.98 + Math.cos(a) * 0.14); f.g.rotation.y = Math.cos(a) > 0 ? 0 : Math.PI; });
    if (!(busy === 'job' && J && J.g === 'heart')) { MONS._t = (MONS._t || 0) + dt; if (MONS._t > 0.25) { MONS._t = 0; const n = Math.floor(t * 4); MONS.forEach((m, i) => redraw(m, monFn(flatTrace(n + i * 5), 62 + i * 7))); } }
    const free = !busy || (J && ['intro', 'pay'].includes(J.sub));
    { const work = busy === 'job'; K.tick(dt, P, { inShop: inShop(P), busy: !!busy || !!RU, near: dH, talking: work || !!RU });   // s72: shop kit runs Honey's idle / wave / look-at
      if (work || RU) turnTo(honey, honey.userData.face0 ?? 0, dt * 0.5); }
    for (const [o, fr] of [[patch, free]]) { const dx = P.x - o.position.x, dz = P.z - o.position.z, f0 = o.userData.face0 ?? 0, lk = Math.hypot(dx, dz) < 5 && fr ? Math.atan2(dx, dz) : f0 + Math.sin(t * 0.6) * 0.12; turnTo(o, lk, dt * 0.5); kit.animFox && kit.animFox(o, dt, 0); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, rush: () => RU, startGame, startRush, answer, useItem, patch, honey, camera, save, STR, ARROW,
    tap(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); release(); ptr.down = false; }, down(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.x = x; ptr.y = y; drag(); }, release() { release(); ptr.down = false; },
    targets() { if (!J) return []; const s = J.sub; if (s === 'scan') { const p = V(92.5 + (xr.u - 0.5) * BOARD_W, 2.25 + (xr.v - 0.5) * BOARD_H, Z0 + 0.1); return [scrW(p)]; } if (s === 'pluck') return [{ from: scrW(TWZ.position), to: scrW(J.got ? DISH : bellyPt()) }];
      if (s === 'wrap') return J.pts.slice(J.di).map(scrW); if (s === 'pin') return [scrW(PIN.position)]; if (s === 'knee') return [scrW(kneePt())]; if (s === 'eye') return [J.opts.indexOf(J.ans)]; if (s === 'ask') return [J.opts.indexOf(J.c.a)]; return []; },
    beat() { return J && J.sub === 'steth' ? { last: J.last, per: 60 / J.bpm, t: J.t } : J && J.sub === 'heart' ? { last: J.lastB, next: J.nextB, t: J.t } : null }, setT(v) { if (J) J.t = v; }, holdTwz(on) { if (J) J.held = on ? TWZ : null; },
    hiring: K, dispose() { card.remove(); HAND.remove(); K.dispose(); } };
  G.add(subMesh(R0)); { const gm = new THREE.Mesh(RG.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.28, depthWrite: false })); gm.renderOrder = 2; G.add(gm); }
  window.__hosp = API; return API;
}
