// Meru 2 overlap scan: run in the page (window.__meru2 must exist). Logs JSON with console.log('SCAN', ...)
// coplanar faces from different meshes (z-fighting): flat things whose top faces sit at the same height, thin wall decals on the same plane
export function zfight(opt = {}) {
  const M = window.__meru2, { THREE, scene } = M.K, bb = new THREE.Box3(), m4 = new THREE.Matrix4(), mw = new THREE.Matrix4(), faces = [];
  let id = 0; scene.updateMatrixWorld(true);
  scene.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; let vis = true, p = o; while (p) { if (p.visible === false) vis = false; if (opt.skip && opt.skip.includes(p)) vis = false; p = p.parent; } if (!vis) return;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material; if (mat && (mat.transparent && mat.depthWrite === false) || (mat && mat.polygonOffset)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const me = id++, tag = o.geometry.type.replace('Geometry', '') + o.geometry.attributes.position.count + '#' + (mat && mat.color ? mat.color.getHexString() : '') + ' n' + (o.isInstancedMesh ? o.count : 1) + ' ' + (o.parent && o.parent.name || '');
    const push = () => { const b = [bb.min.x, bb.max.x, bb.min.y, bb.max.y, bb.min.z, bb.max.z]; const ex = [b[1] - b[0], b[3] - b[2], b[5] - b[4]];
      if (ex[1] < 0.25 && ex[0] > 0.3 && ex[2] > 0.3) faces.push({ me, tag, ax: 1, v: b[3], r: [b[0], b[1], b[4], b[5]] });
      if (ex[0] < 0.03 && ex[1] > 0.2 && ex[2] > 0.2) faces.push({ me, tag, ax: 0, v: (b[0] + b[1]) / 2, r: [b[2], b[3], b[4], b[5]] });
      if (ex[2] < 0.03 && ex[1] > 0.2 && ex[0] > 0.2) faces.push({ me, tag, ax: 2, v: (b[4] + b[5]) / 2, r: [b[0], b[1], b[2], b[3]] }); };
    if (o.isInstancedMesh) { for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); mw.multiplyMatrices(o.matrixWorld, m4); bb.copy(o.geometry.boundingBox).applyMatrix4(mw); push(); } } else { bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); push(); } });
  const buck = new Map(); for (const f of faces) { const k = f.ax + ':' + Math.round(f.v / 0.004); (buck.get(k) || buck.set(k, []).get(k)).push(f); }
  const out = {}; for (const [k, L2] of buck) { if (L2.length < 2) continue; const nb = []; const [ax, q] = k.split(':'); for (const d of [-1, 1]) { const o2 = buck.get(ax + ':' + (+q + d)); if (o2) nb.push(...o2); }
    const all = L2.concat(nb); for (let a = 0; a < L2.length; a++) for (let b = 0; b < all.length; b++) { const A = L2[a], B = all[b]; if (A.me === B.me || Math.abs(A.v - B.v) > 0.004) continue;
      const ox = Math.min(A.r[1], B.r[1]) - Math.max(A.r[0], B.r[0]), oz = Math.min(A.r[3], B.r[3]) - Math.max(A.r[2], B.r[2]); if (ox < 0.15 || oz < 0.15) continue;
      const t = ['ax' + ax, A.tag, B.tag].join(' | '); if (A.tag > B.tag) continue; const P = out[t] || (out[t] = { n: 0, ex: [], v: A.v }); P.n++; if (P.ex.length < 5) P.ex.push([+((Math.max(A.r[0], B.r[0]) + Math.min(A.r[1], B.r[1])) / 2).toFixed(1), +((Math.max(A.r[2], B.r[2]) + Math.min(A.r[3], B.r[3])) / 2).toFixed(1)]); } }
  const res = Object.entries(out).sort((a, b) => b[1].n - a[1].n).slice(0, opt.top || 50); res.forEach(([t, p]) => console.log('Z ' + p.n + ' v=' + p.v.toFixed(3) + ' ' + t + ' @' + JSON.stringify(p.ex))); return res;
}
// text signs (canvas-textured meshes) whose boxes intersect another sign
export function signClash(opt = {}) {
  const { THREE, scene } = window.__meru2.K, S = [], bb = new THREE.Box3(); scene.updateMatrixWorld(true);
  scene.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || !m.map || !(m.map.image instanceof HTMLCanvasElement)) return; let vis = true, p = o; while (p) { if (p.visible === false) vis = false; p = p.parent; } if (!vis) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); const s = bb.getSize(new THREE.Vector3()); if (s.x > 30 || s.z > 30) return; S.push({ o, b: bb.clone(), img: m.map.image, tex: m.map.uuid }); });
  const out = []; for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) { const A = S[i], B = S[j]; if (A.tex === B.tex) continue; const I = A.b.clone().intersect(B.b); if (I.isEmpty()) continue; const s = I.getSize(new THREE.Vector3()); if (s.y < 0.08 || Math.max(s.x, s.z) < 0.08) continue;
    const c = I.getCenter(new THREE.Vector3()); out.push('S ' + A.img.width + 'x' + A.img.height + ' x ' + B.img.width + 'x' + B.img.height + ' at ' + [c.x, c.y, c.z].map(v => v.toFixed(1)) + ' size ' + [s.x, s.y, s.z].map(v => v.toFixed(2))); }
  out.slice(0, opt.top || 60).forEach(s => console.log(s)); console.log('S done ' + out.length + ' of ' + S.length + ' signs'); return out;
}
// small props on hills / Pearl Island: floating above or sunk into the terrain
export function groundFit(opt = {}) {
  const M = window.__meru2, { THREE, scene, L } = M.K, H = M.heights, bb = new THREE.Box3(), m4 = new THREE.Matrix4(), mw = new THREE.Matrix4(), out = {};
  const gAt = (x, z) => { let g = H.terrainAt ? H.terrainAt(x, z) : 0; const ir = L.islandR(x, z); if (ir < L.ISLAND.c[2] + 6) g = Math.max(g, L.islandAt(x, z)); return g; };
  scene.updateMatrixWorld(true);
  scene.traverse(o => { if (!o.isInstancedMesh) return; let vis = true, p = o; while (p) { if (p.visible === false) vis = false; p = p.parent; } if (!vis) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const tag = o.geometry.type.replace('Geometry', '') + o.geometry.attributes.position.count + ' n' + o.count + ' ' + (o.parent.name || '');
    for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); mw.multiplyMatrices(o.matrixWorld, m4); bb.copy(o.geometry.boundingBox).applyMatrix4(mw); const w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z, h = bb.max.y - bb.min.y; if (w > 9 || d > 9 || h < 0.25 || h > 14) continue;
      const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2; const gs = [gAt(cx, cz), gAt(bb.min.x, bb.min.z), gAt(bb.max.x, bb.max.z), gAt(bb.min.x, bb.max.z), gAt(bb.max.x, bb.min.z)], g = gs[0], gmin = Math.min(...gs); if (g < 0.4) continue;
      let k = null; if (bb.min.y > g + 0.5 && bb.min.y < g + 3) k = 'FLOAT'; else if (bb.max.y < g + 0.15) k = 'BURIED'; if (!k) continue; if (H.groundAt) { const pg = H.groundAt(cx, cz, bb.min.y + 0.2); if (pg != null && Math.abs(pg - bb.min.y) < 0.4) continue; }
      const t = k + ' ' + tag, P = out[t] || (out[t] = { n: 0, ex: [] }); P.n++; if (P.ex.length < 5) P.ex.push([+cx.toFixed(1), +cz.toFixed(1), +(bb.min.y - g).toFixed(2)]); } });
  const res = Object.entries(out).sort((a, b) => b[1].n - a[1].n); res.forEach(([t, p]) => console.log('G ' + p.n + ' ' + t + ' @' + JSON.stringify(p.ex))); console.log('G done ' + res.length); return res;
}
// near-coplanar axis-aligned faces from different meshes facing the same way (gap < tol): the flicker candidates
export function faceFight(opt = {}) {
  const M = window.__meru2, { THREE, scene } = M.K, tol = opt.tol || 0.03, R = opt.rect || [-470, 470, -470, 470], buck = new Map(), CELL = 0.01;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), m4 = new THREE.Matrix4(), mw = new THREE.Matrix4(); let id = 0, tris = 0;
  scene.updateMatrixWorld(true);
  const skipG = opt.skip || [];
  scene.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; let vis = true, p = o; while (p) { if (p.visible === false || skipG.includes(p)) vis = false; p = p.parent; } if (!vis) return;
    const mat = Array.isArray(o.material) ? o.material[0] : o.material; if (!mat || (mat.transparent && mat.depthWrite === false && !mat.map)) return; const g = o.geometry, P = g.attributes.position, I = g.index, nt = (I ? I.count : P.count) / 3;
    if (o.isInstancedMesh && nt * o.count > 60000) return; if (nt > 120000) return;
    const me = id++, tag = g.type.replace('Geometry', '') + P.count + (mat.map ? '+tex' : '') + '#' + (mat.color ? mat.color.getHexString() : '') + ' ' + (o.parent && o.parent.name || '') + (mat.polygonOffset ? ' PO' : '');
    const inst = o.isInstancedMesh ? o.count : 1;
    for (let q = 0; q < inst; q++) { if (o.isInstancedMesh) { o.getMatrixAt(q, m4); mw.multiplyMatrices(o.matrixWorld, m4); } else mw.copy(o.matrixWorld);
      for (let t = 0; t < nt; t++) { const i0 = I ? I.getX(t * 3) : t * 3, i1 = I ? I.getX(t * 3 + 1) : t * 3 + 1, i2 = I ? I.getX(t * 3 + 2) : t * 3 + 2;
        a.fromBufferAttribute(P, i0).applyMatrix4(mw); b.fromBufferAttribute(P, i1).applyMatrix4(mw); c.fromBufferAttribute(P, i2).applyMatrix4(mw);
        const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3; if (cx < R[0] || cx > R[1] || cz < R[2] || cz > R[3]) continue;
        n.subVectors(b, a).cross(c.clone().sub(a)); const L = n.length(); if (L < 1e-6) continue; n.divideScalar(L); let ax = -1; for (let k = 0; k < 3; k++) if (Math.abs(n.getComponent(k)) > 0.995) ax = k; if (ax < 0) continue;
        const v = (a.getComponent(ax) + b.getComponent(ax) + c.getComponent(ax)) / 3, u1 = (ax + 1) % 3, u2 = (ax + 2) % 3, sgn = n.getComponent(ax) > 0 ? 1 : -1;
        const r = [Math.min(a.getComponent(u1), b.getComponent(u1), c.getComponent(u1)), Math.max(a.getComponent(u1), b.getComponent(u1), c.getComponent(u1)), Math.min(a.getComponent(u2), b.getComponent(u2), c.getComponent(u2)), Math.max(a.getComponent(u2), b.getComponent(u2), c.getComponent(u2))];
        if (r[1] - r[0] < 0.05 || r[3] - r[2] < 0.05) continue; tris++;
        const key = ax + ':' + sgn + ':' + Math.round(v / CELL); (buck.get(key) || buck.set(key, []).get(key)).push({ me, tag, v, r, ax }); } } });
  const out = {}, span = Math.ceil(tol / CELL);
  for (const [key, list] of buck) { const [ax, sg, q] = key.split(':'); for (let d = 0; d <= span; d++) { const o2 = d ? buck.get(ax + ':' + sg + ':' + (+q + d)) : list; if (!o2) continue;
    for (const A of list) for (const B of o2) { if (A.me === B.me || (d === 0 && A.me > B.me)) continue; const gap = Math.abs(A.v - B.v); if (gap > tol) continue;
      const ox = Math.min(A.r[1], B.r[1]) - Math.max(A.r[0], B.r[0]), oy = Math.min(A.r[3], B.r[3]) - Math.max(A.r[2], B.r[2]); if (ox < 0.04 || oy < 0.04) continue;
      const t = 'ax' + ax + ' ' + [A.tag, B.tag].sort().join('  ~  '); const P = out[t] || (out[t] = { n: 0, ex: [], gmin: 9, area: 0 }); P.n++; P.gmin = Math.min(P.gmin, gap); P.area += ox * oy;
      if (P.ex.length < 4) { const p3 = [0, 0, 0]; p3[+ax] = A.v; p3[(+ax + 1) % 3] = (Math.max(A.r[0], B.r[0]) + Math.min(A.r[1], B.r[1])) / 2; p3[(+ax + 2) % 3] = (Math.max(A.r[2], B.r[2]) + Math.min(A.r[3], B.r[3])) / 2; P.ex.push(p3.map(x => +x.toFixed(2))); } } } }
  const res = Object.entries(out).sort((x, y) => y[1].area - x[1].area).slice(0, opt.top || 60);
  console.log('FF tris ' + tris + ' groups ' + Object.keys(out).length); res.forEach(([t, p]) => console.log('FF n' + p.n + ' area ' + p.area.toFixed(1) + ' gap>=' + p.gmin.toFixed(4) + ' ' + t + ' @' + JSON.stringify(p.ex))); return res;
}
export function scan(opt = {}) {
  const M = window.__meru2, { THREE, scene, L } = M.K, items = [], bb = new THREE.Box3(), m4 = new THREE.Matrix4(), mw = new THREE.Matrix4();
  const tagOf = o => { let n = [], p = o; while (p && n.length < 4) { if (p.name) n.push(p.name); p = p.parent; } const mat = Array.isArray(o.material) ? o.material[0] : o.material; const col = mat && mat.color ? '#' + mat.color.getHexString() : '';
    const g = o.geometry.boundingBox, sz = [g.max.x - g.min.x, g.max.y - g.min.y, g.max.z - g.min.z].map(v => v.toFixed(1)).join('x'); return (n.join('<') || '') + '|' + o.geometry.type.replace('Geometry', '') + o.geometry.attributes.position.count + col + ' n' + (o.isInstancedMesh ? o.count : 1) + ' ' + sz; };
  let meshId = 0;
  scene.updateMatrixWorld(true);
  scene.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; let vis = true, p = o; while (p) { if (p.visible === false && !opt.hidden) vis = false; p = p.parent; } if (!vis) return;
    if (opt.skip && opt.skip.some(g => { let p = o; while (p) { if (p === g) return true; p = p.parent; } return false; })) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const id = meshId++, tag = tagOf(o);
    if (o.isInstancedMesh) { for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); mw.multiplyMatrices(o.matrixWorld, m4); bb.copy(o.geometry.boundingBox).applyMatrix4(mw); items.push({ id, i, tag, b: [bb.min.x, bb.max.x, bb.min.y, bb.max.y, bb.min.z, bb.max.z] }); } }
    else { bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); items.push({ id, i: -1, tag, b: [bb.min.x, bb.max.x, bb.min.y, bb.max.y, bb.min.z, bb.max.z] }); } });
  const R = opt.rect || [-460, 460, -460, 460];
  const inR = it => { const cx = (it.b[0] + it.b[1]) / 2, cz = (it.b[4] + it.b[5]) / 2; return cx > R[0] && cx < R[1] && cz > R[2] && cz < R[3]; };
  // props: small, standing on/near the ground
  const props = items.filter(it => { const w = it.b[1] - it.b[0], d = it.b[5] - it.b[4], h = it.b[3] - it.b[2]; return inR(it) && w < 9 && d < 9 && w > 0.15 && d > 0.15 && h > 0.25 && h < 14 && it.b[2] < 0.6 && it.b[2] > -0.6; });
  const CS = 6, grid = new Map(), key = (a, b) => a + ',' + b;
  props.forEach((it, k) => { for (let gx = Math.floor(it.b[0] / CS); gx <= Math.floor(it.b[1] / CS); gx++) for (let gz = Math.floor(it.b[4] / CS); gz <= Math.floor(it.b[5] / CS); gz++) { const kk = key(gx, gz); (grid.get(kk) || grid.set(kk, []).get(kk)).push(k); } });
  const seen = new Set(), pairs = {}, core = it => { const w = it.b[1] - it.b[0], d = it.b[5] - it.b[4], sx = w * 0.25, sz = d * 0.25; return [it.b[0] + sx, it.b[1] - sx, it.b[4] + sz, it.b[5] - sz]; };
  for (const list of grid.values()) for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) { const A = props[list[a]], B = props[list[b]]; if (A.id === B.id && !opt.same) continue; const pk = list[a] < list[b] ? list[a] + '-' + list[b] : list[b] + '-' + list[a]; if (seen.has(pk)) continue; seen.add(pk);
    const ca = core(A), cb = core(B); if (ca[0] < cb[1] && cb[0] < ca[1] && ca[2] < cb[3] && cb[2] < ca[3]) { const t = [A.tag, B.tag].sort().join('  X  '); const P = pairs[t] || (pairs[t] = { n: 0, ex: [] }); P.n++; if (P.ex.length < 6) P.ex.push([+((A.b[0] + A.b[1]) / 2).toFixed(1), +((A.b[4] + A.b[5]) / 2).toFixed(1)]); } }
  // props vs walls (city colliders with f, thin) and solid building footprints
  const walls = (M.city.colliders || []).filter(c => c.f && !c.on && Math.min(c.f[1] - c.f[0], c.f[3] - c.f[2]) < 1.2 && Math.max(c.f[1] - c.f[0], c.f[3] - c.f[2]) > 1.5);
  const wallHits = {};
  for (const it of props) { const c = core(it); for (const w of walls) if (c[0] < w.f[1] && w.f[0] < c[1] && c[2] < w.f[3] && w.f[2] < c[3]) { const P = wallHits[it.tag] || (wallHits[it.tag] = { n: 0, ex: [] }); P.n++; if (P.ex.length < 6) P.ex.push([+((it.b[0] + it.b[1]) / 2).toFixed(1), +((it.b[4] + it.b[5]) / 2).toFixed(1)]); break; } }
  // props vs context: inside a building, a tower base, on a road, in the lake, on the train line
  const ctx = {}, hit = (k, it) => { const t = k + '  ' + it.tag, P = ctx[t] || (ctx[t] = { n: 0, ex: [] }); P.n++; if (P.ex.length < 6) P.ex.push([+((it.b[0] + it.b[1]) / 2).toFixed(1), +((it.b[4] + it.b[5]) / 2).toFixed(1)]); };
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };
  const bases = (M.K.scene.getObjectByName && null) || [];
  const tb = (window.__meru2.districts && window.__meru2.districts.bases) || opt.bases || [];
  for (const it of props) { const cx = (it.b[0] + it.b[1]) / 2, cz = (it.b[4] + it.b[5]) / 2, rr = Math.min(it.b[1] - it.b[0], it.b[5] - it.b[4]) * 0.3, small = (it.b[1] - it.b[0]) < 0.7 && (it.b[3] - it.b[2]) < 0.7;
    for (const b of L.BUILDINGS) if (b.f && cx > b.f[0] + 0.3 && cx < b.f[1] - 0.3 && cz > b.f[2] + 0.3 && cz < b.f[3] - 0.3) { hit('IN-BLD ' + b.key, it); break; }
    for (const t of tb) if (Math.abs(cx - t.x) < t.w / 2 && Math.abs(cz - t.z) < t.d / 2) { hit('IN-TOWER', it); break; }
    if (!small) for (const R2 of L.ROADS) if (segD(cx, cz, R2.p) < R2.w / 2 - rr) { hit('ON-ROAD', it); break; }
    if (L.inLake(cx, cz) && it.b[2] > -0.3) hit('IN-LAKE', it);
    if (L.TRAIN && segD(cx, cz, [...L.TRAIN.line, L.TRAIN.line[0]]) < 3) hit('TRAIN-LINE', it);
    if (L.TRAIN && it.b[3] > (opt.deck || 5.6) && segD(cx, cz, [...L.TRAIN.line, L.TRAIN.line[0]]) < 4.5 + Math.max(it.b[1] - it.b[0], it.b[5] - it.b[4]) / 2) hit('UNDER-TRACK-TALL', it); }
  const sortO = o => Object.entries(o).sort((a, b) => b[1].n - a[1].n).slice(0, opt.top || 60);
  const out = { items: items.length, props: props.length, pairs: sortO(pairs), wallHits: sortO(wallHits), ctx: sortO(ctx) }; if (opt.log) out.ctx.forEach(([t, p]) => console.log('C ' + p.n + ' ' + t + ' @' + JSON.stringify(p.ex.slice(0, 5)))); if (opt.log) { console.log('SCAN items ' + out.items + ' props ' + out.props); out.pairs.forEach(([t, p]) => console.log('P ' + p.n + ' ' + t + ' @' + JSON.stringify(p.ex.slice(0, 4)))); out.wallHits.forEach(([t, p]) => console.log('W ' + p.n + ' ' + t + ' @' + JSON.stringify(p.ex.slice(0, 4)))); } return out;
}
