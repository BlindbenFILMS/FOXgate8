// MERU 2.0 — exterior polish round 8: SKATE PARK + TANK WORKS YARD (built + ticked by worlds/meru2-yards.js, walk mode only).
// SKATE PARK: slatted benches + bins along the inside of the north + south fences (facing in), painted GROUND TAGS on the flat concrete
// (atlas, 1 draw), a drinks fountain + a board-shop crate pile by the gate. TANK WORKS YARD: a concrete APRON at the Tank Works door
// with hazard edging, TREAD MARKS in the dirt from the door to the range tank + the hangar, a line of jersey barriers, oil drums, tyre
// stacks, a fuel bowser, a CAMO NET over a supply pile between the Works and the hangar, a floodlight lit at night.
// Decoration only. Statics = one merged vertex-coloured toon mesh + tags + glow (3 draws). Colliders into the walk's shared cols.
export function buildYardDress({ THREE, scene, L, toon, touch, cols, parkH }) {
  const root = new THREE.Group(); root.name = 'meru2YardDress'; scene.add(root); const parts = [], col = new THREE.Color(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  let seed = 4242; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
  const WOOD = '#9a7550', INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', STEEL = '#8a9099', OLIVE = '#5b6b3a', CONC = '#c9c4bc', TYRE = '#2a2826';
  const part = (geo, c, bx, by, bz, bry = 0, lx = 0, ly = 0, lz = 0, rx = 0, ry = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of ['uv', 'uv1']) if (g.attributes[k]) g.deleteAttribute(k);
    const P = g.attributes.position, n = P.count, a = new Float32Array(n * 3);
    for (let t = 0; t < n; t += 3) { const h = typeof c === 'function' ? c((P.getX(t) + P.getX(t + 1) + P.getX(t + 2)) / 3, (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3, (P.getZ(t) + P.getZ(t + 1) + P.getZ(t + 2)) / 3) : c; col.set(h); for (let k = 0; k < 3; k++) a.set([col.r, col.g, col.b], (t + k) * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    g.applyMatrix4(new THREE.Matrix4().compose(V(bx, by, bz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, bry, 0)), V(1, 1, 1)).multiply(new THREE.Matrix4().compose(V(lx, ly, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1)))); parts.push(g); };
  const ring = (x, z, r) => cols.push({ c: [x, z, r] }), box = (x0, x1, z0, z1) => cols.push({ f: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] });
  const W = (bx, bz, bry, lx, lz) => [bx + Math.cos(bry) * lx + Math.sin(bry) * lz, bz - Math.sin(bry) * lx + Math.cos(bry) * lz];
  const near = (x, z, r) => cols.some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false) || L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 2.5);
  const flat = (x, z, r) => { for (const [ox, oz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) { const h = parkH(x + ox, z + oz); if (h != null && h > 0.02) return false; } return true; };
  const bench = (x, z, ry) => { for (let k = 0; k < 3; k++) part(B(1.6, 0.05, 0.13), WOOD, x, 0, z, ry, 0, 0.46, -0.16 + k * 0.16);
    for (let k = 0; k < 2; k++) part(B(1.6, 0.12, 0.04), WOOD, x, 0, z, ry, 0, 0.72 + k * 0.17, -0.27 - k * 0.03, -0.18);
    for (const ox of [-0.7, 0.7]) { part(B(0.06, 0.44, 0.42), INK, x, 0, z, ry, ox, 0.24, 0); part(B(0.06, 0.5, 0.05), INK, x, 0, z, ry, ox, 0.72, -0.28, -0.18); }
    const [a, b] = W(x, z, ry, -0.5, 0), [c, d] = W(x, z, ry, 0.5, 0); ring(a, b, 0.45); ring(c, d, 0.45); };
  const bin = (x, z) => { part(Cy(0.26, 0.24, 0.85, 10), INK, x, 0.43, z); part(Cy(0.28, 0.28, 0.06, 10), RED, x, 0.88, z); ring(x, z, 0.3); };

  // =============================== SKATE PARK ===============================
  const SP = L.YARDS.skate, [sx0, sx1, sz0, sz1] = SP.rect;
  if (!SP.course) {   // s151: the small yard is gone (Tony's Park dresses itself)
  { const placed = []; for (const [z, ry] of [[sz0 + 1.6, 0], [sz1 - 1.6, Math.PI]]) for (let x = sx0 + 4; x < sx1 - 3; x += 7 + rnd() * 3) {
      if (Math.abs(x - (SP.openS[0] + SP.openS[1]) / 2) < (SP.openS[1] - SP.openS[0]) / 2 + 2 && z < 0) continue;
      if (!flat(x, z, 1.4) || near(x, z, 1.3)) continue; bench(x, z, ry); placed.push([x, z]); if (placed.length % 2 === 0 && flat(x + 1.4, z, 0.4) && !near(x + 1.4, z, 0.4)) bin(x + 1.4, z); } }
  { const x = sx1 - 2.2, z = 10; if (flat(x, z, 0.8) && !near(x, z, 0.6)) { part(Cy(0.22, 0.28, 1.0, 10), STEEL, x, 0.5, z); part(B(0.5, 0.12, 0.4), STEEL, x, 1.05, z); part(Cy(0.03, 0.03, 0.12, 6), INK, x, 1.15, z + 0.08); ring(x, z, 0.3); } }   // drinks fountain by the gate
  // ground tags: 2 × 2 atlas of bold painted marks, laid flat on open concrete
  { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.lineCap = g.lineJoin = 'round';
    const cell = (i, fn) => { g.save(); g.translate((i % 2) * 256 + 128, Math.floor(i / 2) * 256 + 128); fn(); g.restore(); };
    cell(0, () => { g.strokeStyle = '#ec3013'; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.stroke(); g.fillStyle = '#ffd23a'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 26 : 62; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); });
    cell(1, () => { g.strokeStyle = '#38bdf8'; g.lineWidth = 26; g.beginPath(); g.moveTo(-100, 40); for (let k = 0; k < 5; k++) g.lineTo(-60 + k * 40, k % 2 ? 40 : -40); g.stroke(); g.strokeStyle = '#f3f2f2'; g.lineWidth = 8; g.stroke(); });
    cell(2, () => { g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(-100, -26); g.lineTo(30, -26); g.lineTo(30, -70); g.lineTo(105, 0); g.lineTo(30, 70); g.lineTo(30, 26); g.lineTo(-100, 26); g.closePath(); g.fill(); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.stroke(); });
    cell(3, () => { for (let k = 0; k < 3; k++) { g.strokeStyle = ['#ec3013', '#f3f2f2', '#201e1d'][k]; g.lineWidth = 18; g.beginPath(); g.arc(0, 0, 100 - k * 30, 0.3, Math.PI * 1.7); g.stroke(); } });
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; const P = [], U = [];
    let n = 0; for (let k = 0; k < 60 && n < 7; k++) { const x = sx0 + 5 + rnd() * (sx1 - sx0 - 10), z = sz0 + 5 + rnd() * (sz1 - sz0 - 10), s = 3.6 + rnd() * 1.6; if (Math.abs(z) < 8.5 || !flat(x, z, s * 0.6) || near(x, z, s * 0.4)) continue;
      const i = n % 4, u0 = (i % 2) * 0.5, v0 = 0.5 - Math.floor(i / 2) * 0.5, a = rnd() * 6.28, cs = Math.cos(a) * s / 2, sn = Math.sin(a) * s / 2, cr = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([p, q]) => [x + p * cs - q * sn, z + p * sn + q * cs]), uv = [[u0, v0], [u0 + 0.5, v0], [u0 + 0.5, v0 + 0.5], [u0, v0 + 0.5]];
      for (const j of [0, 2, 1, 0, 3, 2]) { P.push(cr[j][0], 0.035, cr[j][1]); U.push(...uv[j]); } n++; }
    if (P.length) { const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); G.computeVertexNormals();
      const m = new THREE.Mesh(G, new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.82, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; root.add(m); } }
  }

  // =============================== TANK WORKS YARD ===============================
  const TW = L.BUILDINGS.find(b => b.key === 'tankWorks'), TR = L.BUILDINGS.find(b => b.key === 'tankRange'), TY = L.YARDS.tank, [dx, dz] = TW.door;
  // apron at the door (west face): concrete slab, hazard edging, a stop line
  { const ax0 = dx - 14, ax1 = dx, az0 = dz - 9, az1 = dz + 9; part(B(ax1 - ax0, 0.06, az1 - az0), CONC, (ax0 + ax1) / 2, 0.03, (az0 + az1) / 2);
    const haz = (x, y, z) => ((Math.floor((x + z) * 1.6) % 2 + 2) % 2 ? YEL : INK);
    for (const z of [az0 + 0.2, az1 - 0.2]) part(B(ax1 - ax0, 0.02, 0.4), (x, y, zz) => haz(x, 0, zz + z), (ax0 + ax1) / 2, 0.07, z);
    part(B(0.4, 0.02, az1 - az0), (x, y, z) => haz(0, 0, z), ax0 + 0.2, 0.07, (az0 + az1) / 2); part(B(0.25, 0.02, 6), '#f3f2f2', dx - 4, 0.07, dz);
    for (let x = ax0 + 1; x < ax1 - 2; x += 2.05) part(B(2, 0.82, 0.55), (gx, gy) => (gy > 0.28 ? '#d8d3cb' : CONC), x + 1, 0.41, az1 + 0.6, 0, 0, 0, 0, 0, 0, 0);
    box(ax0 + 1, ax1 - 1.5, az1 + 0.3, az1 + 0.9);
    // floodlight on the apron corner
    const fx = ax0 + 0.8, fz = az0 - 0.8; part(Cy(0.1, 0.14, 7, 8), INK, fx, 3.5, fz); part(B(0.9, 0.4, 0.3), INK, fx + 0.35, 7, fz + 0.2, -0.5); ring(fx, fz, 0.25); root.userData.flood = [fx + 0.45, 6.85, fz + 0.4]; }
  // tread marks: two dark strips in the dirt from the apron to the range tank and the hangar door
  { const tread = pts => { for (let i = 0; i < pts.length - 1; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bx - ax, bz - az), nx = Math.cos(ry), nz = -Math.sin(ry);
        for (let t = 0; t < len; t += 1.1) { const x = ax + (bx - ax) * (t + 0.45) / len, z = az + (bz - az) * (t + 0.45) / len; for (const s of [-1.25, 1.25]) part(B(0.55, 0.012, 0.9), '#6b5a44', x + nx * s, 0.03, z + nz * s, ry); } } };
    const R = TY.ride.at; tread([[dx - 14, dz], [dx - 18, dz + 8], [dx - 6, dz + 16], [R[0] - 30, R[1] + 2], [R[0] - 4, R[1]]]); tread([[R[0] + 4, R[1]], [TR.door[0], TR.door[1] + 6]]); }
  // drums, tyre stacks, crates: tucked along the Works' north + east sides
  { const drums = (x, z, n) => { for (let i = 0; i < n; i++) { const ox = (i % 3) * 0.62, oz = Math.floor(i / 3) * 0.62, c = [RED, OLIVE, '#2e4a6b'][i % 3]; part(Cy(0.29, 0.29, 0.9, 12), c, x + ox, 0.45, z + oz); part(Cy(0.3, 0.3, 0.04, 12), INK, x + ox, 0.62, z + oz); } box(x - 0.35, x + 1.6, z - 0.35, z + Math.ceil(n / 3) * 0.62); };
    const tyres = (x, z, n) => { for (let i = 0; i < n; i++) part(new THREE.TorusGeometry(0.45, 0.2, 6, 16), TYRE, x, 0.2 + i * 0.36, z, 0, 0, 0, 0, Math.PI / 2); ring(x, z, 0.7); };
    const crate = (x, z, s, ry, y = 0) => part(B(s, s, s), (gx, gy) => (Math.abs(gy) > s * 0.42 ? '#4a5a2e' : OLIVE), x, y + s / 2, z, ry);
    const [x0, x1, z0, z1] = TW.f;
    if (!near(x0 + 3, z0 - 2.5, 0.8)) drums(x0 + 3, z0 - 3, 6);
    for (const [x, z, n] of [[x1 + 2.5, z0 + 4, 4], [x1 + 2.5, z0 + 6, 3], [x1 + 4.2, z0 + 5, 5]]) if (!near(x, z, 0.6)) tyres(x, z, n);
    // camo net over a supply pile between the Works + the hangar
    const cx = (x1 + TR.f[0]) / 2, cz = TR.f[2] + 6; if (!near(cx, cz, 3)) {
      for (const [ox, oz] of [[-3.5, -3], [3.5, -3], [-3.5, 3], [3.5, 3]]) { part(Cy(0.07, 0.07, 3.2, 6), WOOD, cx + ox, 1.6, cz + oz); ring(cx + ox, cz + oz, 0.12); }
      const net = new THREE.PlaneGeometry(8.4, 7.4, 8, 7).rotateX(-Math.PI / 2), p = net.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, -0.35 * Math.cos(x / 4.2 * Math.PI / 2) * Math.cos(z / 3.7 * Math.PI / 2) + 0.12 * Math.sin(x * 2.1 + z * 1.3)); } net.computeVertexNormals();
      const camo = (x, y, z) => { const v = Math.sin(x * 1.3 + 2) + Math.sin(z * 1.7 - x * 0.6) + Math.sin((x + z) * 0.9); return v > 0.9 ? '#3e4a26' : v > -0.6 ? '#5b6b3a' : '#7a7550'; };
      part(net, camo, cx, 3.2, cz); const under = net.clone().scale(1, 1, 1); { const q = under.toNonIndexed(), P2 = q.attributes.position.array, N2 = q.attributes.normal.array; for (let i = 0; i < P2.length; i += 9) for (const A of [P2, N2]) for (let k = 0; k < 3; k++) { const t = A[i + 3 + k]; A[i + 3 + k] = A[i + 6 + k]; A[i + 6 + k] = t; } for (let i = 0; i < N2.length; i++) N2[i] = -N2[i]; part(q, camo, cx, 3.19, cz); }
      crate(cx - 1.4, cz - 0.8, 1.2, 0.1); crate(cx - 0.1, cz - 0.9, 1.1, -0.2); crate(cx - 0.8, cz - 0.8, 0.9, 0.4, 1.15); crate(cx + 1.6, cz + 0.9, 1.0, 0.3);
      box(cx - 2.1, cx + 2.2, cz - 1.6, cz + 1.5); }
    // fuel bowser: a tank on a trailer, by the hangar's west wall
    const bx = TR.f[0] - 4, bz = TR.f[3] - 4; if (!near(bx, bz, 2)) { part(Cy(0.9, 0.9, 4.2, 16).rotateZ(Math.PI / 2), (x, y) => (y > 0.75 ? '#c4b04a' : YEL), bx, 1.55, bz); for (const ox of [-2.12, 2.12]) part(Cy(0.92, 0.92, 0.08, 16).rotateZ(Math.PI / 2), INK, bx + ox, 1.55, bz);
      part(B(4.6, 0.2, 1.4), INK, bx, 0.62, bz); for (const ox of [-1.2, 1.2]) for (const oz of [-0.75, 0.75]) part(Cy(0.38, 0.38, 0.26, 12).rotateX(Math.PI / 2), TYRE, bx + ox, 0.38, bz + oz); part(B(1.3, 0.08, 0.08), INK, bx - 2.9, 0.6, bz); part(Cy(0.2, 0.2, 0.3, 10), INK, bx, 2.5, bz); part(B(1.2, 0.3, 0.02), RED, bx, 1.55, bz + 0.92);
      box(bx - 2.5, bx + 2.3, bz - 1.0, bz + 1.0); } }

  // ---------- merge + night glow ----------
  { let n = 0; for (const g of parts) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); cl.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(cl, 3)); G.computeBoundingSphere();
    const m = new THREE.Mesh(G, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toon('#ffffff').gradientMap })); m.castShadow = !touch; m.receiveShadow = true; root.add(m); }
  const gc = document.createElement('canvas'); gc.width = gc.height = 64; { const g = gc.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,244,210,1)'); r.addColorStop(1, 'rgba(255,244,210,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(root.userData.flood || [0, -99, 0], 3)), new THREE.PointsMaterial({ map: new THREE.CanvasTexture(gc), size: 5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; root.add(glow);
  let night = null;
  return { tick(isNight) { if (isNight !== night) { night = isNight; glow.visible = night; } } };
}
