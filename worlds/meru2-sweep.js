// MERU 2.0 — s171 SIDEWALK SWEEP (Ben: "PLENTY of space for the player to walk on ALL sidewalks; lights on the sidewalk go to the very edge, curb adjacent").
// Runs once after the whole walk is built. Every small solid prop standing in the middle of a road sidewalk (roadD 1.0 .. SIDEWALK - 0.2) is moved
// with its collider: thin things (posts, bins, hydrants, signs: radius < 0.45) to the CURB (0.3 m + radius from the road edge), bigger ones (benches,
// planters, stalls) BEHIND the sidewalk onto the grass (SIDEWALK + radius + 0.15), or to the curb if a building / lot is there.
// Visuals that move with it: instances of any InstancedMesh within 0.8 m of the collider centre + small stand-alone meshes / groups (< 4.5 m)
// centred there. A collider with no visual found stays put (merged static props). Foxes, vehicles (keepWhole) and lamps are never touched.
// ?sweep=0 = off. Result: window.__m2sweep = { moved, curb, back, stuck }.
export function sweepSidewalks({ THREE, scene, L, cols }) {
  const out = { moved: 0, curb: 0, back: 0, stuck: [] };
  if (typeof location !== 'undefined' && /[?&]sweep=0/.test(location.search)) return out;
  const SW = L.SIDEWALK || 3.3, R = L.ROADS || [];
  const segN = (x, z, p) => { let m = 1e9, nx = 0, nz = 0; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)), qx = x - ax - dx * u, qz = z - az - dz * u, d = Math.hypot(qx, qz); if (d < m) { m = d; nx = qx / (d || 1); nz = qz / (d || 1); } } return [m, nx, nz]; };
  const near = (x, z) => { let best = [1e9, 0, 0]; for (const r of R) { const [d, nx, nz] = segN(x, z, r.p); if (d - r.w / 2 < best[0]) best = [d - r.w / 2, nx, nz]; } return best; };
  const inB = (x, z, m) => (L.BUILDINGS || []).some(b => (b.f && x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m) || (b.lot && b.lot.r && x > b.lot.r[0] - m && x < b.lot.r[1] + m && z > b.lot.r[2] - m && z < b.lot.r[3] + m));
  const M4 = new THREE.Matrix4(), M5 = new THREE.Matrix4(), v = new THREE.Vector3(), box = new THREE.Box3(), sz = new THREE.Vector3();
  // candidate visuals, gathered once
  const inst = [], solo = [];
  const skip = o => { for (let p = o; p; p = p.parent) { const u = p.userData || {}; if (u.P || u.keepWhole || u.lamp || u.noSweep || p.isSkinnedMesh) return true; if (p.name && /^moved:/.test(p.name)) return false; } return false; };
  scene.traverse(o => { if (!o.visible && o.parent === scene) return;
    if (o.isInstancedMesh) { if (skip(o)) return; o.updateWorldMatrix(true, false); const e = o.matrixWorld.elements; if ([1, 2, 4, 6, 8, 9].some(k => Math.abs(e[k]) > 1e-4)) return; inst.push(o); return; }
    if ((o.isMesh || o.isGroup) && o.parent && o.parent !== scene.parent) { if (o.isGroup && !o.children.length) return; if (skip(o)) return;
      o.updateWorldMatrix(true, true); box.setFromObject(o); if (box.isEmpty()) return; box.getSize(sz); if (sz.x > 4.5 || sz.z > 4.5 || sz.y > 9 || box.min.y > 1.5) return;
      solo.push({ o, x: (box.min.x + box.max.x) / 2, z: (box.min.z + box.max.z) / 2 }); } });
  const used = new Set();
  for (const c of cols) { if (c.on === false || c.y0 != null || c._keep || c._swept) continue;
    let x, z, r; if (c.c) { [x, z, r] = c.c; if (r > 1.6 || r < 0.08) continue; } else if (c.f) { const w = c.f[1] - c.f[0], d = c.f[3] - c.f[2]; if (w > 4.6 || d > 4.6) continue; x = (c.f[0] + c.f[1]) / 2; z = (c.f[2] + c.f[3]) / 2; r = Math.max(w, d) / 2; } else continue;
    const [rd, nx, nz] = near(x, z); if (!(rd > 1.0 && rd < SW - 0.2)) continue;
    // where to: thin = curb, bigger = behind the sidewalk (unless a building / lot / water is there)
    let want = r < 0.45 ? 0.3 + r : SW + r + 0.15; if (want > SW && (inB(x + nx * (want - rd), z + nz * (want - rd), r + 0.3) || (L.lakeF && L.lakeF(x + nx * (want - rd), z + nz * (want - rd)) < 1.02))) want = 0.3 + Math.min(r, 0.6);
    const k = want - rd, dx = nx * k, dz = nz * k;
    // visuals
    const vis = []; for (const o of inst) { for (let i = 0; i < o.count; i++) { const key = o.uuid + ':' + i; if (used.has(key)) continue; o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); if (Math.abs(v.x - x) < 0.8 && Math.abs(v.z - z) < 0.8 && v.y < 1.5) vis.push({ o, i, key }); } }
    for (const s of solo) if (!used.has(s.o.uuid) && Math.abs(s.x - x) < 0.8 && Math.abs(s.z - z) < 0.8) vis.push({ s, key: s.o.uuid });
    { const ss = new Set(vis.filter(q => q.s).map(q => q.s.o)); for (let j = vis.length - 1; j >= 0; j--) { const q = vis[j]; if (!q.s) continue; for (let p = q.s.o.parent; p; p = p.parent) if (ss.has(p)) { vis.splice(j, 1); break; } } }   // a group and its own meshes: move the group only
    if (!vis.length) { if (out.stuck.length < 60) out.stuck.push([+x.toFixed(1), +z.toFixed(1)]); continue; }
    for (const q of vis) { used.add(q.key);
      if (q.o) { const o = q.o; o.getMatrixAt(q.i, M4); M5.makeTranslation(dx / (o.matrixWorld.elements[0] || 1), 0, dz / (o.matrixWorld.elements[10] || 1)); M4.premultiply(M5); o.setMatrixAt(q.i, M4); o.instanceMatrix.needsUpdate = true; if (o.boundingSphere) o.boundingSphere = null; }
      else { const o = q.s.o, p = o.parent; v.set(dx, 0, dz); if (p) { p.updateWorldMatrix(true, false); const inv = M5.copy(p.matrixWorld).invert(); const a = new THREE.Vector3().setFromMatrixPosition(p.matrixWorld); v.add(a).applyMatrix4(inv); } o.position.add(v); q.s.x += dx; q.s.z += dz; } }
    if (c.c) { c.c[0] += dx; c.c[1] += dz; } else { c.f[0] += dx; c.f[1] += dx; c.f[2] += dz; c.f[3] += dz; } c._swept = true;
    out.moved++; if (want > SW) out.back++; else out.curb++; }
  return out;
}
