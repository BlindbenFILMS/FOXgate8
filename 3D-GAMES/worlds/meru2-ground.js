// MERU 2.0 — exterior polish: TOWN GROUND. Raised stone KERBS (a real 12 cm seam) wherever Town Square paving meets a lawn, so the
// edges read in 3D and the paths are easy to follow; gaps where a foot path, road or door crosses. 1 instanced draw (+1 for the
// lighter top arris). Painted bands + rings go into the ground texture (paintTownPaving, called by the blockout's ground painter).
export function buildTownGround({ THREE, scene, L, toon, touch, city }) {
  const T = [-160, 160, -140, 150], inT = (x, z) => x > T[0] && x < T[1] && z > T[2] && z < T[3];
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, L2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / L2)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); } return d; };
  const inB = (x, z, m) => L.BUILDINGS.some(b => b.f && x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m);
  const pathD = (x, z) => Math.min(...L.PATHS.map(p => segD(x, z, p.p))), roadD = (x, z) => Math.min(...L.ROADS.map(r => segD(x, z, r.p) - r.w / 2));
  const hard = s => s === 'stone' || s === 'grit' || s === 'wood';
  const pieces = [], seen = new Set();
  for (const S of L.SURFACES) { if (!S.r) continue; const [x0, x1, z0, z1] = S.r; if (x1 < T[0] || x0 > T[1] || z1 < T[2] || z0 > T[3]) continue;
    for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) { const len = Math.hypot(bx - ax, bz - az);
      for (let t = 0.5; t < len; t += 1) { const x = ax + (bx - ax) * t / len, z = az + (bz - az) * t / len; if (!inT(x, z)) continue; const key = Math.round(x * 2) + ',' + Math.round(z * 2); if (seen.has(key)) continue;
        const a = L.surfaceAt(x + nx * 0.45, z + nz * 0.45), b = L.surfaceAt(x - nx * 0.45, z - nz * 0.45); if (hard(a) === hard(b)) continue;
        if (inB(x, z, 1.2) || roadD(x, z) < 2.2 || pathD(x, z) < 3.4 || Math.hypot(x, z) < 8.5) continue; seen.add(key);
        const sx = hard(a) ? -1 : 1; pieces.push([x + nx * 0.12 * sx, z + nz * 0.12 * sx, nx !== 0 ? Math.PI / 2 : 0]); } } }
  const g = new THREE.BoxGeometry(1.02, 0.12, 0.24); g.translate(0, 0.06, 0);
  const gt = new THREE.BoxGeometry(1.02, 0.02, 0.1); gt.translate(0, 0.125, 0.05);
  const im = new THREE.InstancedMesh(g, toon('#bdb6aa'), Math.max(1, pieces.length)), it = new THREE.InstancedMesh(gt, toon('#ddd7cc'), Math.max(1, pieces.length));
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), V = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1);
  pieces.forEach(([x, z, r], i) => { M4.compose(V.set(x, 0, z), Q.setFromAxisAngle(Y, r), S1); im.setMatrixAt(i, M4); it.setMatrixAt(i, M4); });
  im.count = it.count = pieces.length; im.receiveShadow = !touch; im.name = 'townKerbs'; scene.add(im, it);
  // WAYFINDING: red finger posts at the four plaza exits + where each path leaves town (existing zone names only); 2 draws + 1 atlas
  const POSTS = [[48, -9.5, [['Lanes Court', 1, 0], ['Arena Path', 1, 0], ['Fountain Plaza', -1, 0]]], [-48, 9.5, [['Market Plaza', -1, 0], ['Ruins Path', -1, 0], ['Fountain Plaza', 1, 0]]],
    [-9.5, -43, [['Civic Row', 0, -1], ['Castle Path', 0, -1], ['Fountain Plaza', 0, 1]]], [9.5, 43, [['South Gardens', 0, 1], ['Lake Path', 0, 1], ['Fountain Plaza', 0, -1]]],
    [170, -9.5, [['Arena Path', 1, 0], ['Fountain Plaza', -1, 0]]], [-170, 9.5, [['Skate Park', -1, 0], ['Ruins Path', -1, 0], ['Fountain Plaza', 1, 0]]],
    [-9.5, -150, [['Castle Path', 0, -1], ['Fountain Plaza', 0, 1]]], [9.5, 159, [['Lake Path', 0, 1], ['Fountain Plaza', 0, -1]]]];
  const names = [...new Set(POSTS.flatMap(p => p[2].map(a => a[0])))], cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024; const cx = cv.getContext('2d');
  names.forEach((nm, i) => { for (const back of [0, 1]) { const slot = i * 2 + back, x0 = (slot % 2) * 512, y0 = (slot / 2 | 0) * 64; cx.fillStyle = '#ec3013'; cx.fillRect(x0, y0, 512, 64); cx.fillStyle = '#201e1d'; cx.fillRect(back ? x0 + 504 : x0, y0, 8, 64);
    cx.fillStyle = '#ffffff'; cx.font = '900 34px Archivo, sans-serif'; cx.textBaseline = 'middle'; const t = nm.toUpperCase(), tw = Math.min(400, cx.measureText(t).width);
    if (!back) { cx.fillText(t, x0 + 26, y0 + 33, 400); cx.fillText('\u2192', x0 + 452, y0 + 33); } else { cx.fillText('\u2190', x0 + 24, y0 + 33); cx.fillText(t, x0 + 486 - tw, y0 + 33, 400); } } });
  const at = new THREE.CanvasTexture(cv); at.colorSpace = THREE.SRGBColorSpace; at.anisotropy = 4;
  const poleP = [], boardP = [], faceP = [], V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const put = (list, geo, m) => { geo.applyMatrix4(m); list.push(geo); };
  for (const [px, pz, arms] of POSTS) { if (city && city.colliders) city.colliders.push({ c: [px, pz, 0.25] }); const pm = new THREE.Matrix4().makeTranslation(px, 0, pz);
    put(poleP, new THREE.CylinderGeometry(0.07, 0.09, 3.3, 8).translate(0, 1.65, 0), pm.clone()); put(poleP, new THREE.SphereGeometry(0.11, 8, 6).translate(0, 3.32, 0), pm.clone());
    arms.forEach(([nm, dx, dz], j) => { const th = Math.atan2(-dz, dx), y = 2.95 - j * 0.46, m = new THREE.Matrix4().compose(V3(px, y, pz), new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), th), V3(1, 1, 1));
      put(boardP, new THREE.BoxGeometry(1.9, 0.36, 0.05).translate(1.02, 0, 0), m.clone());
      const i = names.indexOf(nm); for (const back of [0, 1]) { const slot = i * 2 + back, u0 = (slot % 2) / 2, v1 = 1 - (slot / 2 | 0) / 16, v0 = v1 - 1 / 16, pg = new THREE.PlaneGeometry(1.86, 0.33), uv = pg.attributes.uv;
        for (let q = 0; q < uv.count; q++) uv.setXY(q, u0 + uv.getX(q) * 0.5, v0 + uv.getY(q) * (v1 - v0)); if (back) pg.rotateY(Math.PI); pg.translate(1.02, 0, back ? -0.035 : 0.035); put(faceP, pg, m.clone()); } }); }
  const mg = list0 => { const list = list0.map(q => q.index ? q.toNonIndexed() : q); let n = 0; for (const q of list) n += q.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    for (const q of list) { pos.set(q.attributes.position.array, o * 3); nor.set(q.attributes.normal.array, o * 3); if (q.attributes.uv) uv.set(q.attributes.uv.array, o * 2); o += q.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return G; };
  const poles = new THREE.Mesh(mg([...poleP, ...boardP]), toon('#201e1d')), faces = new THREE.Mesh(mg(faceP), new THREE.MeshBasicMaterial({ map: at, color: 0xe8e8e8, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
  poles.castShadow = !touch; poles.name = 'townSignposts'; scene.add(poles, faces);
  return { kerbs: pieces.length, posts: POSTS.length, setNight(on) { faces.material.color.set(on ? 0xffffff : 0xe8e8e8); } };
}
// painted paving (no draws): a darker border band round every Town Square paving rect, fountain rings, promenade edge courses
export function paintTownPaving(g, k, X, Z, L) {
  const band = (r, w, col) => { g.fillStyle = col; const [x0, x1, z0, z1] = r; g.fillRect(X(x0), Z(z0), (x1 - x0) * k, w * k); g.fillRect(X(x0), Z(z1 - w), (x1 - x0) * k, w * k); g.fillRect(X(x0), Z(z0), w * k, (z1 - z0) * k); g.fillRect(X(x1 - w), Z(z0), w * k, (z1 - z0) * k); };
  // fountain plaza: border course, three rings of darker setts round the lawn, the four path axes in a lighter course
  const FP = [-45, 45, -40, 40]; g.save(); g.beginPath(); g.rect(X(FP[0]), Z(FP[2]), (FP[1] - FP[0]) * k, (FP[3] - FP[2]) * k); g.rect(X(12), Z(-12), -24 * k, 24 * k); g.clip('evenodd');
  for (const [r, w, c] of [[17, 0.9, 'rgba(120,112,100,0.55)'], [25, 0.6, 'rgba(120,112,100,0.45)'], [33, 0.9, 'rgba(120,112,100,0.55)']]) { g.strokeStyle = c; g.lineWidth = w * k; g.beginPath(); g.arc(X(0), Z(0), r * k, 0, 7); g.stroke(); }
  g.fillStyle = 'rgba(255,250,240,0.18)'; g.fillRect(X(-2.2), Z(FP[2]), 4.4 * k, (FP[3] - FP[2]) * k); g.fillRect(X(FP[0]), Z(-2.2), (FP[1] - FP[0]) * k, 4.4 * k); g.restore();
  band(FP, 1.4, 'rgba(110,102,92,0.42)');
  // promenades + Civic Row: edge courses
  for (const r of [[-150, -45, -15, 15], [45, 150, -15, 15], [-120, 120, -75, -45]]) band(r, 0.9, 'rgba(110,102,92,0.38)');
  // cross joints every 3 m on the promenades (the plaza already has its long joints)
  g.strokeStyle = 'rgba(0,0,0,0.07)'; g.lineWidth = 1; for (const [x0, x1] of [[-150, -45], [45, 150]]) for (let x = x0; x <= x1; x += 3) { g.beginPath(); g.moveTo(X(x), Z(-15)); g.lineTo(X(x), Z(15)); g.stroke(); }
}
