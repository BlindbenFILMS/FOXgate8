import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { applyD, endPose, workD } from '../engine/fox-poses.js?v=s648k';   // s636 you make the beds (the fox shows beside the bed)
// MERU 2.0 — s59 TOWN 2 INTERIOR 17: MERU MOTEL [meruMotel] (shell f 112..146 × -188..-172, front door S (129, -172), side door E (146, -180);
// outdoor walkway + stairs on the front (town2.js), plunge pool on the west side (109, -181)). MAMA KEYS (plump old grey fox, lilac cardigan, a giant brass key ring).
// EIGHT SHORT GAMES, one per yellow ring (Ben's pick: all 8, gentle, no fail): CHECK-IN (match the key) · MAKE THE BEDS (room 101) · ROOM SERVICE (carry the
// tray up the stairs + along the walkway to the door) · FIX THE ICE MACHINE · CLEAN THE POOL (skim leaves) · LOST LUGGAGE · NIGHT DESK (who's knocking?) · LAUNDRY FOLD.
// The HOUSEKEEPING board ticks each; all 8 = FULL HOUSE +60 gold + the GOLDEN ROOM KEY.
// Prizes per clear in turn: BELLHOP UNIFORM (+ pillbox hat, worn; MY UNIFORM hook toggles) → PILLOW MINT ×3 → then +20 gold, a PILLOW MINT every 3rd clear.
// s73 INTERIOR POLISH 17: shopKit (Mama Keys = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board for all 8 jobs; badge), NOW HIRING inside the front door,
// ONE-box menu with choices, 1-box intros + end line, hint hand (from targets()), touch radius 44, portrait lens, cameras clamped inside each room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildMotel({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false }) { const JW = jobWorker(THREE);
  const X0 = 112.4, X1 = 145.6, Z0 = -187.6, Z1 = -172.4, CX = 129, CZ = -180, CEIL = 4.2;
  const G = new THREE.Group(); G.name = 'motel'; scene.add(G);
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', STEEL = '#9aa3ab', DARK = '#3d3b3a', WOOD = '#8a6440', GLASS = '#3a4a58';
  const TEAL = '#2f7f86', CREAM = '#efe4cf', LILAC = '#b39ad6', BROWN = '#7a5232', PURP = '#7a4a9a', BRASS = '#c9a03a', MAHOG = '#6b3f2a';
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
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false });
  const mkRing = (r = 0.12, w = 0.025, par = G) => { const m = mm(new THREE.TorusGeometry(r, w, 6, 24), ringM); m.renderOrder = 3; m.visible = false; par.add(m); return m; };
  function mkHose(col, r = 0.025, par = G) { const m = new THREE.Mesh(new THREE.BufferGeometry(), LM(col)); par.add(m); let key = '';
    return { m, set(a, b, sag = 0.4) { const k = [a.x, a.y, a.z, b.x, b.y, b.z].map(v => v.toFixed(2)).join(); if (k === key) return; key = k; const mid = a.clone().lerp(b, 0.5); mid.y = Math.min(a.y, b.y) - sag;
      const cu = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()); m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(cu, 12, r, 5, false); } }; }
  // ================= FLOORS (retro teal carpet; tiles in the laundry + ice hall; concrete in the luggage room) =================
  { const t = CT(256, 256, (g, W, H) => { g.fillStyle = '#245f66'; g.fillRect(0, 0, W, H); g.strokeStyle = '#e8a33a'; g.lineWidth = 7; for (let i = -1; i <= 2; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128 + 128, 128); g.lineTo(i * 128, 256); g.lineTo(i * 128 - 128, 128); g.closePath(); g.stroke(); }
      g.fillStyle = CREAM; for (const [x, y] of [[128, 128], [0, 0], [256, 0], [0, 256], [256, 256]]) { g.beginPath(); g.arc(x, y, 13, 0, Math.PI * 2); g.fill(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 1.8, (Z1 - Z0) / 1.8); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, (Z0 + Z1) / 2); G.add(f);
    const tl = CT(128, 128, (g, W, H) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#d9e8e6' : '#f3f2f2'; g.fillRect(i * 64, j * 64, 64, 64); } }); tl.wrapS = tl.wrapT = THREE.RepeatWrapping; tl.repeat.set((X1 - 135) / 0.8, (Z1 - Z0) / 0.8);
    const f2 = new THREE.Mesh(new THREE.PlaneGeometry(X1 - 135, Z1 - Z0), new THREE.MeshLambertMaterial({ map: tl })); f2.rotation.x = -Math.PI / 2; f2.position.set((135 + X1) / 2, 0.075, (Z0 + Z1) / 2); G.add(f2);
    box(123 - X0, 0.01, Z1 + 181, '#a9a49c', (X0 + 123) / 2, 0.078, (Z1 - 181) / 2); box(1.6, 0.02, 1.4, '#7a1808', 129, 0.085, -173.4); }
  // ================= WALLS (ink skirting, teal wainscot, yellow rail, cream) + partitions + ceiling =================
  const wall = (len, x, z, ry) => { box(len, 0.15, 0.07, INK, x, 0.075, z, ry); box(len, 1.0, 0.06, TEAL, x, 0.65, z, ry); box(len, 0.08, 0.09, YEL, x, 1.19, z, ry); box(len, CEIL - 1.23, 0.06, CREAM, x, 1.23 + (CEIL - 1.23) / 2, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); for (const [a, b] of [[X0, 127.6], [130.4, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, (Z0 + Z1) / 2, Math.PI / 2); for (const [a, b] of [[Z0, -181.4], [-178.6, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  function part(ax, a, b, c, gaps) { const T = 0.07; let s = a; for (const [g0, g1] of [...gaps, [b, b]]) { if (g0 - s > 0.05) { const L2 = g0 - s, m = (s + g0) / 2;
      if (ax === 'x') { wall(L2, m, c - T, 0); wall(L2, m, c + T, 0); box(L2, 0.05, 0.14, CREAM, m, CEIL - 0.03, c); rect(s, g0, c - 0.1, c + 0.1); } else { wall(L2, c - T, m, Math.PI / 2); wall(L2, c + T, m, Math.PI / 2); box(0.14, 0.05, L2, CREAM, c, CEIL - 0.03, m); rect(c - 0.1, c + 0.1, s, g0); } } s = g1; }
    for (const [g0, g1] of gaps) { const L2 = g1 - g0, m = (g0 + g1) / 2, hh = CEIL - 2.4; if (ax === 'x') { box(L2, hh, 0.2, CREAM, m, 2.4 + hh / 2, c); box(L2 + 0.1, 0.1, 0.24, INK, m, 2.4, c); } else { box(0.2, hh, L2, CREAM, c, 2.4 + hh / 2, m); box(0.24, 0.1, L2 + 0.1, INK, c, 2.4, m); } } }
  part('z', Z0, Z1, 123, [[-178.6, -176.4]]); part('z', Z0, Z1, 135, [[-178.6, -176.4]]); part('x', X0, 123, -181, [[119, 121]]); part('x', 135, X1, -182, [[139.5, 141.5]]); part('x', 123, 135, -184.5, []);
  { const sh = new THREE.Shape(); sh.moveTo(X0, Z0); sh.lineTo(X1, Z0); sh.lineTo(X1, Z1); sh.lineTo(X0, Z1); sh.lineTo(X0, Z0); const cm = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({ color: '#e8e2d6' })); cm.rotation.x = Math.PI / 2; cm.position.y = CEIL; G.add(cm);
    const lm = new THREE.MeshBasicMaterial({ color: '#fff6e0' }), lg = new THREE.PlaneGeometry(0.9, 0.9); for (let x = 115.5; x < X1; x += 4.2) for (let z = -185.5; z < Z1; z += 4.4) { const p = new THREE.Mesh(lg, lm); p.rotation.x = Math.PI / 2; p.position.set(x, CEIL - 0.01, z); G.add(p); } }
  plane2(label("MAMA KEYS' MERU MOTEL", RED, '#ffffff', 512, 64, 34), 3.0, 0.38, 129, 3.3, -177.6); for (const s of [-1, 1]) cyl(0.01, 0.01, CEIL - 3.49, INK, 129 + s * 1.3, 3.49 + (CEIL - 3.49) / 2, -177.6, 4);
  const doorSign = (txt, x, z, ry) => plane2(label(txt, INK, YEL, 256, 48, 30), 1.4, 0.26, x, 2.62, z, ry);
  doorSign('ROOM 101', 120, -181, 0); doorSign('LOST + FOUND', 123, -177.5, Math.PI / 2); doorSign('ICE · LAUNDRY', 135, -177.5, Math.PI / 2); doorSign('LAUNDRY', 140.5, -182, 0);
  // ================= VESTIBULE (front door) with the frosted NIGHT DOOR (open by day, it slides shut for the night desk) =================
  for (const x of [127.2, 130.8]) { RG.box(0.03, 2.4, 2.55, '#cfe8f0', x, 1.2, -173.7); box(0.06, 0.08, 2.6, INK, x, 2.42, -173.7); for (const z of [-175.0, -172.45]) box(0.07, 2.45, 0.07, INK, x, 1.22, z); rect(x - 0.05, x + 0.05, -175.05, -172.4); }
  box(3.7, 0.12, 0.1, INK, 129, 2.45, -175.0); for (const [a, b] of [[127.2, 127.8], [130.2, 130.8]]) { RG.box(b - a, 2.4, 0.03, '#cfe8f0', (a + b) / 2, 1.2, -175.0); rect(a, b, -175.05, -174.95); }
  const frost = new THREE.MeshBasicMaterial({ color: '#f4f8fa', transparent: true, opacity: 0.5, depthWrite: false });
  const LEAF = [-1, 1].map(s => { const g = new THREE.Group(); const p = mm(Bx(1.2, 2.3, 0.03), frost); p.renderOrder = 2; g.add(p); for (const y of [-1.15, 1.15]) g.add(mm(Bx(1.24, 0.06, 0.05), LM(INK), 0, y, 0)); for (const x of [-0.6, 0.6]) g.add(mm(Bx(0.06, 2.34, 0.05), LM(INK), x, 0, 0)); g.add(mm(Bx(0.04, 0.3, 0.06), LM(BRASS), -s * 0.45, 0.05, -0.04));
    g.position.set(129 + s * 1.85, 1.2, -175.07); G.add(g); return { g, s }; });
  let leafK = 1; const leafSet = k => { LEAF.forEach(L => { L.g.position.x = 129 + L.s * (0.6 + 1.25 * k); }); };
  plane(label('NIGHT BELL · PLEASE KNOCK', INK, YEL, 512, 48, 28), 1.6, 0.16, 129, 2.62, -175.06);
  // ================= FRONT DESK + KEY BOARD + ROOM SERVICE COUNTER (lobby) =================
  box(6.8, 1.0, 0.8, MAHOG, 129, 0.5, -181); box(6.82, 0.14, 0.02, RED, 129, 0.82, -180.59); box(6.9, 0.05, 0.9, '#c9a77a', 129, 1.025, -181); rect(125.6, 132.4, -181.45, -180.55);
  plane(label('FRONT DESK · CHECK-IN · NIGHT BELL', INK, '#ffffff', 1024, 64, 34), 3.8, 0.24, 129, 0.45, -180.59);
  cyl(0.07, 0.08, 0.02, BRASS, 128.4, 1.06, -180.82, 12); sph(0.055, BRASS, 128.4, 1.07, -180.82, 1, 0.8, 1); cyl(0.008, 0.008, 0.03, BRASS, 128.4, 1.13, -180.82, 5);
  box(0.42, 0.03, 0.3, WHITE, 130.1, 1.06, -180.9, 0.15); box(0.02, 0.035, 0.3, INK, 130.1, 1.065, -180.9, 0.15); box(0.3, 0.28, 0.3, DARK, 131.7, 1.19, -181.1); box(0.26, 0.2, 0.01, '#5fa8c8', 131.7, 1.22, -180.94);
  cyl(0.07, 0.09, 0.03, BRASS, 126.5, 1.065, -181.1, 10); cyl(0.012, 0.012, 0.32, BRASS, 126.5, 1.22, -181.1, 6); const lampShade = mm(new THREE.CylinderGeometry(0.04, 0.12, 0.1, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#3f9a5e', side: THREE.DoubleSide }), 126.5, 1.38, -181.1); G.add(lampShade);
  // key board on the back partition: 9 keys for 201-209 over 7 for 101-107, number tags drawn on one canvas
  const ROOMS = [101, 102, 103, 104, 105, 106, 107, 201, 202, 203, 204, 205, 206, 207, 208, 209];
  const KEYPOS = r => r > 200 ? V(127.0 + (r - 201) * 0.5, 2.12, -184.33) : V(127.25 + (r - 101) * 0.5, 1.52, -184.33);
  box(4.4, 1.65, 0.06, MAHOG, 129, 1.8, -184.4); box(4.5, 0.06, 0.08, BRASS, 129, 2.65, -184.4); box(4.5, 0.06, 0.08, BRASS, 129, 0.96, -184.4);
  { const t = CT(1024, 384, (g, W, H) => { g.fillStyle = MAHOG; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.textBaseline = 'middle'; g.font = '900 40px Archivo, sans-serif'; g.fillText('ROOM KEYS', 24, 34);
      for (const r of ROOMS) { const p = KEYPOS(r), u = (p.x - 126.8) / 4.4 * W, v = (1 - (p.y + 0.2 - 0.975) / 1.65) * H; g.fillStyle = WHITE; g.fillRect(u - 44, v - 20, 88, 40); g.fillStyle = INK; g.font = '900 30px Archivo, sans-serif'; g.fillText(String(r), u - 30, v + 2); } });
    plane(t, 4.4, 1.65, 129, 1.8, -184.36); }
  const FOB = [RED, BLUE, GREEN, YEL];
  const KEYS = ROOMS.map((r, i) => { const g = new THREE.Group(); g.add(mm(Bx(0.1, 0.1, 0.02), LM(FOB[i % 4]), 0, -0.1, 0, 0, 0, Math.PI / 4), mm(new THREE.TorusGeometry(0.022, 0.006, 5, 10), LM(BRASS), 0, -0.02, 0), mm(Bx(0.018, 0.1, 0.01), LM(BRASS), 0, -0.21, 0.012));
    const home = KEYPOS(r); g.position.copy(home); G.add(g); cyl(0.008, 0.008, 0.06, BRASS, home.x, home.y, -184.34, 5, Math.PI / 2); return { r, g, home, out: false }; });
  // room service counter + the kitchen hatch (a lit kitchen painted behind)
  box(2.1, 0.95, 0.7, WOOD, 124.35, 0.475, -184.15); box(2.14, 0.04, 0.74, '#cfd6da', 124.35, 0.97, -184.15); rect(123.3, 125.4, -184.5, -183.8); plane(label('ROOM SERVICE', RED, '#ffffff', 256, 48, 30), 1.0, 0.18, 124.35, 0.7, -183.79);
  { const t = CT(512, 256, (g, W, H) => { g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H); g.fillStyle = '#c9c4bc'; g.fillRect(0, 170, W, 86); g.fillStyle = DARK; g.fillRect(40, 120, 160, 70); g.fillStyle = '#ec7a13'; for (const x of [70, 150]) { g.beginPath(); g.arc(x, 120, 22, Math.PI, 0); g.fill(); } g.fillStyle = STEEL; g.fillRect(240, 30, 90, 150); g.fillRect(360, 90, 120, 18);
      g.fillStyle = '#b5522a'; for (const x of [380, 420, 460]) { g.beginPath(); g.arc(x, 70, 16, 0, Math.PI * 2); g.fill(); } g.fillStyle = INK; g.font = '900 28px Archivo, sans-serif'; g.fillText('KITCHEN', 260, 225); });
    plane(t, 1.7, 0.85, 124.35, 1.7, -184.42); box(1.84, 0.08, 0.12, INK, 124.35, 2.16, -184.4); box(1.84, 0.08, 0.12, INK, 124.35, 1.24, -184.4); for (const s of [-1, 1]) box(0.08, 1.0, 0.12, INK, 124.35 + s * 0.88, 1.7, -184.4); }
  const FOOD = [{ n: 'PANCAKES', c: '#e6b45a' }, { n: 'ORANGE JUICE', c: '#f28c28' }, { n: 'COFFEE', c: MAHOG }, { n: 'TOAST', c: '#d9a066' }, { n: 'SOUP', c: '#c0392b' }, { n: 'CAKE', c: '#f7c6dc' }];
  function food3D(k) { const g = new THREE.Group(), w = LM(WHITE); g.add(mm(Cy(0.11, 0.1, 0.015, 14), w, 0, 0.008, 0));
    if (k === 0) { for (let i = 0; i < 3; i++) g.add(mm(Cy(0.08, 0.08, 0.025, 12), LM(FOOD[0].c), 0, 0.03 + i * 0.026, 0)); g.add(mm(Bx(0.035, 0.015, 0.035), LM('#fff2a0'), 0, 0.11, 0)); }
    else if (k === 1) g.add(mm(Cy(0.035, 0.03, 0.13, 10), LM(FOOD[1].c), 0, 0.08, 0)); else if (k === 2) { g.add(mm(Cy(0.04, 0.035, 0.08, 10), w, 0, 0.055, 0), mm(Cy(0.036, 0.036, 0.004, 10), LM(MAHOG), 0, 0.094, 0), mm(new THREE.TorusGeometry(0.022, 0.007, 5, 8), w, 0.045, 0.055, 0)); }
    else if (k === 3) for (const x of [-0.03, 0.03]) g.add(mm(Bx(0.012, 0.09, 0.09), LM(FOOD[3].c), x, 0.06, 0)); else if (k === 4) { g.add(mm(Cy(0.07, 0.045, 0.05, 12), w, 0, 0.035, 0), mm(Cy(0.064, 0.064, 0.004, 12), LM(FOOD[4].c), 0, 0.058, 0)); }
    else { const c = mm(new THREE.CylinderGeometry(0.07, 0.07, 0.07, 12, 1, false, 0, Math.PI / 2.2), LM(FOOD[5].c), 0, 0.05, 0); g.add(c, mm(Sp(0.015, 6, 4), LM(RED), 0.02, 0.09, 0.02)); }
    G.add(g); return g; }
  const FOODP = k => V(123.55 + k * 0.32, 0.99, -184.36);
  FOOD.forEach((_, k) => { const g = food3D(k); g.position.copy(FOODP(k)); });
  const TRAY = new THREE.Group(); TRAY.add(mm(Bx(0.5, 0.02, 0.34), LM('#cfd6da')), mm(Bx(0.52, 0.04, 0.02), LM(STEEL), 0, 0.02, 0.17), mm(Bx(0.52, 0.04, 0.02), LM(STEEL), 0, 0.02, -0.17)); const TRAYH = V(124.35, 1.0, -183.98); TRAY.position.copy(TRAYH); G.add(TRAY);
  const TSLOT = [V(-0.13, 0.01, 0.05), V(0.12, 0.01, 0.05), V(0, 0.01, -0.08)];
  // lobby lounge: 2 armchairs + table, brochure rack, plant, the HOUSEKEEPING board, MY UNIFORM hook
  for (const [x, ry] of [[132.6, -0.5], [134.0, 0.5]]) { box(0.8, 0.42, 0.8, '#d2691e', x, 0.21, -174.0, ry); box(0.8, 0.6, 0.18, '#d2691e', x - Math.sin(ry) * 0.36, 0.6, -174.0 - Math.cos(ry) * 0.36 + 0.72, ry); } rect(132, 134.6, -174.5, -173.2);
  cyl(0.35, 0.35, 0.04, '#cfd6da', 133.3, 0.42, -175.2, 14); cyl(0.04, 0.06, 0.4, INK, 133.3, 0.2, -175.2, 6); box(0.25, 0.02, 0.18, BLUE, 133.25, 0.45, -175.2, 0.4);
  box(0.6, 1.3, 0.3, DARK, 125.4, 0.65, -172.75); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) box(0.2, 0.26, 0.02, [BLUE, GREEN, RED, YEL][(i + j) % 4], 125.27 + j * 0.25, 0.4 + i * 0.36, -172.92, 0, -0.15); plane(label('SEE MERU', INK, '#ffffff', 128, 48, 28), 0.5, 0.14, 125.4, 1.4, -172.91); rect(125.1, 125.7, -172.9, -172.6);
  cyl(0.22, 0.18, 0.4, '#c98a4a', 134.4, 0.2, -183.9, 10); sph(0.38, '#3f7a52', 134.4, 0.7, -183.9, 1, 1.3, 1); rect(134.1, 134.7, -184.2, -183.6);
  const DOING = [['checkin', 'CHECK-IN'], ['beds', 'MAKE THE BEDS'], ['service', 'ROOM SERVICE'], ['ice', 'FIX THE ICE MACHINE'], ['pool', 'CLEAN THE POOL'], ['luggage', 'LOST LUGGAGE'], ['night', 'NIGHT DESK'], ['laundry', 'LAUNDRY FOLD']];
  const doneMap = () => { const d = save.stat('mtDone', null); return d && typeof d === 'object' ? d : {}; };
  const boardFn = (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = TEAL; g.fillRect(0, 0, W, 60); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.font = '900 32px Archivo, sans-serif'; g.fillText('HOUSEKEEPING TODAY', 16, 32); const d = doneMap();
    DOING.forEach(([k, n], i) => { const y = 86 + i * 38; g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(18, y - 13, 26, 26); if (d[k]) { g.strokeStyle = GREEN; g.lineWidth = 7; g.beginPath(); g.moveTo(22, y); g.lineTo(30, y + 9); g.lineTo(44, y - 13); g.stroke(); } g.fillStyle = INK; g.font = '800 24px Archivo, sans-serif'; g.fillText(n, 58, y + 2); });
    g.fillStyle = d.full ? GREEN : '#9a948c'; g.font = '900 20px Archivo, sans-serif'; g.fillText(d.full ? 'FULL HOUSE · BEST STAFF IN MERU!' : 'ALL 8 = FULL HOUSE BONUS', 18, H - 18); };
  const boardTex = CT(512, 448, boardFn); box(0.06, 1.6, 1.84, INK, 134.86, 1.85, -175.6); plane(boardTex, 1.76, 1.54, 134.82, 1.85, -175.6, -Math.PI / 2);
  cyl(0.03, 0.03, 0.2, STEEL, 123.18, 2.0, -173.6, 6, 0, Math.PI / 2);
  const hookU = new THREE.Group(); hookU.add(mm(Bx(0.5, 0.75, 0.12), LM(RED), 0, -0.42, 0), mm(Bx(0.5, 0.06, 0.13), LM(BRASS), 0, -0.68, 0)); for (let i = 0; i < 3; i++) hookU.add(mm(Sp(0.02, 6, 4), LM(BRASS), 0.07, -0.25 - i * 0.14, 0.065)); hookU.position.set(123.24, 2.0, -173.6); hookU.rotation.y = Math.PI / 2; G.add(hookU);
  plane(label('MY UNIFORM', INK, YEL, 256, 48, 30), 0.6, 0.12, 123.16, 2.25, -173.6, Math.PI / 2);
  // ================= ROOM 101 (2 beds to make) =================
  const BEDX = [114.9, 120.3], HEADZ = -187.45, FOOTZ = -185.42, BTOP = 0.55;
  BEDX.forEach((x, i) => { box(1.56, 0.35, 2.1, MAHOG, x, 0.175, -186.45); box(1.48, 0.2, 2.04, '#f6f4ef', x, 0.45, -186.45); box(1.7, 1.15, 0.1, TEAL, x, 0.575, -187.5); box(1.7, 0.06, 0.12, YEL, x, 1.15, -187.5); rect(x - 0.8, x + 0.8, -187.6, -185.38);
    const nx = i ? x + 1.25 : x - 1.25; box(0.5, 0.55, 0.45, MAHOG, nx, 0.275, -187.25); cyl(0.05, 0.07, 0.03, BRASS, nx, 0.565, -187.3, 8); cyl(0.012, 0.012, 0.3, BRASS, nx, 0.72, -187.3, 5); RG.cyl(0.08, 0.15, 0.18, '#fff2c0', nx, 0.92, -187.3, 12);
    box(0.14, 0.02, 0.1, WHITE, nx + 0.12, 0.56, -187.05); rect(nx - 0.26, nx + 0.26, -187.6, -187.0); });
  box(1.6, 0.8, 0.5, MAHOG, 115.4, 0.4, -181.35); box(0.9, 0.55, 0.06, INK, 115.4, 1.15, -181.2); box(0.84, 0.48, 0.01, '#3a5a6a', 115.4, 1.15, -181.24); rect(114.6, 116.2, -181.6, -181.0);
  { const t = CT(256, 128, (g, W, H) => { g.fillStyle = '#9fd0e8'; g.fillRect(0, 0, W, H); g.fillStyle = '#3f7a52'; g.beginPath(); g.moveTo(0, 90); g.lineTo(70, 30); g.lineTo(130, 80); g.lineTo(190, 20); g.lineTo(256, 90); g.lineTo(256, 128); g.lineTo(0, 128); g.fill(); g.fillStyle = '#2e86b8'; g.fillRect(0, 100, W, 28); g.fillStyle = YEL; g.beginPath(); g.arc(210, 26, 14, 0, Math.PI * 2); g.fill(); });
    plane(t, 1.5, 0.75, 117.6, 1.85, -187.55); box(1.6, 0.85, 0.04, BRASS, 117.6, 1.85, -187.58); }
  const sheetM = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const BEDS = BEDX.map((x, i) => { const sheet = mm(Bx(1.54, 0.025, 2.0), sheetM, x, BTOP + 0.013, FOOTZ - 1.0); sheet.visible = false; G.add(sheet);
    const lump = new THREE.Group(); for (const [a, b, r] of [[-0.25, 0.1, 0.2], [0.15, 0.0, 0.24], [0.4, 0.15, 0.16]]) lump.add(mm(Sp(r, 8, 6), sheetM, a, 0.05, b)); lump.scale.y = 0.55; lump.position.set(x, BTOP, FOOTZ - 0.25); G.add(lump);
    const flaps = [[-1, HEADZ + 0.05], [1, HEADZ + 0.05], [-1, FOOTZ - 0.05], [1, FOOTZ - 0.05]].map(([s, z]) => { const f = mm(Bx(0.02, 0.22, 0.3), sheetM, x + s * 0.78, 0.44, z); f.visible = false; G.add(f); return f; });
    const ps = i ? -1 : 1, pillows = [0, 1].map(k => { const p = mm(Bx(0.58, 0.14, 0.34), LM('#fbfaf6'), x + ps * 1.0, 0.08 + k * 0.14, FOOTZ - 0.3 - k * 0.1, 0, 0.3 * (k ? 1 : -1)); G.add(p); return { m: p, home: p.position.clone(), hr: p.rotation.y, to: V(x + (k ? 0.34 : -0.34), BTOP + 0.09, HEADZ + 0.28) }; });
    const nx = i ? x + 1.25 : x - 1.25, mint = mm(Bx(0.06, 0.02, 0.04), LM('#5ad0a0'), nx + 0.12, 0.58, -187.05); G.add(mint);
    return { x, sheet, lump, flaps, pillows, mint, mintHome: mint.position.clone() }; });
  const resetBeds = () => BEDS.forEach(B => { B.sheet.visible = false; B.sheet.scale.z = 1; B.lump.visible = true; B.lump.scale.set(1, 0.55, 1); B.flaps.forEach(f => { f.visible = false; }); B.pillows.forEach(p => { p.up = false; p.m.position.copy(p.home); p.m.rotation.set(0, p.hr, 0); }); B.mint.position.copy(B.mintHome); B.mint.rotation.set(0, 0, 0); });
  // ================= LOST + FOUND room (12 bags on a 3-shelf rack, counter) =================
  const SHY = [0.12, 0.77, 1.42], SHZ = [-180.0, -178.2, -176.4, -174.6], RACKX = 112.78;
  for (const y of SHY) box(0.62, 0.04, 7.2, WOOD, RACKX, y - 0.02, -177.3); for (const z of [-180.9, -177.3, -173.7]) for (const x of [RACKX - 0.29, RACKX + 0.29]) box(0.04, 2.0, 0.04, DARK, x, 1.0, z); rect(X0, 113.1, -180.95, -173.65);
  plane(label('LOST + FOUND', INK, YEL, 256, 48, 30), 1.6, 0.3, 112.48, 2.3, -177.3, Math.PI / 2);
  box(0.6, 1.0, 3.6, MAHOG, 121.3, 0.5, -177.2); box(0.68, 0.04, 3.66, '#c9a77a', 121.3, 1.02, -177.2); rect(121.0, 121.6, -179.0, -175.4); plane(label('LOST + FOUND · ASK HERE', TEAL, '#ffffff', 512, 48, 28), 2.0, 0.18, 121.61, 0.62, -177.2, Math.PI / 2);
  cyl(0.06, 0.07, 0.02, BRASS, 121.3, 1.05, -178.4, 10); sph(0.05, BRASS, 121.3, 1.06, -178.4, 1, 0.8, 1);
  const BCOL = [['RED', RED], ['BLUE', BLUE], ['YELLOW', YEL], ['GREEN', GREEN], ['PURPLE', PURP], ['BROWN', BROWN]], BTYP = ['SUITCASE', 'DUFFEL', 'BACKPACK', 'HAT BOX', 'TRUNK'], BTAG = [['WHITE TAG', '#ffffff'], ['RED TAG', RED], ['YELLOW TAG', YEL]];
  function bag3D(g, c, t, tg) { while (g.children.length) g.remove(g.children[0]); const m = LM(BCOL[c][1]), dk = LM(DARK), tm = LM(BTAG[tg][1]); let tp;
    if (t === 0) { g.add(mm(Bx(0.24, 0.44, 0.6), m, 0, 0.22, 0), mm(Bx(0.04, 0.05, 0.18), dk, 0, 0.47, 0)); tp = [0.13, 0.36, 0.14]; }
    else if (t === 1) { g.add(mm(Cy(0.18, 0.18, 0.62, 12), m, 0, 0.18, 0, Math.PI / 2), mm(new THREE.TorusGeometry(0.1, 0.015, 5, 10, Math.PI), dk, 0, 0.36, 0, 0, Math.PI / 2)); tp = [0.19, 0.25, 0.12]; }
    else if (t === 2) { g.add(mm(Bx(0.22, 0.46, 0.34), m, 0, 0.23, 0), mm(Bx(0.06, 0.18, 0.26), m, 0.13, 0.15, 0), mm(Bx(0.07, 0.02, 0.27), dk, 0.13, 0.24, 0)); tp = [0.17, 0.4, 0.13]; }
    else if (t === 3) { g.add(mm(Cy(0.2, 0.2, 0.28, 14), m, 0, 0.14, 0), mm(Cy(0.215, 0.215, 0.05, 14), dk, 0, 0.29, 0)); tp = [0.21, 0.2, 0]; }
    else { g.add(mm(Bx(0.36, 0.36, 0.62), m, 0, 0.18, 0)); for (const y of [0.07, 0.29]) g.add(mm(Bx(0.37, 0.04, 0.63), dk, 0, y, 0)); g.add(mm(Bx(0.05, 0.06, 0.06), LM(BRASS), 0.19, 0.25, 0)); tp = [0.19, 0.3, 0.16]; }
    g.add(mm(Bx(0.02, 0.1, 0.07), tm, tp[0], tp[1] - 0.06, tp[2]), mm(Cy(0.004, 0.004, 0.06, 4), dk, tp[0], tp[1], tp[2])); }
  const BAGS = []; for (let s = 0; s < 3; s++) for (let k = 0; k < 4; k++) { const g = new THREE.Group(); const home = V(RACKX, SHY[s], SHZ[k]); g.position.copy(home); G.add(g); BAGS.push({ g, home, c: 0, t: 0, tg: 0, out: false }); }
  const tagOk = (c, tg) => !((c === 0 && tg === 1) || (c === 2 && tg === 2));
  const bagDesc = b => BCOL[b.c][0] + ' ' + BTYP[b.t] + ' · ' + BTAG[b.tg][0];
  function dealBags() { for (let tries = 0; tries < 80; tries++) { const set = new Set(), L2 = [], add = (c, t, tg) => { const k = c + '_' + t + '_' + tg; if (set.has(k) || !tagOk(c, tg)) return false; set.add(k); L2.push({ c, t, tg }); return true; };
      const tg3 = []; for (let i = 0; i < 3; i++) { let ok = false; for (let q = 0; q < 20 && !ok; q++) { const c = Math.floor(Math.random() * 6), t = Math.floor(Math.random() * 5), tg = Math.floor(Math.random() * 3); ok = add(c, t, tg); if (ok) tg3.push(L2.length - 1); } }
      for (const i of tg3.slice()) { const T = L2[i]; add(T.c, T.t, (T.tg + 1) % 3) || add(T.c, T.t, (T.tg + 2) % 3); add((T.c + 1 + Math.floor(Math.random() * 5)) % 6, T.t, T.tg); add(T.c, (T.t + 1 + Math.floor(Math.random() * 4)) % 5, T.tg); }
      for (let q = 0; q < 60 && L2.length < 12; q++) add(Math.floor(Math.random() * 6), Math.floor(Math.random() * 5), Math.floor(Math.random() * 3));
      if (L2.length < 12 || tg3.length < 3) continue; const order = shuffle([...Array(12).keys()]); const targets = [];
      order.forEach((li, si) => { const B = BAGS[si], o = L2[li]; B.c = o.c; B.t = o.t; B.tg = o.tg; B.out = false; B.g.position.copy(B.home); B.g.rotation.set(0, 0, 0); B.g.visible = true; bag3D(B.g, o.c, o.t, o.tg); if (tg3.includes(li)) targets.push(si); }); return shuffle(targets); } return [0, 1, 2]; }
  dealBags();
  // ================= LAUNDRY (washers, dryers, folding table, 3 carts) =================
  for (const x of [137.0, 138.1, 139.2]) { box(0.95, 0.95, 0.75, WHITE, x, 0.475, -187.18); cyl(0.3, 0.3, 0.03, STEEL, x, 0.5, -186.8, 18, Math.PI / 2); RG.cyl(0.24, 0.24, 0.02, '#9fc8e0', x, 0.5, -186.78, 16, Math.PI / 2); box(0.9, 0.12, 0.02, DARK, x, 0.88, -186.8); } rect(136.5, 139.7, -187.6, -186.8);
  for (const x of [141.4, 142.5]) { box(0.95, 0.95, 0.75, '#efe0b0', x, 0.475, -187.18); box(0.9, 0.12, 0.02, DARK, x, 0.88, -186.8); RG.cyl(0.25, 0.25, 0.02, '#ffe6b0', x, 0.5, -186.79, 16, Math.PI / 2); } rect(140.9, 143.0, -187.6, -186.8);
  const DRYD = new THREE.Group(); DRYD.add(mm(new THREE.TorusGeometry(0.27, 0.035, 6, 18), LM(STEEL), 0.27, 0, 0), mm(Cy(0.25, 0.25, 0.02, 16), new THREE.MeshLambertMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.6 }), 0.27, 0, 0, Math.PI / 2)); DRYD.position.set(141.4 - 0.27, 0.5, -186.77); G.add(DRYD);
  box(3.4, 0.05, 0.4, WOOD, 138.5, 1.7, -187.38); for (let i = 0; i < 6; i++) box(0.18, 0.3, 0.14, [BLUE, '#f28c28', GREEN, WHITE][i % 4], 137.0 + i * 0.55, 1.88, -187.38); plane(label('SOAP · SOFTENER', TEAL, '#ffffff', 256, 48, 28), 1.2, 0.2, 138.5, 2.3, -187.55);
  box(2.6, 0.06, 1.3, '#d9dee3', 140.4, 0.87, -185.0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.06, 0.86, 0.06, DARK, 140.4 + sx * 1.22, 0.43, -185.0 + sz * 0.58); rect(139.1, 141.7, -185.65, -184.35);
  const CARTS = [{ n: 'TOWELS', z: -186.6, c: '#f3f2f2' }, { n: 'SHEETS', z: -185.1, c: '#dfeef5' }, { n: 'PILLOWCASES', z: -183.6, c: '#fff2c0' }].map(o => { box(0.7, 0.62, 0.6, '#9a948c', 144.95, 0.41, o.z); box(0.72, 0.05, 0.62, DARK, 144.95, 0.73, o.z); for (const s of [-1, 1]) for (const t of [-1, 1]) cyl(0.04, 0.04, 0.06, INK, 144.95 + s * 0.28, 0.04, o.z + t * 0.24, 6, Math.PI / 2);
    plane(label(o.n, TEAL, '#ffffff', 256, 48, 28), 0.66, 0.13, 144.59, 0.5, o.z, -Math.PI / 2); rect(144.6, 145.3, o.z - 0.31, o.z + 0.31); return { ...o, n2: 0, stack: [] }; });
  box(0.55, 0.3, 0.4, '#c9a77a', 142.4, 0.15, -184.0); const BASKET = []; // lumps in the basket
  plane2(label('LAUNDRY', TEAL, '#ffffff', 256, 48, 30), 1.2, 0.24, 140.4, 3.2, -185.0);
  const CLOTH = [{ n: 'BATH TOWEL', c: '#f3f2f2', w: 1.0, d: 0.7, cart: 0 }, { n: 'BED SHEET', c: '#dfeef5', w: 1.9, d: 1.15, cart: 1 }, { n: 'PILLOWCASE', c: '#fff2c0', w: 0.8, d: 0.5, cart: 2 }, { n: 'HAND TOWEL', c: '#f7c6dc', w: 0.64, d: 0.42, cart: 0 }];
  const CL = new THREE.Group(); CL.position.set(140.4, 0.905, -185.0); G.add(CL); const clBase = mm(Bx(1, 1, 1), LM(WHITE)); CL.add(clBase); const clPiv = new THREE.Group(); CL.add(clPiv); const clFlap = mm(Bx(1, 1, 1), LM(WHITE)); clPiv.add(clFlap); CL.visible = false;
  const clSet = (o, w, d, t) => { clBase.material = clFlap.material = LM(o.c); clBase.scale.set(w, t, d); clBase.position.set(0, t / 2, 0); clPiv.visible = false; };
  // ================= ICE + VENDING HALL (ice machine on the front wall, vending + snack machines, bench) =================
  const IX = 141.5, IZF = -173.2;
  box(1.1, 1.9, 0.75, '#d9dee3', IX, 0.95, -172.82); box(1.12, 0.22, 0.77, BLUE, IX, 2.0, -172.82); plane(label('ICE', BLUE, '#ffffff', 128, 64, 44), 0.6, 0.2, IX, 2.0, IZF - 0.2); rect(IX - 0.55, IX + 0.55, -173.2, Z1);
  box(0.9, 0.6, 0.02, DARK, IX, 0.45, IZF - 0.005); box(0.86, 0.76, 0.03, '#2a2f35', IX, 1.35, IZF + 0.01); box(0.82, 0.04, 0.05, STEEL, IX, 0.78, IZF - 0.02);
  const PANEL = mm(Bx(0.9, 0.8, 0.03), LM('#c2c9cf'), IX, 1.35, IZF - 0.03); G.add(PANEL); const PANELH = PANEL.position.clone();
  const SCREW = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => { const m = mm(Cy(0.022, 0.022, 0.02, 8), LM(STEEL), IX + sx * 0.38, 1.35 + sy * 0.33, IZF - 0.055, Math.PI / 2); G.add(m); return { m, home: m.position.clone(), out: false }; });
  const CHUNK = mm(Bx(0.3, 0.26, 0.12), new THREE.MeshLambertMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.85 }), IX, 1.2, IZF - 0.02); CHUNK.renderOrder = 2; CHUNK.visible = false; G.add(CHUNK);
  const WCOL = [RED, BLUE, YEL], WIRE = WCOL.map((c, i) => { const a = V(IX - 0.25 + i * 0.25, 1.68, IZF - 0.03), end = mm(Sp(0.025, 8, 6), LM(c)); G.add(end); const h = mkHose(c, 0.012); return { c, a, end, h, loose: V(IX - 0.25 + i * 0.25 + rnd(-0.06, 0.06), 1.3, IZF - 0.06), on: false }; });
  const SOCK = WCOL.map((c, i) => { const m = mm(Bx(0.08, 0.08, 0.02), LM(c), 0, 1.04, IZF - 0.03); G.add(m); return { m, c }; });
  const LIGHT = mm(Sp(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: '#7a1808' }), IX - 0.4, 1.84, IZF - 0.04); G.add(LIGHT); const RESET = mm(Bx(0.1, 0.06, 0.04), LM(RED), IX + 0.38, 1.84, IZF - 0.04); G.add(RESET);
  plane(label('RESET', INK, '#ffffff', 128, 32, 22), 0.16, 0.04, IX + 0.38, 1.79, IZF - 0.065);
  const ICEP = new THREE.Group(); for (let i = 0; i < 9; i++) ICEP.add(mm(Bx(0.06, 0.06, 0.06), new THREE.MeshLambertMaterial({ color: '#e8f8ff' }), rnd(-0.3, 0.3), 0.2 + rnd(0, 0.1), rnd(-0.03, 0.05), rnd(0, 3), rnd(0, 3))); ICEP.position.set(IX, 0, IZF - 0.02); ICEP.visible = false; G.add(ICEP);
  const BUCKET = new THREE.Group(); BUCKET.add(mm(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 14, 1, true), new THREE.MeshLambertMaterial({ color: RED, side: THREE.DoubleSide }), 0, 0.12, 0), mm(Cy(0.1, 0.1, 0.01, 14), LM(RED), 0, 0.005, 0)); const BFILL = mm(Cy(0.12, 0.1, 1, 14), LM('#e8f8ff'), 0, 0, 0); BUCKET.add(BFILL); BUCKET.position.set(IX, 0.08, IZF - 0.35); BUCKET.visible = false; G.add(BUCKET);
  const setFill = k => { const h = 0.23 * clamp(k, 0.001, 1); BFILL.scale.set(1, h, 1); BFILL.position.y = 0.01 + h / 2; };
  box(0.9, 1.8, 0.7, RED, 138.4, 0.9, -172.8); RG.box(0.6, 1.1, 0.02, '#cfe8f0', 138.3, 1.15, -173.16); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) cyl(0.04, 0.04, 0.16, [BLUE, YEL, GREEN, WHITE][(i + j) % 4], 138.13 + j * 0.18, 0.74 + i * 0.27, -172.95, 8); plane(label('COLD DRINKS', RED, '#ffffff', 256, 48, 30), 0.7, 0.14, 138.4, 1.82, -173.16); rect(137.95, 138.85, -173.15, Z1);
  box(0.9, 1.8, 0.7, DARK, 137.3, 0.9, -172.8); RG.box(0.6, 1.1, 0.02, '#cfe8f0', 137.2, 1.15, -173.16); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(0.12, 0.14, 0.05, [RED, YEL, '#6b3f2a', GREEN][(i * j + i) % 4], 137.03 + j * 0.18, 0.74 + i * 0.27, -172.95); plane(label('SNACKS', INK, YEL, 256, 48, 30), 0.7, 0.14, 137.3, 1.82, -173.16); rect(136.85, 137.75, -173.15, Z1);
  box(1.8, 0.45, 0.5, TEAL, 140.2, 0.225, -181.4); box(1.8, 0.5, 0.12, TEAL, 140.2, 0.6, -181.6); rect(139.3, 141.1, -181.8, -181.15);
  plane2(label('ICE · VENDING', BLUE, '#ffffff', 256, 48, 30), 1.4, 0.26, 140.3, 3.2, -177.0);
  // ================= THE POOL (outside, west side; town2.js builds the water + rim) — leaves, net, bin, lounger =================
  const POOL = { x0: 107.75, x1: 110.25, z0: -185.75, z1: -176.25, y: 0.258 };
  const leafG = new THREE.CircleGeometry(0.075, 8); leafG.scale(1.8, 1, 1); leafG.rotateX(-Math.PI / 2);
  const LEAVES = [...Array(12)].map(() => { const m = mm(leafG, new THREE.MeshLambertMaterial({ color: pick(['#5a8a3a', '#c98a2a', '#b5522a', '#8aa83a']) })); m.visible = false; m.renderOrder = 2; G.add(m); return { m, x: 0, z: 0, ph: rnd(0, 6), caught: false, done: false, off: V() }; });
  const NET = new THREE.Group(); NET.add(mm(new THREE.TorusGeometry(0.22, 0.015, 6, 20), LM(STEEL), 0, 0, 0, Math.PI / 2)); { const n = mm(new THREE.CircleGeometry(0.21, 16), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, -0.01, 0, -Math.PI / 2); NET.add(n);
    const pole = mm(Cy(0.016, 0.016, 2.4, 6), LM(BLUE), 0, 0.85, 0.85, 0.785); NET.add(pole); } NET.visible = false; G.add(NET);
  const BIN = new THREE.Group(); BIN.add(mm(Cy(0.24, 0.2, 0.6, 12), LM(GREEN), 0, 0.3, 0), mm(Cy(0.26, 0.26, 0.04, 12), LM('#2e7a48'), 0, 0.62, 0)); BIN.position.set(107.0, 0, -175.0); G.add(BIN); rect(106.75, 107.25, -175.25, -174.75);
  box(0.65, 0.12, 1.8, WHITE, 109.0, 0.3, -187.4); box(0.65, 0.5, 0.1, WHITE, 109.0, 0.55, -188.25, 0, -0.5); for (const s of [-1, 1]) for (const t of [-1, 1]) box(0.04, 0.3, 0.04, STEEL, 109 + s * 0.28, 0.15, -187.4 + t * 0.8); rect(108.6, 109.4, -188.4, -186.5);
  cyl(0.03, 0.03, 2.3, WHITE, 110.3, 1.15, -187.6, 6); R0.put(Co(1.1, 0.5, 10), 110.3, 2.4, -187.6, RED); cyl(0.12, 0.15, 0.08, DARK, 110.3, 0.04, -187.6, 8);
  const FLOATY = new THREE.Group(); FLOATY.add(mm(Sp(0.1, 10, 8), LM(YEL), 0, 0.04, 0), mm(Sp(0.06, 8, 6), LM(YEL), 0.08, 0.13, 0), mm(Co(0.025, 0.06, 6), LM('#f28c28'), 0.15, 0.12, 0, 0, 0, -Math.PI / 2)); FLOATY.scale.y = 0.9; FLOATY.visible = false; G.add(FLOATY);
  // ================= MAMA KEYS =================
  const MK = { fur: '#9a9490', furDark: '#6f6a66', muzzle: '#f2ece6', snout: '#ece4dc', chin: '#ffffff', fluff: '#ffffff', lashes: 1 };
  const mama = kit.makeFox({ key: 'mamaKeys', torso: [LILAC, '#9a80c0', '#7a62a0'], outfit: 'coat', mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: MK }); mama.scale.multiplyScalar(1.08); mama.scale.x *= 1.1; mama.scale.z *= 1.1;
  { const P = mama.userData && mama.userData.P; if (P && P.body) { const kr = new THREE.Group(); kr.add(mm(new THREE.TorusGeometry(0.09, 0.012, 6, 16), LM(BRASS))); for (let i = 0; i < 4; i++) { const a = -0.6 + i * 0.4; kr.add(mm(Bx(0.02, 0.1, 0.01), LM(BRASS), Math.sin(a) * 0.09, -0.07 - Math.cos(a) * 0.04, 0)); } kr.position.set(0.18, 0.72, 0.2); P.body.add(kr); }
    if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; }
  G.add(mama); const mCol = { c: [0, 0, 0.5] }; cols.push(mCol);
  const KS = { idle: [133.7, -183.0, 0], checkin: [133.9, -182.0, -0.6], night: [133.5, -182.4, -0.5], service: [126.9, -183.6, -1.4], beds: [121.9, -182.2, -2.4], luggage: [119.4, -179.8, 0.6], ice: [139.4, -174.6, 1.4], pool: [111.3, -176.6, -2.6], laundry: [143.3, -182.9, -2.3] };
  const placeK = g => { const a = KS[g] || KS.idle; mama.position.set(a[0], 0, a[1]); mama.rotation.y = mama.userData.face0 = a[2]; mCol.c[0] = a[0]; mCol.c[1] = a[1]; }; placeK('idle');
  const mT = { key: 'mamaKeys', obj: mama, ry: 0, r: 3.0 }, endM = { key: 'mamaEnd', obj: mama, ry: 0, r: 60 };
  const lm = text => ({ who: 'MAMA KEYS', role: 'MOTEL OWNER', text }), lx = (who, text) => ({ who, role: 'GUEST', text });
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ================= guests (town foxes, made when first needed) =================
  const CUS = [{ name: 'PELL', look: { fur: '#c9743a', furDark: '#9a5426', muzzle: '#f6e2cc' }, torso: ['#5a8ac8', '#3d6aa0', '#2a4a70'], outfit: 'vest' },
    { name: 'FLICK', look: { fur: '#e07a30', furDark: '#b05a1e', muzzle: '#fff0e0' }, torso: [YEL, '#c9a020', '#8a6a10'], outfit: 'vest' },
    { name: 'KIA', look: { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, torso: ['#c75b9b', '#9a4078', '#6a2a50'], outfit: 'dress' },
    { name: 'OTTO', look: { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, torso: ['#3f9a5e', '#2e7a48', '#1f5a34'], outfit: 'suit' },
    { name: 'MARLA', look: { fur: '#b07a5a', furDark: '#80563c', muzzle: '#f4e4d8', lashes: 1 }, torso: ['#e8e0f0', '#c8c0d8', '#a8a0b8'], outfit: 'dress' },
    { name: 'MICHAEL JAY', look: { fur: '#5a4a3a', furDark: '#3a2e22', muzzle: '#e0d4c4' }, torso: [RED, '#b8250f', '#7a1808'], outfit: 'vest' }];
  const cf = []; let banditF = null;
  const mkP = (key, o, par = G) => { const f = kit.makeFox({ key, torso: o.torso, outfit: o.outfit, mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: o.look }); const P = f.userData && f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; const H = new THREE.Group(); H.add(f); H.visible = false; par.add(H); return { H, f, P, name: o.name }; };
  const cus = i => cf[i % 6] || (cf[i % 6] = mkP('mtCus' + (i % 6), CUS[i % 6]));
  const bandit = () => banditF || (banditF = mkP('mtBandit', { name: 'A BANDIT', torso: [DARK, '#2a2827', '#1a1918'], outfit: 'vest', look: { fur: '#5a5654', furDark: '#3d3b3a', muzzle: '#cfcac4' } }));
  const standAt = (p, x, z, yaw) => { p.H.visible = true; p.H.position.set(x, 0, z); p.H.rotation.y = yaw; };
  const walkTo = (p, x, z, dur, then) => { p.H.rotation.y = Math.atan2(x - p.H.position.x, z - p.H.position.z); fly(p.H, V(x, p.H.position.y, z), dur, 0, then); };
  const hideC = () => { cf.forEach(p => { if (p) p.H.visible = false; }); if (banditF) banditF.H.visible = false; };
  const cT = { key: 'mtCus', obj: mama, ry: 0, r: 60 }; const sayC = (p, lines, then) => { cT.obj = p.H; sayTo(cT, lines.map(t => lx(p.name, t)), then || null, true); };
  const nextCus = () => { const n = save.stat('mtCusN', 0); save.setStat('mtCusN', n + 1); return cus(n); };
  // ================= state, toast, sound =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.9); tone(2093, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), jingle = () => { for (let i = 0; i < 4; i++) tone(2400 + i * 300, 0.02, 0.12, 'triangle', i * 0.05); },
    knock = () => { for (let i = 0; i < 3; i++) tone(120, 0.14, 0.12, 'square', i * 0.22, 80); }, crack = () => tone(1800, 0.04, 0.08, 'sawtooth', 0, 600), cheer = () => { tone(784, 0.05, 0.3); tone(988, 0.05, 0.3, 'sine', 0.1); tone(1175, 0.05, 0.4, 'sine', 0.2); };
  // ================= prizes + what you wear =================
  const CUR = { outfit: 'vest', torso: [RED, '#b8250f', '#7a1808'], name: 'BELLHOP UNIFORM' };
  const ownU = () => !!save.stat('mtUniform', false), uOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === CUR.name); };
  const putOn = on => { if (on) { if (!uOn()) save.setStat('mtPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(CUR); wear && wear(CUR); } else { const p = save.stat('mtPrevOutfit', null), o = p && p.name !== CUR.name ? p : null; save.setOutfit(o); wear && wear(o); } };
  function hatOn(head, y = 0.36) { const g = new THREE.Group(); g.add(mm(Cy(0.1, 0.1, 0.1, 14), LM(RED), 0, 0.05, 0), mm(Cy(0.102, 0.102, 0.025, 14), LM(BRASS), 0, 0.02, 0), mm(Sp(0.02, 6, 4), LM(BRASS), 0, 0.11, 0)); g.position.set(0.04, y, 0.02); g.rotation.z = -0.18; head.add(g); g.traverse(o => { o.renderOrder = 2; }); return g; }
  function giveGift() { const n = save.stat('mtClears', 0) + 1; save.setStat('mtClears', n);
    if (!ownU()) { save.setStat('mtUniform', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === CUR.name)) save.setStat('tailorOutfits', [...list, CUR]); putOn(true); return { kind: 'uni', label: 'BELLHOP UNIFORM + HAT' }; }
    if (!save.stat('mtMint1', false)) { save.setStat('mtMint1', true); for (let i = 0; i < 3; i++) save.give('pillowMint'); return { kind: 'mint', label: 'PILLOW MINT ×3' }; }
    if (n % 3 === 0) { save.give('pillowMint'); return { kind: 'mint1', label: 'PILLOW MINT' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const on = ownU() && uOn(), key = on ? 1 : 0;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; if (on && U.P.head) worn.parts.push(hatOn(U.P.head)); } }
  // ================= card (Modernist) — LEFT, same spot as the other shops =================
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const night = document.createElement('div'); night.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;display:none'; document.body.appendChild(night);
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head2 = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const bar = (k, c = '#ffd23a', band) => '<div style="height:14px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative">' + (band ? '<div style="position:absolute;top:0;bottom:0;left:' + Math.round(band[0] * 100) + '%;width:' + Math.max(2, Math.round((band[1] - band[0]) * 100)) + '%;background:#bfe6c8"></div>' : '') + '<div style="position:absolute;left:0;top:3px;bottom:3px;width:' + Math.round(clamp(k, 0, 1) * 100) + '%;background:' + c + '"></div>' + (band ? '<div style="position:absolute;top:-2px;bottom:-2px;width:2px;background:#201e1d;left:' + Math.round((band[0] + band[1]) / 2 * 100) + '%"></div>' : '') + '</div>';
  const big = (txt, bg, fg = '#fff') => '<div style="background:' + bg + ';color:' + fg + ';font-weight:900;font-size:17px;padding:7px 10px;margin:2px 0 6px;border:2px solid #201e1d">' + txt + '</div>';
  const small = t => '<div style="font-size:11px;font-weight:900;padding-top:4px">' + t + '</div>';
  const btns = opts => '<div style="display:flex;flex-direction:column;gap:6px;padding-top:4px">' + opts.map((o, i) => '<button data-ans="' + i + '" style="min-height:44px;text-align:left;padding:6px 10px;font:900 16px Archivo,sans-serif;background:#ffffff;color:#201e1d;border:2px solid #201e1d;border-radius:0;cursor:pointer">' + o + '</button>').join('') + '</div>';
  const setCard = (key, html, live = false) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; card.style.pointerEvents = live ? 'auto' : 'none'; if (live) { card.style.top = (innerHeight < 500 ? 70 : 100) + 'px'; card.style.maxHeight = 'none'; } else fitCard(); };
  const hideCard = () => { card.style.display = 'none'; card.style.pointerEvents = 'none'; cardKey = ''; };
  card.addEventListener('pointerdown', e => e.stopPropagation()); card.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ans]'); if (b) answer(+b.getAttribute('data-ans')); });
  // ================= input (only while a game holds the camera; the room service walk leaves the stick + HUD alone) =================
  const ptr = { down: false, x: 0, y: 0, id: null, lx: 0, ly: 0, sx: 0, sy: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label],[data-ans]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.lx = ptr.sx = e.clientX; ptr.y = ptr.ly = ptr.sy = e.clientY; e.stopPropagation(); press(); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); ptr.lx = ptr.x; ptr.ly = ptr.y; }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700), MIN = () => Math.min(innerWidth, innerHeight);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearest = (list, f, lim) => { let b = -1, bd = lim; list.forEach((o, i) => { const p = f(o, i); if (!p) return; const d = dist(scrW(p)); if (d < bd) { bd = d; b = i; } }); return b; };
  const RC = new THREE.Raycaster(), NDC = new THREE.Vector2(), PL0 = new THREE.Plane();
  const setRay = () => { NDC.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); RC.setFromCamera(NDC, camera); };
  const onPlane = (n, p0) => { setRay(); PL0.setFromNormalAndCoplanarPoint(n, p0); const o = V(); return RC.ray.intersectPlane(PL0, o) ? o : null; };
  const camPlane = p0 => { const n = V(); camera.getWorldDirection(n); return onPlane(n.negate(), p0); };
  const FLIES = []; function fly(obj, to, dur, arc, then) { for (let i = FLIES.length - 1; i >= 0; i--) if (FLIES[i].obj === obj) FLIES.splice(i, 1); FLIES.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of FLIES.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { const i = FLIES.indexOf(F); if (i >= 0) FLIES.splice(i, 1); F.then && F.then(); } } }
  const PART = []; for (let i = 0; i < 40; i++) { const m = mm(Sp(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: YEL, transparent: true })); m.visible = false; scene.add(m); PART.push({ m, v: V(), life: 0 }); }
  const burst = (p, n, col, sp = 0.8, upk = 1) => { let k = 0; for (const q of PART) { if (q.life > 0) continue; q.m.visible = true; q.m.material.color.set(col); q.m.position.copy(p); q.v.set(rnd(-1, 1), rnd(0.2, 1.4) * upk, rnd(-1, 1)).multiplyScalar(sp); q.life = rnd(0.5, 0.9); if (++k >= n) break; } };
  const partTick = dt => { for (const q of PART) { if (q.life <= 0) continue; q.life -= dt; q.m.position.addScaledVector(q.v, dt); q.v.y -= dt * 1.4; q.m.material.opacity = clamp(q.life * 1.6, 0, 1); if (q.life <= 0) q.m.visible = false; } };
  const HI = mkRing(0.1, 0.02), HI2 = mkRing(0.16, 0.025);
  const hi = (r, p, face = true) => { r.visible = true; r.position.copy(p); r.scale.setScalar(1 + 0.15 * Math.sin(performance.now() / 120)); if (face) r.lookAt(camera.position); };
  const ARROW = new THREE.Group(); { const a = mm(Co(0.22, 0.5, 4), new THREE.MeshBasicMaterial({ color: YEL, depthTest: false }), 0, 0, 0.1, Math.PI / 2); a.renderOrder = 5; ARROW.add(a); } ARROW.visible = false; G.add(ARROW);
  const BEACON = mm(Cy(0.5, 0.5, 4.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); BEACON.visible = false; G.add(BEACON); const RTGT = mkRing(0.8, 0.06); RTGT.rotation.x = Math.PI / 2;
  // ================= station rings =================
  const SPOT = { checkin: { x: 127.4, z: -182.4, r: 0.9 }, night: { x: 131.4, z: -182.4, r: 0.9 }, service: { x: 124.4, z: -183.1, r: 0.8 }, beds: { x: 117.6, z: -184.4, r: 1.0 }, luggage: { x: 120.2, z: -177.2, r: 0.9 },
    laundry: { x: 140.4, z: -183.1, r: 0.9 }, ice: { x: 141.5, z: -174.5, r: 0.9 }, pool: { x: 109.0, z: -174.5, r: 1.0 }, hook: { x: 123.7, z: -173.6, r: 0.7 } };
  const RS = {}; for (const k in SPOT) { const s = SPOT[k], m = mm(new THREE.TorusGeometry(s.r * 0.75, 0.06, 6, 28), ringM, s.x, 0.1, s.z, Math.PI / 2); m.renderOrder = 3; G.add(m); RS[k] = m; }
  // ================= the walkway + stairs are walkable (town2.js draws them) =================
  const STR = { x0: 110.25, x1: 111.95, zb: -167.55, zt: -171.05, top: 3.52 }, WALK = { x0: 111.9, x1: 146.0, z0: -172.0, z1: -169.8 };
  function groundAt(x, z, y) { if (x > STR.x0 && x < STR.x1 && z < STR.zb && z > STR.zt) return clamp((STR.zb - z) / (STR.zb - STR.zt), 0, 1) * STR.top; if (x > STR.x0 && x < STR.x1 && z <= STR.zt && z > -172.0 && y > 2.2) return STR.top;
    if (x > WALK.x0 && x < WALK.x1 && z > WALK.z0 && z < WALK.z1 && y > 2.2) return STR.top; return null; }
  // the stair's west side + the landing's north edge are solid; the walkway railing only blocks while you are up there
  rect(110.1, 110.3, -172.1, -167.9); rect(110.1, 111.95, -172.15, -171.95); const RAILS = [{ f: [111.9, 146.0, -169.95, -169.7] }, { f: [145.95, 146.15, -172.0, -169.7] }]; let railsOn = false;
  const railTick = P => { const up = (P.y || 0) > 2.2 && P.z > -172.5 && P.z < -169 && P.x > 109 && P.x < 147; if (up === railsOn) return; railsOn = up; if (up) RAILS.forEach(r => cols.push(r)); else RAILS.forEach(r => { const i = cols.indexOf(r); if (i >= 0) cols.splice(i, 1); }); };
  let unstuck = false; const unstick = () => { unstuck = true; for (let i = cols.length - 1; i >= 0; i--) { const f = cols[i] && cols[i].f; if (f && Math.abs(f[0] - 110.25) < 0.2 && Math.abs(f[1] - 111.9) < 0.2 && Math.abs(f[2] + 171.1) < 0.2) cols.splice(i, 1); } };
  // the 16 outside doors (town2.js layout): 101-107 on the ground, 201-209 on the walkway
  const UPX = [114.5, 117.9, 121.3, 124.7, 128.1, 131.5, 134.9, 138.3, 141.7], DNX = [114.5, 117.9, 121.3, 124.7, 134.9, 138.3, 141.7];
  const doorAt = r => r > 200 ? { x: UPX[r - 201], y: STR.top, z: -170.9 } : { x: DNX[r - 101], y: 0, z: -171.0 };
  const OPEN = new THREE.Group(); OPEN.add(mm(new THREE.PlaneGeometry(1.1, 2.2), new THREE.MeshBasicMaterial({ color: '#2a2018' }), 0, 1.1, 0)); { const lf = mm(Bx(1.08, 2.18, 0.05), LM(TEAL), 0.54, 0, 0); const pv = new THREE.Group(); pv.add(lf); pv.position.set(-0.55, 1.1, 0.03); pv.rotation.y = -1.3; OPEN.add(pv); } OPEN.visible = false; G.add(OPEN);
  // ================= SHORT GAMES =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const GN = Object.fromEntries(DOING);
  const PARTS = { checkin: ['GUEST 1', 'GUEST 2', 'GUEST 3'], beds: ['BED 1', 'BED 2'], service: ['ORDER 1', 'ORDER 2', 'ORDER 3'], ice: ['SCREWS', 'ICE JAM', 'WIRES', 'RESET', 'BUCKET'], pool: ['LEAVES', 'THE DUCK'], luggage: ['GUEST 1', 'GUEST 2', 'GUEST 3'], night: ['1', '2', '3', '4'], laundry: ['DRYER', '1', '2', '3', '4'] };
  const INTRO = {   // s73: one box each (≤ 20 words)
    checkin: n => [lm(n ? 'Guests at the desk, sweet pea! Name in the book, key off the board.' : 'Guests at the desk! Find their name in the bookings, then tap their room key.')],
    beds: n => [lm(n ? 'Room 101 again. Those beds will not make themselves. I asked.' : 'Room 101! Drag the sheet up the dots, tuck four corners, pillows up, mint on top.')],
    service: n => [lm(n ? 'Room service! Ticket on the card, tray by the hatch.' : 'Room service! Tap the ticket\u2019s plates onto the tray, then carry it. Walk, don\u2019t run!')],
    ice: n => [lm(n ? 'The ice machine is sulking again. You know the drill.' : 'The ice machine jammed! Screws out, chip the ice, plug the wires, RESET on green.')],
    pool: n => [lm(n ? 'Leaves in the pool again. Net\u2019s by the ladder.' : 'Leaves in the pool! Net four at a time, then tap the green bin. Find the duck too.')],
    luggage: n => [lm(n ? 'More lost bags! Listen to what they say.' : 'Lost and found! Tap the bag that matches the colour, the kind and the tag.')],
    night: n => [lm(n ? 'Night shift. Knock knock, sweet pea.' : 'Night desk. Check each shadow against the guest book. Match? Let them in. If not, keep it locked!')],
    laundry: n => [lm(n ? 'Laundry! Dryer\u2019s done. Fold, fold, cart.' : 'Laundry! Empty the dryer, drag ring to ring to fold twice, then tap the right cart.')] };
  const inStation = P => P.x > 104.5 && P.x < 148 && P.z > -190 && P.z < -150 && (P.y || 0) < 6;
  function startGame(g) { if (busy || J) return false; const vk = 'mtN_' + g, n = save.stat(vk, 0); save.setStat(vk, n + 1); save.setStat('mtVisits', save.stat('mtVisits', 0) + 1);
    J = { g, step: 0, sub: 'intro', gold: 0, pause: 0, t: 0, clean: 0, miss: 0, held: null, n }; busy = 'job'; placeK(g); hideC(); pop(); sayTo(mT, INTRO[g](n), null, true); NEXT('intro', BEGIN[g], n ? 1.4 : 2.2); return true; }
  // ---- CHECK-IN: guest says a name → find it in the bookings → tap that key ----
  const EXTRA = ['MRS. ALDER', 'CAPTAIN TOR', 'OLD WREN', 'BRAM', 'MISS JUNE'];
  function beginCheckin() { const g3 = [nextCus(), nextCus(), nextCus()], rooms = shuffle(ROOMS).slice(0, 4); J.guests = g3; J.book = [...g3.map((p, i) => ({ name: p.name, room: rooms[i] })), { name: pick(EXTRA), room: rooms[3] }]; J.bookShow = shuffle(J.book); J.gi = 0; J.done = []; ciNext(); }
  function ciNext() { J.step = J.gi + 1; J.wrong = 0; const p = J.guests[J.gi]; J.p = p; standAt(p, 129, -173.8, Math.PI); J.sub = 'arrive';
    walkTo(p, 128.6, -179.7, 1.8, () => { if (!J || J.g !== 'checkin') return; p.H.rotation.y = Math.PI; J.sub = 'key'; sayC(p, [pick(['Hi! ' + cap(p.name) + '. I have a booking.', 'Evening! Booking for ' + cap(p.name) + ', please.', cap(p.name) + ' here. Is my room ready?'])]); toast('FIND ' + p.name + ' · TAP THEIR KEY', 2.4); }); }
  const cap = s => s.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  function ciPress() { if (J.sub !== 'key') return; const i = nearest(KEYS, k => (k.out ? null : k.g.position), RAD() * 1.5); if (i < 0) { toast('TAP A KEY ON THE BOARD', 1); return; } const K = KEYS[i], want = J.book[J.gi].room;
    if (K.r !== want) { nope(); J.miss++; J.wrong++; sayTo(mT, [lm('That\u2019s ' + K.r + ', sweet pea. Look in the book: ' + cap(J.p.name) + ' is in ' + want + '.')], null, true); return; }
    jingle(); addGold(J.wrong ? 3 : 6); if (!J.wrong) J.clean++; K.out = true; J.sub = 'given'; J.done.push(J.p.name);
    fly(K.g, V(128.6, 1.1, -180.9), 0.7, 0.3, () => { fly(K.g, V(128.6, 1.0, -180.1), 0.35, 0.05, () => { K.g.visible = false; }); });
    NEXT('given', () => { sayC(J.p, [pick(['Lovely, thank you!', 'Room ' + want + '! My lucky number.', 'Perfect. Is there a pool? There is a pool!'])]); const p = J.p; walkTo(p, 123.6, -177.5, 1.6, () => { p.H.visible = false; });
      J.gi++; if (J.gi < 3) NEXT('next', ciNext, 1.4); else NEXT('end', () => finishGame([lm('Three guests, three keys! The board looks very happy.')]), 1.6); }, 1.3); }
  // ---- MAKE THE BEDS: sheet along the dots · 4 corners · 2 pillows · the mint ----
  function beginBeds() { resetBeds(); J.bi = 0; bedNext(); }
  function bedNext() { J.step = J.bi + 1; const B = BEDS[J.bi]; J.B = B; J.sub = 'sheet'; J.path = { pts: [0, 1, 2, 3].map(i => V(B.x, BTOP + 0.06, FOOTZ - 0.1 - i * 0.6)), i: 0 }; J.tuck = [false, false, false, false]; J.pil = 0; toast('BED ' + J.step + ' · DRAG THE SHEET UP THE DOTS', 2.2); }
  function setSheet(B, k) { B.sheet.visible = k > 0.02; B.sheet.scale.z = Math.max(0.05, k); B.sheet.position.z = FOOTZ - 0.02 - 1.0 * Math.max(0.05, k); B.lump.scale.set(1 - k * 0.9, 0.55 * (1 - k * 0.9), 1 - k * 0.9); B.lump.visible = k < 0.95; }
  function bedsPress() { const B = J.B, s = J.sub;
    if (s === 'sheet') bedsDrag();
    else if (s === 'tuck') { const i = nearest(B.flaps, (f, k) => (J.tuck[k] ? null : V(B.x + (k % 2 ? 0.76 : -0.76), BTOP, k < 2 ? HEADZ + 0.08 : FOOTZ - 0.08)), RAD() * 1.6); if (i < 0) { toast('TAP A YELLOW CORNER', 1); return; } J.tuck[i] = true; B.flaps[i].visible = true; pop(); addGold(1); if (J.tuck.every(Boolean)) { ding(); addGold(2); NEXT('tucked', () => { J.sub = 'pillow'; toast('PILLOWS OFF THE FLOOR · TAP THEM', 1.8); }, 0.6); } }
    else if (s === 'pillow') { const i = nearest(B.pillows, p => (p.up ? null : p.m.position), RAD() * 2.0); if (i < 0) { toast('TAP A PILLOW', 1); return; } const p = B.pillows[i]; p.up = true; pop(); p.m.rotation.set(0, 0, 0); fly(p.m, p.to, 0.6, 0.5, () => { burst(p.to.clone().add(V(0, 0.1, 0)), 5, '#ffffff', 0.4); }); J.pil++; addGold(2); if (J.pil >= 2) NEXT('pillowed', () => { J.sub = 'mint'; toast('A MINT ON THE PILLOW', 1.6); }, 0.8); }
    else if (s === 'mint') { if (dist(scrW(B.mint.position)) > RAD() * 2.2) { toast('TAP THE MINT ON THE NIGHTSTAND', 1.2); return; } J.sub = 'minted'; fly(B.mint, B.pillows[0].to.clone().add(V(0.12, 0.09, 0.02)), 0.6, 0.4, () => { ding(); burst(B.mint.position.clone(), 8, YEL, 0.5); }); addGold(3); J.clean++;
      J.bi++; if (J.bi < 2) NEXT('bedDone', bedNext, 1.4); else NEXT('end', () => finishGame([lm('Both beds! Tight corners and a mint each. Hotel quality, sweet pea.')]), 1.6); } }
  function bedsDrag() { if (J.sub !== 'sheet') return; const P2 = J.path; if (P2.i < P2.pts.length && dist(scrW(P2.pts[P2.i])) < RAD() * 1.4) { P2.i++; tone(400 + P2.i * 90, 0.03, 0.1, 'triangle'); setSheet(J.B, P2.i / P2.pts.length);
      if (P2.i >= P2.pts.length) { addGold(3); J.clean++; NEXT('sheeted', () => { J.sub = 'tuck'; toast('TAP THE 4 CORNERS TO TUCK', 1.8); }, 0.5); } } }
  // ---- ROOM SERVICE: tap the plates onto the tray → carry it (you walk) → the door → back to the hatch ----
  function beginService() { const ups = shuffle(ROOMS.filter(r => r > 200)), dns = shuffle(ROOMS.filter(r => r < 200)); J.orders = shuffle([ups[0], ups[1], dns[0]]).map(r => ({ room: r, items: shuffle([0, 1, 2, 3, 4, 5]).slice(0, Math.random() < 0.5 ? 2 : 3) })); J.oi = 0; J.onTray = []; svNext(); }
  function svNext() { busy = 'job'; J.step = J.oi + 1; J.sub = 'items'; J.got = []; J.onTray.forEach(o => G.remove(o)); J.onTray = []; TRAY.position.copy(TRAYH); TRAY.rotation.set(0, 0, 0); G.attach(TRAY); placeK('service'); const O = J.orders[J.oi]; J.O = O;
    tone(988, 0.05, 0.2); tone(784, 0.05, 0.2, 'sine', 0.2); toast('ROOM ' + O.room + ' · TAP THE PLATES', 2); }
  function svPress() { const O = J.O; if (J.sub === 'items') { const k = nearest(FOOD, (_, i) => FOODP(i).add(V(0, 0.06, 0)), RAD() * 1.3); if (k < 0) { toast('TAP A PLATE ON THE COUNTER', 1); return; }
      if (!O.items.includes(k) || J.got.includes(k)) { nope(); J.miss++; toast(J.got.includes(k) ? 'ALREADY ON THE TRAY' : FOOD[k].n + ' IS NOT ON THE TICKET', 1.4); return; }
      J.got.push(k); pop(); const g = food3D(k); g.position.copy(FOODP(k)); const to = TRAY.position.clone().add(TSLOT[J.onTray.length]); J.onTray.push(g); fly(g, to, 0.45, 0.2, () => { TRAY.attach(g); });
      if (J.got.length >= O.items.length) NEXT('loaded', () => { J.sub = 'lift'; toast('TAP THE TRAY TO PICK IT UP', 1.6); }, 0.6); }
    else if (J.sub === 'lift') { if (dist(scrW(TRAY.position)) > RAD() * 2.2) { toast('TAP THE TRAY', 1); return; } pop(); const D = doorAt(O.room); J.sub = 'walk'; busy = 'walk'; J.steady = 1; J.wt = 0; J.lp = null; J.par = 10 + Math.hypot(D.x - SPOT.service.x, D.z - SPOT.service.z) / 3;
      toast('FOLLOW THE ARROW · ROOM ' + O.room + (O.room > 200 ? ' · UP THE STAIRS' : ''), 2.6); placeK('idle'); } }
  function svWalk(dt, P, fox) { const yaw = fox ? fox.rotation.y : 0, fx = Math.sin(yaw), fz = Math.cos(yaw), py = P.y || 0;
    if (J.sub === 'walk') { TRAY.position.set(P.x + fx * 0.45, py + 1.05, P.z + fz * 0.45); TRAY.rotation.set(0, yaw, 0); J.wt += dt;
      if (J.lp) { const sp = Math.hypot(P.x - J.lp[0], P.z - J.lp[1]) / Math.max(dt, 1e-3); if (sp > 11) { J.steady = Math.max(0, J.steady - dt * 0.18); TRAY.rotation.z = Math.sin(J.t * 18) * 0.08; } } J.lp = [P.x, P.z];
      const D = doorAt(J.O.room); aim(P, D); if (Math.hypot(P.x - D.x, P.z - D.z) < 1.1 && Math.abs(py - D.y) < 1.2) svDoor(D); }
    else if (J.sub === 'back') { aim(P, { x: SPOT.service.x, y: 0, z: SPOT.service.z }); if (Math.hypot(P.x - SPOT.service.x, P.z - SPOT.service.z) < SPOT.service.r && py < 1) svNext(); } }
  function aim(P, D) { ARROW.visible = true; ARROW.position.set(P.x, (P.y || 0) + 2.7, P.z); ARROW.rotation.y = Math.atan2(D.x - P.x, D.z - P.z); BEACON.visible = RTGT.visible = true; BEACON.position.set(D.x, D.y + 2.1, D.z); RTGT.position.set(D.x, D.y + 0.12, D.z); }
  function svDoor(D) { J.sub = 'door'; ARROW.visible = BEACON.visible = RTGT.visible = false; OPEN.visible = true; OPEN.position.set(D.x, D.y, -171.86); tone(330, 0.05, 0.15, 'square'); const p = nextCus(); J.p = p; standAt(p, D.x, -171.55, 0); p.H.position.y = D.y;
    const ontime = J.wt <= J.par, tip = 6 + Math.round(J.steady * 6) + (ontime ? 4 : 0); if (ontime && J.steady > 0.8) J.clean++;
    fly(TRAY, V(D.x, D.y + 1.0, -171.25), 0.5, 0.1, null); addGold(tip); ding();
    sayC(p, [pick(['Breakfast! You are a hero.', 'It\u2019s still warm! Here, a tip.', 'Room service in Meru! Fancy.', 'Is that cake? It is cake.']) + ' +' + tip + ' gold.']);
    NEXT('door', () => { OPEN.visible = false; p.H.visible = false; p.H.position.y = 0; J.onTray.forEach(o => { if (o.parent) o.parent.remove(o); }); J.onTray = []; TRAY.position.copy(TRAYH); TRAY.rotation.set(0, 0, 0);
      J.oi++; if (J.oi < 3) { J.sub = 'back'; toast('BACK TO THE KITCHEN HATCH', 2); } else { J.sub = 'last'; busy = 'walk'; finishGame([lm('Three trays, three happy rooms! The stairs are good for you, sweet pea.')]); } }, 2.4); }
  // ---- ICE MACHINE: 4 screws · chip the jam · 3 wires · reset on green · fill the bucket ----
  const SOCKX = [IX - 0.25, IX, IX + 0.25];
  function beginIce() { J.step = 1; J.sub = 'screws'; J.p = nextCus(); standAt(J.p, 139.6, -173.6, 1.6); J.p.f.rotation.y = 0; SCREW.forEach(s => { s.out = false; s.m.position.copy(s.home); s.m.visible = true; }); PANEL.position.copy(PANELH); PANEL.rotation.set(0, 0, 0); PANEL.visible = true; CHUNK.visible = true; CHUNK.scale.set(1, 1, 1); J.hits = 0;
    const ord = shuffle([0, 1, 2]); SOCK.forEach((s, i) => { s.m.position.x = SOCKX[ord[i]]; }); WIRE.forEach(w => { w.on = false; w.end.position.copy(w.loose); }); ICEP.visible = false; BUCKET.visible = false; setFill(0); J.fill = 0;
    sayC(J.p, ['The ice machine ate my coins and gave me nothing. Rude.']); toast('TAP THE 4 SCREWS', 1.8); }
  function icePress() { const s = J.sub;
    if (s === 'screws') { const i = nearest(SCREW, o => (o.out ? null : o.m.position), RAD() * 1.4); if (i < 0) { toast('TAP A SCREW', 0.8); return; } const S = SCREW[i]; S.out = true; tone(900, 0.03, 0.15, 'sawtooth', 0, 1400); fly(S.m, S.m.position.clone().add(V(rnd(-0.2, 0.2), -S.m.position.y + 0.08, -0.4)), 0.5, 0.15, null); addGold(1);
      if (SCREW.every(o => o.out)) { addGold(2); fly(PANEL, V(IX - 0.75, 0.42, IZF - 0.35), 0.6, 0.1, null); PANEL.rotation.set(-0.2, 0.4, 1.2); NEXT('panel', () => { J.step = 2; J.sub = 'chip'; toast('TAP THE ICE JAM TO CHIP IT', 1.6); }, 0.8); } }
    else if (s === 'chip') { if (dist(scrW(CHUNK.position)) > RAD() * 2) { toast('TAP THE ICE', 0.8); return; } J.hits++; crack(); burst(CHUNK.position.clone().add(V(0, 0, -0.08)), 5, '#e8f8ff', 0.6); const k = 1 - J.hits / 6; CHUNK.scale.set(0.4 + k * 0.6, 0.4 + k * 0.6, 1);
      if (J.hits >= 6) { CHUNK.visible = false; addGold(4); J.clean++; NEXT('chipped', () => { J.step = 3; J.sub = 'wires'; toast('DRAG EACH WIRE TO ITS COLOUR', 1.8); }, 0.6); } }
    else if (s === 'wires') { const i = nearest(WIRE, w => (w.on ? null : w.end.position), RAD() * 1.6); if (i >= 0) { J.held = i; pop(); } }
    else if (s === 'reset') { if (dist(scrW(RESET.position)) > RAD() * 2.2) { toast('TAP THE RESET BUTTON', 1); return; } if (lightGreen()) { ding(); addGold(J.lateTap ? 3 : 6); if (!J.lateTap) J.clean++; J.sub = 'iceOut'; iceRattle(); } else { nope(); J.lateTap = true; J.miss++; toast('WAIT FOR GREEN', 0.9); } } }
  const lightGreen = () => (J.t % 1.5) < 0.6;
  function iceDrag() { if (J.sub !== 'wires' || J.held == null) return; const w = WIRE[J.held], p = camPlane(V(IX, 1.3, IZF - 0.06)); if (!p) return; p.x = clamp(p.x, IX - 0.42, IX + 0.42); p.y = clamp(p.y, 0.98, 1.72); p.z = IZF - 0.06; w.end.position.copy(p); }
  function iceRelease() { if (J.sub !== 'wires' || J.held == null) return; const w = WIRE[J.held]; J.held = null; const si = nearest(SOCK, o => o.m.position, RAD() * 1.6);
    if (si >= 0 && SOCK[si].c === w.c) { w.on = true; w.end.position.copy(SOCK[si].m.position).add(V(0, 0, -0.03)); ding(); addGold(2); burst(w.end.position.clone(), 5, '#fff6c8', 0.4);
      if (WIRE.every(o => o.on)) { J.clean++; NEXT('wired', () => { J.step = 4; J.sub = 'reset'; J.lateTap = false; toast('TAP RESET WHEN THE LIGHT IS GREEN', 2); }, 0.6); } }
    else { if (si >= 0) { nope(); J.miss++; toast('THAT SOCKET IS ' + ['RED', 'BLUE', 'YELLOW'][WCOL.indexOf(SOCK[si].c)] + ' · MATCH THE COLOURS', 1.4); } w.end.position.copy(w.loose); } }
  function iceRattle() { for (let i = 0; i < 6; i++) tone(2600 + rnd(-400, 400), 0.02, 0.06, 'triangle', i * 0.08); ICEP.visible = true; burst(V(IX, 0.7, IZF - 0.1), 10, '#e8f8ff', 0.5);
    SCREW.forEach(o => { o.m.position.copy(o.home); }); NEXT('iceOut', () => { PANEL.position.copy(PANELH); PANEL.rotation.set(0, 0, 0); J.step = 5; J.sub = 'bucket'; BUCKET.visible = true; setFill(0); J.fill = 0; toast('HOLD TO FILL THE BUCKET · LET GO ON THE LINE', 2); }, 1.0); }
  function iceTick(dt) { WIRE.forEach(w => w.h.set(w.a, w.end.position, w.on ? 0.08 : 0.12)); LIGHT.material.color.set(J.sub === 'reset' ? (lightGreen() ? '#3fff6a' : '#ff2a2a') : J.sub === 'bucket' || J.sub === 'iceOut' ? '#3fff6a' : '#7a1808');
    if (J.sub === 'bucket' && ptr.down) { J.pouring = true; J.fill = Math.min(1.15, J.fill + dt * 0.32); setFill(J.fill); if (Math.random() < dt * 10) tone(2800 + rnd(-300, 300), 0.015, 0.05, 'triangle'); if (J.fill >= 1.15) iceDone(false); } }
  function iceReleaseB() { if (J.sub !== 'bucket' || !J.pouring) return; J.pouring = false; if (J.fill >= 0.76 && J.fill <= 0.95) iceDone(true); else if (J.fill > 0.95) iceDone(false); else toast('A LITTLE MORE', 0.8); }
  function iceDone(ok) { J.sub = 'filled'; if (ok) { ding(); addGold(5); J.clean++; } else { burst(BUCKET.position.clone().add(V(0, 0.3, 0)), 8, '#e8f8ff', 0.6); toast('OOPS · A FEW ON THE FLOOR', 1.2); addGold(2); } setFill(Math.min(1, J.fill));
    fly(BUCKET, V(139.9, 0.9, -173.75), 0.6, 0.2, null); sayC(J.p, [ok ? 'Ice! Glorious ice! Thank you!' : 'Ice! Some of it on my feet, but ice!']); NEXT('end', () => finishGame([lm('Fixed! It\u2019s humming again. I love that hum.')]), 1.8); }
  // ---- CLEAN THE POOL: 12 leaves with the net (holds 4, tap the bin when full) · scoop the duck ----
  const inWater = (x, z) => x > POOL.x0 && x < POOL.x1 && z > POOL.z0 && z < POOL.z1;
  function beginPool() { J.step = 1; J.sub = 'skim'; J.load = 0; J.got = 0; LEAVES.forEach(L => { L.x = rnd(POOL.x0 + 0.15, POOL.x1 - 0.15); L.z = rnd(POOL.z0 + 0.3, POOL.z1 - 0.3); L.caught = false; L.done = false; L.m.visible = true; L.m.rotation.y = rnd(0, 6); });
    NET.visible = true; NET.position.set(109, POOL.y + 0.01, -176.6); J.p = nextCus(); standAt(J.p, 109.4, -187.3, Math.PI); toast('DRAG THE NET OVER THE LEAVES', 2); }
  function poolPress() { if (J.sub === 'empty') { if (dist(scrW(BIN.position.clone().add(V(0, 0.4, 0)))) > RAD() * 2.4) { toast('NET FULL · TAP THE GREEN BIN', 1.2); return; } pop();
      LEAVES.forEach(L => { if (L.caught && !L.done) { L.done = true; L.caught = false; const m = L.m; fly(m, BIN.position.clone().add(V(0, 0.65, 0)), 0.5, 0.4, () => { m.visible = false; }); } }); J.load = 0; addGold(2);
      if (J.got >= 12) NEXT('skimmed', poolDuck, 0.8); else J.sub = 'skim'; return; } poolDrag(); }
  function poolDrag() { if (J.sub !== 'skim' && J.sub !== 'duck') return; const p = onPlane(V(0, 1, 0), V(0, POOL.y, 0)); if (!p) return; NET.position.set(clamp(p.x, POOL.x0, POOL.x1), POOL.y + 0.01, clamp(p.z, POOL.z0, POOL.z1));
    if (J.sub === 'skim') { for (const L of LEAVES) { if (L.caught || L.done || J.load >= 4) continue; if (Math.hypot(L.x - NET.position.x, L.z - NET.position.z) < 0.3) { L.caught = true; L.off.set(rnd(-0.1, 0.1), 0.02, rnd(-0.1, 0.1)); J.load++; J.got++; addGold(1); tone(500 + J.load * 120, 0.03, 0.1, 'triangle'); burst(L.m.position.clone(), 3, '#bfe8ff', 0.3); } }
      if (J.load >= 4 || (J.got >= 12 && J.load > 0)) { J.sub = 'empty'; toast('NET FULL · TAP THE GREEN BIN', 1.6); } }
    else if (Math.hypot(FLOATY.position.x - NET.position.x, FLOATY.position.z - NET.position.z) < 0.32) { J.sub = 'duckGot'; ding(); addGold(5); J.clean++; fly(FLOATY, V(109.2, 1.0, -186.8), 0.8, 0.8, null); sayC(J.p, ['My duck! Sir Quacks! I thought he swam away for ever.']); NEXT('end', () => finishGame([lm('Clean as a whistle! And Sir Quacks is safe.')]), 2.0); } }
  function poolDuck() { J.step = 2; J.sub = 'duck'; FLOATY.visible = true; FLOATY.position.set(rnd(POOL.x0 + 0.3, POOL.x1 - 0.3), POOL.y, rnd(POOL.z0 + 1, POOL.z1 - 2)); sayC(J.p, ['Oh no, my rubber duck fell in!']); toast('SCOOP THE DUCK WITH THE NET', 1.8); }
  function poolTick(dt) { const t = J.t; for (const L of LEAVES) { if (!L.m.visible) continue; if (L.caught) { L.m.position.copy(NET.position).add(L.off); continue; } if (L.done) continue; L.x = clamp(L.x + Math.sin(t * 0.5 + L.ph) * dt * 0.06, POOL.x0 + 0.05, POOL.x1 - 0.05); L.z = clamp(L.z + Math.cos(t * 0.4 + L.ph) * dt * 0.08, POOL.z0 + 0.05, POOL.z1 - 0.05); L.m.position.set(L.x, POOL.y, L.z); L.m.rotation.y += dt * 0.2; }
    if (FLOATY.visible && J.sub === 'duck') { FLOATY.position.x = clamp(FLOATY.position.x + Math.sin(t * 0.7) * dt * 0.1, POOL.x0 + 0.1, POOL.x1 - 0.1); FLOATY.rotation.y += dt * 0.4; } }
  // ---- LOST LUGGAGE: the guest says colour + kind + tag → tap the bag ----
  const GLINE = d => pick(['I lost my bag! It\u2019s a ', 'Have you seen my bag? A ', 'Mine\u2019s the ']) + d.toLowerCase().replace(' · ', ' with a ') + '.';
  function beginLuggage() { J.targets = dealBags(); J.gi = 0; lgNext(); }
  function lgNext() { J.step = J.gi + 1; J.wrong = 0; const p = nextCus(); J.p = p; standAt(p, 124.2, -177.5, -Math.PI / 2); J.sub = 'arrive'; J.ti = J.targets[J.gi];
    walkTo(p, 122.25, -177.2, 1.2, () => { if (!J || J.g !== 'luggage') return; p.H.rotation.y = -Math.PI / 2; J.sub = 'pick'; sayC(p, [GLINE(bagDesc(BAGS[J.ti]))]); toast('TAP THE BAG THAT MATCHES ALL THREE', 2); }); }
  const bagC = B => B.g.position.clone().add(V(0.05, 0.22, 0));
  function lgPress() { if (J.sub !== 'pick') return; const i = nearest(BAGS, B => (B.out ? null : bagC(B)), RAD() * 2.2); if (i < 0) { toast('TAP A BAG ON THE RACK', 1); return; } const B = BAGS[i], T = BAGS[J.ti];
    if (i !== J.ti) { nope(); J.miss++; J.wrong++; const hint = B.c !== T.c ? 'colour' : B.t !== T.t ? 'kind of bag' : 'tag'; B.g.rotation.y = 0.25; setTimeout(() => { B.g.rotation.y = 0; }, 300);
      sayC(J.p, ['Not mine! Wrong ' + hint + '. Mine is the ' + bagDesc(T).toLowerCase().replace(' · ', ' with the ') + '.']); return; }
    B.out = true; ding(); addGold(J.wrong ? 3 : 7); if (!J.wrong) J.clean++; J.sub = 'found'; fly(B.g, V(121.3, 1.04, -177.2), 0.8, 0.6, () => { fly(B.g, V(122.1, 0.9, -177.2), 0.4, 0.05, () => { B.g.visible = false; }); });
    NEXT('found', () => { sayC(J.p, [pick(['That\u2019s the one! Thank you!', 'My bag! My socks are in there!', 'Found it! You have eagle eyes.'])]); const p = J.p; walkTo(p, 124.5, -177.5, 1.2, () => { p.H.visible = false; });
      J.gi++; if (J.gi < 3) NEXT('next', lgNext, 1.4); else NEXT('end', () => finishGame([lm('Three bags home! The rack thanks you. So does the goat, probably.')]), 1.6); }, 1.3); }
  // ---- NIGHT DESK: the guest book (height + hat) vs the shadow on the frosted glass ----
  const HATS = ['TOP HAT', 'CAP', 'BOW', 'NO HAT'];
  const SIL = new THREE.Group(); SIL.visible = false; G.add(SIL); const silM = new THREE.MeshBasicMaterial({ color: '#15151c' });
  function buildSil(tall, hat) { while (SIL.children.length) SIL.remove(SIL.children[0]); const g = new THREE.Group(); g.add(mm(Cy(0.2, 0.27, 0.95, 10), silM, 0, 0.62, 0), mm(Sp(0.19, 10, 8), silM, 0, 1.3, 0)); for (const s of [-1, 1]) g.add(mm(Co(0.07, 0.2, 6), silM, s * 0.11, 1.52, 0, 0, 0, -s * 0.25));
    g.add(mm(Cy(0.06, 0.07, 0.15, 6), silM, 0.17, 0.95, 0, 0, 0, 0.8)); if (hat === 0) g.add(mm(Cy(0.13, 0.13, 0.32, 10), silM, 0, 1.62, 0), mm(Cy(0.24, 0.24, 0.03, 12), silM, 0, 1.46, 0)); if (hat === 1) g.add(mm(new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), silM, 0, 1.4, 0), mm(Bx(0.32, 0.03, 0.16), silM, 0.22, 1.42, 0));
    if (hat === 2) for (const s of [-1, 1]) g.add(mm(Co(0.07, 0.14, 4), silM, 0.13 + s * 0.08, 1.43, 0, 0, 0, s * Math.PI / 2)); g.scale.setScalar(tall ? 1.18 : 0.8); SIL.add(g); }
  function beginNight() { const names = shuffle(CUS.map(c => c.name)).slice(0, 5), rooms = shuffle(ROOMS).slice(0, 5); J.book = names.map((n, i) => ({ name: n, room: rooms[i], tall: Math.random() < 0.5, hat: Math.floor(Math.random() * 4) }));
    const fakes = shuffle([true, false, false, Math.random() < 0.4]); J.knocks = shuffle(J.book).slice(0, 4).map((b, i) => { const real = !fakes[i]; let tall = b.tall, hat = b.hat; if (!real) { if (Math.random() < 0.6) hat = (hat + 1 + Math.floor(Math.random() * 3)) % 4; else tall = !tall; } return { b, real, tall, hat }; });
    J.ki = 0; leafK = 0; night.style.display = 'block'; J.dark = 0; knNext(); }
  function knNext() { J.step = J.ki + 1; J.sub = 'wait'; SIL.visible = false; NEXT('wait', () => { const K = J.knocks[J.ki]; J.K = K; buildSil(K.tall, K.hat); SIL.visible = true; SIL.position.set(130.6, 0, -173.6); fly(SIL, V(129, 0, -173.6), 0.7, 0, null); knock(); J.sub = 'knock';
      NEXT('knock', () => { sayTo({ key: 'mtSil', obj: SIL, ry: 0, r: 60 }, [lx('KNOCK KNOCK', pick(['It\u2019s ', 'Hello? It\u2019s me, ', 'Open up, it\u2019s ']) + cap(K.b.name) + ' from ' + K.b.room + '! ' + pick(['I forgot my key.', 'I went for a walk.', 'The vending machine ate my key.']))], null, true); J.sub = 'decide'; }, 1.0); }, 1.2); }
  function nightAnswer(i) { if (J.sub !== 'decide') return; const K = J.K, letIn = i === 0, ok = letIn === K.real; J.sub = 'decided';
    if (ok) { ding(); addGold(6); J.clean++; } else { nope(); J.miss++; addGold(1); }
    const bk = K.b, look = (bk.tall ? 'tall' : 'short') + (bk.hat === 3 ? ' with no hat' : ' with a ' + HATS[bk.hat].toLowerCase());
    if (K.real) { leafK = 1; SIL.visible = false; const ci = CUS.findIndex(c => c.name === bk.name), p = cus(ci); standAt(p, 129, -173.6, Math.PI); walkTo(p, 129, -178.6, 1.4, () => { walkTo(p, 135.5, -177.5, 1.6, () => { p.H.visible = false; }); leafK = 0; });
      sayTo(endM, [lm(ok ? 'Right! ' + cap(bk.name) + ' is ' + look + '. Welcome back, dear.' : 'Oh, that WAS ' + cap(bk.name) + '! The book says ' + look + '. I\u2019ll let them in.')], null, true); }
    else if (letIn) { leafK = 1; SIL.visible = false; const p = bandit(); standAt(p, 129, -173.6, Math.PI); walkTo(p, 129, -177.0, 0.9, () => { walkTo(p, 129, -171.0, 0.9, () => { p.H.visible = false; leafK = 0; }); });
      sayTo(endM, [lm('That\u2019s no ' + cap(bk.name) + '! The book says ' + look + '. Shoo! Back to the Outlets!')], null, true); }
    else { fly(SIL, V(131.4, 0, -173.4), 0.6, 0, () => { SIL.visible = false; }); sayTo(endM, [lm('Good eyes! ' + cap(bk.name) + ' is ' + look + '. That was a bandit from the Outlets.')], null, true); }
    J.ki++; if (J.ki < 4) NEXT('after', knNext, 2.6); else NEXT('end', () => { night.style.display = 'none'; finishGame([lm('Four knocks and a safe motel. You can do my night shift any time. Please do my night shift.')]); }, 2.8); }
  // ---- LAUNDRY FOLD: empty the dryer · each piece: fold across · fold up · tap its cart ----
  function beginLaundry() { J.step = 1; J.sub = 'dryer'; J.items = shuffle([0, 1, 2, 3]); J.li = 0; DRYD.rotation.y = 0; BASKET.forEach(b => G.remove(b)); BASKET.length = 0; CL.visible = false; toast('TAP THE DRYER DOOR', 1.6); }
  function lgLay() { J.step = J.li + 2; const o = CLOTH[J.items[J.li]]; J.o = o; J.cw = o.w; J.cd = o.d; J.ct = 0.02; CL.position.set(140.4, 0.905, -185.0); CL.visible = true; clSet(o, J.cw, J.cd, J.ct); CL.scale.set(0.2, 1, 0.2); J.lay = 0; const b = BASKET.pop(); if (b) G.remove(b); J.sub = 'lay'; J.fold = 0; pop(); }
  const foldPts = () => { const c = CL.position, y = c.y + J.ct + 0.02; return J.fold === 0 ? [V(c.x + J.cw / 2 - 0.04, y, c.z), V(c.x - J.cw / 2 + 0.04, y, c.z)] : [V(c.x, y, c.z + J.cd / 2 - 0.04), V(c.x, y, c.z - J.cd / 2 + 0.04)]; };
  function foldShow(k) { const w = J.cw, d = J.cd, t = J.ct; clPiv.visible = true;
    if (J.fold === 0) { clBase.scale.set(w / 2, t, d); clBase.position.set(-w / 4, t / 2, 0); clPiv.position.set(0, t, 0); clPiv.rotation.set(0, 0, k * Math.PI); clFlap.scale.set(w / 2, t, d); clFlap.position.set(w / 4, t / 2, 0); }
    else { clBase.scale.set(w, t, d / 2); clBase.position.set(0, t / 2, -d / 4); clPiv.position.set(0, t, 0); clPiv.rotation.set(-k * Math.PI, 0, 0); clFlap.scale.set(w, t, d / 2); clFlap.position.set(0, t / 2, d / 4); } }
  function lfPress() { const s = J.sub;
    if (s === 'dryer') { if (dist(scrW(V(141.4, 0.5, -186.75))) > RAD() * 3) { toast('TAP THE DRYER DOOR', 1); return; } pop(); DRYD.rotation.y = -1.6; for (let i = 0; i < 4; i++) { const o = CLOTH[J.items[i]], m = mm(Sp(0.14, 8, 6), LM(o.c), 141.4, 0.5, -186.6); m.scale.set(1.2, 0.7, 1); G.add(m); BASKET.push(m); fly(m, V(142.4 + rnd(-0.12, 0.12), 0.36 + i * 0.05, -184.0 + rnd(-0.08, 0.08)), 0.6 + i * 0.1, 0.4, null); } addGold(2); NEXT('dried', lgLay, 1.0); }
    else if (s === 'fold') { const [a] = foldPts(); if (dist(scrW(a)) < RAD() * 1.8) { J.held = 'fold'; J.fk = 0; } else toast('START ON THE YELLOW RING', 1); }
    else if (s === 'sort') { const i = nearest(CARTS, o => V(144.95, 0.75, o.z), RAD() * 2.4); if (i < 0) { toast('TAP A CART', 1); return; } if (i !== J.o.cart) { nope(); J.miss++; J.wrongC = true; sayTo(mT, [lm('That\u2019s the ' + CARTS[i].n.toLowerCase() + ' cart, sweet pea. A ' + J.o.n.toLowerCase() + ' goes with the ' + CARTS[J.o.cart].n.toLowerCase() + '.')], null, true); return; }
      ding(); addGold(J.wrongC ? 2 : 4); if (!J.wrongC) J.clean++; J.wrongC = false; const C = CARTS[i], st = mm(Bx(Math.min(0.55, J.cw), J.ct * 3, Math.min(0.5, J.cd)), LM(J.o.c), 0, 0, 0); st.position.copy(CL.position); G.add(st); C.stack.push(st); CL.visible = false;
      fly(st, V(144.95, 0.78 + (C.stack.length - 1) * 0.07, C.z), 0.7, 0.4, null); J.li++; if (J.li < 4) NEXT('sorted', lgLay, 0.9); else NEXT('end', () => finishGame([lm('Folded like a dream! Even the sheet. Nobody can fold the sheet.')]), 1.4); } }
  function lfDrag() { if (J.sub !== 'fold' || J.held !== 'fold') return; const [a, b] = foldPts(), sa = scrW(a), sb = scrW(b), vx = sb[0] - sa[0], vy = sb[1] - sa[1], L2 = vx * vx + vy * vy || 1; const k = clamp(((ptr.x - sa[0]) * vx + (ptr.y - sa[1]) * vy) / L2, 0, 1); J.fk = k; foldShow(k);
    if (k > 0.9) { J.held = null; foldShow(1); tone(500 + J.fold * 200, 0.04, 0.15, 'triangle'); addGold(2); J.sub = 'folded'; NEXT('folded', () => { if (J.fold === 0) { CL.position.x -= J.cw / 4; J.cw /= 2; } else { CL.position.z -= J.cd / 4; J.cd /= 2; } J.ct *= 2; clSet(J.o, J.cw, J.cd, J.ct); J.fold++;
      if (J.fold < 2) { J.sub = 'fold'; toast('AND AGAIN · RING TO RING', 1.2); } else { J.sub = 'sort'; toast('TAP THE ' + CARTS[J.o.cart].n + ' CART', 1.6); } }, 0.3); } }
  function lfRelease() { if (J.held === 'fold') { J.held = null; if (J.fk < 0.9) { foldShow(0); clSet(J.o, J.cw, J.cd, J.ct); toast('ALL THE WAY TO THE OTHER RING', 1); } } }
  function lfTick(dt) { if (J.sub === 'lay') { J.lay = Math.min(1, J.lay + dt * 2.5); CL.scale.set(0.2 + J.lay * 0.8, 1, 0.2 + J.lay * 0.8); if (J.lay >= 1) { J.sub = 'fold'; toast(J.o.n + ' · DRAG RING TO RING', 1.6); } } }
  // ---- finish (all games) ----
  function finishGame(lines) { const g = J.g; addGold(10); if (J.clean >= 2 && !J.miss) { addGold(8); toast('SPOTLESS · +8 GOLD', 2); }
    J.sub = 'pay'; const d = doneMap(), first = !d[g]; d[g] = true; let full = false; if (DOING.every(([k]) => d[k]) && !d.full) { d.full = true; full = true; } save.setStat('mtDone', { ...d }); redraw(boardTex, boardFn);
    if (J.gold > save.stat('mtBest_' + g, 0)) save.setStat('mtBest_' + g, J.gold); const g2 = giveGift(); if (full) { save.addGold(60); save.give('goldenKey'); }
    const l0 = lines[0] && lines[0].text, op = l0 && l0.split(/\s+/).length <= 8 ? l0 : ['Lovely work, sweet pea!', 'Spotless, dear!', 'That\u2019s my star!', 'Mama is proud!'][save.stat('mtClears', 0) % 4];
    const pz = g2.kind === 'uni' ? ' The bellhop uniform is yours! The hook swaps it.' : g2.kind === 'mint' ? ' Three pillow mints for your bag.' : g2.kind === 'mint1' ? ' A pillow mint too.' : ' Twenty bonus gold!', stars = !J.miss ? 3 : J.miss <= 2 ? 2 : 1;
    sayTo(endM, [lm(op + ' ' + J.gold + ' gold.' + pz), ...(full ? [lm('ALL EIGHT! A full house! Sixty gold and my GOLDEN ROOM KEY.')] : [])], null, true); SK.finish(g, stars, J.gold, first); cheer(); NEXT('pay', () => stop(), 1.2); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const g = J.g, s = J.sub; if (s === 'intro' || s === 'pay') return;
    if (g === 'checkin') ciPress(); else if (g === 'beds') bedsPress(); else if (g === 'service') svPress(); else if (g === 'ice') icePress(); else if (g === 'pool') poolPress(); else if (g === 'luggage') lgPress(); else if (g === 'laundry') lfPress(); else if (g === 'night' && s === 'decide') toast('PICK ON THE CARD', 1); }
  function drag() { if (!J) return; const g = J.g; if (g === 'beds') bedsDrag(); else if (g === 'ice') iceDrag(); else if (g === 'pool') poolDrag(); else if (g === 'laundry') lfDrag(); }
  function release() { if (!J) return; const g = J.g; if (g === 'ice') { iceRelease(); iceReleaseB(); } else if (g === 'laundry') lfRelease(); }
  function answer(i) { if (!J) return; if (J.g === 'night') nightAnswer(i); }
  // ---- the game card ----
  const strip = (names, n) => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + names.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 1px;font-size:9px;font-weight:900;border:2px solid #201e1d;overflow:hidden;text-align:left;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  const NEXTS = { arrive: 'HERE THEY COME\u2026', key: 'TAP THEIR KEY', given: 'HERE\u2019S YOUR KEY', sheet: 'DRAG THE SHEET UP THE DOTS', tuck: 'TAP THE 4 CORNERS', pillow: 'TAP THE PILLOWS', mint: 'TAP THE MINT', items: 'TAP THE PLATES', lift: 'TAP THE TRAY', walk: 'CARRY IT · FOLLOW THE ARROW', back: 'BACK TO THE HATCH', door: 'DELIVERED!',
    screws: 'TAP THE 4 SCREWS', chip: 'TAP THE ICE JAM', wires: 'DRAG EACH WIRE TO ITS COLOUR', reset: 'TAP RESET ON GREEN', bucket: 'HOLD · LET GO ON THE LINE', skim: 'DRAG THE NET OVER LEAVES', empty: 'TAP THE GREEN BIN', duck: 'SCOOP THE DUCK', pick: 'TAP THE MATCHING BAG', wait: 'WAITING\u2026', knock: 'KNOCK KNOCK', decide: 'LET THEM IN?', dryer: 'TAP THE DRYER', filled: 'ICE!', iceOut: 'ICE COMING\u2026', duckGot: 'GOT HIM!', found: 'FOUND IT!', tucked: 'TUCKED!', sheeted: 'SMOOTH!', minted: 'MINT!', folded: 'FOLDED!', decided: 'WE\u2019LL SEE\u2026', loaded: 'TRAY READY', lay: 'LAYING IT OUT', fold: 'DRAG RING TO RING', sort: 'TAP THE RIGHT CART' };
  function drawCard() { if (!J) return; const s = J.sub, g = J.g, names = PARTS[g], hr = J.gold ? J.gold + ' G' : ''; let det = '', key = g + s + J.step + '_' + J.gold, live = false;
    const hd = GN[g] + (J.step && names.length > 1 ? ' · ' + Math.min(J.step, names.length) + '/' + names.length : ''), next = s === 'intro' ? 'LISTEN TO MAMA KEYS' : s === 'pay' ? 'ALL DONE' : NEXTS[s] || 'NEXT\u2026';
    if (s === 'intro') det = row(TEAL, 'STARTING SOON', '', false); else if (s === 'pay') det = big('+' + J.gold + ' GOLD', GREEN);
    else if (g === 'checkin') { key += J.done.length; det = (J.p ? big('GUEST: ' + J.p.name, INK) : '') + small('BOOKINGS') + J.bookShow.map(b => row(TEAL, b.name, String(b.room), J.done.includes(b.name))).join(''); }
    else if (g === 'beds') { key += (J.path ? J.path.i : 0) + '_' + J.tuck.filter(Boolean).length + '_' + J.pil; det = row(WHITE, 'SHEET', (J.path ? J.path.i : 0) + '/4', J.path && J.path.i >= 4) + row(TEAL, 'CORNERS', J.tuck.filter(Boolean).length + '/4', J.tuck.every(Boolean)) + row('#fbfaf6', 'PILLOWS', J.pil + '/2', J.pil >= 2) + row('#5ad0a0', 'MINT', s === 'minted' ? '\u2713' : '', s === 'minted'); }
    else if (g === 'service') { const O = J.O; key += J.got.length + '_' + Math.round((J.steady || 0) * 10) + '_' + Math.ceil(Math.max(0, (J.par || 0) - (J.wt || 0))); det = big('ROOM ' + O.room + (O.room > 200 ? ' · UPSTAIRS' : ''), RED) + O.items.map(k => row(FOOD[k].c, FOOD[k].n, J.got.includes(k) ? '\u2713' : '', J.got.includes(k))).join('');
      if (s === 'walk') { const left = Math.max(0, J.par - J.wt); det += row(YEL, 'STEADY TRAY', Math.round(J.steady * 100) + '%', J.steady > 0.8) + bar(J.steady, YEL) + small(left > 0 ? Math.ceil(left) + ' S · ON-TIME TIP' : 'LATE IS FINE · KEEP GOING'); } if (s === 'back') det = row(YEL, 'NEXT TICKET', 'AT THE HATCH', false) + small('E AT THE HATCH = END THE ROUND'); }
    else if (g === 'ice') { key += SCREW.filter(o => o.out).length + '_' + J.hits + '_' + WIRE.filter(w => w.on).length + '_' + Math.round(J.fill * 40) + (s === 'reset' ? (lightGreen() ? 'g' : 'r') : ''); det = s === 'screws' ? row(STEEL, 'SCREWS OUT', SCREW.filter(o => o.out).length + '/4', false) : s === 'chip' ? row('#bfe8ff', 'ICE JAM', J.hits + '/6', false) + bar(J.hits / 6, '#5ad0ff') : s === 'wires' ? WIRE.map(w => row(w.c, ['RED', 'BLUE', 'YELLOW'][WCOL.indexOf(w.c)] + ' WIRE', w.on ? '\u2713' : '', w.on)).join('') : s === 'reset' ? big(lightGreen() ? 'GREEN · TAP NOW' : 'RED · WAIT', lightGreen() ? GREEN : RED) : s === 'bucket' || s === 'filled' ? row(RED, 'ICE BUCKET', Math.round(J.fill * 100) + '%', J.fill >= 0.76 && J.fill <= 0.95) + bar(J.fill / 1.15, '#5ad0ff', [0.76 / 1.15, 0.95 / 1.15]) : ''; }
    else if (g === 'pool') { key += J.got + '_' + J.load; det = s === 'duck' || s === 'duckGot' ? row(YEL, 'RUBBER DUCK', s === 'duckGot' ? '\u2713' : '', s === 'duckGot') : row(GREEN, 'LEAVES', J.got + '/12', false) + bar(J.got / 12, GREEN) + row(BLUE, 'IN THE NET', J.load + '/4', J.load >= 4) + small('FULL NET = TAP THE GREEN BIN'); }
    else if (g === 'luggage') { const T = BAGS[J.ti]; det = T && s !== 'arrive' ? big(BCOL[T.c][0] + ' ' + BTYP[T.t], BCOL[T.c][1], T.c === 2 ? INK : '#fff') + row(BTAG[T.tg][1], BTAG[T.tg][0], '', false) + small('ALL THREE MUST MATCH') : row(TEAL, 'A GUEST IS COMING', '', false); }
    else if (g === 'night') { live = s === 'decide'; det = big(s === 'decide' || s === 'knock' ? 'KNOCK KNOCK · ' + J.K.b.name : 'NIGHT DESK · 2 AM', INK) + small('THE GUEST BOOK') + J.book.map(b => '<div style="display:flex;gap:6px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3;font-weight:800"><span style="flex:1;min-width:0;font-size:13px">' + b.room + ' ' + b.name + '</span><span style="font-size:12px;font-weight:900;white-space:nowrap">' + (b.tall ? 'TALL' : 'SHORT') + ' · ' + HATS[b.hat] + '</span></div>').join('') + (live ? btns(['LET THEM IN', 'KEEP IT LOCKED']) + small('DOES THE SHADOW MATCH THE BOOK?') : ''); }
    else if (g === 'laundry') { key += J.li + '_' + (J.fold || 0) + '_' + Math.round((J.fk || 0) * 10); det = J.o && s !== 'dryer' ? row(J.o.c, J.o.n, 'FOLD ' + Math.min(2, J.fold || 0) + '/2', (J.fold || 0) >= 2) + (s === 'sort' ? row(TEAL, 'GOES IN', '?', false) : '') : row(WHITE, 'DRYER DONE', 'DING!', false); }
    setCard(key, head2(hd, hr) + foot(next, !live && s !== 'walk' && s !== 'back') + '<div style="padding:8px 10px 10px">' + (names.length > 1 && J.step ? strip(names, Math.min(J.step, names.length)) : '') + det + '</div>', live); }
  function stop(quit) { busy = null; J = null; ptr.down = false; FLIES.length = 0; hideCard(); placeK('idle'); hideC(); HI.visible = HI2.visible = false; night.style.display = 'none'; ARROW.visible = BEACON.visible = RTGT.visible = false; OPEN.visible = false;
    KEYS.forEach(K => { K.out = false; K.g.visible = true; K.g.position.copy(K.home); }); resetBeds(); TRAY.parent !== G && G.attach(TRAY); TRAY.position.copy(TRAYH); TRAY.rotation.set(0, 0, 0); while (TRAY.children.length > 3) TRAY.remove(TRAY.children[3]);
    SCREW.forEach(s => { s.out = false; s.m.position.copy(s.home); }); PANEL.position.copy(PANELH); PANEL.rotation.set(0, 0, 0); CHUNK.visible = false; WIRE.forEach(w => { w.on = true; w.end.position.copy(SOCK[WIRE.indexOf(w)].m.position); }); ICEP.visible = false; BUCKET.visible = false; BUCKET.position.set(IX, 0.08, IZF - 0.35);
    LEAVES.forEach(L => { L.m.visible = false; }); NET.visible = false; FLOATY.visible = false; BAGS.forEach(B => { if (B.out) { B.out = false; B.g.visible = true; B.g.position.copy(B.home); } }); SIL.visible = false; leafK = 1;
    CL.visible = false; BASKET.forEach(b => G.remove(b)); BASKET.length = 0; DRYD.rotation.y = 0; CARTS.forEach(C => { while (C.stack.length > 4) G.remove(C.stack.shift()); }); }
  // ================= camera =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT2 = Math.tan(vf), asp = camera.aspect || 1, wT = hT2 * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT2) : h / 2 / hT2, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT2 * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub, g = J.g;
    if (g === 'checkin') return s === 'key' ? [V(129, 1.8, -184.4), 5.3, 2.0, 0.12, 3.0, 0, 10] : [V(128.8, 1.3, -180.0), 3.4, 2.0, 0.22, 2.2, Math.PI, 4.2];
    if (g === 'beds') { const x = J.B ? J.B.x : BEDX[0], nx = J.bi === 1 ? 1.25 : -1.25; return s === 'mint' ? [V(x + nx * 0.45, 0.6, -186.7), 3.4, 2.4, 0.8, 3.0, 0, 5.2] : [V(x, 0.55, -186.4), 3.6, 2.8, 0.85, 3.2, 0, 5.2]; }
    if (g === 'service') return [V(124.35, 1.05, -184.15), 2.3, 1.2, 0.55, 1.6, 0, 3.6];
    if (g === 'ice') return s === 'bucket' || s === 'filled' || s === 'intro' ? [V(IX, 0.7, IZF), 1.6, 1.8, 0.32, 1.8, Math.PI, 3.6] : [V(IX, 1.3, IZF), 1.9, 1.6, 0.12, 1.8, Math.PI, 3.2];
    if (g === 'pool') return [V(109, 0.2, -181.2), 3.4, 10.0, 1.15, 5, 0, 14];
    if (g === 'luggage') return s === 'pick' || s === 'found' ? [V(113.0, 0.95, -177.3), 6.6, 2.0, 0.15, 3, Math.PI / 2, 8.5] : [V(121.8, 1.2, -177.2), 2.6, 1.9, 0.2, 2.0, -Math.PI / 2, 4];
    if (g === 'night') return [V(129, 1.15, -174.4), 4.0, 2.4, 0.08, 3.2, Math.PI, 9.5];
    if (g === 'laundry') return s === 'dryer' || s === 'dried' ? [V(141.6, 0.6, -186.5), 2.6, 1.6, 0.35, 2.2, 0, 4] : s === 'sort' ? [V(142.8, 0.8, -185.0), 4.4, 2.0, 0.65, 3, 0.35, 6] : [V(140.4, 0.9, -185.0), 3.2, 2.0, 0.9, 2.8, 0, 4.2];
    return null; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  const ROOMB = [[123, 135, Z0, Z1], [X0, 123, Z0, -181], [X0, 123, -181, Z1], [135, X1, Z0, -182], [135, X1, -182, Z1]];   // lobby · 101 · lost + found · laundry · ice hall
  function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (busy === 'job' && fox) { const FPj = fox.userData.P;
      if (J && J.g === 'beds' && J.B && FPj && FPj.fore) { const B = J.B, side = J.bi === 1 ? -1 : 1, st = J.sub === 'tuck' ? 'tuck' : J.sub === 'pillow' ? 'pillow' : J.sub === 'mint' || J.sub === 'minted' ? 'mint' : 'sheet', tt = performance.now() / 1000;   // s636: beside the bed, away from the nightstand
        fox.visible = true; fox.position.set(B.x + side * 1.05, 0, -186.45); fox.rotation.set(0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0); applyD(THREE, fox, workD('bed', tt, { step: st }), tt, 1); fox.userData._bedJ = 1; }
      else { if (fox.userData._bedJ) { fox.userData._bedJ = 0; endPose(fox); } if (J && J.g === 'service' && busy === 'walk') {} else JW(fox, 'motel ' + ((J && J.g) || 'desk')); } } else if (fox.userData._bedJ) { fox.userData._bedJ = 0; endPose(fox); } }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v); if (J.g !== 'pool') { const tg = v[0], b = ROOMB.find(r => tg.x >= r[0] && tg.x <= r[1] && tg.z >= r[2] && tg.z <= r[3]); if (b) { camT.pos.x = clamp(camT.pos.x, b[0] + 0.35, b[1] - 0.35); camT.pos.z = clamp(camT.pos.z, b[2] + 0.35, b[3] - 0.35); } camT.pos.y = Math.min(camT.pos.y, CEIL - 0.4); }   // camera stays in the room
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer on the first of targets() (card answers are skipped) ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { let h = null; if (performance.now() - lastIn > 3000 && busy === 'job' && J && J.pause <= 0 && !ptr.down && !FLIES.length && !['intro', 'pay'].includes(J.sub)) { const q = API.targets()[0]; h = q && typeof q === 'object' ? (q.from || q) : null; }
    if (!h || !(h[2] < 1)) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const lab = NEXTS[J.sub] || 'TAP HERE';
    const sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(h[0] - 17) + 'px,' + Math.round(h[1] - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== lab) l.textContent = lab; };
  // ================= talk + prompt =================
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r && (P.y || 0) < 2, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r && (P.y || 0) < 2;
  const PROMPTS = { checkin: 'CHECK-IN · THE KEY BOARD', night: 'NIGHT DESK · WHO\u2019S KNOCKING?', service: 'ROOM SERVICE · THE HATCH', beds: 'MAKE THE BEDS · ROOM 101', luggage: 'LOST LUGGAGE', laundry: 'LAUNDRY FOLD', ice: 'FIX THE ICE MACHINE', pool: 'CLEAN THE POOL' };
  function prompt(P) { if (busy === 'job' || !inStation(P) || P.skate) return null; if (J) { if (J.g === 'service' && at(P, SPOT.service) && J.sub !== 'walk') return 'END ROOM SERVICE'; return null; }
    for (const k in PROMPTS) if (at(P, SPOT[k])) return PROMPTS[k] + (doneMap()[k] ? ' \u2713' : '');
    if (ownU() && at(P, SPOT.hook)) return 'MY UNIFORM ' + (uOn() ? 'OFF' : 'ON'); if (SK.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, mT)) return 'TALK · MAMA KEYS'; return null; }
  // s73: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const TALK_M = ['Every key on that board has a story. Room 204\u2019s story is mostly snoring.', 'The housekeeping board by the lounge. Tick all eight and you get my golden key.', 'The pool closes at ten. The ducks don\u2019t know that.', 'Forty years I\u2019ve run this motel. The ice machine has broken for thirty-nine of them.', 'Room service tip: walk, don\u2019t run. Orange juice is very slippery on stairs.'];
  const ORDER = DOING.map(([k]) => k), nextJob = () => ORDER.find(k => !doneMap()[k]) || ORDER[save.stat('mtVisits', 0) % ORDER.length];
  let lastP = null; const goJob = (k, P) => { if (busy || J) return; if (P) Object.assign(P, { x: SPOT[k].x, z: SPOT[k].z, sp: 0 }); startGame(k); };
  const jc = (k, t) => ({ text: t, pick: () => goJob(k, lastP) });
  const mMenu = first => sayTo(mT, [{ ...lm(first ? 'Welcome to the Meru Motel, sweet pea! I\u2019m Mama Keys. Eight jobs, eight yellow rings.' : ['Sweet pea! The keys missed you.', 'Back again? Lovely. Plenty to do.', 'Oh good, a helper! What\u2019ll it be, dear?'][talked % 3]),
    choices: [jc(nextJob(), CHOICE_WORK), jc('checkin', 'THE FRONT DESK'), jc('service', 'ROOM SERVICE'), jc('pool', 'THE POOL'), { text: 'A MOTEL STORY, PLEASE', pick: () => sayTo(mT, [lm(TALK_M[talked % TALK_M.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  function talk(P) { lastP = P; if (busy === 'job') return true; if (!inStation(P) || P.skate) return false;
    if (J) { if (J.g === 'service' && at(P, SPOT.service) && J.sub !== 'walk') { stop(true); toast('ROOM SERVICE ENDED · GOLD KEPT', 2); return true; } if (near(P, mT)) { sayTo(mT, [lm('Off you go, sweet pea! Follow the arrow.')]); return true; } return false; }
    for (const k in PROMPTS) if (at(P, SPOT[k])) { startGame(k); return true; }
    if (ownU() && at(P, SPOT.hook)) { const on = !uOn(); putOn(on); pop(); toast(on ? 'UNIFORM ON' : 'UNIFORM OFF', 1.6); return true; }
    if (SK.atHiring(P)) { ding(); goJob(nextJob(), P); return true; }
    if (near(P, mT)) { pop(); jingle(); mMenu(!talked++); return true; }
    return false; }
  function quit() { if (J && J.g === 'night') night.style.display = 'none'; stop(true); toast('BACK TO WORK LATER · GOLD KEPT', 2); }
  function useItem(id) { return false; }
  // ================= tick =================
  const BEGIN = { checkin: beginCheckin, beds: beginBeds, service: beginService, ice: beginIce, pool: beginPool, luggage: beginLuggage, night: beginNight, laundry: beginLaundry };
  const SK = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'motel', color: TEAL, boardTitle: "Mama's best",
    room: { X0: 123, X1: 135, Z0, Z1 }, door: [129, -172.6], keeper: mama, keeperRy: KS.idle[2],
    games: DOING.map(([k, n]) => ({ k, name: n.charAt(0) + n.slice(1).toLowerCase(), color: TEAL })), board: { x: 133.3, y: 2.75, z: Z1 - 0.09, ry: Math.PI, w: 1.1 },
    hiring: { x: 125.9, z: -175.6, ry: Math.PI / 2 }, hiringLine: '8 JOBS · PICK ANY', clock: { x: 133.2, y: 2.45, z: -184.43, ry: 0 },
    sun: [{ x: 129, z: -174.2, w: 2.4, d: 2.8 }],
    lamps: [[123.9, 4.1, -176.7], [128.1, 4.1, -176.7], [132.3, 4.1, -176.7], [123.9, 4.1, -181.1], [128.1, 4.1, -181.1], [132.3, 4.1, -181.1]],
    browse: [[125.4, -173.5, 0], [134.1, -175.6, Math.PI / 2], [131.0, -179.9, Math.PI], [127.0, -178.2, -Math.PI / 2]] });
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, dH = Math.hypot(P.x - CX, P.z - CZ); if (!unstuck) unstick(); railTick(P); G.visible = dH < (touch ? 50 : 95) || !!J; toastT -= dt;
    if (J && !inStation(P)) { stop(true); toast('YOU LEFT THE MOTEL · GOLD KEPT', 2); }
    if (FLIES.length) flyTick(dt);
    if (J) { J.t += dt; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      if (J) { const g = J.g; if (g === 'service' && busy === 'walk') svWalk(dt, P, fox); else if (g === 'ice') iceTick(dt); else if (g === 'pool') poolTick(dt); else if (g === 'laundry') lfTick(dt); }
      if (J) { HI.visible = HI2.visible = false; const s = J.sub, g = J.g;
        if (g === 'checkin' && s === 'key' && J.wrong >= 2) { const K = KEYS.find(k => k.r === J.book[J.gi].room); if (K) hi(HI, K.g.position.clone().add(V(0, -0.1, 0.02))); }
        if (g === 'beds') { const B = J.B; if (s === 'sheet' && J.path.i < 4) hi(HI, J.path.pts[J.path.i], false), HI.rotation.set(Math.PI / 2, 0, 0); if (s === 'tuck') { const i = J.tuck.indexOf(false); if (i >= 0) hi(HI2, V(B.x + (i % 2 ? 0.76 : -0.76), BTOP + 0.02, i < 2 ? HEADZ + 0.08 : FOOTZ - 0.08)); } if (s === 'pillow') { const p = B.pillows.find(q => !q.up); if (p) hi(HI2, p.m.position.clone().add(V(0, 0.12, 0))); } if (s === 'mint') hi(HI, B.mint.position.clone().add(V(0, 0.05, 0))); }
        if (g === 'service') { if (s === 'items') { const k = J.O.items.find(q => !J.got.includes(q)); if (k != null) hi(HI, FOODP(k).add(V(0, 0.18, 0))); } if (s === 'lift') hi(HI2, TRAY.position.clone().add(V(0, 0.12, 0))); }
        if (g === 'ice') { if (s === 'screws') { const S = SCREW.find(o => !o.out); if (S) hi(HI, S.m.position); } if (s === 'chip') hi(HI2, CHUNK.position); if (s === 'wires') { const w = WIRE.find(o => !o.on); if (w && J.held == null) hi(HI, w.end.position); } if (s === 'reset') hi(HI, RESET.position); }
        if (g === 'pool' && s === 'empty') hi(HI2, BIN.position.clone().add(V(0, 0.75, 0)));
        if (g === 'luggage' && s === 'pick' && J.wrong >= 2) hi(HI2, bagC(BAGS[J.ti]).add(V(0.25, 0, 0)));
        if (g === 'laundry') { if (s === 'dryer') hi(HI2, V(141.4, 0.5, -186.7)); if (s === 'fold') { const [a, b] = foldPts(); hi(HI, a); hi(HI2, b); } if (s === 'sort' && J.wrongC) hi(HI2, V(144.95, 0.85, CARTS[J.o.cart].z)); }
        if (g === 'night' && night.style.display === 'block') { const s2 = scrW(V(129, 1.2, -174.6)), r = MIN() * 0.42; night.style.background = 'radial-gradient(circle at ' + Math.round(s2[0]) + 'px ' + Math.round(s2[1]) + 'px, rgba(6,10,30,0.15) 0px, rgba(6,10,30,0.2) ' + Math.round(r * 0.5) + 'px, rgba(6,10,30,0.72) ' + Math.round(r) + 'px)'; }
        drawCard(); } }
    partTick(dt); hintTick(t);
    { const cur = LEAF[0].g.position.x, want = 129 - (0.6 + 1.25 * leafK); if (Math.abs(cur - want) > 0.005) { const k = cur + (want - cur) * Math.min(1, dt * 5); const kk = (129 - k - 0.6) / 1.25; LEAF.forEach(L => { L.g.position.x = 129 + L.s * (0.6 + 1.25 * kk); }); } }
    if (!G.visible) return;
    for (const k in RS) RS[k].visible = !J && !busy && (k !== 'hook' || ownU()); hookU.visible = ownU() && !uOn();
    lampShade.material.color.set(J && J.g === 'night' ? '#7cff9b' : '#3f9a5e');
    if (!J) WIRE.forEach((w, i) => w.h.set(w.a, SOCK[i].m.position, 0.08));
    { const work = !!J && !['walk', 'back'].includes(J.sub), inS = P.x > X0 && P.x < X1 && P.z > Z0 && P.z < Z1 && (P.y || 0) < 2; SK.tick(dt, P, { inShop: inS, busy: !!J, near: dH, talking: work }); if (work) turnTo(mama, mama.userData.face0 ?? 0, dt * 0.5); }   // s73: shop kit runs Mama's idle / wave / look-at
    cf.forEach(p => { if (p && p.H.visible) kit.animFox && kit.animFox(p.f, dt, 0); }); if (banditF && banditF.H.visible) kit.animFox && kit.animFox(banditF.f, dt, 0); }
  // wires start plugged in (the machine works until a game breaks it)
  WIRE.forEach((w, i) => { w.on = true; w.end.position.copy(SOCK[i].m.position); w.h.set(w.a, w.end.position, 0.08); }); SOCK.forEach((s, i) => { s.m.position.x = SOCKX[i]; });
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy === 'walk' ? null : busy), toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startGame, answer, useItem, groundAt, mama, camera, save, KEYS, BAGS, BEDS, LEAVES, CARTS, WIRE, SOCK, doorAt,
    tap(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    hold(on) { if (on) ptr.down = true; else { ptr.down = false; release(); } }, skip() { if (J && J.pause > 0) J.pause = 0.001; }, scr: v => scrW(v),
    targets() { if (!J) return []; const s = J.sub, g = J.g, S = v => scrW(v);
      if (g === 'checkin') return s === 'key' ? [S(KEYS.find(k => k.r === J.book[J.gi].room).g.position)] : [];
      if (g === 'beds') { const B = J.B; return s === 'sheet' ? J.path.pts.slice(J.path.i).map(S) : s === 'tuck' ? J.tuck.map((d, i) => (d ? null : S(V(B.x + (i % 2 ? 0.76 : -0.76), BTOP, i < 2 ? HEADZ + 0.08 : FOOTZ - 0.08)))).filter(Boolean) : s === 'pillow' ? B.pillows.filter(p => !p.up).map(p => S(p.m.position)) : s === 'mint' ? [S(B.mint.position)] : []; }
      if (g === 'service') return s === 'items' ? J.O.items.filter(k => !J.got.includes(k)).map(k => S(FOODP(k).add(V(0, 0.06, 0)))) : s === 'lift' ? [S(TRAY.position)] : [];
      if (g === 'ice') return s === 'screws' ? SCREW.filter(o => !o.out).map(o => S(o.m.position)) : s === 'chip' ? [S(CHUNK.position)] : s === 'wires' ? WIRE.filter(w => !w.on).map(w => ({ from: S(w.end.position), to: S(SOCK.find(o => o.c === w.c).m.position) })) : s === 'reset' ? [S(RESET.position)] : [];
      if (g === 'pool') return s === 'empty' ? [S(BIN.position.clone().add(V(0, 0.4, 0)))] : s === 'skim' ? LEAVES.filter(L => !L.caught && !L.done).map(L => S(L.m.position)) : s === 'duck' ? [S(FLOATY.position)] : [];
      if (g === 'luggage') return s === 'pick' ? [S(bagC(BAGS[J.ti]))] : []; if (g === 'night') return s === 'decide' ? [J.K.real ? 0 : 1] : [];
      if (g === 'laundry') return s === 'dryer' ? [S(V(141.4, 0.5, -186.75))] : s === 'fold' ? [{ from: S(foldPts()[0]), to: S(foldPts()[1]) }] : s === 'sort' ? [S(V(144.95, 0.75, CARTS[J.o.cart].z))] : [];
      return []; },
    dispose() { card.remove(); night.remove(); HAND.remove(); SK.dispose(); } };
  G.add(subMesh(R0)); { const gm = new THREE.Mesh(RG.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.28, depthWrite: false })); gm.renderOrder = 2; G.add(gm); }
  window.__motel = API; return API;
}
