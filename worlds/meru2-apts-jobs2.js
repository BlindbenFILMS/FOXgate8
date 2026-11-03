// MERU 2.0 — s84 APARTMENTS PART B (Ben's answers s82): the other 9 jobs, plugged into worlds/meru2-apts-jobs.js (same J / card / hint / camera pattern).
// TAP jobs: FIX THE LEAKY TAP (flat 101: valve off, unscrew, match the washer, screw back, valve on) · PAINT TOUCH-UP (floor 1 hall: roll over the
// scuffs, mind the skirting board) · WATER THE PLANTS (4 front balconies: hold to pour, let go in the green) · WASH THE WINDOWS (Lakeside: a cradle on
// the front, wipe the grime, mind the pigeon) · FIX THE LIFT (Lakeside lobby: 4 screws, match the wires, reset the breaker, test G-1-2).
// WALK jobs: CHANGE THE BULBS (4 dead hall lights on floors 1 + 2) · SHOW A NEW TENANT (mailboxes, bins, lift, the flat, then two questions) ·
// NOISE COMPLAINT (follow the beat, knock on the loud flat, ask nicely) · FIND THE LOST CAT (follow the meows, carry Biscuit back to the owner).
export const gamesB = key => [
  { k: 'plants', name: 'Water the Plants', color: '#2f7a4a', grp: 'out' },
  ...(key === 'lake' ? [{ k: 'windows', name: 'Wash the Windows', color: '#2f6fd6', grp: 'out' }] : []),
  { k: 'tap', name: 'Fix the Leaky Tap', color: '#2f6fd6', grp: 'in' },
  { k: 'bulbs', name: 'Change the Bulbs', color: '#c9a227', grp: 'in', walk: true },
  { k: 'paint', name: 'Paint Touch-up', color: '#b06a7a', grp: 'in' },
  ...(key === 'lake' ? [{ k: 'lift', name: 'Fix the Lift', color: '#5c6670', grp: 'in' }] : []),
  { k: 'tour', name: 'Show a New Tenant', color: '#7a4a24', grp: 'ten', walk: true },
  { k: 'noise', name: 'Noise Complaint', color: '#ec3013', grp: 'ten', walk: true },
  { k: 'cat', name: 'Find the Lost Cat', color: '#d9822b', grp: 'ten', walk: true }];
