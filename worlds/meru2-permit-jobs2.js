// MERU 2.0 — s126 PERMIT OFFICE PART A2: the three FIELD JOBS (outdoors, Spade's FIELD JOBS menu) + the DESERT DIG TEAM camp.
// SURVEY A PLOT (tap): a 5 × 5 peg grid west of the office path (A-E west → east, 1-5 south → north); drive the stakes in the plan's order, the string follows.
// READ THE THEODOLITE (tap): tripod east of the path; you look through the scope, the view sweeps; tap when the cross is on the striped staff south of the road.
// DELIVER A PERMIT (walk): carry it to the named digger at the dig team camp in the desert (red arrow + beacon); the wrong fox = a miss.
// Built in the office's ORIGINAL frame. The camp hangs off ROOT (not G) so the office can hide while you are out in the desert.
export function pmJobsA2(X) {
  const { THREE, G, ROOT, V, LM, CT, box, cyl, colC, plane, flat, label, J, own, miss, addGold, NEXT, toast, finishGame, tone, noise, chimes, thump, ding, TAPR, scrW, nearest, fly, FLY, kit, sayTo, save, touch, toW, ground, small, big, gauge, pick, clamp, active, C } = X;
  const { INK, RED, YEL, WHITE, PAPER, WOOD, WOODD, WOODL } = C;
  const gh = (x, z) => { try { const w = toW(V(x, 0, z)); const h = ground ? ground(w.x, w.z) : w.y; return isFinite(h) ? clamp(h - w.y, -3, 8) : 0; } catch (e) { return 0; } };
  const LZ = []; const lazy = (o, x, z, dy = 0) => { LZ.push([o, x, z, dy]); return o; }; let placed = false;
  const placeAll = () => { for (const [o, x, z, dy] of LZ) o.position.y = gh(x, z) + dy; placed = true; };
  const ln = text => ({ who: 'npc', text });
  const ring = (x, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g); const r1 = cyl(g, 0.5, 0.5, 0.012, YEL, 0, 0.06, 0, 22), r2 = cyl(g, 0.42, 0.42, 0.014, INK, 0, 0.062, 0, 22); r1.renderOrder = r2.renderOrder = 2; lazy(g, x, z); return g; };
  // ================= SURVEY PLOT (west of the door path) =================
  const PL = { x: -261.5, z: -17.5 };
  const PLOT = new THREE.Group(); PLOT.position.set(PL.x, 0, PL.z); G.add(PLOT); lazy(PLOT, PL.x, PL.z);
  const plotT = CT(512, 512, (g, W, H) => { g.fillStyle = '#d9bf8c'; g.fillRect(0, 0, W, H); for (let k = 0; k < 900; k++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(150,110,60,0.18)' : 'rgba(255,240,200,0.22)'; g.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
    g.strokeStyle = 'rgba(90,60,30,0.5)'; g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20); g.textBaseline = 'middle'; g.textAlign = 'center'; g.font = '900 34px Archivo, sans-serif';
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.fillStyle = '#5a3f22'; g.beginPath(); g.arc(64 + i * 96, 448 - j * 96, 10, 0, 7); g.fill(); }
    for (let i = 0; i < 5; i++) { g.fillStyle = INK; g.fillText('ABCDE'[i], 64 + i * 96, 494); g.fillText(String(i + 1), 26, 448 - i * 96); } });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(5.333, 5.333), new THREE.MeshBasicMaterial({ map: plotT, transparent: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.renderOrder = 3; PLOT.add(m);
    for (const [x, z] of [[-2.7, -2.7], [2.7, -2.7], [-2.7, 2.7], [2.7, 2.7]]) cyl(PLOT, 0.05, 0.05, 0.7, WOODD, x, 0.35, z, 6);
    const pile = new THREE.Group(); pile.position.set(3.3, 0, 1.6); PLOT.add(pile); for (let k = 0; k < 5; k++) { const s = cyl(pile, 0.03, 0.03, 0.55, WOODL, -0.15 + k * 0.07, 0.05, 0, 6); s.rotation.z = Math.PI / 2; s.rotation.y = 0.2 * k; }
    const mal = cyl(pile, 0.015, 0.015, 0.45, WOODD, 0.1, 0.05, 0.35, 6); mal.rotation.x = Math.PI / 2; box(pile, 0.16, 0.1, 0.1, '#5c6670', 0.1, 0.06, 0.58);
    const post = new THREE.Group(); post.position.set(2.9, 0, 2.9); PLOT.add(post); cyl(post, 0.04, 0.04, 1.3, WOODD, 0, 0.65, 0, 6); plane(label('SURVEY PLOT \u00b7 SPADE', WOODD, '#f0d5a6', 512, 96, 46), 0.9, 0.17, 0, 1.2, 0.05, 0, post, false); }
  const HOLES = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) HOLES.push({ i, j, code: 'ABCDE'[i] + (j + 1) });
  const holeP = h => V(PL.x - 2 + h.i, PLOT.position.y + 0.04, PL.z + 2 - h.j);
  const SHAPES = [[[0, 0], [3, 0], [3, 2], [0, 2]], [[0, 0], [2, 0], [2, 2], [4, 2], [4, 4], [0, 4]], [[1, 0], [3, 0], [4, 2], [2, 4], [0, 2]]];
  const mkShape = n => { let s = SHAPES[n % SHAPES.length].map(p => p.slice()); if (Math.random() < 0.5) s = s.map(([i, j]) => [4 - i, j]).reverse();
    const mi = Math.max(...s.map(p => p[0])), mj = Math.max(...s.map(p => p[1])), dx = Math.random() * (5 - mi) | 0, dj = Math.random() * (5 - mj) | 0; s = s.map(([i, j]) => [i + dx, j + dj]);
    const st = Math.random() * s.length | 0; return s.slice(st).concat(s.slice(0, st)); };
  const findHole = ([i, j]) => HOLES.find(h => h.i === i && h.j === j);
  const mkStake = () => { const g = new THREE.Group(); cyl(g, 0.035, 0.02, 0.55, WOODL, 0, 0, 0, 6); cyl(g, 0.045, 0.045, 0.08, RED, 0, 0.27, 0, 8); return g; };
  const strM = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const string = (a, b) => { const L = Math.hypot(b.x - a.x, b.z - a.z), m = new THREE.Mesh(new THREE.BoxGeometry(1, 0.018, 0.018), strM); m.scale.x = L; m.position.set((a.x + b.x) / 2, a.y + 0.3, (a.z + b.z) / 2); m.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); return m; };
  const planImg = (pts, k) => { const c = document.createElement('canvas'); c.width = c.height = 200; const g = c.getContext('2d'), XX = i => 30 + i * 38, YY = j => 170 - j * 38;
    g.fillStyle = PAPER; g.fillRect(0, 0, 200, 200); g.fillStyle = '#8a7a5a'; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(XX(i), YY(j), 2.5, 0, 7); g.fill(); }
    g.font = '900 13px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; for (let i = 0; i < 5; i++) { g.fillText('ABCDE'[i], XX(i), 192); g.fillText(String(i + 1), 9, YY(i)); }
    g.strokeStyle = INK; g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); pts.forEach(([i, j], m) => (m ? g.lineTo(XX(i), YY(j)) : g.moveTo(XX(i), YY(j)))); g.closePath(); g.stroke(); g.setLineDash([]);
    g.strokeStyle = RED; g.lineWidth = 4; g.beginPath(); for (let m = 1; m < Math.min(k, pts.length) + (k >= pts.length ? 1 : 0); m++) { const a = pts[m - 1], b = pts[m % pts.length]; g.moveTo(XX(a[0]), YY(a[1])); g.lineTo(XX(b[0]), YY(b[1])); } g.stroke();
    g.font = '900 12px Archivo, sans-serif'; pts.forEach(([i, j], m) => { const cur = m === k, r = cur ? 12 : 9; g.fillStyle = m < k ? INK : cur ? RED : '#ffffff'; g.beginPath(); g.arc(XX(i), YY(j), r, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); g.fillStyle = m < k || cur ? '#ffffff' : INK; g.fillText(String(m + 1), XX(i), YY(j) + 1); });
    return c.toDataURL(); };
  const clearPlot = () => { (J.pl || []).forEach(o => o.parent && o.parent.remove(o)); J.pl = []; };
  const G6 = {
    begin() { placeAll(); Object.assign(J, { N: 3, n: 0, pl: [] }); toast('DRIVE THE STAKES IN ORDER \u00b7 THE STRING FOLLOWS', 2.8); this.next(); },
    next() { clearPlot(); if (J.n >= J.N) { finishGame(); return; } J.shape = mkShape(J.n); J.k = 0; J.t0 = J.t; J.over = false; J.lim = 30; J.img = null; },
    code() { const p = J.shape[J.k]; return p ? 'ABCDE'[p[0]] + (p[1] + 1) : ''; },
    press() { if (J.over || FLY.length) return; const i = nearest(HOLES, holeP, TAPR() * 1.1); if (i < 0) return; const h = HOLES[i], tgt = findHole(J.shape[J.k]);
      if (h !== tgt) { miss('NOT THERE \u00b7 STAKE ' + (J.k + 1) + ' GOES IN ' + tgt.code, 1.6); return; }
      const p = holeP(h), s = own(mkStake()); J.pl.push(s); s.position.set(p.x, p.y + 1.4, p.z); const k = J.k, last = k === J.shape.length - 1; J.k++; J.img = null;
      fly(s, V(p.x, p.y + 0.2, p.z), 4.5, () => { if (!J.pl) return; thump(); noise(0.1, 0.03, 1200);
        if (k > 0) { const a = holeP(findHole(J.shape[k - 1])), m = own(string(a, p)); J.pl.push(m); }
        if (last) { const a = holeP(findHole(J.shape[0])), m = own(string(p, a)); J.pl.push(m); chimes(); } }, 0);
      if (last) { J.over = true; addGold(J.t - J.t0 < 15 ? 6 : 4); toast('PLOT ' + (J.n + 1) + ' PEGGED OUT', 1.4); J.n++; NEXT(() => G6.next(), 1.6); } else addGold(1); },
    tick() { if (!J.over && J.t - J.t0 > J.lim) { J.over = true; miss('TIME \u00b7 SPADE PEGS IT OUT', 2); J.n++; NEXT(() => G6.next(), 1.2); } },
    hint() { if (J.over || !J.shape) return null; const h = findHole(J.shape[J.k]); return h ? [holeP(h), h.code] : null; },
    card() { if (!J.shape) return null; if (!J.img) J.img = planImg(J.shape, J.over ? J.shape.length : J.k);
      return ['PLOT ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, '<img src="' + J.img + '" style="display:block;width:min(150px,30vh);height:auto;border:2px solid #201e1d;margin-bottom:6px">' + (J.over ? big('PEGGED OUT') : big('STAKE ' + (J.k + 1) + ' \u00b7 ' + this.code())) + gauge(1 - Math.max(0, J.t - J.t0) / J.lim), J.n + '_' + J.k + '_' + (J.over ? 1 : 0)]; },
    shot() { return [V(PL.x, PLOT.position.y, PL.z - 0.3), 5.8, 5.8, 1.12, 3, 0, 10]; },
    end() { clearPlot(); } };
  // ================= THE THEODOLITE (east of the door path, looking south over the road) =================
  const TH = { x: -251.2, z: -13.5 };
  const TRI = new THREE.Group(); TRI.position.set(TH.x, 0, TH.z); G.add(TRI); lazy(TRI, TH.x, TH.z); colC(TH.x, TH.z, 0.5);
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.5, l = cyl(TRI, 0.02, 0.025, 1.45, WOODL, Math.sin(a) * 0.28, 0.68, Math.cos(a) * 0.28, 6); l.rotation.set(Math.cos(a) * 0.38, 0, -Math.sin(a) * 0.38); }
  box(TRI, 0.22, 0.06, 0.22, '#5c6670', 0, 1.38, 0); box(TRI, 0.16, 0.2, 0.16, YEL, 0, 1.5, 0); { const sc = cyl(TRI, 0.045, 0.06, 0.34, '#2b2b2b', 0, 1.56, 0.02, 10); sc.rotation.x = Math.PI / 2; }
  const STS = [[-258, 4], [-246, 6], [-252, 8], [-241, 3], [-262, 7], [-249, 2]];
  const STAFF = new THREE.Group(); ROOT.add(STAFF); STAFF.visible = false;
  for (let k = 0; k < 6; k++) cyl(STAFF, 0.09, 0.09, 0.5, k % 2 ? WHITE : RED, 0, 0.25 + k * 0.5, 0, 8); box(STAFF, 0.5, 0.18, 0.4, '#a88b5e', 0, 0.09, 0); plane(label('', RED, RED, 32, 32), 0.4, 0.26, 0.2, 2.9, 0, 0, STAFF, false);
  const eyeOf = () => V(TH.x, TRI.position.y + 1.5, TH.z + 0.3);
  const aimOf = () => { const e = eyeOf(), s = STAFF.position, b = Math.atan2(s.x - e.x, s.z - e.z), a = J.lock ? b : b + J.span * Math.sin(J.w * (J.t - J.t0) + J.ph); return { e, b, a, D: Math.hypot(s.x - e.x, s.z - e.z) }; };
  const SCOPE = document.createElement('div'); SCOPE.style.cssText = 'position:fixed;inset:0;z-index:28;pointer-events:none;display:none;background:radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0, rgba(0,0,0,0) min(40vw,40vh), rgba(20,18,17,0.9) calc(min(40vw,40vh) + 3px))';
  SCOPE.innerHTML = '<svg viewBox="-50 -50 100 100" style="position:absolute;left:50%;top:50%;width:min(80vw,80vh);height:min(80vw,80vh);transform:translate(-50%,-50%)" fill="none" stroke="#201e1d" stroke-width="0.6"><circle r="49.6" stroke-width="1.2"/><line x1="-50" y1="0" x2="-4" y2="0"/><line x1="4" y1="0" x2="50" y2="0"/><line x1="0" y1="-50" x2="0" y2="-4"/><line x1="0" y1="4" x2="0" y2="50"/><line x1="-1.6" y1="0" x2="1.6" y2="0" stroke="#ec3013" stroke-width="0.8"/><line x1="0" y1="-1.6" x2="0" y2="1.6" stroke="#ec3013" stroke-width="0.8"/></svg>';
  document.body.appendChild(SCOPE);
  const TOL = 1.8 * Math.PI / 180, GOOD = 0.7 * Math.PI / 180;
  const putStaff = i => { const [x, z] = STS[i]; return V(x, gh(x, z), z); };
  const G7 = {
    begin() { placeAll(); Object.assign(J, { N: 5, n: 0, reads: [], cool: 0, last: -1 }); SCOPE.style.display = 'block'; STAFF.visible = true; toast('TAP WHEN THE CROSS IS ON THE STAFF', 2.6); this.next(true); },
    next(first) { if (J.n >= J.N) { SCOPE.style.display = 'none'; finishGame(); return; } let i; do i = Math.random() * STS.length | 0; while (i === J.last); J.last = i; const p = putStaff(i);
      if (first) STAFF.position.copy(p); else fly(STAFF, p, 2.2, null, 0.3); J.t0 = J.t; J.over = false; J.lock = false; J.span = (10 + J.n * 1.2) * Math.PI / 180; J.w = 0.55 + J.n * 0.1; J.ph = Math.random() * 6.28; J.lim = 12; },
    press() { if (J.over || FLY.length || J.cool > 0) return; const { a, b, D } = aimOf(), err = Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
      if (err > TOL) { J.cool = 0.4; miss('OFF THE STAFF \u00b7 WAIT FOR THE CROSS', 1.2); return; }
      J.over = true; J.lock = true; const deg = ((180 - b * 180 / Math.PI) % 360 + 360) % 360, r = D.toFixed(1) + ' M \u00b7 ' + deg.toFixed(0) + '\u00b0'; J.reads.push(r); tone(1320, 0.05, 0.3, 'triangle'); tone(1760, 0.03, 0.3, 'triangle', 0.08);
      addGold(err < GOOD ? 3 : 2); toast((err < GOOD ? 'DEAD ON \u00b7 ' : 'READING \u00b7 ') + r, 1.3); J.n++; NEXT(() => G7.next(), 1.1); },
    tick(dt) { J.cool = Math.max(0, (J.cool || 0) - dt); if (!J.over && J.t - J.t0 > J.lim) { J.over = true; miss('TOO SLOW \u00b7 THE STAFF WALKS ON', 1.6); J.n++; NEXT(() => G7.next(), 1.0); } },
    hint() { return null; },
    card() { return ['READING ' + Math.min(J.N, J.n + 1) + ' OF ' + J.N, small('TAP ANYWHERE WHEN THE RED CROSS IS ON THE STAFF') + (J.reads.length ? small(J.reads.slice(-3).join('<br>')) : '') + gauge(1 - Math.max(0, J.t - J.t0) / (J.lim || 12)), J.n + '_' + (J.over ? 1 : 0)]; },
    shot() { const { e, a, D } = aimOf(); return { pos: e, look: V(e.x + Math.sin(a) * D, STAFF.position.y + 1.5, e.z + Math.cos(a) * D), fov: 30 }; },
    end() { SCOPE.style.display = 'none'; STAFF.visible = false; } };
  // ================= THE DIG TEAM CAMP (desert, east edge) =================
  const CP = { x: -372, z: 26 };
  const CAMP = new THREE.Group(); CAMP.position.set(CP.x, 0, CP.z); ROOT.add(CAMP); lazy(CAMP, CP.x, CP.z);
  { const tent = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.9, 4), LM('#c9a86a')); tent.rotation.y = Math.PI / 4; tent.position.set(-3, 0.95, -2); CAMP.add(tent); box(CAMP, 0.6, 1.1, 0.04, '#5a4430', -3, 0.55, -0.8); colC(CP.x - 3, CP.z - 2, 1.5);
    box(CAMP, 4, 0.05, 1.6, '#6e5235', 1.2, 0.02, 0.7); const heap = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.8, 9), LM('#b8955e')); heap.position.set(3.9, 0.4, -0.9); CAMP.add(heap); colC(CP.x + 3.9, CP.z - 0.9, 1.0);
    box(CAMP, 1.0, 0.06, 0.7, '#9a7a4e', -0.5, 0.8, 2.4); for (const [dx, dz] of [[-0.4, -0.3], [0.4, -0.3], [-0.4, 0.3], [0.4, 0.3]]) box(CAMP, 0.05, 0.8, 0.05, WOODD, -0.5 + dx, 0.4, 2.4 + dz); colC(CP.x - 0.5, CP.z + 2.4, 0.6);
    box(CAMP, 0.6, 0.5, 0.6, WOOD, -4.2, 0.25, 0.8); box(CAMP, 0.5, 0.4, 0.5, WOODD, -4.1, 0.7, 0.8); colC(CP.x - 4.2, CP.z + 0.8, 0.5);
    cyl(CAMP, 0.04, 0.04, 3.6, WOODD, -1.8, 1.8, -3.4, 6); plane(label('DIG TEAM', RED, '#ffffff', 256, 96, 52), 0.9, 0.36, -1.33, 3.3, -3.4, 0, CAMP, false);
    const sg = new THREE.Group(); sg.position.set(4.6, 0, 2.4); sg.rotation.y = Math.PI / 2; CAMP.add(sg); cyl(sg, 0.05, 0.05, 1.4, WOODD, -0.6, 0.7, 0, 6); cyl(sg, 0.05, 0.05, 1.4, WOODD, 0.6, 0.7, 0, 6); plane(label('DIG TEAM \u00b7 NO PERMIT, NO DIG', WOODD, '#f0d5a6', 1024, 128, 60), 1.5, 0.26, 0, 1.2, 0.06, 0, sg, false); }
  const TEAM = [{ key: 'mpoGrit', n: 'GRIT', job: 'THE FOREMAN \u00b7 BY THE TENT', at: [-1.6, -0.3], ry: Math.PI / 2, torso: ['#e48a2a', '#b5651d', '#7a4012'], idle: 'Grit. Foreman. No permit, no dig. Spade knows the rules.', done: 'Permit came through. Good running.', got: 'Stamped and signed. We dig at dawn. Thank Spade for me.' },
    { key: 'mpoDune', n: 'DUNE', job: 'AT THE SIEVE', at: [-0.5, 3.3], ry: Math.PI, torso: ['#8fb3c9', '#5f86a0', '#3a5568'], idle: 'Sieve, shake, squint. Repeat till sundown.', done: 'Found a bead today. Tiny. Still counts.', got: 'For me? Finally. Tell Spade thanks.' },
    { key: 'mpoMarl', n: 'MARL', job: 'IN THE TRENCH', at: [1.4, 0.7], ry: -Math.PI / 2, torso: ['#9a9a6a', '#6f6f45', '#45452a'], idle: 'Mind the trench. I just dug it.', done: 'Deeper every day. Like my back ache.', got: 'Right name, right fox. Cheers, runner.' }];
  TEAM.forEach(m => { m.x = CP.x + m.at[0]; m.z = CP.z + m.at[1]; const f = kit.makeFox({ key: m.key, torso: m.torso, outfit: 'vest', mood: 'warm' }); f.position.set(m.at[0], 0, m.at[1]); f.rotation.y = m.ry; CAMP.add(f); m.obj = f; colC(m.x, m.z, 0.4);
    const P0 = f.userData && f.userData.P; if (P0 && P0.head) { cyl(P0.head, 0.19, 0.21, 0.1, YEL, 0, 0.22, 0, 14); cyl(P0.head, 0.26, 0.26, 0.02, YEL, 0, 0.18, 0.04, 14); }
    m.kT = { key: m.key, name: m.n.charAt(0) + m.n.slice(1).toLowerCase(), role: 'DIG TEAM', obj: f, ry: m.ry, r: 6 }; });
  const nearMate = P => { let b = null, bd = 2.3; for (const m of TEAM) { const d = Math.hypot(P.x - m.x, P.z - m.z); if (d < bd) { bd = d; b = m; } } return b; };
  const BEAM = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 30, 10, 1, true), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); BEAM.visible = false; BEAM.renderOrder = 6; ROOT.add(BEAM);
  const G8 = {
    begin() { placeAll(); J.N = 1; J.n = 0; J.to = pick(TEAM); J.t0 = J.t; J.lim = 90; J.late = false; J.over = false; BEAM.visible = true; ding(); toast('TAKE THE PERMIT TO ' + J.to.n + ' \u00b7 THE DIG TEAM IN THE DESERT', 3.2); },
    prompt(P) { if (J.over) return null; const m = nearMate(P); return m ? 'GIVE THE PERMIT \u00b7 ' + m.n : null; },
    talk(P) { if (J.over) return false; const m = nearMate(P); if (!m) return false;
      if (m !== J.to) { miss('WRONG FOX \u00b7 IT SAYS ' + J.to.n, 1.8); sayTo(m.kT, [ln('Not mine. Read the name. ' + J.to.n.charAt(0) + J.to.n.slice(1).toLowerCase() + ' is ' + J.to.job.toLowerCase().replace('the foreman \u00b7 ', '') + '.')]); return true; }
      J.over = true; chimes(); addGold(J.late ? 4 : 10); save.setStat('mpoDeliv', save.stat('mpoDeliv', 0) + 1); BEAM.visible = false; sayTo(m.kT, [ln(m.got)]); J.n = 1; NEXT(() => finishGame(), 1.0); return true; },
    tick() { BEAM.position.set(J.to.x, CAMP.position.y + 15, J.to.z); BEAM.material.opacity = 0.25 + Math.sin(J.t * 3) * 0.1; if (!J.late && !J.over && J.t - J.t0 > J.lim) { J.late = true; miss('LATE \u00b7 KEEP GOING', 2); } },
    goal() { return J.over ? null : [J.to.x, J.to.z, CAMP.position.y, 1.8]; },
    card() { const P = J.P || { x: 0, z: 0 }, d = Math.round(Math.hypot(P.x - J.to.x, P.z - J.to.z)); return ['PERMIT FOR ' + J.to.n, small(J.to.job) + small('DISTANCE \u00b7 ' + d + ' M') + (J.late ? small('LATE \u00b7 STILL WORTH GOLD') : gauge(1 - Math.max(0, J.t - J.t0) / J.lim)), (d / 5 | 0) + '_' + (J.late ? 1 : 0) + '_' + (J.over ? 1 : 0) + '_' + Math.floor((J.t - J.t0) / 3)]; },
    end() { BEAM.visible = false; } };
  // ================= life, talk, area =================
  const campOn = P => Math.hypot(P.x - CP.x, P.z - CP.z) < (touch ? 70 : 110) || active() === 'deliver';
  function tick(dt, t, P) { if (!placed) placeAll(); CAMP.visible = campOn(P); if (!CAMP.visible) return;
    const [g, d, m] = TEAM; m.obj.rotation.x = Math.max(0, Math.sin(t * 2.6)) * 0.22; d.obj.position.x = d.at[0] + Math.sin(t * 9) * 0.03; d.obj.position.y = Math.abs(Math.sin(t * 4.5)) * 0.03;
    for (const q of TEAM) { const dd = Math.hypot(P.x - q.x, P.z - q.z), want = dd < 6 ? Math.atan2(P.x - q.x, P.z - q.z) : q.ry; q.obj.rotation.y += Math.atan2(Math.sin(want - q.obj.rotation.y), Math.cos(want - q.obj.rotation.y)) * Math.min(1, dt * 4); } }
  const prompt = P => { const m = nearMate(P); return m ? 'TALK \u00b7 ' + m.n : null; };
  const talk = P => { const m = nearMate(P); if (!m) return false; sayTo(m.kT, [ln(save.stat('mpoDeliv', 0) ? m.done : m.idle)]); return true; };
  return { GD: { survey: G6, theo: G7, deliver: G8 }, RINGS: { survey: [PL.x, PL.z + 3.4], theo: [TH.x, TH.z - 1.0] }, rings: [ring(PL.x, PL.z + 3.4), ring(TH.x, TH.z - 1.0)], CAMP, TEAM, tick, prompt, talk,
    inArea: P => Math.hypot(P.x + 255, P.z + 32) < 230,
    tips: ['Stakes go in the plan\u0027s order. The string does the rest.', 'Wait for the cross. Tap once. Do not chase the staff.', 'Read the name on the permit before you hand it over.'],
    dispose() { SCOPE.remove(); } };
}
