// MERU — the PLANET DEFENSE BASE, on a plateau 16 m up the hills north-east of the Barracks (Castle Path side). A short, steep,
// lantern-lit road leaves the Castle Path grass north of the Barracks and climbs to it. On top: a command bunker you walk
// into (no fade; the roof lifts while you are inside) with the DEFENSE console, a big radar dish, gun turrets on the cliff
// edge, a watchtower at the overlook corner, searchlights at night, two guards and two techs. Open any time; the defense
// itself (the original PLANET DEFENSE minigame) only starts after the King's briefing. Metres, town frame (x east, z south).
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const sm = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const HT = 16;
export const P = { x0: 96, x1: 126, z0: -98, z1: -68 };                         // the plateau
export const F = { x0: 44, x1: 132, z0: -104, z1: -60.2 };   // stops short of the Barracks' north wall (z -59.4)                        // everything this module shapes
export const ROAD = [[49, -63.5], [84, -64], [89, -80], [97.5, -83]];
const HW = 2.1, BR = 1.6, BP = 2.2;
const SEG = []; { let s = 0; for (let i = 0; i < ROAD.length - 1; i++) { const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1], L = Math.hypot(bx - ax, bz - az); SEG.push({ ax, az, bx, bz, L, s }); s += L; } }
const LTOT = SEG.reduce((a, q) => a + q.L, 0);
export const BUNK = { x0: 106, x1: 120, z0: -87, z1: -77, h: 4, door: -82 };
export const CONSOLE = { x: 117.0, z: -82, r: 1.7 };
const roadAt = (X, Z) => { let best = 99, bs = 0; for (const q of SEG) { const dx = q.bx - q.ax, dz = q.bz - q.az, u = clamp(((X - q.ax) * dx + (Z - q.az) * dz) / (q.L * q.L), 0, 1), d = Math.hypot(X - q.ax - dx * u, Z - q.az - dz * u); if (d < best) { best = d; bs = q.s + u * q.L; } } return [best, bs]; };
const roadH = s => HT * clamp((s - 4) / (LTOT - 7), 0, 1);
const dOut = (X, Z) => { const dx = Math.max(P.x0 - X, 0, X - P.x1), dz = Math.max(P.z0 - Z, 0, Z - P.z1); return dx || dz ? Math.hypot(dx, dz) : -Math.min(X - P.x0, P.x1 - X, Z - P.z0, P.z1 - Z); };
export const inArea = (X, Z) => X >= F.x0 && X <= F.x1 && Z >= F.z0 && Z <= F.z1;
export const near = (X, Z) => X > F.x0 - 1.5 && X < F.x1 + 1.5 && Z > F.z0 - 1.5 && Z < F.z1 + 1.5;
export const onPlateau = (X, Z) => dOut(X, Z) < 0;
export function terrain(X, Z, base) {
  if (!inArea(X, Z)) return null;
  const dp = dOut(X, Z); if (dp <= 0) return HT;
  let h = base, w = 0;
  if (dp < BP) { w = sm(1 - dp / BP); h = lerp(base, HT, w); }
  const [d, s] = roadAt(X, Z);
  if (d < HW + BR) { const k = d < HW ? 1 : sm(1 - (d - HW) / BR); if (k > w) h = lerp(base, roadH(s), k); }
  return h;
}
export const standAt = terrain;
const inBarracks = (X, Z) => X > 51 && X < 80 && Z > -60.4 && Z < -31;
export function walkable(X, Z) {
  if (!inArea(X, Z) || inBarracks(X, Z)) return undefined;
  if (dOut(X, Z) < -0.35 || roadAt(X, Z)[0] < HW - 0.15) return true;
  return X < 55.6 ? undefined : false;
}
const modified = (X, Z) => dOut(X, Z) < BP || roadAt(X, Z)[0] < HW + BR;
export const sinkMesh = (X, Z) => X > F.x0 + 2 && X < F.x1 - 2 && Z > F.z0 + 2 && Z < F.z1 - 2;
export const noTree = (X, Z) => near(X, Z) && (modified(X, Z) || dOut(X, Z) < 5);

