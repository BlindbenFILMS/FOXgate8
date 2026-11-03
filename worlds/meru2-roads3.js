// MERU 2.0 — s41 BIG MAP STEP 3. Built by worlds/meru2-heights.js (so the walk + car contracts flow through heights). Data: BRIDGES,
// LINKS, DESERT in worlds/meru2-layout.js.
// THE GARDEN BRIDGE: a road bridge from the north shore to the Garden island (asphalt, dashed centre line, raised sidewalks + kerbs,
// red-railed parapets, lanterns both sides, concrete piers, a name gantry at each end). Its middle span arches up so boats + swimmers
// pass under; the low ends block them. The road runs on across the island top to the lawn between the twin towers.
// STATION LINKS: lanterns along the paved walks (the walks themselves are painted into the ground texture: paintLinks).
// THE DESERT round the Ruins Cave: painted sand with a soft noisy edge + ripples (paintDesert), cacti, sandstone rocks, dry shrubs.
const segP = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); return Math.hypot(x - a[0] - dx * u, z - a[1] - dz * u); };
const lineD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) m = Math.min(m, segP(x, z, p[i], p[i + 1])); return m; };
const edgeR = (D, t) => D.r + 6 * Math.sin(3 * t + 1) + 4 * Math.sin(7 * t + 2) + 2 * Math.sin(13 * t + 0.5);

export function paintDesert(g, k, X, Z, L) {
  const D = L.DESERT; if (!D) return; const [cx, cz] = D.c;
  const poly = dr => { g.beginPath(); for (let i = 0; i <= 200; i++) { const t = i / 200 * Math.PI * 2, R = edgeR(D, t) + dr; i ? g.lineTo(X(cx + Math.cos(t) * R), Z(cz + Math.sin(t) * R)) : g.moveTo(X(cx + Math.cos(t) * R), Z(cz + Math.sin(t) * R)); } g.closePath(); };
  for (let j = 4; j >= 1; j--) { poly(j * 2.5 - 3); g.fillStyle = 'rgba(223,192,138,0.24)'; g.fill(); }   // soft edge into the grass
  poly(-5); g.fillStyle = '#dfc08a'; g.fill();
  g.save(); poly(-5); g.clip();
  const rg = g.createRadialGradient(X(cx), Z(cz), 0, X(cx), Z(cz), D.r * k); rg.addColorStop(0, 'rgba(190,140,84,0.32)'); rg.addColorStop(1, 'rgba(190,140,84,0)'); g.fillStyle = rg; g.fillRect(X(cx - D.r - 10), Z(cz - D.r - 10), (2 * D.r + 20) * k, (2 * D.r + 20) * k);
  g.strokeStyle = 'rgba(150,104,56,0.16)'; g.lineWidth = Math.max(1, 0.45 * k);
  for (let zz = cz - D.r - 8; zz < cz + D.r + 8; zz += 3.2) { g.beginPath(); for (let xx = cx - D.r - 8; xx <= cx + D.r + 8; xx += 2) { const y = zz + Math.sin(xx * 0.09 + zz * 0.05) * 1.6; xx === cx - D.r - 8 ? g.moveTo(X(xx), Z(y)) : g.lineTo(X(xx), Z(y)); } g.stroke(); }
  let s = 77; const r = () => (s = (s * 16807) % 2147483647) / 2147483647, px = Math.max(1, 0.3 * k);
  for (let i = 0; i < 1100; i++) { const x = cx + (r() - 0.5) * 2 * D.r, z = cz + (r() - 0.5) * 2 * D.r; g.fillStyle = r() < 0.5 ? 'rgba(120,92,62,0.35)' : 'rgba(255,242,214,0.45)'; g.fillRect(X(x), Z(z), px, px); }
  g.restore(); }

