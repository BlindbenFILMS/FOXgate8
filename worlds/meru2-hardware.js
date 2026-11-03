// MERU 2.0 — s161 MERU HARDWARE [meruHardware] (Ben: "a hardware store with departments, the crew ARE the heads, supplies are part of the repair work").
// s167 (Ben): MOVED to the main ring road (f 12..48 × -176..-150, ONE door S (30, -150)); lumber yard behind on the west (gate onto the castle path), garden centre behind on the east (gate onto the hospital road); both open from the back wall. TOWN2 'hardware' in meru2-layout.js.
// 7 DEPARTMENTS: FRONT COUNTER + TOOLS (DOZER) · LUMBER (HANK PLANK) · ELECTRICAL (VOLTA VEE) · PLUMBING (GUS GASKET) · MASONRY (MORTY MORTAR) — the Outlets repair crew,
// new unique foxes built by worlds/meru2-outlet-crew.js (the old helpers stay at their own posts) — + PAINT (TILLY TINT) + GARDEN (FERN): these two never leave.
// SUPPLY RUN (Ben): pick a store with Dozer at the counter → fetch the list from each department (yellow rings) → Dozer signs it on his tab → the truck takes the
// supplies + the crew to the store (pallet on the forecourt) → the 6 repair rings open there. While the crew is out: AWAY plates, Tilly + Fern run the store and comment.
// SHOP (Ben's picks): repair kits + healing, HAMMER / WRENCH (melee looks), flat decor, garden seeds, building materials (lumber etc., for building later).
// Department jobs (s162): worlds/meru2-hardware-jobs.js (7 jobs, NOW HIRING picker, board + stars, HANK'S FLANNEL + HARDWARE HERO). Stat hwMet, hwWear { tool }, hwTools { hammer, wrench }. Test: ?start=hardware · ?start=hardwarecrew · __hardware.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { hwJobs, HW_GAMES, HW_ALL } from './meru2-hardware-jobs.js';
import { buildHwOutside, GC, YARD, gw } from './meru2-hardware-out.js';
import { buildForklift } from './meru2-hardware-fork.js';   // s165: FORKLIFT LOAD in 3D (the lumber yard)   // s163 part 2B: garden centre + lumber yard + the 2 side doors
const PI = Math.PI;
export const HW = { f: [12, 48, -178.5, -152.5], door: [30, -152.5], c: [30, -165.5], gc: GC, yard: YARD, lots: [GC.f, YARD.f],
  spot: { dozer: [30, -163.2, 0], master: [20.8, -174, PI / 2], dot: [20.8, -166, PI / 2], spritz: [39.2, -166, -PI / 2], brick: [39.2, -174, -PI / 2] } };
