// MERU 2.0 — exterior polish round 4: the PARADE GROUND in front of the Barracks [meruBarracks] (stone, -60..60 × -400..-330).
// Painted: a red parade-square border, white drill lines + marching spots, a big Meru M crest in the middle (ground texture).
// Built: low stone kerb-walls round the square with gaps for the Castle Path, the Barracks door and the Tank Works road; two tall
// flagpoles with hanging Meru banners flanking the Barracks door; a TRAINING CORNER (straw dummies, a weapon rack, archery butts) on the
// west side and a SUPPLY CORNER (crates, barrels, a water trough) on the east side. Decoration only. ~8 draws, colliders for all.
export function paintParade(g, k, X, Z) {
  const r = [-56, 56, -396, -334]; g.save();
  g.strokeStyle = 'rgba(236,48,19,0.55)'; g.lineWidth = 0.8 * k; g.strokeRect(X(r[0]), Z(r[2]), (r[1] - r[0]) * k, (r[3] - r[2]) * k);
  g.strokeStyle = 'rgba(255,255,255,0.32)'; g.lineWidth = 0.18 * k; for (let x = -42; x <= 42; x += 12) { g.beginPath(); g.moveTo(X(x), Z(-388)); g.lineTo(X(x), Z(-342)); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.38)'; for (let x = -42; x <= 42; x += 6) for (let z = -386; z <= -344; z += 6) if (Math.abs(x) > 10 || Math.abs(z + 365) > 10) { g.beginPath(); g.arc(X(x), Z(z), 0.22 * k, 0, 7); g.fill(); }
  // the crest: gold ring, navy disc, white M
  const cx = X(0), cz = Z(-365); g.fillStyle = 'rgba(214,168,72,0.8)'; g.beginPath(); g.arc(cx, cz, 9 * k, 0, 7); g.fill(); g.fillStyle = 'rgba(27,35,80,0.85)'; g.beginPath(); g.arc(cx, cz, 7.8 * k, 0, 7); g.fill();
  g.fillStyle = 'rgba(243,242,242,0.9)'; g.font = '900 ' + (10 * k) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', cx, cz + 0.6 * k); g.restore();
}
export function buildParade({ THREE, scene, L, city, toon, CT, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Parade'; scene.add(root);
  const bins = {}, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), Q = new THREE.Quaternion(), Y = V(0, 1, 0), C = city.colliders;
  const add = (k, g, x, y, z, ry = 0) => { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), Q.setFromAxisAngle(Y, ry), V(1, 1, 1))); (bins[k] || (bins[k] = [])).push(g); };
  const Box = (a, b, c) => new THREE.BoxGeometry(a, b, c), Cyl = (a, b, h, n = 10) => new THREE.CylinderGeometry(a, b, h, n);
  const free = (x, z, r) => !C.some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false) && !L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r + 3);
  // low walls round the square (gaps: path N at x 0, barracks door S at x 0, east road gap at z -365)
  const wall = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 1) return; const ry = Math.atan2(x1 - x0, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; add('stone', Box(0.7, 0.7, len), cx, 0.35, cz, ry); add('cap', Box(0.85, 0.12, len + 0.1), cx, 0.76, cz, ry);
    for (let t = 0.5; t < len; t += 1) C.push({ c: [x0 + (x1 - x0) * t / len, z0 + (z1 - z0) * t / len, 0.45] }); };
  wall(-59, -339, -59, -399); wall(59, -339, 59, -358);   /* no north wall: the train guideway runs over the square's north edge (z -332) */ wall(59, -372, 59, -399); wall(-59, -399, -44, -399); wall(44, -399, 59, -399);
  for (const [x, z] of [[-59, -339], [59, -339], [-59, -399], [59, -399], [59, -358], [59, -372]]) { add('stone', Box(1.1, 1.3, 1.1), x, 0.65, z); add('cap', new THREE.ConeGeometry(0.78, 0.5, 4), x, 1.55, z, Math.PI / 4); }
  // flagpoles + hanging banners by the barracks door
  const banT = CT(96, 256, (g, w, h) => { g.fillStyle = '#1b2350'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8323e'; g.fillRect(0, 0, w, 26); g.fillStyle = '#e6b45a'; g.fillRect(0, 26, w, 5); g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h);
    g.beginPath(); g.arc(w / 2, 120, 32, 0, 7); g.fill(); g.fillStyle = '#1b2350'; g.beginPath(); g.arc(w / 2, 120, 26, 0, 7); g.fill(); g.fillStyle = '#f3f2f2'; g.font = '900 36px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', w / 2, 122);
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(0, h); g.lineTo(w / 2, h - 34); g.lineTo(w, h); g.fill(); });
  const banM = new THREE.MeshLambertMaterial({ map: banT, side: THREE.DoubleSide, alphaTest: 0.5 }), bans = [];
  for (const sx of [-1, 1]) { const x = sx * 8, z = -396; add('iron', Cyl(0.09, 0.14, 11, 8), x, 5.5, z); add('gold', new THREE.SphereGeometry(0.22, 10, 8), x, 11.15, z); add('iron', Box(2.2, 0.08, 0.08), x, 10.4, z); add('stone', Box(1.2, 0.5, 1.2), x, 0.25, z);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 5.2), banM); m.position.set(x, 7.75, z + 0.06); root.add(m); bans.push(m); C.push({ c: [x, z, 0.7] }); }
  // TRAINING CORNER (west): straw dummies on posts, a weapon rack, two archery butts
  const dummies = [];
  for (const [x, z] of [[-48, -350], [-44, -356], [-50, -360], [-46, -366]]) { if (!free(x, z, 0.9)) continue; add('wood', Cyl(0.07, 0.07, 1.9, 6), x, 0.95, z); add('straw', Cyl(0.32, 0.36, 0.95, 10), x, 1.35, z); add('straw', new THREE.SphereGeometry(0.24, 10, 8), x, 2.05, z); add('wood', Box(1.2, 0.08, 0.08), x, 1.6, z); add('rope', Cyl(0.34, 0.34, 0.06, 10), x, 1.1, z); C.push({ c: [x, z, 0.45] }); dummies.push([x, z]); }
  if (free(-53, -378, 1.4)) { const x = -53, z = -378; add('wood', Box(2.6, 0.1, 0.4), x, 1.5, z); add('wood', Box(2.6, 0.1, 0.4), x, 0.35, z); for (const s of [-1, 1]) add('wood', Box(0.12, 1.7, 0.12), x + s * 1.25, 0.85, z);
    for (let i = 0; i < 5; i++) { const lx = x - 1 + i * 0.5; add('iron', Box(0.05, 1.5, 0.03), lx, 1.05, z + 0.05); add('wood', Box(0.18, 0.08, 0.06), lx, 0.45, z + 0.05); } C.push({ f: [x - 1.4, x + 1.4, z - 0.4, z + 0.4] }); }
  for (const [x, z] of [[-52, -390], [-44, -390]]) { if (!free(x, z, 1)) continue; add('straw', Cyl(0.9, 0.9, 0.5, 18), x, 1.3, z, 0); { const g = bins.straw[bins.straw.length - 1]; g.translate(-x, -1.3, -z); g.rotateX(Math.PI / 2); g.translate(x, 1.3, z); }
    for (const [r, c] of [[0.75, 'ringW'], [0.5, 'ringR'], [0.25, 'ringW'], [0.1, 'gold']]) { const ring = Cyl(r, r, 0.02, 18); ring.rotateX(Math.PI / 2); add(c, ring, x, 1.3, z + 0.27); }
    add('wood', Box(0.1, 1.2, 0.1), x - 0.5, 0.6, z - 0.3); add('wood', Box(0.1, 1.2, 0.1), x + 0.5, 0.6, z - 0.3); C.push({ c: [x, z, 0.9] }); }
  // SUPPLY CORNER (east): crates, barrels, a water trough
  const sup = [[48, -342, 'crate'], [49.4, -342.2, 'crate'], [48.6, -342, 'crate2'], [52, -344, 'barrel'], [53, -343, 'barrel'], [52.5, -345.3, 'barrel'], [46, -348, 'trough']];
  for (const [x, z, t] of sup) { if (t === 'crate') { add('wood', Box(1.1, 1.0, 1.1), x, 0.5, z, 0.2); C.push({ c: [x, z, 0.65] }); } else if (t === 'crate2') add('wood', Box(0.9, 0.8, 0.9), x, 1.4, z, -0.3);
    else if (t === 'barrel') { add('wood2', Cyl(0.42, 0.38, 1.0, 12), x, 0.5, z); for (const y of [0.2, 0.8]) add('iron', Cyl(0.43, 0.43, 0.05, 12), x, y, z); C.push({ c: [x, z, 0.45] }); }
    else { add('stone', Box(2.4, 0.7, 0.9), x, 0.35, z); add('water', Box(2.1, 0.04, 0.6), x, 0.62, z); C.push({ f: [x - 1.2, x + 1.2, z - 0.45, z + 0.45] }); } }
  const MAT = { stone: toon('#b5ab9a'), cap: toon('#d8d0c0'), iron: toon('#2a2d33'), gold: new THREE.MeshBasicMaterial({ color: 0xd7ad52 }), wood: toon('#8a5a34'), wood2: toon('#9a6a3c'), straw: toon('#d9b866'), rope: toon('#7a5c38'), ringW: toon('#f3f2f2'), ringR: toon('#ec3013'), water: new THREE.MeshPhongMaterial({ color: 0x3a8fa8, shininess: 120 }) };
  const merge = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0; for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return G; };
  for (const k in bins) { const m = new THREE.Mesh(merge(bins[k]), MAT[k]); m.castShadow = !touch; m.receiveShadow = true; root.add(m); }
  let far = false, t = 0;
  return { tick(dt, cam) { t += dt; for (const [i, b] of bans.entries()) b.rotation.y = Math.sin(t * 1.3 + i) * 0.06; const f = Math.hypot(cam.x, cam.z + 365) > (touch ? 150 : 240); if (f !== far) { far = f; root.visible = !f; } }, stats: { dummies: dummies.length } };
}