export function aptJobsB(X) {
  const { THREE, G, key, KP, W, UV, V, V3, YAW, RY0, hu, hv, GY, FY, DOORS, LIFT, floorOf, mk, CT, fitTxt, LM, cols, kit, sayTo, camera, touch, ptr, RAD,
    own, fly, miss, addGold, NEXT, toast, finishGame, tone, noise, ding, pop, nope, coin, clunk, swish, knock, lst, lab, meter, tagSprite, inBld, keeper, clamp, rnd, shuffle, J } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BLUE = '#2f6fd6', GREEN = '#2f7a4a', BROWN = '#7a4a24', lake = key === 'lake';
  const ST = lake ? { wall: '#eef1f3', wains: null, rail: null, base: '#8a949c', wood: '#c9a77c', top: '#e6e8ea', metal: '#c0c4cc', bal: '#9aa0a6' } : { wall: '#e9dcc4', wains: '#cbb48f', rail: '#f3ece0', base: '#5a3d26', wood: '#6b4a32', top: '#ece6d8', metal: '#b08d3c', bal: '#cfc8bb' };
  const FG = { 1: new THREE.Group(), 2: new THREE.Group() }; G.add(FG[1]); G.add(FG[2]);
  const SF = { 0: mk(), 1: mk(), 2: mk() };
  // a frame group: local x = -v, y up, z = u (toward the front door)
  const frame = (par, u, y, v) => { const g = new THREE.Group(); const [x, z] = W(u, v); g.position.set(x, y, z); g.rotation.y = RY0; par.add(g); return g; };
  const box = (par, sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const cyl = (par, r0, r1, h, c, x, y, z, seg = 10) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const sph = (par, r, c, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), LM(c)); m.position.set(x, y, z); par.add(m); return m; };
  const colY = (u0, u1, v0, v1, y) => { const a = W(u0, v0), c = W(u1, v1); cols.push({ f: [Math.min(a[0], c[0]), Math.max(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[1], c[1])], y0: y - 0.5, y1: y + 3 }); };
  const RINGS = {}, RY = {}, FL = {};
  const ring = (k, u, v, f, out) => { RINGS[k] = [u, v]; const y = f ? FY[f] : out ? GY : 0; RY[k] = y; if (f) FL[k] = f; const S = SF[f || 0]; S.cy(0.5, 0.5, 0.012, YEL, u, y + 0.06, v, 22); S.cy(0.42, 0.42, 0.014, INK, u, y + 0.062, v, 22); };
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), tv = V();
  const hitM = m => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, true); const h = rc.intersectObject(m, false)[0]; return h || null; };
  const scrM = o => { o.getWorldPosition(tv); tv.project(camera); return [(tv.x + 1) / 2 * innerWidth, (1 - tv.y) / 2 * innerHeight, tv.z]; };
  const pd = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const wpos = o => { o.getWorldPosition(tv); const p = tv.clone(); G.worldToLocal(p); return p; };
  const fl = P => floorOf((P && P.y) || 0);
  const tex = (w, h, fn) => CT(w, h, fn);
  const plane = (par, map, w, h, x, y, z, ry = 0, tr = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: tr, depthWrite: !tr })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const say = (who, text, choices) => { const k = 'apTen' + key + ':' + who; sayTo({ key: k, name: who, role: 'TENANT', obj: TF, ry: TF.rotation.y, r: 6 }, [{ who, role: 'TENANT', text, choices }]); };
  const sayK = (text, choices) => sayTo({ key: 'apKeep' + key, name: KP.name, role: KP.role, obj: keeper, ry: keeper.rotation.y, r: 6 }, [{ who: 'apKeep' + key, role: KP.role, text, choices }]);
  const meow = (k = 0.05) => { tone(780, k, 0.14, 'triangle'); tone(1020, k, 0.2, 'triangle', 0.09); tone(640, k * 0.8, 0.3, 'triangle', 0.24); };
  const wrapA = a => (a > Math.PI ? a - 2 * Math.PI : a < -Math.PI ? a + 2 * Math.PI : a);
  // a turn gesture round a screen point (valve, tap): + = clockwise on screen
  const turnPress = o => { const s = scrM(o); J.rc = s; J.la = Math.atan2(ptr.y - s[1], ptr.x - s[0]); };
  const turnDrag = () => { if (!ptr.down || !J.rc) return 0; const dx = ptr.x - J.rc[0], dy = ptr.y - J.rc[1]; if (Math.hypot(dx, dy) < 14) return 0; const a = Math.atan2(dy, dx), d = wrapA(a - J.la); J.la = a; return d; };
  // ================= the shared TENANT fox (tour, noise, cat owner) =================
  const TF = kit.makeFox({ key: 'apTenant' + key, torso: lake ? ['#5fb0d6', '#2e4a6b', '#201e1d'] : ['#c9a227', '#6b4a32', '#3d2a1c'], outfit: 'coat', mood: 'happy' }); TF.visible = false; G.add(TF);
  const tfTo = (x, z, y, dt, sp = 4) => { const dx = x - TF.position.x, dz = z - TF.position.z, d = Math.hypot(dx, dz); let s = 0; if (d > 0.05) { const m = Math.min(d, sp * dt); TF.position.x += dx / d * m; TF.position.z += dz / d * m; s = m / Math.max(dt, 1e-4); TF.rotation.y = Math.atan2(dx, dz); } TF.position.y += (y - TF.position.y) * Math.min(1, dt * 10); kit.animFox && kit.animFox(TF, dt, s); return d; };
  const follow = (P, dt, gap = 1.5) => { const y = inBld(P) ? FY[fl(P)] : GY; if (Math.abs(TF.position.y - y) > 2.5 || Math.hypot(TF.position.x - P.x, TF.position.z - P.z) > 14) TF.position.set(P.x - Math.sin(P.yaw || 0) * gap, y, P.z - Math.cos(P.yaw || 0) * gap);
    const dx = P.x - TF.position.x, dz = P.z - TF.position.z, d = Math.hypot(dx, dz); if (d > gap) tfTo(P.x - dx / d * gap, P.z - dz / d * gap, y, dt, Math.min(6, 1.5 + d * 1.5)); else { kit.animFox && kit.animFox(TF, dt, 0); TF.rotation.y = Math.atan2(dx, dz); TF.position.y += (y - TF.position.y) * Math.min(1, dt * 10); } };
  const P_Y = P => (inBld(P) ? FY[fl(P)] : GY);
  // ================= JOB: FIX THE LEAKY TAP (flat 101, floor 1, a sink unit on the wall to flat 102) =================
  const SU = -6.32, SV = -5.5, Y1 = FY[1];
  const SK = frame(FG[1], SU, Y1, SV);
  box(SK, 1.6, 0.86, 0.6, ST.wood, 0, 0.43, 0); for (const x of [-0.4, 0.4]) box(SK, 0.74, 0.74, 0.012, ST.wood, x, 0.45, -0.305); for (const x of [-0.06, 0.06]) box(SK, 0.02, 0.12, 0.03, ST.metal, x, 0.66, -0.32);
  box(SK, 1.66, 0.04, 0.64, ST.top, 0, 0.88, 0); box(SK, 0.62, 0.006, 0.38, '#5c6670', 0, 0.903, -0.02); box(SK, 1.66, 0.5, 0.03, lake ? '#dfe7ee' : '#d8c9a8', 0, 1.15, 0.3);
  cyl(SK, 0.03, 0.035, 0.24, ST.metal, 0, 1.02, 0.2); { const arm = cyl(SK, 0.018, 0.018, 0.18, ST.metal, 0, 1.12, 0.11); arm.rotation.x = Math.PI / 2; } cyl(SK, 0.02, 0.016, 0.05, ST.metal, 0, 1.09, 0.03);
  const TH = new THREE.Group(); TH.position.set(0, 1.15, 0.2); SK.add(TH); cyl(TH, 0.03, 0.03, 0.05, ST.metal, 0, 0.02, 0); for (const r of [0, Math.PI / 2]) { const b = box(TH, 0.15, 0.022, 0.022, ST.metal, 0, 0.05, 0); b.rotation.y = r; } sph(TH, 0.022, RED, 0, 0.07, 0);
  { const p = cyl(SK, 0.022, 0.022, 0.34, '#9aa0a6', -0.98, 0.32, 0.14); p.rotation.x = Math.PI / 2; }
  const VW = new THREE.Group(); VW.position.set(-0.98, 0.32, -0.04); SK.add(VW); { const t = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.016, 8, 18), LM(RED)); VW.add(t); for (const r of [0, Math.PI / 2]) { const b = box(VW, 0.17, 0.016, 0.016, RED, 0, 0, 0); b.rotation.z = r; } }
  colY(SU - 0.32, -6, SV - 0.82, SV + 1.1, Y1);
  const WS = [0.028, 0.04, 0.052], WSN = ['S', 'M', 'L'], WM = WS.map((r, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.38, 8, 18), LM('#2a2826')); m.rotation.x = Math.PI / 2; m.position.set(0.42 + i * 0.15, 0.915, -0.14); SK.add(m); return m; });
  const DRIP = sph(SK, 0.012, '#7cc4f0', 0, 1.06, 0.03); DRIP.visible = false;
  ring('tap', -7.6, -5.5, 1);
  const TAPS = [['off', 'TURN THE WATER OFF', 1, 2 * Math.PI], ['open', 'UNSCREW THE TAP', -1, 3 * Math.PI], ['pick', 'PICK THE MATCHING WASHER'], ['close', 'SCREW THE TAP BACK', 1, 3 * Math.PI], ['on', 'WATER BACK ON', -1, 2 * Math.PI]];
  const GT = { zone: 'bld',
    begin() { J.step = 0; J.ang = 0; J.old = Math.random() * 3 | 0; J.dr = 0; J.wrongT = 0; TH.position.y = 1.15; TH.rotation.y = 0; VW.rotation.z = 0; DRIP.visible = true; WM.forEach(m => { m.visible = true; });
      J.oldM = own(new THREE.Mesh(new THREE.TorusGeometry(WS[J.old], WS[J.old] * 0.38, 8, 18), LM('#4a4644'))); J.oldM.visible = false; J.oldM.scale.set(1, 1, 0.55);
      J.tags = WM.map((m, i) => { const t = own(tagSprite(WSN[i], WHITE, INK, 0.16)); t.visible = false; return { t, m }; }); J.oldT = own(tagSprite('OLD', YEL, INK, 0.2)); J.oldT.visible = false; toast('DRIP, DRIP. FIX IT IN 5 STEPS', 2.4); },
    cur() { return TAPS[J.step]; }, obj() { const s = TAPS[J.step]; return s && (s[0] === 'off' || s[0] === 'on' ? VW : TH); },
    press() { const s = this.cur(); if (!s) return; if (s[0] === 'pick') { let bi = -1, bd = RAD() * 1.2; WM.forEach((m, i) => { const d = pd(scrM(m)); if (d < bd) { bd = d; bi = i; } }); if (bi < 0) return;
        if (bi !== J.old) { miss(KP.name.toUpperCase() + ': "TOO ' + (bi > J.old ? 'BIG' : 'SMALL') + '. MATCH THE OLD ONE."', 1.8); return; }
        pop(); addGold(3); const m = WM[bi], to = new THREE.Vector3(0, 1.08, 0.2); J.oldM.visible = false; J.oldT.visible = false; J.flies.push({ obj: m, from: m.position.clone(), to, t: 0, dur: 0.45, arc: 0.12, then: () => { m.visible = false; } }); J.step++; J.ang = 0; return; }
      turnPress(this.obj()); },
    drag() { const s = this.cur(); if (!s || s[0] === 'pick') return; const d = turnDrag(); if (!d) return; J.ang += d; const prog = clamp(J.ang * s[2] / s[3], 0, 1);
      if (J.ang * s[2] < -1.2 && J.wrongT <= 0) { toast(s[2] > 0 ? 'OTHER WAY \u00b7 TURN IT CLOCKWISE \u21bb' : 'OTHER WAY \u00b7 ANTICLOCKWISE \u21ba', 1.4); J.wrongT = 1.6; J.ang = 0; }
      if ((J.dr = (J.dr || 0) + Math.abs(d)) > 0.9) { J.dr = 0; tone(s[0] === 'off' || s[0] === 'on' ? 330 : 520, 0.025, 0.06, 'square'); }
      if (s[0] === 'off' || s[0] === 'on') VW.rotation.z = -J.ang; else { TH.rotation.y = -J.ang; TH.position.y = 1.15 + (s[0] === 'open' ? prog : 1 - prog) * 0.07; }
      if (prog >= 1) { addGold(3); J.ang = 0; J.rc = null; clunk(); const k = s[0];
        if (k === 'off') { DRIP.visible = false; toast('WATER OFF', 1.2); }
        if (k === 'open') { TH.visible = false; J.oldM.visible = true; J.oldT.visible = true; J.tags.forEach(q => { q.t.visible = true; }); toast('OLD WASHER OUT \u00b7 FIND ITS SIZE', 1.6); }
        if (k === 'close') { toast('TAP BACK ON', 1.0); J.tags.forEach(q => { q.t.visible = false; }); }
        if (k === 'close' || k === 'pick') TH.visible = true;
        J.step++; if (k === 'on') { ding(); toast('NO MORE DRIPS!', 1.6); NEXT('done', finishGame, 1.4); } } },
    tick(dt) { J.wrongT -= dt; if (DRIP.visible) { J.dt0 = (J.dt0 || 0) + dt; const k = (J.dt0 % 0.9) / 0.5; DRIP.position.y = 1.06 - Math.min(1, k) ** 2 * 0.15; DRIP.scale.setScalar(k < 1 ? 1 : 0.01); if (k > 1 && !J.plip) { J.plip = 1; tone(1900, 0.02, 0.08); } if (k < 1) J.plip = 0; }
      if (J.oldM.visible) { const p = SK.localToWorld(V(0, 1.32, -0.08)); G.worldToLocal(p); J.oldM.position.copy(p); J.oldM.rotation.set(0.6, J.t * 1.2, 0); J.oldT.position.set(p.x, p.y + 0.12, p.z); }
      J.tags.forEach(q => { if (q.t.visible) { const p = wpos(q.m); q.t.position.set(p.x, p.y + 0.09, p.z); } }); },
    card() { const s = this.cur(), prog = s && s[3] ? clamp(J.ang * s[2] / s[3], 0, 1) : 0; return [s ? s[1] : 'DONE', (s && s[3] ? lab(s[2] > 0 ? 'DRAG ROUND \u00b7 CLOCKWISE \u21bb' : 'DRAG ROUND \u00b7 ANTICLOCKWISE \u21ba') + meter(prog, BLUE) : s ? lab('OLD WASHER: SIZE ?') : '') + lst(TAPS.map((q, i) => [i < J.step ? GREEN : '#cfcac3', q[1], i < J.step ? '\u2713' : '', i < J.step])), J.step + '_' + Math.round(prog * 10)]; },
    hint() { const s = this.cur(); if (!s) return null; if (s[0] === 'pick') return [wpos(WM[J.old]), 'TAP THE MATCH']; return [wpos(this.obj()), s[2] > 0 ? 'TURN \u21bb' : 'TURN \u21ba']; },
    shot() { return [V3(SU - 0.3, Y1 + 0.72, SV + 0.25), 2.5, 1.5, 0.42, 1.7, YAW(-1, 0), 3.4, [-15.4, -6.7, -12.6, -2.4, Y1 + 0.8, Y1 + 3.0]]; },
    end() { TH.visible = true; TH.position.y = 1.15; DRIP.visible = false; WM.forEach(m => { m.visible = true; m.position.set(0.42 + WM.indexOf(m) * 0.15, 0.915, -0.14); }); } };
  // ================= JOB: PAINT TOUCH-UP (floor 1 hall, the wall to flats 103 / 105) =================
  const PWu = -7.2, PWw = 2.4, PWh = 1.9, CW = 512, CH = 404, PXM = CW / PWw, BB = Math.round(0.14 * PXM), RAILY = ST.wains ? Math.round(CH - 0.9 * PXM) : null;
  const paintBase = (g, x0 = 0, y0 = 0, w = CW, h = CH) => { g.fillStyle = ST.wall; g.fillRect(x0, y0, w, h); if (RAILY != null) { g.fillStyle = ST.wains; g.fillRect(x0, Math.max(y0, RAILY), w, CH); g.fillStyle = ST.rail; g.fillRect(x0, RAILY - 4, w, 8); } g.fillStyle = ST.base; g.fillRect(x0, CH - BB, w, BB); };
  const PT = tex(CW, CH, g => paintBase(g)); const PFr = frame(FG[1], PWu, Y1, 1.86), PW = plane(PFr, PT, PWw, PWh, 0, 0.04 + PWh / 2, 0, Math.PI / 2);
  const ROLL = new THREE.Group(); { const r = cyl(ROLL, 0.05, 0.05, 0.26, '#f3f2f2', 0, 0, 0, 12); r.rotation.z = Math.PI / 2; const h = cyl(ROLL, 0.012, 0.012, 0.5, RED, 0, -0.28, -0.06); h.rotation.x = 0.25; } ROLL.visible = false; FG[1].add(ROLL);
  const TRAY = frame(FG[1], PWu + 1.6, Y1, 1.2); box(TRAY, 0.4, 0.05, 0.3, '#9aa0a6', 0, 0.025, 0); box(TRAY, 0.34, 0.01, 0.24, ST.wains || ST.wall, 0, 0.052, 0);
  ring('paint', PWu, 0.4, 1);
  const PCELL = 16, PGX = CW / PCELL, PGY = CH / PCELL;
  const GP = { zone: 'bld',
    begin() { const g = PT.userData.c.getContext('2d'); paintBase(g); J.sc = []; const BR0 = touch ? 40 : 32;
      for (let i = 0; i < 7; i++) { let s, n = 0; do { s = { x: rnd(50, CW - 50), y: rnd(46, CH - BB - BR0 - 46), r: rnd(22, 36) }; n++; } while (n < 40 && J.sc.some(q => Math.hypot(q.x - s.x, q.y - s.y) < q.r + s.r + 10)); J.sc.push(s);
        g.save(); g.strokeStyle = ['#3d3b3a', '#5c4a3a', '#7a2a3a', '#2e4a6b'][i % 4]; g.lineCap = 'round'; g.globalAlpha = 0.75;
        if (i % 3 === 2) { g.lineWidth = 4; g.beginPath(); for (let k = 0; k < 14; k++) { const a = k * 0.9; g.lineTo(s.x + Math.cos(a) * s.r * (0.3 + k / 20), s.y + Math.sin(a) * s.r * 0.7); } g.stroke(); }
        else for (let k = 0; k < 4; k++) { g.lineWidth = rnd(3, 7); g.beginPath(); const a = rnd(-0.4, 0.4); g.moveTo(s.x - Math.cos(a) * s.r, s.y - Math.sin(a) * s.r + k * 5 - 8); g.lineTo(s.x + Math.cos(a) * s.r, s.y + Math.sin(a) * s.r + k * 5 - 8); g.stroke(); } g.restore(); }
      PT.needsUpdate = true; J.cells = new Set(); for (let i = 0; i < PGX; i++) for (let j = 0; j < PGY; j++) { const cx = (i + 0.5) * PCELL, cy = (j + 0.5) * PCELL; if (J.sc.some(s => Math.hypot(cx - s.x, cy - s.y) < s.r)) J.cells.add(i * 100 + j); } J.n0 = J.cells.size; J.stroke = 0; ROLL.visible = true;
      toast('ROLL OVER THE SCUFFS \u00b7 MIND THE SKIRTING BOARD', 2.6); },
    press() { J.stroke = 0; this.drag(); },
    drag() { if (!ptr.down || J.sub === 'done') return; const h = hitM(PW); if (!h || !h.uv) return; const px = h.uv.x * CW, py = (1 - h.uv.y) * CH, BR = touch ? 40 : 32, p = h.point.clone(); G.worldToLocal(p); ROLL.position.copy(p); ROLL.rotation.y = RY0 + Math.PI / 2;
      if (py + BR > CH - BB + 2) { if (!J.stroke) { J.stroke = 1; miss(KP.name.toUpperCase() + ': "MIND THE SKIRTING BOARD!"', 1.6); } }
      const g = PT.userData.c.getContext('2d'); g.save(); g.beginPath(); g.arc(px, py, BR, 0, 6.283); g.clip(); g.beginPath(); g.rect(0, 0, CW, CH - BB); g.clip(); paintBase(g, px - BR, py - BR, BR * 2, BR * 2); g.restore(); PT.needsUpdate = true;
      for (const c of [...J.cells]) { const cx = ((c / 100 | 0) + 0.5) * PCELL, cy = (c % 100 + 0.5) * PCELL; if (Math.hypot(cx - px, cy - py) < BR + 4) J.cells.delete(c); }
      if ((J.sw = (J.sw || 0) + 1) > 6) { J.sw = 0; noise(0.08, 0.012, 900); }
      if (J.cells.size <= J.n0 * 0.04) { J.sub = 'done'; addGold(16); ding(); toast('GOOD AS NEW!', 1.4); NEXT('done', finishGame, 1.2); } },
    release() { J.stroke = 0; },
    card() { const f = 1 - J.cells.size / Math.max(1, J.n0); return ['ROLL OVER EVERY SCUFF', lab('SCUFFS COVERED ' + Math.round(f * 100) + '%') + meter(f, '#b06a7a') + lst([[ST.base, 'SKIRTING BOARD', 'KEEP CLEAR', false]]), Math.round(f * 20) + '']; },
    hint() { const c = [...J.cells][0]; if (c == null) return null; const u = (((c / 100 | 0) + 0.5) * PCELL) / CW, v = 1 - ((c % 100 + 0.5) * PCELL) / CH; const p = PW.localToWorld(V((u - 0.5) * PWw, (v - 0.5) * PWh, 0.01)); G.worldToLocal(p); return [p, 'DRAG TO PAINT']; },
    shot() { return [V3(PWu, Y1 + 1.0, 1.86), PWw + 0.5, PWh + 0.4, 0.1, 2.2, YAW(0, -1), 4.2, [-15.5, 3.5, -1.85, 1.6, Y1 + 0.6, Y1 + 3.0]]; },
    end() { ROLL.visible = false; } };
  // ================= front BALCONIES (floors 1 + 2, v ±9.5) + JOB: WATER THE PLANTS =================
  const BALS = []; for (const f of [1, 2]) for (const s of [-1, 1]) { const v = s * 9.5, y = FY[f], g = frame(G, hu, y, v);
    box(g, 2.8, 0.18, 1.2, ST.bal, 0, -0.09, 0.6); box(g, 2.8, 0.06, 0.06, lake ? '#5c6670' : ST.bal, 0, 1.0, 1.17);
    if (lake) box(g, 2.7, 0.9, 0.02, '#a9d3e8', 0, 0.5, 1.17).material = new THREE.MeshLambertMaterial({ color: '#a9d3e8', transparent: true, opacity: 0.45 }); else for (let i = 0; i < 9; i++) cyl(g, 0.04, 0.05, 0.94, ST.bal, -1.3 + i * 0.325, 0.5, 1.15, 8);
    for (const x of [-1.37, 1.37]) box(g, 0.06, 1.0, 1.2, lake ? '#5c6670' : ST.bal, x, 0.5, 0.6);
    const pb = new THREE.Group(); pb.position.set(0, 1.0, 1.36); g.add(pb); box(pb, 2.2, 0.3, 0.32, lake ? '#5c6670' : '#8a5a46', 0, 0.05, 0); const soil = box(pb, 2.12, 0.02, 0.26, '#4a3424', 0, 0.2, 0); soil.material = new THREE.MeshLambertMaterial({ color: '#4a3424' });
    const pl = [-0.8, -0.27, 0.27, 0.8].map((x, i) => { const p = new THREE.Group(); p.position.set(x, 0.2, 0); pb.add(p); cyl(p, 0.014, 0.014, 0.34, '#3d6b2a', 0, 0.17, 0, 5); const lf = sph(p, 0.11, '#4f8a3c', 0, 0.3, 0); lf.scale.set(1.2, 0.8, 1); sph(p, 0.06, lake ? ['#ffd23a', '#f472b6'][i % 2] : ['#c0263a', '#f3f2f2'][i % 2], 0, 0.42, 0.03); return p; });
    BALS.push({ f, s, v, y, g, pb, soil, pl }); }
  const CAN = new THREE.Group(); { cyl(CAN, 0.12, 0.13, 0.24, '#2f7a4a', 0, 0, 0, 14); const sp = cyl(CAN, 0.018, 0.03, 0.34, '#2f7a4a', 0, 0.06, 0.2, 8); sp.rotation.x = 1.0; const rs = cyl(CAN, 0.045, 0.03, 0.04, '#9aa0a6', 0, 0.16, 0.34, 8); rs.rotation.x = 1.0; const hd = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.015, 6, 14, Math.PI), LM(INK)); hd.position.set(0, 0.12, -0.02); hd.rotation.y = Math.PI / 2; CAN.add(hd); } CAN.visible = false;
  const DROPS = [...Array(8)].map(() => { const m = sph(G, 0.018, '#7cc4f0', 0, 0, 0); m.visible = false; return m; });
  ring('plants', hu + 6.4, -6.2, 0, true);
  const dry = new THREE.Color('#b89a72'), wet = new THREE.Color('#3d2a1c');
  const setBal = (B, w) => { B.pl.forEach((p, i) => { p.rotation.x = 1.0 * (1 - Math.min(1, w / 0.72)) * (i % 2 ? 1 : 0.8); p.scale.y = 0.8 + 0.2 * Math.min(1, w / 0.72); }); B.soil.material.color.copy(dry).lerp(wet, clamp(w, 0, 1)); };
  BALS.forEach(B => setBal(B, 0.85));
  const GW = {
    begin() { J.order = [0, 1, 3, 2]; J.bi = 0; J.w = 0; J.done = []; BALS.forEach(B => setBal(B, 0)); this.hang(); toast('HOLD TO POUR \u00b7 LET GO IN THE GREEN', 2.6); },
    hang() { const B = BALS[J.order[J.bi]]; if (!B) return; B.pb.add(CAN); CAN.position.set(0, 0.62, -0.25); CAN.rotation.set(0, 0, 0); CAN.visible = true; J.w = 0; J.over = 0; },
    press() { if (J.sub === 'done') return; J.pour = true; },
    release() { if (!J.pour) return; J.pour = false; const B = BALS[J.order[J.bi]]; if (!B || J.sub === 'done') return;
      if (J.w < 0.7) { if (J.w > 0.05) toast('A BIT MORE WATER', 1.0); return; }
      J.done.push(J.order[J.bi]); addGold(4); coin(); if (J.w <= 0.92) toast('PERFECT!', 0.9); J.bi++; if (J.bi >= 4) { J.sub = 'done'; CAN.visible = false; ding(); NEXT('done', finishGame, 1.2); } else NEXT('next', () => this.hang(), 0.8); },
    tick(dt) { const B = BALS[J.order[J.bi]]; const k = J.pour && B && J.sub !== 'done' && J.pause <= 0;
      CAN.rotation.x += ((k ? 0.9 : 0) - CAN.rotation.x) * Math.min(1, dt * 8); CAN.position.z = -0.25 - CAN.rotation.x * 0.08;
      if (k) { J.w += dt * 0.34; if (J.w > 1.0 && !J.over) { J.over = 1; miss(KP.name.toUpperCase() + ': "TOO MUCH! IT\'S DRIPPING ON THE STEPS."', 1.8); J.w = 0.88; J.pour = false; } setBal(B, J.w); if ((J.gl = (J.gl || 0) - dt) <= 0) { J.gl = 0.16; noise(0.15, 0.012, 1400); } }
      DROPS.forEach((d, i) => { if (!k) { d.visible = false; return; } const tip = CAN.localToWorld(V(0, 0.16, 0.36)); G.worldToLocal(tip); const ph = ((J.t * 2.4 + i / 8) % 1); d.visible = true; d.position.set(tip.x + Math.sin(i * 3) * 0.04, tip.y - ph * 0.42, tip.z + Math.cos(i * 5) * 0.04); }); },
    card() { const g = J.w, z = g < 0.7 ? 'MORE' : g <= 0.92 ? 'GREEN \u00b7 LET GO' : 'CAREFUL'; return [J.pour ? z : 'HOLD TO POUR', '<div style="position:relative">' + meter(g, g < 0.7 ? '#7cc4f0' : g <= 0.92 ? GREEN : RED) + '<div style="position:absolute;left:70%;width:22%;top:4px;height:14px;border-left:2px solid #201e1d;border-right:2px solid #201e1d;background:rgba(47,122,74,0.25)"></div></div>' + lst(J.order.map((o, i) => [GREEN, 'BALCONY ' + (i + 1) + ' \u00b7 FL ' + BALS[o].f, J.done.includes(o) ? '\u2713' : i === J.bi ? 'NOW' : '', J.done.includes(o)])), Math.round(g * 20) + '_' + J.bi + (J.pour ? 'p' : '')]; },
    hint() { const B = BALS[J.order[J.bi]]; if (!B || J.pour) return null; return [wpos(B.pb), 'HOLD TO POUR']; },
    shot() { const B = BALS[J.order[J.bi]] || BALS[J.order[3]]; return [V3(hu + 1.3, B.y + 1.15, B.v), 3.4, 2.0, 0.2, 3.2, RY0, 7.5]; },
    end() { CAN.visible = false; DROPS.forEach(d => { d.visible = false; }); BALS.forEach(B => setBal(B, 0.85)); } };
  // ================= LAKESIDE: JOB: WASH THE WINDOWS (a cradle on the front, 2 rows x 3 panes) =================
  let GWin = null, GLift = null;
  if (lake) {
    const ROWS = [FY[1] + 1.6, FY[2] + 1.6], RWw = 8.4, RWh = 2.2, GWc = 512, GHc = 134, MC = 16, MX = GWc / MC, MYc = Math.ceil(GHc / MC);
    const glassT = tex(1024, 268, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#cfe9f5'); gr.addColorStop(1, '#7fb6d2'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(i * w / 3 + 60, h); g.lineTo(i * w / 3 + 150, 0); g.lineTo(i * w / 3 + 190, 0); g.lineTo(i * w / 3 + 100, h); g.fill(); }
      g.fillStyle = '#5c6670'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 18, w, 18); for (let i = 0; i <= 3; i++) g.fillRect(Math.min(w - 14, Math.max(0, i * w / 3 - 7)), 0, 14, h); });
    const rowsM = ROWS.map(y => { const g = frame(G, hu + 0.06, y, 0); plane(g, glassT, RWw, RWh, 0, 0, 0); const gt = tex(GWc, GHc, () => {}); const gm = plane(g, gt, RWw, RWh, 0, 0, 0.03, 0, true); box(g, RWw + 0.1, 0.08, 0.22, '#5c6670', 0, -RWh / 2 - 0.02, 0.1); return { g, gt, gm, y }; });
    const grime = R => { const g = R.gt.userData.c.getContext('2d'); g.clearRect(0, 0, GWc, GHc); g.fillStyle = 'rgba(122,104,78,0.55)'; g.fillRect(0, 0, GWc, GHc); for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(80,66,48,' + rnd(0.15, 0.4).toFixed(2) + ')'; g.beginPath(); g.ellipse(rnd(0, GWc), rnd(0, GHc), rnd(6, 22), rnd(4, 12), rnd(0, 3), 0, 6.283); g.fill(); }
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(245,245,240,0.9)'; const x = rnd(20, GWc - 20), y = rnd(10, GHc - 30); g.beginPath(); g.arc(x, y, rnd(3, 6), 0, 6.283); g.fill(); g.fillRect(x - 1.5, y, 3, rnd(6, 14)); } R.gt.needsUpdate = true; };
    rowsM.forEach(R => { grime(R); const g = R.gt.userData.c.getContext('2d'); g.clearRect(0, 0, GWc, GHc); g.fillStyle = 'rgba(122,104,78,0.12)'; g.fillRect(0, 0, GWc, GHc); R.gt.needsUpdate = true; });
    const CR = new THREE.Group(); G.add(CR); const crF = new THREE.Group(); crF.rotation.y = RY0; CR.add(crF);
    box(crF, 3.2, 0.08, 0.7, '#5c6670', 0, 0, 0.35); box(crF, 3.2, 0.05, 0.05, YEL, 0, 1.0, 0.68); box(crF, 3.2, 0.05, 0.05, YEL, 0, 0.5, 0.68); for (const x of [-1.58, 1.58]) box(crF, 0.05, 1.0, 0.7, YEL, x, 0.5, 0.35);
    box(crF, 0.5, 0.4, 0.3, RED, 1.2, 0.24, 0.18); const cab = [-1.4, 1.4].map(x => cyl(crF, 0.012, 0.012, 1, INK, x, 0, 0.35, 5));
    const cradleAt = (y, v) => { const [x, z] = W(hu + 0.08, v); CR.position.set(x, y, z); const top = FY[2] + 5.5 - y; cab.forEach(c => { c.scale.y = top; c.position.y = 1 + top / 2; }); };
    cradleAt(GY + 0.02, 6.5);
    const SQ = new THREE.Group(); { box(SQ, 0.5, 0.06, 0.04, INK, 0, 0, 0); const h = cyl(SQ, 0.014, 0.014, 0.4, '#9aa0a6', 0, -0.22, 0.02); h.rotation.z = 0; } SQ.visible = false; G.add(SQ);
    const PIG = new THREE.Group(); { const b = sph(PIG, 0.12, '#8a8f99', 0, 0.12, 0); b.scale.set(0.9, 0.85, 1.3); sph(PIG, 0.07, '#7a7f89', 0, 0.24, 0.12); const bk = cyl(PIG, 0.0, 0.02, 0.05, '#e6b13a', 0, 0.23, 0.2, 6); bk.rotation.x = Math.PI / 2; sph(PIG, 0.03, '#5a8a6a', 0, 0.2, 0.06); } PIG.visible = false; G.add(PIG);
    ring('windows', hu + 6.4, 2.6, 0, true);
    GWin = {
      begin() { J.row = 0; J.cv = 0; J.cy = ROWS[0] - RWh / 2 - 1.15; rowsM.forEach(grime); this.setRow(); cradleAt(J.cy, 0); SQ.visible = true; toast('WIPE THE GRIME OFF \u00b7 MIND THE PIGEON', 2.6); },
      setRow() { J.cells = new Set(); for (let i = 0; i < MX; i++) for (let j = 0; j < MYc; j++) J.cells.add(i * 100 + j); J.n0 = J.cells.size; J.pig = { v: [-2.8, 0, 2.8][Math.random() * 3 | 0], gone: false }; const [x, z] = W(hu + 0.18, J.pig.v); PIG.position.set(x, ROWS[J.row] - RWh / 2 + 0.02, z); PIG.rotation.y = RY0; PIG.visible = true; },
      colLeft(c) { let n = 0; for (const k of J.cells) if (Math.floor((k / 100 | 0) / (MX / 3)) === c) n++; return n / (J.n0 / 3); },
      press() { this.drag(); },
      drag() { if (!ptr.down || J.sub) return; const R = rowsM[J.row], h = hitM(R.gm); if (!h || !h.uv) return; const px = h.uv.x * GWc, py = (1 - h.uv.y) * GHc, BR = touch ? 22 : 18, p = h.point.clone(); G.worldToLocal(p); SQ.position.copy(p); SQ.rotation.y = RY0;
        const [, hv2] = UV(p.x, p.z); J.cvT = clamp(hv2, -2.6, 2.6);
        if (!J.pig.gone && Math.hypot(p.x - PIG.position.x, p.z - PIG.position.z) < 0.45 && Math.abs(p.y - PIG.position.y - 0.15) < 0.45) { J.pig.gone = true; miss(KP.name.toUpperCase() + ': "YOU SPOOKED THE PIGEON!"', 1.6); tone(500, 0.04, 0.2, 'triangle'); tone(420, 0.04, 0.2, 'triangle', 0.15); const q = PIG.position.clone(); q.y += 4; const [ox, oz] = W(hu + 6, J.pig.v + 4); q.x = ox; q.z = oz; fly(PIG, q, 1.2, 0.5, () => { PIG.visible = false; }); }
        const g = R.gt.userData.c.getContext('2d'); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(px, py, BR, 0, 6.283); g.fill(); g.globalCompositeOperation = 'source-over'; R.gt.needsUpdate = true;
        for (const c of [...J.cells]) { const cx = ((c / 100 | 0) + 0.5) * MC, cy = (c % 100 + 0.5) * MC; if (Math.hypot(cx - px, cy - py) < BR + 5) J.cells.delete(c); }
        if ((J.sw = (J.sw || 0) + 1) > 5) { J.sw = 0; tone(rnd(1400, 1800), 0.012, 0.07, 'sine'); }
        if (J.cells.size <= J.n0 * 0.08) { const g2 = R.gt.userData.c.getContext('2d'); g2.clearRect(0, 0, GWc, GHc); R.gt.needsUpdate = true; addGold(10); ding();
          if (J.row === 0) { J.sub = 'rise'; toast('ROW DONE \u00b7 GOING UP', 1.4); } else { J.sub = 'done'; NEXT('done', finishGame, 1.4); } } },
      tick(dt) { if (J.cvT != null) J.cv += (J.cvT - J.cv) * Math.min(1, dt * 3);
        if (J.sub === 'rise') { const ty = ROWS[1] - RWh / 2 - 1.15; J.cy += Math.min(1.6 * dt, ty - J.cy); if ((J.mt = (J.mt || 0) - dt) <= 0) { J.mt = 0.12; tone(110, 0.03, 0.14, 'sawtooth'); } if (ty - J.cy < 0.01) { J.sub = ''; J.row = 1; this.setRow(); } }
        cradleAt(J.cy, J.cv); if (!J.pig.gone && PIG.visible) PIG.rotation.y = RY0 + Math.sin(J.t * 1.7) * 0.6; },
      card() { const f = 1 - J.cells.size / Math.max(1, J.n0); return [J.sub === 'rise' ? 'GOING UP\u2026' : 'WIPE ALL THREE PANES', lab('ROW ' + (J.row + 1) + ' / 2 \u00b7 ' + Math.round(f * 100) + '% CLEAN') + meter(f, BLUE) + lst([[BLUE, 'PANES', [0, 1, 2].map(c => (this.colLeft(c) < 0.15 ? '\u2713' : '\u00b7')).join(' '), f > 0.9], ['#8a8f99', 'PIGEON', J.pig.gone ? 'SPOOKED' : 'LEAVE IT', !J.pig.gone]]), J.row + J.sub + Math.round(f * 20) + (+J.pig.gone)]; },
      hint() { if (J.sub) return null; let c = 0; for (; c < 3; c++) if (this.colLeft(c) > 0.15) break; if (c > 2) c = 1; const p = V3(hu + 0.1, ROWS[J.row], (-1 + c) * 2.8 * -1); return [p, 'DRAG TO WIPE']; },
      shot() { const port = (camera.aspect || 1) < 1; let c = 1; if (port) { for (c = 0; c < 3; c++) if (this.colLeft(c) > 0.15) break; if (c > 2) c = 1; } const y = J.sub === 'rise' ? J.cy + RWh / 2 + 1.15 : ROWS[J.row];
        const v = port ? [2.8, 0, -2.8][c] : 0; return [V3(hu + 0.3, y, v), port ? 3.2 : RWw + 0.6, RWh + 1.4, 0.06, 4.5, RY0, 14]; },
      end() { SQ.visible = false; PIG.visible = false; cradleAt(GY + 0.02, 6.5); } };
    // ================= LAKESIDE: JOB: FIX THE LIFT (control panel on the lobby lift wall) =================
    const LP = frame(G, -12.79, 1.45, -2.2);
    const back = box(LP, 0.62, 0.82, 0.04, '#3d3b3a', 0, 0, 0.02); box(LP, 0.58, 0.78, 0.005, '#2a2826', 0, 0, 0.042);
    const disp = tex(256, 96, () => {}), drawDisp = (t, c) => { const g = disp.userData.c.getContext('2d'); g.fillStyle = '#0f1012'; g.fillRect(0, 0, 256, 96); g.fillStyle = c; g.font = '900 64px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(t, 128, 52); disp.needsUpdate = true; }; drawDisp('FAULT', RED);
    plane(LP, disp, 0.24, 0.09, 0, 0.3, 0.046);
    const WC = [RED, YEL, BLUE, GREEN], TY = [0.15, 0.03, -0.09, -0.21];
    const TL = WC.map((c, i) => box(LP, 0.05, 0.05, 0.03, c, -0.2, TY[i], 0.055)), TR = WC.map((c, i) => box(LP, 0.05, 0.05, 0.03, c, 0.2, TY[i], 0.055));
    const BRK = new THREE.Group(); BRK.position.set(0, -0.33, 0.05); LP.add(BRK); box(LP, 0.16, 0.08, 0.02, '#5c6670', 0, -0.33, 0.045); box(BRK, 0.04, 0.1, 0.04, RED, 0, 0.04, 0.02); BRK.rotation.x = 0.7;
    const COV = new THREE.Group(); COV.position.set(0, 0, 0.065); LP.add(COV); box(COV, 0.6, 0.8, 0.012, '#c0c4cc', 0, 0, 0); plane(COV, tex(256, 64, (g, w, h) => { g.fillStyle = '#c0c4cc'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LIFT CONTROL', 14, h / 2); }), 0.4, 0.1, 0, 0.22, 0.008);
    const SCR = [[-0.26, 0.36], [0.26, 0.36], [-0.26, -0.36], [0.26, -0.36]].map(([x, y]) => { const s = cyl(COV, 0.018, 0.018, 0.02, '#5c6670', x, y, 0.012, 10); s.rotation.x = Math.PI / 2; return s; });
    ring('lift', -11.4, -2.9);
    const WIRE = c => { const m = own(new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1, 6), LM(c))); G.remove(m); LP.add(m); return m; };
    const lay = (m, a, b) => { const d = b.clone().sub(a), L0 = Math.max(0.001, d.length()); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, L0, 1); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); };
    GLift = {
      begin() { J.st = 'screws'; J.sc = 0; J.map = shuffle([0, 1, 2, 3]); J.ok = [false, false, false, false]; TR.forEach((m, i) => { m.material = LM(WC[J.map[i]]); }); SCR.forEach(s => { s.visible = true; s.position.z = 0.012; }); COV.visible = true; COV.position.set(0, 0, 0.065); COV.rotation.set(0, 0, 0); BRK.rotation.x = 0.7; drawDisp('FAULT', RED); J.wires = []; toast('THE LIFT IS STUCK \u00b7 OPEN THE PANEL', 2.4); },
      press() { if (J.st === 'screws') { let bi = -1, bd = RAD(); SCR.forEach((s, i) => { if (!s.visible) return; const d = pd(scrM(s)); if (d < bd) { bd = d; bi = i; } }); if (bi < 0) return; const s = SCR[bi]; tone(900, 0.03, 0.1, 'square'); J.flies.push({ obj: s, from: s.position.clone(), to: s.position.clone().add(V(0, -0.5, 0.25)), t: 0, dur: 0.4, arc: 0.06, then: () => { s.visible = false; tone(2400, 0.03, 0.08, 'triangle'); } }); J.sc++; addGold(1);
          if (J.sc >= 4) { J.st = 'cover'; NEXT('', () => { J.flies.push({ obj: COV, from: COV.position.clone(), to: V(0.1, -1.4, 0.4), t: 0, dur: 0.6, arc: 0.1, then: () => { COV.visible = false; clunk(); J.st = 'wires'; toast('MATCH THE WIRES BY COLOUR', 1.8); } }); }, 0.5); } return; }
        if (J.st === 'wires') { let bi = -1, bd = RAD(); TL.forEach((m, i) => { if (J.ok[i]) return; const d = pd(scrM(m)); if (d < bd) { bd = d; bi = i; } }); if (bi < 0) return; J.wl = bi; J.wm = WIRE(WC[bi]); pop(); this.drag(); return; }
        if (J.st === 'breaker') { if (pd(scrM(BRK)) > RAD() * 1.4) return; BRK.rotation.x = -0.7; clunk(); addGold(4); J.st = 'test'; let i = 0; const seq = ['G', '1', '2'];
          const stepT = () => { if (!J || J.g !== 'lift') return; if (i < 3) { drawDisp(seq[i], '#7cf09a'); tone(880 + i * 220, 0.05, 0.4); i++; NEXT('', stepT, 0.7); } else { drawDisp('OK', '#7cf09a'); ding(); toast('THE LIFT WORKS!', 1.6); NEXT('done', finishGame, 1.2); } }; NEXT('', stepT, 0.4); } },
      drag() { if (J.st !== 'wires' || J.wl == null || !ptr.down) return; const h = hitM(back); if (!h) return; const p = LP.worldToLocal(h.point.clone()); p.z = 0.07; lay(J.wm, TL[J.wl].position.clone().setZ(0.07), p); },
      release() { if (J.st !== 'wires' || J.wl == null) return; let bi = -1, bd = RAD() * 1.1; TR.forEach((m, i) => { const d = pd(scrM(m)); if (d < bd) { bd = d; bi = i; } }); const L0 = J.wl; J.wl = null;
        if (bi >= 0 && J.map[bi] === L0 && !J.ok[L0]) { J.ok[L0] = true; lay(J.wm, TL[L0].position.clone().setZ(0.07), TR[bi].position.clone().setZ(0.07)); tone(1400, 0.04, 0.12, 'triangle'); addGold(2); if (J.ok.every(Boolean)) { J.st = 'breaker'; toast('NOW FLIP THE BREAKER', 1.6); } return; }
        J.wm.parent && J.wm.parent.remove(J.wm); if (bi >= 0) { miss(KP.name.toUpperCase() + ': "WRONG COLOUR! ZAP. MATCH THEM UP."', 1.8); tone(80, 0.06, 0.25, 'sawtooth'); } },
      card() { const lbl = { screws: 'TAP THE 4 SCREWS', cover: 'COVER OFF\u2026', wires: 'DRAG EACH WIRE TO ITS COLOUR', breaker: 'FLIP THE RED BREAKER', test: 'TESTING\u2026' }[J.st]; return [lbl, lst([[INK, 'SCREWS', J.sc + ' / 4', J.sc >= 4], ...WC.map((c, i) => [c, ['RED', 'YELLOW', 'BLUE', 'GREEN'][i] + ' WIRE', J.ok[i] ? '\u2713' : '', J.ok[i]]), [RED, 'BREAKER', BRK.rotation.x < 0 ? 'ON' : 'OFF', BRK.rotation.x < 0]]), J.st + J.sc + J.ok.map(Number).join('')]; },
      hint() { if (J.st === 'screws') { const s = SCR.find(q => q.visible); return s ? [wpos(s), 'TAP'] : null; } if (J.st === 'wires') { const i = J.ok.indexOf(false); if (i < 0) return null; return [wpos(J.wl == null ? TL[i] : TR[J.map.indexOf(i)]), J.wl == null ? 'DRAG' : 'TO HERE']; } if (J.st === 'breaker') return [wpos(BRK), 'TAP']; return null; },
      shot() { return [V3(-12.79, 1.45, -2.2), 1.5, 1.45, 0.05, 1.4, YAW(1, 0), 2.6, [-12.4, hu - 0.6, -hv + 0.8, hv - 0.8, 0.6, 3.5]]; },
      end() { SCR.forEach(s => { s.visible = true; s.position.z = 0.012; }); COV.visible = true; COV.position.set(0, 0, 0.065); BRK.rotation.x = 0.7; drawDisp('G', '#7cf09a'); } };
    drawDisp('G', '#7cf09a');
  }
  // ================= JOB: CHANGE THE BULBS (walk: 2 dead hall lights per floor) =================
  const BUL = []; for (const f of [1, 2]) for (const u of [-14, -8, -4, 2]) for (const s of [-1, 1]) { const [x, z] = W(u, s * 1.74), [px, pz] = W(u, s * 1.0); const m = sph(FG[f], 0.075, '#3a3836', x, FY[f] + 2.2, z); m.visible = false; BUL.push({ f, u, s, x, z, px, pz, m }); }
  const deadM = LM('#3a3836'), litM = new THREE.MeshBasicMaterial({ color: '#fff1c8' });
  const nearBulb = P => { const f = fl(P); let best = null, bd = 0.95; for (const b of BUL) { if (b.f !== f) continue; const d = Math.hypot(P.x - b.px, P.z - b.pz); if (d < bd) { bd = d; best = b; } } return best; };
  const GBu = { walk: true, zone: 'bld',
    begin() { J.dead = []; for (const f of [1, 2]) J.dead.push(...shuffle(BUL.filter(b => b.f === f)).slice(0, 2)); J.dead.forEach(b => { b.m.visible = true; b.m.material = deadM; }); J.fl = J.dead[Math.random() * 4 | 0]; J.lads = []; toast('4 DEAD BULBS ON FLOORS 1 + 2 \u00b7 TAKE THE LIFT', 2.6); pop(); },
    goal() { const P = J.P, f = fl(P), here = J.dead.filter(b => b.f === f); if (!J.dead.length) return null; if (!here.length) return LIFT(f); let b2 = here[0], bd = 1e9; for (const b of here) { const d = Math.hypot(P.x - b.px, P.z - b.pz); if (d < bd) { bd = d; b2 = b; } } return [b2.px, b2.pz, FY[f]]; },
    prompt(P) { const b = nearBulb(P); return b && J.dead.includes(b) ? 'CHANGE THE BULB' : null; },
    talk(P) { const b = nearBulb(P); if (!b) return false; if (!J.dead.includes(b)) { miss('THAT BULB IS FINE! FIND A DARK ONE.', 1.6); return true; }
      J.dead.splice(J.dead.indexOf(b), 1); b.m.visible = false; addGold(5); coin(); tone(1200, 0.04, 0.3, 'triangle', 0.1);
      const L0 = own(new THREE.Group()); const [lx, lz] = W(b.u, b.s * 1.3); L0.position.set(lx, FY[b.f], lz); L0.rotation.y = RY0; for (const x of [-0.22, 0.22]) { const r = box(L0, 0.04, 1.9, 0.04, '#c0c4cc', x, 0.95, 0); r.rotation.x = 0.12; } for (let i = 1; i < 5; i++) box(L0, 0.44, 0.03, 0.12, '#c0c4cc', 0, i * 0.38, -0.04 + i * 0.012); J.lads.push({ m: L0, t: 1.4 });
      toast(J.dead.length ? 'LIGHT ON! ' + J.dead.length + ' TO GO' : 'ALL THE HALLS ARE BRIGHT!', 1.6); if (!J.dead.length) { ding(); finishGame(); } return true; },
    tick(dt) { if (J.fl && J.dead.includes(J.fl)) J.fl.m.material = Math.sin(J.t * 23) + Math.sin(J.t * 7.3) > 1.2 ? litM : deadM; J.lads = J.lads.filter(l => { l.t -= dt; if (l.t <= 0) { l.m.visible = false; return false; } return true; }); },
    card() { const f = fl(J.P), n1 = J.dead.filter(b => b.f === 1).length, n2 = J.dead.filter(b => b.f === 2).length; return [f && J.dead.some(b => b.f === f) ? 'E UNDER A DARK LIGHT' : 'TAKE THE LIFT', lst([[YEL, 'FLOOR 1', n1 ? n1 + ' DARK' : '\u2713', !n1], [YEL, 'FLOOR 2', n2 ? n2 + ' DARK' : '\u2713', !n2]]), n1 + '' + n2 + f]; },
    end() { BUL.forEach(b => { b.m.visible = false; }); } };
  // ================= JOB: SHOW A NEW TENANT ROUND (walk, the tenant follows you) =================
  const NEWT = ['MS PIP', 'MR OAK', 'LULU', 'SIR BRAMBLE'];
  const GTo = { walk: true, zone: 'any',
    begin() { const d = shuffle(DOORS.filter(q => q.no !== 204))[0]; J.who = NEWT[Math.random() * NEWT.length | 0]; J.flat = d;
      const [mx, mz] = W(-2, -hv + 2.4), [bx, bz] = W(hu + 4.0, 15.2), [lx, lz] = W(-10.4, 0);
      J.stops = [{ n: 'MAILBOXES', x: mx, z: mz, y: 0, line: 'Mailboxes by the door. Post comes every morning. Lovely!' }, { n: 'THE BINS', x: bx, z: bz, y: GY, line: 'Three bins outside. Very tidy. I like it here already.' },
        { n: 'THE LIFT', x: lx, z: lz, y: 0, line: 'A lift! No stairs with my boxes. Up we go.' }, { n: 'FLAT ' + d.no, x: d.x, z: d.z, y: d.y, flat: true }]; J.si = 0;
      const [x, z] = W(KU2, -6.2); TF.position.set(x, 0, z); TF.visible = true; say(J.who, 'Hello! I\'m ' + J.who.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) + '. Show me round, please?'); },
    goal() { const s = J.stops[J.si]; if (!s) return null; const f = fl(J.P), sf = s.y > 5 ? (s.y > FY[2] - 1.2 ? 2 : 1) : 0; if (inBld(J.P) && f !== sf) return LIFT(f); return [s.x, s.z, s.y]; },
    near(P) { const s = J.stops[J.si]; return s && Math.hypot(P.x - s.x, P.z - s.z) < (s.flat ? 1.4 : 1.8) && Math.abs(P_Y(P) - s.y) < 1.5 ? s : null; },
    prompt(P) { const s = this.near(P); return s ? 'SHOW \u00b7 ' + s.n : null; },
    talk(P) { const s = this.near(P); if (!s || J.sub) return false; pop(); addGold(3);
      if (!s.flat) { J.si++; say(J.who, s.line); return true; }
      J.sub = 'quiz'; const glass = shuffle([['GREEN', true], ['BLUE', false], ['BROWN', false]]), no = J.flat.no, alt = shuffle(DOORS.filter(q => q.no !== no && q.no !== 204)).slice(0, 2).map(q => q.no), nums = shuffle([[no, true], [alt[0], false], [alt[1], false]]);
      const ask2 = () => say(J.who, 'And my flat number again?', nums.map(([n, ok]) => ({ text: String(n), pick: () => { if (!ok) { J.miss++; nope(); } else coin(); say(J.who, ok ? 'Yes! Flat ' + no + '. I\'ll take it!' : 'Hmm, no, it\'s ' + no + '. Still, I\'ll take it!'); J.si++; J.sub = 'done'; NEXT('done', finishGame, 2.6); } })));
      say(J.who, 'What a flat! Quick question: which bin is for glass?', glass.map(([t, ok]) => ({ text: t, pick: () => { if (!ok) { J.miss++; nope(); toast('GLASS GOES IN THE GREEN BIN', 1.6); } else coin(); setTimeout(ask2, 60); } }))); return true; },
    tick(dt) { if (J.sub === 'done' || J.sub === 'quiz') { kit.animFox && kit.animFox(TF, dt, 0); const dx = J.P.x - TF.position.x, dz = J.P.z - TF.position.z; TF.rotation.y = Math.atan2(dx, dz); return; } follow(J.P, dt); },
    card() { return [J.stops[J.si] ? 'SHOW ' + J.who + ' \u00b7 ' + J.stops[J.si].n : 'DONE', lst(J.stops.map((s, i) => [BROWN, s.n, i < J.si ? '\u2713' : i === J.si ? 'NEXT' : '', i < J.si])), J.si + (J.sub || '')]; },
    end() { TF.visible = false; } };
  // ================= JOB: NOISE COMPLAINT (walk: follow the beat, knock, ask nicely) =================
  const glowM = new THREE.MeshBasicMaterial({ color: '#f472b6', transparent: true, opacity: 0.5, depthWrite: false }), GLOW = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), glowM); GLOW.rotation.x = -Math.PI / 2; GLOW.visible = false; G.add(GLOW);
  const nearDoor = P => { const f = fl(P); if (!f) return null; let best = null, bd = 1.35; for (const d of DOORS) { if (d.f !== f) continue; const dd = Math.hypot(P.x - d.x, P.z - d.z); if (dd < bd) { bd = dd; best = d; } } return best; };
  const LOUD = ['THE VOLES', 'DJ MOSS', 'THE OTTERS', 'BIG RUFUS'];
  const GN2 = { walk: true, zone: 'bld',
    begin() { J.door = shuffle(DOORS.filter(q => q.no !== 204))[0]; J.who = LOUD[Math.random() * LOUD.length | 0]; J.bt = 0; J.beat = 0; J.vol = 0; J.knocked = []; GLOW.position.set(J.door.x, J.door.y + 0.06, J.door.z); toast('SOMEONE IS BLASTING MUSIC \u00b7 FOLLOW THE BEAT', 2.8); },
    volAt(P) { if (!inBld(P)) return 0.05; const f = fl(P); if (f !== J.door.f) return f === 0 ? 0.08 : 0.12; return clamp(1.3 / (1 + Math.hypot(P.x - J.door.x, P.z - J.door.z) / 3), 0.1, 1); },
    prompt(P) { if (J.sub) return null; const d = nearDoor(P); return d ? 'KNOCK \u00b7 ' + d.no : null; },
    talk(P) { if (J.sub) return J.sub === 'talk'; const d = nearDoor(P); if (!d) return false; knock();
      if (d !== J.door) { if (!J.knocked.includes(d.no)) { J.knocked.push(d.no); miss('"NOT US! TRY SOMEWHERE LOUDER."', 1.6); } else toast(d.no + ' \u00b7 NOT THEM', 1.2); return true; }
      J.sub = 'talk'; const [ox, oz] = [d.x, d.z]; TF.position.set(ox, d.y, oz); TF.rotation.y = Math.atan2(P.x - ox, P.z - oz); TF.visible = true;
      const end = rude => { J.sub = 'done'; J.vol = 0; GLOW.visible = false; if (rude) { J.miss++; nope(); } else coin(); addGold(10); say(J.who, rude ? 'Alright, alright! No need to shout.' : 'Oops! Sorry, neighbour. Turning it down now.'); NEXT('done', finishGame, 2.4); };
      say(J.who, 'WHAT? Oh. Is the music too loud?', [{ text: 'COULD YOU TURN IT DOWN, PLEASE?', pick: () => end(false) }, { text: 'TURN IT DOWN OR ELSE!', pick: () => end(true) }]); return true; },
    tick(dt) { const P = J.P; if (J.sub === 'done') return; if (J.sub === 'talk') { kit.animFox && kit.animFox(TF, dt, 0); }
      const v = this.volAt(P); J.vol += (v - J.vol) * Math.min(1, dt * 4); const f = fl(P), close = inBld(P) && f === J.door.f && Math.hypot(P.x - J.door.x, P.z - J.door.z) < 8; GLOW.visible = close; if (close) glowM.color.setHSL((J.t * 0.4) % 1, 0.8, 0.6);
      if ((J.bt -= dt) <= 0) { J.bt = 0.43; const k = J.sub === 'talk' ? J.vol * 0.3 : J.vol; tone(70, 0.22 * k, 0.16, 'sine'); if (J.beat % 2) noise(0.05, 0.035 * k, 6000); tone(110 * [1, 1, 1.5, 1.33][(J.beat >> 1) % 4], 0.05 * k, 0.22, 'sawtooth'); J.beat++; } },
    card() { const P = J.P, f = fl(P), dir = !inBld(P) ? 'GO INSIDE' : f < J.door.f ? 'IT\'S COMING FROM UPSTAIRS' : f > J.door.f ? 'IT\'S COMING FROM DOWNSTAIRS' : 'FOLLOW THE BEAT \u00b7 E TO KNOCK'; return [dir, lab('NOISE') + meter(J.vol, RED) + (J.knocked.length ? lst(J.knocked.map(n => [INK, String(n), 'NOT THEM', false])) : ''), Math.round(J.vol * 10) + dir.length + '_' + J.knocked.length]; },
    end() { TF.visible = false; GLOW.visible = false; } };
  // ================= JOB: FIND THE LOST CAT (walk: follow the meows, carry Biscuit back) =================
  const CAT = new THREE.Group(); const catF = new THREE.Group(); CAT.add(catF); { const o = '#d9822b', w = '#f3e6d6'; const b = sph(catF, 0.13, o, 0, 0.16, 0); b.scale.set(0.85, 0.8, 1.45); sph(catF, 0.08, w, 0, 0.13, 0.12); const h = sph(catF, 0.1, o, 0, 0.3, 0.2); h.scale.set(1, 0.9, 0.95);
    for (const s of [-1, 1]) { const e = cyl(catF, 0, 0.04, 0.08, o, s * 0.055, 0.4, 0.2, 4); e.rotation.z = -s * 0.25; sph(catF, 0.016, '#201e1d', s * 0.04, 0.32, 0.29); } sph(catF, 0.014, '#c0263a', 0, 0.29, 0.3);
    for (const [x, z] of [[-0.06, 0.12], [0.06, 0.12], [-0.06, -0.12], [0.06, -0.12]]) cyl(catF, 0.025, 0.025, 0.1, o, x, 0.05, z, 6); }
  const TAIL = new THREE.Group(); TAIL.position.set(0, 0.2, -0.17); catF.add(TAIL); { const t = cyl(TAIL, 0.02, 0.026, 0.3, '#d9822b', 0, 0.12, -0.06, 6); t.rotation.x = -0.5; } CAT.visible = false; G.add(CAT);
  const HIDE = [[-11.8, -6.3, 0, 'BY THE LIFT'], [hu + 3.4, 15.0, -1, 'BY THE BINS'], [hu + 3.3, -10.4, -1, 'IN THE LAWN'], [3.0, 1.3, 1, 'FLOOR 1 HALL'], [-12.5, 11.4, 1, 'FLAT 103'], [-15.0, -1.2, 2, 'FLOOR 2 HALL'], [-1.5, -11.6, 2, 'FLAT 202'], [hu - 3, 9.5, 0, 'LOBBY CORNER']];
  const KU2 = hu - 6;
  const GC = { walk: true, zone: 'any',
    begin() { const h = HIDE[Math.random() * HIDE.length | 0], [x, z] = W(h[0], h[1]); J.cf = h[2] < 0 ? 0 : h[2]; J.out = h[2] < 0; J.cat = { x, z, y: h[2] > 0 ? FY[h[2]] : h[2] < 0 ? GY : 0 }; CAT.position.set(x, J.cat.y, z); CAT.rotation.y = rnd(0, 6.28); CAT.scale.setScalar(1); CAT.visible = true; J.mt = 1; J.t0 = 0; J.sub = 'look';
      const [ox, oz] = W(KU2 - 0.2, -6.4); TF.position.set(ox, 0, oz); TF.rotation.y = RY0; TF.visible = true; say('MRS PLUM', 'My cat Biscuit is missing! Orange, very shy. Listen for meows, please!'); },
    dCat(P) { const ib = inBld(P), same = J.out ? !ib : ib && fl(P) === J.cf; return same ? Math.hypot(P.x - CAT.position.x, P.z - CAT.position.z) : 99; },
    goal() { if (J.sub !== 'carry') return null; const P = J.P; if (inBld(P) && fl(P) > 0) return LIFT(fl(P)); return [TF.position.x, TF.position.z, 0]; },
    prompt(P) { if (J.sub === 'look' && this.dCat(P) < 1.5) return 'PICK UP BISCUIT'; if (J.sub === 'carry' && Math.hypot(P.x - TF.position.x, P.z - TF.position.z) < 2 && fl(P) === 0 && inBld(P)) return 'GIVE BISCUIT BACK'; return null; },
    talk(P) { if (J.sub === 'look' && this.dCat(P) < 1.5) { J.sub = 'carry'; meow(0.06); addGold(6); toast('GOT HIM! TAKE BISCUIT TO MRS PLUM', 2); return true; }
      if (J.sub === 'carry' && Math.hypot(P.x - TF.position.x, P.z - TF.position.z) < 2 && fl(P) === 0 && inBld(P)) { J.sub = 'done'; const s = J.t0; J.miss += s < 75 ? 0 : s < 130 ? 1 : 3; addGold(s < 75 ? 12 : 6); coin(); meow(0.05); say('MRS PLUM', 'Biscuit! Oh, thank you, thank you! Here, a little something.'); NEXT('done', finishGame, 2.4); return true; } return false; },
    tick(dt) { const P = J.P; J.t0 += dt; TAIL.rotation.y = Math.sin(J.t * (J.sub === 'carry' ? 6 : 2.5)) * 0.5; kit.animFox && kit.animFox(TF, dt, 0);
      if (J.sub === 'look') { const d = this.dCat(P); CAT.visible = d < 60 || !inBld(P); if ((J.mt -= dt) <= 0) { J.mt = 2.6 + Math.random(); const k = d > 90 ? 0.006 : clamp(0.06 / (1 + d / 4), 0.004, 0.06); meow(k); } catFace(P, dt, 0.4); }
      else if (J.sub === 'carry' || J.sub === 'done') { const y = P_Y(P); if (J.sub === 'carry') { const bx = P.x - Math.sin(P.yaw || 0) * 0.9, bz = P.z - Math.cos(P.yaw || 0) * 0.9, dx = bx - CAT.position.x, dz = bz - CAT.position.z, d = Math.hypot(dx, dz);
          if (d > 6 || Math.abs(CAT.position.y - y) > 2) CAT.position.set(bx, y, bz); else if (d > 0.1) { CAT.position.x += dx * Math.min(1, dt * 5); CAT.position.z += dz * Math.min(1, dt * 5); CAT.rotation.y = Math.atan2(dx, dz); } CAT.position.y = y + Math.abs(Math.sin(J.t * 9)) * 0.06 * Math.min(1, d); } } },
    card() { const P = J.P, d = this.dCat(P), heat = d > 90 ? 0 : clamp(1 - d / 22, 0.04, 1); if (J.sub === 'look') return [d > 90 ? 'NOT ON THIS FLOOR? LISTEN' : heat > 0.75 ? 'VERY CLOSE!' : heat > 0.4 ? 'WARMER\u2026' : 'LISTEN FOR THE MEOW', lab('MEOWS') + meter(heat, '#d9822b') + lst([[INK, 'TIME', Math.floor(J.t0) + ' S', J.t0 < 75]]), 'l' + Math.round(heat * 8) + Math.floor(J.t0 / 5)];
      return ['TAKE BISCUIT TO MRS PLUM', lst([['#d9822b', 'BISCUIT', 'WITH YOU', true], [INK, 'TIME', Math.floor(J.t0) + ' S', J.t0 < 75]]), 'c' + Math.floor(J.t0 / 5)]; },
    end() { CAT.visible = false; TF.visible = false; } };
  const catFace = (P, dt, k) => { const dx = P.x - CAT.position.x, dz = P.z - CAT.position.z; const a = Math.atan2(dx, dz); let d = wrapA(a - CAT.rotation.y); CAT.rotation.y += d * Math.min(1, dt * k); };
  // ---------- build the merged rings + floor visibility ----------
  for (const f of [0, 1, 2]) if (SF[f].n()) (f ? FG[f] : G).add(new THREE.Mesh(SF[f].geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  const GD = { tap: GT, paint: GP, plants: GW, bulbs: GBu, tour: GTo, noise: GN2, cat: GC }; if (GWin) GD.windows = GWin; if (GLift) GD.lift = GLift;
  const tips = lake ? ['Valve off first, or the tap sprays you.', 'Pour till the green, then let go. No floods.', 'The pigeon is a regular. Wipe round it.', 'Wires go colour to colour. Then the breaker.', 'Noisy flat? Ask nicely. Works every time.']
    : ['Water off first, dear. Then the tap.', 'Let go of the can in the green. Not a drop more.', 'Paint the scuffs, never the skirting board.', 'Biscuit hides when he is scared. Follow the meows.', 'Be polite to the noisy ones. Kindness works.'];
  return { GD, RINGS, RY, FL, tips, tick(dt, P) { const inb = inBld(P), f = inb ? fl(P) : 0; FG[1].visible = inb && f === 1; FG[2].visible = inb && f === 2; }, TF, CAT, BALS };
}
