// MERU 2.0 — step 2b: THE TRAIN. A walkable 4-car elevated train on a schedule round the loop (worlds/meru2-layout.js TRAIN),
// 6 stations, each with a platform on the station side (canopy, yellow edge, railings), a glass LIFT from the street to the
// platform and a TICKET MACHINE at its foot. Walk on through the open doors, walk the cars (gangways), SIT by a window.
// Coordinates on a platform: a = metres along the track from the stop centre, ls = metres sideways toward the station.
export function buildTrain({ THREE, scene, toon, grad, CT, L, touch }) {
  // Ben: the train is 33% bigger, then 20% more (K 1.33 → 1.6, doors scale with it). Cars are built in DESIGN units (the old size) and scaled by K; walking inside a car (ab.x / ab.z,
  // DOORZ, ROWS, PD) stays in design units, toWorldCar scales to metres. Platforms sit PO further out and are 100 m long (4 cars = 96 m).
  const K = 1.6, PLAT_Y = 8.5, RAIL_Y = PLAT_Y - 0.3 * K, CARS = 4, PD = 15, PITCH = PD * K, DOCK = 1.5 * PITCH, PO = 1.0, DWELL = 22, VMAX = 18, ACC = 1.2, HALF = 50, DOORZ = [-4, 4], ROWS = [-6, -2.6, -1.4, -0.2, 1, 2.2, 6];
  const mod = (a, n) => ((a % n) + n) % n, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const E = new THREE.Euler(), Q = new THREE.Quaternion(), M4 = new THREE.Matrix4(), V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), ONE = V(1, 1, 1), Box = (a, b, c) => new THREE.BoxGeometry(a, b, c);
  function piece(geo, x, y, z, ry = 0, col) { const g = geo.index ? geo.toNonIndexed() : geo; if (g !== geo) geo.dispose(); E.set(0, ry, 0); M4.compose(V(x, y, z), Q.setFromEuler(E), ONE); g.applyMatrix4(M4);
    if (col) { const c = new THREE.Color(col), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); } return g; }
  function merge(list) { let n = 0; for (const g of list) n += g.attributes.position.count; const hasC = list.every(g => g.attributes.color), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = hasC ? new Float32Array(n * 3) : null; let o = 0;
    for (const g of list) { const c = g.attributes.position.count; pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (col) col.set(g.attributes.color.array, o * 3); o += c; g.dispose(); }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); if (col) G.setAttribute('color', new THREE.BufferAttribute(col, 3)); G.computeBoundingSphere(); return G; }
  const vc = () => new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true }), root = new THREE.Group(); scene.add(root);

  // ---------- the loop, sampled every ~1 m ----------
  const curve = new THREE.CatmullRomCurve3(L.TRAIN.line.map(([x, z]) => V(x, 0, z)), true, 'catmullrom', 0.3), LEN = curve.getLength(), N = Math.ceil(LEN);
  const SX = new Float32Array(N), SZ = new Float32Array(N), TX = new Float32Array(N), TZ = new Float32Array(N);
  for (let i = 0; i < N; i++) { const p = curve.getPointAt(i / N), t = curve.getTangentAt(i / N), l = Math.hypot(t.x, t.z) || 1; SX[i] = p.x; SZ[i] = p.z; TX[i] = t.x / l; TZ[i] = t.z / l; }
  const at = s => { s = mod(s, LEN); const f = s / LEN * N, i = Math.floor(f) % N, j = (i + 1) % N, k = f - Math.floor(f); let tx = TX[i] + (TX[j] - TX[i]) * k, tz = TZ[i] + (TZ[j] - TZ[i]) * k; const l = Math.hypot(tx, tz) || 1; return { x: SX[i] + (SX[j] - SX[i]) * k, z: SZ[i] + (SZ[j] - SZ[i]) * k, tx: tx / l, tz: tz / l }; };

  // ---------- stops ----------
  const stops = L.TRAIN.stops.map(key => { const d = L.TRAIN.stopAt[key], b = L.BUILDINGS.find(q => q.key === key); let bi = 0, bd = 1e18; for (let i = 0; i < N; i++) { const q = (SX[i] - d.c[0]) ** 2 + (SZ[i] - d.c[1]) ** 2; if (q < bd) { bd = q; bi = i; } }
    const s = bi * LEN / N, p = at(s), bc = [(b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2], side = Math.sign((bc[0] - p.x) * p.tz - (bc[1] - p.z) * p.tx) || 1;
    return { key, b, label: b.label, s, side, liftA: d.lift || 0, c: [p.x, p.z], lift: { y: 0.05, target: 0.05, wait: 0, trip: false, mesh: null } }; }).sort((p, q) => p.s - q.s);
  function frame(st, x, z) { if (Math.abs(x - st.c[0]) > 62 || Math.abs(z - st.c[1]) > 62) return null; const i0 = Math.round(st.s / LEN * N); let bo = 0, bd = 1e18; for (let o = -52; o <= 52; o++) { const i = mod(i0 + o, N), q = (SX[i] - x) ** 2 + (SZ[i] - z) ** 2; if (q < bd) { bd = q; bo = o; } }
    const a0 = bo * LEN / N, p = at(st.s + a0), dx = x - p.x, dz = z - p.z, l = dx * p.tz - dz * p.tx; return { a: a0 + dx * p.tx + dz * p.tz, ls: l * st.side - PO }; }
  const toW = (st, a, ls) => { const p = at(st.s + a), l = (ls + PO) * st.side; return { x: p.x + p.tz * l, z: p.z - p.tx * l, yaw: Math.atan2(p.tx, p.tz) }; };

  // ---------- track: deck, red rail, pillars (kept off roads and water, allowed in a road's centre median) ----------
  // train polish: a U-channel concrete GUIDEWAY swept along the loop (red band on both faces), two steel rails in the channel, sleepers
  // (desktop), hammerhead caps on the pillars. Replaces the round deck tube + the red rail tube that ran through the noses.
  const sweep = (prof, step) => { const n = Math.ceil(LEN / step), pos = [], nor = [], col = [], C = new THREE.Color();
    for (let e = 0; e < prof.length; e++) { const [l0, y0] = prof[e], [l1, y1] = prof[(e + 1) % prof.length], c = prof[e][2]; C.set(c); const dl = l1 - l0, dy = y1 - y0, ln = Math.hypot(dl, dy) || 1, nl = dy / ln, ny = -dl / ln;
      for (let i = 0; i < n; i++) { const A = at(i * step), Bq = at((i + 1) * step), q = [[A, l0, y0], [Bq, l0, y0], [Bq, l1, y1], [A, l1, y1]];
        for (const j of [0, 1, 2, 0, 2, 3]) { const [p, l, y] = q[j]; pos.push(p.x + p.tz * l, y, p.z - p.tx * l); nor.push(p.tz * nl, ny, -p.tx * nl); col.push(C.r, C.g, C.b); } } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere(); return g; };
  const CON = '#bdb7ae', GW = [[-2.76, 6.3, '#9a958d'], [2.76, 6.3, CON], [2.76, 7.4, '#ec3013'], [2.76, 7.6, CON], [2.76, 7.85, '#8a8580'], [2.22, 7.85, '#7c7770'], [2.22, 6.9, '#7a756e'], [-2.22, 6.9, '#7c7770'], [-2.22, 7.85, '#8a8580'], [-2.76, 7.85, CON], [-2.76, 7.6, '#ec3013'], [-2.76, 7.4, CON]];
  const RL = [], RG = '#9aa0a6'; for (const s of [-1, 1]) RL.push([[s * 1.86, 6.9, RG], [s * 2.03, 6.9, RG], [s * 2.03, 7.04, RG], [s * 1.86, 7.04, RG]]);
  const gwMat = vc(); gwMat.side = THREE.DoubleSide; const step = touch ? 3 : 2;
  const deck = new THREE.Mesh(sweep(GW, step), gwMat); root.add(deck); for (const r of RL) root.add(new THREE.Mesh(sweep(r, step * 2), gwMat));
  if (!touch) { deck.castShadow = true; deck.receiveShadow = true; const n = Math.floor(LEN / 1.5), sl = new THREE.InstancedMesh(Box(4.1, 0.1, 0.26), toon('#9a8a74'), n); for (let i = 0; i < n; i++) { const p = at(i * 1.5); M4.makeRotationY(Math.atan2(p.tx, p.tz)).setPosition(p.x, 6.95, p.z); sl.setMatrixAt(i, M4); } root.add(sl); }
  const segD = (x, z, p) => { let m = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const inLake = L.inLake;
  const pil = []; for (let s = 0; s < LEN; s += 24) { const p = at(s), ok = L.ROADS.every(r => { const c = segD(p.x, p.z, r.p); return c > r.w / 2 + 1 || c < 1.2; }) && !inLake(p.x, p.z) && !L.BUILDINGS.some(b => p.x > b.f[0] - 1 && p.x < b.f[1] + 1 && p.z > b.f[2] - 1 && p.z < b.f[3] + 1); if (ok) pil.push([p.x, p.z, Math.atan2(p.tx, p.tz)]); }
  const pilI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.8, 1, 6.3, 10).translate(0, 3.15, 0), toon('#bdb7ae'), pil.length), capI = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 4, 1).rotateY(Math.PI / 4).scale(3.4, 0.6, 1.3).translate(0, 6.0, 0), toon('#a9a39a'), pil.length);
  pil.forEach(([x, z, yw], i) => { M4.makeTranslation(x, 0, z); pilI.setMatrixAt(i, M4); M4.makeRotationY(yw).setPosition(x, 0, z); capI.setMatrixAt(i, M4); }); root.add(pilI, capI);
  const colliders = pil.map(([x, z]) => ({ c: [x, z, 1], y1: 5.5 }));

  // ---------- stations: platform, canopy, railings, lift, ticket machine, name boards ----------
  const sp = [], gp = [], glowP = [], signs = [], LP = [];
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0.32, depthWrite: false });
  const signTex = txt => CT(512, 112, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.fillRect(0, 0, 16, h); g.fillStyle = '#ffffff'; g.font = '900 56px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 36, h / 2 + 3, w - 56); });
  const ticketTex = CT(256, 96, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('TICKETS', 16, h / 2 + 2); });
  const ticketMat = new THREE.MeshBasicMaterial({ map: ticketTex }), machines = [];
  for (const st of stops) { const P = (a, ls, y, geo, col) => { const w = toW(st, a, ls); sp.push(piece(geo, w.x, y, w.z, w.yaw, col)); }, G = (a, ls, y, geo) => { const w = toW(st, a, ls); gp.push(piece(geo, w.x, y, w.z, w.yaw)); };
    for (let a = -HALF; a < HALF; a += 4) { const m = a + 2; P(m, 4.9, PLAT_Y - 0.25, Box(6, 0.5, 4.05), '#cfc9c0'); P(m, 2.05, PLAT_Y + 0.01, Box(0.3, 0.03, 4.05), '#ffd23a'); P(m, 5.1, 12.4, Box(5.6, 0.3, 4.05), '#ec3013');
      P(a, 4.9, PLAT_Y + 0.004, Box(6, 0.012, 0.05), '#a9a39a'); P(m, 1.94, PLAT_Y - 0.25, Box(0.1, 0.52, 4.05), '#8a8580'); P(m, 4.9, PLAT_Y - 0.52, Box(6.04, 0.06, 4.05), '#7c7770');
      P(m, 2.32, 12.36, Box(0.08, 0.56, 4.05), '#f3f2f2'); P(m, 7.9, 12.62, Box(0.18, 0.18, 4.05), '#9aa0a6'); LP.push(piece(Box(0.24, 0.03, 3.4), toW(st, m, 4.6).x, 12.235, toW(st, m, 4.6).z, toW(st, m, 4.6).yaw, '#fff1c8'));
      if (Math.abs(m - st.liftA) > 2.2) { P(m, 7.85, PLAT_Y + 1.1, Box(0.06, 0.06, 4.05), '#201e1d'); P(a, 7.85, PLAT_Y + 0.55, Box(0.08, 1.1, 0.08), '#201e1d'); }
      if ((a + HALF) % 8 === 0) { P(a, 7.5, (PLAT_Y + 12.4) / 2, Box(0.2, 12.4 - PLAT_Y, 0.2), '#201e1d'); P(a + 4, 4.9, PLAT_Y / 2, new THREE.CylinderGeometry(0.4, 0.4, PLAT_Y, 8), '#bdb7ae'); const w = toW(st, a + 4, 4.9); colliders.push({ c: [w.x, w.z, 0.5], y1: 6 }); const g2 = toW(st, m, 5); glowP.push(g2.x, 12.15, g2.z); } }
    for (const e of [-HALF, HALF]) { P(e, 4.9, PLAT_Y + 1.1, Box(6, 0.06, 0.06), '#201e1d'); P(e, 4.9, PLAT_Y + 0.55, Box(6, 0.04, 0.04), '#201e1d'); for (const ls of [2.2, 3.6, 5.0, 6.4, 7.85]) P(e, ls, PLAT_Y + 0.55, Box(0.08, 1.1, 0.08), '#201e1d'); P(e, 4.9, PLAT_Y + 0.07, Box(6, 0.14, 0.1), '#ffd23a'); }
    // step 10 pass 4: platform detail: tactile strip behind the yellow line, benches facing the track + bins, a dark track bed with sleepers + two rails along the platform
    for (let q = -HALF; q < HALF; q += 4) { P(q + 2, 2.55, PLAT_Y + 0.012, Box(0.55, 0.025, 3.9), '#d9b23e'); }
    for (let q = -HALF + 8; q <= HALF - 8; q += 16) { if (Math.abs(q - st.liftA) < 4.5) continue; P(q, 6.9, PLAT_Y + 0.45, Box(0.6, 0.08, 2.2), '#a77b4f'); P(q, 7.22, PLAT_Y + 0.8, Box(0.08, 0.55, 2.2), '#a77b4f');
      for (const e of [-0.95, 0.95]) P(q + e, 6.95, PLAT_Y + 0.22, Box(0.6, 0.44, 0.08), '#201e1d'); P(q + 1.8, 7.0, PLAT_Y + 0.45, new THREE.CylinderGeometry(0.28, 0.24, 0.9, 10), '#2e4a6b');
      for (const [da, ls, r] of [[-0.6, 7.0, 0.45], [0.6, 7.0, 0.45], [1.8, 7.0, 0.3]]) { const w = toW(st, q + da, ls); colliders.push({ c: [w.x, w.z, r], y0: PLAT_Y - 0.5, y1: PLAT_Y + 1.5 }); } }
    for (const da of [-1.5, 1.5]) for (const ls of [7.9, 10.9]) P(st.liftA + da, ls, 6.05, Box(0.16, 12.1, 0.16), '#ffc64a');
    P(st.liftA, 9.4, 12.15, Box(3.2, 0.2, 3.2), '#201e1d'); for (const da of [-1.5, 1.5]) G(st.liftA + da, 9.4, 6.1, Box(3, 11.8, 0.04)); G(st.liftA, 10.9, 9.9, Box(0.04, 4.6, 3));
    { const w = toW(st, st.liftA, 9.4), m = new THREE.Mesh(Box(2.9, 0.2, 2.9), toon('#ffc64a')); m.position.set(w.x, 0, w.z); m.rotation.y = w.yaw; root.add(m); st.lift.mesh = m; }
    { const w = toW(st, st.liftA + 3.3, 9.6); P(st.liftA + 3.3, 9.6, 0.9, Box(0.7, 1.8, 0.6), '#ec3013'); const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.45), ticketMat); pl.position.set(w.x, 2.1, w.z); pl.rotation.y = w.yaw + st.side * Math.PI / 2; const bk = pl.clone(); bk.rotation.y += Math.PI; root.add(pl, bk); machines.push({ st, x: w.x, z: w.z }); colliders.push({ c: [w.x, w.z, 0.55], y1: 3 }); }
    { const mat = new THREE.MeshBasicMaterial({ map: signTex(st.label.toUpperCase()), color: 0xe8e8e8 }); signs.push(mat); for (const [ls, flip] of [[11.0, 0], [7.75, 1]]) { const w = toW(st, st.liftA, ls), pl = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.1), mat); pl.position.set(w.x, 11.6, w.z); pl.rotation.y = w.yaw + st.side * Math.PI / 2 + (flip ? Math.PI : 0); root.add(pl); } } }
  const infra = new THREE.Mesh(merge(sp), vc()); if (!touch) infra.castShadow = infra.receiveShadow = true; root.add(infra, new THREE.Mesh(merge(gp), glassMat), new THREE.Mesh(merge(LP), new THREE.MeshBasicMaterial({ vertexColors: true })));
  const radial = CT(64, 64, (g, w) => { const q = g.createRadialGradient(32, 32, 0, 32, 32, 32); q.addColorStop(0, 'rgba(255,236,190,1)'); q.addColorStop(0.3, 'rgba(255,236,190,0.4)'); q.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = q; g.fillRect(0, 0, w, w); });
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(glowP, 3)), new THREE.PointsMaterial({ map: radial, size: 4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; root.add(glow);

  // ---------- the cars (design units, group scaled ×K) ----------
  const winMat = new THREE.MeshBasicMaterial({ color: 0x9fd6ff, transparent: true, opacity: 0.35, depthWrite: false }), gloMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  // atlas: top half = the ROUTE MAP strip shown above every door inside; bottom = 4 'MERU METRO 0n' side decals (transparent)
  const atlas = CT(1024, 384, (g, w) => { g.clearRect(0, 0, w, 384); g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, 128); g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, 6); g.fillRect(0, 122, w, 6);
    const n = stops.length, x0 = 70, x1 = w - 70; g.fillStyle = '#ec3013'; g.fillRect(x0, 58, x1 - x0, 8); g.font = '800 17px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    stops.forEach((st, i) => { const x = x0 + (x1 - x0) * i / (n - 1); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, 62, 11, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = '#ec3013'; g.stroke(); g.fillStyle = '#201e1d'; g.fillText(st.label.toUpperCase().replace(' STATION', ''), x, i % 2 ? 100 : 28); });
    g.textAlign = 'left'; g.textBaseline = 'alphabetic'; for (let k = 0; k < 4; k++) { const cx = k * 256; g.fillStyle = k % 2 ? '#ec3013' : '#f3f2f2'; g.font = '900 30px Archivo, sans-serif'; g.fillText('MERU METRO', cx + 14, 186); g.fillRect(cx + 12, 200, 100, 6); g.font = '900 42px Archivo, sans-serif'; g.fillText('0' + (k + 1), cx + 186, 240); }
    g.fillStyle = '#14181c'; g.fillRect(0, 256, 512, 64); g.fillStyle = '#ffb347'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('\u25cf ALL STATIONS \u00b7 LOOP', 18, 290); });
  const atlasMat = new THREE.MeshBasicMaterial({ map: atlas, transparent: true, alphaTest: 0.35, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const card = (w, h, x, y, z, ry, u0, u1, v0, v1) => { const g = new THREE.PlaneGeometry(w, h).toNonIndexed(), a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, u0 + a.getX(i) * (u1 - u0), v0 + a.getY(i) * (v1 - v0)); E.set(0, ry, 0); M4.compose(V(x, y, z), Q.setFromEuler(E), ONE); g.applyMatrix4(M4); return g; };
  const mergeUV = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0; for (const g of list) { pos.set(g.attributes.position.array, o * 3); uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; g.dispose(); } const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); G.computeBoundingSphere(); return G; };

  // train polish 4: ADVERTS on the car sides (existing Meru names only, icons do the selling). 8 posters in one 1024 atlas, 4 per car side
  // under the windows, back-lit at night. Plus an amber ALL STATIONS · LOOP strip over the middle windows.
  const adAtlas = CT(1024, 1024, (g) => { const CW = 512, CH = 256;
    const cell = (i, bg, fn) => { const x0 = (i % 2) * CW, y0 = (i / 2 | 0) * CH; g.save(); g.translate(x0, y0); g.beginPath(); g.rect(0, 0, CW, CH); g.clip(); g.fillStyle = bg; g.fillRect(0, 0, CW, CH); fn(); g.strokeStyle = '#201e1d'; g.lineWidth = 10; g.strokeRect(5, 5, CW - 10, CH - 10); g.restore(); };
    const T = (t, x, y, px, col, w = 300, f = '900 ') => { g.font = f + px + 'px Archivo, sans-serif'; const m = g.measureText(t).width; if (m > w) g.font = f + (px * w / m) + 'px Archivo, sans-serif'; g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillText(t, x, y); };
    const C = (x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    cell(0, '#ec3013', () => { g.fillStyle = '#201e1d'; g.fillRect(300, 60, 190, 160); g.fillStyle = '#ec3013'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(325 + k * 46, 140, 18, Math.PI, 0); g.lineTo(343 + k * 46, 220); g.lineTo(307 + k * 46, 220); g.fill(); }
      g.fillStyle = '#ffd23a'; g.save(); g.translate(395, 52); for (const r of [-0.6, 0.6]) { g.save(); g.rotate(r); g.fillRect(-5, -10, 10, 80); g.fillRect(-18, 52, 36, 8); g.restore(); } g.restore(); T('MERU', 30, 120, 86, '#f3f2f2', 250); T('ARENA', 30, 210, 86, '#201e1d', 250); });
    cell(1, '#2e4a6b', () => { g.fillStyle = '#38bdf8'; g.fillRect(0, 196, 512, 60); g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(300, 170); g.lineTo(470, 170); g.lineTo(490, 186); g.lineTo(460, 200); g.lineTo(316, 200); g.closePath(); g.fill(); g.fillStyle = '#ec3013'; g.fillRect(330, 150, 70, 20);
      g.strokeStyle = '#f3f2f2'; g.lineWidth = 6; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(290 - k * 40, 196 + k * 4); g.quadraticCurveTo(250 - k * 40, 214, 210 - k * 50, 200 + k * 6); g.stroke(); } C(440, 70, 34, '#ffd23a'); T('SPEEDBOAT', 30, 100, 64, '#f3f2f2', 270); T('BAY', 30, 170, 70, '#ffd23a', 270); });
    cell(2, '#0f6f78', () => { C(390, 150, 70, '#f3e9da'); C(374, 132, 22, '#ffffff'); g.fillStyle = '#e7c7a5'; g.beginPath(); g.moveTo(300, 190); g.quadraticCurveTo(390, 250, 480, 190); g.lineTo(470, 220); g.quadraticCurveTo(390, 262, 310, 220); g.fill();
      C(395, 150, 26, '#fbf7f2'); C(386, 142, 8, '#ffffff'); T('PEARL', 30, 110, 80, '#f3f2f2', 250); T('ISLAND', 30, 196, 80, '#ffd23a', 250); });
    cell(3, '#f97316', () => { const bx = 390; g.fillStyle = '#e09a45'; g.beginPath(); g.ellipse(bx, 110, 92, 56, 0, Math.PI, 0); g.fill(); g.fillStyle = '#6fbf3a'; g.fillRect(bx - 96, 108, 192, 14); g.fillStyle = '#ffc93c'; g.beginPath(); g.moveTo(bx - 96, 122); g.lineTo(bx + 96, 122); g.lineTo(bx + 70, 140); g.lineTo(bx - 70, 140); g.fill();
      g.fillStyle = '#5a3020'; g.fillRect(bx - 92, 140, 184, 30); g.fillStyle = '#d98a3a'; g.fillRect(bx - 90, 170, 180, 30); g.fillStyle = '#fff4d6'; for (let k = 0; k < 7; k++) g.fillRect(bx - 60 + k * 18, 80 + (k % 2) * 14, 8, 4); T('BURGERS', 28, 150, 76, '#201e1d', 240); });
    cell(4, '#14223a', () => { C(130 + 300, 170, 48, '#38bdf8'); C(418, 158, 7, '#14223a'); C(440, 150, 7, '#14223a'); C(432, 172, 7, '#14223a');
      for (let k = 0; k < 3; k++) { const x = 320 + k * 30, y = 120; g.fillStyle = '#f3f2f2'; g.beginPath(); g.ellipse(x, y, 11, 34, 0, 0, 7); g.fill(); C(x, y - 40, 9, '#f3f2f2'); g.fillStyle = '#ec3013'; g.fillRect(x - 9, y - 28, 18, 5); } T('MERU', 30, 110, 80, '#ff3fb4', 250); T('LANES', 30, 196, 80, '#38bdf8', 250); });
    cell(5, '#201e1d', () => { for (let k = 0; k < 3; k++) { const x = 340 + k * 50, y = 150 - k * 28; C(x, y, 44, k === 1 ? '#f3f2f2' : '#c0242a'); g.strokeStyle = k === 1 ? '#c0242a' : '#f3f2f2'; g.lineWidth = 8; g.setLineDash([12, 10]); g.beginPath(); g.arc(x, y, 34, 0, 7); g.stroke(); g.setLineDash([]); }
      g.fillStyle = '#ffd23a'; g.font = '400 54px serif'; g.fillText('\u2660\u2665\u2666\u2663', 300, 236); T('CASINO', 30, 150, 86, '#f0b429', 260); });
    cell(6, '#7b5fa3', () => { g.save(); g.translate(390, 140); g.rotate(-0.35); g.fillStyle = '#ffd23a'; g.beginPath(); g.roundRect(-110, -22, 220, 44, 22); g.fill(); g.fillStyle = '#201e1d'; g.fillRect(-100, -16, 200, 6); C(-70, 32, 16, '#f3f2f2'); C(70, 32, 16, '#f3f2f2'); g.restore();
      g.strokeStyle = '#7cff9b'; g.lineWidth = 7; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(270, 80 + k * 30); g.lineTo(230 - k * 10, 80 + k * 30); g.stroke(); } T('SKATE', 30, 110, 84, '#f3f2f2', 230); T('PARK', 30, 196, 84, '#7cff9b', 230); });
    cell(7, '#6c7166', () => { for (const [r, c] of [[70, '#f3f2f2'], [52, '#ec3013'], [34, '#f3f2f2'], [16, '#ec3013']]) C(430, 120, r, c); g.fillStyle = '#201e1d'; g.fillRect(270, 168, 120, 36); g.fillRect(292, 146, 70, 26); g.fillRect(355, 154, 70, 10); g.beginPath(); g.roundRect(266, 200, 128, 26, 13); g.fill();
      g.fillStyle = '#ffd23a'; for (let k = 0; k < 6; k++) C(280 + k * 20, 213, 6, '#ffd23a'); T('TANK', 30, 110, 84, '#ffd23a', 220); T('RANGE', 30, 196, 84, '#f3f2f2', 220); });
  });
  const adMat = new THREE.MeshBasicMaterial({ map: adAtlas, color: 0xdedede, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), AD_V = i => { const r = i / 2 | 0, c = i % 2; return [c / 2, (c + 1) / 2, 1 - (r + 1) / 4, 1 - r / 4]; };
  const cars = []; for (let k = 0; k < CARS; k++) { const body = k % 2 ? '#f3f2f2' : '#ec3013', g = new THREE.Group(); g.scale.setScalar(K); root.add(g); const base = [], roof = [], glass = [], glo = [];
    const B = (list, geo, x, y, z, col) => list.push(piece(geo, x, y, z, 0, col));
    B(base, Box(3.2, 0.28, 13.8), 0, 0.15, 0, '#8a8580'); B(base, Box(3.0, 0.02, 13.6), 0, 0.31, 0, '#4a5560'); for (const sd of [-1, 1]) for (const dz of DOORZ) B(base, Box(0.3, 0.03, 1.6), sd * 1.42, 0.335, dz, '#ffd23a');
    // seats: steel pedestal, navy cushion + back, red headrest, aisle armrest
    for (const z of ROWS) for (const sd of [-1, 1]) { B(base, Box(0.14, 0.42, 0.14), sd, 0.51, z, '#9aa0a6'); B(base, Box(0.82, 0.12, 0.56), sd, 0.78, z, '#2e4a6b'); B(base, Box(0.82, 0.74, 0.1), sd, 1.22, z - 0.28, '#2e4a6b'); B(base, Box(0.82, 0.16, 0.13), sd, 1.66, z - 0.28, '#ec3013');
      B(base, Box(0.05, 0.05, 0.42), sd * 0.6, 1.0, z - 0.02, '#9aa0a6'); B(base, Box(0.05, 0.18, 0.05), sd * 0.6, 0.89, z + 0.16, '#9aa0a6'); }
    // grab poles beside the doors + overhead grab rails, underframe equipment
    for (const sd of [-1, 1]) { for (const dz of DOORZ) for (const e of [-0.95, 0.95]) B(base, new THREE.CylinderGeometry(0.03, 0.03, 2.9, 8), sd * 0.62, 1.75, dz + e, '#c0c4cc'); const r = new THREE.CylinderGeometry(0.025, 0.025, 13.4, 8); r.rotateX(Math.PI / 2); B(base, r, sd * 0.62, 3.0, 0, '#c0c4cc'); }
    for (const z of [-1.5, 1.5]) B(base, Box(1.8, 0.4, 1.3), 0, -0.25, z, '#3d3b3a');
    for (const ez of [-7, 7]) { const solid = (ez > 0 && k === 0) || (ez < 0 && k === CARS - 1); B(glo, Box(1.0, 0.14, 0.02), 0, 2.95, ez - Math.sign(ez) * 0.07, '#ffb347');
      if (solid) { B(base, Box(3.2, 1.0, 0.1), 0, 0.8, ez, body); B(base, Box(3.2, 0.8, 0.1), 0, 2.8, ez, body); B(glass, Box(3.0, 1.1, 0.03), 0, 1.85, ez, null); B(base, Box(3.0, 1.0, 0.8), 0, 0.7, ez + Math.sign(ez) * 0.45, '#201e1d'); }
      else { for (const sx of [-1, 1]) B(base, Box(1.1, 2.9, 0.1), sx * 1.05, 1.75, ez, body); B(base, Box(1.0, 0.6, 0.1), 0, 2.9, ez, body); } }
    if (k < CARS - 1) for (let i = 0; i < 5; i++) B(base, Box(i % 2 ? 1.3 : 1.46, i % 2 ? 2.5 : 2.64, 0.2), 0, 1.55, -7.1 - i * 0.2, i % 2 ? '#2a2a2a' : '#201e1d');
    B(roof, Box(3.4, 0.2, 14.1), 0, 3.3, 0, '#d9d6cf'); B(roof, Box(0.3, 0.04, 11), 0, 3.18, 0, '#fff3d0'); B(roof, Box(1.6, 0.4, 3), 0, 3.6, 2, '#9aa0a6');
    const walls = {}; for (const sd of [-1, 1]) { const wl = []; for (const [z0, z1] of [[-7, -4.8], [-3.2, 3.2], [4.8, 7]]) { const len = z1 - z0, zc = (z0 + z1) / 2; B(wl, Box(0.1, 1.0, len), sd * 1.6, 0.8, zc, body); B(wl, Box(0.1, 0.8, len), sd * 1.6, 2.8, zc, body); B(glass, Box(0.03, 1.1, len), sd * 1.6, 1.85, zc, null);
        B(wl, Box(0.02, 1.0, len), sd * 1.54, 0.8, zc, '#e6e3dc'); B(wl, Box(0.02, 0.8, len), sd * 1.54, 2.8, zc, '#e6e3dc'); for (const y of [1.3, 2.4]) B(wl, Box(0.02, 0.06, len), sd * 1.655, y, zc, '#201e1d'); B(wl, Box(0.36, 0.03, len - 0.3), sd * 1.33, 2.5, zc, '#c0c4cc');
        for (let z = z0; z <= z1 + 0.01; z += len / Math.max(1, Math.round(len / 1.9))) B(wl, Box(0.1, 1.1, 0.18), sd * 1.6, 1.85, clamp(z, z0 + 0.09, z1 - 0.09), body); }
      for (const dz of DOORZ) { B(wl, Box(0.1, 0.6, 1.6), sd * 1.6, 2.9, dz, body); B(wl, Box(0.02, 0.6, 1.6), sd * 1.54, 2.9, dz, '#e6e3dc'); B(glo, Box(0.03, 0.07, 0.22), sd * 1.665, 2.83, dz, '#ffb347'); } walls[sd] = new THREE.Mesh(merge(wl), vc()); g.add(walls[sd]); }
    // step 10 pass 4: streamlined NOSE on both end cars (sloped cab, wrap windscreen, headlights, red lower lip), dark SKIRT + red/white LIVERY band,
    // two BOGIES per car (frame + 4 wheels), curved ROOF cap, AC pods + a pantograph on the end cars, door frames
    const other = k % 2 ? '#ec3013' : '#f3f2f2';
    for (const sd of [-1, 1]) { B(base, Box(0.04, 0.12, 13.6), sd * 1.63, 0.42, 0, other); B(base, Box(0.06, 0.32, 13.8), sd * 1.6, -0.02, 0, '#2a2a2a');
      for (const dz of DOORZ) { for (const e of [-0.84, 0.84]) B(base, Box(0.05, 2.5, 0.08), sd * 1.63, 1.45, dz + e, '#ffd23a'); B(base, Box(0.05, 0.08, 1.76), sd * 1.63, 2.72, dz, '#ffd23a'); } }
    for (const bz of [-5, 5]) { B(base, Box(2.6, 0.35, 2.6), 0, -0.35, bz, '#2a2a2a'); for (const sx of [-1, 1]) { B(base, Box(0.12, 0.3, 2.4), sx * 1.36, -0.42, bz, '#3d3b3a'); for (const wz of [-0.42, 0.42]) B(base, new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), sx * 1.36, -0.13, bz + wz, '#ffd23a'); } for (const sx of [-1, 1]) for (const wz of [-0.85, 0.85]) { const w = new THREE.CylinderGeometry(0.42, 0.42, 0.18, 12); w.rotateZ(Math.PI / 2); B(base, w, sx * 1.22, -0.4, bz + wz, '#3d3b3a'); } }
    { const cap = new THREE.CylinderGeometry(1.7, 1.7, 14.1, 14, 1, false, -Math.PI / 2, Math.PI); cap.rotateX(Math.PI / 2); cap.scale(1, 0.22, 1); B(roof, cap, 0, 3.38, 0, '#d9d6cf'); }
    for (const pz of [-4.5, 4.5]) { B(roof, Box(1.4, 0.32, 2.2), 0, 3.72, pz, '#bfc3c7'); for (let i = 0; i < 5; i++) B(roof, Box(1.2, 0.02, 0.06), 0, 3.89, pz - 0.8 + i * 0.4, '#5c6670'); }
    for (const sx of [-1, 1]) B(roof, Box(0.08, 0.08, 14.1), sx * 1.68, 3.42, 0, '#9aa0a6');
    for (const ez of [-7, 7]) { const isNose = (ez > 0 && k === 0) || (ez < 0 && k === CARS - 1); if (!isNose) continue; const s = Math.sign(ez);
      const sh = new THREE.Shape([[0, -0.05], [0, 3.42], [0.45, 3.4], [1.7, 2.15], [2.35, 1.15], [2.45, 0.45], [2.25, -0.05]].map(([u, v]) => new THREE.Vector2(u, v)));
      const ng = new THREE.ExtrudeGeometry(sh, { depth: 3.0, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2, curveSegments: 1 }); ng.translate(0, 0, -1.5); ng.rotateY(-s * Math.PI / 2); B(base, ng, 0, 0, ez, body);
      { const u0 = 0.45, v0 = 3.4, u1 = 1.7, v1 = 2.15, du = u1 - u0, dv = v1 - v0, l = Math.hypot(du, dv), nu = -dv / l, nv = du / l, wg = new THREE.BoxGeometry(2.9, 0.03, l * 0.9);
        wg.rotateX(Math.atan2(-dv, du)); if (s < 0) wg.rotateY(Math.PI); B(base, wg, 0, (v0 + v1) / 2 + nv * 0.13, ez + s * ((u0 + u1) / 2 + nu * 0.13), '#1d2730'); }
      for (const sx of [-1, 1]) { B(glo, Box(0.5, 0.18, 0.06), sx * 1.05, 1.0, ez + s * 2.55, '#fff6d8'); B(glo, Box(0.26, 0.09, 0.05), sx * 1.05, 0.76, ez + s * 2.55, '#ff3b2f'); } B(base, Box(3.1, 0.3, 0.3), 0, 0.15, ez + s * 2.3, other === '#ec3013' ? '#ec3013' : '#201e1d');
      B(base, Box(3.04, 0.5, 0.05), 0, 0.92, ez + s * 2.51, '#201e1d'); B(base, Box(1.2, 0.04, 0.03), 0, 1.07, ez + s * 2.545, '#c0c4cc'); B(base, Box(0.5, 0.26, 0.5), 0, 0.12, ez + s * 2.6, '#3d3b3a');
      B(base, Box(3.0, 0.08, 0.06), 0, 1.45, ez + s * 2.33, other);
      { const t = 0.17, bu = 0.45 + 1.25 * t + 0.707 * 0.15, bv = 3.4 - 1.25 * t + 0.707 * 0.15, bg = new THREE.PlaneGeometry(1.7, 0.24).toNonIndexed(), a = bg.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * 0.5, (1 + a.getY(i)) / 6); bg.rotateX(-Math.PI / 4); if (s < 0) bg.rotateY(Math.PI); bg.translate(0, bv, ez + s * bu); g.add(new THREE.Mesh(bg, atlasMat)); }
      { const pg = []; B(roof, Box(0.9, 0.12, 0.9), 0, 3.82, -s * 2.5, '#3d3b3a'); const arm = new THREE.BoxGeometry(0.06, 0.06, 1.6); arm.rotateX(0.7 * s); B(roof, arm, 0, 4.35, -s * 2.2, '#3d3b3a'); B(roof, Box(1.4, 0.05, 0.12), 0, 4.85, -s * 1.7, '#3d3b3a'); } }
    const mb = new THREE.Mesh(merge(base), vc()), mr = new THREE.Mesh(merge(roof), vc()), mg = new THREE.Mesh(merge(glass), winMat); g.add(mb, mr, mg, new THREE.Mesh(merge(glo), gloMat)); if (!touch) mb.castShadow = mr.castShadow = walls[-1].castShadow = walls[1].castShadow = true;
    const dm = {}; for (const sd of [-1, 1]) { const frm = []; const d = [card(1.7, 0.85, sd * 1.69, 0.8, 0, sd * Math.PI / 2, k / 4, (k + 1) / 4, 1 / 3, 2 / 3)]; for (const dz of DOORZ) d.push(card(1.5, 0.19, sd * 1.525, 2.86, dz, -sd * Math.PI / 2, 0, 1, 2 / 3, 1)); d.push(card(1.7, 0.2, sd * 1.705, 2.95, 0, sd * Math.PI / 2, 0, 0.5, 1 - 320 / 384, 1 - 256 / 384)); B(frm, Box(0.04, 0.28, 1.78), sd * 1.67, 2.95, 0, '#14181c'); dm[sd] = new THREE.Mesh(mergeUV(d), atlasMat); g.add(dm[sd]);
      const ad = []; [-5.9, -2.15, 2.15, 5.9].forEach((z, j) => { const w = Math.abs(z) > 4 ? 1.75 : 1.8, [u0, u1, v0, v1] = AD_V((k * 4 + j + (sd > 0 ? 2 : 0)) % 8); ad.push(card(w, w / 2.05, sd * 1.705, 0.8, z, sd * Math.PI / 2, u0, u1, v0, v1)); B(frm, Box(0.04, w / 2.05 + 0.1, w + 0.1), sd * 1.67, 0.8, z, '#201e1d'); });   // raised poster frame: the advert sits on it (no flat-on-wall flicker)
      const am = new THREE.Mesh(mergeUV(ad), adMat); g.add(am); dm[sd].userData.ads = am; const fm = new THREE.Mesh(merge(frm), vc()); g.add(fm); if (!touch) fm.castShadow = true; dm[sd].userData.fr = fm; }
    const leafM = vc(), leafGeo = s => merge([piece(Box(0.06, 2.3, 1.6), 0, 0, 0, 0, body), piece(Box(0.07, 1.05, 1.1), 0, 0.4, 0, 0, '#1d2730'), piece(Box(0.075, 2.3, 0.06), 0, 0, -s * 0.77, 0, '#201e1d')]);
    const leaves = []; for (const sd of [-1, 1]) for (const dz of DOORZ) { const m = new THREE.Mesh(leafGeo(Math.sign(dz)), leafM); m.position.set(sd * 1.68, 1.45, dz); g.add(m); leaves.push({ m, sd, dz }); }
    const lamp = new THREE.PointLight(0xffe2b0, 0, 11, 1.4); lamp.position.set(0, 2.7, 0); lamp.visible = false; g.add(lamp);   // night: the cabin light
    cars.push({ g, roof: mr, wl: walls[-1], wr: walls[1], dl: dm[-1], dr: dm[1], leaves, lamp }); }
  const carF = cars.map(() => ({ x: 0, z: 0, yaw: 0 }));
  let S = stops[0].s + DOCK, v = 0, phase = 'dwell', timer = 6, cur = 0, doorOpen = 0, night = false;
  function placeCars() { for (let k = 0; k < CARS; k++) { const sk = S - k * PITCH, a = at(sk - 6 * K), b = at(sk + 6 * K), F = carF[k]; F.x = (a.x + b.x) / 2; F.z = (a.z + b.z) / 2; F.yaw = Math.atan2(b.x - a.x, b.z - a.z); cars[k].g.position.set(F.x, RAIL_Y, F.z); cars[k].g.rotation.y = F.yaw; } }
  const toWorldCar = (k, lx, lz) => { const F = carF[k], c = Math.cos(F.yaw), s = Math.sin(F.yaw); lx *= K; lz *= K; return { x: F.x + lx * c + lz * s, y: PLAT_Y, z: F.z - lx * s + lz * c, yaw: F.yaw }; };
  const docked = () => phase === 'dwell' && doorOpen > 0.7 ? stops[cur] : null;
  const carA = (st, k) => mod(S - k * PITCH - st.s + LEN / 2, LEN) - LEN / 2;
  function boardAt(st, a) { if (docked() !== st) return null; for (let k = 0; k < CARS; k++) { const lz = (a - carA(st, k)) / K; for (const dz of DOORZ) if (Math.abs(lz - dz) < 0.7) return { car: k, x: st.side * 1.2, z: lz, yaw: Math.atan2(-st.side, 0), sit: null }; } return null; }

  // ---------- walking: ground heights, platform edges, lifts, the inside of the cars ----------
  function groundAt(x, z, y) { for (const st of stops) { const f = frame(st, x, z); if (!f) continue; const { a, ls } = f;
      if (Math.abs(a - st.liftA) <= 1.5 && ls >= 7.9 && ls <= 10.9) { if (y >= st.lift.y - 1.2) return st.lift.y; continue; }
      if (Math.abs(a) <= HALF && ls >= 1.85 && ls <= 7.95 && y > 6) return PLAT_Y; } return null; }
  function walkClamp(x0, z0, nx, nz, y) { for (const st of stops) { const f = frame(st, nx, nz); if (!f) continue; let { a, ls } = f, ch = false; const Lf = st.lift, inPad = Math.abs(a - st.liftA) <= 1.7 && ls >= 7.7 && ls <= 11.1;
      if (inPad && y < 1 && Lf.y > 0.3) return { x: x0, z: z0 };
      if (inPad && y > 0.3) { const a2 = clamp(a, st.liftA - 1.35, st.liftA + 1.35); if (a2 !== a) { a = a2; ch = true; } if (Lf.y > PLAT_Y - 0.15) { if (ls > 10.65) { ls = 10.65; ch = true; } } else if (ls < 8.15 || ls > 10.65) { ls = clamp(ls, 8.15, 10.65); ch = true; } }
      else if (y > 6 && Math.abs(a) <= HALF + 1 && ls > 1 && ls < 8.6) {
        if (Math.abs(a) > HALF) { a = Math.sign(a) * HALF; ch = true; }
        if (ls > 7.9 && (Math.abs(a - st.liftA) > 1.35 || Lf.y < PLAT_Y - 0.15)) { ls = 7.9; ch = true; }
        if (ls < 1.9) { const b = boardAt(st, a); if (b) return { x: nx, z: nz, board: b }; ls = 1.9; ch = true; } }
      if (ch) { const w = toW(st, a, ls); return { x: w.x, z: w.z }; } } return { x: nx, z: nz }; }
  function moveInCar(ab, lx, lz) { const dk = docked(), side = dk ? dk.side : 0, inDoor = DOORZ.some(d => Math.abs(lz - d) < 0.75);
    if (inDoor && side && lx * side > 1.3) { const w = toWorldCar(ab.car, side * 2.5, lz); return { exit: w }; }
    lx = clamp(lx, -(inDoor ? 1.2 : 0.55), inDoor ? 1.2 : 0.55); const gw = Math.abs(lx) < 0.5;
    if (lz > 7.5 && gw && ab.car > 0) { ab.car--; lz -= PD; } else if (lz < -7.5 && gw && ab.car < CARS - 1) { ab.car++; lz += PD; }
    lz = clamp(lz, ab.car === CARS - 1 || !gw ? -6.6 : -7.6, ab.car === 0 || !gw ? 6.6 : 7.6); ab.x = lx; ab.z = lz; return {}; }
  const nearSeat = ab => { if (ab.sit) return null; for (const z of ROWS) if (Math.abs(ab.z - z) < 0.6 && Math.abs(ab.x) < 0.7) return { x: (ab.x >= 0 ? 1 : -1) * 1.0, z }; return null; };
  const nearMachine = (x, z, y) => y < 1.5 ? (machines.find(m => Math.hypot(m.x - x, m.z - z) < 2.3) || null) : null;
  function onPlatform(x, z, y) { if (y < 6) return null; for (const st of stops) { const f = frame(st, x, z); if (f && Math.abs(f.a) <= HALF + 1 && f.ls > 1 && f.ls < 11) return st; } return null; }
  function keepOut(x, z, m = 0) { for (const st of stops) { const f = frame(st, x, z); if (f && Math.abs(f.a) < HALF + 4 + m && f.ls > -m && f.ls < 12 + m) return true; } return false; }
  function placeAt(key, mode) { const st = stops.find(q => q.key === key); if (!st) return null;
    if (mode === 'train') { const w = toW(st, st.liftA - 5, 5); return { x: w.x, z: w.z, y: PLAT_Y, yaw: w.yaw }; }
    const b = st.b, F = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }[b.face]; return { x: b.door[0] + F[0] * 3.5, z: b.door[1] + F[1] * 3.5, y: 0, yaw: Math.atan2(F[0], F[1]) }; }
  function setView(vw) { for (const c of cars) { const walk = vw && !vw.sit; c.roof.visible = !walk; c.wl.visible = !(walk && vw.camSide < 0); c.wr.visible = !(walk && vw.camSide > 0); c.dl.visible = c.dl.userData.ads.visible = c.dl.userData.fr.visible = c.wl.visible; c.dr.visible = c.dr.userData.ads.visible = c.dr.userData.fr.visible = c.wr.visible; for (const l of c.leaves) l.m.visible = !(walk && vw.camSide && l.sd === vw.camSide); } }
  function setNight(on) { night = on; adMat.color.set(on ? 0xffffff : 0xdedede); winMat.color.set(on ? 0xffe2b0 : 0x9fd6ff); winMat.opacity = on ? 0.42 : 0.35; for (const c of cars) { c.lamp.visible = on; c.lamp.intensity = on ? 6 : 0; } glow.visible = on; for (const m of signs) m.color.set(on ? 0xffffff : 0xe8e8e8); }
  function status() { const st = stops[cur], nx = stops[(cur + 1) % stops.length]; if (phase === 'dwell') return { phase, at: st, next: nx, t: Math.max(0, Math.ceil((api.dwell || DWELL) - timer)) }; const rem = mod(st.s + DOCK - S, LEN); return { phase, next: st, t: Math.ceil(rem / Math.max(v, 9)) }; }

  // ---------- per frame: schedule, cars, doors, lifts ----------
  function tick(dt, now) { const p = api.player;
    const DW = api.dwell || DWELL;   // ride demo: shorter stops; hold = keep the doors open
    if (phase === 'dwell') { timer += dt; if (api.hold && timer > DW - 4) timer = DW - 4; const want = timer > 1.5 && timer < DW - 2.5; doorOpen = clamp(doorOpen + (want ? 1.6 : -1.6) * dt, 0, 1); if (timer >= DW && doorOpen <= 0) { phase = 'run'; cur = (cur + 1) % stops.length; } }
    else { const tgt = stops[cur].s + DOCK, rem = mod(tgt - S, LEN), vt = Math.min(VMAX, Math.sqrt(2 * ACC * Math.max(0, rem - 0.02))); v = Math.min(v + ACC * dt, vt); const stp = v * dt;
      if (stp >= rem || rem < 0.03) { S = tgt; v = 0; phase = 'dwell'; timer = 0; if (api.onArrive) api.onArrive(stops[cur]); } else S += stp; }
    S = mod(S, LEN); placeCars();
    const side = phase === 'dwell' ? stops[cur].side : 0, e = doorOpen * doorOpen * (3 - 2 * doorOpen);
    for (const c of cars) for (const l of c.leaves) l.m.position.z = l.dz + Math.sign(l.dz) * 1.55 * (l.sd === side ? e : 0);
    for (const st of stops) { const Lf = st.lift; let onPad = false, riding = false;
      if (p && !p.ab) { const f = frame(st, p.x, p.z); if (f) { onPad = Math.abs(f.a - st.liftA) <= 1.5 && f.ls >= 7.9 && f.ls <= 10.9; riding = onPad && Math.abs(p.y - Lf.y) < 0.8;
        if (!onPad && p.y < 1 && Math.abs(f.a - st.liftA) < 4 && f.ls > 6 && f.ls < 14) Lf.target = 0.05;
        if (!onPad && p.y > 6 && Math.abs(f.a - st.liftA) < 2.5 && f.ls > 5.5) Lf.target = PLAT_Y; } }
      if (riding) { if (!Lf.trip) { Lf.wait += dt; if (Lf.wait > 0.7) { Lf.trip = true; Lf.target = Lf.y < 4 ? PLAT_Y : 0.05; } } } else if (!onPad) { Lf.trip = false; Lf.wait = 0; }
      Lf.y += clamp(Lf.target - Lf.y, -3 * dt, 3 * dt); Lf.mesh.position.y = Lf.y - 0.1; } }
  placeCars();
  const api = { toW: (key, a, ls) => toW(stops.find(q => q.key === key), a, ls), carA: (key, k) => carA(stops.find(q => q.key === key), k), stops, PLAT_Y, LEN, K, line: L.TRAIN.line, colliders, groundAt, walkClamp, moveInCar, toWorldCar, carF, docked, nearSeat, nearMachine, onPlatform, keepOut, placeAt, setView, setNight, status, tick, player: null, onArrive: null, hold: false, dwell: null,
    // ride demo: bring the train in to a stop from 'lead' metres back (it pulls in and opens its doors)
    summon(key, lead = 150) { const i = stops.findIndex(q => q.key === key); if (i < 0) return; cur = i; phase = 'run'; S = mod(stops[i].s + DOCK - lead, LEN); v = 12; timer = 0; doorOpen = 0; placeCars(); },
    phase: () => phase };
  return api;
}
