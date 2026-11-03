// MERU 2.0 — exterior polish round 6: LAKE PATH + SHORE. Timber edging along the Lake Path; a railed VIEWING DECK where the boardwalk
// meets the water (two benches, a red coin telescope aimed at Pearl Island, a lifebuoy, two lanterns lit at night); a BEACH SET on the
// sand either side (striped umbrellas + loungers + towels), a LIFEGUARD TOWER (west), a KAYAK RACK (east), driftwood; a SWIM AREA line of
// red / white floats in the water off the deck (bobbing). Decoration only, no new people or lines. ~4 draws: every static piece is one
// merged vertex-coloured toon mesh, + lantern heads, glow points, floats. Colliders pushed into city.colliders before the grass bake.
export function buildLakeShore({ THREE, scene, L, city, toon, touch }) {
  const root = new THREE.Group(); root.name = 'meru2LakeShore'; scene.add(root); const C = city.colliders, parts = [], lamps = [];
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), col = new THREE.Color();
  let seed = 61; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
  const WOOD = '#9a7550', WOODD = '#6e5236', WHITE = '#f3f2f2', RED = '#ec3013', INK = '#201e1d', NAVY = '#2e4a6b', MUST = '#e0a020';
  const shoreZ = x => { for (let z = 200; z < 300; z += 0.25) if (L.inLake(x, z)) return z; return 240; };
  const near = (x, z, r) => C.some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false) || L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 2.5) || L.BUILDINGS.some(b => x > b.f[0] - r && x < b.f[1] + r && z > b.f[2] - r && z < b.f[3] + r);
  // one part: geometry, colour (hex or (triIndex, centroid) => hex), base frame (bx, bz, bry), local offset + rotation
  const part = (geo, c, bx, bz, bry, lx, ly, lz, rx = 0, ry = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); if (g.attributes.uv) g.deleteAttribute('uv'); if (g.attributes.uv1) g.deleteAttribute('uv1');
    const P = g.attributes.position, n = P.count, a = new Float32Array(n * 3);
    for (let t = 0; t < n; t += 3) { const h = typeof c === 'function' ? c(t / 3, (P.getX(t) + P.getX(t + 1) + P.getX(t + 2)) / 3, (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3, (P.getZ(t) + P.getZ(t + 1) + P.getZ(t + 2)) / 3) : c; col.set(h); for (let k = 0; k < 3; k++) a.set([col.r, col.g, col.b], (t + k) * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    const base = new THREE.Matrix4().compose(V(bx, 0, bz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, bry, 0)), V(1, 1, 1)), loc = new THREE.Matrix4().compose(V(lx, ly, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1));
    g.applyMatrix4(base.multiply(loc)); parts.push(g); };
  const flip = g => { g = g.toNonIndexed(); const P = g.attributes.position.array, N = g.attributes.normal.array; for (let i = 0; i < P.length; i += 9) for (const A of [P, N]) for (let k = 0; k < 3; k++) { const t = A[i + 3 + k]; A[i + 3 + k] = A[i + 6 + k]; A[i + 6 + k] = t; } for (let i = 0; i < N.length; i++) N[i] = -N[i]; return g; };
  const rect = (x0, x1, z0, z1) => C.push({ f: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] });
  const W = (bx, bz, bry, lx, lz) => [bx + Math.cos(bry) * lx + Math.sin(bry) * lz, bz - Math.sin(bry) * lx + Math.cos(bry) * lz];

  // ---------- LAKE PATH: timber edging boards both sides of the walk (no colliders, you step over them) ----------
  for (let z = 147; z <= 210; z += 2) for (const sx of [-1, 1]) { const x = sx * 3.0; if (near(x, z, 0.3)) continue; part(B(0.08, 0.1, 1.94), WOODD, x, z, 0, 0, 0.05, 0); }

  // ---------- VIEWING DECK at the end of the boardwalk ----------
  const hw = 4.6, d0 = 237.95, d1 = Math.max(240.2, Math.min(shoreZ(0) - 0.7, 244));
  for (let z = d0 + 0.15; z < d1 - 0.1; z += 0.31) part(B(hw * 2 - 0.1, 0.07, 0.27), new THREE.Color().setHSL(0.08 + rnd() * 0.02, 0.32 + rnd() * 0.1, 0.42 + rnd() * 0.1).getHex(), (rnd() - 0.5) * 0.06, z, 0, 0, 0.05 + rnd() * 0.012, 0);
  for (const sx of [-1, 1]) part(B(0.16, 0.1, d1 - d0), WOODD, sx * (hw - 0.08), (d0 + d1) / 2, 0, 0, 0.04, 0);
  part(B(hw * 2, 0.1, 0.16), WOODD, 0, d1 - 0.08, 0, 0, 0.04, 0);
  const railLine = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(len / 1.5)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) part(B(0.12, 1.0, 0.12), WOODD, x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n, 0, 0, 0.55, 0);
    for (const [y, h] of [[1.06, 0.08], [0.6, 0.06]]) part(B(0.1, h, len), y > 1 ? WOOD : WOODD, (x0 + x1) / 2, (z0 + z1) / 2, ry, 0, y, 0);
    rect(x0 - 0.12, x1 + 0.12, z0 - 0.12, z1 + 0.12); };
  railLine(-hw, d1 - 0.1, hw, d1 - 0.1); for (const sx of [-1, 1]) { railLine(sx * hw, d0, sx * hw, d1 - 0.1); railLine(sx * hw, d0, sx * 2.65, d0); }
  const FK = 1.35, SK = g => g.scale(FK, FK, FK);   // s174 FOX SCALE (seat 0.62 m)
  for (const sx of [-1, 1]) { const bx = sx * 2.7, bz = d0 + 0.95;   // benches face the water
    for (let k = 0; k < 3; k++) part(SK(B(1.6, 0.05, 0.13)), WOOD, bx, bz, 0, 0, 0.46 * FK, (-0.16 + k * 0.16) * FK);
    for (let k = 0; k < 2; k++) part(SK(B(1.6, 0.12, 0.04)), WOOD, bx, bz, 0, 0, (0.72 + k * 0.17) * FK, (-0.27 - k * 0.03) * FK, -0.18);
    for (const ox of [-0.7, 0.7]) { part(SK(B(0.06, 0.44, 0.42)), INK, bx, bz, 0, ox * FK, 0.24 * FK, 0); part(SK(B(0.06, 0.5, 0.05)), INK, bx, bz, 0, ox * FK, 0.72 * FK, -0.28 * FK, -0.18); }
    rect(bx - 1.15, bx + 1.15, bz - 0.47, bz + 0.4); }
  { const tz = d1 - 0.6, aim = Math.atan2(L.ISLAND.pond.x - 0, L.ISLAND.pond.z - tz);   // coin telescope, aimed at Pearl Island
    part(Cy(0.07, 0.1, 1.1), INK, 0, tz, 0, 0, 0.55, 0); part(Cy(0.2, 0.24, 0.06, 12), INK, 0, tz, 0, 0, 0.04, 0);
    part(B(0.3, 0.22, 0.12), INK, 0, tz, aim, 0, 1.16, 0); part(Cy(0.1, 0.13, 0.75, 12).rotateX(Math.PI / 2), RED, 0, tz, aim, 0, 1.3, 0.05, -0.12);
    part(Cy(0.135, 0.135, 0.06, 12).rotateX(Math.PI / 2), INK, 0, tz, aim, 0, 1.345, 0.42, -0.12); part(Cy(0.04, 0.05, 0.14, 8).rotateX(Math.PI / 2), INK, 0, tz, aim, 0, 1.255, -0.36, -0.12);
    C.push({ c: [0, tz, 0.3] }); }
  { const lx = hw + 0.12, lz = (d0 + d1) / 2;   // lifebuoy on the east rail, red + white quarters
    part(B(0.06, 0.95, 0.5), WOODD, lx, lz, 0, 0, 0.95, 0);
    part(new THREE.TorusGeometry(0.3, 0.075, 8, 24), (i, cx, cy) => (Math.floor((Math.atan2(cy, cx) + Math.PI) / (Math.PI / 2) + 0.5) % 2 ? WHITE : RED), lx + 0.1, lz, Math.PI / 2, 0, 1.0, 0); }
  for (const sx of [-1, 1]) { const x = sx * hw, z = d1 - 0.1; part(B(0.14, 2.3, 0.14), WOODD, x, z, 0, 0, 1.15, 0); part(new THREE.ConeGeometry(0.28, 0.24, 4), INK, x, z, 0, 0, 2.62, 0, 0, Math.PI / 4); lamps.push([x, 2.36, z]); }

  // ---------- BEACH SETS: striped umbrella, two loungers, a towel ----------
  const SETS = [[RED, WHITE], [NAVY, WHITE], [MUST, WHITE]]; let si = 0;
  for (const x0 of [-45, -12, 13, 25, 38]) { const x = x0 + (rnd() - 0.5) * 2, z = shoreZ(x) - 10 + (rnd() - 0.5) * 2; if (near(x, z, 2.6)) continue; const [a, b] = SETS[si++ % 3], ry = (rnd() - 0.5) * 0.5;
    const stripe = (i, cx, cy, cz) => (Math.floor((Math.atan2(cz, cx) + Math.PI) / (Math.PI / 6)) % 2 ? b : a), cone = new THREE.ConeGeometry(1.55, 0.55, 12, 1, true);
    part(Cy(0.035, 0.035, 2.45, 6), WHITE, x, z, ry, 0, 1.22, 0, 0, 0, 0.06); part(cone, stripe, x, z, ry, 0.13, 2.3, 0, 0, 0, 0.06); part(flip(cone), stripe, x, z, ry, 0.13, 2.29, 0, 0, 0, 0.06); part(new THREE.SphereGeometry(0.07, 6, 4), INK, x, z, ry, 0.15, 2.6, 0);
    C.push({ c: [x, z, 0.15] });
    for (const sx of [-1, 1]) { const lx = sx * 1.05, lz = 0.2;
      part(B(0.62, 0.07, 1.75), WHITE, x, z, ry, lx, 0.32, lz); for (const ox of [-0.26, 0.26]) for (const oz of [-0.75, 0.75]) part(Cy(0.025, 0.025, 0.3, 5), INK, x, z, ry, lx + ox, 0.15, lz + oz);
      part(B(0.58, 0.06, 1.1), a, x, z, ry, lx, 0.39, lz + 0.3); part(B(0.58, 0.07, 0.7), a, x, z, ry, lx, 0.62, lz - 0.68, 0.7);
      const [cx, cz] = W(x, z, ry, lx, lz); C.push({ c: [cx, cz - 0.4, 0.4] }, { c: [cx, cz + 0.45, 0.4] }); }
    if (rnd() < 0.7) part(B(0.8, 0.02, 1.6), b === WHITE ? a : b, x, z, ry + (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.6, 0.045, 2.3); }

  // ---------- LIFEGUARD TOWER (west of the deck), facing the water ----------
  { const x = -31, z = shoreZ(-31) - 8.5; if (!near(x, z, 1.5)) {
    for (const ox of [-0.9, 0.9]) for (const oz of [-0.9, 0.9]) part(B(0.14, 2.35, 0.14), WHITE, x, z, 0, ox, 1.17, oz);
    for (const ox of [-0.9, 0.9]) part(B(0.07, 2.6, 0.07), WHITE, x, z, 0, ox, 1.15, 0, 0.66);
    part(B(0.07, 2.6, 0.07), WHITE, x, z, 0, 0, 1.15, 0.9, 0, 0, 0.66);
    part(B(2.3, 0.12, 2.3), WOOD, x, z, 0, 0, 2.38, 0);
    part(B(2.3, 0.08, 0.08), WHITE, x, z, 0, 0, 3.0, 1.12); for (const ox of [-1.12, 1.12]) part(B(0.08, 0.08, 2.3), WHITE, x, z, 0, ox, 3.0, 0);
    part(B(2.3, 0.5, 0.04), RED, x, z, 0, 0, 2.7, 1.14);
    part(B(0.62, 0.07, 0.6), WHITE, x, z, 0, 0, 2.9, 0.1); part(B(0.62, 0.6, 0.07), RED, x, z, 0, 0, 3.22, -0.2, -0.1); for (const ox of [-0.28, 0.28]) part(B(0.05, 0.48, 0.05), INK, x, z, 0, ox, 2.66, 0.1);
    for (const ox of [-1.1, 1.1]) for (const oz of [-1.1, 1.1]) part(B(0.07, 1.95, 0.07), INK, x, z, 0, ox, 3.4, oz);
    part(B(2.7, 0.1, 2.7), RED, x, z, 0, 0, 4.4, 0); part(B(2.75, 0.06, 2.75), WHITE, x, z, 0, 0, 4.48, 0);
    part(Cy(0.03, 0.03, 1.5, 5), INK, x, z, 0, 1.25, 5.2, 1.25); part(B(0.62, 0.22, 0.02), RED, x, z, 0, 1.56, 5.75, 1.25); part(B(0.62, 0.22, 0.02), MUST, x, z, 0, 1.56, 5.53, 1.25);
    for (const ox of [-0.32, 0.32]) part(B(0.07, 2.75, 0.07), WOOD, x, z, 0, ox, 1.22, -1.55, 0.45);
    for (let k = 1; k < 8; k++) { const t = k / 8; part(B(0.62, 0.05, 0.1), WOOD, x, z, 0, 0, t * 2.4, -2.13 + t * 1.15); }
    part(B(0.48, 0.08, 2.2), RED, x, z, 0, 0.55, 1.05, 1.55, -1.15); part(B(0.5, 0.02, 2.0), WHITE, x, z, 0, 0.55, 1.07, 1.56, -1.15);
    rect(x - 1.1, x + 1.1, z - 2.2, z + 1.1); rect(x + 0.2, x + 0.9, z + 1.1, z + 2.0); } }

  // ---------- KAYAK RACK (east, toward the boathouse) ----------
  { const x = 46, z = shoreZ(46) - 13, ry = 0.25; if (!near(x, z, 2)) {
    for (const ox of [-1.15, 1.15]) for (const sz of [-1, 1]) part(B(0.1, 1.65, 0.1), WOODD, x, z, ry, ox, 0.78, sz * 0.33, -sz * 0.32);
    for (const [y, oz] of [[0.5, 0.42], [1.05, 0.22]]) for (const sz of [-1, 1]) part(B(2.5, 0.08, 0.08), WOOD, x, z, ry, 0, y, sz * oz);
    const kay = new THREE.IcosahedronGeometry(1, 1).scale(1.75, 0.16, 0.33);
    for (const [y, oz, c] of [[0.66, 0.42, RED], [0.66, -0.42, MUST], [1.2, 0.24, NAVY]]) { part(kay, c, x, z, ry, 0, y, oz); part(B(0.5, 0.05, 0.28), INK, x, z, ry, 0.2, y + 0.13, oz); }
    const [a0, b0] = W(x, z, ry, -1.3, 0), [a1, b1] = W(x, z, ry, 1.3, 0); C.push({ c: [a0, b0, 0.6] }, { c: [(a0 + a1) / 2, (b0 + b1) / 2, 0.7] }, { c: [a1, b1, 0.6] }); } }

  // ---------- DRIFTWOOD + stones near the waterline ----------
  for (const x0 of [-54, 9, 31]) { const x = x0, z = shoreZ(x) - 4.5 - rnd() * 2, ry = rnd() * Math.PI; if (near(x, z, 1.4)) continue;
    part(Cy(0.17, 0.24, 2.6, 7).rotateZ(Math.PI / 2), '#8f8577', x, z, ry, 0, 0.18, 0); part(Cy(0.05, 0.08, 0.8, 5), '#8f8577', x, z, ry, 0.5, 0.35, 0.18, 0.9, 0, 0.4);
    for (let k = 0; k < 3; k++) part(new THREE.DodecahedronGeometry(0.16 + rnd() * 0.14, 0).scale(1, 0.6, 1), '#9b958c', x, z, ry, -1.6 - rnd() * 0.8, 0.06, (rnd() - 0.5) * 1.2);
    const [a0, b0] = W(x, z, ry, -0.9, 0), [a1, b1] = W(x, z, ry, 0.9, 0); C.push({ c: [a0, b0, 0.3] }, { c: [a1, b1, 0.3] }); }

  // ---------- merge statics: one vertex-coloured toon mesh ----------
  { let n = 0; for (const g of parts) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); cl.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(cl, 3)); G.computeBoundingSphere();
    const m = new THREE.Mesh(G, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toon('#ffffff').gradientMap })); m.castShadow = !touch; m.receiveShadow = true; root.add(m); }

  // ---------- lantern heads + night glow ----------
  const lanM = new THREE.MeshBasicMaterial({ color: 0x8a7a5a }), lI = new THREE.InstancedMesh(B(0.3, 0.36, 0.3), lanM, lamps.length), M4 = new THREE.Matrix4();
  lamps.forEach(([x, y, z], i) => { M4.makeTranslation(x, y, z); lI.setMatrixAt(i, M4); }); root.add(lI);
  const gc = document.createElement('canvas'); gc.width = gc.height = 64; { const g = gc.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,214,140,1)'); r.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lamps.flat(), 3)), new THREE.PointsMaterial({ map: new THREE.CanvasTexture(gc), size: 2.6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; root.add(glow);

  // ---------- SWIM AREA: a U of floats off the deck (legs from the shallows out, a front line ~20 m out), yellow corner markers ----------
  const fl = []; { const zc = shoreZ(0), X = 34, front = x => zc + 20 + 0.004 * x * x, pts = [];
    for (const sx of [-1, 1]) { const x = sx * X, za = shoreZ(x) + 5, zb = front(x), n = Math.max(1, Math.round((zb - za) / 1.7)); for (let i = 0; i < n; i++) pts.push([x, za + (zb - za) * i / n, i === 0]); }
    for (let x = -X; x <= X + 0.01; x += 1.7) pts.push([x, front(x), Math.abs(Math.abs(x) - X) < 0.5]);
    for (const [x, z, mk] of pts) if (L.inLake(x, z)) fl.push({ x, z, s: mk ? 2.4 : 1, c: mk ? MUST : (Math.round(x / 1.7 + z / 1.7) % 2 ? WHITE : RED), ph: x * 0.25 + z * 0.1 }); }
  const fI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6).scale(1, 0.75, 1), new THREE.MeshLambertMaterial(), Math.max(1, fl.length)); fI.count = fl.length;
  const Qf = new THREE.Quaternion(), Sf = V(), Pf = V(); fl.forEach((f, i) => fI.setColorAt(i, col.set(f.c))); root.add(fI);
  const placeFloats = t => { fl.forEach((f, i) => { Pf.set(f.x, 0.1 + Math.sin(t * 1.5 + f.ph) * 0.05, f.z); Sf.setScalar(f.s); M4.compose(Pf, Qf, Sf); fI.setMatrixAt(i, M4); }); fI.instanceMatrix.needsUpdate = true; };
  placeFloats(0);

  let far = false;
  return { colliders: [], setNight(on) { lanM.color.set(on ? 0xffd68c : 0x8a7a5a); glow.visible = on; },
    tick(cam, now = performance.now()) { const f = Math.hypot(cam.x, cam.z - 235) > (touch ? 140 : 220); if (f !== far) { far = f; root.visible = !f; } if (!far) placeFloats(now / 1000); } };
}
