// MERU 2.0 — s58 TOWN 2 INTERIOR 16: GAS STATION [meruGas] (shop f 378..392 × 68..80, front door W (378, 74), side door N (385, 68), canopy + 2 pumps x 364..376,
// car-wash bay south of the shop x 378..391 × 80..85). BOLT (big rust-red mechanic fox, navy overalls, red cap on backwards, wrench in the pocket; car puns, calls you "chief").
// NINE SHORT GAMES, one per yellow ring (Ben's pick: all 9, gentle, no fail): FILL UP (pump 1) · WINDSCREEN (pump 2) · OIL CHECK (pump 2, the bonnet) · TYRE PRESSURE (air)
// · CAR WASH (the bay) · SNACKS + SLUSHIE (the counter) · CHANGE A FLAT (north lot) · TOW CALL-OUT (the tow truck: drive out the Arena Road, hook, lift, chain, tow it home)
// · RESTOCK (the delivery crate). The JOBS board ticks each; all 9 = FULL SHIFT +60 gold + the GOLDEN NOZZLE.
// Prizes per clear in turn: MECHANIC OVERALLS (+ red cap, worn; the hook by the counter toggles) → SLUSHIE ×2 → then +20 gold, a SLUSHIE every 3rd clear.
// s72 INTERIOR POLISH 16: shopKit (Bolt = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board for all 9 jobs; badge), NOW HIRING inside the glass door,
// ONE-box menu with choices, 1-box intros + end line, hint hand (from targets()), touch radius 44, portrait lens, shop cameras clamped inside the room.
import { meruCars } from '../engine/meru-cars.js?v=s679';
import { WS } from '../engine/world-sfx.js?v=s713';   // s711 Runway sounds (audio/meru)
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildGasStation({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false }) { const JW = jobWorker(THREE);
  const X0 = 378.4, X1 = 391.6, Z0 = 68.4, Z1 = 79.6, CX = 385, CZ = 74, CEIL = 4.6;
  const G = new THREE.Group(); G.name = 'gas'; scene.add(G);
  const GT = new THREE.Group(); GT.name = 'gasTow'; scene.add(GT);   // the tow truck + the call-out car (never distance-hidden: they drive away)
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', STEEL = '#9aa3ab', DARK = '#3d3b3a', WOOD = '#8a6440', GLASS = '#3a4a58', CONC = '#b9b4ad';
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
  // a sagging hose / cable, rebuilt only when its ends move
  function mkHose(col, r = 0.025, par = G) { const m = new THREE.Mesh(new THREE.BufferGeometry(), LM(col)); par.add(m); let key = '';
    return { m, set(a, b, sag = 0.4) { const k = [a.x, a.y, a.z, b.x, b.y, b.z].map(v => v.toFixed(2)).join(); if (k === key) return; key = k; const mid = a.clone().lerp(b, 0.5); mid.y = Math.min(a.y, b.y) - sag;
      const cu = new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()); m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(cu, 16, r, 5, false); } }; }
  // ================= FLOOR (grey speckled tiles) =================
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#d9d6d1' : '#cfcbc5'; g.fillRect(i * 64, j * 64, 64, 64); } let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 260; i++) { g.fillStyle = r() > 0.5 ? 'rgba(32,30,29,0.25)' : 'rgba(255,255,255,0.5)'; g.fillRect(r() * W, r() * H, 2, 2); } g.strokeStyle = 'rgba(32,30,29,0.25)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 1.6, (Z1 - Z0) / 1.6); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  box(1.6, 0.02, 2.2, INK, X0 + 0.9, 0.08, 74); box(2.2, 0.02, 1.4, INK, 385, 0.08, Z0 + 0.8);
  // ================= WALLS (ink skirting, grey wainscot, red band, white) + glass front + ceiling panels =================
  const wall = (len, x, z, ry, h = CEIL) => { box(len, 0.15, 0.07, INK, x, 0.075, z, ry); box(len, 1.0, 0.06, '#cfcac3', x, 0.65, z, ry); box(len, 0.22, 0.09, RED, x, 1.26, z, ry); box(len, h - 1.37, 0.06, WHITE, x, 1.37 + (h - 1.37) / 2, z, ry); };
  wall(X1 - X0, CX, Z1 - 0.03, 0); for (const [a, b] of [[X0, 383.6], [386.4, X1]]) wall(b - a, (a + b) / 2, Z0 + 0.03, 0); wall(Z1 - Z0, X1 - 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, 72.6], [75.4, Z1]]) { const c = (a + b) / 2, L2 = b - a; box(L2, 0.15, 0.07, INK, X0 + 0.03, 0.075, c, Math.PI / 2); box(L2, 0.75, 0.06, '#cfcac3', X0 + 0.03, 0.52, c, Math.PI / 2); box(L2, 0.1, 0.09, RED, X0 + 0.03, 0.92, c, Math.PI / 2);
    RG.box(L2, CEIL - 0.97, 0.03, '#cfe8f0', X0 + 0.03, 0.97 + (CEIL - 0.97) / 2, c, Math.PI / 2); for (let z = a; z <= b + 0.01; z += 1.4) box(0.07, CEIL - 0.97, 0.1, INK, X0 + 0.03, 0.97 + (CEIL - 0.97) / 2, Math.min(z, b), Math.PI / 2); }
  { const sh = new THREE.Shape(); sh.moveTo(X0, Z0); sh.lineTo(X1, Z0); sh.lineTo(X1, Z1); sh.lineTo(X0, Z1); sh.lineTo(X0, Z0); const cm = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({ color: '#e8e6e2' })); cm.rotation.x = Math.PI / 2; cm.position.y = CEIL; G.add(cm);
    const lm = new THREE.MeshBasicMaterial({ color: '#f6fbff' }), lg = new THREE.PlaneGeometry(1.4, 0.4); for (let x = 380.4; x < X1; x += 3.0) for (let z = 70.2; z < Z1; z += 3.2) { const p = new THREE.Mesh(lg, lm); p.rotation.x = Math.PI / 2; p.position.set(x, CEIL - 0.01, z); G.add(p); } }
  plane2(label("BOLT'S GAS & GO", RED, '#ffffff', 512, 64, 38), 2.6, 0.32, 381.8, 3.2, 76.6); for (const s of [-1, 1]) cyl(0.01, 0.01, CEIL - 3.36, INK, 381.8 + s * 1.1, 3.36 + (CEIL - 3.36) / 2, 76.6, 4);
  // ================= SHELVES (two gondolas) — the RESTOCK gaps stay empty on S1's north face =================
  const SHZ = [71.6, 74.2], SHX0 = 382.6, SHX1 = 389.0, BOARD = [0.12, 0.55, 0.98, 1.41], PC = [RED, YEL, BLUE, GREEN, '#f28c28', '#c75b9b', WHITE, '#6b3f2a'];
  const GAPS = [[386.7, 1], [387.6, 1], [388.5, 1], [387.15, 2], [388.3, 2]];   // [x, board] on S1 north
  { let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (const z of SHZ) { const cx = (SHX0 + SHX1) / 2, L2 = SHX1 - SHX0; box(L2, 0.12, 0.62, DARK, cx, 0.06, z); box(L2, 1.5, 0.06, '#d9dee3', cx, 0.87, z); for (const y of BOARD) box(L2, 0.03, 0.6, '#bfc6cc', cx, y + 0.02, z); box(0.06, 1.62, 0.62, DARK, SHX0, 0.81, z); box(0.06, 1.62, 0.62, DARK, SHX1, 0.81, z); rect(SHX0, SHX1, z - 0.32, z + 0.32);
      for (const side of [-1, 1]) for (let b = 0; b < 4; b++) for (let x = SHX0 + 0.22; x < SHX1 - 0.15; x += 0.2 + r() * 0.08) { if (z === SHZ[0] && side < 0 && GAPS.some(([gx, gb]) => gb === b && Math.abs(gx - x) < 0.32)) continue; const h = 0.14 + r() * 0.16, c = PC[Math.floor(r() * PC.length)]; box(0.14, h, 0.14 + r() * 0.06, c, x, BOARD[b] + 0.04 + h / 2, z + side * 0.16); } }
    plane2(label('SNACKS · DRINKS · CAR CARE', INK, '#ffffff', 512, 64, 32), 2.4, 0.3, 385.8, 2.1, SHZ[0]); plane2(label('ROAD MAPS · TREATS · TOYS', INK, YEL, 512, 64, 32), 2.4, 0.3, 385.8, 2.1, SHZ[1]); }
  // ================= DRINKS FRIDGE (east wall, lit, glass doors) — 3 restock gaps at its north end =================
  const FRX = 391.05, FGAP = [70.85, 71.3, 71.75];
  { box(0.7, 2.3, 8.2, '#d9dee3', 391.25, 1.15, 74.5); for (let k = 0; k < 4; k++) box(0.5, 0.03, 8.0, '#bfc6cc', 391.2, 0.35 + k * 0.5, 74.5); box(0.04, 0.06, 8.0, '#f6fbff', 390.92, 2.2, 74.5);
    let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280, DC = [RED, '#8fd0f0', YEL, GREEN, '#f28c28', BLUE, WHITE];
    for (let k = 0; k < 4; k++) for (let z = 70.65; z < 78.5; z += 0.18 + r() * 0.04) { if (k === 1 && FGAP.some(g => Math.abs(g - z) < 0.2)) continue; cyl(0.05, 0.05, 0.26, DC[Math.floor(r() * DC.length)], 391.15, 0.37 + k * 0.5 + 0.14, z, 8); }
    RG.box(0.03, 2.2, 8.1, '#cfe8f0', 390.88, 1.15, 74.5); for (let z = 70.45; z <= 78.6; z += 1.35) box(0.06, 2.24, 0.06, INK, 390.88, 1.15, z); rect(390.85, X1, 70.4, 78.6);
    plane(label('ICE COLD', BLUE, '#ffffff', 256, 64, 36), 1.2, 0.3, 390.86, 2.45, 74.5, -Math.PI / 2); }
  // ================= COUNTER + BACK COUNTER (slushie machine, cups, coffee, pretzel warmer) =================
  box(4.8, 1.0, 0.8, WHITE, 382.0, 0.5, 76.6); box(4.82, 0.22, 0.02, RED, 382.0, 0.8, 76.19); box(4.9, 0.05, 0.9, '#cfd6da', 382.0, 1.025, 76.6); rect(379.6, 384.4, 76.2, 77.0);
  plane(label('PAY HERE · SNACKS · SLUSHIES', INK, '#ffffff', 1024, 64, 34), 3.6, 0.24, 382.0, 0.45, 76.19);
  box(0.42, 0.26, 0.34, DARK, 380.3, 1.18, 76.6); box(0.38, 0.2, 0.01, '#5fa8c8', 380.3, 1.22, 76.42); box(0.32, 0.04, 0.2, INK, 380.3, 1.07, 76.3);
  box(6.4, 0.95, 0.6, '#cfcac3', 381.8, 0.475, 79.3); box(6.45, 0.04, 0.64, '#bfc6cc', 381.8, 0.97, 79.3); rect(378.6, 385.0, 79.0, Z1);
  // slushie machine: 3 tanks with turning paddles (CHERRY · BLUE RASPBERRY · LEMON-LIME)
  const FLAV = [{ n: 'CHERRY', c: '#d81e3a' }, { n: 'BLUE RASPBERRY', c: '#2e6bff' }, { n: 'LEMON-LIME', c: '#7ad13a' }], TANKX = [380.45, 381.1, 381.75];
  box(2.0, 0.42, 0.5, STEEL, 381.1, 1.2, 79.3); box(2.0, 0.08, 0.52, INK, 381.1, 2.18, 79.3); plane(label('SLUSHIES · S M L', RED, '#ffffff', 512, 64, 36), 1.6, 0.2, 381.1, 2.3, 79.04);
  const PADDLE = [], LEVER = []; FLAV.forEach((f, i) => { const x = TANKX[i]; box(0.5, 0.5, 0.42, f.c, x, 1.66, 79.32); const p = mm(Bx(0.04, 0.4, 0.3), LM(WHITE), x, 1.68, 79.32); G.add(p); PADDLE.push(p);
    const lv = new THREE.Group(); lv.add(mm(Bx(0.05, 0.14, 0.05), LM(INK), 0, -0.07, 0), mm(Bx(0.08, 0.04, 0.05), LM(f.c), 0, -0.15, 0)); lv.position.set(x, 1.36, 79.02); G.add(lv); LEVER.push(lv); box(0.06, 0.06, 0.06, DARK, x, 1.05, 79.05); });
  { const gm = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.52, 0.44), new THREE.MeshLambertMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.32, depthWrite: false })); gm.position.set(381.1, 1.66, 79.32); gm.renderOrder = 2; G.add(gm); }
  const SIZES = [{ n: 'SMALL', h: 0.12, r: 0.042 }, { n: 'MEDIUM', h: 0.16, r: 0.05 }, { n: 'LARGE', h: 0.21, r: 0.058 }], CUPX = [382.9, 383.3, 383.75];
  SIZES.forEach((s, i) => { for (let k = 0; k < 4; k++) cyl(s.r, s.r * 0.8, s.h, WHITE, CUPX[i], 0.99 + s.h / 2 + k * 0.03, 79.25, 10); cyl(s.r + 0.003, s.r + 0.003, 0.02, RED, CUPX[i], 0.99 + s.h * 0.75, 79.25, 10); });
  plane(label('S · M · L', INK, '#ffffff', 256, 48, 30), 0.8, 0.14, 383.3, 1.5, 79.58);
  box(0.36, 0.5, 0.34, INK, 384.3, 1.22, 79.3); box(0.2, 0.08, 0.2, RED, 384.3, 1.5, 79.18); cyl(0.05, 0.04, 0.09, WHITE, 384.3, 1.02, 79.15, 8); plane(label('COFFEE', INK, YEL, 256, 48, 30), 0.34, 0.07, 384.3, 1.62, 79.12);
  box(0.6, 0.34, 0.36, STEEL, 379.4, 1.14, 79.3); { const gp = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.28, 0.02), new THREE.MeshLambertMaterial({ color: '#ffe0a0', transparent: true, opacity: 0.55 })); gp.position.set(379.4, 1.15, 79.11); G.add(gp); } for (let i = 0; i < 3; i++) R0.put(new THREE.TorusGeometry(0.06, 0.022, 6, 10), 379.25 + i * 0.15, 1.12, 79.28, '#c98a4a', 0, Math.PI / 2);
  // snack rack on the counter top: 6 snacks you can pick for the SNACK order
  const SNK = [{ n: 'CHIPS', c: RED }, { n: 'CHOCOLATE', c: '#6b3f2a' }, { n: 'PRETZEL', c: '#c98a4a' }, { n: 'GUMMY BEARS', c: GREEN }, { n: 'JERKY', c: '#8a3a2a' }, { n: 'MINT GUM', c: '#5ad0ff' }], SNKX = SNK.map((_, i) => 382.55 + i * 0.32);
  box(2.1, 0.03, 0.3, WOOD, 383.35, 1.06, 76.72); box(2.1, 0.03, 0.3, WOOD, 383.35, 1.3, 76.82); for (const x of [382.3, 384.4]) box(0.03, 0.34, 0.3, WOOD, x, 1.2, 76.77);
  function snack3D(k) { const g = new THREE.Group(), c = LM(SNK[k].c); if (k === 0) { g.add(mm(Bx(0.16, 0.2, 0.06), c)); g.children[0].scale.set(1, 1, 1); g.add(mm(Bx(0.12, 0.06, 0.062), LM(YEL), 0, 0.02, 0)); }
    else if (k === 1) g.add(mm(Bx(0.18, 0.06, 0.03), c), mm(Bx(0.1, 0.062, 0.032), LM('#ffffff'), 0.02, 0, 0)); else if (k === 2) g.add(mm(new THREE.TorusGeometry(0.06, 0.022, 6, 10), c, 0, 0, 0, Math.PI / 2));
    else if (k === 3) g.add(mm(Bx(0.13, 0.16, 0.05), c), mm(Sp(0.025), LM(RED), 0, 0.02, 0.03)); else if (k === 4) g.add(mm(Bx(0.08, 0.2, 0.03), c), mm(Bx(0.08, 0.04, 0.032), LM(YEL), 0, 0.06, 0)); else g.add(mm(Bx(0.12, 0.05, 0.03), c), mm(Bx(0.12, 0.012, 0.032), LM('#ffffff'), 0, 0, 0));
    G.add(g); return g; }
  const RACK = SNK.map((_, k) => { const g = snack3D(k); g.position.set(SNKX[k], k % 2 ? 1.42 : 1.18, k % 2 ? 76.82 : 76.72); return g; });
  const BAG = new THREE.Group(); BAG.add(mm(Bx(0.26, 0.3, 0.16), LM('#c9a77a'), 0, 0.15, 0)); BAG.add(mm(Bx(0.1, 0.1, 0.002), LM(RED), 0, 0.18, 0.082)); BAG.position.set(381.15, 1.05, 76.55); G.add(BAG);
  // ================= ICE CHEST, MAP RACK, AIR FRESHENERS, JOBS BOARD, OVERALLS HOOK =================
  box(1.3, 0.85, 0.7, WHITE, 379.3, 0.43, 69.1); box(1.32, 0.12, 0.72, BLUE, 379.3, 0.8, 69.1); plane(label('ICE · 2 G', BLUE, '#ffffff', 256, 64, 36), 0.8, 0.2, 379.3, 0.5, 69.46); rect(378.6, 380.0, Z0, 69.5);
  box(0.5, 1.5, 0.3, DARK, 379.0, 0.75, 71.6); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) box(0.18, 0.24, 0.02, [BLUE, GREEN, RED, YEL][(i + j) % 4], 378.9 + j * 0.21, 0.5 + i * 0.3, 71.76, 0, -0.15); plane(label('MAPS', INK, '#ffffff', 128, 48, 28), 0.4, 0.12, 379.0, 1.58, 71.76); rect(378.7, 379.3, 71.4, 71.8);
  { cyl(0.02, 0.02, 0.5, STEEL, 384.1, 1.3, 76.45, 6); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; R0.put(Co(0.05, 0.12, 3), 384.1 + Math.cos(a) * 0.07, 1.3 + (i % 3) * 0.12, 76.45 + Math.sin(a) * 0.07, [GREEN, '#3f7a52', YEL][i % 3]); } }
  const DOING = [['fill', 'FILL UP'], ['screen', 'WINDSCREEN'], ['oil', 'OIL CHECK'], ['tyres', 'TYRE PRESSURE'], ['wash', 'CAR WASH'], ['snack', 'SNACKS + SLUSHIE'], ['flat', 'CHANGE A FLAT'], ['tow', 'TOW CALL-OUT'], ['stock', 'RESTOCK']];
  const doneMap = () => { const d = save.stat('gsDone', null); return d && typeof d === 'object' ? d : {}; };
  const jobsFn = (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, 60); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.font = '900 32px Archivo, sans-serif'; g.fillText("BOLT'S JOBS TODAY", 16, 32); const d = doneMap();
    DOING.forEach(([k, n], i) => { const y = 84 + i * 38; g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(18, y - 13, 26, 26); if (d[k]) { g.strokeStyle = GREEN; g.lineWidth = 7; g.beginPath(); g.moveTo(22, y); g.lineTo(30, y + 9); g.lineTo(44, y - 13); g.stroke(); } g.fillStyle = INK; g.font = '800 24px Archivo, sans-serif'; g.fillText(n, 58, y + 2); });
    g.fillStyle = d.full ? GREEN : '#9a948c'; g.font = '900 20px Archivo, sans-serif'; g.fillText(d.full ? 'FULL SHIFT DONE · TOP MECHANIC!' : 'ALL 9 = FULL SHIFT BONUS', 18, H - 18); };
  const jobsTex = CT(512, 448, jobsFn); box(0.06, 1.6, 1.84, INK, X0 + 0.06, 1.85, 70.2); plane(jobsTex, 1.76, 1.54, X0 + 0.1, 1.85, 70.2, Math.PI / 2);
  cyl(0.03, 0.03, 0.2, STEEL, X0 + 0.12, 2.0, 77.9, 6, 0, Math.PI / 2); const hookOv = new THREE.Group(); hookOv.add(mm(Bx(0.5, 0.9, 0.12), LM(NAVY), 0, -0.48, 0), mm(Bx(0.12, 0.5, 0.13), LM('#243b56'), -0.12, -0.2, 0), mm(Bx(0.12, 0.5, 0.13), LM('#243b56'), 0.12, -0.2, 0), mm(Bx(0.16, 0.08, 0.14), LM(RED), 0.1, -0.6, 0.01)); hookOv.position.set(X0 + 0.16, 2.0, 77.9); hookOv.rotation.y = Math.PI / 2; G.add(hookOv);
  plane(label('MY OVERALLS', INK, YEL, 256, 48, 30), 0.6, 0.12, X0 + 0.08, 2.25, 77.9, Math.PI / 2);
  // ================= THE CARS (a merged painted shell + 4 wheels each) =================
  const CARC = ['#2e86b8', '#3f9a5e', '#ffd23a', '#c75b9b', '#f28c28', '#ec3013', '#f3f2f2', '#6f8f9a'];
  const CAB = (() => { const sh = new THREE.Shape(); sh.moveTo(-1.25, 0.87); sh.lineTo(0.85, 0.87); sh.lineTo(0.38, 1.48); sh.lineTo(-1.0, 1.48); sh.closePath(); const g = new THREE.ExtrudeGeometry(sh, { depth: 1.7, bevelEnabled: false }); g.rotateY(-Math.PI / 2); g.translate(0.85, 0, 0); return g; })();
  const MCARS = meruCars(THREE); function mkCar(par, opt = {}) { return MCARS.mkCar(par, opt); }   /* s679 the ONE shared Meru car (engine/meru-cars.js) */
  const rot = (C, lx, ly, lz) => V(lx, ly, lz).applyEuler(C.g.rotation).add(C.g.position);   // car-local point → world
  // pump 1 car (FILL UP) · pump 2 car (WINDSCREEN · OIL · TYRES) · the north-lot car (CHANGE A FLAT) · the wash car (only during a wash)
  const carA = mkCar(G, { col: CARC[0] }); carA.g.position.set(370, 0, 66.0); carA.g.rotation.y = -Math.PI / 2;
  const carB = mkCar(G, { col: CARC[1], hood: true, screen: true }); carB.g.position.set(370, 0, 80.0); carB.g.rotation.y = -Math.PI / 2;
  const carC = mkCar(G, { col: CARC[3] }); carC.g.position.set(386.5, 0, 63.0); carC.g.rotation.y = -Math.PI / 2;
  const carW = mkCar(G, { col: CARC[4] }); carW.g.position.set(377.2, 0, 82.6); carW.g.rotation.y = Math.PI / 2; carW.g.visible = false;
  const colA = rect(367.9, 372.1, 65.05, 66.95), colB = rect(367.9, 372.1, 79.05, 80.95), colC = rect(384.4, 388.6, 62.05, 63.95);
  // fuel door (pump 1 car, left rear) + the pump's two nozzles + its live display
  const FUEL = new THREE.Group(); FUEL.add(mm(Bx(0.02, 0.18, 0.18), LM(CARC[0]), 0, 0, 0.09)); FUEL.position.set(0.962, 0.82, -1.62); carA.g.add(FUEL); const CAPM = mm(Cy(0.05, 0.05, 0.04, 10), LM(DARK), 0.95, 0.82, -1.53, 0, 0, Math.PI / 2); carA.g.add(CAPM);
  const FUELW = () => rot(carA, 1.0, 0.82, -1.53);
  const NOZ = [{ n: 'UNLEADED', c: GREEN }, { n: 'DIESEL', c: YEL }].map((o, i) => { const g = new THREE.Group(); g.add(mm(Bx(0.07, 0.16, 0.06), LM(o.c)), mm(Cy(0.015, 0.015, 0.18, 6), LM(STEEL), 0, 0.02, -0.1, Math.PI / 2)); const home = V(370.5, 1.12, 67.95 + i * 0.42); g.position.copy(home); g.rotation.y = Math.PI / 2; G.add(g);
    const hose = mkHose(INK, 0.022); hose.set(V(370.46, 1.5, 67.95 + i * 0.42), home, 0.3); return { ...o, g, home, hose, top: V(370.46, 1.5, 67.95 + i * 0.42) }; });
  box(0.04, 0.14, 0.62, INK, 370.47, 1.12, 68.16); plane(label('U · D', INK, '#ffffff', 128, 48, 30), 0.3, 0.1, 370.47, 0.92, 68.16, Math.PI / 2);
  let pumpRd = { l: 0, cr: 0, on: false }; const pumpFn = (g, W, H) => { g.fillStyle = '#0d1a14'; g.fillRect(0, 0, W, H); g.fillStyle = pumpRd.on ? '#7cff9b' : '#3f6a4f'; g.textBaseline = 'middle'; g.font = '900 30px Archivo, sans-serif'; g.fillText('LITRES  ' + pumpRd.l.toFixed(1), 14, 34); g.fillText('CREDITS ' + pumpRd.cr.toFixed(2), 14, 82); };
  const pumpTex = CT(256, 112, pumpFn); plane(pumpTex, 0.5, 0.22, 370.47, 1.55, 68.16, Math.PI / 2);
  const SPLASH = mm(new THREE.CircleGeometry(0.4, 16), new THREE.MeshBasicMaterial({ color: '#5a4a2a', transparent: true, opacity: 0.5, depthWrite: false }), 371.2, 0.03, 67.2, -Math.PI / 2); SPLASH.visible = false; G.add(SPLASH);
  // pump-2 car: the dirty WINDSCREEN (canvas, rubbed clean) + BONNET + DIPSTICK
  const SCR = { tex: CT(512, 256, () => {}), cells: new Uint8Array(128) };
  const screenM = new THREE.Mesh(new THREE.PlaneGeometry(1.54, 0.72), new THREE.MeshBasicMaterial({ map: SCR.tex, transparent: true, depthWrite: false })); screenM.position.set(0, 1.185, 0.628); screenM.rotation.set(-0.695, 0, 0, 'YXZ'); screenM.renderOrder = 3; carB.g.add(screenM);
  const HOOD = new THREE.Group(); HOOD.position.set(0, 0.88, 0.85); { const lid = mm(Bx(1.86, 0.04, 1.24), LM(CARC[1]), 0, 0, 0.62); HOOD.add(lid); HOOD.userData.lid = lid; } carB.g.add(HOOD);
  const DIP = new THREE.Group(); { DIP.add(mm(new THREE.TorusGeometry(0.035, 0.012, 6, 12), LM(YEL), 0, 0.03, 0, Math.PI / 2), mm(Cy(0.007, 0.007, 0.6, 5), LM(STEEL), 0, -0.3, 0)); const oilB = mm(Cy(0.011, 0.011, 1, 5), LM('#4a3410'), 0, -0.6, 0); DIP.add(oilB); DIP.userData.oil = oilB;
    for (const y of [-0.5, -0.56]) DIP.add(mm(Cy(0.012, 0.012, 0.006, 6), LM(INK), 0, y, 0)); } DIP.position.set(0.3, 0.82, 1.6); carB.g.add(DIP);
  const OILCAN = new THREE.Group(); OILCAN.add(mm(Bx(0.16, 0.26, 0.1), LM(YEL), 0, 0.13, 0), mm(Bx(0.16, 0.08, 0.102), LM(INK), 0, 0.14, 0), mm(Cy(0.02, 0.02, 0.08, 6), LM(INK), 0.04, 0.3, 0)); const OILH = V(366.9, 0.04, 81.4); OILCAN.position.copy(OILH); G.add(OILCAN);
  box(0.5, 0.3, 0.4, '#5a5654', 366.4, 0.15, 81.6); for (let i = 0; i < 3; i++) box(0.12, 0.2, 0.08, YEL, 366.25 + i * 0.15, 0.4, 81.6);
  const POUR = mm(Cy(0.012, 0.012, 1, 5), LM('#c9a020'), 0, 0, 0); POUR.visible = false; G.add(POUR);
  // squeegee bucket (pump 2 island) + the sponge / squeegee tools
  cyl(0.18, 0.15, 0.32, BLUE, 368.05, 0.16, 77.3, 12); cyl(0.17, 0.17, 0.02, '#cfe8f0', 368.05, 0.3, 77.3, 12);
  const SPONGE = mm(Bx(0.16, 0.06, 0.1), LM(YEL)); SPONGE.visible = false; G.add(SPONGE);
  const SQG = new THREE.Group(); SQG.add(mm(Bx(0.36, 0.05, 0.03), LM(INK)), mm(Cy(0.015, 0.015, 0.4, 6), LM(STEEL), 0, 0.22, 0)); SQG.visible = false; G.add(SQG);
  // tyres: the AIR pump's hose reaches the pump-2 car, a valve cap ring per wheel
  const AIRP = V(376.75, 0.9, 79.1), airHose = mkHose(INK, 0.02); airHose.m.visible = false;
  const VALVE = mm(Cy(0.02, 0.02, 0.04, 6), LM(RED)); VALVE.visible = false; G.add(VALVE);
  // CHANGE A FLAT: jack, wrench, hubcap tray, spare, tyre pile (north wall)
  const JACK = new THREE.Group(); JACK.add(mm(Bx(0.5, 0.08, 0.22), LM(RED), 0, 0.04, 0), mm(Bx(0.08, 0.2, 0.08), LM(STEEL), 0, 0.18, 0), mm(Bx(0.18, 0.04, 0.12), LM(DARK), 0, 0.3, 0), mm(Cy(0.012, 0.012, 0.6, 5), LM(STEEL), 0.3, 0.12, 0, 0, 0, 1.3)); const JACKH = V(387.2, 0, 65.6), JACKU = V(387.2, 0, 63.98); JACK.position.copy(JACKH); G.add(JACK);
  const WRENCH = new THREE.Group(); WRENCH.add(mm(Bx(0.04, 0.03, 0.34), LM(STEEL), 0, 0, 0.17), mm(Cy(0.03, 0.03, 0.05, 6), LM(STEEL), 0, 0, 0, Math.PI / 2)); WRENCH.visible = false; G.add(WRENCH);
  cyl(0.24, 0.24, 0.04, STEEL, 388.6, 0.04, 65.3, 14); const TRAY = V(388.6, 0.09, 65.3);
  for (let i = 0; i < 4; i++) cyl(0.36, 0.36, 0.26, INK, 390.7, 0.13 + i * 0.27, 67.5, 14); for (let i = 0; i < 4; i++) cyl(0.2, 0.2, 0.27, '#5a5654', 390.7, 0.13 + i * 0.27, 67.5, 10); cols.push({ c: [390.7, 67.5, 0.42] });
  const SPARE = new THREE.Group(); SPARE.add(mm(Cy(0.36, 0.36, 0.26, 16), LM(INK), 0, 0, 0, 0, 0, Math.PI / 2), mm(Cy(0.2, 0.2, 0.27, 12), LM(STEEL), 0, 0, 0, 0, 0, Math.PI / 2)); const SPAREH = V(384.2, 0.37, 67.72); SPARE.position.copy(SPAREH); SPARE.rotation.set(0.25, Math.PI / 2, 0); G.add(SPARE);
  plane(label('TYRES · FLATS FIXED', INK, YEL, 512, 64, 32), 2.0, 0.25, 388.2, 2.6, Z0 - 0.42, Math.PI);
  // ================= CAR WASH (spinning brushes over the static ones, soap / rinse / wax arches, dryers, kiosk) =================
  const WZ = 82.6, STG = { soap: 379.1, brush: 381.3, rinse: 385.5, wax: 387.1, dry: 389.2, out: 395.5 };
  const brushT = CT(64, 128, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#2e86b8' : '#f3f2f2'; g.fillRect(i * 8, 0, 8, H); } }); brushT.wrapS = THREE.RepeatWrapping; brushT.repeat.set(3, 1);
  const BR = [81.1, 84.1].map(z => { const m = mm(Cy(0.64, 0.64, 2.9, 16), new THREE.MeshLambertMaterial({ map: brushT }), 380.2, 1.7, z); G.add(m); return m; });
  const ROLL = mm(Cy(0.49, 0.49, 3.3, 16), new THREE.MeshLambertMaterial({ map: brushT }), 382.5, 3.4, 82.6, Math.PI / 2); G.add(ROLL);
  const arch = (x, c, txt) => { for (const z of [80.45, 84.75]) box(0.16, 3.3, 0.16, c, x, 1.65, z); box(0.18, 0.18, 4.46, c, x, 3.3, WZ); for (let i = 0; i < 6; i++) box(0.06, 0.08, 0.06, INK, x, 3.18, 80.9 + i * 0.75); plane2(label(txt, c, '#ffffff', 256, 48, 30), 0.9, 0.17, x, 3.55, WZ, Math.PI / 2); };
  arch(STG.soap, '#c75b9b', 'SOAP'); arch(STG.rinse, BLUE, 'RINSE'); arch(STG.wax, '#f28c28', 'WAX');
  for (const z of [80.7, 84.5]) { box(0.6, 0.5, 0.6, STEEL, STG.dry, 2.8, z); box(0.5, 0.04, 0.5, INK, STG.dry, 2.54, z); } box(0.6, 0.4, 3.0, STEEL, STG.dry, 3.3, WZ); plane2(label('DRY', INK, '#ffffff', 128, 48, 30), 0.6, 0.17, STG.dry, 3.65, WZ, Math.PI / 2);
  box(0.6, 1.3, 0.5, RED, 376.3, 0.65, 86.0); box(0.46, 0.34, 0.02, '#5fa8c8', 376.3, 1.05, 85.74); plane(label('WASH · PAY HERE', RED, '#ffffff', 256, 48, 26), 0.6, 0.12, 376.3, 1.42, 85.74); cols.push({ c: [376.3, 86.0, 0.4] });
  const MUD = [], FOAM = []; { const mudM = LM('#6b4a2a'), foamM = LM('#ffffff'); let s = 5; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 14; i++) { const sx = r() > 0.5 ? 1 : -1, z = -1.9 + r() * 3.8, y = 0.45 + r() * 0.42; const m = mm(Sp(0.1 + r() * 0.08, 8, 5), mudM, sx * 0.94, y, z); m.scale.set(0.3, 0.8 + r() * 0.5, 1.2 + r()); carW.g.add(m); MUD.push(m); }
    for (let i = 0; i < 20; i++) { const sx = r() > 0.5 ? 1 : -1, top = i % 3 === 0, z = -1.8 + r() * 3.6; const m = mm(Sp(0.15 + r() * 0.1, 8, 5), foamM, top ? (r() - 0.5) * 1.2 : sx * 0.95, top ? 1.5 : 0.5 + r() * 0.5, z); m.scale.set(top ? 1 : 0.5, 0.6, 1); m.visible = false; carW.g.add(m); FOAM.push(m); } }
  // ================= THE TOW TRUCK (BOLT'S TOWING) + the call-out car =================
  const TRK = new THREE.Group(); TRK.rotation.order = 'YXZ'; GT.add(TRK);
  { const R = mk(); R.box(2.2, 0.5, 6.0, DARK, 0, 0.6, 0); R.box(2.1, 1.5, 1.9, RED, 0, 1.55, 1.95); R.box(2.1, 0.9, 1.0, RED, 0, 1.25, 3.35 - 0.6); R.box(2.12, 0.12, 2.9, WHITE, 0, 1.5, 2.4); R.box(1.9, 0.6, 0.04, GLASS, 0, 1.95, 2.92, 0, -0.2); for (const s of [-1, 1]) R.box(0.02, 0.55, 1.0, GLASS, s * 1.06, 1.95, 2.1);
    R.box(2.2, 0.12, 3.8, '#5a5654', 0, 0.9, -1.0); for (const s of [-1, 1]) R.box(0.08, 0.4, 3.8, RED, s * 1.06, 1.1, -1.0); R.box(2.24, 0.24, 0.2, YEL, 0, 0.55, 3.0); for (const s of [-1, 1]) { R.box(0.3, 0.16, 0.04, '#fff6c8', s * 0.75, 1.15, 3.11); R.box(0.26, 0.14, 0.04, RED, s * 0.85, 0.75, -3.0); }
    R.box(0.3, 1.6, 0.3, STEEL, 0, 1.75, -2.5, 0, -0.4); R.box(0.24, 0.24, 1.2, STEEL, 0, 2.45, -3.0, 0, 0.35); R.cyl(0.2, 0.2, 0.7, INK, 0, 1.2, -2.2, 10, 0, Math.PI / 2); R.box(1.9, 0.12, 0.3, YEL, 0, 3.0 - 0.6 + 0.02, 1.95);
    for (const s of [-1, 1]) for (const z of [2.0, -1.9]) { R.cyl(0.46, 0.46, 0.34, INK, s * 0.96, 0.46, z, 16, 0, Math.PI / 2); R.cyl(0.26, 0.26, 0.35, STEEL, s * 0.96, 0.46, z, 10, 0, Math.PI / 2); }
    TRK.add(subMesh(R)); for (const s of [-1, 1]) { const t = label("BOLT'S TOWING", WHITE, RED, 512, 96, 52); const p = mm(new THREE.PlaneGeometry(1.5, 0.3), new THREE.MeshBasicMaterial({ map: t }), s * 1.062, 1.25, 1.9, 0, s * Math.PI / 2, 0); TRK.add(p); } }
  const BLINK = [-0.6, 0, 0.6].map(x => { const m = mm(Bx(0.36, 0.14, 0.24), new THREE.MeshBasicMaterial({ color: '#7a4a10' }), x, 2.52, 1.95); TRK.add(m); return m; });
  const TIP = V(0, 2.62, -3.55), THOOK = new THREE.Group(); THOOK.add(mm(new THREE.TorusGeometry(0.07, 0.018, 6, 12, Math.PI * 1.4), LM(STEEL), 0, 0, 0, 0, 0, 2.6), mm(Bx(0.05, 0.12, 0.05), LM(STEEL), 0, 0.1, 0)); GT.add(THOOK); const towCable = mkHose(INK, 0.015, GT);
  const CHAINS = [0, 1].map(() => { const m = mm(Cy(0.015, 0.015, 1, 5), LM(STEEL)); m.visible = false; GT.add(m); return m; });
  const carT = mkCar(GT, { col: CARC[7] }); carT.g.visible = false; const HAZ = [-1, 1].map(s => { const m = mm(Bx(0.2, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: '#7a4a10' }), s * 0.75, 0.9, 2.13); carT.g.add(m); return m; });
  const TRK_HOME = { x: 391, z: 60.5, yaw: -Math.PI / 2 }; const trkCol = { f: [388, 394, 59.4, 61.6] }; cols.push(trkCol);
  const placeTruck = (x, z, yaw) => { TRK.position.set(x, 0, z); TRK.rotation.y = yaw; const s = Math.abs(Math.sin(yaw)) > 0.7; trkCol.f = s ? [x - 3, x + 3, z - 1.1, z + 1.1] : [x - 1.1, x + 1.1, z - 3, z + 3]; };
  placeTruck(TRK_HOME.x, TRK_HOME.z, TRK_HOME.yaw);
  const trkW = l => V(l.x, l.y, l.z).applyEuler(TRK.rotation).add(TRK.position);
  // ================= BOLT (the mechanic) =================
  const BL = { fur: '#b5522a', furDark: '#7f3618', muzzle: '#f6e2cc', snout: '#f0d8bc', chin: '#fff4e6', fluff: '#fff4e6' };
  const OVR = ['#2e4a6b', '#243b56', '#1a2a3e'];
  function capOn(head, y = 0.38) { const g = new THREE.Group(); g.add(mm(new THREE.SphereGeometry(0.16, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM(RED), 0, 0, 0), mm(Bx(0.2, 0.02, 0.14), LM(RED), 0, 0.005, -0.16), mm(Bx(0.06, 0.03, 0.02), LM(WHITE), 0, 0.08, 0.15)); g.position.set(0, y, -0.02); head.add(g); g.traverse(o => { o.renderOrder = 2; }); return g; }
  const bolt = kit.makeFox({ key: 'boltGas', torso: OVR, outfit: 'vest', mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: BL }); bolt.scale.multiplyScalar(1.12);
  { const P = bolt.userData && bolt.userData.P; if (P && P.head) capOn(P.head); if (P && P.body) { const w = new THREE.Group(); w.add(mm(Bx(0.03, 0.22, 0.02), LM(STEEL)), mm(Bx(0.07, 0.05, 0.02), LM(STEEL), 0, 0.12, 0)); w.position.set(-0.12, 0.95, 0.24); P.body.add(w); const rag = mm(Bx(0.1, 0.14, 0.02), LM(RED), 0.12, 0.7, -0.24); P.body.add(rag); }
    if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; }
  G.add(bolt); const bCol = { c: [0, 0, 0.5] }; cols.push(bCol);
  const KS = { idle: [383.6, 78.3, Math.PI], fill: [367.4, 69.3, 2.2], screen: [366.8, 82.6, 2.6], oil: [366.6, 82.9, 2.6], tyres: [374.4, 82.4, -2.2], wash: [375.2, 86.4, 1.0], snack: [385.2, 77.7, -2.0], flat: [390.4, 63.2, -1.4], tow: [388.6, 57.6, -1.0], stock: [386.0, 70.4, 1.2] };
  const placeK = g => { const a = KS[g] || KS.idle; bolt.position.set(a[0], 0, a[1]); bolt.rotation.y = bolt.userData.face0 = a[2]; bCol.c[0] = a[0]; bCol.c[1] = a[1]; }; placeK('idle');
  const bT = { key: 'boltGas', obj: bolt, ry: 0, r: 3.0 }, endB = { key: 'boltEnd', obj: bolt, ry: 0, r: 60 };
  const lb = text => ({ who: 'BOLT', role: 'MECHANIC', text }), lx = (who, text) => ({ who, role: 'CUSTOMER', text });
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ================= customers (town foxes, made the first time they are needed) =================
  const CUS = [{ name: 'PELL', look: { fur: '#c9743a', furDark: '#9a5426', muzzle: '#f6e2cc' }, torso: ['#5a8ac8', '#3d6aa0', '#2a4a70'], outfit: 'vest' },
    { name: 'FLICK', look: { fur: '#e07a30', furDark: '#b05a1e', muzzle: '#fff0e0' }, torso: [YEL, '#c9a020', '#8a6a10'], outfit: 'vest' },
    { name: 'KIA', look: { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, torso: ['#c75b9b', '#9a4078', '#6a2a50'], outfit: 'dress' },
    { name: 'OTTO', look: { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, torso: ['#3f9a5e', '#2e7a48', '#1f5a34'], outfit: 'suit' },
    { name: 'MARLA', look: { fur: '#b07a5a', furDark: '#80563c', muzzle: '#f4e4d8', lashes: 1 }, torso: ['#e8e0f0', '#c8c0d8', '#a8a0b8'], outfit: 'dress' },
    { name: 'MICHAEL JAY', look: { fur: '#5a4a3a', furDark: '#3a2e22', muzzle: '#e0d4c4' }, torso: [RED, '#b8250f', '#7a1808'], outfit: 'vest' }];
  const cf = [];
  const mkP = (key, o, par = G) => { const f = kit.makeFox({ key, torso: o.torso, outfit: o.outfit, mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: o.look }); const P = f.userData && f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; const H = new THREE.Group(); H.add(f); H.visible = false; par.add(H); return { H, f, P, name: o.name }; };
  const cus = i => cf[i % 6] || (cf[i % 6] = mkP('gsCus' + (i % 6), CUS[i % 6]));
  const standAt = (p, x, z, yaw) => { p.H.visible = true; p.H.position.set(x, 0, z); p.H.rotation.y = yaw; };
  const hideC = () => cf.forEach(p => { if (p) p.H.visible = false; });
  const cT = { key: 'gsCus', obj: bolt, ry: 0, r: 60 }; const sayC = (p, lines, then) => { cT.obj = p.H; sayTo(cT, lines.map(t => lx(p.name, t)), then || null, true); };
  // ================= state, toast, sound =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, towCool = 0, towLeft = null, lastP = null, K = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.9); tone(2093, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), clunk = () => { tone(110, 0.12, 0.15, 'square'); tone(70, 0.1, 0.2, 'sine', 0.05); },
    hiss = () => tone(3000, 0.012, 0.25, 'sawtooth', 0, 1800), gulp = () => tone(220, 0.04, 0.12, 'sine', 0, 160), horn = () => { if (isMuted() || WS.play('car-horn', 0.7)) return; tone(392, 0.06, 0.35, 'square'); tone(494, 0.05, 0.35, 'square'); }, cheer = () => { tone(784, 0.05, 0.3); tone(988, 0.05, 0.3, 'sine', 0.1); tone(1175, 0.05, 0.4, 'sine', 0.2); };
  // ================= prizes + what you wear =================
  const CUR = { outfit: 'vest', torso: OVR, name: 'MECHANIC OVERALLS' };
  const ownOv = () => !!save.stat('gsOveralls', false), ovOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === CUR.name); };
  const putOn = on => { if (on) { if (!ovOn()) save.setStat('gsPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(CUR); wear && wear(CUR); } else { const p = save.stat('gsPrevOutfit', null), o = p && p.name !== CUR.name ? p : null; save.setOutfit(o); wear && wear(o); } };
  function giveGift() { const n = save.stat('gsClears', 0) + 1; save.setStat('gsClears', n);
    if (!ownOv()) { save.setStat('gsOveralls', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === CUR.name)) save.setStat('tailorOutfits', [...list, CUR]); putOn(true); return { kind: 'ov', label: 'MECHANIC OVERALLS + CAP' }; }
    if (!save.stat('gsSlush1', false)) { save.setStat('gsSlush1', true); save.give('slushie'); save.give('slushie'); return { kind: 'slush', label: 'SLUSHIE ×2' }; }
    if (n % 3 === 0) { save.give('slushie'); return { kind: 'slush1', label: 'SLUSHIE' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const on = ownOv() && ovOn(), key = on ? 1 : 0;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; if (on && U.P.head) worn.parts.push(capOn(U.P.head)); } }
  // ================= card (Modernist) — LEFT, same spot as the other shops =================
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head2 = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const bar = (k, c = '#ffd23a', band) => '<div style="height:14px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative">' + (band ? '<div style="position:absolute;top:0;bottom:0;left:' + Math.round(band[0] * 100) + '%;width:' + Math.max(2, Math.round((band[1] - band[0]) * 100)) + '%;background:#bfe6c8"></div>' : '') + '<div style="position:absolute;left:0;top:3px;bottom:3px;width:' + Math.round(clamp(k, 0, 1) * 100) + '%;background:' + c + '"></div>' + (band ? '<div style="position:absolute;top:-2px;bottom:-2px;width:2px;background:#201e1d;left:' + Math.round((band[0] + band[1]) / 2 * 100) + '%"></div>' : '') + '</div>';
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
  addEventListener('pointermove', e => { if (!busy || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); if (busy === 'job') drag(); ptr.lx = ptr.x; ptr.ly = ptr.y; }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700), MIN = () => Math.min(innerWidth, innerHeight);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearest = (list, f, lim) => { let b = -1, bd = lim; list.forEach((o, i) => { const d = dist(scrW(f(o, i))); if (d < bd) { bd = d; b = i; } }); return b; };
  const RC = new THREE.Raycaster(), NDC = new THREE.Vector2(), PL0 = new THREE.Plane();
  const setRay = () => { NDC.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); RC.setFromCamera(NDC, camera); };
  const onPlane = (n, p0) => { setRay(); PL0.setFromNormalAndCoplanarPoint(n, p0); const o = V(); return RC.ray.intersectPlane(PL0, o) ? o : null; };
  const camPlane = p0 => { const n = V(); camera.getWorldDirection(n); return onPlane(n.negate(), p0); };
  const FLIES = []; function fly(obj, to, dur, arc, then) { FLIES.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of FLIES.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { FLIES.splice(FLIES.indexOf(F), 1); F.then && F.then(); } } }
  const PART = []; for (let i = 0; i < 40; i++) { const m = mm(Sp(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: YEL, transparent: true })); m.visible = false; scene.add(m); PART.push({ m, v: V(), life: 0 }); }
  const burst = (p, n, col, sp = 0.8, up = 1) => { let k = 0; for (const q of PART) { if (q.life > 0) continue; q.m.visible = true; q.m.material.color.set(col); q.m.position.copy(p); q.v.set(rnd(-1, 1), rnd(0.2, 1.4) * up, rnd(-1, 1)).multiplyScalar(sp); q.life = rnd(0.5, 0.9); if (++k >= n) break; } };
  const partTick = dt => { for (const q of PART) { if (q.life <= 0) continue; q.life -= dt; q.m.position.addScaledVector(q.v, dt); q.v.y -= dt * 1.4; q.m.material.opacity = clamp(q.life * 1.6, 0, 1); if (q.life <= 0) q.m.visible = false; } };
  const HI = mkRing(0.1, 0.02), HI2 = mkRing(0.16, 0.025);   // the yellow "tap here" rings
  const hi = (r, p, face) => { r.visible = true; r.position.copy(p); r.scale.setScalar(1 + 0.15 * Math.sin(performance.now() / 120)); if (face) r.lookAt(camera.position); };
  // ================= station rings =================
  const SPOT = { fill: { x: 372.9, z: 67.1, r: 1.0 }, screen: { x: 367.2, z: 78.5, r: 0.9 }, oil: { x: 365.9, z: 80.0, r: 0.9 }, tyres: { x: 373.5, z: 81.6, r: 1.0 }, wash: { x: 375.9, z: 84.8, r: 1.0 }, snack: { x: 382.2, z: 78.1, r: 0.85 },
    flat: { x: 389.6, z: 65.9, r: 0.9 }, tow: { x: 391.0, z: 58.0, r: 1.1 }, stock: { x: 388.0, z: 70.0, r: 0.9 }, hook: { x: 379.3, z: 77.9, r: 0.8 } };
  const RS = {}; for (const k in SPOT) { const s = SPOT[k], m = mm(new THREE.TorusGeometry(s.r * 0.75, 0.06, 6, 28), ringM, s.x, 0.1, s.z, Math.PI / 2); m.renderOrder = 3; (k === 'tow' ? GT : G).add(m); RS[k] = m; }
  // ================= SHORT GAMES =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const GN = Object.fromEntries(DOING);
  const PARTS = { fill: ['CAR 1', 'CAR 2'], screen: ['SPONGE', 'SQUEEGEE'], oil: ['CAR 1', 'CAR 2'], tyres: ['1', '2', '3', '4'], wash: ['PICK', 'SOAP', 'BRUSH', 'RINSE', 'DRY'], snack: ['1', '2'], flat: ['JACK', 'NUTS', 'SWAP', 'STAR', 'LOWER'], tow: ['DRIVE', 'HOOK', 'LIFT', 'CHAINS', 'TOW'], stock: ['SHELVES', 'FACE'] };
  const INTRO = {
    fill: n => [lb(n ? 'Pump one, chief. Right fuel, right amount, and no puddles.' : 'Pump one! Tap the flap, pick their nozzle, hold to pump. Let go on the line.')],
    screen: n => [lb(n ? 'Bugs again! Sponge it all over, then squeegee it clear.' : 'Every bug in Meru ends up here. Sponge the whole glass, then drag the squeegee across.')],
    oil: n => [lb(n ? 'Oil check. Pop the bonnet, pull the stick, read it, sort it.' : 'Oil check! Latch, pull the stick, read it. Brown below the bottom mark means LOW.')],
    tyres: n => [lb(n ? 'Tyres! Four of them. Usually.' : 'Tap the valve, hold to pump, let go in the green. Too much? Tap to let some out.')],
    wash: n => [lb(n ? 'Car wash! Check what they paid for first.' : 'Best job here! Pick their wash, hold for soap, rub to brush, hold to rinse, tap to dry.')],
    snack: n => [lb(n ? 'Counter time. Snacks in the bag, slushie in the cup.' : 'Tap their two snacks, the cup size, the flavour. Hold the lever, let go on the line.')],
    flat: n => [lb(n ? 'Another flat! Jack, nuts, swap, star, down.' : 'Flat tyre! Jack it up, nuts off, swap the wheel. Tighten in a STAR: across, not round.')],
    tow: n => [lb(n ? 'Phone\u2019s ringing! Another breakdown on the Arena Road. Truck\u2019s yours, chief.' : 'Breakdown on the Arena Road! Hold to drive the truck. Hook, lift, chain, bring it home.')],
    stock: n => [lb(n ? 'Delivery\u2019s in! Fill the gaps, then tidy up.' : 'Delivery day! Drag each thing to the gap that is its shape. Cold ones in the fridge!')] };
  const inStation = P => P.x > 360 && P.x < 397 && P.z > 55 && P.z < 90 && (P.y || 0) < 6;
  const nextCus = () => { const n = save.stat('gsCusN', 0); save.setStat('gsCusN', n + 1); return cus(n); };
  function startGame(g) { if (busy) return false; if (g === 'tow' && towCool > 0) { toast('THE TRUCK IS BACK IN A MOMENT', 1.6); return false; } const vk = 'gsN_' + g, n = save.stat(vk, 0); save.setStat(vk, n + 1); save.setStat('gsVisits', save.stat('gsVisits', 0) + 1);
    J = { g, step: 0, sub: 'intro', gold: 0, pause: 0, t: 0, clean: 0, miss: 0, held: null, n }; busy = 'job'; placeK(g); hideC(); pop(); sayTo(bT, INTRO[g](n), null, true); NEXT('intro', BEGIN[g], n ? 1.4 : 2.6); return true; }
  const repaint = (C, c) => { C.paint(c); if (C === carA) FUEL.children[0].material = LM(c); if (C === carB) HOOD.userData.lid.material = LM(c); };
  function carSwap(C, x0, z0, then) { J.sub = 'swap'; const g = C.g; hideC(); fly(g, V(x0 - 10, 0, z0), 1.0, 0, () => { repaint(C, pick(CARC.filter(c => c !== C.col))); g.position.set(x0 + 6, 0, z0); fly(g, V(x0, 0, z0), 1.0, 0, then); }); }
  // ---- FILL UP: flap · nozzle · hold to the line · flap shut (2 cars) ----
  const ORD_F = [{ n: 'FILL IT UP', k: 1.0 }, { n: 'THREE QUARTERS', k: 0.75 }, { n: 'HALF A TANK', k: 0.5 }];
  function beginFill() { J.step++; J.sub = 'cap'; J.p = nextCus(); standAt(J.p, 368.4, 64.5, 0.4); J.fuel = Math.random() < 0.6 ? 0 : 1; J.ord = pick(ORD_F); J.lv0 = J.lv = rnd(0.08, 0.2); J.ok = false; J.perfect = false; J.wrong = 0; pumpRd = { l: 0, cr: 0, on: false }; redraw(pumpTex, pumpFn);
    sayC(J.p, [pick([NOZ[J.fuel].n.charAt(0) + NOZ[J.fuel].n.slice(1).toLowerCase() + ', ' + J.ord.n.toLowerCase() + ', please.', J.ord.n.charAt(0) + J.ord.n.slice(1).toLowerCase() + ' of ' + NOZ[J.fuel].n.toLowerCase() + ', thanks!'])]); toast('CAR ' + J.step + ' OF 2 · TAP THE FUEL FLAP', 2.2); }
  function fillPress() { const s = J.sub;
    if (s === 'cap') { if (dist(scrW(FUELW())) < RAD() * 2.4) { FUEL.rotation.y = 1.7; pop(); J.sub = 'noz'; toast('PICK THE ' + NOZ[J.fuel].n + ' NOZZLE', 1.6); } else toast('TAP THE FUEL FLAP', 1); return; }
    if (s === 'noz') { const i = nearest(NOZ, o => o.g.position, RAD() * 2.6); if (i < 0) { toast('TAP A NOZZLE ON THE PUMP', 1); return; }
      if (i !== J.fuel) { J.wrong++; J.miss++; nope(); sayTo(bT, [lb('Whoa, chief! That\u2019s ' + NOZ[i].n + '. This one drinks ' + NOZ[J.fuel].n + '. It\u2019s on the card.')], null, true); return; }
      J.sub = 'nozFly'; const N = NOZ[i]; N.g.rotation.y = 0; fly(N.g, FUELW().add(V(0, 0.02, 0.14)), 0.5, 0.25, () => { J.sub = 'fill'; tone(300, 0.05, 0.1, 'square'); toast('HOLD TO PUMP · LET GO ON THE LINE', 2); }); return; }
    if (s === 'close') { const N = NOZ[J.fuel]; if (dist(scrW(FUELW())) > RAD() * 3 && dist(scrW(N.g.position)) > RAD() * 3) { toast('TAP THE FUEL FLAP', 1); return; }
      J.sub = 'closing'; N.g.rotation.y = Math.PI / 2; fly(N.g, N.home, 0.5, 0.25, () => { FUEL.rotation.y = 0; clunk(); }); const gd = addGold(8 + (J.ok ? 2 : 0) + (J.perfect ? 4 : 0)); if (J.ok && !J.wrong) J.clean++; pumpRd.on = false; redraw(pumpTex, pumpFn);
      sayC(J.p, [pick(['Lovely. Thanks, chief!', 'Smells like a road trip. Thank you!', 'Bolt was right about you!'])]); toast('+' + gd + ' GOLD', 1.4);
      if (J.step < 2) NEXT('paid', () => { SPLASH.visible = false; carSwap(carA, 370, 66, beginFill); }, 1.6); else NEXT('paid', () => finishGame([lb(J.clean >= 2 ? 'Two tanks, right fuel, right line. You\u2019ve done this before!' : 'Two full customers. Well. The right amount of full.')]), 1.4); } }
  function fillTick(dt) { if (J.fuel == null) return; const N = NOZ[J.fuel]; N.hose.set(N.top, N.g.position.clone().add(V(0, 0.05, 0)), 0.35);
    if (J.sub === 'fill' && ptr.down && J.pause <= 0) { J.pumping = true; J.lv += 0.2 * dt; J.clk = (J.clk || 0) + dt; if (J.clk > 0.14) { J.clk = 0; tone(90 + J.lv * 90, 0.02, 0.07, 'square'); } pumpRd = { l: (J.lv - J.lv0) * 45, cr: (J.lv - J.lv0) * 135, on: true }; J.pd = (J.pd || 0) + dt; if (J.pd > 0.1) { J.pd = 0; redraw(pumpTex, pumpFn); }
      if (J.lv >= Math.min(1.02, J.ord.k + 0.07)) { J.lv = Math.min(J.lv, 1.02); J.pumping = false; SPLASH.visible = true; burst(FUELW(), 8, '#c9a020', 0.6); nope(); J.miss++; J.sub = 'close'; toast('SPLASH! TOO MUCH · TAP THE FLAP', 2); sayTo(bT, [lb('Bit of a spill there, chief. Happens to the best of us. Mostly to me.')], null, true); } } }
  function fillRelease() { if (J.sub !== 'fill' || !J.pumping) return; J.pumping = false; const d = J.lv - J.ord.k; if (Math.abs(d) <= 0.05) { J.ok = true; J.perfect = Math.abs(d) <= 0.025; ding(); J.sub = 'close'; toast((J.perfect ? 'RIGHT ON THE LINE' : 'ON THE LINE') + ' · TAP THE FLAP', 1.8); } else if (d < 0) toast('A BIT MORE · HOLD AGAIN', 1.2); }
  // ---- WINDSCREEN: sponge it all over, squeegee it clean ----
  const scrCtx = SCR.tex.userData.c.getContext('2d'), SQ = new THREE.Quaternion(), SN = V();
  function dirtyScreen() { const g = scrCtx, W = 512, H = 256; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.fillStyle = 'rgba(120,100,70,0.42)'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) { const x = rnd(30, W - 30), y = rnd(20, H - 20), r = rnd(8, 16); g.fillStyle = pick(['#6b8a2a', '#3a3010', '#8aa83a', '#a07a2a']); g.beginPath(); g.ellipse(x, y, r, r * 0.7, rnd(0, 3), 0, 7); g.fill(); g.strokeStyle = '#2a2410'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { const a = rnd(0, 6.28); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r * 1.8, y + Math.sin(a) * r * 1.8); g.stroke(); } }
    for (let i = 0; i < 2; i++) { const x = rnd(60, W - 60), y = rnd(40, H - 60); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + rnd(-18, 18), y + rnd(4, 26), rnd(3, 6), 0, 7); g.fill(); } }
    SCR.tex.needsUpdate = true; SCR.cells.fill(1); }
  dirtyScreen();
  const scrHit = () => { setRay(); const h = RC.intersectObject(screenM)[0]; return h && h.uv ? h : null; };
  function scrPaint(u0, v0, u1, v1, mode) { const g = scrCtx, W = 512, H = 256, r = mode === 'sponge' ? 34 : 42; g.globalCompositeOperation = mode === 'sponge' ? 'source-over' : 'destination-out'; g.strokeStyle = g.fillStyle = mode === 'sponge' ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,1)'; g.lineWidth = r * 2; g.lineCap = 'round';
    g.beginPath(); g.moveTo(u0 * W, (1 - v0) * H); g.lineTo(u1 * W, (1 - v1) * H); g.stroke(); g.globalCompositeOperation = 'source-over'; SCR.tex.needsUpdate = true;
    const n = Math.max(1, Math.ceil(Math.hypot((u1 - u0) * W, (v1 - v0) * H) / 10)); for (let i = 0; i <= n; i++) { const u = u0 + (u1 - u0) * i / n, v = v0 + (v1 - v0) * i / n; for (let cy = 0; cy < 8; cy++) for (let cx = 0; cx < 16; cx++) { const px = (cx + 0.5) * 32, py = (cy + 0.5) * 32; if (Math.hypot(px - u * W, py - (1 - v) * H) < r + 8) { const k = cy * 16 + cx; SCR.cells[k] = mode === 'sponge' ? Math.max(SCR.cells[k], 2) : 3; } } } }
  const scrFrac = m => { let n = 0; for (const c of SCR.cells) if (m === 'sponge' ? c >= 2 : c === 3) n++; return n / 128; };
  function beginScreen() { J.step = 1; J.sub = 'sponge'; J.p = nextCus(); standAt(J.p, 371.6, 82.0, Math.PI - 0.4); dirtyScreen(); J.uv = null; J.t0 = J.t; SPONGE.visible = true; SPONGE.position.set(368.05, 0.36, 77.3); sayC(J.p, ['I drove past the lake at sunset. Every bug in Meru said hello.']); toast('RUB THE SPONGE ALL OVER THE GLASS', 2.2); }
  function screenPress() { if (J.sub !== 'sponge' && J.sub !== 'squeegee') return; const h = scrHit(); J.uv = h ? [h.uv.x, h.uv.y] : null; if (!h) toast('RUB ON THE WINDSCREEN', 0.8); else screenDrag(); }
  function screenDrag() { const h = scrHit(); if (!h) { J.uv = null; return; } const tool = J.sub === 'sponge' ? SPONGE : SQG; screenM.getWorldQuaternion(SQ); SN.set(0, 0, 1).applyQuaternion(SQ); tool.position.copy(h.point).addScaledVector(SN, 0.03); tool.quaternion.copy(SQ);
    const uv = [h.uv.x, h.uv.y]; if (J.uv) scrPaint(J.uv[0], J.uv[1], uv[0], uv[1], J.sub); J.uv = uv; J.sq = (J.sq || 0) + 1; if (J.sq % 6 === 0) tone(J.sub === 'sponge' ? 400 : 1400, 0.012, 0.06, J.sub === 'sponge' ? 'sine' : 'triangle');
    const f = scrFrac(J.sub); if (J.sub === 'sponge' && f >= 0.8) { addGold(4); ding(); SPONGE.visible = false; J.step = 2; J.sub = 'squeegee'; J.uv = null; SQG.visible = true; toast('NOW DRAG THE SQUEEGEE ACROSS', 2); }
    else if (J.sub === 'squeegee' && f >= 0.9) { J.sub = 'shine'; SQG.visible = false; const g = scrCtx; g.clearRect(0, 0, 512, 256); SCR.tex.needsUpdate = true; ding(); burst(rot(carB, 0, 1.2, 0.7), 8, '#ffffff', 0.6); addGold(8); if (J.t - J.t0 < 25) J.clean += 2;
      sayC(J.p, ['I can see! I can see everything! Is that the castle?']); NEXT('shine', () => finishGame([lb('Clear as the lake. You missed nothing. The bugs miss a lot.')]), 1.6); } }
  // ---- OIL CHECK: latch · pull the stick · read it · (pour) · stick in · shut (2 cars) ----
  DIP.children[3].position.y = -0.54; DIP.children[4].position.y = -0.452;
  const setOil = k => { const h = 0.02 + clamp(k, 0, 1) * 0.16, o = DIP.userData.oil; o.scale.y = h; o.position.y = -0.6 + h / 2; };
  const latchW = () => rot(carB, 0, 0.62, 2.16), dipW = () => rot(carB, 0.3, DIP.position.y + 0.03, 1.6), capW = () => rot(carB, -0.22, 0.82, 1.3), hoodTipW = () => rot(carB, 0, 0.88 + Math.sin(-HOOD.rotation.x) * 1.24, 0.85 + Math.cos(HOOD.rotation.x) * 1.24);
  function beginOil() { J.step++; J.sub = 'latch'; J.p = nextCus(); standAt(J.p, 371.6, 82.0, Math.PI - 0.4); J.low = Math.random() < 0.65; J.oil = J.low ? rnd(0.12, 0.22) : rnd(0.62, 0.76); setOil(J.oil); J.pull = 0; J.wrongR = false; J.hoodT = 0;
    sayC(J.p, [pick(['She has been making a gurgly noise.', 'Can you check the oil? I never know which end the stick is.', 'My uncle says check the oil every week. I check my uncle every week.'])]); toast('CAR ' + J.step + ' OF 2 · TAP THE BONNET LATCH', 2); }
  function oilPress() { const s = J.sub;
    if (s === 'latch') { if (dist(scrW(latchW())) < RAD() * 2.6) { J.hoodT = -1.15; clunk(); NEXT('opening', () => { J.sub = 'pull'; toast('DRAG THE YELLOW DIPSTICK UP', 1.8); }, 0.7); } else toast('TAP THE LATCH ON THE GRILLE', 1); return; }
    if (s === 'pull' || s === 'push') { if (dist(scrW(dipW())) < RAD() * 2.6 || s === 'push') { J.held = 'dip'; J.py = ptr.y; J.p0 = J.pull; } else toast('GRAB THE YELLOW RING', 1); return; }
    if (s === 'can') { if (dist(scrW(OILCAN.position)) < RAD() * 2.6) { J.sub = 'canFly'; fly(OILCAN, capW().add(V(0.12, 0.26, 0)), 0.6, 0.3, () => { OILCAN.rotation.z = 1.9; J.sub = 'pour'; toast('HOLD TO POUR · WATCH THE STICK', 1.8); }); } else toast('TAP THE YELLOW OIL CAN', 1); return; }
    if (s === 'shut') { if (dist(scrW(hoodTipW())) < RAD() * 3.2 || dist(scrW(latchW())) < RAD() * 3.2) { J.hoodT = 0; J.sub = 'shutting'; setTimeout(clunk, 380); const gd = addGold(8 + (J.wrongR ? 0 : 3)); if (!J.wrongR) J.clean++; toast('+' + gd + ' GOLD', 1.2);
        sayC(J.p, [pick(['No more gurgles! Thank you!', 'So it was the oil. I thought it was a goose.', 'Brilliant. Bolt, keep this one!'])]);
        if (J.step < 2) NEXT('paid', () => carSwap(carB, 370, 80, beginOil), 1.8); else NEXT('paid', () => finishGame([lb('Two engines, both happy. Can you hear them purr? That\u2019s gravy, that is.')]), 1.6); } else toast('TAP THE BONNET TO CLOSE IT', 1); } }
  function oilDrag() { if (J.held !== 'dip') return; const k = clamp(J.p0 + (J.py - ptr.y) / (MIN() * 0.2) * (J.sub === 'push' ? 1 : 1), 0, 1); J.pull = k; DIP.position.y = 0.82 + k * 0.62;
    if (J.sub === 'pull' && k >= 1) { J.held = null; J.sub = 'read'; pop(); toast('READ THE STICK · BROWN = OIL', 1.8); } if (J.sub === 'push' && k <= 0.02) { J.held = null; J.pull = 0; DIP.position.y = 0.82; tone(500, 0.04, 0.1, 'triangle'); J.sub = 'shut'; toast('TAP THE BONNET TO CLOSE IT', 1.6); } }
  function oilAnswer(i) { if (J.sub !== 'read') return; const ok = (i === 0) === J.low; if (ok) { ding(); addGold(3); toast(J.low ? 'LOW · RIGHT' : 'ALL GOOD · RIGHT', 1.2); } else { J.wrongR = true; J.miss++; nope(); sayTo(bT, [lb(J.low ? 'Look again, chief: the brown stops BELOW the bottom mark. That\u2019s LOW. We top it up.' : 'Look again: the brown is between the two marks. That\u2019s fine. No oil needed.')], null, true); }
    if (J.low) NEXT('readDone', () => { J.sub = 'can'; toast('TAP THE YELLOW OIL CAN', 1.6); }, ok ? 0.5 : 1.6); else NEXT('readDone', () => { J.sub = 'push'; toast('DRAG THE DIPSTICK BACK DOWN', 1.6); }, ok ? 0.5 : 1.6); }
  function oilTick(dt) { if (J.hoodT == null) return; HOOD.rotation.x += (J.hoodT - HOOD.rotation.x) * Math.min(1, dt * 7); POUR.visible = false;
    if (J.sub === 'pour') { if (ptr.down && J.pause <= 0) { J.oil += 0.24 * dt; setOil(J.oil); J.gl = (J.gl || 0) + dt; if (J.gl > 0.22) { J.gl = 0; gulp(); } const a = OILCAN.position.clone().add(V(-0.08, 0.02, 0)), b = capW(); POUR.visible = true; POUR.position.copy(a).lerp(b, 0.5); POUR.scale.y = a.distanceTo(b); POUR.lookAt(b); POUR.rotateX(Math.PI / 2);
        if (J.oil > 0.92) { J.oil = 0.8; setOil(J.oil); J.miss++; nope(); toast('OVERFILLED · BOLT DRAINS A DROP', 1.6); oilPoured(); } } } }
  function oilPoured() { J.sub = 'canBack'; OILCAN.rotation.z = 0; fly(OILCAN, OILH, 0.6, 0.3, () => { J.sub = 'push'; toast('DRAG THE DIPSTICK BACK DOWN', 1.6); }); }
  function oilRelease() { if (J.held === 'dip') { J.held = null; if (J.sub === 'pull' && J.pull < 1) toast('ALL THE WAY UP', 0.8); } if (J.sub === 'pour' && J.oil >= 0.62) { if (J.oil <= 0.86) { ding(); addGold(4); J.clean++; } oilPoured(); } else if (J.sub === 'pour' && J.oil < 0.62) toast('MORE · BETWEEN THE MARKS', 1); }
  // ---- TYRE PRESSURE: valve · hold to pump · let go in the green · tap to let out (4 tyres) ----
  const tyreW = i => { const w = carB.wheels[i]; return rot(carB, w.sx * 0.85, 0.36, w.home.z); }, valveW = i => { const w = carB.wheels[i]; return rot(carB, w.sx * 1.0, 0.56, w.home.z); };
  const squish = (C, i, k) => { const w = C.wheels[i], s = 0.78 + 0.22 * clamp(k, 0, 1.1); w.g.scale.y = s; w.g.position.y = 0.36 * s; };
  const ORDER_T = [0, 2, 3, 1];
  function beginTyres() { J.target = pick([30, 32, 35]); J.psi = [0, 1, 2, 3].map(() => Math.round(rnd(17, 26))); if (Math.random() < 0.6) J.psi[ORDER_T[Math.floor(rnd(0, 4))]] = J.target + Math.round(rnd(4, 7)); carB.wheels.forEach((_, i) => squish(carB, i, J.psi[i] / J.target)); J.ti = 0; J.p = nextCus(); standAt(J.p, 371.6, 82.0, Math.PI - 0.4);
    sayC(J.p, ['The car keeps leaning to one side. Like it is listening to something.']); showTyre(); }
  function showTyre() { J.step = J.ti + 1; J.sub = 'valve'; J.wasOver = false; J.wi = ORDER_T[J.ti]; VALVE.visible = true; VALVE.position.copy(valveW(J.wi)); toast('TYRE ' + J.step + ' OF 4 · TAP THE RED VALVE CAP', 1.6); }
  function tyrePress() { const i = J.wi;
    if (J.sub === 'valve') { if (dist(scrW(valveW(i))) < RAD() * 2.6) { pop(); fly(VALVE, valveW(i).add(V(0, -0.5, 0.3 * carB.wheels[i].sx)), 0.4, 0.15, () => { VALVE.visible = false; }); airHose.m.visible = true; airHose.set(AIRP, valveW(i), 0.5); J.sub = J.psi[i] > J.target + 1.5 ? 'over' : 'pump'; toast(J.sub === 'over' ? 'TOO MUCH AIR · TAP TO LET SOME OUT' : 'HOLD TO PUMP · LET GO IN THE GREEN', 1.8); } else toast('TAP THE RED VALVE CAP', 1); return; }
    if (J.sub === 'over') { J.psi[i] -= 1.5; hiss(); squish(carB, i, J.psi[i] / J.target); if (Math.abs(J.psi[i] - J.target) <= 1.5) tyreDone(); else if (J.psi[i] < J.target - 1.5) { J.sub = 'pump'; toast('HOLD TO PUMP A LITTLE', 1); } } }
  function tyreTick(dt) { const i = J.wi; if (J.sub === 'pump' && ptr.down && J.pause <= 0) { J.pumping = true; J.psi[i] += 6 * dt; squish(carB, i, J.psi[i] / J.target); J.hs = (J.hs || 0) + dt; if (J.hs > 0.2) { J.hs = 0; tone(2400, 0.008, 0.18, 'sawtooth', 0, 2000); }
      if (J.psi[i] > J.target + 1.5) { J.pumping = false; J.sub = 'over'; J.wasOver = true; J.miss++; nope(); toast('TOO MUCH · TAP TO LET SOME OUT', 1.6); } } }
  function tyreRelease() { if (J.sub !== 'pump' || !J.pumping) return; J.pumping = false; const d = J.psi[J.wi] - J.target; if (Math.abs(d) <= 1.5) tyreDone(); else if (d < 0) toast('MORE AIR · HOLD AGAIN', 0.9); }
  function tyreDone() { J.sub = 'tyreDone'; ding(); addGold(4 + (J.wasOver ? 0 : 2)); if (!J.wasOver) J.clean++; airHose.m.visible = false; VALVE.visible = false; toast(Math.round(J.psi[J.wi]) + ' PSI · SPOT ON', 1.2); J.ti++;
    if (J.ti < 4) NEXT('tyreDone', showTyre, 0.9); else { sayC(J.p, ['It is standing up straight! It looks taller!']); NEXT('tyreDone', () => finishGame([lb('Four tyres, all ' + J.target + '. She\u2019ll roll like a marble now.')]), 1.4); } }
  // ---- CAR WASH: pick the wash · SOAP (hold) · BRUSHES (rub) · RINSE (hold) · WAX (hold, deluxe) · DRY (tap ×8) ----
  const WASH_OPTS = ['BASIC WASH · 5 G', 'DELUXE + WAX · 8 G', 'JUST A RINSE · 2 G'];
  function beginWash() { J.step = 1; J.sub = 'pick'; J.p = nextCus(); standAt(J.p, 374.8, 85.8, Math.PI / 2); J.wax = Math.random() < 0.5; J.parts = ['PICK', 'SOAP', 'BRUSH', 'RINSE', ...(J.wax ? ['WAX'] : []), 'DRY']; J.st = ['soap', 'brush', 'rinse', ...(J.wax ? ['wax'] : []), 'dry'];
    repaint(carW, pick(CARC)); carW.g.visible = true; carW.g.position.set(377.2, 0, WZ); MUD.forEach(m => { m.visible = true; }); FOAM.forEach(m => { m.visible = false; }); J.spin = 0;
    sayC(J.p, [J.wax ? 'The deluxe, please. With the wax. She deserves it.' : 'Just the basic wash, please. She went through a swamp. On purpose.']); }
  function washAnswer(i) { if (J.sub !== 'pick') return; const want = J.wax ? 1 : 0; if (i === want) { ding(); addGold(3); J.clean++; } else { J.miss++; nope(); sayTo(bT, [lb('They asked for the ' + WASH_OPTS[want].split(' · ')[0].toLowerCase() + ', chief. I\u2019ll set that one.')], null, true); }
    J.si = 0; NEXT('pickDone', washRoll, i === want ? 0.5 : 1.4); }
  function washRoll() { const k = J.st[J.si]; J.sub = 'roll'; J.dest = STG[k]; J.step = J.si + 2; }
  function washArrive() { const k = J.st[J.si]; J.sub = k; J.cov = 0; J.rub = 0; J.taps = 0; toast({ soap: 'HOLD FOR SOAP', brush: 'RUB BACK AND FORTH · SPIN THE BRUSHES', rinse: 'HOLD TO RINSE', wax: 'HOLD TO WAX', dry: 'TAP TO BLOW IT DRY' }[k], 1.8); }
  function washStageDone() { ding(); addGold(J.sub === 'brush' ? 4 : 3); J.si++; if (J.si < J.st.length) NEXT('stageDone', washRoll, 0.5); else { J.sub = 'exit'; J.dest = STG.out; } }
  function washTick(dt) { const g = carW.g, k = J.sub, t = J.t; J.spin = J.spin || 0;
    if (k === 'roll' || k === 'exit') { const d = J.dest - g.position.x; g.position.x += Math.sign(d) * Math.min(Math.abs(d), 1.5 * dt); carW.wheels.forEach(w => { w.t.rotation.x += dt * 4; }); if (Math.abs(d) < 0.01) { if (k === 'roll') washArrive(); else { J.sub = 'shine'; burst(g.position.clone().add(V(0, 1.2, 0)), 10, '#ffffff', 0.8); sayC(J.p, [pick(['She sparkles! I can see my whiskers!', 'Is that my car? It was brown this morning!'])]); NEXT('shine', () => finishGame([lb(J.miss ? 'Shiny! A bit of a wobble at the start, but shiny!' : 'Spotless! You\u2019re a natural. A wet natural.')]), 1.6); } } }
    if (k === 'soap' && ptr.down && J.pause <= 0) { J.cov = Math.min(1, J.cov + 0.55 * dt); FOAM.forEach((m, i) => { m.visible = i < Math.floor(J.cov * FOAM.length); }); if (Math.random() < dt * 14) burst(V(STG.soap, 3.1, WZ + rnd(-1.6, 1.6)), 1, pick(['#ffffff', '#f7c6dc']), 0.3, -1); if (J.cov >= 1) washStageDone(); }
    if (k === 'rinse' && ptr.down && J.pause <= 0) { J.cov = Math.min(1, J.cov + 0.6 * dt); FOAM.forEach((m, i) => { m.visible = i >= Math.floor(J.cov * FOAM.length) && m.visible; }); if (Math.random() < dt * 18) burst(V(STG.rinse, 3.1, WZ + rnd(-1.6, 1.6)), 1, '#8fd0f0', 0.3, -1); if (J.cov >= 1) { FOAM.forEach(m => { m.visible = false; }); washStageDone(); } }
    if (k === 'wax' && ptr.down && J.pause <= 0) { J.cov = Math.min(1, J.cov + 0.6 * dt); if (Math.random() < dt * 12) burst(V(STG.wax, 3.1, WZ + rnd(-1.6, 1.6)), 1, '#ffb23a', 0.3, -1); if (J.cov >= 1) { burst(g.position.clone().add(V(0, 1.3, 0)), 8, YEL, 0.7); toast('WAXED · SHINY', 1); washStageDone(); } }
    J.spin *= Math.pow(0.2, dt); BR.forEach((b, i) => { b.rotation.y += (i ? -1 : 1) * (J.spin + 0.3) * dt; }); ROLL.rotation.y += J.spin * dt; }
  function washPress() { if (J.sub === 'dry') { J.taps++; J.cov = J.taps / 8; tone(180, 0.05, 0.25, 'sawtooth', 0, 90); burst(carW.g.position.clone().add(V(rnd(-1.5, 1.5), 1.1, rnd(-0.9, 0.9))), 4, '#cfe8f0', 0.9); if (J.taps >= 8) washStageDone(); } else if (J.sub === 'pick') toast('PICK ON THE CARD', 1); }
  function washDrag() { if (J.sub !== 'brush') return; const d = Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly); J.rub += d; J.spin = Math.min(14, J.spin + d * 0.03); const f = J.rub / (MIN() * 1.8); MUD.forEach((m, i) => { m.visible = i >= Math.floor(f * MUD.length); }); J.bt = (J.bt || 0) + d; if (J.bt > 60) { J.bt = 0; tone(160 + Math.random() * 40, 0.02, 0.08, 'triangle'); } if (f >= 1) washStageDone(); }
  // ---- SNACKS + SLUSHIE: 2 snacks · cup size · flavour · hold the lever to the line · lid (2 customers) ----
  const CUPS = []; let cupG = null;
  function mkCup(sz) { const s = SIZES[sz], g = new THREE.Group(); const wall = mm(new THREE.CylinderGeometry(s.r, s.r * 0.8, s.h, 12, 1, true), new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }), 0, s.h / 2, 0); wall.renderOrder = 3;
    const band = mm(new THREE.CylinderGeometry(s.r * 0.99, s.r * 0.92, s.h * 0.3, 12, 1, true), LM(RED), 0, s.h * 0.55, 0); const fl = mm(Cy(s.r * 0.92, s.r * 0.76, 1, 12), LM('#ffffff'), 0, 0, 0); fl.scale.y = 0.001;
    const lid = new THREE.Group(); lid.add(mm(Cy(s.r * 1.04, s.r * 1.04, 0.012, 12), LM('#ffffff'), 0, s.h + 0.006, 0), mm(Cy(0.006, 0.006, 0.16, 5), LM(RED), 0.01, s.h + 0.07, 0, 0, 0, 0.15)); lid.visible = false;
    const dome = mm(new THREE.SphereGeometry(s.r * 0.95, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM('#ffffff'), 0, s.h, 0); dome.visible = false; g.add(wall, band, fl, lid, dome); G.add(g); return { g, fl, lid, dome, s }; }
  const setCup = (c, k, col) => { c.fl.material = LM(col); const h = c.s.h * clamp(k, 0, 1); c.fl.scale.y = Math.max(0.001, h); c.fl.position.y = h / 2; c.dome.visible = k > 1.0; c.dome.material = LM(col); c.dome.scale.y = clamp((k - 1) * 4, 0.05, 1); };
  const clearCounter = () => { CUPS.splice(0).forEach(o => { G.remove(o); }); if (cupG) { G.remove(cupG.g); cupG = null; } LEVER.forEach(l => { l.rotation.x = 0; }); };
  function beginSnack() { J.step++; clearCounter(); J.sub = 'snacks'; J.p = nextCus(); standAt(J.p, 382.3, 75.5, 0); J.want = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2); J.got = []; J.size = Math.floor(rnd(0, 3)); J.flav = Math.floor(rnd(0, 3)); J.fill = 0; J.ok = false; J.wr = 0;
    sayC(J.p, [SNK[J.want[0]].n.charAt(0) + SNK[J.want[0]].n.slice(1).toLowerCase() + ', ' + SNK[J.want[1]].n.toLowerCase() + ', and a ' + SIZES[J.size].n.toLowerCase() + ' ' + FLAV[J.flav].n.toLowerCase() + ' slushie, please!']); toast('CUSTOMER ' + J.step + ' OF 2 · TAP THE 2 SNACKS', 2); }
  const rackP = i => RACK[i].position, cupP = i => V(CUPX[i], 1.12, 79.25), tankP = i => V(TANKX[i], 1.66, 79.32);
  function snackPress() { const s = J.sub;
    if (s === 'snacks') { const i = nearest(SNK, (_, k) => rackP(k), RAD() * 1.9); if (i < 0) { toast('TAP A SNACK ON THE RACK', 1); return; } if (J.got.includes(i)) { toast('ALREADY IN THE BAG', 0.9); return; }
      if (!J.want.includes(i)) { J.wr++; J.miss++; nope(); sayTo(bT, [lb('That\u2019s the ' + SNK[i].n.toLowerCase() + ', chief. They want ' + J.want.filter(k => !J.got.includes(k)).map(k => SNK[k].n.toLowerCase()).join(' and ') + '.')], null, true); return; }
      J.got.push(i); pop(); const c = snack3D(i); c.position.copy(rackP(i)); CUPS.push(c); fly(c, BAG.position.clone().add(V(0, 0.22, 0)), 0.45, 0.25, () => { c.visible = false; tone(300, 0.04, 0.08, 'triangle'); }); addGold(2);
      if (J.got.length >= 2) NEXT('snacksDone', () => { J.sub = 'cup'; toast('TAP THE ' + SIZES[J.size].n + ' CUPS', 1.6); }, 0.6); return; }
    if (s === 'cup') { const i = nearest(SIZES, (_, k) => cupP(k), RAD() * 2.0); if (i < 0) { toast('TAP A CUP STACK', 1); return; } if (i !== J.size) { J.wr++; J.miss++; nope(); toast('THAT IS ' + SIZES[i].n + ' · THEY WANT ' + SIZES[J.size].n, 1.4); return; }
      pop(); cupG = mkCup(i); cupG.g.position.copy(cupP(i)); fly(cupG.g, V(381.1, 0.99, 78.9), 0.5, 0.15, () => { J.sub = 'flav'; toast('TAP THE ' + FLAV[J.flav].n + ' TANK', 1.6); }); J.sub = 'cupFly'; return; }
    if (s === 'flav') { const i = nearest(FLAV, (_, k) => tankP(k), RAD() * 2.4); if (i < 0) { toast('TAP A SLUSHIE TANK', 1); return; } if (i !== J.flav) { J.wr++; J.miss++; nope(); toast('THAT IS ' + FLAV[i].n + ' · THEY WANT ' + FLAV[J.flav].n, 1.4); return; }
      pop(); J.sub = 'cupFly'; fly(cupG.g, V(TANKX[i], 0.99, 79.02), 0.4, 0.05, () => { J.sub = 'slush'; toast('HOLD THE LEVER · LET GO AT THE TOP', 1.8); }); return; }
    if (s === 'lid') { if (!cupG || dist(scrW(cupG.g.position.clone().add(V(0, cupG.s.h / 2, 0)))) > RAD() * 3) { toast('TAP THE CUP', 0.9); return; } cupG.lid.visible = true; cupG.dome.visible = false; pop(); J.sub = 'served'; fly(cupG.g, V(381.6, 1.05, 76.55), 0.6, 0.3, () => tone(500, 0.04, 0.1, 'triangle'));
      const gd = addGold(7 + (J.ok ? 3 : 0)); if (J.ok && !J.wr) J.clean++; toast('+' + gd + ' GOLD', 1.2); sayC(J.p, [pick(['Brain freeze! Worth it. Thank you!', 'Perfect. I am going to drink this very slowly. No I am not.', 'You remembered everything! Bolt never does.'])]);
      if (J.step < 2) NEXT('paid', () => { hideC(); beginSnack(); }, 1.8); else NEXT('paid', () => finishGame([lb('Two happy customers, two cold tongues. Slushie champion of Meru, that\u2019s you.')]), 1.6); } }
  function snackTick(dt) { if (J.sub === 'slush' && cupG) { const lv = LEVER[J.flav]; lv.rotation.x += ((ptr.down ? 0.6 : 0) - lv.rotation.x) * Math.min(1, dt * 10);
      if (ptr.down && J.pause <= 0) { J.pouring = true; J.fill += 0.42 * dt; setCup(cupG, J.fill, FLAV[J.flav].c); J.gl = (J.gl || 0) + dt; if (J.gl > 0.18) { J.gl = 0; tone(140 + J.fill * 120, 0.03, 0.1, 'sine'); }
        if (J.fill > 1.12) { J.pouring = false; J.miss++; nope(); burst(cupG.g.position.clone().add(V(0, cupG.s.h, 0)), 6, FLAV[J.flav].c, 0.4); toast('SPILLED OVER · TAP THE CUP FOR THE LID', 1.6); lv.rotation.x = 0; J.sub = 'lid'; } } } }
  function snackRelease() { if (J.sub !== 'slush' || !J.pouring) return; J.pouring = false; if (J.fill >= 0.86) { J.ok = J.fill <= 1.07; if (J.ok) ding(); J.sub = 'lid'; toast((J.ok ? 'RIGHT TO THE TOP' : 'A BIG DOME') + ' · TAP THE CUP FOR THE LID', 1.6); } else toast('MORE · KEEP HOLDING', 0.9); }
  // ---- CHANGE A FLAT: jack (tap + pump) · 5 nuts (wind round) · wheel off · spare on · star order · lower ----
  const FW = carC.wheels[0].sx > 0 && !carC.wheels[0].front ? 0 : 1, FWH = carC.wheels[FW];   // left rear (+x, rear)
  WRENCH.clear(); WRENCH.add(mm(Bx(0.34, 0.03, 0.04), LM(STEEL), 0.17, 0, 0), mm(Cy(0.032, 0.032, 0.06, 6), LM(STEEL), 0, 0, 0, Math.PI / 2));
  const NUTS = [0, 1, 2, 3, 4].map(i => { const a = i / 5 * Math.PI * 2 - Math.PI / 2, m = mm(Cy(0.024, 0.024, 0.05, 6), LM('#cfd6da'), 0.15, Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0, 0, Math.PI / 2); FWH.g.add(m); return { m, home: m.position.clone() }; });
  const STAR = [0, 2, 4, 1, 3];
  SPAREH.set(385.4, 0.13, 65.3); SPARE.position.copy(SPAREH); SPARE.rotation.set(0, 0, Math.PI / 2);
  const FLATP = new THREE.Group(); FLATP.add(mm(Cy(0.36, 0.36, 0.2, 16), LM(INK)), mm(Cy(0.2, 0.2, 0.21, 12), LM(STEEL))); FLATP.scale.set(1, 1, 0.85); FLATP.position.set(389.7, 0.1, 66.6); FLATP.visible = false; G.add(FLATP);
  { const crate = mk(); crate.box(0.8, 0.36, 0.5, WOOD, 387.6, 0.18, 70.5); crate.box(0.82, 0.04, 0.52, '#6b4a2a', 387.6, 0.36, 70.5); G.add(subMesh(crate)); rect(387.2, 388.0, 70.25, 70.75); }
  const nutW = i => NUTS[i].m.getWorldPosition(V()), hubW = () => FWH.g.getWorldPosition(V());
  function resetFlat() { repaint(carC, pick(CARC.filter(c => c !== carC.col))); carC.g.position.set(386.5, 0, 63.0); carC.g.rotation.set(0, -Math.PI / 2, 0); FWH.g.visible = true; FWH.g.position.copy(FWH.home); FWH.g.rotation.set(0, 0, 0); squish(carC, FW, 0);
    NUTS.forEach(n => { FWH.g.attach(n.m); n.m.position.copy(n.home); n.m.rotation.set(0, 0, Math.PI / 2); n.m.visible = true; }); SPARE.visible = true; SPARE.position.copy(SPAREH); SPARE.rotation.set(0, 0, Math.PI / 2); FLATP.visible = false; JACK.position.copy(JACKH); JACK.children[1].scale.y = 1; JACK.children[2].position.y = 0.3; WRENCH.visible = false; }
  resetFlat();
  const setLift = k => { J.lift = clamp(k, 0, 0.27); carC.g.position.y = J.lift; carC.g.rotation.z = J.lift * 0.22; JACK.children[1].scale.y = 1 + J.lift * 5; JACK.children[2].position.y = 0.3 + J.lift; };
  function beginFlat() { J.step = 1; J.sub = 'jack'; J.p = nextCus(); standAt(J.p, 384.0, 61.0, 0.8); J.lift = 0; J.ni = 0; J.si = 0; sayC(J.p, ['I heard a pop and then a flappy noise. Mostly the flappy noise.']); toast('TAP THE RED JACK', 1.6); }
  function flatPress() { const s = J.sub;
    if (s === 'jack') { if (dist(scrW(JACK.position)) < RAD() * 2.8) { J.sub = 'jackFly'; pop(); fly(JACK, JACKU, 0.5, 0.1, () => { J.sub = 'pumpJack'; toast('TAP TAP TAP · PUMP IT UP', 1.6); }); } else toast('TAP THE RED JACK', 1); return; }
    if (s === 'pumpJack') { setLift(J.lift + 0.046); clunk(); if (J.lift >= 0.26) { J.step = 2; J.sub = 'nuts'; J.acc = 0; WRENCH.visible = true; toast('WIND EACH NUT OFF · DRAG ROUND IT', 1.8); } return; }
    if (s === 'nuts') { const c = scrW(nutW(J.ni)); J.ang = Math.atan2(ptr.y - c[1], ptr.x - c[0]); J.track = true; return; }
    if (s === 'off') { J.pull0 = [ptr.x, ptr.y]; return; }
    if (s === 'on') { if (dist(scrW(SPARE.position)) < RAD() * 3 || dist(scrW(hubW())) < RAD() * 3) { J.sub = 'spareFly'; pop(); SPARE.rotation.set(0, -Math.PI / 2, 0); const to = FWH.g.parent.localToWorld(FWH.home.clone()); fly(SPARE, to, 0.7, 0.3, () => { SPARE.visible = false; FWH.g.visible = true; FWH.g.position.copy(FWH.home); FWH.g.rotation.set(0, 0, 0); squish(carC, FW, 1); FWH.g.scale.y = 1; FWH.g.position.y = 0.36; clunk();
          J.step = 4; J.sub = 'nutsBack'; NUTS.forEach((n, i) => { const to2 = FWH.g.localToWorld(n.home.clone().add(V(0.05, 0, 0))); fly(n.m, to2, 0.5, 0.2, () => { FWH.g.attach(n.m); n.m.rotation.set(0, 0, Math.PI / 2); if (i === 4) { J.sub = 'star'; J.si = 0; toast('TIGHTEN IN A STAR · TAP THE YELLOW ONE', 2); } }); }); }); } else toast('TAP THE SPARE ON THE GROUND', 1); return; }
    if (s === 'star') { const i = nearest(NUTS, n => n.m.getWorldPosition(V()), RAD() * 2.4); if (i < 0) { toast('TAP A NUT', 0.8); return; } if (i !== STAR[J.si]) { J.miss++; nope(); if (!J.starHint) { J.starHint = true; sayTo(bT, [lb('Across, chief, not round! Like drawing a star. The yellow ring shows the next one.')], null, true); } else toast('ACROSS · THE YELLOW ONE', 1); return; }
      NUTS[i].m.position.copy(NUTS[i].home); clunk(); addGold(1); J.si++; if (J.si >= 5) { J.step = 5; J.sub = 'lower'; toast('HOLD TO LOWER THE CAR', 1.6); } } }
  function flatDrag() { const s = J.sub;
    if (s === 'nuts' && J.track) { const c = scrW(nutW(J.ni)), d = Math.hypot(ptr.x - c[0], ptr.y - c[1]); if (d < 10) return; const a = Math.atan2(ptr.y - c[1], ptr.x - c[0]); let da = a - J.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); J.ang = a; J.acc += Math.abs(da); WRENCH.rotation.z = -a; J.sq = (J.sq || 0) + Math.abs(da); if (J.sq > 0.9) { J.sq = 0; tone(900, 0.02, 0.05, 'square'); }
      NUTS[J.ni].m.position.x = NUTS[J.ni].home.x + Math.min(0.05, J.acc / (Math.PI * 2) * 0.05);
      if (J.acc >= Math.PI * 1.8) { const n = NUTS[J.ni]; G.attach(n.m); fly(n.m, TRAY.clone().add(V(rnd(-0.1, 0.1), 0.02, rnd(-0.1, 0.1))), 0.45, 0.25, () => tone(2200, 0.04, 0.12, 'triangle')); addGold(1); J.ni++; J.acc = 0; J.track = false; if (J.ni >= 5) { WRENCH.visible = false; J.step = 3; J.sub = 'off'; toast('DRAG THE FLAT WHEEL OFF', 1.6); } } }
    if (s === 'off' && J.pull0 && Math.hypot(ptr.x - J.pull0[0], ptr.y - J.pull0[1]) > MIN() * 0.18) { J.pull0 = null; J.sub = 'offFly'; pop(); const w = FWH.g, wp = w.getWorldPosition(V()); G.attach(w); w.position.copy(wp); fly(w, FLATP.position, 0.6, 0.3, () => { carC.g.attach(w); w.visible = false; FLATP.visible = true; tone(120, 0.08, 0.2); J.sub = 'on'; toast('TAP THE SPARE TO ROLL IT ON', 1.6); }); } }
  function flatRelease() { J.track = false; if (J.sub === 'nuts' && J.acc > 0 && J.acc < Math.PI * 1.8) toast('KEEP WINDING ROUND', 0.8); }
  function flatTick(dt) { if (J.sub === 'nuts') { WRENCH.position.copy(nutW(J.ni)).add(V(0, 0, 0.04)); } if (J.sub === 'lower' && ptr.down && J.pause <= 0) { setLift(J.lift - 0.14 * dt); J.cl = (J.cl || 0) + dt; if (J.cl > 0.25) { J.cl = 0; tone(200, 0.03, 0.08, 'square'); }
      if (J.lift <= 0) { J.sub = 'down'; fly(JACK, JACKH, 0.5, 0.1); ding(); if (!J.miss) J.clean += 2; sayC(J.p, ['Round again! Thank you, thank you. No more flappy noise.']); NEXT('down', () => finishGame([lb('Jacked, swapped, starred and down. That\u2019s a proper pit stop, chief.')]), 1.4); } } }
  // ---- RESTOCK: 8 things from the crate into their shaped gaps (5 shelf, 3 fridge) · stand up 3 fallen bottles ----
  const STK = [{ n: 'CHIPS', c: RED, sh: 'bag' }, { n: 'CANDY BAR', c: YEL, sh: 'bar' }, { n: 'MOTOR OIL', c: INK, sh: 'jug' }, { n: 'ROAD MAP', c: BLUE, sh: 'book' }, { n: 'AIR FRESHENER', c: GREEN, sh: 'tree' }, { n: 'COLA', c: RED, sh: 'can', cold: 1 }, { n: 'WATER', c: '#8fd0f0', sh: 'bottle', cold: 1 }, { n: 'LEMON SODA', c: YEL, sh: 'can2', cold: 1 }];
  const shapeGeo = sh => sh === 'bag' ? [Bx(0.16, 0.22, 0.08), 0.11] : sh === 'bar' ? [Bx(0.2, 0.06, 0.05), 0.03] : sh === 'jug' ? [Bx(0.12, 0.24, 0.08), 0.12] : sh === 'book' ? [Bx(0.18, 0.24, 0.03), 0.12] : sh === 'tree' ? [Co(0.07, 0.2, 3), 0.1] : sh === 'bottle' ? [Cy(0.04, 0.045, 0.26, 10), 0.13] : sh === 'can2' ? [Cy(0.045, 0.045, 0.18, 10), 0.09] : [Cy(0.042, 0.042, 0.13, 10), 0.065];
  const GH = [...GAPS.map(([x, b]) => V(x, BOARD[b] + 0.04, 71.42)), ...FGAP.map(z => V(391.15, 0.88, z))];
  const STKM = STK.map((o, i) => { const [gm, hy] = shapeGeo(o.sh); const m = mm(gm, LM(o.c)); m.userData.hy = hy; G.add(m); const gh = mm(gm, new THREE.MeshBasicMaterial({ color: o.c, transparent: true, opacity: 0.35, depthWrite: false })); gh.renderOrder = 3; gh.visible = false; G.add(gh); return { o, m, gh, home: V(387.3 + (i % 4) * 0.2, 0.38 + hy, 70.38 + Math.floor(i / 4) * 0.24), slot: -1, done: false }; });
  const FALL = [383.3, 384.5, 385.7].map(x => { const m = mm(Cy(0.04, 0.045, 0.24, 10), LM(pick([GREEN, '#f28c28', BLUE])), x, BOARD[0] + 0.09, 71.42, 0, 0, 1.45); G.add(m); return { m, up: false }; });
  function resetStock() { const shelf = shuffle([0, 1, 2, 3, 4]), cold = shuffle([5, 6, 7]); STKM.forEach((s, i) => { s.m.visible = false; s.m.position.copy(s.home); s.m.rotation.set(0, 0, 0); s.done = false; s.gh.visible = false; s.slot = s.o.cold ? cold.indexOf(i) + 5 : shelf.indexOf(i); s.gh.position.copy(GH[s.slot]).add(V(0, s.m.userData.hy, 0)); });
 }
  resetStock();
  function beginStock() { J.step = 1; J.sub = 'stock'; resetStock(); STKM.forEach(s => { s.m.visible = true; s.gh.visible = true; }); FALL.forEach(f => { f.up = false; f.m.rotation.set(0, 0, 1.45); f.m.position.y = BOARD[0] + 0.09; }); J.sel = -1; J.held = -1; J.placed = 0; toast('DRAG EACH THING TO ITS GAP', 2); }
  function stockPlace(i) { const s = STKM[i], gi = nearest(STKM, o => o.gh.position, RAD() * 2.6); J.sel = -1;
    if (gi < 0 || STKM[gi].done) { fly(s.m, s.home, 0.35, 0.1); return; } if (gi !== i) { const g2 = STKM[gi]; J.miss++; nope(); fly(s.m, s.home, 0.4, 0.15); sayTo(bT, [lb(s.o.cold && !g2.o.cold ? 'Cold ones go in the fridge, chief!' : !s.o.cold && g2.o.cold ? 'That gap is in the fridge. ' + s.o.n.charAt(0) + s.o.n.slice(1).toLowerCase() + ' lives on the shelf.' : 'Look at the shape. That gap is for the ' + g2.o.n.toLowerCase() + '.')], null, true); return; }
    s.done = true; fly(s.m, s.gh.position, 0.4, 0.2, () => { s.gh.visible = false; tone(700 + J.placed * 60, 0.04, 0.1, 'triangle'); }); addGold(2); J.placed++; if (J.placed >= 8) NEXT('stocked', () => { J.step = 2; J.sub = 'face'; toast('STAND UP THE FALLEN BOTTLES', 1.8); sayTo(bT, [lb('Lovely. Now somebody knocked over the bottles on the bottom shelf. Tap each one to stand it up.')], null, true); }, 0.8); }
  function stockPress() { if (J.sub === 'face') { const i = nearest(FALL, f => f.m.position, RAD() * 2.4); if (i < 0 || FALL[i].up) { toast('TAP A FALLEN BOTTLE', 0.8); return; } FALL[i].up = true; FALL[i].m.rotation.set(0, 0, 0); FALL[i].m.position.y = BOARD[0] + 0.16; pop(); addGold(1);
      if (FALL.every(f => f.up)) { ding(); if (!J.miss) J.clean += 2; NEXT('faced', () => finishGame([lb(J.miss ? 'All stocked! A couple of detours, but every gap is filled.' : 'Every gap, first try. You\u2019ve got a stockroom brain, chief.')]), 1.0); } return; }
    if (J.sub !== 'stock') return; const i = nearest(STKM, s => s.m.position, RAD() * 1.9); if (i >= 0 && !STKM[i].done) { J.held = i; J.dragged = false; J.d0 = [ptr.x, ptr.y]; return; } if (J.sel >= 0) stockPlace(J.sel); }
  function stockDrag() { if (J.sub !== 'stock' || J.held < 0) return; if (!J.dragged && Math.hypot(ptr.x - J.d0[0], ptr.y - J.d0[1]) > 10) J.dragged = true; if (J.dragged) { const s = STKM[J.held], p = camPlane(s.home); if (p) s.m.position.copy(p); } }
  function stockRelease() { if (J.sub !== 'stock' || J.held < 0) return; const i = J.held; J.held = -1; if (J.dragged) stockPlace(i); else { J.sel = i; STKM[i].m.position.y = STKM[i].home.y + 0.1; pop(); toast('NOW TAP ITS GAP', 1); } }
  // ---- TOW CALL-OUT: drive (hold) · hook (drag) · lift (hold) · chains (tap ×2) · tow it home (hold) ----
  const TP_OUT = [], TP_BACK = [];
  { const seg = (arr, a, b, rev) => { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5)); for (let i = 1; i <= n; i++) arr.push({ x: a[0] + (b[0] - a[0]) * i / n, z: a[1] + (b[1] - a[1]) * i / n, rev }); };
    const o = [[391, 60.5], [381, 60.3], [375, 59.2], [370, 55.6], [364, 49.4], [356, 47.5], [318, 47.5]]; TP_OUT.push({ x: 391, z: 60.5, rev: false }); for (let i = 1; i < o.length; i++) seg(TP_OUT, o[i - 1], o[i], false);
    let prev = [318, 47.5]; for (let i = 1; i <= 18; i++) { const a = -Math.PI / 2 - i / 18 * Math.PI, p = [318 + Math.cos(a) * 3, 50.5 + Math.sin(a) * 3]; seg(TP_OUT, prev, p, false); prev = p; } seg(TP_OUT, prev, [305.6, 53.5], true);
    const b = [[305.6, 53.5], [356, 53.5], [364, 54.6], [371, 58.6], [379, 60.5], [393.5, 60.5]]; TP_BACK.push({ x: 305.6, z: 53.5, rev: false }); for (let i = 1; i < b.length; i++) seg(TP_BACK, b[i - 1], b[i], false);
    for (const arr of [TP_OUT, TP_BACK]) { let s = 0; arr[0].s = 0; for (let i = 1; i < arr.length; i++) { s += Math.hypot(arr[i].x - arr[i - 1].x, arr[i].z - arr[i - 1].z); arr[i].s = s; } arr.L = s; } }
  const pathAt = (arr, s) => { let i = 1; while (i < arr.length - 1 && arr[i].s < s) i++; const a = arr[i - 1], b = arr[i], k = clamp((s - a.s) / Math.max(1e-6, b.s - a.s), 0, 1); let fx = b.x - a.x, fz = b.z - a.z; if (b.rev) { fx = -fx; fz = -fz; } return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, yaw: Math.atan2(fx, fz), rev: b.rev }; };
  const BREAK = { x: 300, z: 53.5 }, radioT = { key: 'gsRadio', obj: TRK, get ry() { return TRK.rotation.y; }, r: 99 }, lr = text => ({ who: 'BOLT · RADIO', role: 'MECHANIC', text });
  const eyeW = () => rot(carT, 0, 0.42, 2.2), hookRest = () => trkW(TIP).add(V(0, -0.95, 0));
  const setTowLift = k => { J.lift = clamp(k, 0, 0.7); const ph = J.lift / 3.5; carT.g.rotation.x = -ph; carT.g.position.y = 1.35 * Math.sin(ph); };
  let PL = null;
  function beginTow() { J.step = 1; J.sub = 'drive'; J.path = TP_OUT; J.s = 0; J.v = 0; J.yaw = TRK_HOME.yaw; J.p = cus((J.n % 3) + 3); GT.attach(J.p.H); standAt(J.p, BREAK.x + 0.5, BREAK.z + 2.4, Math.PI);
    repaint(carT, pick(CARC)); carT.g.visible = true; carT.g.position.set(BREAK.x, 0, BREAK.z); carT.g.rotation.set(0, Math.PI / 2, 0); J.lift = 0; THOOK.position.copy(hookRest()); CHAINS.forEach(c => { c.visible = false; }); J.chain = [false, false];
    sayTo(radioT, [lr('Arena Road, heading west, by the Country Club. Hold to drive, chief. Let go to slow down.')], null, true); toast('HOLD TO DRIVE', 2); }
  function towTick(dt, P) { const s = J.sub;
    if (s === 'drive' || s === 'back') { const L = J.path.L, here = pathAt(J.path, J.s), vmax = here.rev ? 3.2 : 10, near = 2.2 + (L - J.s) * 0.7; if (ptr.down && J.pause <= 0) J.v = Math.min(J.v + 5 * dt, vmax, near); else J.v = Math.max(0, J.v - 8 * dt); J.s = Math.min(L, J.s + J.v * dt);
      const q = pathAt(J.path, J.s); J.yaw += Math.atan2(Math.sin(q.yaw - J.yaw), Math.cos(q.yaw - J.yaw)) * Math.min(1, dt * 6); placeTruck(q.x, q.z, J.yaw); if (!J.eng) J.eng = WS.loop('car-drive'); J.eng.set(isMuted() ? 0 : 0.22 + J.v * 0.04, 0.68 + J.v * 0.04);   // s711 recorded engine (a truck: pitched down)
      if (s === 'back') towCar(dt); if (J.s >= L - 0.02) { J.v = 0; if (J.eng) { J.eng.stop(); J.eng = null; } J.yaw = q.yaw; placeTruck(q.x, q.z, J.yaw); if (s === 'drive') { J.step = 2; J.sub = 'hook'; horn(); sayC(J.p, ['You came! She went bang and stopped. Then she went bang again, quieter.']); toast('DRAG THE HOOK TO THE YELLOW RING', 2); } else towHome(); } }
    if (s === 'winch' && ptr.down && J.pause <= 0) { if (!J.winching && (!J.wT || performance.now() - J.wT > 1900)) { J.wT = performance.now(); if (!isMuted()) WS.play('tow-winch', 0.6); } J.winching = true; setTowLift(J.lift + 0.32 * dt); J.wn = (J.wn || 0) + dt; if (J.wn > 0.15) { J.wn = 0; if (!WS.ready('tow-winch')) tone(300 + J.lift * 300, 0.02, 0.08, 'square'); } if (J.lift > 0.62) { setTowLift(0.48); J.winching = false; J.miss++; nope(); toast('TOO HIGH · EASING IT DOWN', 1.4); } }
    if (['winch', 'chains', 'chained', 'back'].includes(s)) THOOK.position.copy(eyeW()).add(V(0, 0.06, 0));
    if (P && ['drive', 'back', 'hook', 'winch', 'chains', 'chained'].includes(s)) { const c = trkW(V(0.6, 0, 1.6)); P.x = c.x; P.z = c.z; P.y = 0; P.vy = 0; PL = P; }
    J.chain && J.chain.forEach((on, i) => { if (!on) return; const a = trkW(V(i ? 0.8 : -0.8, 0.85, -2.95)), b = rot(carT, i ? 0.7 : -0.7, 0.45, 2.1), m = CHAINS[i]; m.visible = true; m.position.copy(a).lerp(b, 0.5); m.scale.y = a.distanceTo(b); m.lookAt(b); m.rotateX(Math.PI / 2); }); }
  function towCar(dt) { const f = V(Math.sin(J.yaw), 0, Math.cos(J.yaw)), e = trkW(V(0, 0, -3.55)); carT.g.rotation.y += Math.atan2(Math.sin(J.yaw - carT.g.rotation.y), Math.cos(J.yaw - carT.g.rotation.y)) * Math.min(1, dt * 3); const cf2 = V(Math.sin(carT.g.rotation.y), 0, Math.cos(carT.g.rotation.y));
    carT.g.position.x = e.x - cf2.x * 2.2; carT.g.position.z = e.z - cf2.z * 2.2; carT.wheels.forEach(w => { if (!w.front) w.t.rotation.x += J.v * dt / 0.36; }); }
  function towPress() { const s = J.sub;
    if (s === 'hook') { if (dist(scrW(THOOK.position)) < RAD() * 2.8) { J.held = 'hook'; pop(); } else toast('GRAB THE HOOK ON THE TRUCK', 1); return; }
    if (s === 'chains') { const pts = [0, 1].map(i => rot(carT, i ? 0.7 : -0.7, 0.45, 2.1)); const i = nearest(pts, p => p, RAD() * 2.6); if (i < 0 || J.chain[i]) { toast('TAP A YELLOW RING', 0.8); return; } J.chain[i] = true; tone(1800, 0.04, 0.1, 'square'); tone(1400, 0.04, 0.1, 'square', 0.08); addGold(2);
      if (J.chain[0] && J.chain[1]) { J.clean++; J.p.H.visible = false; sayTo(radioT, [lr('Chained up? Nice. Bring her home, chief. Same as before: hold to drive.')], null, true); NEXT('chained', () => { J.step = 5; J.sub = 'back'; J.path = TP_BACK; J.s = 0; J.v = 0; toast('HOLD TO TOW IT HOME', 1.6); }, 1.2); } } }
  function towDrag() { if (J.sub !== 'hook' || J.held !== 'hook') return; const p = onPlane(V(0, 0, 1), V(0, 0, BREAK.z)); if (!p) return; const tip = trkW(TIP); p.x = clamp(p.x, tip.x - 1.6, tip.x + 1.2); p.y = clamp(p.y, 0.2, tip.y - 0.2); THOOK.position.copy(p); if (THOOK.position.distanceTo(eyeW()) < 0.3) { J.held = null; THOOK.position.copy(eyeW()); clunk(); addGold(3); J.clean++; J.step = 3; J.sub = 'winch'; toast('HOLD TO LIFT · LET GO IN THE GREEN', 1.8); } }
  function towRelease() { if (J.held === 'hook') { J.held = null; THOOK.position.copy(hookRest()); toast('BACK TO THE RING ON THEIR BUMPER', 1); } if (J.sub === 'winch' && J.winching) { J.winching = false; if (J.lift >= 0.35 && J.lift <= 0.55) { ding(); addGold(3); J.step = 4; J.sub = 'chains'; toast('TAP BOTH YELLOW RINGS FOR THE CHAINS', 1.6); } else if (J.lift < 0.35) toast('A BIT HIGHER', 0.8); } }
  function towHome() { J.sub = 'drop'; setTowLift(0); CHAINS.forEach(c => { c.visible = false; }); J.chain = null; THOOK.position.copy(hookRest()); J.p.H.visible = true; const cp = rot(carT, -1.6, 0, 0); standAt(J.p, cp.x, cp.z, 0); horn(); if (PL) { PL.x = 391.6; PL.z = 57.4; PL.y = 0; }
    sayC(J.p, ['Home safe! Thank you! I will never drive over a pothole again. I will drive round it.']); towLeft = { t: 14 }; NEXT('drop', () => finishGame([lb('Look at that, towed in one piece! I\u2019ll have her running by tea time.')]), 1.6); }
  // ---- finish (any game): gold, prize, jobs board ----
  function finishGame(lines) { const g = J.g; addGold(10); if (J.clean >= 2 && !J.miss) { addGold(8); toast('CLEAN WORK · +8 GOLD', 2); }
    J.sub = 'pay'; const d = doneMap(), first = !d[g]; d[g] = true; let full = false; if (DOING.every(([k]) => d[k]) && !d.full) { d.full = true; full = true; } save.setStat('gsDone', { ...d }); redraw(jobsTex, jobsFn);
    if (J.gold > save.stat('gsBest_' + g, 0)) save.setStat('gsBest_' + g, J.gold); const g2 = giveGift(); if (full) { save.addGold(60); save.give('goldenNozzle'); }
    const op = lines[0] && g2.kind !== 'ov' ? lines[0].text + ' ' : '', fs = !K.stars(g), stars = !J.miss ? 3 : J.miss <= 2 ? 2 : 1;
    sayTo(endB, [lb(op + J.gold + ' gold.' + (g2.kind === 'ov' ? ' Mechanic overalls and the red cap are yours! The hook by the counter swaps them.' : g2.kind === 'slush' ? ' Two slushies for your bag!' : g2.kind === 'slush1' ? ' A slushie for the road!' : ' Twenty extra.')),
      ...(full ? [lb('ALL NINE JOBS! A full shift! Sixty gold and the GOLDEN NOZZLE. Frame it, chief!')] : [])], null, true); K.finish(g, stars, J.gold, fs); cheer(); NEXT('pay', () => stop(), 1.2); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const g = J.g; if (J.sub === 'intro' || J.sub === 'pay') return;
    if (g === 'fill') fillPress(); else if (g === 'screen') screenPress(); else if (g === 'oil') { if (J.sub === 'read') toast('PICK ON THE CARD', 1); else oilPress(); } else if (g === 'tyres') tyrePress(); else if (g === 'wash') washPress(); else if (g === 'snack') snackPress(); else if (g === 'flat') flatPress(); else if (g === 'stock') stockPress(); else if (g === 'tow') towPress(); }
  function drag() { if (!J) return; const g = J.g; if (g === 'screen' && (J.sub === 'sponge' || J.sub === 'squeegee')) screenDrag(); else if (g === 'oil') oilDrag(); else if (g === 'wash') washDrag(); else if (g === 'flat') flatDrag(); else if (g === 'stock') stockDrag(); else if (g === 'tow') towDrag(); }
  function release() { if (!J) return; const g = J.g; if (g === 'fill') fillRelease(); else if (g === 'screen') J.uv = null; else if (g === 'oil') oilRelease(); else if (g === 'tyres') tyreRelease(); else if (g === 'snack') snackRelease(); else if (g === 'flat') flatRelease(); else if (g === 'stock') stockRelease(); else if (g === 'tow') towRelease(); }
  function answer(i) { if (!J) return; if (J.g === 'oil') oilAnswer(i); else if (J.g === 'wash') washAnswer(i); }
  // ---- the game card ----
  const strip = (names, n) => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + names.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 1px;font-size:9px;font-weight:900;border:2px solid #201e1d;overflow:hidden;text-align:left;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  const NEXTS = { cap: 'TAP THE FUEL FLAP', noz: 'PICK THE NOZZLE', fill: 'HOLD · LET GO ON THE LINE', close: 'TAP THE FLAP', sponge: 'RUB THE SPONGE ALL OVER', squeegee: 'DRAG THE SQUEEGEE', latch: 'TAP THE LATCH', pull: 'DRAG THE STICK UP', read: 'WHAT DOES IT SAY?', can: 'TAP THE OIL CAN', pour: 'HOLD TO POUR', push: 'DRAG THE STICK DOWN', shut: 'TAP THE BONNET',
    valve: 'TAP THE VALVE CAP', pump: 'HOLD · LET GO IN THE GREEN', over: 'TAP TO LET AIR OUT', pick: 'PICK THEIR WASH', roll: 'ROLLING\u2026', soap: 'HOLD FOR SOAP', brush: 'RUB BACK AND FORTH', rinse: 'HOLD TO RINSE', wax: 'HOLD TO WAX', dry: 'TAP TO DRY', snacks: 'TAP THE SNACKS', cup: 'TAP THE CUP SIZE', flav: 'TAP THE FLAVOUR', slush: 'HOLD · LET GO AT THE TOP', lid: 'TAP THE CUP',
    jack: 'TAP THE JACK', pumpJack: 'TAP TO PUMP IT UP', nuts: 'DRAG ROUND THE YELLOW NUT', off: 'DRAG THE WHEEL OFF', on: 'TAP THE SPARE', star: 'TAP THE YELLOW NUT', lower: 'HOLD TO LOWER', stock: 'DRAG TO THE GAP', face: 'TAP THE FALLEN BOTTLES', drive: 'HOLD TO DRIVE', back: 'HOLD TO TOW IT HOME', hook: 'DRAG THE HOOK TO THE RING', winch: 'HOLD · LET GO IN THE GREEN', chains: 'TAP BOTH RINGS' };
  function drawCard() { if (!J) return; const s = J.sub, g = J.g, names = J.parts || PARTS[g], hr = J.gold ? J.gold + ' G' : ''; let det = '', key = g + s + J.step + '_' + J.gold, live = false; const hd = GN[g] + (J.step && names.length > 1 ? ' · ' + Math.min(J.step, names.length) + '/' + names.length : ''), next = s === 'intro' ? 'LISTEN TO BOLT' : s === 'pay' ? 'ALL DONE' : NEXTS[s] || 'NEXT\u2026';
    if (s === 'intro') det = row(RED, 'STARTING SOON', '', false); else if (s === 'pay') det = big('+' + J.gold + ' GOLD', GREEN);
    else if (g === 'fill') { key += Math.round(J.lv * 50); det = row(NOZ[J.fuel].c, NOZ[J.fuel].n, J.p ? J.p.name : '', false) + row(INK, J.ord.n, Math.round(J.lv * 100) + '%', J.ok) + bar(J.lv, GREEN, [J.ord.k - 0.05, Math.min(1, J.ord.k + 0.05)]) + small('TANK · GREEN = THE LINE'); }
    else if (g === 'screen') { const f = scrFrac(s === 'squeegee' ? 'sq' : 'sponge'); key += Math.round(f * 20); det = row(s === 'squeegee' ? INK : YEL, s === 'squeegee' ? 'CLEAN' : 'SOAPY', Math.round(f * 100) + '%', false) + bar(f, s === 'squeegee' ? BLUE : YEL); }
    else if (g === 'oil') { key += Math.round((J.oil || 0) * 40); live = s === 'read'; det = row(YEL, 'DIPSTICK', s === 'read' || s === 'pour' || s === 'can' ? Math.round(J.oil * 100) + '%' : '', false) + (s === 'pour' ? bar(J.oil, '#c9a020', [0.62, 0.86]) : '') + (live ? btns(['LOW · ADD OIL', 'FULL · ALL GOOD']) + small('BROWN BELOW THE BOTTOM MARK = LOW') : ''); }
    else if (g === 'tyres') { const p = J.psi ? J.psi[J.wi] : 0, ok = Math.abs(p - J.target) <= 1.5; key += Math.round(p * 2); det = big(Math.round(p) + ' PSI', ok ? GREEN : p > J.target + 1.5 ? RED : INK) + row(GREEN, 'TARGET', J.target + ' PSI', ok) + bar(p / 50, YEL, [(J.target - 1.5) / 50, (J.target + 1.5) / 50]); }
    else if (g === 'wash') { key += Math.round((J.cov || 0) * 20) + (J.rub ? Math.round(J.rub / 40) : 0); live = s === 'pick'; det = row(J.wax ? '#f28c28' : BLUE, 'ORDER', J.wax ? 'DELUXE + WAX' : 'BASIC', false) + (live ? btns(WASH_OPTS) : ['soap', 'rinse', 'wax', 'dry'].includes(s) ? bar(J.cov, s === 'soap' ? '#f7c6dc' : s === 'wax' ? '#ffb23a' : BLUE) : s === 'brush' ? bar(J.rub / (MIN() * 1.8), INK) : ''); }
    else if (g === 'snack') { key += J.got.length + '_' + Math.round(J.fill * 30); det = J.want.map(k => row(SNK[k].c, SNK[k].n, J.got.includes(k) ? '\u2713' : '', J.got.includes(k))).join('') + row(FLAV[J.flav].c, SIZES[J.size].n + ' ' + FLAV[J.flav].n, '', false) + (s === 'slush' ? bar(J.fill / 1.12, FLAV[J.flav].c, [0.86 / 1.12, 1.07 / 1.12]) : ''); }
    else if (g === 'flat') { key += J.ni + '_' + J.si + '_' + Math.round(J.lift * 40); det = s === 'pumpJack' || s === 'lower' ? row(RED, 'JACK', Math.round(J.lift / 0.26 * 100) + '%', false) + bar(J.lift / 0.26, RED) : s === 'nuts' ? row(STEEL, 'NUTS OFF', J.ni + '/5', false) : s === 'star' ? row(STEEL, 'STAR ORDER', J.si + '/5', false) + small('ACROSS THE WHEEL, NOT ROUND') : ''; }
    else if (g === 'stock') { key += (J.placed || 0) + '_' + FALL.filter(f => f.up).length; det = s === 'face' ? row(GREEN, 'STANDING', FALL.filter(f => f.up).length + '/3', false) : row(YEL, 'IN THEIR GAPS', (J.placed || 0) + '/8', false) + small('COLD ONES GO IN THE FRIDGE'); }
    else if (g === 'tow') { key += Math.round((J.s || 0) / 4) + '_' + Math.round(J.lift * 40); det = s === 'drive' || s === 'back' ? row(RED, s === 'drive' ? 'TO THE BREAKDOWN' : 'BACK TO BOLT\u2019S', Math.max(0, Math.round(J.path.L - J.s)) + ' M', false) + bar(J.s / J.path.L, RED) : s === 'winch' ? row(INK, 'LIFT', Math.round(J.lift * 100) + ' CM', J.lift >= 0.35 && J.lift <= 0.55) + bar(J.lift / 0.7, YEL, [0.35 / 0.7, 0.55 / 0.7]) : row(INK, 'CUSTOMER', J.p ? J.p.name : '', false); }
    setCard(key, head2(hd, hr) + foot(next, !live) + '<div style="padding:8px 10px 10px">' + (names.length > 1 && J.step ? strip(names, Math.min(J.step, names.length)) : '') + det + '</div>', live); }
  function stop(quit) { const wasTow = J && J.g === 'tow'; busy = null; J = null; ptr.down = false; FLIES.length = 0; hideCard(); placeK('idle'); hideC(); HI.visible = HI2.visible = false;
    NOZ.forEach(N => { N.g.position.copy(N.home); N.g.rotation.y = Math.PI / 2; N.hose.set(N.top, N.home, 0.3); }); FUEL.rotation.y = 0; SPLASH.visible = false; pumpRd.on = false; redraw(pumpTex, pumpFn);
    SPONGE.visible = SQG.visible = false; HOOD.rotation.x = 0; DIP.position.y = 0.82; OILCAN.position.copy(OILH); OILCAN.rotation.set(0, 0, 0); POUR.visible = false; VALVE.visible = false; airHose.m.visible = false; carB.wheels.forEach((_, i) => squish(carB, i, 1));
    carW.g.visible = false; carW.g.position.set(377.2, 0, WZ); clearCounter(); resetFlat(); resetStock(); carA.g.position.set(370, 0, 66); carB.g.position.set(370, 0, 80);
    if (wasTow && quit) { towLeft = null; carT.g.visible = false; CHAINS.forEach(c => { c.visible = false; }); placeTruck(TRK_HOME.x, TRK_HOME.z, TRK_HOME.yaw); if (PL) { PL.x = 391.6; PL.z = 57.4; PL.y = 0; } }
    if (wasTow) { cf.forEach(p => { if (p && p.H.parent === GT) G.attach(p.H); }); towCool = 14; } }
  // ================= camera =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT2 = Math.tan(vf), asp = camera.aspect || 1, wT = hT2 * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT2) : h / 2 / hT2, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT2 * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub, g = J.g;
    if (g === 'fill') return [V(371.0, 0.95, 67.4), 3.0, 1.8, 0.4, 2.4, 1.15, 5];
    if (g === 'screen') return [rot(carB, 0, 1.185, 0.628), 1.9, 1.2, 0.55, 1.5, -Math.PI / 2, 3.2];
    if (g === 'oil') { if (['read', 'can', 'canFly', 'pour', 'canBack', 'readDone'].includes(s)) return [rot(carB, 0.15, 1.2, 1.5), 1.3, 1.1, 0.5, 1.3, -Math.PI / 2, 2.4]; return [rot(carB, 0, 0.9, 1.5), 2.0, 1.6, 0.75, 1.6, -Math.PI / 2, 3.4]; }
    if (g === 'tyres') { const i = J.wi != null ? J.wi : 0, w = carB.wheels[i]; return [tyreW(i).add(V(0, 0.08, 0)), 1.3, 1.0, 0.3, 1.4, w.sx > 0 ? 0 : Math.PI, 2.6]; }
    if (g === 'wash') { const x = carW.g.position.x; return 'wash' + x; }
    if (g === 'snack') { if (['snacks', 'snacksDone', 'intro'].includes(s)) return [V(383.0, 1.15, 76.75), 2.4, 1.2, 0.5, 1.4, 0, 2.2]; if (s === 'served' || s === 'paid' || s === 'pay') return [V(382.0, 1.2, 76.3), 2.6, 1.6, 0.35, 1.6, 0, 2.4]; return [V(381.9, 1.35, 79.15), 2.2, 1.2, 0.18, 1.3, Math.PI, 2.1]; }
    if (g === 'flat') { if (['jack', 'jackFly', 'pumpJack', 'lower', 'down', 'intro', 'pay'].includes(s)) return [V(387.3, 0.5, 63.9), 3.0, 1.6, 0.25, 2.2, 0.15, 3.4]; if (['on', 'spareFly', 'offFly'].includes(s)) return [V(387.0, 0.35, 64.7), 3.4, 1.6, 0.62, 2.2, 0.15, 3.2]; return [hubW(), 1.3, 1.0, 0.18, 1.3, 0, 2.2]; }
    if (g === 'stock') { if (s === 'face' || s === 'faced') return [V(384.5, 0.5, 71.4), 3.0, 1.0, 0.35, 1.6, Math.PI, 2.4]; return [V(389.0, 0.8, 71.1), 4.6, 1.6, 0.42, 1.8, -2.75, 2.6]; }
    if (g === 'tow') { if (['drive', 'back', 'drop', 'intro', 'pay'].includes(s)) return 'chase'; const m = trkW(TIP).lerp(eyeW(), 0.6); m.y = 0.9; return [m, 6.5, 2.4, 0.35, 4.0, Math.PI, 8.5]; }
    return null; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } }; function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (busy === 'job' && fox) { if (J && J.g === 'tow') fox.visible = false; else JW(fox, 'gas ' + ((J && J.g) || 'pump')); } }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if (v === 'chase') { const back = J.path === TP_BACK ? -12 : -10; camT.pos.copy(trkW(V(0, 5.2, back))); camT.look.copy(trkW(V(0, 1.2, 3))); } else if (typeof v === 'string') { const x = carW.g.position.x; camT.pos.set(x - 3.4, 2.5, 80.95); camT.look.set(x + 0.7, 0.9, WZ); } else { if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
      fitCam(v); if (['snack', 'stock'].includes(J.g)) { camT.pos.x = clamp(camT.pos.x, X0 + 0.35, X1 - 0.35); camT.pos.z = clamp(camT.pos.z, Z0 + 0.35, Z1 - 0.35); camT.pos.y = Math.min(camT.pos.y, CEIL - 0.4); } }   // shop jobs: camera stays inside
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer on the first of targets() (card answers are skipped) ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const HL = { cap: 'TAP THE FUEL FLAP', close: 'TAP THE FLAP SHUT', noz: 'TAP THIS NOZZLE', latch: 'TAP THE LATCH', pull: 'PULL THE STICK', push: 'PUSH THE STICK', can: 'TAP THE OIL', shut: 'SHUT THE BONNET', valve: 'TAP THE VALVE', snacks: 'TAP THIS SNACK', cup: 'TAP THIS CUP', flav: 'TAP THIS FLAVOUR', lid: 'TAP THE LID', jack: 'TAP THE JACK', nuts: 'WIND THIS NUT', off: 'PULL THE WHEEL', on: 'ROLL THE SPARE ON', star: 'THIS NUT NEXT', face: 'TAP TO STAND IT UP', stock: 'DRAG IT TO ITS GAP', hook: 'DRAG THE HOOK TO THE EYE', chains: 'TAP TO CHAIN' };
  const hintTick = t => { let h = null; if (performance.now() - lastIn > 3000 && busy === 'job' && J && J.pause <= 0 && !ptr.down && !FLIES.length && !['intro', 'pay'].includes(J.sub)) { const q = API.targets()[0]; h = q && typeof q === 'object' ? (q.from || q) : null; }
    if (!h || !(h[2] < 1)) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const lab = J.g === 'screen' ? 'RUB, THEN DRAG ACROSS' : HL[J.sub] || 'TAP HERE';
    const sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(h[0] - 17) + 'px,' + Math.round(h[1] - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== lab) l.textContent = lab; };
  // ================= talk + prompt =================
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r && (P.y || 0) < 2, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r && (P.y || 0) < 2;
  const PROMPTS = { fill: 'FILL UP · PUMP 1', screen: 'WINDSCREEN · PUMP 2', oil: 'OIL CHECK · PUMP 2', tyres: 'TYRE PRESSURE · AIR', wash: 'CAR WASH', snack: 'SNACKS + SLUSHIE', flat: 'CHANGE A FLAT', tow: 'TOW CALL-OUT · TOW TRUCK', stock: 'RESTOCK · THE DELIVERY' };
  function prompt(P) { if (busy || !inStation(P) || P.skate) return null; for (const k in PROMPTS) if (at(P, SPOT[k])) return k === 'tow' && towCool > 0 ? 'TOW TRUCK · BACK IN A MOMENT' : PROMPTS[k] + (doneMap()[k] ? ' \u2713' : '');
    if (ownOv() && at(P, SPOT.hook)) return 'MY OVERALLS ' + (ovOn() ? 'OFF' : 'ON'); if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, bT)) return 'TALK · BOLT'; return null; }
  // s72: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const TALK_B = ["Why did the car get a puncture? There was a fork in the road. I’ve got a hundred of these.","The jobs board by the door. Tick all nine and there’s a bonus. A shiny one.","Slushie tip: hold the lever, watch the top, let go just as it peaks. Like a wave.","Tow truck’s called Rusty. She’s older than me. She’s louder than me too.","Diesel in an unleaded car? Never again. I still dream about the smoke."];
  const ORDER = DOING.map(([k]) => k), canDo = k => k !== 'tow' || towCool <= 0;
  const nextJob = () => ORDER.find(k => !doneMap()[k] && canDo(k)) || ORDER.filter(canDo)[save.stat('gsVisits', 0) % ORDER.filter(canDo).length];
  const goJob = (k, P) => { if (busy) return; if (!canDo(k)) { toast('THE TRUCK IS BACK IN A MOMENT', 1.6); return; } if (P) Object.assign(P, { x: SPOT[k].x, z: SPOT[k].z, sp: 0 }); startGame(k); };
  const jc = (k, t) => ({ text: t, pick: () => goJob(k, lastP) });
  const bMenu = first => sayTo(bT, [{ ...lb(first ? 'Bolt! Welcome to Bolt\u2019s Gas & Go, chief. Nine jobs, nine yellow rings. Tick them all for a bonus!' : ['Chief! Good timing. Plenty to do.', 'Back again? The pumps missed you.', 'Grease on my nose again? Thought so. What\u2019ll it be?'][talked % 3]),
    choices: [jc(nextJob(), CHOICE_WORK), jc('fill', 'THE PUMPS'), jc('wash', 'THE CAR WASH'), jc('snack', 'THE COUNTER'), jc('tow', 'A TOW CALL-OUT'), { text: 'A JOKE, PLEASE', pick: () => sayTo(bT, [lb(TALK_B[talked % TALK_B.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  function talk(P) { lastP = P; if (busy) return true; if (!inStation(P) || P.skate) return false;
    for (const k in PROMPTS) if (at(P, SPOT[k])) { startGame(k); return true; }
    if (ownOv() && at(P, SPOT.hook)) { const on = !ovOn(); putOn(on); pop(); toast(on ? 'OVERALLS ON' : 'OVERALLS OFF', 1.6); return true; }
    if (K.atHiring(P)) { ding(); goJob(nextJob(), P); return true; }
    if (near(P, bT)) { pop(); bMenu(!talked++); return true; }
    return false; }
  function quit() { stop(true); toast('BACK TO WORK LATER · GOLD KEPT', 2); }
  function useItem(id) { return false; }
  // ================= tick =================
  K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'gas', color: RED, boardTitle: "Bolt's best",
    room: { X0, X1, Z0, Z1 }, door: [378.6, 74], keeper: bolt, keeperRy: KS.idle[2],
    games: DOING.map(([k, n]) => ({ k, name: n.charAt(0) + n.slice(1).toLowerCase(), color: ['snack', 'stock'].includes(k) ? RED : NAVY })), board: { x: 389.5, y: 2.6, z: Z0 + 0.09, ry: 0, w: 1.1 },
    hiring: { x: 379.4, z: 72.2, ry: Math.PI / 2 }, hiringLine: '9 JOBS · PICK ANY', clock: { x: 381.8, y: 3.9, z: 76.6, ry: Math.PI / 2 },
    sun: [{ x: 380.0, z: 74, w: 2.6, d: 3.0 }, { x: 385, z: 69.6, w: 2.0, d: 1.8 }],
    lamps: [[380.4, 4.5, 70.2], [386.4, 4.5, 70.2], [380.4, 4.5, 76.6], [386.4, 4.5, 76.6], [389.4, 4.5, 73.4]],
    browse: [[385.8, 72.7, Math.PI], [385.8, 73.1, 0], [390.6, 75.5, Math.PI / 2], [387.8, 75.3, 0]] });
  const BEGIN = { fill: beginFill, screen: beginScreen, oil: beginOil, tyres: beginTyres, wash: beginWash, snack: beginSnack, flat: beginFlat, tow: beginTow, stock: beginStock };
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, dH = Math.hypot(P.x - CX, P.z - CZ); G.visible = dH < (touch ? 50 : 95) || !!(J && J.g === 'tow'); toastT -= dt; towCool = Math.max(0, towCool - dt);
    if (towLeft && !(J && J.g === 'tow')) { towLeft.t -= dt; if (towLeft.t <= 0) { towLeft = null; carT.g.visible = false; placeTruck(TRK_HOME.x, TRK_HOME.z, TRK_HOME.yaw); hideC(); } }
    if (busy === 'job' && J && J.g !== 'tow' && !inStation(P)) stop(true);
    if (FLIES.length) flyTick(dt);
    if (busy === 'job' && J) { J.t += dt; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      if (J) { const g = J.g; if (g === 'fill') fillTick(dt); else if (g === 'oil') oilTick(dt); else if (g === 'tyres') tyreTick(dt); else if (g === 'wash') washTick(dt); else if (g === 'snack') snackTick(dt); else if (g === 'flat') flatTick(dt); else if (g === 'tow') towTick(dt, P); }
      if (J) { HI.visible = HI2.visible = false; const s = J.sub, g = J.g;
        if (g === 'fill') { if (s === 'cap' || s === 'close') hi(HI, FUELW(), true); if (s === 'noz') hi(HI, NOZ[J.fuel].g.position, true); }
        if (g === 'oil') { if (s === 'latch') hi(HI, latchW(), true); if (s === 'pull' || s === 'push') hi(HI, dipW(), true); if (s === 'can') hi(HI, OILCAN.position.clone().add(V(0, 0.15, 0)), true); if (s === 'shut') hi(HI2, hoodTipW(), true); }
        if (g === 'tyres' && s === 'valve') hi(HI, valveW(J.wi), true);
        if (g === 'flat') { if (s === 'jack') hi(HI2, JACK.position.clone().add(V(0, 0.2, 0)), true); if (s === 'nuts') hi(HI, nutW(J.ni), true); if (s === 'off') hi(HI2, hubW(), true); if (s === 'on') hi(HI2, SPARE.position.clone().add(V(0, 0.15, 0)), true); if (s === 'star') hi(HI, NUTS[STAR[J.si]].m.getWorldPosition(V()), true); }
        if (g === 'snack') { if (s === 'cup') hi(HI2, cupP(J.size), true); if (s === 'flav') hi(HI2, tankP(J.flav), true); if (s === 'lid' && cupG) hi(HI2, cupG.g.position.clone().add(V(0, cupG.s.h / 2, 0)), true); }
        if (g === 'tow') { if (s === 'hook') hi(HI, eyeW(), true); if (s === 'chains') { const i = J.chain[0] ? 1 : 0; hi(HI, rot(carT, i ? 0.7 : -0.7, 0.45, 2.1), true); } }
        if (g === 'stock' && s === 'stock') STKM.forEach(o => { if (!o.done) o.gh.material.opacity = 0.25 + 0.2 * Math.sin(t * 5); });
        drawCard(); } }
    hintTick(t); partTick(dt);
    { const on = J && J.g === 'tow'; BLINK.forEach((m, i) => m.material.color.set(on && (((t * 6) | 0) + i) % 2 ? '#ffb23a' : '#7a4a10')); const hz = carT.g.visible && (!J || J.g !== 'tow' || !['back', 'drop', 'pay'].includes(J.sub)) && ((t * 2.5) | 0) % 2; HAZ.forEach(m => m.material.color.set(hz ? '#ffb23a' : '#7a4a10'));
      if (!(J && J.g === 'tow' && J.sub !== 'drive')) THOOK.position.copy(hookRest()); towCable.set(trkW(TIP), THOOK.position.clone().add(V(0, 0.14, 0)), 0.02); }
    if (!G.visible) return;
    for (const k in RS) RS[k].visible = !busy && (k !== 'hook' || ownOv()) && (k !== 'tow' || towCool <= 0); hookOv.visible = ownOv() && !ovOn();
    PADDLE.forEach((p, i) => { p.rotation.y = t * (1.4 + i * 0.25); });
    if (!(J && J.g === 'wash')) { BR.forEach((b, i) => { b.rotation.y += (i ? -1 : 1) * 0.15 * dt; }); }
    { const work = busy === 'job', inS = P.x > X0 && P.x < X1 && P.z > Z0 && P.z < Z1; K.tick(dt, P, { inShop: inS, busy: work, near: dH, talking: work });   // s72: shop kit runs Bolt's idle / wave / look-at
      if (work) turnTo(bolt, bolt.userData.face0 ?? 0, dt * 0.5); }
    cf.forEach(p => { if (p && p.H.visible) kit.animFox && kit.animFox(p.f, dt, 0); }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startGame, answer, useItem, bolt, camera, save, carA, carB, carC, carW, carT, TRK, cells: SCR.cells,
    tap(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); release(); ptr.down = false; }, down(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    hold(on) { if (on) { ptr.down = true; } else { ptr.down = false; release(); } }, skip() { if (J && J.pause > 0) J.pause = 0.001; }, cool0() { towCool = 0; },
    targets() { if (!J) return []; const s = J.sub, g = J.g, S = v => scrW(v);
      if (g === 'fill') return s === 'cap' || s === 'close' ? [S(FUELW())] : s === 'noz' ? [S(NOZ[J.fuel].g.position)] : [];
      if (g === 'oil') return s === 'latch' ? [S(latchW())] : s === 'pull' || s === 'push' ? [S(dipW())] : s === 'can' ? [S(OILCAN.position)] : s === 'shut' ? [S(hoodTipW())] : s === 'read' ? [J.low ? 0 : 1] : [];
      if (g === 'tyres') return s === 'valve' ? [S(valveW(J.wi))] : []; if (g === 'wash') return s === 'pick' ? [J.wax ? 1 : 0] : [];
      if (g === 'snack') return s === 'snacks' ? J.want.filter(k => !J.got.includes(k)).map(k => S(rackP(k))) : s === 'cup' ? [S(cupP(J.size))] : s === 'flav' ? [S(tankP(J.flav))] : s === 'lid' && cupG ? [S(cupG.g.position.clone().add(V(0, cupG.s.h / 2, 0)))] : [];
      if (g === 'flat') return s === 'jack' ? [S(JACK.position)] : s === 'nuts' ? [S(nutW(J.ni))] : s === 'off' ? [S(hubW())] : s === 'on' ? [S(SPARE.position)] : s === 'star' ? [S(NUTS[STAR[J.si]].m.getWorldPosition(V()))] : [];
      if (g === 'stock') return s === 'face' ? FALL.filter(f => !f.up).map(f => S(f.m.position)) : STKM.filter(o => !o.done).map(o => ({ from: S(o.m.position), to: S(o.gh.position) }));
      if (g === 'tow') return s === 'hook' ? [{ from: S(THOOK.position), to: S(eyeW()) }] : s === 'chains' ? [0, 1].filter(i => !J.chain[i]).map(i => S(rot(carT, i ? 0.7 : -0.7, 0.45, 2.1))) : [];
      if (g === 'screen') return [S(rot(carB, 0, 1.185, 0.628))]; return []; },
    hiring: K, dispose() { card.remove(); HAND.remove(); K.dispose(); } };
  G.add(subMesh(R0)); { const gm = new THREE.Mesh(RG.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.28, depthWrite: false })); gm.renderOrder = 2; G.add(gm); }
  window.__gas = API; return API;
}
