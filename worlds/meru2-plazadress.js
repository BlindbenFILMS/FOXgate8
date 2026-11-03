// MERU 2.0 — exterior polish round 9: SKYLINE PLAZAS. Each district plaza gets a small set of street furniture: a COFFEE KIOSK
// (striped awning, counter, menu board) with café tables round it, raised PLANTER beds (stone kerb, soil, shrubs), a BIKE RACK with
// bikes, a red WAYFINDING TOTEM (district name, Archivo), and low SEAT CUBES. Placed by a search that keeps clear of towers, roads, walks,
// trees, lamps and the district feature. Decoration only, no people or lines. 1 merged vertex-coloured toon mesh + 1 totem sign mesh +
// shrubs (3 draws). Colliders pushed into the districts' colliders (before the grass bake). Hidden with distance like the districts.
import { plantShrubs } from './meru2-flora.js';
export function buildPlazaDress({ THREE, scene, L, bases, districts, touch, terrainAt }) {
  const root = new THREE.Group(); root.name = 'meru2PlazaDress'; scene.add(root); const SK = L.SKYLINE, C = districts.colliders, parts = [], col = new THREE.Color(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  let seed = 9001; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
  const INK = '#201e1d', RED = '#ec3013', WHITE = '#f3f2f2', STONE = '#b9b3a9', STONED = '#9a958d', SOIL = '#4a3a2a', STEEL = '#8a9099', WOOD = '#a77b4f';
  const NAMES = { spire: 'SPIRE DISTRICT', deco: 'GATEKEEPER', pearl: 'PEARL SAIL', garden: 'GARDEN TWINS' };
  const part = (geo, c, bx, by, bz, bry = 0, lx = 0, ly = 0, lz = 0, rx = 0, ry = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of ['uv', 'uv1']) if (g.attributes[k]) g.deleteAttribute(k);
    const P = g.attributes.position, n = P.count, a = new Float32Array(n * 3);
    for (let t = 0; t < n; t += 3) { const h = typeof c === 'function' ? c((P.getX(t) + P.getX(t + 1) + P.getX(t + 2)) / 3, (P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3, (P.getZ(t) + P.getZ(t + 1) + P.getZ(t + 2)) / 3) : c; col.set(h); for (let k = 0; k < 3; k++) a.set([col.r, col.g, col.b], (t + k) * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    g.applyMatrix4(new THREE.Matrix4().compose(V(bx, by, bz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, bry, 0)), V(1, 1, 1)).multiply(new THREE.Matrix4().compose(V(lx, ly, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1)))); parts.push(g); };
  const W = (bx, bz, bry, lx, lz) => [bx + Math.cos(bry) * lx + Math.sin(bry) * lz, bz - Math.sin(bry) * lx + Math.cos(bry) * lz];
  const segD = (x, z, p) => { let d = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)); d = Math.min(d, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return d; };
  const hill = (x, z) => !!(terrainAt && terrainAt(x, z) > 0.3);
  const used = [];
  const clear = (x, z, r, P) => x > P.r[0] + r + 1 && x < P.r[1] - r - 1 && z > P.r[2] + r + 1 && z < P.r[3] - r - 1 && !L.inLake(x, z) && L.lakeF(x, z) > 1.14 && ![[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].some(([a, b]) => hill(x + a, z + b))
    && !bases.some(t => Math.abs(x - t.x) < t.w / 2 + r + 4 && Math.abs(z - t.z) < t.d / 2 + r + 4) && !L.ROADS.some(R => segD(x, z, R.p) < R.w / 2 + r + 2.5) && !L.BUILDINGS.some(b => x > b.f[0] - r - 2 && x < b.f[1] + r + 2 && z > b.f[2] - r - 2 && z < b.f[3] + r + 2)
    && !(SK.features || []).some(f => Math.hypot(x - f.at[0], z - f.at[1]) < r + 10) && !districts.doors.some(([dx, dz, fx, fz]) => segD(x, z, [[dx, dz], [dx + fx * 30, dz + fz * 30]]) < r + 3.5)
    && !C.some(c => c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : Math.hypot(x - c.c[0], z - c.c[1]) < c.c[2] + r) && !used.some(([a, b, rr]) => Math.hypot(x - a, z - b) < rr + r + 2)
    && segD(x, z, [...L.TRAIN.line, L.TRAIN.line[0]]) > r + 6;
  const find = (P, r, tries = 160) => { for (let k = 0; k < tries; k++) { const x = P.r[0] + rnd() * (P.r[1] - P.r[0]), z = P.r[2] + rnd() * (P.r[3] - P.r[2]); if (clear(x, z, r, P)) { used.push([x, z, r]); return [x, z]; } } return null; };
  const ring = (x, z, r) => C.push({ c: [x, z, r] });
  const shrubs = [], totems = [];
  const STR = [['#2e4a6b', WHITE], [RED, WHITE], ['#3f7a52', WHITE], ['#e0a020', WHITE]];
  const kiosk = (x, z, ry, sc) => { const [a, b] = sc;
    part(B(3.2, 2.3, 2.2), (gx, gy) => (gy > 1.0 ? a : WHITE), x, 1.15, z, ry); part(B(3.0, 0.1, 0.6), WOOD, x, 1.05, z, ry, 0, 0, 1.35);
    part(B(2.6, 0.9, 0.04), INK, x, 1.55, z, ry, 0, 0, 1.11);
    for (let k = 0; k < 6; k++) part(B(0.6, 0.06, 1.3), k % 2 ? b : a, x, 2.5, z, ry, -1.5 + k * 0.6, 0, 1.5, 0.32);
    part(B(3.4, 0.1, 2.4), INK, x, 2.37, z, ry); part(B(1.2, 0.5, 0.1), RED, x, 2.75, z, ry, 0, 0, 1.0);
    for (const ox of [-0.8, 0, 0.8]) part(Cy(0.12, 0.09, 0.22, 8), [WHITE, RED, INK][Math.abs(Math.round(ox / 0.8)) % 3], x, 1.21, z, ry, ox, 0, 1.4);
    const [p0, q0] = W(x, z, ry, -0.9, 0), [p1, q1] = W(x, z, ry, 0.9, 0); ring(p0, q0, 1.35); ring(p1, q1, 1.35); };
  const FK = 1.35, FS = g => g.scale(FK, FK, FK);   // s174 FOX SCALE: café table top 1.0 m, chair seat 0.61 m, seat cubes 0.62 m
  const table = (x, z) => { part(FS(Cy(0.38, 0.38, 0.04, 14)), WHITE, x, 0.74 * FK, z); part(FS(Cy(0.03, 0.03, 0.72, 6)), INK, x, 0.37 * FK, z); part(FS(Cy(0.22, 0.22, 0.03, 10)), INK, x, 0.02 * FK, z);
    for (const a of [0.5, 0.5 + Math.PI]) { const cx = x + Math.cos(a) * 0.72 * FK, cz = z + Math.sin(a) * 0.72 * FK, ry = -a - Math.PI / 2; part(FS(B(0.4, 0.04, 0.4)), INK, cx, 0.45 * FK, cz, ry); part(FS(B(0.4, 0.42, 0.04)), INK, cx, 0.66 * FK, cz, ry, 0, 0, -0.2 * FK); for (const ox of [-0.17, 0.17]) for (const oz of [-0.17, 0.17]) part(FS(B(0.03, 0.44, 0.03)), INK, cx, 0.22 * FK, cz, ry, ox * FK, 0, oz * FK); }
    ring(x, z, 1.35); };
  const planter = (x, z, w, d) => { part(B(w, 0.55, d), STONE, x, 0.275, z); part(B(w + 0.14, 0.08, d + 0.14), STONED, x, 0.58, z); part(B(w - 0.3, 0.04, d - 0.3), SOIL, x, 0.57, z);
    for (let i = 0; i < Math.round(w * d / 3); i++) shrubs.push([x + (rnd() - 0.5) * (w - 0.8), 0.55, z + (rnd() - 0.5) * (d - 0.8), 0.7 + rnd() * 0.35]); C.push({ f: [x - w / 2, x + w / 2, z - d / 2, z + d / 2] }); };
  const bikes = (x, z, ry) => { for (let i = 0; i < 5; i++) { const lx = -2 + i; part(new THREE.TorusGeometry(0.42, 0.04, 5, 16), STEEL, x, 0.46, z, ry, lx, 0, 0, 0, Math.PI / 2); }
    for (const i of [0, 2, 3]) { const lx = -2 + i, bc = [RED, '#2e4a6b', WHITE][i % 3]; for (const oz of [-0.5, 0.5]) part(new THREE.TorusGeometry(0.33, 0.035, 5, 16), INK, x, 0.35, z, ry, lx + 0.12, 0, oz, 0, Math.PI / 2);
      part(B(0.05, 0.05, 0.9), bc, x, 0.62, z, ry, lx + 0.12, 0, 0, 0.35); part(B(0.05, 0.4, 0.05), bc, x, 0.55, z, ry, lx + 0.12, 0, -0.25); part(B(0.08, 0.05, 0.25), INK, x, 0.8, z, ry, lx + 0.12, 0, -0.25); part(B(0.5, 0.04, 0.04), INK, x, 0.85, z, ry, lx + 0.12, 0, 0.42); }
    const [p0, q0] = W(x, z, ry, -1.4, 0), [p1, q1] = W(x, z, ry, 1.4, 0); ring(p0, q0, 1.2); ring(p1, q1, 1.2); };
  const cubes = (x, z) => { for (let i = 0; i < 3; i++) { const a = i * 2.1 + rnd(), cx = x + Math.cos(a) * 1.45, cz = z + Math.sin(a) * 1.45; part(B(0.78, 0.62, 0.78), i % 2 ? STONE : STONED, cx, 0.31, cz, rnd()); ring(cx, cz, 0.5); } };
  const totem = (x, z, ry, name) => { part(B(0.7, 2.4, 0.22), RED, x, 1.2, z, ry); part(B(0.8, 0.12, 0.3), INK, x, 0.06, z, ry); totems.push([x, z, ry, name]); ring(x, z, 0.45); };

  const done = new Set();
  for (const P of SK.plazas) { const big = (P.r[1] - P.r[0]) * (P.r[3] - P.r[2]) > 12000, sc = STR[Object.keys(NAMES).indexOf(P.key) % 4];
    if (!done.has(P.key)) { const k = find(P, 5); if (k) { const sp = SK.spines[P.key], ry = sp ? Math.atan2(sp[sp.length - 1][0] - k[0], sp[sp.length - 1][1] - k[1]) : rnd() * 6.28; kiosk(k[0], k[1], ry, sc);
        for (const [lx, lz] of [[-3.4, 4.9], [0, 5.9], [3.4, 4.9]]) { const [tx, tz] = W(k[0], k[1], ry, lx, lz); if (!C.some(c => c.c && Math.hypot(tx - c.c[0], tz - c.c[1]) < c.c[2] + 0.9)) table(tx, tz); } }
      const t = find(P, 1.5); if (t) { const sp = SK.spines[P.key], e = sp ? sp[0] : t; totem(t[0], t[1], Math.atan2(e[0] - t[0], e[1] - t[1]), NAMES[P.key] || 'MERU'); } done.add(P.key); }
    for (let i = 0; i < (big ? (touch ? 3 : 4) : 2); i++) { const w = 3 + rnd() * 2.5, d = 1.8 + rnd() * 0.8, p = find(P, Math.max(w, d) / 2 + 0.5); if (p) planter(p[0], p[1], rnd() < 0.5 ? w : d, rnd() < 0.5 ? d : w); }
    { const b = find(P, 3); if (b) bikes(b[0], b[1], Math.round(rnd() * 2) * Math.PI / 2); }
    if (big) for (let i = 0; i < 2; i++) { const c = find(P, 2); if (c) cubes(c[0], c[1]); } }

  { let n = 0; for (const g of parts) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); cl.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(cl, 3)); G.computeBoundingSphere();
    const grad = (() => { const d = new Uint8Array([90, 170, 255]), t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
    const m = new THREE.Mesh(G, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); m.castShadow = !touch; m.receiveShadow = true; root.add(m); }
  // totem faces: one canvas column per totem (name + arrow + MERU), both faces, 1 draw
  if (totems.length) { const cv = document.createElement('canvas'); cv.width = 128 * totems.length; cv.height = 448; const g = cv.getContext('2d');
    totems.forEach(([, , , name], i) => { const x0 = i * 128; g.fillStyle = '#ec3013'; g.fillRect(x0, 0, 128, 448); g.fillStyle = '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('MERU', x0 + 12, 14);
      g.fillRect(x0 + 12, 46, 104, 3); g.font = '900 26px Archivo, sans-serif'; name.split(' ').forEach((w, j) => g.fillText(w, x0 + 12, 64 + j * 30, 108));
      g.fillStyle = '#201e1d'; g.fillRect(x0, 330, 128, 118); g.fillStyle = '#ffffff'; g.font = '800 18px Archivo, sans-serif'; g.fillText('TOWN SQUARE', x0 + 12, 346, 108); g.beginPath(); g.moveTo(x0 + 14, 400); g.lineTo(x0 + 60, 400); g.lineTo(x0 + 60, 388); g.lineTo(x0 + 82, 408); g.lineTo(x0 + 60, 428); g.lineTo(x0 + 60, 416); g.lineTo(x0 + 14, 416); g.fill(); });
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const P = [], U = [], n = totems.length;
    totems.forEach(([x, z, ry], i) => { for (const s of [1, -1]) { const q = [[-0.33, 0.12], [0.33, 0.12], [0.33, 2.35], [-0.33, 2.35]].map(([lx, y]) => { const [wx, wz] = W(x, z, ry, lx * s, 0.115 * s); return [wx, y, wz]; }), u0 = i / n, u1 = (i + 1) / n, uv = [[u0, 0], [u1, 0], [u1, 1], [u0, 1]];
      for (const j of [0, 1, 2, 0, 2, 3]) { P.push(...q[j]); U.push(...uv[j]); } } });
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); G.computeVertexNormals();
    root.add(new THREE.Mesh(G, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }))); }
  if (shrubs.length) root.add(plantShrubs(shrubs));
  let cullT = 0; const far = touch ? 150 : 260;
  return { stats: { kiosks: done.size, totems: totems.length, shrubs: shrubs.length },
    tick(dt, cam) { if ((cullT -= dt) > 0) return; cullT = 0.4; let near = false; for (const P of SK.plazas) { const dx = Math.max(P.r[0] - cam.x, 0, cam.x - P.r[1]), dz = Math.max(P.r[2] - cam.z, 0, cam.z - P.r[3]); if (Math.hypot(dx, dz) < far) near = true; } root.visible = near || cam.y > 150; } };
}
