// MERU 2.0 — s38: MERU CASTLE on Castle Ridge [meruCastle] + the keep's rooms [meruThroneroom] (Ben: castle on the ridge, big walled castle,
// quick-fade interior, 2D story gate, add a treasury, a library and a meeting room).
// OUTSIDE (on the crest, L.CASTLE.y): curtain walls with merlons, 4 round corner towers with red cone roofs + flags, the east GATEHOUSE
// (twin towers, raised portcullis, open leaves, MERU CASTLE sign, torches, banners) onto the Castle Road, a flagstone courtyard (well,
// stable lean-to with hay + a cart, weapon rack + straw dummies, braziers) and the KEEP (corner turrets, a centre tower, the great door).
// The keep door is guarded (castleGuard1): meru-castlepath.js castleDoorLines decides, exactly like the 2D castleDoorHeld + the old 3D Meru.
// INSIDE (quick fade, a closed set under the crest at L.CASTLE.IN): THRONE ROOM 20 x 40 (pillars, dais, throne, King Might, royal guards),
// west: LIBRARY 20 x 16 · east: COUNCIL ROOM 20 x 14 + TREASURY 12 x 12 (vault door). People + lines only from the old Meru files.
import { makeRoomKit } from './meru2-roomkit.js';
import { KING_MIGHT } from '../fox-kit.js?v=s673';
import { loadArmorSets, armorOutfit, dressArmor } from '../engine/armor-sets.js';   // s717 MERU GUARDS wear the Meru Royal Armor (Ben's Armor Workshop fit) + the M crest
import * as CP from './meru-castlepath.js';
import { audienceLines, grantGifts, MAX } from './meru-interiors.js';

