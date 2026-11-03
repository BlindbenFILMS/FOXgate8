// MERU 2 · SPEEDBOAT BAY COURSE always standing in the bay arm [meruSpeedboatBay] (s104). The props of minigames/meru/speedboat-bay.js
// read from ONE layout file (minigames/meru/speedboat-course.js), world = course + L.BAY.course.origin (yaw 0). The course's own beach, boathouse,
// jetty, sky and hills are skipped (Meru has its own). Plus the LEAD-IN LANE: lanterns + red/white buoy lines from the Meru boathouse slip, through
// the SPEEDBOAT BAY gate, east of Pearl Island and the ferry loop (gap where the ferry crosses) into the course lane.
// Free boat: block(x, z) = solid props (buoys, barrels, targets, posts, piles); rampAt(x, z) = { h, k } on a ramp's slope (the free boat jumps it).
// Phone budget: everything instanced (≈ 22 draws), the whole group sleeps unless you are on the lake side of town.
import { BAY_COURSE as BC } from '../minigames/meru/speedboat-course.js';
export function buildBayCourse({ THREE, scene, toon, glowTex, L, touch }) {
  const [OX, OZ] = L.BAY.course.origin, root = new THREE.Group(); root.name = 'bayCourse'; scene.add(root);
  const Wp = ([x, z]) => [x + OX, z + OZ], o3 = new THREE.Object3D(), col = new THREE.Color(), PI = Math.PI;
  const rnd = (() => { let s = 104; return (a, b) => a + ((s = (s * 16807) % 2147483647) / 2147483647) * (b - a); })();
  const white = toon('#ffffff');
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  // p = [x, y, z, sx, yaw, sy, sz]; colors = per-instance hex list (material must be white)
  const inst = (geo, mat, list, colors, par = root) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); list.forEach((p, i) => { o3.position.set(p[0], p[1], p[2]); o3.rotation.set(0, p[4] || 0, 0); const s = p[3] || 1; o3.scale.set(s, p[5] || s, p[6] || s); o3.updateMatrix(); m.setMatrixAt(i, o3.matrix); if (colors) m.setColorAt(i, col.set(colors[i])); }); m.count = list.length; m.frustumCulled = false; par.add(m); return m; };
  const glowP = [], blocks = [];
  const blk = (x, z, r) => blocks.push([x, z, r]);
  // ---------- lanes: lantern piles + red/white buoy lines ----------
  const FP = (L.LAKE.ferry && L.LAKE.ferry.path) || [];
  const segD = (x, z, p) => { let d = 1e9; for (let i = 0; i < p.length - 1; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); d = Math.min(d, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return d; };
  const ferryGap = (x, z) => FP.length > 1 && segD(x, z, FP) < 11;
  function along(path, step, fn) { for (let i = 0; i < path.length - 1; i++) { const [ax, az] = path[i], [bx, bz] = path[i + 1], len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, n = Math.max(1, Math.round(len / step)); for (let k = 0; k < n; k++) { const s = (k + 0.5) * len / n; fn(ax + ux * s, az + uz * s, ux, uz); } } }
  let lant = [], line = [];
  const lane = (path, lo, ls, bo, bs, gap) => {
    along(path, ls, (x, z, ux, uz) => { for (const sd of [-1, 1]) { const px = x + uz * sd * lo, pz = z - ux * sd * lo; if (gap && gap(px, pz)) continue; lant.push([px, pz]); } });
    along(path, bs, (x, z, ux, uz) => { for (const sd of [-1, 1]) { const px = x + uz * sd * bo, pz = z - ux * sd * bo; if (gap && gap(px, pz)) continue; line.push([px, pz]); } }); };
  lane(BC.PATH.map(Wp), BC.LANT, BC.LANT_STEP, BC.LINE, BC.LINE_STEP);
  // LEAD-IN from the Meru boathouse slip (jetty end z 268) → the SPEEDBOAT BAY gate (LAKE.gate, x 75 z 300) → east of Pearl Island → course start
  const g0 = L.LAKE.gate ? L.LAKE.gate.at : [75, 300], start = Wp(BC.PATH[0]);
  const LEAD = [[g0[0], 274], [g0[0], g0[1]], [g0[0] + 43, g0[1] + 30], [148, 372], [150, 425], start];
  // the lead-in lane lives in its own group: it stays up while the game runs in world (the game builds its own course lane)
  const LEADG = new THREE.Group(); LEADG.name = 'bayLead'; scene.add(LEADG); const leadGlow = [];
  const LB = new THREE.Group(); root.add(LB); const LB2 = new THREE.Group(); LEADG.add(LB2);
  const laneMesh = (par, lb, gl) => { inst(new THREE.CylinderGeometry(0.12, 0.16, 5.4, 6), toon('#201e1d'), lant.map(([x, z]) => [x, 2.0, z]), null, par);
    inst(new THREE.BoxGeometry(0.55, 0.6, 0.55), toon('#ec3013'), lant.map(([x, z]) => [x, 4.5, z]), null, par);
    lant.forEach(([x, z]) => { gl.push([x, 4.6, z]); blk(x, z, 0.5); });
    inst(new THREE.SphereGeometry(0.42, 10, 8), white, line.map(([x, z]) => [x, 0.1, z]), line.map((_, i) => i % 4 < 2 ? '#ec3013' : '#f3f2f2'), lb); };
  laneMesh(root, LB, glowP); const nCourse = [lant.length, line.length]; lant = []; line = [];
  lane(LEAD, 16, 20, 11, 8, ferryGap); laneMesh(LEADG, LB2, leadGlow); const nLead = [lant.length, line.length];
  // ---------- big buoys: 1 SLALOM (red) + 2 POWER-TURN RING (yellow) ----------
  const big = [...BC.SLALOM.map(p => [...Wp(p), 1.2, '#ec3013'])], R0 = BC.RING, RC = Wp([R0.x, R0.z]);
  for (let i = 0; i < 24; i++) { const a = i / 24 * PI * 2; if (Math.abs(Math.cos(a)) < 0.25) continue; big.push([RC[0] + Math.cos(a) * R0.r, RC[1] + Math.sin(a) * R0.r, 0.8, '#ffd23a']); }
  const BB = new THREE.Group(); root.add(BB);
  inst(new THREE.CylinderGeometry(0.7, 0.9, 1.3, 12), white, big.map(([x, z, s]) => [x, 0.3 * s, z, s]), big.map(b => b[3]), BB);
  inst(new THREE.CylinderGeometry(0.92, 0.92, 0.25, 12), toon('#f3f2f2'), big.map(([x, z, s]) => [x, 0.55 * s, z, s]), null, BB);
  inst(new THREE.ConeGeometry(0.5, 1.1, 10), white, big.map(([x, z, s]) => [x, 1.5 * s, z, s]), big.map(b => b[3]), BB);
  inst(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd23a }), big.map(([x, z, s]) => [x, 2.15 * s, z, s]), null, BB);
  big.forEach(([x, z, s]) => blk(x, z, 1.05 * s));
  // ---------- floating section signs (red square + white name) ----------
  const stripe = [], stripeC = [], bars = [];
  for (const [n, s, cx, cz, yaw = PI] of BC.SIGNS) { const [x, z] = Wp([cx, cz]), c = Math.cos(yaw), sn = Math.sin(yaw);
    for (const sx of [-12, 12]) { const px = x + c * sx, pz = z - sn * sx; for (let k = 0; k < 7; k++) { stripe.push([px, -0.4 + k * 1.1, pz]); stripeC.push(k % 2 ? '#f3f2f2' : '#ec3013'); } glowP.push([px, 7.6, pz]); blk(px, pz, 0.7); }
    bars.push([x, 7.0, z, 1, yaw]);
    const t = CT(1024, 256, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(16, 16, 224, 224); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 70, 136); g.font = '900 104px Archivo, sans-serif'; g.fillText(s, 272, 136); });
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); pm.position.set(x, 5.4, z); pm.rotation.y = yaw; root.add(pm); }
  inst(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 10), white, stripe, stripeC);
  inst(new THREE.BoxGeometry(25, 0.7, 0.7), toon('#201e1d'), bars);
  // ---------- 3 RAMP JUMPS: sandbars + floating ramps ----------
  const sand = toon('#e8d5a3'), reeds = [];
  for (const B of BC.BARS) { const [x, z] = Wp([B.x, B.z]), m = new THREE.Mesh(new THREE.SphereGeometry(1, touch ? 16 : 24, 8), sand); m.scale.set(B.a, 0.55, B.b); m.position.set(x, -0.2, z); root.add(m); for (let k = 0; k < 5; k++) reeds.push([x + rnd(-10, 10), 0.6, z + rnd(-2, 2)]); }
  const RAMPS = BC.RAMPS.map(r => { const [x, z] = Wp([r.x, r.z]); return { ...r, x, z }; }), rampM = toon('#c9a463'), lipM = toon('#ec3013');
  for (const r of RAMPS) { const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(r.l, r.h), new THREE.Vector2(r.l + r.top, r.h), new THREE.Vector2(r.l + r.top, 0)]), geo = new THREE.ExtrudeGeometry(shape, { depth: r.w, bevelEnabled: false }); geo.rotateY(-PI / 2); geo.translate(r.w / 2, 0, 0);
    const m = new THREE.Mesh(geo, rampM); m.position.set(r.x, 0, r.z); root.add(m); const lip = new THREE.Mesh(new THREE.BoxGeometry(r.w + 0.04, 0.05, 0.3), lipM); lip.position.set(r.x, r.h + 0.03, r.z + r.l + 0.15); root.add(lip); }
  // ---------- 5 BEACH SHALLOWS ----------
  { const S = BC.SH, [x0, z0] = Wp([S.x0, S.z0]), [x1, z1] = Wp([S.x1, S.z1]);
    const st = CT(256, 256, (g, w, h) => { g.fillStyle = '#e8d5a3'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,130,80,0.5)'; g.lineWidth = 4; for (let y = 8; y < h; y += 22) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.08 + y) * 4); g.stroke(); } }); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(5, 9);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: st, transparent: true, opacity: 0.5, depthWrite: false })); m.rotation.x = -PI / 2; m.position.set((x0 + x1) / 2, 0.12, (z0 + z1) / 2); m.renderOrder = 1; root.add(m);
    for (let k = 0; k < 14; k++) { const x = k % 2 ? x1 - rnd(0, 3) : x0 + rnd(0, 3), z = rnd(z0, z1); for (let j = 0; j < 4; j++) reeds.push([x + rnd(-0.6, 0.6), 0.5, z + rnd(-0.6, 0.6)]); } }
  inst(new THREE.CylinderGeometry(0.04, 0.05, 1.4, 4), toon('#6b8f3c'), reeds);
  // ---------- 4 TORPEDO TARGETS: barrels + target boards ----------
  const BAR = BC.BARRELS.map(Wp), TG = BC.TARGETS.map(Wp);
  inst(new THREE.CylinderGeometry(0.7, 0.7, 1.6, 14), toon('#ec3013'), BAR.map(([x, z]) => [x, 0.3, z]));
  inst(new THREE.CylinderGeometry(0.72, 0.72, 0.2, 14), toon('#ffd23a'), BAR.flatMap(([x, z]) => [[x, -0.1, z], [x, 0.7, z]]));
  const tgtT = CT(256, 320, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(128, 70, 52, 0, 7); g.fill(); g.fillRect(48, 130, 160, 170); g.lineWidth = 10; g.strokeStyle = '#f3f2f2'; for (const r of [120, 80, 40]) { g.beginPath(); g.arc(128, 215, r * 0.6, 0, 7); g.stroke(); } g.fillStyle = '#201e1d'; g.fillRect(96, 58, 22, 16); g.fillRect(138, 58, 22, 16); g.lineWidth = 8; g.strokeStyle = '#201e1d'; g.strokeRect(4, 4, w - 8, h - 8); });
  inst(new THREE.BoxGeometry(2.2, 0.4, 1.2), toon('#f3f2f2'), TG.map(([x, z]) => [x, 0.1, z, 1, PI]));
  inst(new THREE.PlaneGeometry(2.0, 2.5), new THREE.MeshBasicMaterial({ map: tgtT, side: THREE.DoubleSide }), TG.map(([x, z]) => [x, 1.55, z, 1, PI]));
  BAR.forEach(([x, z]) => blk(x, z, 1.1)); TG.forEach(([x, z]) => blk(x, z, 1.3));
  // ---------- 6 RIVAL RACE gates (posts stand all the time; the start gate has the chequered banner) ----------
  const G = BC.GATES, NG = G.length, posts = [], postC = [];
  G.forEach(([cx, cz], i) => { const [nx, nz] = G[(i + 1) % NG], [px, pz] = G[(i + NG - 1) % NG], dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, [x, z] = Wp([cx, cz]);
    for (const sd of [-1, 1]) { const x2 = x + uz * sd * 14, z2 = z - ux * sd * 14; for (let k = 0; k < 4; k++) { posts.push([x2, k * 1.1, z2]); postC.push(k % 2 ? '#f3f2f2' : '#ec3013'); } glowP.push([x2, 4.8, z2]); blk(x2, z2, 0.5); }
    if (i === 0) { const ct = CT(256, 64, g2 => { for (let a = 0; a < 16; a++) for (let b = 0; b < 4; b++) { g2.fillStyle = (a + b) % 2 ? '#201e1d' : '#f3f2f2'; g2.fillRect(a * 16, b * 16, 16, 16); } }); const fl = new THREE.Mesh(new THREE.PlaneGeometry(28, 1.2), new THREE.MeshBasicMaterial({ map: ct, side: THREE.DoubleSide })); fl.position.set(x, 4.4, z); fl.rotation.y = Math.atan2(ux, uz) + PI / 2; root.add(fl); } });
  inst(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 10), white, posts, postC);
  // ---------- all lamp glows: ONE points draw ----------
  const gm = new THREE.PointsMaterial({ map: glowTex, color: 0xffd98a, size: 2.4, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 });
  for (const [list, par] of [[glowP, root], [leadGlow, LEADG]]) { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(list.flat(), 3)); const glow = new THREE.Points(gg, gm); glow.frustumCulled = false; par.add(glow); }
  // ---------- collision grid for the free boat ----------
  const CS = 16, grid = new Map(), key = (i, j) => i * 4096 + j;
  for (const b of blocks) { const i0 = Math.floor((b[0] - b[2]) / CS), i1 = Math.floor((b[0] + b[2]) / CS), j0 = Math.floor((b[1] - b[2]) / CS), j1 = Math.floor((b[1] + b[2]) / CS); for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = key(i, j); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(b); } }
  let held = false;   // s104: hidden + not solid while the Speedboat Bay game runs in world (the game builds its own props)
  const block = (x, z) => { if (held || !root.visible) return false; const c = grid.get(key(Math.floor(x / CS), Math.floor(z / CS))); return !!c && c.some(b => Math.hypot(x - b[0], z - b[1]) < b[2]); };
  const rampAt = (x, z) => { if (held) return null; for (const r of RAMPS) { const lx = x - r.x, lz = z - r.z; if (Math.abs(lx) < r.w / 2 && lz >= 0 && lz <= r.l) return { h: r.h * lz / r.l, k: r.h / r.l, r }; } return null; };
  let night = null;
  function tick(dt, t, P, isNight) { const near = !P || P.z > 150, on = !held && near; root.visible = on; LEADG.visible = near || held; if (!on && !held) return;
    if (isNight !== night) { night = isNight; gm.opacity = isNight ? 0.95 : 0.55; gm.size = isNight ? 2.8 : 2.2; }
    LB.position.y = LB2.position.y = Math.sin(t * 1.6) * 0.1; BB.position.y = Math.sin(t * 1.3 + 1) * 0.12; }
  return { root, tick, block, rampAt, hold(v) { held = !!v; root.visible = !held; }, lead: LEAD, stats: { lanterns: nCourse[0] + nLead[0], buoys: nCourse[1] + nLead[1], big: big.length, blocks: blocks.length } };
}
