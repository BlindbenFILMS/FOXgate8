// MERU 2.0 — s124 RUINS MUSEUM DELUXE PART B: the other 7 museum jobs (built inside worlds/meru2-ruins-jobs.js, which owns J, the card,
// the camera, rings + the walk-job plumbing; J here is a proxy onto the running job).
// SAGE: SORT BY AGE (tap oldest → newest: STONE → CLAY → BRONZE → GOLD → GLASS) · APPRAISE (REAL or FAKE stamp: 8 dots, no sticker, no pink)
//       · THE MOSAIC (tap the turned tiles round until the picture is whole) · NIGHT WATCH (walk: catch the hooded thief at the cases, E).
// SANDY: CATALOGUE (tap the tag, then the crate with its code) · DIG A SQUARE (tap the square, trowel ×4, then shake the sieve)
//       · THE RUBBING (drag the crayon over the paper on the carved slab until the carving shows).
export function rsJobsB(X) {
  const { THREE, G, V, LM, CT, box, cyl, colF, colC, plane, label, plaque, JX: J, own, miss, addGold, NEXT, toast, finishGame, tone, noise, chimes, clack, puff, TAPR, scrW, dist, nearest, ptr, ray, hitY, rnd, gauge, kit, C, PIT, drawMark } = X;
  const { INK, RED, YEL, WHITE, GOLD, STONE, STONED, WOOD, WOODD, CLAY, SAND } = C;
  const hitZ = z => { const r = ray(); if (Math.abs(r.direction.z) < 1e-4) return null; const t = (z - r.origin.z) / r.direction.z; return t > 0 ? r.origin.clone().addScaledVector(r.direction, t) : null; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fly = (o, to, t = 0.5, arc = 0.25) => { o.userData.fly = { from: o.position.clone(), to: to.clone(), t: 0, d: t, arc }; FLY.push(o); }, FLY = [];
  const flyTick = dt => { for (let i = FLY.length - 1; i >= 0; i--) { const o = FLY[i], f = o.userData.fly; f.t = Math.min(1, f.t + dt / f.d); const e = f.t * f.t * (3 - 2 * f.t); o.position.lerpVectors(f.from, f.to, e); o.position.y += Math.sin(e * Math.PI) * f.arc; if (f.t >= 1) { FLY.splice(i, 1); o.userData.fly = null; } } };
  const txt = s => '<div style="font-size:13px;font-weight:800">' + s + '</div>';
  // ---------- static props for part B ----------
  // SORT table + TIMELINE board (east of the walkway, south of the stone head)
  const ST = { x: -371.5, z: -56.9, y: 0.94 }; box(G, 2.6, 0.06, 0.7, WOOD, ST.x, 0.9, ST.z); for (const sx of [-1.2, 1.2]) for (const sz of [-0.28, 0.28]) box(G, 0.07, 0.88, 0.07, WOODD, ST.x + sx, 0.44, ST.z + sz);
  for (const sx of [-1.25, 1.25]) box(G, 0.08, 2.2, 0.08, WOODD, ST.x + sx, 1.1, ST.z - 0.4); box(G, 2.6, 0.9, 0.05, '#2b2219', ST.x, 1.75, ST.z - 0.42); box(G, 2.5, 0.04, 0.16, WOOD, ST.x, 1.33, ST.z - 0.35); colF(ST.x - 1.35, ST.x + 1.35, ST.z - 0.5, ST.z + 0.36);
  plane(CT(1024, 128, (g, W, H) => { g.fillStyle = '#2b2219'; g.fillRect(0, 0, W, H); g.fillStyle = GOLD; g.font = '900 52px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('OLDEST', 20, H / 2); g.textAlign = 'right'; g.fillText('NEWEST', W - 20, H / 2); g.fillRect(250, H / 2 - 4, W - 520, 8); g.beginPath(); g.moveTo(W - 250, H / 2 - 22); g.lineTo(W - 220, H / 2); g.lineTo(W - 250, H / 2 + 22); g.fill(); }), 2.5, 0.31, ST.x, 2.0, ST.z - 0.39, 0, G, false);
  const SLOT = i => V(ST.x - 1.0 + i * 0.5, 1.4, ST.z - 0.35);
  // APPRAISAL stamps on the Sage's desk (east end)
  const AD = { x: -379.1, z: -62.3, y: 0.98 }; const stampT = (t, c) => CT(128, 64, (g, W, H) => { g.fillStyle = c; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(t, W / 2, H / 2 + 2); });
  const STAMPS = [['REAL', '#2f8a4c', -378.2, -61.98], ['FAKE', '#c8262c', -378.2, -62.62]].map(([t, c, x, z]) => { const g = new THREE.Group(); g.position.set(x, 0.98, z); G.add(g); box(g, 0.2, 0.06, 0.13, c, 0, 0.03, 0); cyl(g, 0.025, 0.03, 0.13, WOODD, 0, 0.12, 0, 8); const k = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), LM(WOOD)); k.position.y = 0.2; g.add(k);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.095), new THREE.MeshBasicMaterial({ map: stampT(t, c) })); lb.rotation.x = -Math.PI / 2; lb.position.y = 0.062; g.add(lb); return { t, g, p: V(x, 1.05, z) }; });
  // THE MOSAIC on the hall floor (north-west)
  const MO = { x: -390.5, z: -61.8, s: 0.9 }; box(G, MO.s * 3 + 0.3, 0.03, MO.s * 3 + 0.3, '#5e5039', MO.x, 0.065, MO.z);
  // the CARVED SLAB for rubbings (dig room, south wall, faces north)
  const SL = { x: -411.5, z: -45.75, y: 1.25, w: 1.2, h: 0.85 }; box(G, 1.5, 1.1, 0.24, STONED, SL.x, 1.25, -45.55); box(G, 1.6, 0.7, 0.5, WOODD, SL.x, 0.35, -45.6); colF(SL.x - 0.8, SL.x + 0.8, -45.9, -45.3);
  plane(label('CARVINGS \u00b7 RUBBINGS ONLY', '#2b2219', GOLD, 512, 80, 36), 1.3, 0.2, SL.x, 2.0, -45.665, Math.PI);
  // the CATALOGUE stand + crate codes on the north-wall shelves (A-H × 1-3)
  const CS = { x: -398.8, z: -68.15, y: 1.0 }; box(G, 0.5, 1.0, 0.5, WOODD, CS.x, 0.5, CS.z); colF(CS.x - 0.27, CS.x + 0.27, CS.z - 0.27, CS.z + 0.27);
  const CRATES = []; for (let i = 0; i < 2; i++) for (const [r, y] of [[1, 0.44], [2, 1.24], [3, 2.04]]) for (let k = 0; k < 4; k++) { const col = i * 4 + k, code = 'ABCDEFGH'[col] + r, x = -400 + i * 2.4 - 0.75 + k * 0.5;
    plane(label(code, '#e7dcc4', INK, 128, 64, 40), 0.2, 0.1, x, y + 0.04, -68.925, 0); CRATES.push({ code, p: V(x, y + 0.05, -68.95), x, y }); }
  // dig pit grid labels: letters along the south edge, numbers along the east edge
  for (let i = 0; i < 8; i++) { const m = plane(label('ABCDEFGH'[i], '#2b2219', GOLD, 64, 64, 46), 0.28, 0.28, PIT.x0 + i + 0.5, 0.42, PIT.z1 + 0.09, 0); m.rotation.x = -0.9; }
  for (let j = 0; j < 6; j++) { const m = plane(label(String(j + 1), '#2b2219', GOLD, 64, 64, 46), 0.28, 0.28, PIT.x1 + 0.09, 0.42, PIT.z1 - j - 0.5, Math.PI / 2); m.rotation.order = 'YXZ'; m.rotation.x = -0.9; }
  const SV = { x: -401.2, z: -64, y: 1.0 }, sieve = new THREE.Group(); sieve.position.set(SV.x, 0.995, SV.z); G.add(sieve); { const fr = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 20), LM(WOOD)); fr.rotation.x = Math.PI / 2; fr.position.y = 0.05; sieve.add(fr); const mesh = new THREE.Mesh(new THREE.CircleGeometry(0.31, 20), LM('#8a8a8a')); mesh.rotation.x = -Math.PI / 2; mesh.position.y = 0.04; sieve.add(mesh); }
  // ================= SORT BY AGE (Sage) =================
  const MATS = [['STONE', g => { const b = box(g, 0.16, 0.05, 0.08, '#8d8d8d', 0, 0.03, 0); b.rotation.y = 0.4; cyl(g, 0.012, 0.012, 0.18, WOOD, 0.06, 0.05, 0.02, 6).rotation.z = 1.2; }], ['CLAY', g => { cyl(g, 0.06, 0.045, 0.12, CLAY, 0, 0.06, 0, 10); cyl(g, 0.03, 0.05, 0.03, CLAY, 0, 0.13, 0, 10); }],
    ['BRONZE', g => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.016, 8, 16), LM('#a0703a')); r.rotation.x = Math.PI / 2; r.position.y = 0.02; g.add(r); }], ['GOLD', g => { cyl(g, 0.055, 0.055, 0.014, GOLD, 0, 0.01, 0, 16); }],
    ['GLASS', g => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), new THREE.MeshPhongMaterial({ color: '#9fd6ff', transparent: true, opacity: 0.75, shininess: 120 })); b.position.y = 0.04; g.add(b); }]];
  const B1 = {
    begin() { Object.assign(J, { N: 3, n: 0, items: [] }); toast('OLDEST FIRST \u00b7 STONE, CLAY, BRONZE, GOLD, GLASS', 3); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.items.forEach(it => it.g.parent && it.g.parent.remove(it.g)); J.t0 = J.t; J.over = false; J.k = 0;
      const L = shuffle([0, 1, 2, 3, 4]).slice(0, 3 + Math.min(2, J.n)).sort((a, b) => a - b); J.order = L; J.items = shuffle(L).map((m, i, a) => { const g = own(new THREE.Group()); MATS[m][1](g); g.scale.setScalar(1.6); g.position.set(ST.x - 0.9 + i * (1.8 / Math.max(1, a.length - 1)), ST.y, ST.z + 0.12); return { m, g, done: false }; }); },
    press() { const i = nearest(J.items, it => it.g.position.clone().add(V(0, 0.06, 0)), TAPR() * 1.1); if (i < 0) return; const it = J.items[i]; if (it.done) return;
      if (it.m === J.order[J.k]) { it.done = true; fly(it.g, SLOT(J.k), 0.45, 0.2); clack(); tone(520 + J.k * 110, 0.04, 0.3, 'triangle'); addGold(1); J.k++;
        if (J.k >= J.order.length) { J.over = true; chimes(); addGold(J.t - J.t0 < 12 ? 4 : 3); toast(J.n + 1 < J.N ? 'IN ORDER \u00b7 AS THE HILL LAID THEM' : 'THE TIMELINE IS RIGHT', 1.5); J.n++; NEXT(() => B1.next(), 1.6); } }
      else miss('NOT YET \u00b7 ' + MATS[J.order[J.k]][0] + ' IS OLDER', 1.8); },
    tick(dt) { flyTick(dt); if (!J.over && J.t - J.t0 > 25) { J.over = true; miss('TOO SLOW \u00b7 THE SAGE SORTS THEM'); J.n++; NEXT(() => B1.next(), 1.2); } },
    hint() { const it = J.items.find(q => !q.done && q.m === J.order[J.k]); return it ? [it.g.position, 'OLDEST'] : null; },
    card() { return ['SHELF ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, txt('STONE \u2192 CLAY \u2192 BRONZE \u2192 GOLD \u2192 GLASS') + txt('NEXT \u00b7 THE OLDEST LEFT') + gauge(1 - Math.max(0, J.t - J.t0) / 25), J.n + '_' + J.k]; },
    shot() { return [V(ST.x, 1.25, ST.z - 0.1), 2.7, 1.4, 0.32, 1.6, 0, 3.2]; },
    end() { FLY.length = 0; } };
  // ================= APPRAISE: REAL OR FAKE (Sage) =================
  const mkItem = (kind, real) => { const g = new THREE.Group(); let why = '';
    if (kind === 'coin') { const n = real ? 8 : (Math.random() < 0.5 ? 7 : 9); cyl(g, 0.13, 0.13, 0.02, GOLD, 0, 0.012, 0, 22); for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, d = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 4), LM('#6e5114')); d.position.set(Math.cos(a) * 0.085, 0.025, Math.sin(a) * 0.085); g.add(d); } why = real ? 'EIGHT DOTS \u00b7 REAL' : 'ONLY ' + n + ' DOTS \u00b7 FAKE'; if (!real && n === 9) why = 'NINE DOTS \u00b7 FAKE'; }
    else if (kind === 'pot') { cyl(g, 0.09, 0.07, 0.2, CLAY, 0, 0.1, 0, 12); cyl(g, 0.05, 0.08, 0.05, CLAY, 0, 0.22, 0, 12); const b = new THREE.Mesh(new THREE.TorusGeometry(0.088, 0.01, 6, 20), LM('#5e2a18')); b.rotation.x = Math.PI / 2; b.position.y = 0.12; g.add(b);
      if (!real) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.05), new THREE.MeshBasicMaterial({ map: label('GIFT SHOP', '#ffffff', RED, 256, 128, 50) })); s.position.set(0, 0.08, 0.087); g.add(s); } why = real ? 'HAND PAINTED \u00b7 REAL' : 'A GIFT SHOP STICKER \u00b7 FAKE'; }
    else { const c = real ? '#e9e1cf' : '#ff6fb5'; const f = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), LM(c)); f.scale.set(1, 1, 0.45); f.position.y = 0.11; g.add(f); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 4), LM(c)); e.position.set(s * 0.06, 0.22, 0); g.add(e); const h = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), LM(INK)); h.position.set(s * 0.04, 0.13, 0.05); g.add(h); } why = real ? 'OLD BONE \u00b7 REAL' : 'PINK PLASTIC \u00b7 FAKE'; }
    return { g, real, why }; };
  const B2 = {
    begin() { const kinds = shuffle(['coin', 'coin', 'pot', 'pot', 'mask', 'mask']), real = shuffle([1, 1, 1, 0, 0, 0]); Object.assign(J, { N: 6, n: 0, list: kinds.map((k, i) => [k, !!real[i]]), it: null }); toast('REAL OR FAKE? STAMP IT', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } if (J.it) J.it.g.parent && J.it.g.parent.remove(J.it.g); J.t0 = J.t; J.over = false; const [k, r] = J.list[J.n]; const it = mkItem(k, r); own(it.g); it.g.position.set(AD.x, AD.y, AD.z); it.g.scale.setScalar(0.4); J.it = it; J.grow = 0; },
    press() { if (J.over) return; const i = nearest(STAMPS, s => s.p, TAPR() * 1.3); if (i < 0) return; const s = STAMPS[i], sayReal = s.t === 'REAL'; J.over = true; s.g.position.y = 0.9; setTimeout(() => { s.g.position.y = 0.98; }, 160); noise(0.08, 0.04, 800); tone(150, 0.06, 0.12, 'square');
      if (sayReal === J.it.real) { addGold(3); chimes(); toast(J.it.why, 1.4); } else miss('NO \u00b7 ' + J.it.why, 2.0); fly(J.it.g, V(AD.x - 0.9, AD.y + 0.05, AD.z - 0.5), 0.6, 0.2); J.n++; NEXT(() => B2.next(), 1.5); },
    tick(dt) { flyTick(dt); if (J.it && J.grow < 1) { J.grow = Math.min(1, J.grow + dt * 3); J.it.g.scale.setScalar(0.4 + J.grow * 0.6); } if (J.it && !J.it.g.userData.fly) J.it.g.rotation.y += dt * 0.6;
      if (!J.over && J.t - J.t0 > 15) { J.over = true; miss('TOO SLOW \u00b7 ' + J.it.why); J.n++; NEXT(() => B2.next(), 1.4); } },
    hint() { return J.over ? null : [STAMPS[J.it.real ? 0 : 1].p, J.it.real ? 'REAL' : 'FAKE']; },
    card() { return ['PIECE ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, txt('REAL = 8 DOTS \u00b7 NO STICKER \u00b7 NO PINK') + txt('TAP A STAMP') + gauge(1 - Math.max(0, J.t - J.t0) / 15), J.n + '_' + J.over]; },
    shot() { return [V(-378.75, 1.07, -62.3), 1.3, 0.6, 0.62, 1.0, 0, 1.8]; },
    end() { FLY.length = 0; } };
  // ================= THE MOSAIC (Sage): tap the turned tiles round =================
  const PICS = [(g, W) => { g.fillStyle = '#e6d3a8'; g.fillRect(0, 0, W, W); g.fillStyle = '#c2410c'; g.beginPath(); g.moveTo(W * 0.2, W * 0.2); g.lineTo(W * 0.38, W * 0.45); g.lineTo(W * 0.62, W * 0.45); g.lineTo(W * 0.8, W * 0.2); g.lineTo(W * 0.78, W * 0.62); g.lineTo(W / 2, W * 0.85); g.lineTo(W * 0.22, W * 0.62); g.closePath(); g.fill(); g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(W * 0.32, W * 0.62); g.lineTo(W / 2, W * 0.85); g.lineTo(W * 0.68, W * 0.62); g.lineTo(W / 2, W * 0.7); g.fill(); g.fillStyle = INK; g.fillRect(W * 0.36, W * 0.5, W * 0.07, W * 0.05); g.fillRect(W * 0.57, W * 0.5, W * 0.07, W * 0.05); g.beginPath(); g.arc(W / 2, W * 0.8, W * 0.03, 0, 7); g.fill(); }, 
    (g, W) => { g.fillStyle = '#2e4a6b'; g.fillRect(0, 0, W, W); g.strokeStyle = GOLD; g.lineWidth = W * 0.04; g.beginPath(); g.arc(W / 2, W / 2, W * 0.32, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.fillStyle = i % 2 ? GOLD : '#f3f2f2'; g.beginPath(); g.arc(W / 2 + Math.cos(a) * W * 0.32, W / 2 + Math.sin(a) * W * 0.32, W * 0.06, 0, 7); g.fill(); } g.fillStyle = RED; g.beginPath(); g.arc(W / 2, W / 2, W * 0.1, 0, 7); g.fill(); },
    (g, W) => { g.fillStyle = '#3f6a3a'; g.fillRect(0, 0, W, W); g.fillStyle = GOLD; g.beginPath(); g.arc(W * 0.3, W * 0.35, W * 0.14, 0, 7); g.fill(); g.fillStyle = '#3f6a3a'; g.beginPath(); g.arc(W * 0.3, W * 0.35, W * 0.07, 0, 7); g.fill(); g.fillStyle = GOLD; g.fillRect(W * 0.4, W * 0.32, W * 0.45, W * 0.06); g.fillRect(W * 0.72, W * 0.38, W * 0.05, W * 0.14); g.fillRect(W * 0.82, W * 0.38, W * 0.05, W * 0.1); g.fillStyle = '#9fd6ff'; g.beginPath(); g.arc(W * 0.3, W * 0.35, W * 0.04, 0, 7); g.fill(); g.fillStyle = '#f3f2f2'; g.font = '900 ' + (W * 0.12) + 'px Archivo, sans-serif'; g.fillText('IX', W * 0.4, W * 0.82); }];
  const frameT = CT(64, 64, (g, W) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, W, W); g.strokeStyle = '#5e5039'; g.lineWidth = 4; g.strokeRect(1, 1, W - 2, W - 2); });
  const B3 = {
    begin() { Object.assign(J, { N: 3, n: 0, tiles: [] }); toast('TAP A TURNED TILE TO SPIN IT ROUND', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.tiles.forEach(t => t.m.parent && t.m.parent.remove(t.m)); J.t0 = J.t; J.over = false; const tex = CT(384, 384, PICS[J.n % 3]); const bad = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 4 + J.n);
      J.tiles = []; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) { const geo = new THREE.PlaneGeometry(MO.s - 0.03, MO.s - 0.03), uv = geo.attributes.uv; for (let q = 0; q < uv.count; q++) uv.setXY(q, (i + uv.getX(q)) / 3, 1 - (j + 1 - uv.getY(q)) / 3);
        const m = own(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex }))); const idx = j * 3 + i, rot = bad.includes(idx) ? 1 + (Math.random() * 3 | 0) : 0; m.position.set(MO.x + (i - 1) * MO.s, 0.085, MO.z + (j - 1) * MO.s); m.rotation.set(-Math.PI / 2, 0, -rot * Math.PI / 2);
        const fr = new THREE.Mesh(new THREE.PlaneGeometry(MO.s, MO.s), new THREE.MeshBasicMaterial({ map: frameT, transparent: true })); fr.position.z = 0.002; m.add(fr); J.tiles.push({ m, rot, a: -rot * Math.PI / 2 }); } },
    press() { if (J.over) return; const i = nearest(J.tiles, t => t.m.position, TAPR() * 1.6); if (i < 0) return; const t = J.tiles[i]; if (t.rot === 0) { miss('THAT TILE WAS RIGHT \u00b7 SPIN IT BACK', 1.6); } t.rot = (t.rot + 1) % 4; clack();
      if (J.tiles.every(q => q.rot === 0)) { J.over = true; chimes(); addGold(J.t - J.t0 < 14 ? 5 : 3); toast(J.n + 1 < J.N ? 'THE PICTURE IS WHOLE' : 'THREE MOSAICS, RESTORED', 1.5); J.n++; NEXT(() => B3.next(), 1.8); } else if (t.rot === 0) { tone(880, 0.04, 0.3, 'triangle'); addGold(1); } },
    tick(dt) { for (const t of J.tiles) { const tgt = -t.rot * Math.PI / 2; let d = tgt - t.a; while (d > 0.01) d -= Math.PI * 2; t.a += Math.max(d, -dt * 9); if (Math.abs(d) < 0.02) t.a = tgt; t.m.rotation.z = t.a; }
      if (!J.over && J.t - J.t0 > 30) { J.over = true; miss('TOO SLOW \u00b7 THE SAGE TURNS THE REST'); J.tiles.forEach(t => { t.rot = 0; }); J.n++; NEXT(() => B3.next(), 1.6); } },
    hint() { const t = J.tiles.find(q => q.rot !== 0); return t ? [t.m.position, 'SPIN'] : null; },
    card() { const left = J.tiles.filter(q => q.rot !== 0).length; return ['MOSAIC ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, txt('TURNED TILES \u00b7 ' + left) + gauge(1 - Math.max(0, J.t - J.t0) / 30), J.n + '_' + left]; },
    shot() { return [V(MO.x, 0.1, MO.z), 2.9, 2.9, 1.15, 2.4, 0, 5.2]; },
    end() {} };
  // ================= NIGHT WATCH (Sage, walk): catch the hooded thief =================
  const thief = kit.makeFox({ key: 'mrsThief', torso: ['#2a2a33', '#1a1a22', '#0a0a0e'], outfit: 'coat', mood: 'neutral', look: { fur: '#5a5a62', furDark: '#3a3a42' } }); thief.visible = false; G.add(thief);
  { const P0 = thief.userData && thief.userData.P; if (P0 && P0.head) { const hood = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), LM('#1a1a22')); hood.position.y = 0.08; P0.head.add(hood); } }
  const sack = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), LM('#8a6d4a')); sack.scale.set(1, 0.85, 1); sack.position.set(0.32, 0.3, -0.1); thief.add(sack);
  const SPOTS = [[-391.9, -51.5, Math.PI / 2], [-367.9, -50, -Math.PI / 2], [-367.9, -58, -Math.PI / 2], [-390.5, -65.0, 0], [-369.5, -65.0, 0], [-391.9, -55.2, Math.PI / 2], [-404, -53.0, 0], [-398.8, -66.9, 0]];
  const B4 = {
    begin() { Object.assign(J, { N: 4, n: 0, caught: 0, st: 'wait', w: 1.5, spot: -1 }); toast('NIGHT WATCH \u00b7 FIND THE THIEF, PRESS E', 3); },
    show() { let k; do { k = Math.random() * SPOTS.length | 0; } while (k === J.spot); J.spot = k; const [x, z, ry] = SPOTS[k]; thief.position.set(x, 0, z); thief.rotation.y = ry; thief.scale.setScalar(0.01); thief.visible = true; J.st = 'on'; J.on = 0; noise(0.25, 0.02, 3000); tone(220, 0.03, 0.4, 'triangle'); },
    tick(dt) { if (J.st === 'wait') { J.w -= dt; if (J.w <= 0) { if (J.n >= J.N) { thief.visible = false; finishGame(); return; } this.show(); } return; }
      if (J.st === 'on') { J.on += dt; thief.scale.setScalar(Math.min(1, J.on * 4)); kit.animFox(thief, dt, 0, false); thief.position.y = Math.abs(Math.sin(J.on * 8)) * 0.03;
        if (J.on > 8) { J.st = 'run'; J.r = 0; miss('HE GOT AWAY!', 1.6); } }
      if (J.st === 'run') { J.r += dt; const a = Math.atan2(-380 - thief.position.x, -45 - thief.position.z); thief.rotation.y = a; thief.position.x += Math.sin(a) * dt * 7; thief.position.z += Math.cos(a) * dt * 7; kit.animFox(thief, dt, 6, false); if (J.r > 1.2) { thief.visible = false; J.n++; J.st = 'wait'; J.w = 1.6; } }
      if (J.st === 'got') { J.r += dt; thief.scale.setScalar(Math.max(0.01, 1 - J.r * 2)); if (J.r > 0.5) { thief.visible = false; J.n++; J.st = 'wait'; J.w = 1.8; } } },
    near(P) { return J.st === 'on' && Math.hypot(P.x - thief.position.x, P.z - thief.position.z) < 2.0; },
    prompt(P) { return this.near(P) ? 'CATCH THE THIEF!' : null; },
    talk(P) { if (!this.near(P)) return false; J.st = 'got'; J.r = 0; J.caught++; addGold(5); chimes(); toast('CAUGHT! \u00b7 THE RELIC IS SAFE', 1.6); return true; },
    goal() { return J.st === 'on' && J.on > 2 ? [thief.position.x, thief.position.z, 0] : null; },
    card() { return ['THIEF ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, txt('CAUGHT \u00b7 ' + J.caught) + txt(J.st === 'on' ? 'HE IS IN! FIND HIM' : 'LISTEN\u2026') + (J.st === 'on' ? gauge(1 - J.on / 8) : ''), J.n + J.st + J.caught]; },
    end() { thief.visible = false; } };
  // ================= CATALOGUE (Sandy): tap the tag, then the crate with its code =================
  const FINDK = [g => { cyl(g, 0.05, 0.04, 0.1, CLAY, 0, 0.05, 0, 10); }, g => { cyl(g, 0.05, 0.05, 0.012, GOLD, 0, 0.008, 0, 14); }, g => { box(g, 0.12, 0.04, 0.05, '#8d8d8d', 0, 0.02, 0); }, g => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), LM('#a0703a')); r.rotation.x = Math.PI / 2; r.position.y = 0.015; g.add(r); }, g => { const b = new THREE.Mesh(new THREE.OctahedronGeometry(0.04), LM('#c4b5fd')); b.position.y = 0.04; g.add(b); }];
  const tagT = c => label(c, '#f3f2f2', INK, 128, 64, 40);
  const B5 = {
    begin() { Object.assign(J, { N: 6, n: 0, f: null, tag: null }); toast('TAP THE TAG, THEN THE CRATE WITH ITS CODE', 2.6); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } [J.f, J.tag].forEach(o => o && o.parent && o.parent.remove(o)); J.t0 = J.t; J.over = false; J.step = 'tag'; const c = CRATES[Math.random() * CRATES.length | 0]; J.code = c.code; J.crate = c;
      const g = own(new THREE.Group()); FINDK[Math.random() * FINDK.length | 0](g); g.scale.setScalar(2); g.position.set(CS.x - 0.08, CS.y, CS.z); J.f = g;
      const tg = own(new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.07), new THREE.MeshBasicMaterial({ map: tagT(c.code), side: THREE.DoubleSide }))); tg.position.set(CS.x + 0.15, CS.y + 0.02, CS.z + 0.05); tg.rotation.x = -1.1; J.tag = tg; },
    press() { if (J.over) return; if (J.step === 'tag') { if (dist(scrW(J.tag.position)) < TAPR() * 1.3 || dist(scrW(J.f.position)) < TAPR() * 1.3) { J.step = 'crate'; J.tag.position.set(J.f.position.x + 0.1, J.f.position.y + 0.08, J.f.position.z + 0.04); J.tag.rotation.x = -0.4; tone(990, 0.04, 0.15); } return; }
      const i = nearest(CRATES, c => c.p, TAPR() * 1.1); if (i < 0) return; const c = CRATES[i];
      if (c.code === J.code) { J.over = true; fly(J.f, c.p.clone().add(V(0, 0.05, 0.15)), 0.55, 0.3); fly(J.tag, c.p.clone().add(V(0.1, 0.12, 0.17)), 0.55, 0.3); clack(); addGold(2); toast('FILED \u00b7 ' + c.code, 1.0); J.n++; NEXT(() => B5.next(), 1.0); }
      else miss('THAT IS ' + c.code + ' \u00b7 FIND ' + J.code, 1.6); },
    tick(dt) { flyTick(dt); if (!J.over && J.t - J.t0 > 14) { J.over = true; miss('TOO SLOW \u00b7 SANDY FILES IT'); J.n++; NEXT(() => B5.next(), 1.2); } },
    hint() { return J.over ? null : J.step === 'tag' ? [J.tag.position, 'TAG'] : [J.crate.p, J.code]; },
    card() { return ['FIND ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:30px;font-weight:900;line-height:1.1">' + J.code + '</div>' + txt(J.step === 'tag' ? 'TAP THE TAG' : 'NOW THE CRATE ' + J.code) + gauge(1 - Math.max(0, J.t - J.t0) / 14), J.n + J.step]; },
    shot() { return [V(-398.8, 1.3, -68.9), 5.0, 2.4, 0.12, 2.4, 0, 4.6]; },
    end() { FLY.length = 0; } };
  // ================= DIG A SQUARE (Sandy): tap the square, trowel ×4, shake the sieve =================
  const SQ = (i, j) => V(PIT.x0 + i + 0.5, 0.31, PIT.z1 - j - 0.5);
  const trowel = new THREE.Group(); { const b = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 4), LM('#9aa3ab')); b.rotation.x = Math.PI; b.scale.z = 0.25; trowel.add(b); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8), LM(WOOD)); h.position.y = 0.15; trowel.add(h); } trowel.visible = false; G.add(trowel);
  const B6 = {
    begin() { Object.assign(J, { N: 3, n: 0 }); toast('DIG THE SQUARE ON THE CARD', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } J.t0 = J.t; J.over = false; J.step = 'find'; J.i = Math.random() * 8 | 0; J.j = Math.random() * 6 | 0; J.code = 'ABCDEFGH'[J.i] + (J.j + 1); J.dug = 0; J.sv = 0; trowel.visible = false;
      const p = own(new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96), new THREE.MeshLambertMaterial({ color: '#7a5a36', transparent: true, opacity: 0 }))); p.rotation.x = -Math.PI / 2; p.position.copy(SQ(J.i, J.j)); J.patch = p; },
    press() { if (J.over) return;
      if (J.step === 'find' || J.step === 'dig') { let bi = -1, bj = -1, bd = 1e9; for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { const d = dist(scrW(SQ(i, j))); if (d < bd) { bd = d; bi = i; bj = j; } } if (bd > TAPR() * 1.6) return;
        if (bi !== J.i || bj !== J.j) { miss('THAT IS ' + 'ABCDEFGH'[bi] + (bj + 1) + ' \u00b7 DIG ' + J.code, 1.6); return; }
        J.step = 'dig'; J.dug++; trowel.visible = true; trowel.position.copy(SQ(J.i, J.j)).add(V(rnd(-0.25, 0.25), 0.12, rnd(-0.25, 0.25))); trowel.rotation.set(0.5, rnd(0, 3), 0); J.tr = 0.25; noise(0.12, 0.03, 1800); puff(SQ(J.i, J.j).add(V(0, 0.05, 0)), '#c9b48a', 3, 0.12);
        J.patch.material.opacity = Math.min(0.85, J.dug * 0.21); addGold(1);
        if (J.dug >= 4) { J.step = 'sieve'; const g = own(new THREE.Group()); FINDK[Math.random() * FINDK.length | 0](g); g.scale.setScalar(2.2); g.position.copy(SQ(J.i, J.j)); J.find = g; fly(g, V(SV.x, SV.y + 0.06, SV.z), 0.8, 0.6); tone(660, 0.04, 0.3, 'triangle'); toast('SOMETHING! \u00b7 SHAKE THE SIEVE', 1.6); } return; }
      if (J.step === 'sieve') { if (dist(scrW(V(SV.x, SV.y, SV.z))) > TAPR() * 1.8) return; J.sv++; J.shake = 0.3; noise(0.2, 0.025, 2500); puff(V(SV.x, SV.y - 0.05, SV.z), '#cdb488', 3, 0.1); addGold(1);
        if (J.sv >= 3) { J.over = true; chimes(); addGold(J.t - J.t0 < 15 ? 4 : 3); toast(J.n + 1 < J.N ? 'A FIND IN ' + J.code + '!' : 'THREE SQUARES, THREE FINDS', 1.5); J.n++; NEXT(() => { [J.find, J.patch].forEach(o => o && o.parent && o.parent.remove(o)); B6.next(); }, 1.6); } } },
    tick(dt) { flyTick(dt); if (J.tr > 0) { J.tr -= dt; trowel.position.y -= dt * 0.3; } if (J.shake > 0) { J.shake -= dt; sieve.position.x = SV.x + Math.sin(J.t * 60) * 0.04; } else sieve.position.x = SV.x;
      if (!J.over && J.t - J.t0 > 30) { J.over = true; miss('TOO SLOW \u00b7 SANDY DIGS IT OUT'); J.n++; NEXT(() => { [J.find, J.patch].forEach(o => o && o.parent && o.parent.remove(o)); B6.next(); }, 1.4); } },
    hint() { return J.over ? null : J.step === 'sieve' ? [V(SV.x, SV.y, SV.z), 'SHAKE'] : [SQ(J.i, J.j), J.step === 'dig' ? 'DIG' : J.code]; },
    card() { return ['SQUARE ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<div style="font-size:30px;font-weight:900;line-height:1.1">' + J.code + '</div>' + txt(J.step === 'find' ? 'FIND IT ON THE GRID' : J.step === 'dig' ? 'TROWEL \u00b7 ' + J.dug + ' / 4' : 'SIEVE \u00b7 ' + J.sv + ' / 3') + gauge(1 - Math.max(0, J.t - J.t0) / 30), J.n + J.step + J.dug + J.sv]; },
    shot() { return [V(-406.3, 0.4, -63.4), 10.2, 6.2, 0.95, 4, 0, 9]; },
    end() { trowel.visible = false; sieve.position.x = SV.x; FLY.length = 0; } };
  // ================= THE RUBBING (Sandy): drag the crayon over the paper until the carving shows =================
  const CARV = [(g, W, H) => { g.strokeStyle = '#201e1d'; g.lineWidth = 9; g.beginPath(); g.arc(W / 2, H / 2, H * 0.34, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.fillStyle = '#201e1d'; g.beginPath(); g.arc(W / 2 + Math.cos(a) * H * 0.34, H / 2 + Math.sin(a) * H * 0.34, 11, 0, 7); g.fill(); } g.font = '900 30px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VIII', W / 2, H / 2); },
    (g, W, H) => { g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(W * 0.3, H * 0.2); g.lineTo(W * 0.42, H * 0.45); g.lineTo(W * 0.58, H * 0.45); g.lineTo(W * 0.7, H * 0.2); g.lineTo(W * 0.68, H * 0.62); g.lineTo(W / 2, H * 0.88); g.lineTo(W * 0.32, H * 0.62); g.closePath(); g.fill(); g.fillStyle = '#f3f2f2'; g.fillRect(W * 0.42, H * 0.52, 12, 8); g.fillRect(W * 0.55, H * 0.52, 12, 8); },
    (g, W, H) => { g.fillStyle = '#201e1d'; g.beginPath(); g.arc(W * 0.3, H / 2, H * 0.2, 0, 7); g.fill(); g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(W * 0.3, H / 2, H * 0.09, 0, 7); g.fill(); g.fillStyle = '#201e1d'; g.fillRect(W * 0.42, H * 0.46, W * 0.42, 14); g.fillRect(W * 0.7, H * 0.5, 12, 28); g.fillRect(W * 0.8, H * 0.5, 12, 20); g.font = '900 34px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('IX', W * 0.55, H * 0.2); }];
  const crayon = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8), LM('#2b2219')); crayon.rotation.x = Math.PI / 2; crayon.visible = false; G.add(crayon);
  const PW = 256, PH = 180, GX = 16, GY = 11;
  const B7 = {
    begin() { Object.assign(J, { N: 3, n: 0 }); toast('RUB THE CRAYON OVER THE PAPER', 2.4); this.next(); },
    next() { if (J.n >= J.N) { finishGame(); return; } if (J.paper) J.paper.parent && J.paper.parent.remove(J.paper); J.t0 = J.t; J.over = false;
      const des = document.createElement('canvas'); des.width = PW; des.height = PH; const dg = des.getContext('2d'); dg.fillStyle = '#9c9488'; dg.fillRect(0, 0, PW, PH); for (let i = 0; i < 500; i++) { dg.fillStyle = 'rgba(60,55,50,0.25)'; dg.fillRect(Math.random() * PW, Math.random() * PH, 2, 2); } CARV[J.n % 3](dg, PW, PH); J.des = des;
      J.tex = CT(PW, PH, g => { g.fillStyle = '#f3ecdc'; g.fillRect(0, 0, PW, PH); }); J.cells = new Uint8Array(GX * GY); J.cov = 0;
      const m = own(new THREE.Mesh(new THREE.PlaneGeometry(SL.w, SL.h), new THREE.MeshBasicMaterial({ map: J.tex }))); m.position.set(SL.x, SL.y, SL.z - 0.03); m.rotation.y = Math.PI; J.paper = m; },
    press() { crayon.visible = true; },
    drag() { if (!ptr.down || J.over) return; const p = hitZ(SL.z - 0.04); if (!p) return; crayon.position.set(p.x, p.y, p.z - 0.04); crayon.visible = true;
      const u = 0.5 - (p.x - SL.x) / SL.w, v = (p.y - SL.y) / SL.h + 0.5; if (u < 0 || u > 1 || v < 0 || v > 1) return; const px = u * PW, py = (1 - v) * PH, r = 18, g = J.tex.userData.c.getContext('2d');
      g.save(); g.beginPath(); g.arc(px, py, r, 0, 7); g.clip(); g.drawImage(J.des, 0, 0); g.restore(); J.tex.needsUpdate = true; if (Math.random() < 0.25) noise(0.05, 0.01, 4000);
      for (let cy = 0; cy < GY; cy++) for (let cx = 0; cx < GX; cx++) { const k = cy * GX + cx; if (J.cells[k]) continue; if (Math.hypot((cx + 0.5) / GX * PW - px, (cy + 0.5) / GY * PH - py) < r + 4) { J.cells[k] = 1; J.cov++; } }
      if (J.cov / (GX * GY) >= 0.8) { J.over = true; g.drawImage(J.des, 0, 0); J.tex.needsUpdate = true; chimes(); addGold(J.t - J.t0 < 12 ? 5 : 3); toast(J.n + 1 < J.N ? 'THE CARVING SHOWS!' : 'THREE RUBBINGS FOR THE ARCHIVE', 1.5); J.n++; crayon.visible = false; NEXT(() => B7.next(), 1.8); } },
    release() { crayon.visible = false; },
    tick() { if (!J.over && J.t - J.t0 > 25) { J.over = true; miss('TOO SLOW \u00b7 SANDY FINISHES IT'); J.n++; NEXT(() => B7.next(), 1.2); } },
    hint() { if (J.over) return null; for (let k = 0; k < GX * GY; k++) if (!J.cells[k]) { const cx = k % GX, cy = k / GX | 0, u = (cx + 0.5) / GX, v = 1 - (cy + 0.5) / GY; return [V(SL.x - (u - 0.5) * SL.w, SL.y + (v - 0.5) * SL.h, SL.z - 0.04), 'RUB']; } return null; },
    card() { const pc = Math.round(J.cov / (GX * GY) * 100); return ['RUBBING ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, txt('PAPER COVERED \u00b7 ' + pc + '% (80% DONE)') + gauge(1 - Math.max(0, J.t - J.t0) / 25), J.n + '_' + Math.floor(pc / 5)]; },
    shot() { return [V(SL.x, SL.y, SL.z), 1.4, 1.0, 0.08, 1.1, Math.PI, 2.2]; },
    end() { crayon.visible = false; } };
  const GD = { sort: B1, appraise: B2, mosaic: B3, watch: B4, catalogue: B5, dig: B6, rub: B7 };
  return { GD, tips: ['Stone first, glass last. The hill keeps its own calendar.', 'Count the dots on a coin. Eight, or it is a liar.', 'A crate code is a letter, then a number. Letter first.', 'Rub with the flat of the crayon, not the tip.'], thief };
}
