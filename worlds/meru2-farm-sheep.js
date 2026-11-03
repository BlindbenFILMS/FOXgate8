// MERU 2.0 — s170 WOOLLY ACRES [meruPasture] (Ben: "3 farms along the castle path"; farm 3 of 3 = SHEEP + COWS, the OPEN PASTURE farm).
// West of the Castle Path, north of the Russet Orchard (arch at the z -307 wall gap). Layout TOWN2 'farmWoolly' (selfBuilt).
// SHEARING SHED you walk into (front doors E on the farmyard, back door W onto the pasture): shearing stand (the SHEEP SHEARING game),
// wool table, wool bales, wool press, a holding pen, NOW HIRING + BEST SCORES (shopKit). THE PASTURE: 8 sheep (6 on phone) that wander,
// graze and run from you, 2 cows you can MILK (E / TALK), a sheepfold with funnel wings + a swinging gate, a pond + wind pump (landmark),
// a big oak, dry-stone walls + hay + scarecrows (cover, stop shots), a shepherd's hut, breakable fence + crates.
// GUS WOOLLY (shepherd): 6-17 at his stand, else in the shed; runs in when foes come near. Menu: YES, PUT ME TO WORK! (HERD THE SHEEP) ·
// SHEAR THE SHEEP · SELL WOOL (4 G a bale) · SHEPHERD'S PIE (12 G, +60 HP) · WHAT'S OUT THERE? · GOODBYE.
// JOB HERD THE SHEEP: walk behind them, they run from you; get them all through the gate into the fold. 90 s.
// SHEEP SHEARING (panel, touch + mouse): drag across the wool of 3 sheep, lift off when she kicks (a nick). Wool bales + stars.
// Test: ?start=pasture · window.__pasture.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { keeperPoser } from '../engine/keeper-poser.js?v=s645';   // s620c jointed keeper body language
export const FARM_W = { key: 'farmWoolly', lot: [-76, -12, -330, -268], barn: [-48, -30, -327, -313], door: [-30, -320], back: [-48, -320], gap: [-9.5, -307], fold: [-34, -22, -296, -284] };
export function buildSheepFarm({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour = () => 12, isMuted = () => false, threat = () => 0 }) {
  const PI = Math.PI, INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', BLUE = '#3d5a73', SLATE = '#c9d3d8', SLATED = '#a9b6be', WOOD = '#8b6a48', WOODD = '#5e4329', HAY = '#d9b44a', HAYD = '#b08a2c', DARK = '#3d3b3a', ROOF = '#7d8c96', STONE = '#9a958c', WOOL = '#f4efe4', WOOLD = '#e4ddcc', FACE = '#2b2725';
  const [LX0, LX1, LZ0, LZ1] = FARM_W.lot, [BX0, BX1, BZ0, BZ1] = FARM_W.barn, BCX = (BX0 + BX1) / 2, BCZ = (BZ0 + BZ1) / 2, DZ = FARM_W.door[1], [FX0, FX1, FZ0, FZ1] = FARM_W.fold, GZ0 = -292, GZ1 = -288;
  const G = new THREE.Group(); G.name = 'meruPasture'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), dist = (P, x, z) => Math.hypot(P.x - x, P.z - z), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seed = 9091; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
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
  const R = mk(), RF = mk();   // R = static props · RF = shed roof (hidden inside)
  // sheep-only obstacles: segments + circles (the sheep move by their own rules)
  const SSEG = [], SCIR = [];
  const sseg = (ax, az, bx, bz) => { const s = [ax, az, bx, bz]; SSEG.push(s); return s; };
  const wallRect = (x0, x1, z0, z1) => { sseg(x0, z0, x1, z0); sseg(x1, z0, x1, z1); sseg(x1, z1, x0, z1); sseg(x0, z1, x0, z0); };
  // ================= ground =================
  const decal = (w, d, x, z, draw, rep = 3) => { const t = CT(128, 128, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -PI / 2; m.position.set(x, 0.07, z); G.add(m); return m; };
  const dirt = (g, w) => { g.fillStyle = '#9a7a58'; g.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { g.fillStyle = ['#8a6a48', '#a8886a', '#7a5e40', '#b39270'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 3, 3); } };
  decal(BX1 - BX0 + 0.6, BZ1 - BZ0 + 0.6, BCX, BCZ, (g, w) => { g.fillStyle = '#9b8a72'; g.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#8a7a62' : '#a8977e'; g.fillRect(0, i * 16, w, 15); } }, 2.5);   // shed floor boards
  decal(18, 26, -21.5, -313, dirt, 3);   // farmyard
  { const [ax, az] = FARM_W.gap, bx = BX1, bz = DZ, L = Math.hypot(ax - bx, az - bz), m = decal(2.8, L, (ax + bx) / 2, (az + bz) / 2, dirt, 3); m.rotation.z = Math.atan2(ax - bx, az - bz); m.position.y = 0.075; }
  decal(FX1 - FX0, FZ1 - FZ0, (FX0 + FX1) / 2, (FZ0 + FZ1) / 2, (g, w) => { g.fillStyle = '#8f8a58'; g.fillRect(0, 0, w, w); for (let i = 0; i < 240; i++) { g.fillStyle = ['#7d7a48', '#a09a62', '#6f8a3e', '#8a7a52'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 3, 3); } }, 3).position.y = 0.072;   // trodden fold
  // ================= THE SHEARING SHED (corrugated, pitched roof, ridge E-W, sliding doors E, back door W) =================
  const EAVE = 4.0, RIDGE = 6.4, HW = (BZ1 - BZ0) / 2;
  { const bm = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), W = mk();
    const gable = (x, holeW, holeH) => { const s = new THREE.Shape(); s.moveTo(-HW, 0); s.lineTo(HW, 0); s.lineTo(HW, EAVE); s.lineTo(0, RIDGE); s.lineTo(-HW, EAVE); s.lineTo(-HW, 0);
      const h = new THREE.Path(); h.moveTo(-holeW / 2, 0.01); h.lineTo(holeW / 2, 0.01); h.lineTo(holeW / 2, holeH); h.lineTo(-holeW / 2, holeH); h.lineTo(-holeW / 2, 0.01); s.holes.push(h);
      W.put(new THREE.ShapeGeometry(s), x, 0, BCZ, SLATE, PI / 2); };
    gable(BX1, 5, 4.0); gable(BX0, 3, 3.2);
    for (const z of [BZ0, BZ1]) { W.box(BX1 - BX0, EAVE, 0.3, SLATE, BCX, EAVE / 2, z); W.box(BX1 - BX0 + 0.1, 0.22, 0.36, BLUE, BCX, EAVE - 0.11, z); W.box(BX1 - BX0 + 0.1, 0.5, 0.36, SLATED, BCX, 0.25, z); }
    for (const x of [BX0, BX1]) { W.box(0.36, EAVE, 0.24, BLUE, x, EAVE / 2, BZ0 + 0.12); W.box(0.36, EAVE, 0.24, BLUE, x, EAVE / 2, BZ1 - 0.12); }
    for (let x = BX0 + 0.5; x < BX1; x += 0.6) for (const z of [BZ0, BZ1]) W.box(0.07, EAVE - 0.7, 0.34, SLATED, x, EAVE / 2 + 0.1, z);   // corrugation ribs
    for (const sx of [BX0, BX1]) { const o = sx === BX0 ? -0.17 : 0.17, a = Math.atan2(RIDGE - EAVE, HW); for (const s of [-1, 1]) W.box(0.08, 0.22, Math.hypot(HW, RIDGE - EAVE), BLUE, sx + o, (EAVE + RIDGE) / 2, BCZ + s * HW / 2, 0, s * a); }
    const PANES = []; for (const z of [BZ0, BZ1]) for (const x of [BX0 + 3.5, BCX, BX1 - 3.5]) { const o = z === BZ0 ? -0.17 : 0.17; W.box(1.6, 1.1, 0.08, BLUE, x, 2.6, z + o); PANES.push([x, 2.6, z + o * 1.2]); }
    W.mesh(G, bm); G.userData.panes = PANES;
    for (const s of [-1, 1]) { R.box(0.12, 4.0, 2.6, BLUE, BX1 + 0.3, 2.0, DZ + s * 3.8); for (const y of [0.4, 3.6]) R.box(0.16, 0.14, 2.6, PAPER, BX1 + 0.36, y, DZ + s * 3.8); for (let k = 0; k < 5; k++) R.box(0.14, 3.0, 0.05, '#2f4658', BX1 + 0.37, 2.0, DZ + s * 3.8 - 1.0 + k * 0.5); }
    R.box(0.2, 0.2, 10.4, DARK, BX1 + 0.42, 4.15, DZ);
    for (const s of [-1, 1]) R.box(0.12, 3.2, 1.6, BLUE, BX0 - 0.3, 1.6, DZ + s * 2.4);
    rect(BX0, BX1, BZ0 - 0.18, BZ0 + 0.18); rect(BX0, BX1, BZ1 - 0.18, BZ1 + 0.18);
    rect(BX1 - 0.18, BX1 + 0.18, BZ0, DZ - 2.5); rect(BX1 - 0.18, BX1 + 0.18, DZ + 2.5, BZ1); rect(BX0 - 0.18, BX0 + 0.18, BZ0, DZ - 1.5); rect(BX0 - 0.18, BX0 + 0.18, DZ + 1.5, BZ1);
    wallRect(BX0 - 0.3, BX1 + 0.3, BZ0 - 0.3, BZ1 + 0.3);
    const slab = (z0, y0, z1, y1) => { const L = Math.hypot(z1 - z0, y1 - y0), a = Math.atan2(y1 - y0, z1 - z0); RF.box(BX1 - BX0 + 0.8, 0.16, L + 0.12, ROOF, BCX, (y0 + y1) / 2 + 0.08, (z0 + z1) / 2, 0, -a);
      for (let x = BX0 - 0.2; x <= BX1 + 0.2; x += 0.8) RF.box(0.06, 0.05, L + 0.1, '#6c7a84', x, (y0 + y1) / 2 + 0.18, (z0 + z1) / 2, 0, -a); };
    slab(BZ0 - 0.5, EAVE - 0.25, BCZ, RIDGE); slab(BZ1 + 0.5, EAVE - 0.25, BCZ, RIDGE);
    RF.box(BX1 - BX0 + 0.9, 0.22, 0.5, BLUE, BCX, RIDGE + 0.12, BCZ);
    for (const x of [BCX - 4, BCX + 4]) { RF.box(1.0, 0.7, 1.0, SLATED, x, RIDGE + 0.45, BCZ); RF.box(1.3, 0.1, 1.3, BLUE, x, RIDGE + 0.85, BCZ); }   // roof vents
    plane(board('SHEARING SHED', 'WOOLLY ACRES \u00b7 SINCE 1924', BLUE, PAPER, YEL, 1024, 200), 4.6, 0.9, BX1 + 0.2, 4.75, DZ, PI / 2); }
  const roofM = RF.mesh(G);
  // ================= shed inside: shearing stand (the place of action, straight in from the door), wool table, bales, press, holding pen =================
  const STANDP = [BX0 + 8.0, DZ];   // the board the sheep stands on
  { const [sx, sz] = STANDP; R.box(2.4, 0.3, 2.4, WOOD, sx, 0.15, sz); R.box(2.5, 0.06, 2.5, WOODD, sx, 0.31, sz); for (let i = 0; i < 6; i++) R.box(0.04, 0.02, 2.4, '#6e5236', sx - 1.0 + i * 0.4, 0.34, sz);
    rect(sx - 1.2, sx + 1.2, sz - 1.2, sz + 1.2);
    R.box(0.14, 3.6, 0.14, DARK, sx - 1.4, 1.8, sz - 1.3); R.box(2.6, 0.12, 0.12, DARK, sx - 0.2, 3.6, sz - 1.3); ring(sx - 1.4, sz - 1.3, 0.12);
    R.box(0.4, 0.5, 0.4, BLUE, sx + 0.6, 3.3, sz - 1.3); R.cyl(0.03, 0.03, 1.6, DARK, sx + 0.6, 2.25, sz - 1.0, 6, 0.3); R.box(0.12, 0.14, 0.3, '#8a8f97', sx + 0.6, 1.5, sz - 0.6); R.box(0.14, 0.04, 0.12, PAPER, sx + 0.6, 1.42, sz - 0.42);
    plane(board('SHEARING STAND', 'WALK UP \u00b7 SHEAR THE SHEEP', YEL, INK, BLUE, 1024, 200), 1.4, 0.27, sx - 1.32, 2.4, sz + 0.2, PI / 2); }
  // wool table (slatted) + Gus's spot inside
  { const tx = BX0 + 4.4, tz = BZ0 + 2.6; R.box(3.2, 0.08, 1.6, WOOD, tx, 0.95, tz); for (let i = 0; i < 9; i++) R.box(0.06, 0.04, 1.6, WOODD, tx - 1.5 + i * 0.375, 1.0, tz); for (const dx of [-1.5, 1.5]) for (const dz of [-0.7, 0.7]) R.box(0.1, 0.95, 0.1, WOODD, tx + dx, 0.47, tz + dz);
    for (let i = 0; i < 4; i++) R.sph(0.3, i % 2 ? WOOL : WOOLD, tx - 0.9 + i * 0.6, 1.2, tz + (i % 2) * 0.2, 0.55); rect(tx - 1.6, tx + 1.6, tz - 0.8, tz + 0.8); }
  // wool bales along the north wall
  { for (let i = 0; i < 6; i++) { const x = BX1 - 1.4 - i * 1.25, y = i % 3 === 2 ? 1.1 : 0; R.box(1.1, 1.05, 0.95, '#e8e0cc', x, 0.53, BZ0 + 0.85); R.box(1.12, 0.06, 0.97, '#8a7a62', x, 0.75, BZ0 + 0.85); if (y) R.box(1.1, 1.05, 0.95, '#e8e0cc', x + 0.6, 1.6, BZ0 + 0.85); }
    rect(BX1 - 8.4, BX1 - 0.8, BZ0 + 0.3, BZ0 + 1.4);
    plane(board('WOOL', 'WOOLLY ACRES \u00b7 GRADE A', PAPER, INK, BLUE, 512, 200), 0.9, 0.35, BX1 - 1.4, 0.55, BZ0 + 1.34, 0); }
  // wool press (south-west corner) + holding pen (south wall) with 2 sheep waiting
  { const px = BX0 + 1.3, pz = BZ1 - 1.4; R.box(1.2, 2.0, 1.2, WOODD, px, 1.0, pz); R.box(1.0, 1.6, 1.0, '#7a5a3a', px, 0.9, pz); R.box(0.1, 0.1, 1.6, DARK, px, 2.3, pz); R.box(0.08, 1.2, 0.08, DARK, px, 2.6, pz + 0.7, 0, 0.6); rect(px - 0.7, px + 0.7, pz - 0.7, pz + 0.7);
    const x0 = BX0 + 3.0, x1 = BX0 + 7.5, z0 = BZ1 - 2.6; for (const y of [0.4, 0.8]) { R.box(x1 - x0, 0.08, 0.06, WOOD, (x0 + x1) / 2, y, z0); R.box(0.06, 0.08, 2.4, WOOD, x1, y, (z0 + BZ1) / 2); }
    for (let x = x0; x <= x1 + 0.01; x += 1.5) R.box(0.1, 1.0, 0.1, WOODD, x, 0.5, z0); R.box(0.1, 1.0, 0.1, WOODD, x1, 0.5, BZ1 - 0.3);
    rect(x0, x1, z0 - 0.1, z0 + 0.1); rect(x1 - 0.1, x1 + 0.1, z0, BZ1); }
  for (const [x, z] of [[BX1 - 4.5, DZ], [BX0 + 4.5, DZ]]) { R.box(0.02, 1.2, 0.02, INK, x, 3.6, z); R.box(0.22, 0.32, 0.22, '#ffd38a', x, 2.9, z); R.box(0.26, 0.05, 0.26, INK, x, 3.08, z); }
  // ================= farmyard: Gus's stand, trough, the arch =================
  const STAND = [-19, -303];
  { const [sx, sz] = STAND; R.box(2.6, 0.9, 1.0, WOOD, sx, 0.45, sz); R.box(2.7, 0.08, 1.1, WOODD, sx, 0.92, sz); for (const dx of [-1.25, 1.25]) for (const dz of [-0.45, 0.45]) R.box(0.1, 2.4, 0.1, WOODD, sx + dx, 1.2, sz + dz);
    for (let i = 0; i < 7; i++) R.box(0.4, 0.04, 1.3, i % 2 ? PAPER : BLUE, sx - 1.2 + i * 0.4, 2.45, sz + 0.05, 0, 0.18);
    for (let i = 0; i < 3; i++) R.sph(0.28, i === 1 ? WOOLD : WOOL, sx - 0.8 + i * 0.8, 1.16, sz + 0.1, 0.6);
    for (let i = 0; i < 4; i++) { R.cyl(0.08, 0.09, 0.3, PAPER, sx + 0.7 + (i % 2) * 0.22, 1.11, sz - 0.25 + Math.floor(i / 2) * 0.2, 8); R.cyl(0.04, 0.04, 0.05, BLUE, sx + 0.7 + (i % 2) * 0.22, 1.29, sz - 0.25 + Math.floor(i / 2) * 0.2, 6); }
    rect(sx - 1.35, sx + 1.35, sz - 0.55, sz + 0.55); wallRect(sx - 1.4, sx + 1.4, sz - 0.6, sz + 0.6);
    plane(board('GUS\u2019S WOOL + MILK', 'I BUY BALES \u00b7 PIE BY THE SLICE', BLUE, PAPER, YEL, 1024, 200), 2.4, 0.46, sx, 1.75, sz - 0.56, PI);
    R.cyl(0.03, 0.03, 1.9, WOODD, sx + 1.55, 0.95, sz - 0.5, 6, 0, -0.12); R.put(new THREE.TorusGeometry(0.16, 0.03, 6, 10, PI), sx + 1.67, 1.95, sz - 0.5, WOODD, 0, 0, 0.3); }   // Gus's crook
  { const [gx, gz] = FARM_W.gap; for (const s of [-1, 1]) R.box(0.3, 4.4, 0.3, WOODD, gx - 0.6, 2.2, gz + s * 2.8); R.box(0.4, 0.4, 6.2, WOODD, gx - 0.6, 4.4, gz);
    plane(board('WOOLLY ACRES', 'SHEEP \u00b7 COWS \u00b7 SHEARING \u00b7 GUS WOOLLY', BLUE, PAPER, YEL, 1024, 200), 4.4, 0.85, gx - 0.38, 3.75, gz, PI / 2);
    plane(board('WOOLLY ACRES', 'SHUT THE FOLD GATE', BLUE, PAPER, YEL, 1024, 200), 4.4, 0.85, gx - 0.82, 3.75, gz, -PI / 2);
    for (let i = 0; i < 3; i++) R.sph(0.2, WOOL, gx - 0.6, 4.75, gz - 1.2 + i * 1.2, 0.8); }
  // ================= THE SHEEPFOLD (rails, funnel wings out into the pasture, a swinging gate on the west side) =================
  const rail = (ax, az, bx, bz, solid = true) => { const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az); for (const y of [0.45, 0.95]) R.box(0.08, 0.12, L, '#efe6d2', (ax + bx) / 2, y, (az + bz) / 2, ry);
    const n = Math.max(1, Math.round(L / 2.2)); for (let i = 0; i <= n; i++) R.box(0.16, 1.15, 0.16, WOODD, ax + (bx - ax) * i / n, 0.575, az + (bz - az) * i / n);
    if (solid) { const m = Math.max(1, Math.ceil(L / 0.6)); for (let i = 0; i < m; i++) { const u = (i + 0.5) / m, x = ax + (bx - ax) * u, z = az + (bz - az) * u; rect(x - 0.3, x + 0.3, z - 0.3, z + 0.3).f && 0; } } sseg(ax, az, bx, bz); };
  rail(FX0, FZ0, FX1, FZ0); rail(FX1, FZ0, FX1, FZ1); rail(FX1, FZ1, FX0, FZ1); rail(FX0, FZ0, FX0, GZ0); rail(FX0, GZ1, FX0, FZ1);
  const WINGS = [[FX0, GZ0, FX0 - 6.5, GZ0 - 5.5], [FX0, GZ1, FX0 - 6.5, GZ1 + 5.5]]; for (const w of WINGS) rail(...w);
  R.box(2.2, 0.5, 0.7, '#7a8a96', -24.4, 0.25, -294.8); R.box(2.0, 0.04, 0.5, '#5aa8c8', -24.4, 0.48, -294.8); rect(-25.5, -23.3, -295.2, -294.4);
  plane(board('THE FOLD', 'GUS COUNTS THEM IN', PAPER, INK, BLUE, 512, 200), 1.2, 0.47, (FX0 + FX1) / 2, 1.45, FZ1 + 0.07, 0);
  const gate = new THREE.Group(); gate.position.set(FX0, 0, GZ0); G.add(gate); { const Gm = mk(); for (const y of [0.35, 0.7, 1.05]) Gm.box(0.07, 0.1, 4.0, PAPER, 0, y, 2.0); for (const z of [0.05, 2.0, 3.95]) Gm.box(0.1, 1.15, 0.1, BLUE, 0, 0.6, z); Gm.box(0.06, 0.1, 4.4, BLUE, 0, 0.7, 2.0, 0, 0.5); Gm.mesh(gate); }
  const GATE_OPEN = Math.atan2(-6.5, -5.5); let gateA = GATE_OPEN, gateWant = GATE_OPEN; gate.rotation.y = gateA;
  const gateCol = rect(FX0 - 0.12, FX0 + 0.12, GZ0, GZ1); gateCol.on = false; const gateSeg = [FX0, GZ0, FX0, GZ1];
  // ================= pasture: pond + wind pump, the big oak, dry-stone walls, shepherd's hut, hay feeder =================
  const POND = [-60, -284, 4.2];
  { const [px, pz, pr] = POND, w = new THREE.Mesh(new THREE.CircleGeometry(pr, 28), new THREE.MeshLambertMaterial({ color: '#5a9ab8' })); w.rotation.x = -PI / 2; w.position.set(px, 0.06, pz); G.add(w);
    const sh = new THREE.Mesh(new THREE.RingGeometry(pr, pr + 0.7, 28), new THREE.MeshLambertMaterial({ color: '#7a6a4a' })); sh.rotation.x = -PI / 2; sh.position.set(px, 0.065, pz); G.add(sh);
    for (let i = 0; i < 22; i++) { const a = i / 22 * PI * 2 + rnd() * 0.2; R.box(0.5 + rnd() * 0.3, 0.25, 0.4, ['#8f8a80', '#a8a296', '#7d786e'][i % 3], px + Math.cos(a) * (pr + 0.35), 0.12, pz + Math.sin(a) * (pr + 0.35), -a); }
    for (let i = 0; i < 18; i++) { const a = 2.2 + rnd() * 1.6, r = pr - 0.3 - rnd() * 0.4; R.box(0.05, 0.8 + rnd() * 0.6, 0.05, i % 3 ? '#4f7e28' : '#6e9a38', px + Math.cos(a) * r, 0.5, pz + Math.sin(a) * r, 0, (rnd() - 0.5) * 0.3); if (i % 4 === 0) R.box(0.07, 0.2, 0.07, '#6a4a30', px + Math.cos(a) * r, 1.2, pz + Math.sin(a) * r); }
    ring(px, pz, pr - 0.2); SCIR.push([px, pz, pr + 0.4]); }
  const fan = new THREE.Group(), WP = [-66, -280.5];
  { const [wx, wz] = WP, H = 8.2; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { R.box(0.12, H, 0.12, '#7a7f86', wx + sx * 0.9, H / 2, wz + sz * 0.9, 0, sz * 0.1, -sx * 0.1); ring(wx + sx * 1.2, wz + sz * 1.2, 0.15); }
    for (let k = 0; k < 4; k++) { const y = 1.5 + k * 1.7, w = 2.0 - k * 0.4; for (const s of [-1, 1]) { R.box(w, 0.06, 0.06, '#7a7f86', wx, y, wz + s * w / 2); R.box(0.06, 0.06, w, '#7a7f86', wx + s * w / 2, y, wz); } }
    R.box(0.5, 0.4, 0.5, DARK, wx, H + 0.1, wz); R.box(2.4, 0.08, 0.08, DARK, wx - 1.2, H + 0.2, wz); R.box(0.05, 1.0, 1.4, RED, wx - 2.4, H + 0.3, wz, 0, 0, 0);
    R.cyl(0.08, 0.08, H, '#6a6f76', wx, H / 2, wz, 6); R.box(0.9, 0.9, 0.9, '#6a6f76', wx + 1.6, 0.45, wz + 1.6); R.box(1.0, 0.06, 1.0, '#5aa8c8', wx + 1.6, 0.92, wz + 1.6); rect(wx + 1.1, wx + 2.1, wz + 1.1, wz + 2.1);
    fan.position.set(wx + 0.5, H + 0.25, wz); G.add(fan); const F = mk(); F.cyl(0.18, 0.18, 0.2, DARK, 0, 0, 0, 10, 0, PI / 2);
    for (let i = 0; i < 16; i++) { const a = i / 16 * PI * 2; F.box(0.03, 0.9, 0.22, i % 4 ? '#c9cdd2' : RED, 0, Math.cos(a) * 0.7, Math.sin(a) * 0.7, 0, -a, 0); } F.put(new THREE.TorusGeometry(1.15, 0.03, 4, 24), 0, 0, 0, DARK, PI / 2); F.mesh(fan);
    plane(board('WOOLLY ACRES', '', BLUE, PAPER, YEL, 512, 128), 1.4, 0.35, wx + 0.97, 1.5, wz, PI / 2); }
  const OAK = [-50, -300];
  { const [ox, oz] = OAK; R.cyl(0.45, 0.7, 4.0, '#6a4a30', ox, 2.0, oz, 10); for (const [a, l] of [[0.6, 2.4], [2.4, 2.0], [4.1, 2.2]]) R.box(0.3, 0.3, l, '#6a4a30', ox + Math.cos(a) * l / 2, 3.8, oz + Math.sin(a) * l / 2, -a + PI / 2, 0.5);
    for (const [dx, dy, dz, r] of [[0, 5.6, 0, 2.8], [1.8, 5.0, 0.8, 2.0], [-1.7, 5.1, -0.6, 2.1], [0.4, 4.8, -1.9, 1.9], [-0.6, 4.9, 1.9, 1.9], [0.2, 6.8, 0.2, 1.8]]) R.sph(r, ['#3f6b3a', '#4a7a3e', '#356030'][Math.abs(Math.round(dx * 3)) % 3], ox + dx, dy, oz + dz, 0.8);
    ring(ox, oz, 0.7); SCIR.push([ox, oz, 1.2]); }
  const STONEW = [[-71, -306, -58, -306], [-58, -274, -44, -274.5]];
  for (const [ax, az, bx, bz] of STONEW) { const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), n = Math.round(L / 0.55);
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const u = (i + 0.5 + (k % 2) * 0.3) / n, x = ax + (bx - ax) * Math.min(u, 0.995), z = az + (bz - az) * Math.min(u, 0.995); R.box(0.62, 0.32, 0.7 - k * 0.1, ['#9a958c', '#8a857c', '#aaa59a', '#7f7a72'][(i + k) % 4], x, 0.17 + k * 0.3, z, ry + (rnd() - 0.5) * 0.15); }
    R.box(0.4, 0.12, L, '#6f8a3e', (ax + bx) / 2, 0.98, (az + bz) / 2, ry);
    const m = Math.ceil(L / 0.8); for (let i = 0; i < m; i++) { const u = (i + 0.5) / m, x = ax + (bx - ax) * u, z = az + (bz - az) * u; rect(x - 0.42, x + 0.42, z - 0.42, z + 0.42); } sseg(ax, az, bx, bz); }
  const HUT = [-69.5, -322.5];
  { const [hx, hz] = HUT; R.box(3.4, 1.9, 1.9, '#4f6b4a', hx, 1.55, hz); for (let i = 0; i < 9; i++) R.box(0.04, 1.8, 1.92, '#40583c', hx - 1.6 + i * 0.4, 1.55, hz);
    { const g = new THREE.CylinderGeometry(1.15, 1.15, 3.6, 16, 1, false, 0, PI); R.put(g, hx, 2.4, hz, '#3a3f44', 0, 0, PI / 2); }
    R.box(0.08, 1.4, 0.8, '#2f4658', hx + 1.72, 1.35, hz); R.box(0.06, 0.6, 0.6, '#ffd38a', hx, 1.8, hz - 0.96); for (const s of [-1, 1]) for (const t of [-1, 1]) { R.cyl(0.38, 0.38, 0.12, DARK, hx + s * 1.2, 0.4, hz + t * 0.98, 12, PI / 2); }
    for (let i = 0; i < 3; i++) R.box(0.4, 0.06, 0.7, WOOD, hx + 2.05 + i * 0.3, 0.55 - i * 0.18, hz); R.cyl(0.06, 0.06, 0.8, DARK, hx - 0.8, 3.7, hz + 0.3, 6);
    rect(hx - 1.8, hx + 1.8, hz - 1.05, hz + 1.05); wallRect(hx - 1.9, hx + 2.6, hz - 1.15, hz + 1.15); }
  { const fx = -56, fz = -292; R.box(2.2, 0.15, 0.9, WOODD, fx, 0.45, fz); for (let i = 0; i < 9; i++) R.box(0.05, 0.9, 0.05, WOODD, fx - 1.0 + i * 0.25, 0.95, fz, 0, 0, 0); R.box(2.0, 0.6, 0.6, HAY, fx, 0.9, fz); R.put(new THREE.ConeGeometry(1.5, 0.5, 4), fx, 1.65, fz, '#5e4329', PI / 4, 0, 0, 1, 1, 0.55);
    for (const s of [-1, 1]) R.box(0.12, 1.5, 0.12, WOODD, fx + s * 1.05, 0.75, fz); rect(fx - 1.15, fx + 1.15, fz - 0.5, fz + 0.5); wallRect(fx - 1.2, fx + 1.2, fz - 0.55, fz + 0.55); }
  // ================= split-rail fence round the pasture (every section breaks) =================
  const FEN = []; const fenceRun = (x0, z0, x1, z1, gaps = []) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, ax = x0 + (x1 - x0) * u0, az = z0 + (z1 - z0) * u0, bx = x0 + (x1 - x0) * u1, bz = z0 + (z1 - z0) * u1, mx = (ax + bx) / 2, mz = (az + bz) / 2;
      if (gaps.some(([g0, g1]) => { const c = x0 === x1 ? mz : mx; return c > g0 && c < g1; })) continue;
      FEN.push({ ax, az, bx, bz, x: mx, z: mz, ry, len: L / n, hp: 1, broken: false, t: 0, col: rect(Math.min(ax, bx) - 0.08, Math.max(ax, bx) + 0.08, Math.min(az, bz) - 0.08, Math.max(az, bz) + 0.08) }); } };
  fenceRun(LX0, LZ1, LX1 - 0.5, LZ1, [[-51, -45]]); fenceRun(LX0, LZ0 + 0.5, LX0, LZ1, [[-322, -318]]); fenceRun(LX0, LZ0 + 0.5, LX1 - 0.5, LZ0 + 0.5, [[-62, -56]]);
  const postI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1.15, 0.16).translate(0, 0.575, 0), lam(WOODD), FEN.length), railI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.12, 1), lam(WOOD), FEN.length * 2);
  const M4 = new THREE.Matrix4(), Qn = new THREE.Quaternion(), Z0 = new THREE.Matrix4().makeScale(0, 0, 0);
  const syncFence = (f, i) => { if (f.broken) { postI.setMatrixAt(i, Z0); railI.setMatrixAt(i * 2, Z0); railI.setMatrixAt(i * 2 + 1, Z0); }
    else { const q = Qn.setFromAxisAngle(V(0, 1, 0), f.ry); M4.compose(V(f.ax, 0, f.az), q, V(1, 1, 1)); postI.setMatrixAt(i, M4); for (const [k, y] of [[0, 0.45], [1, 0.95]]) { M4.compose(V(f.x, y, f.z), q, V(1, 1, f.len)); railI.setMatrixAt(i * 2 + k, M4); } }
    postI.instanceMatrix.needsUpdate = railI.instanceMatrix.needsUpdate = true; f.col.on = !f.broken; };
  FEN.forEach(syncFence); for (const m of [postI, railI]) { m.frustumCulled = false; G.add(m); }
  // ================= cover: hay + scarecrows =================
  const HAYS = [], SCARE = [];
  const roundBale = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const B = mk(); B.cyl(0.78, 0.78, 1.25, HAY, 0, 0.78, 0, 16, 0, PI / 2); for (const s of [-1, 1]) B.cyl(0.62, 0.62, 0.02, HAYD, s * 0.63, 0.78, 0, 16, 0, PI / 2); for (const s of [-0.3, 0.3]) B.cyl(0.8, 0.8, 0.05, BLUE, s, 0.78, 0, 16, 0, PI / 2); B.mesh(g); G.add(g);
    HAYS.push({ g, x, z, r: 0.95, t: 0 }); rect(x - 0.8, x + 0.8, z - 0.8, z + 0.8); SCIR.push([x, z, 1.25]); };
  const squareStack = (x, z, ry, n = 3) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const B = mk(); const L = [[0, 0, 0], [0, 0, 0.62], [0, 0.5, 0.31], [1.25, 0, 0.31]].slice(0, n + 1);
    for (const [ox, oy, oz] of L) { B.box(1.2, 0.5, 0.6, HAY, ox, 0.25 + oy, oz); for (const s of [-0.3, 0.3]) B.box(0.03, 0.51, 0.61, BLUE, ox + s, 0.25 + oy, oz); } B.mesh(g); G.add(g); HAYS.push({ g, x, z, r: n > 2 ? 1.25 : 0.9, t: 0 });
    const w = n > 2 ? 1.6 : 0.7, rot = Math.abs(Math.sin(ry)) > 0.7; if (rot) rect(x - 0.8, x + 0.8, z - w, z + w); else rect(x - w, x + w, z - 0.8, z + 0.8); SCIR.push([x, z, 1.7]); };
  for (const [x, z, ry] of [[-39, -277, 0.3], [-69, -313.5, 1.1], [-55, -325.5, 0.4], [-25.5, -326.5, 1.4], [-44.5, -307.5, 2.0]]) roundBale(x, z, ry);
  for (const [x, z, ry] of [[-15.5, -322.5, PI / 2], [-60, -298.5, 0]]) squareStack(x, z, ry);
  const scarecrow = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); const sw = new THREE.Group(); g.add(sw); const S = mk();
    S.box(0.12, 2.6, 0.12, WOODD, 0, 1.3, 0); S.box(1.9, 0.1, 0.1, WOODD, 0, 1.9, 0); S.box(0.6, 0.8, 0.36, '#5a6a8a', 0, 1.65, 0); for (let i = 0; i < 3; i++) S.box(0.61, 0.04, 0.37, '#3a4a6a', 0, 1.35 + i * 0.25, 0); S.box(0.07, 0.8, 0.37, '#3a4a6a', 0, 1.65, 0);
    for (const s of [-1, 1]) { S.box(0.7, 0.2, 0.22, '#b8392b', s * 0.62, 1.88, 0); for (let i = 0; i < 4; i++) S.box(0.04, 0.22, 0.04, HAY, s * 0.98, 1.74, -0.08 + i * 0.05); }
    S.box(0.5, 0.55, 0.36, '#6a5a3a', 0, 1.05, 0); for (let i = 0; i < 6; i++) S.box(0.04, 0.24, 0.04, HAY, -0.2 + i * 0.08, 0.72, 0.02);
    S.sph(0.3, '#d8c49a', 0, 2.35, 0); S.box(0.08, 0.08, 0.02, INK, -0.1, 2.42, 0.29); S.box(0.08, 0.08, 0.02, INK, 0.1, 2.42, 0.29); S.box(0.22, 0.03, 0.02, INK, 0, 2.27, 0.29);
    S.cyl(0.32, 0.32, 0.05, '#4a4a4a', 0, 2.58, 0, 14); S.cyl(0.26, 0.28, 0.1, '#4a4a4a', 0, 2.63, 0, 12); S.box(0.3, 0.03, 0.2, '#4a4a4a', 0, 2.6, 0.3); S.mesh(sw);
    SCARE.push({ g, sw, x, z, r: 0.55, k: 0, v: 0 }); ring(x, z, 0.35); SCIR.push([x, z, 0.6]); };
  for (const [x, z, ry] of [[-27, -279, 0.6], [-66, -295.5, -0.4]]) scarecrow(x, z, ry);
  // ================= breakable crate stacks (loot) =================
  const CRATES = [];
  const crateStack = (x, z, n) => { const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g); const B = mk(); for (let i = 0; i < n; i++) { const ox = i === 2 ? 0.38 : (i % 2) * 0.76 - 0.38, oy = i === 2 ? 0.5 : 0; B.box(0.72, 0.48, 0.52, '#b88a5c', ox, oy + 0.24, 0); B.box(0.74, 0.06, 0.54, WOODD, ox, oy + 0.42, 0); B.box(0.74, 0.06, 0.54, WOODD, ox, oy + 0.06, 0); }
    B.mesh(g); CRATES.push({ g, x, z, hp: 2, broken: false, t: 0, shake: 0, col: rect(x - 0.8, x + 0.8, z - 0.3, z + 0.3) }); SCIR.push([x, z, 1.0]); };
  for (const [x, z, n] of [[-14, -316, 3], [-28.6, -301.6, 2], [-52.4, -313, 3], [-72, -271.5, 2], [-27, -328.4, 2]]) crateStack(x, z, n);
  // ================= debris + pops =================
  const DEB = Array.from({ length: touch ? 18 : 30 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.12), lam('#b88a5c')); m.visible = false; G.add(m); return { m, v: V(), t: 0, w: V() }; });
  let debI = 0; const debris = (x, y, z, n, col) => { for (let i = 0; i < n; i++) { const d = DEB[debI++ % DEB.length]; d.m.material.color.set(col || '#b88a5c'); d.m.position.set(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.6); d.v.set((Math.random() - 0.5) * 4, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 4); d.w.set(Math.random() * 9, Math.random() * 9, Math.random() * 9); d.t = 1.6; d.m.visible = true; } };
  const POPS = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12), new THREE.MeshBasicMaterial({ color: YEL })); m.rotation.x = PI / 2; m.visible = false; G.add(m); return { m, t: 0 }; });
  let popI = 0; const pop = (x, z, n, col = YEL) => { for (let i = 0; i < n; i++) { const p = POPS[popI++ % POPS.length]; p.m.material.color.set(col); p.m.position.set(x + (Math.random() - 0.5) * 0.8, 0.8, z + (Math.random() - 0.5) * 0.8); p.t = 1.0 + i * 0.08; p.m.visible = true; } };
  // ================= SHEEP (shared geometry: wool / body + head / leg pairs) =================
  const shM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const WOOLG = (() => { const W = mk(); W.put(new THREE.SphereGeometry(0.46, 10, 8), 0, 0.84, 0, WOOL, 0, 0, 0, 1.35, 0.85, 1.0);
    for (const [x, y, z] of [[0.3, 1.06, 0.16], [-0.26, 1.06, -0.13], [0.04, 1.13, 0], [-0.46, 0.86, 0], [0.36, 0.86, 0.3], [-0.12, 0.8, -0.34], [0.12, 0.8, 0.34], [-0.3, 0.92, 0.26], [0.32, 0.92, -0.28]]) W.sph(0.24, (x * 10 | 0) % 2 ? WOOLD : WOOL, x, y, z);
    W.sph(0.13, WOOL, 0.62, 1.2, 0); return W.geo(); })();
  const BODYG = (() => { const B = mk(); B.put(new THREE.SphereGeometry(0.38, 8, 6), 0, 0.8, 0, '#e9c6b4', 0, 0, 0, 1.3, 0.75, 0.85);
    B.box(0.3, 0.3, 0.26, FACE, 0.62, 1.0, 0); B.box(0.16, 0.18, 0.2, FACE, 0.8, 0.93, 0); for (const s of [-1, 1]) { B.box(0.07, 0.08, 0.2, FACE, 0.58, 1.1, s * 0.2, 0, s * 0.5); B.box(0.03, 0.05, 0.05, PAPER, 0.775, 1.06, s * 0.08); B.box(0.035, 0.03, 0.03, INK, 0.79, 1.06, s * 0.08); }
    B.sph(0.08, WOOL, -0.62, 0.92, 0); return B.geo(); })();
  const LEGG = (() => { const L = mk(); for (const s of [-1, 1]) L.box(0.09, 0.5, 0.09, FACE, 0, -0.25, s * 0.15); return L.geo(); })();
  const sheepMesh = (parent) => { const g = new THREE.Group(), tor = new THREE.Group(); g.add(tor); const body = new THREE.Mesh(BODYG, shM), wool = new THREE.Mesh(WOOLG, shM); tor.add(body); tor.add(wool);
    const lf = new THREE.Group(), lb = new THREE.Group(); lf.position.set(0.26, 0.55, 0); lb.position.set(-0.26, 0.55, 0); lf.add(new THREE.Mesh(LEGG, shM)); lb.add(new THREE.Mesh(LEGG, shM)); g.add(lf); g.add(lb); (parent || G).add(g); return { g, tor, wool, lf, lb }; };
  const NSH = touch ? 6 : 8;
  const SHEEP = Array.from({ length: NSH }, (_, i) => { const m = sheepMesh(); const s = { ...m, x: -66 + (i % 4) * 5 + rnd() * 2, z: -296 + Math.floor(i / 4) * 8 + rnd() * 2, vx: 0, vz: 0, tx: 0, tz: 0, wt: rnd() * 3, graze: 0, ph: i * 1.3, penned: false, shorn: 0, ws: 1, baa: 4 + rnd() * 10 };
    s.tx = s.x; s.tz = s.z; s.g.position.set(s.x, 0, s.z); s.g.rotation.y = rnd() * PI * 2; s.g.scale.setScalar(0.92 + rnd() * 0.16); return s; });
  { const st = sheepMesh(); st.g.position.set(STANDP[0], 0.32, STANDP[1]); st.g.rotation.y = PI / 2 + 0.2; G.userData.standSheep = st;
    for (const [x, z, ry] of [[BX0 + 4.4, BZ1 - 1.2, 0.3], [BX0 + 6.2, BZ1 - 1.5, 2.6]]) { const p = sheepMesh(); p.g.position.set(x, 0, z); p.g.rotation.y = ry; } }
  // ================= COWS: Pudding + Maple (milk them: E / TALK) =================
  const cow = (s, patch) => { const g = new THREE.Group(), C = mk(), W = '#f1ece2'; C.box(1.5, 0.75, 0.7, W, 0, 1.15, 0); for (const [x, y, z, w, h] of [[0.2, 1.3, 0.36, 0.5, 0.4], [-0.4, 1.05, -0.36, 0.4, 0.35], [-0.5, 1.45, 0.0, 0.4, 0.04]]) C.box(w, h, 0.02 + (y > 1.4 ? 0.7 : 0), patch, x, y, z);
    C.box(0.3, 0.12, 0.3, '#e7a6a6', -0.2, 0.74, 0); C.box(0.06, 0.5, 0.06, W, -0.78, 1.05, 0, 0, 0, -0.3); C.box(0.08, 0.14, 0.1, INK, -0.86, 0.78, 0);
    const legs = []; for (const sx of [-0.55, 0.55]) for (const sz of [-0.24, 0.24]) { const l = new THREE.Group(); l.position.set(sx, 0.8, sz); g.add(l); const Lg = mk(); Lg.box(0.16, 0.8, 0.16, W, 0, -0.4, 0); Lg.box(0.17, 0.12, 0.17, INK, 0, -0.74, 0); Lg.mesh(l); legs.push(l); }
    C.mesh(g); const head = new THREE.Group(); head.position.set(0.8, 1.35, 0); g.add(head); const H = mk(); H.box(0.42, 0.42, 0.4, W, 0.14, 0, 0); H.box(0.18, 0.24, 0.36, '#e7a6a6', 0.4, -0.1, 0); H.box(0.03, 0.04, 0.04, INK, 0.5, -0.05, 0.1); H.box(0.03, 0.04, 0.04, INK, 0.5, -0.05, -0.1);
    for (const sd of [-1, 1]) { H.box(0.06, 0.16, 0.06, '#e9dcb8', 0.08, 0.28, sd * 0.16, 0, sd * 0.4); H.box(0.1, 0.06, 0.2, patch, 0.06, 0.12, sd * 0.28); H.box(0.04, 0.05, 0.02, INK, 0.3, 0.08, sd * 0.2); } H.mesh(head);
    { const bell = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), lam(YEL)); bell.position.set(0.9, 0.95, 0); g.add(bell); }
    g.scale.setScalar(s); G.add(g); return { g, legs, head }; };
  const COWS = [['Pudding', '#7a4a2a', -70, -276], ['Maple', '#2a2a2a', -54, -282]].map(([name, patch, x, z]) => { const c = cow(1.0, patch); c.g.position.set(x, 0, z); return { ...c, name, x, z, tx: x, tz: z, wt: rnd() * 5, milkT: 0, moo: 8 + rnd() * 12 }; });
  // ================= light: lanterns, pools at night, glowing shed windows =================
  const radT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, '#ffffff'); r.addColorStop(0.4, '#666666'); r.addColorStop(1, '#000000'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const LAMPS = [[-13.6, -304.4], [-19.4, -310.6], [-25.2, -316.2], [-28.4, -323.4], [-36.4, -297.6], [-20.6, -297.6], [-49, -311.6]], lampM = new THREE.MeshBasicMaterial({ color: '#5a5654' });
  for (const [x, z] of LAMPS) { R.box(0.12, 2.6, 0.12, DARK, x, 1.3, z); R.box(0.5, 0.06, 0.06, DARK, x + 0.2, 2.6, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.22), lampM); m.position.set(x + 0.42, 2.38, z); G.add(m); ring(x, z, 0.12); SCIR.push([x, z, 0.4]); }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.3), lampM); m.position.set(BX1 + 0.35, 4.55, DZ - 3.1); G.add(m); }
  const poolM = new THREE.MeshBasicMaterial({ map: radT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const POOL = [...LAMPS.map(([x, z]) => [x + 0.42, z, 2.8]), [BX1 + 1.4, DZ - 3.1, 3.4], [BX1 - 4.5, DZ, 4.0], [BX0 + 4.5, DZ, 4.0], [HUT[0], HUT[1] - 1.8, 1.8]];
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), poolM, POOL.length); POOL.forEach(([x, z, r], i) => { M4.compose(V(x, 0.1, z), Qn.identity(), V(r * 2, 1, r * 2)); pools.setMatrixAt(i, M4); pools.setColorAt(i, cc.set('#ffcf80').multiplyScalar(0.7)); }); pools.renderOrder = 5; pools.frustumCulled = false; pools.visible = false; G.add(pools);
  const paneM = new THREE.MeshBasicMaterial({ color: '#2e3a46' }); for (const [x, y, z] of G.userData.panes) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), paneM); m.position.set(x, y, z); m.rotation.y = z < BCZ ? PI : 0; G.add(m); }
  R.mesh(G);
  // ================= Gus Woolly + the shop kit =================
  const KPOSE = keeperPoser(THREE, ['hips', 'k_inspect', 'think']); const gus = kit.makeFox({ key: 'farmGus', joints: true, name: 'Gus Woolly', torso: ['#7a6a58', BLUE, '#5a4a38'], outfit: 'coat', mood: 'happy', crest: '', look: { fur: '#b8b0a4', furDark: '#6e665c' } });
  { const P2 = gus.userData.P; if (P2 && P2.sword) P2.sword.visible = false; if (P2 && P2.gun) P2.gun.visible = false;
    if (P2 && P2.head) { const cap = new THREE.Group(); cap.position.set(0, 0.28, 0); P2.head.add(cap); const H = mk(); H.cyl(0.27, 0.29, 0.13, '#5a5048', 0, 0.04, 0, 14); H.box(0.3, 0.035, 0.24, '#4a4038', 0, -0.01, 0.24); H.cyl(0.04, 0.04, 0.03, '#4a4038', 0, 0.12, 0, 6); H.mesh(cap); cap.rotation.x = -0.12; } }
  const IN = [BX0 + 6.4, BZ0 + 2.6, PI / 2], OUT = [STAND[0], STAND[1] + 1.35, PI];
  gus.position.set(IN[0], 0, IN[1]); gus.rotation.y = IN[2]; G.add(gus);
  const GAMES = [{ k: 'herd', name: 'Herd the Sheep', color: BLUE }, { k: 'shear', name: 'Sheep Shearing', color: BLUE }];
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'farmW', color: BLUE, boardTitle: 'Woolly Acres',
    room: { X0: BX0 + 0.3, X1: BX1 - 0.3, Z0: BZ0 + 0.3, Z1: BZ1 - 0.3 }, door: [BX1 - 0.8, DZ], keeper: null, games: GAMES, allGames: GAMES,
    board: { x: BX1 - 9.6, y: 2.4, z: BZ0 + 0.2, ry: 0, w: 1.3 }, hiring: { x: BX1 - 2.2, z: DZ + 3.3, ry: PI / 2 }, hiringLine: 'WALK UP \u00b7 HERD THE SHEEP',
    sun: [{ x: BX1 - 3.5, z: BZ1 - 1.6, w: 1.8, d: 1.2 }, { x: BCX, z: BZ1 - 1.6, w: 1.8, d: 1.2 }, { x: BX1 - 3.0, z: DZ, w: 3.4, d: 2.6 }],
    lamps: [[BX1 - 4.5, 2.9, DZ], [BX0 + 4.5, 2.9, DZ]], browse: [[BX1 - 4.6, BZ0 + 2.0, PI], [BX0 + 4.4, BZ0 + 4.2, PI], [BX0 + 5.2, BZ1 - 3.4, 0]],
    clock: { x: BX1 - 12.4, y: 3.1, z: BZ0 + 0.2, ry: 0 } });
  // ================= sound + toast + card =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.4) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2 = 0) => { if (isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, crack = () => { tone(180, 0.08, 0.15, 'square'); tone(90, 0.06, 0.25, 'triangle', 0.03); };
  const baaS = (k = 1, hi = false) => { const f = hi ? 520 : 380; for (let i = 0; i < 3; i++) tone(f + i * 6, 0.04 * k, 0.16, 'sawtooth', i * 0.09, f * 0.92); };
  const mooS = (k = 1) => { tone(120, 0.07 * k, 0.9, 'sawtooth', 0, 86); tone(180, 0.03 * k, 0.8, 'triangle', 0.05, 130); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; }, hideCard = () => { if (cardKey) { card.style.display = 'none'; cardKey = ''; } };
  // ================= Gus: lines (every box 20 words or less) + menu (YES, PUT ME TO WORK! first · GOODBYE last) =================
  const TG = () => ({ key: 'farmGus', name: 'Gus Woolly', role: 'WOOLLY ACRES', obj: gus, ry: gus.rotation.y, r: 5 }), l = text => ({ who: 'Gus Woolly', role: 'WOOLLY ACRES', text });
  const HI = ['Mornin\u2019, lad. Mind where you step. The sheep don\u2019t, and neither do the cows.', 'Back again? The flock\u2019s been asking for you. Well, baaing.', 'Pudding gave extra milk today. She likes you. Maple doesn\u2019t like anybody.'];
  let hiN = 0, danger = false;
  function menu() { const met = save.stat('farmWMet', false); if (!met) save.setStat('farmWMet', true); const w = save.count ? save.count('woolBale') : 0;
    sayTo(TG(), [{ ...l(!met ? 'Gus Woolly. Woolly Acres. Eight sheep, two cows and not one of them listens.' : HI[hiN++ % HI.length]), choices: [
      { text: CHOICE_WORK, pick: () => jobAsk() },
      { text: 'SHEAR THE SHEEP \u00b7 THE SHEARING STAND', pick: () => shearAsk() },
      { text: w ? 'SELL WOOL \u00b7 ' + w + ' BALE' + (w === 1 ? '' : 'S') + ' \u00b7 4 G EACH' : 'SELL WOOL \u00b7 4 G A BALE', pick: () => sell() },
      { text: 'SHEPHERD\u2019S PIE \u00b7 12 G \u00b7 +60 HP', pick: () => pie() },
      { text: 'WHAT\u2019S OUT THERE?', pick: () => sayTo(TG(), [l('Open grass, lad. Nowhere to hide but my walls, my hay and my old oak.'), l('Bandits come down off the barracks road. The flock scatters. Keep your head down.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(TG(), [l('Shut the fold gate behind you, lad.')]) }] }]); }
  function sell() { const n = save.count ? save.count('woolBale') : 0; if (!n) { sayTo(TG(), [l('No wool in your bag, lad. Shear a few on the stand and bring me the bales.')]); return; }
    for (let i = 0; i < n; i++) save.take('woolBale'); save.addGold(n * 4); coin(); toast('SOLD ' + n + ' BALE' + (n > 1 ? 'S' : '') + ' \u00b7 +' + n * 4 + ' G', 2.6); sayTo(TG(), [l(n > 5 ? 'That\u2019s a cart load! ' + n * 4 + ' gold. Lovely clean wool.' : 'Good wool. ' + n * 4 + ' gold, lad.')]); }
  function pie() { if (!save.spend(12)) { sayTo(TG(), [l('Twelve gold a slice, lad. Sell me some wool first.')]); return; } save.give('shepherdsPie'); coin(); toast('SHEPHERD\u2019S PIE \u00b7 IN YOUR BAG \u00b7 \u221212 G', 2.4); sayTo(TG(), [l('Still warm. Eat it when the bandits get rough.')]); }
  // ================= sheep brain =================
  const inFold = (x, z) => x > FX0 && x < FX1 && z > FZ0 && z < FZ1;
  const pushSeg = (s, ax, az, bx, bz, r) => { const ex = bx - ax, ez = bz - az, L2 = ex * ex + ez * ez || 1; const t = clamp(((s.x - ax) * ex + (s.z - az) * ez) / L2, 0, 1), px = ax + ex * t, pz = az + ez * t, dx = s.x - px, dz = s.z - pz, d = Math.hypot(dx, dz);
    if (d < r) { if (d < 1e-4) { s.x += 0.01; return; } const k = (r - d) / d; s.x += dx * k; s.z += dz * k; } };
  const openSpot = (x, z) => !SCIR.some(([cx, cz, r]) => Math.hypot(x - cx, z - cz) < r + 0.6) && !(x > BX0 - 1 && x < BX1 + 1 && z > BZ0 - 1 && z < BZ1 + 1) && !inFold(x, z) && !(x > FX0 - 8 && x < FX0 + 0.5 && z > GZ0 - 7 && z < GZ1 + 7) && !(x > HUT[0] - 3 && x < HUT[0] + 3.5 && z > HUT[1] - 2 && z < HUT[1] + 2);
  const wanderTo = s => { for (let k = 0; k < 12; k++) { const x = s.penned ? FX0 + 1.2 + Math.random() * (FX1 - FX0 - 2.4) : clamp(s.x + (Math.random() - 0.5) * 12, LX0 + 2, -40), z = s.penned ? FZ0 + 1.2 + Math.random() * (FZ1 - FZ0 - 2.4) : clamp(s.z + (Math.random() - 0.5) * 12, LZ0 + 2, LZ1 - 2); if (s.penned || openSpot(x, z)) { s.tx = x; s.tz = z; return; } } s.tx = s.x; s.tz = s.z; };
  function sheepTick(dt, t, P) { const near = P && dist(P, (LX0 + LX1) / 2, (LZ0 + LZ1) / 2) < 70, R0 = J ? 7.5 : 4.2, VMAX = J ? 4.8 : 3.4;
    for (const s of SHEEP) { let ax = 0, az = 0, flee = 0;
      if (danger) { const dx = -70 - s.x, dz = -274 - s.z, d = Math.hypot(dx, dz) || 1; if (d > 3) { ax = dx / d * 3.6; az = dz / d * 3.6; flee = 1; } }
      else { if (near && !(P.y > 2)) { const dx = s.x - P.x, dz = s.z - P.z, d = Math.hypot(dx, dz) || 0.01; if (d < R0) { const k = 1 - d / R0; flee = k; ax += dx / d * (1.4 + k * VMAX); az += dz / d * (1.4 + k * VMAX); if (k > 0.45 && (s.baa -= dt * 3) <= 0) { s.baa = 5 + Math.random() * 6; if (d < 15) baaS(0.5); } } }
        if (flee > 0) { let cx = 0, cz = 0, n = 0; for (const o of SHEEP) { if (o === s) continue; const d = Math.hypot(o.x - s.x, o.z - s.z); if (d < 8) { cx += o.x; cz += o.z; n++; } } if (n) { cx /= n; cz /= n; ax += (cx - s.x) * 0.25; az += (cz - s.z) * 0.25; } s.graze = 0; s.wt = 1 + Math.random() * 2; }
        else { s.wt -= dt; if (s.wt <= 0) { s.wt = 3 + Math.random() * 6; if (Math.random() < 0.55) { wanderTo(s); s.graze = 0; } else s.graze = 2 + Math.random() * 3; }
          const dx = s.tx - s.x, dz = s.tz - s.z, d = Math.hypot(dx, dz); if (d > 0.3 && s.graze <= 0) { ax = dx / d * 0.7; az = dz / d * 0.7; } if (s.graze > 0) s.graze -= dt; } }
      for (const o of SHEEP) { if (o === s) continue; const dx = s.x - o.x, dz = s.z - o.z, d = Math.hypot(dx, dz); if (d < 1.15 && d > 0.001) { ax += dx / d * (1.15 - d) * 4; az += dz / d * (1.15 - d) * 4; } }
      const k = Math.min(1, dt * (flee > 0 ? 5 : 2.5)); s.vx += (ax - s.vx) * k; s.vz += (az - s.vz) * k; const sp = Math.hypot(s.vx, s.vz); if (sp > VMAX) { s.vx *= VMAX / sp; s.vz *= VMAX / sp; }
      s.x += s.vx * dt; s.z += s.vz * dt;
      s.x = clamp(s.x, LX0 + 1.2, LX1 - 1.6); s.z = clamp(s.z, LZ0 + 1.2, LZ1 - 1.2);
      for (const [cx, cz, r] of SCIR) { const dx = s.x - cx, dz = s.z - cz, d = Math.hypot(dx, dz); if (d < r && d > 0.001) { s.x = cx + dx / d * r; s.z = cz + dz / d * r; } }
      for (const g of SSEG) pushSeg(s, g[0], g[1], g[2], g[3], 0.55);
      if (gateCol.on || s.penned) pushSeg(s, gateSeg[0], gateSeg[1], gateSeg[2], gateSeg[3], 0.55);
      if (!s.penned && J && inFold(s.x, s.z) && s.x > FX0 + 0.7) { s.penned = true; s.tx = s.x; s.tz = s.z; baaS(0.8, true); pop(s.x, s.z, 2, PAPER); const n = SHEEP.filter(q => q.penned).length; toast(n + ' OF ' + NSH + ' IN THE FOLD', 1.4); tone(880 + n * 60, 0.05, 0.25, 'triangle'); }
      const spd = Math.hypot(s.vx, s.vz), g = s.g; g.position.set(s.x, Math.abs(Math.sin(t * 12 + s.ph)) * Math.min(0.12, spd * 0.03), s.z);
      if (spd > 0.15) { const a = Math.atan2(s.vx, s.vz) - PI / 2; g.rotation.y += Math.atan2(Math.sin(a - g.rotation.y), Math.cos(a - g.rotation.y)) * Math.min(1, dt * 8); }
      const ph = t * (6 + spd * 3) + s.ph; s.lf.rotation.z = spd > 0.15 ? Math.sin(ph) * 0.6 : 0; s.lb.rotation.z = spd > 0.15 ? -Math.sin(ph) * 0.6 : 0;
      s.tor.rotation.z = s.graze > 0 ? -0.22 + Math.sin(t * 3 + s.ph) * 0.04 : spd > 2.5 ? 0.06 : 0;
      if (s.shorn > 0) { s.shorn -= dt; const w = s.shorn > 30 ? 0 : 1 - s.shorn / 30; s.wool.visible = w > 0.02; s.wool.scale.setScalar(0.72 + 0.28 * w); } else if (!s.wool.visible || s.wool.scale.x < 1) { s.wool.visible = true; s.wool.scale.setScalar(1); }
      if (!J && !danger && (s.baa -= dt) <= 0) { s.baa = 9 + Math.random() * 14; if (P && dist(P, s.x, s.z) < 18) baaS(0.35, Math.random() < 0.5); } } }
  function cowTick(dt, t, P) { for (const c of COWS) { let sp = 0; if (c.milkT > 0) c.milkT -= dt;
      if (danger) { c.tx = -72; c.tz = -272 + (c.name === 'Maple' ? 3 : 0); }
      else { c.wt -= dt; if (c.wt <= 0) { c.wt = 5 + Math.random() * 8; for (let k = 0; k < 10; k++) { const x = -73 + Math.random() * 22, z = -301 + Math.random() * 28; if (openSpot(x, z)) { c.tx = x; c.tz = z; break; } } } }
      const dx = c.tx - c.x, dz = c.tz - c.z, d = Math.hypot(dx, dz); if (d > 0.3) { sp = danger ? 2.6 : 0.6; const s = Math.min(d, sp * dt); c.x += dx / d * s; c.z += dz / d * s; const a = Math.atan2(dx, dz) - PI / 2; c.g.rotation.y += Math.atan2(Math.sin(a - c.g.rotation.y), Math.cos(a - c.g.rotation.y)) * Math.min(1, dt * 3); }
      for (const [cx, cz, r] of SCIR) { const ex = c.x - cx, ez = c.z - cz, e = Math.hypot(ex, ez); if (e < r + 0.5 && e > 0.001) { c.x = cx + ex / e * (r + 0.5); c.z = cz + ez / e * (r + 0.5); } }
      c.g.position.set(c.x, 0, c.z); const ph = t * 5; c.legs.forEach((lg, k) => { lg.rotation.z = sp > 0 ? Math.sin(ph + (k % 2 ? PI : 0) + (k > 1 ? PI / 2 : 0)) * 0.35 : 0; });
      c.head.rotation.z = sp > 0 ? 0 : Math.sin(t * 0.6 + c.x) * 0.1 - 0.35; c.head.rotation.y = Math.sin(t * 0.4 + c.z) * 0.25;
      if ((c.moo -= dt) <= 0) { c.moo = 16 + Math.random() * 16; if (P && dist(P, c.x, c.z) < 25) mooS(0.5); } } }
  const nearCow = P => COWS.find(c => dist(P, c.x, c.z) < 2.4);
  function milk(c, P) { if (c.milkT > 0) { toast(c.name.toUpperCase() + ' IS ALL MILKED OUT \u00b7 TRY LATER', 1.8); mooS(0.6); return; } c.milkT = 120; save.give('freshMilk'); tone(900, 0.04, 0.12, 'sine'); tone(700, 0.04, 0.12, 'sine', 0.14); mooS(0.7); pop(c.x, c.z, 2, PAPER); toast('FRESH MILK \u00b7 +20 HP WHEN YOU DRINK IT \u00b7 IN YOUR BAG', 2.0); }
  // ================= JOB: HERD THE SHEEP (90 s) =================
  let J = null; const TIME = 90;
  function scatter() { const pts = []; for (const s of SHEEP) { let x = -60, z = -290; for (let k = 0; k < 40; k++) { x = LX0 + 3 + Math.random() * 32; z = LZ0 + 3 + Math.random() * (LZ1 - LZ0 - 6); if (openSpot(x, z) && !pts.some(p => Math.hypot(p[0] - x, p[1] - z) < 3)) break; }
      pts.push([x, z]); s.x = x; s.z = z; s.vx = s.vz = 0; s.tx = x; s.tz = z; s.penned = false; s.graze = 1; s.g.position.set(x, 0, z); } }
  function jobAsk() { if (danger) { sayTo(TG(), [l('Not now, lad! Bandits! Run them off first.')]); return; } if (SH) return;
    sayTo(TG(), [l('Flock\u2019s all over the hill. Walk behind them, they run from you. Steer them through the gate.')], () => jobStart()); }
  function jobStart() { scatter(); gateWant = GATE_OPEN; gateCol.on = false; J = { t: TIME, el: 0, over: false }; toast('HERD THE SHEEP \u00b7 INTO THE FOLD!', 2.4); ding(); baaS(1); }
  let gateShutT = 0;
  function jobEnd(stopped) { if (!J) return; const el = J.el, n = SHEEP.filter(s => s.penned).length; J = null; hideCard(); arrow.visible = false; ringG.visible = false;
    if (stopped) { for (const s of SHEEP) s.penned = false; sayTo(TG(), [l('Taking a break? Fair enough. They\u2019ll keep. Sheep always do.')]); return; }
    gateWant = 0; gateCol.on = true; gateShutT = 25; tone(300, 0.06, 0.3, 'square');
    if (n < Math.ceil(NSH / 2)) { sayTo(TG(), [l('Only ' + n + ' in. The rest are laughing at us. Try again, lad.')]); return; }
    const all = n >= NSH, stars = all && el <= 55 ? 3 : all ? 2 : 1, first = !save.stat('farmWStar_herd', 0), gold = stars * 6 + (first ? 12 : 0); save.addGold(gold); try { save.addXp && save.addXp(stars * 10); } catch (e) {} save.give('freshMilk');
    K.finish('herd', stars, gold, first); baaS(1, true);
    sayTo(TG(), [l(stars === 3 ? 'Every one, and quick! You\u2019ve a shepherd\u2019s legs, lad. Have some milk.' : stars === 2 ? 'All in. Took a while, but all in. Milk\u2019s on me.' : n + ' of ' + NSH + '. Not bad for a first try. Here, some milk.')]); }
  const ringG = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.95, 32), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); ringG.rotation.x = -PI / 2; ringG.position.set(FX0 - 1.4, 0.09, (GZ0 + GZ1) / 2); ringG.visible = false; G.add(ringG);
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 4), new THREE.MeshBasicMaterial({ color: YEL })); arrow.rotation.x = PI; arrow.visible = false; G.add(arrow);
  // ================= SHEEP SHEARING (panel: drag across the wool, lift off when she kicks) =================
  let SH = null; const SH_N = 3, SH_T = 15, RX = 150, RY = 92;
  function shearAsk() { if (danger) { sayTo(TG(), [l('Not now, lad! Bandits! The sheep won\u2019t sit still for that.')]); return; } if (J) return;
    sayTo(TG(), [l('Three sheep on the stand. Drag the clippers over the wool. Lift off when she kicks.')], () => shearOpen()); }
  const newTufts = () => { const T = []; for (let y = -RY; y <= RY; y += 16) for (let x = -RX; x <= RX; x += 16) { const jx = x + (Math.random() - 0.5) * 6, jy = y + (Math.random() - 0.5) * 6; if ((jx / RX) ** 2 + (jy / RY) ** 2 < 0.9) T.push({ x: jx, y: jy, r: 12 + Math.random() * 4, on: true, c: Math.random() < 0.3 }); } return T; };
  function shearOpen() { if (SH || J) return;
    const ov = document.createElement('div'); ov.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(32,30,29,0.6);display:flex;align-items:center;justify-content:center;font-family:Archivo,sans-serif;color:#201e1d;touch-action:none;user-select:none;-webkit-user-select:none';
    const cell = (k, lab, first) => '<div style="padding:4px 10px 5px;min-width:0;' + (first ? '' : 'border-left:2px solid #201e1d;') + '"><div style="font-size:10px;font-weight:900;letter-spacing:.04em">' + lab + '</div><div data-v="' + k + '" style="font-size:20px;font-weight:900;line-height:1.1">-</div></div>';
    ov.innerHTML = '<div style="position:relative;width:min(100vw,780px);height:min(100dvh,560px);background:#f3f2f2;border:2px solid #201e1d;display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden">'
      + '<div style="display:flex;align-items:stretch;background:' + BLUE + ';color:#fff;border-bottom:2px solid #201e1d;flex:none"><div style="flex:1;min-width:0;padding:0 12px;display:flex;align-items:center;font-weight:900;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">SHEEP SHEARING \u00b7 WOOLLY ACRES</div><button data-q style="flex:none;min-width:92px;height:44px;border:0;border-left:2px solid #201e1d;background:#f3f2f2;color:#201e1d;font:900 14px Archivo,sans-serif;text-align:left;padding:0 14px;cursor:pointer">QUIT</button></div>'
      + '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:2px solid #201e1d;flex:none">' + cell('n', 'SHEEP', 1) + cell('p', 'WOOL OFF') + cell('t', 'TIME') + cell('k', 'NICKS') + '</div>'
      + '<div data-w style="position:relative;flex:1;min-height:0"><canvas data-c style="position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;cursor:none;display:block"></canvas><div data-r style="position:absolute;inset:0;display:none;background:rgba(243,242,242,0.95);padding:18px 20px;box-sizing:border-box;flex-direction:column;align-items:flex-start;justify-content:center;gap:10px"></div></div>'
      + '<div style="flex:none;border-top:2px solid #201e1d;padding:6px 12px;font-weight:800;font-size:12px">DRAG ACROSS THE WOOL \u00b7 LIFT OFF WHEN SHE KICKS</div></div>';
    document.body.appendChild(ov);
    const cv = ov.querySelector('[data-c]'), wrap = ov.querySelector('[data-w]'), res = ov.querySelector('[data-r]'), vals = {}; ov.querySelectorAll('[data-v]').forEach(e => vals[e.dataset.v] = e);
    SH = { ov, cv, g: cv.getContext('2d'), wrap, res, vals, shown: {}, n: 0, tufts: newTufts(), t: SH_T, el: 0, totalEl: 0, nicks: 0, out: [], parts: [], down: false, px: -999, py: -999, over: false, kick: { ph: 'idle', t: 2.6, hit: false }, slide: { ph: 'in', t: 0.5 }, flash: 0, baa: 0, done: false, last: performance.now(), cutSnd: 0, cw: 0, ch: 0 };
    SH.total = SH.tufts.length;
    const pos = e => { const r = cv.getBoundingClientRect(); SH.px = e.clientX - r.left; SH.py = e.clientY - r.top; };
    cv.addEventListener('pointerdown', e => { e.preventDefault(); pos(e); SH.down = true; SH.over = true; try { cv.setPointerCapture(e.pointerId); } catch (er) {} buzz(true); });
    cv.addEventListener('pointermove', e => { pos(e); SH.over = true; });
    const up = e => { SH && (SH.down = false); buzz(false); if (e.pointerType !== 'mouse' && SH) SH.over = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', e => { if (SH && !SH.down) SH.over = false; });
    ov.querySelector('[data-q]').addEventListener('click', () => shearClose(true));
    SH.key = e => { if (e.key === 'Escape') { e.preventDefault(); shearClose(true); } }; addEventListener('keydown', SH.key);
    SH.raf = requestAnimationFrame(shearLoop); tone(1320, 0.05, 0.4); baaS(0.8); }
  let buzzO = null, buzzG = null;
  function buzz(on) { try { if (on && !isMuted()) { const a = AC(); if (!buzzO) { buzzO = a.createOscillator(); buzzG = a.createGain(); buzzO.type = 'sawtooth'; buzzO.frequency.value = 118; buzzG.gain.value = 0; buzzO.connect(buzzG).connect(a.destination); buzzO.start(); } buzzG.gain.setTargetAtTime(0.025, a.currentTime, 0.02); }
    else if (buzzG) buzzG.gain.setTargetAtTime(0, AC().currentTime, 0.03); } catch (e) {} }
  function shearClose(quit) { if (!SH) return; cancelAnimationFrame(SH.raf); removeEventListener('keydown', SH.key); SH.ov.remove(); buzz(false); const S = SH; SH = null;
    if (quit && !S.done) { sayTo(TG(), [l('Had enough? The sheep won\u2019t mind. They like their coats.')]); return; }
    const avg = S.out.reduce((a, b) => a + b, 0) / Math.max(1, S.out.length), stars = avg >= 0.9 && S.nicks <= 1 ? 3 : avg >= 0.7 ? 2 : 1, bales = S.out.filter(p => p >= 0.6).length, first = !save.stat('farmWStar_shear', 0), gold = stars * 6 + (first ? 12 : 0);
    save.addGold(gold); try { save.addXp && save.addXp(stars * 10); } catch (e) {} for (let i = 0; i < bales; i++) save.give('woolBale'); K.finish('shear', stars, gold, first);
    let n = 0; for (const s of SHEEP) { if (n >= bales) break; if (s.shorn <= 0) { s.shorn = 240; n++; } }
    sayTo(TG(), [l(stars === 3 ? 'Clean as a whistle, not a nick! ' + bales + ' bales. Sell them to me any time.' : stars === 2 ? 'Tidy work, lad. ' + bales + ' bale' + (bales === 1 ? '' : 's') + ' of wool. Bring them to my stand.' : 'Bit patchy. They look like a bad haircut. Still, ' + bales + ' bale' + (bales === 1 ? '' : 's') + '.')]); }
  function shearLoop(now) { if (!SH) return; const S = SH, dt = Math.min(0.05, (now - S.last) / 1000); S.last = now; S.raf = requestAnimationFrame(shearLoop);
    const dpr = Math.min(2, devicePixelRatio || 1), cw = S.wrap.clientWidth, ch = S.wrap.clientHeight; if (cw !== S.cw || ch !== S.ch) { S.cw = cw; S.ch = ch; S.cv.width = Math.round(cw * dpr); S.cv.height = Math.round(ch * dpr); }
    const g = S.g; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const sc = Math.min(cw / 520, ch / 300), cx = cw * 0.46, cy = ch * 0.5;
    // state
    let ox = 0, oy = 0; const k = S.kick;
    if (!S.done) {
      if (S.slide.ph) { S.slide.t -= dt; const p = clamp(S.slide.t / (S.slide.ph === 'in' ? 0.5 : 0.55), 0, 1); ox = S.slide.ph === 'in' ? -p * cw : (1 - p) * cw;
        if (S.slide.t <= 0) { if (S.slide.ph === 'in') S.slide.ph = null; else { S.n++; if (S.n >= SH_N) { S.done = true; showRes(); } else { S.tufts = newTufts(); S.total = S.tufts.length; S.t = SH_T; S.el = 0; k.ph = 'idle'; k.t = 2.4; S.slide = { ph: 'in', t: 0.5 }; baaS(0.7); } } } }
      else { S.t -= dt; S.el += dt; S.totalEl += dt; k.t -= dt;
        if (k.ph === 'idle' && k.t <= 0) { k.ph = 'warn'; k.t = 0.75; tone(660, 0.03, 0.1, 'square'); }
        else if (k.ph === 'warn' && k.t <= 0) { k.ph = 'buck'; k.t = 0.45; k.hit = false; baaS(0.6, true); }
        else if (k.ph === 'buck' && k.t <= 0) { k.ph = 'idle'; k.t = 2.0 + Math.random() * 1.8; }
        const cut = S.tufts.filter(q => !q.on).length; if (cut / S.total >= 0.97 || S.t <= 0) { S.out.push(cut / S.total); S.slide = { ph: 'out', t: 0.55 }; buzz(false); S.down = false; tone(cut / S.total >= 0.9 ? 1568 : 880, 0.06, 0.4); } } }
    if (k.ph === 'warn') ox += Math.sin(now / 1000 * 70) * 4 * sc; if (k.ph === 'buck') oy -= Math.sin((1 - k.t / 0.45) * PI) * 40 * sc;
    const ux = (S.px - cx - ox) / sc, uy = (S.py - cy - oy) / sc, onBody = (ux / RX) ** 2 + (uy / RY) ** 2 < 1.15;
    if (!S.done && !S.slide.ph && S.down) {
      if (k.ph === 'buck' && onBody && !k.hit) { k.hit = true; S.nicks++; S.flash = 0.45; S.baa = 0.9; S.t = Math.max(0, S.t - 1); tone(240, 0.08, 0.3, 'square', 0, 120); baaS(1, true); }
      else if (k.ph !== 'buck') { let n = 0; for (const q of S.tufts) if (q.on && (q.x - ux) ** 2 + (q.y - uy) ** 2 < 26 * 26) { q.on = false; n++; if (S.parts.length < 70) S.parts.push({ x: cx + q.x * sc, y: cy + q.y * sc, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 120, r: q.r * sc, life: 0.8 }); }
        if (n && (S.cutSnd -= dt) <= 0) { S.cutSnd = 0.07; tone(1200 + Math.random() * 300, 0.015, 0.05, 'triangle'); } } }
    // draw: floor boards + stand
    g.fillStyle = '#e9e4da'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#d9d2c4'; for (let y = 0; y < ch; y += 26 * sc + 6) g.fillRect(0, y, cw, 2);
    g.fillStyle = '#8b6a48'; g.fillRect(cx - 230 * sc, cy + 128 * sc, 460 * sc, 22 * sc); g.fillStyle = '#5e4329'; g.fillRect(cx - 230 * sc, cy + 146 * sc, 460 * sc, 6 * sc);
    g.save(); g.translate(cx + ox, cy + oy); g.scale(sc, sc);
    g.fillStyle = FACE; const kickL = k.ph === 'buck' ? Math.sin((1 - k.t / 0.45) * PI) * 0.5 : 0;
    for (const [lx, a] of [[-95, -kickL], [-60, 0], [70, 0], [100, kickL * 0.4]]) { g.save(); g.translate(lx, 60); g.rotate(a); g.fillRect(-9, 0, 18, 70); g.restore(); }
    g.beginPath(); g.ellipse(-152, -18, 16, 13, 0, 0, PI * 2); g.fillStyle = WOOL; g.fill();
    g.beginPath(); g.ellipse(0, 0, RX - 4, RY - 4, 0, 0, PI * 2); g.fillStyle = '#efc9b8'; g.fill(); g.lineWidth = 3; g.strokeStyle = S.flash > 0 ? RED : INK; g.stroke();
    for (const q of S.tufts) if (q.on) { g.beginPath(); g.arc(q.x, q.y, q.r, 0, PI * 2); g.fillStyle = q.c ? WOOLD : WOOL; g.fill(); }
    g.lineWidth = 2; g.strokeStyle = '#cfc6b4'; for (const q of S.tufts) if (q.on && q.c) { g.beginPath(); g.arc(q.x, q.y, q.r * 0.55, 0.4, 2.4); g.stroke(); }
    g.save(); g.translate(158, -38); g.fillStyle = FACE; g.beginPath(); g.ellipse(0, 0, 44, 36, 0.15, 0, PI * 2); g.fill(); g.beginPath(); g.ellipse(-14, -40, 12, 22, -0.5, 0, PI * 2); g.fill(); g.beginPath(); g.ellipse(26, -36, 10, 20, 0.6, 0, PI * 2); g.fill();
    g.fillStyle = WOOL; g.beginPath(); g.arc(-6, -34, 16, 0, PI * 2); g.arc(12, -36, 13, 0, PI * 2); g.fill();
    const mad = S.baa > 0 || k.ph === 'warn'; for (const ex of [-6, 20]) { g.fillStyle = PAPER; g.beginPath(); g.arc(ex, -4, 8, 0, PI * 2); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(ex + 2, -3, 4, 0, PI * 2); g.fill(); if (mad) { g.strokeStyle = PAPER; g.lineWidth = 3; g.beginPath(); g.moveTo(ex - 9, -16 + (ex < 0 ? -3 : 3)); g.lineTo(ex + 9, -16 + (ex < 0 ? 3 : -3)); g.stroke(); } }
    g.fillStyle = '#e7a6a6'; g.beginPath(); g.ellipse(32, 18, 9, 6, 0, 0, PI * 2); g.fill(); g.restore();
    if (k.ph === 'warn' || S.baa > 0) { const txt = S.baa > 0 ? 'BAA!' : '!', w = S.baa > 0 ? 96 : 40; g.fillStyle = S.baa > 0 ? PAPER : RED; g.fillRect(150, -150, w, 46); g.lineWidth = 3; g.strokeStyle = INK; g.strokeRect(150, -150, w, 46); g.fillStyle = S.baa > 0 ? INK : '#fff'; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 162, -126); }
    g.restore();
    for (const p of S.parts) { p.life -= dt; p.vy += 260 * dt; p.x += p.vx * dt; p.y += p.vy * dt; g.globalAlpha = clamp(p.life / 0.8, 0, 1); g.beginPath(); g.arc(p.x, p.y, p.r, 0, PI * 2); g.fillStyle = WOOL; g.fill(); } g.globalAlpha = 1; S.parts = S.parts.filter(p => p.life > 0);
    if (S.flash > 0) { S.flash -= dt; g.fillStyle = 'rgba(236,48,19,' + clamp(S.flash, 0, 0.3) + ')'; g.fillRect(0, 0, cw, ch); } if (S.baa > 0) S.baa -= dt;
    // hint hand after 3 s with nothing sheared
    if (!S.done && !S.slide.ph && S.n === 0 && S.tufts.every(q => q.on) && S.el > 3) { const u = (S.el * 0.6) % 1, hx = cx + (-110 + u * 220) * sc, hy = cy + Math.sin(u * PI * 2) * 30 * sc; g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.arc(hx, hy, 22, 0, PI * 2); g.stroke(); g.fillStyle = 'rgba(32,30,29,0.25)'; g.fill();
      g.fillStyle = INK; g.fillRect(cx - 110 * sc, cy - RY * sc - 44, 210, 30); g.fillStyle = '#fff'; g.font = '900 15px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('DRAG ACROSS THE WOOL', cx - 110 * sc + 10, cy - RY * sc - 29); }
    // the clippers
    if (S.over && S.px > -100 && !S.done) { g.save(); g.translate(S.px, S.py); g.rotate(-0.5); const v = S.down ? Math.sin(now / 12) * 1.5 : 0; g.fillStyle = BLUE; g.fillRect(-10 + v, 6, 20, 46); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-10 + v, 6, 20, 46); g.fillStyle = '#8a8f97'; g.fillRect(-16 + v, -6, 32, 12); g.fillStyle = INK; for (let i = 0; i < 6; i++) g.fillRect(-15 + i * 5.6 + v, -12, 3, 7); g.restore(); }
    // stats
    const cutN = S.tufts.filter(q => !q.on).length, sv = { n: Math.min(S.n + 1, SH_N) + '/' + SH_N, p: Math.round(cutN / S.total * 100) + '%', t: String(Math.max(0, Math.ceil(S.t))), k: String(S.nicks) };
    for (const kk in sv) if (S.shown[kk] !== sv[kk]) { S.shown[kk] = sv[kk]; S.vals[kk].textContent = sv[kk]; S.vals[kk].style.color = kk === 'k' && S.nicks ? '#b8250e' : kk === 't' && S.t < 4 ? '#b8250e' : INK; } }
  function showRes() { const S = SH; if (!S) return; const avg = S.out.reduce((a, b) => a + b, 0) / S.out.length, stars = avg >= 0.9 && S.nicks <= 1 ? 3 : avg >= 0.7 ? 2 : 1, bales = S.out.filter(p => p >= 0.6).length;
    S.res.style.display = 'flex'; S.res.innerHTML = '<div style="font-size:30px;font-weight:900;line-height:1">' + (stars === 3 ? 'CLEAN SHEAR!' : stars === 2 ? 'TIDY WORK' : 'BIT PATCHY') + '</div>'
      + '<div style="font-size:34px;line-height:1">' + [0, 1, 2].map(i => '<span style="color:' + (i < stars ? '#ffd23a' : '#cfcac3') + ';-webkit-text-stroke:1.5px #201e1d">\u2605</span>').join('') + '</div>'
      + '<div style="font-size:14px;font-weight:800;border-top:2px solid #201e1d;padding-top:8px;width:min(100%,320px)">WOOL OFF ' + Math.round(avg * 100) + '% \u00b7 NICKS ' + S.nicks + ' \u00b7 ' + bales + ' BALE' + (bales === 1 ? '' : 'S') + '</div>'
      + '<button data-d style="min-height:48px;width:min(100%,260px);border:2px solid #201e1d;background:#ec3013;color:#fff;font:900 16px Archivo,sans-serif;text-align:left;padding:0 16px;cursor:pointer">DONE</button>';
    S.res.querySelector('[data-d]').addEventListener('click', () => shearClose(false)); ding(); }
  // ================= hits + shot blockers =================
  function hitFence(f, i) { if (f.broken) return; f.broken = true; f.t = 0; syncFence(f, i); crack(); debris(f.x, 0.8, f.z, 4); }
  function hitCrate(c) { if (c.broken) return; c.hp--; c.shake = 0.3; crack(); if (c.hp > 0) return; c.broken = true; c.t = 0; c.g.visible = false; c.col.on = false; debris(c.x, 0.6, c.z, 8);
    if (Math.random() < 0.35) { const it = Math.random() < 0.5 ? 'freshMilk' : 'woolBale'; save.give(it); pop(c.x, c.z, 2, PAPER); toast('CRATE \u00b7 ' + (it === 'freshMilk' ? 'FRESH MILK' : 'A WOOL BALE') + ' \u00b7 IN YOUR BAG', 1.8); } else { const g = 2 + Math.floor(Math.random() * 4); save.addGold(g); pop(c.x, c.z, g); coin(); toast('CRATE \u00b7 +' + g + ' G', 1.6); } }
  const wob = s => { s.v += 6; tone(300, 0.03, 0.1, 'triangle'); };
  const LC = [(LX0 + LX1) / 2, (LZ0 + LZ1) / 2];
  const hits = (kind, P) => { if (!P || dist(P, LC[0], LC[1]) > 70) return []; const R2 = kind === 'melee' ? 5 : 17, out = [];
    FEN.forEach((f, i) => { if (!f.broken && dist(P, f.x, f.z) < R2) out.push({ x: f.x, z: f.z, r: 0.6, onHit: () => hitFence(f, i), d: dist(P, f.x, f.z) }); });
    for (const c of CRATES) if (!c.broken && dist(P, c.x, c.z) < R2) out.push({ x: c.x, z: c.z, r: 0.8, onHit: () => hitCrate(c), d: dist(P, c.x, c.z) });
    for (const s of SCARE) if (dist(P, s.x, s.z) < R2) out.push({ x: s.x, z: s.z, r: 0.4, onHit: () => wob(s), d: dist(P, s.x, s.z) });
    return out.sort((a, b) => b.d - a.d); };
  const wallBlk = []; for (const [ax, az, bx, bz] of STONEW) { const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 1.2); for (let i = 0; i <= n; i++) wallBlk.push({ x: ax + (bx - ax) * i / n, z: az + (bz - az) * i / n, r: 0.7, onShot: () => {} }); }
  wallBlk.push({ x: OAK[0], z: OAK[1], r: 0.9, onShot: () => {} }); for (let i = 0; i < 3; i++) wallBlk.push({ x: HUT[0] - 1.2 + i * 1.2, z: HUT[1], r: 1.0, onShot: () => {} });
  const blockers = () => [...HAYS.map(h => ({ x: h.x, z: h.z, r: h.r, onShot: () => { h.t = 0.3; debris(h.x, 1.0, h.z, 2, HAY); } })), ...SCARE.map(s => ({ x: s.x, z: s.z, r: s.r, onShot: () => wob(s) })), ...(lastP && dist(lastP, LC[0], LC[1]) < 80 ? wallBlk : [])];
  (window.__m2hitSrc = window.__m2hitSrc || []).push(hits); (window.__m2blockers = window.__m2blockers || []).push(blockers);
  // ================= per frame =================
  const inBarn = P => !!P && P.x > BX0 + 0.1 && P.x < BX1 - 0.1 && P.z > BZ0 + 0.2 && P.z < BZ1 - 0.2 && (P.y || 0) < 3;
  const inLot = P => !!P && P.x > LX0 && P.x < LX1 + 3 && P.z > LZ0 && P.z < LZ1;
  let gw = null, waveT = 0, wasIn = false, lastP = null, nightOn = null, dangerT = 0, wasDanger = false;
  const gusWant = () => { const h = hour(); return danger || h < 6 || h >= 17 ? 'in' : 'out'; };
  let gSide = gusWant(); const placeG = k => { const p = k === 'out' ? OUT : IN; gus.position.set(p[0], 0, p[1]); gus.rotation.y = p[2]; gSide = k; gw = null; }; placeG(gSide);
  const GPTS = [[IN[0], IN[1]], [IN[0] + 2, DZ], [BX1 + 1.4, DZ], [-25, -312], [OUT[0] - 2, OUT[1] - 4], [OUT[0], OUT[1]]];
  function gusTick(dt, t, P) { const want = gusWant(), A = gus.userData.P && gus.userData.P.arms;
    if (want !== gSide && !gw) { if (dist(P, gus.position.x, gus.position.z) > 50) placeG(want); else { gw = { pts: want === 'in' ? GPTS.slice(0, -1).reverse() : GPTS.slice(1), i: 0, to: want, sp: danger ? 3.2 : 1.3 }; gSide = 'walk'; } }
    if (gw) { const [tx, tz] = gw.pts[gw.i], dx = tx - gus.position.x, dz = tz - gus.position.z, dd = Math.hypot(dx, dz);
      if (dd < 0.08) { if (++gw.i >= gw.pts.length) placeG(gw.to); } else { const st = Math.min(dd, gw.sp * dt); gus.position.x += dx / dd * st; gus.position.z += dz / dd * st; gus.rotation.y = Math.atan2(dx, dz); }
      kit.animFox && kit.animFox(gus, dt, gw ? gw.sp : 0); KPOSE(gus, dt, 'off'); return; }
    const home = gSide === 'out' ? OUT[2] : IN[2], d = dist(P, gus.position.x, gus.position.z), ins = inBarn(P);
    if (gSide === 'in' && ins && !wasIn) { waveT = 1.8; K.chime(); } wasIn = ins;
    const look = d < 4.5 && (gSide === 'out' || ins), a = look || waveT > 0 ? Math.atan2(P.x - gus.position.x, P.z - gus.position.z) : home + Math.sin(t * 0.5) * 0.2;
    gus.rotation.y += Math.atan2(Math.sin(a - gus.rotation.y), Math.cos(a - gus.rotation.y)) * Math.min(1, dt * 3); kit.animFox && kit.animFox(gus, dt, 0);
    if (KPOSE(gus, dt, waveT > 0 ? 'wave' : d < 3 || d > 25 || !(gSide === 'out' || ins) ? null : 'idle')) { if (waveT > 0) waveT -= dt; return; }
    if (A && A[1]) { if (waveT > 0) { waveT -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; if (waveT <= 0) { A[1].rotation.x = 0; A[1].rotation.z = 0; } } } }
  function tick(dt, P, fox) { if (!P) return; lastP = P; if (toastT > 0) toastT -= dt; const t = performance.now() / 1000, d = dist(P, LC[0], LC[1]);
    G.visible = d < 150; if (d > 120) { hideCard(); return; }
    dangerT -= dt; if (dangerT <= 0) { dangerT = 0.5; danger = threat(LC[0], LC[1], 55) > 0; if (danger && !wasDanger && d < 70) { toast('GUS: Bandits on the hill! Into the shed, and mind the flock!', 2.6); baaS(1, true); } wasDanger = danger; }
    K.tick(dt, P, { inShop: inBarn(P), busy: !!J || !!SH, near: inBarn(P) ? 0 : dist(P, BCX, BCZ) });
    gusTick(dt, t, P); sheepTick(dt, t, P); cowTick(dt, t, P);
    { const st = G.userData.standSheep; st.tor.rotation.z = Math.sin(t * 1.7) * 0.04; st.g.rotation.y = PI / 2 + 0.2 + Math.sin(t * 0.5) * 0.15; }
    fan.rotation.x += dt * (1.6 + Math.sin(t * 0.3) * 0.8);
    gateA += (gateWant - gateA) * Math.min(1, dt * 3); gate.rotation.y = gateA;
    if (gateShutT > 0 && !J) { gateShutT -= dt; if (gateShutT <= 0) { gateWant = GATE_OPEN; gateCol.on = false; for (const s of SHEEP) s.penned = false; } }
    const ins = inBarn(P); roofM.visible = !ins;
    FEN.forEach((f, i) => { if (f.broken && (f.t += dt) > 120 && dist(P, f.x, f.z) > 25) { f.broken = false; syncFence(f, i); } });
    for (const c of CRATES) { if (c.broken) { if ((c.t += dt) > 90 && dist(P, c.x, c.z) > 25) { c.broken = false; c.hp = 2; c.g.visible = true; c.col.on = true; } } else if (c.shake > 0) { c.shake -= dt; c.g.position.x = c.x + Math.sin(t * 60) * 0.05 * c.shake / 0.3; } }
    for (const s of SCARE) { s.v += (-s.k * 40 - s.v * 4) * dt; s.k += s.v * dt; s.sw.rotation.z = s.k * 0.12; }
    for (const h of HAYS) if (h.t > 0) { h.t -= dt; h.g.scale.setScalar(1 + Math.sin(h.t * 40) * 0.03); } else h.g.scale.setScalar(1);
    for (const db of DEB) { if (db.t <= 0) continue; db.t -= dt; db.v.y -= 12 * dt; db.m.position.addScaledVector(db.v, dt); if (db.m.position.y < 0.05) { db.m.position.y = 0.05; db.v.multiplyScalar(0.4); db.v.y = 0; } db.m.rotation.x += db.w.x * dt; db.m.rotation.y += db.w.y * dt; if (db.t <= 0) db.m.visible = false; }
    for (const p of POPS) { if (p.t <= 0) continue; p.t -= dt; p.m.position.y += dt * 2.2; p.m.rotation.z += dt * 8; if (p.t <= 0) p.m.visible = false; }
    const h = hour(), nt = h < 7 || h >= 18.5; if (nt !== nightOn) { nightOn = nt; pools.visible = nt; poolM.opacity = nt ? 1 : 0; lampM.color.set(nt ? '#fff2c8' : '#5a5654'); paneM.color.set(nt ? '#ffd38a' : '#2e3a46'); }
    if (J) { if (!J.over) { J.t -= dt; J.el += dt; const n = SHEEP.filter(s => s.penned).length; if (n >= NSH || J.t <= 0) { J.over = true; setTimeout(() => jobEnd(false), n >= NSH ? 600 : 0); } }
      ringG.visible = true; ringG.scale.setScalar(1 + 0.08 * Math.sin(t * 4)); arrow.visible = true; arrow.position.set(FX0 - 0.6, 3.0 + Math.sin(t * 3) * 0.25, (GZ0 + GZ1) / 2);
      const n = SHEEP.filter(s => s.penned).length, key = 'job' + n + '|' + Math.ceil(J.t);
      setCard(key, '<div style="background:' + BLUE + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px">HERD THE SHEEP \u00b7 THE FOLD</div><div style="padding:8px 10px 4px;display:grid;grid-template-columns:1fr 1fr;gap:6px;font-weight:900"><div><div style="font-size:10px">IN THE FOLD</div><div style="font-size:20px">' + n + ' / ' + NSH + '</div></div><div><div style="font-size:10px">TIME</div><div style="font-size:20px;color:' + (J.t < 15 ? '#b8250e' : INK) + '">' + Math.max(0, Math.ceil(J.t)) + '</div></div></div><div style="padding:0 10px 9px;font-size:11px;font-weight:800">WALK BEHIND THEM \u00b7 STEER THEM TO THE YELLOW GATE</div>'); }
    else hideCard(); }
  function camFix(cam) { const P = lastP; if (!P || !inBarn(P)) return; const cp = cam.position, x = clamp(cp.x, BX0 + 0.5, BX1 - 0.5), z = clamp(cp.z, BZ0 + 0.6, BZ1 - 0.6), y = Math.min(cp.y, EAVE + 0.8);
    if (x !== cp.x || z !== cp.z || y !== cp.y) { cp.x = x; cp.z = z; cp.y = y; cam.lookAt(P.x, (P.y || 0) + 1.1, P.z); } }
  const atStand = P => inBarn(P) && dist(P, STANDP[0] + 1.9, STANDP[1]) < 1.7;
  function prompt(P) { if (SH || !inLot(P)) return null; const gd = dist(P, gus.position.x, gus.position.z);
    if (J) { if (gSide !== 'walk' && gd < 2.6) return 'TALK \u00b7 GUS \u00b7 STOP THE JOB'; return null; }
    if (gSide !== 'walk' && gd < 2.6) return 'TALK \u00b7 GUS'; if (K.atHiring(P)) return 'NOW HIRING \u00b7 HERD THE SHEEP'; if (atStand(P)) return 'SHEAR \u00b7 SHEEP SHEARING';
    const c = nearCow(P); if (c) return 'MILK \u00b7 ' + c.name.toUpperCase(); return null; }
  function talk(P) { if (SH) return true; if (!inLot(P)) return false; const gd = dist(P, gus.position.x, gus.position.z);
    if (J) { if (gSide !== 'walk' && gd < 2.6) { jobEnd(true); return true; } return false; }
    if (gSide !== 'walk' && gd < 2.6) { tone(1320, 0.05, 0.5); if (danger) { sayTo(TG(), [l('Not now, lad! Bandits on the hill! Run them off and the pie\u2019s on me.')]); return true; } menu(); return true; }
    if (K.atHiring(P)) { tone(1320, 0.05, 0.5); jobAsk(); return true; } if (atStand(P)) { if (danger) { toast('NOT NOW \u00b7 BANDITS ON THE HILL', 1.8); return true; } shearOpen(); return true; }
    const c = nearCow(P); if (c) { milk(c, P); return true; } return false; }
  const API = { group: G, tick, camFix, prompt, talk, busy: () => (SH ? 'shear' : null), toast: () => (toastT > 0 ? toastTxt : ''), quit: () => { if (SH) shearClose(true); jobEnd(true); }, useItem: () => false, gus, SHEEP, COWS, FEN, CRATES, HAYS, SCARE, K, FARM: FARM_W,
    job: () => J, jobStart, jobEnd, shearOpen, shear: () => SH, danger: () => danger, herdAll: () => { for (const s of SHEEP) { s.x = (FX0 + FX1) / 2 + (Math.random() - 0.5) * 6; s.z = (FZ0 + FZ1) / 2 + (Math.random() - 0.5) * 6; } },
    shearAll: () => { if (SH) for (const q of SH.tufts) q.on = false; }, dispose() { card.remove(); K.dispose(); if (SH) shearClose(true); } };
  window.__pasture = API; return API;
}
