// MERU 2.0 — exterior polish round 10: HILLS + FALLS. Dressing on top of worlds/meru2-heights.js (data in meru2-layout.js HILLS / TRAILS).
// TRAILS: a red finger post at each trail foot (the hill's own zone name), timber step logs across the steep stretches, one rest bench
// halfway up each trail facing the view. FALLS: a faster front veil over the main sheet, a white curl at the lip, rising spray at the foot,
// two ripple rings in the plunge pool, dark wet mossy rocks either side of the drop, reeds round the plunge pool, ferns along the stream lip,
// stepping stones over the outflow stream, a bench + red coin telescope on the overlook deck. CASTLE RIDGE lookout: bench, telescope,
// a stone cairn. HILL PARK: a flower ring round the summit plaza, 3 picnic tables behind it. Decoration only, no people or lines.
// Draws: 1 merged vertex-coloured toon mesh + sign faces + reeds + shrubs + flowers (2) + falls anim (veil, spray, 2 rings) ≈ 10.
// Colliders pushed into heights.colliders (before the grass bake). Hidden with distance.
import { plantShrubs, plantReeds, plantFlowers } from './meru2-flora.js';
export function buildHillsDress({ THREE, scene, L, heights, touch }) {
  const root = new THREE.Group(); root.name = 'meru2HillsDress'; scene.add(root); const T = (x, z) => heights.terrainAt(x, z), C = heights.colliders, parts = [], col = new THREE.Color(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  let seed = 10010; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, n = 8) => new THREE.CylinderGeometry(a, b, h, n);
  const INK = '#201e1d', RED = '#ec3013', WHITE = '#f3f2f2', STONE = '#b9b3a9', STONED = '#8f8a82', WET = '#4f4c47', MOSS = '#56723c', WOOD = '#9a7550', WOODD = '#6f5236', BRASS = '#c9a24a';
  const part = (geo, c, bx, by, bz, bry = 0, lx = 0, ly = 0, lz = 0, rx = 0, ry = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); for (const k of ['uv', 'uv1']) if (g.attributes[k]) g.deleteAttribute(k);
    const P = g.attributes.position, n = P.count, a = new Float32Array(n * 3);
    for (let t = 0; t < n; t += 3) { const h = typeof c === 'function' ? c((P.getY(t) + P.getY(t + 1) + P.getY(t + 2)) / 3) : c; col.set(h); for (let k = 0; k < 3; k++) a.set([col.r, col.g, col.b], (t + k) * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
    g.applyMatrix4(new THREE.Matrix4().compose(V(bx, by, bz), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, bry, 0)), V(1, 1, 1)).multiply(new THREE.Matrix4().compose(V(lx, ly, lz), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(1, 1, 1)))); parts.push(g); };
  const W = (bx, bz, bry, lx, lz) => [bx + Math.cos(bry) * lx + Math.sin(bry) * lz, bz - Math.sin(bry) * lx + Math.cos(bry) * lz];
  const ring = (x, z, r) => C.push({ c: [x, z, r] });
  const shrubs = [], reeds = [], flowers = [], signs = [];
  // bench faces local +z
  const FK = 1.35, SK = g => g.scale(FK, FK, FK);   // s174 FOX SCALE (seat 0.61 m)
  const bench = (x, y, z, ry, coll = true) => { part(SK(B(1.8, 0.08, 0.45)), WOOD, x, y + 0.45 * FK, z, ry); part(SK(B(1.8, 0.4, 0.06)), WOOD, x, y + 0.78 * FK, z, ry, 0, 0, -0.24 * FK, -0.12); for (const lx of [-0.75, 0.75]) part(SK(B(0.08, 0.47, 0.42)), INK, x, y + 0.22 * FK, z, ry, lx * FK); if (coll) ring(x, z, 1.3); };
  const scope = (x, y, z, tx, tz) => { const ry = Math.atan2(tx - x, tz - z); part(B(0.5, 0.06, 0.5), INK, x, y + 0.03, z); part(Cy(0.07, 0.09, 1.1), INK, x, y + 0.6, z); part(Cy(0.11, 0.15, 0.75, 10), RED, x, y + 1.25, z, ry, 0, 0, 0.05, Math.PI / 2 - 0.12); part(Cy(0.12, 0.12, 0.06, 10), BRASS, x, y + 1.29, z, ry, 0, 0, 0.42, Math.PI / 2 - 0.12); };
  const rock = (x, y, z, r, sy = 0.75, dark = false) => { const g = new THREE.DodecahedronGeometry(r, 0); g.scale(1, sy, 1); part(g, dark ? (gy => gy > r * sy * 0.35 ? MOSS : WET) : (gy => gy > r * sy * 0.45 ? MOSS : STONED), x, y, z, rnd() * 6, 0, 0, 0, rnd() * 0.4, 0, rnd() * 0.3); };
  const segLen = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

  // the heights module's trail lanterns (same rule) so benches + posts keep off them
  const lant = []; for (const Tr of L.TRAILS) { let side = 1; const off = Tr.road ? Tr.w / 2 + 1.0 : 2.2; for (let i = 0; i < Tr.p.length - 1; i++) { const [ax, az] = Tr.p[i], [bx, bz] = Tr.p[i + 1], len = Math.hypot(bx - ax, bz - az), nx = -(bz - az) / len, nz = (bx - ax) / len;
    for (let t = 4; t < len; t += 9) { for (const s of Tr.road ? [1, -1] : [side]) lant.push([ax + (bx - ax) * t / len + nx * off * s, az + (bz - az) * t / len + nz * off * s]); side = -side; } } }   // s38: road trails light both sides
  const nearLant = (x, z, r) => lant.some(([a, b]) => Math.hypot(x - a, z - b) < r);
  const NAME = { fallsTrail: 'MERU FALLS', ridgeTrail: 'MERU CASTLE', parkTrail: 'HILL PARK' };

  // ---------- trails: foot post, step logs, rest bench ----------
  for (const Tr of L.TRAILS) { const p = Tr.p, tot = p.slice(1).reduce((s, q, i) => s + segLen(p[i], q), 0);
    { const [ax, az] = p[0], [bx, bz] = p[1], l = segLen(p[0], p[1]), dx = (bx - ax) / l, dz = (bz - az) / l; let s = 1; if (nearLant(ax - dx + -dz * 2.8, az - dz + dx * 2.8, 2.5)) s = -1; { const inB = (x, z) => (L.BUILDINGS || []).some(b => x > b.f[0] - 0.6 && x < b.f[1] + 0.6 && z > b.f[2] - 0.6 && z < b.f[3] + 0.6); if (inB(ax - dx - dz * 2.8 * s, az - dz + dx * 2.8 * s)) s = -s; }   // s63: the HILL PARK foot post stood inside the Flower Shop
      const x = ax - dx - dz * 2.8 * s, z = az - dz + dx * 2.8 * s, y = T(x, z), ry = Math.atan2(-dz, dx);
      part(B(0.14, 2.9, 0.14), INK, x, y + 1.45, z); part(B(0.3, 0.1, 0.3), INK, x, y + 0.05, z); part(B(2.0, 0.44, 0.07), RED, x, y + 2.45, z, ry, 0.85); signs.push([x, y + 2.45, z, ry, NAME[Tr.key] || 'MERU']); ring(x, z, 0.3); }
    let walked = 0; if (!Tr.road) for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], l = segLen(p[i], p[i + 1]), dx = (bx - ax) / l, dz = (bz - az) / l;
      for (let t = 1.2; t < l; t += 2.4) { const x = ax + dx * t, z = az + dz * t, d = walked + t; if (d < 6 || tot - d < 4) continue; const s = (T(x + dx, z + dz) - T(x - dx, z - dz)) / 2; if (Math.abs(s) < 0.1) continue;
        part(Cy(0.11, 0.12, 2.5, 6), WOODD, x, T(x, z) + 0.07, z, Math.atan2(dx, dz), 0, 0, 0, 0, 0, Math.PI / 2); }
      walked += l; }
    { let best = null; const mid = Math.floor((p.length - 1) / 2), [ax, az] = p[mid], [bx, bz] = p[mid + 1], l = segLen(p[mid], p[mid + 1]), dx = (bx - ax) / l, dz = (bz - az) / l;
      for (const t of [0.35, 0.5, 0.65]) for (const s of [1, -1]) { const ofs = Tr.road ? Tr.w / 2 + 1.6 : 3.4, x = ax + (bx - ax) * t - dz * ofs * s, z = az + (bz - az) * t + dx * ofs * s; if (nearLant(x, z, 2.6)) continue; const gx = T(x + 1, z) - T(x - 1, z), gz = T(x, z + 1) - T(x, z - 1), sl = Math.hypot(gx, gz) / 2; if (!best || sl < best.sl) best = { x, z, sl, gx, gz }; }
      if (best && best.sl < 0.45) { const ry = Math.atan2(-best.gx, -best.gz); bench(best.x, T(best.x, best.z) - 0.05, best.z, ry); } } }

  // ---------- falls ----------
  const F = L.HILLS.find(h => h.key === 'falls'); let anim = null;
  if (F) { const cx = F.cliff.x, fz = F.falls.z, top = T(cx - 0.5, fz);
    part(Cy(0.32, 0.32, 3.3, 8), WHITE, cx + 2.35, top + 0.02, fz, 0, 0, 0, 0, Math.PI / 2);   // the curl at the lip
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const x = cx + 1.5 + k * 1.4, z = fz + s * (3.2 + rnd() * 1.5); rock(x, 0.15, z, 0.9 + rnd() * 0.6, 0.65, true); ring(x, z, 0.9); }
    { const px = cx + 9; for (let k = 0; k < (touch ? 10 : 16); k++) { const side = k % 2 ? 1 : -1, a = side * (0.55 + rnd() * 1.9), x = px + Math.cos(a) * (7.4 + rnd() * 1.2), z = fz + Math.sin(a) * (7.4 + rnd() * 1.2); reeds.push([x, 0.02, z, 0.7 + rnd() * 0.5]); } }
    for (let k = 0; k < (touch ? 6 : 10); k++) { const x = cx - 2 - rnd() * 18, z = fz + (k % 2 ? 1 : -1) * (2.4 + rnd() * 1.4); shrubs.push([x, T(x, z) - 0.05, z, 0.55 + rnd() * 0.35]); }
    { const sx = cx + 21, zc = fz + Math.sin(sx * 0.15) * 1.5; for (const o of [-2.1, -0.7, 0.7, 2.1]) part(Cy(0.46, 0.52, 0.2, 9), STONE, sx + (rnd() - 0.5) * 0.3, 0.12, zc + o); }
    { const dr = [cx - 6, cx + 2.5, fz - 18, fz - 10], dy = T(dr[0], (dr[2] + dr[3]) / 2) + 0.3; bench(cx - 3.2, dy, fz - 16.7, 0); scope(cx + 1.4, dy, fz - 11.1, cx + 40, fz + 25); }
    // animation: front veil, spray, ripple rings
    const ag = new THREE.Group(); root.add(ag);
    const vc = document.createElement('canvas'); vc.width = 64; vc.height = 256; { const g = vc.getContext('2d'); for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${0.35 + Math.random() * 0.5})`; g.fillRect(Math.random() * 64, Math.random() * 256, 1 + Math.random() * 3, 30 + Math.random() * 80); } }
    const vt = new THREE.CanvasTexture(vc); vt.wrapS = vt.wrapT = THREE.RepeatWrapping; vt.repeat.set(1, 1.4);
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(2.3, top), new THREE.MeshBasicMaterial({ map: vt, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide })); veil.rotation.y = Math.PI / 2; veil.position.set(cx + 2.8, top / 2, fz); ag.add(veil);
    const gc = document.createElement('canvas'); gc.width = gc.height = 32; { const g = gc.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); }
    const N = touch ? 50 : 120, sp = new Float32Array(N * 3), sc = new Float32Array(N * 3), P = []; for (let i = 0; i < N; i++) P.push({ life: 0, wait: rnd() * 2.4 });
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
    const spray = new THREE.Points(sg, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(gc), size: 1.1, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); spray.frustumCulled = false; ag.add(spray);
    const rings = [0, 1].map(i => { const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.1, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(cx + 3.6, 0.13, fz); ag.add(m); return m; });
    anim = { ag, at: [cx + 4, fz], tick(dt, t) { vt.offset.y = (vt.offset.y + dt * 2.7) % 1;
      for (let i = 0; i < N; i++) { const q = P[i]; if (q.wait > 0) { q.wait -= dt; sc.fill(0, i * 3, i * 3 + 3); continue; } q.life -= dt; if (q.life <= 0) { q.max = q.life = 1.4 + rnd() * 1.2; q.x = cx + 2.9 + rnd() * 1.4; q.y = 0.2; q.z = fz + (rnd() - 0.5) * 3; q.vx = 0.5 + rnd() * 1.3; q.vy = 1.0 + rnd() * 1.8; q.vz = (rnd() - 0.5) * 0.9; }
        q.vy -= 0.5 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; const f = Math.min(1, q.life / q.max * 1.6) * 0.3; sp.set([q.x, q.y, q.z], i * 3); sc.set([f, f, f], i * 3); }
      sg.attributes.position.needsUpdate = sg.attributes.color.needsUpdate = true;
      rings.forEach((m, i) => { const u = ((t / 2.4) + i * 0.5) % 1; m.scale.setScalar(1 + u * 4); m.material.opacity = 0.5 * (1 - u); }); } }; }

  // ---------- Castle Ridge lookout ----------
  { const R = L.HILLS.find(h => h.key === 'ridge'); if (R && R.lookout) { const [lx, lz] = R.lookout, r = [lx - 5, lx + 5, lz - 5, lz + 5]; let top = 0; for (let x = r[0]; x <= r[1]; x += 2.5) for (let z = r[2]; z <= r[3]; z += 2.5) top = Math.max(top, T(x, z)); const y = top + 0.6;
    bench(lx + 1.2, y, lz - 3.7, 0); scope(lx + 4.1, y, lz - 4.1, 0, 0);
    { const x = lx + 8.5, z = lz + 1.5, g = T(x, z); let h = g; for (let k = 0; k < 5; k++) { const r0 = 0.75 - k * 0.12; rock(x + (rnd() - 0.5) * 0.15, h + r0 * 0.5, z + (rnd() - 0.5) * 0.15, r0, 0.6); h += r0 * 0.75; } ring(x, z, 0.9); } } }

  // ---------- Hill Park: flower ring + picnic tables ----------
  { const Pk = L.HILLS.find(h => h.key === 'park'), Tr = L.TRAILS.find(t => t.key === 'parkTrail'); if (Pk && Pk.plaza) { const [px, pz] = Pk.c, R = Pk.plaza, end = Tr ? Tr.p[Tr.p.length - 1] : [px, pz + 99], ta = Math.atan2(end[1] - pz, end[0] - px);
    const adiff = (a, b) => Math.abs(((a - b) % 6.2832 + 9.4248) % 6.2832 - 3.1416);
    for (let a = 0; a < 6.283; a += 1.7 / (R + 1.4)) { if (adiff(a, ta) < 0.32) continue; const x = px + Math.cos(a) * (R + 1.5), z = pz + Math.sin(a) * (R + 1.5); flowers.push([x, T(x, z) - 0.02, z, 0.9 + rnd() * 0.4]); }
    const face = Math.atan2(-pz, -px); for (const o of [-0.65, 0, 0.65]) { const a = face + Math.PI + o; if (adiff(a, ta) < 0.6) continue; const x = px + Math.cos(a) * (R + 5), z = pz + Math.sin(a) * (R + 5), y = T(x, z), ry = -a - Math.PI / 2;
      part(SK(B(1.9, 0.07, 0.8)), WOOD, x, y + 0.76 * FK, z, ry); for (const s of [-1, 1]) { part(SK(B(1.9, 0.06, 0.3)), WOOD, x, y + 0.45 * FK, z, ry, 0, 0, s * 0.68 * FK); for (const lx of [-0.75, 0.75]) { part(SK(B(0.08, 0.78, 0.08)), INK, x, y + 0.38 * FK, z, ry, lx * FK, 0, s * 0.3 * FK, s * 0.32); part(SK(B(0.08, 0.44, 0.08)), INK, x, y + 0.22 * FK, z, ry, lx * FK, 0, s * 0.68 * FK); } }
      ring(x, z, 1.65); } } }

  // ---------- merge ----------
  { let n = 0; for (const g of parts) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), cl = new Float32Array(n * 3); let o = 0;
    for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); cl.set(g.attributes.color.array, o * 3); o += g.attributes.position.count; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('color', new THREE.BufferAttribute(cl, 3)); G.computeBoundingSphere();
    const grad = (() => { const d = new Uint8Array([90, 170, 255]), t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
    const m = new THREE.Mesh(G, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad })); m.castShadow = !touch; m.receiveShadow = true; root.add(m); }
  // finger-post faces: one canvas row per post, both faces, 1 draw
  if (signs.length) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = 224 * signs.length; const g = cv.getContext('2d');
    signs.forEach(([, , , , name], i) => { for (const b of [0, 1]) { const y0 = (i * 2 + b) * 112; g.fillStyle = '#ec3013'; g.fillRect(0, y0, 512, 112); g.fillStyle = '#ffffff'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(name, b ? 112 : 24, y0 + 58, 380);
      const ax = b ? [92, 50, 50, 18] : [420, 462, 462, 494]; g.beginPath(); g.moveTo(ax[0], y0 + 40); g.lineTo(ax[1], y0 + 40); g.lineTo(ax[2], y0 + 24); g.lineTo(ax[3], y0 + 56); g.lineTo(ax[2], y0 + 88); g.lineTo(ax[1], y0 + 72); g.lineTo(ax[0], y0 + 72); g.fill(); } });
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const P = [], U = [], n = signs.length;
    signs.forEach(([x, y, z, ry], i) => { for (const s of [1, -1]) { const q = [[-0.97, -0.2], [0.97, -0.2], [0.97, 0.2], [-0.97, 0.2]].map(([lx, ly]) => { const [wx, wz] = W(x, z, ry, 0.85 + lx * s, 0.04 * s); return [wx, y + ly, wz]; }), r2 = i * 2 + (s < 0 ? 1 : 0), v0 = 1 - (r2 + 1) / (n * 2), v1 = 1 - r2 / (n * 2), uv = [[0, v0], [1, v0], [1, v1], [0, v1]];
      for (const j of [0, 1, 2, 0, 2, 3]) { P.push(...q[j]); U.push(...uv[j]); } } });
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); G.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); G.computeVertexNormals();
    root.add(new THREE.Mesh(G, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }))); }
  if (shrubs.length) root.add(plantShrubs(shrubs)); if (reeds.length) root.add(plantReeds(reeds)); if (flowers.length) root.add(plantFlowers(flowers));
  const spots = L.HILLS.filter(h => !h.wild).map(h => h.c || [(h.a[0] + h.b[0]) / 2, (h.a[1] + h.b[1]) / 2]), far = touch ? 170 : 280, afar = touch ? 120 : 200;
  let cullT = 0, t = 0;
  return { stats: { signs: signs.length, reeds: reeds.length, shrubs: shrubs.length, flowers: flowers.length },
    tick(dt, cam) { t += dt; if ((cullT -= dt) <= 0) { cullT = 0.4; root.visible = cam.y > 150 || spots.some(([x, z]) => Math.hypot(x - cam.x, z - cam.z) < far); if (anim) anim.ag.visible = Math.hypot(anim.at[0] - cam.x, anim.at[1] - cam.z) < afar; }
      if (anim && root.visible && anim.ag.visible) anim.tick(dt, t); } };
}
