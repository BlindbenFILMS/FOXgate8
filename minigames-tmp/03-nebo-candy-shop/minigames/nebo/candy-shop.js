// 8 GATES — NEBO · THE CANDY SHOP [neboCandyShop]. The walk-in interior + the candy art shared with the shift game.
// From the 2D brief: "warm sugar, copper pots, NOW HIRING card; CANDY SHIFT minigame. Angelica, Candy Maker. Door → Nebo Town Square."
// Room palette from the 2D lobby post: wall #46203a, floor #f3dce8 → #d7aac6, trim #ff9ec4, gold #c9a132, copper #b87333.
//
// MERGE INTO ANY BUILDING: buildCandyShop(ctx) builds the whole room at ctx.origin (12 m wide × 10 m deep × 4.2 m high, door on the
// +z wall at x = +3.6). It returns K: station points, customer spots, the walk colliders (AABBs in room space), the door, Angelica's
// spot, and K.cut (back wall + ceiling + beams) for a cut-away camera. Put it inside a 12 × 10 footprint (or far away + quick fade).
// ctx = { THREE, M, toon, canvasTex, scene, grad, addOutline, origin: { x, z }, rotY }
export const ROOM = { key: 'neboCandyShop', label: 'The Candy Shop', world: 'Nebo', W: 12, D: 10, H: 4.2 };
export const PAL = { plum: '#46203a', plumL: '#7a3f5c', pink: '#ff9ec4', pinkL: '#f3dce8', pinkM: '#d7aac6', gold: '#c9a132', copper: '#b87333', copperD: '#8a4f1e', cream: '#fbf6ee', moss: '#6f9a4a', wood: '#a8763a', woodD: '#6b4a2c', marble: '#f4f1ec', ink: '#201e1d' };
export const FLAVORS = {
  strawberry: { name: 'STRAWBERRY', col: '#e8a0b0', deep: '#c45a78' },
  lemon: { name: 'LEMON', col: '#f0d060', deep: '#c9a132' },
  blueberry: { name: 'BLUEBERRY', col: '#8fb0d8', deep: '#4f6fa8' },
  apple: { name: 'APPLE', col: '#9cc46a', deep: '#5f8a2e' },
  honey: { name: 'HONEY', col: '#e6b45a', deep: '#b07a1e' } };
export const COATS = { cocoa: { name: 'CHOCOLATE', col: '#5c3a22', dust: '#7a4a2a' }, mint: { name: 'MINT', col: '#8fd6a8', dust: '#bfeccd' } };

// ---------- small helpers ----------
// The 2D game's gummy bear outline (same numbers), as a THREE.Shape lying in x/y; extrude it for moulds, jelly and sweets.
export function bearShape(T3, k = 1) {
  const S = (x, y) => [x * k, -y * k];   // flip y so the ears point to +y
  const sh = new T3.Shape(); let cur = S(-4.2, -6.6); sh.moveTo(...cur);
  const Q = (c, p) => { const a = S(...c), b = S(...p); sh.quadraticCurveTo(a[0], a[1], b[0], b[1]); cur = b; };
  const ear = p => { const b = S(...p), r = 2.9 * k, mx = (cur[0] + b[0]) / 2, my = (cur[1] + b[1]) / 2, dx = b[0] - cur[0], dy = b[1] - cur[1], d = Math.hypot(dx, dy), h = Math.sqrt(Math.max(0, r * r - d * d / 4));
    // the ear is the LARGE arc of a circle whose centre sits outward (away from the body at the origin)
    const c1 = [mx - dy / d * h, my + dx / d * h], c2 = [mx + dy / d * h, my - dx / d * h];
    const [ox, oy] = Math.hypot(...c1) > Math.hypot(...c2) ? c1 : c2;
    const a0 = Math.atan2(cur[1] - oy, cur[0] - ox), a1 = Math.atan2(b[1] - oy, b[0] - ox), cw = ((a0 - a1) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) > Math.PI;
    sh.absarc(ox, oy, r, a0, a1, cw); cur = b; };
  ear([-1.6, -8.4]); Q([0, -8.7], [1.6, -8.4]); ear([4.2, -6.6]);
  Q([5.6, -5.2], [5.1, -3.4]); Q([4.6, -1.9], [3.1, -1.4]); Q([6.4, -1.1], [7.1, 0.9]); Q([7.6, 2.7], [5.9, 3.4]); Q([6.3, 5.9], [5.4, 7.4]); Q([4.6, 8.7], [2.7, 8.4]);
  Q([1.5, 8.2], [1.2, 6.9]); Q([0, 7.2], [-1.2, 6.9]); Q([-1.5, 8.2], [-2.7, 8.4]); Q([-4.6, 8.7], [-5.4, 7.4]); Q([-6.3, 5.9], [-5.9, 3.4]); Q([-7.6, 2.7], [-7.1, 0.9]);
  Q([-6.4, -1.1], [-3.1, -1.4]); Q([-4.6, -1.9], [-5.1, -3.4]); Q([-5.6, -5.2], [-4.2, -6.6]);
  return sh; }
