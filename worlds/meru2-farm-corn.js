// MERU 2.0 — s169 COBB FARM [meruCornFarm] (Ben: "3 farms along the castle path"; farm 2 of 3 = CARROTS + CORN, the MAZE farm).
// East of the Castle Path, across from the Russet Orchard (both arches sit at the z -227 wall gaps). Layout TOWN2 'farmCobb' (selfBuilt).
// CREAM BARN you walk into (front doors W on the farmyard, back door E to the barracks road): hay loft + ladder, a little green tractor,
// a corn sheller, seed sacks, carrot crates, workbench, NOW HIRING + BEST SCORES (shopKit). THE CORN MAZE (8 x 14 cells of 3 m, tall corn walls
// that stop shots, ears you can pick, a high camera while you are inside). CARROT PATCH (pull carrots), COW PEN (Daisy + her calf Buttons),
// WATER TOWER (landmark, red light at night), pigs that bolt to the barn in a fight, breakable fence + crates, hay + scarecrows (cover).
// MAIZY COBB (farmer): 7-17 at her stand, else in the barn; runs in when foes come near. Menu: YES, PUT ME TO WORK! (FIND THE CALF) ·
// SELL CROPS (carrot 2 G, corn 3 G) · CORN CHOWDER (10 G, +50 HP) · WHAT'S OUT THERE? · GOODBYE.
// JOB FIND THE CALF: Buttons is lost in the maze. Follow the MOOs, find him (E / TALK), lead him back to the pen gate. 120 s; faster = more stars.
// Test: ?start=cornfarm · window.__cornfarm.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
// s171 (Ben: sidewalks clear): the lot + maze stopped 2.3 m onto the Barracks Road sidewalk (edge x 51.7); now lot to 51.4, maze 7 cells (30..51)
export const FARM_C = { key: 'farmCobb', lot: [12, 51.4, -272, -204], barn: [30, 50, -222, -206], door: [30, -214], back: [50, -214], gap: [9.5, -227], maze: [30, 51, -268, -226] };
export function buildCornFarm({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour = () => 12, isMuted = () => false, threat = () => 0 }) {
  const PI = Math.PI, INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e6dbbd', CREAMD = '#c9bc98', GRN = '#3f6b3a', GRND = '#2c4c29', WOOD = '#8b6a48', WOODD = '#5e4329', HAY = '#d9b44a', HAYD = '#b08a2c', DARK = '#3d3b3a', ROOF = '#465a40', ORG = '#e8742a';
  const [LX0, LX1, LZ0, LZ1] = FARM_C.lot, [BX0, BX1, BZ0, BZ1] = FARM_C.barn, BCX = (BX0 + BX1) / 2, BCZ = (BZ0 + BZ1) / 2, DZ = FARM_C.door[1], [MX0, MX1, MZ0, MZ1] = FARM_C.maze;
  const G = new THREE.Group(); G.name = 'meruCornFarm'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), dist = (P, x, z) => Math.hypot(P.x - x, P.z - z), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seed = 7171; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); geo.dispose(); };
    return { put, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z, sy = 1) => { const g = new THREE.SphereGeometry(r, 8, 6); if (sy !== 1) g.scale(1, sy, 1); put(g, x, y, z, hex); },
      geo() { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; },
      mesh(parent, mat) { const m = new THREE.Mesh(this.geo(), mat || new THREE.MeshLambertMaterial({ vertexColors: true })); (parent || G).add(m); return m; } }; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const fit = (g, txt, max, size, wt = 900) => { let s = size; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > max && s > 10) { s -= 2; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; } };
  const board = (title, sub, bg, fg, bar, Wd = 1024, H = 200) => CT(Wd, H, g => { g.fillStyle = bg; g.fillRect(0, 0, Wd, H); g.fillStyle = bar; g.fillRect(0, 0, 18, H); g.fillStyle = fg; g.textBaseline = 'alphabetic';
    fit(g, title, Wd - 80, Math.round(H * 0.5)); g.fillText(title, 44, sub ? H * 0.6 : H * 0.7); if (sub) { fit(g, sub, Wd - 80, Math.round(H * 0.19), 800); g.fillText(sub, 46, H * 0.88); } });
  const plane = (tex, w, h, x, y, z, ry = 0, both = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const rect = (x0, x1, z0, z1) => { const c = { f: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] }; cols.push(c); return c; };
  const ring = (x, z, r) => { const c = { c: [x, z, r] }; cols.push(c); return c; };
  const lam = c => new THREE.MeshLambertMaterial({ color: c });
  const R = mk(), RF = mk(), LF = mk();   // R = static props · RF = barn roof (hidden inside) · LF = hay loft (hidden when you stand under it)
  // ================= ground =================
  const decal = (w, d, x, z, draw, rep = 3) => { const t = CT(128, 128, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -PI / 2; m.position.set(x, 0.07, z); G.add(m); return m; };
  const dirt = (g, w) => { g.fillStyle = '#9a7a58'; g.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { g.fillStyle = ['#8a6a48', '#a8886a', '#7a5e40', '#b39270'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 3, 3); } };
  const soil = (g, w) => { g.fillStyle = '#6a4a30'; g.fillRect(0, 0, w, w); for (let i = 0; i < 300; i++) { g.fillStyle = ['#5a3c24', '#7a5638', '#4e331f', '#82603f'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 4, 3); } };
  decal(BX1 - BX0 + 0.6, BZ1 - BZ0 + 0.6, BCX, BCZ, (g, w) => { g.fillStyle = '#8a6a48'; g.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7a5a3a' : '#94744f'; g.fillRect(0, i * 16, w, 15); } }, 2.5);
  decal(17.5, 40, 21, -226, dirt, 3);   // farmyard
  { const [ax, az] = FARM_C.gap, bx = BX0, bz = DZ, L = Math.hypot(ax - bx, az - bz), m = decal(2.6, L, (ax + bx) / 2, (az + bz) / 2, dirt, 3); m.rotation.z = Math.atan2(ax - bx, az - bz); m.position.y = 0.075; }
  decal(MX1 - MX0, MZ1 - MZ0, (MX0 + MX1) / 2, (MZ0 + MZ1) / 2, (g, w) => { g.fillStyle = '#8f7650'; g.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { g.fillStyle = ['#7d6644', '#9e8560', '#6f8a3e', '#86704c'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 3, 3); } }, 3).position.y = 0.072;   // maze floor
  decal(LX1 - BX1, 3.2, (BX1 + LX1) / 2, DZ, dirt, 3).position.y = 0.075;   // back lane to the road gate
  decal(14.2, 16.4, 20.25, -260, soil, 2).position.y = 0.074;   // carrot patch
  // ================= THE BARN (cream, gambrel roof, ridge E-W, big doors W, back door E) =================
  const EAVE = 5.0, KNEE = 7.8, RIDGE = 9.6, HW = (BZ1 - BZ0) / 2;
  { const bm = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), W = mk();
    const gable = (x, holeW, holeH) => { const s = new THREE.Shape(); s.moveTo(-HW, 0); s.lineTo(HW, 0); s.lineTo(HW, EAVE); s.lineTo(HW - 3.5, KNEE); s.lineTo(0, RIDGE); s.lineTo(-HW + 3.5, KNEE); s.lineTo(-HW, EAVE); s.lineTo(-HW, 0);
      const h = new THREE.Path(); h.moveTo(-holeW / 2, 0.01); h.lineTo(holeW / 2, 0.01); h.lineTo(holeW / 2, holeH); h.lineTo(-holeW / 2, holeH); h.lineTo(-holeW / 2, 0.01); s.holes.push(h);
      W.put(new THREE.ShapeGeometry(s), x, 0, BCZ, CREAM, PI / 2); };
    gable(BX0, 5, 4.6); gable(BX1, 4, 4.0);
    for (const z of [BZ0, BZ1]) { W.box(BX1 - BX0, EAVE, 0.3, CREAM, BCX, EAVE / 2, z); W.box(BX1 - BX0 + 0.1, 0.22, 0.36, GRN, BCX, EAVE - 0.11, z); W.box(BX1 - BX0 + 0.1, 0.5, 0.36, CREAMD, BCX, 0.25, z); }
    for (const x of [BX0, BX1]) { W.box(0.36, EAVE, 0.24, GRN, x, EAVE / 2, BZ0 + 0.12); W.box(0.36, EAVE, 0.24, GRN, x, EAVE / 2, BZ1 - 0.12); }
    for (let x = BX0 + 1.25; x < BX1; x += 2.5) for (const z of [BZ0, BZ1]) W.box(0.06, EAVE - 0.6, 0.34, CREAMD, x, EAVE / 2, z);   // board-and-batten
    for (const sx of [BX0, BX1]) { const o = sx === BX0 ? -0.17 : 0.17; for (const s of [-1, 1]) { const a = Math.atan2(KNEE - EAVE, 3.5), b = Math.atan2(RIDGE - KNEE, HW - 3.5);
        W.box(0.08, 0.22, Math.hypot(3.5, KNEE - EAVE), GRN, sx + o, (EAVE + KNEE) / 2, BCZ + s * (HW - 1.75), 0, s * a); W.box(0.08, 0.22, Math.hypot(HW - 3.5, RIDGE - KNEE), GRN, sx + o, (KNEE + RIDGE) / 2, BCZ + s * (HW - 3.5) / 2, 0, s * b); } }
    W.box(0.1, 1.7, 1.7, GRN, BX0 - 0.17, 6.7, DZ); W.box(0.12, 1.4, 1.4, '#2a3a28', BX0 - 0.18, 6.7, DZ); for (const s of [-1, 1]) W.box(0.12, 0.12, 2.0, PAPER, BX0 - 0.2, 6.7, DZ, 0, s * PI / 4);
    W.box(0.14, 0.14, 1.4, WOODD, BX0 - 0.7, 8.1, DZ, PI / 2); W.box(0.04, 0.6, 0.04, DARK, BX0 - 1.3, 7.7, DZ);
    const PANES = []; for (const z of [BZ0, BZ1]) for (const x of [BX0 + 4, BCX, BX1 - 4]) { const o = z === BZ0 ? -0.17 : 0.17; W.box(1.5, 1.5, 0.08, GRN, x, 2.9, z + o); PANES.push([x, 2.9, z + o * 1.2]); }
    W.mesh(G, bm); G.userData.panes = PANES;
    const door = (x, z, w, h) => { const D = mk(); D.box(0.12, h, w, GRN, 0, h / 2, 0); D.box(0.16, 0.16, w, PAPER, 0, h - 0.08, 0); D.box(0.16, 0.16, w, PAPER, 0, 0.08, 0); for (const s of [-1, 1]) D.box(0.16, 0.14, Math.hypot(w, h) - 0.2, PAPER, 0, h / 2, 0, 0, s * Math.atan2(h, w));
      const g = new THREE.Group(); g.position.set(x, 0, z); D.mesh(g); G.add(g); return g; };
    for (const s of [-1, 1]) door(BX0 - 0.32, DZ + s * 3.85, 2.6, 4.6); for (const s of [-1, 1]) door(BX1 + 0.32, DZ + s * 3.2, 2.0, 4.0);
    R.box(0.2, 0.2, 13.4, DARK, BX0 - 0.42, 4.75, DZ); R.box(0.2, 0.2, 10.4, DARK, BX1 + 0.42, 4.15, DZ);
    rect(BX0, BX1, BZ0 - 0.18, BZ0 + 0.18); rect(BX0, BX1, BZ1 - 0.18, BZ1 + 0.18);
    rect(BX0 - 0.18, BX0 + 0.18, BZ0, DZ - 2.5); rect(BX0 - 0.18, BX0 + 0.18, DZ + 2.5, BZ1); rect(BX1 - 0.18, BX1 + 0.18, BZ0, DZ - 2.0); rect(BX1 - 0.18, BX1 + 0.18, DZ + 2.0, BZ1);
    const slab = (z0, y0, z1, y1) => { const L = Math.hypot(z1 - z0, y1 - y0), a = Math.atan2(y1 - y0, z1 - z0); RF.box(BX1 - BX0 + 0.8, 0.18, L + 0.12, ROOF, BCX, (y0 + y1) / 2 + 0.09, (z0 + z1) / 2, 0, -a); };
    slab(BZ0 - 0.5, EAVE - 0.3, BZ0 + 3.5, KNEE); slab(BZ0 + 3.5, KNEE, BCZ, RIDGE); slab(BZ1 + 0.5, EAVE - 0.3, BZ1 - 3.5, KNEE); slab(BZ1 - 3.5, KNEE, BCZ, RIDGE);
    RF.box(BX1 - BX0 + 0.9, 0.24, 0.5, PAPER, BCX, RIDGE + 0.12, BCZ);
    for (const x of [BCX - 5, BCX + 5]) { RF.box(1.2, 1.0, 1.2, CREAM, x, RIDGE + 0.6, BCZ); RF.put(new THREE.ConeGeometry(1.0, 0.8, 4), x, RIDGE + 1.5, BCZ, ROOF, PI / 4); for (const s of [-1, 1]) RF.box(0.04, 0.7, 0.9, '#2a3a28', x + s * 0.61, RIDGE + 0.6, BCZ); }   // cupolas
    plane(board('COBB FARM', 'CORN \u00b7 CARROTS \u00b7 SINCE 1931', GRN, PAPER, YEL, 1024, 200), 5.0, 0.95, BX0 - 0.2, 5.7, DZ, -PI / 2); }
  const roofM = RF.mesh(G);
  // ================= barn inside: hay loft + ladder, tractor, corn sheller, sacks, crates, workbench =================
  const LOFT = { z1: BZ0 + 5.6, y: 3.2 };
  { LF.box(BX1 - BX0 - 0.6, 0.16, LOFT.z1 - BZ0 - 0.3, WOOD, BCX, LOFT.y, (BZ0 + LOFT.z1) / 2 + 0.15); for (let x = BX0 + 1; x < BX1 - 0.5; x += 0.9) LF.box(0.05, 0.9, 0.05, WOODD, x, LOFT.y + 0.45, LOFT.z1);
    LF.box(BX1 - BX0 - 0.6, 0.08, 0.08, WOODD, BCX, LOFT.y + 0.9, LOFT.z1);
    for (let i = 0; i < 9; i++) { const x = BX0 + 1.6 + i * 2.0, r = i % 3; LF.box(1.4, 0.55, 0.75, r ? HAY : HAYD, x, LOFT.y + 0.36, BZ0 + 1.3 + (i % 2) * 0.9); if (r === 0) LF.box(1.4, 0.55, 0.75, HAY, x + 0.1, LOFT.y + 0.9, BZ0 + 1.6); }
    for (const x of [BX0 + 5, BCX, BX1 - 5]) { R.box(0.22, LOFT.y, 0.22, WOODD, x, LOFT.y / 2, LOFT.z1 - 0.1); ring(x, LOFT.z1 - 0.1, 0.18); }
    const lx = BCX - 2.5; for (const s of [-1, 1]) R.box(0.08, LOFT.y + 1.0, 0.08, WOOD, lx + s * 0.25, (LOFT.y + 1.0) / 2, LOFT.z1 + 0.35, 0, -0.18); for (let i = 1; i < 8; i++) R.box(0.5, 0.05, 0.05, WOOD, lx, i * 0.5, LOFT.z1 + 0.35 + 0.09 * (8 - i) * 0.5 - 0.1);
    // the little green tractor (under the loft, east)
    { const tx = BX1 - 4.6, tz = BZ0 + 2.7; R.box(2.0, 0.7, 1.0, GRN, tx, 1.0, tz); R.box(0.9, 0.5, 0.9, GRN, tx + 1.2, 0.95, tz); R.box(0.08, 0.5, 0.8, DARK, tx + 1.68, 0.95, tz);
      R.cyl(0.05, 0.05, 0.7, DARK, tx + 0.9, 1.7, tz - 0.2, 6); R.box(0.6, 0.12, 0.6, YEL, tx - 0.6, 1.45, tz); R.box(0.6, 0.6, 0.1, YEL, tx - 0.9, 1.75, tz, 0, 0, -0.2); R.cyl(0.04, 0.04, 0.6, DARK, tx - 0.1, 1.6, tz, 6, 0, 0.6);
      R.cyl(0.24, 0.24, 0.06, DARK, tx + 0.1, 1.9, tz, 10, 0, 0.6);
      for (const s of [-1, 1]) { R.cyl(0.75, 0.75, 0.45, '#1f1f1f', tx - 0.6, 0.75, tz + s * 0.75, 14, PI / 2); R.cyl(0.42, 0.42, 0.47, YEL, tx - 0.6, 0.75, tz + s * 0.75, 10, PI / 2); R.cyl(0.4, 0.4, 0.3, '#1f1f1f', tx + 1.2, 0.4, tz + s * 0.6, 12, PI / 2); R.cyl(0.22, 0.22, 0.32, YEL, tx + 1.2, 0.4, tz + s * 0.6, 8, PI / 2); }
      rect(tx - 1.4, tx + 1.8, tz - 1.1, tz + 1.1); }
    // seed sacks (under the loft, west)
    for (let i = 0; i < 7; i++) R.box(0.75, 0.42, 0.5, i % 2 ? '#d8c8a0' : '#c8b484', BX0 + 1.4 + (i % 4) * 0.8, 0.21 + Math.floor(i / 4) * 0.42, BZ0 + 1.0, (i % 3) * 0.1); rect(BX0 + 0.8, BX0 + 4.4, BZ0 + 0.6, BZ0 + 1.4);
    plane(board('SEED CORN', 'GOLDEN BANTAM \u00b7 50 KG', PAPER, INK, GRN, 512, 200), 1.0, 0.39, BX0 + 2.6, 1.3, BZ0 + 1.27, 0);
    // the corn sheller by the walkway (Maizy's spot inside)
    const px = BX0 + 6.2, pz = DZ + 2.4; R.box(1.2, 1.0, 0.9, '#b8392b', px, 0.5, pz); R.put(new THREE.CylinderGeometry(0.55, 0.25, 0.8, 4), px, 1.4, pz, '#b8392b', PI / 4); R.cyl(0.32, 0.32, 0.12, DARK, px + 0.66, 0.75, pz, 12, 0, PI / 2); R.box(0.06, 0.06, 0.5, DARK, px + 0.74, 0.75, pz + 0.25);
    R.box(0.5, 0.3, 0.5, '#b88a5c', px, 0.15, pz - 0.85); for (let i = 0; i < 5; i++) R.sph(0.06, YEL, px - 0.15 + (i % 3) * 0.15, 0.32, pz - 0.85 + Math.floor(i / 3) * 0.12); rect(px - 0.7, px + 0.9, pz - 1.15, pz + 0.5);
    plane(board('CORN SHELLER', 'MIND YOUR PAWS', YEL, INK, GRN, 512, 200), 0.9, 0.35, px, 0.6, pz + 0.46, 0);
    const crate = (x, y, z, full = true, c = ORG) => { R.box(0.72, 0.46, 0.5, '#b88a5c', x, y + 0.23, z); R.box(0.76, 0.05, 0.54, WOODD, x, y + 0.44, z); if (full) for (let i = 0; i < 6; i++) R.box(0.1, 0.1, 0.36, c, x - 0.22 + (i % 3) * 0.22, y + 0.5, z - 0.02 + Math.floor(i / 3) * 0.05); };
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) crate(BX1 - 12.6 + i * 0.85, k * 0.5, BZ1 - 0.6, k === 1 || i % 2 === 0, i % 2 ? ORG : YEL); rect(BX1 - 13.0, BX1 - 9.0, BZ1 - 0.9, BZ1 - 0.3);
    R.box(3.0, 0.9, 0.8, WOOD, BX1 - 2.2, 0.45, BZ1 - 0.7); R.box(3.1, 0.08, 0.9, WOODD, BX1 - 2.2, 0.92, BZ1 - 0.7); rect(BX1 - 3.8, BX1 - 0.6, BZ1 - 1.15, BZ1 - 0.3);
    for (const [x, c] of [[BX1 - 1.2, '#8a8f97'], [BX1 - 2.0, ORG], [BX1 - 3.0, GRN]]) R.box(0.3, 0.12, 0.18, c, x, 1.02, BZ1 - 0.7);
    R.cyl(0.42, 0.42, 1.0, '#7a5236', BX0 + 1.3, 0.5, DZ + 4.4, 12); R.cyl(0.44, 0.44, 0.06, DARK, BX0 + 1.3, 0.25, DZ + 4.4, 12); R.cyl(0.44, 0.44, 0.06, DARK, BX0 + 1.3, 0.75, DZ + 4.4, 12); ring(BX0 + 1.3, DZ + 4.4, 0.45);
    for (const [x, z] of [[BX1 - 6, DZ], [BX0 + 7, DZ]]) { R.box(0.02, 1.2, 0.02, INK, x, 4.6, z); R.box(0.22, 0.32, 0.22, '#ffd38a', x, 3.9, z); R.box(0.26, 0.05, 0.26, INK, x, 4.08, z); } }
  const loftM = LF.mesh(G);
  // ================= farmyard: Maizy's stand, water tower, cow pen, the arch =================
  const STAND = [19.5, -216.8];
  { const [sx, sz] = STAND; R.box(2.6, 0.9, 1.0, WOOD, sx, 0.45, sz); R.box(2.7, 0.08, 1.1, WOODD, sx, 0.92, sz); for (const dx of [-1.25, 1.25]) for (const dz of [-0.45, 0.45]) R.box(0.1, 2.4, 0.1, WOODD, sx + dx, 1.2, sz + dz);
    for (let i = 0; i < 7; i++) R.box(0.4, 0.04, 1.3, i % 2 ? PAPER : GRN, sx - 1.2 + i * 0.4, 2.45, sz - 0.05, 0, -0.18);
    for (let i = 0; i < 3; i++) { R.box(0.7, 0.3, 0.5, '#b88a5c', sx - 0.8 + i * 0.8, 1.11, sz - 0.15); for (let k = 0; k < 4; k++) { if (i === 1) R.box(0.1, 0.1, 0.4, ORG, sx - 0.95 + i * 0.8 + k * 0.1, 1.3, sz - 0.15); else R.cyl(0.06, 0.06, 0.4, YEL, sx - 0.95 + i * 0.8 + k * 0.1, 1.3, sz - 0.15, 6, PI / 2); } }
    rect(sx - 1.35, sx + 1.35, sz - 0.55, sz + 0.55);
    plane(board('MAIZY\u2019S CORN + CARROTS', 'PULLED TODAY \u00b7 I BUY YOURS TOO', GRN, PAPER, YEL, 1024, 200), 2.4, 0.46, sx, 1.75, sz - 0.56, PI); }
  // the water tower (the landmark you see from the Castle Path); red light on top at night
  const WT = [15.6, -209.2];
  const towerLight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: '#5a1a12' }));
  { const [wx, wz] = WT; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { R.box(0.22, 9.2, 0.22, '#7a7f86', wx + sx * 1.6, 4.6, wz + sz * 1.6, 0, sz * 0.06, -sx * 0.06); ring(wx + sx * 1.75, wz + sz * 1.75, 0.2); }
    for (const y of [3, 6]) { R.box(3.4, 0.1, 0.1, '#7a7f86', wx, y, wz - 1.65); R.box(3.4, 0.1, 0.1, '#7a7f86', wx, y, wz + 1.65); R.box(0.1, 0.1, 3.4, '#7a7f86', wx - 1.65, y, wz); R.box(0.1, 0.1, 3.4, '#7a7f86', wx + 1.65, y, wz); }
    R.cyl(2.5, 2.5, 0.16, DARK, wx, 9.25, wz, 20); R.cyl(2.2, 2.2, 3.4, '#9fa5ab', wx, 11.0, wz, 20); R.put(new THREE.ConeGeometry(2.4, 1.3, 20), wx, 13.35, wz, '#7a7f86'); R.cyl(0.05, 0.05, 0.8, DARK, wx, 14.2, wz, 6);
    for (let i = 0; i < 24; i++) { const a = i / 24 * PI * 2; R.box(0.05, 0.6, 0.05, DARK, wx + Math.cos(a) * 2.45, 9.6, wz + Math.sin(a) * 2.45); } R.cyl(2.48, 2.48, 0.05, DARK, wx, 9.9, wz, 20);
    for (let i = 0; i < 18; i++) R.box(0.5, 0.04, 0.04, '#7a7f86', wx + 1.85, 0.5 + i * 0.5, wz, 0); for (const s of [-1, 1]) R.box(0.05, 9.0, 0.05, '#7a7f86', wx + 1.85, 4.5, wz + s * 0.25);
    R.cyl(0.18, 0.18, 9.0, '#7a7f86', wx, 4.5, wz, 8);
    const tankT = CT(1024, 128, (g, w, h) => { g.fillStyle = '#9fa5ab'; g.fillRect(0, 0, w, h); g.fillStyle = GRN; g.fillRect(0, 24, w, 80); g.fillStyle = PAPER; g.textBaseline = 'middle'; g.font = '900 64px Archivo, sans-serif'; for (const x of [40, 552]) g.fillText('COBB FARM', x, 66); });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.215, 2.215, 1.1, 32, 1, true), new THREE.MeshLambertMaterial({ map: tankT })); tank.position.set(wx, 11.0, wz); tank.rotation.y = 0.4; G.add(tank);
    towerLight.position.set(wx, 14.65, wz); G.add(towerLight); }
  // cow pen (Daisy + Buttons): fenced, gate on the farmyard side
  const PEN = [13.2, 25, -248, -237.2], GATE = [19.2, -236.2];
  { const [x0, x1, z0, z1] = PEN, rail = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az); for (const y of [0.5, 1.0]) R.box(0.08, 0.12, L, '#efe6d2', (ax + bx) / 2, y, (az + bz) / 2, ry);
      const n = Math.max(1, Math.round(L / 2.2)); for (let i = 0; i <= n; i++) R.box(0.16, 1.2, 0.16, WOODD, ax + (bx - ax) * i / n, 0.6, az + (bz - az) * i / n); };
    rail(x0, z0, x1, z0); rail(x0, z0, x0, z1); rail(x1, z0, x1, z1); rail(x0, z1, 18.0, z1); rail(20.4, z1, x1, z1);
    rect(x0, x1, z0 - 0.1, z0 + 0.1); rect(x0 - 0.1, x0 + 0.1, z0, z1); rect(x1 - 0.1, x1 + 0.1, z0, z1); rect(x0, 18.0, z1 - 0.1, z1 + 0.1); rect(20.4, x1, z1 - 0.1, z1 + 0.1);
    R.box(2.2, 0.5, 0.7, '#7a8a96', 22.6, 0.25, -246.8); R.box(2.0, 0.04, 0.5, '#5aa8c8', 22.6, 0.48, -246.8); rect(21.5, 23.7, -247.2, -246.4);
    R.box(1.0, 0.7, 1.0, '#7a5a3a', 14.4, 0.35, -246.6); R.box(1.2, 0.5, 1.2, HAY, 14.4, 0.95, -246.6); rect(13.8, 15.0, -247.2, -246.0);
    plane(board('DAISY + BUTTONS', 'PLEASE SHUT THE GATE', PAPER, INK, GRN, 512, 200), 1.1, 0.43, 22.6, 1.45, z1 + 0.06, 0); }
  // the arch over the Castle Path wall gap
  { const [gx, gz] = FARM_C.gap; for (const s of [-1, 1]) R.box(0.3, 4.4, 0.3, WOODD, gx + 0.6, 2.2, gz + s * 2.8); R.box(0.4, 0.4, 6.2, WOODD, gx + 0.6, 4.4, gz);
    plane(board('COBB FARM', 'CORN \u00b7 CARROTS \u00b7 THE CORN MAZE', GRN, PAPER, YEL, 1024, 200), 4.4, 0.85, gx + 0.38, 3.75, gz, -PI / 2);
    plane(board('COBB FARM', 'SHUT THE PEN GATE', GRN, PAPER, YEL, 1024, 200), 4.4, 0.85, gx + 0.82, 3.75, gz, PI / 2);
    for (let i = 0; i < 4; i++) R.cyl(0.06, 0.06, 0.32, YEL, gx + 0.6, 4.1, gz - 1.5 + i * 1.0, 6, PI / 2); }
  // the maze sign at the entrance
  // ================= THE CORN MAZE =================
  const MC = 7, MR = 14, CS = 3, EN = 12, EX = 1;   // cells 3 m; entrance (west) row 12 near the farmyard, exit (west) row 1 by the carrots
  const cellX = i => MX0 + CS / 2 + i * CS, cellZ = j => MZ0 + CS / 2 + j * CS;
  const wE = Array.from({ length: MC }, () => Array(MR).fill(true)), wS = Array.from({ length: MC }, () => Array(MR).fill(true));
  { const seen = Array.from({ length: MC }, () => Array(MR).fill(false)), st = [[0, EN]]; seen[0][EN] = true;
    while (st.length) { const [i, j] = st[st.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [i + a, j + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < MC && b < MR && !seen[a][b]);
      if (!nb.length) { st.pop(); continue; } const [a, b] = nb[Math.floor(rnd() * nb.length)]; if (a !== i) wE[Math.min(a, i)][j] = false; else wS[i][Math.min(b, j)] = false; seen[a][b] = true; st.push([a, b]); }
    for (let k = 0; k < 7; k++) { const i = Math.floor(rnd() * (MC - 1)), j = 1 + Math.floor(rnd() * (MR - 2)); if (rnd() < 0.5) wE[i][j] = false; else wS[i][j] = false; } }   // a few loops (fights need more than one way round)
  const open = (i, j, a, b) => { if (a < 0 || b < 0 || a >= MC || b >= MR) return false; if (a !== i) return !wE[Math.min(a, i)][j]; return !wS[i][Math.min(b, j)]; };
  const SEG = [];   // { x, z, along: 'x'|'z', len, h }
  const seg = (x, z, along) => SEG.push({ x, z, along, len: CS + 0.8, h: 2.35 + rnd() * 0.45 });
  for (let i = 0; i < MC; i++) for (let j = 0; j < MR; j++) { if (i < MC - 1 && wE[i][j]) seg(MX0 + CS * (i + 1), cellZ(j), 'z'); if (j < MR - 1 && wS[i][j]) seg(cellX(i), MZ0 + CS * (j + 1), 'x'); }
  for (let j = 0; j < MR; j++) { if (j !== EN && j !== EX) seg(MX0, cellZ(j), 'z'); seg(MX1, cellZ(j), 'z'); }
  for (let i = 0; i < MC; i++) { seg(cellX(i), MZ0, 'x'); seg(cellX(i), MZ1, 'x'); }
  { const sideT = CT(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#3e6a26'; g.fillRect(0, 40, w, h - 40);
      for (let i = 0; i < 26; i++) { const x = (i + Math.random() * 0.6) * w / 26; g.strokeStyle = ['#5f8f2e', '#4f7e28', '#6e9a38', '#7aa244'][i % 4]; g.lineWidth = 5; g.beginPath(); g.moveTo(x, h); g.lineTo(x + (Math.random() - 0.5) * 8, 20 + Math.random() * 24); g.stroke(); }
      for (let i = 0; i < 70; i++) { const x = Math.random() * w, y = 30 + Math.random() * (h - 40), s = Math.random() < 0.5 ? -1 : 1; g.strokeStyle = ['#7aa244', '#8fb64e', '#5f8f2e', '#a8c060'][i % 4]; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + s * 22, y - 18, x + s * 40, y + 6); g.stroke(); }
      for (let i = 0; i < 9; i++) { const x = 14 + Math.random() * (w - 28), y = 90 + Math.random() * 90; g.fillStyle = '#e8c840'; g.fillRect(x - 5, y - 16, 10, 30); g.fillStyle = '#9ab858'; g.beginPath(); g.moveTo(x - 7, y + 16); g.lineTo(x, y - 20); g.lineTo(x + 7, y + 16); g.closePath(); g.globalAlpha = 0.6; g.fill(); g.globalAlpha = 1; }
      for (let i = 0; i < 16; i++) { const x = (i + 0.5) * w / 16; g.strokeStyle = '#c8a860'; g.lineWidth = 3; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x + k * 8, 8 + Math.random() * 8); g.stroke(); } } });
    sideT.wrapS = THREE.RepeatWrapping;
    const topT = CT(128, 64, (g, w, h) => { g.fillStyle = '#4f7e28'; g.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { g.fillStyle = ['#5f8f2e', '#6e9a38', '#3e6a26', '#8fb64e', '#c8a860'][i % 5]; g.fillRect(Math.random() * w, Math.random() * h, 5, 3); } }); topT.wrapS = THREE.RepeatWrapping;
    const sp = [], su = [], sn = [], tp = [], tu = [], tn = [];
    const quad = (A, U, N, p, uv, n) => { for (const k of [0, 1, 2, 0, 2, 3]) { A.push(...p[k]); U.push(...uv[k]); N.push(...n); } };
    for (const s of SEG) { const hl = s.len / 2, th = 0.4, H = s.h, ur = s.len / 2.6; if (s.along === 'z') { for (const sd of [-1, 1]) { const x = s.x + sd * th; quad(sp, su, sn, [[x, 0, s.z - hl], [x, 0, s.z + hl], [x, H, s.z + hl], [x, H, s.z - hl]], [[0, 0], [ur, 0], [ur, 1], [0, 1]], [sd, 0, 0]); }
        quad(tp, tu, tn, [[s.x - th, H - 0.05, s.z - hl], [s.x + th, H - 0.05, s.z - hl], [s.x + th, H - 0.05, s.z + hl], [s.x - th, H - 0.05, s.z + hl]], [[0, 0], [0.3, 0], [0.3, ur], [0, ur]], [0, 1, 0]);
        for (const ez of [-1, 1]) quad(sp, su, sn, [[s.x - th, 0, s.z + ez * hl], [s.x + th, 0, s.z + ez * hl], [s.x + th, H, s.z + ez * hl], [s.x - th, H, s.z + ez * hl]], [[0, 0], [0.3, 0], [0.3, 1], [0, 1]], [0, 0, ez]);
        s.col = rect(s.x - th, s.x + th, s.z - hl, s.z + hl); }
      else { for (const sd of [-1, 1]) { const z = s.z + sd * th; quad(sp, su, sn, [[s.x - hl, 0, z], [s.x + hl, 0, z], [s.x + hl, H, z], [s.x - hl, H, z]], [[0, 0], [ur, 0], [ur, 1], [0, 1]], [0, 0, sd]); }
        quad(tp, tu, tn, [[s.x - hl, H - 0.05, s.z - th], [s.x + hl, H - 0.05, s.z - th], [s.x + hl, H - 0.05, s.z + th], [s.x - hl, H - 0.05, s.z + th]], [[0, 0], [ur, 0], [ur, 0.3], [0, 0.3]], [0, 1, 0]);
        for (const ex of [-1, 1]) quad(sp, su, sn, [[s.x + ex * hl, 0, s.z - th], [s.x + ex * hl, 0, s.z + th], [s.x + ex * hl, H, s.z + th], [s.x + ex * hl, H, s.z - th]], [[0, 0], [0.3, 0], [0.3, 1], [0, 1]], [ex, 0, 0]);
        s.col = rect(s.x - hl, s.x + hl, s.z - th, s.z + th); } }
    const geo = (p, u, n) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); g.computeBoundingSphere(); return g; };
    G.add(new THREE.Mesh(geo(sp, su, sn), new THREE.MeshLambertMaterial({ map: sideT, alphaTest: 0.45, side: THREE.DoubleSide })));
    G.add(new THREE.Mesh(geo(tp, tu, tn), new THREE.MeshLambertMaterial({ map: topT })));
    const en = cellZ(EN), ex = cellZ(EX);
    for (const [z, t, sub] of [[en, 'CORN MAZE', 'IN \u00b7 FOLLOW THE MOO'], [ex, 'CORN MAZE', 'WAY OUT \u00b7 WELL DONE']]) { for (const s of [-1, 1]) R.box(0.16, 3.4, 0.16, WOODD, MX0 - 0.5, 1.7, z + s * 1.6); R.box(0.16, 0.16, 3.4, WOODD, MX0 - 0.5, 3.4, z);
      plane(board(t, sub, YEL, INK, GRN, 1024, 200), 2.8, 0.55, MX0 - 0.6, 2.9, z, -PI / 2); } }
  // ears of sweet corn on 40 of the walls (E / TALK to pick; they grow back)
  const EARS = []; { const pool = SEG.map((s, k) => k).sort(() => rnd() - 0.5).slice(0, 40); for (const k of pool) { const s = SEG[k], sd = rnd() < 0.5 ? -1 : 1, o = (rnd() - 0.5) * 1.6;
      const x = s.along === 'z' ? s.x + sd * 0.45 : s.x + o, z = s.along === 'z' ? s.z + o : s.z + sd * 0.45; if (x < MX0 - 0.1 && Math.abs(z - cellZ(EN)) < 1.6) continue; if (x > MX1) continue;
      EARS.push({ x, z, y: 1.15 + rnd() * 0.4, ry: s.along === 'z' ? (sd > 0 ? PI / 2 : -PI / 2) : (sd > 0 ? 0 : PI), on: true, rt: 0 }); } }
  const earGeo = (() => { const E = mk(); E.cyl(0.07, 0.05, 0.32, YEL, 0, 0, 0.0, 8, 0.5); for (const s of [-1, 1]) E.box(0.05, 0.36, 0.02, '#8fb64e', s * 0.05, -0.03, -0.02, 0, 0.5, s * 0.3); return E.geo(); })();
  const earI = new THREE.InstancedMesh(earGeo, new THREE.MeshLambertMaterial({ vertexColors: true }), EARS.length); earI.frustumCulled = false; G.add(earI);
  const M4 = new THREE.Matrix4(), Qn = new THREE.Quaternion(), Z0 = new THREE.Matrix4().makeScale(0, 0, 0);
  const syncEar = (e, i) => { if (e.on) { M4.compose(V(e.x, e.y, e.z), Qn.setFromAxisAngle(V(0, 1, 0), e.ry), V(1, 1, 1)); earI.setMatrixAt(i, M4); } else earI.setMatrixAt(i, Z0); earI.instanceMatrix.needsUpdate = true; };
  EARS.forEach(syncEar);
  // ================= CARROT PATCH (6 rows, pull = carrot in the bag) =================
  const CARS = []; for (let r = 0; r < 6; r++) for (let k = 0; k < 12; k++) CARS.push({ x: 14.2 + k * 1.1 + (r % 2) * 0.4, z: -266 + r * 2.4, on: true, rt: 0, a: rnd() * 6 });
  { for (let r = 0; r < 6; r++) R.box(13.6, 0.12, 0.7, '#5a3c24', 20.6, 0.1, -266 + r * 2.4); }
  const carGeo = (() => { const C = mk(); C.cyl(0.07, 0.05, 0.1, ORG, 0, 0.08, 0, 8); for (let k = 0; k < 3; k++) C.put(new THREE.ConeGeometry(0.06, 0.42, 4), Math.cos(k * 2.1) * 0.05, 0.32, Math.sin(k * 2.1) * 0.05, k % 2 ? '#4f8a2a' : '#6aa83a', 0, Math.sin(k * 2.1) * 0.35, -Math.cos(k * 2.1) * 0.35); return C.geo(); })();
  const carI = new THREE.InstancedMesh(carGeo, new THREE.MeshLambertMaterial({ vertexColors: true }), CARS.length); carI.frustumCulled = false; G.add(carI);
  const syncCar = (c, i) => { if (c.on) { M4.compose(V(c.x, 0.1, c.z), Qn.setFromAxisAngle(V(0, 1, 0), c.a), V(1, 1, 1)); carI.setMatrixAt(i, M4); } else carI.setMatrixAt(i, Z0); carI.instanceMatrix.needsUpdate = true; };
  CARS.forEach(syncCar);
  // ================= split-rail fence (every section breaks) =================
  const FEN = []; const fenceRun = (x0, z0, x1, z1, gaps = []) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, ax = x0 + (x1 - x0) * u0, az = z0 + (z1 - z0) * u0, bx = x0 + (x1 - x0) * u1, bz = z0 + (z1 - z0) * u1, mx = (ax + bx) / 2, mz = (az + bz) / 2;
      if (gaps.some(([g0, g1]) => { const c = x0 === x1 ? mz : mx; return c > g0 && c < g1; })) continue;
      FEN.push({ ax, az, bx, bz, x: mx, z: mz, ry, len: L / n, hp: 1, broken: false, t: 0, col: rect(Math.min(ax, bx) - 0.08, Math.max(ax, bx) + 0.08, Math.min(az, bz) - 0.08, Math.max(az, bz) + 0.08) }); } };
  fenceRun(LX0, LZ0, LX1, LZ0, [[26, 32]]); fenceRun(LX1, LZ1, LX1, MZ1, [[-217.5, -210.5]]); fenceRun(LX0, LZ1, 13.2, LZ1); fenceRun(18.0, LZ1, BX0 - 0.5, LZ1);
  const postI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1.15, 0.16).translate(0, 0.575, 0), lam(WOODD), FEN.length), railI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.12, 1), lam(WOOD), FEN.length * 2);
  const syncFence = (f, i) => { if (f.broken) { postI.setMatrixAt(i, Z0); railI.setMatrixAt(i * 2, Z0); railI.setMatrixAt(i * 2 + 1, Z0); }
    else { const q = Qn.setFromAxisAngle(V(0, 1, 0), f.ry); M4.compose(V(f.ax, 0, f.az), q, V(1, 1, 1)); postI.setMatrixAt(i, M4); for (const [k, y] of [[0, 0.45], [1, 0.95]]) { M4.compose(V(f.x, y, f.z), q, V(1, 1, f.len)); railI.setMatrixAt(i * 2 + k, M4); } }
    postI.instanceMatrix.needsUpdate = railI.instanceMatrix.needsUpdate = true; f.col.on = !f.broken; };
  FEN.forEach(syncFence); for (const m of [postI, railI]) { m.frustumCulled = false; G.add(m); }
  // ================= cover: hay + scarecrows =================
  const HAYS = [], SCARE = [];
  const roundBale = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const B = mk(); B.cyl(0.78, 0.78, 1.25, HAY, 0, 0.78, 0, 16, 0, PI / 2); for (const s of [-1, 1]) B.cyl(0.62, 0.62, 0.02, HAYD, s * 0.63, 0.78, 0, 16, 0, PI / 2); for (const s of [-0.3, 0.3]) B.cyl(0.8, 0.8, 0.05, GRN, s, 0.78, 0, 16, 0, PI / 2); B.mesh(g); G.add(g);
    HAYS.push({ g, x, z, r: 0.95, t: 0 }); rect(x - 0.8, x + 0.8, z - 0.8, z + 0.8); };
  const squareStack = (x, z, ry, n = 3) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const B = mk(); const L = [[0, 0, 0], [0, 0, 0.62], [0, 0.5, 0.31], [1.25, 0, 0.31]].slice(0, n + 1);
    for (const [ox, oy, oz] of L) { B.box(1.2, 0.5, 0.6, HAY, ox, 0.25 + oy, oz); for (const s of [-0.3, 0.3]) B.box(0.03, 0.51, 0.61, GRN, ox + s, 0.25 + oy, oz); } B.mesh(g); G.add(g); HAYS.push({ g, x, z, r: n > 2 ? 1.25 : 0.9, t: 0 });
    const w = n > 2 ? 1.6 : 0.7, rot = Math.abs(Math.sin(ry)) > 0.7; if (rot) rect(x - 0.8, x + 0.8, z - w, z + w); else rect(x - w, x + w, z - 0.8, z + 0.8); };
  for (const [x, z, ry] of [[26.6, -243.6, 0.3], [27.6, -231.6, 0.6], [44, -270, 0.2], [20, -270, 1.4], [51.8, -224, 1.2]]) roundBale(x, z, ry);
  for (const [x, z, ry] of [[27.8, -250.4, 0], [13.6, -231.8, PI / 2]]) squareStack(x, z, ry);
  const scarecrow = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); const sw = new THREE.Group(); g.add(sw); const S = mk();
    S.box(0.12, 2.6, 0.12, WOODD, 0, 1.3, 0); S.box(1.9, 0.1, 0.1, WOODD, 0, 1.9, 0); S.box(0.6, 0.8, 0.36, '#3a7a52', 0, 1.65, 0); for (let i = 0; i < 3; i++) S.box(0.61, 0.04, 0.37, '#22503a', 0, 1.35 + i * 0.25, 0); S.box(0.07, 0.8, 0.37, '#22503a', 0, 1.65, 0);
    for (const s of [-1, 1]) { S.box(0.7, 0.2, 0.22, '#b8392b', s * 0.62, 1.88, 0); for (let i = 0; i < 4; i++) S.box(0.04, 0.22, 0.04, HAY, s * 0.98, 1.74, -0.08 + i * 0.05); }
    S.box(0.5, 0.55, 0.36, '#6a5a3a', 0, 1.05, 0); for (let i = 0; i < 6; i++) S.box(0.04, 0.24, 0.04, HAY, -0.2 + i * 0.08, 0.72, 0.02);
    S.sph(0.3, '#d8c49a', 0, 2.35, 0); S.box(0.08, 0.08, 0.02, INK, -0.1, 2.42, 0.29); S.box(0.08, 0.08, 0.02, INK, 0.1, 2.42, 0.29); S.box(0.22, 0.03, 0.02, INK, 0, 2.27, 0.29);
    S.cyl(0.55, 0.55, 0.05, '#e3c46a', 0, 2.58, 0, 14); S.cyl(0.24, 0.3, 0.3, '#e3c46a', 0, 2.75, 0, 12); S.cyl(0.305, 0.305, 0.07, GRN, 0, 2.64, 0, 12); S.mesh(sw);
    SCARE.push({ g, sw, x, z, r: 0.55, k: 0, v: 0 }); ring(x, z, 0.35); };
  for (const [x, z, ry] of [[17.4, -260, 0.4], [23.8, -255.2, -0.5], [28.6, -234.6, -0.8], [28.6, -259.6, -1.2]]) scarecrow(x, z, ry);
  // ================= breakable crate stacks (loot) =================
  const CRATES = [];
  const crateStack = (x, z, n) => { const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g); const B = mk(); for (let i = 0; i < n; i++) { const ox = i === 2 ? 0.38 : (i % 2) * 0.76 - 0.38, oy = i === 2 ? 0.5 : 0; B.box(0.72, 0.48, 0.52, '#b88a5c', ox, oy + 0.24, 0); B.box(0.74, 0.06, 0.54, WOODD, ox, oy + 0.42, 0); B.box(0.74, 0.06, 0.54, WOODD, ox, oy + 0.06, 0); }
    B.mesh(g); CRATES.push({ g, x, z, hp: 2, broken: false, t: 0, shake: 0, col: rect(x - 0.8, x + 0.8, z - 0.3, z + 0.3) }); };
  for (const [x, z, n] of [[26.4, -209.4, 3], [51.8, -208.6, 2], [51.8, -219.8, 3], [15, -270, 2], [36, -270.2, 2], [27.6, -239.2, 2]]) crateStack(x, z, n);
  // ================= debris + pops =================
  const DEB = Array.from({ length: touch ? 18 : 30 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.12), lam('#b88a5c')); m.visible = false; G.add(m); return { m, v: V(), t: 0, w: V() }; });
  let debI = 0; const debris = (x, y, z, n, col) => { for (let i = 0; i < n; i++) { const d = DEB[debI++ % DEB.length]; d.m.material.color.set(col || '#b88a5c'); d.m.position.set(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.6); d.v.set((Math.random() - 0.5) * 4, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 4); d.w.set(Math.random() * 9, Math.random() * 9, Math.random() * 9); d.t = 1.6; d.m.visible = true; } };
  const POPS = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12), new THREE.MeshBasicMaterial({ color: YEL })); m.rotation.x = PI / 2; m.visible = false; G.add(m); return { m, t: 0 }; });
  let popI = 0; const pop = (x, z, n, col = YEL) => { for (let i = 0; i < n; i++) { const p = POPS[popI++ % POPS.length]; p.m.material.color.set(col); p.m.position.set(x + (Math.random() - 0.5) * 0.8, 0.8, z + (Math.random() - 0.5) * 0.8); p.t = 1.0 + i * 0.08; p.m.visible = true; } };
  // ================= animals: Daisy (cow), Buttons (calf), pigs =================
  const cow = (s, patch) => { const g = new THREE.Group(), C = mk(), W = '#f1ece2'; C.box(1.5, 0.75, 0.7, W, 0, 1.15, 0); for (const [x, y, z, w, h] of [[0.2, 1.3, 0.36, 0.5, 0.4], [-0.4, 1.05, -0.36, 0.4, 0.35], [-0.5, 1.45, 0.0, 0.4, 0.04]]) C.box(w, h, 0.02 + (y > 1.4 ? 0.7 : 0), patch, x, y, z);
    C.box(0.3, 0.12, 0.3, '#e7a6a6', -0.2, 0.74, 0); C.box(0.06, 0.5, 0.06, W, -0.78, 1.05, 0, 0, 0, -0.3); C.box(0.08, 0.14, 0.1, INK, -0.86, 0.78, 0);
    const legs = []; for (const sx of [-0.55, 0.55]) for (const sz of [-0.24, 0.24]) { const l = new THREE.Group(); l.position.set(sx, 0.8, sz); g.add(l); const Lg = mk(); Lg.box(0.16, 0.8, 0.16, W, 0, -0.4, 0); Lg.box(0.17, 0.12, 0.17, INK, 0, -0.74, 0); Lg.mesh(l); legs.push(l); }
    C.mesh(g); const head = new THREE.Group(); head.position.set(0.8, 1.35, 0); g.add(head); const H = mk(); H.box(0.42, 0.42, 0.4, W, 0.14, 0, 0); H.box(0.18, 0.24, 0.36, '#e7a6a6', 0.4, -0.1, 0); H.box(0.03, 0.04, 0.04, INK, 0.5, -0.05, 0.1); H.box(0.03, 0.04, 0.04, INK, 0.5, -0.05, -0.1);
    for (const sd of [-1, 1]) { H.box(0.06, 0.16, 0.06, '#e9dcb8', 0.08, 0.28, sd * 0.16, 0, sd * 0.4); H.box(0.1, 0.06, 0.2, patch, 0.06, 0.12, sd * 0.28); H.box(0.04, 0.05, 0.02, INK, 0.3, 0.08, sd * 0.2); } H.mesh(head);
    g.scale.setScalar(s); G.add(g); return { g, legs, head }; };
  const daisy = cow(1.0, '#2a2a2a'); daisy.g.position.set(16.2, 0, -244); daisy.g.rotation.y = 0.5;
  const calf = cow(0.58, '#7a4a2a'); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), lam(RED)); calf.g.add(b); const bell = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), lam(YEL)); bell.position.set(0.85, 1.0, 0); calf.g.add(bell); }
  const CALF = { st: 'pen', x: 20, z: -241, tx: 20, tz: -241, wt: 0, trail: [], moo: 0 }; calf.g.position.set(CALF.x, 0, CALF.z);
  const PIGS = Array.from({ length: touch ? 2 : 3 }, (_, i) => { const g = new THREE.Group(), P2 = mk(), PK = '#f0a8a8'; P2.box(0.8, 0.45, 0.45, PK, 0, 0.42, 0); P2.box(0.3, 0.3, 0.32, PK, 0.5, 0.48, 0); P2.box(0.06, 0.16, 0.2, '#e48a8a', 0.68, 0.44, 0); P2.box(0.02, 0.04, 0.04, INK, 0.7, 0.46, 0.05); P2.box(0.02, 0.04, 0.04, INK, 0.7, 0.46, -0.05);
    for (const s of [-1, 1]) { P2.box(0.08, 0.1, 0.1, PK, 0.5, 0.67, s * 0.1, 0, 0, 0.5); P2.box(0.02, 0.04, 0.03, INK, 0.66, 0.56, s * 0.1); } for (const sx of [-0.28, 0.28]) for (const sz of [-0.14, 0.14]) P2.box(0.1, 0.22, 0.1, PK, sx, 0.11, sz);
    P2.box(0.04, 0.12, 0.04, PK, -0.42, 0.55, 0, 0, 0, 0.8); P2.mesh(g); g.position.set(22 + i * 2, 0, -228 + i * 1.6); G.add(g); return { g, tx: g.position.x, tz: g.position.z, wt: Math.random() * 3, root: 0, hid: false, ph: i * 1.7 }; });
  // MOO bubble (rises over the corn so you can hear AND see where the calf is)
  const mooT = CT(256, 128, (g, w, h) => { g.fillStyle = PAPER; g.fillRect(8, 8, w - 16, h - 36); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 36); g.beginPath(); g.moveTo(110, h - 28); g.lineTo(128, h - 4); g.lineTo(146, h - 28); g.closePath(); g.fillStyle = PAPER; g.fill(); g.stroke(); g.fillStyle = INK; g.font = '900 56px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MOO!', w / 2, 52); });
  const moo = new THREE.Sprite(new THREE.SpriteMaterial({ map: mooT, transparent: true, depthTest: false })); moo.scale.set(2.2, 1.1, 1); moo.renderOrder = 20; moo.visible = false; G.add(moo); let mooT0 = 0;
  // ================= light: lanterns, pools at night, glowing barn windows =================
  const radT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, '#ffffff'); r.addColorStop(0.4, '#666666'); r.addColorStop(1, '#000000'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const LAMPS = [[16, -223.2], [23, -219.2], [27.6, -216.8], [22, -235.2], [28.4, -227.6], [51.6, -213.2], [28.6, -264.8]], lampM = new THREE.MeshBasicMaterial({ color: '#5a5654' });
  for (const [x, z] of LAMPS) { R.box(0.12, 2.6, 0.12, DARK, x, 1.3, z); R.box(0.5, 0.06, 0.06, DARK, x + 0.2, 2.6, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.22), lampM); m.position.set(x + 0.42, 2.38, z); G.add(m); ring(x, z, 0.12); }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.3), lampM); m.position.set(BX0 - 0.35, 4.95, DZ + 2.9); G.add(m); }
  const poolM = new THREE.MeshBasicMaterial({ map: radT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const POOL = [...LAMPS.map(([x, z]) => [x + 0.42, z, 2.8]), [BX0 - 1.4, DZ + 2.9, 3.4], [BX1 - 6, DZ, 4.0], [BX0 + 7, DZ, 4.0]];
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), poolM, POOL.length); POOL.forEach(([x, z, r], i) => { M4.compose(V(x, 0.1, z), Qn.identity(), V(r * 2, 1, r * 2)); pools.setMatrixAt(i, M4); pools.setColorAt(i, cc.set('#ffcf80').multiplyScalar(0.7)); }); pools.renderOrder = 5; pools.frustumCulled = false; pools.visible = false; G.add(pools);
  const paneM = new THREE.MeshBasicMaterial({ color: '#2e3a46' }); for (const [x, y, z] of G.userData.panes) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), paneM); m.position.set(x, y, z); m.rotation.y = z < BCZ ? PI : 0; G.add(m); }
  R.mesh(G);
  // ================= Maizy Cobb + the shop kit =================
  const maizy = kit.makeFox({ key: 'farmMaizy', name: 'Maizy Cobb', torso: ['#e8c840', GRN, '#b89a20'], outfit: 'dress', mood: 'happy', crest: '', look: { fur: '#d0782e', furDark: '#8a4416' } });
  { const P2 = maizy.userData.P; if (P2 && P2.sword) P2.sword.visible = false; if (P2 && P2.gun) P2.gun.visible = false;
    if (P2 && P2.head) { const hat = new THREE.Group(); hat.position.set(0, 0.3, 0); P2.head.add(hat); const H = mk(); H.cyl(0.4, 0.4, 0.03, '#e3c46a', 0, 0, 0, 16); H.cyl(0.22, 0.25, 0.18, '#e3c46a', 0, 0.1, 0, 12); H.cyl(0.255, 0.255, 0.05, GRN, 0, 0.04, 0, 12); H.box(0.05, 0.18, 0.1, YEL, 0.24, 0.06, 0.1, 0, 0, 0.3); H.mesh(hat); hat.rotation.z = 0.1; } }
  const IN = [BX0 + 7.6, DZ, -PI / 2], OUT = [STAND[0], STAND[1] + 1.35, PI];
  maizy.position.set(IN[0], 0, IN[1]); maizy.rotation.y = IN[2]; G.add(maizy);
  const GAMES = [{ k: 'calf', name: 'Find the Calf', color: GRN }];
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'farmC', color: GRN, boardTitle: 'Cobb Farm',
    room: { X0: BX0 + 0.3, X1: BX1 - 0.3, Z0: BZ0 + 0.3, Z1: BZ1 - 0.3 }, door: [BX0 + 0.8, DZ], keeper: null, games: GAMES, allGames: GAMES,
    board: { x: BX1 - 7.5, y: 2.5, z: BZ1 - 0.2, ry: PI, w: 1.3 }, hiring: { x: BX0 + 2.2, z: DZ + 3.3, ry: -PI / 2 }, hiringLine: 'WALK UP \u00b7 FIND THE CALF',
    sun: [{ x: BX0 + 4, z: BZ1 - 1.6, w: 1.8, d: 1.4 }, { x: BCX, z: BZ1 - 1.6, w: 1.8, d: 1.4 }, { x: BX0 + 3.2, z: DZ, w: 3.4, d: 2.6 }],
    lamps: [[BX0 + 7, 3.9, DZ], [BX1 - 6, 3.9, DZ]], browse: [[BX1 - 10.6, BZ1 - 1.6, 0], [BX1 - 2.3, BZ1 - 1.8, 0], [BX0 + 3.2, BZ0 + 6.4, PI]],
    clock: { x: BX0 + 4.6, y: 3.3, z: BZ1 - 0.2, ry: PI } });
  // ================= sound + toast + card =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.4) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2 = 0) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, crack = () => { tone(180, 0.08, 0.15, 'square'); tone(90, 0.06, 0.25, 'triangle', 0.03); }, plop = () => tone(700, 0.05, 0.14, 'sine', 0, 400);
  const mooS = (k = 1, big = false) => { const f = big ? 120 : 210; tone(f, 0.07 * k, 0.9, 'sawtooth', 0, f * 0.72); tone(f * 1.5, 0.03 * k, 0.8, 'triangle', 0.05, f * 1.1); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; }, hideCard = () => { if (cardKey) { card.style.display = 'none'; cardKey = ''; } };
  // ================= Maizy: lines (every box 20 words or less) + menu (YES, PUT ME TO WORK! first · GOODBYE last) =================
  const TG = () => ({ key: 'farmMaizy', name: 'Maizy Cobb', role: 'COBB FARM', obj: maizy, ry: maizy.rotation.y, r: 5 }), l = text => ({ who: 'Maizy Cobb', role: 'COBB FARM', text });
  const HI = ['Morning, sugar. Corn\u2019s high and the carrots are fat. Pull what you need.', 'Back again? Mind the maze. It moves when you\u2019re not looking. It doesn\u2019t, but it feels that way.', 'Buttons got out again. That calf could find a hole in a bucket.'];
  let hiN = 0, danger = false;
  const crops = () => ({ c: save.count ? save.count('carrot') : 0, k: save.count ? save.count('sweetCorn') : 0 });
  function menu() { const met = save.stat('farmCMet', false); if (!met) save.setStat('farmCMet', true); const { c, k } = crops();
    sayTo(TG(), [{ ...l(!met ? 'Maizy Cobb. Cobb Farm. Corn, carrots, one cow and one calf who will not stay put.' : HI[hiN++ % HI.length]), choices: [
      { text: CHOICE_WORK, pick: () => jobAsk() },
      { text: c + k ? 'SELL CROPS \u00b7 ' + c + ' CARROT' + (c === 1 ? '' : 'S') + ' + ' + k + ' CORN' : 'SELL CROPS \u00b7 CARROT 2 G \u00b7 CORN 3 G', pick: () => sell() },
      { text: 'CORN CHOWDER \u00b7 10 G \u00b7 +50 HP', pick: () => chowder() },
      { text: 'WHAT\u2019S OUT THERE?', pick: () => sayTo(TG(), [l('Bandits cut through my corn to dodge the barracks. The maze slows them down. Slows you too.'), l('Corn stops a shot, sugar. So does hay. Use them.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(TG(), [l('Shut the pen gate on your way, sugar.')]) }] }]); }
  function sell() { const { c, k } = crops(); if (!c && !k) { sayTo(TG(), [l('Nothing in your bag, sugar. Pull some carrots. Pick some corn off the maze.')]); return; }
    for (let i = 0; i < c; i++) save.take('carrot'); for (let i = 0; i < k; i++) save.take('sweetCorn'); const g = c * 2 + k * 3; save.addGold(g); coin(); toast('SOLD \u00b7 +' + g + ' G', 2.6);
    sayTo(TG(), [l(g > 20 ? 'Now that\u2019s a harvest! ' + g + ' gold. You\u2019ve got farmer hands, sugar.' : 'There you go. ' + g + ' gold. Fresh as dew.')]); }
  function chowder() { if (!save.spend(10)) { sayTo(TG(), [l('Ten gold a bowl, sugar. Sell me some crops first.')]); return; } save.give('cornChowder'); coin(); toast('CORN CHOWDER \u00b7 IN YOUR BAG \u00b7 \u221210 G', 2.4); sayTo(TG(), [l('Hot and thick. Grandma Cobb\u2019s recipe. Eat it when the bandits get rough.')]); }
  // ================= JOB: FIND THE CALF =================
  let J = null; const TIME = 120;
  const mazeCell = (x, z) => [Math.floor((x - MX0) / CS), Math.floor((z - MZ0) / CS)];
  const inMaze = P => !!P && P.x > MX0 + 0.1 && P.x < MX1 - 0.1 && P.z > MZ0 + 0.1 && P.z < MZ1 - 0.1;
  function hidingCell() { const D = Array.from({ length: MC }, () => Array(MR).fill(-1)), q = [[0, EN]]; D[0][EN] = 0; let mx = 0;
    while (q.length) { const [i, j] = q.shift(); for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (open(i, j, a, b) && D[a][b] < 0) { D[a][b] = D[i][j] + 1; mx = Math.max(mx, D[a][b]); q.push([a, b]); } }
    const ends = []; for (let i = 0; i < MC; i++) for (let j = 0; j < MR; j++) { const n = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => open(i, j, a, b)).length; if (n === 1 && D[i][j] >= mx * 0.55 && j !== EX) ends.push([i, j]); }
    if (!ends.length) for (let i = 0; i < MC; i++) for (let j = 0; j < MR; j++) if (D[i][j] >= mx * 0.6) ends.push([i, j]);
    return ends[Math.floor(Math.random() * ends.length)]; }
  function jobAsk() { if (danger) { sayTo(TG(), [l('Not now, sugar! Bandits! Run them off first.')]); return; }
    sayTo(TG(), [l('Buttons ran into the corn maze again! Follow his moo, find him, walk him back to the pen.')], () => jobStart()); }
  function jobStart() { const [i, j] = hidingCell(); CALF.st = 'lost'; CALF.x = cellX(i); CALF.z = cellZ(j); CALF.trail = []; calf.g.position.set(CALF.x, 0, CALF.z); CALF.moo = 1.2;
    J = { t: TIME, el: 0, over: false }; ring2.visible = false; toast('FIND THE CALF \u00b7 FOLLOW THE MOO!', 2.4); ding(); mooS(1, true); }
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.7, 32), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false })); ring2.rotation.x = -PI / 2; ring2.position.set(GATE[0], 0.09, GATE[1] + 1.2); ring2.visible = false; G.add(ring2);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), new THREE.MeshBasicMaterial({ color: YEL })); arrow.rotation.x = PI; arrow.visible = false; G.add(arrow);
  function calfHome() { CALF.st = 'pen'; CALF.x = 20.5; CALF.z = -240.5; CALF.tx = CALF.x; CALF.tz = CALF.z; calf.g.position.set(CALF.x, 0, CALF.z); CALF.trail = []; }
  function jobEnd(stopped) { if (!J) return; const el = J.el, ok = !stopped && CALF.st === 'home'; J = null; ring2.visible = false; arrow.visible = false; moo.visible = false; hideCard(); calfHome();
    if (stopped) { sayTo(TG(), [l('Taking a break? I\u2019ll fetch him myself. He always comes back for supper.')]); return; }
    if (!ok) { sayTo(TG(), [l('He\u2019s still out there, bless him. I\u2019ll rattle the feed bucket. Try again soon, sugar.')]); return; }
    const stars = el <= 50 ? 3 : el <= 80 ? 2 : 1, first = !save.stat('farmCStar_calf', 0), gold = stars * 6 + (first ? 12 : 0); save.addGold(gold); try { save.addXp && save.addXp(stars * 10); } catch (e) {} save.give('sweetCorn'); save.give('carrot');
    K.finish('calf', stars, gold, first); mooS(1, true);
    sayTo(TG(), [l(stars === 3 ? 'Back already! Buttons barely missed me. You\u2019re a natural, sugar. Corn and a carrot, on me.' : stars === 2 ? 'There he is! Muddy, but home. Take a corn and a carrot.' : 'Took a while, but he\u2019s home. Thank you, sugar. A little something for you.')]); }
  function calfTick(dt, t, P) { const c = CALF, g = calf.g; let sp = 0;
    if (c.st === 'pen' || c.st === 'home') { c.wt -= dt; if (c.wt <= 0) { c.wt = 2.5 + Math.random() * 4; c.tx = 14.6 + Math.random() * 9.6; c.tz = -246.8 + Math.random() * 8.6; }
      const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz); if (d > 0.2) { sp = 0.8; const s = Math.min(d, sp * dt); c.x += dx / d * s; c.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz) - PI / 2; } }
    else if (c.st === 'lost') { g.rotation.y += Math.sin(t * 0.4) * dt * 0.3;
      c.moo -= dt; if (c.moo <= 0) { c.moo = 3.4; const d = dist(P, c.x, c.z); mooS(clamp(1.2 - d / 45, 0.25, 1)); moo.visible = true; mooT0 = t; } }
    else if (c.st === 'follow') { const tr = c.trail; while (tr.length > 1 && Math.hypot(tr[0][0] - c.x, tr[0][1] - c.z) < 0.25) tr.shift();
      const d = dist(P, c.x, c.z); if (d > 1.7 && tr.length) { const [tx, tz] = tr[0], dx = tx - c.x, dz = tz - c.z, dd = Math.hypot(dx, dz) || 1; sp = clamp(d * 1.6, 1.5, 6.5); const s = Math.min(dd, sp * dt); c.x += dx / dd * s; c.z += dz / dd * s; g.rotation.y = Math.atan2(dx, dz) - PI / 2; }
      const last = tr[tr.length - 1]; if (!last || Math.hypot(last[0] - P.x, last[1] - P.z) > 0.5) tr.push([P.x, P.z]); if (tr.length > 80) tr.shift();
      if (dist(c, GATE[0], GATE[1] + 1.2) < 2.4) { c.st = 'home'; c.tx = 19.5; c.tz = -240; if (J) { J.over = true; setTimeout(() => jobEnd(false), 500); } } }
    g.position.set(c.x, 0, c.z); const ph = t * 9 * (sp > 0 ? 1 : 0); calf.legs.forEach((lg, k) => { lg.rotation.z = sp > 0 ? Math.sin(ph + (k % 2 ? PI : 0) + (k > 1 ? PI / 2 : 0)) * 0.5 : 0; });
    calf.head.rotation.z = sp > 0 ? 0 : Math.sin(t * 1.3) * 0.12 - 0.1;
    if (moo.visible) { const k = t - mooT0; moo.position.set(c.x, 3.4 + k * 0.6, c.z); moo.material.opacity = clamp(1.6 - k, 0, 1); if (k > 1.6) moo.visible = false; } }
  // ================= picking: carrots + corn =================
  const nearCar = P => { let b = -1, bd = 1.4; CARS.forEach((c, i) => { if (!c.on) return; const d = dist(P, c.x, c.z); if (d < bd) { bd = d; b = i; } }); return b; };
  const nearEar = P => { let b = -1, bd = 1.5; EARS.forEach((e, i) => { if (!e.on) return; const d = dist(P, e.x, e.z); if (d < bd) { bd = d; b = i; } }); return b; };
  const flyO = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.34, 8), lam(ORG)); flyO.visible = false; G.add(flyO); let flyT = 0; const flyFrom = V(), flyTo = V();
  const fly = (x, y, z, P, col) => { flyO.material.color.set(col); flyFrom.set(x, y, z); flyTo.set(P.x, 1.2, P.z); flyT = 0.4; flyO.visible = true; };
  function pullCarrot(i, P) { const c = CARS[i]; c.on = false; c.rt = 0; syncCar(c, i); plop(); debris(c.x, 0.2, c.z, 2, '#6a4a30'); fly(c.x, 0.3, c.z, P, ORG); save.give('carrot'); toast('CARROT \u00b7 +10 HP WHEN YOU EAT IT \u00b7 IN YOUR BAG', 1.8); }
  function pickEar(i, P) { const e = EARS[i]; e.on = false; e.rt = 0; syncEar(e, i); tone(1200, 0.04, 0.1, 'triangle'); fly(e.x, e.y, e.z, P, YEL); save.give('sweetCorn'); toast('SWEET CORN \u00b7 +15 HP WHEN YOU EAT IT \u00b7 IN YOUR BAG', 1.8); }
  // ================= hits + shot blockers =================
  function hitFence(f, i) { if (f.broken) return; f.broken = true; f.t = 0; syncFence(f, i); crack(); debris(f.x, 0.8, f.z, 4); }
  function hitCrate(c) { if (c.broken) return; c.hp--; c.shake = 0.3; crack(); if (c.hp > 0) return; c.broken = true; c.t = 0; c.g.visible = false; c.col.on = false; debris(c.x, 0.6, c.z, 8);
    if (Math.random() < 0.35) { const it = Math.random() < 0.5 ? 'carrot' : 'sweetCorn'; save.give(it); pop(c.x, c.z, 2, it === 'carrot' ? ORG : YEL); toast('CRATE \u00b7 ' + (it === 'carrot' ? 'A CARROT' : 'SWEET CORN') + ' \u00b7 IN YOUR BAG', 1.8); } else { const g = 2 + Math.floor(Math.random() * 4); save.addGold(g); pop(c.x, c.z, g); coin(); toast('CRATE \u00b7 +' + g + ' G', 1.6); } }
  const wob = s => { s.v += 6; tone(300, 0.03, 0.1, 'triangle'); };
  const LC = [(LX0 + LX1) / 2, (LZ0 + LZ1) / 2];
  const hits = (kind, P) => { if (!P || dist(P, LC[0], LC[1]) > 70) return []; const R2 = kind === 'melee' ? 5 : 17, out = [];
    FEN.forEach((f, i) => { if (!f.broken && dist(P, f.x, f.z) < R2) out.push({ x: f.x, z: f.z, r: 0.6, onHit: () => hitFence(f, i), d: dist(P, f.x, f.z) }); });
    for (const c of CRATES) if (!c.broken && dist(P, c.x, c.z) < R2) out.push({ x: c.x, z: c.z, r: 0.8, onHit: () => hitCrate(c), d: dist(P, c.x, c.z) });
    for (const s of SCARE) if (dist(P, s.x, s.z) < R2) out.push({ x: s.x, z: s.z, r: 0.4, onHit: () => wob(s), d: dist(P, s.x, s.z) });
    return out.sort((a, b) => b.d - a.d); };
  const cornBlk = []; for (const s of SEG) for (const o of [-1, 0, 1]) cornBlk.push({ x: s.along === 'x' ? s.x + o * 1.25 : s.x, z: s.along === 'z' ? s.z + o * 1.25 : s.z, r: 0.75, onShot: () => {} });
  const blockers = () => [...HAYS.map(h => ({ x: h.x, z: h.z, r: h.r, onShot: () => { h.t = 0.3; debris(h.x, 1.0, h.z, 2, HAY); } })), ...SCARE.map(s => ({ x: s.x, z: s.z, r: s.r, onShot: () => wob(s) })), ...(lastP && dist(lastP, LC[0], LC[1]) < 80 ? cornBlk : [])];
  (window.__m2hitSrc = window.__m2hitSrc || []).push(hits); (window.__m2blockers = window.__m2blockers || []).push(blockers);
  // ================= per frame =================
  const inBarn = P => !!P && P.x > BX0 + 0.1 && P.x < BX1 - 0.2 && P.z > BZ0 + 0.2 && P.z < BZ1 - 0.2 && (P.y || 0) < 3;
  const inLot = P => !!P && P.x > LX0 - 3 && P.x < LX1 && P.z > LZ0 && P.z < LZ1;
  let mw = null, waveT = 0, wasIn = false, lastP = null, nightOn = null, dangerT = 0, wasDanger = false, camK = 0;
  const maizyWant = () => { const h = hour(); return danger || h < 7 || h >= 17 ? 'in' : 'out'; };
  let mSide = maizyWant(); const placeM = k => { const p = k === 'out' ? OUT : IN; maizy.position.set(p[0], 0, p[1]); maizy.rotation.y = p[2]; mSide = k; mw = null; }; placeM(mSide);
  const MPTS = [[IN[0], IN[1]], [BX0 - 1.4, DZ], [24, -214.4], [21.6, -214.8], [OUT[0], OUT[1]]];
  function maizyTick(dt, t, P) { const want = maizyWant(), A = maizy.userData.P && maizy.userData.P.arms;
    if (want !== mSide && !mw) { if (dist(P, maizy.position.x, maizy.position.z) > 50) placeM(want); else { mw = { pts: want === 'in' ? MPTS.slice(0, -1).reverse() : MPTS.slice(1), i: 0, to: want, sp: danger ? 3.4 : 1.5 }; mSide = 'walk'; } }
    if (mw) { const [tx, tz] = mw.pts[mw.i], dx = tx - maizy.position.x, dz = tz - maizy.position.z, dd = Math.hypot(dx, dz);
      if (dd < 0.08) { if (++mw.i >= mw.pts.length) placeM(mw.to); } else { const st = Math.min(dd, mw.sp * dt); maizy.position.x += dx / dd * st; maizy.position.z += dz / dd * st; maizy.rotation.y = Math.atan2(dx, dz); }
      kit.animFox && kit.animFox(maizy, dt, mw ? mw.sp : 0); return; }
    const home = mSide === 'out' ? OUT[2] : IN[2], d = dist(P, maizy.position.x, maizy.position.z), ins = inBarn(P);
    if (mSide === 'in' && ins && !wasIn) { waveT = 1.8; K.chime(); } wasIn = ins;
    const look = d < 4.5 && (mSide === 'out' || ins), a = look || waveT > 0 ? Math.atan2(P.x - maizy.position.x, P.z - maizy.position.z) : home + Math.sin(t * 0.5) * 0.2;
    maizy.rotation.y += Math.atan2(Math.sin(a - maizy.rotation.y), Math.cos(a - maizy.rotation.y)) * Math.min(1, dt * 3); kit.animFox && kit.animFox(maizy, dt, 0);
    if (A && A[1]) { if (waveT > 0) { waveT -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; if (waveT <= 0) { A[1].rotation.x = 0; A[1].rotation.z = 0; } } } }
  function pigTick(dt, t) { for (const p of PIGS) { const g = p.g;
      if (danger) { const dx = BX0 + 1 - g.position.x, dz = DZ + 2 - g.position.z, d = Math.hypot(dx, dz); if (d > 0.3) { const s = Math.min(d, 3.8 * dt); g.position.x += dx / d * s; g.position.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz) - PI / 2; g.position.y = Math.abs(Math.sin(t * 18 + p.ph)) * 0.08; } else if (!p.hid) { p.hid = true; g.visible = false; } continue; }
      if (p.hid) { p.hid = false; g.visible = true; }
      p.wt -= dt; if (p.wt <= 0) { p.wt = 2.5 + Math.random() * 4; p.tx = 21 + Math.random() * 7.5; p.tz = -233 + Math.random() * 10; if (Math.random() < 0.4) p.root = 1.6; }
      const dx = p.tx - g.position.x, dz = p.tz - g.position.z, d = Math.hypot(dx, dz);
      if (p.root > 0) { p.root -= dt; g.rotation.z = -0.2 - Math.abs(Math.sin(t * 8)) * 0.15; g.position.y = 0; }
      else if (d > 0.2) { const s = Math.min(d, 0.8 * dt); g.position.x += dx / d * s; g.position.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz) - PI / 2; g.rotation.z = 0; g.position.y = Math.abs(Math.sin(t * 9 + p.ph)) * 0.04; } } }
  let daisyMoo = 6;
  function tick(dt, P, fox) { if (!P) return; lastP = P; if (toastT > 0) toastT -= dt; const t = performance.now() / 1000, d = dist(P, LC[0], LC[1]);
    G.visible = d < 150; if (d > 120) { hideCard(); return; }
    dangerT -= dt; if (dangerT <= 0) { dangerT = 0.5; danger = threat(LC[0], LC[1], 55) > 0; if (danger && !wasDanger && d < 70) { toast('MAIZY: Bandits in the corn! Into the barn, piggies!', 2.6); mooS(0.8, true); } wasDanger = danger; }
    K.tick(dt, P, { inShop: inBarn(P), busy: !!J, near: inBarn(P) ? 0 : dist(P, BCX, BCZ) });
    maizyTick(dt, t, P); pigTick(dt, t); calfTick(dt, t, P);
    daisy.head.rotation.z = Math.sin(t * 0.6) * 0.1 - 0.25 + (Math.sin(t * 0.23) > 0.85 ? 0.35 : 0); daisy.head.rotation.y = Math.sin(t * 0.4) * 0.25;
    if ((daisyMoo -= dt) <= 0) { daisyMoo = 14 + Math.random() * 14; if (dist(P, daisy.g.position.x, daisy.g.position.z) < 25) mooS(0.5, true); }
    const ins = inBarn(P); roofM.visible = !ins; loftM.visible = !(ins && P.z < LOFT.z1 + 1.2);
    EARS.forEach((e, i) => { if (!e.on && (e.rt += dt) > 60 && dist(P, e.x, e.z) > 8) { e.on = true; syncEar(e, i); } });
    CARS.forEach((c, i) => { if (!c.on && (c.rt += dt) > 40 && dist(P, c.x, c.z) > 6) { c.on = true; syncCar(c, i); } });
    if (flyT > 0) { flyT -= dt; const k = 1 - Math.max(0, flyT) / 0.4; flyO.position.lerpVectors(flyFrom, flyTo, k); flyO.position.y += Math.sin(k * PI) * 1.2; flyO.rotation.z += dt * 12; if (flyT <= 0) flyO.visible = false; }
    FEN.forEach((f, i) => { if (f.broken && (f.t += dt) > 120 && dist(P, f.x, f.z) > 25) { f.broken = false; syncFence(f, i); } });
    for (const c of CRATES) { if (c.broken) { if ((c.t += dt) > 90 && dist(P, c.x, c.z) > 25) { c.broken = false; c.hp = 2; c.g.visible = true; c.col.on = true; } } else if (c.shake > 0) { c.shake -= dt; c.g.position.x = c.x + Math.sin(t * 60) * 0.05 * c.shake / 0.3; } }
    for (const s of SCARE) { s.v += (-s.k * 40 - s.v * 4) * dt; s.k += s.v * dt; s.sw.rotation.z = s.k * 0.12; }
    for (const h of HAYS) if (h.t > 0) { h.t -= dt; h.g.scale.setScalar(1 + Math.sin(h.t * 40) * 0.03); } else h.g.scale.setScalar(1);
    for (const db of DEB) { if (db.t <= 0) continue; db.t -= dt; db.v.y -= 12 * dt; db.m.position.addScaledVector(db.v, dt); if (db.m.position.y < 0.05) { db.m.position.y = 0.05; db.v.multiplyScalar(0.4); db.v.y = 0; } db.m.rotation.x += db.w.x * dt; db.m.rotation.y += db.w.y * dt; if (db.t <= 0) db.m.visible = false; }
    for (const p of POPS) { if (p.t <= 0) continue; p.t -= dt; p.m.position.y += dt * 2.2; p.m.rotation.z += dt * 8; if (p.t <= 0) p.m.visible = false; }
    const h = hour(), nt = h < 7 || h >= 18.5; if (nt !== nightOn) { nightOn = nt; pools.visible = nt; poolM.opacity = nt ? 1 : 0; lampM.color.set(nt ? '#fff2c8' : '#5a5654'); paneM.color.set(nt ? '#ffd38a' : '#2e3a46'); }
    towerLight.material.color.set(nt && Math.sin(t * 3) > 0 ? '#ff3a20' : '#5a1a12');
    if (J) { if (!J.over) { J.t -= dt; J.el += dt; if (J.t <= 0) { J.over = true; jobEnd(false); return; } }
      ring2.visible = CALF.st === 'follow'; ring2.scale.setScalar(1 + 0.08 * Math.sin(t * 4));
      const hint = CALF.st === 'lost' && J.el > 45; arrow.visible = CALF.st === 'follow' || hint;
      if (CALF.st === 'follow') arrow.position.set(GATE[0], 3.2 + Math.sin(t * 3) * 0.25, GATE[1] + 1.2); else if (hint) arrow.position.set(CALF.x, 4.6 + Math.sin(t * 3) * 0.25, CALF.z);
      const stTxt = CALF.st === 'lost' ? 'LOST' : CALF.st === 'follow' ? 'WITH YOU' : 'HOME', key = 'job' + stTxt + '|' + Math.ceil(J.t);
      setCard(key, '<div style="background:' + GRN + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px">FIND THE CALF \u00b7 BUTTONS</div><div style="padding:8px 10px 4px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-weight:900"><div><div style="font-size:10px">BUTTONS</div><div style="font-size:20px;color:' + (CALF.st === 'lost' ? RED : INK) + '">' + stTxt + '</div></div><div><div style="font-size:10px">TIME</div><div style="font-size:20px">' + Math.max(0, Math.ceil(J.t)) + '</div></div></div><div style="padding:0 10px 9px;font-size:11px;font-weight:800">' + (CALF.st === 'lost' ? 'FOLLOW THE MOO INTO THE CORN' : 'WALK HIM TO THE YELLOW RING AT THE PEN') + '</div>'); }
    else hideCard(); }
  // camera: in the barn it stays in the room; in the maze it rises high behind you (looking down over the corn)
  function camFix(cam, dt = 1 / 60) { const P = lastP; if (!P) return; const cp = cam.position;
    const want = inMaze(P) ? 1 : 0; camK += (want - camK) * Math.min(1, (dt || 1 / 60) * 3);
    if (camK > 0.01) { let dx = cp.x - P.x, dz = cp.z - P.z; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L; const tx = P.x + dx * 3.6, ty = (P.y || 0) + (touch ? 10.5 : 9.5), tz = P.z + dz * 3.6;
      cp.x += (tx - cp.x) * camK; cp.y += (ty - cp.y) * camK; cp.z += (tz - cp.z) * camK; cam.lookAt(P.x, (P.y || 0) + 1.1 - camK * 0.6, P.z); }
    if (!inBarn(P)) return; const x = clamp(cp.x, BX0 + 0.5, BX1 - 0.6), z = clamp(cp.z, BZ0 + 0.6, BZ1 - 0.6); if (x !== cp.x || z !== cp.z) { cp.x = x; cp.z = z; cam.lookAt(P.x, (P.y || 0) + 1.1, P.z); } }
  function prompt(P) { if (!inLot(P)) return null; const md = dist(P, maizy.position.x, maizy.position.z);
    if (J) { if (CALF.st === 'lost' && dist(P, CALF.x, CALF.z) < 2.2) return 'TALK \u00b7 BUTTONS \u00b7 COME ON HOME'; if (mSide !== 'walk' && md < 2.6) return 'TALK \u00b7 MAIZY \u00b7 STOP THE JOB'; }
    else { if (mSide !== 'walk' && md < 2.6) return 'TALK \u00b7 MAIZY'; if (K.atHiring(P)) return 'NOW HIRING \u00b7 FIND THE CALF'; }
    if (nearCar(P) >= 0) return 'PULL \u00b7 CARROT'; if (nearEar(P) >= 0) return 'PICK \u00b7 SWEET CORN'; return null; }
  function talk(P) { if (!inLot(P)) return false; const md = dist(P, maizy.position.x, maizy.position.z);
    if (J) { if (CALF.st === 'lost' && dist(P, CALF.x, CALF.z) < 2.2) { CALF.st = 'follow'; CALF.trail = [[P.x, P.z]]; moo.visible = false; mooS(1); toast('BUTTONS FOLLOWS YOU \u00b7 TO THE PEN!', 2.2); return true; }
      if (mSide !== 'walk' && md < 2.6) { jobEnd(true); return true; } }
    else { if (mSide !== 'walk' && md < 2.6) { tone(1320, 0.05, 0.5); if (danger) { sayTo(TG(), [l('Not now, sugar! Bandits in the corn! Run them off and chowder\u2019s on me.')]); return true; } menu(); return true; }
      if (K.atHiring(P)) { tone(1320, 0.05, 0.5); jobAsk(); return true; } }
    const ci = nearCar(P); if (ci >= 0) { pullCarrot(ci, P); return true; } const ei = nearEar(P); if (ei >= 0) { pickEar(ei, P); return true; } return false; }
  const API = { group: G, tick, camFix, prompt, talk, busy: () => null, toast: () => (toastT > 0 ? toastTxt : ''), quit: () => jobEnd(true), useItem: () => false, maizy, CALF, SEG, EARS, CARS, FEN, CRATES, HAYS, SCARE, PIGS, K, FARM: FARM_C,
    maze: { wE, wS, MC, MR, cellX, cellZ, EN, EX }, job: () => J, jobStart, jobEnd, danger: () => danger, findCalf: () => { if (CALF.st === 'lost') { CALF.st = 'follow'; CALF.trail = []; } }, dispose() { card.remove(); K.dispose(); } };
  window.__cornfarm = API; return API;
}
