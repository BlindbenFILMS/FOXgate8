// MERU 2.0 — s47 TOWN 2 INTERIOR 5: FOX FEET SHOES [meruShoes] (f 33..47 × -166..-152, door S (40, -152), side door E (47, -159)).
// LACE (Ben's pick): quick, sporty young fox in a tracksuit with a whistle.
// ONE VISIT (Ben): FIT the customer first (1 MEASURE on the sizer · 2 FIND THE BOX on the stock wall · 3 LACE UP by tracing the eyelets)
// then FIX their old pair on the cobbler bench (4 GLUE the sole · 5 HAMMER the nails in time · 6 RUB to polish). GENTLE: no fail.
// Prizes (Ben): look-only shoes in colours (worn on the player's feet in Meru 2, set at the SHOE MIRROR), LUCKY LACES (+25 % gold at Lace's),
// SHOE SHINE KIT, and last of all the GOLD SNEAKERS (a bit of everything: faster walk + higher jump, Meru 2).
// s66 INTERIOR POLISH 5: shopKit (Lace = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board; badge), NOW HIRING by the door,
// one-box menu with choices, one-box end line, yellow ring at the work spot, hint hand after 3 s, touch radius 44 + bigger dots, portrait wide lens, camera kept in the room.
import { applyD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 life poses
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildShoes({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted }) {
  const X0 = 33.4, X1 = 46.6, Z0 = -165.6, Z1 = -152.4, CX = 40, CZ = -159;
  const G = new THREE.Group(); G.name = 'shoeShop'; scene.add(G);
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
  const INK = '#201e1d', NAVY = '#2e4a6b', YEL = '#ffd23a', WHITE = '#f3f2f2', RED = '#ec3013', CHROME = '#c9ced3', WOOD = '#c9a77a', WOOD2 = '#7a5638', BROWN = '#8a5a34';
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 12, H / 2 + 2); });
  const plane = (map, w, h, x, y, z, ry = 0, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...opt })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  // ================= SHOE MODEL (toe +z, heel -z, sole on y 0; ~0.42 m long, chunky like the foxes' feet) =================
  const ey = (x, z) => 0.09 + 0.105 * Math.sqrt(Math.max(0, 1 - (x / 0.145) ** 2 - (z / 0.2) ** 2)) + 0.003;
  const EYE = [-0.02, 0.02, 0.06, 0.10].flatMap(z => [[-0.055, z], [0.055, z]]);   // L0 R0 L1 R1 … (the lacing order)
  const KINDS = { run: { name: 'RUNNERS', box: YEL, fg: INK, up: YEL, trim: NAVY, stripe: 1 }, high: { name: 'HIGH-TOPS', box: RED, fg: '#ffffff', up: RED, trim: WHITE, collar: 1 },
    boot: { name: 'BOOTS', box: BROWN, fg: '#ffffff', up: BROWN, trim: '#4a2e1a', collar: 1.4, sole: INK }, skate: { name: 'SKATE SHOES', box: NAVY, fg: '#ffffff', up: NAVY, trim: WHITE, stripe: 1, sole: '#e8d9b8' } };
  function shoeParts(o) { const P = [], S = (sc, pos, col, role = 'base') => P.push({ t: 's', sc, pos, col, role }), B = (sz, pos, col, rot = [0, 0, 0], role = 'base') => P.push({ t: 'b', sz, pos, col, rot, role });
    S([0.155, 0.035, 0.21], [0, 0.035, 0], o.sole || WHITE, 'sole'); S([0.145, 0.105, 0.2], [0, 0.09, 0], o.up, 'upper'); S([0.118, 0.06, 0.085], [0, 0.07, 0.148], o.trim, 'cap');
    B([0.07, 0.07, 0.03], [0, 0.16, -0.196], o.trim); B([0.07, 0.014, 0.15], [0, 0.198, 0.04], o.trim, [-0.12, 0, 0]);
    if (o.stripe) for (const s of [-1, 1]) B([0.006, 0.03, 0.15], [s * 0.141, 0.1, -0.01], o.trim);
    if (o.collar) { const h = 0.11 * o.collar; P.push({ t: 'c', r: 0.092, h, pos: [0, 0.17 + h / 2, -0.1], col: o.up, role: 'upper' }); P.push({ t: 'c', r: 0.104, h: 0.024, pos: [0, 0.17 + h, -0.1], col: o.trim }); P.push({ t: 'c', r: 0.07, h: 0.03, pos: [0, 0.172 + h, -0.1], col: INK }); }
    if (!o.noEyes) for (const [x, z] of EYE) S([0.012, 0.007, 0.012], [x, ey(x, z), z], INK);
    if (o.laced) for (let i = 0; i < 4; i++) B([0.11, 0.008, 0.012], [0, ey(0.03, EYE[i * 2][1]) + 0.004, EYE[i * 2][1]], o.lace || WHITE);
    return P; }
  const SG = new THREE.SphereGeometry(1, 14, 9), BG = new THREE.BoxGeometry(1, 1, 1);
  function partInto(B, p, ox, oy, oz, ry, s) { const c = Math.cos(ry), sn = Math.sin(ry), [px, py, pz] = p.pos, x = ox + s * (px * c + pz * sn), y = oy + s * py, z = oz + s * (-px * sn + pz * c);
    if (p.t === 's') B.put(SG, x, y, z, p.col, ry, 0, 0, p.sc[0] * s, p.sc[1] * s, p.sc[2] * s); else if (p.t === 'b') B.put(BG, x, y, z, p.col, ry + p.rot[1], p.rot[0], p.rot[2], p.sz[0] * s, p.sz[1] * s, p.sz[2] * s);
    else B.put(new THREE.CylinderGeometry(p.r * s, p.r * s, p.h * s, 16), x, y, z, p.col, ry); }
  const shoeInto = (B, o, x, y, z, ry = 0, s = 1) => { for (const p of shoeParts(o)) partInto(B, p, x, y, z, ry, s); };
  function makeShoe(o, s = 1) { const g = new THREE.Group(), base = mk(), up = mk(), so = mk(); const piv = new THREE.Group(); piv.position.set(0, 0.035 * s, -0.17 * s); g.add(piv);
    for (const p of shoeParts(o)) { if (o.shiny && p.role === 'upper') partInto(up, p, 0, 0, 0, 0, s); else if (o.loose && p.role === 'sole') partInto(so, p, 0, -0.035 * s, 0.17 * s, 0, s); else partInto(base, p, 0, 0, 0, 0, s); }
    const lam = () => new THREE.MeshLambertMaterial({ vertexColors: true }); g.add(new THREE.Mesh(base.geo(), o.gold ? new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0xffe9a0, emissive: 0x3a2a08 }) : lam()));
    let upMat = null; if (up.n()) { upMat = new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 2, specular: 0x222222 }); g.add(new THREE.Mesh(up.geo(), upMat)); }
    if (so.n()) piv.add(new THREE.Mesh(so.geo(), lam())); return { g, upMat, piv, s }; }
  // ---------- floor: pale wood planks + a yellow running lane from the door to the stock wall ----------
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#d8bc94', '#cfb187', '#dcc29c', '#d2b48b'][i % 4]; g.fillRect(0, i * 32, W, 32); g.fillStyle = 'rgba(90,60,30,0.35)'; g.fillRect(0, i * 32, W, 2); g.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 4, (Z1 - Z0) / 2); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f);
    for (const x of [39.2, 40.8]) box(0.08, 0.01, 10.6, YEL, x, 0.078, -158.6); for (let z = -154; z > -164; z -= 1.5) box(1.5, 0.01, 0.06, WHITE, 40, 0.078, z); }
  // ---------- walls: white lower panel, yellow rail, navy upper wall, white top band (gaps for both doors) ----------
  const wall = (len, x, z, ry) => { box(len, 1.2, 0.05, WHITE, x, 0.6, z, ry); box(len, 0.1, 0.09, YEL, x, 1.25, z, ry); box(len, 3.0, 0.05, NAVY, x, 2.8, z, ry); box(len, 0.14, 0.07, WHITE, x, 4.36, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, -160.4], [-157.6, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  for (const [a, b] of [[X0, 38.6], [41.4, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0);
  // ================= THE STOCK WALL (back wall): 17 × 7 cubbies of shoe boxes; the middle 6 × 5 are the ones you search =================
  const SW = { cols: 17, rows: 7, pw: 0.68, ph: 0.56, bw: 0.62, bh: 0.5, y0: 0.36, face: Z0 + 0.6 }; SW.x0 = CX - SW.cols * SW.pw / 2;
  const PC = [6, 11], PR = [0, 4], cellX = c => SW.x0 + (c + 0.5) * SW.pw, cellY = r => SW.y0 + (r + 0.5) * SW.ph, isPlay = (c, r) => c >= PC[0] && c <= PC[1] && r >= PR[0] && r <= PR[1];
  box(SW.cols * SW.pw + 0.1, SW.rows * SW.ph + 0.1, 0.04, '#e9e6df', CX, SW.y0 + SW.rows * SW.ph / 2, Z0 + 0.07);
  for (let r = 0; r <= SW.rows; r++) box(SW.cols * SW.pw + 0.06, 0.035, 0.6, WHITE, CX, SW.y0 + r * SW.ph, Z0 + 0.33);
  for (let c = 0; c <= SW.cols; c++) box(0.03, SW.rows * SW.ph, 0.6, WHITE, SW.x0 + c * SW.pw, SW.y0 + SW.rows * SW.ph / 2, Z0 + 0.33);
  box(SW.cols * SW.pw + 0.1, SW.y0, 0.62, INK, CX, SW.y0 / 2, Z0 + 0.33); rect(SW.x0 - 0.1, SW.x0 + SW.cols * SW.pw + 0.1, Z0, Z0 + 0.7);
  { const xa = SW.x0 + PC[0] * SW.pw, xb = SW.x0 + (PC[1] + 1) * SW.pw, ya = SW.y0, yb = SW.y0 + (PR[1] + 1) * SW.ph; for (const y of [ya, yb]) box(xb - xa + 0.1, 0.06, 0.05, YEL, (xa + xb) / 2, y, SW.face + 0.03); for (const xx of [xa, xb]) box(0.06, yb - ya, 0.05, YEL, xx, (ya + yb) / 2, SW.face + 0.03); }
  const KK = Object.keys(KINDS), CELLS = []; for (let r = 0; r < SW.rows; r++) for (let c = 0; c < SW.cols; c++) CELLS.push({ c, r, kind: KK[(c * 7 + r * 3) % 4], size: 5 + ((c * 5 + r * 11) % 9), gone: false });
  const stockIM = new THREE.InstancedMesh(new THREE.BoxGeometry(SW.bw, SW.bh, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff }), CELLS.length); G.add(stockIM);
  const M4 = new THREE.Matrix4(), Z4 = new THREE.Matrix4().makeScale(0, 0, 0);
  const stockTex = CT(1088, 448, () => {}); const SC = stockTex.userData.canvas;
  function drawStock() { const g = SC.getContext('2d'), cw = SC.width / SW.cols, ch = SC.height / SW.rows, iw = cw * SW.bw / SW.pw, ih = ch * SW.bh / SW.ph; g.clearRect(0, 0, SC.width, SC.height);
    CELLS.forEach((C, i) => { const K = KINDS[C.kind], x = C.c * cw + (cw - iw) / 2, y = (SW.rows - 1 - C.r) * ch + (ch - ih) / 2; stockIM.setMatrixAt(i, C.gone ? Z4 : M4.makeTranslation(cellX(C.c), cellY(C.r), SW.face - 0.25)); stockIM.setColorAt(i, cc.set(C.gone ? '#3d3b3a' : K.box).multiplyScalar(isPlay(C.c, C.r) ? 1 : 0.6));
      if (C.gone) { g.fillStyle = '#2b2927'; g.fillRect(x, y, iw, ih); return; }
      const pl = isPlay(C.c, C.r); g.fillStyle = K.box; g.fillRect(x, y, iw, ih); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, y + ih - 9, iw, 9);
      if (pl) { g.fillStyle = K.fg; g.font = '900 36px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(String(C.size), x + 6, y + ih / 2 - 3); } else { g.fillStyle = 'rgba(32,30,29,0.42)'; g.fillRect(x, y, iw, ih); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x + iw * 0.3, y + ih * 0.42, iw * 0.4, 5); }
      g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, iw - 2, ih - 2); });
    stockIM.instanceMatrix.needsUpdate = true; if (stockIM.instanceColor) stockIM.instanceColor.needsUpdate = true; stockTex.needsUpdate = true; }
  drawStock(); { const p = plane(stockTex, SW.cols * SW.pw, SW.rows * SW.ph, CX, SW.y0 + SW.rows * SW.ph / 2, SW.face + 0.006, 0, { transparent: true, alphaTest: 0.5 }); p.name = 'stockLabels'; }
  { const lx = SW.x0 + 5 * SW.pw + 0.05; for (const s of [-0.22, 0.22]) box(0.05, 4.2, 0.05, WOOD2, lx + s, 2.1, SW.face + 0.35, 0, -0.08); for (let y = 0.4; y < 4.1; y += 0.35) box(0.46, 0.04, 0.05, WOOD2, lx, y, SW.face + 0.35 - y * 0.08 + 0.17, 0, -0.08); box(0.6, 0.04, 0.04, CHROME, lx, 4.2, SW.face + 0.05); }
  plane(label('STOCKROOM · SIZES 5–13', INK, YEL, 640, 64, 40), 3.2, 0.32, CX, SW.y0 + SW.rows * SW.ph + 0.25, Z0 + 0.09);
  // ---------- legend of box colours (beside the playable block) ----------
  { const t = CT(512, 256, (g, W, H) => { g.fillStyle = WHITE; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.font = '900 36px Archivo, sans-serif'; g.textBaseline = 'middle';
      KK.forEach((k, i) => { g.fillStyle = KINDS[k].box; g.fillRect(24, 26 + i * 56, 56, 40); g.strokeRect(24, 26 + i * 56, 56, 40); g.fillStyle = INK; g.fillText(KINDS[k].name, 100, 48 + i * 56); }); });
    plane(t, 1.0, 0.5, X0 + 0.08, 2.5, -163.2, Math.PI / 2); }
  // ================= FITTING CORNER (west): the SIZER spot, a lacing table, the bench =================
  const SZ = { x: 35.3, z: -158.6 }, TABLE = { x: 35.75, z: -161.3, y: 0.78 }, BENCH = { x: X0 + 0.45, z0: -157.6, z1: -154.6, y: 0.5 };
  cyl(0.42, 0.42, 0.05, WOOD, TABLE.x, TABLE.y - 0.025, TABLE.z, 20); cyl(0.05, 0.06, TABLE.y - 0.08, INK, TABLE.x, (TABLE.y - 0.08) / 2 + 0.07, TABLE.z, 8); cyl(0.26, 0.28, 0.04, INK, TABLE.x, 0.09, TABLE.z, 14); ringC(TABLE.x, TABLE.z, 0.45);
  box(0.62, 0.09, BENCH.z1 - BENCH.z0, NAVY, BENCH.x, BENCH.y - 0.05, (BENCH.z0 + BENCH.z1) / 2); box(0.66, 0.04, BENCH.z1 - BENCH.z0 + 0.04, WOOD2, BENCH.x, BENCH.y - 0.11, (BENCH.z0 + BENCH.z1) / 2);
  for (const z of [BENCH.z0 + 0.15, BENCH.z1 - 0.15]) box(0.5, BENCH.y - 0.15, 0.06, INK, BENCH.x, (BENCH.y - 0.15) / 2 + 0.07, z); box(0.08, 0.6, BENCH.z1 - BENCH.z0, NAVY, X0 + 0.1, BENCH.y + 0.3, (BENCH.z0 + BENCH.z1) / 2); rect(X0, X0 + 0.8, BENCH.z0, BENCH.z1);
  cyl(0.5, 0.5, 0.012, YEL, SZ.x, 0.075, SZ.z, 24); cyl(0.42, 0.42, 0.014, INK, SZ.x, 0.077, SZ.z, 24);
  // ---------- the WEST WALL display: floating shelves of shoes ----------
  for (let r = 0; r < 4; r++) { const y = 0.9 + r * 0.65; box(0.32, 0.04, 3.4, WHITE, X0 + 0.18, y, -163.2); for (let i = 0; i < 5; i++) { const k = KK[(i + r) % 4], K = KINDS[k]; shoeInto(R0, { ...K, laced: true, up: r === 3 && i === 2 ? WHITE : K.up }, X0 + 0.2, y + 0.02, -164.6 + i * 0.68, Math.PI / 2, 0.62); } }
  // ---------- centre island: NEW IN ----------
  box(2.0, 0.7, 0.9, WHITE, 40.4, 0.42, -159.6); box(2.06, 0.05, 0.96, INK, 40.4, 0.79, -159.6); rect(39.35, 41.45, -160.1, -159.1);
  [['run', 39.75, -159.8, 0.4], ['high', 40.4, -159.45, -0.3], ['skate', 41.05, -159.8, 0.5]].forEach(([k, x, z, ry]) => shoeInto(R0, { ...KINDS[k], laced: true }, x, 0.815, z, ry, 0.85));
  { const t = label('NEW IN', RED, '#ffffff', 256, 64, 40); const p = plane(t, 0.5, 0.125, 40.4, 0.92, -159.12); p.rotation.x = -0.3; }
  // ================= COBBLER BENCH (east, north of the side door) =================
  const OLDP = { x: 45.7, y: 0.98, z: -163.4 };
  box(1.4, 0.08, 2.7, WOOD2, 45.85, 0.88, -163.25); for (const [x, z] of [[45.25, -164.5], [46.45, -164.5], [45.25, -162.0], [46.45, -162.0]]) box(0.08, 0.84, 0.08, INK, x, 0.43, z); box(1.3, 0.04, 2.5, WOOD2, 45.85, 0.25, -163.25); rect(45.1, X1, -164.65, -161.85);
  cyl(0.11, 0.13, 0.02, INK, OLDP.x, 0.93, OLDP.z, 14); cyl(0.025, 0.025, 0.05, INK, OLDP.x, 0.95, OLDP.z, 8);
  box(0.3, 0.03, 0.05, WOOD, 45.55, 0.935, -162.4, 0.4); box(0.06, 0.06, 0.12, '#5a5654', 45.43, 0.95, -162.46, 0.4);
  cyl(0.06, 0.06, 0.1, '#e9e6df', 45.5, 0.97, -164.3, 12); cyl(0.065, 0.065, 0.02, INK, 45.5, 1.03, -164.3, 12); cyl(0.008, 0.008, 0.18, WOOD, 45.53, 1.08, -164.3, 5);
  for (let i = 0; i < 3; i++) { cyl(0.05, 0.05, 0.025, ['#201e1d', '#8a5a34', '#ec3013'][i], 46.1, 0.935, -164.25 + i * 0.13, 14); cyl(0.051, 0.051, 0.006, CHROME, 46.1, 0.95, -164.25 + i * 0.13, 14); }
  for (let i = 0; i < 2; i++) { box(0.16, 0.04, 0.06, WOOD, 46.2, 0.94, -163.2 + i * 0.2); box(0.15, 0.03, 0.05, INK, 46.2, 0.91, -163.2 + i * 0.2); }
  box(0.36, 0.26, 0.3, '#5a5654', 46.25, 1.05, -162.35); for (const s of [-1, 1]) { cyl(0.12, 0.12, 0.05, s > 0 ? '#e9e6df' : '#c9a14a', 46.25, 1.12, -162.35 + s * 0.2, 16, Math.PI / 2); } box(0.05, 0.05, 0.5, CHROME, 46.25, 1.12, -162.35);
  { const ax = 46.45; cyl(0.015, 0.015, 0.7, INK, ax, 1.27, -164.0, 6); box(0.5, 0.02, 0.02, INK, ax - 0.22, 1.6, -164.0, 0, 0, 0.3); put(new THREE.ConeGeometry(0.1, 0.14, 12, 1, true), ax - 0.45, 1.5, -164.0, YEL); }
  box(0.25, 0.9, 2.4, WOOD2, X1 - 0.13, 2.05, -163.25); for (let i = 0; i < 5; i++) cyl(0.07, 0.07, 0.24, ['#8a5a34', '#4a2e1a', '#c9a14a', '#201e1d', '#a0522d'][i], X1 - 0.18, 2.62, -164.2 + i * 0.45, 12, Math.PI / 2);
  plane(label('REPAIRS · RESOLES · SHINE', INK, YEL, 768, 72, 44), 2.4, 0.24, X1 - 0.05, 3.0, -163.25, -Math.PI / 2);
  box(0.4, 0.04, 0.4, NAVY, 44.6, 0.55, -163.25); cyl(0.03, 0.03, 0.5, INK, 44.6, 0.3, -163.25, 6); cyl(0.2, 0.22, 0.03, INK, 44.6, 0.09, -163.25, 12); ringC(44.6, -163.25, 0.25);
  // ---------- front east: TILL counter + shoe bags ----------
  box(2.3, 1.0, 0.7, NAVY, 44.55, 0.5, -153.95); box(2.4, 0.05, 0.8, WHITE, 44.55, 1.02, -153.95); box(2.32, 0.1, 0.72, YEL, 44.55, 0.12, -153.95); rect(43.35, 45.75, -154.35, -153.55);
  box(0.42, 0.26, 0.36, '#3d3b3a', 45.2, 1.18, -154.0); box(0.36, 0.1, 0.22, INK, 45.2, 1.36, -154.05, 0, -0.35); for (let i = 0; i < 3; i++) { box(0.3, 0.36, 0.14, [YEL, RED, WHITE][i], 43.8 + i * 0.36, 1.23, -153.8); box(0.18, 0.08, 0.01, INK, 43.8 + i * 0.36, 1.45, -153.72); }
  // ---------- THE GOLDEN PAIR under glass (the last prize) ----------
  const GP = { x: 43.8, z: -157.0 }; box(0.66, 0.95, 0.66, WHITE, GP.x, 0.47, GP.z); box(0.7, 0.05, 0.7, INK, GP.x, 0.97, GP.z); ringC(GP.x, GP.z, 0.45);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), new THREE.MeshPhongMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.22, shininess: 120, depthWrite: false })); glass.position.set(GP.x, 1.25, GP.z); G.add(glass);
  const goldOn = makeShoe({ up: '#e6b45a', trim: '#fff1b8', sole: '#c9a14a', laced: true, lace: '#fff1b8', gold: true }, 0.95); goldOn.g.position.set(GP.x, 1.0, GP.z); goldOn.g.rotation.y = 0.7; G.add(goldOn.g);
  { const t = CT(512, 128, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.font = '900 46px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('THE GOLDEN PAIR', 18, 44); g.fillStyle = WHITE; g.font = '800 28px Archivo, sans-serif'; g.fillText('NOT FOR SALE · EARN THEM', 18, 96); });
    plane(t, 0.64, 0.16, GP.x, 0.75, GP.z + 0.335); }
  // ---------- SHOE MIRROR (front west): a low tilted mirror + mat ----------
  const MIR = { x: 45.25, z: -156.0 }; cyl(0.7, 0.7, 0.02, NAVY, MIR.x, 0.08, MIR.z, 24); cyl(0.6, 0.6, 0.022, YEL, MIR.x, 0.085, MIR.z, 24);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), new THREE.MeshPhongMaterial({ color: 0xcfe0ea, shininess: 120, specular: 0xffffff })); m.rotation.order = 'YXZ'; m.position.set(X1 - 0.2, 0.65, MIR.z); m.rotation.set(-0.2, -Math.PI / 2, 0); G.add(m);
    box(1.5, 0.06, 0.06, INK, X1 - 0.12, 0.14, MIR.z, Math.PI / 2); box(1.5, 0.06, 0.06, INK, X1 - 0.3, 1.15, MIR.z, Math.PI / 2); rect(X1 - 0.4, X1, MIR.z - 0.75, MIR.z + 0.75); plane(label('SHOE MIRROR', INK, YEL, 320, 64, 36), 1.2, 0.24, X1 - 0.08, 1.55, MIR.z, -Math.PI / 2); }
  cyl(0.22, 0.17, 0.4, '#b0573a', X0 + 0.45, 0.27, Z1 - 0.5, 12); for (let k = 0; k < 7; k++) sph(0.2, '#3f7a52', X0 + 0.45 + Math.cos(k) * 0.14, 0.75 + (k % 3) * 0.18, Z1 - 0.5 + Math.sin(k) * 0.14); ringC(X0 + 0.45, Z1 - 0.5, 0.3);
  // ---------- hanging sign + pendants ----------
  { const sX = 40, sY = 3.6, sZ = -157.4; for (const x of [sX - 0.7, sX + 0.7]) cyl(0.008, 0.008, 0.8, '#3d3b3a', x, sY + 0.5, sZ, 3); const T = label("LACE'S · FOX FEET", YEL, INK, 640, 96, 54); const s1 = plane(T, 3.0, 0.45, sX, sY, sZ + 0.01); const s2 = s1.clone(); s2.rotation.y = Math.PI; s2.position.z = sZ - 0.01; G.add(s2); }
  const bulbs = []; for (const [x, z] of [[36, -160], [40, -162.5], [44, -160], [36, -155.5], [44, -155.5], [45.6, -163.3]]) { cyl(0.01, 0.01, 1.0, '#3d3b3a', x, 4.4, z, 3); put(new THREE.CylinderGeometry(0.16, 0.24, 0.2, 12, 1, true), x, 3.82, z, YEL); bulbs.push([x, 3.72, z]); }
  // default old pair on the bench (decor until a visit puts the customer's pair there)
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const lm = new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 8, 5), lm, bulbs.length); bulbs.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  // ================= FEET ON FOXES (leg-local overlay over the fox-kit boot: socks, new shoes, the player's looks) =================
  const toonC = {}; const TM = (c, gold) => toonC[c + (gold ? 'g' : '')] || (toonC[c + (gold ? 'g' : '')] = gold ? new THREE.MeshToonMaterial({ color: c, emissive: new THREE.Color('#8a6410'), emissiveIntensity: 0.8 }) : new THREE.MeshToonMaterial({ color: c }));
  const inkM = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.BackSide });
  function footPart(o) { const g = new THREE.Group(), add = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.scale.set(sx, sy, sz); me.renderOrder = 2; g.add(me); return me; };
    add(SG, TM(o.up, o.gold), 0, -0.42, 0.05, 0.149, 0.099, 0.205); add(SG, inkM, 0, -0.42, 0.05, 0.158, 0.106, 0.214);
    if (!o.sock) { add(SG, TM(o.sole || WHITE, o.gold), 0, -0.49, 0.055, 0.152, 0.03, 0.212); add(SG, TM(o.trim, o.gold), 0, -0.45, 0.19, 0.11, 0.06, 0.08); for (let i = 0; i < 3; i++) add(BG, TM(o.lace || WHITE), 0, -0.33 - i * 0.02, 0.06 + i * 0.045, 0.1, 0.012, 0.014); }
    else add(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 14), TM(o.trim), 0, -0.3, 0.0);
    if (o.collar) { add(new THREE.CylinderGeometry(0.105, 0.11, 0.11 * o.collar, 14), TM(o.up, o.gold), 0, -0.32 + 0.04 * o.collar, -0.01); add(new THREE.CylinderGeometry(0.115, 0.115, 0.022, 14), TM(o.trim, o.gold), 0, -0.27 + 0.09 * o.collar, -0.01); }
    g.traverse(o => { o.renderOrder = 2; }); return g; }   // the group too: three sorts children by their group's renderOrder, 2 = after the walk's x-ray shells
  function putFeet(fox, o) { const U = fox && fox.userData; if (!U || !U.P || !U.P.legs) return; if (U.feet) U.feet.forEach(p => p.parent && p.parent.remove(p)); U.feet = []; U.feetKey = o ? JSON.stringify(o) : '';
    if (o) U.P.legs.forEach(l => { const p = footPart(o); l.add(p); U.feet.push(p); }); }
  const LOOKS = [{ key: 'redRunners', name: 'RED RUNNERS', up: RED, trim: WHITE, sole: WHITE }, { key: 'navyHigh', name: 'NAVY HIGH-TOPS', up: NAVY, trim: WHITE, sole: WHITE, collar: 1 },
    { key: 'whiteKicks', name: 'WHITE KICKS', up: WHITE, trim: RED, sole: RED }, { key: 'trailBoots', name: 'TRAIL BOOTS', up: BROWN, trim: '#4a2e1a', sole: INK, collar: 1.4, lace: YEL }];
  const GOLD_LOOK = { key: 'gold', name: 'GOLD SNEAKERS', up: '#ffcf4a', trim: '#fff1b8', sole: '#c9a14a', lace: '#fff1b8', gold: true }, LOOK = Object.fromEntries([...LOOKS, GOLD_LOOK].map(l => [l.key, l]));
  const lookOf = k => { const L = LOOK[k]; if (!L) return null; const { key, name, ...o } = L; return o; };
  // ---------- LACE ----------
  const LACE_LOOK = { fur: '#e0662a', furDark: '#9a3a12', muzzle: '#fff1e0', snout: '#ffe2c8', chin: '#fff6ec', fluff: '#fff6ec' };
  const lace = kit.makeFox({ key: 'laceShoes', torso: [NAVY, YEL, '#1b2c40'], outfit: 'tee', mood: 'happy', eyes: ['#2e86b8', '#2e86b8'], look: LACE_LOOK });
  const LACE_SPOT = { idle: [37.7, -160.6, -Math.PI / 2], fit: [36.4, -158.6, -Math.PI / 2], fix: [44.5, -161.6, Math.PI * 0.85], reveal: [36.0, -157.3, -Math.PI * 0.75] };
  lace.position.set(LACE_SPOT.idle[0], 0, LACE_SPOT.idle[1]); G.add(lace); const laceCol = { c: [LACE_SPOT.idle[0], LACE_SPOT.idle[1], 0.45] }; cols.push(laceCol);
  { const P = lace.userData && lace.userData.P; if (P && P.head) { const hb = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 6, 24), TM(YEL)); hb.position.set(0, 0.16, -0.02); hb.rotation.x = Math.PI / 2 - 0.25; hb.scale.set(1.02, 1.02, 1); hb.renderOrder = 2; P.head.add(hb); }
    if (P && P.body) { const cord = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 4, 20), TM(RED)); cord.position.set(0, 1.12, 0.1); cord.rotation.x = Math.PI / 2 + 0.6; P.body.add(cord);
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 10), new THREE.MeshPhongMaterial({ color: 0xdfe3e6, shininess: 100 })); wh.rotation.z = Math.PI / 2; wh.position.set(0.02, 0.98, 0.31); P.body.add(wh); } }
  putFeet(lace, { up: YEL, trim: NAVY, sole: WHITE });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'shoes', color: NAVY, boardTitle: "Lace's best",
    room: { X0, X1, Z0, Z1 }, door: [40, -152.8], keeper: lace, keeperRy: -Math.PI / 2,
    games: [{ k: 'fit', name: 'Fit and fix', color: NAVY }],
    board: { x: X0 + 0.06, y: 2.35, z: -156.1, ry: Math.PI / 2, w: 1.3 }, hiring: { x: 37.4, z: -152.95, ry: Math.PI }, hiringLine: 'FIT SOME FEET',
    sun: [{ x: 40, z: -153.5, w: 1.6, d: 1.4 }, { x: 45.9, z: -159, w: 1.4, d: 1.6 }],
    lamps: bulbs,
    browse: [[34.3, -163.6, -Math.PI / 2], [40.4, -158.7, Math.PI], [43.8, -156.25, Math.PI], [34.3, -162.2, -Math.PI / 2]],
    looks: [['#a78bfa', '#ede9fe', '#5b21b6'], ['#f2741f', '#fff1e0', '#9a3a12']], clock: { x: X1 - 0.08, y: 2.9, z: -155.0, ry: -Math.PI / 2 } });
  const workRing = new THREE.Mesh(new THREE.RingGeometry(0.93, 1.05, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false })); workRing.rotation.x = -Math.PI / 2; workRing.position.set(36.2, 0.1, -157.6); G.add(workRing);
  const laceT = { key: 'shoesLace', obj: lace, ry: 0, r: 2.4 }, endT = { key: 'shoesEnd', obj: lace, ry: 0, r: 8 };
  const LN = 'lace', ROLE = 'THE SHOE COACH', ln = text => ({ who: LN, role: ROLE, text });
  // ---------- customers (Meru regulars) ----------
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], size: 6, kind: 'high', old: { up: '#7a7f86', trim: '#b8bcc0', sole: '#9a9a96', collar: 1 }, say: 'I stand at the till all day. High-tops, please. Soft ones.' },
    { name: 'PELL', forW: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'], size: 10, kind: 'boot', old: { up: '#4a3a30', trim: '#2a201a', sole: '#201e1d', collar: 1.4 }, say: 'Boots. The residents judge a doorman by his shine.' },
    { name: 'OTTO', forW: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], size: 11, kind: 'boot', old: { up: '#5a4a3a', trim: '#3a2e22', sole: '#201e1d', collar: 1.4 }, say: 'Pell got new boots. I need better boots.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], size: 7, kind: 'run', old: { up: '#9a8a6a', trim: '#6a5a4a', sole: '#c8c0b0' }, say: 'Runners. I chase every customer who walks past my stall.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], size: 9, kind: 'run', old: { up: '#8a8f96', trim: '#5a5654', sole: '#c8c0b0' }, say: 'Sizzle says I am slow. Give me something fast.' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], size: 12, kind: 'boot', old: { up: '#3f4a3a', trim: '#2a3228', sole: '#201e1d', collar: 1.4 }, say: 'Something that keeps the lake out. These let it in.' },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], size: 8, kind: 'skate', old: { up: '#5a5654', trim: '#8a8680', sole: '#a89a80' }, say: 'Flat soles. Grip. I wore through these doing one trick.' }];
  const custCache = {};
  const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'shoeCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  const sitPose = f => { const P = f.userData.P; if (!P) return; if (P.fore) { applyD(THREE, f, lifeD('sit', performance.now() / 1000, { ph: 2 }), 0, 1); return; } if (P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); if (P.arms) P.arms.forEach(a => { a.rotation.x = -0.6; a.rotation.z = 0; }); };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), thunk = () => { tone(150, 0.12, 0.14, 'square'); tone(90, 0.08, 0.2); }, squeak = () => tone(1300 + Math.random() * 500, 0.02, 0.07, 'triangle');
  const whistle = () => { for (let i = 0; i < 5; i++) tone(2600 + (i % 2) * 180, 0.035, 0.07, 'square', i * 0.05); };
  // ---------- prizes ----------
  const arr = k => { const o = save.stat(k, null); return Array.isArray(o) ? o : []; };
  const wear = () => save.stat('shoeWear', null);
  const goldOwned = () => !!save.stat('shoeGold', false);
  function giveGift() { const n = save.stat('shoeClears', 0); save.setStat('shoeClears', n + 1); const own = arr('shoeLooks'), next = LOOKS.find(l => !own.includes(l.key));
    if (!own.includes('redRunners')) { save.setStat('shoeLooks', [...own, 'redRunners']); return { kind: 'look', key: 'redRunners', label: 'RED RUNNERS' }; }
    if (!save.count('luckyLaces')) { save.give('luckyLaces'); return { kind: 'laces', label: 'LUCKY LACES' }; }
    if (next) { save.setStat('shoeLooks', [...own, next.key]); return { kind: 'look', key: next.key, label: next.name }; }
    if (!goldOwned()) { save.setStat('shoeGold', true); return { kind: 'gold', key: 'gold', label: 'GOLD SNEAKERS' }; }
    save.give('shoeShine'); return { kind: 'shine', label: 'SHOE SHINE KIT' }; }
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the barber ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts) => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + '</div>'; const body = pick.lastChild;
    opts.forEach(o => { if (o.sect) { const h = document.createElement('div'); h.style.cssText = 'font-weight:900;font-size:12px;color:#5a5654;margin-top:10px;border-top:2px solid #201e1d;padding-top:6px'; h.textContent = o.sect; body.appendChild(h); return; }
      const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- input: TAP (measure, box, nails) + DRAG (lace, glue, polish), phone + mouse ----------
  const ptr = { down: false, x: 0, y: 0, px: 0, py: 0, id: null, t: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.px = e.clientX; ptr.y = ptr.py = e.clientY; ptr.t = performance.now(); e.stopPropagation(); press(); drag(0); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; const now = performance.now(), dt = Math.min(0.1, (now - ptr.t) / 1000); ptr.t = now; ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(dt); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; moveTool(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  // ---------- tools that follow the finger ----------
  const toolM = c => new THREE.MeshLambertMaterial({ color: c });
  const TOOLS = { aglet: (() => { const g = new THREE.Group(); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 6), toolM('#f3f2f2')); a.rotation.x = 1.2; g.add(a); return g; })(),
    brush: (() => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.16, 8), toolM(WOOD)); h.position.y = 0.09; g.add(h); const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.015), toolM('#f3e6b0')); g.add(b); return g; })(),
    hammer: (() => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.22, 8), toolM(WOOD)); h.position.y = -0.12; g.add(h); const hd = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.035, 0.035), new THREE.MeshPhongMaterial({ color: 0x5a5654, shininess: 80 })); g.add(hd); return g; })(),
    cloth: (() => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.02), toolM(YEL)); g.add(c); return g; })() };
  TOOLS.hammer.scale.setScalar(0.75); Object.values(TOOLS).forEach(t => { t.visible = false; t.renderOrder = 5; G.add(t); });
  const camPos = V(), rc = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const TOOL_OF = { lace: 'aglet', glue: 'brush', nails: 'hammer', polish: 'cloth' };
  function moveTool() { const kind = J && TOOL_OF[J.sub]; for (const [k, t] of Object.entries(TOOLS)) t.visible = !!kind && k === kind && (ptr.down || kind === 'hammer'); if (!kind) return;
    const t = TOOLS[kind], focus = J.sub === 'lace' ? J.tbl.g : J.oldS.g; ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); camera.getWorldPosition(camPos);
    const d = camPos.distanceTo(focus.getWorldPosition(tmp)) - 0.22; t.position.copy(rc.ray.origin).addScaledVector(rc.ray.direction, d); t.quaternion.copy(camera.quaternion); if (kind === 'hammer') t.rotateZ(J.swing > 0 ? -0.9 * J.swing : 0.5); }
  // ---------- overlays ----------
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotDone = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true });
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true, side: THREE.DoubleSide }), dotGeo = new THREE.SphereGeometry(touch ? 0.017 : 0.012, 8, 6), ringGeo = new THREE.RingGeometry(0.03, 0.038, 24);
  const laceM = new THREE.MeshBasicMaterial({ color: 0xf7f5f0, depthTest: false }), glueM = new THREE.MeshBasicMaterial({ color: 0xf3e6b0, transparent: true, opacity: 0.9 }), nailM = new THREE.MeshPhongMaterial({ color: 0x8a8f96, shininess: 90 });
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const seg = (a, b, r, m) => { const L = a.distanceTo(b), me = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), m); me.renderOrder = 4; me.position.copy(a).add(b).multiplyScalar(0.5); me.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); return own(me); };
  // ================= THE VISIT =================
  const STEPS = ['fit', 'fix'];
  const laces = () => save.count('luckyLaces') > 0;
  const addGold = n => { n = Math.max(0, Math.round(n * (laces() ? 1.25 : 1))); J.gold += n; save.addGold(n); return n; };
  const OLD_DEFAULT = { up: '#6b4a2e', trim: '#3d2a1c', sole: INK, collar: 1, laced: true };
  let oldS = null; const setOld = (o, loose) => { if (oldS) G.remove(oldS.g); oldS = makeShoe({ ...o, laced: true, shiny: true, loose }, 1); oldS.g.position.set(OLDP.x, OLDP.y, OLDP.z); oldS.g.rotation.y = Math.PI; G.add(oldS.g); return oldS; };
  setOld(OLD_DEFAULT, false); if (oldS.upMat) oldS.upMat.shininess = 40;
  const placeLace = k => { const s = LACE_SPOT[k]; lace.position.set(s[0], 0, s[1]); lace.userData.face0 = s[2]; laceCol.c[0] = s[0]; laceCol.c[1] = s[1]; };
  function startVisit() { const n = save.stat('shoeVisits', 0), ci = n % CUST.length, C = CUST[ci]; save.setStat('shoeVisits', n + 1);
    const f = custFox(ci); f.visible = true; f.position.set(SZ.x, 0.02, SZ.z); f.rotation.y = Math.PI / 2; f.userData.sit = false; f.userData.mood = f.userData.base = 'neutral';
    putFeet(f, { up: '#f3f2f2', trim: ['#ec3013', '#2e86b8', '#3f7a52'][ci % 3], sock: true }); kit.animFox && kit.animFox(f, 0, 0); f.updateMatrixWorld(true);
    const leg = f.userData.P.legs[0], heel = leg.localToWorld(V(0, -0.42, 0.05 - 0.205)), toe = leg.localToWorld(V(0, -0.42, 0.05 + 0.205));
    J = { ci, C, f, step: 'fit', sub: 'measure', gold: 0, pause: 0, t: 0, perfect: 0, objs: [], wrong: 0, heelX: heel.x, toeX: toe.x, fz: toe.z, sl: -1.2, barX: toe.x - 0.06 };
    // the SIZER under the left foot (the one nearest the camera)
    const sz = new THREE.Group(); sz.position.set(heel.x - 0.05, 0.08, toe.z); own(sz); const SB = mk(); SB.box(0.62, 0.02, 0.26, '#3d3b3a', 0.3, 0.01, 0); SB.box(0.04, 0.08, 0.26, '#3d3b3a', 0.0, 0.04, 0);
    for (let i = 0; i <= 20; i++) SB.box(0.004, 0.003, i % 2 ? 0.05 : 0.09, '#f3f2f2', 0.1 + i * 0.024, 0.022, -0.085); SB.box(0.026, 0.004, 0.24, '#3f9a5e', toe.x - sz.position.x, 0.023, 0);
    sz.add(new THREE.Mesh(SB.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }))); const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.07, 0.28), new THREE.MeshLambertMaterial({ color: 0xffd23a })); bar.position.y = 0.055; sz.add(bar); J.sizer = sz; J.bar = bar;
    J.sizerC = V(sz.position.x + 0.3, 0.12, sz.position.z);
    // the stock wall for this order: exactly one box of the right size + kind in the playable block
    const play = CELLS.filter(c => isPlay(c.c, c.r)); play.forEach(c => { c.kind = KK[Math.floor(Math.random() * 4)]; c.size = 5 + Math.floor(Math.random() * 9); c.gone = false; });
    const hit = play[Math.floor(Math.random() * play.length)]; hit.kind = C.kind; hit.size = C.size; play.forEach(c => { if (c !== hit && c.kind === C.kind && c.size === C.size) c.size = 5 + ((c.size - 5 + 1 + Math.floor(Math.random() * 7)) % 9); }); J.target = hit; drawStock();
    setOld(C.old, true); oldS.piv.rotation.x = 0.42; oldS.upMat.color.setRGB(0.62, 0.6, 0.58); oldS.upMat.shininess = 1; J.oldS = oldS;
    J.scuffs = [[-0.08, 0.14], [0.0, 0.12], [0.08, 0.16], [-0.12, 0.08], [0.12, 0.1]].map(([z, y]) => { const x = 0.145 * Math.sqrt(Math.max(0.05, 1 - (z / 0.2) ** 2 - ((y - 0.09) / 0.105) ** 2)), m = new THREE.Mesh(SG, new THREE.MeshBasicMaterial({ color: 0x2a201a, transparent: true, opacity: 0.55 }));
      m.scale.set(0.004, 0.012, 0.02); m.position.set(x + 0.002, y, z); oldS.g.add(m); return m; });
    if (lastP) Object.assign(lastP, { x: SPOT.work.x, z: SPOT.work.z, sp: 0 }); placeLace('fit'); busy = 'job'; whistle(); toast('STEP 1 OF 2 · FIT ' + C.name, 1.8); }
  const nextStep = () => { clearDots(); if (J.step === 'fit') { J.step = 'fix'; J.t = 0; whistle(); toast('STEP 2 OF 2 · FIX THE OLD PAIR', 1.8); beginFix(); } else beginReveal(); };
  // ---- dots to drag along (lace + glue) ----
  function makePath(pts, only1) { clearDots(); J.path = { pts: pts.map(p => { const d = new THREE.Mesh(dotGeo, dotM); d.position.copy(p); d.renderOrder = 4; own(d); return { p, d }; }), i: 0, wob: 0, only1 }; }
  function clearDots() { if (J && J.path) { for (const q of J.path.pts) { G.remove(q.d); } J.path = null; } }
  function pathHit(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + (Pa.only1 ? 1 : 3), Pa.pts.length); j++) if (dist(scrW(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].d.material = dotDone; onPathPoint(j); } Pa.i = hit + 1; }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrW(Pa.pts[j].p))); if (md > R * 2.6) Pa.wob += dt; } }
  function onPathPoint(j) { const Pa = J.path; if (J.sub === 'lace') { squeak(); if (j > 0) seg(Pa.pts[j - 1].p, Pa.pts[j].p, 0.006, laceM); }
    else if (J.sub === 'glue') { pop(); const q = Pa.pts[j].p, b = own(new THREE.Mesh(SG, glueM)); b.position.copy(q); b.scale.set(0.012, 0.008, 0.024); oldS.piv.rotation.x = 0.42 * (1 - (j + 1) / Pa.pts.length); } }
  // ---- 1a MEASURE: the slider glides along the sizer, tap when it touches the toe ----
  const sizeAt = x => J.C.size + (x - J.toeX) / 0.0085;
  function measureTick(dt) { J.sl += dt * 1.4; const x = J.toeX + 0.065 * Math.sin(J.sl); J.bar.position.x = x - J.sizer.position.x; J.barX = x; const near = Math.abs(sizeAt(x) - J.C.size) <= 1.5; J.bar.material.color.set(near ? 0x3f9a5e : 0xffd23a); drawMeasure(); }
  const half = v => String(Math.round(v));
  function drawMeasure() { const s = J.sub === 'measure' ? half(Math.max(3, sizeAt(J.barX || J.toeX))) : J.C.size;
    setCard('me' + J.sub + s, head('STEP 1 OF 2', 'FIT') + foot(J.sub === 'measure' ? 'TAP WHEN THE BAR TOUCHES THE TOE' : 'MEASURED') + '<div style="padding:8px 10px 10px">' + who(J.C)
      + '<div style="display:flex;align-items:baseline;gap:8px;padding:2px 0 6px;white-space:nowrap"><span style="font-weight:900;font-size:30px;flex:none">SIZE ' + s + '</span><span style="font-weight:800;font-size:12px;color:#5a5654">' + KINDS[J.C.kind].name + '</span></div>'
      + row('#3f9a5e', 'MEASURE', J.sub === 'measure' ? '\u2014' : '\u2713', J.sub !== 'measure') + row(KINDS[J.C.kind].box, 'FIND THE BOX', '\u2014', false) + row('#f3f2f2', 'LACE UP', '\u2014', false) + '</div>'); }
  function measureTap() { const d = Math.abs(sizeAt(J.barX) - J.C.size), ok = d <= 1.5, g2 = addGold(ok ? 12 : 5); if (ok) J.perfect++; ok ? ding() : pop(); J.bar.material.color.set(ok ? 0x3f9a5e : 0xec3013);
    toast((ok ? 'LACE: "SPOT ON. SIZE ' + J.C.size + '."' : 'LACE: "SQUASHED THE TOES. STILL, IT\'S A ' + J.C.size + '."') + ' +' + g2, 1.8); J.sub = 'measured'; J.pause = 1.3; J.after = beginBox; drawMeasure(); }
  // ---- 1b FIND THE BOX on the stock wall ----
  const STOCK_C = V(cellX((PC[0] + PC[1]) / 2), cellY((PR[0] + PR[1]) / 2), SW.face);
  function beginBox() { J.sub = 'box'; whistle(); drawBox(); }
  function drawBox() { const K = KINDS[J.C.kind]; setCard('bx' + J.sub + J.wrong, head('STEP 1 OF 2', 'FIT') + foot(J.sub === 'box' ? 'TAP THE RIGHT BOX' : 'GOT IT') + '<div style="padding:8px 10px 10px">' + who(J.C)
      + '<div style="display:flex;align-items:center;gap:10px;padding:2px 0 8px"><span style="display:flex;align-items:center;padding:0 10px;height:36px;background:' + K.box + ';color:' + K.fg + ';border:2px solid #201e1d;font-weight:900;font-size:24px">' + J.C.size + '</span><span style="font-weight:900;font-size:14px">' + K.name + '</span></div>'
      + row('#3f9a5e', 'MEASURE', '\u2713', true) + row(K.box, 'FIND THE BOX', J.sub === 'box' ? (J.wrong ? J.wrong + ' WRONG' : '\u2014') : '\u2713', J.sub !== 'box') + row('#f3f2f2', 'LACE UP', '\u2014', false) + '</div>'); }
  function boxTap() { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); const h = rc.intersectObject(stockIM, false)[0]; let C = h && h.instanceId != null ? CELLS[h.instanceId] : null;
    if (!C || !isPlay(C.c, C.r)) { let bd = RAD() * 1.4; for (const c of CELLS) if (isPlay(c.c, c.r) && !c.gone) { const d = dist(scrW(V(cellX(c.c), cellY(c.r), SW.face))); if (d < bd) { bd = d; C = c; } } }
    if (!C || C.gone || !isPlay(C.c, C.r)) return;
    if (C !== J.target) { J.wrong++; tone(196, 0.05, 0.25, 'square'); toast('LACE: "THAT\'S A ' + C.size + ' ' + KINDS[C.kind].name + '. LOOK AGAIN."', 1.6); drawBox(); return; }
    const g2 = addGold(Math.max(4, 14 - 3 * J.wrong)); if (!J.wrong) J.perfect++; ding(); toast((J.wrong ? 'FOUND IT' : 'LACE: "FIRST TRY. FAST HANDS."') + ' +' + g2, 1.5);
    C.gone = true; drawStock(); const K = KINDS[C.kind], b = new THREE.Group(); const bm = new THREE.Mesh(new THREE.BoxGeometry(SW.bw, SW.bh, 0.5), new THREE.MeshLambertMaterial({ color: K.box })); b.add(bm);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(SW.bw + 0.02, 0.04, 0.52), new THREE.MeshLambertMaterial({ color: INK })); lid.position.y = SW.bh / 2 + 0.02; b.add(lid);
    const lt = label(String(C.size), K.box, K.fg, 128, 96, 64), lp = new THREE.Mesh(new THREE.PlaneGeometry(SW.bw * 0.95, SW.bh * 0.9), new THREE.MeshBasicMaterial({ map: lt })); lp.position.z = 0.252; b.add(lp);
    b.position.set(cellX(C.c), cellY(C.r), SW.face - 0.25); own(b); J.fly = { b, lid, from: b.position.clone(), to: V(TABLE.x + 0.22, TABLE.y + 0.15, TABLE.z - 0.28), t: 0 }; J.sub = 'fly'; drawBox(); }
  function flyTick(dt) { const F = J.fly; F.t += dt / 1.1; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.b.position.lerpVectors(F.from, F.to, e); F.b.position.y += Math.sin(k * Math.PI) * 0.8; F.b.scale.setScalar(1 - 0.4 * e); F.b.rotation.y = e * 0.6;
    if (k >= 1) { F.lid.position.set(-0.2, 0.3, -0.25); F.lid.rotation.z = 1.1; pop(); beginLace(); } }
  // ---- 1c LACE UP: trace the eyelets in order ----
  function beginLace() { const K = KINDS[J.C.kind]; J.tbl = makeShoe({ ...K, laced: false }, 1.2); J.tbl.g.position.set(TABLE.x - 0.08, TABLE.y, TABLE.z + 0.05); J.tbl.g.rotation.y = 0; own(J.tbl.g); J.tbl.g.updateMatrixWorld(true);
    J.sub = 'lace'; makePath(EYE.map(([x, z]) => J.tbl.g.localToWorld(V(x, ey(x, z) + 0.008, z))), true); }
  function laceTick() { const Pa = J.path; if (Pa && Pa.i >= Pa.pts.length) { const clean = Pa.wob < 0.4, g2 = addGold(8 + (clean ? 6 : 0)); if (clean) J.perfect++; ding();
      const a = Pa.pts[Pa.pts.length - 2].p, b = Pa.pts[Pa.pts.length - 1].p, m = a.clone().add(b).multiplyScalar(0.5); m.y += 0.01;
      for (const s of [-1, 1]) { const l = own(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.006, 6, 14), laceM)); l.renderOrder = 4; l.position.copy(m).add(V(s * 0.035, 0.015, 0)); l.rotation.set(-0.9, 0, s * 0.4); seg(m, m.clone().add(V(s * 0.03, -0.01, 0.09)), 0.005, laceM); }
      toast((clean ? 'LACE: "NEAT. LIKE A PRO."' : 'LACE: "A LITTLE LOOSE. THEY\'LL HOLD."') + ' +' + g2, 1.5); clearDots(); J.sub = 'laced'; J.pause = 1.2; J.after = beginTryon; }
    drawLace(); }
  function drawLace() { const Pa = J.path, K = KINDS[J.C.kind]; setCard('la' + J.sub + (Pa ? Pa.i : 'x'), head('STEP 1 OF 2', 'FIT') + foot(J.sub === 'lace' ? 'DRAG THROUGH THE EYELETS IN ORDER' : 'LACED') + '<div style="padding:8px 10px 10px">' + who(J.C)
      + row('#3f9a5e', 'MEASURE', '\u2713', true) + row(K.box, 'FIND THE BOX', '\u2713', true) + row('#f3f2f2', 'LACE UP', Pa ? Pa.i + '/' + Pa.pts.length : '\u2713', !Pa) + '</div>'); }
  function beginTryon() { J.sub = 'tryon'; placeLace('reveal'); J.tbl.g.visible = false; const K = KINDS[J.C.kind]; putFeet(J.f, { up: K.up, trim: K.trim, sole: K.sole || WHITE, collar: K.collar }); if (J.sizer) J.sizer.visible = false;
    J.f.userData.mood = J.f.userData.base = 'happy'; J.f.userData.hop = 1; const g2 = addGold(10); tone(523, 0.05, 0.3); tone(784, 0.05, 0.5); toast(J.C.name + ' TRIES THEM ON · SOLD +' + g2, 2); J.pause = 2.2; J.after = () => nextStep(); }
  // ---- 2 FIX: glue the sole → hammer the heel nails → polish ----
  function beginFix() { const f = J.f; f.position.set(BENCH.x + 0.08, BENCH.y - 0.5, (BENCH.z0 + BENCH.z1) / 2); f.rotation.y = Math.PI / 2; f.userData.sit = true; f.userData.mood = f.userData.base = 'neutral'; placeLace('fix');
    J.sub = 'glue'; oldS.g.updateMatrixWorld(true); const pts = []; for (let i = 0; i < 8; i++) { const z = -0.16 + i * 0.047, x = 0.152 * Math.sqrt(Math.max(0, 1 - (z / 0.21) ** 2)) + 0.008; pts.push(oldS.g.localToWorld(V(x, 0.05, z))); } makePath(pts, false); }
  function glueTick() { const Pa = J.path; if (Pa && Pa.i >= Pa.pts.length) { const clean = Pa.wob < 0.4, g2 = addGold(8 + (clean ? 4 : 0)); if (clean) J.perfect++; oldS.piv.rotation.x = 0; thunk(); toast('SOLE ON' + (clean ? ' · CLEAN LINE' : '') + ' +' + g2, 1.3); clearDots(); J.sub = 'glued'; J.pause = 1.0; J.after = beginNails; } drawFix(); }
  function beginNails() { J.sub = 'nails'; J.nk = 0; J.rt = 0; J.nails = [-0.185, -0.15, -0.115, -0.08].map(z => { const x = 0.155 * Math.sqrt(Math.max(0, 1 - (z / 0.21) ** 2)), local = V(x + 0.02, 0.03, z), n = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.04, 8), nailM); n.rotation.z = Math.PI / 2; n.position.copy(local); oldS.g.add(n); J.objs.push(n); return { n, x, z, hit: 0 }; });
    J.ring = own(new THREE.Mesh(ringGeo, ringM)); J.ring.renderOrder = 4; J.swing = 0; ptr.x = innerWidth * 0.6; ptr.y = innerHeight * 0.6; }
  const NAIL_T = 1.25, NAIL_HIT = 0.93;
  function nailTick(dt) { J.swing = Math.max(0, J.swing - dt * 5); const N = J.nails[J.nk]; if (!N) return drawFix(); J.rt += dt; if (J.rt > NAIL_T + 0.25) J.rt = 0;
    const s = Math.max(0.6, 2.4 - 1.8 * (J.rt / NAIL_T)), p = oldS.g.localToWorld(V(N.x + 0.045, 0.03, N.z)); J.ring.position.copy(p); J.ring.scale.setScalar(s); camera.getWorldPosition(camPos); J.ring.lookAt(camPos); J.ring.material.color.set(Math.abs(J.rt - NAIL_HIT) < 0.15 ? 0x3f9a5e : 0xffd23a);
    { const sc = scrW(p); if (!ptr.down) { ptr.x += (sc[0] + 40 - ptr.x) * Math.min(1, dt * 6); ptr.y += (sc[1] - 50 - ptr.y) * Math.min(1, dt * 6); } moveTool(); } drawFix(); }
  function nailTap() { const N = J.nails[J.nk]; if (!N) return; const good = Math.abs(J.rt - NAIL_HIT) < 0.15; N.hit = good ? 2 : 1; N.n.position.x = N.x + 0.003; N.n.scale.y = 0.4; J.swing = 1; thunk(); const g2 = addGold(good ? 4 : 2); toast(good ? 'BANG ON +' + g2 : 'IN +' + g2, 0.7);
    J.nk++; J.rt = 0; if (J.nk >= J.nails.length) { if (J.nails.every(q => q.hit === 2)) J.perfect++; J.ring.visible = false; ding(); toast(J.nails.every(q => q.hit === 2) ? 'LACE: "FOUR FOR FOUR. LISTEN TO THAT."' : 'LACE: "HEEL\'S SOLID."', 1.4); J.sub = 'nailed'; J.pause = 1.0; J.after = beginPolish; } }
  function beginPolish() { J.sub = 'polish'; J.shine = 0; J.pt = 0; }
  function polishTick(dt) { J.pt += dt; const k = Math.min(1, J.shine); oldS.upMat.color.setRGB(0.62 + 0.4 * k, 0.6 + 0.42 * k, 0.58 + 0.44 * k); oldS.upMat.shininess = 1 + 44 * k; oldS.upMat.specular.setScalar(0.13 + 0.25 * k); J.scuffs.forEach(m => { m.material.opacity = 0.55 * (1 - k); });
    if (J.shine >= 1 && J.sub === 'polish') { const g2 = addGold(10 + Math.max(0, 6 - Math.floor(J.pt / 3))); ding(); toast('LACE: "LIKE NEW. BETTER THAN NEW." +' + g2, 1.6); J.sub = 'polished'; J.pause = 1.2; J.after = () => nextStep(); TOOLS.cloth.visible = false; } drawFix(); }
  function rub() { const c = scrW(oldS.g.localToWorld(V(0, 0.1, 0))), e = scrW(oldS.g.localToWorld(V(0, 0.1, 0.2))), R = Math.max(40, Math.hypot(c[0] - e[0], c[1] - e[1]) * 1.4);
    if (Math.hypot(ptr.x - c[0], ptr.y - c[1]) > R) return; const d = Math.hypot(ptr.x - ptr.px, ptr.y - ptr.py); if (d < 1) return; J.shine += d / (3.0 * Math.min(innerWidth, innerHeight)); if (Math.random() < 0.25) squeak(); }
  function drawFix() { const sub = J.sub, Pa = J.path, nk = J.nk || 0, sh = Math.round(Math.min(1, J.shine || 0) * 100), gl = sub === 'glue', nl = sub === 'nails', po = sub === 'polish';
    const next = gl ? 'DRAG THE GLUE ALONG THE SOLE' : nl ? 'TAP WHEN THE RING TURNS GREEN' : po ? 'RUB THE SHOE BACK AND FORTH' : 'NICE';
    setCard('fx' + sub + (Pa ? Pa.i : '') + nk + sh + (nl ? (Math.abs(J.rt - NAIL_HIT) < 0.15 ? 'g' : 'y') : ''), head('STEP 2 OF 2', 'FIX') + foot(next) + '<div style="padding:8px 10px 10px">' + who(J.C)
      + row('#f3e6b0', 'GLUE THE SOLE', gl ? (Pa ? Pa.i : 0) + '/8' : '\u2713', !gl) + row('#8a8f96', 'NAILS', (nl ? nk : gl ? 0 : 4) + '/4', !gl && !nl) + row('#ffd23a', 'POLISH', po || sub === 'polished' ? sh + '%' : '\u2014', sub === 'polished') + (po ? meter(Math.min(1, J.shine), '#ffd23a') : '') + '</div>'); }
  // ---- the reveal: they get their old pair back too, light up, pay ----
  function beginReveal() { J.step = 'reveal'; J.sub = 'reveal'; J.t = 0; const f = J.f, U = f.userData; f.position.set(SZ.x, 0.02, SZ.z); f.rotation.y = Math.PI / 2; U.sit = false; U.mood = U.base = 'happy'; U.hop = 1; placeLace('reveal'); oldS.g.visible = false;
    const g2 = addGold(12); tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7); const K = KINDS[J.C.kind];
    setCard('rv', head('ALL DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(J.C) + row(K.box, 'NEW ' + K.name + ' · SIZE ' + J.C.size, '\u2713', true) + row('#ffd23a', 'OLD PAIR · FIXED + SHINED', '\u2713', true)
      + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['Two pairs! I walked in with none that worked.', 'My feet have never been this happy.', 'I could run to the Arena. I will not. But I could.'][J.ci % 3] + '"</div></div>');
    toast(J.C.name + ' TIPS · +' + g2 + ' GOLD', 2.2); }
  function endVisit() { const C = J.C, gold = J.gold, pf = J.perfect, perfect = J.perfect >= 5, gift = giveGift(); if (perfect && gift.kind !== 'shine') save.give('shoeShine'); save.best('shoeBest', gold); stop();
    toast('VISIT DONE · +' + gold + ' GOLD · ' + gift.label + (perfect && gift.kind !== 'shine' ? ' + SHOE SHINE KIT' : ''), 3.5);
    const TC = x => x.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()), nm = TC(C.name), op = nm + ' ' + ['left with a bounce.', 'is walking on air.', 'has happy feet.'][save.stat('shoeClears', 1) % 3] + ' ';
    K.finish('fit', pf >= 5 ? 3 : pf >= 3 ? 2 : 1, gold, !K.stars('fit'));
    sayTo(endT, [ln(gift.kind === 'gold' ? 'You earned the Golden Pair. Faster feet, higher jumps. The shoe mirror puts them on.'
      : op + (gift.kind === 'look' ? TC(gift.label) + ' in your size. The shoe mirror puts them on.' : gift.kind === 'laces' ? 'Take my Lucky Laces. Customers tip a quarter more.' : 'A Shoe Shine Kit for you. Keep them shiny.'))]); }
  function jobTick(dt) { J.t += dt; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } return; }
    const s = J.sub; if (s === 'measure') measureTick(dt); else if (s === 'box') drawBox(); else if (s === 'fly') flyTick(dt); else if (s === 'lace') laceTick(); else if (s === 'glue') glueTick(); else if (s === 'nails') nailTick(dt); else if (s === 'polish') polishTick(dt); else if (s === 'reveal' && J.t > 3.2) endVisit(); }
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'measure') measureTap(); else if (s === 'box') boxTap(); else if (s === 'nails') nailTap(); }
  function drag(dt) { if (!J || J.pause > 0) return; moveTool(); const s = J.sub; if (s === 'lace' || s === 'glue') pathHit(dt); else if (s === 'polish' && ptr.down) rub(); }
  function stop() { busy = null; HINT.style.display = 'none'; if (J) { clearDots(); J.objs.forEach(o => o.parent && o.parent.remove(o)); (J.scuffs || []).forEach(m => m.parent && m.parent.remove(m)); J.f.userData.sit = false; J.f.visible = false; J.f.userData.mood = J.f.userData.base = 'neutral'; }
    J = null; ptr.down = false; Object.values(TOOLS).forEach(t => { t.visible = false; }); hideCard(); hidePick(); setOld(OLD_DEFAULT, false); if (oldS.upMat) oldS.upMat.shininess = 40; CELLS.forEach(c => { c.gone = false; }); drawStock(); placeLace('idle'); }
  // ================= SHOE MIRROR (change the shoes you wear) =================
  let mirP = null; function startMirror(P) { busy = 'mirror'; mirP = P; Object.assign(P, { x: MIR.x, z: MIR.z, yaw: Math.PI / 2, sp: 0 }); mirrorPanel(); }
  function mirrorPanel() { const w = wear(), own = arr('shoeLooks'), set = k => { save.setStat('shoeWear', k); tone(880, 0.04, 0.2, 'triangle'); mirrorPanel(); };
    showPick('SHOE MIRROR', 'LACE', 'YOUR SHOES, ANYWHERE IN MERU', [{ label: 'MY OWN BOOTS' + (!w ? ' · ON' : ''), on: !w, go: () => set(null) }, ...LOOKS.filter(l => own.includes(l.key)).map(l => ({ label: l.name + (w === l.key ? ' · ON' : ''), on: w === l.key, go: () => set(l.key) })),
      ...(goldOwned() ? [{ label: 'GOLD SNEAKERS · FASTER + HIGHER JUMP' + (w === 'gold' ? ' · ON' : ''), on: w === 'gold', go: () => set('gold') }] : []), { label: 'DONE', primary: true, go: () => closeMirror() }]); }
  function closeMirror() { hidePick(); busy = null; mirP = null; toast(wear() === 'gold' ? 'GOLD SNEAKERS ON · FASTER + HIGHER' : 'FRESH FEET', 1.6); }
  // ---------- the player's shoes (re-attached after any outfit swap) + gold sparkle ----------
  let lastP = null; const spark = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true })); m.visible = false; scene.add(m); spark.push({ m, t: 0 }); } let sparkI = 0, sparkT = 0;
  function applyWear(fox) { if (!fox || !fox.userData || !fox.userData.P) return; const o = lookOf(wear()), key = o ? JSON.stringify(o) : '', U = fox.userData;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if ((U.feetKey || '') === key && (U.feet || []).every(onFox)) return; putFeet(fox, o); }
  const speedK = () => (wear() === 'gold' && goldOwned() ? 1.15 : 1), jumpK = () => (wear() === 'gold' && goldOwned() ? 1.15 : 1);
  // ---------- camera: a fixed shot per station (portrait: below the card; wide: right of it) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false }, hp = V();
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  const TABLE_C = V(TABLE.x - 0.08, TABLE.y + 0.18, TABLE.z + 0.08), OLD_C = V(OLDP.x, OLDP.y + 0.1, OLDP.z);
  function shot(fox) { if (busy === 'mirror' && fox) { fox.getWorldPosition(hp); return [hp.clone().setY(0.45), 1.3, 1.1, 0.42, 1.3, Math.PI / 2 + 0.9, 1.4]; } if (busy !== 'job' || !J) return null; const s = J.sub;
    if (s === 'measure' || s === 'measured') return [J.sizerC.clone(), 0.75, 0.5, 0.78, 0.8, 0, 1.5];
    if (s === 'box') return [STOCK_C.clone(), 4.5, 3.4, 0.06, 3, 0, 10];
    if (s === 'fly' || s === 'lace' || s === 'laced') return [TABLE_C.clone(), 0.7, 0.62, 1.0, 0.85, 0, 1.5];
    if (s === 'tryon') { J.f.getWorldPosition(hp); return [hp.clone().setY(0.5), 1.6, 1.3, 0.5, 2.0, Math.PI / 2 + 0.5, 2.6]; }
    if (s === 'reveal') { J.f.getWorldPosition(hp); return [hp.clone().setY(1.2), 1.6, 2.5, 0.12, 3.2, Math.PI / 2 + 0.55, 4.2]; }
    return [OLD_C.clone(), 0.75, 0.55, 0.3, 0.85, -Math.PI / 2, 1.5]; }
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
    if (s === 'measure') return [J.sizerC.clone(), 'TAP WHEN THE BAR IS GREEN'];
    if (s === 'box') return [V(cellX(J.target.c), cellY(J.target.r), SW.face), 'TAP THIS BOX'];
    if ((s === 'lace' || s === 'glue') && J.path) { const q = J.path.pts[J.path.i]; return q ? [q.p.clone(), s === 'lace' ? 'DRAG THROUGH THE EYELETS' : 'DRAG ALONG THE SOLE'] : null; }
    if (s === 'nails' && J.ring && J.ring.visible) return [J.ring.position.clone(), 'TAP WHEN THE RING IS GREEN'];
    if (s === 'polish') return [oldS.g.localToWorld(V(0, 0.1, 0)), 'RUB BACK AND FORTH'];
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 + 0.3 && P.y < 2.5;
  const SPOT = { work: { x: 36.2, z: -157.6, r: 1.05 }, mirror: { x: MIR.x, z: MIR.z, r: 0.9 } };
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  const hasLooks = () => arr('shoeLooks').length || goldOwned();
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.work)) return 'NEXT CUSTOMER · FIT + FIX';
    if (at(P, SPOT.mirror) && hasLooks()) return 'SHOE MIRROR · CHANGE YOUR SHOES'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, laceT)) return 'TALK · LACE'; return null; }
  // s66: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Lace! Fox Feet. Stand on the yellow ring: measure, find the box, lace up, then fix their old pair.', 'Back! Feet first. The ring is free.', 'Quick hands today? Customers are lining up.', 'Whistle is ready. Are you?'];
  const TIPS = ['Laces are a promise. Tie them like you mean it.', 'Size first. Style second. Blisters never.', "Noble's chair has never needed shoes. I keep offering.", 'Hope runs the Arena in sandals. I stopped arguing. She is very fast.', "Hear that squeak? That's a happy sole."];
  const laceMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startVisit(); } }];
    if (hasLooks()) ch.push({ text: 'THE SHOE MIRROR', pick: () => { if (!busy && lastP) startMirror(lastP); } });
    ch.push({ text: "A COACH'S TIP, PLEASE", pick: () => sayTo(laceT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(laceT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P)) return false;
    if (at(P, SPOT.work)) { startVisit(); return true; }
    if (at(P, SPOT.mirror) && hasLooks()) { startMirror(P); return true; }
    if (K.atHiring(P)) { ding(); startVisit(); return true; }
    if (!near(P, laceT)) return false; whistle(); laceMenu(!talked++); return true; }
  function quit() { if (busy === 'mirror') { closeMirror(); return; } stop(); toast('CUSTOMER SENT HOME · GOLD KEPT', 2); }
  // ---------- per frame ----------
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt; applyWear(fox); lastP = P;
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'job' && fox) fox.visible = false;
    if (fox && wear() === 'gold' && goldOwned() && P.sp > 3 && fox.visible) { sparkT -= dt; if (sparkT <= 0) { sparkT = 0.09; const s = spark[sparkI++ % spark.length]; s.t = 0.6; s.m.visible = true; s.m.position.set(P.x + (Math.random() - 0.5) * 0.4, (P.y || 0) + 0.1, P.z + (Math.random() - 0.5) * 0.4); } }
    for (const s of spark) if (s.t > 0) { s.t -= dt; s.m.position.y += dt * 0.6; s.m.rotation.y += dt * 6; s.m.material.opacity = Math.max(0, s.t / 0.6); if (s.t <= 0) s.m.visible = false; }
    if (!G.visible) { HINT.style.display = 'none'; return; } goldOn.g.visible = !goldOwned(); goldOn.g.rotation.y = t * 0.6;
    if (busy === 'job' && J) jobTick(dt);
    if (J && J.path) { const n = J.path.pts[J.path.i]; if (n) n.d.scale.setScalar(1.3 + Math.sin(t * 9) * 0.35); }
    workRing.visible = !busy; workRing.scale.setScalar(1 + Math.sin(t * 3) * 0.04); hintTick(t);
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: busy === 'job' });
    if (busy === 'job' && J) { const lk = Math.atan2(J.f.position.x - lace.position.x, J.f.position.z - lace.position.z); lace.rotation.y += Math.atan2(Math.sin(lk - lace.rotation.y), Math.cos(lk - lace.rotation.y)) * Math.min(1, dt * 3); }
    for (const f of Object.values(custCache)) if (f.visible) { kit.animFox && kit.animFox(f, dt, 0); if (f.userData.sit) sitPose(f); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startVisit, startMirror: P => startMirror(P || lastP), lace, camera, camT, save, speedK, jumpK, putFeet,
    // test hooks: drive taps / drags from a script (screen coords) and jump between parts
    tap(x, y) { ptr.down = true; ptr.x = ptr.px = x; ptr.y = ptr.py = y; press(); drag(0); ptr.down = false; }, dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.px = ptr.x; ptr.py = ptr.y; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; moveTool(); },
    targets() { if (!J) return []; if (J.path) return J.path.pts.map(q => scrW(q.p)); if (J.sub === 'box') return [scrW(V(cellX(J.target.c), cellY(J.target.r), SW.face))]; if (J.sub === 'polish') return [scrW(oldS.g.localToWorld(V(0, 0.1, 0)))]; return []; },
    skipTo(s) { if (!J) startVisit(); J.pause = 0; J.after = null; clearDots(); if (s === 'box') { J.sub = 'measured'; beginBox(); } else if (s === 'lace') { J.target.gone = true; drawStock(); beginLace(); } else if (s === 'tryon') { if (!J.tbl) beginLace(); clearDots(); beginTryon(); J.pause = 0.01; }
      else if (s === 'fix') { if (J.sizer) J.sizer.visible = false; J.step = 'fit'; nextStep(); } else if (s === 'nails') { if (J.step !== 'fix') { J.step = 'fix'; beginFix(); clearDots(); } oldS.piv.rotation.x = 0; beginNails(); } else if (s === 'polish') { if (J.step !== 'fix') { J.step = 'fix'; beginFix(); clearDots(); } oldS.piv.rotation.x = 0; beginPolish(); } else if (s === 'reveal') beginReveal(); },
    K, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__shoes = API; return API;
}
