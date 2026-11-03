// MERU 2.0 — s97 LOOK PASS for the two Barracks Road shops (Sgt. Biscuit's Barracks Minimart + Dot's Motor Pool Gas). World coords, built by worlds/meru2-bshops.js.
// Outside (each prop takes the first free spot from a short list, checked against every collider + the door walks): a FLAGPOLE with a waving Meru flag at both shops ·
// RATION CRATES + sandbags by the minimart · a NOTICE BOARD post by the minimart front (the barracks day, the next call in red, live) · JERRY CAN rack + 2 olive drums at the gas.
// Inside: olive / khaki / red BUNTING strung across the ceiling of both shops, swaying.
export function bshopsLook({ THREE, scene, cols, touch, hour }) {
  const INK = '#201e1d', RED = '#ec3013', WHITE = '#f3f2f2', GOLD = '#e6b45a', NAVY = '#1f2650', OLIVE = '#4f5d2f', KHAKI = '#c8b88a', IRON = '#3d3b3a';
  const G = new THREE.Group(); G.name = 'bshopsLook'; scene.add(G);
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const box = (par, sx, sy, sz, c, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), typeof c === 'string' ? LM(c) : c); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 10) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const hr = () => { const h = hour ? hour() : 12; return ((h % 24) + 24) % 24; };
  const MART = { f: [30, 48, -303, -279], doors: [[48, -291, 1, 0]] }, GAS = { f: [78, 92, -292, -280], doors: [[78, -286, -1, 0], [85, -292, 0, -1]], canopy: [64, 76, -298, -276] };
  // ---------- free spot finder ----------
  const free = (x, z, r) => { for (const c of cols) { if (c.y0 != null && c.y0 > 3) continue; const f = c.f, cc = c.c;
      if (f && x > f[0] - r && x < f[1] + r && z > f[2] - r && z < f[3] + r) return false; if (cc && Math.hypot(x - cc[0], z - cc[1]) < r + cc[2]) return false; }
    for (const S of [MART, GAS]) { const f = S.f; if (x > f[0] - r && x < f[1] + r && z > f[2] - r && z < f[3] + r) return false;
      for (const [dx, dz, nx, nz] of S.doors) for (let k = 0; k <= 6; k += 1) if (Math.hypot(x - (dx + nx * k), z - (dz + nz * k)) < r + 1.6) return false; }
    const cp = GAS.canopy; if (x > cp[0] - r && x < cp[1] + r && z > cp[2] - r && z < cp[3] + r) return false; return true; };
  const pickSpot = (list, r) => list.find(([x, z]) => free(x, z, r)) || null;
  const col = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  // ---------- FLAGPOLES ----------
  const flagT = CT(160, 100, (g, w, h) => { g.fillStyle = NAVY; g.fillRect(0, 0, w, h); g.fillStyle = BRED(); g.fillRect(0, h - 16, w, 16); g.fillStyle = GOLD; g.fillRect(56, 22, 48, 48); g.fillStyle = NAVY; g.fillRect(66, 32, 28, 28);
    g.fillStyle = GOLD; g.font = '900 24px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 80, 47); });
  function BRED() { return '#a8323e'; }
  const FLAGS = [];
  const flagpole = ([x, z]) => { cyl(G, 0.18, 0.22, 0.3, '#8a7f70', x, 0.15, z); cyl(G, 0.05, 0.06, 7, '#c0c4cc', x, 3.5, z, 8); const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), LM(GOLD)); ball.position.set(x, 7.05, z); G.add(ball);
    const g = new THREE.PlaneGeometry(1.6, 1.0, 10, 2); g.translate(0.8, 0, 0); const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: flagT, side: THREE.DoubleSide })); m.position.set(x + 0.05, 6.35, z); G.add(m);
    FLAGS.push({ m, base: Float32Array.from(g.attributes.position.array), ph: Math.random() * 6 }); ring(x, z, 0.25); };
  const fM = pickSpot([[50, -301.6], [50, -280.4], [28.6, -301.6], [28.6, -280.4], [52, -296]], 0.4); if (fM) flagpole(fM);
  const fG = pickSpot([[62.6, -299.4], [77, -293.6], [93.4, -293.6], [93.4, -278.6], [62.6, -275]], 0.4); if (fG) flagpole(fG);
  // ---------- RATION CRATES + SANDBAGS (minimart) ----------
  const stenT = (txt, bg, fg) => CT(256, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 3); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = fg; g.font = '900 40px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 2); });
  const crateM = new THREE.MeshLambertMaterial({ map: stenT('RATIONS', OLIVE, KHAKI) });
  const cr = pickSpot([[33.2, -278.0], [37.4, -278.0], [33.2, -304.0], [37.4, -304.0], [29.0, -284.0]], 1.2);
  if (cr) { const [x, z] = cr; const C = new THREE.Group(); C.position.set(x, 0, z); G.add(C);
    [[-0.45, 0.35, 0, 0], [0.45, 0.35, 0, 0.1], [0, 1.05, 0, -0.15]].forEach(([dx, y, dz, ry]) => box(C, 0.85, 0.7, 0.7, crateM, dx, y, dz, ry));
    for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 5), LM(KHAKI)); s.scale.set(1.1, 0.42, 0.62); s.position.set(-0.75 + i * 0.5, 0.12 + (i % 2) * 0.01, 0.62); C.add(s); }
    for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 5), LM('#b8a77a')); s.scale.set(1.1, 0.42, 0.62); s.position.set(-0.5 + i * 0.5, 0.33, 0.62); C.add(s); }
    col(x - 1.0, x + 1.0, z - 0.45, z + 0.85); }
  // ---------- NOTICE BOARD (minimart front, live) ----------
  const NOTE = [[600, 'REVEILLE'], [630, 'MORNING DRILL'], [1200, 'MESS · LUNCH'], [1400, 'SPARRING'], [1800, 'MESS · DINNER'], [2200, 'LIGHTS OUT']];
  const noteT = CT(256, 192, () => {}), noteC = noteT.userData.c; let noteK = '';
  const drawNote = h => { const g = noteC.getContext('2d'), w = noteC.width, H = noteC.height, hm = Math.floor(h) * 100 + Math.floor((h % 1) * 60); const nx = NOTE.findIndex(n => n[0] > hm), ni = nx < 0 ? 0 : nx;
    const k = String(ni); if (k === noteK) return; noteK = k; g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, H); g.fillStyle = OLIVE; g.fillRect(0, 0, w, 36); g.fillStyle = WHITE; g.font = '900 18px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('BARRACKS NOTICES', 10, 19);
    NOTE.forEach(([t, l], i) => { const y = 46 + i * 23, on = i === ni; if (on) { g.fillStyle = RED; g.fillRect(4, y - 2, w - 8, 22); } g.fillStyle = on ? WHITE : INK; g.font = '900 14px Archivo, sans-serif'; g.fillText(String(t).padStart(4, '0'), 10, y + 9); g.font = '700 14px Archivo, sans-serif'; g.fillText(l + (on ? '  · NEXT' : ''), 62, y + 9); });
    noteT.needsUpdate = true; };
  const nb = pickSpot([[50.6, -284.2], [50.6, -297.8], [51.4, -283], [51.4, -299]], 0.5);
  if (nb) { const [x, z] = nb; for (const e of [-0.6, 0.6]) box(G, 0.08, 1.9, 0.08, '#6b4a32', x, 0.95, z + e); box(G, 0.06, 1.0, 1.36, '#6b4a32', x, 1.55, z); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.93), new THREE.MeshBasicMaterial({ map: noteT, color: 0xeeeeee }));
    m.position.set(x + 0.035, 1.55, z); m.rotation.y = Math.PI / 2; G.add(m); box(G, 0.12, 0.08, 1.5, OLIVE, x, 2.1, z); col(x - 0.15, x + 0.15, z - 0.7, z + 0.7); drawNote(hr()); }
  // ---------- JERRY CAN RACK + DRUMS (gas) ----------
  const jc = pickSpot([[86.5, -278.6], [89.5, -278.6], [93.4, -284.5], [93.4, -288.5], [83, -278.6]], 1.0);
  if (jc) { const [x, z] = jc, side = x > 92.5, R = new THREE.Group(); R.position.set(x, 0, z); R.rotation.y = side ? Math.PI / 2 : 0; G.add(R);
    for (const e of [-0.95, 0.95]) box(R, 0.06, 1.3, 0.5, IRON, e, 0.65, 0); for (const y of [0.08, 0.7]) box(R, 1.96, 0.05, 0.5, IRON, 0, y, 0);
    const jt = stenT('FUEL', OLIVE, WHITE), jm = new THREE.MeshLambertMaterial({ map: jt }); for (const y of [0.1, 0.72]) for (let i = 0; i < 3; i++) { const cx = -0.6 + i * 0.6; box(R, 0.46, 0.56, 0.2, jm, cx, y + 0.28, 0); box(R, 0.24, 0.05, 0.08, OLIVE, cx, y + 0.6, 0.02); box(R, 0.05, 0.08, 0.05, IRON, cx + 0.16, y + 0.62, 0.05); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.3), new THREE.MeshBasicMaterial({ map: CT(384, 64, (g, w, h) => { g.fillStyle = INK; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MOTOR POOL · FUEL', 12, h / 2 + 2); }) }));
    sg.position.set(0, 1.45, 0.02); R.add(sg); if (side) col(x - 0.3, x + 0.3, z - 1.05, z + 1.05); else col(x - 1.05, x + 1.05, z - 0.3, z + 0.3); }
  const starT = CT(128, 128, (g, w) => { g.fillStyle = OLIVE; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 22; y < w; y += 42) g.fillRect(0, y, w, 6); g.fillStyle = WHITE; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 14 : 34; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.fill(); });
  const drumM = new THREE.MeshLambertMaterial({ map: starT });
  for (const [x, z] of [pickSpot([[91.2, -278.4], [93.4, -280.6], [80.2, -278.4]], 0.55), pickSpot([[92.6, -277.8], [93.6, -281.9], [81.4, -277.8]], 0.55)].filter(Boolean)) {
    if (!free(x, z, 0.5)) continue; const d = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.1, 14), drumM); d.position.set(x, 0.55, z); d.rotation.y = Math.random() * 6; G.add(d); cyl(G, 0.43, 0.43, 0.04, IRON, x, 1.1, z, 14); ring(x, z, 0.45); }
  // ---------- BUNTING inside both shops ----------
  const BUNT = [], BC = [OLIVE, KHAKI, RED, NAVY];
  const bunting = (x0, x1, z, y) => { const n = Math.max(6, Math.round((x1 - x0) / 0.62)), pos = [], colr = [], c = new THREE.Color();
    for (let i = 0; i < n; i++) { const u0 = (i + 0.1) / n, u1 = (i + 0.9) / n, um = (u0 + u1) / 2, sag = u => -Math.sin(u * Math.PI) * 0.35, xa = x0 + (x1 - x0) * u0, xb = x0 + (x1 - x0) * u1, xm = (xa + xb) / 2;
      pos.push(xa, sag(u0), 0, xb, sag(u1), 0, xm, sag(um) - 0.32, 0); c.set(BC[i % 4]); for (let k = 0; k < 3; k++) colr.push(c.r, c.g, c.b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })), hg = new THREE.Group(); hg.position.set(0, y, z); hg.add(m); G.add(hg);
    const cg = new THREE.BufferGeometry().setFromPoints([...Array(17)].map((_, i) => new THREE.Vector3(x0 + (x1 - x0) * i / 16, -Math.sin(i / 16 * Math.PI) * 0.35, 0))); hg.add(new THREE.Line(cg, new THREE.LineBasicMaterial({ color: INK })));
    BUNT.push({ hg, ph: Math.random() * 6 }); };
  bunting(30.6, 47.4, -287.5, 3.55); bunting(30.6, 47.4, -294.5, 3.55); bunting(78.6, 91.4, -283.4, 3.95); bunting(78.6, 91.4, -288.8, 3.95);
  // ---------- per frame ----------
  let nT = 0;
  function tick(dt, P) { const d = Math.min(Math.hypot(P.x - 39, P.z + 291), Math.hypot(P.x - 80, P.z + 287)); G.visible = d < (touch ? 70 : 130); if (!G.visible) return; const t = performance.now() / 1000;
    FLAGS.forEach(F => { const p = F.m.geometry.attributes.position.array, b = F.base; for (let i = 0; i < p.length; i += 3) { const u = b[i] / 1.6; p[i + 2] = Math.sin(t * 3.2 - u * 5 + F.ph) * 0.14 * u; p[i + 1] = b[i + 1] - u * u * 0.06; } F.m.geometry.attributes.position.needsUpdate = true; });
    BUNT.forEach(B => { B.hg.rotation.x = Math.sin(t * 0.9 + B.ph) * 0.12; });
    if ((nT -= dt) <= 0) { nT = 5; drawNote(hr()); } }
  return { tick, group: G };
}
