// MERU 2.0 — exterior polish round 3: SOUTH GARDENS + CIVIC ROW (decoration only, no new people or lines).
// South Gardens: a lily POND with a stone kerb + stepping-stone edge, a white BANDSTAND (octagon, red roof) and clipped HEDGE
// borders with rose beds round both; trees in iron grates along the Civic Row pavement. Placed only where nothing else stands
// (city colliders, speakers, buildings, roads, paths, the train), colliders for all of it. ~8 draws, hidden past 240 m (150 phones).
import { plantTrees, plantFlowers } from './meru2-flora.js';
export function buildGardens({ THREE, scene, L, city, toon, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Gardens'; scene.add(root);
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };
  const line = [...L.TRAIN.line, L.TRAIN.line[0]];
  const blocked = (x, z, r) => (city.colliders || []).some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false);
  const clearAt = (x, z, r) => !blocked(x, z, r) && !L.BUILDINGS.some(b => b.f && x > b.f[0] - r - 2 && x < b.f[1] + r + 2 && z > b.f[2] - r - 2 && z < b.f[3] + r + 2) && !L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 4)
    && L.PATHS.every(p => segD(x, z, p.p) > r + 4) && L.ROADS.every(R => segD(x, z, R.p) > R.w / 2 + r + 2) && segD(x, z, line) > r + 6 && L.surfaceAt(x, z) === 'grass';
  const find = (cx, cz, r, span) => { for (let d = 0; d <= span; d += 2) for (let a = 0; a < 6.28; a += d ? 0.5 : 7) { const x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (clearAt(x, z, r)) return [x, z]; } return null; };
  const bins = {}, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), Q = new THREE.Quaternion(), Y = V(0, 1, 0);
  const add = (k, g, x, y, z, ry = 0) => { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), Q.setFromAxisAngle(Y, ry), V(1, 1, 1))); (bins[k] || (bins[k] = [])).push(g); };
  const Box = (a, b, c) => new THREE.BoxGeometry(a, b, c), Cyl = (a, b, h, n = 16) => new THREE.CylinderGeometry(a, b, h, n);
  const hedge = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0); add('hedge', Box(0.8, 0.85, len), (x0 + x1) / 2, 0.42, (z0 + z1) / 2, ry);
    for (let t = 0.6; t < len; t += 1.2) city.colliders.push({ c: [x0 + (x1 - x0) * t / len, z0 + (z1 - z0) * t / len, 0.5] }); };
  const roses = [], trees = [], out = { pond: null, band: null, grates: 0 };
  // ---------- LILY POND (west lawn) ----------
  const P = find(-42, 108, 9, 22);
  if (P) { const [x, z] = P, R = 6.5; out.pond = P;
    add('kerb', new THREE.LatheGeometry([new THREE.Vector2(R + 0.75, 0), new THREE.Vector2(R + 0.75, 0.34), new THREE.Vector2(R + 0.6, 0.42), new THREE.Vector2(R, 0.42), new THREE.Vector2(R, 0.1)], 40), x, 0, z); add('basin', Cyl(R, R, 0.04, 40), x, 0.06, z); add('water', Cyl(R, R, 0.04, 40), x, 0.3, z);
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, r = 2 + (i * 1.7) % 3.8; add('pad', Cyl(0.42 + (i % 3) * 0.12, 0.42 + (i % 3) * 0.12, 0.02, 10), x + Math.cos(a) * r, 0.34, z + Math.sin(a) * r); if (i % 3 === 0) roses.push([x + Math.cos(a) * r, 0.33, z + Math.sin(a) * r, 0.45]); }
    for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283; add('kerb', Box(0.7, 0.06, 0.5), x + Math.cos(a) * (R + 1.35), 0.03, z + Math.sin(a) * (R + 1.35), -a); }
    for (const s of [-1, 1]) hedge(x - 9.5, z + s * 9.5, x + 9.5, z + s * 9.5); hedge(x - 9.5, z - 9.5, x - 9.5, z - 2.5); hedge(x - 9.5, z + 2.5, x - 9.5, z + 9.5);
    for (let i = 0; i < 16; i++) { const t = i / 15; roses.push([x - 8.6 + t * 17.2, 0, z - 8.4, 1], [x - 8.6 + t * 17.2, 0, z + 8.4, 1]); }
    city.colliders.push({ c: [x, z, R + 0.7] }); }
  // ---------- BANDSTAND (east lawn) ----------
  const Bp = find(44, 106, 8, 22);
  if (Bp) { const [x, z] = Bp; out.band = Bp; const r = 4.2;
    add('stone', Cyl(r + 0.4, r + 0.6, 0.7, 8), x, 0.35, z); add('deck', Cyl(r + 0.2, r + 0.2, 0.06, 8), x, 0.73, z); for (let s = 0; s < 3; s++) add('stone', Box(2.2, 0.24, 0.6), x, 0.12 + s * 0.24 - 0.12, z + r + 0.9 - s * 0.35);
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + Math.PI / 8; add('white', Cyl(0.11, 0.13, 3.2, 8), x + Math.cos(a) * r, 2.36, z + Math.sin(a) * r); if (i !== 1) add('white', Box(2 * r * Math.sin(Math.PI / 8) - 0.1, 0.08, 0.08), x + Math.cos(a + Math.PI / 8) * r * Math.cos(Math.PI / 8), 1.7, z + Math.sin(a + Math.PI / 8) * r * Math.cos(Math.PI / 8), -(a + Math.PI / 8) + Math.PI / 2); }
    add('white', Cyl(r + 0.5, r + 0.5, 0.22, 8), x, 4.05, z); add('roof', new THREE.ConeGeometry(r + 0.9, 2.2, 8), x, 5.25, z); add('white', Cyl(0.06, 0.06, 1.1, 6), x, 6.8, z); add('gold', new THREE.SphereGeometry(0.2, 10, 8), x, 7.4, z);
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.283; roses.push([x + Math.cos(a) * (r + 1.8), 0, z + Math.sin(a) * (r + 1.8), 0.9]); }
    city.colliders.push({ c: [x, z, r + 0.6] }); }
  // ---------- CIVIC ROW: trees in grates along both pavement edges ----------
  const doors = L.BUILDINGS.filter(b => b.door).map(b => b.door);
  for (const z of [-47.6, -72.4]) for (let x = -112; x <= 112; x += 14) { if (Math.abs(x) < 9 || doors.some(([dx, dz]) => Math.hypot(dx - x, dz - z) < 7) || blocked(x, z, 1.4) || L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < 4)) continue;
    add('iron', Box(1.8, 0.03, 1.8), x, 0.02, z); for (const s of [-1, 1]) { add('kerb', Box(1.95, 0.1, 0.1), x, 0.05, z + s * 0.92); add('kerb', Box(0.1, 0.1, 1.95), x + s * 0.92, 0.05, z); }
    trees.push([x, 0, z, 0.72 + Math.random() * 0.12, 'lime']); city.colliders.push({ c: [x, z, 0.45] }); out.grates++; }
  // build
  const MAT = { kerb: toon('#cfc9bf'), basin: toon('#2d4a3e'), water: new THREE.MeshPhongMaterial({ color: 0x3a8fa8, shininess: 120, specular: 0xffffff, transparent: true, opacity: 0.82 }), pad: toon('#4f8a3a'), hedge: toon('#3d6b2c'), stone: toon('#d8d2c6'), deck: toon('#9a7550'), white: toon('#f3f2f2'), roof: toon('#ec3013'), gold: new THREE.MeshBasicMaterial({ color: 0xd7ad52 }), iron: toon('#2c3036') };
  const merge = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0; for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return G; };
  for (const k in bins) { const m = new THREE.Mesh(merge(bins[k]), MAT[k]); if (k === 'kerb') m.material.side = THREE.DoubleSide; m.castShadow = !touch && k !== 'pad' && k !== 'water'; m.receiveShadow = true; root.add(m); }
  if (roses.length) root.add(plantFlowers(roses.slice(0, touch ? 40 : 80)));
  if (trees.length) root.add(plantTrees(trees, { shadow: !touch }).group);
  let far = false;
  return { tick(cam) { const f = Math.hypot(cam.x, cam.z - 30) > (touch ? 150 : 240); if (f !== far) { far = f; root.visible = !f; } }, stats: out };
}