export function buildCastle({ THREE, scene, kit, cols, L, save, touch, say, go }) {
  const C = L.CASTLE; if (!C) return { spots: [], talkers: [], TALK: {}, keys: new Set(), tick() {}, groundAt: () => null, inside: () => false, where: () => null, camFix() {}, toast: () => '', covers: () => false };
  const K = makeRoomKit({ THREE, touch }), { CT, Bin, flat, rnd } = K;
  const [X0, X1, Z0, Z1] = C.r, Y = C.y, WT = 2, WH = 9;
  const RED = '#a8323e', ROOF = '#9c2b35', NAVY = '#1f2650', GOLD = '#e6b45a', WOOD = '#6b4a32', DARK = '#3d2a1c', IRON = '#3d3b3a', STONE = '#8a7f70';
  const box = (a0, a1, c0, c1, y0, y1) => cols.push({ f: [a0, a1, c0, c1], y0, y1 }), ring = (x, z, r, y0, y1) => cols.push({ c: [x, z, r], y0, y1 });
  const OY0 = Y - 8, OY1 = Y + 40;
  // ---------- stone: one tiled texture, box + cylinder UVs scaled to metres (4 m per tile), merged into one mesh per set ----------
  const stoneTex = CT(256, 256, (g, w) => { g.fillStyle = '#5e574f'; g.fillRect(0, 0, w, w); const n = 8, rh = w / n; for (let r = 0; r < n; r++) { let x = -(r % 2) * 36; while (x < w) { const L2 = 44 + rnd() * 52, k = 0.86 + rnd() * 0.2;
      g.fillStyle = `rgb(${172 * k | 0},${162 * k | 0},${146 * k | 0})`; g.fillRect(x + 2, r * rh + 2, L2 - 4, rh - 4); for (let s = 0; s < 10; s++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'; g.fillRect(x + rnd() * L2, r * rh + rnd() * rh, 3, 2); } x += L2; } } });
  stoneTex.wrapS = stoneTex.wrapT = THREE.RepeatWrapping;
  function StoneSet() { const list = [];
    const add = (g, x, y, z, ry = 0) => { g = g.index ? g.toNonIndexed() : g; g.rotateY(ry); g.translate(x, y, z); list.push(g); };
    return {
      box(w, h, d, x, y, z, ry = 0) { const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
        for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / 4, uv.getY(k) * dims[f][1] / 4); } add(g, x, y, z, ry); },
      cyl(r, h, x, y, z, n = 20) { const g = new THREE.CylinderGeometry(r, r, h, n, 1, true), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.PI * 2 * r / 4, uv.getY(i) * h / 4); add(g, x, y, z); },
      build(group, color = 0xffffff) { if (!list.length) return null; let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uvs = new Float32Array(n * 2); let o = 0;
        for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); uvs.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; g.dispose(); }
        const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        const m = new THREE.Mesh(bg, new THREE.MeshLambertMaterial({ map: stoneTex, color })); if (!touch) { m.castShadow = true; m.receiveShadow = true; } group.add(m); return m; } }; }

  // =====================================================================================================================
  // OUTSIDE
  // =====================================================================================================================
  const OUT = new THREE.Group(); OUT.name = 'meruCastle'; scene.add(OUT); const DET = new THREE.Group(); OUT.add(DET);
  const S = StoneSet(), o = Bin(), d = Bin();
  const merlons = (ax, az, bx, bz, y, outX, outZ) => { const len = Math.hypot(bx - ax, bz - az), n = Math.floor(len / 2), ry = Math.atan2(bx - ax, bz - az) + Math.PI / 2;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = ax + (bx - ax) * t + outX, z = az + (bz - az) * t + outZ; S.box(1.0, 1.2, 0.7, x, y + 0.6, z, ry); } };
  // curtain walls (the east wall leaves the 5 m gate)
  const GZ = C.gate[1], GW = 2.5, cxw = (X0 + X1) / 2, czw = (Z0 + Z1) / 2;
  S.box(X1 - X0, WH, WT, cxw, Y + WH / 2, Z0 + WT / 2); S.box(X1 - X0, WH, WT, cxw, Y + WH / 2, Z1 - WT / 2); S.box(WT, WH, Z1 - Z0 - 2 * WT, X0 + WT / 2, Y + WH / 2, czw);
  { const a = Z0 + WT, b = GZ - GW, c = GZ + GW, e = Z1 - WT; S.box(WT, WH, b - a, X1 - WT / 2, Y + WH / 2, (a + b) / 2); S.box(WT, WH, e - c, X1 - WT / 2, Y + WH / 2, (c + e) / 2); }
  merlons(X0 + 4, Z0 + 0.35, X1 - 4, Z0 + 0.35, Y + WH, 0, 0); merlons(X0 + 4, Z1 - 0.35, X1 - 4, Z1 - 0.35, Y + WH, 0, 0); merlons(X0 + 0.35, Z0 + 4, X0 + 0.35, Z1 - 4, Y + WH, 0, 0);
  merlons(X1 - 0.35, Z0 + 4, X1 - 0.35, GZ - 5.5, Y + WH, 0, 0); merlons(X1 - 0.35, GZ + 5.5, X1 - 0.35, Z1 - 4, Y + WH, 0, 0);
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) {   // round corner towers
    const TH = 14, R = 4; S.cyl(R, TH, x, Y + TH / 2, z); S.cyl(R + 0.4, 0.9, x, Y + TH - 0.45, z, 24);
    o.cyl('mat', '#8f867b', R + 0.38, 0.06, x, Y + TH + 0.03, z, 24); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; S.box(0.9, 1.2, 0.6, x + Math.cos(a) * (R + 0.1), Y + TH + 0.6, z + Math.sin(a) * (R + 0.1), -a + Math.PI / 2); }
    o.cyl('mat', ROOF, R + 0.6, 7, x, Y + TH + 1.2 + 3.5, z, 20, 0, 0, 0); o.sph('gls', GOLD, 0.3, x, Y + TH + 8.9, z); o.cyl('mat', IRON, 0.07, 3, x, Y + TH + 10.4, z, 6);
    for (const h of [4, 8.5]) for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4; o.box('mat', '#201e1d', 0.3, 1.3, 0.15, x + Math.cos(a) * (R + 0.02), Y + h, z + Math.sin(a) * (R + 0.02), -a + Math.PI / 2); }
    ring(x, z, R, OY0, OY1); }
  const flags = [];
  const flag = (x, y, z, w, h, col, par = OUT) => { const g = new THREE.Group(); g.position.set(x, y, z); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05).translate(w / 2, 0, 0), new THREE.MeshLambertMaterial({ color: col })); g.add(m);
    const s = new THREE.Mesh(new THREE.BoxGeometry(w * 0.32, w * 0.32, 0.07).translate(w / 2, 0, 0), new THREE.MeshLambertMaterial({ color: GOLD })); g.add(s); par.add(g); flags.push(g); return g; };
  for (const [x, z] of [[X0, Z0], [X1, Z0], [X0, Z1], [X1, Z1]]) flag(x, Y + 14 + 11.3, z, 2.2, 1.3, RED);
  // the east GATEHOUSE: twin towers, lintel, raised portcullis, open leaves, sign, banners, torches
  const GX = X1 - 2, GT = 13;
  for (const s of [-1, 1]) { const z = GZ + s * 5.5; S.box(5, GT, 5, GX, Y + GT / 2, z); merlons(GX - 2.2, z - 2.2, GX + 2.2, z - 2.2, Y + GT, 0, 0); merlons(GX - 2.2, z + 2.2, GX + 2.2, z + 2.2, Y + GT, 0, 0); merlons(GX + 2.2, z - 1.6, GX + 2.2, z + 1.6, Y + GT, 0, 0);
    o.box('mat', '#201e1d', 0.15, 1.6, 0.35, GX + 2.52, Y + 9, z); o.box('mat', '#201e1d', 0.15, 1.6, 0.35, GX + 2.52, Y + 4.5, z + s * 1.2);
    o.box('mat', NAVY, 0.06, 5.4, 2.4, GX + 2.54, Y + 7.6, z - s * 0.6); o.box('mat', GOLD, 0.08, 0.18, 2.4, GX + 2.56, Y + 10.25, z - s * 0.6); o.box('mat', GOLD, 0.08, 1.0, 1.0, GX + 2.56, Y + 7.9, z - s * 0.6); o.box('mat', NAVY, 0.09, 0.6, 0.6, GX + 2.57, Y + 7.9, z - s * 0.6);
    { const tz = GZ + s * 3.3; o.box('mat', '#201e1d', 0.5, 0.1, 0.1, GX + 2.75, Y + 3.0, tz); o.cyl('mat', IRON, 0.16, 0.32, GX + 3.0, Y + 3.3, tz, 8, 0, 0, 1.3); d.sph('glo', '#ffb347', 0.17, GX + 3.0, Y + 3.6, tz, 1.6, 6); }
    box(GX - 2.5, GX + 2.5, z - 2.5, z + 2.5, OY0, OY1); flag(GX, Y + GT + 4.2, z, 1.6, 1.0, NAVY); o.cyl('mat', IRON, 0.06, 4.4, GX, Y + GT + 2.2, z, 6); }
  S.box(5, GT - 6.5, 6, GX, Y + 6.5 + (GT - 6.5) / 2, GZ);
  for (let i = 0; i < 9; i++) { const z = GZ - 2.4 + i * 0.6; o.box('mat', IRON, 0.12, 0.9, 0.12, GX + 1.6, Y + 6.1, z); } o.box('mat', IRON, 0.14, 0.14, 5.2, GX + 1.6, Y + 6.5, GZ);
  for (const s of [-1, 1]) { o.box('mat', WOOD, 3.4, 5.8, 0.22, GX - 0.4, Y + 2.95, GZ + s * 2.35); for (const y of [1.2, 4.6]) o.box('mat', IRON, 3.4, 0.16, 0.26, GX - 0.4, Y + y, GZ + s * 2.35); }
  { const sg = CT(512, 112, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = GOLD; g.fillRect(0, 0, 18, h); g.font = '900 58px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU CASTLE', 38, h / 2 + 3); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 1.1), new THREE.MeshBasicMaterial({ map: sg, color: 0xe8e8e8 })); m.position.set(GX + 2.53, Y + 8.4, GZ); m.rotation.y = Math.PI / 2; OUT.add(m); }
  // walls as colliders
  box(X0, X1, Z0, Z0 + WT, OY0, OY1); box(X0, X1, Z1 - WT, Z1, OY0, OY1); box(X0, X0 + WT, Z0, Z1, OY0, OY1); box(X1 - WT, X1, Z0, GZ - GW, OY0, OY1); box(X1 - WT, X1, GZ + GW, Z1, OY0, OY1);
  // the KEEP
  const [KX0, KX1, KZ0, KZ1] = C.keep, KH = 15, kcx = (KX0 + KX1) / 2, kcz = (KZ0 + KZ1) / 2, DZ = C.keepDoor[1];
  S.box(KX1 - KX0, KH, KZ1 - KZ0, kcx, Y + KH / 2, kcz); box(KX0, KX1, KZ0, KZ1, OY0, OY1);
  merlons(KX0 + 2, KZ0 + 0.35, KX1 - 2, KZ0 + 0.35, Y + KH, 0, 0); merlons(KX0 + 2, KZ1 - 0.35, KX1 - 2, KZ1 - 0.35, Y + KH, 0, 0); merlons(KX0 + 0.35, KZ0 + 2, KX0 + 0.35, KZ1 - 2, Y + KH, 0, 0); merlons(KX1 - 0.35, KZ0 + 2, KX1 - 0.35, KZ1 - 2, Y + KH, 0, 0);
  o.box('mat', '#7d756b', KX1 - KX0 - 0.6, 0.1, KZ1 - KZ0 - 0.6, kcx, Y + KH + 0.05, kcz);
  for (const [x, z] of [[KX0, KZ0], [KX1, KZ0], [KX0, KZ1], [KX1, KZ1]]) { S.cyl(2.2, 19, x, Y + 9.5, z, 16); o.cyl('mat', ROOF, 2.7, 4.6, x, Y + 19 + 2.3, z, 16, 0, 0, 0); o.sph('gls', GOLD, 0.22, x, Y + 23.8, z); }
  { const TW = 9, th = 9; S.box(TW, th, TW, kcx, Y + KH + th / 2, kcz); merlons(kcx - 4, kcz - TW / 2 + 0.35, kcx + 4, kcz - TW / 2 + 0.35, Y + KH + th, 0, 0); merlons(kcx - 4, kcz + TW / 2 - 0.35, kcx + 4, kcz + TW / 2 - 0.35, Y + KH + th, 0, 0);
    merlons(kcx - TW / 2 + 0.35, kcz - 3.4, kcx - TW / 2 + 0.35, kcz + 3.4, Y + KH + th, 0, 0); merlons(kcx + TW / 2 - 0.35, kcz - 3.4, kcx + TW / 2 - 0.35, kcz + 3.4, Y + KH + th, 0, 0);
    o.cyl('mat', IRON, 0.09, 7, kcx, Y + KH + th + 3.5, kcz, 6); flag(kcx, Y + KH + th + 6.2, kcz, 3.6, 2.1, RED);
    for (const s of [-1, 1]) for (const k of [0, 1]) o.box('mat', '#201e1d', 0.15, 1.8, 0.4, kcx + TW / 2 + 0.02, Y + KH + 4.5, kcz + s * 2 + k * 0); }
  // the great door (E face), its stone surround, steps, the rose window, banners, window slits
  o.box('mat', DARK, 0.25, 5.6, 4.2, KX1 + 0.1, Y + 2.8, DZ); o.box('mat', '#201e1d', 0.27, 5.6, 0.08, KX1 + 0.12, Y + 2.8, DZ);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) o.sph('gls', GOLD, 0.07, KX1 + 0.25, Y + 0.9 + i * 1.3, DZ - 1.5 + j * 1.0 + (j > 1 ? 0 : 0), 1, 6);
  for (const s of [-1, 1]) { o.box('gls', GOLD, 0.12, 0.12, 0.7, KX1 + 0.28, Y + 2.7, DZ + s * 0.45); o.box('mat', '#9a9186', 0.6, 6.4, 0.7, KX1 + 0.3, Y + 3.2, DZ + s * 2.45); }
  o.box('mat', '#9a9186', 0.6, 0.8, 5.6, KX1 + 0.3, Y + 6.0, DZ); o.box('mat', '#9a9186', 1.5, 0.14, 7, KX1 + 0.75, Y + 0.07, DZ); o.box('mat', '#9a9186', 0.8, 0.14, 6, KX1 + 0.4, Y + 0.2, DZ);
  o.cyl('mat', '#6b6258', 1.6, 0.3, KX1 + 0.15, Y + 9.6, DZ, 20, 0, Math.PI / 2); d.cyl('glo', '#ffcf7a', 1.3, 0.32, KX1 + 0.16, Y + 9.6, DZ, 20, 0, Math.PI / 2); o.box('mat', '#6b6258', 0.34, 2.6, 0.12, KX1 + 0.32, Y + 9.6, DZ); o.box('mat', '#6b6258', 0.34, 0.12, 2.6, KX1 + 0.32, Y + 9.6, DZ);
  for (const s of [-1, 1]) { const z = DZ + s * 6; o.box('mat', NAVY, 0.06, 7, 2.4, KX1 + 0.05, Y + 8, z); o.box('mat', GOLD, 0.08, 0.2, 2.4, KX1 + 0.07, Y + 11.4, z); o.box('mat', GOLD, 0.08, 1.1, 1.1, KX1 + 0.08, Y + 8.6, z); o.box('mat', NAVY, 0.09, 0.66, 0.66, KX1 + 0.09, Y + 8.6, z);
    for (let i = 0; i < 5; i++) o.box('mat', GOLD, 0.08, 0.5, 0.12, KX1 + 0.08, Y + 4.8, z - 0.96 + i * 0.48); }
  for (const z of [KZ0 + 4, KZ1 - 4]) o.box('mat', '#201e1d', 0.12, 2.6, 0.5, KX1 + 0.02, Y + 11, z);
  for (const x of [KX0 + 5, kcx, KX1 - 5]) for (const z of [KZ0 - 0.02, KZ1 + 0.02]) o.box('mat', '#201e1d', 0.5, 2.6, 0.12, x, Y + 10.5, z);
  for (const z of [KZ0 + 6, kcz, KZ1 - 6]) o.box('mat', '#201e1d', 0.12, 2.6, 0.5, KX0 - 0.02, Y + 10.5, z);
  S.build(OUT); o.build(OUT);
  // the courtyard: flagstones, a well, the stable lean-to + hay + cart, weapon rack + dummies, braziers, banners inside the gate
  const flagT = CT(256, 256, (g, w) => { g.fillStyle = '#6a645c'; g.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const k = 0.85 + rnd() * 0.22; g.fillStyle = `rgb(${168 * k | 0},${160 * k | 0},${146 * k | 0})`; g.fillRect(i * 64 + 2 + rnd() * 3, j * 64 + 2 + rnd() * 3, 58, 58); } });
  flat(DET, flagT, X1 - X0 - 2 * WT, Z1 - Z0 - 2 * WT, cxw, Y + 0.06, czw, 3);
  { const wx = -240, wz = -440; d.cyl('mat', STONE, 1.25, 0.95, wx, Y + 0.48, wz, 16); d.cyl('mat', '#24425a', 1.0, 0.04, wx, Y + 0.9, wz, 16); for (const s of [-1, 1]) d.box('mat', WOOD, 0.18, 2.4, 0.18, wx + s * 1.1, Y + 1.2, wz);
    for (const s of [-1, 1]) d.box('mat', ROOF, 1.5, 0.08, 2.9, wx + s * 0.62, Y + 2.62, wz, 0, 0, s * 0.62); d.box('mat', WOOD, 2.4, 0.1, 0.1, wx, Y + 2.0, wz); d.cyl('mat', '#7a5236', 0.22, 0.35, wx + 0.3, Y + 1.25, wz, 8); ring(wx, wz, 1.45, OY0, OY1); }
  { const z0 = Z1 - WT, z1 = z0 - 3.6, xa = -250, xb = -234; for (let x = xa; x <= xb; x += 4) { d.box('mat', DARK, 0.2, 3.0, 0.2, x, Y + 1.5, z1); ring(x, z1, 0.2, OY0, OY1); }
    d.box('mat', '#7a5a3a', xb - xa + 1, 0.12, 4.1, (xa + xb) / 2, Y + 3.25, (z0 + z1) / 2, 0, -0.18); d.box('mat', DARK, xb - xa + 0.4, 0.16, 0.16, (xa + xb) / 2, Y + 2.95, z1);
    for (let i = 0; i < 5; i++) d.box('mat', '#d6b86a', 1.2, 0.7, 0.8, xa + 1.5 + (i % 3) * 1.3, Y + 0.35 + (i > 2 ? 0.7 : 0), z0 - 0.7);
    d.box('mat', WOOD, 3, 0.6, 0.7, -241, Y + 0.3, z0 - 0.6); d.box('mat', '#3a6a8a', 2.8, 0.04, 0.5, -241, Y + 0.58, z0 - 0.6); box(xa, xb, z0 - 1.3, z0, OY0, OY1);
    { const cx = -237, cz = z0 - 1.6; d.box('mat', '#8a6a42', 2.6, 0.5, 1.5, cx, Y + 1.0, cz); for (const s of [-1, 1]) d.tor('mat', DARK, 0.6, 0.08, cx - 0.3, Y + 0.62, cz + s * 0.85, 0, 0); d.box('mat', DARK, 2.2, 0.08, 0.08, cx + 2.2, Y + 0.8, cz, 0, 0, 0.25); box(cx - 1.4, cx + 1.4, cz - 1.0, cz + 1.0, OY0, OY1); } }
  { const z = Z0 + WT + 0.4; d.box('mat', DARK, 6, 0.12, 0.3, -241, Y + 1.8, z); d.box('mat', DARK, 6, 0.12, 0.3, -241, Y + 0.4, z); for (let i = 0; i < 9; i++) { const x = -243.6 + i * 0.65; d.box('mat', '#8a6a42', 0.06, 2.6, 0.06, x, Y + 1.4, z + 0.1); d.oct('gls', '#c0c4cc', 0.12, x, Y + 2.8, z + 0.1, 2.2); }
    box(-244.2, -237.8, Z0 + WT, z + 0.5, OY0, OY1);
    for (const x of [-233, -229.5]) { const zz = z + 3; d.cyl('mat', DARK, 0.07, 1.3, x, Y + 0.65, zz, 6); d.cyl('mat', '#d6b86a', 0.32, 0.95, x, Y + 1.5, zz, 10); d.sph('mat', '#d6b86a', 0.25, x, Y + 2.2, zz, 1, 8); d.box('mat', '#d6b86a', 1.0, 0.16, 0.16, x, Y + 1.7, zz); d.box('mat', RED, 0.66, 0.08, 0.66, x, Y + 1.25, zz); ring(x, zz, 0.45, OY0, OY1); } }
  const fires = [];
  for (const z of [DZ - 5.4, DZ + 5.4]) { const x = KX1 + 2.2; d.cyl('mat', IRON, 0.1, 1.1, x, Y + 0.55, z, 8); d.cyl('mat', IRON, 0.45, 0.35, x, Y + 1.25, z, 12, 0, 0, 1.3); d.sph('glo', '#ff8a3a', 0.38, x, Y + 1.5, z, 0.8, 8); d.sph('glo', '#ffd27a', 0.22, x, Y + 1.8, z, 1.2, 6); ring(x, z, 0.5, OY0, OY1); }
  for (const z of [Z0 + 9, Z1 - 9]) { d.box('mat', RED, 0.05, 4.2, 1.8, X1 - WT - 0.03, Y + 5.6, z); d.box('mat', GOLD, 0.06, 0.16, 1.8, X1 - WT - 0.04, Y + 7.75, z); }
  d.build(DET);

  // =====================================================================================================================
  // INSIDE (quick fade): the keep's rooms, local frame centred on C.IN, floor at IY
  // =====================================================================================================================
  const IX = C.IN.x, IZ = C.IN.z, IY = C.IN.y, IG = new THREE.Group(); IG.name = 'meruKeep'; IG.visible = false; scene.add(IG);
  const W = (lx, lz) => [IX + lx, IZ + lz], IY0 = IY - 3, IY1 = IY + 15;
  const ROOMS = [
    { key: 'hall', label: 'Throne Room', x0: -10, x1: 10, z0: -20, z1: 20, h: 11 },
    { key: 'library', label: 'Library', x0: -30, x1: -10, z0: -14, z1: 2, h: 7 },
    { key: 'council', label: 'Council Room', x0: 10, x1: 30, z0: -14, z1: 0, h: 7 },
    { key: 'treasury', label: 'Treasury', x0: 10, x1: 22, z0: 4, z1: 16, h: 6 },
    { key: 'chamber', label: 'Royal Chamber', x0: -22, x1: -10, z0: 7, z1: 19, h: 6 },   // s100: castle prize YOUR OWN ROOM (furniture + door in meru2-castle-prize.js)
  ];
  const IS = StoneSet(), k = Bin(), DH = 3.6, T = 0.5;
  const ib = (a0, a1, c0, c1) => box(IX + a0, IX + a1, IZ + c0, IZ + c1, IY0, IY1), ir = (x, z, r) => ring(IX + x, IZ + z, r, IY0, IY1);
  // walls: one per line, gaps = doorways (lintel above), colliders follow
  const wallX = (x, z0, z1, h, gaps = []) => { let a = z0; for (const [g0, g1] of [...gaps, [z1, z1]]) { if (g0 > a) { IS.box(T, h, g0 - a, IX + x, IY + h / 2, IZ + (a + g0) / 2); ib(x - T / 2, x + T / 2, a, g0); } if (g1 > g0) IS.box(T, h - DH, g1 - g0, IX + x, IY + DH + (h - DH) / 2, IZ + (g0 + g1) / 2); a = g1; } };
  const wallZ = (z, x0, x1, h, gaps = []) => { let a = x0; for (const [g0, g1] of [...gaps, [x1, x1]]) { if (g0 > a) { IS.box(g0 - a, h, T, IX + (a + g0) / 2, IY + h / 2, IZ + z); ib(a, g0, z - T / 2, z + T / 2); } if (g1 > g0) IS.box(g1 - g0, h - DH, T, IX + (g0 + g1) / 2, IY + DH + (h - DH) / 2, IZ + z); a = g1; } };
  wallX(-10, -20, 20, 11, [[-7.5, -4.5], [15, 18]]); wallX(10, -20, 20, 11, [[-8.5, -5.5], [8.5, 11.5]]); wallZ(-20, -10, 10, 11); wallZ(20, -10, 10, 11);
  wallX(-30, -14, 2, 7); wallZ(-14, -30, -10, 7); wallZ(2, -30, -10, 7);
  wallX(30, -14, 0, 7); wallZ(-14, 10, 30, 7); wallZ(0, 10, 30, 7);
  wallX(22, 4, 16, 6); wallZ(4, 10, 22, 6); wallZ(16, 10, 22, 6);
  wallX(-22, 7, 19, 6); wallZ(7, -22, -10, 6); wallZ(19, -22, -10, 6);
  IS.build(IG, 0xe6e0ee);
  // floors + ceilings
  const marble = CT(256, 256, (g, w) => { const t = 64; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#2a3260' : '#e9e4d8'; g.fillRect(i * t, j * t, t, t); g.fillStyle = 'rgba(255,255,255,0.06)'; for (let s = 0; s < 6; s++) g.fillRect(i * t + rnd() * t, j * t + rnd() * t, 10 + rnd() * 20, 1); } g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * t, 0); g.lineTo(i * t, w); g.moveTo(0, i * t); g.lineTo(w, i * t); g.stroke(); } });
  flat(IG, marble, 20, 40, IX, IY + 0.02, IZ, 4); flat(IG, K.planks('#7a5236', '#3d2a1c'), 20, 16, IX - 20, IY + 0.02, IZ - 6, 4); flat(IG, K.planks('#8a6440', '#4a3424'), 20, 14, IX + 20, IY + 0.02, IZ - 7, 4); flat(IG, K.slate(), 12, 12, IX + 16, IY + 0.02, IZ + 10, 3); flat(IG, K.planks('#8a6440', '#4a3424'), 12, 12, IX - 16, IY + 0.02, IZ + 13, 3);
  for (const R of ROOMS) { const w = R.x1 - R.x0, dd = R.z1 - R.z0, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2; k.box('mat', R.key === 'hall' ? '#2a2440' : '#3d2a1c', w, 0.3, dd, IX + cx, IY + R.h + 0.15, IZ + cz);
    const step = R.key === 'hall' ? 4 : 2.5; for (let z = R.z0 + step / 2; z < R.z1; z += step) k.box('mat', R.key === 'hall' ? '#3a3256' : '#4a3424', w - 0.4, 0.4, 0.3, IX + cx, IY + R.h - 0.2, IZ + z);
    if (R.key === 'hall') for (let z = R.z0 + 2; z < R.z1; z += 4) k.box('mat', GOLD, w - 0.5, 0.06, 0.32, IX + cx, IY + R.h - 0.41, IZ + z); }
  // --- THRONE ROOM ---
  k.box('mat', RED, 3, 0.02, 32, IX, IY + 0.05, IZ + 3); for (const s of [-1, 1]) k.box('mat', GOLD, 0.14, 0.024, 32, IX + s * 1.45, IY + 0.055, IZ + 3);
  k.box('mat', '#cfc9dc', 14, 0.6, 6.5, IX, IY + 0.3, IZ - 16.75); k.box('mat', '#cfc9dc', 9, 0.3, 0.6, IX, IY + 0.15, IZ - 13.2); k.box('mat', RED, 10, 0.02, 5.8, IX, IY + 0.61, IZ - 16.9);
  ib(-7, -3.2, -20, -13.5); ib(3.2, 7, -20, -13.5);   // the dais sides are a ledge; walk up the middle
  { const tz = -18.7; k.box('gls', GOLD, 2.4, 0.4, 1.9, IX, IY + 0.8, IZ + tz); k.box('mat', RED, 1.9, 0.2, 1.5, IX, IY + 1.1, IZ + tz + 0.1); k.box('mat', DARK, 2.3, 4.2, 0.4, IX, IY + 3.0, IZ + tz - 0.8); k.box('mat', RED, 1.7, 3.2, 0.05, IX, IY + 2.8, IZ + tz - 0.58);
    for (const s of [-1, 1]) { k.box('gls', GOLD, 0.3, 1.0, 1.6, IX + s * 1.15, IY + 1.3, IZ + tz); k.sph('gls', GOLD, 0.16, IX + s * 1.15, IY + 1.9, IZ + tz + 0.7); k.sph('gls', GOLD, 0.2, IX + s * 1.0, IY + 5.2, IZ + tz - 0.8); }
    k.oct('gls', GOLD, 0.34, IX, IY + 5.5, IZ + tz - 0.8, 1.3); ib(-1.3, 1.3, tz - 1.0, tz + 0.95); }
  k.box('mat', NAVY, 5, 8, 0.06, IX, IY + 6.2, IZ - 19.7); k.box('mat', GOLD, 5.1, 0.22, 0.08, IX, IY + 10.1, IZ - 19.68); k.box('mat', GOLD, 2.2, 2.2, 0.08, IX, IY + 7.0, IZ - 19.66); k.box('mat', NAVY, 1.4, 1.4, 0.09, IX, IY + 7.0, IZ - 19.65);
  for (let i = 0; i < 6; i++) k.box('mat', GOLD, 0.14, 0.6, 0.08, IX - 2 + i * 0.8, IY + 2.5, IZ - 19.66);
  for (const s of [-1, 1]) for (const z of [-9, -3, 3, 9, 15]) { const x = s * 6; k.cyl('gls', '#d8d3e6', 0.55, 11, IX + x, IY + 5.5, IZ + z, 14); k.box('mat', '#bdb6cc', 1.4, 0.4, 1.4, IX + x, IY + 0.2, IZ + z); k.box('mat', '#bdb6cc', 1.4, 0.5, 1.4, IX + x, IY + 10.5, IZ + z); k.box('mat', GOLD, 1.2, 0.08, 1.2, IX + x, IY + 10.2, IZ + z); ir(x, z, 0.72); }
  for (const [x, zs] of [[-9.72, [-15, 3, 13]], [9.72, [-15, 1.5, 16]]]) for (const z of zs) { const s = Math.sign(x); k.box('mat', '#2a2440', 0.1, 4.6, 1.8, IX + x, IY + 6.2, IZ + z); k.box('glo', '#cfe3ff', 0.12, 4.0, 1.3, IX + x - s * 0.02, IY + 6.1, IZ + z); k.cyl('glo', '#cfe3ff', 0.65, 0.12, IX + x - s * 0.02, IY + 8.1, IZ + z, 14, 0, Math.PI / 2);
    k.box('mat', '#2a2440', 0.14, 4.0, 0.08, IX + x - s * 0.03, IY + 6.1, IZ + z); k.box('mat', '#2a2440', 0.14, 0.08, 1.3, IX + x - s * 0.03, IY + 6.6, IZ + z); }
  for (const [x, z] of [[-9.7, -10], [-9.7, 8.5], [9.7, -11.5], [9.7, 5.5]]) { k.box('mat', RED, 0.05, 4.4, 1.7, IX + x, IY + 6.6, IZ + z); k.box('mat', GOLD, 0.06, 0.16, 1.7, IX + x - Math.sign(x) * 0.01, IY + 8.85, IZ + z); k.box('mat', GOLD, 0.06, 0.7, 0.7, IX + x - Math.sign(x) * 0.01, IY + 7.0, IZ + z); }
  for (const s of [-1, 1]) { const x = s * 5.4, z = -12.4; k.cyl('mat', IRON, 0.12, 1.2, IX + x, IY + 0.6, IZ + z, 8); k.cyl('mat', IRON, 0.5, 0.35, IX + x, IY + 1.35, IZ + z, 12, 0, 0, 1.3); k.sph('glo', '#ff8a3a', 0.42, IX + x, IY + 1.6, IZ + z, 0.8, 8); k.sph('glo', '#ffd27a', 0.24, IX + x, IY + 1.95, IZ + z, 1.2, 6); ir(x, z, 0.55); }
  const chand = (lx, lz, y, top, r = 1.6, n = 10) => { k.box('mat', IRON, 0.03, top - y, 0.03, IX + lx, IY + (top + y) / 2, IZ + lz); k.tor('mat', IRON, r, 0.06, IX + lx, IY + y, IZ + lz, Math.PI / 2);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, px = IX + lx + Math.cos(a) * r, pz = IZ + lz + Math.sin(a) * r; k.cyl('mat', '#f3efe2', 0.04, 0.18, px, IY + y + 0.1, pz, 6); k.sph('glo', '#ffd27a', 0.07, px, IY + y + 0.27, pz, 1.4, 6); } };
  chand(0, -6, 8, 11); chand(0, 6, 8, 11);
  { const z = 19.72; k.box('mat', DARK, 4.2, 5.6, 0.12, IX, IY + 2.8, IZ + z); k.box('mat', '#201e1d', 0.08, 5.6, 0.14, IX, IY + 2.8, IZ + z); for (const s of [-1, 1]) k.box('gls', GOLD, 0.7, 0.12, 0.12, IX + s * 0.45, IY + 2.7, IZ + z - 0.08);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) k.sph('gls', GOLD, 0.07, IX - 1.5 + j * 1.0, IY + 0.9 + i * 1.3, IZ + z - 0.08, 1, 6); k.box('mat', '#9a9186', 5.4, 0.7, 0.3, IX, IY + 5.95, IZ + z - 0.05); }
  // doorway frames + signs on the hall side
  const frame = (x, z, side) => { for (const s of [-1, 1]) k.box('mat', '#bdb6cc', 0.7, DH + 0.2, 0.3, IX + x - side * 0.05, IY + DH / 2, IZ + z + s * 1.65); k.box('mat', '#bdb6cc', 0.7, 0.4, 3.6, IX + x - side * 0.05, IY + DH + 0.2, IZ + z); k.box('mat', GOLD, 0.72, 0.06, 3.6, IX + x - side * 0.05, IY + DH, IZ + z); };
  frame(-10, -6, -1); frame(10, -7, 1); frame(10, 10, 1); frame(-10, 16.5, -1);
  const sign = (txt, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.49), new THREE.MeshBasicMaterial({ map: K.signTex(txt), color: 0xe8e8e8 })); m.position.set(IX + x, IY + DH + 0.9, IZ + z); m.rotation.y = ry; IG.add(m); };
  sign('LIBRARY', -9.7, -6, Math.PI / 2); sign('COUNCIL ROOM', 9.7, -7, -Math.PI / 2); sign('TREASURY', 9.7, 10, -Math.PI / 2); sign('ROYAL CHAMBER', -9.7, 16.5, Math.PI / 2);
  // --- LIBRARY ---
  const BOOK = ['#7a1f2b', '#1f3a5a', '#2e5a3a', '#6b4a32', '#3d2a52', '#8a6a2a', '#5a2a1f', '#1f2650', '#4a5a2a'];
  const shelf = (ax, az, bx, bz, h = 3.4, nrm) => { const len = Math.hypot(bx - ax, bz - az), alongX = Math.abs(bx - ax) > Math.abs(bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2, D = 0.5, nx = nrm[0], nz = nrm[1];
    k.box('mat', DARK, alongX ? len : D, h, alongX ? D : len, IX + cx, IY + h / 2, IZ + cz); const rows = [0.3, 1.05, 1.8, 2.55];
    for (const y of rows) { k.box('mat', '#4a3424', alongX ? len : 0.06, 0.05, alongX ? 0.06 : len, IX + cx + nx * 0.26, IY + y - 0.02, IZ + cz + nz * 0.26); let t = 0.1; while (t < len - 0.15) { const bw = 0.12 + rnd() * 0.22, bh = 0.42 + rnd() * 0.2;
      if (rnd() > 0.08) { const px = ax + (bx - ax) * (t + bw / 2) / len, pz = az + (bz - az) * (t + bw / 2) / len; k.box('mat', BOOK[(rnd() * BOOK.length) | 0], alongX ? bw - 0.02 : 0.34, bh, alongX ? 0.34 : bw - 0.02, IX + px + nx * 0.1, IY + y + bh / 2, IZ + pz + nz * 0.1); } t += bw; } }
    k.box('mat', '#4a3424', alongX ? len + 0.1 : D + 0.1, 0.12, alongX ? D + 0.1 : len + 0.1, IX + cx, IY + h + 0.06, IZ + cz);
    ib(Math.min(ax, bx) - (alongX ? 0 : D / 2), Math.max(ax, bx) + (alongX ? 0 : D / 2), Math.min(az, bz) - (alongX ? D / 2 : 0), Math.max(az, bz) + (alongX ? D / 2 : 0)); };
  shelf(-29.5, -13.4, -29.5, 1.4, 3.4, [1, 0]); shelf(-29.2, -13.5, -11, -13.5, 3.4, [0, 1]); shelf(-29.2, 1.5, -14, 1.5, 3.4, [0, -1]);
  shelf(-24, -10, -24, -1, 2.4, [1, 0]); shelf(-23.4, -10, -23.4, -1, 2.4, [-1, 0]);
  for (const z of [-9.5, -3.5]) { const x = -17.5; k.box('mat', WOOD, 3.2, 0.08, 1.5, IX + x, IY + 0.8, IZ + z); for (const [a, b] of [[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]]) k.box('mat', DARK, 0.1, 0.76, 0.1, IX + x + a, IY + 0.38, IZ + z + b);
    for (const s of [-1, 1]) for (const a of [-0.8, 0.8]) { k.box('mat', DARK, 0.5, 0.06, 0.5, IX + x + a, IY + 0.48, IZ + z + s * 1.1); k.box('mat', DARK, 0.5, 0.6, 0.06, IX + x + a, IY + 0.8, IZ + z + s * 1.36); }
    k.box('mat', '#f3efe2', 0.7, 0.03, 0.5, IX + x - 0.6, IY + 0.86, IZ + z); k.box('mat', '#7a1f2b', 0.36, 0.05, 0.52, IX + x - 0.6, IY + 0.85, IZ + z); k.cyl('mat', '#f3efe2', 0.05, 0.25, IX + x + 0.9, IY + 0.97, IZ + z, 6); k.sph('glo', '#ffd27a', 0.06, IX + x + 0.9, IY + 1.13, IZ + z, 1.5, 6);
    k.box('mat', BOOK[2], 0.4, 0.22, 0.3, IX + x + 0.2, IY + 0.95, IZ + z + 0.3); ib(x - 1.7, x + 1.7, z - 1.5, z + 1.5); }
  k.box('mat', '#5a1f2b', 9, 0.02, 9, IX - 17.5, IY + 0.04, IZ - 6.5); k.box('mat', GOLD, 9.2, 0.018, 9.2, IX - 17.5, IY + 0.035, IZ - 6.5);
  { const gx = -12.5, gz = -11.5; k.cyl('mat', DARK, 0.06, 0.9, IX + gx, IY + 0.45, IZ + gz, 6); k.cyl('mat', DARK, 0.35, 0.06, IX + gx, IY + 0.03, IZ + gz, 10); k.sph('gls', '#2e6a9a', 0.42, IX + gx, IY + 1.3, IZ + gz, 1, 12); k.sph('mat', '#5a9a5a', 0.2, IX + gx + 0.28, IY + 1.4, IZ + gz + 0.12, 0.6, 6); k.tor('gls', GOLD, 0.5, 0.03, IX + gx, IY + 1.3, IZ + gz, 0.4, 0); ir(gx, gz, 0.55); }
  for (let i = 0; i < 8; i++) k.box('mat', '#8a6440', 0.06, 0.06, 0.62, IX - 29.0, IY + 0.4 + i * 0.4, IZ - 6); for (const s of [-1, 1]) k.box('mat', '#8a6440', 0.08, 3.4, 0.08, IX - 28.9, IY + 1.7, IZ - 6 + s * 0.32);
  chand(-17.5, -6.5, 5, 7, 1.2, 8);
  // --- COUNCIL ROOM ---
  k.box('mat', NAVY, 14, 0.02, 8, IX + 20, IY + 0.04, IZ - 7); k.box('mat', GOLD, 14.2, 0.018, 8.2, IX + 20, IY + 0.035, IZ - 7);
  { const tx = 20, tz = -7; k.box('mat', WOOD, 11, 0.12, 2.6, IX + tx, IY + 0.8, IZ + tz); for (const a of [-4.8, 0, 4.8]) for (const b of [-0.9, 0.9]) k.box('mat', DARK, 0.2, 0.74, 0.2, IX + tx + a, IY + 0.37, IZ + tz + b);
    for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const x = tx - 4 + i * 2, z = tz + s * 1.9; k.box('mat', DARK, 0.6, 0.08, 0.6, IX + x, IY + 0.5, IZ + z); k.box('mat', RED, 0.5, 0.06, 0.5, IX + x, IY + 0.56, IZ + z); k.box('mat', DARK, 0.6, 1.5, 0.08, IX + x, IY + 1.1, IZ + z + s * 0.3); for (const a of [-0.25, 0.25]) for (const b of [-0.25, 0.25]) k.box('mat', DARK, 0.06, 0.46, 0.06, IX + x + a, IY + 0.23, IZ + z + b); }
    for (const s of [-1, 1]) { const x = tx + s * 6.4; k.box('mat', DARK, 0.7, 0.08, 0.7, IX + x, IY + 0.55, IZ + tz); k.box('mat', RED, 0.6, 0.06, 0.6, IX + x, IY + 0.61, IZ + tz); k.box('mat', DARK, 0.08, 2.0, 0.8, IX + x + s * 0.36, IY + 1.4, IZ + tz); k.sph('gls', GOLD, 0.1, IX + x + s * 0.36, IY + 2.45, IZ + tz); }
    ib(tx - 6.9, tx + 6.9, tz - 2.3, tz + 2.3);
    const gm = CT(512, 256, (g, w, h) => { g.fillStyle = '#141a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e6b45a'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); const cx = w / 2, cy = h / 2, R = 96;
      g.strokeStyle = 'rgba(230,180,90,0.5)'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.9;
        g.strokeStyle = 'rgba(230,180,90,0.35)'; g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke(); g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(x, y, 13, 0, 7); g.fill(); g.fillStyle = '#141a3a'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); }
      g.fillStyle = '#5a5560'; g.beginPath(); g.arc(cx, cy, 18, 0, 7); g.fill(); g.strokeStyle = '#141a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - 12, cy - 10); g.lineTo(cx + 2, cy + 1); g.lineTo(cx - 4, cy + 13); g.stroke(); });
    const tm = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.2), new THREE.MeshLambertMaterial({ map: gm })); tm.rotation.x = -Math.PI / 2; tm.position.set(IX + tx, IY + 0.87, IZ + tz); IG.add(tm);
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshLambertMaterial({ map: gm })); wm.rotation.y = -Math.PI / 2; wm.position.set(IX + 29.72, IY + 3.6, IZ + tz); IG.add(wm); k.box('mat', DARK, 0.1, 3.2, 6.2, IX + 29.76, IY + 3.6, IZ + tz); }
  for (let i = 0; i < 4; i++) { const x = 13.5 + i * 4.3, c = i % 2 ? RED : NAVY; k.box('mat', c, 1.6, 3.6, 0.05, IX + x, IY + 4.4, IZ - 13.7); k.box('mat', GOLD, 1.6, 0.14, 0.06, IX + x, IY + 6.25, IZ - 13.69); k.box('mat', GOLD, 0.6, 0.6, 0.06, IX + x, IY + 4.8, IZ - 13.68); }
  { const fx = 20, fz = -0.4; k.box('mat', '#8a7f70', 3.6, 2.8, 0.8, IX + fx, IY + 1.4, IZ + fz); k.box('mat', '#201e1d', 2.2, 1.6, 0.1, IX + fx, IY + 0.85, IZ + fz - 0.36); k.sph('glo', '#ff8a3a', 0.5, IX + fx, IY + 0.4, IZ + fz - 0.5, 0.7, 8); k.sph('glo', '#ffd27a', 0.28, IX + fx, IY + 0.6, IZ + fz - 0.5, 1.2, 6);
    k.box('mat', '#6b6258', 4.0, 0.2, 1.0, IX + fx, IY + 2.9, IZ + fz - 0.1); ib(fx - 1.9, fx + 1.9, fz - 0.6, fz + 0.4); }
  chand(20, -7, 5, 7, 1.4, 10);
  // --- TREASURY ---
  { const vx = 10.5, vz = 6.8; k.cyl('gls', GOLD, 1.7, 0.45, IX + vx + 0.25, IY + 1.8, IZ + vz, 24, 0, Math.PI / 2); k.cyl('mat', '#b08a3a', 1.3, 0.47, IX + vx + 0.25, IY + 1.8, IZ + vz, 24, 0, Math.PI / 2);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; k.box('gls', '#c0c4cc', 0.5, 0.12, 0.12, IX + vx + 0.5, IY + 1.8 + Math.sin(a) * 0.7, IZ + vz + Math.cos(a) * 0.7, 0, a); } ib(vx, vx + 0.6, vz - 1.7, vz + 1.7); }
  for (const [x, z, r] of [[20.2, 5.8, 1.5], [20.6, 14.2, 1.3], [13.5, 14.6, 1.0], [18.5, 9.6, 0.8]]) { k.sph('gls', GOLD, r, IX + x, IY + 0.05, IZ + z, 0.5, 12); for (let i = 0; i < 10; i++) { const a = rnd() * 6.28, rr = r + 0.2 + rnd() * 0.6; k.cyl('gls', GOLD, 0.09, 0.03, IX + x + Math.cos(a) * rr, IY + 0.04, IZ + z + Math.sin(a) * rr, 10); } ir(x, z, r * 0.9); }
  for (const [x, z, open] of [[12.2, 15.2, 1], [15.0, 15.2, 0], [21.2, 10.5, 1], [21.2, 12.6, 0]]) { const along = z > 15; k.box('mat', '#6b4a32', along ? 1.3 : 0.8, 0.7, along ? 0.8 : 1.3, IX + x, IY + 0.35, IZ + z); for (const t of [-0.4, 0.4]) k.box('gls', GOLD, along ? 0.08 : 0.82, 0.72, along ? 0.82 : 0.08, IX + x + (along ? t : 0), IY + 0.36, IZ + z + (along ? 0 : t));
    if (open) { k.box('mat', '#6b4a32', along ? 1.3 : 0.12, along ? 0.12 : 0.8, along ? 0.8 : 1.3, IX + x + (along ? 0 : 0.42), IY + 0.95, IZ + z + (along ? 0.42 : 0), 0, along ? 1.2 : 0, along ? 0 : -1.2); k.sph('gls', GOLD, 0.45, IX + x, IY + 0.62, IZ + z, 0.4, 10); k.oct('glo', '#ff4a6a', 0.09, IX + x + 0.2, IY + 0.8, IZ + z); k.oct('glo', '#4ad0ff', 0.08, IX + x - 0.2, IY + 0.8, IZ + z + 0.1); }
    ib(x - 0.7, x + 0.7, z - 0.7, z + 0.7); }
  for (let lv = 0; lv < 3; lv++) for (let i = 0; i < 4 - lv; i++) for (let j = 0; j < 2; j++) k.box('gls', '#f0c060', 0.5, 0.18, 0.24, IX + 13.0 + i * 0.52 + lv * 0.26, IY + 0.09 + lv * 0.18, IZ + 5.0 + j * 0.26 + (lv % 2) * 0.05);
  ib(12.6, 15.2, 4.6, 5.8);
  { const px = 16, pz = 10; k.box('mat', '#cfc9dc', 0.9, 1.1, 0.9, IX + px, IY + 0.55, IZ + pz); k.box('mat', RED, 0.75, 0.12, 0.75, IX + px, IY + 1.16, IZ + pz); k.tor('gls', GOLD, 0.24, 0.05, IX + px, IY + 1.32, IZ + pz, Math.PI / 2);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; k.oct('gls', GOLD, 0.06, IX + px + Math.cos(a) * 0.24, IY + 1.44, IZ + pz + Math.sin(a) * 0.24, 1.8); } k.oct('glo', '#ff4a6a', 0.07, IX + px, IY + 1.34, IZ + pz + 0.25); k.box('glass', '#dff0ff', 1.0, 0.9, 1.0, IX + px, IY + 1.6, IZ + pz); ib(px - 0.6, px + 0.6, pz - 0.6, pz + 0.6); }
  for (const z of [6.5, 13.5]) { k.cyl('mat', NAVY, 0.6, 0.08, IX + 21.7, IY + 3.0, IZ + z, 16, 0, Math.PI / 2); k.box('mat', GOLD, 0.1, 0.8, 0.16, IX + 21.66, IY + 3.0, IZ + z); k.box('mat', GOLD, 0.1, 0.16, 0.8, IX + 21.66, IY + 3.0, IZ + z); for (const a of [-0.7, 0.7]) k.box('gls', '#c0c4cc', 0.05, 1.8, 0.07, IX + 21.62, IY + 3.0, IZ + z, 0, a); }
  chand(16, 10, 4.2, 6, 1.0, 8);
  k.build(IG);
  IG.traverse(q => { if (q.isMesh) { q.castShadow = false; q.receiveShadow = false; } });

  // =====================================================================================================================
  // PEOPLE: guards (looks from meru-castlepath.js), King Might + Prince Max (meru-interiors.js looks), royal guards
  // =====================================================================================================================
  const GL = Object.fromEntries((CP.FOXES || []).map(f => [f.key, f])), SP = key => (L.SPEAKERS.find(q => q.key === key) || {}).at;
  const npcs = [], talkers = [];
  const MSET = (() => { try { return loadArmorSets().meru; } catch (e) { return null; } })(), AT = (col, ex = {}) => new THREE.MeshToonMaterial({ color: col, ...ex }), AM = (geo, mat, x = 0, y = 0, z = 0, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (par) par.add(m); return m; };
  const MG = MSET ? (() => { const o = armorOutfit(MSET, { browWeight: 9, eyeTilt: 0.14, crestSize: 1.2 }); return { torso: o.torso, look: o.look, crest: 'M', gear: 'sword', mood: 'determined', meruArmor: true }; })() : null;   // the planet guard (Character Workshop MERU GUARD)
  const put = (key, look, x, y, z, ry, talk) => { const f = kit.makeFox({ key, torso: look.torso, crest: look.crest || 'M', gear: look.gear || 'none', outfit: look.outfit || 'armor', mood: look.mood || 'stern', crown: look.crown, eyes: look.eyes, look: look.look, joints: key === 'castleSentry' || undefined });   // s622: the 2 sentries are jointed (real salute at the guard change)
    if (look.meruArmor && MSET) { try { dressArmor({ THREE, M: AM, toon: AT }, f, MSET); } catch (e) { console.warn('meru guard armour', e); } }
    f.position.set(x, y, z); f.rotation.y = ry; scene.add(f); npcs.push(f); ring(x, z, 0.45, y - 3, y + 4); if (talk) talkers.push({ key, obj: f, ry, r: talk }); return f; };
  const G1 = SP('castleGuard1') || [KX1 + 2.5, DZ - 3.5], G2 = SP('castleGuard2') || [X1 + 4.5, GZ - 4.5];
  const guard1 = put('castleGuard1', MG || GL.castleGuard1 || { torso: ['#52525b', '#27272a', '#09090b'], gear: 'sword' }, G1[0], Y, G1[1], Math.PI / 2, 2.6);
  put('castleGuard2', MG || GL.castleGuard2 || { torso: ['#52525b', '#27272a', '#09090b'], gear: 'sword' }, G2[0], Y, G2[1], Math.PI / 2, 2.6);
  const sentry = MG || { torso: ['#1e3a8a', '#1e3a8a', '#172554'], gear: 'sword', mood: 'stern' };
  const sentries = []; for (const s of [-1, 1]) sentries.push(put('castleSentry', sentry, X1 - 6.5, Y, GZ + s * 3.8, Math.PI / 2));
  const MK = SP('mike'), kAt = MK && !Array.isArray(MK) && MK.room === 'castle' ? [MK.x, MK.z] : [0, -16];
  const king = put('mike', { torso: ['#7a808c', '#474d59', '#23272f'], crown: true, eyes: ['#e6b45a', '#e6b45a'], mood: 'warm', look: KING_MIGHT }, IX + kAt[0], IY + 0.6, IZ + kAt[1], 0, 4.2);
  const max = put('max', { torso: MAX.torso, crest: MAX.crest, mood: 'happy', gear: 'none' }, IX - 2.4, IY + 0.6, IZ - 15.5, 0.25);
  for (const s of [-1, 1]) put('royalGuard', sentry, IX + s * 3.4, IY + 0.6, IZ - 14.3, 0);
  put('treasuryGuard', sentry, IX + 8.2, IY, IZ + 13.6, -Math.PI / 2);
  const inner = npcs.filter(f => f.position.y < IY + 5), outer = npcs.filter(f => f.position.y > IY + 5);
  const TALK = { castleGuard1: { name: 'Castle Guard', role: 'Castle gate', lines: (CP.DIALOGUE || {}).castleGuard1 || [] }, castleGuard2: { name: 'Castle Guard', role: 'Castle gate', lines: (CP.DIALOGUE || {}).castleGuard2 || [] } };

  // =====================================================================================================================
  // FADE + STORY (meru-game.js castleGate / enterThrone, same flags + gifts)
  // =====================================================================================================================
  let veil = null, busy = false, toastS = '', toastT = 0;
  const fade = fn => { if (busy) return; busy = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity 0.26s', zIndex: '40' }); document.body.appendChild(veil); }
    requestAnimationFrame(() => { veil.style.opacity = '1'; }); setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; busy = false; }, 140); } }, 290); };
  const toast = (s, t = 3.5) => { toastS = s; toastT = t; };
  const HALL_IN = { x: IX, z: IZ + 15, yaw: Math.PI }, YARD_OUT = { x: KX1 + 4.8, z: DZ, yaw: Math.PI / 2 };
  const syncMax = () => { max.visible = !!save.flag('maxHome'); };
  syncMax();
  function enter(audience) {
    fade(() => { IG.visible = true;
      if (!audience) { go(HALL_IN.x, IY, HALL_IN.z, HALL_IN.yaw); return; }
      save.setFlag('maxHome'); save.setFlag('maxFollowing', false); syncMax(); go(IX + kAt[0], IY + 0.6, IZ + kAt[1] + 3.6, Math.PI); toast('Max made it home!', 3);
      const nm = String((save.data && save.data.name) || 'FOX SOLDIER').toUpperCase(), kt = talkers.find(t => t.key === 'mike');
      setTimeout(() => say(kt, audienceLines(nm).map(l => l.who === 'max' ? { ...l, role: 'Prince' } : l), () => { grantGifts(save); toast('+5 HEALING CHARGES · +150 GOLD · FLAGSHIP · BIG LASER GUN', 5); }, true), 700); }); }
  const hasKey = () => !!save.stat('casKey', false) && !save.flag('maxFollowing');   // s100: KEY TO THE CASTLE prize; the audience (Max following) still goes through the guard
  function door() { const ls = CP.castleDoorLines(f => save.flag(f)); if (!ls) { enter(false); return; } if (hasKey()) { enter(false); toast('THE CASTLE KEY · WELCOME HOME', 2.5); return; }
    const g = talkers.find(t => t.key === 'castleGuard1'); say(g, ls.map(l => l.who === 'max' ? { ...l, role: 'Prince' } : l), save.flag('maxFollowing') ? () => enter(true) : null); }
  const spots = [
    { key: 'castle:keep', x: KX1 + 1.6, z: DZ, r: 3.0, y: [Y - 1, Y + 3], get prompt() { return CP.castleDoorLines(f => save.flag(f)) && !hasKey() ? 'KNOCK · THE KEEP DOOR' : 'ENTER · THRONE ROOM'; }, use: () => door() },
    { key: 'castle:out', x: IX, z: IZ + 18.4, r: 2.4, y: [IY - 1, IY + 3], prompt: 'LEAVE · CASTLE COURTYARD', use: () => fade(() => { go(YARD_OUT.x, Y, YARD_OUT.z, YARD_OUT.yaw); IG.visible = false; }) },
  ];

  // =====================================================================================================================
  // WALK CONTRACT
  // =====================================================================================================================
  const inKeep = P => !!P && P.y < IY + 16 && P.y > IY - 10 && P.x > IX - 31 && P.x < IX + 31 && P.z > IZ - 21 && P.z < IZ + 21;
  function groundAt(x, z, y) { if (y > IY + 16 || y < IY - 10) return null; const lx = x - IX, lz = z - IZ; if (lx < -30.5 || lx > 30.5 || lz < -20.5 || lz > 20.5) return null;
    if (lx > -7 && lx < 7 && lz > -20 && lz < -13.5) return IY + 0.6; if (lx > -4.5 && lx < 4.5 && lz >= -13.5 && lz < -12.9) return IY + 0.3; return IY; }
  const roomOf = P => { const lx = P.x - IX, lz = P.z - IZ; return ROOMS.find(R => lx > R.x0 - 0.1 && lx < R.x1 + 0.1 && lz > R.z0 && lz < R.z1) || ROOMS[0]; };
  function camFix(camera, P) { if (!inKeep(P)) return; const R = roomOf(P), c = camera.position, m = 0.45, tx = P.x, ty = P.y + 1.4, tz = P.z;
    const dx = c.x - tx, dy = c.y - ty, dz = c.z - tz; let t = 1; const bx0 = IX + R.x0 + m, bx1 = IX + R.x1 - m, bz0 = IZ + R.z0 + m, bz1 = IZ + R.z1 - m, top = IY + R.h - 0.5;
    if (dx > 0) t = Math.min(t, (bx1 - tx) / dx); else if (dx < 0) t = Math.min(t, (bx0 - tx) / dx); if (dz > 0) t = Math.min(t, (bz1 - tz) / dz); else if (dz < 0) t = Math.min(t, (bz0 - tz) / dz); if (dy > 0) t = Math.min(t, (top - ty) / dy);
    t = Math.max(0.15, Math.min(1, t)); const hd = Math.hypot(dx, dz) * t; c.set(tx + dx * t, Math.max(IY + 0.5, ty + dy * t), tz + dz * t);
    if (hd < 3) c.y = Math.min(top, Math.max(c.y, ty + 1.2 + (3 - hd) * 0.7));   // tight to a wall: lift over the shoulder so the fox does not fill the screen
    camera.lookAt(tx, ty, tz); }
  let tt = 0, cull = 0;
  function tick(dt, P, cam) { tt += dt; toastT -= dt; if (toastT <= 0) toastS = '';
    for (const f of flags) f.rotation.y = Math.sin(tt * 2.1 + f.position.x) * 0.3;
    const ink = inKeep(P); if (ink) IG.visible = true; else if (IG.visible && !busy) IG.visible = false;
    cull -= dt; if (cull <= 0) { cull = 0.4; const dd = cam ? Math.hypot(cam.x - cxw, cam.z - czw) : 0; DET.visible = !ink && dd < (touch ? 95 : 150); for (const f of outer) f.visible = !ink && !f.userData.lifeHide && dd < (touch ? 70 : 110); for (const f of inner) f.visible = ink && !f.userData.lifeHide && (f !== max || !!save.flag('maxHome')); }
    if (ink) { for (const f of inner) if (f.visible && !f.userData.ownAnim) kit.animFox(f, dt, 0, false); } else if (DET.visible) for (const f of outer) if (f.visible && !f.userData.ownAnim) kit.animFox(f, dt, 0, false); }
  const covers = (x, z) => x > X0 - 1 && x < X1 + 1 && z > Z0 - 1 && z < Z1 + 1;
  const where = P => { if (!inKeep(P)) return null; const R = roomOf(P); return { label: R.label, key: R.key === 'hall' ? 'meruThroneroom' : 'meruCastle' }; };
  return { spots, talkers, TALK, keys: new Set(['castleGuard1', 'castleGuard2', 'mike']), tick, groundAt, inside: inKeep, where, camFix, covers, toast: () => toastS, enter, door, guard: guard1, king, max, sentries, flags, IG, detVisible: () => DET.visible, leave: () => fade(() => { go(YARD_OUT.x, Y, YARD_OUT.z, YARD_OUT.yaw); IG.visible = false; }),
    stats: { rooms: ROOMS.length, npcs: npcs.length } };
}
