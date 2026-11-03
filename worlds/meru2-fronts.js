// MERU 2.0 — BUILDING FRONTS (Ben, s33): every building round the fountain gets a clear APRON in front of its door and a short yellow-brick
// SPUR from the apron straight to the nearest main path (the yellow brick road), and the ring round the fountain is thinned out.
// Trees, flowerbeds, benches, tufts and their colliders inside those zones go; street-lamp poles stay (path readability rule).
import { floraRemove } from './meru2-flora.js';
export function buildFronts({ THREE, scene, L, cols, skip = () => false, roadD, heightAt, touch, net = false }) {   // net: s34 plaza paths build the doors (worlds/meru2-plazapaths.js), only the fountain ring is thinned here
  const TOWN = [-158, 158, -138, 148], inT = (x, z) => x > TOWN[0] && x < TOWN[1] && z > TOWN[2] && z < TOWN[3];
  const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, zones = [], spurs = [], links = [];
  const blds = L.BUILDINGS.filter(b => b.f && b.door && !b.open && inT(b.door[0], b.door[1]));
  const hitsB = (x0, x1, z0, z1, self) => blds.some(b => b !== self && x0 < b.f[1] && x1 > b.f[0] && z0 < b.f[3] && z1 > b.f[2]);
  const rect = (ax, az, bx, bz, w) => [Math.min(ax, bx) - (ax === bx ? w / 2 : 0), Math.max(ax, bx) + (ax === bx ? w / 2 : 0), Math.min(az, bz) - (az === bz ? w / 2 : 0), Math.max(az, bz) + (az === bz ? w / 2 : 0)];
  for (const b of net ? [] : blds) { const [dx, dz] = DIR[b.face] || [0, 1], [x, z] = b.door, AP = 8, AW = 12;
    // apron: 12 m wide, 8 m deep, starting just off the wall (the facade trims stay)
    const a = dx ? [Math.min(x + dx * 0.7, x + dx * AP), Math.max(x + dx * 0.7, x + dx * AP), z - AW / 2, z + AW / 2] : [x - AW / 2, x + AW / 2, Math.min(z + dz * 0.7, z + dz * AP), Math.max(z + dz * 0.7, z + dz * AP)];
    zones.push(a); spurs.push([x + dx * 0.8, z + dz * 0.8, x + dx * AP, z + dz * AP]);
    // spur: from the apron edge straight to the Castle-Lake path (x 0) or the Ruins-Arena path (z 0), whichever is nearer and not through a building
    let found = false; const fx = x + dx * AP, fz = z + dz * AP, opts = [[fx, 0], [0, fz]].map(([tx, tz]) => ({ tx, tz, d: Math.hypot(tx - fx, tz - fz) })).sort((p, q) => p.d - q.d);
    for (const o of opts) { if (o.d < 0.5 || o.d > 140) continue; const r = rect(fx, fz, o.tx, o.tz, 5); if (hitsB(r[0], r[1], r[2], r[3], b)) continue;
      // one connector per lane: a spur running within 6 m of another one already there (same direction, overlapping) is not built twice
      const dup = spurs.slice(blds.length ? 0 : 0).some(([ax, az, bx, bz]) => { const v1 = Math.abs(bx - ax) < 0.01, v2 = Math.abs(o.tx - fx) < 0.01; if (v1 !== v2 || Math.hypot(bx - ax, bz - az) < 9) return false;
        return v1 ? Math.abs(ax - fx) < 6 && Math.min(az, bz) < Math.max(fz, o.tz) && Math.max(az, bz) > Math.min(fz, o.tz) : Math.abs(az - fz) < 6 && Math.min(ax, bx) < Math.max(fx, o.tx) && Math.max(ax, bx) > Math.min(fx, o.tx); });
      zones.push(r); if (!dup) spurs.push([fx, fz, o.tx, o.tz]); links.push({ key: b.key, label: b.label, door: [x, z], pts: [[x, z], [fx, fz], [o.tx, o.tz]] }); found = true; break; }
    // no straight way (Ben: Crestview): a side path with ONE bend, through the gap between the buildings
    if (!found) for (let k = 1; k <= 40 && !found; k++) for (const mode of [0, 1]) { const sx = mode ? 0 : Math.sign(-fx) || 1, sz = mode ? Math.sign(-fz) || 1 : 0, ex = fx + sx * k * 3, ez = fz + sz * k * 3;
        const mid = mode ? [fx, ez] : [ex, fz], end = mode ? [0, ez] : [ex, 0], r1 = rect(fx, fz, mid[0], mid[1], 5), r2 = rect(mid[0], mid[1], end[0], end[1], 5);
        if (Math.hypot(end[0] - mid[0], end[1] - mid[1]) > 140 || hitsB(r1[0], r1[1], r1[2], r1[3], b) || hitsB(r2[0], r2[1], r2[2], r2[3], b)) continue;
        zones.push(r1, r2); spurs.push([fx, fz, mid[0], mid[1]], [mid[0], mid[1], end[0], end[1]]); links.push({ key: b.key, label: b.label, door: [x, z], pts: [[x, z], [fx, fz], mid, end] }); found = true; break; } }
  zones.push({ ring: [0, 0, 12.5, 26] });   // thin the fountain ring (the fountain lawn inside 12 m stays as it is)
  const inZ = (x, z) => zones.some(r => r.ring ? (h => h > r.ring[2] && h < r.ring[3])(Math.hypot(x - r.ring[0], z - r.ring[1])) : x > r[0] && x < r[1] && z > r[2] && z < r[3]);
  // clear instanced props (not lamp poles) + small outdoor colliders in the zones
  const M4 = new THREE.Matrix4(), v = new THREE.Vector3(), Z = new THREE.Matrix4().makeScale(0, 0, 0), bb = new THREE.Box3(), sz = new THREE.Vector3(); let n = 0;
  n += floraRemove((x, z) => inT(x, z) && inZ(x, z) && roadD(x, z) > 0.5);   // trees, shrubs, tufts, flowers (LOD lists)
  scene.traverse(o => { if (!o.isInstancedMesh || skip(o) || o.userData.lamp) return;   // the city lamps stay
    o.updateWorldMatrix(true, false); let hit = false; for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M4); v.setFromMatrixPosition(M4).applyMatrix4(o.matrixWorld); if (inT(v.x, v.z) && inZ(v.x, v.z) && roadD(v.x, v.z) > 0.5) { o.setMatrixAt(i, Z); hit = true; n++; } } if (hit) o.instanceMatrix.needsUpdate = true; });
  for (let i = cols.length - 1; i >= 0; i--) { const c = cols[i]; if (c._keep) continue; let x, z, small;
    if (c.c) { x = c.c[0]; z = c.c[1]; small = c.c[2] < 2.5; } else if (c.f) { x = (c.f[0] + c.f[1]) / 2; z = (c.f[2] + c.f[3]) / 2; small = c.f[1] - c.f[0] < 4 && c.f[3] - c.f[2] < 4; } else continue;
    if (small && inT(x, z) && inZ(x, z) && !blds.some(b => x > b.f[0] - 0.5 && x < b.f[1] + 0.5 && z > b.f[2] - 0.5 && z < b.f[3] + 0.5)) { cols.splice(i, 1); n++; } }
  // the yellow-brick spurs (2.4 m, same bricks as the main road)
  const c = document.createElement('canvas'); c.width = 128; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#8a6a1c'; g.fillRect(0, 0, 128, 256);
  for (let r = 0; r < 16; r++) { const o = r % 2 ? 0 : 16; for (let i = -1; i < 5; i++) { const k = 0.86 + ((i * 7 + r * 11) % 7) / 28; g.fillStyle = 'rgb(' + (240 * k | 0) + ',' + (196 * k | 0) + ',' + (58 * k | 0) + ')'; g.fillRect(i * 32 + o + 1.5, r * 16 + 1.5, 29, 13); } }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const pos = [], uv = [], idx = [], W = 2.4;
  for (const [ax, az, bx, bz] of spurs) { const len = Math.hypot(bx - ax, bz - az); if (len < 0.5) continue; const ux = (bx - ax) / len, uz = (bz - az) / len, nx = -uz, nz = ux; let prev = null;
    for (let s = 0; s <= len + 1e-6; s += Math.min(2, len)) { const x = ax + ux * s, z = az + uz * s; if (roadD(x, z) < 0.3 || Math.hypot(x, z) < 9) { prev = null; continue; }
      const y = heightAt(x, z) + 0.065, i0 = pos.length / 3; pos.push(x + nx * W / 2, y, z + nz * W / 2, x - nx * W / 2, y, z - nz * W / 2); uv.push(0, s / 1.6, 0.75, s / 1.6);
      if (prev != null) idx.push(prev, i0, prev + 1, prev + 1, i0, i0 + 1); prev = i0; } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); mesh.renderOrder = -1; mesh.receiveShadow = !touch; scene.add(mesh);
  if (typeof window !== 'undefined') window.__m2fronts = { zones, spurs, links, cleared: n };
  return { zones, spurs, links, cleared: n, mesh };
}
