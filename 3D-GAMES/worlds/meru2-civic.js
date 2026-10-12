// MERU 2.0 — step 2c: inside the POLICE DEPARTMENT (front desk, jail hall, two cells, patrolling guard with a view cone)
// and the BANK (teller counter, storage lockers, a vault you can see through glass). Built inside the city shells (worlds/meru2-city.js).
// Avatars here are new (roles only, no lines): policeDesk, jailGuard, bankTeller, bankVault.
// step 10 ART PASS 6c: both rooms dressed with the shared room kit (worlds/meru2-roomkit.js: merged by material, 4-6 draws per room).
// The jail logic (cells, cell doors, guard patrol + view cone, escape / caught) and every collider + spot is unchanged.
import { makeRoomKit } from './meru2-roomkit.js';
export function buildCivic({ THREE, scene, M, toon, kit, cols }) {
  const touch = matchMedia('(pointer: coarse)').matches, { CT, Bin, flat, wallPlane, signTex, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => { const c = { f: [x0, x1, z0, z1] }; cols.push(c); return c; }, ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const fox = (key, torso, outfit, x, z, ry) => { const f = kit.makeFox({ key, torso, outfit }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); cols.push({ c: [x, z, 0.5] }); return f; };
  const steel = toon('#5c6670');
  const tiles = (a, b2, gr, n = 4) => CT(256, 256, (g, w) => { const t = w / n; g.fillStyle = gr; g.fillRect(0, 0, w, w); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b2; g.fillRect(i * t + 1.5, j * t + 1.5, t - 3, t - 3); }
    for (let s = 0; s < 900; s++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'; g.fillRect(rnd() * w, rnd() * w, 1.5, 1.5); } });
  const concrete = () => CT(256, 256, (g, w) => { g.fillStyle = '#8f8c88'; g.fillRect(0, 0, w, w); for (let s = 0; s < 2600; s++) { const k = rnd(); g.fillStyle = k < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'; g.fillRect(rnd() * w, rnd() * w, 1 + rnd() * 3, 1 + rnd() * 3); }
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, 1.5); g.fillRect(0, 0, 1.5, w); });
  const marble = () => CT(512, 512, (g, w) => { const t = w / 2; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#ece6d8' : '#e2dccd'; g.fillRect(i * t, j * t, t, t);
      g.strokeStyle = 'rgba(120,110,95,0.28)'; for (let v = 0; v < 6; v++) { g.lineWidth = 0.6 + rnd() * 1.6; g.beginPath(); let x = i * t + rnd() * t, y = j * t; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (rnd() - 0.5) * 50; y += t / 8; g.lineTo(Math.max(i * t, Math.min(i * t + t, x)), y); } g.stroke(); } }
    g.fillStyle = '#a8987c'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, w); g.fillRect(t - 1.5, 0, 3, w); g.fillRect(0, t - 1.5, w, 3);
    g.fillStyle = '#2e4a6b'; g.save(); g.translate(t, t); g.rotate(Math.PI / 4); g.fillRect(-12, -12, 24, 24); g.restore(); });
  const notice = CT(256, 160, (g, w, h) => { g.fillStyle = '#a77b4f'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3d26'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6); g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h);
    for (let i = 0; i < 9; i++) { const x = 14 + (i % 4) * 58 + rnd() * 6, y = 14 + Math.floor(i / 4) * 48 + rnd() * 6, pw = 40 + rnd() * 10, ph = 34 + rnd() * 8; g.fillStyle = i % 3 ? '#f3efe2' : '#ffe08a'; g.fillRect(x, y, pw, ph);
      g.fillStyle = 'rgba(0,0,0,0.35)'; if (i % 3 === 0) { g.beginPath(); g.arc(x + pw / 2, y + ph / 2 - 3, 7, 0, 7); g.fill(); g.fillRect(x + pw / 2 - 10, y + ph / 2 + 5, 20, 8); } else for (let l = 0; l < 4; l++) g.fillRect(x + 4, y + 6 + l * 7, pw - 8 - rnd() * 10, 2);
      g.fillStyle = '#ec3013'; g.beginPath(); g.arc(x + pw / 2, y + 3, 2.5, 0, 7); g.fill(); } });

  // =================== POLICE (f -110..-62 × -125..-80, door S at -86) ===================
  const PG = new THREE.Group(); scene.add(PG); const p = Bin();
  flat(PG, tiles('#c9ccd1', '#b6bac1', '#8e939a'), 47.2, 14.6, -86, 0.05, -87.7, 2.4);
  flat(PG, concrete(), 47.2, 29.6, -86, 0.05, -110, 3);
  for (const z of [-96.2, -114.8]) p.box('mat', '#e0b23a', 47, 0.008, 0.12, -86, 0.062, z);
  // front desk: raised navy counter, white top, glass screen, monitor, phone, trays, the crest plaque
  p.box('mat', '#2e4a6b', 9, 1.1, 1, -86, 0.55, -89.5); p.box('mat', '#22374f', 9.04, 0.12, 1.04, -86, 0.06, -89.5); p.box('gls', '#f3f2f2', 9.2, 0.08, 1.2, -86, 1.14, -89.5);
  for (let k = 0; k < 4; k++) p.box('mat', '#26405e', 1.9, 0.7, 0.03, -89.3 + k * 2.2, 0.58, -88.99);
  p.box('glass', '#cfe9ff', 8.6, 0.9, 0.04, -86, 1.65, -89.0); for (let x = -90.3; x <= -81.6; x += 2.15) p.box('gls', '#c0c4cc', 0.05, 0.92, 0.06, x, 1.65, -89.0);
  p.cyl('gls', '#e0b23a', 0.32, 0.04, -86, 0.6, -88.97, 20, Math.PI / 2); p.cyl('mat', '#2e4a6b', 0.24, 0.05, -86, 0.6, -88.95, 20, Math.PI / 2); p.oct('gls', '#e0b23a', 0.1, -86, 0.6, -88.92);
  p.box('mat', '#201e1d', 0.5, 0.32, 0.04, -87.6, 1.42, -89.8); p.box('glo', '#9fd6ff', 0.46, 0.28, 0.01, -87.6, 1.42, -89.77); p.box('mat', '#201e1d', 0.06, 0.2, 0.06, -87.6, 1.24, -89.85); p.box('mat', '#3d3b3a', 0.42, 0.02, 0.15, -87.6, 1.19, -89.55);
  p.box('mat', '#201e1d', 0.22, 0.07, 0.18, -84.4, 1.21, -89.6); p.box('mat', '#5c6670', 0.32, 0.03, 0.24, -83.4, 1.19, -89.6); for (let k = 0; k < 4; k++) p.box('mat', '#f3efe2', 0.21, 0.01, 0.3, -83.4, 1.21 + k * 0.012, -89.6, rnd() * 0.2);
  box(-90.5, -81.5, -90, -89);
  // behind the desk: filing cabinets, notice board, wall clock
  for (let k = 0; k < 5; k++) { const x = -91.5 + k * 0.7; p.box('gls', '#7c8794', 0.66, 1.35, 0.6, x, 0.675, -94.45); for (let d = 0; d < 4; d++) { p.box('mat', '#5c6670', 0.6, 0.02, 0.01, x, 0.3 + d * 0.32, -94.14); p.box('gls', '#c0c4cc', 0.14, 0.03, 0.03, x, 0.42 + d * 0.32, -94.13); } }
  box(-91.9, -88.1, -94.8, -94.1);
  wallPlane(PG, notice, 2.2, 1.4, -81.2, 2.0, -94.82, 0); p.box('mat', '#5a3d26', 2.3, 1.5, 0.04, -81.2, 2.0, -94.86);
  p.cyl('mat', '#f3f2f2', 0.32, 0.05, -86, 3.55, -94.8, 20, Math.PI / 2); p.tor('gls', '#201e1d', 0.32, 0.08, -86, 3.55, -94.77); p.box('mat', '#201e1d', 0.03, 0.22, 0.01, -86, 3.62, -94.76); p.box('mat', '#201e1d', 0.16, 0.025, 0.01, -85.94, 3.55, -94.76, 0, 0, 0.5);
  wallPlane(PG, signTex('POLICE'), 3.2, 0.6, -86, 4.85, -94.78, 0, true);
  // the dividing wall: plaster above, navy wainscot below, a steel door frame round the opening
  for (const [x0, x1] of [[-109.6, -88], [-84, -62.4]]) { const cx = (x0 + x1) / 2, w = x1 - x0; p.box('mat', '#d8d2c8', w, 4, 0.3, cx, 2, -95); for (const s of [-1, 1]) { p.box('mat', '#2e4a6b', w, 1.1, 0.04, cx, 0.6, -95 + s * 0.17); p.box('mat', '#f3f2f2', w, 0.06, 0.05, cx, 1.18, -95 + s * 0.17); } box(x0, x1, -95.2, -94.8); }
  p.box('mat', '#d8d2c8', 4, 0.6, 0.3, -86, 4.2, -95); for (const x of [-88, -84]) p.box('gls', '#5c6670', 0.14, 4, 0.36, x, 2, -95); p.box('gls', '#5c6670', 4.2, 0.14, 0.36, -86, 3.93, -95);
  // waiting area: two rows of linked seats, water cooler, plants
  for (const sx of [-1, 1]) { const x = -86 + sx * 13; p.box('gls', '#5c6670', 5.2, 0.06, 0.08, x, 0.32, -84.5);
    for (let k = 0; k < 5; k++) { const sxk = x - 2 + k; p.box('mat', '#2e4a6b', 0.5, 0.08, 0.5, sxk, 0.46, -84.5); p.box('mat', '#2e4a6b', 0.5, 0.55, 0.06, sxk, 0.78, -84.24, 0, -0.1); }
    for (const e of [-2.6, 2.6]) { p.box('gls', '#5c6670', 0.05, 0.42, 0.45, x + e, 0.21, -84.5); }
    box(x - 2.7, x + 2.7, -84.8, -84.1); }
  p.box('mat', '#e6e1d3', 0.4, 1.0, 0.4, -108.8, 0.5, -91); p.cyl('glass', '#9fd6ff', 0.17, 0.42, -108.8, 1.22, -91, 14); p.cyl('gls', '#7fb6e0', 0.15, 0.36, -108.8, 1.22, -91, 14); ring(-108.8, -91, 0.35);
  for (const [x, z] of [[-108.6, -81.4], [-63.4, -81.4], [-63.4, -93.6]]) { p.cyl('mat', '#3d3b3a', 0.32, 0.6, x, 0.3, z, 12, 0, 0, 1.15); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; p.sph('mat', k % 2 ? '#3d6b4a' : '#4f8a5c', 0.3, x + Math.cos(a) * 0.18, 0.95 + (k % 3) * 0.18, z + Math.sin(a) * 0.18, 1.3, 6); } ring(x, z, 0.4); }
  // strip lights: lobby + hall
  for (const x of [-102, -86, -70]) for (const z of [-84.5, -91.5, -100, -109]) { p.box('gls', '#c0c4cc', 2.6, 0.08, 0.36, x, 3.9, z); p.box('glo', '#f4f8ff', 2.5, 0.02, 0.28, x, 3.855, z); for (const s of [-1, 1]) p.box('mat', '#201e1d', 0.01, 3.1, 0.01, x + s * 1.1, 5.45, z); }
  // jail hall: lockers on the east wall, a CCTV camera, the key board by the door, a bench on the west wall
  for (let k = 0; k < 12; k++) { const z = -113.6 + k * 0.62; p.box('gls', k % 2 ? '#6b737b' : '#5c6670', 0.5, 2.0, 0.6, -62.85, 1.0, z); p.box('mat', '#3f4854', 0.01, 1.9, 0.01, -63.11, 1.0, z + 0.3); for (let v = 0; v < 3; v++) p.box('mat', '#3f4854', 0.01, 0.03, 0.3, -63.11, 1.75 + v * 0.06, z); p.box('gls', '#c0c4cc', 0.03, 0.12, 0.03, -63.12, 1.1, z - 0.2); }
  box(-63.2, -62.4, -113.95, -106.45);
  p.box('mat', '#201e1d', 0.16, 0.16, 0.3, -85.4, 3.6, -95.35, 0, -0.4); p.box('glo', '#ff3030', 0.03, 0.03, 0.01, -85.4, 3.62, -95.52);
  p.box('mat', '#5a3d26', 0.7, 0.5, 0.04, -88.8, 1.7, -95.2); for (let k = 0; k < 6; k++) { p.box('gls', '#c0c4cc', 0.02, 0.06, 0.02, -89.05 + k * 0.1, 1.82, -95.24); p.tor('gls', '#e0b23a', 0.03, 0.2, -89.05 + k * 0.1, 1.72, -95.25); }
  p.box('mat', '#5c6670', 0.5, 0.08, 4, -109.0, 0.48, -104); p.box('mat', '#5c6670', 0.08, 0.5, 4, -109.3, 0.75, -104); for (const z of [-105.8, -102.2]) p.box('gls', '#3f4854', 0.4, 0.45, 0.06, -109.0, 0.22, z); box(-109.6, -108.7, -106, -102);
  // the two cells: bar fronts (static), concrete side walls, bunk, steel toilet-sink, a light
  const cells = [];
  for (const [cx, open] of [[-99, true], [-73, false]]) { const x0 = cx - 5, x1 = cx + 5, zf = -116;
    for (let x = x0; x <= x1 + 0.01; x += 0.5) if (Math.abs(x - cx) > 0.85) p.cyl('gls', '#5c6670', 0.04, 3.4, x, 1.7, zf, 8);
    for (const y of [0.1, 1.2, 3.4]) p.box('gls', '#5c6670', 10.1, 0.12, 0.12, cx, y, zf);
    for (const sx of [x0, x1]) { p.box('mat', '#b9b4ac', 0.3, 3.5, 8.6, sx, 1.75, -120.3); p.box('mat', '#9a958d', 0.32, 0.9, 8.6, sx, 0.45, -120.3); box(sx - 0.15, sx + 0.15, -124.6, -116); }
    box(x0, cx - 0.85, zf - 0.1, zf + 0.1); box(cx + 0.85, x1, zf - 0.1, zf + 0.1);
    p.box('gls', '#7c8794', 3, 0.1, 1.2, cx - 2.5, 0.5, -123.6); for (const e of [-1.4, 1.4]) p.box('gls', '#5c6670', 0.08, 0.5, 1.2, cx - 2.5 + e, 0.25, -123.6);
    p.box('mat', '#e6e1d3', 2.9, 0.16, 1.1, cx - 2.5, 0.63, -123.6); p.box('mat', '#f3f2f2', 0.6, 0.12, 0.8, cx - 3.6, 0.76, -123.6); p.box('mat', '#c94c3a', 1.5, 0.05, 1.12, cx - 1.9, 0.73, -123.6);
    p.box('gls', '#c0c4cc', 0.8, 0.9, 0.5, cx + 3.6, 0.45, -124.1); p.box('gls', '#d9dde2', 0.8, 0.3, 0.6, cx + 3.6, 1.05, -124.0); p.box('mat', '#3f4854', 0.3, 0.04, 0.3, cx + 3.6, 1.21, -123.95); p.cyl('gls', '#c0c4cc', 0.38, 0.4, cx + 3.6, 0.2, -123.35, 14); p.cyl('mat', '#5c6670', 0.32, 0.02, cx + 3.6, 0.41, -123.35, 14);
    p.box('gls', '#c0c4cc', 0.6, 0.06, 0.3, cx, 3.3, -122); p.box('glo', '#f4f8ff', 0.5, 0.02, 0.22, cx, 3.265, -122);
    const door = new THREE.Group(); door.position.set(cx - 0.85, 0, zf); scene.add(door); for (let x = 0.15; x < 1.7; x += 0.5) M(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 8), steel, x, 1.7, 0, door, 0); for (const y of [0.1, 1.2, 3.35]) M(new THREE.BoxGeometry(1.7, 0.1, 0.1), steel, 0.85, y, 0, door, 0);
    M(new THREE.BoxGeometry(0.16, 0.24, 0.14), toon('#3f4854'), 1.55, 1.2, 0, door, 0);
    const blk = box(cx - 0.85, cx + 0.85, zf - 0.1, zf + 0.1); cells.push({ cx, door, blk, open: 0, locked: true, inUse: open }); }
  p.build(PG);
  const deskFox = fox('policeDesk', '#2e4a6b', 'coat', -86, -91.2, 0);
  const guard = fox('jailGuard', '#3d3b3a', 'armor', -86, -104, Math.PI); cols.pop();
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.22, depthWrite: false });
  const cone = new THREE.Mesh(new THREE.CircleGeometry(7, 24, -0.6, 1.2).rotateX(-Math.PI / 2), coneMat); cone.position.y = 0.07; scene.add(cone);
  const G = { x: -86, z: -104, dir: 1, yaw: Math.PI / 2, wait: 0 };

  // =================== BANK (f 62..110 × -125..-80, door S at 86) ===================
  const BG = new THREE.Group(); scene.add(BG); const k = Bin(), GOLD = '#c9a227', BR = '#b08d3c';
  const mt = marble(); mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.repeat.set(47.2 / 2.4, 44.2 / 2.4);
  flat(BG, mt, 47.2, 44.2, 86, 0.05, -102.5, 0, new THREE.MeshPhongMaterial({ map: mt, shininess: 70, specular: 0x444444, polygonOffset: true, polygonOffsetFactor: -2 }));
  k.box('mat', '#7a2a3a', 2.6, 0.012, 18.6, 86, 0.062, -90.4); for (const s of [-1, 1]) k.box('gls', GOLD, 0.08, 0.014, 18.6, 86 + s * 1.32, 0.064, -90.4);
  // teller counter: marble front with fluted panels, brass top rail, glass screen in brass frames, numbered windows, banker's lamps
  k.box('mat', '#ece6d8', 32, 1.2, 0.8, 86, 0.6, -100.4); k.box('mat', '#a8987c', 32.04, 0.14, 0.84, 86, 0.07, -100.4); k.box('gls', '#a8987c', 32.2, 0.1, 1.0, 86, 1.25, -100.4);
  for (let x = 70.4; x < 102; x += 0.4) k.box('mat', '#e2dccd', 0.12, 0.9, 0.03, x, 0.62, -99.99);
  for (let x = 70; x <= 102.01; x += 6.4) k.box('mat', '#d8d0bd', 0.5, 1.2, 0.86, x, 0.6, -100.4);
  k.box('glass', '#bfe6ff', 32, 1.6, 0.04, 86, 2.05, -100.6); k.box('gls', BR, 32.1, 0.08, 0.1, 86, 2.88, -100.6); k.box('gls', BR, 32.1, 0.05, 0.1, 86, 1.32, -100.6);
  for (let x = 70; x <= 102.1; x += 6.4) k.box('gls', BR, 0.1, 1.6, 0.1, x, 2.05, -100.6);
  for (let i = 0; i < 5; i++) { const x = 73.2 + i * 6.4; k.box('gls', BR, 0.6, 0.02, 0.3, x, 1.31, -100.15); k.box('mat', '#201e1d', 0.4, 0.26, 0.02, x, 2.66, -100.57); k.box('gls', GOLD, 0.34, 0.2, 0.01, x, 2.66, -100.555);
    k.box('gls', GOLD, 0.04, 0.3, 0.04, x - 1.4, 1.45, -100.6); k.ecyl('gls', '#1f6b45', 0.25, 0.1, 0.12, x - 1.4, 1.62, -100.6, 14); k.box('glo', '#fff1c8', 0.4, 0.01, 0.1, x - 1.4, 1.55, -100.6); }
  box(70, 102, -100.8, -100);
  // behind the counter: teller desks + a rack of safe-deposit boxes on the north wall
  for (let i = 0; i < 4; i++) { const x = 76 + i * 6.4; k.box('mat', '#5a3d26', 2.0, 0.76, 0.9, x, 0.38, -104.2); k.box('mat', '#3d2a1c', 2.04, 0.04, 0.94, x, 0.78, -104.2); k.box('mat', '#201e1d', 0.4, 0.28, 0.03, x, 1.0, -104.4); k.box('glo', '#9fd6ff', 0.36, 0.24, 0.01, x, 1.0, -104.38);
    k.box('mat', '#201e1d', 0.5, 0.08, 0.5, x, 0.5, -103.2); k.box('mat', '#201e1d', 0.5, 0.6, 0.06, x, 0.82, -102.96); box(x - 1, x + 1, -104.65, -103.75); }
  for (let i = 0; i < 26; i++) for (let j = 0; j < 9; j++) { const x = 64.6 + i * 0.95, y = 0.3 + j * 0.42; if (x > 89.4) continue; k.box('gls', (i + j) % 2 ? '#b08d3c' : '#a07d30', 0.9, 0.38, 0.06, x, y, -124.55); k.box('mat', '#201e1d', 0.04, 0.04, 0.02, x + 0.3, y, -124.51); }
  // storage lockers on the west wall (steel cabinets with brass numbers + handles)
  for (let z = -112; z < -99.9; z += 1.5) for (let y = 0; y < 3; y++) { const zc = z + 0.75, yc = 0.5 + y; k.box('gls', y % 2 ? '#9aa0a6' : '#7c8794', 0.5, 0.95, 1.4, 62.9, yc, zc); k.box('mat', '#5c6670', 0.01, 0.9, 0.01, 63.16, yc, zc - 0.68);
    k.box('gls', GOLD, 0.02, 0.1, 0.18, 63.16, yc + 0.32, zc + 0.4); k.cyl('gls', '#c0c4cc', 0.035, 0.03, 63.17, yc, zc + 0.55, 8, 0, Math.PI / 2); }
  box(62.4, 63.2, -112, -100);
  // the public hall: four marble columns, two writing desks with lamps, queue stanchions + rope, a bench, palms
  for (const [x, z] of [[74, -88], [98, -88], [74, -95.5], [98, -95.5]]) { k.cyl('mat', '#ece6d8', 0.45, 6.6, x, 3.3, z, 18); for (let f = 0; f < 12; f++) { const a = f / 12 * Math.PI * 2; k.box('mat', '#d8d0bd', 0.05, 6.4, 0.05, x + Math.cos(a) * 0.44, 3.3, z + Math.sin(a) * 0.44); }
    k.box('mat', '#d8d0bd', 1.2, 0.35, 1.2, x, 0.175, z); k.box('gls', BR, 1.1, 0.06, 1.1, x, 0.38, z); k.box('mat', '#d8d0bd', 1.2, 0.4, 1.2, x, 6.8, z); ring(x, z, 0.65); }
  for (const x of [78.5, 93.5]) { const z = -91.5; k.box('mat', '#5a3d26', 2.4, 1.0, 0.9, x, 0.5, z); k.box('gls', '#3d2a1c', 2.5, 0.05, 1.0, x, 1.02, z); k.box('mat', '#1f6b45', 2.2, 0.01, 0.7, x, 1.05, z);
    for (const s of [-0.8, 0.8]) { k.box('gls', GOLD, 0.04, 0.3, 0.04, x + s, 1.2, z); k.ecyl('gls', '#1f6b45', 0.22, 0.09, 0.11, x + s, 1.37, z, 14); k.box('glo', '#fff1c8', 0.36, 0.01, 0.09, x + s, 1.31, z); }
    for (let q = 0; q < 4; q++) k.box('mat', '#f3efe2', 0.2, 0.004, 0.28, x - 0.3 + q * 0.2, 1.056, z + 0.05, rnd() * 0.4 - 0.2); box(x - 1.25, x + 1.25, z - 0.5, z + 0.5); }
  const posts = [[76, -97.6], [80, -97.6], [84, -97.6], [88, -97.6], [92, -97.6], [96, -97.6]];
  posts.forEach(([x, z], i) => { k.cyl('gls', GOLD, 0.2, 0.05, x, 0.025, z, 14); k.cyl('gls', GOLD, 0.035, 0.95, x, 0.5, z, 8); k.sph('gls', GOLD, 0.06, x, 1.0, z); ring(x, z, 0.25);
    if (i < posts.length - 1) for (let s = 0; s < 8; s++) { const u = (s + 0.5) / 8, sag = Math.sin(u * Math.PI) * 0.18; k.box('mat', '#7a2a3a', 4 / 8 + 0.02, 0.05, 0.05, x + u * 4, 0.92 - sag, z); } });
  for (const bx of [79, 93]) { k.box('mat', '#5a3d26', 4, 0.12, 0.6, bx, 0.48, -82.2); k.box('mat', '#5a3d26', 4, 0.6, 0.1, bx, 0.82, -81.9); for (const e of [-1.9, 1.9]) k.box('gls', BR, 0.08, 0.45, 0.55, bx + e, 0.24, -82.2); box(bx - 2, bx + 2, -82.5, -81.7); }
  for (const [x, z] of [[63.6, -81.6], [108.4, -81.6], [108.4, -98]]) { k.cyl('gls', BR, 0.36, 0.7, x, 0.35, z, 14, 0, 0, 1.15); k.cyl('mat', '#5a3d26', 0.05, 1.2, x, 1.2, z, 6);
    for (let f = 0; f < 7; f++) { const a = f / 7 * Math.PI * 2; k.box('mat', f % 2 ? '#3d6b4a' : '#4f8a5c', 0.18, 0.03, 1.1, x + Math.sin(a) * 0.45, 1.75, z + Math.cos(a) * 0.45, a, 0.5); } ring(x, z, 0.45); }
  // two brass chandeliers over the hall + a lit cornice band
  for (const x of [79, 93]) { const y = 5.4, z = -90; k.box('gls', BR, 0.03, 9 - y, 0.03, x, (9 + y) / 2, z); k.sph('gls', BR, 0.22, x, y, z);
    for (const [R, yy, n] of [[1.2, y - 0.25, 12], [0.7, y + 0.15, 8]]) { k.tor('gls', BR, R, 0.04, x, yy, z, Math.PI / 2); for (let q = 0; q < n; q++) { const a = q / n * Math.PI * 2, px = x + Math.cos(a) * R, pz = z + Math.sin(a) * R; k.cyl('mat', '#f3efe2', 0.03, 0.14, px, yy + 0.09, pz, 6); k.sph('glo', '#ffe2a8', 0.07, px, yy + 0.22, pz, 1.3, 6); } } }
  wallPlane(BG, signTex('BANK OF MERU'), 5.2, 0.98, 86, 4.3, -124.6, 0, true);
  // vault: glass wall with brass mullions, thick steel frame, round door (open) with locking bolts + wheel, gold, sacks, deposit shelves
  const gl = new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.25, shininess: 120, depthWrite: false });
  const vglass = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 0.06), gl); vglass.position.set(97, 2, -112); BG.add(vglass); box(90, 104, -112.2, -111.8);
  for (let x = 90; x <= 104.01; x += 2.8) k.box('gls', BR, 0.1, 4, 0.1, x, 2, -112); k.box('gls', BR, 14.1, 0.1, 0.1, 97, 4, -112);
  k.box('mat', '#ece6d8', 0.4, 4.2, 12.6, 90, 2.1, -118.4); box(89.8, 90.2, -124.6, -112);
  k.box('gls', '#5c6670', 5.6, 5.6, 0.3, 92.6, 2.6, -112.3); k.cyl('mat', '#201e1d', 2.45, 0.34, 92.6, 2.6, -112.3, 32, Math.PI / 2);
  const vd = M(new THREE.CylinderGeometry(2.4, 2.4, 0.6, 32), new THREE.MeshPhongMaterial({ color: 0x9aa0a6, shininess: 90, specular: 0x777777 }), 0, 0, 0, null, 0.03); vd.rotation.x = Math.PI / 2; const vg = new THREE.Group(); vg.add(vd); vd.position.set(2.4, 0, 0); vg.position.set(92.2, 2.6, -112.4); vg.rotation.y = -1.2; scene.add(vg);
  M(new THREE.TorusGeometry(1.2, 0.12, 8, 24), toon('#ffc64a'), 2.4, 0, 0.35, vg, 0);
  { const v2 = Bin(); for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI; v2.box('gls', '#ffc64a', 2.2, 0.08, 0.08, 2.4, 0, 0.4, 0, 0, a); }
    v2.cyl('gls', '#ffc64a', 0.2, 0.2, 2.4, 0, 0.42, 14, Math.PI / 2); for (let q = 0; q < 8; q++) { const a = q / 8 * Math.PI * 2; v2.cyl('gls', '#c0c4cc', 0.12, 0.5, 2.4 + Math.cos(a) * 2.55, Math.sin(a) * 2.55, 0, 10, 0, a - Math.PI / 2); }
    v2.cyl('gls', '#7c8794', 2.1, 0.08, 2.4, 0, -0.32, 32, Math.PI / 2); v2.build(vg); }
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) for (let q = 0; q < 2 + (i % 2); q++) { const x = 94 + i * 1.6, z = -120 + j * 1.8, y = 0.15 + q * 0.3; for (let b = 0; b < 2; b++) k.cyl('gls', '#ffc64a', 0.32, 0.28, x - 0.2 + b * 0.42, y, z, 4, 0, 0, 0.75, Math.PI / 4); }
  for (const [x, z] of [[102.6, -114.2], [103.2, -115.2], [101.8, -114.6]]) { k.sph('mat', '#c9a878', 0.38, x, 0.36, z, 1.05, 8); k.cyl('mat', '#8a6a42', 0.12, 0.18, x, 0.78, z, 8); k.box('mat', '#201e1d', 0.3, 0.02, 0.01, x, 0.42, z + 0.37); }
  for (let j = 0; j < 5; j++) { k.box('gls', '#7c8794', 12.6, 0.04, 0.5, 97, 0.6 + j * 0.7, -124.3); for (let i = 0; i < 18; i++) k.box('gls', (i + j) % 3 ? '#9aa0a6' : '#b08d3c', 0.6, 0.5, 0.45, 91.3 + i * 0.7, 0.88 + j * 0.7, -124.3); }
  box(90.4, 104, -124.6, -123.9); box(101.3, 103.7, -115.7, -113.7);
  k.build(BG);
  const teller = fox('bankTeller', '#e9e3d6', 'vest', 81, -102.4, 0);
  const vaultFox = fox('bankVault', '#201e1d', 'suit', 93, -98.5, Math.PI);

  const spots = [
    { key: 'policeDesk', x: -86, z: -87.6, r: 2.2, prompt: 'POLICE DESK \u00b7 FINES' },
    { key: 'bankTeller', x: 81, z: -98.6, r: 2.2, prompt: 'BANK TELLER' },
    { key: 'bankLocker', x: 64.6, z: -106, r: 2.4, prompt: 'STORAGE LOCKER' },
  ];
  const npcs = [deskFox, guard, teller, vaultFox];
  const cellA = cells[0], CELL_IN = { x: cellA.cx - 1.5, z: -120.5 }, EXIT_Z = -94.6, far = touch ? 70 : 130;
  function lockCell() { cellA.locked = true; }
  function tick(dt, p, escaping, cam) {
    const q = cam || p; if (q) { PG.visible = Math.hypot(q.x + 86, q.z + 102) < far; BG.visible = Math.hypot(q.x - 86, q.z + 102) < far; }
    for (const f of npcs) kit.animFox(f, dt, f === guard && !G.wait ? 1.2 : 0, false);
    // guard walks the hall, stops at each end and looks round
    if (G.wait > 0) { G.wait -= dt; G.yaw += Math.sin(G.wait * 2) * dt * 0.8; if (G.wait <= 0) { G.wait = 0; G.dir *= -1; } }
    else { G.x += G.dir * 1.2 * dt; G.yaw = G.dir > 0 ? Math.PI / 2 : -Math.PI / 2; if (G.x > -70 || G.x < -102) { G.x = Math.max(-102, Math.min(-70, G.x)); G.wait = 2.2; } }
    guard.position.set(G.x, 0, G.z); guard.rotation.y = G.yaw; cone.position.x = G.x; cone.position.z = G.z; cone.rotation.y = G.yaw - Math.PI / 2;
    for (const c of cells) { c.open += ((c.locked ? 0 : 1) - c.open) * Math.min(1, dt * 4); c.door.rotation.y = -c.open * 1.6; c.blk.on = c.open < 0.5; }
    coneMat.opacity = escaping ? 0.32 : 0.12;
    if (!p) return null;
    // spotted: inside the cone (7 m, ±34°) while out of the cell
    if (escaping && p.z > -116 && p.z < -95) { const dx = p.x - G.x, dz = p.z - G.z, d = Math.hypot(dx, dz), a = Math.atan2(dx, dz), da = Math.atan2(Math.sin(a - G.yaw), Math.cos(a - G.yaw)); if (d < 7 && Math.abs(da) < 0.6) return 'caught'; }
    if (escaping && p.z > EXIT_Z && p.x > -110 && p.x < -62) return 'free';
    return null; }
  const nearCellDoor = p => Math.abs(p.x - cellA.cx) < 1.6 && p.z < -116 && p.z > -118.4;
  return { spots, cells, cellA, CELL_IN, tick, lockCell, nearCellDoor, unlock() { cellA.locked = false; }, inJail: p => p.x > -109 && p.x < -63 && p.z < -95 && p.z > -125 };
}