// the people: one line each, no new story
export const PEOPLE = [
  { key: 'defGuard1', name: 'Base Guard', role: 'Planet Defense', outfit: 'armor', torso: ['#cbd5e1', '#64748b', '#334155'], crest: '8', x: 99.2, z: -86.6, face: -Math.PI / 2, mood: 'stern', line: 'PLANET DEFENSE BASE. Mind the edge, it is a long way down.' },
  { key: 'defGuard2', name: 'Base Guard', role: 'Planet Defense', outfit: 'armor', torso: ['#cbd5e1', '#64748b', '#334155'], crest: '8', x: 99.2, z: -79.4, face: -Math.PI / 2, mood: 'determined', line: 'Eyes on the sky. That is the whole job.' },
  { key: 'defTech1', name: 'Radar Tech', role: 'Planet Defense', outfit: 'coat', female: true, torso: ['#f1f5f9', '#38bdf8', '#0c4a6e'], crest: '8', x: 110.5, z: -85.6, face: 0, mood: 'curious', line: 'Every dish and turret on this mountain answers to that console.' },
  { key: 'defTech2', name: 'Systems Tech', role: 'Planet Defense', outfit: 'coat', torso: ['#f1f5f9', '#ec3013', '#7f1d1d'], crest: '8', x: 110.5, z: -78.4, face: Math.PI, mood: 'warm', line: 'If the King ever calls, this is where Meru holds the line.' },
];

