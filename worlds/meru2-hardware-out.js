// MERU 2.0 — s163 MERU HARDWARE · PART 2B: the outside (Ben s162: "3 entrances into one store + an open-air garden centre on the street").
// FERN'S GARDEN CENTRE: street front east of the store (f -194..-170.6 × 14..41.2), the GARDEN DOOR (E wall, z 35) opens into it, the flower-arch gate on the skate road.
//   Greenhouse roof over plant tables (buy from them), seed / compost pallets, fountain, koi pond, sprinklers, sunflower beds, bunting, bees + butterflies by day,
//   the gate shuts at night (20-7) and the fairy lights come on (18:30-7). Fern works here in the morning (worlds/meru2-hardware.js moves her by the hour).
// LUMBER YARD: west of the store (f -240..-230 × 13..41.2), the SIDE GATE (W wall, z 20) opens into it. Covered board racks, log pile, saw shed, sawdust, pallets,
//   Hank's forklift (parked, engine idles) and the MERU HARDWARE truck (parked here while the crew is home).
// s167 MOVE (Ben): the store now stands on the main ring road (f 12..48 × -176..-150, front door S). Both lots are BUILT in their old local frames and placed:
//   YARD = behind the store (north-west), same frame shifted OX/OZ: its old south side is the store's back wall (door into Hank's corner), gate in the WEST fence (castle path).
//   GC   = behind the store (north), turned a quarter (old west side = the store's back wall, old street side = the hospital road on the east): world = (z + 10.4, -x - 370).
export const OX = 254, OZ = -216.5;   // s727: complex moved 2.5 m north
const GCL = { f: [-194, -170.6, 14, 41.2], gate: [-182, 41.2], door: [-194, 35], fern: [-188.2, 40.3, Math.PI], fernTalk: [-188.2, 38.2], table: [-177, 25.2] };
const YDL = { f: [-240, -230, 13, 38], gate: [-240, 35.2], door: [-231.3, 38] };
export const gw = (x, z) => [z + 10.4, -x - 372.5], yw = (x, z) => [x + OX, z + OZ];
export const GC = { f: [24.4, 51.6, -201.9, -178.5], gate: gw(-182, 41.2), door: gw(-194, 35), fern: [...gw(-188.2, 40.3), Math.PI + Math.PI / 2], fernTalk: gw(-188.2, 38.2), table: gw(-177, 25.2) };
export const YARD = { f: [14, 24, -203.5, -178.5], gate: yw(-240, 35.2), door: yw(-231.3, 38) };
export function buildHwOutside({ THREE, G, cols, hour = () => 12, touch, board, plane, CT, crewHome = () => true }) {
  const PI = Math.PI, INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WOOD = '#8b6a48', GRN = '#2e6a42', DARK = '#3d3b3a', STEEL = '#9aa0a6';
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); geo.dispose(); };
    return { put, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z, sy = 1) => { const g = new THREE.SphereGeometry(r, 8, 5); if (sy !== 1) g.scale(1, sy, 1); put(g, x, y, z, hex); },
      mesh(parent, mat) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, mat || new THREE.MeshLambertMaterial({ vertexColors: true })); parent.add(m); return m; } }; };
  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  const rect = (x0, x1, z0, z1) => { const c = { f: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] }; cols.push(c); return c; };
  const gcG = new THREE.Group(); gcG.position.set(10.4, 0, -372.5); gcG.rotation.y = PI / 2; G.add(gcG);   // garden centre frame
  const ydG = new THREE.Group(); ydG.position.set(OX, 0, OZ); G.add(ydG);   // lumber yard frame
  const rectG = (x0, x1, z0, z1) => rect(z0 + 10.4, z1 + 10.4, -x1 - 372.5, -x0 - 372.5), rectY = (x0, x1, z0, z1) => rect(x0 + OX, x1 + OX, z0 + OZ, z1 + OZ);
  const planeG = (...a) => { const m = plane(...a); gcG.add(m); return m; }, planeY = (...a) => { const m = plane(...a); ydG.add(m); return m; };
  const R = mk(), RY = mk(), B = mk(), RF1 = mk(), RF2 = mk(), LH = mk(), LHY = mk();   // R / B / LH = garden centre frame · RY / RF1 / RF2 / LHY = yard frame   // RF1/RF2 = the 2 yard roofs (fade when they block the camera), LH = lamp heads (glow at night)   // R = solid props, B = double-sided bunting flags
  const ground = (f, draw, rep, par = G) => { const t = CT(256, 256, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((f[1] - f[0]) / rep, (f[3] - f[2]) / rep);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f[1] - f[0], f[3] - f[2]), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -PI / 2; m.position.set((f[0] + f[1]) / 2, 0.065, (f[2] + f[3]) / 2); par.add(m); };
  // ================= FERN'S GARDEN CENTRE =================
  const [gx0, gx1, gz0, gz1] = GCL.f, gcx = (gx0 + gx1) / 2;
  ground(GCL.f, (g, w) => { g.fillStyle = '#cfc6b4'; g.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = ['#d8cfbd', '#c7bda9', '#d2c9b6'][(i * 3 + j) % 3]; g.fillRect(i * 64 + 3, j * 64 + 3, 58, 58); } }, 2.5, gcG);
  // green railing fence (the building wall closes the west side); the front leaves a 4 m gap for the flower arch gate
  const rail = (x0, z0, x1, z1, h = 1.1, c = GRN) => { const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.2));
    for (let i = 0; i <= n; i++) { const u = i / n; R.box(0.1, h + 0.1, 0.1, c, x0 + (x1 - x0) * u, (h + 0.1) / 2, z0 + (z1 - z0) * u); }
    for (const y of [0.25, h - 0.04]) R.box(0.05, 0.06, L, c, (x0 + x1) / 2, y, (z0 + z1) / 2, ry);
    const nb = Math.floor(L / 0.28); for (let i = 1; i < nb; i++) { const u = i / nb; R.box(0.03, h - 0.3, 0.03, c, x0 + (x1 - x0) * u, 0.25 + (h - 0.3) / 2, z0 + (z1 - z0) * u); }
    rectG(x0 - 0.1, x1 + 0.1, z0 - 0.1, z1 + 0.1); };
  rail(gx0, gz0, gx1, gz0); rail(gx1, gz0, gx1, gz1); rail(gx0, gz1, GCL.gate[0] - 2.2, gz1); rail(GCL.gate[0] + 2.2, gz1, gx1, gz1); rail(gx0 + 0.1, 38.2, gx0 + 0.1, gz1);
  // ---- greenhouse roof (glass on a white frame) over the north part ----
  let ghGlassM = null;
  const ghZ0 = gz0 + 0.4, ghZ1 = 26, ghX0 = gx0 + 0.4, ghX1 = gx1 - 0.4, EAVE = 3.2, RIDGE = 4.6, ghC = (ghZ0 + ghZ1) / 2, half = (ghZ1 - ghZ0) / 2, sl = Math.hypot(half, RIDGE - EAVE), ang = Math.atan2(RIDGE - EAVE, half);
  { const W = '#f3f2f2', xs = []; for (let i = 0; i <= 5; i++) xs.push(ghX0 + (ghX1 - ghX0) * i / 5);
    for (const x of xs) { for (const z of [ghZ0, ghZ1]) { R.box(0.14, EAVE, 0.14, W, x, EAVE / 2, z); rectG(x - 0.12, x + 0.12, z - 0.12, z + 0.12); }
      R.box(0.08, 0.1, sl, W, x, (EAVE + RIDGE) / 2, ghC + half / 2, 0, ang); R.box(0.08, 0.1, sl, W, x, (EAVE + RIDGE) / 2, ghC - half / 2, 0, -ang); }
    for (const z of [ghZ0, ghZ1]) R.box(ghX1 - ghX0, 0.12, 0.14, W, (ghX0 + ghX1) / 2, EAVE, z); R.box(ghX1 - ghX0, 0.12, 0.12, W, (ghX0 + ghX1) / 2, RIDGE, ghC);
    const glass = ghGlassM = new THREE.MeshLambertMaterial({ color: '#cfe8ee', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
    for (const s of [1, -1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(ghX1 - ghX0, 0.03, sl), glass); m.position.set((ghX0 + ghX1) / 2, (EAVE + RIDGE) / 2, ghC + s * half / 2); m.rotation.x = s * ang; m.renderOrder = 3; gcG.add(m); } }
  // ---- 3 plant tables under the glass + the honesty tin + sign ----
  const PLANT = ['#3f9a5e', '#2e7a46', '#5fae5a', '#7cbf6a'], BLOOM = ['#ec3013', '#ffd23a', '#f3f2f2', '#c2456a', '#7c4dc4', '#e8742a'];
  for (const [ti, tz] of [17.4, 20.6, 23.6].entries()) { const tx0 = -190, tx1 = -176; R.box(tx1 - tx0, 0.08, 1.2, WOOD, (tx0 + tx1) / 2, 0.84, tz); for (const x of [tx0 + 0.2, (tx0 + tx1) / 2, tx1 - 0.2]) for (const s of [-0.5, 0.5]) R.box(0.08, 0.8, 0.08, DARK, x, 0.4, tz + s);
    rectG(tx0, tx1, tz - 0.62, tz + 0.62);
    for (let i = 0; i < 16; i++) { const x = tx0 + 0.5 + i * 0.86, z = tz + (i % 2 ? 0.28 : -0.28), k = (i + ti * 3) % 6; R.cyl(0.17, 0.12, 0.24, '#b0623f', x, 1.0, z, 8);
      R.sph(0.22, PLANT[(i + ti) % 4], x, 1.26, z, 0.85); if (k < 4) R.sph(0.08, BLOOM[(i * 7 + ti) % 6], x + 0.06, 1.42, z); } }
  { const [hx, hz] = [-176.5, 23.6]; R.box(0.36, 0.22, 0.26, '#3f9a5e', hx, 0.99, hz); R.box(0.12, 0.02, 0.03, INK, hx, 1.11, hz);
    planeG(board('PLANT TABLES', 'PICK A PLANT \u00b7 PAY FERN', '#3f9a5e', '#ffffff', YEL, 512, 200), 1.2, 0.46, -177.4, 1.7, 24.25, 0); R.box(0.05, 1.0, 0.05, INK, -177.4, 1.0, 24.2); }
  // ---- seed + compost pallets (east, under the glass) ----
  for (const [i, pz] of [16.6, 19.8, 23.0].entries()) { const px = -172.8; R.box(1.3, 0.14, 1.2, '#a07a52', px, 0.07, pz); for (let r = 0; r < 3; r++) for (let j = 0; j < 2; j++) R.box(0.6, 0.22, 1.1, i === 1 ? ['#ffd23a', '#3f9a5e'][(r + j) % 2] : ['#5a3a1a', '#6e4a26'][(r + j) % 2], px - 0.31 + j * 0.62, 0.26 + r * 0.23, pz); rectG(px - 0.66, px + 0.66, pz - 0.62, pz + 0.62); }
  planeG(board('SEED \u00b7 COMPOST', 'BY THE BAG', '#5a3a1a', '#ffffff', YEL, 512, 200), 1.4, 0.54, -172.8, 1.6, 25.0, 0);
  // ---- flower beds, sunflowers, a wheelbarrow ----
  const bed = (x0, x1, z0, z1, tall = false) => { R.box(x1 - x0, 0.3, z1 - z0, '#6e4a26', (x0 + x1) / 2, 0.15, (z0 + z1) / 2); R.box(x1 - x0 + 0.1, 0.06, z1 - z0 + 0.1, '#8a857e', (x0 + x1) / 2, 0.31, (z0 + z1) / 2);
    rectG(x0, x1, z0, z1); const n = Math.floor((x1 - x0) / 0.45); for (let i = 0; i < n; i++) for (let j = 0; j < Math.max(1, Math.floor((z1 - z0) / 0.6)); j++) { const x = x0 + 0.25 + i * 0.45, z = z0 + 0.3 + j * 0.6;
      if (tall && i % 2 === 0) { R.cyl(0.025, 0.03, 2.2, '#3f7a2a', x, 1.3, z, 5); R.box(0.3, 0.05, 0.16, '#3f9a5e', x, 1.1, z, 0.6); R.cyl(0.26, 0.26, 0.06, YEL, x, 2.4, z + 0.06, 12, PI / 2); R.cyl(0.11, 0.11, 0.07, '#5a3a1a', x, 2.4, z + 0.09, 8, PI / 2); }
      else { R.sph(0.16, PLANT[(i + j) % 4], x, 0.44, z, 0.7); R.sph(0.07, BLOOM[(i * 3 + j) % 6], x, 0.56, z); } } };
  bed(-178, -171.6, 27.4, 29.4, true); bed(-193.4, -190.4, 39.6, 40.7); bed(-179.6, -171.4, 39.6, 40.7); bed(-193.4, -191.4, 27.0, 31.0);
  { const wx = -189.6, wz = 29.0; R.box(0.9, 0.35, 1.2, '#2e7a46', wx, 0.55, wz); R.box(0.8, 0.06, 1.1, '#5a3a1a', wx, 0.74, wz); R.cyl(0.18, 0.18, 0.08, INK, wx, 0.2, wz + 0.7, 10, 0, PI / 2); for (const s of [-0.35, 0.35]) R.box(0.05, 0.05, 0.9, DARK, wx + s, 0.5, wz - 0.9); rectG(wx - 0.5, wx + 0.5, wz - 0.7, wz + 0.8); }
  // ---- Fern's potting bench by the gate ----
  { R.box(2.4, 0.9, 0.7, WOOD, -188.2, 0.45, 39.3); R.box(2.5, 0.06, 0.8, '#6e4a26', -188.2, 0.92, 39.3); for (let i = 0; i < 4; i++) { R.cyl(0.13, 0.1, 0.18, '#b0623f', -189.1 + i * 0.5, 1.04, 39.2, 8); R.sph(0.14, PLANT[i], -189.1 + i * 0.5, 1.2, 39.2, 0.8); }
    R.cyl(0.14, 0.14, 0.3, '#3f9a5e', -187.1, 1.1, 39.4, 10); R.cyl(0.03, 0.03, 0.36, '#3f9a5e', -186.9, 1.18, 39.4, 6, 0, -0.9); rectG(-189.45, -186.95, 38.95, 39.65); }
  // ---- flower arch gate + its two leaves (open by day, shut at night) ----
  const [gtx, gtz] = GCL.gate;
  { for (const s of [-1, 1]) { R.box(0.22, 2.6, 0.22, '#f3f2f2', gtx + s * 2.2, 1.3, gtz); rectG(gtx + s * 2.2 - 0.14, gtx + s * 2.2 + 0.14, gtz - 0.14, gtz + 0.14); }
    R.put(new THREE.TorusGeometry(2.2, 0.1, 6, 18, PI), gtx, 2.6, gtz, '#f3f2f2');
    for (let i = 0; i <= 20; i++) { const a = i / 20 * PI, x = gtx + Math.cos(a) * 2.2, y = 2.6 + Math.sin(a) * 2.2; R.sph(0.2, PLANT[i % 4], x, y, gtz, 0.8); R.sph(0.1, BLOOM[i % 6], x + 0.08, y + 0.08, gtz + 0.14); R.sph(0.09, BLOOM[(i + 3) % 6], x - 0.08, y - 0.06, gtz - 0.14); }
    for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { const y = 0.4 + k * 0.4; R.sph(0.16, PLANT[k % 4], gtx + s * 2.2, y, gtz + 0.12); if (k % 2) R.sph(0.08, BLOOM[k % 6], gtx + s * 2.2 + 0.1, y + 0.1, gtz + 0.2); } }
  const leaves = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(gtx + s * 2.1, 0, gtz); const m = lam(GRN), add = (w, h, d, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); g.add(o); };
    add(2.0, 0.06, 0.05, -s * 1.0, 1.0, 0); add(2.0, 0.06, 0.05, -s * 1.0, 0.2, 0); for (let i = 0; i <= 7; i++) add(0.04, 0.84, 0.04, -s * (0.05 + i * 0.27), 0.6, 0); gcG.add(g); return { g, s }; });
  const gateCol = rectG(gtx - 2.2, gtx + 2.2, gtz - 0.08, gtz + 0.08); gateCol.on = false;
  const shut = planeG(board('CLOSED', 'OPENS 7 AM \u00b7 HARDWARE STILL OPEN INSIDE', INK, '#ffffff', RED, 512, 200), 1.3, 0.5, gtx, 1.4, gtz + 0.08, 0); shut.visible = false;
  // ---- the big sign: FERN'S GARDEN CENTRE with a sunflower + a watering can ----
  { const sx = -174.4, sz = 40.95; for (const s of [-1, 1]) R.box(0.14, 3.7, 0.14, INK, sx + s * 2.5, 1.85, sz); planeG(board('FERN\u2019S GARDEN CENTRE', 'PLANTS \u00b7 SEEDS \u00b7 POTS \u00b7 MERU HARDWARE', '#3f9a5e', '#ffffff', YEL, 1024, 220), 5.2, 1.12, sx, 3.15, sz + 0.09, 0);
    const fx = sx - 1.7, fy = 4.75; R.box(0.08, 1.0, 0.05, '#3f7a2a', fx, 4.0, sz + 0.05); R.box(0.36, 0.06, 0.16, '#3f9a5e', fx + 0.18, 4.15, sz + 0.05, 0, 0, 0.5);
    for (let i = 0; i < 12; i++) { const a = i / 12 * PI * 2; R.box(0.22, 0.5, 0.05, YEL, fx + Math.cos(a) * 0.52, fy + Math.sin(a) * 0.52, sz + 0.06, 0, 0, a - PI / 2); } R.cyl(0.34, 0.34, 0.1, '#5a3a1a', fx, fy, sz + 0.1, 14, PI / 2);
    const wx = sx + 1.5, wy = 4.35; R.cyl(0.36, 0.4, 0.62, '#2e86b8', wx, wy, sz + 0.05, 12); R.cyl(0.05, 0.06, 0.9, '#2e86b8', wx - 0.62, wy + 0.18, sz + 0.05, 6, 0, 1.0); R.cyl(0.13, 0.05, 0.14, '#2e86b8', wx - 0.98, wy + 0.45, sz + 0.05, 8, 0, 1.0);
    R.box(0.08, 0.5, 0.08, '#2e86b8', wx + 0.42, wy + 0.25, sz + 0.05); R.box(0.5, 0.08, 0.08, '#2e86b8', wx + 0.2, wy + 0.5, sz + 0.05); }
  // ---- fountain (centre) + koi pond (east) ----
  const FT = [-182, 32.4]; R.cyl(1.8, 1.9, 0.5, '#c9c4bc', FT[0], 0.25, FT[1], 18); R.cyl(0.25, 0.32, 1.3, '#c9c4bc', FT[0], 0.9, FT[1], 10); R.cyl(0.7, 0.35, 0.22, '#c9c4bc', FT[0], 1.6, FT[1], 14); rectG(FT[0] - 1.85, FT[0] + 1.85, FT[1] - 1.85, FT[1] + 1.85);
  const water = new THREE.MeshLambertMaterial({ color: '#5aa8c8', transparent: true, opacity: 0.6, depthWrite: false });
  { const w = new THREE.Mesh(new THREE.CircleGeometry(1.65, 20), water); w.rotation.x = -PI / 2; w.position.set(FT[0], 0.46, FT[1]); w.renderOrder = 2; gcG.add(w); }
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.14, 0.7, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#d8f0fa', transparent: true, opacity: 0.75, depthWrite: false })); jet.position.set(FT[0], 2.05, FT[1]); gcG.add(jet);
  const ripple = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 20), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false })); ripple.rotation.x = -PI / 2; ripple.position.set(FT[0], 0.47, FT[1]); gcG.add(ripple);
  const KP = [-175.6, 34.6, 2.6, 1.8];
  { const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 24), new THREE.MeshLambertMaterial({ color: '#1f4a5e' })); pond.scale.set(KP[2], KP[3], 1); pond.rotation.x = -PI / 2; pond.position.set(KP[0], 0.07, KP[1]); gcG.add(pond);
    const top = new THREE.Mesh(new THREE.CircleGeometry(1, 24), water); top.scale.set(KP[2], KP[3], 1); top.rotation.x = -PI / 2; top.position.set(KP[0], 0.2, KP[1]); top.renderOrder = 2; gcG.add(top);
    for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2; R.sph(0.32, ['#8a857e', '#a39e96', '#6f6b66'][i % 3], KP[0] + Math.cos(a) * (KP[2] + 0.15), 0.18, KP[1] + Math.sin(a) * (KP[3] + 0.15), 0.6); }
    R.box(0.5, 0.04, 0.5, '#3f9a5e', KP[0] + 1.0, 0.22, KP[1] - 0.4); R.box(0.4, 0.04, 0.4, '#3f9a5e', KP[0] - 1.2, 0.22, KP[1] + 0.5); R.sph(0.07, '#f3f2f2', KP[0] + 1.0, 0.27, KP[1] - 0.4);
    rectG(KP[0] - KP[2] - 0.3, KP[0] + KP[2] + 0.3, KP[1] - KP[3] - 0.3, KP[1] + KP[3] + 0.3); }
  const KOI = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5), lam(['#e8742a', '#f3f2f2', '#ec3013', '#ffd23a'][i])); m.scale.set(0.55, 0.35, 1.4); m.position.y = 0.16; gcG.add(m); return { m, r: 0.45 + i * 0.12, w: (i % 2 ? -1 : 1) * (0.35 + i * 0.08), p: i * 1.7 }; });
  // ---- sprinklers (spin by day) ----
  const SPR = [[-175, 28.4], [-192.4, 29.0]].map(([x, z]) => { R.cyl(0.05, 0.05, 0.4, DARK, x, 0.5, z, 6); const g = new THREE.Group(); g.position.set(x, 0.72, z); const s = mk();
    for (const a of [0, PI]) for (let k = 1; k <= 7; k++) { const r = k * 0.28; s.sph(0.035, '#d8f0fa', Math.cos(a) * r, 0.45 * Math.sin(k / 7 * PI) * 1.4 - k * 0.02, Math.sin(a) * r); }
    s.mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false })); gcG.add(g); return g; });
  // ---- bunting (front strand, the greenhouse eave, arch → ridge) + fairy lights on the same strings ----
  const LIGHTS = [];
  const strand = (a, b, sag, n) => { const flag = new THREE.BufferGeometry(); flag.setAttribute('position', new THREE.Float32BufferAttribute([-0.17, 0, 0, 0.17, 0, 0, 0, -0.38, 0], 3)); flag.computeVertexNormals();
    const ry = Math.atan2(b[0] - a[0], b[2] - a[2]) + PI / 2, P = u => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u];
    let prev = P(0); for (let i = 1; i <= n; i++) { const p = P(i / n), L = Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]), m = [(p[0] + prev[0]) / 2, (p[1] + prev[1]) / 2, (p[2] + prev[2]) / 2];
      R.put(new THREE.CylinderGeometry(0.01, 0.01, L, 3), m[0], m[1], m[2], INK, Math.atan2(p[0] - prev[0], p[2] - prev[2]), PI / 2 - Math.atan2(p[1] - prev[1], Math.hypot(p[0] - prev[0], p[2] - prev[2])));
      if (i < n) { B.put(flag.clone(), p[0], p[1], p[2], [RED, YEL, '#3f9a5e', '#2e86b8', '#f3f2f2', '#c2456a'][i % 6], ry); LIGHTS.push([m[0], m[1] - 0.03, m[2]]); } prev = p; } flag.dispose(); };
  strand([gx0 + 0.1, 4.4, 38.2], [gtx - 2.2, 3.0, gtz], 0.35, 14); strand([ghX0, EAVE - 0.05, ghZ1 + 0.1], [ghX1, EAVE - 0.05, ghZ1 + 0.1], 0.5, 30); strand([gtx, 4.8, gtz], [gtx, RIDGE, ghC + 0.1], 0.6, 20);
  // ================= LUMBER YARD =================
  const [yx0, yx1, yz0, yz1] = YDL.f;
  ground(YDL.f, (g, w) => { g.fillStyle = '#a39a8a'; g.fillRect(0, 0, w, w); for (let i = 0; i < 900; i++) { g.fillStyle = ['#8a8274', '#b8ae9c', '#6f6b66', '#c9bfa8'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 3, 3); } }, 3, ydG);
  const sawdust = (x, z, r) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 14), lam('#d6b48a')); m.rotation.x = -PI / 2; m.position.set(x, 0.075, z); ydG.add(m); };
  sawdust(-232.6, 18.2, 1.6); sawdust(-236.2, 23.0, 1.2); sawdust(-238.2, 33.4, 1.0);
  // board fence (2 m) with a wide vehicle gate on the street + the yard sign over it
  const slats = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4));
    for (let i = 0; i <= n; i++) { const u = i / n; RY.box(0.14, 2.1, 0.14, '#6e4a26', x0 + (x1 - x0) * u, 1.05, z0 + (z1 - z0) * u); } RY.box(0.06, 1.8, L, '#b88a5c', (x0 + x1) / 2, 1.0, (z0 + z1) / 2, ry);
    rectY(x0 - 0.1, x1 + 0.1, z0 - 0.1, z1 + 0.1); };
  slats(yx0, yz0, yx1, yz0); slats(yx0, yz0, yx0, 32.6); slats(yx0, 37.8, yx0, yz1); slats(yx1, yz0, yx1, yz1 - 0.1);   // s167: gate in the WEST fence (castle path), a fence on the east (garden centre side), the store's back wall closes the south
  { for (const z of [32.6, 37.8]) RY.box(0.18, 4.2, 0.18, '#6e4a26', yx0, 2.1, z); RY.box(0.18, 0.18, 5.8, '#6e4a26', yx0, 4.1, 35.2);
    planeY(board('LUMBER YARD', 'MERU HARDWARE \u00b7 OAK \u00b7 PINE \u00b7 BIRCH \u00b7 ASK HANK', '#8b6a48', '#ffffff', YEL, 1024, 200), 5.2, 1.0, yx0 - 0.12, 3.5, 35.2, -PI / 2); }
  // covered board racks along the west fence (lean-to roof)
  { const rz0 = 18, rz1 = 32; for (let z = rz0; z <= rz1 + 0.01; z += 3.5) { RY.box(0.14, 3.1, 0.14, DARK, -237.0, 1.55, z); rectY(-237.1, -236.9, z - 0.1, z + 0.1); for (let lv = 0; lv < 3; lv++) RY.box(2.5, 0.08, 0.1, DARK, -238.4, 0.4 + lv * 0.85, z); }
    RF1.box(3.4, 0.08, rz1 - rz0 + 1.0, '#7a8a96', -238.4, 3.0, (rz0 + rz1) / 2, 0, 0, 0.12); RF1.box(0.1, 0.3, rz1 - rz0 + 1.0, RED, -236.75, 2.85, (rz0 + rz1) / 2);
    const BW = ['#c9a27a', '#b88a5c', '#d6b48a'];
    for (let bay = 0; bay < 4; bay++) { const zc = rz0 + 1.75 + bay * 3.5; for (let lv = 0; lv < 3; lv++) for (let i = 0; i < 7; i++) RY.box(0.26, 0.1, 3.3, BW[(i + lv + bay) % 3], -239.5 + i * 0.32, 0.5 + lv * 0.85 + (i % 2) * 0.1, zc); }
    rectY(-239.9, -237.1, rz0, rz1); }
  // log pile (north-west) + the saw shed (north-east)
  { for (const [ox, oz] of [[-238.1, 14.3], [-238.1, 15.9]]) for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) { const y = 0.3 + r * 0.5, zz = oz + (i - (2 - r) / 2) * 0.55 * 0 , xx = ox; RY.cyl(0.26, 0.26, 3.0, '#7a5236', xx, y, oz - 0.55 + i * 0.55 + r * 0.27, 10, 0, PI / 2); RY.cyl(0.2, 0.2, 3.02, '#d6b48a', xx, y, oz - 0.55 + i * 0.55 + r * 0.27, 10, 0, PI / 2); }
    rectY(-239.7, -236.5, 13.4, 16.9); }
  { const x0 = -234.6, x1 = -230.6, z0 = 13.4, z1 = 17.0; RY.box(x1 - x0, 2.8, 0.12, '#b88a5c', (x0 + x1) / 2, 1.4, z0 + 0.06); for (const x of [x0 + 0.06, x1 - 0.06]) RY.box(0.12, 2.8, z1 - z0, '#b88a5c', x, 1.4, (z0 + z1) / 2);
    RF2.box(x1 - x0 + 0.5, 0.1, z1 - z0 + 0.6, '#7a8a96', (x0 + x1) / 2, 2.95, (z0 + z1) / 2 + 0.2, 0, -0.1); rectY(x0, x1, z0, z0 + 0.15); rectY(x0, x0 + 0.15, z0, z1); rectY(x1 - 0.15, x1, z0, z1);
    RY.box(2.0, 0.85, 1.0, '#7a7570', -232.6, 0.43, 14.8); RY.box(2.1, 0.06, 1.1, '#5a5654', -232.6, 0.88, 14.8); rectY(-233.65, -231.55, 14.25, 15.35);
    for (let i = 0; i < 3; i++) RY.box(1.8, 0.08, 0.22, '#d6b48a', -232.6, 0.95 + i * 0.09, 14.6 + i * 0.12);
    planeY(board('SAW SHED', 'EARS ON \u00b7 GOGGLES ON', YEL, INK, RED, 512, 200), 1.6, 0.62, -232.6, 2.3, z0 + 0.14, 0); }
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.02, 18), lam('#c9ced3')); blade.rotation.x = PI / 2; blade.position.set(-232.6, 1.12, 14.8); ydG.add(blade);
  // pallet stacks
  for (const [px, pz, n] of [[-231.0, 30.6, 6]]) { for (let k = 0; k < n; k++) RY.box(1.2, 0.14, 1.2, k % 2 ? '#a07a52' : '#b88a5c', px, 0.08 + k * 0.15, pz); rectY(px - 0.62, px + 0.62, pz - 0.62, pz + 0.62); }
  // ---- Hank's forklift (parked, engine idling) ----
  const fork = new THREE.Group(); fork.position.set(-236.0 + OX, 0, 36.0 + OZ); fork.rotation.y = PI; G.add(fork);   // s167: parked by the west gate, nose to the yard (world frame: meru2-hardware-fork.js drives it)
  const fb = new THREE.Group(); fork.add(fb); { const F = mk(); F.box(1.15, 0.9, 1.9, YEL, 0, 0.75, -0.1); F.box(1.18, 0.55, 0.5, DARK, 0, 0.6, -1.15); F.box(0.5, 0.12, 0.5, INK, 0, 1.28, -0.25);
    F.box(0.42, 0.6, 0.1, INK, 0, 1.55, -0.5); for (const sx of [-0.52, 0.52]) for (const sz of [0.55, -0.85]) F.box(0.06, 1.5, 0.06, INK, sx, 1.95, sz); F.box(1.15, 0.06, 1.5, INK, 0, 2.7, -0.15);
    for (const sx of [-0.62, 0.62]) for (const sz of [0.55, -0.8]) F.cyl(0.3, 0.3, 0.24, INK, sx, 0.3, sz, 12, 0, PI / 2);
    for (const sx of [-0.4, 0.4]) F.box(0.1, 2.6, 0.12, DARK, sx, 1.3, 1.0); F.box(0.92, 0.1, 0.1, DARK, 0, 2.5, 1.0); F.box(0.06, 1.0, 0.06, DARK, 0.5, 1.9, -1.1);
    F.mesh(fb); }
  const forks = new THREE.Group(); forks.position.set(0, 0.12, 1.1); fork.add(forks); { const F = mk(); for (const sx of [-0.3, 0.3]) F.box(0.12, 0.06, 1.2, STEEL, sx, 0, 0.6); F.box(0.9, 0.5, 0.06, STEEL, 0, 0.25, 0.02); F.mesh(forks); }
  const load = new THREE.Group(); forks.add(load); { const F = mk(); F.box(1.1, 0.14, 1.1, '#a07a52', 0, 0.1, 0.62); for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) F.box(0.24, 0.12, 1.05, ['#c9a27a', '#d6b48a'][(i + r) % 2], -0.39 + i * 0.26, 0.24 + r * 0.13, 0.62); F.mesh(load); }
  const forkCol = rectY(-236.7, -235.3, 34.2, 37.8);
  const puffs = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), new THREE.MeshBasicMaterial({ color: '#c9c4bc', transparent: true, opacity: 0.5, depthWrite: false })); G.add(m); return { m, t: i / 3 }; });
  const pipe = new THREE.Vector3(0.5, 2.4, -1.1);
  // ---- the MERU HARDWARE truck (here while the crew is home) ----
  const truck = new THREE.Group(); truck.position.set(-233.9 + OX, 0, 34.4 + OZ); G.add(truck);   // s167: cab to the main road fence, open rear north
  { const T = mk(); for (const sx of [-1.16, 1.16]) { T.box(0.08, 2.5, 4.8, YEL, sx, 1.8, -1.0); T.box(0.02, 2.4, 4.7, '#6f6b66', sx * 0.955, 1.8, -1.0); T.box(0.06, 2.4, 1.15, YEL, sx * 1.09, 1.8, -2.85); }   // s165: open rear (the forklift loads it)
    T.box(2.4, 0.08, 4.8, YEL, 0, 3.05, -1.0); T.box(2.4, 2.5, 0.08, YEL, 0, 1.8, 1.36); T.box(2.3, 0.1, 4.7, '#5a5654', 0, 0.5, -1.0); T.box(2.4, 0.3, 4.8, DARK, 0, 0.3, -1.0); T.box(2.42, 0.08, 0.1, '#e8742a', 0, 0.52, -3.4); T.box(2.3, 1.9, 1.9, RED, 0, 1.35, 2.4); T.box(2.32, 0.7, 0.06, '#9ec4d6', 0, 1.85, 3.36); T.box(2.32, 0.3, 0.3, INK, 0, 0.5, 3.4);
    for (const sx of [-1.25, 1.25]) { T.box(0.04, 0.6, 1.0, '#9ec4d6', sx * 0.93, 1.85, 2.5); for (const sz of [2.4, -0.2, -2.4]) T.cyl(0.45, 0.45, 0.3, INK, sx, 0.45, sz, 14, 0, PI / 2); }
    T.mesh(truck); const tex = board('MERU HARDWARE', 'ON DOZER\u2019S TAB \u00b7 WE DELIVER', RED, '#ffffff', YEL, 1024, 220);
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.9), new THREE.MeshBasicMaterial({ map: tex })); m.position.set(s * 1.215, 2.1, -1.0); m.rotation.y = s * PI / 2; truck.add(m); } }
  const truckCol = rectY(-235.2, -232.6, 31.4, 37.9), truckMats = []; truck.traverse(o => { if (o.isMesh) truckMats.push(o.material); });
  // s165 night look: 3 yard lamps (posts in R, heads glow) + one warm light over the rack and pallets
  const YL = [[-236.4, 18.0], [-230.55, 29.4], [-236.9, 32.4]]; for (const [x, z] of YL) { RY.box(0.12, 4.2, 0.12, DARK, x, 2.1, z); RY.box(0.7, 0.08, 0.1, DARK, x + (x > -234 ? -0.3 : 0.3), 4.2, z); rectY(x - 0.1, x + 0.1, z - 0.1, z + 0.1); }
  const yHeadM = new THREE.MeshBasicMaterial({ color: '#5a5654' }); for (const [x, z] of YL) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.24), yHeadM); m.position.set(x + (x > -234 ? -0.55 : 0.55), 4.12, z); ydG.add(m); }
  const yGlow = new THREE.PointLight('#ffe2a8', 0, 18, 1.4); yGlow.position.set(-233.6, 4.0, 24.5); ydG.add(yGlow);

  // s166 NIGHT LOOK (Ben: "hardware lots + night look"). No new real lights (phone budget): additive light pools on the ground + soft lamp cones (2 instanced draws),
  //   lanterns lining the garden paths, pendant bulbs in the greenhouse (the glass glows warm), a lit fountain + koi pond, twinkling fairy lights with halos,
  //   fireflies in the garden + moths round the yard lamps, sconces over both side doors, goosenecks over the yard sign, the forklift's amber beacon. Lights ease in at 18:30.
  const ADD = () => ({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const radT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, '#ffffff'); r.addColorStop(0.4, '#666666'); r.addColorStop(1, '#000000'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const conT = CT(4, 64, (g, w, h) => { const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, '#ffffff'); l.addColorStop(1, '#000000'); g.fillStyle = l; g.fillRect(0, 0, w, h); });
  const POOL = [], CONE = [], WARM = '#ffd890';
  const PW = (f, x, y, z, ...r) => { const [wx, wz] = f(x, z); return [wx, y, wz, ...r]; };   // pools + cones live in the world frame
  for (const [x, z] of YL) { const hx = x + (x > -234 ? -0.55 : 0.55); POOL.push(PW(yw, hx, 0.1, z, 3.0, WARM, 0.75)); CONE.push(PW(yw, hx, 4.05, z, 4.0, 1.0)); }
  { const PX = [-187, -182, -177]; for (const x of PX) { R.box(0.02, 0.8, 0.02, INK, x, 4.15, ghC); R.cyl(0.18, 0.05, 0.14, INK, x, 3.78, ghC, 10); LH.sph(0.09, '#ffffff', x, 3.68, ghC); POOL.push(PW(gw, x, 0.1, ghC, 2.6, WARM, 0.6)); CONE.push(PW(gw, x, 3.62, ghC, 2.75, 0.75)); } }
  RY.box(0.02, 0.35, 0.02, INK, -232.6, 2.75, 15.6); LHY.sph(0.08, '#ffffff', -232.6, 2.55, 15.6); POOL.push(PW(yw, -232.6, 0.1, 15.6, 2.0, WARM, 0.7));   // saw shed bulb
  RY.box(0.05, 0.05, 0.45, DARK, YDL.door[0], 3.75, yz1 - 0.22); LHY.box(0.34, 0.1, 0.22, '#ffffff', YDL.door[0], 3.66, yz1 - 0.42); POOL.push(PW(yw, YDL.door[0], 0.1, yz1 - 1.4, 2.2, '#ffcf80', 0.7));   // side gate sconce
  R.box(0.45, 0.05, 0.05, DARK, -193.78, 3.75, GCL.door[1]); LH.box(0.22, 0.1, 0.34, '#ffffff', -193.58, 3.66, GCL.door[1]); POOL.push(PW(gw, -192.6, 0.1, GCL.door[1], 2.2, '#ffcf80', 0.7));   // garden door sconce
  for (const z of [33.6, 36.8]) { RY.box(0.6, 0.05, 0.05, DARK, yx0 - 0.3, 4.25, z); LHY.box(0.18, 0.08, 0.3, '#ffffff', yx0 - 0.62, 4.2, z); }   // goosenecks over the LUMBER YARD sign (west gate)
  for (const [x, z] of [[-184.4, 39.4], [-179.6, 39.4], [-184.6, 29.8], [-179.4, 29.8], [-178.6, 26.4], [-191.2, 33.4], [-191.2, 36.8]]) {   // garden path lanterns
    R.box(0.07, 1.15, 0.07, DARK, x, 0.575, z); R.box(0.24, 0.05, 0.24, INK, x, 1.42, z); LH.box(0.17, 0.22, 0.17, '#ffffff', x, 1.28, z); rectG(x - 0.1, x + 0.1, z - 0.1, z + 0.1); POOL.push(PW(gw, x, 0.1, z, 1.5, '#ffc870', 0.7)); }
  POOL.push(PW(gw, FT[0], 0.475, FT[1], 2.0, '#4fc8ff', 0.6), PW(gw, KP[0], 0.21, KP[1], 2.2, '#3fb0ff', 0.45));   // fountain + koi pond lit from below
  LH.mesh(gcG, yHeadM); LHY.mesh(ydG, yHeadM);
  const poolM = new THREE.MeshBasicMaterial({ map: radT, ...ADD() }), coneM = new THREE.MeshBasicMaterial({ map: conT, side: THREE.DoubleSide, ...ADD() });
  const inst = (geo, mat, list, place) => { const m = new THREE.InstancedMesh(geo, mat, list.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); list.forEach((e, i) => { place(m4, q, e); m.setMatrixAt(i, m4); m.setColorAt(i, cc.set(e[4] || WARM).multiplyScalar(e[5] || 0.35)); }); m.renderOrder = 5; m.visible = false; m.frustumCulled = false; G.add(m); return m; };
  const POOLS = inst(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), poolM, POOL, (m4, q, e) => m4.compose(V(e[0], e[1], e[2]), q, V(e[3] * 2, 1, e[3] * 2)));
  const CONES = inst(new THREE.CylinderGeometry(0.15, 1.9, 4.0, 14, 1, true), coneM, CONE, (m4, q, e) => m4.compose(V(e[0], e[1] - e[3] / 2, e[2]), q, V(e[4], e[3] / 4.0, e[4])));
  const bcnM = new THREE.MeshBasicMaterial({ color: '#8a5a10' }); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 10), bcnM); b.position.set(0.42, 2.82, -0.75); fb.add(b); }
  const BUG = [];
  for (let i = 0; i < (touch ? 8 : 14); i++) BUG.push({ g: true, x: -191 + Math.random() * 18, y: 0.7 + Math.random() * 0.8, z: 27.5 + Math.random() * 12, w: 0.3 + Math.random() * 0.4, p: Math.random() * 6, c: new THREE.Color('#c8ff6a') });
  for (const [x, z] of YL) for (let k = 0; k < 2; k++) BUG.push({ m: true, x: x + (x > -234 ? -0.55 : 0.55), y: 3.85, z, w: 4 + k * 1.7, p: k * 2.4, c: new THREE.Color('#fff2c8').multiplyScalar(0.7) });
  const BUGS = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: radT, size: 0.22, vertexColors: true, ...ADD() }));
  BUGS.geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(BUG.length * 3), 3)); BUGS.geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(BUG.length * 3), 3));
  BUGS.frustumCulled = false; BUGS.visible = false; G.add(BUGS); const bpos = BUGS.geometry.attributes.position, bcol = BUGS.geometry.attributes.color;
  const HD0 = new THREE.Color('#5a5654'), HD1 = new THREE.Color('#fff2c8'), GL0 = new THREE.Color('#cfe8ee'), GL1 = new THREE.Color('#ffe2a8'), WA0 = new THREE.Color('#5aa8c8'), WA1 = new THREE.Color('#86d6f2'), BC0 = new THREE.Color('#8a5a10'), BC1 = new THREE.Color('#ffb020');
  // ================= dynamic bits (day / night) =================
  const S = R.mesh(gcG); RY.mesh(ydG); B.mesh(gcG, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  const ROOFS = [[RF1, [-240.2 + OX, -236.6 + OX, 17.4 + OZ, 32.6 + OZ], 3.0], [RF2, [-235.0 + OX, -230.2 + OX, 13.0 + OZ, 17.8 + OZ], 2.95]].map(([F, f, y]) => { const mat = new THREE.MeshLambertMaterial({ vertexColors: true }); F.mesh(ydG, mat); return { mats: [mat], f, y, op: 1 }; });
  const FL = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshBasicMaterial({ color: '#ffe7a0' }), LIGHTS.length); { const m4 = new THREE.Matrix4(); LIGHTS.forEach((p, i) => { m4.makeTranslation(p[0], p[1], p[2]); FL.setMatrixAt(i, m4); }); } FL.visible = false; gcG.add(FL);
  FL.material.color.set('#ffffff'); const LC = LIGHTS.map((_, i) => new THREE.Color(i % 4 === 3 ? ['#ff6a50', '#ffd23a', '#7dff9a', '#6ac8ff'][(i >> 2) % 4] : '#ffe7a0')); LC.forEach((c, i) => FL.setColorAt(i, c));
  const FLH = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ map: radT, size: touch ? 0.5 : 0.6, vertexColors: true, ...ADD() })); FLH.geometry.setAttribute('position', new THREE.Float32BufferAttribute(LIGHTS.flat(), 3)); FLH.geometry.setAttribute('color', new THREE.Float32BufferAttribute(LC.flatMap(c => [c.r, c.g, c.b]), 3)); FLH.visible = false; gcG.add(FLH); const hcol = FLH.geometry.attributes.color;
  const glow = new THREE.PointLight('#ffd890', 0, 16, 1.6); glow.position.set(gcx, 3.0, 33); gcG.add(glow);
  const BF = Array.from({ length: touch ? 3 : 5 }, (_, i) => { const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: [YEL, '#f3f2f2', '#e8742a', '#7c4dc4', '#2e86b8'][i], side: THREE.DoubleSide }), w = [];
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.11), m); p.geometry.translate(s * 0.07, 0, 0); w.push(p); g.add(p); } gcG.add(g);
    return { g, w, c: [[-175, 28.4], [-188, 40], [-176, 40], [-192.4, 29], [-182, 32.4]][i], p: i * 1.3 }; });
  const BEES = Array.from({ length: touch ? 2 : 4 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), lam(i % 2 ? YEL : '#e0a800')); m.scale.set(1, 0.8, 1.4); gcG.add(m); return { m, p: i * 1.6, x: -177.6 + i * 1.4, z: 28.2 }; });
  let open = 1, lastNight = null, lit = 0, twT = 0;
  function tick(dt, P, d) { const t = performance.now() / 1000, h = hour(), night = h < 7 || h >= 20, lights = h < 7.2 || h >= 18.5, day = !night;
    if (night !== lastNight) { lastNight = night; gateCol.on = night; shut.visible = night; }
    const show = crewHome(); truck.visible = show; truckCol.on = show; const L1 = lights ? 1 : 0; lit += (L1 - lit) * Math.min(1, dt * 1.5); if (Math.abs(lit - L1) < 0.005) lit = L1; const on = lit > 0.02;
    FL.visible = FLH.visible = POOLS.visible = CONES.visible = BUGS.visible = on; glow.intensity = 1.1 * lit; yGlow.intensity = 1.3 * lit; yHeadM.color.lerpColors(HD0, HD1, lit);
    poolM.opacity = lit; coneM.opacity = 0.22 * lit; FLH.material.opacity = 0.8 * lit; BUGS.material.opacity = lit; ghGlassM.color.lerpColors(GL0, GL1, lit); ghGlassM.opacity = 0.28 + 0.12 * lit; water.color.lerpColors(WA0, WA1, lit);
    bcnM.color.lerpColors(BC0, BC1, on ? (Math.sin(t * 9) > 0.3 ? 1 : 0.2) * lit : 0);
    open += ((night ? 0 : 1) - open) * Math.min(1, dt * 2.5); for (const L of leaves) L.g.rotation.y = L.s * open * 1.45;
    if (d > 70) return;
    if (on) { if ((twT -= dt) <= 0) { twT = 0.09; for (let i = 0; i < LC.length; i++) { cc.copy(LC[i]).multiplyScalar(0.55 + 0.45 * Math.sin(t * (1.3 + (i % 5) * 0.37) + i * 2.1)); FL.setColorAt(i, cc); hcol.setXYZ(i, cc.r, cc.g, cc.b); } FL.instanceColor.needsUpdate = true; hcol.needsUpdate = true; }
      for (let i = 0; i < BUG.length; i++) { const b = BUG[i], a = t * b.w + b.p; if (b.m) bpos.setXYZ(i, b.x + OX + Math.cos(a) * 0.35, b.y + Math.sin(a * 2.3) * 0.18, b.z + OZ + Math.sin(a) * 0.35); else { const [wx, wz] = gw(b.x + Math.sin(a) * 1.2, b.z + Math.cos(a * 0.8) * 1.0); bpos.setXYZ(i, wx, b.y + Math.sin(a * 0.7) * 0.4, wz); }
        const k = b.m ? 1 : Math.max(0, Math.sin(t * 2.2 + b.p * 3)); bcol.setXYZ(i, b.c.r * k, b.c.g * k, b.c.b * k); } bpos.needsUpdate = true; bcol.needsUpdate = true; }
    jet.scale.set(1, 1 + 0.12 * Math.sin(t * 7), 1); const rp = (t * 0.6) % 1; ripple.scale.setScalar(0.6 + rp * 2.4); ripple.material.opacity = 0.5 * (1 - rp);
    for (const k of KOI) { const a = t * k.w + k.p; k.m.position.x = KP[0] + Math.cos(a) * KP[2] * k.r * 1.4; k.m.position.z = KP[1] + Math.sin(a) * KP[3] * k.r * 1.4; k.m.rotation.y = Math.atan2(-Math.sin(a) * k.w, Math.cos(a) * k.w) + Math.sin(t * 6 + k.p) * 0.15; }
    for (const [i, g] of SPR.entries()) { g.visible = day; g.rotation.y = t * (1.2 + i * 0.3); }
    for (const b of BF) { b.g.visible = day; if (!day) continue; const a = t * 0.5 + b.p; b.g.position.set(b.c[0] + Math.sin(a) * 1.6, 0.9 + Math.sin(a * 2.3) * 0.35, b.c[1] + Math.sin(a * 1.3) * 1.1); b.g.rotation.y = a; const f = Math.sin(t * 16 + b.p) * 1.1; b.w[0].rotation.y = f; b.w[1].rotation.y = -f; }
    for (const b of BEES) { b.m.visible = day; if (!day) continue; const a = t * 2.2 + b.p; b.m.position.set(b.x + Math.cos(a) * 0.4, 2.35 + Math.sin(a * 3) * 0.12, b.z + 0.25 + Math.sin(a) * 0.3); b.m.rotation.y = a + PI / 2; }
    blade.rotation.y += dt * 0.2;
    fb.position.y = Math.sin(t * 38) * 0.008; for (const p of puffs) { p.t = (p.t + dt * 0.55) % 1; const w = fork.localToWorld(pipe.clone()); p.m.position.set(w.x - 0.1 * p.t, w.y + p.t * 1.1, w.z + 0.2 * p.t); p.m.scale.setScalar(0.6 + p.t * 2.2); p.m.material.opacity = 0.45 * (1 - p.t); }
  }
  // s166 phone pass: a yard roof (lean-to over the racks, saw shed) fades out while it sits between the camera and the fox
  //   + the camera never goes through the store wall from the yard or the garden centre (pulled in along its line to the fox), the parked truck fades too
  if (!ROOFS.truck) { ROOFS.push({ mats: truckMats, f: [-235.2 + OX, -232.6 + OX, 31.4 + OZ, 37.9 + OZ], y: 3.05, op: 1, on: () => truck.visible }); ROOFS.truck = true; }
  let pullSide = 1;
  function camFix(cam, dt, P) { if (!P) return; const hy = (P.y || 0) + 1.2, head = V(P.x, hy, P.z), cp = cam.position;
    const pull = (ax, lim) => { const bx = ax === 'x' ? 'z' : 'x', m = lim - P[ax], o1 = cp[ax] - P[ax], o2 = cp[bx] - P[bx], r = Math.hypot(o1, o2); cp[ax] = lim;
      if (r > Math.abs(m)) { if (Math.abs(o2) > 0.5) pullSide = o2 < 0 ? -1 : 1; cp[bx] = P[bx] + pullSide * Math.sqrt(r * r - m * m); } cam.lookAt(head); };   // backed against the store wall: the camera swings round along it (same distance + height)
    if (inYard(P) && cp.z > YARD.f[3] - 0.35) pull('z', YARD.f[3] - 0.35);   // yard: the store is south
    if (inGC(P) && cp.z > GC.f[3] - 0.35 && cp.x < OX - 194 + 0.6) pull('z', GC.f[3] - 0.35);   // garden centre: the store is south
    const cx = cp.x, cy = cp.y, cz = cp.z;
    for (const r of ROOFS) { const [x0, x1, z0, z1] = r.f; let hit = false; if (r.on && !r.on()) { if (r.op === 1) continue; }
      else if (cy > r.y && hy < r.y) { const u = (cy - r.y) / (cy - hy), x = cx + (P.x - cx) * u, z = cz + (P.z - cz) * u; hit = x > x0 - 0.4 && x < x1 + 0.4 && z > z0 - 0.4 && z < z1 + 0.4; }
      if (!hit && cy > r.y - 0.5 && cx > x0 - 0.6 && cx < x1 + 0.6 && cz > z0 - 0.6 && cz < z1 + 0.6) hit = true;
      const tg = hit ? 0.12 : 1; r.op += (tg - r.op) * Math.min(1, (dt || 0.016) * 8); if (Math.abs(r.op - tg) < 0.01) r.op = tg; const tr = r.op < 0.99;
      for (const m of r.mats) { m.opacity = r.op; if (m.transparent !== tr) { m.transparent = tr; m.depthWrite = !tr; m.needsUpdate = true; } } } }
  const inGC = P => P.x > GC.f[0] && P.x < GC.f[1] && P.z > GC.f[2] && P.z < GC.f[3], inYard = P => P.x > YARD.f[0] && P.x < YARD.f[1] && P.z > YARD.f[2] && P.z < YARD.f[3];
  const tableObj = new THREE.Object3D(); { const [tx, tz] = gw(-176.5, 23.6); tableObj.position.set(tx, 0, tz); } G.add(tableObj);
  return { tick, camFix, lit: () => lit, roofs: () => ROOFS.map(r => +r.op.toFixed(2)), inGC, inYard, tableObj, fork: { g: fork, fb, forks, load, col: forkCol, truck, truckCol, truckOn: () => truck.visible }, gateOpen: () => !lastNight, dispose() {} };
}
