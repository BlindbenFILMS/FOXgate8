// MERU 2 · SPEEDBOAT BAY ARM [meruSpeedboatBay] (s103). The water, lake bed, sand beach and low wild hills of the bay dug south of Pearl Island
// (worlds/meru2-layout.js BAY). Water = a grid snapped to the noisy shore, same depth colours + vertex waves as the lake (shared uT, shared depth field D),
// so the seam with the lake disappears (the lake mesh discards inside the bay). Phone budget: 4 draws (bed, water, beach, hills instanced).
export function buildBay({ THREE, scene, toon, grad, L, touch, WU, rip, D, di }) {
  const B = L.BAY, [x0, x1, z0, z1] = B.r, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), root = new THREE.Group(); root.name = 'speedboatBay'; scene.add(root);
  // ---------- the grid, outside vertices snapped onto the shore ----------
  const G = touch ? 14 : 10, nx = Math.ceil((x1 - x0 + 24) / G), nz = Math.ceil((z1 - z0 + 12) / G), pos = [], col = [], amp = [], uv = [], idx = [], inside = [];
  const snap = (x, z) => { for (let k = 0; k < 4; k++) { const s = L.baySD(x, z); if (s <= 0) break; const e = 0.5, gx = (L.baySD(x + e, z) - L.baySD(x - e, z)) / (2 * e), gz = (L.baySD(x, z + e) - L.baySD(x, z - e)) / (2 * e), gl = Math.hypot(gx, gz) || 1; x -= gx / gl * s; z -= gz / gl * s; } return [x, z]; };
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { let x = x0 - 12 + i * (x1 - x0 + 24) / nx, z = z0 + j * (z1 - z0 + 12) / nz; const inn = L.baySD(x, z) <= 0; inside.push(inn); if (!inn) [x, z] = snap(x, z);
    const d = D(x, z), dI = di(x, z), sh = Math.max(clamp(1 - d / 16, 0, 1), clamp(1 - dI / 14, 0, 1)) ** 1.5, dp = clamp((Math.min(d, dI) - 22) / 80, 0, 1);
    pos.push(x, 0.08, z); col.push(1 + 0.35 * sh - 0.45 * dp, 1 + 0.6 * sh - 0.3 * dp, 1 + 0.2 * sh - 0.1 * dp); amp.push(clamp(d / 22, 0, 1) * clamp(dI / 18, 0, 1)); uv.push(x / 9.7, z / 10); }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; if (inside[a] || inside[b] || inside[c]) idx.push(a, c, b); if (inside[b] || inside[c] || inside[d]) idx.push(b, c, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('wamp', new THREE.Float32BufferAttribute(amp, 1)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const map = rip ? rip.clone() : null; if (map) { map.repeat.set(1, 1); map.needsUpdate = true; }
  const wm = new THREE.MeshPhongMaterial({ color: 0x4aa3d8, transparent: true, opacity: 0.82, shininess: 90, specular: 0xffffff, vertexColors: true, map });
  wm.onBeforeCompile = sh => { sh.uniforms.uT = WU; sh.vertexShader = 'attribute float wamp;\nuniform float uT;\n' + sh.vertexShader
    .replace('#include beginnormal_vertex', `#include beginnormal_vertex
      vec3 wq = position; float p1 = wq.x * 0.09 + uT * 1.2, p2 = wq.z * 0.13 - uT * 0.95 + wq.x * 0.04, p3 = wq.x * 0.55 + wq.z * 0.31 + uT * 2.1;
      float gx = wamp * (0.0063 * cos(p1) + 0.002 * cos(p2) + 0.02 * cos(p3)) * 6.0, gz = wamp * (0.0065 * cos(p2) + 0.012 * cos(p3)) * 6.0;
      objectNormal = normalize(vec3(-gx, 1.0, -gz));`)
    .replace('#include begin_vertex', '#include begin_vertex\n transformed.y += wamp * (0.07 * sin(p1) + 0.05 * sin(p2));'); };
  wm.customProgramCacheKey = () => 'meru2bay';
  const water = new THREE.Mesh(g, wm); water.frustumCulled = false; water.receiveShadow = true; root.add(water);
  // the lake bed under it (opaque: past the painted ground there is only the far grass plane)
  const bed = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#3c87b8', polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })); bed.position.y = -0.065; bed.renderOrder = -1; root.add(bed);
  // ---------- sand beach: a band from the waterline out (skipped where the lake carries on, Pearl Island or the old shore) ----------
  { const NS = touch ? 260 : 420, bp = [], bc = [], bi = [], W0 = B.beach, sand = new THREE.Color('#e7d3a1'), dry = new THREE.Color('#efe2bd');
    for (let i = 0; i <= NS; i++) { const [x, z, nx2, nz2] = L.bayEdge(i / NS), mid = [x - nx2 * W0 * 0.5, z - nz2 * W0 * 0.5], hide = L.mainLakeF(mid[0], mid[1]) < 1.02 || L.mainLakeF(x, z) < 1 || L.islandAt(mid[0], mid[1]) > -1.5;
      for (const [d, c] of [[-0.6, sand], [W0 * (0.85 + 0.25 * Math.sin(i * 0.37)), dry]]) { const px = x - nx2 * d, pz = z - nz2 * d; bp.push(px, hide ? -6 : 0.03, pz); bc.push(c.r, c.g, c.b); } }
    for (let i = 0; i < NS; i++) { const p = i * 2; bi.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3)); bg.setIndex(bi); bg.computeVertexNormals();
    const beach = new THREE.Mesh(bg, new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad, vertexColors: true, side: THREE.DoubleSide })); beach.receiveShadow = true; beach.frustumCulled = false; root.add(beach); }
  // ---------- low wild hills past the walkable rim (scenery only, never on the old map) ----------
  { const R = (() => { let s = 103; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(), spots = [];
    for (const [off, rMin, rMax, hMin, hMax, n] of [[78, 34, 56, 5, 11, touch ? 14 : 22], [150, 55, 85, 10, 20, touch ? 8 : 14]]) for (let k = 0; k < n; k++) { const u = (k + R() * 0.6) / n, [x, z, nx2, nz2] = L.bayEdge(u), o = off + R() * 30, hx = x - nx2 * o, hz = z - nz2 * o, r = rMin + R() * (rMax - rMin);
      if (hz - r < 560 || L.inLake(hx, hz) || L.baySD(hx, hz) < B.walk + r * 0.6) continue; spots.push([hx, hz, r, hMin + R() * (hMax - hMin)]); }
    const geo = new THREE.SphereGeometry(1, touch ? 14 : 20, touch ? 6 : 8, 0, Math.PI * 2, 0, Math.PI / 2), hills = new THREE.InstancedMesh(geo, toon('#ffffff'), Math.max(1, spots.length)), o3 = new THREE.Object3D(), c = new THREE.Color(), HC = ['#6f9a4e', '#628c45', '#7aa356', '#5b7f40'];
    spots.forEach(([x, z, r, h], i) => { o3.position.set(x, -0.6, z); o3.scale.set(r, h, r * (0.75 + R() * 0.5)); o3.rotation.y = R() * 6.28; o3.updateMatrix(); hills.setMatrixAt(i, o3.matrix); hills.setColorAt(i, c.set(HC[i % HC.length])); });
    hills.count = spots.length; hills.receiveShadow = true; root.add(hills); }
  return { root, water };
}
