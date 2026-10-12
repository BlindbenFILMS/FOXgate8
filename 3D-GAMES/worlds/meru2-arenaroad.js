// MERU 2.0 — exterior polish round 4b: ARENA PATH between the clearings. Post-and-rail fences along both sides of the two gravel
// stretches (x 200-240, 280-320), with a gap in the middle of each side so you can still walk off into the meadow; wildflower drifts
// in the grass beyond the fences; a hay bale pair at each fence end. Decoration only, ~4 draws, colliders for the posts + bales.
import { plantFlowers } from './meru2-flora.js';
export function buildArenaRoad({ THREE, scene, L, city, toon, touch }) {
  const root = new THREE.Group(); root.name = 'meru2ArenaRoad'; scene.add(root); const C = city.colliders, bins = {};
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), Q = new THREE.Quaternion(), Y = V(0, 1, 0);
  const add = (k, g, x, y, z, ry = 0) => { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), Q.setFromAxisAngle(Y, ry), V(1, 1, 1))); (bins[k] || (bins[k] = [])).push(g); };
  const near = (x, z, r) => C.some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false) || L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 2.5);
  const flowers = [];
  for (const [xa, xb] of [[201, 239], [281, 319]]) for (const sz of [-1, 1]) { const z = sz * 7.4, mid = (xa + xb) / 2;
    for (let x = xa; x <= xb + 0.01; x += 2.5) { if (Math.abs(x - mid) < 2.6 || near(x, z, 0.4)) continue; add('post', new THREE.BoxGeometry(0.16, 1.1, 0.16), x, 0.55, z); C.push({ c: [x, z, 0.2] });
      const nx = x + 2.5; if (nx <= xb + 0.01 && !(Math.abs(nx - mid) < 2.6) && !(x < mid && nx > mid)) for (const y of [0.45, 0.85]) add('rail', new THREE.BoxGeometry(2.5, 0.08, 0.06), x + 1.25, y, z); }
    for (const ex of [xa - 1.2, xb + 1.2]) { const bz = z + sz * 1.4; if (near(ex, bz, 1.2)) continue; add('hay', new THREE.CylinderGeometry(0.6, 0.6, 1.2, 14).rotateZ(Math.PI / 2), ex, 0.6, bz); add('hay', new THREE.CylinderGeometry(0.6, 0.6, 1.2, 14).rotateZ(Math.PI / 2), ex + (ex < mid ? -1.25 : 1.25), 0.6, bz); C.push({ c: [ex, bz, 1.1] }); }
    for (let i = 0; i < (touch ? 10 : 22); i++) { const x = xa + Math.random() * (xb - xa), fz = z + sz * (1.5 + Math.random() * 7); if (!near(x, fz, 0.6)) flowers.push([x, 0, fz, 0.9 + Math.random() * 0.4]); } }
  const MAT = { post: toon('#7a5c38'), rail: toon('#9a7550'), hay: toon('#d9b866') };
  const merge = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0; for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return G; };
  for (const k in bins) { const m = new THREE.Mesh(merge(bins[k]), MAT[k]); m.castShadow = !touch; root.add(m); }
  if (flowers.length) root.add(plantFlowers(flowers));
  let far = false;
  return { tick(cam) { const f = Math.hypot(cam.x - 260, cam.z) > (touch ? 150 : 240); if (f !== far) { far = f; root.visible = !f; } } };
}
