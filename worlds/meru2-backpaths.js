import { floraRemove } from './meru2-flora.js';
// MERU 2.0 — s35 BACK-DOOR PATHS. Every town building with a back door (L.BUILDINGS door2: the fixed BACK_DOORS + the planner's) gets a
// woven-brick APRON outside it (door + 1 m a side, 3 m deep) and a 2.4 m yellow-brick PATH straight out to the ring-road sidewalk
// (only if the sidewalk is within 30 m and nothing stands in the way), grey edging both sides, the same look as the plaza paths.
// Stations (own walk / lift) and the Tavern (its deck) are skipped. Clears flora, small instanced props, small colliders, grass.
export function buildBackPaths({ THREE, scene, L, cols, roadD, nature, touch }) {
  const G = new THREE.Group(); G.name = 'backPaths'; scene.add(G); const out = [], SW = L.SIDEWALK || 3.3;
  const F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
  const tex = (weave) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#8a6a1c'; g.fillRect(0, 0, 128, 128);
    if (weave) { for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) { const vert = (bx + by) % 2, k0 = 0.88 + ((bx * 5 + by * 3) % 5) / 30; for (let j = 0; j < 2; j++) { const k = k0 - j * 0.04; g.fillStyle = 'rgb(' + (238 * k | 0) + ',' + (190 * k | 0) + ',' + (60 * k | 0) + ')'; if (vert) g.fillRect(bx * 32 + j * 16 + 1.5, by * 32 + 1.5, 13, 29); else g.fillRect(bx * 32 + 1.5, by * 32 + j * 16 + 1.5, 29, 13); } } }
    else for (let r = 0; r < 8; r++) { const o = r % 2 ? 0 : 16; for (let i = -1; i < 5; i++) { const k = 0.86 + ((i * 7 + r * 11) % 7) / 28; g.fillStyle = 'rgb(' + (240 * k | 0) + ',' + (196 * k | 0) + ',' + (58 * k | 0) + ')'; g.fillRect(i * 32 + o + 1.5, r * 16 + 1.5, 29, 13); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const mat = t => new THREE.MeshLambertMaterial({ map: t, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  const brickM = mat(tex(false)), weaveM = mat(tex(true)), edgeM = new THREE.MeshLambertMaterial({ color: '#a9a39a', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const slab = (m, w, d, x, z, ry, y, rep) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); if (rep) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / rep, uv.getY(i) * d / rep); }
    const s = new THREE.Mesh(g, m); s.position.set(x, y, z); s.rotation.y = ry; s.receiveShadow = !touch; G.add(s); };
  const inAny = (x, z, skip, m = 0.2) => L.BUILDINGS.some(b => b !== skip && b.f && x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m);
  const clear = [];
  for (const b of L.BUILDINGS) { if (!b.door2 || !b.face2 || /^station/.test(b.key) || b.key === 'tavern' || b.open) continue;
    const [dx, dz] = b.door2, [nx, nz] = F[b.face2], tx = -nz, tz = nx, ry = Math.atan2(nx, nz);
    if (Math.abs(dx) > 165 || dz < -145 || dz > 155) continue;
    // apron: 6 m wide × 3 m out (cut short if it would reach the road)
    let ad = 3; while (ad > 0.9 && roadD(dx + nx * ad, dz + nz * ad) < SW + 0.05) ad -= 0.25; if (ad < 1) { out.push({ key: b.key, face: b.face2, apron: 0, path: 0, note: 'opens straight onto the sidewalk' }); continue; }   // never over the sidewalk
    const ax = dx + nx * ad / 2, az = dz + nz * ad / 2; slab(edgeM, 6.5, ad + 0.25, ax + nx * 0.12, az + nz * 0.12, ry, 0.05); slab(weaveM, 6, ad, ax, az, ry, 0.065, 2);
    clear.push({ x0: dx - Math.abs(tx) * 3.6 - Math.abs(nx) * 0.2, x1: dx + Math.abs(tx) * 3.6 + Math.abs(nx) * 0.2, z0: dz - Math.abs(tz) * 3.6 - Math.abs(nz) * 0.2, z1: dz + Math.abs(tz) * 3.6 + Math.abs(nz) * 0.2, ax, az, nx, nz, len: ad + 0.6 });
    // path: straight out to the sidewalk
    let L1 = null; for (let s = ad; s <= 30; s += 0.5) { const x = dx + nx * s, z = dz + nz * s; if (inAny(x, z, b, 0.6)) break; if (roadD(x, z) < SW) { L1 = s; break; } }
    let len = 0; if (L1 != null && L1 > ad + 0.3) { len = L1 - ad + 0.4; const px = dx + nx * (ad + len / 2), pz = dz + nz * (ad + len / 2);
      slab(edgeM, 3.0, len, px, pz, ry, 0.045); slab(brickM, 2.4, len, px, pz, ry, 0.062, 1.6); clear.push({ seg: [dx + nx * ad, dz + nz * ad, dx + nx * (ad + len), dz + nz * (ad + len)], r: 2.2 }); }
    out.push({ key: b.key, face: b.face2, apron: ad, path: Math.round(len * 10) / 10 }); }
  // clear what stands on them (+ 1 m): flora, small instanced props (lamps stay), small colliders, grass blades
  const on = (x, z) => clear.some(c => { if (c.seg) { const [x0, z0, x1, z1] = c.seg, ddx = x1 - x0, ddz = z1 - z0, L2 = ddx * ddx + ddz * ddz || 1, u = Math.max(0, Math.min(1, ((x - x0) * ddx + (z - z0) * ddz) / L2)); return Math.hypot(x - x0 - ddx * u, z - z0 - ddz * u) < c.r; }
    const along = Math.abs((x - c.ax) * c.nx + (z - c.az) * c.nz), side = Math.abs((x - c.ax) * -c.nz + (z - c.az) * c.nx); return along < c.len / 2 + 1 && side < 4; });
  let n = floraRemove(on); const M4 = new THREE.Matrix4(), v = new THREE.Vector3(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  scene.traverse(o => { if (!o.isInstancedMesh || o.userData.lamp || o.parent === G) return; let p = o; while (p) { if (p.name && p.name.startsWith('moved:')) return; p = p.parent; } o.updateWorldMatrix(true, false); let hit = false;
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); if (v.y < 4 && on(v.x, v.z) && !inAny(v.x, v.z, null, -0.3)) { o.setMatrixAt(i, Z); hit = true; n++; } } if (hit) o.instanceMatrix.needsUpdate = true; });
  for (let i = cols.length - 1; i >= 0; i--) { const c = cols[i]; if (c._keep) continue; if (c.c && c.c[2] < 2.5 && on(c.c[0], c.c[1]) && !inAny(c.c[0], c.c[1], null, 0.5)) { cols.splice(i, 1); n++; } }
  if (nature && nature.clearGrass) nature.clearGrass(on);
  return { G, out, cleared: n };
}
