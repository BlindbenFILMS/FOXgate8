// MERU 2.0 — exterior polish round 2: MARKET PLAZA stalls + LANES COURT café tables (decoration only: no new NPCs or lines).
// Market: striped-awning stalls along both promenade edges, between the benches, goods in crates on the counters, a lantern each
// (lit at night). Lanes Court: bistro tables with two chairs and a striped parasol. Merged by material + instanced goods: ~9 draws.
// Every piece gets a collider (pushed into city.colliders before the grass bake, so no grass grows through them).
export function buildMarket({ THREE, scene, L, city, toon, CT, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Market'; scene.add(root);
  const blocked = (x, z, r) => (city.colliders || []).some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false);
  const nearSpk = (x, z, r) => L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r);
  const bins = {}, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), Q = new THREE.Quaternion(), Y = V(0, 1, 0);
  const add = (k, g, x, y, z, ry = 0) => { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), Q.setFromAxisAngle(Y, ry), V(1, 1, 1))); (bins[k] || (bins[k] = [])).push(g); };
  const Box = (a, b, c) => new THREE.BoxGeometry(a, b, c), Cyl = (a, b, h, n = 10) => new THREE.CylinderGeometry(a, b, h, n);
  const W = (x, z, ry, lx, lz) => [x + Math.cos(ry) * lx + Math.sin(ry) * lz, z - Math.sin(ry) * lx + Math.cos(ry) * lz];
  const stripe = (a, b) => { const t = CT(64, 16, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 8, 0, 8, h); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); return t; };
  const AWN = [['#ec3013', '#f3f2f2'], ['#2e4a6b', '#f3f2f2'], ['#e0a020', '#f3f2f2'], ['#3f7a52', '#f3f2f2']];
  const goods = [], lanterns = [], stalls = [];
  // ---------- MARKET STALLS ----------
  for (const sz of [-1, 1]) { let lastX = 1e9; for (let x = -58; x > -142; x -= 1) { const z = sz * 10.4, ry = sz < 0 ? 0 : Math.PI, [ccx, ccz] = W(x, z, ry, 0, 0.3);   // front faces the path (toward z 0); slide along until clear, 13 m apart
    if (Math.abs(x - lastX) < 13 || blocked(ccx, ccz, 1.75) || nearSpk(x, z, 3.2)) continue; lastX = x; const ai = stalls.length % AWN.length; stalls.push([x, z, ry, ai]);
    const P = (k, g, lx, y, lz, r2 = 0) => { const [wx, wz] = W(x, z, ry, lx, lz); add(k, g, wx, y, wz, ry + r2); };
    P('wood', Box(3.0, 0.9, 1.1), 0, 0.45, 0.35); P('top', Box(3.1, 0.06, 1.2), 0, 0.93, 0.35); P('wood', Box(3.0, 0.12, 0.05), 0, 0.2, 0.92);
    for (const [lx, lz] of [[-1.5, -0.45], [1.5, -0.45], [-1.5, 1.05], [1.5, 1.05]]) P('post', Box(0.08, lz < 0 ? 2.6 : 2.25, 0.08), lx, lz < 0 ? 1.3 : 1.125, lz);
    P('awn' + ai, Box(3.3, 0.05, 1.9), 0, 2.45, 0.32, 0); { const k = 'awn' + ai, g = bins[k][bins[k].length - 1]; g.applyMatrix4(new THREE.Matrix4().makeTranslation(-W(x, z, ry, 0, 0.32)[0], -2.45, -W(x, z, ry, 0, 0.32)[1])); g.applyMatrix4(new THREE.Matrix4().makeRotationAxis(V(Math.cos(ry), 0, -Math.sin(ry)), 0.2)); g.applyMatrix4(new THREE.Matrix4().makeTranslation(W(x, z, ry, 0, 0.32)[0], 2.45, W(x, z, ry, 0, 0.32)[1])); }
    P('awn' + ai, Box(3.3, 0.28, 0.03), 0, 2.2, 1.27);
    for (let c = 0; c < 3; c++) { const lx = -1 + c, [gx, gz] = W(x, z, ry, lx, 0.55); P('crate', Box(0.8, 0.22, 0.5), lx, 1.07, 0.55); goods.push([gx, gz, (ai * 3 + c) % 6]); }
    const [lx2, lz2] = W(x, z, ry, 1.35, 1.0); lanterns.push([lx2, 2.0, lz2]);
    city.colliders.push({ c: [ccx, ccz, 1.6] }); } }
  // ---------- LANES COURT bistro tables ----------
  const tables = [];
  for (const sz of [-1, 1]) { let lastX = -1e9; for (let x = 56; x < 100; x += 1) { const z = sz * 9.8; if (x - lastX < 6.5 || Math.hypot(x - 105, z + 14) < 8 || blocked(x, z, 1.3) || nearSpk(x, z, 3)) continue; lastX = x; tables.push([x, z]);
    add('iron', Cyl(0.05, 0.05, 0.72, 8), x, 0.36, z); add('iron', Cyl(0.3, 0.32, 0.04, 14), x, 0.02, z); add('top', Cyl(0.42, 0.42, 0.04, 18), x, 0.74, z);
    for (const s of [-1, 1]) { const cx = x + s * 0.72; add('iron', Box(0.42, 0.04, 0.42), cx, 0.46, z); add('iron', Box(0.04, 0.42, 0.42), cx + s * 0.2, 0.68, z); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) add('iron', Box(0.03, 0.46, 0.03), cx + a, 0.23, z + b); }
    add('post', Cyl(0.025, 0.025, 2.4, 6), x, 1.2, z); add('para' + ((x / 16 | 0) % AWN.length), new THREE.ConeGeometry(1.25, 0.5, 8, 1, true), x, 2.35, z);
    city.colliders.push({ c: [x, z, 1.15] }); } }
  // build
  const MAT = { wood: toon('#8a5a34'), top: toon('#c9b28a'), post: toon('#5c4430'), crate: toon('#b08b5e'), iron: toon('#2a2d33') };
  AWN.forEach(([a, b], i) => { MAT['awn' + i] = new THREE.MeshToonMaterial({ map: stripe(a, b), side: THREE.DoubleSide }); MAT['para' + i] = new THREE.MeshToonMaterial({ map: stripe(a, b), side: THREE.DoubleSide }); });
  const merge = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return G; };
  for (const k in bins) { const m = new THREE.Mesh(merge(bins[k]), MAT[k]); m.castShadow = !touch && k !== 'post'; root.add(m); }
  // goods: a mound of produce in each crate (instanced, coloured per crate)
  const GC = ['#ec3013', '#f59e0b', '#16a34a', '#facc15', '#7a3f6b', '#fb923c'], per = touch ? 4 : 7, gI = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.1, 0), new THREE.MeshLambertMaterial({ color: 0xffffff }), Math.max(1, goods.length * per)), M4 = new THREE.Matrix4(), cc = new THREE.Color(); let n = 0;
  for (const [x, z, ci] of goods) for (let k = 0; k < per; k++) { M4.compose(V(x + (Math.random() - 0.5) * 0.55, 1.2 + Math.random() * 0.06, z + (Math.random() - 0.5) * 0.3), Q.identity(), V(1, 1, 1).multiplyScalar(0.8 + Math.random() * 0.5)); gI.setMatrixAt(n, M4); gI.setColorAt(n++, cc.set(GC[ci]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.1)); }
  gI.count = n; root.add(gI);
  const lanM = new THREE.MeshBasicMaterial({ color: 0x8a7a5a }), lI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), lanM, Math.max(1, lanterns.length)); lanterns.forEach(([x, y, z], i) => { M4.makeTranslation(x, y, z); lI.setMatrixAt(i, M4); }); lI.count = lanterns.length; root.add(lI);
  const glowT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,214,140,1)'); r.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lanterns.flat(), 3)), new THREE.PointsMaterial({ map: glowT, size: 2.2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; root.add(glow);
  let far = false;
  return { setNight(on) { lanM.color.set(on ? 0xffd68c : 0x8a7a5a); glow.visible = on; }, tick(cam) { const f = Math.hypot(cam.x + 30, cam.z) > (touch ? 160 : 260); if (f !== far) { far = f; root.visible = !f; } }, stats: { stalls: stalls.length, tables: tables.length } };
}
