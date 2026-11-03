// MERU 2.0 — exterior polish round 2: MARKET PLAZA stalls + LANES COURT café tables (decoration only: no new NPCs or lines).
// Market: striped-awning stalls along both promenade edges, between the benches, goods in crates on the counters, a lantern each
// (lit at night). Lanes Court: bistro tables with two chairs and a striped parasol. Merged by material + instanced goods: ~9 draws.
// Every piece gets a collider (pushed into city.colliders before the grass bake, so no grass grows through them).
import { STALL_KINDS, STALL_KEY, STALL_SPOTS, STALL_DEFAULT } from './meru2-stallkinds.js';
export function buildMarket({ THREE, scene, L, city, toon, CT, touch }) {
  const root = new THREE.Group(); root.name = 'meru2Market'; scene.add(root);
  const blocked = (x, z, r) => (city.colliders || []).some(c => c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + r : c.f ? x > c.f[0] - r && x < c.f[1] + r && z > c.f[2] - r && z < c.f[3] + r : false);
  const nearSpk = (x, z, r) => L.SPEAKERS.some(s => Array.isArray(s.at) && Math.hypot(s.at[0] - x, s.at[1] - z) < r);
  const bins = {}, V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), Q = new THREE.Quaternion(), Y = V(0, 1, 0);
  let BIN = bins; const add = (k, g, x, y, z, ry = 0) => { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), Q.setFromAxisAngle(Y, ry), V(1, 1, 1))); (BIN[k] || (BIN[k] = [])).push(g); };
  // s175: a game that brings its own booth when played in world (Coconut Shy) gets its market stall in a separate group (own bins) so it can hide while you play
  const OWN_BOOTH = ['coconut'], hideSets = [];
  const Box = (a, b, c) => new THREE.BoxGeometry(a, b, c), Cyl = (a, b, h, n = 10) => new THREE.CylinderGeometry(a, b, h, n);
  const W = (x, z, ry, lx, lz) => [x + Math.cos(ry) * lx + Math.sin(ry) * lz, z - Math.sin(ry) * lx + Math.cos(ry) * lz];
  const stripe = (a, b) => { const t = CT(64, 16, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 8, 0, 8, h); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); return t; };
  const AWN = [['#ec3013', '#f3f2f2'], ['#2e4a6b', '#f3f2f2'], ['#e0a020', '#f3f2f2'], ['#3f7a52', '#f3f2f2']];
  const goods = [], lanterns = [], stalls = [], boards = [], caps = [], spotsOut = [], gameStalls = [];
  // s174 STALL PLAN (Market Stall Workshop.dc.html → localStorage meru2.stalls): stalls are found as before (index i stays stable), a stall marked
  // off is not built (no collider either), each kept stall shows its own goods + a name board on the awning. Default: all kept, kinds in turn.
  let PLAN = { off: [], sells: {} }; try { const p = JSON.parse(localStorage.getItem(STALL_KEY) || 'null'); if (p) PLAN = { off: p.off || [], sells: p.sells || {} }; } catch (e) {}
  const KI = k => Math.max(0, STALL_KINDS.findIndex(q => q.key === k)), spots = [];
  // ---------- MARKET STALLS ----------
  for (const sz of [-1, 1]) { let lastX = 1e9; for (let x = -58; x > -103; x -= 1) { const z = sz * 10.4, ry = sz < 0 ? 0 : Math.PI, [ccx, ccz] = W(x, z, ry, 0, 0.3);   // front faces the path (toward z 0); slide along until clear, 13 m apart
    if (Math.abs(x - lastX) < 13 || blocked(ccx, ccz, 1.75) || nearSpk(x, z, 3.2)) continue; lastX = x; const si = spots.length; spots.push([x, z, ry]); if (PLAN.off.includes(si)) continue;
    const ai = stalls.length % AWN.length, kind = PLAN.sells[si] != null ? KI(PLAN.sells[si]) : STALL_DEFAULT[si] ? KI(STALL_DEFAULT[si]) : si % STALL_KINDS.length; stalls.push([x, z, ry, ai, si, kind]);
    const own = STALL_KINDS[kind].game && OWN_BOOTH.includes(STALL_KINDS[kind].key), hs = own ? { bins: {}, board: null, g: null } : null; if (hs) { BIN = hs.bins; hideSets.push(hs); }
    const P = (k, g, lx, y, lz, r2 = 0) => { const [wx, wz] = W(x, z, ry, lx, lz); add(k, g, wx, y, wz, ry + r2); };
    P('wood', Box(3.0, 0.9, 1.1), 0, 0.45, 0.35); P('top', Box(3.1, 0.06, 1.2), 0, 0.93, 0.35); P('wood', Box(3.0, 0.12, 0.05), 0, 0.2, 0.92);
    for (const [lx, lz] of [[-1.5, -0.45], [1.5, -0.45], [-1.5, 1.05], [1.5, 1.05]]) P('post', Box(0.08, lz < 0 ? 2.6 : 2.25, 0.08), lx, lz < 0 ? 1.3 : 1.125, lz);
    P('awn' + ai, Box(3.3, 0.05, 1.9), 0, 2.45, 0.32, 0); { const k = 'awn' + ai, g = BIN[k][BIN[k].length - 1]; g.applyMatrix4(new THREE.Matrix4().makeTranslation(-W(x, z, ry, 0, 0.32)[0], -2.45, -W(x, z, ry, 0, 0.32)[1])); g.applyMatrix4(new THREE.Matrix4().makeRotationAxis(V(Math.cos(ry), 0, -Math.sin(ry)), 0.2)); g.applyMatrix4(new THREE.Matrix4().makeTranslation(W(x, z, ry, 0, 0.32)[0], 2.45, W(x, z, ry, 0, 0.32)[1])); }
    P('awn' + ai, Box(3.3, 0.28, 0.03), 0, 2.2, 1.27);
    BIN = bins; if (STALL_KINDS[kind].game) gameStalls.push({ x, z, ry, kind: STALL_KINDS[kind].key, game: STALL_KINDS[kind].game, label: STALL_KINDS[kind].sign, hide: hs ? (hs.g = new THREE.Group()) : null });   // s174d: props + keeper built by worlds/meru2-stallgames.js
    else if (STALL_KINDS[kind].capsule) caps.push([x, z, ry, kind]);   // s174: a CAPSULE CORNER stall: machines on the counter instead of crates (built below)
    else for (let c = 0; c < 3; c++) { const lx = -1 + c, [gx, gz] = W(x, z, ry, lx, 0.55); P('crate', Box(0.8, 0.22, 0.5), lx, 1.07, 0.55); goods.push([gx, gz, kind, c]); }
    { const [bx, bz] = W(x, z, ry, 0, 1.3); boards.push([bx, bz, ry, kind, hs]); }
    const [lx2, lz2] = W(x, z, ry, 1.35, 1.0); lanterns.push([lx2, 2.0, lz2]);
    city.colliders.push({ c: [ccx, ccz, 1.6] }); } }
  // ---------- LANES COURT bistro tables ----------
  // s173 (Ben: "too small next to the foxes"): FOX SCALE K = 1.35 (same as the fountain games' stone tables), seats exported for seated foxes.
  // Row pulled 0.5 m further off the path (z ±10.3) so the bigger parasols keep the walkway clear.
  const tables = [], seats = [], K = 1.35, add2 = (k, g, x, y, z, ry) => { g.scale(K, K, K); add(k, g, x, y * K, z, ry); };
  for (const sz of [-1, 1]) { let lastX = -1e9; for (let x = 56; x < 100; x += 1) { const z = sz * 10.3; if (x - lastX < 8.5 || Math.hypot(x - 105, z + 14) < 9 || blocked(x, z, 1.7) || nearSpk(x, z, 3.5)) continue; lastX = x; const ti = tables.length; tables.push([x, z]);
    add2('iron', Cyl(0.05, 0.05, 0.72, 8), x, 0.36, z); add2('iron', Cyl(0.3, 0.32, 0.04, 14), x, 0.02, z); add2('top', Cyl(0.42, 0.42, 0.04, 18), x, 0.74, z);
    for (const s of [-1, 1]) { const cx = x + s * 0.72 * K; seats.push({ x: cx, z, ry: s < 0 ? Math.PI / 2 : -Math.PI / 2, t: ti, y: 0.48 * K - 0.5 });
      add2('iron', Box(0.42, 0.04, 0.42), cx, 0.46, z); add2('iron', Box(0.04, 0.42, 0.42), cx + s * 0.2 * K, 0.68, z); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) add2('iron', Box(0.03, 0.46, 0.03), cx + a * K, 0.23, z + b * K); }
    add2('post', Cyl(0.025, 0.025, 2.4, 6), x, 1.2, z); add2('para' + ((x / 16 | 0) % AWN.length), new THREE.ConeGeometry(1.25, 0.5, 8, 1, true), x, 2.35, z);
    city.colliders.push({ c: [x, z, 1.55] }); } }
  if (typeof window !== 'undefined') window.__m2cafe = { tables, seats };
  // build
  const MAT = { wood: toon('#8a5a34'), top: toon('#c9b28a'), post: toon('#5c4430'), crate: toon('#b08b5e'), iron: toon('#2a2d33') };
  AWN.forEach(([a, b], i) => { MAT['awn' + i] = new THREE.MeshToonMaterial({ map: stripe(a, b), side: THREE.DoubleSide }); MAT['para' + i] = new THREE.MeshToonMaterial({ map: stripe(a, b), side: THREE.DoubleSide }); });
  const merge = list => { let n = 0; for (const g of list) n += g.attributes.position.count; const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let o = 0;
    for (const g of list) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; }
    const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return G; };
  for (const k in bins) { const m = new THREE.Mesh(merge(bins[k]), MAT[k]); m.castShadow = !touch && k !== 'post'; root.add(m); }
  for (const hs of hideSets) { hs.g.name = 'stallOwnBooth'; root.add(hs.g); for (const k in hs.bins) { const m = new THREE.Mesh(merge(hs.bins[k]), MAT[k]); m.castShadow = !touch && k !== 'post'; hs.g.add(m); } }
  // goods: a mound of produce in each crate (instanced, coloured per crate)
  // s174: goods by stall kind, one instanced mesh per shape (≤ 6 draws), a name board per stall (one canvas per kind used)
  const SH = { ico: [new THREE.IcosahedronGeometry(0.1, 0), 0.1], jar: [Cyl(0.07, 0.07, 0.14, 8), 0.07], box: [Box(0.16, 0.1, 0.11), 0.05], cone: [new THREE.ConeGeometry(0.09, 0.16, 7), 0.08], loaf: [Cyl(0.065, 0.065, 0.22, 8).rotateZ(Math.PI / 2), 0.065], flat: [Box(0.24, 0.035, 0.09), 0.02] };
  const per = touch ? 4 : 7, M4 = new THREE.Matrix4(), cc = new THREE.Color(), byS = {};
  for (const [x, z, kind, c] of goods) { const K = STALL_KINDS[kind], s = K.shape; (byS[s] || (byS[s] = [])).push([x, z, K, c]); }
  for (const s in byS) { const L1 = byS[s], im = new THREE.InstancedMesh(SH[s][0], new THREE.MeshLambertMaterial({ color: 0xffffff }), L1.length * per); let n = 0;
    for (const [x, z, K, c] of L1) for (let k = 0; k < per; k++) { const sc = (K.small ? 0.7 : K.squat ? 1.2 : 1) * (0.85 + Math.random() * 0.3), sy = K.tall ? 1.7 : K.squat ? 0.55 : K.upright ? 1.6 : 1, e = new THREE.Euler(K.flip ? Math.PI : 0, Math.random() * 6.28, K.upright ? 0 : 0);
      const lx = (Math.random() - 0.5) * 0.55, lz = (Math.random() - 0.5) * 0.3; M4.compose(V(x + lx, 1.18 + SH[s][1] * sy * sc + (K.flip ? 0.02 : 0), z + lz), Q.setFromEuler(e), V(sc, sc * sy, sc)); im.setMatrixAt(n, M4); im.setColorAt(n++, cc.set(K.cols[(c * 3 + k) % K.cols.length]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.08)); }
    im.count = n; root.add(im); }
  const boardMat = {}, boardAt = {}; for (const [x, z, ry, kind, hs] of boards) { const K = STALL_KINDS[kind]; const m = boardMat[kind] || (boardMat[kind] = new THREE.MeshBasicMaterial({ map: CT(512, 80, (g, w, h) => { g.fillStyle = K.capsule ? K.capsule.col : K.game ? K.col : '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f2f2'; g.font = '900 ' + (K.sign ? 38 : 46) + 'px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(K.sign || K.label, 20, h / 2 + 2); }), side: THREE.DoubleSide }));
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.4), m); p.position.set(x, 2.2, z); p.rotation.y = ry; (hs ? hs.g : root).add(p); boardAt[x.toFixed(2) + ',' + z.toFixed(2)] = p; }
  // s174 CAPSULE CORNER stalls (Ben): two bubble machines on the counter (red base, glass globe of coloured capsules, chrome crank, tray),
  // a standing A-board out front (CAPSULE CORNER · series · 1 FREE A DAY), E · PLAY opens Capsule Corner.dc.html?pack=… in the panel.
  if (caps.length) { const gl = new THREE.MeshPhongMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.32, shininess: 120, depthWrite: false }), chrome = toon('#d6dade'), ink = toon('#201e1d'), Qy = new THREE.Quaternion();
    let PAR = root; const put = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = !touch && mat !== gl; PAR.add(m); return m; };
    for (const [x, z, ry, kind] of caps) { const C = STALL_KINDS[kind].capsule, red = toon(C.col), dk = toon(C.dark);
      const capDeco = new THREE.Group(); capDeco.name = 'capDeco:' + C.pack; root.add(capDeco); PAR = capDeco;   // s178: the two counter machines hide while the real one plays in world
      for (const lx of [-0.75, 0.75]) { const [mx, mz] = W(x, z, ry, lx, 0.5);
        put(Box(0.62, 0.62, 0.55), red, mx, 0.96 + 0.31, mz, ry); put(Box(0.66, 0.06, 0.59), dk, mx, 0.96 + 0.64, mz, ry);
        { const [fx, fz] = W(x, z, ry, lx, 0.5 + 0.28); put(Cyl(0.08, 0.08, 0.05, 12), chrome, fx, 1.36, fz, ry).rotation.x = Math.PI / 2; put(Box(0.2, 0.03, 0.03), ink, fx, 1.36, fz + 0, ry); put(Box(0.22, 0.12, 0.04), ink, fx, 1.1, fz, ry); }
        const gy = 0.96 + 0.67 + 0.3; put(new THREE.SphereGeometry(0.3, 18, 14), gl, mx, gy, mz).renderOrder = 3;
        for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 0.17 + (i % 3) * 0.04; put(new THREE.SphereGeometry(0.07, 8, 6), toon(C.balls[i % C.balls.length]), mx + Math.cos(a) * r * 0.8, gy - 0.16 + Math.floor(i / 3) * 0.1, mz + Math.sin(a) * r * 0.6); }
        put(Cyl(0.11, 0.11, 0.06, 12), dk, mx, gy + 0.31, mz); }
      PAR = root;
      // A-board out front, facing the path
      const sign = new THREE.MeshBasicMaterial({ map: CT(256, 320, (g, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.fillStyle = C.col; g.fillRect(0, 0, w, 86); g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('CAPSULE', 16, 28); g.fillText('CORNER', 16, 62);
        g.fillStyle = '#201e1d'; g.font = '900 34px Archivo, Arial'; const [a, b] = C.name.split(' '); g.fillText(a, 16, 128); g.fillText(b || '', 16, 166); g.fillStyle = '#201e1d'; g.fillRect(16, 196, w - 32, 4);
        g.font = '800 22px Archivo, Arial'; g.fillText('COLLECT ALL 8', 16, 226); g.fillText('1 FREE A DAY', 16, 258); g.fillText('THEN 10 GOLD', 16, 290); }) });
      const [sx, sz] = W(x, z, ry, 1.95, 1.9); const fr = put(Box(0.9, 1.15, 0.06), ink, sx, 0.62, sz, ry); fr.rotation.x = -0.12;
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), sign); face.position.set(0, 0, 0.035); fr.add(face);
      city.colliders.push({ c: [sx, sz, 0.45] });
      const [px, pz] = W(x, z, ry, 0, 2.3); const fg = new THREE.Group(); fg.name = 'capWorld:' + C.pack; { const [gx, gz] = W(x, z, ry, 0, 0.5); fg.position.set(gx, 0.96, gz); fg.rotation.y = ry; root.add(fg); }
      spotsOut.push({ key: 'stall:capsule:' + C.pack, x: px, z: pz, r: 1.7, prompt: 'PLAY \u00b7 CAPSULE CORNER \u00b7 ' + C.name, play: { label: 'CAPSULE CORNER \u00b7 ' + C.name, url: 'Capsule%20Corner.dc.html?embed=1&pack=' + C.pack },
        fest: { game: 'capsule_' + C.pack, group: fg, x: fg.position.x, z: fg.position.z, deco: [capDeco, boardAt[W(x, z, ry, 0, 1.3).map(v => v.toFixed(2)).join(',')]].filter(Boolean), hideR: 0.9 }   /* s179: the awning name board hides too (it hung across the shot) */ }); } }   // s178: plays in world (walk FEST_MOD.capsule_<pack>)
  try { localStorage.setItem(STALL_SPOTS, JSON.stringify(spots.map(([x, z, ry]) => [Math.round(x * 10) / 10, Math.round(z * 10) / 10, Math.round(ry * 100) / 100]))); } catch (e) {}
  if (typeof window !== 'undefined') window.__m2stalls = { spots, built: stalls.map(s => ({ i: s[4], kind: STALL_KINDS[s[5]].key })) };
  const lanM = new THREE.MeshBasicMaterial({ color: 0x8a7a5a }), lI = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6), lanM, Math.max(1, lanterns.length)); lanterns.forEach(([x, y, z], i) => { M4.makeTranslation(x, y, z); lI.setMatrixAt(i, M4); }); lI.count = lanterns.length; root.add(lI);
  const glowT = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,214,140,1)'); r.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const glow = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(lanterns.flat(), 3)), new THREE.PointsMaterial({ map: glowT, size: 2.2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); glow.visible = false; root.add(glow);
  let far = false;
  return { setNight(on) { lanM.color.set(on ? 0xffd68c : 0x8a7a5a); glow.visible = on; }, tick(cam) { const f = Math.hypot(cam.x + 30, cam.z) > (touch ? 160 : 260); if (f !== far) { far = f; root.visible = !f; } }, stats: { stalls: stalls.length, tables: tables.length }, tables, seats, spots: spotsOut, gameStalls };
}
