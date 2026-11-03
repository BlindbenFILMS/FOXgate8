// MERU 2.0 — s48 TOWN 2 INTERIOR 6: PIE SHOP [meruPies] (f -188..-172 × -130..-114, door E (-172, -122)).
// GRANNY CRUST (Ben's pick): plump old fox, flour on her apron, calls everyone "dear".
// ONE ORDER, ALL STEPS IN A ROW (Ben): 1 ROLL the dough out to the red ring (drag the pin both ways) · 2 FILL with the flavour asked (tap the pot,
// tap again to stop in the gold band) · 3 TOP: drag 6 lattice strips, then pinch round the edge · 4 OVEN: three pies bake, tap each one when its
// ring goes green · 5 SLICE into the pieces asked · 6 PIE RUSH: the queue at the counter, tap the pie each one wants; the order customer takes the boxed pie.
// GENTLE: no fail. Prizes (Ben, all of them): BAKER'S APRON (worn in Meru 2) · HOT PIE (heal) · OVEN MITTS (look) · GOLDEN PIE TIN (+25 % gold here)
// · ROLLING PIN (melee, +25 % damage, WEAPONS tab / apron hook) · a WHOLE PIE to carry to a door in town after each order.
// s67 INTERIOR POLISH 6: shopKit (Granny = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board ORDER + DELIVERY; badge), NOW HIRING by the door,
// one-box menu with choices, one-box end line, hint hand after 3 s, touch radius 44 + bigger dots, portrait wide lens, camera kept in the room.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildPieShop({ THREE, scene, kit, cols, save, touch, sayTo, camera, L, hour, isMuted }) { const JW = jobWorker(THREE);
  const X0 = -187.6, X1 = -172.4, Z0 = -129.6, Z1 = -114.4, CX = -180, CZ = -122;
  const G = new THREE.Group(); G.name = 'pieShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, n: () => pos.length, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { put, box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.canvas = c; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', CREAM = '#f4e6c8', WOOD = '#9a6a3e', WOOD2 = '#6b3f2a', BRICK = '#b0623f', BRICK2 = '#8f4a2e', COPPER = '#c27a3e', MARBLE = '#efe8dc', SOOT = '#2a1a12', CRUST = '#d9973a';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...opt })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const FLAV = { apple: { name: 'APPLE', c: '#d9a441' }, cherry: { name: 'CHERRY', c: '#b3202a' }, blue: { name: 'BLUEBERRY', c: '#3d3f8f' }, pumpkin: { name: 'PUMPKIN', c: '#e07a24' }, meat: { name: 'MEAT', c: '#7a4a2a' } }, FK = Object.keys(FLAV);
  // a static pie for the decor (merged into one mesh)
  const pieInto = (B, k, x, y, z, s = 1) => { B.cyl(0.2 * s, 0.17 * s, 0.05 * s, '#b8bcc0', x, y + 0.025 * s, z, 20); B.cyl(0.182 * s, 0.182 * s, 0.02 * s, FLAV[k].c, x, y + 0.058 * s, z, 20); B.put(new THREE.TorusGeometry(0.186 * s, 0.02 * s, 5, 22), x, y + 0.062 * s, z, CRUST, 0, Math.PI / 2);
    for (let i = -1; i <= 1; i++) { const l = 0.34 * s * Math.sqrt(1 - (i * 0.5) ** 2); B.box(l, 0.012 * s, 0.035 * s, CRUST, x, y + 0.074 * s, z + i * 0.09 * s); B.box(0.035 * s, 0.012 * s, l, CRUST, x + i * 0.09 * s, y + 0.08 * s, z); } };
  // ---------- floor: terracotta checker ----------
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#b8582f' : '#cf7444'; g.fillRect(i * 64, j * 64, 64, 64); } g.fillStyle = 'rgba(60,30,15,0.45)'; for (let i = 0; i <= 4; i++) { g.fillRect(i * 64 - 1, 0, 2, H); g.fillRect(0, i * 64 - 1, W, 2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 2.4, (Z1 - Z0) / 2.4); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  // ---------- walls: wood wainscot, red rail, cream plaster, dark beam band (gap for the east door) + ceiling beams ----------
  const wall = (len, x, z, ry) => { box(len, 1.1, 0.05, WOOD, x, 0.55, z, ry); box(len, 0.08, 0.09, RED, x, 1.14, z, ry); box(len, 3.1, 0.05, CREAM, x, 2.73, z, ry); box(len, 0.16, 0.08, WOOD2, x, 4.3, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(X1 - X0, CX, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, -123.4], [-120.6, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  for (let x = -186; x <= -174; x += 3) box(0.2, 0.24, Z1 - Z0, WOOD2, x, 4.2, CZ);
  // ================= THE WOOD OVEN (west wall, centred z -122): brick body, an open mouth onto the hearth, fire glow at the back =================
  const OVENP = [-122.55, -122, -121.45].map(z => V(-186.55, 0.87, z));
  box(1.4, 0.85, 3.4, BRICK, -186.9, 0.425, -122); for (const z of [-123.35, -120.65]) box(1.4, 0.7, 0.7, BRICK, -186.9, 1.2, z); box(1.4, 0.9, 3.4, BRICK, -186.9, 2.0, -122);
  box(1.2, 1.6, 1.4, BRICK2, -187.0, 3.25, -122); box(1.46, 0.1, 3.46, '#5a2e1c', -186.9, 2.48, -122); box(0.08, 0.1, 1.9, '#5a2e1c', -186.17, 1.6, -122); for (const z of [-123.0, -121.0]) box(0.08, 0.8, 0.1, '#5a2e1c', -186.17, 1.2, z);
  for (let r = 0; r < 6; r++) for (let i = 0; i < 6; i++) box(0.012, 0.012, 0.5, '#7a3a22', -186.19, 0.12 + r * 0.14, -123.5 + i * 0.6 + (r % 2) * 0.3);
  box(1.3, 0.02, 1.85, SOOT, -186.9, 0.86, -122); for (const z of [-122.93, -121.07]) box(1.3, 0.7, 0.02, SOOT, -186.9, 1.2, z); box(1.3, 0.02, 1.85, SOOT, -186.9, 1.55, -122);
  for (let i = 0; i < 7; i++) sph(0.045 + (i % 3) * 0.015, i % 2 ? '#ff6a1a' : '#ffb347', -187.35 + (i % 2) * 0.08, 0.9, -122.7 + i * 0.23);
  for (let i = 0; i < 3; i++) put(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), -187.3, 0.92, -122.4 + i * 0.4, '#3a2418', 0, 0, Math.PI / 2);
  rect(X0, -186.1, -123.75, -120.25);
  const glowM = new THREE.MeshBasicMaterial({ color: 0xff8a2a }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.68), glowM); m.position.set(-187.47, 1.2, -122); m.rotation.y = Math.PI / 2; G.add(m); }
  const flick = new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.66), flick); m.position.set(-187.42, 1.2, -122); m.rotation.y = Math.PI / 2; G.add(m); }
  for (let i = 0; i < 9; i++) put(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 10), -186.9 + (i % 3) * 0.0, 0.16 + Math.floor(i / 3) * 0.15, -124.55 - (i % 3) * 0.17 + (Math.floor(i / 3) % 2) * 0.08, ['#7a5638', '#8a6440', '#6b4a2e'][i % 3], 0, 0, Math.PI / 2);
  rect(-187.4, -186.4, -125.0, -124.3);
  box(0.06, 1.3, 0.3, '#c9a77a', -186.15, 1.9, -120.0); box(0.04, 0.05, 0.5, '#c9a77a', -186.15, 2.6, -120.0);
  plane(label('WOOD OVEN · HOT', INK, YEL, 512, 64, 40), 1.6, 0.2, -186.12, 2.2, -122, Math.PI / 2);
  // ================= BAKING BENCH (north wall): marble top, flour, the dough spot, 5 filling pots behind the tin =================
  const DOUGH = V(-184.6, 0.892, -128.95);
  box(5.0, 0.84, 1.0, WOOD, -183.5, 0.42, -129.1); box(5.06, 0.05, 1.06, MARBLE, -183.5, 0.865, -129.1); rect(-186.05, -180.95, Z0, -128.55);
  for (let i = 0; i < 8; i++) box(0.16 + (i % 3) * 0.07, 0.003, 0.1 + (i % 2) * 0.05, '#ffffff', -183.9 + i * 0.36, 0.892, -128.8 - (i % 3) * 0.16, i * 0.7);
  box(5.0, 0.05, 0.32, WOOD2, -183.5, 1.85, -129.42); box(5.0, 0.05, 0.32, WOOD2, -183.5, 2.45, -129.42);
  for (let i = 0; i < 12; i++) { const x = -185.7 + i * 0.4; cyl(0.07, 0.07, 0.22, i % 3 ? '#e9dcc4' : '#dfe9e6', x, 1.985, -129.42, 10); cyl(0.075, 0.075, 0.03, [RED, WOOD2, YEL][i % 3], x, 2.11, -129.42, 10); }
  for (let i = 0; i < 6; i++) { const x = -185.6 + i * 0.85; cyl(0.15 - (i % 3) * 0.02, 0.13 - (i % 3) * 0.02, 0.2, COPPER, x, 2.58, -129.42, 14); box(0.18, 0.02, 0.02, COPPER, x + 0.2, 2.62, -129.42); }
  box(5.0, 0.03, 0.03, INK, -183.5, 3.2, -129.5); for (let i = 0; i < 5; i++) { const x = -185.4 + i * 0.9; cyl(0.004, 0.004, 0.18, INK, x, 3.1, -129.5, 4); cyl(0.17 - i * 0.015, 0.17 - i * 0.015, 0.03, COPPER, x, 2.85, -129.48, 16, Math.PI / 2); }
  for (let i = 0; i < 3; i++) { sph(0.26, '#f3efe6', -181.6 + i * 0.0, 0.32 + i * 0.0, -127.7 - i * 0.55, 1, 1.25, 0.9); } plane(label('FLOUR', '#f3efe6', INK, 256, 64, 40), 0.36, 0.09, -181.6, 0.4, -127.45);
  ringC(-181.6, -128.25, 0.5);
  const POTS = FK.map((k, i) => { const B = mk(); B.cyl(0.095, 0.085, 0.16, WHITE, 0, 0.08, 0, 14); B.cyl(0.097, 0.097, 0.04, FLAV[k].c, 0, 0.11, 0, 14); B.cyl(0.086, 0.086, 0.01, FLAV[k].c, 0, 0.158, 0, 14); B.box(0.015, 0.2, 0.015, '#c9ced3', 0.04, 0.2, 0.02, 0, 0, -0.3);
    const g = new THREE.Group(); g.add(new THREE.Mesh(B.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }))); const home = V(-185.08 + i * 0.24, 0.892, -129.38); g.position.copy(home); G.add(g);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.05), new THREE.MeshBasicMaterial({ map: label(FLAV[k].name, FLAV[k].c, '#ffffff', 256, 64, 40) })); lb.position.set(0, 0.06, 0.098); lb.rotation.x = -0.35; g.add(lb);
    return { k, g, home }; });
  // ================= SLICING TABLE (south wall): board + cooling rack =================
  const BOARD = V(-184.8, 0.925, -115.0);
  box(4.4, 0.84, 1.0, WOOD, -183.8, 0.42, -114.95); box(4.46, 0.05, 1.06, '#c9a77a', -183.8, 0.865, -114.95); rect(-186.05, -181.55, -115.5, Z1);
  box(0.62, 0.035, 0.62, '#d8b27a', BOARD.x, 0.907, BOARD.z); box(0.06, 0.02, 0.2, WOOD2, BOARD.x + 0.34, 0.9, BOARD.z, 0.3);
  { const rx = -182.6; for (const y of [0.95, 1.25]) { box(1.3, 0.012, 0.5, '#5a5654', rx, y, -115.0); for (let i = 0; i < 7; i++) box(0.006, 0.006, 0.5, '#8a8f96', rx - 0.6 + i * 0.2, y + 0.01, -115.0); } for (const [x, z] of [[-0.62, -0.22], [0.62, -0.22], [-0.62, 0.22], [0.62, 0.22]]) box(0.02, 0.4, 0.02, '#5a5654', rx + x, 1.1, -115.0 + z);
    pieInto(R0, 'apple', rx - 0.32, 0.962, -115.0); pieInto(R0, 'cherry', rx + 0.32, 0.962, -115.0); pieInto(R0, 'pumpkin', rx, 1.262, -115.0); }
  box(0.2, 0.26, 0.14, WOOD2, -185.75, 1.02, -114.8); for (let i = 0; i < 3; i++) box(0.02, 0.12, 0.05, INK, -185.8 + i * 0.05, 1.2, -114.8);
  // ================= COUNTER (customers east of it, the kitchen west), display case, till, bell =================
  box(0.8, 0.95, 9.6, WOOD2, -179.5, 0.475, -123.8); box(0.03, 0.55, 9.6, CREAM, -179.085, 0.55, -123.8); box(0.035, 0.06, 9.6, RED, -179.08, 0.88, -123.8); box(0.92, 0.05, 9.72, MARBLE, -179.5, 0.975, -123.8); rect(-179.95, -179.05, -128.65, -118.95);
  { const z0 = -127.5; box(0.8, 0.03, 1.8, WOOD, -179.5, 1.32, z0); for (const z of [-0.6, 0, 0.6]) { pieInto(R0, FK[(Math.round(z * 10) + 10) % 5], -179.5, 1.0, z0 + z, 0.9); pieInto(R0, FK[(Math.round(z * 10) + 12) % 5], -179.5, 1.335, z0 + z, 0.9); }
    const gl = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.66, 1.86), new THREE.MeshPhongMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.2, shininess: 120, depthWrite: false })); gl.position.set(-179.5, 1.33, z0); G.add(gl);
    plane(label('TODAY · FRESH', RED, '#ffffff', 256, 64, 36), 0.6, 0.15, -179.06, 1.76, z0, Math.PI / 2); }
  box(0.42, 0.26, 0.36, '#3d3b3a', -179.5, 1.13, -119.6); box(0.36, 0.1, 0.22, INK, -179.45, 1.31, -119.6, 0, 0, 0.35); cyl(0.05, 0.06, 0.04, '#c9a14a', -179.4, 1.02, -120.2, 12); sph(0.04, '#c9a14a', -179.4, 1.06, -120.2);
  // ---------- customer side: two gingham tables, menu chalkboard, apron hook, plant ----------
  const ging = CT(64, 64, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(236,48,19,0.55)'; for (let i = 0; i < 4; i++) { g.fillRect(i * 16, 0, 8, H); g.fillRect(0, i * 16, W, 8); } }); ging.wrapS = ging.wrapT = THREE.RepeatWrapping; ging.repeat.set(3, 3);
  const gingM = new THREE.MeshLambertMaterial({ map: ging });
  for (const [x, z, k] of [[-175.2, -127.6, 'cherry'], [-174.6, -116.9, 'blue']]) { cyl(0.05, 0.06, 0.72, INK, x, 0.43, z, 8); cyl(0.3, 0.32, 0.04, INK, x, 0.09, z, 12); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 24), gingM); top.position.set(x, 0.8, z); G.add(top); ringC(x, z, 0.6);
    for (const s of [-1, 1]) { cyl(0.2, 0.2, 0.05, RED, x + s * 0.85, 0.5, z, 14); cyl(0.03, 0.03, 0.45, INK, x + s * 0.85, 0.25, z, 6); ringC(x + s * 0.85, z, 0.22); } pieInto(R0, k, x, 0.82, z, 0.8); }
  { const t = CT(512, 320, (g, W, H) => { g.fillStyle = '#26302b'; g.fillRect(0, 0, W, H); g.strokeStyle = WOOD; g.lineWidth = 14; g.strokeRect(7, 7, W - 14, H - 14); g.textBaseline = 'middle'; g.fillStyle = YEL; fitTxt(g, "TODAY'S PIES", 30, 46, W - 60, 44);
      FK.forEach((k, i) => { g.fillStyle = FLAV[k].c; g.fillRect(30, 84 + i * 40, 26, 26); g.fillStyle = '#f3f2f2'; fitTxt(g, FLAV[k].name, 70, 98 + i * 40, 300, 28, 800); }); g.fillStyle = YEL; fitTxt(g, 'SLICE 3 · WHOLE 15', 300, 98 + 4 * 40, 190, 22, 800); });
    plane(t, 1.6, 1.0, -176.4, 2.3, Z0 + 0.07); }
  const HOOK = { x: -177.2, z: -115.35, r: 0.9 }; box(1.4, 1.1, 0.04, WOOD, HOOK.x, 1.75, Z1 - 0.07); for (let i = 0; i < 3; i++) cyl(0.02, 0.02, 0.12, INK, HOOK.x - 0.45 + i * 0.45, 2.15, Z1 - 0.13, 6, Math.PI / 2);
  plane(label('APRON HOOK', INK, YEL, 320, 64, 36), 1.0, 0.2, HOOK.x, 2.48, Z1 - 0.1, Math.PI); cyl(0.5, 0.5, 0.012, YEL, HOOK.x, 0.075, HOOK.z, 22); cyl(0.42, 0.42, 0.014, INK, HOOK.x, 0.077, HOOK.z, 22);
  cyl(0.22, 0.17, 0.4, '#b0573a', X1 - 0.5, 0.27, Z0 + 0.5, 12); for (let k = 0; k < 7; k++) sph(0.2, '#3f7a52', X1 - 0.5 + Math.cos(k) * 0.14, 0.75 + (k % 3) * 0.18, Z0 + 0.5 + Math.sin(k) * 0.14); ringC(X1 - 0.5, Z0 + 0.5, 0.3);
  cyl(0.5, 0.5, 0.012, YEL, -183.2, 0.075, -122.4, 22); cyl(0.42, 0.42, 0.014, INK, -183.2, 0.077, -122.4, 22);
  // ---------- hanging sign + pendants ----------
  { const sX = -177.9, sY = 3.4, sZ = -124.6; for (const z of [sZ - 0.8, sZ + 0.8]) cyl(0.008, 0.008, 0.8, '#3d3b3a', sX, sY + 0.5, z, 3); const T = label("GRANNY CRUST'S PIES", YEL, WOOD2, 768, 96, 56); const s1 = plane(T, 3.2, 0.4, sX + 0.01, sY, sZ, Math.PI / 2); const s2 = s1.clone(); s2.rotation.y = -Math.PI / 2; s2.position.x = sX - 0.01; G.add(s2); }
  const bulbs = []; for (const [x, z] of [[-183.5, -128.2], [-183.8, -115.8], [-183.6, -119.4], [-177.6, -122], [-175.2, -127.6], [-174.6, -116.9]]) { cyl(0.01, 0.01, 1.0, '#3d3b3a', x, 4.4, z, 3); put(new THREE.CylinderGeometry(0.16, 0.26, 0.22, 12, 1, true), x, 3.82, z, RED); bulbs.push([x, 3.72, z]); }
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  const M4 = new THREE.Matrix4(); { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 8, 5), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), bulbs.length); bulbs.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  // ================= PIES (live: fill level, lattice, crimp, cuts, bake colour) =================
  const tinM = new THREE.MeshPhongMaterial({ color: 0xb8bcc0, shininess: 70 }), TIN_G = new THREE.CylinderGeometry(0.2, 0.17, 0.05, 24), BASE_G = new THREE.CylinderGeometry(0.188, 0.165, 0.04, 24), RIM_G = new THREE.TorusGeometry(0.186, 0.019, 6, 28);
  const FILL_G = new THREE.CylinderGeometry(0.172, 0.172, 1, 24), STRIP_G = new THREE.BoxGeometry(1, 0.012, 0.036), BUMP_G = new THREE.SphereGeometry(0.022, 8, 6), CUT_G = new THREE.BoxGeometry(0.38, 0.006, 0.008), cutM = new THREE.MeshBasicMaterial({ color: 0x3a2010 });
  const RAW = new THREE.Color('#f2dfb4'), GOLDC = new THREE.Color(CRUST), DARK = new THREE.Color('#5e3416');
  function makePie(fl, o = {}) { const g = new THREE.Group(), crustM = new THREE.MeshLambertMaterial({ color: RAW.clone() }), fillM = new THREE.MeshLambertMaterial({ color: FLAV[fl].c });
    const add = (geo, m, x, y, z) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); g.add(me); return me; };
    add(TIN_G, tinM, 0, 0.025, 0); add(BASE_G, crustM, 0, 0.032, 0); add(RIM_G, crustM, 0, 0.056, 0).rotation.x = Math.PI / 2; const fm = add(FILL_G, fillM, 0, 0.05, 0);
    const pie = { g, fl, crustM, b: 0,
      setFill(f) { fm.visible = f > 0.01; fm.scale.y = Math.max(0.001, 0.032 * f); fm.position.y = 0.046 + fm.scale.y / 2; },
      strip(dir, off) { const len = 2 * Math.sqrt(Math.max(0, 0.183 ** 2 - off ** 2)), s = add(STRIP_G, crustM, dir === 'x' ? 0 : off, dir === 'x' ? 0.08 : 0.086, dir === 'x' ? off : 0); s.scale.x = len; if (dir === 'z') s.rotation.y = Math.PI / 2; },
      bump(a) { const b = add(BUMP_G, crustM, Math.cos(a) * 0.188, 0.066, Math.sin(a) * 0.188); b.scale.set(1, 0.6, 1.4); b.rotation.y = -a; },
      cut(a) { add(CUT_G, cutM, 0, 0.093, 0).rotation.y = -a; },
      bake(b) { pie.b = b; if (b <= 1) crustM.color.copy(RAW).lerp(GOLDC, Math.max(0, b)); else crustM.color.copy(GOLDC).lerp(DARK, Math.min(1, (b - 1) / 0.4)); } };
    pie.setFill(o.fill ?? 0); if (o.lattice) { for (const z of [-0.09, 0, 0.09]) pie.strip('x', z); for (const x of [-0.09, 0, 0.09]) pie.strip('z', x); } if (o.crimp) for (let i = 0; i < 12; i++) pie.bump(i / 12 * Math.PI * 2);
    if (o.cuts) for (let i = 0; i < o.cuts; i++) pie.cut(i * Math.PI / o.cuts); if (o.b != null) pie.bake(o.b); return pie; }
  const WEDGE_G = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 8, 1, false, 0, Math.PI / 3), WTOP_G = new THREE.CylinderGeometry(0.165, 0.165, 0.012, 8, 1, false, 0.06, Math.PI / 3 - 0.12), PLATE_G = new THREE.CylinderGeometry(0.2, 0.17, 0.015, 18);
  const crustSolid = new THREE.MeshLambertMaterial({ color: CRUST }), plateM = new THREE.MeshLambertMaterial({ color: 0xffffff }), fillMats = Object.fromEntries(FK.map(k => [k, new THREE.MeshLambertMaterial({ color: FLAV[k].c })]));
  function makeSlice(fl) { const g = new THREE.Group(); g.add(new THREE.Mesh(PLATE_G, plateM)); const a = new THREE.Mesh(WEDGE_G, crustSolid); a.position.set(-0.06, 0.032, -0.06); g.add(a); const b = new THREE.Mesh(WTOP_G, fillMats[fl]); b.position.set(-0.06, 0.062, -0.06); g.add(b); return g; }
  const boxLid = label("GRANNY CRUST'S", '#f3f2f2', RED, 256, 64, 30);
  function makeBox(s = 1) { const g = new THREE.Group(), add = (geo, m, y, ry = 0) => { const me = new THREE.Mesh(geo, m); me.position.y = y; me.rotation.y = ry; g.add(me); return me; };
    add(new THREE.BoxGeometry(0.46, 0.14, 0.46), new THREE.MeshLambertMaterial({ color: '#f3f2f2' }), 0.07); const rb = new THREE.MeshLambertMaterial({ color: RED }); add(new THREE.BoxGeometry(0.47, 0.145, 0.04), rb, 0.07); add(new THREE.BoxGeometry(0.47, 0.145, 0.04), rb, 0.07, Math.PI / 2);
    const lid = add(new THREE.PlaneGeometry(0.3, 0.075), new THREE.MeshBasicMaterial({ map: boxLid }), 0.143); lid.rotation.x = -Math.PI / 2; lid.position.z = 0.12; g.scale.setScalar(s); return g; }
  // ================= WEARABLES: aprons, mitts, rolling pin (Granny + the player) =================
  const flourTex = CT(64, 96, (g, w, h) => { g.fillStyle = '#fbf8f2'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(190,180,160,0.45)'; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc((i * 37) % w, (i * 23) % h, 3 + (i % 4) * 2, 0, 7); g.fill(); } g.fillStyle = RED; g.fillRect(0, h - 7, w, 7); });
  const bakerTex = CT(64, 96, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = RED; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 9, w, 9); g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h);
    const cx = w / 2, cy = h * 0.5; g.fillStyle = CRUST; g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill(); g.fillStyle = '#b3202a'; g.beginPath(); g.arc(cx, cy, 12, 0, 7); g.fill(); g.strokeStyle = CRUST; g.lineWidth = 3;
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(cx - 12, cy + i * 6); g.lineTo(cx + 12, cy + i * 6); g.stroke(); g.beginPath(); g.moveTo(cx + i * 6, cy - 12); g.lineTo(cx + i * 6, cy + 12); g.stroke(); } });
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  function makeApron(map, small) { const g = new THREE.Group(); const f = new THREE.Mesh(new THREE.BoxGeometry(0.5, small ? 0.58 : 0.7, 0.02), new THREE.MeshLambertMaterial({ map })); f.position.set(0, small ? 0.88 : 0.96, 0.356); f.rotation.x = -0.08; g.add(f);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.016, 4, 20), LM(RED)); tie.position.set(0, 0.95, 0.03); tie.rotation.x = Math.PI / 2; tie.scale.set(1.05, 1.15, 1); g.add(tie);
    const bow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), LM(RED)); bow.position.set(0, 0.95, -0.3); bow.scale.set(1.6, 0.8, 0.6); g.add(bow); g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makeMitt() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 8), LM(RED)); m.scale.set(1, 1.2, 0.85); g.add(m); const t = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), LM(RED)); t.position.set(0.08, 0.02, 0.04); g.add(t);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), LM('#ffffff')); cuff.position.y = 0.12; g.add(cuff); g.position.set(0, -0.42, 0.01); g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makePin() { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.16, 8), LM(WOOD2)); g.add(h); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 14), LM('#d8b27a')); b.position.y = 0.33; g.add(b);
    const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.14, 8), LM(WOOD2)); h2.position.y = 0.65; g.add(h2); g.position.set(0, -0.42, 0.04); g.scale.setScalar(0.8); g.traverse(o => { o.renderOrder = 2; }); return g; }
  // ---------- GRANNY CRUST ----------
  const GR_LOOK = { elder: 1, fur: '#b9aea4', furDark: '#857a70', muzzle: '#f6f1ea', snout: '#ece4da', chin: '#ffffff', fluff: '#ffffff' };
  const granny = kit.makeFox({ key: 'grannyCrust', torso: ['#c2456a', '#f3f2f2', '#7a2340'], outfit: 'dress', mood: 'happy', eyes: ['#5a3a20', '#5a3a20'], look: GR_LOOK }); granny.scale.multiply(V(1.16, 0.97, 1.16));
  { const P = granny.userData && granny.userData.P; if (P && P.body) P.body.add(makeApron(flourTex)); if (P && P.arms && P.arms[1]) P.arms[1].add(makePin());
    if (P && P.head) { const gm = LM('#3d3b3a'), gl = new THREE.Group(); for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 6, 18), gm); r.position.set(s * 0.12, 0.05, 0.36); gl.add(r); } const br = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.014, 0.014), gm); br.position.set(0, 0.07, 0.37); gl.add(br);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), LM('#f4f1ec')); bun.position.set(0, 0.36, -0.14); gl.add(bun); gl.traverse(o => { o.renderOrder = 2; }); P.head.add(gl); } }
  const GS = { idle: [-180.7, -120.6, Math.PI / 2], bench: [-181.3, -127.6, -Math.PI * 0.75], oven: [-184.6, -119.4, -Math.PI * 0.6], slice: [-182.2, -116.7, -Math.PI * 0.3], rush: [-180.6, -127.9, Math.PI / 2] };
  granny.position.set(GS.idle[0], 0, GS.idle[1]); G.add(granny); const grCol = { c: [GS.idle[0], GS.idle[1], 0.5] }; cols.push(grCol);
  const placeGranny = k => { const s = GS[k]; granny.position.set(s[0], 0, s[1]); granny.userData.face0 = s[2]; grCol.c[0] = s[0]; grCol.c[1] = s[1]; };
  placeGranny('idle');
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'pie', color: RED, boardTitle: "Granny's best",
    room: { X0, X1, Z0, Z1 }, door: [-172.2, -122], keeper: granny, keeperRy: Math.PI / 2,
    games: [{ k: 'order', name: 'Pie order', color: RED }, { k: 'deliver', name: 'Whole pie run', color: YEL }],
    board: { x: X1 - 0.06, y: 2.35, z: -117.6, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: -173.0, z: -124.7, ry: -Math.PI / 2 }, hiringLine: 'BAKE SOME PIES',
    sun: [{ x: -173.3, z: -122, w: 1.8, d: 1.6 }], lamps: bulbs,
    browse: [[-176.4, -128.5, Math.PI], [-178.6, -126.9, -Math.PI / 2], [-174.6, -118.0, 0], [-178.6, -125.4, -Math.PI / 2]],
    looks: [['#3f9a5e', '#e8f5ec', '#1e5230'], ['#2e86b8', '#e0f2fe', '#16435c']], clock: { x: X1 - 0.08, y: 2.9, z: -126.2, ry: -Math.PI / 2 } });
  const grT = { key: 'pieGranny', obj: granny, ry: 0, r: 2.4 }, endT = { key: 'pieEnd', obj: granny, ry: 0, r: 8 };
  const ln = text => ({ who: 'granny', role: 'GRANNY CRUST', text });
  // ---------- customers (Meru regulars): each orders one pie, cut a set way ----------
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], fl: 'apple', n: 6, say: 'For the break room. Apple. Nobody argues about apple.' },
    { name: 'PELL', forW: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'], fl: 'cherry', n: 8, say: "The residents' tea. Cherry. Eight slices, they count." },
    { name: 'OTTO', forW: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], fl: 'meat', n: 4, say: 'Pell got cherry. I want meat pie. Four big slices.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], fl: 'blue', n: 6, say: 'Blueberry, for my stall. People stop for pie.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], fl: 'pumpkin', n: 8, say: 'Pumpkin. Sizzle says pie is not breakfast. Sizzle is wrong.' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], fl: 'meat', n: 6, say: 'Meat pie for the boat. Fish get boring.' },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], fl: 'cherry', n: 4, say: 'Cherry. Cut it in four. I eat fast.' }];
  const custCache = {};
  const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'pieCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, D = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), squish = () => tone(180 + Math.random() * 80, 0.04, 0.09, 'triangle'), chop = () => { tone(900, 0.04, 0.05, 'square'); tone(300, 0.05, 0.08); };
  const whoosh = () => { tone(110, 0.05, 0.5, 'sawtooth'); tone(160, 0.03, 0.4, 'sawtooth', 0.05); }, bell = () => { tone(1320, 0.06, 0.8); tone(1760, 0.04, 0.7, 'sine', 0.06); }, nope = () => tone(196, 0.05, 0.25, 'square');
  // ---------- prizes + what you wear ----------
  const tinOwned = () => save.count('goldenPieTin') > 0;
  const own3 = () => ({ apron: !!save.stat('pieApron', false), mitts: !!save.stat('pieMitts', false), pin: !!save.stat('piePin', false) });
  const wearNow = () => { const o = own3(), w = save.stat('pieWear', null) || {}; return { apron: o.apron && !!w.apron, mitts: o.mitts && !!w.mitts, pin: o.pin && !!w.pin }; };
  const setWear = (k, v) => { const w = { ...(save.stat('pieWear', null) || {}) }; w[k] = v; save.setStat('pieWear', w); };
  function giveGift() { save.setStat('pieClears', save.stat('pieClears', 0) + 1); const o = own3();
    if (!o.apron) { save.setStat('pieApron', true); setWear('apron', true); return { kind: 'apron', label: "BAKER'S APRON" }; }
    if (!save.stat('pieHotOnce', false)) { save.setStat('pieHotOnce', true); save.give('hotPie'); return { kind: 'hot', label: 'HOT PIE' }; }
    if (!o.mitts) { save.setStat('pieMitts', true); setWear('mitts', true); return { kind: 'mitts', label: 'OVEN MITTS' }; }
    if (!tinOwned()) { save.give('goldenPieTin'); return { kind: 'tin', label: 'GOLDEN PIE TIN' }; }
    if (!o.pin) { save.setStat('piePin', true); setWear('pin', true); return { kind: 'pin', label: 'ROLLING PIN' }; }
    save.give('hotPie'); return { kind: 'hot', label: 'HOT PIE' }; }
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts) => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + '</div>'; const body = pick.lastChild;
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- input: TAP (pots, pour, oven, rush) + DRAG (pin, strips, crimp, knife), phone + mouse ----------
  const ptr = { down: false, x: 0, y: 0, px: 0, py: 0, id: null, t: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.px = e.clientX; ptr.y = ptr.py = e.clientY; ptr.t = performance.now(); e.stopPropagation(); press(); drag(0); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; const now = performance.now(), dt = Math.min(0.1, (now - ptr.t) / 1000); ptr.t = now; ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(dt); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (J) J.pinPrev = null; moveTool(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const camPos = V(), rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), pl0 = new THREE.Plane(V(0, 1, 0), 0), hitP = V();
  const floorHit = y => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); pl0.constant = -y; return rc.ray.intersectPlane(pl0, hitP) ? hitP.clone() : null; };
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  // ---------- tools that follow the finger ----------
  const pinT = new THREE.Group(), pinSpin = new THREE.Group(); pinT.add(pinSpin);
  { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.34, 14), LM('#d8b27a')); b.rotation.z = Math.PI / 2; pinSpin.add(b); const gr = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.004, 0.012), LM(WOOD)); gr.position.y = 0.034; pinSpin.add(gr);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.016, 0.1, 8), LM(WOOD2)); h.rotation.z = Math.PI / 2; h.position.x = s * 0.22; pinT.add(h); } } pinT.visible = false; pinT.renderOrder = 5; G.add(pinT);
  const TOOLS = { knife: (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.004), new THREE.MeshPhongMaterial({ color: 0xdfe3e6, shininess: 90 })); bl.position.y = -0.04; g.add(bl); const h = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.08, 0.012), LM(WOOD2)); h.position.y = 0.06; g.add(h); return g; })(),
    strip: (() => { const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.03), LM('#f2dfb4')); g.add(s); return g; })() };
  Object.values(TOOLS).forEach(t => { t.visible = false; t.renderOrder = 5; G.add(t); });
  const TOOL_OF = { top: 'strip', crimp: 'strip', slice: 'knife' };
  function moveTool() { const kind = J && TOOL_OF[J.sub]; for (const [k, t] of Object.entries(TOOLS)) t.visible = !!kind && k === kind && ptr.down; if (!kind || !J.pie) return;
    const t = TOOLS[kind]; ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); camera.getWorldPosition(camPos);
    const d = camPos.distanceTo(J.pie.g.getWorldPosition(tmp)) - 0.12; t.position.copy(rc.ray.origin).addScaledVector(rc.ray.direction, d); t.quaternion.copy(camera.quaternion); }
  // ---------- overlays: dots to drag along ----------
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotDone = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true }), dotGeo = new THREE.SphereGeometry(touch ? 0.018 : 0.013, 8, 6);
  const own = o => { J.objs.push(o); G.add(o); return o; };
  function makePath(pts) { clearDots(); J.path = { pts: pts.map(p => { const d = new THREE.Mesh(dotGeo, dotM); d.position.copy(p); d.renderOrder = 4; own(d); return { p, d }; }), i: 0, wob: 0 }; }
  function clearDots() { if (J && J.path) { for (const q of J.path.pts) G.remove(q.d); J.path = null; } }
  function pathHit(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 3, Pa.pts.length); j++) if (dist(scrW(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].d.material = dotDone; onPathPoint(j); } Pa.i = hit + 1; }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrW(Pa.pts[j].p))); if (md > R * 2.6) Pa.wob += dt; } }
  function onPathPoint(j) { if (J.sub === 'crimp') { squish(); J.pie.bump(J.crimpA[j]); } else if (J.sub === 'top') { if (j === 0) squish(); } else if (J.sub === 'slice') { if (j % 2 === 0) chop(); } }
  // ---------- flights (pies to the oven / board / box, slices to the customers) ----------
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  // ================= THE ORDER =================
  const RT = 0.22, addGold = n => { n = Math.max(0, Math.round(n * (tinOwned() ? 1.25 : 1))); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  function startVisit() { const n = save.stat('pieVisits', 0), ci = n % CUST.length, C = CUST[ci]; save.setStat('pieVisits', n + 1);
    const others = FK.filter(k => k !== C.fl).sort(() => Math.random() - 0.5).slice(0, 3);
    J = { ci, C, step: 1, sub: 'roll', gold: 0, pause: 0, t: 0, st: 0, perfect: 0, wrong: 0, objs: [], flies: [], others, sx: 0.09, sz: 0.09, pinPrev: null };
    J.dough = own(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 28), new THREE.MeshLambertMaterial({ color: '#f1dfb8' }))); setDough();
    const ring = own(new THREE.Mesh(new THREE.RingGeometry(0.214, 0.228, 44), new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide }))); ring.rotation.x = -Math.PI / 2; ring.position.set(DOUGH.x, DOUGH.y + 0.004, DOUGH.z); J.ring = ring;
    pinT.visible = true; pinT.position.set(DOUGH.x + 0.34, DOUGH.y + 0.035, DOUGH.z + 0.05); pinT.rotation.y = Math.PI / 2;
    placeGranny('bench'); busy = 'job'; bell(); toast('STEP 1 OF 6 · ROLL THE DOUGH', 1.8); }
  const setDough = () => { const k = Math.min(1, (J.sx + J.sz - 0.18) / 0.26), th = 0.06 - 0.047 * k; J.dough.scale.set(J.sx, th, J.sz); J.dough.position.set(DOUGH.x, DOUGH.y + th / 2, DOUGH.z); };
  // ---- 1 ROLL ----
  function rollDrag() { const p = floorHit(DOUGH.y + 0.036); if (!p) return; p.x = Math.max(DOUGH.x - 0.45, Math.min(DOUGH.x + 0.45, p.x)); p.z = Math.max(DOUGH.z - 0.35, Math.min(DOUGH.z + 0.35, p.z)); pinT.position.copy(p); if (!ptr.down) return;
    if (J.pinPrev) { const dx = p.x - J.pinPrev.x, dz = p.z - J.pinPrev.z, d = Math.hypot(dx, dz); if (d > 0.002) { const want = Math.atan2(-dx, -dz); let df = want - pinT.rotation.y; df = ((df + Math.PI / 2) % Math.PI + Math.PI) % Math.PI - Math.PI / 2; pinT.rotation.y += df * 0.35; pinSpin.rotation.x += d / 0.034;
        const ex = (p.x - DOUGH.x) / (J.sx + 0.12), ez = (p.z - DOUGH.z) / (J.sz + 0.12); if (ex * ex + ez * ez < 1.4) { J.sx = Math.min(RT, J.sx + Math.abs(dx) * 0.3); J.sz = Math.min(RT, J.sz + Math.abs(dz) * 0.3); setDough(); if (Math.random() < 0.12) squish(); } } }
    J.pinPrev = p; }
  function rollTick() { if (J.sx >= RT - 0.004 && J.sz >= RT - 0.004) { const fast = J.st < 12, g2 = addGold(Math.max(6, 16 - Math.floor(J.st / 2))); if (fast) J.perfect++; ding(); J.ring.material.color.set(0x3f9a5e);
      toast((fast ? 'GRANNY: "LOVELY AND ROUND, DEAR."' : 'GRANNY: "THERE WE ARE, DEAR. NICE AND THIN."') + ' +' + g2, 1.6); NEXT('rolled', beginFill, 1.2); } }
  // ---- 2 FILL ----
  function beginFill() { J.step = 2; J.st = 0; J.wrong = 0; pinT.visible = false; J.dough.visible = false; J.ring.visible = false; J.pie = makePie(J.C.fl, { fill: 0 }); J.pie.g.position.copy(DOUGH); own(J.pie.g); pop(); J.sub = 'pick'; J.f = 0; }
  const potPos = p => p.g.position.clone().add(V(0, 0.1, 0));
  function pickPot() { const p = nearestOf(POTS, potPos, 1.5); if (!p) return; if (p.k !== J.C.fl) { J.wrong++; nope(); toast('GRANNY: "THAT\'S ' + FLAV[p.k].name + ', DEAR. ' + J.C.name + ' WANTED ' + FLAV[J.C.fl].name + '."', 1.8); return; }
    J.pot = p; J.sub = 'pour'; J.pt = 0; J.f = 0; pop();
    J.stream = own(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 1, 6), fillMats[p.k])); J.stream.visible = false; }
  const POUR_AT = () => V(DOUGH.x + 0.27, DOUGH.y + 0.4, DOUGH.z - 0.1);
  function pourTick(dt) { const p = J.pot; J.pt += dt; const k = Math.min(1, J.pt / 0.45); p.g.position.lerpVectors(p.home, POUR_AT(), k * k * (3 - 2 * k)); p.g.rotation.z = 1.15 * k;
    if (k >= 1) { J.f = Math.min(1, J.f + dt * 0.3); J.pie.setFill(J.f); const lip = p.g.localToWorld(V(-0.095, 0.16, 0)), bot = V(DOUGH.x, DOUGH.y + 0.05 + 0.032 * J.f, DOUGH.z), L2 = lip.distanceTo(bot);
      J.stream.visible = true; J.stream.position.copy(lip).add(bot).multiplyScalar(0.5); J.stream.scale.y = L2; J.stream.quaternion.setFromUnitVectors(V(0, 1, 0), bot.clone().sub(lip).normalize()); if (Math.random() < 0.2) tone(300 + J.f * 500, 0.015, 0.06, 'sine');
      if (J.f >= 1) stopPour(); } }
  function stopPour() { if (J.sub !== 'pour' || J.pt < 0.45) return; const f = J.f, good = f >= 0.78 && f <= 0.92, spill = f >= 1, g2 = addGold(Math.max(2, (good ? 14 : spill ? 5 : f > 0.6 ? 9 : 6) - J.wrong)); if (good && !J.wrong) J.perfect++;
    if (J.stream) J.stream.visible = false; good ? ding() : pop(); toast((good ? 'GRANNY: "JUST RIGHT, DEAR."' : spill ? 'GRANNY: "OOH, A LITTLE OVER. I\'LL WIPE IT."' : 'GRANNY: "A BIT SHY, DEAR. IT\'LL DO."') + ' +' + g2, 1.6);
    if (spill) J.pie.setFill(0.95); J.potBack = J.pot; NEXT('poured', beginTop, 1.2); }
  // ---- 3 TOP: 6 lattice strips, then crimp the edge ----
  const LINES = [['x', -0.09], ['x', 0], ['x', 0.09], ['z', -0.09], ['z', 0], ['z', 0.09]];
  function beginTop() { J.step = 3; J.st = 0; J.li = 0; J.wobT = 0; J.sub = 'top'; J.pie.g.updateMatrixWorld(true); lineAt(); }
  function lineAt() { const [dir, off] = LINES[J.li], h = 0.9 * Math.sqrt(0.183 ** 2 - off ** 2), pts = []; for (let i = 0; i < 5; i++) { const t = -h + (2 * h) * i / 4; pts.push(J.pie.g.localToWorld(dir === 'x' ? V(t, 0.1, off) : V(off, 0.1, t))); } makePath(pts); }
  function topTick() { const Pa = J.path; if (!Pa || Pa.i < Pa.pts.length) return;
    if (J.sub === 'top') { J.wobT += Pa.wob; const [dir, off] = LINES[J.li]; J.pie.strip(dir, off); pop(); J.li++; if (J.li < LINES.length) lineAt();
      else { J.sub = 'crimp'; J.crimpA = []; const pts = []; for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI * 2; J.crimpA.push(a); pts.push(J.pie.g.localToWorld(V(Math.cos(a) * 0.19, 0.075, Math.sin(a) * 0.19))); } makePath(pts); toast('NOW PINCH ROUND THE EDGE', 1.4); } return; }
    if (J.sub === 'crimp') { J.wobT += Pa.wob; clearDots(); const clean = J.wobT < 0.6, g2 = addGold(12 + (clean ? 4 : 0)); if (clean) J.perfect++; ding(); toast((clean ? 'GRANNY: "NEAT AS A PIN, DEAR."' : 'GRANNY: "HOMEMADE LOOK. I LIKE IT."') + ' +' + g2, 1.6); NEXT('topped', beginOven, 1.2); } }
  // ---- 4 OVEN: your pie + two of Granny's, tap each when golden ----
  const RINGG = new THREE.RingGeometry(0.215, 0.245, 32);
  function beginOven() { J.step = 4; J.st = 0; J.sub = 'toOven'; placeGranny('oven'); whoosh();
    const g1 = makePie(J.others[0], { fill: 0.86, lattice: true, crimp: true, b: 0 }), g2 = makePie(J.others[1], { fill: 0.86, lattice: true, crimp: true, b: 0 }); g1.g.position.copy(OVENP[0]); g2.g.position.copy(OVENP[2]); own(g1.g); own(g2.g);
    J.ov = [{ pie: g1, b: 0.4, mine: false }, { pie: J.pie, b: 0, mine: true }, { pie: g2, b: 0.2, mine: false }]; J.ov.forEach((o, i) => { o.pie.bake(o.b); const r = own(new THREE.Mesh(RINGG, new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true, side: THREE.DoubleSide }))); r.rotation.x = -Math.PI / 2; r.position.copy(OVENP[i]).add(V(0, 0.1, 0)); r.renderOrder = 4; r.visible = false; o.ring = r; });
    fly(J.pie.g, OVENP[1], 1.3, 0.35, () => { J.sub = 'oven'; J.ov.forEach(o => { o.ring.visible = true; }); toast('STEP 4 OF 6 · TAP EACH PIE WHEN IT GOES GREEN', 1.8); }); }
  const GOLD_LO = 0.85, GOLD_HI = 1.08;
  function ovenTick(dt) { for (const o of J.ov) { if (o.out) { if (o.slide != null) { o.slide += dt; o.pie.g.position.x = OVENP[J.ov.indexOf(o)].x + Math.min(0.6, o.slide * 1.6); if (o.slide > 0.45) { o.slide = null; o.pie.g.visible = false; } } continue; }
      o.b += dt / 8; o.pie.bake(o.b); o.ring.material.color.set(o.b < GOLD_LO ? 0xffd23a : o.b <= GOLD_HI ? 0x3f9a5e : 0xec3013); if (o.b >= 1.35) pullPie(o, true); }
    if (J.ov.every(o => o.out) && J.sub === 'oven') { const all = J.ov.every(o => o.grade === 'GOLDEN'); if (all) J.perfect++; ding(); toast(all ? 'GRANNY: "THREE GOLDEN PIES. I COULD CRY, DEAR."' : 'GRANNY: "OUT THEY COME. SMELL THAT, DEAR."', 1.8); NEXT('baked', beginSlice, 1.3); } }
  function pullPie(o, auto) { if (o.out) return; o.out = true; o.slide = 0; o.ring.visible = false; o.grade = o.b < GOLD_LO ? 'PALE' : o.b <= GOLD_HI ? 'GOLDEN' : 'DARK'; const g2 = addGold(o.grade === 'GOLDEN' ? 6 : o.grade === 'PALE' ? 3 : auto ? 1 : 2); whoosh();
    toast((o.grade === 'GOLDEN' ? 'GOLDEN · ' : o.grade === 'PALE' ? 'A TOUCH PALE · ' : 'A BIT DARK · ') + FLAV[o.pie.fl].name + ' +' + g2, 1.1); }
  function ovenTap() { const o = nearestOf(J.ov.filter(q => !q.out), q => q.pie.g.position.clone().add(V(0, 0.06, 0)), 2.2); if (o) pullPie(o, false); }
  // ---- 5 SLICE on the board ----
  function beginSlice() { J.step = 5; J.st = 0; J.sub = 'toBoard'; placeGranny('slice'); const mine = J.pie; mine.g.visible = true; mine.g.position.copy(OVENP[1]).add(V(0.6, 0, 0));
    J.ov.forEach((o, i) => { if (o.mine) return; o.pie.g.visible = true; for (let k = 0; k < 3; k++) o.pie.cut(k * Math.PI / 3); o.pie.g.position.copy(RP[i === 0 ? 0 : 1]); o.pie.g.scale.setScalar(1.25); });
    J.case = makePie(J.others[2], { fill: 0.86, lattice: true, crimp: true, cuts: 3, b: 1 }); J.case.g.position.copy(RP[2]); J.case.g.scale.setScalar(1.25); own(J.case.g);
    fly(mine.g, BOARD, 1.2, 0.5, () => { J.sub = 'slice'; J.cuts = J.C.n / 2; J.cutI = 0; J.wobT = 0; mine.g.updateMatrixWorld(true); cutAt(); }); }
  const cutAng = i => i * Math.PI / J.cuts + 0.35;
  function cutAt() { const a = cutAng(J.cutI), pts = []; for (let i = 0; i < 5; i++) { const t = -0.17 + 0.34 * i / 4; pts.push(J.pie.g.localToWorld(V(Math.cos(a) * t, 0.1, Math.sin(a) * t))); } makePath(pts); }
  function sliceTick() { const Pa = J.path; if (!Pa || Pa.i < Pa.pts.length) return; J.wobT += Pa.wob; J.pie.cut(cutAng(J.cutI)); chop(); J.cutI++;
    if (J.cutI < J.cuts) { cutAt(); return; } clearDots(); const clean = J.wobT < 0.5, g2 = addGold(10 + (clean ? 4 : 0)); if (clean) J.perfect++; ding();
    toast((clean ? 'GRANNY: "' + J.C.n + ' EVEN SLICES. LOVELY."' : 'GRANNY: "' + J.C.n + ' SLICES. NOBODY WILL MEASURE, DEAR."') + ' +' + g2, 1.6);
    J.box = makeBox(); J.box.position.copy(BOXP); J.box.visible = false; own(J.box); NEXT('sliced', beginRush, 1.3); }
  // ---- 6 PIE RUSH at the counter ----
  const RP = [-125.3, -124.6, -123.9].map(z => V(-179.5, 1.0, z)), BOXP = V(-179.5, 1.0, -123.15);
  const Q = [[-178.45, -124.4], [-177.4, -123.4], [-176.4, -122.5], [-175.4, -121.6]];
  function bubble(want) { const F = want === 'box' ? null : FLAV[want]; const t = CT(256, 128, (g, W, H) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8);
      g.fillStyle = F ? F.c : RED; g.fillRect(18, 22, 84, 84); g.lineWidth = 5; g.strokeRect(18, 22, 84, 84); g.fillStyle = INK; g.textBaseline = 'middle'; fitTxt(g, F ? F.name : 'MY PIE', 116, 48, 126, 34); fitTxt(g, F ? 'A SLICE' : 'BOXED', 116, 88, 126, 24, 800); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); s.scale.set(0.72, 0.36, 1); s.renderOrder = 6; own(s); return s; }
  function beginRush() { J.step = 6; J.st = 0; J.sub = 'rush'; placeGranny('rush'); J.pie.g.visible = false; J.box.visible = true; pop(); J.served = 0; J.rushWrong = 0;
    const ids = [1, 2, 3].map(k => (J.ci + k) % CUST.length).concat([J.ci]); const fl = [J.others[0], J.others[1], J.others[2]];
    J.q = ids.map((ci, i) => { const f = custFox(ci); f.visible = true; f.position.set(Q[i][0] + 1.5, 0.02, Q[i][1] + 0.4); f.rotation.y = -Math.PI / 2; f.userData.mood = f.userData.base = 'neutral'; f.userData.sit = false;
      const want = i === 3 ? 'box' : fl[Math.floor(Math.random() * 3)]; return { ci, f, want, bub: bubble(want), tx: Q[i][0], tz: Q[i][1], wp: [], arr: false, leave: false, out: false, pt: 0, wrong: 0, carry: null }; });
    toast('STEP 6 OF 6 · THE QUEUE! TAP THE PIE EACH ONE WANTS', 2); }
  const front = () => J.q.find(q => !q.leave);
  function custTick(q, dt) { const f = q.f, dx = q.tx - f.position.x, dz = q.tz - f.position.z, d = Math.hypot(dx, dz);
    if (d > 0.04) { const s = Math.min(d, dt * 1.6); f.position.x += dx / d * s; f.position.z += dz / d * s; turnTo(f, Math.atan2(dx, dz), dt); kit.animFox && kit.animFox(f, dt, 1.6); q.arr = false; }
    else if (q.wp.length) { const n = q.wp.shift(); q.tx = n[0]; q.tz = n[1]; }
    else { q.arr = true; if (q.leave && !q.out) { q.out = true; f.visible = false; q.bub.visible = false; if (q.carry) q.carry.visible = false; } turnTo(f, -Math.PI / 2, dt); kit.animFox && kit.animFox(f, dt, 0); }
    q.bub.position.set(f.position.x, 2.3, f.position.z); q.bub.visible = !q.leave && f.visible;
    if (q.carry && q.carry.parent === G && !q.flying) q.carry.position.set(f.position.x + Math.sin(f.rotation.y) * 0.38, 0.95, f.position.z + Math.cos(f.rotation.y) * 0.38); }
  function rushTick(dt) { J.q.forEach(q => custTick(q, dt)); const F = front(); if (F && F.arr) F.pt += dt; }
  function rushTap() { const F = front(); if (!F || !F.arr || F.serving) return; const opts = [...RP.map((p, i) => ({ p, fl: J.others[i] })), { p: BOXP, fl: 'box' }];
    const o = nearestOf(opts, q => q.p.clone().add(V(0, 0.08, 0)), 1.9); if (!o) return;
    if (o.fl !== F.want) { F.wrong++; J.rushWrong++; nope(); toast(o.fl === 'box' ? 'GRANNY: "THAT ONE\'S ' + J.C.name + '\'S, DEAR."' : 'GRANNY: "THAT\'S ' + FLAV[o.fl].name + ', DEAR. THEY WANT ' + (F.want === 'box' ? 'THEIR BOX' : FLAV[F.want].name) + '."', 1.6); return; }
    F.serving = true;
    if (o.fl === 'box') { F.carry = J.box; F.flying = true; fly(J.box, F.f.position.clone().add(V(-0.38, 0.95, 0)), 0.7, 0.3, () => { F.flying = false; beginReveal(F); }); pop(); return; }
    const s = makeSlice(o.fl); s.position.copy(o.p).add(V(0, 0.05, 0)); own(s); F.carry = s; F.flying = true; pop();
    const g2 = addGold(Math.max(4, 12 - Math.floor(F.pt / 1.5)) - 2 * F.wrong); J.served++;
    fly(s, F.f.position.clone().add(V(-0.38, 0.95, 0)), 0.6, 0.35, () => { F.flying = false; F.f.userData.mood = F.f.userData.base = 'happy'; F.f.userData.hop = 1; tone(784, 0.04, 0.3);
      toast(CUST[F.ci].name + ' · THANK YOU! +' + g2, 1.1); F.leave = true; F.wp = [[-174.4, -122.0], [-171.0, -122.0]]; const n = F.wp.shift(); F.tx = n[0]; F.tz = n[1]; let j = 0; J.q.forEach(q => { if (!q.leave) { q.tx = Q[j][0]; q.tz = Q[j][1]; j++; } }); }); }
  // ---- the reveal: the order customer takes the boxed pie and pays ----
  function beginReveal(F) { J.sub = 'reveal'; J.t = 0; F.f.userData.mood = F.f.userData.base = 'happy'; F.f.userData.hop = 1; F.bub.visible = false; F.leave = true; F.tx = F.f.position.x; F.tz = F.f.position.z; F.out = true; J.revF = F;
    if (!J.rushWrong) J.perfect++; const g2 = addGold(12); tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7); const C = J.C, Fl = FLAV[C.fl];
    setCard('rv', head('ALL DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(C) + row(Fl.c, Fl.name + ' PIE · ' + C.n + ' SLICES', '\u2713', true) + row(YEL, 'QUEUE SERVED · ' + J.served, '\u2713', true)
      + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['It smells like a holiday.', 'Still warm. I may not share it.', 'Granny, you have a new helper!'][J.ci % 3] + '"</div></div>');
    toast(C.name + ' PAYS · +' + g2 + ' GOLD', 2.2); }
  let J0p = 0; function endVisit() { J0p = J.perfect; const C = J.C, gold = J.gold, perfect = J.perfect >= 5, gift = giveGift(); if (perfect && gift.kind !== 'hot') save.give('hotPie'); save.best('pieBest', gold); stop();
    toast('ORDER DONE · +' + gold + ' GOLD · ' + gift.label + (perfect && gift.kind !== 'hot' ? ' + HOT PIE' : ''), 3.5); const nm = cap(C.name), pf = J0p;
    K.finish('order', pf >= 5 ? 3 : pf >= 3 ? 2 : 1, gold, !K.stars('order'));
    const OP = ['A warm box out the door, dear.', nm + ' is a happy customer, dear.', 'Another happy tummy, dear.'][save.stat('pieClears', 0) % 3];
    const GL = { apron: "Your own baker's apron, dear. The hook by the door takes it off.", mitts: 'Oven mitts for you, dear. The apron hook takes them off.', tin: 'My golden pie tin, dear. Customers tip a quarter more.', pin: 'My oak rolling pin, dear. Swing it with 1. It bonks bandits.' }[gift.kind] || OP + ' Have a hot pie.';
    sayTo(endT, [ln(GL + (!D && (offerD = pickDoor()) ? ' ' + cap(offerD.who) + ' wants a whole pie too.' : ''))]); }
  function jobTick(dt) { J.t += dt; J.st += dt; if (J.flies.length) flyTick(dt); if (J.potBack) { const p = J.potBack, k = Math.min(1, dt * 4); p.g.position.lerp(p.home, k); p.g.rotation.z *= 1 - k; if (p.g.position.distanceTo(p.home) < 0.005) { p.g.position.copy(p.home); p.g.rotation.z = 0; J.potBack = null; } }
    if (J.q) J.q.forEach(q => { if (J.sub !== 'rush') custTick(q, dt); });
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } drawCard(); return; }
    const s = J.sub; if (s === 'roll') rollTick(); else if (s === 'pour') pourTick(dt); else if (s === 'top' || s === 'crimp') topTick(); else if (s === 'oven') ovenTick(dt); else if (s === 'slice') sliceTick(); else if (s === 'rush') rushTick(dt);
    else if (s === 'reveal' && J.t > 3.2) { endVisit(); return; } if (J) drawCard(); }
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'pick') pickPot(); else if (s === 'pour') stopPour(); else if (s === 'oven') ovenTap(); else if (s === 'rush') rushTap(); }
  function drag(dt) { if (!J || J.pause > 0) return; moveTool(); const s = J.sub; if (s === 'roll') rollDrag(); else if (s === 'top' || s === 'crimp' || s === 'slice') pathHit(dt); }
  // ---- the order card ----
  const STEP_N = ['ROLL', 'FILL', 'TOP', 'OVEN', 'SLICE', 'SERVE'];
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 2px;font-size:10px;font-weight:900;border:2px solid #201e1d;overflow:hidden;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J || J.sub === 'reveal') return; const s = J.sub, C = J.C, F = FLAV[C.fl]; let next = 'NICE', det = '', key = s + J.step;
    if (s === 'roll') { const a = (J.sx - 0.09) / (RT - 0.09), b = (J.sz - 0.09) / (RT - 0.09); key += Math.round(a * 20) + '_' + Math.round(b * 20); next = 'DRAG THE PIN BOTH WAYS TO THE RED RING'; det = lab('ACROSS') + meter(a, YEL) + lab('UP + DOWN') + meter(b, YEL); }
    else if (s === 'pick') { key += J.wrong; next = 'TAP THE ' + F.name + ' POT'; }
    else if (s === 'pour') { key += Math.round(J.f * 50); next = 'TAP TO STOP IN THE GOLD BAND'; det = lab('FILLING') + '<div style="position:relative;height:16px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:78%;width:14%;top:0;bottom:0;background:#ffd23a"></div><div style="position:absolute;left:0;top:4px;height:4px;width:' + (Math.min(1, J.f) * 100).toFixed(1) + '%;background:' + INK + '"></div></div>'; }
    else if (s === 'top') { const i = J.path ? J.path.i : 0; key += J.li + '_' + i; next = 'DRAG ALONG THE DOTS · STRIP ' + Math.min(6, J.li + 1) + ' OF 6'; det = row(CRUST, 'LATTICE', J.li + '/6', false) + row(CRUST, 'CRIMP THE EDGE', '\u2014', false); }
    else if (s === 'crimp') { const i = J.path ? J.path.i : 0; key += i; next = 'DRAG ROUND THE EDGE TO PINCH IT'; det = row(CRUST, 'LATTICE', '6/6', true) + row(CRUST, 'CRIMP THE EDGE', i + '/12', false); }
    else if (s === 'toOven' || s === 'oven') { key += J.ov.map(o => o.out ? o.grade[0] : Math.round(o.b * 10)).join(''); next = 'TAP EACH PIE WHEN ITS RING GOES GREEN';
      det = J.ov.map(o => row(FLAV[o.pie.fl].c, FLAV[o.pie.fl].name + (o.mine ? ' · YOURS' : ''), o.out ? o.grade : Math.min(130, Math.round(o.b / GOLD_LO * 100)) + '%', o.out && o.grade === 'GOLDEN')).join(''); }
    else if (s === 'toBoard' || s === 'slice') { const i = J.cutI || 0; key += i + '_' + (J.path ? J.path.i : 0); next = 'DRAG ACROSS THE PIE · CUT ' + Math.min(J.cuts || 1, i + 1) + ' OF ' + (C.n / 2); det = row(F.c, 'CUT INTO ' + C.n, (i * 2) + '/' + C.n, false); }
    else if (s === 'rush') { const Fq = front(); key += J.q.map(q => (q.leave ? 1 : 0) + (q === Fq && q.arr ? Math.floor(q.pt) : '')).join(''); next = Fq && Fq.arr ? 'TAP THE PIE ' + CUST[Fq.ci].name + ' WANTS' : 'NEXT, PLEASE!';
      det = J.q.map(q => { const w = q.want === 'box' ? { c: RED, name: 'THE BOXED PIE' } : FLAV[q.want]; return row(w.c, CUST[q.ci].name + ' · ' + w.name, q.leave ? '\u2713' : q === Fq ? 'NOW' : '\u2014', q.leave); }).join('') + (Fq && Fq.arr && Fq.want !== 'box' ? lab('PATIENCE') + meter(1 - Fq.pt / 12, '#3f9a5e') : ''); }
    else if (s === 'sliced' || s === 'baked' || s === 'topped' || s === 'poured' || s === 'rolled') return;
    setCard(key, head('STEP ' + J.step + ' OF 6', F.name + ' PIE · ' + C.n + ' SLICES') + foot(next) + '<div style="padding:8px 10px 10px">' + who(C) + (innerHeight >= 720 ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { clearDots(); J.objs.forEach(o => o.parent && o.parent.remove(o)); (J.q || []).forEach(q => { q.f.visible = false; q.f.userData.mood = q.f.userData.base = 'neutral'; }); POTS.forEach(p => { p.g.position.copy(p.home); p.g.rotation.z = 0; }); }
    J = null; ptr.down = false; pinT.visible = false; Object.values(TOOLS).forEach(t => { t.visible = false; }); hideCard(); hidePick(); placeGranny('idle'); }
  // ================= APRON HOOK (what you wear) =================
  let hookP = null; function startHook(P) { busy = 'hook'; hookP = P; Object.assign(P, { x: HOOK.x, z: HOOK.z, yaw: Math.PI, sp: 0 }); hookPanel(); }
  function hookPanel() { const o = own3(), w = wearNow(), tg = k => { setWear(k, !w[k]); tone(880, 0.04, 0.2, 'triangle'); hookPanel(); };
    showPick('APRON HOOK', 'GRANNY', "WHAT YOU WEAR IN MERU", [...(o.apron ? [{ label: "BAKER'S APRON · " + (w.apron ? 'ON' : 'OFF'), on: w.apron, go: () => tg('apron') }] : []), ...(o.mitts ? [{ label: 'OVEN MITTS · ' + (w.mitts ? 'ON' : 'OFF'), on: w.mitts, go: () => tg('mitts') }] : []),
      ...(o.pin ? [{ label: 'ROLLING PIN · MELEE ' + (w.pin ? 'ON' : 'OFF'), on: w.pin, go: () => tg('pin') }] : []), { label: 'DONE', primary: true, go: () => closeHook() }]); }
  function closeHook() { hidePick(); busy = null; hookP = null; toast(wearNow().pin ? 'ROLLING PIN READY · 1 = BONK' : 'LOOKING LIKE A BAKER', 1.6); }
  // ---------- the player's wearables (re-attached after any outfit swap), the rolling pin replaces the sword ----------
  let worn = null, lastP = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearNow(), key = (w.apron ? 1 : 0) + '|' + (w.mitts ? 1 : 0) + '|' + (w.pin ? 1 : 0) + '|' + (D ? 1 : 0);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox)) { if (U.P.sword && U.P.sword.visible === w.pin) U.P.sword.visible = !w.pin; return; }
    if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; const P = U.P;
    if (w.apron && P.body) { const a = makeApron(bakerTex, true); P.body.add(a); worn.parts.push(a); }
    if (w.mitts && P.fore && P.hands) P.hands.forEach(H => { const m = makeMitt(); m.position.set(0, -0.06, 0.01); H.g.add(m); worn.parts.push(m); });   /* s630: jointed = the mitt sits on the real paw */
    else if (w.mitts && P.arms) P.arms.forEach(arm => { const m = makeMitt(); arm.add(m); worn.parts.push(m); });
    if (P.sword) P.sword.visible = !w.pin; if (w.pin && P.fore && P.hands && P.hands[1]) { const p = makePin(); p.position.set(0, -0.09, 0.03); P.hands[1].g.add(p); worn.parts.push(p); } else if (w.pin && P.arms && P.arms[1]) { const p = makePin(); P.arms[1].add(p); worn.parts.push(p); }
    if (D && P.body) { const b = makeBox(0.85); b.position.set(0, 0.78, 0.56); P.body.add(b); worn.parts.push(b); }
    worn.parts.forEach(p => p.traverse(o => { o.renderOrder = 2; })); }
  const meleeK = () => (wearNow().pin ? 1.25 : 1);
  const meleeExtra = () => (own3().pin ? [{ key: 'pin', name: 'ROLLING PIN', line: "Granny Crust's. Solid oak. Hits 25% harder.", on: wearNow().pin }] : []);
  function equipMelee(k) { if (!own3().pin) return; setWear('pin', k === 'pin'); toast(k === 'pin' ? 'ROLLING PIN EQUIPPED' : "FATHER'S SWORD EQUIPPED", 1.4); }
  // ================= A WHOLE PIE TO CARRY (after each order): beacon at a door in town, arrow over your head =================
  const DOOR_KEYS = [['extramv4l8oxs', 'Meru Hospital'], ['extramv4lbt6h', 'Meru Motel'], ['extramv4lc8mr', 'History Museum'], ['extramv4kojov', 'Nature Office'], ['extramv4lce16', 'Country Club'], ['extramv4m7583', 'Post Office'], ['extramv4iruy4', "Foxes' Chocolates"], ['extramv4inbym', 'Tailor Shop'], ['extramv4ird5f', 'Barber Shop'], ['extramv4koqiu', 'Hobby Shop'], ['itemshop', 'Item Shop'], ['armory', 'Armory'], ['bank', 'Bank'], ['tavern', 'Tavern']];
  const FN = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, DOORS = DOOR_KEYS.map(([k, label]) => { const b = (L && L.BUILDINGS || []).find(q => q.key === k); if (!b || !b.door) return null; const n = FN[b.face] || [0, 1]; return { label, x: b.door[0] + n[0] * 2.6, z: b.door[1] + n[1] * 2.6, yaw: Math.atan2(n[0], n[1]) }; }).filter(Boolean);
  const WHO = ['NURSE POPPY', 'MR. TUCK', 'OLD WREN', 'MISS JUNE', 'DR. FENN', 'THE NIGHT CLERK', 'CAPTAIN TOR', 'BRAM'];
  const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 26, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide })); beacon.visible = false; scene.add(beacon);
  const bRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, side: THREE.DoubleSide })); bRing.rotation.x = -Math.PI / 2; bRing.visible = false; scene.add(bRing);
  const arrG = new THREE.ConeGeometry(0.2, 0.55, 4); arrG.rotateX(Math.PI / 2); const arrow = new THREE.Mesh(arrG, new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false })); arrow.renderOrder = 6; arrow.scale.setScalar(1.6); arrow.visible = false; scene.add(arrow);
  let delF = null, delT = 0;
  function pickDoor() { if (!DOORS.length) return null; const n = save.stat('pieDeliveries', 0); return { door: DOORS[(n * 5 + 3) % DOORS.length], who: WHO[(n * 3 + 1) % WHO.length] }; }
  let offerD = null; const cap = t => t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const waitBox = makeBox(0.9); waitBox.position.set(-179.5, 1.0, -120.9); waitBox.visible = false; G.add(waitBox);
  function startDelivery(d) { if (!d) return; offerD = null; D = { ...d, warm: 100 }; beacon.position.set(d.door.x, 13, d.door.z); bRing.position.set(d.door.x, 0.12, d.door.z); beacon.visible = bRing.visible = arrow.visible = true; bell(); toast('WHOLE PIE · TO THE ' + d.door.label.toUpperCase() + ' · FOLLOW THE ARROW', 2.6); }
  function deliver(P) { const g = Math.round((14 + D.warm * 0.16) * (tinOwned() ? 1.25 : 1)); save.addGold(g); save.give('hotPie'); save.setStat('pieDeliveries', save.stat('pieDeliveries', 0) + 1);
    if (!delF) { delF = kit.makeFox({ key: 'pieDeliv', torso: ['#7c4dc4', '#f3f2f2', '#3d2563'], outfit: 'vest', mood: 'happy' }); scene.add(delF); }
    delF.visible = true; delF.position.set(D.door.x, 0.02, D.door.z); delF.rotation.y = Math.atan2(P.x - D.door.x, P.z - D.door.z); delF.userData.mood = delF.userData.base = 'happy'; delF.userData.hop = 1; delT = 4;
    tone(523, 0.05, 0.4); tone(784, 0.05, 0.6); toast(D.who + ': "' + (D.warm > 40 ? 'STILL WARM!' : 'PIE! THANK YOU!') + '" · +' + g + ' GOLD + HOT PIE', 3); K.finish('deliver', D.warm > 70 ? 3 : D.warm > 40 ? 2 : 1, g, !K.stars('deliver')); beacon.visible = bRing.visible = arrow.visible = false; D = null; if (!busy) hideCard(); }
  function deliveryTick(dt, P, fox) { if (delF && delT > 0) { delT -= dt; kit.animFox && kit.animFox(delF, dt, 0); if (delT <= 0) delF.visible = false; } if (!D) return;
    D.warm = Math.max(0, D.warm - dt * 0.35); const dx = D.door.x - P.x, dz = D.door.z - P.z, d = Math.hypot(dx, dz); arrow.position.set(P.x, (P.y || 0) + 2.55, P.z); arrow.rotation.y = Math.atan2(dx, dz); arrow.visible = d > 4 && !(fox && !fox.visible);
    bRing.scale.setScalar(1 + 0.08 * Math.sin(performance.now() / 200)); if (d < 2.4 && (P.y || 0) < 3) { deliver(P); return; }
    if (!busy) setCard('dl' + Math.round(d / 5) + '_' + Math.round(D.warm / 5), head('WHOLE PIE', 'FOR ' + D.who) + '<div style="padding:8px 10px 10px">' + row(YEL, 'TO THE ' + D.door.label.toUpperCase(), Math.round(d) + ' M', false) + lab(D.warm > 40 ? 'STILL WARM' : 'GETTING COLD') + meter(D.warm / 100, RED) + '</div>' + foot('FOLLOW THE ARROW', false)); }
  // ---------- camera: a fixed shot per station (portrait: below the card; wide: right of it) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false }, hp = V();
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  const DOUGH_C = V(DOUGH.x, DOUGH.y + 0.05, DOUGH.z), FILL_C = V(DOUGH.x, DOUGH.y + 0.08, -129.12), OVEN_C = V(-186.55, 0.95, -122), BOARD_C = V(BOARD.x, BOARD.y + 0.06, BOARD.z), RUSH_C = V(-178.0, 1.3, -123.3);
  function shot(fox) { if (busy === 'hook' && fox) { fox.getWorldPosition(hp); return [hp.clone().setY(1.0), 1.4, 2.4, 0.15, 3.8, Math.PI, 4.4]; } if (busy !== 'job' || !J) return null; const s = J.sub;
    if (s === 'roll' || s === 'rolled') return [DOUGH_C.clone(), 0.75, 0.55, 1.05, 0.8, 0, 1.6];
    if (s === 'pick' || s === 'pour' || s === 'poured') return [FILL_C.clone().add(V(0, 0.1, 0)), 1.45, 0.85, 0.85, 1.1, 0, 2.2];
    if (s === 'top' || s === 'crimp' || s === 'topped') return [DOUGH_C.clone().setY(DOUGH.y + 0.08), 0.6, 0.5, 1.15, 0.75, 0, 1.4];
    if (s === 'toOven' || s === 'oven' || s === 'baked') return [OVEN_C.clone(), 1.8, 0.9, 0.3, 1.5, Math.PI / 2, 3.2];
    if (s === 'toBoard' || s === 'slice' || s === 'sliced') return [BOARD_C.clone(), 0.62, 0.55, 1.1, 0.8, Math.PI, 1.5];
    return [RUSH_C.clone(), 3.4, 2.4, 0.38, 6.4, -Math.PI / 2, 7.2]; }
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
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down) return null; const s = J.sub;
    if (s === 'roll') return [pinT.position.clone(), 'DRAG THE PIN BOTH WAYS'];
    if (s === 'pick') return [potPos(POTS.find(p => p.k === J.C.fl)), 'TAP THE ' + FLAV[J.C.fl].name + ' POT'];
    if (s === 'pour') return J.f >= 0.72 && J.f <= 0.9 ? [DOUGH.clone().add(V(0, 0.08, 0)), 'TAP NOW · GOLD BAND'] : null;
    if ((s === 'top' || s === 'crimp' || s === 'slice') && J.path) { const q = J.path.pts[J.path.i]; return q ? [q.p.clone(), s === 'top' ? 'DRAG ALONG THE DOTS' : s === 'crimp' ? 'DRAG ROUND THE EDGE' : 'DRAG ACROSS THE PIE'] : null; }
    if (s === 'oven') { const o = J.ov.find(q => !q.out && q.b >= GOLD_LO && q.b <= GOLD_HI); return o ? [o.pie.g.position.clone().add(V(0, 0.06, 0)), 'TAP IT · GOLDEN'] : null; }
    if (s === 'rush') { const F = front(); if (!F || !F.arr || F.serving) return null; const i = J.others.indexOf(F.want); return [(i >= 0 ? RP[i] : BOXP).clone().add(V(0, 0.08, 0)), 'TAP ' + (i >= 0 ? FLAV[F.want].name : 'THE BOX')]; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 && P.y < 2.5;
  const SPOT = { work: { x: -183.2, z: -122.4, r: 1.05 }, hook: HOOK };
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  const hasWear = () => { const o = own3(); return o.apron || o.mitts || o.pin; };
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.work)) return 'NEXT ORDER · ROLL, FILL, BAKE, SERVE';
    if (at(P, SPOT.hook) && hasWear()) return 'APRON HOOK · WHAT YOU WEAR'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, grT)) return offerD && !D ? 'TAKE THE WHOLE PIE · TO THE ' + offerD.door.label.toUpperCase() : 'TALK · GRANNY CRUST'; return null; }
  // s67: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Come in, dear! Granny Crust. The yellow ring in the kitchen: roll, fill, top, bake, slice, serve.', 'Back again, dear? The yellow ring is free.', 'Mind the flour, dear. Fancy a shift?', 'The oven is hot, dear. Shall we bake?'];
  const TIPS = ['Cold butter, warm hands, dear. That is the whole secret.', 'Pell says cherry, Otto says meat. They have argued since they were kits.', 'A pie is a hug you can eat, dear.',
    'Noble once ate three slices and said he was only checking them.', 'Hope likes the crust best. Says it crunches like gravel. A compliment, I think.'];
  const goWork = P => { if (P) Object.assign(P, { x: SPOT.work.x, z: SPOT.work.z, sp: 0 }); startVisit(); };
  const grannyMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } },
      { text: 'A BAKING TIP, PLEASE', pick: () => sayTo(grT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(grT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P)) return false;
    if (at(P, SPOT.work)) { startVisit(); return true; }
    if (at(P, SPOT.hook) && hasWear()) { startHook(P); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (!near(P, grT)) return false; bell();
    if (offerD && !D) { const d = offerD; startDelivery(d); sayTo(grT, [ln('Bless you, dear. Carry it level and follow the yellow arrow to the ' + d.door.label + '.')]); return true; }
    if (D) { sayTo(grT, [ln(cap(D.who) + "'s pie is getting cold, dear! Follow the yellow arrow.")]); return true; }
    grannyMenu(!talked++); return true; }
  function quit() { if (busy === 'hook') { closeHook(); return; } stop(); toast('ORDER CANCELLED · GOLD KEPT', 2); }
  // ---------- per frame ----------
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; applyWear(fox); lastP = P; deliveryTick(dt, P, fox);
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'job' && fox) JW(fox, 'pie dough');
    waitBox.visible = !!offerD && !D; if (!G.visible) return; flick.opacity = 0.14 + 0.08 * Math.sin(t * 9) * Math.sin(t * 3.7); glowM.color.setRGB(0.85, 0.34 + 0.05 * Math.sin(t * 5), 0.08);
    if (busy === 'job' && J) jobTick(dt);
    if (J && J.path) { const n = J.path.pts[J.path.i]; if (n) n.d.scale.setScalar(1.3 + Math.sin(t * 9) * 0.35); } hintTick(t);
    if (busy === 'job') { const f0 = granny.userData.face0 ?? Math.PI / 2; granny.rotation.y += Math.atan2(Math.sin(f0 - granny.rotation.y), Math.cos(f0 - granny.rotation.y)) * Math.min(1, dt * 3); }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: busy === 'job' }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startVisit, granny, camera, save, meleeK, meleeExtra, equipMelee, delivery: () => D, startDelivery: () => startDelivery(pickDoor()), DOORS,
    tap(x, y) { ptr.down = true; ptr.x = ptr.px = x; ptr.y = ptr.py = y; press(); drag(0); ptr.down = false; if (J) J.pinPrev = null; }, dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; if (J) J.pinPrev = null; moveTool(); },
    targets() { if (!J) return []; if (J.path) return J.path.pts.map(q => scrW(q.p)); if (J.sub === 'roll') return [scrW(DOUGH)]; if (J.sub === 'pick') return [scrW(potPos(POTS.find(p => p.k === J.C.fl)))];
      if (J.sub === 'oven') return J.ov.map(o => scrW(o.pie.g.position)); if (J.sub === 'rush') { const F = front(); const i = F ? J.others.indexOf(F.want) : -1; return [scrW(i >= 0 ? RP[i] : BOXP)]; } return []; },
    skipTo(s) { if (!J) startVisit(); J.pause = 0; J.after = null; clearDots(); J.flies.length = 0; const sx = () => { J.sx = J.sz = RT; setDough(); };
      if (s === 'fill') { sx(); beginFill(); } else if (s === 'top') { sx(); beginFill(); J.pie.setFill(0.85); beginTop(); } else if (s === 'oven') { sx(); beginFill(); J.pie.setFill(0.85); J.sub = 'x'; beginOven(); }
      else if (s === 'slice') { sx(); beginFill(); J.pie.setFill(0.85); beginOven(); J.flies.length = 0; J.ov.forEach(o => { o.out = true; o.grade = 'GOLDEN'; o.pie.bake(1); }); beginSlice(); }
      else if (s === 'rush') { API.skipTo('slice'); J.flies.length = 0; J.pie.g.position.copy(BOARD); J.box = makeBox(); J.box.position.copy(BOXP); own(J.box); beginRush(); } },
    hiring: K, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__pie = API; return API;
}