export function bearGeo(T3, k = 0.0085, depth = 0.03) { const g = new T3.ExtrudeGeometry(bearShape(T3, k), { depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: k * 0.9, bevelSegments: 2, curveSegments: 6 }); g.rotateX(-Math.PI / 2); g.computeVertexNormals(); return g; }
// candy-cane stripes for rock candy ropes and coins
export function stripeTex(CT, a = '#fbf6ee', b = '#e04a5a', n = 6) { const t = CT(128, 64, c => { c.fillStyle = a; c.fillRect(0, 0, 128, 64); c.fillStyle = b; for (let i = -2; i < n + 2; i++) { c.beginPath(); const x = i * 128 / n; c.moveTo(x, 0); c.lineTo(x + 10, 0); c.lineTo(x + 10 + 30, 64); c.lineTo(x + 30, 64); c.closePath(); c.fill(); } }); return t; }
// one finished sweet as a small group (box contents, display case, demo)
export function sweetMesh(T3, toon, addOutline, kind, o = {}) {
  const g = new T3.Group(), add = (geo, mat, x = 0, y = 0, z = 0, ol = 0.004) => { const m = new T3.Mesh(geo, mat.isMaterial ? mat : toon(mat)); m.position.set(x, y, z); if (addOutline && ol) addOutline(m, ol); g.add(m); return m; };
  if (kind === 'taffy') { const col = o.col || '#e8a0b0'; add(new T3.CapsuleGeometry(0.022, 0.05, 3, 8), col, 0, 0.022, 0).rotation.z = Math.PI / 2; const w = toon('#fbf6ee'); for (const s of [-1, 1]) { const tw = add(new T3.ConeGeometry(0.026, 0.04, 6), w, s * 0.058, 0.022, 0, 0.003); tw.rotation.z = s * Math.PI / 2; } }
  else if (kind === 'gummy') { const bg = new T3.ExtrudeGeometry(bearShape(T3, 0.0042), { depth: 0.018, bevelEnabled: false, curveSegments: 4 }); bg.rotateX(-Math.PI / 2); add(bg, o.col || '#e04a5a', 0, 0.002, 0, 0.003); if (o.dust) { const dg = new T3.ExtrudeGeometry(bearShape(T3, 0.0042), { depth: 0.002, bevelEnabled: false, curveSegments: 4 }); dg.rotateX(-Math.PI / 2); add(dg, toon('#fbf6ee', { transparent: true, opacity: 0.45 }), 0, 0.021, 0, 0); } }
  else if (kind === 'rock') { const tex = o.tex; const mats = [toon('#e8e0d4'), new T3.MeshToonMaterial({ map: tex, gradientMap: o.grad }), toon('#fbf6ee')]; const m = new T3.Mesh(new T3.CylinderGeometry(0.03, 0.03, 0.016, 18), mats); m.position.y = 0.008; if (addOutline) addOutline(m, 0.003, 0.03); g.add(m); }
  else if (kind === 'truffle') { add(new T3.CylinderGeometry(0.036, 0.028, 0.026, 12, 1, true), toon('#c9a132', { side: T3.DoubleSide }), 0, 0.013, 0, 0); add(new T3.SphereGeometry(0.03, 14, 10), o.col || '#5c3a22', 0, 0.038, 0, 0.004); }
  return g; }