export function buildHardware({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false }) {
  const X0 = 12.4, X1 = 47.6, Z0 = -178.1, Z1 = -152.9, CX = 30, DZ0 = -152.5;   /* s727: +2.5 m north */   // s167: moved (+242, -188)
  const W = (lx, d) => [CX + lx, DZ0 - d];
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', WOOD = '#8b6a48', STEEL = '#9aa0a6', DARK = '#3d3b3a';
  const G = new THREE.Group(); G.name = 'meruHardware'; scene.add(G);
  { const z0 = DZ0, z1 = -149.3, fc = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 + 1.6, z1 - z0 + 0.1), new THREE.MeshLambertMaterial({ color: 0xcfcac3 })); fc.rotation.x = -PI / 2; fc.position.set(CX, 0.055, (z0 + z1) / 2); fc.receiveShadow = true; G.add(fc); }   // s727: the wide paved sidewalk in front of the store (5 m+ clear walk)
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 8, 5), x, y, z, hex),
      cone: (r, h, hex, x, y, z) => put(new THREE.ConeGeometry(r, h, 8), x, y, z, hex),
      mesh(parent, mat) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, mat || new THREE.MeshLambertMaterial({ vertexColors: true })); parent.add(m); return m; } }; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const fit = (g, txt, max, size, wt = 900) => { let s = size; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > max && s > 10) { s -= 2; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; } };
  const board = (title, sub, bg, fg, bar, Wd = 1024, H = 200) => CT(Wd, H, g => { g.fillStyle = bg; g.fillRect(0, 0, Wd, H); g.fillStyle = bar; g.fillRect(0, 0, 18, H); g.fillStyle = fg; g.textBaseline = 'alphabetic';
    fit(g, title, Wd - 80, Math.round(H * 0.5)); g.fillText(title, 44, sub ? H * 0.6 : H * 0.7); if (sub) { fit(g, sub, Wd - 80, Math.round(H * 0.19), 800); g.fillText(sub, 46, H * 0.88); } });
  const plane = (tex, w, h, x, y, z, ry = 0, both = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const rect = (x0, x1, z0, z1) => cols.push({ f: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] });
  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  // ================= departments =================
  const DEPTS = [
    { k: 'paint', name: 'PAINT', head: 'paint', color: '#c2456a', side: -1, d: 5.5 }, { k: 'elec', name: 'ELECTRICAL', head: 'dot', color: '#e0a800', side: -1, d: 13.5 },
    { k: 'lumber', name: 'LUMBER', head: 'master', color: '#8b6a48', side: -1, d: 21.5 }, { k: 'garden', name: 'GARDEN', head: 'garden', color: '#3f9a5e', side: 1, d: 5.5 },
    { k: 'plumb', name: 'PLUMBING', head: 'spritz', color: '#2e86b8', side: 1, d: 13.5 }, { k: 'mason', name: 'MASONRY', head: 'brick', color: '#8a857e', side: 1, d: 21.5 },
    { k: 'tools', name: 'FRONT COUNTER \u00b7 TOOLS', head: 'dozer', color: RED, side: 0, d: 9.4 }];
  const DK = Object.fromEntries(DEPTS.map(d => [d.k, d]));
  for (const D of DEPTS) { const [tx, tz] = D.side ? W(D.side * 7.3, D.d) : W(0, 8.1); D.talk = [tx, tz]; }
  // ================= the room =================
  { const t = CT(256, 256, (g, w, h) => { g.fillStyle = '#b9b4ab'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '0,0,0' : '255,255,255') + ',' + (Math.random() * 0.06) + ')'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } g.fillStyle = 'rgba(32,30,29,.25)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 4, (Z1 - Z0) / 4); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -PI / 2; f.position.set(CX, 0.07, (Z0 + Z1) / 2); G.add(f); }
  const R = mk();
  // yellow aisle lines: the door walkway to the counter, then round the store
  for (const s of [-1, 1]) { R.box(0.12, 0.01, 8.0, YEL, CX + s * 3.6, 0.085, DZ0 - 4.4); R.box(0.12, 0.01, 14.0, YEL, CX + s * 5.6, 0.085, DZ0 - 16.6); }
  R.box(11.2, 0.01, 0.12, YEL, CX, 0.085, DZ0 - 23.6);
  // walls: a red band + white upper, dept colour panels behind each department
  for (const s of [-1, 1]) { const x = s < 0 ? X0 + 0.04 : X1 - 0.04, dz = 0; for (const [a, b] of [[Z0, Z1]]) { R.box(0.05, 1.1, b - a, '#d9d4cc', x, 0.55, (a + b) / 2); R.box(0.05, 0.18, b - a, RED, x, 1.2, (a + b) / 2); } }   // s163: gaps for the GARDEN door (E) + the LUMBER YARD side gate (W)
  for (const [a, b] of [[X0, YARD.door[0] - 1.7], [YARD.door[0] + 1.7, GC.door[0] - 1.7], [GC.door[0] + 1.7, X1]]) { R.box(b - a, 1.1, 0.05, '#d9d4cc', (a + b) / 2, 0.55, Z0 + 0.04); R.box(b - a, 0.18, 0.05, RED, (a + b) / 2, 1.2, Z0 + 0.04); }   // s167: the GARDEN door is in the back wall now
  // ---- shelves on the side walls (one run per department) ----
  const PAL = { '#c2456a': ['#ec3013', '#ffd23a', '#2e86b8', '#f3f2f2'], '#e0a800': ['#ffd23a', '#201e1d', '#f3f2f2', '#e8742a'], '#3f9a5e': ['#3f9a5e', '#b0623f', '#ffd23a', '#f3f2f2'], '#2e86b8': ['#c98a4a', '#c9ced3', '#2e86b8', '#f3f2f2'] };
  const shelf = (side, d, len, col) => { const x = CX + side * 16.4, [, z] = W(0, d); R.box(1.9, 3.0, len, '#6f6b66', x, 1.5, z); for (let y = 0.5; y < 3; y += 0.8) { R.box(1.95, 0.05, len, '#d9d4cc', x - side * 0.02, y, z); const pc = PAL[col] || ['#c9ced3']; for (let i = 0; i < Math.floor(len / 0.5); i++) R.box(0.3, 0.34, 0.38, pc[(i + Math.round(y * 3)) % pc.length], x - side * 1.05, y + 0.2, z - len / 2 + 0.3 + i * 0.5); } R.box(0.06, 0.3, len, col, x - side * 0.98, 3.1, z); rect(x - 1.0, x + 1.0, z - len / 2, z + len / 2); return { x, z }; };
  // ---- department counters (head behind it, you in front) ----
  const deptCounter = D => { const [x, z] = W(D.side * 8.3, D.d); R.box(0.8, 1.0, 2.6, '#e7e4dc', x, 0.5, z); R.box(0.86, 0.06, 2.7, D.color, x, 1.03, z); R.box(0.04, 0.5, 2.0, D.color, x - D.side * 0.42, 0.55, z); rect(x - 0.45, x + 0.45, z - 1.35, z + 1.35); return [x, z]; };
  const AWAY = [];
  for (const D of DEPTS) { if (!D.side) continue; const [x, z] = deptCounter(D);
    // hanging department sign (readable from the door) + a wall name plate
    const t = board(D.name, D.k === 'paint' ? 'TILLY TINT' : D.k === 'garden' ? 'FERN' : '', D.color, D.color === '#e0a800' ? INK : '#ffffff', INK, 1024, 220);
    const [sx, sz] = W(D.side * 12.2, D.d); plane(t, 4.2, 0.9, sx, 4.0, sz, 0, true); R.box(0.03, 0.9, 0.03, INK, sx - 1.9, 4.85, sz); R.box(0.03, 0.9, 0.03, INK, sx + 1.9, 4.85, sz);
    if (['elec', 'lumber', 'plumb', 'mason'].includes(D.k)) { const a = plane(board('BACK SOON', 'AT THE OUTLETS WITH DOZER', YEL, INK, RED, 512, 220), 1.5, 0.64, x - D.side * 0.46, 1.5, z, -D.side * PI / 2); a.visible = false; AWAY.push({ D, m: a }); } }
  // ---- PAINT (front left): tin wall, a mixing machine, swatch rack ----
  { const s = shelf(-1, 5.5, 6.4, '#c2456a'); const C = ['#ec3013', '#ffd23a', '#2e86b8', '#3f9a5e', '#f3f2f2', '#c2456a', '#7c4dc4', '#e8742a'];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const z = s.z - 2.8 + i * 0.7; R.cyl(0.16, 0.16, 0.32, '#c9ced3', s.x + 1.3, 0.71 + r * 0.8, z, 10); R.cyl(0.165, 0.165, 0.08, C[(i + r * 3) % C.length], s.x + 1.3, 0.71 + r * 0.8 + 0.12, z, 10); }
    const [mx, mz] = W(-13.2, 3.4); R.box(1.0, 1.4, 0.9, '#e7e4dc', mx, 0.7, mz); R.box(0.7, 0.4, 0.6, '#5a5654', mx, 1.6, mz); R.cyl(0.14, 0.14, 0.05, RED, mx + 0.51, 1.1, mz, 12, 0, PI / 2); rect(mx - 0.55, mx + 0.55, mz - 0.5, mz + 0.5);
    plane(board('MIX ANY COLOUR', 'ASK TILLY', '#c2456a', '#ffffff', YEL, 512, 200), 0.9, 0.35, mx + 0.52, 1.0, mz, PI / 2);
    const [rx, rz] = W(-12.6, 7.8); R.box(0.06, 1.8, 0.06, INK, rx, 0.9, rz); for (let i = 0; i < 12; i++) R.box(0.02, 0.22, 0.14, C[i % C.length], rx + 0.05, 0.5 + (i % 6) * 0.22, rz - 0.2 + Math.floor(i / 6) * 0.36); }
  // ---- ELECTRICAL (mid left): wire spools, a bulb display, lamps ----
  { shelf(-1, 12.7, 4.8, '#e0a800'); const [x0, z0] = W(-13.4, 12.7);
    for (let i = 0; i < 4; i++) { const z = z0 - 2.2 + i * 1.45; R.cyl(0.42, 0.42, 0.34, WOOD, x0, 0.42, z, 12, 0, PI / 2); R.cyl(0.3, 0.3, 0.36, ['#ec3013', '#2e86b8', '#ffd23a', '#201e1d'][i], x0, 0.42, z, 12, 0, PI / 2); }
    rect(x0 - 0.3, x0 + 0.3, z0 - 2.7, z0 + 2.7); }   // s163: shelf + spools moved 0.8 m back for the side gate
  const BULBS = []; { const [bx, bz] = W(-12.4, 13.5); for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 6), new THREE.MeshBasicMaterial({ color: '#fff2c0' })); m.position.set(bx, 3.0 - (i % 2) * 0.3, bz - 2.2 + i * 0.88); G.add(m); BULBS.push(m); R.box(0.01, 1.3, 0.01, INK, bx, 3.75, m.position.z); } }
  // ---- LUMBER (back left): long board racks, leaning plywood, a saw table ----
  { const [x, z] = W(-14.6, 21.5); for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) R.box(4.2, 0.12, 0.22, ['#c9a27a', '#b88a5c', '#d6b48a'][(i + r) % 3], x - 0.62 + i * 0.25, 0.4 + r * 0.7, z - 0.4, PI / 2);
    for (const dz of [-2.4, 1.6]) for (const dx of [-0.8, 0.8]) R.box(0.1, 3.0, 0.1, DARK, x + dx, 1.5, z + dz); for (let r = 0; r < 4; r++) R.box(1.7, 0.05, 0.1, DARK, x, 0.33 + r * 0.7, z - 0.4); rect(x - 0.9, x + 0.9, z - 2.6, z + 1.8);
    for (let i = 0; i < 3; i++) R.box(0.05, 2.4, 1.2, '#d9b88a', X0 + 0.4 + i * 0.12, 1.2, z - 3.0, 0, 0, -0.12); rect(X0, X0 + 0.9, z - 3.7, z - 2.3);
    const [tx, tz] = W(-11.6, 24.4); R.box(1.6, 0.9, 1.0, '#7a7570', tx, 0.45, tz); R.cyl(0.3, 0.3, 0.02, '#c9ced3', tx, 0.95, tz, 16, PI / 2); rect(tx - 0.85, tx + 0.85, tz - 0.55, tz + 0.55);
    plane(board('CUT TO SIZE', 'ASK HANK', '#8b6a48', '#ffffff', YEL, 512, 200), 0.9, 0.35, tx, 0.6, tz + 0.51, 0); }
  // ---- GARDEN (front right): pots + plants, seed rack, a wheelbarrow, sunflowers ----
  { shelf(1, 7.6, 3.6, '#3f9a5e'); const [x0, z0] = W(13.0, 5.5);   // s163: shorter shelf, the sunflowers + wheelbarrow went out to the garden centre (garden door)
    for (let i = 0; i < 6; i++) { const z = z0 - 2.4 + i * 0.95, x = x0 + (i % 2) * 0.8; R.cyl(0.28, 0.2, 0.42, '#b0623f', x, 0.21, z, 10); R.sph(0.34, ['#3f9a5e', '#2e7a46', '#5fae5a'][i % 3], x, 0.72, z); } rect(x0 - 0.4, x0 + 1.2, z0 - 2.8, z0 + 2.8);
    const [rx, rz] = W(12.4, 8.0); R.box(0.06, 1.8, 0.06, INK, rx, 0.9, rz); for (let i = 0; i < 10; i++) R.box(0.02, 0.24, 0.16, ['#ffd23a', '#ec3013', '#3f9a5e', '#e8742a', '#7c4dc4'][i % 5], rx - 0.05, 0.5 + (i % 5) * 0.28, rz - 0.2 + Math.floor(i / 5) * 0.4);
    plane(board('SEEDS', '4 G A PACKET', '#3f9a5e', '#ffffff', YEL, 512, 200), 0.7, 0.28, rx - 0.06, 1.95, rz, -PI / 2); }
  // ---- PLUMBING (mid right): pipe rack, a sink + taps display ----
  { shelf(1, 13.5, 6.4, '#2e86b8'); const [x0, z0] = W(13.2, 13.5);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) R.cyl(0.06, 0.06, 4.6, ['#c98a4a', '#c9ced3', '#2e2c2a'][r], x0 + (i % 2) * 0.16, 0.5 + r * 0.6 + Math.floor(i / 2) * 0.16, z0, 8, PI / 2);
    for (const dz of [-2.3, 2.3]) R.box(0.4, 2.0, 0.08, DARK, x0 + 0.08, 1.0, z0 + dz); rect(x0 - 0.2, x0 + 0.4, z0 - 2.4, z0 + 2.4);
    const [sx, sz] = W(11.4, 17.4); R.box(0.9, 0.85, 1.1, '#e7e4dc', sx, 0.42, sz); R.box(0.7, 0.1, 0.8, '#bfe6ff', sx, 0.86, sz); R.cyl(0.03, 0.03, 0.4, STEEL, sx + 0.35, 1.05, sz, 6); R.box(0.25, 0.03, 0.03, STEEL, sx + 0.25, 1.24, sz); rect(sx - 0.5, sx + 0.5, sz - 0.6, sz + 0.6);
    plane(board('NO LEAK TOO SMALL', 'ASK GUS', '#2e86b8', '#ffffff', YEL, 512, 200), 0.9, 0.35, sx - 0.46, 0.5, sz, -PI / 2); }
  // ---- MASONRY (back right): cement bag pallets, brick stacks, tiles ----
  { const [x, z] = W(14.0, 21.5);
    for (let p = 0; p < 2; p++) { const pz = z - 1.8 + p * 3.0; R.box(1.6, 0.14, 1.2, '#a07a52', x, 0.07, pz); for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) R.box(0.72, 0.2, 1.1, ['#e7e4dc', '#d9d4cc'][(r + i) % 2], x - 0.38 + i * 0.76, 0.24 + r * 0.21, pz); rect(x - 0.85, x + 0.85, pz - 0.65, pz + 0.65); }
    const [bx, bz] = W(10.8, 24.2); for (let r = 0; r < 5; r++) for (let i = 0; i < 4; i++) R.box(0.44, 0.15, 0.22, (r + i) % 2 ? '#a8432c' : '#b5482e', bx - 0.69 + i * 0.46, 0.08 + r * 0.16, bz); rect(bx - 0.95, bx + 0.95, bz - 0.2, bz + 0.2);
    for (let i = 0; i < 4; i++) R.box(0.05, 0.6, 0.6, ['#f3f2f2', '#2e4a6b', '#c9a27a', '#3f9a5e'][i], X1 - 0.3 - i * 0.07, 0.3, z + 2.4 + i * 0.05, 0, 0, 0.08); rect(X1 - 0.6, X1, z + 2.0, z + 2.9);
    plane(board('CEMENT \u00b7 BRICKS \u00b7 TILES', 'ASK MORTY', '#8a857e', '#ffffff', YEL, 512, 200), 1.2, 0.46, bx, 1.1, bz + 0.12, 0); }
  // ---- FRONT COUNTER + TOOLS (Dozer): long counter, register, KEYS CUT machine, pegboard of tools behind ----
  { const [cx, cz] = W(0, 9.4); R.box(6.0, 1.0, 0.9, '#5a5654', cx, 0.5, cz); R.box(6.1, 0.06, 1.0, RED, cx, 1.03, cz); rect(cx - 3.05, cx + 3.05, cz - 0.5, cz + 0.5);
    R.box(0.5, 0.32, 0.4, INK, cx - 1.6, 1.22, cz); R.box(0.44, 0.04, 0.3, '#3f9a5e', cx - 1.6, 1.4, cz + 0.02, 0, -0.5); R.box(0.6, 0.35, 0.4, '#c9ced3', cx + 1.7, 1.24, cz); R.cyl(0.08, 0.08, 0.06, STEEL, cx + 1.7, 1.24, cz + 0.22, 10, PI / 2);
    plane(board('KEYS CUT', 'WHILE YOU WAIT', YEL, INK, RED, 512, 200), 0.7, 0.27, cx + 1.7, 1.55, cz + 0.21, 0);
    plane(board('FRONT COUNTER', 'TOOLS \u00b7 REPAIR KITS \u00b7 FIRST AID \u00b7 DOZER\u2019S TAB', RED, '#ffffff', YEL, 1024, 200), 4.6, 0.9, cx, 0.55, cz + 0.46, 0);
    const [px, pz] = W(0, 11.6); R.box(8.0, 2.8, 0.2, '#c9a27a', px, 1.4, pz); for (let i = 0; i < 18; i++) for (let j = 0; j < 6; j++) R.box(0.03, 0.03, 0.01, '#7a5236', px - 3.8 + i * 0.45, 0.4 + j * 0.42, pz + 0.11);
    for (let i = 0; i < 7; i++) { const x = px - 3.2 + i * 1.05; if (i % 2) { R.box(0.06, 0.5, 0.04, '#7a5236', x, 1.7, pz + 0.14); R.box(0.3, 0.12, 0.08, STEEL, x, 1.98, pz + 0.14); } else { R.box(0.07, 0.6, 0.03, STEEL, x, 1.6, pz + 0.13); R.box(0.2, 0.14, 0.03, STEEL, x, 1.95, pz + 0.13); } R.box(0.5, 0.06, 0.04, RED, x, 2.4, pz + 0.13); }
    rect(px - 4.05, px + 4.05, pz - 0.15, pz + 0.15);
    plane(board('TOOLS', 'HAMMERS \u00b7 WRENCHES \u00b7 EVERYTHING', INK, YEL, RED, 1024, 200), 3.4, 0.66, px, 3.2, pz + 0.12, 0); }
  // s163: signs over the 2 side doors
  plane(board('GARDEN CENTRE', 'THROUGH HERE · FERN’S PLANTS', '#3f9a5e', '#ffffff', YEL, 1024, 200), 3.4, 0.66, GC.door[0] - 0.6, 5.2, Z0 + 0.12, 0);
  plane(board('LUMBER YARD', 'THROUGH HERE · HANK’S BOARDS', '#8b6a48', '#ffffff', YEL, 1024, 200), 3.4, 0.66, YARD.door[0] + 0.6, 5.2, Z0 + 0.12, 0);
  // ---- two gondolas in the middle (nuts, bolts, screws, glue) ----
  for (const s of [-1, 1]) { const [x, z] = W(s * 4.1, 16.0); R.box(1.1, 1.6, 5.4, '#e7e4dc', x, 0.8, z); for (let y = 0.45; y < 1.6; y += 0.4) for (let i = 0; i < 10; i++) R.box(0.16, 0.22, 0.4, ['#ec3013', '#2e86b8', '#ffd23a', '#c9ced3', '#3f9a5e'][(i + Math.round(y * 5)) % 5], x + (i % 2 ? 0.48 : -0.48), y + 0.13, z - 2.4 + Math.floor(i / 2) * 1.2); rect(x - 0.6, x + 0.6, z - 2.75, z + 2.75); }
  // ---- outside: the front sign, a lumber stack + planters by the door ----
  { plane(board('MERU HARDWARE', 'TOOLS \u00b7 LUMBER \u00b7 PAINT \u00b7 GARDEN \u00b7 7 DEPARTMENTS', RED, '#ffffff', YEL, 1024, 220), 9.0, 1.9, CX, 5.6, DZ0 + 0.14, 0);
    for (const s of [-1, 1]) { const [x, z] = W(s * 4.2, -1.6); R.box(1.2, 0.6, 1.2, '#b0623f', x, 0.3, z); R.sph(0.62, '#3f9a5e', x, 0.95, z); rect(x - 0.65, x + 0.65, z - 0.65, z + 0.65); }
    const [lx, lz] = W(-11, -1.8); for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) R.box(4.0, 0.14, 0.24, ['#c9a27a', '#b88a5c'][(i + r) % 2], lx, 0.12 + r * 0.15, lz - 0.38 + i * 0.25); rect(lx - 2.05, lx + 2.05, lz - 0.55, lz + 0.55);
    plane(board('LUMBER SALE', 'INSIDE \u00b7 ASK HANK', YEL, INK, RED, 512, 200), 1.4, 0.55, lx, 1.05, lz + 0.56, 0); }
  R.mesh(G);
  const OUT = buildHwOutside({ THREE, G, cols, hour, touch, board, plane, CT, crewHome: () => !out() });
  // ================= Tilly (PAINT) + Fern (GARDEN): they stay when the crew goes out =================
  const prop = (f, kind) => { const P = f.userData.P; if (!P) return; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false;
    if (kind === 'beret' && P.head) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.24, 0.1, 16), lam('#c2456a')); b.position.set(0.04, 0.33, -0.02); b.rotation.z = -0.25; P.head.add(b); }
    if (kind === 'beret' && P.body) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.58, 0.02), lam('#f3f2f2')); a.position.set(0, 0.95, 0.21); P.body.add(a); for (const [x, y, c] of [[-0.1, 1.05, '#ec3013'], [0.08, 0.86, '#2e86b8'], [0.12, 1.12, '#ffd23a']]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.035, 8), new THREE.MeshBasicMaterial({ color: c })); d.position.set(x, y, 0.222); P.body.add(d); } }
    if (kind === 'flower' && P.head) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 5), lam('#ffd23a')); fl.position.set(0.24, 0.16, 0.06); P.head.add(fl); for (let i = 0; i < 5; i++) { const pt = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), lam('#f3f2f2')); const a = i / 5 * PI * 2; pt.position.set(0.24 + Math.cos(a) * 0.07, 0.16 + Math.sin(a) * 0.07, 0.05); P.head.add(pt); } }
    if (kind === 'flower' && P.body) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 0.02), lam('#2e7a46')); a.position.set(0, 0.94, 0.21); P.body.add(a); } };
  const tilly = kit.makeFox({ key: 'hwTilly', name: 'Tilly Tint', torso: ['#7c4dc4', '#f3f2f2', '#4a2a7a'], outfit: 'vest', mood: 'happy', crest: '', look: { fur: '#e07a3a', furDark: '#9a4a20', lashes: 1 } }); prop(tilly, 'beret');
  const fern = kit.makeFox({ key: 'hwFern', name: 'Fern', torso: ['#f3f2f2', '#3f9a5e', '#c9c4bc'], outfit: 'vest', mood: 'warm', crest: '', look: { fur: '#c98a4a', furDark: '#8a5a2c', lashes: 1 } }); prop(fern, 'flower'); fern.scale.multiplyScalar(0.92);
  const TL = W(-9.2, 5.5), FN = W(9.2, 5.5); tilly.position.set(TL[0], 0, TL[1]); tilly.rotation.y = PI / 2; fern.position.set(FN[0], 0, FN[1]); fern.rotation.y = -PI / 2; G.add(tilly, fern);
  // s163 (Ben): FERN MOVES BY THE HOUR: mornings (7-13) out in the garden centre by her potting bench, the rest of the day at the garden counter inside.
  const FPTS = [[FN[0], FN[1]], [40.4, -160.5], [40.4, -171], [42.2, -171.5], [42.2, -177.3], [GC.door[0], -177.5], [GC.door[0], -180], gw(-190, 38.2), gw(-190, 40.2), [GC.fern[0], GC.fern[1]]];   // s167: garden counter → back door → potting bench
  const fernWant = () => { const h = hour(); return h >= 7 && h < 13 ? 'out' : 'in'; };
  let fernSide = fernWant(), fernWalk = null, fernWave = 0, fernWaveCd = 0;
  const fernPlace = k => { const p = k === 'out' ? GC.fern : [FN[0], FN[1], -PI / 2]; fern.position.set(p[0], 0, p[1]); fern.rotation.y = p[2]; fernSide = k; fernWalk = null; };
  fernPlace(fernSide);
  const OWN = { paint: { fox: tilly, name: 'Tilly Tint', role: 'PAINT', key: 'hwTilly', ry: PI / 2 }, garden: { fox: fern, name: 'Fern', role: 'GARDEN', key: 'hwFern', ry: -PI / 2 } };
  // ================= shop kit (Tilly = the keeper who waves you in, chime, browsers, light, clock, NOW HIRING) =================
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'hw', color: RED, boardTitle: 'Meru Hardware',
    room: { X0, X1, Z0, Z1 }, door: [CX, DZ0 - 0.6], keeper: tilly, keeperRy: PI / 2, games: HW_GAMES, allGames: HW_ALL, board: { x: CX + 6.2, y: 2.45, z: Z1 - 0.08, ry: PI, w: 1.4 }, hiring: { x: CX + 2.6, z: DZ0 - 1.6, ry: 0 }, hiringLine: 'WALK UP \u00b7 PICK A JOB',
    sun: [{ x: CX, z: DZ0 - 1.8, w: 3.2, d: 2.4 }, { x: CX - 9, z: DZ0 - 1.4, w: 2.4, d: 1.6 }, { x: CX + 9, z: DZ0 - 1.4, w: 2.4, d: 1.6 }],
    lamps: [-12, -4, 4, 12].flatMap(lx => [6, 14, 22].map(d => { const [x, z] = W(lx, d); return [x, 4.6, z]; })),
    browse: [[...W(-5.7, 15), -PI / 2], [...W(5.7, 17), PI / 2], [...W(-2.6, 21), PI], [...W(2.6, 7.4), PI], [...W(-11.4, 9.4), -PI / 2], [...W(11.0, 9.6), PI / 2]],
    clock: { x: CX - 6, y: 3.4, z: Z1 - 0.06, ry: PI } });
  // ================= lines (every box 20 words or less) =================
  const SUP = { lumber: s => 'Twelve oak boards for ' + cap(s) + '. Straight as a ruler. I checked every one twice.', elec: () => 'One spool of wire, three fuses. Red, blue, yellow. Do not lick any.',
    plumb: () => 'Six lengths of copper pipe. Shiny. No leak gets past copper.', mason: () => 'Eight bags of cement. Heavy. The truck carries them. You carry the clipboard.',
    paint: (s, c) => 'Sign paint, ' + c + '. Two coats, sunshine. Tell Dozer not to hum on it.', garden: () => 'Two planters for the front. Shops look happier with something green.',
    tools: s => 'Mm. Nails, bolts, my tab. Truck is loaded. See you at ' + cap(s) + '.' };
  const SUPI = { lumber: '12 OAK BOARDS', elec: 'WIRE + 3 FUSES', plumb: '6 COPPER PIPES', mason: '8 CEMENT BAGS', paint: 'SIGN PAINT', garden: '2 PLANTERS', tools: 'NAILS, BOLTS + THE TAB' };
  const PCOL = { sport: 'forest green', tees: 'hot pink', gelato: 'gelato pink', elec: 'navy blue', furn: 'walnut brown' };
  const SNAME = { sport: 'SPORTING GOODS', tees: 'FUNNY T-SHIRTS', gelato: 'GELATO', elec: 'ELECTRONICS', furn: 'FURNITURE' };
  const cap = k => (SNAME[k] || k).split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
  const L = {
    paint: { first: 'Tilly Tint, paint and the till. Welcome to Meru Hardware, sunshine. Seven departments, one Dozer.',
      hi: ['Sunshine! Need a colour? I can mix any colour. Except plaid.', 'Back again! The paint is drying. Very exciting. Watch with me.', 'Hello, sunshine. Hank says hello. Well, Hank grunted. Same thing.'],
      shop: 'Brighten up your flat, sunshine.', bye: 'Bye, sunshine! Wash your brushes!',
      word: ['I painted the whole store red. Dozer hummed for a week. Happy hum.', 'Fern talks to the plants. I talk to the paint. We are both fine.', 'Every fox needs one wall that makes them smile.'] },
    garden: { first: 'Oh! Hello. I am Fern. Garden. The plants are shy. So am I.',
      hi: ['Hello, sprout. The sunflowers grew a centimetre. I measured.', 'Shh. The tomatoes are napping. Hello, sprout.', 'Hi, sprout. Want a seed? Seeds are tiny promises.'],
      shop: 'Seeds, pots, a gnome. The gnome is called Gary.', bye: 'Bye, sprout. Water things.',
      word: ['Gus gives me the drips from his pipes. Free water. Very kind.', 'Morty pretends he hates plants. He waters the ivy when he thinks I am not looking.', 'I want a roof garden one day. Dozer says mm. That means maybe.'] } };
  const AWAYL = { paint: ['Everyone went to the Outlets with Dozer. It\u2019s just me, Fern and the paint fumes.', 'Quiet in here today, sunshine. Even the drills are on holiday.', 'Hank left his coffee. Volta left the lights on. Typical crew.'],
    garden: ['Shh. Hear that? No humming. Dozer is at the Outlets.', 'I am watering the whole store today. Even the bricks.', 'Gus said do not touch the pipes. I am touching the plants instead.'] };
  const HEADHI = { master: ['Hank Plank. Lumber. Measure twice, cut once, kid.', 'Kid. Oak, pine, birch. Pick a plank.', 'Sawdust in my whiskers again. Good day.'],
    dot: ['Volta Vee! Electrical! Hello, bright spark!', 'Bright spark! Watt can I do for you? Sorry. Not sorry.', 'Every bulb in here works. I checked. Twice. With my nose.'],
    spritz: ['Gus Gasket. Plumbing. No leak too small.', 'Drip, drip. That is my favourite song. Hello.', 'Pipes are just roads for water. I am the traffic cop.'],
    brick: ['Morty Mortar. Masonry. I like bricks. Bricks do not talk back.', 'Cement waits for no fox. You may browse.', 'Hello. Mind the bags. They are heavier than they look. Everything is.'] };
  const SHOPL = { master: 'Boards and sheets, kid. For building things.', dot: 'Lamps, lights and wire, bright spark!', spritz: 'Pipe and one rubber duck. The duck is for morale.', brick: 'Bricks and cement. Heavy, honest, cheap.', dozer: 'Mm. Tools, kits, first aid. Pick one.' };
  const BYEL = { master: 'Mind the splinters, kid.', dot: 'Stay bright!', spritz: 'Stay dry.', brick: 'Goodbye. Lift with your legs.', dozer: 'Mm. Mind how you go.' };
  // ================= stock =================
  const MAT = 'BUILDING MATERIAL', DEC = 'FOR YOUR FLAT';
  const STOCK = {
    tools: [{ key: 'hammer', label: 'CLAW HAMMER', price: 40, note: 'MELEE LOOK', tool: true }, { key: 'wrench', label: 'BIG WRENCH', price: 40, note: 'MELEE LOOK', tool: true },
      { key: 'repairKit', label: 'REPAIR KIT', price: 25, note: '+40 VEHICLE ARMOUR' }, { key: 'firstAidKit', label: 'FIRST AID KIT', price: 30, note: '+100 HP' }, { key: 'bandageRoll', label: 'BANDAGE ROLL', price: 8, note: '+30 HP' }],
    lumber: [{ key: 'oakBoard', label: 'OAK BOARD', price: 6, note: MAT }, { key: 'plywood', label: 'PLYWOOD SHEET', price: 10, note: MAT }],
    elec: [{ key: 'wireSpool', label: 'WIRE SPOOL', price: 6, note: MAT }, { key: 'stringLights', label: 'STRING LIGHTS', price: 12, note: DEC }, { key: 'deskLamp', label: 'DESK LAMP', price: 18, note: DEC }],
    plumb: [{ key: 'copperPipe', label: 'COPPER PIPE', price: 8, note: MAT }, { key: 'rubberDuck', label: 'RUBBER DUCK', price: 5, note: DEC }],
    mason: [{ key: 'brickStack', label: 'BRICKS \u00d7 10', price: 12, note: MAT }, { key: 'cementBag', label: 'CEMENT BAG', price: 9, note: MAT }],
    paint: [{ key: 'paintSky', label: 'WALL PAINT \u00b7 SKY BLUE', price: 8, note: DEC }, { key: 'paintSun', label: 'WALL PAINT \u00b7 SUNNY YELLOW', price: 8, note: DEC }, { key: 'pictureFrame', label: 'PICTURE FRAME', price: 15, note: DEC }],
    garden: [{ key: 'seedSunflower', label: 'SUNFLOWER SEEDS', price: 4, note: 'SEEDS' }, { key: 'seedTomato', label: 'TOMATO SEEDS', price: 4, note: 'SEEDS' }, { key: 'pottedFern', label: 'POTTED FERN', price: 14, note: DEC }, { key: 'gardenGnome', label: 'GARDEN GNOME', price: 20, note: DEC }] };
  { const IC = window.__8G_ITEMS; if (IC) for (const k in STOCK) STOCK[k] = IC.stock(STOCK[k], 'Meru Hardware'); }   // ITEM CATALOG
  const KIND = {}; for (const k in STOCK) for (const it of STOCK[k]) KIND[it.key] = it.note;
  // ================= sound + toast + card =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.4) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; }, hideCard = () => { if (cardKey) { card.style.display = 'none'; cardKey = ''; } };
  const chips = items => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>';
  const FK = buildForklift({ THREE, G, OUT, cols, touch, isMuted, board, plane, toast: (t, s) => toast(t, s), setCard, hideCard, onDone: st => JB.yardDone(st, radio()), onQuit: () => JB.quit() });
  const radio = () => ({ t: { key: 'hwHankRadio', name: 'Hank Plank', role: 'ON THE RADIO', obj: OUT.fork.g, ry: 0, r: 9 }, l: text => ({ who: 'Hank Plank', role: 'ON THE RADIO', text }), away: null });
  // ================= the crew link (worlds/meru2-outlet-crew.js owns Dozer + the 4 heads and the supply state) =================
  const CR = () => window.__crew || null;
  const sup = () => { const c = CR(); return c && c.supState ? c.supState() : null; };   // { cur, got: { dept: true }, ok } or null
  const out = () => { const c = CR(); return !!(c && c.crewOut && c.crewOut()); };
  const headOf = D => (D.head === 'paint' || D.head === 'garden') ? OWN[D.head] : (() => { const c = CR(), f = c && c.fox && c.fox(D.head); return f ? { fox: f, name: c.name(D.head), role: D.name, key: 'crew_' + D.head, ry: HW.spot[D.head][2] } : null; })();
  const tgt = h => ({ key: h.key, name: h.name, role: h.role, obj: h.fox, ry: h.fox.rotation.y, r: 5 });
  const ln = h => text => ({ who: h.name, role: h.role, text });
  const isAway = D => out() && ['elec', 'lumber', 'plumb', 'mason', 'tools'].includes(D.k);
  // ================= supply run =================
  const SUP_ORDER = ['lumber', 'elec', 'plumb', 'mason', 'paint', 'garden', 'tools'];
  const supNeed = D => { const s = sup(); return !!(s && s.cur && !s.ok && !s.got[D.k]); };
  function pickUp(D) { const s = sup(), h = headOf(D); if (!s || !h) return; const c = CR();
    if (D.k === 'tools') { const left = SUP_ORDER.filter(k => k !== 'tools' && !s.got[k]); if (left.length) { sayTo(tgt(h), [ln(h)('Mm. List first, tab last. Still need: ' + left.map(k => DK[k].name).join(', ') + '.')]); return; }
      c.supPick('tools'); thunk(); ding(); sayTo(tgt(h), [ln(h)(SUP.tools(s.cur))], () => { c.supplied(); toast('SUPPLIES ON THE TRUCK \u00b7 MEET THE CREW AT ' + SNAME[s.cur], 4); }); return; }
    c.supPick(D.k); thunk(); coin(); toast(SUPI[D.k] + ' \u00b7 ON THE LIST \u2713', 2); sayTo(tgt(h), [ln(h)(SUP[D.k](s.cur, PCOL[s.cur] || 'red'))]); }
  // ================= talk menus (YES, PUT ME TO WORK! first · GOODBYE last) =================
  const tick0 = { met: () => save.stat('hwMet', null) || {} };
  function shop(D, h) { const l = ln(h), list = STOCK[D.k], first = l((D.side ? (SHOPL[D.head] || L[D.k].shop) : SHOPL.dozer) + ' You have ' + save.data.gold + ' G.');
    sayTo(tgt(h), [{ ...first, choices: [...list.map(it => ({ text: it.label + ' \u00b7 ' + it.price + ' G \u00b7 ' + it.note, pick: () => buy(D, h, it) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  function buy(D, h, it) { const l = ln(h);
    if (it.tool) { const own = save.stat('hwTools', null) || {}; if (own[it.key]) { setTool(it.key); toast(it.label + ' \u00b7 ALREADY YOURS \u00b7 EQUIPPED', 2.4); return; }
      if (!save.spend(it.price)) { nope(); sayTo(tgt(h), [l('Short on gold. Mm. Come back.')]); return; } save.setStat('hwTools', { ...own, [it.key]: true }); setTool(it.key); coin(); toast(it.label + ' \u00b7 EQUIPPED AS YOUR MELEE \u00b7 \u2212' + it.price + ' G', 3); sayTo(tgt(h), [l('Good grip. Same hit, more style. Swap it in WEAPONS.')], () => shop(D, h)); return; }
    if (!save.spend(it.price)) { nope(); sayTo(tgt(h), [l('Not enough gold. Come back soon.')]); return; } save.give(it.key); coin(); toast(it.label + ' \u00b7 IN YOUR BAG \u00b7 \u2212' + it.price + ' G', 2.4); sayTo(tgt(h), [l('In the bag. Thank you!')], () => shop(D, h)); }
  let hiN = 0;
  function ownMenu(D) { const h = OWN[D.head], l = ln(h), Lx = L[D.k], met = tick0.met(), first = !met[D.k]; if (first) save.setStat('hwMet', { ...met, [D.k]: true });
    const s = sup(), away = out(), n = hiN++;
    const work = { text: CHOICE_WORK, pick: () => { if (supNeed(D)) pickUp(D); else if (s && s.cur && !s.ok) sayTo(tgt(h), [l('Fetch the rest of the list, then Dozer signs the tab at the counter.')]); else JB.start(D.k); } };
    const ch = [work, { text: 'BROWSE ' + D.name, pick: () => shop(D, h) }];
    if (away) ch.push({ text: 'WHERE IS EVERYONE?', pick: () => sayTo(tgt(h), [l(AWAYL[D.k][n % 3])]) });
    ch.push({ text: 'A WORD?', pick: () => sayTo(tgt(h), [l(Lx.word[n % Lx.word.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => sayTo(tgt(h), [l(Lx.bye)]) });
    sayTo(tgt(h), [{ ...l(first ? Lx.first : away && n % 2 ? AWAYL[D.k][n % 3] : Lx.hi[n % Lx.hi.length]), choices: ch }]); }
  function headMenu(D) { const h = headOf(D); if (!h) return; const l = ln(h), c = CR(), n = hiN++;
    const work = { text: CHOICE_WORK, pick: () => { if (supNeed(D)) pickUp(D); else JB.start(D.k); } };
    sayTo(tgt(h), [{ ...l((supNeed(D) ? 'The list! I have your ' + SUPI[D.k].toLowerCase() + ' ready. ' : '') + HEADHI[D.head][n % 3]), choices: [work, { text: 'BROWSE ' + D.name, pick: () => shop(D, h) },
      { text: 'A WORD?', pick: () => sayTo(tgt(h), [l(c && c.word ? c.word(D.head) : '...')]) }, { text: CHOICE_BYE, bye: true, pick: () => sayTo(tgt(h), [l(BYEL[D.head])]) }] }]); }
  function counterMenu() { const D = DK.tools, h = headOf(D), c = CR(); if (!h || !c) return; if (supNeed(D)) { pickUp(D); return; } c.dozerTalk([{ text: 'KEY CUTTER \u00b7 CUT KEYS FOR DOZER', pick: () => JB.start('tools') }, { text: 'BROWSE THE COUNTER', pick: () => shop(D, h) }]); }
  // an AWAY department: Tilly rings it up from the paint counter
  function awayMenu(D) { const h = runner(D), l = ln(h);
    sayTo(tgt(h), [{ ...l(headName(D) + ' is at the Outlets with Dozer. I can ring up ' + D.name.split(' ')[0].toLowerCase() + ' for you, sunshine.'), choices: [{ text: CHOICE_WORK, pick: () => JB.start(D.k) }, { text: 'BROWSE ' + D.name, pick: () => shop(D, h) }, { text: CHOICE_BYE, bye: true, pick: () => sayTo(tgt(h), [l(L[h === OWN.garden ? 'garden' : 'paint'].bye)]) }] }]); }
  const headName = D => { const c = CR(); return c && c.name ? c.name(D.head) : 'The crew'; };
  // ================= tools as melee looks (CLAW HAMMER / BIG WRENCH) =================
  const own = () => save.stat('hwTools', null) || {}, toolNow = () => { const w = save.stat('hwWear', null) || {}; return w.tool && own()[w.tool] ? w.tool : null; };
  function setTool(k) { save.setStat('hwWear', { tool: k || null }); }
  const meleeExtra = () => ['hammer', 'wrench'].filter(k => own()[k]).map(k => ({ key: k, name: k === 'hammer' ? 'CLAW HAMMER' : 'BIG WRENCH', line: k === 'hammer' ? 'From Dozer\u2019s counter. Same hit, more bang.' : 'From Dozer\u2019s counter. Same hit, more torque.', on: toolNow() === k }));
  function equipMelee(k) { if (k === 'hammer' || k === 'wrench') { if (!own()[k]) return; setTool(k); toast((k === 'hammer' ? 'CLAW HAMMER' : 'BIG WRENCH') + ' EQUIPPED', 1.4); } else setTool(null); }
  const makeTool = k => { const g = new THREE.Group(), add = (geo, c, x, y, z, rz = 0) => { const m = new THREE.Mesh(geo, lam(c)); m.position.set(x, y, z); m.rotation.z = rz; g.add(m); return m; };
    if (k === 'hammer') { add(new THREE.BoxGeometry(0.06, 0.62, 0.06), '#7a5236', 0, 0, 0); add(new THREE.BoxGeometry(0.3, 0.1, 0.1), '#8a9096', 0.04, 0.32, 0); add(new THREE.BoxGeometry(0.12, 0.05, 0.08), '#5e6368', -0.15, 0.36, 0, 0.5); }
    else { add(new THREE.BoxGeometry(0.06, 0.6, 0.03), '#8a9096', 0, 0, 0); const h = add(new THREE.TorusGeometry(0.08, 0.03, 6, 12, PI * 1.5), '#8a9096', 0, 0.36, 0); h.rotation.z = -PI * 0.25; add(new THREE.BoxGeometry(0.08, 0.16, 0.035), RED, 0, -0.22, 0); }
    g.traverse(o => { o.renderOrder = 2; }); return g; };
  let worn = null; function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const k = toolNow(), onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.k === k && worn.fox === fox && (!worn.g || onFox(worn.g)))) { if (worn && worn.g && worn.g.parent) worn.g.parent.remove(worn.g); worn = { k, fox, g: null }; if (k && U.P.arms && U.P.arms[1]) { worn.g = makeTool(k); worn.g.position.set(0, -0.42, 0.06); U.P.arms[1].add(worn.g); } }
    if (k && U.P.sword) U.P.sword.visible = false; }
  function useItem(id) { const n = KIND[id]; if (!n || id === 'repairKit' || id === 'firstAidKit' || id === 'bandageRoll' || !save.count || !save.count(id)) return false;
    toast(n === MAT ? 'BUILDING MATERIAL \u00b7 KEEP IT FOR BUILDING' : n === 'SEEDS' ? 'SEEDS \u00b7 KEEP THEM FOR PLANTING' : 'FOR YOUR FLAT \u00b7 KEEP IT FOR DECORATING', 2.4); return true; }
  // ================= prompt + talk =================
  const inShop = P => !!P && P.x > X0 && P.x < X1 && P.z > Z0 && P.z < Z1 + 0.3 && (P.y || 0) < 2.5;
  const dist = (P, x, z) => Math.hypot(P.x - x, P.z - z);
  const deptAt = P => DEPTS.find(D => dist(P, D.talk[0], D.talk[1]) < (D.side ? 1.5 : 1.7));
  function prompt(P) { const fp = FK.prompt(P); if (fp) return fp; const jb0 = JB.busy(); if ((jb0 && jb0 !== 'yard') || P.skate) return null; if (!inShop(P)) return outPrompt(P); const D = deptAt(P);
    if (D && D.k === 'garden' && !fernIn() && !supNeed(D)) return 'GARDEN \u00b7 FERN IS OUTSIDE \u00b7 ASK TILLY';
    if (D) { if (supNeed(D)) return 'PICK UP \u00b7 ' + SUPI[D.k]; if (D.k === 'tools') return 'TALK \u00b7 DOZER \u00b7 FRONT COUNTER'; if (isAway(D)) return D.name + ' \u00b7 ASK TILLY'; const h = headOf(D); return h ? 'TALK \u00b7 ' + h.name.toUpperCase() : null; }
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 PICK A JOB'; return null; }
  function talk(P) { if (FK.talk(P)) return true; const jb0 = JB.busy(); if (jb0 && jb0 !== 'yard') return true; if (!inShop(P)) return outTalk(P); const D = deptAt(P);
    if (D && D.k === 'garden' && !fernIn() && !supNeed(D)) { tone(1320, 0.05, 0.5); fernOutMenu(); return true; }
    if (D) { tone(1320, 0.05, 0.5); if (D.k === 'tools') { if (isAway(D)) awayMenu(D); else counterMenu(); return true; } if (D.head === 'paint' || D.head === 'garden') { ownMenu(D); return true; } if (isAway(D)) { awayMenu(D); return true; } if (supNeed(D)) { pickUp(D); return true; } headMenu(D); return true; }
    if (K.atHiring(P)) { tone(1320, 0.05, 0.5); const s = sup(); if (s && s.cur && !s.ok) { toast('SUPPLY RUN \u00b7 VISIT EACH YELLOW RING', 2.6); return true; } JB.hiring(); return true; } return false; }
  // ================= department jobs (s162) =================
  const runner = D => (isAway(D) ? (D.side > 0 ? OWN.garden : OWN.paint) : headOf(D));
  const speaker = k => { const D = DK[k], h = D && runner(D); return h ? { t: tgt(h), l: ln(h), away: isAway(D) ? headName(D) : null } : null; };
  const PRIZE = { all: ['Every department, sunshine! Hank says you earned his spare flannel.', "HANK'S FLANNEL is in your wardrobe. Plus forty gold. Red suits you."],
    hero: ['Three stars in every department! Dozer hummed twice. That never happens.', 'You are a HARDWARE HERO, sunshine. Your name goes on the wall.'],
    extra: ['Every extra job too, sunshine! Dozer says you are our SHOP FOREMAN now.', 'Sixty gold, and the whole crew calls you boss. Dozer hummed.'] };
  const JB = hwJobs({ save, K, sayTo, toast, isMuted, speaker, yard: { arm: () => FK.arm(), disarm: () => FK.disarm() }, prize: kind => { const h = OWN.paint; sayTo(tgt(h), PRIZE[kind].map(ln(h)), () => { ding(); toast(kind === 'all' ? "HANK'S FLANNEL \u00b7 IN YOUR WARDROBE \u00b7 +40 GOLD" : kind === 'extra' ? 'SHOP FOREMAN \u00b7 +60 GOLD' : 'HARDWARE HERO \u00b7 +100 GOLD', 4); heroSync(); }); } });
  // HARDWARE HERO plaque under the board (shows once earned)
  const heroP = plane(board('HARDWARE HERO', 'THREE STARS IN ALL 7 DEPARTMENTS', YEL, INK, RED, 1024, 220), 1.4, 0.3, CX + 6.2, 1.25, Z1 - 0.07, PI); const heroSync = () => { heroP.visible = !!save.stat('hwHero', false); }; heroSync();
  // ================= per frame =================
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false });
  const RINGS = DEPTS.map(D => { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.84, 32), ringM); m.rotation.x = -PI / 2; m.position.set(D.talk[0], 0.09, D.talk[1]); m.visible = false; G.add(m); return { D, m }; });
  let lastHP = null, wasIn = false, wasOut = null, quipT = 0, awayN = 0, lastD = null;
  function tick(dt, P, fox) { if (!P) return; lastHP = P; if (toastT > 0) toastT -= dt; const t = performance.now() / 1000, d = dist(P, HW.c[0], HW.c[1]), inS = inShop(P);
    G.visible = d < 120; try { applyWear(fox); } catch (e) {} if (d > 90) { hideCard(); return; }
    const jb = !!JB.busy(); K.tick(dt, P, { inShop: inS, busy: jb === true || JB.busy() === 'job', near: inS ? 0 : d });
    try { OUT.tick(dt, P, d); FK.tick(dt); } catch (e) {} fernTick(dt, t, P, inS);
    const s = sup(), o = out(); if (o !== wasOut) { wasOut = o; for (const a of AWAY) a.m.visible = o; }
    RINGS.forEach((r, i) => { r.m.visible = inS && supNeed(r.D); if (r.m.visible) r.m.scale.setScalar(1 + 0.08 * Math.sin(t * 3 + i)); });
    BULBS.forEach((b, i) => { b.material.color.setHSL(0.13, 1, 0.8 + 0.15 * Math.sin(t * 2 + i)); });
    // stay-behind comments: walking in while the crew is out, or standing at an empty department
    if (inS && !wasIn && o) { const k = awayN++ % 2 ? 'garden' : 'paint'; quipT = 8; toast((k === 'paint' ? 'TILLY: ' : 'FERN: ') + AWAYL[k][Math.floor(awayN / 2) % 3], 4); }
    wasIn = inS; quipT -= dt; const D = inS ? deptAt(P) : null;
    if (D && D !== lastD && o && isAway(D) && D.k !== 'tools' && quipT <= 0) { quipT = 12; toast('TILLY: ' + headName(D) + '\u2019s out at the Outlets. I can ring it up, sunshine. Just say.', 3.2); } lastD = D;
    // the supply list card
    if (JB.busy() === 'yard' && FK.card()) {} else if (jb) hideCard(); else if (inS && s && s.cur && !s.ok) { const key = 'sup' + JSON.stringify(s.got); setCard(key, '<div style="background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px">SUPPLY LIST \u00b7 ' + SNAME[s.cur] + '</div><div style="padding:8px 10px 10px"><div style="font-size:12px;font-weight:800">Step in each yellow ring. Dozer signs the tab last.</div>' + chips(SUP_ORDER.map(k => [SUPI[k], !!s.got[k]])) + '</div>'); }
    else if (inS && o) setCard('away', '<div style="background:#201e1d;color:#ffd23a;padding:6px 10px;font-weight:900;font-size:13px">THE CREW IS AT THE OUTLETS</div><div style="padding:8px 10px 10px;font-size:12px;font-weight:800">Tilly and Fern are minding the store. Tilly rings up every department.</div>');
    else hideCard(); }
  function fernTick(dt, t, P, inS) { const want = fernWant(), A = fern.userData.P && fern.userData.P.arms;
    if (want !== fernSide && !fernWalk) { if (dist(P, fern.position.x, fern.position.z) > 45) fernPlace(want); else { fernWalk = { pts: want === 'out' ? FPTS.slice(1) : FPTS.slice(0, -1).reverse(), i: 0, to: want }; fernSide = 'walk'; } }
    if (fernWalk) { const [tx, tz] = fernWalk.pts[fernWalk.i], dx = tx - fern.position.x, dz = tz - fern.position.z, dd = Math.hypot(dx, dz);
      if (dd < 0.08) { if (++fernWalk.i >= fernWalk.pts.length) { const to = fernWalk.to; fernPlace(to); } } else { const st = Math.min(dd, 1.6 * dt); fern.position.x += dx / dd * st; fern.position.z += dz / dd * st; fern.rotation.y = Math.atan2(dx, dz); }
      kit.animFox && kit.animFox(fern, dt, fernWalk ? 1.6 : 0); return; }
    const out0 = fernSide === 'out', home = out0 ? GC.fern[2] : -PI / 2, tf = dist(P, fern.position.x, fern.position.z), near = tf < 4.5 && (out0 ? OUT.inGC(P) : inS);
    // waves from the gate when you come up the street
    fernWaveCd -= dt; if (out0 && fernWaveCd <= 0 && !OUT.inGC(P) && dist(P, GC.gate[0], GC.gate[1]) < 9) { fernWave = 1.8; fernWaveCd = 40; }
    const a = near || fernWave > 0 ? Math.atan2(P.x - fern.position.x, P.z - fern.position.z) : home + Math.sin(t * 0.5) * 0.2; fern.rotation.y += Math.atan2(Math.sin(a - fern.rotation.y), Math.cos(a - fern.rotation.y)) * Math.min(1, dt * 3);
    kit.animFox && kit.animFox(fern, dt, 0); if (A && A[1]) { if (fernWave > 0) { fernWave -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; if (fernWave <= 0) { A[1].rotation.x = 0; A[1].rotation.z = 0; } } } }
  const fernIn = () => fernSide === 'in';
  // outside: Fern by her bench, the plant tables (Fern rings it up, or the honesty tin while she is inside)
  const TIN = { fox: OUT.tableObj, name: 'Honesty Tin', role: 'PLANT TABLES', key: 'hwHonesty', ry: 0 };
  function tableShop() { const D = DK.garden; if (fernSide === 'out') { shop(D, OWN.garden); return; } const l = ln(TIN);
    sayTo(tgt(TIN), [{ ...l('Fern is inside. Pick a plant, drop the gold in the tin. You have ' + save.data.gold + ' G.'), choices: [...STOCK.garden.map(it => ({ text: it.label + ' \u00b7 ' + it.price + ' G \u00b7 ' + it.note, pick: () => buy(D, TIN, it) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  function outPrompt(P) { if (!OUT.inGC(P)) return null; if (fernSide === 'out' && dist(P, GC.fernTalk[0], GC.fernTalk[1]) < 1.6) return 'TALK \u00b7 FERN'; if (dist(P, GC.table[0], GC.table[1]) < 1.5) return 'PLANT TABLES \u00b7 BUY'; return null; }
  function outTalk(P) { if (!OUT.inGC(P)) return false; if (fernSide === 'out' && dist(P, GC.fernTalk[0], GC.fernTalk[1]) < 1.6) { tone(1320, 0.05, 0.5); ownMenu(DK.garden); return true; }
    if (dist(P, GC.table[0], GC.table[1]) < 1.5) { tone(1320, 0.05, 0.5); tableShop(); return true; } return false; }
  function fernOutMenu() { const D = DK.garden, h = OWN.paint, l = ln(h);
    sayTo(tgt(h), [{ ...l(fernSide === 'walk' ? 'Fern is on her way, sunshine. I can ring up garden things.' : 'Fern is out in the garden centre, sunshine. Green door. I can ring up seeds.'), choices: [{ text: CHOICE_WORK, pick: () => JB.start('garden') }, { text: 'BROWSE GARDEN', pick: () => shop(D, h) }, { text: CHOICE_BYE, bye: true, pick: () => sayTo(tgt(h), [l(L.paint.bye)]) }] }]); }
  const API = { group: G, signTab: () => pickUp(DK.tools), prompt, talk, tick, camFix(c, dt) { try { OUT.camFix(c, dt, lastHP); } catch (e) {} }, quit() { JB.quit(); }, useItem, out: OUT, fernSide: () => fernSide, fernGo: k => fernPlace(k), lots: HW.lots, busy: () => (JB.busy() === 'job' || JB.busy() === 'picker' ? JB.busy() : null), jobs: JB, toast: () => (toastT > 0 ? toastTxt : ''), meleeExtra, equipMelee, HW, DEPTS, STOCK, tilly, fern, inShop,
    fork: FK, dispose() { card.remove(); K.dispose(); JB.dispose(); FK.dispose(); } };
  window.__hardware = API; return API;
}
