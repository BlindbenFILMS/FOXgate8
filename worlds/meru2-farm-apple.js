// MERU 2.0 — s168 RUSSET ORCHARD [meruOrchard] (Ben: "3 farms along the castle path · something to look at + interact with · free-range battle area").
// Farm 1 of 3 (the closest to town, west of the Castle Path). Layout TOWN2 'extramvedpjst' (selfBuilt: no city shell, this file builds the barn).
// RED BARN you walk into (E doors on the farmyard, a back door W into the orchard): hay loft + ladder, 2 stalls (Clover the goat), cider press,
// apple crates, workbench, NOW HIRING + BEST SCORES board (shopKit), chime, sun patches, lamps at night. The ORCHARD = lanes of apple trees
// (orchard lanes = the fight shape), a cross lane from the back door, split-rail fence (every section BREAKS), crates you break for loot, round
// + square HAY BALES and 4 SCARECROWS that stop shots (engine/combat.js blockers), chickens that bolt to the coop when a fight starts, a WINDMILL,
// a well, a cart, Rusty's apple stand + the RUSSET ORCHARD arch over the Castle Path wall gap.
// RUSTY RUSSET (farmer): 8-17 at his apple stand, else in the barn; runs into the barn when foes come near. Menu: YES, PUT ME TO WORK! (APPLE PICK)
// · SELL APPLES (3 G each) · APPLE CIDER (8 G, +40 HP) · WHAT'S OUT THERE? · GOODBYE. Pick any apple off a tree (E / TALK) = APPLE (+15 HP) in the bag.
// JOB APPLE PICK: pick 10 apples off the glowing trees before the crows eat them (75 s). Crows land on ripe trees and peck; swing / shoot to shoo.
// Gates (Ben places them in the Gate Workshop) bring the fights. Test: ?start=orchard · window.__orchard.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { keeperPoser } from '../engine/keeper-poser.js?v=s645';   // s620c jointed keeper body language
export const FARM_A = { key: 'extramvedpjst', lot: [-82, -12, -262, -196], barn: [-41, -21, -228, -208], door: [-21, -218], back: [-41, -218], gap: [-9.5, -227] };
export function buildAppleFarm({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour = () => 12, isMuted = () => false, threat = () => 0 }) {
  const PI = Math.PI, INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', BARN = '#a8322a', BARND = '#7e241e', WOOD = '#8b6a48', WOODD = '#5e4329', HAY = '#d9b44a', HAYD = '#b08a2c', DARK = '#3d3b3a', ROOF = '#4a4442';
  const [LX0, LX1, LZ0, LZ1] = FARM_A.lot, [BX0, BX1, BZ0, BZ1] = FARM_A.barn, BCX = (BX0 + BX1) / 2, BCZ = (BZ0 + BZ1) / 2, DZ = FARM_A.door[1];
  const G = new THREE.Group(); G.name = 'meruOrchard'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), dist = (P, x, z) => Math.hypot(P.x - x, P.z - z), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seed = 4242; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
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
  const R = mk(), RF = mk(), LF = mk();   // R = static props · RF = barn roof (hidden when you are inside) · LF = hay loft (hidden when you stand under it)
  // ================= ground: dirt farmyard + walks, mulch strips under the tree rows =================
  const decal = (w, d, x, z, draw, rep = 3) => { const t = CT(128, 128, draw); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w / rep, d / rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -PI / 2; m.position.set(x, 0.07, z); G.add(m); return m; };
  const dirt = (g, w) => { g.fillStyle = '#9a7a58'; g.fillRect(0, 0, w, w); for (let i = 0; i < 260; i++) { g.fillStyle = ['#8a6a48', '#a8886a', '#7a5e40', '#b39270'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 3, 3); } };
  const mulch = (g, w) => { g.fillStyle = '#5e7a34'; g.fillRect(0, 0, w, w); for (let i = 0; i < 300; i++) { g.fillStyle = ['#4f6a2a', '#6e8a3e', '#7a6a3a', '#56722e'][i % 4]; g.fillRect(Math.random() * w, Math.random() * w, 4, 4); } };
  decal(BX1 - BX0 + 0.6, BZ1 - BZ0 + 0.6, BCX, BCZ, (g, w) => { g.fillStyle = '#8a6a48'; g.fillRect(0, 0, w, w); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7a5a3a' : '#94744f'; g.fillRect(0, i * 16, w, 15); } }, 2.5);   // barn floor boards
  decal(9.5, 34, -16.75, -219, dirt, 3);   // farmyard
  { const [ax, az] = FARM_A.gap, bx = BX1, bz = DZ, L = Math.hypot(ax - bx, az - bz), m = decal(2.6, L, (ax + bx) / 2, (az + bz) / 2, dirt, 3); m.rotation.z = Math.atan2(ax - bx, az - bz); m.position.y = 0.075; }   // the walk: gap → barn doors
  decal(BX0 - LX0, 3.2, (LX0 + BX0) / 2, DZ, dirt, 3).position.y = 0.075;   // the cross lane from the back door
  for (const x of [-78, -72, -66, -60, -54, -48]) decal(3.2, 64, x, -229.5, mulch, 3);
  for (const x of [-38, -32, -26, -20]) decal(3.2, 28, x, -246, mulch, 3);
  // ================= THE BARN (red, gambrel roof, ridge E-W, big doors on both gables) =================
  const EAVE = 5.2, KNEE = 8.2, RIDGE = 10, HW = (BZ1 - BZ0) / 2;
  { const bm = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), W = mk();
    // gable ends (E + W): gambrel shape with a door hole
    const gable = (x, holeW, holeH) => { const s = new THREE.Shape(); s.moveTo(-HW, 0); s.lineTo(HW, 0); s.lineTo(HW, EAVE); s.lineTo(HW - 4, KNEE); s.lineTo(0, RIDGE); s.lineTo(-HW + 4, KNEE); s.lineTo(-HW, EAVE); s.lineTo(-HW, 0);
      const h = new THREE.Path(); h.moveTo(-holeW / 2, 0.01); h.lineTo(holeW / 2, 0.01); h.lineTo(holeW / 2, holeH); h.lineTo(-holeW / 2, holeH); h.lineTo(-holeW / 2, 0.01); s.holes.push(h);
      W.put(new THREE.ShapeGeometry(s), x, 0, BCZ, BARN, PI / 2); };
    gable(BX1, 5, 4.6); gable(BX0, 4, 4.0);
    // long walls (N + S) with 3 windows each
    for (const z of [BZ0, BZ1]) { W.box(BX1 - BX0, EAVE, 0.3, BARN, BCX, EAVE / 2, z); W.box(BX1 - BX0 + 0.1, 0.22, 0.36, PAPER, BCX, EAVE - 0.11, z); W.box(BX1 - BX0 + 0.1, 0.22, 0.36, PAPER, BCX, 0.11, z); }
    for (const x of [BX0, BX1]) { W.box(0.36, EAVE, 0.24, PAPER, x, EAVE / 2, BZ0 + 0.12); W.box(0.36, EAVE, 0.24, PAPER, x, EAVE / 2, BZ1 - 0.12); }
    // gable trim + the hay loft door over the big door (E) + a hay hook beam
    for (const sx of [BX0, BX1]) { const o = sx === BX1 ? 0.17 : -0.17; for (const s of [-1, 1]) { const a = Math.atan2(KNEE - EAVE, 4), b = Math.atan2(RIDGE - KNEE, HW - 4);
        W.box(0.08, 0.22, Math.hypot(4, KNEE - EAVE), PAPER, sx + o, (EAVE + KNEE) / 2, BCZ + s * (HW - 2), 0, s * a); W.box(0.08, 0.22, Math.hypot(HW - 4, RIDGE - KNEE), PAPER, sx + o, (KNEE + RIDGE) / 2, BCZ + s * (HW - 4) / 2, 0, s * b); } }
    W.box(0.1, 1.8, 1.8, PAPER, BX1 + 0.17, 7.0, DZ); W.box(0.12, 1.5, 1.5, '#5a2a22', BX1 + 0.18, 7.0, DZ); for (const s of [-1, 1]) W.box(0.12, 0.12, 2.1, PAPER, BX1 + 0.2, 7.0, DZ, 0, s * PI / 4);
    W.box(0.14, 0.14, 1.4, WOODD, BX1 + 0.7, 8.4, DZ, PI / 2); W.box(0.04, 0.6, 0.04, DARK, BX1 + 1.3, 8.0, DZ);
    for (let i = 0; i < 6; i++) W.sph(0.12, HAY, BX1 + 0.14, 6.35 + (i % 3) * 0.05, DZ - 0.5 + i * 0.2, 0.5);
    // window frames + panes (the panes glow at night)
    const PANES = []; for (const z of [BZ0, BZ1]) for (const x of [BX0 + 4, BCX, BX1 - 4]) { const o = z === BZ0 ? -0.17 : 0.17; W.box(1.5, 1.5, 0.08, PAPER, x, 2.9, z + o); PANES.push([x, 2.9, z + o * 1.2]); }
    W.mesh(G, bm);
    G.userData.panes = PANES;
    // sliding doors, slid open beside the openings (red + white X)
    const door = (x, z, w, h, side) => { const D = mk(); D.box(0.12, h, w, BARND, 0, h / 2, 0); D.box(0.16, 0.16, w, PAPER, 0, h - 0.08, 0); D.box(0.16, 0.16, w, PAPER, 0, 0.08, 0); for (const s of [-1, 1]) D.box(0.16, 0.14, Math.hypot(w, h) - 0.2, PAPER, 0, h / 2, 0, 0, s * Math.atan2(h, w));
      const g = new THREE.Group(); g.position.set(x, 0, z); D.mesh(g); G.add(g); return g; };
    for (const s of [-1, 1]) door(BX1 + 0.32, DZ + s * 3.85, 2.6, 4.6); for (const s of [-1, 1]) door(BX0 - 0.32, DZ + s * 3.2, 2.0, 4.0);
    R.box(0.2, 0.2, 13.4, DARK, BX1 + 0.42, 4.75, DZ); R.box(0.2, 0.2, 10.4, DARK, BX0 - 0.42, 4.15, DZ);   // door rails
    // walls: colliders (door gaps E 5 m, W 4 m)
    rect(BX0, BX1, BZ0 - 0.18, BZ0 + 0.18); rect(BX0, BX1, BZ1 - 0.18, BZ1 + 0.18);
    rect(BX1 - 0.18, BX1 + 0.18, BZ0, DZ - 2.5); rect(BX1 - 0.18, BX1 + 0.18, DZ + 2.5, BZ1); rect(BX0 - 0.18, BX0 + 0.18, BZ0, DZ - 2.0); rect(BX0 - 0.18, BX0 + 0.18, DZ + 2.0, BZ1);
    // roof (gambrel: 4 slabs) + ridge cap + a rooster weathervane
    const slab = (z0, y0, z1, y1) => { const L = Math.hypot(z1 - z0, y1 - y0), a = Math.atan2(y1 - y0, z1 - z0); RF.box(BX1 - BX0 + 0.8, 0.18, L + 0.12, ROOF, BCX, (y0 + y1) / 2 + 0.09, (z0 + z1) / 2, 0, -a); };
    slab(BZ0 - 0.5, EAVE - 0.3, BZ0 + 4, KNEE); slab(BZ0 + 4, KNEE, BCZ, RIDGE); slab(BZ1 + 0.5, EAVE - 0.3, BZ1 - 4, KNEE); slab(BZ1 - 4, KNEE, BCZ, RIDGE);
    RF.box(BX1 - BX0 + 0.9, 0.24, 0.5, PAPER, BCX, RIDGE + 0.12, BCZ); RF.cyl(0.03, 0.03, 1.4, DARK, BCX, RIDGE + 0.8, BCZ, 6);
    RF.box(0.5, 0.3, 0.1, INK, BCX, RIDGE + 1.6, BCZ); RF.box(0.16, 0.24, 0.1, INK, BCX + 0.25, RIDGE + 1.84, BCZ); RF.box(0.12, 0.08, 0.1, RED, BCX + 0.28, RIDGE + 2.0, BCZ); RF.box(0.24, 0.36, 0.06, INK, BCX - 0.28, RIDGE + 1.8, BCZ, 0, 0, 0.4);
    for (const [dx, t] of [[0.8, 'E'], [-0.8, 'W']]) RF.box(0.24, 0.05, 0.05, DARK, BCX + dx * 0.5, RIDGE + 1.1, BCZ);
    plane(board('RUSSET ORCHARD', 'APPLES \u00b7 CIDER \u00b7 SINCE 1912', BARND, PAPER, YEL, 1024, 200), 5.0, 0.95, BX1 + 0.2, 5.75, DZ, PI / 2); }
  const roofM = RF.mesh(G);
  // ================= barn inside: hay loft + ladder, stalls, cider press, crates, workbench =================
  const LOFT = { z1: BZ0 + 6.6, y: 3.2 };
  { LF.box(BX1 - BX0 - 0.6, 0.16, LOFT.z1 - BZ0 - 0.3, WOOD, BCX, LOFT.y, (BZ0 + LOFT.z1) / 2 + 0.15); for (let x = BX0 + 1; x < BX1 - 0.5; x += 0.9) LF.box(0.05, 0.9, 0.05, WOODD, x, LOFT.y + 0.45, LOFT.z1);
    LF.box(BX1 - BX0 - 0.6, 0.08, 0.08, WOODD, BCX, LOFT.y + 0.9, LOFT.z1);
    for (let i = 0; i < 9; i++) { const x = BX0 + 1.6 + i * 2.0, r = i % 3; LF.box(1.4, 0.55, 0.75, r ? HAY : HAYD, x, LOFT.y + 0.36, BZ0 + 1.3 + (i % 2) * 0.9); if (r === 0) LF.box(1.4, 0.55, 0.75, HAY, x + 0.1, LOFT.y + 0.9, BZ0 + 1.6); }
    for (const x of [BX0 + 5, BCX, BX1 - 5]) { R.box(0.22, LOFT.y, 0.22, WOODD, x, LOFT.y / 2, LOFT.z1 - 0.1); ring(x, LOFT.z1 - 0.1, 0.18); }
    const lx = BCX + 2.5; for (const s of [-1, 1]) R.box(0.08, LOFT.y + 1.0, 0.08, WOOD, lx + s * 0.25, (LOFT.y + 1.0) / 2, LOFT.z1 + 0.35, 0, -0.18); for (let i = 1; i < 8; i++) R.box(0.5, 0.05, 0.05, WOOD, lx, i * 0.5, LOFT.z1 + 0.35 + 0.09 * (8 - i) * 0.5 - 0.1);
    // 2 stalls under the loft (west): half walls + gates, feed trough, Clover the goat in the first
    for (const x of [BX0 + 0.3, BX0 + 4.3, BX0 + 8.3]) { R.box(0.12, 1.4, 5.6, WOOD, x, 0.7, BZ0 + 3.1); rect(x - 0.08, x + 0.08, BZ0 + 0.3, BZ0 + 5.9); }
    for (const x0 of [BX0 + 0.3, BX0 + 4.3]) { R.box(3.9, 0.12, 0.08, WOOD, x0 + 2, 1.3, BZ0 + 5.9); R.box(3.9, 0.12, 0.08, WOOD, x0 + 2, 0.7, BZ0 + 5.9); rect(x0, x0 + 4, BZ0 + 5.85, BZ0 + 5.95); R.box(2.0, 0.4, 0.5, WOODD, x0 + 2, 0.5, BZ0 + 0.7); }
    R.box(0.6, 0.6, 0.6, HAY, BX0 + 6.3, 0.3, BZ0 + 1.6);
    plane(board('CLOVER', 'DO NOT FEED HER THE HAT', PAPER, INK, RED, 512, 200), 0.9, 0.35, BX0 + 2.3, 1.75, BZ0 + 5.96, 0);
    // cider press (by the walkway, Rusty's spot), apple crates, workbench, lanterns, a barrel
    const px = BX1 - 6.2, pz = DZ + 2.4; R.box(1.4, 0.9, 1.4, WOODD, px, 0.45, pz); R.cyl(0.55, 0.55, 0.7, WOOD, px, 1.25, pz, 12); for (let i = 0; i < 8; i++) R.box(0.06, 0.72, 0.06, WOODD, px + Math.cos(i * PI / 4) * 0.55, 1.25, pz + Math.sin(i * PI / 4) * 0.55);
    R.box(0.14, 1.6, 0.14, DARK, px, 2.2, pz); R.box(1.6, 0.12, 0.12, DARK, px, 3.0, pz); R.cyl(0.05, 0.05, 1.2, STEEL(), px, 2.9, pz, 6, 0, PI / 2); rect(px - 0.75, px + 0.75, pz - 0.75, pz + 0.75);
    plane(board('CIDER PRESS', 'COLD + CLOUDY \u00b7 ASK RUSTY', YEL, INK, BARN, 512, 200), 1.0, 0.39, px, 0.55, pz - 0.71, PI);
    const crate = (x, y, z, full = true, ry = 0) => { R.box(0.72, 0.46, 0.5, '#b88a5c', x, y + 0.23, z, ry); R.box(0.76, 0.05, 0.54, WOODD, x, y + 0.44, z, ry); if (full) for (let i = 0; i < 6; i++) R.sph(0.1, i % 3 ? '#b8301f' : '#d4462a', x - 0.22 + (i % 3) * 0.22, y + 0.5, z - 0.1 + Math.floor(i / 3) * 0.2); };
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) crate(BX0 + 9 + i * 0.85, k * 0.5, BZ1 - 0.6, k === 1 || i % 2 === 0); rect(BX0 + 8.6, BX0 + 12.6, BZ1 - 0.9, BZ1 - 0.3);
    for (let i = 0; i < 3; i++) crate(BX1 - 3.2, i * 0.5, BZ1 - 0.6, i === 2); rect(BX1 - 3.6, BX1 - 2.8, BZ1 - 0.9, BZ1 - 0.3);
    R.box(3.0, 0.9, 0.8, WOOD, BX0 + 2.2, 0.45, BZ1 - 0.7); R.box(3.1, 0.08, 0.9, WOODD, BX0 + 2.2, 0.92, BZ1 - 0.7); rect(BX0 + 0.6, BX0 + 3.8, BZ1 - 1.15, BZ1 - 0.3);
    for (const [x, c] of [[BX0 + 1.2, '#8a8f97'], [BX0 + 2.0, '#b0623f'], [BX0 + 3.0, '#3f7a52']]) R.box(0.3, 0.12, 0.18, c, x, 1.02, BZ1 - 0.7);
    R.cyl(0.42, 0.42, 1.0, '#7a5236', BX1 - 1.3, 0.5, DZ - 4.2, 12); R.cyl(0.44, 0.44, 0.06, DARK, BX1 - 1.3, 0.25, DZ - 4.2, 12); R.cyl(0.44, 0.44, 0.06, DARK, BX1 - 1.3, 0.75, DZ - 4.2, 12); ring(BX1 - 1.3, DZ - 4.2, 0.45);
    for (const [x, z] of [[BX0 + 6, DZ], [BX1 - 7, DZ]]) { R.box(0.02, 1.2, 0.02, INK, x, 4.6, z); R.box(0.22, 0.32, 0.22, '#ffd38a', x, 3.9, z); R.box(0.26, 0.05, 0.26, INK, x, 4.08, z); } }
  const loftM = LF.mesh(G);
  // ================= the farmyard: Rusty's apple stand, cart, well, trough, chicken coop, windmill, the orchard arch =================
  const STAND = [-14, -213.6];
  { const [sx, sz] = STAND; R.box(2.6, 0.9, 1.0, WOOD, sx, 0.45, sz); R.box(2.7, 0.08, 1.1, WOODD, sx, 0.92, sz); for (const dx of [-1.25, 1.25]) for (const dz of [-0.45, 0.45]) R.box(0.1, 2.4, 0.1, WOODD, sx + dx, 1.2, sz + dz);
    for (let i = 0; i < 7; i++) { const t = i % 2; R.box(0.4, 0.04, 1.3, t ? PAPER : BARN, sx - 1.2 + i * 0.4, 2.45 - 0.08 * Math.abs(i - 3) * 0, sz - 0.05, 0, -0.18); }
    for (let i = 0; i < 3; i++) { R.box(0.7, 0.3, 0.5, '#b88a5c', sx - 0.8 + i * 0.8, 1.11, sz - 0.15); for (let k = 0; k < 6; k++) R.sph(0.1, k % 2 ? '#b8301f' : '#d4462a', sx - 1.0 + i * 0.8 + (k % 3) * 0.2, 1.32, sz - 0.25 + Math.floor(k / 3) * 0.18); }
    rect(sx - 1.35, sx + 1.35, sz - 0.55, sz + 0.55);
    plane(board('RUSTY\u2019S APPLES', 'PICKED TODAY \u00b7 I BUY YOURS TOO', BARN, PAPER, YEL, 1024, 200), 2.4, 0.46, sx, 1.75, sz - 0.56, PI); }
  { const cx = -14.6, cz = -240; R.box(1.6, 0.12, 3.0, WOOD, cx, 0.75, cz); for (const s of [-1, 1]) R.box(0.08, 0.5, 3.0, WOOD, cx + s * 0.78, 1.05, cz); R.box(1.6, 0.5, 0.08, WOOD, cx, 1.05, cz - 1.48);
    for (const s of [-1, 1]) { R.cyl(0.55, 0.55, 0.1, WOODD, cx + s * 0.88, 0.55, cz + 0.6, 14, 0, PI / 2); R.cyl(0.08, 0.08, 0.14, DARK, cx + s * 0.92, 0.55, cz + 0.6, 6, 0, PI / 2); } R.box(0.08, 0.08, 1.8, WOOD, cx, 0.6, cz + 2.3, 0, 0.3);
    for (let i = 0; i < 4; i++) { R.box(0.7, 0.46, 0.5, '#b88a5c', cx - 0.38 + (i % 2) * 0.76, 1.04 + Math.floor(i / 2) * 0.48, cz - 0.6 + (i % 2) * 0.1); for (let k = 0; k < 3; k++) R.sph(0.1, '#c0392b', cx - 0.58 + (i % 2) * 0.76 + k * 0.2, 1.3 + Math.floor(i / 2) * 0.48, cz - 0.6); }
    rect(cx - 0.95, cx + 0.95, cz - 1.6, cz + 1.6); }
  { const wx = -15.2, wz = -230.6; R.cyl(0.9, 0.95, 0.9, '#8a857e', wx, 0.45, wz, 14); R.cyl(0.75, 0.75, 0.05, '#2a3a4a', wx, 0.88, wz, 14); for (const s of [-1, 1]) R.box(0.12, 1.8, 0.12, WOODD, wx + s * 0.8, 1.5, wz);
    R.box(1.8, 0.1, 0.1, WOODD, wx, 2.35, wz); R.put(new THREE.ConeGeometry(1.25, 0.8, 4), wx, 2.85, wz, BARND, PI / 4); R.cyl(0.18, 0.18, 0.28, '#7a5236', wx + 0.1, 1.6, wz, 8); ring(wx, wz, 1.0); }
  { const tx = -19.6, tz = -234.5; R.box(2.2, 0.5, 0.7, '#7a8a96', tx, 0.25, tz); R.box(2.0, 0.04, 0.5, '#5aa8c8', tx, 0.48, tz); rect(tx - 1.1, tx + 1.1, tz - 0.35, tz + 0.35); }
  const COOP = [-28, -201.6];
  { const [cx, cz] = COOP; R.box(3.0, 1.6, 2.2, '#c9a27a', cx, 1.0, cz); for (const s of [-1, 1]) R.box(0.12, 0.2, 0.12, WOODD, cx + s * 1.4, 0.1, cz); R.put(new THREE.ConeGeometry(2.2, 1.0, 4), cx, 2.3, cz, BARN, PI / 4, 0, 0, 1, 1, 0.75);
    R.box(0.7, 0.8, 0.06, '#3d2a1a', cx, 0.8, cz + 1.12); R.box(0.5, 0.06, 1.4, WOOD, cx, 0.35, cz + 1.8, 0, 0.45); rect(cx - 1.55, cx + 1.55, cz - 1.15, cz + 1.15);
    plane(board('THE COOP', 'HENS ONLY \u00b7 NO FOXES', PAPER, INK, RED, 512, 200), 1.0, 0.39, cx, 1.55, cz + 1.12, 0); }
  // the windmill (a landmark you can see from the Castle Path)
  const MILL = [-16.8, -200.4];
  const sails = new THREE.Group(); { const [mx, mz] = MILL; R.put(new THREE.CylinderGeometry(1.2, 2.0, 9, 8), mx, 4.5, mz, PAPER); for (const y of [2.5, 5.5]) R.cyl(1.98 - y * 0.09, 2.0 - y * 0.09, 0.4, BARN, mx, y, mz, 8);
    R.put(new THREE.ConeGeometry(1.55, 1.6, 8), mx, 9.8, mz, BARND); R.box(0.8, 1.4, 0.1, '#3d2a1a', mx, 0.7, mz + 1.98); R.box(0.5, 0.6, 0.08, '#3a5f8a', mx + 1.2, 5.5, mz + 1.5, 0.6); ring(mx, mz, 2.1);
    sails.position.set(mx, 9.2, mz + 1.75); G.add(sails); const S = mk(); S.cyl(0.25, 0.25, 0.5, DARK, 0, 0, 0, 10, PI / 2); for (let k = 0; k < 4; k++) { const a = k * PI / 2, g = new THREE.Group(); g.rotation.z = a; sails.add(g);
      const SG = mk(); SG.box(0.14, 5.0, 0.08, WOODD, 0, 2.7, 0.2); SG.box(1.0, 4.0, 0.04, PAPER, 0.55, 3.0, 0.22); for (let i = 0; i < 5; i++) SG.box(1.1, 0.05, 0.06, WOODD, 0.55, 1.2 + i * 0.9, 0.25); SG.mesh(g); } S.mesh(sails); }
  // the arch over the Castle Path wall gap
  { const [gx, gz] = FARM_A.gap; for (const s of [-1, 1]) { R.box(0.3, 4.4, 0.3, WOODD, gx - 0.6, 2.2, gz + s * 2.8); } R.box(0.4, 0.4, 6.2, WOODD, gx - 0.6, 4.4, gz);
    plane(board('RUSSET ORCHARD', 'APPLES \u00b7 CIDER \u00b7 RUSTY RUSSET', BARN, PAPER, YEL, 1024, 200), 4.4, 0.85, gx - 0.38, 3.75, gz, PI / 2);
    plane(board('RUSSET ORCHARD', 'MIND THE CROWS', BARN, PAPER, YEL, 1024, 200), 4.4, 0.85, gx - 0.82, 3.75, gz, -PI / 2);
    for (let i = 0; i < 4; i++) R.sph(0.11, '#c0392b', gx - 0.6, 4.1, gz - 1.5 + i * 1.0); }
  // ================= THE ORCHARD: rows of apple trees (instanced) =================
  const TREES = []; const addTree = (x, z) => TREES.push({ x: x + (rnd() - 0.5) * 0.6, z: z + (rnd() - 0.5) * 0.6, s: 0.9 + rnd() * 0.22, a0: rnd() * 6, ap: 4 + Math.floor(rnd() * 3), rt: 0, job: false, crow: null, dirty: true });
  const SKIP = new Set(['-66,-236', '-54,-200', '-72,-248']);
  for (const x of [-78, -72, -66, -60, -54, -48]) for (const z of [-200, -206, -212, -224, -230, -236, -242, -248, -254, -259]) if (!SKIP.has(x + ',' + z)) addTree(x, z);
  for (const x of [-38, -32, -26, -20]) for (const z of [-234, -240, -246, -252, -258]) addTree(x, z);
  const NT = TREES.length, AP = 6, Z0 = new THREE.Matrix4().makeScale(0, 0, 0), M4 = new THREE.Matrix4(), Qn = new THREE.Quaternion();
  const trunkI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13, 0.21, 2.3, 7).translate(0, 1.15, 0), lam('#6e4a2c'), NT);
  const leafA = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.75, 1), lam('#3f7a2a'), NT), leafB = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.15, 1), lam('#5f9a3a'), NT);
  const appleI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.13, 7, 5), lam('#c0302a'), NT * AP);
  const SLOT = []; for (let k = 0; k < AP; k++) { const a = k / AP * PI * 2 + (k % 2) * 0.4; SLOT.push([Math.cos(a) * 1.5, 2.45 + (k % 3) * 0.35, Math.sin(a) * 1.5]); }
  TREES.forEach((t, i) => { M4.compose(V(t.x, 0, t.z), Qn.setFromAxisAngle(V(0, 1, 0), t.a0), V(t.s, t.s, t.s)); trunkI.setMatrixAt(i, M4);
    M4.compose(V(t.x, 3.0 * t.s, t.z), Qn, V(t.s, t.s * 0.85, t.s)); leafA.setMatrixAt(i, M4); M4.compose(V(t.x + Math.cos(t.a0) * 0.7, 3.7 * t.s, t.z + Math.sin(t.a0) * 0.7), Qn, V(t.s, t.s, t.s)); leafB.setMatrixAt(i, M4); ring(t.x, t.z, 0.3); });
  for (const m of [trunkI, leafA, leafB, appleI]) { m.frustumCulled = false; G.add(m); }
  const syncApples = t => { const i = TREES.indexOf(t); for (let k = 0; k < AP; k++) { if (k < t.ap) { const s = SLOT[(k + Math.round(t.a0)) % AP]; M4.compose(V(t.x + s[0] * t.s, s[1] * t.s, t.z + s[2] * t.s), Qn, V(1, 1, 1)); appleI.setMatrixAt(i * AP + k, M4); } else appleI.setMatrixAt(i * AP + k, Z0); } t.dirty = false; appleI.instanceMatrix.needsUpdate = true; };
  TREES.forEach(syncApples);
  // ================= split-rail fence round the orchard (every section breaks) =================
  const FEN = []; const fenceRun = (x0, z0, x1, z1, gaps = []) => { const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) { const u0 = i / n, u1 = (i + 1) / n, ax = x0 + (x1 - x0) * u0, az = z0 + (z1 - z0) * u0, bx = x0 + (x1 - x0) * u1, bz = z0 + (z1 - z0) * u1, mx = (ax + bx) / 2, mz = (az + bz) / 2;
      if (gaps.some(([g0, g1]) => { const c = x0 === x1 ? mz : mx; return c > g0 && c < g1; })) continue;
      FEN.push({ ax, az, bx, bz, x: mx, z: mz, ry, len: L / n, hp: 1, broken: false, t: 0, col: rect(Math.min(ax, bx) - 0.08, Math.max(ax, bx) + 0.08, Math.min(az, bz) - 0.08, Math.max(az, bz) + 0.08) }); } };
  fenceRun(LX0, LZ1, LX0, LZ0, [[-221, -215], [-243, -237]]); fenceRun(LX0, LZ0, LX1, LZ0, [[-48, -42], [-17, -12]]); fenceRun(LX0, LZ1, BX0 - 1, LZ1, [[-48, -42]]);
  const postI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1.15, 0.16).translate(0, 0.575, 0), lam(WOODD), FEN.length), railI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.12, 1).translate(0, 0, 0), lam(WOOD), FEN.length * 2);
  const syncFence = (f, i) => { if (f.broken) { postI.setMatrixAt(i, Z0); railI.setMatrixAt(i * 2, Z0); railI.setMatrixAt(i * 2 + 1, Z0); }
    else { const q = Qn.setFromAxisAngle(V(0, 1, 0), f.ry); M4.compose(V(f.ax, 0, f.az), q, V(1, 1, 1)); postI.setMatrixAt(i, M4); for (const [k, y] of [[0, 0.45], [1, 0.95]]) { M4.compose(V(f.x, y, f.z), q, V(1, 1, f.len)); railI.setMatrixAt(i * 2 + k, M4); } }
    postI.instanceMatrix.needsUpdate = railI.instanceMatrix.needsUpdate = true; f.col.on = !f.broken; };
  FEN.forEach(syncFence); for (const m of [postI, railI]) { m.frustumCulled = false; G.add(m); }
  // ================= cover: hay bales (round + square stacks) + scarecrows (both stop shots) =================
  const HAYS = [], SCARE = [];
  const roundBale = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const B = mk(); B.cyl(0.78, 0.78, 1.25, HAY, 0, 0.78, 0, 16, 0, PI / 2); for (const s of [-1, 1]) B.cyl(0.62, 0.62, 0.02, HAYD, s * 0.63, 0.78, 0, 16, 0, PI / 2); for (const s of [-0.3, 0.3]) B.cyl(0.8, 0.8, 0.05, '#c0392b', s, 0.78, 0, 16, 0, PI / 2); B.mesh(g); G.add(g);
    HAYS.push({ g, x, z, r: 0.95, t: 0 }); rect(x - 0.8, x + 0.8, z - 0.8, z + 0.8); };
  const squareStack = (x, z, ry, n = 3) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; const B = mk(); const L = [[0, 0, 0], [0, 0, 0.62], [0, 0.5, 0.31], [1.25, 0, 0.31]].slice(0, n + 1);
    for (const [ox, oy, oz] of L) { B.box(1.2, 0.5, 0.6, HAY, ox, 0.25 + oy, oz); for (const s of [-0.3, 0.3]) B.box(0.03, 0.51, 0.61, '#c0392b', ox + s, 0.25 + oy, oz); } B.mesh(g); G.add(g); HAYS.push({ g, x, z, r: n > 2 ? 1.25 : 0.9, t: 0 });
    const w = n > 2 ? 1.6 : 0.7, rot = Math.abs(Math.sin(ry)) > 0.7; if (rot) rect(x - 0.8, x + 0.8, z - w, z + w); else rect(x - w, x + w, z - 0.8, z + 0.8); };
  for (const [x, z, ry] of [[-75, -209, 0.3], [-69, -227, 1.2], [-57, -251, 0.4], [-51, -203, 1.4], [-63, -239, 2.2], [-45, -229, 0.1], [-23, -243, 1.6], [-13.4, -206.4, 0.5]]) roundBale(x, z, ry);
  for (const [x, z, ry] of [[-44.4, -211, PI / 2], [-44.4, -247, PI / 2], [-35, -255.5, 0], [-63, -213, 0], [-75, -253, PI / 2]]) squareStack(x, z, ry);
  const scarecrow = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; G.add(g); const sw = new THREE.Group(); g.add(sw); const S = mk();
    S.box(0.12, 2.6, 0.12, WOODD, 0, 1.3, 0); S.box(1.9, 0.1, 0.1, WOODD, 0, 1.9, 0); S.box(0.6, 0.8, 0.36, '#b8392b', 0, 1.65, 0); for (let i = 0; i < 3; i++) S.box(0.61, 0.04, 0.37, '#7a1e16', 0, 1.35 + i * 0.25, 0); S.box(0.07, 0.8, 0.37, '#7a1e16', 0, 1.65, 0);
    for (const s of [-1, 1]) { S.box(0.7, 0.2, 0.22, '#3a5f8a', s * 0.62, 1.88, 0); for (let i = 0; i < 4; i++) S.box(0.04, 0.22, 0.04, HAY, s * 0.98, 1.74, -0.08 + i * 0.05); }
    S.box(0.5, 0.55, 0.36, '#3a5f8a', 0, 1.05, 0); for (let i = 0; i < 6; i++) S.box(0.04, 0.24, 0.04, HAY, -0.2 + i * 0.08, 0.72, 0.02);
    S.sph(0.3, '#d8c49a', 0, 2.35, 0); S.box(0.08, 0.08, 0.02, INK, -0.1, 2.42, 0.29); S.box(0.08, 0.08, 0.02, INK, 0.1, 2.42, 0.29); S.box(0.22, 0.03, 0.02, INK, 0, 2.27, 0.29);
    S.cyl(0.55, 0.55, 0.05, '#e3c46a', 0, 2.58, 0, 14); S.cyl(0.24, 0.3, 0.3, '#e3c46a', 0, 2.75, 0, 12); S.cyl(0.305, 0.305, 0.07, RED, 0, 2.64, 0, 12); S.mesh(sw);
    SCARE.push({ g, sw, x, z, r: 0.55, k: 0, v: 0 }); ring(x, z, 0.35); };
  for (const [x, z, ry] of [[-63, -218.6, 0.4], [-45, -237.5, -0.6], [-69, -245, 0.9], [-29, -249, 2.6]]) scarecrow(x, z, ry);
  // ================= breakable crate stacks (loot) =================
  const CRATES = [];
  const crateStack = (x, z, n) => { const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g); const B = mk(); for (let i = 0; i < n; i++) { const ox = i === 2 ? 0.38 : (i % 2) * 0.76 - 0.38, oy = i === 2 ? 0.5 : 0; B.box(0.72, 0.48, 0.52, '#b88a5c', ox, oy + 0.24, 0); B.box(0.74, 0.06, 0.54, WOODD, ox, oy + 0.42, 0); B.box(0.74, 0.06, 0.54, WOODD, ox, oy + 0.06, 0); }
    B.mesh(g); CRATES.push({ g, x, z, hp: 2, broken: false, t: 0, shake: 0, col: rect(x - 0.8, x + 0.8, z - 0.3, z + 0.3) }); };
  for (const [x, z, n] of [[-45.2, -221.4, 3], [-57, -257.2, 2], [-75, -233, 3], [-23, -229.5, 2], [-17.4, -211.8, 3], [-63, -203.2, 2], [-51, -245, 2], [-35.2, -237, 3]]) crateStack(x, z, n);
  // ================= debris + loot pops =================
  const DEB = Array.from({ length: touch ? 18 : 30 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.12), lam('#b88a5c')); m.visible = false; G.add(m); return { m, v: V(), t: 0, w: V() }; });
  let debI = 0; const debris = (x, y, z, n, col) => { for (let i = 0; i < n; i++) { const d = DEB[debI++ % DEB.length]; d.m.material.color.set(col || '#b88a5c'); d.m.position.set(x + (Math.random() - 0.5) * 0.6, y, z + (Math.random() - 0.5) * 0.6); d.v.set((Math.random() - 0.5) * 4, 2.5 + Math.random() * 2.5, (Math.random() - 0.5) * 4); d.w.set(Math.random() * 9, Math.random() * 9, Math.random() * 9); d.t = 1.6; d.m.visible = true; } };
  const POPS = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12), new THREE.MeshBasicMaterial({ color: YEL })); m.rotation.x = PI / 2; m.visible = false; G.add(m); return { m, t: 0, y0: 0 }; });
  let popI = 0; const pop = (x, z, n, col = YEL) => { for (let i = 0; i < n; i++) { const p = POPS[popI++ % POPS.length]; p.m.material.color.set(col); p.m.position.set(x + (Math.random() - 0.5) * 0.8, 0.8, z + (Math.random() - 0.5) * 0.8); p.t = 1.0 + i * 0.08; p.m.visible = true; } };
  // ================= chickens (wander the farmyard; bolt to the coop in a fight) =================
  const HENS = Array.from({ length: touch ? 4 : 6 }, (_, i) => { const g = new THREE.Group(); const C = mk(), wh = i % 3 === 2 ? '#a0522d' : PAPER;
    C.sph(0.22, wh, 0, 0.36, 0, 0.85); C.sph(0.12, wh, 0.18, 0.56, 0); C.box(0.04, 0.08, 0.1, RED, 0.2, 0.68, 0); C.put(new THREE.ConeGeometry(0.035, 0.09, 5), 0.3, 0.55, 0, YEL, 0, 0, -PI / 2); C.box(0.12, 0.16, 0.04, wh, -0.2, 0.48, 0, 0, 0, 0.5);
    for (const s of [-1, 1]) C.box(0.02, 0.18, 0.02, '#e0a800', 0, 0.1, s * 0.06); C.mesh(g); g.position.set(-18 + (i % 3) * 1.5, 0, -205 - Math.floor(i / 3) * 1.6); G.add(g);
    return { g, tx: g.position.x, tz: g.position.z, wt: Math.random() * 3, peck: 0, home: [COOP[0] + (i - 2) * 0.35, COOP[1] + 2.3], hid: false, ph: i * 1.3 }; });
  // ================= Clover the goat (in her stall) =================
  const goat = new THREE.Group(); { const Gt = mk(); Gt.box(0.9, 0.45, 0.4, '#e9e4da', 0, 0.75, 0); for (const sx of [-0.32, 0.32]) for (const sz of [-0.14, 0.14]) Gt.box(0.08, 0.5, 0.08, '#c9c4bc', sx, 0.27, sz); Gt.box(0.08, 0.12, 0.06, '#c9c4bc', -0.48, 0.95, 0, 0, 0, -0.6);
    Gt.mesh(goat); const head = new THREE.Group(); head.position.set(0.5, 1.0, 0); goat.add(head); const H = mk(); H.box(0.32, 0.26, 0.24, '#e9e4da', 0.12, 0, 0); for (const s of [-1, 1]) { H.box(0.04, 0.2, 0.04, '#8a7a5a', 0.02, 0.2, s * 0.08, 0, 0, 0.4); H.box(0.14, 0.05, 0.08, '#e9e4da', 0.0, 0.05, s * 0.15); } H.box(0.06, 0.1, 0.04, '#e9e4da', 0.22, -0.18, 0); H.box(0.03, 0.03, 0.02, INK, 0.25, 0.05, 0.1); H.box(0.03, 0.03, 0.02, INK, 0.25, 0.05, -0.1); H.mesh(head); goat.userData.head = head;
    goat.position.set(BX0 + 2.3, 0, BZ0 + 4.4); goat.rotation.y = -PI / 2 + 0.3; G.add(goat); }
  // ================= crows (the APPLE PICK job) =================
  const CROWS = Array.from({ length: touch ? 3 : 4 }, () => { const g = new THREE.Group(); const C = mk(); C.sph(0.2, '#1c1c22', 0, 0, 0, 0.8); C.sph(0.13, '#1c1c22', 0.2, 0.08, 0); C.put(new THREE.ConeGeometry(0.04, 0.14, 5), 0.34, 0.07, 0, '#3a3a3a', 0, 0, -PI / 2); C.box(0.2, 0.04, 0.16, '#1c1c22', -0.26, 0.02, 0, 0, 0, 0.2); C.mesh(g);
    const w = [-1, 1].map(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.03, 0.42).translate(0, 0, s * 0.21), lam('#26262e')); g.add(p); return p; }); g.visible = false; G.add(g); return { g, w, st: 'off', tree: null, t: 0, eat: 0, from: V(), to: V() }; });
  // ================= light: farmyard lanterns + barn door lamp, light pools at night (one additive instanced draw), glowing barn windows =================
  const radT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); r.addColorStop(0, '#ffffff'); r.addColorStop(0.4, '#666666'); r.addColorStop(1, '#000000'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const LAMPS = [[-19.6, -224.8], [-11.2, -219.2], [-19.6, -206.6], [-11.2, -233.4], [-44, -218]], lampM = new THREE.MeshBasicMaterial({ color: '#5a5654' });
  for (const [x, z] of LAMPS) { R.box(0.12, 2.6, 0.12, DARK, x, 1.3, z); R.box(0.5, 0.06, 0.06, DARK, x + 0.2, 2.6, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.22), lampM); m.position.set(x + 0.42, 2.38, z); G.add(m); ring(x, z, 0.12); }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.3), lampM); m.position.set(BX1 + 0.35, 4.95, DZ - 2.9); G.add(m); }
  const poolM = new THREE.MeshBasicMaterial({ map: radT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const POOL = [...LAMPS.map(([x, z]) => [x + 0.42, z, 2.8]), [BX1 + 1.4, DZ - 2.9, 3.4], [BX1 - 6, DZ, 4.0], [BX0 + 6, DZ, 4.0]];
  const pools = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-PI / 2), poolM, POOL.length); POOL.forEach(([x, z, r], i) => { M4.compose(V(x, 0.1, z), Qn.identity(), V(r * 2, 1, r * 2)); pools.setMatrixAt(i, M4); pools.setColorAt(i, cc.set('#ffcf80').multiplyScalar(0.7)); }); pools.renderOrder = 5; pools.frustumCulled = false; pools.visible = false; G.add(pools);
  const paneM = new THREE.MeshBasicMaterial({ color: '#2e3a46' }); for (const [x, y, z] of G.userData.panes) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), paneM); m.position.set(x, y, z); m.rotation.y = z < BCZ ? PI : 0; G.add(m); }
  const S = R.mesh(G);
  // ================= Rusty Russet + the shop kit (board, NOW HIRING, chime, sun patches, lamps, clock, browsers) =================
  const KPOSE = keeperPoser(THREE, ['k_inspect', 'hips', 'think', 'k_inspect']); const rusty = kit.makeFox({ key: 'farmRusty', joints: true, name: 'Rusty Russet', torso: ['#3a5f8a', '#b8392b', '#22384f'], outfit: 'vest', mood: 'happy', crest: '', look: { fur: '#b5582a', furDark: '#7a3a18' } });
  { const P2 = rusty.userData.P; if (P2 && P2.sword) P2.sword.visible = false; if (P2 && P2.gun) P2.gun.visible = false; if (P2 && P2.head) { const hat = new THREE.Group(); hat.position.set(0, 0.32, 0); P2.head.add(hat); const H = mk(); H.cyl(0.44, 0.44, 0.03, '#e3c46a', 0, 0, 0, 16); H.cyl(0.22, 0.26, 0.2, '#e3c46a', 0, 0.11, 0, 12); H.cyl(0.265, 0.265, 0.05, RED, 0, 0.04, 0, 12); H.mesh(hat); hat.rotation.z = -0.12; }
    if (P2 && P2.body) { const a = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.02), lam('#3a5f8a')); a.position.set(0, 0.93, 0.215); P2.body.add(a); for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.02), lam('#3a5f8a')); st.position.set(s * 0.14, 1.32, 0.22); P2.body.add(st); } } }
  const IN = [BX1 - 7.6, DZ, PI / 2], OUT = [STAND[0], STAND[1] + 1.35, PI];
  rusty.position.set(IN[0], 0, IN[1]); rusty.rotation.y = IN[2]; G.add(rusty);
  const GAMES = [{ k: 'apples', name: 'Apple Pick', color: BARN }];
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'farmA', color: BARN, boardTitle: 'Russet Orchard',
    room: { X0: BX0 + 0.3, X1: BX1 - 0.3, Z0: BZ0 + 0.3, Z1: BZ1 - 0.3 }, door: [BX1 - 0.8, DZ], keeper: null, games: GAMES, allGames: GAMES,
    board: { x: BX0 + 7.5, y: 2.5, z: BZ1 - 0.2, ry: PI, w: 1.3 }, hiring: { x: BX1 - 2.2, z: DZ + 3.3, ry: PI / 2 }, hiringLine: 'WALK UP \u00b7 APPLE PICK',
    sun: [{ x: BX0 + 4, z: BZ1 - 1.6, w: 1.8, d: 1.4 }, { x: BCX, z: BZ1 - 1.6, w: 1.8, d: 1.4 }, { x: BX1 - 3.2, z: DZ, w: 3.4, d: 2.6 }],
    lamps: [[BX0 + 6, 3.9, DZ], [BX1 - 7, 3.9, DZ]], browse: [[BX0 + 10.6, BZ1 - 1.6, 0], [BX0 + 2.3, BZ0 + 6.6, PI], [BX1 - 3.2, BZ1 - 1.6, 0]],
    clock: { x: BX1 - 4.6, y: 3.3, z: BZ1 - 0.2, ry: PI } });
  // ================= sound + toast + card =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.4) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, crack = () => { tone(180, 0.08, 0.15, 'square'); tone(90, 0.06, 0.25, 'triangle', 0.03); }, caw = () => { tone(520, 0.05, 0.12, 'sawtooth'); tone(430, 0.05, 0.16, 'sawtooth', 0.12); }, plop = () => tone(880, 0.05, 0.12, 'sine');
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; }, hideCard = () => { if (cardKey) { card.style.display = 'none'; cardKey = ''; } };
  // ================= Rusty: lines (every box 20 words or less) + menus (YES, PUT ME TO WORK! first · GOODBYE last) =================
  const TG = () => ({ key: 'farmRusty', name: 'Rusty Russet', role: 'RUSSET ORCHARD', obj: rusty, ry: rusty.rotation.y, r: 5 }), l = text => ({ who: 'Rusty Russet', role: 'RUSSET ORCHARD', text });
  const HI = ['Howdy, kid. Apples are ripe. Crows are hungry. Same as always.', 'Back again? Grab an apple off any tree. First one is free. They all are.', 'Wind is turning the mill. Good apple weather, kid.'];
  let hiN = 0, danger = false;
  function menu() { const met = save.stat('farmAMet', false); if (!met) save.setStat('farmAMet', true); const n = save.count ? save.count('apple') : 0;
    sayTo(TG(), [{ ...l(!met ? 'Rusty Russet. Russet Orchard. Best apples on the Castle Path, kid. The crows agree.' : HI[hiN++ % HI.length]), choices: [
      { text: CHOICE_WORK, pick: () => jobAsk() },
      { text: n ? 'SELL APPLES \u00b7 ' + n + ' IN YOUR BAG \u00b7 3 G EACH' : 'SELL APPLES \u00b7 3 G EACH', pick: () => sell() },
      { text: 'APPLE CIDER \u00b7 8 G \u00b7 +40 HP', pick: () => cider() },
      { text: 'WHAT\u2019S OUT THERE?', pick: () => sayTo(TG(), [l('Bandits come over the hills for my apples. Critters too. Mind yourself out there, kid.'), l('Hay bales and scarecrows stop a shot. Duck behind them.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(TG(), [l('Mind the crows, kid.')]) }] }]); }
  function sell() { const n = save.count ? save.count('apple') : 0; if (!n) { sayTo(TG(), [l('No apples in your bag, kid. The trees are full. Help yourself.')]); return; }
    for (let i = 0; i < n; i++) save.take('apple'); save.addGold(n * 3); coin(); toast('SOLD ' + n + ' APPLE' + (n > 1 ? 'S' : '') + ' \u00b7 +' + n * 3 + ' G', 2.6); sayTo(TG(), [l(n > 9 ? 'A whole basket! ' + n * 3 + ' gold, kid. The cider press thanks you.' : 'There you go, kid. ' + n * 3 + ' gold. Crisp ones too.')]); }
  function cider() { if (!save.spend(8)) { sayTo(TG(), [l('Eight gold a jug, kid. Pick and sell me some apples first.')]); return; } save.give('appleCider'); coin(); toast('APPLE CIDER \u00b7 IN YOUR BAG \u00b7 \u22128 G', 2.4); sayTo(TG(), [l('Cold and cloudy. Pressed it this morning. Drink it when the bandits get rough.')]); }
  // ================= JOB: APPLE PICK (10 apples before the crows, 75 s) =================
  let J = null; const GOAL = 10, TIME = 75;
  function jobAsk() { if (danger) { sayTo(TG(), [l('Not now, kid! Bandits! Chase them off first.')]); return; } sayTo(TG(), [l('Crows! Pick ten apples off the glowing trees before they do. Swing at a crow to shoo it.')], () => jobStart()); }
  function jobStart() { const pool = [...TREES].sort(() => Math.random() - 0.5).slice(0, 14);
    for (const t of pool) { t.job = true; t.ap = 6; t.dirty = true; } J = { t: TIME, got: 0, ate: 0, trees: pool, spawn: 4, cd: 3, over: false };
    for (const r of RINGS) r.visible = false; pool.forEach((t, i) => { const r = RINGS[i]; if (r) { r.position.set(t.x, 0.09, t.z); r.visible = true; r.userData.t = t; } });
    toast('APPLE PICK \u00b7 3 \u00b7 2 \u00b7 1 \u00b7 GO!', 2); ding(); }
  const RINGS = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 28), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false })); m.rotation.x = -PI / 2; m.visible = false; G.add(m); return m; });
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), new THREE.MeshBasicMaterial({ color: YEL })); arrow.rotation.x = PI; arrow.visible = false; G.add(arrow);
  function jobEnd(stopped) { if (!J) return; const got = J.got, ate = J.ate; J = null; for (const t of TREES) t.job = false; for (const r of RINGS) r.visible = false; arrow.visible = false; for (const c of CROWS) { if (c.st !== 'off') shoo(c, true); } hideCard();
    if (stopped) { sayTo(TG(), [l('Taking a break? The apples will wait. The crows won\u2019t.')]); return; }
    const stars = got >= GOAL ? (ate <= 3 ? 3 : 2) : got >= 5 ? 1 : 0;
    if (!stars) { sayTo(TG(), [l('The crows won this round, kid. Have another go when you\u2019re ready.')]); return; }
    const first = !save.stat('farmAStar_apples', 0), gold = stars * 6 + (first ? 12 : 0); save.addGold(gold); try { save.addXp && save.addXp(stars * 10); } catch (e) {} save.give('apple'); save.give('apple');
    K.finish('apples', stars, gold, first); sayTo(TG(), [l(stars === 3 ? 'Ten apples, barely a peck! You\u2019re a natural, kid. Keep two.' : stars === 2 ? 'Ten apples! The crows got their share, but so did we. Keep two.' : 'Not bad. The crows are clever birds. Here, two apples for trying.')]); }
  function shoo(c, quiet) { if (c.st === 'off' || c.st === 'flee') return; if (c.tree) c.tree.crow = null; c.st = 'flee'; c.t = 0; c.from.copy(c.g.position); c.to.set(c.g.position.x + (Math.random() - 0.5) * 30, 14, c.g.position.z - 20 - Math.random() * 10); if (!quiet) { caw(); toast('SHOO! \u00b7 THE CROW FLIES OFF', 1.4); } }
  function crowTick(dt, t) { if (J && !J.over) { J.cd -= dt; const on = CROWS.filter(c => c.st !== 'off').length; if (J.cd <= 0 && on < CROWS.length) { const free = J.trees.filter(q => q.ap > 0 && !q.crow); const c = CROWS.find(q => q.st === 'off');
        if (c && free.length) { const tr = free[Math.floor(Math.random() * free.length)]; tr.crow = c; c.tree = tr; c.st = 'fly'; c.t = 0; c.from.set(tr.x + (Math.random() - 0.5) * 40, 16, tr.z - 25); c.to.set(tr.x, 4.4 * tr.s + 0.1, tr.z); c.g.position.copy(c.from); c.g.visible = true; caw(); } J.cd = Math.max(2.2, 4.4 - J.ate * 0.15); } }
    for (const c of CROWS) { if (c.st === 'off') continue; c.t += dt; const flap = c.st === 'eat' ? Math.sin(t * 4) * 0.2 : Math.sin(t * 18) * 0.7; c.w[0].rotation.x = -flap; c.w[1].rotation.x = flap;
      if (c.st === 'fly') { const k = Math.min(1, c.t / 2.6); c.g.position.lerpVectors(c.from, c.to, k); c.g.position.y += Math.sin(k * PI) * 2; c.g.rotation.y = Math.atan2(c.to.x - c.from.x, c.to.z - c.from.z) - PI / 2; if (k >= 1) { c.st = 'eat'; c.eat = 2.2; } }
      else if (c.st === 'eat') { const tr = c.tree; c.g.position.set(tr.x + Math.sin(t * 0.7) * 0.3, 4.4 * tr.s + 0.1 + Math.abs(Math.sin(t * 6)) * 0.08, tr.z); c.g.rotation.z = Math.sin(t * 8) * 0.25; c.eat -= dt;
        if (c.eat <= 0) { c.eat = 2.2; if (tr.ap > 0) { tr.ap--; tr.dirty = true; if (J) J.ate++; caw(); } if (tr.ap <= 0) shoo(c, true); } }
      else if (c.st === 'flee') { const k = Math.min(1, c.t / 2.2); c.g.position.lerpVectors(c.from, c.to, k); c.g.rotation.z = 0; if (k >= 1) { c.st = 'off'; c.g.visible = false; c.tree = null; } } } }
  // ================= picking (E / TALK at any tree with apples) =================
  const nearTree = P => { let b = null, bd = 2.2; for (const t of TREES) { if (t.ap <= 0) continue; const d = dist(P, t.x, t.z); if (d < bd) { bd = d; b = t; } } return b; };
  const flyA = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), lam('#c0302a')); flyA.visible = false; G.add(flyA); let flyT = 0; const flyFrom = V(), flyTo = V();
  function pick(t, P) { t.ap--; t.dirty = true; t.rt = 0; plop(); flyFrom.set(t.x, 3.0, t.z); flyTo.set(P.x, 1.2, P.z); flyT = 0.35; flyA.visible = true;
    if (J) { if (t.crow) shoo(t.crow); J.got++; toast('APPLE ' + J.got + ' / ' + GOAL, 1.2); if (J.got >= GOAL) { J.over = true; setTimeout(() => jobEnd(false), 400); } return; }
    save.give('apple'); toast('APPLE \u00b7 +15 HP WHEN YOU EAT IT \u00b7 IN YOUR BAG', 1.8); }
  // ================= hits (melee + laser) and shot blockers =================
  function hitFence(f, i) { if (f.broken) return; f.broken = true; f.t = 0; syncFence(f, i); crack(); debris(f.x, 0.8, f.z, 4); }
  function hitCrate(c) { if (c.broken) return; c.hp--; c.shake = 0.3; crack(); if (c.hp > 0) return; c.broken = true; c.t = 0; c.g.visible = false; c.col.on = false; debris(c.x, 0.6, c.z, 8);
    if (Math.random() < 0.35) { save.give('apple'); pop(c.x, c.z, 2, '#c0302a'); toast('CRATE \u00b7 AN APPLE \u00b7 IN YOUR BAG', 1.8); } else { const g = 2 + Math.floor(Math.random() * 4); save.addGold(g); pop(c.x, c.z, g); coin(); toast('CRATE \u00b7 +' + g + ' G', 1.6); } }
  const wob = s => { s.v += 6; tone(300, 0.03, 0.1, 'triangle'); };
  const hits = (kind, P) => { if (!P || dist(P, (LX0 + LX1) / 2, (LZ0 + LZ1) / 2) > 70) return []; const R2 = kind === 'melee' ? 5 : 17, out = [];
    FEN.forEach((f, i) => { if (!f.broken && dist(P, f.x, f.z) < R2) out.push({ x: f.x, z: f.z, r: 0.6, onHit: () => hitFence(f, i), d: dist(P, f.x, f.z) }); });
    for (const c of CRATES) if (!c.broken && dist(P, c.x, c.z) < R2) out.push({ x: c.x, z: c.z, r: 0.8, onHit: () => hitCrate(c), d: dist(P, c.x, c.z) });
    for (const s of SCARE) if (dist(P, s.x, s.z) < R2) out.push({ x: s.x, z: s.z, r: 0.4, onHit: () => wob(s), d: dist(P, s.x, s.z) });
    for (const c of CROWS) if ((c.st === 'eat' || c.st === 'fly') && c.tree && dist(P, c.tree.x, c.tree.z) < R2 + 1) out.push({ x: c.tree.x, z: c.tree.z, r: 1.6, onHit: () => shoo(c), d: dist(P, c.tree.x, c.tree.z) - 3 });
    return out.sort((a, b) => b.d - a.d); };
  const blockers = () => [...HAYS.map(h => ({ x: h.x, z: h.z, r: h.r, onShot: () => { h.t = 0.3; debris(h.x, 1.0, h.z, 2, HAY); } })), ...SCARE.map(s => ({ x: s.x, z: s.z, r: s.r, onShot: () => wob(s) }))];
  (window.__m2hitSrc = window.__m2hitSrc || []).push(hits); (window.__m2blockers = window.__m2blockers || []).push(blockers);
  // ================= per frame =================
  const inBarn = P => !!P && P.x > BX0 + 0.2 && P.x < BX1 - 0.1 && P.z > BZ0 + 0.2 && P.z < BZ1 - 0.2 && (P.y || 0) < 3;
  const inLot = P => !!P && P.x > LX0 && P.x < LX1 + 3 && P.z > LZ0 && P.z < LZ1;
  let rw = null, waveT = 0, wasIn = false, lastP = null, nightOn = null, dangerT = 0, wasDanger = false;
  const rustyWant = () => { const h = hour(); return danger || h < 8 || h >= 17 ? 'in' : 'out'; };
  let rSide = rustyWant(); const placeR = k => { const p = k === 'out' ? OUT : IN; rusty.position.set(p[0], 0, p[1]); rusty.rotation.y = p[2]; rSide = k; rw = null; }; placeR(rSide);
  const RPTS = [[IN[0], IN[1]], [BX1 + 1.4, DZ], [BX1 + 3.2, DZ + 1.4], [-16.2, -212.4], [OUT[0], OUT[1]]];
  function rustyTick(dt, t, P) { const want = rustyWant(), A = rusty.userData.P && rusty.userData.P.arms;
    if (want !== rSide && !rw) { if (dist(P, rusty.position.x, rusty.position.z) > 50) placeR(want); else { rw = { pts: want === 'in' ? RPTS.slice(0, -1).reverse() : RPTS.slice(1), i: 0, to: want, sp: danger ? 3.4 : 1.5 }; rSide = 'walk'; } }
    if (rw) { const [tx, tz] = rw.pts[rw.i], dx = tx - rusty.position.x, dz = tz - rusty.position.z, dd = Math.hypot(dx, dz);
      if (dd < 0.08) { if (++rw.i >= rw.pts.length) placeR(rw.to); } else { const st = Math.min(dd, rw.sp * dt); rusty.position.x += dx / dd * st; rusty.position.z += dz / dd * st; rusty.rotation.y = Math.atan2(dx, dz); }
      kit.animFox && kit.animFox(rusty, dt, rw ? rw.sp : 0); KPOSE(rusty, dt, 'off'); return; }
    const home = rSide === 'out' ? OUT[2] : IN[2], d = dist(P, rusty.position.x, rusty.position.z), ins = inBarn(P);
    if (rSide === 'in' && ins && !wasIn) { waveT = 1.8; K.chime(); } wasIn = ins;
    const look = d < 4.5 && (rSide === 'out' || ins), a = look || waveT > 0 ? Math.atan2(P.x - rusty.position.x, P.z - rusty.position.z) : home + Math.sin(t * 0.5) * 0.2;
    rusty.rotation.y += Math.atan2(Math.sin(a - rusty.rotation.y), Math.cos(a - rusty.rotation.y)) * Math.min(1, dt * 3); kit.animFox && kit.animFox(rusty, dt, 0);
    if (KPOSE(rusty, dt, waveT > 0 ? 'wave' : d < 3 || d > 25 || !(rSide === 'out' || ins) ? null : 'idle')) { if (waveT > 0) waveT -= dt; return; }
    if (A && A[1]) { if (waveT > 0) { waveT -= dt; A[1].rotation.x = -2.7; A[1].rotation.z = 0.35 + Math.sin(t * 14) * 0.35; if (waveT <= 0) { A[1].rotation.x = 0; A[1].rotation.z = 0; } } } }
  function henTick(dt, t) { for (const h of HENS) { const g = h.g;
      if (danger) { const dx = h.home[0] - g.position.x, dz = h.home[1] - g.position.z, d = Math.hypot(dx, dz); if (d > 0.2) { const s = Math.min(d, 3.6 * dt); g.position.x += dx / d * s; g.position.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz) - PI / 2; g.position.y = Math.abs(Math.sin(t * 20 + h.ph)) * 0.08; } else if (!h.hid) { h.hid = true; g.visible = false; } continue; }
      if (h.hid) { h.hid = false; g.visible = true; }
      h.wt -= dt; if (h.wt <= 0) { h.wt = 2 + Math.random() * 4; h.tx = -20 + Math.random() * 8; h.tz = -238 + Math.random() * 34; if (Math.random() < 0.4) h.peck = 1.2; }
      const dx = h.tx - g.position.x, dz = h.tz - g.position.z, d = Math.hypot(dx, dz);
      if (h.peck > 0) { h.peck -= dt; g.rotation.z = -Math.abs(Math.sin(t * 14)) * 0.5; g.position.y = 0; }
      else if (d > 0.2) { const s = Math.min(d, 0.9 * dt); g.position.x += dx / d * s; g.position.z += dz / d * s; g.rotation.y = Math.atan2(dx, dz) - PI / 2; g.rotation.z = 0; g.position.y = Math.abs(Math.sin(t * 10 + h.ph)) * 0.04; } } }
  function tick(dt, P, fox) { if (!P) return; lastP = P; if (toastT > 0) toastT -= dt; const t = performance.now() / 1000, d = dist(P, (LX0 + LX1) / 2, (LZ0 + LZ1) / 2);
    G.visible = d < 150; if (d > 120) { hideCard(); return; }
    // danger = foes near the farm (gates, wilds): Rusty runs into the barn, the hens bolt for the coop
    dangerT -= dt; if (dangerT <= 0) { dangerT = 0.5; danger = threat(BCX - 15, BCZ - 10, 55) > 0; if (danger && !wasDanger && d < 70) toast('RUSTY: Bandits! I\u2019m bolting the barn, kid!', 2.6); wasDanger = danger; }
    K.tick(dt, P, { inShop: inBarn(P), busy: !!J, near: inBarn(P) ? 0 : dist(P, BCX, BCZ) });
    rustyTick(dt, t, P); henTick(dt, t);
    { const hd = goat.userData.head; hd.rotation.z = Math.sin(t * 0.8) * 0.15 - 0.1 + (Math.sin(t * 0.31) > 0.8 ? -0.4 : 0); hd.rotation.y = Math.sin(t * 0.5) * 0.3; }
    sails.rotation.z -= dt * 0.9;
    // the barn roof + the loft get out of the way when you are inside / under it
    const ins = inBarn(P); roofM.visible = !ins; loftM.visible = !(ins && P.z < LOFT.z1 + 1.2);
    // regrow apples, sync the instances
    for (const tr of TREES) { if (!tr.job && tr.ap < 4) { tr.rt += dt; if (tr.rt > 30) { tr.rt = 0; tr.ap++; tr.dirty = true; } } if (tr.dirty) syncApples(tr); }
    if (flyT > 0) { flyT -= dt; const k = 1 - Math.max(0, flyT) / 0.35; flyA.position.lerpVectors(flyFrom, flyTo, k); flyA.position.y += Math.sin(k * PI) * 1.2; if (flyT <= 0) flyA.visible = false; }
    // breakables come back when you are away
    FEN.forEach((f, i) => { if (f.broken && (f.t += dt) > 120 && dist(P, f.x, f.z) > 25) { f.broken = false; syncFence(f, i); } });
    for (const c of CRATES) { if (c.broken) { if ((c.t += dt) > 90 && dist(P, c.x, c.z) > 25) { c.broken = false; c.hp = 2; c.g.visible = true; c.col.on = true; } } else if (c.shake > 0) { c.shake -= dt; c.g.position.x = c.x + Math.sin(t * 60) * 0.05 * c.shake / 0.3; } }
    for (const s of SCARE) { s.v += (-s.k * 40 - s.v * 4) * dt; s.k += s.v * dt; s.sw.rotation.z = s.k * 0.12; }
    for (const h of HAYS) if (h.t > 0) { h.t -= dt; h.g.scale.setScalar(1 + Math.sin(h.t * 40) * 0.03); } else h.g.scale.setScalar(1);
    for (const db of DEB) { if (db.t <= 0) continue; db.t -= dt; db.v.y -= 12 * dt; db.m.position.addScaledVector(db.v, dt); if (db.m.position.y < 0.05) { db.m.position.y = 0.05; db.v.multiplyScalar(0.4); db.v.y = 0; } db.m.rotation.x += db.w.x * dt; db.m.rotation.y += db.w.y * dt; if (db.t <= 0) db.m.visible = false; }
    for (const p of POPS) { if (p.t <= 0) continue; p.t -= dt; p.m.position.y += dt * 2.2; p.m.rotation.z += dt * 8; if (p.t <= 0) p.m.visible = false; }
    // night
    const h = hour(), nt = h < 7 || h >= 18.5; if (nt !== nightOn) { nightOn = nt; pools.visible = nt; poolM.opacity = nt ? 1 : 0; lampM.color.set(nt ? '#fff2c8' : '#5a5654'); paneM.color.set(nt ? '#ffd38a' : '#2e3a46'); }
    // the job
    crowTick(dt, t);
    if (J) { if (!J.over) { J.t -= dt; if (J.t <= 0) { J.over = true; jobEnd(false); return; } }
      RINGS.forEach(r => { const tr = r.userData.t; if (!r.visible || !tr) return; r.material.color.set(tr.crow ? RED : YEL); r.scale.setScalar(1 + 0.08 * Math.sin(t * 4)); if (tr.ap <= 0) r.visible = false; });
      let nb = null, nd = 1e9; for (const tr of J.trees) { if (tr.ap <= 0) continue; const dd = dist(P, tr.x, tr.z); if (dd < nd) { nd = dd; nb = tr; } } arrow.visible = !!nb && nd > 2.5; if (nb) arrow.position.set(nb.x, 6.2 + Math.sin(t * 3) * 0.25, nb.z);
      const key = 'job' + J.got + '|' + J.ate + '|' + Math.ceil(J.t);
      setCard(key, '<div style="background:' + BARN + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px">APPLE PICK \u00b7 BEAT THE CROWS</div><div style="padding:8px 10px 10px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-weight:900"><div><div style="font-size:10px">APPLES</div><div style="font-size:20px">' + J.got + '/' + GOAL + '</div></div><div><div style="font-size:10px">TIME</div><div style="font-size:20px">' + Math.max(0, Math.ceil(J.t)) + '</div></div><div><div style="font-size:10px">CROWS ATE</div><div style="font-size:20px;color:' + (J.ate > 3 ? RED : INK) + '">' + J.ate + '</div></div></div>'); }
    else hideCard(); }
  // inside the barn the camera stays in the room (roof off), never outside the walls
  // a canopy right in front of the lens hides (the orchard lanes are tight)
  const leafM = (t, i, on) => { if (on) { M4.compose(V(t.x, 3.0 * t.s, t.z), Qn.identity(), V(t.s, t.s * 0.85, t.s)); leafA.setMatrixAt(i, M4); M4.compose(V(t.x + Math.cos(t.a0) * 0.7, 3.7 * t.s, t.z + Math.sin(t.a0) * 0.7), Qn, V(t.s, t.s, t.s)); leafB.setMatrixAt(i, M4); } else { leafA.setMatrixAt(i, Z0); leafB.setMatrixAt(i, Z0); } leafA.instanceMatrix.needsUpdate = leafB.instanceMatrix.needsUpdate = true; };
  function canopyFade(cam) { const cp = cam.position, P = lastP; for (let i = 0; i < NT; i++) { const t = TREES[i], dx = cp.x - t.x, dz = cp.z - t.z, near = dx * dx + dz * dz < 6.5 && cp.y > 1.2 && cp.y < 5.6;
      let block = false; if (!near && P) { const ax = P.x - cp.x, az = P.z - cp.z, L2 = ax * ax + az * az || 1, u = ((t.x - cp.x) * ax + (t.z - cp.z) * az) / L2; if (u > 0.05 && u < 0.85) { const px = cp.x + ax * u - t.x, pz = cp.z + az * u - t.z; block = px * px + pz * pz < 2.6 && cp.y < 6.5; } }
      const hide = near || block; if (hide !== !!t.hid) { t.hid = hide; leafM(t, i, !hide); } } }
  function camFix(cam) { const P = lastP; if (P && inLot(P)) canopyFade(cam); if (!P || !inBarn(P)) return; const cp = cam.position, x = clamp(cp.x, BX0 + 0.6, BX1 - 0.5), z = clamp(cp.z, BZ0 + 0.6, BZ1 - 0.6); if (x !== cp.x || z !== cp.z) { cp.x = x; cp.z = z; cam.lookAt(P.x, (P.y || 0) + 1.1, P.z); } }
  function prompt(P) { if (!inLot(P)) return null; if (J) { const tr = nearTree(P); if (tr && tr.job) return 'PICK \u00b7 APPLE ' + (J.got + 1) + ' / ' + GOAL; if (dist(P, rusty.position.x, rusty.position.z) < 2.6) return 'TALK \u00b7 RUSTY \u00b7 STOP THE JOB'; return null; }
    if (rSide !== 'walk' && dist(P, rusty.position.x, rusty.position.z) < 2.6) return 'TALK \u00b7 RUSTY';
    if (K.atHiring(P)) return 'NOW HIRING \u00b7 APPLE PICK'; const tr = nearTree(P); if (tr) return 'PICK \u00b7 APPLE'; return null; }
  function talk(P) { if (!inLot(P)) return false;
    if (J) { const tr = nearTree(P); if (tr && tr.job) { pick(tr, P); return true; } if (dist(P, rusty.position.x, rusty.position.z) < 2.6) { jobEnd(true); return true; } return false; }
    if (rSide !== 'walk' && dist(P, rusty.position.x, rusty.position.z) < 2.6) { tone(1320, 0.05, 0.5); if (danger) { sayTo(TG(), [l('Not now, kid! Bandits! Chase them off and I\u2019ll owe you a cider.')]); return true; } menu(); return true; }
    if (K.atHiring(P)) { tone(1320, 0.05, 0.5); jobAsk(); return true; }
    const tr = nearTree(P); if (tr) { pick(tr, P); return true; } return false; }
  const API = { group: G, tick, camFix, prompt, talk, busy: () => null, toast: () => (toastT > 0 ? toastTxt : ''), quit: () => jobEnd(true), useItem: () => false, rusty, TREES, FEN, CRATES, HAYS, SCARE, HENS, K, FARM: FARM_A,
    job: () => J, jobStart, jobEnd, danger: () => danger, dispose() { card.remove(); K.dispose(); } };
  window.__orchard = API; return API;
}
function STEEL() { return '#9aa0a6'; }