export function buildDefense(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowTex, BK, colliders, camBlockers, DARK, heightAt, baseAt, LOW } = K;
  const root = new THREE.Group(); root.name = 'meruDefense'; scene.add(root);
  // ---- ground: grass and rock by slope, a gravel road, a concrete plateau with joints and hazard edging ----
  const X0 = F.x0, X1 = F.x1, Z0 = F.z0, Z1 = F.z1, st = LOW ? 0.75 : 0.5, nx = Math.round((X1 - X0) / st), nz = Math.round((Z1 - Z0) / st);
  const g = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, nx, nz); g.rotateX(-Math.PI / 2); g.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2);
  const pos = g.attributes.position, cols = new Float32Array(pos.count * 3), c = new THREE.Color();
  const GR = new THREE.Color('#5f9a48'), GR2 = new THREE.Color('#4a8440'), RK = new THREE.Color('#8a8376'), RK2 = new THREE.Color('#6b655c'), GRAV = new THREE.Color('#b9ab8e'), CON = new THREE.Color('#9a9ea4'), CON2 = new THREE.Color('#878b91'), HAZ = new THREE.Color('#e0b43a'), INK = new THREE.Color('#2a2a2e');
  const hAt = (x, z) => { const b = baseAt(x, z), t = terrain(x, z, b); return t == null ? b : t; };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = hAt(x, z); pos.setY(i, h + 0.05);
    const gx = (hAt(x + 0.3, z) - hAt(x - 0.3, z)) / 0.6, gz = (hAt(x, z + 0.3) - hAt(x, z - 0.3)) / 0.6, sl = Math.hypot(gx, gz), dp = dOut(x, z), [rd] = roadAt(x, z);
    c.copy(GR).lerp(GR2, (Math.sin(x * 1.1) * Math.cos(z * 0.9) + 1) * 0.3);
    if (dp < 0) { c.copy(CON).lerp(CON2, (Math.floor(x / 4) + Math.floor(z / 4)) % 2 ? 0.6 : 0); if (((x % 4) + 4) % 4 < 0.08 || ((z % 4) + 4) % 4 < 0.08) c.lerp(INK, 0.35); if (dp > -0.7) c.copy(Math.floor((x + z) / 0.9) % 2 ? HAZ : INK); }
    else if (rd < HW) c.copy(GRAV).lerp(RK, (Math.sin(x * 3.1 + z * 2.3) + 1) * 0.12);
    const rock = clamp((sl - 1.1) / 1.2, 0, 1); if (rock > 0 && !(dp < 0) && !(rd < HW - 0.2)) c.lerp(RK.clone().lerp(RK2, (Math.sin(z * 2.1 + h * 1.7) + 1) * 0.5), rock);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3)); g.computeVertexNormals();
  const ground = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad })); ground.receiveShadow = true; scene.add(ground);
  { const pg = new THREE.PlaneGeometry(X1 - X0, Z1 - Z0, Math.round(nx / 4), Math.round(nz / 4)); pg.rotateX(-Math.PI / 2); pg.translate((X0 + X1) / 2, 0, (Z0 + Z1) / 2); const pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setY(i, hAt(pp.getX(i), pp.getZ(i)) - 0.3); pg.computeBoundingSphere(); const proxy = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ visible: false })); scene.add(proxy); camBlockers.push(proxy); }
  const T = HT, conc = toon('#7d8288'), conc2 = toon('#6b7076'), steel = toon('#4b5563'), steel2 = toon('#374151'), red = toon('#c42d3c'), yel = toon('#e0b43a');
  // ---- lanterns up the road (path readability rule) ----
  { let acc = 3; for (const q of SEG) { const dx = (q.bx - q.ax) / q.L, dz = (q.bz - q.az) / q.L; for (; acc < q.L; acc += 6) { for (const sd of [-1, 1]) { if ((Math.round(acc / 6) + (sd > 0 ? 1 : 0)) % 2) continue; const x = q.ax + dx * acc + dz * sd * (HW + 0.4), z = q.az + dz * acc - dx * sd * (HW + 0.4), gg = new THREE.Group(); gg.position.set(x, heightAt(x, z), z); root.add(gg); BK.lantern(0, 0, gg, null, '#ffd38a'); } } acc -= q.L; } }
  // ---- rails along the cliff edges (west + south, the overlook sides), with the road's gap ----
  const railM = toon('#3a3f46');
  const rail = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(x1 - x0, z1 - z0); for (const y of [0.55, 1.05]) { const r = M(BOX(0.07, 0.07, len), yel, (x0 + x1) / 2, T + y, (z0 + z1) / 2, root, 0.01); r.rotation.y = a; } for (let i = 0, n = Math.max(1, Math.round(len / 1.5)); i <= n; i++) M(BOX(0.09, 1.1, 0.09), railM, x0 + (x1 - x0) * i / n, T + 0.55, z0 + (z1 - z0) * i / n, root, 0.01); };
  rail(P.x0 + 0.2, P.z0 + 0.2, P.x0 + 0.2, -85.4); rail(P.x0 + 0.2, -80.6, P.x0 + 0.2, P.z1 - 0.2); rail(P.x0 + 0.2, P.z1 - 0.2, P.x1 - 0.2, P.z1 - 0.2);
  // ---- the command bunker ----
  const B = BUNK, bw = B.x1 - B.x0, bd = B.z1 - B.z0, bcx = (B.x0 + B.x1) / 2, bcz = (B.z0 + B.z1) / 2, WT = 0.4;
  const shell = new THREE.Group(); root.add(shell); camBlockers.push(shell);
  const sides = { N: new THREE.Group(), S: new THREE.Group(), E: new THREE.Group(), W: new THREE.Group() }; for (const k in sides) shell.add(sides[k]);
  const wall = (x0, x1, z0, z1, sd) => { const par = sides[sd], m = M(BOX(x1 - x0, B.h, z1 - z0), conc, (x0 + x1) / 2, T + B.h / 2, (z0 + z1) / 2, par, 0.03); colliders.push({ box: [x0, x1, z0, z1] }); const s = M(BOX(x1 - x0 + 0.02, 0.35, z1 - z0 + 0.02), yel, (x0 + x1) / 2, T + 0.9, (z0 + z1) / 2, par, 0); s.castShadow = false; return m; };
  wall(B.x0, B.x1, B.z0, B.z0 + WT, 'N'); wall(B.x0, B.x1, B.z1 - WT, B.z1, 'S'); wall(B.x1 - WT, B.x1, B.z0, B.z1, 'E'); wall(B.x0, B.x0 + WT, B.z0, B.door - 1.3, 'W'); wall(B.x0, B.x0 + WT, B.door + 1.3, B.z1, 'W');
  M(BOX(WT + 0.1, 0.6, 2.8), conc2, B.x0 + WT / 2, T + B.h - 0.3, B.door, sides.W, 0.02);
  { const sg = new THREE.Group(); sg.position.set(B.x0 - 0.05, T + 3.05, B.door); sg.rotation.y = -Math.PI / 2; sides.W.add(sg); const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = '#111317'; x.fillRect(0, 0, 512, 96); x.fillStyle = '#e0b43a'; x.font = '900 40px Archivo, Arial'; x.textBaseline = 'middle'; x.fillText('PLANET DEFENSE', 24, 50); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; M(BOX(4.2, 0.8, 0.08), [DARK, DARK, DARK, DARK, glowing(0, tx, 1.0), DARK], 0, 0, 0, sg, 0.01); }
  M(BOX(bw, 0.06, bd), toon('#3a3f46'), bcx, T + 0.03, bcz, root, 0);
  const roof = new THREE.Group(); root.add(roof);
  M(BOX(bw + 0.6, 0.45, bd + 0.6), conc2, bcx, T + B.h + 0.22, bcz, roof, 0.03);
  for (const [x, z] of [[109, -84], [116, -79]]) M(BOX(1.2, 0.6, 1.2), steel, x, T + B.h + 0.75, z, roof, 0.02);
  const mast = M(new THREE.CylinderGeometry(0.06, 0.08, 4.5, 6), steel2, B.x1 - 1.2, T + B.h + 2.6, B.z0 + 1.2, roof, 0.01, 0.08);
  const beacon = M(new THREE.SphereGeometry(0.16, 10, 8), glowing('#ff3b3b', null, 2.2), B.x1 - 1.2, T + B.h + 4.9, B.z0 + 1.2, roof, 0); beacon.castShadow = false;
  // inside: the DEFENSE console against the east wall, a wall screen over it, side desks, ceiling strips, an alarm light
  const scrCv = document.createElement('canvas'); scrCv.width = 512; scrCv.height = 256; const scrX = scrCv.getContext('2d'); const scrT = new THREE.CanvasTexture(scrCv); scrT.colorSpace = THREE.SRGBColorSpace;
  function drawScreen(state, sweep) { const x = scrX; x.fillStyle = '#06121c'; x.fillRect(0, 0, 512, 256); x.strokeStyle = 'rgba(56,189,248,0.25)'; x.lineWidth = 1; for (let i = 0; i <= 512; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 256); x.stroke(); } for (let i = 0; i <= 256; i += 32) { x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke(); }
    x.fillStyle = '#1e5a3a'; x.beginPath(); x.arc(150, 140, 70, 0, 7); x.fill(); x.strokeStyle = '#4ade80'; x.lineWidth = 3; x.stroke();
    x.strokeStyle = 'rgba(74,222,128,0.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(150, 140); x.lineTo(150 + Math.cos(sweep) * 110, 140 + Math.sin(sweep) * 110); x.stroke();
    if (state === 'alert') { x.fillStyle = '#ff3b3b'; for (let i = 0; i < 14; i++) { const a = i * 0.7 + sweep * 0.15, r = 95 + (i % 4) * 9; x.fillRect(150 + Math.cos(a) * r - 3, 140 + Math.sin(a) * r - 3, 6, 6); } }
    x.fillStyle = state === 'alert' ? '#ff3b3b' : '#4ade80'; x.font = '800 26px Archivo, Arial'; x.fillText(state === 'alert' ? 'MACHINE FLEET' : state === 'won' ? 'SKY CLEAR' : 'ALL CLEAR', 270, 70);
    x.fillStyle = '#e0b43a'; x.font = '700 18px Archivo, Arial'; x.fillText('MERU DEFENSE GRID', 270, 110); x.fillStyle = '#9fb3c8'; x.fillText(state === 'alert' ? 'ALL BATTERIES ARMED' : 'STANDBY', 270, 140); scrT.needsUpdate = true; }
  drawScreen('calm', 0);
  M(BOX(1.1, 1.0, 6.0), steel2, B.x1 - WT - 0.6, T + 0.5, B.door, root, 0.02);
  const deskTop = M(BOX(1.2, 0.08, 6.1), toon('#1f2937'), B.x1 - WT - 0.6, T + 1.04, B.door, root, 0.01);
  for (let i = -2; i <= 2; i++) { const s = M(BOX(0.06, 0.5, 0.9), glowing(i % 2 ? '#38bdf8' : '#4ade80', null, 1.4), B.x1 - WT - 0.95, T + 1.38, B.door + i * 1.15, root, 0.01); s.rotation.z = 0.35; s.castShadow = false; }
  { const scr = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), new THREE.MeshBasicMaterial({ map: scrT })); scr.position.set(B.x1 - WT - 0.14, T + 2.55, B.door); scr.rotation.y = -Math.PI / 2; root.add(scr); M(BOX(0.12, 2.9, 5.5), DARK, B.x1 - WT - 0.06, T + 2.55, B.door, root, 0.01); }
  colliders.push({ box: [B.x1 - WT - 1.2, B.x1 - WT, B.door - 3.05, B.door + 3.05] });
  for (const [z, f] of [[B.z0 + WT + 0.5, 0], [B.z1 - WT - 0.5, Math.PI]]) { M(BOX(5, 0.9, 0.9), steel2, 111, T + 0.45, z, root, 0.02); for (let i = -1; i <= 1; i++) { const s = M(BOX(1.1, 0.6, 0.05), glowing(i ? '#38bdf8' : '#e0b43a', null, 1.3), 111 + i * 1.5, T + 1.25, z + (f ? -0.42 : 0.42), root, 0.01); s.castShadow = false; } colliders.push({ box: [108.5, 113.5, z - 0.45, z + 0.45] }); }
  for (const x of [109, 113, 117]) { const s = M(BOX(0.25, 0.06, 6), glowing('#eef6ff', null, 1.2), x, T + B.h - 0.1, bcz, roof, 0); s.castShadow = false; }
  const alarm = M(new THREE.CylinderGeometry(0.18, 0.2, 0.25, 10), glowing('#ff3b3b', null, 2.4), bcx, T + B.h - 0.2, B.door, root, 0); alarm.castShadow = false;
  // ---- the big radar dish ----
  const radar = new THREE.Group(); radar.position.set(121.5, T, -93); root.add(radar);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = M(BOX(0.18, 6.2, 0.18), steel, sx * 0.9, 3.1, sz * 0.9, radar, 0.01); l.rotation.set(sz * 0.12, 0, -sx * 0.12); }
  for (const y of [1.6, 3.4, 5.0]) M(BOX(2.0 - y * 0.18, 0.1, 2.0 - y * 0.18), steel2, 0, y, 0, radar, 0.01);
  colliders.push({ box: [120.2, 122.8, -94.3, -91.7] });
  const dishPivot = new THREE.Group(); dishPivot.position.y = 6.5; radar.add(dishPivot);
  { const tilt = new THREE.Group(); tilt.rotation.x = -0.6; dishPivot.add(tilt); const dish = M(new THREE.SphereGeometry(2.6, 24, 10, 0, Math.PI * 2, 0, 0.7), toon('#e5e7eb', { side: THREE.DoubleSide }), 0, -2.0, 0, tilt, 0.03, 2.6); dish.rotation.x = Math.PI; M(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), steel2, 0, 0.4, 0, tilt, 0.01); M(new THREE.SphereGeometry(0.16, 8, 6), red, 0, 1.2, 0, tilt, 0.01); M(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 10), steel, 0, -0.1, 0, dishPivot, 0.02, 0.5); }
  // ---- gun turrets on the cliff edges ----
  const turrets = [[98.6, -93, -Math.PI / 2], [98.6, -74.5, -Math.PI / 2], [112, -69.6, Math.PI], [123.5, -69.6, Math.PI]].map(([x, z, f], i) => {
    const gg = new THREE.Group(); gg.position.set(x, T, z); root.add(gg); M(new THREE.CylinderGeometry(0.9, 1.1, 0.7, 14), conc2, 0, 0.35, 0, gg, 0.02, 1.1); colliders.push({ c: [x, z, 1.1] });
    const head = new THREE.Group(); head.position.y = 0.7; gg.add(head); M(BOX(1.3, 0.8, 1.5), steel, 0, 0.45, 0, head, 0.02); M(BOX(1.32, 0.12, 1.52), yel, 0, 0.1, 0, head, 0);
    const pitch = new THREE.Group(); pitch.position.set(0, 0.55, 0.4); head.add(pitch); for (const sx of [-0.28, 0.28]) M(new THREE.CylinderGeometry(0.09, 0.11, 2.0, 8), steel2, sx, 0, 1.0, pitch, 0.012, 0.11).rotation.x = Math.PI / 2;
    return { head, pitch, base: f, ph: i * 1.7 }; });
  // ---- the watchtower at the overlook corner ----
  const tower = new THREE.Group(); tower.position.set(101, T, -72.5); root.add(tower);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(BOX(0.22, 5.4, 0.22), toon('#5a3d2b'), sx * 1.1, 2.7, sz * 1.1, tower, 0.01);
  for (const y of [1.8, 3.6]) for (const r of [0, Math.PI / 2]) { const b = M(BOX(2.4, 0.1, 0.1), toon('#6b4a35'), 0, y, 0, tower, 0.01); b.rotation.y = r; }
  M(BOX(3.2, 0.2, 3.2), toon('#7a5236'), 0, 5.5, 0, tower, 0.02); for (const [x, z, w, d] of [[0, 1.55, 3.2, 0.1], [0, -1.55, 3.2, 0.1], [1.55, 0, 0.1, 3.2], [-1.55, 0, 0.1, 3.2]]) M(BOX(w, 0.9, d), toon('#6b4a35'), x, 6.05, z, tower, 0.01);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(BOX(0.12, 2.0, 0.12), toon('#5a3d2b'), sx * 1.45, 6.5, sz * 1.45, tower, 0.01);
  M(new THREE.ConeGeometry(2.6, 1.0, 4), red, 0, 7.9, 0, tower, 0.03).rotation.y = Math.PI / 4;
  for (let i = 0; i < 9; i++) M(BOX(0.7, 0.06, 0.12), toon('#5a3d2b'), 0, 0.4 + i * 0.58, 1.25, tower, 0);
  colliders.push({ box: [99.7, 102.3, -73.8, -71.2] });
  // ---- searchlights (night): one on the tower, one on the radar's top deck; cheap cones, no real lights ----
  const beamM = new THREE.MeshBasicMaterial({ color: 0xfff4c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const lights = [[tower, 0, 6.6, 0], [radar, 0, 5.2, 0]].map(([par, x, y, z], i) => { const gg = new THREE.Group(); gg.position.set(x, y, z); par.add(gg); M(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 10), steel2, 0, 0, 0, gg, 0.01, 0.28).rotation.x = Math.PI / 2;
    const lens = M(new THREE.CircleGeometry(0.24, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d8 }), 0, 0, 0.24, gg, 0);
    const cg = new THREE.ConeGeometry(4.5, 40, 18, 1, true); cg.translate(0, -20, 0); cg.rotateX(-Math.PI / 2); const cone = new THREE.Mesh(cg, beamM.clone()); cone.position.z = 0.2; gg.add(cone); cone.renderOrder = 3;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1c0, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 })); glow.scale.setScalar(2.4); glow.position.z = 0.3; gg.add(glow);
    return { gg, cone, glow, lens, ph: i * 2.3 }; });
  // floodlight poles on the plateau corners (glow at night)
  const floods = [[P.x1 - 0.8, P.z0 + 0.8], [P.x1 - 0.8, P.z1 - 0.8], [P.x0 + 0.8, P.z0 + 0.8]].map(([x, z]) => { M(new THREE.CylinderGeometry(0.08, 0.1, 5, 6), steel2, x, T + 2.5, z, root, 0.01, 0.1); const h = M(BOX(0.6, 0.35, 0.35), glowing('#fff4c8', null, 1.2), x, T + 5.05, z, root, 0.01); h.castShadow = false; return h; });
  let t = 0, state = 'calm', scrT0 = 0, leftT = 0;
  return { root, ground,
    update(dt, Pl, cam, sunY, story) {
      t += dt; state = story.won ? 'won' : story.briefed ? 'alert' : 'calm';
      dishPivot.rotation.y += dt * (state === 'alert' ? 1.4 : 0.45);
      turrets.forEach((q, i) => { const a = state === 'alert' ? Math.sin(t * 1.3 + q.ph) * 0.9 : Math.sin(t * 0.35 + q.ph) * 0.5; q.head.rotation.y = q.base + a; q.pitch.rotation.x = -(state === 'alert' ? 0.65 + Math.sin(t * 2 + i) * 0.15 : 0.35); });
      const night = clamp((0.12 - sunY) * 5, 0, 1) + (state === 'alert' ? 0.35 : 0);
      lights.forEach(L => { L.gg.rotation.y = Math.sin(t * 0.35 + L.ph) * 1.4 + (L.ph ? Math.PI : 0); L.gg.rotation.x = 0.35 + Math.sin(t * 0.23 + L.ph) * 0.12; const k = clamp(night, 0, 1); L.cone.visible = k > 0.02; L.cone.material.opacity = 0.09 * k; L.glow.material.opacity = 0.85 * k; });
      floods.forEach(f => f.material.emissiveIntensity = 0.3 + clamp(night, 0, 1) * 1.6);
      beacon.visible = Math.sin(t * 4) > 0; alarm.visible = state === 'alert' && Math.sin(t * 7) > 0; alarm.rotation.y += dt * 6;
      scrT0 -= dt; if (scrT0 <= 0) { scrT0 = 0.12; drawScreen(state, t * 1.6); }
      // roof off while you are inside, for a beat after, and while the camera is still at the walls
      const inB = Pl.x > B.x0 && Pl.x < B.x1 && Pl.z > B.z0 && Pl.z < B.z1, camN = cam.x > B.x0 - 2.5 && cam.x < B.x1 + 2.5 && cam.z > B.z0 - 2.5 && cam.z < B.z1 + 2.5 && cam.y < T + B.h + 4;
      if (inB) leftT = 1.2; else leftT = Math.max(0, leftT - dt); const here = inB || leftT > 0 || camN; roof.visible = !here;
      // and the walls on the camera's side drop away so you can see in
      sides.W.visible = !(here && cam.x < B.x0 + 1); sides.E.visible = !(here && cam.x > B.x1 - 1); sides.N.visible = !(here && cam.z < B.z0 + 1); sides.S.visible = !(here && cam.z > B.z1 - 1);
    } };
}