export function paintLinks(g, k, X, Z, L) {
  g.save(); g.lineCap = 'square'; g.lineJoin = 'miter'; g.setLineDash([]);
  for (const P of L.LINKS || []) { const line = (c, w) => { g.strokeStyle = c; g.lineWidth = w * k; g.beginPath(); P.p.forEach(([x, z], i) => i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.stroke(); }; line('#8f877c', P.w + 0.7); line('#d6d1c9', P.w); }
  g.restore(); }

export function buildRoads3({ THREE, root, grad, L, touch, terrainAt, lanterns, colliders }) {
  const G = new THREE.Group(); G.name = 'meru2Roads3'; root.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler();
  const toonC = c => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const inst = (geo, mat, list, shadow = !touch) => { if (!list.length) return null; const m = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((q, i) => m.setMatrixAt(i, q)); m.castShadow = shadow; m.receiveShadow = true; G.add(m); return m; };
  const mx = (x, y, z, sx = 1, sy = 1, sz = 1, ry = 0, rx = 0) => new THREE.Matrix4().compose(V(x, y, z), Q.setFromEuler(E.set(rx, ry, 0, 'YXZ')).clone(), V(sx, sy, sz));

  // ---------- THE BRIDGE(S): one vertex-coloured ribbon mesh (non-indexed quads) ----------
  const pos = [], col = [], cc = new THREE.Color();
  const quad = (a, b, c, d, hex) => { cc.set(hex); for (const p of [a, b, c, a, c, d]) { pos.push(p[0], p[1], p[2]); col.push(cc.r, cc.g, cc.b); } };
  const posts = [], rails = [], piers = [], caps = [];
  for (const B of L.BRIDGES || []) {
    const hw = B.w / 2, rw = B.road / 2, SW = 0.15, end = B.end || B.z1, deckY = z => z <= B.z1 ? L.bridgeAt(B.x, z).y : B.y1 + 0.02;
    const zs = []; for (let z = B.z0; z < end; z += 2) zs.push(z); zs.push(end); if (!zs.includes(B.z1)) { zs.push(B.z1); zs.sort((a, b) => a - b); }
    for (let i = 0; i < zs.length - 1; i++) { const za = zs[i], zb = zs[i + 1], ya = deckY(za), yb = deckY(zb), br = za < B.z1 - 0.01, X = o => B.x + o;
      const strip = (o0, o1, dy, hex) => quad([X(o0), ya + dy, za], [X(o1), ya + dy, za], [X(o1), yb + dy, zb], [X(o0), yb + dy, zb], hex);
      const wall = (o, y0, y1, hex) => quad([X(o), ya + y0, za], [X(o), ya + y1, za], [X(o), yb + y1, zb], [X(o), yb + y0, zb], hex);
      strip(-rw, rw, 0, '#3d3b3a'); strip(-rw + 0.35, -rw + 0.5, 0.004, '#e8e4dc'); strip(rw - 0.5, rw - 0.35, 0.004, '#e8e4dc');
      if (Math.floor((za - B.z0) / 3) % 2 === 0) strip(-0.12, 0.12, 0.004, '#f5d35a');
      for (const s of [-1, 1]) { wall(s * rw, 0, SW, '#a8a29a'); strip(s > 0 ? rw : -hw, s > 0 ? hw : -rw, SW, '#e8e4dc'); wall(s * hw, br ? -0.9 : -0.2, SW, '#cfcac3'); }
      if (br) strip(-hw, hw, -0.9, '#8f877c');
      if (br) for (const s of [-1, 1]) { const o = s * (hw - 0.18), len = Math.hypot(zb - za, yb - ya), pitch = -Math.atan2(yb - ya, zb - za);
        posts.push(mx(X(o), ya + SW, za)); rails.push(mx(X(o), (ya + yb) / 2 + SW + 1.05, (za + zb) / 2, 1, 1, len, 0, pitch)); rails.push(mx(X(o), (ya + yb) / 2 + SW + 0.55, (za + zb) / 2, 0.7, 0.7, len, 0, pitch)); } }
    for (const s of [-1, 1]) posts.push(mx(B.x + s * (hw - 0.18), deckY(B.z1) + SW, B.z1));
    // lanterns: both parapets every 16 m on the bridge, along the island road too (no colliders: swimmers pass under)
    for (let z = B.z0 + 6; z < end - 3; z += 16) for (const s of [-1, 1]) lanterns.push([B.x + s * (hw - 0.3), deckY(z) + SW, z, true]);
    // piers: pairs of round columns from the lake bed + a cap beam under the deck
    for (const [px, pz] of B.piers || []) { const top = deckY(pz) - 0.9; piers.push(mx(px, (top - 4) / 2, pz, 1, top + 4, 1)); }
    for (const pz of [...new Set((B.piers || []).map(p => p[1]))]) { const top = deckY(pz) - 0.9; caps.push(mx(B.x, top - 0.25, pz, B.w - 0.6, 0.5, 1.6)); }
    // name gantries at both ends (ink posts, red board, white Archivo)
    const nm = CT(1024, 128, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 22, h); g.fillStyle = '#ffffff'; g.font = '900 78px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText((B.label || 'BRIDGE').toUpperCase(), 52, h / 2 + 4); });
    const nmM = new THREE.MeshBasicMaterial({ map: nm }), ink = toonC('#201e1d');
    for (const [gz, face] of [[B.z0 + 1.5, Math.PI], [B.z1 - 1.5, 0]]) { const y = deckY(gz) + SW;
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.2, 0.3), ink); p.position.set(B.x + s * (hw - 0.2), y + 3.1, gz); G.add(p); }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(B.w - 0.4, 1.5, 0.22), ink); bar.position.set(B.x, y + 5.4, gz); G.add(bar);
      for (const f of [0, Math.PI]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(B.w - 2.2, 1.24), nmM); pl.position.set(B.x, y + 5.4, gz + (f ? -0.12 : 0.12)); pl.rotation.y = face + f; G.add(pl); } }
  }
  if (pos.length) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = true; m.castShadow = !touch; G.add(m); }
  inst(new THREE.BoxGeometry(0.12, 1.1, 0.12).translate(0, 0.55, 0), toonC('#201e1d'), posts);
  inst(new THREE.BoxGeometry(0.14, 0.12, 1), toonC('#ec3013'), rails);
  inst(new THREE.CylinderGeometry(0.7, 0.8, 1, 12), toonC('#bdb7ae'), piers);
  inst(new THREE.BoxGeometry(1, 1, 1), toonC('#a8a29a'), caps);

  // ---------- station links: lanterns alternating sides every 12 m ----------
  for (const P of L.LINKS || []) { let side = 1; for (let i = 0; i < P.p.length - 1; i++) { const [ax, az] = P.p[i], [bx, bz] = P.p[i + 1], len = Math.hypot(bx - ax, bz - az); if (len < 1) continue; const nx = -(bz - az) / len, nz = (bx - ax) / len;
    for (let t = i ? 4 : 7; t < len - 2; t += 12) { const x = ax + (bx - ax) * t / len + nx * (P.w / 2 + 0.6) * side, z = az + (bz - az) * t / len + nz * (P.w / 2 + 0.6) * side; lanterns.push([x, terrainAt(x, z), z]); side = -side; } } }

  // ---------- the DESERT: cacti, sandstone rocks, dry shrubs (instanced, seeded) ----------
  const D = L.DESERT, used = [];
  if (D) { let sd = 4242; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const line = L.TRAIN.line.concat([L.TRAIN.line[0]]), keepR = [-454, -396, -84, 84];
    const ok = (x, z, r) => L.desertK(x, z) > 0.7 && terrainAt(x, z) < 0.15 && !(x > keepR[0] && x < keepR[1] && z > keepR[2] && z < keepR[3])
      && !L.BUILDINGS.some(b => b.f && x > b.f[0] - r - 3 && x < b.f[1] + r + 3 && z > b.f[2] - r - 3 && z < b.f[3] + r + 3)
      && L.PATHS.every(p => lineD(x, z, p.p) > r + 6) && (L.LINKS || []).every(p => lineD(x, z, p.p) > r + 4) && L.ROADS.every(R => lineD(x, z, R.p) > R.w / 2 + r + 4)
      && lineD(x, z, line) > r + 5 && !L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(x - s.at[0], z - s.at[1]) < r + 4) && !used.some(([a, b, q]) => Math.hypot(x - a, z - b) < r + q + 1.5);
    const place = (n, r0, r1) => { const out = []; for (let k = 0; k < n * 40 && out.length < n; k++) { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * D.r, x = D.c[0] + Math.cos(a) * d, z = D.c[1] + Math.sin(a) * d, r = r0 + rnd() * (r1 - r0); if (!ok(x, z, r)) continue; used.push([x, z, r]); out.push([x, z, r]); } return out; };
    const cacti = place(touch ? 14 : 26, 0.5, 0.9), rocks = place(touch ? 16 : 30, 0.6, 2.4), shrubs = place(touch ? 24 : 48, 0.3, 0.7);
    const cyl = [], tops = [];
    for (const [x, z, r] of cacti) { const h = 2.6 + rnd() * 2.6, tr = 0.32 + r * 0.12, ry = rnd() * 6.28; cyl.push(mx(x, 0, z, tr, h, tr)); tops.push(mx(x, h, z, tr, tr, tr));
      const arms = rnd() < 0.25 ? 0 : rnd() < 0.55 ? 1 : 2; for (let a = 0; a < arms; a++) { const s = a ? -1 : 1, ay = h * (0.35 + rnd() * 0.25), out = 0.55 + rnd() * 0.3, up = 0.8 + rnd() * 1.1, ar = tr * 0.72, ox = Math.cos(ry) * out * s, oz = -Math.sin(ry) * out * s;
        cyl.push(new THREE.Matrix4().compose(V(x, ay, z), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(ox, 0, oz).normalize()), V(ar, out + ar * 0.5, ar)));
        cyl.push(mx(x + ox, ay - ar * 0.2, z + oz, ar, up, ar)); tops.push(mx(x + ox, ay - ar * 0.2 + up, z + oz, ar, ar, ar)); }
      colliders.push({ c: [x, z, tr + 0.25] }); }
    const cacM = toonC('#5f8a4a'); inst(new THREE.CylinderGeometry(1, 1, 1, 8).translate(0, 0.5, 0), cacM, cyl); inst(new THREE.SphereGeometry(1, 8, 6), cacM, tops);
    inst(new THREE.DodecahedronGeometry(1, 0), toonC('#b08a5e'), rocks.map(([x, z, r]) => { colliders.push({ c: [x, z, r * 0.8] }); return mx(x, r * 0.25, z, r, r * (0.45 + rnd() * 0.35), r * (0.8 + rnd() * 0.4), rnd() * 6.28); }));
    inst(new THREE.IcosahedronGeometry(1, 0), toonC('#9a8456'), shrubs.map(([x, z, r]) => mx(x, r * 0.35, z, r, r * 0.6, r, rnd() * 6.28)), false);
  }

  // ---------- walk + car contract (called from heights) ----------
  const deckAt = (x, z) => { const b = L.bridgeAt(x, z); if (!b) return null; return { b, y: b.y + (Math.abs(b.off) > b.B.road / 2 ? 0.15 : 0) }; };
  function groundAt(x, z, y) { const d = deckAt(x, z); return d && y > d.y - 1.2 ? d.y : null; }
  function surfaceAt(x, z, y) { const d = deckAt(x, z); return d && Math.abs(y - d.y) < 0.5 ? 'stone' : null; }
  function clamp(x, z, nx, nz, y) {
    for (const B of L.BRIDGES || []) { const inZ = q => q >= B.z0 && q <= B.z1; if (!inZ(z) && !inZ(nz)) continue;
      const hw = B.w / 2 - 0.35, o0 = x - B.x, o1 = nx - B.x, deck = L.bridgeAt(B.x, Math.max(B.z0, Math.min(B.z1, nz))).y, on = y > deck - 1.2;
      if (on && Math.abs(o0) <= hw + 0.02 && inZ(z)) { if (Math.abs(o1) > hw) nx = B.x + Math.sign(o1) * hw; continue; }   // parapets keep you on the deck
      if (deck - y >= 2.4) continue;   // well under the arch: swim on
      const body = B.w / 2 + 0.3; if (Math.abs(o1) < body && inZ(nz)) { if (Math.abs(o0) >= body || !inZ(z)) { nx = x; nz = z; } } }   // the bridge side / slab is in the way
    return { x: nx, z: nz }; }
  const carY = (x, z) => { const b = L.bridgeAt(x, z); return b ? b.y : null; };
  const carBlock = (x, z) => { const b = L.bridgeAt(x, z, 1.2); return !!b && Math.abs(b.off) > b.B.w / 2 - 1.3; };
  return { groundAt, surfaceAt, clamp, carY, carBlock, group: G, stats: { bridges: (L.BRIDGES || []).length, links: (L.LINKS || []).length } };
}
