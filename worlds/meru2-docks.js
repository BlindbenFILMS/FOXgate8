// MERU 2.0 — exterior polish round 7: JETTIES + PEARL ISLAND (built by worlds/meru2-lake.js, so walk mode only, like the jetties).
// JETTIES: corner pile caps, tyre FENDERS on the boat sides (Speedboat Bay jetty E, Boatworks jetty E, the ferry pier both sides),
// deck CLEATS with rope coils, a LIFEBUOY on every jetty rail, crates on the Boatworks jetty. PEARL ISLAND: a stone rim round the deep
// pond (gap at the diving board), stepping stones up the lantern trail, a porch + awning + barrels + a drying net on the pearl shack,
// a beach FIRE PIT with log seats (flames + glow at night), an upturned rowboat. Decoration only. Statics = one merged vertex-coloured
// toon mesh (+ flames + glow = 3 draws). Colliders into the walk's shared cols.
export function buildDocks({ THREE, scene, L, toon, touch, cols, isH }) {
  const root = new THREE.Group(); root.name = 'meru2Docks'; scene.add(root); const parts = [], col = new THREE.Color(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  let seed = 977; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
  const WOOD = '#9a7550', WOODD = '#5c4430', WHITE = '#f3f2f2', RED = '#ec3013', INK = '#201e1d', NAVY = '#2e4a6b', ROPE = '#c9b48a', STONE = '#a39a8c', TYRE = '#2a2826';
  const part = (geo, c, bx, by, bz, bry, lx = 0, ly = 0, lz = 0, rx = 0, ry = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of ['uv', 'uv1']) if (g.attributes[k]) g.deleteAttribute(k);
    const P = g.attributes.position, n = P.count, a = new Float32Array(n * 3);
    for (let t = 0; t < n; t += 3) { const h = typeof c === 'function' ? c((P.getX(t) + P.getX(t + 1) + P.getX(t + 2)) / 3, (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3) : c; col.set(h); for (let k = 0; k < 3; k++) a.set([col.r, col.g, col.b], (t + k) * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    g.applyMatrix4(new THREE.Matrix4().compose(V(bx, by, bz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, bry, 0)), V(1, 1, 1)).multiply(new THREE.Matrix4().compose(V(lx, ly, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1)))); parts.push(g); };
  const ring = (x, z, r) => cols.push({ c: [x, z, r] }), box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const near = (x, z, r) => cols.some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false) || L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 2.5);
  const buoyC = (x, y) => (Math.floor((Math.atan2(y, x) + Math.PI) / (Math.PI / 2) + 0.5) % 2 ? WHITE : RED);
  const tyre = new THREE.TorusGeometry(0.3, 0.12, 6, 14), buoy = new THREE.TorusGeometry(0.3, 0.075, 8, 20), coil = new THREE.TorusGeometry(0.22, 0.05, 5, 14);
  const inGap = (J, side, at, w = 1.6) => (J.gaps || []).some(q => q.side === side && Math.abs(q.at - at) < (q.w || 2.4) / 2 + w);

  // ---------- JETTIES ----------
  const FEND = { bayJetty: ['E'], worksJetty: ['E'], bayEnd: ['S'] };
  for (const J of L.LAKE.jetties) { const [x0, x1, z0, z1] = J.r, y = J.y, long = (z1 - z0) >= (x1 - x0), open = J.open || [];
    for (const [cx, cz, sx, sz] of [[x0, z0, 'W', 'N'], [x1, z0, 'E', 'N'], [x0, z1, 'W', 'S'], [x1, z1, 'E', 'S']]) if (!open.includes(sx) && !open.includes(sz)) { const px = cx + (cx === x0 ? 0.3 : -0.3), pz = cz + (cz === z0 ? 0.3 : -0.3); part(Cy(0.19, 0.19, 0.55, 8), WOODD, px, y + 0.27, pz, 0); part(Cy(0.21, 0.21, 0.06, 8), INK, px, y + 0.57, pz, 0); }
    for (const sd of FEND[J.key] || []) { if (sd === 'E' || sd === 'W') { const x = sd === 'E' ? x1 + 0.14 : x0 - 0.14; for (let z = z0 + 2; z < z1 - 1; z += 4) if (!inGap(J, sd, z)) part(tyre, TYRE, x, y - 0.42, z, Math.PI / 2); }
      else { const z = sd === 'S' ? z1 + 0.14 : z0 - 0.14; for (let x = x0 + 2; x < x1 - 1; x += 4) if (!inGap(J, sd, x)) part(tyre, TYRE, x, y - 0.42, z, 0); } }
    // cleats + rope coils just inside the long rails (low, step-over)
    const sides = long ? [[x0 + 0.55, 'W'], [x1 - 0.55, 'E']] : [[z0 + 0.55, 'N'], [z1 - 0.55, 'S']];
    for (const [c, sd] of sides) { if (open.includes(sd)) continue; for (let s = (long ? z0 : x0) + 5; s < (long ? z1 : x1) - 3; s += 9) { const [x, z] = long ? [c, s] : [s, c], ry = long ? 0 : Math.PI / 2;
        part(B(0.1, 0.08, 0.42), INK, x, y + 0.04, z, ry); for (const o of [-0.12, 0.12]) part(B(0.08, 0.06, 0.06), INK, x, y + 0.1, z, ry, 0, 0, o);
        if (rnd() < 0.6) for (let k = 0; k < 3; k++) part(coil, ROPE, x + (long ? (c < (x0 + x1) / 2 ? 0.5 : -0.5) : 0), y + 0.05 + k * 0.07, z + (long ? 0.6 : (c < (z0 + z1) / 2 ? 0.5 : -0.5)), 0, 0, 0, 0, Math.PI / 2); } }
    // a lifebuoy on the rail, on the outside of a long side
    if (J.label) { const sd = long ? (open.includes('W') ? 'E' : 'W') : (open.includes('N') ? 'S' : 'N'); let at = long ? z0 + (z1 - z0) * 0.35 : x0 + (x1 - x0) * 0.35; for (let k = 0; k < 8 && inGap(J, sd, at, 0.8); k++) at += 1.3;
      if (long) { const x = sd === 'W' ? x0 - 0.12 : x1 + 0.12; part(buoy, buoyC, x, y + 0.72, at, Math.PI / 2); } else { const z = sd === 'N' ? z0 - 0.12 : z1 + 0.12; part(buoy, buoyC, at, y + 0.72, z, 0); } } }
  { const W2 = L.LAKE.jetties.find(j => j.key === 'worksJetty'); if (W2) { const [x0, , z0] = W2.r, y = W2.y; for (const [lx, lz, s, r] of [[0.75, 7, 0.7, 0.2], [0.8, 7.9, 0.55, -0.3], [0.75, 7.45, 0.45, 0.5]]) part(B(s, s, s), r < 0 ? '#7a5a3a' : WOOD, x0 + lx, y + s / 2 + (lz === 7.45 ? 0.62 : 0), z0 + lz, r); box(x0 + 0.3, x0 + 1.25, z0 + 6.5, z0 + 8.4); } }
  { const lh = (L.LIGHTHOUSES || []).find(q => q.pier); if (lh) { const [x0, x1, z0, z1] = lh.pier.r, y = lh.pier.y; for (const x of [x0 - 0.14, x1 + 0.14]) for (let z = z0 + 6; z < z1 - 4; z += 4) if (Math.abs(z - 256) > 3) part(tyre, TYRE, x, y - 0.42, z, Math.PI / 2); } }

  // ---------- PEARL ISLAND ----------
  const I = L.ISLAND, IS = L.LAKE.island, P0 = I.pond, dry = (x, z) => L.islandH(L.islandR(x, z)) > 0.3;   // (inLake is true all over the island: it sits inside the lake ellipse)
  if (!I.crater) { const dv = L.SPEAKERS.find(s => s.key === 'pearlDiver'), ga = dv ? Math.atan2(dv.at[1] - P0.z, dv.at[0] - P0.x) : 99, r = P0.r + 0.35, n = touch ? 40 : 64;   // pond rim
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = Math.atan2(Math.sin(a - ga), Math.cos(a - ga)); if (Math.abs(d) < 0.16) continue; const x = P0.x + Math.cos(a) * r, z = P0.z + Math.sin(a) * r, s = 0.42 + rnd() * 0.2;
      part(new THREE.DodecahedronGeometry(s, 0).scale(1.2, 0.55, 1), new THREE.Color(STONE).offsetHSL(0, 0, (rnd() - 0.5) * 0.1).getHex(), x, isH(x, z) + 0.05, z, a + rnd()); } }
  for (const T of [IS.trail, IS.trail2].filter(Boolean)) { for (let k = 0; k < T.length - 1; k++) { const [ax, az] = T[k], [bx, bz] = T[k + 1], len = Math.hypot(bx - ax, bz - az);   // stepping stones up the trail
      for (let t = 0.6; t < len; t += 1.15) { const u = t / len, x = ax + (bx - ax) * u + (rnd() - 0.5) * 0.3, z = az + (bz - az) * u + (rnd() - 0.5) * 0.3; part(Cy(0.38 + rnd() * 0.1, 0.42, 0.1, 9), new THREE.Color('#b9b0a2').offsetHSL(0, 0, (rnd() - 0.5) * 0.08).getHex(), x, isH(x, z) + 0.04, z, rnd() * 3); } } }
  { const [hx, hz] = IS.shack, hy = isH(hx, hz);   // shack: porch on the door (east) side, awning, barrels, a net drying on the south wall
    // a short striped awning over the door (no porch: the door side runs down to the waterline)
    part(B(1.0, 0.06, 2.2), WHITE, hx + 2.6, hy + 2.25, hz, 0, 0, 0, 0, 0, -0.3); for (let k = 0; k < 3; k++) part(B(1.02, 0.07, 0.37), NAVY, hx + 2.6, hy + 2.26, hz - 0.74 + k * 0.74, 0, 0, 0, 0, 0, -0.3);
    for (const oz of [-1.0, 1.0]) part(B(0.06, 0.06, 0.9), INK, hx + 2.45, hy + 2.05, hz + oz, Math.PI / 2, 0, 0, 0, 0.6);
    const bar = [[-2.7, -1.2], [-2.7, -0.4], [-1.5, -2.4], [1.5, -2.4], [-1.5, 2.4]].filter(([ox, oz]) => dry(hx + ox, hz + oz) && !near(hx + ox, hz + oz, 0.4)).slice(0, 2);
    for (const [ox, oz] of bar) { const by = isH(hx + ox, hz + oz); part(Cy(0.3, 0.3, 0.8, 10), '#7a5a3a', hx + ox, by + 0.4, hz + oz); part(Cy(0.31, 0.31, 0.06, 10), INK, hx + ox, by + 0.8, hz + oz); ring(hx + ox, hz + oz, 0.35); }
    { const net = new THREE.PlaneGeometry(2.8, 1.6, 7, 4); const p = net.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 2.2) * 0.04 - (1 - Math.abs(p.getX(i)) / 1.4) * Math.max(0, -p.getY(i)) * 0.12); net.computeVertexNormals();
      part(net, (x, y) => ((Math.round(x * 5) + Math.round(y * 5)) % 2 ? '#7d8a6a' : '#a3ae8c'), hx, hy + 1.6, hz + 1.85, 0); part(net.clone(), '#7d8a6a', hx, hy + 1.6, hz + 1.86, Math.PI); }
  }
  const flames = [], glowP = [];
  const icol = cols.filter(c => { const p = c.c || (c.f && [(c.f[0] + c.f[1]) / 2, (c.f[2] + c.f[3]) / 2]); return p && Math.hypot(p[0] - I.c[0], p[1] - I.c[1]) < I.c[2] + 20; });   // fire pit + log seats: best clear beach spot, town side first
    const clear = (x, z) => { let d = 99; for (const c of icol) d = Math.min(d, c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) - c.c[2] : Math.max(c.f[0] - x, x - c.f[1], c.f[2] - z, z - c.f[3], 0) || 0); for (const s of L.SPEAKERS) if (Array.isArray(s.at)) d = Math.min(d, Math.hypot(s.at[0] - x, s.at[1] - z) - 2.5); return d; };
  { let spot = null, best = -1; for (let k = 0; k < 72; k++) { const a = -Math.PI / 2 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.087; for (const r of [41, 39, 43, 37]) { const [x, z] = L.islandPt(a, r); if (!dry(x, z) || isH(x, z) > 1.7) continue; const d = clear(x, z); if (d > best) { best = d; spot = [x, z]; } if (d > 2.4) break; } if (best > 2.4) break; }
    if (spot) { const [x, z] = spot, y = isH(x, z); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; part(new THREE.DodecahedronGeometry(0.2, 0).scale(1.2, 0.7, 1), STONE, x + Math.cos(a) * 0.7, y + 0.1, z + Math.sin(a) * 0.7, a); }
      for (let i = 0; i < 4; i++) part(Cy(0.07, 0.08, 0.9, 6), '#4a3a2a', x, y + 0.18, z, i * 0.8, 0, 0, 0, 0, 0, Math.PI / 2 - 0.35);
      for (let i = 0; i < 3; i++) { const a = 0.4 + i * 2.1, lx = x + Math.cos(a) * 2.1, lz = z + Math.sin(a) * 2.1; part(Cy(0.24, 0.27, 1.7, 8), '#8a6a4a', lx, isH(lx, lz) + 0.24, lz, -a, 0, 0, 0, 0, 0, Math.PI / 2); ring(lx, lz, 0.6); }
      root.userData.firePit = [x, z]; ring(x, z, 0.85); flames.push([x, y + 0.45, z]); glowP.push(x, y + 0.7, z); } }
  { for (let k = 0; k < 70; k++) { const a = 2.6 + k * 0.09, [x, z] = L.islandPt(a, 40 + (k % 3) * 1.5); if (!dry(x, z) || isH(x, z) > 1.7 || clear(x, z) < 2.0) continue; const ry = a + Math.PI / 2, y = isH(x, z);   // upturned rowboat on the beach
      part(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.75, 0.42, 2.0), (gx, gy) => (gy < 0.12 ? WHITE : NAVY), x, y, z, ry); part(Cy(0.75, 0.75, 0.04, 12).scale(1, 1, 2.66), '#3d2a1c', x, y + 0.02, z, ry);
      part(B(0.06, 0.06, 1.4), WOOD, x, y + 0.04, z, ry + 0.4, 1.1, 0, 0.3); ring(x, z - 0.8, 0.8); ring(x, z + 0.8, 0.8); root.userData.rowboat = [x, z]; break; } }

  // ---------- merge ----------
  { let n = 0; for (const g of parts) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); cl.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(cl, 3)); G.computeBoundingSphere();
    const m = new THREE.Mesh(G, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toon('#ffffff').gradientMap })); m.castShadow = !touch; m.receiveShadow = true; root.add(m); }
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffa23a }), fl = flames.map(([x, y, z]) => { const g = new THREE.Group(); g.position.set(x, y, z); for (const [s, c, oy] of [[1, 0xff7a1a, 0], [0.6, 0xffd36a, 0.05]]) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.32 * s, 0.9 * s, 7), c === 0xff7a1a ? flameM : new THREE.MeshBasicMaterial({ color: c })); m.position.y = oy; g.add(m); } g.visible = false; root.add(g); return g; });
  const gc = document.createElement('canvas'); gc.width = gc.height = 64; { const g = gc.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,170,90,1)'); r.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(glowP, 3)), new THREE.PointsMaterial({ map: new THREE.CanvasTexture(gc), size: 4.5, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; root.add(glow);
  let night = null;
  return { tick(t, isNight) { if (isNight !== night) { night = isNight; glow.visible = night; for (const g of fl) g.visible = night; }
    if (night) fl.forEach((g, i) => { const k = 1 + Math.sin(t * 11 + i) * 0.1 + Math.sin(t * 17) * 0.06; g.scale.set(1 / k, k, 1 / k); }); } };
}
