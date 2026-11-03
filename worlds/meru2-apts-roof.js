// MERU 2.0 — s86 APARTMENTS PART C2: the ROOF. One call per building from worlds/meru2-apts-jobs.js (same old-frame u/v as meru2-apts.js).
// The lift now has a ROOF stop (meru2-apts.js elev spot + groundAt; the city shell's random roof units + crown box are off for crest / lake: STY roofG).
// HEAD-HOUSE in the middle of the roof = the LAUNDRY ROOM: the lift door on the back wall, 4 washers (drums spin, a load goes round),
// 3 dryers, a folding table, baskets; glass front with an open doorway to the ROOFTOP GARDEN: a deck path to the front parapet, raised veg + flower beds,
// a pergola with string lights (lit at night), benches facing the view, potted trees, herb strips along the sides; a water butt + compost out the back.
// Life: a gardener (7-11, 16-19) and a laundry neighbour (9-12, 18-21), only drawn while you are up here. E at a washer = WASH A LOAD (spins fast, ding).
export const ROOF_Y = { crest: 34.4, lake: 46.4 };   // city STY h + the 0.4 roof slab
export function aptRoof(X) {
  const { THREE, G, key, W, UV, YAW, RY0, hu, hv, mk, CT, fitTxt, LM, kit, cols, hour, toast, ding, tone, noise, touch } = X;
  const R = ROOF_Y[key], lake = key === 'lake', INK = '#201e1d', WHITE = '#f3f2f2', YEL = '#ffd23a';
  const HU = Math.round(hu * 0.42 * 10) / 10, HV = Math.round(hv * 0.42 * 10) / 10, WH = 4;
  const RG = new THREE.Group(); RG.name = 'aptRoof:' + key; RG.visible = false; G.add(RG);
  const S = mk(), GL = mk();
  const col = (u0, u1, v0, v1) => { const a = W(u0, v0), c = W(u1, v1); cols.push({ f: [Math.min(a[0], c[0]), Math.max(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[1], c[1])], y0: R - 0.5, y1: R + 3.5 }); };
  const colB = (u, v, du, dv) => col(u - du / 2, u + du / 2, v - dv / 2, v + dv / 2);
  const WOOD = lake ? '#c9a77c' : '#8a5a3a', WOOD2 = lake ? '#a8865e' : '#6b4a32', SOIL = '#4a3424', LEAF = '#4f8a3c', LEAF2 = '#3d6b2a', METAL = lake ? '#c0c4cc' : '#b08d3c';
  const frame = (u, y, v, ry) => { const g = new THREE.Group(); const [x, z] = W(u, v); g.position.set(x, y, z); g.rotation.y = ry; RG.add(g); return g; };
  // ---------- roof deck tiles (one slab a hair over the city roof) ----------
  S.bx(2 * hu - 0.8, 0.04, 2 * hv - 0.8, lake ? '#b9bcc0' : '#a8a196', 0, R + 0.02, 0);
  // ================= HEAD-HOUSE = LAUNDRY ROOM =================
  const wallM = new THREE.MeshLambertMaterial({ color: lake ? '#eef1f3' : '#e9dcc4' }), glassM = new THREE.MeshLambertMaterial({ color: '#cfe9ff', transparent: true, opacity: 0.35, depthWrite: false });
  const slab = (du, h, dv, m, u, y, v) => { const me = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m); const [x, z] = W(u, v); me.position.set(x, y, z); me.rotation.y = RY0; me.scale.set(dv, h, du); RG.add(me); return me; };
  const WALLS = [
    { n: [-1, 0], ms: [slab(0.25, WH, 2 * HV, wallM, -HU, R + WH / 2, 0)] },
    { n: [0, -1], ms: [slab(2 * HU, WH, 0.25, wallM, 0, R + WH / 2, -HV)] },
    { n: [0, 1], ms: [slab(2 * HU, WH, 0.25, wallM, 0, R + WH / 2, HV)] },
    { n: [1, 0], ms: [slab(0.12, WH - 0.4, HV - 1.1, glassM, HU, R + (WH - 0.4) / 2, -(HV + 1.1) / 2), slab(0.12, WH - 0.4, HV - 1.1, glassM, HU, R + (WH - 0.4) / 2, (HV + 1.1) / 2), slab(0.3, 0.4, 2 * HV, wallM, HU, R + WH - 0.2, 0)] }];
  const roofS = slab(2 * HU + 0.4, 0.25, 2 * HV + 0.4, new THREE.MeshLambertMaterial({ color: '#8b9096' }), 0, R + WH + 0.12, 0);
  for (const s of [-1, 1]) S.bx(0.16, WH - 0.4, 0.16, METAL, HU, R + (WH - 0.4) / 2, s * 1.1);
  for (const s of [-1, 1]) { for (let v = 1.1 + 1.5; v < HV - 0.4; v += 1.5) S.bx(0.1, WH - 0.4, 0.08, METAL, HU, R + (WH - 0.4) / 2, s * v); S.bx(0.2, 0.3, HV - 1.1, METAL, HU, R + 0.15, s * (HV + 1.1) / 2); S.bx(0.14, 0.08, HV - 1.1, METAL, HU, R + 1.05, s * (HV + 1.1) / 2); }   // mullions, sill, rail: the glass reads as a wall
  col(-HU - 0.15, -HU + 0.15, -HV, HV); col(-HU, HU, -HV - 0.15, -HV + 0.15); col(-HU, HU, HV - 0.15, HV + 0.15); col(HU - 0.1, HU + 0.1, -HV, -1.1); col(HU - 0.1, HU + 0.1, 1.1, HV);
  col(-hu, -hu + 0.35, -hv, hv); col(hu - 0.35, hu, -hv, hv); col(-hu, hu, -hv, -hv + 0.35); col(-hu, hu, hv - 0.35, hv);   // the parapet
  S.bx(2 * HU - 0.3, 0.02, 2 * HV - 0.3, lake ? '#d9d6d0' : '#ece6d8', 0, R + 0.05, 0);
  for (let i = -1; i <= 1; i++) GL.bx(1.6, 0.04, 0.5, '#fff6d8', i * HU * 0.55, R + WH - 0.04, 0);
  // the lift on the back wall: two steel leaves, frame, an R display, a call button
  S.bx(0.12, 2.9, 2.4, METAL, -HU + 0.14, R + 1.45, 0); S.bx(0.06, 2.6, 0.98, '#aab2ba', -HU + 0.2, R + 1.3, -0.5); S.bx(0.06, 2.6, 0.98, '#aab2ba', -HU + 0.2, R + 1.3, 0.5); S.bx(0.07, 2.6, 0.02, INK, -HU + 0.22, R + 1.3, 0);
  S.bx(0.06, 0.34, 0.7, INK, -HU + 0.18, R + 3.25, 0); GL.bx(0.02, 0.2, 0.16, '#ffb347', -HU + 0.22, R + 3.25, 0); S.bx(0.05, 0.3, 0.14, METAL, -HU + 0.18, R + 1.15, 1.45); GL.sp(0.045, '#7cff9b', -HU + 0.22, R + 1.2, 1.45);
  // washers (south wall, facing +v) + dryers (north wall, facing -v)
  const WASH = [], DRUMS = []; const drumM = (c) => { const t = CT(64, 64, (g, w) => { g.fillStyle = '#9fc6dc'; g.fillRect(0, 0, w, w); g.fillStyle = c; g.beginPath(); g.moveTo(32, 32); g.arc(32, 32, 30, 0, 2.2); g.fill(); g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(32, 32); g.arc(32, 32, 30, 3.1, 4.6); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(14, 12, 10, 4); }); return new THREE.MeshBasicMaterial({ map: t }); };
  const n = 4; for (let i = 0; i < n; i++) { const u = -HU + 1.6 + i * Math.min(1.05, (2 * HU - 3.2) / (n - 1)), v = -HV + 0.55;
    S.bx(0.8, 0.95, 0.75, WHITE, u, R + 0.475, v); S.bx(0.8, 0.12, 0.05, '#9aa0a6', u, R + 0.86, v + 0.38); GL.bx(0.12, 0.05, 0.02, i % 2 ? '#7cff9b' : '#ffb347', u + 0.25, R + 0.86, v + 0.405);
    const g = frame(u, R + 0.46, v + 0.38, YAW(0, 1)); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 6, 20), LM('#9aa0a6')); ring.position.z = 0.01; g.add(ring);
    const dr = new THREE.Mesh(new THREE.CircleGeometry(0.23, 20), drumM(['#ec3013', '#2f6fd6', '#ffd23a', '#2f7a4a'][i])); dr.position.z = 0.012; g.add(dr); DRUMS.push(dr);
    WASH.push({ u, v, fast: 0, sp: 1.2 + Math.random() * 1.5, on: i % 2 === 0 }); colB(u, v, 0.85, 0.8); }
  for (let i = 0; i < 3; i++) { const u = -HU + 1.6 + i * 1.05, v = HV - 0.55; S.bx(0.8, 0.3, 0.75, '#9aa0a6', u, R + 0.15, v); S.bx(0.8, 0.9, 0.75, WHITE, u, R + 0.75, v);
    const g = frame(u, R + 0.78, v - 0.38, YAW(0, -1)); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 6, 20), LM('#9aa0a6')); g.add(ring);
    const dr = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), drumM(['#f472b6', '#f3f2f2', '#5fb0d6'][i])); dr.position.z = 0.012; g.add(dr); DRUMS.push(dr); WASH.push({ u, v, dry: true, fast: 0, sp: 2.4, on: i !== 1 }); colB(u, v, 0.85, 0.8); }
  // folding table + baskets + a shelf of detergent, a sign
  { const tu = HU - 2.4, tv = 2.6; S.bx(2.2, 0.06, 0.9, lake ? '#f3f2f2' : WOOD, tu, R + 0.9, tv); for (const a of [-1, 1]) for (const c of [-1, 1]) S.bx(0.06, 0.88, 0.06, INK, tu + a * 1.0, R + 0.44, tv + c * 0.38);
    for (const [du, c] of [[-0.6, '#ec3013'], [0.0, '#2f6fd6'], [0.55, '#f3f2f2']]) { S.bx(0.4, 0.06, 0.32, c, tu + du, R + 0.96, tv - 0.1); S.bx(0.4, 0.05, 0.32, c, tu + du, R + 1.02, tv - 0.1); }
    colB(tu, tv, 2.3, 1.0); for (const [du, dv] of [[-1.6, 0.3], [-1.6, -1.6]]) { S.cy(0.28, 0.24, 0.42, '#c9a77c', tu + du, R + 0.21, tv + dv, 12); S.sp(0.2, '#f3f2f2', tu + du, R + 0.42, tv + dv, 0.5); } }
  S.bx(1.6, 0.05, 0.32, WOOD2, -HU + 2.0, R + 1.8, HV - 0.2); for (let i = 0; i < 5; i++) S.bx(0.18, 0.3, 0.16, ['#2f6fd6', '#ffd23a', '#2f7a4a', '#ec3013', '#f472b6'][i], -HU + 1.4 + i * 0.3, R + 1.98, HV - 0.2);
  const sign = (txt, w, h, u, y, v, ry, bg = INK, fg = WHITE) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: CT(512, Math.round(512 * h / w), (g, W2, H) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 20, H / 2 + 2, W2 - 40, Math.round(H * 0.6)); }) })); const [x, z] = W(u, v); m.position.set(x, y, z); m.rotation.y = ry; RG.add(m); return m; };
  sign('LAUNDRY \u00b7 7 AM - 10 PM', 2.0, 0.34, 0, R + 3.2, -HV + 0.14, YAW(0, 1));
  sign('ROOF GARDEN', 1.8, 0.36, HU + 0.08, R + WH - 0.2, -2.2, YAW(1, 0), '#2f7a4a');
  // ================= ROOFTOP GARDEN (front) =================
  const U0 = HU + 0.3, U1 = hu - 0.7;
  S.bx(U1 - U0, 0.06, 2.0, WOOD, (U0 + U1) / 2, R + 0.07, 0); for (let u = U0 + 0.3; u < U1; u += 0.3) S.bx(0.02, 0.065, 2.0, WOOD2, u, R + 0.075, 0);
  const VEG = ['#ec3013', '#ffb347', '#f3f2f2', '#ffd23a', '#f472b6', '#7a2a3a'];
  const bed = (u, v, du, dv, k) => { S.bx(du, 0.5, dv, WOOD2, u, R + 0.25, v); S.bx(du - 0.12, 0.04, dv - 0.12, SOIL, u, R + 0.5, v); colB(u, v, du, dv);
    const nu = Math.max(2, Math.round(du / 0.45)), nv = Math.max(1, Math.round(dv / 0.45)); for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const pu = u - du / 2 + (i + 0.5) * du / nu, pv = v - dv / 2 + (j + 0.5) * dv / nv;
      S.sp(0.15, (i + j) % 2 ? LEAF : LEAF2, pu, R + 0.62, pv, 0.75); if ((i + j + k) % 2 === 0) S.sp(0.055, VEG[(i + k) % VEG.length], pu + 0.05, R + 0.74, pv + 0.04); } };
  const BU = [U0 + 2.2, U0 + 5.6].filter(u => u < U1 - 3), BV = Math.min(3.2, hv - 3.4);
  for (const u of BU) for (const s of [-1, 1]) bed(u, s * BV, 2.4, 1.2, u | 0);
  // pergola over the path + string lights
  const PG0 = U0 + 3.0, PG1 = Math.min(U1 - 2.4, U0 + 6.6);
  for (const u of [PG0, PG1]) for (const s of [-1, 1]) { S.bx(0.16, 2.7, 0.16, WOOD2, u, R + 1.35, s * 1.3); colB(u, s * 1.3, 0.2, 0.2); }
  for (const s of [-1, 1]) S.bx(PG1 - PG0 + 0.5, 0.16, 0.14, WOOD2, (PG0 + PG1) / 2, R + 2.75, s * 1.3);
  for (let u = PG0; u <= PG1 + 0.01; u += 0.5) S.bx(0.08, 0.1, 3.0, WOOD, u, R + 2.88, 0);
  const BULB = []; for (let k = 0; k < 2; k++) for (let i = 0; i <= 12; i++) { const t = i / 12, u = PG0 + (PG1 - PG0) * t, v = (k ? 1 : -1) * 1.3 * Math.cos(t * Math.PI * 2) * 0.0 + (k ? 0.5 : -0.5), y = R + 2.6 - Math.sin(t * Math.PI) * 0.35; BULB.push([u, y, v]); }
  const bulbM = new THREE.MeshBasicMaterial({ color: '#c9b98a' }), bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 4), bulbM, BULB.length); { const M4 = new THREE.Matrix4(); BULB.forEach(([u, y, v], i) => { const [x, z] = W(u, v); M4.makeTranslation(x, y, z); bulbs.setMatrixAt(i, M4); }); RG.add(bulbs); }
  // benches facing the view + potted trees + herb strips along the sides
  for (const s of [-1, 1]) { const bu = U1 - 0.9, bv = s * 2.6; S.bx(0.5, 0.08, 1.8, WOOD, bu, R + 0.46, bv); S.bx(0.08, 0.45, 1.8, WOOD, bu - 0.25, R + 0.74, bv); for (const e of [-0.75, 0.75]) S.bx(0.45, 0.42, 0.08, INK, bu, R + 0.21, bv + e); colB(bu, bv, 0.6, 1.9); }
  const tree = (u, v) => { S.cy(0.4, 0.32, 0.6, lake ? '#5c6670' : '#8a5a46', u, R + 0.3, v, 12); S.cy(0.06, 0.07, 1.2, '#5a3d26', u, R + 1.2, v, 6); S.sp(0.6, LEAF, u, R + 2.0, v, 0.9); S.sp(0.4, LEAF2, u + 0.25, R + 1.75, v - 0.15, 0.9); colB(u, v, 0.8, 0.8); };
  for (const s of [-1, 1]) { tree(U1 - 0.3, s * (hv - 1.4)); tree(U0 + 0.8, s * (hv - 1.4)); }
  for (const s of [-1, 1]) { const v = s * (hv - 0.55), a = U0 + 1.8, b2 = U1 - 1.4; if (b2 > a) { S.bx(b2 - a, 0.42, 0.5, WOOD2, (a + b2) / 2, R + 0.21, v); col(a, b2, v - 0.25, v + 0.25); for (let u = a + 0.2; u < b2; u += 0.32) S.sp(0.12, (Math.round(u * 3) % 2) ? LEAF : '#6aa84f', u, R + 0.5, v, 0.8); } }
  // behind the head-house: water butt, compost bins, a tool rack
  { const u = -HU - 1.4; if (u > -hu + 1) { S.cy(0.45, 0.45, 1.1, '#2f7a4a', u, R + 0.55, -2.4, 14); S.cy(0.47, 0.47, 0.05, INK, u, R + 1.12, -2.4, 14); colB(u, -2.4, 1, 1); for (const v of [1.4, 2.6]) { S.bx(1.0, 0.9, 1.0, '#3d3b3a', u, R + 0.45, v); S.bx(1.04, 0.06, 1.04, '#2f7a4a', u, R + 0.92, v); colB(u, v, 1.05, 1.05); } } }
  RG.add(new THREE.Mesh(S.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }))); RG.add(new THREE.Mesh(GL.geo(), new THREE.MeshBasicMaterial({ vertexColors: true })));
  // ================= neighbours =================
  const GF = kit.makeFox({ key: 'apRoofG' + key, torso: ['#6aa84f', '#3d6b2a', '#22382a'], outfit: 'vest', mood: 'happy' }), LF = kit.makeFox({ key: 'apRoofL' + key, torso: lake ? ['#f472b6', '#5c6670', INK] : ['#5fb0d6', '#2e4a6b', INK], outfit: 'coat', mood: 'happy' });
  const CAN = new THREE.Group(); { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.24, 12), LM('#2f7a4a')); CAN.add(c); const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.34, 6), LM('#2f7a4a')); sp.position.set(0, 0.06, 0.2); sp.rotation.x = 1.0; CAN.add(sp); }
  { const [x, z] = W(BU[0] || U0 + 2, -BV + 1.0); GF.position.set(x, R + 0.05, z); GF.rotation.y = YAW(0, -1); RG.add(GF); const P0 = GF.userData && GF.userData.P; if (P0 && P0.arms) { P0.arms[1].add(CAN); CAN.position.set(0, -0.45, 0.12); } }
  { const [x, z] = W(HU - 2.4, 1.75), [tx, tz] = W(HU - 2.4, 2.6); LF.position.set(x, R + 0.05, z); LF.rotation.y = Math.atan2(tx - x, tz - z); RG.add(LF); }
  // ================= per frame =================
  const onRoof = P => { const [u, v] = UV(P.x, P.z); return Math.abs(u) < hu + 0.5 && Math.abs(v) < hv + 0.5 && (P.y || 0) > R - 2.5 && (P.y || 0) < R + 6; };
  const inHH = P => { const [u, v] = UV(P.x, P.z); return Math.abs(u) < HU && Math.abs(v) < HV && (P.y || 0) > R - 1; };
  const camL = new THREE.Vector3();
  let wasOn = false, night = null;
  function tick(dt, P, camera) { const on = onRoof(P); RG.visible = on; if (on && !wasOn) toast(lake ? 'LAKESIDE ROOF \u00b7 GARDEN + LAUNDRY' : 'CRESTVIEW ROOF \u00b7 GARDEN + LAUNDRY', 2.2); wasOn = on; if (!on) return;
    const h = hour ? hour() : 12, nt = h < 7 || h >= 19; if (nt !== night) { night = nt; bulbM.color.set(nt ? '#ffe39a' : '#c9b98a'); }
    GF.visible = (h >= 7 && h < 11) || (h >= 16 && h < 19); LF.visible = (h >= 9 && h < 12) || (h >= 18 && h < 21);
    if (GF.visible) { kit.animFox(GF, dt, 0, false); CAN.rotation.x = 0.4 + Math.sin(performance.now() / 600) * 0.3; } if (LF.visible) kit.animFox(LF, dt, 0, false);
    WASH.forEach((w, i) => { const on2 = w.fast > 0 || (w.on && h >= 7 && h < 22); if (w.fast > 0) { w.fast -= dt; if (w.fast <= 0) { ding(); toast('FRESH LAUNDRY \u00b7 SMELLS LIKE ' + (lake ? 'LAKE AIR' : 'LAVENDER'), 2.2); } }
      if (on2) DRUMS[i].rotation.z -= dt * (w.fast > 0 ? 14 : w.sp); });
    // head-house: hide the walls between you and the camera, and the roof, while you are inside
    const ins = inHH(P); roofS.visible = !ins; if (camera) { G.updateWorldMatrix(true, false); camL.copy(camera.position); G.worldToLocal(camL); }
    const [cu, cv] = UV(camL.x, camL.z);
    for (const Wl of WALLS) { let vis = true; if (ins && camera) { const d = Wl.n[0] ? cu * Wl.n[0] - HU : cv * Wl.n[1] - HV; vis = d < 0; } Wl.ms.forEach(m => { m.visible = vis; }); } }
  const nearWasher = P => { if (!inHH(P)) return null; const [u, v] = UV(P.x, P.z); let best = null, bd = 1.25; WASH.forEach((w, i) => { if (w.dry) return; const d = Math.hypot(u - w.u, v - (w.v + 0.95)); if (d < bd) { bd = d; best = i; } }); return best; };
  function prompt(P) { const i = nearWasher(P); if (i != null) return WASH[i].fast > 0 ? 'WASHING\u2026' : 'WASH A LOAD \u00b7 FREE'; return null; }
  function talk(P) { const i = nearWasher(P); if (i == null) return false; const w = WASH[i]; if (w.fast > 0) { toast('ALREADY WASHING \u00b7 ' + Math.ceil(w.fast) + ' S', 1.4); return true; } w.fast = 8; tone(440, 0.04, 0.2); noise(1.2, 0.02, 800); toast('WASH A LOAD \u00b7 8 SECONDS', 1.8); return true; }
  return { tick, prompt, talk, onRoof, R, HU, HV, group: RG };
}
