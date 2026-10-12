// MERU 2.0 — art pass: SKYLINE DISTRICTS AT STREET LEVEL. Every background tower can now be reached on foot or by road:
// each district has a paved plaza (painted by the blockout from L.SKYLINE) and an access road (in L.ROADS). Here: an ENTRANCE on every
// tower (gold-framed glass doors on the face toward the road, a canopy with a light strip, planters), grand entrances on the landmarks
// (revolving door, wider canopy, three waving flags), plaza dressing (trees in grates, benches, bins, lamps, bollards), lamps along the
// access roads, one feature per district (reflecting pool, gold obelisk, pearl sculpture, garden lawn), and colliders for all of it.
// Merged by material; hidden beyond 260 m (150 m phones).
import { plantTrees, plantShrubs } from './meru2-flora.js';
export function buildDistricts({ THREE, scene, L, bases, touch, terrainAt }) {
  const root = new THREE.Group(); root.name = 'meru2Districts'; scene.add(root);
  const SK = L.SKYLINE, R = Math.random, colliders = [], E = new THREE.Euler(), Q = new THREE.Quaternion(), M4 = new THREE.Matrix4(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ONE = V(1, 1, 1);
  const bins = {}, add = (key, geo, x, y, z, ry = 0, col = '#ffffff') => { const g = geo.index ? geo.toNonIndexed() : geo; E.set(0, ry, 0); M4.compose(V(x, y, z), Q.setFromEuler(E), ONE); g.applyMatrix4(M4);
    const c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (g.attributes.uv) g.deleteAttribute('uv'); (bins[key] || (bins[key] = [])).push(g); };
  const Box = (a, b, c) => new THREE.BoxGeometry(a, b, c), Cyl = (a, b, h, n = 12) => new THREE.CylinderGeometry(a, b, h, n);
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const nearP = (x, z, p) => { let best = null, bd = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)), qx = ax + dx * u, qz = az + dz * u, d = Math.hypot(x - qx, z - qz); if (d < bd) { bd = d; best = [qx, qz]; } } return best; };
  const spines = Object.values(SK.spines), roadD = (x, z) => Math.min(...spines.map(p => segD(x, z, p)));
  const inPlaza = (x, z, m = 0) => SK.plazas.some(P => x > P.r[0] + m && x < P.r[1] - m && z > P.r[2] + m && z < P.r[3] - m) && L.lakeF(x, z) > 1.14;
  const keep = [], flags = [], shrubList = [], lampsW = [];   // keep = [x, z, r] areas the dressing must stay clear of
  const doorPts = [];
  // ---------- towers: colliders + entrances ----------
  for (const b of bases) {
    const hw = b.w / 2, hd = b.d / 2; colliders.push({ f: [b.x - hw - 0.3, b.x + hw + 0.3, b.z - hd - 0.3, b.z + hd + 0.3] }); keep.push([b.x, b.z, Math.hypot(hw, hd) + 3]);
    if (b.w < 8 || b.h < 5) continue;
    const sp = SK.spines[b.d0] || spines.reduce((a, p) => segD(b.x, b.z, p) < segD(b.x, b.z, a) ? p : a), q = nearP(b.x, b.z, sp), dx = q[0] - b.x, dz = q[1] - b.z;
    const F = b.face ? { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[b.face] : Math.abs(dx) / hw > Math.abs(dz) / hd ? [Math.sign(dx), 0] : [0, Math.sign(dz)];
    const ry = Math.atan2(F[0], F[1]), along = F[0] ? Math.max(-hd + 4, Math.min(hd - 4, q[1] - b.z)) : Math.max(-hw + 4, Math.min(hw - 4, q[0] - b.x));
    const half = F[0] ? hw : hd, cs = Math.cos(ry), sn = Math.sin(ry), W = (lx, lz) => [b.x + F[0] * half + lx * cs + lz * sn, b.z + F[1] * half - lx * sn + lz * cs];
    const al = b.lm ? 0 : (F[0] ? -(along) * F[0] : along * F[1]);   // local x along the face
    const P = (key, geo, lx, y, lz, col) => { const [x, z] = W(al + lx, lz); add(key, geo, x, y, z, ry, col); };
    const DW = b.lm ? 8 : 4.4, DH = b.lm ? 5.6 : 4.2, CW = b.lm ? 16 : 7.4, CD = b.lm ? 6 : 3.4, CY = DH + 0.9;
    P('glass', Box(DW, DH, 0.12), 0, DH / 2, 0.08, '#ffffff'); P('gold', Box(0.22, DH + 0.2, 0.22), -DW / 2 - 0.11, DH / 2, 0.12); P('gold', Box(0.22, DH + 0.2, 0.22), DW / 2 + 0.11, DH / 2, 0.12); P('gold', Box(DW + 0.44, 0.22, 0.22), 0, DH + 0.1, 0.12);
    P('gold', Box(0.08, DH - 0.2, 0.06), 0, DH / 2, 0.16);
    P('mat', Box(CW, 0.32, CD), 0, CY, CD / 2, '#2a2d33'); P('glow', Box(CW - 0.6, 0.05, 0.25), 0, CY - 0.18, CD - 0.3); P('glow', Box(CW - 0.6, 0.05, 0.25), 0, CY - 0.18, 0.5);
    for (const s of [-1, 1]) { P('mat', Cyl(0.04, 0.04, 2.6, 6).rotateX(0.95), s * (CW / 2 - 0.6), CY + 1.0, CD * 0.42, '#9aa0a6'); P('mat', Box(1.5, 0.75, 1.5), s * (DW / 2 + 2.2), 0.38, 1.2, '#b8b2a8'); }
    P('mat', Box(DW + 1.6, 0.03, 2.6), 0, 0.03, 1.6, '#3a3530');
    const sh = []; for (const s of [-1, 1]) { const [x, z] = W(al + s * (DW / 2 + 2.2), 1.2); sh.push([x, 0.75, z, 0.8]); colliders.push({ c: [x, z, 0.9] }); } shrubList.push(...sh);
    if (b.lm) { P('glassR', Cyl(1.9, 1.9, DH - 0.2, 20), 0, DH / 2, 2.2, '#ffffff'); P('gold', Cyl(2.0, 2.0, 0.2, 20), 0, DH, 2.2); P('gold', Cyl(2.0, 2.0, 0.12, 20), 0, 0.06, 2.2);
      for (let k = 0; k < 4; k++) P('gold', Box(0.06, DH - 0.3, 1.8).rotateY(k * Math.PI / 4), 0, DH / 2, 2.2);
      const [rx, rz] = W(al, 2.2); colliders.push({ c: [rx, rz, 2.1] });
      for (const s of [-1, 0, 1]) { const [fx, fz] = W(al + s * 7, CD + 4); add('mat', Cyl(0.09, 0.12, 11, 8), fx, 5.5, fz, 0, '#d9d6cf'); add('gold', new THREE.SphereGeometry(0.18, 8, 6), fx, 11.1, fz); flags.push([fx, 10.2, fz, ry, s]); colliders.push({ c: [fx, fz, 0.3] }); } }
    const [ex, ez] = W(al, 2); doorPts.push([ex, ez, F[0], F[1], b.lm ? 7 : 4.5]); keep.push([ex + F[0] * 4, ez + F[1] * 4, b.lm ? 9 : 6]); }
  // ---------- WALKS: a paved footpath from every entrance to its access road (out from the door, then an L to the road), kerbs both sides, lamps ----------
  // overlap audit: a lamp never stands inside a tower base, on any road, in a building or in the lake
  const hill = (x, z) => !!(terrainAt && terrainAt(x, z) > 0.3);
  const lampOK = (x, z) => !hill(x, z) && !bases.some(t => Math.abs(x - t.x) < t.w / 2 + 0.8 && Math.abs(z - t.z) < t.d / 2 + 0.8) && !L.ROADS.some(R2 => segD(x, z, R2.p) < R2.w / 2 + 1.2) && !L.BUILDINGS.some(b => b.f && x > b.f[0] - 1 && x < b.f[1] + 1 && z > b.f[2] - 1 && z < b.f[3] + 1) && !L.inLake(x, z) && segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) > (Object.values(L.TRAIN.stopAt).some(s => Math.hypot(x - s.c[0], z - s.c[1]) < 46) ? 13 : 4.5);
  const walkSeg = []; let nWalk = 0;
  for (const [ex, ez, fx, fz, ww] of doorPts) { let best = null, bd = 1e9; for (const p of spines) { const q = nearP(ex, ez, p), dd = Math.hypot(q[0] - ex, q[1] - ez); if (dd < bd) { bd = dd; best = q; } } if (!best || bd < 9) continue;
    const ox = ex + fx * 6, oz = ez + fz * 6, wet = pts => pts.some(([x, z]) => L.inLake(x, z) || L.lakeF(x, z) < 1.08);
    const sample = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2), o = []; for (let i = 0; i <= n; i++) o.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); return o; };
    const optA = [[ex, ez], [ox, oz], [best[0], oz], best], optB = [[ex, ez], [ox, oz], [ox, best[1]], best];
    const okA = !wet([...sample(optA[1], optA[2]), ...sample(optA[2], optA[3])]), path = okA ? optA : optB; nWalk++;
    for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], len = Math.hypot(bx - ax, bz - az); if (len < 0.5) continue; const w = i === 0 ? ww : 4.2;
      walkSeg.push([ax, az, bx, bz, w]); keep.push(...sample([ax, az], [bx, bz]).filter((_, j) => j % 2 === 0).map(([x, z]) => [x, z, w / 2 + 0.6])); } }
  for (const [ax, az, bx, bz, w] of walkSeg) { const len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), cx = (ax + bx) / 2, cz = (az + bz) / 2, nx = Math.cos(ry), nz = -Math.sin(ry);
    add('mat', Box(w, 0.05, len + w), cx, 0.04, cz, ry, '#dcd6cc'); for (const s2 of [-1, 1]) add('mat', Box(0.22, 0.14, len + w), cx + nx * (w / 2 + 0.11) * s2, 0.07, cz + nz * (w / 2 + 0.11) * s2, ry, '#9a958d');
    for (let t = 0; t < len; t += 1.2) add('mat', Box(w, 0.012, 0.05), ax + (bx - ax) * t / len, 0.07, az + (bz - az) * t / len, ry, '#bfb8ad');
    for (let t = 8, n = 0; t < len - 3; t += 16, n++) { const s2 = n % 2 ? 1 : -1, x = ax + (bx - ax) * t / len + nx * (w / 2 + 1.0) * s2, z = az + (bz - az) * t / len + nz * (w / 2 + 1.0) * s2; if (lampOK(x, z)) lampsW.push([x, z]); } }
  // ---------- dressing on every plaza ----------
  const trees = [], benches = [], lamps = [...lampsW], bolls = [];
  lampsW.forEach(([x, z]) => colliders.push({ c: [x, z, 0.25] }));
  const clear = (x, z, r) => inPlaza(x, z, 2) && !hill(x, z) && !hill(x + r, z) && !hill(x - r, z) && !hill(x, z + r) && !hill(x, z - r) && roadD(x, z) > 7.5 && !keep.some(([a, b2, rr]) => Math.hypot(x - a, z - b2) < rr + r) && !colliders.some(c => c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : Math.hypot(x - c.c[0], z - c.c[1]) < c.c[2] + r);
  for (const P of SK.plazas) { const step = touch ? 18 : 13;
    for (let x = P.r[0] + 6; x < P.r[1] - 4; x += step) for (let z = P.r[2] + 6; z < P.r[3] - 4; z += step) { const jx = x + (R() - 0.5) * 3, jz = z + (R() - 0.5) * 3, k = R();
      if (k < 0.5) { if (clear(jx, jz, 2.5)) { trees.push([jx, 0, jz, 0.8 + R() * 0.35, R() < 0.6 ? 'lime' : R() < 0.5 ? 'broad' : 'birch']); colliders.push({ c: [jx, jz, 0.6] }); keep.push([jx, jz, 2]);
        add('iron', Box(2.4, 0.04, 2.4), jx, 0.03, jz, 0, '#2c3036'); add('mat', Box(2.6, 0.12, 0.12), jx, 0.06, jz - 1.25, 0, '#9a958d'); add('mat', Box(2.6, 0.12, 0.12), jx, 0.06, jz + 1.25, 0, '#9a958d'); add('mat', Box(0.12, 0.12, 2.6), jx - 1.25, 0.06, jz, 0, '#9a958d'); add('mat', Box(0.12, 0.12, 2.6), jx + 1.25, 0.06, jz, 0, '#9a958d'); } }
      else if (k < 0.72) { if (clear(jx, jz, 1.8)) { const r = Math.round(R() * 4) * Math.PI / 2; benches.push([jx, jz, r]); colliders.push({ c: [jx, jz, 1.1] }); keep.push([jx, jz, 1.5]); } }
      else if (k < 0.86) { if (clear(jx, jz, 1)) { lamps.push([jx, jz]); colliders.push({ c: [jx, jz, 0.25] }); keep.push([jx, jz, 3]); } } } }
  // lamps along the access roads (path readability) + bollards where each road meets its plaza
  for (const p of spines) for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
    for (let t = 10, n = 0; t < len; t += 24, n++) { const s = n % 2 ? 1 : -1, x = ax + (bx - ax) * t / len + nx * 6.5 * s, z = az + (bz - az) * t / len + nz * 6.5 * s; if (lampOK(x, z)) { lamps.push([x, z]); colliders.push({ c: [x, z, 0.25] }); } } }
  // ---------- district features ----------
  const F = SK.features || [];
  for (const f of F) { const [x, z] = f.at; keep.push([x, z, 6]);
    if (f.kind === 'pool') { add('mat', Box(f.w + 1, 0.5, f.d + 1), x, 0.25, z, 0, '#bdb7ae'); add('water', Box(f.w, 0.06, f.d), x, 0.51, z, 0, '#ffffff'); for (const s2 of [-1, 1]) { add('mat', Box(f.w + 1, 0.1, 0.5), x, 0.55, z + s2 * (f.d / 2 + 0.25), 0, '#cfc9bf'); add('mat', Box(0.5, 0.1, f.d), x + s2 * (f.w / 2 + 0.25), 0.55, z, 0, '#cfc9bf'); }   /* flicker pass: water 4 cm over the basin, a raised coping round it */ colliders.push({ f: [x - f.w / 2 - 0.5, x + f.w / 2 + 0.5, z - f.d / 2 - 0.5, z + f.d / 2 + 0.5] });
      for (let i = 0; i < 6; i++) add('glow', Cyl(0.12, 0.12, 0.06, 8), x - f.w / 2 + 1.5 + i * (f.w - 3) / 5, 0.56, z, 0); }
    if (f.kind === 'obelisk') { add('mat', Box(4, 0.8, 4), x, 0.4, z, 0, '#d8c3a0'); add('mat', Box(3, 0.6, 3), x, 1.1, z, 0, '#cdb48c'); const g = Cyl(0.5, 1.1, 11, 4).rotateY(Math.PI / 4); add('gold', g, x, 6.9, z); add('gold', Cyl(0, 0.5, 1.4, 4).rotateY(Math.PI / 4), x, 13.1, z); colliders.push({ c: [x, z, 2.4] }); }
    if (f.kind === 'pearl') { add('mat', Cyl(3, 3.4, 0.8, 24), x, 0.4, z, 0, '#e7e4dc'); const sh = new THREE.SphereGeometry(2.6, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2); sh.scale(1.2, 0.5, 1.2); add('mat', sh, x, 0.8, z, 0, '#f1c9b7'); add('pearlM', new THREE.SphereGeometry(1.5, 24, 16), x, 2.4, z, 0, '#ffffff'); colliders.push({ c: [x, z, 3.4] }); }
    if (f.kind === 'lawn') { add('mat', Cyl(f.r + 0.3, f.r + 0.3, 0.2, 40), x, 0.1, z, 0, '#bdb7ae'); add('grass', Cyl(f.r, f.r, 0.22, 40), x, 0.11, z, 0, '#5f8c3e');
      for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, rr = f.r * 0.7; add('mat', new THREE.SphereGeometry(0.28, 6, 4), x + Math.cos(a) * rr, 0.35, z + Math.sin(a) * rr, 0, ['#ec3013', '#facc15', '#f472b6', '#f3f2f2'][i % 4]); }
      trees.push([x, 0.2, z, 1.2, 'broad']); colliders.push({ c: [x, z, f.r * 0.5] }); } }
  // ---------- build ----------
  const benchG = (() => { const p = []; const P = (g, x, y, z, c) => { g = g.index ? g.toNonIndexed() : g; g.translate(x, y, z); const cc = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([cc.r, cc.g, cc.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (g.attributes.uv) g.deleteAttribute('uv'); p.push(g); };
    for (let k = 0; k < 4; k++) P(Box(2.1, 0.05, 0.12), 0, 0.47, 0.2 - k * 0.14, k % 2 ? '#8f6640' : '#a77b4f'); for (let k = 0; k < 3; k++) P(Box(2.1, 0.11, 0.04), 0, 0.64 + k * 0.15, -0.32, '#a77b4f');
    for (const sx of [-0.98, 0.98]) { P(Box(0.07, 0.45, 0.5), sx, 0.22, 0, '#24282c'); P(Box(0.07, 0.6, 0.07), sx, 0.75, -0.32, '#24282c'); } return merge(p); })();
  const lampG = (() => { const p = []; const P = (g, x, y, z, c) => { g = g.index ? g.toNonIndexed() : g; g.translate(x, y, z); const cc = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) a.set([cc.r, cc.g, cc.b], i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); if (g.attributes.uv) g.deleteAttribute('uv'); p.push(g); };
    P(Cyl(0.1, 0.15, 5.6, 6), 0, 2.8, 0, '#2a2d33'); P(Cyl(0.28, 0.32, 0.5, 8), 0, 0.25, 0, '#2a2d33'); P(Box(1.4, 0.1, 0.1), 0.6, 5.5, 0, '#2a2d33'); P(Box(0.7, 0.16, 0.42), 1.2, 5.42, 0, '#2a2d33'); return merge(p); })();
  function merge(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let o = 0;
    for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); col.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(col, 3)); G.computeBoundingSphere(); return G; }
  const inst = (geo, mat, list, fn) => { const im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); im.count = list.length; list.forEach((a, i) => { fn(a); im.setMatrixAt(i, M4); }); root.add(im); return im; };
  const vc = new THREE.MeshLambertMaterial({ vertexColors: true });
  inst(benchG, vc, benches, ([x, z, r]) => M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, r, 0)), ONE));
  inst(lampG, vc, lamps, ([x, z]) => M4.compose(V(x, 0, z), Q.setFromEuler(E.set(0, Math.atan2(x, z), 0)), ONE));
  const lensM = new THREE.MeshBasicMaterial({ color: 0xd9d6cf }), lens = inst(new THREE.BoxGeometry(0.6, 0.04, 0.36), lensM, lamps, ([x, z]) => { const a = Math.atan2(x, z); M4.compose(V(x + Math.cos(a) * 1.2, 5.33, z - Math.sin(a) * 1.2), Q.setFromEuler(E.set(0, a, 0)), ONE); });
  const MATS = { mat: vc, iron: vc, grass: vc, gold: new THREE.MeshBasicMaterial({ vertexColors: true, color: 0xd7ad52 }), glow: new THREE.MeshBasicMaterial({ color: 0x8a8378 }),
    glass: new THREE.MeshPhongMaterial({ color: 0x1d2b38, shininess: 120, specular: 0x9fc4e0, emissive: 0x000000 }), glassR: new THREE.MeshPhongMaterial({ color: 0x9fc4e0, transparent: true, opacity: 0.35, shininess: 120, depthWrite: false }),
    water: new THREE.MeshPhongMaterial({ color: 0x1f5f7a, shininess: 140, specular: 0xffffff }), pearlM: new THREE.MeshPhongMaterial({ color: 0xfbf6ee, shininess: 160, specular: 0xffffff, emissive: 0x000000 }) };
  for (const k in bins) { const g = merge(bins[k]), m = new THREE.Mesh(g, MATS[k] || vc); if (k === 'mat' && !touch) m.castShadow = true; root.add(m); }
  if (trees.length) root.add(plantTrees(trees, { shadow: !touch }).group);
  if (shrubList.length) root.add(plantShrubs(shrubList));
  // waving flags: a segmented plane, the wave runs out from the pole (vertex shader)
  const uT = { value: 0 }, flagM = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, vertexColors: true });
  flagM.onBeforeCompile = sh => { sh.uniforms.uT = uT; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float u = position.x / 2.4; vec2 ip = vec2(0.0);
    #ifdef USE_INSTANCING
    ip = instanceMatrix[3].xz;
    #endif
    transformed.z += u * (0.32 * sin(u * 5.0 - uT * 6.0 + ip.x * 0.3) + 0.12 * sin(u * 11.0 - uT * 9.0)); transformed.y -= u * u * 0.18;`); };
  const fg = new THREE.PlaneGeometry(2.4, 1.5, 12, 3); fg.translate(1.2, 0, 0); { const n = fg.attributes.position.count, c = new Float32Array(n * 3), red = new THREE.Color('#ec3013'), wh = new THREE.Color('#f3f2f2'); for (let i = 0; i < n; i++) { const y = fg.attributes.position.getY(i), cc = Math.abs(y) < 0.25 ? wh : red; c.set([cc.r, cc.g, cc.b], i * 3); } fg.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
  inst(fg, flagM, flags, ([x, y, z, ry, s]) => M4.compose(V(x + 0.1, y, z), Q.setFromEuler(E.set(0, ry + Math.PI / 2 + 0.3, 0)), ONE));
  let night = false, cullT = 0; const far = touch ? 150 : 260;
  function tick(dt, now, cam) { uT.value = (now / 1000) % 10000;
    if ((cullT -= dt) <= 0) { cullT = 0.4; let near = false; for (const P of SK.plazas) { const dx = Math.max(P.r[0] - cam.x, 0, cam.x - P.r[1]), dz = Math.max(P.r[2] - cam.z, 0, cam.z - P.r[3]); if (Math.hypot(dx, dz) < far) near = true; } root.visible = near || cam.y > 150; } }
  function setNight(on) { night = on; MATS.glow.color.set(on ? 0xfff1c4 : 0x8a8378); MATS.glass.emissive.set(on ? 0x5a4a2a : 0x000000); lensM.color.set(on ? 0xfff1c4 : 0xd9d6cf); MATS.pearlM.emissive.set(on ? 0x2a2a3a : 0x000000); }
  return { colliders, tick, setNight, doors: doorPts, stats: { towers: bases.length, doors: doorPts.length, walks: nWalk, trees: trees.length, benches: benches.length, lamps: lamps.length, flags: flags.length } };
}
