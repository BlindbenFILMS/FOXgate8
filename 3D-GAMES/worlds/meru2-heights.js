import { plantTrees } from './meru2-flora.js';
// MERU 2.0 — step 3 part 4: ELEVATED AREAS + LIGHTHOUSES. Data: HILLS / TRAILS / LIGHTHOUSES in worlds/meru2-layout.js.
// Falls hill (cliff on the lake side, stream + waterfall, overlook deck) · Castle Ridge + lookout · Ruins Hills (wild, no trail)
// · Hill Park (paved summit, skyline view) · the Ferry Lighthouse on its pier + the Pearl Lighthouse, both climbable outside.
// Walk contract: groundAt(x, z, y) · clamp(x, z, nx, nz, y) · terrainAt · surfaceAt · outdoor · onTerrain · carBlock · colliders.
export function buildHeights({ THREE, scene, toon, grad, CT, L, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Heights'; scene.add(root);
  const sm = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const segP = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); return Math.hypot(x - a[0] - dx * u, z - a[1] - dz * u); };
  const lineD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) m = Math.min(m, segP(x, z, p[i], p[i + 1])); return m; };
  const inR = (r, x, z) => x >= r[0] && x <= r[1] && z >= r[2] && z <= r[3];
  const HL = L.HILLS.map(H => { const xs = H.c ? [H.c[0]] : [H.a[0], H.b[0]], zs = H.c ? [H.c[1]] : [H.a[1], H.b[1]];
    const bb = [Math.min(...xs) - H.r, Math.max(...xs) + H.r, Math.min(...zs) - H.r, Math.max(...zs) + H.r]; if (H.cliff) bb[1] = Math.min(bb[1], H.cliff.x + H.cliff.w + 1); return { ...H, bb }; });
  const HK = Object.fromEntries(HL.map(H => [H.key, H]));
  function hillH(H, x, z) {
    if (!inR(H.bb, x, z)) return 0; const d = H.c ? Math.hypot(x - H.c[0], z - H.c[1]) : segP(x, z, H.a, H.b); if (d >= H.r) return 0;
    const t = Math.max(0, (d - H.core) / (H.r - H.core)); let h = H.h * (1 - sm(t));
    h += H.h * 0.09 * t * (1 - t) * 4 * (Math.sin(x * 0.11 + H.h) * Math.cos(z * 0.09) + 0.5 * Math.sin((x + z) * 0.23));
    if (H.cliff) { const e = x - H.cliff.x; if (e > 0) h *= Math.max(0, 1 - e / H.cliff.w); }
    return Math.max(0, h); }
  function terrainAt(x, z) { let m = 0; for (const H of HL) { const v = hillH(H, x, z); if (v > m) m = v; } return m; }
  const trailD = (x, z) => Math.min(...L.TRAILS.map(t => lineD(x, z, t.p)));
  const colliders = [], platforms = [], lanterns = [], wild = [];
  const ink = toon('#201e1d'), wood = toon('#9a7550'), woodD = toon('#6f5236'), stone = toon('#bdb6ab'), red = toon('#ec3013'), white = toon('#f3f2f2');
  const box = (w, h, d, mat, x, y, z, ry = 0, par = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = !touch; m.receiveShadow = true; par.add(m); return m; };
  const cyl = (r0, r1, h, mat, x, y, z, n = 16, par = root) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, n), mat); m.position.set(x, y, z); m.castShadow = !touch; m.receiveShadow = true; par.add(m); return m; };

  // ---------- platforms (decks, pier): flat walk tops, rails on the closed sides ----------
  function platform(r, y, open, s = 'wood', rails = true, posts = true) {
    const P = { r, y, open, s }; platforms.push(P); const w = r[1] - r[0], d = r[3] - r[2], cx = (r[0] + r[1]) / 2, cz = (r[2] + r[3]) / 2;
    box(w, 0.3, d, wood, cx, y - 0.15, cz);
    for (let k = r[2] + 0.6; k < r[3]; k += 1.2) box(w, 0.04, 0.08, woodD, cx, y + 0.01, k);
    if (posts) for (const [px, pz] of [[r[0] + 0.3, r[2] + 0.3], [r[1] - 0.3, r[2] + 0.3], [r[0] + 0.3, r[3] - 0.3], [r[1] - 0.3, r[3] - 0.3]]) { const g = Math.min(terrainAt(px, pz), y) - (P.wet ? 2 : 0.2), hh = y - 0.08 - g; if (hh > 0.4) box(0.3, hh, 0.3, woodD, px, g + hh / 2, pz);   /* flicker pass: post tops stop under the deck */ }
    if (rails) { const side = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0); box(len, 0.1, 0.1, ink, (x0 + x1) / 2, y + 1.05, (z0 + z1) / 2, ry); const n = Math.max(1, Math.round(len / 1.6)); for (let i = 0; i <= n; i++) box(0.1, 1.05, 0.1, ink, x0 + (x1 - x0) * i / n, y + 0.52, z0 + (z1 - z0) * i / n); };
      if (!open.includes('N')) side(r[0], r[2], r[1], r[2]); if (!open.includes('S')) side(r[0], r[3], r[1], r[3]); if (!open.includes('W')) side(r[0], r[2], r[0], r[3]); if (!open.includes('E')) side(r[1], r[2], r[1], r[3]); }
    return P; }

  // ---------- terrain meshes (one per hill, vertex colours: grass, rock where steep, grit on trails) ----------
  const STEP = touch ? 2.5 : 1.6, cA = new THREE.Color(), cB = new THREE.Color();
  const tMat = new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true });
  for (const H of HL) { const [x0, x1, z0, z1] = H.bb, w = x1 - x0, d = z1 - z0, nx = Math.ceil(w / STEP), nz = Math.ceil(d / STEP);
    const g = new THREE.PlaneGeometry(w, d, nx, nz); g.rotateX(-Math.PI / 2); const pos = g.attributes.position, col = [];
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) + (x0 + x1) / 2, z = pos.getZ(i) + (z0 + z1) / 2, h = hillH(H, x, z);
      const sl = Math.hypot(hillH(H, x + 1, z) - hillH(H, x - 1, z), hillH(H, x, z + 1) - hillH(H, x, z - 1)) / 2;
      pos.setY(i, h > 0.01 ? h : -0.06);
      cA.set('#9fc27f').lerp(cB.set(H.wild ? '#8a9a5c' : '#7a9c5c'), Math.min(1, h / H.h));
      if (sl > 1.0) cA.lerp(cB.set('#8a8178'), Math.min(1, (sl - 1.0) * 3));
      if (h > 0.05 && trailD(x, z) < 1.8) cA.set('#c9b48a');
      if (H.plaza && Math.hypot(x - H.c[0], z - H.c[1]) < H.plaza + 0.6) cA.set('#cfcac3');
      col.push(cA.r, cA.g, cA.b); }
    g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, tMat); m.receiveShadow = true; m.castShadow = !touch; root.add(m); }

  // ---------- trails: lanterns every 9 m, alternating sides ----------
  for (const T of L.TRAILS) { let side = 1; for (let i = 0; i < T.p.length - 1; i++) { const [ax, az] = T.p[i], [bx, bz] = T.p[i + 1], len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
    for (let t = 4; t < len; t += 9) { const x = ax + (bx - ax) * t / len + nx * 2.2 * side, z = az + (bz - az) * t / len + nz * 2.2 * side; lanterns.push([x, terrainAt(x, z), z]); side = -side; } } }

  // ---------- falls: spring, stream over the plateau, waterfall off the cliff, plunge pool, stream to the lake, overlook deck ----------
  const waterM = new THREE.MeshPhongMaterial({ color: 0x4aa3d8, transparent: true, opacity: 0.85, shininess: 90, specular: 0xffffff });
  const ribbon = (pts, wd, mat) => { const v = [], idx = []; pts.forEach(([x, y, z], i) => { const [px, , pz] = pts[Math.max(0, i - 1)], [qx, , qz] = pts[Math.min(pts.length - 1, i + 1)], dx = qx - px, dz = qz - pz, l = Math.hypot(dx, dz) || 1, ox = -dz / l * wd / 2, oz = dx / l * wd / 2; v.push(x + ox, y, z + oz, x - ox, y, z - oz); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals(); const m = new THREE.Mesh(g, mat); m.material.side = THREE.DoubleSide; root.add(m); return m; };
  const fallTex = CT(64, 256, (g, w, h) => { g.fillStyle = '#7fc4ec'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.75)' : 'rgba(40,110,170,0.35)'; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 20 + Math.random() * 60); } });
  fallTex.wrapS = fallTex.wrapT = THREE.RepeatWrapping; fallTex.repeat.set(2, 2);
  let fallSheet = null, foam = null;
  { const F = HK.falls; if (F) { const fz = F.falls.z, cx = F.cliff.x, top = terrainAt(cx - 0.5, fz), spring = [F.c[0] - 12, fz];
    const pool = new THREE.Mesh(new THREE.CircleGeometry(3.6, 24), waterM); pool.rotation.x = -Math.PI / 2; pool.position.set(spring[0], terrainAt(...spring) + 0.1, spring[1]); root.add(pool);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + (i % 3) * 0.3), stone); r.position.set(spring[0] + Math.cos(a) * 4.2, terrainAt(spring[0] + Math.cos(a) * 4.2, spring[1] + Math.sin(a) * 4.2) + 0.3, spring[1] + Math.sin(a) * 4.2); root.add(r); }
    const pts = []; for (let x = spring[0] + 3; x <= cx; x += 1.5) { const z = fz + Math.sin(x * 0.2) * 1.2 * Math.min(1, (cx - x) / 8); pts.push([x, terrainAt(x, z) + 0.12, z]); } pts.push([cx + 2.4, top + 0.05, fz]);
    ribbon(pts, 2.6, waterM);
    fallSheet = new THREE.Mesh(new THREE.PlaneGeometry(3.2, top), new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide })); fallSheet.rotation.y = Math.PI / 2; fallSheet.position.set(cx + 2.5, top / 2, fz); root.add(fallSheet);
    const plunge = new THREE.Mesh(new THREE.CircleGeometry(8, 32), waterM); plunge.rotation.x = -Math.PI / 2; plunge.position.set(cx + 9, 0.07, fz); root.add(plunge);
    foam = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); foam.rotation.x = -Math.PI / 2; foam.position.set(cx + 2.8, 0.1, fz); root.add(foam);
    let shore = cx + 15; while (shore < 0 && !L.inLake(shore, fz)) shore += 1; const sp = []; for (let x = cx + 15; x <= shore + 3; x += 2) sp.push([x, 0.1, fz + Math.sin(x * 0.15) * 1.5]); if (sp.length > 1) ribbon(sp, 3, waterM);
    colliders.push({ c: [spring[0], spring[1], 3.6] });
    const dr = [cx - 6, cx + 2.5, fz - 18, fz - 10], dy = terrainAt(dr[0], (dr[2] + dr[3]) / 2) + 0.3; platform(dr, dy, 'W');
    for (let i = 0; i < 10; i++) { const z = fz - 28 + i * 6; if (Math.abs(z - fz) < 4 || (z > dr[2] - 2 && z < dr[3] + 2)) continue; const r = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4 + Math.random() * 1.6), stone); r.position.set(cx + 3.5 + Math.random() * 3, 0.6, z); r.rotation.set(Math.random(), Math.random(), 0); root.add(r); colliders.push({ c: [r.position.x, z, 1.6] }); } } }

  // ---------- Castle Ridge lookout: raised deck, rails N/E/W, Meru flag ----------
  let flag = null;
  { const R = HK.ridge; if (R && R.lookout) { const [lx, lz] = R.lookout, r = [lx - 5, lx + 5, lz - 5, lz + 5]; let top = 0; for (let x = r[0]; x <= r[1]; x += 2.5) for (let z = r[2]; z <= r[3]; z += 2.5) top = Math.max(top, terrainAt(x, z)); platform(r, top + 0.6, 'S');
    cyl(0.08, 0.1, 9, ink, lx - 4.4, top + 0.6 + 4.5, lz - 4.4, 8); flag = box(2.6, 1.5, 0.05, red, lx - 4.4 + 1.3, top + 0.6 + 8.1, lz - 4.4); } }

  // ---------- Hill Park summit: paved plaza, benches facing the skyline, lamps, a few trees, west railing ----------
  { const P = HK.park; if (P && P.plaza) { const [px, pz] = P.c, y = P.h, R = P.plaza, face = Math.atan2(-pz, -px);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 48), toon('#cfcac3')); disc.rotation.x = -Math.PI / 2; disc.position.set(px, y + 0.04, pz); disc.receiveShadow = true; root.add(disc);
    const rim = new THREE.Mesh(new THREE.RingGeometry(R, R + 0.6, 48), ink); rim.rotation.x = -Math.PI / 2; rim.position.set(px, y + 0.09, pz); root.add(rim);
    { const pts = []; for (let i = 0; i <= 24; i++) { const a = face - 0.75 + 1.5 * i / 24; pts.push(V(px + Math.cos(a) * (R - 0.3), y + 1.05, pz + Math.sin(a) * (R - 0.3))); } const rail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.06, 6), ink); root.add(rail); for (let i = 0; i <= 24; i += 2) { const p = pts[i]; box(0.08, 1.05, 0.08, ink, p.x, y + 0.52, p.z); } }
    for (const k of [-1, 1]) { const a = face + k * 0.5, x = px + Math.cos(a) * (R - 4), z = pz + Math.sin(a) * (R - 4); box(2.2, 0.12, 0.6, wood, x, y + 0.5, z, -a + Math.PI / 2); box(2.2, 0.5, 0.1, wood, x - Math.cos(a) * 0.3, y + 0.8, z - Math.sin(a) * 0.3, -a + Math.PI / 2); colliders.push({ c: [x, z, 1.0] }); }
    for (let i = 0; i < 6; i++) { const a = face + Math.PI / 6 + i * Math.PI / 3; lanterns.push([px + Math.cos(a) * (R - 0.8), y, pz + Math.sin(a) * (R - 0.8)]); }
    { const a0 = face + Math.PI * 0.9, x = px + Math.cos(a0) * 6, z = pz + Math.sin(a0) * 6; cyl(0.12, 0.15, 1.2, ink, x, y + 0.6, z, 8); const sc = box(0.9, 0.3, 0.3, red, x, y + 1.3, z, -face); sc.rotation.z = 0.2; } } }

  // ---------- trees on the hills + rocks on the wild ruins hills (instanced) ----------
  const decks = () => platforms.map(p => p.r);
  const treeOK = (x, z) => { const h = terrainAt(x, z); if (h < 1) return false; const sl = Math.hypot(terrainAt(x + 1, z) - terrainAt(x - 1, z), terrainAt(x, z + 1) - terrainAt(x, z - 1)) / 2; if (sl > 0.9 || trailD(x, z) < 4) return false;
    if (decks().some(r => x > r[0] - 3 && x < r[1] + 3 && z > r[2] - 3 && z < r[3] + 3)) return false; const P = HK.park; if (P && Math.hypot(x - P.c[0], z - P.c[1]) < P.plaza + 3) return false; const F = HK.falls; if (F && Math.abs(z - F.falls.z) < 5 && x < F.cliff.x + 2) return false; if (F && Math.hypot(x - F.c[0] + 12, z - F.falls.z) < 7) return false; return true; };
  const trees = []; for (let i = 0, N = touch ? 70 : 150; i < 6000 && trees.length < N; i++) { const H = HL[i % HL.length], x = H.bb[0] + Math.random() * (H.bb[1] - H.bb[0]), z = H.bb[2] + Math.random() * (H.bb[3] - H.bb[2]); if (Math.abs(x) < 448 && Math.abs(z) < 448 && treeOK(x, z)) trees.push([x, terrainAt(x, z), z, 0.8 + Math.random() * 0.7]); }
  { trees.forEach(([x, y, z, s]) => colliders.push({ c: [x, z, 0.45 * s] }));   // step 10 pass 3: pines with layered tiers, some oaks + birches (meru2-flora.js)
    root.add(plantTrees(trees.map(([x, y, z, s]) => { const r = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1; return [x, y - 0.1, z, s, r < 0.65 ? 'pine' : r < 0.82 ? 'broad' : 'birch']; }), { shadow: !touch }).group); }
  { const rocks = []; for (const H of HL.filter(q => q.wild)) for (let i = 0; i < (touch ? 10 : 18); i++) { const t = Math.random(), x = H.a[0] + (H.b[0] - H.a[0]) * t + (Math.random() - 0.5) * H.r * 1.2, z = H.a[1] + (H.b[1] - H.a[1]) * t + (Math.random() - 0.5) * H.r * 1.2, h = terrainAt(x, z); if (h > 0.5 && Math.abs(x) < 446) rocks.push([x, h, z, 0.8 + Math.random() * 1.8]); }
    for (const H of HL.filter(q => q.wild)) for (let i = 0; i < 4; i++) { const t = (i + 0.5) / 4, x = H.a[0] + (H.b[0] - H.a[0]) * t, z = H.a[1] + (H.b[1] - H.a[1]) * t; wild.push({ hill: H.key, x, z, y: terrainAt(x, z) }); }
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), inst = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), toon('#8a8178'), rocks.length);
    rocks.forEach(([x, y, z, s], i) => { M4.compose(V(x, y, z), Q.setFromEuler(E.set(Math.random(), Math.random() * 6, 0)), V(s, s * 0.7, s)); inst.setMatrixAt(i, M4); colliders.push({ c: [x, z, s * 0.8] }); }); inst.castShadow = !touch; root.add(inst); }

  // ---------- lighthouses: plinth, red/white tower, spiral stair outside, gallery, lamp room, rotating beam ----------
  const TURNS = 3, HT = 20, R0 = 2.6, R1 = 2.2, RIN = 2.75, ROUT = 4.6, PLR = 5.8, RISE = HT / (TURNS * Math.PI * 2), GAP = 1.1, TAU = Math.PI * 2;
  const glowTex = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,236,180,1)'); r.addColorStop(1, 'rgba(255,236,180,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const beamM = new THREE.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const LH = L.LIGHTHOUSES.map(D => {
    const [x0, z0] = D.at, y0 = D.island ? L.islandAt(x0, z0) + 0.3 : D.base, g = new THREE.Group(); g.position.set(x0, 0, z0); root.add(g);
    const mats = [white.clone(), red.clone()], lh = { D, x: x0, z: z0, y0, g, mats, fade: 0 };
    cyl(PLR, PLR + 0.4, y0 + 3, stone, 0, (y0 - 3) / 2, 0, 32, g);
    for (let i = 0; i < 5; i++) { const a = R0 + (R1 - R0) * i / 5, b = R0 + (R1 - R0) * (i + 1) / 5; const m = new THREE.Mesh(new THREE.CylinderGeometry(b, a, HT / 5, 28), mats[i % 2]); m.position.y = y0 + HT / 5 * (i + 0.5); m.castShadow = !touch; g.add(m); }
    const N = 72, stepG = new THREE.BoxGeometry(ROUT - RIN + 0.1, 0.24, 1.05), stepI = new THREE.InstancedMesh(stepG, stone, N + 26), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), up = V(0, 1, 0); let n = 0;
    for (let i = 0; i < N; i++) { const th = (i + 0.5) / N * TURNS * TAU, a = D.a0 + th, top = y0 + HT * (i + 1) / N, rm = (RIN + ROUT) / 2; M4.compose(V(Math.cos(a) * rm, top - 0.12, Math.sin(a) * rm), Q.setFromAxisAngle(up, -a), V(1, 1, 1)); stepI.setMatrixAt(n++, M4); }
    for (let i = 0; i < 26; i++) { const th = (i + 0.5) / 26 * (TAU - GAP), a = D.a0 + th, rm = (R1 + ROUT) / 2; M4.compose(V(Math.cos(a) * rm, y0 + HT - 0.12, Math.sin(a) * rm), Q.setFromAxisAngle(up, -a), V((ROUT - R1 + 0.1) / (ROUT - RIN + 0.1), 1, 1.12)); stepI.setMatrixAt(n++, M4); }
    stepI.count = n; stepI.castShadow = !touch; g.add(stepI);
    const pts = []; for (let i = 0; i <= 120; i++) { const th = i / 120 * TURNS * TAU, a = D.a0 + th; pts.push(V(Math.cos(a) * (ROUT - 0.05), y0 + RISE * th + 1.05, Math.sin(a) * (ROUT - 0.05))); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.06, 6), ink));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(ROUT - 0.05, 0.06, 6, 48), ink); ring.rotation.x = Math.PI / 2; ring.position.y = y0 + HT + 1.05; g.add(ring);
    const postI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 1.05, 0.07), ink, 60); let pn = 0;
    for (let i = 0; i < 36; i++) { const th = (i + 0.5) / 36 * TURNS * TAU, a = D.a0 + th; M4.makeTranslation(Math.cos(a) * (ROUT - 0.05), y0 + RISE * th + 0.52 - 0.15, Math.sin(a) * (ROUT - 0.05)); postI.setMatrixAt(pn++, M4); }
    for (let i = 0; i < 20; i++) { const a = D.a0 + i / 20 * TAU; M4.makeTranslation(Math.cos(a) * (ROUT - 0.05), y0 + HT + 0.52, Math.sin(a) * (ROUT - 0.05)); postI.setMatrixAt(pn++, M4); } postI.count = pn; g.add(postI);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 2.4, 16, 1, true), new THREE.MeshPhongMaterial({ color: 0xbfe3ff, transparent: true, opacity: 0.4, shininess: 100, side: THREE.DoubleSide })); glass.position.y = y0 + HT + 1.3; g.add(glass);
    cyl(1.8, 1.8, 0.2, ink, 0, y0 + HT + 0.1, 0, 16, g); cyl(0.1, 2.1, 1.6, red, 0, y0 + HT + 3.3, 0, 16, g); cyl(0.25, 0.25, 0.5, ink, 0, y0 + HT + 4.3, 0, 8, g);
    lh.lamp = new THREE.Mesh(new THREE.SphereGeometry(0.7, 14, 10), new THREE.MeshBasicMaterial({ color: 0xe9dfb8 })); lh.lamp.position.y = y0 + HT + 1.3; g.add(lh.lamp);
    lh.beam = new THREE.Group(); lh.beam.position.y = y0 + HT + 1.3; g.add(lh.beam); const bg = new THREE.ConeGeometry(7, 90, 20, 6, true); bg.translate(0, -45, 0); bg.rotateZ(Math.PI / 2);
    { const P = bg.attributes.position, col = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const u = Math.min(1, Math.hypot(P.getX(i), P.getY(i), P.getZ(i)) / 90), f = Math.pow(1 - u, 1.6); col.set([f, f, f], i * 3); } bg.setAttribute('color', new THREE.BufferAttribute(col, 3)); beamM.vertexColors = true; beamM.opacity = 0.2; }   // exterior polish: beam fades out along its length (no hard end disc)
    for (const r of [0, Math.PI]) { const b = new THREE.Mesh(bg, beamM); b.rotation.y = r; lh.beam.add(b); } lh.beam.visible = false;
    lh.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); lh.glow.scale.set(9, 9, 1); lh.glow.position.y = y0 + HT + 1.3; lh.glow.visible = false; g.add(lh.glow);
    colliders.push({ c: [x0, z0, R0] });
    if (D.pier) { const P = platform(D.pier.r, D.pier.y, 'NS', 'wood', true, false), r = D.pier.r; for (let z = r[2] + 2; z < r[3]; z += 4) for (const x of [r[0] + 0.25, r[1] - 0.25]) cyl(0.18, 0.18, D.pier.y + 2.5, woodD, x, (D.pier.y - 2.5) / 2, z, 8);
      for (let z = r[2] + 6; z < r[3] - 2; z += 10) lanterns.push([r[0] + 0.25, D.pier.y, z], [r[1] - 0.25, D.pier.y, z + 5]); }
    return lh; });
  const lhGround = (lh, x, z, y) => { const dx = x - lh.x, dz = z - lh.z, d = Math.hypot(dx, dz); if (d > PLR) return null; if (d < RIN || d > ROUT) return lh.y0;
    const th = ((Math.atan2(dz, dx) - lh.D.a0) % TAU + TAU) % TAU; let best = lh.y0; for (let k = 0; k < TURNS; k++) { const h = lh.y0 + RISE * (th + TAU * k); if (h <= y + 1.3 && h > best) best = h; }
    if (th <= TAU - GAP && lh.y0 + HT <= y + 1.3) best = Math.max(best, lh.y0 + HT); return best; };

  // ---------- lanterns (instanced) + night glow ----------
  const headM = new THREE.MeshBasicMaterial({ color: 0xd8cfb8 });
  const lpost = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 2.4, 0.12).translate(0, 1.2, 0), ink, lanterns.length), lhead = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.42, 0.34).translate(0, 2.6, 0), headM, lanterns.length);
  { const M4 = new THREE.Matrix4(); lanterns.forEach(([x, y, z], i) => { M4.makeTranslation(x, y, z); lpost.setMatrixAt(i, M4); lhead.setMatrixAt(i, M4); if (y < 1.5 || !platforms.some(p => inR(p.r, x, z))) colliders.push({ c: [x, z, 0.15] }); }); root.add(lpost, lhead); }
  const glows = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lanterns.flatMap(([x, y, z]) => [x, y + 2.6, z]), 3)), new THREE.PointsMaterial({ map: glowTex, size: 4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glows.visible = false; root.add(glows);

  // ---------- walk contract ----------
  const platAt = (x, z, y) => { for (const p of platforms) if (inR(p.r, x, z) && y > p.y - 1.5) return p; return null; };
  function groundAt(x, z, y) { for (const lh of LH) { const g = lhGround(lh, x, z, y); if (g != null) return g; } const p = platAt(x, z, y); if (p) return p.y; const t = terrainAt(x, z); return t > 0.02 ? t : null; }
  function clamp(x, z, nx, nz, y, wx = nx - x, wz = nz - z) {
    for (const lh of LH) { const d0 = Math.hypot(x - lh.x, z - lh.z), d1 = Math.hypot(nx - lh.x, nz - lh.z); if (d1 > PLR + 1) continue;
      if (y > lh.y0 + 0.12 && d0 <= ROUT + 0.2) { // on the stair / gallery: steer along the rail (push in = climb, push out = go down)
        const mx = wx, mz = wz, ml = Math.hypot(mx, mz); let yaw; if (ml > 1e-5 && d0 > 0.1) { const rx = (x - lh.x) / d0, rz = (z - lh.z) / d0, tx = -rz, tz = rx, mt = mx * tx + mz * tz, mr = mx * rx + mz * rz;
          if (Math.abs(mt) < 0.6 * ml) { const s = mr < 0 ? 1 : -1; nx = x + tx * ml * s; nz = z + tz * ml * s; yaw = Math.atan2(tx * s, tz * s); } else { nx = x + mx; nz = z + mz; } }
        const e = Math.hypot(nx - lh.x, nz - lh.z), lim = Math.max(R0 + 0.45, Math.min(ROUT - 0.3, e)); if (e > 1e-4 && lim !== e) { const k = lim / e; nx = lh.x + (nx - lh.x) * k; nz = lh.z + (nz - lh.z) * k; } return { x: nx, z: nz, yaw }; }
      if (d1 >= RIN && d1 <= ROUT + 0.2) { const th = ((Math.atan2(nz - lh.z, nx - lh.x) - lh.D.a0) % TAU + TAU) % TAU, h0 = lh.y0 + RISE * th; if (h0 - y > 1.2 && h0 - y < 2.8) return { x, z }; } }
    for (const p of platforms) { if (Math.abs(y - p.y) > 0.35 || !inR(p.r, x, z) || inR(p.r, nx, nz)) continue; const r = p.r;
      if (nx < r[0] && !p.open.includes('W')) nx = r[0] + 0.02; if (nx > r[1] && !p.open.includes('E')) nx = r[1] - 0.02; if (nz < r[2] && !p.open.includes('N')) nz = r[2] + 0.02; if (nz > r[3] && !p.open.includes('S')) nz = r[3] - 0.02; return { x: nx, z: nz }; }
    const h0 = terrainAt(x, z); if (Math.abs(y - h0) < 0.4 && !platAt(nx, nz, y)) { const steep = (ax, az) => { const dd = Math.hypot(ax - x, az - z); return dd > 1e-4 && (terrainAt(ax, az) - h0) / dd > 1.35; };
      if (steep(nx, nz)) { if (!steep(nx, z)) return { x: nx, z }; if (!steep(x, nz)) return { x, z: nz }; return { x, z }; } }
    return { x: nx, z: nz }; }
  function surfaceAt(x, z, y) { for (const lh of LH) if (Math.hypot(x - lh.x, z - lh.z) <= PLR && y > lh.y0 - 0.3) return 'stone'; const p = platAt(x, z, y); if (p && Math.abs(y - p.y) < 0.4) return p.s;
    const t = terrainAt(x, z); if (t < 0.05) return null; const P = HK.park; if (P && Math.hypot(x - P.c[0], z - P.c[1]) < P.plaza) return 'stone'; return trailD(x, z) < 1.8 ? 'grit' : 'grass'; }
  const camAt = p => { for (const l of LH) { const d = Math.hypot(p.x - l.x, p.z - l.z); if (p.y > l.y0 + 0.12 && d < ROUT + 0.5 && d > 0.1) return { yaw: Math.atan2((p.x - l.x) / d, (p.z - l.z) / d) }; } return null; };
  const onTerrain = (x, z, y) => { const p = platAt(x, z, y); if (p) return Math.abs(y - p.y) < 0.5; const t = terrainAt(x, z); return t > 0.3 && Math.abs(y - t) < 0.6; };
  const outdoor = (x, z, y) => { const g = groundAt(x, z, y); return g != null && Math.abs(g - y) < 0.6; };
  const carBlock = (x, z) => terrainAt(x, z) > 0.35 || platforms.some(p => x > p.r[0] - 1.2 && x < p.r[1] + 1.2 && z > p.r[2] - 1.2 && z < p.r[3] + 1.2) || LH.some(l => Math.hypot(x - l.x, z - l.z) < PLR + 1.2);

  let night = false, t = 0;
  function setNight(on) { night = on; glows.visible = on; headM.color.set(on ? 0xffe2a0 : 0xd8cfb8); for (const l of LH) { l.beam.visible = l.glow.visible = on; l.lamp.material.color.set(on ? 0xfff4c8 : 0xe9dfb8); } }
  function tick(dt) { t += dt; fallTex.offset.y = (fallTex.offset.y + dt * 1.6) % 1; if (foam) foam.scale.setScalar(1 + Math.sin(t * 6) * 0.08); if (flag) flag.rotation.y = Math.sin(t * 2.2) * 0.25;
    const p = api.player; for (const l of LH) { l.beam.rotation.y = t * 0.7; const want = p && p.y > l.y0 + 1 && Math.hypot(p.x - l.x, p.z - l.z) < 7 ? 1 : 0; l.fade += (want - l.fade) * Math.min(1, dt * 6);
      for (const m of l.mats) { const o = 1 - l.fade * 0.65; m.transparent = o < 0.99; m.opacity = o; m.depthWrite = o >= 0.99; } } }
  const api = { groundAt, clamp, camAt, terrainAt, surfaceAt, onTerrain, outdoor, carBlock, colliders, wild, lighthouses: LH.map(l => ({ key: l.D.key, label: l.D.label, x: l.x, z: l.z, top: l.y0 + HT })), setNight, tick, player: null,
    stats: { hills: HL.length, trees: trees.length, lanterns: lanterns.length, lighthouses: LH.length, decks: platforms.length } };
  return api;
}
