// MERU 2.0 — s49 TOWN 2 INTERIOR 7: PENNY'S MINIMART [meruMinimart] (f -190..-172 × -104..-80, door E (-172, -92)).
// MR. PENNY (Ben's pick): tidy old fox, bow tie, counts every coin twice.
// ONE SHIFT, ALL STEPS IN A ROW (Ben): 1 STOCK: drag each item off the delivery cart onto the shelf with the same colour sign (or tap the shelf) ·
// 2 ICE: hold to fill 3 bags, let go on the red line · 3 TILL: tap each item as it passes the scanner, then bag HEAVY ones first; Penny counts the pay twice.
// GENTLE: no fail. Prizes (Ben): STAFF VEST (worn in Meru 2) · SNACK PACK (+20 HP) · ENERGY DRINK (run faster 30 s) · LOYALTY CARD (+25 % gold here)
// · PRICE GUN (RANGE: fires price stickers with the laser shot; WEAPONS tab / staff locker).
// s68 INTERIOR POLISH 7: shopKit (Penny = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board SHIFT; badge), NOW HIRING by the door,
// ONE-box menu with choices, 1-box end line, hint hand, touch radius, portrait lens + room-clamped cameras.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildMinimart({ THREE, scene, kit, cols, save, touch, sayTo, camera, heal, hour, isMuted }) { const JW = jobWorker(THREE);
  const X0 = -189.6, X1 = -172.4, Z0 = -103.6, Z1 = -80.4, CX = -181, CZ = -92;
  const G = new THREE.Group(); G.name = 'minimart'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BLUE = '#2f6fd6', GREEN = '#3f9a5e', STEEL = '#c9ced3', DARK = '#3d3b3a';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  // ---------- floor: pale vinyl tiles ----------
  { const t = CT(256, 256, (g, W, H) => { g.fillStyle = '#e4e2dd'; g.fillRect(0, 0, W, H); g.fillStyle = '#d3d0ca'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); g.fillStyle = 'rgba(60,55,50,0.35)'; for (let i = 0; i <= 2; i++) { g.fillRect(i * 128 - 1, 0, 2, H); g.fillRect(0, i * 128 - 1, W, 2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 1.6, (Z1 - Z0) / 1.6); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  const wall = (len, x, z, ry) => { box(len, 0.25, 0.06, INK, x, 0.125, z, ry); box(len, 0.5, 0.05, RED, x, 0.5, z, ry); box(len, 3.6, 0.05, '#ecebe7', x, 2.55, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(X1 - X0, CX, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, -93.4], [-90.6, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  box(1.6, 0.02, 2.4, INK, X1 - 0.9, 0.08, -92);
  // ---------- products ----------
  const PROD = { drinks: { name: 'DRINKS', c: BLUE }, snacks: { name: 'SNACKS', c: YEL }, cans: { name: 'CANS', c: RED }, cereal: { name: 'CEREAL', c: GREEN } }, PK = Object.keys(PROD);
  const BUY = { milk: { name: 'MILK', heavy: 1, p: 3 }, beans: { name: 'BEANS', heavy: 1, p: 2 }, ice: { name: 'ICE', heavy: 1, p: 2 }, chips: { name: 'CHIPS', heavy: 0, p: 2 }, bread: { name: 'BREAD', heavy: 0, p: 3 }, eggs: { name: 'EGGS', heavy: 0, p: 4 } };
  function makeProd(k, s = 1.3) { const g = new THREE.Group(), add = (geo, c, x, y, z) => { const m = new THREE.Mesh(geo, LM(c)); m.position.set(x, y, z); g.add(m); return m; }, B = (a, b, c2) => new THREE.BoxGeometry(a, b, c2), C = (a, b, h2, s2 = 14) => new THREE.CylinderGeometry(a, b, h2, s2);
    if (k === 'drinks') { add(C(0.05, 0.05, 0.2), BLUE, 0, 0.1, 0); add(C(0.02, 0.048, 0.07), BLUE, 0, 0.235, 0); add(C(0.022, 0.022, 0.03, 8), '#ffffff', 0, 0.28, 0); add(C(0.052, 0.052, 0.07), '#ffffff', 0, 0.1, 0); }
    else if (k === 'snacks' || k === 'chips') { add(B(0.2, 0.26, 0.07), YEL, 0, 0.13, 0); add(B(0.205, 0.06, 0.075), RED, 0, 0.16, 0); }
    else if (k === 'cans' || k === 'beans') { const c = k === 'cans' ? RED : '#e07a24'; add(C(0.06, 0.06, 0.15), c, 0, 0.075, 0); add(C(0.061, 0.061, 0.045), '#ffffff', 0, 0.08, 0); add(C(0.05, 0.05, 0.006), STEEL, 0, 0.153, 0); }
    else if (k === 'cereal') { add(B(0.19, 0.29, 0.07), GREEN, 0, 0.145, 0); add(B(0.12, 0.08, 0.072), '#ffffff', 0, 0.18, 0); }
    else if (k === 'milk') { add(B(0.13, 0.2, 0.13), '#ffffff', 0, 0.1, 0); add(B(0.1, 0.05, 0.1), '#ffffff', 0, 0.225, 0); add(C(0.025, 0.025, 0.03, 8), RED, 0, 0.26, 0); add(B(0.132, 0.05, 0.132), BLUE, 0, 0.1, 0); }
    else if (k === 'bread') { add(B(0.28, 0.12, 0.14), '#d9a35a', 0, 0.06, 0); const t = add(C(0.07, 0.07, 0.28, 12), '#c98a42', 0, 0.12, 0); t.rotation.z = Math.PI / 2; t.scale.set(1, 1, 0.6); }
    else if (k === 'eggs') { add(B(0.26, 0.07, 0.12), '#cbb894', 0, 0.035, 0); for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.028, 8, 6), '#f4ead8', -0.085 + (i % 3) * 0.085, 0.085, i < 3 ? -0.03 : 0.03); }
    else if (k === 'ice') { add(C(0.12, 0.13, 0.26), '#dff1ff', 0, 0.13, 0); add(C(0.03, 0.06, 0.06, 8), '#dff1ff', 0, 0.29, 0); add(C(0.122, 0.122, 0.05), BLUE, 0, 0.16, 0); }
    g.scale.setScalar(s); return g; }
  // ---------- decor product fill (one instanced mesh) ----------
  const decor = []; const fill = (x, y, z, c, w = 0.16, h = 0.24, d = 0.18) => decor.push([x, y + h / 2, z, w, h, d, c]);
  // ================= STOCK WALL (north): 4 bays, sign colour = product colour, 2 empty slots each on the middle shelf =================
  const BW = 1.6, BX0 = -188.4, SHZ = -103.25, BAYS = PK.map((k, i) => ({ k, x: BX0 + BW * (i + 0.5), slots: [-0.42, 0.42].map(o => V(BX0 + BW * (i + 0.5) + o, 0.83, SHZ + 0.05)), n: 0 }));
  box(BW * 4 + 0.2, 2.0, 0.06, '#d6d3cd', BX0 + BW * 2, 1.0, Z0 + 0.1);
  for (const y of [0.3, 0.8, 1.3, 1.8]) box(BW * 4 + 0.2, 0.04, 0.55, STEEL, BX0 + BW * 2, y, SHZ);
  for (let i = 0; i <= 4; i++) box(0.05, 1.9, 0.55, DARK, BX0 + BW * i, 0.95, SHZ);
  BAYS.forEach((b, i) => { const c = PROD[b.k].c; box(BW - 0.06, 0.06, 0.04, c, b.x, 0.82, SHZ + 0.28); box(BW - 0.06, 0.06, 0.04, c, b.x, 0.32, SHZ + 0.28); box(BW - 0.06, 0.06, 0.04, c, b.x, 1.32, SHZ + 0.28);
    plane(label(PROD[b.k].name, c, b.k === 'snacks' ? INK : '#ffffff', 512, 128, 96), BW - 0.1, 0.4, b.x, 2.2, Z0 + 0.15);
    for (const y of [0.32, 1.32]) for (let j = 0; j < 6; j++) fill(b.x - 0.62 + j * 0.25, y, SHZ - 0.02, c, 0.17, 0.26, 0.2); fill(b.x, 0.82, SHZ - 0.02, c, 0.17, 0.26, 0.2); });
  rect(BX0 - 0.15, BX0 + BW * 4 + 0.15, Z0, SHZ + 0.32);
  // delivery cart
  const CART = V(-184.4, 0, -100.1); { const x = CART.x, z = CART.z; box(0.95, 0.03, 0.6, DARK, x, 0.62, z); for (const s of [-1, 1]) { box(0.95, 0.26, 0.025, DARK, x, 0.75, z + s * 0.3); box(0.025, 0.26, 0.6, DARK, x + s * 0.475, 0.75, z); }
    for (const [a, b] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) { box(0.03, 0.55, 0.03, DARK, x + a, 0.33, z + b); cyl(0.06, 0.06, 0.04, INK, x + a, 0.07, z + b, 10, Math.PI / 2); }
    box(0.03, 0.5, 0.03, DARK, x + 0.5, 1.0, z - 0.25); box(0.03, 0.5, 0.03, DARK, x + 0.5, 1.0, z + 0.25); box(0.04, 0.04, 0.6, RED, x + 0.52, 1.25, z); ringC(x, z, 0.65); }
  const cartSlots = []; for (let i = 0; i < 8; i++) cartSlots.push(V(CART.x - 0.33 + (i % 4) * 0.22, 0.64, CART.z + (i < 4 ? -0.12 : 0.12)));
  // ================= MID-STORE GONDOLAS (N-S) + WEST COOLERS =================
  for (const gx of [-186.4, -183.0]) { box(1.0, 0.1, 8.6, INK, gx, 0.05, -91.7); box(0.06, 1.35, 8.6, '#d6d3cd', gx, 0.72, -91.7); for (const y of [0.35, 0.8, 1.25]) box(1.0, 0.03, 8.6, STEEL, gx, y, -91.7); box(1.04, 0.24, 0.06, RED, gx, 1.55, -87.38);
    for (const s of [-1, 1]) for (const y of [0.37, 0.82, 1.27]) for (let j = 0; j < 26; j++) fill(gx + s * 0.25, y, -95.7 + j * 0.31, [BLUE, YEL, RED, GREEN, '#e07a24', '#7c4dc4'][(j + Math.round(y * 3) + (s > 0 ? 2 : 0)) % 6], 0.24, 0.22 + (j % 3) * 0.03, 0.2);
    rect(gx - 0.55, gx + 0.55, -96.05, -87.35); }
  { const x = X0 + 0.45; box(0.9, 2.2, 13.6, '#e9ebe8', x, 1.1, -90.6); box(0.06, 1.9, 13.4, '#9fd0e8', x + 0.43, 1.1, -90.6);
    for (let i = 0; i <= 8; i++) box(0.08, 2.0, 0.06, DARK, x + 0.46, 1.1, -97.3 + i * 1.675); box(0.1, 0.3, 13.6, BLUE, x + 0.41, 2.35, -90.6);
    for (const y of [0.3, 0.8, 1.3, 1.75]) for (let j = 0; j < 30; j++) fill(x + 0.1, y, -97.1 + j * 0.45, [BLUE, '#ffffff', RED, GREEN, YEL][(j + Math.round(y * 2)) % 5], 0.12, 0.26, 0.12);
    plane(label('COLD DRINKS', BLUE, '#ffffff', 512, 96, 64), 2.2, 0.4, x + 0.47, 2.35, -90.6, Math.PI / 2); rect(X0, X0 + 0.95, -97.5, -83.7); }
  // ================= ICE MACHINE (east wall, south of the door) + ice chest =================
  const ICE = V(-174.0, 0.64, -98.8), CHUTE = V(-173.98, 1.14, -98.8);
  box(0.9, 1.9, 1.2, '#b9c6d2', -173.25, 0.95, -98.8); box(0.92, 0.06, 1.22, INK, -173.25, 1.92, -98.8); for (const z of [-99.42, -98.18]) box(0.92, 1.9, 0.04, INK, -173.25, 0.95, z); box(0.04, 0.5, 1.0, '#9fd0e8', -173.72, 1.6, -98.8); box(0.3, 0.16, 0.24, DARK, -173.85, 1.22, -98.8); box(0.42, 0.04, 0.5, DARK, -174.0, 0.6, -98.8); for (let i = 0; i < 5; i++) box(0.4, 0.012, 0.02, STEEL, -174.0, 0.625, -99.0 + i * 0.1);
  box(0.03, 0.6, 1.2, BLUE, -173.72, 0.3, -98.8); plane(label('ICE', BLUE, '#ffffff', 256, 128, 110), 0.8, 0.4, -173.73, 1.62, -98.8, -Math.PI / 2);
  box(1.0, 0.85, 1.5, '#ffffff', -173.0, 0.43, -100.9); box(1.02, 0.05, 1.52, BLUE, -173.0, 0.88, -100.9); plane(label('ICE · 2 G', BLUE, '#ffffff', 256, 64, 40), 0.9, 0.22, -173.51, 0.6, -100.9, -Math.PI / 2);
  rect(-173.75, X1, -99.45, -98.15); rect(-173.55, X1, -101.7, -100.1);
  // ================= CHECKOUT COUNTER (N-S, x -175.2): belt → scanner arch → bagging end =================
  const CXc = -175.2, BZ0 = -84.5, BZ1 = -87.45, SZ = -86.9, TOP = 0.93, BAG = V(CXc, TOP, -89.95);
  box(0.9, 0.9, 6.0, INK, CXc, 0.45, -87.2); box(0.92, 0.04, 6.02, '#e9ebe8', CXc, 0.91, -87.2); box(0.03, 0.4, 6.0, RED, CXc + 0.465, 0.6, -87.2); rect(CXc - 0.47, CXc + 0.47, -90.22, -84.18);
  box(0.04, 0.42, 0.06, DARK, CXc + 0.33, TOP + 0.21, SZ); box(0.04, 0.12, 0.06, DARK, CXc - 0.33, TOP + 0.06, SZ); box(0.04, 0.04, 0.7, DARK, CXc + 0.33, TOP + 0.44, SZ, Math.PI / 2);
  box(0.3, 0.18, 0.26, DARK, CXc - 0.3, 1.02, -84.4); box(0.26, 0.1, 0.18, INK, CXc - 0.3, 1.16, -84.4, 0, 0, 0.3);
  { const b = V(BAG.x, BAG.y, BAG.z); box(0.3, 0.34, 0.2, '#c9a77a', b.x, b.y + 0.17, b.z); box(0.31, 0.04, 0.21, '#a8875a', b.x, b.y + 0.33, b.z); }
  const beltTex = CT(64, 64, (g, W, H) => { g.fillStyle = '#2a2826'; g.fillRect(0, 0, W, H); g.fillStyle = '#3d3b3a'; for (let i = 0; i < 4; i++) g.fillRect(0, i * 16, W, 6); }); beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(1, 8);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.56, BZ0 - BZ1), new THREE.MeshLambertMaterial({ map: beltTex })); m.rotation.x = -Math.PI / 2; m.position.set(CXc, TOP + 0.005, (BZ0 + BZ1) / 2); G.add(m); }
  const laserM = new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.8 }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.02), laserM); m.rotation.x = -Math.PI / 2; m.position.set(CXc, TOP + 0.012, SZ); G.add(m); }
  const zoneM = new THREE.MeshBasicMaterial({ color: 0x3f9a5e, transparent: true, opacity: 0 }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), zoneM); m.rotation.x = -Math.PI / 2; m.position.set(CXc, TOP + 0.009, SZ); G.add(m); }
  // ---------- front of house: sign, magazine rack, snack spinner, staff locker, plant ----------
  { const T = label("PENNY'S MINIMART", RED, '#ffffff', 768, 96, 60); const s1 = plane(T, 3.0, 0.38, CXc - 0.01, 3.2, -87.2, -Math.PI / 2); const s2 = s1.clone(); s2.rotation.y = Math.PI / 2; s2.position.x = CXc + 0.01; G.add(s2); for (const z of [-88.6, -85.8]) box(0.01, 0.9, 0.01, DARK, CXc, 3.85, z);
    plane(label('OPEN EARLY · CLOSE LATE · EVERY COIN COUNTED', INK, YEL, 1024, 64, 40), 4.6, 0.29, CX, 3.4, Z1 - 0.07, Math.PI); }
  box(0.4, 1.2, 1.4, DARK, -173.0, 0.6, -83.0); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) box(0.03, 0.3, 0.26, [RED, BLUE, YEL, GREEN][(i + j) % 4], -173.22, 0.35 + j * 0.36, -83.5 + i * 0.33, 0, 0, -0.15); rect(-173.25, X1, -83.75, -82.25);
  const LOCK = { x: -178.6, z: -81.35, r: 0.9 }; box(1.2, 2.0, 0.5, '#9aa1a8', LOCK.x, 1.0, Z1 - 0.3); for (const s of [-1, 1]) { box(0.56, 1.9, 0.02, '#b8bec4', LOCK.x + s * 0.29, 1.0, Z1 - 0.56); for (let k = 0; k < 4; k++) box(0.3, 0.015, 0.01, DARK, LOCK.x + s * 0.29, 1.75 - k * 0.04, Z1 - 0.575); }
  plane(label('STAFF ONLY', INK, YEL, 256, 64, 40), 0.9, 0.22, LOCK.x, 2.25, Z1 - 0.06, Math.PI); rect(LOCK.x - 0.62, LOCK.x + 0.62, Z1 - 0.58, Z1); cyl(0.5, 0.5, 0.012, YEL, LOCK.x, 0.075, LOCK.z, 22); cyl(0.42, 0.42, 0.014, INK, LOCK.x, 0.077, LOCK.z, 22);
  cyl(0.22, 0.17, 0.4, '#b0573a', X1 - 0.5, 0.27, Z1 - 0.5, 12); for (let k = 0; k < 7; k++) sph(0.2, '#3f7a52', X1 - 0.5 + Math.cos(k) * 0.14, 0.75 + (k % 3) * 0.18, Z1 - 0.5 + Math.sin(k) * 0.14); ringC(X1 - 0.5, Z1 - 0.5, 0.3);
  const SPOT = { work: { x: -176.4, z: -91.6, r: 1.05 }, hook: LOCK };
  cyl(0.5, 0.5, 0.012, YEL, SPOT.work.x, 0.075, SPOT.work.z, 22); cyl(0.42, 0.42, 0.014, INK, SPOT.work.x, 0.077, SPOT.work.z, 22);
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const M4 = new THREE.Matrix4(), im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), decor.length); decor.forEach((d, i) => { M4.compose(V(d[0], d[1], d[2]), new THREE.Quaternion(), V(d[3], d[4], d[5])); im.setMatrixAt(i, M4); im.setColorAt(i, cc.set(d[6])); }); G.add(im);
    const lm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.06, 3.2), new THREE.MeshBasicMaterial({ color: 0xf6f8ff }), 6); [[-186.4, -97], [-183, -97], [-179.6, -97], [-186.4, -86.5], [-183, -86.5], [-178.4, -86.5]].forEach((p, i) => { M4.makeTranslation(p[0], 4.2, p[1]); lm.setMatrixAt(i, M4); }); G.add(lm); }
  // ================= WEARABLES: staff vest (open front), price gun =================
  const vestTex = CT(64, 96, (g, w, h) => { g.fillStyle = RED; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(8, 22, 34, 14); g.fillStyle = INK; g.font = '900 10px Archivo, sans-serif'; g.fillText('STAFF', 10, 33); g.fillStyle = '#b8240e'; g.fillRect(0, h - 6, w, 6); });
  function makeVest() { const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ map: vestTex });
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.46, 0.02), m); f.position.set(s * 0.17, 1.02, 0.37); f.rotation.set(-0.08, s * 0.1, 0); g.add(f); const sd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.4), LM(RED)); sd.position.set(s * 0.335, 0.98, 0.08); g.add(sd); }
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.02), LM(RED)); bk.position.set(0, 0.99, -0.2); g.add(bk); g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makeGun() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.22), LM(YEL)); body.position.set(0, 0.02, 0.06); g.add(body); const grip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.07), LM(INK)); grip.position.set(0, -0.08, -0.02); grip.rotation.x = 0.3; g.add(grip);
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 14), LM('#ffffff')); roll.rotation.z = Math.PI / 2; roll.position.set(0, 0.09, 0.1); g.add(roll); g.position.set(0, -0.46, 0.08); g.traverse(o => { o.renderOrder = 2; }); return g; }
  // ---------- MR. PENNY ----------
  const PN_LOOK = { elder: 1, fur: '#c9875a', furDark: '#8a5a3a', muzzle: '#f6f1ea', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff' };
  const penny = kit.makeFox({ key: 'mrPenny', torso: [RED, '#f3f2f2', INK], outfit: 'vest', mood: 'happy', eyes: ['#3a2a18', '#3a2a18'], look: PN_LOOK }); penny.scale.multiply(V(0.96, 1.03, 0.96));
  { const P = penny.userData && penny.userData.P; if (P && P.head) { const bt = new THREE.Group(), m = LM('#2f3f9a'); for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.11, 4), m); w.rotation.z = s * Math.PI / 2; w.position.set(s * 0.055, -0.36, 0.24); bt.add(w); } const k = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), m); k.position.set(0, -0.36, 0.25); bt.add(k);
      const gm = LM(DARK); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.01, 6, 18), gm); r.position.set(s * 0.12, 0.05, 0.36); bt.add(r); } bt.traverse(o => { o.renderOrder = 2; }); P.head.add(bt); }
    if (P && P.arms && P.arms[1]) { const st = new THREE.Group(); for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 14), LM('#e6b45a')); c.position.y = i * 0.014; st.add(c); } st.position.set(0, -0.44, 0.06); st.traverse(o => { o.renderOrder = 2; }); P.arms[1].add(st); } }
  const GS = { idle: [-176.3, -86.4, Math.PI / 2], stock: [-181.0, -100.4, -Math.PI * 0.8], ice: [-174.9, -97.3, Math.PI * 0.8], till: [-176.2, -91.1, Math.PI * 0.8] };
  G.add(penny); const pnCol = { c: [0, 0, 0.5] }; cols.push(pnCol);
  const placePenny = k => { const s = GS[k]; penny.position.set(s[0], 0, s[1]); penny.userData.face0 = s[2]; pnCol.c[0] = s[0]; pnCol.c[1] = s[1]; }; placePenny('idle');
  const pnT = { key: 'mrPenny', obj: penny, ry: 0, r: 2.4 }, endT = { key: 'martEnd', obj: penny, ry: 0, r: 8 };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mart', color: RED, boardTitle: "Penny's best",
    room: { X0, X1, Z0, Z1 }, door: [-172.2, -92], keeper: penny, keeperRy: Math.PI / 2,
    games: [{ k: 'shift', name: 'Shift', color: RED }], board: { x: X1 - 0.06, y: 2.35, z: -87.6, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: -173.0, z: -94.8, ry: -Math.PI / 2 }, hiringLine: 'STOCK · ICE · TILL',
    sun: [{ x: -175.0, z: -92, w: 1.6, d: 1.6 }], lamps: [[-186.4, -97], [-183, -97], [-179.6, -97], [-186.4, -86.5], [-183, -86.5], [-178.4, -86.5]].map(p => [p[0], 4.1, p[1]]),
    browse: [[-184.7, -94.0, -Math.PI / 2], [-181.6, -89.0, -Math.PI / 2], [-187.9, -92.0, -Math.PI / 2], [-184.4, -98.6, Math.PI], [-173.9, -83.0, Math.PI / 2]],
    looks: [['#e07a24', '#fff1e0', '#7a3a10'], ['#7c4dc4', '#ede4fb', '#3d2563']], clock: { x: X1 - 0.08, y: 2.9, z: -95.6, ry: -Math.PI / 2 } });
  const ln = text => ({ who: 'penny', role: 'MR. PENNY', text });
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], say: 'Snacks for the break room. And ice. Always ice.' },
    { name: 'OTTO', forW: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], say: 'One can of beans. And whatever else I forgot.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], say: 'Stall supplies. Ice for the lemonade.' },
    { name: 'PELL', forW: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'], say: "The residents' breakfast. Mind the eggs." },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], say: 'Chips. Ice. Chips. Go go go.' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], say: 'Bread for me, ice for the fish.' }];
  const custCache = {}; const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'martCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, boostT = 0;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), beep = () => tone(1800, 0.06, 0.12, 'square'), nope = () => tone(196, 0.05, 0.25, 'square');
  const bell = () => { tone(1320, 0.06, 0.8); tone(1760, 0.04, 0.7, 'sine', 0.06); }, coin = (at = 0) => { tone(2400, 0.04, 0.15, 'triangle', at); tone(3200, 0.03, 0.12, 'triangle', at + 0.03); }, rattle = () => tone(500 + Math.random() * 900, 0.015, 0.05, 'triangle');
  // ---------- prizes + what you wear ----------
  const cardOwned = () => save.count('loyaltyCard') > 0;
  const own2 = () => ({ vest: !!save.stat('martVest', false), gun: !!save.stat('martGun', false) });
  const wearNow = () => { const o = own2(), w = save.stat('martWear', null) || {}; return { vest: o.vest && !!w.vest, gun: o.gun && !!w.gun }; };
  const setWear = (k, v) => { const w = { ...(save.stat('martWear', null) || {}) }; w[k] = v; save.setStat('martWear', w); };
  function giveGift() { save.setStat('martClears', save.stat('martClears', 0) + 1); const o = own2(), n = save.stat('martGifts', 0); save.setStat('martGifts', n + 1);
    if (!o.vest) { save.setStat('martVest', true); setWear('vest', true); return { kind: 'vest', label: 'STAFF VEST' }; }
    if (!save.stat('martSnackOnce', false)) { save.setStat('martSnackOnce', true); save.give('snackPack', 2); return { kind: 'snack', label: 'SNACK PACK ×2' }; }
    if (!save.stat('martDrinkOnce', false)) { save.setStat('martDrinkOnce', true); save.give('energyDrink', 2); return { kind: 'drink', label: 'ENERGY DRINK ×2' }; }
    if (!cardOwned()) { save.give('loyaltyCard'); return { kind: 'card', label: 'LOYALTY CARD' }; }
    if (!o.gun) { save.setStat('martGun', true); setWear('gun', true); return { kind: 'gun', label: 'PRICE GUN' }; }
    if (n % 2) { save.give('energyDrink'); return { kind: 'drink', label: 'ENERGY DRINK' }; } save.give('snackPack'); return { kind: 'snack', label: 'SNACK PACK' }; }
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const chips = list => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + list.map(([t, ok, sw]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (ok ? ' \u2713' : '') + '</span>').join('') + '</div>';   // s68: compact list on short screens
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts) => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + '</div>'; const body = pick.lastChild;
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- input: press / drag / release, phone + mouse ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), plZ = new THREE.Plane(V(0, 0, 1), 0), hitP = V();
  const wallHit = z => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); plZ.constant = -z; return rc.ray.intersectPlane(plZ, hitP) ? hitP.clone() : null; };
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt] || (tagTex[txt] = CT(192, 72, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 16, H / 2 + 2, W - 32, 40); }));
  const tagSprite = (txt, bg, fg, s = 0.3) => { if (touch) s *= 1.3; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.375, 1); sp.renderOrder = 6; return sp; };
  // ================= THE SHIFT =================
  const addGold = n => { n = Math.max(0, Math.round(n * (cardOwned() ? 1.25 : 1))); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  function startShift() { const n = save.stat('martVisits', 0), ci = n % CUST.length, C = CUST[ci]; save.setStat('martVisits', n + 1);
    const pool = ['milk', 'beans', 'chips', 'bread', 'eggs'].sort(() => Math.random() - 0.5).slice(0, 4), list = pool.concat(['ice']).sort(() => Math.random() - 0.5);
    J = { ci, C, list, step: 1, sub: 'stock', gold: 0, pause: 0, t: 0, st: 0, perfect: 0, wrong: 0, objs: [], flies: [] };
    const kinds = PK.flatMap(k => [k, k]).sort(() => Math.random() - 0.5); BAYS.forEach(b => { b.n = 0; });
    J.cart = kinds.map((k, i) => { const g = own(makeProd(k, 1.7)); g.position.copy(cartSlots[i]); return { k, g }; }); J.si = 0; liftNext();
    placePenny('stock'); busy = 'job'; bell(); toast('STEP 1 OF 3 · STOCK THE SHELVES', 1.8); }
  // ---- 1 STOCK ----
  const HOLD = () => V(CART.x, 1.25, CART.z);
  function liftNext() { const it = J.cart[J.si]; if (!it) return; J.cur = it; J.held = false; fly(it.g, HOLD(), 0.35, 0.1, null); }
  function stockPress() { if (!J.cur || J.flies.length) return; J.held = true; stockDrag(); }
  function stockDrag() { if (!J.held) return; const p = wallHit(SHZ + 0.5); if (!p) return; p.x = Math.max(BX0 - 0.2, Math.min(BX0 + BW * 4 + 0.2, p.x)); p.y = Math.max(0.35, Math.min(2.1, p.y)); J.cur.g.position.copy(p); J.cur.g.position.y -= 0.15; J.cur.g.position.z = SHZ + 0.5; }
  function stockDrop() { if (!J.held) return; J.held = false; const it = J.cur, p = it.g.position, i = Math.floor((p.x - BX0) / BW), b = BAYS[i];
    if (!b || p.y < 0.2) { fly(it.g, HOLD(), 0.3, 0.05, null); return; }
    if (b.k !== it.k) { J.wrong++; nope(); toast('MR. PENNY: "THAT IS ' + PROD[it.k].name + '. THE ' + (it.k === 'snacks' ? 'YELLOW' : it.k === 'cans' ? 'RED' : it.k === 'drinks' ? 'BLUE' : 'GREEN') + ' SIGN."', 1.6); fly(it.g, HOLD(), 0.35, 0.1, null); return; }
    const slot = b.slots[b.n++]; J.cur = null; pop(); fly(it.g, slot, 0.3, 0.05, () => { tone(880, 0.03, 0.1, 'triangle'); }); J.si++;
    if (J.si < J.cart.length) liftNext(); else { const fast = J.st < 30 && J.wrong === 0, g2 = addGold(16 + Math.max(0, 12 - Math.floor(J.st / 4)) - J.wrong); if (fast) J.perfect++; ding();
      toast((fast ? 'MR. PENNY: "EVERY LABEL FACING OUT. LOVELY."' : 'MR. PENNY: "ALL STOCKED. I WILL STRAIGHTEN THEM LATER."') + ' +' + g2, 1.8); NEXT('stocked', beginIce, 1.3); } }
  // ---- 2 ICE: hold to fill, let go at the red line, 3 bags ----
  const LINE = 0.82, BAND = [0.76, 0.88], BAGH = 0.44;
  const cubeG = new THREE.BoxGeometry(0.035, 0.035, 0.035), cubeM = new THREE.MeshLambertMaterial({ color: '#eaf6ff' });
  function beginIce() { J.step = 2; J.st = 0; J.sub = 'ice'; J.bags = 0; J.goodBags = 0; placePenny('ice'); J.cubes = []; for (let i = 0; i < 10; i++) { const c = own(new THREE.Mesh(cubeG, cubeM)); c.visible = false; J.cubes.push({ m: c, t: i / 10 }); } newBag(); toast('STEP 2 OF 3 · HOLD TO FILL, LET GO ON THE RED LINE', 2); }
  function newBag() { const g = new THREE.Group(); const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, BAGH, 18, 1, true), new THREE.MeshPhongMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); sk.position.y = BAGH / 2; g.add(sk);
    const fm = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.13, 1, 16), new THREE.MeshLambertMaterial({ color: '#d4ecfa' })); fm.visible = false; g.add(fm);
    const ln2 = new THREE.Mesh(new THREE.TorusGeometry(0.152, 0.008, 4, 24), new THREE.MeshBasicMaterial({ color: 0xec3013 })); ln2.rotation.x = Math.PI / 2; ln2.position.y = BAGH * LINE; g.add(ln2);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.151, 0.151, 0.05, 18, 1, true), LM(BLUE)); band.position.y = 0.06; g.add(band); g.position.copy(ICE).add(V(-0.5, 0, 0)); own(g);
    J.bag = { g, fm, f: 0, pouring: false, done: false }; fly(g, ICE, 0.4, 0.1, null); }
  const setBag = (B, f) => { B.f = f; B.fm.visible = f > 0.01; const h = BAGH * Math.min(1.04, f); B.fm.scale.y = Math.max(0.001, h); B.fm.position.y = h / 2; };
  function icePress() { const B = J.bag; if (!B || B.done || J.flies.length) return; B.pouring = true; tone(220, 0.03, 0.2, 'sawtooth'); }
  function iceStop() { const B = J.bag; if (!B || !B.pouring) return; B.pouring = false; if (B.f < 0.05) return; B.done = true; const f = B.f, good = f >= BAND[0] && f <= BAND[1], over = f > 1, g2 = addGold(good ? 7 : over ? 2 : 4); if (good) J.goodBags++; J.bags++;
    good ? ding() : pop(); toast((good ? 'ON THE LINE · ' : over ? 'OVERFLOW · ' : f > BAND[1] ? 'A BIT FULL · ' : 'A BIT LOW · ') + 'BAG ' + J.bags + ' OF 3 +' + g2, 1.2); if (over) setBag(B, 1);
    const twist = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.09, 0.1, 10), new THREE.MeshPhongMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.6 })); twist.position.y = BAGH + 0.04; B.g.add(twist);
    J.pause = 0.7; J.after = () => { const to = V(-173.0, 0.9 + J.bags * 0.02, -100.6 - J.bags * 0.28); fly(B.g, to, 0.6, 0.3, null);
      if (J.bags < 3) { J.sub = 'ice'; newBag(); } else { if (J.goodBags === 3) J.perfect++; NEXT('iced', beginTill, 1.0); toast(J.goodBags === 3 ? 'MR. PENNY: "THREE ON THE LINE. PRECISE. I APPROVE."' : 'MR. PENNY: "ICE IS ICE. IT ALL MELTS EVENTUALLY."', 1.6); } }; }
  function iceTick(dt) { const B = J.bag; if (!B) return; const pour = B.pouring && !B.done;
    if (pour) { setBag(B, B.f + dt * 0.3); if (Math.random() < 0.35) rattle(); if (B.f >= 1.08) iceStop(); }
    for (const c of J.cubes) { c.m.visible = pour; if (!pour) continue; c.t += dt * 2.2; if (c.t > 1) c.t -= 1; const top = ICE.y + BAGH * Math.min(1, B.f); c.m.position.set(CHUTE.x + Math.sin(c.t * 40) * 0.03, CHUTE.y - (CHUTE.y - top) * c.t, CHUTE.z + Math.cos(c.t * 31) * 0.03); c.m.rotation.set(c.t * 9, c.t * 7, 0); } }
  // ---- 3 TILL: scan on the belt, then bag heavy first, Penny counts twice ----
  const QIN = [[-172.6, -92.0], [-173.8, -91.0], [-174.25, -85.6]];
  function beginTill() { J.step = 3; J.st = 0; J.sub = 'till'; placePenny('till'); J.cubes.forEach(c => { c.m.visible = false; });
    const f = custFox(J.ci); f.visible = true; f.position.set(QIN[0][0], 0.02, QIN[0][1]); f.userData.mood = f.userData.base = 'neutral'; J.cust = { f, wp: QIN.slice(1), tx: QIN[0][0], tz: QIN[0][1], arr: false };
    J.belt = []; J.toBelt = J.list.slice(); J.spawnT = 0; J.scanned = 0; J.total = 0; J.missed = 0; J.bagWrong = 0; J.binned = 0; toast('STEP 3 OF 3 · TAP EACH ITEM AS IT CROSSES THE RED LINE', 2.2); }
  function custTick(dt) { const q = J.cust; if (!q) return; const f = q.f, dx = q.tx - f.position.x, dz = q.tz - f.position.z, d = Math.hypot(dx, dz);
    if (d > 0.04) { const s = Math.min(d, dt * 2.4); f.position.x += dx / d * s; f.position.z += dz / d * s; turnTo(f, Math.atan2(dx, dz), dt); kit.animFox && kit.animFox(f, dt, 2.4); q.arr = false; }
    else if (q.wp.length) { const n = q.wp.shift(); q.tx = n[0]; q.tz = n[1]; } else { q.arr = true; if (q.gone) f.visible = false; turnTo(f, -Math.PI / 2, dt); kit.animFox && kit.animFox(f, dt, 0); } }
  const BAGSLOT = i => V(CXc, TOP, -87.8 - i * 0.3);
  function tillTick(dt) { if (!J.cust.arr) return; beltTex.offset.y -= dt * 0.5 * 8 / (BZ0 - BZ1);
    J.spawnT -= dt; if (J.toBelt.length && J.spawnT <= 0 && !J.belt.some(b => b.z > BZ0 - 0.5)) { const k = J.toBelt.shift(), g = own(makeProd(k, 1.25)); g.position.set(CXc, TOP, BZ0); g.rotation.y = Math.PI / 2; J.belt.push({ k, g, z: BZ0, scanned: false, ret: false }); J.spawnT = 1.0; }
    let inZone = false; for (const b of J.belt.slice()) { if (b.ret) continue; b.z -= dt * 0.5; b.g.position.z = b.z; if (Math.abs(b.z - SZ) < 0.2 && !b.scanned) inZone = true;
      if (b.z <= BZ1) { J.belt.splice(J.belt.indexOf(b), 1);
        if (!b.scanned) { J.missed++; nope(); toast('MR. PENNY: "MISSED ONE. BACK IT GOES."', 1.2); b.ret = true; fly(b.g, V(CXc, TOP, BZ0), 0.6, 0.25, () => { b.ret = false; b.z = BZ0; }); J.belt.push(b); }
        else { const i = J.binned++; b.slot = i; fly(b.g, BAGSLOT(i), 0.3, 0.05, null); (J.bagRow = J.bagRow || []).push(b); } } }
    zoneM.opacity = inZone ? 0.55 : 0; laserM.opacity = 0.5 + 0.4 * Math.sin(J.t * 30);
    if (!J.toBelt.length && !J.belt.length && J.binned === J.list.length && !J.flies.length) { const clean = J.missed === 0, g2 = addGold(J.list.length * 2 + (clean ? 4 : 0)); if (clean) J.perfect++; ding();
      toast('ALL SCANNED · ' + J.total + ' G · NOW BAG THEM, HEAVY FIRST · +' + g2, 2); J.sub = 'bag'; J.inBag = 0; J.bagRow.forEach(b => { b.tag = own(tagSprite(BUY[b.k].heavy ? 'HEAVY' : 'LIGHT', BUY[b.k].heavy ? YEL : '#ffffff', INK)); b.tag.position.copy(b.g.position).add(V(0.22, 0.3, 0)); }); } }
  function tillPress() { const cand = J.belt.filter(b => !b.scanned && !b.ret && Math.abs(b.z - SZ) < 0.26); if (!cand.length) { if (J.belt.length) { tone(300, 0.02, 0.08, 'square'); } return; }
    const b = cand[0]; b.scanned = true; J.scanned++; (J.scK = J.scK || []).push(b.k); J.total += BUY[b.k].p; beep(); const t = own(tagSprite(BUY[b.k].name + ' ' + BUY[b.k].p + ' G', '#ffffff', INK, 0.42)); t.position.set(CXc, TOP + 0.55, SZ); J.pops = J.pops || []; J.pops.push({ t, life: 0.9 }); }
  function bagPress() { const rest = J.bagRow.filter(b => !b.bagged); const b = nearestOf(rest, q => q.g.position.clone().add(V(0, 0.1, 0)), 2.2); if (!b) return;
    if (!BUY[b.k].heavy && rest.some(q => BUY[q.k].heavy)) { J.bagWrong++; nope(); toast('MR. PENNY: "HEAVY FIRST. THE ' + BUY[b.k].name + ' WILL THANK YOU."', 1.6); return; }
    b.bagged = true; b.tag.visible = false; pop(); fly(b.g, BAG.clone().add(V(0, 0.15 + J.inBag * 0.02, 0)), 0.4, 0.3, () => { b.g.visible = false; }); J.inBag++;
    if (J.inBag === J.bagRow.length) { const g2 = addGold(J.list.length * 2 - J.bagWrong); if (!J.bagWrong) J.perfect++; NEXT('pay', beginPay, 0.8); toast('BAGGED · +' + g2, 1.2); } }
  function beginPay() { J.sub = 'pay'; J.t = 0; const C = J.C; J.cust.f.userData.mood = J.cust.f.userData.base = 'happy'; J.cust.f.userData.hop = 1; for (let i = 0; i < 6; i++) coin(i * 0.12); for (let i = 0; i < 6; i++) coin(1.2 + i * 0.12);
    const tip = addGold(J.total); J.tip = tip; setCard('pay', head('PAID', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(C) + row(YEL, 'COUNT ONE', J.total + ' G', false) + row(YEL, 'COUNT TWO', J.total + ' G \u2713', true)
      + '<div style="font-size:13px;font-style:italic;padding-top:6px">MR. PENNY: "Correct. To the coin."</div></div>'); toast('MR. PENNY COUNTS IT TWICE · +' + tip + ' GOLD', 2.4); }
  function endShift() { const C = J.C, gold = J.gold, pf = J.perfect, perfect = pf >= 4, gift = giveGift(), first = !K.stars('shift'); if (perfect && gift.kind !== 'snack') save.give('snackPack'); save.best('martBest', gold); const cf = J.cust.f; stop(); cf.visible = true; walkOut(cf);
    toast('SHIFT DONE · +' + gold + ' GOLD · ' + gift.label + (perfect && gift.kind !== 'snack' ? ' + SNACK PACK' : ''), 3.5);
    K.finish('shift', pf >= 4 ? 3 : pf >= 2 ? 2 : 1, gold, first);
    const OPEN = [gold + ' gold, counted twice.', 'Correct, to the coin: ' + gold + ' gold.', gold + ' gold. Counted. Counted again.', 'A tidy shift. ' + gold + ' gold.'][save.stat('martClears', 1) % 4];
    const GIFT = { vest: 'Your staff vest! The locker by the door takes it off.', snack: 'A snack pack. Eat it when hurt.', drink: 'An energy drink. Run like the wind.', card: 'A loyalty card: a quarter more gold here.', gun: 'My old price gun. Fire stickers with 2.' }[gift.kind];
    sayTo(endT, [ln(OPEN + ' ' + GIFT + (perfect ? ' Snack on the house.' : ''))]); }
  let outF = null, outWp = []; function walkOut(f) { outF = f; outWp = [[-173.8, -91.2], [-170.6, -92.0]]; }
  function outTick(dt) { if (!outF) return; const n = outWp[0]; if (!n) { outF.visible = false; outF = null; return; } const dx = n[0] - outF.position.x, dz = n[1] - outF.position.z, d = Math.hypot(dx, dz);
    if (d < 0.05) { outWp.shift(); return; } const s = Math.min(d, dt * 1.6); outF.position.x += dx / d * s; outF.position.z += dz / d * s; turnTo(outF, Math.atan2(dx, dz), dt); kit.animFox && kit.animFox(outF, dt, 1.6); }
  function jobTick(dt) { J.t += dt; J.st += dt; if (J.flies.length) flyTick(dt); if (J.cur && !J.held && !J.flies.length) J.cur.g.rotation.y += dt * 1.2; custTick(dt);
    if (J.pops) for (const p of J.pops.slice()) { p.life -= dt; p.t.position.y += dt * 0.25; if (p.life <= 0) { p.t.visible = false; J.pops.splice(J.pops.indexOf(p), 1); } }
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } drawCard(); return; }
    const s = J.sub; if (s === 'ice') iceTick(dt); else if (s === 'till') tillTick(dt); else if (s === 'pay' && J.t > 3.2) { endShift(); return; } if (J) drawCard(); }
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'stock') stockPress(); else if (s === 'ice') icePress(); else if (s === 'till') tillPress(); else if (s === 'bag') bagPress(); }
  function drag() { if (!J) return; if (J.sub === 'stock') stockDrag(); }
  function release() { if (!J) return; if (J.sub === 'stock') stockDrop(); else if (J.sub === 'ice') iceStop(); }
  // ---- the shift card ----
  const STEP_N = ['STOCK', 'ICE', 'TILL'];
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 4px;font-size:11px;font-weight:900;border:2px solid #201e1d;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J || J.sub === 'pay') return; const s = J.sub, C = J.C; let next = 'NICE', det = '', key = s + J.step;
    if (s === 'stock') { const it = J.cur; key += J.si + '_' + J.wrong + (it ? it.k : ''); next = it ? 'DRAG IT TO THE ' + PROD[it.k].name + ' SHELF' : 'NEXT ONE...';
      det = (it ? row(PROD[it.k].c, 'IN YOUR HAND · ' + PROD[it.k].name, '', false) : '') + lab('CART') + meter(J.si / J.cart.length, YEL); }
    else if (s === 'ice') { const B = J.bag; key += J.bags + '_' + (B ? Math.round(B.f * 50) : 0); next = 'HOLD TO FILL · LET GO ON THE RED LINE';
      det = lab('BAG ' + Math.min(3, J.bags + 1) + ' OF 3') + '<div style="position:relative;height:16px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:' + BAND[0] * 100 + '%;width:' + (BAND[1] - BAND[0]) * 100 + '%;top:0;bottom:0;background:#ffd23a"></div><div style="position:absolute;left:' + LINE * 100 + '%;width:2px;top:0;bottom:0;background:#ec3013"></div><div style="position:absolute;left:0;top:5px;height:4px;width:' + (B ? Math.min(1, B.f) * 100 : 0).toFixed(1) + '%;background:#201e1d"></div></div>'; }
    else if (s === 'till') { key += J.scanned + '_' + J.missed + '_' + J.total + (J.cust.arr ? 'a' : ''); next = J.cust.arr ? 'TAP WHEN AN ITEM IS ON THE RED LINE' : 'HERE COMES ' + C.name + '...';
      det = innerHeight < 720 ? row(INK, 'SCANNED · ' + J.total + ' G', J.scanned + '/' + J.list.length, J.scanned === J.list.length) + chips(J.list.map(k => [BUY[k].name, (J.scK || []).includes(k), k === 'ice' ? BLUE : '#ffffff']))
        : J.list.map(k => { const ok = (J.scK || []).includes(k); return row(k === 'ice' ? BLUE : '#ffffff', BUY[k].name, BUY[k].p + ' G' + (ok ? ' \u2713' : ''), ok); }).join('') + row(INK, 'SCANNED', J.scanned + '/' + J.list.length, J.scanned === J.list.length); }
    else if (s === 'bag') { const rest = J.bagRow.filter(b => !b.bagged), hv = rest.some(b => BUY[b.k].heavy); key += rest.length + '_' + J.bagWrong; next = hv ? 'TAP THE HEAVY ONES FIRST' : 'NOW THE LIGHT ONES ON TOP';
      det = innerHeight < 720 ? chips(J.bagRow.map(b => [BUY[b.k].name + ' · ' + (BUY[b.k].heavy ? 'HEAVY' : 'LIGHT'), b.bagged, BUY[b.k].heavy ? YEL : '#ffffff'])) : J.bagRow.map(b => row(BUY[b.k].heavy ? YEL : '#ffffff', BUY[b.k].name + ' · ' + (BUY[b.k].heavy ? 'HEAVY' : 'LIGHT'), b.bagged ? '\u2713' : '\u2014', b.bagged)).join(''); }
    else return;
    setCard(key, head('STEP ' + J.step + ' OF 3', STEP_N[J.step - 1] + (J.gold ? ' · ' + J.gold + ' G' : '')) + foot(next) + '<div style="padding:8px 10px 10px">' + (J.step === 3 ? who(C) : '') + (innerHeight >= 720 ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); if (J.cust) { J.cust.f.visible = false; J.cust.f.userData.mood = J.cust.f.userData.base = 'neutral'; } BAYS.forEach(b => { b.n = 0; }); }
    J = null; ptr.down = false; zoneM.opacity = 0; hideCard(); hidePick(); placePenny('idle'); }
  // ================= STAFF LOCKER =================
  function startHook(P) { busy = 'hook'; Object.assign(P, { x: LOCK.x, z: LOCK.z, yaw: Math.PI, sp: 0 }); hookPanel(); }
  function hookPanel() { const o = own2(), w = wearNow(), tg = k => { setWear(k, !w[k]); tone(880, 0.04, 0.2, 'triangle'); hookPanel(); };
    showPick('STAFF LOCKER', 'PENNY', 'WHAT YOU WEAR IN MERU', [...(o.vest ? [{ label: 'STAFF VEST · ' + (w.vest ? 'ON' : 'OFF'), on: w.vest, go: () => tg('vest') }] : []), ...(o.gun ? [{ label: 'PRICE GUN · RANGE ' + (w.gun ? 'ON' : 'OFF'), on: w.gun, go: () => tg('gun') }] : []), { label: 'DONE', primary: true, go: () => closeHook() }]); }
  function closeHook() { hidePick(); busy = null; toast(wearNow().gun ? 'PRICE GUN READY · 2 = STICKER' : 'SMART AND TIDY', 1.6); }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearNow(), key = (w.vest ? 1 : 0) + '|' + (w.gun ? 1 : 0);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    const gunKids = () => { const g = P0.gun; if (!g) return []; if (!g.userData.orig) g.userData.orig = g.children.slice(); return g.userData.orig; }, P0 = U.P;
    if (worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox)) { gunKids().forEach(c => { c.visible = !w.gun; }); return; }
    if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; const P = U.P;
    if (w.vest && P.body) { const v = makeVest(); P.body.add(v); worn.parts.push(v); }
    gunKids().forEach(c => { c.visible = !w.gun; }); if (w.gun && P.gun) { const g = makeGun(); g.position.set(0, -0.02, 0.06); g.scale.setScalar(1.2); P.gun.add(g); worn.parts.push(g); } else if (w.gun && P.arms && P.arms[0]) { const g = makeGun(); P.arms[0].add(g); worn.parts.push(g); } }
  const rangeExtra = () => (own2().gun ? [{ key: 'pricegun', name: 'PRICE GUN', line: "Mr. Penny's. Fires a price sticker with every shot.", on: wearNow().gun }] : []);
  function equipRange(k) { if (!own2().gun) return; setWear('gun', k === 'pricegun'); toast(k === 'pricegun' ? 'PRICE GUN EQUIPPED' : 'LASER EQUIPPED', 1.4); }
  // price stickers (pool), fired with the normal range shot
  const STK = []; for (let i = 0; i < 6; i++) { const s = tagSprite(['SALE', '1 G', '50% OFF', '2 FOR 1', 'SALE', 'PENNY\'S'][i], YEL, INK, 0.5); s.visible = false; scene.add(s); STK.push({ s, t: 0, v: V() }); } let stkI = 0;
  function onRange(P) { if (!wearNow().gun) return; const k = STK[stkI++ % STK.length]; k.s.visible = true; k.t = 0; k.s.position.set(P.x + Math.sin(P.yaw) * 0.6, (P.y || 0) + 1.1, P.z + Math.cos(P.yaw) * 0.6); k.v.set(Math.sin(P.yaw) * 18, 0, Math.cos(P.yaw) * 18); tone(1500, 0.04, 0.08, 'square'); tone(900, 0.03, 0.1, 'triangle', 0.03); }
  function stkTick(dt) { for (const k of STK) { if (!k.s.visible) continue; k.t += dt; if (k.t < 0.7) k.s.position.addScaledVector(k.v, dt); else if (k.t > 4.5) k.s.visible = false; } }
  // items (Meru 2 had no item use yet: healing items + the energy drink live here)
  const HEALS = { freshMilk: 20, shepherdsPie: 60, apple: 15, appleCider: 40, carrot: 10, sweetCorn: 15, cornChowder: 50, bandageRoll: 30, sportsDrink: 25, proteinBar: 45, chargeCell: 35, megaCell: 70, travelPillow: 30, napBlanket: 60, gelatoScoop: 30, gelatoTower: 65, coinChoc: 30, limberBalm: 45, clubSandwich: 35, pillowMint: 25, slushie: 30, firstAidKit: 100, snackPack: 20, hotPie: 40, hairTonic: 40, erToGo: 40, healingCharges: 40, splint: 60 };
  { const IC = window.__8G_ITEMS; if (IC) for (const it of IC.list()) if (it.heal > 0) HEALS[it.id] = it.heal; }   // ITEM CATALOG heal values
  function useItem(id) { if (HEALS[id]) { if (!save.take(id)) return false; const hp = heal ? heal(HEALS[id]) : null; tone(660, 0.05, 0.3); tone(990, 0.04, 0.4, 'sine', 0.08); toast('+' + HEALS[id] + ' HP' + (hp != null ? ' · ' + hp + ' HP' : ''), 2); return true; }
    if (id === 'shoeShine') { if (!save.take(id)) return false; save.setStat('shineH', 24); tone(1320, 0.05, 0.25); tone(1760, 0.04, 0.35, 'sine', 0.08); toast('SHOE SHINE · SHINY SHOES · +10 % GOLD FOR A DAY', 2.6); return true; }   // s181 (Ben's pick)
    if (id === 'energyDrink') { if (!save.take(id)) return false; boostT = 30; tone(440, 0.05, 0.2, 'sawtooth'); tone(880, 0.05, 0.3, 'sawtooth', 0.1); toast('ENERGY DRINK · RUN FASTER FOR 30 S', 2.4); return true; } return false; }
  const speedK = () => (boostT > 0 ? 1.4 : 1);
  // ---------- camera: a fixed shot per station ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false }, hp = V();
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot(fox) { if (busy === 'hook' && fox) { fox.getWorldPosition(hp); return [hp.clone().setY(1.0), 1.4, 2.4, 0.15, 3.8, Math.PI, 4.4]; } if (busy !== 'job' || !J) return null; const s = J.sub;
    if (s === 'stock' || s === 'stocked') return [V(-184.4, 1.0, -102.2), 7.4, 2.8, 0.3, 5.0, 0, 14];
    if (s === 'ice' || s === 'iced') return [V(ICE.x, 1.05, ICE.z - 0.1), 1.3, 1.5, 0.22, 2.2, -Math.PI / 2, 3.2];
    const bag = s === 'bag' || s === 'pay'; return [V(CXc + 0.25, TOP + 0.35, bag ? -88.85 : -85.9), bag ? 2.5 : 2.9, 1.9, 0.55, 2.6, -Math.PI / 2, 6.5]; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt, fox) { const v = shot(fox); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(Math.max(X0 + 0.35, Math.min(X1 - 0.35, camCur.pos.x)), Math.min(4.0, camCur.pos.y), Math.max(Z0 + 0.35, Math.min(Z1 - 0.35, camCur.pos.z))); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'stock' && J.cur) { const b = BAYS.find(q => q.k === J.cur.k); return [V(b.x, 1.05, SHZ + 0.5), 'DRAG IT TO ' + PROD[J.cur.k].name]; }
    if (s === 'ice' && J.bag && !J.bag.done) return J.bag.pouring ? (J.bag.f >= BAND[0] - 0.04 ? [ICE.clone().add(V(0, BAGH * LINE, 0)), 'LET GO NOW'] : null) : [ICE.clone().add(V(0, BAGH * 0.5, 0)), 'HOLD TO FILL'];
    if (s === 'till' && J.cust && J.cust.arr) { const b = J.belt.find(q => !q.scanned && !q.ret && Math.abs(q.z - SZ) < 0.2); return b ? [V(CXc, TOP + 0.1, SZ), 'TAP NOW'] : null; }
    if (s === 'bag' && J.bagRow) { const rest = J.bagRow.filter(b => !b.bagged), hv = rest.find(b => BUY[b.k].heavy), b = hv || rest[0]; return b ? [b.g.position.clone().add(V(0, 0.1, 0)), hv ? 'TAP ' + BUY[b.k].name + ' · HEAVY' : 'TAP ' + BUY[b.k].name] : null; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 && (P.y || 0) < 2.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  const hasWear = () => { const o = own2(); return o.vest || o.gun; };
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.work)) return 'START A SHIFT · STOCK, ICE, TILL'; if (at(P, SPOT.hook) && hasWear()) return 'STAFF LOCKER · WHAT YOU WEAR'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, pnT)) return 'TALK · MR. PENNY'; return null; }
  // s68: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ["Good day. Penny's Minimart: open early, closed late, every coin counted twice. Looking for work?", 'Back again? The yellow mark by the counter is free.', 'Shelves need stocking. Fancy a shift?', 'Good day. The ice machine is humming. Shall we work?'];
  const TIPS = ['A tidy shelf sells itself. A messy shelf sells nothing.', 'Thirty-one years, and the till has never been out by a single coin.', 'Otto buys one can of beans every day. One. I have stopped asking.',
    'The ice machine hums in B flat. I find it calming.', 'Granny Crust next door pays in pie. I count the slices. Twice.'];
  let lastP = null; const goWork = P => { if (P) Object.assign(P, { x: SPOT.work.x, z: SPOT.work.z, sp: 0 }); startShift(); };
  const pennyMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } },
      { text: "A SHOPKEEPER'S TIP, PLEASE", pick: () => sayTo(pnT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(pnT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P)) return false;
    if (at(P, SPOT.work)) { startShift(); return true; }
    if (at(P, SPOT.hook) && hasWear()) { startHook(P); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (!near(P, pnT)) return false; bell(); pennyMenu(!talked++); return true; }
  function quit() { if (busy === 'hook') { closeHook(); return; } stop(); toast('SHIFT ENDED · GOLD KEPT', 2); }
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; applyWear(fox); stkTick(dt);
    if (boostT > 0) { boostT -= dt; if (boostT <= 0) toast('ENERGY WORE OFF', 1.4); }
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'job' && fox) JW(fox, 'mart ' + ((J && (J.g || J.sub)) || 'stock'));
    if (!G.visible) return; lastP = P; outTick(dt); if (busy === 'job' && J) jobTick(dt); hintTick(t);
    if (busy === 'job') { const f0 = penny.userData.face0 ?? Math.PI / 2; penny.rotation.y += Math.atan2(Math.sin(f0 - penny.rotation.y), Math.cos(f0 - penny.rotation.y)) * Math.min(1, dt * 3); }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: busy === 'job' }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startShift, penny, camera, save, rangeExtra, equipRange, onRange, useItem, speedK, boost: () => boostT,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    targets() { if (!J) return []; if (J.sub === 'stock' && J.cur) { const b = BAYS.find(q => q.k === J.cur.k); return [scrW(V(b.x, 1.05, SHZ + 0.5))]; } if (J.sub === 'bag') { const rest = J.bagRow.filter(b => !b.bagged), hv = rest.filter(b => BUY[b.k].heavy); return (hv.length ? hv : rest).map(b => scrW(b.g.position.clone().add(V(0, 0.1, 0)))); } return []; },
    skipTo(s) { if (!J) startShift(); J.pause = 0; J.after = null; J.flies.length = 0; J.cart.forEach((it, i) => { const b = BAYS.find(q => q.k === it.k); if (b.n < 2) it.g.position.copy(b.slots[b.n++]); }); J.cur = null; J.si = J.cart.length;
      if (s === 'ice') beginIce(); else if (s === 'till') { beginIce(); J.flies.length = 0; J.bag.g.visible = false; beginTill(); } },
    hiring: K, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__mart = API; return API;
}