// ---------- the room ----------
export function buildCandyShop(ctx) {
  const { THREE: T3, M, toon, canvasTex: CT, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); root.rotation.y = ctx.rotY || 0; scene.add(root);
  const { W, D, H } = ROOM, P = PAL, cut = [], frontG = new T3.Group(), ceilG = new T3.Group(), K = { root, W, D, H, cut, frontG, ceilG }; root.add(frontG, ceilG);
  const TM = (map, extra) => new T3.MeshToonMaterial({ map, gradientMap: ctx.grad, ...extra });
  const plum = toon(P.plum), plumL = toon(P.plumL), pink = toon(P.pink), gold = toon(P.gold), copper = toon(P.copper), copperD = toon(P.copperD), cream = toon(P.cream), wood = toon(P.wood), woodD = toon(P.woodD), marble = toon(P.marble), ink = toon(P.ink), moss = toon(P.moss);
  const noShadow = m => { m.traverse(o => o.castShadow = false); return m; };
  // floor: pink checker with gold pips
  const floorT = CT(256, 256, c => { c.fillStyle = P.pinkL; c.fillRect(0, 0, 256, 256); c.fillStyle = P.pinkM; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2) c.fillRect(x * 64, y * 64, 64, 64); c.fillStyle = P.gold; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { c.save(); c.translate(x * 64, y * 64); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore(); } });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2, D / 2);
  { const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), TM(floorT)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl); }
  // kitchen floor: warm boards behind the counter
  { const bt = CT(128, 256, c => { c.fillStyle = '#c99a62'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#b07f4a'; for (let i = 0; i < 4; i++) c.fillRect(i * 32, 0, 2, 256); for (let i = 0; i < 9; i++) c.fillRect((i % 4) * 32, i * 29, 32, 2); }); bt.wrapS = bt.wrapT = T3.RepeatWrapping; bt.repeat.set(W / 2, 2.6);
    const kf = new T3.Mesh(new T3.PlaneGeometry(W, 5.2), TM(bt)); kf.rotation.x = -Math.PI / 2; kf.position.set(0, 0.002, -2.4); kf.receiveShadow = true; root.add(kf); }
  // walls: plum wainscot, pink + cream stripe paper, gold rail
  const wallT = CT(256, 512, c => { c.fillStyle = '#f6dbe6'; c.fillRect(0, 0, 256, 512); c.fillStyle = '#f0c3d6'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 14, 330); c.fillStyle = '#ffffff'; for (let x = 7; x < 256; x += 32) for (let y = 20; y < 320; y += 44) { c.beginPath(); c.arc(x + 16, y + (x % 64 ? 22 : 0), 3, 0, 7); c.fill(); }
    c.fillStyle = P.plum; c.fillRect(0, 340, 256, 172); c.fillStyle = P.plumL; for (let x = 10; x < 256; x += 64) c.fillRect(x, 362, 44, 128); c.fillStyle = P.gold; c.fillRect(0, 330, 256, 10); c.fillStyle = P.pink; c.fillRect(0, 340, 256, 4); c.fillStyle = P.plumL; c.fillRect(0, 0, 256, 10); });
  wallT.wrapS = T3.RepeatWrapping;
  const wallMat = (len) => { const t = wallT.clone(); t.needsUpdate = true; t.repeat.set(len / 2.2, 1); return TM(t); };
  const walls = [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2], [0, D / 2, W, Math.PI]];
  K.walls = walls.map(([x, z, w, ry], i) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallMat(w)); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); if (i === 0) cut.push(m); return m; });
  K.frontWall = K.walls[3];
  // ceiling: timber boards + beams + hanging lanterns (Nebo lodge look)
  { const ct = CT(256, 256, c => { c.fillStyle = '#8a5a32'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#7a4c28'; for (let i = 0; i < 8; i++) c.fillRect(0, i * 32, 256, 3); });
    ct.wrapS = ct.wrapT = T3.RepeatWrapping; ct.repeat.set(3, 3); const ce = new T3.Mesh(new T3.PlaneGeometry(W, D), TM(ct)); ce.rotation.x = Math.PI / 2; ce.position.y = H; ceilG.add(ce); cut.push(ce);
    for (const x of [-4, 0, 4]) cut.push(noShadow(M(new T3.BoxGeometry(0.22, 0.26, D), woodD, x, H - 0.13, 0, ceilG, 0.01))); }
  K.lamps = [];
  for (const [x, z] of [[-3.6, 2.6], [0, 3.2], [3.4, 2.6], [-2.4, -2.3], [2.4, -2.3]]) { const g = new T3.Group(); g.position.set(x, H - 0.9, z); ceilG.add(g); M(new T3.CylinderGeometry(0.008, 0.008, 0.9, 4), ink, 0, 0.45, 0, g, 0); M(new T3.CylinderGeometry(0.1, 0.16, 0.08, 8), copperD, 0, 0.02, 0, g, 0.008);
    const glass = new T3.Mesh(new T3.CylinderGeometry(0.13, 0.13, 0.3, 8), new T3.MeshBasicMaterial({ color: 0xffe2a8 })); glass.position.y = -0.15; g.add(glass); M(new T3.CylinderGeometry(0.16, 0.12, 0.06, 8), copperD, 0, -0.33, 0, g, 0.008); K.lamps.push(g); cut.push(g); }

  // ---------- back wall: jar shelf, sign, menu ----------
  const jarCols = [FLAVORS.strawberry.col, FLAVORS.lemon.col, FLAVORS.blueberry.col, FLAVORS.apple.col, '#e04a5a', P.gold];
  const glassM = new T3.MeshToonMaterial({ color: '#f6f2ea', gradientMap: ctx.grad, transparent: true, opacity: 0.32, depthWrite: false });
  function jar(parent, x, y, z, col, s = 1) { const g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
    const body = new T3.Mesh(new T3.CylinderGeometry(0.17, 0.16, 0.36, 18, 1, true), glassM); body.position.y = 0.18; body.renderOrder = 2; g.add(body);
    M(new T3.CylinderGeometry(0.15, 0.15, 0.22, 16), toon(col), 0, 0.12, 0, g, s >= 1 ? 0.006 : 0, 0.15); if (s >= 1) for (let i = 0; i < 4; i++) M(new T3.SphereGeometry(0.04, 8, 6), toon(col), Math.cos(i * 1.6) * 0.07, 0.25, Math.sin(i * 1.6) * 0.07, g, 0, 0.04);
    M(new T3.CylinderGeometry(0.12, 0.12, 0.06, 16), gold, 0, 0.39, 0, g, s >= 1 ? 0.006 : 0, 0.12); if (s >= 1) M(new T3.SphereGeometry(0.035, 8, 6), gold, 0, 0.44, 0, g, 0, 0.035); return g; }
  cut.push(M(new T3.BoxGeometry(9.0, 0.06, 0.4), woodD, 0, 1.92, -D / 2 + 0.22, root, 0.01)); for (const x of [-4.4, 0, 4.4]) cut.push(M(new T3.BoxGeometry(0.06, 0.18, 0.34), woodD, x, 1.82, -D / 2 + 0.2, root, 0));
  jarCols.forEach((c, i) => cut.push(jar(root, -3.6 + i * 1.44, 1.95, -D / 2 + 0.24, c)));
  cut.push(M(new T3.BoxGeometry(7.0, 0.06, 0.36), woodD, 0, 2.62, -D / 2 + 0.2, root, 0.01));
  for (let i = 0; i < 9; i++) cut.push(jar(root, -3.2 + i * 0.8, 2.65, -D / 2 + 0.2, jarCols[(i + 2) % 6], 0.62));
  const signT = CT(1024, 192, c => { c.fillStyle = P.plum; c.fillRect(0, 0, 1024, 192); c.strokeStyle = P.gold; c.lineWidth = 10; c.strokeRect(10, 10, 1004, 172); c.fillStyle = P.gold; c.beginPath(); c.arc(96, 96, 64, 0, 7); c.fill(); c.fillStyle = P.plum; c.beginPath(); c.arc(96, 96, 52, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = '900 76px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 96, 100);
    c.textAlign = 'left'; c.font = '900 92px Archivo, "Arial Black", Arial'; c.fillStyle = P.pink; c.fillText('THE CANDY SHOP', 190, 104); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(5.0, 0.94), new T3.MeshBasicMaterial({ map: signT })); s.position.set(0, 3.55, -D / 2 + 0.03); root.add(s); cut.push(s); }
  // ---------- counter (service) with a glass display case ----------
  K.top = 0.98; const T = K.top;
  const CX0 = -6, CX1 = 2.8, CZ = 0.6, CD = 0.7; K.counter = { x0: CX0, x1: CX1, z: CZ, d: CD };
  M(new T3.BoxGeometry(CX1 - CX0, T - 0.04, CD), plum, (CX0 + CX1) / 2, (T - 0.04) / 2, CZ, root, 0.03);
  M(new T3.BoxGeometry(CX1 - CX0 + 0.06, 0.06, CD + 0.08), marble, (CX0 + CX1) / 2, T - 0.02, CZ, root, 0.015);
  M(new T3.BoxGeometry(CX1 - CX0 + 0.07, 0.03, 0.03), pink, (CX0 + CX1) / 2, T - 0.06, CZ + CD / 2 + 0.04, root, 0);
  for (let x = CX0 + 0.4; x < CX1; x += 0.8) M(new T3.BoxGeometry(0.5, 0.6, 0.02), plumL, x, 0.42, CZ + CD / 2 + 0.005, root, 0);
  // display case on the counter, customer side
  { const cx = -1.8, cw = 3.4; const caseM = new T3.MeshToonMaterial({ color: '#e8f4f6', gradientMap: ctx.grad, transparent: true, opacity: 0.22, depthWrite: false });
    const box = new T3.Mesh(new T3.BoxGeometry(cw, 0.42, 0.42), caseM); box.position.set(cx, T + 0.21, CZ + 0.08); box.renderOrder = 3; root.add(box); for (const dz of [-0.22, 0.22]) M(new T3.BoxGeometry(cw + 0.04, 0.025, 0.025), gold, cx, T + 0.43, CZ + 0.08 + dz, root, 0); for (const dx of [-cw / 2, -cw / 4, 0, cw / 4, cw / 2]) M(new T3.BoxGeometry(0.025, 0.025, 0.46), gold, cx + dx, T + 0.43, CZ + 0.08, root, 0); M(new T3.BoxGeometry(cw, 0.02, 0.42), cream, cx, T + 0.01, CZ + 0.08, root, 0);
    const kinds = ['taffy', 'gummy', 'truffle', 'rock'], rockT = stripeTex(CT);
    for (let i = 0; i < 4; i++) { const tx = cx - cw / 2 + 0.45 + i * 0.83; M(new T3.BoxGeometry(0.6, 0.02, 0.3), toon(['#fbe3ec', '#fff3c4', '#e8dcd2', '#e6f2ff'][i]), tx, T + 0.03, CZ + 0.08, root, 0);
      for (let j = 0; j < 6; j++) { const s = sweetMesh(T3, toon, null, kinds[i], { col: [FLAVORS.strawberry.col, FLAVORS.apple.col, j % 2 ? COATS.mint.col : COATS.cocoa.col, ''][i] || ['#e04a5a', '#f0d060'][j % 2], tex: rockT, grad: ctx.grad }); s.position.set(tx - 0.2 + (j % 3) * 0.2, T + 0.04, CZ + 0.02 + Math.floor(j / 3) * 0.13); s.scale.setScalar(1.4); s.rotation.y = j; root.add(s); } } }
  // register (left end) + tip jar
  K.register = { x: -4.6, z: CZ - 0.05 }; M(new T3.BoxGeometry(0.5, 0.28, 0.36), copper, K.register.x, T + 0.14, K.register.z, root, 0.01); M(new T3.BoxGeometry(0.44, 0.16, 0.1), copperD, K.register.x, T + 0.34, K.register.z - 0.08, root, 0.006);
  for (let i = 0; i < 6; i++) M(new T3.CylinderGeometry(0.025, 0.025, 0.03, 8), cream, K.register.x - 0.15 + (i % 3) * 0.15, T + 0.29, K.register.z + 0.06 + Math.floor(i / 3) * 0.06, root, 0.003);
  { const tj = new T3.Mesh(new T3.CylinderGeometry(0.09, 0.08, 0.2, 14, 1, true), glassM); tj.position.set(-3.95, T + 0.1, CZ + 0.15); root.add(tj); M(new T3.CylinderGeometry(0.07, 0.07, 0.05, 12), gold, -3.95, T + 0.03, CZ + 0.15, root, 0); }
  // box station: flat pink boxes + ribbon spool (kitchen side of the counter's right end)
  K.box = { x: 2.0, z: CZ - 0.02 }; for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.4, 0.015, 0.3), pink, 2.55, T + 0.01 + i * 0.016, CZ - 0.05, root, 0.003);
  { const sp = M(new T3.CylinderGeometry(0.07, 0.07, 0.08, 14), gold, 1.45, T + 0.08, CZ - 0.12, root, 0.006, 0.07); sp.rotation.z = Math.PI / 2; M(new T3.CylinderGeometry(0.025, 0.025, 0.2, 8), woodD, 1.45, T + 0.08, CZ - 0.12, root, 0).rotation.z = Math.PI / 2; }
  K.spots = [-2.6, -1.0, 0.6].map(x => ({ x, z: CZ + 0.95 }));
  // ---------- kitchen: back counter, range, bottles, double boiler, sink ----------
  const BZ = -D / 2 + 0.5, BT = 0.95; K.backTop = BT; K.back = { z: BZ };
  M(new T3.BoxGeometry(W - 0.2, BT - 0.04, 0.95), woodD, 0, (BT - 0.04) / 2, BZ, root, 0.03); M(new T3.BoxGeometry(W - 0.15, 0.05, 1.0), marble, 0, BT - 0.02, BZ, root, 0.012);
  for (let x = -5.4; x < 5.6; x += 0.9) M(new T3.BoxGeometry(0.02, 0.6, 0.5), toon('#5a3e24'), x, 0.42, BZ + 0.48, root, 0);
  // range top (black) with two burners: the sugar pot and the chocolate double boiler
  M(new T3.BoxGeometry(2.2, 0.05, 0.86), ink, -3.9, BT + 0.005, BZ, root, 0.01);
  K.pot = { x: -4.45, z: BZ + 0.02 }; K.temper = { x: -3.3, z: BZ + 0.02 };
  K.burners = [K.pot, K.temper].map(b => { const ring = new T3.Mesh(new T3.TorusGeometry(0.2, 0.025, 6, 24), toon('#3a3836')); ring.rotation.x = Math.PI / 2; ring.position.set(b.x, BT + 0.04, b.z); root.add(ring);
    const glow = new T3.Mesh(new T3.TorusGeometry(0.17, 0.03, 6, 24), new T3.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0 })); glow.rotation.x = Math.PI / 2; glow.position.set(b.x, BT + 0.045, b.z); root.add(glow);
    const knob = M(new T3.CylinderGeometry(0.045, 0.045, 0.05, 12), copper, b.x, BT - 0.12, BZ + 0.5, root, 0.006); knob.rotation.x = Math.PI / 2; return { glow, knob, ...b }; });
  // copper sugar pot (built here; the game fills it)
  { const g = new T3.Group(); g.position.set(K.pot.x, BT + 0.05, K.pot.z); root.add(g);
    const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new T3.Vector2(0.2 + Math.sin(t * Math.PI) * 0.02 + t * 0.03, t * 0.3)); } pts.unshift(new T3.Vector2(0, 0));
    const body = new T3.Mesh(new T3.LatheGeometry(pts, 28), toon(P.copper, { side: T3.DoubleSide })); body.castShadow = true; ctx.addOutline && ctx.addOutline(body, 0.012); g.add(body);
    const rim = new T3.Mesh(new T3.TorusGeometry(0.235, 0.014, 6, 28), copperD); rim.rotation.x = Math.PI / 2; rim.position.y = 0.3; g.add(rim);
    const hd = M(new T3.BoxGeometry(0.34, 0.03, 0.05), woodD, 0.38, 0.24, 0, g, 0.006); hd.rotation.z = 0.12; K.potGroup = g; K.potR = 0.22; K.potY = BT + 0.05; }
  // candy thermometer clipped to the pot
  { const th = new T3.Group(); th.position.set(K.pot.x - 0.17, BT + 0.25, K.pot.z + 0.14); th.rotation.z = 0.12; root.add(th); M(new T3.BoxGeometry(0.04, 0.42, 0.012), cream, 0, 0.1, 0, th, 0.004); M(new T3.SphereGeometry(0.018, 8, 6), toon('#c2210f'), 0, -0.12, 0.004, th, 0.003);
    const col = M(new T3.BoxGeometry(0.012, 1, 0.006), toon('#c2210f'), 0, -0.1, 0.008, th, 0); col.geometry.translate(0, 0.5, 0); col.scale.y = 0.02; K.thermCol = col; }
  // flavour bottles (tap one to drop it in the pot)
  K.bottles = {}; Object.entries(FLAVORS).forEach(([k, f], i) => { const g = new T3.Group(), x = -2.55 + i * 0.27, z = BZ - 0.12; g.position.set(x, BT, z); root.add(g);
    M(new T3.CylinderGeometry(0.06, 0.065, 0.2, 12), toon(f.col), 0, 0.1, 0, g, 0.006, 0.065); M(new T3.CylinderGeometry(0.025, 0.04, 0.07, 10), toon(f.col), 0, 0.235, 0, g, 0.004); M(new T3.CylinderGeometry(0.03, 0.03, 0.03, 10), gold, 0, 0.28, 0, g, 0.004);
    const lab = new T3.Mesh(new T3.PlaneGeometry(0.09, 0.08), new T3.MeshBasicMaterial({ map: CT(64, 56, c => { c.fillStyle = '#fbf6ee'; c.fillRect(0, 0, 64, 56); c.fillStyle = f.deep; c.fillRect(0, 0, 64, 8); c.fillRect(0, 48, 64, 8); c.fillStyle = P.ink; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(f.name[0], 32, 29); }) })); lab.position.set(0, 0.1, 0.066); g.add(lab);
    K.bottles[k] = { g, x, z, y: BT }; });
  // chocolate double boiler
  { const g = new T3.Group(); g.position.set(K.temper.x, BT + 0.05, K.temper.z); root.add(g); M(new T3.CylinderGeometry(0.2, 0.18, 0.14, 22), toon('#c9ced4'), 0, 0.07, 0, g, 0.01, 0.2);
    const bowl = new T3.Mesh(new T3.SphereGeometry(0.2, 22, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#e8ecef', { side: T3.DoubleSide })); bowl.position.y = 0.26; ctx.addOutline && ctx.addOutline(bowl, 0.01, 0.2); g.add(bowl);
    const choc = new T3.Mesh(new T3.CircleGeometry(0.175, 24), toon('#4a2c18')); choc.rotation.x = -Math.PI / 2; choc.position.y = 0.21; g.add(choc); K.chocSurf = choc; K.temperGroup = g; K.chocY = BT + 0.05 + 0.21; }
  // sink + tea towel + hanging copper pans ("copper pots" from the brief)
  M(new T3.BoxGeometry(0.8, 0.06, 0.6), toon('#c9ced4'), 4.4, BT + 0.01, BZ, root, 0.008); M(new T3.CylinderGeometry(0.02, 0.02, 0.4, 8), toon('#c9ced4'), 4.4, BT + 0.2, BZ - 0.32, root, 0.004);
  { const rack = M(new T3.BoxGeometry(3.6, 0.05, 0.05), ink, -0.4, H - 0.55, -2.3, ceilG, 0.006); cut.push(rack); for (let i = 0; i < 5; i++) { const x = -1.9 + i * 0.75, r = 0.12 + (i % 3) * 0.03; cut.push(M(new T3.CylinderGeometry(0.006, 0.006, 0.3, 4), ink, x, H - 0.7, -2.3, ceilG, 0)); const pan = M(new T3.CylinderGeometry(r, r * 0.8, r * 0.7, 16, 1, true), toon(P.copper, { side: T3.DoubleSide }), x, H - 0.92 - r * 0.3, -2.3, ceilG, 0.008, r); pan.rotation.x = 0.2; cut.push(pan); } }
  // ---------- marble slab island (pull · cut · rope · roll · coat) ----------
  K.slab = { x: -0.4, z: -2.3, w: 3.6, d: 1.1 }; M(new T3.BoxGeometry(3.4, BT - 0.08, 0.95), woodD, K.slab.x, (BT - 0.08) / 2, K.slab.z, root, 0.03);
  { const mt = CT(256, 128, c => { c.fillStyle = '#f4f1ec'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#d9d2c8'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); let x = Math.random() * 256, y = Math.random() * 128; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - 0.4) * 40; y += (Math.random() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); } });
    const top = M(new T3.BoxGeometry(K.slab.w, 0.08, K.slab.d), [toon('#e8e4de'), toon('#e8e4de'), TM(mt), toon('#e8e4de'), toon('#e8e4de'), toon('#e8e4de')], K.slab.x, BT - 0.04, K.slab.z, root, 0.012); top.receiveShadow = true; }
  K.slabTop = BT;
  // taffy hook on a brass post at the slab's left end
  K.hook = { x: -2.05, y: BT + 0.32, z: K.slab.z }; M(new T3.CylinderGeometry(0.03, 0.04, 0.5, 10), gold, -2.12, BT + 0.25, K.slab.z, root, 0.006);
  { const hk = new T3.Mesh(new T3.TorusGeometry(0.06, 0.016, 6, 16, Math.PI * 1.3), gold); hk.position.set(-2.06, BT + 0.38, K.slab.z); hk.rotation.set(Math.PI / 2, 0, -0.6); ctx.addOutline && ctx.addOutline(hk, 0.004); root.add(hk); }
  K.coat = { cocoa: { x: 0.55, z: K.slab.z - 0.27 }, mint: { x: 0.55, z: K.slab.z + 0.27 } };
  for (const [k, b] of Object.entries(K.coat)) { const bw = new T3.Mesh(new T3.SphereGeometry(0.21, 20, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon(k === 'mint' ? '#e8f6ee' : '#f4ece4', { side: T3.DoubleSide })); bw.position.set(b.x, BT + 0.2, b.z); ctx.addOutline && ctx.addOutline(bw, 0.008, 0.21); root.add(bw);
    const pw = new T3.Mesh(new T3.CircleGeometry(0.19, 20), toon(COATS[k].dust)); pw.rotation.x = -Math.PI / 2; pw.position.set(b.x, BT + 0.1, b.z); root.add(pw); for (let i = 0; i < 12; i++) M(new T3.SphereGeometry(0.014, 5, 4), toon(COATS[k].col), b.x + Math.cos(i * 2.4) * 0.11, BT + 0.11, b.z + Math.sin(i * 2.4) * 0.11, root, 0); b.y = BT + 0.11; }
  // ---------- mould island (pipe · dust) ----------
  K.mould = { x: 3.0, z: -2.3 }; M(new T3.BoxGeometry(1.5, BT - 0.08, 0.95), woodD, K.mould.x, (BT - 0.08) / 2, K.mould.z, root, 0.03); M(new T3.BoxGeometry(1.62, 0.08, 1.1), marble, K.mould.x, BT - 0.04, K.mould.z, root, 0.012);
  M(new T3.BoxGeometry(1.0, 0.04, 0.66), toon('#fbf6ee'), K.mould.x - 0.08, BT + 0.02, K.mould.z, root, 0.008);
  K.cells = []; const cellG = new T3.ShapeGeometry(bearShape(T3, 0.0105)); cellG.rotateX(-Math.PI / 2);
  for (let i = 0; i < 6; i++) { const x = K.mould.x - 0.4 + (i % 3) * 0.32, z = K.mould.z - 0.16 + Math.floor(i / 3) * 0.32; const cm = new T3.Mesh(cellG, toon('#d9cfc4')); cm.position.set(x, BT + 0.042, z); root.add(cm); K.cells.push({ x, z, y: BT + 0.042 }); }
  // sugar shaker + piping bag rest
  K.shaker = { x: K.mould.x + 0.6, z: K.mould.z - 0.3 }; K.bag = { x: K.mould.x + 0.6, z: K.mould.z + 0.25 };
  // ---------- front of house: tables, chairs, shelves, giant lollies, window, NOW HIRING, door ----------
  const table = (x, z) => { M(new T3.CylinderGeometry(0.55, 0.55, 0.05, 22), pink, x, 0.76, z, root, 0.012, 0.55); M(new T3.CylinderGeometry(0.06, 0.06, 0.72, 8), gold, x, 0.37, z, root, 0.004); M(new T3.CylinderGeometry(0.28, 0.32, 0.04, 14), gold, x, 0.02, z, root, 0.006);
    for (const a of [0.5, 0.5 + Math.PI]) { const cx = x + Math.cos(a) * 0.8, cz = z + Math.sin(a) * 0.8; M(new T3.CylinderGeometry(0.22, 0.22, 0.06, 14), plumL, cx, 0.47, cz, root, 0.008, 0.22); M(new T3.CylinderGeometry(0.03, 0.03, 0.45, 6), gold, cx, 0.23, cz, root, 0);
      const back = M(new T3.BoxGeometry(0.4, 0.4, 0.05), plum, cx + Math.cos(a) * 0.2, 0.7, cz + Math.sin(a) * 0.2, root, 0.008); back.rotation.y = -a + Math.PI / 2; }
    // a little sundae of sweets on the table
    const s = sweetMesh(T3, toon, ctx.addOutline, 'truffle', { col: COATS.mint.col }); s.position.set(x + 0.1, 0.79, z - 0.05); s.scale.setScalar(1.6); root.add(s); };
  K.tables = [[-4.0, 3.1], [-1.6, 3.6]]; K.tables.forEach(([x, z]) => table(x, z));
  // left wall display shelves with jars + lollipops
  M(new T3.BoxGeometry(0.45, 1.6, 2.6), plum, -W / 2 + 0.25, 0.8, 2.7, root, 0.02); for (const y of [0.55, 1.05, 1.55]) { M(new T3.BoxGeometry(0.5, 0.04, 2.66), gold, -W / 2 + 0.27, y, 2.7, root, 0.006); for (let i = 0; i < 4; i++) jar(root, -W / 2 + 0.28, y + 0.02, 1.75 + i * 0.62, jarCols[(i + Math.round(y * 4)) % 6], 0.55); }
  const lolly = (x, z, h, col) => { M(new T3.CylinderGeometry(0.03, 0.03, h, 8), cream, x, h / 2, z, root, 0.004); const sw = CT(128, 128, c => { c.fillStyle = '#fbf6ee'; c.fillRect(0, 0, 128, 128); c.strokeStyle = col; c.lineWidth = 14; c.beginPath(); for (let a = 0; a < 26; a += 0.2) { const r = a * 2.3; c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } c.stroke(); });
    const d = M(new T3.CylinderGeometry(0.34, 0.34, 0.08, 26), [toon(col), TM(sw), TM(sw)], x, h + 0.3, z, root, 0.012, 0.34); d.rotation.x = Math.PI / 2; };
  lolly(-5.3, 4.5, 1.5, '#e04a5a'); lolly(5.35, 4.4, 1.7, '#8fb0d8'); lolly(5.35, 1.6, 1.3, '#9cc46a');
  // front windows + striped awning inside + the NOW HIRING card
  const winT = CT(256, 160, c => { const g = c.createLinearGradient(0, 0, 0, 160); g.addColorStop(0, '#bfe0c4'); g.addColorStop(0.6, '#e8f2d8'); g.addColorStop(0.61, '#6f9a4a'); g.addColorStop(1, '#4a7030'); c.fillStyle = g; c.fillRect(0, 0, 256, 160); c.fillStyle = '#3d6322'; for (let i = 0; i < 9; i++) { const x = i * 30 + 10; c.beginPath(); c.moveTo(x, 100); c.lineTo(x + 14, 30 + (i % 3) * 12); c.lineTo(x + 28, 100); c.fill(); } c.fillStyle = '#ffd98a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(20 + i * 44, 110, 4, 0, 7); c.fill(); } });
  K.windows = [];
  for (const x of [-3.6, -0.6]) { const wm = new T3.Mesh(new T3.PlaneGeometry(2.2, 1.6), new T3.MeshBasicMaterial({ map: winT })); wm.position.set(x, 1.8, D / 2 - 0.02); wm.rotation.y = Math.PI; frontG.add(wm); K.windows.push(wm);
    for (const dx of [-1.12, 0, 1.12]) M(new T3.BoxGeometry(0.08, 1.7, 0.08), gold, x + dx, 1.8, D / 2 - 0.05, frontG, 0.006); M(new T3.BoxGeometry(2.32, 0.08, 0.1), gold, x, 2.64, D / 2 - 0.05, frontG, 0.006); M(new T3.BoxGeometry(2.32, 0.1, 0.24), plumL, x, 0.98, D / 2 - 0.1, frontG, 0.006);
    for (let i = 0; i < 7; i++) { const st = M(new T3.BoxGeometry(0.32, 0.03, 0.42), toon(i % 2 ? P.cream : P.pink), x - 0.96 + i * 0.32, 2.86, D / 2 - 0.22, frontG, 0.004); st.rotation.x = -0.45; } }
  { const hireT = CT(256, 160, c => { c.fillStyle = '#fbf6ee'; c.fillRect(0, 0, 256, 160); c.fillStyle = P.pink; c.fillRect(0, 0, 256, 20); c.fillRect(0, 140, 256, 20); c.fillStyle = P.plum; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.fillText('NOW', 128, 72); c.fillText('HIRING', 128, 124); });
    const hire = new T3.Mesh(new T3.PlaneGeometry(0.6, 0.38), new T3.MeshBasicMaterial({ map: hireT })); hire.position.set(-3.2, 1.45, D / 2 - 0.06); hire.rotation.set(0, Math.PI, 0.05); frontG.add(hire); K.hiring = { x: -3.2, z: D / 2 - 0.9 }; }
  // door (pink trim, as the 2D door trim #ff9ec4) + welcome mat
  K.door = { x: 3.6, z: D / 2 - 0.6 };
  { const dt = CT(128, 256, c => { c.fillStyle = '#7a4c28'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#8a5a32'; c.fillRect(12, 12, 104, 100); c.fillRect(12, 130, 104, 112); c.fillStyle = '#d9f0ff'; c.fillRect(24, 24, 80, 76); c.fillStyle = P.gold; c.beginPath(); c.arc(104, 140, 6, 0, 7); c.fill(); });
    const pivot = new T3.Group(); pivot.position.set(2.9, 0, D / 2 - 0.03); frontG.add(pivot); K.doorPivot = pivot;   // the door swings in when someone walks through
    const dm = new T3.Mesh(new T3.PlaneGeometry(1.4, 2.5), new T3.MeshBasicMaterial({ map: dt, side: T3.DoubleSide })); dm.position.set(0.7, 1.25, 0); dm.rotation.y = Math.PI; pivot.add(dm); M(new T3.SphereGeometry(0.05, 8, 6), gold, 1.25, 1.15, -0.06, pivot, 0.004);
    // what you see through the open door: Nebo Town Square at dusk
    const outT = CT(256, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f2b880'); g.addColorStop(0.5, '#e8d6a8'); g.addColorStop(0.62, '#6f9a4a'); g.addColorStop(1, '#3d6322'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); c.fillStyle = '#2c4a1c'; for (let i = 0; i < 6; i++) { const x = i * 48 + 10; c.beginPath(); c.moveTo(x, 170); c.lineTo(x + 22, 40 + (i % 2) * 30); c.lineTo(x + 44, 170); c.fill(); } c.fillStyle = '#c9a17a'; c.fillRect(90, 160, 76, 96); c.fillStyle = '#ffd98a'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(30 + i * 64, 150, 6, 0, 7); c.fill(); } });
    const out = new T3.Mesh(new T3.PlaneGeometry(2.6, 3.0), new T3.MeshBasicMaterial({ map: outT })); out.position.set(3.6, 1.4, D / 2 + 0.6); out.rotation.y = Math.PI; frontG.add(out);
    M(new T3.BoxGeometry(1.6, 0.12, 0.12), pink, 3.6, 2.56, D / 2 - 0.06, frontG, 0.006); for (const s of [-1, 1]) M(new T3.BoxGeometry(0.12, 2.6, 0.12), pink, 3.6 + s * 0.76, 1.3, D / 2 - 0.06, frontG, 0.006);
    const mat = new T3.Mesh(new T3.PlaneGeometry(1.4, 0.8), toon(P.moss)); mat.rotation.x = -Math.PI / 2; mat.position.set(3.6, 0.006, D / 2 - 0.5); frontG.add(mat); }
  // apron hook by the kitchen pass ("Apron is on the hook and it is your size.")
  { M(new T3.BoxGeometry(0.05, 0.05, 0.6), woodD, W / 2 - 0.05, 1.7, -0.6, root, 0.004); const ap = M(new T3.BoxGeometry(0.03, 0.8, 0.46), pink, W / 2 - 0.08, 1.25, -0.6, root, 0.006); M(new T3.BoxGeometry(0.035, 0.24, 0.3), cream, W / 2 - 0.09, 1.2, -0.6, root, 0); K.apron = ap; }
  // candy garland along the front wall
  for (let i = 0; i < 22; i++) { const x = -5.6 + i * 0.53, y = 3.35 - Math.sin(((i % 11) / 10) * Math.PI) * 0.3; M(new T3.SphereGeometry(0.06, 8, 6), toon(jarCols[i % 6]), x, y, D / 2 - 0.12, frontG, 0.004, 0.06); }
  // Nebo touches: potted fern by the door, moss runner by the tables
  { const p = new T3.Group(); p.position.set(5.1, 0, 3.0); root.add(p); M(new T3.CylinderGeometry(0.26, 0.2, 0.42, 12), copper, 0, 0.21, 0, p, 0.01); for (let i = 0; i < 9; i++) { const lf = M(new T3.ConeGeometry(0.07, 0.8, 4), moss, Math.cos(i * 0.7) * 0.12, 0.7, Math.sin(i * 0.7) * 0.12, p, 0.004); lf.rotation.set(Math.sin(i * 0.7) * 0.7, 0, -Math.cos(i * 0.7) * 0.7); } }
  // ---------- walk data (room space) ----------
  K.colliders = [
    { x0: CX0, x1: CX1, z0: CZ - CD / 2, z1: CZ + CD / 2 },            // service counter (kitchen pass on the right)
    { x0: -6, x1: 6, z0: -5, z1: BZ + 0.5 },                             // back counter
    { x0: K.slab.x - 1.8, x1: K.slab.x + 1.8, z0: K.slab.z - 0.55, z1: K.slab.z + 0.55 },
    { x0: K.mould.x - 0.8, x1: K.mould.x + 0.8, z0: K.mould.z - 0.55, z1: K.mould.z + 0.55 },
    { x0: -6, x1: -5.45, z0: 1.35, z1: 4.05 },                           // display shelves
    ...K.tables.map(([x, z]) => ({ x0: x - 0.62, x1: x + 0.62, z0: z - 0.62, z1: z + 0.62, round: 0.62, cx: x, cz: z })),
    ...K.tables.flatMap(([x, z]) => [0.5, 0.5 + Math.PI].map(a => ({ round: 0.26, cx: x + Math.cos(a) * 0.8, cz: z + Math.sin(a) * 0.8 }))),
    { round: 0.32, cx: -5.3, cz: 4.5 }, { round: 0.32, cx: 5.35, cz: 4.4 }, { round: 0.32, cx: 5.35, cz: 1.6 }, { round: 0.3, cx: 5.1, cz: 3.0 }];
  K.bounds = { x0: -W / 2 + 0.35, x1: W / 2 - 0.35, z0: -D / 2 + 0.35, z1: D / 2 - 0.35 };
  K.angelica = { x: -4.0, z: -0.15 };
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }
