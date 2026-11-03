// MERU 2.0 — s41e (Ben): THE MERU BIRD AVIARY [meruAviary], east of the ring road between the city and the lake. A walk-in flight house
// (no fade): steel portal frame + a netted barrel vault 68 × 60 m, 9 m walls rising to 17 m. Entrance VESTIBULE on the west side (red sign,
// double doors), a loop path round a pond with a little rock waterfall, trees + palms, perches, feeders, benches, and ~40 parrots flying
// loops under the net (instanced, wing flap in the frame) + perched birds. Data: BUILDINGS 'aviary' + AVIARY in worlds/meru2-layout.js.
import { plantTrees } from './meru2-flora.js';
export function buildAviary({ THREE, scene, L, city, toon, CT, touch }) {
  const A = L.AVIARY, B = L.BUILDINGS.find(b => b.key === 'aviary'); if (!A || !B) return { tick() {}, colliders: [] };
  const root = new THREE.Group(); root.name = 'meru2Aviary'; scene.add(root);
  const [x0, x1, z0, z1] = B.f, W = x1 - x0, D = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, WH = A.wall, RISE = A.rise, [gz0, gz1] = A.gate;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  const C = city.colliders, colliders = [], col = o => { C.push(o); colliders.push(o); };
  const add = (geo, mat, x, y, z, ry = 0, par = root) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = !touch; m.receiveShadow = true; par.add(m); return m; };
  const box = (w, h, d, mat, x, y, z, ry) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, ry);
  const ink = toon('#201e1d'), steel = toon('#3d3b3a'), red = toon('#ec3013'), stone = toon('#cfcac3'), wood = toon('#9a7550'), rock = toon('#8a8178');

  // ---------- netting: one canvas grid, alpha-tested, both sides ----------
  const netT = CT(64, 64, (g, w) => { g.clearRect(0, 0, w, w); g.strokeStyle = 'rgba(32,30,29,0.85)'; g.lineWidth = 3; g.strokeRect(0, 0, w, w); });
  netT.wrapS = netT.wrapT = THREE.RepeatWrapping; const CELL = 1.2;
  const netM = (u, v) => { const t = netT.clone(); t.needsUpdate = true; t.repeat.set(u / CELL, v / CELL); return new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, depthWrite: false }); };
  const wallNet = (len, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(len, WH), netM(len, WH)); m.position.set(x, WH / 2, z); m.rotation.y = ry; root.add(m); };
  wallNet(W, cx, z0, 0); wallNet(W, cx, z1, 0); wallNet(D, x1, cz, Math.PI / 2);
  wallNet(gz0 - z0, x0, (z0 + gz0) / 2, Math.PI / 2); wallNet(z1 - gz1, x0, (gz1 + z1) / 2, Math.PI / 2);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(gz1 - gz0, WH - 4.2), netM(gz1 - gz0, WH - 4.2)); m.position.set(x0, 4.2 + (WH - 4.2) / 2, (gz0 + gz1) / 2); m.rotation.y = Math.PI / 2; root.add(m); }
  // the vault: half cylinder along x (span = depth), squashed to the rise; gable ends = half ellipses
  { const g = new THREE.CylinderGeometry(D / 2, D / 2, W, 40, 1, true, 0, Math.PI); g.rotateZ(Math.PI / 2); g.scale(1, RISE / (D / 2), 1);
    const m = new THREE.Mesh(g, netM(Math.PI * D / 2, W)); m.position.set(cx, WH, cz); root.add(m);
    for (const x of [x0, x1]) { const s = new THREE.Shape(); s.moveTo(-D / 2, 0); for (let i = 0; i <= 32; i++) { const a = Math.PI - i / 32 * Math.PI; s.lineTo(Math.cos(a) * D / 2, Math.sin(a) * RISE); }
      const sg = new THREE.ShapeGeometry(s); const uv = sg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / CELL, uv.getY(i) / CELL);
      const t = netT.clone(); t.needsUpdate = true; const gm = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, depthWrite: false })); gm.position.set(x, WH, cz); gm.rotation.y = Math.PI / 2; root.add(gm); } }
  // ---------- steel frame: posts every 6 m, a rib arch over each bay, eaves beams, base kerb ----------
  const posts = [], ribs = [];
  const ribAt = x => { const N = 14; for (let i = 0; i < N; i++) { const a0 = Math.PI - i / N * Math.PI, a1 = Math.PI - (i + 1) / N * Math.PI, p0 = [cz + Math.cos(a0) * D / 2, WH + Math.sin(a0) * RISE], p1 = [cz + Math.cos(a1) * D / 2, WH + Math.sin(a1) * RISE];
      const len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), pitch = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]); ribs.push(new THREE.Matrix4().compose(V(x, (p0[1] + p1[1]) / 2, (p0[0] + p1[0]) / 2), Q.setFromEuler(E.set(-pitch, 0, 0)).clone(), V(0.3, 0.3, len + 0.05))); } };
  for (let x = x0; x <= x1 + 0.01; x += W / Math.round(W / 6)) { for (const z of [z0, z1]) posts.push([x, z]); ribAt(x); }
  for (let z = z0 + D / Math.round(D / 6); z < z1 - 0.01; z += D / Math.round(D / 6)) for (const x of [x0, x1]) if (x !== x0 || z < gz0 - 0.5 || z > gz1 + 0.5) posts.push([x, z]);
  posts.push([x0, gz0], [x0, gz1]);
  { const pg = new THREE.BoxGeometry(0.34, WH, 0.34).translate(0, WH / 2, 0), pi = new THREE.InstancedMesh(pg, steel, posts.length); posts.forEach(([x, z], i) => pi.setMatrixAt(i, M4.makeTranslation(x, 0, z))); pi.castShadow = !touch; root.add(pi);
    const ri = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), steel, ribs.length); ribs.forEach((m, i) => ri.setMatrixAt(i, m)); root.add(ri); }
  for (const z of [z0, z1]) box(W, 0.3, 0.3, steel, cx, WH, z); for (const x of [x0, x1]) box(0.3, 0.3, D, steel, x, WH, cz);
  for (const z of [z0, z1]) box(W + 0.6, 0.5, 0.5, stone, cx, 0.25, z); box(0.5, 0.5, D + 0.6, stone, x1, 0.25, cz);
  box(0.5, 0.5, gz0 - z0, stone, x0, 0.25, (z0 + gz0) / 2); box(0.5, 0.5, z1 - gz1, stone, x0, 0.25, (gz1 + z1) / 2);
  // walls block walking (the gate stays open)
  const T = 0.5; col({ f: [x0 - T, x1 + T, z0 - T, z0 + T] }); col({ f: [x0 - T, x1 + T, z1 - T, z1 + T] }); col({ f: [x1 - T, x1 + T, z0, z1] }); col({ f: [x0 - T, x0 + T, z0, gz0] }); col({ f: [x0 - T, x0 + T, gz1, z1] });

  // ---------- entrance vestibule (outside the gate): roof, side walls, double doors pinned open, the sign ----------
  { const vx0 = x0 - A.vest, vm = (vx0 + x0) / 2, gw = gz1 - gz0;
    box(A.vest + 0.6, 0.4, gw + 2.4, ink, vm, 4.4, (gz0 + gz1) / 2); box(A.vest + 0.8, 0.12, gw + 2.6, red, vm, 4.66, (gz0 + gz1) / 2);
    for (const z of [gz0 - 1, gz1 + 1]) { box(A.vest, 4.2, 0.3, stone, vm, 2.1, z); col({ f: [vx0, x0, z - 0.3, z + 0.3] }); }
    for (const s of [-1, 1]) { const d = box(0.1, 3.4, gw / 2 - 0.2, new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.45 }), vx0 + 0.2 + (gw / 4) * 0.0, 1.7, (gz0 + gz1) / 2 + s * (gw / 2 - 0.6)); d.rotation.y = s * 1.2; }
    const sg = CT(1024, 192, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 26, h); g.fillStyle = '#ffffff'; g.font = '900 96px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('BIRD AVIARY', 60, h * 0.42); g.font = '700 38px Archivo, sans-serif'; g.fillText('MERU \u00b7 FREE ENTRY \u00b7 WALK IN', 62, h * 0.8); });
    const sm = new THREE.MeshBasicMaterial({ map: sg }); for (const f of [0, Math.PI]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(gw + 2, (gw + 2) * 192 / 1024), sm); p.position.set(vx0 - 0.05 + (f ? 0.1 : 0), 5.9, (gz0 + gz1) / 2); p.rotation.y = -Math.PI / 2 + f; root.add(p); }
    box(0.2, 1.6, gw + 2.2, ink, vx0, 5.9, (gz0 + gz1) / 2); }

  // ---------- inside: lawn, loop path, pond + waterfall rocks, trees, perches, feeders, benches ----------
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(W - 1, D - 1), toon('#7aa457')); lawn.rotation.x = -Math.PI / 2; lawn.position.set(cx, 0.03, cz); lawn.receiveShadow = true; root.add(lawn);
  const [px, pz, pr] = A.pond, loopR = [A.loop[0], A.loop[1]];
  { const pts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; pts.push([cx + Math.cos(a) * loopR[0], cz + Math.sin(a) * loopR[1]]); }
    const g = new THREE.BufferGeometry(), v = [], n = []; for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz), ox = -dz / l * 1.6, oz = dx / l * 1.6;
      v.push(ax - ox, 0.05, az - oz, ax + ox, 0.05, az + oz, bx + ox, 0.05, bz + oz, ax - ox, 0.05, az - oz, bx + ox, 0.05, bz + oz, bx - ox, 0.05, bz - oz); for (let k = 0; k < 6; k++) n.push(0, 1, 0); }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3)); const m = new THREE.Mesh(g, toon('#d6d1c9')); m.receiveShadow = true; root.add(m);
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(cx - loopR[0] - x0 + A.vest + 1, 3.2), toon('#d6d1c9')); sp.rotation.x = -Math.PI / 2; sp.position.set((x0 - A.vest + cx - loopR[0]) / 2, 0.05, (gz0 + gz1) / 2); root.add(sp); }
  { const w = new THREE.Mesh(new THREE.CircleGeometry(pr, 40), new THREE.MeshPhongMaterial({ color: 0x2e86b8, shininess: 80, transparent: true, opacity: 0.88 })); w.rotation.x = -Math.PI / 2; w.position.set(px, 0.07, pz); root.add(w);
    const rim = new THREE.Mesh(new THREE.RingGeometry(pr, pr + 0.7, 40), stone); rim.rotation.x = -Math.PI / 2; rim.position.set(px, 0.09, pz); root.add(rim); col({ c: [px, pz, pr + 0.3] });
    for (let i = 0; i < 9; i++) { const a = -0.5 + i * 0.12, r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1 + (i % 3) * 0.5, 0), rock); r.position.set(px + Math.cos(a) * (pr + 0.6), 0.6 + (i % 4) * 0.6, pz + Math.sin(a) * (pr + 0.6)); r.rotation.set(i, i * 2, 0); r.castShadow = !touch; root.add(r); }
    var fall = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide })); fall.position.set(px + Math.cos(0) * (pr - 0.1), 1.4, pz); fall.rotation.y = Math.PI / 2; root.add(fall); }
  let sd = 9137; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const onLoop = (x, z, m) => { const dx = (x - cx) / loopR[0], dz = (z - cz) / loopR[1], d = Math.hypot(dx, dz); return Math.abs(d - 1) * Math.min(loopR[0], loopR[1]) < m; };
  const okIn = (x, z, r) => x > x0 + r + 1 && x < x1 - r - 1 && z > z0 + r + 1 && z < z1 - r - 1 && !onLoop(x, z, 2.6 + r) && Math.hypot(x - px, z - pz) > pr + r + 1.5 && !(x < cx - loopR[0] + 2 && Math.abs(z - (gz0 + gz1) / 2) < 3 + r);
  const trees = [], used = [];
  for (let k = 0; k < 600 && trees.length < (touch ? 16 : 26); k++) { const x = x0 + rnd() * W, z = z0 + rnd() * D, s = 0.9 + rnd() * 0.6; if (!okIn(x, z, 2) || used.some(([a, b]) => Math.hypot(a - x, b - z) < 6)) continue; used.push([x, z]); const r = rnd(); trees.push([x, 0, z, s, r < 0.4 ? 'broad' : r < 0.7 ? 'palm' : r < 0.85 ? 'birch' : 'lime']); col({ c: [x, z, 0.5 * s] }); }
  try { root.add(plantTrees(trees, { shadow: !touch }).group); } catch (e) { for (const [x, , z, s] of trees) { add(new THREE.CylinderGeometry(0.25 * s, 0.35 * s, 4 * s, 8), wood, x, 2 * s, z); add(new THREE.IcosahedronGeometry(2.4 * s, 0), toon('#4f8a3a'), x, 5 * s, z); } }
  // perches (T-poles), feeders on posts, benches on the loop
  const perchTops = [];
  for (let k = 0, n = 0; k < 400 && n < 10; k++) { const x = x0 + rnd() * W, z = z0 + rnd() * D; if (!okIn(x, z, 1) || used.some(([a, b]) => Math.hypot(a - x, b - z) < 4)) continue; used.push([x, z]); n++; const h = 3 + rnd() * 3, ry = rnd() * 3;
    add(new THREE.CylinderGeometry(0.1, 0.12, h, 6), wood, x, h / 2, z); const bar = box(2.4, 0.12, 0.12, wood, x, h, z, ry); perchTops.push([x + Math.cos(ry) * 0.8, h + 0.1, z - Math.sin(ry) * 0.8, ry], [x - Math.cos(ry) * 0.8, h + 0.1, z + Math.sin(ry) * 0.8, ry]); col({ c: [x, z, 0.25] }); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3, x = cx + Math.cos(a) * (loopR[0] + 3), z = cz + Math.sin(a) * (loopR[1] + 3); if (x < x0 + 2 || x > x1 - 2 || z < z0 + 2 || z > z1 - 2) continue;
    if (i % 2) { add(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), ink, x, 0.8, z); add(new THREE.CylinderGeometry(0.6, 0.35, 0.3, 10), red, x, 1.7, z); perchTops.push([x + 0.5, 1.9, z, a]); col({ c: [x, z, 0.4] }); }
    else { const ry = -a + Math.PI / 2; box(2.2, 0.12, 0.6, wood, x, 0.5, z, ry); box(2.2, 0.5, 0.1, wood, x - Math.cos(a) * 0.3, 0.8, z - Math.sin(a) * 0.3, ry); col({ c: [x, z, 1] }); } }

  // ---------- birds: flyers loop under the net (instanced body + 2 wings), perched birds bob ----------
  const COLS = ['#ec3013', '#2e86b8', '#ffd23a', '#3f9a5e', '#f97316', '#7c3aed'].map(c => new THREE.Color(c)), NF = touch ? 22 : 40, NP = Math.min(perchTops.length, touch ? 10 : 18);
  const bodyG = new THREE.SphereGeometry(0.22, 8, 6).scale(0.8, 0.8, 1.6), wingG = new THREE.PlaneGeometry(0.62, 0.3).translate(0.31, 0, 0), tailG = new THREE.PlaneGeometry(0.14, 0.42).rotateX(-Math.PI / 2).translate(0, 0, -0.42);
  const bM = new THREE.MeshLambertMaterial({ vertexColors: false }), wM = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide });
  const N = NF + NP, bodyI = new THREE.InstancedMesh(bodyG, bM, N), wingL = new THREE.InstancedMesh(wingG, wM, N), wingR = new THREE.InstancedMesh(wingG, wM, N), tailI = new THREE.InstancedMesh(tailG, wM, N);
  const birds = []; for (let i = 0; i < N; i++) { const c = COLS[i % COLS.length]; for (const m of [bodyI, wingL, wingR, tailI]) m.setColorAt(i, c);
    if (i < NF) birds.push({ fly: true, a: rnd() * 6.28, sp: 0.18 + rnd() * 0.22, rx: 8 + rnd() * (W / 2 - 12), rz: 6 + rnd() * (D / 2 - 10), y: 4 + rnd() * (WH + RISE * 0.6 - 6), ph: rnd() * 6.28, bob: 0.6 + rnd(), ox: (rnd() - 0.5) * 10, oz: (rnd() - 0.5) * 8, dir: rnd() < 0.5 ? 1 : -1 });
    else { const p = perchTops[i - NF]; birds.push({ fly: false, x: p[0], y: p[1], z: p[2], ry: p[3] + (rnd() < 0.5 ? 0 : Math.PI), ph: rnd() * 6.28 }); } }
  for (const m of [bodyI, wingL, wingR, tailI]) { m.instanceColor.needsUpdate = true; m.frustumCulled = false; root.add(m); }
  const S1 = V(1, 1, 1), P = V(), Qb = new THREE.Quaternion(), Qw = new THREE.Quaternion(), MB = new THREE.Matrix4(), MW = new THREE.Matrix4(), Ew = new THREE.Euler();
  let t = 0, near = true;
  function tick(dt, now, camPos) { t += dt; if (camPos) near = Math.hypot(camPos.x - cx, camPos.z - cz) < (touch ? 150 : 240); root.visible = near; if (!near) return;
    if (fall) fall.material.opacity = 0.6 + Math.sin(t * 9) * 0.1;
    birds.forEach((b, i) => { let x, y, z, ry, flap;
      if (b.fly) { b.a += b.sp * dt * b.dir; x = cx + b.ox + Math.cos(b.a) * b.rx; z = cz + b.oz + Math.sin(b.a) * b.rz; y = b.y + Math.sin(t * b.bob + b.ph) * 1.2; ry = Math.atan2(-Math.sin(b.a) * b.rx * b.dir, Math.cos(b.a) * b.rz * b.dir); flap = Math.sin(t * 14 + b.ph) * 0.9; }
      else { x = b.x; y = b.y + Math.abs(Math.sin(t * 2 + b.ph)) * 0.03; z = b.z; ry = b.ry; flap = Math.sin(t * 0.7 + b.ph) > 0.97 ? Math.sin(t * 30) * 0.8 : -1.25; }
      Qb.setFromEuler(Ew.set(0, ry, 0)); MB.compose(P.set(x, y, z), Qb, S1); bodyI.setMatrixAt(i, MB); tailI.setMatrixAt(i, MB);
      Qw.setFromEuler(Ew.set(0, ry, flap)); MW.compose(P.set(x, y + 0.05, z), Qw, S1); wingL.setMatrixAt(i, MW);
      Qw.setFromEuler(Ew.set(0, ry + Math.PI, flap)); MW.compose(P, Qw, S1); wingR.setMatrixAt(i, MW); });
    for (const m of [bodyI, wingL, wingR, tailI]) m.instanceMatrix.needsUpdate = true; }
  tick(0, 0, null);
  return { tick, colliders, group: root };
}
